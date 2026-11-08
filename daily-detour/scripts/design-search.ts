/**
 * Authoring aid (not used by the game). Given a hand-drawn street layout, tries many
 * placements of shops and houses and ranks them by how interesting the solver says
 * they are. The chosen placement is then written into puzzles.ts by hand and
 * validated like every other puzzle.
 *
 *   npx vite-node scripts/design-search.ts /path/to/layout.ts
 */
declare const process: { argv: string[]; env: Record<string, string | undefined> };
import { analyse } from '../src/core/analysis';
import { definePuzzle } from '../src/data/dsl';
import type { ShopKind } from '../src/core/types';
import { validatePuzzle } from '../src/core/validate';

interface Layout {
  nodes: Record<string, [number, number]>;
  streets: string;
  depot: string;
  /** Candidate nodes for locations (defaults to all but depot). */
  spots?: string[];
  orders: { shop: number; fresh?: number }[];
  shops: ShopKind[];
  capacity?: number;
  opt: [number, number];
  /** Pin a shop / house (by index) to a node; '' leaves it free. */
  fixedShops?: string[];
  fixedHouses?: string[];
}

function rng(seed: number) {
  return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

const L: Layout = (await import(process.argv[2])).layout;
const rand = rng(12345);
const spots = L.spots ?? Object.keys(L.nodes).filter((n) => n !== L.depot);
const results: { score: number; desc: string }[] = [];
const seen = new Set<string>();
const tries = Number(process.env.TRIES ?? 3000);
for (let t = 0; t < tries; t++) {
  const pool = spots.slice();
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const pinned = new Set([...(L.fixedShops ?? []), ...(L.fixedHouses ?? [])].filter(Boolean));
  const free = pool.filter((n) => !pinned.has(n));
  let fi = 0;
  const shopNodes = L.shops.map((_, i) => L.fixedShops?.[i] || free[fi++]);
  const houseNodes = L.orders.map((_, i) => L.fixedHouses?.[i] || free[fi++]);
  const all = [...shopNodes, ...houseNodes];
  if (new Set(all).size !== all.length || all.includes(L.depot)) continue;
  const key = all.join(',');
  if (seen.has(key)) continue;
  seen.add(key);
  const shops: Record<string, ShopKind> = {};
  shopNodes.forEach((n, i) => (shops[n] = L.shops[i]));
  const houses: Record<string, string> = {};
  houseNodes.forEach((n, i) => (houses[n] = String.fromCharCode(65 + i)));
  const def = definePuzzle({
    id: 'x', rev: 1, number: 0, title: '', brief: '', tier: 'intermediate', mechanics: [], hint: '', gold: 1,
    nodes: L.nodes, streets: L.streets, depot: L.depot, shops, houses,
    orders: L.orders.map((o, i) => (o.fresh ? [shopNodes[o.shop], houseNodes[i], o.fresh] : [shopNodes[o.shop], houseNodes[i]])),
    capacity: L.capacity,
  });
  const v = validatePuzzle({ ...def, gold: 1 }).filter((e) => !e.includes('gold'));
  if (v.length) continue;
  const r = analyse(def);
  if (r.optimal === null || r.optimal < L.opt[0] || r.optimal > L.opt[1]) continue;
  const greedyGap = r.greedy === null ? 5 : r.greedy - r.optimal;
  let bind = 0;
  for (const val of Object.values(r.relaxedOptimal)) bind += val === null ? 0 : Math.min(4, r.optimal - val);
  const nBind = Object.values(r.relaxedOptimal).filter((v) => v !== null && v < r.optimal!).length;
  // Reused street traversals: a little reuse is a detour, a lot is tedium.
  const walked = new Set<string>();
  let reuse = 0;
  r.route!.forEach((n, i) => {
    if (i === 0) return;
    const k = [r.route![i - 1], n].sort().join('|');
    if (walked.has(k)) reuse++;
    walked.add(k);
  });
  const score = 2 * Math.min(greedyGap, 5) + 2 * bind + 3 * nBind - 1.5 * Math.log2(r.optimalRoutes ?? 1) - 0.8 * Math.max(0, reuse - 2);
  results.push({
    score,
    desc: `score ${score.toFixed(1)} opt ${r.optimal} reuse ${reuse} routes ${r.optimalRoutes} greedy ${r.greedy} relaxed ${JSON.stringify(r.relaxedOptimal)}\n   shops ${JSON.stringify(shops)} houses ${JSON.stringify(houses)}\n   route ${r.route?.join(' ')}`,
  });
}
results.sort((a, b) => b.score - a.score);
console.log(`${results.length} candidates`);
for (const r of results.slice(0, Number(process.env.TOP ?? 6))) console.log(r.desc);
