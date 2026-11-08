import type { EdgeDef, NodeId, OrderDef, PuzzleDef, ShopKind } from './types';

/** A compiled, read-only view of a puzzle's street graph. */
export interface Town {
  readonly def: PuzzleDef;
  readonly depot: NodeId;
  readonly nodeIds: readonly NodeId[];
  readonly pos: ReadonlyMap<NodeId, { x: number; y: number }>;
  readonly edges: readonly EdgeDef[];
  /** All streets touching a node (including closed / wrong-way ones). */
  readonly incident: ReadonlyMap<NodeId, readonly number[]>;
  /** Legal moves out of a node. */
  readonly succ: ReadonlyMap<NodeId, readonly NodeId[]>;
  readonly orders: readonly OrderDef[];
  readonly capacity: number;
  readonly shopKind: ReadonlyMap<NodeId, ShopKind>;
  /** Shops with opening hours, and the latest opening move (for the solver's state key). */
  readonly opensAt: ReadonlyMap<NodeId, number>;
  readonly maxOpen: number;
  readonly houseLetter: ReadonlyMap<NodeId, string>;
  readonly ordersAtShop: ReadonlyMap<NodeId, readonly number[]>;
  readonly ordersForHouse: ReadonlyMap<NodeId, readonly number[]>;
}

export type MoveCheck =
  | { ok: true; edge: number }
  | { ok: false; reason: 'no-street'; edge?: undefined }
  | { ok: false; reason: 'closed' | 'one-way'; edge: number };

const pairKey = (u: NodeId, v: NodeId) => (u < v ? `${u}|${v}` : `${v}|${u}`);

const towns = new WeakMap<PuzzleDef, Town>();
const edgeIndexes = new WeakMap<Town, Map<string, number>>();

export function buildTown(def: PuzzleDef): Town {
  const cached = towns.get(def);
  if (cached) return cached;
  const pos = new Map<NodeId, { x: number; y: number }>();
  for (const n of def.nodes) pos.set(n.id, { x: n.x, y: n.y });
  const incident = new Map<NodeId, number[]>();
  const succ = new Map<NodeId, NodeId[]>();
  for (const n of def.nodes) {
    incident.set(n.id, []);
    succ.set(n.id, []);
  }
  const byPair = new Map<string, number>();
  def.edges.forEach((e, i) => {
    byPair.set(pairKey(e.a, e.b), i);
    incident.get(e.a)?.push(i);
    incident.get(e.b)?.push(i);
    if (e.closed) return;
    succ.get(e.a)?.push(e.b);
    if (!e.oneWay) succ.get(e.b)?.push(e.a);
  });
  const shopKind = new Map<NodeId, ShopKind>(def.shops.map((s) => [s.node, s.kind]));
  const opensAt = new Map<NodeId, number>(def.shops.filter((s) => s.opensAt).map((s) => [s.node, s.opensAt!]));
  const houseLetter = new Map<NodeId, string>(def.houses.map((h) => [h.node, h.letter]));
  const ordersAtShop = new Map<NodeId, number[]>();
  const ordersForHouse = new Map<NodeId, number[]>();
  def.orders.forEach((o, i) => {
    if (!ordersAtShop.has(o.from)) ordersAtShop.set(o.from, []);
    ordersAtShop.get(o.from)!.push(i);
    if (!ordersForHouse.has(o.to)) ordersForHouse.set(o.to, []);
    ordersForHouse.get(o.to)!.push(i);
  });
  const town: Town = {
    def,
    depot: def.depot,
    nodeIds: def.nodes.map((n) => n.id),
    pos,
    edges: def.edges,
    incident,
    succ,
    orders: def.orders,
    capacity: def.capacity ?? Number.POSITIVE_INFINITY,
    shopKind,
    opensAt,
    maxOpen: Math.max(0, ...opensAt.values()),
    houseLetter,
    ordersAtShop,
    ordersForHouse,
  };
  towns.set(def, town);
  edgeIndexes.set(town, byPair);
  return town;
}

export function edgeBetween(town: Town, u: NodeId, v: NodeId): number | undefined {
  return edgeIndexes.get(town)?.get(pairKey(u, v));
}

/** Can the courier ride directly from u to v? Explains why not. */
export function checkMove(town: Town, u: NodeId, v: NodeId): MoveCheck {
  const edge = edgeBetween(town, u, v);
  if (edge === undefined || u === v) return { ok: false, reason: 'no-street' };
  const e = town.edges[edge];
  if (e.closed) return { ok: false, reason: 'closed', edge };
  if (e.oneWay && e.a !== u) return { ok: false, reason: 'one-way', edge };
  return { ok: true, edge };
}

/** Every node joined to `u` by any street, legal or not. */
export function streetNeighbours(town: Town, u: NodeId): NodeId[] {
  return (town.incident.get(u) ?? []).map((i) => {
    const e = town.edges[i];
    return e.a === u ? e.b : e.a;
  });
}
