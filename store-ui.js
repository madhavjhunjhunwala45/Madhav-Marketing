import {storeConfig} from './store-config.mjs';
import {storeText} from './store-i18n.mjs';
import {CART_KEY,MAX_QUANTITY,amountInPaise,unitPrice,normalizeCart,quoteCart} from './store-core.mjs';

const catalogue=window.productCatalogue;
if(catalogue&&!document.getElementById('madhav-store')){
 const language=()=>window.MadhavI18n?.language||document.documentElement.lang||'en';
 const native=text=>window.MadhavI18n?.translate(text)||text;
 const t=key=>storeText[language()]?.[key]||storeText.en[key]||native(key);
 const money=paise=>paise==null?t('pricePending'):new Intl.NumberFormat(language()+'-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(paise/100);
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;};
 const translated=(tag,key,cls)=>{const n=el(tag,cls,t(key));n.dataset.storeText=key;return n;};
 let cart=[];
 try{cart=normalizeCart(JSON.parse(localStorage.getItem(CART_KEY)||'[]'),storeConfig);}catch{}
 const nameOf=item=>native((catalogue[item.productId]?.title||item.productId).replace(/Kabi Haran/g,'Kabj Haran'));
 const packOf=item=>item.pack||catalogue[item.productId]?.pack||'';
 const productItems=id=>storeConfig.products.filter(p=>p.productId===id&&catalogue[p.productId]);
 const root=el('div');root.id='madhav-store';root.setAttribute('data-no-translate','');document.body.append(root);
 const launcher=el('button','store-launcher');launcher.type='button';launcher.setAttribute('aria-haspopup','dialog');
 const icon=el('span','store-cart-symbol');const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.7');const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M3 3h2l2.4 12h11.2l2-8H6 M10 20h.01 M18 20h.01');path.setAttribute('stroke-linecap','round');svg.append(path);icon.append(svg);icon.setAttribute('aria-hidden','true');const cartLabel=translated('span','cart'),badge=el('span','store-badge','0');launcher.append(icon,cartLabel,badge);root.append(launcher);
 const dialog=el('dialog','store-dialog');dialog.setAttribute('aria-labelledby','store-heading');root.append(dialog);
 const header=el('div','store-dialog-header'),heading=translated('h2','cart');heading.id='store-heading';const close=el('button','store-close','×');close.type='button';header.append(heading,close);dialog.append(header);
 const body=el('div','store-body'),status=el('p','store-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');dialog.append(body,status);
 const cartView=el('section','store-cart-view'),empty=translated('p','empty','store-empty'),lines=el('div','store-lines');cartView.append(empty,lines);
 const summary=el('dl','store-summary'),sumRow=el('div'),deliveryRow=el('div'),subLabel=translated('dt','subtotal'),subtotal=el('dd'),deliveryLabel=translated('dt','delivery'),deliveryValue=translated('dd','pending');sumRow.append(subLabel,subtotal);deliveryRow.append(deliveryLabel,deliveryValue);summary.append(sumRow,deliveryRow);cartView.append(summary);
 const checkout=translated('button','checkout','store-primary');checkout.type='button';checkout.disabled=true;checkout.setAttribute('aria-describedby','store-coming-soon-note');const checkoutNote=translated('p','note','store-note store-coming-soon');checkoutNote.id='store-coming-soon-note';cartView.append(checkout,checkoutNote);
 const shop=el('details','store-shop');const shopSummary=translated('summary','shop');const shopGrid=el('div','store-shop-grid');shop.append(shopSummary,shopGrid);cartView.append(shop);body.append(cartView);
 function save(){try{localStorage.setItem(CART_KEY,JSON.stringify(cart));}catch{}renderCart();}
 function setQuantity(sku,quantity){if(quantity<1)cart=cart.filter(l=>l.sku!==sku);else cart=normalizeCart([...cart.filter(l=>l.sku!==sku),{sku,quantity:Math.min(MAX_QUANTITY,quantity)}],storeConfig);save();}
 function open(){status.textContent='';renderCart();if(!dialog.open)dialog.showModal();}
 function add(sku){const current=cart.find(l=>l.sku===sku)?.quantity||0;setQuantity(sku,current+1);open();status.textContent=t('added');shop.open=false;}
 function renderCart(){
  const quote=quoteCart(cart,storeConfig);badge.textContent=String(quote.count);launcher.setAttribute('aria-label',t('cart')+' — '+quote.count);lines.replaceChildren();empty.hidden=quote.lines.length>0;summary.hidden=!quote.lines.length;checkout.disabled=true;subtotal.textContent=money(quote.subtotalPaise);
  for(const line of quote.lines){const item=storeConfig.products.find(p=>p.sku===line.sku),row=el('div','store-line'),identity=el('div'),title=el('strong',null,nameOf(item)),pack=el('small',null,native(packOf(item)));identity.append(title,pack,el('span','store-line-price',money(line.unitPricePaise)+' × '+line.quantity+' = '+money(line.lineTotalPaise)));
   const controls=el('div','store-line-controls'),minus=el('button',null,'−'),plus=el('button',null,'+'),quantity=el('output',null,String(line.quantity)),remove=el('button','store-remove',t('remove'));
   for(const button of [minus,plus,remove]){button.type='button';button.disabled=false;}
   minus.setAttribute('aria-label',t('qty')+' − '+nameOf(item));plus.setAttribute('aria-label',t('qty')+' + '+nameOf(item));quantity.setAttribute('aria-label',t('qty'));plus.disabled=line.quantity>=MAX_QUANTITY;
   minus.addEventListener('click',()=>setQuantity(line.sku,line.quantity-1));plus.addEventListener('click',()=>setQuantity(line.sku,line.quantity+1));remove.addEventListener('click',()=>setQuantity(line.sku,0));controls.append(minus,quantity,plus,remove);row.append(identity,controls);lines.append(row);
  }
 }
 function renderShop(filter){shopGrid.replaceChildren();for(const item of storeConfig.products){const product=catalogue[item.productId];if(!product||(filter&&item.productId!==filter))continue;
  const card=el('article','store-shop-card'),img=el('img');const format=Number.isInteger(item.formatIndex)?product.formats?.[item.formatIndex]:null;img.src=format?.gallery?.[0]?.src||product.image;img.alt=nameOf(item)+' '+packOf(item);img.loading='lazy';img.width=100;img.height=120;
  const content=el('div');content.append(el('h3',null,nameOf(item)),el('p','store-pack',native(packOf(item))),el('p','store-price',money(unitPrice(item))));
  const mrp=amountInPaise(item.mrp),price=unitPrice(item);if(mrp!=null&&price!=null&&price<mrp)content.append(el('small','store-mrp','MRP '+money(mrp)));
  const addButton=el('button','store-add',t('add'));addButton.type='button';addButton.addEventListener('click',()=>add(item.sku));content.append(addButton);card.append(img,content);shopGrid.append(card);
 }}
 function choose(id){open();shop.open=true;renderShop(id);shop.scrollIntoView({block:'nearest',behavior:'auto'});}
 function hookProductButtons(){
  document.querySelectorAll('.product-card').forEach(card=>{if(card.querySelector('.store-card-buy'))return;const link=card.querySelector('a[href*="product="]');if(!link)return;const id=new URL(link.href,location.href).searchParams.get('product'),items=productItems(id);if(!items.length)return;
   const button=el('button','store-card-buy');button.type='button';button.setAttribute('data-no-translate','');button.dataset.storeBuy=id;button.addEventListener('click',()=>items.length>1?choose(id):add(items[0].sku));const price=el('p','store-purchase-price');price.dataset.storePrice=id;price.setAttribute('data-no-translate','');card.querySelector('.product-card-content')?.append(price,button);
  });
  const id=new URLSearchParams(location.search).get('product'),items=productItems(id),actions=document.querySelector('.product-shopping-actions');
  if(actions&&items.length&&!actions.querySelector('.store-product-buy')){const button=el('button','store-product-buy');button.type='button';button.dataset.storeBuy=id;button.setAttribute('data-no-translate','');button.addEventListener('click',()=>{if(items.length===1){add(items[0].sku);return;}const all=Array.from(document.querySelectorAll('#format-options button')),index=all.findIndex(b=>b.getAttribute('aria-pressed')==='true');const selected=items.find(i=>i.formatIndex===index);if(selected)add(selected.sku);else choose(id);});const price=el('p','store-purchase-price store-product-price');price.dataset.storePrice=id;price.dataset.storeDetail='true';price.setAttribute('data-no-translate','');actions.prepend(price,button);}
 }
 function refreshPrices(){document.querySelectorAll('[data-store-price]').forEach(node=>{let items=productItems(node.dataset.storePrice);if(node.dataset.storeDetail==='true'&&items.length>1){const buttons=Array.from(document.querySelectorAll('#format-options button')),index=buttons.findIndex(b=>b.getAttribute('aria-pressed')==='true');items=items.filter(item=>item.formatIndex===index);}const prices=items.map(unitPrice);node.textContent=prices.length&&prices.every(p=>p!=null)?(Math.min(...prices)===Math.max(...prices)?money(prices[0]):money(Math.min(...prices))+' – '+money(Math.max(...prices))):t('pricePending');});}
 function refresh(){root.querySelectorAll('[data-store-text]').forEach(n=>n.textContent=t(n.dataset.storeText));close.setAttribute('aria-label',t('close'));
  document.querySelectorAll('[data-store-buy]').forEach(b=>b.textContent=t(productItems(b.dataset.storeBuy).length>1&&!b.classList.contains('store-product-buy')?'choose':'add'));
  refreshPrices();renderCart();renderShop();
 }
 launcher.addEventListener('click',()=>{open();renderShop();shop.open=cart.length===0;});close.addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 document.addEventListener('madhav:languagechange',refresh);
 hookProductButtons();document.getElementById('format-options')?.addEventListener('click',refreshPrices);refresh();
}
