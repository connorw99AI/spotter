import { describe, expect, it } from 'vitest';
import { getPuzzle } from '../src/data/catalog';
import { DAILY_ROTATION, dailyNumber, dailyPuzzle, dailyPuzzleId, msUntilNextUtcDay, parseDateKey, utcDateKey } from '../src/game/daily';

describe('daily selection (UTC)', () => {
  it('keys days by the UTC calendar date, not local time', () => {
    // 23:30 on 7 Nov in UTC-8 is already 8 Nov in UTC.
    expect(utcDateKey(new Date('2026-11-08T07:30:00Z'))).toBe('2026-11-08');
    expect(utcDateKey(new Date('2026-11-07T23:59:59.999Z'))).toBe('2026-11-07');
    expect(utcDateKey(new Date('2026-11-08T00:00:00Z'))).toBe('2026-11-08');
  });

  it('numbers days from the epoch', () => {
    expect(dailyNumber('2026-01-01')).toBe(1);
    expect(dailyNumber('2026-01-02')).toBe(2);
    expect(dailyNumber('2027-01-01')).toBe(366);
  });

  it('gives everyone the same puzzle for a date and rotates through all of them', () => {
    expect(dailyPuzzleId('2026-11-08')).toBe(dailyPuzzleId('2026-11-08'));
    const seen = new Set<string>();
    for (let i = 0; i < DAILY_ROTATION.length; i++) {
      seen.add(dailyPuzzleId(utcDateKey(new Date(Date.UTC(2026, 3, 1 + i)))));
    }
    expect(seen.size).toBe(DAILY_ROTATION.length);
    expect(dailyPuzzleId('2026-01-01')).toBe(DAILY_ROTATION[0]);
    expect(dailyPuzzle('2026-01-01', getPuzzle).id).toBe(DAILY_ROTATION[0]);
  });

  it('handles dates before the epoch without crashing', () => {
    expect(DAILY_ROTATION).toContain(dailyPuzzleId('2025-12-31'));
  });

  it('rejects malformed date keys', () => {
    expect(parseDateKey('2026-02-30')).toBeNull();
    expect(parseDateKey('yesterday')).toBeNull();
    expect(() => dailyNumber('nope')).toThrow();
  });

  it('counts down to the next UTC midnight', () => {
    expect(msUntilNextUtcDay(new Date('2026-11-08T23:59:00Z'))).toBe(60_000);
  });
});
