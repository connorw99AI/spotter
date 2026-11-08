import { describe, expect, it } from 'vitest';
import { analyse } from '../src/core/analysis';
import { isWinningRoute } from '../src/core/rules';
import { solvePuzzle } from '../src/core/solver';
import { buildTown } from '../src/core/town';
import { validatePuzzle } from '../src/core/validate';
import { BOOK_IDS, CHAPTERS, getPuzzle, nextInBook, puzzleLabel } from '../src/data/catalog';
import { decodePuzzle, encodePuzzle } from '../src/data/codec';
import { DAILY_CODES } from '../src/data/dailies';
import { PUZZLES } from '../src/data/puzzles';
import { dailyPace, dailyPuzzleId, lastFreshDaily } from '../src/game/daily';

const generatedIds = [...BOOK_IDS.filter((id) => !PUZZLES.some((p) => p.id === id)), ...DAILY_CODES.map((_, i) => `daily-${String(i + 1).padStart(3, '0')}`)];

describe('generated content', () => {
  it('has 120 route-book puzzles in five chapters and 365 dailies', () => {
    expect(CHAPTERS).toHaveLength(6);
    expect(CHAPTERS.slice(1).every((c) => c.ids.length === 24)).toBe(true);
    expect(DAILY_CODES).toHaveLength(365);
    expect(new Set(DAILY_CODES).size).toBe(365);
    expect(generatedIds).toHaveLength(485);
  });

  it('round-trips through the compact codec', () => {
    for (const p of PUZZLES) {
      const back = decodePuzzle(encodePuzzle(p), { id: p.id, number: p.number, tier: p.tier });
      const rename = (id: string) => `n${p.nodes.findIndex((x) => x.id === id)}`;
      expect(back.edges).toEqual(p.edges.map((e) => ({ ...e, a: rename(e.a), b: rename(e.b) })));
      expect(back.orders.map((o) => [o.from, o.to, o.fresh])).toEqual(p.orders.map((o) => [rename(o.from), rename(o.to), o.fresh]));
      expect(back.gold).toBe(p.gold);
      expect(isWinningRoute(buildTown(back), solvePuzzle(buildTown(p))!.route.map(rename))).toBe(true);
    }
  });

  it('every puzzle is valid, solvable, and its gold matches the solver', () => {
    for (const id of generatedIds) {
      const p = getPuzzle(id)!;
      expect(validatePuzzle(p), id).toEqual([]);
      const sol = solvePuzzle(buildTown(p));
      expect(sol?.moves, id).toBe(p.gold);
      expect(isWinningRoute(buildTown(p), sol!.route), id).toBe(true);
      expect(p.title.length, id).toBeLessThanOrEqual(24);
      expect(p.brief.length, id).toBeLessThanOrEqual(110);
      expect(p.hint.length, id).toBeGreaterThan(20);
    }
  });

  it('every rule a puzzle uses shapes its solution, and naive play loses', () => {
    for (const id of generatedIds) {
      const p = getPuzzle(id)!;
      const r = analyse(p);
      for (const [rule, moves] of Object.entries(r.relaxedOptimal)) {
        const count = r.relaxedRoutes[rule as keyof typeof r.relaxedRoutes];
        expect(moves !== r.optimal || count !== r.optimalRoutes, `${id} ${rule}`).toBe(true);
      }
      expect(r.greedy === null || r.greedy > r.optimal!, id).toBe(true);
    }
  }, 240_000);

  it('has no one-way traps: every corner can reach home and be reached from it', () => {
    for (const id of generatedIds) {
      const t = buildTown(getPuzzle(id)!);
      const reach = (from: string, back: boolean) => {
        const seen = new Set([from]);
        const q = [from];
        while (q.length) {
          const u = q.pop()!;
          const next = back ? t.nodeIds.filter((v) => (t.succ.get(v) ?? []).includes(u)) : t.succ.get(u) ?? [];
          for (const v of next) if (!seen.has(v)) { seen.add(v); q.push(v); }
        }
        return seen;
      };
      const out = reach(t.depot, false), back = reach(t.depot, true);
      expect(t.nodeIds.every((n) => out.has(n) && back.has(n)), id).toBe(true);
    }
  });

  it('every garden gate is a shortcut the gold route actually takes', () => {
    for (const id of generatedIds) {
      const p = getPuzzle(id)!;
      if (!p.edges.some((e) => e.gate)) continue;
      const route = solvePuzzle(buildTown(p))!.route;
      const used = route.some((n, i) => i > 0 && p.edges.some((e) => e.gate && ((e.a === n && e.b === route[i - 1]) || (e.b === n && e.a === route[i - 1]))));
      expect(used, id).toBe(true);
    }
  });

  it('titles are unique across the whole game', () => {
    const titles = [...PUZZLES.map((p) => p.title), ...generatedIds.map((id) => getPuzzle(id)!.title)];
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('labels and book order read sensibly', () => {
    expect(puzzleLabel(getPuzzle('riverside-03')!)).toBe('Riverside 3');
    expect(puzzleLabel(PUZZLES[4])).toBe('Route 5');
    expect(nextInBook(PUZZLES[19])?.id).toBe(CHAPTERS[1].ids[0]);
    expect(getPuzzle('riverside-99')).toBeUndefined();
    expect(getPuzzle('daily-366')).toBeUndefined();
  });
});

describe('daily schedule', () => {
  it('keeps the old rotation up to 8 November 2026, then a new puzzle every day', () => {
    expect(dailyPuzzleId('2026-11-08')).toBe('the-grand-detour');
    expect(dailyPuzzleId('2026-11-09')).toBe('daily-001');
    expect(dailyPuzzleId('2026-11-10')).toBe('daily-002');
    expect(lastFreshDaily()).toBe('2027-11-08');
    expect(dailyPuzzleId('2027-11-08')).toBe('daily-365');
    expect(dailyPuzzleId('2027-11-09')).toBe('daily-001');
  });

  it('follows the weekday rhythm: gentle Monday, tricky Sunday', () => {
    expect(dailyPace('2026-11-09')).toBe('gentle'); // Monday
    expect(dailyPace('2026-11-11')).toBe('steady'); // Wednesday
    expect(dailyPace('2026-11-15')).toBe('tricky'); // Sunday
    expect(dailyPace('2026-11-08')).toBeNull();
  });
});
