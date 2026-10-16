# v2.8.8 bounded item-check release

The unchanged, independently confirmed item rule is now bundled into Auto's incomplete-scout strategy check. It runs after the original four-strategy winner is complete and shares the existing 20-second allowance. The 90-second application reserve, draft choices, roles, Daily and fully observed scout path are unchanged. The frozen policy SHA-256 remains `41224713f1b11a43f7b760a86a475d2e7a562dbcca47e870881d000b5580d3ec`.

Optional item timeout, cancellation or worker failure retains the completed strategy winner and its items. Draft, role, phase and token changes still invalidate stale work. A selected replacement is carried into Auto's actual item controls and alternatives; UI selection distinguishes identical strategies with different builds. Selected-item strategy coverage becomes one after an identity replacement, rather than reusing the original build's screening count.

## Verification

- [Generated package](item-release-browser.json): actual Blob workers in Chrome 155.0.8059.80 matched three native fixtures, including a selected identity replacement. All 832 checked cells matched winners and severe-loss status exactly; maximum net-worth/duration difference was 2.91e-11, within the existing 1e-8 tolerance. Completed checks took 8.07–16.69 seconds. Real worker deadline, cancellation and optional-constructor rejection retained the completed strategy winner.
- [Minimized native demo](item-release-minimized-native.json): Chrome remained genuinely hidden/minimized from draft through five roles, all 30 item slots, six strategy calls, Continue and match-start acknowledgement. The optional item check reached its deadline and correctly retained the completed strategy result.
- [Native item-application probe](item-release-foreground-native.json): normal Chrome window, the same complete native flow, with one legal Sand King replacement (`force_staff` to `aghanims_scepter`, third purchase) inserted after optimization solely to exercise item application. Every selected slot and setting was verified. This deliberately forced replacement is application evidence, not evidence that the model selected or qualified it; model selection is covered by the separate generated-package fixture. Its normal optional check also timed out safely.
- Focused tests cover legality, fixed strategy, selection guards, unchanged input state, cached preset cells, incomplete-work fallback, cleanup, all item settings and acknowledgement. The release workflow includes these tests alongside existing required checks.
- All 45 local test/analysis/native-replay checks from that workflow passed, along with both generated-script syntax checks. The staged policy bytes also matched the frozen SHA-256.
- [Public source freshness](item-release-freshness.json): all 50 inspected assets and local engine unchanged at the recorded check; no private-server equivalence claim.

Native runs preceded the final coverage-count/presentation adjustment; the final helper behavior and reporting are covered by the focused flow tests. The worker-constructor failure path was checked in the generated browser package. Native demos mask only visible scout axes to exercise incomplete-scout behavior, without changing the game's choices. They use a temporary profile and reward-disabled demo, not authenticated PvP. Frozen/discarded tabs are not verified.

The [confirmation notes](item-confirmation-notes.md), protocol and aggregate analysis describe the pre-integration experiment. Full per-draft research parts remain local; the repository includes three self-contained release fixtures for package replay. The measured benefit was small and does not establish a higher real PvP win rate. Optional work is not guaranteed to complete on every machine or composition.

Rollback is the original published v2.8.7 commit `bbe6a3eae0d07e51bc88ba387b19c2c6c1092d29`, retained under tag `v2.8.7`.
