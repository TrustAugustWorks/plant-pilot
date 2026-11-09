import { describe, it, expect } from 'vitest';
import { planWaterings, buildIcs, outlookComposeUrl, calendarFingerprint, foldLine, escapeText } from '../../src/domain/calendar';
import type { PlantType } from '../../src/domain/types';

const monstera: PlantType = {
  id: 'monstera', name: 'Monstera', nameDa: 'Monstera', baseIntervalDays: 7, lightPreference: 'bright',
  waterFraction: 0.25, winterRest: false, outdoorOk: false, icon: 'leaf', careNote: 'Let the top soil dry; avoid sun, it scorches.', sources: [],
};
const plant = { id: 'p1', name: 'Monstera', spotLight: 'sun' as const, potDiameterCm: 24 };

describe('spec004 planned waterings', () => {
  it('spec004_US1_2_monstera_dates_follow_season_of_each_watering', () => {
    const plan = planWaterings(monstera, plant, '2026-11-04', '2026-11-04', 40);
    expect(plan.map((p) => p.date)).toEqual([
      '2026-11-04', '2026-11-10', '2026-11-16', '2026-11-22', '2026-11-28', '2026-12-04', '2026-12-11',
    ]);
    expect(plan[0].amountMl).toBe(1700);
    expect(plan[5].amountMl).toBe(1450);
  });
  it('spec004_US1_3_overdue_plant_starts_today', () => {
    const plan = planWaterings(monstera, plant, '2026-11-01', '2026-11-04', 10);
    expect(plan[0].date).toBe('2026-11-04');
  });
  it('spec004_FR001_horizon_is_inclusive_limit', () => {
    const plan = planWaterings(monstera, plant, '2026-11-04', '2026-11-04', 365);
    expect(plan.at(-1)!.date <= '2027-11-04').toBe(true);
    expect(plan.length).toBeGreaterThan(40);
  });
});

describe('spec004 ics', () => {
  const ics = buildIcs(
    [{ plantId: 'p1', name: 'Monstera, big; one', careNote: monstera.careNote, waterings: [{ date: '2026-11-04', amountMl: 1700 }] }],
    { time: '09:00', appUrl: 'https://example.github.io/plant-pilot/', generatedAt: new Date(Date.UTC(2026, 10, 4, 8, 0, 0)) },
  );
  it('spec004_FR003_event_fields', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics).toContain('UID:p1-20261104@plant-pilot');
    expect(ics).toContain('DTSTART:20261104T090000');
    expect(ics).toContain('DTEND:20261104T091500');
    expect(ics).toContain('SUMMARY:Water Monstera\\, big\\; one (1.7 L)');
    expect(ics).toContain('BEGIN:VALARM');
    expect(ics).toContain('TRIGGER:-PT0M');
    expect(ics).toContain('DTSTAMP:20261104T080000Z');
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true);
  });
  it('spec004_US1_5_description_has_amount_note_and_url', () => {
    const unfolded = ics.replace(/\r\n /g, '');
    expect(unfolded).toContain('Give about 1.7 L.');
    expect(unfolded).toContain('https://example.github.io/plant-pilot/');
  });
  it('spec004_edge_lines_folded_at_75_octets', () => {
    for (const line of ics.split('\r\n')) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    const folded = foldLine('DESCRIPTION:' + 'æ'.repeat(80));
    for (const l of folded.split('\r\n')) expect(new TextEncoder().encode(l).length).toBeLessThanOrEqual(75);
    expect(folded.replace(/\r\n /g, '')).toBe('DESCRIPTION:' + 'æ'.repeat(80));
  });
  it('spec004_edge_escape_text', () => {
    expect(escapeText('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne');
  });
});

describe('spec004 outlook link and fingerprint', () => {
  it('spec004_US2_2_work_and_personal_hosts', () => {
    const args = { subject: 'Water Monstera (1.7 L)', body: 'Give about 1.7 L', date: '2026-11-04', time: '09:00' };
    const work = new URL(outlookComposeUrl({ ...args, account: 'work' }));
    expect(work.host).toBe('outlook.office.com');
    expect(work.searchParams.get('subject')).toBe('Water Monstera (1.7 L)');
    expect(work.searchParams.get('startdt')).toBe('2026-11-04T09:00:00');
    expect(work.searchParams.get('enddt')).toBe('2026-11-04T09:15:00');
    expect(new URL(outlookComposeUrl({ ...args, account: 'personal' })).host).toBe('outlook.live.com');
  });
  it('spec004_FR005_fingerprint_changes_with_schedule', () => {
    const a = calendarFingerprint([{ plantId: 'p1', nextDue: '2026-11-04', interval: 6, amountMl: 1700 }], '09:00');
    const b = calendarFingerprint([{ plantId: 'p1', nextDue: '2026-11-05', interval: 6, amountMl: 1700 }], '09:00');
    expect(a).not.toBe(b);
    expect(calendarFingerprint([{ plantId: 'p1', nextDue: '2026-11-04', interval: 6, amountMl: 1700 }], '09:00')).toBe(a);
  });
});
