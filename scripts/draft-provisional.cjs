// Research-only: native role inference replaces Auto's provisional intentions, never explicit user locks.
const P=require('./draft-lookahead.cjs'),S=require('./draft-personality.cjs'),A=Advisor;
function reassign(game,side,locks={}){game.roles[side]=A.assigned(game.teams[side],locks)}
function draft(seed,side,mode,locks={}){const game={teams:{radiant:[],dire:[]},roles:{radiant:{},dire:{}},bans:[],ownBans:{radiant:[],dire:[]},openings:{radiant:A.openingPlan(P.random(seed+11)),dire:A.openingPlan(P.random(seed+47))}},moves=[],roleEvents=[];let reassignments=0;
 for(let turn=0;turn<24;turn++){const step=A.sequence[turn],rng=P.random(seed+turn*7919);if(step.team===side)reassign(game,side,locks);const move=step.team===side||mode==='weighted'?P.native(game,turn,rng):mode==='greedy'?A.recommend(P.state(game,step.team,turn),step.action,P.plan(game,step.team))[0]:S.decision(game,turn,mode,rng),old={...game.roles[side]};P.apply(game,turn,move);if(step.team===side){reassign(game,side,locks);reassignments+=Object.keys(old).filter(id=>old[id]!==game.roles[side][id]).length;const intended={...old,...(step.action==='pick'?{[move.id]:move.role}:{})};for(const id of Object.keys(intended))if(intended[id]!==game.roles[side][id])roleEvents.push({turn,id:Number(id),newPick:!Object.hasOwn(old,id),intended:intended[id],assigned:game.roles[side][id]})}moves.push({turn,team:step.team,action:step.action,id:move.id,role:move.role})}
 return{game,moves,reassignments,roleEvents};
}
module.exports={reassign,draft};
