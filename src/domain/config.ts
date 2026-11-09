// Every tunable constant of the watering model lives here (docs/architecture.md section 5, ADR 0005).
// Values as written in the spec; tune after a few weeks of use (spec 002 clarification).
import type { LightLevel, Season } from './types';

export const LIGHT_INTERVAL_FACTOR: Record<LightLevel, number> = { sun: 0.75, bright: 1.0, shade: 1.3 };
export const LIGHT_AMOUNT_FACTOR: Record<LightLevel, number> = { sun: 1.1, bright: 1.0, shade: 0.9 };

export const SEASON_INTERVAL_FACTOR: Record<Season, number> = { spring: 1.0, summer: 0.85, autumn: 1.15, winter: 1.4 };
export const WINTER_REST_INTERVAL_FACTOR = 2.0;
export const SEASON_AMOUNT_FACTOR: Record<Season, number> = { spring: 1.0, summer: 1.15, autumn: 0.9, winter: 0.75 };

export const SEASON_SUMMARY: Record<Season, string> = {
  spring: 'Spring: normal watering',
  summer: 'Summer: more often, more water',
  autumn: 'Autumn: a little less often, a little less water',
  winter: 'Winter: less often, less water; resting plants much less',
};

/** Status `soon` when days left is 1..SOON_MAX_DAYS; `due` at 0 or below. */
export const SOON_MAX_DAYS = 2;

export const MIN_AMOUNT_ML = 50;
export const AMOUNT_STEP_ML = 50;

export const POT_DEFAULT_CM = 14;
export const POT_MIN_CM = 5;
export const POT_MAX_CM = 60;
export const NAME_MAX_LENGTH = 60;

export const UNDO_MS = 10_000;
export const DOUBLE_TAP_MS = 60_000;

export const FLOOR_PLAN_MAX_BYTES = 10 * 1024 * 1024;
export const FLOOR_PLAN_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const BACKUP_REMINDER_DAYS = 30;

export const CALENDAR_HORIZON_DAYS = 365;
export const CALENDAR_DEFAULT_TIME = '09:00';
export const CALENDAR_EVENT_MINUTES = 15;
