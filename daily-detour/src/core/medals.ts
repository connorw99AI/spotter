export type Medal = 'gold' | 'silver' | 'bronze';

export interface MedalThresholds {
  gold: number;
  silver: number;
  /** The most moves a delivery can take and still count. */
  bronze: number;
}

/**
 * Gold: the shortest route there is. Silver: one move over. Bronze: two or
 * three over. Anything longer doesn't earn a stamp.
 */
export function thresholds(optimal: number): MedalThresholds {
  return { gold: optimal, silver: optimal + 1, bronze: optimal + 3 };
}

/** The stamp a delivery of this many moves earns, or null if it took too long. */
export function medalFor(moves: number, t: MedalThresholds): Medal | null {
  if (moves <= t.gold) return 'gold';
  if (moves <= t.silver) return 'silver';
  if (moves <= t.bronze) return 'bronze';
  return null;
}

const rank: Record<Medal, number> = { gold: 3, silver: 2, bronze: 1 };

export function betterMedal(a: Medal | undefined, b: Medal | undefined): Medal | undefined {
  if (!a) return b;
  if (!b) return a;
  return rank[a] >= rank[b] ? a : b;
}

export const medalName: Record<Medal, string> = { gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
