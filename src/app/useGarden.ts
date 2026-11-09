// App state and actions. UI calls this; this calls Storage and Domain.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DOUBLE_TAP_MS, FLOOR_PLAN_MAX_BYTES, FLOOR_PLAN_TYPES } from '../domain/config';
import { toDateKey, startOfDateKey } from '../domain/dates';
import { validateExport } from '../domain/exportFormat';
import { plantState, sortStates, type PlantState } from '../domain/watering';
import type { Clock, FloorPlan, FloorPlanMime, Plant, Position, WateringEvent } from '../domain/types';
import type { Storage } from '../storage/Storage';
import { KNOWN_TYPE_IDS, LIBRARY_BY_ID } from './library';

export interface PlantDraft {
  typeId: string;
  name: string;
  spotLight: Plant['spotLight'];
  potDiameterCm: number;
  lastWatered: string; // DateKey
  position: Position;
}

const uuid = () => crypto.randomUUID();

/** Timestamp for a "last watered" date picked in a dialog: now if today, else noon that day. */
function wateredAtFor(dateKey: string, now: Date): string {
  return dateKey === toDateKey(now) ? now.toISOString() : startOfDateKey(dateKey).toISOString();
}

export function useGarden(storage: Storage, clock: Clock) {
  const [loading, setLoading] = useState(true);
  const [floorPlan, setFloorPlan] = useState<FloorPlan | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [lastEvents, setLastEvents] = useState<Record<string, WateringEvent | null>>({});
  const [now, setNow] = useState(() => clock.now());
  const [error, setError] = useState<string | null>(null);
  const persistAsked = useRef(false);

  const reload = useCallback(async () => {
    const [fp, ps] = await Promise.all([storage.getFloorPlan(), storage.listPlants()]);
    const last: Record<string, WateringEvent | null> = {};
    await Promise.all(ps.map(async (p) => { last[p.id] = await storage.getLastWatering(p.id); }));
    setFloorPlan(fp);
    setPlants(ps);
    setLastEvents(last);
  }, [storage]);

  useEffect(() => {
    reload().catch((e) => setError(String(e?.message ?? e))).finally(() => setLoading(false));
  }, [reload]);

  useEffect(() => {
    if (!floorPlan) { setImageUrl(null); return; }
    const url = URL.createObjectURL(floorPlan.image);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [floorPlan]);

  // FR-008 (002): refresh at local midnight and when the app regains focus.
  useEffect(() => {
    const tick = () => setNow(clock.now());
    const n = clock.now();
    const midnight = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, 0, 0, 1);
    const timer = setTimeout(tick, midnight.getTime() - n.getTime());
    const onVisible = () => { if (document.visibilityState === 'visible') tick(); };
    window.addEventListener('focus', tick);
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearTimeout(timer); window.removeEventListener('focus', tick); document.removeEventListener('visibilitychange', onVisible); };
  }, [clock, now]);

  const today = toDateKey(now);

  const states: PlantState[] = useMemo(() => sortStates(plants.flatMap((p) => {
    const type = LIBRARY_BY_ID.get(p.typeId);
    const last = lastEvents[p.id];
    return type && last ? [plantState(p, type, last.wateredAt, now)] : [];
  })), [plants, lastEvents, now]);

  const askPersist = () => {
    if (persistAsked.current) return;
    persistAsked.current = true;
    navigator.storage?.persist?.().catch(() => undefined);
  };

  const guard = async <T,>(fn: () => Promise<T>): Promise<T> => {
    try {
      setError(null);
      return await fn();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      throw e;
    }
  };

  /** Returns an error message, or null when saved. */
  const uploadFloorPlan = async (file: File): Promise<string | null> => {
    if (!FLOOR_PLAN_TYPES.includes(file.type as FloorPlanMime)) return 'Please choose a JPEG, PNG or WebP image.';
    if (file.size > FLOOR_PLAN_MAX_BYTES) return 'The image is larger than 10 MB. Please choose a smaller one.';
    let dims: { w: number; h: number };
    try {
      dims = await imageSize(file);
    } catch {
      return 'That image could not be read.';
    }
    const plan: FloorPlan = { image: file, mimeType: file.type as FloorPlanMime, widthPx: dims.w, heightPx: dims.h, uploadedAt: clock.now().toISOString() };
    await guard(() => storage.saveFloorPlan(plan));
    askPersist();
    setFloorPlan(await storage.getFloorPlan());
    return null;
  };

  const addPlant = async (d: PlantDraft) => guard(async () => {
    const n = clock.now();
    const plant: Plant = {
      id: uuid(), typeId: d.typeId, name: d.name.trim(), position: d.position, spotLight: d.spotLight,
      potDiameterCm: d.potDiameterCm, createdAt: n.toISOString(), archivedAt: null,
    };
    await storage.savePlant(plant);
    await storage.addWateringEvent({ id: uuid(), plantId: plant.id, wateredAt: wateredAtFor(d.lastWatered, n), source: 'manual' });
    askPersist();
    await reload();
  });

  const updatePlant = async (plant: Plant, d: PlantDraft) => guard(async () => {
    const n = clock.now();
    await storage.savePlant({ ...plant, typeId: d.typeId, name: d.name.trim(), spotLight: d.spotLight, potDiameterCm: d.potDiameterCm });
    const last = lastEvents[plant.id];
    if (!last || toDateKey(new Date(last.wateredAt)) !== d.lastWatered) {
      await storage.addWateringEvent({ id: uuid(), plantId: plant.id, wateredAt: wateredAtFor(d.lastWatered, n), source: 'manual' });
    }
    await reload();
  });

  const movePlant = async (id: string, position: Position) => guard(async () => {
    const p = plants.find((x) => x.id === id);
    if (!p) return;
    setPlants((ps) => ps.map((x) => (x.id === id ? { ...x, position } : x)));
    await storage.savePlant({ ...p, position });
  });

  const removePlant = async (id: string) => guard(async () => {
    await storage.archivePlant(id, clock.now().toISOString());
    await reload();
  });

  /** FR-001/FR-003 (002). Returns the new event, or 'recent' if watered < 60 s ago. */
  const water = async (id: string): Promise<WateringEvent | 'recent'> => guard(async () => {
    const n = clock.now();
    const last = lastEvents[id];
    if (last && n.getTime() - new Date(last.wateredAt).getTime() < DOUBLE_TAP_MS) return 'recent';
    const event: WateringEvent = { id: uuid(), plantId: id, wateredAt: n.toISOString(), source: 'manual' };
    await storage.addWateringEvent(event);
    setLastEvents((m) => ({ ...m, [id]: event }));
    setNow(n);
    return event;
  });

  const undoWatering = async (event: WateringEvent) => guard(async () => {
    await storage.deleteWateringEvent(event.id);
    const last = await storage.getLastWatering(event.plantId);
    setLastEvents((m) => ({ ...m, [event.plantId]: last }));
  });

  const exportBackup = async () => guard(async () => {
    const data = await storage.exportAll();
    await storage.setMeta('lastExportAt', clock.now().toISOString());
    return data;
  });

  /** Validates fully before touching data (FR-002, 003). */
  const parseBackup = async (file: File) => {
    let json: unknown;
    try {
      json = JSON.parse(await file.text());
    } catch {
      return { ok: false as const, errors: ['The file is not valid JSON.'] };
    }
    return validateExport(json, KNOWN_TYPE_IDS);
  };

  const importBackup = async (data: Parameters<Storage['replaceAll']>[0]) => guard(async () => {
    await storage.replaceAll(data);
    askPersist();
    await reload();
  });

  return {
    loading, error, setError, floorPlan, imageUrl, plants, states, now, today,
    uploadFloorPlan, addPlant, updatePlant, movePlant, removePlant, water, undoWatering,
    exportBackup, parseBackup, importBackup,
  };
}

function imageSize(file: Blob): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { resolve({ w: img.naturalWidth, h: img.naturalHeight }); URL.revokeObjectURL(url); };
    img.onerror = () => { reject(new Error('unreadable')); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

export type Garden = ReturnType<typeof useGarden>;
