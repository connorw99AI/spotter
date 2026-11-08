import { buildTown } from '../core/town';
import type { PuzzleDef } from '../core/types';
import { advise, type Advice } from '../game/advisor';
import AdvisorWorker from '../game/advisor.worker.ts?worker&inline';

/**
 * Runs solver queries off the main thread so drawing never stutters.
 * Falls back to an async main-thread call when workers are unavailable.
 * Each request resolves at most once; superseded requests resolve to null.
 */
export class AdvisorClient {
  private worker: Worker | null = null;
  private seq = 0;
  private pending = new Map<number, (a: Advice | null) => void>();

  constructor() {
    try {
      this.worker = new AdvisorWorker();
      this.worker.onmessage = (ev: MessageEvent<{ seq: number; advice?: Advice }>) => {
        const cb = this.pending.get(ev.data.seq);
        if (!cb) return;
        this.pending.delete(ev.data.seq);
        cb(ev.data.advice ?? null);
      };
      this.worker.onerror = () => this.fallback();
    } catch {
      this.worker = null;
    }
  }

  private fallback() {
    this.worker?.terminate();
    this.worker = null;
    for (const cb of this.pending.values()) cb(null);
    this.pending.clear();
  }

  request(def: PuzzleDef, route: readonly string[]): Promise<Advice | null> {
    const seq = ++this.seq;
    return new Promise((resolve) => {
      if (this.worker) {
        this.pending.set(seq, resolve);
        this.worker.postMessage({ seq, def, route: [...route] });
        return;
      }
      setTimeout(() => {
        resolve(advise(buildTown(def), route, def.gold));
      }, 0);
    });
  }

  dispose() {
    for (const cb of this.pending.values()) cb(null);
    this.pending.clear();
    this.worker?.terminate();
    this.worker = null;
  }
}
