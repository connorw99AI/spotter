export type Medal = 'gold' | 'silver' | 'bronze';

export interface MedalThresholds {
  gold: number;
  silver: number;
}

/**
 * Gold: the optimal route. Silver: within 15% of optimal, never less than 2 moves of slack
 * (most towns are grids where a detour costs moves in pairs). Bronze: any valid delivery.
 */
export function thresholds(optimal: number): MedalThresholds {
  return { gold: optimal, silver: optimal + Math.max(2, Math.round(optimal * 0.15)) };
}

export function medalFor(moves: number, t: MedalThresholds): Medal {
  if (moves <= t.gold) return 'gold';
  if (moves <= t.silver) return 'silver';
  return 'bronze';
}

const rank: Record<Medal, number> = { gold: 3, silver: 2, bronze: 1 };

export function betterMedal(a: Medal | undefined, b: Medal | undefined): Medal | undefined {
  if (!a) return b;
  if (!b) return a;
  return rank[a] >= rank[b] ? a : b;
}

export const medalName: Record<Medal, string> = { gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
