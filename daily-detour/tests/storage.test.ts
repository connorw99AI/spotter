import { describe, expect, it } from 'vitest';
import { SAVE_KEY, SaveStore, parseSave, type KeyValueStore } from '../src/game/storage';

class MemoryStore implements KeyValueStore {
  map = new Map<string, string>();
  getItem(k: string) { return this.map.get(k) ?? null; }
  setItem(k: string, v: string) { this.map.set(k, v); }
  removeItem(k: string) { this.map.delete(k); }
}

describe('saved progress', () => {
  it('round-trips progress, settings and drafts through storage', () => {
    const mem = new MemoryStore();
    const a = new SaveStore(mem);
    a.recordCompletion('ring-road', 1, 16, 'silver', 0);
    a.recordCompletion('ring-road', 1, 14, 'gold', 2, ['D', 'r4', 'D']);
    a.recordDaily('2026-11-08', { puzzleId: 'ring-road', rev: 1, moves: 14, medal: 'gold', hints: 2 });
    a.updateSettings({ sound: false, motion: 'reduced' });
    a.saveDraft({ key: 'practice:ring-road', puzzleId: 'ring-road', rev: 1, route: ['D', 'r4'], hints: 1 });

    const b = new SaveStore(mem);
    expect(b.levelRecord('ring-road', 1)).toEqual({ rev: 1, completions: 2, bestMoves: 14, bestMedal: 'gold', bestCleanMoves: 16, bestRoute: ['D', 'r4', 'D'] });
    expect(b.data.daily['2026-11-08']).toMatchObject({ moves: 14, medal: 'gold', hints: 2 });
    expect(b.data.settings).toMatchObject({ sound: false, motion: 'reduced', haptics: true, music: true, reminder: false });
    expect(b.draft('practice:ring-road', 'ring-road', 1)?.route).toEqual(['D', 'r4']);
  });

  it('remembers restored village projects and ignores junk', () => {
    const mem = new MemoryStore();
    const a = new SaveStore(mem);
    a.restore('lane');
    a.restore('lane');
    a.restore('boxes');
    expect(new SaveStore(mem).data.restored).toEqual(['lane', 'boxes']);
    expect(parseSave(JSON.stringify({ version: 1, restored: ['lane', 7, '<script>'] })).restored).toEqual(['lane']);
    expect(parseSave(JSON.stringify({ version: 1 })).restored).toEqual([]);
  });

  it('keeps the best result, not the latest', () => {
    const s = new SaveStore(new MemoryStore());
    s.recordCompletion('p', 1, 14, 'gold', 0);
    const r = s.recordCompletion('p', 1, 18, 'bronze', 0);
    expect(r.newBest).toBe(false);
    expect(s.levelRecord('p', 1)).toMatchObject({ bestMoves: 14, bestMedal: 'gold', completions: 2 });
  });

  it('counts first-try golds in a row; hints neither add nor reset', () => {
    const mem = new MemoryStore();
    const s = new SaveStore(mem);
    expect(s.noteFirstDelivery('gold', 0)).toEqual({ run: 1, best: 1, newBest: true });
    expect(s.noteFirstDelivery('gold', 0)).toEqual({ run: 2, best: 2, newBest: true });
    expect(s.noteFirstDelivery('silver', 2)).toEqual({ run: 2, best: 2, newBest: false });
    expect(s.noteFirstDelivery('gold', 1)).toEqual({ run: 2, best: 2, newBest: false });
    expect(s.noteFirstDelivery('bronze', 0)).toEqual({ run: 0, best: 2, newBest: false });
    expect(s.noteFirstDelivery('gold', 0)).toEqual({ run: 1, best: 2, newBest: false });
    const b = new SaveStore(mem);
    expect([b.data.goldRun, b.data.bestGoldRun]).toEqual([1, 2]);
    expect(parseSave(JSON.stringify({ version: 1, goldRun: -3, bestGoldRun: 'x' }))).toMatchObject({ goldRun: 0, bestGoldRun: 0 });
    expect(parseSave(JSON.stringify({ version: 1 }))).toMatchObject({ goldRun: 0, bestGoldRun: 0 });
  });

  it('ignores records from an older puzzle revision', () => {
    const s = new SaveStore(new MemoryStore());
    s.recordCompletion('p', 1, 14, 'gold', 0);
    expect(s.levelRecord('p', 2)).toBeUndefined();
    expect(s.draft('k', 'p', 2)).toBeUndefined();
  });

  it('survives malformed data, keeping whatever is valid', () => {
    expect(parseSave('{not json').levels).toEqual({});
    expect(parseSave('null').levels).toEqual({});
    expect(parseSave(JSON.stringify({ version: 99, levels: { p: { rev: 1, completions: 1, bestMoves: 3, bestMedal: 'gold' } } })).levels).toEqual({});
    const mixed = parseSave(JSON.stringify({
      version: 1,
      levels: { good: { rev: 1, completions: 1, bestMoves: 9, bestMedal: 'gold' }, bad: { rev: 'x' }, worse: 7, medal: { rev: 1, completions: 1, bestMoves: 9, bestMedal: 'platinum' } },
      daily: { '2026-11-08': { puzzleId: 'p', rev: 1, moves: 4, medal: 'silver', hints: 0 }, tomorrow: { puzzleId: 'p', rev: 1, moves: 4, medal: 'silver', hints: 0 } },
      settings: { sound: 'loud', motion: 'reduced' },
      drafts: { k: { key: 'k', puzzleId: 'p', rev: 1, route: ['D', 3], hints: 0 } },
    }));
    expect(Object.keys(mixed.levels)).toEqual(['good']);
    expect(Object.keys(mixed.daily)).toEqual(['2026-11-08']);
    expect(mixed.settings).toMatchObject({ sound: true, motion: 'reduced' });
    expect(mixed.drafts).toEqual({});
  });

  it('keeps working in memory when storage is unavailable or throws', () => {
    const none = new SaveStore(null);
    expect(none.persistent).toBe(false);
    none.recordCompletion('p', 1, 5, 'gold', 0);
    expect(none.levelRecord('p', 1)?.bestMoves).toBe(5);

    const throwing: KeyValueStore = {
      getItem() { throw new Error('SecurityError'); },
      setItem() { throw new Error('QuotaExceeded'); },
      removeItem() {},
    };
    const t = new SaveStore(throwing);
    expect(t.persistent).toBe(false);
    expect(() => t.recordCompletion('p', 1, 5, 'gold', 0)).not.toThrow();

    const full: KeyValueStore = { getItem: () => null, setItem() { throw new Error('QuotaExceeded'); }, removeItem() {} };
    const f = new SaveStore(full);
    expect(f.flush()).toBe(false);
  });

  it('stores under a versioned key', () => {
    const mem = new MemoryStore();
    new SaveStore(mem).recordCompletion('p', 1, 5, 'gold', 0);
    expect(JSON.parse(mem.map.get(SAVE_KEY)!).version).toBe(1);
  });
});
