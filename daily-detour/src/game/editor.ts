import { hadStopEvent, simulate, tryStep, type BlockReason, type GameState, type Simulation, type StepEvent } from '../core/rules';
import { checkMove, type Town } from '../core/town';
import type { NodeId } from '../core/types';

export type EditAction = 'extend' | 'turn' | 'erase';

export type EditResult =
  | { changed: true; action: EditAction; events: StepEvent[] }
  | { changed: false; blocked?: BlockReason };

const HISTORY_LIMIT = 400;

/**
 * Route planning state with undo/redo. Every route it holds is a legal prefix:
 * illegal steps are refused with a reason rather than drawn.
 */
export class RouteEditor {
  private _route: NodeId[];
  private _sim: Simulation;
  private past: NodeId[][] = [];
  private future: NodeId[][] = [];

  constructor(readonly town: Town, initial?: readonly NodeId[]) {
    this._route = [town.depot];
    this._sim = simulate(town, this._route);
    if (initial && initial.length > 1) this.restore(initial);
  }

  get route(): readonly NodeId[] { return this._route; }
  get sim(): Simulation { return this._sim; }
  get state(): GameState { return this._sim.states[this._sim.states.length - 1]; }
  get end(): NodeId { return this._route[this._route.length - 1]; }
  get moves(): number { return this._route.length - 1; }
  get canUndo(): boolean { return this.past.length > 0; }
  get canRedo(): boolean { return this.future.length > 0; }

  /** Replace the route without history (used when restoring a saved draft). Keeps the legal prefix. */
  private restore(route: readonly NodeId[]) {
    const sim = simulate(this.town, route);
    const keep = sim.failure ? sim.failure.index : route.length;
    this._route = route.slice(0, Math.max(1, keep));
    if (this._route[0] !== this.town.depot) this._route = [this.town.depot];
    this._sim = simulate(this.town, this._route);
  }

  private commit(next: NodeId[]) {
    this.past.push(this._route);
    if (this.past.length > HISTORY_LIMIT) this.past.shift();
    this.future = [];
    this._route = next;
    this._sim = simulate(this.town, next);
  }

  /** Nodes the courier could legally ride to next (for highlighting). */
  legalNext(): NodeId[] {
    return (this.town.succ.get(this.end) ?? []).filter((v) => tryStep(this.town, this.state, v).ok);
  }

  /**
   * The single input rule shared by drag, tap and keyboard:
   *  - a neighbour of the route's end extends the route (if the rules allow);
   *  - the previous corner erases the last step, unless the courier just made a
   *    pickup or drop-off there — then it turns round and rides back (a real U-turn).
   */
  moveTo(v: NodeId): EditResult {
    const end = this.end;
    if (v === end) return { changed: false };
    const prev = this._route.length > 1 ? this._route[this._route.length - 2] : undefined;
    if (v === prev) {
      const lastEvents = this._sim.events[this._sim.events.length - 1];
      if (hadStopEvent(lastEvents) && checkMove(this.town, end, v).ok) {
        return this.extend(v, 'turn');
      }
      this.commit(this._route.slice(0, -1));
      return { changed: true, action: 'erase', events: [] };
    }
    return this.extend(v, 'extend');
  }

  private extend(v: NodeId, action: EditAction): EditResult {
    const r = tryStep(this.town, this.state, v);
    if (!r.ok) return { changed: false, blocked: r.reason };
    this.commit([...this._route, v]);
    return { changed: true, action, events: r.events };
  }

  /** Remove the last step explicitly (no U-turn interpretation). */
  eraseLast(): boolean {
    if (this._route.length <= 1) return false;
    this.commit(this._route.slice(0, -1));
    return true;
  }

  /** Keep only the first `moves` moves. A single undoable action. */
  truncate(moves: number): boolean {
    const len = Math.max(1, Math.min(this._route.length, moves + 1));
    if (len === this._route.length) return false;
    this.commit(this._route.slice(0, len));
    return true;
  }

  clear(): boolean {
    return this.truncate(0);
  }

  undo(): boolean {
    const prev = this.past.pop();
    if (!prev) return false;
    this.future.push(this._route);
    this._route = prev;
    this._sim = simulate(this.town, prev);
    return true;
  }

  redo(): boolean {
    const next = this.future.pop();
    if (!next) return false;
    this.past.push(this._route);
    this._route = next;
    this._sim = simulate(this.town, next);
    return true;
  }
}
