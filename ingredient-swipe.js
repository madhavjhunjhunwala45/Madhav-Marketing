// Both directions open the profile; visible links remain the keyboard/tap equivalent.
window.MadhavIngredientSwipe = function attachIngredientSwipe(element,id) {
  if(!window.MadhavSwipe || !/^[a-z0-9-]+$/.test(id) || element.dataset.ingredientSwipe)return;
  element.dataset.ingredientSwipe=id;
  element.classList.add('ingredient-swipe-target');
  const open=()=>{
    const url=new URL('ingredients.html',location.href);
    url.searchParams.set('ingredient',id);
    const locale=window.MadhavI18n?.language;
    if(locale)url.searchParams.set('lang',locale);
    url.hash='ingredient-'+id;
    location.assign(url.href);
  };
  window.MadhavSwipe(element,open,open,{
    onMove(dx){element.classList.add('ingredient-is-swiping');element.style.setProperty('--ingredient-swipe-offset',Math.max(-22,Math.min(22,dx/4))+'px');},
    onEnd(){element.classList.remove('ingredient-is-swiping');element.style.removeProperty('--ingredient-swipe-offset');}
  });
};
document.querySelectorAll('.botanical-strip a[href*="ingredients.html?ingredient="]').forEach(link=>{
  window.MadhavIngredientSwipe(link,new URL(link.href,location.href).searchParams.get('ingredient'));
});
