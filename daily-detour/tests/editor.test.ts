import { describe, expect, it } from 'vitest';
import { buildTown } from '../src/core/town';
import { RouteEditor } from '../src/game/editor';
import { PUZZLE_BY_ID } from '../src/data/puzzles';
import { line, mk } from './helpers';

const town = buildTown(mk({ ...line, shops: { d: 'florist' }, houses: { b: 'A' }, orders: [['d', 'b']] }));

describe('route editing', () => {
  it('starts at the depot and extends along streets', () => {
    const ed = new RouteEditor(town);
    expect(ed.route).toEqual(['D']);
    expect(ed.moveTo('a')).toMatchObject({ changed: true, action: 'extend' });
    expect(ed.route).toEqual(['D', 'a']);
    expect(ed.moves).toBe(1);
  });

  it('refuses illegal steps without changing the route', () => {
    const ed = new RouteEditor(town);
    expect(ed.moveTo('c')).toEqual({ changed: false, blocked: { type: 'no-street', from: 'D', to: 'c' } });
    expect(ed.route).toEqual(['D']);
    expect(ed.canUndo).toBe(false);
  });

  it('stepping back erases when nothing happened at the last corner', () => {
    const ed = new RouteEditor(town);
    ed.moveTo('a');
    ed.moveTo('b'); // House A, nothing to deliver yet ("early" is not a stop)
    expect(ed.moveTo('a')).toMatchObject({ changed: true, action: 'erase' });
    expect(ed.route).toEqual(['D', 'a']);
  });

  it('stepping back after a pickup turns round instead of erasing', () => {
    const ed = new RouteEditor(town);
    for (const n of ['a', 'b', 'c', 'd']) ed.moveTo(n);
    expect(ed.moveTo('c')).toMatchObject({ changed: true, action: 'turn' });
    expect(ed.route).toEqual(['D', 'a', 'b', 'c', 'd', 'c']);
    // ...and stepping back again from an ordinary corner erases the turn.
    expect(ed.moveTo('d')).toMatchObject({ changed: true, action: 'erase' });
    expect(ed.route).toEqual(['D', 'a', 'b', 'c', 'd']);
  });

  it('undo and redo restore exact routes and states', () => {
    const ed = new RouteEditor(town);
    for (const n of ['a', 'b', 'c', 'd', 'c', 'b']) ed.moveTo(n);
    expect(ed.state.orders[0].status).toBe(2);
    ed.undo();
    expect(ed.route).toEqual(['D', 'a', 'b', 'c', 'd', 'c']);
    expect(ed.state.orders[0].status).toBe(1);
    ed.undo();
    ed.undo();
    expect(ed.route).toEqual(['D', 'a', 'b', 'c']);
    expect(ed.state.orders[0].status).toBe(0);
    ed.redo();
    ed.redo();
    ed.redo();
    expect(ed.route).toEqual(['D', 'a', 'b', 'c', 'd', 'c', 'b']);
    expect(ed.state.orders[0]).toMatchObject({ status: 2, pickedAt: 4, deliveredAt: 6 });
    expect(ed.canRedo).toBe(false);
  });

  it('a new edit clears the redo stack', () => {
    const ed = new RouteEditor(town);
    ed.moveTo('a');
    ed.moveTo('b');
    ed.undo();
    expect(ed.canRedo).toBe(true);
    ed.moveTo('D');
    expect(ed.canRedo).toBe(false);
  });

  it('clear and truncate are single undoable actions', () => {
    const ed = new RouteEditor(town);
    for (const n of ['a', 'b', 'c']) ed.moveTo(n);
    ed.clear();
    expect(ed.route).toEqual(['D']);
    ed.undo();
    expect(ed.route).toEqual(['D', 'a', 'b', 'c']);
    ed.truncate(1);
    expect(ed.route).toEqual(['D', 'a']);
    ed.undo();
    expect(ed.route).toEqual(['D', 'a', 'b', 'c']);
  });

  it('restores a saved draft, keeping only its legal prefix', () => {
    const ed = new RouteEditor(town, ['D', 'a', 'b', 'D', 'a']);
    expect(ed.route).toEqual(['D', 'a', 'b']);
    expect(ed.canUndo).toBe(false);
    const bad = new RouteEditor(town, ['x', 'y']);
    expect(bad.route).toEqual(['D']);
  });

  it('refuses a step that would spoil a fresh order', () => {
    const t = buildTown(mk({ ...line, shops: { a: 'icecream' }, houses: { d: 'A' }, orders: [['a', 'd', 1]] }));
    const ed = new RouteEditor(t);
    ed.moveTo('a');
    ed.moveTo('b');
    expect(ed.moveTo('c')).toEqual({ changed: false, blocked: { type: 'spoil', order: 0, limit: 1 } });
  });

  it('lists only the next steps the rules allow', () => {
    const p = PUZZLE_BY_ID.get('wren-close')!;
    const ed = new RouteEditor(buildTown(p), ['D', 'e', 'h']);
    expect(ed.legalNext()).toEqual(['i']);
  });
});
