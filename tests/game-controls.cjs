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
