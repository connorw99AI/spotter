import type { BlockReason, StepEvent } from '../core/rules';
import type { Town } from '../core/town';
import type { ShopKind } from '../core/types';
import type { DoomReason, Objective } from '../game/advisor';

export const shopName: Record<ShopKind, string> = {
  bakery: 'Bakery',
  florist: 'Florist',
  icecream: 'Ice-cream parlour',
  grocer: 'Grocer',
};

export const itemName: Record<ShopKind, string> = {
  bakery: 'bread',
  florist: 'tulips',
  icecream: 'ice cream',
  grocer: 'veg box',
};

const spoilVerb: Record<ShopKind, string> = { bakery: 'go stale', florist: 'wilt', icecream: 'melt', grocer: 'spoil' };
const spoilVerbs: Record<ShopKind, string> = { bakery: 'goes stale', florist: 'wilts', icecream: 'melts', grocer: 'spoils' };

/** Fragile orders get their own names: a cake is not a loaf. */
export const fragileName: Record<ShopKind, string> = { bakery: 'wedding cake', florist: 'vase of lilies', icecream: 'ice-cream cake', grocer: 'eggs' };

export function itemLabel(town: Town, order: number): string {
  const k = orderKind(town, order);
  return town.orders[order].fragile ? fragileName[k] : itemName[k];
}

export function orderKind(town: Town, order: number): ShopKind {
  return town.shopKind.get(town.orders[order].from)!;
}

export function houseOf(town: Town, order: number): string {
  return town.houseLetter.get(town.orders[order].to)!;
}

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

export function describeEvents(town: Town, events: readonly StepEvent[], allDone: boolean): string | null {
  const parts: string[] = [];
  for (const e of events) {
    if (e.type === 'pickup') {
      const k = orderKind(town, e.order);
      const lim = town.orders[e.order].fresh;
      parts.push(`Collected the ${itemLabel(town, e.order)} for House ${houseOf(town, e.order)}.` + (lim ? ` It ${spoilVerbs[k]} after ${plural(lim, 'move')}.` : '') + (town.orders[e.order].fragile ? ' Fragile: keep off the cobbles.' : ''));
    } else if (e.type === 'deliver') {
      parts.push(`Delivered the ${itemLabel(town, e.order)} to House ${houseOf(town, e.order)}.`);
    } else if (e.type === 'full') {
      const k = orderKind(town, e.order);
      parts.push(`Basket full — the ${itemLabel(town, e.order)} for House ${houseOf(town, e.order)} waits at the ${shopName[k]} until you have room.`);
    } else if (e.type === 'closed') {
      const k = orderKind(town, e.order);
      parts.push(`The ${shopName[k]} opens at move ${e.opensAt}. The ${itemLabel(town, e.order)} for House ${houseOf(town, e.order)} waits until then.`);
    } else if (e.type === 'early') {
      const k = orderKind(town, e.order);
      parts.push(`House ${houseOf(town, e.order)} is waiting for the ${itemLabel(town, e.order)} from the ${shopName[k]}. Collect it first.`);
    } else if (e.type === 'home' && e.complete) {
      return 'Home with everything delivered. Press Deliver to send the courier off.';
    }
  }
  if (allDone && events.some((e) => e.type === 'deliver')) parts.push('That’s everything — head home.');
  return parts.length ? parts.join(' ') : null;
}

export function describeBlock(town: Town, r: BlockReason): string {
  switch (r.type) {
    case 'no-street': return 'No street goes there. Pick a corner joined to the end of your route.';
    case 'closed': return 'Roadworks: this street is closed in both directions.';
    case 'one-way': return 'One-way street — it only runs the other way.';
    case 'spoil': {
      const k = orderKind(town, r.order);
      return `The ${itemLabel(town, r.order)} would ${spoilVerb[k]}! It must reach House ${houseOf(town, r.order)} within ${plural(r.limit, 'move')} of pickup.`;
    }
    case 'gate': return `This garden gate stays shut until House ${town.houseLetter.get(r.house)} has had its delivery.`;
    case 'cobbles': return `Cobbles! The ${itemLabel(town, r.order)} would break. Find a smooth street round.`;
  }
}

export function describeDoom(town: Town, d: DoomReason | undefined): string {
  if (d?.type === 'spoil') {
    const k = orderKind(town, d.order);
    return `This route can’t finish: the ${itemLabel(town, d.order)} can’t reach House ${houseOf(town, d.order)} before it ${spoilVerbs[k]}.`;
  }
  if (d?.type === 'fragile') return `This route can’t finish: there’s no smooth street from here to House ${houseOf(town, d.order)} for the ${itemLabel(town, d.order)}.`;
  if (d?.type === 'stuck') return 'This route can’t finish: the one-way streets won’t lead back from here.';
  return 'This route can’t finish from here — every way on spoils an order.';
}

export function describeObjective(town: Town, o: Objective): string {
  if (o.kind === 'home') return 'Next: ride home to your cottage.';
  const k = orderKind(town, o.order);
  if (o.kind === 'pickup') return `Next: collect the ${itemLabel(town, o.order)} for House ${houseOf(town, o.order)} at the ${shopName[k]}.`;
  return `Next: deliver the ${itemLabel(town, o.order)} to House ${houseOf(town, o.order)}.`;
}

export function describeNodeForStep(town: Town, node: string): string {
  if (node === town.depot) return 'your cottage';
  const shop = town.shopKind.get(node);
  if (shop) return `the ${shopName[shop]}`;
  const house = town.houseLetter.get(node);
  if (house) return `House ${house}`;
  return 'the highlighted corner';
}

export { plural };
