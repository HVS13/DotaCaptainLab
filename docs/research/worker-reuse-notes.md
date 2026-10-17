# Winning-worker reuse

The v2.8.8 controller terminated four completed strategy workers and created a fifth worker for the item check. The candidate retains the winning worker, terminates the other three, and sends the unchanged item request to that existing worker. All workers are still terminated on completion, cancellation, deadline or error; there is no cross-match pool or new cache. Native formulas, item policy, roles, draft behavior, simulation counts, selection guard, 20-second allowance and 90-second application reserve are unchanged.

## Measurement

`scripts/item-worker-profile.cjs` compares the original controller from commit `40c4a21` with that one-transition reuse variant. Five fixed inputs run in two order-balanced blocks: the three existing release fixtures and configurations from the minimized and foreground native reports. The foreground report retains its deliberately forced legal application-probe build; it is not an untouched pre-probe optimizer result. Timing hooks exist only in this research harness.

All ten pairs completed their item check under 20 seconds in both arms. All 2,688 compared cells, selected strategies, item identities, guards and simulation counts matched; numeric differences were zero. Reuse created four workers per run instead of five. The median item compute time was 4,224.25 ms for the original and 3,851.55 ms for reuse (about 8.8% lower). The median paired total saving was 346.9 ms.

Overall timing was mixed: the unpaired median total increased from 11,188.75 to 11,521.4 ms, and individual runs included both gains and regressions. Strategy-stage timings also varied even though that stage's code was identical. This small descriptive sample supports avoiding a redundant worker and a modest item-stage saving, not a universal end-to-end speedup, fewer timeouts, statistical superiority or a higher PvP win rate. No completion-rate improvement was observed because both arms completed every sample.

The [verification output](item-worker-profile-verification.json) records every paired timing and parity check. Full profiling rows remain in `item-worker-profile.json`; `scripts/item-worker-profile-verify.cjs` rechecks them. The [public-source check](worker-reuse-freshness.json) found all 50 inspected assets and local engine unchanged; private server code remains outside its scope.

Focused controller and Auto-flow tests verify winning-worker reuse, exact item/strategy application, no fifth worker, termination of every worker, and retention of the completed winner on timeout, cancellation, worker errors or failure to post the item request. Initial worker-constructor denial remains covered separately by the existing controller test. Generated-package and native-flow evidence use the `worker-reuse-` prefix so v2.8.8 evidence is preserved.

Ten focused local tests and both generated-script syntax checks passed. The [generated-browser check](worker-reuse-browser.json) matched 832 reference cells within the established 1e-8 tolerance, including the selected replacement, and retained the completed strategy winner on deadline, cancellation and item-request transport failure. The [genuinely minimized native demo](worker-reuse-minimized-native.json) passed from draft through five roles, all 30 item slots, six strategy choices, Continue and match-start acknowledgement. Its optional item check still reached its deadline and safely retained the completed strategy winner; this run does not demonstrate reduced live timeouts. Authenticated PvP and frozen/discarded tabs remain unverified.

The original v2.8.8 release is retained under tag `v2.8.8`; the existing v2.8.7 rollback is also preserved.
