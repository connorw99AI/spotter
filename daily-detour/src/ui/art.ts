import type { ShopKind } from '../core/types';

/**
 * Hand-drawn SVG art. Icons are authored in a -12..12 box so they can be placed
 * anywhere with a translate/scale. Colours come from the palette below so the
 * map, the order chips and the menus stay consistent.
 */
export const C = {
  cream: '#FBF4E4',
  paper: '#FFFAF0',
  ink: '#23352B',
  forest: '#2F5D46',
  forestDeep: '#1F4433',
  moss: '#4E7D46',
  terracotta: '#B85C38',
  terracottaDeep: '#8E4127',
  mustard: '#E0B04A',
  mustardDeep: '#A67C1E',
  lawn: '#CFDDAE',
  lawnDeep: '#B8CC92',
  road: '#F3E8CF',
  kerb: '#D3C19A',
  water: '#9BC8CC',
  waterDeep: '#6FA7AE',
};

export const shopColour: Record<ShopKind, { fill: string; deep: string; tint: string }> = {
  bakery: { fill: '#D9973F', deep: '#9A6420', tint: '#F6E2C2' },
  florist: { fill: '#D4688A', deep: '#9B3E5C', tint: '#F7DCE4' },
  icecream: { fill: '#4FA593', deep: '#2E7364', tint: '#D5EEE7' },
  grocer: { fill: '#7C9F45', deep: '#52702A', tint: '#E3EDCF' },
};

export const itemIcon: Record<ShopKind, string> = {
  bakery: `<path d="M-9 3.5C-9.5-3-5-7.5 0-7.5S9.5-3 9 3.5c0 2.6-2.3 3.8-9 3.8S-9 6.1-9 3.5Z" fill="#E7A95A" stroke="#8A5524" stroke-width="1.5"/>
    <path d="M-4.5-4.2l2.2 3.4M-.4-5.4l2.2 3.4M3.6-4.2l2.2 3.4" stroke="#8A5524" stroke-width="1.5" stroke-linecap="round" fill="none"/>`,
  florist: `<path d="M0 9.5V0" stroke="#4E7D46" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M0 6.5C-4.6 5.6-6.5 2.6-6.6-.6-3.4.1-1 2.4 0 5.2Z" fill="#6FA35E" stroke="#4E7D46" stroke-width="1"/>
    <path d="M-5.4-8.6v5.4c0 4.4 10.8 4.4 10.8 0v-5.4L2.6-5.6 0-9.6-2.6-5.6Z" fill="#E77D9C" stroke="#9B3E5C" stroke-width="1.4" stroke-linejoin="round"/>`,
  icecream: `<path d="M-5.6-.8 0 10.2 5.6-.8Z" fill="#E3B26A" stroke="#93622A" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M-3.2 2.4 2.6 1.2M-1.6 5.4 1.8 4.6" stroke="#93622A" stroke-width="1" fill="none"/>
    <circle cy="-4.2" r="6.2" fill="#A8DCCB" stroke="#2E7364" stroke-width="1.4"/>
    <circle cx="2.2" cy="-10.2" r="1.7" fill="#C8483A"/>`,
  grocer: `<path d="M-7.5 7.5 4.2-3.6l3.4 3.4Z" fill="#EB8C3E" stroke="#A3561B" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M-2.6 2.6l1.6 1.6M.6-.4l1.4 1.4" stroke="#A3561B" stroke-width="1.1" stroke-linecap="round"/>
    <path d="M5.2-2.6 5.6-9M5.6-2.2 11-5.2M5-3 9.2-8.4" stroke="#5C9A4A" stroke-width="1.8" stroke-linecap="round"/>`,
};

export const homeIcon = `<path d="M-8.5-.5 0-8.2 8.5-.5" fill="none" stroke="#FFFAF0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M-6.4-1.8V7.8H6.4V-1.8" fill="none" stroke="#FFFAF0" stroke-width="2" stroke-linejoin="round"/>
  <path d="M-1.8 7.8V2.6h3.6v5.2" fill="#E0B04A" stroke="#FFFAF0" stroke-width="1.4"/>`;

export const coneIcon = `<path d="M-6 8h12" stroke="#7A4A20" stroke-width="2" stroke-linecap="round"/>
  <path d="M-4.6 7.4-1.2-7.6h2.4L4.6 7.4Z" fill="#E8833A" stroke="#9C4C17" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M-3.2 1.6h6.4M-2.1-3.2h4.2" stroke="#FFFAF0" stroke-width="1.8"/>`;

export const basketIcon = `<path d="M-9-2h18l-2.2 9.4H-6.8Z" fill="#D9A55B" stroke="#8A5524" stroke-width="1.4" stroke-linejoin="round"/>
  <path d="M-5.5-2C-5.5-8 5.5-8 5.5-2" fill="none" stroke="#8A5524" stroke-width="1.6"/>
  <path d="M-4 1.5v4M0 1.5v4M4 1.5v4" stroke="#8A5524" stroke-width="1.1"/>`;

export const oneWayIcon = `<path d="M-8 0h12M1-5l6 5-6 5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
export const snowIcon = `<path d="M0-8V8M-7-4 7 4M-7 4 7-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`;
export const leafIcon = `<path d="M-7 7C-7-3-1-8 8-8 8 1 3 7-7 7Z" fill="currentColor"/><path d="M-7 7 3-3" stroke="#FFFAF0" stroke-width="1.3"/>`;
export const hintIcon = `<path d="M-4.6 3.2C-7.4 1.2-8-1.4-8-3.4-8-7.8-4.4-10 0-10s8 2.2 8 6.6c0 2-.6 4.6-3.4 6.6v2.6h-9.2Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M-3.4 9h6.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`;
export const undoIcon = `<path d="M-6-4h8a6 6 0 0 1 0 12h-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M-2-9-7-4l5 5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
export const redoIcon = `<g transform="scale(-1 1)">${undoIcon}</g>`;
export const clearIcon = `<path d="M-7-6 7 8M7-6-7 8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`;
export const backIcon = `<path d="M4-8-4 0l8 8" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
export const playIcon = `<path d="M-5-8 8 0-5 8Z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`;
export const bellIcon = `<path d="M-7 5c2-2 1.6-5 2-8a5 5 0 0 1 10 0c.4 3 0 6 2 8Z" fill="currentColor"/><circle cy="8" r="2" fill="currentColor"/>`;
export const shareIcon = `<path d="M0 3V-9M-5-4 0-9l5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M-6-1h-2v10H8V-1H6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>`;
export const gearIcon = `<circle r="3.4" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M0-10v3.2M0 6.8V10M-10 0h3.2M6.8 0H10M-7-7l2.3 2.3M4.7 4.7 7 7M-7 7l2.3-2.3M4.7-4.7 7-7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`;
export const bookIcon = `<path d="M-9-7c3-1.6 6-1.6 9 .6 3-2.2 6-2.2 9-.6V8C6 6.4 3 6.4 0 8.6-3 6.4-6 6.4-9 8Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M0-6.4V8.6" stroke="currentColor" stroke-width="2"/>`;
export const infoIcon = `<circle r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M0-1v6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cy="-5" r="1.5" fill="currentColor"/>`;

/** Mechanic badges used on route-book tickets. */
export const mechanicIcon: Record<string, { svg: string; label: string }> = {
  closure: { svg: coneIcon, label: 'Roadworks' },
  fresh: { svg: snowIcon, label: 'Melts or wilts' },
  oneway: { svg: oneWayIcon, label: 'One-way streets' },
  capacity: { svg: basketIcon, label: 'Basket holds two' },
};

/** The courier: a little cargo bike with a basket, side view, facing right. ~64×48 units centred on the wheels' midpoint. */
export function courierSvg(): string {
  return `<g class="courier-body">
    <ellipse cx="0" cy="17" rx="28" ry="5" fill="#23352B" opacity=".18"/>
    <circle cx="-17" cy="8" r="9.5" fill="none" stroke="#23352B" stroke-width="3.2"/>
    <circle cx="17" cy="8" r="9.5" fill="none" stroke="#23352B" stroke-width="3.2"/>
    <circle cx="-17" cy="8" r="2" fill="#23352B"/><circle cx="17" cy="8" r="2" fill="#23352B"/>
    <path d="M-17 8-4 8 6-6M-4 8-9-7M17 8 9-9" fill="none" stroke="#2F5D46" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M-13-8h9" stroke="#23352B" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M6-10h7" stroke="#23352B" stroke-width="3" stroke-linecap="round"/>
    <rect x="13" y="-13" width="16" height="11" rx="2.5" fill="#B85C38" stroke="#8E4127" stroke-width="1.8"/>
    <path d="M15-8.5h12" stroke="#E0B04A" stroke-width="1.8"/>
    <path d="M-9-7C-8-17-1-23 4-22" fill="none" stroke="#E0B04A" stroke-width="7" stroke-linecap="round"/>
    <path d="M1-19 8-11" stroke="#F1D7B8" stroke-width="3.4" stroke-linecap="round"/>
    <circle cx="5" cy="-29" r="6.4" fill="#F1D7B8"/>
    <path d="M-1.6-30.5C-1.6-37.6 11.2-37.6 11.2-30.5Z" fill="#2F5D46"/>
    <path d="M9.5-31.2h5" stroke="#2F5D46" stroke-width="2.4" stroke-linecap="round"/>
  </g>`;
}

/** Small cottage for scenery or a house location. */
export function cottageSvg(roof = C.terracotta, wall = '#F6E7CB', s = 1): string {
  return `<g transform="scale(${s})">
    <ellipse cx="2" cy="15" rx="19" ry="4" fill="#23352B" opacity=".12"/>
    <rect x="-14" y="-3" width="28" height="18" rx="2" fill="${wall}" stroke="#8C6A45" stroke-width="1.4"/>
    <path d="M-18-2 0-17 18-2Z" fill="${roof}" stroke="${C.terracottaDeep}" stroke-width="1.6" stroke-linejoin="round"/>
    <rect x="-9" y="3" width="6" height="6" rx="1" fill="#9BC8CC" stroke="#8C6A45" stroke-width="1"/>
    <rect x="3" y="4" width="6" height="11" rx="1.5" fill="${C.forest}"/>
  </g>`;
}

/** Shopfront with a striped awning in the shop's colour. */
export function shopSvg(kind: ShopKind, s = 1): string {
  const col = shopColour[kind];
  const stripes = [-14, -7, 0, 7].map((x) => `<path d="M${x}-4h7v5c0 2-7 2-7 0Z" fill="${(x / 7) % 2 === 0 ? col.fill : '#FFFAF0'}" stroke="${col.deep}" stroke-width="1"/>`).join('');
  return `<g transform="scale(${s})">
    <ellipse cx="2" cy="15" rx="20" ry="4" fill="#23352B" opacity=".12"/>
    <rect x="-15" y="-12" width="30" height="27" rx="2.5" fill="#F7EBD3" stroke="#8C6A45" stroke-width="1.4"/>
    <rect x="-15" y="-15" width="30" height="5" rx="1.5" fill="${col.deep}"/>
    ${stripes}
    <rect x="-11" y="5" width="9" height="7" rx="1" fill="#9BC8CC" stroke="#8C6A45" stroke-width="1"/>
    <rect x="3" y="4" width="7" height="11" rx="1.5" fill="${col.deep}"/>
  </g>`;
}

export function depotSvg(s = 1): string {
  return `<g transform="scale(${s})">
    <ellipse cx="2" cy="16" rx="22" ry="4" fill="#23352B" opacity=".14"/>
    <rect x="-16" y="-3" width="32" height="19" rx="2" fill="#F6E7CB" stroke="#8C6A45" stroke-width="1.4"/>
    <path d="M-20-2 0-19 20-2Z" fill="${C.forest}" stroke="${C.forestDeep}" stroke-width="1.6" stroke-linejoin="round"/>
    <rect x="-11" y="3" width="8" height="13" rx="1.5" fill="${C.mustard}" stroke="#8C6A45" stroke-width="1"/>
    <rect x="2" y="3" width="9" height="6" rx="1" fill="#9BC8CC" stroke="#8C6A45" stroke-width="1"/>
    <path d="M20-2v-14" stroke="#8C6A45" stroke-width="1.6"/><path d="M20-16l9 3-9 3Z" fill="${C.mustard}"/>
  </g>`;
}

export function treeSvg(s = 1, tone = 0): string {
  const leaf = ['#7FA567', '#6C9659', '#8DB373'][tone % 3];
  const dark = ['#5E8650', '#557C47', '#6A955A'][tone % 3];
  return `<g transform="scale(${s})">
    <ellipse cx="3" cy="11" rx="12" ry="4" fill="#23352B" opacity=".13"/>
    <path d="M0 4v8" stroke="#8C6A45" stroke-width="3" stroke-linecap="round"/>
    <circle cy="-3" r="11" fill="${dark}"/>
    <circle cx="-2" cy="-5" r="9" fill="${leaf}"/>
    <circle cx="-5" cy="-8" r="2.4" fill="#A9C98E" opacity=".8"/>
  </g>`;
}

export function pineSvg(s = 1): string {
  return `<g transform="scale(${s})">
    <ellipse cx="3" cy="12" rx="10" ry="3.5" fill="#23352B" opacity=".13"/>
    <path d="M0 6v6" stroke="#8C6A45" stroke-width="3" stroke-linecap="round"/>
    <path d="M0-16 10 6H-10Z" fill="#4F7B4A"/><path d="M0-16 4 2H-7Z" fill="#6A955A"/>
  </g>`;
}

export function bushSvg(s = 1): string {
  return `<g transform="scale(${s})">
    <ellipse cx="2" cy="6" rx="11" ry="3" fill="#23352B" opacity=".12"/>
    <circle cx="-5" cy="0" r="6" fill="#86AD6C"/><circle cx="4" cy="-1" r="7" fill="#7AA162"/><circle cx="0" cy="2" r="5" fill="#93B97A"/>
  </g>`;
}

export function flowersSvg(s = 1, tone = 0): string {
  const cols = [['#E77D9C', '#F2C14E', '#FFFAF0'], ['#F2C14E', '#E98A3A', '#FFFAF0'], ['#B9A3E3', '#E77D9C', '#FFFAF0']][tone % 3];
  const dots = [[-6, 1], [-1, -3], [4, 1], [1, 4], [7, -2], [-4, -5]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="2" fill="${cols[i % 3]}"/>`).join('');
  return `<g transform="scale(${s})"><ellipse cx="0" cy="1" rx="10" ry="6" fill="#9DBE7E"/>${dots}</g>`;
}
