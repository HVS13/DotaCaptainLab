# DotaCaptain Draft Advisor

A live draft overlay rebuilt around the DotaCaptain-native assistant concept. It reads the revealed draft, ranks available heroes with native AI functions, explains counters and mapped synergies, and checks strategy configurations.

[Installation and practice board](https://hvs13.github.io/DotaCaptainLab/) | [Install userscript](https://hvs13.github.io/DotaCaptainLab/dotacaptain-advisor.user.js)

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) from its official browser-store links.
2. Open the userscript link and confirm installation in the manager. Follow browser prompts to enable userscripts if needed. If the file opens as text, create a new userscript, paste the complete file and save.
3. Open DotaCaptain and start a draft. Keep the script enabled during the scout briefing so the visible enemy strategy can be retained for the page session.
4. Read Top picks or Top bans. Find in game search fills the native search field; you still choose and confirm game actions. The panel minimizes to a compact shield icon. Drag the icon to move it, or click it to reopen. Drag the title area to move it; arrow keys also work (Shift for larger steps). Position is remembered locally; the reset button or Home key restores the default.

## Features

- Automatic detection of the inspected 24-turn history, paired/mirrored columns, current turn and faction.
- Visible scout capture; future picks and unreported enemy roles remain unknown.
- Native pick/ban rankings, hero search, role filtering, counter/synergy reasons and capability gaps.
- Manual correction when detection fails, plus intended own-role overrides.
- Native draft-value configuration after five own picks; strategy and ordered item-build optimization once both teams are revealed.
- A manual practice board using the same advisor panel.

The userscript bundles the native client data, has no external script dependencies, does not call account APIs and does not upload draft data. Hero portraits use public CDN URLs from the game data. Auto mode is opt-in for one match: Start Auto on a recognized live draft, and Stop Auto or Escape returns control. It selects/confirms heroes through the native AI’s weighted strong-candidate pool on your turn, waits for opponents, assigns own roles first, runs strategy and item optimization within the prep timer, applies and verifies five ordered item builds and six strategy choices, then clicks Continue and verifies the visible match-start or PvP strategy-lock acknowledgement. When your intended strategy is Auto and there are no allied picks, it varies the opening among three curated native preset plans; after allied picks appear, draft-value advice adapts to them. An explicitly selected strategy is respected for drafting. It reserves 65 seconds to apply and verify up to 30 item slots and strategy; deadline-limited results show how many configurations completed, with the current draft plan as fallback if no simulation completes. It never starts another match automatically. A manual pointer interaction in the game stops Auto. When the browser tab is hidden, Auto pauses game actions and detection until it is visible again. Temporary draft-layout gaps wait up to five seconds; persistent detection failures still stop Auto. Native game timers continue while you are away. The native draft-to-strategy reveal is allowed to finish; it does not wait for the pick/ban or prep timer to expire. Missing or ambiguous controls stop it. It searches item replacements and purchase-order swaps using the native simulator, applies the best completed result found, and verifies every slot. It updates this match’s builds; saved account presets are not edited.

## Auto Daily (2.7.0)

Update the userscript, open [Daily Challenge](https://dotacaptain.com/daily-challenge) and click **Start Auto Daily**. It clears hero filters, preserves existing picks, excludes the fixed enemy lineup, historical bans and unavailable heroes, then fills the remaining slots using the native weighted pick heuristics. Each Daily pick waits 0–1 second and must appear in your lineup before the next action. It verifies five legal heroes and clicks **Lock draft & simulate** once, then waits for the native match/result acknowledgement. Stop, Escape or manual game interaction takes control. Download Daily report exports the observed selections and submission status locally. Drag the Daily title area to move the panel; arrow keys, Home and the reset button work as in the regular advisor. Daily and regular panel positions are remembered separately.

Daily exposes hero selection only: its server assigns roles, strategy and items. This mode does not claim a best possible lineup, calibrated win probability or local/server simulation parity. Completed challenges are not restarted. Browser verification uses a local replay of the observed native controls; authenticated live Daily submission remains unverified.

## Accuracy and limits

The public AI functions and simulator are retained from the inspected 06 Oct 2026 client snapshot. Recommendations use the standard captain personality without account comfort history. Auto doctrine uses mean native pickScore over your picks; this aggregation is our policy, not an official win score.

Simulation starts from native role-default item builds, evaluates catalog replacements and purchase-order swaps for up to 60 seconds and two greedy passes, then retests strategies with the selected builds. Candidates retain six distinct legal catalog items, exclude retired items and respect native upgrade normalization. This is a bounded joint search, not an exhaustive global optimum. Enemy items remain assumed role defaults because their selected builds are hidden. Unassigned roles are inferred. With a full visible scout, configuration tests use that enemy plan and your side. Partial scout choices constrain compatible enemy strategies. With no scout, Quick checks three native presets and Thorough checks all 64 enemy strategies. Your known faction is always used; both sides are checked only if unknown. Top three configurations can be compared, with scenario wins, mean and worst net-worth margins. The selected configuration is the best among fully evaluated candidates on those deterministic tests, not a real-match probability or global-optimality proof.

The DOM reader refuses unrecognized history layouts. Manual correction is available. Tests cover native score parity, simulator payload parity on both sides, normal/mirrored histories, information boundaries and completed teams. Browser checks exercise the self-contained userscript on a replay of the observed native markup, including detection recovery, native role changes and optimizer cancellation, plus the manual practice board. A userscript manager has not been installed or tested on the user's authenticated account; ranked/PvP integration remains unverified.

See [source URLs and hashes](dist/source-manifest.json) and [methodology](docs/methodology.md). This project is not affiliated with DotaCaptain or Valve.

## Public-source freshness

Run `node scripts/check-source-freshness.cjs` to compare the live draft and Daily public asset lists and SHA-256 hashes with the reviewed baseline. Exit status is 0 for unchanged, 1 for changed, and 2 for an unavailable check. `--output path.json` saves the result. The check never updates or executes downloaded source. Changed bundles require review before replacing native data/formulas or accepting a new baseline; a deployment can change presentation without changing formulas. [Latest published source check](https://hvs13.github.io/DotaCaptainLab/source-freshness.json) is a timestamped check, not a real-time guarantee. Private server changes remain unverifiable. Installed userscripts need updating after a new release.

## Development

No package installation is needed. With Node.js 18+:

```sh
node scripts/build.cjs
node tests/advisor.cjs
python -m http.server 8765
```

Open `/dist/` for installation and practice; `/tests/native-fixture.html` replays native markup with automatic detection enabled.

Editable sources live in `rebuild/`. The build copies them into `dist/` and emits the self-contained userscript. `dist/engine.js` is the unchanged native snapshot. Pushes to `main` build, verify and publish through GitHub Pages.

## Auto mode verification

The native-control replay exercises hero selection, confirmation, opponent turns, all 24 CM actions, own-role assignment, six sequential strategy options and Continue. Authenticated live Auto operation remains unverified. The userscript uses visible DOM controls, not private store methods or account APIs.

## Research and experimental coverage (2.6.0)

[Bounded drafting lookahead experiment](docs/research/draft-lookahead-2026-10-09.md): eight paired draft tests did not support replacing Auto. The prototype regressed on held-out outcomes and did not improve opening diversity; production drafting remains unchanged. The isolated policy and benchmark are available for reproducible future comparisons.

[Pick-only flexibility experiment](docs/research/draft-flexibility-2026-10-09.md): sixteen paired drafts tested near-score picks and resilience to losing a strong follow-up. Confirmation improved slightly, but combined performance regressed and overall opening diversity tied. This research policy is not included in Auto.

[Native personality experiment](docs/research/draft-personality-2026-10-09.md): a modeled 96% Standard / 4% Creative mixture passed draft-fit verification margins, but a small Quick-strategy check remained too uncertain to certify the same margins. This is a promising compromise candidate, not an enabled default or proven PvP win-rate improvement.

[Personality test with strategy and item optimization](docs/research/draft-pipeline-2026-10-09.md): the larger 32-pair test increased opening diversity but failed the frozen regression limits. The modeled 4% Creative mixture reduced simulator successes by 0.445 percentage points, with a lower uncertainty bound of −0.781 points. Auto retains Standard as its default.

[Context-dependent variation experiment](docs/research/draft-context-2026-10-09.md): 32 new paired drafts with strategy/item optimization increased simulated successes by 5.859 points and reduced severe losses by 4.102 points. Opening diversity declined, and uncertainty failed the unchanged regression limits. This full-policy experiment remains isolated; Auto retains its current default.

[Strict override experiment](docs/research/draft-override-2026-10-09.md): 64 new paired drafts tested retaining native selection unless four response models consistently favored an alternative. Only five actions changed, but simulated successes fell by 0.781 points, severe losses rose by 0.488 points and first-pick diversity declined slightly. The policy failed the frozen limits and remains excluded from Auto.

[Forecast-role consistency experiment](docs/research/draft-inference-2026-10-09.md): replays identified a mismatch between hypothetical enemy role locks at forecast leaves and inferred roles in the final optimizer. The isolated correction gained 0.586 points in simulated successes and reduced severe losses by 1.270 points on 64 fresh paired drafts. Performance limits passed, but opening diversity declined slightly. The combined acceptance rule failed; production Auto remains unchanged.

[Mirror coverage and provisional role pilot](docs/research/mirror-provisional-2026-10-09.md): sixteen fresh paired drafts tested each candidate separately. Mirror coverage reduced simulator successes by 7.031 points; provisional role inference reduced them by 6.250 points and increased severe losses. Both remain excluded from Auto. Version 2.7.5 separately fixes Continue acknowledgement for the native `Live match` header, including untransformed text fallback; selection defaults are unchanged.

[Downside-aware tie-breaker pilot](docs/research/downside-2026-10-09.md): sixteen fresh paired drafts tested wins-first, worst-gold-before-average selection with unchanged scenario coverage and work budget. Severe losses fell from 60 to 58, but simulated wins fell from 146 to 137 out of 256 profiles. The frozen regression limits failed; Standard remains unchanged.

[Paper/source research and reproducible benchmarks](docs/research/2026-10-09.md) examine future-draft search, selection overfitting, calibration and native simulation inputs. An optional **Experimental · cross-check finalists** mode rechecks the top three Quick plans against all 64 enemy strategies, using matching coverage for subsequent item candidates. Initial tests improved, but a separate confirmation batch regressed; Auto and default Quick therefore retain their existing selection policy. Extra scenario coverage is not proven to improve PvP win rate. Interrupted cross-checks retain the completed preset results and identify the limited coverage. Native calls that finish after the optimization deadline cannot replace the completed result.
