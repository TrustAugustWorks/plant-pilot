// IndexedDB implementation of Storage (ADR 0003). The only module that touches IndexedDB.
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { NAME_MAX_LENGTH, POT_MAX_CM, POT_MIN_CM } from '../domain/config';
import { FORMAT_NAME, FORMAT_VERSION } from '../domain/exportFormat';
import type { ExportFileV1, FloorPlan, FloorPlanMime, Plant, WateringEvent } from '../domain/types';
import { StorageError, type MetaKey, type Storage } from './Storage';

export const APP_VERSION = '0.1.0';

/** Image kept as ArrayBuffer: structured-clones everywhere (Blob support varies in test runtimes). */
interface StoredFloorPlan {
  id: 'main';
  bytes: ArrayBuffer;
  mimeType: FloorPlanMime;
  widthPx: number;
  heightPx: number;
  uploadedAt: string;
}

interface PilotDB extends DBSchema {
  floorPlan: { key: string; value: StoredFloorPlan };
  plants: { key: string; value: Plant };
  wateringEvents: { key: string; value: WateringEvent; indexes: { byPlant: string } };
  meta: { key: string; value: { key: string; value: string } };
}

const STORES = ['floorPlan', 'plants', 'wateringEvents', 'meta'] as const;

export function bytesToBase64(bytes: ArrayBuffer): string {
  const u8 = new Uint8Array(bytes);
  let bin = '';
  for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode(...u8.subarray(i, i + 0x8000));
  return btoa(bin);
}

export function base64ToBytes(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8.buffer;
}

export async function blobToBytes(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') return blob.arrayBuffer();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as ArrayBuffer);
    r.onerror = () => reject(r.error);
    r.readAsArrayBuffer(blob);
  });
}

function validatePlant(p: Plant) {
  const { x, y } = p.position;
  if (![x, y].every((v) => Number.isFinite(v) && v >= 0 && v <= 1)) throw new StorageError('Position must be between 0 and 1.');
  if (p.name.trim().length < 1 || p.name.length > NAME_MAX_LENGTH) throw new StorageError(`Name must be 1-${NAME_MAX_LENGTH} characters.`);
  if (!Number.isInteger(p.potDiameterCm) || p.potDiameterCm < POT_MIN_CM || p.potDiameterCm > POT_MAX_CM) {
    throw new StorageError(`Pot size must be ${POT_MIN_CM}-${POT_MAX_CM} cm.`);
  }
}

export class IndexedDbStorage implements Storage {
  private dbPromise: Promise<IDBPDatabase<PilotDB>>;

  constructor(name = 'plant-pilot') {
    this.dbPromise = openDB<PilotDB>(name, 1, {
      upgrade(db) {
        db.createObjectStore('floorPlan', { keyPath: 'id' });
        db.createObjectStore('plants', { keyPath: 'id' });
        db.createObjectStore('wateringEvents', { keyPath: 'id' }).createIndex('byPlant', 'plantId');
        db.createObjectStore('meta', { keyPath: 'key' });
      },
    });
  }

  private async run<T>(what: string, fn: (db: IDBPDatabase<PilotDB>) => Promise<T>): Promise<T> {
    try {
      return await fn(await this.dbPromise);
    } catch (e) {
      if (e instanceof StorageError) throw e;
      throw new StorageError(`Could not ${what}.`, e);
    }
  }

  getFloorPlan() {
    return this.run('read the floor plan', async (db) => {
      const s = await db.get('floorPlan', 'main');
      if (!s) return null;
      return { image: new Blob([s.bytes], { type: s.mimeType }), mimeType: s.mimeType, widthPx: s.widthPx, heightPx: s.heightPx, uploadedAt: s.uploadedAt };
    });
  }

  saveFloorPlan(plan: FloorPlan) {
    return this.run('save the floor plan', async (db) => {
      const bytes = await blobToBytes(plan.image);
      await db.put('floorPlan', { id: 'main', bytes, mimeType: plan.mimeType, widthPx: plan.widthPx, heightPx: plan.heightPx, uploadedAt: plan.uploadedAt });
    });
  }

  listPlants(opts?: { includeArchived?: boolean }) {
    return this.run('list plants', async (db) => {
      const all = await db.getAll('plants');
      return opts?.includeArchived ? all : all.filter((p) => p.archivedAt === null);
    });
  }

  getPlant(id: string) {
    return this.run('read the plant', async (db) => (await db.get('plants', id)) ?? null);
  }

  savePlant(plant: Plant) {
    return this.run('save the plant', async (db) => {
      validatePlant(plant);
      await db.put('plants', plant);
    });
  }

  archivePlant(id: string, at: string) {
    return this.run('remove the plant', async (db) => {
      const tx = db.transaction('plants', 'readwrite');
      const p = await tx.store.get(id);
      if (!p) throw new StorageError('Plant not found.');
      await tx.store.put({ ...p, archivedAt: at });
      await tx.done;
    });
  }

  listWateringEvents(plantId: string) {
    return this.run('list waterings', async (db) => {
      const events = await db.getAllFromIndex('wateringEvents', 'byPlant', plantId);
      return events.sort((a, b) => b.wateredAt.localeCompare(a.wateredAt));
    });
  }

  async getLastWatering(plantId: string) {
    return (await this.listWateringEvents(plantId))[0] ?? null;
  }

  addWateringEvent(event: WateringEvent) {
    return this.run('save the watering', async (db) => { await db.add('wateringEvents', event); });
  }

  deleteWateringEvent(id: string) {
    return this.run('undo the watering', async (db) => { await db.delete('wateringEvents', id); });
  }

  exportAll() {
    return this.run('export data', async (db): Promise<ExportFileV1> => {
      const tx = db.transaction(['floorPlan', 'plants', 'wateringEvents'], 'readonly');
      const [fp, plants, wateringEvents] = await Promise.all([
        tx.objectStore('floorPlan').get('main'), tx.objectStore('plants').getAll(), tx.objectStore('wateringEvents').getAll(),
      ]);
      await tx.done;
      return {
        format: FORMAT_NAME, formatVersion: FORMAT_VERSION, exportedAt: new Date().toISOString(), appVersion: APP_VERSION,
        floorPlan: fp ? { mimeType: fp.mimeType, widthPx: fp.widthPx, heightPx: fp.heightPx, uploadedAt: fp.uploadedAt, imageBase64: bytesToBase64(fp.bytes) } : null,
        plants, wateringEvents,
      };
    });
  }

  replaceAll(data: ExportFileV1) {
    return this.run('import the backup', async (db) => {
      // Decode before opening the transaction: a bad image must not touch existing data.
      const bytes = data.floorPlan ? base64ToBytes(data.floorPlan.imageBase64) : null;
      const tx = db.transaction([...STORES], 'readwrite');
      try {
        await Promise.all([tx.objectStore('floorPlan').clear(), tx.objectStore('plants').clear(), tx.objectStore('wateringEvents').clear()]);
        if (data.floorPlan && bytes) {
          const { mimeType, widthPx, heightPx, uploadedAt } = data.floorPlan;
          await tx.objectStore('floorPlan').put({ id: 'main', bytes, mimeType, widthPx, heightPx, uploadedAt });
        }
        for (const p of data.plants) { validatePlant(p); await tx.objectStore('plants').put(p); }
        for (const e of data.wateringEvents) await tx.objectStore('wateringEvents').put(e);
        await tx.done;
      } catch (e) {
        tx.done.catch(() => { /* rejection expected after abort */ });
        try { tx.abort(); } catch { /* already finished */ }
        throw e;
      }
    });
  }

  getMeta(key: MetaKey) {
    return this.run('read settings', async (db) => (await db.get('meta', key))?.value ?? null);
  }

  setMeta(key: MetaKey, value: string) {
    return this.run('save settings', async (db) => { await db.put('meta', { key, value }); });
  }
}
