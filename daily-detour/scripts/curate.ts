/**
 * Curation (authoring tool). Reads generator pools, picks the best puzzles by
 * score with variety across map families, writes titles, briefs and puzzle-specific
 * stage-one hints, and emits src/data/generated.ts.
 *
 *   npx vite-node scripts/curate.ts <pool-dir>
 */
declare const process: { argv: string[] };
import { readFileSync, writeFileSync } from 'node:fs';
import { simulate } from '../src/core/rules';
import { buildTown } from '../src/core/town';
import type { ShopKind } from '../src/core/types';
import { encodePuzzle } from '../src/data/codec';
import { PUZZLES } from '../src/data/puzzles';
import { DAILY_CODES } from '../src/data/dailies';
import type { Band, Candidate, Family } from './generate';

const dir = process.argv[2];
let s = 977;
const rnd = () => ((s = (s * 1103515245 + 12345) >>> 0) / 2 ** 32);

// ───────────────────────── names ─────────────────────────
const FIRST = ['Bramble', 'Willow', 'Clover', 'Thistle', 'Juniper', 'Hazel', 'Rowan', 'Primrose', 'Foxglove', 'Larkspur', 'Pippin', 'Quince', 'Sorrel', 'Teasel', 'Yarrow', 'Mallow', 'Elder', 'Hawthorn', 'Linden', 'Poppy', 'Daisy', 'Sweetpea', 'Honeysuckle', 'Bluebell', 'Snowdrop', 'Crocus', 'Tansy', 'Damson', 'Medlar', 'Saffron', 'Marigold', 'Heather', 'Fennel', 'Chervil', 'Cobble', 'Kettle', 'Teacup', 'Bobbin', 'Thimble', 'Lantern', 'Copper', 'Tinker', 'Pudding', 'Crumpet', 'Muffin', 'Barley', 'Millstone', 'Candle', 'Ribbon', 'Button', 'Acorn', 'Conker', 'Wren', 'Robin', 'Finch', 'Starling', 'Swallow', 'Heron', 'Otter', 'Badger', 'Hedgehog', 'Plum', 'Cherry', 'Apple', 'Pear', 'Bilberry', 'Gooseberry', 'Nutmeg', 'Ginger', 'Cinnamon', 'Treacle', 'Honey', 'Buttercup', 'Meadowsweet', 'Lavender', 'Rosemary', 'Thyme', 'Parsley', 'Mint', 'Sage', 'Holly', 'Ivy', 'Fern', 'Moss', 'Pebble', 'Brook', 'Weir', 'Mill', 'Orchard', 'Dovecote', 'Bellfounder', 'Clockmaker', 'Weaver', 'Cooper', 'Chandler', 'Tanner', 'Potter', 'Glover', 'Saddler', 'Cobbler'];
const LAST = ['Lane', 'Row', 'Close', 'Mews', 'Crescent', 'Walk', 'Hill', 'Green', 'Corner', 'Yard', 'Square', 'End', 'Rise', 'Gardens', 'Terrace', 'Way', 'Court', 'Passage', 'Place', 'Parade'];
const LAST_BY_FAMILY: Record<Family, string[]> = {
  grid: ['Square', 'Row', 'Terrace', 'Place', 'Parade', 'Yard', 'Corner', 'Gardens'],
  river: ['Wharf', 'Bridge', 'Quay', 'Reach', 'Ferry', 'Weir', 'Bank', 'Locks'],
  ring: ['Green', 'Circus', 'Ring', 'Common', 'Round', 'Gardens', 'Crescent', 'Park'],
  tri: ['Lane', 'Wynd', 'Passage', 'Steps', 'Alley', 'Close', 'Mews', 'Court'],
  comb: ['Street', 'Way', 'Walk', 'Rise', 'End', 'Hill', 'Close', 'Row'],
};
void LAST;
const usedTitles = new Set([...PUZZLES.map((p) => p.title), ...DAILY_CODES.map((c) => c.split('|')[0])]);
function title(family: Family): string {
  for (let k = 0; k < 10_000; k++) {
    const t = `${FIRST[Math.floor(rnd() * FIRST.length)]} ${LAST_BY_FAMILY[family][Math.floor(rnd() * LAST_BY_FAMILY[family].length)]}`;
    if (!usedTitles.has(t)) { usedTitles.add(t); return t; }
  }
  throw new Error('ran out of titles');
}

// ───────────────────────── words ─────────────────────────
const NUM = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];
const ITEM: Record<ShopKind, string> = { bakery: 'bread', florist: 'tulips', icecream: 'ice cream', grocer: 'veg box' };
const FRAGILE: Record<ShopKind, string> = { bakery: 'wedding cake', florist: 'vase of lilies', icecream: 'ice-cream cake', grocer: 'eggs' };
const SHOP: Record<ShopKind, string> = { bakery: 'Bakery', florist: 'Florist', icecream: 'ice-cream parlour', grocer: 'Grocer' };
const PLACE: Record<Family, string[]> = {
  grid: ['across the market town', 'around the square', 'through the terraces'],
  river: ['on both banks of the river', 'either side of the water', 'over the river'],
  ring: ['round the green', 'about the common', 'around the ring road'],
  tri: ['in the crooked old lanes', 'through the old quarter', 'among the winding lanes'],
  comb: ['along the high street', 'up and down the closes', 'off the main street'],
};

function brief(c: Candidate): string {
  const d = c.def;
  const n = d.orders.length;
  const parts: string[] = [];
  if (d.edges.some((e) => e.closed)) parts.push('roadworks');
  if (d.edges.some((e) => e.oneWay)) parts.push('one-way streets');
  for (const o of d.orders) if (o.fresh) {
    const k = d.shops.find((s) => s.node === o.from)!.kind;
    parts.push(k === 'icecream' ? `ice cream that melts in ${o.fresh}` : `tulips that wilt in ${o.fresh}`);
  }
  if (d.capacity) parts.push('a basket for two');
  const timed = d.shops.find((sh) => sh.opensAt);
  if (timed) parts.unshift(`the ${SHOP[timed.kind]} opening at move ${timed.opensAt}`);
  if (d.edges.some((e) => e.gate)) parts.unshift('a garden gate');
  const fr = d.orders.find((o) => o.fragile);
  if (fr) parts.unshift(`cobbles and a fragile ${FRAGILE[d.shops.find((sh) => sh.node === fr.from)!.kind]}`);
  const place = PLACE[c.family][Math.floor(rnd() * PLACE[c.family].length)];
  const shared = new Set(d.orders.map((o) => o.from)).size < n;
  let head = `${NUM[n]} orders ${place}`;
  if (shared) head += ` (two from one shop)`;
  const text = parts.length === 0 ? `${head}.` : parts.length === 1 ? `${head}, with ${parts[0]}.` : `${head}, with ${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}.`;
  return text.length <= 110 ? text : `${NUM[n]} orders: ${parts.join(', ')}.`.slice(0, 110);
}

/** Stage-one hint: one or two strategic observations drawn from the solver's analysis. */
function hint(c: Candidate): string {
  const d = c.def;
  const town = buildTown(d);
  const sim = simulate(town, c.route);
  const notes: { p: number; t: string }[] = [];
  const rel = c.relaxed;
  const letter = (node: string) => town.houseLetter.get(node)!;
  if (rel.capacity && rel.capacity[0] !== null && rel.capacity[0] > c.opt) {
    notes.push({ p: 10, t: 'A full basket rides straight past a shop without collecting. Here, that helps.' });
  } else if (rel.capacity && rel.capacity[0] !== null && rel.capacity[0] < c.opt) {
    notes.push({ p: 6, t: 'The basket only holds two, so you will need a drop-off between pickups.' });
  }
  for (const o of d.orders) if (o.fresh && rel.freshness) {
    const k = d.shops.find((s) => s.node === o.from)!.kind;
    const dist = shortest(town, o.from, o.to);
    notes.push({ p: 9, t: `The ${ITEM[k]} lasts ${o.fresh} ${o.fresh === 1 ? 'move' : 'moves'}, and House ${letter(o.to)} is ${dist} from the ${SHOP[k]}. Fetch it late, with nothing to stop for on the way.` });
    break;
  }
  const timed = d.shops.find((sh) => sh.opensAt);
  if (rel.hours && timed) notes.push({ p: 11, t: `The ${SHOP[timed.kind]} doesn't open until move ${timed.opensAt}. Do something useful on the way instead of waiting outside.` });
  const gate = d.edges.find((e) => e.gate);
  if (rel.gates && gate) notes.push({ p: 11, t: `House ${letter(gate.gate!)} opens their garden gate once they have their delivery. Get to them early and the shortcut is yours.` });
  const fr = d.orders.find((o) => o.fragile);
  if (rel.fragile && fr) notes.push({ p: 11, t: `The ${FRAGILE[d.shops.find((sh) => sh.node === fr.from)!.kind]} can't go over cobbles. Plan a smooth way from the ${SHOP[d.shops.find((sh) => sh.node === fr.from)!.kind]} to House ${letter(fr.to)} before you collect it.` });
  if (rel.oneways && rel.oneways[0] !== c.opt) notes.push({ p: 8, t: 'Check the arrows first: the one-way streets decide which way round the town to go.' });
  if (rel.closures && rel.closures[0] !== c.opt) notes.push({ p: 7, t: 'The roadworks block the obvious way; look for the loop around them.' });
  // Last delivery close to home?
  let lastDeliver = -1, lastHouse = '';
  sim.events.forEach((evs, i) => evs.forEach((e) => { if (e.type === 'deliver') { lastDeliver = i; lastHouse = d.orders[e.order].to; } }));
  if (lastDeliver >= 0 && c.route.length - 1 - lastDeliver <= 2) notes.push({ p: 5, t: `House ${letter(lastHouse)} is close to home, which makes it a good last stop.` });
  if (c.greedy === null || c.greedy - c.opt >= 4) notes.push({ p: 4, t: 'Taking the nearest job first is a trap today. Plan the whole loop before you start.' });
  if (!notes.length) notes.push({ p: 1, t: 'Collect everything you can on one loop before you start delivering.' });
  notes.sort((a, b) => b.p - a.p);
  const out = notes.slice(0, 2).map((n) => n.t).join(' ');
  return out.length <= 220 ? out : notes[0].t;
}

function shortest(town: ReturnType<typeof buildTown>, a: string, b: string): string {
  const d = new Map([[a, 0]]);
  let q = [a];
  while (q.length) { const nq: string[] = []; for (const u of q) for (const v of town.succ.get(u) ?? []) if (!d.has(v)) { d.set(v, d.get(u)! + 1); nq.push(v); } q = nq; }
  const n = d.get(b)!;
  return `${n} ${n === 1 ? 'move' : 'moves'}`;
}

// ───────────────────────── selection ─────────────────────────
const PACKS: { id: string; title: string; blurb: string; family: Family; featured: string }[] = [
  { id: 'market-town', title: 'Market Town', blurb: 'New: opening hours. Some shops only serve from a set move.', family: 'grid', featured: 'hours' },
  { id: 'round-the-green', title: 'Round the Green', blurb: 'New: garden gates. Neighbours open shortcuts once they have their delivery.', family: 'ring', featured: 'gate' },
  { id: 'old-quarter', title: 'Old Quarter', blurb: 'New: cobbles. Fragile orders need the smooth way round.', family: 'tri', featured: 'fragile' },
  { id: 'riverside', title: 'Riverside', blurb: 'Every rule so far, on both banks of the river.', family: 'river', featured: 'mix' },
  { id: 'high-street', title: 'High Street', blurb: 'Every rule so far, along the busiest street in town.', family: 'comb', featured: 'mix' },
];

type Tagged = Candidate & { intro?: boolean };
const chapterPool = (id: string): Tagged[] => {
  const out: Tagged[] = [];
  for (const line of readFileSync(`${dir}/pool-${id}.jsonl`, 'utf8').split('\n')) if (line.trim()) out.push(JSON.parse(line));
  const keys = new Set<string>();
  return out.filter((c) => { const k = encodePuzzle({ ...c.def, title: '', brief: '', hint: '' }); if (keys.has(k)) return false; keys.add(k); return true; });
};
const best = (list: Tagged[], band: Band | 'intro', n: number) =>
  list.filter((c) => (band === 'intro' ? c.intro : !c.intro && c.band === band)).sort((a, b) => b.score - a.score).slice(0, n);

const packOut: { id: string; title: string; blurb: string; featured: string; codes: string[] }[] = [];
for (const pack of PACKS) {
  const list = chapterPool(pack.id);
  const intro = best(list, 'intro', 1);
  const rest = [...best(list, 'easy', intro.length ? 7 : 8), ...best(list, 'medium', 9), ...best(list, 'hard', 7)].sort((a, b) => a.difficulty - b.difficulty);
  const chosen = [...intro, ...rest];
  if (chosen.length !== 24) throw new Error(`${pack.id}: only ${chosen.length} puzzles`);
  packOut.push({
    id: pack.id, title: pack.title, blurb: pack.blurb, featured: pack.featured,
    codes: chosen.map((c) => encodePuzzle({ ...c.def, title: title(c.family), brief: brief(c), hint: hint(c) })),
  });
}

const header = `// Generated by scripts/curate.ts from solver-checked generator output. Do not edit by hand.\n// ${packOut.reduce((a, p) => a + p.codes.length, 0)} route-book puzzles in ${packOut.length} chapters; each chapter is built around one rule.\n`;
const body = `${header}
export interface PackData { id: string; title: string; blurb: string; featured: string; codes: string[] }

export const GENERATED_PACKS: PackData[] = ${JSON.stringify(packOut, null, 1)};
`;
writeFileSync('src/data/generated.ts', body);
console.log(`packs: ${packOut.map((p) => `${p.title} ${p.codes.length}`).join(', ')}; file ${(body.length / 1024).toFixed(0)} KB`);
for (const p of packOut) console.log(' ', p.title, '→', p.codes[0].split('|').slice(0, 3).join(' / '));
