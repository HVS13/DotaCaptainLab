# Hidden opponent roles/orders: bounded offline experiment

The expanded strategy solver is mathematically verified for four modeled opponent setups. It improves protection against their strongest responses, but a full switch worsens uniform-opponent averages. Production Auto remains v2.7.7. This experiment is not enabled in the calculator/userscript and does not establish higher real PvP wins.

## Frozen scope

Reuse the [latest-match fixture](strategy-game-fixture.json), keeping our heroes, roles, ordered items, faction and hero order fixed. Before generating outcomes, select:

1. Reference inferred enemy roles and native role-default builds.
2. Puck offlane / Timbersaw mid, a native-eligible role swap, with corresponding native role-default builds.
3. Reference roles with Faceless Void's first two default purchases reversed.
4. Both changes together.

This extends the two previously recorded sensitivity checks and includes their interaction. It is a targeted uncertainty set, not all enemy role assignments, custom items or all purchase orders. Selection responds to previous sensitivity findings; these are not independent holdout PvP matches. No arbitrary opponent prevalence weights are estimated.

Each variant has all 64 enemy strategies; all 64 own strategies are available. The complete game has 64 × 256 = 16,384 cells. The original 4,096 reference cells are reused after engine/plan checks; 12,288 new unchanged-native-engine calls run in four Node processes. Winner, signed final net worth and final minute are retained. No simulated seeds are patched. Enemy settings remain unobserved assumptions.

## Verified solution and trade-offs

The expanded game optimum is exactly **82729/119576 ≈ 0.691853**, mixing 23 own strategies. Independent Python rational arithmetic reconstructs valid row/column distributions and verifies equal exact bounds against every response. The raw floating-point certificate gap is approximately 3.82e-13. Every pure own strategy still has a losing response.

The previous reference mixture has expanded worst-response utility **5/12 ≈ 0.416667**. Switching fully to the new mixture raises this modeled minimum by approximately 27.52 percentage points. It sacrifices some previously better cases:

| Enemy setup | Previous minimum | New minimum | Previous uniform mean | New uniform mean |
|---|---:|---:|---:|---:|
| Reference | 0.770833 | 0.691853 | 0.891602 | 0.841412 |
| Role swap | 0.416667 | 0.691853 | 0.803711 | 0.801400 |
| Purchase-order swap | 0.687500 | 0.691853 | 0.891276 | 0.835211 |
| Both | 0.416667 | 0.691853 | 0.803385 | 0.801390 |

Compared with the previous mixture, 101 enemy columns improve and 153 worsen; two are unchanged within 1e-8. The largest pointwise utility loss is approximately 0.26648. These are mixed-policy expectations against fixed modeled opponents, not observed match frequencies.

Severe loss is a modeled defeat with signed final net worth below −20,000, consistent with earlier experiments. The maximum severe-loss utility over the expanded set falls from approximately 0.41667 to 0.28290. However, the per-variant *uniform mean* severe-loss utility rises: reference 0.06901 → 0.09072; role swap 0.11686 → 0.14246; order swap 0.06771 → 0.09333; both 0.11328 → 0.14083. Optimizing the worst win response does not guarantee improvement in average severe defeats.

## Smaller feasible compromise

Using the completed table without more native calls, interpolate between the previous reference mixture and the expanded minimax mixture. Limit each variant's uniform mean win decrease and uniform mean severe-loss increase to **0.005**, or 0.5 percentage points. This reuses the earlier tolerance as a modeling guardrail; it is not the earlier independent bootstrap acceptance test or evidence of actual PvP non-regression.

The largest feasible step on this mixture segment uses **8.91817%** of the new distribution and **91.08183%** of the previous distribution. Exact rational arithmetic verifies all four win and severe-loss constraints. Its expanded lower utility is exactly **170374457/386154300 ≈ 0.441208**, versus 0.416667 previously: a modeled worst-response improvement of approximately **2.45416 percentage points**. Maximum per-variant uniform win reduction is 0.5 points; maximum uniform severe-loss increase is approximately 0.24565 points. Some individual matchups still worsen.

This is a feasible compromise along one mixture segment, not the optimal policy across all distributions subject to these constraints. The comparison is against the previous *offline mixture*, not the current production Auto selection policy. Its assumptions do not establish any opponent-population probabilities. Randomly sample the actual strategy privately; using the highest-weight strategy deterministically discards mixed-policy protection. The opponent must lock without observing the sampled settings.

## Cost and deployment decision

Generating only the 12,288 new cells took **196.828 seconds**, including four-process startup; the reference block was already cached. Solving the complete expanded table took **94.997 ms**. This is not a cold 16,384-cell browser benchmark. It exceeds the existing 90-second Auto optimization budget before item search and application/confirmation. No browser worker/CSP or live preparation integration is claimed.

Consequently, neither full replacement nor the smaller mixture is enabled by default. The result identifies a verified improvement to a *conditional worst-response objective* and a quantifiable compromise, while also identifying a concrete live-runtime blocker. A browser performance/integration stage is deferred because this expanded complete-table approach is not yet affordable within the production budget. No additional scheduler, paid service or dependency is introduced.

The manual source check at **18:38 Jakarta, 10 October 2026** found all 50 inspected public draft/Daily assets unchanged. Private-server parity remains unverified.

## Reproduce and inspect

- [Complete expanded table and solution](strategy-game-robust.json)
- [Independent certificate, risks and bounded mixture](strategy-game-robust-certificate.json)
- [713 direct native payload replay checks](strategy-game-robust-replay.json): baseline/support/worst-response samples matched winner, gold and minute; not an independent replay of all cells.
- [Source check](strategy-game-robust-source-check.json)
- [Generator](../../scripts/strategy-game-robust.cjs), [independent verifier](../../scripts/strategy-game-robust-verify.py), [sampled direct replay](../../scripts/strategy-game-robust-replay.cjs)

The reference block exactly matches the preceding matrix, and the unchanged-policy results exactly reproduce both preceding sensitivity checks within 1e-8. CI validates the independent certificate and sampled direct replays; it does not regenerate the full table or claim CI timing as live browser timing.

```sh
node tests/strategy-game.cjs
node scripts/strategy-game-robust.cjs
python scripts/strategy-game-robust-verify.py
node scripts/strategy-game-robust-replay.cjs
```
