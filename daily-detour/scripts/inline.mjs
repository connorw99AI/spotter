// Inline the built JS and CSS into single files:
//   dist/the-daily-detour.html  standalone page (runs from disk or any static host)
//   dist/artifact.html          the same page without the document wrapper, for hosts that add their own
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
let html = readFileSync(join(dist, 'index.html'), 'utf8');
const assets = join(dist, 'assets');
for (const f of readdirSync(assets)) {
  const body = readFileSync(join(assets, f), 'utf8');
  const name = f.replace(/\./g, '\\.');
  if (f.endsWith('.js')) {
    html = html.replace(new RegExp(`<script type="module" crossorigin src="\\./assets/${name}"></script>`), () => `<script type="module">${body.replace(/<\/script/g, '<\\/script')}</script>`);
  } else if (f.endsWith('.css')) {
    html = html.replace(new RegExp(`<link rel="stylesheet" crossorigin href="\\./assets/${name}">`), () => `<style>${body}</style>`);
  }
}
if (/\.\/assets\//.test(html)) throw new Error('inline.mjs: some assets were not inlined');
writeFileSync(join(dist, 'the-daily-detour.html'), html);

// Fragment: title first (hosts scan the top of the file for it), then head content, then body content.
const head = html.match(/<head>([\s\S]*)<\/head>/)[1];
const body = html.match(/<body>([\s\S]*)<\/body>/)[1];
const title = head.match(/<title>[\s\S]*?<\/title>/)[0];
const headRest = head.replace(title, '').replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>/g, '');
writeFileSync(join(dist, 'artifact.html'), `${title}\n${headRest.trim()}\n${body.trim()}\n`);
console.log(`single-file builds: dist/the-daily-detour.html, dist/artifact.html (${(html.length / 1024).toFixed(0)} KB)`);
