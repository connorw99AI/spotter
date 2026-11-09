import { medalName, type Medal } from '../core/medals';
import type { PuzzleDef, Tier } from '../core/types';
import { dailyNumber, dailyPace, dailyPuzzle, lastFreshDaily, msUntilNextUtcDay, utcDateKey } from '../game/daily';
import { BOOK_IDS, CHAPTERS, getChapter, getPuzzle, puzzleLabel, type Chapter } from '../data/catalog';
import { PROJECTS, daysLeftInEvent, eventOn, heartsFrom, projectState, runStats } from '../game/meta';
import { openShareSheet } from './shareSheet';
import { STORY, lettersFor, type Letter } from '../game/story';
import { portraitSvg } from './portraits';
import { isNative, setDailyReminder } from '../platform/native';
import type { AppServices } from './appTypes';
import { backIcon, basketIcon, bookIcon, calendarIcon, clockIcon, coneIcon, fragileIcon, gateIcon, courierSvg, flameIcon, gearIcon, heartIcon, infoIcon, itemIcon, mechanicIcon, shareIcon, C } from './art';
import { buildTown } from '../core/town';
import { seeded } from './geometry';
import { miniMapSvg } from './scene';
import { flowerBedArt, houseArt, lampArt, pineArt, randomHouseLook, shopArt, treeArt } from './sceneryArt';
import { THEMES, themeFor } from './theme';
import { h, icon, setKids } from './dom';
import { coinBalance, coinPill } from './economy';

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

export function stampMini(medal: Medal, label?: string): HTMLElement {
  return h('span', { class: `stamp-mini stamp-${medal}` }, label ?? medalName[medal]);
}

export function topBar(title: string, back: () => void, backLabel: string): HTMLElement {
  return h('header', { class: 'page-top' },
    h('button', { class: 'btn-icon', type: 'button', 'aria-label': backLabel, onclick: back }, icon(backIcon, 22)),
    h('h1', { tabindex: -1 }, title),
    h('span', { class: 'page-top-spacer' }),
  );
}

/** The lane through the hero, as cubic segments, so scenery can keep off it. */
const HERO_LANE: [number, number][][] = [
  [[-460, 120], [-360, 90], [-160, 164], [-60, 132]],
  [[-60, 132], [40, 100], [100, 152], [180, 122]],
  [[180, 122], [260, 92], [300, 76], [420, 100]],
  [[420, 100], [540, 124], [700, 80], [820, 110]],
];
const laneD = (segs: [number, number][][]) => `M${segs[0][0].join(' ')}` + segs.map(([, a, b, c]) => `C${a.join(' ')} ${b.join(' ')} ${c.join(' ')}`).join('');

/**
 * The home screen's village: a lane curling through it with Pip mid-round.
 * The middle 360×180 is composed by hand; the countryside around it is
 * scattered so the art can fill a phone edge to edge or a wide desktop band.
 */
function heroArt(animate: boolean): string {
  const t = THEMES.spring;
  const lane = laneD(HERO_LANE);
  const ride = laneD(HERO_LANE.slice(1, 3));
  const rnd = seeded('hero');
  const look = () => randomHouseLook(rnd, false);
  const hedgeBlock = (x: number, y: number, w: number, hgt: number) => `
    <rect x="${x}" y="${y}" width="${w}" height="${hgt}" rx="10" fill="${t.hedgeDeep}"/>
    <rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${hgt - 8}" rx="7" fill="${t.hedge}" stroke="${t.hedge}" stroke-width="3" stroke-dasharray="0 9" stroke-linecap="round"/>
    <rect x="${x + 9}" y="${y + 9}" width="${w - 18}" height="${hgt - 18}" rx="4" fill="${t.garden[0]}"/>
    <rect x="${x + 9}" y="${y + 9}" width="${(w - 18) / 2}" height="${hgt - 18}" rx="4" fill="${t.garden[1]}"/>`;

  // Countryside around the hand-made middle: fields first, then trees and cottages.
  const pts: { x: number; y: number }[] = [];
  for (const [a, b, c, d] of HERO_LANE) {
    for (let i = 0; i <= 24; i++) {
      const u = i / 24, v = 1 - u;
      pts.push({ x: v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], y: v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1] });
    }
  }
  const laneDist = (x: number, y: number) => Math.min(...pts.map((p) => Math.hypot(p.x - x, p.y - y)));
  const core = (x: number, y: number, m: number) => x > -m && x < 360 + m && y > -m && y < 180 + m;
  const wide = seeded('hero-wide');
  let fields = '';
  const fieldBoxes: { x: number; y: number; w: number; h: number }[] = [];
  for (const [fx, fy] of [[-330, -50], [-200, 10], [-360, 170], [-210, 200], [400, -50], [560, 10], [450, 190], [610, 200], [-20, 215], [150, 225], [300, 230], [-130, 260]]) {
    const w = 110 + wide() * 60, hh = 70 + wide() * 40;
    const x = fx + (wide() - 0.5) * 30, y = fy + (wide() - 0.5) * 20;
    if (core(x + w / 2, y + hh / 2, 40 + Math.max(w, hh) / 2) || laneDist(x + w / 2, y + hh / 2) < Math.max(w, hh) / 2 + 22) continue;
    fieldBoxes.push({ x, y, w, h: hh });
    fields += hedgeBlock(Math.round(x), Math.round(y), Math.round(w), Math.round(hh));
  }
  const items: { y: number; svg: string }[] = [];
  for (let y = -60; y < 305; y += 30) {
    for (let x = -410; x < 780; x += 30) {
      const px = x + (wide() - 0.5) * 22, py = y + (wide() - 0.5) * 22;
      const roll = wide();
      if (core(px, py, 8) || laneDist(px, py) < 30) continue;
      if (fieldBoxes.some((f) => px > f.x - 12 && px < f.x + f.w + 12 && py > f.y - 14 && py < f.y + f.h + 8)) continue;
      const svg = roll < 0.3 ? treeArt(t, Math.floor(wide() * 8), 0.9 + wide() * 0.3) : roll < 0.42 ? pineArt(t, 0.95 + wide() * 0.25)
        : roll < 0.5 ? flowerBedArt(t, Math.floor(wide() * 3), 1) : roll < 0.54 ? houseArt(look(), 1) : '';
      if (svg) items.push({ y: py, svg: `<g transform="translate(${px.toFixed(1)} ${py.toFixed(1)})">${svg}</g>` });
    }
  }
  items.sort((a, b) => a.y - b.y);

  return `<svg viewBox="-400 -60 1160 350" preserveAspectRatio="xMidYMid slice" class="hero-art${animate ? ' riding' : ''}" aria-hidden="true">
    <defs><radialGradient id="hero-sun" cx=".3" cy=".05" r=".9"><stop offset="0" stop-color="#FFFAE4" stop-opacity=".5"/><stop offset="1" stop-color="#FFFAE4" stop-opacity="0"/></radialGradient>
    <pattern id="hero-tufts" width="52" height="52" patternUnits="userSpaceOnUse"><path d="M9 14l2-4 2 4M33 33l2-4 2 4M22 46l1.6-3 1.6 3" stroke="${t.lawnTuft}" stroke-width="1.4" fill="none" stroke-linecap="round"/></pattern></defs>
    <rect x="-400" y="-60" width="1160" height="350" fill="${t.lawn}"/>
    <rect x="-400" y="-60" width="1160" height="350" fill="url(#hero-tufts)"/>
    ${fields}${hedgeBlock(14, 18, 92, 76)}${hedgeBlock(238, 128, 110, 70)}
    <path d="${lane}" fill="none" stroke="${C.kerb}" stroke-width="34" stroke-linecap="round"/>
    <path d="${lane}" fill="none" stroke="${C.road}" stroke-width="26" stroke-linecap="round"/>
    <path d="${lane}" fill="none" stroke="#FFFDF6" stroke-opacity=".6" stroke-width="9" transform="translate(-2 -2)"/>
    <path d="${lane}" fill="none" stroke="#E4D6B6" stroke-width="2.4" stroke-dasharray="10 14"/>
    ${items.map((i) => i.svg).join('')}
    <g transform="translate(58 70)">${houseArt(look(), 1.25)}</g>
    <g transform="translate(150 84)">${shopArt('bakery', false, 1.05)}</g>
    <g transform="translate(118 50)">${treeArt(t, 0, 1.15)}</g>
    <g transform="translate(252 66)">${shopArt('florist', false, 1)}</g>
    <g transform="translate(212 40)">${treeArt(t, 2, 1.05)}</g>
    <g transform="translate(318 56)">${pineArt(t, 1.1)}</g>
    <g transform="translate(296 172)">${houseArt(look(), 1.05)}</g>
    <g transform="translate(24 172)">${treeArt(t, 1, 1)}</g>
    <g transform="translate(120 172)">${flowerBedArt(t, 1, 1.2)}</g>
    <g transform="translate(196 104)">${lampArt(false)}</g>
    <rect x="-400" y="-60" width="1160" height="350" fill="url(#hero-sun)"/>
    <g class="courier"${animate ? '' : ' transform="translate(176 112) scale(.92)"'}>
      <g transform="translate(0 -12) scale(.92)">${courierSvg()}</g>
      ${animate ? `<animateMotion dur="12s" repeatCount="indefinite" path="${ride}" rotate="0"/><animate attributeName="opacity" dur="12s" repeatCount="indefinite" values="0;1;1;0" keyTimes="0;.06;.94;1"/>` : ''}
    </g>
  </svg>`;
}

// ─────────────────────────────────── Home ───────────────────────────────────

/** Book progress, derived from saved records. */
export function bookProgress(app: AppServices) {
  let delivered = 0, golds = 0;
  let next: PuzzleDef | undefined;
  for (const id of BOOK_IDS) {
    const p = getPuzzle(id)!;
    const rec = app.store.levelRecord(p.id, p.rev);
    if (rec) { delivered++; if (rec.bestMedal === 'gold') golds++; } else if (!next) next = p;
  }
  return { delivered, golds, total: BOOK_IDS.length, next };
}

export function chapterDelivered(app: AppServices, c: Chapter): number {
  return c.ids.filter((id) => { const p = getPuzzle(id)!; return !!app.store.levelRecord(p.id, p.rev); }).length;
}

export function chapterProgressAll(app: AppServices): Record<string, { delivered: number; total: number }> {
  return Object.fromEntries(CHAPTERS.map((c) => [c.id, { delivered: chapterDelivered(app, c), total: c.ids.length }]));
}

export function letterCard(l: Letter, fresh = false): HTMLElement {
  const el = h('article', { class: `letter${fresh ? ' fresh' : ''}` },
    h('span', { class: 'letter-face', 'aria-hidden': 'true' }),
    h('div', { class: 'letter-body' }, h('p', { class: 'letter-from' }, fresh ? `New letter from ${l.from}` : l.from), h('p', { class: 'letter-text' }, `“${l.text}”`)));
  el.querySelector('.letter-face')!.innerHTML = portraitSvg(l.from, 44);
  return el;
}

export function heartCount(app: AppServices): number {
  const revs = new Map(BOOK_IDS.map((id) => [id, getPuzzle(id)!.rev]));
  return heartsFrom(app.store.data.levels, revs, app.store.data.daily);
}

const PACE_LABEL = { gentle: 'Gentle', steady: 'Steady', tricky: 'Tricky' } as const;

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
    const daily = dailyPuzzle(key, getPuzzle);
    const n = dailyNumber(key);
    const rec = store.data.daily[key];
    const done = rec && rec.puzzleId === daily.id && rec.rev === daily.rev;
    const draft = store.draft(`daily:${key}`, daily.id, daily.rev);
    const dateLabel = new Date(`${key}T12:00:00Z`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
    const pace = dailyPace(key);
    const runs = runStats(Object.keys(store.data.daily), key);
    const ev = eventOn(key);
    const freshUntil = new Date(`${lastFreshDaily()}T12:00:00Z`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

    const shareStatus = h('p', { class: 'share-status', 'aria-live': 'polite' });
    const runLine = runs.current > 0
      ? `${runs.current}-day run${runs.waitingToday ? ' · play today to keep it going' : ''}. Missing one day is a rest day; it won’t break your run.`
      : runs.total > 0 ? `${runs.total} dailies delivered so far. Play today to start a new run.` : 'Play today to start a run. Missing one day is a rest day.';
    const dailyCard = h('article', { class: `daily-card${done ? ' done' : ''}` },
      h('div', { class: 'daily-head' },
        h('p', { class: 'daily-kicker' }, `Daily #${n}`, h('span', { class: 'daily-date' }, `${dateLabel} (UTC)`), pace ? h('span', { class: `pace pace-${pace}` }, PACE_LABEL[pace]) : null),
        done ? stampMini(rec.medal) : null),
      h('h2', {}, daily.title),
      h('p', { class: 'daily-brief' }, daily.brief),
      done
        ? h('p', { class: 'daily-result' }, `Delivered in ${rec.moves} moves${rec.hints ? ` with ${rec.hints} ${rec.hints === 1 ? 'hint' : 'hints'}` : ', no hints'}.`)
        : null,
      h('div', { class: 'daily-actions' },
        done
          ? h('button', { class: 'btn btn-quiet', type: 'button', onclick: () => openShareSheet(this.app, { puzzle: daily, moves: rec.moves, gold: daily.gold, medal: rec.medal, hints: rec.hints, daily: { number: n, dateKey: key }, run: runs.current }, shareStatus) }, icon(shareIcon, 18), 'Share')
          : null,
        h('button', { class: `btn ${done ? 'btn-quiet' : 'btn-primary'}`, type: 'button', onclick: () => this.app.go({ screen: 'play', puzzleId: daily.id, mode: 'daily', dateKey: key }) },
          done ? 'Ride it again' : draft ? 'Carry on with today’s route' : 'Play today’s route'),
      ),
      shareStatus,
      h('p', { class: 'run-line' }, icon(flameIcon, 16), runLine),
      h('p', { class: 'daily-note' },
        `Everyone gets the same route each UTC day: a new one every day until ${freshUntil}, then the year repeats. `,
        h('span', { class: 'countdown' }, this.countdown())),
    );

    const prog = bookProgress(this.app);
    const next = prog.next;
    const continueCard = h('article', { class: 'continue-card' },
      next
        ? h('div', {},
          h('p', { class: 'continue-kicker' }, prog.delivered === 0 ? 'New here? Start with' : 'Up next in the book'),
          h('h2', {}, `${puzzleLabel(next)}: ${next.title}`),
          h('p', { class: 'muted' }, next.brief))
        : h('div', {}, h('p', { class: 'continue-kicker' }, 'Every route delivered'), h('h2', {}, `${prog.golds} of ${prog.total} at gold`), h('p', { class: 'muted' }, 'Chase the gold stamps you’re missing.')),
      h('div', { class: 'continue-actions' },
        next ? h('button', { class: `btn ${prog.delivered === 0 ? 'btn-primary' : 'btn-secondary'}`, type: 'button', onclick: () => this.app.go({ screen: 'play', puzzleId: next.id, mode: 'practice' }) }, prog.delivered === 0 ? 'Start the first round' : 'Play') : null,
        h('button', { class: 'btn btn-quiet', type: 'button', onclick: () => this.app.go({ screen: 'book' }) }, icon(bookIcon, 18), 'Route book'),
      ),
      h('p', { class: 'progress-line' }, `${prog.delivered} of ${prog.total} delivered · ${prog.golds} gold`),
    );

    const hearts = heartCount(this.app);
    const ready = PROJECTS.filter((p) => projectState(p, hearts, store.data.restored) === 'ready');
    const upcoming = PROJECTS.find((p) => projectState(p, hearts, store.data.restored) === 'locked');
    const villageCard = h('article', { class: 'village-card' },
      h('div', { class: 'village-card-main' },
        h('p', { class: 'continue-kicker' }, 'Your village'),
        h('h2', {}, ready.length ? `${ready.length === 1 ? 'A project is' : `${ready.length} projects are`} ready` : upcoming ? upcoming.title : 'Fully restored'),
        h('p', { class: 'muted' }, ready.length ? `${ready[0].resident} is waiting: ${ready[0].title.toLowerCase()}.` : upcoming ? `${Math.max(0, upcoming.cost - hearts)} more hearts. Deliveries earn hearts: 1 for bronze, 2 for silver, 3 for gold.` : 'Every corner of the village is mended. The fete goes on.')),
      h('div', { class: 'village-card-side' },
        h('span', { class: 'hearts', 'aria-label': `${hearts} hearts` }, icon(heartIcon, 18), String(hearts)),
        coinPill(coinBalance(this.app)),
        h('button', { class: `btn ${ready.length ? 'btn-primary' : 'btn-quiet'}`, type: 'button', onclick: () => this.app.go({ screen: 'village' }) }, 'Visit the village'),
        h('button', { class: 'btn btn-quiet', type: 'button', onclick: () => this.app.go({ screen: 'village', tab: 'shop' }) }, 'Shop')),
    );

    const banner = ev ? h('aside', { class: 'event-banner' },
      h('p', { class: 'event-title' }, ev.title, h('span', {}, `${daysLeftInEvent(ev, key)} days left`)),
      h('p', {}, `${ev.blurb} Deliver three event dailies to earn ${ev.keepsake} for your village.`)) : null;

    const first = prog.delivered === 0;
    setKids(this.root,
      h('div', { class: 'home-hero' },
        h('div', { class: 'hero-frame' }),
        h('div', { class: 'hero-title' },
          h('h1', { class: 'logo', tabindex: -1 }, 'The Daily Detour'),
          h('p', { class: 'tagline' }, 'A little journey. A clever detour.'))),
      banner,
      h('div', { class: 'home-cards' }, first ? continueCard : dailyCard, first ? dailyCard : continueCard, villageCard),
      h('nav', { class: 'home-nav', 'aria-label': 'More' },
        h('button', { class: 'btn-link', type: 'button', onclick: () => this.app.go({ screen: 'stamps' }) }, icon(calendarIcon, 18), 'Stamps'),
        h('button', { class: 'btn-link', type: 'button', onclick: () => this.app.go({ screen: 'how' }) }, icon(infoIcon, 18), 'How to play'),
        h('button', { class: 'btn-link', type: 'button', onclick: () => this.app.go({ screen: 'settings' }) }, icon(gearIcon, 18), 'Settings')),
      store.persistent ? null : h('p', { class: 'storage-warn' }, 'This browser isn’t letting the game save, so progress lasts until you close the tab.'),
    );
    (this.root.querySelector('.hero-frame') as HTMLElement).innerHTML = heroArt(!this.app.reducedMotion());
  }

  destroy() {
    clearInterval(this.timer);
    this.root.remove();
  }
}

// ─────────────────────────────────── Route book ───────────────────────────────────

export class BookScreen implements Screen {
  readonly root: HTMLElement;

  constructor(app: AppServices) {
    const prog = bookProgress(app);
    const cards = CHAPTERS.map((c) => {
      const ps = c.ids.map((id) => getPuzzle(id)!);
      const recs = ps.map((p) => app.store.levelRecord(p.id, p.rev));
      const done = recs.filter(Boolean).length;
      const golds = recs.filter((r) => r?.bestMedal === 'gold').length;
      const cover = ps[Math.min(ps.length - 1, 4)];
      const btn = h('button', { class: 'chapter-card', type: 'button', onclick: () => app.go({ screen: 'chapter', chapterId: c.id }) },
        h('span', { class: 'chapter-cover', 'aria-hidden': 'true' }),
        h('span', { class: 'chapter-main' },
          h('span', { class: 'chapter-title' }, c.title),
          h('span', { class: 'chapter-blurb' }, c.blurb),
          h('span', { class: 'chapter-progress' },
            h('span', { class: 'bar', 'aria-hidden': 'true' }, h('i', { style: `width:${(100 * done) / ps.length}%` })),
            `${done} of ${ps.length} delivered · ${golds} gold`)),
      );
      btn.querySelector('.chapter-cover')!.insertAdjacentHTML('afterbegin', miniMapSvg(buildTown(cover), themeFor(cover)));
      return h('li', {}, btn);
    });
    this.root = h('section', { class: 'screen book' },
      topBar('Route book', () => app.go({ screen: 'home' }), 'Back to town'),
      h('div', { class: 'book-body' },
        h('p', { class: 'book-summary' }, `${prog.delivered} of ${prog.total} delivered, ${prog.golds} at gold. Every route is open, in any order.`),
        h('ol', { class: 'chapters' }, ...cards)),
    );
  }

  destroy() { this.root.remove(); }
}

export class ChapterScreen implements Screen {
  readonly root: HTMLElement;

  constructor(private readonly app: AppServices, chapterId: string) {
    const c = getChapter(chapterId)!;
    const ps = c.ids.map((id) => getPuzzle(id)!);
    const story = STORY[c.id];
    const delivered = chapterDelivered(app, c);
    const letters = lettersFor(c.id, delivered).reverse();
    const nextLetter = story?.letters.find((l) => l.at > delivered);
    const next = ps.find((p) => !app.store.levelRecord(p.id, p.rev));
    const groups: [string, string, PuzzleDef[]][] = c.id === 'classic'
      ? (['tutorial', 'approachable', 'intermediate', 'challenging'] as Tier[]).map((t) => [tierName[t], tierBlurb[t], ps.filter((p) => p.tier === t)])
      : [['Gentle', 'A few orders and one rule at a time.', ps.filter((p) => p.tier === 'approachable')],
        ['Steady', 'Busier rounds with rules working together.', ps.filter((p) => p.tier === 'intermediate')],
        ['Tricky', 'The best of the chapter. Take your time.', ps.filter((p) => p.tier === 'challenging')]];
    this.root = h('section', { class: 'screen book' },
      topBar(c.title, () => app.go({ screen: 'book' }), 'Back to the route book'),
      h('div', { class: 'book-body' },
        h('p', { class: 'book-summary' }, c.blurb),
        story ? h('section', { class: 'letters', 'aria-label': 'Letters' },
          h('h2', {}, story.title),
          ...letters.slice(0, 1).map((l) => letterCard(l)),
          letters.length > 1 ? h('details', { class: 'older-letters' }, h('summary', {}, `Earlier letters (${letters.length - 1})`), ...letters.slice(1).map((l) => letterCard(l))) : null,
          nextLetter ? h('p', { class: 'letter-next muted' }, `${letters.length ? 'Next letter' : 'The first letter'} arrives after ${nextLetter.at} ${nextLetter.at === 1 ? 'delivery' : 'deliveries'} in this chapter (${delivered} so far).`)
            : h('p', { class: 'letter-next muted' }, `Chapter finished: ${story.keepsake.label} is now in your village.`)) : null,
        ...groups.filter(([, , list]) => list.length).map(([name, blurb, list], gi) => h('section', { class: 'book-section', 'aria-labelledby': `grp-${gi}` },
          h('h2', { id: `grp-${gi}` }, name),
          h('p', { class: 'muted' }, blurb),
          h('ol', { class: 'tickets' }, ...list.map((p) => h('li', {}, this.ticket(p, p === next)))),
        ))),
    );
  }

  private ticket(p: PuzzleDef, isNext: boolean): HTMLElement {
    const rec = this.app.store.levelRecord(p.id, p.rev);
    const mech = p.mechanics.filter((m) => mechanicIcon[m]);
    const result = rec
      ? h('span', { class: 'ticket-result' }, stampMini(rec.bestMedal), h('span', {}, `Best ${rec.bestMoves} · gold ${p.gold}`), rec.bestCleanMoves !== undefined ? h('span', { class: 'clean', title: 'Delivered without hints' }, 'no hints') : null)
      : h('span', { class: 'ticket-result muted' }, isNext ? 'Up next' : `Gold ${p.gold}`);
    const label = `${puzzleLabel(p)}: ${p.title}. ${rec ? `${medalName[rec.bestMedal]}, best ${rec.bestMoves} moves.` : 'Not delivered yet.'} ${mech.map((m) => mechanicIcon[m].label).join(', ')}`;
    const btn = h('button', { class: `ticket${rec ? ' done' : ''}${isNext ? ' next' : ''}`, type: 'button', 'aria-label': label, onclick: () => this.app.go({ screen: 'play', puzzleId: p.id, mode: 'practice' }) },
      h('span', { class: 'ticket-thumb', 'aria-hidden': 'true' }),
      h('span', { class: 'ticket-main' },
        h('span', { class: 'ticket-title' }, h('span', { class: 'ticket-no', 'aria-hidden': 'true' }, String(p.number)), p.title),
        h('span', { class: 'ticket-brief' }, p.brief)),
      h('span', { class: 'ticket-side' },
        h('span', { class: 'ticket-mech', 'aria-hidden': 'true' }, ...mech.map((m) => h('span', { title: mechanicIcon[m].label }, icon(mechanicIcon[m].svg, 16)))),
        result),
    );
    btn.querySelector('.ticket-thumb')!.insertAdjacentHTML('afterbegin', miniMapSvg(buildTown(p), themeFor(p)));
    return btn;
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
        this.seg('sound', 'Sound effects', s.sound ? 'on' : 'off', [['on', 'On'], ['off', 'Off']], (v) => set({ sound: v === 'on' })),
        this.seg('music', 'Music', s.music ? 'on' : 'off', [['on', 'On'], ['off', 'Off']], (v) => set({ music: v === 'on' })),
        canVibrate || isNative() ? this.seg('haptics', 'Vibration', s.haptics ? 'on' : 'off', [['on', 'On'], ['off', 'Off']], (v) => set({ haptics: v === 'on' })) : null,
        isNative() ? this.reminderControl() : null,
        h('div', { class: 'settings-danger' }, h('h2', {}, 'Saved progress'),
          h('p', { class: 'muted' }, this.app.store.persistent ? 'Progress is saved in this browser only. There are no accounts.' : 'This browser isn’t allowing saves, so progress lasts until you close the tab.'),
          reset),
      ),
    );
  }

  /** Daily reminder: offered only in the installed app, where local notifications exist. */
  private reminderControl(): HTMLElement {
    const s = this.app.store.data.settings;
    const status = h('p', { class: 'muted', 'aria-live': 'polite' });
    const apply = async (on: boolean, hour: number) => {
      const ok = await setDailyReminder(on, hour);
      this.app.store.updateSettings({ reminder: ok, reminderHour: hour });
      status.textContent = on && !ok ? 'Notifications are turned off for this app in your phone’s settings.' : ok ? `Reminder set for ${hour}:00 each day.` : 'No reminders.';
      this.render();
    };
    const hours = h('select', { id: 'reminder-hour', 'aria-label': 'Reminder time', onchange: (e: Event) => void apply(true, Number((e.target as HTMLSelectElement).value)) },
      ...[7, 8, 9, 12, 17, 18, 19, 20].map((hr) => h('option', { value: hr, selected: hr === s.reminderHour }, `${hr}:00`)));
    return h('div', { class: 'reminder' },
      this.seg('reminder', 'Daily reminder', s.reminder ? 'on' : 'off', [['on', 'On'], ['off', 'Off']], (v) => void apply(v === 'on', s.reminderHour)),
      s.reminder ? h('label', { class: 'reminder-time', for: 'reminder-hour' }, 'Remind me at ', hours) : null,
      status);
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
          rule(clockIcon, 'Opening hours', 'A clock sign on a shop shows the move it opens. Arrive earlier and the order waits for you.'),
          rule(gateIcon, 'Garden gates', 'A gate opens once the house on its sign has had its delivery. Deliver there early and use the shortcut.'),
          rule(fragileIcon, 'Cobbles', 'Fragile orders, marked with a glass, can’t be carried over cobbled streets. Take the smooth way round.'),
        ),
        h('h2', {}, 'Controls'),
        h('ul', { class: 'controls-list' },
          h('li', {}, h('b', {}, 'Drag'), ' from the end of your route through the corners you want, or ', h('b', {}, 'tap'), ' the next corner.'),
          h('li', {}, h('b', {}, 'Drag back'), ' along your route to erase. After a pickup or drop-off, stepping back turns the courier round instead — use Undo to remove that step.'),
          h('li', {}, h('b', {}, 'Undo, Redo, Clear'), ' sit under the map. ', h('b', {}, 'Preview'), ' rides the route so far; ', h('b', {}, 'Deliver'), ' appears when the route is complete.'),
          h('li', {}, h('b', {}, 'Keyboard:'), ' arrow keys ride towards a corner (Home, Page Up, End and Page Down for diagonals), Space picks between corners, Enter rides there, Backspace or Ctrl+Z undoes.'),
        ),
        h('h2', {}, 'Stamps'),
        h('p', {}, 'Any complete round earns bronze. Silver is within 15% of the shortest route (at least two moves of slack). Gold is the shortest route there is. Hints are counted on your result.'),
        h('h2', {}, 'Coins and the village shop'),
        h('p', {}, 'Each route pays coins the first time you deliver it: 10 for bronze, 20 for silver, 30 for gold, and the difference if you improve later. Dailies pay 15, 25 or 40, and neighbours’ special deliveries up to 60. Replays don’t pay twice.'),
        h('p', {}, 'Spend coins in the village shop on decorations, Pip’s look, map scenery and new neighbours. The first hint on a route is free; the next objective costs 10 coins and the next step 15. If your route can no longer finish, the way back is always free. Coins can’t be bought with money.'),
      ),
    );
  }

  destroy() { this.root.remove(); }
}
