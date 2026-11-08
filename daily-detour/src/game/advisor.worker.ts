/// <reference lib="webworker" />
import { buildTown } from '../core/town';
import { PUZZLE_BY_ID } from '../data/puzzles';
import { advise } from './advisor';

export interface AdviceRequest { seq: number; puzzleId: string; route: string[] }

self.onmessage = (ev: MessageEvent<AdviceRequest>) => {
  const { seq, puzzleId, route } = ev.data;
  const def = PUZZLE_BY_ID.get(puzzleId);
  if (!def) return;
  try {
    const advice = advise(buildTown(def), route, def.gold);
    (self as unknown as Worker).postMessage({ seq, advice });
  } catch (e) {
    (self as unknown as Worker).postMessage({ seq, error: String(e) });
  }
};
