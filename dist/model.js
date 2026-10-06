(function(root){
const D=root.DC,roles=['carry','mid','offlane','support','hard_support'],byId=new Map(D.heroes.map(h=>[h.id,h]));
const plans=Array.from({length:64},(_,n)=>Object.fromEntries(D.questions.map((q,i)=>[q.id,(n>>i)&1?'b':'a'])));
const names={carry:'Carry · 1',mid:'Mid · 2',offlane:'Offlane · 3',support:'Soft support · 4',hard_support:'Hard support · 5'};
const enemyIds=[81,138,99,66,23];
function roleMap(ids){return Object.fromEntries(ids.map((id,i)=>[id,roles[i]]))}
function defaultBuilds(ids){return Object.fromEntries(ids.map((id,i)=>[id,D.builds.z8(id,roles[i])]))}
function valid(h,r){return D.roles.SD(h,r)===0}
function score(ids,choices,enemy=[]){
 const lineup=ids.map(id=>byId.get(id)),rm=roleMap(ids),cap=D.capabilities.Im(lineup,h=>rm[h.id]).capability,fit=D.fit({lineup,roles:rm,choices});
 const synergies=D.synergy.vH(ids).filter(e=>D.synergy.d4(e,{stage:'combat',minute:25,aLevel:18,bLevel:18}));
 const playerPicks=enemy.map(id=>byId.get(id));
 const values=lineup.map((hero,slot)=>{const aiPicks=lineup.filter(h=>h.id!==hero.id),partial=D.fit({lineup:aiPicks,roles:rm,choices});return D.draft.pickScore({hero,targetRole:roles[slot],aiPicks,aiDraftRoles:rm,ownStrategy:choices,playerPicks,personality:'standard',aiPickIndex:4,fit:{coherence:partial.coherence,hasWarnings:partial.warnings.length>0}},false)});
 const components=Object.fromEntries(Object.keys(values[0].components).map(k=>[k,values.reduce((n,x)=>n+x.components[k],0)/5]));
 return {score:values.reduce((n,x)=>n+x.score,0)/5,components,fit,cap,synergies};
}
function bestPlan(ids,enemy=[],restrict){
 let best;for(const choices of restrict||plans){const s=score(ids,choices,enemy);if(!best||s.score>best.score)best={ids,choices,...s}}return best;
}
function search({enemy=[],bans=[],locks={},limit=240,samples=6000}={}){
 const excluded=new Set([...enemy,...bans]);
 const locked=Object.values(locks).filter(Boolean);if(new Set(locked).size!==locked.length)throw Error('Each locked hero must be unique.');
 for(const [r,id]of Object.entries(locks))if(id&&(!byId.has(id)||excluded.has(id)||!valid(byId.get(id),r)))throw Error('A locked hero is banned, on the enemy team, or does not fit that role.');
 const pools=roles.map(r=>locks[r]?[byId.get(locks[r])]:D.heroes.filter(h=>!excluded.has(h.id)&&valid(h,r)));
 if(pools.some(p=>!p.length))throw Error('No heroes available for one of the roles.');
 let seed=123456789;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296}
 const seeds=[D.presets.earlyAggro,D.presets.lateScale,D.presets.teamfightRosh,{...D.presets.teamfightRosh,early_late:'b',aggro_passive:'b',farm_gank:'a'}];
 const found=new Map();
 function consider(ids){if(new Set(ids).size<5)return;const key=ids.join(',');if(found.has(key))return;found.set(key,bestPlan(ids,enemy,seeds))}
 for(let i=0;i<samples;i++)consider(pools.map(p=>p[Math.floor(rand()*p.length)].id));
 // Improve a bounded shortlist with single-role replacements; preserve requested locks.
 let shortlist=[...found.values()].sort((a,b)=>b.score-a.score).slice(0,20);
 for(const team of shortlist)for(let slot=0;slot<5;slot++)if(!locks[roles[slot]])for(const h of pools[slot]){const ids=[...team.ids];ids[slot]=h.id;consider(ids)}
 const ranked=[...found.values()].sort((a,b)=>b.score-a.score);
 // Keep a broad catalogue: reserve the best candidate for every eligible carry,
 // mid and offlane before filling remaining places by score.
 const catalogue=new Map();
 for(let slot=0;slot<3;slot++)for(const h of pools[slot]){const t=ranked.find(t=>t.ids[slot]===h.id);if(t)catalogue.set(t.ids.join(','),t)}
 for(const t of ranked){if(catalogue.size>=limit)break;catalogue.set(t.ids.join(','),t)}
 shortlist=[...catalogue.values()].slice(0,limit);
 return shortlist.map(t=>bestPlan(t.ids,enemy)).sort((a,b)=>b.score-a.score);
}
function alternatives(team,enemy,bans=[],locks={}){
 const used=new Set([...team.ids,...enemy,...bans]);
 return roles.map((r,slot)=>({role:r,options:locks[r]?[]:D.heroes.filter(h=>!used.has(h.id)&&valid(h,r)).map(h=>{const ids=[...team.ids];ids[slot]=h.id;return {id:h.id,ids,...score(ids,team.choices,enemy)}}).sort((a,b)=>b.score-a.score).slice(0,2).map(x=>({id:x.id,ids:x.ids,score:x.score,delta:x.score-team.score}))}));
}
function run(team,enemy,enemyChoices,side='radiant',enemyRoleOverrides={}){
 const our=team.ids.map(id=>byId.get(id)),their=enemy.map(id=>byId.get(id));
 if(enemy.length!==5||new Set([...team.ids,...enemy]).size!==10)throw Error('A match needs ten different heroes.');
 const enemyRoles=D.roles.HF(their,enemyRoleOverrides,{preferredMode:'hard'});
 const result=D.simulate({radiant:side==='radiant'?our:their,dire:side==='dire'?our:their,playerTeam:side,strategyChoices:team.choices,strategyHeroRoles:roleMap(team.ids),enemyStrategyChoices:enemyChoices,enemyStrategyHeroRoles:enemyRoles,enemyRolesExplicit:true,playerItemBuilds:defaultBuilds(team.ids),enemyItemBuilds:Object.fromEntries(their.map(h=>[h.id,D.builds.z8(h.id,enemyRoles[h.id])]))});
 return summarize(result,side);
}
function summarize(result,side){
 const last=result.timeline.at(-1),totals=last.totals;
 return {win:result.winner===side,winner:result.winner,minute:result.finalMinute,end:result.matchEndType,networthLead:side==='radiant'?totals.radiantNetWorth-totals.direNetWorth:totals.direNetWorth-totals.radiantNetWorth,kills:side==='radiant'?[totals.radiantKills,totals.direKills]:[totals.direKills,totals.radiantKills],brief:result.cognition[side+'Brief'],items:result.heroFinalStates.filter(h=>h.team===side).map(h=>({id:+h.heroId,completed:h.completedItems,networth:h.networth,strength:h.finalStrength,kills:h.kills,deaths:h.deaths,assists:h.assists})),events:result.logs.filter(l=>l.kind==='tower'||l.kind==='roshan'||l.kind==='high_ground_siege'||l.kind==='ancient_assault').slice(-8).map(l=>({minute:l.gameMinute,message:l.message}))};
}
function draftAdvice({enemy=[],enemyRoles={},locks={},bans=[],ownBans=[],choices=D.presets.teamfightRosh,enemyChoices={},personality='',action='pick',stepIndex,draftSequence,playerTeam}){
 const own=Object.values(locks).filter(Boolean),used=[...own,...enemy,...bans];
 if(new Set(used).size!==used.length)throw Error('Confirmed picks and bans must be different heroes.');
 if(action==='pick'&&own.length===5)return {action,rows:[],complete:true};
 if(action==='ban'&&enemy.length===5)return {action,rows:[],complete:true};
 const available=D.heroes.filter(h=>!used.includes(h.id));
 if(!available.length)return {action,rows:[],complete:false};
 const aiPicks=own.map(id=>byId.get(id)),playerPicks=enemy.map(id=>byId.get(id)),aiDraftRoles=Object.fromEntries(Object.entries(locks).filter(([,id])=>id).map(([role,id])=>[id,role]));
 const decision=D.draft.decisionPlan({available,aiPicks,playerPicks,aiDraftRoles,action,ownStrategyChoices:choices,personality:'standard',aiPickIndex:own.length,stepIndex,draftSequence,playerTeam,aiBansSoFar:ownBans.map(id=>byId.get(id))},()=>0);
 const rival=enemy.length<5&&personality&&D.questions.every(q=>enemyChoices[q.id])?D.draft.decisionPlan({available,aiPicks:playerPicks,playerPicks:aiPicks,aiDraftRoles:D.roles.HF(playerPicks,enemyRoles,{preferredMode:'hard'}),action:'pick',ownStrategyChoices:enemyChoices,personality,aiPickIndex:enemy.length,stepIndex,draftSequence,playerTeam:playerTeam==='radiant'?'dire':'radiant'},()=>0):null;
 const rivalValues=new Map(rival?.scored.map(x=>[x.hero.id,x.score])||[]);
 const rows=decision.scored.filter(x=>x.score>-1e5&&(action==='ban'||!Object.keys(locks).filter(r=>locks[r]).includes(x.bestRole)&&valid(x.hero,x.bestRole))).map(x=>({id:x.hero.id,score:x.score,role:x.bestRole,components:x.components,rivalValue:rivalValues.get(x.hero.id)})).sort((a,b)=>b.score-a.score);
 return {action,rows,targetRole:decision.targetRole,rivalPick:rival?.selected.id,complete:false};
}
function compareResults(a,b){return +b.win-+a.win||b.networthLead-a.networthLead||a.minute-b.minute}
function optimizePlans(team,enemy,enemyChoices,side,onProgress,enemyRoles={}){
 const results=plans.map((choices,i)=>{const candidate={ids:[...team.ids],choices,...score(team.ids,choices,enemy)},simulation=run(candidate,enemy,enemyChoices,side,enemyRoles);onProgress?.(i+1,64);return {...candidate,simulation}});
 return results.sort((a,b)=>compareResults(a.simulation,b.simulation));
}
function optimizeTeams(teams,enemy,enemyChoices,side,onProgress,enemyRoles={}){
 return teams.map((team,i)=>({...optimizePlans(team,enemy,enemyChoices,side,n=>onProgress?.(i+1,teams.length,n),enemyRoles)[0],originalIndex:team.originalIndex,optimization:{strategies:64,enemy:[...enemy],enemyChoices:{...enemyChoices},enemyRoles:{...enemyRoles},side}})).sort((a,b)=>compareResults(a.simulation,b.simulation));
}
function benchmark(team,enemy,onProgress,enemyRoles={}){
 const tests=[];for(const [name,choices]of [['Early aggression',D.presets.earlyAggro],['Late split',D.presets.lateScale],['Teamfight / Rosh',D.presets.teamfightRosh]])for(const side of ['radiant','dire']){tests.push({name,side,...run(team,enemy,choices,side,enemyRoles)});onProgress?.(tests.length,6)}
 return {wins:tests.filter(t=>t.win).length,total:tests.length,meanNetworthLead:tests.reduce((a,b)=>a+b.networthLead,0)/tests.length,tests};
}
root.Lab={roles,names,byId,plans,enemyIds,roleMap,defaultBuilds,valid,score,bestPlan,search,alternatives,run,summarize,benchmark,draftAdvice,optimizePlans,optimizeTeams,compareResults};
})(typeof window==='undefined'?globalThis:window);
