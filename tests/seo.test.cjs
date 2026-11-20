const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const { parseHTML } = require('linkedom');
const root = path.resolve(__dirname, '..'), dist = path.join(root, 'dist');
const { storeConfig } = require('../store-config.mjs');
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
  for (const node of graph) {
    assert(!node.review && !node.aggregateRating);
    if (node['@type'] === 'Product') {
      assert(!node.manufacturer);
      const offers = Array.isArray(node.offers) ? node.offers : [node.offers];
      const prices = storeConfig.products.filter(entry => entry.productId === item.id);
      assert.equal(offers.length, prices.length, item.file + ': offers match retail packs');
      offers.forEach((offer, i) => {
        assert.equal(offer['@type'], 'Offer'); assert.equal(offer.price, prices[i].unitPrice.toFixed(2));
        assert.equal(offer.priceCurrency, 'INR'); assert.equal(offer.url, item.url);
        assert(!offer.availability && !offer.priceValidUntil);
      });
    }
  }
  for(const link of d.querySelectorAll('a[href]')){
    const u=new URL(link.getAttribute('href'),item.url);
    if(u.origin===settings.origin&&u.pathname==='/product.html')assert(!['madhumeh-value','madhumeh-premium'].includes(u.searchParams.get('product')),'no internal link uses a redirecting product URL: '+item.file);
  }
}
for (const [file, entry] of Object.entries(settings.pages)) {
  const d=load(file); assert.equal(d.documentElement.dataset.searchPage,entry.kind);
  if(entry.kind==='category') {
    const ids=Object.keys(c.window.productCatalogue).filter(id=>c.window.productCatalogue[id].group===entry.group);
    const cards=[...d.querySelectorAll('.product-card')];assert.equal(cards.length,ids.length);
    for(const id of ids) assert(d.querySelector('a[href="product.html?product='+(c.window.productCatalogue[id].slug||id)+'"]'));
    assert(d.querySelectorAll('a[href^="ingredients.html?ingredient="]').length>=3);
    assert.equal(d.querySelectorAll('details[data-seo-faq]').length,3);
    for(const card of cards) {const img=card.querySelector('img');assert(img.width>0&&img.height>0);assert.equal(img.getAttribute('loading'),'lazy');}
  }
  const graph=JSON.parse(d.getElementById('madhav-structured-data').textContent)['@graph'];
  if(entry.kind==='article') {const a=graph.find(x=>x['@type']==='Article');assert(a);assert(!a.author && !a.datePublished,'no invented attribution/date');}
  if(entry.kind==='contact') assert(graph.some(x=>x['@type']==='ContactPage'));
  assert(d.querySelector('footer a[href="contact.html"]'));
}
const home=load('index.html');assert(home.querySelector('h1').textContent.includes('everyday care.'));assert(!home.title.includes('Haridwar'));
assert(home.querySelector('.site-footer').textContent.includes('Traditional roots. Everyday care.'));
for(const cat of Object.values(settings.categories)) assert(home.querySelector('a[href="'+cat.path+'"]'));
const contact=load('contact.html');assert(contact.getElementById('distribution-location').textContent.includes('Jagdamba Agency'));
assert(contact.getElementById('contact').textContent.includes('Bhalla Road, Opp. Main Post Office'));
const bare=load('_search/product-default.html');assert(bare.querySelector('meta[name="robots"]').content.includes('noindex'));
// Joint-care content must explain the verified formats, not invent new product claims.
const oil=c.window.productCatalogue['dard-oil'],oilSearch=settings.products['dard-oil'];
for(const file of ['_search/product-dard-oil.html','_search/product-dard-oil-format-0.html','_search/product-dard-oil-format-1.html']){
  const d=load(file),questions=[...d.querySelectorAll('#product-questions details[data-seo-faq]')];
  assert.equal(d.querySelector('h1').textContent,oil.title);
  assert.equal(d.title,oilSearch.title);
  assert.equal(d.querySelector('link[rel="canonical"]').href,settings.origin+'/product.html?product=dard-oil');
  assert.equal(questions.length,3,'both packs share one set of factual product answers');
  assert.equal(questions[0].querySelector('p').textContent,oil.benefits,'use answer comes from the verified catalogue');
  assert.equal(questions[2].querySelector('p').textContent,oil.application,'both packs share palm-warming and gentle-massage instructions');
  assert.equal(d.querySelector('#mm-gentle-massage span').textContent,oil.application);
  const packIndex=file.includes('format-1')?1:0;
  assert.equal(d.querySelector('#product-directions').textContent,oil.formats[packIndex].directions,'printed pack directions stay separate and unchanged');
  assert(questions[1].textContent.includes('only the pack size differs'));
  assert(questions[1].textContent.includes('per 100 ml'));
  assert(d.querySelector('#mm-category-crumb[href="joint-muscle-care.html"]'));
}
// Every actual product now has its own source-backed answers, without inheriting another product's directions.
for(const [id,product] of Object.entries(c.window.productCatalogue)){
  const entry=settings.products[id];assert.equal(entry.faqs.length,3,id+': three product-specific answers');
  for(const suffix of ['', '-format-0']){
    const d=load('_search/product-'+id+suffix+'.html');
    assert.equal(d.querySelectorAll('#product-questions').length,1,id+': one FAQ article');
    assert.equal(d.querySelector('#product-questions h3').textContent,entry.faqHeading);
    assert.equal(d.querySelector('#product-directions').textContent,(product.formats||[product])[0].directions);
    assert.equal(d.querySelector('#product-precautions').textContent,product.precautions);
    const answers=[...d.querySelectorAll('#product-questions details[data-seo-faq]')];
    entry.faqs.forEach((item,i)=>{
      assert.equal(answers[i].querySelector('summary').textContent,item.question);
      assert.equal(answers[i].querySelector('p').textContent,item.answerSource?product[item.answerSource]:item.answer);
    });
  }
}
const additionalProducts=c.window.productCatalogue;
assert.equal(additionalProducts['dard-capsule'].ingredients.length,13);
assert.equal(additionalProducts['dard-capsule'].pack,'30 capsules');
assert.equal(additionalProducts['dard-capsule'].basis,'Each capsule contains');
for(const name of ['Nirgundi','Haridra','Sonth','Pippali'])assert(additionalProducts['dard-capsule'].ingredients.some(row=>row[0]===name));
assert.equal(additionalProducts['hriday-rakshak'].ingredients.length,12);
assert.equal(additionalProducts['hriday-rakshak'].pack,'200 g');
assert.equal(additionalProducts['hriday-rakshak'].basis,'Each gram contains.');
for(const name of ['Arjun chhal','Lahsun','Ashwagandha'])assert(additionalProducts['hriday-rakshak'].ingredients.some(row=>row[0]===name));
assert.equal(additionalProducts['kabi-haran'].pack,'100 g granules');
assert.equal(additionalProducts['kabi-haran'].basis,'Each 100 g contains (percentages w/w as printed)');
for(const name of ['Senna','Haritaki','Amla','Saunf'])assert(additionalProducts['kabi-haran'].ingredients.some(row=>row[0]===name));
assert.equal(additionalProducts.arshharan.pack,'300 ml syrup');
assert.equal(additionalProducts.arshharan.basis,'Each 10 ml contains extracts derived from');
assert.equal(additionalProducts['arshharan-capsules'].pack,'30 capsules');
assert.equal(additionalProducts['arshharan-capsules'].basis,'Each 500 mg capsule contains, as printed on the supplied panel.');
assert.notEqual(JSON.stringify(additionalProducts.arshharan.ingredients),JSON.stringify(additionalProducts['arshharan-capsules'].ingredients));
for(const group of ['digestion','heart','piles']){
  const entry=settings.categories[group],d=load(entry.path);
  assert.equal(d.querySelector('h1').textContent,entry.heading);
  const care=d.querySelector('.mm-seo-care-grid').textContent;
  for(const [id,p]of Object.entries(additionalProducts).filter(([,p])=>p.group===group)){
    assert(care.includes(p.directions));assert(care.includes(p.precautions));
    assert([...d.querySelectorAll('a[href="product.html?product='+id+'#composition"]')].some(a=>a.textContent==='Ingredients in '+p.title));
  }
}
const heartQuestions=[...load('heart-wellness.html').querySelectorAll('details[data-seo-faq] p')];
assert.equal(heartQuestions[0].textContent,additionalProducts['hriday-rakshak'].benefits);
assert.equal(heartQuestions[1].textContent,settings.products['hriday-rakshak'].faqs.find(f=>f.id==='composition').answer);
const digestiveQuestions=[...load('digestive-wellness.html').querySelectorAll('details[data-seo-faq] p')];
assert.equal(digestiveQuestions[0].textContent,settings.products['kabi-haran'].faqs.find(f=>f.id==='composition').answer);
assert.equal(digestiveQuestions[1].textContent,additionalProducts['kabi-haran'].precautions);
const joint=load('joint-muscle-care.html');
for(const [id,name] of [['dard-oil','Dard Haran Oil'],['dard-capsule','Dard Haran Capsule']]){
  assert([...joint.querySelectorAll('a[href="product.html?product='+id+'#composition"]')].some(a=>a.textContent==='Ingredients in '+name),'descriptive composition links keep the correct product mapping');
}
const jointQuestions=[...joint.querySelectorAll('details[data-seo-faq]')];
assert.equal(jointQuestions[0].querySelector('summary').textContent,'How do Dard Haran Oil and Capsule differ?');
assert(jointQuestions[0].textContent.includes('external massage')&&jointQuestions[0].textContent.includes('oral formulation'));
assert.equal(jointQuestions[1].querySelector('summary').textContent,oilSearch.faqs.find(f=>f.id==='packs').question);
assert(joint.querySelector('.mm-seo-care-grid').textContent.includes(oil.application));
assert(joint.querySelector('.mm-seo-care-grid').textContent.includes(c.window.productCatalogue['dard-capsule'].directions));
assert(config.redirects.some(r=>r.permanent && r.has?.some(h=>h.type==='host'&&h.value==='madhavmarketing.store')&&r.destination===settings.origin+'/:path*'));
function resolve(query) {const u=new URL(query,settings.origin);for(const r of config.rewrites){if(r.source!==u.pathname)continue;let captures={};if(!(r.has||[]).every(h=>{const value=u.searchParams.get(h.key);if(value===null)return false;const m=new RegExp('^(?:'+h.value+')$').exec(value);if(!m)return false;Object.assign(captures,m.groups||{});return true;}))continue;return r.destination.replace(/:([a-zA-Z]+)/g,(_,key)=>captures[key]);}return u.pathname;}
for(const query of ['product.html?product=dard-oil&format=999','product.html?product=dard-oil&format=oops']) assert.equal(resolve(query),'/_search/product-dard-oil.html');
assert(!fs.existsSync(path.join(dist,resolve('product.html?product=unknown-slug'))),'unknown slug resolves to a missing file/404');
const search=require('../search.js')(settings);assert.equal(search.metadata({kind:'product',id:'dard-oil',product:c.window.productCatalogue['dard-oil'],language:'hi'}).canonical,settings.origin+'/product.html?product=dard-oil');
// The six reported crawlable pages must retain independent, indexable public URLs.
const directory=load('_search/ingredients-default.html');
const directoryIndex=directory.getElementById('ingredient-directory-index');
assert(directoryIndex&&!directoryIndex.hasAttribute('hidden')&&!directoryIndex.hasAttribute('open'),'compact native index is available in served HTML');
const guideEntries=Object.entries(c.window.ingredientGuide).filter(([,entry])=>!entry.guideHidden);
assert.equal(directoryIndex.querySelectorAll('nav a').length,guideEntries.length);
for(const [id] of guideEntries)assert(directoryIndex.querySelector('a[href="ingredients.html?ingredient='+id+'#ingredient-'+id+'"]'),'every public profile has a permanent directory link: '+id);
const issueFiles=['_search/ingredients-default.html','karela-jamun-metabolic-wellness.html'];
for(const id of ['clove','mochras','surana','bibhitaki']){
  const file='_search/ingredient-'+id+'.html',d=load(file);issueFiles.push(file);
  assert.equal(d.querySelector('meta[name="description"]').content,settings.ingredients.profiles[id].description);
  assert(d.querySelector('#ingredient-directory-index[hidden]'),'full directory is kept out of the profile view');
  const notes=[...d.querySelectorAll('.ingredient-products .mm-ingredient-product-note')];
  const expected=[];
  for(const [pid,product] of Object.entries(c.window.productCatalogue)){
    const rows=new Set();
    for(const format of product.formats||[product])for(const row of format.ingredients||[]){
      if(c.window.ingredientAliases[row[0]]!==id)continue;
      const signature=JSON.stringify(row.slice(0,3))+'|'+format.basis;
      if(rows.has(signature))continue;rows.add(signature);expected.push({pid,row,basis:format.basis});
    }
  }
  assert.equal(notes.length,expected.length,id+': each unique printed row appears once, including one shared oil formula');
  expected.forEach(({pid,row,basis},i)=>{
    const facts=notes[i].querySelector('.component-identity').textContent;
    assert(facts.includes('As printed on the product label'));
    for(const value of row.slice(0,3))if(value)assert(facts.includes(value),id+': exact printed name/detail/quantity retained');
    assert(notes[i].querySelector('.component-evidence').textContent.includes(basis));
    assert(d.querySelector('.ingredient-products a[href="product.html?product='+(c.window.productCatalogue[pid].slug||pid)+'#composition"]'));
  });
}
for(const file of issueFiles){
  const d=load(file),canonical=d.querySelector('link[rel="canonical"]').href;
  assert(d.querySelector('meta[name="robots"]').content.startsWith('index,follow'),file+': indexable');
  assert(fs.readFileSync(path.join(dist,'sitemap.xml'),'utf8').includes(canonical.replaceAll('&','&amp;')),file+': canonical in sitemap');
  assert(d.querySelector('main').textContent.trim().length>500,file+': content delivered without JavaScript');
}
const value=c.window.productCatalogue['madhumeh-value'],premium=c.window.productCatalogue['madhumeh-premium'];
assert.equal(value.pack,'200 g');assert.equal(premium.pack,'200 g');
assert.equal(value.basis,'Each gram contains.');assert.equal(premium.basis,'Each gram contains.');
assert(!value.ingredients.some(row=>c.window.ingredientAliases[row[0]]==='vasant-kusumakar'));
assert.equal(premium.ingredients.find(row=>c.window.ingredientAliases[row[0]]==='vasant-kusumakar')[2],'10 mg');
const metabolic=load('karela-jamun-metabolic-wellness.html');
assert(metabolic.querySelector('main').textContent.includes('at 10 mg per gram'));
assert(metabolic.querySelector('details[data-seo-faq] p').textContent.includes('the Madhumeh Haran panel does not list this ingredient'));
const daruhaldiNotes=[...load('_search/ingredient-daruhaldi.html').querySelectorAll('.ingredient-products .mm-ingredient-product-note')];
assert.equal(daruhaldiNotes.length,3,'one role per product even when a label lists two forms');
assert.equal(daruhaldiNotes[2].querySelectorAll('.component-identity').length,2,'retain both Daruhaldi and Rasont label rows');
for(const row of c.window.productCatalogue.arshharan.ingredients.filter(row=>c.window.ingredientAliases[row[0]]==='daruhaldi'))for(const value of row.slice(0,3))assert(daruhaldiNotes[2].textContent.includes(value));
// Product names must agree across the catalogue, server HTML, metadata and Google Product data.
for(const [id,name,count] of [['madhumeh-value','Madhumeh Haran',14],['madhumeh-premium','Madhumeh Haran BKR',16]]){
  const product=c.window.productCatalogue[id],entry=settings.products[id];
  assert.equal(product.title,name);assert.equal(product.displayTitle,name);
  assert.equal(product.pack,'200 g');assert.equal(product.basis,'Each gram contains.');assert.equal(product.ingredients.length,count);
  for(const alias of ['karela','jamun'])assert.equal(product.ingredients.find(row=>c.window.ingredientAliases[row[0]]===alias)[2],'250 mg');
  for(const suffix of ['', '-format-0']){
    const d=load('_search/product-'+id+suffix+'.html');
    assert.equal(d.querySelector('h1').textContent,name);
    assert.equal(d.title,entry.title);assert.equal(d.querySelector('meta[name="description"]').content,entry.description);
    assert.equal(d.querySelector('link[rel="canonical"]').href,settings.origin+'/product.html?product='+product.slug,'new public canonical URL');
    const graph=JSON.parse(d.getElementById('madhav-structured-data').textContent)['@graph'];
    const structured=graph.find(node=>node['@type']==='Product');assert.equal(structured.name,name);
    assert.equal(structured.offers.price,storeConfig.products.find(p=>p.productId===id).unitPrice.toFixed(2));
    assert.equal(d.querySelector('#product-directions').textContent,product.directions,'no dose inferred from another formulation');
    const faqs=[...d.querySelectorAll('#product-questions details[data-seo-faq]')];assert.equal(faqs.length,3);
    assert.equal(faqs[0].querySelector('p').textContent,product.benefits);
    assert.equal(faqs[2].querySelector('p').textContent,product.directions);
    assert(faqs[1].querySelector('p').textContent.includes(count+' component')||faqs[1].querySelector('p').textContent.includes(count+'-component'));
  }
  assert([...home.querySelectorAll('.product-card h3')].some(h=>h.textContent===name));
  assert([...metabolic.querySelectorAll('.product-card h3')].some(h=>h.textContent===name));
  assert([...metabolic.querySelectorAll('a[href="product.html?product='+product.slug+'#composition"]')].some(a=>a.textContent==='Ingredients in '+name));
  assert(metabolic.querySelector('.mm-seo-care-grid').textContent.includes(product.directions));
}
assert.equal(metabolic.querySelector('h1').textContent,'Karela Jamun formulations for metabolic wellbeing');
function checkNoRetiredNames(folder){for(const item of fs.readdirSync(folder,{withFileTypes:true})){const file=path.join(folder,item.name);if(item.isDirectory())checkNoRetiredNames(file);else if(/\.(html|js|mjs)$/.test(item.name))assert(!/Madhumeh Haran (?:Value|Premium)|\bValue and Premium\b/.test(fs.readFileSync(file,'utf8')),'retired visible names in '+file);}}
checkNoRetiredNames(dist);
const updatedSeoPaths=[...['dard-capsule','kabi-haran','hriday-rakshak','arshharan','arshharan-capsules'].map(id=>'product.html?product='+id),'digestive-wellness.html','heart-wellness.html','piles-fissure-care.html'];
for(const url of updatedSeoPaths)assert(fs.readFileSync(path.join(dist,'sitemap.xml'),'utf8').includes('<loc>'+settings.origin+'/'+url+'</loc><lastmod>'+require('../scripts/seo-updates.json')[url]+'</lastmod>'),'actual SEO update date: '+url);
// Broad category searches and exact product searches have different page headings.
assert.equal(home.title, 'Madhav Marketing | Ayurvedic Wellness Products');
for (const [group, entry] of Object.entries(settings.categories)) {
  const d = load(entry.path);
  assert.equal(d.querySelector('h1').textContent, entry.heading);
  assert.equal(d.querySelector('.mm-seo-products').parentElement.querySelector('h2').textContent, entry.productHeading);
  assert.notEqual(entry.heading, entry.productHeading, group + ': category purpose differs from product heading');
  for (const product of Object.values(c.window.productCatalogue).filter(p => p.group === group)) {
    assert(d.querySelector('main').textContent.includes(product.title), group + ': names remain visible');
  }
}
assert(settings.categories.digestion.heading.includes('occasional constipation'));
assert(settings.products['kabi-haran'].description.includes('traditionally used for occasional constipation'));
assert(!home.querySelector('meta[name="keywords"]'), 'no hidden keyword stuffing');
const siteGraph = JSON.parse(home.getElementById('madhav-structured-data').textContent)['@graph'];
for (const type of ['Organization', 'WebSite']) assert.equal(siteGraph.find(n => n['@type'] === type).name, 'Madhav Marketing');
assert.equal(home.querySelector('meta[property="og:site_name"]').content, 'Madhav Marketing');
// Image extensions add genuine product photographs without adding canonical pages.
const { DOMParser } = require('linkedom');
const xml = new DOMParser().parseFromString(fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8'), 'text/xml');
assert.equal(xml.documentElement.getAttribute('xmlns:image'), 'http://www.google.com/schemas/sitemap-image/1.1');
const urls = [...xml.getElementsByTagName('url')];
assert.equal(urls.length, 110);
assert.equal(xml.getElementsByTagName('image:image').length, 8);
const updates = require('../scripts/seo-updates.json');
for (const [relative, date] of Object.entries(updates)) {
  const entry = urls.find(node => node.querySelector('loc').textContent === settings.origin + '/' + relative);
  assert(entry, 'content-date key has an actual canonical URL: ' + relative);
  assert.equal(entry.querySelector('lastmod').textContent, date);
}
for (const [id, product] of Object.entries(c.window.productCatalogue)) {
  const url = settings.origin + '/product.html?product=' + (product.slug || id);
  const entry = urls.find(node => node.querySelector('loc').textContent === url);
  const images = [...entry.getElementsByTagName('image:loc')];
  assert.equal(images.length, 1);
  assert.equal(images[0].textContent, settings.origin + '/' + product.image);
  assert(fs.statSync(path.join(dist, product.image)).size > 0, 'advertised photo is deployed: ' + id);
}
const ui=JSON.parse(fs.readFileSync(path.join(root,'scripts/seo-translation-keys.json')));
for(const lang of ['hi','mr','te','ta','bn','pa','gu']) for(const key of ui) assert(c.window.madhavTranslations[lang][key],lang+': '+key);
for (const lang of ['hi','mr','te','ta','bn','pa','gu']) {
  const dictionary = c.window.madhavTranslations[lang];
  const texts = [settings.home.title, settings.home.description,
    ...Object.values(settings.categories).flatMap(entry => [entry.heading, entry.productHeading, entry.intro]),
    ...Object.values(settings.pages).flatMap(entry => [entry.title, entry.description])];
  for (const text of texts) assert(dictionary[text] && dictionary[text] !== text, lang + ': translated SEO copy: ' + text);
}
console.log('Passed: unique metadata and H1s, canonical routes, category membership, visible FAQ/schema agreement, real INR offers without invented ratings/stock/authors, host/pack fallbacks, contact facts and seven translated dictionaries.');
