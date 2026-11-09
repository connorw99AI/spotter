# The Daily Detour

A cozy delivery-route puzzle set in a miniature neighbourhood. Plan a courier's round:
collect orders, deliver them under a few simple rules, and ride home.
*A little journey. A clever detour.*

## What's in the game
- **485 puzzles beyond the tutorials:** 20 hand-made classic routes that teach every rule,
  120 more in five route-book chapters, and 365 daily puzzles (a new one each UTC day from
  9 November 2026 to 8 November 2027, gentle on Mondays and trickiest at the weekend).
- **Rules:** pickup before delivery, roadworks, fresh orders that melt or wilt, one-way
  streets and a basket that holds two in the classic routes; then each chapter adds one:
  opening hours (Market Town), garden gates that open once a house has its delivery (Round the
  Green), and cobbles that fragile orders can't cross (Old Quarter). Riverside and High Street mix
  everything. The dailies use the classic rules.
- **Celebrating the detour:** the result names the clever moves in your route (riding past a shop
  with a full basket, a just-in-time delivery, a garden-gate shortcut, beating nearest-job-first),
  calls out near-misses, and replays show your best route as a ghost line.
- **Pip and the town:** you play Pip, the new courier. Residents have portraits and say thank you
  on the map and on the result; each chapter tells a short story in four letters and leaves a
  keepsake in the village when finished.
- **Hints** in three stages, computed from the player's own route, with an explicit undo when
  a route can no longer finish.
- **Stamps:** gold is the fewest moves the map's rules allow, silver one over, bronze two or three
  over; anything longer earns no stamp. Every map's gold is checked by `tests/gold-audit.test.ts`,
  an exhaustive search over the game's own move rules that doesn't rely on the solver.
- **Your village:** deliveries earn hearts (bronze 1, silver 2, gold 3) that restore 12 corners
  of the courier's home village, each with a note from the resident who asked.
- **Coins and the village shop:** each route also pays coins the first time (more for gold),
  spent on decorations you place, Pip's outfit, map scenery, hints, and new neighbours who move
  into Meadow Lane with three new puzzles each (`src/data/requests.ts`, made with
  `scripts/curate-requests.ts`). Coins are earned only; see `docs/BUSINESS.md`.
- **Residents** on every route, with thank-you notes on the result card.
- **Seasonal events** on fixed UTC dates (Blossom Week, Summer Fete, Harvest Fair, Winter Lights)
  that change the daily's scenery and earn village keepsakes.
- **Forgiving runs:** missing one day is a rest day; only two missed days in a row end a run.
  A stamp calendar keeps every daily.
- **Sharing:** a spoiler-free result card (the town, the stamp, moves, hints and run; never the
  route) through the native share sheet, with copy and save fallbacks.
- **Sound:** synthesised effects and a gentle generated music loop, each with its own setting.
  Recorded audio can replace any of it (see `public/audio/README.md`).
- **Installable and offline:** web manifest and service worker; Capacitor projects for iOS and
  Android with a daily reminder and native haptics.

## Run it
```sh
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests: rules, solver, editor, every puzzle, daily schedule, storage, meta
npm run build      # typecheck, production build, single-file builds and service worker in dist/
npm run analyze    # design report for the 20 classic puzzles
```

## Making content
```sh
npm run content:generate   # writes candidate pools to pool/ (a few minutes)
npm run content:curate     # picks the best into src/data/generated.ts
```
`scripts/generate.ts` builds towns from five layout families and keeps only puzzles that pass
the same checks as the hand-made set: valid and readable, solvable, the gold target verified,
every rule shaping the answer, naive nearest-job play losing, no one-way traps, little
back-and-forth, and fast to solve. The tests re-check all 485 every run. No person has played
every generated puzzle yet; playtesting is the next step that matters most.

## Apps and stores
- `docs/APP-STORES.md` — building the iOS and Android apps, what needs your accounts, leaderboards.
- `docs/BUSINESS.md` — business model recommendation and alternatives.
- `store/` — icon, screenshots for 6.7" iPhone and Android phones, a 21-second preview capture,
  and a listing draft. Regenerate with `npm run icons` and `npm run store:assets` (dev server running).

## Structure
| Area | Files |
| --- | --- |
| Puzzle schema and data | `src/core/types.ts`, `src/data/` (`puzzles.ts` hand-made, `generated.ts` compact codes, `catalog.ts`) |
| Pure rules | `src/core/town.ts`, `src/core/rules.ts` |
| Solver and validation | `src/core/solver.ts`, `src/core/validate.ts`, `src/core/analysis.ts` |
| Route input and hints | `src/game/editor.ts`, `src/game/advisor.ts` (+ worker), `src/ui/play.ts` |
| Progress and meta | `src/game/storage.ts`, `src/game/daily.ts`, `src/game/meta.ts`, `src/game/residents.ts` |
| Rendering | `src/ui/mapView.ts`, `src/ui/scene.ts`, `src/ui/sceneryArt.ts`, `src/ui/theme.ts`, `src/ui/village.ts`, `src/ui/villageArt.ts`, `src/ui/decorArt.ts`, `src/ui/people.ts` |
| Shop and coins | `src/game/shop.ts`, `src/ui/economy.ts`, `src/data/neighbours.ts` |
| Native | `src/platform/native.ts`, `capacitor.config.ts`, `ios/`, `android/` |
