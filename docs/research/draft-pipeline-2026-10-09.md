# Personality test after strategy and item optimization — 9 October 2026

The proposed 96% Standard / 4% Creative per-draft mixture increased opening diversity, but did not meet the frozen success and severe-loss limits. Production Auto remains unchanged at 2.7.4, using Standard. This experiment is not bundled into the app.

## Method

The [protocol](draft-pipeline-protocol.json) was frozen before testing. Thirty-two new paired drafts cover both factions and four opponent policies: native Standard weighted selection, Standard top-ranked selection, Counter weighted selection and Creative weighted selection. Each faction/policy stratum contains four pairs. Both policies complete the native 24-turn sequence with legal picks, bans and intended own roles. Each policy stays fixed throughout its draft; the 96/4 result is a modeled expectation across these pure-policy outcomes, not a set of played mixture matches.

The harness executes the existing production overlay optimizer body with the unchanged native simulator. It screens all 64 own strategies against three native enemy presets, searches ordered item builds, and retunes strategies with the selected items. To make the work reproducible, the headless harness freezes time and limits the native item generator to 100 candidates total across its greedy passes. This is a fixed work budget, not a reproduction of the browser's live time budget, and not an exhaustive item search.

All 64 optimized teams completed their strategy screen and retuning. They examined 6,400 item candidates, including 1,600 candidates changing item identities; the remainder changed purchase order. Optimization made 43,584 native simulator calls. Actual selected strategies and ordered six-item builds are retained in the raw results and used in evaluation.

Each completed team is evaluated on 16 separately seeded enemy strategy/eligible-role/item-order profiles, giving 512 cases per pure policy. Exact training preset/default-opponent profiles are excluded. Case-specific random streams are paired, although different final enemy teams have different eligible role variants. Enemy item identities remain native role defaults; this does not model all enemy custom builds.

Uncertainty uses 10,000 paired whole-draft bootstrap resamples, stratified by faction and opponent policy. The 16 cases within a draft are not treated as independent draft samples. Severe loss means a simulated loss with signed final net worth below −20,000. This is a diagnostic threshold, not the game's official result category.

## Results

Changes below compare the modeled 96/4 mixture with Standard. Percentage points are absolute differences, not relative percentages.

| Metric | Estimated change | One-sided 95% bound | Frozen requirement | Result |
| --- | ---: | ---: | --- | --- |
| Simulator successes | −0.4453 percentage points | Lower: −0.7813 points | Lower bound ≥ −0.5 points | Fail |
| Severe losses | +0.2266 percentage points | Upper: +0.5078 points | Upper bound ≤ +0.5 points | Fail |
| First-pick entropy | +0.02215 bits | Evaluated jointly below | Nondeclining point estimate | Pass |
| First-ban entropy | +0.02794 bits | Evaluated jointly below | Nondeclining point estimate | Pass |
| Sum of opening entropies | +0.05009 bits | Lower: +0.03259 bits | Positive estimate and lower bound ≥ 0 | Pass |

Standard won 327/512 simulated cases and had 90 severe losses. Creative won 270/512 and had 119 severe losses. These are benchmark counts, not calibrated PvP win probabilities. The fractional mixture expectation is obtained by weighting the paired outcomes by 0.96 and 0.04.

The success point estimate is within the allowed 0.5-point compromise, but its uncertainty permits a larger decline. Severe-loss uncertainty also narrowly exceeds its limit. Therefore this batch cannot certify the proposed tradeoff. We did not reduce Creative exposure or loosen the limits after seeing these results. Earlier positive draft-fit results did not carry through this larger strategy/item benchmark.

## Limits and decision

Keep the current default. Opening variety improved, but there is no supported win-rate improvement or certified minimal regression here. Testing a revised policy would require a new frozen protocol and unseen seeds.

This headless experiment verifies algorithm outputs, not authenticated native controls, browser timer behavior or private server parity. It does not establish a global optimum, cover every possible opponent composition, or predict human PvP success. A manual public-source check on 9 October at 14:27 Jakarta time found all 50 checked draft/Daily assets unchanged; private server changes remain unverifiable. No scheduler or recurring AI job was created.

## Evidence and reproduction

- [Machine-readable analysis](draft-pipeline-analysis.json)
- [Merged paired results and selected payloads](draft-pipeline-results.json)
- Raw parts: [0](draft-pipeline-part-0.json), [8](draft-pipeline-part-8.json), [16](draft-pipeline-part-16.json), [24](draft-pipeline-part-24.json)
- Harness: [optimizer adapter](../../scripts/draft-pipeline.cjs), [benchmark](../../scripts/draft-pipeline-benchmark.cjs), [analysis](../../scripts/draft-pipeline-analysis.cjs)

From the repository root, run the four benchmark commands, then analysis:

```sh
node scripts/draft-pipeline-benchmark.cjs 0 8 draft-pipeline-part-0.json
node scripts/draft-pipeline-benchmark.cjs 8 8 draft-pipeline-part-8.json
node scripts/draft-pipeline-benchmark.cjs 16 8 draft-pipeline-part-16.json
node scripts/draft-pipeline-benchmark.cjs 24 8 draft-pipeline-part-24.json
node scripts/draft-pipeline-analysis.cjs
node tests/draft-pipeline.cjs
```

The regression test checks opponent policies and draft legality, exact native Quick parity with zero item budget, selected payload retention, evaluation denominators and exclusion of training profiles. The analysis additionally rejects incomplete paired batches and illegal selected builds.
