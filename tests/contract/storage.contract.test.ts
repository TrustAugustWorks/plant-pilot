// Every Storage implementation must pass this suite (contracts/storage-interface.md).
import { describe, it, expect, beforeEach } from 'vitest';
import { IndexedDbStorage, blobToBytes } from '../../src/storage/indexedDbStorage';
import { StorageError, type Storage } from '../../src/storage/Storage';
import type { Plant } from '../../src/domain/types';

let n = 0;
const implementations: Array<[string, () => Storage]> = [['IndexedDbStorage', () => new IndexedDbStorage(`test-${++n}`)]];

const plant = (over: Partial<Plant> = {}): Plant => ({
  id: 'p1', typeId: 'monstera', name: 'Monstera', position: { x: 0.3, y: 0.6 }, spotLight: 'bright',
  potDiameterCm: 24, createdAt: '2026-11-04T17:05:00.000Z', archivedAt: null, ...over,
});

describe.each(implementations)('%s', (_name, make) => {
  let s: Storage;
  beforeEach(() => { s = make(); });

  it('spec001_FR001_floor_plan_round_trips', async () => {
    expect(await s.getFloorPlan()).toBeNull();
    await s.saveFloorPlan({ image: new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' }), mimeType: 'image/png', widthPx: 4, heightPx: 3, uploadedAt: '2026-11-04T17:00:00.000Z' });
    const fp = await s.getFloorPlan();
    expect(fp?.widthPx).toBe(4);
    expect(new Uint8Array(await blobToBytes(fp!.image))).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('spec001_FR006_save_and_list_plants', async () => {
    await s.savePlant(plant());
    expect(await s.listPlants()).toHaveLength(1);
    expect((await s.getPlant('p1'))?.name).toBe('Monstera');
  });

  it('spec001_contract_savePlant_validates_position_and_name', async () => {
    await expect(s.savePlant(plant({ position: { x: 1.2, y: 0 } }))).rejects.toBeInstanceOf(StorageError);
    await expect(s.savePlant(plant({ name: '' }))).rejects.toBeInstanceOf(StorageError);
    await expect(s.savePlant(plant({ potDiameterCm: 70 }))).rejects.toBeInstanceOf(StorageError);
  });

  it('spec001_FR009_archive_hides_but_keeps_history', async () => {
    await s.savePlant(plant());
    await s.addWateringEvent({ id: 'e1', plantId: 'p1', wateredAt: '2026-11-01T10:00:00.000Z', source: 'manual' });
    await s.archivePlant('p1', '2026-11-04T10:00:00.000Z');
    expect(await s.listPlants()).toHaveLength(0);
    expect(await s.listPlants({ includeArchived: true })).toHaveLength(1);
    expect(await s.listWateringEvents('p1')).toHaveLength(1);
  });

  it('spec002_FR002_add_and_delete_watering_newest_first', async () => {
    await s.savePlant(plant());
    await s.addWateringEvent({ id: 'e1', plantId: 'p1', wateredAt: '2026-11-01T10:00:00.000Z', source: 'manual' });
    await s.addWateringEvent({ id: 'e2', plantId: 'p1', wateredAt: '2026-11-03T10:00:00.000Z', source: 'manual' });
    expect((await s.getLastWatering('p1'))?.id).toBe('e2');
    await s.deleteWateringEvent('e2');
    expect((await s.getLastWatering('p1'))?.id).toBe('e1');
  });

  it('spec003_FR001_export_then_replaceAll_restores_everything', async () => {
    await s.saveFloorPlan({ image: new Blob([new Uint8Array([9, 8, 7])], { type: 'image/png' }), mimeType: 'image/png', widthPx: 4, heightPx: 3, uploadedAt: '2026-11-04T17:00:00.000Z' });
    await s.savePlant(plant());
    await s.addWateringEvent({ id: 'e1', plantId: 'p1', wateredAt: '2026-11-01T10:00:00.000Z', source: 'manual' });
    const dump = await s.exportAll();
    expect(dump.floorPlan?.imageBase64).toBe('CQgH');

    const t = make();
    await t.savePlant(plant({ id: 'other', name: 'Other' }));
    await t.replaceAll(dump);
    expect((await t.listPlants()).map((p) => p.id)).toEqual(['p1']);
    expect(await t.listWateringEvents('p1')).toHaveLength(1);
    expect((await t.getFloorPlan())?.widthPx).toBe(4);
  });

  it('spec003_FR002_failed_replaceAll_leaves_data_untouched', async () => {
    await s.savePlant(plant());
    const dump = await s.exportAll();
    dump.plants.push(plant({ id: 'bad', position: { x: 5, y: 5 } }));
    await expect(s.replaceAll(dump)).rejects.toBeInstanceOf(StorageError);
    expect((await s.listPlants()).map((p) => p.id)).toEqual(['p1']);
  });

  it('spec004_FR005_meta_round_trips', async () => {
    expect(await s.getMeta('calendarReminderTime')).toBeNull();
    await s.setMeta('calendarReminderTime', '08:30');
    expect(await s.getMeta('calendarReminderTime')).toBe('08:30');
  });
});
