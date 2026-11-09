/**
 * What Pip is wearing. Set from the save when the app starts and whenever the
 * player changes outfit; every drawing of Pip (map courier, home hero, village,
 * portrait) reads it.
 */
export type Crate = 'plain' | 'flowers' | 'picnic' | 'dog';
export interface PipStyle { frame: string; helmet: string; scarf: string; jacket: string; crate: Crate; dots: boolean }

export const DEFAULT_PIP: PipStyle = { frame: '#2F5D46', helmet: '#2F5D46', scarf: '#B85C38', jacket: '#E0B04A', crate: 'plain', dots: false };
export const pipStyle: PipStyle = { ...DEFAULT_PIP };

export function setPipStyle(s: PipStyle) {
  Object.assign(pipStyle, s);
}
