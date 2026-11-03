const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..');
const stripImports=source=>source.replace(/import\s*\{[^}]*\}\s*from\s*["'][^"']+["'];?/g,'');
async function main(){
 const {storeConfig}=await import(pathToFileURL(path.join(root,'store-config.mjs')).href);
 const data={window:{}};vm.createContext(data);vm.runInContext(fs.readFileSync(path.join(root,'product-data.js'),'utf8'),data);
 const catalogue=data.window.productCatalogue;
 const context={window:{},document:{getElementById(){return null;}},storeConfig,siteSettings:{},URL,setTimeout,clearTimeout,performance};vm.createContext(context);
 const source=stripImports(fs.readFileSync(path.join(root,'shop.js'),'utf8'));
 vm.runInContext(source+';this.api={createCartEnquiry,quoteCart,storeText};',context);
 const api=context.api,contacts={email:'madhavmarketing999@gmail.com',website:'https://www.madhavmarketing.store/cart.html?private=ignored#cart'};
 let cases=0;const check=(name,fn)=>{fn();cases++;console.log('PASS '+name);};
 check('empty and invalid carts produce no enquiry',()=>{assert.equal(api.createCartEnquiry([],storeConfig,catalogue,contacts),null);assert.equal(api.createCartEnquiry([{sku:'unknown',quantity:9}],storeConfig,catalogue,contacts),null);});
 check('full cart includes every SKU, correct pack, quantity and subtotal',()=>{
  const cart=storeConfig.products.map(p=>({sku:p.sku,quantity:2}));const result=api.createCartEnquiry(cart,storeConfig,catalogue,contacts);
  assert.equal(result.quote.lines.length,9);assert.equal(result.quote.subtotalPaise,502800);
  assert(result.message.includes('Dard Haran Reliever Oil — 50 ml'));assert(result.message.includes('Dard Haran Reliever Oil — 100 ml'));
  for(const item of storeConfig.products)assert(result.message.includes(catalogue[item.productId].title));
  assert.equal((result.message.match(/Quantity: 2/g)||[]).length,9);assert(result.message.includes('INR 5028.00'));
  assert(!result.message.includes('private=ignored'));assert(!result.message.includes('#cart'));
 });
 check('WhatsApp and email decode to the complete same cart',()=>{
  const result=api.createCartEnquiry([{sku:'dard-oil-100',quantity:3}],storeConfig,catalogue,contacts);
  const wa=new URL(result.whatsappHref),mail=new URL(result.emailHref);
  assert.equal(wa.origin,'https://wa.me');assert.equal(wa.pathname,'/919431655050');assert.equal(wa.searchParams.get('text'),result.message);
  assert.equal(mail.pathname,'madhavmarketing999@gmail.com');assert.equal(mail.searchParams.get('body').replace(/\r\n/g,'\n'),result.message);
  assert.equal(mail.searchParams.get('subject'),'Madhav Marketing — cart enquiry');assert(result.message.includes('INR 660.00'));
 });
 check('stored prices are ignored and quantities stay within the existing limit',()=>{
  const result=api.createCartEnquiry([{sku:'kabj-haran',quantity:999,unitPrice:1,lineTotalPaise:1},{sku:'kabj-haran',quantity:2}],storeConfig,catalogue,contacts);
  assert.equal(result.quote.lines[0].quantity,20);assert(result.message.includes('Unit price: INR 105.00'));assert(result.message.includes('INR 2100.00'));
 });
 check('unknown prices remain to be confirmed instead of becoming free',()=>{
  const config={...storeConfig,products:[{sku:'pending',productId:'dard-capsule',unitPrice:null,mrp:null}]};
  const result=api.createCartEnquiry([{sku:'pending',quantity:1}],config,catalogue,contacts);
  assert.equal(result.quote.subtotalPaise,null);assert(result.message.includes('Unit price: To be confirmed'));assert(result.message.includes('Product subtotal (excluding delivery): To be confirmed'));
 });
 check('invalid recipients cannot inject URLs or email headers',()=>{
  const config={...storeConfig,checkout:{status:'enquiry',whatsappNumber:'javascript:alert(1)'}};
  const result=api.createCartEnquiry([{sku:'dard-capsule',quantity:1}],config,catalogue,{email:'name@example.com\r\nBcc:other@example.com',website:'javascript:alert(1)'});
  assert.equal(result.whatsappHref,null);assert.equal(result.emailHref,null);assert(!result.message.includes('javascript:'));
 });
 check('special characters and non-Latin product names survive URL encoding',()=>{
  const changed={...catalogue,'dard-capsule':{...catalogue['dard-capsule'],title:'पैक & capsule ? # + <test>'}};
  const result=api.createCartEnquiry([{sku:'dard-capsule',quantity:1}],storeConfig,changed,contacts);
  assert(new URL(result.whatsappHref).searchParams.get('text').includes('पैक & capsule ? # + <test>'));
  assert.equal(new URL(result.emailHref).searchParams.size,2);
 });
 check('delivery, payment and order confirmation are not invented',()=>{
  const result=api.createCartEnquiry([{sku:'dard-capsule',quantity:1}],storeConfig,catalogue,contacts);
  assert(result.message.includes('Delivery charges and serviceability: Please confirm.'));assert(result.message.includes('not a confirmed or paid order'));
  assert(!/free shipping|cash on delivery|payment received|order placed/i.test(result.message));
 });
 check('maximum-size supported cart is complete without truncation',()=>{
  const result=api.createCartEnquiry(storeConfig.products.map(p=>({sku:p.sku,quantity:20})),storeConfig,catalogue,contacts);
  assert.equal(result.quote.count,180);assert.equal(result.quote.lines.length,9);assert.equal((result.message.match(/Quantity: 20/g)||[]).length,9);
  assert.equal(new URL(result.whatsappHref).searchParams.get('text'),result.message);assert.equal(new URL(result.emailHref).searchParams.get('body').replace(/\r\n/g,'\n'),result.message);
 });
 check('all eight interface languages include every new checkout label',()=>{
  const keys=['enquiryIntro','enquiryTitle','enquiryWhatsApp','enquiryEmail','enquiryCopy','enquiryView','enquiryCopied','enquiryCopyFallback','enquiryNote'];
  for(const lang of ['en','hi','mr','te','ta','bn','pa','gu'])for(const key of keys)assert(api.storeText[lang][key],lang+' '+key);
 });

 async function mount(cart,{language='en',clipboard='ok'}={}){
  const {document}=parseHTML(fs.readFileSync(path.join(root,'cart.html'),'utf8'));document.documentElement.lang=language;
  let stored=JSON.stringify(cart),copied=null;const events={};
  const ctx={document,storeConfig,siteSettings:{supportEmail:contacts.email},URL,URLSearchParams,location:new URL(contacts.website),Intl,performance,queueMicrotask,setTimeout(){return 1;},clearTimeout(){},
   localStorage:{getItem(){return stored;},setItem(key,value){stored=value;}},navigator:{clipboard:{async writeText(text){if(clipboard==='fail')throw Error('Permission denied');copied=text;}}},
   window:{productCatalogue:catalogue,location:new URL(contacts.website),MadhavI18n:{language,translate:t=>t},matchMedia:()=>({matches:false,addEventListener(){}}),addEventListener(type,fn){(events[type]||=[]).push(fn);}}};
  vm.createContext(ctx);try{vm.runInContext(source,ctx);}catch(error){throw new Error("Cart DOM setup: "+error.message);}
  return {document,ctx,get stored(){return JSON.parse(stored);},get copied(){return copied;},events};
 }
 let view=await mount([]);
 check('empty cart has two disabled actions and no message links',()=>{assert.equal(view.document.querySelectorAll('[data-cart-enquiry]:disabled').length,2);assert.equal(view.document.querySelectorAll('a[data-cart-enquiry]').length,0);});
 view=await mount([{sku:'dard-oil-50',quantity:1}]);
 check('cart checkout has both channels with the same message and no false success',()=>{
  assert.equal(view.document.querySelectorAll('a[data-cart-enquiry]').length,2);assert(!view.document.querySelector('.store-coming-soon-button'));
  const message=view.document.querySelector('.cart-enquiry-message').value;
  assert.equal(new URL(view.document.querySelector('[data-cart-enquiry="whatsapp"]').getAttribute('href')).searchParams.get('text'),message);
  assert.equal(view.document.querySelector('.cart-enquiry-feedback').textContent,'');
 });
 view.document.querySelector('[data-cart-control="increase:dard-oil-50"]').click();
 check('quantity updates refresh both enquiry links without duplicates',()=>{
  const wa=new URL(view.document.querySelector('[data-cart-enquiry="whatsapp"]').getAttribute('href'));
  assert(wa.searchParams.get('text').includes('Quantity: 2'));assert(wa.searchParams.get('text').includes('INR 240.00'));assert.equal(view.document.querySelectorAll('.cart-enquiry-checkout').length,1);
  assert.equal(view.stored[0].quantity,2);
 });
 view.document.querySelector('.cart-enquiry-copy').click();await new Promise(resolve=>setImmediate(resolve));
 check('copy action writes the full message and reports success only afterward',()=>{
  assert.equal(view.copied,view.document.querySelector('.cart-enquiry-message').value);assert(view.document.querySelector('.cart-enquiry-feedback').textContent.includes('Cart copied'));
 });
 view=await mount([{sku:'dard-capsule',quantity:1}],{clipboard:'fail'});
 const area=view.document.querySelector('.cart-enquiry-message');let selected=false;area.select=()=>{selected=true;};
 view.document.querySelector('.cart-enquiry-copy').click();await new Promise(resolve=>setImmediate(resolve));
 check('clipboard denial exposes the full selectable fallback without false success',()=>{assert.equal(view.document.querySelector('.cart-enquiry-preview').open,true);assert(selected);assert(!view.document.querySelector('.cart-enquiry-feedback').textContent.includes('Cart copied'));});
 for(const language of ['hi','mr','te','ta','bn','pa','gu']){
  view=await mount([{sku:'dard-capsule',quantity:1}],{language});
  assert.equal(view.document.querySelector('[data-cart-enquiry="whatsapp"]').textContent,api.storeText[language].enquiryWhatsApp);
 }
 cases++;console.log('PASS non-English checkout actions render in all seven additional languages');
 console.log('All '+cases+' cart-enquiry regression cases passed. No messages sent.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
