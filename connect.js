import {validateContact,consentText,consentVersion} from './contact-validation.mjs';
import {siteSettings} from './site-settings.js';
const form=document.getElementById('connect-form');
if(form){
  const status=document.getElementById('connect-status'),button=form.querySelector('button[type="submit"]');
  const messages={name:'Please enter your name (2–80 characters).',contact:'Please give an email address or phone number.',email:'Please enter a valid email address.',phone:'Please enter a valid phone number (7–15 digits).',city:'Please enter a city name of up to 100 characters.',interest:'Please choose an interest.',failed:'Your enquiry could not be saved. Please try again or contact us by email.'};
  let pending=false,requestId=crypto.randomUUID();
  const say=message=>{status.textContent=message;window.MadhavI18n?.apply();};
  form.addEventListener('input',()=>{if(!pending)requestId=crypto.randomUUID();});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(pending)return;
    const fields=new FormData(form);
    if(fields.get('website'))return;
    const checked=validateContact({name:fields.get('name'),email:fields.get('email'),phone:fields.get('phone'),city:fields.get('city'),interest:fields.get('interest'),marketingConsent:fields.get('marketingConsent')==='yes'});
    if(checked.error){say(messages[checked.error]||messages.failed);form.elements.namedItem(checked.field)?.focus();return;}
    const endpoint=siteSettings.contactFormEndpoint?.trim()||'';
    if(!endpoint){
      const d=checked.data;
      const body=[`Name: ${d.name}`,`Email: ${d.email}`,`Phone: ${d.phone}`,`City: ${d.city}`,`Interest: ${d.interest}`,`Marketing consent: ${d.marketingConsent?'Yes':'No'}`,d.marketingConsent?`Consent text: ${consentText}`:'',d.marketingConsent?`Consent version: ${consentVersion}`:'',`Language: ${window.MadhavI18n?.language||'en'}`].filter(Boolean).join('\n');
      window.location.href=`mailto:${siteSettings.supportEmail}?subject=${encodeURIComponent('Madhav Marketing enquiry')}&body=${encodeURIComponent(body)}`;
      say('Your email draft is ready. Send it from your email app to complete your enquiry.');
      return;
    }
    if(!/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+\/?$/.test(endpoint)){say(messages.failed);return;}
    pending=true;button.disabled=true;form.querySelectorAll('input,select').forEach(field=>field.disabled=true);form.setAttribute('aria-busy','true');say('Sending your enquiry…');
    try{
      const d=checked.data;
      const payload={name:d.name,...(d.email?{email:d.email}:{}),...(d.phone?{phone:d.phone}:{}),city:d.city,interest:d.interest,marketing_consent:d.marketingConsent?'Yes':'No',consent_text:d.marketingConsent?consentText:'',consent_version:d.marketingConsent?consentVersion:'',language:window.MadhavI18n?.language||'en',request_id:requestId,_subject:'Madhav Marketing enquiry'};
      const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
      let response;
      try{response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload),signal:controller.signal});}finally{clearTimeout(timer);}
      const result=await response.json();
      if(!response.ok || result.ok===false || result.errors?.length)throw new Error('failed');
      form.reset();requestId=crypto.randomUUID();say('Thank you! Your enquiry has been saved. Our team can now get in touch.');
    }catch{say(messages.failed);}
    finally{pending=false;button.disabled=false;form.querySelectorAll('input,select').forEach(field=>field.disabled=false);form.removeAttribute('aria-busy');}
  });
}
