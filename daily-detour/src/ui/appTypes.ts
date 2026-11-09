import type { PuzzleDef } from '../core/types';
import type { SaveStore } from '../game/storage';
import type { AdvisorClient } from './advisorClient';
import type { Sound } from './sound';

export type Route =
  | { screen: 'home' }
  | { screen: 'book' }
  | { screen: 'chapter'; chapterId: string }
  | { screen: 'settings' }
  | { screen: 'how' }
  | { screen: 'village'; tab?: 'village' | 'shop' | 'neighbours' }
  | { screen: 'stamps' }
  | { screen: 'play'; puzzleId: string; mode: 'practice' }
  | { screen: 'play'; puzzleId: string; mode: 'daily'; dateKey: string };

export interface AppServices {
  readonly store: SaveStore;
  readonly sound: Sound;
  readonly advisor: AdvisorClient;
  reducedMotion(): boolean;
  haptics(pattern: number | number[]): void;
  go(route: Route): void;
  /** Next puzzle after `p` in the book, or undefined at the end. */
  nextPuzzle(p: PuzzleDef): PuzzleDef | undefined;
}
