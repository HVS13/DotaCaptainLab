# Pick-only draft flexibility test — 09 October 2026

**Decision: do not replace current Auto.** The confirmation batch improved average scenario wins slightly, but the combined result regressed, some drafts worsened, and opening diversity did not improve across the two batches. Production drafting, ban selection and v2.7.4 remain unchanged.

## Tested policy

Use the existing native candidate shortlist. Consider only picks within one native point of its strongest candidate. If the already sampled baseline pick is outside this band, preserve it. Bans and the final own pick always retain the native policy.

For each candidate, keep existing own role locks and assign the candidate its native intended role. For each remaining role, count available follow-ups within one native point of the best role candidate, then remove its strongest follow-up. Flexibility value is the smallest surviving role count plus the mean surviving count. If values tie, retain the baseline. Otherwise tilt native-temperature sampling weights by a factor between 1 and 2 using normalized flexibility. Both policies share the same per-turn random draw. Score thresholds and the weighting factor are experimental policy choices, not official game formulas or probabilities.

This checks fallback availability under the loss of a preferred follow-up; it does not search future opponent replies or enumerate all complete team assignments. A hero can appear in several role-option sets, so their sum is not a count of distinct legal compositions. Team capability coverage and coherent complete-team outcomes are evaluated only indirectly by native candidate scores and the final simulator. Native heuristics already include composition, role, strategy, timing and counter components. This candidate adds no independently validated professional-drafting model.

The first coarse diagnostic used a six-point follow-up band and capped each role's alternatives at three. It produced equal values and zero changed picks in all eight drafts (59/128 wins for both policies). That diagnostic is retained in [its raw file](draft-flexibility-coarse-diagnostic.json). The follow-up metric was refined once during development to the uncapped one-point count above, then frozen before confirmation. No confirmation outcomes were used to tune it.

## Evaluation

Sixteen paired complete drafts cover both factions and both weighted-native and top-ranked greedy opponents. Development starts at seed 71001; confirmation starts at 971003; both use a stride of 104729. The initial plan and per-turn random streams match within each pair. Bans use the same policy, but later actual ban choices can differ as changed picks change the draft.

Each completed draft receives 16 separately seeded held-out opponent strategy, eligible-role-swap and default purchase-order profiles, using the same generation stream within each pair. Final teams and legal variant sets can differ. Own strategy is the native draft-fit plan; own items are role defaults. This isolates a pick-policy experiment, not the full production configuration/item optimization flow. The game simulator's deterministic internal seed is unchanged. Hidden opponent roles, strategies and openings are not available to candidate selection; a regression test verifies that changing those fields does not change its assessment.

| Batch | Current Auto | Flexibility candidate | Improved / worse / tied drafts |
| --- | ---: | ---: | --- |
| Development, eight drafts | 59/128 | 50/128 | 1 / 2 / 5 |
| Confirmation, eight drafts | 60/128 | 63/128 | 4 / 2 / 2 |
| Combined | 119/256 | 113/256 | 5 / 4 / 7 |

Opening variety: development had four distinct first picks for baseline versus five for the candidate; confirmation had five for both; combined had seven for both. Both policies produced 16 distinct unordered own teams. These small-sample counts do not estimate long-run opening probabilities or demonstrate a diversity gain. No forced cross-match nonrepeat rule is used.

Worst held-out gold margin in development: baseline −58.9k, candidate −52.3k. Confirmation: baseline −54.0k, candidate −74.9k. These are extrema of different resulting teams/scenarios, not matched exact game inputs. The candidate changed 11 of 80 own picks; the slowest observed decision was approximately 174 ms in this Node runtime. Browser/live timer performance was not verified because the candidate was rejected before UI integration.

## Conclusion and limits

More similarly scored follow-up heroes is not sufficient evidence of a stronger eventual team. This experiment did not meet the requested combination of greater variety and no detected performance decline. It is retained as an isolated research policy and never bundled into the userscript.

The 256 outcomes are related deterministic scenarios within 16 drafts, not 256 independent PvP matches. A small positive confirmation aggregate does not erase the development decline, per-draft regressions or larger adverse confirmation margin. No statistical noninferiority, actual PvP win-rate improvement or equivalence to a professional captain is claimed. This does not establish that every flexibility policy will fail or that current Auto is optimal.

Manual source check at 13:57 Jakarta on 09 October: all 50 tracked public assets remained unchanged. No recurring Codex automation was enabled; the source monitor remains paused per the user's preference.

## Reproduce

```sh
node tests/draft-flexibility.cjs
node scripts/draft-flexibility-benchmark.cjs 8 71001 draft-flexibility-development.json
node scripts/draft-flexibility-benchmark.cjs 8 971003 draft-flexibility-confirmation.json
```

Inspect [development](draft-flexibility-development.json), [confirmation](draft-flexibility-confirmation.json) and the isolated [candidate policy](../../scripts/draft-flexibility.cjs). Regression checks cover legality, unchanged ban policy/final pick, near-score eligibility, strongest-follow-up removal, empty roles, deterministic selection, unchanged input state and hidden-opponent independence.
