// Validates src/data/plant-library.json against specs/001-map-and-plants/contracts/plant-library.md (FR-010).
import { describe, it, expect } from 'vitest';
import library from '../../src/data/plant-library.json';

interface LibraryEntry {
  id: string;
  name: string;
  nameDa: string;
  baseIntervalDays: number;
  lightPreference: string;
  waterFraction: number;
  winterRest: boolean;
  outdoorOk: boolean;
  icon: string;
  careNote: string;
  sources: string[];
}

const entries = library as unknown as LibraryEntry[];

const FIELDS = [
  'id',
  'name',
  'nameDa',
  'baseIntervalDays',
  'lightPreference',
  'waterFraction',
  'winterRest',
  'outdoorOk',
  'icon',
  'careNote',
  'sources',
].sort();
const LIGHTS = ['sun', 'bright', 'shade'];
const ICONS = ['leaf', 'sprout', 'flower', 'cactus', 'tree', 'herb', 'fruit'];
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const HTTP_URL = /^https?:\/\/\S+$/;

describe('plant library contract (spec001 FR-010)', () => {
  it('spec001_FR010_library_is_a_non_empty_array', () => {
    expect(Array.isArray(library)).toBe(true);
    expect(entries.length).toBeGreaterThan(0);
  });

  it('spec001_FR010_entries_have_exactly_the_contract_fields', () => {
    for (const e of entries) {
      expect(Object.keys(e).sort(), e.id).toEqual(FIELDS);
    }
  });

  it('spec001_FR010_ids_are_unique', () => {
    const ids = entries.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('spec001_FR010_ids_are_kebab_case', () => {
    for (const e of entries) {
      expect(e.id, e.id).toMatch(KEBAB);
    }
  });

  it('spec001_FR010_names_are_non_empty_strings', () => {
    for (const e of entries) {
      expect(typeof e.name, e.id).toBe('string');
      expect(e.name.trim().length, e.id).toBeGreaterThan(0);
      expect(typeof e.nameDa, e.id).toBe('string');
      expect(e.nameDa.trim().length, e.id).toBeGreaterThan(0);
    }
  });

  it('spec001_FR010_base_interval_is_integer_at_least_1', () => {
    for (const e of entries) {
      expect(Number.isInteger(e.baseIntervalDays), e.id).toBe(true);
      expect(e.baseIntervalDays, e.id).toBeGreaterThanOrEqual(1);
    }
  });

  it('spec001_FR010_light_preference_is_valid_enum', () => {
    for (const e of entries) {
      expect(LIGHTS, e.id).toContain(e.lightPreference);
    }
  });

  it('spec001_FR010_icon_is_valid_enum', () => {
    for (const e of entries) {
      expect(ICONS, e.id).toContain(e.icon);
    }
  });

  it('spec001_FR010_water_fraction_is_between_0_05_and_0_4', () => {
    for (const e of entries) {
      expect(typeof e.waterFraction, e.id).toBe('number');
      expect(e.waterFraction, e.id).toBeGreaterThanOrEqual(0.05);
      expect(e.waterFraction, e.id).toBeLessThanOrEqual(0.4);
    }
  });

  it('spec001_FR010_winter_rest_and_outdoor_ok_are_booleans', () => {
    for (const e of entries) {
      expect(typeof e.winterRest, e.id).toBe('boolean');
      expect(typeof e.outdoorOk, e.id).toBe('boolean');
    }
  });

  it('spec001_FR010_care_note_is_non_empty_and_at_most_120_chars', () => {
    for (const e of entries) {
      expect(typeof e.careNote, e.id).toBe('string');
      expect(e.careNote.trim().length, e.id).toBeGreaterThan(0);
      expect(e.careNote.length, e.id).toBeLessThanOrEqual(120);
    }
  });

  it('spec001_FR010_at_least_2_http_sources', () => {
    for (const e of entries) {
      expect(Array.isArray(e.sources), e.id).toBe(true);
      expect(e.sources.length, e.id).toBeGreaterThanOrEqual(2);
      for (const url of e.sources) {
        expect(url, e.id).toMatch(HTTP_URL);
      }
      expect(new Set(e.sources).size, `${e.id} has duplicate sources`).toBe(e.sources.length);
    }
  });

  it('spec001_FR010_entries_sorted_by_name', () => {
    const names = entries.map((e) => e.name);
    const sorted = [...names].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase(), 'en'));
    expect(names).toEqual(sorted);
  });

  it('spec001_FR010_released_ids_are_still_present', () => {
    // ids are stable forever: never remove or rename one once released.
    const released = [
      'aloe-vera', 'basil', 'cactus', 'calathea', 'fiddle-leaf-fig', 'pelargonium', 'lavender',
      'mint', 'monstera', 'orchid', 'peace-lily', 'pothos', 'rosemary', 'rubber-plant',
      'snake-plant', 'spider-plant', 'strawberry', 'succulent', 'tomato', 'zz-plant',
      'areca-palm', 'kentia-palm', 'parlour-palm', 'ponytail-palm', 'yucca',
    ];
    const ids = new Set(entries.map((e) => e.id));
    for (const id of released) {
      expect(ids.has(id), id).toBe(true);
    }
  });
});
