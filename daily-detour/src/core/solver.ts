import { initialState, isComplete, tryStep, type GameState } from './rules';
import type { Town } from './town';
import type { NodeId } from './types';

/**
 * Canonical key over every piece of future-relevant state: position, each order's
 * status, and the age of carried orders that have a freshness limit. The age of a
 * carried order without a limit, and the absolute move count, never affect the
 * future, so they are left out (this is the main pruning).
 */
export function stateKey(town: Town, s: GameState): string {
  let k = s.node + '|';
  for (let i = 0; i < s.orders.length; i++) {
    const o = s.orders[i];
    k += o.status;
    if (o.status === 1 && town.orders[i].fresh !== undefined) k += '.' + (s.moves - o.pickedAt);
    k += ',';
  }
  return k;
}

export interface SolveResult {
  /** Optimal number of further moves. */
  moves: number;
  /** Nodes to visit after the current one (excludes the starting node). */
  path: NodeId[];
}

export interface SolveOptions {
  /** Hard bound on further moves; keeps the search finite and predictable. */
  maxDepth?: number;
}

const DEFAULT_MAX_DEPTH = 90;

const cache = new WeakMap<Town, Map<string, SolveResult | null>>();

/** Breadth-first search for the shortest completion from `from`. Cached per town. */
export function solveFrom(town: Town, from: GameState, opts: SolveOptions = {}): SolveResult | null {
  const maxDepth = opts.maxDepth ?? DEFAULT_MAX_DEPTH;
  let memo = cache.get(town);
  if (!memo) {
    memo = new Map();
    cache.set(town, memo);
  }
  const startKey = stateKey(town, from) + '@' + maxDepth;
  if (memo.has(startKey)) return memo.get(startKey)!;

  const result = bfs(town, from, maxDepth);
  memo.set(startKey, result);
  return result;
}

function bfs(town: Town, from: GameState, maxDepth: number): SolveResult | null {
  if (isComplete(town, from)) return { moves: 0, path: [] };
  const parent = new Map<string, { prev: string; node: NodeId }>();
  const rootKey = stateKey(town, from);
  parent.set(rootKey, { prev: '', node: from.node });
  let frontier: GameState[] = [from];
  for (let depth = 1; depth <= maxDepth && frontier.length; depth++) {
    const next: GameState[] = [];
    for (const s of frontier) {
      const sk = stateKey(town, s);
      for (const v of town.succ.get(s.node) ?? []) {
        const r = tryStep(town, s, v);
        if (!r.ok) continue;
        const k = stateKey(town, r.state);
        if (parent.has(k)) continue;
        parent.set(k, { prev: sk, node: v });
        if (isComplete(town, r.state)) {
          const path: NodeId[] = [];
          let cur = k;
          while (cur !== rootKey) {
            const p = parent.get(cur)!;
            path.push(p.node);
            cur = p.prev;
          }
          path.reverse();
          return { moves: depth, path };
        }
        next.push(r.state);
      }
    }
    frontier = next;
  }
  return null;
}

/** Shortest complete route for the whole puzzle, starting at the depot. */
export function solvePuzzle(town: Town, opts?: SolveOptions): { moves: number; route: NodeId[] } | null {
  const r = solveFrom(town, initialState(town), opts);
  return r ? { moves: r.moves, route: [town.depot, ...r.path] } : null;
}

/**
 * Number of distinct optimal routes (node sequences). Used by design analysis:
 * a puzzle with thousands of optimal routes rarely has an interesting decision.
 */
export function countOptimalRoutes(town: Town, cap = 1_000_000): { moves: number; count: number } | null {
  const start = initialState(town);
  let layer = new Map<string, { s: GameState; n: number }>([[stateKey(town, start), { s: start, n: 1 }]]);
  const seen = new Set<string>(layer.keys());
  for (let depth = 1; depth <= DEFAULT_MAX_DEPTH && layer.size; depth++) {
    const next = new Map<string, { s: GameState; n: number }>();
    let goal = 0;
    for (const { s, n } of layer.values()) {
      for (const v of town.succ.get(s.node) ?? []) {
        const r = tryStep(town, s, v);
        if (!r.ok) continue;
        const k = stateKey(town, r.state);
        if (seen.has(k)) continue;
        if (isComplete(town, r.state)) goal = Math.min(cap, goal + n);
        const e = next.get(k);
        if (e) e.n = Math.min(cap, e.n + n);
        else next.set(k, { s: r.state, n });
      }
    }
    if (goal > 0) return { moves: depth, count: goal };
    for (const k of next.keys()) seen.add(k);
    layer = next;
  }
  return null;
}
