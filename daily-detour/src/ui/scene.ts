import type { Town } from '../core/town';
import type { NodeId } from '../core/types';
import { C, coneIcon } from './art';
import { pointInPolygon, townFaces, type Face } from './faces';
import { U, clearance, dist, nodePt, quadAt, seeded, streetPolylines, streetSeg, type Pt } from './geometry';
import {
  benchArt, bushArt, depotArt, duckArt, flowerBedArt, fountainArt, houseArt, lampArt, lilyArt, pineArt, randomHouseLook, shedArt, shopArt, treeArt,
} from './sceneryArt';
import type { Theme } from './theme';

const f1 = (n: number) => n.toFixed(1);
type Box = { x: number; y: number; w: number; h: number };
type BlockKind = 'garden' | 'meadow' | 'allotment' | 'plaza';

interface Block { face: Face; kind: BlockKind; bbox: Box; wet: boolean }

const KERB = { street: 36, lane: 24, bridge: 42 };

/**
 * Builds the static illustrated town: ground, blocks, water, streets, scenery,
 * light. Pure string output, drawn once per puzzle and never touched again.
 */
export function buildScene(town: Town, box: Box, theme: Theme): string {
  const rnd = seeded(town.def.id + ':scene');
  const lines = streetPolylines(town);
  const big = { x: box.x - 600, y: box.y - 600, w: box.w + 1200, h: box.h + 1200 };
  const water = waterLines(town);
  const nearWater = (p: Pt, margin: number) => water.some(({ a, b, half }) => segDist(p, a, b) < half + margin);

  const { inner } = townFaces(town);
  const blocks: Block[] = inner.map((face) => {
    const xs = face.points.map((p) => p.x), ys = face.points.map((p) => p.y);
    const bbox = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
    const wet = water.some(({ a, b }) => pointInPolygon(a, face.points) || pointInPolygon(b, face.points) || pointInPolygon({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, face.points));
    const area = Math.abs(face.area) / (U * U);
    const r = rnd();
    let kind: BlockKind;
    if (wet) kind = 'meadow';
    else if (area < 0.75) kind = r < 0.35 ? 'plaza' : 'garden';
    else if (area < 2.2) kind = r < 0.45 ? 'garden' : r < 0.7 ? 'meadow' : r < 0.9 ? 'allotment' : 'plaza';
    else kind = r < 0.5 ? 'garden' : r < 0.85 ? 'meadow' : 'allotment';
    return { face, kind, bbox, wet };
  });
  const blockAt = (p: Pt): Block | null => {
    for (const b of blocks) {
      if (p.x < b.bbox.x || p.y < b.bbox.y || p.x > b.bbox.x + b.bbox.w || p.y > b.bbox.y + b.bbox.h) continue;
      if (pointInPolygon(p, b.face.points)) return b;
    }
    return null;
  };

  let s = defs(theme, big, box);
  s += `<rect x="${big.x}" y="${big.y}" width="${big.w}" height="${big.h}" fill="${theme.lawn}"/>`;
  s += `<rect x="${big.x}" y="${big.y}" width="${big.w}" height="${big.h}" fill="url(#m-tufts)"/>`;
  s += blocksSvg(town, blocks, theme, rnd);
  s += waterSvg(town, theme, rnd);
  s += streetsSvg(town);

  // Objects, painted back to front.
  const items: { p: Pt; svg: string }[] = [];
  const glows: Pt[] = [];
  const lamps: Pt[] = [];
  const taken: { p: Pt; r: number }[] = [];
  const free = (p: Pt, r: number) => !taken.some((t) => dist(t.p, p) < t.r + r);

  // Buildings for the depot, shops and houses, beside their stop.
  const locs: NodeId[] = [town.depot, ...town.def.shops.map((x) => x.node), ...town.def.houses.map((x) => x.node)];
  for (const id of locs) {
    const p = nodePt(town, id);
    let best: Pt | null = null;
    let bestScore = -Infinity;
    for (let a = 0; a < 24; a++) {
      const ang = (a / 24) * Math.PI * 2;
      for (const r of [50, 58, 66]) {
        const q = { x: p.x + Math.cos(ang) * r, y: p.y + Math.sin(ang) * r };
        const cl = clearance(q, lines);
        if (cl < 36) continue;
        if (!free(q, 22)) continue;
        if (town.def.nodes.some((n) => n.id !== id && dist(nodePt(town, n.id), q) < 50)) continue;
        if (nearWater(q, 18)) continue;
        const score = cl * 0.35 - r * 0.6 - Math.sin(ang) * 12;
        if (score > bestScore) { bestScore = score; best = q; }
      }
    }
    if (!best) continue;
    taken.push({ p: best, r: 24 });
    const shop = town.shopKind.get(id);
    const svg = id === town.depot ? depotArt(theme.lit, 0.86) : shop ? shopArt(shop, theme.lit, 0.86) : houseArt(randomHouseLook(rnd, theme.lit), 0.86);
    items.push({ p: best, svg });
    glows.push(best);
  }

  // Street lamps at busy corners.
  for (const n of town.def.nodes) {
    const deg = town.incident.get(n.id)?.length ?? 0;
    if (deg < 3 || locs.includes(n.id) || rnd() < 0.45) continue;
    const p = nodePt(town, n.id);
    for (let a = 0; a < 8; a++) {
      const ang = Math.PI / 4 + (a * Math.PI) / 4;
      const q = { x: p.x + Math.cos(ang) * 30, y: p.y + Math.sin(ang) * 30 };
      if (clearance(q, lines) < 21 || !free(q, 8) || nearWater(q, 6)) continue;
      taken.push({ p: q, r: 8 });
      items.push({ p: q, svg: lampArt(theme.lit) });
      lamps.push(q);
      break;
    }
  }

  // Furnish each block on purpose: a centrepiece, then its corners.
  const place = (p: Pt, r: number, svg: string, glow = false) => {
    taken.push({ p, r });
    items.push({ p, svg });
    if (glow) glows.push(p);
  };
  const roomAt = (p: Pt, r: number, minClear: number) =>
    clearance(p, lines) >= minClear && free(p, r) && !nearWater(p, r + 4) &&
    !town.def.nodes.some((n) => dist(nodePt(town, n.id), p) < minClear + 10);
  for (const b of blocks) {
    const c = b.face.centroid;
    const cl = clearance(c, lines);
    if (b.kind === 'plaza' && cl >= 38 && roomAt(c, 20, 38)) place(c, 20, fountainArt(theme));
    else if (b.kind === 'garden' && cl >= 36 && roomAt(c, 16, 36)) place({ x: c.x, y: c.y + 4 }, 16, houseArt(randomHouseLook(rnd, theme.lit), cl > 46 ? 0.8 : 0.66), true);
    else if (b.kind === 'meadow' && cl >= 32 && roomAt(c, 14, 32)) place(c, 14, treeArt(theme, Math.floor(rnd() * 8), 1.15));
    else if (b.kind === 'allotment' && cl >= 34 && roomAt(c, 12, 34)) place(c, 12, shedArt());
    // Corners: walk each vertex towards the centre until it clears the hedge.
    const verts = b.face.points.filter((_, i) => i % Math.max(1, Math.floor(b.face.points.length / 8)) === 0);
    for (const v of verts) {
      for (const t of [0.32, 0.4, 0.48]) {
        const q = { x: v.x + (c.x - v.x) * t, y: v.y + (c.y - v.y) * t };
        const kind = b.kind;
        const r = kind === 'plaza' ? 8 : 10;
        if (!roomAt(q, r, kind === 'plaza' ? 26 : 29)) continue;
        const roll = rnd();
        if (kind === 'garden') place(q, r, roll < 0.5 ? treeArt(theme, Math.floor(rnd() * 8), 0.8) : roll < 0.8 ? bushArt(theme, 0.85) : flowerBedArt(theme, Math.floor(rnd() * 3), 0.8));
        else if (kind === 'meadow') place(q, r, roll < 0.55 ? flowerBedArt(theme, Math.floor(rnd() * 3), 0.85) : treeArt(theme, Math.floor(rnd() * 8), 0.8));
        else if (kind === 'plaza') place(q, r, roll < 0.5 ? benchArt() : bushArt(theme, 0.7));
        break;
      }
    }
  }

  // Everything else: trees, gardens, cottages, benches, chosen by the block they fall in.
  const step = 34;
  for (let y = big.y + 360; y < big.y + big.h - 360; y += step) {
    for (let x = big.x + 360; x < big.x + big.w - 360; x += step) {
      const p = { x: x + (rnd() - 0.5) * 24, y: y + (rnd() - 0.5) * 24 };
      const roll = rnd();
      const b = blockAt(p);
      const where = b?.kind ?? 'outer';
      let kind: 'tree' | 'pine' | 'bush' | 'flowers' | 'house' | 'bench' | 'shed' | null = null;
      if (where === 'outer') kind = roll < 0.3 ? 'tree' : roll < 0.42 ? 'pine' : roll < 0.52 ? 'bush' : roll < 0.56 ? 'flowers' : roll < 0.6 ? 'house' : null;
      else if (where === 'garden') kind = roll < 0.16 ? 'house' : roll < 0.34 ? 'tree' : roll < 0.44 ? 'bush' : roll < 0.54 ? 'flowers' : null;
      else if (where === 'meadow') kind = roll < 0.18 ? 'flowers' : roll < 0.38 ? 'tree' : roll < 0.46 ? 'bush' : null;
      else if (where === 'allotment') kind = roll < 0.04 ? 'shed' : null;
      else if (where === 'plaza') kind = roll < 0.1 ? 'bench' : roll < 0.16 ? 'bush' : null;
      if (!kind) continue;
      const r = kind === 'house' ? 22 : kind === 'shed' ? 13 : kind === 'tree' || kind === 'pine' ? 14 : kind === 'bench' ? 9 : 11;
      const need = r + 20; // clear of kerb and hedge
      if (clearance(p, lines) < need) continue;
      if (town.def.nodes.some((n) => dist(nodePt(town, n.id), p) < need + 14)) continue;
      if (nearWater(p, r + 6)) continue;
      if (!free(p, r + 3)) continue;
      taken.push({ p, r });
      const tone = Math.floor(rnd() * 8);
      const sc = 0.88 + rnd() * 0.3;
      const svg = kind === 'tree' ? treeArt(theme, tone, sc) : kind === 'pine' ? pineArt(theme, sc) : kind === 'bush' ? bushArt(theme, sc)
        : kind === 'flowers' ? flowerBedArt(theme, tone, sc) : kind === 'bench' ? benchArt() : kind === 'shed' ? shedArt()
        : houseArt(randomHouseLook(rnd, theme.lit), 0.78);
      items.push({ p, svg });
      if (kind === 'house') glows.push(p);
    }
  }
  items.sort((a, b) => a.p.y - b.p.y);
  s += `<g class="scene-objects">${items.map((i) => `<g transform="translate(${f1(i.p.x)} ${f1(i.p.y)})">${i.svg}</g>`).join('')}</g>`;

  // Light: dusk tint, then glows above it, then sunlight and a soft vignette.
  if (theme.tint) s += `<rect x="${big.x}" y="${big.y}" width="${big.w}" height="${big.h}" fill="${theme.tint}"/>`;
  if (theme.lit) {
    s += glows.map((p) => `<circle cx="${f1(p.x - 4)}" cy="${f1(p.y + 2)}" r="22" fill="url(#m-window-glow)"/>`).join('');
    s += lamps.map((p) => `<circle cx="${f1(p.x)}" cy="${f1(p.y - 12)}" r="30" fill="url(#m-lamp-glow)"/>`).join('');
  }
  s += `<rect x="${big.x}" y="${big.y}" width="${big.w}" height="${big.h}" fill="url(#m-sun)"/>`;
  s += `<rect x="${big.x}" y="${big.y}" width="${big.w}" height="${big.h}" fill="url(#m-vignette)"/>`;
  return s;
}

function defs(t: Theme, big: Box, box: Box): string {
  const cx = box.x + box.w * 0.2, cy = box.y + box.h * 0.1;
  const r = Math.max(box.w, box.h);
  const mx = box.x + box.w / 2, my = box.y + box.h / 2;
  void big;
  return `<defs>
    <pattern id="m-tufts" width="52" height="52" patternUnits="userSpaceOnUse">
      <path d="M9 14l2-4 2 4M33 33l2-4 2 4M22 46l1.6-3 1.6 3" stroke="${t.lawnTuft}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <circle cx="44" cy="10" r="1.3" fill="${t.lawnTuft}"/>
    </pattern>
    <pattern id="m-stripes" width="44" height="44" patternUnits="userSpaceOnUse">
      <rect width="44" height="44" fill="${t.garden[0]}"/><rect width="22" height="44" fill="${t.garden[1]}"/>
    </pattern>
    <pattern id="m-meadow" width="38" height="38" patternUnits="userSpaceOnUse">
      <rect width="38" height="38" fill="${t.meadow}"/>
      <circle cx="7" cy="9" r="1.6" fill="${t.meadowDots[0]}"/><circle cx="26" cy="21" r="1.4" fill="${t.meadowDots[1]}"/>
      <circle cx="15" cy="32" r="1.5" fill="${t.meadowDots[2]}"/><path d="M30 6l1.4-3 1.4 3" stroke="${t.lawnTuft}" stroke-width="1.2" fill="none"/>
    </pattern>
    <pattern id="m-rows" width="16" height="16" patternUnits="userSpaceOnUse">
      <rect width="16" height="16" fill="${t.soil}"/><rect y="2" width="16" height="6" rx="3" fill="${t.crop}"/>
      <circle cx="4" cy="5" r="2" fill="${t.leaves[0].light}"/><circle cx="12" cy="5" r="2" fill="${t.leaves[0].light}"/>
    </pattern>
    <pattern id="m-paving" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect width="20" height="20" fill="${t.paving}"/><path d="M0 .5H20M.5 0V20M10 10H20" stroke="${t.pavingLine}" stroke-width="1"/>
    </pattern>
    <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="14" height="14" fill="#E7DDC8"/><rect width="6" height="14" fill="#D9CCB2"/>
    </pattern>
    <radialGradient id="m-window-glow"><stop offset="0" stop-color="#FFD98A" stop-opacity=".55"/><stop offset="1" stop-color="#FFD98A" stop-opacity="0"/></radialGradient>
    <radialGradient id="m-lamp-glow"><stop offset="0" stop-color="#FFE7A8" stop-opacity=".7"/><stop offset=".45" stop-color="#FFD98A" stop-opacity=".22"/><stop offset="1" stop-color="#FFD98A" stop-opacity="0"/></radialGradient>
    <radialGradient id="m-sun" gradientUnits="userSpaceOnUse" cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r * 0.9)}">
      <stop offset="0" stop-color="${t.sun}"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="m-vignette" gradientUnits="userSpaceOnUse" cx="${f1(mx)}" cy="${f1(my)}" r="${f1(r * 0.82)}">
      <stop offset=".66" stop-color="#23352B" stop-opacity="0"/><stop offset="1" stop-color="#23352B" stop-opacity=".13"/>
    </radialGradient>
  </defs>`;
}

function polyD(points: readonly Pt[]): string {
  return 'M' + points.map((p) => `${f1(p.x)} ${f1(p.y)}`).join('L') + 'Z';
}

function edgeD(town: Town, i: number, from?: string): string {
  const e = town.edges[i];
  const g = streetSeg(town, i, from ?? e.a);
  return g.c ? `M${f1(g.p0.x)} ${f1(g.p0.y)}Q${f1(g.c.x)} ${f1(g.c.y)} ${f1(g.p1.x)} ${f1(g.p1.y)}` : `M${f1(g.p0.x)} ${f1(g.p0.y)}L${f1(g.p1.x)} ${f1(g.p1.y)}`;
}

function kerbOf(town: Town, i: number): number {
  const st = town.edges[i].style;
  return st === 'lane' ? KERB.lane : st === 'bridge' ? KERB.bridge : KERB.street;
}

function blocksSvg(town: Town, blocks: Block[], t: Theme, rnd: () => number): string {
  let s = '<g class="blocks">';
  blocks.forEach((b, i) => {
    const id = `m-blk-${i}`;
    const d = polyD(b.face.points);
    const angle = [0, 90, 45, -30][Math.floor(rnd() * 4)];
    const fill = b.kind === 'garden' ? 'url(#m-stripes)' : b.kind === 'meadow' ? 'url(#m-meadow)' : b.kind === 'allotment' ? 'url(#m-rows)' : 'url(#m-paving)';
    s += `<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})">`;
    // Rotated patterns read as mown lawns and planted rows rather than wallpaper.
    const c = b.face.centroid;
    const span = Math.max(b.bbox.w, b.bbox.h) * 1.6 + 80;
    s += `<rect x="${f1(c.x - span / 2)}" y="${f1(c.y - span / 2)}" width="${f1(span)}" height="${f1(span)}" fill="${fill}" transform="rotate(${angle} ${f1(c.x)} ${f1(c.y)})"/>`;
    for (const [ei, from] of b.face.sides) {
      const k = kerbOf(town, ei);
      const ed = edgeD(town, ei, from);
      if (b.kind === 'garden') {
        s += `<path d="${ed}" stroke="${t.hedgeDeep}" stroke-width="${k + 22}" fill="none" stroke-linecap="round"/>`;
        // Scalloped inner edge reads as clipped shrubs rather than a painted band.
        s += `<path d="${ed}" stroke="${t.hedge}" stroke-width="${k + 25}" stroke-dasharray="0 11" fill="none" stroke-linecap="round"/>`;
        s += `<path d="${ed}" stroke="${t.hedge}" stroke-width="${k + 17}" fill="none" stroke-linecap="round"/>`;
        s += `<path d="${ed}" stroke="#FFFFFF" stroke-opacity=".18" stroke-width="${k + 11}" stroke-dasharray="0 11" stroke-dashoffset="5" fill="none" stroke-linecap="round"/>`;
      } else if (b.kind === 'allotment') {
        s += `<path d="${ed}" stroke="${t.lawn}" stroke-width="${k + 26}" fill="none" stroke-linecap="round"/>`;
        s += `<path d="${ed}" stroke="#8C6A45" stroke-width="${k + 19}" stroke-dasharray="2 5" fill="none"/>`;
        s += `<path d="${ed}" stroke="${t.lawn}" stroke-width="${k + 16}" fill="none" stroke-linecap="round"/>`;
      } else if (b.kind === 'plaza') {
        s += `<path d="${ed}" stroke="${t.pavingLine}" stroke-width="${k + 8}" fill="none" stroke-linecap="round"/>`;
      } else {
        s += `<path d="${ed}" stroke="${t.lawnTuft}" stroke-width="${k + 14}" fill="none" stroke-linecap="round" opacity=".55"/>`;
      }
    }
    s += `<path d="${d}" fill="none" stroke="#23352B" stroke-opacity=".08" stroke-width="10" transform="translate(4 4)"/>`;
    s += '</g>';
  });
  return s + '</g>';
}

function waterLines(town: Town): { a: Pt; b: Pt; half: number }[] {
  const out: { a: Pt; b: Pt; half: number }[] = [];
  for (const w of town.def.water ?? []) {
    for (let i = 1; i < w.points.length; i++) {
      out.push({ a: { x: w.points[i - 1][0] * U, y: w.points[i - 1][1] * U }, b: { x: w.points[i][0] * U, y: w.points[i][1] * U }, half: (w.width * U) / 2 });
    }
  }
  return out;
}

function segDist(p: Pt, a: Pt, b: Pt): number {
  const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
}

function waterPath(points: [number, number][]): string {
  const pts = points.map(([x, y]) => ({ x: x * U, y: y * U }));
  let d = `M${f1(pts[0].x)} ${f1(pts[0].y)}`;
  for (let i = 1; i < pts.length; i++) {
    const mid = i < pts.length - 1 ? { x: (pts[i].x + pts[i + 1].x) / 2, y: (pts[i].y + pts[i + 1].y) / 2 } : pts[i];
    d += ` Q${f1(pts[i].x)} ${f1(pts[i].y)} ${f1(mid.x)} ${f1(mid.y)}`;
  }
  return d;
}

/** Moving highlights on the water, kept apart from the static scene so animating them stays cheap. */
export function waterShimmerSvg(town: Town, t: Theme): string {
  let s = '';
  for (const w of town.def.water ?? []) {
    const d = waterPath(w.points);
    const wpx = w.width * U;
    s += `<path d="${d}" class="shimmer" fill="none" stroke="${t.waterHi}" stroke-opacity=".5" stroke-width="2.2" stroke-dasharray="14 40" stroke-linecap="round" transform="translate(-${f1(wpx * 0.18)} 0)"/>`;
    s += `<path d="${d}" class="shimmer slow" fill="none" stroke="${t.waterHi}" stroke-opacity=".4" stroke-width="1.8" stroke-dasharray="8 52" stroke-linecap="round" transform="translate(${f1(wpx * 0.2)} 0)"/>`;
  }
  return s;
}

function waterSvg(town: Town, t: Theme, rnd: () => number): string {
  let s = '';
  for (const w of town.def.water ?? []) {
    const pts = w.points.map(([x, y]) => ({ x: x * U, y: y * U }));
    let d = `M${f1(pts[0].x)} ${f1(pts[0].y)}`;
    for (let i = 1; i < pts.length; i++) {
      const mid = i < pts.length - 1 ? { x: (pts[i].x + pts[i + 1].x) / 2, y: (pts[i].y + pts[i + 1].y) / 2 } : pts[i];
      d += ` Q${f1(pts[i].x)} ${f1(pts[i].y)} ${f1(mid.x)} ${f1(mid.y)}`;
    }
    const wpx = w.width * U;
    s += `<path d="${d}" fill="none" stroke="${t.bank}" stroke-width="${wpx + 20}" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += `<path d="${d}" fill="none" stroke="#8C6A45" stroke-opacity=".25" stroke-width="${wpx + 5}" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += `<path d="${d}" fill="none" stroke="${t.water}" stroke-width="${wpx}" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += `<path d="${d}" fill="none" stroke="${t.waterDeep}" stroke-opacity=".45" stroke-width="${wpx * 0.45}" stroke-linecap="round" stroke-linejoin="round"/>`;
    // Lilies along the banks and a duck or two.
    const lines = streetPolylines(town);
    for (let i = 1; i < pts.length; i++) {
      for (let k = 0; k < 3; k++) {
        const tt = rnd();
        const p = { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * tt, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * tt };
        const side = rnd() < 0.5 ? -1 : 1;
        const dx = pts[i].x - pts[i - 1].x, dy = pts[i].y - pts[i - 1].y, l = Math.hypot(dx, dy) || 1;
        const q = { x: p.x + (-dy / l) * side * wpx * 0.3, y: p.y + (dx / l) * side * wpx * 0.3 };
        if (clearance(q, lines) < 30) continue;
        s += `<g transform="translate(${f1(q.x)} ${f1(q.y)})">${k === 2 && i % 2 === 1 ? duckArt() : lilyArt(t, k)}</g>`;
      }
    }
  }
  return s;
}

function streetsSvg(town: Town): string {
  const edges = town.edges;
  const w = (i: number) => (edges[i].style === 'lane' ? [24, 17] : [36, 27]);
  let shadow = '', kerb = '', surf = '', marks = '', extras = '';
  edges.forEach((e, i) => {
    const d = edgeD(town, i);
    const [kw, sw] = w(i);
    if (e.style === 'bridge') {
      shadow += `<path d="${d}" stroke="#23352B" stroke-opacity=".22" stroke-width="${kw + 8}" stroke-linecap="butt" transform="translate(5 7)"/>`;
      kerb += `<path d="${d}" stroke="#7A5A3A" stroke-width="${kw + 6}" stroke-linecap="butt"/>`;
      surf += `<path d="${d}" stroke="#E2C79A" stroke-width="${sw + 2}" stroke-linecap="butt"/>`;
      marks += `<path d="${d}" stroke="#C9A877" stroke-width="${sw}" stroke-dasharray="3 9" stroke-linecap="butt"/>`;
    } else {
      kerb += `<path d="${d}" stroke="${C.kerb}" stroke-width="${kw}"/>`;
      surf += `<path d="${d}" stroke="${e.closed ? 'url(#hatch)' : C.road}" stroke-width="${sw}"/>`;
      if (!e.closed) surf += `<path d="${d}" stroke="#FFFDF6" stroke-opacity=".55" stroke-width="${Math.round(sw * 0.35)}" transform="translate(-2 -2)"/>`;
      if (e.style !== 'lane' && !e.closed && !e.oneWay) {
        marks += `<path d="${d}" stroke="#E4D6B6" stroke-width="2.4" stroke-dasharray="10 14" stroke-dashoffset="-6"/>`;
      }
    }
    const g = streetSeg(town, i, e.a);
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
        <rect x="-1" y="-19" width="8" height="42" rx="3" fill="#23352B" opacity=".18"/>
        <rect x="-4" y="-21" width="8" height="42" rx="3" fill="#FFFAF0" stroke="#8E4127" stroke-width="1.6"/>
        <path d="M-4-14h8M-4-2h8M-4 10h8" stroke="#C8483A" stroke-width="5"/>
      </g>
      <g transform="translate(${f1(p.x)} ${f1(p.y)}) translate(0 -2) scale(1.05)">${coneIcon}</g>`;
    }
  });
  let plazas = '', plazaTop = '';
  for (const n of town.def.nodes) {
    const p = nodePt(town, n.id);
    const inc = town.incident.get(n.id) ?? [];
    if (inc.every((i) => edges[i].style === 'bridge')) continue;
    const laneOnly = inc.every((i) => edges[i].style === 'lane');
    plazas += `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="${laneOnly ? 12 : 18}" fill="${C.kerb}"/>`;
    plazaTop += `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="${laneOnly ? 8.5 : 13.5}" fill="${C.road}"/>`;
  }
  return `<g class="streets" fill="none" stroke-linecap="round">${shadow}${kerb}${plazas}${surf}${plazaTop}${marks}</g><g class="street-signs">${extras}</g>`;
}

/** Small static picture of a puzzle's streets and stops, for the route book. */
export function miniMapSvg(town: Town, theme: Theme): string {
  const xs = town.def.nodes.map((n) => n.x), ys = town.def.nodes.map((n) => n.y);
  const pad = 0.55;
  const minX = Math.min(...xs) - pad, minY = Math.min(...ys) - pad;
  const size = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) + pad * 2;
  const vx = (minX + (Math.max(...xs) - Math.min(...xs) + pad * 2 - size) / 2) * U;
  const vy = (minY + (Math.max(...ys) - Math.min(...ys) + pad * 2 - size) / 2) * U;
  const { inner } = townFaces(town);
  let s = `<rect x="${f1(vx - 50)}" y="${f1(vy - 50)}" width="${f1(size * U + 100)}" height="${f1(size * U + 100)}" fill="${theme.lawn}"/>`;
  inner.forEach((f, i) => { s += `<path d="${polyD(f.points)}" fill="${i % 2 ? theme.garden[0] : theme.meadow}"/>`; });
  for (const w of town.def.water ?? []) {
    s += `<polyline points="${w.points.map(([x, y]) => `${x * U},${y * U}`).join(' ')}" fill="none" stroke="${theme.water}" stroke-width="${w.width * U}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  let roads = '';
  town.edges.forEach((e, i) => { roads += `<path d="${edgeD(town, i)}" stroke="${e.closed ? '#D9A08A' : C.road}" stroke-width="${e.style === 'lane' ? 22 : 30}" fill="none" stroke-linecap="round"/>`; });
  s += `<g>${roads}</g>`;
  const dot = (id: string, fill: string, stroke: string) => { const p = nodePt(town, id); return `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="21" fill="${fill}" stroke="${stroke}" stroke-width="7"/>`; };
  s += dot(town.depot, C.forest, '#FFFAF0');
  for (const sh of town.def.shops) s += dot(sh.node, ({ bakery: '#D9973F', florist: '#D4688A', icecream: '#4FA593', grocer: '#7C9F45' } as const)[sh.kind], '#FFFAF0');
  for (const hs of town.def.houses) s += dot(hs.node, '#FFFAF0', C.forest);
  return `<svg viewBox="${f1(vx)} ${f1(vy)} ${f1(size * U)} ${f1(size * U)}" aria-hidden="true" class="mini-map">${s}</svg>`;
}
