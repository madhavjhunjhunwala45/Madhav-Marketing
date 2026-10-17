export const CART_KEY='madhav-cart-v1';
export const MAX_QUANTITY=20;
export const MAX_CART_ROWS=200;
export const MAX_CART_LENGTH=20000;
export function parseCartStorage(raw,config){
  if(raw==null)return [];
  if(typeof raw!=='string'||raw.length>MAX_CART_LENGTH)return [];
  try{return normalizeCart(JSON.parse(raw),config);}catch{return [];}
}
export function amountInPaise(value){
  if(typeof value!=='number'||!Number.isFinite(value)||value<=0||value>1000000)return null;
  const p=Math.round(value*100);
  return Math.abs(value*100-p)<0.000001?p:null;
}
export function unitPrice(item){
  const mrp=amountInPaise(item.mrp),selling=amountInPaise(item.unitPrice);
  if(item.unitPrice!=null && selling==null)return null;
  if(selling!=null && mrp!=null && selling>mrp)return null;
  return selling??mrp;
}
export function normalizeCart(input,config){
  if(!Array.isArray(input))return [];
  const allowed=new Set(config.products.map(p=>p.sku)),merged=new Map();
  for(const item of input.slice(0,MAX_CART_ROWS)){
    if(!item||typeof item!=='object'||Array.isArray(item)||!Object.hasOwn(item,'sku')||!Object.hasOwn(item,'quantity')||typeof item.sku!=='string'||!allowed.has(item.sku)||!Number.isSafeInteger(item.quantity)||item.quantity<1)continue;
    merged.set(item.sku,Math.min(MAX_QUANTITY,(merged.get(item.sku)||0)+item.quantity));
  }
  return Array.from(merged,([sku,quantity])=>({sku,quantity}));
}
export function quoteCart(cart,config){
  const lines=normalizeCart(cart,config).map(line=>{
    const item=config.products.find(p=>p.sku===line.sku),price=unitPrice(item);
    return {...line,productId:item.productId,pack:item.pack||'',unitPricePaise:price,lineTotalPaise:price==null?null:price*line.quantity};
  });
  const known=lines.length>0&&lines.every(l=>l.lineTotalPaise!=null);
  // This release intentionally never quotes a final delivery charge or payable total.
  return {lines,count:lines.reduce((n,l)=>n+l.quantity,0),subtotalPaise:known?lines.reduce((n,l)=>n+l.lineTotalPaise,0):null,deliveryPaise:null,grandTotalPaise:null};
}
