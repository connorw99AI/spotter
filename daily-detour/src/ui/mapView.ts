import type { GameState } from '../core/rules';
import { edgeBetween, type Town } from '../core/town';
import type { NodeId, ShopKind } from '../core/types';
import { C, courierSvg, fragileIcon, homeIcon, itemIcon, shopColour } from './art';
import { portraitSvg } from './portraits';
import {
  U, add, dist, makeSeg, mul, nodePt, pathD, pointAlong, quadAt, segAt, segTangent, streetSeg,
  type Pt, type Seg,
} from './geometry';
import { buildScene, waterShimmerSvg } from './scene';
import type { Theme } from './theme';

const NS = 'http://www.w3.org/2000/svg';
const f1 = (n: number) => n.toFixed(1);
type Box = { x: number; y: number; w: number; h: number };
const grow = (b: Box, m: number): Box => ({ x: b.x - m, y: b.y - m, w: b.w + 2 * m, h: b.h + 2 * m });
const covers = (a: Box, b: Box) => a.x <= b.x && a.y <= b.y && a.x + a.w >= b.x + b.w && a.y + a.h >= b.y + b.h;

/** A standing game token: ground shadow, a coloured rim with depth, ready for a face on top. */
function token(r: number, fill: string, deep: string): string {
  return `<ellipse cy="${f1(r * 0.86)}" rx="${f1(r * 1.02)}" ry="${f1(r * 0.34)}" class="mk-shadow"/>`
    + `<circle cy="4" r="${r}" fill="${deep}"/><circle r="${r}" fill="${fill}" stroke="#FFFAF0" stroke-width="3.5"/>`;
}
/** A soft highlight across the top-left of a token, so it reads as glossy and lit. */
function gloss(r: number): string {
  const a = r * 0.72;
  return `<path d="M${f1(-a * 0.92)} ${f1(-a * 0.36)}A${f1(a)} ${f1(a)} 0 0 1 ${f1(a * 0.3)} ${f1(-a * 0.94)}" class="mk-gloss"/>`;
}
const PIP = portraitSvg('Pip', 40).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
const HOUSE_D = 'M-17-4 0-19 17-4V14Q17 18 13 18H-13Q-17 18-17 14Z';

/** Room kept clear of the town on each side, in screen pixels: the floating HUD sits there. */
export interface Insets { top: number; right: number; bottom: number; left: number }

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
  /** Stacked layers: painted-once scenery, light ambient motion, then the interactive map. */
  readonly root: HTMLDivElement;
  readonly svg: SVGSVGElement;
  readonly hitRadius: number;
  private readonly gRoute: SVGGElement;
  private readonly gTrail: SVGGElement;
  private readonly gUnder: SVGGElement;
  private readonly gGhost: SVGGElement;
  private readonly gMarkers: SVGGElement;
  private readonly gOver: SVGGElement;
  private readonly gFx: SVGGElement;
  private readonly courier: SVGGElement;
  private readonly box: Box;
  /** The part of the world on screen, and how far out the scenery has been painted. */
  private view: Box;
  private painted: Box;
  private readonly sceneSvg: SVGSVGElement;
  private readonly ambientSvg: SVGSVGElement;

  constructor(readonly town: Town, label: string, private readonly theme: Theme) {
    const pts = town.def.nodes.map((n) => ({ x: n.x, y: n.y }));
    for (const e of town.def.edges) if (e.bend) pts.push({ x: e.bend[0], y: e.bend[1] });
    let minX = Math.min(...pts.map((p) => p.x)), maxX = Math.max(...pts.map((p) => p.x));
    let minY = Math.min(...pts.map((p) => p.y)), maxY = Math.max(...pts.map((p) => p.y));
    const pad = 0.52;
    minX -= pad; maxX += pad; minY -= pad; maxY += pad;
    const minW = 3.3, minH = 3.3;
    if (maxX - minX < minW) { const c = (minX + maxX) / 2; minX = c - minW / 2; maxX = c + minW / 2; }
    if (maxY - minY < minH) { const c = (minY + maxY) / 2; minY = c - minH / 2; maxY = c + minH / 2; }
    this.box = { x: minX * U, y: minY * U, w: (maxX - minX) * U, h: (maxY - minY) * U };

    let minD = Infinity;
    const nodes = town.def.nodes;
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      minD = Math.min(minD, Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y));
    }
    this.hitRadius = Math.min(0.46 * minD, 0.5) * U;

    this.view = this.box;
    this.painted = grow(this.box, 240);
    const viewBox = `${f1(this.box.x)} ${f1(this.box.y)} ${f1(this.box.w)} ${f1(this.box.h)}`;
    const scene = el('svg', { viewBox, preserveAspectRatio: 'xMidYMid meet', class: 'map-scene', 'aria-hidden': 'true' });
    const ambient = el('svg', { viewBox, preserveAspectRatio: 'xMidYMid meet', class: 'map-ambient', 'aria-hidden': 'true' });
    this.sceneSvg = scene;
    this.ambientSvg = ambient;
    this.paint();
    this.svg = el('svg', {
      viewBox,
      preserveAspectRatio: 'xMidYMid meet',
      class: 'map-svg',
      role: 'application',
      'aria-label': label,
      tabindex: 0,
    });
    this.root = document.createElement('div');
    this.root.className = 'map-stack';
    this.root.append(scene, ambient, this.svg);
    this.gUnder = el('g', { class: 'layer-under' });
    this.gGhost = el('g', { class: 'layer-ghost' });
    this.gRoute = el('g', { class: 'layer-route' });
    this.gTrail = el('g', { class: 'layer-trail' });
    this.gMarkers = el('g', { class: 'layer-markers' });
    this.gOver = el('g', { class: 'layer-over' });
    this.courier = el('g', { class: 'courier', visibility: 'hidden' }, `<g class="courier-flip">${courierSvg()}</g>`);
    this.gFx = el('g', { class: 'layer-fx' });
    this.svg.append(this.gGhost, this.gUnder, this.gRoute, this.gTrail, this.gMarkers, this.gOver, this.courier, this.gFx);
  }

  // ─────────────────────────────── static art ───────────────────────────────

  /** Paint (or repaint, wider) the scenery and the drifting ambient layer. */
  private paint() {
    const g = el('g', { class: 'layer-static', 'aria-hidden': 'true' });
    g.innerHTML = buildScene(this.town, this.box, this.theme, this.painted);
    this.sceneSvg.replaceChildren(g);
    this.ambientSvg.replaceChildren(this.cloudLayer());
    this.ambientSvg.insertAdjacentHTML('afterbegin', waterShimmerSvg(this.town, this.theme));
  }

  /**
   * Fill a W×H screen edge to edge, with the town centred in the space the HUD
   * leaves free. Scenery is painted further out if the screen shows more world.
   */
  fitView(W: number, H: number, ins: Insets) {
    if (W < 40 || H < 40) return;
    const iw = Math.max(120, W - ins.left - ins.right), ih = Math.max(120, H - ins.top - ins.bottom);
    // Pixels per map unit; capped so a small town on a big screen doesn't turn into a toy.
    const k = Math.min(iw / this.box.w, ih / this.box.h, 1.45);
    const cx = this.box.x + this.box.w / 2, cy = this.box.y + this.box.h / 2;
    const v = { x: cx - (ins.left + iw / 2) / k, y: cy - (ins.top + ih / 2) / k, w: W / k, h: H / k };
    this.view = v;
    const vb = `${f1(v.x)} ${f1(v.y)} ${f1(v.w)} ${f1(v.h)}`;
    for (const svg of [this.sceneSvg, this.ambientSvg, this.svg]) svg.setAttribute('viewBox', vb);
    if (!covers(this.painted, v)) {
      // Round up generously so a rotation or a resize rarely needs another repaint.
      this.painted = grow(v, 220);
      this.paint();
    }
  }

  /** Slow cloud shadows drifting over the town (hidden when motion is reduced). */
  private cloudLayer(): SVGGElement {
    const g = el('g', { class: 'layer-clouds', 'aria-hidden': 'true' });
    const b = this.painted;
    const r = Math.max(b.w, b.h);
    let s = `<defs><radialGradient id="m-cloud"><stop offset="0" stop-color="#23352B" stop-opacity=".11"/><stop offset=".6" stop-color="#23352B" stop-opacity=".06"/><stop offset="1" stop-color="#23352B" stop-opacity="0"/></radialGradient></defs>`;
    [[0.2, 0.25, 0], [0.7, 0.65, -22], [0.35, 0.9, -45]].forEach(([fx, fy, delay], i) => {
      s += `<g class="cloud" style="animation-delay:${delay}s"><ellipse cx="${f1(b.x + b.w * fx)}" cy="${f1(b.y + b.h * fy)}" rx="${f1(r * 0.28)}" ry="${f1(r * 0.15)}" fill="url(#m-cloud)"/>${i === 1 ? `<ellipse cx="${f1(b.x + b.w * fx + r * 0.16)}" cy="${f1(b.y + b.h * fy - r * 0.06)}" rx="${f1(r * 0.17)}" ry="${f1(r * 0.11)}" fill="url(#m-cloud)"/>` : ''}</g>`;
    });
    s += this.particles();
    g.innerHTML = s;
    return g;
  }

  /** Seasonal life in the air: petals, butterflies, leaves, fireflies or snow. */
  private particles(): string {
    const b = this.view;
    const kind = this.theme.name;
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const dense = Math.min(2.4, Math.max(1, (b.w * b.h) / (520 * 520)));
    const n = Math.round((kind === 'winter' ? 34 : kind === 'evening' ? 16 : kind === 'summer' ? 7 : 18) * dense);
    let s = `<g class="particles particles-${kind}">`;
    for (let i = 0; i < n; i++) {
      const x = b.x + rnd() * b.w, y = b.y + rnd() * b.h;
      const dur = (kind === 'winter' ? 9 : kind === 'evening' ? 6 : 14) + rnd() * 8;
      const delay = -rnd() * dur;
      const dx = (kind === 'winter' ? 30 : kind === 'evening' ? 24 : 120) * (rnd() < 0.5 ? -1 : 1) * (0.5 + rnd());
      const dy = kind === 'evening' ? -30 - rnd() * 30 : kind === 'summer' ? (rnd() - 0.5) * 80 : b.h * 0.45 + rnd() * 120;
      const style = `--dx:${f1(dx)}px;--dy:${f1(dy)}px;--spin:${Math.round(rnd() * 540 - 270)}deg;animation-duration:${f1(dur)}s;animation-delay:${f1(delay)}s`;
      const shape = kind === 'spring' ? `<ellipse rx="3.4" ry="2" fill="${rnd() < 0.5 ? '#F7CFDC' : '#FFFFFF'}" opacity=".9"/>`
        : kind === 'autumn' ? `<path d="M0-4C3-3 4 1 0 5-4 1-3-3 0-4Z" fill="${['#D9853C', '#C46A3E', '#EDAE5A'][i % 3]}"/>`
        : kind === 'winter' ? `<circle r="${f1(1.4 + rnd() * 1.8)}" fill="#FFFFFF" opacity=".95"/>`
        : kind === 'evening' ? `<circle r="2.2" fill="#FFF3B0"/><circle r="7" fill="#FFE38A" opacity=".25"/>`
        : `<g class="wings"><path d="M0 0C-5-6-9-2-6 2Z" fill="#F2D36B"/><path d="M0 0C5-6 9-2 6 2Z" fill="#F2D36B"/></g>`;
      s += `<g transform="translate(${f1(x)} ${f1(y)})"><g class="particle" style="${style}">${shape}</g></g>`;
    }
    return s + '</g>';
  }

  private edgeD(i: number): string {
    const e = this.town.edges[i];
    const g = streetSeg(this.town, i, e.a);
    return g.c ? `M${f1(g.p0.x)} ${f1(g.p0.y)}Q${f1(g.c.x)} ${f1(g.c.y)} ${f1(g.p1.x)} ${f1(g.p1.y)}` : `M${f1(g.p0.x)} ${f1(g.p0.y)}L${f1(g.p1.x)} ${f1(g.p1.y)}`;
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

  /** Your best route so far, drawn faintly beneath the one you're planning. */
  renderGhost(route: readonly NodeId[] | null) {
    this.gGhost.innerHTML = route && route.length > 1 ? `<path d="${pathD(this.routeSegments(route))}" class="ghost-line"/>` : '';
  }

  renderRoute(route: readonly NodeId[], dim = false) {
    const segs = this.routeSegments(route);
    if (!segs.length) { this.gRoute.innerHTML = ''; return; }
    const d = pathD(segs);
    const total = segs.reduce((a, g) => a + g.len, 0);
    // A bright dashed current flowing along the line shows its direction at a glance.
    let s = `<path d="${d}" class="route-casing"/><path d="${d}" class="route-line${dim ? ' dim' : ''}"/>${dim ? '' : `<path d="${d}" class="route-flow" style="--len:${f1(total)}"/>`}`;
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
    s += `<g class="mk mk-depot${focus.includes(t.depot) ? ' focus' : ''}" transform="translate(${f1(dp.x)} ${f1(dp.y)})"><g class="mk-body">${token(23, C.forest, C.forestDeep)}<circle r="17" fill="${C.forest}"/><g transform="scale(1.1)">${homeIcon}</g>${gloss(23)}</g></g>`;
    for (const shop of t.def.shops) {
      const p = nodePt(t, shop.node);
      const col = shopColour[shop.kind];
      const ids = t.ordersAtShop.get(shop.node) ?? [];
      const waiting = ids.filter((i) => state.orders[i].status === 0);
      const fresh = ids.map((i) => t.orders[i].fresh).find((v) => v !== undefined);
      const done = waiting.length === 0;
      let extra = '';
      if (!done && waiting.length > 1) extra += `<g transform="translate(18 -18)"><circle r="10" class="mk-count"/><text y="4.5" class="mk-count-t">${waiting.length}</text></g>`;
      const opens = t.opensAt.get(shop.node);
      if (!done && opens !== undefined) {
        const open = state.moves >= opens;
        extra += `<g transform="translate(${fresh !== undefined ? -24 : 0} 27)"><rect x="${open ? -23 : -19}" y="-9" width="${open ? 46 : 38}" height="18" rx="9" class="mk-hours${open ? ' open' : ''}"/><circle cx="-9" r="5" fill="#FFFAF0" stroke="currentColor" stroke-width="1.6" class="mk-hours-ico"/><path d="M-9-2.8V0l2 1.4" fill="none" stroke="currentColor" stroke-width="1.4" class="mk-hours-ico"/><text x="${open ? 7 : 5}" y="4.6" class="mk-hours-t">${open ? 'open' : opens}</text></g>`;
      }
      if (!done && ids.some((i) => t.orders[i].fragile)) extra += `<g transform="translate(-19 -18)"><circle r="10" class="mk-fragile"/><g transform="scale(.62)" class="mk-fragile-ico">${fragileIcon}</g></g>`;
      if (!done && fresh !== undefined) extra += `<g transform="translate(0 27)"><rect x="-17" y="-9" width="34" height="18" rx="9" class="mk-fresh"/><path d="M-9.5-4.5v9M-13.4-2.2l7.8 4.4M-13.4 2.2l7.8-4.4" class="mk-fresh-ico"/><text x="5" y="5" class="mk-fresh-t">${fresh}</text></g>`;
      if (done) extra += `<g transform="translate(17 -17)"><circle r="9" fill="${C.moss}" stroke="#FFFAF0" stroke-width="2"/><path d="M-4 0l3 3 5-6" fill="none" stroke="#FFFAF0" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>`;
      s += `<g class="mk mk-shop${done ? ' done' : ''}${focus.includes(shop.node) ? ' focus' : ''}" transform="translate(${f1(p.x)} ${f1(p.y)})"><g class="mk-body">
        <g class="mk-face">${token(23, col.fill, col.deep)}<circle r="16" fill="#FFFAF0"/>
        <g transform="scale(.92)">${itemIcon[shop.kind]}</g>${gloss(23)}</g>${extra}</g></g>`;
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
      // Ready: something for this house is in the basket, so it hops to say "me next".
      const ready = !delivered && ids.some((i) => state.orders[i].status === 1);
      s += `<g class="mk mk-house${delivered ? ' done' : ''}${ready ? ' ready' : ''}${focus.includes(house.node) ? ' focus' : ''}" transform="translate(${f1(p.x)} ${f1(p.y)})"><g class="mk-body">
        <ellipse cy="19" rx="20" ry="6.5" class="mk-shadow"/>
        <path d="${HOUSE_D}" transform="translate(0 4)" class="mk-house-side"/>
        <path d="${HOUSE_D}" class="mk-house-disc"/>
        <path d="M-22-3.5 0-24.5 22-3.5 17.5.5 0-15.5-17.5.5Z" class="mk-roof"/>
        <rect x="8" y="-21" width="5.5" height="9" rx="1" class="mk-roof"/>
        <text y="12.5" class="mk-letter">${house.letter}</text>${bubbles}</g></g>`;
    }
    // Garden gates: shut until their house has its delivery, then swung open.
    t.edges.forEach((e, ei) => {
      if (!e.gate) return;
      const open = (t.ordersForHouse.get(e.gate) ?? []).every((i) => state.orders[i].status === 2);
      const g = streetSeg(t, ei, e.a);
      const seg = makeSeg(g.p0, g.p1, g.c);
      const mid = segAt(seg, 0.5), tg = segTangent(seg, 0.5);
      const ang = (Math.atan2(tg.y, tg.x) * 180) / Math.PI;
      const letter = t.houseLetter.get(e.gate);
      s += `<g class="gate${open ? ' open' : ''}" transform="translate(${f1(mid.x)} ${f1(mid.y)}) rotate(${f1(ang)})">
        <rect x="-4.5" y="-20" width="9" height="8" rx="2" class="gate-post"/><rect x="-4.5" y="12" width="9" height="8" rx="2" class="gate-post"/>
        <g class="gate-leaf"><rect x="-4" y="-13" width="8" height="26" rx="2" class="gate-wood"/><path d="M-4-6.5H4M-4 0H4M-4 6.5H4" class="gate-slat"/></g>
        <g transform="rotate(${f1(-ang)}) translate(20 -18)"><rect x="-13" y="-11" width="26" height="22" rx="6" class="gate-tag"/><text y="5.5" class="gate-tag-t">${open ? '✓' : letter}</text></g>
      </g>`;
    });
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
      // Pip, hovering over wherever the route has reached: "you are here".
      over += `<g class="pip-pin" transform="translate(${f1(p.x)} ${f1(p.y)})"><g class="pip-pin-bob">
        <ellipse cy="-27" rx="8" ry="2.6" class="pip-pin-shadow"/>
        <path d="M-7-41 0-30 7-41Z" class="pip-pin-tail"/>
        <circle cy="-52" r="17" class="pip-pin-ring"/>
        <svg x="-15" y="-67" width="30" height="30" viewBox="-20 -20 40 40">${PIP}</svg>
      </g></g>`;
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

  pop(node: NodeId, kind: 'pickup' | 'deliver' | 'full', shop: ShopKind, who?: string) {
    const p = nodePt(this.town, node);
    if (kind === 'deliver' && who) {
      // The resident pops out to say thank you.
      this.fx(`<g class="resident-pop" transform="translate(${f1(p.x + 22)} ${f1(p.y - 58)})"><g class="resident-pop-in">
        <path d="M-6 18 0 26 6 18Z" fill="#FFFAF0" stroke="#4E7D46" stroke-width="2.4" stroke-linejoin="round"/>
        <circle r="23" fill="#FFFAF0" stroke="#4E7D46" stroke-width="2.6"/>
        <svg x="-20" y="-20" width="40" height="40" viewBox="-20 -20 40 40">${portraitSvg(who, 40).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</svg>
        <g transform="translate(17 -17)"><path d="M0 6C-6 2-7.4-2-5.4-4.6-3.4-7 0-6 0-4 0-6 3.4-7 5.4-4.6 7.4-2 6 2 0 6Z" fill="#D4688A" stroke="#FFFAF0" stroke-width="1.6"/></g>
      </g></g>`, 1700);
    }
    const sign = kind === 'pickup' ? '+' : kind === 'deliver' ? '✓' : '…';
    const cls = kind === 'deliver' ? 'pop pop-deliver' : kind === 'full' ? 'pop pop-full' : 'pop';
    this.fx(`<g class="${cls}" transform="translate(${f1(p.x)} ${f1(p.y - 34)})"><g class="pop-in">
      <rect x="-30" y="-16" width="60" height="32" rx="16" class="pop-bg"/>
      <text x="-14" y="7" class="pop-sign">${sign}</text><g transform="translate(10 0) scale(.75)">${itemIcon[shop]}</g></g></g>`, 1100);
    if (kind !== 'full') this.burst(p, kind, shop);
  }

  /** A small celebratory burst: sparkles for a pickup, hearts and a ring for a delivery. */
  private burst(p: Pt, kind: 'pickup' | 'deliver', shop: ShopKind) {
    const colour = shopColour[shop].fill;
    let s = `<g class="burst" transform="translate(${f1(p.x)} ${f1(p.y)})">`;
    s += `<circle r="20" class="burst-ring" stroke="${kind === 'deliver' ? C.moss : colour}"/>`;
    const n = kind === 'deliver' ? 6 : 8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2 + (kind === 'deliver' ? 0.3 : 0);
      const r = kind === 'deliver' ? 44 : 50;
      const dx = Math.cos(a) * r, dy = Math.sin(a) * r - (kind === 'deliver' ? 18 : 0);
      const shape = kind === 'deliver'
        ? `<path d="M0 3.6C-6-1-4.6-6.4 0-3.4 4.6-6.4 6-1 0 3.6Z" fill="${i % 2 ? '#E77D9C' : '#D4688A'}"/>`
        : `<path d="M0-6 1.6-1.6 6 0 1.6 1.6 0 6-1.6 1.6-6 0-1.6-1.6Z" fill="${i % 2 ? colour : '#E0B04A'}"/>`;
      s += `<g class="spark" style="--dx:${f1(dx)}px;--dy:${f1(dy)}px;animation-delay:${(i % 3) * 30}ms">${shape}</g>`;
    }
    this.fx(s + '</g>', 900);
  }

  // ─────────────────────────────── courier ───────────────────────────────

  placeCourier(segs: readonly Seg[], length: number) {
    const { p, tangent } = pointAlong(segs, length);
    this.showCourierAt(p, tangent.x < -0.01);
    if (this.camera) this.follow(p);
  }

  // ───────────── ride camera: a gentle zoom that follows the courier ─────────────
  private camera: { ctm: DOMMatrix; stack: DOMRect; zoom: number; target: number } | null = null;

  startCamera(zoom = 1.35) {
    const ctm = this.svg.getScreenCTM();
    if (!ctm) return;
    this.camera = { ctm, stack: this.root.getBoundingClientRect(), zoom: 1, target: zoom };
    this.root.classList.add('camera');
  }

  private follow(p: Pt) {
    const c = this.camera!;
    c.zoom += (c.target - c.zoom) * 0.06;
    const pt = new DOMPoint(p.x, p.y).matrixTransform(c.ctm);
    const px = pt.x - c.stack.left, py = pt.y - c.stack.top;
    const W = c.stack.width, H = c.stack.height, s = c.zoom;
    const tx = Math.min(0, Math.max(W - s * W, W / 2 - s * px));
    const ty = Math.min(0, Math.max(H - s * H, H / 2 - s * py));
    this.root.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${s.toFixed(3)})`;
  }

  stopCamera() {
    if (!this.camera) return;
    this.camera = null;
    this.root.classList.remove('camera');
    this.root.classList.add('camera-out');
    this.root.style.transform = '';
    const t = window.setTimeout(() => { this.root.classList.remove('camera-out'); this.fxTimers.delete(t); }, 700);
    this.fxTimers.add(t);
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
    this.root.remove();
  }
}
