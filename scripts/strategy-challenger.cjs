// Research only. Exact native outcomes; no changes to production Auto.
(function(root,factory){if(typeof module==='object')module.exports=factory(globalThis.Advisor);else root.StrategyChallenger=factory(root.Advisor)})(globalThis,function(A){
 const key=p=>JSON.stringify(p),severe=t=>!t.win&&t.nw < -20000;
 function shortlist(state,config){const plans=[config.choices];for(const p of [...config.alternatives.map(r=>r.choices),A.bestPlan(state)])if(plans.length<4&&!plans.some(q=>key(q)===key(p)))plans.push(p);return plans}
 function profiles(state){const all=[...A.opponentVariants(state)],base=all[0],role=all.find(v=>v.label.startsWith('Role swap:')),variants=[base];if(role)variants.push(role);
  for(const v of [...variants]){const carry=state.enemy.find(id=>v.roles[id]==='carry'),build=[...v.items[carry]];[build[0],build[1]]=[build[1],build[0]];variants.push({label:v.label+' + carry purchases 1/2',roles:v.roles,items:{...v.items,[carry]:build}})}
  const plans=A.scenarios(state,'full').enemyPlans;return{variants,plans,cases:variants.flatMap((opponent,variant)=>plans.map(choices=>({variant,choices,opponent})))};
 }
 function select(rows,profile){if(!rows.length||rows.some(row=>row.length!==profile.cases.length))throw Error('Selection requires complete matched rows');const summarize=row=>profile.variants.map((_,k)=>{const tests=row.slice(k*profile.plans.length,(k+1)*profile.plans.length);return{wins:tests.filter(t=>t.win).length,severe:tests.filter(severe).length,nw:tests.reduce((s,t)=>s+t.nw,0)/tests.length}}),metrics=rows.map(summarize),base=metrics[0],eligible=metrics.map((r,i)=>i&&r.every((v,k)=>v.wins>=base[k].wins&&v.severe<=base[k].severe)&&r.some((v,k)=>v.wins>base[k].wins||v.severe<base[k].severe)?i:null).filter(i=>i!==null),minimum=r=>Math.min(...r.map(v=>v.wins)),sum=(r,k)=>r.reduce((s,v)=>s+v[k],0);
  eligible.sort((i,j)=>minimum(metrics[j])-minimum(metrics[i])||sum(metrics[j],'wins')-sum(metrics[i],'wins')||sum(metrics[i],'severe')-sum(metrics[j],'severe')||sum(metrics[j],'nw')-sum(metrics[i],'nw')||i-j);return{index:eligible[0]??0,eligible,metrics};
 }
 function evaluate(state,config,{deadline=Infinity,now=()=>performance.now(),cancelled=()=>false}={}){const plans=shortlist(state,config),profile=profiles(state),rows=[];let simulations=0;
  for(const plan of plans){const row=[];for(const c of profile.cases){if(cancelled()||now()>=deadline)return{index:0,completed:false,simulations,plans,profile};row.push(A.simulate(state,plan,c.choices,state.side,config.itemBuilds,c.opponent));simulations++;if(cancelled()||now()>=deadline)return{index:0,completed:false,simulations,plans,profile}}rows.push(row)}
  return{...select(rows,profile),completed:true,simulations,plans,profile,rows};
 }
 return{shortlist,profiles,select,evaluate};
});
