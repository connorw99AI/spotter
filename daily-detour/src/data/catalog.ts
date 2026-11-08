import type { PuzzleDef, Tier } from '../core/types';
import { decodePuzzle } from './codec';
import { DAILY_BANDS, DAILY_CODES } from './dailies';
import { GENERATED_PACKS } from './generated';
import { PUZZLES } from './puzzles';

export interface Chapter {
  id: string;
  title: string;
  blurb: string;
  ids: string[];
  /** The new rule this chapter is built around, if any. */
  featured?: string;
}

const pad = (n: number, w: number) => String(n).padStart(w, '0');

export const CHAPTERS: Chapter[] = [
  { id: 'classic', title: 'Classic routes', blurb: 'The twenty hand-made routes that teach every rule.', ids: PUZZLES.map((p) => p.id) },
  ...GENERATED_PACKS.map((p) => ({ id: p.id, title: p.title, blurb: p.blurb, featured: p.featured, ids: p.codes.map((_, i) => `${p.id}-${pad(i + 1, 2)}`) })),
];

const CHAPTER_BY_ID = new Map(CHAPTERS.map((c) => [c.id, c]));
const PACK_BY_ID = new Map(GENERATED_PACKS.map((p) => [p.id, p]));
const cache = new Map<string, PuzzleDef>(PUZZLES.map((p) => [p.id, p]));
const BAND_TIER: Record<string, Tier> = { e: 'approachable', m: 'intermediate', h: 'challenging' };

/** Any puzzle by id: classic, route-book chapter, or daily. Generated ones are decoded on first use. */
export function getPuzzle(id: string): PuzzleDef | undefined {
  const hit = cache.get(id);
  if (hit) return hit;
  let def: PuzzleDef | undefined;
  const daily = /^daily-(\d{3})$/.exec(id);
  const packed = /^(.+)-(\d{2})$/.exec(id);
  if (daily) {
    const i = Number(daily[1]) - 1;
    if (i >= 0 && i < DAILY_CODES.length) def = decodePuzzle(DAILY_CODES[i], { id, number: i + 1, tier: BAND_TIER[DAILY_BANDS[i]] });
  } else if (packed && PACK_BY_ID.has(packed[1])) {
    const pack = PACK_BY_ID.get(packed[1])!;
    const i = Number(packed[2]) - 1;
    if (i >= 0 && i < pack.codes.length) {
      // Chapters run from gentle to tricky; the scenery season follows along.
      const third = i / pack.codes.length;
      const tier: Tier = third < 0.34 ? 'approachable' : third < 0.7 ? 'intermediate' : 'challenging';
      def = decodePuzzle(pack.codes[i], { id, number: i + 1, tier, pack: pack.id });
    }
  }
  if (def) cache.set(id, def);
  return def;
}

export function chapterOf(p: PuzzleDef): Chapter | undefined {
  return p.pack ? CHAPTER_BY_ID.get(p.pack) : p.id.startsWith('daily-') ? undefined : CHAPTERS[0];
}

export function getChapter(id: string): Chapter | undefined {
  return CHAPTER_BY_ID.get(id);
}

/** How a puzzle is named in the interface and in shared results. */
export function puzzleLabel(p: PuzzleDef): string {
  if (p.id.startsWith('daily-')) return 'Daily route';
  if (p.pack) return `${CHAPTER_BY_ID.get(p.pack)?.title ?? 'Route'} ${p.number}`;
  return `Route ${p.number}`;
}

/** Every puzzle in the route book, in reading order. */
export const BOOK_IDS: string[] = CHAPTERS.flatMap((c) => c.ids);

export function nextInBook(p: PuzzleDef): PuzzleDef | undefined {
  const i = BOOK_IDS.indexOf(p.id);
  return i >= 0 && i + 1 < BOOK_IDS.length ? getPuzzle(BOOK_IDS[i + 1]) : undefined;
}

export const DAILY_COUNT = DAILY_CODES.length;
export const DAILY_BAND_OF = (index: number) => DAILY_BANDS[index % DAILY_BANDS.length];
