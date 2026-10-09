// Deterministic, paired experiment. No observed PvP outcomes are used to select plans.
const fs=require('node:fs'),path=require('node:path');
require('../dist/engine.js');require('../dist/solver.js');
const A=Advisor,D=DC;
function random(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
function draft(seed){const rng=random(seed),teams={radiant:[],dire:[]},rm={radiant:{},dire:{}},bans=[],ownBans={radiant:[],dire:[]},plans={radiant:A.openingPlan(rng),dire:A.openingPlan(rng)};
 for(const [turn,step]of A.sequence.entries()){const other=step.team==='radiant'?'dire':'radiant',s={own:teams[step.team],enemy:teams[other],roles:rm[step.team],bans,ownBans:ownBans[step.team],side:step.team,turn},move=A.autoDecision(s,step.action,plans[step.team],rng);if(step.action==='ban'){bans.push(move.id);ownBans[step.team].push(move.id)}else{teams[step.team].push(move.id);rm[step.team][move.id]=move.role}}
 const side=seed%2?'radiant':'dire',other=side==='radiant'?'dire':'radiant';return{own:teams[side],enemy:teams[other],roles:rm[side],enemyRoles:{},enemyChoices:{},bans,side};
}
const key=p=>D.questions.map(q=>p[q.id]).join('');
function evaluate(state,plan,profiles){return A.summarize(plan,profiles.map(p=>A.simulate(state,plan,p.plan,state.side,undefined,p.opponent)))}
const count=Number(process.argv[2]||6),seedStart=Number(process.argv[3]||1701),output=process.argv[4]||'shortlist-benchmark.json',results=[];
for(let i=0;i<count;i++){
 const started=Date.now(),state=draft(seedStart+i),quick=A.scenarios(state,'fast').enemyPlans,cache=new Map;
 const score=(plan,enemy)=>{const k=key(plan)+key(enemy);if(!cache.has(k))cache.set(k,A.simulate(state,plan,enemy,state.side));return cache.get(k)};
 const screen=A.plans.map(plan=>A.summarize(plan,quick.map(enemy=>score(plan,enemy)))).sort(A.compare),baseline=screen[0];
 const refined=screen.slice(0,3).map(row=>A.summarize(row.choices,A.plans.map(enemy=>score(row.choices,enemy)))).sort(A.compare)[0];
 // Held-out nuisance profiles use a separate seed; neither selector sees these.
 const rng=random(seedStart+7300+i),variants=Array.from(A.opponentVariants(state)),holdout=Array.from({length:32},()=>({plan:A.plans[Math.floor(rng()*64)],opponent:variants[Math.floor(rng()*variants.length)]}));
 const before=evaluate(state,baseline.choices,holdout),after=evaluate(state,refined.choices,holdout);
 const row={seed:seedStart+i,side:state.side,own:state.own,enemy:state.enemy,roles:state.roles,baseline:{plan:key(baseline.choices),screenWins:baseline.wins,wins:before.wins,total:before.total,nw:before.nw},refined:{plan:key(refined.choices),trainingWins:refined.wins,trainingTotal:refined.total,wins:after.wins,total:after.total,nw:after.nw},trainingSimulations:cache.size,elapsedMs:Date.now()-started};results.push(row);console.log(JSON.stringify(row));
}
const result={created:new Date().toISOString(),seedStart,method:'64 plans screened on three native presets; top three reranked on all 64 enemy plans. Paired holdout: 32 separately seeded native-plan / legal-role-swap / default-item-order variants per lineup. Default own items. Native-generated legal drafts. Simulation stress test, not calibrated PvP win rate.',results,totals:{baselineWins:results.reduce((s,r)=>s+r.baseline.wins,0),refinedWins:results.reduce((s,r)=>s+r.refined.wins,0),cases:count*32,improvedDrafts:results.filter(r=>r.refined.wins>r.baseline.wins).length,worseDrafts:results.filter(r=>r.refined.wins<r.baseline.wins).length}};
fs.mkdirSync(path.join(__dirname,'../docs/research'),{recursive:true});fs.writeFileSync(path.join(__dirname,'../docs/research',output),JSON.stringify(result,null,2));console.log(JSON.stringify(result.totals));
