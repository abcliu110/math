/* Smoke: apparatus drag contract — mid-drag must not wipe SVG; HTML chips wired. */
'use strict';
const fs = require('fs');
const path = require('path');
const web = path.join(__dirname, '..', 'apps', 'web');
const ap = fs.readFileSync(path.join(web, 'apparatus.js'), 'utf8');
const html = fs.readFileSync(path.join(web, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(web, 'styles.css'), 'utf8');
const app = fs.readFileSync(path.join(web, 'app.js'), 'utf8');

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
}

assert(/if \(drag\) return;/.test(ap), 'renderAll must skip while drag is active');
assert(/isDragging/.test(ap), 'isDragging exported');
assert(/data-drag-chip/.test(ap), 'bind handles data-drag-chip');
assert(/data-drop/.test(ap), 'bind resolves data-drop');
assert(/pendingN|pendingR|pendingK/.test(ap), 'SVG handles commit on pointerup');
assert(/version: '0\.3\.0'/.test(ap), 'apparatus version 0.3.0');

assert(/data-drag-chip="weight"/.test(html), 'balance HTML weight chips');
assert(/data-drop="balance\.L"/.test(html), 'balance left drop');
assert(/data-drop="balance\.R"/.test(html), 'balance right drop');
assert(/data-drag-chip="num"/.test(html), 'numline HTML chips');
assert(/data-drop="numline"/.test(html), 'numline drop');
assert(/data-frac-range="A"/.test(html), 'frac A range');
assert(/data-world-range="rabbits"/.test(html), 'chicken rabbits range');

assert(/\.apparatus-chip\{/.test(css), 'chip CSS');
assert(/\.apparatus-drop\.is-hot/.test(css), 'drop hot CSS');

assert(/data-frac-range/.test(app), 'app binds frac ranges');
assert(/rabbits/.test(app) && /chickenSetRabbits/.test(app), 'app binds rabbits range');
assert(/fa-ad-set/.test(app), 'app binds denom chips');
assert(/Apparatus\.isDragging/.test(app), 'app respects isDragging when syncing ranges');

console.log('smoke-apparatus-drag: ok');
