import { PROJECTS } from '../game/meta';
import { C, courierSvg } from './art';
import { seeded } from './geometry';
import { BRONZE, decorArt } from './decorArt';
import { personSvg, type Outfit, type PersonOpts } from './people';
import { NEIGHBOURS } from '../data/neighbours';
import { benchArt, bushArt, flowerBedArt, houseArt, lampArt, pineArt, randomHouseLook, shedArt, shopArt, treeArt } from './sceneryArt';
import type { Theme } from './theme';

/**
 * Pip's home village, drawn in the same three-quarter style as the delivery
 * maps. The hand-made middle (VIEW) holds every project; countryside is
 * scattered around it so the picture fills any screen. Each restored project
 * changes its corner of the village and brings out the resident who asked.
 */

type P2 = [number, number];
type Cubic = [P2, P2, P2, P2];

/** The part of the picture that must always be on screen. */
export const VIEW = { x: -8, y: 52, w: 376, h: 458 };

const LANE: Cubic[] = [
  [[-520, 170], [-300, 150], [-150, 170], [-20, 160]],
  [[-20, 160], [60, 154], [110, 150], [160, 146]],
  [[160, 146], [210, 142], [250, 128], [300, 118]],
  [[300, 118], [350, 108], [420, 96], [620, 90]],
];
const RIVER: Cubic[] = [
  [[250, -420], [255, -150], [262, -20], [300, 60]],
  [[300, 60], [338, 140], [380, 250], [470, 330]],
  [[470, 330], [560, 410], [640, 560], [720, 900]],
];
const pathD = (segs: Cubic[]) => `M${segs[0][0].join(' ')}` + segs.map(([, a, b, c]) => `C${a.join(' ')} ${b.join(' ')} ${c.join(' ')}`).join('');
function sample(segs: Cubic[], n = 32): P2[] {
  const out: P2[] = [];
  for (const [a, b, c, d] of segs) {
    for (let i = 0; i <= n; i++) {
      const u = i / n, v = 1 - u;
      out.push([v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]]);
    }
  }
  return out;
}
/** Meadow Lane, along the bottom, where new neighbours build. */
const MEADOW: Cubic[] = [
  [[-760, 446], [-480, 440], [-220, 448], [-40, 438]],
  [[-40, 438], [120, 428], [300, 444], [520, 432]],
  [[520, 432], [700, 422], [900, 440], [1180, 436]],
];
const MEADOW_PTS = sample(MEADOW);
const LANE_PTS = sample(LANE);
const RIVER_PTS = sample(RIVER);
const distTo = (pts: P2[], x: number, y: number) => Math.min(...pts.map(([px, py]) => Math.hypot(px - x, py - y)));

/** Where each project happens: the sign stands here until it is done. */
export const SITES: Record<string, P2> = {
  lane: [24, 186], boxes: [100, 132], bench: [62, 302], lamps: [160, 186], fountain: [204, 298], bakery: [276, 126],
  orchard: [84, 374], bridge: [296, 152], allotments: [266, 374], bandstand: [266, 278], bunting: [200, 214], fete: [312, 264],
};

/** Decoration spots, each with what grows there until something is placed. */
export const SLOTS: Record<string, { at: P2; filler: 'tree' | 'bush' | 'pine' | 'flowers' }> = {
  s1: { at: [110, 250], filler: 'flowers' }, s2: { at: [190, 100], filler: 'tree' }, s3: { at: [306, 190], filler: 'bush' }, s4: { at: [18, 292], filler: 'pine' },
  s5: { at: [76, 486], filler: 'flowers' }, s6: { at: [178, 476], filler: 'bush' }, s7: { at: [282, 486], filler: 'flowers' },
};
/** Cottage plots along Meadow Lane for the neighbours who move in. */
export const PLOTS: Record<string, P2> = { mabel: [30, 480], bram: [122, 482], ivy: [234, 482], felix: [330, 480] };
const COTTAGES: Record<string, { roof: string; roofShade: string; wall: string; wallShade: string; door: string }> = {
  mabel: { roof: '#C98A4B', roofShade: '#9E6732', wall: '#F3E3B8', wallShade: '#D7C392', door: '#2F5D46' },
  bram: { roof: '#8E7B9B', roofShade: '#6E5D7B', wall: '#E4EBE0', wallShade: '#C6D0C1', door: '#4D6E8C' },
  ivy: { roof: '#B65A55', roofShade: '#8D3F3B', wall: '#F6E7CB', wallShade: '#DCC7A3', door: '#B85C38' },
  felix: { roof: '#7E9A6A', roofShade: '#5F7A4E', wall: '#F4DCD2', wallShade: '#D9BDB1', door: '#8A5A7A' },
};
/** What each neighbour keeps outside their door. */
function tradeArt(id: string): string {
  switch (id) {
    case 'mabel': return [0, 12].map((x) => `<g transform="translate(${x} 0)"><ellipse cx="2" cy="1" rx="6" ry="1.8" ${SHADOW}/><rect x="-5" y="-12" width="10" height="12" rx="1" fill="#FFF6DA" stroke="#B08F3A" stroke-width=".8"/><path d="M-5-8h10M-5-4h10" stroke="#E0B04A" stroke-width="1"/><path d="M-6-12h12l-1-3H-5Z" fill="#B08F3A"/><rect x="-1.4" y="-3" width="2.8" height="1.6" fill="#5C4A3A"/></g>`).join('')
      + `<g class="bees">${[[4, -20], [10, -24], [-2, -26]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.1" fill="#3B2A20"/><circle cx="${x}" cy="${y}" r=".7" fill="#F2CF6E"/>`).join('')}</g>`;
    case 'bram': return `<ellipse cx="2" cy="1" rx="6" ry="1.8" ${SHADOW}/><path d="M0 0V-20" stroke="#3D4A43" stroke-width="2"/><circle cy="-24" r="7" fill="#FFFAF0" stroke="#3D4A43" stroke-width="1.6"/><path d="M0-24v-4.6M0-24l3.4 1.6" stroke="#23352B" stroke-width="1.1" stroke-linecap="round" class="clock-hand"/><circle cy="-24" r=".9" fill="#E0B04A"/>`;
    case 'ivy': return `<ellipse cx="2" cy="1" rx="6" ry="1.8" ${SHADOW}/><rect x="-4.6" y="-15" width="9.2" height="15" rx="1.5" fill="#C8352B" stroke="#8E241D" stroke-width=".8"/><path d="M-4.6-15a4.6 3 0 0 1 9.2 0" fill="#B02E25" stroke="#8E241D" stroke-width=".8"/><rect x="-3" y="-11" width="6" height="1.4" fill="#23352B"/><rect x="-2.2" y="-7" width="4.4" height="3" rx=".6" fill="#FFFAF0" opacity=".85"/>`;
    case 'felix': return `<ellipse cx="2" cy="1" rx="8" ry="2" ${SHADOW}/><path d="M-6 0-1-24M6 0 1-24M0-8V2" stroke="#8C6A45" stroke-width="1.4" stroke-linecap="round"/><rect x="-8" y="-24" width="16" height="12" fill="#FFFAF0" stroke="#7A5C3E" stroke-width=".8"/><path d="M-6-15c3-4 6-4 12-6" fill="none" stroke="#6FA7AE" stroke-width="2"/><circle cx="3" cy="-20" r="2" fill="#E0B04A"/><path d="M-6-14h12" stroke="#7FAF55" stroke-width="1.6"/>`;
    default: return '';
  }
}
const NEIGHBOUR_PROPS: Record<string, PersonOpts> = { mabel: { prop: 'basket' }, bram: { pose: 'wave' }, ivy: { prop: 'tray' }, felix: { pose: 'wave', flip: true } };

const OUTFITS: Record<string, Outfit> = {
  'Mr Fennick': { coat: '#8C6A45', legs: '#3D4A43' },
  'Mrs Pennyworth': { coat: '#8E7BB0', legs: '#5C4A3A', dress: true },
  'Old Albert': { coat: '#6F7D5C', legs: '#4A3F35' },
  'Nell the lamplighter': { coat: '#2F5D46', legs: '#2B2B33' },
  'Rosa Bianchi': { coat: '#B65A55', legs: '#3D4A43', dress: true, apron: true },
  'Captain Moss': { coat: '#2F4A5E', legs: '#1F3344', buttons: true },
  'Priya Shah': { coat: '#5F8747', legs: '#6B4A2E' },
  'The Okafor twinsa': { coat: '#E0B04A', legs: '#2F3E52' },
  'The Okafor twinsb': { coat: '#4FA593', legs: '#2F3E52' },
  'Mr and Mrs Halea': { coat: '#4D6E8C', legs: '#5C4A3A' },
  'Mr and Mrs Haleb': { coat: '#C98A4B', legs: '#3D4A43', dress: true },
};
const BAND: Outfit = { coat: '#B8402F', legs: '#2B2B33', buttons: true };

interface Figure { seed: string; at: P2; o?: PersonOpts }
/** Who comes out when each project is done, and where they stand. */
function residentsOf(id: string, restored: (id: string) => boolean): Figure[] {
  switch (id) {
    case 'lane': return [{ seed: 'Mr Fennick', at: [36, 196], o: { prop: 'broom' } }];
    // Mrs Pennyworth is one person: she stands by the newest of her two projects.
    case 'boxes': return restored('bunting') ? [] : [{ seed: 'Mrs Pennyworth', at: [122, 132], o: { prop: 'can' } }];
    case 'bench': return [{ seed: 'Old Albert', at: [92, 290], o: { pose: 'sit', prop: 'cane' } }];
    case 'lamps': return [{ seed: 'Nell the lamplighter', at: [214, 182], o: { prop: 'pole', flip: true } }];
    case 'fountain': return [
      { seed: 'The Okafor twinsa', at: [130, 286], o: { pose: 'wave' } },
      { seed: 'The Okafor twinsb', at: [200, 288], o: { pose: 'wave', flip: true } },
    ];
    case 'bakery': return [{ seed: 'Rosa Bianchi', at: [212, 124], o: { prop: 'tray' } }];
    case 'orchard': return [
      { seed: 'Mr and Mrs Halea', at: [58, 410], o: { prop: 'basket' } },
      { seed: 'Mr and Mrs Haleb', at: [122, 412], o: { pose: 'wave', flip: true } },
    ];
    case 'bridge': return [{ seed: 'Captain Moss', at: [292, 140], o: { pose: 'wave' } }];
    case 'allotments': return [{ seed: 'Priya Shah', at: [214, 410], o: { prop: 'spade' } }];
    case 'bunting': return [{ seed: 'Mrs Pennyworth', at: [74, 232], o: { pose: 'wave' } }];
    case 'fete': return [
      { seed: 'Everyone0', at: [284, 314], o: { prop: 'balloon', colour: '#D4688A' } },
      { seed: 'Everyone1', at: [310, 320], o: { prop: 'cake' } },
      { seed: 'Everyone2', at: [338, 312], o: { prop: 'balloon', colour: '#4FA593', flip: true } },
      { seed: 'Everyone3', at: [284, 278], o: { pose: 'wave' } },
    ];
    default: return [];
  }
}
const PROJECT_OF = new Map(PROJECTS.map((p) => [p.id, p]));

const f1 = (n: number) => (Math.round(n * 10) / 10).toString();
/**
 * Place art at (x, y). Any class goes on an inner group: CSS animations set
 * `transform`, which would otherwise replace the positioning transform.
 */
const at = (x: number, y: number, svg: string, cls = '', extra = '') => `<g transform="translate(${f1(x)} ${f1(y)})"${extra}>${cls ? `<g class="${cls}">${svg}</g>` : svg}</g>`;
const SHADOW = 'fill="#23352B" opacity=".17"';

/** A hedged plot, like the gardens on the delivery maps. */
function plot(t: Theme, x: number, y: number, w: number, h: number, fill: string): string {
  return `<rect x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${h + 12}" rx="14" fill="${t.hedgeDeep}"/>`
    + `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${fill}"/>`
    + `<rect x="${x - 3}" y="${y - 3}" width="${w + 6}" height="${h + 6}" rx="12" fill="none" stroke="${t.hedge}" stroke-width="7" stroke-dasharray="0 10" stroke-linecap="round"/>`;
}

function signArt(cost: number, ready: boolean): string {
  return `<g class="v-sign${ready ? ' ready' : ''}">
    <ellipse cx="2" cy="1" rx="9" ry="2.6" ${SHADOW}/>
    <path d="M0 0V-16" stroke="#6E5236" stroke-width="2.4" stroke-linecap="round"/>
    ${ready ? '<circle cx="0" cy="-22" r="16" fill="#FFE7A8" opacity=".55" class="v-sign-glow"/>' : ''}
    <rect x="-13" y="-30" width="26" height="15" rx="3" fill="${ready ? '#FFF6DD' : '#E9DCC0'}" stroke="#8C6A45" stroke-width="1.4"/>
    <path d="M-7-22.6c-2.2-1.8-2.4-4-.8-4.8 1-.5 2 0 2.4.8.4-.8 1.4-1.3 2.4-.8 1.6.8 1.4 3-.8 4.8L-6-21.2Z" fill="#D4688A" transform="translate(1 0)"/>
    <text x="4" y="-18.8" font-size="8.6" font-weight="800" text-anchor="middle" fill="#8E4127" font-family="Nunito, system-ui, sans-serif">${cost}</text>
  </g>`;
}

function pigeon(x: number, y: number, flip: boolean, i: number): string {
  return at(x, y, `<g${flip ? ' transform="scale(-1 1)"' : ''}><g class="pigeon" style="animation-delay:${-i * 0.7}s"><ellipse cx="1" cy="1.6" rx="3.4" ry="1" ${SHADOW}/><ellipse rx="3.2" ry="2.1" fill="#9AA3A8"/><path d="M-3-.4-5.4.6-3 1" fill="#7E878C"/><circle cx="2.6" cy="-1.6" r="1.5" fill="#7E878C"/><path d="M4-1.5l1.3.4-1.3.4" fill="#E0B04A"/></g></g>`);
}

function bandstandArt(t: Theme, painted: boolean, band: string): string {
  const post = painted ? '#FFFAF0' : '#BEB6A8';
  const roof = painted ? C.terracotta : '#9A928A';
  const roofShade = painted ? C.terracottaDeep : '#7F786F';
  let s = `<ellipse cx="4" cy="6" rx="27" ry="9" ${SHADOW}/>`;
  s += `<ellipse cx="0" cy="2" rx="25" ry="8.6" fill="#B9A988"/><ellipse cx="0" cy="0" rx="24" ry="8" fill="#E9DFC9" stroke="#9E8B6A" stroke-width="1"/>`;
  s += [-18, 18].map((x) => `<path d="M${x} -1V-26" stroke="${post}" stroke-width="2.6"/>`).join('');
  s += band;
  s += [-21, -7, 7, 21].map((x) => `<path d="M${x} 1V-25" stroke="${post}" stroke-width="2.8"/><path d="M${x} 1V-25" stroke="#7A5C3E" stroke-width="2.8" stroke-opacity=".25"/>`).join('');
  s += painted
    ? `<path d="M-23-4Q0 2 23-4" fill="none" stroke="${post}" stroke-width="1.6"/>`
    : `<path d="M-23-4Q-12-1 -4-2M8-1 23-4" fill="none" stroke="${post}" stroke-width="1.6"/>`;
  s += `<path d="M-28-24 0-42 28-24Q0-18 -28-24Z" fill="${roof}" stroke="${roofShade}" stroke-width="1.2" stroke-linejoin="round"/>`;
  s += `<path d="M0-42 28-24Q14-21 0-21Z" fill="${roofShade}" opacity=".45"/>`;
  s += painted
    ? `<path d="M-28-24Q-21-20-14-23Q-7-19 0-22Q7-19 14-23Q21-20 28-24" fill="none" stroke="#FFFAF0" stroke-width="1.6"/><path d="M0-42v-9" stroke="#6E5236" stroke-width="1.2"/><path d="M0-51l8 2.4-8 2.4z" fill="${C.mustard}"/>`
    : `<path d="M-12-31l4 3M10-34l3 4" stroke="#7F786F" stroke-width="1.2"/>`;
  void t;
  return s;
}

function fountainBig(t: Theme, running: boolean): string {
  const water = running ? t.water : '#CBBFA6';
  let s = `<ellipse cx="5" cy="7" rx="30" ry="13" ${SHADOW}/>`;
  s += `<ellipse cx="0" cy="2" rx="29" ry="13.6" fill="#BFAE8E"/><ellipse cx="0" cy="0" rx="28" ry="13" fill="#E3D6BA" stroke="#9E8B6A" stroke-width="1.2"/>`;
  s += `<ellipse cx="0" cy="-.6" rx="22.5" ry="9.6" fill="${water}"/>`;
  if (running) {
    s += `<ellipse cx="-6" cy="-3" rx="8" ry="2.4" fill="${t.waterHi}" opacity=".7"/>`;
    s += `<ellipse class="ripple" cx="0" cy="-.6" rx="8" ry="3.4" fill="none" stroke="${t.waterHi}" stroke-width="1"/><ellipse class="ripple r2" cx="0" cy="-.6" rx="8" ry="3.4" fill="none" stroke="${t.waterHi}" stroke-width="1"/>`;
  } else {
    s += `<path d="M-14-2l5 2 3-3 6 3M6 2l5-2 4 2" fill="none" stroke="#A8987A" stroke-width=".9"/>`;
    s += [[-9, -3, '#C46A3E'], [5, -4, '#D9853C'], [12, 1, '#9C4A2E']].map(([x, y, c]) => `<path d="M${x} ${y}l3-1.6 1.6 2.6z" fill="${c}"/>`).join('');
  }
  s += `<path d="M-3.4-1V-17h6.8V-1Z" fill="#D9CCB2" stroke="#9E8B6A" stroke-width="1"/>`;
  s += `<ellipse cx="0" cy="-17" rx="9" ry="3.4" fill="#E3D6BA" stroke="#9E8B6A" stroke-width="1"/><ellipse cx="0" cy="-17.4" rx="6.6" ry="2.2" fill="${water}"/>`;
  s += `<path d="M-1.6-17.4V-24h3.2v6.6" fill="#D9CCB2" stroke="#9E8B6A" stroke-width=".8"/>`;
  if (running) {
    s += `<g class="jets" fill="none" stroke="${t.waterHi}" stroke-width="1.8" stroke-linecap="round">`
      + `<path class="jet" d="M0-25C-6-31-13-22-15-6"/><path class="jet" d="M0-25C6-31 13-22 15-6"/><path class="jet j2" d="M0-25C-3-34-8-24-9-18"/><path class="jet j2" d="M0-25C3-34 8-24 9-18"/></g>`;
    s += [-15, -9, 9, 15].map((x, i) => `<circle class="drop" cx="${x}" cy="-6" r="1.2" fill="${t.waterHi}" style="animation-delay:${i * 0.18}s"/>`).join('');
  }
  return s;
}

function bridgeArt(built: boolean): string {
  if (!built) {
    return `<g><path d="M-29-8H-14V8H-29Z" fill="#7A5A3A"/><path d="M-28-6H-15V6H-28Z" fill="#E2C79A"/><path d="M14-8H29V8H14Z" fill="#7A5A3A"/><path d="M15-6H28V6H15Z" fill="#E2C79A"/>`
      + `<path d="M-16-6-12-2M14 6 11 3" stroke="#7A5A3A" stroke-width="2"/><rect x="-3" y="12" width="12" height="3.4" rx="1" fill="#C9A877" transform="rotate(24)"/></g>`;
  }
  let s = `<rect x="-31" y="-11" width="62" height="22" rx="3" fill="#7A5A3A"/><rect x="-30" y="-8.6" width="60" height="17.2" fill="#E2C79A"/>`;
  for (let x = -27; x <= 27; x += 6) s += `<path d="M${x}-8.6v17.2" stroke="#C9A877" stroke-width="1.6"/>`;
  s += `<path d="M-30-10H30M-30 10H30" stroke="#6E5236" stroke-width="2.4" stroke-linecap="round"/>`;
  s += [-30, -15, 0, 15, 30].map((x) => `<path d="M${x}-10v-4M${x} 10v-4" stroke="#6E5236" stroke-width="2.4" stroke-linecap="round"/>`).join('');
  s += `<path d="M-30-14H30" stroke="#8C6A45" stroke-width="1.6" stroke-linecap="round"/>`;
  return s;
}

function tent(c: string, s = 1): string {
  return `<g transform="scale(${s})"><ellipse cx="4" cy="10" rx="20" ry="5.4" ${SHADOW}/><path d="M-17 8V-4L0-17 17-4V8Z" fill="#FFFAF0" stroke="#7A5C3E" stroke-width=".9" stroke-linejoin="round"/>${[-12.6, -4.2, 4.2, 12.6].map((x) => `<path d="M${x} -5.4V8" stroke="${c}" stroke-width="4.2"/>`).join('')}<path d="M-17-4 0-17 17-4" fill="none" stroke="${c}" stroke-width="2.4" stroke-linejoin="round"/><path d="M0-17v-7" stroke="#7A5C3E"/><path d="M0-24l7 2.2-7 2.2z" fill="${c}"/></g>`;
}

export interface VillageArtOpts {
  theme: Theme;
  restored: ReadonlySet<string>;
  kept: ReadonlySet<string>;
  /** What just happened, to celebrate: a project id, 'slot:<id>' or 'nb:<id>'. */
  fresh: string | null;
  /** Decorations by spot. */
  placed: Readonly<Record<string, string>>;
  /** Show the spots a decoration can go (while placing one). */
  placing: boolean;
  /** Neighbours who have moved in. */
  neighbours: ReadonlySet<string>;
  /** Signposts: every project there are hearts enough for, and the next one to save up for. */
  signs: { id: string; cost: number; ready: boolean }[];
  animate: boolean;
}

export function villageArt(o: VillageArtOpts): string {
  const t = o.theme;
  const on = (id: string) => o.restored.has(id);
  const pop = (id: string) => (id === o.fresh ? 'just-restored' : '');
  const rnd = seeded('village');
  const wide = seeded('village-wide');
  const lane = pathD(LANE), river = pathD(RIVER);
  const big = { x: -460, y: -160, w: 1280, h: 720 };
  const items: { y: number; svg: string }[] = [];
  const add = (y: number, svg: string) => items.push({ y, svg });

  let s = `<rect x="${big.x}" y="${big.y}" width="${big.w}" height="${big.h}" fill="${t.lawn}"/><rect x="${big.x}" y="${big.y}" width="${big.w}" height="${big.h}" fill="url(#v-tufts)"/>`;

  // ── Countryside around the village: hedged fields, then trees and cottages. ──
  const core = (x: number, y: number, m: number) => x > -m && x < 360 + m && y > 40 - m && y < 514 + m;
  const fields: { x: number; y: number; w: number; h: number }[] = [];
  for (const [fx, fy] of [[-200, 40], [-330, 180], [-170, 260], [-360, -20], [400, 150], [540, 40], [420, 300], [580, 260], [-60, 560], [120, 566], [260, 562], [-250, 400], [480, 430], [60, -110], [-120, -100]] as P2[]) {
    const w = 110 + wide() * 60, h = 72 + wide() * 40;
    const x = fx + (wide() - 0.5) * 30, y = fy + (wide() - 0.5) * 20;
    const cx = x + w / 2, cy = y + h / 2, r = Math.max(w, h) / 2;
    if (core(cx, cy, r + 10) || distTo(LANE_PTS, cx, cy) < r + 22 || distTo(MEADOW_PTS, cx, cy) < r + 20 || distTo(RIVER_PTS, cx, cy) < r + 30) continue;
    fields.push({ x, y, w, h });
    s += plot(t, Math.round(x), Math.round(y), Math.round(w), Math.round(h), ['url(#v-rows)', 'url(#v-stripes)', t.meadow][Math.floor(wide() * 3)]);
  }
  for (let y = big.y + 20; y < big.y + big.h; y += 30) {
    for (let x = big.x + 20; x < big.x + big.w; x += 30) {
      const px = x + (wide() - 0.5) * 22, py = y + (wide() - 0.5) * 22;
      const roll = wide(), tone = Math.floor(wide() * 8), sc = 0.9 + wide() * 0.3;
      if (core(px, py, 6) || distTo(LANE_PTS, px, py) < 28 || distTo(MEADOW_PTS, px, py) < 24 || distTo(RIVER_PTS, px, py) < 34) continue;
      if (fields.some((f) => px > f.x - 12 && px < f.x + f.w + 12 && py > f.y - 14 && py < f.y + f.h + 8)) continue;
      const art = roll < 0.3 ? treeArt(t, tone, sc) : roll < 0.42 ? pineArt(t, sc) : roll < 0.5 ? bushArt(t, sc) : roll < 0.54 ? flowerBedArt(t, tone, sc) : roll < 0.57 ? houseArt(randomHouseLook(wide, t.lit), 0.95) : '';
      if (art) add(py, at(px, py, art));
    }
  }

  // ── Ground: the green, the two plots, river and lane. ──
  s += `<ellipse cx="165" cy="262" rx="104" ry="58" fill="${t.hedgeDeep}"/><ellipse cx="165" cy="262" rx="98" ry="53" fill="url(#v-stripes)"/>`;
  s += `<ellipse cx="165" cy="262" rx="101" ry="55.5" fill="none" stroke="${t.hedge}" stroke-width="7" stroke-dasharray="0 10" stroke-linecap="round"/>`;
  s += `<ellipse cx="165" cy="266" rx="40" ry="20" fill="${t.paving}" stroke="${t.pavingLine}" stroke-width="1.2"/>`;
  s += `<path d="M165 286V318M100 264H125M205 262H214" stroke="${t.paving}" stroke-width="8" stroke-linecap="round"/>`;
  // Meadow Lane, where new neighbours build, joined to the green by a path between the plots.
  const meadow = pathD(MEADOW);
  s += `<path d="M168 316Q174 330 176 344V438" fill="none" stroke="${t.pavingLine}" stroke-width="13" stroke-linecap="round"/><path d="M168 316Q174 330 176 344V438" fill="none" stroke="${t.paving}" stroke-width="10" stroke-linecap="round"/>`;
  s += `<path d="${meadow}" fill="none" stroke="${C.kerb}" stroke-width="24" stroke-linecap="round"/><path d="${meadow}" fill="none" stroke="${C.road}" stroke-width="17" stroke-linecap="round"/>`;
  s += plot(t, 16, 334, 136, 78, on('orchard') ? t.meadow : t.lawn);
  s += plot(t, 198, 334, 140, 78, on('allotments') ? t.soil : t.meadow);
  s += `<path d="${lane}" fill="none" stroke="${C.kerb}" stroke-width="30" stroke-linecap="round"/><path d="${lane}" fill="none" stroke="${C.road}" stroke-width="22" stroke-linecap="round"/>`;
  s += `<path d="${lane}" fill="none" stroke="#E4D6B6" stroke-width="2.2" stroke-dasharray="10 14"/>`;
  s += `<path d="${river}" fill="none" stroke="${t.bank}" stroke-width="54" stroke-linecap="round"/><path d="${river}" fill="none" stroke="#8C6A45" stroke-opacity=".22" stroke-width="40"/>`;
  s += `<path d="${river}" fill="none" stroke="${t.water}" stroke-width="36" stroke-linecap="round"/><path d="${river}" fill="none" stroke="${t.waterDeep}" stroke-opacity=".45" stroke-width="15"/>`;
  s += `<path d="${river}" class="v-shimmer" fill="none" stroke="${t.waterHi}" stroke-opacity=".55" stroke-width="2" stroke-dasharray="12 40" stroke-linecap="round" transform="translate(-6 0)"/>`;
  // The footbridge goes over the river, which cuts the lane.
  s += at(323, 112, `<g transform="rotate(-11)">${bridgeArt(on('bridge'))}</g>`, pop('bridge'));
  if (on('bridge')) s += at(352, 176, `<g class="boat"><path d="M-12 0H12L8 6H-8Z" fill="#B85C38" stroke="#8E4127" stroke-width=".8"/><path d="M-10 0H10" stroke="#FFFAF0" stroke-width="1.4"/><path d="M-4-1 6-7" stroke="#8C6A45" stroke-width="1.2"/></g>`, pop('bridge'));
  else s += at(350, 168, `<rect x="-6" y="-1.6" width="12" height="3.2" rx="1" fill="#C9A877" transform="rotate(-20)"/>`);

  // ── Sweep the lane: leaves and puddles until it's done. ──
  if (!on('lane')) {
    LANE_PTS.filter(([x]) => x > -10 && x < 300).forEach(([x, y], i) => {
      if (i % 2) return;
      const dx = (rnd() - 0.5) * 18, dy = (rnd() - 0.5) * 12;
      s += i % 6 === 0 ? `<ellipse cx="${f1(x + dx)}" cy="${f1(y + dy)}" rx="8" ry="3.4" fill="#B9AE98" opacity=".85"/>` : `<path d="M${f1(x + dx)} ${f1(y + dy)}l3.4-2.2 2.2 3.4z" fill="${['#C46A3E', '#D9853C', '#9C4A2E'][i % 3]}"/>`;
    });
    s += `<path d="M84 146 112 158" stroke="#6E5236" stroke-width="3.4" stroke-linecap="round"/><path d="M96 151l4-7M104 155l6-3" stroke="#6E5236" stroke-width="1.8" stroke-linecap="round"/>`;
  } else {
    s += `<g class="${pop('lane')}"><path d="${pathD(LANE.slice(0, 3))}" fill="none" stroke="#FFFDF6" stroke-opacity=".7" stroke-width="7" transform="translate(-1 -2)"/></g>`;
    add(190, at(16, 190, `<g class="${pop('lane')}"><ellipse cx="2" cy="2" rx="12" ry="3" ${SHADOW}/>${[[-6, 0, '#C46A3E'], [0, -3, '#D9853C'], [5, 0, '#9C4A2E'], [-2, -1, '#E0A04A'], [2, -5, '#C46A3E']].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="3.4" fill="${c}"/>`).join('')}</g>`));
    add(198, at(56, 198, `<g class="${pop('lane')}"><ellipse cx="2" cy="1" rx="14" ry="2.6" ${SHADOW}/><g transform="scale(.55) translate(0 -14)">${courierBike()}</g></g>`));
  }

  // ── Cottages along the lane, with window boxes once they're planted. ──
  const looks = [0, 1, 2].map(() => randomHouseLook(rnd, t.lit));
  ([[38, 116], [92, 108], [148, 116]] as P2[]).forEach(([x, y], i) => {
    add(y, at(x, y, houseArt({ ...looks[i], flowers: on('boxes') }, 1.4), on('boxes') ? pop('boxes') : ''));
    if (on('boxes')) add(y + 6, at(x + 12, y + 6, `<g class="${pop('boxes')}">${flowerBedArt(t, i, 0.75)}</g>`));
    else if (i === 1) add(y + 8, at(x + 12, y + 8, `<path d="M-3 0h6l-1 4h-4z" fill="#B98D63"/><path d="M0 0c-2-4-4-3-5-5M0 0c1-4 3-4 4-6" stroke="#8C7B66" stroke-width="1" fill="none"/>`));
  });

  // ── The bakery: boarded up, then open with bread outside and the oven going. ──
  const bakery = on('bakery')
    ? `${shopArt('bakery', true, 1.5)}<g class="smoke">${[0, 1, 2].map((i) => `<circle cx="-9" cy="-34" r="${3 + i}" fill="#FFFFFF" opacity=".55" style="animation-delay:${i * 1.1}s"/>`).join('')}</g>`
    : `${shopArt('bakery', false, 1.5)}<g transform="scale(1.5)"><rect x="-16" y="-14" width="32" height="27" fill="#8C7B66" opacity=".55"/><path d="M-14 1 13 9M-14 9 13 1" stroke="#7A5A3A" stroke-width="3" stroke-linecap="round"/><rect x="-10" y="-12.6" width="20" height="6.6" rx="1" fill="#FFFAF0" stroke="#7A5A3A" stroke-width=".6"/><text y="-7.8" font-size="4.6" text-anchor="middle" fill="#8E4127" font-weight="800" font-family="Nunito, system-ui, sans-serif">CLOSED</text></g>`;
  add(100, at(240, 100, bakery, pop('bakery')));
  if (on('bakery')) add(122, at(270, 122, `<g class="${pop('bakery')}"><path d="M-6 6-4-8H4L6 6" fill="#FFFAF0" stroke="#7A5C3E" stroke-width="1"/><path d="M-4-4h8M-4-1h8" stroke="#D9973F" stroke-width="1.6"/><ellipse cx="0" cy="-10" rx="4" ry="2.2" fill="#D9973F" stroke="#9A6420" stroke-width=".6"/></g>`));

  // ── Lamps along the lane. ──
  const lamps: P2[] = [[60, 178], [128, 170], [194, 162], [258, 146]];
  lamps.forEach(([x, y], i) => add(y, at(x, y, `<g transform="scale(1.45)${!on('lamps') && i === 2 ? ' rotate(10)' : ''}">${lampArt(on('lamps'))}</g>`, on('lamps') ? pop('lamps') : '')));

  // ── On the green: fountain, bench, bandstand. ──
  add(266, at(165, 266, fountainBig(t, on('fountain')), pop('fountain')));
  add(290, at(92, 290, on('bench') ? `<g transform="scale(1.6)">${benchArt()}</g>` : `<g transform="scale(1.6)"><g transform="rotate(16)">${benchArt()}</g><path d="M4 4l6-1" stroke="#A87A50" stroke-width="2.2" stroke-linecap="round"/></g>`, pop('bench')));
  if (on('bench')) [[72, 302, false], [108, 304, true], [118, 296, false]].forEach(([x, y, f], i) => add(y as number, pigeon(x as number, y as number, f as boolean, i)));
  const band = on('bandstand')
    ? [personSvg('The Brass Club0', { prop: 'tuba', outfit: BAND }), personSvg('The Brass Club1', { prop: 'trumpet', outfit: BAND }), personSvg('The Brass Club2', { prop: 'drum', outfit: BAND })]
      .map((p, i) => at([-11, 0, 11][i], [0, -2, 0][i], `<g transform="scale(.62)"><g class="villager-bob" style="animation-delay:${-i * 0.4}s">${p}</g></g>`)).join('')
    : '';
  const bandG = on('bandstand')
    ? `<g class="villager${o.fresh === 'bandstand' ? ' resident-arrive' : ''}" data-project="bandstand" tabindex="0" role="button" aria-label="The Brass Club: read their note"><rect x="-30" y="-52" width="60" height="62" rx="10" fill="#000" fill-opacity="0"/>${bandstandArt(t, true, band)}</g>`
    : bandstandArt(t, false, '');
  add(256, at(238, 256, bandG, pop('bandstand')));
  if (on('bandstand')) add(200, at(238, 196, `<g class="notes">${['♪', '♫', '♪'].map((n, i) => `<text x="${i * 8 - 8}" y="0" font-size="11" fill="${C.forest}" style="animation-delay:${i * 0.9}s">${n}</text>`).join('')}</g>`));

  // ── Orchard: stakes, then apple trees with a ladder and a full basket. ──
  if (on('orchard')) {
    ([[36, 360], [70, 358], [104, 360], [138, 358], [52, 394], [86, 392], [120, 394]] as P2[]).forEach(([x, y], i) =>
      add(y, at(x, y, `<g class="${pop('orchard')}">${treeArt(t, i % 2, 0.95)}${[[-4, -14], [5, -11], [-1, -20], [7, -18]].map(([ax, ay]) => `<circle cx="${ax}" cy="${ay}" r="1.9" fill="#C8483A"/>`).join('')}</g>`)));
    add(362, at(110, 362, `<g class="${pop('orchard')}"><path d="M-3 0 1-22M3 0 7-22" stroke="#8C6A45" stroke-width="1.4"/>${[-4, -8, -12, -16, -20].map((y) => `<path d="M${-3 + (y / -22) * 4} ${y}h6" stroke="#8C6A45" stroke-width="1.2"/>`).join('')}</g>`));
  } else {
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) s += `<path d="M${36 + c * 34 + r * 16} ${362 + r * 32}v-11" stroke="#8C6A45" stroke-width="2.2" stroke-linecap="round"/><path d="M${33 + c * 34 + r * 16} ${355 + r * 32}l3 2 3-2" stroke="${t.leaves[0].mid}" stroke-width="1.4" fill="none"/>`;
    add(404, at(130, 404, `<ellipse cx="2" cy="3" rx="12" ry="3" ${SHADOW}/><path d="M-10-4h14l-2 7h-10z" fill="#8C8F86" stroke="#5E6A66" stroke-width=".8"/><circle cx="-8" cy="3" r="2.6" fill="#3D4A43"/><path d="M4-4l8-4" stroke="#6E5236" stroke-width="1.6"/><path d="M-6-5c0-6 2-8 4-9M-2-5c1-5 3-6 5-8" stroke="${t.leaves[0].dark}" stroke-width="1.4" fill="none"/>`));
  }

  // ── Allotments: nettles and long grass, then rows, cabbages, scarecrow and shed. ──
  if (on('allotments')) {
    let a = '';
    for (let i = 0; i < 6; i++) a += `<rect x="206" y="${342 + i * 11}" width="104" height="6" rx="3" fill="${t.crop}"/>`;
    for (let i = 0; i < 6; i++) a += `<circle cx="${214 + i * 17}" cy="${347 + (i % 2) * 22}" r="3.6" fill="${t.leaves[0].light}" stroke="${t.leaves[0].dark}" stroke-width=".8"/>`;
    s += `<g class="${pop('allotments')}">${a}</g>`;
    add(346, at(326, 346, `<g transform="scale(1.5)">${shedArt()}</g>`, pop('allotments')));
    add(372, at(300, 372, `<g class="${pop('allotments')} scarecrow"><path d="M0 2V-20M-8-14H8" stroke="#8C6A45" stroke-width="1.6" stroke-linecap="round"/><path d="M-5-15h10l-1 8h-8z" fill="#B85C38"/><circle cy="-21" r="3.6" fill="#E3D6BA" stroke="#8C6A45" stroke-width=".7"/><path d="M-5-23h10l-2-3h-6z" fill="#7A5A3A"/></g>`));
  } else {
    for (let i = 0; i < 18; i++) {
      const x = 206 + rnd() * 124, y = 342 + rnd() * 64;
      s += `<path d="M${f1(x)} ${f1(y)}l2-7 2 7M${f1(x + 3)} ${f1(y)}l2-5 1 5" stroke="${i % 3 ? t.hedgeDeep : t.leaves[1].dark}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    }
  }

  // ── The fete: tents, a cake table and bunting on the riverside meadow. ──
  if (on('fete')) {
    add(232, at(296, 232, tent('#D4688A', 1.1), pop('fete')));
    add(268, at(336, 268, tent('#4FA593', 1.1), pop('fete')));
    add(300, at(318, 292, `<g class="${pop('fete')}"><ellipse cx="2" cy="5" rx="16" ry="3" ${SHADOW}/><rect x="-14" y="-4" width="28" height="7" rx="1.4" fill="#FFFAF0" stroke="#D9CCB2"/><path d="M-14-1h28" stroke="#E77D9C" stroke-width="1.2" stroke-dasharray="3 3"/>${[-8, 0, 8].map((x, i) => `<rect x="${x - 3}" y="-9" width="6" height="5" rx="1" fill="${['#F7CFDC', '#E7A95A', '#FFF6DA'][i]}" stroke="#C77B95" stroke-width=".4"/>`).join('')}</g>`));
  }

  // ── Keepsakes from seasonal events and finished chapters. ──
  const k = o.kept;
  if (k.has('blossom')) add(236, at(26, 236, treeArt({ ...t, leaves: [{ dark: '#C77B95', mid: '#E9A5BC', light: '#F7CFDC' }] }, 0, 1.3)));
  if (k.has('harvest')) add(326, at(150, 326, [0, 1, 2].map((i) => `<ellipse cx="${i * 12}" cy="0" rx="6" ry="5" fill="#E8833A" stroke="#9C4C17"/><path d="M${i * 12} -5v-3" stroke="#5C9A4A" stroke-width="1.6"/>`).join('')));
  if (k.has('winter')) add(304, at(46, 304, `<path d="M0-30 14 6H-14Z" fill="#3D5E46"/><path d="M0-30 6 6H-14Z" fill="#54775A"/>${[[-6, -2], [4, -12], [7, 2], [-2, -18]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="2" fill="${['#FFD98A', '#E77D9C', '#FFFFFF', '#FFD98A'][i]}"/>`).join('')}<path d="M0-34l2.4 3.4h-4.8z" fill="#E0B04A"/>`));
  if (k.has('fete')) add(318, at(30, 318, tent('#D4688A', 0.8)));
  if (k.has('bicycle')) add(196, at(190, 196, `<g transform="scale(.6) translate(0 -14)">${courierBike()}</g>`));
  if (k.has('breadcart')) add(166, at(292, 166, `<ellipse cx="2" cy="10" rx="16" ry="3" ${SHADOW}/><rect x="-13" y="-6" width="24" height="12" rx="2" fill="#D9973F" stroke="#9A6420"/><path d="M-13-6 0-13 11-6" fill="#FFFAF0" stroke="#9A6420"/><circle cx="-7" cy="8" r="3" fill="#6E5236"/><circle cx="6" cy="8" r="3" fill="#6E5236"/>`));
  if (k.has('gates')) add(326, at(184, 326, `<path d="M-8-9v18M8-9v18" stroke="#3E6E9A" stroke-width="2.6" stroke-linecap="round"/><path d="M-8-4H8M-8 4H8M-3-4V4M3-4V4" stroke="#5B8BC9" stroke-width="2"/>`));
  if (k.has('arch')) add(212, at(44, 212, `<path d="M-13 10V-2A13 13 0 0 1 13-2V10" fill="none" stroke="#8C6A45" stroke-width="2.6"/>${[-11, -6, 0, 6, 11].map((x, i) => `<circle cx="${x}" cy="${i === 2 ? -14 : i % 4 === 0 ? -1 : -10}" r="2.8" fill="${['#F7CFDC', '#FFFFFF', '#E77D9C', '#FFFFFF', '#F7CFDC'][i]}"/>`).join('')}`));
  if (k.has('ferry')) s += at(372, 214, `<path d="M-14 0H14L10 7H-10Z" fill="#B85C38" stroke="#8E4127"/><rect x="-6" y="-7" width="12" height="7" rx="1.5" fill="#FFFAF0" stroke="#7A5C3E"/>`);
  if (k.has('streamers')) {
    let f = '';
    for (let i = 0; i < 12; i++) f += `<path d="M${200 + i * 12} ${330 + Math.sin((i / 11) * Math.PI) * 5}h7l-3.5 6z" fill="${['#E0B04A', '#4FA593', '#D4688A'][i % 3]}"/>`;
    s += `<path d="M196 328Q268 340 340 326" fill="none" stroke="#7A5C3E" stroke-width="1"/>${f}`;
  }

  // ── A few trees and bushes so the village isn't bare between projects. ──
  const filler = (kind: string, i: number) => kind === 'tree' ? treeArt(t, i % 3, 1.1) : kind === 'pine' ? pineArt(t, 1.1) : kind === 'bush' ? bushArt(t, 1.1) : flowerBedArt(t, i % 3, 1);
  ([[14, 336, 'bush'], [336, 404, 'tree']] as [number, number, string][]).forEach(([x, y, kind], i) => add(y, at(x, y, filler(kind, i))));

  // ── Decorations from the shop, each in its spot (or what grows there until then). ──
  Object.entries(SLOTS).forEach(([slot, { at: [x, y], filler: kind }], i) => {
    const id = o.placed[slot];
    add(y, at(x, y, id ? decorArt(id, t) : filler(kind, i), o.fresh === `slot:${slot}` ? 'just-restored' : ''));
  });

  // ── Meadow Lane: a cottage for each neighbour who has moved in, a plot for the rest. ──
  for (const nb of NEIGHBOURS) {
    const [x, y] = PLOTS[nb.id];
    const fresh = o.fresh === `nb:${nb.id}`;
    s += `<rect x="${x - 27}" y="${y - 30}" width="54" height="36" rx="6" fill="${o.neighbours.has(nb.id) ? t.garden[0] : t.meadow}" opacity=".9"/>`;
    if (o.neighbours.has(nb.id)) {
      add(y, at(x, y, houseArt({ ...COTTAGES[nb.id], lit: t.lit, chimney: true, flowers: true }, 1.35), fresh ? 'just-restored' : ''));
      add(y - 2, at(x + 26, y - 2, tradeArt(nb.id), fresh ? 'just-restored' : ''));
      add(y + 10, at(x - 14, y + 10, `<g transform="scale(.9)"><rect x="-13" y="-44" width="26" height="48" rx="8" fill="#000" fill-opacity="0"/><g class="villager-bob">${personSvg(nb.name, NEIGHBOUR_PROPS[nb.id])}</g></g>`, fresh ? 'resident-arrive' : '',
        ` class="villager" data-neighbour="${nb.id}" tabindex="0" role="button" aria-label="${nb.name}: see their requests"`));
    } else {
      add(y, at(x, y, `<g class="v-plot" data-neighbour="${nb.id}" role="button" tabindex="0" aria-label="Plot for ${nb.name}: ${nb.cost} coins">
        <rect x="-26" y="-30" width="52" height="38" fill="#000" fill-opacity="0"/>
        <path d="M-24-26H24V4H-24Z" fill="none" stroke="#B9A57E" stroke-width="1.6" stroke-dasharray="2 4"/>
        <path d="M0 2V-16" stroke="#6E5236" stroke-width="2.2" stroke-linecap="round"/>
        <rect x="-14" y="-29" width="28" height="14" rx="3" fill="#FFF6DD" stroke="#8C6A45" stroke-width="1.3"/>
        <circle cx="-7" cy="-22" r="4" fill="#E0B04A" stroke="#A67C1E" stroke-width=".8"/><text x="4" y="-18.8" font-size="8.4" font-weight="800" text-anchor="middle" fill="#8E4127" font-family="Nunito, system-ui, sans-serif">${nb.cost}</text>
      </g>`));
    }
  }

  // ── The people who came back. ──
  for (const p of PROJECTS) {
    if (!on(p.id)) continue;
    for (const [i, fig] of residentsOf(p.id, on).entries()) {
      const outfit = OUTFITS[fig.seed];
      const person = personSvg(fig.seed, { outfit, ...fig.o });
      const who = PROJECT_OF.get(p.id)!.resident;
      const arrive = p.id === o.fresh ? 'resident-arrive' : '';
      add(fig.at[1], at(fig.at[0], fig.at[1], `<g transform="scale(.9)"><rect x="-13" y="-44" width="26" height="48" rx="8" fill="#000" fill-opacity="0"/><g class="villager-bob" style="animation-delay:${-((fig.at[0] * 7 + i * 13) % 30) / 10}s">${person}</g></g>`, arrive,
        ` class="villager" data-project="${p.id}" tabindex="0" role="button" aria-label="${who}: read their note"`));
    }
  }

  // ── Signposts: glowing where a project can be done now. ──
  for (const sign of o.signs) {
    const [x, y] = SITES[sign.id];
    add(y, at(x, y, signArt(sign.cost, sign.ready)));
  }

  // Pip, out on the round.
  const ride = pathD(on('bridge') ? LANE.slice(1) : LANE.slice(1, 3));
  add(150, `<g class="v-courier"${o.animate ? '' : ' transform="translate(178 146)"'}><g transform="translate(0 -12) scale(.72)">${courierSvg()}</g>${o.animate ? `<animateMotion dur="16s" repeatCount="indefinite" path="${ride}"/><animate attributeName="opacity" dur="16s" repeatCount="indefinite" values="0;1;1;0" keyTimes="0;.05;.92;1"/>` : ''}</g>`);

  items.sort((a, b) => a.y - b.y);
  s += items.map((i) => i.svg).join('');
  // Everything from here on is light and decoration over the scene: taps go through it.
  s += '<g pointer-events="none">';

  // ── Overhead: bunting across the green and between the lamps. ──
  if (on('bunting')) {
    const string = (x1: number, y1: number, x2: number, y2: number, sag: number, n: number) => {
      let flags = '';
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) / n, x = x1 + (x2 - x1) * u, y = y1 + (y2 - y1) * u + Math.sin(u * Math.PI) * sag;
        flags += `<path d="M${f1(x - 4.4)} ${f1(y)}h8.8l-4.4 8.4z" fill="${['#D4688A', '#E0B04A', '#4FA593', '#FFFAF0'][i % 4]}" stroke="#7A5C3E" stroke-width=".3"/>`;
      }
      return `<path d="M${x1} ${y1}Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + sag * 2} ${x2} ${y2}" fill="none" stroke="#7A5C3E" stroke-width="1"/>${flags}`;
    };
    s += `<g class="${pop('bunting')} bunting">${string(60, 152, 128, 144, 8, 7)}${string(128, 144, 194, 136, 8, 7)}${string(194, 136, 258, 120, 8, 7)}${string(78, 226, 252, 222, 14, 16)}</g>`;
  }
  // Light: lamps and windows glow at dusk; the season tints the whole picture.
  if (on('lamps')) s += lamps.map(([x, y]) => `<circle cx="${x}" cy="${y - 22}" r="${t.lit ? 34 : 22}" fill="url(#v-glow)" class="flicker"/>`).join('');
  if (o.placing) {
    s += '</g><g class="v-slots">';
    for (const [slot, { at: [x, y] }] of Object.entries(SLOTS)) {
      s += at(x, y - 12, `<g class="v-slot${o.placed[slot] ? ' taken' : ''}" data-slot="${slot}" role="button" tabindex="0" aria-label="Spot ${slot.slice(1)}${o.placed[slot] ? ', swap what is here' : ''}">
        <circle r="21" fill="#FFFAF0" fill-opacity=".35" stroke="#E0B04A" stroke-width="3" stroke-dasharray="5 4"/>
        <circle r="9" fill="#E0B04A"/><path d="M-4.4 0h8.8M0-4.4v8.8" stroke="#FFFAF0" stroke-width="2.4" stroke-linecap="round"/></g>`);
    }
    s += '</g><g pointer-events="none">';
  }
  if (o.fresh) {
    const [x, y] = o.fresh.startsWith('slot:') ? SLOTS[o.fresh.slice(5)]?.at ?? [180, 240] : o.fresh.startsWith('nb:') ? PLOTS[o.fresh.slice(3)] ?? [180, 480] : SITES[o.fresh] ?? [180, 240];
    s += at(x, y - 10, `<g class="v-sparkle">${Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return `<path d="M0-5 1.4-1.4 5 0 1.4 1.4 0 5-1.4 1.4-5 0-1.4-1.4Z" fill="${i % 2 ? '#E0B04A' : '#FFFAF0'}" style="--dx:${f1(Math.cos(a) * 46)}px;--dy:${f1(Math.sin(a) * 34)}px;animation-delay:${(i % 3) * 60}ms"/>`;
    }).join('')}<circle r="10" class="v-ring"/></g>`);
  }
  if (t.tint) s += `<rect x="${big.x}" y="${big.y}" width="${big.w}" height="${big.h}" fill="${t.tint}" opacity=".5"/>`;
  s += `<rect x="${big.x}" y="${big.y}" width="${big.w}" height="${big.h}" fill="url(#v-sun)"/></g>`;

  const defs = `<defs>
    <radialGradient id="v-glow"><stop offset="0" stop-color="#FFE7A8" stop-opacity=".75"/><stop offset="1" stop-color="#FFD98A" stop-opacity="0"/></radialGradient>
    <radialGradient id="v-sun" gradientUnits="userSpaceOnUse" cx="60" cy="40" r="520"><stop offset="0" stop-color="${t.sun}"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
    <pattern id="v-tufts" width="52" height="52" patternUnits="userSpaceOnUse"><path d="M9 14l2-4 2 4M33 33l2-4 2 4M22 46l1.6-3 1.6 3" stroke="${t.lawnTuft}" stroke-width="1.4" fill="none" stroke-linecap="round"/></pattern>
    <pattern id="v-stripes" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)"><rect width="40" height="40" fill="${t.garden[0]}"/><rect width="20" height="40" fill="${t.garden[1]}"/></pattern>
    ${BRONZE}
    <pattern id="v-rows" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="${t.soil}"/><rect y="2" width="16" height="6" rx="3" fill="${t.crop}"/></pattern>
  </defs>`;
  return `<svg viewBox="${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}" preserveAspectRatio="xMidYMid meet" class="village-art${o.animate ? '' : ' still'}" role="img" aria-label="Your village">${defs}${s}</svg>`;
}

/** Pip's spare bicycle, parked (Mr Fennick's, once the lane is swept). */
function courierBike(): string {
  return `<circle cx="-12" cy="8" r="8" fill="none" stroke="#23352B" stroke-width="2.6"/><circle cx="12" cy="8" r="8" fill="none" stroke="#23352B" stroke-width="2.6"/><path d="M-12 8-2 8 6-4M-2 8-6-4M12 8 6-8" stroke="#B85C38" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M-9-5h-5" stroke="#3B2A20" stroke-width="2.6" stroke-linecap="round"/><path d="M3-9h6" stroke="#3B2A20" stroke-width="2.4" stroke-linecap="round"/><rect x="8" y="-15" width="11" height="7" rx="1.6" fill="#E0B04A" stroke="#A67C1E"/>`;
}
