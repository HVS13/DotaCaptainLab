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
