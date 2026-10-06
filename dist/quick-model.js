(function(root){
const L=root.Lab,D=root.DC;
// Fast completions use native scores. They are never labelled as simulated wins.
L.quickTeams=function({locks={},bans=[],enemy=[],reference=[],focus}={}){
 const excluded=new Set([...bans,...enemy]),locked=Object.values(locks).filter(Boolean);
 if(new Set(locked).size!==locked.length)throw Error('Choose a different hero for each role.');
 for(const [role,id]of Object.entries(locks))if(id&&(excluded.has(id)||!L.valid(L.byId.get(id),role)))throw Error('A picked hero is unavailable or does not fit that role.');
 const pools=L.roles.map(role=>locks[role]?[locks[role]]:D.heroes.filter(h=>!excluded.has(h.id)&&!locked.includes(h.id)&&L.valid(h,role)).map(h=>h.id));
 const candidates=new Map(),briefs=[D.presets.earlyAggro,D.presets.lateScale,D.presets.teamfightRosh];
 function add(ids){if(new Set(ids).size!==5||ids.some((id,i)=>!pools[i].includes(id)))return;const key=ids.join(',');if(!candidates.has(key))candidates.set(key,L.bestPlan(ids,enemy,briefs))}
 // Repair the preview first, keeping the other heroes in place when possible.
 for(const t of [focus,...reference].filter(Boolean)){
  if(t!==focus&&L.roles.some((r,i)=>locks[r]&&locks[r]!==t.ids[i]))continue;
  const ids=t.ids.map((id,i)=>locks[L.roles[i]]||id),invalid=ids.map((id,i)=>!pools[i].includes(id)||ids.indexOf(id)!==i?i:-1).filter(i=>i>=0);
  if(!invalid.length)add(ids);
  else if(invalid.length===1)for(const id of pools[invalid[0]]){const repaired=[...ids];repaired[invalid[0]]=id;add(repaired)}
 }
 let seed=314159;const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296};
 for(let n=0;n<300;n++)add(pools.map(p=>p[Math.floor(random()*p.length)]));
 for(const t of [...candidates.values()].sort((a,b)=>b.score-a.score).slice(0,3))for(let i=0;i<5;i++)if(!locks[L.roles[i]])for(const id of pools[i]){const ids=[...t.ids];ids[i]=id;add(ids)}
 return [...candidates.values()].sort((a,b)=>b.score-a.score).slice(0,6).map(t=>L.bestPlan(t.ids,enemy)).sort((a,b)=>b.score-a.score);
};
})(typeof window==='undefined'?globalThis:window);
