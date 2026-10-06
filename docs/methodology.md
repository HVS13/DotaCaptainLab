# Calculation and detection

Hero rankings use public module 16286's native AI decision function with revealed picks, bans, own ban history, intended roles and strategy, current CM turn/sequence, and a standard captain personality. Confirmed picks and bans are excluded. Scores are ordered deterministically; the native random selection is not an opponent forecast.

Role inference uses the native role helper. Counter and synergy explanations come from native mapped relationships, whose timing and item conditions still matter. Capability coverage comes from the native capability function; zero coverage is reported for current allied picks.

Auto doctrine checks all 64 binary plans against mean native fit over current own picks. This aggregation is an advisor policy, not an official win score. Completed-match configuration tests call original simulator 90218.G, with role-default item preset 5092.z8 in source order. A full visible scout and known side define one supplied matchup; otherwise three native enemy presets are tested on both sides. Plans are ordered by wins, then mean net-worth advantage. These deterministic scenarios are not real win probabilities.

# Visible information

The userscript reads rendered DOM, not React stores, hidden future lineups, private APIs or account state. Scout axes are retained only after a visible briefing. Enemy roles remain unknown unless visibly labelled; simulation inference is an assumption. The history column mapping comes from DraftPage's t0 layout and is validated against all 24 turn numbers. Completed teams are read from the visible preparation header. Unknown layouts require manual correction.

# Verification

Checks cover paired/mirrored action histories, invalid-layout rejection, revealed-information boundaries, hero exclusions, role constraints, native score parity, all 64 fit choices, completed teams and original-simulator payload parity on both sides. Browser checks cover the manual preview and an automatic replay of the inspected native DOM structure. Userscript-manager installation and authenticated ranked/PvP integration have not been verified.

# Official learning library

Reviewed the visible [learning library](https://dotacaptain.com/learn) and its [captain playbook](https://dotacaptain.com/guide), v1.3 updated July 27, 2026. They describe roles before tags, the real visible solo scout, contextual named counters, six strategy axes, and item order as timing. The advisor uses native role, counter, synergy, capability and simulation functions for these mechanics rather than adding independent manual weights. Match outcomes include random event decisions; repeatable client scenarios are not empirical win probabilities. The live captain playbook reads events and does not control the match; this advisor likewise does not submit match actions.

Selecting a pick-role filter recalculates candidates with native pickScore for that requested open role, using native role eligibility. The unfiltered list retains native next-turn role priority.
