import { describe, expect, it } from 'vitest';
import { BOOK_IDS, getPuzzle } from '../src/data/catalog';
import { DAILY_CODES } from '../src/data/dailies';
import { REQUEST_IDS } from '../src/data/neighbours';
import { initialState, isComplete, tryStep, type GameState } from '../src/core/rules';
import { buildTown, type Town } from '../src/core/town';
import { medalFor, thresholds } from '../src/core/medals';

/**
 * An independent check on every map's gold target. It doesn't use the solver:
 * it tries every legal move with the same rule function the game uses when you
 * draw a route, breadth first, and reports the fewest moves that complete the
 * round (everything delivered and back home) under all of that map's rules.
 */
function fewestMoves(town: Town, limit: number): number | null {
  const next = new Map<string, string[]>();
  for (const e of town.def.edges) {
    next.set(e.a, [...(next.get(e.a) ?? []), e.b]);
    next.set(e.b, [...(next.get(e.b) ?? []), e.a]);
  }
  // Opening hours depend on the move count itself; everything else on what's carried and for how long.
  const timed = town.def.shops.some((s) => s.opensAt !== undefined);
  const key = (s: GameState) => `${s.node}|${s.orders.map((o) => `${o.status}${o.status === 1 ? `:${s.moves - o.pickedAt}` : ''}`).join(',')}${timed ? `|${s.moves}` : ''}`;
  let frontier: GameState[] = [initialState(town)];
  const seen = new Set(frontier.map(key));
  for (let depth = 0; depth <= limit; depth++) {
    if (frontier.some((s) => s.moves > 0 && isComplete(town, s))) return depth;
    const out: GameState[] = [];
    for (const s of frontier) {
      for (const v of next.get(s.node) ?? []) {
        const r = tryStep(town, s, v);
        if (!r.ok) continue;
        const k = key(r.state);
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(r.state);
      }
    }
    frontier = out;
  }
  return null;
}

const ALL = [...BOOK_IDS, ...DAILY_CODES.map((_, i) => `daily-${String(i + 1).padStart(3, '0')}`), ...REQUEST_IDS];

describe('gold targets', () => {
  it(`are exactly the fewest moves for all ${ALL.length} maps, rules included`, () => {
    const wrong: string[] = [];
    for (const id of ALL) {
      const p = getPuzzle(id)!;
      const best = fewestMoves(buildTown(p), p.gold + 1);
      if (best !== p.gold) wrong.push(`${id}: gold says ${p.gold}, the rules allow ${best ?? 'no finish'}`);
    }
    expect(wrong).toEqual([]);
  });
});

describe('the audit itself', () => {
  it('counts roadworks: reopening closed streets makes many maps shorter than their gold', () => {
    let blocked = 0, shorterWhenOpened = 0;
    for (const id of ALL) {
      const p = getPuzzle(id)!;
      if (!p.edges.some((e) => e.closed)) continue;
      blocked++;
      const opened = { ...p, id: `${p.id}-opened`, edges: p.edges.map((e) => ({ ...e, closed: false })) };
      const best = fewestMoves(buildTown(opened), p.gold);
      if (best !== null && best < p.gold) shorterWhenOpened++;
    }
    expect(blocked).toBeGreaterThan(20);
    expect(shorterWhenOpened).toBeGreaterThan(0);
  });

  it('would catch a gold target that is too low or too high', () => {
    const p = getPuzzle(BOOK_IDS[10])!;
    expect(fewestMoves(buildTown(p), p.gold + 1)).toBe(p.gold);
    expect(fewestMoves(buildTown(p), p.gold - 1)).toBeNull();
  });
});

describe('stamps', () => {
  it('gold is the fewest moves, silver one over, bronze two or three over, longer fails', () => {
    const t = thresholds(10);
    expect([9, 10, 11, 12, 13, 14, 20].map((m) => medalFor(m, t))).toEqual(['gold', 'gold', 'silver', 'bronze', 'bronze', null, null]);
  });
});
