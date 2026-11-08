/// <reference lib="webworker" />
import { buildTown, type Town } from '../core/town';
import type { PuzzleDef } from '../core/types';
import { advise } from './advisor';

export interface AdviceRequest { seq: number; def: PuzzleDef; route: string[] }

// Puzzle data arrives with each request, so the worker carries no content of its own.
const towns = new Map<string, Town>();

self.onmessage = (ev: MessageEvent<AdviceRequest>) => {
  const { seq, def, route } = ev.data;
  try {
    let town = towns.get(def.id);
    if (!town) { town = buildTown(def); towns.set(def.id, town); }
    (self as unknown as Worker).postMessage({ seq, advice: advise(town, route, def.gold) });
  } catch (e) {
    (self as unknown as Worker).postMessage({ seq, error: String(e) });
  }
};
