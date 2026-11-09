import { utcDateKey } from '../game/daily';
import { EVENTS, PROJECTS, keepsakes, projectState, runStats, type Project } from '../game/meta';
import type { AppServices } from './appTypes';
import { flameIcon, heartIcon } from './art';
import { h, icon, setKids } from './dom';
import { villageArt } from './villageArt';
import { chapterProgressAll, heartCount, letterCard, stampMini, topBar, type Screen } from './screens';
import { STORY, chapterKeepsakes } from '../game/story';
import { portraitSvg } from './portraits';
import { themeForMonth } from './theme';

export class VillageScreen implements Screen {
  readonly root: HTMLElement;
  private fresh: string | null = null;
  private noteEl: HTMLElement = h('div', { class: 'village-note', 'aria-live': 'polite' });

  constructor(private readonly app: AppServices) {
    this.root = h('section', { class: 'screen village' });
    // Tap a resident to hear from them again.
    this.root.addEventListener('click', (e) => this.onVillager(e.target));
    this.root.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && (e.target as Element).closest?.('.villager')) { e.preventDefault(); this.onVillager(e.target); }
    });
    this.render();
  }

  private onVillager(target: EventTarget | null) {
    const g = (target as Element | null)?.closest?.('.villager') as SVGGElement | null;
    const p = g && PROJECTS.find((x) => x.id === g.dataset.project);
    if (!g || !p || !this.app.store.data.restored.includes(p.id)) return;
    this.showNote(p, false);
    g.classList.remove('talking');
    void g.getBoundingClientRect();
    g.classList.add('talking');
    this.app.sound.play('tap');
  }

  private showNote(p: Project, fresh: boolean) {
    this.noteEl.replaceChildren(letterCard({ at: 0, from: p.resident, text: p.note }, fresh));
  }

  private render() {
    const store = this.app.store;
    const hearts = heartCount(this.app);
    const restored = new Set(store.data.restored);
    const kept = new Set([...keepsakes(Object.keys(store.data.daily)), ...chapterKeepsakes(chapterProgressAll(this.app))]);
    const theme = themeForMonth(new Date().getUTCMonth() + 1);
    const states = PROJECTS.map((p) => ({ p, st: projectState(p, hearts, store.data.restored) }));
    const ready = states.filter((x) => x.st === 'ready');
    const saving = states.find((x) => x.st === 'locked');
    // Signposts: the next few projects there are hearts for, or else the one being saved up for.
    const signs = ready.length
      ? ready.slice(0, 3).map((x) => ({ id: x.p.id, cost: x.p.cost, ready: true }))
      : saving ? [{ id: saving.p.id, cost: saving.p.cost, ready: false }] : [];
    const items = states.map(({ p, st }) => h('li', { class: `project project-${st}` },
      h('span', { class: 'project-cost', 'aria-label': `${p.cost} hearts` }, icon(heartIcon, 14), String(p.cost)),
      h('span', { class: 'project-face', 'aria-hidden': 'true', 'data-who': p.resident }),
      h('span', { class: 'project-main' }, h('span', { class: 'project-title' }, p.title), h('span', { class: 'project-who' }, st === 'restored' ? `Done for ${p.resident}` : `Asked by ${p.resident}`)),
      st === 'ready' ? h('button', { class: 'btn btn-small btn-primary', type: 'button', onclick: () => this.restore(p) }, 'Restore')
        : st === 'restored' ? h('span', { class: 'project-done' }, '✓')
        : h('span', { class: 'project-lock' }, `${p.cost - hearts} to go`),
    ));
    const kept2 = [...EVENTS.filter((e) => kept.has(e.id)).map((e) => e.keepsake), ...Object.values(STORY).filter((st) => kept.has(st.keepsake.id)).map((st) => st.keepsake.label)];
    const back = restored.size;
    const frame = h('div', { class: 'village-frame' }, topBar('Your village', () => this.app.go({ screen: 'home' }), 'Back to town'));
    setKids(this.root,
      frame,
      h('div', { class: 'village-body' },
        h('div', { class: 'village-hearts' }, icon(heartIcon, 20), h('b', {}, String(hearts)),
          ready.length ? ` hearts. ${ready.length === 1 ? 'A project is' : `${ready.length} projects are`} ready: tap Restore below and watch the village.` : ' hearts from deliveries. Bronze gives 1, silver 2 and gold 3, counted at your best on each route, plus every daily.'),
        back ? h('p', { class: 'village-count' }, `${back} of ${PROJECTS.length} projects done. Tap a neighbour to hear from them.`) : null,
        this.noteEl,
        h('ol', { class: 'projects' }, ...items),
        kept2.length ? h('p', { class: 'muted' }, `Keepsakes: ${kept2.join(', ')}.`) : h('p', { class: 'muted' }, 'Seasonal events add keepsakes here: deliver three event dailies during Blossom Week, the Summer Fete, the Harvest Fair or Winter Lights.'),
      ),
    );
    frame.insertAdjacentHTML('beforeend', villageArt({ theme, restored, kept, fresh: this.fresh, signs, animate: !this.app.reducedMotion() }));
    this.root.querySelectorAll<HTMLElement>('.project-face').forEach((el) => { el.innerHTML = portraitSvg(el.dataset.who!, 34); });
  }

  private restore(p: Project) {
    this.app.store.restore(p.id);
    this.fresh = p.id;
    this.showNote(p, true);
    this.app.sound.play('complete');
    this.app.haptics([20, 50, 20]);
    this.render();
    // Bring the village into view so the change and the new arrival are seen.
    window.scrollTo({ top: 0, behavior: this.app.reducedMotion() ? 'auto' : 'smooth' });
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
