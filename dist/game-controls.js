(function(root){
 const visible=el=>!!el&&!!el.getClientRects().length;
 const text=el=>(el.innerText||el.textContent||'').replace(/\s+/g,' ').trim();
 const buttons=doc=>Array.from(doc.querySelectorAll('button')).filter(b=>visible(b)&&!b.disabled&&b.getAttribute('aria-disabled')!=='true');
 function unique(list,label){if(list.length!==1)throw Error(label+' is missing or ambiguous.');return list[0]}
 function hero(doc,name){return unique(buttons(doc).filter(b=>Array.from(b.querySelectorAll('img')).some(img=>img.alt===name)&&! /^(BAN|PICK)(?:\s|$)/i.test(text(b))),'Hero '+name)}
 function confirm(doc,name,action){return unique(buttons(doc).filter(b=>(action==='ban'?/^BAN(?:\s|$)/i:/^PICK(?:\s|$)/i).test(text(b))&&(Array.from(b.querySelectorAll('img')).some(img=>img.alt===name)||text(b).toLowerCase()=== (action+' '+name).toLowerCase())),'Confirm '+action+' '+name)}
 function setSelect(el,value){if(!Array.from(el.options).some(o=>o.value===value))throw Error('Role option missing.');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,value);el.dispatchEvent(new Event('change',{bubbles:true}))}
 function roleControl(doc,id,name){let select=doc.getElementById('lineup-role-'+id);if(visible(select)&&!select.disabled)return select;const focus=unique(buttons(doc).filter(b=>(b.getAttribute('aria-label')||'').startsWith(name+', ')),'Role card '+name);focus.click();return null}
 function strategy(doc,question,value){const option=value==='a'?question.optionA:question.optionB;return unique(buttons(doc).filter(b=>{const spans=Array.from(b.querySelectorAll('span'));return spans.some(s=>text(s)===option.name)&&spans.some(s=>text(s)===value.toUpperCase())}),'Strategy '+question.title)}
 function prepSeconds(doc){for(const el of doc.querySelectorAll('[aria-label="Match drafts with prep countdown"],[aria-label^="Strategy prep,"]')){if(!visible(el))continue;const clock=((el.getAttribute('aria-label')||'')+' '+text(el)).match(/\b(\d{1,2}):(\d{2})\b/);if(clock)return Number(clock[1])*60+Number(clock[2])}return null}
 function prepStatus(doc){const content=Array.from(doc.body.children).filter(el=>el.id!=='dcl-advisor'&&visible(el)).map(text).join(' ');if(/\bLIVE MATCH\b/.test(content))return 'started';if(content.includes('They are finishing strategy')&&content.includes('Waiting for opponent'))return 'locked';if(/Starting match|Locking/.test(content))return 'pending';if(content.includes('Draft complete')&&content.includes('Opening strategy'))return 'opening';return null}
 function proceed(doc){return unique(buttons(doc).filter(b=>text(b)==='Continue'),'Continue')}
 root.AdvisorGame={visible,text,buttons,hero,confirm,setSelect,roleControl,strategy,prepSeconds,prepStatus,proceed};
})(typeof window==='undefined'?globalThis:window);
