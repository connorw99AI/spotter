import { describe, expect, it } from 'vitest';
import { solvePuzzle } from '../src/core/solver';
import { buildTown } from '../src/core/town';
import { PUZZLE_BY_ID } from '../src/data/puzzles';
import { getPuzzle } from '../src/data/catalog';
import { cleverMoments } from '../src/game/clever';

const gold = (id: string) => {
  const p = PUZZLE_BY_ID.get(id) ?? getPuzzle(id)!;
  const t = buildTown(p);
  return { t, route: solvePuzzle(t)!.route, p };
};

describe('clever moments', () => {
  it('names the full-basket trick on Full Basket, Fresh Ice', () => {
    const { t, route, p } = gold('full-basket-fresh-ice');
    const m = cleverMoments(t, route, p.gold);
    expect(m[0].kind).toBe('full-pass');
    expect(m[0].text).toContain('full basket');
  });

  it('notices just-in-time deliveries and beating nearest-first', () => {
    const { t, route, p } = gold('melting-point');
    const kinds = cleverMoments(t, route, p.gold).map((m) => m.kind);
    expect(kinds).toContain('just-in-time');
    expect(kinds).toContain('beat-naive');
  });

  it('celebrates gates, opening times and smooth detours in their chapters', () => {
    for (const [id, kind] of [['round-the-green-01', 'gate'], ['old-quarter-01', 'smooth']] as const) {
      const { t, route, p } = gold(id);
      const kinds = cleverMoments(t, route, p.gold).map((m) => m.kind);
      expect(kinds, id).toContain(kind);
    }
  });

  it('says nothing about routes that break the rules', () => {
    const { t, p } = gold('morning-loaves');
    expect(cleverMoments(t, ['D', 'K'], p.gold)).toEqual([]);
  });
});
