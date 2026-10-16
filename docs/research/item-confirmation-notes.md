# Independent confirmation of the unchanged item-replacement rule

The candidate passed the frozen outcome acceptance criteria on an independent confirmation cohort and the subsequent sampled headless-browser timing check. It has not been integrated or deployed: full Auto application and minimized-browser verification remain required. Published v2.8.7 is unchanged.

## Fixed sample size

The previous 32-draft pilot was excluded from the confirmation outcome calculation. Its paired draft-level win difference was -0.001953125, and the average sample variance within the eight side/opponent strata was 0.0003662109375. Before new results, the normal approximation for a one-sided 5% noninferiority check at 80% target power was rounded upward to a multiple of eight:

`ceil_to_8((z0.95 + z0.80)^2 * variance / (pilotMean + 0.005)^2) = 248 drafts`.

This planning calculation assumes the sparse pilot effect and variability generalize. It does not guarantee power and does not power a superiority claim or establish a real PvP effect. The 248 new drafts give 31 draft clusters per side/opponent stratum, with 16 paired held-out scenarios each. No statistical acceptance was calculated during the run; there was no sample extension, rule tuning, threshold relaxation or pooling with the pilot after the result.

The confirmation adapter reuses the existing pilot benchmark, analysis and native verifier, substituting dataset/artifact names, new seeds, part boundaries and the fixed sample size only. It still loads the exact `item-replacement.cjs` policy. Its hash is recorded in the frozen protocol; baseline policy source hashes are checked in the result parts and final analysis. Existing pilot artifacts were preserved.

## Outcome

| Outcome | Published v2.8.7 | Candidate |
| --- | ---: | ---: |
| Scenario wins | 2,409 / 3,968 | 2,411 / 3,968 |
| Severe losses | 697 / 3,968 | 693 / 3,968 |

Observed win difference: +0.050403 percentage points (two additional scenario wins). Severe-loss difference: -0.100806 points (four fewer severe losses). Severe loss retains the existing definition: native loss with signed own net worth below -20,000.

The 10,000-resample stratified paired whole-draft bootstrap gave a one-sided 95% win lower bound of -0.050403 percentage points, within the frozen -0.50-point allowance. The severe-loss upper bound was zero, within +0.50 points. The benefit requirement passed because 25 builds changed and the observed aggregate outcomes improved. All draft actions, roles, published winning strategies and opening distributions were unchanged.

These results qualify the candidate under the prespecified criteria, but do not establish positive win-rate superiority: the win lower bound remains below zero. The benefit is tiny, and scenario fractions remain hypothetical coverage, not calibrated PvP win probabilities.

Across 248 drafts, 232 had legal proposals. The candidate screened 765 actual single-item identity replacements, checked 135 nominees against all 64 enemy strategies, and selected 25 changed builds. Added native calls totaled 10,530: 765 times three screening cases plus 135 times 61 uncached verification cases. The rule still searches at most two native hero-recommended, role-affine replacements per hero; it does not search all item catalog substitutions or a global optimum.

## Verification

All 248 seeds were unique and checked against recorded research. Final analysis checked exact candidate generation, native build legality, one-item changes, nomination, the existing win/severe-loss guard, cached preset cells, source hashes, matched original settings and exclusion of the full training role/item profile from holdouts. All 744 sampled direct native replays matched winner, duration and signed net worth. This is sampled parity, not exhaustive private-server equivalence.

The pretest public-source check at 2026-10-16T10:30:43.623Z found all 50 inspected public JavaScript assets and the local engine unchanged, with no errors. It cannot check private server changes.

## Conditional browser timing

After outcome acceptance, a separate native-worker prototype ran the original published four-strategy risk check and optional item evaluation within the same 20-second overall budget. Three fixtures were selected mechanically from the completed cohort: most proposals, most proposals among changed builds (excluding the first fixture), and the first no-proposal draft. These are timing/parity samples, not additional outcome tests.

| Draft index | Published risk check | Item work | Combined | Result |
| --- | ---: | ---: | ---: | --- |
| 74 | 6.108 s | 4.670 s | 10.778 s | Published build retained |
| 164 | 5.764 s | 4.715 s | 10.479 s | Guarded item replacement selected |
| 7 | 6.392 s | 0.097 s | 6.489 s | No proposals; published build retained |

Chrome 155.0.8059.40 was used headlessly. Baseline rows, item selection and candidate results matched the Node reference. The initial parity assertion halted on a ~2e-11 net-worth difference; it was corrected to use the project's established 1e-8 tolerance for net worth/duration, with exact checks for winners, strategies, item identities, counts and categorical state. The completed rerun's maximum numerical difference was 2.9103830456733704e-11. No outcome-selection rule changed.

One-millisecond deadline and cancellation probes returned incomplete results while preserving the published item configuration. The timing gate passed these samples, but does not guarantee all hardware, full preparation time, the live 90-second application reserve, real hidden-tab timing, frozen/discarded tabs or authenticated PvP behavior. The reserve was not changed; no live game actions were taken.

## Remaining release gate

The research prototype is ready for production integration testing, not release. Full Auto must still be checked applying all five roles, all 30 ordered item slots including a selected replacement, all six strategy choices and Continue/match-start acknowledgement, including minimized-browser phase transitions and incomplete optional-work fallback. No published app code, userscript version, GitHub Pages deployment or Git commit was changed during this confirmation.

Files use the `item-confirmation-` prefix: protocol, freshness, four result parts (starts 0, 64, 128, 192), analysis, native verification and browser report. `scripts/item-confirmation.cjs benchmark <start>` runs a fixed part and overwrites its confirmation results; `analysis` and `verify` rerun checks. `scripts/item-confirmation-browser.cjs` runs the separate headless native-worker timing prototype. The freeze command is creation-only and refuses to overwrite the existing protocol.
