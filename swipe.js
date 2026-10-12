// Horizontal touch, pen, mouse-drag and trackpad gestures; vertical scrolling and zoom remain available.
window.MadhavSwipe = function installSwipe(stage, previous, next, options = {}) {
  let start, suppressClickUntil = 0, wheelLast=-Infinity,wheelTotal=0,wheelCommitted=false;
  const finish=()=>{start=undefined;stage.classList?.remove('swipe-is-dragging');options.onEnd?.();};
  stage.addEventListener('pointerdown',event=>{
    if (!event.isPrimary || (event.pointerType==='mouse' && (event.button??0)!==0)) {finish();return;}
    start={id:event.pointerId,x:event.clientX,y:event.clientY,axis:null,captured:false};
  });
  stage.addEventListener('pointermove',event=>{
    if(!start || start.id!==event.pointerId)return;
    const dx=event.clientX-start.x,dy=event.clientY-start.y;
    if(!start.axis && Math.abs(dy)>10 && Math.abs(dy)>Math.abs(dx)*1.2){finish();return;}
    if(Math.abs(dx)>10 && (start.axis==='horizontal' || Math.abs(dx)>Math.abs(dy)*1.2)){
      start.axis='horizontal';
      stage.classList?.add('swipe-is-dragging');
      // Capture only after a horizontal drag: ordinary taps still reach nested links/buttons.
      if(!start.captured){try {stage.setPointerCapture(event.pointerId);start.captured=true;} catch {}}
      options.onMove?.(dx);
    }
  });
  stage.addEventListener('pointerup',event=>{
    if (!start || start.id!==event.pointerId) return;
    const gesture=start;finish();
    const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
    if (Math.abs(dx)<36 || Math.abs(dx)<Math.abs(dy)*1.2) return;
    suppressClickUntil=event.timeStamp+500;
    if(dx<0) next();else previous();
  });
  stage.addEventListener('pointercancel',finish);
  stage.addEventListener('dragstart',event=>{if(start)event.preventDefault();});
  // A nested photo button releases its implicit capture when we capture the card.
  // Its bubbling lostpointercapture event must not cancel the card's gesture.
  stage.addEventListener('lostpointercapture',event=>{if(event.target===stage)finish();});
  stage.addEventListener('click',event=>{
    if(event.timeStamp<suppressClickUntil && (event.detail>0 || event.pointerType)){
      event.preventDefault();event.stopImmediatePropagation();
    }
  },true);
  stage.addEventListener('wheel',event=>{
    if(start || event.ctrlKey || event.metaKey)return;
    const scale=event.deltaMode===1?16:event.deltaMode===2?(stage.clientWidth||500):1;
    const dx=(event.deltaX || (event.shiftKey?event.deltaY:0))*scale;
    const dy=(event.shiftKey?0:event.deltaY)*scale;
    if(Math.abs(dx)<1 || Math.abs(dx)<Math.abs(dy)*1.4)return;
    if(event.cancelable!==false)event.preventDefault();
    if(event.timeStamp-wheelLast>180){wheelTotal=0;wheelCommitted=false;}
    wheelLast=event.timeStamp;
    if(wheelCommitted)return;
    wheelTotal+=dx;
    if(Math.abs(wheelTotal)<60)return;
    wheelCommitted=true;suppressClickUntil=event.timeStamp+500;
    // One selection per continuous trackpad gesture, including its momentum.
    if(wheelTotal>0)next();else previous();
  },{passive:false});
};
