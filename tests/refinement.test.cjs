const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom'),root=path.resolve(__dirname,'..');
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'product-data.js'),'utf8'),context);
const oil=context.window.productCatalogue['dard-oil'];
const confirmed=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/dard-oil-confirmed.json')));
assert.equal(oil.formats.length,2);assert.deepEqual(Array.from(oil.formats,f=>f.pack),['50 ml','100 ml']);
for(const format of [oil,...oil.formats]){assert.equal(format.basis,confirmed.basis);assert.equal(JSON.stringify(format.ingredients),JSON.stringify(confirmed.ingredients));}
assert.equal(oil.formats[0].ingredients.length,21);assert(!oil.formulaNote.includes('different compositions'));
const read=file=>parseHTML(fs.readFileSync(path.join(root,'dist',file),'utf8')).document;
const tables=[];
for(let i=0;i<2;i++){const d=read('_search/product-dard-oil-format-'+i+'.html');tables.push(d.getElementById('composition-body').textContent);assert.equal(d.querySelectorAll('#composition-body tr').length,21);assert(d.getElementById('composition-basis').textContent.includes('Each 100 ml'));assert.equal(d.getElementById('product-pack').textContent,oil.formats[i].pack);}
assert.equal(tables[0],tables[1],'pack choice must not switch formulas');
for(const file of ['joint-muscle-care.html','digestive-wellness.html','karela-jamun-metabolic-wellness.html','heart-wellness.html','piles-fissure-care.html']){
 const d=read(file);assert(d.body.classList.contains('mm-refined-page'));assert.equal(d.querySelectorAll('.mm-seo-faq-list>details').length,3);assert.equal(d.querySelectorAll('.mm-seo-faq>details').length,0,'FAQ rows stay out of the outer homepage grid');assert(d.querySelector('.mm-seo-ingredient-card>p'));assert(d.querySelector('.mm-seo-enquiry-actions'));assert(d.querySelector('.mm-seo-nav-grid'));
 for(const image of d.querySelectorAll('.mm-seo-products img'))assert(image.getAttribute('sizes').includes('(max-width:767px)'));
}
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');assert(!/details\[open\]\s+summary::after/.test(css),'open parents must not change closed nested summaries');
console.log('Passed: brand-confirmed oil formula in both size routes, exact quantities/basis, retained pack differences, nested-disclosure selector, FAQ structure and category image candidates.');
