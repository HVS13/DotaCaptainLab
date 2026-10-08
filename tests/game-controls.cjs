const assert=require('node:assert/strict');require('../rebuild/game-controls.js');const G=AdvisorGame;
function button(text,images=[],spans=[],disabled=false){return{innerText:text,disabled,getClientRects:()=>[{}],getAttribute:()=>null,querySelectorAll:s=>s==='img'?images.map(alt=>({alt})):s==='span'?spans.map(innerText=>({innerText})):[]}}
const doc=list=>({querySelectorAll:()=>list});
const card=button('Bane',['Bane']),confirm=button('BAN\nBane',['Bane']),disabled=button('Bane',['Bane'],[],true);
assert.equal(G.hero(doc([card,confirm,disabled]),'Bane'),card);assert.equal(G.confirm(doc([card,confirm]),'Bane','ban'),confirm);
assert.throws(()=>G.hero(doc([card,card]),'Bane'),/ambiguous/);assert.throws(()=>G.confirm(doc([confirm]),'Bane','pick'),/missing/);assert.throws(()=>G.confirm(doc([button('BAN Pudge',['Pudge'])]),'Bane','ban'),/missing/);
const q={title:'Tempo',optionA:{name:'Early game'},optionB:{name:'Late game'}},early=button('A Early game',[],['A','Early game']),late=button('B Late game',[],['B','Late game']);assert.equal(G.strategy(doc([early,late]),q,'b'),late);assert.throws(()=>G.strategy(doc([button('A Early game',[],['A','Early game'],true)]),q,'a'),/missing/);
const next=button('Continue');assert.equal(G.proceed(doc([next,button('Double Down'),button('Start Draft')])),next);assert.throws(()=>G.proceed(doc([next,next])),/ambiguous/);
console.log('Verified exact hero/confirmation matching, disabled and ambiguous controls, sequential options, and exact Continue scope.');

const clock={getClientRects:()=>[{}],innerText:'2:56',getAttribute:()=> 'Match drafts with prep countdown'};assert.equal(G.prepSeconds(doc([clock])),176);assert.equal(G.prepSeconds(doc([{...clock,getClientRects:()=>[]}])),null);

const page=content=>({body:{children:[{id:'game',innerText:content,getClientRects:()=>[{}]},{id:'dcl-advisor',innerText:'LIVE MATCH',getClientRects:()=>[{}]}]}});
assert.equal(G.prepStatus(page('Draft complete 5 Opening strategy…')),'opening');
assert.equal(G.prepStatus(page('Waiting for opponent They are finishing strategy — the match starts when both players continue.')),'locked');
assert.equal(G.prepStatus(page('Locking…')),'pending');
assert.equal(G.prepStatus(page('LIVE MATCH')),'started');
assert.equal(G.prepStatus(page('Continue')),null);

const slots=Array.from({length:6},(_,i)=>{const b=button('',['Item '+i]);b.title='Item '+i;b.querySelector=()=>({alt:'Item '+i});b.click=()=>b.clicked=true;return b});const select={getClientRects:()=>[{}],parentElement:doc(slots)};const itemDoc={querySelectorAll:selector=>selector.startsWith('select')?[select]:[]};assert.equal(G.setItem(itemDoc,1,'Hero',0,{name:'Item 0'}),'verified');assert.equal(G.setItem(itemDoc,1,'Hero',0,{name:'New item'}),'opened');assert.equal(slots[0].clicked,true);const chosen=button('New item',['New item']);chosen.click=()=>chosen.clicked=true;const dialog={getClientRects:()=>[{}],getAttribute:()=> 'Choose item for slot 1',querySelectorAll:()=>[chosen]};assert.equal(G.setItem({querySelectorAll:()=>[dialog]},1,'Hero',0,{name:'New item'}),'picked');assert.equal(chosen.clicked,true);

const hiddenRole={getClientRects:()=>[]},visibleRole={getClientRects:()=>[{}]};
assert.equal(G.roleControl(doc([hiddenRole,visibleRole]),1,'Hero'),visibleRole);
assert.throws(()=>G.roleControl(doc([visibleRole,visibleRole]),1,'Hero'),/ambiguous/);
assert.throws(()=>G.setSelect({options:[{value:'carry',disabled:true}]},'carry'),/taken/);
console.log('Verified hidden duplicate role controls and disabled taken-role rejection.');

(async()=>{
 const fs=require('node:fs'),vm=require('node:vm'),source=fs.readFileSync('rebuild/overlay.js','utf8'),fn=source.slice(source.indexOf(' async function autoStep('),source.indexOf(' // Keep movement'));
 let banner={yourTurn:false,enemyTurn:true},decisions=0,selections=0,confirmations=0;const nodes={};
 const context={auto:true,autoBusy:false,autoPhase:'draft',autoTurn:10,autoHero:null,state:{own:[],enemy:[],detected:true,side:'radiant',turn:11,sequence:Array.from({length:12},()=>({team:'radiant',action:'ban'}))},manual:false,choices:{},roleCorrections:{},document:{querySelector:()=>null},DC:{},$:id=>nodes[id]||(nodes[id]={}),scan:()=>{},readDraftSnapshot:()=>banner,stopAuto:message=>{context.auto=false;context.stopped=message},Advisor:{autoDecision:()=>{decisions++;return{id:1,score:10}},byId:new Map([[1,{localized_name:'Axe'}]])},AdvisorGame:{prepStatus:()=>null,hero:()=>({click:()=>selections++}),confirm:()=>({click:()=>confirmations++})}};
 vm.createContext(context);vm.runInContext(fn+';this.step=autoStep;',context);
 await context.step();assert.equal(context.auto,true);assert.equal(decisions,0);assert.match(nodes.autoStatus.textContent,/waiting.*verify/);
 banner={yourTurn:false,enemyTurn:false};await context.step();assert.equal(decisions,0);
 banner={yourTurn:true,enemyTurn:false};await context.step();assert.equal(decisions,1);assert.equal(context.autoPhase,'select');
 banner={yourTurn:true,enemyTurn:true};await context.step();assert.equal(context.auto,true);assert.equal(selections,0);
 banner={yourTurn:true,enemyTurn:false};await context.step();assert.equal(selections,1);assert.equal(context.autoPhase,'confirm');
 banner={yourTurn:false,enemyTurn:true};await context.step();assert.equal(confirmations,0);assert.equal(context.auto,true);
 banner={yourTurn:true,enemyTurn:false,selectedHero:1};await context.step();assert.equal(confirmations,1);assert.equal(context.autoPhase,'submitted');await context.step();assert.equal(confirmations,1);
 context.autoPhase='confirm';banner.selectedHero=2;await context.step();assert.equal(context.auto,false);assert.match(context.stopped,/Selected hero/);
 console.log('Verified opponent-to-own Turn 12 lag, blank/conflicting banners, resumed selection/confirmation, single submission and wrong-hero rejection.');
})().catch(error=>{console.error(error);process.exitCode=1});
