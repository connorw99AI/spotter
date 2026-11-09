import { utcDateKey } from '../game/daily';
import { EVENTS, PROJECTS, keepsakes, projectState, runStats, type Project } from '../game/meta';
import type { AppServices } from './appTypes';
import { coinIcon, courierSvg, flameIcon, heartIcon } from './art';
import { h, icon, setKids } from './dom';
import { villageArt } from './villageArt';
import { decorPreview, lookPreview } from './decorArt';
import { applyPipStyle, buyItem, coinBalance, coinPill, owns, styleFor, wornNow } from './economy';
import { DECOR, HINT_COST, LOOKS, WEAR, itemById, type ShopItem, type Wear } from '../game/shop';
import { NEIGHBOURS, requestId } from '../data/neighbours';
import { getPuzzle } from '../data/catalog';
import { chapterProgressAll, heartCount, letterCard, stampMini, topBar, type Screen } from './screens';
import { STORY, chapterKeepsakes } from '../game/story';
import { portraitSvg } from './portraits';
import { THEMES, themeForMonth, type Theme } from './theme';

export type VillageTab = 'village' | 'shop' | 'neighbours';

export class VillageScreen implements Screen {
  readonly root: HTMLElement;
  private fresh: string | null = null;
  private noteEl: HTMLElement = h('div', { class: 'village-note', 'aria-live': 'polite' });
  /** A decoration waiting for a spot, while placing. */
  private placing: string | null = null;
  /** Pip's outfit as previewed in the shop (try before you buy). */
  private trying: Partial<Record<Wear, string>> = {};
  private confirmTimer = 0;

  constructor(private readonly app: AppServices, private tab: VillageTab = 'village') {
    this.root = h('section', { class: 'screen village' });
    this.root.addEventListener('click', (e) => this.onTap(e.target));
    this.root.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && (e.target as Element).closest?.('.villager, .v-slot, .v-plot')) { e.preventDefault(); this.onTap(e.target); }
    });
    this.render();
  }

  private onTap(target: EventTarget | null) {
    const el = target as Element | null;
    const slot = el?.closest?.('.v-slot') as SVGGElement | null;
    if (slot && this.placing) { this.placeAt(slot.dataset.slot!); return; }
    const plot = el?.closest?.('.v-plot') as SVGGElement | null;
    if (plot) { this.switchTab('neighbours', plot.dataset.neighbour); return; }
    const g = el?.closest?.('.villager') as SVGGElement | null;
    if (!g) return;
    if (g.dataset.neighbour) { this.switchTab('neighbours', g.dataset.neighbour); return; }
    const p = PROJECTS.find((x) => x.id === g.dataset.project);
    if (!p || !this.app.store.data.restored.includes(p.id)) return;
    this.noteEl.replaceChildren(letterCard({ at: 0, from: p.resident, text: p.note }, false));
    g.classList.remove('talking');
    void g.getBoundingClientRect();
    g.classList.add('talking');
    this.app.sound.play('tap');
  }

  private switchTab(tab: VillageTab, focus?: string) {
    this.tab = tab;
    this.placing = null;
    this.render();
    const target = focus ? this.root.querySelector(`[data-card="${focus}"]`) : this.root.querySelector('.village-tabs');
    (target as HTMLElement | null)?.scrollIntoView({ block: 'start', behavior: this.app.reducedMotion() ? 'auto' : 'smooth' });
  }

  private render() {
    const store = this.app.store;
    const hearts = heartCount(this.app);
    const coins = coinBalance(this.app);
    const restored = new Set(store.data.restored);
    const kept = new Set([...keepsakes(Object.keys(store.data.daily)), ...chapterKeepsakes(chapterProgressAll(this.app))]);
    const theme = themeForMonth(new Date().getUTCMonth() + 1);
    const states = PROJECTS.map((p) => ({ p, st: projectState(p, hearts, store.data.restored) }));
    const ready = states.filter((x) => x.st === 'ready');
    const saving = states.find((x) => x.st === 'locked');
    // Signposts: the next few projects there are hearts for, or else the one being saved up for.
    const signs = this.placing ? [] : ready.length
      ? ready.slice(0, 3).map((x) => ({ id: x.p.id, cost: x.p.cost, ready: true }))
      : saving ? [{ id: saving.p.id, cost: saving.p.cost, ready: false }] : [];
    const neighbours = new Set(NEIGHBOURS.filter((nb) => owns(this.app, `nb-${nb.id}`)).map((nb) => nb.id));

    const top = topBar('Your village', () => this.app.go({ screen: 'home' }), 'Back to town');
    top.querySelector('.page-top-spacer')!.replaceWith(coinPill(coins));
    const frame = h('div', { class: `village-frame${this.placing ? ' placing' : ''}` }, top);
    if (this.placing) {
      const item = itemById(this.placing)!;
      frame.append(h('div', { class: 'place-bar', role: 'status' },
        h('span', {}, `Tap a spot for the ${item.name.toLowerCase()}`),
        h('button', { class: 'btn btn-small btn-quiet', type: 'button', onclick: () => { this.placing = null; this.render(); } }, 'Done')));
    }
    const tabs = h('div', { class: 'village-tabs', role: 'tablist', 'aria-label': 'Village' },
      ...([['village', 'Village'], ['shop', 'Shop'], ['neighbours', 'Neighbours']] as [VillageTab, string][]).map(([id, label]) =>
        h('button', { class: `village-tab${this.tab === id ? ' on' : ''}`, type: 'button', role: 'tab', 'aria-selected': String(this.tab === id), onclick: () => this.switchTab(id) }, label)));

    const body = this.tab === 'shop' ? this.shopBody(theme) : this.tab === 'neighbours' ? this.neighboursBody() : this.projectsBody(hearts, states, ready.length, kept);
    setKids(this.root, frame, h('div', { class: 'village-body' }, tabs, ...body));
    frame.insertAdjacentHTML('beforeend', villageArt({
      theme, restored, kept, fresh: this.fresh, signs, animate: !this.app.reducedMotion(),
      placed: store.data.placed, placing: !!this.placing, neighbours,
    }));
    this.root.querySelectorAll<HTMLElement>('[data-who]').forEach((el) => { el.innerHTML = portraitSvg(el.dataset.who!, Number(el.dataset.size ?? 34)); });
    this.fresh = null;
  }

  // ─────────────────────────────── projects ───────────────────────────────

  private projectsBody(hearts: number, states: { p: Project; st: string }[], readyCount: number, kept: Set<string>): (HTMLElement | null)[] {
    const items = states.map(({ p, st }) => h('li', { class: `project project-${st}` },
      h('span', { class: 'project-cost', 'aria-label': `${p.cost} hearts` }, icon(heartIcon, 14), String(p.cost)),
      h('span', { class: 'project-face', 'aria-hidden': 'true', 'data-who': p.resident }),
      h('span', { class: 'project-main' }, h('span', { class: 'project-title' }, p.title), h('span', { class: 'project-who' }, st === 'restored' ? `Done for ${p.resident}` : `Asked by ${p.resident}`)),
      st === 'ready' ? h('button', { class: 'btn btn-small btn-primary', type: 'button', onclick: () => this.restore(p) }, 'Restore')
        : st === 'restored' ? h('span', { class: 'project-done' }, '✓')
        : h('span', { class: 'project-lock' }, `${p.cost - hearts} to go`),
    ));
    const kept2 = [...EVENTS.filter((e) => kept.has(e.id)).map((e) => e.keepsake), ...Object.values(STORY).filter((st) => kept.has(st.keepsake.id)).map((st) => st.keepsake.label)];
    const back = this.app.store.data.restored.length;
    return [
      h('div', { class: 'village-hearts' }, icon(heartIcon, 20), h('b', {}, String(hearts)),
        readyCount ? ` hearts. ${readyCount === 1 ? 'A project is' : `${readyCount} projects are`} ready: tap Restore below and watch the village.` : ' hearts from deliveries. Bronze gives 1, silver 2 and gold 3, counted at your best on each route, plus every daily.'),
      back ? h('p', { class: 'village-count' }, `${back} of ${PROJECTS.length} projects done. Tap a neighbour to hear from them.`) : null,
      this.noteEl,
      h('ol', { class: 'projects' }, ...items),
      kept2.length ? h('p', { class: 'muted' }, `Keepsakes: ${kept2.join(', ')}.`) : h('p', { class: 'muted' }, 'Seasonal events add keepsakes here: deliver three event dailies during Blossom Week, the Summer Fete, the Harvest Fair or Winter Lights.'),
    ];
  }

  private restore(p: Project) {
    this.app.store.restore(p.id);
    this.fresh = p.id;
    this.noteEl.replaceChildren(letterCard({ at: 0, from: p.resident, text: p.note }, true));
    this.app.sound.play('complete');
    this.app.haptics([20, 50, 20]);
    this.render();
    this.toTop();
  }

  private toTop() {
    window.scrollTo({ top: 0, behavior: this.app.reducedMotion() ? 'auto' : 'smooth' });
  }

  // ─────────────────────────────── shop ───────────────────────────────

  /** A price button that asks once before spending: tap, then tap again to confirm. */
  private buyButton(item: ShopItem, after: () => void): HTMLElement {
    const coins = coinBalance(this.app);
    const short = item.price - coins;
    const btn = h('button', { class: 'btn btn-small btn-buy', type: 'button', disabled: short > 0, 'aria-label': `Buy ${item.name} for ${item.price} coins` },
      icon(coinIcon, 14), String(item.price)) as HTMLButtonElement;
    if (short > 0) btn.title = `${short} more coins needed`;
    btn.onclick = () => {
      if (btn.dataset.armed !== '1') {
        btn.dataset.armed = '1';
        btn.classList.add('armed');
        btn.replaceChildren(`Buy for ${item.price}?`);
        clearTimeout(this.confirmTimer);
        this.confirmTimer = window.setTimeout(() => { if (btn.isConnected) { btn.dataset.armed = ''; btn.classList.remove('armed'); btn.replaceChildren(icon(coinIcon, 14), String(item.price)); } }, 3500);
        return;
      }
      clearTimeout(this.confirmTimer);
      if (!buyItem(this.app, item)) return;
      this.app.sound.play('coin');
      this.app.haptics([10, 30, 10]);
      after();
    };
    return btn;
  }

  private shopBody(theme: Theme): HTMLElement[] {
    const coins = coinBalance(this.app);
    const placedAt = new Map(Object.entries(this.app.store.data.placed).map(([slot, id]) => [id, slot]));
    const decor = DECOR.map((d) => {
      const has = owns(this.app, d.id);
      const card = h('li', { class: `shop-card${has ? ' owned' : ''}` },
        h('span', { class: 'shop-art', 'aria-hidden': 'true' }),
        h('span', { class: 'shop-name' }, d.name),
        d.blurb ? h('span', { class: 'shop-blurb' }, d.blurb) : null,
        !has ? this.buyButton(d, () => { this.placing = d.id; this.render(); this.toTop(); })
          : placedAt.has(d.id)
            ? h('span', { class: 'shop-actions' },
              h('button', { class: 'btn btn-small btn-quiet', type: 'button', onclick: () => { this.placing = d.id; this.render(); this.toTop(); } }, 'Move'),
              h('button', { class: 'btn btn-small btn-quiet', type: 'button', onclick: () => { this.app.store.place(placedAt.get(d.id)!, null); this.render(); } }, 'Put away'))
            : h('button', { class: 'btn btn-small btn-primary', type: 'button', onclick: () => { this.placing = d.id; this.render(); this.toTop(); } }, 'Place'),
      );
      card.querySelector('.shop-art')!.innerHTML = decorPreview(d.id, theme, 72);
      return card;
    });

    // Pip's look: tap an outfit to try it on; buy it to keep it.
    const worn = wornNow(this.app);
    const preview = { ...worn, ...this.trying } as Record<Wear, string>;
    const pip = h('div', { class: 'pip-preview', 'aria-hidden': 'true' });
    pip.innerHTML = `<svg viewBox="-48 -44 96 66" width="190" height="130">${courierSvg(styleFor(preview))}</svg>`;
    const parts: [Wear, string][] = [['bike', 'Bike'], ['helmet', 'Helmet'], ['scarf', 'Scarf'], ['jacket', 'Jacket'], ['crate', 'Crate']];
    const trying = Object.entries(this.trying).filter(([part, id]) => id !== worn[part as Wear]);
    const wardrobe = parts.map(([part, label]) => h('div', { class: 'wear-row' },
      h('span', { class: 'wear-label' }, label),
      h('div', { class: 'wear-options' }, ...WEAR.filter((w) => w.kind === part).map((w) => {
        const has = owns(this.app, w.id);
        const on = preview[part] === w.id;
        return h('button', {
          class: `wear-chip${on ? ' on' : ''}${has ? ' owned' : ''}`, type: 'button', 'aria-pressed': String(on),
          'aria-label': `${w.name}${has ? (worn[part] === w.id ? ', wearing' : '') : `, ${w.price} coins`}`,
          onclick: () => {
            if (has) { this.app.store.setWear(part, w.id); delete this.trying[part]; applyPipStyle(this.app); }
            else this.trying[part] = w.id;
            this.app.sound.play('tap');
            this.render();
          },
        }, w.colour ? h('i', { class: 'swatch', style: `background:${w.colour}` }) : h('i', { class: `swatch crate-${w.id.replace('crate-', '')}` }),
        h('span', {}, w.name), has ? null : h('b', {}, icon(coinIcon, 12), String(w.price)));
      }))));
    const tryingItems = trying.map(([, id]) => itemById(id)!).filter(Boolean);
    const tryBar = tryingItems.length
      ? h('div', { class: 'try-bar' },
        h('span', {}, `Trying on: ${tryingItems.map((i) => i.name.toLowerCase()).join(', ')}`),
        ...tryingItems.map((it) => this.buyButton(it, () => { this.app.store.setWear(it.kind, it.id); delete this.trying[it.kind as Wear]; applyPipStyle(this.app); this.render(); })),
        h('button', { class: 'btn btn-small btn-quiet', type: 'button', onclick: () => { this.trying = {}; this.render(); } }, 'Take off'))
      : null;

    const looks = LOOKS.map((l) => {
      const has = owns(this.app, l.id);
      const using = this.app.store.data.look === l.id;
      const card = h('li', { class: `shop-card look${has ? ' owned' : ''}${using ? ' using' : ''}` },
        h('span', { class: 'shop-art', 'aria-hidden': 'true' }),
        h('span', { class: 'shop-name' }, l.name),
        l.blurb ? h('span', { class: 'shop-blurb' }, l.blurb) : null,
        !has ? this.buyButton(l, () => { this.app.store.setLook(l.id); this.render(); })
          : using ? h('span', { class: 'shop-using' }, 'In use')
            : h('button', { class: 'btn btn-small btn-primary', type: 'button', onclick: () => { this.app.store.setLook(l.id); this.app.sound.play('tap'); this.render(); } }, 'Use'));
      const name = l.id === 'look-seasonal' ? 'summer' : l.id.replace('look-', '') as Theme['name'];
      card.querySelector('.shop-art')!.innerHTML = lookPreview(THEMES[name]);
      return card;
    });

    return [
      h('div', { class: 'shop-head' }, h('p', {}, coinPill(coins), ' Coins come from deliveries: 10, 20 or 30 for bronze, silver or gold on each route (counted at your best), more for dailies and neighbours’ requests.')),
      h('section', { class: 'shop-section' }, h('h2', {}, 'Decorate the village'), h('p', { class: 'muted' }, `Seven spots to fill, and you choose what goes where. Buy something and tap a spot to place it.`), h('ul', { class: 'shop-grid' }, ...decor)),
      h('section', { class: 'shop-section', 'data-card': 'pip' }, h('h2', {}, 'Pip’s look'), h('p', { class: 'muted' }, 'Tap anything to try it on. Pip wears it on every round.'), pip, tryBar, ...wardrobe),
      h('section', { class: 'shop-section' }, h('h2', {}, 'Map looks'), h('p', { class: 'muted' }, 'Play every route in the scenery you like best. Dailies keep their seasonal events.'), h('ul', { class: 'shop-grid looks' }, ...looks)),
      h('section', { class: 'shop-section hints-info' }, h('h2', {}, 'Hints'),
        h('p', {}, `The first nudge on any route is free. After that, the next objective costs ${HINT_COST[2]} coins and the next step ${HINT_COST[3]}. If your route can no longer finish, the way back is always free.`)),
    ];
  }

  private placeAt(slot: string) {
    const id = this.placing;
    if (!id) return;
    this.app.store.place(slot, id);
    this.placing = null;
    this.fresh = `slot:${slot}`;
    this.app.sound.play('stamp');
    this.app.haptics(12);
    this.render();
  }

  // ─────────────────────────────── neighbours ───────────────────────────────

  private neighboursBody(): HTMLElement[] {
    const cards = NEIGHBOURS.map((nb) => {
      const item = itemById(`nb-${nb.id}`)!;
      const here = owns(this.app, item.id);
      const recs = [1, 2, 3].map((n) => this.app.store.levelRecord(requestId(nb.id, n), getPuzzle(requestId(nb.id, n))!.rev));
      const done = recs.filter(Boolean).length;
      const latest = done ? nb.thanks[done - 1] : nb.moveIn;
      const card = h('article', { class: `neighbour${here ? ' here' : ''}`, 'data-card': nb.id },
        h('header', { class: 'neighbour-head' },
          h('span', { class: 'neighbour-face', 'aria-hidden': 'true', 'data-who': nb.name, 'data-size': '52' }),
          h('div', {}, h('h2', {}, nb.name), h('p', { class: 'muted' }, `The ${nb.trade}${here ? ` · ${done} of 3 requests delivered` : ''}`)),
          here ? null : this.buyButton(item, () => {
            this.fresh = `nb:${nb.id}`;
            this.render();
            this.toTop();
          })),
        here ? letterCard({ at: 0, from: nb.name, text: latest }, false) : h('p', { class: 'neighbour-pitch' }, `Build a cottage on Meadow Lane and ${nb.name.split(' ')[0]} moves in, with three special deliveries of their own (new routes, up to 60 coins each).`),
        here ? h('ol', { class: 'requests' }, ...[1, 2, 3].map((n) => {
          const id = requestId(nb.id, n);
          const p = getPuzzle(id)!;
          const rec = recs[n - 1];
          const open = n === 1 || !!recs[n - 2];
          return h('li', { class: `request${rec ? ' done' : ''}${open ? '' : ' locked'}` },
            h('div', { class: 'request-main' }, h('span', { class: 'request-title' }, p.title), h('span', { class: 'request-ask' }, `“${nb.asks[n - 1]}”`)),
            rec ? stampMini(rec.bestMedal) : null,
            open
              ? h('button', { class: `btn btn-small ${rec ? 'btn-quiet' : 'btn-primary'}`, type: 'button', onclick: () => this.app.go({ screen: 'play', puzzleId: id, mode: 'practice' }) }, rec ? 'Again' : 'Deliver')
              : h('span', { class: 'project-lock' }, 'After the last one'));
        })) : null,
      );
      return card;
    });
    return [h('p', { class: 'muted neighbours-intro' }, 'New neighbours move into Meadow Lane when you build them a cottage. Each brings three special deliveries you won’t find in the route book.'), ...cards];
  }

  destroy() {
    clearTimeout(this.confirmTimer);
    this.root.remove();
  }
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
