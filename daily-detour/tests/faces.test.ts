import { describe, expect, it } from 'vitest';
import { buildTown } from '../src/core/town';
import { PUZZLES } from '../src/data/puzzles';
import { pointInPolygon, townFaces } from '../src/ui/faces';
import { mk } from './helpers';

describe('city blocks (planar faces)', () => {
  it('finds the single block inside a square', () => {
    const t = buildTown(mk({ nodes: { D: [0, 0], a: [1, 0], b: [1, 1], c: [0, 1] }, streets: 'D-a-b-c-D', shops: { a: 'bakery' }, houses: { b: 'A' }, orders: [['a', 'b']] }));
    const { inner } = townFaces(t);
    expect(inner).toHaveLength(1);
    expect(Math.abs(inner[0].area)).toBeCloseTo(100 * 100);
    expect(pointInPolygon({ x: 50, y: 50 }, inner[0].points)).toBe(true);
    expect(pointInPolygon({ x: 150, y: 50 }, inner[0].points)).toBe(false);
  });

  it('a dead-end street creates no block', () => {
    const t = buildTown(mk({ nodes: { D: [0, 0], a: [1, 0], b: [2, 0] }, streets: 'D-a-b', shops: { a: 'bakery' }, houses: { b: 'A' }, orders: [['a', 'b']] }));
    expect(townFaces(t).inner).toHaveLength(0);
  });

  // Euler's formula for a connected plane graph: blocks = streets − corners + 1.
  for (const p of PUZZLES) {
    it(`#${p.number} ${p.title}: block count matches Euler's formula`, () => {
      const t = buildTown(p);
      expect(townFaces(t).inner).toHaveLength(p.edges.length - p.nodes.length + 1);
    });
  }
});
