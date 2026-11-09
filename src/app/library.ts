import raw from '../data/plant-library.json';
import type { PlantType } from '../domain/types';

export const LIBRARY: PlantType[] = raw as PlantType[];
export const LIBRARY_BY_ID = new Map(LIBRARY.map((t) => [t.id, t]));
export const KNOWN_TYPE_IDS = new Set(LIBRARY.map((t) => t.id));

/** Matches English or Danish name, case- and accent-insensitive ("monst", "fredslilje"). */
export function searchLibrary(query: string): PlantType[] {
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const q = norm(query.trim());
  if (!q) return LIBRARY;
  return LIBRARY.filter((t) => norm(t.name).includes(q) || norm(t.nameDa).includes(q) || t.id.includes(q));
}
