# Mirror coverage and provisional roles — 9 October 2026

This is a bounded 16-pair diagnostic pilot, not a production certification. It tests the two candidates separately against Standard, with fresh drafts, both factions and four opponent styles. The [protocol](mirror-provisional-protocol.json) was saved before outcome testing. Production selection defaults remain unchanged; v2.7.5 independently fixes live-header acknowledgement.

## Completed results

Reject both tested candidates as default replacements. All 16 planned paired drafts completed, with 256 final evaluation profiles per policy. Standard won 142 and had 54 severe losses; mirror coverage won 124 with 56 severe losses; provisional roles won 126 with 77 severe losses. These are deterministic simulator outcomes, not measured PvP win rates.

| Metric | Mirror minus Standard | Provisional minus Standard |
| --- | ---: | ---: |
| Simulator success change | −7.0313 percentage points | −6.2500 points |
| Success lower one-sided 95% bound | −15.2344 points | −14.0625 points |
| Severe-loss change | +0.7813 points | +8.9844 points |
| Severe-loss upper one-sided 95% bound | +5.0781 points | +13.2813 points |
| First-pick / first-ban entropy change | 0 / 0 bits | 0 / 0 bits |

Both failed the 0.5-point performance margins. Provisional roles also failed the required increase in opening diversity; first openings are unchanged by design, so this implementation cannot by itself meet that objective. Mirror is a configuration experiment, not an opening-diversity policy.

The provisional pilot changed two previously selected heroes' roles and reassigned eleven newly selected heroes away from the role just chosen by native drafting. The original benchmark counter counted only previously selected heroes. An observational trace was added afterward to separate these categories; replay checks matched all saved final own teams, enemy teams and roles. This changed measurement only, not the policy, seeds, thresholds or evaluated configurations. Dropping Auto intentions can discard the role context that motivated the pick. That is a plausible mechanism, not an isolated causal conclusion from this pilot.

Adding the mirror during every candidate evaluation does more than expose a missing risk: it changes the optimization objective and can move risk to other enemy plans. The latest-match diagnostic established a coverage gap; it did not establish that equally weighting a mirror during selection improves general outcomes. This pilot did not support that rule. Keep the current optimizer, item selection and draft policy; do not run a larger confirmation or tune these candidates on this batch.

JavaScript validation checks completeness, frozen seeds/strata, outcome totals, native-eligible unique roles, legal selected builds, training-case exclusions, mirror draft parity and exact reuse payloads. Independent Python recomputation checks totals, point changes, paired mirror profile equality, entropy equality and both role-event counts. Unit tests cover per-candidate mirror evaluation with matching items and restored adapters, deterministic legal provisional drafts and explicit role locks, and live-header acknowledgement without duplicate Continue clicks.

## What changes

**Mirror coverage:** the existing strategy/item optimizer evaluates each own candidate against the three native presets plus an enemy using that candidate's same six choices. Every candidate receives four equally weighted slots, including when the mirror repeats a preset. That deliberately increased weight is an experimental assumption, not a native formula. The mirror follows the current own candidate during the initial strategy screen, item search and strategy retuning. No future-draft search is added.

**Provisional roles:** before own actions and after own picks, the native role resolver recomputes the team's intended assignments without hard-locking earlier Auto intentions. Explicit user locks are preserved. Native scores, random streams, opening presets and opponent behavior are unchanged. The final team has five unique, native-eligible roles. This candidate can adapt after picks arrive; it does not introduce new first-pick/ban randomness. Its unit test covers preserving an explicit role while changing a conflicting provisional assignment.

The earlier flexibility experiment counted viable follow-ups but did not reconsider already assigned own roles. This tests that narrower distinction. The native resolver chooses assignments; this is not an exhaustive search over role permutations or a learned professional drafting model.

## Evaluation

Each final team uses the production optimizer body with frozen time and 100 item candidates. Standard and provisional use its three presets; mirror adds the fourth slot. Sixteen separately seeded enemy strategy/eligible-role/default-item-order profiles evaluate each output. Default-role/default-item cases for the presets and either selected baseline/mirror strategy are excluded, with a common plan exclusion union for paired streams. Enemy custom item identities remain unmodeled. The evaluation population is conditional on that exclusion union, not all PvP opponents.

Unchanged provisional final states may reuse deterministic baseline optimization, explicitly marked. Mirror always runs its own optimization. Execution and role-reassignment counts are recorded. Each faction/opponent stratum has only two draft pairs, so uncertainty estimates are limited. The 10,000 stratified paired whole-draft bootstrap treats drafts, not the 16 profiles inside each draft, as sampling units. Success and severe-loss uncertainty limits remain 0.5 percentage points; provisional also retains the opening-diversity requirement. Pilot results alone do not authorize production selection changes.

The uploaded latest loss motivated mirror coverage but is excluded from this pilot. The previous diagnostic reproduced its 51.5k deficit, 77:40 finish, several KDA values and sampled opening events using an omitted mirror strategy. That inferred enemy setup is not a directly observed or proven unique input. Expanding coverage need not improve optimizer selection, which is why this pilot compares final outputs on separate profiles.

The manual public source check at 21:42 Jakarta on 9 October found all 50 inspected assets unchanged. Private-server parity cannot be checked by that method.

## Independent production fix

The native live header is `Live match`, with an uppercase CSS class. The old detector required `LIVE MATCH`; it now matches case-insensitively, including the untransformed `textContent` fallback. Hidden headers and the advisor's own content remain excluded. Regression tests cover an Auto finish tick acknowledging this header after Continue without submitting twice. This fixes a supported mismatch, not every possible Continue timeout. The actual uploaded browser DOM and authenticated live operation remain unavailable for verification.

## Reproduction

- [Mirror adapter](../../scripts/draft-mirror.cjs), [provisional role policy](../../scripts/draft-provisional.cjs)
- [Benchmark](../../scripts/mirror-provisional-benchmark.cjs), [analysis](../../scripts/mirror-provisional-analysis.cjs)
- [Protocol](mirror-provisional-protocol.json), [source check](mirror-provisional-source-check.json)
- [Analysis](mirror-provisional-analysis.json), [merged records and role traces](mirror-provisional-results.json)
- Raw parts: [0](mirror-provisional-part-0.json), [4](mirror-provisional-part-4.json), [8](mirror-provisional-part-8.json), [12](mirror-provisional-part-12.json)

```sh
node tests/draft-mirror.cjs
node tests/draft-provisional.cjs
node tests/game-controls.cjs
node scripts/mirror-provisional-benchmark.cjs 0 4
node scripts/mirror-provisional-benchmark.cjs 4 4
node scripts/mirror-provisional-benchmark.cjs 8 4
node scripts/mirror-provisional-benchmark.cjs 12 4
node scripts/mirror-provisional-analysis.cjs
```
