import type { PuzzleDef } from '../core/types';
import { PUZZLES, PUZZLE_BY_ID } from '../data/puzzles';
import { dailyPuzzleId, parseDateKey, utcDateKey } from '../game/daily';
import { SaveStore } from '../game/storage';
import { AdvisorClient } from './advisorClient';
import type { AppServices, Route } from './appTypes';
import { PlayScreen } from './play';
import { BookScreen, HomeScreen, HowScreen, SettingsScreen, type Screen } from './screens';
import { Sound, buzz } from './sound';

function routeToHash(r: Route): string {
  switch (r.screen) {
    case 'home': return '#/';
    case 'book': return '#/book';
    case 'settings': return '#/settings';
    case 'how': return '#/how';
    case 'play': return r.mode === 'daily' ? `#/daily/${r.dateKey}` : `#/route/${r.puzzleId}`;
  }
}

/** Parse a location hash. Daily links only open today's or yesterday's route (UTC). */
export function hashToRoute(hash: string, now = new Date()): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'book') return { screen: 'book' };
  if (parts[0] === 'settings') return { screen: 'settings' };
  if (parts[0] === 'how') return { screen: 'how' };
  if (parts[0] === 'route' && parts[1] && PUZZLE_BY_ID.has(parts[1])) return { screen: 'play', puzzleId: parts[1], mode: 'practice' };
  if (parts[0] === 'daily' && parts[1]) {
    const t = parseDateKey(parts[1]);
    const today = utcDateKey(now);
    const yesterday = utcDateKey(new Date(now.getTime() - 86_400_000));
    if (t !== null && (parts[1] === today || parts[1] === yesterday)) {
      return { screen: 'play', puzzleId: '', mode: 'daily', dateKey: parts[1] };
    }
  }
  return { screen: 'home' };
}

export class App implements AppServices {
  readonly store = new SaveStore();
  readonly sound = new Sound();
  readonly advisor = new AdvisorClient();
  private current: Screen | PlayScreen | null = null;
  private readonly mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');

  constructor(private readonly host: HTMLElement) {
    this.applySettings();
    this.mq?.addEventListener?.('change', () => this.applySettings());
    window.addEventListener('hashchange', () => this.show(hashToRoute(location.hash)));
    this.show(hashToRoute(location.hash));
  }

  reducedMotion(): boolean {
    const m = this.store.data.settings.motion;
    return m === 'reduced' || (m === 'system' && !!this.mq?.matches);
  }

  haptics(pattern: number | number[]) {
    buzz(this.store.data.settings.haptics, pattern);
  }

  private applySettings() {
    this.sound.enabled = this.store.data.settings.sound;
    document.documentElement.classList.toggle('reduce-motion', this.reducedMotion());
  }

  nextPuzzle(p: PuzzleDef): PuzzleDef | undefined {
    return PUZZLES.find((q) => q.number === p.number + 1);
  }

  go(route: Route) {
    const hash = routeToHash(route);
    if (location.hash !== hash) location.hash = hash; // triggers show() via hashchange
    else this.show(route);
  }

  private show(route: Route) {
    this.current?.destroy();
    this.current = null;
    window.scrollTo(0, 0);
    let screen: Screen | PlayScreen;
    switch (route.screen) {
      case 'book': screen = new BookScreen(this); break;
      case 'settings': screen = new SettingsScreen(this, () => this.applySettings()); break;
      case 'how': screen = new HowScreen(this); break;
      case 'play': {
        if (route.mode === 'daily') {
          // The daily puzzle is fixed by the date in the link, so a session that
          // crosses midnight keeps the same route.
          const id = dailyPuzzleId(route.dateKey);
          screen = new PlayScreen(this, { puzzle: PUZZLE_BY_ID.get(id)!, mode: 'daily', dateKey: route.dateKey });
        } else {
          screen = new PlayScreen(this, { puzzle: PUZZLE_BY_ID.get(route.puzzleId)!, mode: 'practice' });
        }
        break;
      }
      default: screen = new HomeScreen(this);
    }
    this.current = screen;
    this.host.replaceChildren(screen.root);
    document.title = route.screen === 'play' ? `${(screen as PlayScreen).root.querySelector('h1')?.textContent} · The Daily Detour` : 'The Daily Detour';
    requestAnimationFrame(() => {
      if (this.current !== screen) return;
      if ('focusMap' in screen && screen.focusMap) screen.focusMap();
      else (screen.root.querySelector('h1') as HTMLElement | null)?.focus({ preventScroll: true });
    });
  }
}
