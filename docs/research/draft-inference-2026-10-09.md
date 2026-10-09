# Forecast-role consistency experiment — 9 October 2026

The role-aligned candidate passed the frozen performance limits but failed the opening-diversity requirement. Keep it isolated; production Auto remains unchanged at 2.7.4. This experiment tests one correction to the rejected strict override policy: forecast leaves infer enemy roles and default builds in the same way as the final optimizer. It does not change the native engine, scoring formulas, candidate filters, gain thresholds, random weights or item optimizer.

## Completed confirmation results

All 64 fresh paired drafts completed, with 1,024 final evaluation cases per policy. Standard won 555 cases and had 233 severe losses; the corrected policy won 561 and had 220 severe losses. These are simulator outcomes, not measured human PvP win rates.

| Metric | Corrected policy minus Standard | One-sided 95% bound | Frozen requirement | Result |
| --- | ---: | ---: | --- | --- |
| Simulator successes | +0.5859 percentage points | Lower: −0.3906 points | Lower bound ≥ −0.5 points | Pass |
| Severe losses | −1.2695 percentage points | Upper: −0.1953 points | Upper bound ≤ +0.5 points | Pass |
| First-pick entropy | −0.00857 bits | Joint bound below | Nondeclining estimate | Fail |
| First-ban entropy | 0 bits | Joint bound below | Nondeclining estimate | Pass |
| Sum of opening entropies | −0.00857 bits | Lower: −0.05256 bits | Positive estimate and lower bound ≥ 0 | Fail |

Passing the success noninferiority margin does not prove increased success: its lower bound still permits a small decline. The combined objective fails because first-pick diversity decreased. Do not enable this as the default or claim it improves professional-style drafting or actual PvP wins.

Four of 768 own actions changed across four drafts. Their final success changes were +2, −3, +1 and +6 cases. Aggregate success counts by weighted, top-ranked, Counter and Creative opponents were 126→123, 118→125, 165→165 and 146→148, each out of 256 profiles. The weighted subgroup still regressed; these subgroup counts have no separately established uncertainty bounds.

Training screened alternatives on 285 actions using 7,572 continuation simulations. Sixty-eight actual optimizations examined 6,800 item candidates, including 1,700 identity-changing candidates, and made 46,308 optimizer simulator calls. Final evaluation made 1,088 actual calls; 60 exact-state reuse evaluations were marked separately. Maximum measured decision time was 11.802 seconds under four concurrent Node processes, not live-browser timing.

Independent Python recomputation matched all success/severe-loss counts and entropy point estimates, checked every reused payload and verified every changed action's qualification inequalities. JavaScript analysis checked all frozen seeds/strata, outcome completeness, selected item legality and training-profile exclusion. Regression tests passed for the original strict policy and the corrected evaluator. No thresholds or seeds were tuned after outcomes.

## Diagnostic evidence

Replays of all five changed drafts reproduced the recorded training and final outcome summaries. No arithmetic discrepancy was found within these replays. Ordered ablations then substituted actual future teams, inferred roles, held-out strategies/roles/item order, and selected own strategies/items. These substitutions are interacting comparisons, not independent causal contributions.

| Changed draft | Original forecast success advantage | Final held-out success change | Qualifies with inferred leaf roles? |
| --- | ---: | ---: | --- |
| 0: Puck → Dawnbreaker | +2 / 12 | 0 / 16 | No |
| 11: Mars → Dawnbreaker | +4 / 12 | −9 / 16 | No |
| 24: Beastmaster → Invoker | +2 / 12 | +6 / 16 | No |
| 34: Puck → Dawnbreaker | +3 / 12 | 0 / 16 | Yes |
| 56: Timbersaw → Dawnbreaker | +6 / 12 | −5 / 16 | No |

In drafts 0 and 11, replacing hypothetical future teams with the teams actually drafted reversed the forecast advantage while retaining known generated roles and the same three enemy presets. Role inference caused additional swings in drafts 24, 34 and 56. Applying selected own item builds also worsened relative performance sharply in drafts 11 and 56. This supports forecast and optimizer generalization concerns; it does not establish one cause for every failure.

The old forecast erased actual hidden enemy roles before completion, then treated newly generated future role assignments as fixed at the leaf. The final optimizer instead inferred roles because those assignments were unknown. This is an information-assumption mismatch, not demonstrated leakage of actual enemy roles. The minimal correction aligns the two inputs. The actual generated enemy role assignments were already present in the final evaluator's role variants in all ten replayed final states; their absence from that variant set was not the explanation here.

Changing the leaf assumption rejects four old overrides, including both that lost held-out wins, but also rejects the one that gained wins. These five selected cases are diagnostic data and cannot certify the correction. Confirmation uses new seeds.

## Frozen confirmation

The [protocol](draft-inference-protocol.json) was saved before testing. Sixty-four fresh paired drafts use seeds `83000033 + index × 104729`, both factions and four opponent styles. Each final team uses the unchanged fixed-work-budget production strategy/item optimizer and receives 16 separate evaluation profiles. Exact-identical states reuse deterministic baseline calculations, explicitly marked and excluded from execution counts.

Acceptance retains the earlier success and severe-loss uncertainty limits of 0.5 percentage points and the requirement for increased opening diversity. Ten thousand stratified paired whole-draft bootstrap samples treat drafts, rather than their 16 profiles, as the sampling units. Native simulator outcomes are not calibrated human PvP probabilities. Enemy custom item identities and private-server parity are not established. This confirmation compares the corrected policy with Standard; its different seeds do not support a direct performance comparison with the earlier uncorrected policy's batch.

The manual source check at 17:34 Jakarta on 9 October found the 50 inspected public draft/Daily assets unchanged. Private server updates cannot be detected by that check.

## Reproduction and evidence

- [Ordered replay results](draft-replay-results.json), [role consistency diagnostics](draft-replay-roles.json)
- [Replay script](../../scripts/draft-replay.cjs), [role diagnostic script](../../scripts/draft-replay-roles.cjs)
- [Correction](../../scripts/draft-inference.cjs), [benchmark](../../scripts/draft-inference-benchmark.cjs), [analysis](../../scripts/draft-inference-analysis.cjs)
- [Protocol](draft-inference-protocol.json), [public source check](draft-inference-source-check.json)
- [Analysis](draft-inference-analysis.json), [merged records](draft-inference-results.json)
- Raw parts: [0](draft-inference-part-0.json), [16](draft-inference-part-16.json), [32](draft-inference-part-32.json), [48](draft-inference-part-48.json)

```sh
node tests/draft-inference.cjs
node scripts/draft-inference-benchmark.cjs 0 16 draft-inference-part-0.json
node scripts/draft-inference-benchmark.cjs 16 16 draft-inference-part-16.json
node scripts/draft-inference-benchmark.cjs 32 16 draft-inference-part-32.json
node scripts/draft-inference-benchmark.cjs 48 16 draft-inference-part-48.json
node scripts/draft-inference-analysis.cjs
```
