/* Madhav motion: native wheel/touch, Lenis section links, lightweight reveals. */
(() => {
  'use strict';
  if (window.MadhavMotion) return;
  const root=document.documentElement;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer=window.matchMedia('(hover: hover) and (pointer: fine)');
  const mobile=window.matchMedia('(max-width: 650px)');
  const ease='cubic-bezier(.16,1,.3,1)';
  const active=new Set(),revealed=new WeakSet(),observed=new WeakSet(),addedRoots=new Set();
  const revealSelector='.product-card,.ingredient-card,.section-head>div,.section-head>p,.story-copy,.story-art,.botanical-strip,.approach-grid>article,.formula-feature,.faq-list details,.connect-copy,.connect-form,.contact-grid>div';
  const preventSelector='dialog,[data-lenis-prevent],textarea,select,[contenteditable=""],[contenteditable="true"],.site-nav.is-open';
  let lenis=null,observer=null,mutation=null,headerObserver=null,importPromise=null;
  let suspended=false,destroyed=false,token=0,scanPending=false,frame=0,scrollFrame=0;
  let scrollTime=1,lastFrameTime=null,entranceDone=false;
  const cleanup=[];
  const listen=(node,type,fn,options)=>{node?.addEventListener(type,fn,options);cleanup.push(()=>node?.removeEventListener(type,fn,options));};
  const mediaListen=(media,fn)=>{if(media.addEventListener)listen(media,'change',fn);else{media.addListener(fn);cleanup.push(()=>media.removeListener(fn));}};
  function animate(node,frames,options={}){
    if(reduce.matches||destroyed||!node?.animate||!node.isConnected||active.size>=8)return;
    for(let parent=node;parent&&parent!==document.body;parent=parent.parentElement){
      if(parent.getAnimations?.().some(item=>item.animationName!=='madhav-reading-progress'&&(item.playState==='running'||item.playState==='pending')))return;
    }
    try{const animation=node.animate(frames,{duration:540,easing:ease,...options});active.add(animation);animation.finished.then(()=>active.delete(animation),()=>active.delete(animation));}catch{}
  }
  function cancelAnimations(){for(const animation of active)animation.cancel();active.clear();}
  function entrance(){
    if(entranceDone||destroyed)return;
    if(reduce.matches){entranceDone=true;return;}
    const groups=[
      ['.hero-copy>.eyebrow,.product-hero-copy>.eyebrow,.ingredient-hero .eyebrow,.cart-page-heading>.eyebrow',0,10],
      ['.hero-copy>h1,.product-hero-copy>h1,.ingredient-hero h1,.cart-page-heading>h1',65,20],
      ['.hero-intro,.product-hero-description,.ingredient-hero-copy,.cart-page-intro',140,14],
      ['.hero-actions,.product-shopping-actions',220,10],
      ['.hero-foot',280,8],
      ['.herbal-showcase,.product-gallery',100,18]
    ];
    let found=false;
    for(const [selector,delay,distance] of groups){
      const node=document.querySelector(selector);if(!node)continue;
      found=true;revealed.add(node);
      const bounds=node.getBoundingClientRect();
      if(bounds.bottom<0||bounds.top>window.innerHeight)continue;
      animate(node,[{opacity:.12,translate:`0 ${mobile.matches?distance*.6:distance}px`},{opacity:1,translate:'0 0'}],{duration:640,delay:mobile.matches?delay*.7:delay});
    }
    entranceDone=found;
  }
  function observeNode(node){
    if(!observer||observed.has(node)||revealed.has(node)||node.closest('dialog,[data-motion="off"],#cart-page-app'))return;
    observed.add(node);observer.observe(node);
  }
  function scan(){
    scanPending=false;if(destroyed)return;
    for(const node of addedRoots){
      if(!node.isConnected)continue;
      if(node.matches?.(revealSelector))observeNode(node);
      node.querySelectorAll?.(revealSelector).forEach(observeNode);
    }
    addedRoots.clear();if(!entranceDone)entrance();
  }
  function queueScan(){if(scanPending||destroyed)return;scanPending=true;frame=requestAnimationFrame(scan);}
  function setupReveals(){
    observer?.disconnect();observer=null;
    if(reduce.matches||!('IntersectionObserver' in window)||destroyed)return;
    observer=new IntersectionObserver(entries=>{
      const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
      visible.forEach((entry,index)=>{
        observer?.unobserve(entry.target);revealed.add(entry.target);
        if(entry.boundingClientRect.top<80||index>5)return;
        const distance=mobile.matches?12:22;
        animate(entry.target,[{opacity:.3,translate:`0 ${distance}px`},{opacity:1,translate:'0 0'}],{duration:560,delay:Math.min(index,3)*55});
      });
    },{threshold:.06,rootMargin:'0px 0px -16px 0px'});
    document.querySelectorAll(revealSelector).forEach(node=>{
      if(!revealed.has(node)&&!node.closest('dialog,[data-motion="off"],#cart-page-app')){observed.add(node);observer.observe(node);}
    });
  }
  function updateHeader(){
    const height=Math.ceil(document.querySelector('.site-header')?.getBoundingClientRect().height||0);
    root.style.setProperty('--madhav-scroll-offset',`${height+16}px`);
  }
  function modalOpen(){return Boolean(document.querySelector('dialog[open]'));}
  function stopFrames(){cancelAnimationFrame(scrollFrame);scrollFrame=0;lastFrameTime=null;}
  function advanceScroll(time){
    scrollFrame=0;
    if(!lenis||destroyed||suspended||document.hidden||modalOpen()){lastFrameTime=null;return;}
    // Advance this clock only during section jumps: idle time cannot skip a new animation.
    if(lastFrameTime!==null)scrollTime+=Math.max(0,time-lastFrameTime);
    lastFrameTime=time;lenis.raf(scrollTime);
    if(lenis.isScrolling==='smooth')scrollFrame=requestAnimationFrame(advanceScroll);
    else lastFrameTime=null;
  }
  function runScroll(){if(!scrollFrame){lastFrameTime=null;scrollFrame=requestAnimationFrame(advanceScroll);}}
  function interruptScroll(){if(!scrollFrame)return;stopFrames();lenis?.scrollTo(window.scrollY,{immediate:true});}
  function syncModal(){
    const open=modalOpen();root.classList.toggle('madhav-modal-open',open);
    if(open||document.hidden)stopFrames();
    if(lenis){if(open||document.hidden)lenis.stop();else lenis.start();}
  }
  function destroyLenis(){token++;stopFrames();if(lenis){lenis.destroy();lenis=null;}root.classList.remove('madhav-lenis-active');}
  async function setupLenis(){
    destroyLenis();const current=token;
    if(destroyed||suspended||reduce.matches||!pointer.matches)return;
    try{
      importPromise??=import('./vendor/lenis.mjs?v=1.3.26').catch(error=>{importPromise=null;throw error;});
      const {default:Lenis}=await importPromise;
      if(current!==token||destroyed||suspended||reduce.matches||!pointer.matches)return;
      lenis=new Lenis({
        autoRaf:false,autoResize:true,smoothWheel:false,syncTouch:false,
        // Do not attach Lenis's non-passive input listeners to the scrolling page.
        eventsTarget:document.createElement('div'),
        lerp:0,orientation:'vertical',gestureOrientation:'vertical',
        anchors:false,stopInertiaOnNavigate:false,allowNestedScroll:false,
        prevent:node=>Boolean(node.matches?.(preventSelector))
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
    if(lenis&&!modalOpen()){
      // A native gesture may have moved the page since Lenis last ran.
      if(!options.immediate){stopFrames();lenis.scrollTo(window.scrollY,{immediate:true});}
      lenis.scrollTo(target,{duration:.65,lerp:0,easing:t=>1-Math.pow(1-t,3),...options});
      if(!options.immediate)runScroll();return;
    }
    if(typeof target==='number')window.scrollTo({top:target,behavior:reduce.matches?'instant':'smooth'});
    else target?.scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'start'});
    options.onComplete?.();
  }
  function onLink(event){
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const anchor=event.target.closest?.('a[href]');
    if(!anchor||anchor.hasAttribute('download')||(anchor.target&&anchor.target!=='_self')||anchor.closest('dialog,[data-motion="off"]'))return;
    let url;try{url=new URL(anchor.href,location.href);}catch{return;}
    if(url.origin!==location.origin)return;
    if(url.pathname!==location.pathname||url.search!==location.search){interruptScroll();return;}
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
  function onFeedback(event){
    const button=event.target.closest?.('button[data-store-buy],button.store-add');
    if(!button||button.disabled||reduce.matches)return;
    const badge=document.querySelector('.store-badge'),before=badge?.textContent;
    const header=document.querySelector('[data-store-header-cart]'),headerBefore=header?.textContent;
    requestAnimationFrame(()=>{
      if(badge&&badge.textContent!==before)animate(badge,[{scale:1},{scale:1.3},{scale:1}],{duration:420});
      if(header&&header.textContent!==headerBefore)animate(header,[{opacity:.45,scale:.96},{opacity:1,scale:1}],{duration:360});
    });
  }
  function onDisclosure(event){
    const details=event.target;
    if(details.matches?.('.faq-list details[open]'))animate(details.querySelector('p'),[{opacity:0,translate:'0 -5px'},{opacity:1,translate:'0 0'}],{duration:300});
  }
  function onPreference(){if(reduce.matches)cancelAnimations();setupReveals();setupLenis();}
  function refreshFromHistory(){interruptScroll();queueScan();}
  function destroy(){
    if(destroyed)return;destroyed=true;destroyLenis();cancelAnimations();observer?.disconnect();mutation?.disconnect();headerObserver?.disconnect();cancelAnimationFrame(frame);addedRoots.clear();cleanup.forEach(fn=>fn());root.classList.remove('madhav-motion-ready','madhav-modal-open');root.style.removeProperty('--madhav-scroll-offset');
  }
  window.MadhavMotion={version:'20261023-polish',scrollTo,destroy,get state(){return {sectionScroll:Boolean(lenis),wheel:'native',scrollAnimating:Boolean(scrollFrame),activeAnimations:active.size,reducedMotion:reduce.matches,modalOpen:modalOpen()};}};
  function boot(){
    if(destroyed)return;root.classList.add('madhav-motion-ready');updateHeader();entrance();setupReveals();setupLenis();
    listen(document,'click',onLink);listen(document,'click',onTop,true);listen(document,'click',onFeedback,true);
    listen(document,'toggle',onDisclosure,true);
    listen(window,'wheel',interruptScroll,{passive:true});listen(window,'touchstart',interruptScroll,{passive:true});
    listen(window,'pointerdown',interruptScroll,{passive:true});
    listen(document,'keydown',event=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))interruptScroll();});
    listen(document,'madhav:languagechange',()=>{updateHeader();queueScan();});
    listen(document,'visibilitychange',syncModal);
    listen(window,'resize',updateHeader,{passive:true});
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
  }
  if(document.readyState==='loading')listen(document,'DOMContentLoaded',boot,{once:true});else boot();
})();
