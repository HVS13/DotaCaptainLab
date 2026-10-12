const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
require('../dist/engine.js');require('../dist/solver.js');
const D=DC,A=Advisor,blank={own:[],enemy:[],bans:[],roles:{},enemyRoles:{},side:'radiant',detected:true};
// Independent checks of the published hero-tag weights and coverage thresholds.
const axes={disable:{weight:1,target:1.8,threshold:.6},save:{weight:.9,target:1,threshold:.5},reach:{weight:.8,target:1.6,threshold:.6},siege:{weight:.8,target:1.5,threshold:.6},waveclear:{weight:.9,target:1.6,threshold:.5}};
for(let start=0;start<D.heroes.length;start++)for(let count=1;count<=5;count++){
 const heroes=Array.from({length:count},(_,i)=>D.heroes[(start+i)%D.heroes.length]),state={...blank,own:heroes.map(h=>h.id)},summary=A.coverageSummary(state),cap=A.coverage(state);
 for(const [key,{weight,target,threshold}]of Object.entries(axes)){
  const tagged=heroes.filter(h=>D.capabilities.lu(h).some(tag=>tag.key===key)).length,expected=Math.min(1,tagged*weight/target),axis=summary.axes.find(axis=>axis.key===key);
  assert(Math.abs(cap[key]-expected)<1e-12,`${key} value for ${state.own}`);
  assert.equal(axis.score,cap[key]);assert.equal(axis.covered,expected>=threshold);
  assert.equal(summary.gaps.some(gap=>gap.key===key),!axis.covered);
 }
}
const siegeHeroes=D.heroes.filter(h=>D.capabilities.lu(h).some(tag=>tag.key==='siege'));
const partial={...blank,own:[siegeHeroes[0].id]};
assert.equal(A.coverageSummary(partial).axes.find(a=>a.key==='siege').score.toFixed(2),'0.53');
assert(A.coverageSummary(partial).gaps.some(a=>a.key==='siege'));
assert(!A.coverageSummary({...partial,own:siegeHeroes.slice(0,2).map(h=>h.id)}).gaps.some(a=>a.key==='siege'));
const base=A.coverageSummary(partial);
for(const role of A.roles)assert.deepEqual(A.coverageSummary({...partial,roles:{[partial.own[0]]:role},enemy:D.heroes.slice(-5).map(h=>h.id),enemyChoices:D.presets.lateScale,itemBuilds:{}}),base);

// The live render must refresh partial gaps, not only manual changes.
const source=fs.readFileSync('rebuild/overlay.js','utf8'),render=source.slice(source.indexOf(' function render(){'),source.indexOf(' function renderContent(){')),nodes={};
const context={Advisor:A,DC:D,state:partial,manual:false,auto:false,tab:'pick',esc:String,renderContent:()=>{},$:id=>nodes[id]||(nodes[id]={value:id==='doctrine'?'teamfightRosh':'',classList:{add:()=>{throw Error('Render failed')}}})};
vm.createContext(context);vm.runInContext(render+';this.refresh=render;',context);
context.refresh();assert.match(nodes.gaps.textContent,/Below native coverage thresholds:.*Siege/);assert.match(nodes.coverage.innerHTML,/Siege coverage · below native threshold/);assert.match(nodes.coverage.innerHTML,/>0\.53</);assert.match(nodes.gaps.textContent,/not win probability/);
context.state={...blank,own:siegeHeroes.slice(0,2).map(h=>h.id)};context.refresh();assert(!/Below native coverage thresholds:.*Siege/.test(nodes.gaps.textContent));assert.match(nodes.coverage.innerHTML,/Siege coverage · covered/);
context.state=blank;context.refresh();assert.equal(nodes.gaps.textContent,'');
console.log(`Verified all five native tag formulas and thresholds across ${D.heroes.length*5} partial/full lineups, role/opponent/item independence, and live coverage warning updates.`);
