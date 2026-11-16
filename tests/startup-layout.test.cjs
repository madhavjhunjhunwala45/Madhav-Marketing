const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { parseHTML } = require('linkedom');
const root = path.resolve(__dirname, '..');
const { document } = parseHTML('<html lang="en"><body><nav class="mm-action-bar"></nav></body></html>');
const observers = [], frames = []; let applies = 0;
const win = { location: { search: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }),
  MadhavI18n: { language: 'en', apply() { applies++; } } };
Object.defineProperty(win, 'innerHeight', { get() { throw Error('Desktop action bar forced a layout read'); } });
win.visualViewport = { addEventListener() {} };
Object.defineProperty(win.visualViewport, 'height', { get() { throw Error('Desktop action bar measured hidden viewport'); } });
class MO { constructor(fn) { this.fn = fn; observers.push(this); } observe() {} }
win.MutationObserver = MO;
const c = { document, window: win, URLSearchParams, MutationObserver: MO, requestAnimationFrame(fn) { frames.push(fn); return frames.length; } };
vm.createContext(c); vm.runInContext(fs.readFileSync(path.join(root, 'mm-polish.js'), 'utf8'), c);
assert.equal(applies, 0, 'English startup does not reapply language after DOM writes');
document.documentElement.classList.add('unrelated'); observers[0].fn();
assert.equal(frames.length, 0, 'unrelated root classes cannot queue self-triggered action-bar loops');
const home = parseHTML(fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8')).document;
const initial = home.getElementById('madhav-initial-styles').textContent;
assert(initial.includes('.product-card-content') && initial.includes('.product-grid'), 'initial styles include first-screen catalogue geometry');
assert(initial.includes('.store-card-buy') && initial.includes('.store-purchase-price'), 'initial styles include server cart placeholder geometry');
assert(initial.includes('.principle-band') && initial.includes('.store-badge'), 'initial styles reserve the band and floating-cart badge before deferred CSS');

const data = { window: {} }; vm.createContext(data); vm.runInContext(fs.readFileSync(path.join(root, 'product-data.js'), 'utf8'), data);
const d = parseHTML(fs.readFileSync(path.join(root, 'product.html'), 'utf8')).document;
const url = new URL('https://www.madhavmarketingayurveda.in/product.html?product=dard-oil');
const ctx = { document: d, window: { productCatalogue: data.window.productCatalogue, location: url, matchMedia: () => ({ matches: true, addEventListener() {} }) },
  location: url, URL, URLSearchParams, CustomEvent: d.defaultView.CustomEvent, requestAnimationFrame() {}, changeImage(image, src, alt) { image.src = src; image.alt = alt; }, console };
vm.createContext(ctx);
const website = fs.readFileSync(path.join(root, 'website.js'), 'utf8');
const start = website.indexOf('const catalogue='), end = website.indexOf('const grid=', start);
vm.runInContext(website.slice(start, end), ctx);
for (const file of ['ingredient-data.js', 'ingredient-shared.js', 'product-page.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), ctx);
const first = d.querySelector('#format-options button');
vm.runInContext(fs.readFileSync(path.join(root, 'product-page.js'), 'utf8'), ctx);
assert.equal(d.querySelector('#format-options button'), first, 'duplicate product initialization neither throws nor rebuilds controls');
assert.equal(d.querySelectorAll('#format-options button').length, 2);
console.log('Passed: no desktop action-bar geometry reads, no root-class feedback, first-screen catalogue CSS and duplicate product-page guard.');
