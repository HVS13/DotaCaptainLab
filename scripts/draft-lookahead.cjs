// Isolated research policy; never loaded by the userscript or production build.
require('../dist/engine.js');require('../dist/solver.js');
const A=Advisor,D=DC;
function random(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
function state(game,side,turn){const other=side==='radiant'?'dire':'radiant';return{own:game.teams[side],enemy:game.teams[other],roles:game.roles[side],enemyRoles:{},bans:game.bans,ownBans:game.ownBans[side],side,turn,sequence:A.sequence}}
function plan(game,side){return game.teams[side].length?A.bestPlan(state(game,side,0)):game.openings[side]}
function native(game,turn,rng){const step=A.sequence[turn];return A.autoDecision(state(game,step.team,turn),step.action,plan(game,step.team),rng)}
function apply(game,turn,move){const step=A.sequence[turn];if(step.action==='ban'){game.bans.push(move.id);game.ownBans[step.team].push(move.id)}else{game.teams[step.team].push(move.id);game.roles[step.team][move.id]=move.role}}
function continuation(game,turn,move,seed){game=JSON.parse(JSON.stringify(game));apply(game,turn,move);for(let t=turn+1;t<A.sequence.length;t++)apply(game,t,native(game,t,random(seed+t*7919)));return game}
function evaluateLeaf(game,side){const s=state(game,side,24),ours=plan(game,side),enemy=side==='radiant'?'dire':'radiant';return [D.presets.earlyAggro,D.presets.lateScale,D.presets.teamfightRosh].map(p=>A.simulate(s,ours,p,side,undefined,{roles:game.roles[enemy],items:Object.fromEntries(game.teams[enemy].map(id=>[id,D.builds.z8(id,game.roles[enemy][id])]))}))}
function decision(game,turn,baseline,seed){const started=performance.now(),step=A.sequence[turn],s=state(game,step.team,turn),ranked=A.recommend(s,step.action,plan(game,step.team)),candidates=[baseline];
 for(const row of ranked.filter(r=>baseline.pool.includes(r.id)).slice(0,2))if(!candidates.some(c=>c.id===row.id))candidates.push(row);
 if(candidates.length===1)return{move:baseline,changed:false,ms:performance.now()-started,simulations:0};
 // Prediction sees revealed heroes only, never the benchmark opponent's hidden role locks or opening.
 const other=step.team==='radiant'?'dire':'radiant',view=JSON.parse(JSON.stringify(game));view.roles[other]=A.assigned(view.teams[other]);
 const rows=candidates.map(move=>{const tests=[0,1].flatMap(profile=>{view.openings[other]=profile?D.presets.lateScale:D.presets.earlyAggro;return evaluateLeaf(continuation(view,turn,move,seed+profile*104729),step.team)});return{move,...A.summarize({},tests)}}),base=rows[0],eligible=rows.filter(r=>r.wins>base.wins&&r.worstNW>=base.worstNW).sort(A.compare),chosen=eligible[0]||base;
 return{move:chosen.move,changed:chosen.move.id!==baseline.id,ms:performance.now()-started,simulations:candidates.length*6,training:rows.map(r=>({id:r.move.id,wins:r.wins,total:r.total,nw:r.nw,worstNW:r.worstNW}))};
}
function draft(seed,testedSide,lookahead=false,opponentMode='weighted',policy=decision){const game={teams:{radiant:[],dire:[]},roles:{radiant:{},dire:{}},bans:[],ownBans:{radiant:[],dire:[]},openings:{radiant:A.openingPlan(random(seed+11)),dire:A.openingPlan(random(seed+47))}},moves=[];
 for(let turn=0;turn<A.sequence.length;turn++){const step=A.sequence[turn],rng=random(seed+turn*7919),baseline=native(game,turn,rng);let result={move:baseline,changed:false,ms:0,simulations:0};if(step.team===testedSide&&lookahead)result=policy(game,turn,baseline,seed+turn*31337+900001);else if(step.team!==testedSide&&opponentMode==='greedy'){const row=A.recommend(state(game,step.team,turn),step.action,plan(game,step.team))[0];if(row)result.move=row}apply(game,turn,result.move);moves.push({turn,team:step.team,action:step.action,id:result.move.id,baselineId:baseline.id,changed:result.changed,ms:result.ms,simulations:result.simulations})}
 return{game,moves};
}
function holdout(drafted,side,seed){const g=drafted.game,s=state(g,side,24),rng=random(seed),variants=Array.from(A.opponentVariants(s)),ours=plan(g,side),profiles=Array.from({length:16},()=>({plan:A.plans[Math.floor(rng()*64)],opponent:variants[Math.floor(rng()*variants.length)]})),tests=profiles.map(p=>A.simulate(s,ours,p.plan,side,undefined,p.opponent));return{...A.summarize(ours,tests),roles:s.roles,own:s.own,enemy:s.enemy}}
module.exports={random,state,plan,native,apply,continuation,evaluateLeaf,decision,draft,holdout};
