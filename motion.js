/* Native scrolling and modal locking only. Visual feedback is short CSS transitions. */
(() => {
  'use strict';
  if(window.MadhavMotion)return;
  const root=document.documentElement;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const cleanup=[];let destroyed=false,modalObserver=null,headerObserver=null;
  const listen=(node,type,fn,options)=>{node?.addEventListener(type,fn,options);cleanup.push(()=>node?.removeEventListener(type,fn,options));};
  function updateHeader(){
    const height=Math.ceil(document.querySelector('.site-header')?.getBoundingClientRect().height||0);
    root.style.setProperty('--madhav-scroll-offset',`${height+16}px`);
  }
  function modalOpen(){return Boolean(document.querySelector('dialog[open]'));}
  function syncModal(){root.classList.toggle('madhav-modal-open',modalOpen());}
  function scrollTo(target,options={}){
    const behavior=reduce.matches||options.immediate?'instant':'smooth';
    if(typeof target==='number')window.scrollTo({top:target,behavior});
    else target?.scrollIntoView({behavior,block:'start'});
  }
  function destroy(){
    if(destroyed)return;destroyed=true;modalObserver?.disconnect();headerObserver?.disconnect();
    cleanup.forEach(fn=>fn());root.classList.remove('madhav-motion-ready','madhav-modal-open');root.style.removeProperty('--madhav-scroll-offset');
  }
  window.MadhavMotion={version:'20261023-calm',scrollTo,destroy,get state(){return {wheel:'native',lenis:false,reveals:false,reducedMotion:reduce.matches,modalOpen:modalOpen()};}};
  function boot(){
    if(destroyed)return;root.classList.add('madhav-motion-ready');updateHeader();syncModal();
    listen(document,'close',syncModal,true);listen(window,'resize',updateHeader,{passive:true});
    listen(document,'madhav:languagechange',updateHeader);listen(window,'pageshow',()=>{updateHeader();syncModal();});
    if('MutationObserver' in window){modalObserver=new MutationObserver(syncModal);modalObserver.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});}
    if('ResizeObserver' in window){headerObserver=new ResizeObserver(updateHeader);const header=document.querySelector('.site-header');if(header)headerObserver.observe(header);}
  }
  if(document.readyState==='loading')listen(document,'DOMContentLoaded',boot,{once:true});else boot();
})();
