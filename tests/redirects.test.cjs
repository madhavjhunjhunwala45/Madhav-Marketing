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
const sitemap = fs.readFileSync(path.join(root, 'dist/sitemap.xml'), 'utf8');
assert(!sitemap.includes('madhavmarketing.store'));
assert(fs.readFileSync(path.join(root, 'dist/robots.txt'), 'utf8').includes('Sitemap: ' + origin + '/sitemap.xml'));
console.log('Passed: ' + cases + ' HTTP/HTTPS host/path/query routing contracts, no primary-host loop, matching build configuration and canonical sitemap.');
