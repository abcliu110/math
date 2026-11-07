// Smoke tests for apps/web/anims-band-7-9.js (7.1–7.16, 48 animations).
// Minimal DOM stub + real registerAnim in a vm; no app.js needed because
// render() guards its app.js helpers with typeof checks — the stub versions
// below record calls so wiring (tiers / discovery / markTried) is verified.
// Run: node tools/smoke-anims-band-7-9.js   (exit 0 = all pass)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let pass = 0, fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('FAIL  ' + name); }
}

const root = path.resolve(__dirname, '..');

// ---------- minimal DOM stub (same shape as tools/smoke.js) ----------
const byId = {};
function makeEl(tag) {
  const el = {
    tagName: (tag || 'div').toUpperCase(),
    children: [], dataset: {}, style: {}, hidden: false, _handlers: {},
    className: '', textContent: '', innerHTML: '', parentNode: null, value: '',
    classList: { _s: new Set(),
      add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); },
      toggle(c, f) { if (f === undefined) f = !this._s.has(c); if (f) this._s.add(c); else this._s.delete(c); return f; },
      contains(c) { return this._s.has(c); } },
    setAttribute(k, v) { this['attr:' + k] = String(v); },
    getAttribute(k) { return this['attr:' + k]; },
    addEventListener(t, fn) { (this._handlers[t] = this._handlers[t] || []).push(fn); },
    appendChild(c) { this.children.push(c); c.parentNode = this; return c; },
    removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); c.parentNode = null; return c; },
    get firstChild() { return this.children[0] || null; },
  };
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
function click(el) { (el._handlers.click || []).forEach(f => f({ target: el })); }
function input(el, value) {
  el.value = value;
  (el._handlers.input || []).forEach(f => f({ target: el }));
}
function childByText(parent, text) {
  return parent.children.find(function (c) { return c.textContent === text; });
}

// ---------- stub app.js helpers (record calls) ----------
const triedKeys = [];
const tiersDone = [];
const discoveries = [];
const sandbox = {
  document: documentStub, console, Math, JSON, Object, Array, String, Number,
  parseInt, parseFloat, isNaN,
  markTried(k) { triedKeys.push(k); },
  makeTiers(el, labels, persistKey) {
    return {
      done(i) { tiersDone.push(persistKey + ':' + i); },
      set(i, on) { if (on) tiersDone.push(persistKey + ':' + i); },
    };
  },
  wireDiscovery(demoKey, inputId, btnId, outId) {
    discoveries.push(demoKey);
    documentStub.getElementById(inputId);
    documentStub.getElementById(outId);
    const btn = documentStub.getElementById(btnId);
    btn.addEventListener('click', function () {
      const inp = documentStub.getElementById(inputId);
      const out = documentStub.getElementById(outId);
      out.textContent = '记下来了：' + (inp.value || '');
    });
  },
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'apps/web/anims-registry.js'), 'utf8'), sandbox, { filename: 'anims-registry.js' });
// 缺文件守卫（仿 smoke.js 的 fs.existsSync 写法）：band 文件不存在时检查失败、
// 整个进程不要崩掉——没有这道守卫，readFileSync 会直接抛错退出。
const bandPath = path.join(root, 'apps/web/anims-band-7-9.js');
if (!fs.existsSync(bandPath)) {
  check('anims-band-7-9.js exists', false);
  console.log('\nsmoke-anims-band-7-9: ' + pass + ' passed, ' + fail + ' failed (band file missing)');
  process.exit(1);
}
vm.runInContext(fs.readFileSync(bandPath, 'utf8'), sandbox, { filename: 'anims-band-7-9.js' });
const REG = sandbox.ANIM_REGISTRY;

// ---------- grade-7 point ids (must really exist) ----------
const g7src = fs.readFileSync(path.join(root, 'content/grades/grade-7.js'), 'utf8');
const g7ids = new Set();
let m;
const idRe = /id\s*:\s*["'](\d+\.\d+[a-z]?)["']/g;
while ((m = idRe.exec(g7src)) !== null) g7ids.add(m[1]);

const EXPECTED = [
  ['m71-numline', '7.1', '数轴距离法', '模拟'],
  ['m71-scene', '7.1', '真实情境法', '实验'],
  ['m71-mirror', '7.1', '相反数镜像法', '模拟'],
  ['m72-walk', '7.2', '数轴走路法', '模拟'],
  ['m72-chips', '7.2', '正负筹码抵消法', '实验'],
  ['m72-subadd', '7.2', '减法变加法', '演示'],
  ['m73-debt', '7.3', '欠款账本法', '模拟'],
  ['m73-fold', '7.3', '对折翻倍法', '实验'],
  ['m73-scinote', '7.3', '小数点移动法', '模拟'],
  ['m74-tiles', '7.4', '代数瓷砖法', '模拟'],
  ['m74-parts', '7.4', '拆零件法', '演示'],
  ['m74-area', '7.4', '面积模型法', '模拟'],
  ['m75-merge', '7.5', '同类瓷砖合并法', '实验'],
  ['m75-bracket', '7.5', '去括号翻面法', '模拟'],
  ['m75-distrib', '7.5', '分配律面积法', '模拟'],
  ['m76-balance', '7.6', '天平平衡法', '实验'],
  ['m76-inverse', '7.6', '逆运算倒推法', '演示'],
  ['m76-boxes', '7.6', '方块消元法', '模拟'],
  ['m77-puzzle', '7.7', '等量关系拼图', '实验'],
  ['m77-table', '7.7', '表格建模法', '模拟'],
  ['m77-guess', '7.7', '天平试值法', '实验'],
  ['m78-motion', '7.8', '点线面体运动法', '演示'],
  ['m78-rope', '7.8', '拉绳比长法', '实验'],
  ['m78-count', '7.8', '计数法', '实验'],
  ['m79-joint', '7.9', '张角拼图法', '模拟'],
  ['m79-overlap', '7.9', '叠合比较法', '实验'],
  ['m79-protractor', '7.9', '量角器/钟表读数法', '模拟'],
  ['m710-drag', '7.10', '拖动发现法', '模拟'],
  ['m710-suppl', '7.10', '补角推理法', '演示'],
  ['m710-perp', '7.10', '垂线段最短比较法', '实验'],
  ['m711-fzc', '7.11', '亮灯辨角法', '模拟'],
  ['m711-slide', '7.11', '滑杆拖动法', '模拟'],
  ['m711-aux', '7.11', '辅助线法', '实验'],
  ['m712-diag', '7.12', '对角线定位法', '模拟'],
  ['m712-contra', '7.12', '反证法', '演示'],
  ['m712-approx', '7.12', '逼近法', '模拟'],
  ['m713-addr', '7.13', '编地址法', '实验'],
  ['m713-quad', '7.13', '象限符号法', '模拟'],
  ['m713-sym', '7.13', '对称跳点法', '实验'],
  ['m714-graph', '7.14', '图像交点法', '模拟'],
  ['m714-subst', '7.14', '代入消元法', '演示'],
  ['m714-elim', '7.14', '加减消元法', '实验'],
  ['m715-seg', '7.15', '数轴画段法', '模拟'],
  ['m715-flip', '7.15', '翻面验证法', '实验'],
  ['m715-overlap', '7.15', '公共部分重叠法', '模拟'],
  ['m716-bins', '7.16', '分桶计数法', '实验'],
  ['m716-sample', '7.16', '随机抽样模拟法', '模拟'],
  ['m716-dotvs', '7.16', '点图 vs 直方图对比法', '模拟'],
];
check('48 animations registered', Object.keys(REG).length === 48);
EXPECTED.forEach(function (e) {
  const a = REG[e[0]];
  check(e[0] + ' registered with title/grade/kind/points',
    !!a && a.title.indexOf(e[2]) === 0 && a.grade === 7 && a.kind === e[3] &&
    JSON.stringify(a.points) === JSON.stringify([e[1]]) &&
    typeof a.render === 'function' && g7ids.has(e[1]));
});

// 改前代码（空骨架）上：上面的注册检查会 FAIL，这里直接退出，
// 后面的走查不再跑——否则 childByText 会拿到 undefined 而抛错，
// 那就不是“干净失败”而是整脚本崩掉。
if (Object.keys(REG).length !== 48) {
  console.log('\nsmoke-anims-band-7-9: ' + pass + ' passed, ' + fail + ' failed (registry incomplete, play-throughs skipped)');
  process.exit(1);
}

// ---------- render each one: no throw, expected content, wiring ----------
const containers = {};
EXPECTED.forEach(function (e) {
  const K = e[0];
  const el = makeEl('div');
  containers[K] = el;
  let threw = null;
  try { REG[K].render(el); } catch (err) { threw = err; }
  check(K + ' render runs without throwing', threw === null);
  if (threw) return;
  check(K + ' renders title + guess + tiers + discovery',
    el.innerHTML.indexOf(REG[K].title) >= 0 &&
    el.innerHTML.indexOf('先猜') >= 0 &&
    !!byId[K + '-tiers'] && !!byId[K + '-find'] && !!byId[K + '-find-save']);
  check(K + ' tiers + discovery wired', discoveries.indexOf(K) >= 0);
});
function gid(id) { return documentStub.getElementById(id); }
function msgOf(K) { return (gid(K + '-msg') || {}).textContent || ''; }

// ---------- scripted play-throughs: guess -> play -> verdict ----------
// 7.1
click(gid('m71-numline-g0')); input(gid('m71-numline-slider'), '-3');
check('m71-numline: guess + drag to -3 gives |−3| = 3', msgOf('m71-numline').indexOf('到了 -3') >= 0 && msgOf('m71-numline').indexOf('绝对值是 3') >= 0);
click(gid('m71-scene-guess-left')); click(childByText(gid('m71-scene-ticks'), '-3'));
check('m71-scene: 零下 3℃ placed at -3', msgOf('m71-scene').indexOf('放在 -3 对了') >= 0);
click(gid('m71-mirror-g0')); click(gid('m71-mirror-mirror-btn'));
check('m71-mirror: 4 的相反数是 -4', msgOf('m71-mirror').indexOf('相反数是 -4') >= 0);
// 7.2
click(gid('m72-walk-g0')); click(gid('m72-walk-walk-btn'));
check('m72-walk: 2 + 3 = 5', msgOf('m72-walk').indexOf('2 + (+3) = 5') >= 0);
click(gid('m72-chips-g0'));
click(gid('m72-chips-add-pos')); click(gid('m72-chips-add-pos')); click(gid('m72-chips-add-pos'));
click(gid('m72-chips-add-neg')); click(gid('m72-chips-add-neg'));
click(gid('m72-chips-cancel')); click(gid('m72-chips-check'));
check('m72-chips: 3 + (-2) = 1 after zero-pair cancel', msgOf('m72-chips').indexOf('3 + (-2) = 1') >= 0);
click(gid('m72-subadd-g0')); click(gid('m72-subadd-flip-btn'));
check('m72-subadd: 5 - 3 = 5 + (-3), same value', msgOf('m72-subadd').indexOf('一模一样') >= 0);
// 7.3
click(gid('m73-debt-g0'));
click(gid('m73-debt-add-btn')); click(gid('m73-debt-add-btn')); click(gid('m73-debt-add-btn'));
click(gid('m73-debt-check'));
check('m73-debt: (-2)×3 = -6 on the ledger', msgOf('m73-debt').indexOf('对上了') >= 0 && msgOf('m73-debt').indexOf('-6') >= 0);
click(gid('m73-fold-g0')); input(gid('m73-fold-slider'), '3');
check('m73-fold: 3 folds = 8 layers', msgOf('m73-fold').indexOf('8 层') >= 0);
click(gid('m73-scinote-g0'));
click(gid('m73-scinote-left')); click(gid('m73-scinote-left')); click(gid('m73-scinote-left')); click(gid('m73-scinote-left'));
check('m73-scinote: 38000 = 3.8×10^4', gid('m73-scinote-sci').textContent.indexOf('3.8 × 10 的 4 次方') >= 0);
// 7.4
click(gid('m74-tiles-g0'));
for (let i = 0; i < 5; i++) click(gid('m74-tiles-add-x'));
click(gid('m74-tiles-merge'));
check('m74-tiles: 2x + 3x counted as 5x', msgOf('m74-tiles').indexOf('2x + 3x = 5x') >= 0);
click(gid('m74-parts-g0')); click(gid('m74-parts-open-btn'));
check('m74-parts: 3x² splits to 3 × x × x, coef 3, degree 2',
  gid('m74-parts-parts').textContent === '3 × x × x' &&
  gid('m74-parts-coef').textContent === '3' && gid('m74-parts-deg').textContent === '2');
click(gid('m74-area-g0')); input(gid('m74-area-slider'), '2');
check('m74-area: x = 2, x² = 2x = 4', msgOf('m74-area').indexOf('一样大') >= 0 && gid('m74-area-v2').textContent === '4');
// 7.5
click(gid('m75-merge-g0'));
for (let i = 0; i < 5; i++) click(gid('m75-merge-add-a'));
click(gid('m75-merge-merge'));
check('m75-merge: 3a + 2a = 5a', msgOf('m75-merge').indexOf('3a + 2a = 5a') >= 0);
click(gid('m75-bracket-g0')); click(gid('m75-bracket-pass-btn'));
check('m75-bracket: +(2x - 3) = 2x - 3', gid('m75-bracket-after').textContent === '2x - 3');
click(gid('m75-distrib-g0')); click(gid('m75-distrib-split-btn'));
check('m75-distrib: 2(3x - 1) = 6x - 2', gid('m75-distrib-after').textContent === '6x - 2');
// 7.6
click(gid('m76-balance-g0')); click(gid('m76-balance-op-sub'));
check('m76-balance: x + 5 = 12 -> x = 7 by subtracting both sides',
  gid('m76-balance-eq').textContent === 'x = 7' && msgOf('m76-balance').indexOf('x = 7') >= 0);
click(gid('m76-inverse-g0')); click(gid('m76-inverse-peel-btn'));
check('m76-inverse: 3x = 15 -> x = 5', gid('m76-inverse-now').textContent === 'x = 5');
click(gid('m76-boxes-g0'));
click(gid('m76-boxes-take-unit')); click(gid('m76-boxes-take-unit'));
check('m76-boxes: x + 2 = 5 -> x = 3', msgOf('m76-boxes').indexOf('x = 3') >= 0);
// m76-balance “两边同加”文案：b>0 时“加 -5”改成自然的“减 5”，b<0 时仍是“加 4”。
click(gid('m76-balance-level-1')); click(gid('m76-balance-g0')); click(gid('m76-balance-op-add'));
check('m76-balance: add-a-negative reads as subtract (b=3 -> 减 3, not 加 -3)',
  msgOf('m76-balance').indexOf('两边同时减 3') >= 0 && msgOf('m76-balance').indexOf('加 -3') < 0);
click(gid('m76-balance-level-2')); click(gid('m76-balance-g0')); click(gid('m76-balance-op-add'));
check('m76-balance: adding a positive still reads as add (b=-4 -> 加 4)',
  msgOf('m76-balance').indexOf('两边同时加 4') >= 0);
// 7.7
click(gid('m77-puzzle-g0'));
click(childByText(gid('m77-puzzle-cards'), '3 支笔的钱'));
click(childByText(gid('m77-puzzle-cards'), '12 元'));
for (let i = 0; i < 4; i++) click(gid('m77-puzzle-plus'));
click(gid('m77-puzzle-solve'));
check('m77-puzzle: 3x = 12 -> x = 4', msgOf('m77-puzzle').indexOf('x = 4') >= 0);
click(gid('m77-table-g0'));
click(gid('m77-table-fill-0')); click(gid('m77-table-fill-1')); click(gid('m77-table-fill-2'));
check('m77-table: 3 wins = 9 points', msgOf('m77-table').indexOf('表填完了') >= 0 && gid('m77-table-row-2').textContent.indexOf('9 分') >= 0);
click(gid('m77-guess-g0'));
for (let i = 0; i < 5; i++) click(gid('m77-guess-plus'));
click(gid('m77-guess-try'));
check('m77-guess: x = 5 balances x + 4 = 9', msgOf('m77-guess').indexOf('天平平了') >= 0);
// 7.8
click(gid('m78-motion-g0')); input(gid('m78-motion-slider'), '10');
check('m78-motion: point moving leaves a line', msgOf('m78-motion').indexOf('一条线') >= 0);
click(gid('m78-rope-g0')); input(gid('m78-rope-slider'), '3');
check('m78-rope: straight 4 beats the bent path', msgOf('m78-rope').indexOf('直线段长 4') >= 0);
click(gid('m78-count-g0'));
const dots = gid('m78-count-dots').children;
click(dots[0]); click(dots[1]);
click(dots[0]); click(dots[2]);
click(dots[1]); click(dots[2]);
check('m78-count: 3 points make 3 segments, n(n-1)/2', msgOf('m78-count').indexOf('连满了') >= 0 && msgOf('m78-count').indexOf('3×2÷2 = 3') >= 0);
// 7.9
click(gid('m79-joint-g0')); input(gid('m79-joint-slider'), '60');
check('m79-joint: 30 + 60 = 90, right angle completed', msgOf('m79-joint').indexOf('拼满了') >= 0 && msgOf('m79-joint').indexOf('90°') >= 0);
click(gid('m79-overlap-g0')); click(gid('m79-overlap-stack-btn'));
check('m79-overlap: 50 > 35 after stacking', msgOf('m79-overlap').indexOf('50° > 35°') >= 0);
click(gid('m79-protractor-g0')); click(gid('m79-protractor-act-btn'));
check('m79-protractor: protractor reads 40 degrees', msgOf('m79-protractor').indexOf('40°') >= 0);
// 7.10
click(gid('m710-drag-g0')); input(gid('m710-drag-slider'), '50');
check('m710-drag: vertical angles equal, ∠1 = ∠3 = 50°', msgOf('m710-drag').indexOf('∠1 = ∠3 = 50°') >= 0);
click(gid('m710-suppl-g0'));
click(gid('m710-suppl-next-btn')); click(gid('m710-suppl-next-btn')); click(gid('m710-suppl-next-btn'));
check('m710-suppl: ∠1 = ∠3 = 50° by supplementary reasoning', msgOf('m710-suppl').indexOf('∠1 = ∠3 = 50°') >= 0);
click(gid('m710-perp-g0')); input(gid('m710-perp-slider'), '4'); click(gid('m710-perp-cmp-btn'));
check('m710-perp: 3-4-5, perpendicular is shortest', msgOf('m710-perp').indexOf('垂线段最短') >= 0 && msgOf('m710-perp').indexOf('斜线段长 5') >= 0);
// 7.11
click(gid('m711-fzc-g0')); click(gid('m711-fzc-light-btn'));
check('m711-fzc: F lights ∠1 and ∠5, both 60°', msgOf('m711-fzc').indexOf('∠1 = ∠5 = 60°') >= 0);
click(gid('m711-slide-g0')); input(gid('m711-slide-slider'), '110');
check('m711-slide: parallel lines, ∠1 = ∠5 = 110°', msgOf('m711-slide').indexOf('∠1 = ∠5 = 110°') >= 0);
click(gid('m711-aux-g0')); click(gid('m711-aux-aux-btn'));
check('m711-aux: 60 + 50 = 110 for the bent angle', msgOf('m711-aux').indexOf('60° + 50° = 110°') >= 0);
// 7.12
click(gid('m712-diag-g0')); click(gid('m712-diag-drop-btn'));
check('m712-diag: √2 lands at 1.414, 1 < √2 < 2', msgOf('m712-diag').indexOf('1.414') >= 0 && msgOf('m712-diag').indexOf('1 < √2 < 2') >= 0);
click(gid('m712-contra-g0'));
click(gid('m712-contra-next-btn')); click(gid('m712-contra-next-btn')); click(gid('m712-contra-next-btn')); click(gid('m712-contra-next-btn'));
check('m712-contra: √2 irrational by contradiction', gid('m712-contra-proof').innerHTML.indexOf('矛盾') >= 0 && msgOf('m712-contra').indexOf('无理数') >= 0);
click(gid('m712-approx-g0')); input(gid('m712-approx-slider'), '0');
check('m712-approx: 1.4^2 = 1.96', msgOf('m712-approx').indexOf('1.96') >= 0 && gid('m712-approx-calc').textContent.indexOf('1.4² = 1.96') >= 0);
// 7.13
click(gid('m713-addr-g0')); input(gid('m713-addr-x'), '3'); input(gid('m713-addr-y'), '2');
check('m713-addr: reached (3, 2)', msgOf('m713-addr').indexOf('到了 (3, 2)') >= 0);
click(gid('m713-quad-g0')); click(gid('m713-quad-flipx-btn')); click(gid('m713-quad-flipy-btn'));
check('m713-quad: (3, 2) is in quadrant I', msgOf('m713-quad').indexOf('第一象限') >= 0);
click(gid('m713-sym-g0')); click(gid('m713-sym-jump-btn'));
check('m713-sym: mirror of (3, 2) over x-axis is (3, −2)', msgOf('m713-sym').indexOf('(3, −2)') >= 0);
// 7.14
click(gid('m714-graph-g0')); input(gid('m714-graph-slider'), '-1');
check('m714-graph: lines meet at (3, 2)', msgOf('m714-graph').indexOf('(3, 2)') >= 0 && gid('m714-graph-cross').textContent.indexOf('(3, 2)') >= 0);
click(gid('m714-subst-g0'));
click(gid('m714-subst-next-btn')); click(gid('m714-subst-next-btn')); click(gid('m714-subst-next-btn'));
check('m714-subst: substitution gives (6, 3)', msgOf('m714-subst').indexOf('(6, 3)') >= 0);
click(gid('m714-elim-g0'));
click(gid('m714-elim-next-btn')); click(gid('m714-elim-next-btn')); click(gid('m714-elim-next-btn'));
check('m714-elim: elimination gives (5, 2)', msgOf('m714-elim').indexOf('(5, 2)') >= 0);
// 7.15
click(gid('m715-seg-g0')); click(gid('m715-seg-draw-btn'));
check('m715-seg: x > 3, open circle, shade right', msgOf('m715-seg').indexOf('空心圈') >= 0 && msgOf('m715-seg').indexOf('3 右边') >= 0);
click(gid('m715-flip-g0')); click(gid('m715-flip-act-btn'));
check('m715-flip: times -1 flips to −3 > −5', msgOf('m715-flip').indexOf('−3 > −5') >= 0);
click(gid('m715-overlap-g0')); click(gid('m715-overlap-draw-a-btn')); click(gid('m715-overlap-draw-b-btn')); click(gid('m715-overlap-overlap-btn'));
check('m715-overlap: x > 1 and x < 4 overlap as 1 < x < 4', msgOf('m715-overlap').indexOf('1 < x < 4') >= 0);
// 7.16
click(gid('m716-bins-g0')); click(gid('m716-bins-bin-btn'));
check('m716-bins: 150-160 bin has 4 people', msgOf('m716-bins').indexOf('共 4 人') >= 0 && gid('m716-bins-counts').textContent.indexOf('150–160：4 人') >= 0);
click(gid('m716-sample-g0'));
click(gid('m716-sample-draw-btn')); click(gid('m716-sample-draw-btn')); click(gid('m716-sample-draw-btn'));
check('m716-sample: 3 draws of n=3, first mean 143.0, spread 12.7',
  gid('m716-sample-list').textContent.indexOf('第 3 次') >= 0 &&
  gid('m716-sample-list').textContent.indexOf('143.0') >= 0 &&
  msgOf('m716-sample').indexOf('12.7') >= 0 && msgOf('m716-sample').indexOf('晃得厉害') >= 0);
click(gid('m716-dotvs-g0')); click(gid('m716-dotvs-show-btn'));
check('m716-dotvs: 110 has 4 dots', msgOf('m716-dotvs').indexOf('4 个点') >= 0);

// ---------- discovery + markTried wiring ----------
gid('m71-numline-find').value = '绝对值就是距离，没有负号';
click(gid('m71-numline-find-save'));
check('discovery: finding is recorded via wireDiscovery stub',
  gid('m71-numline-find-saved').textContent.indexOf('绝对值就是距离') >= 0);
check('markTried called for completed animations', triedKeys.length >= 44 &&
  triedKeys.indexOf('m71-numline') >= 0 && triedKeys.indexOf('m78-count') >= 0 &&
  triedKeys.indexOf('m79-joint') >= 0 && triedKeys.indexOf('m716-dotvs') >= 0);
check('tiers.done fired for level 0 of every animation',
  EXPECTED.every(function (e) { return tiersDone.indexOf(e[0] + ':0') >= 0; }));

// ---------- pure-math spot checks (independent of the renders) ----------
check('math: 2^10 = 1024 (fold challenge)', (function () { let r = 1; for (let i = 0; i < 10; i++) r *= 2; return r; })() === 1024);
check('math: 3-4-5 triangle, straight A(0,0)-B(4,3) = 5', Math.sqrt(16 + 9) === 5);
check('math: n(n-1)/2 for n=5 is 10', 5 * 4 / 2 === 10);
check('math: 0.8 × 200 = 160', 0.8 * 200 === 160);
check('math: 60×3 + 40×3 = 300', 60 * 3 + 40 * 3 === 300);
check('math: bent angle 360 - 120 - 130 = 110', 360 - 120 - 130 === 110);
check('math: 1.414^2 rounds to 1.999396', (1.414 * 1.414).toFixed(6) === '1.999396');
check('math: 2.236^2 rounds to 4.999696', (2.236 * 2.236).toFixed(6) === '4.999696');
check('math: 5-12-13 right triangle', 5 * 5 + 12 * 12 === 13 * 13);
check('math: (3,2) solves x+y=5 and x-y=1', 3 + 2 === 5 && 3 - 2 === 1);
check('math: (6,3) solves x+y=9 and x=2y', 6 + 3 === 9 && 6 === 2 * 3);
check('math: histogram bins sum to 12 students', 3 + 4 + 4 + 1 === 12);
check('math: dot plot counts sum to 15 students', 1 + 2 + 3 + 4 + 2 + 2 + 1 === 15);
check('math: population mean (138+142+145+147+150+152+155+158+160+163)/10 = 151',
  (138 + 142 + 145 + 147 + 150 + 152 + 155 + 158 + 160 + 163) / 10 === 151);

console.log('\nsmoke-anims-band-7-9: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
