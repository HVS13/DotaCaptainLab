# Native selection with strict contextual overrides — 9 October 2026

Reject this tested policy as a production replacement. On 64 new paired drafts, it reduced simulated successes, increased severe losses and slightly reduced first-pick diversity. Production Auto remains unchanged at 2.7.4. This rejects the particular strict override rule; it does not establish that improvement is impossible.

## Completed results

All 64 planned pairs completed. Each policy has 1,024 final evaluation cases. Standard won 598 cases and had 203 severe losses; strict overrides won 590 and had 208 severe losses. These are benchmark simulator outcomes, not calibrated PvP probabilities.

| Metric | Override minus Standard | One-sided 95% bound | Frozen requirement | Result |
| --- | ---: | ---: | --- | --- |
| Simulator successes | −0.7813 percentage points | Lower: −2.7344 points | Lower bound ≥ −0.5 points | Fail |
| Severe losses | +0.4883 percentage points | Upper: +2.1484 points | Upper bound ≤ +0.5 points | Fail |
| First-pick entropy | −0.01352 bits | Evaluated jointly below | Nondeclining estimate | Fail |
| First-ban entropy | 0 bits | Evaluated jointly below | Nondeclining estimate | Pass |
| Sum of opening entropies | −0.01352 bits | Lower: −0.09995 bits | Positive estimate and lower bound ≥ 0 | Fail |

The success point estimate already exceeds the allowed 0.5-point regression. Severe-loss uncertainty also exceeds its limit. This does not satisfy the combined performance and variety objective, despite preserving most native choices.

Only five of 768 own actions changed, across five drafts. Two changed drafts had identical final success counts; one gained six cases and another lost five against Standard weighted opponents. A fifth lost nine against a top-ranked opponent. Aggregate successes against weighted, top-ranked, Counter and Creative opponents were respectively 146→147, 154→145, 159→159 and 139→139, each out of 256 cases. These subgroup counts do not establish separate confidence bounds.

Training considered alternatives on 279 own actions and made 7,404 additional native continuation simulations. The policy's four-response training advantage did not reliably transfer to the independently evaluated, optimized final drafts. These results alone do not isolate whether future-composition forecasting, strategy selection or opponent-profile coverage caused the discrepancy. A subsequent [replay and role-consistency experiment](draft-inference-2026-10-09.md) investigates those assumptions without reusing this batch as confirmation.

There were 69 executed optimizations and 59 marked exact-state reuses, representing 128 logical completed policy evaluations. Actual optimization examined 6,900 native item candidates, including 1,725 identity-changing candidates, and made 46,989 simulator calls; final evaluation made 1,104 actual calls. Reused results are not counted as new executions. Maximum measured decision time was 12.005 seconds under four concurrent Node processes; this is not live-browser timer verification.

Independent Python recomputation matched success/severe-loss totals, metric changes and entropy changes. It also checked every reused payload and every changed action's recorded strict training inequalities. The JavaScript analysis passed completeness, seed/stratum, item legality and training-profile exclusion checks. No threshold, sample or exposure was tuned after seeing outcomes.

Keep the current default. The added computation did not produce a supported improvement. A future candidate needs a new frozen protocol and unseen data; this rejected batch must not be reused as its confirmation set. Private-server parity, live timer/control behavior and actual human PvP improvement remain unverified.

## Frozen policy

This experiment tests the proposed stricter override rule on 64 new paired drafts. The [protocol](draft-override-protocol.json) fixes the thresholds, sample and acceptance rules before outcome testing. Production Auto is unchanged; the research policy is not loaded by the app.

Keep the original native Standard weighted draw whenever alternatives tie, fail context checks, or lack consistent training improvement. As in the preceding contextual experiment, consider at most two alternatives in the native pool within one native point of the top-ranked candidate. Preserve minimum/mean strong follow-up counts after removing the strongest option, eligible-role count and capped disable/save/reach/siege/waveclear coverage. Native composition, threat, synergy, doctrine and timing components cannot fall more than 0.5 points below baseline. The final own pick remains unchanged.

These role and follow-up checks are proxies: they do not enumerate every possible ban or reassign previously locked own roles. The experiment expresses a drafting hypothesis, not a validated professional-player model.

Each surviving candidate receives four continuation response models: Standard weighted/early opening, Standard top-ranked/late opening, Counter weighted/teamfight opening and Creative weighted/early opening. Each finished continuation is simulated against three native enemy strategy presets, giving 12 training cases per candidate. Future own actions use native Standard. Forecasts initially see only revealed enemy heroes and inferred roles; the actual hidden enemy locks and opening plan are not inputs. At the leaf, the original policy treats the hypothetical continuation's generated enemy role assignments as fixed. The final optimizer instead infers unknown enemy roles.

An override requires at least 1,000 more mean signed net worth across all 12 cases. Every response model must separately have nondecreasing wins, strictly higher mean net worth and nondecreasing worst net worth. Otherwise retain the exact original native draw. If multiple alternatives qualify, use native-score weights with temperature 1.75. The 1,000-net-worth threshold is a frozen conservative hypothesis, not a native scoring formula or statistical confidence bound. Training improvement is not sufficient evidence of general improvement.

## Evaluation

The 64 unseen paired seeds cover both factions and four opponent policies: Standard weighted, Standard top ranked, Counter weighted and Creative weighted. Each faction/policy stratum contains eight pairs. Both policies use corresponding per-turn random streams; opponents react to the moves each policy reveals. Earlier batches are not reused as confirmation.

Completed teams use the existing production optimizer body through the headless adapter: all 64 own strategies against three native enemy presets, at most 100 native ordered-item candidates total, and strategy retuning when selected builds change. Time is frozen to make the work budget deterministic; live browser deadlines and an exhaustive item optimum are not being tested.

Each optimized team receives 16 separately seeded enemy strategy/eligible-role/default-item-order profiles, giving 1,024 evaluation cases per policy. Exact optimizer training preset/default-opponent profiles are excluded. Own selected strategy and ordered builds are the actual optimizer outputs. Enemy custom item identities remain unmodeled. Case streams are paired, although different enemy teams have different eligible role variants.

When the serialized final optimizer state and evaluation seed are exactly identical, the benchmark reuses the baseline's deterministic optimization and final evaluation. Such rows are marked; execution totals exclude reused calculations. They remain valid paired observations with zero policy difference, not additional independent simulator executions.

The unchanged acceptance rules use 10,000 stratified paired whole-draft bootstrap resamples. Evaluation profiles inside a draft are not independent draft samples. Success must have a lower one-sided 95% bound of at least −0.5 percentage points; severe losses must have an upper bound of at most +0.5 points. First-pick and first-ban entropy estimates must not decline, and their sum must increase with a nonnegative lower bound. Severe loss means a simulated loss with signed final net worth below −20,000.

## Reproduction

- [Machine-readable analysis](draft-override-analysis.json)
- [Merged results, selected settings and training traces](draft-override-results.json)
- Raw parts: [0](draft-override-part-0.json), [16](draft-override-part-16.json), [32](draft-override-part-32.json), [48](draft-override-part-48.json)
- Research code: [policy](../../scripts/draft-override.cjs), [benchmark](../../scripts/draft-override-benchmark.cjs), [analysis](../../scripts/draft-override-analysis.cjs)

```sh
node scripts/draft-override-benchmark.cjs 0 16 draft-override-part-0.json
node scripts/draft-override-benchmark.cjs 16 16 draft-override-part-16.json
node scripts/draft-override-benchmark.cjs 32 16 draft-override-part-32.json
node scripts/draft-override-benchmark.cjs 48 16 draft-override-part-48.json
node scripts/draft-override-analysis.cjs
node tests/draft-override.cjs
```

The regression test covers strict qualification, ties and insufficient/inconsistent gains, exact native fallback, legal deterministic drafts, four-response coverage, hidden-opponent independence and baseline parity on both factions/all four opponent modes. Analysis validates the complete seed/stratum schedule, outcome counts, selected item legality, exact optimizer-training-profile exclusions, reused payload equality and consistent training gain for every changed action.

The manual live-source check at 15:34 Jakarta time on 9 October found all 50 inspected draft/Daily public assets unchanged. Private server parity and authenticated live control/timer behavior remain unverified. No scheduler or recurring AI job was created.
