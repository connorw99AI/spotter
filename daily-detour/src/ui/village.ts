import { utcDateKey } from '../game/daily';
import { EVENTS, PROJECTS, keepsakes, projectState, runStats, type Project } from '../game/meta';
import type { AppServices } from './appTypes';
import { C, flameIcon, heartIcon } from './art';
import { h, icon, setKids } from './dom';
import { seeded } from './geometry';
import { benchArt, flowerBedArt, fountainArt, houseArt, lampArt, randomHouseLook, shedArt, shopArt, treeArt } from './sceneryArt';
import { heartCount, stampMini, topBar, type Screen } from './screens';
import { themeForMonth, type Theme } from './theme';

const at = (x: number, y: number, svg: string, cls = '') => `<g transform="translate(${x} ${y})"${cls ? ` class="${cls}"` : ''}>${svg}</g>`;

/** The courier's home village. Each restored project changes the picture. */
export function villageSvg(t: Theme, restored: ReadonlySet<string>, kept: ReadonlySet<string>, fresh: string | null, animate: boolean): string {
  const on = (id: string) => restored.has(id);
  const pop = (id: string) => (id === fresh ? 'just-restored' : '');
  const rnd = seeded('village');
  const lane = 'M-20 168C70 160 130 128 200 118S290 88 380 76';
  const river = 'M300-20C292 50 326 110 380 140';
  const dry = { ...t, water: '#C9C0AE', waterHi: '#DDD6C6', waterDeep: '#B8AE99' };
  let s = `<rect width="360" height="300" fill="${t.lawn}"/>`;
  // Green with a hedge ring.
  s += `<ellipse cx="160" cy="214" rx="86" ry="44" fill="${t.hedgeDeep}"/><ellipse cx="160" cy="214" rx="80" ry="39" fill="${t.garden[0]}"/>`;
  // River and lane.
  s += `<path d="${river}" fill="none" stroke="${t.bank}" stroke-width="48" stroke-linecap="round"/><path d="${river}" fill="none" stroke="${t.water}" stroke-width="34" stroke-linecap="round"/>`;
  s += `<path d="${lane}" fill="none" stroke="${C.kerb}" stroke-width="26" stroke-linecap="round"/><path d="${lane}" fill="none" stroke="${C.road}" stroke-width="19" stroke-linecap="round"/>`;
  if (!on('lane')) {
    for (let i = 0; i < 16; i++) {
      const x = 10 + i * 20 + rnd() * 10, y = 166 - i * 5.6 + (rnd() - 0.5) * 8;
      s += i % 3 === 0 ? `<ellipse cx="${x}" cy="${y}" rx="7" ry="3" fill="#B9AE98" opacity=".8"/>` : `<path d="M${x} ${y}l3-2 2 3z" fill="${['#C46A3E', '#D9853C', '#9C4A2E'][i % 3]}"/>`;
    }
  } else s += `<g class="${pop('lane')}"><path d="${lane}" fill="none" stroke="#FFFDF6" stroke-opacity=".7" stroke-width="6" transform="translate(-1 -2)"/></g>`;
  // Footbridge.
  s += on('bridge')
    ? `<g class="${pop('bridge')}"><path d="M296 82 344 76" stroke="#7A5A3A" stroke-width="22" stroke-linecap="butt"/><path d="M296 82 344 76" stroke="#E2C79A" stroke-width="16"/><path d="M296 82 344 76" stroke="#C9A877" stroke-width="16" stroke-dasharray="2 6"/></g>`
    : `<path d="M296 82 306 81M332 77 344 76" stroke="#7A5A3A" stroke-width="18"/><path d="M300 81 304 80M336 77 341 76" stroke="#E2C79A" stroke-width="12"/>`;
  // Orchard (bottom left) and allotments (bottom right).
  if (on('orchard')) {
    let o = '';
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) o += at(24 + c * 24 + r * 10, 250 + r * 26, treeArt(t, c % 2, 0.7) + `<circle cx="-3" cy="-6" r="1.6" fill="#C8483A"/><circle cx="4" cy="-3" r="1.6" fill="#C8483A"/>`);
    s += `<g class="${pop('orchard')}">${o}</g>`;
  } else {
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) s += `<path d="M${24 + c * 24 + r * 10} ${252 + r * 26}v-9" stroke="#8C6A45" stroke-width="2" stroke-linecap="round"/>`;
  }
  s += on('allotments')
    ? `<g class="${pop('allotments')}"><rect x="232" y="232" width="100" height="56" rx="6" fill="${t.soil}"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="238" y="${237 + i * 10}" width="88" height="5" rx="2.5" fill="${t.crop}"/>`).join('')}${at(320, 238, shedArt())}</g>`
    : `<rect x="232" y="232" width="100" height="56" rx="6" fill="${t.meadow}" opacity=".9"/>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${242 + i * 15} ${252 + (i % 2) * 18}l3-8 3 8" stroke="${t.hedgeDeep}" stroke-width="2" fill="none"/>`).join('')}`;
  // Houses along the top.
  const looks = [0, 1, 2].map(() => randomHouseLook(rnd, t.lit));
  s += [[40, 74], [92, 66], [144, 74]].map(([x, y], i) => at(x, y, houseArt({ ...looks[i], flowers: on('boxes') }, 1.15), i === 1 ? pop('boxes') : '')).join('');
  // The bakery: boarded up until it reopens.
  s += on('bakery')
    ? at(236, 54, shopArt('bakery', t.lit, 1.15), pop('bakery'))
    : at(236, 54, `${shopArt('bakery', false, 1.15)}<rect x="-19" y="-17" width="38" height="33" fill="#8C7B66" opacity=".55"/><path d="M-16 2 14 10M-16 10 14 2" stroke="#7A5A3A" stroke-width="3.4" stroke-linecap="round"/>`);
  // On the green: fountain, bench, bandstand.
  s += at(150, 212, fountainArt(on('fountain') ? t : dry), pop('fountain'));
  s += on('bench') ? at(104, 224, benchArt(), pop('bench')) : at(104, 226, `<g transform="rotate(16)">${benchArt()}</g><path d="M-6 4l4-3" stroke="#6E5236" stroke-width="2"/>`);
  const roof = on('bandstand') ? '#B85C38' : '#9A928A';
  s += at(206, 214, `<ellipse cx="4" cy="12" rx="22" ry="7" fill="#23352B" opacity=".15"/><ellipse cx="0" cy="8" rx="20" ry="7" fill="#E9DFC9" stroke="#9E8B6A"/>${[-14, -5, 5, 14].map((x) => `<path d="M${x} 8V-8" stroke="${on('bandstand') ? '#FFFAF0' : '#BEB6A8'}" stroke-width="2.2"/>`).join('')}<path d="M-22-8 0-24 22-8Z" fill="${roof}" stroke="#7A5C3E"/>${on('bandstand') ? '<path d="M0-24v-8" stroke="#6E5236"/><path d="M0-32l7 2-7 2z" fill="#E0B04A"/>' : ''}`, pop('bandstand'));
  // Lamps along the lane.
  for (const [x, y] of [[70, 150], [176, 112], [266, 86]]) {
    s += `<g class="${pop('lamps')}"${on('lamps') ? '' : ' opacity=".75"'}>${on('lamps') ? `<circle cx="${x}" cy="${y - 14}" r="24" fill="url(#v-glow)"/>` : ''}${at(x, y, lampArt(on('lamps')))}</g>`;
  }
  // Keepsakes from seasonal events.
  if (kept.has('blossom')) s += at(52, 196, treeArt({ ...t, leaves: [{ dark: '#C77B95', mid: '#E9A5BC', light: '#F7CFDC' }] }, 0, 1.1));
  if (kept.has('harvest')) s += at(196, 262, [0, 1, 2].map((i) => `<ellipse cx="${i * 12}" cy="0" rx="6" ry="5" fill="#E8833A" stroke="#9C4C17"/><path d="M${i * 12} -5v-3" stroke="#5C9A4A" stroke-width="1.6"/>`).join(''));
  if (kept.has('winter')) s += at(124, 168, `<path d="M0-26 12 6H-12Z" fill="#3D5E46"/><path d="M0-26 5 6H-12Z" fill="#54775A"/>${[[-6, -2], [4, -10], [6, 2], [-2, -16]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="1.8" fill="${['#FFD98A', '#E77D9C', '#FFFFFF', '#FFD98A'][i]}"/>`).join('')}<path d="M0-30l2 3h-4z" fill="#E0B04A"/>`);
  if (kept.has('fete')) s += at(306, 196, `<path d="M-14 8V-4L0-14 14-4V8Z" fill="#FFFAF0" stroke="#9B3E5C"/>${[-10, -2, 6].map((x) => `<path d="M${x} -6v14" stroke="#D4688A" stroke-width="4"/>`).join('')}`);
  // Bunting and the fete.
  if (on('bunting')) {
    let flags = '';
    for (let i = 0; i < 14; i++) {
      const x = 22 + i * 20, y = 108 - i * 3.2 + Math.sin((i / 13) * Math.PI) * 14;
      flags += `<path d="M${x - 5} ${y}h10l-5 9z" fill="${['#D4688A', '#E0B04A', '#4FA593', '#FFFAF0'][i % 4]}"/>`;
    }
    s += `<g class="${pop('bunting')}"><path d="M14 112Q160 120 300 64" fill="none" stroke="#7A5C3E" stroke-width="1.2"/>${flags}</g>`;
  }
  if (on('fete')) {
    const tent = (x: number, y: number, c: string) => at(x, y, `<ellipse cx="3" cy="10" rx="18" ry="5" fill="#23352B" opacity=".15"/><path d="M-16 8V-4L0-16 16-4V8Z" fill="#FFFAF0" stroke="#7A5C3E"/>${[-12, -4, 4, 12].map((xx) => `<path d="M${xx} -6v14" stroke="${c}" stroke-width="4"/>`).join('')}<path d="M0-16v-6" stroke="#7A5C3E"/><path d="M0-22l6 2-6 2z" fill="${c}"/>`);
    s += `<g class="${pop('fete')}">${tent(256, 168, '#D4688A')}${tent(290, 150, '#4FA593')}${at(226, 182, flowerBedArt(t, 1, 0.9))}</g>`;
  }
  const defs = `<defs><radialGradient id="v-glow"><stop offset="0" stop-color="#FFE7A8" stop-opacity=".7"/><stop offset="1" stop-color="#FFD98A" stop-opacity="0"/></radialGradient></defs>`;
  return `<svg viewBox="0 0 360 300" class="village-art${animate ? '' : ' still'}" role="img" aria-label="Your village">${defs}${s}${t.tint ? `<rect width="360" height="300" fill="${t.tint}" opacity=".5"/>` : ''}</svg>`;
}

export class VillageScreen implements Screen {
  readonly root: HTMLElement;
  private fresh: string | null = null;
  private note: { project: Project } | null = null;

  constructor(private readonly app: AppServices) {
    this.root = h('section', { class: 'screen village' });
    this.render();
  }

  private render() {
    const store = this.app.store;
    const hearts = heartCount(this.app);
    const restored = new Set(store.data.restored);
    const kept = new Set(keepsakes(Object.keys(store.data.daily)));
    const theme = themeForMonth(new Date().getUTCMonth() + 1);
    const items = PROJECTS.map((p) => {
      const st = projectState(p, hearts, store.data.restored);
      return h('li', { class: `project project-${st}` },
        h('span', { class: 'project-cost', 'aria-label': `${p.cost} hearts` }, icon(heartIcon, 14), String(p.cost)),
        h('span', { class: 'project-main' }, h('span', { class: 'project-title' }, p.title), h('span', { class: 'project-who' }, st === 'restored' ? `Done for ${p.resident}` : `Asked by ${p.resident}`)),
        st === 'ready' ? h('button', { class: 'btn btn-small btn-primary', type: 'button', onclick: () => this.restore(p) }, 'Restore')
          : st === 'restored' ? h('span', { class: 'project-done' }, '✓')
          : h('span', { class: 'project-lock' }, `${p.cost - hearts} to go`),
      );
    });
    const kept2 = EVENTS.filter((e) => kept.has(e.id));
    setKids(this.root,
      topBar('Your village', () => this.app.go({ screen: 'home' }), 'Back to town'),
      h('div', { class: 'village-body' },
        h('div', { class: 'village-frame' }),
        h('div', { class: 'village-hearts' }, icon(heartIcon, 20), h('b', {}, String(hearts)), ' hearts from deliveries. Bronze gives 1, silver 2 and gold 3, counted at your best on each route, plus every daily.'),
        this.note ? h('aside', { class: 'resident-note', 'aria-live': 'polite' },
          h('p', { class: 'note-who' }, this.note.project.resident),
          h('p', {}, `“${this.note.project.note}”`)) : null,
        h('ol', { class: 'projects' }, ...items),
        kept2.length ? h('p', { class: 'muted' }, `Keepsakes: ${kept2.map((e) => e.keepsake).join(', ')}.`) : h('p', { class: 'muted' }, 'Seasonal events add keepsakes here: deliver three event dailies during Blossom Week, the Summer Fete, the Harvest Fair or Winter Lights.'),
      ),
    );
    (this.root.querySelector('.village-frame') as HTMLElement).innerHTML = villageSvg(theme, restored, kept, this.fresh, !this.app.reducedMotion());
  }

  private restore(p: Project) {
    this.app.store.restore(p.id);
    this.fresh = p.id;
    this.note = { project: p };
    this.app.sound.play('complete');
    this.app.haptics([20, 50, 20]);
    this.render();
    (this.root.querySelector('.resident-note') as HTMLElement | null)?.scrollIntoView({ block: 'nearest', behavior: this.app.reducedMotion() ? 'auto' : 'smooth' });
  }

  destroy() { this.root.remove(); }
}

// ─────────────────────────────── stamp calendar ───────────────────────────────

export class StampsScreen implements Screen {
  readonly root: HTMLElement;
  private month: Date;

  constructor(private readonly app: AppServices) {
    const now = new Date();
    this.month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    this.root = h('section', { class: 'screen stamps' });
    this.render();
  }

  private render() {
    const daily = this.app.store.data.daily;
    const today = utcDateKey(new Date());
    const runs = runStats(Object.keys(daily), today);
    const y = this.month.getUTCFullYear(), m = this.month.getUTCMonth();
    const first = new Date(Date.UTC(y, m, 1));
    const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const lead = (first.getUTCDay() + 6) % 7; // Monday first
    const cells: HTMLElement[] = [];
    for (let i = 0; i < lead; i++) cells.push(h('li', { class: 'cal-empty', 'aria-hidden': 'true' }));
    for (let d = 1; d <= days; d++) {
      const key = utcDateKey(new Date(Date.UTC(y, m, d)));
      const r = daily[key];
      const label = `${d} ${first.toLocaleDateString(undefined, { month: 'long', timeZone: 'UTC' })}: ${r ? `${r.medal}, ${r.moves} moves` : key > today ? 'still to come' : 'not played'}`;
      cells.push(h('li', { class: `cal-day${key === today ? ' today' : ''}${r ? ' done' : ''}`, 'aria-label': label },
        h('span', { class: 'cal-num' }, String(d)), r ? stampMini(r.medal, r.medal[0].toUpperCase()) : null));
    }
    const earliest = Object.keys(daily).sort()[0] ?? today;
    const canBack = `${y}-${String(m + 1).padStart(2, '0')}` > earliest.slice(0, 7);
    const canFwd = `${y}-${String(m + 1).padStart(2, '0')}` < today.slice(0, 7);
    setKids(this.root,
      topBar('Stamps', () => this.app.go({ screen: 'home' }), 'Back to town'),
      h('div', { class: 'stamps-body' },
        h('dl', { class: 'run-stats' },
          h('div', {}, h('dt', {}, 'Current run'), h('dd', {}, icon(flameIcon, 18), `${runs.current} ${runs.current === 1 ? 'day' : 'days'}`)),
          h('div', {}, h('dt', {}, 'Longest run'), h('dd', {}, `${runs.longest}`)),
          h('div', {}, h('dt', {}, 'Dailies delivered'), h('dd', {}, `${runs.total}`))),
        h('p', { class: 'muted' }, 'Missing a single day counts as a rest day and keeps your run going. Two missed days in a row start a fresh one; your stamps stay.'),
        h('div', { class: 'cal-head' },
          h('button', { class: 'btn-icon', type: 'button', 'aria-label': 'Previous month', disabled: !canBack, onclick: () => { this.month = new Date(Date.UTC(y, m - 1, 1)); this.render(); } }, '‹'),
          h('h2', {}, first.toLocaleDateString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' })),
          h('button', { class: 'btn-icon', type: 'button', 'aria-label': 'Next month', disabled: !canFwd, onclick: () => { this.month = new Date(Date.UTC(y, m + 1, 1)); this.render(); } }, '›')),
        h('ol', { class: 'cal-week', 'aria-hidden': 'true' }, ...['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => h('li', {}, d))),
        h('ol', { class: 'cal' }, ...cells),
      ),
    );
  }

  destroy() { this.root.remove(); }
}
