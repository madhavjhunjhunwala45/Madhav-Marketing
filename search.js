/* Shared metadata builder: used at build time and in the browser. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory;
  else {
    const api = factory(root.madhavSearchSettings);
    root.MadhavSearch = api;
    api.install(root);
  }
})(typeof window !== 'undefined' ? window : this, function createMadhavSearch(settings) {
  'use strict';
  const supported = new Set(['en', 'hi', 'mr', 'te', 'ta', 'bn', 'pa', 'gu']);
  const configured = new URL(settings.origin);
  if (configured.protocol !== 'https:' || configured.username || configured.password || configured.pathname !== '/') throw new Error('Use a root HTTPS origin in search-settings.js');
  const origin = configured.origin;
  const absolute = value => new URL(value, origin + '/').href;
  const own = (object, key) => Boolean(object && Object.prototype.hasOwnProperty.call(object, key));
  const json = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

  function metadata({ kind, id, product, ingredient, language = 'en', translate = value => value }) {
    const locale = supported.has(language) ? language : 'en';
    let path = '', title, description, image = settings.organization.logo, index = true;
    if (kind === 'product' && product) {
      path = 'product.html?product=' + encodeURIComponent(id);
      const custom = own(settings.products, id) ? settings.products[id] : {};
      title = custom.title || product.title + ' | ' + settings.businessName;
      description = custom.description || product.description;
      image = product.image;
    } else if (kind === 'product') {
      path = 'product.html'; title = 'Product not found | ' + settings.businessName;
      description = 'Explore the current Madhav Marketing product range.'; index = false;
    } else if (kind === 'ingredient' && ingredient) {
      path = 'ingredients.html?ingredient=' + encodeURIComponent(id);
      title = ingredient.title + ' | ' + settings.businessName;
      description = ingredient.shortBenefit + ' ' + ingredient.evidenceLabel + '. Explore the ingredient profile, source photograph and references.';
      image = ingredient.photo?.remoteThumbnailUrl || ingredient.photo?.remoteUrl || image;
    } else if (kind === 'ingredients') {
      path = 'ingredients.html'; ({ title, description } = settings.ingredients);
    } else if (kind === 'cart') {
      path = 'cart.html'; ({ title, description } = settings.cart); index = false;
    } else {
      kind = 'home'; ({ title, description } = settings.home);
    }
    const canonical = new URL(path || '/', origin + '/');
    if (locale !== 'en') canonical.searchParams.set('lang', locale);
    return { kind, id, title: translate(title), description: translate(description), canonical: canonical.href,
      image: absolute(image), language: locale, index, product, ingredient };
  }

  function structuredData(meta, catalogue = {}) {
    const orgId = origin + '/#organization', siteId = origin + '/#website';
    const addresses = (Array.isArray(settings.organization.addresses) && settings.organization.addresses.length
      ? settings.organization.addresses : [settings.organization]).map(address => {
        const result = { '@type': 'PostalAddress' };
        for (const key of ['name', 'streetAddress', 'addressLocality', 'addressRegion', 'postalCode', 'addressCountry']) {
          if (typeof address[key] === 'string' && address[key].trim()) result[key] = address[key].trim();
        }
        return result;
      });
    const organization = { '@type': 'Organization', '@id': orgId, name: settings.businessName, url: origin + '/',
      logo: absolute(settings.organization.logo), telephone: settings.organization.telephone,
      email: settings.organization.email, sameAs: settings.organization.sameAs,
      description: settings.organization.description,
      address: addresses.length === 1 ? addresses[0] : addresses };
    const website = { '@type': 'WebSite', '@id': siteId, name: settings.businessName, url: origin + '/', publisher: { '@id': orgId } };
    const page = { '@type': meta.kind === 'ingredients' ? 'CollectionPage' : 'WebPage', '@id': meta.canonical + '#webpage',
      url: meta.canonical, name: meta.title, description: meta.description, inLanguage: meta.language,
      isPartOf: { '@id': siteId }, publisher: { '@id': orgId } };
    const graph = [organization, website, page];
    if (meta.product) {
      const product = { '@type': 'Product', '@id': meta.canonical + '#product', name: meta.product.title,
        description: meta.product.description, image: absolute(meta.product.image), url: meta.canonical,
        brand: { '@type': 'Brand', name: settings.businessName }, category: meta.product.category };
      graph.push(product);
      page.mainEntity = { '@id': product['@id'] };
      // No invented stock, checkout availability, reviews, ratings or medical claims.
    } else if (meta.ingredient) {
      page.about = { '@type': 'Thing', name: meta.ingredient.title, alternateName: meta.ingredient.latin,
        description: meta.ingredient.paragraph };
    } else if (meta.kind === 'home') {
      page.mainEntity = { '@type': 'ItemList', itemListElement: Object.entries(catalogue).map(([id, product], i) => ({
        '@type': 'ListItem', position: i + 1, name: product.displayTitle || product.title,
        url: absolute('product.html?product=' + encodeURIComponent(id))
      })) };
    }
    if (meta.product || meta.ingredient) {
      const items = [{ '@type': 'ListItem', position: 1, name: settings.businessName, item: origin + '/' }];
      if (meta.ingredient) items.push({ '@type': 'ListItem', position: 2, name: 'Ingredient Guide', item: absolute('ingredients.html') });
      items.push({ '@type': 'ListItem', position: items.length + 1, name: meta.product?.title || meta.ingredient.title, item: meta.canonical });
      graph.push({ '@type': 'BreadcrumbList', '@id': meta.canonical + '#breadcrumb', itemListElement: items });
      page.breadcrumb = { '@id': meta.canonical + '#breadcrumb' };
    }
    return { '@context': 'https://schema.org', '@graph': graph };
  }

  function apply(document, meta, catalogue = {}) {
    const head = document.head;
    function tag(selector, name, attributes, value) {
      const matches = [...head.querySelectorAll(selector)];
      const element = matches.shift() || document.createElement(name);
      matches.forEach(duplicate => duplicate.remove());
      for (const [key, content] of Object.entries(attributes)) element.setAttribute(key, content);
      element.setAttribute('data-no-translate', '');
      if (value != null) element.textContent = value;
      if (!element.parentNode) head.append(element);
      return element;
    }
    tag('title', 'title', {}, meta.title);
    tag('meta[name="description"]', 'meta', { name: 'description', content: meta.description });
    tag('meta[name="robots"]', 'meta', { name: 'robots', content: (meta.index ? 'index,follow' : 'noindex,follow') + ',max-image-preview:large' });
    tag('link[rel="canonical"]', 'link', { rel: 'canonical', href: meta.canonical });
    const og = { title: meta.title, description: meta.description, url: meta.canonical, image: meta.image, type: 'website', site_name: settings.businessName };
    for (const [key, content] of Object.entries(og)) tag('meta[property="og:' + key + '"]', 'meta', { property: 'og:' + key, content });
    for (const [key, content] of Object.entries({ card: 'summary_large_image', title: meta.title, description: meta.description, image: meta.image })) {
      tag('meta[name="twitter:' + key + '"]', 'meta', { name: 'twitter:' + key, content });
    }
    tag('#madhav-structured-data', 'script', { id: 'madhav-structured-data', type: 'application/ld+json' }, json(structuredData(meta, catalogue)));
  }

  function install(root) {
    const document = root.document;
    if (!document || root.__madhavSearchInstalled) return;
    root.__madhavSearchInstalled = true;
    function refresh() {
      const params = new URLSearchParams(root.location.search);
      const products = root.productCatalogue || {}, ingredients = root.ingredientGuide || {};
      const kind = document.documentElement.dataset.searchPage || 'home';
      let id = params.get(kind === 'product' ? 'product' : 'ingredient');
      const product = kind === 'product' && own(products, id) ? products[id] : null;
      const ingredient = kind === 'ingredients' && own(ingredients, id) && !ingredients[id].guideHidden ? ingredients[id] : null;
      const language = root.MadhavI18n?.language || 'en';
      const translate = value => root.MadhavI18n?.translate(value) || value;
      const meta = metadata({ kind: ingredient ? 'ingredient' : kind, id, product, ingredient, language, translate });
      apply(document, meta, products);
    }
    refresh();
    document.addEventListener('madhav:languagechange', refresh);
    root.addEventListener('popstate', refresh);
    document.addEventListener('input', event => { if (event.target?.id === 'ingredient-search') queueMicrotask(refresh); });
    document.addEventListener('click', event => {
      if (event.target?.closest?.('[data-ingredient-filter],#ingredient-reset')) queueMicrotask(refresh);
    });
  }
  return { metadata, structuredData, apply, install, absolute, origin, json };
});
