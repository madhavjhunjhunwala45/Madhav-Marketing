/* Repository routing contract. Live DNS, certificates and Vercel dashboard redirects need external checks. */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..'), config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json')));
const c = { window: {} }; vm.createContext(c); vm.runInContext(fs.readFileSync(path.join(root, 'search-settings.js'), 'utf8'), c);
const origin = c.window.madhavSearchSettings.origin;
assert.equal(origin, 'https://www.madhavmarketingayurveda.in');
const hosts = ['madhavmarketing.store', 'www.madhavmarketing.store', 'madhavmarketingayurveda.in', 'madhav-marketing.vercel.app'];
let cases = 0;
for (const host of hosts) for (const protocol of ['http:', 'https:']) for (const suffix of ['/', '/?lang=hi&utm_source=domain-test', '/product.html?product=hriday-rakshak', '/product.html?product=dard-oil&format=1&lang=hi&utm_source=test', '/ingredients.html?ingredient=turmeric#ingredient-turmeric']) {
  const url = new URL(protocol + '//' + host + suffix);
  const source = url.pathname === '/' ? '/' : '/:path*';
  const matches = config.redirects.filter(rule => rule.source === source && rule.has?.some(h => h.type === 'host' && h.value === url.hostname));
  assert.equal(matches.length, 1, 'one direct host redirect: ' + url);
  const rule = matches[0]; assert(rule.permanent);
  assert.equal(rule.destination, origin + (source === '/' ? '/' : '/:path*')); assert(!new URL(rule.destination).search, 'no replacement query string');
  const target = new URL(rule.destination.replace('/:path*', url.pathname));
  target.search = url.search; target.hash = url.hash;
  assert.equal(target.href, origin + suffix, 'path and query retention contract'); cases++;
}
assert(!config.redirects.some(rule => rule.has?.some(h => h.type === 'host' && h.value === new URL(origin).hostname)), 'no primary-domain redirect loop');
for (const host of hosts) {
  const first = config.redirects.find(rule => rule.has?.some(h => h.type === 'host' && h.value === host));
  assert.equal(first.source, '/', 'explicit homepage redirect precedes wildcard for ' + host);
}
const generated = JSON.parse(fs.readFileSync(path.join(root, '.search-build.json'))).deployment;
assert.deepEqual(config.redirects, generated.redirects);
// Public URLs change without renaming the retail SKUs or losing saved carts.
vm.runInContext(fs.readFileSync(path.join(root,'product-data.js'),'utf8'),c);
const products=c.window.productCatalogue;
for(const [legacy,slug] of [['madhumeh-value','madhumeh-haran'],['madhumeh-premium','madhumeh-haran-bkr']]){
  assert.equal(products[legacy].slug,slug);
  const rules=config.redirects.filter(rule=>rule.source==='/product.html'&&rule.has?.some(h=>h.type==='query'&&h.key==='product'&&h.value===legacy));
  assert.equal(rules.length,1);assert(rules[0].permanent);
  assert.equal(rules[0].destination,origin+'/product.html?product='+slug);
  assert(config.redirects.indexOf(rules[0])<config.redirects.findIndex(rule=>rule.has?.some(h=>h.type==='host')),'legacy product goes directly to the canonical host');
  assert(!config.redirects.some(rule=>rule.has?.some(h=>h.type==='query'&&h.key==='product'&&h.value===slug)),'no new-slug redirect loop');
  for(const suffix of ['', '&lang=hi', '&format=0&lang=gu&utm_source=a%26b', '&format=invalid&utm_term=x%20y']){
    const input=new URL(origin+'/product.html?product='+legacy+suffix+'#composition'),target=new URL(rules[0].destination);
    const query=new URLSearchParams(input.search);
    for(const [key,value] of target.searchParams)query.set(key,value);
    target.search=query.toString();target.hash=input.hash;
    assert.equal(target.searchParams.getAll('product').length,1);assert.equal(target.searchParams.get('product'),slug);
    for(const [key,value] of input.searchParams)if(key!=='product')assert.equal(target.searchParams.get(key),value);
    assert.equal(target.hash,'#composition');cases++;
  }
  for(const format of ['', '0', '999', 'invalid']){
    const u=new URL(origin+'/product.html?product='+slug+(format?'&format='+format:''));
    const rewrite=config.rewrites.find(rule=>rule.source===u.pathname&&(rule.has||[]).every(h=>h.type==='query'&&new RegExp('^(?:'+h.value+')$').test(u.searchParams.get(h.key)||'')));
    assert(rewrite);assert.equal(rewrite.destination,'/_search/product-'+legacy+(format==='0'?'-format-0':'')+'.html');
  }
}
const sitemap = fs.readFileSync(path.join(root, 'dist/sitemap.xml'), 'utf8');
for(const [legacy,slug] of [['madhumeh-value','madhumeh-haran'],['madhumeh-premium','madhumeh-haran-bkr']]){
  assert(sitemap.includes('<loc>'+origin+'/product.html?product='+slug+'</loc><lastmod>2026-11-20</lastmod>'));
  assert(!sitemap.includes('?product='+legacy),'legacy URL is excluded from sitemap');
}
assert(!sitemap.includes('madhavmarketing.store'));
assert(fs.readFileSync(path.join(root, 'dist/robots.txt'), 'utf8').includes('Sitemap: ' + origin + '/sitemap.xml'));
console.log('Passed: ' + cases + ' HTTP/HTTPS host/path/query routing contracts, no primary-host loop, matching build configuration and canonical sitemap.');
