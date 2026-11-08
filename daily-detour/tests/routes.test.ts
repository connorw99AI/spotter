import { describe, expect, it } from 'vitest';
import { hashToRoute, routeToHash } from '../src/ui/routes';

describe('screen links', () => {
  const now = new Date('2026-11-08T10:00:00Z');

  it('round-trips every screen through a plain hash name', () => {
    for (const r of [
      { screen: 'home' }, { screen: 'book' }, { screen: 'settings' }, { screen: 'how' },
      { screen: 'play', puzzleId: 'ring-road', mode: 'practice' },
    ] as const) {
      const hash = routeToHash(r);
      expect(hash).toMatch(/^#[a-z0-9-]+$/);
      expect(hash).not.toBe('#settings'); // reserved by some hosts
      expect(hashToRoute(hash, now)).toEqual(r);
    }
  });

  it('opens today’s and yesterday’s daily only, with the puzzle fixed by the date', () => {
    expect(hashToRoute('#daily-2026-11-08', now)).toMatchObject({ screen: 'play', mode: 'daily', dateKey: '2026-11-08' });
    expect(hashToRoute('#daily-2026-11-07', now)).toMatchObject({ mode: 'daily', dateKey: '2026-11-07' });
    expect(hashToRoute('#daily-2026-11-01', now)).toEqual({ screen: 'home' });
    expect(hashToRoute('#daily-2026-02-30', now)).toEqual({ screen: 'home' });
  });

  it('falls back home for unknown or malformed links', () => {
    expect(hashToRoute('', now)).toEqual({ screen: 'home' });
    expect(hashToRoute('#route-nope', now)).toEqual({ screen: 'home' });
    expect(hashToRoute('#/route/ring-road', now)).toEqual({ screen: 'home' });
  });
});
