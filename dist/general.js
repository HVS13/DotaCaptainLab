/* Scenario sampling and aggregation are ours; every match uses the untouched native simulator. */
(function(root){
const L=root.Lab,D=root.DC,briefs=['earlyAggro','lateScale','teamfightRosh'];
// Public solo doctrine generator 97174.R0: choose a base, then flip 0/1/2 axes.
// The second threshold consumes a fresh random draw: P(1)=0.65*0.75, not 0.40.
const soloBases=[...Object.values(D.presets),{early_late:'b',aggro_passive:'a',fight_split:'b',farm_gank:'a',objective_style:'a',map_control:'a'},{early_late:'a',aggro_passive:'a',fight_split:'a',farm_gank:'b',objective_style:'b',map_control:'b'}].filter((p,i,a)=>a.findIndex(q=>D.questions.every(k=>p[k.id]===q[k.id]))===i);
const soloPrior=L.plans.map(p=>soloBases.reduce((sum,b)=>{const flips=D.questions.filter(q=>p[q.id]!==b[q.id]).length;return sum+(flips<=2?[.35,.65*.75/6,.65*.25/15][flips]/soloBases.length:0)},0));
const planIndex=new Map(L.plans.map((p,i)=>[D.questions.map(q=>p[q.id]).join(''),i]));
function soloBenchmark(g){if(!g)return null;let weight=0,wins=0,networth=0;for(const e of g.opponents){const index=planIndex.get(D.questions.map(q=>e.choices[q.id]).join('')),w=soloPrior[index]||0;weight+=w;wins+=w*(e.total-e.wins)/e.total;networth+=w*-e.meanNetworthLead}return weight?{rate:wins/weight,meanNetworthLead:networth/weight}:null}
function random(seed){return()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296}}
function opponents(team,{enemy=[],enemyRoles={},enemyChoices={},bans=[],profiles=256}={},purpose='evaluation'){
 if(new Set([...team.ids,...enemy,...bans]).size!==team.ids.length+enemy.length+bans.length)throw Error('Picks and bans must be different heroes.');
 const result=[],count=purpose==='training'?128:profiles;
 for(let n=0;n<count;n++){
  const batch=Math.floor(n/64),plan=n%64,policy=(plan+batch)%2,choices={...L.plans[plan],...enemyChoices},rng=random((purpose==='training'?193939:73471)+n*9973),assigned={},ids=[...enemy],used=new Set([...team.ids,...enemy,...bans]);
  // Unknown roles are sampled over legal preferred-role assignments, not asserted as revealed.
  function assign(i){if(i===enemy.length)return true;const id=enemy[i],options=enemyRoles[id]?[enemyRoles[id]]:L.roles.filter(r=>L.valid(L.byId.get(id),r));const ordered=options.map(r=>({r,key:rng()})).sort((a,b)=>a.key-b.key);for(const {r}of ordered)if(!Object.values(assigned).includes(r)){assigned[id]=r;if(assign(i+1))return true;delete assigned[id]}return false}
  if(!assign(0))throw Error('Revealed heroes cannot fill distinct preferred roles. Specify their actual roles.');
  for(const role of L.roles)if(!Object.values(assigned).includes(role)){
   const available=D.heroes.filter(h=>!used.has(h.id)&&L.valid(h,role));if(!available.length)throw Error('No legal opponent can fill '+role);
   let hero;
   if(policy===0){const aiPicks=ids.map(id=>L.byId.get(id));const fit=D.fit({lineup:aiPicks,roles:assigned,choices});const scored=available.map(hero=>({hero,...D.draft.pickScore({hero,targetRole:role,aiPicks,aiDraftRoles:assigned,ownStrategy:choices,playerPicks:[],personality:'standard',aiPickIndex:ids.length,fit:{coherence:fit.coherence,hasWarnings:fit.warnings.length>0}},false)})).sort((a,b)=>b.score-a.score||a.hero.id-b.hero.id);hero=scored[Math.floor(rng()*Math.min(4,scored.length))].hero}
   else hero=available[Math.floor(rng()*available.length)];
   ids.push(hero.id);assigned[hero.id]=role;used.add(hero.id);
  }
  const ordered=L.roles.map(r=>ids.find(id=>assigned[id]===r));
  if(ordered.some(id=>!id))throw Error('Opponent needs five assigned roles.');
  result.push({ids:ordered,choices,label:policy===0?'Native-score shortlist':'Uniform preferred-role',kind:policy===0?'native AI shortlist':'role-balanced sample',batch,replicate:Math.floor(n/128),plan,purpose});
 }
 // Fully revealed lineups with fully revealed plans need no repeated identical scenarios.
 return result;
}
function assess(team,opponent){
 const tests=['radiant','dire'].map(side=>{const s=L.run(team,opponent.ids,opponent.choices,side,L.roleMap(opponent.ids));return{side,win:s.win,networthLead:s.networthLead,minute:s.minute}});
 return {...opponent,tests,wins:tests.filter(s=>!s.win).length,total:tests.length,meanNetworthLead:-tests.reduce((n,s)=>n+s.networthLead,0)/tests.length};
}
function threatSort(a,b){return b.wins/b.total-a.wins/a.total||b.meanNetworthLead-a.meanNetworthLead}
function overall(team,context={},onProgress,pool=opponents(team,context)){
 const cache=new Map(),entries=pool.map((p,i)=>{const key=p.ids.join(',')+JSON.stringify(p.choices);let e=cache.get(key);if(!e){e=assess(team,p);cache.set(key,e)}onProgress?.(i+1,pool.length);return {...e,...p}}),tests=entries.flatMap(e=>e.tests);
 function group(key){return [...new Set(entries.map(e=>e[key]))].map(label=>{const items=entries.filter(e=>e[key]===label).flatMap(e=>e.tests);return{label,wins:items.filter(t=>t.win).length,total:items.length,meanNetworthLead:items.reduce((n,t)=>n+t.networthLead,0)/items.length}})}
 const groups=group('label'),batches=group('replicate');
 return{wins:tests.filter(t=>t.win).length,total:tests.length,uniqueMatches:cache.size*2,meanNetworthLead:tests.reduce((n,t)=>n+t.networthLead,0)/tests.length,groups,batches,opponents:entries,context:{...context},scope:context.enemy?.length?'revealed picks + hypothetical completions':'general hypothetical opponents',method:'stratified-64-v2'};
}
function overallSort(a,b){return(b.overall?.wins/b.overall?.total||0)-(a.overall?.wins/a.overall?.total||0)||(b.overall?.meanNetworthLead??-Infinity)-(a.overall?.meanNetworthLead??-Infinity)||b.score-a.score}
function optimizeGeneral(team,context={},onProgress){
 const pool=opponents(team,context,'training'),screen=pool.filter(p=>{const bit=n=>(p.plan>>n)&1;return bit(3)===(bit(0)^bit(1))&&bit(4)===(bit(0)^bit(2))&&bit(5)===(bit(1)^bit(2))}),candidates=L.plans.map((choices,i)=>{const candidate={ids:[...team.ids],choices,...L.score(team.ids,choices,context.enemy||[])};return {...candidate,overall:overall(candidate,context,n=>onProgress?.(i+1,64,n,screen.length),screen)}}).sort(overallSort);
 // Keep the current plan eligible even when the coarse screen misses it.
 const finalists=candidates.slice(0,8),current=candidates.find(t=>JSON.stringify(t.choices)===JSON.stringify(team.choices));if(current&&!finalists.includes(current))finalists.push(current);
 let best;for(const [i,t]of finalists.entries()){const result={...t,overall:overall(t,context,n=>onProgress?.(i+1,finalists.length,n,pool.length),pool)};if(!best||overallSort(result,best)<0)best=result}
 const training=best.overall,evaluation=overall(best,context,n=>onProgress?.(1,1,n,context.profiles||256)),keys=new Set(pool.map(p=>p.ids.join(',')+JSON.stringify(p.choices))),overlap=evaluation.opponents.filter(p=>keys.has(p.ids.join(',')+JSON.stringify(p.choices))).length;return {...best,overall:evaluation,generalOptimization:{strategies:64,finalists:finalists.length,opponents:pool.length,trainingWins:training.wins,trainingTotal:training.total,overlappingProfiles:overlap,evaluationOnly:true}};
}
function rankConsistency(teams){for(const t of teams)if(t.overall)delete t.overall.rankCheck;const tested=teams.filter(t=>t.overall?.method==='stratified-64-v2'&&t.overall.batches.length>=2);if(!tested.length)return teams;const batches=tested[0].overall.batches.map(g=>g.label).filter(batch=>tested.every(t=>t.overall.batches.some(g=>g.label===batch))),ranks=batches.map(batch=>new Map([...tested].sort((a,b)=>{const x=a.overall.batches.find(g=>g.label===batch),y=b.overall.batches.find(g=>g.label===batch);return y.wins/y.total-x.wins/x.total||y.meanNetworthLead-x.meanNetworthLead||b.score-a.score}).map((t,i)=>[t,i+1])));for(const t of tested){const positions=ranks.map(r=>r.get(t));t.overall.rankCheck={first:positions[0],second:positions[1],min:Math.min(...positions),max:Math.max(...positions),positions,candidates:tested.length}}return teams}
function strongest(entries,count=3){const ordered=[...entries].sort(threatSort),seen=new Set();return ordered.filter(e=>{const key=e.ids.join(',');if(seen.has(key))return false;seen.add(key);return true}).slice(0,count)}
function counterSearch(team,{bans=[]}={},onProgress){
 const candidates=L.search({enemy:team.ids,bans,limit:24,samples:2000}),pool=[...candidates,...opponents(team,{bans}).slice(0,12)],seen=new Set(),unique=pool.filter(t=>{const key=t.ids.join(',');if(seen.has(key))return false;seen.add(key);return true});
 let measured=unique.map((t,i)=>{const tested=briefs.map(name=>assess(team,{ids:t.ids,choices:D.presets[name],label:name,kind:'counter search'})).sort(threatSort);onProgress?.('screen',i+1,unique.length);return tested[0]}).sort(threatSort);
 const finalists=measured.slice(0,4);
 for(const [i,t]of finalists.entries()){
  let best;for(const [n,choices]of L.plans.entries()){const r=assess(team,{ids:t.ids,choices,label:'64-plan search',kind:'counter search'});if(!best||threatSort(r,best)<0)best=r;onProgress?.('plans',i+1,finalists.length,n+1)}
  measured[measured.findIndex(x=>x.ids.join(',')===t.ids.join(','))]={...best,strategies:64};
 }
 return{teams:strongest(measured),screened:unique.length,exhaustiveLineups:finalists.length,targetChoices:{...team.choices},bans:[...bans]};
}
function banTargets(team,threats){
 const available=D.heroes.filter(h=>threats.some(t=>t.ids.includes(h.id))),aiPicks=team.ids.map(id=>L.byId.get(id));
 if(!available.length)return[];
 const decision=D.draft.decisionPlan({available,aiPicks,playerPicks:[],aiDraftRoles:L.roleMap(team.ids),action:'ban',ownStrategyChoices:team.choices,personality:'standard',aiPickIndex:5,stepIndex:0},()=>0),values=new Map(decision.scored.map(s=>[s.hero.id,s.score]));
 return available.map(h=>({id:h.id,blocks:threats.filter(t=>t.ids.includes(h.id)).length,nativeValue:values.get(h.id)||0})).sort((a,b)=>b.blocks-a.blocks||b.nativeValue-a.nativeValue).slice(0,5);
}
Object.assign(L,{opponents,overall,overallSort,optimizeGeneral,rankConsistency,strongest,counterSearch,banTargets,soloPrior,soloBenchmark});
})(typeof window==='undefined'?globalThis:window);
