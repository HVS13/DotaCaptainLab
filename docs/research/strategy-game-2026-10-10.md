# Native strategy game: certified offline solution — 10 October 2026

The offline solver successfully solves one fully specified strategy game and certifies its result. This is a mathematical result within fixed roles/items, not a demonstrated PvP win-rate increase. Production Auto remains v2.7.7; the solver is not loaded by the app or userscript.

## Reference game and solution

The [fixture](strategy-game-fixture.json) freezes the uploaded latest-match own lineup, roles and ordered items, with explicit enemy role assignments and role-default enemy items. Those enemy settings remain assumptions. They previously reproduced the reported match's finish, gold gap and selected KDA values with one inferred enemy plan, but they are not directly observed or proven unique inputs.

All 64 own binary strategies and all 64 enemy binary strategies are evaluated using the unchanged native simulator. Payoff is 1 for a modeled own win and 0 otherwise. Roles, items, faction and hero order are held fixed in every cell. This yields a complete 4,096-cell game, with no hypothetical future hero drafts or patched simulation seeds.

The game value is exactly **37/48**, approximately **0.770833** expected win utility against the strongest modeled opponent response. Every pure own strategy has a losing counter, so the best pure worst-response value is zero. The equilibrium mixes thirteen own configurations. Its protection requires drawing according to the distribution while the opponent does not observe the sampled configuration before locking their own choice. Choosing the most probable configuration deterministically loses that mixed-strategy guarantee.

The reference Auto configuration won 49 of 64 enemy-strategy cases but has a losing response. This fraction is its average against a uniform modeled opponent, not its worst-response protection or an observed win probability. The equilibrium is computed from the whole game rather than treating uniform play as the objective.

Descriptively, the mixture's uniform-opponent mean was approximately 0.8916, while the best pure uniform-opponent mean was 60/64 = 0.9375. These optimize different objectives: the best average pure strategy still has a losing counter. Against the reference's inferred mirror enemy strategy, the mixture's expected utility was approximately 0.9583; the reference pure choice lost that modeled cell. This counterfactual is conditional on the fixed input assumptions, not proof of what a replayed real PvP match would do.

Only the original reference strategy preserves all 49 of its winning enemy columns. Every other pure strategy loses at least one of them; consequently, a nontrivial mixture cannot preserve success probability 1 against every enemy configuration the reference wins. Worst-response protection is an explicit objective trade-off, not a promise to improve every matchup. Python independently checked that dominance result.

The JavaScript solver uses a simplex LP on the positive shifted payoff matrix and derives both players' distributions. Its global best-response gap was approximately `4.04e-13`. Independent Python standard-library rational arithmetic verified both distributions against every row/column, then reconstructed exact rational weights and checked matching primal/dual game bounds of **37/48**. That exact equality is an optimality certificate for this reference matrix, not a bootstrap estimate. Sampled direct calls to the original native engine matched 224 baseline/support/worst-response cells, including winner, final minute and gold. The remaining cells were generated through the native adapter, not independently replayed a second time.

## Runtime and bounded attempt

Serial Node table generation took **155.6 seconds**; solving the completed table took tens of milliseconds (**46.5 ms** in the latest recorded run). Simulation dominates the cost. The full table exceeds the current Auto optimizer's 90-second cap and would also consume time reserved for roles/items/confirmation. These measurements are not authenticated browser timing tests.

A four-process offline run completed the same 4,096 native cells in **62.3 seconds**, including process startup, and every winner, gold result and finish time matched the serial table exactly. The parent waits for process closure and complete payloads before comparing cells. This is Node-process parallelism, not a verified browser Web Worker implementation. It demonstrates a feasible computational direction on this host; browser CSP, resource limits, item-search budget and live role/item/strategy application still need separate validation.

A separate cold double-oracle attempt had a 60-second budget. It caches exact queried cells, solves restricted games and evaluates complete best responses over all 64 strategies before retaining a certificate. Interrupted response evaluations cannot replace a completed bound. An observed weakness in retaining merely the latest certificate was fixed: the implementation now retains the strongest completed row lower bound and strongest column upper bound independently. A synthetic regression demonstrates a later weaker policy cannot discard the best completed protection. This correction changes certificate retention, not the native payoffs or full-game optimum.

The final bounded attempt made 1,496 native calls and took **60.015 seconds**, including a small single-call overrun. It retained bounds **[0.4, 1.0]**, with a gap of **0.6**, so it did not converge to the full-game solution. Python independently checked those bounds against the complete table. This is a valid but loose certificate for that partial policy; do not present it as the 37/48 equilibrium or enable it as a proven live replacement. A deadline cannot interrupt an already running native simulation.

## Scope and next boundary

The method establishes a correctly formulated and verified solver for the frozen strategy problem. Hidden enemy roles and builds can change the payoff matrix; its value is not a universal guarantee. Different lineups require their own evaluations. Actual opponent behavior need not be adversarial minimax play, and a worst-response objective need not maximize success against every real opponent population. No claim of professional-player imitation or higher real PvP wins is made.

Two descriptive sensitivity checks held the equilibrium mixture unchanged and tested all 64 enemy strategies. Swapping Puck/Timbersaw mid/offlane roles and using the corresponding role defaults reduced its lower expected utility to approximately **0.4167**. Swapping Faceless Void's first two default purchases reduced it to approximately **0.6875**. The reference pure policy still had a losing response in each check. These are lower values for the unchanged mixture under changed assumptions, not new equilibrium game values, full coverage of hidden roles/builds or statistical PvP confidence intervals. Each check used 896 native calls; neither tuned the policy.

The finite zero-sum LP formulation follows standard minimax/duality principles; see [CMU computational game-solving notes](https://www.cs.cmu.edu/~sandholm/cs15-888F25/Lecture4-LPs-Regret.pdf). The conditional lower and upper certificates, not the game-theory terminology alone, establish correctness here.

The manual source check at 17:14 Jakarta on 10 October found all 50 inspected public draft/Daily assets unchanged. Private-server parity remains unverified. No scheduler, additional paid service or installed dependency was added.

## Reproduction

- [Complete native table](strategy-game-matrix.json), [solution](strategy-game-analysis.json), [independent certificate](strategy-game-certificate.json)
- [Bounded cold result](strategy-game-oracle.json), [source check](strategy-game-source-check.json)
- [Parallel runtime and exact parity](strategy-game-parallel.json), [sensitivity checks](strategy-game-sensitivity.json)
- [LP solver](../../scripts/strategy-game.cjs), [double-oracle solver](../../scripts/strategy-oracle.cjs), [native generator](../../scripts/strategy-matrix.cjs)
- [Independent certificate checker](../../scripts/strategy-game-verify.py), [direct native replay checker](../../scripts/strategy-game-replay.cjs)

```sh
node tests/strategy-game.cjs
node tests/strategy-oracle.cjs
node scripts/strategy-matrix.cjs
node scripts/strategy-game-analysis.cjs
node scripts/strategy-game-replay.cjs
node scripts/strategy-oracle-native.cjs
node scripts/strategy-matrix-parallel.cjs
node scripts/strategy-game-sensitivity.cjs
python scripts/strategy-game-verify.py
```
