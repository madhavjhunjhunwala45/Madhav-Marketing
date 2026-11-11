/* Build-only landing pages. No new browser dependency or network resource. */
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { parseHTML } = require('linkedom');
module.exports = function buildSeoPages({ root, settings, products, ingredients, aliases, helpers }) {
  const read = f => fs.readFileSync(path.join(root, f), 'utf8');
  const ui = new Set();
  const capture = value => (ui.add(value), value);
  function page(file, intro) {
    const { document: d } = parseHTML(read('ingredients.html'));
    const entry = settings.pages[file]; d.documentElement.dataset.searchPage = entry.kind;
    d.body.classList.add('mm-refined-page');
    d.querySelector('a[aria-current]')?.removeAttribute('aria-current');
    for (const s of d.querySelectorAll('script[src]')) if (/^(ingredient-data|ingredient-shared|ingredients)\.js/.test(s.getAttribute('src'))) s.remove();
    const main = d.getElementById('main'); main.replaceChildren();
    const node = (tag, text, className) => { const n = d.createElement(tag); if (text) n.textContent = text; if (className) n.className = className; return n; };
    const link = (label, href) => { const a = node('a', label, 'text-link'); a.href = href; return a; };
    const breadcrumb = node('nav', '', 'wrap breadcrumb'); breadcrumb.setAttribute('aria-label', 'Breadcrumb');
    breadcrumb.append(link('Home', './'), node('span', '/'), node('span', entry.heading)); main.append(breadcrumb);
    const hero = node('section', '', 'ingredient-hero wrap mm-seo-hero');
    hero.append(node('h1', capture(entry.heading), 'mm-seo-heading'), node('p', capture(intro))); main.append(hero);
    function section(title) { const s = node('section', '', 'section wrap mm-seo-section'); s.append(node('h2', capture(title))); main.append(s); return s; }
    return { d, main, node, link, section, file };
  }
  function nav(p, section) {
    const n = p.node('nav', '', 'mm-seo-links mm-seo-nav-grid'); n.setAttribute('aria-label', 'Product categories');
    for (const c of Object.values(settings.categories)) { const a = p.link(capture(c.label), c.path); if(c.path === p.file) a.setAttribute('aria-current', 'page'); n.append(a); }
    n.append(p.link(capture('Ayurvedic product guides'), 'ayurveda-guides.html'), p.link(capture('Contact and retailer enquiries'), 'contact.html'));
    section.append(n);
  }
  function enquiry(p) {
    const s = p.section('Availability and retailer enquiries'); s.classList.add('mm-seo-enquiry');
    s.append(p.node('p', 'For product availability, pack information or retailer enquiries, get in touch with Madhav Marketing.'));
    const n = p.node('div', '', 'mm-seo-links mm-seo-enquiry-actions');
    n.append(p.link('Call +91 94316 55050 ↗', 'tel:+919431655050'), p.link(capture('Contact and retailer enquiries'), 'contact.html'), p.link('Connect with us', 'index.html#connect')); s.append(n);
    nav(p, p.section('Explore the Madhav range'));
  }
  function finish(p) { p.d.title = settings.pages[p.file].title; p.d.querySelector('meta[name="description"]').content = settings.pages[p.file].description; fs.writeFileSync(path.join(root, p.file), '<!doctype html>\n' + p.d.documentElement.outerHTML + '\n'); }
  function faq(p, questions) {
    const s = p.section('Questions about this range'); s.classList.add('faq', 'mm-seo-faq');
    const list = p.node('div', '', 'mm-seo-faq-list');
    for (const [q, answer] of questions) { const detail = p.node('details'); detail.setAttribute('data-seo-faq', ''); detail.append(p.node('summary', capture(q)), p.node('p', answer)); list.append(detail); } s.append(list);
  }
  for (const [group, c] of Object.entries(settings.categories)) {
    const entries = Object.entries(products).filter(([, p]) => p.group === group);
    settings.pages[c.path].products = entries.map(([id]) => id);
    const p = page(c.path, c.intro), s = p.section('Explore our Ayurvedic product range');
    const grid = p.node('div', '', 'product-grid mm-seo-products'); grid.dataset.mmCount = String(entries.length);
    const context = { window: { productCatalogue: products, matchMedia: () => ({ matches: true, addEventListener() {} }) }, document: p.d }; vm.createContext(context); vm.runInContext(helpers, context);
    for (const [id] of entries) grid.append(vm.runInContext('makeProductCard(' + JSON.stringify(id) + ',catalogue[' + JSON.stringify(id) + '])', context)); s.append(grid);
    const list = p.section('Ingredients used in these formulations');
    const stack = p.node('div', '', 'mm-seo-stack mm-seo-ingredients');
    for (const id of c.ingredients) {
      const item = ingredients[id]; if (!item || item.guideHidden) throw Error('Unknown category ingredient: ' + id);
      const used = entries.filter(([, product]) => (product.formats || [product]).some(f => f.ingredients.some(row => aliases[row[0]] === id)));
      if (!used.length) throw Error('Ingredient not in category: ' + group + '/' + id);
      const a = p.node('article', '', 'mm-seo-ingredient-card'); const h = p.node('h3'); h.append(p.link(item.title, 'ingredients.html?ingredient=' + id)); a.append(h, p.node('p', item.shortBenefit));
      const l = p.node('div', '', 'mm-seo-links'); for (const [pid, product] of used) l.append(p.link(product.title, 'product.html?product=' + pid + '#composition')); a.append(l); stack.append(a);
    }
    list.append(stack);
    const care = p.section('Directions and safety information'); const careStack = p.node('div', '', 'mm-seo-stack mm-seo-care-grid');
    for (const [id, product] of entries) { const a = p.node('article', '', 'mm-seo-care-card'); a.append(p.node('h3', product.title), p.node('p', product.benefits), p.node('p', product.precautions), p.link('Directions & care', 'product.html?product=' + id + '#directions')); careStack.append(a); } care.append(careStack);
    const common = ['How should I use a product?', "Follow the current product label and your physician's directions. This catalogue provides product information and does not replace individual medical advice."];
    const availability = ['How do I check availability?', 'Call +91 94316 55050 for product availability and retailer enquiries. This catalogue does not currently offer online checkout.'];
    const unique = group === 'metabolic' ? ['Are Value and Premium the same formulation?', 'No. Madhumeh Haran Value is the plain Karela Jamun Churan; the Premium formula includes Vasant Kusumakar Ras. The compositions are shown on separate pages.']
      : group === 'digestion' ? ['What precaution is listed for Kabj Haran Granules?', products['kabi-haran'].precautions]
      : group === 'pain' ? ['Is Dard Haran Oil for external use?', products['dard-oil'].formats[1].directions]
      : ['Where can I find product compositions?', 'Select a product in our range to see its composition table and pack images. For products with multiple pack sizes, choose the pack to see its corresponding information.'];
    faq(p, [unique, common, availability]); enquiry(p); finish(p);
  }
  {
    const p = page('contact.html', 'For product availability, pack information or retailer enquiries, get in touch with Madhav Marketing.');
    const home = parseHTML(read('index.html')).document;
    const contact = home.getElementById('contact').cloneNode(true); p.main.append(contact);
    const s = p.section('Send a product or retailer enquiry'); s.append(p.link('Connect with us', 'index.html#connect'));
    nav(p, p.section('Explore the Madhav range')); finish(p);
  }
  {
    const p = page('ayurveda-guides.html', 'Use the product label and composition panel to compare the range. These guides explain the supplied information without adding new product claims.');
    const s = p.section('Read the product guides');
    const n = p.node('nav', '', 'mm-seo-stack');
    for (const file of ['reading-ayurvedic-composition.html', 'ayurvedic-product-formats.html']) n.append(p.link(capture(settings.pages[file].heading), file)); s.append(n);
    const ing = p.section('Explore the ingredient profiles');
    const l = p.node('nav', '', 'mm-seo-links'); for (const id of ['karela', 'jamun', 'arjuna', 'turmeric', 'ginger']) l.append(p.link(ingredients[id].title, 'ingredients.html?ingredient=' + id)); ing.append(l);
    enquiry(p); finish(p);
  }
  {
    const p = page('reading-ayurvedic-composition.html', 'Start with the product name, pack size and the composition basis. Then read the ingredient identities, directions and precautions together.');
    const s = p.section('Read the quantity basis'); s.append(p.node('p', capture('The basis states how much product the listed quantities refer to. Compare the same basis and pack panel, rather than comparing numbers alone.')));
    const product = products['dard-capsule']; s.append(p.node('h3', product.title), p.node('p', product.basis));
    const table = p.node('table', '', 'composition-table'), cap = p.node('caption', capture('Example composition rows from the supplied panel')); table.append(cap); const head = p.node('thead'), tr = p.node('tr');
    for (const text of ['Ingredient / component', 'Quantity']) { const th = p.node('th', text); th.setAttribute('scope', 'col'); tr.append(th); } head.append(tr); table.append(head);
    const body = p.node('tbody'); for (const row of product.ingredients.slice(0, 3)) { const tr = p.node('tr'); const th = p.node('th', row[0]); th.setAttribute('scope', 'row'); tr.append(th, p.node('td', row[2])); body.append(tr); } table.append(body); const wrap = p.node('div', '', 'composition-table-wrap'); wrap.append(table); s.append(wrap, p.link(capture('Read the complete composition'), 'product.html?product=dard-capsule#composition'));
    const identities = p.section('Read the ingredient identity and preparation'); identities.append(p.node('p', 'Plant photographs show a botanical source. The root, leaf, fruit, oil or extract on a product label may differ from the part photographed. Mineral photographs show the raw source material, not a processed bhasma or pishti.'), p.link('Ingredients', 'ingredients.html'));
    const panel = p.section('Check pack and panel differences'); panel.append(p.node('p', 'Read alongside the current label on your pack. Product compositions and directions may vary between pack versions.'));
    const links = p.node('div', '', 'mm-seo-links'); for (const id of ['dard-oil', 'madhumeh-premium']) links.append(p.link(products[id].title, 'product.html?product=' + id + '#composition')); panel.append(links);
    const care = p.section('Directions and safety information'); care.append(p.node('p', "Follow the current product label and your physician's directions. This catalogue provides product information and does not replace individual medical advice.")); enquiry(p); finish(p);
  }
  {
    const p = page('ayurvedic-product-formats.html', 'The range includes oral preparations and external oil. Compare each product’s pack, composition and directions; different formats are not interchangeable doses.');
    const s = p.section('Compare formats and pack sizes'), stack = p.node('div', '', 'mm-seo-stack');
    for (const [id, product] of Object.entries(products)) { const a = p.node('article'), h = p.node('h3'); h.append(p.link(product.title, 'product.html?product=' + id)); a.append(h); const packs = [...new Set((product.formats || [product]).map(f => f.pack))]; for (const pack of packs) a.append(p.node('p', pack)); a.append(p.node('p', product.description)); stack.append(a); } s.append(stack);
    const care = p.section('Choose using the complete label'); care.append(p.node('p', capture('Read the intended use, composition, directions and precautions together. Ask a qualified physician which preparation is appropriate for you; do not infer a dose from another format.')));
    care.append(p.link(capture('How to read an Ayurvedic product composition'), 'reading-ayurvedic-composition.html')); enquiry(p); finish(p);
  }
  // Reuse these exact text keys in the existing eight-language system.
  // Public page files are the only generated source outputs.
};
