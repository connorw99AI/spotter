/**
 * Sound for the game, synthesised so the build needs no audio files.
 * A sound designer can replace any cue, or the music, by listing files in
 * audio/manifest.json next to the page (see public/audio/README.md).
 */
import { isNative, nativeTap } from '../platform/native';

export type Cue = 'step' | 'erase' | 'pickup' | 'deliver' | 'blocked' | 'bell' | 'complete' | 'tap' | 'stamp';

interface Manifest { cues?: Partial<Record<Cue, string>>; music?: string }

// F major, gently: I – iii – IV – V – I – vi – IV – V (MIDI roots).
const PROGRESSION: { root: number; third: number; fifth: number }[] = [
  { root: 53, third: 57, fifth: 60 }, { root: 57, third: 60, fifth: 64 }, { root: 58, third: 62, fifth: 65 }, { root: 60, third: 64, fifth: 67 },
  { root: 53, third: 57, fifth: 60 }, { root: 50, third: 53, fifth: 57 }, { root: 58, third: 62, fifth: 65 }, { root: 60, third: 64, fifth: 67 },
];
const PENTATONIC = [65, 67, 69, 72, 74, 77, 79, 81]; // F G A C D F G A
const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

export class Sound {
  enabled = true;
  private musicWanted = false;
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfx: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private room: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private manifest: Manifest = {};
  private musicTimer = 0;
  private nextBar = 0;
  private bar = 0;
  private lastNote = 72;
  private musicSource: AudioBufferSourceNode | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => this.syncMusic());
      void this.loadOverrides();
    }
  }

  private ensure(): AudioContext | null {
    try {
      if (!this.ctx) {
        const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return null;
        const ctx = new Ctor();
        this.ctx = ctx;
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -18;
        this.master = ctx.createGain();
        this.master.gain.value = 0.9;
        this.master.connect(comp).connect(ctx.destination);
        this.sfx = ctx.createGain();
        this.sfx.connect(this.master);
        this.musicBus = ctx.createGain();
        this.musicBus.gain.value = 0;
        this.musicBus.connect(this.master);
        // A small room: one feedback delay, mixed in quietly.
        const delay = ctx.createDelay(1);
        delay.delayTime.value = 0.17;
        const fb = ctx.createGain();
        fb.gain.value = 0.28;
        const tone = ctx.createBiquadFilter();
        tone.type = 'lowpass';
        tone.frequency.value = 2600;
        this.room = ctx.createGain();
        this.room.gain.value = 0.22;
        this.room.connect(delay);
        delay.connect(tone).connect(fb).connect(delay);
        tone.connect(this.master);
        const len = ctx.sampleRate * 0.5;
        this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = this.noise.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      }
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return this.ctx;
    } catch {
      return null;
    }
  }

  /** Call from a user gesture: browsers only allow audio after one. */
  unlock() {
    if (!this.enabled && !this.musicWanted) return;
    this.ensure();
    void this.decodeOverrides();
    this.syncMusic();
  }

  setMusic(on: boolean) {
    this.musicWanted = on;
    if (this.ctx) this.syncMusic();
  }

  // ─────────────────────────────── overrides ───────────────────────────────

  private async loadOverrides() {
    // Files can't be fetched from disk, and an embedding page doesn't publish our audio folder.
    const embedded = (() => { try { return window.self !== window.top; } catch { return true; } })();
    if (location.protocol === 'file:' || embedded) return;
    try {
      const res = await fetch(new URL('audio/manifest.json', document.baseURI).href, { cache: 'no-cache' });
      if (!res.ok) return;
      const m = (await res.json()) as Manifest;
      if (m && typeof m === 'object') this.manifest = m;
    } catch {
      /* no manifest: synthesised sound only */
    }
  }

  private decoding = false;
  private async decodeOverrides() {
    if (this.decoding || !this.ctx) return;
    this.decoding = true;
    const files = [...Object.entries(this.manifest.cues ?? {}), ...(this.manifest.music ? [['music', this.manifest.music]] : [])] as [string, string][];
    for (const [key, file] of files) {
      try {
        const res = await fetch(new URL(`audio/${file}`, document.baseURI).href);
        if (res.ok) this.buffers.set(key, await this.ctx.decodeAudioData(await res.arrayBuffer()));
      } catch {
        /* keep the synthesised cue */
      }
    }
    if (this.buffers.has('music')) this.syncMusic();
  }

  // ─────────────────────────────── building blocks ───────────────────────────────

  private tone(freq: number, start: number, dur: number, type: OscillatorType, gain: number, opts: { slideTo?: number; attack?: number; room?: boolean; bus?: GainNode } = {}) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    if (opts.slideTo) o.frequency.exponentialRampToValueAtTime(opts.slideTo, start + dur);
    const a = opts.attack ?? 0.008;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + a);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g).connect(opts.bus ?? this.sfx!);
    if (opts.room) g.connect(this.room!);
    o.start(start);
    o.stop(start + dur + 0.05);
  }

  private hiss(start: number, dur: number, gain: number, freq: number, q = 0.8, bus?: GainNode) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(f).connect(g).connect(bus ?? this.sfx!);
    src.start(start);
    src.stop(start + dur + 0.02);
  }

  play(cue: Cue) {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime + 0.005;
    const buf = this.buffers.get(cue);
    if (buf) {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(this.sfx!);
      src.start(t);
      return;
    }
    switch (cue) {
      case 'tap': this.hiss(t, 0.03, 0.04, 2400, 2); break;
      case 'step': this.tone(720, t, 0.05, 'sine', 0.05); this.hiss(t, 0.03, 0.05, 3200, 3); break;
      case 'erase': this.tone(480, t, 0.07, 'sine', 0.045, { slideTo: 380 }); this.hiss(t, 0.03, 0.03, 1800, 3); break;
      case 'pickup':
        this.tone(784, t, 0.12, 'triangle', 0.07, { room: true });
        this.tone(1175, t + 0.07, 0.2, 'triangle', 0.06, { room: true });
        this.hiss(t, 0.04, 0.04, 5000, 2);
        break;
      case 'deliver':
        // A small hand bell: a fundamental with bright, slightly inharmonic partials.
        for (const [f, g, d] of [[1318, 0.08, 1.1], [2637, 0.03, 0.7], [3520, 0.018, 0.5], [1976, 0.03, 0.9]] as const) this.tone(f, t, d, 'sine', g, { room: true });
        break;
      case 'blocked': this.tone(170, t, 0.18, 'sine', 0.1, { slideTo: 105 }); this.hiss(t, 0.08, 0.05, 400, 1); break;
      case 'bell':
        // Bicycle bell: two quick rings.
        for (const off of [0, 0.14]) for (const [f, g] of [[2093, 0.05], [2793, 0.03], [3951, 0.015]] as const) this.tone(f, t + off, 0.45, 'sine', g, { room: true });
        break;
      case 'stamp': this.tone(95, t, 0.22, 'sine', 0.22, { slideTo: 60 }); this.hiss(t, 0.09, 0.12, 900, 0.7); break;
      case 'complete':
        [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, t + i * 0.09, 0.6, 'triangle', 0.055, { room: true }));
        this.tone(2093, t + 0.4, 0.9, 'sine', 0.03, { room: true });
        break;
    }
  }

  // ─────────────────────────────── music ───────────────────────────────

  private syncMusic() {
    const ctx = this.ctx;
    if (!ctx || !this.musicBus) return;
    const should = this.musicWanted && document.visibilityState === 'visible';
    const now = ctx.currentTime;
    this.musicBus.gain.cancelScheduledValues(now);
    this.musicBus.gain.setTargetAtTime(should ? 0.32 : 0, now, should ? 0.8 : 0.15);
    if (should && !this.musicTimer) {
      const file = this.buffers.get('music');
      if (file) {
        this.musicSource = ctx.createBufferSource();
        this.musicSource.buffer = file;
        this.musicSource.loop = true;
        this.musicSource.connect(this.musicBus);
        this.musicSource.start();
        this.musicTimer = -1;
        return;
      }
      this.nextBar = Math.max(this.nextBar, now + 0.1);
      this.musicTimer = window.setInterval(() => this.schedule(), 100);
    } else if (!should && this.musicTimer) {
      if (this.musicTimer > 0) clearInterval(this.musicTimer);
      this.musicSource?.stop();
      this.musicSource = null;
      this.musicTimer = 0;
    }
  }

  /** Look-ahead scheduler: queue each bar a little before it is due. */
  private schedule() {
    const ctx = this.ctx!;
    const beat = 60 / 80;
    while (this.nextBar < ctx.currentTime + 0.6) {
      const t0 = this.nextBar;
      const ch = PROGRESSION[this.bar % PROGRESSION.length];
      const bus = this.musicBus!;
      // Pad: soft chord, slow attack.
      for (const n of [ch.root, ch.third, ch.fifth]) this.tone(midi(n), t0, beat * 4.2, 'sine', 0.035, { attack: 0.6, bus });
      // Bass on beats one and three.
      this.tone(midi(ch.root - 12), t0, beat * 1.8, 'triangle', 0.06, { attack: 0.02, bus });
      this.tone(midi(ch.root - 12), t0 + beat * 2, beat * 1.8, 'triangle', 0.05, { attack: 0.02, bus });
      // Brushed off-beats.
      for (let b = 0; b < 4; b++) this.hiss(t0 + beat * (b + 0.5), 0.08, 0.012, 6000, 1.2, bus);
      // A wandering pentatonic melody, resting now and then.
      const rest = this.bar % 8 === 7;
      if (!rest) {
        const steps = this.bar % 2 ? [0, 1, 1.5, 2.5] : [0, 1.5, 2, 3];
        for (const st of steps) {
          if (Math.random() < 0.18) continue;
          const i = PENTATONIC.indexOf(this.lastNote);
          const move = [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)];
          const ni = Math.max(0, Math.min(PENTATONIC.length - 1, (i < 0 ? 3 : i) + move));
          this.lastNote = PENTATONIC[ni];
          this.tone(midi(this.lastNote), t0 + beat * st, beat * 0.9, 'triangle', 0.045, { attack: 0.01, bus, room: true });
        }
      }
      this.bar++;
      this.nextBar += beat * 4;
    }
  }
}

export function buzz(enabled: boolean, pattern: number | number[]) {
  if (!enabled) return;
  if (isNative()) {
    const total = Array.isArray(pattern) ? pattern.reduce((a, b) => a + b, 0) : pattern;
    void nativeTap(total > 40 ? 'medium' : 'light');
    return;
  }
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}
