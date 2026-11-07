// Batch-3 checks for the math lab (2026-11-07): arbitrary-angle rotation,
// canvas zoom/pan (50–400%), P2 beam animation, and the 8e38f4c retest
// quirk ① (adding apparatus says "switched to its view" but the canvas
// didn't switch). These verify code and structure only — the LOOK and the
// feel of dragging can only be verified in a real browser, never by this file.
// Run: node tools/smoke-lab-zoom.js
const fs = require('fs');
const path = require('path');

let pass = 0, fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('FAIL  ' + name); }
}

const root = path.resolve(__dirname, '..');
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
const css = read('apps/web/styles.css');
const app = read('apps/web/app.js');
const mw = read('apps/web/math-world.js');

function seg(src, from, len) {
  const i = src.indexOf(from);
  return i === -1 ? '' : src.slice(i, i + (len || 1500));
}

// ---------- 1) Arbitrary-angle rotation ----------
// World: rect carries an angle, rectRotate normalizes 0–359 and never moves
// width/length/area (behavior is checked in tools/smoke-math-world.js).
check('math-world: rect state has an angle field', mw.includes('rect: { perim: 20, w: 1, angle: 0 }'));
check('math-world: rectRotate intent exists with integer validation',
  mw.includes("if (type === 'rectRotate')") && mw.includes("reason: 'bad-number'"));
check('math-world: rectRotate normalizes with modulo', mw.includes('((deg % 360) + 360) % 360'));
check('math-world: create(seed) keeps the angle', mw.includes('seed.rect.angle'));
check('math-world: rect inspector lists the angle prop (0–359)',
  mw.includes("prop('angle', '角度', r.angle, 0, 359, 1, { type: 'rectRotate', field: 'angle' })"));
// App: inspector apply routes rectRotate into the world.
check('app: inspector apply handles rectRotate',
  app.includes("if (it.type === 'rectRotate') return worldPlayApply({ type: 'rectRotate', deg: v }, '转到 ' + v + '°');"));
// App: the pick-rect group is rotated around its centre; the handle sits at
// the rotated vertex (bvRectVertex), not at the unrotated one.
check('app: pick-rect group rotates by rect.angle around its centre',
  app.includes("transform=\"rotate(' + rDeg + ' ' + rc.x + ' ' + rc.y + ')"));
check('app: bvRectVertex computes the rotated vertex', app.includes('function bvRectVertex(rect, deg)'));
check('app: handle position uses the rotated vertex',
  app.includes('const rv = bvRectVertex(rect, rDeg);'));
// App: handle drag (pointerdown on the handle, live DOM-only transform while
// dragging, one rectRotate commit on release; <6px is a click, not a drag).
check('app: rotate-drag IIFE exists', app.includes('(function worldBenchRotateDrag()'));
check('app: rotate drag captures the pointer on the handle',
  seg(app, '(function worldBenchRotateDrag()', 4000).includes('setPointerCapture'));
check('app: rotate drag commits one rectRotate on pointerup',
  seg(app, '(function worldBenchRotateDrag()', 4000).includes("worldPlayApply({ type: 'rectRotate', deg: deg }, '转到 ' + deg + '°')"));
check('app: rotate drag ignores sub-6px movement (click, not drag)',
  seg(app, '(function worldBenchRotateDrag()', 4000).includes('Math.hypot(e.clientX - rot.x0, e.clientY - rot.y0) < 6'));
check('app: rotate drag normalizes the angle delta across ±180°',
  seg(app, '(function worldBenchRotateDrag()', 4000).includes('while (dth > Math.PI) dth -= 2 * Math.PI;'));
// App: the click that follows a handle drag is swallowed, not a 90° turn.
check('app: click after a handle drag is suppressed',
  app.includes('if (rectRotateDragged) { rectRotateDragged = false; return; }'));
// App: angle survives save/default/reset/normalize (old saves get angle 0).
check('app: labWorldNormalize fills a missing angle with 0',
  app.includes("if (typeof w.rect.angle !== 'number') w.rect.angle = 0;"));
check('app: defaults save the angle', app.includes('angle: w.rect.angle'));
check('app: defaults apply the angle', app.includes("ap({ type: 'rectRotate', deg: defs.rect.angle })"));
check('app: defaults reset restores the angle', app.includes("worldPlayApply({ type: 'rectRotate', deg:"));

// ---------- 2) Canvas zoom / pan ----------
// State + pure viewBox math: 520×260 base, viewBox 520/z × 260/z around (cx,cy).
check('app: zoom state (benchZoom 0.5–4, centre benchPanX/Y) exists',
  app.includes('var benchZoom = ') && app.includes('var benchPanX = ') && app.includes('var benchPanY = '));
check('app: benchZoomViewBox divides the base size by zoom',
  app.includes("function benchZoomViewBox(z, cx, cy) {\n  const w = 520 / z, h = 260 / z;"));
check('app: zoom is clamped to 50–400% at load and on button press',
  app.includes('Math.max(0.5, Math.min(4, benchViewSaved.zoom))') &&
  app.includes('benchZoom = Math.max(0.5, Math.min(4, benchZoom));'));
check('app: benchZoomApply writes the viewBox and the % label',
  app.includes("svg.setAttribute('viewBox', benchZoomViewBox(benchZoom, benchPanX, benchPanY));") &&
  app.includes("lab.textContent = Math.round(benchZoom * 100) + '%';"));
check('app: zoom/pan state is saved with the bench view',
  app.includes('zoom: benchZoom, cx: benchPanX, cy: benchPanY'));
// Buttons: − / % / ＋ / 复位 in the view-buttons row, handled in the delegation.
check('app: zoom buttons exist (zoom-out / zoom-in / zoom-reset + label)',
  app.includes('data-bench="zoom-out"') && app.includes('data-bench="zoom-in"') &&
  app.includes('data-bench="zoom-reset"') && app.includes('data-bench-zoom-label'));
check('app: zoom buttons step by 1.25x and snap near 100%',
  app.includes("benchZoom = op === 'zoom-in' ? benchZoom * 1.25 : benchZoom / 1.25;") &&
  app.includes('if (Math.abs(benchZoom - 1) < 0.05) benchZoom = 1;'));
check('app: zoom reset returns to 100% and the centre',
  app.includes("if (op === 'zoom-reset') { benchZoom = 1; benchPanX = 260; benchPanY = 130; }"));
// Hit-testing must use the live viewBox, not a fixed 520×260 scale.
check('app: benchSvgPoint converts client coords via the live viewBox',
  app.includes('function benchSvgPoint(clientX, clientY)') &&
  app.includes('svg.viewBox.baseVal') && app.includes('vb.width'));
check('app: bench drop targets use benchSvgPoint (zoom-aware)',
  (function () {
    // 台面画布分支（天平站分支在它前面，先返回——不能用全文件 indexOf 比顺序）。
    const i = app.indexOf('// 台面画布上的天平盘也是落点');
    const seg2 = i === -1 ? '' : app.slice(i, i + 900);
    return seg2.includes('const p = benchSvgPoint(x, y);') &&
      seg2.includes("if (p.x >= 46 && p.x <= 174 && p.y >= 136 && p.y <= 244) return 'balance.L';") &&
      seg2.includes("if (p.x >= 366 && p.x <= 494 && p.y >= 136 && p.y <= 244) return 'balance.R';") &&
      seg2.indexOf('((x - r2.left) / r2.width) * 520') === -1; // 固定 520×260 换算已删掉
  })());
// Pan: only when zoomed, only on empty canvas background, by SVG-coordinate deltas.
check('app: pan IIFE exists', app.includes('(function worldBenchPan()'));
check('app: pan only starts when zoomed past 100%',
  seg(app, '(function worldBenchPan()', 1500).includes('if (benchZoom <= 1) return;'));
check('app: pan ignores presses on apparatus and the handle',
  seg(app, '(function worldBenchPan()', 1500).includes("e.target.closest('[data-bench],[data-bench-rotate]')"));
check('app: pan saves the centre when the drag ends',
  seg(app, '(function worldBenchPan()', 1500).includes('if (moved) benchZoomSave();'));
check('app: pan tracks the pointer 1:1 from the press anchor (client coords, not SVG deltas)',
  seg(app, '(function worldBenchPan()', 2000).includes('benchPanX = pan.cx0 - (e.clientX - pan.x0) * (vb.width / r.width);') &&
  seg(app, '(function worldBenchPan()', 2000).indexOf('benchPanX -= (p.x - pan.px)') === -1);

// ---------- 3) P2 equation demo beam ----------
// Same 500ms labBeamAnim as the three lab beams; no direct transform attribute.
check('app: P2 renderBalance drives the beam through labBeamAnim',
  seg(app, 'function renderBalance()', 800).includes("labBeamAnim('p2', balTilt,"));
check('app: P2 renderBalance no longer sets the transform attribute',
  seg(app, 'function renderBalance()', 800).indexOf("beam.setAttribute('transform'") === -1);
check('app: P2 beam removes the stale transform attribute first',
  seg(app, 'function renderBalance()', 800).includes("beam.removeAttribute('transform')"));
check('css: #beamGroup has the same pivot rule as the lab beams',
  css.includes('#beamGroup { transform-box:view-box; transform-origin:160px 70px; }'));
// labBeamAnim must survive being called at load (renderBalance runs at 2699,
// before the `var labBeamAnimState = {}` line) without clobbering the state.
check('app: labBeamAnim guards an uninitialized state object',
  app.includes('if (!labBeamAnimState) labBeamAnimState = {};'));
check('app: labBeamAnimState declaration does not clobber load-time state',
  app.includes('var labBeamAnimState = labBeamAnimState || {};'));

// ---------- 4) Retest quirk ① (8e38f4c): the message says the canvas switched,
// so the canvas must actually switch. Toggle-on pins the preferred view to the
// apparatus's own view; toggle-off hands the choice back to the auto chain.
check('app: rect toggle pins the view to coord when put on',
  seg(app, "if (op === 'rect') {", 900).includes("benchPreferredView = 'coord';"));
check('app: line toggle pins the view to coord when put on',
  seg(app, "if (op === 'line') {", 900).includes("benchPreferredView = 'coord';"));
check('app: tenframe/datatable/spinner toggles pin their own views when put on',
  app.includes("benchPreferredView = op === 'tenframe' ? 'tenframe' : op === 'datatable' ? 'table' : 'spin';"));
check('app: taking an apparatus off hands the view back to the auto chain',
  (seg(app, "if (op === 'rect') {", 900).includes('else benchPreferredView = null;')) &&
  (seg(app, "if (op === 'line') {", 900).includes('else benchPreferredView = null;')) &&
  app.includes("else benchPreferredView = null;\n      worldPlayRender();\n      return;\n    }\n    if (op === 'pick-tenframe'"));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
