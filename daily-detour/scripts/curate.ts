/**
 * Curation (authoring tool). Reads generator pools, picks the best puzzles by
 * score with variety across map families, writes titles, briefs and puzzle-specific
 * stage-one hints, and emits src/data/generated.ts.
 *
 *   npx vite-node scripts/curate.ts <pool-dir>
 */
declare const process: { argv: string[] };
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { simulate } from '../src/core/rules';
import { buildTown } from '../src/core/town';
import type { PuzzleDef, ShopKind } from '../src/core/types';
import { encodePuzzle } from '../src/data/codec';
import { PUZZLES } from '../src/data/puzzles';
import type { Band, Candidate, Family } from './generate';

const dir = process.argv[2];
const pool: Candidate[] = [];
for (const f of readdirSync(dir)) if (f.startsWith('pool-') && f.endsWith('.jsonl')) {
  for (const line of readFileSync(`${dir}/${f}`, 'utf8').split('\n')) if (line.trim()) pool.push(JSON.parse(line));
}
// Drop exact repeats.
const seen = new Set<string>();
const uniq = pool.filter((c) => { const k = encodePuzzle({ ...c.def, title: '', brief: '', hint: '' }); if (seen.has(k)) return false; seen.add(k); return true; });

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
const usedTitles = new Set(PUZZLES.map((p) => p.title));
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
const byKey = new Map<string, Candidate[]>();
for (const c of uniq) {
  const k = `${c.family}/${c.band}`;
  if (!byKey.has(k)) byKey.set(k, []);
  byKey.get(k)!.push(c);
}
for (const list of byKey.values()) list.sort((a, b) => b.score - a.score);
const take = (family: Family, band: Band, n: number): Candidate[] => {
  const list = byKey.get(`${family}/${band}`) ?? [];
  if (list.length < n) throw new Error(`not enough ${family}/${band}: ${list.length} < ${n}`);
  return list.splice(0, n);
};

const PACKS: { id: string; title: string; blurb: string; family: Family }[] = [
  { id: 'market-town', title: 'Market Town', blurb: 'Tidy terraces, a park or two, and garden lanes cutting corners.', family: 'grid' },
  { id: 'riverside', title: 'Riverside', blurb: 'Two banks and not many bridges. Choose your crossing.', family: 'river' },
  { id: 'round-the-green', title: 'Round the Green', blurb: 'Ring roads, paths across the common, and lanes leading out of town.', family: 'ring' },
  { id: 'old-quarter', title: 'Old Quarter', blurb: 'Crooked lanes meeting at odd angles. Count carefully.', family: 'tri' },
  { id: 'high-street', title: 'High Street', blurb: 'One main street, quiet closes, and the odd back lane.', family: 'comb' },
];
const PER_PACK: Record<Band, number> = { easy: 8, medium: 9, hard: 7 };

const packOut: { id: string; title: string; blurb: string; codes: string[] }[] = [];
for (const pack of PACKS) {
  const chosen = [...take(pack.family, 'easy', PER_PACK.easy), ...take(pack.family, 'medium', PER_PACK.medium), ...take(pack.family, 'hard', PER_PACK.hard)];
  chosen.sort((a, b) => a.difficulty - b.difficulty);
  packOut.push({
    id: pack.id, title: pack.title, blurb: pack.blurb,
    codes: chosen.map((c) => encodePuzzle({ ...c.def, title: title(c.family), brief: brief(c), hint: hint(c) })),
  });
}

// Dailies: a week-shaped rhythm, gentle on Monday and trickiest at the weekend.
// Index 0 is Monday 9 November 2026.
const WEEK: Band[] = ['easy', 'easy', 'medium', 'medium', 'medium', 'hard', 'hard'];
const FAMILIES: Family[] = ['grid', 'river', 'ring', 'tri', 'comb'];
const cursor: Record<Band, number> = { easy: 0, medium: 0, hard: 0 };
const dailyCodes: string[] = [];
const dailyBands: string[] = [];
for (let day = 0; day < 365; day++) {
  const band = WEEK[day % 7];
  let c: Candidate | undefined;
  for (let tries = 0; tries < FAMILIES.length && !c; tries++) {
    const fam = FAMILIES[(cursor[band]++) % FAMILIES.length];
    const list = byKey.get(`${fam}/${band}`) ?? [];
    c = list.shift();
  }
  if (!c) throw new Error(`ran out of ${band} dailies on day ${day}`);
  dailyCodes.push(encodePuzzle({ ...c.def, title: title(c.family), brief: brief(c), hint: hint(c) }));
  dailyBands.push(band[0]);
}

const header = `// Generated by scripts/curate.ts from solver-checked generator output. Do not edit by hand.\n// ${packOut.reduce((a, p) => a + p.codes.length, 0)} route-book puzzles in ${packOut.length} chapters, ${dailyCodes.length} daily puzzles.\n`;
const body = `${header}
export interface PackData { id: string; title: string; blurb: string; codes: string[] }

export const GENERATED_PACKS: PackData[] = ${JSON.stringify(packOut, null, 1)};

/** Daily puzzles from Monday 9 November 2026 (index 0), one per UTC day. */
export const DAILY_START = '2026-11-09';
export const DAILY_CODES: string[] = ${JSON.stringify(dailyCodes, null, 0).replace(/","/g, '",\n"')};
/** e / m / h per daily: the weekday rhythm the schedule follows. */
export const DAILY_BANDS = '${dailyBands.join('')}';
`;
writeFileSync('src/data/generated.ts', body);
console.log(`packs: ${packOut.map((p) => `${p.title} ${p.codes.length}`).join(', ')}; dailies: ${dailyCodes.length}; file ${(body.length / 1024).toFixed(0)} KB`);
const remaining = [...byKey.entries()].map(([k, v]) => `${k}:${v.length}`).join(' ');
console.log('left in pool:', remaining);
// Sample of generated words for review.
console.log('sample:', packOut[1].codes.slice(0, 3).map((c) => c.split('|').slice(0, 3).join(' / ')).join('\n        '));
void (null as unknown as PuzzleDef);
