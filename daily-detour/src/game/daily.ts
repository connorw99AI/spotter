import type { PuzzleDef } from '../core/types';
import { DAILY_BANDS, DAILY_CODES, DAILY_START } from '../data/dailies';

/** Daily #1 was 1 January 2026 (UTC). */
export const DAILY_EPOCH_MS = Date.UTC(2026, 0, 1);
const DAY_MS = 86_400_000;

/**
 * The daily challenge rotates through these hand-made puzzles in a fixed order,
 * mixing difficulty. Everyone gets the same puzzle on the same UTC date.
 */
export const DAILY_ROTATION: readonly string[] = [
  'corner-shop-shuffle', 'wren-close', 'sunday-scoops', 'full-basket-fresh-ice', 'ring-road', 'the-grand-detour',
  'roadworks-on-rye', 'over-the-bridge', 'picnic-hamper', 'market-day', 'roundabout-rounds', 'melting-point',
  'basket-case', 'old-town-blooms', 'cul-de-sac-crescent', 'harbour-lights', 'the-long-way-home',
];

/** 'YYYY-MM-DD' for the UTC calendar day containing `d`. */
export function utcDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function parseDateKey(key: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const [y, m, d] = key.split('-').map(Number);
  const t = Date.UTC(y, m - 1, d);
  return utcDateKey(new Date(t)) === key ? t : null;
}

/** Daily number for a date: 1 on the epoch day. */
export function dailyNumber(key: string): number {
  const t = parseDateKey(key);
  if (t === null) throw new Error(`bad date ${key}`);
  return Math.floor((t - DAILY_EPOCH_MS) / DAY_MS) + 1;
}

/**
 * Which puzzle is the daily for a UTC date. Up to 8 November 2026 the daily rotated
 * through the classic routes; from 9 November 2026 each day has its own generated,
 * solver-checked puzzle, 365 in all, after which the year repeats.
 */
export function dailyPuzzleId(key: string): string {
  const t = parseDateKey(key);
  const start = parseDateKey(DAILY_START)!;
  if (t === null) throw new Error(`bad date ${key}`);
  if (t < start) {
    const n = dailyNumber(key);
    const len = DAILY_ROTATION.length;
    return DAILY_ROTATION[(((n - 1) % len) + len) % len];
  }
  const i = Math.floor((t - start) / DAY_MS) % DAILY_CODES.length;
  return `daily-${String(i + 1).padStart(3, '0')}`;
}

export type DailyPace = 'gentle' | 'steady' | 'tricky';

/** The week's rhythm: gentle Monday and Tuesday, steady midweek, tricky at the weekend. */
export function dailyPace(key: string): DailyPace | null {
  const t = parseDateKey(key);
  const start = parseDateKey(DAILY_START)!;
  if (t === null || t < start) return null;
  const i = Math.floor((t - start) / DAY_MS) % DAILY_CODES.length;
  return ({ e: 'gentle', m: 'steady', h: 'tricky' } as const)[DAILY_BANDS[i] as 'e' | 'm' | 'h'];
}

/** Last date with a daily puzzle nobody has seen before. */
export function lastFreshDaily(): string {
  return utcDateKey(new Date(parseDateKey(DAILY_START)! + (DAILY_CODES.length - 1) * DAY_MS));
}

export function dailyPuzzle(key: string, get: (id: string) => PuzzleDef | undefined): PuzzleDef {
  const p = get(dailyPuzzleId(key));
  if (!p) throw new Error('daily schedule references an unknown puzzle');
  return p;
}

/** Milliseconds until the next UTC midnight. */
export function msUntilNextUtcDay(now: Date): number {
  const t = now.getTime();
  return DAY_MS - (t % DAY_MS);
}
