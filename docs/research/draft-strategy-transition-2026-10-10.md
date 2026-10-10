# Draft-to-strategy Auto transition — 10 October 2026

Version 2.7.7 fixes two reproducible paths that can stop Auto during the native draft-complete reveal. The reported occurrence has no new stop message or report attached yet, so these findings do not establish its exact cause. Draft selection, strategy/item optimization and random opening behavior remain unchanged.

## Source and failure

The native public reveal component (module `95299`) renders `Draft complete` and `Opening strategy…` in elements with uppercase CSS classes. Reading their `innerText` can therefore produce `DRAFT COMPLETE` and `OPENING STRATEGY…`. The old `prepStatus` required mixed-case matches and returned null for that visible reveal. The scanner could then treat the normal transition as a missing layout and stop after its five-second detection limit. Module `87735` holds the native reveal for five seconds before showing strategy controls, making the timing relevant.

A second path involved a layout-gap timer started immediately before a recognized reveal. The scanner paused for the reveal but did not clear that earlier timer. A brief layout gap after the reveal could therefore inherit time spent in a legitimate phase and stop immediately rather than receive its existing grace period.

## Minimal repair

- Match native opening, pending and waiting/locked phase text case-insensitively, as already done for the live-match header.
- Clear the layout-gap timer when the scanner or Auto action loop recognizes the opening reveal.
- Preserve existing suspension of actions during the reveal and hidden tabs, and the existing stop for a genuinely persistent missing layout.

The repair adds no generic retries or longer timeout. It does not submit picks or attempt role controls during the reveal. The public-source check at 15:38 Jakarta on 10 October found all 50 inspected draft/Daily assets unchanged; private-server state remains unverified.

## Verification

The [transition regression](../../tests/draft-strategy-transition.cjs) failed before the change because the uppercase reveal was not recognized. After the change it covers a prior layout gap, a reveal lasting beyond five seconds, hidden/resumed ticks, a short post-reveal gap, detection of the final enemy pick, entry into role assignment and the first role application. A separate persistent unknown layout still stops Auto. Existing control tests cover uppercase waiting/pending status and the subsequent six strategy choices and Continue acknowledgement.

These are VM/control-fixture tests of the actual scanner and Auto functions, not an authenticated live match or proof against every possible stop reason. If a different stop message recurs, the latest downloaded Auto report is needed to identify that branch.

```sh
node scripts/build.cjs
node tests/draft-strategy-transition.cjs
node tests/game-controls.cjs
node tests/optimization-deadline.cjs
```

The separate win-rate experiments still have not justified replacing Standard. This release improves transition reliability; it is not a demonstrated increase in drafting success or PvP win probability.
