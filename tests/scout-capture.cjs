const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');require('../dist/engine.js');require('../rebuild/solver.js');
const {DRAFT_PAIRS,readDraftSnapshot,decodeDraftSnapshot}=require('../rebuild/detector.js'),D=DC,A=Advisor;
function paragraph(text,visible=true){return{textContent:text,innerText:text,offsetParent:visible?{}:null,getClientRects:()=>visible?[{}]:[],parentElement:null}}
// Native tg cards: two paragraphs, title then selected option. PvP tw passes choices:null.
function briefDocument(choices={},hidden={},headline='Scout briefing'){
 const heading=paragraph(headline),paras=[paragraph('Faction radiant')];for(const q of D.questions){if(!choices[q.id]&&!hidden[q.id])continue;const value=choices[q.id]||hidden[q.id],visible=!!choices[q.id],label=paragraph(q.title,visible),answer=paragraph(value==='a'?q.optionA.name:q.optionB.name,visible),card={querySelectorAll:()=>[label,answer]};label.parentElement=card;answer.parentElement=card;paras.push(label,answer)}
 return{body:{children:[{id:'native',innerText:'Faction radiant',getClientRects:()=>[{}]}]},querySelectorAll:selector=>selector==='h1'?[heading]:selector==='p'?paras:[]};
}
const full=readDraftSnapshot(briefDocument(D.presets.lateScale),D);assert.equal(full.brief,true);assert.deepEqual(full.axes,D.presets.lateScale);
const captured=decodeDraftSnapshot(full,null,D,A);assert.deepEqual(captured.enemyChoices,D.presets.lateScale);
const partial=readDraftSnapshot(briefDocument({early_late:'a'}),D),revised=decodeDraftSnapshot(partial,captured,D,A);
assert.deepEqual(revised.enemyChoices,{...D.presets.lateScale,early_late:'a'},'A partial read of the same briefing must preserve previously observed axes.');
const empty=readDraftSnapshot(briefDocument(),D);assert.deepEqual(decodeDraftSnapshot(empty,revised,D,A).enemyChoices,revised.enemyChoices);
const hidden=readDraftSnapshot(briefDocument({},D.presets.earlyAggro),D);assert.deepEqual(hidden.axes,{});
const pvp=decodeDraftSnapshot(empty,null,D,A);assert.deepEqual(pvp.enemyChoices,{});assert.equal(A.scenarios(pvp).known,0);
const onlyTempo=decodeDraftSnapshot(partial,null,D,A);assert.deepEqual(onlyTempo.enemyChoices,{early_late:'a'});assert.equal(A.scenarios(onlyTempo).enemyPlans.length,32);
const generic=briefDocument(),genericQuery=generic.querySelectorAll;generic.querySelectorAll=selector=>selector==='p'?[paragraph('Teamfight & Rosh: pit and objective control'),...genericQuery(selector)]:genericQuery(selector);assert.deepEqual(readDraftSnapshot(generic,D).axes,{});
const groups=DRAFT_PAIRS.map(pair=>({numbers:pair.filter(n=>n!==null).map(n=>n+1).sort((a,b)=>a-b),left:null,right:null,leftSlot:pair[0]!==null,rightSlot:pair[1]!==null,current:pair.includes(0)?1:null}));
const drafting=decodeDraftSnapshot({groups,roles:{},side:'radiant'},revised,D,A);assert.deepEqual(drafting.enemyChoices,revised.enemyChoices);
const own=D.heroes.slice(0,5).map(h=>h.id),enemy=D.heroes.slice(5,10).map(h=>h.id),prep=decodeDraftSnapshot({completed:{radiant:own,dire:enemy},roles:{},groups:[]},drafting,D,A);
assert.deepEqual(prep.enemyChoices,revised.enemyChoices);assert.equal(A.scenarios(prep).known,6);assert.equal(A.scenarios(prep).enemyPlans.length,1);
// A new briefing after an active draft must not merge the earlier run's scout.
assert.deepEqual(decodeDraftSnapshot(empty,prep,D,A).enemyChoices,{});
// Exercise the real scanner's lobby reset and subsequent unscouted PvP transition.
let snapshot={brief:false,lobby:true,groups:[]};const source=fs.readFileSync('rebuild/overlay.js','utf8'),nodes={},context={document:{hidden:false},manual:false,auto:false,autoPhase:'draft',state:captured,lastDetected:captured,lastKey:'previous',roleCorrections:{},observedRoles:{},autoDetectionLostAt:null,DC:D,Advisor:A,AdvisorGame:{prepStatus:()=>null},readDraftSnapshot:()=>snapshot,decodeDraftSnapshot,$:id=>nodes[id]||(nodes[id]={classList:{remove:()=>{}}}),changed:()=>{},Date,stopAuto:()=>{}};
vm.createContext(context);vm.runInContext(source.slice(source.indexOf(' function scan()'),source.indexOf(' const observer='))+';this.run=scan;',context);context.run();assert.equal(context.lastDetected,null);assert.equal(context.state.brief,false);snapshot=empty;context.run();assert.equal(Object.keys(context.state.enemyChoices).length,0);snapshot={groups,roles:{},side:'radiant'};context.run();assert.equal(Object.keys(context.state.enemyChoices).length,0);
const status=source.match(/\$\('status'\)\.textContent=([^;]+);/)[1];assert.equal(vm.runInNewContext(status,{manual:false,state:pvp,step:null}),'Seat detected · enemy strategy unknown');assert.equal(vm.runInNewContext(status,{manual:false,state:captured,step:null}),'Scout captured · waiting for the draft');
console.log('Verified native-shaped visible/hidden scout cards, partial/empty same-brief preservation, draft/prep conditioning, unknown PvP inputs and new-run reset.');
