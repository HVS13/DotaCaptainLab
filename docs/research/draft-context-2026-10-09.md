# Context-dependent draft variation — 9 October 2026

The contextual policy improved average simulated outcomes, but reduced opening diversity and failed the frozen uncertainty limits. Keep production Auto unchanged at 2.7.4. This is a promising outcome-selection experiment, not a validated replacement satisfying the requested variety and regression limits.

## Completed results

All 32 paired drafts completed. Standard won 260/512 evaluated cases; contextual drafting won 290/512. Severe losses fell from 125 to 104. These are deterministic simulator benchmark counts, not calibrated PvP probabilities.

| Metric | Context minus Standard | One-sided 95% bound | Frozen requirement | Result |
| --- | ---: | ---: | --- | --- |
| Simulator successes | +5.8594 percentage points | Lower: −0.5859 points | Lower bound ≥ −0.5 points | Fail |
| Severe losses | −4.1016 percentage points | Upper: +2.1484 points | Upper bound ≤ +0.5 points | Fail |
| First-pick entropy | −0.07985 bits | Evaluated jointly below | Nondeclining estimate | Fail |
| First-ban entropy | −0.09002 bits | Evaluated jointly below | Nondeclining estimate | Fail |
| Sum of opening entropies | −0.16987 bits | Lower: −0.43045 bits | Positive estimate and lower bound ≥ 0 | Fail |

The point estimates favor contextual drafting, but the paired uncertainty still allows regression beyond the accepted limits. Differences varied substantially across drafts: one gained 13 successes out of 16 evaluation cases; another lost nine. Aggregate successes against weighted, top-ranked, Counter and Creative opponents were respectively 55→65, 61→61, 73→78 and 71→86, each out of 128 cases. These subgroup counts do not establish separate confidence or real-match improvement.

Context filtering trained alternatives on 139 of 384 own actions and actually changed 61 actions across 29 drafts. It made 1,848 additional native continuation simulations. Therefore the lack of diversity improvement is not an inactive-policy artifact: the changed choices concentrated openings more than current Standard on this sample. The mechanisms producing that concentration are not established by these totals.

Both policies completed all strategy screens and retunes. Combined optimization examined 6,400 native item candidates, including 1,600 identity-changing candidates, and made 43,584 simulator calls before the 1,024 final evaluation calls. Maximum measured contextual decision time was 3.572 seconds under four concurrent Node benchmark processes; this is not browser or live timer verification.

An independent Python recomputation from individual test records matched win/severe-loss totals, percentage-point changes and both entropy changes. The analysis checks also passed the frozen seed/stratum schedule, completeness, summary counts, legal selected builds and optimizer-training-profile exclusions. No policy threshold or exposure was tuned against these results.

The tested version should remain isolated. It does not yet meet the combined goal of improved variety and certified minimal regression. Any revision needs new frozen parameters and unseen seeds; this batch must not be reused as its confirmation set. Passing a future simulator test would still require separate live timing/control and real-match validation.

## Policy and comparison

This isolated experiment tests a full contextual policy against current Standard Auto, using the unchanged native scores and simulator. The [protocol](draft-context-protocol.json) fixes the policy, seeds, sample and acceptance rules before outcome testing. It is not included in the production app.

For each own action, the policy retains the native weighted choice as its baseline. It considers at most two alternatives from that native candidate pool, within one native point of the top-ranked candidate. Alternatives must preserve minimum and mean strong follow-up counts after removing the strongest remaining option, eligible-role count, and capped disable/save/reach/siege/waveclear coverage. Native composition, threat, synergy, doctrine and timing components may not fall more than 0.5 points below baseline. The final own pick remains unchanged.

Follow-up counts are a resilience proxy: removing the strongest option independently per role does not enumerate every possible enemy ban. Eligible-role counts are also a flexibility proxy; this policy does not automatically reconsider previously locked own roles. These checks express drafting hypotheses, not a validated model of professional players.

Candidates surviving those checks receive six continuation simulations: two assumed future enemy openings, each evaluated against three native enemy strategy presets. The prediction uses only revealed heroes, own role locks and inferred enemy roles. It cannot read the benchmark opponent's hidden role locks or opening plan. An alternative is eligible only if these training simulations do not reduce wins, mean net worth or worst net worth. The policy samples the baseline and eligible alternatives using native-score weights with temperature 1.75. Training parity is a filter, not evidence of general improvement.

## Evaluation

Thirty-two new paired drafts cover both factions and four opponent policies (Standard weighted, Standard top ranked, Counter weighted and Creative weighted), with four pairs per faction/policy stratum. The Standard baseline reproduces the previous benchmark's draft states on both sides for all four modes. Corresponding policies use the same per-turn random streams; opponents react to each policy's revealed moves.

Both completed teams pass through the existing headless production optimizer adapter: all 64 own strategies against three native enemy presets, at most 100 native ordered-item candidates total, and strategy retuning with selected builds. Frozen time makes this a reproducible work-budget check, not a test of browser timer compliance or exhaustive item search.

Each optimized team is evaluated on 16 separately seeded enemy strategy/eligible-role/default-item-order profiles, giving 512 cases per policy. Exact optimizer training preset/default-opponent profiles are excluded. Own strategies and ordered item builds are the actual optimizer selections. Enemy custom item identities remain unmodeled. Corresponding streams are paired, although different drafted enemy teams have different eligible role variants.

Uncertainty uses 10,000 paired whole-draft bootstrap resamples stratified by side and opponent policy. The 16 cases within one draft are not counted as independent drafts. This is a full policy comparison, not a 4% mixture. The frozen limits require a success lower one-sided 95% bound of at least −0.5 percentage points, a severe-loss upper bound of at most +0.5 points, nondeclining first-pick and first-ban entropy estimates, and positive entropy-sum change with nonnegative lower bound. Severe loss means a simulated loss with signed final net worth below −20,000.

## Evidence and reproduction

- [Machine-readable analysis](draft-context-analysis.json)
- [Merged paired results, selected builds and training traces](draft-context-results.json)
- Raw parts: [0](draft-context-part-0.json), [8](draft-context-part-8.json), [16](draft-context-part-16.json), [24](draft-context-part-24.json)
- Research code: [policy](../../scripts/draft-context.cjs), [benchmark](../../scripts/draft-context-benchmark.cjs), [analysis](../../scripts/draft-context-analysis.cjs)

From the repository root:

```sh
node scripts/draft-context-benchmark.cjs 0 8 draft-context-part-0.json
node scripts/draft-context-benchmark.cjs 8 8 draft-context-part-8.json
node scripts/draft-context-benchmark.cjs 16 8 draft-context-part-16.json
node scripts/draft-context-benchmark.cjs 24 8 draft-context-part-24.json
node scripts/draft-context-analysis.cjs
node tests/draft-context.cjs
```

The regression test covers draft legality, deterministic choices, final-pick fallback, the continuation gate, hidden-opponent independence and Standard baseline parity across both factions/all four modes. Analysis rejects incomplete batches, summary/count mismatches, illegal selected item builds and exact optimizer-training profiles in evaluation.

The manual live-source check at 15:01 Jakarta time on 9 October found all 50 inspected draft/Daily public assets unchanged. Private server parity and authenticated live controls remain unverified. No scheduler or recurring AI job was created.
