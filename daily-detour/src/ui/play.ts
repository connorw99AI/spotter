import { medalFor, medalName, thresholds, type Medal } from '../core/medals';
import { allDelivered, carriedCount, freshLeft, isComplete, type StepEvent } from '../core/rules';
import { buildTown, streetNeighbours, type Town } from '../core/town';
import type { NodeId, PuzzleDef, TipDef } from '../core/types';
import type { Advice } from '../game/advisor';
import { dailyNumber } from '../game/daily';
import { RouteEditor, type EditResult } from '../game/editor';
import { shareResult, shareText } from '../game/share';
import type { AppServices } from './appTypes';
import { backIcon, basketIcon, clearIcon, hintIcon, itemIcon, playIcon, redoIcon, shareIcon, undoIcon, shopColour } from './art';
import { h, icon, setKids } from './dom';
import { MapView } from './mapView';
import { Ride } from './ride';
import { describeBlock, describeDoom, describeEvents, describeNodeForStep, describeObjective, houseOf, itemName, orderKind, shopName } from './text';

type Tone = 'info' | 'good' | 'warn' | 'tip';

interface Message {
  text: string;
  tone: Tone;
  action?: { label: string; run: () => void };
}

interface HintEntry {
  stage: 1 | 2 | 3;
  text: string;
  routeKey: string;
  action?: { label: string; run: () => void };
}

const DIRS: Record<string, [number, number]> = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
  Home: [-1, -1], PageUp: [1, -1], End: [-1, 1], PageDown: [1, 1],
};

export interface PlayOptions {
  puzzle: PuzzleDef;
  mode: 'practice' | 'daily';
  dateKey?: string;
}

/** One puzzle session: planning, hints, the ride and the result docket. */
export class PlayScreen {
  readonly root: HTMLElement;
  private alive = true;
  private readonly town: Town;
  private readonly editor: RouteEditor;
  private readonly map: MapView;
  private readonly t: { gold: number; silver: number };
  private readonly draftKey: string;
  private hints = 0;
  private hintLog: HintEntry[] = [];
  private stage1Shown = false;
  private shownTips = new Set<string>();
  private message: Message;
  private ride: Ride | null = null;
  private adviceTimer = 0;
  private adviceSeq = 0;
  private lastAdvice: { key: string; advice: Advice } | null = null;
  private hintFocus: { objective?: NodeId | null; step?: [NodeId, NodeId] | null } = {};
  private chipFocus: NodeId[] = [];
  private chipTimer = 0;
  private selected: NodeId | null = null;
  private completedThisVisit = false;
  private timers = new Set<number>();

  // DOM
  private coachEl!: HTMLElement;
  private srEl!: HTMLElement;
  private ordersEl!: HTMLElement;
  private statsEl!: HTMLElement;
  private undoBtn!: HTMLButtonElement;
  private redoBtn!: HTMLButtonElement;
  private clearBtn!: HTMLButtonElement;
  private rideBtn!: HTMLButtonElement;
  private hintBtn!: HTMLButtonElement;
  private hintPanel!: HTMLElement;
  private rideBar!: HTMLElement;
  private docket!: HTMLElement;
  private mapWrap!: HTMLElement;

  constructor(private readonly app: AppServices, private readonly opts: PlayOptions) {
    const p = opts.puzzle;
    this.town = buildTown(p);
    this.t = thresholds(p.gold);
    this.draftKey = opts.mode === 'daily' ? `daily:${opts.dateKey}` : `practice:${p.id}`;
    const draft = app.store.draft(this.draftKey, p.id, p.rev);
    this.editor = new RouteEditor(this.town, draft?.route);
    this.hints = draft?.hints ?? 0;
    this.map = new MapView(this.town, `Map of ${p.title}. Draw a route from your cottage.`);
    const startTip = this.tip('start');
    this.message = this.editor.moves > 0
      ? { text: 'Welcome back — your route is just as you left it.', tone: 'info' }
      : startTip ? { text: startTip, tone: 'tip' } : { text: p.brief, tone: 'info' };
    if (startTip) this.shownTips.add('start');
    this.root = this.build();
    this.bindInput();
    this.renderAll();
    if (this.editor.moves > 0) this.scheduleAdvice();
  }

  // ─────────────────────────────── building ───────────────────────────────

  private build(): HTMLElement {
    const p = this.opts.puzzle;
    const label = this.opts.mode === 'daily' ? `Daily #${dailyNumber(this.opts.dateKey!)}` : `Route ${p.number}`;
    this.hintBtn = h('button', { class: 'btn-icon btn-hint', type: 'button', 'aria-label': 'Hints', onclick: () => this.toggleHints() }, icon(hintIcon, 22), h('span', { class: 'btn-hint-label' }, 'Hint'));
    const top = h('header', { class: 'play-top' },
      h('button', { class: 'btn-icon', type: 'button', 'aria-label': this.opts.mode === 'daily' ? 'Back to town' : 'Back to the route book', onclick: () => this.leave() }, icon(backIcon, 22)),
      h('div', { class: 'play-title' }, h('span', { class: 'play-kicker' }, label), h('h1', {}, p.title)),
      this.hintBtn,
    );
    this.coachEl = h('div', { class: 'coach', 'aria-live': 'polite' });
    this.srEl = h('div', { class: 'sr-only', 'aria-live': 'polite' });
    const help = h('p', { class: 'sr-only', id: 'map-help' }, 'Arrow keys ride to the next corner in that direction. Space picks between nearby corners and Enter rides there. Backspace undoes.');
    this.map.svg.setAttribute('aria-describedby', 'map-help');
    this.mapWrap = h('div', { class: 'map-wrap' }, this.map.svg, help);
    this.ordersEl = h('ul', { class: 'orders', 'aria-label': 'Orders' });
    this.statsEl = h('div', { class: 'stats' });
    this.undoBtn = h('button', { class: 'btn-icon', type: 'button', 'aria-label': 'Undo', title: 'Undo', onclick: () => this.doUndo() }, icon(undoIcon, 22));
    this.redoBtn = h('button', { class: 'btn-icon', type: 'button', 'aria-label': 'Redo', title: 'Redo', onclick: () => this.doRedo() }, icon(redoIcon, 22));
    this.clearBtn = h('button', { class: 'btn-icon', type: 'button', 'aria-label': 'Clear route', title: 'Clear route', onclick: () => this.doClear() }, icon(clearIcon, 20));
    this.rideBtn = h('button', { class: 'btn btn-ride', type: 'button', onclick: () => this.startRide() });
    const controls = h('div', { class: 'controls' }, h('div', { class: 'edit-btns' }, this.undoBtn, this.redoBtn, this.clearBtn), this.rideBtn);
    this.hintPanel = h('section', { class: 'hint-panel', hidden: true, 'aria-label': 'Hints' });
    this.rideBar = h('div', { class: 'ride-bar', hidden: true },
      h('button', { class: 'btn btn-quiet', type: 'button', onclick: () => this.cancelRide() }, 'Stop'),
      h('span', { class: 'ride-status', 'aria-live': 'polite' }),
      h('button', { class: 'btn btn-quiet', type: 'button', onclick: () => this.ride?.skip() }, 'Skip'),
    );
    this.docket = h('div', { class: 'docket-backdrop', hidden: true });
    const side = h('div', { class: 'play-side' }, this.coachEl, h('div', { class: 'tray' }, this.ordersEl, this.statsEl), controls, this.rideBar, this.hintPanel);
    return h('section', { class: 'screen play' }, top, h('div', { class: 'play-body' }, this.mapWrap, side), this.srEl, this.docket);
  }

  // ─────────────────────────────── input ───────────────────────────────

  private bindInput() {
    const svg = this.map.svg;
    let dragging = false;
    let moved = false;
    let downPt: { x: number; y: number } | null = null;
    let last: { x: number; y: number } | null = null;
    let lastBlocked: NodeId | null = null;
    let pointerId = -1;

    const candidates = (): NodeId[] => {
      const end = this.editor.end;
      const c = streetNeighbours(this.town, end);
      const prev = this.editor.route[this.editor.route.length - 2];
      if (prev && !c.includes(prev)) c.push(prev);
      return c;
    };

    const probe = (pt: { x: number; y: number }) => {
      if (lastBlocked) {
        const p = this.town.pos.get(lastBlocked)!;
        if (Math.hypot(pt.x - p.x * 100, pt.y - p.y * 100) > this.map.hitRadius) lastBlocked = null;
      }
      const hit = this.map.nodeNear(pt, candidates().filter((c) => c !== lastBlocked));
      if (!hit) return;
      const r = this.apply(hit, 'pointer');
      if (!r.changed) lastBlocked = hit;
    };

    svg.addEventListener('pointerdown', (e) => {
      if (this.ride || !this.alive) return;
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      const pt = this.map.toMap(e.clientX, e.clientY);
      if (!pt) return;
      e.preventDefault();
      pointerId = e.pointerId;
      try { svg.setPointerCapture(e.pointerId); } catch { /* not supported */ }
      dragging = true;
      moved = false;
      downPt = pt;
      last = pt;
      lastBlocked = null;
      this.selected = null;
      this.app.sound.play('tap');
      probe(pt);
    });

    svg.addEventListener('pointermove', (e) => {
      if (!dragging || e.pointerId !== pointerId || this.ride) return;
      const pt = this.map.toMap(e.clientX, e.clientY);
      if (!pt || !last) return;
      if (downPt && Math.hypot(pt.x - downPt.x, pt.y - downPt.y) > 12) moved = true;
      // Sample along the movement so fast swipes cannot skip a corner.
      const d = Math.hypot(pt.x - last.x, pt.y - last.y);
      const steps = Math.max(1, Math.ceil(d / (this.map.hitRadius / 3)));
      for (let i = 1; i <= steps; i++) {
        probe({ x: last.x + ((pt.x - last.x) * i) / steps, y: last.y + ((pt.y - last.y) * i) / steps });
      }
      last = pt;
    });

    const end = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return;
      dragging = false;
      try { svg.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
      if (!moved && downPt && !this.ride) {
        // A tap that did nothing: explain if it landed on a far-away corner.
        const near = this.map.nodeNear(downPt, this.town.nodeIds);
        if (near && near !== this.editor.end && !candidates().includes(near)) {
          this.say({ text: 'Pick a corner joined to the end of your route — the soft green circles.', tone: 'info' });
          this.pulseLegal();
        }
      }
      downPt = null;
      last = null;
    };
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);
    svg.addEventListener('contextmenu', (e) => e.preventDefault());

    svg.addEventListener('keydown', (e) => this.onMapKey(e));
    this.root.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) this.doRedo(); else this.doUndo();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        this.doRedo();
      } else if (e.key === 'Escape') {
        if (!this.docket.hidden) this.closeDocket();
        else if (!this.hintPanel.hidden) this.toggleHints(false);
        else if (this.ride) this.cancelRide();
      }
    });
  }

  private onMapKey(e: KeyboardEvent) {
    if (this.ride || e.metaKey || e.ctrlKey || e.altKey) return;
    const end = this.editor.end;
    const neighbours = streetNeighbours(this.town, end);
    if (DIRS[e.key]) {
      e.preventDefault();
      const [dx, dy] = DIRS[e.key];
      const want = Math.atan2(dy, dx);
      const p0 = this.town.pos.get(end)!;
      let best: NodeId | null = null;
      let bestDiff = (70 * Math.PI) / 180;
      for (const v of neighbours) {
        const p = this.town.pos.get(v)!;
        let diff = Math.abs(Math.atan2(p.y - p0.y, p.x - p0.x) - want);
        if (diff > Math.PI) diff = 2 * Math.PI - diff;
        if (diff < bestDiff) { bestDiff = diff; best = v; }
      }
      if (best) {
        this.selected = null;
        this.apply(best, 'key');
      } else {
        this.say({ text: 'No street that way. Space cycles through the corners you can reach.', tone: 'info' });
      }
    } else if (e.key === ' ') {
      e.preventDefault();
      if (!neighbours.length) return;
      const i = this.selected ? neighbours.indexOf(this.selected) : -1;
      this.selected = neighbours[(i + 1) % neighbours.length];
      this.srEl.textContent = `Selected ${describeNodeForStep(this.town, this.selected)}. Press Enter to ride there.`;
      this.renderOverlay();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (this.selected) {
        const v = this.selected;
        this.selected = null;
        this.apply(v, 'key');
      } else if (this.editor.moves > 0) {
        this.startRide();
      }
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      this.doUndo();
    }
  }

  /** Apply the shared movement rule and give feedback. */
  private apply(v: NodeId, _source: 'pointer' | 'key'): EditResult {
    const from = this.editor.end;
    const r = this.editor.moveTo(v);
    if (r.changed) {
      this.app.sound.play(r.action === 'erase' ? 'erase' : 'step');
      this.app.haptics(6);
      if (r.action !== 'erase') this.reactToEvents(r.events, v);
      else this.say(this.planningMessage());
      this.afterChange();
      this.srEl.textContent = `${r.action === 'erase' ? 'Erased back to' : 'Rode to'} ${describeNodeForStep(this.town, this.editor.end)}. ${this.editor.moves} moves.`;
    } else if (r.blocked) {
      this.app.sound.play('blocked');
      this.app.haptics([12, 40, 12]);
      this.map.flashBlocked(from, v);
      const tip = this.tip('blocked');
      this.say({ text: tip && !this.shownTips.has('blocked') ? tip : describeBlock(this.town, r.blocked), tone: 'warn' });
      if (tip) this.shownTips.add('blocked');
    }
    return r;
  }

  private reactToEvents(events: readonly StepEvent[], node: NodeId) {
    for (const e of events) {
      if (e.type === 'pickup' || e.type === 'deliver' || e.type === 'full') {
        this.map.pop(node, e.type, orderKind(this.town, e.order));
        if (e.type === 'pickup') this.app.sound.play('pickup');
        if (e.type === 'deliver') this.app.sound.play('deliver');
      }
    }
    const state = this.editor.state;
    const complete = isComplete(this.town, state);
    const order: TipDef['on'][] = complete ? ['complete'] : [];
    if (events.some((e) => e.type === 'deliver') && allDelivered(state)) order.push('allDelivered');
    for (const ev of events) order.push(ev.type as TipDef['on']);
    for (const on of order) {
      const tip = this.tip(on);
      if (tip && !this.shownTips.has(on)) {
        this.shownTips.add(on);
        this.say({ text: tip, tone: 'tip' });
        return;
      }
    }
    const text = describeEvents(this.town, events, allDelivered(state));
    if (text) this.say({ text, tone: complete || events.some((e) => e.type === 'deliver') ? 'good' : 'info' });
    else this.say(this.planningMessage());
  }

  private tip(on: TipDef['on']): string | undefined {
    return this.opts.puzzle.tips?.find((t) => t.on === on)?.text;
  }

  private planningMessage(): Message {
    const s = this.editor.state;
    if (this.editor.moves === 0) return { text: this.opts.puzzle.brief, tone: 'info' };
    if (isComplete(this.town, s)) return { text: 'Home with everything delivered. Press Deliver to send the courier off.', tone: 'good' };
    for (let i = 0; i < s.orders.length; i++) {
      const left = freshLeft(this.town, s, i);
      if (left !== null && left <= 2) {
        const k = orderKind(this.town, i);
        return { text: `The ${itemName[k]} for House ${houseOf(this.town, i)} has ${left === 0 ? 'no moves' : left === 1 ? '1 move' : '2 moves'} left.`, tone: 'warn' };
      }
    }
    if (allDelivered(s)) return { text: 'Everything’s delivered — head home to finish.', tone: 'good' };
    const left = s.orders.filter((o) => o.status !== 2).length;
    return { text: `${left} ${left === 1 ? 'order' : 'orders'} still to go.`, tone: 'info' };
  }

  private pulseLegal() {
    this.mapWrap.classList.remove('pulse-legal');
    void this.mapWrap.offsetWidth;
    this.mapWrap.classList.add('pulse-legal');
  }

  // ─────────────────────────────── editing actions ───────────────────────────────

  private doUndo() {
    if (this.ride || !this.editor.undo()) return;
    this.app.sound.play('erase');
    this.say(this.planningMessage());
    this.afterChange();
  }

  private doRedo() {
    if (this.ride || !this.editor.redo()) return;
    this.app.sound.play('step');
    this.say(this.planningMessage());
    this.afterChange();
  }

  private doClear() {
    if (this.ride || !this.editor.clear()) return;
    this.app.sound.play('erase');
    this.say({ text: 'Route cleared. Undo brings it back.', tone: 'info' });
    this.afterChange();
  }

  private keepMoves(k: number) {
    if (this.ride) return;
    const removed = this.editor.moves - k;
    if (this.editor.truncate(k)) {
      this.app.sound.play('erase');
      this.say({ text: `Undid ${removed} ${removed === 1 ? 'move' : 'moves'}. Undo puts them back.`, tone: 'info' });
      this.afterChange();
    }
  }

  private afterChange() {
    this.hintFocus = {};
    this.renderAll();
    this.app.store.saveDraft({ key: this.draftKey, puzzleId: this.opts.puzzle.id, rev: this.opts.puzzle.rev, route: [...this.editor.route], hints: this.hints });
    this.scheduleAdvice();
    if (!this.hintPanel.hidden) this.renderHints();
  }

  // ─────────────────────────────── advice (doom check) ───────────────────────────────

  private routeKey() { return this.editor.route.join(' '); }

  private scheduleAdvice() {
    clearTimeout(this.adviceTimer);
    this.adviceTimer = window.setTimeout(() => void this.fetchAdvice().then((a) => {
      if (!a || !this.alive || this.ride) return;
      if (a.status === 'doomed' && a.undoTo !== undefined) {
        const k = a.undoTo;
        this.say({
          text: describeDoom(this.town, a.reason),
          tone: 'warn',
          action: { label: `Undo to move ${k}`, run: () => this.keepMoves(k) },
        });
      }
    }), 160);
  }

  private async fetchAdvice(): Promise<Advice | null> {
    const key = this.routeKey();
    if (this.lastAdvice?.key === key) return this.lastAdvice.advice;
    const seq = ++this.adviceSeq;
    const a = await this.app.advisor.request(this.opts.puzzle.id, this.editor.route);
    if (!this.alive || seq !== this.adviceSeq || key !== this.routeKey() || !a) return null;
    this.lastAdvice = { key, advice: a };
    return a;
  }

  // ─────────────────────────────── hints ───────────────────────────────

  private toggleHints(force?: boolean) {
    const open = force ?? this.hintPanel.hidden;
    this.hintPanel.hidden = !open;
    this.hintBtn.setAttribute('aria-expanded', String(open));
    this.root.classList.toggle('hints-open', open);
    if (open && !this.stage1Shown) {
      this.stage1Shown = true;
      this.addHint({ stage: 1, text: this.opts.puzzle.hint, routeKey: '' });
    }
    if (open) {
      this.renderHints();
      (this.hintPanel.querySelector('.hint-more, .hint-close') as HTMLElement | null)?.focus();
    } else {
      this.hintFocus = {};
      this.renderOverlay();
      this.map.svg.focus({ preventScroll: true });
    }
  }

  private addHint(entry: HintEntry) {
    this.hints++;
    this.hintLog.push(entry);
    this.app.store.saveDraft({ key: this.draftKey, puzzleId: this.opts.puzzle.id, rev: this.opts.puzzle.rev, route: [...this.editor.route], hints: this.hints });
    this.renderStats();
  }

  private async requestHint(stage: 2 | 3) {
    const key = this.routeKey();
    const a = await this.fetchAdvice();
    if (!a || !this.alive || key !== this.routeKey()) return;
    let text: string;
    let action: HintEntry['action'];
    this.hintFocus = {};
    if (a.status === 'complete') {
      text = this.editor.moves <= this.t.gold
        ? 'Your route is already complete and as short as it gets. Press Deliver!'
        : `Your route is complete at ${this.editor.moves} moves. Gold is ${this.t.gold}.`;
      if (a.goldUndoTo !== undefined && this.editor.moves > this.t.gold) {
        const k = a.goldUndoTo;
        text += ` The first ${k} ${k === 1 ? 'move is' : 'moves are'} still on a gold route.`;
        action = { label: `Undo to move ${k}`, run: () => this.keepMoves(k) };
      }
    } else if (a.status === 'doomed') {
      const k = a.undoTo ?? 0;
      text = `${describeDoom(this.town, a.reason)} To recover, undo back to move ${k}.`;
      action = { label: `Undo to move ${k}`, run: () => this.keepMoves(k) };
    } else if (stage === 2) {
      text = describeObjective(this.town, a.next!);
      this.hintFocus.objective = a.next!.node;
      const total = this.editor.moves + (a.remaining ?? 0);
      text += ` From here, the shortest finish is ${a.remaining} more ${a.remaining === 1 ? 'move' : 'moves'} (${total} in all).`;
      if (a.goldUndoTo !== undefined) {
        const k = a.goldUndoTo;
        text += ` Gold needs a different start: your first ${k} ${k === 1 ? 'move is' : 'moves are'} on a gold route.`;
        action = { label: `Undo to move ${k}`, run: () => this.keepMoves(k) };
      }
    } else {
      const next = a.path![0];
      text = `Ride to ${describeNodeForStep(this.town, next)}.`;
      if (a.goldUndoTo !== undefined) text += ' (That’s the best step from here, though gold now needs an earlier change.)';
      this.hintFocus.step = [this.editor.end, next];
      action = { label: 'Take this step', run: () => this.apply(next, 'pointer') };
    }
    this.addHint({ stage, text, routeKey: key, action });
    this.renderHints();
    this.renderOverlay();
  }

  private renderHints() {
    const key = this.routeKey();
    const list = h('ol', { class: 'hint-list' });
    for (const e of this.hintLog) {
      const stale = e.stage > 1 && e.routeKey !== key;
      list.append(h('li', { class: `hint-item stage-${e.stage}${stale ? ' stale' : ''}` },
        h('span', { class: 'hint-stage' }, e.stage === 1 ? 'Thought' : e.stage === 2 ? 'Objective' : 'Next step'),
        h('p', {}, e.text),
        stale ? h('p', { class: 'hint-stale' }, 'Your route has changed since this hint.') : null,
        e.action && !stale ? h('button', { class: 'btn btn-small', type: 'button', onclick: () => e.action!.run() }, e.action.label) : null,
      ));
    }
    const lastStage = Math.max(1, ...this.hintLog.filter((e) => e.stage === 1 || e.routeKey === key).map((e) => e.stage));
    const nextStage = (Math.min(3, lastStage + 1)) as 2 | 3;
    const more = h('button', { class: 'btn btn-quiet hint-more', type: 'button', onclick: () => void this.requestHint(nextStage) },
      nextStage === 2 ? 'Show the next objective' : 'Show one step');
    setKids(this.hintPanel,
      h('header', { class: 'hint-head' }, h('h2', {}, 'Hints'),
        h('button', { class: 'btn-icon hint-close', type: 'button', 'aria-label': 'Close hints', onclick: () => this.toggleHints(false) }, icon(clearIcon, 18))),
      list,
      this.ride ? null : more,
      h('p', { class: 'hint-foot' }, `Hints this round: ${this.hints}. They appear on your result, and nothing else changes.`),
    );
    // Show the newest hint without scrolling anything but the panel itself.
    requestAnimationFrame(() => { this.hintPanel.scrollTop = this.hintPanel.scrollHeight; });
  }

  // ─────────────────────────────── ride ───────────────────────────────

  private startRide() {
    if (this.ride || this.editor.moves === 0) return;
    const route = [...this.editor.route];
    const sim = this.editor.sim;
    const complete = isComplete(this.town, this.editor.state);
    const segs = this.map.routeSegments(route);
    const ms = this.app.store.data.settings.speed === 'brisk' ? 190 : 320;
    this.toggleHints(false);
    this.root.classList.add('riding');
    this.rideBar.hidden = false;
    this.hintFocus = {};
    this.selected = null;
    this.map.renderOverlay({});
    this.map.renderRoute(route, true);
    this.map.renderMarkers(sim.states[0]);
    this.app.sound.play('bell');
    this.say({ text: complete ? 'Off we go!' : 'Previewing your route so far.', tone: 'info' });
    const status = this.rideBar.querySelector('.ride-status')!;
    const ride = new Ride(this.map, segs, route.length - 1, ms, this.app.reducedMotion(),
      (i) => {
        if (!this.alive || this.ride !== ride) return;
        status.textContent = `${i} / ${route.length - 1}`;
        this.map.renderMarkers(sim.states[i]);
        for (const e of sim.events[i] ?? []) {
          if (e.type === 'pickup' || e.type === 'deliver') {
            this.map.pop(route[i], e.type, orderKind(this.town, e.order));
            this.app.sound.play(e.type === 'pickup' ? 'pickup' : 'deliver');
          }
        }
        this.renderOrders(i);
      },
      () => {
        if (!this.alive || this.ride !== ride) return;
        this.ride = null;
        this.root.classList.remove('riding');
        this.rideBar.hidden = true;
        if (complete) this.complete(route.length - 1);
        else {
          this.later(() => {
            this.map.hideCourier();
            this.map.clearTrail();
            this.renderAll();
            this.say({ text: 'That’s the route so far. Keep planning — it ends at home with everything delivered.', tone: 'info' });
          }, 600);
        }
      });
    this.ride = ride;
    this.renderControls();
    ride.start();
  }

  private cancelRide() {
    if (!this.ride) return;
    this.ride.cancel();
    this.ride = null;
    this.root.classList.remove('riding');
    this.rideBar.hidden = true;
    this.renderAll();
    this.say({ text: 'Ride stopped. Your route is unchanged.', tone: 'info' });
  }

  // ─────────────────────────────── completion ───────────────────────────────

  private complete(moves: number) {
    const p = this.opts.puzzle;
    const medal = medalFor(moves, this.t);
    const res = this.app.store.recordCompletion(p.id, p.rev, moves, medal, this.hints);
    if (this.opts.mode === 'daily') {
      this.app.store.recordDaily(this.opts.dateKey!, { puzzleId: p.id, rev: p.rev, moves, medal, hints: this.hints });
    }
    this.app.store.clearDraft(this.draftKey);
    this.completedThisVisit = true;
    this.app.sound.play('complete');
    this.app.haptics([20, 60, 30]);
    this.showDocket(moves, medal, res.newBest, res.previousBest);
  }

  private showDocket(moves: number, medal: Medal, newBest: boolean, previousBest?: number) {
    const p = this.opts.puzzle;
    const rec = this.app.store.levelRecord(p.id, p.rev)!;
    const daily = this.opts.mode === 'daily' ? { number: dailyNumber(this.opts.dateKey!), dateKey: this.opts.dateKey! } : undefined;
    const text = shareText({ puzzle: p, moves, gold: this.t.gold, medal, hints: this.hints, daily });
    const status = h('p', { class: 'share-status', 'aria-live': 'polite' });
    const note = medal === 'gold'
      ? (moves === this.t.gold ? 'The shortest route there is.' : 'Gold!')
      : medal === 'silver'
        ? `Gold is ${this.t.gold} moves — ${moves - this.t.gold} to shave off.`
        : `A fine delivery. Silver is ${this.t.silver} moves or fewer, gold ${this.t.gold}.`;
    const next = this.opts.mode === 'practice' ? this.app.nextPuzzle(p) : undefined;
    const primary = this.opts.mode === 'daily'
      ? h('button', { class: 'btn btn-primary', type: 'button', onclick: () => this.app.go({ screen: 'home' }) }, 'Back to town')
      : next
        ? h('button', { class: 'btn btn-primary', type: 'button', onclick: () => this.app.go({ screen: 'play', puzzleId: next.id, mode: 'practice' }) }, `Next: ${next.title}`)
        : h('button', { class: 'btn btn-primary', type: 'button', onclick: () => this.app.go({ screen: 'book' }) }, 'Back to the route book');
    const best = previousBest === undefined ? 'First delivery' : newBest ? `New best (was ${previousBest})` : `Best ${rec.bestMoves}`;
    const card = h('div', { class: `docket docket-${medal}`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'docket-title' },
      h('p', { class: 'docket-kicker' }, daily ? `Daily #${daily.number} delivered` : `Route ${p.number} delivered`),
      h('h2', { id: 'docket-title' }, p.title),
      h('div', { class: `stamp stamp-${medal}`, 'aria-label': `${medalName[medal]} stamp` },
        h('span', { class: 'stamp-medal' }, medalName[medal]), h('span', { class: 'stamp-moves' }, `${moves} moves`)),
      h('p', { class: 'docket-note' }, note),
      h('dl', { class: 'docket-facts' },
        h('div', {}, h('dt', {}, 'Your route'), h('dd', {}, `${moves}`)),
        h('div', {}, h('dt', {}, 'Gold'), h('dd', {}, `${this.t.gold}`)),
        h('div', {}, h('dt', {}, 'Silver'), h('dd', {}, `≤ ${this.t.silver}`)),
        h('div', {}, h('dt', {}, 'Personal best'), h('dd', {}, best)),
        h('div', {}, h('dt', {}, 'Hints'), h('dd', {}, this.hints === 0 ? 'None' : String(this.hints))),
      ),
      h('div', { class: 'docket-actions' },
        h('button', { class: 'btn btn-quiet btn-share', type: 'button', onclick: async () => {
          const r = await shareResult(text);
          if (!this.alive) return;
          status.textContent = r === 'shared' ? 'Shared.' : r === 'copied' ? 'Result copied to the clipboard.' : r === 'cancelled' ? '' : 'Couldn’t share from this browser.';
        } }, icon(shareIcon, 18), 'Share'),
        primary,
      ),
      status,
      h('div', { class: 'docket-secondary' },
        h('button', { class: 'btn-link', type: 'button', onclick: () => this.tryAgain() }, 'Try again'),
        h('button', { class: 'btn-link', type: 'button', onclick: () => this.closeDocket() }, 'Look at the map'),
        this.opts.mode === 'daily' ? h('button', { class: 'btn-link', type: 'button', onclick: () => this.app.go({ screen: 'book' }) }, 'Route book') : null,
      ),
    );
    const confetti = this.app.reducedMotion() ? null : this.confetti(medal);
    this.docket.replaceChildren(...[confetti, card].filter(Boolean) as HTMLElement[]);
    this.docket.hidden = false;
    this.root.classList.add('docket-open');
    this.later(() => (card.querySelector('.btn-primary') as HTMLElement | null)?.focus(), 50);
  }

  private confetti(medal: Medal): HTMLElement {
    const wrap = h('div', { class: 'confetti', 'aria-hidden': 'true' });
    const cols = medal === 'gold' ? ['#E0B04A', '#D4688A', '#4FA593', '#B85C38'] : ['#D4688A', '#4FA593', '#E0B04A'];
    for (let i = 0; i < 26; i++) {
      const s = h('i', { style: `left:${(i * 37) % 100}%;background:${cols[i % cols.length]};animation-delay:${(i % 9) * 0.07}s;--drift:${((i * 53) % 60) - 30}px;--spin:${(i * 97) % 360}deg` });
      wrap.append(s);
    }
    return wrap;
  }

  private closeDocket() {
    this.docket.hidden = true;
    this.root.classList.remove('docket-open');
    this.map.hideCourier();
    this.map.clearTrail();
    this.renderAll();
    this.say({ text: 'Delivered! Press Deliver to ride it again, or Try again for a fresh route.', tone: 'good' });
    this.map.svg.focus({ preventScroll: true });
  }

  private tryAgain() {
    this.docket.hidden = true;
    this.root.classList.remove('docket-open');
    this.map.hideCourier();
    this.map.clearTrail();
    this.editor.clear();
    this.hints = 0;
    this.hintLog = [];
    this.stage1Shown = false;
    this.completedThisVisit = false;
    this.say({ text: `Fresh start. Gold is ${this.t.gold} moves.`, tone: 'info' });
    this.afterChange();
    this.map.svg.focus({ preventScroll: true });
  }

  // ─────────────────────────────── rendering ───────────────────────────────

  private say(m: Message) {
    this.message = m;
    this.renderCoach();
  }

  private renderCoach() {
    const m = this.message;
    // While the route cannot finish, keep the way back on screen whatever else is said.
    const doom = this.lastAdvice?.key === this.routeKey() && this.lastAdvice.advice.status === 'doomed' ? this.lastAdvice.advice : null;
    const action = m.action ?? (doom && doom.undoTo !== undefined && !this.ride
      ? { label: `Undo to move ${doom.undoTo}`, run: () => this.keepMoves(doom.undoTo!) } : undefined);
    this.coachEl.className = `coach coach-${m.tone}`;
    setKids(this.coachEl,
      h('p', {}, m.text),
      action ? h('button', { class: 'btn btn-small', type: 'button', onclick: () => action.run() }, action.label) : null,
    );
  }

  private renderAll() {
    const s = this.editor.state;
    this.map.renderRoute(this.editor.route);
    this.map.renderMarkers(s, this.chipFocus);
    this.renderOverlay();
    this.renderOrders();
    this.renderStats();
    this.renderControls();
    this.renderCoach();
  }

  private renderOverlay() {
    if (this.ride) return;
    this.map.renderOverlay({
      end: this.editor.moves > 0 ? this.editor.end : this.town.depot,
      legal: this.editor.legalNext(),
      selected: this.selected,
      objective: this.hintFocus.objective,
      step: this.hintFocus.step,
    });
  }

  private renderOrders(atIndex?: number) {
    const s = atIndex === undefined ? this.editor.state : this.editor.sim.states[atIndex];
    const items = this.town.orders.map((o, i) => {
      const k = this.town.shopKind.get(o.from)!;
      const st = s.orders[i].status;
      const left = freshLeft(this.town, s, i);
      const statusText = st === 2 ? 'delivered' : st === 1 ? (left !== null ? `in the basket, ${left} ${left === 1 ? 'move' : 'moves'} left` : 'in the basket') : 'waiting at the shop';
      const chip = h('button', {
        class: `chip chip-${st === 0 ? 'waiting' : st === 1 ? 'carried' : 'done'}`,
        type: 'button',
        style: `--c:${shopColour[k].fill};--cd:${shopColour[k].deep};--ct:${shopColour[k].tint}`,
        'aria-label': `${itemName[k]} from the ${shopName[k]} to House ${houseOf(this.town, i)}: ${statusText}${o.fresh ? `. Must arrive within ${o.fresh} moves of pickup` : ''}`,
        onclick: () => this.focusOrder(i),
      },
        icon(itemIcon[k], 20, 'chip-ico'),
        h('span', { class: 'chip-to' }, h('span', { class: 'chip-arrow', 'aria-hidden': 'true' }, '→'), houseOf(this.town, i)),
        st === 2 ? h('span', { class: 'chip-tag chip-tick', 'aria-hidden': 'true' }, '✓')
          : left !== null ? h('span', { class: `chip-tag chip-fresh${left <= 1 ? ' urgent' : ''}`, 'aria-hidden': 'true' }, `${left}`)
          : o.fresh ? h('span', { class: 'chip-tag chip-limit', 'aria-hidden': 'true' }, `${o.fresh}`) : null,
      );
      return h('li', {}, chip);
    });
    this.ordersEl.replaceChildren(...items);
  }

  private focusOrder(i: number) {
    const o = this.town.orders[i];
    this.chipFocus = [o.from, o.to];
    this.map.renderMarkers(this.editor.state, this.chipFocus);
    clearTimeout(this.chipTimer);
    this.chipTimer = window.setTimeout(() => {
      this.chipFocus = [];
      if (this.alive && !this.ride) this.map.renderMarkers(this.editor.state);
    }, 1600);
    const k = orderKind(this.town, i);
    this.say({ text: `${itemName[k][0].toUpperCase()}${itemName[k].slice(1)} from the ${shopName[k]} to House ${houseOf(this.town, i)}${o.fresh ? `, within ${o.fresh} moves of pickup` : ''}.`, tone: 'info' });
  }

  private renderStats() {
    const s = this.editor.state;
    const rec = this.app.store.levelRecord(this.opts.puzzle.id, this.opts.puzzle.rev);
    const cap = this.town.capacity;
    const basket = Number.isFinite(cap)
      ? h('span', { class: 'basket', 'aria-label': `Basket: ${carriedCount(s)} of ${cap}` },
        icon(basketIcon, 18),
        ...Array.from({ length: cap }, (_, i) => h('i', { class: i < carriedCount(s) ? 'slot full' : 'slot', 'aria-hidden': 'true' })))
      : null;
    setKids(this.statsEl,
      h('span', { class: 'moves' }, h('b', {}, String(this.editor.moves)), this.editor.moves === 1 ? ' move' : ' moves'),
      h('span', { class: 'target' }, `Gold ${this.t.gold}`),
      rec ? h('span', { class: 'best' }, `Best ${rec.bestMoves}`) : null,
      this.hints > 0 ? h('span', { class: 'hint-count' }, `${this.hints} ${this.hints === 1 ? 'hint' : 'hints'}`) : null,
      basket,
    );
  }

  private renderControls() {
    const riding = !!this.ride;
    this.undoBtn.disabled = riding || !this.editor.canUndo;
    this.redoBtn.disabled = riding || !this.editor.canRedo;
    this.clearBtn.disabled = riding || this.editor.moves === 0;
    this.hintBtn.disabled = riding;
    const complete = isComplete(this.town, this.editor.state);
    this.rideBtn.disabled = riding || this.editor.moves === 0;
    this.rideBtn.className = `btn btn-ride${complete ? ' btn-primary ready' : ''}`;
    this.rideBtn.replaceChildren(icon(playIcon, 16), complete ? (this.completedThisVisit ? 'Ride again' : 'Deliver') : 'Preview');
    this.rideBtn.setAttribute('aria-label', complete ? 'Deliver: send the courier along your route' : 'Preview the route so far');
  }

  // ─────────────────────────────── lifecycle ───────────────────────────────

  private later(fn: () => void, ms: number) {
    const t = window.setTimeout(() => { this.timers.delete(t); if (this.alive) fn(); }, ms);
    this.timers.add(t);
  }

  private leave() {
    this.app.go(this.opts.mode === 'daily' ? { screen: 'home' } : { screen: 'book' });
  }

  focusMap() {
    this.map.svg.focus({ preventScroll: true });
  }

  /** Called on navigation. After this, nothing from this session may touch the UI. */
  destroy() {
    this.alive = false;
    this.ride?.cancel();
    this.ride = null;
    clearTimeout(this.adviceTimer);
    clearTimeout(this.chipTimer);
    for (const t of this.timers) clearTimeout(t);
    this.timers.clear();
    this.map.destroy();
    this.root.remove();
  }
}
