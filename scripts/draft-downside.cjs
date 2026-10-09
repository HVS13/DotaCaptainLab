// Research-only comparator. Wins remain first; worst NW precedes mean NW on ties.
const B=require('./draft-pipeline.cjs'),A=Advisor;
function compare(a,b){return b.wins-a.wins||b.worstNW-a.worstNW||b.nw-a.nw}
async function optimize(state,budget=100){const original=A.compare;A.compare=compare;try{return await B.optimize(state,budget)}finally{A.compare=original}}
module.exports={compare,optimize};
