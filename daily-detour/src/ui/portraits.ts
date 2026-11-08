/**
 * Illustrated portraits, built from a name so each resident always looks the same.
 * Couples and groups get two or three faces. Drawn in a -20..20 box.
 */
const SKIN = ['#F5D7BD', '#EBC19D', '#D9A47C', '#B97C55', '#8E5A3A', '#6B4128'];
const HAIR = ['#3B2A20', '#6B4A2E', '#A86F3C', '#D9B26A', '#B8B8B0', '#2B2B33', '#B4512F'];
const BG = ['#F6E2C2', '#DCEBD3', '#F7DCE4', '#D5EEE7', '#E7E1F2', '#FBEFCF'];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

interface Look { skin: string; hair: string; style: number; glasses: boolean; beard: boolean; hat: number; older: boolean }

function look(seed: string): Look {
  const h = hash(seed);
  const pick = <T>(xs: T[], k: number) => xs[(h >>> k) % xs.length];
  const older = /^(Old|Grandma|Mr |Mrs |Dr |Pastor|Professor|Captain|Auntie)/.test(seed);
  return {
    skin: pick(SKIN, 3), hair: older && (h >>> 9) % 3 === 0 ? '#C9C6BE' : pick(HAIR, 6), style: (h >>> 12) % 5,
    glasses: (h >>> 15) % 4 === 0 || /Professor|Dr /.test(seed), beard: /Mr |Captain|Albert|Fergus|Tobias|Pastor|Professor/.test(seed) && (h >>> 18) % 2 === 0,
    hat: /Captain/.test(seed) ? 2 : (h >>> 20) % 7 === 0 ? 1 : 0, older,
  };
}

function face(l: Look, x: number, y: number, s: number): string {
  const hairBack = l.style === 2 ? `<path d="M-12 -2C-14 10-10 16-8 16H8C10 16 14 10 12-2Z" fill="${l.hair}"/>` : l.style === 3 ? `<circle cx="0" cy="-13" r="6" fill="${l.hair}"/>` : '';
  const hairTop = [
    `<path d="M-11-3C-11-14 11-14 11-3C7-8-7-8-11-3Z" fill="${l.hair}"/>`,
    `<path d="M-11-2C-12-13 0-16 6-12 10-10 12-6 11-2 6-8-4-9-11-2Z" fill="${l.hair}"/>`,
    `<path d="M-11-1C-12-13 12-13 11-1 9-7 2-9-1-6-4-9-9-7-11-1Z" fill="${l.hair}"/>`,
    `<path d="M-11-2C-11-12 11-12 11-2 6-7-6-7-11-2Z" fill="${l.hair}"/>`,
    `${[-8, -4, 0, 4, 8].map((cx, i) => `<circle cx="${cx}" cy="${-8 - (i % 2) * 2}" r="4" fill="${l.hair}"/>`).join('')}`,
  ][l.style];
  const hat = l.hat === 2
    ? `<path d="M-12-8H12L9-15H-9Z" fill="#2F4A5E"/><rect x="-13" y="-9" width="26" height="3" rx="1.5" fill="#1F3344"/><circle cx="0" cy="-12" r="1.8" fill="#E0B04A"/>`
    : l.hat === 1 ? `<ellipse cx="0" cy="-8" rx="15" ry="3.4" fill="#D9B26A"/><path d="M-8-8C-8-16 8-16 8-8Z" fill="#E7C58A"/><path d="M-8-9.5H8" stroke="#B85C38" stroke-width="2"/>` : '';
  return `<g transform="translate(${x} ${y}) scale(${s})">
    ${hairBack}
    <path d="M-7 12C-7 18 7 18 7 12Z" fill="${l.skin}"/>
    <circle r="11" fill="${l.skin}"/>
    <circle cx="-11" cy="1" r="2.4" fill="${l.skin}"/><circle cx="11" cy="1" r="2.4" fill="${l.skin}"/>
    ${hairTop}${hat}
    <circle cx="-4" cy="0" r="1.4" fill="#23352B"/><circle cx="4" cy="0" r="1.4" fill="#23352B"/>
    ${l.older ? '<path d="M-6.5-3.4h-2M6.5-3.4h2" stroke="#23352B" stroke-width=".7" opacity=".5"/>' : ''}
    <circle cx="-6.5" cy="4" r="2.2" fill="#E77D9C" opacity=".35"/><circle cx="6.5" cy="4" r="2.2" fill="#E77D9C" opacity=".35"/>
    ${l.beard ? `<path d="M-8 4C-8 13 8 13 8 4 5 8-5 8-8 4Z" fill="${l.hair}"/>` : ''}
    <path d="M-3 5.4C-1.4 7.4 1.4 7.4 3 5.4" fill="none" stroke="#8E4127" stroke-width="1.2" stroke-linecap="round"/>
    ${l.glasses ? '<g fill="none" stroke="#23352B" stroke-width="1"><circle cx="-4" cy="0" r="3.2"/><circle cx="4" cy="0" r="3.2"/><path d="M-.8 0h1.6"/></g>' : ''}
  </g>`;
}

/** Pip, the courier: matches the bike sprite (green helmet, terracotta scarf). */
function pip(): string {
  const l: Look = { skin: '#F1D7B8', hair: '#6B4A2E', style: 0, glasses: false, beard: false, hat: 0, older: false };
  return `${face(l, 0, 1, 1)}<path d="M-12-4C-12-16 12-16 12-4Z" fill="#2F5D46"/><path d="M10-5h6" stroke="#2F5D46" stroke-width="2.4" stroke-linecap="round"/><path d="M-8 14C-3 17 3 17 8 14" stroke="#B85C38" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
}

export function portraitSvg(name: string, size = 40): string {
  const bg = BG[hash(name) % BG.length];
  let inner: string;
  if (name === 'Pip') inner = pip();
  else if (/^(Everyone|The Brass Club)$/.test(name)) inner = [-10, 10, 0].map((x, i) => face(look(`${name}${i}`), x, i === 2 ? 4 : -2, 0.62)).join('');
  else if (/ and |twins|Lindqvists/.test(name)) inner = face(look(`${name}a`), -8, 1, 0.72) + face(look(`${name}b`), 8, 3, 0.72);
  else inner = face(look(name), 0, 2, 1);
  return `<svg viewBox="-20 -20 40 40" width="${size}" height="${size}" class="portrait" aria-hidden="true"><defs><clipPath id="pc-${hash(name)}"><circle r="19"/></clipPath></defs><circle r="19.5" fill="${bg}" stroke="#FFFAF0" stroke-width="1.5"/><g clip-path="url(#pc-${hash(name)})">${inner}</g></svg>`;
}
