// Watering model (docs/architecture.md section 5, spec 002). Pure functions only.
import {
  LIGHT_AMOUNT_FACTOR, LIGHT_INTERVAL_FACTOR, SEASON_AMOUNT_FACTOR, SEASON_INTERVAL_FACTOR,
  WINTER_REST_INTERVAL_FACTOR, SEASON_SUMMARY, SOON_MAX_DAYS, MIN_AMOUNT_ML, AMOUNT_STEP_ML,
} from './config';
import { addDays, diffDays, monthOf, shortDate, toDateKey } from './dates';
import type { DateKey, LightLevel, Plant, PlantType, Season, Status } from './types';

/** Rounds .5 up; the epsilon absorbs floating-point noise such as 5 x 1.3 = 6.499999... */
export function roundHalfUp(x: number): number {
  return Math.floor(x + 0.5 + 1e-9);
}

export function seasonOf(key: DateKey): Season {
  const m = monthOf(key);
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  if (m >= 9 && m <= 11) return 'autumn';
  return 'winter';
}

export function seasonSummary(season: Season): string {
  return SEASON_SUMMARY[season];
}

export function seasonIntervalFactor(season: Season, winterRest: boolean): number {
  return season === 'winter' && winterRest ? WINTER_REST_INTERVAL_FACTOR : SEASON_INTERVAL_FACTOR[season];
}

export function effectiveIntervalDays(type: PlantType, spotLight: LightLevel, season: Season): number {
  const raw = type.baseIntervalDays * LIGHT_INTERVAL_FACTOR[spotLight] * seasonIntervalFactor(season, type.winterRest);
  return Math.max(1, roundHalfUp(raw));
}

export function potVolumeLitres(potDiameterCm: number): number {
  return potDiameterCm ** 3 / 2000;
}

export function waterAmountMl(type: PlantType, potDiameterCm: number, spotLight: LightLevel, season: Season): number {
  const ml = potVolumeLitres(potDiameterCm) * type.waterFraction * LIGHT_AMOUNT_FACTOR[spotLight] * SEASON_AMOUNT_FACTOR[season] * 1000;
  return Math.max(MIN_AMOUNT_ML, roundHalfUp(ml / AMOUNT_STEP_ML) * AMOUNT_STEP_ML);
}

/** "250 ml", "1.7 L", "1.45 L" */
export function formatAmount(ml: number): string {
  if (ml < 1000) return `${ml} ml`;
  return `${(ml / 1000).toFixed(2).replace(/0+$/, '').replace(/\.$/, '')} L`;
}

/** Next due uses the season on the day of the last watering (FR-013). */
export function nextDueKey(type: PlantType, spotLight: LightLevel, lastWateredKey: DateKey): DateKey {
  return addDays(lastWateredKey, effectiveIntervalDays(type, spotLight, seasonOf(lastWateredKey)));
}

export function daysLeft(nextDue: DateKey, today: DateKey): number {
  return diffDays(today, nextDue);
}

export function statusFor(days: number): Status {
  if (days <= 0) return 'due';
  if (days <= SOON_MAX_DAYS) return 'soon';
  return 'ok';
}

export function countdownText(days: number): string {
  if (days < 0) return `overdue ${-days} ${-days === 1 ? 'day' : 'days'}`;
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

function agoText(days: number): string {
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

const LIGHT_LABEL: Record<LightLevel, string> = { sun: 'sun', bright: 'bright, indirect light', shade: 'shade' };
const SEASON_NAME: Record<Season, string> = { spring: 'spring', summer: 'summer', autumn: 'autumn', winter: 'winter' };

export function lightLabel(l: LightLevel): string {
  return LIGHT_LABEL[l];
}

export function mismatchWarning(preference: LightLevel, spot: LightLevel): string | null {
  if (preference === spot) return null;
  const rank: Record<LightLevel, number> = { shade: 0, bright: 1, sun: 2 };
  return rank[spot] > rank[preference] ? 'This spot may be too sunny' : 'This spot may be too dark';
}

/** Everything the UI shows about one plant, computed for "today". */
export interface PlantState {
  plant: Plant;
  type: PlantType;
  lastWateredKey: DateKey;
  lastWateredAt: string;
  intervalDays: number;
  intervalSeason: Season;
  nextDue: DateKey;
  daysLeft: number;
  status: Status;
  amountMl: number;
  todaySeason: Season;
}

export function plantState(plant: Plant, type: PlantType, lastWateredAt: string, now: Date): PlantState {
  const today = toDateKey(now);
  const lastKey = toDateKey(new Date(lastWateredAt));
  const intervalSeason = seasonOf(lastKey);
  const intervalDays = effectiveIntervalDays(type, plant.spotLight, intervalSeason);
  const nextDue = addDays(lastKey, intervalDays);
  const left = daysLeft(nextDue, today);
  const todaySeason = seasonOf(today);
  return {
    plant, type, lastWateredKey: lastKey, lastWateredAt, intervalDays, intervalSeason, nextDue,
    daysLeft: left, status: statusFor(left), amountMl: waterAmountMl(type, plant.potDiameterCm, plant.spotLight, todaySeason),
    todaySeason,
  };
}

/** Plant info lines (docs/ui.md, "Plant info"). */
export function plantInfoLines(s: PlantState, today: DateKey) {
  const lightWord = s.plant.spotLight;
  return {
    title: s.plant.name,
    typeLine: `${s.type.name} · ${s.type.nameDa}`,
    likes: `Likes: ${lightLabel(s.type.lightPreference)}`,
    spot: `This spot: ${lightLabel(s.plant.spotLight)}`,
    warning: mismatchWarning(s.type.lightPreference, s.plant.spotLight),
    interval: `Water every ${s.intervalDays} ${s.intervalDays === 1 ? 'day' : 'days'} (base ${s.type.baseIntervalDays} · ${lightWord} · ${SEASON_NAME[s.intervalSeason]})`,
    amount: `Give about ${formatAmount(s.amountMl)} (${s.plant.potDiameterCm} cm pot)`,
    last: `Last watered ${agoText(diffDays(s.lastWateredKey, today))} (${shortDate(s.lastWateredKey)})`,
    next: `Next: ${countdownText(s.daysLeft)} (${shortDate(s.nextDue)})`,
    careNote: s.type.careNote,
  };
}

const STATUS_ORDER: Record<Status, number> = { due: 0, soon: 1, ok: 2 };

/** Sorted by days left ascending, ties by name (spec 002 US2.5). */
export function sortStates(states: PlantState[]): PlantState[] {
  return [...states].sort((a, b) =>
    a.daysLeft - b.daysLeft || STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.plant.name.localeCompare(b.plant.name));
}

/** Default name: type name, numbered if taken ("Monstera 2"). */
export function defaultPlantName(typeName: string, existingNames: string[]): string {
  const taken = new Set(existingNames.map((n) => n.toLowerCase()));
  if (!taken.has(typeName.toLowerCase())) return typeName;
  for (let i = 2; ; i++) if (!taken.has(`${typeName} ${i}`.toLowerCase())) return `${typeName} ${i}`;
}
