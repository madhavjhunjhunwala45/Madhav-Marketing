const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');const root=path.resolve(__dirname,'..');
const {document}=parseHTML('<html><body></body></html>');const context={window:{},document,URL};vm.createContext(context);
for(const file of ['product-data.js','ingredient-data.js','ingredient-shared.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
const {ingredientGuide:guide,ingredientAliases:aliases,productCatalogue:products,MadhavIngredientNotes:notes,mmIngredientNoteCopy:copy}=context.window;
assert(notes);const covered=new Set;let rows=0;
for(const [id,product]of Object.entries(products))for(const format of product.formats||[product])for(const row of format.ingredients){const n=notes.get(id,row[0]);assert(n&&n.benefit&&n.explanation&&n.paragraph,id+':'+row[0]);covered.add(n.id);rows++;const details=notes.details(id,row[0]);assert.equal(details.localName,'details');assert.equal(details.querySelector('summary').textContent,'Why it is used');assert.equal(details.querySelectorAll('p').length,2);}
const legacyReferenceIds=new Set(['mahanarayan','mahavishgarbha','mahamash','vishnu','shatparni','mala','shree-gopal']);for(const [id,item]of Object.entries(guide))if(!item.guideHidden)assert(covered.has(id)||legacyReferenceIds.has(id),'No product or retained reference context for '+id);for(const id of legacyReferenceIds)assert(!covered.has(id),'Earlier oil-label reference must not be assigned to the corrected current formula: '+id);
assert.equal(notes.get('missing','missing'),null);assert.equal(notes.details('missing','missing'),null);
assert(notes.get('dard-oil','Ashwagandha').benefit===copy.externalBenefit);
assert.equal(notes.get('dard-oil','Castor oil').explanation,copy.base);
assert.equal(notes.get('dard-oil','Erand').explanation,copy.topical);
assert.equal(notes.get('arshharan-capsules','Sanay').explanation,copy.part);
assert.equal(notes.get('arshharan-capsules','Bel ext.').explanation,copy.part);
assert.equal(notes.get('arshharan','Bhilava').explanation,copy.oral);
assert.equal(notes.get('arshharan-capsules','Giloy Satva').explanation,copy.oral);
assert.equal(notes.get('madhumeh-value','Kali jeera').explanation,copy.identity);
assert.equal(notes.get('madhumeh-premium','Jamun').explanation,copy.metabolic);
assert.equal(notes.get('madhumeh-premium','Daruhaldi').explanation,copy.berberis);
assert.equal(notes.get('madhumeh-premium','Basant kusumakar').benefit,copy.vasantShort);
assert.equal(guide['vasant-kusumakar'].title,'Vasant Kusumakar Ras');assert(guide['vasant-kusumakar'].paragraph.includes('classical Ayurvedic'));assert(guide['vasant-kusumakar'].paragraph.includes('Madhumeh Haran Premium'));assert(!guide['vasant-kusumakar'].paragraph.includes('do not establish'));assert(copy.pageEvidence.includes('proprietary Ayurvedic'));assert(!copy.vasantRole.includes('not'));assert(!Object.values(guide).some(p=>p.shortBenefit.includes('may support')));
const dictionaryContext={window:{madhavTranslations:{}}};vm.createContext(dictionaryContext);
for(const lang of ['hi','mr','te','ta','bn','pa','gu']){vm.runInContext(fs.readFileSync(path.join(root,'translations',lang+'.js'),'utf8'),dictionaryContext);const dictionary=dictionaryContext.window.madhavTranslations[lang];for(const text of [...Object.values(copy),'Why it is used','Vasant Kusumakar Ras','Castor · Erand'])assert(dictionary[text],lang+':'+text);assert(dictionary['Massage gently.']);}
for(const page of ['index.html','product.html','ingredients.html','cart.html'])assert(fs.readFileSync(path.join(root,page),'utf8').includes('mm-established'),page+' founding date');
const productHtml=fs.readFileSync(path.join(root,'dist/_search/product-dard-oil.html'),'utf8');assert(productHtml.includes('Massage gently.'));assert(productHtml.includes('mm-formula-note'));assert.equal(parseHTML(productHtml).document.querySelectorAll('.mm-evidence-note').length,1);assert(productHtml.includes(copy.pageEvidence));
const ingredientHtml=fs.readFileSync(path.join(root,'dist/_search/ingredient-vasant-kusumakar.html'),'utf8');assert(ingredientHtml.includes('mm-ingredient-product-note'));assert(ingredientHtml.includes('Vasant Kusumakar Ras'));assert(ingredientHtml.includes('Earlier pack panel'));assert(ingredientHtml.includes('New composition panel'));const shilajitHtml=fs.readFileSync(path.join(root,'dist/_search/ingredient-shilajit.html'),'utf8');assert(shilajitHtml.includes('Earlier pack panel'));assert(!shilajitHtml.includes('New composition panel'),'Shilajit must not be assigned to the new Premium panel');
console.log('Passed: all '+covered.size+' mapped ingredients / '+rows+' label rows have product-aware notes; oral/topical and plant-part distinctions, missing-component guards, native disclosures, every new translation, gentle-massage text and all-page establishment date.');
