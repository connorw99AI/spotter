import type { PuzzleDef } from '../core/types';
import { definePuzzle } from './dsl';

/** Grid helper: letters laid out row by row, `cols` wide, unit spacing. */
function grid(ids: string, cols: number, extra: Record<string, [number, number]> = {}): Record<string, [number, number]> {
  const g: Record<string, [number, number]> = {};
  ids.split('').forEach((c, i) => (g[c] = [i % cols, Math.floor(i / cols)]));
  return { ...g, ...extra };
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Points round a circle, starting at the top, clockwise. */
function ring(prefix: string, count: number, cx: number, cy: number, r: number) {
  const nodes: Record<string, [number, number]> = {};
  const bends: Record<string, [number, number]> = {};
  const rc = r / Math.cos(Math.PI / count);
  for (let i = 0; i < count; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / count;
    nodes[prefix + i] = [r2(cx + r * Math.cos(a)), r2(cy + r * Math.sin(a))];
    const m = a + Math.PI / count;
    bends[`${prefix}${i}-${prefix}${(i + 1) % count}`] = [r2(cx + rc * Math.cos(m)), r2(cy + rc * Math.sin(m))];
  }
  return { nodes, bends };
}

const ringRoad = ring('r', 8, 2, 2, 1.7);
const roundabout = ring('r', 4, 2, 2, 0.72);

export const PUZZLES: PuzzleDef[] = [
  // ───────────────────────────── Tutorial ─────────────────────────────
  definePuzzle({
    id: 'morning-loaves', rev: 1, number: 1, tier: 'tutorial', mechanics: ['basic'], introduces: 'basic',
    title: 'Morning Loaves',
    brief: 'One warm loaf for House A. Collect it from the Bakery, drop it off, and come home.',
    nodes: { D: [0, 1], a: [0, 0], K: [1, 0], b: [2, 0], c: [2, 1], A: [1, 1] },
    streets: 'D-a-K-b-c-A-D',
    depot: 'D', shops: { K: 'bakery' }, houses: { A: 'A' },
    orders: [['K', 'A']],
    hint: 'Ride round the loop: the Bakery first, then House A on your way home.',
    tips: [
      { on: 'start', text: 'Drag from your cottage along the street to the Bakery. Tapping the next corner works too.' },
      { on: 'early', text: 'House A is waiting for bread from the Bakery. Collect it first, then come back.' },
      { on: 'pickup', text: 'Bread’s in the basket. Now ride on to House A.' },
      { on: 'allDelivered', text: 'Delivered! Finish the round by riding home.' },
      { on: 'complete', text: 'Route planned. Press Deliver to send the courier off.' },
    ],
    gold: 6,
  }),
  definePuzzle({
    id: 'there-and-back', rev: 1, number: 2, tier: 'tutorial', mechanics: ['basic'],
    title: 'There and Back',
    brief: 'House A wants tulips from the Florist at the end of Bramble Lane.',
    nodes: { D: [0, 0], a: [1, 0], A: [2, 0], b: [3, 0], F: [3, 1.1], x: [0, 1.1], y: [1, 1.1] },
    streets: 'D-a-A-b~F D-x-y-a',
    depot: 'D', shops: { F: 'florist' }, houses: { A: 'A' },
    orders: [['F', 'A']],
    hint: 'You will pass House A before you have its tulips. That’s fine: collect them, then turn round.',
    tips: [
      { on: 'start', text: 'House A ordered tulips from the Florist at the end of the lane.' },
      { on: 'early', text: 'Nothing to drop off yet — the tulips are still at the Florist. Ride on.' },
      { on: 'pickup', text: 'Got them! Drag back the way you came: after a pickup or a drop-off, the courier turns round instead of erasing.' },
      { on: 'deliver', text: 'Streets can be ridden more than once. The little ×2 shows a street you’ve used twice.' },
      { on: 'complete', text: 'Home again. Press Deliver.' },
    ],
    gold: 8,
  }),
  definePuzzle({
    id: 'fork-in-the-lane', rev: 1, number: 3, tier: 'tutorial', mechanics: ['multi'], introduces: 'multi',
    title: 'Fork in the Lane',
    brief: 'Two orders today, and two lanes round the meadow. Which way first?',
    nodes: { D: [0, 1], A: [1, 1], n1: [1.7, 0], F: [2.7, 0], m: [3.4, 1], K: [2.7, 2], B: [1.7, 2] },
    streets: 'D-A-n1-F-m A-B-K-m',
    depot: 'D', shops: { K: 'bakery', F: 'florist' }, houses: { A: 'A', B: 'B' },
    orders: [['K', 'A'], ['F', 'B']],
    hint: 'House A is right by your cottage, which makes it the ideal last stop. Which way round leaves it until the end?',
    tips: [
      { on: 'start', text: 'Every finished route earns a stamp. The shortest earns gold — the target is shown below the map.' },
      { on: 'complete', text: 'Route complete. Compare your moves with the gold target, then press Deliver.' },
    ],
    gold: 8,
  }),

  // ──────────────────────────── Approachable ───────────────────────────
  definePuzzle({
    id: 'corner-shop-shuffle', rev: 1, number: 4, tier: 'approachable', mechanics: ['multi'],
    title: 'Corner Shop Shuffle',
    brief: 'Three shops, three doorsteps, one park in the way.',
    nodes: grid('abcdefghijklmnop', 4),
    streets: 'a-b-c-d e-f h i-j l m-n-o-p a-e-i-m b-f-j-n c-g k-o d-h-l-p g-h k-l j-k',
    depot: 'n', shops: { l: 'bakery', o: 'grocer', i: 'florist' }, houses: { c: 'A', m: 'B', g: 'C' },
    orders: [['l', 'c'], ['o', 'm'], ['i', 'g']],
    hint: 'The Grocer is one street from home and House B is just as close. Settle that first, then make one sweeping loop.',
    gold: 14,
  }),
  definePuzzle({
    id: 'roadworks-on-rye', rev: 1, number: 5, tier: 'approachable', mechanics: ['multi', 'closure'], introduces: 'closure',
    title: 'Roadworks on Rye Street',
    brief: 'Rye Street is coned off in the middle. The town still wants its breakfast.',
    nodes: grid('abcdefghijkl', 4),
    streets: 'a-b-c-d e-f#g-h i-j-k-l a-e-i b-f-j c-g-k d-h-l',
    depot: 'e', shops: { h: 'bakery', a: 'florist' }, houses: { g: 'A', f: 'B', d: 'C' },
    orders: [['h', 'g'], ['a', 'f'], ['a', 'd']],
    hint: 'House B is next door, but its flowers are not. Take the top road out and save the little doorstep for the ride home.',
    tips: [
      { on: 'start', text: 'Cones mean roadworks: that street is closed both ways. Find a way round.' },
      { on: 'blocked', text: 'Roadworks — this street is closed. Try the next one over.' },
    ],
    gold: 10,
  }),
  definePuzzle({
    id: 'sunday-scoops', rev: 1, number: 6, tier: 'approachable', mechanics: ['multi', 'fresh'], introduces: 'fresh',
    title: 'Sunday Scoops',
    brief: 'A tub of pistachio for House A. It won’t last long in the sun.',
    nodes: { a: [0, 0], b: [1, 0], c: [2, 0], D: [0, 1], I: [1, 1], d: [2, 1], e: [0, 2], f: [1, 2], g: [2, 2] },
    streets: 'a-b-c D-I-d e-f-g a-D-e b-I-f c-d-g',
    depot: 'D', shops: { I: 'icecream', d: 'bakery' }, houses: { e: 'A', f: 'B' },
    orders: [['I', 'e', 2], ['d', 'f']],
    hint: 'Shops hand over orders the moment you pass. Fetch the bread the long way round, and ride through the parlour on your way back.',
    tips: [
      { on: 'start', text: 'Ice cream melts: it must reach House A within 2 moves of pickup. Shops hand orders over as soon as you pass.' },
      { on: 'pickup', text: 'The badge on each fresh order counts the moves it has left.' },
      { on: 'blocked', text: 'Careful — the ice cream would melt. Pick it up later, closer to House A.' },
    ],
    gold: 8,
  }),
  definePuzzle({
    id: 'ring-road', rev: 1, number: 7, tier: 'approachable', mechanics: ['multi', 'closure'],
    title: 'Ring Road',
    brief: 'The ring road is dug up near home. The paths across the green are clear.',
    nodes: { ...ringRoad.nodes, h: [2, 2], D: [2, 4.7] },
    bends: Object.fromEntries(Object.entries(ringRoad.bends).filter(([k]) => k !== 'r3-r4')),
    streets: 'r0-r1-r2-r3#r4-r5-r6-r7-r0 h~r0 h~r2 h~r6 r4-D',
    depot: 'D', shops: { r1: 'florist', r3: 'bakery', r0: 'grocer' }, houses: { r4: 'A', r5: 'B', r7: 'C' },
    orders: [['r1', 'r4'], ['r3', 'r5'], ['r0', 'r7']],
    hint: 'The Bakery sits in a dead end behind the roadworks. Cut across the green to reach it, then sweep round the ring towards home.',
    water: [{ points: [[1.55, 2.55], [1.85, 2.85], [2.45, 2.75], [2.55, 2.45]], width: 0.32 }],
    gold: 14,
  }),
  definePuzzle({
    id: 'picnic-hamper', rev: 1, number: 8, tier: 'approachable', mechanics: ['multi', 'fresh'],
    title: 'Picnic Hamper',
    brief: 'Bread, veg and a choc-ice for the park picnic. The choc-ice goes last.',
    nodes: grid('abcdefghijkl', 4),
    streets: 'a-b-c-d e-f g-h i-j-k-l a-e-i b-f-j c-g-k d-h-l',
    depot: 'i', shops: { f: 'icecream', b: 'bakery', c: 'grocer' }, houses: { l: 'A', g: 'B', h: 'C' },
    orders: [['f', 'l', 3], ['b', 'g'], ['c', 'h']],
    hint: 'The parlour is only three moves from House A. Make it your last pickup and deliver the choc-ice first.',
    gold: 14,
  }),

  // ──────────────────────────── Intermediate ───────────────────────────
  definePuzzle({
    id: 'wren-close', rev: 1, number: 9, tier: 'intermediate', mechanics: ['multi', 'oneway'], introduces: 'oneway',
    title: 'Wren Close',
    brief: 'Wren Close is a one-way crescent. Neighbours there order a lot of flowers.',
    nodes: { a: [0, 0], b: [1, 0], c: [2, 0], d: [3, 0], D: [0, 1], e: [1, 1], f: [2, 1], g: [3, 1], h: [1, 2.1], i: [1.6, 2.9], j: [2.4, 2.9], k: [3, 2.1] },
    streets: 'a-b-c-d D-e-f-g a-D b-e c-f d-g e>h>i>j>k>g',
    bends: { 'h-i': [1.15, 2.75], 'j-k': [2.85, 2.75] },
    depot: 'D', shops: { k: 'florist', f: 'bakery' }, houses: { j: 'A', e: 'B', g: 'C' },
    orders: [['k', 'j'], ['f', 'e'], ['f', 'g']],
    hint: 'The Florist is at the very end of the close, past House A. You’ll ride the crescent twice, so make the first lap count.',
    tips: [
      { on: 'start', text: 'Arrows mark one-way streets. Wren Close runs one way only.' },
      { on: 'blocked', text: 'One-way street — follow the arrows.' },
    ],
    gold: 16,
  }),
  definePuzzle({
    id: 'over-the-bridge', rev: 1, number: 10, tier: 'intermediate', mechanics: ['multi', 'oneway', 'closure'],
    title: 'Over the Bridge',
    brief: 'Two bridges, two one-way riverside lanes, and a market on each bank.',
    nodes: { a: [0, 0], b: [1, 0], c: [3, 0], d: [4, 0], e: [0, 1], f: [1, 1], g: [3, 1], h: [4, 1], i: [0, 2], j: [1, 2], k: [3, 2], l: [4, 2], m: [0, 3], n: [1, 3], o: [3, 3], p: [4, 3] },
    streets: 'a-b=c-d g-h i-j k-l m-n=o-p a-e-i-m b>f>j>n c<g<k<o d-h-l-p e#f',
    depot: 'm', shops: { j: 'bakery', f: 'florist', p: 'grocer' }, houses: { k: 'A', g: 'B', o: 'C' },
    orders: [['j', 'k'], ['f', 'g'], ['p', 'o']],
    hint: 'The west lane runs south and the east lane runs north. Collect on the way down the west bank, and let the east lane carry you up. You may not need both bridges.',
    water: [{ points: [[2, -0.8], [2.1, 0.8], [1.9, 2.2], [2, 3.8]], width: 0.9 }],
    gold: 16,
  }),
  definePuzzle({
    id: 'basket-case', rev: 1, number: 11, tier: 'intermediate', mechanics: ['multi', 'capacity'], introduces: 'capacity',
    title: 'Basket Case',
    brief: 'New rule: the basket only holds two orders. Three are waiting.',
    nodes: { t0: [0, 0], t1: [1, 0], t2: [2, 0], t3: [3, 0], t4: [4, 0], m1: [1, 1], m3: [3, 1], b0: [0, 2], b1: [1, 2], b2: [2, 2], b3: [3, 2], b4: [4, 2] },
    streets: 't0-t1-t2-t3-t4 b0-b1-b2-b3-b4 t0-b0 t2-b2 t4-b4 t1-m1-b1 t3-m3-b3',
    depot: 'b2', shops: { m1: 'bakery', t0: 'grocer', b0: 'florist' }, houses: { b3: 'A', b4: 'B', t4: 'C' },
    orders: [['m1', 'b3'], ['t0', 't4'], ['b0', 'b4']],
    capacity: 2,
    hint: 'The Bakery is closest to home, but bread for House A can wait. Fill the basket with the two orders bound for the far end.',
    tips: [
      { on: 'start', text: 'Your basket holds two orders. Pass a shop with a full basket and its order waits for you.' },
      { on: 'full', text: 'Basket full — that order stays at the shop until you have room.' },
    ],
    gold: 16,
  }),
  definePuzzle({
    id: 'full-basket-fresh-ice', rev: 1, number: 12, tier: 'intermediate', mechanics: ['multi', 'capacity', 'fresh'],
    title: 'Full Basket, Fresh Ice',
    brief: 'The ice-cream parlour sits on the only bridge. House A is on the home side.',
    nodes: { a: [0, 0], b: [1, 0], I: [2, 0], c: [3, 0], d: [4, 0], D: [0, 1], e: [1, 1], f: [3, 1], g: [4, 1], h: [0, 2], i: [1, 2], j: [3, 2], k: [4, 2] },
    streets: 'a-b=I=c-d D-e f-g h-i j-k a-D-h b-e-i c-f-j d-g-k',
    depot: 'D', shops: { I: 'icecream', h: 'bakery', a: 'florist' }, houses: { e: 'A', g: 'B', i: 'C' },
    orders: [['I', 'e', 2], ['h', 'g'], ['a', 'i']],
    capacity: 2,
    hint: 'A full basket rides straight past a shop. Sometimes it pays to carry an order further than it needs to go.',
    water: [{ points: [[2, -0.9], [1.95, 0.9], [2.1, 2.1], [2, 3]], width: 0.75 }],
    gold: 16,
  }),
  definePuzzle({
    id: 'roundabout-rounds', rev: 1, number: 13, tier: 'intermediate', mechanics: ['multi', 'oneway'],
    title: 'Roundabout Rounds',
    brief: 'Everyone goes clockwise round the roundabout. Miss your exit and round you go.',
    nodes: { ...roundabout.nodes, n: [2, 0], e: [4, 2], s: [2, 4], w: [0, 2], nw: [0, 0], ne: [4, 0], se: [4, 4], D: [2, 4.95] },
    bends: roundabout.bends,
    streets: 'r0>r1>r2>r3>r0 r0-n r1-e r2-s r3-w n-ne-e w~nw s~se s-D',
    depot: 'D', shops: { n: 'bakery', nw: 'florist', e: 'grocer' }, houses: { s: 'A', w: 'B', ne: 'C' },
    orders: [['n', 's'], ['nw', 'w'], ['e', 'ne']],
    hint: 'The lane behind the Grocer joins the north and east arms without the roundabout. Use it to save a lap.',
    gold: 17,
  }),
  definePuzzle({
    id: 'market-day', rev: 1, number: 14, tier: 'intermediate', mechanics: ['multi', 'closure'],
    title: 'Market Day',
    brief: 'Three loaves from one bakery, a bouquet for the vicarage, and roadworks everywhere.',
    nodes: grid('abcdefghijklmnop', 4),
    streets: 'a-b-c-d e-f-g-h i-j#k-l m-n-o-p a-e-i-m b#f-j-n c-g-k-o d-h#l-p',
    depot: 'm', shops: { i: 'bakery', h: 'florist' }, houses: { f: 'A', n: 'B', a: 'C', l: 'D' },
    orders: [['i', 'f'], ['i', 'n'], ['i', 'a'], ['h', 'l']],
    hint: 'All three loaves leave the Bakery together. The real puzzle is the order of doorsteps around the roadworks.',
    gold: 14,
  }),
  definePuzzle({
    id: 'old-town-blooms', rev: 1, number: 15, tier: 'intermediate', mechanics: ['multi', 'fresh'],
    title: 'Old Town Blooms',
    brief: 'Crooked lanes, a florist and a gelato cart. Tulips wilt, gelato melts.',
    nodes: { a: [0.5, 0], b: [1.5, 0], c: [2.5, 0], d: [0, 1], e: [1, 1], f: [2, 1], g: [3, 1], h: [0.5, 2], i: [1.5, 2], j: [2.5, 2], k: [1, 3], l: [2, 3], D: [1.5, 4] },
    streets: 'a-b-c d-e-f-g h-i-j k-l a-d a-e b-e b-f c-g d-h e-h f-i g-j h-k i-k i-l j-l k-D-l',
    depot: 'D', shops: { b: 'florist', c: 'icecream', a: 'bakery' }, houses: { k: 'A', l: 'B', d: 'C' },
    orders: [['b', 'k', 4], ['c', 'l', 3], ['a', 'd']],
    hint: 'House B is three lanes from the gelato cart; House A is four from the Florist. Neither can wait for a detour.',
    gold: 15,
  }),
  definePuzzle({
    id: 'cul-de-sac-crescent', rev: 1, number: 16, tier: 'intermediate', mechanics: ['multi', 'capacity'],
    title: 'Cul-de-sac Crescent',
    brief: 'A loop road, quiet closes, four orders and a basket for two.',
    nodes: { D: [2, 4], l1: [1, 4], l2: [0, 3], l3: [0, 1.5], l4: [1, 0.5], l5: [2, 0.5], l6: [3, 0.5], l7: [4, 1.5], l8: [4, 3], l9: [3, 4], c1: [1, 3], c2: [1.3, 2], c3: [2.7, 2], c4: [3, 3], c5: [2, 1.5] },
    streets: 'D-l1-l2-l3-l4-l5-l6-l7-l8-l9-D l1-c1-c2 l9-c4-c3 l5-c5 c2~c5',
    bends: { 'l3-l4': [0.15, 0.6], 'l6-l7': [3.85, 0.6] },
    depot: 'D', shops: { l6: 'bakery', l5: 'florist', l7: 'grocer' }, houses: { l4: 'A', c1: 'B', l3: 'C', l1: 'D' },
    orders: [['l6', 'l4'], ['l5', 'c1'], ['l7', 'l3'], ['l6', 'l1']],
    capacity: 2,
    hint: 'You’ll pass the Bakery twice. The first time, take only one loaf — the basket decides which.',
    gold: 16,
  }),

  // ──────────────────────────── Challenging ────────────────────────────
  definePuzzle({
    id: 'the-grand-detour', rev: 1, number: 17, tier: 'challenging', mechanics: ['multi', 'oneway', 'fresh', 'capacity'],
    title: 'The Grand Detour',
    brief: 'A figure of eight: the west loop runs clockwise only. Four orders, two hands.',
    nodes: { a: [0, 0], b: [1, 0], c: [2, 0], d: [3, 0], e: [4, 0], f: [0, 1], g: [2, 1], h: [4, 1], i: [0, 2], j: [1, 2], k: [2, 2], l: [3, 2], m: [4, 2], D: [2, 3.1] },
    streets: 'a>b>c c>g>k k>j>i i>f>a c-d-e-h-m-l-k k-D g-l',
    depot: 'D', shops: { h: 'icecream', j: 'bakery', l: 'florist' }, houses: { k: 'A', m: 'B', d: 'C', f: 'D' },
    orders: [['h', 'k', 3], ['j', 'm'], ['l', 'd'], ['j', 'f']],
    capacity: 2,
    hint: 'Both loaves are on the one-way loop, and so is one of their doorsteps. Do the whole west loop first, then the east.',
    gold: 22,
  }),
  definePuzzle({
    id: 'melting-point', rev: 1, number: 18, tier: 'challenging', mechanics: ['multi', 'closure', 'fresh'],
    title: 'Melting Point',
    brief: 'Two scoops leave the parlour together. One melts sooner than the other.',
    nodes: grid('abcdefghijklmnop', 4, { D: [1.5, 3.9] }),
    streets: 'a-b-c-d e-f#g-h i-j-k-l m-n o-p a-e#i-m b-f-j-n c-g-k#o d-h-l-p n-D-o',
    depot: 'D', shops: { f: 'icecream', e: 'bakery', j: 'florist' }, houses: { c: 'A', k: 'B', g: 'C', o: 'D' },
    orders: [['f', 'c', 3], ['f', 'k', 4], ['e', 'g'], ['j', 'o']],
    hint: 'Once the scoops are aboard there is time for exactly one route past both houses. Everything else must already be in the basket.',
    gold: 17,
  }),
  definePuzzle({
    id: 'harbour-lights', rev: 1, number: 19, tier: 'challenging', mechanics: ['multi', 'oneway', 'fresh', 'capacity'],
    title: 'Harbour Lights',
    brief: 'The quay runs one way, east. The ice-cream kiosk is busy and the piers are narrow.',
    nodes: { u0: [0, 0], u1: [1, 0], u2: [2, 0], u3: [3, 0], u4: [4, 0], q0: [0, 1.2], q1: [1, 1.2], q2: [2, 1.2], q3: [3, 1.2], q4: [4, 1.2], p1: [1, 2.3], p3: [3, 2.3], D: [2, -1] },
    streets: 'u0-u1-u2-u3-u4 q0>q1>q2>q3>q4 u0-q0 u2-q2 u4-q4 q1~p1 q3~p3 u2-D u1-q1',
    depot: 'D', shops: { q1: 'icecream', q0: 'bakery', p1: 'florist' }, houses: { u0: 'A', u2: 'B', q2: 'C', q3: 'D' },
    orders: [['q1', 'u0', 3], ['q0', 'u2'], ['p1', 'q2'], ['q0', 'q3']],
    capacity: 2,
    hint: 'Deal with the ice cream while the basket is empty. After that, the quay will carry you east whether you like it or not.',
    water: [{ points: [[-0.8, 2.0], [0.4, 1.9], [1.6, 2.7], [2.4, 2.75], [3.6, 2.7], [4.8, 2.1]], width: 0.9 }],
    gold: 20,
  }),
  definePuzzle({
    id: 'the-long-way-home', rev: 1, number: 20, tier: 'challenging', mechanics: ['multi', 'oneway', 'closure', 'fresh', 'capacity'],
    title: 'The Long Way Home',
    brief: 'Five orders, a one-way high street, roadworks and a basket for two. A proper round.',
    nodes: grid('abcdefghijklmnopqrst', 5, { D: [2, 3.95] }),
    streets: 'a-b-c#d-e f-g>h>i>j k-l-m-n-o p-q r-s-t a-f-k-p b-g-l-q c-h-m d-i n-s e-j-o-t q-D-r m#r',
    depot: 'D', shops: { r: 'icecream', n: 'bakery', g: 'florist', c: 'grocer' }, houses: { m: 'A', d: 'B', i: 'C', j: 'D', q: 'E' },
    orders: [['r', 'm', 3], ['n', 'd'], ['g', 'i'], ['c', 'j'], ['n', 'q']],
    capacity: 2,
    hint: 'The ice cream is the first thing you pass. Take it, and plan the rest around a one-way high street you can only ride east.',
    gold: 25,
  }),
];

export const PUZZLE_BY_ID = new Map(PUZZLES.map((p) => [p.id, p]));
