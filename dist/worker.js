importScripts('engine.js','model.js','general.js','quick-model.js');
self.onmessage=({data})=>{try{
 const {action,args}=data;let result;
 if(action==='quick')result=Lab.quickTeams(args);
 else if(action==='generalSearch')result=Lab.search({...args,limit:120});
 else if(action==='generalTest'){result=args.teams.map((t,i)=>({...t,overall:Lab.overall(t,args.context,(n,total)=>postMessage({progress:`Testing overall team ${i+1}/${args.teams.length} · opponent ${n}/${total}`}))})).sort(Lab.overallSort)}
 else if(action==='generalOptimize'){result=args.teams.map((t,i)=>({...Lab.optimizeGeneral(t,args.context,(n,total,p,count)=>postMessage({progress:`Optimizing team ${i+1}/${args.teams.length} · strategy ${n}/${total} · opponent ${p}/${count}`})),originalIndex:t.originalIndex})).sort(Lab.overallSort)}
 else if(action==='counters')result=Lab.counterSearch(args.team,args.context,(stage,i,total,n)=>postMessage({progress:stage==='screen'?`Counter screening ${i}/${total}`:`Counter lineup ${i}/${total} · strategy ${n}/64 · both sides`}));
 else if(action==='search')result=Lab.search(args);
 else if(action==='benchmark'){result=[];for(const [i,t]of args.teams.entries()){const benchmark=Lab.benchmark(t,args.enemy,tick=>postMessage({progress:`Testing team ${i+1}/${args.teams.length} · scenario ${tick}/6`}),args.enemyRoles);result.push({...t,benchmark})}result.sort((a,b)=>b.benchmark.wins-a.benchmark.wins||b.benchmark.meanNetworthLead-a.benchmark.meanNetworthLead)}
 else if(action==='run')result=Lab.run(args.team,args.enemy,args.enemyChoices,args.side,args.enemyRoles);
 else if(action==='plans')result=Lab.optimizePlans(args.team,args.enemy,args.enemyChoices,args.side,n=>postMessage({progress:`Testing strategy ${n}/64`}),args.enemyRoles);
 else if(action==='optimize')result=Lab.optimizeTeams(args.teams,args.enemy,args.enemyChoices,args.side,(i,total,n)=>postMessage({progress:`Auto optimizing team ${i}/${total} · strategy ${n}/64`}),args.enemyRoles);
 else throw Error('Unknown calculation.');
 if(['generalSearch','generalTest','generalOptimize'].includes(action))Lab.rankConsistency(result);
 postMessage({result});
}catch(e){postMessage({error:e.message})}};
