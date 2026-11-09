import { face, hash, look, type Look } from './portraits';

/**
 * Full-body villagers for the village scene. Faces come from the same `look`
 * as the portraits, so a resident in the list and in the village is visibly
 * the same person. Drawn at the feet (0,0), about 34 units tall, facing the
 * viewer; things they hold sit in the right hand.
 */

export type Prop = 'broom' | 'can' | 'pole' | 'tray' | 'spade' | 'basket' | 'tuba' | 'trumpet' | 'drum' | 'cane' | 'balloon' | 'cake' | 'none';
export type Pose = 'stand' | 'wave' | 'sit';
export interface Outfit { coat: string; legs: string; dress?: boolean; apron?: boolean; buttons?: boolean }

const COATS = ['#4D6E8C', '#B85C38', '#7C9F45', '#8A5A7A', '#D9973F', '#3E6E5A', '#6E5D7B', '#C98A4B', '#4FA593', '#D4688A'];
const LEGS = ['#3D4A43', '#5C4A3A', '#2F3E52', '#6B5B4E'];

/** Everyday clothes, picked from the name like the face is. */
export function outfitFor(seed: string): Outfit {
  const h = hash(`${seed}:clothes`);
  return { coat: COATS[h % COATS.length], legs: LEGS[(h >>> 5) % LEGS.length], dress: (h >>> 9) % 3 === 0 };
}

/** Darken a #rrggbb colour for outlines and shading. */
function shade(hex: string, k = 0.72): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.round(v * k).toString(16).padStart(2, '0');
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
}

export interface PersonOpts {
  pose?: Pose;
  prop?: Prop;
  outfit?: Outfit;
  look?: Look;
  /** Mirror left to right (the prop moves to the other hand). */
  flip?: boolean;
  /** Balloon colour, when holding one. */
  colour?: string;
}

export function personSvg(seed: string, o: PersonOpts = {}): string {
  const l = o.look ?? look(seed);
  const fit = o.outfit ?? outfitFor(seed);
  const pose = o.pose ?? 'stand';
  const prop = o.prop ?? 'none';
  const sit = pose === 'sit';
  const hip = sit ? -7 : -10;
  const sh = hip - 12;
  const headY = sh - 7.4;
  const line = shade(fit.coat);
  const skin = l.skin;

  let s = `<ellipse cx="1" cy="0" rx="${sit ? 9 : 6.6}" ry="2.2" fill="#23352B" opacity=".2"/>`;
  // Legs and shoes.
  const footY = sit ? hip + 5 : -1.4;
  s += `<path d="M-2.2 ${hip}V${footY}M2.2 ${hip}V${footY}" stroke="${fit.legs}" stroke-width="3.2" stroke-linecap="round"/>`;
  s += `<path d="M-3.8 ${footY + 0.7}h2.6M1.2 ${footY + 0.7}h2.6" stroke="#3B2A20" stroke-width="2.1" stroke-linecap="round"/>`;
  // Body: a coat, or a dress that flares over the knees.
  s += fit.dress
    ? `<path d="M-7.2 ${hip + 4.4}L-5 ${sh + 3}Q-4.8 ${sh} -2.2 ${sh}H2.2Q4.8 ${sh} 5 ${sh + 3}L7.2 ${hip + 4.4}Q0 ${hip + 6.6} -7.2 ${hip + 4.4}Z" fill="${fit.coat}" stroke="${line}" stroke-width=".8" stroke-linejoin="round"/>`
    : `<path d="M-5.2 ${hip + 0.6}L-5.2 ${sh + 3}Q-5 ${sh} -2.2 ${sh}H2.2Q5 ${sh} 5.2 ${sh + 3}L5.2 ${hip + 0.6}Q0 ${hip + 2.2} -5.2 ${hip + 0.6}Z" fill="${fit.coat}" stroke="${line}" stroke-width=".8" stroke-linejoin="round"/>`;
  if (fit.apron) s += `<path d="M-3.4 ${sh + 4}h6.8V${hip + (fit.dress ? 4.4 : 1)}Q0 ${hip + (fit.dress ? 5.8 : 2.2)} -3.4 ${hip + (fit.dress ? 4.4 : 1)}Z" fill="#FFFAF0" stroke="#D9CCB2" stroke-width=".5"/>`;
  if (fit.buttons) s += `<circle cx="0" cy="${sh + 4}" r=".8" fill="#E0B04A"/><circle cx="0" cy="${sh + 7.4}" r=".8" fill="#E0B04A"/><circle cx="0" cy="${sh + 10.8}" r=".8" fill="#E0B04A"/>`;
  s += `<path d="M-3.4 ${sh + 0.4}Q0 ${sh + 2.6} 3.4 ${sh + 0.4}" fill="none" stroke="${line}" stroke-width=".6" opacity=".6"/>`;

  // Arms: where the right hand goes depends on what it holds.
  const arm = (x1: number, y1: number, x2: number, y2: number) =>
    `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${fit.coat}" stroke-width="2.9" stroke-linecap="round"/><path d="M${x1} ${y1}L${x2} ${y2}" stroke="${line}" stroke-width="2.9" stroke-linecap="round" stroke-opacity=".25"/><circle cx="${x2}" cy="${y2 + 0.6}" r="1.45" fill="${skin}"/>`;
  let hand: [number, number];
  let props = '';
  if (prop === 'tray' || prop === 'cake' || prop === 'drum') {
    s += arm(-5, sh + 1.6, -4.4, sh + 7) + arm(5, sh + 1.6, 4.4, sh + 7);
    hand = [4.4, sh + 7];
  } else if (prop === 'trumpet') {
    s += arm(-5, sh + 1.6, -6.4, hip - 0.4) + arm(5, sh + 1.6, 6, headY + 5);
    hand = [6, headY + 5];
  } else if (pose === 'wave') {
    s += arm(-5, sh + 1.6, -6.4, hip - 0.4) + `<g class="wave-arm">${arm(5, sh + 1.6, 8.6, sh - 5)}</g>`;
    hand = [8.6, sh - 5];
  } else if (prop !== 'none') {
    s += arm(-5, sh + 1.6, -6.4, hip - 0.4) + arm(5, sh + 1.6, 7.2, hip - 2);
    hand = [7.2, hip - 2];
  } else {
    s += arm(-5, sh + 1.6, -6.4, hip - 0.4) + arm(5, sh + 1.6, 6.4, hip - 0.4);
    hand = [6.4, hip - 0.4];
  }
  const [hx, hy] = hand;
  switch (prop) {
    case 'broom':
      props = `<path d="M${hx - 1.4} ${hy - 9}L${hx + 2.2} -1.4" stroke="#8C6A45" stroke-width="1.3" stroke-linecap="round"/><path d="M${hx + 0.4} -4.2l5 3.6h-6.2z" fill="#D9B26A" stroke="#9E7A3E" stroke-width=".6" stroke-linejoin="round"/>`;
      break;
    case 'can':
      props = `<g transform="translate(${hx + 2.4} ${hy + 2})"><rect x="-2.8" y="-2.4" width="5.6" height="4.6" rx="1" fill="#5F8747" stroke="#3E5E2E" stroke-width=".6"/><path d="M2.6-1.2l3.4-2.6" stroke="#5F8747" stroke-width="1.3" stroke-linecap="round"/><path d="M-2-2.4a2 2 0 0 1 4 0" fill="none" stroke="#3E5E2E" stroke-width=".8"/><g class="drips"><circle cx="6.6" cy="-1.6" r=".6" fill="#9DCCD2"/><circle cx="7.4" cy=".6" r=".6" fill="#9DCCD2"/></g></g>`;
      break;
    case 'pole':
      props = `<path d="M${hx - 0.4} ${hy + 3}L${hx + 2.6} ${headY - 15}" stroke="#6E5236" stroke-width="1.2" stroke-linecap="round"/><circle class="flicker" cx="${hx + 2.8}" cy="${headY - 16}" r="1.6" fill="#FFD98A"/><circle cx="${hx + 2.8}" cy="${headY - 16}" r="3.6" fill="#FFE7A8" opacity=".35"/>`;
      break;
    case 'tray':
      props = `<rect x="-6.8" y="${sh + 6.2}" width="13.6" height="1.8" rx=".9" fill="#8C6A45"/>${[-4, 0, 4].map((x) => `<ellipse cx="${x}" cy="${sh + 5.4}" rx="2.1" ry="1.3" fill="#D9973F" stroke="#9A6420" stroke-width=".5"/>`).join('')}`;
      break;
    case 'cake':
      props = `<ellipse cx="0" cy="${sh + 7}" rx="6.4" ry="1.4" fill="#FFFAF0" stroke="#D9CCB2" stroke-width=".5"/><rect x="-4" y="${sh + 2.6}" width="8" height="4.2" rx="1" fill="#F7CFDC" stroke="#C77B95" stroke-width=".5"/><path d="M-4 ${sh + 3.6}h8" stroke="#FFFAF0" stroke-width="1"/><circle cx="0" cy="${sh + 2}" r="1" fill="#C8483A"/>`;
      break;
    case 'drum':
      props = `<g transform="translate(0 ${hip - 0.6})"><rect x="-5.4" y="-3.6" width="10.8" height="7.2" rx="1.6" fill="#B8402F" stroke="#7A2A1F" stroke-width=".7"/><path d="M-5.4-3.6 0 3.6 5.4-3.6" fill="none" stroke="#E0B04A" stroke-width=".8"/><ellipse cx="0" cy="-3.6" rx="5.4" ry="1.4" fill="#F3E8CF" stroke="#7A2A1F" stroke-width=".5"/></g>`;
      break;
    case 'spade':
      props = `<path d="M${hx} ${hy - 7}L${hx + 1.2} -3.4" stroke="#8C6A45" stroke-width="1.3" stroke-linecap="round"/><path d="M${hx - 0.8} ${hy - 7}h2" stroke="#8C6A45" stroke-width="1.3" stroke-linecap="round"/><path d="M${hx - 0.8} -4h4l-.7 3.8h-2.6z" fill="#A9B2AE" stroke="#5E6A66" stroke-width=".5"/>`;
      break;
    case 'basket':
      props = `<g transform="translate(${hx + 0.6} ${hy + 2.8})"><path d="M-3.8-1.4h7.6l-1.1 4.2h-5.4z" fill="#D9A55B" stroke="#8A5524" stroke-width=".6" stroke-linejoin="round"/><circle cx="-1.6" cy="-1.9" r="1.3" fill="#C8483A"/><circle cx="1.2" cy="-2.1" r="1.3" fill="#D9573F"/><path d="M-3.2-1.4a3.2 3.2 0 0 1 6.4 0" fill="none" stroke="#8A5524" stroke-width=".6"/></g>`;
      break;
    case 'tuba':
      props = `<g transform="translate(-0.6 ${hip - 4.6})"><circle r="5.2" fill="none" stroke="#E0B04A" stroke-width="2.4"/><circle r="5.2" fill="none" stroke="#A67C1E" stroke-width=".5"/><path d="M2.8-4.2l5.4-6.2" stroke="#E0B04A" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="8.8" cy="-11" rx="3.6" ry="1.7" fill="#F2CF6E" stroke="#A67C1E" stroke-width=".6" transform="rotate(-30 8.8 -11)"/></g>`;
      break;
    case 'trumpet':
      props = `<path d="M1.4 ${headY + 3.6}L9.6 ${headY + 1.4}" stroke="#E0B04A" stroke-width="1.7" stroke-linecap="round"/><path d="M9.2 ${headY - 0.6}l3.2-1.6v5.6l-3.2-1.6z" fill="#F2CF6E" stroke="#A67C1E" stroke-width=".5" stroke-linejoin="round"/>`;
      break;
    case 'cane':
      props = `<path d="M${hx} ${hy}L${hx + 1.2} ${sit ? hip + 5 : -0.8}" stroke="#6E5236" stroke-width="1.2" stroke-linecap="round"/><path d="M${hx} ${hy}q.2-2.2 2.4-2" fill="none" stroke="#6E5236" stroke-width="1.2" stroke-linecap="round"/>`;
      break;
    case 'balloon':
      props = `<g class="balloon"><path d="M${hx} ${hy}Q${hx + 4} ${hy - 12} ${hx + 2} ${headY - 10}" stroke="#7A5C3E" stroke-width=".5" fill="none"/><ellipse cx="${hx + 2}" cy="${headY - 14.6}" rx="3.8" ry="4.6" fill="${o.colour ?? '#D4688A'}"/><ellipse cx="${hx + 0.8}" cy="${headY - 16.2}" rx="1" ry="1.6" fill="#FFFFFF" opacity=".5"/></g>`;
      break;
  }
  // Tuba and drum sit in front of the body; everything else is drawn with the hand.
  const head = face(l, 0, headY, 0.62);
  const body = prop === 'tuba' || prop === 'drum' ? `${s}${head}${props}` : `${s}${props}${head}`;
  return o.flip ? `<g transform="scale(-1 1)">${body}</g>` : body;
}
