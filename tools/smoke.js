// Consolidated smoke test for the math app (replaces the old /tmp
// gate-smoke.js + content-smoke.js, which were lost when /tmp was
// wiped on a VM replacement — test tooling now lives in the repo).
//
// What it covers, with a minimal DOM stub + the real app.js in a vm:
//  - view isolation: exactly one section visible per view (checks the
//    `hidden` attribute only — the CSS allowlist is covered separately
//    by tools/check-views.py, because a missing allowlist entry renders
//    a blank page with no JS error and no stub can see it).
//  - grade content rendering (grades 1 + 3), recall, olympiad, levels,
//    practice self-mark + confidence -> localStorage review store,
//    mix (interleaving) + review (spacing) views, breadcrumbs, back.
//  - ten-frame demo interactions (make-ten / break-ten).
//
// Run: node tools/smoke.js   (exit 0 = all pass)
const fs = require('fs'), vm = require('vm');
let pass = 0, fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('FAIL  ' + name); }
}

// ---------- minimal DOM stub ----------
const registry = [];
function camelData(attr) { return attr.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase()); }
function makeEl(tag) {
  const el = {
    tagName: (tag || 'div').toUpperCase(),
    children: [], dataset: {}, style: {}, hidden: false, _handlers: {},
    className: '', textContent: '', innerHTML: '', parentNode: null, _qs: {},
    classList: { _s: new Set(),
      add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); },
      toggle(c, f) { if (f === undefined) f = !this._s.has(c); if (f) this._s.add(c); else this._s.delete(c); return f; },
      contains(c) { return this._s.has(c); } },
    setAttribute(k, v) { this['attr:' + k] = String(v); },
    getAttribute(k) { return this['attr:' + k]; },
    removeAttribute(k) { delete this['attr:' + k]; },
    hasAttribute(k) { return this['attr:' + k] !== undefined; },
    getContext() {
      // canvas 2d stub: function demo draws on it at load.
      return { clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {},
        fillText() {}, arc() {}, fill() {}, fillRect() {}, setLineDash() {},
        strokeStyle: '', lineWidth: 1, fillStyle: '', font: '' };
    },
    addEventListener(t, fn) { (this._handlers[t] = this._handlers[t] || []).push(fn); },
    appendChild(c) { this.children.push(c); c.parentNode = this; return c; },
    removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); c.parentNode = null; return c; },
    get firstChild() { return this.children[0] || null; },
    querySelector(sel) {
      if (!this._qs[sel]) this._qs[sel] = makeEl('div');
      return this._qs[sel];
    },
    querySelectorAll(sel) { return registry.filter(e => e !== this && matchSel(e, sel)); },
    closest(sel) {
      if (sel.startsWith('[data-')) {
        const key = camelData(sel.slice(1, -1));
        if (this.dataset[key] !== undefined) return this;
      }
      return null;
    },
  };
  registry.push(el);
  return el;
}
function matchSel(e, sel) {
  const d = (name) => e.dataset[name] !== undefined;
  if (sel === '[data-nav-key]') return d('navKey');
  if (sel === '[data-unit]') return d('unit');
  if (sel === '[data-point]') return d('point');
  if (sel === '[data-mark]') return d('mark');
  if (sel === '[data-conf]') return d('conf');
  if (sel === '[data-mix-again]') return d('mixAgain');
  if (sel === '[data-g-mix]') return d('gMix');
  if (sel === '[data-g-review]') return d('gReview');
  if (sel === '[data-demo-link]') return d('demoLink');
  if (sel === '.prereq-step') return (e.className || '').split(' ').includes('prereq-step');
  // Descendant attribute selectors like '#sortRuleSeg [data-sort-rule]':
  // static seg buttons live in index.html, which the stub never parses,
  // so they are pre-seeded below before app.js loads (dataset + parent);
  // matchSel checks the parent chain. (The ten-frame/lab segs are NOT
  // pre-seeded, so their handlers stay unbound in the stub as before.)
  const dm = sel.match(/^#([A-Za-z0-9_-]+) \[data-([A-Za-z0-9-]+)\]$/);
  if (dm) {
    if (e.dataset[camelData('data-' + dm[2])] === undefined) return false;
    let p = e.parentNode;
    while (p) { if (p === byId[dm[1]]) return true; p = p.parentNode; }
    return false;
  }
  return false;
}
const byId = {};
const documentStub = {
  getElementById(id) { if (!byId[id]) byId[id] = makeEl('div'); return byId[id]; },
  createElement(tag) { return makeEl(tag); },
  createElementNS(ns, tag) { return makeEl(tag); },
  querySelector(sel) { return registry.find(e => matchSel(e, sel)) || makeEl('div'); },
  querySelectorAll(sel) { return registry.filter(e => matchSel(e, sel)); },
  body: makeEl('body'),
};
const windowStub = { scrollTo() {}, setTimeout, document: documentStub };

// ---------- stub grade content (small but schema-faithful) ----------
const GRADE3_CONTENT = { grade: 3, edition: 'A', units: [
  { unit: '分数的初步认识', term: '上', points: [
    { id: '3.7', title: '分数的初步认识', subtitle: '几分之一、几分之几', how: '把一个整体平均分。', why: '分母是切了几份。', wrong: '1/4 比 1/3 大', wrongWhy: '分母是大小不是个数。', visual: '分数条。', method: '分数条 + 数轴', explainBack: '1/4 是一份。', tryIt: '把纸对折两次。', demo: 'fraction', recall: { q: '一个饼切成 4 等份，吃了 1 份，吃了几分之几？', answer: '1/4', hint: '一共 4 份，吃了 1 份' }, practice: [{ q: '1/2 和 1/4 谁大？', answer: '1/2 大', hint: '份数少，每份大', steps: [{ label: '看分母', text: '1/2 是切 2 份，1/4 是切 4 份' }, { label: '比一比', text: '切的份数越少，每份越大，所以 1/2 大' }] }, { q: '2/7 + 3/7 = ?', answer: '5/7', hint: '分母不变，分子相加', steps: [{ label: '分母不变', text: '分母还是 7' }, { label: '分子相加', text: '2 + 3 = 5，所以是 5/7' }] }] },
  ] },
  { unit: '面积', term: '下', points: [
    { id: '3.12', title: '面积', subtitle: '面积单位、长方形面积', how: '数小方块。', why: '面积就是盖了多少个单位正方形。', wrong: '面积就是周长', wrongWhy: '周长是边，面积是面。', visual: '方格纸铺一铺。', method: '铺方块数一数', explainBack: '面积是里面有几个方块。', tryIt: '用小方块铺长方形。', demo: 'area', recall: { q: '长 4 宽 3 的长方形里能铺几个小方块？', answer: '12 个', hint: '4×3' }, practice: [{ q: '4 行 3 列是多少个方块？', answer: '12 个', hint: '4×3' }, { q: '边长 6 厘米的正方形面积？', answer: '36 平方厘米', hint: '边长×边长' }] },
  ] },
  { unit: '测量', term: '上', points: [
    { id: '3.3', title: '测量', subtitle: '毫米/分米/千米/吨', how: '看进率换算。', why: '单位是打包办法。', wrong: '1 千米=100 米', wrongWhy: '米到千米是 1000 倍。', visual: '单位楼梯。', method: '单位楼梯', explainBack: '1 千米是 1000 米。', tryIt: '量一量书的厚度。', demo: 'units', recall: { q: '2 千米是多少米？', answer: '2000 米', hint: '1 千米=1000 米' }, practice: [{ q: '3 吨是多少千克？', answer: '3000 千克', hint: '1 吨=1000 千克' }, { q: '5000 米是多少千米？', answer: '5 千米', hint: '1000 米=1 千米' }] },
  ] },
] };
const GRADE1_CONTENT = { grade: 1, edition: 'A', units: [
  { unit: '20以内的进位加法', term: '上', points: [
    { id: '1.9', title: '20以内进位加法', subtitle: '凑十法', how: '把 9 凑成 10 再加。', why: '10 是整捆。', wrong: '9+4=12', wrongWhy: '忘了凑十。', visual: '十格阵。', method: '凑十拖格', explainBack: '给 9 一个凑成 10。', tryIt: '拖 1 个到十格阵。', demo: 'tenframe', recall: { q: '9+4，先给 9 凑几个成 10？', answer: '凑 1 个', hint: '9 再加 1 是 10' }, olympiad: { q: '9+7+1+3，用凑十怎么算最快？', answer: '（9+1）+（7+3）=20', hint: '找能凑成 10 的一对' }, practice: [{ q: '9+5 = ?', answer: '14', hint: '9+1=10，再加 4', level: '基础' }, { q: '8+6 = ?', answer: '14', hint: '8+2=10，再加 4', level: '提高' }] },
  ] },
  { unit: '100以内数的认识', term: '下', points: [
    { id: '1.13', title: '100以内数的认识', subtitle: '十和一', how: '10 个一是 1 个十。', why: '十位值是 10。', wrong: '46 比 38 小', wrongWhy: '只看了个位。', visual: '百数表。', method: '捆小棒', explainBack: '46 有 4 个十。', tryIt: '捆 4 捆加 6 根。', demo: 'hundred', recall: { q: '46 里有几个十？', answer: '4 个十', hint: '4 在十位上' }, practice: [{ q: '38 有几个十几个一？', answer: '3 个十 8 个一', hint: '3 在十位，8 在个位', level: '基础' }, { q: '比 46 大 1 的数是？', answer: '47', hint: '个位加 1', level: '提高' }] },
  ] },
  { unit: '准备课', term: '上', points: [
    { id: '1.1', title: '数数、比多少', subtitle: '数一数、一一对应', how: '点一个数一个，一个对一个连起来。', why: '最后数到的就是总数。', wrong: '多数一个或漏数一个', wrongWhy: '没有一个一个点着数。', visual: '两排圆点。', method: '配对法', explainBack: '一个对一个，剩下的就是多的。', tryIt: '点圆点数一数。', demo: 'count', recall: { q: '上面 5 个、下面 7 个，哪排多、多几个？', answer: '下面多 2 个', hint: '一个对一个连起来' }, practice: [{ q: '上面 4 个、下面 4 个，哪排多？', answer: '一样多', hint: '一个对一个，一个不剩', level: '基础' }, { q: '上面 10 个、下面 0 个，哪排多？', answer: '上面多 10 个', hint: '下面是空的，是 0', level: '提高' }] },
  ] },
  { unit: '认识钟表', term: '上', points: [
    { id: '1.8', title: '认识钟表', subtitle: '整时、半点', how: '短针是时针，长针是分针。', why: '分针转一圈，时针走一格。', wrong: '长针短针分不清', wrongWhy: '只看长短，没看走得快慢。', visual: '钟面。', method: '联动表针钟', explainBack: '分针指着 12 就是整时。', tryIt: '拨到 7 点。', demo: 'clock', recall: { q: '分针指着 12，时针指着 7，是几点？', answer: '7 点', hint: '整时看时针' }, practice: [{ q: '分针指着 6，时针在 7 和 8 中间，是几点？', answer: '7 点半', hint: '分针指着 6 是半点', level: '基础' }, { q: '6 点往前推 3 小时是几点？', answer: '3 点', hint: '6 减 3', level: '提高' }] },
  ] },
] };
const GRADE2_CONTENT = { grade: 2, edition: 'A', units: [
  { unit: '长度单位', term: '上', points: [
    { id: '2.1', title: '长度单位、线段', subtitle: '厘米、米、线段', how: '从 0 量起。', why: '长度就是数几个单位放得下。', wrong: '从刻度 1 开始量', wrongWhy: '会多算 1 厘米。', visual: '可拖动的尺子。', method: '从0量起 + 身体尺', explainBack: '我从0开始量，到7就是7厘米。', tryIt: '量一量铅笔。', demo: 'ruler', recall: { q: '从 1 量到 8 是几厘米？', answer: '7厘米', hint: '从1量到8是7个1厘米' }, practice: [{ q: '5厘米加3厘米是几厘米？', answer: '8厘米', hint: '5+3=8', level: '基础' }, { q: '1米减30厘米剩几厘米？', answer: '70厘米', hint: '1米是100厘米', level: '提高' }] },
  ] },
  { unit: '100以内的加法和减法（二）', term: '上', points: [
    { id: '2.3', title: '进位加法、退位减法', subtitle: '进位加法、退位减法、满十进一', how: '10个一换成1个十。', why: '进位是换，总数不变。', wrong: '借1以后要还', wrongWhy: '借来的十已经用掉了。', visual: '数位块换一换。', method: '数位块“换”动画', explainBack: '10个一换成1个十，总数不变。', tryIt: '摆一摆27+15。', demo: 'tenframe', recall: { q: '52-17，个位不够减怎么办？', answer: '从十位借1个十', hint: '12-7=5' }, practice: [{ q: '27+15 = ?', answer: '42', hint: '个位7+5=12', level: '基础' }, { q: '64-28 = ?', answer: '36', hint: '个位借1个十', level: '提高' }] },
  ] },
] };
// 桩里的四年级内容：只留点进实验要用的三个点（4.4 新演示、4.17 复用 observe、4.11 新演示）。
const GRADE4_CONTENT = { grade: 4, edition: 'A', units: [
  { unit: '三位数乘两位数', term: '上', points: [
    { id: '4.4', title: '三位数乘两位数', subtitle: '竖式、积的变化规律、速度×时间=路程', how: '123×45，先拆45=40+5。', why: '乘法是面积。', wrong: '123×45=123×4+123×5', wrongWhy: '45里的4是40。', visual: '面积模型。', method: '面积模型拆两边', explainBack: '45是40和5。', tryIt: '在面积图上算一算125×16。', demo: 'areamodel', recall: { q: '算123×45时，123×4这一步对吗？', answer: '不对；4是40', hint: '45的4在十位上' }, practice: [{ q: '一辆汽车每小时行65千米，4小时行多少千米？', answer: '260千米', hint: '路程=速度×时间', level: '基础' }, { q: '算一算138×24。', answer: '3312', hint: '138×20=2760，138×4=552', level: '提高' }] },
  ] },
  { unit: '观察物体（二）', term: '下', points: [
    { id: '4.17', title: '观察物体（二）', subtitle: '从三个方向看组合体', how: '从前面、左面、上面三个方向看。', why: '一个方向只能看到一面。', wrong: '从前面看有3个正方形，就以为一共只有3个', wrongWhy: '后面可能还藏着。', visual: '搭一搭再转一转。', method: '三视图+逐层数', explainBack: '从前面看是3个，不等于一共3个。', tryIt: '用4个小正方体摆一个图形。', demo: 'observe', recall: { q: '从上面看是2个正方形，从前面看也是2个正方形，最少用几个小正方体？', answer: '2个', hint: '并排摆2个' }, practice: [{ q: '3个小正方体排成一排，从左面看是几个正方形？', answer: '1个', hint: '后面的都被第一个挡住了', level: '基础' }, { q: '从前面看是2个正方形，从上面看是3个正方形，最少用几个小正方体？', answer: '3个', hint: '上面3个格子，每个格子至少1个', level: '提高' }] },
  ] },
  { unit: '小数的意义和性质', term: '下', points: [
    { id: '4.11', title: '小数的意义和性质', subtitle: '小数的意义、小数点移动、化简', how: '小数就是分母是10、100、1000的分数。', why: '0.5=0.50，是因为把每个十分之一再切成10个百分之一。', wrong: '0.5比0.50小', wrongWhy: '5个十分之一就是50个百分之一。', visual: '数位滑块。', method: '数位滑块', explainBack: '0.5和0.50一样。', tryIt: '在数位表上滑一滑：2.4乘10。', demo: 'placeslider', recall: { q: '0.5和0.50，哪个大？', answer: '一样大', hint: '把每个十分之一切成10个百分之一' }, practice: [{ q: '3.5×10是多少？3.5÷10呢？', answer: '35；0.35', hint: '乘10数字向左移一位', level: '基础' }, { q: '一个小数的小数点向右移动两位后是36，原来的小数是多少？', answer: '0.36', hint: '小数点向右移两位是乘100', level: '提高' }] },
  ] },
] };

// 桩里的五年级内容：只留点进实验要用的三个点（5.1 新演示、5.14 复用 observe、5.5 复用 balance）。
const GRADE5_CONTENT = { grade: 5, edition: 'A', units: [
  { unit: '小数乘法', term: '上', points: [
    { id: '5.1', title: '小数乘法', subtitle: '小数乘整数、小数乘小数、积的近似值', how: '先当整数乘，再点小数点。', why: '十分之一乘十分之一是百分之一。', wrong: '0.3×0.4=1.2', wrongWhy: '0.3×0.4 是 0.4 的一部分。', visual: '单位正方形重叠。', method: '单位正方形重叠', explainBack: '0.3 是 3 个十分之一。', tryIt: '画一个正方形涂一涂。', demo: 'decmul', recall: { q: '0.3×0.4 是比 0.4 大，还是比 0.4 小？', answer: '比 0.4 小，是 0.12', hint: '是 0.4 的十分之三' }, practice: [{ q: '0.5×0.6 = ?', answer: '0.3', hint: '5×6=30', level: '基础' }, { q: '2.4×0.5 = ?', answer: '1.2', hint: '24×5=120', level: '提高' }] },
  ] },
  { unit: '观察物体（三）', term: '下', points: [
    { id: '5.14', title: '观察物体（三）', subtitle: '一个方向看不全，要三个方向', how: '三个方向合起来才能确定。', why: '一个方向只能看到一面。', wrong: '从前面看是 2 个正方形，就以为只有一种摆法', wrongWhy: '后面可以藏、上面可以摞。', visual: '猜积木。', method: '三视图定形', explainBack: '一个方向看不全。', tryIt: '摆 3 个小正方体。', demo: 'observe', recall: { q: '从前面看是 2 个正方形，这个立体图形有几种可能？', answer: '不止一种', hint: '后面藏几个看不出来' }, practice: [{ q: '从左面看是 1 个正方形，从前面看是 2 个正方形，最少用几个小正方体？', answer: '2 个', hint: '并排摆 2 个', level: '基础' }, { q: '从上面看是 4 个正方形（2 行 2 列），从前面看是 2 个正方形，最少用几个小正方体？', answer: '4 个', hint: '每个格子至少 1 个', level: '提高' }] },
  ] },
  { unit: '简易方程', term: '上', points: [
    { id: '5.5', title: '简易方程', subtitle: '用字母表示数、解方程', how: '字母 x 是一个还不知道的数。', why: '等式是一架天平。', wrong: 'x+5=x5', wrongWhy: 'x+5 是那个数加 5。', visual: '天平。', method: '天平解方程', explainBack: '两边都拿走 5。', tryIt: '在天平上摆一摆。', demo: 'balance', recall: { q: 'x+5 是什么意思？', answer: '一个不知道的数加 5', hint: 'x 是一个数' }, practice: [{ q: 'x+5=12，x 是几？', answer: '7', hint: '两边同时减 5', level: '基础' }, { q: '2x+3=11，x 是几？', answer: '4', hint: '先减 3 再除以 2', level: '提高' }] },
  ] },
] };
// 桩里的六年级内容：只留点进实验要用的四个点（6.3 新演示、6.1 复用 fraction、6.12 复用 function、6.13 新演示）。
const GRADE6_CONTENT = { grade: 6, edition: 'A', units: [
  { unit: '分数乘法', term: '上', points: [
    { id: '6.1', title: '分数乘法', subtitle: '分数乘分数', how: '分子乘分子、分母乘分母。', why: '重叠的小格数就是分子乘分子。', wrong: '2/3 × 4/5 = 6/8', wrongWhy: '图里一共 15 小格，重叠了 8 格。', visual: '双色重叠网格。', method: '双色重叠面积', explainBack: '重叠是 15 格里的 8 格。', tryIt: '在方格纸上画一画。', demo: 'fraction', recall: { q: '2/3 × 4/5 是 8/15 还是 6/8？', answer: '8/15', hint: '分子乘分子' }, practice: [{ q: '3/4 × 2/5 = ?', answer: '6/20 = 3/10', hint: '3×2=6', level: '基础' }, { q: '一根绳子长 5/6 米，用去它的 3/5，用去多少米？', answer: '用去 1/2 米', hint: '5/6 × 3/5', level: '提高' }] },
  ] },
  { unit: '位置与方向（二）', term: '上', points: [
    { id: '6.3', title: '位置与方向（二）', subtitle: '方向+距离确定位置', how: '方向加距离才能定住一个点。', why: '只说方向是一条射线。', wrong: '说“它在东北方向”就够了', wrongWhy: '没说多远，不知道是射线上的哪个点。', visual: '雷达扫。', method: '雷达扫', explainBack: '北偏东 30 度、200 米远，才是一个确切的地方。', tryIt: '在操场上量一量。', demo: 'radar', recall: { q: '只说“东偏北 40°”，能找到小红家吗？', answer: '不能', hint: '那是一条射线' }, practice: [{ q: '图书馆在学校北偏西 30°、400 米处，能到吗？', answer: '能', hint: '方向和距离都对了', level: '基础' }, { q: 'A 地在 B 地南偏东 60°、500 米处，B 地在 A 地什么方向？', answer: '北偏西 60°、500 米', hint: '方向反过来', level: '提高' }] },
  ] },
  { unit: '比例', term: '下', points: [
    { id: '6.12', title: '比例', subtitle: '正比例、反比例、比例尺', how: '正比例比值一定，反比例乘积一定。', why: '交叉相乘是因为两边同时乘分母。', wrong: 'x 变大，y 一定变大', wrongWhy: '只对正比例说。', visual: '双数轴。', method: '双数轴 + 定积长方形', explainBack: 'x 变大一倍，y 变小一半，乘积不变。', tryIt: '买 3 支铅笔花 6 元，买 5 支要多少钱？', demo: 'function', recall: { q: 'x 和 y 成正比例，x 是 2 时 y 是 6，x 是 5 时 y 是几？', answer: '15', hint: '比值是 3' }, practice: [{ q: '解比例：x:6 = 4:3，求 x。', answer: '8', hint: '内项积 = 外项积', level: '基础' }, { q: '比例尺 1:50000，图上 4 厘米是实际多少千米？', answer: '2 千米', hint: '4×50000 厘米', level: '提高' }] },
  ] },
  { unit: '数学广角——鸽巢问题', term: '下', points: [
    { id: '6.13', title: '鸽巢问题', subtitle: '鸽巢原理', how: '先每个巢放 1 只，第 n+1 只没地方去，只能合住。', why: '这是数出来的，不是运气。', wrong: '可能发生，但不一定', wrongWhy: '这是计数证明。', visual: '鸽洞动画。', method: '先每洞一只', explainBack: '每个洞先放一只，下一只只能合住。', tryIt: '拿 5 支笔放进 4 个笔筒。', demo: 'pigeon', recall: { q: '5 只鸽子飞进 4 个鸽巢，一定有一个巢里至少有几只？', answer: '2 只', hint: '每个巢先放 1 只' }, practice: [{ q: '把 10 个苹果放进 9 个抽屉，至少有一个抽屉里有几个？', answer: '2 个', hint: '每个抽屉先放 1 个', level: '基础' }, { q: '把 13 支铅笔放进 4 个文具盒，至少有一个盒里有几支？', answer: '4 支', hint: '每个盒先放 3 支', level: '提高' }] },
  ] },
] };

// 桩里的七年级内容：只留点进实验要用的七个点（7.1/7.2 共用 numline、7.6/7.14 复用 balance、7.7 新演示 meetline、7.13 新演示 coordplane、7.16 新演示 histogram）。
const GRADE7_CONTENT = { grade: 7, edition: 'A', units: [
  { unit: '有理数', term: '上', points: [
    { id: '7.1', title: '正数和负数、有理数与数轴', subtitle: '正负数、有理数、数轴、相反数、绝对值', how: '正数前面加一个“+”，负数前面加一个“-”。', why: '负数是“欠”的数。', wrong: '0是正数', wrongWhy: '0既不是正数也不是负数。', visual: '数轴。', method: '数轴排队法', explainBack: '正数在原点右边，负数在原点左边。', tryIt: '在数轴上标出-3。', demo: 'numline', recall: { q: '-3和-5，哪个大？', answer: '-3大', hint: '数轴上-3在-5的右边' }, practice: [{ q: '-2.5在原点的哪一边？', answer: '左边，2.5个单位', hint: '负数在原点左边', level: '基础' }, { q: '写出所有大于-3、小于2的整数。', answer: '-2、-1、0、1', hint: '从-2数到1', level: '提高' }] },
    { id: '7.2', title: '有理数的加减法', subtitle: '有理数加法、减法、加减混合', how: '同号相加符号不变，异号相加取绝对值大的符号。', why: '加法就是数轴上的移动。', wrong: '-5+3=-8', wrongWhy: '异号相加，5-3=2，取负号，得-3。', visual: '数轴小人走路。', method: '数轴走路法', explainBack: '减法就是加相反数。', tryIt: '在数轴上算一算-4+7。', demo: 'numline', recall: { q: '-7+4等于几？', answer: '-3', hint: '异号相加' }, practice: [{ q: '计算：(-8)+(+5)。', answer: '-3', hint: '8-5=3，取负号', level: '基础' }, { q: '计算：3-(-4)-2。', answer: '5', hint: '先把减法变成加法', level: '提高' }] },
  ] },
  { unit: '一元一次方程', term: '上', points: [
    { id: '7.6', title: '解一元一次方程', subtitle: '等式的性质、移项、去括号、去分母', how: '等式两边同时加减乘除同一个数，等式还成立。', why: '方程是一架天平。', wrong: '移项不变号', wrongWhy: '移项要变号。', visual: '天平。', method: '天平平衡法', explainBack: '两边同时做同样的事，天平还平着。', tryIt: '用天平解一解3x-5=7。', demo: 'balance', recall: { q: '解方程2x+6=14，第一步应该做什么？', answer: '两边同时减6，得2x=8', hint: '先把+6搬走' }, practice: [{ q: '解方程：3x-5=7。', answer: 'x=4', hint: '先移项', level: '基础' }, { q: '解方程：(2x-1)/3-(x+2)/2=1。', answer: 'x=14', hint: '两边同乘6', level: '提高' }] },
    { id: '7.7', title: '实际问题与一元一次方程', subtitle: '设未知数、找等量关系、列方程', how: '设未知数、找等量关系、列方程、解方程并检验。', why: '列方程就是把不知道的数当成已知数。', wrong: '设了x却不用x列式', wrongWhy: '设x就是为了用x写等量关系。', visual: '等量关系拼图。', method: '等量关系拼图', explainBack: '设未知数，找等量关系，列方程。', tryIt: '小明买3支笔花了12元，列方程并解。', demo: 'meetline', recall: { q: '甲比乙多5个，乙有x个，甲有几个？', answer: 'x+5个', hint: '多5就是加5' }, practice: [{ q: '小明买3支笔花了12元，每支笔几元？', answer: '4元', hint: '设每支笔x元，3x=12', level: '基础' }, { q: '甲、乙两地相距120千米，甲每小时行15千米，乙每小时行25千米，两人同时出发相向而行，几小时相遇？', answer: '3小时', hint: '甲走的路程加乙走的路程等于120千米', level: '提高' }] },
  ] },
  { unit: '相交线与平行线', term: '下', points: [
    { id: '7.11', title: '平行线与平移', subtitle: '平行线的判定与性质、平移', how: '同位角相等、内错角相等、同旁内角互补，都能推出两直线平行。', why: '判定和性质是一对反话。', wrong: '把判定和性质背反了', wrongWhy: '判定是原因、性质是结果，方向不能反。', visual: '平行线被截，角亮灯。', method: '亮灯辨角法', explainBack: '同位角相等、内错角相等、同旁内角互补，都能判定平行。', tryIt: '画两条平行线，再画一条截线，标出所有的角。', demo: 'parangles', recall: { q: '∠1和∠2是同位角，∠1=∠2，能说明这两条直线平行吗？', answer: '能', hint: '同位角相等，两直线平行' }, practice: [{ q: '两条平行线被第三条直线所截，一个同位角是70°，另一个同位角是多少度？', answer: '70°', hint: '两直线平行，同位角相等', level: '基础' }, { q: 'AB∥CD，E在AB、CD之间，∠A=120°，∠C=25°，求∠AEC的度数。', answer: '85°', hint: '过E作EF∥AB', level: '提高' }] },
  ] },
  { unit: '平面直角坐标系', term: '下', points: [
    { id: '7.13', title: '平面直角坐标系', subtitle: '坐标、象限、对称点', how: '横轴叫x轴，竖轴叫y轴，交点是原点O。', why: '坐标是给平面上的点编地址。', wrong: '(3,2)和(2,3)是同一个点', wrongWhy: '有序数对先横后纵。', visual: '坐标网格。', method: '编地址法', explainBack: '先横后纵。', tryIt: '在坐标纸上标出(2,3)。', demo: 'coordplane', recall: { q: '点P(2,-3)在第几象限？', answer: '第四象限', hint: 'x是正的，y是负的' }, practice: [{ q: '写出点A(3,4)关于x轴的对称点坐标。', answer: '(3,-4)', hint: '横坐标不变，纵坐标变号', level: '基础' }, { q: '点P(m+1,2m-4)在y轴上，求m的值和点P的坐标。', answer: 'm=-1，P(0,-6)', hint: '在y轴上，横坐标是0', level: '提高' }] },
  ] },
  { unit: '二元一次方程组', term: '下', points: [
    { id: '7.14', title: '二元一次方程组与消元', subtitle: '二元一次方程组、代入消元、加减消元', how: '消元就是把两个未知数变成一个。', why: '先干掉一个，再一个一个解。', wrong: '代入时把y=2x+1代回原方程后还留着y', wrongWhy: '代入就是把y换成2x+1。', visual: '天平。', method: '消元降维法', explainBack: '消元就是把两个未知数变成一个。', tryIt: '解方程组{x+y=7,x-y=3}。', demo: 'balance', recall: { q: '方程组{x+y=5,x-y=1}，把两个方程相加，y会怎么样？', answer: 'y被消掉了，得2x=6', hint: '+y和-y抵消' }, practice: [{ q: '解方程组：{x+y=7,x-y=3}。', answer: 'x=5，y=2', hint: '两式相加得2x=10', level: '基础' }, { q: '解方程组：{2x+3y=8,x-2y=-3}。', answer: 'x=1，y=2', hint: '由第二个方程得x=2y-3', level: '提高' }] },
  ] },
  { unit: '数据的收集、整理与描述', term: '下', points: [
    { id: '7.16', title: '统计调查与直方图', subtitle: '全面调查、抽样调查、频数、直方图', how: '全面调查问所有人，抽样调查抽一部分。', why: '抽样调查省时间，但样本偏了结论就偏了。', wrong: '样本越大越好，不管随机不随机', wrongWhy: '样本再大，不随机也白搭。', visual: '直方图生成器。', method: '随机抽样法', explainBack: '样本要随机，不然结论会偏。', tryIt: '把全班身高数据画成直方图。', demo: 'histogram', recall: { q: '调查全校学生的午餐喜好，只抽10个自己班的同学，样本有代表性吗？', answer: '没有', hint: '只抽一个班' }, practice: [{ q: '某班40名学生，身高在150~160厘米的有12人，这组的频数是多少？频率是多少？', answer: '频数12，频率0.3', hint: '频率=12÷40', level: '基础' }, { q: '50名学生参加数学竞赛，成绩在80~90分的有15人，在90~100分的有10人，80分以上的一共有多少人？', answer: '25人，占1/2', hint: '15+10=25人', level: '提高' }] },
  ] },
] };
const lsData = {};
const localStorageStub = { getItem(k) { return lsData[k] || null; }, setItem(k, v) { lsData[k] = String(v); } };

// Static seg buttons live in index.html; the stub never parses HTML, so
// seed them here (dataset + parent) before app.js loads, or the G1 demos'
// seg handlers never bind in the stub. (Real browser: the buttons are in
// the HTML and the same querySelectorAll finds them.)
function seedSeg(segId, attr, values) {
  const seg = documentStub.getElementById(segId);
  values.forEach(v => {
    const b = makeEl('button');
    b.dataset[camelData('data-' + attr)] = v;
    seg.appendChild(b);
  });
}
seedSeg('splitTotalSeg', 'split-total', ['3', '4', '5']);
seedSeg('addsubModeSeg', 'addsub-mode', ['add', 'sub']);
seedSeg('sortRuleSeg', 'sort-rule', ['color', 'shape']);

// ---------- load the real app.js ----------
const root = require('path').resolve(__dirname, '..');
const src = fs.readFileSync(root + '/apps/web/app.js', 'utf8');
const sandbox = { document: documentStub, window: windowStub, console, setTimeout, Math, JSON, Object, Array, String, Number, parseInt, parseFloat, isNaN, GRADE3_CONTENT, GRADE1_CONTENT, GRADE2_CONTENT, GRADE4_CONTENT, GRADE5_CONTENT, GRADE6_CONTENT, GRADE7_CONTENT, localStorage: localStorageStub };
vm.createContext(sandbox);
try {
  vm.runInContext(src, sandbox, { filename: 'app.js' });
  console.log('LOAD OK');
} catch (e) { console.log('LOAD FAILED: ' + e.message); process.exit(1); }

const navGo = sandbox.navGo;
const gradeDetail = byId.gradeDetail;
const pointDetail = byId.pointDetail;
const gradePanels = byId.gradePanels;
function click(el) { (el._handlers.click || []).forEach(f => f({ target: el })); }
// pointDetail uses delegated clicks: dispatch on pointDetail with the button as target.
function clickPD(el) { (pointDetail._handlers.click || []).forEach(f => f({ target: el })); }

// ---------- 1. view isolation (gate) ----------
// 首次加载不再预选 3 年级：加载完、还没点过任何年级时，9 块年级面板都不该被选中。
check('no grade pre-selected on first load',
  [...gradePanels.children].every(el => el.getAttribute('aria-selected') === 'false'));
check('home: hero + panels visible, modules hidden',
  byId.hero.hidden === false && byId.panels.hidden === false &&
  byId.grades.hidden === true && byId.dimensions.hidden === true &&
  byId.demos.hidden === true && byId.why.hidden === true && byId.review.hidden === true);
navGo('grades');
check('grades list: panels visible, detail hidden',
  byId.gradePanels.hidden === false && gradeDetail.hidden === true);
check('grades list: grades section visible, demos hidden',
  byId.grades.hidden === false && byId.demos.hidden === true);
navGo('grade-3');
check('grade-3 detail visible, panels hidden',
  gradeDetail.hidden === false && byId.gradePanels.hidden === true);
check('grade-3 shows real units + mix/review buttons',
  gradeDetail.innerHTML.includes('分数的初步认识') && gradeDetail.innerHTML.includes('混着练') &&
  gradeDetail.innerHTML.includes('今天复习'));

// ---------- 2. grade 3 content ----------
navGo('unit-3-0');
check('unit view: point list in pointDetail', pointDetail.innerHTML.includes('3.7'));
check('unit view: gradeDetail hidden', gradeDetail.hidden === true);
navGo('point-3.7');
check('point page: how', pointDetail.innerHTML.includes('怎么做'));
check('point page: why', pointDetail.innerHTML.includes('为什么'));
check('point page: misconception', pointDetail.innerHTML.includes('容易错'));
check('point page: visual', pointDetail.innerHTML.includes('看图学'));
check('point page: tryIt + demo button', pointDetail.innerHTML.includes('动手试一试') && pointDetail.innerHTML.includes('去玩分数演示'));
check('point page: explain-back', pointDetail.innerHTML.includes('讲回来'));
check('point page: practice', pointDetail.innerHTML.includes('练一练'));
const qaAns = pointDetail.querySelector('[data-qa-a="0"]');
qaAns.hidden = true;
const qaBtn = makeEl('button'); qaBtn.dataset.qa = '0';
clickPD(qaBtn);
check('qa toggle reveals answer', qaAns.hidden === false);
check('recall section present', pointDetail.innerHTML.includes('先考一考'));
check('recall before how', pointDetail.innerHTML.indexOf('先考一考') < pointDetail.innerHTML.indexOf('怎么做'));
const recallAns = pointDetail.querySelector('[data-recall-a]');
recallAns.hidden = true;
const recallBtn = makeEl('button'); recallBtn.dataset.recall = '1';
clickPD(recallBtn);
check('recall toggle reveals answer', recallAns.hidden === false);
check('hints: Q1 and Q2 hints both hidden behind buttons', pointDetail.innerHTML.includes('要提示') && pointDetail.innerHTML.includes('data-hint-t="0" hidden') && pointDetail.innerHTML.includes('data-hint-t="1" hidden') && !pointDetail.innerHTML.includes('<p class="hint">提示：'));
check('qa reveal unhides mark row', pointDetail.querySelector('[data-qa-mark="0"]').hidden === false);
const row = pointDetail.querySelector('[data-qa-mark="0"]');
row.dataset.point = '3.7'; row.dataset.qaMark = '0';
const markBtn = makeEl('button'); markBtn.dataset.mark = 'right';
const confBtn = makeEl('button'); confBtn.dataset.conf = 'yes';
markBtn.closest = (sel) => sel === '[data-mark]' ? markBtn : (sel === '[data-qa-mark]' ? row : null);
confBtn.closest = (sel) => sel === '[data-conf]' ? confBtn : (sel === '[data-qa-mark]' ? row : null);
clickPD(markBtn); clickPD(confBtn);
const stored = JSON.parse(lsData['math-review-v1'] || '{}');
check('self-mark recorded for 3.7', stored['3.7'] && stored['3.7'].correct === true && stored['3.7'].streak === 1);
check('saved message shown', pointDetail.querySelector('[data-qa-saved="0"]').hidden === false);

// ---------- 3. mix / review / crumbs / back ----------
navGo('grade-3-mix');
check("viewForKey('grade-3-mix') is mix", sandbox.viewForKey('grade-3-mix') === 'mix');
check('mix renders questions', (pointDetail.innerHTML.match(/data-qa="/g) || []).length >= 3);
navGo('grade-3-review');
check("viewForKey('grade-3-review') is review", sandbox.viewForKey('grade-3-review') === 'review');
check('review page renders', pointDetail.innerHTML.includes('今天复习') && pointDetail.innerHTML.includes('练过 1 条'));
navGo('unit-3-0');
const crumbBtn = makeEl('button'); crumbBtn.dataset.crumb = '2';
(byId.crumbTitle._handlers.click || []).forEach(f => f({ target: crumbBtn }));
check('crumb 3 年级 returns to grade detail', gradeDetail.hidden === false && gradeDetail.innerHTML.includes('分数的初步认识'));
navGo('point-3.7');
sandbox.goDemoFromHere('demo-fraction');
check('demo from point keeps point as parent', byId.crumbTitle.innerHTML.includes('分数的初步认识'));
sandbox.navBackFn();
check('back from demo returns to point page', pointDetail.innerHTML.includes('先考一考'));
navGo('grade-3-mix');
sandbox.navBackFn();
check('back from mix returns to grade detail', gradeDetail.hidden === false);

// ---------- 4. grade 1 ----------
navGo('grade-1');
check('grade-1 shows real units', gradeDetail.innerHTML.includes('20以内的进位加法') && gradeDetail.innerHTML.includes('100以内数的认识'));
check('grade-1 has mix/review buttons', gradeDetail.innerHTML.includes('混着练') && gradeDetail.innerHTML.includes('今天复习'));
navGo('unit-1-0');
check('grade-1 unit view lists points', pointDetail.innerHTML.includes('1.9'));
navGo('point-1.9');
check('point 1.9 shows olympiad section', pointDetail.innerHTML.includes('挑战 · 奥数') && pointDetail.innerHTML.includes('9+7+1+3'));
check('point 1.9 shows level pills', pointDetail.innerHTML.includes('基础') && pointDetail.innerHTML.includes('提高'));
check('point 1.9 links ten-frame demo', pointDetail.innerHTML.includes('去玩十格阵') && pointDetail.innerHTML.includes('data-demo-link="demo-tenframe"'));
const olyAns = pointDetail.querySelector('[data-olympiad-a]');
olyAns.hidden = true;
const olyBtn = makeEl('button'); olyBtn.dataset.olympiad = '1';
clickPD(olyBtn);
check('olympiad toggle reveals answer', olyAns.hidden === false);
navGo('grade-1-mix');
check("viewForKey('grade-1-mix') is mix", sandbox.viewForKey('grade-1-mix') === 'mix');
check('grade-1 mix renders questions', pointDetail.innerHTML.includes('看答案') && pointDetail.hidden === false);
navGo('grade-1-review');
check("viewForKey('grade-1-review') is review", sandbox.viewForKey('grade-1-review') === 'review');
check('grade-1 review renders', pointDetail.innerHTML.includes('今天复习'));
navGo('grade-1-mix');
sandbox.navBackFn();
check('back from grade-1 mix returns to grade detail', gradeDetail.hidden === false && gradeDetail.innerHTML.includes('20以内的进位加法'));

// ---------- 5. ten-frame demo ----------
check('tenframe initial equation', byId.tfEq.textContent === '9 + 4 = ?');
const bCell0 = byId.tfB.children[0];
click(bCell0);
check('tenframe: click B cell moves one to fill ten', byId.tfEq.textContent === '9 + 4 = 13');
check('tenframe note explains 10+3', byId.tfNote.textContent.includes('10 + 3 = 13'));
check('demo counter counts a played demo', byId.progressCount.textContent === '1 / 98' &&
  JSON.parse(lsData['math-tried-demos-v1'] || '[]').includes('tenframe'));
sandbox.tfSetProblem('sub', 0);
check('tenframe sub initial equation', byId.tfEq.textContent === '13 − 5 = ?');
const aCell0 = byId.tfA.children[0];
click(aCell0);
check('tenframe sub: click A cell takes one away', byId.tfNote.textContent.includes('已经拿走 1 个'));
click(byId.tfAuto);
check('tenframe sub auto break-ten', byId.tfEq.textContent === '13 − 5 = 8');
navGo('demo-tenframe');
check('demo-tenframe view: demos section visible', byId.demos.hidden === false && documentStub.body.dataset.view === 'demo-tenframe');
navGo('point-1.9');
sandbox.goDemoFromHere('demo-tenframe');
sandbox.navBackFn();
check('back from ten-frame demo returns to point page', pointDetail.innerHTML.includes('挑战 · 奥数'));

// ---------- 6. challenge mode (visible error feedback) ----------
// index.html puts a `hidden` attribute on the SVG target dot; the stub's plain
// `.hidden` property cannot represent it (SVGElement has no `hidden` IDL — see
// the 2026-11-06 real-browser defect), so seed the attribute here to mirror
// the real initial DOM. Checks below must assert on the ATTRIBUTE, not the
// property, or the dot bug stays invisible to this test.
byId.lineTargetDot.setAttribute('hidden', '');
// fraction: target 3/4, wrong build shows the numeric gap + marks slices
navGo('demo-fraction');
click(byId.fracChallengeBtn);
check('frac challenge: target shown', byId.fracChallengeTarget.textContent.includes('3/4'));
check('frac challenge: empty build reports missing', byId.fracChallengeMsg.textContent.includes('少了 3/4'));
check('frac challenge: target dot shown on number line', byId.lineTargetDot.getAttribute('hidden') === undefined);
const numRange = byId.numRange; numRange.value = '3';
(numRange._handlers.input || []).forEach(f => f({ target: numRange }));
check('frac challenge: 3/4 is correct', byId.fracChallengeMsg.textContent.includes('拼对了'));
numRange.value = '2';
(numRange._handlers.input || []).forEach(f => f({ target: numRange }));
check('frac challenge: 2/4 reports missing + marks missing slice green', byId.fracChallengeMsg.textContent.includes('少了') && byId.pieSvg.innerHTML.includes('#bbf7d0'));
numRange.value = '4';
(numRange._handlers.input || []).forEach(f => f({ target: numRange }));
check('frac challenge: 4/4 reports extra + marks extra slice red', byId.fracChallengeMsg.textContent.includes('多了') && byId.pieSvg.innerHTML.includes('#ef4444'));
// Cross-denominator marking (the 2026-11-06 real-browser defect): the pie must
// mark the difference by VALUE, not by denominator equality.
click(byId.denomSeg.children[4]); // denominator 8
numRange.value = '5';
(numRange._handlers.input || []).forEach(f => f({ target: numRange }));
check('frac challenge: 5/8 vs 3/4 reports missing 1/8', byId.fracChallengeMsg.textContent.includes('少了 1/8'));
check('frac challenge: 5/8 vs 3/4 marks missing slice green', byId.pieSvg.innerHTML.includes('#bbf7d0'));
check('frac challenge: target dot sits at 3/4 on the number line', byId.lineTargetDot.getAttribute('hidden') === undefined && byId.lineTargetDot.getAttribute('cx') === '230');
click(byId.fracChallengeNext); // target 1/2
numRange.value = '5';
(numRange._handlers.input || []).forEach(f => f({ target: numRange }));
check('frac challenge: 5/8 vs 1/2 reports extra 1/8', byId.fracChallengeMsg.textContent.includes('多了 1/8'));
check('frac challenge: 5/8 vs 1/2 marks extra slice red', byId.pieSvg.innerHTML.includes('#ef4444'));
click(byId.fracChallengeBtn); // exit, restores denom 4 / numer 3
click(byId.fracChallengeBtn); // re-enter, target 3/4 again
click(byId.denomSeg.children[4]); // denominator 8
numRange.value = '6';
(numRange._handlers.input || []).forEach(f => f({ target: numRange }));
check('frac challenge: 6/8 = 3/4 counts as correct, no error marking', byId.fracChallengeMsg.textContent.includes('拼对了') && !byId.pieSvg.innerHTML.includes('#ef4444') && !byId.pieSvg.innerHTML.includes('#bbf7d0'));
click(byId.fracChallengeBtn);
check('frac challenge: exit hides box + target dot', byId.fracChallengeBox.hidden === true && byId.lineTargetDot.getAttribute('hidden') === '');

// ten-frame: target total 13, free placement, extra cell marked red
sandbox.tfSetProblem('add', 0);
navGo('demo-tenframe');
click(byId.tfChallengeBtn);
check('tf challenge: target shown', byId.tfChallengeTarget.textContent.includes('拼出 13'));
check('tf challenge: starts empty', byId.tfEq.textContent === '0 + 0 = 0');
for (let i = 0; i < 9; i++) click(byId.tfA.children[i]);
for (let i = 0; i < 5; i++) click(byId.tfB.children[i]);
check('tf challenge: 9+5=14 reports one extra', byId.tfNote.textContent.includes('多了 1 个'));
check('tf challenge: extra cell gets the extra class', byId.tfB.children[4].classList.contains('extra'));
// The class above IS applied by tfRender, but in a real browser the red never
// showed: `.tf-cell.filled.b` (0,3,0) outranks `.tf-cell.extra` (0,2,0), so the
// blue fill won on frame-B cells. Assert the stylesheet has a rule that wins.
const cssText = fs.readFileSync(root + '/apps/web/styles.css', 'utf8');
check('tf challenge: extra rule beats filled-blue in the stylesheet', cssText.includes('.tf-cell.filled.b.extra'));
click(byId.tfB.children[4]);
check('tf challenge: removing the extra completes it', byId.tfNote.textContent.includes('拼对了'));
click(byId.tfChallengeBtn);
check('tf challenge: exit restores the 9+4 problem', byId.tfEq.textContent === '9 + 4 = ?');

// balance: target 3x+5=20, wrong move shows the numeric gap
navGo('demo-balance');
click(byId.balChallengeBtn);
check('bal challenge: target shown', byId.balChallengeTarget.textContent.includes('3x + 5 = 20'));
check('bal challenge: gap line shows balanced state', byId.balGap.textContent.includes('平的'));
click(byId.balWrong);
check('bal challenge: wrong move shows numeric gap', byId.balGap.textContent.includes('轻 5') && byId.balGap.textContent.includes('还差 5'));
click(byId.balReset);
check('bal challenge: reset re-balances', byId.balGap.textContent.includes('平的'));
click(byId.balMinus5);
check('bal challenge: minus-5 step shows 3x = 15', byId.balGap.textContent.includes('3x = 15'));
click(byId.balDiv3);
check('bal challenge: solved shows x = 5', byId.balGap.textContent.includes('x = 5') && byId.balGap.textContent.includes('拼对了'));
click(byId.balChallengeNext);
check('bal challenge: next problem is 2x+6=16', byId.balChallengeTarget.textContent.includes('2x + 6 = 16'));
click(byId.balChallengeBtn);
check('bal challenge: exit restores 3x+5=20', byId.balanceEq.textContent === '3x + 5 = 20' && byId.balChallengeBox.hidden === true);

// function: target y=2x+1, wrong line shows the gap at a sample point
const kRange = byId.kRange; kRange.value = '2';
const bRange = byId.bRange; bRange.value = '8';
(kRange._handlers.input || []).forEach(f => f({ target: kRange }));
(bRange._handlers.input || []).forEach(f => f({ target: bRange }));
navGo('demo-function');
click(byId.funcChallengeBtn);
check('func challenge: target shown', byId.funcChallengeTarget.textContent.includes('y = 2x + 1'));
check('func challenge: gap reported at a sample point', byId.funcGapMsg.textContent.includes('大了 7') && byId.funcGapMsg.textContent.includes('截距还差 7'));
bRange.value = '1';
(bRange._handlers.input || []).forEach(f => f({ target: bRange }));
check('func challenge: matching the target line wins', byId.funcGapMsg.textContent.includes('画对了'));
click(byId.funcChallengeBtn);
check('func challenge: exit restores k=2, b=8', byId.kRange.value === '2' && byId.bRange.value === '8' && byId.funcChallengeBox.hidden === true);

// ---------- 7. math lab (free play) ----------
navGo('home');
navGo('lab');
check("viewForKey('lab') is lab", sandbox.viewForKey('lab') === 'lab');
check('lab view: lab section visible, hero + demos hidden',
  byId.lab.hidden === false && byId.hero.hidden === true && byId.demos.hidden === true);
check('lab fraction initial readout', byId.labFracText.textContent === '3/4');
click(byId.labFracDenomSeg.children[4]);
check('lab fraction: denominator 8 updates readout', byId.labFracText.textContent === '3/8');
const labCell = byId.labTfA.children[0];
click(labCell);
check('lab ten-frame: click a cell adds one', byId.labTfEq.textContent === '1 + 0 = 1');
click(labCell);
check('lab ten-frame: click again removes it', byId.labTfEq.textContent === '0 + 0 = 0');
check('lab balance initial equation', byId.labBalEq.textContent === '左 5 ＝ 右 3');
click(byId.labBalAddR);
check('lab balance: add right weight updates equation', byId.labBalEq.textContent === '左 5 ＝ 右 4');
const labK = byId.labFuncKRange; labK.value = '-1';
(labK._handlers.input || []).forEach(f => f({ target: labK }));
check('lab function: k slider updates equation', Number(byId.labFuncK.textContent) === -1);
sandbox.navBackFn();
check('back from lab returns home', byId.hero.hidden === false && byId.lab.hidden === true);

// ---------- 9. per-step scoring (分步评分 + 丢分定位) ----------
navGo('point-3.12');
check('question without steps renders no step UI', !pointDetail.innerHTML.includes('看这一步'));
navGo('point-3.7');
check('steps render under a stepped question', pointDetail.innerHTML.includes('看这一步') && pointDetail.innerHTML.includes('第 1 步 · 看分母') && pointDetail.innerHTML.includes('拆成 2 步'));
// all-correct path on Q1 (index 0)
const s0a = pointDetail.querySelector('[data-step-a="0-0"]'); s0a.hidden = true;
const s0m = pointDetail.querySelector('[data-step-mark="0-0"]'); s0m.hidden = true;
const s0Reveal = makeEl('button'); s0Reveal.dataset.stepReveal = '0-0';
clickPD(s0Reveal);
check('step reveal shows step 0', s0a.hidden === false);
check('step reveal unhides its mark row', s0m.hidden === false);
const stepsEl0 = pointDetail.querySelector('[data-steps="0"]'); stepsEl0.dataset.stepsPoint = '3.7';
const row00 = pointDetail.querySelector('[data-step-mark="0-0"]'); row00.dataset.stepMark = '0-0';
const right00 = makeEl('button'); right00.dataset.stepMarkBtn = 'right';
right00.closest = (sel) => sel === '[data-step-mark-btn]' ? right00 : (sel === '[data-step-mark]' ? row00 : null);
clickPD(right00);
check('step right shows saved line', pointDetail.querySelector('[data-step-saved="0-0"]').hidden === false);
const row01 = pointDetail.querySelector('[data-step-mark="0-1"]'); row01.dataset.stepMark = '0-1';
const right01 = makeEl('button'); right01.dataset.stepMarkBtn = 'right';
right01.closest = (sel) => sel === '[data-step-mark-btn]' ? right01 : (sel === '[data-step-mark]' ? row01 : null);
clickPD(right01);
const rep0 = pointDetail.querySelector('[data-step-report="0"]');
check('all steps right shows 全对 report', rep0.hidden === false && rep0.textContent.includes('全对'));
// wrong-step path on Q2 (index 1)
const stepsEl1 = pointDetail.querySelector('[data-steps="1"]'); stepsEl1.dataset.stepsPoint = '3.7';
const row10 = pointDetail.querySelector('[data-step-mark="1-0"]'); row10.dataset.stepMark = '1-0';
const right10 = makeEl('button'); right10.dataset.stepMarkBtn = 'right';
right10.closest = (sel) => sel === '[data-step-mark-btn]' ? right10 : (sel === '[data-step-mark]' ? row10 : null);
clickPD(right10);
const row11 = pointDetail.querySelector('[data-step-mark="1-1"]'); row11.dataset.stepMark = '1-1';
const wrong11 = makeEl('button'); wrong11.dataset.stepMarkBtn = 'wrong';
wrong11.closest = (sel) => sel === '[data-step-mark-btn]' ? wrong11 : (sel === '[data-step-mark]' ? row11 : null);
clickPD(wrong11);
const rep1 = pointDetail.querySelector('[data-step-report="1"]');
check('wrong step names the lost step', rep1.hidden === false && rep1.textContent.includes('第 2 步') && rep1.textContent.includes('分子相加'));
const stored2 = JSON.parse(lsData['math-review-v1'] || '{}');
check('wrong step queues the point for review', stored2['3.7'] && stored2['3.7'].correct === false);

// ---------- 10. 错题本是真列表 + 明天回来 ----------
// 3.7 在第 9 节被记了一次答错（due 明天）。先去知识点页（pointDetail 里是旧内容），
// 再点首页错题本：必须看到真实错题列表，看不到旧的知识点页。
navGo('point-3.7');
navGo('review');
check('home wrong-book shows the real wrong list, not the stale point page',
  byId.reviewCard.innerHTML.includes('3.7') && byId.reviewCard.innerHTML.includes('分数的初步认识') &&
  !byId.reviewCard.innerHTML.includes('占位示例') &&
  pointDetail.hidden === true && byId.grades.hidden === true && byId.review.hidden === false);
check('home wrong-book: review section visible, review card visible',
  byId.review.hidden === false && byId.reviewCard.hidden === false);
// 今天复习：3.7 今天没到期（错了明天才来），所以今天列表是空的，明天回来里有它。
navGo('grade-3-review');
check('tomorrow section lists the wrong step for tomorrow, not today',
  pointDetail.innerHTML.includes('明天回来') &&
  pointDetail.innerHTML.includes('今天没有到期的复习') &&
  pointDetail.innerHTML.indexOf('3.7') > pointDetail.innerHTML.indexOf('明天回来'));
check('grade-3 review still renders after the fix',
  pointDetail.innerHTML.includes('今天复习') && pointDetail.innerHTML.includes('练过 1 条'));

// ---------- 11. 一年级实验（13 个新演示） ----------
// 桩里的静态 seg 按钮是上面预置的（splitTotalSeg / addsubModeSeg /
// sortRuleSeg）；JS 生成的子元素（圆点、格子、积木……）在各自容器的
// children 里。注意桩的 innerHTML = '' 不会清掉 children，所以
// shop/pattern 这类每次渲染重建按钮的演示里，children 会累积——
// 下面按“第几次渲染的第几个子元素”取，见各处注释。
const G1_DEMOS = ['count', 'position', 'split', 'addsub', 'solids', 'bundle',
  'clock', 'tangram', 'sort', 'hundred', 'shop', 'place', 'pattern'];
check('G1: viewForKey covers all 13 new demos',
  G1_DEMOS.every(k => sandbox.viewForKey('demo-' + k) === 'demo-' + k));
navGo('demos');
check('G1: demos list shows panels, grid hidden',
  byId.demos.hidden === false && byId.demoPanels.hidden === false && byId.demoGrid.hidden === true);
let g1ViewsOk = true;
G1_DEMOS.forEach(k => {
  navGo('demo-' + k);
  if (!(byId.demos.hidden === false && documentStub.body.dataset.view === 'demo-' + k)) g1ViewsOk = false;
});
check('G1: all 13 demo views render (demos section visible)', g1ViewsOk);
navGo('demos');
navGo('demo-count');
sandbox.navBackFn();
check('G1: back from a demo returns to the demos list',
  byId.demos.hidden === false && byId.demoPanels.hidden === false);
// Section 5-6 already played all 4 flagship demos, so the counter reads
// '4 / 4' here; G1 demos must not move it.
const g1ProgBefore = byId.progressCount.textContent;

// 1.1 数数
check('count: initial rows', byId.countReadA.textContent === '5 个' && byId.countReadB.textContent === '7 个');
click(byId.countRowA.children[0]);
check('count: click a dot counts it', byId.countCount.textContent.includes('数到了第 1 个'));
click(byId.countCompare);
check('count: 5 vs 7 -> below has 2 more', byId.countResult.textContent.includes('下面多 2 个'));
check('G1 demos count toward the 98-demo progress', g1ProgBefore === '4 / 98' && byId.progressCount.textContent === '5 / 98');
click(byId.countAMinus); click(byId.countAMinus);
check('count: minus twice -> 3', byId.countReadA.textContent === '3 个');

// 1.2 位置
click(byId.posGrid.children[1]); // 北边格子
check('position: star north, facing up -> 前面', byId.posRead.textContent.includes('前面'));
click(byId.posTurn);
check('position: turn right -> star on the left hand', byId.posRead.textContent.includes('左手边'));
click(byId.posFaceMe);
check('position: facing me -> left/right reversed', byId.posRead.textContent.includes('反过来'));

// 1.3 分与合
click(byId.splitPlateL.children[0]);
check('split: move one block -> 1 + 4 = 5', byId.splitEq.textContent === '1 + 4 = 5');
click(byId.splitTake3);
check('split: take 3 means 3 kids', byId.splitTake.textContent.includes('3 个人'));
click(byId.splitKids.children[2]);
check('split: 3rd kid is 1 person', byId.splitOrdinal.textContent.includes('第 3 个') && byId.splitOrdinal.textContent.includes('1 个人'));
click(byId.splitTotalSeg.children[0]); // 总数 3
check('split: total 3 -> 1 + 2 = 3', byId.splitEq.textContent === '1 + 2 = 3');

// 1.4 加减法
click(byId.addsubAPlus);
check('addsub: 3 + 2 = 5', byId.addsubEq.textContent === '3 + 2 = 5');
click(byId.addsubModeSeg.children[1]); // 减法
check('addsub: switch to sub -> 3 - 2 = 1', byId.addsubEq.textContent === '3 − 2 = 1');
click(byId.addsubBPlus);
check('addsub: B up to 3 -> 3 - 3 = 0', byId.addsubEq.textContent === '3 − 3 = 0');
click(byId.addsubBPlus);
check('addsub: B cannot exceed A', byId.addsubHint.textContent.includes('不够减'));

// 1.5 立体图形
click(byId.solidCards.children[0]); // 球
check('solids: select ball', byId.solidResult.textContent.includes('球'));
click(byId.solidRollBtn);
check('solids: ball rolls', byId.solidResult.textContent.includes('滚起来了'));
for (let i = 0; i < 8; i++) click(byId.solidCubeAdd);
check('solids: 8 small cubes make a big cube', byId.solidCubeMsg.textContent.includes('拼成大正方体了') && byId.solidCubeMsg.textContent.includes('2×2×2=8'));

// 1.10 七巧板
click(byId.tangSvg.children[0]); // 大三角形
check('tangram: rotate a triangle, still a triangle', byId.tangReadout.textContent.includes('3条边') && byId.tangReadout.textContent.includes('倒过来还是三角形'));
click(byId.tangPairSquareBtn);
check('tangram: two small triangles make a square', byId.tangPairLabel.textContent.includes('拼成正方形了'));

// 1.12 分类
for (let i = 0; i < 10; i++) click(byId.sortPool.children[i]);
check('sort: all 10 placed', byId.sortTotal.textContent.includes('已经分了 10 个') && byId.sortCountRed.textContent === '6' && byId.sortCountBlue.textContent === '4');
click(byId.sortCheckBtn);
check('sort: color check adds to 10', byId.sortMsg.textContent.includes('红 6 个 + 蓝 4 个 = 10'));
click(byId.sortResetBtn);
for (let i = 0; i < 4; i++) click(byId.sortPool.children[i]);
click(byId.sortCheckBtn);
check('sort: unfinished sort reports the gap', byId.sortMsg.textContent.includes('还剩 6 个没分') && byId.sortMsg.textContent.includes('少了 6 个'));
click(byId.sortRuleSeg.children[1]); // 按形状分
for (let i = 0; i < 10; i++) click(byId.sortPool.children[i]);
click(byId.sortCheckBtn);
check('sort: shape check adds to 10', byId.sortMsg.textContent.includes('● 6 个 + ▲ 2 个 + ■ 2 个 = 10'));

// 1.7 捆小棒
check('bundle: initial 13', byId.bundleReadout.textContent === '1个十和3个一 = 13' && byId.bundleEq.textContent === '10 + 3 = 13');
for (let i = 0; i < 7; i++) click(byId.bundleAdd);
check('bundle: +7 auto-bundles to 20', byId.bundleReadout.textContent === '2个十和0个一 = 20');
click(byId.bundleUnbundle);
check('bundle: unbundle notes it', byId.bundleNote.textContent.includes('拆开'));
click(byId.bundleBundle);
check('bundle: re-bundle works', byId.bundleNote.textContent.includes('捆好了'));

// 1.13 百数表
check('hundred: 46 > 38 by tens', byId.hundCompare.textContent.includes('46大') && byId.hundCompare.textContent.includes('4个十比3个十多'));
click(byId.hundGrid.children[51]); // 52
click(byId.hundGrid.children[24]); // 25
check('hundred: 52 > 25 by tens', byId.hundCompare.textContent.includes('52大') && byId.hundCompare.textContent.includes('5个十比2个十多'));
click(byId.hundReset);
check('hundred: reset restores 46 vs 38', byId.hundCompare.textContent.includes('46大'));

// 1.15 数位块
check('place: initial problem 23+5', byId.placeEq.textContent === '23 + 5 = ?');
click(byId.placeAct);
check('place: 23+5=28', byId.placeEq.textContent === '23 + 5 = 28' && byId.placeVert.textContent.includes('28'));
click(byId.placeProbSeg.children[2]); // 47+8
click(byId.placeAct);
check('place: 47+8=55 carries one', byId.placeEq.textContent === '47 + 8 = 55' && byId.placeMark.textContent.includes('进1'));
click(byId.placeProbSeg.children[3]); // 36-8
click(byId.placeAct);
check('place: 36-8=28 borrows one', byId.placeEq.textContent === '36 − 8 = 28' && byId.placeMark.textContent.includes('借1'));

// 1.8 时钟
check('clock: initial 7 o\'clock, target met', byId.clockReadout.textContent === '现在是 7 点' && byId.clockMsg.textContent.includes('对了，就是7点'));
for (let i = 0; i < 6; i++) click(byId.clockMinPlus);
check('clock: +30 min -> 7:30', byId.clockReadout.textContent === '现在是 7 点半');
for (let i = 0; i < 6; i++) click(byId.clockMinPlus);
check('clock: another +30 min -> 8:00', byId.clockReadout.textContent === '现在是 8 点');
click(byId.clockHourPlus);
click(byId.clockNextTarget); // 目标 9 点
check('clock: dial to the 9 o\'clock target', byId.clockReadout.textContent === '现在是 9 点' && byId.clockMsg.textContent.includes('对了，就是9点'));

// 1.14 开小店
click(byId.shopItems.children[0]); // 本子 5 角
check('shop: select 本子', byId.shopSelected.textContent.includes('本子 5角'));
click(byId.shopWallet.children[0]); // 付 1 元
check('shop: pay 1 yuan for 5 jiao, change 5', byId.shopMsg.textContent.includes('找回 5角') && byId.shopWalletTotal.textContent.includes('35角'));
click(byId.shopReset);
check('shop: reset restores 40 jiao', byId.shopWalletTotal.textContent.includes('40角'));
click(byId.shopExchange);
check('shop: 10 x 1 jiao -> 1 yuan', byId.shopNote.textContent.includes('换好了') && byId.shopWalletTotal.textContent.includes('40角'));
click(byId.shopReset);
click(byId.shopItems.children[2]); // 铅笔 3 角
for (let i = 0; i < 3; i++) click(byId.shopWallet.children[2]); // 3 个 1 角
check('shop: exact payment, no change', byId.shopMsg.textContent.includes('正好 3角'));

// 1.16 找规律
click(byId.patChoices.children[0]); // 红（第 1 空答案）
check('pattern: first blank red is right', byId.patMsg.textContent.includes('对了'));
click(byId.patChoices.children[3]); // 第 2 次渲染的蓝（第 2 空答案）
click(byId.patChoices.children[5]); // 第 3 次渲染的蓝（第 3 空答案）
check('pattern: all three blanks right', byId.patMsg.textContent.includes('全对了'));
click(byId.patUnitBtn);
check('pattern: frame the unit', byId.patMsg.textContent.includes('红蓝蓝'));
click(byId.patNextBtn);
check('pattern: switch pattern resets', byId.patMsg.textContent.includes('找一找重复的单元'));

// 知识点页 → 实验的链接 + 真实 grade-1.js 的映射
navGo('point-1.1');
check('point 1.1 links the count experiment', pointDetail.innerHTML.includes('去玩数一数') && pointDetail.innerHTML.includes('data-demo-link="demo-count"'));
navGo('point-1.8');
check('point 1.8 links the clock experiment', pointDetail.innerHTML.includes('去玩拨时钟') && pointDetail.innerHTML.includes('data-demo-link="demo-clock"'));
navGo('point-1.13');
check('point 1.13 links the hundred-chart experiment', pointDetail.innerHTML.includes('去玩百数表') && pointDetail.innerHTML.includes('data-demo-link="demo-hundred"'));
navGo('point-1.1');
sandbox.goDemoFromHere('demo-count');
check('G1 demo from point keeps point as parent', byId.crumbTitle.innerHTML.includes('数数、比多少'));
sandbox.navBackFn();
check('G1 back from demo returns to point page', pointDetail.innerHTML.includes('数数、比多少'));
const g1src = fs.readFileSync(root + '/content/grades/grade-1.js', 'utf8');
const g1ids = [...g1src.matchAll(/id: "([0-9.]+)"/g)].map(m => m[1]);
const g1demos = [...g1src.matchAll(/demo: (?:'([a-z]+)'|null)/g)].map(m => m[1] || null);
const g1expected = {'1.1':'count','1.2':'position','1.3':'split','1.4':'addsub','1.5':'solids','1.6':'tenframe','1.7':'bundle','1.8':'clock','1.9':'tenframe','1.10':'tangram','1.11':'tenframe','1.12':'sort','1.13':'hundred','1.14':'shop','1.15':'place','1.16':'pattern'};
check('grade-1.js: all 16 points map to the right experiment',
  g1ids.length === 16 && g1ids.every((id, i) => g1demos[i] === g1expected[id]));
const labelSrc = src.match(/const DEMO_LABEL = \{([^}]*)\}/)[1];
check('DEMO_LABEL covers all 13 new demos',
  G1_DEMOS.every(k => labelSrc.includes(k + ':')));

// ---------- 8. grade 3 still works ----------
navGo('grade-3-mix');
check('grade-3 mix still renders', pointDetail.innerHTML.includes('混着练') && pointDetail.hidden === false);


// ---------- 11b. 二年级实验（15 个新演示） ----------
const G2_DEMOS = ['ruler', 'estimate', 'angle', 'array', 'observe', 'time',
  'share', 'motion', 'mixop', 'remain', 'thousand', 'weight', 'chart', 'logic', 'pair'];
check('G2: viewForKey covers all 15 new demos',
  G2_DEMOS.every(k => sandbox.viewForKey('demo-' + k) === 'demo-' + k));
navGo('demos');
let g2ViewsOk = true;
G2_DEMOS.forEach(k => {
  navGo('demo-' + k);
  if (!(byId.demos.hidden === false && documentStub.body.dataset.view === 'demo-' + k)) g2ViewsOk = false;
});
check('G2: all 15 demo views render (demos section visible)', g2ViewsOk);
navGo('demos');
navGo('demo-ruler');
sandbox.navBackFn();
check('G2: back from a demo returns to the demos list',
  byId.demos.hidden === false && byId.demoPanels.hidden === false);
const g2ProgBefore = byId.progressCount.textContent;

// 2.1 尺子量长度
check('ruler: initial 7 cm pencil', byId.rulReadout.textContent.includes('7 厘米'));
click(byId.rulObjSeg.children[1]); // 橡皮 3 厘米
check('ruler: eraser is 3 cm', byId.rulReadout.textContent.includes('3 厘米'));
click(byId.rulFromBtn);
check('ruler: measuring from 1 over-reads by 1', byId.rulMsg.textContent.includes('多算1厘米'));
check('ruler: meter strip is 100 cm squares', byId.rulMeter.children.length === 100);
check('G2 demos count toward the 98-demo progress', g2ProgBefore === '17 / 98' && byId.progressCount.textContent === '18 / 98');

// 2.2 先估后算
click(byId.estProbSeg.children[1]); // 26+38
click(byId.estGuessSeg.children[1]); // 大约 70
check('estimate: 26+38 is about 70', byId.estMsg.textContent.includes('对了'));
click(byId.estExactBtn);
check('estimate: exact 26+38=64', byId.estEq.textContent === '26 + 38 = 64');

// 2.4 转一转角
for (let i = 0; i < 3; i++) click(byId.angOpen);
check('angle: open 3 steps -> 90 degrees, a right angle', byId.angReadout.textContent.includes('90°') && byId.angMsg.textContent.includes('直角'));
click(byId.angLenBtn);
check('angle: longer arm, angle unchanged at 90', byId.angReadout.textContent.includes('90°'));

// 2.5 点阵乘法
click(byId.arrRowsMinus);
check('array: 2 x 4 = 8, koujue er-si-de-ba', byId.arrEq.textContent === '2 × 4 = 8' && byId.arrKoujue.textContent.includes('二四得八'));
// 2026-11-06 真机复测：改行数后标题还停在“3 行 4 列是 12 个点”——标题必须跟着行/列/总数一起变。
check('array: heading follows rows/cols after a change',
  !!(byId.arrTitle && byId.arrTitle.textContent.includes('2 行 4 列是 8 个点')));
click(byId.arrRotate);
check('array: rotate -> 4 x 2 = 8, same dots', byId.arrEq.textContent === '4 × 2 = 8' && byId.arrMsg.textContent.includes('点还是 8 个'));
// 2026-11-06 真机复测：正方形转一圈还是正方形，“4×4 和 4×4 可以互换”是同义反复。
click(byId.arrColsPlus); click(byId.arrColsPlus); // 4 x 4 = 16
check('array: 4 x 4 is 16', byId.arrEq.textContent === '4 × 4 = 16');
click(byId.arrRotate);
check('array: rotating a square does not repeat "4×4 和 4×4"',
  !byId.arrMsg.textContent.includes('4×4 和 4×4') && byId.arrMsg.textContent.includes('正方形'));

// 2.6 换个方向看
click(byId.obsViewSeg.children[1]); // 左面
check('observe: left view shows 2 squares', byId.obsMsg.textContent.includes('2 个正方形'));
click(byId.obsViewSeg.children[2]); // 上面
check('observe: top view shows 3 squares', byId.obsMsg.textContent.includes('3 个正方形'));
click(byId.obsRotate);
click(byId.obsViewSeg.children[0]); // 前面（转过 90° 后是左面的样子）
check('observe: after a 90-degree turn the front shows 2 squares', byId.obsMsg.textContent.includes('2 个正方形'));

// 2.7 认识时间：时和分
for (let i = 0; i < 5; i++) click(byId.tmMinPlus1);
check('time: +5 minutes -> 7:05, target met', byId.tmReadout.textContent === '现在是 7时05分' && byId.tmMsg.textContent.includes('对了，就是7时05分'));
click(byId.tmNextTarget); // 目标 7 时 45 分
for (let i = 0; i < 8; i++) click(byId.tmMinPlus5);
check('time: +40 minutes -> 7:45, target met', byId.tmReadout.textContent === '现在是 7时45分' && byId.tmMsg.textContent.includes('对了，就是7时45分'));

// 2.15 搭配连一连
const pairCombos = [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]];
pairCombos.forEach(c => {
  click(byId.pairShirtSeg.children[c[0]]);
  click(byId.pairPantsSeg.children[c[1]]);
  click(byId.pairMake);
});
check('pair: all 6 outfits found, 3x2 not 3+2', byId.pairCount.textContent.includes('6 / 6') && byId.pairMsg.textContent.includes('6种穿法'));

// 2.14a 投票变条形图
check('chart: starts at 28 of 30 votes', byId.chTotal.textContent.includes('28 / 30'));
click(byId.chVotes.children[3]); // 葡萄
click(byId.chVotes.children[3]);
check('chart: two grape votes -> 30 of 30', byId.chTotal.textContent.includes('30 / 30'));
click(byId.chCheck);
check('chart: total checks out', byId.chMsg.textContent.includes('对上了'));

// 2.8 轮流分一分
for (let i = 0; i < 4; i++) click(byId.shDeal);
check('share: deal 12 to 3 -> 12 / 3 = 4', byId.shEq.textContent === '12 ÷ 3 = 4');
click(byId.shModeSeg.children[1]); // 包含除：每次拿走一份
for (let i = 0; i < 4; i++) click(byId.shDeal);
check('share: take 3 at a time -> 4 groups', byId.shMsg.textContent.includes('拿了 4 次'));

// 2.9 折一折，转一转
click(byId.moFoldSeg.children[2]); // 斜着折
click(byId.moFoldBtn);
check('motion: rectangle folded diagonally does not match', byId.moFoldMsg.textContent.includes('不是对称轴'));
click(byId.moShapeSeg.children[1]); // 正方形
click(byId.moFoldBtn);
check('motion: square folded diagonally matches', byId.moFoldMsg.textContent.includes('是对称轴'));
click(byId.moMoveBtn);
check('motion: slide keeps shape and direction', byId.moMoveMsg.textContent.includes('样子和方向都没变'));
click(byId.moRotBtn);
check('motion: rotate changes direction only', byId.moMoveMsg.textContent.includes('方向变了'));

// 2.10 先算哪一堆
click(byId.mxFirstBtn);
check('mixop: 2+3x4 first the multiplication pile -> 14', byId.mxEq.textContent === '2+3×4 = 14');
click(byId.mxLeftBtn);
check('mixop: left-to-right gives the wrong 20', byId.mxMsg.textContent.includes('20'));
click(byId.mxProbSeg.children[3]); // (18-6)÷2
click(byId.mxFirstBtn);
check('mixop: (18-6)/2 -> 6', byId.mxEq.textContent === '(18-6)÷2 = 6');

// 2.11 装一包，剩几颗
for (let i = 0; i < 3; i++) click(byId.remPackBtn);
check('remain: 17/5 packs 3, leaves 2', byId.remEq.textContent === '17 ÷ 5 = 3 …… 2' && byId.remMsg.textContent.includes('余数 2 比除数 5 小'));
click(byId.remPackBtn);
check('remain: cannot pack the last 2', byId.remMsg.textContent.includes('装不了了'));

// 2.12 数轴找近似数
check('thousand: 678 is about 700', byId.thApprox.textContent.includes('大约是700'));
click(byId.thNumSeg.children[1]); // 649
check('thousand: 649 is about 600', byId.thApprox.textContent.includes('大约是600'));
click(byId.thNumSeg.children[5]); // 450
check('thousand: 450 rounds up to 500', byId.thApprox.textContent.includes('大约是500'));

// 2.13 天平称一称
click(byId.wtItems.children[1]); // 一袋盐 500 克
click(byId.wtItems.children[1]);
check('weight: two bags of salt are exactly 1 kg', byId.wtTotal.textContent.includes('1000克') && byId.wtMsg.textContent.includes('正好是1千克'));
click(byId.wtItems.children[1]);
click(byId.wtItems.children[1]);
check('weight: four bags of salt are 2 kg', byId.wtTotal.textContent.includes('2000克') && byId.wtMsg.textContent.includes('4袋盐'));
click(byId.wtReset);
check('weight: reset empties the pan', byId.wtTotal.textContent.includes('0克'));

// 2.14b 排除格推理
click(byId.lgClue1);
click(byId.lgClue2);
click(byId.lgClue3);
check('logic: three clues solve the puzzle', byId.lgMsg.textContent.includes('小红拿梨') && byId.lgMsg.textContent.includes('小明拿香蕉') && byId.lgMsg.textContent.includes('小刚拿苹果'));
check('logic: grid marks 小明-香蕉 as the answer', byId.lgGrid.children[5].textContent === '✓');

// 知识点页 → 实验的链接（桩里的 grade-2.js）+ 真实 grade-2.js 的映射
navGo('point-2.1');
check('point 2.1 links the ruler experiment', pointDetail.innerHTML.includes('去玩尺子量一量') && pointDetail.innerHTML.includes('data-demo-link="demo-ruler"'));
navGo('point-2.3');
check('point 2.3 reuses the ten-frame experiment', pointDetail.innerHTML.includes('去玩十格阵') && pointDetail.innerHTML.includes('data-demo-link="demo-tenframe"'));
navGo('point-2.1');
sandbox.goDemoFromHere('demo-ruler');
check('G2 demo from point keeps point as parent', byId.crumbTitle.innerHTML.includes('长度单位、线段'));
sandbox.navBackFn();
check('G2 back from demo returns to point page', pointDetail.innerHTML.includes('长度单位、线段'));
const g2src = fs.readFileSync(root + '/content/grades/grade-2.js', 'utf8');
const g2ids = [...g2src.matchAll(/id: "([0-9.]+[a-z]?)"/g)].map(m => m[1]);
const g2demos = [...g2src.matchAll(/demo: (?:"([a-z]+)"|null)/g)].map(m => m[1] || null);
const g2expected = {'2.1':'ruler','2.2':'estimate','2.3':'tenframe','2.4':'angle','2.5':'array','2.6':'observe','2.7':'time','2.15':'pair','2.14a':'chart','2.8':'share','2.9':'motion','2.10':'mixop','2.11':'remain','2.12':'thousand','2.13':'weight','2.14b':'logic'};
check('grade-2.js: all 16 points map to the right experiment',
  g2ids.length === 16 && g2ids.every((id, i) => g2demos[i] === g2expected[id]));
const labelSrc2 = src.match(/const DEMO_LABEL = \{([^}]*)\}/)[1];
check('DEMO_LABEL covers all 15 new demos',
  G2_DEMOS.every(k => labelSrc2.includes(k + ':')));
check('G2: all 15 new demos tried by now', byId.progressCount.textContent === '32 / 98');

// ---------- 12. 全站布局改版（2026-11-06 真机审计） ----------
// CSS：顶栏实底不透光，模式栏不吸顶，演示单列，知识点页窄栏
check('layout CSS: topbar is solid opaque, no backdrop blur',
  !cssText.includes('backdrop-filter') && /\.topbar\{[^}]*background:#fff/.test(cssText));
check('layout CSS: mode bar is not sticky', cssText.includes('.mode-bar{position:static'));
check('layout CSS: open demo renders single-column full-width',
  cssText.includes('.demo-grid{display:grid;grid-template-columns:minmax(0,1fr)'));
check('layout CSS: point page is a narrow centered column',
  cssText.includes('.point-detail{scroll-margin-top:88px;max-width:760px;margin:0 auto'));
// index.html：首页 8 块面板分两组，含今天复习入口；函数表有 x=4
const htmlText = fs.readFileSync(root + '/apps/web/index.html', 'utf8');
const panelsSec = htmlText.split('id="panels"')[1].split('</section>')[0];
check('home: 8 panels in two groups incl. 今天复习',
  (panelsSec.match(/data-nav-key="/g) || []).length === 8 && panelsSec.includes('data-nav-key="today-review"') &&
  panelsSec.includes('开始学') && panelsSec.includes('工具箱'));
check('function tables include x=4', htmlText.includes('<td id="y4">') && htmlText.includes('<td id="labY4">'));
// 今天复习首页入口
check("viewForKey('today-review') is review", sandbox.viewForKey('today-review') === 'review');
navGo('today-review');
check('home today-review renders the due list, not the wrong-book card',
  pointDetail.innerHTML.includes('今天复习') && byId.grades.hidden === false && byId.review.hidden === true);
// 知识点页：章节导航 + 上一篇/下一篇
navGo('point-3.7');
check('point page: section nav + prev/next pager',
  pointDetail.innerHTML.includes('point-nav') && pointDetail.innerHTML.includes('point-pager') &&
  pointDetail.innerHTML.includes('下一篇') && pointDetail.innerHTML.includes('3.12'));
check('point page: explain-back has one pair of quotes, not two',
  !pointDetail.innerHTML.includes('““') && pointDetail.innerHTML.includes('讲回来'));
// 1.1 题目不再漏答案（真实内容文件）
const g1real = fs.readFileSync(root + '/content/grades/grade-1.js', 'utf8');
check('content: 1.1 Q1 no longer leaks the answer in the question',
  !g1real.includes('从3往后数：4、5。'));
// 维度详情：条目可点 + 年级筛选
navGo('dim-domain');
check('dimension detail: topic rows are tappable buttons with a chevron',
  byId.dimDetail.innerHTML.includes('dim-topic') && byId.dimDetail.innerHTML.includes('›'));
check('dimension detail: grade filter offers all + 1-6',
  (byId.dimDetail.innerHTML.match(/data-gfilter="/g) || []).length === 7);
// 错题本一屏里有今天复习 + 明天回来
navGo('review');
check('wrong-book includes today-review and tomorrow sections',
  byId.reviewCard.innerHTML.includes('今天复习') && byId.reviewCard.innerHTML.includes('明天回来'));
// 各年级今天复习不再留 #review 区的旧卡片
navGo('grade-3-review');
check('per-grade review hides the wrong-book section',
  byId.review.hidden === true && byId.reviewCard.hidden === true);
// 我的进度：分年级真数字；到这里 32 个演示都玩过了（三年级的 14 个还没玩）
navGo('progress');
check('progress: per-grade rows with real numbers',
  byId.progressCard.innerHTML.includes('1 年级') && byId.progressCard.innerHTML.includes('3 年级') &&
  byId.progressCard.innerHTML.includes('演示') && byId.progressCard.innerHTML.includes('已练'));
check('progress: 32 of 98 demos tried by now', byId.progressCount.textContent === '32 / 98');
// 首页不显示孤零零的“数学”面包屑，子页面显示完整面包屑
navGo('home');
check('home hides the lone crumb title', byId.crumbTitle.hidden === true);
navGo('grades');
check('sub-page shows the breadcrumb', byId.crumbTitle.hidden === false && byId.crumbTitle.innerHTML.includes('数学'));


// ---------- 11c. 三年级实验（14 个新演示） ----------
const G3_DEMOS = ['elapsed', 'verify', 'units', 'times', 'splitmul', 'rectsq',
  'venn', 'compass', 'divplace', 'stattable', 'fourgrid', 'area', 'calendar', 'decimal'];
check('G3: viewForKey covers all 14 new demos',
  G3_DEMOS.every(k => sandbox.viewForKey('demo-' + k) === 'demo-' + k));
navGo('demos');
let g3ViewsOk = true;
G3_DEMOS.forEach(k => {
  navGo('demo-' + k);
  if (!(byId.demos.hidden === false && documentStub.body.dataset.view === 'demo-' + k)) g3ViewsOk = false;
});
check('G3: all 14 demo views render (demos section visible)', g3ViewsOk);
navGo('demos');
navGo('demo-elapsed');
sandbox.navBackFn();
check('G3: back from a demo returns to the demos list',
  byId.demos.hidden === false && byId.demoPanels.hidden === false);
const g3ProgBefore = byId.progressCount.textContent;

// 3.1 时间轴走一走
check('elapsed: starts at 7:45', byId.elReadout.textContent.includes('7时45分'));
for (let i = 0; i < 5; i++) click(byId.elPlus5);
check('elapsed: 7:45 -> 8:10 is 25 minutes', byId.elMsg.textContent.includes('到了') && byId.elMsg.textContent.includes('25 分钟'));
click(byId.elProbSeg.children[1]); // 7:30 -> 9:05
click(byId.elJump);
check('elapsed: jump to the whole hour lands on 8:00', byId.elReadout.textContent.includes('8时00分'));
for (let i = 0; i < 6; i++) click(byId.elPlus10);
click(byId.elPlus5);
check('elapsed: 7:30 -> 9:05 is 1 hour 35 minutes', byId.elMsg.textContent.includes('1 小时 35 分'));
check('G3 demos count toward the 98-demo progress', g3ProgBefore === '32 / 98' && byId.progressCount.textContent === '33 / 98');

// 3.2 算一算，再算回去
for (let i = 0; i < 4; i++) click(byId.vfNext);
check('verify: 456+278 worked out to 734', byId.vfStep3.textContent.includes('734'));
click(byId.vfVerify);
check('verify: 734-278 gets back to 456', byId.vfMsg.textContent.includes('456') && byId.vfMsg.textContent.includes('算对了'));
click(byId.vfProbSeg.children[1]); // 1000-658
for (let i = 0; i < 5; i++) click(byId.vfNext);
check('verify: 1000-658 worked out to 342', byId.vfStep4.textContent.includes('342'));
click(byId.vfVerify);
check('verify: 342+658 gets back to 1000', byId.vfMsg.textContent.includes('1000'));

// 3.3 单位楼梯
click(byId.unLenSeg.children[4]); // 千米
check('units: 1 km is 1000 m', byId.unReadout.textContent.includes('1000 米'));
click(byId.unWtSeg.children[2]); // 吨
check('units: 3 tons are 3000 kg', byId.unReadout.textContent.includes('3000 千克'));
click(byId.unOpt1); // 2000 米
check('units: 2 km = 2000 m', byId.unMsg.textContent.includes('对了'));
click(byId.unProbSeg.children[2]); // 2 米 = ? 厘米
click(byId.unOpt1); // 200 厘米
check('units: 2 m = 200 cm', byId.unMsg.textContent.includes('对了'));

// 3.4 条形复制
for (let i = 0; i < 3; i++) click(byId.txCopyBtn);
check('times: 12 is 3 times 4', byId.txMsg.textContent.includes('3 倍'));
click(byId.txProbSeg.children[2]); // 10 是 5 的几倍
for (let i = 0; i < 2; i++) click(byId.txCopyBtn);
check('times: 10 is 2 times 5', byId.txMsg.textContent.includes('2 倍'));

// 3.5 面积切一切
click(byId.m1BlockA);
click(byId.m1BlockB);
check('splitmul: 23x4 = 80+12 = 92', byId.m1Msg.textContent.includes('92'));
click(byId.m1ProbSeg.children[1]); // 32x3
click(byId.m1BlockA);
click(byId.m1BlockB);
check('splitmul: 32x3 = 90+6 = 96', byId.m1Msg.textContent.includes('96'));

// 3.6 拉一拉变正方形
for (let i = 0; i < 3; i++) click(byId.rsWidPlus);
check('rectsq: width 8 = length 8 makes a square', byId.rsReadout.textContent.includes('正方形'));
click(byId.rsLenMinus);
check('rectsq: 7 by 8 is a rectangle again', byId.rsReadout.textContent.includes('长方形'));

// 3.8 韦恩图拖人
check('venn: 10 draw, 8 sing, 15 people', byId.vnCountA.textContent.includes('10 人') && byId.vnCountB.textContent.includes('8 人') && byId.vnCountTotal.textContent.includes('15 个人'));
click(byId.vnOnlyA.children[0]); // 小红 moves into the overlap
check('venn: moving one into the overlap keeps 15 people, singing becomes 9', byId.vnCountA.textContent.includes('10 人') && byId.vnCountB.textContent.includes('9 人') && byId.vnCountTotal.textContent.includes('15 个人'));
click(byId.vnCheck);
check('venn: 10+9-4=15', byId.vnMsg.textContent.includes('一共 15 人'));

// 3.9 指南针转一转
click(byId.cpRotate);
check('compass: needle still points north after turning the map', byId.cpNeedle.textContent.includes('北'));
click(byId.cpNorth);
click(byId.cpEast);
check('compass: north then east -> northeast', byId.cpMsg.textContent.includes('东北方向'));
click(byId.cpQuizSeg.children[0]); // 北
check('compass: facing east, left hand is north', byId.cpQuizMsg.textContent.includes('对了'));

// 3.10 按数位分一分
for (let i = 0; i < 4; i++) click(byId.d1Next);
check('divplace: 96/4 = 24', byId.d1Step3.textContent.includes('24'));
click(byId.d1ProbSeg.children[1]); // 408/4
for (let i = 0; i < 4; i++) click(byId.d1Next);
check('divplace: 408/4 = 102, zero holds the place', byId.d1Step3.textContent.includes('102') && byId.d1Step3.textContent.includes('占位'));

// 3.15a 复式统计表
click(byId.t2Opt2); // 13
check('stattable: guessing 13 makes the total 30', byId.t2Total.textContent === '30');
click(byId.t2Check);
check('stattable: rows and columns check out', byId.t2Msg.textContent.includes('对上了'));

// 3.11 四格面积模型
for (let i = 0; i < 4; i++) click(byId['m2B' + i]);
check('fourgrid: 23x15 = 345', byId.m2Msg.textContent.includes('345'));
click(byId.m2ProbSeg.children[1]); // 24x13
for (let i = 0; i < 4; i++) click(byId['m2B' + i]);
check('fourgrid: 24x13 = 312', byId.m2Msg.textContent.includes('312'));

// 3.12 铺方砖数面积
check('area: 5 by 3 is 15 squares', byId.arReadout.textContent.includes('15 平方厘米'));
click(byId.arLenMinus);
check('area: 4 by 3 is 12 squares', byId.arReadout.textContent.includes('12 平方厘米'));
click(byId.arPerim);
check('area: perimeter of 4 by 3 is 14 cm', byId.arMsg.textContent.includes('14 厘米'));

// 3.13 日历翻一翻
click(byId.caMonthSeg.children[1]); // 2 月
check('calendar: Feb 2024 (leap) has 29 days', byId.caReadout.textContent.includes('29 天'));
click(byId.caYearSeg.children[1]); // 2025 平年
check('calendar: Feb 2025 has 28 days', byId.caReadout.textContent.includes('28 天'));
click(byId.caTimeSeg.children[1]); // 下午 3:00
check('calendar: 3pm is 15:00 in 24-hour time', byId.caTimeReadout.textContent.includes('15:00'));

// 3.14 十分条比大小
check('decimal: A is 0.5, B is 0.25', byId.dcReadA.textContent.includes('0.5') && byId.dcReadB.textContent.includes('0.25'));
click(byId.dcCompare);
check('decimal: 0.5 is bigger than 0.25', byId.dcMsg.textContent.includes('0.5 大'));
for (let i = 0; i < 3; i++) click(byId.dcAMinus); // A -> 0.2
click(byId.dcCompare);
check('decimal: 0.25 beats 0.2 on hundredths', byId.dcMsg.textContent.includes('0.25 大'));

// 知识点页 → 实验的链接（桩里的 grade-3.js）+ 真实 grade-3.js 的映射
navGo('point-3.12');
check('point 3.12 links the area experiment', pointDetail.innerHTML.includes('去玩铺方砖数面积') && pointDetail.innerHTML.includes('data-demo-link="demo-area"'));
navGo('point-3.3');
check('point 3.3 links the units experiment', pointDetail.innerHTML.includes('去玩单位楼梯') && pointDetail.innerHTML.includes('data-demo-link="demo-units"'));
navGo('point-3.12');
sandbox.goDemoFromHere('demo-area');
check('G3 demo from point keeps point as parent', byId.crumbTitle.innerHTML.includes('面积'));
sandbox.navBackFn();
check('G3 back from demo returns to point page', pointDetail.innerHTML.includes('面积'));
const g3src = fs.readFileSync(root + '/content/grades/grade-3.js', 'utf8');
const g3ids = [...g3src.matchAll(/id: "([0-9.]+[a-z]?)"/g)].map(m => m[1]);
const g3demos = [...g3src.matchAll(/demo: (?:"([a-z]+)"|null)/g)].map(m => m[1] || null);
const g3expected = {'3.1':'elapsed','3.2':'verify','3.3':'units','3.4':'times','3.5':'splitmul','3.6':'rectsq','3.7':'fraction','3.8':'venn','3.9':'compass','3.10':'divplace','3.15a':'stattable','3.11':'fourgrid','3.12':'area','3.13':'calendar','3.14':'decimal','3.15b':'pair'};
check('grade-3.js: all 16 points map to the right experiment',
  g3ids.length === 16 && g3ids.every((id, i) => g3demos[i] === g3expected[id]));
const labelSrc3 = src.match(/const DEMO_LABEL = \{([^}]*)\}/)[1];
check('DEMO_LABEL covers all 14 new demos',
  G3_DEMOS.every(k => labelSrc3.includes(k + ':')));
check('G3: all 14 new demos tried by now', byId.progressCount.textContent === '46 / 98');


// ---------- 11d. 四年级实验（16 个新演示 + 4.17 复用换个方向看） ----------
const G4_DEMOS = ['bignum', 'field', 'protractor', 'areamodel', 'parallelogram',
  'trialdiv', 'baraxis', 'teatime', 'zerodiv', 'laws', 'placeslider', 'tearangle',
  'decadd', 'moveshape', 'average', 'chickenrabbit'];
check('G4: viewForKey covers all 16 new demos',
  G4_DEMOS.every(k => sandbox.viewForKey('demo-' + k) === 'demo-' + k));
navGo('demos');
let g4ViewsOk = true;
G4_DEMOS.forEach(k => {
  navGo('demo-' + k);
  if (!(byId.demos.hidden === false && documentStub.body.dataset.view === 'demo-' + k)) g4ViewsOk = false;
});
check('G4: all 16 demo views render (demos section visible)', g4ViewsOk);
navGo('demos');
navGo('demo-bignum');
sandbox.navBackFn();
check('G4: back from a demo returns to the demos list',
  byId.demos.hidden === false && byId.demoPanels.hidden === false);
const g4ProgBefore = byId.progressCount.textContent;

// 4.1 大数数轴
check('bignum: 48932 is nearer 5 wan', byId.bnNear.textContent.includes('离 5万更近'));
click(byId.bnRound);
check('bignum: 48932 rounds to 5 wan', byId.bnMsg.textContent.includes('约是 5万'));
click(byId.bnProbSeg.children[1]); // 62850
check('bignum: 62850 is nearer 6 wan', byId.bnNear.textContent.includes('离 6万更近'));
click(byId.bnRound);
check('bignum: 62850 rounds to 6 wan', byId.bnMsg.textContent.includes('约是 6万'));
click(byId.bnProbSeg.children[2]); // 75000
check('bignum: 75000 sits on the halfway mark', byId.bnNear.textContent.includes('正好在半点上'));
check('G4 demos count toward the 98-demo progress', g4ProgBefore === '46 / 98' && byId.progressCount.textContent === '47 / 98');

// 4.2 足球场拼一拼
check('field: 1 field is 1 hectare, 10000 square meters', byId.fdReadout.textContent.includes('1 公顷') && byId.fdReadout.textContent.includes('10000 平方米'));
for (let i = 0; i < 9; i++) click(byId.fdPlus);
check('field: 10 fields are 10 hectares', byId.fdReadout.textContent.includes('10 公顷'));
check('field: grid shows 10 filled cells', byId.fdGrid.children.filter(c => c.classList.contains('fd-on')).length === 10);

// 4.3 量角器
check('protractor: starts at 30 degrees, acute', byId.prRead.textContent.includes('30°') && byId.prRead.textContent.includes('锐角'));
click(byId.prSeg.children[2]); // 65°
check('protractor: 65 degrees is acute', byId.prRead.textContent.includes('65°') && byId.prRead.textContent.includes('锐角'));
for (let i = 0; i < 5; i++) click(byId.prPlus);
check('protractor: 65+25 = 90 degrees, a right angle', byId.prRead.textContent.includes('90°') && byId.prRead.textContent.includes('直角'));
click(byId.prLen);
check('protractor: longer arm, angle still 90', byId.prRead.textContent.includes('90°'));

// 4.4 面积模型
click(byId.amB0); click(byId.amB1);
check('areamodel: 123x45 = 4920+615 = 5535', byId.amMsg.textContent.includes('5535'));
click(byId.amProbSeg.children[1]); // 138x24
click(byId.amB0); click(byId.amB1);
check('areamodel: 138x24 = 2760+552 = 3312', byId.amMsg.textContent.includes('3312'));

// 4.5 平行四边形
check('parallelogram: starts with 2 pairs of parallel sides', byId.pgMsg.textContent.includes('2 组'));
click(byId.pgSlantPlus);
check('parallelogram: pushing keeps opposite sides parallel', byId.pgRead.textContent.includes('对边还是平行的'));
click(byId.pgShapeSeg.children[3]); // 梯形
check('parallelogram: trapezoid has only 1 pair of parallel sides', byId.pgMsg.textContent.includes('1 组') && byId.pgMsg.textContent.includes('不是平行四边形'));

// 4.6 试商调商
click(byId.tdCheck);
check('trialdiv: guessing 7 for 150/26 is too big', byId.tdMsg.textContent.includes('大了'));
click(byId.tdMinus); click(byId.tdMinus); // 7 -> 5
click(byId.tdCheck);
check('trialdiv: 150/26 is 5 remainder 20', byId.tdMsg.textContent.includes('商是 5，余 20'));
click(byId.tdProbSeg.children[1]); // 161/23
click(byId.tdCheck);
check('trialdiv: 161/23 starts too small', byId.tdMsg.textContent.includes('商小了'));
for (let i = 0; i < 2; i++) click(byId.tdPlus); // 5 -> 7
click(byId.tdCheck);
check('trialdiv: 161/23 is exactly 7', byId.tdMsg.textContent.includes('商是 7，正好除尽'));

// 4.7 条形图会说谎
click(byId.baStartSeg.children[2]); // 从 20 开始
check('baraxis: axis from 20 lies about the gap', byId.baMsg.textContent.includes('说谎'));
click(byId.baStartSeg.children[0]); // 从 0 开始
check('baraxis: axis from 0 tells the truth', byId.baMsg.textContent.includes('说的是实话'));

// 4.8 沏茶排一排
check('teatime: one by one takes 14 minutes', byId.ttTotal.textContent.includes('14 分钟'));
click(byId.ttWashBtn); click(byId.ttTeaBtn);
check('teatime: doing chores while the water boils takes 11 minutes', byId.ttTotal.textContent.includes('11 分钟'));
click(byId.ttCakeSeg.children[3]); // 9 张饼
check('teatime: 9 cakes take 9 minutes', byId.ttCakeMsg.textContent.includes('9 分钟'));
click(byId.ttCakeSeg.children[0]); // 1 张饼
check('teatime: 1 cake still takes 2 minutes', byId.ttCakeMsg.textContent.includes('2 分钟'));

// 4.9 除以 0
click(byId.zdNumSeg.children[3]); // 3
check('zerodiv: 3 x 0 = 0, not 5', byId.zdMsg.textContent.includes('3 × 0 = 0'));
click(byId.zdDivFive);
check('zerodiv: 0/5 is 0', byId.zdMsg.textContent.includes('0÷5=0'));
for (let i = 0; i < 10; i++) click(byId.zdNumSeg.children[i]);
check('zerodiv: all 10 numbers tried, 5/0 has no answer', byId.zdMsg.textContent.includes('没有答案'));

// 4.10 运算定律
click(byId.lwRotate);
check('laws: 3x4 rotated is 4x3, still 12 dots', byId.lwEq.textContent === '4 × 3 = 12' && byId.lwMsg.textContent.includes('12 个'));
click(byId.lwModeSeg.children[1]); // 结合律
click(byId.lwAssocA);
check('laws: 25x7x4 by 25x4 first is 700', byId.lwAssocMsg.textContent.includes('700'));
click(byId.lwModeSeg.children[2]); // 分配律
click(byId.lwDistA); click(byId.lwDistB);
check('laws: 102x36 = 3600+72 = 3672', byId.lwDistMsg.textContent.includes('3672'));

// 4.11 数位滑块
check('placeslider: starts at 2.4', byId.psRead.textContent.includes('2.4'));
click(byId.psMul);
check('placeslider: 2.4 x 10 = 24', byId.psRead.textContent.includes('24'));
click(byId.psDiv); click(byId.psDiv);
check('placeslider: 24 / 100 = 0.24', byId.psRead.textContent.includes('0.24'));
click(byId.psSplit);
check('placeslider: 0.5 is 50 hundredths', byId.psSplitMsg.textContent.includes('50 个百分之一'));

// 4.12 撕角拼平角
click(byId.taTear0); click(byId.taTear1); click(byId.taTear2);
check('tearangle: 60+70+50 = 180', byId.taMsg.textContent.includes('180°'));
click(byId.taProbSeg.children[1]); // 90/45/45
click(byId.taTear0); click(byId.taTear1); click(byId.taTear2);
check('tearangle: 90+45+45 = 180', byId.taMsg.textContent.includes('180°'));
check('tearangle: 2, 3, 10 cannot make a triangle', byId.taStickMsg.textContent.includes('围不成'));
for (let i = 0; i < 3; i++) click(byId.taStick0Plus); // 2 -> 5
for (let i = 0; i < 5; i++) click(byId.taStick1Plus); // 3 -> 8
check('tearangle: 5, 8, 10 can make a triangle', byId.taStickMsg.textContent.includes('能围成三角形'));

// 4.13 小数加减对齐
click(byId.daAlignSeg.children[1]); // 末尾对齐
click(byId.daCalc);
check('decadd: 2.5+0.25 right-aligned gives the wrong 2.30', byId.daMsg.textContent.includes('2.30'));
click(byId.daAlignSeg.children[0]); // 小数点对齐
click(byId.daCalc);
check('decadd: 2.5+0.25 point-aligned gives 2.75', byId.daMsg.textContent.includes('2.75'));

// 4.14 图形平移和对称
for (let i = 0; i < 3; i++) click(byId.mvRight);
check('moveshape: 3 steps right', byId.mvRead.textContent.includes('向右移了 3 格'));
for (let i = 0; i < 2; i++) click(byId.mvUp);
check('moveshape: 2 steps up, shape unchanged', byId.mvRead.textContent.includes('向上移了 2 格') && byId.mvRead.textContent.includes('形状一点没变'));
click(byId.mvModeSeg.children[1]); // 轴对称
click(byId.mvGrid.children[9]); // row 1, col 1
check('moveshape: mirror of column 1 is 2 cells from the axis', byId.mvMsg.textContent.includes('2 格') && byId.mvMsg.textContent.includes('对称点'));

// 4.15 平均数
click(byId.avLevel);
check('average: 80, 90, 100, 90 levels to 90', byId.avRead.textContent.includes('平均数是 90'));
click(byId.avDataSeg.children[1]); // 看书
click(byId.avLevel);
check('average: 60, 80, 100 levels to 80', byId.avRead.textContent.includes('平均数是 80'));

// 4.16 鸡兔同笼
check('chickenrabbit: all chickens is 70 legs', byId.crRead.textContent.includes('70 条腿'));
for (let i = 0; i < 12; i++) click(byId.crPlus);
check('chickenrabbit: 12 rabbits reach 94 legs', byId.crRead.textContent.includes('94 条腿') && byId.crMsg.textContent.includes('对了'));
click(byId.crProbSeg.children[1]); // 头 10 脚 28
for (let i = 0; i < 4; i++) click(byId.crPlus);
check('chickenrabbit: 4 rabbits reach 28 legs', byId.crRead.textContent.includes('28 条腿') && byId.crMsg.textContent.includes('对了'));

// 知识点页 → 实验的链接（桩里的 grade-4.js）+ 真实 grade-4.js 的映射
navGo('point-4.4');
check('point 4.4 links the area-model experiment', pointDetail.innerHTML.includes('去玩面积模型') && pointDetail.innerHTML.includes('data-demo-link="demo-areamodel"'));
navGo('point-4.17');
check('point 4.17 reuses the observe experiment', pointDetail.innerHTML.includes('去玩换个方向看') && pointDetail.innerHTML.includes('data-demo-link="demo-observe"'));
navGo('point-4.11');
sandbox.goDemoFromHere('demo-placeslider');
check('G4 demo from point keeps point as parent', byId.crumbTitle.innerHTML.includes('小数的意义和性质'));
sandbox.navBackFn();
check('G4 back from demo returns to point page', pointDetail.innerHTML.includes('小数的意义和性质'));
const g4src = fs.readFileSync(root + '/content/grades/grade-4.js', 'utf8');
const g4ids = [...g4src.matchAll(/id: "([0-9.]+)"/g)].map(m => m[1]);
const g4demos = [...g4src.matchAll(/demo: (?:"([a-z]+)"|null)/g)].map(m => m[1] || null);
const g4expected = {'4.1':'bignum','4.2':'field','4.3':'protractor','4.4':'areamodel','4.5':'parallelogram','4.6':'trialdiv','4.7':'baraxis','4.8':'teatime','4.9':'zerodiv','4.17':'observe','4.10':'laws','4.11':'placeslider','4.12':'tearangle','4.13':'decadd','4.14':'moveshape','4.15':'average','4.16':'chickenrabbit'};
check('grade-4.js: all 17 points map to the right experiment',
  g4ids.length === 17 && g4ids.every((id, i) => g4demos[i] === g4expected[id]));
const labelSrc4 = src.match(/const DEMO_LABEL = \{([^}]*)\}/)[1];
check('DEMO_LABEL covers all 16 new demos',
  G4_DEMOS.every(k => labelSrc4.includes(k + ':')));
check('G4: all 16 new demos tried by now', byId.progressCount.textContent === '62 / 98');


// ---------- 6. grade 5 ----------
const g5ProgBefore = byId.progressCount.textContent;

// 5.1 小数乘法：单位正方形
check('decmul: 0.3x0.4 is 0.12', byId.dmRead.textContent.includes('0.12'));
click(byId.dmAPlus); // 0.4x0.4
check('decmul: 0.4x0.4 is 0.16', byId.dmRead.textContent.includes('0.16'));
click(byId.dmProbSeg.children[1]); // 0.2x0.5
check('decmul: 0.2x0.5 is 0.10, that is 0.1', byId.dmRead.textContent.includes('0.10') && byId.dmRead.textContent.includes('0.1'));
click(byId.dmProbSeg.children[2]); // 0.6x0.7
check('decmul: 0.6x0.7 is 0.42', byId.dmRead.textContent.includes('0.42'));
check('G5 demos count toward the 98-demo progress', g5ProgBefore === '62 / 98' && byId.progressCount.textContent === '63 / 98');

// 5.2 位置：数对
click(byId.gpGrid.children[8]); // row 1, col 2 -> (3,2)
check('gridpos: clicking the (3,2) cell says (3,2)', byId.gpRead.textContent.includes('(3,2)'));
click(byId.gpModeSeg.children[1]); // 考一考
click(byId.gpTargetSeg.children[1]); // (2,3)
click(byId.gpGrid.children[8]); // (3,2) is wrong for (2,3)
check('gridpos: (3,2) is not (2,3)', byId.gpRead.textContent.includes('不对'));
click(byId.gpGrid.children[13]); // row 2, col 1 -> (2,3)
check('gridpos: (2,3) found in quiz mode', byId.gpRead.textContent.includes('对了'));

// 5.3 小数除法：两数同乘
check('decdiv: divisor not an integer yet at x1', byId.ddRead.textContent.includes('还不是整数'));
click(byId.ddScaleSeg.children[1]); // x10
check('decdiv: 2.4/0.6 becomes 24/6 = 4', byId.ddRead.textContent.includes('24÷6=4'));
click(byId.ddProbSeg.children[2]); // 0.35/0.7
click(byId.ddScaleSeg.children[1]); // x10
check('decdiv: 0.35/0.7 becomes 3.5/7 = 0.5', byId.ddRead.textContent.includes('3.5÷7=0.5'));

// 5.4 可能性：摸球模拟
check('prob: 3 red of 10 is 3/10', byId.pbRead.textContent.includes('3/10'));
click(byId.pbHundred);
check('prob: 100 draws counted', byId.pbRead.textContent.includes('一共摸了 100 次'));
click(byId.pbCompSeg.children[1]); // 5 红 5 蓝
check('prob: 5 red of 10 is 5/10', byId.pbRead.textContent.includes('5/10'));
click(byId.pbReset);
check('prob: reset back to the start', byId.pbRead.textContent.includes('5/10') && !byId.pbRead.textContent.includes('一共摸了'));

// 5.6 多边形的面积：切一刀
check('polyarea: parallelogram 6x4 is 24', byId.paRead.textContent.includes('24 平方厘米'));
click(byId.paShapeSeg.children[1]); // 三角形
check('polyarea: triangle 6x4 is 12', byId.paRead.textContent.includes('12 平方厘米'));
click(byId.paShapeSeg.children[2]); // 梯形
check('polyarea: trapezoid (3+6)x4/2 is 18', byId.paRead.textContent.includes('18 平方厘米'));
check('polyarea: top-base row shows for trapezoid', byId.paTopRow.hidden === false);
click(byId.paShapeSeg.children[0]); // 平行四边形
click(byId.paCut);
check('polyarea: cut and slide makes a rectangle', byId.paMsg.textContent.includes('长方形') && byId.paRead.textContent.includes('24 平方厘米'));

// 5.7 植树问题
check('planttree: 100m every 10m, both ends, 11 trees', byId.ptRead.textContent.includes('11 棵'));
click(byId.ptModeSeg.children[1]); // 一端种
check('planttree: one end not planted is 10 trees', byId.ptRead.textContent.includes('10 棵'));
click(byId.ptModeSeg.children[2]); // 围成一圈
check('planttree: a circle is 10 trees', byId.ptRead.textContent.includes('10 棵'));
click(byId.ptModeSeg.children[0]); // 两端都种
click(byId.ptLenSeg.children[0]); // 60 米
check('planttree: 60m every 10m, both ends, 7 trees', byId.ptRead.textContent.includes('7 棵'));
check('planttree: 7 tree dots shown', byId.ptRow.children.filter(c => c.classList.contains('pt-on')).length === 7);

// 5.8 因数与倍数
check('factor: factors of 12 are 1, 2, 3, 4, 6, 12', byId.fcRead.textContent.includes('1、2、3、4、6、12'));
click(byId.fcNumSeg.children[4]); // 13
check('factor: 13 is prime', byId.fcKind.textContent.includes('质数'));
click(byId.fcNumSeg.children[5]); // 17
check('factor: 17 is prime', byId.fcKind.textContent.includes('质数'));
click(byId.fcNumSeg.children[2]); // 24
check('factor: factors of 24 are 1, 2, 3, 4, 6, 8, 12, 24', byId.fcRead.textContent.includes('1、2、3、4、6、8、12、24'));

// 5.9 长方体和正方体
check('cuboid: 5x4x3 is 60 cubic cm', byId.cbRead.textContent.includes('60 立方厘米'));
check('cuboid: surface area is 94 square cm', byId.cbMsg.textContent.includes('94 平方厘米'));
click(byId.cbLMinus); // 4x4x3
check('cuboid: 4x4x3 is 48 cubic cm, surface 80', byId.cbRead.textContent.includes('48 立方厘米') && byId.cbMsg.textContent.includes('80 平方厘米'));
click(byId.cbLPlus); // back to 5x4x3
click(byId.cbWPlus); click(byId.cbHPlus); click(byId.cbHPlus); // 5x5x5
check('cuboid: 5x5x5 is a cube', byId.cbMsg.textContent.includes('正方体'));

// 5.11 分数的加法和减法
check('fracadd: 1/2+1/3 is 5/6', byId.faRead.textContent.includes('5/6'));
click(byId.faASeg.children[2]); // 2/3
click(byId.faBSeg.children[1]); // 1/4
check('fracadd: 2/3+1/4 is 11/12', byId.faRead.textContent.includes('11/12'));
click(byId.faASeg.children[1]); // 1/3
click(byId.faBSeg.children[2]); // 1/6
check('fracadd: 1/3+1/6 is 3/6, that is 1/2', byId.faRead.textContent.includes('3/6') && byId.faRead.textContent.includes('1/2'));

// 5.12 图形的运动（三）
check('rotate: starts unrotated', byId.rtRead.textContent.includes('还没有转'));
click(byId.rtCw);
check('rotate: 90 degrees clockwise', byId.rtRead.textContent.includes('转了 90°'));
click(byId.rtCw);
check('rotate: 180 degrees total', byId.rtRead.textContent.includes('转了 180°'));
click(byId.rtCcw);
check('rotate: back to 90 degrees', byId.rtRead.textContent.includes('转了 90°'));
click(byId.rtReset);
check('rotate: reset to the start', byId.rtRead.textContent.includes('还没有转'));

// 5.13 找次品
check('findbad: 9 coins, one lighter', byId.fbRead.textContent.includes('9 个'));
click(byId.fbWeighAB); // round 0: light coin is 8, in group C
check('findbad: A and B balance, the bad one is in group C', byId.fbRead.textContent.includes('C 组'));
click(byId.fbWeighPair); // weigh 7 and 8
check('findbad: coin 8 is the light one, found in 2 weighings', byId.fbRead.textContent.includes('第 8 个') && byId.fbRead.textContent.includes('2 次'));
click(byId.fbNew); // round 1: light coin is 2, in group A
click(byId.fbWeighAB);
check('findbad: group A is lighter', byId.fbRead.textContent.includes('A 组轻了'));
click(byId.fbWeighPair); // weigh 1 and 2
check('findbad: coin 2 is the light one', byId.fbRead.textContent.includes('第 2 个'));

// 知识点页 → 实验的链接（桩里的 grade-5.js）+ 真实 grade-5.js 的映射
navGo('point-5.1');
check('point 5.1 links the decimal-multiplication experiment', pointDetail.innerHTML.includes('去玩单位正方形') && pointDetail.innerHTML.includes('data-demo-link="demo-decmul"'));
navGo('point-5.14');
check('point 5.14 reuses the observe experiment', pointDetail.innerHTML.includes('去玩换个方向看') && pointDetail.innerHTML.includes('data-demo-link="demo-observe"'));
navGo('point-5.5');
sandbox.goDemoFromHere('demo-balance');
check('G5 demo from point keeps point as parent', byId.crumbTitle.innerHTML.includes('简易方程'));
sandbox.navBackFn();
check('G5 back from demo returns to point page', pointDetail.innerHTML.includes('简易方程'));
const g5src = fs.readFileSync(root + '/content/grades/grade-5.js', 'utf8');
const g5ids = [...g5src.matchAll(/id: "([0-9.]+)"/g)].map(m => m[1]);
const g5demos = [...g5src.matchAll(/demo: (?:"([a-z]+)"|null)/g)].map(m => m[1] || null);
const g5expected = {'5.1':'decmul','5.2':'gridpos','5.3':'decdiv','5.4':'prob','5.5':'balance','5.6':'polyarea','5.7':'planttree','5.14':'observe','5.8':'factor','5.9':'cuboid','5.10':'fraction','5.11':'fracadd','5.12':'rotate','5.13':'findbad'};
check('grade-5.js: all 14 points map to the right experiment',
  g5ids.length === 14 && g5ids.every((id, i) => g5demos[i] === g5expected[id]));
const G5_DEMOS = ['decmul', 'gridpos', 'decdiv', 'prob', 'polyarea', 'planttree', 'factor', 'cuboid', 'fracadd', 'rotate', 'findbad'];
const labelSrc5 = src.match(/const DEMO_LABEL = \{([^}]*)\}/)[1];
check('DEMO_LABEL covers all 11 new demos',
  G5_DEMOS.every(k => labelSrc5.includes(k + ':')));
check('G5: all 11 new demos tried by now', byId.progressCount.textContent === '73 / 98');


// ---------- 7. grade 6 ----------
const g6ProgBefore = byId.progressCount.textContent;

// 6.3 位置与方向（二）：雷达
check('radar: north-east 30 degrees, 200m', byId.rdRead.textContent.includes('北偏东 30°、200 米'));
click(byId.rdAngPlus); // 40°
check('radar: 40 degrees', byId.rdRead.textContent.includes('40°'));
click(byId.rdModeSeg.children[1]); // 只说方向
check('radar: direction only is a ray with countless points', byId.rdRead.textContent.includes('无数个点'));
click(byId.rdModeSeg.children[0]); // 方向+距离
click(byId.rdDirSeg.children[1]); // 北偏西
check('radar: north-west 40 degrees', byId.rdRead.textContent.includes('北偏西 40°'));
check('G6 demos count toward the 98-demo progress', g6ProgBefore === '73 / 98' && byId.progressCount.textContent === '74 / 98');

// 6.4 比：比条
check('ratio: 2:3 of 50 is 20 and 30', byId.raRead.textContent.includes('20 元') && byId.raRead.textContent.includes('30 元'));
click(byId.raTotalSeg.children[1]); // 60 元
check('ratio: 2:3 of 60 is 24 and 36', byId.raRead.textContent.includes('24 元') && byId.raRead.textContent.includes('36 元'));
click(byId.raAPlus); // 3:3 of 60
check('ratio: 3:3 of 60 is 30 and 30', byId.raRead.textContent.includes('30 元'));

// 6.5 圆：绕绳量 + 切扇形拼长方形
check('circle: r=3 circumference is 18.84', byId.ccRead.textContent.includes('18.84'));
click(byId.ccRPlus); // r=4
check('circle: r=4 circumference is 25.12', byId.ccRead.textContent.includes('25.12'));
click(byId.ccModeSeg.children[1]); // 面积
check('circle: r=4 area is 50.24', byId.ccRead.textContent.includes('50.24'));
check('circle: slices row shows for area', byId.ccSliceRow.hidden === false);
click(byId.ccSliceSeg.children[2]); // 16 片
check('circle: 16 slices', byId.ccRead.textContent.includes('16 个小扇形'));

// 6.6 百分数（一）：百分条
check('percent: 25% is 1/4 and 0.25', byId.pcRead.textContent.includes('1/4') && byId.pcRead.textContent.includes('0.25'));
click(byId.pcPlus); // 30%
check('percent: 30% is 3/10 and 0.3', byId.pcRead.textContent.includes('3/10') && byId.pcRead.textContent.includes('0.3'));
click(byId.pcDown);
check('percent: down 20% from 100 is 80', byId.pcStepRead.textContent.includes('80 元'));
click(byId.pcUp);
check('percent: up 20% from 80 is 96, not back to 100', byId.pcStepRead.textContent.includes('96 元'));

// 6.7a 扇形统计图
check('fan: 40% is 144 degrees, 25% is 90', byId.fnRead.textContent.includes('144°') && byId.fnRead.textContent.includes('90°'));
click(byId.fnAMinus); // 35%
check('fan: 35% is 126 degrees', byId.fnRead.textContent.includes('126°'));

// 6.7b 数与形：L 形拼正方形
check('lsquare: 1 is 1 squared', byId.lsRead.textContent.includes('1 = 1') && byId.lsRead.textContent.includes('1²'));
click(byId.lsMore); click(byId.lsMore); // n=3
check('lsquare: 1+3+5 is 9, 3 squared', byId.lsRead.textContent.includes('1+3+5 = 9') && byId.lsRead.textContent.includes('3²'));
check('lsquare: 9 cells shown', byId.lsGrid.children.filter(c => !c.hidden).length === 9);

// 6.8 负数：温度计
check('thermo: -8 is colder than -3', byId.thRead.textContent.includes('−8') && byId.thRead.textContent.includes('−3') && byId.thRead.textContent.includes('更冷'));
click(byId.thBPlus); // -7
check('thermo: -7 is still colder than -3', byId.thRead.textContent.includes('−7 < −3'));
click(byId.thAMinus); // -4
check('thermo: -7 colder than -4', byId.thRead.textContent.includes('−7 < −4'));

// 6.9 负数运算：数列 + 翻面
click(byId.nmRows.children[4].children[2]); // (-1)x(-2) 看答案
check('negmul: (-1)x(-2) is +2', byId.nmRows.children[4].children[1].textContent.includes('+2'));
click(byId.nmFlip);
check('negmul: flip +3 to -3', byId.nmMarker.textContent.includes('−3'));
click(byId.nmFlip);
check('negmul: flip back to +3', byId.nmMarker.textContent.includes('+3'));

// 6.10 百分数（二）：打折和利息
check('discount: 200 at 80% is 160', byId.dcRead.textContent.includes('160 元'));
click(byId.dcRateSeg.children[1]); // 九折
check('discount: 200 at 90% is 180', byId.dcRead.textContent.includes('180 元'));
click(byId.dcModeSeg.children[1]); // 利息
check('discount: 5000 at 2.5% for 3 years is 375, total 5375', byId.dcRead.textContent.includes('375 元') && byId.dcRead.textContent.includes('5375 元'));
click(byId.dcYearsMinus); // 2 年
check('discount: 2 years is 250 interest', byId.dcRead.textContent.includes('250 元'));

// 6.11 圆柱与圆锥：倒沙
check('cylinder: r=3 h=4 volume is 113.04, cone 37.68', byId.cyRead.textContent.includes('113.04') && byId.cyRead.textContent.includes('37.68'));
check('cylinder: surface area is 131.88', byId.cyMsg.textContent.includes('131.88'));
click(byId.cyPour); click(byId.cyPour); click(byId.cyPour);
check('cylinder: 3 cones fill the cylinder', byId.cyPourRead.textContent.includes('正好满了') && byId.cyPourRead.textContent.includes('1/3'));
click(byId.cyRPlus); // r=4 h=4
check('cylinder: r=4 h=4 volume is 200.96', byId.cyRead.textContent.includes('200.96'));

// 6.13 鸽巢问题
check('pigeon: 5 pigeons, 4 nests', byId.piRead.textContent.includes('5 只鸽子'));
click(byId.pgStep1);
check('pigeon: one per nest first, 1 left over', byId.piRead.textContent.includes('还剩 1 只'));
click(byId.pgStep2);
check('pigeon: at least 2 in one nest', byId.piRead.textContent.includes('至少有 2 只'));
click(byId.pgNSeg.children[3]); // 13 只
click(byId.pgStep1); click(byId.pgStep2);
check('pigeon: 13 pigeons in 4 nests, at least 4', byId.piRead.textContent.includes('至少有 4 只'));

// 6.14 整理和复习：认出老办法
click(byId.cmList.children[0].children[2]);
check('conceptmap: first problem uses bar chart', byId.cmList.children[0].children[1].textContent.includes('条形图'));
click(byId.cmList.children[1].children[2]);
check('conceptmap: second problem uses times-one', byId.cmList.children[1].children[1].textContent.includes('×1'));
click(byId.cmList.children[2].children[2]);
check('conceptmap: third problem leaves 6 meters', byId.cmList.children[2].children[1].textContent.includes('6 米'));

// 知识点页 → 实验的链接（桩里的 grade-6.js）+ 真实 grade-6.js 的映射
navGo('point-6.3');
check('point 6.3 links the radar experiment', pointDetail.innerHTML.includes('去玩雷达找地方') && pointDetail.innerHTML.includes('data-demo-link="demo-radar"'));
navGo('point-6.1');
check('point 6.1 reuses the fraction experiment', pointDetail.innerHTML.includes('去玩分数演示') && pointDetail.innerHTML.includes('data-demo-link="demo-fraction"'));
navGo('point-6.12');
check('point 6.12 reuses the function experiment', pointDetail.innerHTML.includes('去玩函数演示') && pointDetail.innerHTML.includes('data-demo-link="demo-function"'));
navGo('point-6.13');
sandbox.goDemoFromHere('demo-pigeon');
check('G6 demo from point keeps point as parent', byId.crumbTitle.innerHTML.includes('鸽巢问题'));
sandbox.navBackFn();
check('G6 back from demo returns to point page', pointDetail.innerHTML.includes('鸽巢问题'));
const g6src = fs.readFileSync(root + '/content/grades/grade-6.js', 'utf8');
const g6ids = [...g6src.matchAll(/id: "([0-9.ab]+)"/g)].map(m => m[1]);
const g6demos = [...g6src.matchAll(/demo: (?:"([a-z]+)"|null)/g)].map(m => m[1] || null);
const g6expected = {'6.1':'fraction','6.3':'radar','6.2':'fraction','6.4':'ratio','6.5':'circle','6.6':'percent','6.7a':'fan','6.7b':'lsquare','6.8':'thermo','6.9':'negmul','6.10':'discount','6.11':'cylinder','6.12':'function','6.13':'pigeon','6.14':'conceptmap'};
check('grade-6.js: all 15 points map to the right experiment',
  g6ids.length === 15 && g6ids.every((id, i) => g6demos[i] === g6expected[id]));
const G6_DEMOS = ['radar', 'ratio', 'circle', 'percent', 'fan', 'lsquare', 'thermo', 'negmul', 'discount', 'cylinder', 'pigeon', 'conceptmap'];
const labelSrc6 = src.match(/const DEMO_LABEL = \{([^}]*)\}/)[1];
check('DEMO_LABEL covers all 12 new demos',
  G6_DEMOS.every(k => labelSrc6.includes(k + ':')));
check('G6: all 12 new demos tried by now', byId.progressCount.textContent === '85 / 98');

// ---------- 8. grade 7 ----------
const g7ProgBefore = byId.progressCount.textContent;

// 7.1/7.2 数轴：标一标（相反数、绝对值）+ 走一走（加减法）
check('numline: -3 opposite is 3, abs is 3', byId.nlRead.textContent.includes('相反数是 3') && byId.nlRead.textContent.includes('|−3| = 3'));
click(byId.nlValPlus); // -2
check('numline: -2 abs is 2', byId.nlRead.textContent.includes('|−2| = 2'));
click(byId.nlModeSeg.children[1]); // 走一走
check('numline: -4+7 walks to 3', byId.nlRead.textContent.includes('−4 + 7') && byId.nlRead.textContent.includes('停在 3'));
click(byId.nlBMinus); click(byId.nlBMinus); // b=5
check('numline: -4+5 walks to 1', byId.nlRead.textContent.includes('−4 + 5') && byId.nlRead.textContent.includes('停在 1'));
click(byId.nlAMinus); // a=-5
check('numline: -5+5 walks to 0', byId.nlRead.textContent.includes('−5 + 5') && byId.nlRead.textContent.includes('停在 0'));
check('G7 demos count toward the 98-demo progress', g7ProgBefore === '85 / 98' && byId.progressCount.textContent === '86 / 98');

// 7.3 乘方与科学记数法
check('powerup: 10 folds is 1024x, 102.4mm', byId.puRead.textContent.includes('1024') && byId.puRead.textContent.includes('102.4 毫米'));
click(byId.puFoldMinus); // 9 次
check('powerup: 9 folds is 512x, 51.2mm', byId.puRead.textContent.includes('512') && byId.puRead.textContent.includes('51.2 毫米'));
click(byId.puModeSeg.children[1]); // 科学记数法
check('powerup: 360000000 is 3.6x10^8', byId.puRead.textContent.includes('3.6×10⁸'));
click(byId.puShiftMinus); // 7
check('powerup: shift 7 is too big, a=36', byId.puRead.textContent.includes('36×10⁷') && byId.puRead.textContent.includes('太大了'));
click(byId.puNumSeg.children[1]); // 0.00012
check('powerup: 0.00012 is 1.2x10^-4', byId.puRead.textContent.includes('1.2×10⁻⁴') && byId.puRead.textContent.includes('写对了'));

// 7.4 整式：拆零件
check('monomial: -5a2b coeff -5 degree 3', byId.mnRead.textContent.includes('系数是 −5') && byId.mnRead.textContent.includes('次数是 3'));
click(byId.mnItemSeg.children[3]); // -xy
check('monomial: -xy coeff -1 degree 2', byId.mnRead.textContent.includes('系数是 −1') && byId.mnRead.textContent.includes('次数是 2'));
click(byId.mnModeSeg.children[1]); // 多项式
check('monomial: 3x2-2x+1 is quadratic trinomial', byId.mnRead.textContent.includes('二次三项式'));
click(byId.mnItemSeg.children[1]); // 4x3-3x2+2x-5
check('monomial: 4x3-3x2+2x-5 is cubic quadrinomial', byId.mnRead.textContent.includes('三次四项式'));

// 7.5 整式的加减：合并同类项 + 去括号
check('liketerms: merge not done yet', byId.ltRead.textContent.includes('点“合并同类项”'));
click(byId.ltGo);
check('liketerms: 3x2+5x-2x2+x is x2+6x', byId.ltRead.textContent.includes('x²+6x'));
click(byId.ltExprSeg.children[2]); // 3a+2b
click(byId.ltGo);
check('liketerms: 3a+2b cannot merge', byId.ltRead.textContent.includes('合不了'));
click(byId.ltModeSeg.children[1]); // 去括号
click(byId.ltGo);
check('liketerms: 5-(2a-3b) is 5-2a+3b', byId.ltRead.textContent.includes('5−2a+3b'));

// 7.7 相向而行
check('meetline: 3 hours they meet, 120km', byId.mtRead.textContent.includes('正好相遇') && byId.mtEq.textContent.includes('120'));
click(byId.mtTMinus); // 2.5 小时
check('meetline: 2.5 hours, 20km left', byId.mtRead.textContent.includes('还差 20 千米'));
for (let i = 0; i < 5; i++) click(byId.mtTMinus); // 0 小时
check('meetline: 0 hours not started', byId.mtRead.textContent.includes('还没出发'));

// 7.8 直线、射线、线段
check('lineseg: AB is 5cm', byId.sgRead.textContent.includes('AB = 5 厘米'));
click(byId.sgModeSeg.children[0]); // 直线
check('lineseg: line has no endpoints', byId.sgRead.textContent.includes('没有端点'));
click(byId.sgModeSeg.children[1]); // 射线 AB
check('lineseg: ray AB has one endpoint', byId.sgRead.textContent.includes('射线 AB'));
click(byId.sgCurveBtn);
check('lineseg: bent road is longer, segment shortest', byId.sgRead.textContent.includes('线段最短'));

// 7.9 角：余角、补角、角平分线
check('anglepair: 35 complement is 55', byId.apRead.textContent.includes('余角是 55°') && byId.apRead.textContent.includes('90°'));
click(byId.apModeSeg.children[1]); // 补角
check('anglepair: 35 supplement is 145', byId.apRead.textContent.includes('补角是 145°') && byId.apRead.textContent.includes('180°'));
click(byId.apModeSeg.children[2]); // 角平分线
check('anglepair: bisector of 35 is 17.5 each', byId.apRead.textContent.includes('17.5°'));
click(byId.apAnglePlus); // 40°
check('anglepair: bisector of 40 is 20 each', byId.apRead.textContent.includes('每个是 20°'));
click(byId.apModeSeg.children[0]); // 余角
check('anglepair: 40 complement is 50', byId.apRead.textContent.includes('余角是 50°'));

// 7.10 相交线：对顶角 + 垂线段
check('vertangle: vertical angles equal, 50 and 130', byId.vaRead.textContent.includes('∠3 = 50°') && byId.vaRead.textContent.includes('对顶角相等'));
click(byId.vaAnglePlus); // 60°
check('vertangle: 60 gives 120 adjacent', byId.vaRead.textContent.includes('∠1 = 60°') && byId.vaRead.textContent.includes('∠2 = 120°'));
click(byId.vaModeSeg.children[1]); // 垂线段
check('vertangle: perpendicular segment is shortest, 5cm', byId.vaRead.textContent.includes('垂线段 5 厘米最短'));
click(byId.vaSegSeg.children[1]);
check('vertangle: slanted segment is 7cm', byId.vaRead.textContent.includes('7 厘米'));

// 7.11 平行线截角 + 平移
check('parangles: corresponding angles 70 and 70', byId.plRead.textContent.includes('∠4 = 70°') && byId.plRead.textContent.includes('∠8 = 70°'));
click(byId.plPairSeg.children[1]); // 内错角
check('parangles: alternate interior 110 and 110', byId.plRead.textContent.includes('∠3 = 110°') && byId.plRead.textContent.includes('∠5 = 110°'));
click(byId.plPairSeg.children[2]); // 同旁内角
check('parangles: same-side interior sum to 180', byId.plRead.textContent.includes('180°'));
click(byId.plParSeg.children[1]); // 不平行
check('parangles: not parallel, same-side sum is 195', byId.plRead.textContent.includes('195°'));
click(byId.plPairSeg.children[0]); // 同位角
check('parangles: not parallel, corresponding 70 vs 55', byId.plRead.textContent.includes('∠8 = 55°'));
click(byId.plPairSeg.children[3]); // 平移
check('parangles: translate 3 cells', byId.plRead.textContent.includes('向右平移 3 格'));
click(byId.plDxPlus); // 4 格
check('parangles: translate 4 cells', byId.plRead.textContent.includes('向右平移 4 格'));

// 7.12 实数：开方机器 + √2 定位
check('roots: sqrt16 is 4, pm4', byId.sqRead.textContent.includes('√16 = 4') && byId.sqRead.textContent.includes('±4'));
click(byId.sqASeg.children[5]); // -4
check('roots: -4 has no square root', byId.sqRead.textContent.includes('没有平方根'));
click(byId.sqModeSeg.children[1]); // 立方根
check('roots: cbrt8 is 2', byId.sqRead.textContent.includes('³√(8) = 2'));
click(byId.sqASeg.children[3]); // -8
check('roots: cbrt-8 is -2', byId.sqRead.textContent.includes('³√(−8) = −2'));
click(byId.sqModeSeg.children[2]); // √2 在哪
check('roots: sqrt2 is about 1.414 between 1 and 2', byId.sqRead.textContent.includes('√2 ≈ 1.414') && byId.sqRead.textContent.includes('1 和 2 之间'));
click(byId.sqASeg.children[2]); // √5
check('roots: sqrt5 is about 2.236 between 2 and 3', byId.sqRead.textContent.includes('√5 ≈ 2.236') && byId.sqRead.textContent.includes('2 和 3 之间'));

// 7.13 平面直角坐标系
check('coordplane: (2,3) is first quadrant', byId.xyRead.textContent.includes('(2,3)') && byId.xyRead.textContent.includes('第一象限'));
click(byId.xyPtSeg.children[1]); // (-1,2)
check('coordplane: (-1,2) is second quadrant', byId.xyRead.textContent.includes('第二象限'));
click(byId.xySymSeg.children[1]); // 关于 x 轴
check('coordplane: (-1,2) reflects over x-axis to (−1,−2)', byId.xyRead.textContent.includes('关于x轴的对称点是 (−1,−2)'));
click(byId.xySymSeg.children[3]); // 关于原点
check('coordplane: (-1,2) reflects over origin to (1,−2)', byId.xyRead.textContent.includes('关于原点的对称点是 (1,−2)'));
click(byId.xyPtSeg.children[4]); // (0,4)
check('coordplane: (0,4) is on the y-axis', byId.xyRead.textContent.includes('在 y 轴上'));
click(byId.xyPtSeg.children[5]); // (3,0)
check('coordplane: (3,0) is on the x-axis', byId.xyRead.textContent.includes('在 x 轴上'));

// 7.15 不等式数轴
check('ineqline: -2x>6 gives x<-3, open circle', byId.iqRead.textContent.includes('x < −3') && byId.iqRead.textContent.includes('空心圈'));
click(byId.iqExprSeg.children[2]); // 3x+1≥7
check('ineqline: 3x+1>=7 gives x>=2, solid dot', byId.iqRead.textContent.includes('x ≥ 2') && byId.iqRead.textContent.includes('实心点'));
click(byId.iqModeSeg.children[1]); // 不等式组
check('ineqline: system gives -2<x<=3', byId.iqRead.textContent.includes('−2 < x ≤ 3'));
click(byId.iqExprSeg.children[2]); // {x>5, x<3}
check('ineqline: x>5 and x<3 has no solution', byId.iqRead.textContent.includes('无解'));
click(byId.iqExprSeg.children[1]); // {x-1>2, 3x<12}
check('ineqline: system gives 3<x<4', byId.iqRead.textContent.includes('3 < x < 4'));

// 7.16 直方图
check('histogram: 140-145 has 3, frequency 0.075', byId.hgRead.textContent.includes('140~145：3 人') && byId.hgRead.textContent.includes('0.075'));
check('histogram: 10 bars for 5cm groups', byId.hgBars.children.length === 10);
click(byId.hgGroupSeg.children[1]); // 10 厘米一组
check('histogram: 140-150 has 7 with 10cm groups', byId.hgRead.textContent.includes('140~150：7 人'));
check('histogram: 5 bars for 10cm groups', byId.hgBars.children.length === 5);
click(byId.hgSetSeg.children[1]); // 抽样 10 人
check('histogram: sample of 10, 140-150 has 2', byId.hgRead.textContent.includes('抽样 10 人') && byId.hgRead.textContent.includes('140~150：2 人'));

// 知识点页 → 实验的链接（桩里的 grade-7.js）+ 真实 grade-7.js 的映射
navGo('point-7.1');
check('point 7.1 links the numline experiment', pointDetail.innerHTML.includes('去玩数轴标一点') && pointDetail.innerHTML.includes('data-demo-link="demo-numline"'));
navGo('point-7.2');
check('point 7.2 shares the numline experiment', pointDetail.innerHTML.includes('去玩数轴标一点') && pointDetail.innerHTML.includes('data-demo-link="demo-numline"'));
navGo('point-7.7');
check('point 7.7 links the meetline experiment', pointDetail.innerHTML.includes('去玩相向而行') && pointDetail.innerHTML.includes('data-demo-link="demo-meetline"'));
navGo('point-7.6');
check('point 7.6 reuses the balance experiment', pointDetail.innerHTML.includes('去玩天平演示') && pointDetail.innerHTML.includes('data-demo-link="demo-balance"'));
navGo('point-7.14');
check('point 7.14 reuses the balance experiment', pointDetail.innerHTML.includes('去玩天平演示') && pointDetail.innerHTML.includes('data-demo-link="demo-balance"'));
navGo('point-7.13');
check('point 7.13 links the coordplane experiment', pointDetail.innerHTML.includes('去玩坐标平面点一点') && pointDetail.innerHTML.includes('data-demo-link="demo-coordplane"'));
navGo('point-7.16');
check('point 7.16 links the histogram experiment', pointDetail.innerHTML.includes('去玩直方图分组') && pointDetail.innerHTML.includes('data-demo-link="demo-histogram"'));
navGo('point-7.11');
sandbox.goDemoFromHere('demo-parangles');
check('G7 demo from point keeps point as parent', byId.crumbTitle.innerHTML.includes('平行线与平移'));
sandbox.navBackFn();
check('G7 back from demo returns to point page', pointDetail.innerHTML.includes('平行线与平移'));
const g7src = fs.readFileSync(root + '/content/grades/grade-7.js', 'utf8');
const g7ids = [...g7src.matchAll(/id: "([0-9.]+)"/g)].map(m => m[1]);
const g7demos = [...g7src.matchAll(/demo: (?:'([a-z]+)'|null)/g)].map(m => m[1] || null);
const g7expected = {'7.1':'numline','7.2':'numline','7.3':'powerup','7.4':'monomial','7.5':'liketerms','7.6':'balance','7.7':'meetline','7.8':'lineseg','7.9':'anglepair','7.10':'vertangle','7.11':'parangles','7.12':'roots','7.13':'coordplane','7.14':'balance','7.15':'ineqline','7.16':'histogram'};
check('grade-7.js: all 16 points map to the right experiment',
  g7ids.length === 16 && g7ids.every((id, i) => g7demos[i] === g7expected[id]));
const G7_DEMOS = ['numline', 'powerup', 'monomial', 'liketerms', 'meetline', 'lineseg', 'anglepair', 'vertangle', 'parangles', 'roots', 'coordplane', 'ineqline', 'histogram'];
const labelSrc7 = src.match(/const DEMO_LABEL = \{([^}]*)\}/)[1];
check('DEMO_LABEL covers all 13 new demos',
  G7_DEMOS.every(k => labelSrc7.includes(k + ':')));
check('viewForKey covers all 13 new demos',
  G7_DEMOS.every(k => sandbox.viewForKey('demo-' + k) === 'demo-' + k));
check('G7: all 13 new demos tried by now', byId.progressCount.textContent === '98 / 98');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
