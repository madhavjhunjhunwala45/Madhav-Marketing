const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { parseHTML } = require('linkedom');
const root = path.resolve(__dirname, '..');
const { storeConfig } = require('../store-config.mjs');
const createSearch = require('../search.js');
const data = { window: {} }; vm.createContext(data);
for (const file of ['search-settings.js', 'product-data.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), data);
const settings = data.window.madhavSearchSettings, products = data.window.productCatalogue;
const api = createSearch(settings, storeConfig);
const capsules = storeConfig.products.find(item => item.sku === 'arshharan-capsules');
assert.equal(capsules.mrp, 225, 'brand-confirmed Arshharan Capsules MRP is rupees');
assert.equal(capsules.unitPrice, 225, 'brand-confirmed selling price matches the MRP');
let count = 0;
for (const [id, product] of Object.entries(products)) {
  const expected = storeConfig.products.filter(item => item.productId === id);
  const files = ['product-' + id + '.html', ...(product.formats || [product]).map((_, i) => 'product-' + id + '-format-' + i + '.html')];
  for (const [index, file] of files.entries()) {
    const d = parseHTML(fs.readFileSync(path.join(root, 'dist/_search', file), 'utf8')).document;
    const graph = JSON.parse(d.getElementById('madhav-structured-data').textContent)['@graph'];
    const item = graph.find(node => node['@type'] === 'Product');
    assert.equal(graph.filter(node => node['@type'] === 'Product').length, 1, file + ': no duplicate incomplete Product');
    const offers = Array.isArray(item.offers) ? item.offers : [item.offers];
    assert.equal(offers.length, expected.length);
    for (let i = 0; i < expected.length; i++) {
      const offer = offers[i], price = expected[i];
      assert.equal(offer.price, price.unitPrice.toFixed(2), file + ': rupees, never paise');
      assert.equal(offer.priceCurrency, 'INR'); assert.equal(offer.sku, price.sku);
      assert.equal(offer.url, settings.origin + '/product.html?product=' + (products[id].slug || id));
      for (const key of ['availability', 'priceValidUntil', 'review', 'aggregateRating']) assert(!(key in offer));
      if (expected.length > 1) assert(d.querySelector('.mm-pack-prices').textContent.includes('₹' + price.unitPrice.toFixed(2)));
    }
    const selected = expected.find(item => item.formatIndex === (index ? index - 1 : 0)) || expected[0];
    assert.equal(d.querySelector('.store-product-price').textContent, '₹' + selected.unitPrice.toFixed(2));
    assert.equal(d.querySelectorAll('.store-product-price').length, 1);
    assert.equal(d.querySelectorAll('.store-product-buy').length, 1);
    assert(d.querySelector('.store-product-buy').disabled, 'server button waits for its real cart handler');
    const embedded = JSON.parse(d.getElementById('mm-store-data').textContent);
    assert.deepEqual(embedded.products, expected, 'browser data generated from sole price source');
    // The browser must retain offers even when the async cart module has not loaded.
    const c = { window: { document: d, location: new URL(settings.origin + '/product.html?product=' + (products[id].slug || id)),
      madhavSearchSettings: settings, productCatalogue: products, addEventListener() {} }, URL, URLSearchParams };
    vm.createContext(c); vm.runInContext(fs.readFileSync(path.join(root, 'search.js'), 'utf8'), c);
    assert.deepEqual(JSON.parse(d.getElementById('madhav-structured-data').textContent)['@graph'].find(n => n['@type'] === 'Product').offers, item.offers);
    count++;
  }
}
const meta = api.metadata({ kind: 'product', id: 'hriday-rakshak', product: products['hriday-rakshak'] });
assert.equal(api.structuredData(meta)['@graph'].find(n => n['@type'] === 'Product').offers.price, '349.00');
const unpriced = createSearch(settings, { currency: 'INR', products: [{ productId: 'hriday-rakshak', unitPrice: null }] });
assert(!unpriced.structuredData(meta)['@graph'].find(n => n['@type'] === 'Product').offers, 'never invent a price');
for (const file of ['index.html', 'heart-wellness.html', 'joint-muscle-care.html']) {
  const d = parseHTML(fs.readFileSync(path.join(root, 'dist', file), 'utf8')).document;
  for (const card of d.querySelectorAll('.product-card')) {
    assert(card.querySelector('[data-store-price]').textContent.includes('₹'));
    assert.equal(card.querySelectorAll('[data-store-buy]').length, 1);
  }
  assert.equal(d.querySelectorAll('[data-store-header-cart]').length, 1);
}
assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'package.json'))).engines.node, '24.x');
assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'))).packages[''].engines.node, '24.x');
assert(!/cursor\s*:\s*url\(/.test(fs.readFileSync(path.join(root, 'styles.css'), 'utf8')));
console.log('Passed: ' + count + ' product/pack documents, real INR prices and Offers, delayed-cart metadata, stable price/button/header markup, unknown-price guard, supported Node pin and native cursors.');
