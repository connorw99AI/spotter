import { describe, expect, it } from 'vitest';
import { PUZZLES } from '../src/data/puzzles';
import { PROJECTS, eventOn, heartsFrom, keepsakes, projectState, runStats } from '../src/game/meta';
import { RESIDENTS, residentsFor, thankYouNote } from '../src/game/residents';

describe('hearts and village projects', () => {
  it('counts best medals in the book and every daily delivered', () => {
    const revs = new Map([['a', 1], ['b', 1], ['c', 2]]);
    const levels = {
      a: { rev: 1, completions: 2, bestMoves: 9, bestMedal: 'gold' as const },
      b: { rev: 1, completions: 1, bestMoves: 12, bestMedal: 'bronze' as const },
      c: { rev: 1, completions: 1, bestMoves: 12, bestMedal: 'gold' as const }, // stale revision: ignored
    };
    const daily = { '2026-11-09': { puzzleId: 'daily-001', rev: 1, moves: 10, medal: 'silver' as const, hints: 0 } };
    expect(heartsFrom(levels, revs, daily)).toBe(3 + 1 + 2);
  });

  it('projects unlock in order of cost and stay restored', () => {
    const costs = PROJECTS.map((p) => p.cost);
    expect([...costs].sort((a, b) => a - b)).toEqual(costs);
    expect(projectState(PROJECTS[0], 2, [])).toBe('locked');
    expect(projectState(PROJECTS[0], 3, [])).toBe('ready');
    expect(projectState(PROJECTS[0], 0, ['lane'])).toBe('restored');
  });
});

describe('forgiving daily runs', () => {
  it('a single missed day is a rest day; two in a row end the run', () => {
    expect(runStats(['2026-11-01', '2026-11-02', '2026-11-04', '2026-11-05'], '2026-11-05')).toMatchObject({ current: 4, longest: 4, total: 4 });
    expect(runStats(['2026-11-01', '2026-11-02', '2026-11-05'], '2026-11-05')).toMatchObject({ current: 1, longest: 2 });
  });

  it('keeps the run alive while today is still to play, and ends it after two missed days', () => {
    expect(runStats(['2026-11-06', '2026-11-07'], '2026-11-08')).toMatchObject({ current: 2, waitingToday: true });
    expect(runStats(['2026-11-06', '2026-11-07'], '2026-11-09')).toMatchObject({ current: 2, waitingToday: true });
    expect(runStats(['2026-11-06', '2026-11-07'], '2026-11-10')).toMatchObject({ current: 0, longest: 2 });
    expect(runStats([], '2026-11-10')).toEqual({ current: 0, longest: 0, total: 0, waitingToday: false });
    expect(runStats(['2026-11-07', '2026-12-01', '2026-12-02'], '2026-11-08')).toMatchObject({ current: 1, total: 1 });
  });
});

describe('seasonal events', () => {
  it('runs on fixed UTC dates every year', () => {
    expect(eventOn('2026-12-10')?.id).toBe('winter');
    expect(eventOn('2027-12-31')?.id).toBe('winter');
    expect(eventOn('2026-12-09')).toBeNull();
    expect(eventOn('2027-04-14')?.id).toBe('blossom');
    expect(eventOn('2026-11-08')).toBeNull();
  });

  it('awards a keepsake after three event dailies', () => {
    expect(keepsakes(['2026-12-10', '2026-12-11'])).toEqual([]);
    expect(keepsakes(['2026-12-10', '2026-12-11', '2026-12-20', '2026-11-01'])).toEqual(['winter']);
  });
});

describe('residents', () => {
  it('gives every house in a puzzle a different, stable resident', () => {
    for (const p of PUZZLES) {
      const a = residentsFor(p), b = residentsFor(p);
      expect([...a.values()]).toEqual([...b.values()]);
      expect(new Set(a.values()).size).toBe(p.houses.length);
      for (const name of a.values()) expect(RESIDENTS).toContain(name);
    }
    expect(thankYouNote(PUZZLES[0], 0, 'bakery').length).toBeGreaterThan(10);
  });
});

import { STORY, chapterKeepsakes, lettersFor } from '../src/game/story';
import { CHAPTERS } from '../src/data/catalog';

describe('chapter stories', () => {
  it('has letters for every chapter, the last one at the chapter’s end', () => {
    for (const c of CHAPTERS) {
      const s = STORY[c.id];
      expect(s, c.id).toBeDefined();
      expect(s.letters[s.letters.length - 1].at).toBe(c.ids.length);
      expect(s.letters[0].at).toBe(1);
    }
  });

  it('unlocks letters by deliveries and keepsakes by finished chapters', () => {
    expect(lettersFor('market-town', 0)).toEqual([]);
    expect(lettersFor('market-town', 9).map((l) => l.at)).toEqual([1, 8]);
    expect(chapterKeepsakes({ classic: { delivered: 20, total: 20 }, riverside: { delivered: 23, total: 24 } })).toEqual(['bicycle']);
  });
});
