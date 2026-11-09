import { describe, expect, it } from 'vitest';
import { PROJECTS } from '../src/game/meta';
import { THEMES } from '../src/ui/theme';
import { SITES, villageArt } from '../src/ui/villageArt';

const art = (restored: string[], signs: { id: string; cost: number; ready: boolean }[] = []) =>
  villageArt({ theme: THEMES.autumn, restored: new Set(restored), kept: new Set(), fresh: null, signs, animate: false });

describe('the village', () => {
  it('changes the picture and brings out a resident for every project', () => {
    const none = art([]);
    expect(none).not.toContain('class="villager"');
    for (const p of PROJECTS) {
      const one = art([p.id]);
      expect(one, p.id).not.toEqual(none);
      expect(one, `${p.id} resident`).toContain(`data-project="${p.id}"`);
      expect(SITES[p.id], `${p.id} site`).toBeDefined();
    }
  });

  it('keeps Mrs Pennyworth in one place at a time', () => {
    const both = art(['boxes', 'bunting']);
    expect(both).toContain('data-project="bunting"');
    expect(both).not.toContain('data-project="boxes"');
  });

  it('puts up a signpost only where asked', () => {
    expect(art([])).not.toContain('v-sign');
    expect(art([], [{ id: 'lane', cost: 3, ready: true }])).toContain('v-sign ready');
    expect(art([], [{ id: 'lamps', cost: 22, ready: false }])).toMatch(/class="v-sign"/);
  });
});
