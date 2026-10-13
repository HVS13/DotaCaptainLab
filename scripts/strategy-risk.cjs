// Bounded nonpreset strategy check. Native scores nominate neighbors; matched simulations choose.
(function(root,factory){if(typeof module==='object')module.exports=factory(globalThis.Advisor,require('./strategy-challenger.cjs'));else root.StrategyRisk=factory(root.Advisor,root.StrategyChallenger)})(globalThis,function(A,C){
 function shortlist(state,config){const neighbors=Object.keys(config.choices).map(key=>({...config.choices,[key]:config.choices[key]==='a'?'b':'a'}));neighbors.sort((a,b)=>A.nativeScore(state.own,b,state.roles)-A.nativeScore(state.own,a,state.roles));return[config.choices,...neighbors.slice(0,3)]}
 function profiles(state){const base=A.opponentVariants(state).next().value,variants=[base],plans=A.scenarios(state,'full').enemyPlans;return{variants,plans,cases:plans.map(choices=>({variant:0,choices,opponent:base}))}}
 async function prepare(state,{deadline,now=Date.now,yieldTask=()=>Promise.resolve(),cancelled=()=>false,onProgress=()=>{}}){
  const scope=A.scenarios(state,'fast'),rows=[];let builds=A.defaultBuilds(state),best=null,itemTests=0,passes=0;
  async function evaluate(plan,items,label){const tests=[];for(const enemyPlan of scope.enemyPlans)for(const side of scope.sides){await yieldTask();if(cancelled()||now()>=deadline)return null;onProgress(label);tests.push(A.simulate(state,plan,enemyPlan,side,items));if(cancelled()||now()>=deadline)return null}return{...A.summarize(plan,tests),itemBuilds:JSON.parse(JSON.stringify(items))}}
  for(const [i,plan]of A.plans.entries()){const result=await evaluate(plan,builds,`Risk preparation · initial strategy ${i+1}/64`);if(!result)break;rows.push(result)}
  if(cancelled())return null;rows.sort(A.compare);best=rows[0];
  if(best)for(let pass=0;pass<2;pass++){let improved=false;for(const candidate of A.itemCandidates(state,()=>builds)){if(itemTests>=30)break;const result=await evaluate(best.choices,candidate,`Risk preparation · item candidate ${itemTests+1}/30`);if(!result)break;itemTests++;if(A.compare(result,best)<0){best=result;builds=candidate;improved=true}}passes++;if(cancelled())return null;if(!improved||now()>=deadline)break}
  const changed=best&&JSON.stringify(best.itemBuilds)!==JSON.stringify(A.defaultBuilds(state));
  return{completed:rows.length,config:best?{...best,alternatives:changed?[best]:rows.slice(0,3),mode:'fast',evaluated:changed?1:rows.length,screened:rows.length,enemyPlanCount:scope.enemyPlans.length,refinement:null,itemTests,passes}:null};
 }
 function evaluate(state,config){const plans=shortlist(state,config),profile=profiles(state),rows=plans.map(plan=>profile.cases.map(c=>A.simulate(state,plan,c.choices,state.side,config.itemBuilds,c.opponent)));return{...C.select(rows,profile),completed:true,plans,profile,rows,simulations:plans.length*profile.cases.length}}
 return{shortlist,profiles,select:C.select,evaluate,prepare};
});
