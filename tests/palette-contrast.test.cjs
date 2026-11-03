const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { parseHTML } = require('linkedom');
const root = path.resolve(__dirname, '..'), values = {};
const document = parseHTML('<html><head><style>' + fs.readFileSync(path.join(root, 'styles.css'), 'utf8') + '</style></head></html>').document;
for (const rule of Array.from(document.querySelector('style').sheet.cssRules)) if (rule.selectorText === ':root') {
  for (const property of ['--forest','--deep','--paper','--cream','--sage','--gold','--gold-light','--ink','--muted','--on-dark','--on-dark-muted']) {
    const value = rule.style.getPropertyValue(property); if (value) values[property] = value.trim();
  }
}
function luminance(value) {
  assert(/^#[0-9a-f]{6}$/i.test(value), value);
  const rgb = value.slice(1).match(/../g).map(c => parseInt(c, 16) / 255).map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return rgb.reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
}
const pairs = [
  ['--on-dark','--deep',7], ['--on-dark-muted','--deep',4.5], ['--gold-light','--deep',4.5],
  ['--on-dark','--forest',4.5], ['--ink','--paper',4.5], ['--ink','--cream',4.5],
  ['--muted','--paper',4.5], ['--muted','--cream',4.5], ['--muted','--sage',4.5],
  ['--gold','--paper',4.5], ['--gold','--cream',4.5]
];
for (const [foreground, background, minimum] of pairs) {
  const [low, high] = [luminance(values[foreground]), luminance(values[background])].sort((a,b) => a-b);
  const ratio = (high + 0.05) / (low + 0.05);
  assert(ratio >= minimum, foreground + ' on ' + background + ': ' + ratio.toFixed(2) + ', needs ' + minimum);
}
console.log('Passed: ' + pairs.length + ' text/background palette contrast pairs, including dark contact text, muted footer text and gold labels.');
