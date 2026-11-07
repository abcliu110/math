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

console.log('\nbench-views: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
