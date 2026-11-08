import type { Medal } from '../core/medals';
import type { DailyRecord, LevelRecord } from './storage';
import { parseDateKey, utcDateKey } from './daily';

/** Hearts: what residents give back. Bronze 1, silver 2, gold 3 per route, counted at your best. */
export const HEARTS: Record<Medal, number> = { bronze: 1, silver: 2, gold: 3 };

export function heartsFrom(levels: Record<string, LevelRecord>, bookRevs: ReadonlyMap<string, number>, daily: Record<string, DailyRecord>): number {
  let n = 0;
  for (const [id, rev] of bookRevs) {
    const r = levels[id];
    if (r && r.rev === rev) n += HEARTS[r.bestMedal];
  }
  for (const r of Object.values(daily)) n += HEARTS[r.medal];
  return n;
}

export interface Project {
  id: string;
  title: string;
  cost: number;
  resident: string;
  note: string;
}

/** The courier's home village, restored a little at a time. Costs are running totals of hearts. */
export const PROJECTS: Project[] = [
  { id: 'lane', title: 'Sweep the lane', cost: 3, resident: 'Mr Fennick', note: 'Leaves gone, puddles gone, and my bicycle bell finally heard. Much obliged.' },
  { id: 'boxes', title: 'Plant the window boxes', cost: 8, resident: 'Mrs Pennyworth', note: 'Geraniums on every sill. The whole row looks like it’s smiling.' },
  { id: 'bench', title: 'Mend the bench on the green', cost: 14, resident: 'Old Albert', note: 'Forty years I’ve fed the pigeons from that bench. Back where I belong.' },
  { id: 'lamps', title: 'Relight the lamps', cost: 22, resident: 'Nell the lamplighter', note: 'Lit them all myself at dusk. You can find your way home in the dark again.' },
  { id: 'fountain', title: 'Get the fountain running', cost: 32, resident: 'The Okafor twins', note: 'It splashes! We may have already fallen in. Twice.' },
  { id: 'bakery', title: 'Reopen the old bakery', cost: 45, resident: 'Rosa Bianchi', note: 'First loaves out at six. Come by for the crusty end, it’s yours.' },
  { id: 'orchard', title: 'Plant the orchard', cost: 60, resident: 'Mr and Mrs Hale', note: 'Twelve little apple trees. In five years you’ll be delivering crumble.' },
  { id: 'bridge', title: 'Rebuild the footbridge', cost: 78, resident: 'Captain Moss', note: 'No more going the long way round. Though you do seem to enjoy a detour.' },
  { id: 'allotments', title: 'Dig the allotments', cost: 98, resident: 'Priya Shah', note: 'Beans, beetroot and far too many courgettes. You’ll be taking some.' },
  { id: 'bandstand', title: 'Paint the bandstand', cost: 120, resident: 'The Brass Club', note: 'Fresh paint and a tuned tuba. Sunday concerts start again this week.' },
  { id: 'bunting', title: 'Hang the bunting', cost: 145, resident: 'Mrs Pennyworth', note: 'Three hundred flags, sewn by hand. Don’t ask how many cups of tea that took.' },
  { id: 'fete', title: 'Hold the village fete', cost: 175, resident: 'Everyone', note: 'Cake stall, tombola, and a toast to the courier who brought it all back to life.' },
];

export function projectState(p: Project, hearts: number, restored: readonly string[]): 'restored' | 'ready' | 'locked' {
  if (restored.includes(p.id)) return 'restored';
  return hearts >= p.cost ? 'ready' : 'locked';
}

// ───────────────────────────── daily runs ─────────────────────────────

const DAY = 86_400_000;

export interface RunStats {
  /** Days in the current run, or 0 if it has ended. */
  current: number;
  longest: number;
  total: number;
  /** True when today's daily is still to play and the run is waiting on it. */
  waitingToday: boolean;
}

/**
 * A forgiving streak: one missed day is a rest day and doesn't break the run;
 * only two missed days in a row end it. Runs count days actually played.
 */
export function runStats(datesPlayed: readonly string[], today: string): RunStats {
  const t = parseDateKey(today)!;
  // Only days up to today count (a clock set wrong earlier can't inflate a run).
  const days = [...new Set(datesPlayed)].map((d) => parseDateKey(d)).filter((x): x is number => x !== null && x <= t).sort((a, b) => a - b);
  let longest = 0, run = 0, prev = -Infinity;
  for (const d of days) {
    run = d - prev <= 2 * DAY ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  }
  const last = days.length ? days[days.length - 1] : -Infinity;
  const alive = t - last <= 2 * DAY;
  return { current: alive ? run : 0, longest, total: days.length, waitingToday: alive && last < t };
}

// ───────────────────────────── seasonal events ─────────────────────────────

export interface SeasonEvent {
  id: 'blossom' | 'fete' | 'harvest' | 'winter';
  title: string;
  blurb: string;
  /** Inclusive UTC month/day range. */
  from: [number, number];
  to: [number, number];
  keepsake: string;
}

export const EVENTS: SeasonEvent[] = [
  { id: 'blossom', title: 'Blossom Week', blurb: 'Cherry trees in flower on every daily route.', from: [4, 1], to: [4, 14], keepsake: 'a blossom tree by the green' },
  { id: 'fete', title: 'Summer Fete', blurb: 'Bunting up and long golden evenings on the dailies.', from: [7, 15], to: [7, 31], keepsake: 'a striped fete tent' },
  { id: 'harvest', title: 'Harvest Fair', blurb: 'Pumpkins on the doorsteps and orchards heavy with apples.', from: [10, 1], to: [10, 14], keepsake: 'a pumpkin patch' },
  { id: 'winter', title: 'Winter Lights', blurb: 'Snow on the rooftops and lights in every window.', from: [12, 10], to: [12, 31], keepsake: 'a lit Christmas tree on the green' },
];

export function eventOn(dateKey: string): SeasonEvent | null {
  const t = parseDateKey(dateKey);
  if (t === null) return null;
  const d = new Date(t);
  const md = (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
  return EVENTS.find((e) => md >= e.from[0] * 100 + e.from[1] && md <= e.to[0] * 100 + e.to[1]) ?? null;
}

/** Keepsakes earned: an event counts once you've delivered three of its dailies in any year. */
export function keepsakes(datesPlayed: readonly string[]): SeasonEvent['id'][] {
  const count = new Map<string, number>();
  for (const d of datesPlayed) {
    const e = eventOn(d);
    if (e) count.set(e.id, (count.get(e.id) ?? 0) + 1);
  }
  return EVENTS.filter((e) => (count.get(e.id) ?? 0) >= 3).map((e) => e.id);
}

export function daysLeftInEvent(e: SeasonEvent, dateKey: string): number {
  const t = parseDateKey(dateKey)!;
  const y = new Date(t).getUTCFullYear();
  const end = Date.UTC(y, e.to[0] - 1, e.to[1]);
  return Math.round((end - t) / DAY) + 1;
}

export { utcDateKey };
