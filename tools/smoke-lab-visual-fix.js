// Visual-fix checks for the math lab (retest gaps, 2026-11-07).
// These verify code and structure only — the LOOK itself can only be
// verified in a real browser, never by this file.
// Run: node tools/smoke-lab-visual-fix.js
const fs = require('fs');
const path = require('path');

let pass = 0, fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('FAIL  ' + name); }
}

const root = path.resolve(__dirname, '..');
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
const html = read('apps/web/index.html');
const css = read('apps/web/styles.css');
const app = read('apps/web/app.js');
const app2 = read('apps/web/apparatus.js');
const mw = read('apps/web/math-world.js');

// 1) Part box is SVG pictures, not text buttons (retest: labPartIcons queried
// a dead id 'labPartBox' while the real box is 'worldBenchBox' — icons never ran)
check('part box: labPartIcons queries the real box id worldBenchBox',
  app.includes("getElementById('worldBenchBox')") && app.indexOf("getElementById('labPartBox')") === -1);
check('part box: no labPartBox anywhere in app.js',
  app.indexOf('labPartBox') === -1);

// 2) Bench apparatus are drawn shapes, not "x = 5" text
check('bench chips: benchChipsSvg + benchChipsTotal exist',
  app.includes('function benchChipsSvg(') && app.includes('function benchChipsTotal('));
check('bench chips: formula branch draws chips, no bare x = lines',
  (function () {
    const seg = app.slice(app.indexOf('function benchViewSvg('), app.indexOf('function worldBenchRender()'));
    return seg.includes('benchChipsSvg(items') && seg.indexOf("'x = '") === -1 && seg.indexOf('"x = "') === -1;
  })());
check('bench rect: rect on bench defaults to the coord view (rect only draws there)',
  app.includes("else if (!benchPreferredView && rectOn) canvasView = 'coord';"));
check('bench rect: putting rect/line/balance on returns to the auto view',
  app.includes("benchPreferredView = null; benchShowBalance = false; worldInspectSelect({ apparatus: 'rect' })") &&
  app.includes("benchPreferredView = null; benchShowBalance = false; worldInspectSelect({ apparatus: 'linefn' })") &&
  app.includes('benchShowBalance = true; benchPreferredView = null;'));

// 3) Balance draws on the bench
check('bench balance: benchShowBalance override + 天平 button',
  app.includes('var benchShowBalance = !(benchViewSaved && benchViewSaved.showBalance === false)') &&
  app.includes("if (balOn && benchShowBalance) canvasView = 'balance';") &&
  app.includes('data-view="balance">天平</button>'));
check('bench balance: balance branch draws the chips row on top',
  (function () {
    const seg = app.slice(app.indexOf('function benchViewSvg('), app.indexOf('function worldBenchRender()'));
    return seg.includes("} else if (view === 'balance') {") && seg.includes('benchChipsSvg(items, 10, 64, 40)');
  })());

// 4) Rotate handle on the bench canvas
check('rotate handle: coord branch draws a ⟳ handle above the selected rect',
  app.includes('data-bench-rotate="rect"'));
// 4) Rotate handle on the bench canvas — 第 3 批：SVG 上的 IIFE 一次性绑定在真机刷新后
//    不可靠，改走卡片上的委托（和所有台面按钮同一条路）；这里只认委托里有这条分支，
//    并且旧的 IIFE 已经删掉（不留两条路，否则一点就转两次、等于没转）。
check('rotate handle: card delegation wires the handle click to the rect swap',
  app.includes("closest('[data-bench-rotate]')") && app.includes("rectSet") &&
  app.indexOf('labBenchRotateBind') === -1);
check('rotate handle: putting rect/line/balance on auto-expands its station card',
  app.includes("labExpandStation('worldRectCard')") && app.includes("labExpandStation('worldBalCard')") &&
  app.includes("labExpandStation('worldFnCard')"));

// 5) Balance beam really tilts and really transitions
check('tilt scale: MathWorld tilts at least 6 deg when unbalanced (1/2 diff was 1.5 deg, invisible)',
  mw.includes('6 + Math.min(9,') && mw.includes('Math.sign(balDiffNum)'));
check('tilt scale: free-play and combo balances use the same minimum-visible scale',
  app.includes('6 + Math.min(9, Math.abs(labBalDiff) * 2)') &&
  app.includes('6 + Math.min(9, Math.abs(labWbDiff) * 2)'));
check('tilt transition: apparatus beam has no transform attribute left (it snapped + doubled the angle)',
  app2.indexOf("transform: 'rotate(' + tilt + ' 170 110)'") === -1 &&
  app2.indexOf("beam.setAttribute('transform'") === -1);
check('tilt transition: apparatus beam animates by rAF interpolation (balAnimateTo), not the detached-node reflow trick',
  app2.includes('function balAnimateTo(') && app2.includes('requestAnimationFrame') &&
  app2.includes("balBeamEl.style.transform = 'rotate(' + lastBalTilt + 'deg)'") &&
  app2.indexOf('void beam.getBoundingClientRect()') === -1 &&
  app2.indexOf("beam.style.transition = 'transform .35s ease'") === -1);
check('tilt transition: lab beams (combo + free-play) animate by rAF interpolation (labBeamAnim), 500ms',
  app.includes('function labBeamAnim(') && app.includes("labBeamAnim('combo', tilt") &&
  app.includes("labBeamAnim('free', tilt") && app.includes('/ 500)') &&
  app.indexOf("beam.style.transform = 'rotate(' + tilt + 'deg)'") === -1);
check('tilt transition: bench-canvas beam draws at the interpolated offset (beam ids on line/pans)',
  app.includes('worldBenchBeamLine') && app.includes('worldBenchPanL') && app.includes('worldBenchPanR') &&
  app.includes("labBeamAnim('bench',") && app.includes('benchBeamApply'));
check('tilt transition: CSS no longer pretends to transition the lab beams',
  (function () {
    const i = css.indexOf('#labBeamGroup, #labWbBeam');
    if (i === -1) return false;
    const seg = css.slice(i, css.indexOf('}', i));
    return seg.indexOf('transition') === -1 && seg.includes('transform-origin:160px 70px');
  })());

// 6) Pan hover glow is actually bright (old fill #451a03 on dark #0f172a made the pan darker)
check('pan glow: is-hot pan is bright amber, not dark brown',
  (function () {
    const i = css.indexOf('[data-bal-pan].is-hot');
    const seg = css.slice(i, i + 400);
    return seg.includes('fill:#fbbf24') && seg.indexOf('fill:#451a03') === -1;
  })());
check('pan glow: bench drags highlight the drop target while moving',
  app.includes('function benchDropHot(') && app.includes('benchDropHot(e.clientX, e.clientY)'));

// 7) Drag from the parts box lands on the bench canvas
check('bench drop: dragging onto the bench canvas puts the piece on the bench',
  app.includes("inside(benchView, e.clientX, e.clientY)"));
check('bench drop: bench-canvas balance pans are drop targets too',
  app.includes("getElementById('worldBenchView')") && app.includes("vx2 >= 46 && vx2 <= 174") &&
  app.includes("vx2 >= 366 && vx2 <= 494"));

// 8) Bench fills the main area at desktop width (was ~1100px centered in 1920px)
check('layout: lab breaks out of the 1120px wrap to 1600px',
  css.includes('#lab.section.wrap') && css.includes('max-width:1600px'));
check('layout: drop-hot outline style exists',
  css.includes('.bench-drop-hot') && css.includes('outline:3px dashed #f59e0b'));

// 9) Text folds away by default
check('folds: signals log, traces, tool stations, bench help start hidden',
  html.includes('id="worldDerivedOut" class="world-signals" aria-live="polite" hidden') &&
  html.includes('id="labTraceBody" hidden') &&
  html.includes('id="labToolsGrid" hidden') &&
  html.includes('id="labBenchHelp" class="lab-help" hidden'));
check('folds: labVisualFolds wires all four folds + top-bar help',
  app.includes('labVisualFolds') && app.includes("wireFold('worldSignalsFold', 'worldDerivedOut')") &&
  app.includes("wireFold('labTraceFold', 'labTraceBody')") &&
  app.includes("wireFold('labToolsFold', 'labToolsGrid')") &&
  app.includes("wireFold('labTopHelp', 'labBenchHelp')"));
check('folds: trace title shows the count',
  app.includes("title.textContent = '实验记录（' + labTraceLog.length + ' 条）'"));

// 10) Lab-local dark top bar
check('top bar: labTopBar + save/clear/help exist in HTML',
  html.includes('id="labTopBar"') && html.includes('id="labTopSave"') &&
  html.includes('id="labTopClear"') && html.includes('id="labTopHelp"'));
check('top bar: dark bar style',
  css.includes('.lab-topbar') && css.includes('background:#0b1220'));
check('top bar: save/clear wired to the bench actions',
  app.includes("labSaveBench();") && app.includes("labClearBench();"));

// 11) Clear bench is one shared action
check('clear bench: labClearBench exists and the clear op calls it',
  app.includes('function labClearBench()') && app.includes("if (op === 'clear') {\n      labClearBench();"));

// 12) Free-play balance state persists (retest: left 7 reverted to 5 on reload)
check('balance persist: free-play balance saves to math-lab-bal-v1 and restores it',
  app.includes("'math-lab-bal-v1'") && app.includes('labBalSaved') &&
  app.includes("lsSet('math-lab-bal-v1', JSON.stringify({ L: labBalL, R: labBalR }))"));

// 13) Bench view survives a refresh (retest: after refresh the 坐标系 button was gone,
// the rectangle + its handle unreachable even after re-placing it, while the status
// line still claimed the bench was on the coordinate grid)
check('bench view: view choice is saved to math-lab-benchview-v1 and restored on load',
  app.includes("'math-lab-benchview-v1'") &&
  app.includes("lsSet('math-lab-benchview-v1', JSON.stringify({ preferred: benchPreferredView, showBalance: benchShowBalance }))") &&
  app.includes("JSON.parse(lsGet('math-lab-benchview-v1')"));
check('bench view: placing the rectangle or the line actually leaves the balance view (the message promises 坐标系)',
  app.includes("benchPreferredView = null; benchShowBalance = false; worldInspectSelect({ apparatus: 'rect' })") &&
  app.includes("benchPreferredView = null; benchShowBalance = false; worldInspectSelect({ apparatus: 'linefn' })"));

// 14) Quick drags register (retest: two fast 1/6 drags did not register; a slow drag did)
check('quick drag: bench pointerup counts as a drag when the release point is far from the press point',
  app.includes('Math.hypot(e.clientX - d.x0, e.clientY - d.y0) >= 6'));
check('quick drag: drop targets have slack (station pans + dashed zones)',
  app2.includes('pointInRect(clientX, clientY, nodes[i], 10)') &&
  app2.includes("vx >= 20 && vx <= 140 && vy >= 76 && vy <= 194") &&
  app2.includes("vx >= 200 && vx <= 320 && vy >= 76 && vy <= 194"));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
