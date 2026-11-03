/* Build searchable HTML from the existing renderers. No browser/runtime dependency. */
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { parseHTML } = require('linkedom');
const createSearch = require('../search.js');
const root = path.resolve(__dirname, '..'), output = path.join(root, 'dist');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const sourceWebsite = read('website.js');
const start = sourceWebsite.search(/const catalogue\s*=/), gridOffset = sourceWebsite.slice(start).search(/const grid\s*=/), end = gridOffset < 0 ? -1 : start + gridOffset;
if (start < 0 || end < 0) throw new Error('Product renderer boundaries changed; update the search builder.');
const helpers = sourceWebsite.slice(start, end);
const configContext = { window: {} }; vm.createContext(configContext);
vm.runInContext(read('search-settings.js'), configContext);
const settings = configContext.window.madhavSearchSettings, search = createSearch(settings);
const dataContext = { window: {} }; vm.createContext(dataContext);
for (const name of ['product-data.js', 'ingredient-data.js']) vm.runInContext(read(name), dataContext, { timeout: 3000 });
const products = dataContext.window.productCatalogue;
const ingredients = dataContext.window.ingredientGuide;
const ingredientIds = Object.keys(ingredients).filter(id => !ingredients[id].guideHidden);

if (fs.existsSync(output)) fs.rmSync(output, { recursive: true });
fs.mkdirSync(output, { recursive: true });
// Only public site files are deployed. Build dependencies, tests and private tooling stay out.
for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (entry.isDirectory() && ['assets', 'translations'].includes(entry.name)) fs.cpSync(path.join(root, entry.name), path.join(output, entry.name), { recursive: true });
  if (entry.isFile() && /\.(?:html|css|js|mjs|ico|png|jpe?g|webp|svg|webmanifest|txt|xml)$/i.test(entry.name) && !/^(?:README|CLEANUP|EXPORT|robots\.txt|sitemap\.xml)/i.test(entry.name)) {
    // These two URLs are routed by query, so no same-named static file may override their rewrites.
    if (!['product.html', 'ingredients.html'].includes(entry.name)) fs.copyFileSync(path.join(root, entry.name), path.join(output, entry.name));
  }
}

function render(template, query, kind, id, format) {
  const { document } = parseHTML(read(template));
  const url = new URL(template + (query ? '?' + query : ''), search.origin + '/');
  const context = {
    document, window: { location: url, matchMedia: () => ({ matches: true, addEventListener() {} }) },
    location: url, URL, URLSearchParams, CustomEvent: document.defaultView.CustomEvent,
    requestAnimationFrame() {}, cancelAnimationFrame() {},
    changeImage(image, source, alt) { context.window.MadhavImages.apply(image, source, "gallery"); image.alt = alt; },
    console
  };
  vm.createContext(context);
  vm.runInContext(read("responsive-images.js"), context);
  for (const name of ['product-data.js', 'ingredient-data.js']) vm.runInContext(read(name), context, { timeout: 3000 });
  vm.runInContext(helpers, context, { timeout: 3000 });
  vm.runInContext(read('ingredient-shared.js'), context, { timeout: 3000 });
  if (kind === 'home') {
    vm.runInContext('for (const [id, product] of Object.entries(catalogue)) document.getElementById("product-grid").append(makeProductCard(id, product));', context);
  } else if (kind === 'product') {
    vm.runInContext(read('product-page.js'), context, { timeout: 3000 });
  } else if (kind === 'ingredients' || kind === 'ingredient') {
    vm.runInContext(read('ingredients.js'), context, { timeout: 3000 });
  }
  const product = kind === 'product' && products[id];
  const ingredient = kind === 'ingredient' && ingredients[id];
  const meta = search.metadata({ kind, id, product, ingredient });
  search.apply(document, meta, products);
  for (const image of document.querySelectorAll('img[src]')) {
    const source = image.getAttribute('src');
    const role = image.id === 'spotlight-image' ? 'spotlight' : image.id === 'product-image' ? 'gallery' : image.classList.contains('brand-logo') ? 'logo' : 'card';
    context.window.MadhavImages.apply(image, source, role);
  }
  const mainImage = kind === 'home' ? document.getElementById('spotlight-image') : product && document.getElementById('product-image');
  if (mainImage) {
    mainImage.setAttribute('fetchpriority', 'high');
    mainImage.removeAttribute('loading');
    const preload = document.createElement('link');
    preload.setAttribute('rel', 'preload'); preload.setAttribute('as', 'image');
    preload.setAttribute('href', mainImage.getAttribute('src'));
    if (mainImage.getAttribute('srcset')) {
      preload.setAttribute('imagesrcset', mainImage.getAttribute('srcset'));
      preload.setAttribute('imagesizes', mainImage.getAttribute('sizes'));
    }
    preload.setAttribute('fetchpriority', 'high'); document.head.append(preload);
  }
  return '<!doctype html>\n' + document.documentElement.outerHTML + '\n';
}

function write(name, html) { const target = path.join(output, name); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, html); }
write('index.html', render('index.html', '', 'home'));
write('cart.html', render('cart.html', '', 'cart'));
write('_search/product-default.html', render('product.html', '', 'product'));
write('_search/ingredients-default.html', render('ingredients.html', '', 'ingredients'));
const expected = [];
const rewrites = [
  { source: '/product.html', has: [{ type: 'query', key: 'product', value: '(?<searchProduct>[a-z0-9-]+)' }, { type: 'query', key: 'format', value: '(?<searchFormat>[0-9]+)' }], destination: '/_search/product-:searchProduct-format-:searchFormat.html' },
  { source: '/product.html', has: [{ type: 'query', key: 'product', value: '(?<searchProduct>[a-z0-9-]+)' }], destination: '/_search/product-:searchProduct.html' },
  { source: '/ingredients.html', has: [{ type: 'query', key: 'ingredient', value: '(?<searchIngredient>[a-z0-9-]+)' }], destination: '/_search/ingredient-:searchIngredient.html' },
  { source: '/product.html', destination: '/_search/product-default.html' },
  { source: '/ingredients.html', destination: '/_search/ingredients-default.html' }
];
for (const [id, product] of Object.entries(products)) {
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error('Unsafe product key: ' + id);
  (product.formats || [product, product]).forEach((format, i) => {
    const destination = '/_search/product-' + id + '-format-' + i + '.html';
    write(destination.slice(1), render('product.html', 'product=' + encodeURIComponent(id) + '&format=' + i, 'product', id, i));
  });
  const destination = '/_search/product-' + id + '.html';
  write(destination.slice(1), render('product.html', 'product=' + encodeURIComponent(id), 'product', id));
  expected.push({ url: search.absolute('product.html?product=' + encodeURIComponent(id)), file: destination.slice(1), kind: 'product', id });
}
for (const id of ingredientIds) {
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error('Unsafe ingredient key: ' + id);
  const destination = '/_search/ingredient-' + id + '.html';
  write(destination.slice(1), render('ingredients.html', 'ingredient=' + encodeURIComponent(id), 'ingredient', id));
  expected.push({ url: search.absolute('ingredients.html?ingredient=' + encodeURIComponent(id)), file: destination.slice(1), kind: 'ingredient', id });
}
// Keep one small sitemap: home, the ingredient guide and the product pages.
// Individual ingredient profiles are still built and linked from the website.
const sitemapUrls = [search.origin + '/', search.absolute('ingredients.html'), ...expected.filter(item => item.kind === 'product').map(item => item.url)];
const escapeXML = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + sitemapUrls.map(url => '  <url><loc>' + escapeXML(url) + '</loc></url>').join('\n') + '\n</urlset>\n');
write('robots.txt', 'User-agent: *\nAllow: /\nDisallow: /_search/\n\nSitemap: ' + search.origin + '/sitemap.xml\n');

const deployment = JSON.parse(read('vercel.json'));
// Security headers are copied unchanged; routing is generated from the actual data keys.
deployment.rewrites = rewrites;
deployment.redirects = [
  ...(settings.previousHost ? [{ source: '/:path*', has: [{ type: 'host', value: settings.previousHost }], destination: search.origin + '/:path*', permanent: true }] : []),
  { source: '/index.html', destination: '/', permanent: true }
];
fs.writeFileSync(path.join(root, '.search-build.json'), JSON.stringify({ sitemapUrls, expected, rewrites, deployment }, null, 2));
// Build Output API is not needed: Vercel reads the generated configuration via the committed root file.
const committed = JSON.parse(read('vercel.json'));
if (JSON.stringify(committed.rewrites) !== JSON.stringify(rewrites) || JSON.stringify(committed.redirects) !== JSON.stringify(deployment.redirects)) {
  throw new Error('Vercel routes differ from scripts/build-search.cjs. Keep the supplied routing configuration.');
}
console.log('Built ' + (expected.length + 2) + ' searchable pages and one simplified sitemap with ' + sitemapUrls.length + ' URLs. All ' + ingredientIds.length + ' ingredient profiles and existing pack/formula versions remain available.');
