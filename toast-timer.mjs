// One timeout per visible notification. No animation-frame loop or interval.
export function createToastTimer({duration=5000,now=()=>performance.now(),schedule=setTimeout,cancel=clearTimeout,onState=()=>{},onExpire=()=>{}}={}){
 let active=false,remaining=duration,deadline=0,handle=null,generation=0;
 let pauses=new Set();
 const left=()=>active&&handle!==null?Math.max(0,deadline-now()):remaining;
 const state=()=>({active,remaining:left(),duration,running:active&&pauses.size===0});
 const publish=()=>onState(state());
 function disarm(){
  remaining=left();generation++;
  if(handle!==null)cancel(handle);
  handle=null;
 }
 function arm(){
  deadline=now()+remaining;const token=++generation;
  handle=schedule(()=>{
   if(token!==generation||!active||pauses.size)return;
   handle=null;remaining=0;active=false;publish();onExpire();
  },remaining);
  publish();
 }
 return {
  start(reasons=[]){disarm();active=true;remaining=duration;pauses=new Set(reasons);if(pauses.size)publish();else arm();},
  pause(reason){if(pauses.has(reason))return;if(active&&pauses.size===0)disarm();pauses.add(reason);publish();},
  resume(reason){if(!pauses.delete(reason))return;if(active&&pauses.size===0)arm();else publish();},
  dismiss(){disarm();active=false;remaining=duration;pauses.clear();publish();},
  get state(){return state();}
 };
}
