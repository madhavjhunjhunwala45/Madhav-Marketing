const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const { parseHTML } = require('linkedom');
const createSearch = require('../search.js');
const root = path.resolve(__dirname, '..'), output = path.join(root, 'dist');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const context = { window: {} }; vm.createContext(context);
for (const name of ['product-data.js', 'ingredient-data.js', 'search-settings.js']) vm.runInContext(read(name), context);
const products = context.window.productCatalogue, ingredients = context.window.ingredientGuide;
const search = createSearch(context.window.madhavSearchSettings);
const manifest = JSON.parse(read('.search-build.json'));
const config = JSON.parse(read('vercel.json'));

function resolveURL(value) {
  const url = new URL(value, search.origin);
  let pathname = url.pathname;
  if (pathname === '/') pathname = '/index.html';
  for (const rule of config.rewrites) {
    if (rule.source !== url.pathname) continue;
    let matches = true, params = {};
    for (const condition of rule.has || []) {
      const candidate = url.searchParams.get(condition.key);
      const match = candidate != null && new RegExp('^(?:' + condition.value + ')$').exec(candidate);
      if (!match) { matches = false; break; }
      Object.assign(params, match.groups || {});
    }
    if (matches) { pathname = rule.destination.replace(/:([a-zA-Z]+)/g, (_, key) => params[key]); break; }
  }
  return path.join(output, pathname);
}

const all = [{ url: search.origin + '/', file: 'index.html' },
  { url: search.absolute('ingredients.html'), file: '_search/ingredients-default.html' }, ...manifest.expected];
const urls = new Set(all.map(item => item.url));
assert.equal(urls.size, 2 + Object.keys(products).length + Object.values(ingredients).filter(item => !item.guideHidden).length);
assert(!fs.existsSync(path.join(output, 'product.html')), 'filesystem must not override product query rewrites');
assert(!fs.existsSync(path.join(output, 'ingredients.html')), 'filesystem must not override ingredient query rewrites');
assert.equal(config.buildCommand, 'npm run build');
assert.equal(config.installCommand, 'npm ci --include=dev --ignore-scripts');
assert.equal(config.outputDirectory, 'dist');
assert(!fs.existsSync(path.join(output, 'node_modules')));
assert(!fs.existsSync(path.join(output, 'scripts')));
let internalReferences = 0, jsonGraphs = 0;
for (const item of all) {
  assert.equal(resolveURL(item.url), path.join(output, item.file), item.url);
  const html = fs.readFileSync(path.join(output, item.file), 'utf8');
  const { document } = parseHTML(html);
  assert.equal(document.querySelectorAll('title').length, 1, item.file);
  assert(document.title.trim().length >= 10, item.file);
  assert.equal(document.querySelectorAll('meta[name="description"]').length, 1, item.file);
  assert(document.querySelector('meta[name="description"]').getAttribute('content').length > 40, item.file);
  assert.equal(document.querySelector('link[rel="canonical"]').getAttribute('href'), item.url, item.file);
  assert(document.querySelector('meta[name="robots"]').getAttribute('content').startsWith('index,follow'), item.file);
  const data = JSON.parse(document.getElementById('madhav-structured-data').textContent);
  assert.equal(data['@context'], 'https://schema.org'); jsonGraphs++;
  assert(data['@graph'].find(node => node['@type'] === 'Organization').url === search.origin + '/');
  if (item.kind === 'product') {
    const product = products[item.id], format = product.formats?.[0] || product;
    assert.equal(document.getElementById('product-title').textContent, product.title);
    assert.equal(document.getElementById('product-description').textContent, product.description);
    assert.equal(document.getElementById('product-benefits').textContent, product.benefits);
    assert.equal(document.getElementById('product-directions').textContent, format.directions);
    assert.equal(document.getElementById('product-precautions').textContent, product.precautions);
    const rows = [...document.querySelectorAll('#composition-body tr')];
    assert.equal(rows.length, format.ingredients.length);
    rows.forEach((row, index) => {
      assert.equal(row.querySelector('.component-name').textContent, format.ingredients[index][0]);
      assert.equal(row.querySelector('.component-identity').textContent, format.ingredients[index][1]);
      assert.equal(row.querySelector('.component-quantity').textContent, format.ingredients[index][2]);
    });
    assert.equal(document.querySelectorAll('#related-grid .product-card').length, 3);
    assert.equal(document.querySelectorAll('#format-options button').length, product.formats?.length || 0);
    const markup = data['@graph'].find(node => node['@type'] === 'Product');
    assert.equal(markup.name, product.title); assert(!markup.offers); assert(!markup.aggregateRating); assert(!markup.review);
  }
  if (item.kind === 'ingredient') {
    const ingredient = ingredients[item.id], card = document.querySelector('#ingredient-grid .ingredient-card');
    assert.equal(document.querySelectorAll('#ingredient-grid .ingredient-card').length, 1);
    assert.equal(card.querySelector('h2').textContent, ingredient.title);
    assert.equal(card.querySelector('.ingredient-description').textContent, ingredient.paragraph);
    assert.equal(card.querySelector('.ingredient-benefit').textContent, ingredient.shortBenefit);
    assert.equal(card.querySelector('.evidence-label').textContent, ingredient.evidenceLabel);
    for (const source of ingredient.sources || []) assert([...card.querySelectorAll('a')].some(a => new URL(a.getAttribute('href'), search.origin).href === new URL(source.url).href), item.id + ' source: ' + source.url);
  }
  for (const element of document.querySelectorAll('[src],link[href],a[href]')) {
    const ref = element.getAttribute('src') || element.getAttribute('href');
    if (!ref || ref.startsWith('#') || /^(?:https?:|mailto:|tel:|data:|blob:)/.test(ref)) continue;
    const target = resolveURL(new URL(ref, item.url));
    assert(fs.existsSync(target), item.file + ' -> ' + ref); internalReferences++;
  }
}
for (const [id, product] of Object.entries(products)) for (const [i, format] of (product.formats || [product, product]).entries()) {
  const target = resolveURL(search.absolute('product.html?product=' + id + '&format=' + i + '&lang=hi&utm_source=test'));
  assert(fs.existsSync(target), target);
  const { document } = parseHTML(fs.readFileSync(target, 'utf8'));
  assert.equal(document.getElementById('product-pack').textContent, format.pack);
  assert.equal(document.getElementById('product-directions').textContent, format.directions);
  assert.equal(document.querySelectorAll('#composition-body tr').length, format.ingredients.length);
}
const home = parseHTML(fs.readFileSync(path.join(output, 'index.html'), 'utf8')).document;
assert.equal(home.querySelectorAll('#product-grid .product-card').length, 8);
const cart = parseHTML(fs.readFileSync(path.join(output, 'cart.html'), 'utf8')).document;
assert(cart.querySelector('meta[name="robots"]').content.startsWith('noindex,follow'));
const invalid = parseHTML(fs.readFileSync(path.join(output, '_search/product-default.html'), 'utf8')).document;
assert(invalid.querySelector('meta[name="robots"]').content.startsWith('noindex,follow'));
assert.equal(search.metadata({ kind: 'product', id: 'x', product: null }).index, false);
const hindi = search.metadata({ kind: 'product', id: 'dard-oil', product: products['dard-oil'], language: 'hi' });
assert.equal(hindi.canonical, search.origin + '/product.html?product=dard-oil&lang=hi');
assert(!search.json({ text: '</script><script>alert(1)</script>' }).includes('<'));
const sitemap = fs.readFileSync(path.join(output, 'sitemap.xml'), 'utf8');
const listed = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1].replace(/&amp;/g, '&'));
assert.deepEqual(listed, manifest.sitemapUrls); assert.equal(new Set(listed).size, listed.length);
assert(!listed.some(url => /cart|vercel\.app|_search|format=/.test(url)));
assert(fs.readFileSync(path.join(output, 'robots.txt'), 'utf8').includes('Sitemap: ' + search.origin + '/sitemap.xml'));
const oldHost = config.redirects.find(rule => rule.has?.some(condition => condition.type === 'host'));
assert.equal(oldHost.has[0].value, 'madhav-marketing.vercel.app'); assert.equal(oldHost.permanent, true);
console.log('Passed: ' + all.length + ' canonical pages, ' + jsonGraphs + ' structured-data graphs, ' + internalReferences + ' internal asset/link references, exact product/ingredient wording, pack versions, sitemap, safe metadata and routing.');
