import type { Medal } from '../core/medals';
import type { NodeId } from '../core/types';

export const SAVE_KEY = 'daily-detour/save';
export const SAVE_VERSION = 1;

export interface LevelRecord {
  /** Puzzle revision this record was earned on. Records for other revisions are ignored. */
  rev: number;
  completions: number;
  bestMoves: number;
  bestMedal: Medal;
  /** Best result reached without any hints, if any. */
  bestCleanMoves?: number;
  /** The route behind the best result, shown as a ghost on replays. */
  bestRoute?: string[];
}

export interface DailyRecord {
  puzzleId: string;
  rev: number;
  moves: number;
  medal: Medal;
  hints: number;
}

export interface Settings {
  motion: 'system' | 'reduced' | 'full';
  sound: boolean;
  music: boolean;
  haptics: boolean;
  speed: 'relaxed' | 'brisk';
  /** Daily reminder (only offered in the installed app). Hour is local time, 0–23. */
  reminder: boolean;
  reminderHour: number;
}

export interface Draft {
  key: string;
  puzzleId: string;
  rev: number;
  route: NodeId[];
  hints: number;
}

export interface SaveData {
  version: number;
  levels: Record<string, LevelRecord>;
  daily: Record<string, DailyRecord>;
  settings: Settings;
  drafts: Record<string, Draft>;
  /** Village projects the player has restored, in order. */
  restored: string[];
  /** First-try golds in a row (without hints), and the longest such run. */
  goldRun: number;
  bestGoldRun: number;
  /** Coins spent so far; the balance is what deliveries earned minus this. */
  coinsSpent: number;
  /** Shop items bought (free starter items are implied). */
  owned: string[];
  /** Decorations placed in the village, by spot. */
  placed: Record<string, string>;
  /** What Pip is wearing, by part. */
  wear: Record<string, string>;
  /** The chosen map look ('look-seasonal' follows the book). */
  look: string;
}

export const DEFAULT_SETTINGS: Settings = { motion: 'system', sound: true, music: true, haptics: true, speed: 'relaxed', reminder: false, reminderHour: 9 };

export function emptySave(): SaveData {
  return { version: SAVE_VERSION, levels: {}, daily: {}, settings: { ...DEFAULT_SETTINGS }, drafts: {}, restored: [], goldRun: 0, bestGoldRun: 0, coinsSpent: 0, owned: [], placed: {}, wear: {}, look: 'look-seasonal' };
}

const MEDALS: readonly string[] = ['gold', 'silver', 'bronze'];
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isCount = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < 1e6;

function cleanLevel(v: unknown): LevelRecord | null {
  if (!isObj(v) || !isCount(v.rev) || !isCount(v.completions) || !isCount(v.bestMoves) || !MEDALS.includes(v.bestMedal as string)) return null;
  const r: LevelRecord = { rev: v.rev, completions: v.completions, bestMoves: v.bestMoves, bestMedal: v.bestMedal as Medal };
  if (isCount(v.bestCleanMoves)) r.bestCleanMoves = v.bestCleanMoves;
  if (Array.isArray(v.bestRoute) && v.bestRoute.length <= 300 && v.bestRoute.every((n) => typeof n === 'string' && n.length <= 12)) r.bestRoute = v.bestRoute as string[];
  return r;
}

function cleanDaily(v: unknown): DailyRecord | null {
  if (!isObj(v) || typeof v.puzzleId !== 'string' || !isCount(v.rev) || !isCount(v.moves) || !isCount(v.hints) || !MEDALS.includes(v.medal as string)) return null;
  return { puzzleId: v.puzzleId, rev: v.rev, moves: v.moves, medal: v.medal as Medal, hints: v.hints };
}

function cleanDraft(v: unknown): Draft | null {
  if (!isObj(v) || typeof v.key !== 'string' || typeof v.puzzleId !== 'string' || !isCount(v.rev) || !isCount(v.hints)) return null;
  if (!Array.isArray(v.route) || v.route.length > 500 || !v.route.every((n) => typeof n === 'string')) return null;
  return { key: v.key, puzzleId: v.puzzleId, rev: v.rev, route: v.route as string[], hints: v.hints };
}

function cleanSettings(v: unknown): Settings {
  const s = { ...DEFAULT_SETTINGS };
  if (!isObj(v)) return s;
  if (v.motion === 'system' || v.motion === 'reduced' || v.motion === 'full') s.motion = v.motion;
  if (typeof v.sound === 'boolean') s.sound = v.sound;
  if (typeof v.haptics === 'boolean') s.haptics = v.haptics;
  if (typeof v.music === 'boolean') s.music = v.music;
  if (typeof v.reminder === 'boolean') s.reminder = v.reminder;
  if (isCount(v.reminderHour) && v.reminderHour < 24) s.reminderHour = v.reminderHour;
  if (v.speed === 'relaxed' || v.speed === 'brisk') s.speed = v.speed;
  return s;
}

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

/** Parse saved JSON defensively: keep every valid entry, drop anything malformed. */
export function parseSave(raw: string | null): SaveData {
  const save = emptySave();
  if (!raw) return save;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return save;
  }
  if (!isObj(data) || typeof data.version !== 'number' || data.version > SAVE_VERSION) return save;
  if (isObj(data.levels)) for (const [k, v] of Object.entries(data.levels)) { const r = cleanLevel(v); if (r) save.levels[k] = r; }
  if (isObj(data.daily)) for (const [k, v] of Object.entries(data.daily)) { const r = cleanDaily(v); if (r && DATE_KEY.test(k)) save.daily[k] = r; }
  if (isObj(data.drafts)) for (const [k, v] of Object.entries(data.drafts)) { const r = cleanDraft(v); if (r && r.key === k) save.drafts[k] = r; }
  save.settings = cleanSettings(data.settings);
  const ITEM = /^[a-z0-9-]{1,24}$/;
  if (isCount(data.coinsSpent)) save.coinsSpent = data.coinsSpent;
  if (Array.isArray(data.owned)) save.owned = [...new Set(data.owned.filter((x): x is string => typeof x === 'string' && ITEM.test(x)))];
  if (isObj(data.placed)) for (const [k, v] of Object.entries(data.placed)) if (/^s\d{1,2}$/.test(k) && typeof v === 'string' && ITEM.test(v)) save.placed[k] = v;
  if (isObj(data.wear)) for (const [k, v] of Object.entries(data.wear)) if (['bike', 'helmet', 'scarf', 'jacket', 'crate'].includes(k) && typeof v === 'string' && ITEM.test(v)) save.wear[k] = v;
  if (typeof data.look === 'string' && /^look-[a-z]{1,12}$/.test(data.look)) save.look = data.look;
  if (isCount(data.goldRun)) save.goldRun = data.goldRun;
  if (isCount(data.bestGoldRun)) save.bestGoldRun = Math.max(data.bestGoldRun, save.goldRun);
  if (Array.isArray(data.restored)) save.restored = [...new Set(data.restored.filter((x): x is string => typeof x === 'string' && /^[a-z-]{1,24}$/.test(x)))];
  return save;
}

/** Minimal Storage surface so tests can inject a fake or a throwing store. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function defaultStore(): KeyValueStore | null {
  try {
    const ls = globalThis.localStorage;
    if (!ls) return null;
    const probe = '__dd_probe__';
    ls.setItem(probe, '1');
    ls.removeItem(probe);
    return ls;
  } catch {
    return null;
  }
}

/**
 * Progress persistence. Falls back to memory when storage is unavailable
 * (private mode, blocked cookies) so the game keeps working for the session.
 */
export class SaveStore {
  data: SaveData;
  readonly persistent: boolean;
  private store: KeyValueStore | null;

  constructor(store: KeyValueStore | null | undefined = undefined) {
    this.store = store === undefined ? defaultStore() : store;
    let raw: string | null = null;
    try {
      raw = this.store?.getItem(SAVE_KEY) ?? null;
    } catch {
      this.store = null;
    }
    this.persistent = this.store !== null;
    this.data = parseSave(raw);
  }

  flush(): boolean {
    if (!this.store) return false;
    try {
      this.store.setItem(SAVE_KEY, JSON.stringify(this.data));
      return true;
    } catch {
      return false;
    }
  }

  levelRecord(puzzleId: string, rev: number): LevelRecord | undefined {
    const r = this.data.levels[puzzleId];
    return r && r.rev === rev ? r : undefined;
  }

  /** Records a completion; returns whether it improved the personal best. */
  recordCompletion(puzzleId: string, rev: number, moves: number, medal: Medal, hints: number, route?: readonly string[]): { newBest: boolean; previousBest?: number } {
    const prev = this.levelRecord(puzzleId, rev);
    const rank = { gold: 3, silver: 2, bronze: 1 } as const;
    const next: LevelRecord = prev
      ? { ...prev, completions: prev.completions + 1 }
      : { rev, completions: 1, bestMoves: moves, bestMedal: medal };
    const newBest = !prev || moves < prev.bestMoves;
    if (newBest) next.bestMoves = moves;
    if ((newBest || !next.bestRoute) && route) next.bestRoute = [...route];
    if (!prev || rank[medal] > rank[prev.bestMedal]) next.bestMedal = medal;
    if (hints === 0 && (next.bestCleanMoves === undefined || moves < next.bestCleanMoves)) next.bestCleanMoves = moves;
    this.data.levels[puzzleId] = next;
    this.flush();
    return { newBest, previousBest: prev?.bestMoves };
  }

  /**
   * First-try golds in a row. Only a puzzle's first delivery counts: gold adds
   * one, silver or bronze starts again, and a hint-assisted delivery leaves the
   * run as it was (hints are there to be used).
   */
  noteFirstDelivery(medal: Medal, hints: number): { run: number; best: number; newBest: boolean } {
    const before = this.data.bestGoldRun;
    if (hints === 0) {
      this.data.goldRun = medal === 'gold' ? this.data.goldRun + 1 : 0;
      this.data.bestGoldRun = Math.max(before, this.data.goldRun);
      this.flush();
    }
    return { run: this.data.goldRun, best: this.data.bestGoldRun, newBest: this.data.bestGoldRun > before };
  }

  /**
   * Re-grade saved stamps when the medal rules change: each record's medal is
   * worked out again from its best moves. A delivery that no longer earns a
   * stamp keeps bronze, so nobody loses a route they had finished.
   */
  regrade(grade: (puzzleId: string, rev: number, moves: number) => Medal | null | undefined) {
    let changed = false;
    for (const [id, r] of Object.entries(this.data.levels)) {
      const g = grade(id, r.rev, r.bestMoves);
      if (g === undefined) continue;
      const m = g ?? 'bronze';
      if (m !== r.bestMedal) { r.bestMedal = m; changed = true; }
    }
    for (const r of Object.values(this.data.daily)) {
      const g = grade(r.puzzleId, r.rev, r.moves);
      if (g === undefined) continue;
      const m = g ?? 'bronze';
      if (m !== r.medal) { r.medal = m; changed = true; }
    }
    if (changed) this.flush();
  }

  /** Record coins spent (the caller checks the balance first). */
  spend(coins: number) {
    if (!(coins > 0)) return;
    this.data.coinsSpent += Math.round(coins);
    this.flush();
  }

  /** Buy a shop item once: it is owned for good. Returns false if already owned. */
  buy(id: string, price: number): boolean {
    if (this.data.owned.includes(id)) return false;
    this.data.owned.push(id);
    this.data.coinsSpent += Math.max(0, Math.round(price));
    this.flush();
    return true;
  }

  /** Put a decoration in a spot (or clear the spot with null). A decoration stands in one spot at a time. */
  place(slot: string, id: string | null) {
    for (const [k, v] of Object.entries(this.data.placed)) if (v === id) delete this.data.placed[k];
    if (id) this.data.placed[slot] = id; else delete this.data.placed[slot];
    this.flush();
  }

  setWear(part: string, id: string) {
    this.data.wear[part] = id;
    this.flush();
  }

  setLook(id: string) {
    this.data.look = id;
    this.flush();
  }

  /** The first daily completion for a date is kept; later replays only improve it. */
  recordDaily(dateKey: string, rec: DailyRecord) {
    const prev = this.data.daily[dateKey];
    if (!prev || prev.puzzleId !== rec.puzzleId || rec.moves < prev.moves) this.data.daily[dateKey] = rec;
    this.flush();
  }

  saveDraft(d: Draft) {
    if (d.route.length <= 1) delete this.data.drafts[d.key];
    else this.data.drafts[d.key] = d;
    // Keep drafts bounded.
    const keys = Object.keys(this.data.drafts);
    if (keys.length > 30) delete this.data.drafts[keys[0]];
    this.flush();
  }

  draft(key: string, puzzleId: string, rev: number): Draft | undefined {
    const d = this.data.drafts[key];
    return d && d.puzzleId === puzzleId && d.rev === rev ? d : undefined;
  }

  clearDraft(key: string) {
    delete this.data.drafts[key];
    this.flush();
  }

  updateSettings(patch: Partial<Settings>) {
    this.data.settings = { ...this.data.settings, ...patch };
    this.flush();
  }

  restore(projectId: string) {
    if (!this.data.restored.includes(projectId)) this.data.restored.push(projectId);
    this.flush();
  }

  resetProgress() {
    const settings = this.data.settings;
    this.data = emptySave();
    this.data.settings = settings;
    this.flush();
  }
}
