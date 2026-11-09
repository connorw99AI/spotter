import type { ShopKind } from '../core/types';
import { itemIcon, shopColour } from './art';
import type { Theme } from './theme';

/**
 * Three-quarter view scenery. Light comes from the top left; every object casts
 * a soft shadow down and to the right. Each function draws around (0,0) at the
 * object's foot, in map units (100 = one block).
 */

const SHADOW = 'fill="#23352B" opacity=".17"';

const INK = '#5E4632';

/** A framed window with a sill: glass glows when lit, otherwise catches the sky. */
function windowPane(x: number, y: number, w: number, h: number, lit: boolean, shutters?: string): string {
  const glass = lit ? '#FFD98A' : '#A9D3DA';
  const deep = lit ? '#F2B65A' : '#7FB3BE';
  let s = shutters ? `<rect x="${x - 1.7}" y="${y}" width="1.5" height="${h}" rx=".4" fill="${shutters}" stroke="${INK}" stroke-width=".4"/><rect x="${x + w + 0.2}" y="${y}" width="1.5" height="${h}" rx=".4" fill="${shutters}" stroke="${INK}" stroke-width=".4"/>` : '';
  s += `<rect x="${x - 0.5}" y="${y - 0.5}" width="${w + 1}" height="${h + 1}" rx=".7" fill="#FFF8EA"/>`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx=".4" fill="${glass}"/><path d="M${x} ${y + h}h${w}v-${(h * 0.45).toFixed(1)}Z" fill="${deep}" opacity=".55"/>`;
  s += `<path d="M${x + w / 2} ${y}v${h}M${x} ${y + h / 2}h${w}" stroke="#FFF8EA" stroke-width=".7"/>`;
  if (!lit) s += `<path d="M${x + 0.8} ${y + h * 0.42}l${(w * 0.3).toFixed(1)} -${(h * 0.32).toFixed(1)}" stroke="#FFFFFF" stroke-width=".7" stroke-linecap="round" opacity=".85"/>`;
  s += `<rect x="${x - 0.9}" y="${y + h}" width="${w + 1.8}" height="1.1" rx=".4" fill="#E9DCC0" stroke="${INK}" stroke-width=".35"/>`;
  return s;
}

export interface HouseLook {
  roof: string;
  roofShade: string;
  wall: string;
  wallShade: string;
  door: string;
  lit: boolean;
  chimney?: boolean;
  flowers?: boolean;
}

const ROOFS: [string, string][] = [['#C2643F', '#97482B'], ['#8E7B9B', '#6E5D7B'], ['#7E9A6A', '#5F7A4E'], ['#C98A4B', '#9E6732'], ['#B65A55', '#8D3F3B']];
const WALLS: [string, string][] = [['#F6E7CB', '#DCC7A3'], ['#F4DCD2', '#D9BDB1'], ['#E4EBE0', '#C6D0C1'], ['#F3E3B8', '#D7C392']];
const DOORS = ['#2F5D46', '#B85C38', '#4D6E8C', '#8A5A7A'];

export function randomHouseLook(rnd: () => number, lit: boolean): HouseLook {
  const [roof, roofShade] = ROOFS[Math.floor(rnd() * ROOFS.length)];
  const [wall, wallShade] = WALLS[Math.floor(rnd() * WALLS.length)];
  return { roof, roofShade, wall, wallShade, door: DOORS[Math.floor(rnd() * DOORS.length)], lit, chimney: rnd() < 0.7, flowers: rnd() < 0.5 };
}

/** Rows of roof tiles across a sloping plane: from points along the front edge, back along the depth. */
function tileRows(ax: number, ay: number, bx: number, by: number, dx: number, dy: number, colour: string, n = 5): string {
  let s = '';
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1);
    const x = ax + (bx - ax) * t, y = ay + (by - ay) * t;
    s += `M${x.toFixed(1)} ${y.toFixed(1)}l${dx} ${dy}`;
  }
  return `<path d="${s}" stroke="${colour}" stroke-width=".8" stroke-dasharray="1.8 .9" opacity=".7"/>`;
}

/**
 * A cottage, gable end towards you, light from the top left. Drawn at its foot
 * (0,0), about 34 units wide and 40 tall at scale 1.
 */
export function houseArt(l: HouseLook, s = 1): string {
  const glass = l.lit ? '#FFD98A' : '#A9D3DA';
  return `<g transform="scale(${s})">
    <path d="M-12 10H8l8-5.6h9.6L17 13H-9Z" fill="#23352B" opacity=".16"/>
    <ellipse cx="-2" cy="10.4" rx="12.5" ry="1.6" fill="#23352B" opacity=".22"/>
    <path d="M8-12 15-17V5L8 10Z" fill="${l.wallShade}" stroke="${INK}" stroke-width=".8" stroke-linejoin="round"/>
    <path d="M8-12 15-17V-14.4L8-9.4Z" fill="#23352B" opacity=".18"/>
    <path d="M10.2-5.4 13-7.4V-2.6L10.2-.6Z" fill="${glass}" stroke="#FFF8EA" stroke-width=".7"/>
    <path d="M-12 10V-12L-2-21.4 8-12V10Z" fill="${l.wall}" stroke="${INK}" stroke-width=".9" stroke-linejoin="round"/>
    <path d="M-12 6.6H8V10H-12Z" fill="${l.wallShade}" opacity=".75"/>
    <path d="M-11.4 9.4V-11.6" stroke="#FFFFFF" stroke-width=".8" opacity=".45"/>
    <circle cx="-2" cy="-14.2" r="2.3" fill="#FFF8EA"/><circle cx="-2" cy="-14.2" r="1.6" fill="${glass}"/>
    ${l.chimney ? `<path d="M8.4-21.6h3.6v-8.6h-3.6Z" fill="#B66A4C" stroke="${INK}" stroke-width=".7"/><path d="M8.4-27.2h3.6M8.4-24.4h3.6M10.2-30.2v2.9M10.2-24.4v2.6" stroke="#8E4A33" stroke-width=".45"/><rect x="7.8" y="-31.4" width="4.8" height="1.6" rx=".5" fill="#8E4A33"/>` : ''}
    <path d="M-2.4-23.2 10.6-10.6 17.6-15.6 4.6-28.2Z" fill="${l.roof}" stroke="${l.roofShade}" stroke-width=".8" stroke-linejoin="round"/>
    ${tileRows(-2.4, -23.2, 10.6, -10.6, 7, -5, l.roofShade)}
    <path d="M10.6-10.6 17.6-15.6" stroke="${l.roofShade}" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M-2.4-23.2 4.6-28.2" stroke="#FFF1DA" stroke-width="1.9" stroke-linecap="round" opacity=".75"/>
    <path d="M-14.4-10.4-2.4-23.2 10.6-10.4" fill="none" stroke="${l.roofShade}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M-14-11.4-2.4-23.8" stroke="#FFF1DA" stroke-width=".8" stroke-linecap="round" opacity=".7"/>
    ${windowPane(-10.2, -6.2, 5.4, 6, l.lit, l.door)}
    ${windowPane(4.2, -6.2, 2.6, 6, l.lit)}
    ${l.flowers ? `<rect x="-11" y="0.6" width="7" height="2" rx=".8" fill="#9C6B4E" stroke="${INK}" stroke-width=".35"/><circle cx="-9.8" cy=".4" r="1.15" fill="#E77D9C"/><circle cx="-7.5" cy=".1" r="1.15" fill="#F2D36B"/><circle cx="-5.2" cy=".4" r="1.15" fill="#E77D9C"/><circle cx="-8.6" cy="-.6" r=".7" fill="#FFFFFF"/>` : ''}
    <path d="M-2.4 10V1.6a2.6 2.6 0 0 1 5.2 0V10Z" fill="${l.door}" stroke="${INK}" stroke-width=".7"/>
    <path d="M-1.3 4h3M-1.3 7h3" stroke="#23352B" stroke-width=".45" opacity=".35"/><circle cx="1.6" cy="5.6" r=".55" fill="#E0B04A"/>
    <rect x="-3.6" y="9.6" width="7.6" height="1.6" rx=".5" fill="#D9CCB2" stroke="${INK}" stroke-width=".35"/>
    ${l.lit ? '<circle cx="4.6" cy="-.6" r="1" fill="#FFE7A8"/><circle cx="4.6" cy="-.6" r="3" fill="#FFD98A" opacity=".3"/>' : ''}
  </g>`;
}

function shopProp(kind: ShopKind): string {
  switch (kind) {
    case 'bakery': return `<g transform="translate(-21 13)"><ellipse cx="1" cy="2" rx="6" ry="2" ${SHADOW}/><path d="M-5-1h10l-1.4 3.6H-3.6Z" fill="#C9934F" stroke="#7A5224" stroke-width=".7"/><ellipse cx="-1.6" cy="-1.6" rx="2.3" ry="1.5" fill="#E7A95A" stroke="#8A5524" stroke-width=".55"/><ellipse cx="1.8" cy="-1.8" rx="2.3" ry="1.5" fill="#E7A95A" stroke="#8A5524" stroke-width=".55"/><path d="M-2.6-2.2l1.6-.4M.8-2.4l1.6-.4" stroke="#FFF1DA" stroke-width=".5"/></g>`;
    case 'florist': return `<g transform="translate(-22 13)">${[-4.4, 0, 4.4].map((x, i) => `<rect x="${x - 1.9}" y="-2.6" width="3.8" height="4.2" rx=".9" fill="#9BB3BE" stroke="#5E7480" stroke-width=".55"/><circle cx="${x}" cy="-4.4" r="2.4" fill="${['#E77D9C', '#F2D36B', '#B9A3E3'][i]}"/><circle cx="${x - 0.9}" cy="-5.1" r="1" fill="#FFFAF0" opacity=".75"/><path d="M${x - 2} -2.8l-1-1.6M${x + 2} -2.8l1-1.6" stroke="#5E8C4C" stroke-width=".8"/>`).join('')}</g>`;
    case 'icecream': return `<g transform="translate(-22 11)"><ellipse cx="3" cy="4" rx="7" ry="2.4" ${SHADOW}/><path d="M0 3V-6" stroke="#7A5C3E" stroke-width="1"/><path d="M-7.4-6Q0-12.6 7.4-6Z" fill="#E77D9C" stroke="#9B3E5C" stroke-width=".7"/><path d="M-3.6-6.4Q0-11.4 0-10M3.6-6.4Q0-11.4 0-10" fill="#FFFAF0" stroke="#FFFAF0" stroke-width="1.4" opacity=".8"/><circle cx="0" cy="3" r="2.6" fill="#EFE3C8" stroke="#8C6A45" stroke-width=".55"/></g>`;
    case 'grocer': return `<g transform="translate(-22 13)"><rect x="-6.4" y="-3" width="6.2" height="4.6" fill="#C59A62" stroke="#7A5224" stroke-width=".6"/><rect x=".4" y="-3" width="6.2" height="4.6" fill="#C59A62" stroke="#7A5224" stroke-width=".6"/><circle cx="-4.6" cy="-3.6" r="1.4" fill="#EB8C3E"/><circle cx="-1.9" cy="-3.8" r="1.4" fill="#EB8C3E"/><circle cx="2.2" cy="-3.8" r="1.5" fill="#7FAF55"/><circle cx="5" cy="-3.6" r="1.5" fill="#C8483A"/><circle cx="-4.9" cy="-4.1" r=".5" fill="#FFFFFF" opacity=".6"/></g>`;
  }
}

/**
 * A shop: a painted false front with its sign, a striped awning over the
 * display window, and the goods on show. About 36 units wide at scale 1.
 */
export function shopArt(kind: ShopKind, lit: boolean, s = 1): string {
  const col = shopColour[kind];
  const awning = [-15, -9, -3, 3, 9].map((x, i) => `<path d="M${x}-7h6v5.4q-1.5 1.6-3 0-1.5 1.6-3 0Z" fill="${i % 2 ? '#FFFAF0' : col.fill}"/>`).join('');
  return `<g transform="scale(${s})">
    <path d="M-16 12H14l8-5.6h9.6L23 15H-13Z" fill="#23352B" opacity=".16"/>
    <ellipse cx="-1" cy="12.4" rx="16" ry="1.7" fill="#23352B" opacity=".22"/>
    <path d="M14-18 21-23V7L14 12Z" fill="#D9C7A6" stroke="${INK}" stroke-width=".8"/>
    <path d="M-16-18 14-18 21-23-9-23Z" fill="#8C7B70" stroke="#5E4F47" stroke-width=".8" stroke-linejoin="round"/>
    ${tileRows(-16, -18, 14, -18, 7, -5, '#6E5F56', 4)}
    <path d="M-16 12V-18H-8C-6.4-23.4 2.4-23.4 4-18H14V12Z" fill="${col.tint}" stroke="${INK}" stroke-width=".9" stroke-linejoin="round"/>
    <path d="M-15.4 11.4V-17.4" stroke="#FFFFFF" stroke-width=".8" opacity=".5"/>
    <rect x="-8.6" y="-21.6" width="13.2" height="6" rx="1.6" fill="${col.deep}" stroke="${INK}" stroke-width=".5"/>
    <g transform="translate(-2 -18.6) scale(.3)">${itemIcon[kind]}</g>
    ${windowPane(-13.2, -14.4, 3.6, 4.6, lit)}${windowPane(7.6, -14.4, 3.6, 4.6, lit)}
    <rect x="-16" y="-8.2" width="30" height="1.4" fill="${col.deep}"/>
    ${awning}
    <path d="M-15-1.6h24" stroke="#23352B" stroke-width="1.2" opacity=".15"/>
    <rect x="-14" y="-.6" width="15" height="10.2" rx=".6" fill="#FFF8EA" stroke="${INK}" stroke-width=".6"/>
    <rect x="-13.2" y=".2" width="13.4" height="8.6" fill="${lit ? '#FFD98A' : '#BFE0E4'}"/>
    <g transform="translate(-9.6 5.6) scale(.3)">${itemIcon[kind]}</g><g transform="translate(-3.6 5.8) scale(.26)">${itemIcon[kind]}</g>
    <path d="M-12.4 7.6l3.6-6" stroke="#FFFFFF" stroke-width=".8" opacity=".6" stroke-linecap="round"/>
    <path d="M3.2 12V1.2a.8.8 0 0 1 .8-.8h6a.8.8 0 0 1 .8.8V12Z" fill="${col.deep}" stroke="${INK}" stroke-width=".7"/>
    <rect x="4.6" y="2" width="4.8" height="4.4" rx=".6" fill="${lit ? '#FFD98A' : '#BFE0E4'}"/><circle cx="9.4" cy="8" r=".55" fill="#E0B04A"/>
    <rect x="-16" y="10" width="30" height="2" fill="#23352B" opacity=".12"/>
    <path d="M-16-3h-6" stroke="#5E4F47" stroke-width="1.1" stroke-linecap="round"/>
    <path d="M-21-3v1.6" stroke="#5E4F47" stroke-width=".8"/>
    <circle cx="-21" cy="3" r="4.8" fill="#FFFAF0" stroke="${col.deep}" stroke-width="1.2"/>
    <g transform="translate(-21 3) scale(.32)">${itemIcon[kind]}</g>
    ${shopProp(kind)}
  </g>`;
}

export function depotArt(lit: boolean, s = 1): string {
  const look: HouseLook = { roof: '#3E7558', roofShade: '#2A5440', wall: '#F6E7CB', wallShade: '#DCC7A3', door: '#E0B04A', lit, chimney: true, flowers: true };
  return `<g transform="scale(${s})">
    <g transform="translate(-22 4)">
      <path d="M-6 9H8l4-3H-2Z" ${SHADOW}/>
      <path d="M-7 9V-2L8-6V9Z" fill="#B99B74" stroke="${INK}" stroke-width=".8"/>
      <path d="M-4 9V-1.6M-1 9V-2.4M2 9V-3.2M5 9V-4" stroke="#8C6A45" stroke-width=".5" opacity=".7"/>
      <path d="M-9-1 9-7" stroke="#6E5236" stroke-width="2" stroke-linecap="round"/>
      <circle cx="-2" cy="5.6" r="3" fill="none" stroke="#23352B" stroke-width="1.2"/><circle cx="4.4" cy="5.6" r="3" fill="none" stroke="#23352B" stroke-width="1.2"/>
      <path d="M-2 5.6 1 1.6l3.4 4M1 1.6h3" stroke="#2F5D46" stroke-width="1.1" fill="none"/>
    </g>
    ${houseArt(look)}
    <path d="M20-6v-19" stroke="#6E5236" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M20-25l9 3-9 3Z" fill="#E0B04A" stroke="#A67C1E" stroke-width=".6"/>
    <g transform="translate(15 14)"><rect x="-3" y="-3" width="6" height="5" fill="#C59A62" stroke="#7A5224" stroke-width=".6"/><rect x="-2" y="-7" width="5" height="4" fill="#D9AE74" stroke="#7A5224" stroke-width=".6"/><path d="M-3-.6h6" stroke="#7A5224" stroke-width=".4"/></g>
  </g>`;
}

/**
 * Broadleaf trees: a lumpy, shaded canopy over a trunk. Tone picks the leaf
 * colour and the kind (round, tall, fruiting, or in blossom when in season).
 */
export function treeArt(t: Theme, tone: number, s = 1): string {
  const c = t.leaves[tone % t.leaves.length];
  const blossom = t.blossom && tone % t.leaves.length === 2;
  const kind = tone % 4;
  const trunk = `<path d="M-2.2 9.6-1.4-1h2.8l.8 10.6Q0 10.6-2.2 9.6Z" fill="#7A5A3A"/><path d="M0-1h1.4l.8 10.6Q1 10.4 0 10.2Z" fill="#5E4430"/>`;
  if (kind === 1) {
    // Tall and narrow, like a poplar.
    return `<g transform="scale(${s})">
      <ellipse cx="7" cy="9.4" rx="11" ry="4.6" ${SHADOW}/>${trunk}
      <ellipse cx="1" cy="-10" rx="8.6" ry="16" fill="${c.dark}"/>
      <ellipse cx="-1" cy="-12" rx="6.8" ry="14" fill="${c.mid}"/>
      <ellipse cx="-3" cy="-17" rx="3.4" ry="7" fill="${c.light}" opacity=".9"/>
      <path d="M-5-6c2 1 5 1 8-1M-4.6 0c2 1 5 1 8-1" stroke="${c.dark}" stroke-width="1" fill="none" opacity=".5"/>
    </g>`;
  }
  const dots = blossom
    ? `${[[-6, -4], [4, -2], [0, -13], [-9, -10], [7, -10], [-3, -8]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#FFFFFF"/>`).join('')}`
    : kind === 3 ? `${[[-6, -4], [5, -3], [1, -12], [-8, -11], [7, -10]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.5" fill="#C8483A"/><circle cx="${x - 0.5}" cy="${y - 0.5}" r=".5" fill="#FFFFFF" opacity=".6"/>`).join('')}` : '';
  return `<g transform="scale(${s})">
    <ellipse cx="8" cy="9.4" rx="14" ry="5.6" ${SHADOW}/>${trunk}
    <circle cx="6" cy="-5" r="8.6" fill="${c.dark}"/><circle cx="-6.4" cy="-5.4" r="8" fill="${c.dark}"/><circle cx="0" cy="-12.6" r="9.4" fill="${c.dark}"/>
    <circle cx="-3.4" cy="-9" r="8.4" fill="${c.mid}"/><circle cx="4.4" cy="-10" r="7" fill="${c.mid}"/><circle cx="-7.2" cy="-4.2" r="5.2" fill="${c.mid}"/>
    <ellipse cx="1" cy="-1.6" rx="9.6" ry="2.8" fill="${c.dark}" opacity=".55"/>
    <circle cx="-5.4" cy="-13.4" r="4.4" fill="${c.light}" opacity=".95"/><circle cx="-1" cy="-16.4" r="2.8" fill="${c.light}" opacity=".85"/><circle cx="-9" cy="-8.6" r="2.4" fill="${c.light}" opacity=".75"/>
    <circle cx="3.6" cy="-12.6" r="1.6" fill="${c.light}" opacity=".6"/>
    ${dots}
  </g>`;
}

export function pineArt(t: Theme, s = 1): string {
  const [dark, lite] = t.pine;
  const snow = t.name === 'winter';
  const tier = (y: number, w: number, h: number) => `<path d="M0 ${y - h}L${w} ${y}Q0 ${y + 2.4} ${-w} ${y}Z" fill="${dark}"/><path d="M0 ${y - h}L${-w} ${y}Q${-w * 0.4} ${y + 1.6} ${w * 0.15} ${y + 1.4}Z" fill="${lite}"/>${snow ? `<path d="M0 ${y - h}L${-w * 0.55} ${y - h * 0.4}Q0 ${y - h * 0.32} ${w * 0.5} ${y - h * 0.44}Z" fill="#FFFFFF"/>` : ''}`;
  return `<g transform="scale(${s})">
    <ellipse cx="7" cy="10" rx="10" ry="4.4" ${SHADOW}/>
    <path d="M-1.6 3.6h3.2v6.6h-3.2Z" fill="#6E5236"/>
    ${tier(5, 10.4, 11)}${tier(-2.6, 8.4, 10)}${tier(-10, 6, 10)}
  </g>`;
}

export function bushArt(t: Theme, s = 1): string {
  const c = t.leaves[0];
  return `<g transform="scale(${s})">
    <ellipse cx="5" cy="6" rx="12" ry="4" ${SHADOW}/>
    <circle cx="-6" cy="1" r="5.6" fill="${c.dark}"/><circle cx="5.4" cy="0" r="6.4" fill="${c.dark}"/><circle cx="0" cy="-3" r="6.6" fill="${c.mid}"/>
    <circle cx="-4.6" cy="-.4" r="4.6" fill="${c.mid}"/><circle cx="5" cy="-1.4" r="4.6" fill="${c.mid}"/>
    <ellipse cx="0" cy="4" rx="9" ry="1.8" fill="${c.dark}" opacity=".5"/>
    <circle cx="-2" cy="-6" r="2.6" fill="${c.light}" opacity=".9"/><circle cx="-6.4" cy="-2.4" r="1.6" fill="${c.light}" opacity=".7"/>
  </g>`;
}

export function flowerBedArt(t: Theme, tone: number, s = 1): string {
  const spots = [[-7, 0.6], [-3.4, -2], [0.4, 0.8], [4.2, -1.8], [7.6, 0.8], [-1.4, 3.2], [3.4, 3]];
  const flower = (x: number, y: number, c: string) => `<g transform="translate(${x} ${y})"><circle cx="-1" cy="0" r="1.05" fill="${c}"/><circle cx="1" cy="0" r="1.05" fill="${c}"/><circle cx="0" cy="-1" r="1.05" fill="${c}"/><circle cx="0" cy="1" r="1.05" fill="${c}"/><circle r=".7" fill="#F2D36B"/></g>`;
  return `<g transform="scale(${s})">
    <ellipse cx="1" cy="2" rx="12.4" ry="6.2" fill="#23352B" opacity=".1"/>
    <ellipse cx="0" cy="1" rx="11.6" ry="5.8" fill="#8C6A4E"/><ellipse cx="0" cy=".4" rx="10.4" ry="4.9" fill="${t.leaves[0].dark}"/>
    ${[[-6, 1], [-2, -1.6], [3, 1.2], [6.4, -1]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3" ry="1.8" fill="${t.leaves[0].mid}"/>`).join('')}
    ${spots.map(([x, y], i) => flower(x, y, t.meadowDots[(i + tone) % t.meadowDots.length])).join('')}
  </g>`;
}

/** A lamp post with a glass lantern; lit at dusk. */
export function lampArt(lit: boolean): string {
  return `<g>
    <path d="M1 0l10 4.6" stroke="#23352B" stroke-width="2.4" opacity=".14" stroke-linecap="round"/>
    <path d="M-2 0h4l-.6-2H-1.4Z" fill="#3D4A43"/>
    <path d="M-.9-2 -.6-15H.6L.9-2Z" fill="#3D4A43"/><path d="M-.4-14v11" stroke="#7E8A84" stroke-width=".4"/>
    <path d="M-3.2-15h6.4" stroke="#3D4A43" stroke-width="1.1" stroke-linecap="round"/>
    <path d="M-2.8-15.4 2.8-15.4 2.2-20.4H-2.2Z" fill="${lit ? '#FFE3A1' : '#E7EFEE'}" stroke="#3D4A43" stroke-width=".7"/>
    ${lit ? '<path d="M-1.4-16.2h2.8l-.4-3.4h-2Z" fill="#FFF6D8"/>' : '<path d="M-1.6-16.4l1.2-3" stroke="#FFFFFF" stroke-width=".5"/>'}
    <path d="M-3-20.4h6l-3-2.6Z" fill="#3D4A43"/><circle cx="0" cy="-23.4" r=".7" fill="#3D4A43"/>
  </g>`;
}

export function benchArt(): string {
  return `<g><path d="M-7 3h16l3-2H-4Z" ${SHADOW}/><path d="M-5.6 1v3M5.6 1v3M-5.6-5v4M5.6-5v4" stroke="#3D4A43" stroke-width="1.3"/><rect x="-7.4" y="-2" width="14.8" height="3" rx="1" fill="#A87A50" stroke="#6E5236" stroke-width=".7"/><path d="M-6.6-.6h13.2" stroke="#C99E70" stroke-width=".6"/><rect x="-7.4" y="-6" width="14.8" height="2.6" rx="1" fill="#B98D63" stroke="#6E5236" stroke-width=".7"/><path d="M-6.6-5.2h13.2" stroke="#D9B286" stroke-width=".6"/></g>`;
}

export function fountainArt(t: Theme): string {
  return `<g>
    <ellipse cx="4" cy="5" rx="17" ry="9" ${SHADOW}/>
    <ellipse cx="0" cy="0" rx="16" ry="10" fill="#D9CCB2" stroke="#9E8B6A" stroke-width="1.2"/>
    <ellipse cx="0" cy="-1" rx="12.5" ry="7.4" fill="${t.water}"/>
    <ellipse cx="-3" cy="-3" rx="5" ry="2" fill="${t.waterHi}" opacity=".7"/>
    <path d="M0-1V-9" stroke="#9E8B6A" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M0-9c-4 0-5 4-6 6M0-9c4 0 5 4 6 6" fill="none" stroke="${t.waterHi}" stroke-width="1.6" stroke-linecap="round"/>
  </g>`;
}

export function shedArt(): string {
  return `<g><path d="M-7 7H8l5-3H-2Z" ${SHADOW}/><path d="M6-3 10-6V4L6 7Z" fill="#9E7752" stroke="#6E5236" stroke-width=".8"/><rect x="-8" y="-3" width="14" height="10" fill="#B99B74" stroke="#6E5236" stroke-width=".9"/><path d="M-9-2-1-9 7-2 11-5 3-12-5-5Z" fill="#7C6B62" stroke="#5E4F47" stroke-width=".8" stroke-linejoin="round"/><rect x="-2" y="0" width="4" height="7" fill="#7A5A3A"/></g>`;
}

export function lilyArt(t: Theme, tone: number): string {
  return `<g><path d="M0 0m-5 0a5 3.4 0 1 0 10 0a5 3.4 0 1 0-10 0" fill="${t.leaves[1].mid}" opacity=".85"/><path d="M0 0l4-2" stroke="${t.water}" stroke-width="1.2"/>${tone % 2 ? '<circle cx="-1.6" cy="-1" r="1.6" fill="#F7CFDC"/>' : ''}</g>`;
}

export function duckArt(): string {
  return `<g><ellipse cx="0" cy="1.4" rx="6" ry="2" fill="#23352B" opacity=".12"/><ellipse cx="0" cy="0" rx="5" ry="3.2" fill="#FFFAF0" stroke="#9E8B6A" stroke-width=".6"/><circle cx="3.6" cy="-2.6" r="2.2" fill="#FFFAF0" stroke="#9E8B6A" stroke-width=".6"/><path d="M5.6-2.6h2.2" stroke="#E98A3A" stroke-width="1.4" stroke-linecap="round"/></g>`;
}
