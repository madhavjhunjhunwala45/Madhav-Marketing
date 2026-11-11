const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const { parseHTML } = require('linkedom');
const root = path.resolve(__dirname, '..'), dist = path.join(root, 'dist');
const c = { window: { madhavTranslations: {} } }; vm.createContext(c);
for (const f of ['product-data.js', 'ingredient-data.js', 'search-settings.js', ...['hi','mr','te','ta','bn','pa','gu'].map(l => 'translations/' + l + '.js')]) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), c);
const settings = c.window.madhavSearchSettings, manifest = JSON.parse(fs.readFileSync(path.join(root, '.search-build.json'))), config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json')));
const load = file => parseHTML(fs.readFileSync(path.join(dist, file), 'utf8')).document;
const titles = new Set(), descriptions = new Set();
for (const item of [{ file:'index.html', url:settings.origin+'/' },{ file:'_search/ingredients-default.html',url:settings.origin+'/ingredients.html' },...manifest.expected]) {
  const d = load(item.file), description = d.querySelector('meta[name="description"]').content;
  assert(!titles.has(d.title), 'Duplicate title: '+item.file); titles.add(d.title);
  assert(!descriptions.has(description), 'Duplicate description: '+item.file); descriptions.add(description);
  assert.equal(d.querySelectorAll('h1').length,1,item.file+' H1'); assert(d.querySelector('h1').textContent.trim());
  assert.equal(d.querySelector('meta[property="og:url"]').content,item.url);
  assert.equal(d.querySelector('link[rel="canonical"]').href,item.url);
  const graph=JSON.parse(d.getElementById('madhav-structured-data').textContent)['@graph'];
  const faq=graph.find(x=>x['@type']==='FAQPage');
  const visible=[...d.querySelectorAll('details[data-seo-faq],.faq details')];
  assert.equal(faq?.mainEntity.length||0,visible.length,item.file+' FAQ matches visible content');
  visible.forEach((detail,i)=>{assert.equal(faq.mainEntity[i].name,detail.querySelector('summary').textContent.trim());assert.equal(faq.mainEntity[i].acceptedAnswer.text,[...detail.querySelectorAll('p')].map(p=>p.textContent.trim()).join(' '));});
  for(const node of graph) { assert(!node.review && !node.aggregateRating); if(node['@type']==='Product') assert(!node.offers && !node.manufacturer); }
}
for (const [file, entry] of Object.entries(settings.pages)) {
  const d=load(file); assert.equal(d.documentElement.dataset.searchPage,entry.kind);
  if(entry.kind==='category') {
    const ids=Object.keys(c.window.productCatalogue).filter(id=>c.window.productCatalogue[id].group===entry.group);
    const cards=[...d.querySelectorAll('.product-card')];assert.equal(cards.length,ids.length);
    for(const id of ids) assert(d.querySelector('a[href="product.html?product='+id+'"]'));
    assert(d.querySelectorAll('a[href^="ingredients.html?ingredient="]').length>=3);
    assert.equal(d.querySelectorAll('details[data-seo-faq]').length,3);
    for(const card of cards) {const img=card.querySelector('img');assert(img.width>0&&img.height>0);assert.equal(img.getAttribute('loading'),'lazy');}
  }
  const graph=JSON.parse(d.getElementById('madhav-structured-data').textContent)['@graph'];
  if(entry.kind==='article') {const a=graph.find(x=>x['@type']==='Article');assert(a);assert(!a.author && !a.datePublished,'no invented attribution/date');}
  if(entry.kind==='contact') assert(graph.some(x=>x['@type']==='ContactPage'));
  assert(d.querySelector('footer a[href="contact.html"]'));
}
const home=load('index.html');assert(home.querySelector('h1').textContent.includes('Haridwar'));
assert(home.querySelector('.site-footer').textContent.includes('Traditional roots. Everyday care.'));
for(const cat of Object.values(settings.categories)) assert(home.querySelector('a[href="'+cat.path+'"]'));
const contact=load('contact.html');assert(contact.getElementById('distribution-location').textContent.includes('Jagdamba Agency'));
assert(contact.getElementById('contact').textContent.includes('Bhalla Road, Opp. Main Post Office'));
const bare=load('_search/product-default.html');assert(bare.querySelector('meta[name="robots"]').content.includes('noindex'));
assert(config.redirects.some(r=>r.permanent && r.has?.some(h=>h.type==='host'&&h.value==='madhavmarketing.store')&&r.destination===settings.origin+'/:path*'));
function resolve(query) {const u=new URL(query,settings.origin);for(const r of config.rewrites){if(r.source!==u.pathname)continue;let captures={};if(!(r.has||[]).every(h=>{const value=u.searchParams.get(h.key);if(value===null)return false;const m=new RegExp('^(?:'+h.value+')$').exec(value);if(!m)return false;Object.assign(captures,m.groups||{});return true;}))continue;return r.destination.replace(/:([a-zA-Z]+)/g,(_,key)=>captures[key]);}return u.pathname;}
for(const query of ['product.html?product=dard-oil&format=999','product.html?product=dard-oil&format=oops']) assert.equal(resolve(query),'/_search/product-dard-oil.html');
assert(!fs.existsSync(path.join(dist,resolve('product.html?product=unknown-slug'))),'unknown slug resolves to a missing file/404');
const search=require('../search.js')(settings);assert.equal(search.metadata({kind:'product',id:'dard-oil',product:c.window.productCatalogue['dard-oil'],language:'hi'}).canonical,settings.origin+'/product.html?product=dard-oil');
const ui=JSON.parse(fs.readFileSync(path.join(root,'scripts/seo-translation-keys.json')));
for(const lang of ['hi','mr','te','ta','bn','pa','gu']) for(const key of ui) assert(c.window.madhavTranslations[lang][key],lang+': '+key);
console.log('Passed: unique metadata and H1s, all canonical routes, category membership, visible FAQ/schema agreement, no invented offers/authors, host/pack fallbacks, contact facts and seven translated UI dictionaries.');
