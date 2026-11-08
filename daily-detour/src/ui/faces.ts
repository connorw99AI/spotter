import type { Town } from '../core/town';
import { U, quadAt, streetSeg, type Pt } from './geometry';

export interface Face {
  /** Polygon along street centre-lines, in SVG units. */
  points: Pt[];
  /** Streets bounding the face, as [edge index, from node] in traversal order. */
  sides: [number, string][];
  area: number;
  centroid: Pt;
}

/**
 * The city blocks: faces of the planar street map, found by walking half-edges
 * and always turning to the next street around each corner. The outer face (the
 * countryside around the town) is returned separately.
 */
export function townFaces(town: Town): { inner: Face[]; outer: Face | null } {
  const E = town.edges;
  // Outgoing half-edges per node, sorted by the angle the street leaves at.
  const out = new Map<string, { h: number; ang: number }[]>();
  const from = (h: number) => (h % 2 === 0 ? E[h >> 1].a : E[h >> 1].b);
  const to = (h: number) => (h % 2 === 0 ? E[h >> 1].b : E[h >> 1].a);
  for (let h = 0; h < E.length * 2; h++) {
    const u = from(h);
    const g = streetSeg(town, h >> 1, u);
    const aim = g.c ?? g.p1;
    const ang = Math.atan2(aim.y - g.p0.y, aim.x - g.p0.x);
    if (!out.has(u)) out.set(u, []);
    out.get(u)!.push({ h, ang });
  }
  for (const list of out.values()) list.sort((a, b) => a.ang - b.ang);

  const next = (h: number): number => {
    const v = to(h);
    const twin = h ^ 1;
    const list = out.get(v)!;
    const k = list.findIndex((x) => x.h === twin);
    return list[(k - 1 + list.length) % list.length].h;
  };

  const seen = new Set<number>();
  const faces: Face[] = [];
  for (let start = 0; start < E.length * 2; start++) {
    if (seen.has(start)) continue;
    const sides: [number, string][] = [];
    const points: Pt[] = [];
    let h = start;
    let guard = 0;
    while (!seen.has(h) && guard++ < 10_000) {
      seen.add(h);
      const u = from(h);
      sides.push([h >> 1, u]);
      const g = streetSeg(town, h >> 1, u);
      if (g.c) for (let k = 0; k < 8; k++) points.push(quadAt(g.p0, g.c, g.p1, k / 8));
      else points.push(g.p0);
      h = next(h);
    }
    let a = 0, cx = 0, cy = 0;
    for (let i = 0; i < points.length; i++) {
      const p = points[i], q = points[(i + 1) % points.length];
      const cr = p.x * q.y - q.x * p.y;
      a += cr;
      cx += (p.x + q.x) * cr;
      cy += (p.y + q.y) * cr;
    }
    a /= 2;
    const centroid = Math.abs(a) > 1e-6 ? { x: cx / (6 * a), y: cy / (6 * a) } : points[0];
    faces.push({ points, sides, area: a, centroid });
  }
  if (!faces.length) return { inner: [], outer: null };
  // The outer boundary winds the opposite way to every block; it also has the largest area.
  let outerIdx = 0;
  faces.forEach((f, i) => { if (Math.abs(f.area) > Math.abs(faces[outerIdx].area)) outerIdx = i; });
  const sign = Math.sign(faces[outerIdx].area);
  const inner = faces.filter((f, i) => i !== outerIdx && Math.sign(f.area) !== sign && Math.abs(f.area) > 0.05 * U * U);
  return { inner, outer: faces[outerIdx] };
}

export function pointInPolygon(p: Pt, poly: readonly Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
