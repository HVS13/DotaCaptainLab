// Native UI transitions need frames and animation completion events, both suspended when hidden.
(function(){
 if(window.DCLFrameClock)return;
 const request=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window),pending=new Map(),animations=new Set(),delivered=new WeakSet();let active=false,last=0;
 window.requestAnimationFrame=callback=>{if(typeof callback!=='function')return request(callback);const id=request(time=>{if(!pending.has(id))return;pending.delete(id);callback.call(window,time)});pending.set(id,callback);return id};
 window.cancelAnimationFrame=id=>{pending.delete(id);cancel(id)};
 window.DCLFrameClock={installPhase:document.readyState,start(){active=true;last=0},stop(){active=false;animations.clear()},state(){return{active,pending:pending.size,lastFrameAt:last}},pump(){
  if(!active||!document.hidden)return;
  const time=performance.now();if(time-last<16)return;last=time;
  // Retain running animations: finished transitions can disappear from getAnimations before onfinish fires.
  for(const animation of document.getAnimations())animations.add(animation);
  for(const animation of animations){
   if(animation.playState==='idle'){animations.delete(animation);continue}
   if(animation.playState!=='finished'){delivered.delete(animation);continue}
   animations.delete(animation);
   if(!delivered.has(animation)&&typeof animation.onfinish==='function'){
    delivered.add(animation);
    animation.dispatchEvent(new AnimationPlaybackEvent('finish',{currentTime:animation.currentTime,timelineTime:animation.timeline?.currentTime??null}));
   }
  }
  const batch=[...pending];
  for(const [id,callback]of batch){if(!pending.has(id))continue;cancel(id);queueMicrotask(()=>{if(!pending.has(id))return;pending.delete(id);callback.call(window,time)})}
 }};
})();
