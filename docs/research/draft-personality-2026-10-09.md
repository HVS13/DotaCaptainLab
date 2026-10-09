# Native personality variation test — 09 October 2026

**Result: a small Creative mixture is promising, but does not yet justify silently replacing default Auto.** The revised 4% mixture passed the frozen draft-fit verification margins. A further Quick-strategy check improved the modeled average slightly but was too small to clear the same uncertainty limits. Current v2.7.4 remains unchanged; research scripts are not bundled into the userscript.

## Native policies and controls

Public module 16286 supports Standard, Counter, Creative and Greedy. Current Auto explicitly uses Standard. This experiment passes the existing native personality argument unchanged and keeps that personality for all 12 own actions. There are no new score weights, custom role rules, comfort pools or future-pick simulations. The strategy-fit aggregator remains the same Standard-based policy used in production, isolating the effect of the drafting personality rather than introducing another plan-selection change.

The adapter reproduces Standard draft lineups/roles exactly under the same random streams. Tests cover all four styles and both factions, 24 unique legal pick/ban actions, complete role assignments, and independence from hidden opponent opening plans and role locks. Opponents use either native Standard weighted selection or the highest Standard recommendation. These are test policies, not professional player models.

## Protocol and selection

Development used 16 paired drafts and all four styles, with 16 separately seeded evaluation profiles per completed draft. Each pair shares opening, per-turn and profile-generation random streams. Opponents respond to each resulting draft; final enemy teams and valid role-variant sets can differ. Evaluation profiles vary one of 64 binary strategies, native-eligible role swaps and default purchase ordering. Own items are defaults and the initial own strategy is the native draft-fit plan. The native simulator's internal seed is unmodified.

| Development style | Simulated successes / 256 | Severe losses / 256 | First-pick entropy | First-ban entropy |
| --- | ---: | ---: | ---: | ---: |
| Standard | 113 | 86 | 2.727 bits | 3.031 bits |
| Counter | 105 | 99 | 2.727 bits | 2.906 bits |
| Creative | 131 | 64 | 2.477 bits | 2.656 bits |
| Greedy | 116 | 88 | 2.906 bits | 2.983 bits |

Severe loss means a losing simulated case with signed final net worth below −20,000; it is a fixed diagnostic definition, not the native recap's Stomp label. Entropy describes the observed hero-frequency distribution: higher values mean less concentration, not better drafting.

Creative was selected for the best development success total, fewer severe losses and an observed opening-entropy increase when mixed with Standard. Creative alone was less diverse; a mixture can add support to the Standard opening distribution without replacing it. Development selection is not confirmation evidence.

The [5% protocol](draft-personality-protocol.json) was frozen before confirmation: 95% Standard / 5% Creative, selected once per whole draft. Acceptance margins were a one-sided 95% lower bound on modeled success change of at least −0.5 percentage points, a one-sided 95% upper bound on severe-loss change of at most +0.5 points, and nondeclining observed pick/ban entropy with a positive summed-change lower bound. Confidence estimates use 10,000 paired whole-draft bootstrap resamples, stratified by faction and opponent policy. Individual scenarios within a draft are not resampled as independent games.

## Five-percent confirmation

On 32 new paired drafts: Standard had 218/512 successes and 166 severe losses; Creative had 210/512 and 176. For a per-draft independent 95/5 mixture, the modeled success change is −0.0781 percentage points and severe-loss change is +0.0977 points. These are weighted expectations from separately completed style drafts, not observed mixed-policy matches.

The success lower bound was −0.5566 points and severe-loss upper bound +0.5273 points: both slightly outside the frozen limits. Diversity passed. The original 5% candidate was not accepted.

## Four-percent fresh verification

Exposure was reduced to 4% **after** the first confirmation, then assessed only on another 32 new paired drafts under the unchanged 0.5-point margins. The [revised protocol](draft-personality-verification-protocol.json) was frozen before those new seeds. The first confirmation was not reused to certify the revised mixture.

Standard: 207/512 successes and 169 severe losses. Creative: 233/512 and 161. The modeled 96/4 mixture yielded:

| Metric | Point change | One-sided bootstrap bound | Check |
| --- | ---: | ---: | --- |
| Success frequency | +0.2031 percentage points | Lower: −0.1641 points | Pass |
| Severe-loss frequency | −0.0625 points | Upper: +0.2266 points | Pass |
| First-pick entropy | +0.0050 bits | Combined with bans below | Nondeclining |
| First-ban entropy | +0.0375 bits | Sum lower bound: +0.0295 bits | Pass |

This clears the bounded-regression/diversity targets in this verification sample. It does not establish a positive success-rate improvement: the success bound still allows a small decline. A pure Creative replacement is not justified by a small-mixture check.

## Quick-strategy integration check

Before UI integration, the first eight verification draft pairs were selected for an additional check. Each complete team received native Quick optimization: all 64 own strategies on three native enemy presets. The best plan was then evaluated on 16 further, separately seeded strategy/role/default-order profiles. No scenario used to choose the plan was reused as the held-out profile set. Own items remain defaults; the production item search and live controls were not exercised by this experiment.

Standard won 76/128 scenarios, Creative 78/128; severe losses were 27 and 29. The 96/4 mixture modeled +0.0625 success points and +0.0625 severe-loss points, with a positive entropy change. The bounds were −0.5313 success points and +0.5313 severe-loss points. These narrowly miss the 0.5-point targets. With only two draft clusters per faction/opponent stratum, this check is underpowered; it neither proves a substantial regression nor certifies the risk ceiling.

We did not shrink the mixture again or relax the margin after seeing this result. The next release decision needs a larger, independently assessed optimized-configuration batch and then live validation. This is a promising compromise candidate, not a demonstrated PvP upgrade. Default Auto remains Standard; no new user settings, paid services or recurring jobs were added.

## Limits and reproducibility

There are 80 distinct base draft seeds across development, confirmation and verification. The Quick check reuses eight verification team pairs with a different strategy-selection/evaluation stage; it is not eight additional independent base drafts. All outcome cases are deterministic simulations with correlated scenarios, approximate hidden-opponent inputs and unavailable private-server settings. Bootstrap bounds concern the sampled simulator/test-policy population, not actual PvP win probability. Selection, exposure adjustment and the small integration sample are disclosed rather than combined into an optimistic headline rate.

Native per-action decisions stayed below about 32 ms on this Node runtime across the three base batches. Browser timing and live installed Auto behavior for a mixed personality were not tested because no integration was shipped. A manual source check on 09 October found all 50 tracked public assets unchanged. The Codex source-monitor automation remains paused.

```sh
node tests/draft-personality.cjs
node tests/draft-personality-analysis.cjs
node scripts/draft-personality-benchmark.cjs 16 2300003 draft-personality-development.json
node scripts/draft-personality-benchmark.cjs 32 9230009 draft-personality-confirmation.json standard,creative
node scripts/draft-personality-analysis.cjs docs/research/draft-personality-confirmation.json docs/research/draft-personality-analysis.json
node scripts/draft-personality-benchmark.cjs 32 18700013 draft-personality-verification.json standard,creative
node scripts/draft-personality-analysis.cjs docs/research/draft-personality-verification.json docs/research/draft-personality-verification-analysis.json .04
node scripts/draft-personality-quick-check.cjs
node scripts/draft-personality-analysis.cjs docs/research/draft-personality-quick-check.json docs/research/draft-personality-quick-analysis.json .04
```

The adjacent JSON files retain teams, roles, actions, individual test outcomes, timings, protocols and calculated bounds. The isolated [native adapter](../../scripts/draft-personality.cjs) and [analysis](../../scripts/draft-personality-analysis.cjs) provide the inspected calculation path.
