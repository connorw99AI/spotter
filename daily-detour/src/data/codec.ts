import type { EdgeDef, PuzzleDef, ShopKind, Tier } from '../core/types';

/**
 * Compact text form for generated puzzles, about a tenth the size of the
 * equivalent JSON. Fields are separated by '|', items by ';'.
 *   title | brief | hint | gold | capacity | nodes | edges | depot | shops | houses | orders | water
 * Nodes are "x,y"; edges "a.b.flags[@bx,by]" with flags o(one-way a→b) c(closed) l(lane) b(bridge);
 * shops "i:k" with k in b f i g; houses are node indices lettered A, B, C… in order;
 * orders "shop.house[.fresh]"; water "x,y x,y…@width". Indices are base 36.
 */
const KIND: Record<string, ShopKind> = { b: 'bakery', f: 'florist', i: 'icecream', g: 'grocer' };
const KIND_CODE: Record<ShopKind, string> = { bakery: 'b', florist: 'f', icecream: 'i', grocer: 'g' };
const n36 = (n: number) => n.toString(36);
const p36 = (s: string) => parseInt(s, 36);
const num = (n: number) => String(Math.round(n * 100) / 100);

export function encodePuzzle(def: PuzzleDef): string {
  const idx = new Map(def.nodes.map((n, i) => [n.id, i]));
  const I = (id: string) => n36(idx.get(id)!);
  const edges = def.edges.map((e) => {
    const flags = (e.oneWay ? 'o' : '') + (e.closed ? 'c' : '') + (e.style === 'lane' ? 'l' : e.style === 'bridge' ? 'b' : '');
    return `${I(e.a)}.${I(e.b)}.${flags}${e.bend ? `@${num(e.bend[0])},${num(e.bend[1])}` : ''}`;
  });
  const fields = [
    def.title, def.brief, def.hint, String(def.gold), def.capacity ? String(def.capacity) : '',
    def.nodes.map((n) => `${num(n.x)},${num(n.y)}`).join(';'),
    edges.join(';'),
    I(def.depot),
    def.shops.map((s) => `${I(s.node)}:${KIND_CODE[s.kind]}`).join(';'),
    def.houses.map((h) => I(h.node)).join(';'),
    def.orders.map((o) => `${I(o.from)}.${I(o.to)}${o.fresh ? `.${o.fresh}` : ''}`).join(';'),
    (def.water ?? []).map((w) => `${w.points.map(([x, y]) => `${num(x)},${num(y)}`).join(' ')}@${num(w.width)}`).join(';'),
  ];
  for (const f of fields) if (f.includes('|')) throw new Error('field contains a separator');
  return fields.join('|');
}

export interface DecodeMeta {
  id: string;
  number: number;
  tier: Tier;
  pack?: string;
}

export function decodePuzzle(code: string, meta: DecodeMeta): PuzzleDef {
  const f = code.split('|');
  if (f.length !== 12) throw new Error(`bad puzzle code for ${meta.id}`);
  const [title, brief, hint, gold, cap, nodesF, edgesF, depotF, shopsF, housesF, ordersF, waterF] = f;
  const id = (i: string | number) => `n${typeof i === 'number' ? i : p36(i)}`;
  const nodes = nodesF.split(';').map((xy, i) => { const [x, y] = xy.split(',').map(Number); return { id: `n${i}`, x, y }; });
  const edges: EdgeDef[] = edgesF.split(';').map((t) => {
    const [main, bend] = t.split('@');
    const [a, b, flags = ''] = main.split('.');
    const e: EdgeDef = { a: id(a), b: id(b) };
    if (flags.includes('o')) e.oneWay = true;
    if (flags.includes('c')) e.closed = true;
    if (flags.includes('l')) e.style = 'lane';
    if (flags.includes('b')) e.style = 'bridge';
    if (bend) { const [x, y] = bend.split(',').map(Number); e.bend = [x, y]; }
    return e;
  });
  const shops = shopsF.split(';').map((t) => { const [i, k] = t.split(':'); return { node: id(i), kind: KIND[k] }; });
  const houses = housesF.split(';').map((i, k) => ({ node: id(i), letter: String.fromCharCode(65 + k) }));
  const orders = ordersF.split(';').map((t, k) => {
    const [s, h, fr] = t.split('.');
    const o: PuzzleDef['orders'][number] = { id: `o${k + 1}`, from: id(s), to: id(h) };
    if (fr) o.fresh = Number(fr);
    return o;
  });
  const mechanics: PuzzleDef['mechanics'] = [orders.length > 1 ? 'multi' : 'basic'];
  if (edges.some((e) => e.closed)) mechanics.push('closure');
  if (orders.some((o) => o.fresh !== undefined)) mechanics.push('fresh');
  if (edges.some((e) => e.oneWay)) mechanics.push('oneway');
  if (cap) mechanics.push('capacity');
  const def: PuzzleDef = {
    id: meta.id, rev: 1, number: meta.number, title, brief, hint, tier: meta.tier, mechanics,
    nodes, edges, depot: id(depotF), shops, houses, orders, gold: Number(gold),
  };
  if (meta.pack) def.pack = meta.pack;
  if (cap) def.capacity = Number(cap);
  if (waterF) {
    def.water = waterF.split(';').map((w) => {
      const [pts, width] = w.split('@');
      return { points: pts.split(' ').map((xy) => xy.split(',').map(Number) as [number, number]), width: Number(width) };
    });
  }
  return def;
}
