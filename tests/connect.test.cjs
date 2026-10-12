const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function setup(endpoint=''){
 const handlers={},values=new Map([['name','Test Visitor'],['email','test@example.invalid'],['phone',''],['city','Haridwar'],['interest','products'],['website','']]),button={disabled:false},status={textContent:''},controls=[{disabled:false}],settings={contactFormEndpoint:endpoint,supportEmail:'madhavmarketing999@gmail.com'};
 let resets=0,calls=0,resolveFetch,body,url,focused,sequence=0;
 const form={addEventListener(n,f){handlers[n]=f;},querySelector(){return button;},querySelectorAll(){return controls;},elements:{namedItem(n){return{focus(){focused=n;}};}},setAttribute(){},removeAttribute(){},reset(){resets++;}};
 const c={document:{getElementById(id){return id==='connect-form'?form:status;}},window:{location:{href:''},MadhavI18n:{language:'gu',apply(){}}},siteSettings:settings,FormData:class{get(k){return values.get(k)||null;}},crypto:{randomUUID(){return 'request-'+(++sequence);}},AbortController,setTimeout,clearTimeout,encodeURIComponent,fetch:async(u,o)=>{calls++;url=u;body=JSON.parse(o.body);return new Promise(r=>resolveFetch=r);}};
 vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,'contact-validation.mjs'),'utf8').replaceAll('export ',''),c);vm.runInContext(fs.readFileSync(path.join(root,'connect.js'),'utf8').replace(/^import .*;\n/gm,''),c);
 return{c,values,handlers,button,status,controls,settings,get resets(){return resets;},get calls(){return calls;},get body(){return body;},get url(){return url;},get focused(){return focused;},respond(data,ok=true){resolveFetch({ok,json:async()=>data});}};
}
(async()=>{
 const event={preventDefault(){}};
 let t=setup();t.values.set('email','bad');await t.handlers.submit(event);assert.equal(t.calls,0);assert.equal(t.focused,'email');
 t.values.set('email','test@example.invalid');await t.handlers.submit(event);assert.equal(t.calls,0);assert(t.c.window.location.href.startsWith('mailto:madhavmarketing999@gmail.com'));assert(decodeURIComponent(t.c.window.location.href).includes('Marketing consent: No'));assert(t.status.textContent.includes('email draft'));assert.equal(t.resets,0);
 t.values.set('marketingConsent','yes');await t.handlers.submit(event);assert(decodeURIComponent(t.c.window.location.href).includes('Consent version:'));
 t=setup('https://formspree.io/f/testid');let pending=t.handlers.submit(event);assert.equal(t.calls,1);assert.equal(t.url,t.settings.contactFormEndpoint);assert(t.button.disabled);assert.equal(t.body.marketing_consent,'No');assert.equal(t.body.consent_text,'');assert.equal(t.body.language,'gu');const id=t.body.request_id;
 await t.handlers.submit(event);assert.equal(t.calls,1);t.respond({errors:[{message:'Failed'}]},false);await pending;assert.equal(t.resets,0);assert(!t.button.disabled);
 pending=t.handlers.submit(event);assert.equal(t.body.request_id,id);t.respond({ok:true});await pending;assert.equal(t.resets,1);assert(t.status.textContent.includes('has been saved'));
 t=setup('https://formspree.io/f/testid');t.values.set('email','');t.values.set('phone','+91 98765 43210');t.values.set('marketingConsent','yes');pending=t.handlers.submit(event);assert(!('email' in t.body));assert.equal(t.body.phone,'+91 98765 43210');assert.equal(t.body.marketing_consent,'Yes');assert(t.body.consent_text);t.respond({ok:true});await pending;
 t=setup('https://unconfigured.example.invalid/form');await t.handlers.submit(event);assert.equal(t.calls,0);assert(t.status.textContent.includes('could not be saved'));
 t=setup('https://formspree.io/f/testid');t.values.set('website','bot');await t.handlers.submit(event);assert.equal(t.calls,0);
 console.log('Passed: validated email drafts, no false saved status, configured form submissions, explicit consent, phone-only submissions, failures/retries, duplicate-click lock and honeypot. No real enquiries sent.');
})().catch(e=>{console.error(e);process.exitCode=1;});
