/**
 * Puzzle generator (authoring tool, not shipped). Builds random towns from a few
 * layout families, places shops, houses and rules, and keeps only puzzles that
 * pass the same checks as the hand-made set: valid and readable, solvable, a real
 * decision (naive play loses), every rule shapes the answer, few optimal routes,
 * little back-and-forth, and fast to solve.
 *
 *   npx vite-node scripts/generate.ts <family> <band> <seed> <count> <out.jsonl>
 */
declare const process: { argv: string[]; exit(code: number): never };
import { appendFileSync } from 'node:fs';
import { analyse } from '../src/core/analysis';
import { solvePuzzle } from '../src/core/solver';
import { buildTown } from '../src/core/town';
import type { EdgeDef, Mechanic, OrderDef, PuzzleDef, ShopKind } from '../src/core/types';
import { validatePuzzle } from '../src/core/validate';

export type Family = 'grid' | 'river' | 'ring' | 'tri' | 'comb';
export type Band = 'easy' | 'medium' | 'hard';
/** New rules a chapter can be built around ('mix' picks one per puzzle). */
export type Featured = 'hours' | 'gate' | 'fragile' | 'mix' | 'none';

type XY = [number, number];
interface Layout {
  nodes: XY[];
  edges: { a: number; b: number; style?: 'lane' | 'bridge'; bend?: XY }[];
  water?: { points: XY[]; width: number }[];
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type R = () => number;
const pick = <T>(r: R, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)];
const int = (r: R, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
function shuffle<T>(r: R, xs: T[]): T[] {
  for (let i = xs.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [xs[i], xs[j]] = [xs[j], xs[i]]; }
  return xs;
}

function connected(n: number, edges: { a: number; b: number }[], alive?: Set<number>): boolean {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const e of edges) { adj[e.a].push(e.b); adj[e.b].push(e.a); }
  const nodes = [...Array(n).keys()].filter((i) => (alive ? alive.has(i) : true) && adj[i].length > 0);
  if (!nodes.length) return false;
  const seen = new Set([nodes[0]]);
  const q = [nodes[0]];
  while (q.length) for (const v of adj[q.pop()!]) if (!seen.has(v)) { seen.add(v); q.push(v); }
  return nodes.every((i) => seen.has(i));
}

/** Drop isolated nodes and renumber. */
function compact(l: Layout): Layout {
  const used = new Set<number>();
  for (const e of l.edges) { used.add(e.a); used.add(e.b); }
  const map = new Map<number, number>();
  const nodes: XY[] = [];
  l.nodes.forEach((p, i) => { if (used.has(i)) { map.set(i, nodes.length); nodes.push(p); } });
  return { ...l, nodes, edges: l.edges.map((e) => ({ ...e, a: map.get(e.a)!, b: map.get(e.b)! })) };
}

function thin(r: R, l: Layout, frac: number, keep = new Set<number>()): Layout {
  let edges = l.edges.map((e, i) => ({ e, i }));
  const target = Math.floor(l.edges.length * frac);
  let removed = 0;
  for (const i of shuffle(r, [...l.edges.keys()])) {
    if (removed >= target) break;
    if (keep.has(i)) continue;
    const next = edges.filter((x) => x.i !== i);
    if (connected(l.nodes.length, next.map((x) => x.e))) { edges = next; removed++; }
  }
  return compact({ ...l, edges: edges.map((x) => x.e) });
}

function gridLayout(r: R): Layout {
  const W = int(r, 3, 5), H = int(r, 3, 5);
  const nodes: XY[] = [];
  const edges: Layout['edges'] = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) nodes.push([x, y]);
  const id = (x: number, y: number) => y * W + x;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (x + 1 < W) edges.push({ a: id(x, y), b: id(x + 1, y) });
    if (y + 1 < H) edges.push({ a: id(x, y), b: id(x, y + 1) });
  }
  // A couple of diagonal garden lanes through single blocks.
  const diag = int(r, 0, 2);
  const used = new Set<string>();
  for (let k = 0; k < diag; k++) {
    const x = int(r, 0, W - 2), y = int(r, 0, H - 2);
    if (used.has(`${x},${y}`)) continue;
    used.add(`${x},${y}`);
    if (r() < 0.5) edges.push({ a: id(x, y), b: id(x + 1, y + 1), style: 'lane' });
    else edges.push({ a: id(x + 1, y), b: id(x, y + 1), style: 'lane' });
  }
  return thin(r, { nodes, edges }, 0.12 + r() * 0.2);
}

function riverLayout(r: R): Layout {
  const Wl = int(r, 2, 3), Wr = int(r, 2, 3), H = int(r, 3, 4);
  const nodes: XY[] = [];
  const edges: Layout['edges'] = [];
  const W = Wl + Wr;
  const xOf = (x: number) => (x < Wl ? x : x + 1);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) nodes.push([xOf(x), y]);
  const id = (x: number, y: number) => y * W + x;
  const bridges = shuffle(r, [...Array(H).keys()]).slice(0, int(r, 1, 2));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (x + 1 < W) {
      if (x + 1 === Wl) { if (bridges.includes(y)) edges.push({ a: id(x, y), b: id(x + 1, y), style: 'bridge' }); }
      else edges.push({ a: id(x, y), b: id(x + 1, y) });
    }
    if (y + 1 < H) edges.push({ a: id(x, y), b: id(x, y + 1) });
  }
  const rx = Wl; // river runs between x = Wl-1 and Wl+1
  const wob = () => rx + (r() - 0.5) * 0.25;
  const water = [{ points: [[wob(), -0.9], [wob(), H * 0.33], [wob(), H * 0.66], [wob(), H - 0.1 + 0.8]] as XY[], width: 0.78 }];
  const keep = new Set(edges.map((e, i) => (e.style === 'bridge' ? i : -1)).filter((i) => i >= 0));
  const l = thin(r, { nodes, edges, water }, 0.08 + r() * 0.14, keep);
  return l;
}

function ringLayout(r: R): Layout {
  const n = pick(r, [6, 8]);
  const R0 = 1.6, c = 2;
  const nodes: XY[] = [];
  const edges: Layout['edges'] = [];
  const rc = R0 / Math.cos(Math.PI / n);
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    nodes.push([+(c + R0 * Math.cos(a)).toFixed(2), +(c + R0 * Math.sin(a)).toFixed(2)]);
  }
  for (let i = 0; i < n; i++) {
    const m = -Math.PI / 2 + ((i + 0.5) * 2 * Math.PI) / n;
    edges.push({ a: i, b: (i + 1) % n, bend: [+(c + rc * Math.cos(m)).toFixed(2), +(c + rc * Math.sin(m)).toFixed(2)] });
  }
  const hub = nodes.length;
  nodes.push([c, c]);
  for (const i of shuffle(r, [...Array(n).keys()]).slice(0, int(r, 2, 4))) edges.push({ a: hub, b: i, style: 'lane' });
  // Spurs out of the ring.
  for (const i of shuffle(r, [...Array(n).keys()]).slice(0, int(r, 1, 3))) {
    const [x, y] = nodes[i];
    const dx = x - c, dy = y - c, l = Math.hypot(dx, dy);
    nodes.push([+(x + (dx / l) * 1).toFixed(2), +(y + (dy / l) * 1).toFixed(2)]);
    edges.push({ a: i, b: nodes.length - 1 });
  }
  return { nodes, edges };
}

function triLayout(r: R): Layout {
  const rows = int(r, 3, 4), cols = int(r, 3, 4);
  const nodes: XY[] = [];
  const idx: number[][] = [];
  for (let y = 0; y < rows; y++) {
    idx.push([]);
    const off = y % 2 ? 0.5 : 0;
    for (let x = 0; x < cols - (y % 2 ? 1 : 0); x++) { idx[y].push(nodes.length); nodes.push([x + off, y]); }
  }
  const edges: Layout['edges'] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < idx[y].length; x++) {
      if (x + 1 < idx[y].length) edges.push({ a: idx[y][x], b: idx[y][x + 1] });
      if (y + 1 < rows) {
        const below = idx[y + 1];
        if (y % 2 === 0) {
          if (x - 1 >= 0 && x - 1 < below.length) edges.push({ a: idx[y][x], b: below[x - 1], style: 'lane' });
          if (x < below.length) edges.push({ a: idx[y][x], b: below[x], style: 'lane' });
        } else {
          edges.push({ a: idx[y][x], b: below[x], style: 'lane' });
          if (x + 1 < below.length) edges.push({ a: idx[y][x], b: below[x + 1], style: 'lane' });
        }
      }
    }
  }
  return thin(r, { nodes, edges }, 0.28 + r() * 0.12);
}

function combLayout(r: R): Layout {
  const n = int(r, 4, 5);
  const nodes: XY[] = [];
  const edges: Layout['edges'] = [];
  for (let x = 0; x < n; x++) nodes.push([x, 2]);
  for (let x = 0; x + 1 < n; x++) edges.push({ a: x, b: x + 1 });
  const up: number[] = [], down: number[] = [];
  for (let x = 0; x < n; x++) {
    if (r() < 0.75) { nodes.push([x, 1]); up[x] = nodes.length - 1; edges.push({ a: x, b: up[x] }); if (r() < 0.4) { nodes.push([x, 0]); edges.push({ a: up[x], b: nodes.length - 1, style: 'lane' }); } }
    if (r() < 0.65) { nodes.push([x, 3]); down[x] = nodes.length - 1; edges.push({ a: x, b: down[x] }); }
  }
  // Back lanes join some neighbouring closes into loops.
  for (let x = 0; x + 1 < n; x++) {
    if (up[x] !== undefined && up[x + 1] !== undefined && r() < 0.45) edges.push({ a: up[x], b: up[x + 1], style: 'lane' });
    if (down[x] !== undefined && down[x + 1] !== undefined && r() < 0.45) edges.push({ a: down[x], b: down[x + 1], style: 'lane' });
  }
  return { nodes, edges };
}

const LAYOUTS: Record<Family, (r: R) => Layout> = { grid: gridLayout, river: riverLayout, ring: ringLayout, tri: triLayout, comb: combLayout };

const BANDS: Record<Band, { orders: [number, number]; mech: [number, number]; opt: [number, number]; maxRoutes: number; minGreedyGap: number; maxReuse: number }> = {
  easy: { orders: [2, 3], mech: [0, 1], opt: [8, 14], maxRoutes: 24, minGreedyGap: 2, maxReuse: 0.3 },
  medium: { orders: [3, 4], mech: [1, 2], opt: [12, 20], maxRoutes: 12, minGreedyGap: 2, maxReuse: 0.3 },
  hard: { orders: [4, 5], mech: [2, 3], opt: [16, 26], maxRoutes: 8, minGreedyGap: 3, maxReuse: 0.36 },
};

/** buildTown caches by object identity, and the generator mutates defs; always build from a copy. */
function townOf(def: PuzzleDef) {
  return buildTown({ ...def, edges: def.edges.map((e) => ({ ...e })), orders: def.orders.map((o) => ({ ...o })) });
}

/** Directed reachability on legal moves: every corner reachable from every other. */
function stronglyConnected(def: PuzzleDef): boolean {
  const t = townOf(def);
  const reach = (from: string, rev: boolean) => {
    const seen = new Set([from]);
    const q = [from];
    while (q.length) {
      const u = q.pop()!;
      const nexts = rev ? t.nodeIds.filter((v) => (t.succ.get(v) ?? []).includes(u)) : (t.succ.get(u) ?? []);
      for (const v of nexts) if (!seen.has(v)) { seen.add(v); q.push(v); }
    }
    return seen;
  };
  const used = t.nodeIds.filter((n) => (t.incident.get(n)?.length ?? 0) > 0);
  const a = reach(def.depot, false), b = reach(def.depot, true);
  return used.every((n) => a.has(n) && b.has(n));
}

function legalDist(def: PuzzleDef, from: string, to: string): number {
  const t = townOf(def);
  const d = new Map([[from, 0]]);
  let q = [from];
  while (q.length) {
    const nq: string[] = [];
    for (const u of q) for (const v of t.succ.get(u) ?? []) if (!d.has(v)) { d.set(v, d.get(u)! + 1); nq.push(v); }
    q = nq;
  }
  return d.get(to) ?? Infinity;
}

export interface Candidate {
  family: Family;
  band: Band;
  def: PuzzleDef;
  opt: number;
  routes: number;
  greedy: number | null;
  reuse: number;
  score: number;
  difficulty: number;
  relaxed: Record<string, [number | null, number | null]>;
  route: string[];
}

function attempt(r: R, family: Family, band: Band, featured: Featured = 'none', intro = false): Candidate | null {
  const B = BANDS[band];
  const l = LAYOUTS[family](r);
  if (l.nodes.length < 6) return null;
  const ids = l.nodes.map((_, i) => `n${i}`);
  const edges: EdgeDef[] = l.edges.map((e) => {
    const d: EdgeDef = { a: ids[e.a], b: ids[e.b] };
    if (e.style) d.style = e.style;
    if (e.bend) d.bend = e.bend;
    return d;
  });
  const degree = (i: number) => l.edges.filter((e) => e.a === i || e.b === i).length;
  // Depot on the edge of town.
  const periphery = l.nodes.map((p, i) => ({ i, s: Math.max(...l.nodes.map((q) => q[1])) - p[1] + Math.abs(p[0] - l.nodes.reduce((a, q) => a + q[0], 0) / l.nodes.length) * 0.4 }))
    .filter((x) => degree(x.i) <= 3).sort((a, b) => a.s - b.s);
  const depotIdx = r() < 0.7 ? periphery[Math.floor(r() * Math.min(3, periphery.length))]?.i : int(r, 0, l.nodes.length - 1);
  if (depotIdx === undefined) return null;
  const nOrders = int(r, B.orders[0], B.orders[1]);
  const nMech = int(r, B.mech[0], B.mech[1]);
  const pool: Mechanic[] = nOrders >= 3 ? ['closure', 'fresh', 'oneway', 'capacity'] : ['closure', 'fresh', 'oneway'];
  const star: Mechanic | null = featured === 'none' ? null : featured === 'mix' ? pick(r, ['hours', 'gate', 'fragile'] as Mechanic[]) : featured;
  // A chapter's own rule is always in play; an intro puzzle has nothing else.
  const mechs = intro && star ? [star] : star ? [star, ...shuffle(r, pool.slice()).slice(0, Math.max(0, nMech - 1))] : shuffle(r, pool.slice()).slice(0, nMech);
  const shareShop = nOrders >= 3 && r() < 0.3;
  const nShops = shareShop ? nOrders - 1 : nOrders;
  const free = shuffle(r, [...l.nodes.keys()].filter((i) => i !== depotIdx));
  if (free.length < nShops + nOrders) return null;
  const shopIdx = free.slice(0, nShops), houseIdx = free.slice(nShops, nShops + nOrders);
  const freshCount = mechs.includes('fresh') ? (band === 'hard' && r() < 0.5 ? 2 : 1) : 0;
  const orderShop = houseIdx.map((_, k) => shopIdx[Math.min(k, nShops - 1)]);
  const freshShops = new Set(orderShop.slice(0, freshCount));
  const kinds: ShopKind[] = shopIdx.map((s) => (freshShops.has(s) ? pick(r, ['icecream', 'icecream', 'florist'] as ShopKind[]) : pick(r, ['bakery', 'grocer', 'florist', 'bakery'] as ShopKind[])));
  const def: PuzzleDef = {
    id: 'gen', rev: 1, number: 0, title: 'Generated', brief: 'Generated puzzle.', tier: band === 'easy' ? 'approachable' : band === 'medium' ? 'intermediate' : 'challenging',
    mechanics: ['multi', ...mechs], nodes: l.nodes.map(([x, y], i) => ({ id: ids[i], x, y })), edges, depot: ids[depotIdx],
    shops: shopIdx.map((s, k) => ({ node: ids[s], kind: kinds[k] })),
    houses: houseIdx.map((h, k) => ({ node: ids[h], letter: String.fromCharCode(65 + k) })),
    orders: houseIdx.map((h, k) => ({ id: `o${k + 1}`, from: ids[orderShop[k]], to: ids[h] } as OrderDef)),
    hint: 'Generated.', gold: 1,
  };
  if (l.water) def.water = l.water;
  if (mechs.includes('capacity')) def.capacity = 2;
  // Roadworks and one-way streets that keep every corner reachable.
  const tryMark = (count: number, mark: (e: EdgeDef) => void, unmark: (e: EdgeDef) => void) => {
    let done = 0;
    for (const e of shuffle(r, def.edges.slice())) {
      if (done >= count) break;
      if (e.closed || e.oneWay) continue;
      mark(e);
      if (stronglyConnected(def)) done++;
      else unmark(e);
    }
    return done === count;
  };
  if (mechs.includes('closure') && !tryMark(int(r, 1, band === 'hard' ? 3 : 2), (e) => { e.closed = true; }, (e) => { delete e.closed; })) return null;
  if (mechs.includes('oneway') && !tryMark(int(r, 2, 5), (e) => { e.oneWay = true; if (r() < 0.5) { const t = e.a; e.a = e.b; e.b = t; if (e.bend) { /* bend is symmetric */ } } }, (e) => { delete e.oneWay; })) return null;
  if (!stronglyConnected(def)) return null;
  // Garden gates: lanes that open once a house has its delivery. The town must work without them.
  if (mechs.includes('gate')) {
    const houses = def.houses.map((h) => h.node);
    const want = band === 'hard' ? int(r, 1, 2) : 1;
    let placed = 0;
    for (const e of shuffle(r, def.edges.slice())) {
      if (placed >= want) break;
      if (e.closed || e.oneWay || e.style === 'bridge') continue;
      const house = pick(r, houses.filter((hh) => hh !== e.a && hh !== e.b));
      if (!house) continue;
      e.closed = true;
      const ok = stronglyConnected(def);
      delete e.closed;
      if (ok) { e.gate = house; placed++; }
    }
    if (placed < want) return null;
  }
  // Opening hours: a shop that serves only from a set move.
  if (mechs.includes('hours')) {
    for (const sh of shuffle(r, def.shops.slice()).slice(0, band === 'hard' && def.shops.length > 2 ? 2 : 1)) {
      const d = legalDist(def, def.depot, sh.node);
      if (!Number.isFinite(d)) return null;
      sh.opensAt = d + int(r, 2, 6);
    }
  }
  // Cobbles and fragile orders: not ice cream, not fresh.
  if (mechs.includes('fragile')) {
    const candidates = def.orders.filter((o, k) => k >= freshCount && def.shops.find((sh) => sh.node === o.from)!.kind !== 'icecream');
    if (!candidates.length) return null;
    for (const o of shuffle(r, candidates).slice(0, band === 'hard' ? int(r, 1, 2) : 1)) o.fragile = true;
    const cob = int(r, 2, band === 'easy' ? 3 : 5);
    for (const e of shuffle(r, def.edges.filter((x) => x.style !== 'bridge' && !x.closed)).slice(0, cob)) e.cobbles = true;
  }
  for (let k = 0; k < freshCount; k++) {
    const o = def.orders[k];
    const d = legalDist(def, o.from, o.to);
    if (!Number.isFinite(d)) return null;
    o.fresh = d + int(r, 0, band === 'easy' ? 3 : 2);
  }
  const errs = validatePuzzle({ ...def, gold: 1 }).filter((e) => !e.startsWith('gold'));
  if (errs.length) return null;
  const final: PuzzleDef = { ...def, edges: def.edges.map((e) => ({ ...e })), orders: def.orders.map((o) => ({ ...o })), shops: def.shops.map((x) => ({ ...x })) };
  const t0 = Date.now();
  const sol = solvePuzzle(buildTown(final));
  if (!sol || sol.moves < B.opt[0] || sol.moves > B.opt[1] || Date.now() - t0 > 150) return null;
  const rep = analyse(final);
  if (rep.optimal === null || rep.optimalRoutes === null || rep.optimalRoutes > B.maxRoutes) return null;
  if (rep.greedy !== null && rep.greedy - rep.optimal < B.minGreedyGap) return null;
  const relaxed: Candidate['relaxed'] = {};
  let binds = 0, bindGap = 0;
  for (const [k, v] of Object.entries(rep.relaxedOptimal)) {
    const c = rep.relaxedRoutes[k as keyof typeof rep.relaxedRoutes] ?? null;
    relaxed[k] = [v ?? null, c];
    const changed = v !== rep.optimal || c !== rep.optimalRoutes;
    if (!changed) return null;
    if (v !== null && v !== rep.optimal) { binds++; bindGap += Math.min(4, Math.abs(rep.optimal - v)); }
  }
  if (band === 'hard' && binds < 2) return null;
  // A garden gate should be a shortcut the best route actually takes, not just a roadblock.
  if (final.edges.some((e) => e.gate)) {
    const usesGate = rep.route!.some((n, i) => i > 0 && final.edges.some((e) => e.gate && ((e.a === n && e.b === rep.route![i - 1]) || (e.b === n && e.a === rep.route![i - 1]))));
    if (!usesGate) return null;
  }
  const walked = new Set<string>();
  let reuse = 0;
  rep.route!.forEach((n, i) => { if (!i) return; const k = [rep.route![i - 1], n].sort().join('|'); if (walked.has(k)) reuse++; walked.add(k); });
  if (reuse > B.maxReuse * rep.optimal) return null;
  const gGap = rep.greedy === null ? 5 : Math.min(5, rep.greedy - rep.optimal);
  final.gold = rep.optimal;
  const score = 2 * gGap + 2 * bindGap + 3 * binds - 1.5 * Math.log2(rep.optimalRoutes) - 0.8 * Math.max(0, reuse - 2);
  const difficulty = rep.optimal + 3 * mechs.length + 2 * nOrders + gGap - Math.log2(rep.optimalRoutes);
  return { family, band, def: final, opt: rep.optimal, routes: rep.optimalRoutes, greedy: rep.greedy, reuse, score, difficulty, relaxed, route: rep.route! };
}

// CLI
const [family, bandArg, seedArg, countArg, out, featuredArg] = process.argv.slice(2) as [Family, Band | 'intro', string, string, string, Featured | undefined];
const intro = bandArg === 'intro';
const band: Band = intro ? 'easy' : bandArg;
const featured: Featured = featuredArg ?? 'none';
if (family && band && out) {
  const r = rng(Number(seedArg));
  const want = Number(countArg);
  let found = 0, tries = 0;
  const t0 = Date.now();
  while (found < want && tries < want * 4000) {
    tries++;
    let c: Candidate | null = null;
    try { c = attempt(r, family, band, featured, intro); } catch { c = null; }
    if (c) { (c as Candidate & { featured?: string; intro?: boolean }).featured = featured; if (intro) (c as Candidate & { intro?: boolean }).intro = true; }
    if (!c) continue;
    appendFileSync(out, JSON.stringify(c) + '\n');
    found++;
  }
  console.log(`${family}/${bandArg}/${featured}: ${found} in ${tries} tries, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
