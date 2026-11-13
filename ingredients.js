/* mm- Catalogue previews and complete ingredient profiles share the same data. */
(() => {
  'use strict';
  const grid = document.getElementById('ingredient-grid');
  const search = document.getElementById('ingredient-search');
  const count = document.getElementById('ingredient-count');
  if (!grid || !search || !count || window.MadhavIngredientView) return;
  window.MadhavIngredientView = {version:'20261113-profiles'};
  const guide = window.ingredientGuide || {}, aliases = window.ingredientAliases || {};
  const products = window.productCatalogue || {}, editorial = window.mmIngredientEditorial || {};
  const entries = Object.entries(guide).filter(([, item]) => !item.guideHidden);
  const selected = new URLSearchParams(location.search).get('ingredient');
  let exact = selected && guide[selected] && !guide[selected].guideHidden ? selected : null;
  let filter = 'featured', index;
  const cards = new Map();
  const node = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  const matches = (product, id) => (product.formats || [product]).some(format => (format.ingredients || []).some(row => aliases[row[0]] === id));
  const profileURL = id => 'ingredients.html?ingredient=' + encodeURIComponent(id) + '#ingredient-' + id;
  function rebuildIndex() {
    index = new Map(entries.map(([id, item]) => {
      const names = [item.title, item.latin || '', ...Object.keys(aliases).filter(name => aliases[name] === id)];
      const translated = Object.values(window.madhavTranslations || {}).flatMap(dictionary => names.map(name => dictionary[name] || ''));
      return [id, [...names, ...translated].join(' ').normalize('NFKC').toLocaleLowerCase()];
    }));
  }
  function productList(id, used, full) {
    const details = node('details', '', 'ingredient-products');
    if (full) details.setAttribute('open', '');
    details.append(node('summary', 'Find in ' + used.length + (used.length === 1 ? ' preparation' : ' preparations')));
    for (const [key, product] of used) {
      const link = node('a', product.title + ' ↗');
      link.href = 'product.html?product=' + key + '#composition'; details.append(link);
      const seen = new Set();
      for (const format of product.formats || [product]) for (const row of format.ingredients || []) {
        if (aliases[row[0]] !== id) continue;
        const note = window.MadhavIngredientNotes?.get(key, row[0]); if (!note) continue;
        const signature = (format.label || '') + '|' + note.benefit + '|' + note.explanation;
        if (seen.has(signature)) continue; seen.add(signature);
        const role = node('p', '', 'mm-ingredient-product-note');
        const basis = node('small', '', 'component-evidence');
        if (format.label) basis.append(node('span', format.label), document.createTextNode(' · '));
        basis.append(node('span', format.basis || ''));
        role.append(basis, node('strong', note.benefit), node('br'), node('span', note.explanation));
        details.append(role);
      }
    }
    return details;
  }
  function section(body, title) {
    const element = node('section', '', 'mm-ingredient-section');
    element.append(node('h3', title)); body.append(element); return element;
  }
  function makeCard(id, item, full) {
    const copy = editorial[id];
    const card = node('article', '', 'ingredient-card' + (full ? ' ingredient-selected' : ' mm-ingredient-preview'));
    card.id = 'ingredient-' + id; card.dataset.id = id;
    const picture = ingredientPicture(item);
    if (!full) {
      const zoom = picture.querySelector('.ingredient-photo-button');
      const image = zoom?.querySelector('img');
      if (zoom && image) {
        const imageLink = node('a', '', 'ingredient-image-frame mm-ingredient-image-link');
        imageLink.href = profileURL(id); imageLink.setAttribute('aria-label', item.title);
        imageLink.append(image); picture.insertBefore(imageLink, zoom);
        zoom.classList.add('mm-ingredient-preview-zoom');
      }
    }
    card.append(picture);
    const body = node('div', '', 'ingredient-card-body');
    const group = item.group === 'familiar' ? 'FAMILIAR BOTANICAL' : item.group === 'rare' ? 'LESSER-KNOWN BOTANICAL' : item.group === 'oil' ? 'OIL / PREPARATION' : item.group === 'mineral' ? 'MINERAL / MATERIAL' : 'FORMULATION COMPONENT';
    body.append(node('p', copy?.badge || group, 'ingredient-group'));
    const heading = node('h2');
    if (full) heading.textContent = item.title;
    else {
      const link = node('a', item.title, 'mm-ingredient-card-link'); link.href = profileURL(id); heading.append(link);
    }
    body.append(heading, node('p', item.latin || 'Identity as stated on the product label', 'ingredient-latin'));
    if (full && copy) body.append(node('p', copy.subtitle, 'mm-ingredient-subtitle'));
    const used = Object.entries(products).filter(([, product]) => matches(product, id));
    const firstProduct = used[0];
    const firstRow = firstProduct && (firstProduct[1].formats || [firstProduct[1]]).flatMap(format => format.ingredients || []).find(row => aliases[row[0]] === id);
    const previewBenefit = firstRow && window.MadhavIngredientNotes?.get(firstProduct[0], firstRow[0])?.benefit;
    body.append(node('p', copy?.hook || (!full && previewBenefit) || item.shortBenefit, 'ingredient-benefit'));
    if (!full) {
      if (used.length) {
        body.append(node('h3', 'Key Formulations', 'mm-ingredient-label'));
        const list = node('ul', '', 'mm-ingredient-key-products');
        for (const [key, product] of used) {
          const row = node('li'), link = node('a', product.title); link.href = 'product.html?product=' + key + '#composition'; row.append(link); list.append(row);
        }
        body.append(list);
      }
      if (copy) body.append(node('h3', 'Why It’s In Our Blend', 'mm-ingredient-label'), node('p', copy.why, 'mm-ingredient-why'));
    } else {
      if (copy) {
        section(body, '1. About this ingredient').append(node('p', copy.essence));
        const research = section(body, '2. Traditional uses and research');
        research.append(node('h4', 'Key natural compounds'), node('p', copy.bioactives), node('h4', 'What it is known for'));
        const list = node('ul'); for (const text of copy.advantages) list.append(node('li', text)); research.append(list);
        research.append(node('p', item.paragraph, 'ingredient-description'), node('span', item.evidenceLabel, 'evidence-label'));
        section(body, '3. Using it on its own').append(node('p', copy.raw));
        const blend = section(body, '4. Why we combine ingredients');
        blend.append(node('p', 'Samyoga means combining ingredients; Samskara means preparing or processing them. These Ayurvedic ideas help explain how a recipe is built. The plant part, amount and way it is used still matter.'), node('h4', 'How the ingredients fit together'), node('p', copy.absorption), node('h4', 'Directions and care'), node('p', 'Different ingredients have different jobs in a recipe. Mixing them does not automatically remove side effects or interactions with medicines. Follow the product directions and ask a qualified professional about your own needs.'), node('p', copy.care, 'mm-ingredient-care'));
        body.append(node('h3', '5. Where we use it', 'mm-ingredient-range-heading'));
      } else body.append(node('p', item.paragraph, 'ingredient-description'), node('span', item.evidenceLabel, 'evidence-label'));
      if (item.note) body.append(node('p', item.note, 'ingredient-part-note'));
      if (used.length) body.append(productList(id, used, true));
      body.append(ingredientSources({...item, sources:[...(item.sources || []), ...(window.mmIngredientReferences?.[id] || [])]}));
    }
    if (!full) {
      const link = node('a', 'View ingredient profile ↗', 'ingredient-profile-link'); link.href = profileURL(id); body.append(link);
    }
    if (full && copy) {
      card.classList.add('mm-ingredient-rich');
      const hero = node('div', '', 'mm-ingredient-profile-hero');
      const intro = node('div', '', 'mm-ingredient-profile-intro');
      while (body.firstElementChild && !body.firstElementChild.classList.contains('mm-ingredient-section')) intro.append(body.firstElementChild);
      hero.append(picture, intro); card.append(hero, body);
    } else card.append(body);
    if (!full) window.MadhavIngredientSwipe?.(card, id);
    return card;
  }
  function render() {
    const heading = document.querySelector('.ingredient-hero h1');
    if (heading) heading.textContent = exact ? guide[exact].title : 'Ayurvedic ingredient guide';
    const query = search.value.trim().normalize('NFKC').toLocaleLowerCase();
    const results = entries.filter(([id, item]) => exact ? id === exact : index.get(id).includes(query) && (filter === 'all' || (filter === 'featured' ? query || item.featured : item.group === filter)));
    const fragment = document.createDocumentFragment();
    for (const [id, item] of results) {
      const key = (exact === id ? 'profile:' : 'preview:') + id;
      let card = cards.get(key);
      if (!card) { card = makeCard(id, item, exact === id); cards.set(key, card); }
      fragment.append(card);
    }
    grid.replaceChildren(fragment);
    count.textContent = results.length + (results.length === 1 ? ' ingredient' : ' ingredients');
    const empty = document.getElementById('ingredient-empty'); if (empty) empty.hidden = results.length !== 0;
  }
  function clearSelection() {
    if (!exact) return; exact = null;
    const url = new URL(location.href); url.searchParams.delete('ingredient'); url.hash = ''; history.replaceState(null, '', url.href);
  }
  const filters = document.querySelectorAll('[data-ingredient-filter]');
  filters.forEach(button => button.addEventListener('click', () => {
    clearSelection(); filter = button.dataset.ingredientFilter;
    filters.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    if (typeof changeGrid === 'function') changeGrid(grid, render); else render();
  }));
  search.addEventListener('input', () => { clearSelection(); render(); });
  document.addEventListener('madhav:languagechange', () => { rebuildIndex(); render(); });
  document.getElementById('ingredient-reset')?.addEventListener('click', () => {
    search.value = ''; exact = null; filter = 'featured';
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.ingredientFilter === 'featured')));
    history.replaceState(null, '', 'ingredients.html?lang=' + (window.MadhavI18n?.language || 'en'));
    if (typeof changeGrid === 'function') changeGrid(grid, render); else render(); search.focus();
  });
  if (exact) {
    search.value = guide[exact].title; filter = 'all';
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.ingredientFilter === 'all')));
  }
  rebuildIndex(); render();
  if (exact && location.hash === '#ingredient-' + exact) requestAnimationFrame(() => document.getElementById('ingredient-' + exact)?.scrollIntoView({ behavior: 'instant', block: 'start' }));
})();
