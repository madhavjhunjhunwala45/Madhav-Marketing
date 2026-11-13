const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {parseHTML}=require('linkedom');const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
function context(query='',blank=false){const {document}=parseHTML(blank?'<html><body></body></html>':read('ingredients.html'));const location=new URL('https://www.madhavmarketing.store/ingredients.html'+query);const c={window:{madhavTranslations:{}},document,location,URL,URLSearchParams,requestAnimationFrame(){},history:{replaceState(a,b,url){location.href=new URL(url,location).href;}}};vm.createContext(c);for(const f of ['product-data.js','ingredient-data.js','ingredient-shared.js'])vm.runInContext(read(f),c);vm.runInContext(read('ingredients.js'),c);return c;}
const c=context(),{mmIngredientEditorial:copy,ingredientGuide:guide,ingredientAliases:aliases,productCatalogue:products}=c.window;
assert.equal(c.document.querySelectorAll('.mm-ingredient-preview').length,30);
assert.equal(c.document.querySelectorAll('.mm-ingredient-preview .ingredient-description').length,0);
for(const card of c.document.querySelectorAll('.mm-ingredient-preview')){
 const title=card.querySelector('h2 a');assert(title?.getAttribute('href').includes('ingredient='+card.dataset.id));
 const image=card.querySelector('.mm-ingredient-image-link');if(card.querySelector('.ingredient-photo-button'))assert(image&&image.querySelector('img'));
 const expected=Object.entries(products).filter(([,p])=>(p.formats||[p]).some(f=>f.ingredients.some(r=>aliases[r[0]]===card.dataset.id)));
 assert.equal(card.querySelectorAll('.mm-ingredient-key-products a').length,expected.length);
}
const texts=[];function strings(x){if(typeof x==='string')texts.push(x);else Object.values(x).forEach(strings)}strings(copy);
texts.push(...Object.values(c.window.mmIngredientNoteCopy));
for(const lang of ['hi','mr','te','ta','bn','pa','gu']){vm.runInContext(read('translations/'+lang+'.js'),c);for(const text of texts)assert(c.window.madhavTranslations[lang][text],lang+': '+text);}
for(const id of Object.keys(copy)){
 const x=copy[id];assert(/^(Added|Formulated)/.test(x.why)&&x.why.split(/\s+/).length<=45,id);
 const p=context('?ingredient='+id);assert.equal(p.document.querySelectorAll('.mm-ingredient-section').length,4);
 assert(p.document.querySelector('.ingredient-products').hasAttribute('open'));
 assert(p.document.querySelector('.mm-ingredient-care').textContent);
 const full=p.document.querySelector('.ingredient-selected');assert(full.classList.contains('mm-ingredient-rich'));
 const html=fs.readFileSync(path.join(root,'dist/_search/ingredient-'+id+'.html'),'utf8');
 assert(html.includes(x.essence)&&html.includes(x.raw)&&html.includes(x.absorption));
 assert(!full.querySelector('.ingredient-profile-link'),'No redundant self-link');
}
const note=c.window.MadhavIngredientNotes.get('hriday-rakshak','Haldi');assert(!/knee|osteoarthritis/i.test(Object.values(note).join(' ')));assert(note.explanation.includes('Arjuna'));
assert(!/knee|osteoarthritis/i.test(read('dist/heart-wellness.html')));
for(const [id,p]of Object.entries(products))for(const f of p.formats||[p])for(const row of f.ingredients){const n=c.window.MadhavIngredientNotes.get(id,row[0]);if(id==='dard-oil'&&n.id==='ashwagandha')assert(/stem/.test(n.explanation));if(n.id==='tulsi')assert(['madhumeh-value','madhumeh-premium'].includes(id));if(['rose','nagkesar'].includes(n.id))assert.equal(n.paragraph,c.window.mmIngredientNoteCopy.formulaContext);}
const p=context('?ingredient=turmeric');const reset=p.document.getElementById('ingredient-reset');reset.dispatchEvent(new p.document.defaultView.Event('click'));assert.equal(p.document.querySelectorAll('.mm-ingredient-preview').length,30);assert(!p.document.querySelector('.ingredient-selected'));
const first=p.document.querySelector('.ingredient-card');vm.runInContext(read('ingredients.js'),p);assert.equal(p.document.querySelector('.ingredient-card'),first,'Duplicate initialization must not rebuild or rebind');
assert.equal(context('?ingredient=not-a-plant').document.querySelectorAll('.mm-ingredient-preview').length,30);
assert.doesNotThrow(()=>context('',true));
console.log('Passed: 30 linked previews, image/profile/zoom separation, product membership, short labelled benefit summaries, all editorial translations, thirty complete SSR guides, open profile disclosures, contextual heart/oil notes, profile-to-catalogue reset, invalid input and duplicate/missing-element guards.');
