import type { DecorDef, EdgeDef, HouseDef, Mechanic, NodeDef, OrderDef, PuzzleDef, ShopDef, ShopKind, TipDef, Tier, WaterDef } from '../core/types';

/**
 * Compact authoring helper. Streets are written as chains:
 *   "a-b-c"  two-way streets a–b and b–c
 *   "a>b"    one-way from a to b ("a<b" is one-way from b to a)
 *   "a#b"    closed for roadworks
 *   "a~b"    a garden lane (two-way, drawn narrower)
 *   "a=b"    a bridge (two-way)
 */
export interface PuzzleSpec {
  id: string;
  rev: number;
  number: number;
  title: string;
  brief: string;
  tier: Tier;
  mechanics: Mechanic[];
  introduces?: Mechanic;
  nodes: Record<string, [number, number]>;
  streets: string;
  bends?: Record<string, [number, number]>;
  depot: string;
  shops: Record<string, ShopKind>;
  houses: Record<string, string>;
  /** [from, to] or [from, to, freshLimit] */
  orders: [string, string, number?][];
  capacity?: number;
  hint: string;
  tips?: TipDef[];
  gold: number;
  decor?: DecorDef[];
  water?: WaterDef[];
  scenery?: number;
}

export function parseStreets(streets: string, bends: Record<string, [number, number]> = {}): EdgeDef[] {
  const edges: EdgeDef[] = [];
  for (const chain of streets.trim().split(/\s+/)) {
    const parts = chain.split(/([-<>#~=])/);
    for (let i = 0; i + 2 < parts.length; i += 2) {
      const a = parts[i];
      const op = parts[i + 1];
      const b = parts[i + 2];
      if (!a || !b) throw new Error(`Bad street chain "${chain}"`);
      const bend = bends[`${a}-${b}`] ?? bends[`${b}-${a}`];
      const e: EdgeDef =
        op === '>' ? { a, b, oneWay: true }
        : op === '<' ? { a: b, b: a, oneWay: true }
        : op === '#' ? { a, b, closed: true }
        : op === '~' ? { a, b, style: 'lane' }
        : op === '=' ? { a, b, style: 'bridge' }
        : { a, b };
      if (bend) e.bend = bend;
      edges.push(e);
    }
  }
  return edges;
}

export function definePuzzle(spec: PuzzleSpec): PuzzleDef {
  const nodes: NodeDef[] = Object.entries(spec.nodes).map(([id, [x, y]]) => ({ id, x, y }));
  const shops: ShopDef[] = Object.entries(spec.shops).map(([node, kind]) => ({ node, kind }));
  const houses: HouseDef[] = Object.entries(spec.houses).map(([node, letter]) => ({ node, letter }));
  const orders: OrderDef[] = spec.orders.map(([from, to, fresh], i) => {
    const o: OrderDef = { id: `o${i + 1}`, from, to };
    if (fresh !== undefined) o.fresh = fresh;
    return o;
  });
  const def: PuzzleDef = {
    id: spec.id,
    rev: spec.rev,
    number: spec.number,
    title: spec.title,
    brief: spec.brief,
    tier: spec.tier,
    mechanics: spec.mechanics,
    nodes,
    edges: parseStreets(spec.streets, spec.bends),
    depot: spec.depot,
    shops,
    houses,
    orders,
    hint: spec.hint,
    gold: spec.gold,
  };
  if (spec.introduces) def.introduces = spec.introduces;
  if (spec.capacity !== undefined) def.capacity = spec.capacity;
  if (spec.tips) def.tips = spec.tips;
  if (spec.decor) def.decor = spec.decor;
  if (spec.water) def.water = spec.water;
  if (spec.scenery !== undefined) def.scenery = spec.scenery;
  return def;
}
