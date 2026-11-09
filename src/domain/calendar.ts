// Calendar reminders (spec 004). Pure: no clock reads, no DOM.
import { CALENDAR_EVENT_MINUTES } from './config';
import { addDays, compactDate } from './dates';
import { effectiveIntervalDays, formatAmount, seasonOf, waterAmountMl } from './watering';
import type { DateKey, LightLevel, PlantType } from './types';

export interface PlannedWatering { date: DateKey; amountMl: number }

interface PlanPlant { id: string; name: string; spotLight: LightLevel; potDiameterCm: number }

/**
 * Planned waterings from `nextDue` (or today, if overdue) up to today + horizonDays.
 * Assumes each watering happens on its due date; each step uses the season of that date (FR-002).
 */
export function planWaterings(type: PlantType, plant: PlanPlant, nextDue: DateKey, today: DateKey, horizonDays: number): PlannedWatering[] {
  const end = addDays(today, horizonDays);
  const out: PlannedWatering[] = [];
  let d = nextDue < today ? today : nextDue;
  while (d <= end) {
    const season = seasonOf(d);
    out.push({ date: d, amountMl: waterAmountMl(type, plant.potDiameterCm, plant.spotLight, season) });
    d = addDays(d, effectiveIntervalDays(type, plant.spotLight, season));
  }
  return out;
}

export function escapeText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Folds a content line at 75 octets (RFC 5545 3.1) without splitting UTF-8 characters. */
export function foldLine(line: string): string {
  const enc = new TextEncoder();
  const parts: string[] = [];
  let current = '';
  let bytes = 0;
  let limit = 75;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    if (bytes + n > limit) {
      parts.push(current);
      current = '';
      bytes = 0;
      limit = 74; // continuation lines start with a space
    }
    current += ch;
    bytes += n;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

const hhmmss = (time: string) => `${time.replace(':', '')}00`;

function utcStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export function eventTitle(name: string, amountMl: number): string {
  return `Water ${name} (${formatAmount(amountMl)})`;
}

export function eventBody(amountMl: number, careNote: string, appUrl: string): string {
  return `Give about ${formatAmount(amountMl)}. ${careNote}\nTap the plant in Plant Watering when done: ${appUrl}`;
}

export interface CalendarPlant { plantId: string; name: string; careNote: string; waterings: PlannedWatering[] }

export function buildIcs(plants: CalendarPlant[], opts: { time: string; appUrl: string; generatedAt: Date }): string {
  const end = addMinutes(opts.time, CALENDAR_EVENT_MINUTES);
  const stamp = utcStamp(opts.generatedAt);
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Plant Pilot//Watering reminders//EN', 'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH', 'X-WR-CALNAME:Plant watering',
  ];
  for (const p of plants) {
    for (const w of p.waterings) {
      const day = compactDate(w.date);
      const title = eventTitle(p.name, w.amountMl);
      lines.push(
        'BEGIN:VEVENT',
        `UID:${p.plantId}-${day}@plant-pilot`,
        `DTSTAMP:${stamp}`,
        // Floating local time: Outlook shows it at this clock time in the user's own time zone.
        `DTSTART:${day}T${hhmmss(opts.time)}`,
        `DTEND:${day}T${hhmmss(end)}`,
        `SUMMARY:${escapeText(title)}`,
        `DESCRIPTION:${escapeText(eventBody(w.amountMl, p.careNote, opts.appUrl))}`,
        'TRANSP:TRANSPARENT',
        'CATEGORIES:Plants',
        'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escapeText(title)}`, 'TRIGGER:-PT0M', 'END:VALARM',
        'END:VEVENT',
      );
    }
  }
  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

export type OutlookAccount = 'work' | 'personal';

export function outlookComposeUrl(a: { account: OutlookAccount; subject: string; body: string; date: DateKey; time: string }): string {
  const host = a.account === 'work' ? 'https://outlook.office.com' : 'https://outlook.live.com';
  const url = new URL(`${host}/calendar/0/deeplink/compose`);
  url.searchParams.set('path', '/calendar/action/compose');
  url.searchParams.set('rru', 'addevent');
  url.searchParams.set('subject', a.subject);
  url.searchParams.set('body', a.body);
  url.searchParams.set('startdt', `${a.date}T${a.time}:00`);
  url.searchParams.set('enddt', `${a.date}T${addMinutes(a.time, CALENDAR_EVENT_MINUTES)}:00`);
  return url.toString();
}

export interface FingerprintInput { plantId: string; nextDue: DateKey; interval: number; amountMl: number }

export function calendarFingerprint(items: FingerprintInput[], time: string): string {
  return [time, ...[...items].sort((a, b) => a.plantId.localeCompare(b.plantId))
    .map((i) => `${i.plantId}:${i.nextDue}:${i.interval}:${i.amountMl}`)].join('|');
}
