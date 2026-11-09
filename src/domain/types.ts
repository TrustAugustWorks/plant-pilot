// Shared data shapes. Mirrors specs/001-map-and-plants/contracts/*.md and
// specs/003-backup-export/contracts/export-format.md. Domain depends on nothing else.

export type LightLevel = 'sun' | 'bright' | 'shade';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Status = 'ok' | 'soon' | 'due';
export type IconName = 'leaf' | 'sprout' | 'flower' | 'cactus' | 'tree' | 'herb' | 'fruit';

/** Local calendar date, "YYYY-MM-DD". */
export type DateKey = string;

export interface PlantType {
  id: string;
  name: string;
  nameDa: string;
  baseIntervalDays: number;
  lightPreference: LightLevel;
  waterFraction: number;
  winterRest: boolean;
  outdoorOk: boolean;
  icon: IconName;
  careNote: string;
  sources: string[];
}

export interface Position { x: number; y: number }

export type FloorPlanMime = 'image/jpeg' | 'image/png' | 'image/webp';

export interface FloorPlan {
  image: Blob;
  mimeType: FloorPlanMime;
  widthPx: number;
  heightPx: number;
  uploadedAt: string;
}

export interface Plant {
  id: string;
  typeId: string;
  name: string;
  position: Position;
  spotLight: LightLevel;
  potDiameterCm: number;
  createdAt: string;
  archivedAt: string | null;
}

export interface WateringEvent {
  id: string;
  plantId: string;
  wateredAt: string;
  source: 'manual' | 'sensor';
}

export interface ExportFileV1 {
  format: 'plant-pilot-export';
  formatVersion: 1;
  exportedAt: string;
  appVersion: string;
  floorPlan: null | {
    mimeType: FloorPlanMime;
    widthPx: number;
    heightPx: number;
    uploadedAt: string;
    imageBase64: string;
  };
  plants: Plant[];
  wateringEvents: WateringEvent[];
}

/** Injected time source (Constitution V). */
export interface Clock { now(): Date }
