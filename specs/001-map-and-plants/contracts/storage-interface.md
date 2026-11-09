# Contract: Storage interface

The only way the app reads or writes data (Constitution II). Pilot implementation: IndexedDB. Later: HTTP client for a Raspberry Pi server. Both must pass the same contract test suite (`tests/contract/storage.contract.test.ts`).

```ts
export type LightLevel = 'sun' | 'bright' | 'shade';

export interface Position { x: number; y: number } // 0..1, relative to floor plan image

export interface FloorPlan {
  image: Blob;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  widthPx: number;
  heightPx: number;
  uploadedAt: string; // ISO 8601 UTC
}

export interface Plant {
  id: string;           // UUID
  typeId: string;       // PlantType.id from library
  name: string;         // 1..60 chars
  position: Position;
  spotLight: LightLevel;
  potDiameterCm: number; // 5..60
  createdAt: string;
  archivedAt: string | null;
}

export interface WateringEvent {
  id: string;
  plantId: string;
  wateredAt: string;
  source: 'manual' | 'sensor'; // 'sensor' reserved, not used in pilot
}

export interface Storage {
  getFloorPlan(): Promise<FloorPlan | null>;
  saveFloorPlan(plan: FloorPlan): Promise<void>;

  listPlants(opts?: { includeArchived?: boolean }): Promise<Plant[]>;
  getPlant(id: string): Promise<Plant | null>;
  savePlant(plant: Plant): Promise<void>;       // create or update
  archivePlant(id: string, at: string): Promise<void>;

  listWateringEvents(plantId: string): Promise<WateringEvent[]>; // newest first
  getLastWatering(plantId: string): Promise<WateringEvent | null>;
  addWateringEvent(event: WateringEvent): Promise<void>;
  deleteWateringEvent(id: string): Promise<void>;

  exportAll(): Promise<ExportFileV1>;   // see specs/003-backup-export/contracts/export-format.md
  replaceAll(data: ExportFileV1): Promise<void>; // atomic: all or nothing

  getMeta(key: MetaKey): Promise<string | null>;
  setMeta(key: MetaKey, value: string): Promise<void>;
}

// Amended 2026-11-09 for feature 004 (calendar reminders).
export type MetaKey =
  | 'lastExportAt'
  | 'calendarReminderTime'    // "HH:MM", default "09:00"
  | 'calendarAccount'         // "work" | "personal"
  | 'calendarFingerprint'     // fingerprint of the last downloaded calendar
  | 'backupReminderDismissedAt';
```

Rules:
- Every method rejects with a typed `StorageError` on failure; it never fails silently.
- `savePlant` validates position range and name length.
- `replaceAll` leaves existing data untouched if it fails.
