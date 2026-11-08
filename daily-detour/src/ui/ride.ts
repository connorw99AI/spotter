import type { Seg } from './geometry';
import type { MapView } from './mapView';

/**
 * Animates the courier along a planned route. Owns its own animation frame and
 * timers and guarantees no callback fires after cancel() or finish.
 */
export class Ride {
  private raf = 0;
  private timer = 0;
  private done = false;
  private arrived = 0;
  private readonly cum: number[] = [];
  private readonly total: number;

  constructor(
    private readonly map: MapView,
    private readonly segs: readonly Seg[],
    private readonly moves: number,
    private readonly msPerMove: number,
    private readonly reduced: boolean,
    private readonly onArrive: (index: number) => void,
    private readonly onFinish: () => void,
  ) {
    // Cumulative length at which each route index is reached.
    let acc = 0;
    this.cum[0] = 0;
    for (const s of segs) {
      acc += s.len;
      if (s.arrive !== undefined) this.cum[s.arrive] = acc;
    }
    this.total = acc;
  }

  get active() { return !this.done; }

  start() {
    this.map.placeCourier(this.segs, 0);
    if (this.reduced) {
      // Hop corner to corner without sliding.
      const hop = () => {
        if (this.done) return;
        this.arrive(this.arrived + 1);
        if (this.done) return;
        this.timer = window.setTimeout(hop, Math.max(220, this.msPerMove));
      };
      this.timer = window.setTimeout(hop, 250);
      return;
    }
    const duration = this.moves * this.msPerMove;
    const t0 = performance.now();
    const frame = (now: number) => {
      if (this.done) return;
      const k = Math.min(1, (now - t0) / duration);
      const l = k * this.total;
      this.map.placeCourier(this.segs, l);
      this.map.renderTrail(this.segs, l);
      while (this.arrived < this.moves && l >= this.cum[this.arrived + 1] - 0.5) {
        this.arrive(this.arrived + 1);
        if (this.done) return;
      }
      if (k < 1) this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  }

  private arrive(i: number) {
    this.arrived = i;
    if (this.reduced) {
      this.map.placeCourier(this.segs, this.cum[i]);
      this.map.renderTrail(this.segs, this.cum[i]);
    }
    this.onArrive(i);
    if (i >= this.moves) this.finish();
  }

  /** Jump to the end, firing remaining arrivals silently via onArrive(last). */
  skip() {
    if (this.done) return;
    this.stopTimers();
    this.arrived = this.moves;
    this.map.placeCourier(this.segs, this.total);
    this.map.renderTrail(this.segs, this.total);
    this.onArrive(this.moves);
    this.finish();
  }

  private finish() {
    if (this.done) return;
    this.done = true;
    this.stopTimers();
    this.onFinish();
  }

  /** Stop without finishing. No further callbacks. */
  cancel() {
    this.done = true;
    this.stopTimers();
    this.map.hideCourier();
    this.map.clearTrail();
  }

  private stopTimers() {
    cancelAnimationFrame(this.raf);
    clearTimeout(this.timer);
  }
}
