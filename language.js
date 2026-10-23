// Local translations: no remote widget or data submission is required.
(() => {
  'use strict';
  const supported = ['en', 'hi', 'mr', 'te', 'ta', 'bn', 'pa', 'gu'];
  const labels = {en:'English',hi:'हिन्दी',mr:'मराठी',te:'తెలుగు',ta:'தமிழ்',bn:'বাংলা',pa:'ਪੰਜਾਬੀ',gu:'ગુજરાતી'};
  const key = 'madhav-website-language';
  const normalize = value => String(value).replace(/\s+/g, ' ').trim();
  let remembered;
  try { remembered = localStorage.getItem(key); } catch {}
  const requested = new URLSearchParams(location.search).get('lang');
  const initialLanguage = supported.includes(requested) ? requested : supported.includes(remembered) ? remembered : 'en';
  let language = 'en', renderedLanguage = 'en', languageRequest = 0;
  const texts = new WeakMap();
  const attributes = new WeakMap();
  const translatedAttributes = ['aria-label', 'alt', 'placeholder'];
  let observer;
  let scheduledFrame = 0;
  const pendingRoots = new Set(), loads = new Map();
  const dictionaries = window.madhavTranslations ||= {};
  const languageBase = document.currentScript?.src || new URL('language.js', location.href).href;
  function loadLanguage(code) {
    if (code === 'en' || dictionaries[code]) return Promise.resolve();
    if (loads.has(code)) return loads.get(code);
    const pending = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = new URL('translations/' + code + '.js?v=20261023-performance', languageBase).href;
      script.async = true;
      script.setAttribute('data-no-translate', '');
      script.onload = () => dictionaries[code] ? resolve() : reject(new Error('Translation unavailable'));
      script.onerror = () => {script.remove(); reject(new Error('Translation could not load'));};
      document.head.append(script);
    });
    loads.set(code, pending);
    pending.catch(() => loads.delete(code));
    return pending;
  }
  const templates = {
    hi:{find:n=>`${n} उत्पादों में उपलब्ध`,show:name=>`${name} दिखाएँ`,explore:name=>`${name} देखें`,photo:name=>`${name} की बड़ी तस्वीर देखें`,amazon:(name,pack)=>`Amazon पर ${name}, ${pack} देखें (नए टैब में खुलेगा)`},
    mr:{find:n=>`${n} उत्पादनांमध्ये आढळते`,show:name=>`${name} दाखवा`,explore:name=>`${name} पाहा`,photo:name=>`${name}चा मोठा फोटो पाहा`,amazon:(name,pack)=>`Amazon वर ${name}, ${pack} पाहा (नवीन टॅबमध्ये उघडते)`},
    te:{find:n=>`${n} తయారీలలో లభిస్తుంది`,show:name=>`${name} చూపించు`,explore:name=>`${name} చూడండి`,photo:name=>`${name} పెద్ద ఫోటో చూడండి`,amazon:(name,pack)=>`Amazonలో ${name}, ${pack} చూడండి (కొత్త ట్యాబ్‌లో తెరుచుకుంటుంది)`},
    ta:{find:n=>`${n} தயாரிப்புகளில் உள்ளது`,show:name=>`${name} காட்டு`,explore:name=>`${name} பார்க்கவும்`,photo:name=>`${name} பெரிய படத்தைப் பார்க்கவும்`,amazon:(name,pack)=>`Amazon இல் ${name}, ${pack} பார்க்கவும் (புதிய தாவலில் திறக்கும்)`},
    bn:{find:n=>`${n} প্রস্তুতিতে রয়েছে`,show:name=>`${name} দেখান`,explore:name=>`${name} দেখুন`,photo:name=>`${name}-এর বড় ছবি দেখুন`,amazon:(name,pack)=>`Amazon-এ ${name}, ${pack} দেখুন (নতুন ট্যাবে খুলবে)`},
    pa:{find:n=>`${n} ਉਤਪਾਦਾਂ ਵਿੱਚ ਮਿਲਦਾ ਹੈ`,show:name=>`${name} ਦਿਖਾਓ`,explore:name=>`${name} ਵੇਖੋ`,photo:name=>`${name} ਦੀ ਵੱਡੀ ਤਸਵੀਰ ਵੇਖੋ`,amazon:(name,pack)=>`Amazon 'ਤੇ ${name}, ${pack} ਵੇਖੋ (ਨਵੀਂ ਟੈਬ ਵਿੱਚ ਖੁੱਲ੍ਹੇਗਾ)`},
    gu:{find:n=>`${n} ઉત્પાદનોમાં મળે છે`,show:name=>`${name} બતાવો`,explore:name=>`${name} જુઓ`,photo:name=>`${name}નો મોટો ફોટો જુઓ`,amazon:(name,pack)=>`Amazon પર ${name}, ${pack} જુઓ (નવી ટૅબમાં ખુલશે)`}
  };

  function translate(value, depth = 0) {
    const raw = String(value);
    const source = normalize(raw);
    if (language === 'en' || !source || depth > 5) return raw;
    const dictionary = dictionaries[language] || {};
    let result = Object.hasOwn(dictionary, source) ? dictionary[source] : undefined;
    const part = text => translate(text, depth + 1);
    if (!result) {
      const count = source.match(/^(\d+) (listed components|products?|ingredients?)$/);
      const preparations = source.match(/^Find in (\d+) (preparations?)$/);
      const amazon = source.match(/^(View|Search for) (.+), (.+) on Amazon \(opens in a new tab\)$/);
      const prefix = source.match(/^(Show|Explore|View larger photo of) (.+)$/);
      if (count) result = count[1] + ' ' + part(count[2]);
      else if (preparations) result = templates[language].find(preparations[1]);
      else if (amazon) result = templates[language].amazon(part(amazon[2]),part(amazon[3]));
      else if (prefix) result = templates[language][prefix[1]==='Show'?'show':prefix[1]==='Explore'?'explore':'photo'](part(prefix[2]));
      else if (source.startsWith('Composition photo: ')) result = part('Composition photo:') + ' ' + source.slice('Composition photo: '.length);
      else if (/^representative (botanical|oil|mineral|blend|helper) illustration$/.test(source)) result = part('representative illustration');
      else if (/ (?:—|·|\|) /.test(source)) result = source.split(/( (?:—|·|\|) )/).map((text, index) => index % 2 ? text : part(text)).join('');
      else if (source.endsWith(' ↗') || source.endsWith(' →')) result = part(source.slice(0, -2)) + source.slice(-2);
      else if (source.includes('; ')) result = source.split('; ').map(part).join('; ');
      else if (source.includes(', ')) result = source.split(', ').map(part).join(', ');
    }
    if (!result || result === source) return raw;
    return (raw.match(/^\s*/)?.[0] || '') + result + (raw.match(/\s*$/)?.[0] || '');
  }

  function translateText(node) {
    const current = node.nodeValue;
    let record = texts.get(node);
    if (!record || current !== record.rendered) record = {source:current};
    const rendered = translate(record.source);
    record.rendered = rendered;
    texts.set(node, record);
    if (current !== rendered) node.nodeValue = rendered;
  }

  function translateAttribute(element, name) {
    if (!element.hasAttribute(name)) return;
    const current = element.getAttribute(name);
    const records = attributes.get(element) || {};
    let record = records[name];
    if (!record || current !== record.rendered) record = {source:current};
    const rendered = translate(record.source);
    records[name] = {source:record.source, rendered};
    attributes.set(element, records);
    if (current !== rendered) element.setAttribute(name, rendered);
  }

  function excluded(element) {
    return !element || Boolean(element.closest('script,style,noscript,[data-no-translate]'));
  }

  function translateRoot(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      if (!excluded(root.parentElement)) translateText(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE && excluded(root)) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      if (!excluded(walker.currentNode.parentElement)) translateText(walker.currentNode);
    }
    const elements = root.nodeType === Node.ELEMENT_NODE ? [root, ...root.querySelectorAll('[aria-label],[alt],[placeholder]')] : [...root.querySelectorAll('[aria-label],[alt],[placeholder]')];
    elements.forEach(element => {
      if (!excluded(element)) translatedAttributes.forEach(name => translateAttribute(element, name));
    });
    if (root === document || root === document.head) {
      const description = document.querySelector('meta[name="description"]');
      if (description) translateAttribute(description, 'content');
    }
  }

  const observe = () => {
    // English is the source content; it needs no mutation translation work.
    if (language !== 'en') observer?.observe(document.documentElement, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:translatedAttributes.concat('content')});
  };
  function apply() {
    // Disconnect during our writes; later product/filter updates are still observed.
    observer?.disconnect();
    cancelAnimationFrame(scheduledFrame); scheduledFrame = 0; pendingRoots.clear();
    document.documentElement.lang = language;
    if (language !== 'en' || renderedLanguage !== 'en') translateRoot(document);
    renderedLanguage = language;
    document.querySelectorAll('[data-language-select]').forEach(select => { select.value = language; });
    observe();
  }

  function remember() {
    try { localStorage.setItem(key, language); } catch {}
  }

  async function setLanguage(next, {initial = false} = {}) {
    if (!supported.includes(next)) return false;
    const current = ++languageRequest;
    const selects = document.querySelectorAll('[data-language-select]');
    selects.forEach(select => {select.value = next; select.setAttribute('aria-busy', 'true');});
    try {await loadLanguage(next);} catch {
      if (current !== languageRequest) return false;
      selects.forEach(select => {select.value = language; select.removeAttribute('aria-busy');});
      const status = document.getElementById('language-status');
      if (status) status.textContent = 'This language could not load. Please try again.';
      return false;
    }
    if (current !== languageRequest) return false;
    language = next;
    remember();
    // Keep product/ingredient queries and hash when making this view shareable.
    const url = new URL(location.href);
    url.searchParams.set('lang', language);
    try { history.replaceState(history.state, '', url); } catch {}
    apply();
    selects.forEach(select => select.removeAttribute('aria-busy'));
    const status = document.getElementById('language-status');
    if (status && !initial) status.textContent = translate('Language changed') + ': ' + labels[language];
    document.dispatchEvent(new CustomEvent('madhav:languagechange', {detail:{language}}));
    return true;
  }

  window.MadhavI18n = {translate, setLanguage, apply, supported, get language(){return language;}};
  document.querySelectorAll('[data-language-select]').forEach(select => select.addEventListener('change', () => setLanguage(select.value)));
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    const url = new URL(href, location.href);
    if (url.origin === location.origin && /\/(?:index|product|ingredients)\.html$/.test(url.pathname)) {
      url.searchParams.set('lang', language);
      link.href = url.href;
    }
  }, true);
  observer = new MutationObserver(records => {
    if (language === 'en') return;
    for (const record of records) {
      if (record.type === 'childList') record.addedNodes.forEach(node => pendingRoots.add(node));
      else pendingRoots.add(record.target);
    }
    if (scheduledFrame || !pendingRoots.size) return;
    scheduledFrame = requestAnimationFrame(() => {
      scheduledFrame = 0; observer.disconnect();
      const roots = [...pendingRoots]; pendingRoots.clear();
      for (const node of roots) {
        if (!node.isConnected || roots.some(other => other !== node && other.contains?.(node))) continue;
        translateRoot(node);
        if (node.matches?.('meta[name="description"]')) translateAttribute(node, 'content');
      }
      observe();
    });
  });
  if (initialLanguage === 'en') remember();
  apply();
  if (initialLanguage !== 'en') setLanguage(initialLanguage, {initial:true});
  // Page scripts below build cards, tables and dialogs after this file is loaded.
  document.addEventListener('DOMContentLoaded', apply, {once:true});
})();
