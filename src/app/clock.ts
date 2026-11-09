import type { Clock } from '../domain/types';

/** The one place that reads the system clock (Constitution V). */
export const systemClock: Clock = { now: () => new Date() };

export function fixedClock(iso: string): Clock {
  return { now: () => new Date(iso) };
}
