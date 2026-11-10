/* Small progressive enhancements; catalogue, translations and transport stay shared. */
(() => {
  'use strict';
  const root = document.documentElement;
  if (!root || root.dataset.mmPolishReady) return;
  root.dataset.mmPolishReady = 'true';
  const applyLanguage = () => window.MadhavI18n?.apply?.();
  const make = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  };

  // Static links still work without JavaScript. Hide the fixed bar where it
  // could compete with a form, footer, keyboard or existing modal.
  const bar = document.querySelector('.mm-action-bar');
  if (bar) {
    const overlaps = new Set();
    let queued = 0;
    const updateBar = () => {
      queued = 0;
      const active = document.activeElement;
      const editing = active?.matches?.('input,textarea,select,[contenteditable="true"]');
      const viewport = window.visualViewport;
      const keyboard = viewport && window.innerHeight - viewport.height > 150;
      const modal = !!document.querySelector('dialog[open]');
      root.classList.toggle('mm-action-hidden', !!(overlaps.size || editing || keyboard || modal));
      root.classList.toggle('mm-action-editing', !!(editing || keyboard));
    };
    const queueBar = () => { if (!queued) queued = requestAnimationFrame(updateBar); };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) overlaps.add(entry.target);
          else overlaps.delete(entry.target);
        }
        queueBar();
      });
      document.querySelectorAll('.site-footer,.cart-page-footer,#connect-form').forEach(node => observer.observe(node));
    } else bar.classList.add('mm-action-static');
    document.addEventListener('focusin', queueBar);
    document.addEventListener('focusout', queueBar);
    window.visualViewport?.addEventListener('resize', queueBar, { passive: true });
    window.matchMedia('(max-width:767px)').addEventListener?.('change', queueBar);
    document.addEventListener('close', queueBar, true);
    document.addEventListener('cancel', queueBar, true);
    // Native dialog opening is already reflected in this existing root class.
    if ('MutationObserver' in window) new MutationObserver(queueBar).observe(root, { attributes: true, attributeFilter: ['class'] });
    updateBar();
  }

  // Retain native dialog focus restoration, Escape and outside-tap behaviour.
  // Add image activation and an explicit Tab loop without a second lightbox.
  const photo = document.getElementById('product-image');
  const enlarge = document.getElementById('gallery-enlarge');
  if (photo && enlarge) {
    photo.setAttribute('role', 'button');
    photo.setAttribute('tabindex', '0');
    photo.setAttribute('aria-haspopup', 'dialog');
    photo.setAttribute('aria-label', 'Enlarge product image');
    photo.addEventListener('click', () => enlarge.click());
    photo.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); enlarge.click(); }
    });
  }
  document.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const dialog = document.querySelector('dialog[open]');
    if (!dialog) return;
    const controls = [...dialog.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])')]
      .filter(node => !node.disabled && !node.hidden && node.getClientRects().length);
    const first = controls[0], last = controls[controls.length - 1];
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
      event.preventDefault(); first.focus();
    }
  });

  const composition = document.querySelector('.mm-composition');
  if (composition) {
    const summary = composition.querySelector('summary');
    const sync = () => summary?.setAttribute('aria-expanded', String(composition.open));
    composition.addEventListener('toggle', sync);
    document.querySelectorAll('a[href="#composition"]').forEach(link => link.addEventListener('click', () => { composition.open = true; sync(); }));
    sync();
  }

  // Construct the extra comparison rows only on the first deliberate opening.
  const products = window.productCatalogue;
  const id = new URLSearchParams(window.location.search).get('product');
  const comparisonHost = document.querySelector('.formula-feature') ||
    (['madhumeh-value', 'madhumeh-premium'].includes(id) && document.getElementById('sibling-links'));
  const value = products?.['madhumeh-value'], premium = products?.['madhumeh-premium'];
  if (comparisonHost && value?.ingredients && premium?.ingredients) {
    const details = make('details', '', 'mm-comparison');
    details.append(make('summary', 'Compare Value and Premium'));
    comparisonHost.append(details);
    let built = false;
    details.addEventListener('toggle', () => {
      if (!details.open || built) return;
      built = true;
      const panel = make('div', '', 'mm-comparison-panel');
      for (const product of [value, premium]) {
        const basis = make('p'); basis.append(make('strong', product.title), make('span', product.basis)); panel.append(basis);
      }
      const table = make('table', '', 'mm-comparison-table');
      table.append(make('caption', 'Label composition comparison'));
      const head = make('thead'), row = make('tr');
      for (const title of ['Ingredient / component', value.title, premium.title]) { const cell = make('th', title); cell.scope = 'col'; row.append(cell); }
      head.append(row); table.append(head);
      const body = make('tbody');
      const names = [...new Set([...value.ingredients, ...premium.ingredients].map(item => item[0]))];
      for (const name of names) {
        const line = make('tr'), title = make('th', name); title.scope = 'row'; line.append(title);
        for (const product of [value, premium]) {
          const item = product.ingredients.find(entry => entry[0] === name), cell = make('td');
          if (item) cell.append(make('span', item[2]), make('small', item[1]));
          else { cell.textContent = '—'; cell.setAttribute('aria-label', 'Not listed on this panel'); }
          line.append(cell);
        }
        body.append(line);
      }
      table.append(body); panel.append(table); details.append(panel); applyLanguage();
    });
  }

  // Capture only invalid submits; the existing honeypot, payload, endpoint,
  // consent, disabled state, success/error handling and retries stay intact.
  const form = document.getElementById('connect-form');
  if (form) {
    const fields = ['name', 'email', 'phone'].map(name => form.elements.namedItem(name)).filter(Boolean);
    const touched = new Set();
    const errors = new Map();
    const text = name => String(form.elements.namedItem(name)?.value || '').trim();
    const errorFor = name => {
      if (name === 'name' && (text(name).length < 2 || text(name).length > 80 || /[\u0000-\u001f\u007f]/.test(text(name)))) return 'Please enter your name (2–80 characters).';
      if (name === 'email') {
        if (!text('email') && !text('phone')) return 'Please give an email address or phone number.';
        if (text(name) && (text(name).length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text(name)))) return 'Please enter a valid email address.';
      }
      if (name === 'phone' && text(name) && !/^(?:\+91)?[6-9]\d{9}$/.test(text(name).replace(/\s/g, ''))) return 'Enter a 10-digit Indian mobile number, with optional +91.';
      return '';
    };
    for (const field of fields) {
      const labelText = field.closest('label')?.querySelector('span');
      if (labelText && !field.hasAttribute('aria-label') && !field.hasAttribute('aria-labelledby')) {
        if (!labelText.id) labelText.id = 'mm-label-' + field.name;
        field.setAttribute('aria-labelledby', labelText.id);
      }
      const message = make('span', '', 'mm-field-error'); message.id = 'mm-error-' + field.name; message.hidden = true;
      message.setAttribute('data-no-translate', '');
      message.setAttribute('aria-live', 'polite');
      field.parentElement?.append(message); errors.set(field, message);
      const described = (field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
      if (!described.includes(message.id)) described.push(message.id);
      field.setAttribute('aria-describedby', described.join(' '));
    }
    const validate = field => {
      const message = errors.get(field); if (!message) return true;
      const error = errorFor(field.name), rendered = window.MadhavI18n?.translate?.(error) || error;
      if (message.textContent !== rendered) message.textContent = rendered;
      message.hidden = !error;
      if (error) field.setAttribute('aria-invalid', 'true'); else field.removeAttribute('aria-invalid');
      return !error;
    };
    form.addEventListener('focusout', event => {
      if (!errors.has(event.target)) return;
      touched.add(event.target); validate(event.target);
    });
    form.addEventListener('input', event => {
      if (touched.has(event.target)) validate(event.target);
      if (event.target.name === 'email' || event.target.name === 'phone') fields.filter(field => touched.has(field) && field.name !== 'name').forEach(validate);
    });
    form.addEventListener('submit', event => {
      if (text('website')) return;
      let first = null;
      for (const field of fields) { touched.add(field); if (!validate(field) && !first) first = field; }
      if (first) {
        event.preventDefault(); event.stopImmediatePropagation();
        const status = document.getElementById('connect-status'); if (status) status.textContent = '';
        first.focus();
      }
    }, true);
    form.addEventListener('reset', () => {
      touched.clear(); for (const [field, message] of errors) { field.removeAttribute('aria-invalid'); message.hidden = true; message.textContent = ''; }
    });
    document.addEventListener('madhav:languagechange', () => fields.filter(field => touched.has(field)).forEach(validate));
  }
  applyLanguage();
})();
