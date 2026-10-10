# Auto integration — v2.8.0

Auto now runs the tested strategy shortlist after its existing strategy/item optimizer, when verified preparation time remains. There is no additional setup. The existing draft opening variation, weighted pick/ban decisions, role assignment and item-search policy remain unchanged.

The extra check requires a complete baseline screen and strategy retune. It uses at most four strategies, the baseline's selected items and the same source-backed enemy role/order alternatives as the [frozen diagnostic experiment](strategy-challenger-2026-10-10.md). Visible scout choices constrain compatible enemy strategies; unknown choices are enumerated. A replacement must preserve modeled wins and severe-loss counts in every checked setting and improve at least one. This is conditional modeled protection, not a global optimum or a PvP win probability.

The budget is the smaller of **30 seconds** and **visible preparation time minus 65 seconds**. The original optimizer keeps its existing cap and work budget. Unknown clocks, insufficient time or incomplete baseline searches skip the extra check. Expiration, worker denial/errors, hidden tabs, changed drafts/roles or changed preparation phases retain the baseline. Stop Auto aborts outstanding workers; stale results cannot apply after cancellation or restart. Items and roles remain fixed by this stage.

Completed checks expose matching scenario counts for every compared strategy, the checked role/order assumptions and the selection reason. Incomplete checks identify baseline retention. Existing downloadable Auto reports include the modeled variants and distinguish the selected strategy from observed application and game acknowledgement. Choosing a manual alternative takes control from Auto.

## Native flow verification and desktop acknowledgement fix

The first fresh browser-only Solo demo completed draft, role assignment, item optimization, the extra check, item application and six strategy choices. It clicked Continue but timed out waiting for acknowledgement. The [initial result](auto-challenger-native-demo-initial.json) is retained rather than represented as a pass.

The native public source explains the missed signal: simulator module `25022` renders the visible “Live match” caption only inside the mobile `md:hidden` HUD. Its desktop HUD uses an accessible label `Radiant <kills> kills versus Dire <kills> kills`. The old detector relied on the caption; a desktop viewport can enter the match without displaying it. The detector now recognizes that specific visible numeric scoreboard label. Hidden scoreboards, prep labels and forecast labels do not qualify. It does not bypass incomplete-prep confirmation or increase the acknowledgement timeout.

The repeated [native Solo demo](auto-challenger-native-demo.json) passed with the built v2.8.0 userscript: the draft finished, all five roles and thirty ordered item slots matched the selected inputs, six observed strategy choices matched the selection, Continue was clicked and actual match start was acknowledged. The extra check completed and retained the baseline in that particular game. There were no page JavaScript errors. The test ended at match start; it is not a win-rate experiment.

The generated [worker-package browser check](auto-challenger-package-browser.json) separately exercised **unknown enemy strategy**, evaluating 1,024 cells across all 64 compatible plans. Winners, severe-loss classes and the selected challenger matched the recorded native table; gold/time used the existing 1e-8 tolerance. It also tested a real `worker-src 'none'` response: the generated runner retained baseline with a worker-error result. This verifies fallback in Edge, not every userscript manager or authenticated page policy.

Controlled state-machine tests cover the remaining-time cap, 65-second reserve, incomplete/error fallback, visibility/draft/role/phase cancellation, token changes, item application, six calls, single Continue submission and the PvP waiting-for-opponent acknowledgement. Report tests check worker cancellation and saved modeled assumptions. The normal optimizer body is byte-equivalent after line-ending normalization to the preserved [v2.7.7 benchmark source](strategy-challenger-overlay-v2.7.7.js); the historical protocol hashes and outcomes remain intact.

## Limits and reproduction

One native Solo demo passed after the desktop signal correction. Authenticated PvP synchronization, extension-specific userscript restrictions and real PvP win rate remain unverified. CPU load and background timer throttling can reduce available time; incomplete extra checks retain baseline. Enemy custom item identities and all role permutations remain outside this small uncertainty set. No scheduler, paid API or installed dependency was added.

- [Auto integration source](../../rebuild/overlay.js), [native control acknowledgement](../../rebuild/game-controls.js), [bundle generation](../../scripts/build.cjs)
- [State-machine regression](../../tests/auto-challenger.cjs), [desktop/mobile control tests](../../tests/game-controls.cjs)
- [Native browser harness](../../scripts/auto-challenger-browser.cjs), [package/CSP harness](../../scripts/auto-challenger-package-browser.cjs)
- [Manual public source check](auto-challenger-source-check.json): its capture timestamp and public/private scope are retained in the artifact.

```sh
node scripts/build.cjs
node tests/auto-challenger.cjs
node tests/game-controls.cjs
node tests/optimization-deadline.cjs
# Existing Playwright package and installed Edge required for optional browser tests.
node scripts/auto-challenger-browser.cjs
node scripts/auto-challenger-package-browser.cjs
```
