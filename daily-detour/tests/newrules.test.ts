import { describe, expect, it } from 'vitest';
import { analyse } from '../src/core/analysis';
import { isWinningRoute, simulate, tryStep, initialState } from '../src/core/rules';
import { solvePuzzle } from '../src/core/solver';
import { buildTown } from '../src/core/town';
import { validatePuzzle } from '../src/core/validate';
import { decodePuzzle, encodePuzzle } from '../src/data/codec';
import { advise } from '../src/game/advisor';
import { line, mk } from './helpers';

describe('opening hours', () => {
  // Bakery at a opens at move 3: passing at move 1 collects nothing.
  const def = mk({ ...line, shops: { a: 'bakery' }, houses: { c: 'A' }, orders: [['a', 'c']] });
  def.shops[0].opensAt = 3;
  const town = buildTown(def);

  it('keeps the order at the shop until it opens, and says so', () => {
    const sim = simulate(town, ['D', 'a']);
    expect(sim.events[1]).toEqual([{ type: 'closed', order: 0, opensAt: 3 }]);
    expect(sim.states[1].orders[0].status).toBe(0);
  });

  it('serves the order from the opening move onwards', () => {
    const sim = simulate(town, ['D', 'a', 'D', 'a']);
    expect(sim.events[3]).toContainEqual({ type: 'pickup', order: 0 });
  });

  it('the solver waits it out by the shortest loop', () => {
    const sol = solvePuzzle(town)!;
    // Arrive at move 3 at the earliest: D a b a (3), then a→c (2), then home (3) = 8.
    expect(sol.moves).toBe(8);
    expect(isWinningRoute(town, sol.route)).toBe(true);
    expect(analyse(def).relaxedOptimal.hours).toBe(6);
  });
});

describe('garden gates', () => {
  // A square D-a-b-c-D with a lane D~b gated by House A at a.
  const def = mk({
    nodes: { D: [0, 0], a: [1, 0], b: [1, 1], c: [0, 1] }, streets: 'D-a-b-c-D D~b',
    shops: { c: 'florist' }, houses: { a: 'A', b: 'B' }, orders: [['c', 'a'], ['c', 'b']],
  });
  def.edges.find((e) => e.a === 'D' && e.b === 'b')!.gate = 'a';
  const town = buildTown(def);

  it('stays shut until the house has had its delivery', () => {
    expect(tryStep(town, initialState(town), 'b')).toMatchObject({ ok: false, reason: { type: 'gate', house: 'a' } });
  });

  it('opens once the house is delivered', () => {
    const sim = simulate(town, ['D', 'c', 'D', 'a', 'D', 'b']);
    expect(sim.failure).toBeUndefined();
    expect(sim.events[5]).toContainEqual({ type: 'deliver', order: 1, age: 4 });
  });
});

describe('cobbles and fragile orders', () => {
  // Two ways from a to c: cobbled a#b... straight a-b-c is cobbled; detour a-x-y-c is smooth.
  const def = mk({
    nodes: { D: [0, 0], a: [1, 0], b: [2, 0], c: [3, 0], x: [1, 1], y: [3, 1] }, streets: 'D-a-b-c a-x-y-c',
    shops: { a: 'bakery' }, houses: { c: 'A' }, orders: [['a', 'c']],
  });
  def.orders[0].fragile = true;
  def.edges.find((e) => e.a === 'b' && e.b === 'c')!.cobbles = true;
  const town = buildTown(def);

  it('refuses cobbles while carrying something fragile, and allows them otherwise', () => {
    const atB = simulate(town, ['D', 'a', 'b']).states[2];
    expect(tryStep(town, atB, 'c')).toMatchObject({ ok: false, reason: { type: 'cobbles', order: 0 } });
    const after = simulate(town, ['D', 'a', 'x', 'y', 'c', 'b']).failure;
    expect(after).toBeUndefined();
  });

  it('the solver takes the smooth way round', () => {
    // D a x y c with the cake, then home over the cobbles once it's delivered: 7.
    expect(solvePuzzle(town)!.moves).toBe(7);
    expect(analyse(def).relaxedOptimal.fragile).toBe(6);
  });

  it('explains a route that can no longer reach the house smoothly', () => {
    // Carrying the cake at b: the only smooth way is back through a.
    const a = advise(town, ['D', 'a', 'b'], 8);
    expect(a.status).toBe('ok');
  });
});

describe('codec and validation for new rules', () => {
  it('round-trips hours, gates, cobbles and fragile', () => {
    const def = mk({ ...line, shops: { a: 'bakery' }, houses: { c: 'A' }, orders: [['a', 'c']] });
    def.shops[0].opensAt = 4;
    def.orders[0].fragile = true;
    def.edges[1].cobbles = true;
    def.edges[2].gate = 'c';
    const back = decodePuzzle(encodePuzzle(def), { id: 'x', number: 1, tier: 'intermediate' });
    expect(back.shops[0].opensAt).toBe(4);
    expect(back.orders[0].fragile).toBe(true);
    expect(back.edges[1].cobbles).toBe(true);
    expect(back.edges[2].gate).toBe('n3');
    expect(back.mechanics).toEqual(expect.arrayContaining(['hours', 'gate', 'fragile']));
  });

  it('rejects a gate that names a non-house', () => {
    const def = mk({ ...line, shops: { a: 'bakery' }, houses: { c: 'A' }, orders: [['a', 'c']] });
    def.edges[0].gate = 'a';
    expect(validatePuzzle(def).some((e) => e.includes('gate'))).toBe(true);
  });
});
