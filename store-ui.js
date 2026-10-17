import {storeConfig} from './store-config.mjs?v=20261017-page';
import {storeText} from './store-i18n.mjs?v=20261017-page';
import {CART_KEY,MAX_QUANTITY,amountInPaise,unitPrice,normalizeCart,quoteCart} from './store-core.mjs?v=20261017-page';

const catalogue=window.productCatalogue;
if(catalogue&&!document.getElementById('madhav-store')){
 const config={...storeConfig,products:storeConfig.products.filter(p=>catalogue[p.productId])};
 const language=()=>window.MadhavI18n?.language||document.documentElement.lang||'en';
 const native=text=>window.MadhavI18n?.translate(text)||text;
 const t=key=>storeText[language()]?.[key]||storeText.en[key]||key;
 const money=paise=>paise==null?t('pricePending'):new Intl.NumberFormat(language()+'-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(paise/100);
 const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!=null)node.textContent=text;return node;};
 const translated=(tag,key,cls)=>{const node=el(tag,cls,t(key));node.dataset.storeText=key;return node;};
 const link=(cls,text,href)=>{const node=el('a',cls,text);node.href=href;return node;};
 const page=document.getElementById('cart-page-app');
 const root=el('div');root.id='madhav-store';root.setAttribute('data-no-translate','');document.body.append(root);
 const nameOf=item=>native(catalogue[item.productId].title.replace(/Kabi Haran/g,'Kabj Haran'));
 const packOf=item=>native(item.pack||catalogue[item.productId].pack||'');
 const productItems=id=>config.products.filter(p=>p.productId===id);
 const productURL=item=>`product.html?product=${encodeURIComponent(item.productId)}&lang=${encodeURIComponent(language())}`;
 let cart=[],storageAvailable=true,toastTimer;
 function readCart(){try{const value=normalizeCart(JSON.parse(localStorage.getItem(CART_KEY)||'[]'),config);storageAvailable=true;return value;}catch{storageAvailable=false;return cart;}}
 cart=readCart();
 const launcher=link('store-launcher','', 'cart.html');launcher.setAttribute('data-store-cart-link','');
 const icon=el('span','store-cart-symbol');icon.setAttribute('aria-hidden','true');const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.7');const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M3 3h2l2.4 12h11.2l2-8H6 M10 20h.01 M18 20h.01');path.setAttribute('stroke-linecap','round');svg.append(path);icon.append(svg);
 const badge=el('span','store-badge');launcher.append(icon,translated('span','cart'),badge);if(!page)root.append(launcher);
 const toast=el('div','store-toast');toast.hidden=true;const status=el('span');status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');const viewLink=link('store-toast-link',t('viewCart'),'cart.html');viewLink.dataset.storeText='viewCart';const toastClose=translated('button','close','store-toast-close');toastClose.type='button';toast.append(status,viewLink,toastClose);root.append(toast);
 function announce(key){status.dataset.storeText=key;status.textContent=t(key);toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{if(!toast.contains(document.activeElement))toast.hidden=true;},5500);}
 toastClose.addEventListener('click',()=>{toast.hidden=true;clearTimeout(toastTimer);(page?.querySelector('h1')||launcher).focus({preventScroll:true});});
 function save(){try{localStorage.setItem(CART_KEY,JSON.stringify(cart));storageAvailable=true;}catch{storageAvailable=false;}render();}
 function setQuantity(sku,quantity,focusKey){
  cart=quantity<1?cart.filter(line=>line.sku!==sku):normalizeCart([...cart.filter(line=>line.sku!==sku),{sku,quantity}],config);
  save();if(page&&focusKey){const next=Array.from(page.querySelectorAll('[data-cart-control]')).find(n=>n.dataset.cartControl===focusKey&&!n.disabled);(next||page.querySelector('h1'))?.focus({preventScroll:true});}
 }
 function add(sku){const quantity=cart.find(line=>line.sku===sku)?.quantity||0;if(quantity>=MAX_QUANTITY){announce('limit');return;}setQuantity(sku,quantity+1);announce(storageAvailable?'added':'storageUnavailable');}
 function photo(item,cls){const product=catalogue[item.productId],format=Number.isInteger(item.formatIndex)?product.formats?.[item.formatIndex]:null;const img=el('img',cls);img.src=format?.gallery?.[0]?.src||product.image;img.alt=nameOf(item)+' '+packOf(item);img.width=120;img.height=140;img.loading='lazy';return img;}
 function priceNode(item){const box=el('div','store-price-block');box.append(el('p','store-price',money(unitPrice(item))));const mrp=amountInPaise(item.mrp),price=unitPrice(item);if(mrp!=null&&price!=null&&price<mrp)box.append(el('small','store-mrp','MRP '+money(mrp)));return box;}
 function renderPage(){
  if(!page)return;
  const quote=quoteCart(cart,config);page.replaceChildren();
  const heading=el('div','cart-page-heading');heading.append(translated('p','cartEyebrow','eyebrow'));const h1=translated('h1','cart');h1.tabIndex=-1;heading.append(h1,el('p','cart-page-intro',t('intro')));page.append(heading);
  const layout=el('div','cart-layout'),content=el('section','cart-products');content.setAttribute('aria-label',t('cart'));const head=el('div','cart-products-head');head.append(el('h2',null,t('items')+' ('+quote.count+')'),link('store-text-link',t('continue'),'index.html#products'));content.append(head);
  if(!quote.lines.length){const empty=el('div','cart-empty');empty.append(el('span','cart-empty-leaf','❧'),translated('h3','empty'),translated('p','emptyNote'),link('store-primary',t('shop'),'index.html#products'));content.append(empty);}
  for(const line of quote.lines){
   const item=config.products.find(p=>p.sku===line.sku),row=el('article','cart-product-row'),imageLink=link('cart-product-image','',productURL(item));imageLink.append(photo(item));
   const info=el('div','cart-product-info'),title=el('h3');title.append(link('',nameOf(item),productURL(item)));info.append(title,el('p','store-pack',packOf(item)),el('p','cart-unit-price',t('unit')+': '+money(line.unitPricePaise)));
   const controls=el('div','cart-quantity');
   function control(symbol,key,quantity){const button=el('button','',symbol);button.type='button';button.dataset.cartControl=key+':'+line.sku;button.setAttribute('aria-label',t(key)+' — '+nameOf(item)+' '+packOf(item));button.addEventListener('click',()=>setQuantity(line.sku,quantity,button.dataset.cartControl));return button;}
   const minus=control('−','decrease',line.quantity-1),plus=control('+','increase',line.quantity+1);plus.disabled=line.quantity>=MAX_QUANTITY;
   const select=el('select');select.dataset.cartControl='qty:'+line.sku;select.setAttribute('aria-label',t('qty')+' — '+nameOf(item)+' '+packOf(item));for(let n=1;n<=MAX_QUANTITY;n++){const option=el('option','',String(n));option.value=String(n);select.append(option);}select.value=String(line.quantity);select.addEventListener('change',()=>setQuantity(line.sku,Number(select.value),select.dataset.cartControl));controls.append(minus,select,plus);
   const remove=translated('button','remove','store-remove');remove.type='button';remove.dataset.cartControl='remove:'+line.sku;remove.setAttribute('aria-label',t('remove')+' — '+nameOf(item)+' '+packOf(item));remove.addEventListener('click',()=>{setQuantity(line.sku,0,'qty:'+quote.lines.find(l=>l.sku!==line.sku)?.sku);announce('removed');});
   const lower=el('div','cart-product-actions');lower.append(controls,remove);info.append(lower);
   const total=el('div','cart-line-total');total.append(el('small',null,t('lineTotal')),el('strong',null,money(line.lineTotalPaise)));row.append(imageLink,info,total);content.append(row);
  }
  const summary=el('aside','cart-order-summary');summary.setAttribute('aria-labelledby','cart-summary-title');const summaryTitle=translated('h2','summary');summaryTitle.id='cart-summary-title';const details=el('dl','store-summary');for(const [label,value] of [['subtotal',quote.lines.length?money(quote.subtotalPaise):money(0)],['delivery',t('pending')]]){const div=el('div');div.append(el('dt',null,t(label)),el('dd',null,value));details.append(div);}summary.append(summaryTitle,details,translated('p','subtotalNote','store-note'));
  const checkout=translated('button','checkout','store-primary store-coming-soon-button');checkout.type='button';checkout.disabled=true;checkout.setAttribute('aria-describedby','cart-coming-soon');const note=translated('p','note','store-note');note.id='cart-coming-soon';summary.append(checkout,note);
  if(!storageAvailable)summary.append(translated('p','storageUnavailable','store-storage-warning'));
  layout.append(content,summary);page.append(layout);
  const browse=el('section','cart-browse');browse.append(translated('h2','shop'));const grid=el('div','store-shop-grid');for(const item of config.products){const card=el('article','store-shop-card'),imageLink=link('','',productURL(item));imageLink.append(photo(item));const copy=el('div'),title=el('h3');title.append(link('',nameOf(item),productURL(item)));copy.append(title,el('p','store-pack',packOf(item)),priceNode(item));const button=translated('button','add','store-add');button.type='button';button.dataset.cartControl='add:'+item.sku;button.addEventListener('click',()=>{add(item.sku);Array.from(page.querySelectorAll('[data-cart-control]')).find(n=>n.dataset.cartControl===button.dataset.cartControl)?.focus({preventScroll:true});});copy.append(button);card.append(imageLink,copy);grid.append(card);}browse.append(grid);page.append(browse);
 }
 function hookProductButtons(){
  document.querySelectorAll('.product-card').forEach(card=>{if(card.querySelector('[data-store-buy]'))return;const source=card.querySelector('a[href*="product="]');if(!source)return;const id=new URL(source.href,location.href).searchParams.get('product'),items=productItems(id);if(!items.length)return;
   const button=items.length>1?link('store-card-buy','',productURL(items[0])):el('button','store-card-buy');if(button.tagName==='BUTTON'){button.type='button';button.addEventListener('click',()=>add(items[0].sku));}button.dataset.storeBuy=id;button.setAttribute('data-no-translate','');const price=el('p','store-purchase-price');price.dataset.storePrice=id;price.setAttribute('data-no-translate','');card.querySelector('.product-card-content')?.append(price,button);
  });
  const id=new URLSearchParams(location.search).get('product'),items=productItems(id),actions=document.querySelector('.product-shopping-actions');
  if(actions&&items.length&&!actions.querySelector('.store-product-buy')){const button=el('button','store-product-buy');button.type='button';button.dataset.storeBuy=id;button.setAttribute('data-no-translate','');button.addEventListener('click',()=>{if(items.length===1){add(items[0].sku);return;}const all=Array.from(document.querySelectorAll('#format-options button')),index=all.findIndex(b=>b.getAttribute('aria-pressed')==='true'),selected=items.find(i=>i.formatIndex===index);if(selected)add(selected.sku);else announce('selectPack');});const price=el('p','store-purchase-price store-product-price');price.dataset.storePrice=id;price.dataset.storeDetail='true';price.setAttribute('data-no-translate','');actions.prepend(price,button);}
 }
 function refreshPrices(){document.querySelectorAll('[data-store-price]').forEach(node=>{let items=productItems(node.dataset.storePrice);if(node.dataset.storeDetail==='true'&&items.length>1){const index=Array.from(document.querySelectorAll('#format-options button')).findIndex(b=>b.getAttribute('aria-pressed')==='true');items=items.filter(item=>item.formatIndex===index);}const prices=items.map(unitPrice);node.textContent=prices.length&&prices.every(p=>p!=null)?(Math.min(...prices)===Math.max(...prices)?money(prices[0]):money(Math.min(...prices))+' – '+money(Math.max(...prices))):t('pricePending');});}
 function render(){const count=quoteCart(cart,config).count;badge.textContent=String(count);launcher.setAttribute('aria-label',t('cart')+' ('+count+')');document.querySelectorAll('[data-store-header-cart]').forEach(node=>{node.textContent=t('cart')+' ('+count+')';});renderPage();}
 function refresh(){root.querySelectorAll('[data-store-text]').forEach(n=>n.textContent=t(n.dataset.storeText));document.querySelectorAll('[data-store-buy]').forEach(button=>{button.textContent=t(productItems(button.dataset.storeBuy).length>1&&!button.classList.contains('store-product-buy')?'choose':'add');});refreshPrices();render();if(page)document.title=t('cart')+' | Madhav Marketing';}
 // Existing pages receive the transparent asset without overwriting your edited HTML.
 document.querySelectorAll('.brand-logo').forEach(img=>{const old=img.getAttribute('src');if(old?.includes('madhav-logo-transparent.png'))return;img.addEventListener('error',()=>{img.src=old;},{once:true});img.src='assets/madhav-logo-transparent.png';});
 const nav=document.querySelector('.site-nav')||document.querySelector('.detail-nav');if(nav&&!nav.querySelector('[data-store-header-cart]')){const cartLink=link('store-header-cart','','cart.html');cartLink.setAttribute('data-store-header-cart','');cartLink.setAttribute('data-no-translate','');if(page)cartLink.setAttribute('aria-current','page');nav.append(cartLink);}
 document.addEventListener('madhav:languagechange',refresh);
 window.addEventListener('storage',event=>{if(event.key===CART_KEY||event.key===null){cart=readCart();render();}});
 window.addEventListener('pageshow',()=>{cart=readCart();render();});
 hookProductButtons();document.getElementById('format-options')?.addEventListener('click',refreshPrices);refresh();
 // Animate already-visible content only: failed/unsupported animation never hides content.
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 if(!reduced?.matches&&'IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){if(!reduced?.matches)entry.target.animate?.([{opacity:.65,translate:'0 10px'},{opacity:1,translate:'0 0'}],{duration:420,easing:'cubic-bezier(.2,.7,.2,1)'});observer.unobserve(entry.target);}}},{threshold:.12});document.querySelectorAll('.section-head,.hero-copy,.connect-copy').forEach(node=>observer.observe(node));}
}
