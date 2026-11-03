const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..'), code = fs.readFileSync(path.join(root, 'website.js'), 'utf8');
const start = code.indexOf('function createMadhavRangeController('), end = code.indexOf('const spotlight=', start);
assert(start >= 0 && end > start);
const context = { window: {} }; vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'responsive-images.js'), 'utf8'), context);
vm.runInContext(code.slice(start, end), context);
const sources = Object.keys(context.window.MadhavImages.entries).filter(source => source.includes('cutouts/')).slice(0, 3);
const items = sources.map(image => ({ image }));
const loaders = [], commits = [], errors = [], timers = new Map(); let busy = false, seq = 0;
function image() { const attributes = {}; return { complete: false, setAttribute(k, v) { attributes[k] = v; }, removeAttribute(k) { delete attributes[k]; }, getAttribute(k) { return attributes[k]; } }; }
const controller = context.createMadhavRangeController({ items, image: { complete: true, naturalWidth: 100 },
  commit(item, index) { commits.push(index); }, onBusy(value) { busy = value; }, onError(item, index) { errors.push(index); },
  makeImage() { const node = image(); loaders.push(node); return node; },
  schedule(fn) { timers.set(++seq, fn); return seq; }, cancel(id) { timers.delete(id); } });
controller.next(); assert(busy); const stale = loaders[0].onload;
assert.equal(loaders[0].getAttribute('srcset'), context.window.MadhavImages.entries[sources[1]].srcset);
controller.next(); stale(); assert.equal(controller.state.shown, 0);
loaders[1].onload(); assert.equal(controller.state.shown, 2); assert(!busy);
controller.next(); assert.equal(controller.state.shown, 0); assert(!busy);
controller.previous(); assert.equal(controller.state.shown, 2);
controller.select(1); loaders.at(-1).onerror(); assert(!busy); assert.equal(controller.state.shown, 2); assert.deepEqual(errors, [1]);
controller.select(1); [...timers.values()][0](); assert(!busy); assert.equal(controller.state.shown, 2);
controller.select(1); loaders.at(-1).onload(); assert.equal(controller.state.shown, 1); assert(!busy);
controller.next(); controller.reset(); assert(!busy); assert.equal(controller.state.loading, false);
controller.destroy(); assert.equal(controller.next(), false); assert.equal(timers.size, 0);
console.log('Passed: responsive preloading, rapid/stale requests, forward/back wrapping, image failure, timeout/retry, reset and cleanup.');
