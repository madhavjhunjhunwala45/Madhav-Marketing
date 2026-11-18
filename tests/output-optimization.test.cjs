const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const { parseHTML } = require('linkedom');
const root = path.resolve(__dirname, '..'), output = path.join(root, 'dist');
const home = parseHTML(fs.readFileSync(path.join(output, 'index.html'), 'utf8')).document;
const notFound = parseHTML(fs.readFileSync(path.join(output, '404.html'), 'utf8')).document;
assert.equal(notFound.querySelectorAll('h1').length, 1);
assert(notFound.querySelector('meta[name="robots"]').getAttribute('content').includes('noindex'));
assert(notFound.querySelector('main a[href$="#products"]'), 'missing URLs retain a path back to the catalogue');
assert(!notFound.querySelector('#product-title'), '404 view never pretends to be a purchasable product');
const initial = home.getElementById('madhav-initial-styles'); assert(initial?.textContent.length > 1000);
const full = home.querySelector('link[data-madhav-full-styles]'); assert.equal(full.getAttribute('media'), 'print');
assert(home.querySelector('noscript link[rel="stylesheet"]'), 'full styles work without JavaScript');
const runtime = fs.readFileSync(path.join(output, 'website.js'), 'utf8'); assert(runtime.includes('data-madhav-full-styles'));
assert(home.querySelector('script[type="module"][src^="shop.js"][async]'), 'cart module does not delay DOMContentLoaded');
const shopScript = home.querySelector('script[type="module"][src^="shop.js"]');
const shopHints = [...home.querySelectorAll('link[rel="modulepreload"]')].filter(link => link.getAttribute('href') === shopScript.getAttribute('src'));
assert.equal(shopHints.length, 1, 'the exact versioned cart URL is discovered once in the head');
assert.equal(shopHints[0].getAttribute('fetchpriority'), 'low', 'the cart hint does not compete with the high-priority hero image');
assert.equal(shopHints[0].parentNode, home.head);
assert(home.head.innerHTML.indexOf(shopHints[0].outerHTML) < home.head.innerHTML.indexOf(initial.outerHTML), 'the scanner finds cart code before the large initial CSS block');
const builtShop = fs.readFileSync(path.join(output, 'shop.js'), 'utf8');
assert(!/\bfrom\s*["']\.\/(?:store-config\.mjs|site-settings\.js)["']/.test(builtShop), 'cart configuration is bundled without a network import waterfall');
for (const href of ['store-config.mjs', 'site-settings.js']) assert(!home.querySelector('link[rel="modulepreload"][href="' + href + '"]'), 'bundled modules are not downloaded again');
assert(home.querySelector('.site-header .brand-logo').getAttribute('sizes').includes('112px'));
const homeCss = fs.readFileSync(path.join(output, 'home.css'), 'utf8');
for (const selector of ['.mm-ingredient-section{', '.mm-ingredient-profile-hero{', '.mm-seo-care-card{', '.store-shop-grid{']) {
  assert(!homeCss.includes(selector), 'homepage does not download other pages\' component rules: ' + selector);
  assert(fs.readFileSync(path.join(output, 'styles.css'), 'utf8').includes(selector), 'other pages retain their complete styles: ' + selector);
}
for (const selector of ['.store-launcher{', '.store-toast{', '.store-card-buy{', '.contact{', '.connect-fields', '.faq-list', '.mm-action-bar']) {
  assert(homeCss.includes(selector), 'homepage keeps offscreen and interactive states: ' + selector);
}

function cursors(css) {
  const document = parseHTML('<html><head><style>' + css + '</style></head></html>').document;
  const result = [];
  function walk(rules) { for (const rule of Array.from(rules)) { const cursor = rule.style?.getPropertyValue('cursor'); if (cursor) result.push(cursor.replace(/["']/g, '').replace(/\s+/g, '')); if (rule.cssRules) walk(rule.cssRules); } }
  walk(document.querySelector('style').sheet.cssRules); return result;
}
assert.deepEqual(cursors(fs.readFileSync(path.join(output, 'styles.css'), 'utf8')), cursors(fs.readFileSync(path.join(root, 'styles.css'), 'utf8')), 'minification preserves every cursor value and order');
const source = { window: { madhavTranslations: {} } }, built = { window: { madhavTranslations: {} } }; vm.createContext(source); vm.createContext(built);
for (const file of ['product-data.js', 'ingredient-data.js', ...['hi', 'mr', 'te', 'ta', 'bn', 'pa', 'gu'].map(lang => 'translations/' + lang + '.js')]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), source);
  vm.runInContext(fs.readFileSync(path.join(output, file), 'utf8'), built);
}
assert.equal(JSON.stringify(source.window), JSON.stringify(built.window), 'deployment minification preserves all catalogue, ingredient and translation values');
function luminance(hex) { const rgb = hex.match(/../g).map(value => parseInt(value, 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4); return rgb.reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0); }
for (const [foreground, background] of [['756037', 'fbf8f1'], ['756037', 'f1eadc'], ['536344', 'e9eddf']]) {
  const sorted = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
  assert((sorted[1] + 0.05) / (sorted[0] + 0.05) >= 4.5, 'small labels meet the normal-text contrast threshold');
}
// Existing server-rendered cards are reused only when their source catalogue matches.
const sourceWebsite = fs.readFileSync(path.join(root, 'website.js'), 'utf8');
const helperStart = sourceWebsite.indexOf('const catalogue='), gridStart = sourceWebsite.indexOf('const grid='), gridEnd = sourceWebsite.indexOf('const menu=', gridStart);
assert(helperStart >= 0 && gridEnd > gridStart);
const markup = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
function checkCardLinks(document) {
  for (const card of document.querySelectorAll('.product-card')) {
    assert(!card.querySelector('.product-link,.product-card-actions'), 'no redundant explore-product action');
    const photo = card.querySelector('a.product-card-image');
    const amazon = card.querySelector('.product-card-media > a.amazon-link');
    assert(photo && amazon, 'pack and Amazon retain separate links');
    assert.equal(photo.getAttribute('href'), card.querySelector('h3 a').getAttribute('href'));
    assert(!photo.contains(amazon), 'never nest the Amazon anchor inside the product anchor');
    assert(amazon.getAttribute('aria-label')?.includes('Amazon'), 'icon has an accessible product-specific label');
    assert.equal(amazon.getAttribute('target'), '_blank');
    assert(amazon.getAttribute('rel').includes('noopener'));
    assert.equal(amazon.querySelector('img').getAttribute('src'), 'assets/amazon-mark.svg');
    assert.equal(amazon.querySelector('img').getAttribute('alt'), '');
  }
}
checkCardLinks(home);
const homeCards = [...home.querySelectorAll('#product-grid .product-card')];
function packFor(id) { const chip = homeCards.find(card => card.querySelector('h3 a').getAttribute('href').endsWith('product=' + id)).querySelector('.pack-chip'); return chip.querySelector('.pack-chip-compact')?.textContent || chip.textContent; }
assert.equal(packFor('arshharan'), '300 ml');
assert.equal(packFor('kabi-haran'), '100 g');
assert.equal(packFor('dard-oil'), '50ml/100ml');
for (const name of fs.readdirSync(path.join(output, '_search')).filter(name => name.startsWith('product-'))) {
  const productPage = parseHTML(fs.readFileSync(path.join(output, '_search', name), 'utf8')).document;
  const amazon = productPage.querySelector('#product-amazon a');
  if (!amazon) continue;
  assert(/^(View|Search) on Amazon ↗$/.test(amazon.textContent), 'every generated product and pack page retains the full Amazon label');
  assert(!amazon.querySelector('img'), 'logo-only controls are restricted to catalogue cards');
  assert(!amazon.hasAttribute('aria-label'), 'visible translated Amazon text is also its accessible name');
}
for (const name of ['joint-muscle-care.html', 'digestive-wellness.html', 'karela-jamun-metabolic-wellness.html', 'heart-wellness.html', 'piles-fissure-care.html']) {
  checkCardLinks(parseHTML(fs.readFileSync(path.join(output, name), 'utf8')).document);
}
assert(fs.existsSync(path.join(output, 'assets/amazon-mark.svg')), 'local vector logo is deployed');
for (const stale of [false, true]) {
  const document = parseHTML(markup).document, first = document.querySelector('#product-grid .product-card');
  if (stale) document.getElementById('product-grid').dataset.madhavCatalogueStamp = 'old';
  const context = { window: { matchMedia: () => ({ matches: true, addEventListener() {} }) }, document }; vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'product-data.js'), 'utf8'), context);
  vm.runInContext(sourceWebsite.slice(helperStart, gridEnd), context);
  assert.equal(document.querySelectorAll('#product-grid .product-card').length, 8);
  assert.equal(document.querySelector('#product-grid .product-card') === first, !stale);
  checkCardLinks(document);
}
console.log('Passed: initial CSS, nonblocking full-style activation/fallback, module preloads, header logo sizing, cursor preservation, identical catalogue/translations after minification and small-label contrast.');
