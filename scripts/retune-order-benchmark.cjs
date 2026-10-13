// Isolated paired test: only the order of selected-item strategy rechecks changes.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict'),B=require('./draft-pipeline.cjs'),P=require('./draft-lookahead.cjs'),S=require('./draft-personality-analysis.cjs'),A=Advisor;
const root=path.join(__dirname,'../docs/research'),protocol=JSON.parse(fs.readFileSync(path.join(root,'retune-order-protocol.json'))),source=fs.readFileSync(path.join(root,'strategy-challenger-overlay-v2.7.7.js'),'utf8').replace(/\r\n/g,'\n'),baseline=source.slice(source.indexOf(' async function optimize('),source.indexOf('\n function changed()'));
const oldLoop='for(const [i,plan]of Advisor.plans.entries()){if(JSON.stringify(plan)===JSON.stringify(best.choices))continue;',newLoop='for(const [i,plan]of ranked.map(row=>row.choices).entries()){if(JSON.stringify(plan)===JSON.stringify(best.choices))continue;',candidate=baseline.replace(oldLoop,newLoop);
assert.notEqual(candidate,baseline);assert.equal(candidate.replace(newLoop,oldLoop),baseline);
const hash=text=>crypto.createHash('sha256').update(text).digest('hex');
async function optimize(state,body){let clock=0,items=0,simulations=0;const nodes={},context={state,analysisMode:'fast',token:0,auto:false,config:null,sensitivity:null,JSON,Promise,Date:{now:()=>clock},setTimeout:callback=>callback(),$:id=>nodes[id]||(nodes[id]={}),renderContent:()=>{},Advisor:{...A,simulate:(...args)=>{clock++;simulations++;return A.simulate(...args)},itemCandidates:function*(saved,current){for(const row of A.itemCandidates(saved,current)){if(items>=protocol.itemCandidates)return;items++;yield row}}}};
 vm.createContext(context);vm.runInContext(body+';this.run=optimize;',context);
 const scenarios=A.scenarios(state,'fast').enemyPlans.length,deadline=(64+protocol.itemCandidates+protocol.retunedStrategies-1)*scenarios+.5;await context.run({deadline});
 assert.equal(context.config.screened,64);assert.equal(context.config.itemTests,protocol.itemCandidates);assert.equal(context.config.evaluated,protocol.retunedStrategies);
 return{config:JSON.parse(JSON.stringify(context.config)),simulations,deadline};
}
const start=Number(process.argv[2]||0),count=Number(process.argv[3]||protocol.drafts),results=[];
(async()=>{for(let index=start;index<start+count;index++){
 const seed=protocol.seedStart+index*104729,side=index%2?'dire':'radiant',opponentMode=protocol.opponents[Math.floor(index/2)%4],draft=B.draft(seed,side,'standard',opponentMode),state=P.state(draft.game,side,24),a=await optimize(state,baseline),b=await optimize(state,candidate);
 assert.deepEqual(a.config.itemBuilds,b.config.itemBuilds);assert.equal(a.simulations,b.simulations);
 const moves=draft.moves.filter(m=>m.team===side),styles={};for(const [style,row]of [['standard',a],['creative',b]])styles[style]={...B.holdout(state,row.config,seed+6900001),firstPick:moves.find(m=>m.action==='pick').id,firstBan:moves.find(m=>m.action==='ban').id};
 assert.deepEqual(styles.standard.profiles,styles.creative.profiles);
 results.push({index,seed,side,opponentMode,state,baseline:a,candidate:b,styles});fs.writeFileSync(path.join(root,'retune-order-part-'+start+'.json'),JSON.stringify({baselineHash:hash(baseline),candidateHash:hash(candidate),protocol:'retune-order-protocol.json',results},null,2));
 console.log(JSON.stringify({index,changed:JSON.stringify(a.config.choices)!==JSON.stringify(b.config.choices),wins:[styles.standard.wins,styles.creative.wins],severe:[styles.standard.severeLosses,styles.creative.severeLosses]}));
 }} )().catch(e=>{console.error(e);process.exitCode=1});
