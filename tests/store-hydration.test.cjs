const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { parseHTML } = require('linkedom');
const root = path.resolve(__dirname, '..'), { storeConfig } = require('../store-config.mjs');
const data = { window: {} }; vm.createContext(data); vm.runInContext(fs.readFileSync(path.join(root, 'product-data.js'), 'utf8'), data);
const products = data.window.productCatalogue;
const stripImports = code => code.replace(/import\s*\{[^}]*\}\s*from\s*["'][^"']+["'];?/g, '');
function mount(file, query, language, built) {
  const document = parseHTML(fs.readFileSync(path.join(root, 'dist', file), 'utf8')).document;
  let stored = '[]';
  const location = new URL('https://www.madhavmarketingayurveda.in/' + query);
  const c = { document, location, storeConfig, siteSettings: {}, URL, URLSearchParams, Intl, performance, queueMicrotask,
    setTimeout() { return 1; }, clearTimeout() {},
    localStorage: { getItem() { return stored; }, setItem(key, value) { stored = value; } },
    window: { location, productCatalogue: products, addEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {} }),
      MadhavI18n: { language, translate: text => text } } };
  vm.createContext(c);
  const price = document.querySelector('[data-store-price]'), button = document.querySelector('[data-store-buy]');
  vm.runInContext(stripImports(fs.readFileSync(path.join(root, built ? 'dist/shop.js' : 'shop.js'), 'utf8')), c);
  vm.runInContext('initializeMadhavShop()', c);
  assert.equal(document.querySelector('[data-store-price]'), price, 'reuse server price node');
  assert.equal(document.querySelector('[data-store-buy]'), button, 'reuse server action node');
  assert.equal(document.querySelectorAll('#madhav-store').length, 1);
  return { document, c, get stored() { return JSON.parse(stored); } };
}
let cases = 0;
for (const built of [false, true]) for (const language of ['en', 'hi', 'mr', 'te', 'ta', 'bn', 'pa', 'gu']) {
  const view = mount('_search/product-hriday-rakshak.html', 'product.html?product=hriday-rakshak', language, built);
  const button = view.document.querySelector('.store-product-buy');
  assert(!button.disabled); button.click();
  assert.equal(view.stored[0].sku, 'hriday-rakshak'); assert.equal(view.stored[0].quantity, 1, 'one listener per action');
  assert.equal(view.document.querySelector('.store-product-price').textContent,
    new Intl.NumberFormat(language + '-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(349));
  assert.equal(view.document.querySelectorAll('.store-product-buy').length, 1); cases++;
}
for (const built of [false, true]) {
  const view = mount('index.html', '', 'en', built);
  assert.equal(view.document.querySelectorAll('.product-card [data-store-price]').length, 8);
  assert.equal(view.document.querySelectorAll('.product-card [data-store-buy]').length, 8);
  view.document.querySelector('.product-card button[data-store-buy]').click();
  assert.equal(view.stored[0].quantity, 1);
  const oil = mount('_search/product-dard-oil.html', 'product.html?product=dard-oil', 'en', built);
  const options = [...oil.document.querySelectorAll('#format-options button')];
  options.forEach((button, i) => button.setAttribute('aria-pressed', String(i === 1))); options[1].click();
  assert.equal(oil.document.querySelector('.store-product-price').textContent, '₹220.00');
  oil.document.querySelector('.store-product-buy').click();
  assert.equal(oil.stored[0].sku, 'dard-oil-100'); assert.equal(oil.stored[0].quantity, 1); cases += 2;
}
console.log('Passed: ' + cases + ' source/bundled SSR cart hydration cases, eight languages, single bindings, all homepage actions and correct 100 ml price/SKU.');
