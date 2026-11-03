const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),c={window:{madhavTranslations:{}}};vm.createContext(c);
for(const file of [...['hi','mr','te','ta','bn','pa','gu'].map(l=>'translations/'+l+'.js'),'product-data.js','ingredient-data.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c);
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
 const html=fs.readFileSync(path.join(root,file),'utf8');assert(html.includes('src="website.js'));assert(html.includes('src="shop.js'));assert.equal((html.match(/rel="stylesheet"/g)||[]).length,1);
 for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)){const ref=m[1].split(/[?#]/)[0];if(!/^(https?:|mailto:|tel:|data:)/.test(ref))assert(fs.existsSync(path.join(root,ref)),file+' '+ref);}
}
const v=JSON.parse(fs.readFileSync(path.join(root,'vercel.json')));assert.equal(v.framework,null);assert.equal(v.buildCommand,'npm run build');assert.equal(v.installCommand,'npm ci --include=dev --ignore-scripts');assert.equal(v.outputDirectory,'dist');assert(!fs.existsSync(path.join(root,'.openai')));assert(!fs.existsSync(path.join(root,'app/chatgpt-auth.ts')));
console.log('Passed: all product and page assets, seven translation dictionaries and lazy-loading paths, ingredient coverage and standalone Vercel settings.');
