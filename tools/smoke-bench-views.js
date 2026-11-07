// Tests for apps/web/bench-views.js (view registry and choice rules, no DOM).
// Run: node tools/smoke-bench-views.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let pass = 0, fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('FAIL  ' + name); }
}

const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'apps/web/bench-views.js'), 'utf8');
const sandbox = { console: console, Math: Math, Object: Object, Array: Array };
vm.createContext(sandbox);
vm.runInContext(src, sandbox, { filename: 'bench-views.js' });
const BV = sandbox.BenchViews;
check('BenchViews loaded', !!BV && typeof BV.chooseView === 'function');

const NUM = { kind: 'num' }, FRAC = { kind: 'frac' }, LINE = { kind: 'line' };

check('empty bench shows the formula view', BV.chooseView([]).view === 'formula');
check('a line alone shows the coordinate system', BV.chooseView([LINE]).view === 'coord');
check('a number alone shows the number line', BV.chooseView([NUM]).view === 'numline');
check('a fraction alone shows fraction bars', BV.chooseView([FRAC]).view === 'fracbar');

check('a line plus a number shows the coordinate system (the number sits on x)',
  BV.chooseView([LINE, NUM]).view === 'coord');
check('a number plus a line also shows the coordinate system',
  BV.chooseView([NUM, LINE]).view === 'coord');
check('a line plus a fraction shows the coordinate system',
  BV.chooseView([LINE, FRAC]).view === 'coord');
check('two numbers and a fraction share the number line', BV.chooseView([NUM, NUM, FRAC]).view === 'numline');

check('a student can pick a shared view explicitly', BV.chooseView([NUM, FRAC], 'fracbar').view === 'fracbar');
check('a student cannot pick a view the objects do not share',
  BV.chooseView([LINE], 'fracbar').view === 'coord');
check('the result names the view label', BV.chooseView([LINE]).label === '坐标系');
check('the result lists every shared view', BV.chooseView([NUM, FRAC]).views.indexOf('numline') >= 0);

const objs = BV.benchObjects([{ id: 'a', str: '1/2', q: { n: 1, d: 2 } }, { id: 'b', str: '3', q: { n: 3, d: 1 } }], true);
check('benchObjects: a fraction is frac, a whole number is num, the line is line',
  objs[0].kind === 'frac' && objs[1].kind === 'num' && objs[2].kind === 'line');
check('benchObjects: no line when it is not on the bench', BV.benchObjects([], false).length === 0);
check('a balance alone shows the balance view', BV.chooseView([{ kind: 'balance' }]).view === 'balance');
check('a balance plus a number falls back to the formula view (they share no picture)',
  BV.chooseView([{ kind: 'balance' }, NUM]).view === 'formula');
check('benchObjects adds the balance when it is on the bench',
  BV.benchObjects([], false, true)[0].kind === 'balance');

const dia = BV.chooseView(BV.benchObjects([{ id: 'a', str: '1/2', q: { n: 1, d: 2 } }], true));
check('a fraction on the bench with the line shows the coordinate system', dia.view === 'coord');

// v0.9: the rectangle is a 2D-grid object; fractions can sit on the number line;
// the bench shows exactly one coordinate system at a time.
const RECT = { kind: 'rect' };
check('a rectangle alone shows the coordinate system (2D grid)', BV.chooseView([RECT]).view === 'coord');
check('a rectangle plus a number shows the coordinate system', BV.chooseView([RECT, NUM]).view === 'coord');
check('a rectangle plus a line shows the coordinate system', BV.chooseView([RECT, LINE]).view === 'coord');
check('a fraction can go on the number line', BV.chooseView([FRAC], 'numline').view === 'numline');
check('benchObjects adds the rectangle when it is on the bench',
  BV.benchObjects([], false, false, true)[0].kind === 'rect');
check('chooseView always returns exactly one view', typeof BV.chooseView([NUM, FRAC, LINE]).view === 'string');

// 2026-11-07 复测：台上有数 + 长方形 + 天平时，视图按钮是交集（只剩算式），
// 刷新后坐标系按钮消失、长方形够不着。按钮列表改成并集：任一物体能画的视图都能点。
const BAL = { kind: 'balance' };
check('view buttons are the union, not the intersection: num + rect + balance still offers 坐标系',
  BV.chooseView([NUM, RECT, BAL]).views.indexOf('coord') >= 0);
check('view buttons: num + rect + balance offers every view any of them can draw',
  (function () {
    const vs = BV.chooseView([NUM, RECT, BAL]).views;
    return vs.indexOf('numline') >= 0 && vs.indexOf('coord') >= 0 && vs.indexOf('fracbar') >= 0 && vs.indexOf('formula') >= 0;
  })());
check('a student can pick 坐标系 when num + rect + balance are on the bench (it is in the union)',
  BV.chooseView([NUM, RECT, BAL], 'coord').view === 'coord');
check('a student cannot pick a view no object on the bench can draw',
  BV.chooseView([RECT], 'numline').view === 'coord');
check('balance has its own button: the union leaves balance out (no duplicate 天平 button)',
  BV.chooseView([BAL]).views.indexOf('balance') === -1 && BV.chooseView([BAL]).view === 'balance');

console.log('\nbench-views: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
