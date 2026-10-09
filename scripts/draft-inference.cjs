// Research-only: align future-team leaf roles with the final optimizer's unknown-role input.
const P=require('./draft-lookahead.cjs'),O=require('./draft-override.cjs'),A=Advisor;
function evaluateLeaf(game,side){const s=P.state(game,side,24),ours=P.plan(game,side);return A.scenarios(s,'fast').enemyPlans.map(enemy=>A.simulate(s,ours,enemy,side))}
function decision(game,turn,baseline,seed){return O.decision(game,turn,baseline,seed,evaluateLeaf)}
module.exports={evaluateLeaf,decision};
