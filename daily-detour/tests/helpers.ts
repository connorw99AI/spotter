import { definePuzzle, type PuzzleSpec } from '../src/data/dsl';

/** Minimal puzzle for rule tests. */
export function mk(spec: Partial<PuzzleSpec> & Pick<PuzzleSpec, 'nodes' | 'streets' | 'shops' | 'houses' | 'orders'>) {
  return definePuzzle({
    id: 't', rev: 1, number: 0, title: 't', brief: '', tier: 'tutorial', mechanics: [], hint: '', gold: 1,
    depot: 'D',
    ...spec,
  });
}

/** A straight street D - a - b - c - d with a side loop, used by several tests. */
export const line = {
  nodes: { D: [0, 0], a: [1, 0], b: [2, 0], c: [3, 0], d: [4, 0], z: [5, 5] } as Record<string, [number, number]>,
  streets: 'D-a-b-c-d',
};
