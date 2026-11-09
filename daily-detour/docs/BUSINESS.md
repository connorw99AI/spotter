# Business model

This is a recommendation, not a decision the code makes for you. Nothing in the
current build charges money: purchases need your store accounts and can't be built
or tested without them, so the game ships everything free until you choose.

## Recommendation

**Free daily on the web, plus a free app with one paid unlock. Pitch Apple Arcade in parallel.**

- **Web (free):** today's daily, the 20 classic routes, the village and stamps. This is the front
  door: no install, shareable result cards, the same puzzle for everyone each day.
- **App (free download, one unlock at about $4.99):** the same free content, plus the five
  route-book chapters (120 puzzles) and every future chapter, unlocked once, forever. No ads, no
  energy, no subscription. Hints cost coins earned in play (see below), never money.
- **Apple Arcade:** a cozy, ad-free, premium puzzle game with a daily habit fits its catalogue.
  If accepted, Apple's deal replaces the unlock on iOS. Treat it as upside, not the plan.

Why this shape: it keeps the original promise (no timers, lives, energy or forced ads), the daily
does the marketing through sharing, and the people who play daily for a week are the ones who
buy. A single unlock earns less per player than aggressive free-to-play, but it is honest and
cheap to run.

## The coin economy (built, coins only)

Coins are earned by playing and spent in the village shop. No money is involved anywhere in
the build.

| Earned from | Bronze | Silver | Gold | Notes |
| --- | --- | --- | --- | --- |
| Each route-book route (140) | 10 | 20 | 30 | Counted at your best, so replays pay nothing extra |
| Each neighbour's request (12) | 20 | 40 | 60 | New puzzles that unlock as neighbours move in |
| Each daily | 15 | 25 | 40 | First result of the day |
| Starting purse | | | | 50 |

| Spent on | Range | Total to buy everything |
| --- | --- | --- |
| Hints (objective / next step) | 10 / 15 | ongoing; the first nudge and the doom recovery are free |
| 12 decorations, placed in 7 spots | 40–250 | 1,340 |
| Pip's look: bike, helmet, scarf, jacket, crate | 50–200 | 1,290 |
| 5 map looks | 100–150 | 600 |
| 4 neighbours (each brings 3 requests and letters) | 150–420 | 1,130 |

Rough sizing: gold on the whole book and every request earns about 4,970 coins, against about
4,360 for the whole shop, so a completionist can own everything; a daily-only player earns about
40 a day and gets there in three to four months. Coins are computed from your records, so they
can't be duplicated by replaying, and a balance can't go negative.

**If you later sell coin packs** (for example 99p for a few hundred coins): it needs Apple's and
Google's in-app purchase systems in the native apps (the web version can't take money), a
restore-purchases button, products set up in both store consoles, and testing on real devices.
The harder question is design: at today's rates nobody needs to buy coins, which is why it feels
fair. Selling packs only earns if the shop is priced so that some players run short, and that is
exactly the pressure the original brief ruled out. Decide that deliberately; don't drift into it.

## The alternatives

| Model | Earns from | Fits the no-pressure promise? | Needs | Main risk |
| --- | --- | --- | --- | --- |
| Paid upfront ($3–5) | Each download | Yes | Store accounts | Few people buy a game they haven't tried; depends on being featured |
| **Free + one unlock** (recommended) | Engaged players | Yes | Store accounts, in-app purchase setup, a restore-purchase button | Conversion is typically a small share of downloads; needs volume |
| Free-to-play with ads and hint purchases | Volume and ad impressions | **No**: ads and paid hints are the pressure the brief ruled out | Ad network, consent flows, paid user acquisition | Paid installs cost real money per player; reviews punish ad pressure |
| Subscription | Monthly players | Partly | A steady stream of new content | Hard to justify for a puzzle game without constant new chapters |
| Apple Arcade / Netflix Games | Platform deal | Yes | A pitch, a polished vertical slice, the platform's approval | Selective and slow; you don't control timing |

My view: the free-to-play row is where large download numbers usually come from, and it's
the one that would change what the game is. I'd only consider it if you're prepared to spend on
advertising for installs and accept the design changes that come with it.

## Splitting the content

| | Web | App, free | App, unlocked |
| --- | --- | --- | --- |
| Daily route (365 unique, then repeats) | ✓ | ✓ | ✓ |
| 20 classic routes | ✓ | ✓ | ✓ |
| Village, stamps, seasonal events | ✓ | ✓ | ✓ |
| Five chapters, 120 routes | | first 3 of each chapter | ✓ |
| Future chapters | | | ✓ |
| Daily reminder, haptics | | ✓ | ✓ |

The generator and curation scripts (`scripts/generate.ts`, `scripts/curate.ts`) are how new
chapters get made; each still needs a person to play through it before release.

## Costs to launch

Fixed costs are small; people are the real cost. The ranges below are rough guesses for planning,
not quotes.

- Apple Developer Program: $99 a year. Google Play: $25 once.
- Hosting the web version: free to a few dollars a month on a static host.
- A privacy policy page and a support email: required by both stores even with no data collected.
- Illustrator to replace the code-drawn art: weeks of work.
- Composer and sound designer: the audio slots in `public/audio/` are ready for their files.
- Playtesting: 20 to 50 people across the difficulty curve before launch.
- Marketing: a trailer, press kit and outreach. Paid advertising only if you choose free-to-play.

## What to measure

The build collects nothing, by design. Store dashboards (App Store Connect, Play Console) give
downloads, retention and purchases without any code. If you add more, keep it aggregate and
privacy-respecting, and update the privacy label to match:

- Day 1, 7 and 30 return rate of daily players
- Share of dailies finished, and where players give up in the route book
- Hint use per puzzle (shows which puzzles are unclear)
- Unlock conversion among players with a 5-day run
- Share-card use (the growth engine, if there is one)

## Risks

- **Discovery.** The puzzle category is crowded. Without being featured, going viral, or paying
  for installs, downloads grow slowly.
- **Content quality.** The 485 generated puzzles meet the same automated checks as the hand-made
  ones, but no person has played them all. Playtesting is the next step that matters most.
- **Repeat after a year.** Dailies repeat from 9 November 2027 unless new ones are generated and
  checked before then.
