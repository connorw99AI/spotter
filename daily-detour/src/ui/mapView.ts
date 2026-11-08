import type { GameState } from '../core/rules';
import { edgeBetween, type Town } from '../core/town';
import type { NodeId, ShopKind } from '../core/types';
import {
  C, bushSvg, coneIcon, cottageSvg, courierSvg, depotSvg, flowersSvg, homeIcon, itemIcon, pineSvg, shopColour, shopSvg, treeSvg,
} from './art';
import {
  U, add, clearance, dist, makeSeg, mul, nodePt, pathD, pointAlong, quadAt, seeded, segAt, segTangent, streetPolylines, streetSeg,
  type Pt, type Seg,
} from './geometry';

const NS = 'http://www.w3.org/2000/svg';
const f1 = (n: number) => n.toFixed(1);

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}, inner = ''): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  if (inner) e.innerHTML = inner;
  return e;
}

export interface Overlay {
  end?: NodeId;
  legal?: readonly NodeId[];
  selected?: NodeId | null;
  objective?: NodeId | null;
  step?: [NodeId, NodeId] | null;
  focus?: readonly NodeId[];
}

/**
 * SVG renderer for one town. Static layers (ground, scenery, streets, buildings)
 * are drawn once; route, markers and overlays are redrawn from state. It knows
 * nothing about the rules beyond what it is told to draw.
 */
export class MapView {
  readonly svg: SVGSVGElement;
  readonly hitRadius: number;
  private readonly gRoute: SVGGElement;
  private readonly gTrail: SVGGElement;
  private readonly gUnder: SVGGElement;
  private readonly gMarkers: SVGGElement;
  private readonly gOver: SVGGElement;
  private readonly gFx: SVGGElement;
  private readonly courier: SVGGElement;
  private readonly lines: [Pt, Pt][];
  private readonly box: { x: number; y: number; w: number; h: number };

  constructor(readonly town: Town, label: string) {
    this.lines = streetPolylines(town);
    const pts = town.def.nodes.map((n) => ({ x: n.x, y: n.y }));
    for (const e of town.def.edges) if (e.bend) pts.push({ x: e.bend[0], y: e.bend[1] });
    let minX = Math.min(...pts.map((p) => p.x)), maxX = Math.max(...pts.map((p) => p.x));
    let minY = Math.min(...pts.map((p) => p.y)), maxY = Math.max(...pts.map((p) => p.y));
    const pad = 0.52;
    minX -= pad; maxX += pad; minY -= pad; maxY += pad;
    const minW = 4.0, minH = 4.0;
    if (maxX - minX < minW) { const c = (minX + maxX) / 2; minX = c - minW / 2; maxX = c + minW / 2; }
    if (maxY - minY < minH) { const c = (minY + maxY) / 2; minY = c - minH / 2; maxY = c + minH / 2; }
    this.box = { x: minX * U, y: minY * U, w: (maxX - minX) * U, h: (maxY - minY) * U };

    let minD = Infinity;
    const nodes = town.def.nodes;
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      minD = Math.min(minD, Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y));
    }
    this.hitRadius = Math.min(0.46 * minD, 0.5) * U;

    this.svg = el('svg', {
      viewBox: `${f1(this.box.x)} ${f1(this.box.y)} ${f1(this.box.w)} ${f1(this.box.h)}`,
      preserveAspectRatio: 'xMidYMid meet',
      class: 'map-svg',
      role: 'application',
      'aria-label': label,
      tabindex: 0,
    });
    this.svg.append(this.staticLayers());
    this.gUnder = el('g', { class: 'layer-under' });
    this.gRoute = el('g', { class: 'layer-route' });
    this.gTrail = el('g', { class: 'layer-trail' });
    this.gMarkers = el('g', { class: 'layer-markers' });
    this.gOver = el('g', { class: 'layer-over' });
    this.courier = el('g', { class: 'courier', visibility: 'hidden' }, `<g class="courier-flip">${courierSvg()}</g>`);
    this.gFx = el('g', { class: 'layer-fx' });
    this.svg.append(this.gUnder, this.gRoute, this.gTrail, this.gMarkers, this.gOver, this.courier, this.gFx);
  }

  // ─────────────────────────────── static art ───────────────────────────────

  private staticLayers(): SVGGElement {
    const g = el('g', { class: 'layer-static', 'aria-hidden': 'true' });
    const big = { x: this.box.x - 600, y: this.box.y - 600, w: this.box.w + 1200, h: this.box.h + 1200 };
    let s = `<defs>
      <pattern id="lawn-dots" width="46" height="46" patternUnits="userSpaceOnUse">
        <circle cx="8" cy="10" r="1.6" fill="${C.lawnDeep}"/><circle cx="31" cy="27" r="1.3" fill="${C.lawnDeep}"/><circle cx="20" cy="40" r="1.1" fill="#C2D49C"/>
      </pattern>
      <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="14" height="14" fill="#E7DDC8"/><rect width="6" height="14" fill="#D9CCB2"/>
      </pattern>
    </defs>
    <rect x="${big.x}" y="${big.y}" width="${big.w}" height="${big.h}" fill="${C.lawn}"/>
    <rect x="${big.x}" y="${big.y}" width="${big.w}" height="${big.h}" fill="url(#lawn-dots)"/>`;
    s += this.waterSvg();
    s += this.scenerySvg(big);
    s += this.streetsSvg();
    s += this.buildingsSvg();
    g.innerHTML = s;
    return g;
  }

  private waterSvg(): string {
    let s = '';
    for (const w of this.town.def.water ?? []) {
      const pts = w.points.map(([x, y]) => ({ x: x * U, y: y * U }));
      let d = `M${f1(pts[0].x)} ${f1(pts[0].y)}`;
      for (let i = 1; i < pts.length; i++) {
        const mid = i < pts.length - 1 ? { x: (pts[i].x + pts[i + 1].x) / 2, y: (pts[i].y + pts[i + 1].y) / 2 } : pts[i];
        d += ` Q${f1(pts[i].x)} ${f1(pts[i].y)} ${f1(mid.x)} ${f1(mid.y)}`;
      }
      const wpx = w.width * U;
      s += `<path d="${d}" fill="none" stroke="#B9D7C8" stroke-width="${wpx + 16}" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += `<path d="${d}" fill="none" stroke="${C.water}" stroke-width="${wpx}" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += `<path d="${d}" fill="none" stroke="#B7DCDD" stroke-width="3" stroke-dasharray="18 34" stroke-linecap="round" opacity=".9"/>`;
    }
    return s;
  }

  private nearWater(p: Pt, margin: number): boolean {
    for (const w of this.town.def.water ?? []) {
      for (let i = 1; i < w.points.length; i++) {
        const a = { x: w.points[i - 1][0] * U, y: w.points[i - 1][1] * U };
        const b = { x: w.points[i][0] * U, y: w.points[i][1] * U };
        const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy;
        const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
        if (Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy) < (w.width * U) / 2 + margin) return true;
      }
    }
    return false;
  }

  /** Building spots for locations, chosen beside the node where there is room. */
  private buildingSpots = new Map<NodeId, Pt>();

  private computeBuildingSpots() {
    const taken: Pt[] = [];
    const locs: NodeId[] = [this.town.depot, ...this.town.def.shops.map((s) => s.node), ...this.town.def.houses.map((h) => h.node)];
    for (const id of locs) {
      const p = nodePt(this.town, id);
      let best: Pt | null = null;
      let bestScore = -Infinity;
      for (let a = 0; a < 24; a++) {
        const ang = (a / 24) * Math.PI * 2;
        for (const r of [46, 52, 60]) {
          const q = { x: p.x + Math.cos(ang) * r, y: p.y + Math.sin(ang) * r };
          const cl = clearance(q, this.lines);
          if (cl < 30) continue;
          if (taken.some((t) => dist(t, q) < 46)) continue;
          if (this.town.def.nodes.some((n) => n.id !== id && dist(nodePt(this.town, n.id), q) < 48)) continue;
          if (this.nearWater(q, 14)) continue;
          // Prefer sitting above the node (reads as "behind" the stop) and close to it.
          const score = cl * 0.4 - r * 0.6 - Math.sin(ang) * 10;
          if (score > bestScore) { bestScore = score; best = q; }
        }
      }
      if (best) { this.buildingSpots.set(id, best); taken.push(best); }
    }
  }

  private scenerySvg(big: { x: number; y: number; w: number; h: number }): string {
    this.computeBuildingSpots();
    const rnd = seeded(this.town.def.id);
    const density = this.town.def.scenery ?? 1;
    const items: { p: Pt; svg: string }[] = [];
    const placed: Pt[] = [...this.buildingSpots.values()];
    const step = 40;
    for (let y = big.y + 300; y < big.y + big.h - 300; y += step) {
      for (let x = big.x + 300; x < big.x + big.w - 300; x += step) {
        if (rnd() > 0.55 * density) continue;
        const p = { x: x + (rnd() - 0.5) * 26, y: y + (rnd() - 0.5) * 26 };
        const roll = rnd();
        const kind = roll < 0.5 ? 'tree' : roll < 0.62 ? 'pine' : roll < 0.8 ? 'bush' : roll < 0.92 ? 'flowers' : 'cottage';
        const need = kind === 'cottage' ? 40 : kind === 'flowers' ? 20 : kind === 'bush' ? 22 : 27;
        if (clearance(p, this.lines) < need) continue;
        if (this.town.def.nodes.some((n) => dist(nodePt(this.town, n.id), p) < need + 22)) continue;
        if (this.nearWater(p, need * 0.6)) continue;
        if (placed.some((q) => dist(p, q) < need + 12)) continue;
        placed.push(p);
        const sc = 0.85 + rnd() * 0.35;
        const tone = Math.floor(rnd() * 3);
        const svg = kind === 'tree' ? treeSvg(sc, tone) : kind === 'pine' ? pineSvg(sc) : kind === 'bush' ? bushSvg(sc) : kind === 'flowers' ? flowersSvg(sc, tone)
          : cottageSvg(rnd() < 0.7 ? C.terracotta : '#C98A4B', '#F6E7CB', 0.9);
        items.push({ p, svg });
      }
    }
    for (const d of this.town.def.decor ?? []) {
      const p = { x: d.x * U, y: d.y * U };
      const svg = d.kind === 'tree' ? treeSvg(d.s ?? 1) : d.kind === 'pine' ? pineSvg(d.s ?? 1) : d.kind === 'bush' ? bushSvg(d.s ?? 1)
        : d.kind === 'flowers' ? flowersSvg(d.s ?? 1) : d.kind === 'cottage' ? cottageSvg(C.terracotta, '#F6E7CB', d.s ?? 1) : '';
      items.push({ p, svg });
    }
    items.sort((a, b) => a.p.y - b.p.y);
    return `<g class="scenery">${items.map((i) => `<g transform="translate(${f1(i.p.x)} ${f1(i.p.y)})">${i.svg}</g>`).join('')}</g>`;
  }

  private edgeD(i: number): string {
    const e = this.town.edges[i];
    const g = streetSeg(this.town, i, e.a);
    return g.c ? `M${f1(g.p0.x)} ${f1(g.p0.y)}Q${f1(g.c.x)} ${f1(g.c.y)} ${f1(g.p1.x)} ${f1(g.p1.y)}` : `M${f1(g.p0.x)} ${f1(g.p0.y)}L${f1(g.p1.x)} ${f1(g.p1.y)}`;
  }

  private streetsSvg(): string {
    const edges = this.town.edges;
    const w = (i: number) => (edges[i].style === 'lane' ? [24, 17] : [36, 27]);
    let kerb = '', surf = '', marks = '', extras = '';
    edges.forEach((e, i) => {
      const d = this.edgeD(i);
      const [kw, sw] = w(i);
      if (e.style === 'bridge') {
        kerb += `<path d="${d}" stroke="#7A5A3A" stroke-width="${kw + 6}" stroke-linecap="butt"/>`;
        surf += `<path d="${d}" stroke="#E2C79A" stroke-width="${sw + 2}" stroke-linecap="butt"/>`;
        marks += `<path d="${d}" stroke="#C9A877" stroke-width="${sw}" stroke-dasharray="3 9" stroke-linecap="butt"/>`;
      } else {
        kerb += `<path d="${d}" stroke="${C.kerb}" stroke-width="${kw}"/>`;
        surf += `<path d="${d}" stroke="${e.closed ? 'url(#hatch)' : C.road}" stroke-width="${sw}"/>`;
        if (e.style !== 'lane' && !e.closed && !e.oneWay) {
          marks += `<path d="${d}" stroke="#E4D6B6" stroke-width="2.4" stroke-dasharray="10 14" stroke-dashoffset="-6"/>`;
        }
      }
      const g = streetSeg(this.town, i, e.a);
      const at = (t: number) => (g.c ? quadAt(g.p0, g.c, g.p1, t) : { x: g.p0.x + (g.p1.x - g.p0.x) * t, y: g.p0.y + (g.p1.y - g.p0.y) * t });
      const tan = (t: number) => (g.c ? { x: 2 * (1 - t) * (g.c.x - g.p0.x) + 2 * t * (g.p1.x - g.c.x), y: 2 * (1 - t) * (g.c.y - g.p0.y) + 2 * t * (g.p1.y - g.c.y) } : { x: g.p1.x - g.p0.x, y: g.p1.y - g.p0.y });
      const len = g.c ? 1.1 * dist(g.p0, g.p1) : dist(g.p0, g.p1);
      if (e.oneWay) {
        // Curved one-way streets (roundabouts) get two arrows so the flow reads as a circle.
        const n = g.c ? 2 : Math.max(1, Math.round(len / 46) - 1);
        for (let k = 1; k <= n; k++) {
          const t = k / (n + 1);
          const p = at(t), tg = tan(t);
          const ang = (Math.atan2(tg.y, tg.x) * 180) / Math.PI;
          extras += `<path d="M-5-6.5 3.5 0-5 6.5" transform="translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1(ang)})" fill="none" stroke="${C.forest}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>`;
        }
      }
      if (e.closed) {
        const p = at(0.5), tg = tan(0.5);
        const ang = (Math.atan2(tg.y, tg.x) * 180) / Math.PI;
        extras += `<g transform="translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1(ang)})">
          <rect x="-4" y="-21" width="8" height="42" rx="3" fill="#FFFAF0" stroke="#8E4127" stroke-width="1.6"/>
          <path d="M-4-14h8M-4-2h8M-4 10h8" stroke="#C8483A" stroke-width="5"/>
        </g>
        <g transform="translate(${f1(p.x + 0)} ${f1(p.y)}) translate(0 -2) scale(1.05)">${coneIcon}</g>`;
      }
    });
    let plazas = '';
    for (const n of this.town.def.nodes) {
      const p = nodePt(this.town, n.id);
      const inc = this.town.incident.get(n.id) ?? [];
      const laneOnly = inc.every((i) => edges[i].style === 'lane');
      const bridgeOnly = inc.every((i) => edges[i].style === 'bridge');
      if (bridgeOnly) continue;
      plazas += `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="${laneOnly ? 12 : 18}" fill="${C.kerb}"/>`;
    }
    let plazaTop = '';
    for (const n of this.town.def.nodes) {
      const p = nodePt(this.town, n.id);
      const inc = this.town.incident.get(n.id) ?? [];
      const laneOnly = inc.every((i) => edges[i].style === 'lane');
      if (inc.every((i) => edges[i].style === 'bridge')) continue;
      plazaTop += `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="${laneOnly ? 8.5 : 13.5}" fill="${C.road}"/>`;
    }
    return `<g class="streets" fill="none" stroke-linecap="round">${kerb}${plazas}${surf}${plazaTop}${marks}</g><g class="street-signs">${extras}</g>`;
  }

  private buildingsSvg(): string {
    let s = '';
    const items: { p: Pt; svg: string }[] = [];
    for (const [id, p] of this.buildingSpots) {
      const shop = this.town.shopKind.get(id);
      const svg = id === this.town.depot ? depotSvg(0.95) : shop ? shopSvg(shop, 0.95) : cottageSvg(C.terracotta, '#F6E7CB', 0.9);
      items.push({ p, svg });
    }
    items.sort((a, b) => a.p.y - b.p.y);
    for (const i of items) s += `<g transform="translate(${f1(i.p.x)} ${f1(i.p.y - 4)})">${i.svg}</g>`;
    return `<g class="buildings">${s}</g>`;
  }

  // ───────────────────────────── coordinates ─────────────────────────────

  toMap(clientX: number, clientY: number): Pt | null {
    const m = this.svg.getScreenCTM();
    if (!m) return null;
    const pt = this.svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const r = pt.matrixTransform(m.inverse());
    return { x: r.x, y: r.y };
  }

  /** Closest candidate node within the touch radius of p. */
  nodeNear(p: Pt, candidates: Iterable<NodeId>, radius = this.hitRadius): NodeId | null {
    let best: NodeId | null = null;
    let bd = radius;
    for (const id of candidates) {
      const d = dist(p, nodePt(this.town, id));
      if (d <= bd) { bd = d; best = id; }
    }
    return best;
  }

  nodeScreenPos(id: NodeId): { x: number; y: number } | null {
    const m = this.svg.getScreenCTM();
    if (!m) return null;
    const p = nodePt(this.town, id);
    const pt = this.svg.createSVGPoint();
    pt.x = p.x; pt.y = p.y;
    const r = pt.matrixTransform(m);
    return { x: r.x, y: r.y };
  }

  // ─────────────────────────────── route ───────────────────────────────

  /** Continuous geometry for a route, with repeated streets drawn side by side. */
  routeSegments(route: readonly NodeId[]): Seg[] {
    const total = new Map<number, number>();
    for (let i = 1; i < route.length; i++) {
      const e = edgeBetween(this.town, route[i - 1], route[i])!;
      total.set(e, (total.get(e) ?? 0) + 1);
    }
    const seen = new Map<number, number>();
    const segs: Seg[] = [];
    let last: Pt | null = null;
    for (let i = 1; i < route.length; i++) {
      const u = route[i - 1], v = route[i];
      const ei = edgeBetween(this.town, u, v)!;
      const e = this.town.edges[ei];
      const k = seen.get(ei) ?? 0;
      seen.set(ei, k + 1);
      const n = total.get(ei)!;
      const canon = streetSeg(this.town, ei, e.a);
      const dir = { x: canon.p1.x - canon.p0.x, y: canon.p1.y - canon.p0.y };
      const len = Math.hypot(dir.x, dir.y) || 1;
      const normal = { x: -dir.y / len, y: dir.x / len };
      const off = mul(normal, (k - (n - 1) / 2) * 9);
      const g = streetSeg(this.town, ei, u);
      const p0 = add(g.p0, off), p1 = add(g.p1, off);
      const c = g.c ? add(g.c, off) : undefined;
      if (last && dist(last, p0) > 0.5) segs.push(makeSeg(last, p0));
      segs.push(makeSeg(p0, p1, c, i));
      last = p1;
    }
    return segs;
  }

  renderRoute(route: readonly NodeId[], dim = false) {
    const segs = this.routeSegments(route);
    if (!segs.length) { this.gRoute.innerHTML = ''; return; }
    const d = pathD(segs);
    let s = `<path d="${d}" class="route-casing"/><path d="${d}" class="route-line${dim ? ' dim' : ''}"/>`;
    // Direction chevrons, one per street traversal.
    for (const sg of segs) {
      if (sg.arrive === undefined || sg.len < 30) continue;
      const p = segAt(sg, 0.5), t = segTangent(sg, 0.5);
      const ang = (Math.atan2(t.y, t.x) * 180) / Math.PI;
      s += `<path class="route-chev" d="M-3.5-4.5 2.5 0-3.5 4.5" transform="translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1(ang)})"/>`;
    }
    // Traversal counts on reused streets.
    const counts = new Map<number, number>();
    for (let i = 1; i < route.length; i++) {
      const e = edgeBetween(this.town, route[i - 1], route[i])!;
      counts.set(e, (counts.get(e) ?? 0) + 1);
    }
    for (const [ei, n] of counts) {
      if (n < 2) continue;
      const e = this.town.edges[ei];
      const g = streetSeg(this.town, ei, e.a);
      const mid = g.c ? quadAt(g.p0, g.c, g.p1, 0.5) : { x: (g.p0.x + g.p1.x) / 2, y: (g.p0.y + g.p1.y) / 2 };
      const dir = { x: g.p1.x - g.p0.x, y: g.p1.y - g.p0.y };
      const l = Math.hypot(dir.x, dir.y) || 1;
      let nrm = { x: -dir.y / l, y: dir.x / l };
      if (nrm.y > 0 || (nrm.y === 0 && nrm.x < 0)) nrm = mul(nrm, -1);
      const at = add(mid, mul(nrm, 22 + n * 4));
      s += `<g class="route-count" transform="translate(${f1(at.x)} ${f1(at.y)})"><rect x="-15" y="-11" width="30" height="22" rx="11"/><text y="5.5">×${n}</text></g>`;
    }
    this.gRoute.innerHTML = s;
  }

  /** Ridden-trail overlay: the first `length` units of the route drawn in gold. */
  renderTrail(segs: readonly Seg[], length: number) {
    if (!segs.length || length <= 0) { this.gTrail.innerHTML = ''; return; }
    const total = segs.reduce((a, s) => a + s.len, 0);
    this.gTrail.innerHTML = `<path d="${pathD(segs)}" pathLength="${f1(total)}" class="route-trail" stroke-dasharray="${f1(length)} ${f1(total + 10)}"/>`;
  }

  clearTrail() { this.gTrail.innerHTML = ''; }

  // ─────────────────────────────── markers ───────────────────────────────

  renderMarkers(state: GameState, focus: readonly NodeId[] = []) {
    const t = this.town;
    let s = '';
    const dp = nodePt(t, t.depot);
    s += `<g class="mk mk-depot${focus.includes(t.depot) ? ' focus' : ''}" transform="translate(${f1(dp.x)} ${f1(dp.y)})"><g class="mk-body"><circle r="23" class="mk-depot-disc"/><g transform="scale(1.05)">${homeIcon}</g></g></g>`;
    for (const shop of t.def.shops) {
      const p = nodePt(t, shop.node);
      const col = shopColour[shop.kind];
      const ids = t.ordersAtShop.get(shop.node) ?? [];
      const waiting = ids.filter((i) => state.orders[i].status === 0);
      const fresh = ids.map((i) => t.orders[i].fresh).find((v) => v !== undefined);
      const done = waiting.length === 0;
      let extra = '';
      if (!done && waiting.length > 1) extra += `<g transform="translate(18 -18)"><circle r="10" class="mk-count"/><text y="4.5" class="mk-count-t">${waiting.length}</text></g>`;
      if (!done && fresh !== undefined) extra += `<g transform="translate(0 27)"><rect x="-17" y="-9" width="34" height="18" rx="9" class="mk-fresh"/><path d="M-9.5-4.5v9M-13.4-2.2l7.8 4.4M-13.4 2.2l7.8-4.4" class="mk-fresh-ico"/><text x="5" y="5" class="mk-fresh-t">${fresh}</text></g>`;
      if (done) extra += `<g transform="translate(17 -17)"><circle r="9" fill="${C.moss}" stroke="#FFFAF0" stroke-width="2"/><path d="M-4 0l3 3 5-6" fill="none" stroke="#FFFAF0" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>`;
      s += `<g class="mk mk-shop${done ? ' done' : ''}${focus.includes(shop.node) ? ' focus' : ''}" transform="translate(${f1(p.x)} ${f1(p.y)})"><g class="mk-body">
        <g class="mk-face"><circle r="23" fill="${col.fill}" stroke="#FFFAF0" stroke-width="4"/><circle r="16" fill="#FFFAF0"/>
        <g transform="scale(.92)">${itemIcon[shop.kind]}</g></g>${extra}</g></g>`;
    }
    for (const house of t.def.houses) {
      const p = nodePt(t, house.node);
      const ids = t.ordersForHouse.get(house.node) ?? [];
      const delivered = ids.every((i) => state.orders[i].status === 2);
      const want = ids.filter((i) => state.orders[i].status !== 2).map((i) => t.shopKind.get(t.orders[i].from)!);
      let bubbles = '';
      want.forEach((k: ShopKind, j) => {
        bubbles += `<g transform="translate(${19 + j * 9} ${-17 - j * 3})"><circle r="11" fill="#FFFAF0" stroke="${shopColour[k].deep}" stroke-width="1.6"/><g transform="scale(.6)">${itemIcon[k]}</g></g>`;
      });
      if (delivered) bubbles = `<g transform="translate(18 -16)"><circle r="10" fill="${C.moss}" stroke="#FFFAF0" stroke-width="2"/><path d="M-4.5 0l3 3.2 5.6-6.4" fill="none" stroke="#FFFAF0" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g>`;
      s += `<g class="mk mk-house${delivered ? ' done' : ''}${focus.includes(house.node) ? ' focus' : ''}" transform="translate(${f1(p.x)} ${f1(p.y)})"><g class="mk-body">
        <path d="M-19-9 0-27 19-9Z" class="mk-roof"/>
        <circle r="19" class="mk-house-disc"/><text y="7.5" class="mk-letter">${house.letter}</text>${bubbles}</g></g>`;
    }
    this.gMarkers.innerHTML = s;
  }

  // ─────────────────────────────── overlays ───────────────────────────────

  renderOverlay(o: Overlay) {
    let under = '', over = '';
    for (const id of o.legal ?? []) {
      const p = nodePt(this.town, id);
      under += `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="31" class="legal-halo"/>`;
    }
    if (o.objective) {
      const p = nodePt(this.town, o.objective);
      under += `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="40" class="hint-halo"/>`;
      over += `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="34" class="hint-ring"/>`;
    }
    if (o.step) {
      const [a, b] = o.step;
      const ei = edgeBetween(this.town, a, b);
      if (ei !== undefined) {
        const g = streetSeg(this.town, ei, a);
        const seg = makeSeg(g.p0, g.p1, g.c);
        const head = segAt(seg, 0.78), tg = segTangent(seg, 0.78);
        const ang = (Math.atan2(tg.y, tg.x) * 180) / Math.PI;
        const d = g.c ? `M${f1(g.p0.x)} ${f1(g.p0.y)}Q${f1(g.c.x)} ${f1(g.c.y)} ${f1(g.p1.x)} ${f1(g.p1.y)}` : `M${f1(g.p0.x)} ${f1(g.p0.y)}L${f1(g.p1.x)} ${f1(g.p1.y)}`;
        over += `<path d="${d}" class="hint-step"/><path d="M-11-12 6 0-11 12" transform="translate(${f1(head.x)} ${f1(head.y)}) rotate(${f1(ang)})" class="hint-step-head"/>`;
      }
    }
    if (o.end) {
      const p = nodePt(this.town, o.end);
      over += `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="29" class="end-ring"/>`;
    }
    if (o.selected) {
      const p = nodePt(this.town, o.selected);
      over += `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="33" class="kbd-ring"/>`;
    }
    this.gUnder.innerHTML = under;
    this.gOver.innerHTML = over;
  }

  // ─────────────────────────────── effects ───────────────────────────────

  private fxTimers = new Set<number>();

  private fx(markup: string, ms: number) {
    const g = el('g', {}, markup);
    this.gFx.append(g);
    const t = window.setTimeout(() => { g.remove(); this.fxTimers.delete(t); }, ms);
    this.fxTimers.add(t);
  }

  flashBlocked(from: NodeId, to: NodeId) {
    const ei = edgeBetween(this.town, from, to);
    if (ei !== undefined) {
      this.fx(`<path d="${this.edgeD(ei)}" class="blocked-flash"/>`, 700);
    } else {
      const p = nodePt(this.town, to);
      this.fx(`<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="26" class="blocked-ring"/>`, 700);
    }
  }

  pop(node: NodeId, kind: 'pickup' | 'deliver' | 'full', shop: ShopKind) {
    const p = nodePt(this.town, node);
    const sign = kind === 'pickup' ? '+' : kind === 'deliver' ? '✓' : '…';
    const cls = kind === 'deliver' ? 'pop pop-deliver' : kind === 'full' ? 'pop pop-full' : 'pop';
    this.fx(`<g class="${cls}" transform="translate(${f1(p.x)} ${f1(p.y - 34)})"><g class="pop-in">
      <rect x="-30" y="-16" width="60" height="32" rx="16" class="pop-bg"/>
      <text x="-14" y="7" class="pop-sign">${sign}</text><g transform="translate(10 0) scale(.75)">${itemIcon[shop]}</g></g></g>`, 1100);
  }

  // ─────────────────────────────── courier ───────────────────────────────

  placeCourier(segs: readonly Seg[], length: number) {
    const { p, tangent } = pointAlong(segs, length);
    this.showCourierAt(p, tangent.x < -0.01);
  }

  showCourierAt(p: Pt, faceLeft: boolean) {
    this.courier.setAttribute('visibility', 'visible');
    this.courier.setAttribute('transform', `translate(${f1(p.x)} ${f1(p.y - 10)}) scale(.82)`);
    (this.courier.firstElementChild as SVGGElement).setAttribute('transform', faceLeft ? 'scale(-1 1)' : '');
  }

  hideCourier() {
    this.courier.setAttribute('visibility', 'hidden');
  }

  destroy() {
    for (const t of this.fxTimers) clearTimeout(t);
    this.fxTimers.clear();
    this.svg.remove();
  }
}
