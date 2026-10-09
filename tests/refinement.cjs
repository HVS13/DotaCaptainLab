const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('rebuild/overlay.js','utf8'),fn=source.slice(source.indexOf(' async function optimize('),source.indexOf('\n function changed()'));
async function run({deadline=Infinity,known=0,mode='crosscheck',cancelAt=Infinity,items=false,sides=['radiant']}={}){
 let time=0,calls=[];const nodes={},plans=Array.from({length:64},(_,id)=>({id})),quick=[{id:0},{id:1},{id:2}],context={token:0,state:{},analysisMode:mode,auto:false,config:null,sensitivity:null,JSON,Promise,Date:{now:()=>time},setTimeout:cb=>{if(time>=cancelAt)context.token++;cb()},$:id=>nodes[id]||(nodes[id]={}),renderContent:()=>{},Advisor:{plans,defaultBuilds:()=>({item:0}),scenarios:(_,m)=>({enemyPlans:known?quick:m==='full'?plans:quick,sides,known}),simulate:(_,plan,enemy,side,builds)=>{time++;calls.push({plan:plan.id,enemy:enemy.id,side,item:builds.item});return {win:enemy.id<3||plan.id===62,nw:plan.id+builds.item}},summarize:(choices,tests)=>({choices,wins:tests.filter(t=>t.win).length,total:tests.length,nw:tests.reduce((s,t)=>s+t.nw,0)/tests.length}),compare:(a,b)=>b.wins-a.wins||b.nw-a.nw}};
 if(items)context.Advisor.itemCandidates=function*(){yield{item:1}};
 vm.createContext(context);vm.runInContext(fn+';this.run=optimize;',context);await context.run({deadline});return{context,calls};
}
(async()=>{
 const complete=await run();assert.equal(complete.context.config.choices.id,62);assert.equal(complete.context.config.total,64);assert.equal(complete.context.config.screened,64);assert.equal(complete.context.config.refinement.applied,true);assert.equal(complete.context.config.evaluated,3);assert.equal(complete.calls.length,384);assert(complete.context.config.alternatives.every(r=>r.total===64));
 const partial=await run({deadline:300});assert.equal(partial.context.config.choices.id,63);assert.equal(partial.context.config.total,3);assert.equal(partial.context.config.refinement.applied,false);assert.equal(partial.context.config.refinement.completed,1);assert(partial.context.config.alternatives.every(r=>r.total===3));
 const last=await run({deadline:384});assert.equal(last.context.config.refinement.applied,false,'The last native call cannot silently cross the deadline');
 const cancelled=await run({cancelAt:200});assert.equal(cancelled.context.config,null);
 const scouted=await run({known:1});assert.equal(scouted.calls.length,192);assert.equal(scouted.context.config.refinement,null);
 const quick=await run({mode:'fast'});assert.equal(quick.calls.length,192);assert.equal(quick.context.config.refinement,null);assert.equal(quick.context.config.choices.id,63);
 const full=await run({mode:'full'});assert.equal(full.calls.length,4096);assert.equal(full.context.config.refinement,null);
 const item=await run({items:true});assert.equal(item.context.config.itemBuilds.item,1);assert.equal(item.context.config.total,64);assert.equal(new Set(item.calls.filter(c=>c.item===1&&c.plan===62).map(c=>c.enemy)).size,64);assert(item.context.config.alternatives.every(r=>r.total===64));
 const both=await run({sides:['radiant','dire']});assert.equal(both.context.config.total,128);assert.equal(both.calls.length,768);
 console.log('Verified finalist reranking, matched strategy coverage for items/alternatives, full-scout and Thorough behavior, both factions, deadline rollback and cancellation.');
})().catch(e=>{console.error(e);process.exitCode=1});
