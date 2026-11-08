import { describe, expect, it } from 'vitest';
import { analyse } from '../src/core/analysis';
import { isWinningRoute, simulate } from '../src/core/rules';
import { solvePuzzle } from '../src/core/solver';
import { buildTown } from '../src/core/town';
import { validatePuzzle } from '../src/core/validate';
import { PUZZLES } from '../src/data/puzzles';
import { DAILY_ROTATION } from '../src/game/daily';

describe('authored content', () => {
  it('has 20 puzzles: 3 tutorial, 5 approachable, 8 intermediate, 4 challenging', () => {
    const count = (t: string) => PUZZLES.filter((p) => p.tier === t).length;
    expect(PUZZLES).toHaveLength(20);
    expect([count('tutorial'), count('approachable'), count('intermediate'), count('challenging')]).toEqual([3, 5, 8, 4]);
    expect(PUZZLES.map((p) => p.number)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });

  it('uses unique, stable identifiers and positive revisions', () => {
    expect(new Set(PUZZLES.map((p) => p.id)).size).toBe(20);
    for (const p of PUZZLES) {
      expect(p.id).toMatch(/^[a-z0-9-]+$/);
      expect(p.rev).toBeGreaterThanOrEqual(1);
    }
  });

  it('introduces each mechanic once, in the intended order', () => {
    const intro = PUZZLES.filter((p) => p.introduces).map((p) => [p.number, p.introduces]);
    expect(intro).toEqual([[1, 'basic'], [3, 'multi'], [5, 'closure'], [6, 'fresh'], [9, 'oneway'], [11, 'capacity']]);
    // No puzzle uses a mechanic before it has been introduced.
    const firstUse = new Map(intro.map(([n, m]) => [m, n as number]));
    for (const p of PUZZLES) {
      if (p.edges.some((e) => e.closed)) expect(p.number).toBeGreaterThanOrEqual(firstUse.get('closure')!);
      if (p.edges.some((e) => e.oneWay)) expect(p.number).toBeGreaterThanOrEqual(firstUse.get('oneway')!);
      if (p.orders.some((o) => o.fresh)) expect(p.number).toBeGreaterThanOrEqual(firstUse.get('fresh')!);
      if (p.capacity !== undefined) expect(p.number).toBeGreaterThanOrEqual(firstUse.get('capacity')!);
    }
  });

  it('declares exactly the mechanics each map actually uses', () => {
    for (const p of PUZZLES) {
      const uses = {
        closure: p.edges.some((e) => e.closed),
        oneway: p.edges.some((e) => e.oneWay),
        fresh: p.orders.some((o) => o.fresh !== undefined),
        capacity: p.capacity !== undefined,
      };
      for (const [m, used] of Object.entries(uses)) expect(p.mechanics.includes(m as never), `${p.id} ${m}`).toBe(used);
    }
  });

  it('daily rotation covers every non-tutorial puzzle exactly once', () => {
    const nonTutorial = PUZZLES.filter((p) => p.tier !== 'tutorial').map((p) => p.id).sort();
    expect([...DAILY_ROTATION].sort()).toEqual(nonTutorial);
  });

  for (const p of PUZZLES) {
    describe(`#${p.number} ${p.title}`, () => {
      it('is structurally and visually valid', () => {
        expect(validatePuzzle(p)).toEqual([]);
      });

      it('is solvable, and its gold target equals the solver optimum', () => {
        const town = buildTown(p);
        const sol = solvePuzzle(town);
        expect(sol).not.toBeNull();
        expect(sol!.moves).toBe(p.gold);
        // The solver's route is accepted by the same rules gameplay uses.
        expect(isWinningRoute(town, sol!.route)).toBe(true);
        expect(simulate(town, sol!.route).failure).toBeUndefined();
      });

      it('makes every rule it uses matter', () => {
        // Removing a constraint must change the answer — a different optimum, or a
        // different set of optimal routes (the rule rules out a shortcut). Otherwise it is decoration.
        const r = analyse(p);
        for (const [rule, relaxedMoves] of Object.entries(r.relaxedOptimal)) {
          const relaxedCount = r.relaxedRoutes[rule as keyof typeof r.relaxedRoutes];
          const changed = relaxedMoves !== r.optimal || relaxedCount !== r.optimalRoutes;
          expect(changed, `${rule} should shape the solution`).toBe(true);
        }
      });

      it('has a short, useful brief and hint', () => {
        expect(p.title.length).toBeLessThanOrEqual(24);
        expect(p.brief.length).toBeGreaterThan(10);
        expect(p.brief.length).toBeLessThanOrEqual(110);
        expect(p.hint.length).toBeGreaterThan(20);
      });
    });
  }

  it('non-tutorial puzzles reward planning over grabbing the nearest job', () => {
    for (const p of PUZZLES.filter((q) => q.tier !== 'tutorial' && q.number > 3)) {
      const r = analyse(p);
      // Naive nearest-objective play is either longer than gold or breaks a rule.
      expect(r.greedy === null || r.greedy > r.optimal!, p.id).toBe(true);
    }
  });
});
