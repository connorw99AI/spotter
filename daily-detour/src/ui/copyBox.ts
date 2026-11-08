import { h } from './dom';

/** When neither the share sheet nor the clipboard is available, show the text selected for copying by hand. */
export function showCopyBox(status: HTMLElement, text: string) {
  const ta = h('textarea', { class: 'copy-box', readonly: true, rows: 3, 'aria-label': 'Result text to copy' }) as HTMLTextAreaElement;
  ta.value = text;
  status.replaceChildren(h('span', {}, 'Sharing isn’t available here. Copy your result:'), ta);
  ta.focus();
  ta.select();
}
