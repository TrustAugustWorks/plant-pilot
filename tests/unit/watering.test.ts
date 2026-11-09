import { describe, it, expect } from 'vitest';
import {
  effectiveIntervalDays, waterAmountMl, formatAmount, nextDueKey, daysLeft, statusFor,
  countdownText, seasonOf, seasonSummary, roundHalfUp,
} from '../../src/domain/watering';
import { addDays, diffDays, toDateKey } from '../../src/domain/dates';
import type { PlantType } from '../../src/domain/types';

const type = (over: Partial<PlantType>): PlantType => ({
  id: 'x', name: 'X', nameDa: 'X', baseIntervalDays: 7, lightPreference: 'bright', waterFraction: 0.25,
  winterRest: false, outdoorOk: false, icon: 'leaf', careNote: '', sources: [], ...over,
});
const monstera = type({ id: 'monstera', name: 'Monstera', baseIntervalDays: 7, waterFraction: 0.125 });
const pothos = type({ id: 'pothos', baseIntervalDays: 7 });
const basil = type({ id: 'basil', baseIntervalDays: 2, lightPreference: 'sun', waterFraction: 0.15 });
const peaceLily = type({ id: 'peace-lily', baseIntervalDays: 5 });
const cactus = type({ id: 'cactus', baseIntervalDays: 21, waterFraction: 0.05, winterRest: true });
const TODAY = '2026-11-04';

describe('dates', () => {
  it('arch_calendar_days_ignore_DST', () => {
    expect(addDays('2026-10-24', 2)).toBe('2026-10-26'); // DST ends 25 Oct in Denmark
    expect(diffDays('2026-03-28', '2026-03-30')).toBe(2);
    expect(addDays('2026-11-28', 6)).toBe('2026-12-04');
  });
  it('arch_date_key_uses_local_date', () => {
    expect(toDateKey(new Date(2026, 10, 4, 23, 59))).toBe('2026-11-04');
  });
});

describe('spec002 seasons', () => {
  it('spec002_FR012_season_from_month', () => {
    expect(seasonOf('2026-03-01')).toBe('spring');
    expect(seasonOf('2026-06-30')).toBe('summer');
    expect(seasonOf('2026-11-30')).toBe('autumn');
    expect(seasonOf('2026-12-01')).toBe('winter');
    expect(seasonOf('2027-02-28')).toBe('winter');
  });
  it('spec002_FR015_autumn_summary', () => {
    expect(seasonSummary('autumn')).toBe('Autumn: a little less often, a little less water');
  });
});

describe('spec002 effective interval', () => {
  it('spec002_US2_1_pothos_bright_autumn_is_8', () => expect(effectiveIntervalDays(pothos, 'bright', 'autumn')).toBe(8));
  it('spec002_US2_2_monstera_sun_autumn_is_6', () => expect(effectiveIntervalDays(monstera, 'sun', 'autumn')).toBe(6));
  it('spec002_US2_3_basil_sun_autumn_is_2', () => expect(effectiveIntervalDays(basil, 'sun', 'autumn')).toBe(2));
  it('spec002_US2_4_peace_lily_shade_autumn_is_7', () => expect(effectiveIntervalDays(peaceLily, 'shade', 'autumn')).toBe(7));
  it('spec002_US5_3_monstera_sun_winter_is_7', () => expect(effectiveIntervalDays(monstera, 'sun', 'winter')).toBe(7));
  it('spec002_FR014_cactus_winter_rest_is_42', () => expect(effectiveIntervalDays(cactus, 'bright', 'winter')).toBe(42));
  it('spec002_US5_5_cactus_summer_is_18', () => expect(effectiveIntervalDays(cactus, 'bright', 'summer')).toBe(18));
  it('spec002_edge_half_rounds_up', () => {
    expect(roundHalfUp(6.5)).toBe(7);
    expect(roundHalfUp(1.5)).toBe(2);
    expect(effectiveIntervalDays(type({ baseIntervalDays: 5 }), 'shade', 'spring')).toBe(7); // 6.5 -> 7
  });
  it('spec002_edge_interval_never_below_1', () => {
    expect(effectiveIntervalDays(type({ baseIntervalDays: 1 }), 'sun', 'summer')).toBe(1);
  });
});

describe('spec002 next due, days left, status, text', () => {
  it('spec002_US2_1_pothos_next_due_9_nov_in_5_days', () => {
    const due = nextDueKey(pothos, 'bright', '2026-11-01');
    expect(due).toBe('2026-11-09');
    expect(countdownText(daysLeft(due, TODAY))).toBe('in 5 days');
  });
  it('spec002_US2_2_monstera_due_today', () => {
    const due = nextDueKey(monstera, 'sun', '2026-10-29');
    expect(due).toBe('2026-11-04');
    expect(countdownText(daysLeft(due, TODAY))).toBe('today');
  });
  it('spec002_US2_3_basil_overdue_1_day', () => {
    const due = nextDueKey(basil, 'sun', '2026-11-01');
    expect(due).toBe('2026-11-03');
    expect(countdownText(daysLeft(due, TODAY))).toBe('overdue 1 day');
  });
  it('spec002_FR013_season_at_last_watering_counts', () => {
    expect(nextDueKey(monstera, 'sun', '2026-11-28')).toBe('2026-12-04');
    expect(nextDueKey(monstera, 'sun', '2026-12-04')).toBe('2026-12-11');
  });
  it('spec002_FR005_countdown_texts', () => {
    expect(countdownText(-2)).toBe('overdue 2 days');
    expect(countdownText(1)).toBe('tomorrow');
  });
  it('spec002_US3_status_thresholds', () => {
    expect(statusFor(-1)).toBe('due');
    expect(statusFor(0)).toBe('due');
    expect(statusFor(1)).toBe('soon');
    expect(statusFor(2)).toBe('soon');
    expect(statusFor(3)).toBe('ok');
  });
});

describe('spec002 water amount', () => {
  it('spec002_US4_1_monstera_autumn_850_ml', () => {
    const ml = waterAmountMl(monstera, 24, 'sun', 'autumn');
    expect(ml).toBe(850);
    expect(formatAmount(ml)).toBe('850 ml');
  });
  it('spec002_US4_2_monstera_summer_1_1_L_winter_700_ml', () => {
    expect(formatAmount(waterAmountMl(monstera, 24, 'sun', 'summer'))).toBe('1.1 L');
    expect(waterAmountMl(monstera, 24, 'sun', 'winter')).toBe(700);
  });
  it('spec002_US4_2_litres_shown_with_up_to_two_decimals', () => {
    expect(formatAmount(1450)).toBe('1.45 L');
    expect(formatAmount(2000)).toBe('2 L');
  });
  it('spec002_US4_3_basil_autumn_150_ml', () => {
    expect(formatAmount(waterAmountMl(basil, 12, 'sun', 'autumn'))).toBe('150 ml');
  });
  it('spec002_US4_4_cactus_winter_minimum_50_ml', () => {
    expect(waterAmountMl(cactus, 10, 'bright', 'winter')).toBe(50);
  });
});
