/* Madhav motion add-on. Lenis 1.3.26 is bundled locally under its MIT license. */
(() => {
  'use strict';
  if (window.MadhavMotion) return;
  const root=document.documentElement;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer=window.matchMedia('(hover: hover) and (pointer: fine)');
  const mobile=window.matchMedia('(max-width: 650px)');
  const active=new Set(),revealed=new WeakSet(),observed=new WeakSet(),addedRoots=new Set();
  const revealSelector='.product-card,.ingredient-card,.formula-feature,.faq-list details,.connect-form';
  // Swipe areas only own horizontal gestures; vertical scrolling must stay consistent.
  const preventSelector='dialog,[data-lenis-prevent],textarea,select,[contenteditable=""],[contenteditable="true"],.site-nav.is-open';
  let lenis=null,observer=null,mutation=null,headerObserver=null,importPromise=null;
  let suspended=false,destroyed=false,token=0,scanPending=false,frame=0;
  const cleanup=[];
  const listen=(node,type,fn,options)=>{node?.addEventListener(type,fn,options);cleanup.push(()=>node?.removeEventListener(type,fn,options));};
  const mediaListen=(media,fn)=>{if(media.addEventListener)listen(media,'change',fn);else{media.addListener(fn);cleanup.push(()=>media.removeListener(fn));}};
  function animate(node,frames,options){
    if(reduce.matches||destroyed||!node?.animate||!node.isConnected)return;
    // Leave the existing image, swipe and filter animations in charge when active.
    for(let parent=node;parent&&parent!==document.body;parent=parent.parentElement){
      if(parent.getAnimations?.().some(item=>item.playState==='running'||item.playState==='pending'))return;
    }
    try{const animation=node.animate(frames,{duration:280,easing:'cubic-bezier(.2,.75,.2,1)',...options});active.add(animation);animation.finished.then(()=>active.delete(animation),()=>active.delete(animation));}catch{}
  }
  function cancelAnimations(){for(const animation of active)animation.cancel();active.clear();}
  function observeNode(node){
    if(!observer||observed.has(node)||revealed.has(node)||node.closest('dialog,[data-motion="off"]'))return;
    observed.add(node);observer.observe(node);
  }
  function scan(){
    scanPending=false;if(destroyed)return;
    // Only inspect inserted elements, not the whole page after every counter/text update.
    for(const node of addedRoots){
      if(!node.isConnected)continue;
      if(node.matches?.(revealSelector))observeNode(node);
      node.querySelectorAll?.(revealSelector).forEach(observeNode);
    }
    addedRoots.clear();
  }
  function queueScan(){if(scanPending||destroyed)return;scanPending=true;frame=requestAnimationFrame(scan);}
  function setupReveals(){
    observer?.disconnect();observer=null;
    if(reduce.matches||!('IntersectionObserver' in window)||destroyed)return;
    observer=new IntersectionObserver(entries=>{
      const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
      visible.forEach((entry,index)=>{
        observer?.unobserve(entry.target);revealed.add(entry.target);
        if(entry.boundingClientRect.top<90||index>3)return;
        // One frame allows existing site observers to begin before conflict checking.
        requestAnimationFrame(()=>animate(entry.target,[{opacity:.82,translate:`0 ${mobile.matches?4:6}px`},{opacity:1,translate:'0 0'}]));
      });
    },{threshold:.08,rootMargin:'0px 0px -3% 0px'});
    // A new observer needs fresh registration; revealed content stays visible.
    document.querySelectorAll(revealSelector).forEach(node=>{if(!revealed.has(node)&&!node.closest('dialog,[data-motion="off"]')){observed.add(node);observer.observe(node);}});
  }
  function updateHeader(){
    const height=Math.ceil(document.querySelector('.site-header')?.getBoundingClientRect().height||0);
    root.style.setProperty('--madhav-scroll-offset',`${height+16}px`);
  }
  function modalOpen(){return Boolean(document.querySelector('dialog[open]'));}
  function syncModal(){
    const open=modalOpen();root.classList.toggle('madhav-modal-open',open);
    if(lenis){if(open||document.hidden)lenis.stop();else lenis.start();}
  }
  function destroyLenis(){token++;if(lenis){lenis.destroy();lenis=null;}root.classList.remove('madhav-lenis-active');}
  async function setupLenis(){
    destroyLenis();const current=token;
    if(destroyed||suspended||reduce.matches||!pointer.matches)return;
    try{
      importPromise??=import('./vendor/lenis.mjs?v=1.3.26').catch(error=>{importPromise=null;throw error;});
      const {default:Lenis}=await importPromise;
      if(current!==token||destroyed||suspended||reduce.matches||!pointer.matches)return;
      lenis=new Lenis({
        autoRaf:true,autoResize:true,smoothWheel:true,syncTouch:false,
        lerp:.2,wheelMultiplier:1,orientation:'vertical',gestureOrientation:'vertical',
        anchors:false,stopInertiaOnNavigate:false,allowNestedScroll:false,
        prevent:node=>Boolean(node.matches?.(preventSelector)),
        virtualScroll:({event,deltaX,deltaY})=>!event.defaultPrevented&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&Math.abs(deltaY)>=Math.abs(deltaX)
      });
      root.classList.add('madhav-lenis-active');syncModal();
    }catch{lenis=null;root.classList.remove('madhav-lenis-active');}
  }
  function focusTarget(target){
    if(!target?.focus)return;
    const temporary=!target.hasAttribute('tabindex')&&!target.matches('a,button,input,select,textarea,[contenteditable]');
    if(temporary){target.setAttribute('tabindex','-1');target.addEventListener('blur',()=>target.removeAttribute('tabindex'),{once:true});}
    target.focus({preventScroll:true});
  }
  function scrollTo(target,options={}){
    if(lenis&&!modalOpen()){lenis.scrollTo(target,{duration:.45,lerp:0,...options});return;}
    if(typeof target==='number'){window.scrollTo({top:target,behavior:reduce.matches?'instant':'smooth'});options.onComplete?.();}
    else{target?.scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'start'});options.onComplete?.();}
  }
  function onLink(event){
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const anchor=event.target.closest?.('a[href]');
    if(!anchor||anchor.hasAttribute('download')||(anchor.target&&anchor.target!=='_self')||anchor.closest('dialog,[data-motion="off"]'))return;
    let url;try{url=new URL(anchor.href,location.href);}catch{return;}
    if(url.origin!==location.origin)return;
    if(url.pathname!==location.pathname||url.search!==location.search){
      if(lenis)lenis.scrollTo(window.scrollY,{immediate:true});return;
    }
    if(!lenis||!url.hash)return;
    let id;try{id=decodeURIComponent(url.hash.slice(1));}catch{return;}
    const target=document.getElementById(id);if(!target&&id!=='top')return;
    event.preventDefault();updateHeader();
    if(url.hash!==location.hash){try{history.pushState(history.state,'',url.href);}catch{}}
    scrollTo(target||0,{onComplete:()=>focusTarget(target)});
  }
  function onTop(event){
    const button=event.target.closest?.('#back-top-button');
    if(!lenis||!button||button.disabled||event.button!==0)return;
    event.preventDefault();event.stopImmediatePropagation();scrollTo(0);
  }
  function onPreference(){
    if(reduce.matches)cancelAnimations();setupReveals();setupLenis();
  }
  function refreshFromHistory(){if(lenis)lenis.scrollTo(window.scrollY,{immediate:true});queueScan();}
  function destroy(){
    if(destroyed)return;destroyed=true;destroyLenis();cancelAnimations();observer?.disconnect();mutation?.disconnect();headerObserver?.disconnect();cancelAnimationFrame(frame);addedRoots.clear();cleanup.forEach(fn=>fn());root.classList.remove('madhav-motion-ready','madhav-modal-open');root.style.removeProperty('--madhav-scroll-offset');
  }
  window.MadhavMotion={version:'20261023-performance',scrollTo,destroy,get state(){return {smoothScroll:Boolean(lenis),reducedMotion:reduce.matches,modalOpen:modalOpen(),version:'1.3.26'};}};
  function boot(){
    if(destroyed)return;root.classList.add('madhav-motion-ready');updateHeader();setupReveals();setupLenis();
    listen(document,'click',onLink);listen(document,'click',onTop,true);
    listen(document,'madhav:languagechange',()=>{updateHeader();queueScan();});
    listen(document,'visibilitychange',syncModal);
    listen(window,'resize',()=>{updateHeader();queueScan();},{passive:true});
    listen(window,'popstate',()=>requestAnimationFrame(refreshFromHistory));
    listen(window,'pagehide',()=>{suspended=true;destroyLenis();});
    listen(window,'pageshow',()=>{suspended=false;setupLenis();queueScan();});
    mediaListen(reduce,onPreference);mediaListen(pointer,setupLenis);
    if('ResizeObserver' in window){headerObserver=new ResizeObserver(updateHeader);const header=document.querySelector('.site-header');if(header)headerObserver.observe(header);}
    if('MutationObserver' in window){mutation=new MutationObserver(records=>{
      if(records.some(record=>record.type==='attributes'))syncModal();
      for(const record of records)if(record.type==='childList')for(const node of record.addedNodes)if(node.nodeType===1)addedRoots.add(node);
      if(addedRoots.size)queueScan();
    });mutation.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open']});}
    // Animate a short heading/copy area, never a full-page layer or sticky container.
    requestAnimationFrame(()=>animate(document.querySelector('.hero-copy,.product-hero-copy,.ingredient-hero-copy,.cart-page-heading'),[{opacity:.9},{opacity:1}],{duration:200}));
  }
  if(document.readyState==='loading')listen(document,'DOMContentLoaded',boot,{once:true});else boot();
})();
