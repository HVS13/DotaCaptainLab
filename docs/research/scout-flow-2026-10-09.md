# Scout capture and information boundaries — 9 October 2026

The empty enemy strategy fields in the supplied v2.7.4 PvP report are consistent with the native flow. They do not establish that the advisor missed a visible enemy plan. A separate reproducible same-brief preservation defect was fixed in v2.7.6. No drafting, optimizer, item or native simulation formula changed, and no higher PvP win rate is claimed.

## Native flow examined

| Phase | Solo | PvP |
| --- | --- | --- |
| Pregame | After assignment, `rollSoloDoctrine` selects the enemy plan. The native briefing renders its six strategy axes. | The pregame component passes `choices:null` into the seat card. Faction/order and readiness are shown; enemy axes are omitted. The heading may still say `Scout briefing`. |
| Draft | The visible briefing/axes can inform advice. | The draft root passes `hideIntel:isPvp`. The native PvP state mapper keeps enemy strategy choices null. |
| Strategy preparation | Captured visible choices can constrain optimizer scenarios. | Native strategy controls suppress opponent intel for PvP. The opponent's locked choices remain unknown before match start. |
| Simulation / completed result | Actual enemy settings are available for recap. | The native PvP mapper reveals enemy choices only when room status is `simulating` or `complete`. Recap can then describe those choices under its scout narrative. |

This explains why a post-match `Pregame scout` passage is not proof that the six choices were visible to the advisor before a PvP draft. A generic label such as `Teamfight & Rosh` is not treated as six observed binary choices. Hidden DOM paragraphs are excluded from axis capture.

Relevant public client paths were inspected in modules `87735` (pregame `tT`/`tw`, axis cards `tg`, root draft and strategy visibility), `13177` (PvP room-to-state mapping), `14822` (Solo doctrine and phase transitions), `95142` (brief/recap derivation), and `95363`/`82636` (axis labels/options). The manual public-source check at 22:29 Jakarta on 9 October found all 50 inspected draft/Daily assets unchanged. This verifies the public client snapshot, not private-server behavior or a recording of the user's browser DOM.

## Advisor path and minimal repair

`readDraftSnapshot` reads visible native axis cards only while a visible `Scout briefing` heading exists. The native cards contain a title paragraph and a selected-option paragraph. The labels/options match the engine metadata. `decodeDraftSnapshot` already carries captured choices from briefing into drafting and completed teams; `Advisor.scenarios` fixes known choices and enumerates unknown ones.

The defect was in repeated briefing reads: each read replaced all captured choices with that read's axes. A partial or empty same-brief snapshot therefore dropped previously observed values. The regression test failed before the fix, showing five missing axes after a one-axis read. The decoder now merges previous choices only when the previous state is also a briefing. Newly observed choices still replace earlier values for that axis. The existing scanner's lobby/new-brief reset is retained.

This protects against incomplete same-brief reads; it does not prove that such a read occurred in the supplied match. In particular, that match was PvP and had no pregame enemy axes to preserve. No storage layer, inferred preset conversion, hidden-state access or additional simulation was added.

## Verification

The [regression test](../../tests/scout-capture.cjs) covers native-shaped title/option cards, all six axes, hidden cards, a generic headline without axes, genuinely partial knowledge, updating one visible axis while preserving other observed values, empty same-brief reads, briefing → draft → configuration conditioning, and new-run/PvP reset through the actual scanner function. Fully known choices yield one compatible enemy plan; one known axis yields 32 plans; an unscouted PvP state remains unknown.

The test reproduced the preservation failure before the decoder change and passed after it. It uses native-shaped fixtures and a VM replay of the scanner, not an authenticated live match. The repair is one decoder expression plus release metadata and regression coverage. Production remains Standard for drafting and configuration selection.

```sh
node scripts/build.cjs
node tests/scout-capture.cjs
node tests/advisor.cjs
node tests/optimization-deadline.cjs
```
