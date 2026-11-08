import { initialState, isComplete, tryStep, type GameState } from './rules';
import { countOptimalRoutes, solvePuzzle } from './solver';
import { buildTown, type Town } from './town';
import type { NodeId, PuzzleDef } from './types';

/** Shortest distances over legal streets (ignoring orders). */
function distancesFrom(town: Town, src: NodeId): Map<NodeId, number> {
  const d = new Map<NodeId, number>([[src, 0]]);
  let q = [src];
  while (q.length) {
    const nq: NodeId[] = [];
    for (const u of q) for (const v of town.succ.get(u) ?? []) if (!d.has(v)) { d.set(v, d.get(u)! + 1); nq.push(v); }
    q = nq;
  }
  return d;
}

/**
 * A naive player: always ride (via shortest street path) to the nearest outstanding
 * objective — a pickup with room, or a delivery — then home. Used to check that the
 * optimal route needs some thought. Returns null if the naive plan breaks a rule.
 */
export function greedyMoves(town: Town): number | null {
  let s: GameState = initialState(town);
  for (let guard = 0; guard < 200; guard++) {
    if (isComplete(town, s)) return s.moves;
    const targets: NodeId[] = [];
    const carried = s.orders.filter((o) => o.status === 1).length;
    s.orders.forEach((o, i) => {
      if (o.status === 1) targets.push(town.orders[i].to);
      if (o.status === 0 && carried < town.capacity) targets.push(town.orders[i].from);
    });
    if (!targets.length) targets.push(town.depot);
    const d = distancesFrom(town, s.node);
    let best: NodeId | null = null;
    for (const t of targets) if (d.has(t) && (best === null || d.get(t)! < d.get(best)!)) best = t;
    if (best === null) return null;
    // Walk a shortest street path to `best`.
    const path = shortestPath(town, s.node, best);
    if (!path) return null;
    for (const v of path) {
      const r = tryStep(town, s, v);
      if (!r.ok) return null;
      s = r.state;
    }
  }
  return null;
}

function shortestPath(town: Town, a: NodeId, b: NodeId): NodeId[] | null {
  const prev = new Map<NodeId, NodeId>();
  const seen = new Set([a]);
  let q = [a];
  while (q.length) {
    const nq: NodeId[] = [];
    for (const u of q) {
      for (const v of town.succ.get(u) ?? []) {
        if (seen.has(v)) continue;
        seen.add(v);
        prev.set(v, u);
        if (v === b) {
          const p = [v];
          let c = v;
          while (prev.get(c) !== a) { c = prev.get(c)!; p.push(c); }
          return p.reverse();
        }
        nq.push(v);
      }
    }
    q = nq;
  }
  return null;
}

export type Relaxation = 'closures' | 'oneways' | 'freshness' | 'capacity';

/** Same puzzle with one kind of constraint removed — shows whether that rule shapes the answer. */
export function relaxed(def: PuzzleDef, what: Relaxation): PuzzleDef {
  const copy: PuzzleDef = { ...def, edges: def.edges.map((e) => ({ ...e })), orders: def.orders.map((o) => ({ ...o })) };
  if (what === 'closures') copy.edges.forEach((e) => delete e.closed);
  if (what === 'oneways') copy.edges.forEach((e) => delete e.oneWay);
  if (what === 'freshness') copy.orders.forEach((o) => delete o.fresh);
  if (what === 'capacity') delete copy.capacity;
  return copy;
}

export interface PuzzleReport {
  id: string;
  optimal: number | null;
  optimalRoutes: number | null;
  greedy: number | null;
  relaxedOptimal: Partial<Record<Relaxation, number | null>>;
  /** Number of optimal routes once the rule is removed (same optimum = the rule only rules routes out). */
  relaxedRoutes: Partial<Record<Relaxation, number | null>>;
  route: NodeId[] | null;
}

export function analyse(def: PuzzleDef): PuzzleReport {
  const town = buildTown(def);
  const sol = solvePuzzle(town);
  const count = countOptimalRoutes(town);
  const relaxedOptimal: PuzzleReport['relaxedOptimal'] = {};
  const relaxedRoutes: PuzzleReport['relaxedRoutes'] = {};
  const uses: Record<Relaxation, boolean> = {
    closures: def.edges.some((e) => e.closed),
    oneways: def.edges.some((e) => e.oneWay),
    freshness: def.orders.some((o) => o.fresh !== undefined),
    capacity: def.capacity !== undefined,
  };
  for (const what of Object.keys(uses) as Relaxation[]) {
    if (!uses[what]) continue;
    const c = countOptimalRoutes(buildTown(relaxed(def, what)));
    relaxedOptimal[what] = c?.moves ?? null;
    relaxedRoutes[what] = c?.count ?? null;
  }
  return {
    id: def.id,
    optimal: sol?.moves ?? null,
    optimalRoutes: count?.count ?? null,
    greedy: greedyMoves(town),
    relaxedOptimal,
    relaxedRoutes,
    route: sol?.route ?? null,
  };
}
