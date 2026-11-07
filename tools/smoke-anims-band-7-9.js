// Smoke tests for apps/web/anims-band-7-9.js (7.1–9.16, 100 animations).
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

// ---------- grade-8 point ids (must really exist) ----------
const g8src = fs.readFileSync(path.join(root, 'content/grades/grade-8.js'), 'utf8');
const g8ids = new Set();
while ((m = idRe.exec(g8src)) !== null) g8ids.add(m[1]);

// ---------- grade-9 point ids (must really exist) ----------
const g9src = fs.readFileSync(path.join(root, 'content/grades/grade-9.js'), 'utf8');
const g9ids = new Set();
while ((m = idRe.exec(g9src)) !== null) g9ids.add(m[1]);

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
  ['m81-ext', '8.1', '外角等于两内角和法', '演示'],
  ['m82-move', '8.2', '刚性变换叠合法', '模拟'],
  ['m83-trace', '8.3', '镜面描迹法', '模拟'],
  ['m83-drink', '8.3', '将军饮马最短路径法', '模拟'],
  ['m84-sas', '8.4', '作辅助线证底角法', '演示'],
  ['m84-two', '8.4', '分类讨论两解法', '演示'],
  ['m85-rules', '8.5', '法则表推导法', '演示'],
  ['m86-foil', '8.6', '分配律展开法', '演示'],
  ['m86-quick', '8.6', '数字速算法', '演示'],
  ['m87-tiles', '8.7', '代数块拼长方形法', '模拟'],
  ['m87-gcf', '8.7', '先提公因式再套公式法', '演示'],
  ['m87-zero', '8.7', '从图像零点读因式法', '模拟'],
  ['m88-factor', '8.8', '先因式分解再约分法', '演示'],
  ['m88-lcd', '8.8', '通分找最简公分母法', '演示'],
  ['m89-graph', '8.9', '分式方程图像法', '模拟'],
  ['m810-area', '8.10', '面积边长法', '演示'],
  ['m811-water', '8.11', '水演示体积守恒法', '实验'],
  ['m811-sim', '8.11', '相似证明法', '演示'],
  ['m812-mid', '8.12', '中点四边形法', '模拟'],
  ['m813-cut', '8.13', '菱形面积切四块法', '演示'],
  ['m814-machine', '8.14', '输入输出机器法', '演示'],
  ['m814-carnival', '8.14', '看动画画图法', '实验'],
  ['m815-two', '8.15', '两点定直线法', '演示'],
  ['m815-ineq', '8.15', '方程与不等式的图像解法', '模拟'],
  ['m816-var', '8.16', '方差是距离的平均法', '模拟'],
  ['m816-mode', '8.16', '众数看频数峰法', '模拟'],
  ['m91-tiles', '9.1', '配方法拼图法', '模拟'],
  ['m91-mid', '9.1', '中点±偏差法', '演示'],
  ['m93-plot', '9.3', '描点连线法', '模拟'],
  ['m93-vertex', '9.3', 'b 的轨迹法', '模拟'],
  ['m93-forms', '9.3', '三种形式互化法', '演示'],
  ['m94-flight', '9.4', '抛物线运动轨迹法', '模拟'],
  ['m95-coord', '9.5', '坐标旋转法', '模拟'],
  ['m95-life', '9.5', '生活旋转法', '实验'],
  ['m96-isos', '9.6', '等腰三角形证明法', '演示'],
  ['m96-thales', '9.6', '直径对直角法', '模拟'],
  ['m97-centers', '9.7', '外心内心作图法', '模拟'],
  ['m97-shortest', '9.7', '最短距离证切线法', '模拟'],
  ['m98-rearrange', '9.8', '扇形切分重排法', '模拟'],
  ['m99-sort', '9.9', '事件分类法', '实验'],
  ['m99-indep', '9.9', '独立性法', '模拟'],
  ['m910-table', '9.10', '列表法', '演示'],
  ['m911-life', '9.11', '生活反比例法', '模拟'],
  ['m911-vs', '9.11', '正比例对比法', '模拟'],
  ['m912-scale', '9.12', '地图比例尺法', '模拟'],
  ['m913-parallel', '9.13', '平行线截比例法', '模拟'],
  ['m913-thales', '9.13', '泰勒斯量金字塔法', '实验'],
  ['m914-unit', '9.14', '单位圆法', '模拟'],
  ['m915-depress', '9.15', '俯角法', '模拟'],
  ['m915-twice', '9.15', '两次测量塔高法', '模拟'],
  ['m916-build', '9.16', '三视图搭积木法', '实验'],
  ['m916-net', '9.16', '展开图法', '模拟'],
];
check('100 animations registered', Object.keys(REG).length === 100);
EXPECTED.forEach(function (e) {
  const a = REG[e[0]];
  check(e[0] + ' registered with title/grade/kind/points',
    !!a && a.title.indexOf(e[2]) === 0 && a.grade === Number(e[1].split('.')[0]) && a.kind === e[3] &&
    JSON.stringify(a.points) === JSON.stringify([e[1]]) &&
    typeof a.render === 'function' && (g7ids.has(e[1]) || g8ids.has(e[1]) || g9ids.has(e[1])));
});

// 改前代码（空骨架）上：上面的注册检查会 FAIL，这里直接退出，
// 后面的走查不再跑——否则 childByText 会拿到 undefined 而抛错，
// 那就不是“干净失败”而是整脚本崩掉。
if (Object.keys(REG).length !== 100) {
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
// 8.1
click(gid('m81-ext-g0')); click(gid('m81-ext-extend'));
check('m81-ext: exterior 110 = 50 + 60', msgOf('m81-ext').indexOf('110°') >= 0 && msgOf('m81-ext').indexOf('你猜对了') >= 0);
// 8.2
click(gid('m82-move-g0'));
click(gid('m82-move-move')); click(gid('m82-move-move')); click(gid('m82-move-move'));
check('m82-move: 3 shifts coincide', msgOf('m82-move').indexOf('重合了') >= 0 && msgOf('m82-move').indexOf('你猜对了') >= 0);
// 8.3
click(gid('m83-trace-g0')); input(gid('m83-trace-slider-x'), '60'); input(gid('m83-trace-slider-y'), '100');
check('m83-trace: A(60, 100) mirrors to (340, 100)', msgOf('m83-trace').indexOf('(340, 100)') >= 0 && msgOf('m83-trace').indexOf('你猜对了') >= 0);
click(gid('m83-drink-g1')); click(gid('m83-drink-p1'));
check('m83-drink: P at x = 6, AP + PB = 10.6', msgOf('m83-drink').indexOf('AP ＋ PB ＝ 10.6') >= 0 && msgOf('m83-drink').indexOf('最短') >= 0);
// 8.4
click(gid('m84-sas-g0')); click(gid('m84-sas-show'));
check('m84-sas: SAS gives base angles 70', msgOf('m84-sas').indexOf('∠B ＝ ∠C ＝ 70°') >= 0);
click(gid('m84-two-g1')); click(gid('m84-two-show'));
check('m84-two: 50 or 130 degrees', msgOf('m84-two').indexOf('50°') >= 0 && msgOf('m84-two').indexOf('130°') >= 0);
// 8.5
click(gid('m85-rules-g0')); click(gid('m85-rules-expand'));
check('m85-rules: (2a)^3 = 8a^3', gid('m85-rules-steps').textContent.indexOf('(2a)³ ＝ 8a³') >= 0 && msgOf('m85-rules').indexOf('你猜对了') >= 0);
// 8.6
click(gid('m86-foil-g0')); click(gid('m86-foil-expand'));
check('m86-foil: (x+3)(x-3) = x^2 - 9', gid('m86-foil-terms').textContent.indexOf('(x ＋ 3)(x − 3) ＝ x² − 9') >= 0 && msgOf('m86-foil').indexOf('抵消') >= 0);
click(gid('m86-quick-g0')); click(gid('m86-quick-split'));
check('m86-quick: 101 x 99 = 9999', gid('m86-quick-steps').textContent.indexOf('＝ 9999') >= 0);
// 8.7
click(gid('m87-tiles-g0')); click(gid('m87-tiles-build'));
check('m87-tiles: x^2+5x+6 = (x+2)(x+3)', msgOf('m87-tiles').indexOf('拼满了') >= 0 && msgOf('m87-tiles').indexOf('(x ＋ 2)(x ＋ 3)') >= 0);
click(gid('m87-gcf-g0')); click(gid('m87-gcf-s0'));
check('m87-gcf: 2x^2-8 = 2(x+2)(x-2)', msgOf('m87-gcf').indexOf('2(x ＋ 2)(x − 2)') >= 0);
click(gid('m87-zero-g0')); click(gid('m87-zero-draw'));
check('m87-zero: roots 2 and 3 give (x-2)(x-3)', msgOf('m87-zero').indexOf('(x − 2)(x − 3)') >= 0);
// 8.8
click(gid('m88-factor-g0')); click(gid('m88-factor-s0'));
check('m88-factor: (x^2-9)/(x+3) = x-3', msgOf('m88-factor').indexOf('x − 3') >= 0);
click(gid('m88-lcd-g0')); click(gid('m88-lcd-go'));
check('m88-lcd: 1/x + 1/(2x) = 3/(2x)', gid('m88-lcd-steps').textContent.indexOf('3/(2x)') >= 0);
// 8.9
click(gid('m89-graph-g0')); click(gid('m89-graph-draw'));
check('m89-graph: y=1/x meets y=1 at (1, 1)', msgOf('m89-graph').indexOf('(1, 1)') >= 0);
// 8.10
click(gid('m810-area-g0')); click(gid('m810-area-split'));
check('m810-area: sqrt(12) = 2 sqrt(3)', msgOf('m810-area').indexOf('√12 ＝ √(4 × 3) ＝ 2√3') >= 0);
// 8.11
click(gid('m811-water-g0')); input(gid('m811-water-pour'), '100');
check('m811-water: 9 + 16 = 25 fills exactly', msgOf('m811-water').indexOf('正好倒满') >= 0 && msgOf('m811-water').indexOf('9 ＋ 16 ＝ 25') >= 0);
click(gid('m811-sim-g0')); click(gid('m811-sim-show'));
check('m811-sim: projections 1.8 and 3.2', msgOf('m811-sim').indexOf('1.8') >= 0 && msgOf('m811-sim').indexOf('3.2') >= 0);
// 8.12
click(gid('m812-mid-g0')); click(gid('m812-mid-dplus')); click(gid('m812-mid-measure'));
check('m812-mid: opposite sides equal after dragging D', msgOf('m812-mid').indexOf('对边相等') >= 0 && msgOf('m812-mid').indexOf('你猜对了') >= 0);
// 8.13
click(gid('m813-cut-g0')); click(gid('m813-cut-cut'));
check('m813-cut: rhombus area 24 = 6x8/2', msgOf('m813-cut').indexOf('6 × 8 ÷ 2 ＝ 24') >= 0);
// 8.14
click(gid('m814-machine-g0')); click(gid('m814-machine-run'));
check('m814-machine: input 3 outputs 6', gid('m814-machine-steps').textContent.indexOf('输出 6') >= 0);
click(gid('m814-carnival-g0')); input(gid('m814-carnival-time'), '4');
check('m814-carnival: ball peaks at 20 m, parabola', msgOf('m814-carnival').indexOf('20 米') >= 0 && msgOf('m814-carnival').indexOf('抛物线') >= 0);
// 8.15
click(gid('m815-two-g0')); click(gid('m815-two-h0')); click(gid('m815-two-draw'));
check('m815-two: through (0,3)(1,5) is y = 2x + 3', msgOf('m815-two').indexOf('y ＝ 2x ＋ 3') >= 0);
click(gid('m815-ineq-g0')); click(gid('m815-ineq-h0')); click(gid('m815-ineq-draw'));
check('m815-ineq: y=2x-4 zero at x = 2', msgOf('m815-ineq').indexOf('x ＝ 2') >= 0);
// 8.16
click(gid('m816-var-g0')); click(gid('m816-var-show'));
check('m816-var: variance of 1,3,5,7 is 5', msgOf('m816-var').indexOf('方差是 5') >= 0 && gid('m816-var-calc').textContent.indexOf('＝ 5') >= 0);
click(gid('m816-mode-g0')); click(gid('m816-mode-bars'));
check('m816-mode: mode is 155', msgOf('m816-mode').indexOf('众数是 155') >= 0);

// 9.1
click(gid('m91-tiles-g0')); click(gid('m91-tiles-fill'));
check('m91-tiles: (x+2)^2 = 9 gives x = 1 or -5', msgOf('m91-tiles').indexOf('(x＋2)²＝9') >= 0 && msgOf('m91-tiles').indexOf('你猜对了') >= 0);
click(gid('m91-mid-g0')); click(gid('m91-mid-solve'));
check('m91-mid: midpoint 2.5, deviation 0.5, roots 2 and 3', msgOf('m91-mid').indexOf('x＝2 或 x＝3') >= 0 && msgOf('m91-mid').indexOf('你猜对了') >= 0);
// 9.3
click(gid('m93-plot-g0')); click(gid('m93-plot-plot'));
check('m93-plot: y=x^2 at x=2 is 4', msgOf('m93-plot').indexOf('(2，4)') >= 0 && msgOf('m93-plot').indexOf('你猜对了') >= 0);
click(gid('m93-vertex-g0')); input(gid('m93-vertex-slider'), '2');
check('m93-vertex: b=2 gives vertex (-1, 0)', msgOf('m93-vertex').indexOf('(-1，0)') >= 0 && msgOf('m93-vertex').indexOf('你猜对了') >= 0);
click(gid('m93-forms-g0')); click(gid('m93-forms-convert'));
check('m93-forms: x^2-3x+2 vertex form (x-1.5)^2-0.25', gid('m93-forms-forms').textContent.indexOf('(x－1.5)²－0.25') >= 0 && msgOf('m93-forms').indexOf('你猜对了') >= 0);
// 9.4
click(gid('m94-flight-g0')); click(gid('m94-flight-peak'));
check('m94-flight: -x^2+4x peaks at 4 m', msgOf('m94-flight').indexOf('最高 4 米') >= 0 && msgOf('m94-flight').indexOf('你猜对了') >= 0);
// 9.5
click(gid('m95-coord-g0')); click(gid('m95-coord-turn'));
check('m95-coord: (2,1) rotated 90 deg to (-1,2)', msgOf('m95-coord').indexOf('(-1，2)') >= 0 && msgOf('m95-coord').indexOf('你猜对了') >= 0);
click(gid('m95-life-g0'));
click(gid('m95-life-turn')); click(gid('m95-life-turn')); click(gid('m95-life-turn')); click(gid('m95-life-turn'));
check('m95-life: 4-blade windmill back after 4 turns of 90 deg', msgOf('m95-life').indexOf('回到原样') >= 0 && msgOf('m95-life').indexOf('你猜对了') >= 0);
// 9.6
click(gid('m96-isos-g0')); click(gid('m96-isos-move'));
check('m96-isos: C at 230 deg, angle ACB = 60 deg', msgOf('m96-isos').indexOf('60°') >= 0 && msgOf('m96-isos').indexOf('你猜对了') >= 0);
click(gid('m96-thales-g0')); click(gid('m96-thales-c0'));
check('m96-thales: angle subtended by diameter is 90 deg', msgOf('m96-thales').indexOf('90°') >= 0 && msgOf('m96-thales').indexOf('你猜对了') >= 0);
// 9.7
click(gid('m97-centers-g0')); click(gid('m97-centers-draw'));
check('m97-centers: circumcenter of 3-4-5 is (2, 1.5)', gid('m97-centers-svg').innerHTML.indexOf('外心 (2，1.5)') >= 0 && msgOf('m97-centers').indexOf('你猜对了') >= 0);
click(gid('m97-shortest-g0')); click(gid('m97-shortest-t0'));
check('m97-shortest: OP=5, r=4, shortest PT = 1', msgOf('m97-shortest').indexOf('最短') >= 0 && msgOf('m97-shortest').indexOf('你猜对了') >= 0);
// 9.8
click(gid('m98-rearrange-g0')); click(gid('m98-rearrange-cut'));
check('m98-rearrange: sector r=6 rearranged area 6pi', msgOf('m98-rearrange').indexOf('6π') >= 0 && msgOf('m98-rearrange').indexOf('你猜对了') >= 0);
// 9.9
click(gid('m99-sort-g0')); click(gid('m99-sort-put'));
check('m99-sort: sun rising in east is a certain event', msgOf('m99-sort').indexOf('必然事件') >= 0 && msgOf('m99-sort').indexOf('你猜对了') >= 0);
click(gid('m99-indep-g0')); click(gid('m99-indep-toss'));
check('m99-indep: after 3 heads, next head still 1/2', msgOf('m99-indep').indexOf('还是 1/2') >= 0 && msgOf('m99-indep').indexOf('你猜对了') >= 0);
// 9.10
click(gid('m910-table-g0')); click(gid('m910-table-draw'));
check('m910-table: sum 7 has 6 of 36, probability 1/6', msgOf('m910-table').indexOf('6 个') >= 0 && msgOf('m910-table').indexOf('1/6') >= 0 && msgOf('m910-table').indexOf('你猜对了') >= 0);
// 9.11
click(gid('m911-life-g0')); input(gid('m911-life-slider'), '60');
check('m911-life: 60 km at 60 km/h takes 1 h', msgOf('m911-life').indexOf('t＝1') >= 0 && msgOf('m911-life').indexOf('你猜对了') >= 0);
click(gid('m911-vs-g0')); input(gid('m911-vs-slider'), '2');
check('m911-vs: at x=2, 2x=4 beats 6/x=3', msgOf('m911-vs').indexOf('正比例大') >= 0 && msgOf('m911-vs').indexOf('你猜对了') >= 0);
// 9.12
click(gid('m912-scale-g0')); click(gid('m912-scale-calc'));
check('m912-scale: 4 cm at 1:50000 is 2 km', msgOf('m912-scale').indexOf('2 千米') >= 0 && msgOf('m912-scale').indexOf('你猜对了') >= 0);
// 9.13
click(gid('m913-parallel-g0')); input(gid('m913-parallel-slider'), '2');
check('m913-parallel: AD=2, AB=6, AC=9 gives AE=3', msgOf('m913-parallel').indexOf('AE＝9×1/3＝3') >= 0 && msgOf('m913-parallel').indexOf('你猜对了') >= 0);
click(gid('m913-thales-g0')); click(gid('m913-thales-sun'));
check('m913-thales: 1 m stick, 1.5 m shadow, 12 m pole shadow gives 8 m', msgOf('m913-thales').indexOf('8 米') >= 0 && msgOf('m913-thales').indexOf('你猜对了') >= 0);
// 9.14
click(gid('m914-unit-g0')); input(gid('m914-unit-slider'), '30');
check('m914-unit: sin30 = 1/2', msgOf('m914-unit').indexOf('sin30°＝1/2') >= 0 && msgOf('m914-unit').indexOf('你猜对了') >= 0);
// 9.15
click(gid('m915-depress-g0')); click(gid('m915-depress-look'));
check('m915-depress: 20 m building, 45 deg depression, 20 m away', msgOf('m915-depress').indexOf('20 米') >= 0 && msgOf('m915-depress').indexOf('你猜对了') >= 0);
click(gid('m915-twice-g0')); click(gid('m915-twice-measure'));
check('m915-twice: 30 to 45 deg over 20 m gives tower about 27.32 m', msgOf('m915-twice').indexOf('27.32') >= 0 && msgOf('m915-twice').indexOf('你猜对了') >= 0);
// 9.16
click(gid('m916-build-g0'));
(function () {
  const kids = gid('m916-build-stacks').children;
  const byIdIn = function (id) { return kids.find(function (c) { return c.id === id; }); };
  click(byIdIn('m916-build-add-0')); click(byIdIn('m916-build-add-0'));
  click(byIdIn('m916-build-add-1')); click(byIdIn('m916-build-add-2'));
})();
click(gid('m916-build-check'));
check('m916-build: stacks 2/1/1 match the three views', msgOf('m916-build').indexOf('对上了') >= 0 && msgOf('m916-build').indexOf('你猜对了') >= 0);
click(gid('m916-net-g0')); click(gid('m916-net-fold'));
check('m916-net: 1-4-1 net folds into a cube', msgOf('m916-net').indexOf('正好 6 个面') >= 0 && msgOf('m916-net').indexOf('你猜对了') >= 0);

// ---------- discovery + markTried wiring ----------
gid('m71-numline-find').value = '绝对值就是距离，没有负号';
click(gid('m71-numline-find-save'));
check('discovery: finding is recorded via wireDiscovery stub',
  gid('m71-numline-find-saved').textContent.indexOf('绝对值就是距离') >= 0);
check('markTried called for completed animations', triedKeys.length >= 93 &&
  triedKeys.indexOf('m71-numline') >= 0 && triedKeys.indexOf('m78-count') >= 0 &&
  triedKeys.indexOf('m79-joint') >= 0 && triedKeys.indexOf('m716-dotvs') >= 0 &&
  triedKeys.indexOf('m81-ext') >= 0 && triedKeys.indexOf('m82-move') >= 0 &&
  triedKeys.indexOf('m83-trace') >= 0 && triedKeys.indexOf('m83-drink') >= 0 &&
  triedKeys.indexOf('m84-sas') >= 0 && triedKeys.indexOf('m84-two') >= 0 &&
  triedKeys.indexOf('m85-rules') >= 0 && triedKeys.indexOf('m86-foil') >= 0 &&
  triedKeys.indexOf('m86-quick') >= 0 && triedKeys.indexOf('m87-tiles') >= 0 &&
  triedKeys.indexOf('m87-gcf') >= 0 && triedKeys.indexOf('m87-zero') >= 0 &&
  triedKeys.indexOf('m88-factor') >= 0 && triedKeys.indexOf('m88-lcd') >= 0 &&
  triedKeys.indexOf('m89-graph') >= 0 && triedKeys.indexOf('m810-area') >= 0 &&
  triedKeys.indexOf('m811-water') >= 0 && triedKeys.indexOf('m811-sim') >= 0 &&
  triedKeys.indexOf('m812-mid') >= 0 && triedKeys.indexOf('m813-cut') >= 0 &&
  triedKeys.indexOf('m814-machine') >= 0 && triedKeys.indexOf('m814-carnival') >= 0 &&
  triedKeys.indexOf('m815-two') >= 0 && triedKeys.indexOf('m815-ineq') >= 0 &&
  triedKeys.indexOf('m816-var') >= 0 && triedKeys.indexOf('m816-mode') >= 0 &&
  triedKeys.indexOf('m91-tiles') >= 0 && triedKeys.indexOf('m91-mid') >= 0 &&
  triedKeys.indexOf('m93-plot') >= 0 && triedKeys.indexOf('m93-vertex') >= 0 &&
  triedKeys.indexOf('m93-forms') >= 0 && triedKeys.indexOf('m94-flight') >= 0 &&
  triedKeys.indexOf('m95-coord') >= 0 && triedKeys.indexOf('m95-life') >= 0 &&
  triedKeys.indexOf('m96-isos') >= 0 && triedKeys.indexOf('m96-thales') >= 0 &&
  triedKeys.indexOf('m97-centers') >= 0 && triedKeys.indexOf('m97-shortest') >= 0 &&
  triedKeys.indexOf('m98-rearrange') >= 0 && triedKeys.indexOf('m99-sort') >= 0 &&
  triedKeys.indexOf('m99-indep') >= 0 && triedKeys.indexOf('m910-table') >= 0 &&
  triedKeys.indexOf('m911-life') >= 0 && triedKeys.indexOf('m911-vs') >= 0 &&
  triedKeys.indexOf('m912-scale') >= 0 && triedKeys.indexOf('m913-parallel') >= 0 &&
  triedKeys.indexOf('m913-thales') >= 0 && triedKeys.indexOf('m914-unit') >= 0 &&
  triedKeys.indexOf('m915-depress') >= 0 && triedKeys.indexOf('m915-twice') >= 0 &&
  triedKeys.indexOf('m916-build') >= 0 && triedKeys.indexOf('m916-net') >= 0);
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
check('math: 3-4-5 water: 9 + 16 = 25', 3 * 3 + 4 * 4 === 5 * 5);
check('math: 5-12-13 water: 25 + 144 = 169', 5 * 5 + 12 * 12 === 13 * 13);
check('math: 8-15-17 water: 64 + 225 = 289', 8 * 8 + 15 * 15 === 17 * 17);
check('math: altitude 3x4/5 = 2.4, projections 9/5 + 16/5 = 5', 3 * 4 / 5 === 2.4 && 9 / 5 + 16 / 5 === 5);
check('math: 101x99 = (100+1)(100-1) = 9999', 101 * 99 === 100 * 100 - 1);
check('math: 98x102 = 9996, 47x53 = 2491', 98 * 102 === 10000 - 4 && 47 * 53 === 2500 - 9);
check('math: (x+2)(x+3) = x^2+5x+6, (x+3)(x+5) = x^2+8x+15',
  2 + 3 === 5 && 2 * 3 === 6 && 3 + 5 === 8 && 3 * 5 === 15);
check('math: variance of 1,3,5,7 is 5', (9 + 1 + 1 + 9) / 4 === 5);
check('math: variance of 3,3,5,5 is 1, of 2,4,4,6 is 2',
  (1 + 1 + 1 + 1) / 4 === 1 && (4 + 0 + 0 + 4) / 4 === 2);
check('math: 1/(x+1)+1/(x-1) = 2x/(x^2-1) at x=2: 1/3+1 = 4/3',
  Math.abs(1 / 3 + 1 - 4 / 3) < 1e-9);
check('math: 2/x = x-1 at x=2 and x=-1', 2 / 2 === 2 - 1 && 2 / -1 === -1 - 1);
check('math: midpoint quad sides sqrt(10.25) and sqrt(8.5) pair up',
  Math.abs(Math.sqrt(10.25) - Math.sqrt(2.5 * 2.5 + 2 * 2)) < 1e-9 &&
  Math.abs(Math.sqrt(8.5) - Math.sqrt(2.5 * 2.5 + 1.5 * 1.5)) < 1e-9);
check('math: rhombus 6x8/2 = 24, 10x24/2 = 120, 9x12/2 = 54',
  6 * 8 / 2 === 24 && 10 * 24 / 2 === 120 && 9 * 12 / 2 === 54);
check('math: drink shortest: sqrt(113) ~ 10.63, sqrt(136) ~ 11.66, sqrt(130) ~ 11.40',
  Math.abs(Math.sqrt(113) - 10.630) < 0.001 && Math.abs(Math.sqrt(136) - 11.662) < 0.001 &&
  Math.abs(Math.sqrt(130) - 11.402) < 0.001);
check('math: midpoint-deviation: 2.5^2-0.5^2=6, 4^2-2^2=12, (-3)^2-1^2=8',
  2.5 * 2.5 - 0.5 * 0.5 === 6 && 4 * 4 - 2 * 2 === 12 && 9 - 1 === 8);
check('math: completing square: (x+2)^2=9 gives 1/-5, (x-3)^2=1 gives 4/2, (x+5)^2=4 gives -3/-7',
  -2 + 3 === 1 && -2 - 3 === -5 && 3 + 1 === 4 && 3 - 1 === 2 && -5 + 2 === -3 && -5 - 2 === -7);
check('math: vertex trace: b=2 vertex (-1,0), b=4 vertex (-2,-3), trace y=-x^2+1',
  -2 / 2 === -1 && 1 - 4 / 4 === 0 && -4 / 2 === -2 && 1 - 16 / 4 === -3);
check('math: forms: (x-1.5)^2-0.25 = x^2-3x+2, 2(x-2)^2-2 = 2x^2-8x+6',
  (function (x) { return (x - 1.5) * (x - 1.5) - 0.25 === x * x - 3 * x + 2; })(5) &&
  (function (x) { return 2 * (x - 2) * (x - 2) - 2 === 2 * x * x - 8 * x + 6; })(5));
check('math: flight: -0.2*9+1.2*3+2 = 3.8, lands at 3+sqrt(19) ~ 7.36',
  -0.2 * 9 + 1.2 * 3 + 2 === 3.8 && Math.abs(3 + Math.sqrt(19) - 7.359) < 0.001);
check('math: Thales shadow: 2/3*220.5 = 147, 1.5/2*40 = 30, 1/1.5*12 = 8',
  2 / 3 * 220.5 === 147 && 1.5 / 2 * 40 === 30 && 1 / 1.5 * 12 === 8);
check('math: two-measure tower: 20*tan30*tan45/(tan45-tan30) ~ 27.32, 10*tan30*tan60/(tan60-tan30) = 5*sqrt(3)',
  Math.abs(20 * Math.tan(30 * Math.PI / 180) * 1 / (1 - Math.tan(30 * Math.PI / 180)) - 27.32) < 0.01 &&
  Math.abs(10 * Math.tan(30 * Math.PI / 180) * Math.tan(60 * Math.PI / 180) / (Math.tan(60 * Math.PI / 180) - Math.tan(30 * Math.PI / 180)) - 5 * Math.sqrt(3)) < 0.01);
check('math: depression: 30/tan30 ~ 51.96, 30/tan60 ~ 17.32, tangent length sqrt(25-9) = 4',
  Math.abs(30 / Math.tan(30 * Math.PI / 180) - 51.96) < 0.01 &&
  Math.abs(30 / Math.tan(60 * Math.PI / 180) - 17.32) < 0.01 && Math.sqrt(25 - 9) === 4);
check('math: two dice sums: 7 has 6, 2 has 1, 11 has 2 of 36',
  (function () {
    let c7 = 0, c2 = 0, c11 = 0;
    for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) {
      if (i + j === 7) c7++; if (i + j === 2) c2++; if (i + j === 11) c11++;
    }
    return c7 === 6 && c2 === 1 && c11 === 2;
  })());
check('math: sector rearrange: arc 2pi, base pi, areas 6pi/4pi/10pi for r=6/4/10',
  Math.abs(60 * Math.PI * 6 / 180 - 2 * Math.PI) < 1e-9 && Math.abs(90 * Math.PI * 4 / 180 - 2 * Math.PI) < 1e-9 &&
  Math.abs(36 * Math.PI * 10 / 180 - 2 * Math.PI) < 1e-9);

console.log('\nsmoke-anims-band-7-9: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
