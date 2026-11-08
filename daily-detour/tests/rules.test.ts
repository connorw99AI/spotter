import { describe, expect, it } from 'vitest';
import { freshLeft, initialState, isComplete, isWinningRoute, simulate, tryStep, type GameState } from '../src/core/rules';
import { buildTown } from '../src/core/town';
import { line, mk } from './helpers';

function walk(town: ReturnType<typeof buildTown>, route: string[]) {
  const sim = simulate(town, route);
  if (sim.failure) throw new Error(`step ${sim.failure.index} blocked: ${sim.failure.reason.type}`);
  return sim;
}

describe('movement', () => {
  const town = buildTown(mk({ ...line, shops: { b: 'bakery' }, houses: { d: 'A' }, orders: [['b', 'd']] }));

  it('allows riding to a neighbouring corner and counts one move per street', () => {
    const r = tryStep(town, initialState(town), 'a');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.state).toMatchObject({ node: 'a', moves: 1 });
  });

  it('rejects corners that are not joined by a street', () => {
    const r = tryStep(town, initialState(town), 'b');
    expect(r).toEqual({ ok: false, reason: { type: 'no-street', from: 'D', to: 'b' } });
  });

  it('rejects a disconnected node and staying put', () => {
    expect(tryStep(town, initialState(town), 'z').ok).toBe(false);
    expect(tryStep(town, initialState(town), 'D').ok).toBe(false);
    expect(tryStep(town, initialState(town), 'nowhere').ok).toBe(false);
  });

  it('reports the first illegal step of a route', () => {
    const sim = simulate(town, ['D', 'a', 'c']);
    expect(sim.failure).toEqual({ index: 2, reason: { type: 'no-street', from: 'a', to: 'c' } });
    expect(sim.states).toHaveLength(2);
  });

  it('requires routes to start at the depot', () => {
    expect(simulate(town, ['a', 'b']).failure?.index).toBe(0);
  });
});

describe('closures and one-way streets', () => {
  const town = buildTown(mk({
    nodes: { D: [0, 0], a: [1, 0], b: [1, 1], c: [0, 1] },
    streets: 'D>a a#b b-c c-D',
    shops: { b: 'bakery' }, houses: { a: 'A' }, orders: [['b', 'a']],
  }));

  it('allows a one-way street in its direction only', () => {
    expect(tryStep(town, initialState(town), 'a').ok).toBe(true);
    const atA: GameState = { ...initialState(town), node: 'a' };
    expect(tryStep(town, atA, 'D')).toEqual({ ok: false, reason: { type: 'one-way', edge: 0 } });
  });

  it('blocks closed streets in both directions', () => {
    const atA: GameState = { ...initialState(town), node: 'a' };
    const atB: GameState = { ...initialState(town), node: 'b' };
    expect(tryStep(town, atA, 'b')).toEqual({ ok: false, reason: { type: 'closed', edge: 1 } });
    expect(tryStep(town, atB, 'a')).toEqual({ ok: false, reason: { type: 'closed', edge: 1 } });
  });

  it('leaves illegal streets out of the legal-move table', () => {
    expect(town.succ.get('a')).toEqual([]);
    expect(town.succ.get('D')).toEqual(['a', 'c']);
  });
});

describe('pickup before delivery', () => {
  const town = buildTown(mk({ ...line, shops: { d: 'florist' }, houses: { b: 'A' }, orders: [['d', 'b']] }));

  it('passing the destination first delivers nothing and says so', () => {
    const sim = walk(town, ['D', 'a', 'b']);
    expect(sim.events[2]).toEqual([{ type: 'early', order: 0 }]);
    expect(sim.states[2].orders[0].status).toBe(0);
  });

  it('delivers on a later visit once collected, reusing streets', () => {
    const sim = walk(town, ['D', 'a', 'b', 'c', 'd', 'c', 'b', 'a', 'D']);
    expect(sim.events[4]).toContainEqual({ type: 'pickup', order: 0 });
    expect(sim.events[6]).toContainEqual({ type: 'deliver', order: 0, age: 2 });
    expect(isComplete(town, sim.states[8])).toBe(true);
  });
});

describe('returning home', () => {
  const town = buildTown(mk({ ...line, shops: { a: 'bakery' }, houses: { b: 'A' }, orders: [['a', 'b']] }));

  it('is not complete until every order is delivered and the courier is home', () => {
    const sim = walk(town, ['D', 'a', 'D']);
    expect(sim.events[2]).toContainEqual({ type: 'home', complete: false });
    expect(isComplete(town, sim.states[2])).toBe(false);
  });

  it('is not complete when everything is delivered but the courier is away', () => {
    const sim = walk(town, ['D', 'a', 'b']);
    expect(isComplete(town, sim.states[2])).toBe(false);
  });

  it('completes on arriving home with everything delivered', () => {
    const sim = walk(town, ['D', 'a', 'b', 'a', 'D']);
    expect(sim.events[4]).toContainEqual({ type: 'home', complete: true });
    expect(isWinningRoute(town, ['D', 'a', 'b', 'a', 'D'])).toBe(true);
  });

  it('passing home mid-route does not end the round', () => {
    const t2 = buildTown(mk({ ...line, shops: { a: 'bakery' }, houses: { c: 'A' }, orders: [['a', 'c']] }));
    expect(isWinningRoute(t2, ['D', 'a', 'D', 'a', 'b', 'c', 'b', 'a', 'D'])).toBe(true);
    expect(isWinningRoute(t2, ['D', 'a', 'D', 'a', 'b', 'c'])).toBe(false);
  });
});

describe('capacity', () => {
  // Three shops in a row, all bound for d. Basket of two.
  const town = buildTown(mk({
    ...line, capacity: 2,
    shops: { a: 'bakery', b: 'florist', c: 'grocer' }, houses: { d: 'A' },
    orders: [['a', 'd'], ['b', 'd'], ['c', 'd']],
  }));

  it('leaves an order at the shop when the basket is full, and explains it', () => {
    const sim = walk(town, ['D', 'a', 'b', 'c']);
    expect(sim.events[3]).toEqual([{ type: 'full', order: 2 }]);
    expect(sim.states[3].orders[2].status).toBe(0);
  });

  it('allows collecting it on a later visit after freeing space', () => {
    const sim = walk(town, ['D', 'a', 'b', 'c', 'd', 'c', 'd']);
    expect(sim.events[4].filter((e) => e.type === 'deliver')).toHaveLength(2);
    expect(sim.events[5]).toEqual([{ type: 'pickup', order: 2 }]);
    expect(sim.events[6]).toContainEqual({ type: 'deliver', order: 2, age: 1 });
  });

  it('frees space by delivering before collecting at the same stop', () => {
    const sim = walk(town, ['D', 'a', 'b', 'c', 'd']);
    expect(sim.states[4].orders.map((o) => o.status)).toEqual([2, 2, 0]);
  });

  it('collects in order-list order when several orders wait at one shop', () => {
    const t3 = buildTown(mk({
      ...line, capacity: 1,
      shops: { a: 'bakery' }, houses: { b: 'A', c: 'B' },
      orders: [['a', 'c'], ['a', 'b']],
    }));
    const sim = walk(t3, ['D', 'a']);
    expect(sim.events[1]).toEqual([{ type: 'pickup', order: 0 }, { type: 'full', order: 1 }]);
  });
});

describe('freshness', () => {
  const town = buildTown(mk({ ...line, shops: { a: 'icecream' }, houses: { d: 'A' }, orders: [['a', 'd', 3]] }));

  it('counts moves left after pickup', () => {
    const sim = walk(town, ['D', 'a', 'b']);
    expect(freshLeft(town, sim.states[1], 0)).toBe(3);
    expect(freshLeft(town, sim.states[2], 0)).toBe(2);
  });

  it('delivers exactly at the limit', () => {
    const sim = walk(town, ['D', 'a', 'b', 'c', 'd']);
    expect(sim.events[4]).toContainEqual({ type: 'deliver', order: 0, age: 3 });
  });

  it('blocks the step that would go one move past the limit', () => {
    const sim = simulate(town, ['D', 'a', 'b', 'a', 'b', 'c']);
    // Picked up at move 1; moves 2–4 are fine (age 3), move 5 would be age 4.
    expect(sim.failure).toEqual({ index: 5, reason: { type: 'spoil', order: 0, limit: 3 } });
  });

  it('stops ageing once delivered', () => {
    const sim = walk(town, ['D', 'a', 'b', 'c', 'd', 'c', 'b', 'a', 'D']);
    const last = sim.states[8];
    expect(last.orders[0]).toMatchObject({ status: 2, deliveredAt: 4 });
    expect(freshLeft(town, last, 0)).toBeNull();
    expect(isComplete(town, last)).toBe(true);
  });

  it('an order still waiting at the shop does not age', () => {
    const t2 = buildTown(mk({ ...line, shops: { c: 'icecream' }, houses: { d: 'A' }, orders: [['c', 'd', 1]] }));
    // Wander for a while before collecting; still deliverable.
    expect(isWinningRoute(t2, ['D', 'a', 'D', 'a', 'b', 'c', 'd', 'c', 'b', 'a', 'D'])).toBe(true);
  });
});
