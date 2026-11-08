import { medalName, type Medal } from '../core/medals';
import type { PuzzleDef } from '../core/types';

const medalMark: Record<Medal, string> = { gold: '🥇', silver: '🥈', bronze: '🥉' };

export interface ShareInput {
  puzzle: PuzzleDef;
  moves: number;
  gold: number;
  medal: Medal;
  hints: number;
  daily?: { number: number; dateKey: string };
}

/** Spoiler-free result text: identifier, medal, moves and hint use. No route. */
export function shareText(i: ShareInput): string {
  const head = i.daily
    ? `The Daily Detour #${i.daily.number} (${i.daily.dateKey})`
    : `The Daily Detour · Route ${i.puzzle.number} “${i.puzzle.title}”`;
  const hints = i.hints === 0 ? 'No hints' : i.hints === 1 ? '1 hint' : `${i.hints} hints`;
  return [head, `${medalMark[i.medal]} ${medalName[i.medal]} · ${i.moves} moves (gold ${i.gold})`, hints].join('\n');
}

/** Native share sheet where available, otherwise the clipboard. */
export async function shareResult(text: string): Promise<'shared' | 'copied' | 'cancelled' | 'failed'> {
  const nav = globalThis.navigator as Navigator | undefined;
  if (nav?.share && (!nav.canShare || nav.canShare({ text }))) {
    try {
      await nav.share({ text });
      return 'shared';
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled';
    }
  }
  try {
    await nav?.clipboard?.writeText(text);
    if (nav?.clipboard) return 'copied';
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok ? 'copied' : 'failed';
  } catch {
    return 'failed';
  }
}
