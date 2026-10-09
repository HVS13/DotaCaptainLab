(function(root){
 const visible=el=>!!el?.getClientRects().length,content=el=>(el.innerText||el.textContent||'').replace(/\s+/g,' ').trim();
 function read(doc,D){
  const names=new Map(D.heroes.map(h=>[h.localized_name,h.id])),ids=box=>Array.from(box.querySelectorAll('img')).map(img=>names.get(img.alt)).filter(id=>id!==undefined);
  const boxes=Array.from(doc.querySelectorAll('[aria-label^="Radiant:"],[aria-label^="Dire:"]')).filter(visible),ours=boxes.filter(b=>/your five.*click a hero below/i.test(content(b))),enemy=boxes.filter(b=>/locked five/i.test(content(b))),bans=Array.from(doc.querySelectorAll('[aria-label="Historical bans"]')).filter(visible);
  if(ours.length!==1||enemy.length!==1||bans.length!==1)return null;
  const side=ours[0].getAttribute('aria-label').split(':')[0].toLowerCase(),own=ids(ours[0]),opponent=ids(enemy[0]),blocked=ids(bans[0]),all=[...own,...opponent,...blocked];
  if(!['radiant','dire'].includes(side)||opponent.length!==5||own.length>5||new Set(all).size!==all.length)return null;
  const cards=Array.from(doc.querySelectorAll('button')).filter(b=>visible(b)&&!b.disabled&&!ours[0].contains(b)),available=new Map;
  for(const b of cards){const id=names.get(b.getAttribute('aria-label'))??names.get(b.querySelector('img')?.alt);if(id!==undefined&&!all.includes(id)){if(available.has(id))throw Error('Ambiguous Daily hero control.');available.set(id,b)}}
  const reference=doc.querySelector('a[aria-label^="View historical match source for"]')?.getAttribute('href');if(!reference)return null;
  return{own,enemy:opponent,bans:blocked,ownBans:[],roles:{},enemyRoles:{},enemyChoices:{},side,turn:null,source:'daily',detected:true,available,identity:JSON.stringify([side,opponent,blocked,reference])};
 }
 function choose(s,A,D,rng=Math.random){const unavailable=D.heroes.filter(h=>!s.available.has(h.id)&&!s.own.includes(h.id)&&!s.enemy.includes(h.id)&&!s.bans.includes(h.id)).map(h=>h.id),state={...s,bans:[...s.bans,...unavailable]};if(!s.available.size)throw Error('No available Daily heroes.');return A.autoDecision(state,'pick',A.bestPlan(state),rng)}
 function clearFilters(doc){const inputs=Array.from(doc.querySelectorAll('input')).filter(el=>visible(el)&&(el.placeholder||'').startsWith('Search heroes'));if(inputs.length!==1)throw Error('Daily search control could not be verified.');if(inputs[0].value){Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(inputs[0],'');inputs[0].dispatchEvent(new Event('input',{bubbles:true}))}
  const selects=Array.from(doc.querySelectorAll('select[aria-label="Filter by role"]')).filter(visible);if(selects.length!==1||!Array.from(selects[0].options).some(o=>o.value==='all'))throw Error('Daily role filter could not be verified.');if(selects[0].value!=='all'){selects[0].value='all';selects[0].dispatchEvent(new Event('change',{bubbles:true}))}
  const all=Array.from(doc.querySelectorAll('button[aria-label="Filter All"]')).filter(visible);if(all.length!==1)throw Error('Daily attribute filter could not be verified.');all[0].click();
 }
 function acknowledged(doc){return Array.from(doc.body.children).filter(el=>el.id!=='dcl-advisor'&&visible(el)).some(el=>/\bLIVE MATCH\b/.test(content(el))||/\b(?:Official|Guest) Daily result\b/.test(content(el)))}
 function controller({doc,D,A,now=Date.now,rng=Math.random,onStatus=()=>{},onStop=()=>{}}){let active=false,identity=null,expected=[],pending=null,actionAt=null,submitted=false,submittedAt=0,record=null;
  const stop=message=>{if(active){active=false;record.status=message;record.savedAt=new Date().toISOString();onStop(record)}onStatus(message)};
  function start(){const s=read(doc,D);if(!s)throw Error('Open an uncompleted Daily Challenge first.');identity=s.identity;expected=[...s.own];pending=null;actionAt=null;submitted=false;record={version:'2.7.3',mode:'daily',side:s.side,enemy:s.enemy,bans:s.bans,preservedPicks:[...s.own],selectedHeroes:[...s.own],submissionAcknowledged:false,method:'Native weighted pick heuristics using revealed enemies and available heroes; intended role balance only. Daily server assigns roles, strategy and items. No calibrated win probability.'};clearFilters(doc);active=true;onStatus('Auto Daily on · reading the available hero pool.');}
  function step(){if(!active)return;try{
   if(submitted){if(acknowledged(doc)){record.submissionAcknowledged=true;stop('Daily draft submitted; native simulation/result acknowledged.');return}if(now()-submittedAt>60000)throw Error('Daily submission was not acknowledged. Check the page; Auto will not submit again.');onStatus('Auto Daily on · submitted once; waiting for the match server.');return}
   const s=read(doc,D);if(!s||s.identity!==identity)throw Error('Daily challenge changed or its controls are unavailable.');
   if(pending){if(JSON.stringify(s.own)===JSON.stringify([...expected,pending.id])){expected=[...s.own];record.selectedHeroes=[...expected];pending=null;actionAt=null}else{if(JSON.stringify(s.own)!==JSON.stringify(expected))throw Error('Daily picks changed unexpectedly.');if(now()-pending.at>5000)throw Error('Daily hero selection was not acknowledged.');return}}
   if(JSON.stringify(s.own)!==JSON.stringify(expected))throw Error('Daily picks changed unexpectedly.');
   if(s.own.length===5){const buttons=Array.from(doc.querySelectorAll('button')).filter(b=>visible(b)&&!b.disabled&&/^lock draft & simulate vs \S/i.test(content(b)));if(buttons.length!==1)throw Error('Daily submission control could not be verified.');submitted=true;submittedAt=now();record.submittedHeroes=[...s.own];buttons[0].click();onStatus('Auto Daily on · submitting your verified five.');return}
   if(actionAt===null)actionAt=now()+Math.floor(rng()*1001);if(now()<actionAt){onStatus('Auto Daily on · next pick in '+((actionAt-now())/1000).toFixed(1)+'s.');return}
   const next=choose(s,A,D,rng);if(!next||!s.available.has(next.id))throw Error('No legal Daily recommendation.');pending={id:next.id,at:now()};s.available.get(next.id).click();onStatus('Auto Daily on · selecting '+A.byId.get(next.id).localized_name+'.');
  }catch(e){stop(e.message)}}
  return{start,step,stop,get active(){return active}};
 }
 function mount(doc,D,A){const host=doc.createElement('div');host.id='dcl-advisor';doc.body.append(host);const shadow=host.attachShadow({mode:'open'});shadow.innerHTML=`<style>:host{all:initial;position:fixed;right:16px;top:76px;z-index:2147483000;font:14px/1.5 system-ui;color:#e5edf4}*{box-sizing:border-box}.desk{width:370px;max-width:calc(100vw - 24px);max-height:80dvh;overflow:auto;background:#101923;border:1px solid #344351;border-radius:14px;padding:16px;box-shadow:0 18px 60px #0009}header .actions{display:flex;gap:5px}.move{cursor:grab;touch-action:none;user-select:none}.move:active{cursor:grabbing}.move:focus-visible{outline:2px solid #65d7bf;outline-offset:3px}#launch{width:44px;height:44px;min-height:44px;padding:0;margin:0;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:#173e35;border-color:#68c9ab;color:#d5ffef;box-shadow:0 8px 30px #0006}header{display:flex;justify-content:space-between;align-items:center}h2{font-size:17px;margin:0}small,p{color:#a0b2c1}p{font-size:12px}button{font:inherit;cursor:pointer;min-height:40px;border:1px solid #364a5c;border-radius:7px;background:#1b2936;color:#e5edf4;padding:8px 12px;margin:4px 0}button:focus-visible{outline:2px solid #65d7bf;outline-offset:2px}button:disabled{opacity:.5;cursor:default}#start{background:#224b42;border-color:#61c9a9}#status{color:#7ddfc1}[hidden]{display:none!important}</style><button id="launch" aria-label="Open Daily Advisor" title="Open Daily Advisor" hidden><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 20 6v6c0 4-4 7-8 9-4-2-8-5-8-9V6z"/><path d="m8 12 3 3 5-6"/></svg></button><section class="desk"><header><div id="move"><small>DOTACAPTAIN LAB · v2.7.3</small><h2>Daily Advisor</h2></div><div class="actions"><button id="positionReset" aria-label="Reset Daily advisor position" title="Reset position">↺</button><button id="minimize" aria-label="Minimize Daily advisor">−</button></div></header><p>Fills your five and submits once. Preserves existing picks, respects historical bans and unavailable heroes. Daily sets roles, strategy and items on its server.</p><button id="start">Start Auto Daily</button><p id="status" aria-live="polite">Loading Daily Challenge…</p><p id="lineup"></p><p>Native weighted suggestions, not a proven best lineup or win probability. Each new pick waits a random 0–1 second. Escape or a manual game click stops Auto. No automatic retries or next-day runs.</p><button id="download" disabled>Download Daily report</button></section>`;
  const $=id=>shadow.getElementById(id);let last=null;
  const auto=controller({doc,D,A,onStatus:message=>{$('status').textContent=message;$('start').textContent=auto.active?'Stop Auto Daily':'Start Auto Daily'},onStop:r=>{last=JSON.parse(JSON.stringify(r));$('download').disabled=false;try{localStorage.setItem('dcl-last-daily-record',JSON.stringify(last))}catch{}}});
  $('start').onclick=()=>{if(auto.active){auto.stop('Stopped.');return}try{auto.start()}catch(e){$('status').textContent=e.message}};
  $('download').onclick=()=>{if(!last)return;const url=URL.createObjectURL(new Blob([JSON.stringify(last,null,2)],{type:'application/json'})),link=doc.createElement('a');link.href=url;link.download='dotacaptain-daily-report.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
  $('minimize').onclick=()=>{shadow.querySelector('.desk').hidden=true;$('launch').hidden=false;keepPosition()};$('launch').onclick=()=>{shadow.querySelector('.desk').hidden=false;$('launch').hidden=true;keepPosition()};
  doc.addEventListener('pointerdown',e=>{if(auto.active&&e.isTrusted&&!e.composedPath().includes(host))auto.stop('Manual interaction in game.');},true);doc.addEventListener('keydown',e=>{if(e.key==='Escape'&&auto.active)auto.stop('Stopped with Escape.')});
 let position=null;
 function place(x,y){const box=host.getBoundingClientRect();position={x:Math.max(8,Math.min(x,Math.max(8,innerWidth-box.width-8))),y:Math.max(8,Math.min(y,Math.max(8,innerHeight-box.height-8)))};Object.assign(host.style,{left:position.x+'px',top:position.y+'px',right:'auto',bottom:'auto'})}
 function keepPosition(){if(position)place(position.x,position.y)}
 function savePosition(){try{localStorage.setItem('dcl-daily-position',JSON.stringify(position))}catch{}}
  const handle=$('move');handle.classList.add('move');handle.tabIndex=0;handle.setAttribute('role','button');handle.setAttribute('aria-label','Move Daily advisor. Drag or use arrow keys.');handle.title='Drag to move · arrow keys to move · Home to reset';$('positionReset').hidden=false;
  let suppressLaunchUntil=0;
  const openLauncher=$('launch').onclick;
  $('launch').onclick=e=>{if(e.detail>0&&Date.now()<suppressLaunchUntil)return;openLauncher(e)};
  $('launch').title='Click to open · drag to move';
  for(const target of [handle,$('launch')]){
   target.style.touchAction='none';target.style.userSelect='none';target.style.cursor='grab';
   let drag=null;
   target.onpointerdown=e=>{if(e.button!==0)return;const box=host.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:box.left,top:box.top,moved:false};target.setPointerCapture(e.pointerId);e.preventDefault()};
   target.onpointermove=e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<4)return;drag.moved=true;place(drag.left+dx,drag.top+dy)};
   target.onpointerup=e=>{if(drag&&e.pointerId===drag.id){if(drag.moved&&target===$('launch'))suppressLaunchUntil=Date.now()+400;drag=null;savePosition()}};
   target.onlostpointercapture=()=>{drag=null};target.onpointercancel=()=>{drag=null;savePosition()};
  }
  const resetPosition=()=>{position=null;for(const key of ['left','top','right','bottom'])host.style.removeProperty(key);try{localStorage.removeItem('dcl-daily-position')}catch{}};
  $('positionReset').onclick=resetPosition;
  handle.onkeydown=e=>{if(e.key==='Home'){e.preventDefault();resetPosition();return}const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!delta)return;e.preventDefault();const box=host.getBoundingClientRect(),step=e.shiftKey?40:10;place(box.left+delta[0]*step,box.top+delta[1]*step);savePosition()};
  doc.defaultView.addEventListener('resize',keepPosition);new ResizeObserver(keepPosition).observe(host);
  try{const saved=JSON.parse(localStorage.getItem('dcl-daily-position'));if(saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.y))requestAnimationFrame(()=>place(saved.x,saved.y))}catch{}

  const refresh=()=>{auto.step();try{const s=read(doc,D);$('start').disabled=!auto.active&&!s;$('lineup').textContent=s?`Your ${s.side} picks ${s.own.length}/5: ${s.own.map(id=>A.byId.get(id).localized_name).join(', ')||'none'}`:'';if(!auto.active&&!last)$('status').textContent=s?'Ready · start once to fill and submit this Daily Challenge.':'No uncompleted Daily draft detected.'}catch(e){if(auto.active)auto.stop(e.message);$('start').disabled=true}};setInterval(refresh,100);refresh();
 }
 root.AdvisorDaily={read,choose,clearFilters,acknowledged,controller,mount};
})(typeof window==='undefined'?globalThis:window);
