type Child = Node | string | number | null | undefined | false;
type Attrs = Record<string, string | number | boolean | null | undefined | EventListener>;

/** Tiny element builder. `on*` attributes become listeners. */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: (Child | Child[])[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, String(v));
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

/** Parse an SVG fragment string into a node (trusted, locally generated markup only). */
export function svgFragment(markup: string): DocumentFragment {
  const t = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  t.innerHTML = markup;
  const f = document.createDocumentFragment();
  while (t.firstChild) f.appendChild(t.firstChild);
  return f;
}

export function icon(markup: string, size = 24, cls = 'ico'): SVGSVGElement {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '-12 -12 24 24');
  s.setAttribute('width', String(size));
  s.setAttribute('height', String(size));
  s.setAttribute('class', cls);
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = markup;
  return s;
}

export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/** replaceChildren that skips null/false entries. */
export function setKids(parent: Element, ...kids: (Node | string | null | undefined | false)[]) {
  parent.replaceChildren(...(kids.filter((k) => k !== null && k !== undefined && k !== false) as (Node | string)[]));
}
