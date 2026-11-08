import type { PuzzleDef, ShopKind } from '../core/types';

/** The people on the round. Each house in a puzzle is given one, the same every time. */
export const RESIDENTS = [
  'Mrs Pennyworth', 'Mr Fennick', 'Old Albert', 'Nell', 'Rosa Bianchi', 'Captain Moss', 'Priya Shah', 'The Okafor twins',
  'Miss Thistlewood', 'Dr Amari', 'Mr and Mrs Hale', 'Grandma Ines', 'Tobias the tailor', 'Mrs Quigley', 'Pastor Lyle', 'Wen and Lucy',
  'Mr Abernathy', 'Signora Conti', 'Fergus', 'Little Maeve', 'Mr Odum', 'The Lindqvists', 'Auntie Dot', 'Professor Vane',
];

const NOTES: Record<ShopKind, string[]> = {
  bakery: ['Still warm! Elevenses is saved.', 'The crusty end is mine, everyone knows that.', 'Perfect for the picnic. Thank you, dear.', 'Toast for the whole street tomorrow.'],
  florist: ['They’re for my sister’s birthday. She’ll cry, she always does.', 'Tulips! The kitchen table looks like spring.', 'Right on time for the anniversary. Don’t tell him.', 'The vase has been empty for weeks. Not any more.'],
  icecream: ['Not a drop melted. You’re a marvel.', 'Pistachio, my favourite. How did you know?', 'The grandchildren cheered when you came up the path.', 'Cold as you like. Sitting in the garden with it now.'],
  grocer: ['Soup tonight, and plenty to share.', 'Those carrots are for the rabbit. Mostly.', 'Everything I asked for and a lemon besides.', 'Just what the stew needed.'],
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Residents for a puzzle's houses: deterministic, and never the same person twice in one puzzle. */
export function residentsFor(p: PuzzleDef): Map<string, string> {
  const out = new Map<string, string>();
  const used = new Set<number>();
  let k = hash(p.id) % RESIDENTS.length;
  for (const h of p.houses) {
    while (used.has(k)) k = (k + 1) % RESIDENTS.length;
    used.add(k);
    out.set(h.node, RESIDENTS[k]);
    k = (k + 7) % RESIDENTS.length;
  }
  return out;
}

export function thankYouNote(p: PuzzleDef, order: number, kind: ShopKind): string {
  const list = NOTES[kind];
  return list[hash(`${p.id}:${order}`) % list.length];
}
