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
export const heartIcon = `<path d="M0 9C-9 3-11-3-8-7-5-10.6-1.4-9 0-6 1.4-9 5-10.6 8-7 11-3 9 3 0 9Z" fill="#D4688A" stroke="#9B3E5C" stroke-width="1.4" stroke-linejoin="round"/><path d="M-5.6-5.4c-1.4.4-2.4 1.6-2.4 3" fill="none" stroke="#FFFFFF" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>`;
export const flameIcon = `<path d="M0 10C-6 10-8 5-7 1-6-3-2-5-2-10 2-7 3-4 2-1 4-2 5-4 5-5 8-1 8 4 6 7 4 9 2 10 0 10Z" fill="#E0B04A" stroke="#A67C1E" stroke-width="1.3" stroke-linejoin="round"/><path d="M0 9C-3 9-3 5-1 3 0 5 2 5 2 4 3 6 2 9 0 9Z" fill="#B85C38"/>`;
export const calendarIcon = `<rect x="-9" y="-7" width="18" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M-9-2h18M-4-10v5M4-10v5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="-3" cy="3" r="1.6" fill="currentColor"/><circle cx="3" cy="3" r="1.6" fill="currentColor"/>`;
export const clockIcon = `<circle r="9" fill="#FFFAF0" stroke="currentColor" stroke-width="2"/><path d="M0-5V0l3.6 2.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`;
export const gateIcon = `<path d="M-9-8v17M9-8v17" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M-9-4H9M-9 4H9M-5-4V4M0-4V4M5-4V4" stroke="currentColor" stroke-width="1.8"/>`;
export const fragileIcon = `<path d="M-5.5-9h11l-1 6c-.5 3-2.5 4.5-4.5 4.5S-4-.5-4.5-3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M0 1.5V8M-4 9h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M-1-7.5 1-5-1-3" fill="none" stroke="currentColor" stroke-width="1.2"/>`;
export const sparkIcon = `<path d="M0-10 2.4-2.4 10 0 2.4 2.4 0 10-2.4 2.4-10 0-2.4-2.4Z" fill="#E0B04A" stroke="#A67C1E" stroke-width="1.2" stroke-linejoin="round"/>`;
export const infoIcon = `<circle r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M0-1v6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cy="-5" r="1.5" fill="currentColor"/>`;

/** Mechanic badges used on route-book tickets. */
export const mechanicIcon: Record<string, { svg: string; label: string }> = {
  closure: { svg: coneIcon, label: 'Roadworks' },
  fresh: { svg: snowIcon, label: 'Melts or wilts' },
  oneway: { svg: oneWayIcon, label: 'One-way streets' },
  capacity: { svg: basketIcon, label: 'Basket holds two' },
  hours: { svg: clockIcon, label: 'Opening hours' },
  gate: { svg: gateIcon, label: 'Garden gates' },
  fragile: { svg: fragileIcon, label: 'Cobbles and fragile orders' },
};

/**
 * The courier: a cargo bike with a front crate, side view facing right, wheels on
 * y = 8. Inner groups carry classes so CSS can spin the wheels and bob the rider
 * without touching the transforms the map sets on the outer group.
 */
export function courierSvg(): string {
  const wheel = (x: number) => `<g transform="translate(${x} 8)">
      <circle r="9.6" fill="#FFFAF0" fill-opacity=".35" stroke="#23352B" stroke-width="3.2"/>
      <g class="spokes"><path d="M-8 0H8M0-8V8M-5.6-5.6l11.2 11.2M-5.6 5.6 5.6-5.6" stroke="#23352B" stroke-width="1" opacity=".55"/></g>
      <circle r="2.2" fill="#23352B"/>
    </g>`;
  return `<g class="courier-body">
    <ellipse cx="2" cy="18" rx="30" ry="5" fill="#23352B" opacity=".2"/>
    <g class="speed"><path d="M-40-6h12M-44 2h14M-38 10h9" stroke="#FFFAF0" stroke-width="2.6" stroke-linecap="round" opacity=".9"/></g>
    ${wheel(-18)}${wheel(18)}
    <path d="M-18 8-4 8 7-6M-4 8-9-7M18 8 10-10" fill="none" stroke="#2F5D46" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M-4 8l2 3" stroke="#23352B" stroke-width="2" stroke-linecap="round"/>
    <path d="M-14-8h9" stroke="#23352B" stroke-width="3.4" stroke-linecap="round"/>
    <g transform="translate(21 -9)">
      <rect x="-8" y="-6" width="17" height="12" rx="2.5" fill="#B85C38" stroke="#8E4127" stroke-width="1.8"/>
      <path d="M-8-1.5h17" stroke="#E0B04A" stroke-width="1.8"/>
      <path d="M-5-6c0-4 4-5 6-2" fill="#E7A95A" stroke="#8A5524" stroke-width="1"/>
      <circle cx="5" cy="-7.4" r="2.4" fill="#E77D9C" stroke="#9B3E5C" stroke-width=".8"/>
    </g>
    <path d="M7-11h7" stroke="#23352B" stroke-width="3" stroke-linecap="round"/>
    <g class="rider">
      <path class="scarf" d="M1-21C-5-21-9-19-12-16" fill="none" stroke="#B85C38" stroke-width="3" stroke-linecap="round"/>
      <path d="M-9-7C-8-17-1-23 4-22" fill="none" stroke="#E0B04A" stroke-width="7.4" stroke-linecap="round"/>
      <path d="M-8-6 0 1" stroke="#2F5D46" stroke-width="5" stroke-linecap="round"/>
      <path d="M1-19 9-12" stroke="#F1D7B8" stroke-width="3.4" stroke-linecap="round"/>
      <circle cx="5" cy="-29" r="6.6" fill="#F1D7B8"/>
      <circle cx="8.4" cy="-29.4" r=".9" fill="#23352B"/>
      <path d="M7.2-26c1 .8 2.2.8 3 0" fill="none" stroke="#8E4127" stroke-width=".9" stroke-linecap="round"/>
      <path d="M-1.8-30.4C-1.8-38 11.6-38 11.6-30.4Z" fill="#2F5D46"/>
      <path d="M9.8-31.2h5.4" stroke="#2F5D46" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M1-35.6c2-1.2 5-1.4 7-.4" fill="none" stroke="#FFFAF0" stroke-width="1.2" stroke-linecap="round" opacity=".6"/>
    </g>
  </g>`;
}
