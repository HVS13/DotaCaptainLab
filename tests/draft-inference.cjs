const assert=require('node:assert/strict'),P=require('../scripts/draft-lookahead.cjs'),O=require('../scripts/draft-override.cjs'),I=require('../scripts/draft-inference.cjs'),A=Advisor,D=DC;
const game=P.draft(710019,'radiant').game,s=P.state(game,'radiant',24),expected=A.scenarios(s,'fast').enemyPlans.map(p=>A.simulate(s,P.plan(game,'radiant'),p,'radiant'));
assert.deepEqual(I.evaluateLeaf(game,'radiant'),expected);
const altered=JSON.parse(JSON.stringify(game));altered.roles.dire={};altered.openings.dire=D.presets.lateScale;
assert.deepEqual(I.evaluateLeaf(altered,'radiant'),expected);
// The original experiment keeps its exact evaluator and results by default.
const draft={teams:{radiant:[],dire:[]},roles:{radiant:{},dire:{}},bans:[],ownBans:{radiant:[],dire:[]},openings:{radiant:D.presets.earlyAggro,dire:D.presets.lateScale}};
let trained=0;
for(let turn=0;turn<24;turn++){const baseline=P.native(draft,turn,P.random(71001+turn*7919)),before=JSON.stringify(draft),result=I.decision(draft,turn,baseline,730001+turn*7919);assert.equal(JSON.stringify(draft),before);assert(baseline.pool.includes(result.move.id));if(result.training){trained++;assert(result.training.every(r=>r.total===12));const repeat=O.decision(draft,turn,baseline,730001+turn*7919,I.evaluateLeaf);assert.deepEqual({...result,ms:0},{...repeat,ms:0});if(result.changed)assert(O.qualified(result.training.find(r=>r.id===result.move.id),result.training[0]))}P.apply(draft,turn,result.move)}
assert(trained>0);assert.equal(new Set([...draft.teams.radiant,...draft.teams.dire,...draft.bans]).size,24);
console.log('Verified inferred-role leaf parity, hidden-role independence, native pool legality and unchanged qualification rules.');
