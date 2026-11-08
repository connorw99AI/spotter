import { PUZZLE_BY_ID } from '../data/puzzles';
import { dailyPuzzleId, parseDateKey, utcDateKey } from '../game/daily';
import type { Route } from './appTypes';

/**
 * Plain hash names only (letters, digits, hyphens): they survive being embedded
 * in hosts that strip path-like fragments.
 */
export function routeToHash(r: Route): string {
  switch (r.screen) {
    case 'home': return '#town';
    case 'book': return '#book';
    case 'settings': return '#game-settings';
    case 'how': return '#how-to-play';
    case 'play': return r.mode === 'daily' ? `#daily-${r.dateKey}` : `#route-${r.puzzleId}`;
  }
}

/** Parse a location hash. Daily links only open today's or yesterday's route (UTC). */
export function hashToRoute(hash: string, now = new Date()): Route {
  const h = hash.replace(/^#\/?/, '');
  if (h === 'book') return { screen: 'book' };
  if (h === 'game-settings') return { screen: 'settings' };
  if (h === 'how-to-play') return { screen: 'how' };
  if (h.startsWith('route-') && PUZZLE_BY_ID.has(h.slice(6))) return { screen: 'play', puzzleId: h.slice(6), mode: 'practice' };
  if (h.startsWith('daily-')) {
    const key = h.slice(6);
    const today = utcDateKey(now);
    const yesterday = utcDateKey(new Date(now.getTime() - 86_400_000));
    if (parseDateKey(key) !== null && (key === today || key === yesterday)) {
      return { screen: 'play', puzzleId: dailyPuzzleId(key), mode: 'daily', dateKey: key };
    }
  }
  return { screen: 'home' };
}

