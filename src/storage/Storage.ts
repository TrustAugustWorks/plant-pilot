// The storage interface (specs/001-map-and-plants/contracts/storage-interface.md, Constitution II).
import type { ExportFileV1, FloorPlan, Plant, WateringEvent } from '../domain/types';

export type MetaKey =
  | 'lastExportAt'
  | 'calendarReminderTime'
  | 'calendarAccount'
  | 'calendarFingerprint'
  | 'backupReminderDismissedAt';

export class StorageError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'StorageError';
  }
}

export interface Storage {
  getFloorPlan(): Promise<FloorPlan | null>;
  saveFloorPlan(plan: FloorPlan): Promise<void>;

  listPlants(opts?: { includeArchived?: boolean }): Promise<Plant[]>;
  getPlant(id: string): Promise<Plant | null>;
  savePlant(plant: Plant): Promise<void>;
  archivePlant(id: string, at: string): Promise<void>;

  listWateringEvents(plantId: string): Promise<WateringEvent[]>;
  getLastWatering(plantId: string): Promise<WateringEvent | null>;
  addWateringEvent(event: WateringEvent): Promise<void>;
  deleteWateringEvent(id: string): Promise<void>;

  exportAll(): Promise<ExportFileV1>;
  replaceAll(data: ExportFileV1): Promise<void>;

  getMeta(key: MetaKey): Promise<string | null>;
  setMeta(key: MetaKey, value: string): Promise<void>;
}
