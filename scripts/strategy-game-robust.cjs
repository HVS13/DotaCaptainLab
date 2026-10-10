// Offline expanded opponent game; own lineup/roles/items remain frozen.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
require('../dist/engine.js');require('../dist/solver.js');
const A=Advisor,root=path.join(__dirname,'../docs/research'),f=JSON.parse(fs.readFileSync(path.join(root,'strategy-game-fixture.json'),'utf8')),reference=JSON.parse(fs.readFileSync(path.join(root,'strategy-game-matrix.json'),'utf8')),hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'../dist/engine.js'))).digest('hex');
if(hash!==reference.engineSha256||JSON.stringify(A.plans)!==JSON.stringify(reference.plans))throw Error('Reference engine/plans changed; regenerate the reference first');
const candidates=[...A.opponentVariants(f.state)],role=candidates.find(v=>v.label==='Role swap: Puck / Timbersaw'),order=candidates.find(v=>v.label==='Faceless Void: swap purchases 1/2');
if(!role||!order)throw Error('Prespecified native alternatives unavailable');
const combined={label:'Puck / Timbersaw role swap + Faceless Void purchases 1/2',roles:role.roles,items:{...role.items,41:order.items[41]}},variants=[{label:'Reference inferred roles / default order',roles:f.enemyRoles,items:f.enemyItems},role,order,combined];
if(JSON.stringify(variants[0].roles)!==JSON.stringify(candidates[0].roles)||JSON.stringify(variants[0].items)!==JSON.stringify(candidates[0].items))throw Error('Reference no longer matches native inferred defaults');
if(process.argv[2]==='worker'){
 const v=Number(process.argv[3]),start=Number(process.argv[4]),cells=[];
 for(let i=start;i<start+16;i++)cells.push(A.plans.map(enemy=>A.simulate(f.state,A.plans[i],enemy,f.state.side,f.ownItems,variants[v])));
 process.send({v,start,cells});process.disconnect();
}else{
 const {fork}=require('node:child_process'),{solve}=require('./strategy-game.cjs'),started=performance.now(),tasks=variants.slice(1).flatMap((_,v)=>[0,16,32,48].map(start=>({v:v+1,start}))),parts=[];
 const run=task=>new Promise((resolve,reject)=>{let payload,errors='';const child=fork(__filename,['worker',String(task.v),String(task.start)],{silent:true,windowsHide:true});child.on('message',message=>payload=message);child.stderr.on('data',data=>errors+=data);child.on('error',reject);child.on('close',(code,signal)=>code===0&&payload?resolve(payload):reject(Error('Native worker failed '+code+'/'+signal+': '+errors)))});
 async function worker(){while(tasks.length){const task=tasks.shift();parts.push(await run(task));console.log(JSON.stringify({completedBlocks:parts.length,totalBlocks:12,elapsedMs:performance.now()-started}))}}
 Promise.all([worker(),worker(),worker(),worker()]).then(()=>{
  const generationMs=performance.now()-started,blocks=[reference.cells,...[1,2,3].map(v=>parts.filter(p=>p.v===v).sort((a,b)=>a.start-b.start).flatMap(p=>p.cells))],columns=variants.flatMap((v,variant)=>A.plans.map((choices,plan)=>({variant,plan,choices}))),cells=A.plans.map((_,i)=>blocks.flatMap(block=>block[i])),payoff=cells.map(row=>row.map(t=>Number(t.win)));
  if(cells.length!==64||cells.some(r=>r.length!==256))throw Error('Incomplete expanded table');
  const t=performance.now(),solution=solve(payoff),solveMs=performance.now()-t,old=JSON.parse(fs.readFileSync(path.join(root,'strategy-game-analysis.json'),'utf8')),evaluate=weights=>variants.map((v,k)=>{const returns=A.plans.map((_,j)=>weights.reduce((s,p,i)=>s+p*payoff[i][k*64+j],0));return{variant:v.label,lower:Math.min(...returns),uniformMean:returns.reduce((s,x)=>s+x,0)/64}}),base=payoff[old.baseline.index];
  const result={fixture:'strategy-game-fixture.json',engineSha256:hash,variants,plans:A.plans,columns,cells,payoff,solution,referenceMixture:evaluate(old.solution.row),robustMixture:evaluate(solution.row),baseline:{index:old.baseline.index,wins:base.reduce((s,x)=>s+x,0),total:256,worst:Math.min(...base)},pureMaximin:Math.max(...payoff.map(r=>Math.min(...r))),baselineDominatingRows:payoff.map((r,i)=>r.every((v,j)=>v>=base[j])?i:null).filter(i=>i!==null),support:solution.row.map((probability,index)=>({index,probability,choices:A.plans[index]})).filter(r=>r.probability>1e-9),newSimulations:12288,cachedReferenceCells:4096,workers:4,generationMs,solveMs,interpretation:'Four prespecified modeled enemy role/order variants, each with all 64 strategies. Conditional minimax utility, not real PvP probability. Own roles/items frozen; arbitrary custom enemy builds and other role assignments not covered. Offline Node processes, browser runtime unverified.'};
  fs.writeFileSync(path.join(root,'strategy-game-robust.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify({lower:solution.lower,upper:solution.upper,gap:solution.gap,support:result.support.length,referenceMixture:result.referenceMixture,robustMixture:result.robustMixture,generationMs,solveMs}));
 }).catch(e=>{console.error(e);process.exitCode=1});
}
