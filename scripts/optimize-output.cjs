/* Optimize deployment output only. Editable source files and original assets remain intact. */
const fs = require('node:fs'), path = require('node:path');
const { parseHTML } = require('linkedom');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '..'), output = path.join(root, 'dist');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const { document: cssDocument } = parseHTML('<html><head><style>' + read('styles.css') + '</style></head></html>');
const rules = cssDocument.querySelector('style').sheet.cssRules;
const homePath = path.join(output, 'index.html');
const { document: home } = parseHTML(fs.readFileSync(homePath, 'utf8'));
// These components belong to the separate product, ingredient and cart pages.
// Keep shared, stateful and unknown selectors; never prune based only on the first viewport.
const otherPageComponent = /^\.(?:gallery-[\w-]+|composition-[\w-]+|component-[\w-]+|directions-[\w-]+|cart-[\w-]+|detail-nav|product-(?:page|hero[\w-]*|gallery|summary|blurb|benefits|section-nav|extra-actions|shopping-actions|help)|ingredients-page|ingredient-(?:card[\w-]*|guide-notes|reading-note|photo-[\w-]+|image-frame|selected|picture[\w-]*|profile-link|sources|products|search-[\w-]+|hero[\w-]*|grid|description|part-note|disclaimer|benefit|empty|group|latin|library|toolbar))(?=[\s.#[:>+~]|$)/;
function splitSelectors(value) {
  const parts = []; let start = 0, depth = 0, quote = '';
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (quote) { if (char === quote && value[i - 1] !== '\\') quote = ''; continue; }
    if (char === '"' || char === "'") quote = char;
    else if (char === '(' || char === '[') depth++;
    else if (char === ')' || char === ']') depth--;
    else if (char === ',' && depth === 0) { parts.push(value.slice(start, i).trim()); start = i + 1; }
  }
  parts.push(value.slice(start).trim()); return parts;
}
function homeRules(list) {
  return Array.from(list, rule => {
    if (rule.selectorText) {
      const selectors = splitSelectors(rule.selectorText).filter(selector => {
        // Keep runtime controls, language/state selectors and unfamiliar syntax.
        // All other selectors must match somewhere on the complete homepage,
        // including content below the fold, before they are sent to this page.
        if (!otherPageComponent.test(selector) && (/\[|:(?:is|where|not|has)\(|\.(?:store-|madhav-|mm-|menu-|language-|ingredient-(?:swipe|is-swiping))/.test(selector) || !selector.includes('.'))) return true;
        const base = selector.replace(/::[\w-]+(?:\([^)]*\))?/g, '').replace(/:(?:hover|focus(?:-within|-visible)?|active|visited|checked|disabled|enabled|target)\b/g, '');
        try { return !!home.querySelector(base); } catch { return true; }
      });
      return selectors.length ? selectors.join(',') + '{' + rule.style.cssText + '}' : '';
    }
    if (rule.cssRules && !/keyframes/i.test(rule.cssText.slice(0, rule.cssText.indexOf('{')))) {
      const children = homeRules(rule.cssRules);
      return children ? rule.cssText.slice(0, rule.cssText.indexOf('{') + 1) + children + '}' : '';
    }
    return rule.cssText;
  }).join('');
}
const { document: initialView } = parseHTML(home.documentElement.outerHTML);
for (const node of initialView.querySelectorAll('main > :not(#top),.site-footer')) node.remove();

function initialRule(rule, document) {
  // Include interactive states and runtime-inserted controls as a conservative fallback.
  if (/spotlight-|store-launcher|store-count|store-header-link|madhav-range|mm-action-|menu-|site-nav|\[lang/.test(rule.selectorText)) return true;
  const selector = rule.selectorText.replace(/::[\w-]+(?:\([^)]*\))?/g, '').replace(/:(?:hover|focus(?:-within|-visible)?|active|visited|checked|disabled|enabled|target)\b/g, '');
  try { return !!document.querySelector(selector); }
  catch { return true; } // Unknown selectors stay; do not guess that they are unused.
}
function criticalRules(list, document) {
  return Array.from(list, rule => {
    if (rule.selectorText) return initialRule(rule, document) ? rule.cssText : '';
    if (rule.cssRules && !/keyframes/i.test(rule.cssText.slice(0, rule.cssText.indexOf('{')))) {
      const children = criticalRules(rule.cssRules, document);
      return children ? rule.cssText.slice(0, rule.cssText.indexOf('{') + 1) + children + '}' : '';
    }
    return rule.cssText; // Preserve font, keyframe, support and unknown at-rules.
  }).join('');
}
const cssOptions = { loader: 'css', minifyWhitespace: true, minifySyntax: false, legalComments: 'none', charset: 'utf8' };
const startupTransitionGuard = 'html.madhav-styles-loading.madhav-styles-loading.madhav-styles-loading.madhav-styles-loading body *,html.madhav-styles-loading.madhav-styles-loading.madhav-styles-loading.madhav-styles-loading body *::before,html.madhav-styles-loading.madhav-styles-loading.madhav-styles-loading.madhav-styles-loading body *::after{transition:none!important}';
const critical = esbuild.transformSync(criticalRules(rules, initialView) + startupTransitionGuard, cssOptions).code;
const style = home.createElement('style'); style.id = 'madhav-initial-styles'; style.textContent = critical;
const full = home.querySelector('link[rel="stylesheet"][href^="styles.css"]');
if (!full) throw new Error('Homepage stylesheet is missing.');
const homeCss = esbuild.transformSync(homeRules(rules), cssOptions).code;
fs.writeFileSync(path.join(output, 'home.css'), homeCss);
full.setAttribute('href', full.getAttribute('href').replace(/^styles\.css/, 'home.css'));
home.head.insertBefore(style, full);
full.setAttribute('media', 'print'); full.setAttribute('data-madhav-full-styles', '');
const fallback = home.createElement('noscript'), fallbackLink = home.createElement('link');
fallbackLink.setAttribute('rel', 'stylesheet'); fallbackLink.setAttribute('href', full.getAttribute('href'));
fallback.append(fallbackLink); home.head.insertBefore(fallback, full.nextSibling);
// Expose image/module hints before the inline styles in streaming HTML.
for (const link of Array.from(home.querySelectorAll('link[rel="preload"],link[rel="modulepreload"]'))) home.head.insertBefore(link, style);
fs.writeFileSync(homePath, '<!doctype html>\n' + home.documentElement.outerHTML + '\n');

// One asynchronous module contains the cart and its public configuration.
// This preserves immediate cart startup while removing its import waterfall
// and its ability to hold up DOMContentLoaded on a slow connection.
const bundledShop = esbuild.buildSync({ entryPoints: [path.join(output, 'shop.js')], bundle: true, write: false, format: 'esm', platform: 'browser', target: 'esnext', minifyWhitespace: true, minifySyntax: true, minifyIdentifiers: false, legalComments: 'none', charset: 'utf8' }).outputFiles[0].text;
fs.writeFileSync(path.join(output, 'shop.js'), bundledShop);

function walk(folder) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) { if (entry.name !== 'assets') walk(file); continue; }
    if (/\.html$/.test(entry.name)) {
      const { document } = parseHTML(fs.readFileSync(file, 'utf8'));
      for (const script of document.querySelectorAll('script[type="module"][src^="shop.js"]')) script.setAttribute('async', '');
      for (const hint of document.querySelectorAll('link[rel="modulepreload"]')) {
        if (['store-config.mjs', 'site-settings.js'].includes(hint.getAttribute('href'))) hint.remove();
      }
      fs.writeFileSync(file, '<!doctype html>\n' + document.documentElement.outerHTML + '\n');
    } else if (/\.(?:js|mjs)$/.test(entry.name)) {
      const transformed = esbuild.transformSync(fs.readFileSync(file, 'utf8'), { loader: 'js', minifyWhitespace: true, minifySyntax: true, minifyIdentifiers: false, legalComments: 'none', charset: 'utf8', target: 'esnext' });
      fs.writeFileSync(file, transformed.code);
    } else if (/\.css$/.test(entry.name)) fs.writeFileSync(file, esbuild.transformSync(fs.readFileSync(file, 'utf8'), cssOptions).code);
  }
}
walk(output);
fs.writeFileSync(path.join(root, '.performance-build.json'), JSON.stringify({ initialStylesBytes: Buffer.byteLength(critical), homeStylesBytes: Buffer.byteLength(homeCss), fullStylesBytes: fs.statSync(path.join(output, 'styles.css')).size }, null, 2));
console.log('Inlined conservative initial homepage styles; full stylesheet retained with a no-JavaScript fallback. Minified deployment CSS/JS.');
