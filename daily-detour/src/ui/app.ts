import type { PuzzleDef } from '../core/types';
import { PUZZLES, PUZZLE_BY_ID } from '../data/puzzles';
import { dailyPuzzleId } from '../game/daily';
import { SaveStore } from '../game/storage';
import { AdvisorClient } from './advisorClient';
import type { AppServices, Route } from './appTypes';
import { hashToRoute, routeToHash } from './routes';
import { PlayScreen } from './play';
import { BookScreen, HomeScreen, HowScreen, SettingsScreen, type Screen } from './screens';
import { Sound, buzz } from './sound';

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
    if (location.hash !== hash) {
      try {
        location.hash = hash; // triggers show() via hashchange
        if (location.hash === hash) return;
      } catch {
        /* some embedded frames refuse hash changes; navigate in-page instead */
      }
    }
    this.show(route);
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
          screen = new PlayScreen(this, { puzzle: PUZZLE_BY_ID.get(dailyPuzzleId(route.dateKey))!, mode: 'daily', dateKey: route.dateKey });
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
