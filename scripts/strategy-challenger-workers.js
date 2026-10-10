// Browser research runner. Never loaded by production; interrupted work retains baseline.
(function(root){root.runStrategyChallengerWorkers=function(state,config,{workerSource,budgetMs=30000,signal}={}){
 const started=performance.now(),deadline=started+budgetMs,C=root.StrategyChallenger,plans=C.shortlist(state,config),profile=C.profiles(state),rows=Array(plans.length),workers=[];let url,timer,settled=false;
 return new Promise(resolve=>{
  const stop=reason=>finish({index:0,completed:false,reason});
  const abort=()=>stop('cancelled');
  function finish(result){if(settled)return;settled=true;clearTimeout(timer);workers.forEach(w=>w.terminate());if(url)URL.revokeObjectURL(url);signal?.removeEventListener('abort',abort);resolve({...result,elapsedMs:performance.now()-started,plans,profile,rows:result.completed?rows:null})}
  if(signal?.aborted){stop('cancelled');return}if(budgetMs<=0){stop('deadline');return}
  timer=setTimeout(()=>stop('deadline'),budgetMs);signal?.addEventListener('abort',abort,{once:true});
  try{url=URL.createObjectURL(new Blob([workerSource],{type:'text/javascript'}));plans.forEach((plan,i)=>{if(settled)return;const worker=new Worker(url);workers.push(worker);worker.onerror=()=>stop('worker-error');worker.onmessage=({data})=>{if(settled)return;if(performance.now()>=deadline){stop('deadline');return}if(data.error||!Array.isArray(data.row)||data.row.length!==profile.cases.length){stop('worker-error');return}rows[i]=data.row;if(rows.filter(Boolean).length===plans.length)finish({...C.select(rows,profile),completed:true,reason:'complete'})};worker.postMessage({state,plan,items:config.itemBuilds,cases:profile.cases})})}catch(e){stop('worker-error')}
 });
}})(globalThis);
