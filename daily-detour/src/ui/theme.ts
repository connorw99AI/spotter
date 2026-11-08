import type { PuzzleDef } from '../core/types';
import type { SeasonEvent } from '../game/meta';

/**
 * Scenery palettes. Only the landscape changes between themes; streets, the
 * route, markers and UI keep the same colours so puzzles always read the same.
 */
export interface Theme {
  name: 'spring' | 'summer' | 'autumn' | 'evening' | 'winter';
  label: string;
  lawn: string;
  lawnTuft: string;
  wild: string;
  garden: [string, string];
  meadow: string;
  meadowDots: string[];
  hedge: string;
  hedgeDeep: string;
  soil: string;
  crop: string;
  paving: string;
  pavingLine: string;
  leaves: { dark: string; mid: string; light: string }[];
  blossom?: string[];
  pine: [string, string];
  water: string;
  waterDeep: string;
  waterHi: string;
  bank: string;
  sun: string;
  /** Dusk tint laid over the scenery (not over route or markers). */
  tint?: string;
  lit: boolean;
}

export const THEMES: Record<Theme['name'], Theme> = {
  spring: {
    name: 'spring', label: 'Spring morning',
    lawn: '#D3E2AE', lawnTuft: '#BFD394', wild: '#C7DA9F',
    garden: ['#C6DC97', '#BCD58C'], meadow: '#CADFA0', meadowDots: ['#F4C6D4', '#FFF6DA', '#F2D36B'],
    hedge: '#7FA55E', hedgeDeep: '#5F8747', soil: '#B98D63', crop: '#7FAF55', paving: '#EFE3C8', pavingLine: '#DDCCA8',
    leaves: [
      { dark: '#6F9C57', mid: '#86B266', light: '#A9CF85' },
      { dark: '#5E8C4C', mid: '#78A65C', light: '#9CC57A' },
      { dark: '#C77B95', mid: '#E9A5BC', light: '#F7CFDC' },
    ],
    blossom: ['#F7CFDC', '#FFFFFF'],
    pine: ['#4F7B4A', '#6A955A'],
    water: '#9DCCD2', waterDeep: '#77B1BA', waterHi: '#D5EEF0', bank: '#BCD9B4',
    sun: 'rgba(255, 250, 228, .2)', lit: false,
  },
  summer: {
    name: 'summer', label: 'High summer',
    lawn: '#C9DC9C', lawnTuft: '#B3CB83', wild: '#BCD28E',
    garden: ['#BCD68A', '#B1CE7E'], meadow: '#C4D894', meadowDots: ['#F2D36B', '#FFF6DA', '#E98A6B'],
    hedge: '#6E9A50', hedgeDeep: '#527B3C', soil: '#B08559', crop: '#6EA34A', paving: '#F0E4C6', pavingLine: '#DCCBA3',
    leaves: [
      { dark: '#5B8A48', mid: '#71A257', light: '#93C171' },
      { dark: '#4E7D41', mid: '#659650', light: '#86B868' },
      { dark: '#668F45', mid: '#82AB55', light: '#A6CB72' },
    ],
    pine: ['#46723F', '#5F8C50'],
    water: '#8FC7CF', waterDeep: '#68A9B3', waterHi: '#D0EDEF', bank: '#B4D3A4',
    sun: 'rgba(255, 246, 214, .22)', lit: false,
  },
  autumn: {
    name: 'autumn', label: 'Autumn afternoon',
    lawn: '#D3D49C', lawnTuft: '#C2C283', wild: '#CACB8E',
    garden: ['#C8CF8F', '#BEC683'], meadow: '#D1CF93', meadowDots: ['#E7A04A', '#F3D27A', '#C9643C'],
    hedge: '#8A9A4E', hedgeDeep: '#6B7A39', soil: '#A87A50', crop: '#A59447', paving: '#EEDFC0', pavingLine: '#D9C59C',
    leaves: [
      { dark: '#B9612F', mid: '#D9853C', light: '#EDAE5A' },
      { dark: '#9C4A2E', mid: '#C46A3E', light: '#E0945D' },
      { dark: '#B48A2C', mid: '#D6AE42', light: '#EDCD6B' },
      { dark: '#6C8645', mid: '#86A055', light: '#A6BD72' },
    ],
    pine: ['#4B6E44', '#628956'],
    water: '#94C2C4', waterDeep: '#6EA4A9', waterHi: '#D3EBE9', bank: '#C3CC9C',
    sun: 'rgba(255, 228, 184, .2)', lit: false,
  },
  evening: {
    name: 'evening', label: 'Golden evening',
    lawn: '#BFD09A', lawnTuft: '#A9BE83', wild: '#B3C68D',
    garden: ['#B4CB8C', '#AAC281'], meadow: '#B9CB8F', meadowDots: ['#F2C46B', '#FFE9C2', '#E98A6B'],
    hedge: '#628C4C', hedgeDeep: '#486E39', soil: '#9E7752', crop: '#6E9A4B', paving: '#E9DCBE', pavingLine: '#D3C09A',
    leaves: [
      { dark: '#557F47', mid: '#6C9657', light: '#8DB570' },
      { dark: '#4A733F', mid: '#618A4F', light: '#80A867' },
      { dark: '#7C8A44', mid: '#97A653', light: '#B6C26F' },
    ],
    pine: ['#3F6339', '#55794A'],
    water: '#86B5C2', waterDeep: '#5E93A3', waterHi: '#F3D9A9', bank: '#AFC79A',
    sun: 'rgba(255, 214, 150, .18)', tint: 'rgba(92, 64, 120, .17)', lit: true,
  },
  winter: {
    name: 'winter', label: 'Winter lights',
    lawn: '#E4ECEE', lawnTuft: '#CCDADD', wild: '#DCE6E8',
    garden: ['#DEE7E9', '#D4DFE2'], meadow: '#E0E9EB', meadowDots: ['#FFFFFF', '#C9D8DB', '#D9667E'],
    hedge: '#5E8160', hedgeDeep: '#47684A', soil: '#9C8573', crop: '#C6D3CF', paving: '#ECE7DC', pavingLine: '#D3CCBC',
    leaves: [
      { dark: '#4C6E50', mid: '#5F8562', light: '#F4F8F9' },
      { dark: '#557A5A', mid: '#6A8F6B', light: '#FFFFFF' },
      { dark: '#8A6E5A', mid: '#A3876F', light: '#F4F8F9' },
    ],
    pine: ['#3D5E46', '#54775A'],
    water: '#A6C2CE', waterDeep: '#86A6B6', waterHi: '#FFFFFF', bank: '#D5E1E4',
    sun: 'rgba(255, 255, 255, .16)', tint: 'rgba(60, 80, 140, .12)', lit: true,
  },
};

export function themeFor(p: PuzzleDef): Theme {
  switch (p.tier) {
    case 'tutorial': return THEMES.spring;
    case 'approachable': return THEMES.summer;
    case 'intermediate': return THEMES.autumn;
    case 'challenging': return THEMES.evening;
  }
}

/** Seasonal events dress the daily routes in their own scenery. */
export function themeForEvent(e: SeasonEvent | null, p: PuzzleDef): Theme {
  if (!e) return themeFor(p);
  return e.id === 'winter' ? THEMES.winter : e.id === 'blossom' ? THEMES.spring : e.id === 'harvest' ? THEMES.autumn : THEMES.summer;
}

/** Scenery for the village, following the calendar. */
export function themeForMonth(month: number): Theme {
  if (month === 12 || month <= 2) return THEMES.winter;
  if (month <= 5) return THEMES.spring;
  if (month <= 8) return THEMES.summer;
  return THEMES.autumn;
}
