/** Small synthesised sound set (no audio files). Created lazily on first user gesture. */
type Cue = 'step' | 'erase' | 'pickup' | 'deliver' | 'blocked' | 'bell' | 'complete' | 'tap';

export class Sound {
  enabled = true;
  private ctx: AudioContext | null = null;

  private ensure(): AudioContext | null {
    if (!this.enabled) return null;
    try {
      if (!this.ctx) {
        const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return null;
        this.ctx = new Ctor();
      }
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return this.ctx;
    } catch {
      return null;
    }
  }

  private tone(freq: number, start: number, dur: number, type: OscillatorType, gain: number, slideTo?: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g).connect(ctx.destination);
    o.start(start);
    o.stop(start + dur + 0.02);
  }

  play(cue: Cue) {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime + 0.005;
    switch (cue) {
      case 'tap': this.tone(520, t, 0.05, 'sine', 0.03); break;
      case 'step': this.tone(640, t, 0.06, 'triangle', 0.035); break;
      case 'erase': this.tone(420, t, 0.06, 'triangle', 0.03, 360); break;
      case 'pickup': this.tone(784, t, 0.09, 'triangle', 0.06); this.tone(1047, t + 0.07, 0.14, 'triangle', 0.06); break;
      case 'deliver': this.tone(1319, t, 0.5, 'sine', 0.07); this.tone(1976, t, 0.35, 'sine', 0.025); break;
      case 'blocked': this.tone(180, t, 0.16, 'sine', 0.08, 120); break;
      case 'bell': this.tone(2093, t, 0.25, 'sine', 0.05); this.tone(2093, t + 0.13, 0.4, 'sine', 0.05); break;
      case 'complete':
        [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, t + i * 0.09, 0.5, 'triangle', 0.055));
        break;
    }
  }
}

export function buzz(enabled: boolean, pattern: number | number[]) {
  if (!enabled) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}
