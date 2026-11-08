import type { PuzzleDef } from './types';

type P = { x: number; y: number };

function segments(def: PuzzleDef, i: number): [P, P][] {
  const e = def.edges[i];
  const pa = def.nodes.find((n) => n.id === e.a)!;
  const pb = def.nodes.find((n) => n.id === e.b)!;
  if (!e.bend) return [[pa, pb]];
  const c = { x: e.bend[0], y: e.bend[1] };
  const pts: P[] = [];
  for (let k = 0; k <= 8; k++) {
    const t = k / 8;
    pts.push({
      x: (1 - t) * (1 - t) * pa.x + 2 * (1 - t) * t * c.x + t * t * pb.x,
      y: (1 - t) * (1 - t) * pa.y + 2 * (1 - t) * t * c.y + t * t * pb.y,
    });
  }
  return pts.slice(1).map((p, k) => [pts[k], p] as [P, P]);
}

function cross(o: P, a: P, b: P) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function properIntersect(a: P, b: P, c: P, d: P): boolean {
  const eps = 1e-9;
  const d1 = cross(c, d, a), d2 = cross(c, d, b), d3 = cross(a, b, c), d4 = cross(a, b, d);
  return ((d1 > eps && d2 < -eps) || (d1 < -eps && d2 > eps)) && ((d3 > eps && d4 < -eps) || (d3 < -eps && d4 > eps));
}

function distToSegment(p: P, a: P, b: P): number {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/** Structural and visual checks. Returns a list of problems (empty = valid). */
export function validatePuzzle(def: PuzzleDef): string[] {
  const errs: string[] = [];
  const ids = new Set<string>();
  for (const n of def.nodes) {
    if (ids.has(n.id)) errs.push(`duplicate node ${n.id}`);
    ids.add(n.id);
    if (!Number.isFinite(n.x) || !Number.isFinite(n.y)) errs.push(`node ${n.id} has bad coordinates`);
  }
  const pairs = new Set<string>();
  def.edges.forEach((e) => {
    if (!ids.has(e.a) || !ids.has(e.b)) errs.push(`street ${e.a}-${e.b} references unknown node`);
    if (e.a === e.b) errs.push(`street ${e.a}-${e.b} is a loop`);
    const k = e.a < e.b ? `${e.a}|${e.b}` : `${e.b}|${e.a}`;
    if (pairs.has(k)) errs.push(`duplicate street ${e.a}-${e.b}`);
    pairs.add(k);
    if (e.closed && e.oneWay) errs.push(`street ${e.a}-${e.b} cannot be both closed and one-way`);
  });
  if (!ids.has(def.depot)) errs.push('depot is not a node');
  const used = new Set<string>([def.depot]);
  for (const s of def.shops) {
    if (!ids.has(s.node)) errs.push(`shop at unknown node ${s.node}`);
    if (used.has(s.node)) errs.push(`two locations share node ${s.node}`);
    used.add(s.node);
  }
  const letters = new Set<string>();
  for (const h of def.houses) {
    if (!ids.has(h.node)) errs.push(`house at unknown node ${h.node}`);
    if (used.has(h.node)) errs.push(`two locations share node ${h.node}`);
    used.add(h.node);
    if (!/^[A-Z]$/.test(h.letter)) errs.push(`house letter ${h.letter} must be A–Z`);
    if (letters.has(h.letter)) errs.push(`duplicate house letter ${h.letter}`);
    letters.add(h.letter);
  }
  const shopNodes = new Set(def.shops.map((s) => s.node));
  const houseNodes = new Set(def.houses.map((h) => h.node));
  const orderIds = new Set<string>();
  for (const o of def.orders) {
    if (orderIds.has(o.id)) errs.push(`duplicate order ${o.id}`);
    orderIds.add(o.id);
    if (!shopNodes.has(o.from)) errs.push(`order ${o.id} does not start at a shop`);
    if (!houseNodes.has(o.to)) errs.push(`order ${o.id} does not end at a house`);
    if (o.fresh !== undefined && (!Number.isInteger(o.fresh) || o.fresh < 1)) errs.push(`order ${o.id} has bad freshness`);
  }
  for (const h of def.houses) {
    if (!def.orders.some((o) => o.to === h.node)) errs.push(`house ${h.letter} expects nothing`);
  }
  for (const s of def.shops) {
    if (!def.orders.some((o) => o.from === s.node)) errs.push(`shop at ${s.node} has no orders`);
  }
  if (def.orders.length === 0) errs.push('no orders');
  if (def.capacity !== undefined && (!Number.isInteger(def.capacity) || def.capacity < 1)) errs.push('bad capacity');
  if (!Number.isInteger(def.gold) || def.gold < 1) errs.push('gold must be a positive integer');
  if (errs.length) return errs;

  // Visual readability: streets must not cross or run through unrelated intersections.
  const segs = def.edges.map((_, i) => segments(def, i));
  for (let i = 0; i < def.edges.length; i++) {
    for (let j = i + 1; j < def.edges.length; j++) {
      const ei = def.edges[i], ej = def.edges[j];
      const shared = [ei.a, ei.b].some((n) => n === ej.a || n === ej.b);
      if (shared) continue;
      if (segs[i].some(([a, b]) => segs[j].some(([c, d]) => properIntersect(a, b, c, d)))) {
        errs.push(`streets ${ei.a}-${ei.b} and ${ej.a}-${ej.b} cross`);
      }
    }
  }
  def.edges.forEach((e, i) => {
    for (const n of def.nodes) {
      if (n.id === e.a || n.id === e.b) continue;
      if (segs[i].some(([a, b]) => distToSegment(n, a, b) < 0.25)) errs.push(`street ${e.a}-${e.b} runs over ${n.id}`);
    }
  });
  for (let i = 0; i < def.nodes.length; i++) {
    for (let j = i + 1; j < def.nodes.length; j++) {
      const a = def.nodes[i], b = def.nodes[j];
      if (Math.hypot(a.x - b.x, a.y - b.y) < 0.7) errs.push(`nodes ${a.id} and ${b.id} are too close`);
    }
  }
  return errs;
}
