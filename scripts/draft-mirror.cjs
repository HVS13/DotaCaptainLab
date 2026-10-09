// Research-only fixed fourth scenario per own candidate: opponent copies that candidate's strategy.
const B=require('./draft-pipeline.cjs'),A=Advisor;
async function optimize(state,budget=100){const simulate=A.simulate,summarize=A.summarize;let mirrors=0;
 A.summarize=(choices,tests)=>{const mirror=simulate(state,choices,choices,state.side,currentItems);mirrors++;return summarize(choices,[...tests,mirror])};
 let currentItems;A.simulate=(...args)=>{currentItems=args[4];return simulate(...args)};
 try{const result=await B.optimize(state,budget);return{...result,simulations:result.simulations+mirrors,mirrors}}finally{A.simulate=simulate;A.summarize=summarize}
}
module.exports={optimize};
