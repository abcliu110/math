// Smoke tests for apps/web/anims-band-4-6.js (5.3 / 6.9 / 6.10, 11 anims).
// Run: node tools/smoke-anims-band-4-6.js
// Minimal DOM stub (same shape as tools/smoke.js); render runs in a vm with
// stubbed app.js helpers (makeTiers / wireDiscovery / markTried) so the band
// file stays loadable before app.js. Every check must fail cleanly on the
// pre-change code (empty band skeleton): missing keys fail the registration
// checks instead of crashing the file.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let pass = 0, fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('FAIL  ' + name); }
}

const root = path.resolve(__dirname, '..');
const bandSrc = fs.readFileSync(path.join(root, 'apps/web/anims-band-4-6.js'), 'utf8');

// ---------- minimal DOM stub ----------
const registry = [];
const byId = {};
function makeEl(tag) {
  const el = {
    tagName: (tag || 'div').toUpperCase(),
    children: [], dataset: {}, style: {}, hidden: false, _handlers: {},
    className: '', textContent: '', innerHTML: '', value: '', parentNode: null,
    classList: { _s: new Set(),
      add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); },
      toggle(c, f) { if (f === undefined) f = !this._s.has(c); if (f) this._s.add(c); else this._s.delete(c); return f; },
      contains(c) { return this._s.has(c); } },
    setAttribute(k, v) { this['attr:' + k] = String(v); },
    getAttribute(k) { return this['attr:' + k]; },
    removeAttribute(k) { delete this['attr:' + k]; },
    hasAttribute(k) { return this['attr:' + k] !== undefined; },
    addEventListener(t, fn) { (this._handlers[t] = this._handlers[t] || []).push(fn); },
    appendChild(c) { this.children.push(c); c.parentNode = this; return c; },
    removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); c.parentNode = null; return c; },
    get firstChild() { return this.children[0] || null; },
    querySelector() { return makeEl('div'); },
    querySelectorAll() { return []; },
  };
  registry.push(el);
  return el;
}
const documentStub = {
  getElementById(id) { if (!byId[id]) byId[id] = makeEl('div'); return byId[id]; },
  createElement(tag) { return makeEl(tag); },
  createElementNS(ns, tag) { return makeEl(tag); },
  querySelector() { return makeEl('div'); },
  querySelectorAll() { return []; },
  body: makeEl('body'),
  addEventListener() {},
};
const windowStub = { scrollTo() {}, setTimeout, addEventListener() {}, document: documentStub };

// ---------- stubbed app.js helpers (typeof-guarded in the band file) ----------
const tiersDone = {};   // key -> [levelIdx...]
const tiersWired = {};  // key -> labels
const discoveryWired = {}; // key -> { inputId, btnId, outId }
const triedKeys = [];
function makeTiersStub(el, labels, persistKey) {
  tiersWired[persistKey] = labels;
  return {
    done(i) { (tiersDone[persistKey] = tiersDone[persistKey] || []).push(i); },
    set() {},
  };
}
function wireDiscoveryStub(demoKey, inputId, btnId, outId) {
  discoveryWired[demoKey] = { inputId, btnId, outId };
  documentStub.getElementById(inputId);
  documentStub.getElementById(outId);
  const btn = documentStub.getElementById(btnId);
  btn.addEventListener('click', function () {
    const input = documentStub.getElementById(inputId);
    const out = documentStub.getElementById(outId);
    out.textContent = '记下来了：' + (input.value || '');
  });
}
function markTriedStub(key) { if (triedKeys.indexOf(key) < 0) triedKeys.push(key); }

const sandbox = {
  document: documentStub, window: windowStub, console, setTimeout,
  Math, JSON, Object, Array, String, Number, parseInt, parseFloat, isNaN,
  makeTiers: makeTiersStub, wireDiscovery: wireDiscoveryStub, markTried: markTriedStub,
};
vm.createContext(sandbox);
try {
  vm.runInContext(fs.readFileSync(path.join(root, 'apps/web/anims-registry.js'), 'utf8'), sandbox, { filename: 'anims-registry.js' });
  vm.runInContext(bandSrc, sandbox, { filename: 'anims-band-4-6.js' });
  console.log('LOAD OK');
} catch (e) { console.log('LOAD FAILED: ' + e.message); process.exit(1); }

const R = sandbox.ANIM_REGISTRY || {};
function click(id) {
  const el = byId[id];
  if (!el) return false;
  (el._handlers.click || []).forEach(function (f) { f({ target: el }); });
  return true;
}
function fire(id, type) {
  const el = byId[id];
  if (!el) return false;
  (el._handlers[type] || []).forEach(function (f) { f({ target: el }); });
  return true;
}
function text(id) { return (byId[id] && byId[id].textContent) || ''; }
function html(id) { return (byId[id] && byId[id].innerHTML) || ''; }
function setVal(id, v) { if (byId[id]) byId[id].value = v; }

// ---------- expected table ----------
const EXPECTED = {
  'm53-scale': { grade: 5, kind: '模拟', points: ['5.3'], title: '两数同乘，商不动' },
  'm53-numline': { grade: 5, kind: '模拟', points: ['5.3'], title: '数轴分一分' },
  'm53-remainder': { grade: 5, kind: '实验', points: ['5.3'], title: '竖式余数追踪' },
  'm69-pattern': { grade: 6, kind: '实验', points: ['6.9'], title: '数列规律逼出负负得正' },
  'm69-flip': { grade: 6, kind: '模拟', points: ['6.9'], title: '数轴翻面' },
  'm69-distrib': { grade: 6, kind: '实验', points: ['6.9'], title: '分配律证明负负得正' },
  'm69-debt': { grade: 6, kind: '实验', points: ['6.9'], title: '拿走欠债就是多钱' },
  'm610-base': { grade: 6, kind: '模拟', points: ['6.10'], title: '百分条先标底数' },
  'm610-discount': { grade: 6, kind: '模拟', points: ['6.10'], title: '折扣是付标价的百分之几' },
  'm610-interest': { grade: 6, kind: '模拟', points: ['6.10'], title: '利息一年一份' },
  'm610-cheng': { grade: 6, kind: '演示', points: ['6.10'], title: '成数就是十分之几' },
};
const KEYS = Object.keys(EXPECTED);

// ---------- 0. source hygiene ----------
check('band file has no </script>', bandSrc.indexOf('</script>') < 0);
check('band file has no template literals', bandSrc.indexOf('`') < 0);
check('band file: no { or } inside string literals', (function () {
  let inS = null, esc = false;
  for (let i = 0; i < bandSrc.length; i++) {
    const c = bandSrc[i];
    if (inS) {
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === inS) { inS = null; continue; }
      if (c === '{' || c === '}') return false;
    } else if (c === "'" || c === '"') { inS = c; }
  }
  return inS === null;
})());
check('band file top level only calls registerAnim (no app.js identifiers)',
  bandSrc.indexOf('METHOD_DEMOS') < 0 && bandSrc.indexOf('animsForPoint') < 0 &&
  bandSrc.indexOf('NAV_DEFS') < 0);

// ---------- 1. registration ----------
check('11 anims registered', KEYS.every(function (k) { return !!R[k]; }));
KEYS.forEach(function (k) {
  const a = R[k] || {};
  const e = EXPECTED[k];
  check(k + ' fields (grade/kind/points/title)',
    a.grade === e.grade && a.kind === e.kind &&
    JSON.stringify(a.points) === JSON.stringify(e.points) && a.title === e.title &&
    typeof a.render === 'function');
});
check('keys are bare (no demo- prefix, lowercase-hyphen)',
  KEYS.every(function (k) { return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(k); }));

// ---------- 2. points really exist in the grade content files ----------
const g5 = fs.readFileSync(path.join(root, 'content/grades/grade-5.js'), 'utf8');
const g6 = fs.readFileSync(path.join(root, 'content/grades/grade-6.js'), 'utf8');
check('point 5.3 exists in grade-5.js', g5.indexOf('"5.3"') >= 0);
check('point 6.9 exists in grade-6.js', g6.indexOf('"6.9"') >= 0);
check('point 6.10 exists in grade-6.js', g6.indexOf('"6.10"') >= 0);

// ---------- 3. render runs + guess/play/say wiring ----------
KEYS.forEach(function (k) {
  const el = makeEl('div');
  let threw = null;
  try { R[k].render(el); } catch (e) { threw = e; }
  check(k + ' render runs without throwing', threw === null);
  check(k + ' render shows title + guess + discovery',
    el.innerHTML.indexOf(EXPECTED[k].title) >= 0 &&
    el.innerHTML.indexOf('先猜') >= 0 && el.innerHTML.indexOf('你的发现') >= 0);
  check(k + ' tiers wired (3 levels)', Array.isArray(tiersWired[k]) && tiersWired[k].length === 3);
  check(k + ' discovery wired', !!discoveryWired[k] &&
    discoveryWired[k].inputId === k + '-find' && discoveryWired[k].btnId === k + '-find-save');
});

// ---------- 4. per-anim interaction ----------
click('m53-scale-guess-same');
click('m53-scale-m10');
check('m53-scale: ×10 leaves quotient 3', text('m53-scale-msg').indexOf('商还是 3') >= 0);
click('m53-scale-only-a');
check('m53-scale: only-a counterexample changes quotient 3 -> 30',
  text('m53-scale-msg').indexOf('商从 3 变成 30') >= 0);
click('m53-scale-level-1');
check('m53-scale: level 1 is 1.2÷0.3 = 4', text('m53-scale-q-tx').indexOf('= 4') >= 0);

click('m53-numline-guess-03');
click('m53-numline-split');
check('m53-numline: 0.6÷2 gives 0.3 per segment',
  text('m53-numline-msg').indexOf('每段都是 0.3') >= 0 &&
  html('m53-numline-svg').indexOf('0.3') >= 0);
click('m53-numline-level-2');
click('m53-numline-guess-03');
click('m53-numline-split');
check('m53-numline: 1.2÷4 also 0.3 per segment',
  text('m53-numline-msg').indexOf('每段都是 0.3') >= 0);

click('m53-remainder-guess-cycle');
click('m53-remainder-next');
click('m53-remainder-next');
check('m53-remainder: 1÷3 repeats remainder, cycle is 3',
  text('m53-remainder-msg').indexOf('循环节是 3') >= 0);
click('m53-remainder-level-2');
click('m53-remainder-guess-cycle');
click('m53-remainder-next');
click('m53-remainder-next');
click('m53-remainder-next');
check('m53-remainder: 1÷6 cycle is 6 (from 2nd digit)',
  text('m53-remainder-msg').indexOf('循环节是 6') >= 0);

click('m69-pattern-guess-plus');
for (let i = 0; i < 5; i++) click('m69-pattern-next');
check('m69-pattern: (−1)×(−2) = +2 by +2 steps',
  text('m69-pattern-msg').indexOf('(−1)×(−2) = +2') >= 0);
click('m69-pattern-level-2');
click('m69-pattern-guess-plus');
for (let i = 0; i < 5; i++) click('m69-pattern-next');
check('m69-pattern: (−1)×(−5) = +5',
  text('m69-pattern-msg').indexOf('(−1)×(−5) = +5') >= 0);

click('m69-flip-guess-neg');
click('m69-flip-flip');
check('m69-flip: 3 × (−1) = −3', text('m69-flip-msg').indexOf('= −3') >= 0);
click('m69-flip-level-2');
click('m69-flip-guess-pos');
click('m69-flip-flip');
click('m69-flip-flip');
click('m69-flip-times3');
check('m69-flip: (−2)×(−3) = +6 after two flips',
  text('m69-flip-msg').indexOf('(−2)×(−3) = +6') >= 0);

click('m69-distrib-guess-plus');
for (let i = 0; i < 5; i++) click('m69-distrib-next');
check('m69-distrib: (−1)×(−1) = 1 proved',
  text('m69-distrib-msg').indexOf('（−1）×（−1） = +1') >= 0);

click('m69-debt-scene-add');
check('m69-debt: addition scene (−2)+(−3) = −5',
  text('m69-debt-scene-tx').indexOf('(−2) + (−3) = −5') >= 0);
click('m69-debt-scene-mul');
click('m69-debt-calc');
check('m69-debt: removing 2 debts of 3 gives +6',
  text('m69-debt-msg').indexOf('(−2) × (−3) = +6') >= 0);
click('m69-debt-level-2');
click('m69-debt-guess-mul');
check('m69-debt: challenge picks multiplication for +6',
  text('m69-debt-msg').indexOf('对了') >= 0);

click('m610-base-guess-0');
click('m610-base-show');
check('m610-base: base of discount is the 200 price',
  text('m610-base-msg').indexOf('底数找对了') >= 0 &&
  text('m610-base-calc-tx').indexOf('200 × 20% = 40') >= 0);
click('m610-base-level-1');
click('m610-base-guess-0');
click('m610-base-show');
check('m610-base: tax base is the 500 price, tax 50',
  text('m610-base-calc-tx').indexOf('500 × 10% = 50') >= 0);

click('m610-discount-guess-80');
click('m610-discount-calc');
check('m610-discount: 100 at 80% costs 80, saves 20',
  text('m610-discount-calc-tx').indexOf('100 × 80% = 80') >= 0 &&
  text('m610-discount-msg').indexOf('要付 80 元') >= 0);
click('m610-discount-level-1');
click('m610-discount-guess-80');
click('m610-discount-calc');
check('m610-discount: 250 at 75% costs 187.5',
  text('m610-discount-calc-tx').indexOf('250 × 75% = 187.5') >= 0);

click('m610-interest-guess-double');
click('m610-interest-check');
check('m610-interest: 1000 at 3% for 1 year = 30',
  text('m610-interest-msg').indexOf('= 30 元') >= 0);
click('m610-interest-p-plus');
check('m610-interest: principal + button raises 1000 -> 1500',
  text('m610-interest-p-tx').indexOf('1500') >= 0);
click('m610-interest-p-minus');
check('m610-interest: principal − button brings it back to 1000',
  text('m610-interest-p-tx').indexOf('1000') >= 0);
click('m610-interest-level-1');
click('m610-interest-guess-double');
click('m610-interest-check');
check('m610-interest: 2000 at 4% for 2 years = 160',
  text('m610-interest-msg').indexOf('= 160 元') >= 0);
setVal('m610-interest-t-range', '3');
fire('m610-interest-t-range', 'input');
check('m610-interest: time slider to 3 years recomputes 240 live',
  text('m610-interest-calc-tx').indexOf('2000 × 4% × 3 = 240') >= 0);
check('m610-interest: two yearly bars shown at 2 years',
  html('m610-interest-bars').indexOf('第 2 年利息') >= 0);

click('m610-cheng-guess-30');
click('m610-cheng-show');
check('m610-cheng: 三成 = 30%',
  text('m610-cheng-msg').indexOf('就是 30%') >= 0 &&
  text('m610-cheng-calc-tx').indexOf('三成 = 30% = 0.3') >= 0);
click('m610-cheng-level-2');
click('m610-cheng-guess-45b');
check('m610-cheng: 45% = 四成五',
  text('m610-cheng-msg').indexOf('45% = 四成五') >= 0);

// ---------- 5. tiers + tried ----------
KEYS.forEach(function (k) {
  check(k + ' tier marked done', Array.isArray(tiersDone[k]) && tiersDone[k].length >= 1);
  check(k + ' markTried called', triedKeys.indexOf(k) >= 0);
});

// discovery save works through the stubbed wireDiscovery
setVal('m53-scale-find', '两个数同时乘，商不变');
click('m53-scale-find-save');
check('discovery save writes confirmation',
  text('m53-scale-find-saved').indexOf('记下来了') >= 0);

console.log('\nsmoke-anims-band-4-6: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
