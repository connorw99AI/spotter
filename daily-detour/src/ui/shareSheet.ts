import { medalName, type Medal } from '../core/medals';
import { buildTown } from '../core/town';
import { puzzleLabel } from '../data/catalog';
import { shareText, type ShareInput } from '../game/share';
import type { AppServices } from './appTypes';
import { flameIcon } from './art';
import { showCopyBox } from './copyBox';
import { h } from './dom';
import { miniMapSvg } from './scene';
import { themeFor } from './theme';

export interface ShareCardInput extends ShareInput {
  run?: number;
}

const INK: Record<Medal, string> = { gold: '#C99520', silver: '#7F8F99', bronze: '#A4663A' };

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * A spoiler-free result card: the town's layout and stops (public before you
 * play), the stamp, moves, hints and run. Never the route itself.
 */
export async function renderShareCard(i: ShareCardInput): Promise<HTMLCanvasElement> {
  const W = 1080, H = 1350;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  try {
    await Promise.all([document.fonts.load('72px "Young Serif"'), document.fonts.load('800 40px Nunito'), document.fonts.load('600 40px Nunito')]);
  } catch {
    /* fall back to system fonts */
  }
  const serif = '"Young Serif", Georgia, serif';
  const sans = 'Nunito, "Segoe UI", system-ui, sans-serif';
  g.fillStyle = '#FBF4E4';
  g.fillRect(0, 0, W, H);
  // Paper docket.
  g.fillStyle = '#FFFAF0';
  g.strokeStyle = '#E4D6B8';
  g.lineWidth = 4;
  g.beginPath();
  g.roundRect(60, 60, W - 120, H - 120, 40);
  g.fill();
  g.stroke();
  g.textAlign = 'center';
  g.fillStyle = '#2F5D46';
  g.font = `76px ${serif}`;
  g.fillText('The Daily Detour', W / 2, 190);
  g.fillStyle = '#8E4127';
  g.font = `800 40px ${sans}`;
  const head = i.daily ? `Daily #${i.daily.number} · ${new Date(`${i.daily.dateKey}T12:00:00Z`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}` : puzzleLabel(i.puzzle);
  g.fillText(head, W / 2, 256);
  g.fillStyle = '#23352B';
  g.font = `52px ${serif}`;
  g.fillText(i.puzzle.title, W / 2, 330);

  // Map: the layout only.
  const svg = miniMapSvg(buildTown(i.puzzle), themeFor(i.puzzle)).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" ');
  const img = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
  const mx = (W - 600) / 2, my = 380;
  g.save();
  g.beginPath();
  g.roundRect(mx, my, 600, 600, 36);
  g.clip();
  if (img) g.drawImage(img, mx, my, 600, 600);
  else { g.fillStyle = '#CFDDAE'; g.fillRect(mx, my, 600, 600); }
  g.restore();

  // Stamp, pressed over the corner of the map.
  g.save();
  g.translate(mx + 560, my + 520);
  g.rotate((-10 * Math.PI) / 180);
  g.fillStyle = 'rgba(255, 250, 240, .92)';
  g.beginPath(); g.arc(0, 0, 150, 0, Math.PI * 2); g.fill();
  g.strokeStyle = INK[i.medal];
  g.lineWidth = 8; g.beginPath(); g.arc(0, 0, 146, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 4; g.beginPath(); g.arc(0, 0, 130, 0, Math.PI * 2); g.stroke();
  g.fillStyle = INK[i.medal];
  g.font = `84px ${serif}`;
  g.fillText(medalName[i.medal], 0, 16);
  g.font = `800 34px ${sans}`;
  g.fillText(`${i.moves} moves`, 0, 66);
  g.restore();

  g.fillStyle = '#23352B';
  g.font = `600 40px ${sans}`;
  g.fillText(`${i.moves} moves · gold is ${i.gold} · ${i.hints === 0 ? 'no hints' : i.hints === 1 ? '1 hint' : `${i.hints} hints`}`, W / 2, 1090);
  if (i.run && i.run > 1) {
    const text = `${i.run}-day run`;
    g.font = `800 40px ${sans}`;
    const tw = g.measureText(text).width;
    g.save();
    g.translate(W / 2 - tw / 2 - 30, 1146);
    g.scale(2.2, 2.2);
    g.fill(new Path2D((flameIcon.match(/d="([^"]+)"/) ?? [])[1] ?? ''));
    g.restore();
    g.fillStyle = '#A67C1E';
    g.fillText(text, W / 2 + 10, 1160);
  }
  g.fillStyle = '#5B6A5E';
  g.font = `600 34px ${sans}`;
  g.fillText('A little journey. A clever detour.', W / 2, 1236);
  return c;
}

function canvasBlob(c: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => c.toBlob((b) => resolve(b), 'image/png'));
}

/** Result sharing: a picture card plus the text, with fallbacks wherever the platform says no. */
export async function openShareSheet(app: AppServices, input: ShareCardInput, status: HTMLElement) {
  void app;
  const text = shareText(input) + (input.run && input.run > 1 ? `\n${input.run}-day run` : '');
  const canvas = await renderShareCard(input);
  const blob = await canvasBlob(canvas);
  const file = blob ? new File([blob], 'daily-detour.png', { type: 'image/png' }) : null;
  const url = blob ? URL.createObjectURL(blob) : canvas.toDataURL('image/png');
  const nav = navigator as Navigator;
  const canShareFile = !!(file && typeof nav.share === 'function' && nav.canShare?.({ files: [file] }));
  const embedded = (() => { try { return window.self !== window.top; } catch { return true; } })();
  const sheetStatus = h('p', { class: 'share-status', 'aria-live': 'polite' });
  const close = () => { backdrop.remove(); URL.revokeObjectURL(url); };
  const backdrop = h('div', { class: 'sheet-backdrop', onclick: (e: Event) => { if (e.target === backdrop) close(); } },
    h('div', { class: 'share-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Share your result' },
      h('img', { class: 'share-card', src: url, alt: `Result card: ${input.puzzle.title}, ${medalName[input.medal]}, ${input.moves} moves.` }),
      h('p', { class: 'muted share-tip' }, canShareFile ? 'The card shows the town, never your route.' : 'The card shows the town, never your route. Press and hold it to save.'),
      h('div', { class: 'share-actions' },
        canShareFile ? h('button', { class: 'btn btn-primary', type: 'button', onclick: async () => {
          try { await nav.share({ files: [file!], text }); sheetStatus.textContent = 'Shared.'; } catch (e) { if (!(e instanceof DOMException && e.name === 'AbortError')) sheetStatus.textContent = 'Sharing the picture didn’t work here. Try copying the text.'; }
        } }, 'Share picture') : null,
        h('button', { class: 'btn btn-quiet', type: 'button', onclick: async () => {
          try { await navigator.clipboard.writeText(text); sheetStatus.textContent = 'Result text copied.'; } catch { showCopyBox(sheetStatus, text); }
        } }, 'Copy text'),
        !embedded && blob ? h('a', { class: 'btn btn-quiet', href: url, download: 'daily-detour.png' }, 'Save picture') : null,
      ),
      sheetStatus,
      h('button', { class: 'btn-link sheet-close', type: 'button', onclick: close }, 'Close'),
    ));
  document.body.append(backdrop);
  (backdrop.querySelector('.btn') as HTMLElement | null)?.focus();
  backdrop.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  status.textContent = '';
}
