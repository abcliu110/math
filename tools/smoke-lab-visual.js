// Visual overhaul checks for the math lab (dark bench, NB-style).
// These verify code and structure only — the LOOK itself can only be
// verified in a real browser, never by this file.
// Run: node tools/smoke-lab-visual.js
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

// 1) Dark bench room (NB: black canvas, dark top bar)
check('dark room: #lab .world-layout is near-black (#0b1220)',
  css.includes('#lab .world-layout') && css.includes('background:#0b1220'));
check('dark room: bench canvas has a faint grid',
  css.includes('#worldBenchCard .bench-view') && css.includes('background-size:28px 28px'));
check('dark room: apparatus SVGs paint on dark, not white',
  css.includes('#labMwWorkbench .apparatus-svg') && css.includes('background:#0f172a'));
check('dark room: bench view paints grids dark (no #e2e8f0 grid lines left in benchViewSvg)',
  (function () {
    const seg = app.slice(app.indexOf('function benchViewSvg('), app.indexOf('function worldBenchRender()'));
    return seg.indexOf('"#e2e8f0"') === -1 && seg.indexOf('"#64748b"') === -1 && seg.indexOf('"#334155"') === -1;
  })());
check('dark room: apparatus.js has no light track/grid fills left',
  app2.indexOf("fill: '#f8fafc', stroke: '#e2e8f0'") === -1 && app2.indexOf("fill: '#fff', rx: 10") === -1 && app2.indexOf("stroke: '#e2e8f0'") === -1);

// 2) Stations fold away; the bench fills the main area
check('stations: all 7 apparatus cards start collapsed',
  (html.match(/class="demo-card collapsed" id="world/g) || []).length === 7);
check('stations: every apparatus card has a fold button',
  (html.match(/class="station-fold"/g) || []).length >= 7);
check('stations: question picker has a fold button + current-question slot',
  html.includes('id="labChooseFold"') && html.includes('id="labChooseCurrent"'));
check('stations: entering a question collapses the picker and names it',
  app.includes('labCollapseChoose()') && app.includes("labSetChooseCurrent('当前：' + q.title)"));
check('stations: entering a question auto-expands its station',
  app.includes('if (stationId) labExpandStation(stationId);'));
check('stations: focus list includes the rect and dice stations',
  app.includes("'worldRectCard', 'worldDiceCard'"));
check('stations: more apparatus (tray + combination benches) starts folded',
  html.includes('id="labMoreFold"') && html.includes('id="labWorkbench" hidden'));
check('stations: bench spans the full row in a one-column room',
  css.includes('#labMwWorkbench #worldBenchCard') && css.includes('grid-column:1 / -1'));

// 3) Equipment as pictures, not text chips
check('part box: every chip gets a drawn SVG icon (labPartIcons)',
  app.includes('labPartIcons') && app.includes('part-ico') &&
  ['numIcon', 'fracIcon', 'weightIcon', 'rectIcon', 'lineIcon', 'balIcon'].every(function (n) { return app.includes(n); }));
check('part box: icons are a 2-column picture grid',
  css.includes('#labMwWorkbench .part-group') && css.includes('grid-template-columns:1fr 1fr'));

// 4) NB-style selection: grey highlight + rotate handle + mini toolbar
check('selection: selected card gets a grey highlight box (not orange)',
  css.includes('#labMwWorkbench .demo-card.is-selected') && css.includes('outline:3px solid #e2e8f0'));
check('selection: rect card has a round rotate handle on top',
  html.includes('class="rot-handle"') && html.includes('data-world="rect-rotate"') &&
  css.includes('#worldRectCard.is-selected .rot-handle'));
check('selection: rotate handle runs the same op as the inspector (rectSet, swap w/h)',
  app.includes("op === 'rect-rotate'") && app.includes('w: w.rect.perim / 2 - w.rect.w'));
check('selection: picked bench chip gets a vertical mini toolbar (settings / remove)',
  app.includes('bench-tools') && app.includes("data-bench=\"sel-inspect\"") && app.includes("data-bench=\"sel-remove\""));

// 5) Pans are the drop targets (2026-11-07 retest defect)
check('drop: bench drag checks the balance pans by geometry first',
  (function () {
    const seg = app.slice(app.indexOf('function benchDropTargetAt'), app.indexOf('function benchPlaceOn'));
    return seg.indexOf("getElementById('worldBalSvg')") >= 0 &&
      seg.indexOf("return 'balance.L'") >= 0 && seg.indexOf("return 'balance.R'") >= 0 &&
      seg.indexOf("getElementById('worldBalSvg')") < seg.indexOf("querySelectorAll('[data-drop]')");
  })());
check('drop: apparatus drag checks the pans by geometry first (panHitAt)',
  app2.includes('function panHitAt') && app2.includes("return { el: svg, attr: 'data-bal-pan', val: side };"));
check('drop: pan hit boxes match the drawn pans (viewBox 340x250, L x24-136, R x204-316, y80-190)',
  (function () {
    const m = app2.match(/vx >= (\d+) && vx <= (\d+) && vy >= (\d+) && vy <= (\d+)\) return 'L'/);
    const n = app2.match(/vx >= (\d+) && vx <= (\d+) && vy >= (\d+) && vy <= (\d+)\) return 'R'/);
    return !!m && !!n && m[1] === '24' && m[2] === '136' && m[3] === '80' && m[4] === '190' &&
      n[1] === '204' && n[2] === '316' && n[3] === '80' && n[4] === '190';
  })());
check('drop: the old "anywhere in the balance SVG counts as a pan" fallback is gone',
  app2.indexOf("val: clientX < mid ? 'L' : 'R'") === -1);
check('drop: dragging over a pan lights the pan itself (is-hot)',
  app2.includes("pan.classList.add('is-hot')") && css.includes("[data-bal-pan].is-hot ellipse"));
check('drop: ghost is bigger and bolder than before',
  css.includes('#worldBenchGhost { font-size:16px') && css.includes('.apparatus-ghost { font-size:16px'));

// 6) Balance beam tilts smoothly (no more jump)
check('tilt: beam transition animates from the previous tilt via rAF',
  app2.includes('lastBalTilt') && app2.includes('requestAnimationFrame') &&
  app2.includes("beam.style.transform = 'rotate(' + tilt + 'deg)'"));

// 7) Minimal text: signals are compact chips, not a block of text
check('signals: worldDerivedOut is a chip strip, not a <pre> of lines',
  html.includes('class="world-signals"') && html.indexOf('<pre id="worldDerivedOut"') === -1);
check('signals: render writes world-signal chips with ok/warn/error levels',
  app.includes("class=\"world-signal ' + (s.level || 'info') + '\"") &&
  css.includes('.world-signal.ok') && css.includes('.world-signal.warn') && css.includes('.world-signal.error'));
check('signals: no debug internals leak into the student view',
  (function () {
    const seg = app.slice(app.indexOf('const sigBox = document.getElementById'), app.indexOf('worldInspectorRender();'));
    return seg.indexOf('goalMet') === -1;
  })());

// 8) Rect shared state (retest question): ONE rect in the world, by design —
// emptyWorld holds it once; the q-maxarea seed only sets its starting value.
check('rect: the world holds exactly one rectangle (bench rect == maxarea station rect)',
  (mw.match(/rect: \{ perim: 20, w: 1 \}/g) || []).length === 2 &&
  mw.includes('if (seed.rect) {') && !/rect2|maxareaRect|secondRect/.test(mw));

console.log(fail === 0 ? ('smoke-lab-visual OK: ' + pass + '/' + pass) : ('smoke-lab-visual FAILED: ' + pass + ' passed, ' + fail + ' failed'));
process.exit(fail === 0 ? 0 : 1);
