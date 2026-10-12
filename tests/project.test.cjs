const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),c={window:{}};vm.createContext(c);
for(const file of ['language-data.js',...['hi','mr','te','ta','bn','pa','gu'].map(l=>'translations/'+l+'.js'),'product-data.js','ingredient-data.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c);
const products=c.window.productCatalogue;
assert.equal(Object.keys(products).length,8);
const assets=new Set();for(const p of Object.values(products)){
 assert(p.title&&p.benefits&&p.amazonUrl.startsWith('https://amzn.in/'));assets.add(p.image);
 for(const f of p.formats||[p]){assert(f.ingredients.length);for(const g of f.gallery||[]){assets.add(g.src);if(g.original)assets.add(g.original);}}
 for(const g of p.gallery||[]){assets.add(g.src);if(g.original)assets.add(g.original);}
}
for(const file of assets){assert(file.startsWith('assets/cutouts/'),file);assert(fs.statSync(path.join(root,file)).size>0,file);}
const d=c.window.madhavTranslations;assert.deepEqual(Object.keys(d).sort(),['bn','gu','hi','mr','pa','ta','te']);const keys=Object.keys(d.hi).sort();for(const locale of Object.keys(d))assert.deepEqual(Object.keys(d[locale]).sort(),keys,locale);
for(const [id,item] of Object.entries(c.window.ingredientGuide)){
 if(!item.guideHidden)for(const locale of Object.keys(d))for(const field of ['shortBenefit','paragraph','evidenceLabel'])assert(d[locale][item[field]],locale+' '+id+' '+field);
}
for(const file of ['index.html','product.html','ingredients.html']){
 const html=fs.readFileSync(path.join(root,file),'utf8');let previous=html.indexOf('src="language-data.js');
 for(const locale of ['hi','mr','te','ta','bn','pa','gu']){const position=html.indexOf('src="translations/'+locale+'.js');assert(position>previous,file+' language loading order');previous=position;}
 assert(html.indexOf('src="language.js')>previous);
 for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)){const ref=m[1].split(/[?#]/)[0];if(!/^(https?:|mailto:|tel:|data:)/.test(ref))assert(fs.existsSync(path.join(root,ref)),file+' '+ref);}
}
const v=JSON.parse(fs.readFileSync(path.join(root,'vercel.json')));assert.equal(v.framework,null);assert.equal(v.buildCommand,'');assert.equal(v.outputDirectory,'.');assert(!fs.existsSync(path.join(root,'.openai')));assert(!fs.existsSync(path.join(root,'app/chatgpt-auth.ts')));
console.log('Passed: all product and page assets, seven translation dictionaries and load order, ingredient coverage and standalone Vercel settings.');
