import { describe, expect, it } from 'vitest';
import { initialState, isWinningRoute, simulate } from '../src/core/rules';
import { countOptimalRoutes, solveFrom, solvePuzzle, stateKey } from '../src/core/solver';
import { buildTown } from '../src/core/town';
import { advise } from '../src/game/advisor';
import { line, mk } from './helpers';

describe('solver', () => {
  it('finds the shortest route, and that route wins under the gameplay rules', () => {
    const town = buildTown(mk({ ...line, shops: { d: 'florist' }, houses: { b: 'A' }, orders: [['d', 'b']] }));
    const sol = solvePuzzle(town)!;
    expect(sol.moves).toBe(8);
    expect(isWinningRoute(town, sol.route)).toBe(true);
  });

  it('accounts for freshness: refuses plans that would melt the order', () => {
    // Ice cream at a, house at d (3 streets away). Limit 2 makes it impossible.
    const impossible = buildTown(mk({ ...line, shops: { a: 'icecream' }, houses: { d: 'A' }, orders: [['a', 'd', 2]] }));
    expect(solvePuzzle(impossible)).toBeNull();
    const possible = buildTown(mk({ ...line, shops: { a: 'icecream' }, houses: { d: 'A' }, orders: [['a', 'd', 3]] }));
    expect(solvePuzzle(possible)?.moves).toBe(8);
  });

  it('accounts for capacity by revisiting a shop', () => {
    const town = buildTown(mk({
      ...line, capacity: 1,
      shops: { a: 'bakery', b: 'florist' }, houses: { c: 'A', d: 'B' },
      orders: [['a', 'd'], ['b', 'c']],
    }));
    const sol = solvePuzzle(town)!;
    expect(isWinningRoute(town, sol.route)).toBe(true);
    // Unlimited would be D a b c d c b a D = 8; with one slot the courier needs extra legs.
    expect(sol.moves).toBeGreaterThan(8);
  });

  it('honours one-way streets and closures', () => {
    const town = buildTown(mk({
      nodes: { D: [0, 0], a: [1, 0], b: [1, 1], c: [0, 1] }, streets: 'D>a-b-c#D c-a',
      shops: { a: 'bakery' }, houses: { b: 'A' }, orders: [['a', 'b']],
    }));
    // D>a only; c#D closed: there is no way home.
    expect(solvePuzzle(town)).toBeNull();
  });

  it('ignores the ages of orders that do not spoil (pruning) but not of those that do', () => {
    const town = buildTown(mk({ ...line, shops: { a: 'icecream', b: 'bakery' }, houses: { c: 'A', d: 'B' }, orders: [['a', 'c', 5], ['b', 'd']] }));
    const s = simulate(town, ['D', 'a', 'b', 'a', 'b']).states;
    expect(stateKey(town, s[2])).not.toBe(stateKey(town, s[4]));
    const plain = buildTown(mk({ ...line, shops: { a: 'bakery' }, houses: { c: 'A' }, orders: [['a', 'c']] }));
    const p = simulate(plain, ['D', 'a', 'b', 'a', 'b']).states;
    expect(stateKey(plain, p[2])).toBe(stateKey(plain, p[4]));
  });

  it('agrees with an exhaustive search on a small town', () => {
    const town = buildTown(mk({
      nodes: { D: [0, 0], a: [1, 0], b: [2, 0], c: [0, 1], d: [1, 1], e: [2, 1] },
      streets: 'D-a-b c-d-e D-c a-d b-e', capacity: 1,
      shops: { b: 'bakery', c: 'icecream' }, houses: { e: 'A', a: 'B' },
      orders: [['b', 'e'], ['c', 'a', 2]],
    }));
    const opt = solvePuzzle(town)!.moves;
    // Brute force every route up to opt moves.
    let best = Infinity;
    const walk = (route: string[]) => {
      if (route.length - 1 > opt) return;
      if (isWinningRoute(town, route)) best = Math.min(best, route.length - 1);
      for (const v of town.succ.get(route[route.length - 1])!) walk([...route, v]);
    };
    walk(['D']);
    expect(best).toBe(opt);
    expect(countOptimalRoutes(town)?.moves).toBe(opt);
  });

  it('solves from mid-route states consistently with the full solve', () => {
    const town = buildTown(mk({ ...line, shops: { d: 'florist' }, houses: { b: 'A' }, orders: [['d', 'b']] }));
    const s = simulate(town, ['D', 'a', 'b']).states[2];
    expect(solveFrom(town, s)?.moves).toBe(6);
    expect(solveFrom(town, initialState(town))?.moves).toBe(8);
  });
});

describe('advisor (hints)', () => {
  const town = buildTown(mk({ ...line, shops: { a: 'icecream' }, houses: { c: 'A' }, orders: [['a', 'c', 2]] }));

  it('names the next objective from the player’s current route', () => {
    const a = advise(town, ['D'], 6);
    expect(a.status).toBe('ok');
    expect(a.next).toEqual({ kind: 'pickup', node: 'a', order: 0 });
    expect(a.path?.[0]).toBe('a');
    const b = advise(town, ['D', 'a'], 6);
    expect(b.next).toEqual({ kind: 'deliver', node: 'c', order: 0 });
  });

  it('detects a doomed route, explains why, and offers how many moves to keep', () => {
    // Pick up, wander back to D: 2 moves used of 2 with c still 3 away.
    const a = advise(town, ['D', 'a', 'D'], 6);
    expect(a.status).toBe('doomed');
    expect(a.reason).toEqual({ type: 'spoil', order: 0 });
    expect(a.undoTo).toBe(1);
  });

  it('points back to a gold route when the current one cannot reach gold', () => {
    const t = buildTown(mk({ ...line, shops: { b: 'bakery' }, houses: { a: 'A' }, orders: [['b', 'a']] }));
    const a = advise(t, ['D', 'a', 'D', 'a'], 4);
    expect(a.status).toBe('ok');
    expect(a.goldUndoTo).toBe(1);
  });

  it('reports a complete route', () => {
    const a = advise(town, ['D', 'a', 'b', 'c', 'b', 'a', 'D'], 6);
    expect(a.status).toBe('complete');
  });
});
