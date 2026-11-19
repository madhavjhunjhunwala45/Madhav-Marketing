const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const { parseHTML } = require('linkedom');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const context = { window: {} }; vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'responsive-images.js'), 'utf8'), context);
const api = context.window.MadhavImages;
assert(Object.keys(api.entries).length >= 9);
const productManifestCount = Object.keys(api.entries).length;
vm.runInContext(fs.readFileSync(path.join(root, 'ingredient-image-candidates.js'), 'utf8'), context);
assert(Object.keys(api.entries).length > productManifestCount + 50, 'botanical pages have their own responsive image map');
assert(!parseHTML(fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8')).document.querySelector('script[src^="ingredient-image-candidates.js"]'), 'homepage does not download the botanical map');
let references = 0;
function check(document) {
  for (const script of document.querySelectorAll('script[src]')) {
    const value = script.getAttribute('src'), [name] = value.split('?');
    if (!['search.js', 'search-settings.js', 'shop.js'].includes(name)) continue;
    const expected = createHash('sha256').update(fs.readFileSync(path.join(root, 'dist', name))).digest('hex').slice(0, 12);
    assert.equal(new URL(value, 'https://example.invalid/').searchParams.get('v'), expected,
      'every generated page uses the current metadata/cart code, including bundled prices');
  }
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
const profileDocument = parseHTML(fs.readFileSync(path.join(root,'dist/_search/ingredient-turmeric.html'),'utf8')).document;
assert(profileDocument.querySelector('.ingredient-selected img[srcset]').getAttribute('sizes').includes('767px'),'served profile HTML keeps the full-width profile image hint');
const oilDocument = parseHTML(fs.readFileSync(path.join(root,'dist/_search/product-dard-oil.html'),'utf8')).document;
const componentImages=[...oilDocument.querySelectorAll('.component-picture img[srcset]')];
assert(componentImages.length>0);
for(const componentImage of componentImages)assert(componentImage.getAttribute('sizes').includes('52px'),'served composition thumbnails keep their compact image hint');
for(const file of ['joint-muscle-care.html','heart-wellness.html','contact.html','ayurveda-guides.html']){
  const d=parseHTML(fs.readFileSync(path.join(root,'dist',file),'utf8')).document;
  assert(!d.querySelector('script[src^="ingredient-image-candidates.js"]'),'non-botanical landing pages do not load the botanical map: '+file);
}
for (const role of ['ingredient', 'ingredient-profile', 'ingredient-component']) {
  const source = Object.keys(api.entries).find(source => source.startsWith('assets/ingredient-photos/'));
  api.apply(image, source, role);
  assert.equal(image.getAttribute('src'), source, 'original botanical photograph stays as the fallback');
  assert(image.getAttribute('srcset').includes('192.webp 192w'));
  assert(image.getAttribute('sizes').includes(role === 'ingredient-component' ? '52px' : role === 'ingredient-profile' ? '767px' : '50vw'));
}
const fallbackContext = { document, window: { MadhavImages: api } }; vm.createContext(fallbackContext);
for (const file of ['ingredient-data.js', 'ingredient-shared.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), fallbackContext);
const picture = vm.runInContext('ingredientPicture(window.ingredientGuide.turmeric, true)', fallbackContext);
const botanicalImage = picture.querySelector('img');
assert(botanicalImage.hasAttribute('srcset'));
botanicalImage.dispatchEvent(new document.defaultView.Event('error'));
assert(!botanicalImage.hasAttribute('srcset') && !botanicalImage.hasAttribute('sizes'), 'photo fallback clears a failed responsive candidate set');
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
