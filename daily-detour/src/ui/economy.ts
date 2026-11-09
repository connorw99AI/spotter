import { BOOK_IDS, getPuzzle } from '../data/catalog';
import { REQUEST_IDS } from '../data/neighbours';
import { coinsEarned, DEFAULT_WEAR, itemById, STARTER_ITEMS, WEAR, type ShopItem, type Wear } from '../game/shop';
import type { AppServices } from './appTypes';
import { coinIcon } from './art';
import { h, icon } from './dom';
import { DEFAULT_PIP, setPipStyle, type Crate, type PipStyle } from './pipStyle';
import { THEMES, type Theme } from './theme';

let bookRevs: Map<string, number> | null = null;
let requestRevs: Map<string, number> | null = null;
const revs = () => {
  bookRevs ??= new Map(BOOK_IDS.map((id) => [id, getPuzzle(id)!.rev]));
  requestRevs ??= new Map(REQUEST_IDS.map((id) => [id, getPuzzle(id)!.rev]));
  return { bookRevs, requestRevs };
};

/** Coins earned from every delivery so far, at each route's best. */
export function coinsEarnedBy(app: AppServices): number {
  const r = revs();
  return coinsEarned(app.store.data.levels, r.bookRevs, r.requestRevs, app.store.data.daily);
}

export function coinBalance(app: AppServices): number {
  return Math.max(0, coinsEarnedBy(app) - app.store.data.coinsSpent);
}

export function owns(app: AppServices, id: string): boolean {
  return STARTER_ITEMS.includes(id) || app.store.data.owned.includes(id);
}

/** Spend coins if there are enough. */
export function spendCoins(app: AppServices, n: number): boolean {
  if (n <= 0) return true;
  if (coinBalance(app) < n) return false;
  app.store.spend(n);
  return true;
}

/** Buy an item if it isn't owned and there are coins enough. */
export function buyItem(app: AppServices, item: ShopItem): boolean {
  if (owns(app, item.id) || coinBalance(app) < item.price) return false;
  return app.store.buy(item.id, item.price);
}

export function wearing(app: AppServices, part: Wear): string {
  const id = app.store.data.wear[part];
  return id && owns(app, id) ? id : DEFAULT_WEAR[part];
}

/** Pip's style from a set of worn item ids (used for previews as well). */
export function styleFor(worn: Record<Wear, string>): PipStyle {
  const colour = (id: string, fallback: string) => WEAR.find((w) => w.id === id)?.colour ?? fallback;
  return {
    frame: colour(worn.bike, DEFAULT_PIP.frame),
    helmet: colour(worn.helmet, DEFAULT_PIP.helmet),
    scarf: colour(worn.scarf, DEFAULT_PIP.scarf),
    jacket: colour(worn.jacket, DEFAULT_PIP.jacket),
    crate: (worn.crate.replace('crate-', '') as Crate) || 'plain',
    dots: worn.helmet === 'helmet-dots',
  };
}

export function wornNow(app: AppServices): Record<Wear, string> {
  return { bike: wearing(app, 'bike'), helmet: wearing(app, 'helmet'), scarf: wearing(app, 'scarf'), jacket: wearing(app, 'jacket'), crate: wearing(app, 'crate') };
}

/** Dress Pip as saved. Call at start-up and after a change. */
export function applyPipStyle(app: AppServices) {
  setPipStyle(styleFor(wornNow(app)));
}

/** The map look chosen in the shop, if it isn't "as the book says". */
export function lookTheme(app: AppServices): Theme | null {
  const id = app.store.data.look;
  if (!id || id === 'look-seasonal' || !owns(app, id) || !itemById(id)) return null;
  const name = id.replace('look-', '') as Theme['name'];
  return THEMES[name] ?? null;
}

/** The coin balance as a small pill. */
export function coinPill(n: number): HTMLElement {
  return h('span', { class: 'coin-pill', 'aria-label': `${n} coins` }, icon(coinIcon, 16), h('b', {}, String(n)));
}
