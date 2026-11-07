// Smoke tests for apps/web/anims-band-4-6.js (5.3 / 6.9 / 6.10, 11 anims + 4.1–4.8, 21 anims + 4.9–4.17, 18 anims + 5.1/5.2/5.4–5.14, 27 anims + 6.1–6.8/6.11–6.14, 39 anims = 116).
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
  'm51-units': { grade: 5, kind: '模拟', points: ['5.1'], title: '计数单位换算' },
  'm51-estimate': { grade: 5, kind: '模拟', points: ['5.1'], title: '估算定小数点' },
  'm52-ship': { grade: 5, kind: '实验', points: ['5.2'], title: '军舰游戏猜船' },
  'm52-shift': { grade: 5, kind: '模拟', points: ['5.2'], title: '平移看数对变化' },
  'm54-wheel': { grade: 5, kind: '模拟', points: ['5.4'], title: '转盘面积定概率' },
  'm55-cards': { grade: 5, kind: '实验', points: ['5.5'], title: '卡片隔离法' },
  'm55-bar': { grade: 5, kind: '模拟', points: ['5.5'], title: '条形图列方程' },
  'm55-back': { grade: 5, kind: '模拟', points: ['5.5'], title: '倒推猜数' },
  'm56-twotri': { grade: 5, kind: '模拟', points: ['5.6'], title: '两个三角形拼平行四边形' },
  'm56-grid': { grade: 5, kind: '模拟', points: ['5.6'], title: '方格纸数格子' },
  'm57-small': { grade: 5, kind: '模拟', points: ['5.7'], title: '化繁为简' },
  'm57-pair': { grade: 5, kind: '演示', points: ['5.7'], title: '一一对应解释“多 1”' },
  'm57-transfer': { grade: 5, kind: '实验', points: ['5.7'], title: '迁移到敲钟车站路灯' },
  'm58-game': { grade: 5, kind: '实验', points: ['5.8'], title: '因数游戏' },
  'm58-sieve': { grade: 5, kind: '实验', points: ['5.8'], title: '埃拉托斯特尼筛法' },
  'm59-net': { grade: 5, kind: '模拟', points: ['5.9'], title: '展开图折叠' },
  'm59-surface': { grade: 5, kind: '演示', points: ['5.9'], title: '拆面算表面积' },
  'm511-lcd': { grade: 5, kind: '模拟', points: ['5.11'], title: '最小公分母' },
  'm511-trap': { grade: 5, kind: '实验', points: ['5.11'], title: '分子加分子是错的' },
  'm512-three': { grade: 5, kind: '模拟', points: ['5.12'], title: '三要素齐全才转得动' },
  'm512-clock': { grade: 5, kind: '演示', points: ['5.12'], title: '钟表指针看旋转' },
  'm513-slope': { grade: 5, kind: '模拟', points: ['5.13'], title: '斜率即变化' },
  'm513-table': { grade: 5, kind: '演示', points: ['5.13'], title: '画图列表比方案' },
  'm513-draw': { grade: 5, kind: '实验', points: ['5.13'], title: '自己画折线图' },
  'm514-guess': { grade: 5, kind: '实验', points: ['5.14'], title: '搭积木猜视图' },
  'm514-three': { grade: 5, kind: '演示', points: ['5.14'], title: '三视图互推' },
  'm514-nums': { grade: 5, kind: '实验', points: ['5.14'], title: '俯视图数字法' },
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
  'm417-infer': { grade: 4, kind: '实验', points: ['4.17', '5.14'], title: '两张图，推出最少和最多' },
  'm61-overlap': { grade: 6, kind: '模拟', points: ['6.1'], title: '双色重叠面积模型' },
  'm61-scale': { grade: 6, kind: '模拟', points: ['6.1'], title: '数轴缩放' },
  'm61-wall': { grade: 6, kind: '模拟', points: ['6.1'], title: '分数墙量一量' },
  'm61-groups': { grade: 6, kind: '演示', points: ['6.1'], title: '分组累加' },
  'm62-fit': { grade: 6, kind: '模拟', points: ['6.2'], title: '能装几个' },
  'm62-recip': { grade: 6, kind: '演示', points: ['6.2'], title: '除以分数就是乘倒数' },
  'm62-area': { grade: 6, kind: '模拟', points: ['6.2'], title: '已知面积求边' },
  'm62-jump': { grade: 6, kind: '模拟', points: ['6.2'], title: '数轴跳跃' },
  'm63-bearing': { grade: 6, kind: '模拟', points: ['6.3'], title: '真方位角与罗盘方位' },
  'm63-route': { grade: 6, kind: '实验', points: ['6.3'], title: '分段路线描述' },
  'm63-opposite': { grade: 6, kind: '演示', points: ['6.3'], title: '相对方向' },
  'm64-axis': { grade: 6, kind: '模拟', points: ['6.4'], title: '双数轴' },
  'm64-mix': { grade: 6, kind: '实验', points: ['6.4'], title: '调色与串珠' },
  'm65-grid': { grade: 6, kind: '模拟', points: ['6.5'], title: '方格纸数格子' },
  'm65-sector': { grade: 6, kind: '模拟', points: ['6.5'], title: '扇形是圆的几分之几' },
  'm66-convert': { grade: 6, kind: '模拟', points: ['6.6'], title: '分数小数百分数互化' },
  'm66-axis': { grade: 6, kind: '模拟', points: ['6.6'], title: '双数轴看涨跌' },
  'm66-estimate': { grade: 6, kind: '实验', points: ['6.6'], title: '先估后算' },
  'm67a-parts': { grade: 6, kind: '模拟', points: ['6.7a'], title: '份数法画扇形' },
  'm67a-triple': { grade: 6, kind: '演示', points: ['6.7a'], title: '分数百分数角度三者对照' },
  'm67a-reverse': { grade: 6, kind: '模拟', points: ['6.7a'], title: '读图反推' },
  'm67b-stack': { grade: 6, kind: '模拟', points: ['6.7b'], title: '叠盒叠罐' },
  'm67b-diff': { grade: 6, kind: '模拟', points: ['6.7b'], title: '差分表' },
  'm67b-algebra': { grade: 6, kind: '演示', points: ['6.7b'], title: '代数配对' },
  'm68-life': { grade: 6, kind: '模拟', points: ['6.8'], title: '生活里的负数' },
  'm611-unfold': { grade: 6, kind: '模拟', points: ['6.11'], title: '展开标签' },
  'm611-layers': { grade: 6, kind: '模拟', points: ['6.11'], title: '叠层体积' },
  'm611-spin': { grade: 6, kind: '模拟', points: ['6.11'], title: '旋转成体' },
  'm612-axis': { grade: 6, kind: '模拟', points: ['6.12'], title: '双数轴看正比例' },
  'm612-graph': { grade: 6, kind: '模拟', points: ['6.12'], title: '正比例是过原点的直线' },
  'm612-rect': { grade: 6, kind: '模拟', points: ['6.12'], title: '定积长方形' },
  'm612-scale': { grade: 6, kind: '模拟', points: ['6.12'], title: '比例尺地图' },
  'm613-worst': { grade: 6, kind: '实验', points: ['6.13'], title: '最不利情况' },
  'm613-remainder': { grade: 6, kind: '模拟', points: ['6.13'], title: '余数分类' },
  'm613-pairs': { grade: 6, kind: '实验', points: ['6.13'], title: '配对游戏' },
  'm614-map': { grade: 6, kind: '实验', points: ['6.14'], title: '概念地图连线' },
  'm614-multi': { grade: 6, kind: '演示', points: ['6.14'], title: '一题多解比较' },
  'm614-cause': { grade: 6, kind: '实验', points: ['6.14'], title: '错题归因' },
  'm614-space': { grade: 6, kind: '模拟', points: ['6.14'], title: '间隔复习' },
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
check('116 anims registered', KEYS.every(function (k) { return !!R[k]; }));
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
['5.1', '5.2', '5.4', '5.5', '5.6', '5.7', '5.8', '5.9', '5.10', '5.11', '5.12', '5.13', '5.14'].forEach(function (id) {
  check('point ' + id + ' exists in grade-5.js', g5.indexOf('"' + id + '"') >= 0);
});
check('point 6.9 exists in grade-6.js', g6.indexOf('"6.9"') >= 0);
check('point 6.10 exists in grade-6.js', g6.indexOf('"6.10"') >= 0);
['6.1', '6.2', '6.3', '6.4', '6.5', '6.6', '6.7a', '6.7b', '6.8', '6.11', '6.12', '6.13', '6.14'].forEach(function (id) {
  check('point ' + id + ' exists in grade-6.js', g6.indexOf('"' + id + '"') >= 0);
});

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

// ---------- 5.1 ----------
click('m51-units-guess-a');
click('m51-units-split');
check('m51-units: 0.3x0.4 is 12 hundredths = 0.12',
  text('m51-units-msg').indexOf('12 个 0.01') >= 0 &&
  text('m51-units-msg').indexOf('你猜对了') >= 0);
click('m51-units-level-2');
click('m51-units-guess-a');
click('m51-units-split');
check('m51-units: 0.6x0.7 is 42 hundredths = 0.42',
  text('m51-units-msg').indexOf('42 个 0.01') >= 0);

click('m51-estimate-guess-a');
click('m51-estimate-est');
check('m51-estimate: 2.4x1.9 estimates to about 4',
  text('m51-estimate-msg').indexOf('2×2=4') >= 0);
click('m51-estimate-place');
check('m51-estimate: 2.4x1.9 = 4.56',
  text('m51-estimate-msg').indexOf('4.56') >= 0 &&
  text('m51-estimate-msg').indexOf('你猜对了') >= 0);
click('m51-estimate-level-2');
click('m51-estimate-guess-a');
click('m51-estimate-est');
click('m51-estimate-place');
check('m51-estimate: 0.48x3.1 = 1.488',
  text('m51-estimate-msg').indexOf('1.488') >= 0);

// ---------- 5.2 ----------
click('m52-ship-guess-h');
click('m52-ship-c-3-2');
check('m52-ship: hit at (3,2)',
  text('m52-ship-msg').indexOf('打中了') >= 0);
click('m52-ship-c-4-2');
check('m52-ship: ship sinks after 2 hits',
  text('m52-ship-msg').indexOf('船沉了') >= 0 &&
  text('m52-ship-msg').indexOf('你猜对了') >= 0);
click('m52-ship-level-2');
click('m52-ship-guess-v');
click('m52-ship-c-5-1');
click('m52-ship-c-5-2');
click('m52-ship-c-5-3');
check('m52-ship: 3-cell vertical ship sinks',
  text('m52-ship-msg').indexOf('船沉了') >= 0);

click('m52-shift-guess-a');
click('m52-shift-right');
click('m52-shift-right');
click('m52-shift-check');
check('m52-shift: right 2 from (2,2) reaches (4,2)',
  text('m52-shift-msg').indexOf('(4,2)') >= 0 &&
  text('m52-shift-msg').indexOf('你猜对了') >= 0);
click('m52-shift-level-1');
click('m52-shift-guess-b');
click('m52-shift-up');
click('m52-shift-up');
click('m52-shift-up');
click('m52-shift-check');
check('m52-shift: up 3 from (2,2) reaches (2,5)',
  text('m52-shift-msg').indexOf('(2,5)') >= 0);

// ---------- 5.4 ----------
click('m54-wheel-guess-a');
click('m54-wheel-spin');
check('m54-wheel: red 1/4, about 5 reds in 20 spins',
  text('m54-wheel-msg').indexOf('大约是 5 次') >= 0 &&
  text('m54-wheel-msg').indexOf('你猜对了') >= 0);
click('m54-wheel-red-3');
check('m54-wheel: red 3/4 updates probability text',
  text('m54-wheel-prob').indexOf('3/4') >= 0);
click('m54-wheel-level-1');
click('m54-wheel-guess-b');
click('m54-wheel-spin');
check('m54-wheel: red 2/4, about 10 reds in 20 spins',
  text('m54-wheel-msg').indexOf('大约是 10 次') >= 0);

// ---------- 5.5 ----------
click('m55-cards-guess-b');
click('m55-cards-trap');
check('m55-cards: one-sided move tilts the balance',
  text('m55-cards-msg').indexOf('翘了') >= 0);
click('m55-cards-act-0');
check('m55-cards: x+3=8 gives x=5',
  text('m55-cards-msg').indexOf('x = 5') >= 0 &&
  text('m55-cards-msg').indexOf('你猜对了') >= 0);
click('m55-cards-level-2');
click('m55-cards-guess-b');
click('m55-cards-act-0');
check('m55-cards: 2x+4=10 first step leaves 2x=6',
  text('m55-cards-msg').indexOf('2x = 6') >= 0);
click('m55-cards-act-1');
check('m55-cards: 2x+4=10 gives x=3',
  text('m55-cards-msg').indexOf('x = 3') >= 0 &&
  text('m55-cards-msg').indexOf('你猜对了') >= 0);

click('m55-bar-guess-b');
click('m55-bar-draw');
click('m55-bar-write');
check('m55-bar: bars give equation x+5=12',
  text('m55-bar-msg').indexOf('x + 5 = 12') >= 0);
click('m55-bar-solve');
check('m55-bar: x+5=12 gives x=7',
  text('m55-bar-msg').indexOf('x = 7') >= 0 &&
  text('m55-bar-msg').indexOf('你猜对了') >= 0);
click('m55-bar-level-2');
click('m55-bar-guess-b');
click('m55-bar-draw');
click('m55-bar-write');
click('m55-bar-solve');
check('m55-bar: x+2x=15 gives x=5',
  text('m55-bar-msg').indexOf('x = 5') >= 0);

click('m55-back-guess-a');
click('m55-back-rev-0');
check('m55-back: x+5=12 reverses to 12-5=7',
  text('m55-back-msg').indexOf('12 − 5 = 7') >= 0 &&
  text('m55-back-msg').indexOf('你猜对了') >= 0);
click('m55-back-level-2');
click('m55-back-guess-a');
click('m55-back-rev-0');
check('m55-back: 2x+3=11 first reverse is 11-3=8',
  text('m55-back-msg').indexOf('11 − 3 = 8') >= 0);
click('m55-back-rev-1');
check('m55-back: 2x+3=11 gives x=4',
  text('m55-back-msg').indexOf('x = 4') >= 0 &&
  text('m55-back-msg').indexOf('你猜对了') >= 0);

// ---------- 5.6 ----------
click('m56-twotri-guess-b');
click('m56-twotri-join');
check('m56-twotri: two 6x4 triangles make 24, one is 12',
  text('m56-twotri-msg').indexOf('24÷2=12') >= 0 &&
  text('m56-twotri-msg').indexOf('你猜对了') >= 0);
click('m56-twotri-level-2');
click('m56-twotri-guess-b');
click('m56-twotri-join');
check('m56-twotri: 5x6 triangle is 15',
  text('m56-twotri-msg').indexOf('30÷2=15') >= 0);

click('m56-grid-guess-a');
click('m56-grid-count');
check('m56-grid: 6x4 counts 24 squares, slant 5 is not the height',
  text('m56-grid-msg').indexOf('24 格') >= 0 &&
  text('m56-grid-msg').indexOf('斜边 5 不是高') >= 0 &&
  text('m56-grid-msg').indexOf('你猜对了') >= 0);
click('m56-grid-level-1');
click('m56-grid-guess-a');
click('m56-grid-count');
check('m56-grid: 5x3 counts 15 squares',
  text('m56-grid-msg').indexOf('15 格') >= 0);

// ---------- 5.7 ----------
click('m57-small-guess-b');
click('m57-small-small');
click('m57-small-table');
check('m57-small: 100m every 10m is 11 trees',
  text('m57-small-msg').indexOf('11 棵树') >= 0 &&
  text('m57-small-msg').indexOf('你猜对了') >= 0);
click('m57-small-level-1');
click('m57-small-guess-b');
click('m57-small-small');
click('m57-small-table');
check('m57-small: 100m every 5m is 21 trees',
  text('m57-small-msg').indexOf('21 棵树') >= 0);

click('m57-pair-guess-b');
click('m57-pair-pair');
click('m57-pair-pair');
click('m57-pair-pair');
click('m57-pair-pair');
click('m57-pair-pair');
check('m57-pair: 5 intervals need 6 trees, last tree has no interval',
  text('m57-pair-msg').indexOf('多出来的 1') >= 0 &&
  text('m57-pair-msg').indexOf('你猜对了') >= 0);
click('m57-pair-level-1');
click('m57-pair-guess-b');
for (let i = 0; i < 8; i++) click('m57-pair-pair');
check('m57-pair: 8 intervals need 9 trees',
  text('m57-pair-msg').indexOf('9 棵树') >= 0);

click('m57-transfer-guess-b');
click('m57-transfer-swap');
check('m57-transfer: 5 station gaps x 3 min = 15 min',
  text('m57-transfer-msg').indexOf('15 分钟') >= 0 &&
  text('m57-transfer-msg').indexOf('你猜对了') >= 0);
click('m57-transfer-level-1');
click('m57-transfer-guess-b');
click('m57-transfer-swap');
check('m57-transfer: 5 bell strikes have 4 gaps x 3s = 12s',
  text('m57-transfer-msg').indexOf('12 秒') >= 0);
click('m57-transfer-level-2');
click('m57-transfer-guess-a');
click('m57-transfer-swap');
check('m57-transfer: 10 lamps have 9 gaps x 20m = 180m',
  text('m57-transfer-msg').indexOf('180 米') >= 0);

// ---------- 5.8 ----------
click('m58-game-guess-b');
click('m58-game-calc');
check('m58-game: picking 12 gives opponent 16 factor points',
  text('m58-game-msg').indexOf('16 分') >= 0 &&
  text('m58-game-msg').indexOf('你猜对了') >= 0);
click('m58-game-level-1');
click('m58-game-guess-a');
click('m58-game-calc');
check('m58-game: picking prime 7 gives opponent only 1 point',
  text('m58-game-msg').indexOf('只有 1 分') >= 0);

click('m58-sieve-guess-b');
click('m58-sieve-s-1');
click('m58-sieve-s-2');
click('m58-sieve-s-3');
click('m58-sieve-s-5');
click('m58-sieve-s-7');
click('m58-sieve-count');
check('m58-sieve: 25 primes remain from 1 to 100',
  text('m58-sieve-msg').indexOf('25 个质数') >= 0 &&
  text('m58-sieve-msg').indexOf('你猜对了') >= 0);
click('m58-sieve-level-2');
click('m58-sieve-guess-a');
click('m58-sieve-s-1');
click('m58-sieve-s-2');
click('m58-sieve-s-3');
click('m58-sieve-s-5');
click('m58-sieve-s-7');
click('m58-sieve-count');
check('m58-sieve: stop at 7 because 11x11=121 exceeds 100',
  text('m58-sieve-msg').indexOf('25 个质数') >= 0);

// ---------- 5.9 ----------
click('m59-net-guess-a');
click('m59-net-fold');
click('m59-net-fold');
click('m59-net-fold');
click('m59-net-fold');
click('m59-net-fold');
click('m59-net-fold');
check('m59-net: 5x4x3 surface is 94',
  text('m59-net-msg').indexOf('94 平方厘米') >= 0 &&
  text('m59-net-msg').indexOf('你猜对了') >= 0);
click('m59-net-level-1');
click('m59-net-guess-a');
click('m59-net-fold');
click('m59-net-fold');
click('m59-net-fold');
click('m59-net-fold');
click('m59-net-fold');
click('m59-net-fold');
check('m59-net: cube edge 4 surface is 96',
  text('m59-net-msg').indexOf('96 平方厘米') >= 0);

click('m59-surface-guess-a');
click('m59-surface-p-0');
click('m59-surface-p-1');
click('m59-surface-p-2');
click('m59-surface-sum');
check('m59-surface: 5x4x3 pairs 30+24+40 = 94',
  text('m59-surface-msg').indexOf('30+24+40=94') >= 0 &&
  text('m59-surface-msg').indexOf('你猜对了') >= 0);
click('m59-surface-level-2');
click('m59-surface-guess-a');
click('m59-surface-p-0');
click('m59-surface-p-1');
click('m59-surface-p-2');
click('m59-surface-sum');
check('m59-surface: 6x3x2 pairs 24+12+36 = 72',
  text('m59-surface-msg').indexOf('24+12+36=72') >= 0);

// ---------- 5.11 ----------
click('m511-lcd-guess-b');
click('m511-lcd-lcm');
click('m511-lcd-conv');
click('m511-lcd-add');
check('m511-lcd: 1/8+1/24 = 4/24 = 1/6',
  text('m511-lcd-msg').indexOf('4/24') >= 0 &&
  text('m511-lcd-msg').indexOf('你猜对了') >= 0);
click('m511-lcd-level-2');
click('m511-lcd-guess-b');
click('m511-lcd-lcm');
click('m511-lcd-conv');
click('m511-lcd-add');
check('m511-lcd: 5/6+3/8 = 29/24',
  text('m511-lcd-msg').indexOf('29/24') >= 0);

click('m511-trap-guess-b');
click('m511-trap-wrong');
check('m511-trap: wrong 2/5 is smaller than 1/2',
  text('m511-trap-msg').indexOf('比 1/2 还小') >= 0);
click('m511-trap-right');
check('m511-trap: 1/2+1/3 = 5/6',
  text('m511-trap-msg').indexOf('5/6') >= 0 &&
  text('m511-trap-msg').indexOf('你猜对了') >= 0);
click('m511-trap-level-1');
click('m511-trap-guess-b');
click('m511-trap-wrong');
click('m511-trap-right');
check('m511-trap: 1/2+1/4 = 3/4',
  text('m511-trap-msg').indexOf('3/4') >= 0);

// ---------- 5.12 ----------
click('m512-three-guess-no');
click('m512-three-turn');
check('m512-three: cannot rotate with elements missing',
  text('m512-three-msg').indexOf('还缺') >= 0);
click('m512-three-c-center');
click('m512-three-d-cw');
click('m512-three-a-90');
click('m512-three-turn');
check('m512-three: center+clockwise+90 rotates the triangle',
  text('m512-three-msg').indexOf('90°') >= 0 &&
  text('m512-three-msg').indexOf('你猜对了') >= 0);
click('m512-three-level-1');
click('m512-three-guess-no');
click('m512-three-c-vertex');
click('m512-three-d-ccw');
click('m512-three-a-90');
click('m512-three-turn');
check('m512-three: vertex+counterclockwise+90 rotates the triangle',
  text('m512-three-msg').indexOf('逆时针') >= 0 &&
  text('m512-three-msg').indexOf('90°') >= 0);

click('m512-clock-guess-b');
click('m512-clock-dial');
check('m512-clock: minute hand 12 to 3 is 90 degrees',
  text('m512-clock-msg').indexOf('90°') >= 0 &&
  text('m512-clock-msg').indexOf('你猜对了') >= 0);
click('m512-clock-level-1');
click('m512-clock-guess-b');
click('m512-clock-dial');
check('m512-clock: minute hand 12 to 6 is 180 degrees',
  text('m512-clock-msg').indexOf('180°') >= 0);

// ---------- 5.13 ----------
click('m513-slope-guess-b');
click('m513-slope-seg-45');
check('m513-slope: Apr to May rises 30 in 1 month',
  text('m513-slope-msg').indexOf('30 元') >= 0);
click('m513-slope-compare');
check('m513-slope: Apr to May rises the most',
  text('m513-slope-msg').indexOf('4→5 月涨了 30 元') >= 0 &&
  text('m513-slope-msg').indexOf('你猜对了') >= 0);
click('m513-slope-level-2');
click('m513-slope-guess-b');
click('m513-slope-seg-24');
click('m513-slope-seg-45');
click('m513-slope-compare');
check('m513-slope: same rise 30, Apr to May is faster',
  text('m513-slope-msg').indexOf('一样高') >= 0 &&
  text('m513-slope-msg').indexOf('4→5 月快') >= 0);

click('m513-table-guess-b');
click('m513-table-draw');
click('m513-table-list');
check('m513-table: 5 parts need 2 weighings',
  text('m513-table-msg').indexOf('5 个最少要称 2 次') >= 0 &&
  text('m513-table-msg').indexOf('你猜对了') >= 0);
click('m513-table-level-1');
click('m513-table-guess-b');
click('m513-table-draw');
click('m513-table-list');
check('m513-table: 27 parts need 3 weighings',
  text('m513-table-msg').indexOf('27 个最少要称 3 次') >= 0);
click('m513-table-level-2');
click('m513-table-guess-b');
click('m513-table-draw');
click('m513-table-list');
check('m513-table: 81 parts need 4 weighings',
  text('m513-table-msg').indexOf('81 个最少要称 4 次') >= 0);

click('m513-draw-guess-b');
click('m513-draw-plot');
click('m513-draw-plot');
click('m513-draw-plot');
click('m513-draw-plot');
click('m513-draw-plot');
click('m513-draw-plot');
click('m513-draw-steep');
check('m513-draw: height steepest at 11 to 12 years',
  text('m513-draw-msg').indexOf('11→12 岁') >= 0 &&
  text('m513-draw-msg').indexOf('你猜对了') >= 0);
click('m513-draw-level-1');
click('m513-draw-guess-b');
click('m513-draw-plot');
click('m513-draw-plot');
click('m513-draw-plot');
click('m513-draw-plot');
click('m513-draw-plot');
click('m513-draw-plot');
click('m513-draw-steep');
check('m513-draw: savings steepest at Apr to May',
  text('m513-draw-msg').indexOf('4→5 月') >= 0);

// ---------- 5.14 ----------
click('m514-guess-guess-no');
click('m514-guess-alt');
click('m514-guess-top');
check('m514-guess: same front view, different top view',
  text('m514-guess-msg').indexOf('前面一样') >= 0 &&
  text('m514-guess-msg').indexOf('你猜对了') >= 0);
click('m514-guess-level-1');
click('m514-guess-guess-no');
click('m514-guess-alt');
click('m514-guess-alt');
click('m514-guess-top');
check('m514-guess: front [1,2,1] also has several arrangements',
  text('m514-guess-msg').indexOf('前面一样') >= 0);

click('m514-three-guess-b');
click('m514-three-v-front');
check('m514-three: front fixes length and height, width unknown',
  text('m514-three-msg').indexOf('宽还不知道') >= 0);
click('m514-three-v-top');
click('m514-three-v-left');
check('m514-three: three views fix length 3, width 2, height 2',
  text('m514-three-msg').indexOf('长 3') >= 0 &&
  text('m514-three-msg').indexOf('你猜对了') >= 0);

click('m514-nums-guess-b');
click('m514-nums-build');
check('m514-nums: top-view numbers add to 4 cubes',
  text('m514-nums-msg').indexOf('一共 4 个') >= 0 &&
  text('m514-nums-msg').indexOf('你猜对了') >= 0);
click('m514-nums-level-1');
click('m514-nums-guess-b');
click('m514-nums-build');
check('m514-nums: top-view numbers add to 7 cubes',
  text('m514-nums-msg').indexOf('一共 7 个') >= 0);

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

// ---------- 4b. 6.1–6.8 / 6.11–6.14 interaction ----------
click('m61-overlap-guess-1');
click('m61-overlap-paint');
click('m61-overlap-take');
check('m61-overlap: 2/3 x 4/5 = 8/15',
  text('m61-overlap-msg').indexOf('8/15') >= 0 && text('m61-overlap-msg').indexOf('你猜对了') >= 0);
click('m61-overlap-level-1');
click('m61-overlap-guess-0');
click('m61-overlap-paint');
click('m61-overlap-take');
check('m61-overlap: level 1 is 3/4 x 2/5 = 3/10',
  text('m61-overlap-msg').indexOf('3/10') >= 0);

click('m61-scale-guess-1');
click('m61-scale-zoom');
check('m61-scale: 4/5 x 2/3 = 8/15 shrinks',
  text('m61-scale-msg').indexOf('8/15') >= 0 && text('m61-scale-msg').indexOf('你猜对了') >= 0);
click('m61-scale-level-2');
click('m61-scale-guess-1');
click('m61-scale-zoom');
check('m61-scale: level 2 is 6/5 x 3/2 = 9/5',
  text('m61-scale-msg').indexOf('9/5') >= 0);

click('m61-wall-guess-0');
click('m61-wall-measure');
check('m61-wall: 2/3 x 4/5 = 8/15',
  text('m61-wall-msg').indexOf('8/15') >= 0 && text('m61-wall-msg').indexOf('你猜对了') >= 0);
click('m61-wall-level-1');
click('m61-wall-guess-2');
click('m61-wall-measure');
check('m61-wall: level 1 is 1/2 x 3/4 = 3/8',
  text('m61-wall-msg').indexOf('3/8') >= 0);

click('m61-groups-guess-0');
click('m61-groups-join');
check('m61-groups: 3 x 2/5 = 6/5',
  text('m61-groups-msg').indexOf('6/5') >= 0 && text('m61-groups-msg').indexOf('你猜对了') >= 0);
click('m61-groups-level-2');
click('m61-groups-guess-2');
click('m61-groups-join');
check('m61-groups: level 2 is 5 x 2/3 = 10/3',
  text('m61-groups-msg').indexOf('10/3') >= 0);

click('m62-fit-guess-0');
for (let i = 0; i < 8; i++) click('m62-fit-cut');
check('m62-fit: 2 / 1/4 = 8',
  text('m62-fit-msg').indexOf('2 ÷ 1/4 = 8') >= 0 && text('m62-fit-msg').indexOf('你猜对了') >= 0);
click('m62-fit-level-2');
click('m62-fit-guess-2');
for (let i = 0; i < 3; i++) click('m62-fit-cut');
check('m62-fit: level 2 is 5/6 / 1/3 = 2又1/2',
  text('m62-fit-msg').indexOf('2又1/2') >= 0);

click('m62-recip-guess-0');
click('m62-recip-flip');
click('m62-recip-mul');
check('m62-recip: 3/4 / 1/2 = 3/2',
  text('m62-recip-msg').indexOf('3/2') >= 0 && text('m62-recip-msg').indexOf('你猜对了') >= 0);
click('m62-recip-level-2');
click('m62-recip-guess-0');
click('m62-recip-flip');
click('m62-recip-mul');
check('m62-recip: level 2 is 2/3 / 5/4 = 8/15',
  text('m62-recip-msg').indexOf('8/15') >= 0);

click('m62-area-guess-0');
click('m62-area-stretch');
check('m62-area: 3/4 / 1/2 = 3/2',
  text('m62-area-msg').indexOf('3/2') >= 0 && text('m62-area-msg').indexOf('你猜对了') >= 0);
click('m62-area-level-1');
click('m62-area-guess-1');
click('m62-area-stretch');
check('m62-area: level 1 is 5/6 / 2/3 = 5/4',
  text('m62-area-msg').indexOf('5/4') >= 0);

click('m62-jump-guess-0');
for (let i = 0; i < 8; i++) click('m62-jump-jump');
check('m62-jump: 2 / 1/4 = 8 jumps',
  text('m62-jump-msg').indexOf('2 ÷ 1/4 = 8') >= 0 && text('m62-jump-msg').indexOf('你猜对了') >= 0);
click('m62-jump-level-2');
click('m62-jump-guess-2');
for (let i = 0; i < 4; i++) click('m62-jump-jump');
check('m62-jump: level 2 is 7/4 / 1/2 = 3又1/2',
  text('m62-jump-msg').indexOf('3又1/2') >= 0);

click('m63-bearing-guess-0');
click('m63-bearing-turn');
check('m63-bearing: 北偏东 30° = 30°',
  text('m63-bearing-msg').indexOf('30°') >= 0 && text('m63-bearing-msg').indexOf('你猜对了') >= 0);
click('m63-bearing-level-1');
click('m63-bearing-guess-1');
click('m63-bearing-turn');
check('m63-bearing: level 1 is 南偏西 25° = 205°',
  text('m63-bearing-msg').indexOf('205°') >= 0);

click('m63-route-guess-0');
click('m63-route-guess-1');
check('m63-route: school to park first try',
  text('m63-route-msg').indexOf('一次全对') >= 0);
click('m63-route-level-1');
click('m63-route-guess-0');
click('m63-route-guess-0');
check('m63-route: level 1 home to school first try',
  text('m63-route-msg').indexOf('一次全对') >= 0);

click('m63-opposite-guess-0');
click('m63-opposite-flip');
check('m63-opposite: 南偏东 60° reverses to 北偏西 60°',
  text('m63-opposite-msg').indexOf('北偏西 60°') >= 0 && text('m63-opposite-msg').indexOf('你猜对了') >= 0);
click('m63-opposite-level-2');
click('m63-opposite-guess-2');
click('m63-opposite-flip');
check('m63-opposite: level 2 is 南偏西 30° reverses to 北偏东 30°',
  text('m63-opposite-msg').indexOf('北偏东 30°') >= 0);

click('m64-axis-guess-0');
click('m64-axis-plus');
click('m64-axis-plus');
click('m64-axis-check');
check('m64-axis: 2:3 of 50, front share 20',
  text('m64-axis-msg').indexOf('20元') >= 0 && text('m64-axis-msg').indexOf('你猜对了') >= 0);
click('m64-axis-level-2');
click('m64-axis-guess-2');
click('m64-axis-plus');
click('m64-axis-check');
check('m64-axis: level 2 is 1:4 of 125, front share 25',
  text('m64-axis-msg').indexOf('25毫升') >= 0);

click('m64-mix-guess-0');
click('m64-mix-a-plus');
click('m64-mix-a-plus');
click('m64-mix-b-plus');
click('m64-mix-b-plus');
click('m64-mix-b-plus');
click('m64-mix-b-plus');
click('m64-mix-mix');
check('m64-mix: 2:4 matches 1:2, same color',
  text('m64-mix-msg').indexOf('颜色一样') >= 0 && text('m64-mix-msg').indexOf('你猜对了') >= 0);
click('m64-mix-level-2');
click('m64-mix-guess-0');
for (let i = 0; i < 6; i++) click('m64-mix-a-plus');
for (let i = 0; i < 9; i++) click('m64-mix-b-plus');
click('m64-mix-mix');
check('m64-mix: level 2 strings 15 beads, 6 red',
  text('m64-mix-msg').indexOf('串好了') >= 0);

click('m65-grid-guess-0');
click('m65-grid-full');
click('m65-grid-part');
click('m65-grid-formula');
check('m65-grid: r=5 estimate 78, formula 78.5',
  text('m65-grid-msg').indexOf('78.5') >= 0 && text('m65-grid-msg').indexOf('你猜对了') >= 0);
click('m65-grid-level-1');
click('m65-grid-guess-1');
click('m65-grid-full');
click('m65-grid-part');
click('m65-grid-formula');
check('m65-grid: level 1 is r=3 formula 28.26',
  text('m65-grid-msg').indexOf('28.26') >= 0);

click('m65-sector-guess-0');
click('m65-sector-cut');
check('m65-sector: 90° is 1/4, area 12.56',
  text('m65-sector-msg').indexOf('12.56') >= 0 && text('m65-sector-msg').indexOf('你猜对了') >= 0);
click('m65-sector-level-2');
click('m65-sector-guess-1');
click('m65-sector-cut');
check('m65-sector: level 2 is 60° is 1/6, area 18.84',
  text('m65-sector-msg').indexOf('18.84') >= 0);

click('m66-convert-guess-0');
click('m66-convert-match');
check('m66-convert: 1/4 = 0.25 = 25%',
  text('m66-convert-msg').indexOf('25%') >= 0 && text('m66-convert-msg').indexOf('你猜对了') >= 0);
click('m66-convert-level-2');
click('m66-convert-guess-1');
click('m66-convert-match');
check('m66-convert: level 2 is 7/20 = 0.35 = 35%',
  text('m66-convert-msg').indexOf('35%') >= 0);

click('m66-axis-guess-0');
for (let i = 0; i < 4; i++) click('m66-axis-plus');
click('m66-axis-check');
check('m66-axis: 80 up 25% is 100',
  text('m66-axis-msg').indexOf('100元') >= 0 && text('m66-axis-msg').indexOf('你猜对了') >= 0);
click('m66-axis-level-1');
click('m66-axis-guess-1');
for (let i = 0; i < 4; i++) click('m66-axis-plus');
click('m66-axis-check');
check('m66-axis: level 1 is 200 down 20% is 160',
  text('m66-axis-msg').indexOf('160元') >= 0);

click('m66-estimate-guess-0');
click('m66-estimate-calc');
check('m66-estimate: 398 x 21 is 8358',
  text('m66-estimate-msg').indexOf('8358') >= 0 && text('m66-estimate-msg').indexOf('你猜对了') >= 0);
click('m66-estimate-level-2');
click('m66-estimate-guess-1');
click('m66-estimate-calc');
check('m66-estimate: level 2 is 19.8 x 5.1 is 100.98',
  text('m66-estimate-msg').indexOf('100.98') >= 0);

click('m67a-parts-guess-0');
click('m67a-parts-per');
click('m67a-parts-draw');
check('m67a-parts: 36 people, 10° each',
  text('m67a-parts-msg').indexOf('每人 10°') >= 0 && text('m67a-parts-msg').indexOf('你猜对了') >= 0);
click('m67a-parts-level-2');
click('m67a-parts-guess-2');
click('m67a-parts-per');
click('m67a-parts-draw');
check('m67a-parts: level 2 is 30 people, 12° each',
  text('m67a-parts-msg').indexOf('每人 12°') >= 0);

click('m67a-triple-guess-0');
click('m67a-triple-say-frac');
click('m67a-triple-say-pct');
click('m67a-triple-say-deg');
check('m67a-triple: 1/4 = 25% = 90°',
  text('m67a-triple-msg').indexOf('90°') >= 0 && text('m67a-triple-msg').indexOf('你猜对了') >= 0);
click('m67a-triple-level-1');
click('m67a-triple-guess-1');
click('m67a-triple-say-frac');
click('m67a-triple-say-pct');
click('m67a-triple-say-deg');
check('m67a-triple: level 1 is 3/10 = 30% = 108°',
  text('m67a-triple-msg').indexOf('108°') >= 0);

click('m67a-reverse-guess-0');
click('m67a-reverse-solve');
check('m67a-reverse: 120° is 33.3%, 30 people',
  text('m67a-reverse-msg').indexOf('33.3%') >= 0 && text('m67a-reverse-msg').indexOf('你猜对了') >= 0);
click('m67a-reverse-level-2');
click('m67a-reverse-guess-1');
click('m67a-reverse-solve');
check('m67a-reverse: level 2 is 144° is 40%, 80 people',
  text('m67a-reverse-msg').indexOf('40%') >= 0);

click('m67b-stack-guess-0');
for (let i = 0; i < 4; i++) click('m67b-stack-add');
check('m67b-stack: 4 layers total 10',
  text('m67b-stack-msg').indexOf('10 个') >= 0 && text('m67b-stack-msg').indexOf('你猜对了') >= 0);
click('m67b-stack-level-1');
click('m67b-stack-guess-1');
for (let i = 0; i < 5; i++) click('m67b-stack-add');
check('m67b-stack: level 1 is 5 layers total 15',
  text('m67b-stack-msg').indexOf('15 个') >= 0);

click('m67b-diff-guess-0');
click('m67b-diff-list');
check('m67b-diff: 1,4,9,16 next is 25',
  text('m67b-diff-msg').indexOf('25') >= 0 && text('m67b-diff-msg').indexOf('你猜对了') >= 0);
click('m67b-diff-level-2');
click('m67b-diff-guess-1');
click('m67b-diff-list');
check('m67b-diff: level 2 is 2,6,12,20 next is 30',
  text('m67b-diff-msg').indexOf('30') >= 0);

click('m67b-algebra-guess-0');
click('m67b-algebra-wrap');
check('m67b-algebra: 4² = 3² + 7 = 16',
  text('m67b-algebra-msg').indexOf('16') >= 0 && text('m67b-algebra-msg').indexOf('你猜对了') >= 0);
click('m67b-algebra-level-1');
click('m67b-algebra-guess-1');
click('m67b-algebra-wrap');
check('m67b-algebra: level 1 is 5² = 4² + 9 = 25',
  text('m67b-algebra-msg').indexOf('25') >= 0);

click('m68-life-guess-0');
click('m68-life-compare');
check('m68-life: -5 < -2, owes more',
  text('m68-life-msg').indexOf('−5 ＜ −2') >= 0 && text('m68-life-msg').indexOf('你猜对了') >= 0);
click('m68-life-level-2');
click('m68-life-guess-2');
click('m68-life-compare');
check('m68-life: level 2 is -3 < -1, floor -3 lower',
  text('m68-life-msg').indexOf('−3 ＜ −1') >= 0);

click('m611-unfold-guess-0');
click('m611-unfold-peel');
check('m611-unfold: r=3 side area 75.36',
  text('m611-unfold-msg').indexOf('75.36') >= 0 && text('m611-unfold-msg').indexOf('你猜对了') >= 0);
click('m611-unfold-level-1');
click('m611-unfold-guess-1');
click('m611-unfold-peel');
check('m611-unfold: level 1 is r=2 side area 62.8',
  text('m611-unfold-msg').indexOf('62.8') >= 0);

click('m611-layers-guess-0');
for (let i = 0; i < 5; i++) click('m611-layers-add');
check('m611-layers: r=2 h=5 volume 62.8',
  text('m611-layers-msg').indexOf('62.8') >= 0 && text('m611-layers-msg').indexOf('你猜对了') >= 0);
click('m611-layers-level-2');
click('m611-layers-guess-2');
for (let i = 0; i < 3; i++) click('m611-layers-add');
check('m611-layers: level 2 is r=4 h=3 volume 150.72',
  text('m611-layers-msg').indexOf('150.72') >= 0);

click('m611-spin-guess-0');
click('m611-spin-spin');
check('m611-spin: rectangle spins into cylinder',
  text('m611-spin-msg').indexOf('圆柱') >= 0 && text('m611-spin-msg').indexOf('你猜对了') >= 0);
click('m611-spin-level-1');
click('m611-spin-guess-1');
click('m611-spin-spin');
check('m611-spin: level 1 is triangle spins into cone',
  text('m611-spin-msg').indexOf('圆锥') >= 0);

click('m612-axis-guess-0');
for (let i = 0; i < 4; i++) click('m612-axis-plus');
click('m612-axis-check');
check('m612-axis: 4 kg apples cost 20',
  text('m612-axis-msg').indexOf('20元') >= 0 && text('m612-axis-msg').indexOf('你猜对了') >= 0);
click('m612-axis-level-2');
click('m612-axis-guess-1');
for (let i = 0; i < 3; i++) click('m612-axis-plus');
click('m612-axis-check');
check('m612-axis: level 2 is 9 books cost 36',
  text('m612-axis-msg').indexOf('36元') >= 0);

click('m612-graph-guess-0');
for (let i = 0; i < 3; i++) click('m612-graph-plot');
click('m612-graph-link');
check('m612-graph: y=2x points make a line through origin',
  text('m612-graph-msg').indexOf('过原点的直线') >= 0 && text('m612-graph-msg').indexOf('你猜对了') >= 0);
click('m612-graph-level-1');
click('m612-graph-guess-1');
for (let i = 0; i < 5; i++) click('m612-graph-plot');
click('m612-graph-link');
check('m612-graph: level 1 is xy=12 points make a curve',
  text('m612-graph-msg').indexOf('弯的曲线') >= 0);

click('m612-rect-guess-0');
click('m612-rect-len-1');
check('m612-rect: area 24, length 8 width 3',
  text('m612-rect-msg').indexOf('宽是 3') >= 0 && text('m612-rect-msg').indexOf('你猜对了') >= 0);
click('m612-rect-level-1');
click('m612-rect-guess-1');
click('m612-rect-len-2');
check('m612-rect: level 1 is area 36, length 12 width 3',
  text('m612-rect-msg').indexOf('宽是 3') >= 0);

click('m612-scale-guess-0');
click('m612-scale-dist-2');
check('m612-scale: 1:100000, 3 cm is 3 km',
  text('m612-scale-msg').indexOf('3 千米') >= 0 && text('m612-scale-msg').indexOf('你猜对了') >= 0);
click('m612-scale-level-2');
click('m612-scale-guess-2');
click('m612-scale-dist-1');
check('m612-scale: level 2 is 1:200000, 2.5 cm is 5 km',
  text('m612-scale-msg').indexOf('5 千米') >= 0);

click('m613-worst-guess-0');
for (let i = 0; i < 4; i++) click('m613-worst-draw');
check('m613-worst: 3 colors need 4 draws to guarantee a pair',
  text('m613-worst-msg').indexOf('摸 4 个') >= 0 && text('m613-worst-msg').indexOf('你猜对了') >= 0);
click('m613-worst-level-2');
click('m613-worst-guess-1');
for (let i = 0; i < 7; i++) click('m613-worst-draw');
check('m613-worst: level 2 is 3 colors need 7 draws for 3 alike',
  text('m613-worst-msg').indexOf('摸 7 个') >= 0);

click('m613-remainder-guess-0');
click('m613-remainder-sort');
check('m613-remainder: 7 and 15 share remainder 3 mod 4',
  text('m613-remainder-msg').indexOf('7 和 15') >= 0 && text('m613-remainder-msg').indexOf('你猜对了') >= 0);
click('m613-remainder-level-1');
click('m613-remainder-guess-1');
click('m613-remainder-sort');
check('m613-remainder: level 1 is 5 and 11 share remainder mod 3',
  text('m613-remainder-msg').indexOf('5 和 11') >= 0);

click('m613-pairs-guess-0');
for (let i = 0; i < 9; i++) click('m613-pairs-flip');
check('m613-pairs: 8 pairs need 9 flips to guarantee a match',
  text('m613-pairs-msg').indexOf('翻 9 张') >= 0 && text('m613-pairs-msg').indexOf('你猜对了') >= 0);
click('m613-pairs-level-1');
click('m613-pairs-guess-1');
for (let i = 0; i < 6; i++) click('m613-pairs-flip');
check('m613-pairs: level 1 is 5 pairs need 6 flips',
  text('m613-pairs-msg').indexOf('翻 6 张') >= 0);

click('m614-map-q-0');
click('m614-map-m-0');
click('m614-map-q-1');
click('m614-map-m-1');
click('m614-map-q-2');
click('m614-map-m-2');
check('m614-map: all 3 links correct first try',
  text('m614-map-msg').indexOf('三条全连对了') >= 0);
click('m614-map-level-2');
click('m614-map-q-0');
click('m614-map-m-0');
click('m614-map-q-1');
click('m614-map-m-1');
click('m614-map-q-2');
click('m614-map-m-2');
check('m614-map: level 2 all 3 links correct first try',
  text('m614-map-msg').indexOf('三条全连对了') >= 0);

click('m614-multi-guess-1');
click('m614-multi-way-0');
click('m614-multi-way-1');
click('m614-multi-way-2');
check('m614-multi: rope problem, whole method fastest',
  text('m614-multi-msg').indexOf('整体最快') >= 0 && text('m614-multi-msg').indexOf('你猜对了') >= 0);
click('m614-multi-level-1');
click('m614-multi-guess-0');
click('m614-multi-way-0');
click('m614-multi-way-1');
click('m614-multi-way-2');
check('m614-multi: level 1 is parts method fastest',
  text('m614-multi-msg').indexOf('份数法最快') >= 0);

click('m614-cause-cause-0');
click('m614-cause-cause-1');
click('m614-cause-cause-2');
check('m614-cause: all 3 errors classified first try',
  text('m614-cause-msg').indexOf('三道全分对了') >= 0);
click('m614-cause-level-1');
click('m614-cause-cause-0');
click('m614-cause-cause-1');
click('m614-cause-cause-2');
check('m614-cause: level 1 all 3 classified first try',
  text('m614-cause-msg').indexOf('三道全分对了') >= 0);

click('m614-space-guess-0');
click('m614-space-day-2');
click('m614-space-check');
check('m614-space: 3 days later without review only 3 words left',
  text('m614-space-msg').indexOf('只剩 3 个') >= 0 && text('m614-space-msg').indexOf('你猜对了') >= 0);
click('m614-space-level-2');
click('m614-space-guess-0');
click('m614-space-day-1');
click('m614-space-check');
check('m614-space: level 2 is day 1 review most useful',
  text('m614-space-msg').indexOf('第 1 天复习最有用') >= 0);

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
