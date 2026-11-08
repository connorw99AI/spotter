import type { Town } from '../core/town';
import type { NodeId } from '../core/types';

export const U = 100; // SVG units per map unit

export interface Pt { x: number; y: number }

export interface Seg {
  kind: 'L' | 'Q';
  p0: Pt;
  c?: Pt;
  p1: Pt;
  len: number;
  /** Route index of the node this segment arrives at (joins have none). */
  arrive?: number;
}

export const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y });
export const mul = (a: Pt, k: number): Pt => ({ x: a.x * k, y: a.y * k });
export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

export function nodePt(town: Town, id: NodeId): Pt {
  const p = town.pos.get(id)!;
  return { x: p.x * U, y: p.y * U };
}

export function quadAt(p0: Pt, c: Pt, p1: Pt, t: number): Pt {
  const u = 1 - t;
  return { x: u * u * p0.x + 2 * u * t * c.x + t * t * p1.x, y: u * u * p0.y + 2 * u * t * c.y + t * t * p1.y };
}

export function quadTangent(p0: Pt, c: Pt, p1: Pt, t: number): Pt {
  return { x: 2 * (1 - t) * (c.x - p0.x) + 2 * t * (p1.x - c.x), y: 2 * (1 - t) * (c.y - p0.y) + 2 * t * (p1.y - c.y) };
}

function quadLen(p0: Pt, c: Pt, p1: Pt): number {
  let l = 0;
  let prev = p0;
  for (let i = 1; i <= 16; i++) {
    const p = quadAt(p0, c, p1, i / 16);
    l += dist(prev, p);
    prev = p;
  }
  return l;
}

export function makeSeg(p0: Pt, p1: Pt, c?: Pt, arrive?: number): Seg {
  return c ? { kind: 'Q', p0, c, p1, len: quadLen(p0, c, p1), arrive } : { kind: 'L', p0, p1, len: dist(p0, p1), arrive };
}

export function segAt(s: Seg, t: number): Pt {
  if (s.kind === 'Q') return quadAt(s.p0, s.c!, s.p1, t);
  return { x: s.p0.x + (s.p1.x - s.p0.x) * t, y: s.p0.y + (s.p1.y - s.p0.y) * t };
}

export function segTangent(s: Seg, t: number): Pt {
  if (s.kind === 'Q') return quadTangent(s.p0, s.c!, s.p1, t);
  return { x: s.p1.x - s.p0.x, y: s.p1.y - s.p0.y };
}

/** Street geometry from u to v (follows the bend if the street is curved). */
export function streetSeg(town: Town, edge: number, from: NodeId): { p0: Pt; c?: Pt; p1: Pt } {
  const e = town.edges[edge];
  const to = e.a === from ? e.b : e.a;
  const p0 = nodePt(town, from);
  const p1 = nodePt(town, to);
  const c = e.bend ? { x: e.bend[0] * U, y: e.bend[1] * U } : undefined;
  return { p0, c, p1 };
}

export function pathD(segs: readonly Seg[]): string {
  if (!segs.length) return '';
  const f = (n: number) => n.toFixed(1);
  let d = `M${f(segs[0].p0.x)} ${f(segs[0].p0.y)}`;
  for (const s of segs) {
    d += s.kind === 'Q' ? `Q${f(s.c!.x)} ${f(s.c!.y)} ${f(s.p1.x)} ${f(s.p1.y)}` : `L${f(s.p1.x)} ${f(s.p1.y)}`;
  }
  return d;
}

/** Walk a segment list to a distance along it. */
export function pointAlong(segs: readonly Seg[], l: number): { p: Pt; tangent: Pt } {
  let rem = l;
  for (const s of segs) {
    if (rem <= s.len || s === segs[segs.length - 1]) {
      const t = s.len === 0 ? 1 : Math.min(1, Math.max(0, rem / s.len));
      return { p: segAt(s, t), tangent: segTangent(s, t) };
    }
    rem -= s.len;
  }
  return { p: { x: 0, y: 0 }, tangent: { x: 1, y: 0 } };
}

export function distToSeg(p: Pt, a: Pt, b: Pt): number {
  const dx = b.x - a.x, dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/** Street centre-lines sampled as straight pieces, for clearance checks. */
export function streetPolylines(town: Town): [Pt, Pt][] {
  const out: [Pt, Pt][] = [];
  town.edges.forEach((e, i) => {
    const g = streetSeg(town, i, e.a);
    if (!g.c) { out.push([g.p0, g.p1]); return; }
    let prev = g.p0;
    for (let k = 1; k <= 8; k++) {
      const p = quadAt(g.p0, g.c, g.p1, k / 8);
      out.push([prev, p]);
      prev = p;
    }
  });
  return out;
}

export function clearance(p: Pt, lines: readonly [Pt, Pt][]): number {
  let m = Infinity;
  for (const [a, b] of lines) m = Math.min(m, distToSeg(p, a, b));
  return m;
}

/** Deterministic PRNG for scenery. */
export function seeded(seedText: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seedText.length; i++) h = Math.imul(h ^ seedText.charCodeAt(i), 16777619);
  let s = h >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
