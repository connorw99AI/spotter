# The Daily Detour

A cozy delivery-route puzzle set in a miniature neighbourhood. Plan a courier's round: collect orders,
deliver them under a few simple rules, and ride home. *A little journey. A clever detour.*

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # 145 unit tests (rules, solver, editor, content, daily, storage, links)
npm run build      # typecheck + production build + single-file builds in dist/
npm run analyze    # design report for all 20 puzzles
```

`npm run build` writes `dist/the-daily-detour.html`, a self-contained file that runs from disk.

## How to play

- Drag from the end of your route through neighbouring corners, or tap the next corner.
- Every street costs one move. Streets can be ridden more than once.
- Passing a shop collects its orders; passing the right house delivers them. Passing a house before you
  have its order does nothing.
- Finish at your cottage with everything delivered, then press **Deliver**.
- Drag back along the route to erase. After a pickup or drop-off, stepping back turns the courier round
  instead (a real U-turn); Undo removes it.
- Rules introduced along the way: roadworks (closed streets), fresh orders that melt or wilt a set number of
  moves after pickup, one-way streets, and a basket that holds two orders. A full basket rides past a shop
  and the order waits.
- Keyboard: arrow keys ride toward a corner (Home / Page Up / End / Page Down for diagonals), Space picks
  between nearby corners, Enter rides there, Backspace or Ctrl+Z undoes.

Medals: gold is the solver's optimum, silver is within 15% of it (at least 2 moves of slack), bronze is any
valid delivery. Hints come in three stages (a strategic thought, the next objective, one step) and are always
computed from the player's current route; when a route can no longer finish, the game says why and offers an
explicit "Undo to move N".

The daily challenge is the same for everyone on a UTC date. It rotates through the 17 non-tutorial puzzles in
a fixed order; it is not generated content. A daily started before midnight keeps its puzzle.

## Structure

| Area | Files |
| --- | --- |
| Puzzle schema and data | `src/core/types.ts`, `src/data/dsl.ts`, `src/data/puzzles.ts` |
| Pure rules | `src/core/town.ts` (graph), `src/core/rules.ts` (movement, pickup, delivery, freshness, capacity) |
| Solver and validation | `src/core/solver.ts` (BFS over position, order states, carried-order ages), `src/core/validate.ts`, `src/core/analysis.ts` |
| Route input | `src/game/editor.ts` (undo/redo, U-turn rule), pointer and keyboard handling in `src/ui/play.ts` |
| Hints | `src/game/advisor.ts`, run off the main thread by `src/game/advisor.worker.ts` |
| Rendering and animation | `src/ui/mapView.ts`, `src/ui/art.ts`, `src/ui/ride.ts` |
| Persistence and daily | `src/game/storage.ts` (versioned, defensive), `src/game/daily.ts` |

Every puzzle is checked by the test suite with the same rules the game uses: it must be valid and readable
(no crossing streets), solvable, its authored gold must equal the solver optimum, and every rule it uses must
change the solution (removing that rule changes the optimum or the set of optimal routes).
`scripts/design-search.ts` is the authoring aid used to try placements on hand-drawn layouts; the chosen
puzzles are fixed data.
