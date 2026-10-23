export const interests = ['general','products','retailer','updates'];
export const consentText = 'I would like product news and offers by email or phone. I can opt out at any time.';
export const consentVersion = '2026-10-12-v1';
const clean = value => typeof value === 'string' ? value.trim() : '';
export function validateContact(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {error:'invalid',field:'name'};
  const data = {name:clean(input.name),email:clean(input.email),phone:clean(input.phone),city:clean(input.city),interest:clean(input.interest)||'general',marketingConsent:input.marketingConsent===true};
  if (data.name.length<2 || data.name.length>80 || /[\u0000-\u001f\u007f]/.test(data.name)) return {error:'name',field:'name'};
  if (!data.email && !data.phone) return {error:'contact',field:'email'};
  if (data.email && (data.email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))) return {error:'email',field:'email'};
  if (data.phone && (!/^[+\d\s().-]{7,30}$/.test(data.phone) || !/^\d{7,15}$/.test(data.phone.replace(/\D/g,'')))) return {error:'phone',field:'phone'};
  if (data.city.length>100 || /[\u0000-\u001f\u007f]/.test(data.city)) return {error:'city',field:'city'};
  if (!interests.includes(data.interest)) return {error:'interest',field:'interest'};
  return {data};
}
export function csvCell(value) {
  let text = String(value??'');
  if (/^[\s]*[=+@-]/.test(text)) text = "'"+text;
  return '"'+text.replaceAll('"','""')+'"';
}

// A request correlation ID, not an authentication or payment token.
let requestSequence=0;
export function createRequestId(cryptoApi=globalThis.crypto){
  if(typeof cryptoApi?.randomUUID==='function')return cryptoApi.randomUUID();
  if(typeof cryptoApi?.getRandomValues==='function'){
    const bytes=new Uint8Array(16);cryptoApi.getRandomValues(bytes);
    bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
    const hex=Array.from(bytes,value=>value.toString(16).padStart(2,'0')).join('');
    return [hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-');
  }
  return 'request-'+Date.now().toString(36)+'-'+(++requestSequence).toString(36);
}
