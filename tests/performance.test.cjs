const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const { parseHTML } = require('linkedom');
const root = path.resolve(__dirname, '..');
const context = { window: {} }; vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'responsive-images.js'), 'utf8'), context);
const api = context.window.MadhavImages;
assert(Object.keys(api.entries).length >= 9);
let references = 0;
function check(document) {
  for (const image of document.querySelectorAll(".product-card-image img")) {
    assert.equal(image.getAttribute("loading"), "lazy", "server-rendered product cards defer offscreen image requests");
    assert.equal(image.getAttribute("decoding"), "async");
  }
  for (const image of document.querySelectorAll('img[srcset]')) {
    assert(image.getAttribute('sizes'));
    const widths = new Set();
    for (const candidate of image.getAttribute('srcset').split(', ')) {
      const [file, width] = candidate.split(' ');
      assert(/^\d+w$/.test(width)); assert(!widths.has(width)); widths.add(width);
      assert(fs.existsSync(path.join(root, 'dist', file)), file); references++;
    }
  }
  for (const link of document.querySelectorAll('link[rel="preload"][as="image"]')) {
    const image = document.querySelector('#spotlight-image,#product-image');
    assert(image); assert.equal(link.getAttribute('imagesrcset'), image.getAttribute('srcset'));
    assert.equal(link.getAttribute('imagesizes'), image.getAttribute('sizes'));
    assert.equal(image.getAttribute('fetchpriority'), 'high'); assert(!image.getAttribute('loading'));
  }
  const shop = document.querySelector('script[type="module"][src^="shop.js"]');
  if (shop) {
    const hint = [...document.head.querySelectorAll('link[rel="modulepreload"]')].find(link => link.getAttribute('href') === shop.getAttribute('src'));
    assert(hint, 'product, ingredient and home documents all discover the existing cart early');
    assert.equal(hint.getAttribute('fetchpriority'), 'low');
  }
}
for (const file of ['index.html', 'cart.html', ...fs.readdirSync(path.join(root, 'dist/_search')).map(file => '_search/' + file)]) {
  const document = parseHTML(fs.readFileSync(path.join(root, 'dist', file), 'utf8')).document;
  check(document);
  const scripts = [...document.querySelectorAll('script[src]')].map(script => script.getAttribute('src').split('?')[0]);
  assert(scripts.indexOf('responsive-images.js') < scripts.indexOf('website.js'));
}
const { document } = parseHTML('<html><body><img></body></html>');
const image = document.querySelector('img');
const sources = Object.keys(api.entries).filter(source => source.includes('cutouts/'));
for (const source of sources) {
  api.apply(image, source, 'spotlight');
  assert.equal(image.getAttribute('src'), source);
  assert.equal(image.getAttribute('srcset'), api.entries[source].srcset);
}
for (const [source, entry] of Object.entries(api.entries)) {
  if (!source.includes('cutouts/')) continue;
  assert(entry.srcset.includes('192.webp 192w'), 'small product slots have a sharp intermediate candidate');
}
api.apply(image, 'assets/original-composition.jpg', 'gallery');
assert.equal(image.getAttribute('src'), 'assets/original-composition.jpg');
assert(!image.hasAttribute('srcset')); assert(!image.hasAttribute('sizes'));
console.log('Passed: ' + references + ' responsive image paths, preload/candidate matching, script order, every product image switch and composition fallback.');
