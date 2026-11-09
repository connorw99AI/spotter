import { describe, expect, it } from 'vitest';
import { BOOK_IDS, getPuzzle } from '../src/data/catalog';
import { NEIGHBOURS, REQUEST_IDS } from '../src/data/neighbours';
import { COINS, DECOR, ITEMS, NEIGHBOUR_ITEMS, coinsEarned } from '../src/game/shop';
import { SaveStore, parseSave, type KeyValueStore } from '../src/game/storage';
import { validatePuzzle } from '../src/core/validate';
import { solvePuzzle } from '../src/core/solver';
import { buildTown } from '../src/core/town';
import { DECOR_SLOTS } from '../src/game/shop';
import { SLOTS, PLOTS } from '../src/ui/villageArt';

class MemoryStore implements KeyValueStore {
  map = new Map<string, string>();
  getItem(k: string) { return this.map.get(k) ?? null; }
  setItem(k: string, v: string) { this.map.set(k, v); }
  removeItem(k: string) { this.map.delete(k); }
}
const bookRevs = new Map(BOOK_IDS.map((id) => [id, getPuzzle(id)!.rev]));
const reqRevs = new Map(REQUEST_IDS.map((id) => [id, getPuzzle(id)!.rev]));

describe('coins', () => {
  it('start with a purse and grow with each route at its best, never with replays', () => {
    const s = new SaveStore(new MemoryStore());
    const earned = () => coinsEarned(s.data.levels, bookRevs, reqRevs, s.data.daily);
    expect(earned()).toBe(COINS.starter);
    const first = BOOK_IDS[0];
    s.recordCompletion(first, getPuzzle(first)!.rev, 20, 'bronze', 0);
    expect(earned()).toBe(COINS.starter + COINS.book.bronze);
    s.recordCompletion(first, getPuzzle(first)!.rev, 20, 'bronze', 0);
    expect(earned()).toBe(COINS.starter + COINS.book.bronze);
    s.recordCompletion(first, getPuzzle(first)!.rev, 6, 'gold', 0);
    expect(earned()).toBe(COINS.starter + COINS.book.gold);
    s.recordCompletion('req-mabel-1', getPuzzle('req-mabel-1')!.rev, 14, 'gold', 0);
    s.recordDaily('2026-11-09', { puzzleId: 'daily-001', rev: 1, moves: 9, medal: 'silver', hints: 0 });
    expect(earned()).toBe(COINS.starter + COINS.book.gold + COINS.request.gold + COINS.daily.silver);
  });

  it('buys each item once, places decorations one spot at a time, and survives a reload', () => {
    const mem = new MemoryStore();
    const s = new SaveStore(mem);
    expect(s.buy('pond', 120)).toBe(true);
    expect(s.buy('pond', 120)).toBe(false);
    s.spend(15);
    s.place('s1', 'pond');
    s.place('s3', 'pond');
    s.setWear('bike', 'bike-sky');
    s.setLook('look-winter');
    const b = new SaveStore(mem);
    expect(b.data.coinsSpent).toBe(135);
    expect(b.data.owned).toEqual(['pond']);
    expect(b.data.placed).toEqual({ s3: 'pond' });
    expect(b.data.wear).toEqual({ bike: 'bike-sky' });
    expect(b.data.look).toBe('look-winter');
  });

  it('ignores junk in saved shop data', () => {
    const d = parseSave(JSON.stringify({ version: 1, coinsSpent: -5, owned: ['pond', 7, '<x>', 'pond'], placed: { s1: 'pond', evil: 'x', s2: 3 }, wear: { bike: 'bike-sky', hat: 'x' }, look: 'javascript:' }));
    expect(d.coinsSpent).toBe(0);
    expect(d.owned).toEqual(['pond']);
    expect(d.placed).toEqual({ s1: 'pond' });
    expect(d.wear).toEqual({ bike: 'bike-sky' });
    expect(d.look).toBe('look-seasonal');
  });
});

describe('the shop catalogue', () => {
  it('has unique ids, a spot for every slot, and a plot for every neighbour', () => {
    const ids = ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(Object.keys(SLOTS).sort()).toEqual([...DECOR_SLOTS].sort());
    for (const nb of NEIGHBOURS) expect(PLOTS[nb.id], nb.id).toBeDefined();
    expect(NEIGHBOUR_ITEMS.length).toBe(NEIGHBOURS.length);
    expect(DECOR.length).toBeGreaterThan(DECOR_SLOTS.length);
  });

  it('gives every neighbour three valid, solvable requests with gold at the solver optimum', () => {
    expect(REQUEST_IDS.length).toBe(NEIGHBOURS.length * 3);
    for (const id of REQUEST_IDS) {
      const p = getPuzzle(id);
      expect(p, id).toBeDefined();
      expect(validatePuzzle(p!), id).toEqual([]);
      expect(solvePuzzle(buildTown(p!))?.moves, id).toBe(p!.gold);
    }
  });
});
