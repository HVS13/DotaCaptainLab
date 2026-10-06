# Calculation and detection

Hero rankings use public module 16286's native AI decision function with revealed picks, bans, own ban history, intended roles and strategy, current CM turn/sequence, and a standard captain personality. Confirmed picks and bans are excluded. Scores are ordered deterministically; the native random selection is not an opponent forecast.

Role inference uses the native role helper. Counter and synergy explanations come from native mapped relationships, whose timing and item conditions still matter. Capability coverage comes from the native capability function; zero coverage is reported for current allied picks.

Auto doctrine checks all 64 binary plans against mean native pickScore over current own picks. This aggregation is an advisor policy, not an official win score. Completed-match configuration tests call original simulator 90218.G, with role-default item preset 5092.z8 in source order. Known faction always fixes the simulated side. A full visible scout fixes one enemy strategy. A partial scout constrains all compatible binary strategies. Without a scout, Quick checks three native presets, while Thorough checks all 64 binary enemy strategies; both sides are tested only when the side is unknown. Plans are ordered by wins, then mean net-worth advantage. These deterministic scenarios are not real win probabilities.

# Visible information

The userscript reads rendered DOM, not React stores, hidden future lineups, private APIs or account state. Scout axes are retained only after a visible briefing. Enemy roles remain unknown unless visibly labelled; simulation inference is an assumption. The history column mapping comes from DraftPage's t0 layout and is validated against all 24 turn numbers. Completed teams are read from the visible preparation header. Unknown layouts require manual correction.

# Verification

Checks cover paired/mirrored action histories, invalid-layout rejection, revealed-information boundaries, hero exclusions, role constraints, native score parity, all 64 fit choices, completed teams and original-simulator payload parity on both sides. Browser checks cover the manual preview and an automatic replay of the inspected native DOM structure. Userscript-manager installation and authenticated ranked/PvP integration have not been verified.

# Official learning library

Reviewed the visible [learning library](https://dotacaptain.com/learn) and its [captain playbook](https://dotacaptain.com/guide), v1.3 updated July 27, 2026. They describe roles before tags, the real visible solo scout, contextual named counters, six strategy axes, and item order as timing. The advisor uses native role, counter, synergy, capability and simulation functions for these mechanics rather than adding independent manual weights. Match outcomes include random event decisions; repeatable client scenarios are not empirical win probabilities. The live captain playbook reads events and does not control the match; this advisor likewise does not submit match actions.

Selecting a pick-role filter recalculates candidates with native pickScore for that requested open role, using native role eligibility. The unfiltered list retains native next-turn role priority.

Additional audit checks cover every CM prefix on both opening orders and factions (96 cases), skipped bans, all remaining-role filters, ban explanation direction, the self-contained userscript bundle, layout loss/recovery, native role changes, cancellation and invalidation of running configuration searches. DOM detection considers rendered elements and responds to relevant attribute changes.

Configuration results show the three highest plans, ordered by scenario wins then mean net-worth advantage. Worst observed net-worth is also displayed, without changing ranking weights. Native coherence and warning messages are taken directly from the fit function; mean draft value is not labelled as the game fit meter. Thorough covers strategy choices for fixed teams, inferred/visible roles and default items, not all hero compositions, role permutations, builds, seeds, or a probability-weighted opponent distribution.

Product references: [Overwolf DotaPlus](https://go.overwolf.com/dotaplus/) documents live counter/synergy hero suggestions and bans; [Valve Dota Plus](https://www.dota2.com/plus) documents lineup/lane-aware advice and alternative build sequences. We adapt contextual recommendations and comparable alternatives, not their real-Dota statistics or win probabilities. Full binary-strategy coverage is an optional DotaCaptain-specific response to limited preset coverage, rather than a claimed feature of those products.

Release verification: quick mode completed all 64 own plans on three enemy presets at the known faction; its top-three selector and native coherence/warnings refreshed correctly. Thorough mode was exercised through 32 own plans × 64 enemy plans (2,048 completed simulations), then stopped; this was a scoped check rather than a completed 4,096-simulation run. Browser checks also exercised Thorough cancellation and the scout-fixed path.
