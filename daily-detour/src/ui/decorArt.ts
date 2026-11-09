import { courierSvg } from './art';
import { duckArt, houseArt, lampArt, pineArt, treeArt } from './sceneryArt';
import type { Theme } from './theme';

/**
 * Shop decorations for the village, drawn like the other scenery: three-quarter
 * view, light from the top left, a soft shadow, the foot at (0,0), about 40
 * units across.
 */
const SH = 'fill="#23352B" opacity=".17"';

export function decorArt(id: string, t: Theme): string {
  switch (id) {
    case 'haybales':
      return `<ellipse cx="3" cy="3" rx="20" ry="5" ${SH}/>`
        + [[-9, 0], [9, 1], [0, -9]].map(([x, y]) => `<g transform="translate(${x} ${y})"><rect x="-9" y="-9" width="18" height="11" rx="3" fill="#E3C46A" stroke="#B08F3A" stroke-width=".9"/><ellipse cx="-9" cy="-3.5" rx="2.6" ry="5.5" fill="#D9B456" stroke="#B08F3A" stroke-width=".8"/><path d="M-4-9v11M3-9v11" stroke="#B08F3A" stroke-width=".6" opacity=".6"/></g>`).join('');
    case 'birdbath':
      return `<ellipse cx="3" cy="2" rx="12" ry="3.4" ${SH}/><path d="M-4 0h8l-2-12h-4Z" fill="#D9CCB2" stroke="#9E8B6A" stroke-width=".9"/><ellipse cx="0" cy="-13" rx="12" ry="4" fill="#E3D6BA" stroke="#9E8B6A" stroke-width=".9"/><ellipse cx="0" cy="-13.4" rx="9" ry="2.6" fill="${t.water}"/>`
        + `<g class="bird"><ellipse cx="6" cy="-17" rx="3.2" ry="2.2" fill="#9C6B4E"/><circle cx="8.4" cy="-19" r="1.6" fill="#9C6B4E"/><path d="M9.8-19l1.6.4-1.6.4" fill="#E0B04A"/><path d="M4-16.6c-1 .6-2 .4-3 0" stroke="#C46A3E" stroke-width="1"/></g>`;
    case 'sundial':
      return `<ellipse cx="3" cy="2" rx="11" ry="3" ${SH}/><path d="M-6 0h12l-1.6-11h-8.8Z" fill="#CFC2A6" stroke="#8C7B66" stroke-width=".9"/><ellipse cx="0" cy="-11.6" rx="9" ry="3.4" fill="#E9DFC9" stroke="#8C7B66" stroke-width=".9"/><path d="M0-11.6 5-17v5.4Z" fill="#B8975A" stroke="#7A5C3E" stroke-width=".6"/><path d="M-7-11.6h3M4-11.6h3M0-14.6v1.6" stroke="#8C7B66" stroke-width=".6"/>`;
    case 'picnic':
      return `<g transform="rotate(-8)"><rect x="-17" y="-10" width="34" height="18" rx="1.5" fill="#FFFAF0" stroke="#C2433A" stroke-width=".8"/>${[-11, -5, 1, 7, 13].map((x) => `<path d="M${x}-10v18" stroke="#D9574A" stroke-width="3" opacity=".55"/>`).join('')}${[-5, 1].map((y) => `<path d="M-17 ${y}h34" stroke="#D9574A" stroke-width="3" opacity=".55"/>`).join('')}</g>`
        + `<path d="M-8-6h11l-1.6 6h-7.8Z" fill="#D9A55B" stroke="#8A5524" stroke-width=".8"/><path d="M-6.4-6c0-4 8-4 8 0" fill="none" stroke="#8A5524" stroke-width="1"/><circle cx="8" cy="-1" r="2.4" fill="#C8483A"/><rect x="5" y="-8" width="3" height="6" rx="1" fill="#6FA7AE" opacity=".9"/>`;
    case 'phonebox':
      return `<path d="M-6 2H11l5-3H0Z" ${SH}/><path d="M7-28 11-31V-1L7 2Z" fill="#9E2A22"/><rect x="-8" y="-28" width="15" height="30" rx="1.4" fill="#C8352B" stroke="#8E241D" stroke-width=".9"/><path d="M-8.6-28 0-32 7.6-28Z" fill="#B02E25" stroke="#8E241D" stroke-width=".8"/><rect x="-6" y="-26" width="11" height="3" fill="#FFFAF0" opacity=".9"/>`
        + `${[0, 1, 2].map((r) => `<rect x="-5.6" y="${-21.4 + r * 5}" width="4" height="4" fill="#BFE0E4" stroke="#8E241D" stroke-width=".5"/><rect x="0" y="${-21.4 + r * 5}" width="4" height="4" fill="#BFE0E4" stroke="#8E241D" stroke-width=".5"/>`).join('')}`;
    case 'well':
      return `<ellipse cx="3" cy="3" rx="16" ry="5" ${SH}/><ellipse cx="0" cy="0" rx="13" ry="5.6" fill="#A9A08F"/><path d="M-13 0v-8h26V0" fill="#BFB6A4" stroke="#7F786F" stroke-width=".8"/><ellipse cx="0" cy="-8" rx="13" ry="5" fill="#D6CDBA" stroke="#7F786F" stroke-width=".8"/><ellipse cx="0" cy="-8" rx="9" ry="3.2" fill="#3D5E6A"/>`
        + `<path d="M-11-8v-20M11-8v-20" stroke="#7A5A3A" stroke-width="2"/><path d="M-16-26 0-36 16-26Z" fill="#B85C38" stroke="#8E4127" stroke-width=".9" stroke-linejoin="round"/><path d="M-11-21h22" stroke="#6E5236" stroke-width="1.4"/><path d="M2-21v7" stroke="#6E5236" stroke-width=".7"/><rect x="-.6" y="-14" width="5" height="4" rx="1" fill="#8C6A45"/>`;
    case 'swing':
      return `${treeArt(t, 1, 1.35)}<path d="M2-12V2M12-14V0" stroke="#8C6A45" stroke-width=".8"/><g class="swing-seat"><rect x="0" y="0" width="14" height="2.4" rx="1" fill="#A87A50" stroke="#6E5236" stroke-width=".5"/></g>`;
    case 'pond':
      return `<ellipse cx="3" cy="2" rx="24" ry="9" fill="#23352B" opacity=".1"/><ellipse cx="0" cy="-2" rx="23" ry="10" fill="${t.bank}"/><ellipse cx="0" cy="-2" rx="19.5" ry="8" fill="${t.water}"/><ellipse cx="-6" cy="-5" rx="7" ry="2" fill="${t.waterHi}" opacity=".7"/>`
        + `<path d="M-20-6v-8M-18-6v-11M-16-5v-7" stroke="${t.leaves[0].dark}" stroke-width="1.4" stroke-linecap="round"/><ellipse cx="-18" cy="-16" rx="1.2" ry="2.6" fill="#7A5A3A"/>`
        + `<g class="duck-swim" transform="translate(4 -3)">${duckArt()}</g><g class="duck-swim d2" transform="translate(-6 1) scale(-.8 .8)">${duckArt()}</g>`;
    case 'topiary':
      return `<ellipse cx="3" cy="2" rx="12" ry="3.4" ${SH}/><path d="M-6 0h12l-1.4-7h-9.2Z" fill="#B85C38" stroke="#8E4127" stroke-width=".8"/>`
        + `<path d="M-4-7C-10-12-9-22-2-24-4-29 2-34 5-30 6-27 4-25 2-24 8-22 12-15 6-7Z" fill="${t.leaves[0].mid}" stroke="${t.leaves[0].dark}" stroke-width="1"/><path d="M-8-14c-6-4-7-12-2-16M-8-12c-8-1-11-7-9-12" fill="none" stroke="${t.leaves[0].dark}" stroke-width="3.2" stroke-linecap="round"/><circle cx="4.4" cy="-29" r=".9" fill="#23352B"/>`;
    case 'stall':
      return `<path d="M-16 4H18l5-3H-11Z" ${SH}/><rect x="-16" y="-10" width="32" height="12" rx="1" fill="#C9A877" stroke="#7A5A3A" stroke-width=".9"/><path d="M-14-24V-10M14-24V-10" stroke="#7A5A3A" stroke-width="1.6"/>`
        + `<path d="M-18-30H18L15-22H-15Z" fill="#FFFAF0" stroke="#7A5C3E" stroke-width=".8"/>${[-14, -6, 2, 10].map((x) => `<path d="M${x}-30h4l-.4 8h-4Z" fill="#4FA593"/>`).join('')}<path d="M-15-22q3 3 6 0t6 0 6 0 6 0 6 0" fill="none" stroke="#7A5C3E" stroke-width=".8"/>`
        + `${[[-10, '#C8483A'], [-3, '#E98A3A'], [4, '#7FAF55'], [11, '#E7C95A']].map(([x, c]) => `<circle cx="${x}" cy="-12" r="2.4" fill="${c}"/><circle cx="${(x as number) + 2.6}" cy="-12.6" r="2.2" fill="${c}"/>`).join('')}`;
    case 'kennel':
      return `<path d="M-14 3H12l6-4H-8Z" ${SH}/><path d="M8-10 14-14V0L8 3Z" fill="#8C6A45"/><rect x="-12" y="-10" width="20" height="13" fill="#B98D63" stroke="#6E5236" stroke-width=".9"/><path d="M-14-9-2-20 10-9Z" fill="#C2643F" stroke="#97482B" stroke-width=".9" stroke-linejoin="round"/><path d="M-6 3V-3a4 4 0 0 1 8 0V3Z" fill="#3B2A20"/>`
        + `<rect x="-6" y="-17" width="8" height="3" rx="1" fill="#FFFAF0" stroke="#6E5236" stroke-width=".4"/>`
        + `<g class="dog" transform="translate(14 4)"><ellipse cx="0" cy="-3" rx="7" ry="3.6" fill="#D9B07A" stroke="#7A5C3E" stroke-width=".7"/><circle cx="6" cy="-6" r="3.4" fill="#D9B07A" stroke="#7A5C3E" stroke-width=".7"/><path d="M4-9c-1.4.6-1.8 2.8-.8 4.2" fill="#8C6A45"/><circle cx="7.2" cy="-6.6" r=".7" fill="#23352B"/><ellipse cx="9.2" cy="-5" rx=".9" ry=".7" fill="#23352B"/><path class="tail" d="M-7-4c-3-1-4-4-3-6" fill="none" stroke="#D9B07A" stroke-width="1.8" stroke-linecap="round"/></g>`;
    case 'statue':
      return `<path d="M-14 3H16l5-4H-9Z" ${SH}/><rect x="-14" y="-10" width="28" height="13" rx="1" fill="#D6CDBA" stroke="#8C7B66" stroke-width=".9"/><rect x="-16" y="-12" width="32" height="3.4" rx="1" fill="#E9DFC9" stroke="#8C7B66" stroke-width=".8"/><rect x="-7" y="-6" width="14" height="4" rx="1" fill="#B8975A" opacity=".7"/>`
        + `<g filter="url(#v-bronze)" transform="translate(0 -21) scale(.46)">${courierSvg()}</g>`;
    default:
      return '';
  }
}

/** A small framed preview of a decoration, for the shop. */
export function decorPreview(id: string, t: Theme, size = 64): string {
  return `<svg viewBox="-26 -40 52 48" width="${size}" height="${Math.round(size * 0.92)}" aria-hidden="true"><defs>${BRONZE}</defs>${decorArt(id, t)}</svg>`;
}

export const BRONZE = '<filter id="v-bronze"><feColorMatrix type="matrix" values=".33 .33 .33 0 .12  .27 .27 .27 0 .06  .18 .18 .18 0 .0  0 0 0 1 0"/></filter>';

/** A little scene in a map look's colours, for the shop. */
export function lookPreview(t: Theme): string {
  const glow = t.lit ? '<circle cx="30" cy="44" r="20" fill="#FFD98A" opacity=".35"/><circle cx="86" cy="40" r="14" fill="#FFE7A8" opacity=".4"/>' : '';
  return `<svg viewBox="0 0 120 84" width="100%" aria-hidden="true">
    <rect width="120" height="84" fill="${t.lawn}"/>
    <path d="M-4 66C30 58 70 72 124 60" fill="none" stroke="#D3C19A" stroke-width="15"/><path d="M-4 66C30 58 70 72 124 60" fill="none" stroke="#F3E8CF" stroke-width="10"/>
    <rect x="70" y="8" width="44" height="30" rx="6" fill="${t.hedgeDeep}"/><rect x="74" y="12" width="36" height="22" rx="4" fill="${t.garden[0]}"/><rect x="74" y="12" width="18" height="22" fill="${t.garden[1]}"/>
    ${glow}
    <g transform="translate(30 52)">${houseArt({ roof: '#C2643F', roofShade: '#97482B', wall: '#F6E7CB', wallShade: '#DCC7A3', door: '#2F5D46', lit: t.lit, chimney: true, flowers: true }, 1.1)}</g>
    <g transform="translate(58 46)">${treeArt(t, 0, 1)}</g><g transform="translate(10 30)">${pineArt(t, .9)}</g><g transform="translate(100 74)">${treeArt(t, 1, .9)}</g>
    <g transform="translate(86 56)">${lampArt(t.lit)}</g>
    ${t.tint ? `<rect width="120" height="84" fill="${t.tint}"/>` : ''}
  </svg>`;
}
