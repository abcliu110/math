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
// 2026-11-07 复测修：快拖砝码/数字时指针一出元素就丢事件，浏览器当成选文字。
// 指针捕获要在被拖的元素本身（不是根节点），拖动中禁掉 selectstart。
assert(/captureEl: wt\.el/.test(ap), 'SVG weight drag captures the pointer on the weight itself');
assert(/captureOn\(wt\.el, e\.pointerId\)/.test(ap), 'SVG weight drag requests capture on the weight');
assert(/captureEl: nm\.el/.test(ap), 'SVG number drag captures the pointer on the number itself');
assert(/captureOn\(nm\.el, e\.pointerId\)/.test(ap), 'SVG number drag requests capture on the number');
assert(/addEventListener\('selectstart'/.test(ap) && /if \(drag\) e\.preventDefault\(\)/.test(ap),
  'selectstart is suppressed while dragging');
// 2026-11-07 复测修：器材/台面禁选文字（快拖不再选中文字）。
assert(/\[data-drag-weight\],\[data-drag-num\]\{user-select:none/.test(css) ||
  /\[data-drag-weight\][\s\S]{0,120}user-select:\s*none/.test(css),
  'drag weights/numbers are unselectable');
assert(/\.bench-chip[^{]*\{[^}]*user-select:\s*none/.test(css) ||
  /\.bench-chip,\[data-drag-weight\]/.test(css),
  'bench chips are unselectable');

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

// 批 3 复测修：量砝码拖到台面画布盘上。根因：hitAt 只认站天平 #worldBalSvg
// 和 HTML 落点框，台面画布盘（<rect id="worldBenchPanL/R">，没有 data-bal-pan）
// 从来不在判定里，量砝码拖 5 次都悄悄落空（分数芯片走 benchDropTargetAt，
// 认画布盘，所以一次就落）。下面每条在改前代码上干净失败。
assert(/function benchCanvasPanHitAt\(clientX, clientY\)/.test(ap),
  'bench canvas pan hit test exists');
assert(/worldBenchPanL/.test(ap) && /worldBenchPanR/.test(ap),
  'bench canvas pan rects are hit-tested');
assert((ap.match(/benchCanvasPanHitAt\(clientX, clientY\)/g) || []).length >= 2,
  'hitAt and markDropHot both consult the bench canvas pans');
assert(/const benchSide = benchCanvasPanHitAt\(clientX, clientY\);/.test(ap),
  'bench canvas pan hit is called with the pointer position');
assert(/vx >= 46 && vx <= 174 && vy >= 136 && vy <= 244/.test(ap),
  'bench canvas left pan geometry matches benchDropTargetAt');
assert(/vx >= 366 && vx <= 494 && vy >= 136 && vy <= 244/.test(ap),
  'bench canvas right pan geometry matches benchDropTargetAt');
assert(/svg\.viewBox\.baseVal/.test(ap),
  'bench canvas pan hit reads the live viewBox (zoom-aware)');
assert(/panL\.classList\.remove\('is-hot'\)/.test(ap) && /panR\.classList\.remove\('is-hot'\)/.test(ap),
  'clearDropHot clears the bench canvas pan highlight');
assert(/#worldBenchPanL\.is-hot, #worldBenchPanR\.is-hot/.test(css),
  'bench canvas pan hot CSS');
assert(/#worldBenchPanL\.is-hot, #worldBenchPanR\.is-hot \{ fill:#fbbf24/.test(css),
  'bench canvas pan hot fill is bright amber like the station pan');

console.log('smoke-apparatus-drag: ok');
