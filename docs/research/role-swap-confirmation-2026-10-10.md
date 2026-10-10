# Controlled role-swap independent confirmation — 10 October 2026

This separate test uses 32 fresh paired drafts to confirm the unchanged controlled final-role-swap candidate. The preceding 16-pair pilot had small favorable totals but failed the uncertainty limits. Pilot outcomes are not pooled into this confirmation, and no thresholds or selection rules are tuned. Production remains v2.7.7 pending evidence and, if appropriate, separate integration validation.

## Completed confirmation

Shelve this unchanged candidate under the frozen decision rule. All 32 planned pairs completed, with 512 logical held-out profiles per policy. Standard won 272 and had 147 severe losses; the swap candidate won 287 and had 122 severe losses. These are native simulator outcomes, not measured human PvP win rates.

| Metric | Controlled swap minus Standard | One-sided 95% bound | Frozen requirement | Result |
| --- | ---: | ---: | --- | --- |
| Simulator successes | +2.9297 percentage points | Lower: −2.7344 points | Lower ≥ −0.5 points | Fail |
| Severe losses | −4.8828 points | Upper: −1.3672 points | Upper ≤ +0.5 points | Pass |
| First-pick / first-ban entropy | 0 / 0 bits | Unchanged | Not targeted | — |

The severe-loss uncertainty requirement passed within this benchmark. The win-rate point estimate improved, but the lower bound failed its regression limit. Both requirements were mandatory; the conjunction failed. This does not prove the candidate reduces overall win rate, nor does it establish a reliable increase. Do not override the frozen rule using the positive point estimate, pool pilot outcomes to seek a pass, or tune away failed swaps on this confirmation batch. Auto remains Standard at v2.7.7. Conditional role-application/timer integration work was not triggered by a failed confirmation.

Eight drafts accepted a swap. Their held-out win changes were +2, +1, +9, +5, +10, −7, +6 and −11. Two changed drafts regressed substantially despite per-case training guards. Twenty-four unchanged states reused marked deterministic baseline optimization/evaluation. Screening considered 59 eligible pairs and made 273 native simulator calls including baseline screens. Forty actual optimizations examined 4,000 item candidates and made 27,240 optimizer simulator calls. Reuse is excluded from those execution totals.

JavaScript validation confirmed the frozen policy/adapter hashes, complete seed/stratum schedule, no pilot-seed reuse, identical paired profiles, native-eligible unique roles, two-role-only changes, legal item builds, training qualification/exclusion and exact reuse payloads. Independent Python recomputation matched totals, rate changes, paired profiles, accepted training inequalities and reuse. No training thresholds, sample size or candidate exposure changed after outcomes. Four pairs per stratum still limit inference, and unknown enemy custom builds and human opponent frequencies remain outside the model.

## Frozen protocol

The [protocol](role-swap-confirmation-protocol.json) was saved before execution. It records SHA-256 hashes of the policy and production optimizer adapter. The existing benchmark and analysis scripts now accept `confirmation` to select the fresh schedule and separate output paths; their default pilot schedule remains unchanged.

Thirty-two seeds `167000047 + index × 104729` cover both factions and four opponent styles, giving four pairs per stratum. Each completed hero draft is fixed between policies. The policy screens native-eligible role pairs after drafting, excludes explicit locks, requires each training case to preserve wins and gold with some strict gain, and makes at most one swap. The other three intended roles remain fixed. Both outputs use the existing three-preset strategy optimizer and 100-item-candidate work budget. Unchanged states reuse marked deterministic baseline optimization/evaluation; reused results are excluded from execution counts.

Each policy receives 16 paired held-out enemy strategy/eligible-role/default-item-order profiles, for 512 logical profiles per policy. Exact three-preset/default-opponent training profiles are excluded. No previous experiment or uploaded match is confirmation data. Hidden enemy custom item identities and exhaustive role assignments remain unmodeled. Role-dependent own defaults and later configuration optimization can change along with swapped roles; this is not an independent pure-role causal estimate.

The same acceptance limits use 10,000 stratified paired whole-draft bootstrap samples: success lower one-sided 95% bound ≥ −0.5 percentage points and severe-loss upper bound ≤ +0.5 points. Severe loss means lose with signed final gold below −20,000. Opening variation stays unchanged. Passing only permits separate role-application/deadline validation before considering Auto integration. Failure shelves this unchanged candidate.

The manual source check at 16:36 Jakarta on 10 October found all 50 inspected public draft/Daily assets unchanged. Private-server parity and actual human PvP win rates remain unverified.

## Reproduction

- [Unchanged policy](../../scripts/draft-role-swap.cjs), [benchmark](../../scripts/role-swap-benchmark.cjs), [analysis](../../scripts/role-swap-analysis.cjs)
- [Frozen protocol](role-swap-confirmation-protocol.json), [source check](role-swap-confirmation-source-check.json)
- [Analysis](role-swap-confirmation-analysis.json), [merged screening/configuration records](role-swap-confirmation-results.json)
- Raw parts: [0](role-swap-confirmation-part-0.json), [8](role-swap-confirmation-part-8.json), [16](role-swap-confirmation-part-16.json), [24](role-swap-confirmation-part-24.json)

```sh
node scripts/role-swap-benchmark.cjs 0 8 confirmation
node scripts/role-swap-benchmark.cjs 8 8 confirmation
node scripts/role-swap-benchmark.cjs 16 8 confirmation
node scripts/role-swap-benchmark.cjs 24 8 confirmation
node scripts/role-swap-analysis.cjs confirmation
node tests/draft-role-swap.cjs
```
