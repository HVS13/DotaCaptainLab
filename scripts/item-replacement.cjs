// Research only: native recommended item identities challenge the complete
// published configuration. No strategy/role changes or new item-score weights.
(function(root,factory){if(typeof module==='object')module.exports=factory(globalThis.Advisor,globalThis.DC,require('./strategy-risk.cjs'));else root.ItemReplacement=factory(root.Advisor,root.DC,root.StrategyRisk)})(globalThis,function(A,D,R){
 function candidates(state,items){const roles=A.assigned(state.own,state.roles),catalog=new Map(D.items.map(i=>[i.id,i])),out=[];for(const id of state.own){let count=0;for(const [slot,to]of D.builds.GX(id).slice(0,6).entries()){const item=catalog.get(to);if(!item||item.retired||!item.roleAffinity.includes(roles[id])||items[id].includes(to))continue;const build=[...items[id]];build[slot]=to;if(build.length!==6||new Set(build).size!==6||JSON.stringify(D.builds.c6(build))!==JSON.stringify(build))continue;out.push({heroId:id,slot,from:items[id][slot],to,itemBuilds:{...items,[id]:build}});if(++count===2)break}}return out}
 async function evaluate(state,config,baselineRows,profile,{deadline=Infinity,now=Date.now,cancelled=()=>false,yieldTask=()=>Promise.resolve()}={}){
  const proposals=candidates(state,config.itemBuilds),key=p=>D.questions.map(q=>p[q.id]).join(''),presets=[D.presets.earlyAggro,D.presets.lateScale,D.presets.teamfightRosh],indices=presets.map(p=>profile.cases.findIndex(c=>key(c.choices)===key(p))).filter(i=>i>=0),screen=[],rows=[baselineRows];let simulations=0,nominee=null,selection={index:0,eligible:[]};
  const finish=(completed,reason)=>({...selection,completed,reason,simulations,proposals,screen,nominee,rows,itemBuilds:selection.index===1?nominee.itemBuilds:config.itemBuilds});
  if(!indices.length)return finish(true,'No compatible native preset');
  const baseScreen=A.summarize(config.choices,indices.map(i=>baselineRows[i]));
  async function run(c,items){await yieldTask();if(cancelled()||now()>=deadline)return null;const test=A.simulate(state,config.choices,c.choices,state.side,items,c.opponent);simulations++;return cancelled()||now()>=deadline?null:test}
  for(const proposal of proposals){const tests=[];for(const i of indices){const test=await run(profile.cases[i],proposal.itemBuilds);if(!test)return finish(false,cancelled()?'cancelled':'deadline');tests.push(test)}const candidate={...proposal,...A.summarize(config.choices,tests),tests};screen.push(candidate);if(A.compare(candidate,baseScreen)<0&&(!nominee||A.compare(candidate,nominee)<0))nominee=candidate}
  if(!nominee)return finish(true,'No preset-screen improvement');
  const tested=[];for(let i=0;i<profile.cases.length;i++){const cached=indices.indexOf(i),test=cached>=0?nominee.tests[cached]:await run(profile.cases[i],nominee.itemBuilds);if(!test||cancelled()||now()>=deadline)return finish(false,cancelled()?'cancelled':'deadline');tested.push(test)}
  rows.push(tested);selection=R.select(rows,profile);return finish(true,selection.index?'Guarded item replacement selected':'Published configuration retained');
 }
 return{candidates,evaluate};
});
