/* Build-time prices and stable cart placeholders. store-config.mjs is the only price source. */
module.exports = function renderStoreDisplay({ document, products, store, selectedId, formatIndex = 0, json }) {
  const money = price => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(price);
  const itemsFor = id => store.products.filter(item => item.productId === id);
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text != null) element.textContent = text;
    return element;
  };
  function priceNode(id, items, detail) {
    const element = node('p', 'store-purchase-price' + (detail ? ' store-product-price' : ''));
    element.dataset.storePrice = id;
    if (detail) element.dataset.storeDetail = 'true';
    element.setAttribute('data-no-translate', '');
    const values = items.map(item => item.unitPrice);
    if (!values.length || values.some(value => typeof value !== 'number' || !Number.isFinite(value) || value <= 0)) {
      throw new Error('Missing displayed price for ' + id);
    }
    const low = Math.min(...values), high = Math.max(...values);
    element.textContent = low === high ? money(low) : money(low) + ' – ' + money(high);
    return element;
  }
  function buttonNode(id, items, detail) {
    const choose = items.length > 1 && !detail;
    const button = node(choose ? 'a' : 'button', detail ? 'store-product-buy' : 'store-card-buy', choose ? 'Choose pack' : 'Add to cart');
    button.dataset.storeBuy = id;
    button.setAttribute('data-no-translate', '');
    if (choose) button.href = 'product.html?product=' + encodeURIComponent(products[id].slug || id);
    else { button.type = 'button'; button.disabled = true; }
    return button;
  }
  for (const card of document.querySelectorAll('.product-card')) {
    const href = card.querySelector('a[href*="product="]')?.getAttribute('href');
    if (!href) continue;
    const slug = new URL(href, 'https://example.invalid/').searchParams.get('product');
    const id = Object.keys(products).find(key => (products[key].slug || key) === slug) || slug;
    const items = itemsFor(id), body = card.querySelector('.product-card-content');
    if (items.length && body && !body.querySelector('[data-store-buy]')) body.append(priceNode(id, items), buttonNode(id, items));
  }
  const product = products[selectedId], actions = document.querySelector('.product-shopping-actions');
  if (product && actions) {
    const items = itemsFor(selectedId);
    const selected = items.find(item => item.formatIndex === formatIndex) || items[0];
    if (!selected) throw new Error('Missing retail pack for ' + selectedId);
    actions.prepend(priceNode(selectedId, [selected], true), buttonNode(selectedId, items, true));
    if (items.length > 1) {
      const packs = node('p', 'mm-pack-prices');
      for (const item of items) {
        const pack = node('span', 'mm-pack-price');
        const amount = node('span', '', money(item.unitPrice)); amount.setAttribute('data-no-translate', '');
        pack.append(node('span', '', item.pack), document.createTextNode(' — '), amount);
        packs.append(pack);
      }
      actions.before(packs);
    }
    // Non-executable public data keeps browser metadata correct before the cart module arrives.
    const data = node('script'); data.id = 'mm-store-data'; data.type = 'application/json';
    data.textContent = json({ currency: store.currency, products: items });
    document.head.append(data);
  }
  const nav = document.querySelector('.site-nav,.detail-nav');
  if (nav && !nav.querySelector('[data-store-header-cart]')) {
    const link = node('a', 'store-header-cart', 'Your cart (0)');
    link.href = 'cart.html'; link.setAttribute('data-store-header-cart', ''); link.setAttribute('data-no-translate', '');
    nav.append(link);
  }
};
