/**
 * Puzzle schema. Pure data: no rendering or rules live here.
 * Coordinates are abstract map units (roughly one block = 1).
 */
export type NodeId = string;

export type ShopKind = 'bakery' | 'florist' | 'icecream' | 'grocer';

export type Tier = 'tutorial' | 'approachable' | 'intermediate' | 'challenging';

/** Mechanics a puzzle uses; drives contextual teaching and design checks. */
export type Mechanic = 'basic' | 'multi' | 'closure' | 'fresh' | 'oneway' | 'capacity' | 'hours' | 'gate' | 'fragile';

export interface NodeDef {
  id: NodeId;
  x: number;
  y: number;
}

export interface EdgeDef {
  a: NodeId;
  b: NodeId;
  /** Travel allowed only from a to b. */
  oneWay?: boolean;
  /** Roadworks: impassable in both directions. */
  closed?: boolean;
  /** Presentation-only quadratic control point for curved lanes. */
  bend?: [number, number];
  /** Presentation-only style. */
  style?: 'street' | 'lane' | 'bridge';
  /** Garden gate: closed until every order for this house node has been delivered. */
  gate?: NodeId;
  /** Cobbled: fragile orders cannot be carried along it. */
  cobbles?: boolean;
}

export interface ShopDef {
  node: NodeId;
  kind: ShopKind;
  /** Opening hours: the shop hands over orders only from this move onwards. */
  opensAt?: number;
}

export interface HouseDef {
  node: NodeId;
  letter: string;
}

export interface OrderDef {
  id: string;
  /** Shop node where the order is collected. */
  from: NodeId;
  /** House node where the order is delivered. */
  to: NodeId;
  /** Freshness limit: must be delivered within this many moves after pickup. */
  fresh?: number;
  /** Fragile: may not be carried along cobbled streets. */
  fragile?: boolean;
}

export interface TipDef {
  /** When the tip shows. 'start' = empty route. Event names match StepEvent types. */
  on: 'start' | 'pickup' | 'deliver' | 'allDelivered' | 'complete' | 'early' | 'full' | 'blocked';
  text: string;
}

export type DecorKind = 'tree' | 'pine' | 'bush' | 'flowers' | 'pond' | 'bench' | 'cottage';

export interface DecorDef {
  kind: DecorKind;
  x: number;
  y: number;
  s?: number;
}

export interface WaterDef {
  /** Polyline of a river/canal in map units. */
  points: [number, number][];
  width: number;
}

export interface PuzzleDef {
  /** Stable identifier, never reused. */
  id: string;
  /** Content revision. Bump whenever rules-relevant data changes; invalidates saved bests. */
  rev: number;
  number: number;
  /** Chapter of the route book this puzzle belongs to (classic puzzles have none). */
  pack?: string;
  title: string;
  brief: string;
  tier: Tier;
  mechanics: Mechanic[];
  /** Mechanic introduced by this puzzle (shown as a contextual callout). */
  introduces?: Mechanic;
  nodes: NodeDef[];
  edges: EdgeDef[];
  depot: NodeId;
  shops: ShopDef[];
  houses: HouseDef[];
  orders: OrderDef[];
  /** Basket capacity. Omitted = no limit. */
  capacity?: number;
  /** Stage-one hint: a strategic observation. */
  hint: string;
  tips?: TipDef[];
  /** Authored expectation of the optimal move count; verified by tests against the solver. */
  gold: number;
  decor?: DecorDef[];
  water?: WaterDef[];
  /** Fraction of automatic scenery density (0 = none, 1 = default). */
  scenery?: number;
}
