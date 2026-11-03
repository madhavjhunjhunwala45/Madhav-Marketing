const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const { parseHTML } = require('linkedom');
const createSearch = require('../search.js');
const root = path.resolve(__dirname, '..');
const data = { window: { madhavTranslations: {} } }; vm.createContext(data);
for (const file of ['search-settings.js', 'product-data.js', ...['hi','mr','te','ta','bn','pa','gu'].map(lang => 'translations/' + lang + '.js')]) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), data);
const settings = data.window.madhavSearchSettings, api = createSearch(settings);
const home = parseHTML(fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8')).document;
assert.equal(home.querySelector('.hero-copy .eyebrow').textContent.trim(), 'AYURVEDA · HARIDWAR, INDIA');
assert(home.title.includes('Haridwar'));
assert(home.querySelector('.hero-foot').textContent.includes('Manufactured in Haridwar.'));
assert(home.querySelector('.hero-foot').textContent.includes('Supplied from Muzaffarpur, Bihar.'));
assert.equal(home.querySelector('#business-locations').textContent, settings.organization.description);
assert.equal(home.querySelector('#distribution-location address').textContent, 'Jagdamba Agency\nMotijheel, Muzaffarpur\nBihar 842001, India');
assert(home.querySelector('.contact-details').textContent.includes('Bhalla Road, Opp. Main Post Office'));
for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
  const description = home.querySelector(selector).getAttribute('content'); assert.equal(description, settings.home.description);
  assert(description.includes('Haridwar') && description.includes('Muzaffarpur'));
}
const files = ['index.html', 'cart.html', ...fs.readdirSync(path.join(root, 'dist/_search')).map(file => '_search/' + file)];
for (const file of files) {
  const document = parseHTML(fs.readFileSync(path.join(root, 'dist', file), 'utf8')).document;
  const graph = JSON.parse(document.getElementById('madhav-structured-data').textContent)['@graph'];
  const org = graph.find(item => item['@type'] === 'Organization');
  assert.equal(org.name, 'Madhav Marketing'); assert.equal(org.description, settings.organization.description);
  assert.equal(org.address.length, 2);
  const supply = org.address.find(item => item.addressLocality === 'Muzaffarpur');
  const haridwar = org.address.find(item => item.addressLocality === 'Haridwar');
  assert.equal(supply.addressRegion, 'Bihar'); assert.equal(supply.name, 'Store and supply address');
  assert.equal(supply.streetAddress, 'Jagdamba Agency, Motijheel'); assert.equal(supply.postalCode, '842001');
  assert.equal(document.querySelector('footer .footer-location span').textContent, 'Jagdamba Agency\nMotijheel, Muzaffarpur\nBihar 842001, India');
  assert.equal(haridwar.streetAddress, 'Bhalla Road, Opp. Main Post Office'); assert.equal(haridwar.addressRegion, 'Uttarakhand');
  assert(!graph.some(item => item['@type'] === 'LocalBusiness'), 'keep the existing organization type and avoid inventing a separate store entity');
  const product = graph.find(item => item['@type'] === 'Product');
  if (product) { assert(!product.manufacturer, 'do not invent a manufacturer identity'); assert.equal(product.description, Object.values(data.window.productCatalogue).find(item => item.title === product.name).description); }
}
const keys = ['Manufactured in Haridwar.', 'Supplied from Muzaffarpur, Bihar.', settings.organization.description, 'HARIDWAR ADDRESS', 'STORE & SUPPLY ADDRESS', 'Store & Supply Address:', 'Jagdamba Agency\nMotijheel, Muzaffarpur\nBihar 842001, India', settings.home.description];
for (const lang of ['hi','mr','te','ta','bn','pa','gu']) {
  const dictionary = data.window.madhavTranslations[lang];
  keys.forEach(key => { const normalized = key.replace(/\s+/g, ' ').trim(); assert(dictionary[normalized] && dictionary[normalized] !== key, lang + ': ' + key); });
  const meta = api.metadata({ kind: 'home', language: lang, translate: text => dictionary[text] || text });
  assert.equal(meta.description, dictionary[settings.home.description]);
}
// Retain compatibility with a single-address configuration.
const legacy = {...settings, organization: { ...settings.organization, addresses: undefined, streetAddress: 'Existing address', addressLocality: 'Haridwar', addressRegion: 'Uttarakhand', addressCountry: 'IN' }};
const legacyApi = createSearch(legacy);
assert.equal(legacyApi.structuredData(legacyApi.metadata({kind: 'home'}))['@graph'][0].address.streetAddress, 'Existing address');
console.log('Passed: Haridwar retained, visible location roles, both-city metadata, ' + files.length + ' organization graphs, original Haridwar address, confirmed Muzaffarpur street/PIN, all-page footers, no invented manufacturer and seven translated dictionaries.');
