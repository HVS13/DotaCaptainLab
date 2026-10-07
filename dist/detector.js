// Column pairings are the public DraftPage t0 layout. Numbers are sorted in the
// middle column, so their order alone cannot identify which hero belongs to a turn.
const DRAFT_PAIRS=[[0,null],[1,2],[4,3],[null,5],[null,6],[7,8],[9,null],[10,11],[13,12],[14,15],[17,16],[18,19],[20,21],[22,23]];
function decodeDraftSnapshot(snapshot,previous,DC,Advisor){
 const state={own:[],enemy:[],bans:[],ownBans:[],roles:{},enemyRoles:{},enemyChoices:{},side:null,turn:null,source:'automatic',detected:false};
 const byName=new Map(DC.heroes.map(h=>[h.localized_name.toLowerCase(),h.id]));
 if(snapshot.brief){state.side=snapshot.side||previous?.side||null;state.enemyChoices={...snapshot.axes};state.brief=true;return state}
 if(snapshot.completed){const names=snapshot.completed,ours=snapshot.owned?.length?snapshot.owned:Object.keys(snapshot.roles||{}).map(Number);state.side=snapshot.side||previous?.side||(ours.length&&ours.every(id=>names.radiant.includes(id))?'radiant':ours.length&&ours.every(id=>names.dire.includes(id))?'dire':null);if(!state.side)return null;state.own=names[state.side];state.enemy=names[state.side==='radiant'?'dire':'radiant'];state.bans=previous?.bans||[];state.ownBans=previous?.ownBans||[];state.roles=Object.fromEntries(Object.entries(snapshot.roles||{}).filter(([id])=>state.own.includes(+id)));state.enemyRoles=Object.fromEntries(Object.entries(snapshot.roles||{}).filter(([id])=>state.enemy.includes(+id)));state.enemyChoices=previous?.enemyChoices||{};state.detected=true;Advisor.validate(state);return state}
 if(snapshot.groups.length!==DRAFT_PAIRS.length)return null;
 const first=snapshot.groups[0],mirror=first.rightSlot&&!first.leftSlot;if(first.leftSlot===first.rightSlot)return null;
 const opener=mirror?'dire':'radiant';state.sequence=Advisor.sequence.map(s=>({...s,team:opener==='dire'?(s.team==='radiant'?'dire':'radiant'):s.team}));
 for(const [i,group]of snapshot.groups.entries()){
  const pair=DRAFT_PAIRS[i],expected=pair.filter(n=>n!==null).map(n=>n+1).sort((a,b)=>a-b);if(JSON.stringify(group.numbers)!==JSON.stringify(expected))return null;
  for(const [position,column]of ['left','right'].entries()){const index=pair[mirror?1-position:position];if(index===null)continue;const name=group[column],id=name?byName.get(name.toLowerCase()):null;if(name&&!id)return null;if(id){const step=state.sequence[index];if(step.action==='ban')state.bans.push(id);else(step.team==='radiant'?(state.radiant||(state.radiant=[])):(state.dire||(state.dire=[]))).push(id)} }
  if(group.current!==null)state.turn=group.current-1;
 }
 state.side=snapshot.side||previous?.side||null;
 if(state.turn!==null&&!state.side){const team=state.sequence[state.turn].team;if(snapshot.yourTurn)state.side=team;else if(snapshot.enemyTurn)state.side=team==='radiant'?'dire':'radiant'}
 if(!state.side)return null;
 state.own=state[state.side]||[];state.enemy=state[state.side==='radiant'?'dire':'radiant']||[];
 for(const [i,group]of snapshot.groups.entries())for(const [position,column]of ['left','right'].entries()){const index=DRAFT_PAIRS[i][mirror?1-position:position],id=group[column]?byName.get(group[column].toLowerCase()):null;if(index!==null&&id&&state.sequence[index].action==='ban'&&state.sequence[index].team===state.side)state.ownBans.push(id)}
 state.roles=Object.fromEntries(Object.entries(snapshot.roles||{}).filter(([id])=>state.own.includes(+id)));state.enemyRoles=Object.fromEntries(Object.entries(snapshot.roles||{}).filter(([id])=>state.enemy.includes(+id)));state.enemyChoices=previous?.enemyChoices||{};state.detected=true;Advisor.validate(state);return state;
}
function readDraftSnapshot(doc,DC){
 const text=Array.from(doc.body.children).filter(e=>e.id!=='dcl-advisor'&&e.getClientRects().length).map(e=>e.innerText||'').join('\n'),brief=!!Array.from(doc.querySelectorAll('h1')).find(e=>e.offsetParent&&e.textContent.trim()==='Scout briefing'),side=text.match(/Faction\s*(radiant|dire)/i)?.[1]?.toLowerCase()||null,axes={};
 if(brief)for(const q of DC.questions){const p=Array.from(doc.querySelectorAll('p')).find(e=>e.offsetParent&&e.textContent.trim()===q.title);const answer=p?.parentElement.querySelectorAll('p')[1]?.textContent.trim();if(answer===q.optionA.name)axes[q.id]='a';if(answer===q.optionB.name)axes[q.id]='b'}
 const grids=Array.from(doc.querySelectorAll('div[style]')).filter(e=>e.offsetParent&&(e.getAttribute('style')||'').includes('grid-template-columns: 1fr 36px 1fr')&&e.children.length===3&&e.children[1].querySelector('span'));
 const groups=grids.map(e=>{const middle=Array.from(e.children[1].querySelectorAll('span')),nums=middle.map(s=>Number(s.textContent)).filter(n=>n>=1&&n<=24);return{numbers:nums,left:e.children[0].querySelector('img')?.alt||null,right:e.children[2].querySelector('img')?.alt||null,leftSlot:!!e.children[0].querySelector('div[style*="width:"]'),rightSlot:!!e.children[2].querySelector('div[style*="width:"]'),current:Number(middle.find(s=>s.classList.contains('font-bold'))?.textContent)||null}});
 const roles={},owned=[],roleNames={Carry:'carry',Mid:'mid',Offlane:'offlane',Support:'support','Hard support':'hard_support','Soft support':'support','Hard Support':'hard_support'};
 for(const b of doc.querySelectorAll('button[aria-label]')){if(!b.offsetParent)continue;const label=b.getAttribute('aria-label'),name=label.split(',')[0],hero=DC.heroes.find(h=>h.localized_name===name),role=roleNames[label.split(',').slice(1).join(',').trim()];if(hero&&role)roles[hero.id]=role}
 for(const select of doc.querySelectorAll('select[id^="lineup-role-"]')){if(!select.offsetParent)continue;const id=Number(select.id.slice('lineup-role-'.length));if(DC.heroes.some(h=>h.id===id)){owned.push(id);if(['carry','mid','offlane','support','hard_support'].includes(select.value))roles[id]=select.value}}
 let completed=null;const byName=new Map(DC.heroes.map(h=>[h.localized_name,h.id]));for(const header of doc.querySelectorAll('[aria-label="Match drafts with prep countdown"],[aria-label="Radiant versus Dire"],[aria-label^="Strategy prep,"]')){if(!header.offsetParent)continue;const ids=Array.from(header.querySelectorAll('img')).map(img=>byName.get(img.alt||img.title||img.parentElement.title)).filter(Boolean);if(ids.length===10&&new Set(ids).size===10){completed={radiant:ids.slice(0,5),dire:ids.slice(5)};break}}
 return{brief,side,axes,groups,roles,owned,completed,lobby:Array.from(doc.querySelectorAll('button')).some(b=>b.textContent.trim()==='Start Draft'),yourTurn:/YOUR TEAM.S TURN|YOUR TURN|RESERVE TIME — (?:BAN|PICK) A HERO/i.test(text),enemyTurn:/OPPONENT.S TURN|OPPONENT TEAM.S TURN|ENEMY TEAM.S TURN/i.test(text)};
}
if(typeof module!=='undefined')module.exports={DRAFT_PAIRS,decodeDraftSnapshot};
