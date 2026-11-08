import { checkMove, type Town } from './town';
import type { NodeId } from './types';

/** 0 = waiting at shop, 1 = in the basket, 2 = delivered. */
export type OrderStatus = 0 | 1 | 2;

export interface OrderState {
  readonly status: OrderStatus;
  /** Move count at the moment of pickup (meaningful while carried). */
  readonly pickedAt: number;
  /** Move count at delivery (meaningful once delivered). */
  readonly deliveredAt: number;
}

export interface GameState {
  readonly node: NodeId;
  readonly moves: number;
  readonly orders: readonly OrderState[];
}

export type StepEvent =
  | { type: 'pickup'; order: number }
  | { type: 'deliver'; order: number; age: number }
  /** Arrived at a shop with a full basket: the order stays there. */
  | { type: 'full'; order: number }
  /** Arrived at a destination before collecting its order: nothing delivered. */
  | { type: 'early'; order: number }
  | { type: 'home'; complete: boolean };

export type BlockReason =
  | { type: 'no-street'; from: NodeId; to: NodeId }
  | { type: 'closed'; edge: number }
  | { type: 'one-way'; edge: number }
  /** The step would push a carried order past its freshness limit. */
  | { type: 'spoil'; order: number; limit: number };

export type StepOutcome =
  | { ok: true; state: GameState; events: StepEvent[] }
  | { ok: false; reason: BlockReason };

const WAITING: OrderState = { status: 0, pickedAt: -1, deliveredAt: -1 };

export function initialState(town: Town): GameState {
  return { node: town.depot, moves: 0, orders: town.orders.map(() => WAITING) };
}

export function carriedCount(state: GameState): number {
  let n = 0;
  for (const o of state.orders) if (o.status === 1) n++;
  return n;
}

export function allDelivered(state: GameState): boolean {
  return state.orders.every((o) => o.status === 2);
}

export function isComplete(town: Town, state: GameState): boolean {
  return state.node === town.depot && allDelivered(state);
}

/** Moves remaining before a carried fresh order spoils (0 = must be delivered on this very move). */
export function freshLeft(town: Town, state: GameState, order: number): number | null {
  const lim = town.orders[order].fresh;
  const o = state.orders[order];
  if (lim === undefined || o.status !== 1) return null;
  return lim - (state.moves - o.pickedAt);
}

/**
 * The single source of truth for movement. Pure: returns a new state or a reason.
 * Arrival order: deliveries first (freeing basket space), then pickups in order-list order.
 */
export function tryStep(town: Town, state: GameState, to: NodeId): StepOutcome {
  const mv = checkMove(town, state.node, to);
  if (!mv.ok) {
    if (mv.reason === 'no-street') return { ok: false, reason: { type: 'no-street', from: state.node, to } };
    return { ok: false, reason: { type: mv.reason, edge: mv.edge } };
  }
  const moves = state.moves + 1;
  for (let i = 0; i < state.orders.length; i++) {
    const o = state.orders[i];
    const lim = town.orders[i].fresh;
    if (o.status === 1 && lim !== undefined && moves - o.pickedAt > lim) {
      return { ok: false, reason: { type: 'spoil', order: i, limit: lim } };
    }
  }
  const orders = state.orders.slice();
  const events: StepEvent[] = [];
  let carried = 0;
  for (let i = 0; i < orders.length; i++) {
    const o = orders[i];
    if (o.status === 1 && town.orders[i].to === to) {
      orders[i] = { status: 2, pickedAt: o.pickedAt, deliveredAt: moves };
      events.push({ type: 'deliver', order: i, age: moves - o.pickedAt });
    } else if (o.status === 1) {
      carried++;
    }
  }
  for (let i = 0; i < orders.length; i++) {
    if (orders[i].status !== 0) continue;
    const def = town.orders[i];
    if (def.from === to) {
      if (carried < town.capacity) {
        orders[i] = { status: 1, pickedAt: moves, deliveredAt: -1 };
        carried++;
        events.push({ type: 'pickup', order: i });
      } else {
        events.push({ type: 'full', order: i });
      }
    } else if (def.to === to) {
      events.push({ type: 'early', order: i });
    }
  }
  const next: GameState = { node: to, moves, orders };
  if (to === town.depot) events.push({ type: 'home', complete: allDelivered(next) });
  return { ok: true, state: next, events };
}

export interface Simulation {
  /** states[i] is the state after i moves; states[0] is the start. */
  states: GameState[];
  /** events[i] happened on arrival at move i; events[0] is always empty. */
  events: StepEvent[][];
  /** Index of the first illegal step and why, if the route breaks the rules. */
  failure?: { index: number; reason: BlockReason };
}

/** Replays a route (starting with the depot) through the rules. */
export function simulate(town: Town, route: readonly NodeId[]): Simulation {
  const start = initialState(town);
  const states = [start];
  const events: StepEvent[][] = [[]];
  if (route.length === 0 || route[0] !== town.depot) {
    return { states, events, failure: { index: 0, reason: { type: 'no-street', from: town.depot, to: route[0] ?? '' } } };
  }
  let s = start;
  for (let i = 1; i < route.length; i++) {
    const r = tryStep(town, s, route[i]);
    if (!r.ok) return { states, events, failure: { index: i, reason: r.reason } };
    s = r.state;
    states.push(s);
    events.push(r.events);
  }
  return { states, events };
}

/** True if the route is legal from start to finish and completes the puzzle. */
export function isWinningRoute(town: Town, route: readonly NodeId[]): boolean {
  const sim = simulate(town, route);
  return !sim.failure && isComplete(town, sim.states[sim.states.length - 1]);
}

/** Whether arriving at the end of the route triggered a pickup or delivery. */
export function hadStopEvent(events: readonly StepEvent[]): boolean {
  return events.some((e) => e.type === 'pickup' || e.type === 'deliver');
}
