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
const { document: initialView } = parseHTML(home.documentElement.outerHTML);
for (const node of initialView.querySelectorAll('main > :not(#top),.site-footer')) node.remove();

function initialRule(rule, document) {
  // Include interactive states and runtime-inserted controls as a conservative fallback.
  if (/spotlight-|store-launcher|store-count|store-header-link|madhav-|mm-|menu-|site-nav|\[lang|:is\(|:where\(/.test(rule.selectorText)) return true;
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
const critical = esbuild.transformSync(criticalRules(rules, initialView), cssOptions).code;
const style = home.createElement('style'); style.id = 'madhav-initial-styles'; style.textContent = critical;
const full = home.querySelector('link[rel="stylesheet"][href^="styles.css"]');
if (!full) throw new Error('Homepage stylesheet is missing.');
home.head.insertBefore(style, full);
full.setAttribute('media', 'print'); full.setAttribute('data-madhav-full-styles', '');
const fallback = home.createElement('noscript'), fallbackLink = home.createElement('link');
fallbackLink.setAttribute('rel', 'stylesheet'); fallbackLink.setAttribute('href', full.getAttribute('href'));
fallback.append(fallbackLink); home.head.insertBefore(fallback, full.nextSibling);
// Expose image/module hints before the inline styles in streaming HTML.
for (const link of Array.from(home.querySelectorAll('link[rel="preload"],link[rel="modulepreload"]'))) home.head.insertBefore(link, style);
fs.writeFileSync(homePath, '<!doctype html>\n' + home.documentElement.outerHTML + '\n');

function walk(folder) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) { if (entry.name !== 'assets') walk(file); continue; }
    if (/\.(?:js|mjs)$/.test(entry.name)) {
      const transformed = esbuild.transformSync(fs.readFileSync(file, 'utf8'), { loader: 'js', minifyWhitespace: true, minifySyntax: true, minifyIdentifiers: false, legalComments: 'none', charset: 'utf8', target: 'esnext' });
      fs.writeFileSync(file, transformed.code);
    } else if (/\.css$/.test(entry.name)) fs.writeFileSync(file, esbuild.transformSync(fs.readFileSync(file, 'utf8'), cssOptions).code);
  }
}
walk(output);
fs.writeFileSync(path.join(root, '.performance-build.json'), JSON.stringify({ initialStylesBytes: Buffer.byteLength(critical), fullStylesBytes: fs.statSync(path.join(output, 'styles.css')).size }, null, 2));
console.log('Inlined conservative initial homepage styles; full stylesheet retained with a no-JavaScript fallback. Minified deployment CSS/JS.');
