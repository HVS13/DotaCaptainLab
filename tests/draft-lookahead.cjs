const assert=require('node:assert/strict'),P=require('../scripts/draft-lookahead.cjs'),A=Advisor,D=DC;
const baseline=P.draft(9127,'radiant',false),repeated=P.draft(9127,'radiant',false);
assert.deepEqual(baseline.game,repeated.game);
assert.equal(baseline.game.teams.radiant.length,5);assert.equal(baseline.game.teams.dire.length,5);assert.equal(baseline.game.bans.length,14);
assert.equal(new Set([...baseline.game.teams.radiant,...baseline.game.teams.dire,...baseline.game.bans]).size,24);
const game={teams:{radiant:[],dire:[]},roles:{radiant:{},dire:{}},bans:[],ownBans:{radiant:[],dire:[]},openings:{radiant:D.presets.earlyAggro,dire:D.presets.lateScale}},saved=JSON.stringify(game),move=P.native(game,0,P.random(17)),probe=P.decision(game,0,move,12345);
assert.equal(JSON.stringify(game),saved);assert(move.pool.includes(probe.move.id));assert.equal(probe.simulations,probe.training.length*6);
const base=probe.training.find(r=>r.id===move.id),chosen=probe.training.find(r=>r.id===probe.move.id);
if(probe.changed){assert(chosen.wins>base.wins);assert(chosen.worstNW>=base.worstNW)}
const continuation=P.continuation(game,0,probe.move,83);
assert.equal(new Set([...continuation.teams.radiant,...continuation.teams.dire,...continuation.bans]).size,24);
assert.equal(continuation.bans[0],probe.move.id);assert.equal(JSON.stringify(game),saved);
const prefix=JSON.parse(saved);for(let turn=0;turn<9;turn++)P.apply(prefix,turn,P.native(prefix,turn,P.random(91+turn)));
const prefixMove=P.native(prefix,9,P.random(22)),first=P.decision(prefix,9,prefixMove,61),hiddenChanged=JSON.parse(JSON.stringify(prefix));hiddenChanged.roles.dire={};hiddenChanged.openings.dire=D.presets.splitObjective;
const second=P.decision(hiddenChanged,9,prefixMove,61);assert.deepEqual(first.training,second.training);assert.equal(first.move.id,second.move.id);
console.log('Verified repeatable legal drafts, 24 unique actions, native-shortlist-only replacements, paired six-case denominators, stricter replacement criteria and unchanged input state. Research policy is not bundled into Auto.');
console.log('Verified changing hidden opponent role locks and opening cannot change the recommendation or training scores.');
