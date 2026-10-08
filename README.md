# DotaCaptain Draft Advisor

A live draft overlay rebuilt around the DotaCaptain-native assistant concept. It reads the revealed draft, ranks available heroes with native AI functions, explains counters and mapped synergies, and checks strategy configurations.

[Installation and practice board](https://hvs13.github.io/DotaCaptainLab/) | [Install userscript](https://hvs13.github.io/DotaCaptainLab/dotacaptain-advisor.user.js)

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) from its official browser-store links.
2. Open the userscript link and confirm installation in the manager. Follow browser prompts to enable userscripts if needed. If the file opens as text, create a new userscript, paste the complete file and save.
3. Open DotaCaptain and start a draft. Keep the script enabled during the scout briefing so the visible enemy strategy can be retained for the page session.
4. Read Top picks or Top bans. Find in game search fills the native search field; you still choose and confirm game actions. The panel can be minimized. Drag the header to move it; arrow keys also work (Shift for larger steps). Position is remembered locally; the reset button or Home key restores the default.

## Features

- Automatic detection of the inspected 24-turn history, paired/mirrored columns, current turn and faction.
- Visible scout capture; future picks and unreported enemy roles remain unknown.
- Native pick/ban rankings, hero search, role filtering, counter/synergy reasons and capability gaps.
- Manual correction when detection fails, plus intended own-role overrides.
- Native draft-value configuration after five own picks; strategy and ordered item-build optimization once both teams are revealed.
- A manual practice board using the same advisor panel.

The userscript bundles the native client data, has no external script dependencies, does not call account APIs and does not upload draft data. Hero portraits use public CDN URLs from the game data. Auto mode is opt-in for one match: Start Auto on a recognized live draft, and Stop Auto or Escape returns control. It selects/confirms heroes through the native AI’s weighted strong-candidate pool on your turn, waits for opponents, assigns own roles first, runs strategy and item optimization within the prep timer, applies and verifies five ordered item builds and six strategy choices, then clicks Continue and verifies the visible match-start or PvP strategy-lock acknowledgement. When your intended strategy is Auto and there are no allied picks, it varies the opening among three curated native preset plans; after allied picks appear, draft-value advice adapts to them. An explicitly selected strategy is respected for drafting. It reserves 65 seconds to apply and verify up to 30 item slots and strategy; deadline-limited results show how many configurations completed, with the current draft plan as fallback if no simulation completes. It never starts another match automatically. A manual pointer interaction in the game stops Auto. The native draft-to-strategy reveal is allowed to finish; it does not wait for the pick/ban or prep timer to expire. Missing or ambiguous controls stop it. It searches item replacements and purchase-order swaps using the native simulator, applies the best completed result found, and verifies every slot. It updates this match’s builds; saved account presets are not edited.

## Accuracy and limits

The public AI functions and simulator are retained from the inspected 06 Oct 2026 client snapshot. Recommendations use the standard captain personality without account comfort history. Auto doctrine uses mean native pickScore over your picks; this aggregation is our policy, not an official win score.

Simulation starts from native role-default item builds, evaluates catalog replacements and purchase-order swaps for up to 60 seconds and two greedy passes, then retests strategies with the selected builds. Candidates retain six distinct legal catalog items, exclude retired items and respect native upgrade normalization. This is a bounded joint search, not an exhaustive global optimum. Enemy items remain assumed role defaults because their selected builds are hidden. Unassigned roles are inferred. With a full visible scout, configuration tests use that enemy plan and your side. Partial scout choices constrain compatible enemy strategies. With no scout, Quick checks three native presets and Thorough checks all 64 enemy strategies. Your known faction is always used; both sides are checked only if unknown. Top three configurations can be compared, with scenario wins, mean and worst net-worth margins. The selected configuration is the best among fully evaluated candidates on those deterministic tests, not a real-match probability or global-optimality proof.

The DOM reader refuses unrecognized history layouts. Manual correction is available. Tests cover native score parity, simulator payload parity on both sides, normal/mirrored histories, information boundaries and completed teams. Browser checks exercise the self-contained userscript on a replay of the observed native markup, including detection recovery, native role changes and optimizer cancellation, plus the manual practice board. A userscript manager has not been installed or tested on the user's authenticated account; ranked/PvP integration remains unverified.

See [source URLs and hashes](dist/source-manifest.json) and [methodology](docs/methodology.md). This project is not affiliated with DotaCaptain or Valve.

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
