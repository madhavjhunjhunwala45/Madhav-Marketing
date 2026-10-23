/* Native scrolling, modal locking and one brief entrance fade per page. */
(() => {
  'use strict';
  if(window.MadhavMotion)return;
  const root=document.documentElement;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const cleanup=[],imageAnimations=new Map();let destroyed=false,modalObserver=null,headerObserver=null,entered=false,entranceAnimation=null;
  const listen=(node,type,fn,options)=>{node?.addEventListener(type,fn,options);cleanup.push(()=>node?.removeEventListener(type,fn,options));};
  function updateHeader(){
    const height=Math.ceil(document.querySelector('.site-header')?.getBoundingClientRect().height||0);
    root.style.setProperty('--madhav-scroll-offset',`${height+16}px`);
  }
  function modalOpen(){return Boolean(document.querySelector('dialog[open]'));}
  function syncModal(){root.classList.toggle('madhav-modal-open',modalOpen());}
  function entrance(){
    if(entered||destroyed)return;
    const node=document.querySelector('.hero-copy,.product-hero-copy h1,.ingredient-hero h1,.cart-page-heading h1');
    if(!node)return;
    entered=true;
    if(reduce.matches||typeof node.animate!=='function')return;
    const bounds=node.getBoundingClientRect();
    if(bounds.bottom<0||bounds.top>window.innerHeight)return;
    // A single brief opacity change. No translation, scroll reveal or page overlay.
    entranceAnimation=node.animate([{opacity:.82},{opacity:1}],{duration:180,easing:'ease-out'});
    entranceAnimation.finished?.catch(()=>{});
  }
  function scrollTo(target,options={}){
    const behavior=reduce.matches||options.immediate?'instant':'smooth';
    if(typeof target==='number')window.scrollTo({top:target,behavior});
    else target?.scrollIntoView({behavior,block:'start'});
  }
  function imageFeedback(){
    // Only the two user-controlled product galleries; no scroll-wide observation.
    for(const selector of ['#spotlight-image','#product-image']){
      const node=document.querySelector(selector);if(!node)continue;
      listen(node,'load',()=>{
        imageAnimations.get(node)?.cancel();imageAnimations.delete(node);
        if(destroyed||reduce.matches||typeof node.animate!=='function')return;
        const bounds=node.getBoundingClientRect();if(bounds.bottom<0||bounds.top>window.innerHeight)return;
        const animation=node.animate([{opacity:.78},{opacity:1}],{duration:160,easing:'ease-out'});imageAnimations.set(node,animation);
        animation.finished?.then(()=>{if(imageAnimations.get(node)===animation)imageAnimations.delete(node);},()=>{});
      });
    }
  }
  function destroy(){
    if(destroyed)return;destroyed=true;modalObserver?.disconnect();headerObserver?.disconnect();
    entranceAnimation?.cancel();imageAnimations.forEach(animation=>animation.cancel());imageAnimations.clear();cleanup.forEach(fn=>fn());root.classList.remove('madhav-motion-ready','madhav-modal-open');root.style.removeProperty('--madhav-scroll-offset');
  }
  window.MadhavMotion={version:'20261024-micro',scrollTo,destroy,get state(){return {wheel:'native',lenis:false,reveals:false,reducedMotion:reduce.matches,modalOpen:modalOpen()};}};
  function boot(){
    if(destroyed)return;root.classList.add('madhav-motion-ready');updateHeader();syncModal();entrance();imageFeedback();
    if(!entered&&document.readyState!=='complete')listen(document,'DOMContentLoaded',entrance,{once:true});
    if(reduce.addEventListener)listen(reduce,'change',()=>{if(reduce.matches){entranceAnimation?.cancel();imageAnimations.forEach(animation=>animation.cancel());imageAnimations.clear();}});
    listen(document,'close',syncModal,true);listen(window,'resize',updateHeader,{passive:true});
    listen(document,'madhav:languagechange',updateHeader);listen(window,'pageshow',()=>{updateHeader();syncModal();});
    if('MutationObserver' in window){modalObserver=new MutationObserver(syncModal);modalObserver.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});}
    if('ResizeObserver' in window){headerObserver=new ResizeObserver(updateHeader);const header=document.querySelector('.site-header');if(header)headerObserver.observe(header);}
  }
  if(document.readyState==='loading')listen(document,'DOMContentLoaded',boot,{once:true});else boot();
})();
