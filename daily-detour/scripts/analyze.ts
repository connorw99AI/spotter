/** Design report for every authored puzzle:  npm run analyze */
import { analyse } from '../src/core/analysis';
import { simulate } from '../src/core/rules';
import { buildTown } from '../src/core/town';
import { validatePuzzle } from '../src/core/validate';
import { thresholds } from '../src/core/medals';
import { PUZZLES } from '../src/data/puzzles';

for (const def of PUZZLES) {
  const t0 = performance.now();
  const r = analyse(def);
  const ms = performance.now() - t0;
  const errs = validatePuzzle(def);
  const town = buildTown(def);
  const L = (o: number) => town.houseLetter.get(def.orders[o].to);
  let line = '';
  if (r.route) {
    const sim = simulate(town, r.route);
    line = r.route.map((n, i) => n + (sim.events[i] ?? []).map((e) =>
      e.type === 'pickup' ? `[+${L(e.order)}]` : e.type === 'deliver' ? `[✓${L(e.order)}]` : e.type === 'full' ? `[full:${L(e.order)}]` : '').join('')).join(' ');
  }
  const t = r.optimal ? thresholds(r.optimal) : null;
  console.log(`#${def.number} ${def.title} [${def.tier}] opt ${r.optimal} (authored ${def.gold}${r.optimal === def.gold ? '' : ' MISMATCH'}) silver≤${t?.silver} routes ${r.optimalRoutes} greedy ${r.greedy} relaxed ${JSON.stringify(r.relaxedOptimal)} ${ms.toFixed(0)}ms`);
  if (errs.length) console.log('   INVALID: ' + errs.join('; '));
  console.log('   ' + line);
}
