import type { ShopKind } from '../core/types';
import { itemIcon, shopColour } from './art';
import type { Theme } from './theme';

/**
 * Three-quarter view scenery. Light comes from the top left; every object casts
 * a soft shadow down and to the right. Each function draws around (0,0) at the
 * object's foot, in map units (100 = one block).
 */

const SHADOW = 'fill="#23352B" opacity=".17"';

function windowPane(x: number, y: number, w: number, h: number, lit: boolean): string {
  const glass = lit ? '#FFD98A' : '#A9D3DA';
  const hi = lit ? '#FFF1C9' : '#E2F3F5';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx=".8" fill="${glass}" stroke="#6E5236" stroke-width=".9"/>
    <path d="M${x + w / 2} ${y}v${h}" stroke="#6E5236" stroke-width=".7"/>
    <path d="M${x + 1} ${y + h - 1.2}l${Math.min(2.4, w / 2 - 1)} ${-(h - 2.4)}" stroke="${hi}" stroke-width=".9" stroke-linecap="round" opacity=".9"/>`;
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

export function houseArt(l: HouseLook, s = 1): string {
  return `<g transform="scale(${s})">
    <path d="M-12 13H11l7-5h10l-8 9H-9Z" ${SHADOW}/>
    <path d="M9-4 16-9V7L9 12Z" fill="${l.wallShade}" stroke="#7A5C3E" stroke-width="1"/>
    <path d="M-13 12V-4L-2-14 9-4V12Z" fill="${l.wall}" stroke="#7A5C3E" stroke-width="1.1" stroke-linejoin="round"/>
    <path d="M-15-3-3-15 4-20-8-8Z" fill="${l.roof}" stroke="${l.roofShade}" stroke-width="1" stroke-linejoin="round"/>
    <path d="M-3-15 11-2 18-7 4-20Z" fill="${l.roofShade}" stroke="${l.roofShade}" stroke-width="1" stroke-linejoin="round"/>
    <path d="M-12-6-3-14.6M-9-6.4l8.6-8M-6-6.8 2.6-14.8" stroke="${l.roofShade}" stroke-width=".8" opacity=".55"/>
    <path d="M-15-3-3-15 11-2" fill="none" stroke="#FFF6E2" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>
    ${l.chimney ? `<path d="M-9-15h4v-7h-4Z" fill="${l.wallShade}" stroke="#7A5C3E" stroke-width=".9"/><path d="M-9-22l1.6-1.2h4L-5-22Z" fill="#7A5C3E"/>` : ''}
    <circle cx="-2" cy="-8" r="2" fill="${l.lit ? '#FFD98A' : '#A9D3DA'}" stroke="#6E5236" stroke-width=".8"/>
    ${windowPane(-11, 0, 6, 5.5, l.lit)}
    <rect x="-2.5" y="2.5" width="6" height="9.5" rx="1.2" fill="${l.door}" stroke="#4F3B27" stroke-width=".8"/>
    <circle cx="2" cy="7.6" r=".7" fill="#E0B04A"/>
    ${windowPane(5, 0.5, 3.2, 5, l.lit)}
    <path d="M11 1.4l3.4-2.4v4.2L11 5.6Z" fill="${l.lit ? '#FFD98A' : '#A9D3DA'}" stroke="#6E5236" stroke-width=".7"/>
    ${l.flowers ? `<rect x="-12" y="5.6" width="8" height="2" rx="1" fill="#8C6A45"/><circle cx="-10.6" cy="5.2" r="1.3" fill="#E77D9C"/><circle cx="-8" cy="5" r="1.3" fill="#F2D36B"/><circle cx="-5.4" cy="5.2" r="1.3" fill="#E77D9C"/>` : ''}
  </g>`;
}

function shopProp(kind: ShopKind): string {
  switch (kind) {
    case 'bakery': return `<g transform="translate(-19 13)"><ellipse cx="0" cy="1.6" rx="5.5" ry="2" ${SHADOW}/><path d="M-5-1h10l-1.4 3.6H-3.6Z" fill="#C9934F" stroke="#7A5224" stroke-width=".8"/><ellipse cx="-1.6" cy="-1.6" rx="2.2" ry="1.4" fill="#E7A95A" stroke="#8A5524" stroke-width=".6"/><ellipse cx="1.8" cy="-1.8" rx="2.2" ry="1.4" fill="#E7A95A" stroke="#8A5524" stroke-width=".6"/></g>`;
    case 'florist': return `<g transform="translate(-20 13)">${[-4, 0, 4].map((x, i) => `<rect x="${x - 1.8}" y="-2.6" width="3.6" height="4" rx=".8" fill="#9BB3BE" stroke="#5E7480" stroke-width=".6"/><circle cx="${x}" cy="-4" r="2.2" fill="${['#E77D9C', '#F2D36B', '#B9A3E3'][i]}"/><circle cx="${x - 1}" cy="-4.6" r="1" fill="#FFFAF0" opacity=".7"/>`).join('')}</g>`;
    case 'icecream': return `<g transform="translate(-20 11)"><ellipse cx="3" cy="4" rx="7" ry="2.4" ${SHADOW}/><path d="M0 3V-6" stroke="#7A5C3E" stroke-width="1"/><path d="M-7-6Q0-12 7-6Z" fill="#E77D9C" stroke="#9B3E5C" stroke-width=".8"/><path d="M-3.5-6.4Q0-11 0-9.8M3.5-6.4Q0-11 0-9.8" fill="#FFFAF0" stroke="#FFFAF0" stroke-width="1.4" opacity=".8"/><circle cx="0" cy="3" r="2.6" fill="#EFE3C8" stroke="#8C6A45" stroke-width=".6"/></g>`;
    case 'grocer': return `<g transform="translate(-20 13)"><rect x="-6" y="-3" width="6" height="4.4" fill="#C59A62" stroke="#7A5224" stroke-width=".7"/><rect x="0.6" y="-3" width="6" height="4.4" fill="#C59A62" stroke="#7A5224" stroke-width=".7"/><circle cx="-4.4" cy="-3.4" r="1.3" fill="#EB8C3E"/><circle cx="-1.8" cy="-3.6" r="1.3" fill="#EB8C3E"/><circle cx="2.4" cy="-3.6" r="1.4" fill="#7FAF55"/><circle cx="5" cy="-3.4" r="1.4" fill="#C8483A"/></g>`;
  }
}

export function shopArt(kind: ShopKind, lit: boolean, s = 1): string {
  const col = shopColour[kind];
  const stripes = [-17, -9, -1, 7].map((x, i) => `<path d="M${x} -3h8l1.6 6c-1.6 1.4-3.4 1.4-4.8 0-1.6 1.4-3.4 1.4-4.8 0Z" fill="${i % 2 ? '#FFFAF0' : col.fill}" stroke="${col.deep}" stroke-width=".7" stroke-linejoin="round"/>`).join('');
  return `<g transform="scale(${s})">
    <path d="M-14 13H16l7-5h10l-8 9H-11Z" ${SHADOW}/>
    <path d="M14-9 20-14V8L14 13Z" fill="#D9C7A6" stroke="#7A5C3E" stroke-width="1"/>
    <rect x="-16" y="-9" width="30" height="22" fill="${col.tint}" stroke="#7A5C3E" stroke-width="1.1"/>
    <path d="M-16-9 14-9 20-14-10-14Z" fill="#7C6B62" stroke="#5E4F47" stroke-width="1" stroke-linejoin="round"/>
    <path d="M-16-9H14l6-5" fill="none" stroke="#FFF6E2" stroke-width="1" opacity=".6"/>
    <rect x="-16" y="-9" width="30" height="5.5" fill="${col.deep}"/>
    <path d="M-11-6.2h4M-5-6.2h7M4-6.2h5" stroke="#FFFAF0" stroke-width="1.3" stroke-linecap="round" opacity=".85"/>
    <rect x="-13" y="3.5" width="13" height="8" rx="1" fill="${lit ? '#FFD98A' : '#A9D3DA'}" stroke="#6E5236" stroke-width=".9"/>
    <g transform="translate(-6.5 8) scale(.28)">${itemIcon[kind]}</g>
    <path d="M-12 10.6l3.4-5.6" stroke="#FFFFFF" stroke-width="1" opacity=".6" stroke-linecap="round"/>
    <rect x="3" y="2.8" width="7" height="10.2" rx="1.2" fill="${col.deep}" stroke="#4F3B27" stroke-width=".8"/>
    <rect x="-16" y="3" width="30" height="2.4" fill="#23352B" opacity=".15"/>
    ${stripes}
    <path d="M-16-1h-6" stroke="#5E4F47" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M-21-1v2" stroke="#5E4F47" stroke-width=".9"/>
    <circle cx="-21" cy="5.4" r="4.8" fill="#FFFAF0" stroke="${col.deep}" stroke-width="1.2"/>
    <g transform="translate(-21 5.4) scale(.32)">${itemIcon[kind]}</g>
    ${shopProp(kind)}
  </g>`;
}

export function depotArt(lit: boolean, s = 1): string {
  const look: HouseLook = { roof: '#3E7558', roofShade: '#2A5440', wall: '#F6E7CB', wallShade: '#DCC7A3', door: '#E0B04A', lit, chimney: true, flowers: true };
  return `<g transform="scale(${s})">
    <g transform="translate(-21 4)">
      <path d="M-6 9H8l4-3H-2Z" ${SHADOW}/>
      <path d="M-7 9V-2L8-6V9Z" fill="#B99B74" stroke="#6E5236" stroke-width=".9"/>
      <path d="M-9-1 9-7" stroke="#6E5236" stroke-width="2" stroke-linecap="round"/>
      <circle cx="-2" cy="5.6" r="3" fill="none" stroke="#23352B" stroke-width="1.2"/><circle cx="4.4" cy="5.6" r="3" fill="none" stroke="#23352B" stroke-width="1.2"/>
      <path d="M-2 5.6 1 1.6l3.4 4M1 1.6h3" stroke="#2F5D46" stroke-width="1.1" fill="none"/>
    </g>
    ${houseArt(look)}
    <path d="M19-6v-17" stroke="#6E5236" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M19-23l9 3-9 3Z" fill="#E0B04A" stroke="#A67C1E" stroke-width=".6"/>
    <g transform="translate(14 14)"><rect x="-3" y="-3" width="6" height="5" fill="#C59A62" stroke="#7A5224" stroke-width=".7"/><rect x="-2" y="-7" width="5" height="4" fill="#D9AE74" stroke="#7A5224" stroke-width=".7"/></g>
  </g>`;
}

export function treeArt(t: Theme, tone: number, s = 1): string {
  const c = t.leaves[tone % t.leaves.length];
  const blossom = t.blossom && tone % t.leaves.length === 2;
  return `<g transform="scale(${s})">
    <ellipse cx="8" cy="9" rx="13" ry="6" ${SHADOW}/>
    <path d="M-1.6 2h3.2l.6 8h-4.4Z" fill="#7A5A3A"/>
    <circle cx="1.5" cy="-3.5" r="12" fill="${c.dark}"/>
    <circle cx="-1.2" cy="-5.6" r="10" fill="${c.mid}"/>
    <circle cx="-4.6" cy="-9.4" r="5" fill="${c.light}"/>
    <circle cx="3" cy="-8" r="2.2" fill="${c.light}" opacity=".7"/>
    ${blossom ? `<circle cx="-6" cy="-3" r="1.4" fill="#FFFFFF"/><circle cx="4" cy="-1" r="1.3" fill="#FFFFFF"/><circle cx="0" cy="-11" r="1.2" fill="#FFFFFF"/>` : ''}
  </g>`;
}

export function pineArt(t: Theme, s = 1): string {
  const [dark, lite] = t.pine;
  return `<g transform="scale(${s})">
    <ellipse cx="7" cy="10" rx="10" ry="4.5" ${SHADOW}/>
    <path d="M-1.4 4h2.8v6h-2.8Z" fill="#7A5A3A"/>
    <path d="M0-20 10 6H-10Z" fill="${dark}"/>
    <path d="M0-20 3.6 6H-10Z" fill="${lite}"/>
    <path d="M0-12 8-2H-8Z" fill="${dark}" opacity=".5"/>
  </g>`;
}

export function bushArt(t: Theme, s = 1): string {
  const c = t.leaves[0];
  return `<g transform="scale(${s})">
    <ellipse cx="5" cy="6" rx="11" ry="4" ${SHADOW}/>
    <circle cx="-5" cy="0" r="6" fill="${c.dark}"/><circle cx="4" cy="-1" r="7" fill="${c.mid}"/><circle cx="-1" cy="1.5" r="5.4" fill="${c.mid}"/>
    <circle cx="1" cy="-4.4" r="2.6" fill="${c.light}"/>
  </g>`;
}

export function flowerBedArt(t: Theme, tone: number, s = 1): string {
  const dots = [[-7, 1], [-3, -2], [1, 1], [5, -2], [8, 1], [-1, 3.4], [3.6, 3]];
  return `<g transform="scale(${s})">
    <ellipse cx="0" cy="1" rx="11" ry="5.6" fill="${t.leaves[0].dark}" opacity=".55"/>
    ${dots.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="1.9" fill="${t.meadowDots[(i + tone) % t.meadowDots.length]}"/>`).join('')}
  </g>`;
}

export function lampArt(lit: boolean): string {
  return `<g>
    <path d="M1 0l9 4" stroke="#23352B" stroke-width="2.2" opacity=".15" stroke-linecap="round"/>
    <path d="M0 0V-14" stroke="#3D4A43" stroke-width="2" stroke-linecap="round"/>
    <path d="M-3.4-14h6.8l-1.4-4.4h-4Z" fill="${lit ? '#FFE3A1' : '#E9E2C9'}" stroke="#3D4A43" stroke-width="1"/>
    <path d="M-2.4-18.4h4.8" stroke="#3D4A43" stroke-width="1.6" stroke-linecap="round"/>
  </g>`;
}

export function benchArt(): string {
  return `<g><path d="M-7 3h16l3-2H-4Z" ${SHADOW}/><rect x="-7" y="-2" width="14" height="3" rx="1" fill="#A87A50" stroke="#6E5236" stroke-width=".8"/><rect x="-7" y="-5.4" width="14" height="2.2" rx="1" fill="#B98D63" stroke="#6E5236" stroke-width=".8"/><path d="M-5.6 1v3M5.6 1v3" stroke="#3D4A43" stroke-width="1.4"/></g>`;
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
