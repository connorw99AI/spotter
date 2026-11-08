import { greedyMoves } from '../core/analysis';
import { simulate } from '../core/rules';
import { edgeBetween, type Town } from '../core/town';
import type { NodeId, ShopKind } from '../core/types';

export interface Moment {
  kind: 'full-pass' | 'just-in-time' | 'gate' | 'opening' | 'smooth' | 'beat-naive';
  text: string;
}

const ITEM: Record<ShopKind, string> = { bakery: 'bread', florist: 'tulips', icecream: 'ice cream', grocer: 'veg box' };
const FRAGILE: Record<ShopKind, string> = { bakery: 'wedding cake', florist: 'vase of lilies', icecream: 'ice-cream cake', grocer: 'eggs' };
const SHOP: Record<ShopKind, string> = { bakery: 'Bakery', florist: 'Florist', icecream: 'ice-cream parlour', grocer: 'Grocer' };

function stepsBetween(town: Town, a: NodeId, b: NodeId): number {
  const d = new Map([[a, 0]]);
  let q = [a];
  while (q.length) {
    const nq: NodeId[] = [];
    for (const u of q) for (const v of town.succ.get(u) ?? []) if (!d.has(v)) { d.set(v, d.get(u)! + 1); nq.push(v); }
    q = nq;
  }
  return d.get(b) ?? Infinity;
}

/**
 * The clever bits of a delivered route, named so the game can celebrate them.
 * Most notable first. Pure: same route, same moments.
 */
export function cleverMoments(town: Town, route: readonly NodeId[], gold: number): Moment[] {
  const sim = simulate(town, route);
  if (sim.failure) return [];
  const out: Moment[] = [];
  const kind = (i: number) => town.shopKind.get(town.orders[i].from)!;
  const item = (i: number) => (town.orders[i].fragile ? FRAGILE[kind(i)] : ITEM[kind(i)]);
  const letter = (i: number) => town.houseLetter.get(town.orders[i].to)!;
  const pickedAt = new Map<number, number>();
  const fullAt = new Set<number>();
  sim.events.forEach((evs, step) => {
    for (const e of evs) {
      if (e.type === 'full') fullAt.add(e.order);
      if (e.type === 'pickup') {
        pickedAt.set(e.order, step);
        if (fullAt.has(e.order)) {
          const why = town.orders[e.order].fresh ? `so the ${item(e.order)} didn’t start ${kind(e.order) === 'icecream' ? 'melting' : 'wilting'} too soon` : `and came back for the ${item(e.order)} later`;
          out.push({ kind: 'full-pass', text: `Clever detour: you rode past the ${SHOP[kind(e.order)]} with a full basket, ${why}.` });
        }
        const opens = town.opensAt.get(town.orders[e.order].from);
        if (opens !== undefined && sim.states[step].moves === opens) out.push({ kind: 'opening', text: `You reached the ${SHOP[kind(e.order)]} on the very move it opened.` });
      }
      if (e.type === 'deliver') {
        const lim = town.orders[e.order].fresh;
        if (lim !== undefined && e.age === lim) out.push({ kind: 'just-in-time', text: `The ${item(e.order)} reached House ${letter(e.order)} with not a move to spare.` });
        if (town.orders[e.order].fragile) {
          const from = pickedAt.get(e.order)!;
          const direct = stepsBetween(town, town.orders[e.order].from, town.orders[e.order].to);
          if (step - from > direct) out.push({ kind: 'smooth', text: `You took the smooth way round, and the ${item(e.order)} arrived in one piece.` });
        }
      }
    }
  });
  const gatesUsed = new Set<NodeId>();
  for (let i = 1; i < route.length; i++) {
    const e = town.edges[edgeBetween(town, route[i - 1], route[i])!];
    if (e.gate) gatesUsed.add(e.gate);
  }
  for (const g of gatesUsed) out.push({ kind: 'gate', text: `House ${town.houseLetter.get(g)} opened their garden gate for you, and you used the shortcut.` });
  const moves = route.length - 1;
  if (moves <= gold) {
    const naive = greedyMoves(town);
    if (naive === null) out.push({ kind: 'beat-naive', text: 'Taking the nearest job first breaks a rule on this map. You planned round it.' });
    else if (naive > moves) out.push({ kind: 'beat-naive', text: `Nearest job first would have taken ${naive} moves. You found ${moves}.` });
  }
  const order: Moment['kind'][] = ['full-pass', 'gate', 'smooth', 'just-in-time', 'opening', 'beat-naive'];
  return out.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
}
