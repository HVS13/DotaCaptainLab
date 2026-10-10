# Small final-strategy challenger: positive diagnostic test

Subsequent integration: [Auto v2.8.0](auto-challenger-2026-10-11.md). The results and production boundary below describe the original frozen experiment before that release.

The frozen challenger passed the 16-pair simulator acceptance checks and real browser-worker timing/parity tests. It is research code, not enabled in production Auto v2.7.7. Higher real PvP win rate and authenticated preparation-phase integration remain unverified.

## Candidate and baseline

The baseline executes the actual production optimizer body through the existing harness, with a frozen clock and 100 native item candidates. This preserves the established comparison method; it is not an authenticated, time-limited Auto run. Both policies share the completed Standard hero draft, own roles and the baseline's selected ordered items.

At most four unique own strategies are considered: baseline choice, its top-three alternative choices, then the native best draft plan if space remains. Alternatives are re-evaluated using the baseline's selected items, regardless of the items associated with their original ranking. The baseline is always first; no qualifying change retains it.

Enemy settings come from existing native role/default-build helpers: inferred roles; the first native-eligible pair swap if available; the first two carry purchases reversed for each role layout. All compatible enemy binary strategies are evaluated for every shortlisted row. The observed batch had four variants and 64 enemy strategies, hence 1,024 native calls per draft. This is a small targeted uncertainty set, not all roles or custom enemy items.

A challenger must preserve or improve win counts and severe-loss counts in *each* variant, with strict improvement in at least one. Severe loss means defeat with signed final net worth below −20,000. Eligible strategies rank by minimum variant wins, total wins, fewer severe losses, summed mean signed net worth, then shortlist order. These are explicit modeled comparisons, not population win probabilities or a global minimax certificate.

The [protocol](strategy-challenger-protocol.json) and policy/source hashes were frozen before outcomes. The 16 new draft seeds start at 209000057 with step 104729; both factions and weighted/greedy/counter/creative native opponent policies are balanced. Each draft has 16 paired seeded held-out profiles excluding every exact training role-and-item setup. No policy or threshold tuning occurred after this batch. Arbitrary custom enemy item identities and all role permutations are outside the evaluation.

The initial Linux CI run caught byte-hash differences for the engine and overlay caused exclusively by Windows CRLF versus Git LF line endings. All four tested local files still matched their original frozen byte hashes, and their content matched Git exactly after CRLF normalization. The protocol retains those original hashes and records canonical LF hashes for cross-platform checks. Only line endings are normalized; source content remains frozen. This correction changes neither the tested policy nor the statistical limits.

## Results

| Held-out metric | Production-body baseline | Challenger |
|---|---:|---:|
| Wins among 256 deterministic cases | 141 | 154 |
| Severe defeats | 50 | 38 |

Five of sixteen final configurations changed. The point win difference is **+5.078125 percentage points** and the severe-loss difference **−4.6875 points** in these cases. There were 24 paired losses converted to wins and 11 paired wins converted to losses: higher aggregate success does not preserve every individual matchup.

The existing 10,000-resample stratified paired whole-draft bootstrap yields a one-sided 95% success lower bound of **+2.34375 points** and severe-loss upper bound of **−1.5625 points**. Both pass the frozen −0.5/+0.5-point thresholds. Draft openings are identical by design; this experiment does not add professional-player drafting behavior or change opening variation. This small diagnostic batch permits further integration checks, not PvP certification or independent confirmation across a broad opponent population.

Independent Python recomputed outcome counts, per-variant qualification/ranking, training/holdout exclusion, and the bootstrap bounds. All matched. Direct explicit original-engine payloads reproduced every **512** saved baseline/challenger holdout outcome in winner, signed gold and finish minute. Training tables were not independently replayed by that checker.

## Real browser execution

The research worker runner starts one Blob Web Worker per shortlist row, up to four, and makes the selection only after complete matched rows arrive before its deadline. Worker errors, cancellation or expiration retain baseline. It terminates workers, clears the timer and revokes the Blob URL. Synthetic tests cover denied workers, worker errors, cancellation, incomplete data and deadlines, including expiration after the final serial native call.

Installed Microsoft Edge 155.0.4283.45 in a fresh headless context completed two cold shortlist runs in **10.219** and **11.287 seconds**, using a 30-second challenger budget. Both retained/changed decisions matched the saved Node results. Main-thread 25-ms heartbeat counters continued (408 and 451 ticks), providing a limited responsiveness check rather than a full user-facing interaction audit.

All 2,048 completed browser cells matched winners, severe classifications and finish minutes. Gold differed by at most **2.91e-11**, within the existing replay tolerance of **1e-8**. The initial strict bit-for-bit assertion exposed those cross-runtime floating-point differences; the checker now preserves exact winner/severe/decision comparisons and applies the established tolerance to numeric outputs. No policy qualification, formulas or acceptance limits were weakened.

Real cancellation and deadline tests retained baseline in approximately 113.4 and 124.2 ms for a 100-ms request. Browser callbacks are not exact-time interrupts. The public `/draft` request redirected to **`/demo/lobby`**, where a third 1,024-cell worker run completed in **16.090 seconds** with the same parity checks. The reached lobby response had no Content-Security-Policy header. This establishes Blob-worker execution on that public lobby document; it does **not** establish authenticated draft/strategy-phase CSP or userscript-manager behavior.

The sequential Node challenger timings during four concurrent benchmark processes ranged from 43.3 to 92.3 seconds. They are contended diagnostic measurements, not comparable clean browser timing. The browser timing checks ran after those benchmark processes completed.

## Production boundary

The smaller search is computationally promising on this host and the modeled regression checks passed. Full Auto is unchanged: the worker runner is not yet connected to optimization, role/item application or Continue. The baseline optimizer can consume its existing 90-second cap; appending a fixed extra budget would not prove timely completion. Integration must preserve baseline optimization and allocate the challenger only the remaining preparation time after reserving the existing 65 seconds for application/confirmation, falling back if insufficient time remains.

Authenticated prep timers, visibility/background behavior, draft/configuration cancellation, live item/role application and userscript restrictions still need validation before a default rollout. No claim is made that every user/device will finish within 30 seconds. No scheduler, installed dependency or paid service was added. The existing local Playwright package and installed Edge were used for the standalone browser check.

The source check at **20:22 Jakarta on 10 October 2026** found all 50 inspected public draft/Daily assets unchanged. Private-server parity remains unverified.

## Evidence and reproduction

- [Analysis](strategy-challenger-analysis.json), [independent validation](strategy-challenger-certificate.json), [512 native replays](strategy-challenger-replay.json)
- [Real browser results](strategy-challenger-browser.json), [source check](strategy-challenger-source-check.json)
- Native data: [part 0](strategy-challenger-part-0.json), [part 4](strategy-challenger-part-4.json), [part 8](strategy-challenger-part-8.json), [part 12](strategy-challenger-part-12.json)
- [Policy](../../scripts/strategy-challenger.cjs), [worker runner](../../scripts/strategy-challenger-workers.js), [browser harness](../../scripts/strategy-challenger-browser.cjs)

```sh
node tests/strategy-challenger.cjs
node tests/strategy-challenger-workers.cjs
# Run start indices 0,4,8,12 separately; each processes four frozen draft pairs.
node scripts/strategy-challenger-benchmark.cjs 0 4
node scripts/strategy-challenger-analysis.cjs
python scripts/strategy-challenger-verify.py
node scripts/strategy-challenger-replay.cjs
# Requires an existing Playwright package and installed Edge; optional package path argument.
node scripts/strategy-challenger-browser.cjs
```

CI checks selection/deadline tests, saved-data analysis, independent Python validation and native holdout replay. It does not regenerate the full benchmark or rerun Windows browser timing.
