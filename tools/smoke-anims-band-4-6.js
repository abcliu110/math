// Smoke tests for apps/web/anims-band-4-6.js (5.3 / 6.9 / 6.10, 11 anims + 4.1–4.8, 21 anims + 4.9–4.17, 18 anims = 50).
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
  'm41-bundle': { grade: 4, kind: '演示', points: ['4.1'], title: '十个一捆，打包进位' },
  'm41-estimate': { grade: 4, kind: '模拟', points: ['4.1'], title: '先估后算' },
  'm42-side': { grade: 4, kind: '演示', points: ['4.2'], title: '边长平方推导法' },
  'm42-ladder': { grade: 4, kind: '模拟', points: ['4.2'], title: '单位阶梯换算法' },
  'm42-place': { grade: 4, kind: '实验', points: ['4.2'], title: '真实地名选单位' },
  'm43-circle': { grade: 4, kind: '演示', points: ['4.3'], title: '角是圆的一部分' },
  'm44-vertical': { grade: 4, kind: '演示', points: ['4.4'], title: '竖式和面积图对上号' },
  'm44-stretch': { grade: 4, kind: '模拟', points: ['4.4'], title: '拉一边，看面积变几倍' },
  'm44-speed': { grade: 4, kind: '演示', points: ['4.4'], title: '速度条重复法' },
  'm45-equal': { grade: 4, kind: '实验', points: ['4.5'], title: '平行就是处处一样远' },
  'm45-cut': { grade: 4, kind: '模拟', points: ['4.5'], title: '剪一刀，平移变长方形' },
  'm45-sets': { grade: 4, kind: '演示', points: ['4.5'], title: '四边形一家子' },
  'm46-parts': { grade: 4, kind: '模拟', points: ['4.6'], title: '被除数拆开再除' },
  'm46-round': { grade: 4, kind: '模拟', points: ['4.6'], title: '除数先看成整十' },
  'm46-invariant': { grade: 4, kind: '模拟', points: ['4.6'], title: '两个数同时变，商不动' },
  'm47-scale': { grade: 4, kind: '演示', points: ['4.7'], title: '一格代表几' },
  'm47-double': { grade: 4, kind: '模拟', points: ['4.7'], title: '复式条并排比一比' },
  'm47-ask': { grade: 4, kind: '实验', points: ['4.7'], title: '读图先问三句话' },
  'm48-cakes': { grade: 4, kind: '实验', points: ['4.8'], title: '烙饼交替烙法' },
  'm48-horse': { grade: 4, kind: '实验', points: ['4.8'], title: '田忌赛马排序博弈' },
  'm48-critical': { grade: 4, kind: '演示', points: ['4.8'], title: '总时间由最长的链决定' },
  'm410-area': { grade: 4, kind: '模拟', points: ['4.10'], title: '切长方形，分配律看得见' },
  'm410-factor': { grade: 4, kind: '模拟', points: ['4.10'], title: '合起来再算：反向分配' },
  'm411-money': { grade: 4, kind: '演示', points: ['4.11'], title: '钱里找小数：元角分' },
  'm411-zoom': { grade: 4, kind: '模拟', points: ['4.11'], title: '数轴放大镜：0.3 和 0.30 是同一个点' },
  'm412-threecopy': { grade: 4, kind: '演示', points: ['4.12'], title: '三个三角形拼一条直线' },
  'm412-drag': { grade: 4, kind: '模拟', points: ['4.12'], title: '拖顶点，角变了，和还是 180°' },
  'm413-money': { grade: 4, kind: '演示', points: ['4.13'], title: '用钱算小数加减' },
  'm413-bars': { grade: 4, kind: '模拟', points: ['4.13'], title: '十分条百分条拼起来加' },
  'm413-units': { grade: 4, kind: '模拟', points: ['4.13'], title: '小数加减，想成整数加减' },
  'm414-plot': { grade: 4, kind: '实验', points: ['4.14'], title: '找点，定点，连起来' },
  'm414-count': { grade: 4, kind: '演示', points: ['4.14'], title: '数格子：平移了几格' },
  'm415-seesaw': { grade: 4, kind: '模拟', points: ['4.15'], title: '跷跷板：平均数就是支点' },
  'm415-split': { grade: 4, kind: '演示', points: ['4.15'], title: '总数倒在一起，再平分' },
  'm415-base': { grade: 4, kind: '模拟', points: ['4.15'], title: '基准数：先定一个大概，再补差' },
  'm417-views': { grade: 4, kind: '演示', points: ['4.17'], title: '三个方向看，对一对' },
  'm417-layers': { grade: 4, kind: '演示', points: ['4.17'], title: '一层一层数' },
  'm417-build': { grade: 4, kind: '实验', points: ['4.17'], title: '搭一搭：照着视图搭出来' },
  'm417-infer': { grade: 4, kind: '实验', points: ['4.17'], title: '两张图，推出最少和最多' },
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
check('50 anims registered', KEYS.every(function (k) { return !!R[k]; }));
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
const g4 = fs.readFileSync(path.join(root, 'content/grades/grade-4.js'), 'utf8');
const g5 = fs.readFileSync(path.join(root, 'content/grades/grade-5.js'), 'utf8');
const g6 = fs.readFileSync(path.join(root, 'content/grades/grade-6.js'), 'utf8');
['4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8', '4.9', '4.10', '4.11', '4.12', '4.13', '4.14', '4.15', '4.16', '4.17'].forEach(function (id) {
  check('point ' + id + ' exists in grade-4.js', g4.indexOf('"' + id + '"') >= 0);
});
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
check('m610-cheng fix: challenge correct answer also draws the ten-cell bar with a half cell',
  html('m610-cheng-grid').indexOf('◧') >= 0 &&
  html('m610-cheng-grid').indexOf('四格半') < 0 &&
  text('m610-cheng-calc-tx').indexOf('四成五 = 45%') >= 0);

// ---------- 4.1 ----------
click('m41-bundle-guess-a');
click('m41-bundle-pack');
check('m41-bundle: 10 x 1000 packs into 1 x 10000',
  text('m41-bundle-msg').indexOf('就是 1 个一万') >= 0 &&
  text('m41-bundle-eq-tx').indexOf('10 × 1000 = 10000') >= 0);
click('m41-bundle-level-1');
click('m41-bundle-guess-a');
click('m41-bundle-pack');
check('m41-bundle: 10 x 10000 packs into 1 x 100000',
  text('m41-bundle-eq-tx').indexOf('10 × 10000 = 100000') >= 0);

click('m41-estimate-guess-b');
click('m41-estimate-calc');
check('m41-estimate: 38642 rounds to 4万 (thousands digit 8)',
  text('m41-estimate-work-tx').indexOf('约是 4万') >= 0 &&
  text('m41-estimate-msg').indexOf('你估对了') >= 0);
click('m41-estimate-level-2');
click('m41-estimate-guess-b');
click('m41-estimate-calc');
check('m41-estimate: 95600 rounds up to 10万',
  text('m41-estimate-work-tx').indexOf('约是 10万') >= 0);

// ---------- 4.2 ----------
click('m42-side-guess-b');
click('m42-side-calc');
check('m42-side: 100 x 100 = 10000 = 1 公顷',
  text('m42-side-eq-tx').indexOf('100 × 100 = 10000') >= 0 &&
  text('m42-side-msg').indexOf('对了') >= 0);
click('m42-side-level-1');
click('m42-side-guess-b');
click('m42-side-calc');
check('m42-side: 1000 x 1000 = 1000000 = 1 平方千米',
  text('m42-side-eq-tx').indexOf('1000 × 1000 = 1000000') >= 0);

click('m42-ladder-guess-c');
click('m42-ladder-climb');
check('m42-ladder: 3 公顷 climbs down one rung x10000 to 30000 平方米',
  text('m42-ladder-val-tx').indexOf('30000 平方米') >= 0 &&
  text('m42-ladder-msg').indexOf('你猜对了') >= 0);
click('m42-ladder-level-2');
click('m42-ladder-guess-b');
click('m42-ladder-climb');
check('m42-ladder: 120000 平方米 climbs up one rung /10000 to 12 公顷',
  text('m42-ladder-val-tx').indexOf('12 公顷') >= 0);

click('m42-place-guess-a');
check('m42-place: football field takes 平方米',
  text('m42-place-msg').indexOf('对了') >= 0 &&
  text('m42-place-msg').indexOf('平方米') >= 0);
click('m42-place-level-1');
click('m42-place-guess-b');
check('m42-place: 颐和园 takes 公顷',
  text('m42-place-msg').indexOf('颐和园用公顷') >= 0);
click('m42-place-level-2');
click('m42-place-guess-c');
check('m42-place: 北京市 takes 平方千米',
  text('m42-place-msg').indexOf('北京市用平方千米') >= 0);

// ---------- 4.3 ----------
click('m43-circle-guess-b');
click('m43-circle-spin');
check('m43-circle: 90 deg is 1/4 of a circle',
  text('m43-circle-eq-tx').indexOf('90° ÷ 360° = 1/4') >= 0 &&
  text('m43-circle-msg').indexOf('对了') >= 0);
click('m43-circle-level-2');
click('m43-circle-guess-c');
click('m43-circle-spin');
check('m43-circle: 270 deg is 3/4 of a circle',
  text('m43-circle-eq-tx').indexOf('270° ÷ 360° = 3/4') >= 0);

// ---------- 4.4 ----------
click('m44-vertical-guess-b');
click('m44-vertical-row-0');
click('m44-vertical-row-1');
check('m44-vertical: both rows match, 123x45 = 5535',
  text('m44-vertical-msg').indexOf('5535') >= 0);
click('m44-vertical-level-1');
click('m44-vertical-guess-b');
click('m44-vertical-row-0');
click('m44-vertical-row-1');
check('m44-vertical: 138x24 = 3312',
  text('m44-vertical-msg').indexOf('3312') >= 0);

click('m44-stretch-guess-b');
click('m44-stretch-stretch');
check('m44-stretch: 12x5 stretched x10 -> 120x5 = 600',
  text('m44-stretch-eq-tx').indexOf('120 × 5 = 600') >= 0 &&
  text('m44-stretch-msg').indexOf('对了') >= 0);
click('m44-stretch-level-1');
click('m44-stretch-guess-b');
click('m44-stretch-stretch');
check('m44-stretch: x2 and x3 -> product x6, 8x15 = 120',
  text('m44-stretch-eq-tx').indexOf('8 × 15 = 120') >= 0);

click('m44-speed-guess-b');
click('m44-speed-hour');
click('m44-speed-hour');
check('m44-speed: 60 x 2 = 120 千米',
  text('m44-speed-total-tx').indexOf('120 千米') >= 0 &&
  text('m44-speed-msg').indexOf('对了') >= 0);
click('m44-speed-level-2');
click('m44-speed-guess-b');
for (let i = 0; i < 4; i++) click('m44-speed-hour');
check('m44-speed: 45 x 4 = 180 千米',
  text('m44-speed-total-tx').indexOf('180 千米') >= 0);

// ---------- 4.5 ----------
click('m45-equal-guess-a');
click('m45-equal-measure');
click('m45-equal-measure');
click('m45-equal-measure');
check('m45-equal: three measurements all 3 cm, parallel',
  text('m45-equal-msg').indexOf('三处量出来都是 3 厘米') >= 0 &&
  text('m45-equal-msg').indexOf('你猜对了') >= 0);
click('m45-equal-level-2');
click('m45-equal-guess-b');
click('m45-equal-measure');
click('m45-equal-measure');
click('m45-equal-measure');
check('m45-equal: 2, 3, 4 cm is not parallel',
  text('m45-equal-msg').indexOf('2、3、4 厘米') >= 0);

click('m45-cut-guess-b');
click('m45-cut-cut');
click('m45-cut-move');
check('m45-cut: base 6 height 4 stays 24 after cut-and-slide',
  text('m45-cut-area-tx').indexOf('6 × 4 = 24') >= 0 &&
  text('m45-cut-msg').indexOf('面积还是 24') >= 0);
click('m45-cut-level-2');
click('m45-cut-guess-b');
click('m45-cut-cut');
click('m45-cut-move');
check('m45-cut: base 5 height 6 = 30',
  text('m45-cut-area-tx').indexOf('5 × 6 = 30') >= 0);

click('m45-sets-guess-a');
check('m45-sets: 长方形 is a 平行四边形',
  text('m45-sets-msg').indexOf('对了') >= 0);
click('m45-sets-level-1');
click('m45-sets-guess-b');
check('m45-sets: 梯形 is not a 平行四边形',
  text('m45-sets-msg').indexOf('对了') >= 0);
click('m45-sets-level-2');
click('m45-sets-guess-a');
check('m45-sets: 正方形 is a 长方形',
  text('m45-sets-msg').indexOf('对了') >= 0);

// ---------- 4.6 ----------
click('m46-parts-guess-b');
click('m46-parts-part-0');
click('m46-parts-part-1');
check('m46-parts: 156÷3 = 150÷3 + 6÷3 = 50 + 2 = 52',
  text('m46-parts-sum-tx').indexOf('50 + 2 = 52') >= 0 &&
  text('m46-parts-msg').indexOf('你猜对了') >= 0);
click('m46-parts-level-2');
click('m46-parts-guess-b');
click('m46-parts-part-0');
click('m46-parts-part-1');
check('m46-parts: 368÷8 = 40 + 6 = 46',
  text('m46-parts-sum-tx').indexOf('40 + 6 = 46') >= 0);

click('m46-round-guess-b');
click('m46-round-round');
click('m46-round-try');
check('m46-round: 312÷39, 39 as 40, try 8, quotient 8',
  text('m46-round-msg').indexOf('商是 8') >= 0);
click('m46-round-level-1');
click('m46-round-guess-b');
click('m46-round-round');
click('m46-round-try');
click('m46-round-try');
check('m46-round: 161÷23, try 8 too big, adjust to 7',
  text('m46-round-msg').indexOf('商是 7') >= 0);
click('m46-round-level-2');
click('m46-round-guess-a');
click('m46-round-round');
click('m46-round-try');
check('m46-round: 247÷38 = 6 remainder 19',
  text('m46-round-msg').indexOf('商是 6 余 19') >= 0);

click('m46-invariant-guess-b');
click('m46-invariant-m10');
check('m46-invariant: 300÷40 = 7 remainder 20, quotient unchanged',
  text('m46-invariant-eq-tx').indexOf('300 ÷ 40 = 7 余 20') >= 0 &&
  text('m46-invariant-msg').indexOf('你猜对了') >= 0);
click('m46-invariant-only-a');
check('m46-invariant: counterexample moves only the dividend, quotient changes to 75',
  text('m46-invariant-msg').indexOf('只移被除数') >= 0 &&
  text('m46-invariant-eq-tx').indexOf('300 ÷ 4 = 75') >= 0);
click('m46-invariant-level-2');
click('m46-invariant-guess-b');
click('m46-invariant-m10');
check('m46-invariant: 1200÷70 = 17 remainder 10',
  text('m46-invariant-eq-tx').indexOf('1200 ÷ 70 = 17 余 10') >= 0);

// ---------- 4.7 ----------
click('m47-scale-guess-b');
click('m47-scale-s5');
check('m47-scale: 4 grids x 5 per grid = 20 people',
  text('m47-scale-read-tx').indexOf('4 格 × 5 人/格 = 20 人') >= 0 &&
  text('m47-scale-msg').indexOf('你猜对了') >= 0);
click('m47-scale-level-2');
click('m47-scale-guess-a');
click('m47-scale-s2');
check('m47-scale: 4 grids x 2 per grid = 8 people',
  text('m47-scale-read-tx').indexOf('4 格 × 2 人/格 = 8 人') >= 0);

click('m47-double-guess-b');
click('m47-double-show');
check('m47-double: jump rope boys 20 vs girls 16, 4 more',
  text('m47-double-read-tx').indexOf('男生跳绳 20 人') >= 0 &&
  text('m47-double-msg').indexOf('对了') >= 0);
click('m47-double-level-2');
click('m47-double-guess-b');
click('m47-double-show');
check('m47-double: same height, different scales, 10 vs 25, 15 apart',
  text('m47-double-msg').indexOf('差 15 人') >= 0);

click('m47-ask-guess-a');
click('m47-ask-ask-0');
click('m47-ask-ask-1');
click('m47-ask-ask-2');
check('m47-ask: complete chart reads 28 boys',
  text('m47-ask-msg').indexOf('28 人') >= 0 &&
  text('m47-ask-msg').indexOf('你猜对了') >= 0);
click('m47-ask-level-1');
click('m47-ask-guess-b');
click('m47-ask-ask-0');
click('m47-ask-ask-1');
click('m47-ask-ask-2');
check('m47-ask: chart without a title is not trustworthy',
  text('m47-ask-msg').indexOf('标题都没写') >= 0);
click('m47-ask-level-2');
click('m47-ask-guess-b');
click('m47-ask-ask-0');
click('m47-ask-ask-1');
click('m47-ask-ask-2');
check('m47-ask: chart without a unit per grid cannot be read',
  text('m47-ask-msg').indexOf('没有写 1 格代表几') >= 0);

// ---------- 4.8 ----------
click('m48-cakes-guess-b');
click('m48-cakes-next');
click('m48-cakes-next');
click('m48-cakes-next');
check('m48-cakes: 3 cakes in 3 minutes, pan never idle',
  text('m48-cakes-msg').indexOf('3 分钟') >= 0 &&
  text('m48-cakes-msg').indexOf('你猜对了') >= 0);
click('m48-cakes-level-1');
click('m48-cakes-guess-a');
click('m48-cakes-next');
click('m48-cakes-next');
check('m48-cakes: 5 cakes = 2 + 3, 5 minutes',
  text('m48-cakes-msg').indexOf('5 分钟') >= 0);

click('m48-horse-guess-a');
click('m48-horse-ord-0');
check('m48-horse: honest order 上中下 wins 0',
  text('m48-horse-race-tx').indexOf('赢了 0 局') >= 0);
click('m48-horse-level-1');
click('m48-horse-guess-b');
click('m48-horse-ord-4');
check('m48-horse: 下上中 wins 2, wins the match',
  text('m48-horse-race-tx').indexOf('赢了 2 局') >= 0 &&
  text('m48-horse-msg').indexOf('赢整场') >= 0);
click('m48-horse-level-2');
click('m48-horse-guess-a');
for (let i = 0; i < 6; i++) click('m48-horse-ord-' + i);
check('m48-horse: all 6 orders tried, only 1 wins 2',
  text('m48-horse-msg').indexOf('只有“下上中”赢了 2 局') >= 0);

click('m48-critical-guess-b');
click('m48-critical-chain');
check('m48-critical: tea chain is 11 minutes',
  text('m48-critical-chain-tx').indexOf('11 分钟') >= 0 &&
  text('m48-critical-msg').indexOf('对了') >= 0);
click('m48-critical-level-1');
click('m48-critical-guess-b');
click('m48-critical-chain');
check('m48-critical: porridge chain is 11 minutes',
  text('m48-critical-chain-tx').indexOf('煮粥 10 分钟') >= 0);

// ---------- 4.10 ----------
click('m410-area-guess-a');
click('m410-area-cut');
check('m410-area: 6x(4+3) cuts to 24+18=42',
  text('m410-area-msg').indexOf('24+18=42') >= 0 &&
  text('m410-area-msg').indexOf('你猜对了') >= 0);
click('m410-area-level-2');
click('m410-area-guess-a');
click('m410-area-cut');
check('m410-area: 12x(7+3) cuts to 84+36=120',
  text('m410-area-msg').indexOf('84+36=120') >= 0);

click('m410-factor-guess-a');
click('m410-factor-join');
check('m410-factor: 25x36+25x64 joins to 25x100=2500',
  text('m410-factor-steps').indexOf('25×100 = 2500') >= 0 &&
  text('m410-factor-msg').indexOf('对了') >= 0);
click('m410-factor-level-2');
click('m410-factor-guess-a');
click('m410-factor-join');
check('m410-factor: 125x18+125x82 joins to 125x100=12500',
  text('m410-factor-steps').indexOf('125×100 = 12500') >= 0);
click('m410-factor-split');
check('m410-factor: split way also gives 12500',
  text('m410-factor-steps').indexOf('2250+10250=12500') >= 0);

// ---------- 4.11 ----------
click('m411-money-guess-a');
click('m411-money-open');
check('m411-money: 1.35 yuan is 1 yuan 3 jiao 5 fen',
  text('m411-money-msg').indexOf('1元 + 3角 + 5分') >= 0 &&
  text('m411-money-msg').indexOf('对了') >= 0);
click('m411-money-level-2');
click('m411-money-guess-a');
click('m411-money-open');
check('m411-money: 0.75 yuan is 7 jiao 5 fen',
  text('m411-money-msg').indexOf('7角5分') >= 0);

click('m411-zoom-guess-b');
click('m411-zoom-zoom');
check('m411-zoom: 0.3 marked, 0.3 = 0.30',
  text('m411-zoom-msg').indexOf('红点就是 0.3') >= 0 &&
  text('m411-zoom-msg').indexOf('0.30 是同一个点') >= 0);
click('m411-zoom-level-2');
click('m411-zoom-guess-b');
click('m411-zoom-zoom');
check('m411-zoom: 0.05 is the middle of 0 to 0.1',
  text('m411-zoom-msg').indexOf('红点就是 0.05') >= 0);

// ---------- 4.12 ----------
click('m412-threecopy-guess-b');
click('m412-threecopy-assemble');
check('m412-threecopy: 50+60+70 assembles to 180',
  text('m412-threecopy-msg').indexOf('50° + 60° + 70° = 180°') >= 0 &&
  text('m412-threecopy-msg').indexOf('你猜对了') >= 0);
click('m412-threecopy-level-1');
click('m412-threecopy-guess-b');
click('m412-threecopy-assemble');
check('m412-threecopy: 90+45+45 assembles to 180',
  text('m412-threecopy-msg').indexOf('90° + 45° + 45° = 180°') >= 0);

click('m412-drag-guess-same');
click('m412-drag-next');
check('m412-drag: new triangle still sums to 180',
  text('m412-drag-read').indexOf('= 180°') >= 0 &&
  text('m412-drag-msg').indexOf('还是 180°') >= 0 &&
  text('m412-drag-msg').indexOf('你猜对了') >= 0);

// ---------- 4.13 ----------
click('m413-money-guess-a');
click('m413-money-next');
click('m413-money-next');
click('m413-money-next');
check('m413-money: 2.5+1.3 = 3.8 by yuan and jiao',
  text('m413-money-msg').indexOf('3.8') >= 0 &&
  text('m413-money-msg').indexOf('你猜对了') >= 0);
click('m413-money-level-2');
click('m413-money-guess-a');
click('m413-money-next');
click('m413-money-next');
click('m413-money-next');
click('m413-money-next');
check('m413-money: 4.6-1.25 = 3.35 with borrow from jiao',
  text('m413-money-msg').indexOf('3.35') >= 0);

click('m413-bars-guess-a');
click('m413-bars-join');
check('m413-bars: 0.4+0.3 is 7 tenths = 0.7',
  text('m413-bars-msg').indexOf('7 个 0.1 = 0.7') >= 0 &&
  text('m413-bars-msg').indexOf('你猜对了') >= 0);
click('m413-bars-level-2');
click('m413-bars-guess-a');
click('m413-bars-join');
check('m413-bars: 0.68+0.57 regroups 100 hundredths to 1.25',
  text('m413-bars-msg').indexOf('125 个 0.01') >= 0 &&
  text('m413-bars-msg').indexOf('1.25') >= 0);

click('m413-units-guess-a');
click('m413-units-convert');
check('m413-units: 0.4 is 4 tenths, 4+3=7 tenths = 0.7',
  text('m413-units-msg').indexOf('4 个 0.1') >= 0 &&
  text('m413-units-msg').indexOf('0.7') >= 0);
click('m413-units-level-2');
click('m413-units-guess-b');
click('m413-units-convert');
check('m413-units: 1.8 is 180 hundredths, 180-65=115 = 1.15',
  text('m413-units-msg').indexOf('180 个 0.01') >= 0 &&
  text('m413-units-msg').indexOf('1.15') >= 0);

// ---------- 4.14 ----------
click('m414-plot-guess-a');
click('m414-plot-cell-3-1');
click('m414-plot-cell-5-1');
click('m414-plot-cell-4-3');
click('m414-plot-join');
check('m414-plot: shift right 2, three vertices found and joined',
  text('m414-plot-msg').indexOf('连起来了') >= 0 &&
  text('m414-plot-msg').indexOf('你猜对了') >= 0);
click('m414-plot-level-2');
click('m414-plot-guess-a');
click('m414-plot-cell-6-1');
click('m414-plot-cell-4-1');
click('m414-plot-cell-5-3');
click('m414-plot-join');
check('m414-plot: mirror across centre, (1,1) goes to (6,1)',
  text('m414-plot-msg').indexOf('连起来了') >= 0);

click('m414-count-guess-b');
click('m414-count-count');
check('m414-count: shift right is 3 grids',
  text('m414-count-msg').indexOf('3 格') >= 0 &&
  text('m414-count-msg').indexOf('你猜对了') >= 0);
click('m414-count-level-2');
click('m414-count-guess-b');
click('m414-count-count');
check('m414-count: shift left is 4 grids',
  text('m414-count-msg').indexOf('4 格') >= 0);

// ---------- 4.15 ----------
click('m415-seesaw-guess-b');
click('m415-seesaw-right');
click('m415-seesaw-right');
click('m415-seesaw-right');
click('m415-seesaw-right');
click('m415-seesaw-check');
check('m415-seesaw: fulcrum at 70 balances 60, 70, 80',
  text('m415-seesaw-msg').indexOf('平了') >= 0 &&
  text('m415-seesaw-msg').indexOf('你猜对了') >= 0);
click('m415-seesaw-level-2');
click('m415-seesaw-guess-b');
click('m415-seesaw-right');
click('m415-seesaw-right');
click('m415-seesaw-right');
click('m415-seesaw-right');
click('m415-seesaw-right');
click('m415-seesaw-check');
check('m415-seesaw: fulcrum at 75 balances 55, 75, 95',
  text('m415-seesaw-msg').indexOf('平了') >= 0);

click('m415-split-guess-b');
click('m415-split-pour');
click('m415-split-share');
check('m415-split: 340 split into 4 is 85 each',
  text('m415-split-msg').indexOf('340 ÷ 4 = 85') >= 0 &&
  text('m415-split-msg').indexOf('你猜对了') >= 0);
click('m415-split-level-1');
click('m415-split-guess-b');
click('m415-split-pour');
click('m415-split-share');
check('m415-split: 225 split into 3 is 75 each',
  text('m415-split-msg').indexOf('225 ÷ 3 = 75') >= 0);

click('m415-base-guess-b');
click('m415-base-pick');
click('m415-base-calc');
check('m415-base: base 100, mean deviation 0, mean is 100',
  text('m415-base-msg').indexOf('平均数 = 100 + 0 = 100') >= 0 &&
  text('m415-base-msg').indexOf('你猜对了') >= 0);
click('m415-base-level-2');
click('m415-base-guess-b');
click('m415-base-pick');
click('m415-base-calc');
check('m415-base: base 100, mean deviation 1, mean is 101',
  text('m415-base-msg').indexOf('平均数 = 100 + 1 = 101') >= 0);

// ---------- 4.17 ----------
click('m417-views-guess-b');
click('m417-views-v-front');
click('m417-views-v-left');
click('m417-views-v-top');
check('m417-views: three views seen, front 5, left 5, top 6',
  text('m417-views-msg').indexOf('前面 5 个正方形') >= 0 &&
  text('m417-views-msg').indexOf('你猜对了') >= 0);
click('m417-views-level-1');
click('m417-views-guess-a');
click('m417-views-v-front');
click('m417-views-v-left');
click('m417-views-v-top');
check('m417-views: level 1 front has 7 squares, top row 1',
  text('m417-views-msg').indexOf('前面 7 个正方形') >= 0);

click('m417-layers-guess-b');
click('m417-layers-layer-1');
click('m417-layers-layer-2');
click('m417-layers-sum');
check('m417-layers: 6 + 2 = 8 cubes',
  text('m417-layers-msg').indexOf('6 + 2 = 8') >= 0 &&
  text('m417-layers-msg').indexOf('你猜对了') >= 0);
click('m417-layers-level-2');
click('m417-layers-guess-b');
click('m417-layers-layer-1');
click('m417-layers-layer-2');
click('m417-layers-layer-3');
click('m417-layers-sum');
check('m417-layers: 7 + 3 + 2 = 12 cubes',
  text('m417-layers-msg').indexOf('7 + 3 + 2 = 12') >= 0);

click('m417-build-guess-b');
click('m417-build-cell-0-0');
click('m417-build-cell-1-0');
click('m417-build-cell-1-0');
click('m417-build-cell-2-0');
click('m417-build-cell-0-1');
click('m417-build-cell-2-1');
click('m417-build-check');
check('m417-build: target stack built, views match, 6 cubes minimum',
  text('m417-build-msg').indexOf('对上了') >= 0 &&
  text('m417-build-msg').indexOf('你猜对了') >= 0);

click('m417-infer-guess-b');
click('m417-infer-show-min');
click('m417-infer-show-max');
check('m417-infer: min 4, max 5 cubes from top + front views',
  text('m417-infer-msg').indexOf('最少 4 个') >= 0 &&
  text('m417-infer-msg').indexOf('最多 5 个') >= 0 &&
  text('m417-infer-msg').indexOf('你猜对了') >= 0);
click('m417-infer-level-2');
click('m417-infer-guess-b');
click('m417-infer-show-min');
click('m417-infer-show-max');
check('m417-infer: challenge min 9, max 14 cubes',
  text('m417-infer-msg').indexOf('最少 9 个') >= 0 &&
  text('m417-infer-msg').indexOf('最多 14 个') >= 0);

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
