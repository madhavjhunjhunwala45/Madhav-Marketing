const catalogue = window.productCatalogue;
const groupNames = {pain: 'Joint & muscle care', digestion: 'Digestive wellbeing', metabolic: 'Metabolic wellness', heart: 'Heart care', piles: 'Piles & fissure care'};
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionEasing = 'cubic-bezier(.22,.68,0,1)';
function softReveal(element, distance = 8, delay = 0) {
  if (reducedMotion.matches || typeof element.animate !== 'function') return;
  element.getAnimations?.().forEach(animation => animation.cancel());
  return element.animate([{opacity:.35,transform:'translateY('+distance+'px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,delay,easing:motionEasing});
}
// Measure before and after filtering so surviving cards move gently into place.
function changeGrid(container, update) {
  if (reducedMotion.matches || typeof container.animate !== 'function') {update();return;}
  const before = new Map();
  Array.from(container.children).forEach(card => {
    card.getAnimations?.().forEach(animation => animation.cancel());
    if (!card.hidden) before.set(card,card.getBoundingClientRect());
  });
  update(); let order = 0;
  // Finish geometry reads before starting any animations, avoiding repeated layouts.
  const after = Array.from(container.children).filter(card => !card.hidden)
    .map(card => ({card, now:card.getBoundingClientRect()}));
  for (const {card,now} of after) {
    if (now.bottom < 0 || now.top > window.innerHeight) continue;
    const old=before.get(card);
    if (old) {
      const x=old.left-now.left,y=old.top-now.top;
      if (Math.abs(y)>window.innerHeight) softReveal(card,5);
      else if (x || y) card.animate([{transform:'translate('+x+'px,'+y+'px)'},{transform:'translate(0,0)'}],{duration:280,easing:motionEasing});
    } else softReveal(card,5,Math.min(order++ * 20,60));
  }
}
// Respect a motion preference changed while the page is already open.
reducedMotion.addEventListener('change',event=>{
  if(event.matches) document.getAnimations?.().forEach(animation=>animation.cancel());
});
function amazonDestination(product, format = product) {
  const directUrl = format.amazonUrl || product.amazonUrl;
  const query = format.amazonSearch || product.amazonSearch || 'Madhav Marketing ' + product.title + ' ' + format.pack;
  return {url: directUrl || 'https://www.amazon.in/s?k=' + encodeURIComponent(query), direct: Boolean(directUrl)};
}
function makeAmazonLink(product, format = product) {
  const destination = amazonDestination(product, format);
  const link = document.createElement('a');link.href = destination.url;link.target = '_blank';link.rel = 'noopener noreferrer';link.className = 'amazon-link';
  link.textContent = (destination.direct ? 'View on Amazon' : 'Search on Amazon') + ' ↗';
  link.setAttribute('aria-label', (destination.direct ? 'View ' : 'Search for ') + product.title + ', ' + format.pack + ' on Amazon (opens in a new tab)');
  return link;
}
function makeProductCard(id, product) {
  const card = document.createElement('article');
  card.className = 'product-card'; card.dataset.group = product.group;
  const imageLink = document.createElement('a'); imageLink.className = 'product-card-image'; imageLink.href = 'product.html?product=' + encodeURIComponent(id);
  const image = document.createElement('img'); image.src = product.image; image.alt = product.title + ', ' + product.pack; image.loading = 'lazy'; image.decoding = 'async'; image.width = 500; image.height = 550;
  const chip = document.createElement('span'); chip.className = 'pack-chip'; chip.textContent = product.packOverview || product.pack;
  imageLink.append(image, chip);
  const body = document.createElement('div'); body.className = 'product-card-content';
  const category = document.createElement('p'); category.className = 'product-type'; category.textContent = groupNames[product.group];
  const title = document.createElement('h3'); const titleLink = document.createElement('a'); titleLink.href = imageLink.href; titleLink.textContent = product.displayTitle || product.title; title.append(titleLink);
  const description = document.createElement('p'); description.className = 'product-blurb'; description.textContent = product.benefits || product.blurb;
  const link = document.createElement('a'); link.href = imageLink.href; link.className = 'product-link'; link.append(document.createTextNode('Explore product')); const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden','true'); link.append(arrow);
  const actions=document.createElement('div');actions.className='product-card-actions';actions.append(link,makeAmazonLink(product));
  body.append(category, title, description, actions); card.append(imageLink, body); return card;
}
const grid = document.getElementById('product-grid');
if (grid) {
  for (const [id, product] of Object.entries(catalogue)) grid.append(makeProductCard(id, product));
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter; let count = 0;
    document.querySelectorAll('[data-filter]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    changeGrid(grid,()=>grid.querySelectorAll('.product-card').forEach(card => { card.hidden = filter !== 'all' && filter !== card.dataset.group; if (!card.hidden) count++; }));
    document.getElementById('product-count').textContent = count + (count === 1 ? ' product' : ' products');
  }));
}
const menu = document.querySelector('.menu-toggle'); const nav = document.getElementById('site-nav');
function closeMenu() { if (menu && nav) {menu.setAttribute('aria-expanded','false'); menu.querySelector('.sr-only').textContent = 'Open navigation'; nav.classList.remove('is-open');} }
if (menu && nav) {
  menu.addEventListener('click', () => {const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded',String(open)); menu.querySelector('.sr-only').textContent = open ? 'Close navigation' : 'Open navigation'; nav.classList.toggle('is-open',open);});
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => {if(e.key==='Escape') closeMenu();});
  document.addEventListener('click',e=>{if(!e.target.closest('.site-header')) closeMenu();});
  window.matchMedia('(min-width: 901px)').addEventListener('change', e=>{if(e.matches)closeMenu();});
}
const year = document.getElementById('year'); if (year) year.textContent = new Date().getFullYear();

// Animate only after the requested image is ready; request tokens prevent a late load from replacing a newer selection.
function changeImage(image, source, alt) {
  const request = (image._loadRequest || 0) + 1;
  image._loadRequest = request;
  if (image.getAttribute('src') === source) { image.alt = alt; image.removeAttribute('aria-busy'); return; }
  image.setAttribute('aria-busy', 'true');
  const preload = new Image();
  preload.onload = () => {
    if (image._loadRequest !== request) return;
    if (typeof image.getAnimations === 'function') image.getAnimations().forEach(animation => animation.cancel());
    image.src = source; image.alt = alt; image.removeAttribute('aria-busy');
    softReveal(image,5);
  };
  preload.onerror = () => {if (image._loadRequest === request) {image.removeAttribute('aria-busy'); image.src = source; image.alt = alt;}};
  preload.src = source;
}
const spotlight = document.getElementById('spotlight-image');
if (spotlight) {
  // Keep the original opening products, then include the complete catalogue.
  const featured = [...new Set(['hriday-rakshak','madhumeh-premium','dard-oil',...Object.keys(catalogue)])]
    .filter(id=>Object.hasOwn(catalogue,id)).map(id=>{
      const product=catalogue[id];
      return {id,title:product.displayTitle||product.title,category:groupNames[product.group]+' · '+(product.packOverview||product.pack),image:product.image,alt:product.title+' — '+product.pack};
    });
  const dots=document.querySelector('.spotlight-dots');
  dots.replaceChildren();
  featured.forEach((item,index)=>{
    const button=document.createElement('button');button.type='button';button.dataset.spotlight=String(index);
    button.setAttribute('aria-label','Show '+item.title);button.setAttribute('aria-pressed',String(index===0));
    button.addEventListener('click',()=>showSpotlight(index));dots.append(button);
  });
  let selected = 0, spotlightHasShown = false;
  function showSpotlight(index) {
    selected = (index + featured.length) % featured.length;
    const item = featured[selected];
    changeImage(spotlight,item.image,item.alt);
    document.getElementById('spotlight-title').textContent=item.title;
    document.getElementById('spotlight-category').textContent=item.category;
    document.getElementById('spotlight-number').textContent=String(selected+1).padStart(2,'0')+' / '+String(featured.length).padStart(2,'0');
    const link=document.getElementById('spotlight-link');link.href='product.html?product='+item.id;link.setAttribute('aria-label','Explore '+item.title);
    document.querySelectorAll('[data-spotlight]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.spotlight)===selected)));
    if(spotlightHasShown&&!reducedMotion.matches){for(const id of ['spotlight-title','spotlight-category'])softReveal(document.getElementById(id),7);}
    spotlightHasShown=true;
  }
  document.getElementById('spotlight-prev').addEventListener('click',()=>showSpotlight(selected-1));
  document.getElementById('spotlight-next').addEventListener('click',()=>showSpotlight(selected+1));
  const swipeStage=spotlight.closest('.spotlight-image-stage');
  if(swipeStage && window.MadhavSwipe) window.MadhavSwipe(swipeStage,()=>showSpotlight(selected-1),()=>showSpotlight(selected+1));
  showSpotlight(0);
}
const backTop = document.getElementById('back-top-button');
if (backTop) {
  let scrollScheduled = false;
  const updateBackTop = () => {backTop.hidden=window.scrollY<500;scrollScheduled=false;};
  window.addEventListener('scroll',()=>{if(!scrollScheduled){scrollScheduled=true;window.requestAnimationFrame(updateBackTop);}}, {passive:true});
  backTop.addEventListener('click',()=>{window.scrollTo({top:0,behavior:reducedMotion.matches?'instant':'smooth'});});
  updateBackTop();
}
// Section entrances and scroll reveals are managed centrally by motion.js.
