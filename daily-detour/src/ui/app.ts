import type { PuzzleDef } from '../core/types';
import { getPuzzle, nextInBook } from '../data/catalog';
import { dailyPuzzleId } from '../game/daily';
import { SaveStore } from '../game/storage';
import { AdvisorClient } from './advisorClient';
import { applyPipStyle } from './economy';
import type { AppServices, Route } from './appTypes';
import { hashToRoute, routeToHash } from './routes';
import { PlayScreen } from './play';
import { BookScreen, ChapterScreen, HomeScreen, HowScreen, SettingsScreen, type Screen } from './screens';
import { Sound, buzz } from './sound';
import { StampsScreen, VillageScreen } from './village';

export class App implements AppServices {
  readonly store = new SaveStore();
  readonly sound = new Sound();
  readonly advisor = new AdvisorClient();
  private current: Screen | PlayScreen | null = null;
  private readonly mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');

  constructor(private readonly host: HTMLElement) {
    this.applySettings();
    applyPipStyle(this);
    this.mq?.addEventListener?.('change', () => this.applySettings());
    window.addEventListener('hashchange', () => this.show(hashToRoute(location.hash)));
    // Browsers only start audio after a gesture.
    window.addEventListener('pointerdown', () => this.sound.unlock(), { capture: true });
    window.addEventListener('keydown', () => this.sound.unlock(), { capture: true });
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
    this.sound.setMusic(this.store.data.settings.music);
    document.documentElement.classList.toggle('reduce-motion', this.reducedMotion());
  }

  nextPuzzle(p: PuzzleDef): PuzzleDef | undefined {
    return nextInBook(p);
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
      case 'chapter': screen = new ChapterScreen(this, route.chapterId); break;
      case 'settings': screen = new SettingsScreen(this, () => this.applySettings()); break;
      case 'how': screen = new HowScreen(this); break;
      case 'village': screen = new VillageScreen(this, route.tab); break;
      case 'stamps': screen = new StampsScreen(this); break;
      case 'play': {
        if (route.mode === 'daily') {
          // The daily puzzle is fixed by the date in the link, so a session that
          // crosses midnight keeps the same route.
          screen = new PlayScreen(this, { puzzle: getPuzzle(dailyPuzzleId(route.dateKey))!, mode: 'daily', dateKey: route.dateKey });
        } else {
          screen = new PlayScreen(this, { puzzle: getPuzzle(route.puzzleId)!, mode: 'practice' });
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
