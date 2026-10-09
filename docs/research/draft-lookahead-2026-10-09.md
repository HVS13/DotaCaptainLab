# Bounded drafting lookahead experiment — 09 October 2026

**Decision: reject this prototype as an Auto replacement.** The current v2.7.4 drafting policy is unchanged. This experiment tests one small rollout policy; it does not establish that all lookahead methods are inferior or that current Auto is optimal.

## Candidate and information boundary

At each own pick or ban, retain the current native weighted choice and consider up to two highest-ranked alternatives from its native candidate pool. Complete two hypothetical native draft continuations per candidate, using identical per-turn random streams across candidates. Evaluate each completed lineup against Early Aggro, Late Scale and Teamfight/Roshan, giving six training cases per candidate. Replace the existing choice only if training wins increase and the worst training gold margin does not decline. Otherwise preserve the sampled native choice.

The predictor uses revealed picks/bans and own role locks. It does not read the test opponent's hidden role assignments or opening: opponent roles are inferred from revealed heroes, and the two hypothetical openings are Early Aggro and Late Scale. A regression test changes those hidden fields and verifies identical candidate scores and recommendations. Predicted later picks follow the native weighted policy; this is a small rollout reranker, not MCTS or a learned professional captain.

An initial harness inspection found hidden-opponent inputs leaking into continuations. Those exploratory results were discarded. Both recorded batches below were rerun after correcting this information boundary; the policy was not tuned on confirmation outcomes.

## Paired evaluation

Generate complete legal 24-turn drafts, alternating the tested faction and testing both native weighted and top-ranked greedy opponents. Baseline and candidate receive the same opening draws and per-turn random streams. Opponent responses adapt to the resulting draft, so final enemy lineups can differ. These are paired random streams, not identical fixed enemy teams.

Each completed draft is evaluated on 16 separately seeded profiles: one of the 64 binary enemy strategies, plus an inferred-role/default-build profile, a native-eligible enemy role swap or a default purchase-order swap. Both policies use the same profile-generation random stream; valid variant sets depend on the resulting lineup. These cases are excluded from move selection. Own strategy uses the native draft-fit plan, and own items are role defaults. This isolates drafting research; it does **not** benchmark the full production strategy/item optimizer. The native simulator and its deterministic internal seed are unchanged.

## Results

| Batch | Current policy | Lookahead | Improved drafts | Worse drafts |
| --- | ---: | ---: | ---: | ---: |
| Development: seeds 8101–8104 | 33/64 | 24/64 | 1 | 3 |
| Confirmation: 48101, 152830, 257559, 362288 | 31/64 | 30/64 | 2 | 2 |
| Combined | 64/128 | 54/128 | 3 | 5 |

Opening variety across these eight paired drafts: current policy produced six distinct first bans and six distinct first picks; candidate produced five distinct first bans and six distinct first picks. Both produced eight distinct unordered own compositions. This small sample does not estimate opening frequencies or prove population-wide diversity. Sequential development seeds give correlated early random draws; confirmation uses widely spaced seeds. The aggregate is not an unbiased PvP population sample.

The prototype overrode its local native choice 28 times across eight drafts. Its slowest measured decision was about 2.72 seconds on this Node runtime. No browser-timer performance guarantee follows from that measurement.

## Interpretation and limits

Even requiring better training wins and a nonworse training worst case did not protect held-out results. Two modeled continuations and three strategy presets are insufficient evidence that a replacement is safer. This result supports rejecting **this implementation**, rather than increasing its randomness or enabling it as an apparently improved default.

The 128 outcomes are related deterministic scenarios within eight drafts, not 128 independent played matches. Roles, items, execution and private server settings remain imperfectly represented. No real PvP win-rate increase, statistical noninferiority or resemblance to professional captains is claimed. Existing user match recaps were not used to choose candidates or tune this prototype.

## Reproduce and inspect

```sh
node tests/draft-lookahead.cjs
node scripts/draft-lookahead-benchmark.cjs 4 8101 draft-lookahead-development.json
node scripts/draft-lookahead-benchmark.cjs 4 48101 draft-lookahead-confirmation.json 104729
```

Raw paired draft actions, final lineups, summaries, local override counts and decision timings are in [development results](draft-lookahead-development.json) and [confirmation results](draft-lookahead-confirmation.json). The isolated [research policy](../../scripts/draft-lookahead.cjs) is not included in the userscript build. Regression checks cover deterministic legal drafts, native-shortlist restrictions, equal training denominators, the replacement criterion, immutable inputs and hidden-information independence.

This follows the future-draft motivation of [The Art of Drafting](https://arxiv.org/abs/1806.10130) while using DotaCaptain's native simulator rather than importing a real-Dota outcome model. A later candidate needs a better validated continuation/value model, broader held-out draft populations and a live timing check before production use.
