const assert=require('node:assert/strict');
require('../dist/engine.js');require('../dist/solver.js');
const {DRAFT_PAIRS,decodeDraftSnapshot}=require('../dist/detector.js'),D=DC,A=Advisor;
const id=name=>D.heroes.find(h=>h.localized_name===name).id;
const blank={own:[],enemy:[],bans:[],ownBans:[],roles:{},enemyRoles:{},enemyChoices:{},side:'radiant',turn:2};
function snapshot(history={},turn=2,mirror=true){return{groups:DRAFT_PAIRS.map(pair=>{const p=mirror?[pair[1],pair[0]]:pair;return{numbers:pair.filter(n=>n!==null).map(n=>n+1).sort((a,b)=>a-b),left:p[0]===null?null:history[p[0]]||null,right:p[1]===null?null:history[p[1]]||null,leftSlot:p[0]!==null,rightSlot:p[1]!==null,current:pair.includes(turn)?turn+1:null}}),roles:{},yourTurn:true,enemyTurn:false}}
// The observed mirrored board: Leshrac / Pudge are turns 1 / 2, while
// the same paired visual row contains the current Radiant turn 3.
const observed=snapshot({0:'Leshrac',1:'Pudge'}),detected=decodeDraftSnapshot(observed,null,D,A);
assert.equal(detected.side,'radiant');assert.equal(detected.turn,2);assert.equal(detected.sequence[0].team,'dire');assert.deepEqual(detected.bans,[id('Leshrac'),id('Pudge')]);assert.deepEqual(detected.ownBans,[]);assert.deepEqual(detected.own,[]);assert.deepEqual(detected.enemy,[]);
const picks=snapshot({0:'Leshrac',1:'Pudge',7:'Chaos Knight',8:'Muerta'},9),draft=decodeDraftSnapshot(picks,{side:'radiant',enemyChoices:D.presets.lateScale},D,A);
assert.deepEqual(draft.own,[id('Muerta')]);assert.deepEqual(draft.enemy,[id('Chaos Knight')]);assert.deepEqual(draft.enemyRoles,{});assert.deepEqual(draft.enemyChoices,D.presets.lateScale);
assert.equal(decodeDraftSnapshot({...observed,groups:observed.groups.slice(1)},null,D,A),null);
assert.equal(decodeDraftSnapshot({...observed,yourTurn:false},null,D,A),null);
assert.equal(decodeDraftSnapshot({...observed,groups:observed.groups.map((g,i)=>i===0?{...g,numbers:[99]}:g)},null,D,A),null);
const normal=decodeDraftSnapshot(snapshot({0:'Leshrac',1:'Pudge'},2,false),{side:'radiant'},D,A);assert.equal(normal.sequence[0].team,'radiant');assert.deepEqual(normal.ownBans,[id('Leshrac'),id('Pudge')]);
// Exercise every CM prefix on both opening orders and both factions, including skipped bans.
for(const mirror of [false,true])for(const side of ['radiant','dire'])for(let turn=0;turn<24;turn++){
 const history=Object.fromEntries(Array.from({length:turn},(_,i)=>[i,D.heroes[i].localized_name]));delete history[0];
 const snap=snapshot(history,turn,mirror),decoded=decodeDraftSnapshot(snap,{side},D,A);
 assert.equal(decoded.turn,turn);assert.equal(decoded.side,side);
 for(const kind of ['own','enemy','bans','ownBans']){
  const expected=Object.entries(history).filter(([index])=>{const step=decoded.sequence[+index];return kind==='bans'?step.action==='ban':kind==='ownBans'?step.action==='ban'&&step.team===side:step.action==='pick'&&(kind==='own'?step.team===side:step.team!==side)}).map(([,name])=>id(name));
  assert.deepEqual([...decoded[kind]].sort((a,b)=>a-b),expected.sort((a,b)=>a-b));
 }
}
assert.deepEqual(decodeDraftSnapshot({brief:true,side:'dire',axes:D.presets.earlyAggro},null,D,A).enemyChoices,D.presets.earlyAggro);
const own=['Muerta','Mirana'].map(id),enemy=[id('Chaos Knight')],state={...blank,own,enemy,bans:[id('Axe')],roles:{[own[0]]:'carry',[own[1]]:'mid'}},choices=A.bestPlan(state),rows=A.recommend(state,'pick',choices),bans=A.recommend(state,'ban',choices);
assert(rows.length>10);assert(bans.length>10);assert(rows.every(r=>![...own,...enemy,...state.bans].includes(r.id)));assert(rows.every(r=>!['carry','mid'].includes(r.role)));assert(rows.every((r,i)=>!i||rows[i-1].score>=r.score));assert(rows.every(r=>r.reasons.length>0));assert(bans.every(r=>!own.includes(r.id)));
const native=D.draft.decisionPlan({available:D.heroes.filter(h=>![...own,...enemy,...state.bans].includes(h.id)),aiPicks:own.map(i=>A.byId.get(i)),playerPicks:enemy.map(i=>A.byId.get(i)),aiDraftRoles:A.assigned(own,state.roles),action:'pick',ownStrategyChoices:choices,personality:'standard',aiPickIndex:2,stepIndex:2,draftSequence:A.sequence,playerTeam:'radiant',aiBansSoFar:[]},()=>0);
for(const row of rows)assert.equal(row.score,native.scored.find(x=>x.hero.id===row.id).score);
const offlaners=A.recommend(state,'pick',choices,'offlane');assert(offlaners.length>=3);assert(offlaners.every(r=>r.role==='offlane'&&r.id!==id('Axe')));for(const r of offlaners)assert.equal(r.score,D.draft.pickScore({hero:A.byId.get(r.id),targetRole:'offlane',aiPicks:own.map(i=>A.byId.get(i)),aiDraftRoles:A.assigned(own,state.roles),ownStrategy:choices,playerPicks:enemy.map(i=>A.byId.get(i)),personality:'standard',aiPickIndex:own.length},false).score);assert.equal(A.recommend(state,'pick',choices,'carry').length,0);
assert.throws(()=>A.recommend({...state,bans:[...state.bans,own[0]]},'pick',choices),/more than one/);
const fullOwn=['Muerta','Mirana','Mars','Hoodwink','Lion'].map(id),fullEnemy=['Gyrocopter','Batrider','Centaur Warrunner','Vengeful Spirit','Rubick'].map(id),full={...blank,own:fullOwn,enemy:fullEnemy,roles:Object.fromEntries(fullOwn.map((id,i)=>[id,A.roles[i]]))};
const complete=decodeDraftSnapshot({completed:{radiant:fullOwn,dire:fullEnemy},groups:[],roles:full.roles},{side:'radiant'},D,A);assert.deepEqual(complete.own,fullOwn);assert.deepEqual(complete.enemy,fullEnemy);assert.deepEqual(complete.enemyRoles,{});
assert.equal(A.recommend(full,'pick',choices).length,0);assert.equal(A.plans.length,64);
const best=A.bestPlan(full);assert.equal(A.nativeScore(fullOwn,best,full.roles),Math.max(...A.plans.map(p=>A.nativeScore(fullOwn,p,full.roles))));
for(const side of ['radiant','dire']){const ours=fullOwn.map(i=>A.byId.get(i)),theirs=fullEnemy.map(i=>A.byId.get(i)),ownRoles=A.assigned(fullOwn,full.roles),enemyRoles=A.assigned(fullEnemy),result=D.simulate({radiant:side==='radiant'?ours:theirs,dire:side==='dire'?ours:theirs,playerTeam:side,strategyChoices:best,strategyHeroRoles:ownRoles,enemyStrategyChoices:D.presets.lateScale,enemyStrategyHeroRoles:enemyRoles,enemyRolesExplicit:true,playerItemBuilds:Object.fromEntries(ours.map(h=>[h.id,D.builds.z8(h.id,ownRoles[h.id])])),enemyItemBuilds:Object.fromEntries(theirs.map(h=>[h.id,D.builds.z8(h.id,enemyRoles[h.id])]))});const adapted=A.simulate(full,best,D.presets.lateScale,side),totals=result.timeline.at(-1).totals;assert.equal(adapted.win,result.winner===side);assert.equal(adapted.minute,result.finalMinute);assert.equal(adapted.nw,(side==='radiant'?1:-1)*(totals.radiantNetWorth-totals.direNetWorth));}
console.log('Verified paired/mirrored live history, revealed information boundaries, native rankings, legality, role locks, 64-plan fit and original simulator payload parity on both sides.');

for(let count=0;count<5;count++){
 const partial={...blank,own:fullOwn.slice(0,count),enemy:fullEnemy.slice(0,count),roles:Object.fromEntries(fullOwn.slice(0,count).map((id,i)=>[id,A.roles[i]]))};
 for(const role of A.roles.slice(count)){const candidates=A.recommend(partial,'pick',A.bestPlan(partial),role);assert(candidates.length>=3);assert(candidates.every(r=>Number.isFinite(r.score)&&r.role===role&&!partial.own.includes(r.id)&&!partial.enemy.includes(r.id)))}
}
assert(A.recommend({...state,own:[id('Medusa')],roles:{}},'ban',choices).find(r=>r.id===id('Anti-Mage')).reasons.some(r=>r.includes('Protects Medusa from Anti-Mage')));
console.log('Verified all 96 draft prefixes, skipped bans, visible scout, every remaining role and ban explanation direction.');

assert.deepEqual(A.scenarios(full).sides,['radiant']);assert.equal(A.scenarios(full).enemyPlans.length,3);
assert.equal(A.scenarios({...full,side:null}).sides.length,2);
assert.equal(A.scenarios(full,'full').enemyPlans.length,64);
assert.equal(new Set(A.scenarios(full,'full').enemyPlans.map(p=>JSON.stringify(p))).size,64);
const partialScout=A.scenarios({...full,enemyChoices:{early_late:'b',fight_split:'a'}});
assert.equal(partialScout.enemyPlans.length,16);assert(partialScout.enemyPlans.every(p=>p.early_late==='b'&&p.fight_split==='a'));
assert.equal(A.scenarios({...full,enemyChoices:D.presets.lateScale},'full').enemyPlans.length,1);
assert.deepEqual(A.summarize(A.plans[0],[{win:true,nw:10},{win:false,nw:-4}]),{choices:A.plans[0],wins:1,total:2,nw:3,worstNW:-4});
assert.deepEqual([{wins:1,nw:8},{wins:2,nw:-9},{wins:1,nw:12}].sort(A.compare),[{wins:2,nw:-9},{wins:1,nw:12},{wins:1,nw:8}]);
console.log('Verified known-side conditioning, 64 distinct enemy strategies, partial scout constraints, denominators and ranking.');

// Controlled RNG makes selection replayable without replacing the native sampling policy.
const empty={...blank,turn:0};
const openings=new Set(),firstBans=new Set(),firstPicks=new Set();
for(let n=0;n<100;n++){
 const rng=()=>n/100,plan=A.openingPlan(rng);openings.add(JSON.stringify(plan));
 for(const action of ['pick','ban']){const r=A.autoDecision(empty,action,plan,rng);assert(r.pool.includes(r.id));assert(Number.isFinite(r.score));(action==='ban'?firstBans:firstPicks).add(r.id)}
 const r=A.autoDecision(state,'pick',choices,rng);assert(![...state.own,...state.enemy,...state.bans].includes(r.id));assert(!Object.values(A.assigned(state.own,state.roles)).includes(r.role));
 const reference=D.draft.decisionPlan({available:D.heroes.filter(h=>![...own,...enemy,...state.bans].includes(h.id)),aiPicks:own.map(i=>A.byId.get(i)),playerPicks:enemy.map(i=>A.byId.get(i)),aiDraftRoles:A.assigned(own,state.roles),action:'pick',ownStrategyChoices:choices,personality:'standard',aiPickIndex:2,stepIndex:2,draftSequence:A.sequence,playerTeam:'radiant',aiBansSoFar:[]},rng);
 assert.equal(r.id,reference.selected.id);assert.equal(r.role,reference.draftRole);assert.equal(r.score,reference.scored.find(x=>x.hero.id===r.id).score);
}
assert.equal(openings.size,3);assert(firstBans.size>1);assert(firstPicks.size>1);
for(let count=0;count<5;count++){const partial={...blank,own:fullOwn.slice(0,count),enemy:fullEnemy.slice(0,count),roles:Object.fromEntries(fullOwn.slice(0,count).map((id,i)=>[id,A.roles[i]]))};for(const value of [.01,.4,.9]){const result=A.autoDecision(partial,'pick',A.bestPlan(partial),()=>value);assert(result.pool.includes(result.id));assert(!Object.values(A.assigned(partial.own,partial.roles)).includes(result.role));}}
console.log('Verified weighted native parity over 100 RNG values, opening diversity, strong candidate pools, exclusions and open roles. Distinct first bans:',firstBans.size,'first picks:',firstPicks.size);
