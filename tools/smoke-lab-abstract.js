// Batch-4 checks for the math lab (2026-11-07): concrete↔abstract one-click
// switch + one-click tidy, and the d9b93ef retest observations (a) and (b).
// These verify code and structure only — the LOOK and the feel of switching
// and tidying can only be verified in a real browser, never by this file.
// Run: node tools/smoke-lab-abstract.js
const fs = require('fs');
const path = require('path');

let pass = 0, fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('FAIL  ' + name); }
}

const root = path.resolve(__dirname, '..');
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
const app = read('apps/web/app.js');
const ap = read('apps/web/apparatus.js');

function seg(src, from, len) {
  const i = src.indexOf(from);
  return i === -1 ? '' : src.slice(i, i + (len || 1500));
}

// ---------- 1) Concrete↔abstract state ----------
// benchAbstract is a view-mode flag, not a view choice: it overlays the
// concrete view (benchPreferredView/benchShowBalance stay untouched) and is
// saved with the bench view so a refresh returns to the same look.
check('app: benchAbstract state exists and defaults to false',
  app.includes('var benchAbstract = !!(benchViewSaved && benchViewSaved.abstract === true);'));
check('app: abstract mode is saved with the bench view',
  app.includes('abstract: benchAbstract }'));
check('app: an old save with preferred formula migrates into abstract mode',
  app.includes("if (benchPreferredView === 'formula') { benchPreferredView = null; benchAbstract = true; }"));

// ---------- 2) The formula view writes the whole bench as equations ----------
// The old formula branch only wrote "合计：…" + the line equation; the new
// one writes one equation per thing on the bench (numbers, line, balance,
// rectangle, ten-frame, datatable, spinner) and nothing that is not on it.
check('app: formula view writes loose numbers as an addition',
  seg(app, "if (items.length) {\n        formulaLine(", 400).includes("join(' + ') + ' = ' + benchChipsTotal(items)"));
check('app: formula view writes the balance as an equation with ＝/＞/＜',
  app.includes("formulaLine('天平：左盘 ' + bal.Lstr + (bal.equal ? ' ＝ ' : (bal.leftHeavy ? ' ＞ ' : ' ＜ ')) + '右盘 ' + bal.Rstr);"));
check('app: formula view writes the rectangle as w x h = area (perimeter)',
  app.includes("formulaLine('长方形：' + rect.w + ' × ' + rect.h + ' ＝ ' + rect.area + '（周长 ' + rect.perim + '）');"));
check('app: formula view writes the ten-frame as an addition',
  app.includes("formulaLine('十格阵：' + tf.A + ' + ' + tf.B + ' = ' + tf.sum);"));
check('app: formula view writes the datatable rows and total',
  app.includes("formulaLine('数据表：' + dt.rows.map(function (r) { return r.label + ' ' + r.n + ' 次'; }).join('，') + '，合计 ' + dt.total + ' 次');"));
check('app: formula view writes the spinner counts and total',
  app.includes("formulaLine('转盘：' + sp.counts.map(function (c, i) { return MathWorld.SPINNER_LABELS[i] + ' ' + c + ' 次'; }).join('，') + '，共 ' + sp.total + ' 次');"));
check('app: formula view still draws the number cards as clickable picks',
  seg(app, "} else {\n    // 算式视图（抽象", 1200).includes('s += benchChipsSvg(items, 24, 72, 48);'));
// The formula view must only write what is ON the bench: balance and the
// three new apparatus are gated at the call site (derived always has them).
check('app: balance is only passed to the canvas when it is on the bench',
  app.includes("(w2 && balOn) ? MathWorld.derived(w2).balance : null"));
check('app: ten-frame/datatable/spinner are only passed when on the bench',
  app.includes('{ tenframe: tfOn ? d2.tenframe : null, datatable: dtOn ? d2.datatable : null, spinner: spOn ? d2.spinner : null }'));
// Abstract mode forces the formula view on top of the auto chain without
// touching the concrete view underneath.
check('app: abstract mode overrides the canvas view to formula',
  app.includes("if (benchAbstract) canvasView = 'formula';"));

// ---------- 3) The toggle + tidy buttons and their delegation ----------
// One obvious toggle (not buried in the view list) + one tidy button, both
// in the view-buttons row next to the zoom controls.
check('app: view row has the abstract toggle (看算式/看图形) and the tidy button',
  app.includes('data-bench="abs-toggle"') && app.includes('看算式') && app.includes('看图形') &&
  app.includes('data-bench="tidy"') && app.includes('一键整理'));
check('app: abs-toggle flips benchAbstract and re-renders (nothing else changes)',
  seg(app, "if (op === 'abs-toggle') {", 400).includes('benchAbstract = !benchAbstract;') &&
  seg(app, "if (op === 'abs-toggle') {", 400).includes('worldBenchRender();'));
check('app: tidy button calls benchTidy',
  seg(app, "if (op === 'tidy') {", 200).includes('benchTidy();'));
// The 'formula' view button enters abstract mode; any concrete view button
// leaves it. 'formula' is never stored as the preferred view (otherwise the
// toggle-back lands in the formula view again).
check('app: formula view button enters abstract mode without storing it as preferred',
  seg(app, "if (op === 'view') {", 1000).includes("else if (v === 'formula') { benchShowBalance = false; benchAbstract = true; }"));
check('app: concrete view buttons leave abstract mode',
  seg(app, "if (op === 'view') {", 1000).includes("else { benchShowBalance = false; benchPreferredView = v; benchAbstract = false; }"));
// Putting an apparatus on the bench leaves abstract mode (the toast says the
// canvas switched to its view, so the canvas must actually be concrete).
check('app: putting apparatus on the bench leaves abstract mode (balance/rect/line/tenframe/datatable/spinner)',
  app.includes("if (labWorld && labWorld.benchBalance) { benchAbstract = false;") &&
  app.includes("if (labWorld && labWorld.benchRect) { benchAbstract = false;") &&
  app.includes("if (labWorld && labWorld.benchLine) { benchAbstract = false;") &&
  app.includes("if (flag) { benchAbstract = false;"));

// ---------- 4) Tidy: auto view + fit the content ----------
// benchTidy only moves the VIEW (auto view + zoom/centre from the content
// box); it never touches values, apparatus or order.
check('app: benchTidy returns to the auto view and fits the content box',
  seg(app, 'function benchTidy()', 900).includes('benchAbstract = false;') &&
  seg(app, 'function benchTidy()', 900).includes('benchPreferredView = null;') &&
  seg(app, 'function benchTidy()', 900).includes('const fit = benchTidyFit(box);') &&
  seg(app, 'function benchTidy()', 900).includes('benchZoom = fit.zoom; benchPanX = fit.cx; benchPanY = fit.cy;'));
check('app: tidy content box is the canvas union the rotated rectangle (corners + handle)',
  app.includes('function benchContentBox(rect)') &&
  app.includes('[[0, 0], [rect.w, 0], [0, rect.h], [rect.w, rect.h]]') &&
  app.includes('const rv = bvRectVertex(rect, rect.angle || 0);'));
check('app: tidy fit only zooms out, never past 100%, viewBox stays 2:1',
  app.includes('const z = Math.max(0.5, Math.min(1, 520 / bw, 260 / bh));'));
// The pan clamp must work in both regimes: viewBox smaller than the canvas
// (centre inside) and viewBox larger (centre contains the canvas). The old
// one-line clamp pinned the centre to w/2 whenever the viewBox was larger,
// which cut the top off the tidy fit.
check('app: zoom clamp takes the min/max of both bounds (both regimes)',
  app.includes('const loX = Math.min(w / 2, 520 - w / 2), hiX = Math.max(w / 2, 520 - w / 2);') &&
  app.includes('const loY = Math.min(h / 2, 260 - h / 2), hiY = Math.max(h / 2, 260 - h / 2);') &&
  app.indexOf('benchPanX = Math.max(w / 2, Math.min(520 - w / 2, benchPanX));') === -1);

// ---------- 5) Retest observation (a): pan weights are not draggable — by design ----------
// The d9b93ef retest reported that weights sitting on the station pans cannot
// be dragged. That was never a feature: data-drag-weight has only ever been
// on the shelf chips (since MathWorld 0.8, c605db7) and the pan weights are
// drawn as plain rects. The station adds weights from the shelf / drop boxes
// and removes them with 清空重来; the combo bench adds with +1/−1 buttons and
// removes by click. Free dragging lives on the bench. Do not "fix" this by
// giving pan weights a drag attribute — dragging one off a pan has no intent.
check('apparatus: pan weights are drawn without a drag attribute (by design, see comment)',
  ap.includes('盘上画出来的砝码是死的') && ap.includes('没有 data-drag-weight') &&
  seg(ap, 'function drawPan(', 2600).indexOf("'data-drag-weight'") === -1);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
