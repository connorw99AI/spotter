import { medalName, type Medal } from '../core/medals';
import type { PuzzleDef, Tier } from '../core/types';
import { DAILY_ROTATION, dailyNumber, dailyPuzzle, msUntilNextUtcDay, utcDateKey } from '../game/daily';
import { shareResult, shareText } from '../game/share';
import { PUZZLES, PUZZLE_BY_ID } from '../data/puzzles';
import type { AppServices } from './appTypes';
import { backIcon, basketIcon, bookIcon, coneIcon, courierSvg, cottageSvg, gearIcon, infoIcon, itemIcon, mechanicIcon, shopSvg, treeSvg, C } from './art';
import { h, icon, setKids } from './dom';

export interface Screen {
  readonly root: HTMLElement;
  destroy(): void;
  focusMap?(): void;
}

const tierName: Record<Tier, string> = {
  tutorial: 'First rounds',
  approachable: 'Easy rounds',
  intermediate: 'Busier rounds',
  challenging: 'Tricky rounds',
};

const tierBlurb: Record<Tier, string> = {
  tutorial: 'Learn to draw a route, collect and deliver.',
  approachable: 'More orders, roadworks, and ice cream that melts.',
  intermediate: 'One-way streets and a basket that only holds two.',
  challenging: 'Everything at once. Take your time.',
};

function stampMini(medal: Medal, label?: string): HTMLElement {
  return h('span', { class: `stamp-mini stamp-${medal}` }, label ?? medalName[medal]);
}

function topBar(title: string, back: () => void, backLabel: string): HTMLElement {
  return h('header', { class: 'page-top' },
    h('button', { class: 'btn-icon', type: 'button', 'aria-label': backLabel, onclick: back }, icon(backIcon, 22)),
    h('h1', { tabindex: -1 }, title),
    h('span', { class: 'page-top-spacer' }),
  );
}

function heroArt(): string {
  // A lane curling through a little village, with the courier mid-delivery.
  return `<svg viewBox="0 0 360 170" class="hero-art" aria-hidden="true">
    <rect width="360" height="170" rx="22" fill="${C.lawn}"/>
    <path d="M-10 128C60 96 110 150 180 118S300 70 370 96" fill="none" stroke="${C.kerb}" stroke-width="30" stroke-linecap="round"/>
    <path d="M-10 128C60 96 110 150 180 118S300 70 370 96" fill="none" stroke="${C.road}" stroke-width="22" stroke-linecap="round"/>
    <path d="M-10 128C60 96 110 150 180 118S300 70 370 96" fill="none" stroke="${C.forest}" stroke-width="4" stroke-dasharray="2 11" stroke-linecap="round" opacity=".55"/>
    <g transform="translate(46 70)">${cottageSvg(C.terracotta, '#F6E7CB', 1.25)}</g>
    <g transform="translate(108 56)">${treeSvg(1.2, 1)}</g>
    <g transform="translate(150 78)">${shopSvg('bakery', 1.15)}</g>
    <g transform="translate(250 56)">${shopSvg('icecream', 1.1)}</g>
    <g transform="translate(312 44)">${cottageSvg('#C98A4B', '#F6E7CB', 1.05)}</g>
    <g transform="translate(300 140)">${treeSvg(1, 0)}</g>
    <g transform="translate(26 150)">${treeSvg(.9, 2)}</g>
    <g transform="translate(206 112) scale(.95)" class="hero-courier">${courierSvg()}</g>
  </svg>`;
}

// ─────────────────────────────────── Home ───────────────────────────────────

export class HomeScreen implements Screen {
  readonly root: HTMLElement;
  private timer = 0;
  private dateKey: string;

  constructor(private readonly app: AppServices) {
    this.dateKey = utcDateKey(new Date());
    this.root = h('section', { class: 'screen home' });
    this.render();
    this.timer = window.setInterval(() => this.tick(), 30_000);
  }

  private tick() {
    const now = utcDateKey(new Date());
    if (now !== this.dateKey) {
      this.dateKey = now;
      this.render();
    } else {
      const cd = this.root.querySelector('.countdown');
      if (cd) cd.textContent = this.countdown();
    }
  }

  private countdown(): string {
    const ms = msUntilNextUtcDay(new Date());
    const hrs = Math.floor(ms / 3_600_000);
    const mins = Math.floor((ms % 3_600_000) / 60_000);
    return `Next daily route in ${hrs > 0 ? `${hrs}h ` : ''}${mins}m`;
  }

  private render() {
    const store = this.app.store;
    const key = this.dateKey;
    const daily = dailyPuzzle(key, PUZZLE_BY_ID);
    const n = dailyNumber(key);
    const rec = store.data.daily[key];
    const done = rec && rec.puzzleId === daily.id && rec.rev === daily.rev;
    const draft = store.draft(`daily:${key}`, daily.id, daily.rev);
    const dateLabel = new Date(`${key}T12:00:00Z`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

    const shareStatus = h('p', { class: 'share-status', 'aria-live': 'polite' });
    const dailyCard = h('article', { class: `daily-card${done ? ' done' : ''}` },
      h('div', { class: 'daily-head' },
        h('p', { class: 'daily-kicker' }, `Daily #${n}`, h('span', { class: 'daily-date' }, `${dateLabel} (UTC)`)),
        done ? stampMini(rec.medal) : null),
      h('h2', {}, daily.title),
      h('p', { class: 'daily-brief' }, daily.brief),
      done
        ? h('p', { class: 'daily-result' }, `Delivered in ${rec.moves} moves${rec.hints ? ` with ${rec.hints} ${rec.hints === 1 ? 'hint' : 'hints'}` : ', no hints'}.`)
        : null,
      h('div', { class: 'daily-actions' },
        done
          ? h('button', { class: 'btn btn-quiet', type: 'button', onclick: async () => {
            const r = await shareResult(shareText({ puzzle: daily, moves: rec.moves, gold: daily.gold, medal: rec.medal, hints: rec.hints, daily: { number: n, dateKey: key } }));
            shareStatus.textContent = r === 'copied' ? 'Result copied to the clipboard.' : r === 'shared' ? 'Shared.' : r === 'failed' ? 'Couldn’t share from this browser.' : '';
          } }, 'Share result')
          : null,
        h('button', { class: `btn ${done ? 'btn-quiet' : 'btn-primary'}`, type: 'button', onclick: () => this.app.go({ screen: 'play', puzzleId: daily.id, mode: 'daily', dateKey: key }) },
          done ? 'Ride it again' : draft ? 'Carry on with today’s route' : 'Play today’s route'),
      ),
      shareStatus,
      h('p', { class: 'daily-note' },
        `Everyone gets the same route each UTC day. The daily rotates through ${DAILY_ROTATION.length} hand-made routes from the book. `,
        h('span', { class: 'countdown' }, this.countdown())),
    );

    const solved = PUZZLES.filter((p) => store.levelRecord(p.id, p.rev));
    const golds = PUZZLES.filter((p) => store.levelRecord(p.id, p.rev)?.bestMedal === 'gold').length;
    const next = PUZZLES.find((p) => !store.levelRecord(p.id, p.rev));
    const continueCard = h('article', { class: 'continue-card' },
      next
        ? h('div', {},
          h('p', { class: 'continue-kicker' }, solved.length === 0 ? 'New here? Start with' : 'Up next in the book'),
          h('h2', {}, `${next.number}. ${next.title}`),
          h('p', { class: 'muted' }, next.brief))
        : h('div', {}, h('p', { class: 'continue-kicker' }, 'Every route delivered'), h('h2', {}, `${golds} of ${PUZZLES.length} at gold`), h('p', { class: 'muted' }, 'Chase the gold stamps you’re missing.')),
      h('div', { class: 'continue-actions' },
        next ? h('button', { class: `btn ${solved.length === 0 ? 'btn-primary' : 'btn-secondary'}`, type: 'button', onclick: () => this.app.go({ screen: 'play', puzzleId: next.id, mode: 'practice' }) }, solved.length === 0 ? 'Start the first round' : 'Play') : null,
        h('button', { class: 'btn btn-quiet', type: 'button', onclick: () => this.app.go({ screen: 'book' }) }, icon(bookIcon, 18), 'Route book'),
      ),
      h('p', { class: 'progress-line' }, `${solved.length} of ${PUZZLES.length} delivered · ${golds} gold`),
    );

    setKids(this.root,
      h('div', { class: 'home-hero' },
        h('div', { class: 'hero-frame' }),
        h('h1', { class: 'logo', tabindex: -1 }, 'The Daily Detour'),
        h('p', { class: 'tagline' }, 'A little journey. A clever detour.')),
      h('div', { class: 'home-cards' }, solved.length === 0 ? continueCard : dailyCard, solved.length === 0 ? dailyCard : continueCard),
      h('nav', { class: 'home-nav', 'aria-label': 'More' },
        h('button', { class: 'btn-link', type: 'button', onclick: () => this.app.go({ screen: 'how' }) }, icon(infoIcon, 18), 'How to play'),
        h('button', { class: 'btn-link', type: 'button', onclick: () => this.app.go({ screen: 'settings' }) }, icon(gearIcon, 18), 'Settings')),
      store.persistent ? null : h('p', { class: 'storage-warn' }, 'This browser isn’t letting the game save, so progress lasts until you close the tab.'),
    );
    (this.root.querySelector('.hero-frame') as HTMLElement).innerHTML = heroArt();
  }

  destroy() {
    clearInterval(this.timer);
    this.root.remove();
  }
}

// ─────────────────────────────────── Route book ───────────────────────────────────

export class BookScreen implements Screen {
  readonly root: HTMLElement;

  constructor(private readonly app: AppServices) {
    const store = app.store;
    const next = PUZZLES.find((p) => !store.levelRecord(p.id, p.rev));
    const sections = (['tutorial', 'approachable', 'intermediate', 'challenging'] as Tier[]).map((tier) => {
      const ps = PUZZLES.filter((p) => p.tier === tier);
      return h('section', { class: 'book-section', 'aria-labelledby': `tier-${tier}` },
        h('h2', { id: `tier-${tier}` }, tierName[tier]),
        h('p', { class: 'muted' }, tierBlurb[tier]),
        h('ol', { class: 'tickets' }, ...ps.map((p) => h('li', {}, this.ticket(p, p === next)))),
      );
    });
    const solved = PUZZLES.filter((p) => store.levelRecord(p.id, p.rev)).length;
    const golds = PUZZLES.filter((p) => store.levelRecord(p.id, p.rev)?.bestMedal === 'gold').length;
    this.root = h('section', { class: 'screen book' },
      topBar('Route book', () => app.go({ screen: 'home' }), 'Back to town'),
      h('div', { class: 'book-body' },
        h('p', { class: 'book-summary' }, `${solved} of ${PUZZLES.length} delivered, ${golds} at gold. Every route is open — play them in any order.`),
        ...sections),
    );
  }

  private ticket(p: PuzzleDef, isNext: boolean): HTMLElement {
    const rec = this.app.store.levelRecord(p.id, p.rev);
    const mech = p.mechanics.filter((m) => mechanicIcon[m]);
    const result = rec
      ? h('span', { class: 'ticket-result' }, stampMini(rec.bestMedal), h('span', {}, `Best ${rec.bestMoves} · gold ${p.gold}`), rec.bestCleanMoves !== undefined ? h('span', { class: 'clean', title: 'Delivered without hints' }, 'no hints') : null)
      : h('span', { class: 'ticket-result muted' }, isNext ? 'Up next' : `Gold ${p.gold}`);
    const label = `Route ${p.number}: ${p.title}. ${rec ? `${medalName[rec.bestMedal]}, best ${rec.bestMoves} moves.` : 'Not delivered yet.'} ${mech.map((m) => mechanicIcon[m].label).join(', ')}`;
    return h('button', { class: `ticket${rec ? ' done' : ''}${isNext ? ' next' : ''}`, type: 'button', 'aria-label': label, onclick: () => this.app.go({ screen: 'play', puzzleId: p.id, mode: 'practice' }) },
      h('span', { class: 'ticket-no', 'aria-hidden': 'true' }, String(p.number)),
      h('span', { class: 'ticket-main' },
        h('span', { class: 'ticket-title' }, p.title),
        h('span', { class: 'ticket-brief' }, p.brief)),
      h('span', { class: 'ticket-side' },
        h('span', { class: 'ticket-mech', 'aria-hidden': 'true' }, ...mech.map((m) => h('span', { title: mechanicIcon[m].label }, icon(mechanicIcon[m].svg, 16)))),
        result),
    );
  }

  destroy() { this.root.remove(); }
}

// ─────────────────────────────────── Settings ───────────────────────────────────

export class SettingsScreen implements Screen {
  readonly root: HTMLElement;

  constructor(private readonly app: AppServices, private readonly onChange: () => void) {
    this.root = h('section', { class: 'screen settings' });
    this.render();
  }

  private seg<T extends string>(name: string, label: string, value: T, options: [T, string][], set: (v: T) => void): HTMLElement {
    return h('fieldset', { class: 'seg' },
      h('legend', {}, label),
      h('div', { class: 'seg-opts' }, ...options.map(([v, text]) => h('label', { class: v === value ? 'on' : '' },
        h('input', { type: 'radio', name, value: v, checked: v === value, onchange: () => { set(v); this.onChange(); this.render(); } }), text))),
    );
  }

  private render() {
    const s = this.app.store.data.settings;
    const set = (patch: Partial<typeof s>) => this.app.store.updateSettings(patch);
    const canVibrate = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
    let confirming = false;
    const reset = h('button', { class: 'btn btn-quiet btn-danger', type: 'button', onclick: () => {
      if (!confirming) {
        confirming = true;
        reset.textContent = 'Tap again to erase all progress';
        return;
      }
      this.app.store.resetProgress();
      reset.textContent = 'Progress erased';
      reset.disabled = true;
    } }, 'Reset progress');
    setKids(this.root,
      topBar('Settings', () => this.app.go({ screen: 'home' }), 'Back to town'),
      h('div', { class: 'settings-body' },
        this.seg('motion', 'Motion', s.motion, [['system', 'Match device'], ['reduced', 'Reduced'], ['full', 'Full']], (v) => set({ motion: v })),
        this.seg('speed', 'Courier speed', s.speed, [['relaxed', 'Relaxed'], ['brisk', 'Brisk']], (v) => set({ speed: v })),
        this.seg('sound', 'Sound', s.sound ? 'on' : 'off', [['on', 'On'], ['off', 'Off']], (v) => set({ sound: v === 'on' })),
        canVibrate ? this.seg('haptics', 'Vibration', s.haptics ? 'on' : 'off', [['on', 'On'], ['off', 'Off']], (v) => set({ haptics: v === 'on' })) : null,
        h('div', { class: 'settings-danger' }, h('h2', {}, 'Saved progress'),
          h('p', { class: 'muted' }, this.app.store.persistent ? 'Progress is saved in this browser only. There are no accounts.' : 'This browser isn’t allowing saves, so progress lasts until you close the tab.'),
          reset),
      ),
    );
  }

  destroy() { this.root.remove(); }
}

// ─────────────────────────────────── How to play ───────────────────────────────────

export class HowScreen implements Screen {
  readonly root: HTMLElement;

  constructor(app: AppServices) {
    const rule = (svg: string, title: string, text: string) => h('li', { class: 'rule' }, h('span', { class: 'rule-ico' }, icon(svg, 26)), h('div', {}, h('h3', {}, title), h('p', {}, text)));
    this.root = h('section', { class: 'screen how' },
      topBar('How to play', () => app.go({ screen: 'home' }), 'Back to town'),
      h('div', { class: 'how-body' },
        h('ol', { class: 'rules' },
          rule(itemIcon.bakery, 'Collect, then deliver', 'Draw a route from your cottage along the streets. Passing a shop collects its orders; passing the right house delivers them. Passing a house before you have its order does nothing.'),
          rule(`<path d="M-8 6c4-12 12-12 16 0" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M4 2l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`, 'Come home', 'The round ends when you’re back at the cottage with everything delivered. Every street costs one move, and you can ride a street more than once.'),
          rule(coneIcon, 'Roadworks', 'Coned-off streets are closed both ways.'),
          rule(itemIcon.icecream, 'Fresh orders', 'Ice cream melts and tulips wilt. The number on the order is how many moves it can travel after pickup. Shops hand orders over as soon as you pass, so time your visit.'),
          rule(mechanicIcon.oneway.svg, 'One-way streets', 'Arrows on the road show the only direction you can ride.'),
          rule(basketIcon, 'A basket for two', 'On some rounds the basket holds two orders. Pass a shop with a full basket and the order waits for you — which can be handy.'),
        ),
        h('h2', {}, 'Controls'),
        h('ul', { class: 'controls-list' },
          h('li', {}, h('b', {}, 'Drag'), ' from the end of your route through the corners you want, or ', h('b', {}, 'tap'), ' the next corner.'),
          h('li', {}, h('b', {}, 'Drag back'), ' along your route to erase. After a pickup or drop-off, stepping back turns the courier round instead — use Undo to remove that step.'),
          h('li', {}, h('b', {}, 'Undo, Redo, Clear'), ' sit under the map. ', h('b', {}, 'Preview'), ' rides the route so far; ', h('b', {}, 'Deliver'), ' appears when the route is complete.'),
          h('li', {}, h('b', {}, 'Keyboard:'), ' arrow keys ride towards a corner (Home, Page Up, End and Page Down for diagonals), Space picks between corners, Enter rides there, Backspace or Ctrl+Z undoes.'),
        ),
        h('h2', {}, 'Stamps'),
        h('p', {}, 'Any complete round earns bronze. Silver is within 15% of the shortest route (at least two moves of slack). Gold is the shortest route there is. Hints are counted on your result and nowhere else.'),
      ),
    );
  }

  destroy() { this.root.remove(); }
}
