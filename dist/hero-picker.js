// Searchable comboboxes retain the existing select values and draft change handlers.
const heroPickers=[];
for(const select of document.querySelectorAll('[data-quick-role],#quickBan')){
 const role=select.dataset.quickRole,isBan=!role,name=isBan?'banned':L.names[role].split(' · ')[0],key=role||'ban';
 const label=select.closest('label'),wrap=document.createElement('div');wrap.className='heroPicker';
 const input=document.createElement('input');input.type='search';input.id=`hero-search-${key}`;input.placeholder=isBan?'Search hero to ban…':`Search ${name.toLowerCase()} hero…`;
 input.setAttribute('role','combobox');input.setAttribute('aria-label',isBan?'Search hero to ban':`Search ${name} heroes`);input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-expanded','false');input.setAttribute('aria-controls',`hero-options-${key}`);input.setAttribute('aria-haspopup','listbox');input.autocomplete='off';input.spellcheck=false;
 const clear=document.createElement('button');clear.type='button';clear.className='heroPickerClear';clear.textContent='×';clear.setAttribute('aria-label',isBan?'Clear ban search':`Clear ${name} pick`);
 const list=document.createElement('div');list.id=`hero-options-${key}`;list.className='heroPickerList';list.setAttribute('role','listbox');list.setAttribute('aria-label',isBan?'Heroes to ban':`${name} heroes`);list.hidden=true;
 const hint=document.createElement('p');hint.className='heroPickerHint';hint.setAttribute('role','status');hint.setAttribute('aria-live','polite');hint.hidden=true;
 wrap.append(input,clear,list,hint);label.after(wrap);label.htmlFor=input.id;select.hidden=true;select.setAttribute('aria-hidden','true');
 let matches=[],active=-1;
 const selectedText=()=>select.value?select.selectedOptions[0].textContent:'';
 function sync(){input.value=selectedText();clear.hidden=!input.value;input.disabled=select.disabled}
 function close(){list.hidden=true;hint.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1;sync()}
 function highlight(index){active=index;for(const [i,b]of Array.from(list.querySelectorAll('[role=option]')).entries()){b.classList.toggle('active',i===active);b.setAttribute('aria-selected',String(matches[i].value===select.value))}if(active>=0){const option=list.children[active];input.setAttribute('aria-activedescendant',option.id);option.scrollIntoView({block:'nearest'})}else input.removeAttribute('aria-activedescendant')}
 function render(){const query=input.value.trim().toLowerCase();matches=Array.from(select.options).filter(o=>o.value&&o.textContent.toLowerCase().includes(query));matches.sort((a,b)=>Number(b.textContent.toLowerCase().startsWith(query))-Number(a.textContent.toLowerCase().startsWith(query)));list.replaceChildren();active=-1;
  for(const [i,o]of matches.entries()){const b=document.createElement('button');b.type='button';b.id=`hero-option-${key}-${o.value}`;b.setAttribute('role','option');b.setAttribute('aria-selected',String(o.value===select.value));b.disabled=o.disabled;b.textContent=o.textContent+(o.disabled?' · unavailable':'');b.onpointerdown=e=>e.preventDefault();b.onclick=()=>choose(i);list.append(b)}
  hint.textContent=matches.length?`${matches.filter(o=>!o.disabled).length} available heroes · ↑ ↓ to browse, Enter to select`:'No matching heroes. Try another name.';hint.hidden=false;list.hidden=false;input.setAttribute('aria-expanded','true');input.removeAttribute('aria-activedescendant');clear.hidden=!input.value;
 }
 function choose(index){const option=matches[index];if(!option||option.disabled)return;select.value=option.value;close();select.dispatchEvent(new Event('change',{bubbles:true}));sync();input.focus()}
 input.onfocus=()=>{input.select();render()};input.oninput=render;
 input.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();close();return}if(e.key==='Tab'){close();return}if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(list.hidden)render();const direction=e.key==='ArrowDown'?1:-1;let index=active<0?(direction===1?-1:matches.length):active;do{index+=direction}while(index>=0&&index<matches.length&&matches[index].disabled);if(index>=0&&index<matches.length)highlight(index);return}if(e.key==='Enter'&&!list.hidden){e.preventDefault();const index=active>=0?active:matches.findIndex(o=>!o.disabled);choose(index)}};
 input.onblur=()=>{close()};clear.onpointerdown=e=>e.preventDefault();clear.onclick=()=>{if(select.value){select.value='';select.dispatchEvent(new Event('change',{bubbles:true}))}close();input.focus();input.value='';render()};
 heroPickers.push({sync,close});sync();
}
const previousQuickAvailable=quickAvailable;
quickAvailable=function(){previousQuickAvailable();for(const picker of heroPickers)picker.close()};
