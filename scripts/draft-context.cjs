// Research-only contextual variation. Thresholds are fixed before outcome testing.
const P=require('./draft-lookahead.cjs'),F=require('./draft-flexibility.cjs'),A=Advisor,D=DC;
function profile(s,choices,move,action){
 const next=action==='pick'?{...s,own:[...s.own,move.id],roles:{...s.roles,[move.id]:move.role}}:{...s,bans:[...s.bans,move.id]},filled=new Set(Object.values(A.assigned(s.own,s.roles))),open=A.roles.filter(r=>!filled.has(r));
 const survivors=action==='pick'?F.options(s,choices,move).survivors:open.map(role=>{const rows=A.recommend(next,'pick',choices,role);return Math.max(0,rows.filter(r=>r.score>=rows[0]?.score-1).length-1)});
 return{survivors,minimum:survivors.length?Math.min(...survivors):0,mean:survivors.length?survivors.reduce((a,b)=>a+b,0)/survivors.length:0,flex:action==='pick'?open.filter(r=>D.roles.aQ(A.byId.get(move.id),r)).length:0,coverage:A.coverage(next)};
}
function decision(game,turn,baseline,seed){
 const started=performance.now(),step=A.sequence[turn],s=P.state(game,step.team,turn),choices=P.plan(game,step.team),ranked=A.recommend(s,step.action,choices),base=ranked.find(r=>r.id===baseline.id),fallback=reason=>({move:baseline,changed:false,ms:performance.now()-started,simulations:0,reason});
 if(!base||step.action==='pick'&&s.own.length===4)return fallback('No alternative or final pick');
 const near=ranked.filter(r=>baseline.pool.includes(r.id)&&r.id!==base.id&&r.score>=ranked[0].score-1).slice(0,2),reference=profile(s,choices,base,step.action),components=['compositionFit','threatCoverage','synergyPotential','doctrineAlignment','timingFit'],capabilities=['disable','save','reach','siege','waveclear'];
 const candidates=near.filter(move=>{const p=profile(s,choices,move,step.action);return p.minimum>=reference.minimum&&p.mean>=reference.mean&&p.flex>=reference.flex&&components.every(k=>(move.components[k]||0)>=(base.components[k]||0)-.5)&&capabilities.every(k=>Math.min(1,p.coverage[k])>=Math.min(1,reference.coverage[k]))});
 if(!candidates.length)return fallback('Context filters rejected alternatives');
 // Future enemy locks/plans are unavailable. Prediction uses inferred roles and two preset openings.
 const other=step.team==='radiant'?'dire':'radiant',view=JSON.parse(JSON.stringify(game));view.roles[other]=A.assigned(view.teams[other]);
 const rows=[base,...candidates].map(move=>{const tests=[0,1].flatMap(i=>{view.openings[other]=i?D.presets.lateScale:D.presets.earlyAggro;return P.evaluateLeaf(P.continuation(view,turn,move,seed+i*104729),step.team)});return{move,...A.summarize({},tests)}}),b=rows[0],eligible=rows.slice(1).filter(r=>r.wins>=b.wins&&r.nw>=b.nw&&r.worstNW>=b.worstNW),pool=[b,...eligible],weights=pool.map(r=>Math.exp((r.move.score-Math.max(...pool.map(x=>x.move.score)))/1.75));
 const rng=P.random(seed+170003);let draw=rng()*weights.reduce((a,b)=>a+b,0),chosen=pool.at(-1);for(let i=0;i<pool.length;i++)if((draw-=weights[i])<=0){chosen=pool[i];break}
 return{move:chosen.move,changed:chosen.move.id!==baseline.id,ms:performance.now()-started,simulations:rows.length*6,eligible:eligible.length,training:rows.map(r=>({id:r.move.id,wins:r.wins,total:r.total,nw:r.nw,worstNW:r.worstNW})),reference};
}
module.exports={profile,decision};
