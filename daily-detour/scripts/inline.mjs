// Inline the built JS and CSS into dist/index.html, producing a single portable file
// (dist/the-daily-detour.html) that runs from disk or any static host.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
let html = readFileSync(join(dist, 'index.html'), 'utf8');
const assets = join(dist, 'assets');
for (const f of readdirSync(assets)) {
  const body = readFileSync(join(assets, f), 'utf8');
  if (f.endsWith('.js')) {
    const re = new RegExp(`<script type="module" crossorigin src="\\./assets/${f.replace('.', '\\.')}"></script>`);
    html = html.replace(re, () => `<script type="module">${body.replace(/<\/script/g, '<\\/script')}</script>`);
  } else if (f.endsWith('.css')) {
    const re = new RegExp(`<link rel="stylesheet" crossorigin href="\\./assets/${f.replace('.', '\\.')}">`);
    html = html.replace(re, () => `<style>${body}</style>`);
  }
}
if (/assets\//.test(html)) throw new Error('inline.mjs: some assets were not inlined');
writeFileSync(join(dist, 'the-daily-detour.html'), html);
console.log(`single-file build: dist/the-daily-detour.html (${(html.length / 1024).toFixed(0)} KB)`);
