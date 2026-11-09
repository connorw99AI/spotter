import type { Medal } from '../core/medals';
import { NEIGHBOURS } from '../data/neighbours';
import type { DailyRecord, LevelRecord } from './storage';

/**
 * The village shop. Coins are earned from deliveries (counted at your best on
 * each route, so replays can't farm them) and spent on hints, decorations,
 * Pip's look, map looks and new neighbours. No real money is involved.
 */

export const COINS = {
  starter: 50,
  book: { bronze: 10, silver: 20, gold: 30 } as Record<Medal, number>,
  request: { bronze: 20, silver: 40, gold: 60 } as Record<Medal, number>,
  daily: { bronze: 15, silver: 25, gold: 40 } as Record<Medal, number>,
};

/** What a hint costs, by stage. The first nudge is always free. */
export const HINT_COST: Record<1 | 2 | 3, number> = { 1: 0, 2: 10, 3: 15 };

/** Every coin a save has earned: the starter purse plus each route at its best medal. */
export function coinsEarned(levels: Record<string, LevelRecord>, bookRevs: ReadonlyMap<string, number>, requestRevs: ReadonlyMap<string, number>, daily: Record<string, DailyRecord>): number {
  let n = COINS.starter;
  for (const [id, rev] of bookRevs) { const r = levels[id]; if (r && r.rev === rev) n += COINS.book[r.bestMedal]; }
  for (const [id, rev] of requestRevs) { const r = levels[id]; if (r && r.rev === rev) n += COINS.request[r.bestMedal]; }
  for (const r of Object.values(daily)) n += COINS.daily[r.medal];
  return n;
}

export type Wear = 'bike' | 'helmet' | 'scarf' | 'jacket' | 'crate';
export type ItemKind = 'decor' | Wear | 'look' | 'neighbour';
export interface ShopItem { id: string; kind: ItemKind; name: string; price: number; colour?: string; blurb?: string }

export const DECOR: ShopItem[] = [
  { id: 'haybales', kind: 'decor', name: 'Hay bales', price: 40 },
  { id: 'birdbath', kind: 'decor', name: 'Bird bath', price: 50, blurb: 'The sparrows queue for it.' },
  { id: 'sundial', kind: 'decor', name: 'Sundial', price: 60 },
  { id: 'picnic', kind: 'decor', name: 'Picnic blanket', price: 70 },
  { id: 'phonebox', kind: 'decor', name: 'Red phone box', price: 90 },
  { id: 'well', kind: 'decor', name: 'Wishing well', price: 100 },
  { id: 'swing', kind: 'decor', name: 'Tree swing', price: 110 },
  { id: 'pond', kind: 'decor', name: 'Duck pond', price: 120, blurb: 'Comes with ducks.' },
  { id: 'topiary', kind: 'decor', name: 'Topiary peacock', price: 140 },
  { id: 'stall', kind: 'decor', name: 'Market stall', price: 150 },
  { id: 'kennel', kind: 'decor', name: 'Kennel and dog', price: 160, blurb: 'His name is Biscuit.' },
  { id: 'statue', kind: 'decor', name: 'Statue of Pip', price: 250, blurb: 'The village insisted.' },
];

/** Pip's look. The first of each kind is what Pip starts with. */
export const WEAR: ShopItem[] = [
  { id: 'bike-forest', kind: 'bike', name: 'Forest bike', price: 0, colour: '#2F5D46' },
  { id: 'bike-sky', kind: 'bike', name: 'Sky bike', price: 80, colour: '#4D86B8' },
  { id: 'bike-cherry', kind: 'bike', name: 'Cherry bike', price: 80, colour: '#C2433A' },
  { id: 'bike-sunny', kind: 'bike', name: 'Sunshine bike', price: 80, colour: '#E0A93A' },
  { id: 'bike-plum', kind: 'bike', name: 'Plum bike', price: 80, colour: '#7A4F86' },
  { id: 'helmet-forest', kind: 'helmet', name: 'Green helmet', price: 0, colour: '#2F5D46' },
  { id: 'helmet-red', kind: 'helmet', name: 'Red helmet', price: 60, colour: '#C2433A' },
  { id: 'helmet-sky', kind: 'helmet', name: 'Sky helmet', price: 60, colour: '#4D86B8' },
  { id: 'helmet-dots', kind: 'helmet', name: 'Polka-dot helmet', price: 90, colour: '#E0A93A' },
  { id: 'scarf-terracotta', kind: 'scarf', name: 'Terracotta scarf', price: 0, colour: '#B85C38' },
  { id: 'scarf-teal', kind: 'scarf', name: 'Teal scarf', price: 50, colour: '#3F9C8A' },
  { id: 'scarf-mustard', kind: 'scarf', name: 'Mustard scarf', price: 50, colour: '#E0B04A' },
  { id: 'scarf-pink', kind: 'scarf', name: 'Rose scarf', price: 50, colour: '#D4688A' },
  { id: 'jacket-mustard', kind: 'jacket', name: 'Mustard jacket', price: 0, colour: '#E0B04A' },
  { id: 'jacket-blue', kind: 'jacket', name: 'Navy jacket', price: 70, colour: '#3E5E86' },
  { id: 'jacket-green', kind: 'jacket', name: 'Moss jacket', price: 70, colour: '#6E9A50' },
  { id: 'jacket-pink', kind: 'jacket', name: 'Pink jacket', price: 70, colour: '#D4688A' },
  { id: 'crate-plain', kind: 'crate', name: 'Delivery crate', price: 0 },
  { id: 'crate-flowers', kind: 'crate', name: 'Flower crate', price: 100 },
  { id: 'crate-picnic', kind: 'crate', name: 'Gingham basket', price: 100 },
  { id: 'crate-dog', kind: 'crate', name: 'Biscuit rides along', price: 200, blurb: 'A small dog in the crate.' },
];

/** Map looks: play every route in a scene of your choice. */
export const LOOKS: ShopItem[] = [
  { id: 'look-seasonal', kind: 'look', name: 'As the book says', price: 0, blurb: 'Each route in its own season.' },
  { id: 'look-spring', kind: 'look', name: 'Spring morning', price: 100 },
  { id: 'look-summer', kind: 'look', name: 'High summer', price: 100 },
  { id: 'look-autumn', kind: 'look', name: 'Autumn', price: 100 },
  { id: 'look-evening', kind: 'look', name: 'Evening lights', price: 150 },
  { id: 'look-winter', kind: 'look', name: 'Snowfall', price: 150 },
];

export const NEIGHBOUR_ITEMS: ShopItem[] = NEIGHBOURS.map((nb) => ({ id: `nb-${nb.id}`, kind: 'neighbour', name: `Cottage for ${nb.name}`, price: nb.cost }));

export const ITEMS: ShopItem[] = [...DECOR, ...WEAR, ...LOOKS, ...NEIGHBOUR_ITEMS];
const BY_ID = new Map(ITEMS.map((i) => [i.id, i]));
export const itemById = (id: string) => BY_ID.get(id);

export const DEFAULT_WEAR: Record<Wear, string> = { bike: 'bike-forest', helmet: 'helmet-forest', scarf: 'scarf-terracotta', jacket: 'jacket-mustard', crate: 'crate-plain' };
/** Free things everyone owns from the start. */
export const STARTER_ITEMS = ITEMS.filter((i) => i.price === 0).map((i) => i.id);

/** Spots in the village where decorations can go. */
export const DECOR_SLOTS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'] as const;
