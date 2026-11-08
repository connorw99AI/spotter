import { carriedCount, freshLeft, isComplete, simulate, tryStep, type GameState } from '../core/rules';
import { solveFrom } from '../core/solver';
import type { Town } from '../core/town';
import type { NodeId } from '../core/types';

export type Objective =
  | { kind: 'pickup'; node: NodeId; order: number }
  | { kind: 'deliver'; node: NodeId; order: number }
  | { kind: 'home'; node: NodeId };

export type DoomReason =
  | { type: 'spoil'; order: number }
  | { type: 'stuck' }
  | { type: 'other' };

export interface Advice {
  status: 'complete' | 'ok' | 'doomed';
  /** Moves in the route as it stands. */
  moves: number;
  /** Fewest further moves to finish from here (ok / complete). */
  remaining?: number;
  /** Optimal continuation from the current end (ok), or from the recovery point (doomed). */
  path?: NodeId[];
  next?: Objective;
  /** Doomed: keep this many moves and the puzzle becomes solvable again. */
  undoTo?: number;
  reason?: DoomReason;
  /** When gold is out of reach from here: keep this many moves to get back on a gold route. */
  goldUndoTo?: number;
}

function legalDistances(town: Town, src: NodeId): Map<NodeId, number> {
  const d = new Map<NodeId, number>([[src, 0]]);
  let q = [src];
  while (q.length) {
    const nq: NodeId[] = [];
    for (const u of q) for (const v of town.succ.get(u) ?? []) if (!d.has(v)) { d.set(v, d.get(u)! + 1); nq.push(v); }
    q = nq;
  }
  return d;
}

function firstObjective(town: Town, from: GameState, path: readonly NodeId[]): Objective {
  let s = from;
  for (const v of path) {
    const r = tryStep(town, s, v);
    if (!r.ok) break;
    const pick = r.events.find((e) => e.type === 'deliver') ?? r.events.find((e) => e.type === 'pickup');
    if (pick && (pick.type === 'deliver' || pick.type === 'pickup')) {
      return { kind: pick.type, node: v, order: pick.order };
    }
    s = r.state;
  }
  return { kind: 'home', node: town.depot };
}

function diagnose(town: Town, s: GameState): DoomReason {
  const d = legalDistances(town, s.node);
  for (let i = 0; i < s.orders.length; i++) {
    const left = freshLeft(town, s, i);
    if (left === null) continue;
    const dist = d.get(town.orders[i].to);
    if (dist === undefined || dist > left) return { type: 'spoil', order: i };
  }
  if (!d.has(town.depot)) return { type: 'stuck' };
  if (carriedCount(s) > 0) {
    for (let i = 0; i < s.orders.length; i++) {
      if (s.orders[i].status === 1 && !d.has(town.orders[i].to)) return { type: 'stuck' };
    }
  }
  return { type: 'other' };
}

/**
 * Everything the hint system and the "can this still finish?" check need,
 * computed from the player's actual route. Never modifies the route.
 */
export function advise(town: Town, route: readonly NodeId[], gold: number): Advice {
  const sim = simulate(town, route);
  const states = sim.states;
  const here = states[states.length - 1];
  const moves = states.length - 1;

  const goldUndo = (): number | undefined => {
    for (let k = moves - 1; k >= 0; k--) {
      const r = solveFrom(town, states[k]);
      if (r && k + r.moves <= gold) return k;
    }
    return undefined;
  };

  if (isComplete(town, here)) {
    return { status: 'complete', moves, remaining: 0, goldUndoTo: moves > gold ? goldUndo() : undefined };
  }
  const best = solveFrom(town, here);
  if (best) {
    const advice: Advice = { status: 'ok', moves, remaining: best.moves, path: best.path, next: firstObjective(town, here, best.path) };
    if (moves + best.moves > gold) advice.goldUndoTo = goldUndo();
    return advice;
  }
  for (let k = moves - 1; k >= 0; k--) {
    const r = solveFrom(town, states[k]);
    if (r) {
      return {
        status: 'doomed', moves, undoTo: k, reason: diagnose(town, here),
        path: r.path, next: firstObjective(town, states[k], r.path),
      };
    }
  }
  return { status: 'doomed', moves, undoTo: 0, reason: diagnose(town, here) };
}
