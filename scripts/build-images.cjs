/* Build-only resizing; original logo, product photographs and label scans stay intact. */
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), crypto = require('node:crypto');
const sharp = require('sharp');
const { parseHTML } = require('linkedom');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const context = { window: {} }; vm.createContext(context);
vm.runInContext(read('product-data.js'), context);
const sources = new Set(['assets/madhav-logo-transparent.png']);
for (const product of Object.values(context.window.productCatalogue)) {
  sources.add(product.image);
  for (const format of product.formats || []) if (format.gallery?.[0]?.src) sources.add(format.gallery[0].src);
}
(async () => {
  const entries = {};
  fs.mkdirSync(path.join(root, 'assets/performance'), { recursive: true });
  for (const source of [...sources].sort()) {
    const input = fs.readFileSync(path.join(root, source)), metadata = await sharp(input).metadata();
    const logo = source.endsWith('madhav-logo-transparent.png');
    const hash = crypto.createHash('sha256').update(input).update('responsive-v1-quality92').digest('hex').slice(0, 12);
    const stem = path.basename(source, path.extname(source));
    const variants = [];
    for (const width of (logo ? [160, 224, 320, 480, 720] : [160, 320, 480, 640, 960]).filter(width => width <= metadata.width)) {
      const target = 'assets/performance/' + stem + '-' + hash + '-' + width + '.webp';
      if (!fs.existsSync(path.join(root, target))) await sharp(input).resize({ width, withoutEnlargement: true }).webp(logo ? { lossless: true, effort: 6 } : { quality: 92, alphaQuality: 100, smartSubsample: true, effort: 6 }).toFile(path.join(root, target));
      variants.push(target + ' ' + width + 'w');
    }
    // Include the full-resolution source for large/high-density views.
    variants.push(source + ' ' + metadata.width + 'w');
    entries[source] = { ratio: metadata.width / metadata.height, srcset: variants.join(', ') };
  }
  const runtime = read('scripts/image-runtime.js').replace('__MADHAV_IMAGE_MANIFEST__', JSON.stringify(entries));
  fs.writeFileSync(path.join(root, 'responsive-images.js'), runtime);
  const imageContext = { window: {} }; vm.createContext(imageContext); vm.runInContext(runtime, imageContext);
  // Put responsive candidates in source HTML too, so the preload scanner sees them immediately.
  for (const file of ['index.html', 'product.html', 'ingredients.html', 'cart.html']) {
    let html = read(file);
    let logoIndex = 0;
    html = html.replace(/<img\b[^>]*>/g, tag => {
      const { document } = parseHTML('<html><body>' + tag + '</body></html>');
      const image = document.querySelector('img'), source = image.getAttribute('src');
      if (!entries[source]) return tag;
      const role = image.id === 'spotlight-image' ? 'spotlight' : image.classList.contains('brand-logo') ? (++logoIndex === 1 ? 'logo-header' : 'logo') : 'card';
      imageContext.window.MadhavImages.apply(image, source, role);
      return image.outerHTML;
    });
    fs.writeFileSync(path.join(root, file), html);
  }
  console.log('Prepared responsive images for ' + sources.size + ' original photos/logos; originals retained.');
})().catch(error => { console.error(error); process.exitCode = 1; });
