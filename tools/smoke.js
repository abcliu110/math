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
    tagName: (tag || 'div').toUpperCase(), nodeType: 1,
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
  if (sel === '[data-drop]') return d('drop'); // 器材落点（天平/数轴虚线框）：apparatus.js dropAt 用它找落点
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
  // '#labQuestions .lab-q'：实验室问题卡片（按父容器 + 类名配对，供 labFilterQuestions 检查用）。
  if (sel === '#labQuestions .lab-q') {
    if (!(e.className || '').split(' ').includes('lab-q')) return false;
    let p = e.parentNode;
    while (p) { if (p === byId.labQuestions) return true; p = p.parentNode; }
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
  addEventListener() {},
};
const windowStub = { scrollTo() {}, setTimeout, addEventListener() {}, document: documentStub };

// ---------- stub grade content (small but schema-faithful) ----------
const GRADE3_CONTENT = { grade: 3, edition: 'A', units: [
  { unit: '分数的初步认识', term: '上', story: '几千年前，古埃及人分面包：7 个面包分给 10 个人，每人分不到一个整的。他们把面包切成小份分，这就是分数最早的样子。', points: [
    { id: '3.7', title: '分数的初步认识', subtitle: '几分之一、几分之几', how: '把一个整体平均分。', why: '分母是切了几份。', wrong: '1/4 比 1/3 大', wrongWhy: '分母是大小不是个数。', visual: '分数条。', method: '分数条 + 数轴', explainBack: '1/4 是一份。', tryIt: '把纸对折两次。', demo: 'fraction', recall: { q: '一个饼切成 4 等份，吃了 1 份，吃了几分之几？', answer: '1/4', hint: '一共 4 份，吃了 1 份' }, practice: [{ q: '1/2 和 1/4 谁大？', answer: '1/2 大', hint: '份数少，每份大', steps: [{ label: '看分母', text: '1/2 是切 2 份，1/4 是切 4 份' }, { label: '比一比', text: '切的份数越少，每份越大，所以 1/2 大' }] }, { q: '2/7 + 3/7 = ?', answer: '5/7', hint: '分母不变，分子相加', steps: [{ label: '分母不变', text: '分母还是 7' }, { label: '分子相加', text: '2 + 3 = 5，所以是 5/7' }] }] },
  ] },
  { unit: '面积', term: '下', points: [
    { id: '3.12', title: '面积', subtitle: '面积单位、长方形面积', how: '数小方块。', why: '面积就是盖了多少个单位正方形。', wrong: '面积就是周长', wrongWhy: '周长是边，面积是面。', visual: '方格纸铺一铺。', method: '铺方块数一数', explainBack: '面积是里面有几个方块。', tryIt: '用小方块铺长方形。', demo: 'area', recall: { q: '长 4 宽 3 的长方形里能铺几个小方块？', answer: '12 个', hint: '4×3' }, practice: [{ q: '4 行 3 列是多少个方块？', answer: '12 个', hint: '4×3' }, { q: '边长 6 厘米的正方形面积？', answer: '36 平方厘米', hint: '边长×边长' }] },
  ] },
  { unit: '测量', term: '上', points: [
    { id: '3.3', title: '测量', subtitle: '毫米/分米/千米/吨', how: '看进率换算。', why: '单位是打包办法。', wrong: '1 千米=100 米', wrongWhy: '米到千米是 1000 倍。', visual: '单位楼梯。', method: '单位楼梯', explainBack: '1 千米是 1000 米。', tryIt: '量一量书的厚度。', demo: 'units', recall: { q: '2 千米是多少米？', answer: '2000 米', hint: '1 千米=1000 米' }, practice: [{ q: '3 吨是多少千克？', answer: '3000 千克', hint: '1 吨=1000 千克' }, { q: '5000 米是多少千米？', answer: '5 千米', hint: '1000 米=1 千米' }] },
  ] },
  { unit: '复式统计表', term: '下', points: [
    { id: '3.15a', title: '复式统计表', subtitle: '复式统计表', how: '把两个表拼成一个表。', why: '对照着看才方便。', wrong: '两个表各看各的', wrongWhy: '拼起来才能直接比。', visual: '复式表。', method: '拼表对照', explainBack: '行是项目，列是组别。', tryIt: '把两个班的统计表拼起来。', demo: 'stattable', recall: { q: '复式统计表有什么好处？', answer: '两个组的数据能直接对照', hint: '拼成一个表' }, practice: [{ q: '复式统计表里，行一般表示什么？', answer: '项目', hint: '行是项目' }, { q: '三个年级的人数放在一个复式统计表里，要几列？', answer: '4 列（含项目列）', hint: '3 个年级加项目列', level: '提高' }] },
  ] },
] };
const GRADE1_CONTENT = { grade: 1, edition: 'A', units: [
  { unit: '20以内的进位加法', term: '上', points: [
    { id: '1.9', title: '20以内进位加法', subtitle: '凑十法', how: '把 9 凑成 10 再加。', why: '10 是整捆。', wrong: '9+4=12', wrongWhy: '忘了凑十。', visual: '十格阵。', method: '凑十拖格', explainBack: '给 9 一个凑成 10。', tryIt: '拖 1 个到十格阵。', demo: 'thirteen', recall: { q: '9+4，先给 9 凑几个成 10？', answer: '凑 1 个', hint: '9 再加 1 是 10' }, olympiad: { q: '9+7+1+3，用凑十怎么算最快？', answer: '（9+1）+（7+3）=20', hint: '找能凑成 10 的一对' }, practice: [{ q: '9+5 = ?', answer: '14', hint: '9+1=10，再加 4', level: '基础' }, { q: '8+6 = ?', answer: '14', hint: '8+2=10，再加 4', level: '提高' }] },
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
  { unit: '位置', term: '上', points: [
    { id: '1.2', title: '位置', subtitle: '上下、前后、左右', how: '上和下、前和后、左和右是相对的。', why: '位置是相对的，换了参照就换了。', wrong: '左边和右边分不清', wrongWhy: '左右要看朝向。', visual: '小人转一转。', method: '朝向法', explainBack: '先定好谁是前面。', tryIt: '转个身，左手边是什么？', demo: 'position', recall: { q: '小明前面是小红，小红前面是谁？', answer: '小红前面是别人', hint: '位置是相对的' }, practice: [{ q: '坐在你左手边的是谁？', answer: '左边的同学', hint: '看左手边' }, { q: '书包在课桌的上面还是下面？', answer: '下面', hint: '课桌在上面', level: '提高' }] },
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
  { unit: '四则运算', term: '下', points: [
    { id: '4.9', title: '四则运算', subtitle: '运算顺序、括号、0的运算', how: '算式里有加减乘除，先算乘除、后算加减；有括号先算括号里面的。', why: '乘法是“加了好几次”，要先算成一堆。', wrong: '5÷0=5；算式从左往右算就行。', wrongWhy: '5÷0在问“什么数乘0等于5”，没有这样的数。', visual: '逆算检查：“什么数乘0等于5？”', method: '逆运算证伪', explainBack: '除以0没有答案，因为没有数乘0是5。', tryIt: '算一算12+8×2和（12+8）×2。', demo: 'zerodiv', recall: { q: '5÷0等于0吗？等于5吗？到底是多少？', answer: '都不是；5÷0没有答案', hint: '除法在问“什么数乘0等于5”' }, practice: [{ q: '算一算12+8×2：先算什么？结果是多少？', answer: '先算8×2=16，再算12+16=28', hint: '先乘除，后加减。', level: '基础' }, { q: '算一算（12+8）×2。', answer: '40', hint: '先算括号里面的。', level: '提高' }] },
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
  { unit: '百分数（一）', term: '上', points: [
    { id: '6.6', title: '百分数（一）', subtitle: '百分数的意义、读写、分数小数互化', how: '百分数就是分母是 100 的分数。', why: '百分数是“每 100 个里有几个”。', wrong: '35% 就是 35', wrongWhy: '35% 是 35 个百分之一。', visual: '百分条。', method: '百分条', explainBack: '35% 是 35/100。', tryIt: '把 0.35 写成百分数。', demo: 'percent', recall: { q: '35% 表示什么意思？', answer: '每 100 个里有 35 个', hint: '分母是 100' }, practice: [{ q: '0.25 写成百分数是多少？', answer: '25%', hint: '0.25 是 25 个百分之一', level: '基础' }, { q: '80% 写成小数是多少？', answer: '0.8', hint: '80 个百分之一', level: '提高' }] },
  ] },
  { unit: '负数', term: '上', points: [
    { id: '6.8', title: '负数', subtitle: '负数的认识、负数的大小比较', how: '0 是正负的分界。', why: '负数是比 0 小的数。', wrong: '-5 比 -2 大', wrongWhy: '-5 离 0 更远。', visual: '温度计。', method: '温度计', explainBack: '零下 5 度比零下 2 度冷。', tryIt: '读一读 -3。', demo: 'thermo', recall: { q: '-5 和 -2 哪个小？', answer: '-5', hint: '离 0 更远的更小' }, practice: [{ q: '-3 的相反数是几？', answer: '3', hint: '关于 0 对称', level: '基础' }, { q: '|-4| 是几？', answer: '4', hint: '到 0 的距离', level: '提高' }] },
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
// 桩里的八年级内容：16 个点全留（8.3/8.4 共用 foldmirror、8.5/8.6/8.7 共用 algarea、8.14/8.15 共用 function）。
const GRADE8_CONTENT = { grade: 8, edition: 'A', units: [
  { unit: '三角形', term: '上', points: [
    { id: '8.1', title: '三角形', subtitle: '三角形的边、角、多边形内角和', how: '任意两边之和大于第三边。', why: '两点之间线段最短。', wrong: '3、4、7 能围成三角形', wrongWhy: '3+4=7，不是大于。', visual: '三根棍子围一围。', method: '围不围试一试', explainBack: '两边之和要大于第三边。', tryIt: '拿 3、4、5 围一围。', demo: 'trisides', recall: { q: '3、4、7 能围成三角形吗？', answer: '不能，3+4=7', hint: '两边之和要大于第三边' }, practice: [{ q: '三边长 5、5、8，能围成三角形吗？', answer: '能', hint: '5+5>8', level: '基础' }, { q: '五边形的内角和是多少度？', answer: '540°', hint: '(5-2)×180°', level: '提高' }] },
  ] },
  { unit: '全等三角形', term: '上', points: [
    { id: '8.2', title: '全等三角形的判定', subtitle: 'SSS、SAS、ASA、AAS、HL', how: '三条边相等就全等。', why: '三条边定住了形状和大小。', wrong: 'SSA 能判定全等', wrongWhy: 'SSA 能画出两个不一样的三角形。', visual: '两个三角形拼一拼。', method: '条件拼图法', explainBack: 'SSS、SAS、ASA、AAS、HL 都能判定。', tryIt: '给两条边和一个角，画一画。', demo: 'congruent', recall: { q: 'SSA 能判定两个三角形全等吗？', answer: '不能', hint: '能画出两个不一样的三角形' }, practice: [{ q: '三边分别是 5、6、7 的两个三角形全等吗？', answer: '全等，SSS', hint: '三条边都相等', level: '基础' }, { q: '直角三角形里，斜边和一条直角边相等，能判定全等吗？', answer: '能，HL', hint: '斜边加直角边', level: '提高' }] },
  ] },
  { unit: '轴对称', term: '上', points: [
    { id: '8.3', title: '轴对称', subtitle: '轴对称图形、轴对称、对称轴', how: '沿一条直线对折，两边完全重合。', why: '对称是镜子里的样子。', wrong: '平行四边形是轴对称图形', wrongWhy: '对折后两边对不上。', visual: '对折纸。', method: '对折法', explainBack: '对折后两边完全重合。', tryIt: '对折一张纸，画一半剪一剪。', demo: 'foldmirror', recall: { q: '等腰三角形有几条对称轴？', answer: '1 条', hint: '沿顶角平分线对折' }, practice: [{ q: '长方形有几条对称轴？', answer: '2 条', hint: '横着对折、竖着对折', level: '基础' }, { q: '点（2，-3）关于 x 轴的对称点是？', answer: '（2，3）', hint: '横坐标不变，纵坐标变号', level: '提高' }] },
    { id: '8.4', title: '等腰三角形', subtitle: '等腰三角形的性质与判定', how: '等腰三角形两腰相等，底角相等。', why: '沿顶角平分线对折，两边重合。', wrong: '等腰三角形顶角一定是最大的角', wrongWhy: '底角也可以比顶角大。', visual: '对折等腰三角形。', method: '对折法', explainBack: '对折后底角重合，所以底角相等。', tryIt: '对折等腰三角形，看底角。', demo: 'foldmirror', recall: { q: '等腰三角形底角是 70°，顶角是多少度？', answer: '40°', hint: '180°-70°×2' }, practice: [{ q: '等腰三角形一个角是 50°，顶角可能是多少度？', answer: '80° 或 50°', hint: '50° 可能是底角也可能是顶角', level: '基础' }, { q: '等腰三角形两边长是 4 和 9，第三边长是多少？', answer: '9', hint: '4+4<9，腰不能是 4', level: '提高' }] },
  ] },
  { unit: '整式的乘法与因式分解', term: '上', points: [
    { id: '8.5', title: '幂的运算与整式的乘法', subtitle: '同底数幂的乘法、幂的乘方、单项式乘多项式', how: '同底数幂相乘，底数不变，指数相加。', why: '指数是数有几个相同的因数。', wrong: 'a³×a²=a⁶', wrongWhy: '指数是相加，不是相乘。', visual: '面积模型。', method: '面积模型法', explainBack: 'a³×a² 是 5 个 a 相乘。', tryIt: '在面积图上算（x+2）（x+3）。', demo: 'algarea', recall: { q: 'a³×a² 等于多少？', answer: 'a⁵', hint: '3+2=5' }, practice: [{ q: '（a²）³ 等于多少？', answer: 'a⁶', hint: '2×3=6', level: '基础' }, { q: '（x+2）（x+3）展开是多少？', answer: 'x²+5x+6', hint: 'x²+3x+2x+6', level: '提高' }] },
    { id: '8.6', title: '乘法公式', subtitle: '平方差公式、完全平方公式', how: '（a+b）²=a²+2ab+b²。', why: '面积图里大正方形被切成四块。', wrong: '（a+b）²=a²+b²', wrongWhy: '漏了中间两块 ab。', visual: '面积图。', method: '面积模型法', explainBack: '大正方形是 a²+ab+ab+b²。', tryIt: '在面积图上看（5+2）²。', demo: 'algarea', recall: { q: '（a+b）² 展开后中间那项是什么？', answer: '2ab', hint: '两块 ab' }, practice: [{ q: '（x+3）² 展开是多少？', answer: 'x²+6x+9', hint: '2×x×3=6x', level: '基础' }, { q: '（2a-b）² 展开是多少？', answer: '4a²-4ab+b²', hint: '2×2a×b=4ab', level: '提高' }] },
    { id: '8.7', title: '因式分解', subtitle: '提公因式法、公式法、十字相乘法', how: '因式分解就是把多项式写成几个整式的乘积。', why: '乘法和因式分解是互逆的。', wrong: 'x²+5x+6=（x+1）（x+6）', wrongWhy: '1+6=7，不是 5。', visual: '猜两因数。', method: '猜两因数法', explainBack: '相乘得 6、相加得 5 的两个数是 2 和 3。', tryIt: '把 x²+5x+6 写成两个括号相乘。', demo: 'algarea', recall: { q: 'x²+5x+6 分解成哪两个括号相乘？', answer: '（x+2）（x+3）', hint: '相乘得 6、相加得 5' }, practice: [{ q: 'x²+7x+12 分解成哪两个括号相乘？', answer: '（x+3）（x+4）', hint: '3+4=7，3×4=12', level: '基础' }, { q: 'x²-5x+6 分解成哪两个括号相乘？', answer: '（x-2）（x-3）', hint: '-2+（-3）=-5，（-2）×（-3）=6', level: '提高' }] },
  ] },
  { unit: '分式', term: '上', points: [
    { id: '8.8', title: '分式及其运算', subtitle: '分式的概念、约分、通分、分式的加减乘除', how: '分式就是分子分母都带字母的分数。', why: '分母不能为 0。', wrong: '约分时只约分子', wrongWhy: '分子分母要一起约。', visual: '约分点一点。', method: '约分点一点', explainBack: '一对约一对，约干净为止。', tryIt: '把 12a²b/4ab 约分。', demo: 'algfrac', recall: { q: '分式 1/（x-2），x 取几时分式没有意义？', answer: 'x=2', hint: '分母不能为 0' }, practice: [{ q: '6x²y/3xy 约分后是多少？', answer: '2x', hint: '分子分母都约掉 3xy', level: '基础' }, { q: '（x²-9）/（x+3）约分后是多少？', answer: 'x-3', hint: 'x²-9=（x+3）（x-3）', level: '提高' }] },
    { id: '8.9', title: '分式方程', subtitle: '分式方程的解法、增根、检验', how: '去分母把分式方程变成整式方程。', why: '分母不能为 0，解出来要检验。', wrong: '解出来就完了，不用检验', wrongWhy: '解可能是增根。', visual: '过筛子。', method: '去分母、解、检验三步法', explainBack: '增根会让分母变成 0，要筛掉。', tryIt: '解 2/（x-3）=1/（x+1），再检验。', demo: 'eqsieve', recall: { q: '解分式方程最后一步要做什么？', answer: '检验', hint: '看看分母是不是 0' }, practice: [{ q: '方程 1/（x-1）=2/（x²-1）的解是？', answer: '无解（x=1 是增根）', hint: '解出来是 x=1，但 x=1 让分母为 0', level: '基础' }, { q: '方程 2/（x-3）=1/（x+1）的解是？', answer: 'x=-5', hint: '去分母得 2（x+1）=x-3', level: '提高' }] },
  ] },
  { unit: '二次根式', term: '下', points: [
    { id: '8.10', title: '二次根式', subtitle: '二次根式的概念、化简、加减乘除', how: '√12=√（4×3）=2√3。', why: '平方因数可以提出来。', wrong: '√12=√4+√3', wrongWhy: '根号不能拆加法。', visual: '提平方因数。', method: '提平方因数法', explainBack: '4 是平方数，能提出来变成 2。', tryIt: '把 √72 化简。', demo: 'radical', recall: { q: '√12 化简后是多少？', answer: '2√3', hint: '12=4×3，4 是平方数' }, practice: [{ q: '√50 化简后是多少？', answer: '5√2', hint: '50=25×2', level: '基础' }, { q: '√8+√2 等于多少？', answer: '3√2', hint: '√8=2√2', level: '提高' }] },
  ] },
  { unit: '勾股定理', term: '下', points: [
    { id: '8.11', title: '勾股定理', subtitle: '勾股定理、勾股定理的逆定理', how: '直角三角形两条直角边的平方和等于斜边的平方。', why: '三条边上的正方形面积能拼出来。', wrong: 'a²+b²=c² 对所有三角形都成立', wrongWhy: '只对直角三角形成立。', visual: '面积拼图。', method: '面积拼图法', explainBack: 'a²+b² 的面积正好等于 c²。', tryIt: '拼一拼 3、4、5 的三个正方形。', demo: 'pythag', recall: { q: '直角三角形两条直角边是 3 和 4，斜边是几？', answer: '5', hint: '3²+4²=25' }, practice: [{ q: '三边长 6、8、10 的三角形是直角三角形吗？', answer: '是', hint: '6²+8²=100=10²', level: '基础' }, { q: '三边长 3、4、6 的三角形是直角三角形吗？', answer: '不是', hint: '3²+4²=25≠36', level: '提高' }] },
  ] },
  { unit: '平行四边形', term: '下', points: [
    { id: '8.12', title: '平行四边形', subtitle: '平行四边形的性质与判定', how: '平行四边形对边相等、对角相等、对角线互相平分。', why: '推一推，形状变了，边长没变。', wrong: '一组对边相等就能判定平行四边形', wrongWhy: '还可能是等腰梯形。', visual: '推一推。', method: '推一推法', explainBack: '推的时候对边一直平行、一直等长。', tryIt: '把平行四边形推一推，看对角线。', demo: 'pargram', recall: { q: '平行四边形的对角线有什么关系？', answer: '互相平分', hint: '交点是中点' }, practice: [{ q: '平行四边形 ABCD 中 AB=11，BC=7，CD 是多少？', answer: '11', hint: '对边相等', level: '基础' }, { q: '一组对边平行且相等的四边形是平行四边形吗？', answer: '是', hint: '一组对边平行且相等就能判定', level: '提高' }] },
    { id: '8.13', title: '特殊的平行四边形', subtitle: '矩形、菱形、正方形', how: '给平行四边形加一个条件，就变成矩形或菱形。', why: '矩形是角特殊了，菱形是边特殊了。', wrong: '矩形和菱形没有关系', wrongWhy: '两个条件都满足就是正方形。', visual: '加条件变身。', method: '加条件变身法', explainBack: '加“一个角是直角”变矩形，加“邻边相等”变菱形。', tryIt: '给平行四边形加一个条件，看它变成什么。', demo: 'specialquad', recall: { q: '平行四边形加一个“邻边相等”的条件，变成什么？', answer: '菱形', hint: '四条边都相等' }, practice: [{ q: '菱形的对角线是 6 和 8，面积是多少？', answer: '24', hint: '6×8÷2', level: '基础' }, { q: '一个四边形既是矩形又是菱形，它是什么？', answer: '正方形', hint: '两个条件都满足', level: '提高' }] },
  ] },
  { unit: '一次函数', term: '下', points: [
    { id: '8.14', title: '函数与正比例函数', subtitle: '变量与函数、正比例函数', how: '一个量变了，另一个量跟着变。', why: '函数就是两个量之间的对应关系。', wrong: 'y=kx 里 k 可以是 0', wrongWhy: 'k=0 时 y 恒等于 0，不成正比。', visual: '函数图象。', method: '图象法', explainBack: '正比例函数的图象是过原点的一条直线。', tryIt: '拖 k 和 b，看直线怎么变。', demo: 'function', recall: { q: 'y=2x 的图象经过原点吗？', answer: '经过', hint: 'b=0' }, practice: [{ q: 'y=3x 中，x=2 时 y 是几？', answer: '6', hint: '3×2=6', level: '基础' }, { q: '正比例函数 y=kx 经过点（2，6），k 是几？', answer: '3', hint: '6=2k', level: '提高' }] },
    { id: '8.15', title: '一次函数', subtitle: '一次函数的图象与性质、一次函数与方程', how: 'y=kx+b 的图象是一条直线。', why: 'k 管斜率，b 管截距。', wrong: 'k 越大直线越陡', wrongWhy: '陡不陡看 |k|。', visual: '函数图象。', method: '图象法', explainBack: 'k 决定倾斜方向和程度，b 决定和 y 轴的交点。', tryIt: '拖 k 和 b，看直线怎么变。', demo: 'function', recall: { q: 'y=2x+1 和 y 轴交于哪一点？', answer: '（0，1）', hint: 'b=1' }, practice: [{ q: '一次函数 y=-x+3，x=1 时 y 是几？', answer: '2', hint: '-1+3=2', level: '基础' }, { q: '直线 y=2x+1 向下平移 2 个单位，新的解析式是？', answer: 'y=2x-1', hint: 'b 减 2', level: '提高' }] },
  ] },
  { unit: '数据的分析', term: '下', points: [
    { id: '8.16', title: '数据的分析', subtitle: '平均数、中位数、众数、方差', how: '平均数是总和除以个数。', why: '平均数怕极端值，中位数不怕。', wrong: '平均数越小数据越稳定', wrongWhy: '稳定不稳定看方差。', visual: '点图。', method: '点图法', explainBack: '点越集中，方差越小，数据越稳定。', tryIt: '改一个数，看四个量怎么变。', demo: 'datastats', recall: { q: '数据 2、3、3、5、7 的众数是几？', answer: '3', hint: '出现次数最多' }, practice: [{ q: '数据 2、3、3、5、7 的平均数是多少？', answer: '4', hint: '（2+3+3+5+7）÷5', level: '基础' }, { q: '甲组数据方差是 2，乙组是 18，哪组更稳定？', answer: '甲组', hint: '方差越小越稳定', level: '提高' }] },
  ] },
] };

// 桩里的九年级内容：16 个点全留（9.3/9.4 共用 parabola，9.11 用 hyperbola）。
const GRADE9_CONTENT = { grade: 9, edition: 'A', units: [
  { unit: '一元二次方程', term: '上', points: [
    { id: '9.1', title: '解一元二次方程', subtitle: '直接开平方法、配方法、公式法、因式分解法、判别式', how: '配方法是补一块正方形。', why: '公式法就是配方法配出来的通用答案。', wrong: '配方时只加一次项系数的一半，不平方', wrongWhy: '要加一次项系数一半的平方。', visual: '配方法拼图。', method: '配方法拼图', explainBack: '配方法是补一块正方形。', tryIt: '用配方法解 x²+6x-7=0。', demo: 'quad', recall: { q: '方程 x²=9 的解是多少？', answer: 'x=±3', hint: '3²=9，(-3)²=9' }, practice: [{ q: '解方程：x²-5x+6=0。', answer: 'x=2 或 x=3', hint: '因式分解', level: '基础' }, { q: '用配方法解方程：x²+6x-7=0。', answer: 'x=1 或 x=-7', hint: '(x+3)²=16', level: '提高' }] },
    { id: '9.2', title: '一元二次方程的应用与根的判别式', subtitle: '增长率问题、面积问题、根与系数的关系', how: '增长率问题 a(1+x)²=b。', why: '增长率是利滚利。', wrong: '增长率问题写成 a(1+2x)=b', wrongWhy: '连续两次增长是乘两次。', visual: '利滚利动画。', method: '利滚利法', explainBack: '连续两次增长是平方。', tryIt: '算一算：100 元连续两次涨 10% 是多少？', demo: 'growth', recall: { q: '某产品原价 100 元，连续两次降价 10%，现价是多少？', answer: '81 元', hint: '100×0.9×0.9' }, practice: [{ q: '某商品原价 200 元，两次降价后现价 162 元，平均每次降价的百分率是多少？', answer: '10%', hint: '200(1-x)²=162', level: '基础' }, { q: '若关于 x 的方程 x²-2x+k=0 有两个不相等的实数根，求 k 的取值范围。', answer: 'k<1', hint: 'Δ=4-4k>0', level: '提高' }] },
  ] },
  { unit: '二次函数', term: '上', points: [
    { id: '9.3', title: '二次函数的图象和性质', subtitle: '抛物线、开口方向、对称轴、顶点、顶点式', how: '二次函数 y=ax²+bx+c 的图象是抛物线。', why: '抛物线是“对称的弯”。', wrong: '顶点式 y=a(x-h)²+k 的顶点是 (-h,k)', wrongWhy: '顶点是 (h,k)。', visual: '抛物线滑杆。', method: '滑杆看抛物线法', explainBack: 'a 管开口方向和大小。', tryIt: '画一画 y=x²、y=2x²、y=-x² 的图象。', demo: 'parabola', recall: { q: '抛物线 y=2(x-1)²+3 的顶点坐标是多少？', answer: '(1,3)', hint: '顶点式' }, practice: [{ q: '抛物线 y=-x²+4x-3 的开口方向和对称轴。', answer: '开口向下，对称轴 x=2', hint: 'a=-1', level: '基础' }, { q: '求抛物线 y=x²-2x-3 的顶点坐标和与 x 轴的交点。', answer: '顶点 (1,-4)，与 x 轴交于 (3,0) 和 (-1,0)', hint: '顶点横坐标 x=1', level: '提高' }] },
    { id: '9.4', title: '二次函数与方程及应用', subtitle: '图象与 x 轴的交点、最值问题', how: '抛物线与 x 轴的交点横坐标就是方程的根。', why: 'y=0 的点就是方程的解。', wrong: '抛物线与 x 轴没有交点，方程就有两个根', wrongWhy: '没有交点，Δ<0，没有实数根。', visual: '抛物线上下移动。', method: '交点即根法', explainBack: '抛物线与 x 轴的交点横坐标就是方程的根。', tryIt: '算一算 y=x²-4x+3 与 x 轴有几个交点。', demo: 'parabola', recall: { q: '抛物线 y=x²-4x+3 与 x 轴有几个交点？', answer: '2 个', hint: 'Δ=4>0' }, practice: [{ q: '求抛物线 y=x²-2x-8 与 x 轴交点的横坐标。', answer: '4 和 -2', hint: '令 y=0', level: '基础' }, { q: '某商品每件利润 30 元，每天可卖 80 件；每涨价 1 元，每天少卖 2 件。涨价几元时每天总利润最大？', answer: '涨价 5 元，最大利润 2450 元', hint: '顶点', level: '提高' }] },
  ] },
  { unit: '旋转', term: '上', points: [
    { id: '9.5', title: '图形的旋转与中心对称', subtitle: '旋转、旋转角、中心对称、中心对称图形', how: '旋转是绕一个定点、按一个方向、转一个角度。', why: '旋转是钉住一点转。', wrong: '旋转后图形变大了', wrongWhy: '旋转只改变位置。', visual: '旋转动画。', method: '钉住一点转', explainBack: '旋转只变位置不改形状。', tryIt: '把三角形绕一个点旋转 90°。', demo: 'spin', recall: { q: '正方形绕它的中心旋转多少度能与自身重合？', answer: '90°', hint: '360°÷4' }, practice: [{ q: '点 A(2,3) 绕原点旋转 180° 后，对应点的坐标是多少？', answer: '(-2,-3)', hint: '横、纵坐标都变号', level: '基础' }, { q: '等边三角形绕它的中心旋转多少度能与自身重合？', answer: '120°', hint: '360°÷3', level: '提高' }] },
  ] },
  { unit: '圆', term: '上', points: [
    { id: '9.6', title: '圆的有关性质', subtitle: '垂径定理、圆心角、圆周角', how: '一条弧所对的圆周角等于它所对圆心角的一半。', why: '站在圆上看，视角只有圆心的一半。', wrong: '圆周角等于圆心角', wrongWhy: '圆周角是圆心角的一半。', visual: '圆周角动画。', method: '站圆上看弦法', explainBack: '圆周角是圆心角的一半。', tryIt: '量一量同一条弧所对的圆心角和圆周角。', demo: 'circangle', recall: { q: '圆心角∠AOB=80°，它所对弧上的圆周角是多少度？', answer: '40°', hint: '一半' }, practice: [{ q: '半径是 5 的圆中，一条弦长 8，这条弦到圆心的距离是多少？', answer: '3', hint: '√(5²-4²)', level: '基础' }, { q: '圆周角∠ACB=35°，它所对的圆心角∠AOB 是多少度？', answer: '70°', hint: '2 倍', level: '提高' }] },
    { id: '9.7', title: '点、直线和圆的位置关系', subtitle: '点和圆、直线和圆、切线、切线长、外心与内心', how: 'd<r 相交，d=r 相切，d>r 相离。', why: '切线是刚好碰一下的直线。', wrong: '外心和内心是一回事', wrongWhy: '外心到顶点等距，内心到三边等距。', visual: '位置关系动画。', method: '距离比半径法', explainBack: 'd<r 相交，d=r 相切，d>r 相离。', tryIt: '画一个圆，画一条直线，判断位置关系。', demo: 'tangent', recall: { q: '圆的半径是 4，圆心到一条直线的距离是 4，这条直线和圆是什么关系？', answer: '相切', hint: 'd=r' }, practice: [{ q: '圆的半径是 6，圆心到直线的距离是 3，直线和圆有几个交点？', answer: '2 个', hint: 'd<r', level: '基础' }, { q: 'PA、PB 是⊙O 的两条切线，PA=8，PB 长是多少？', answer: '8', hint: '切线长相等', level: '提高' }] },
    { id: '9.8', title: '弧长和扇形面积', subtitle: '弧长公式、扇形面积、圆锥的侧面积', how: '弧长 l=nπr/180，扇形面积 S=nπr²/360。', why: '弧长是圆周长的几分之几。', wrong: '弧长公式用直径不用半径', wrongWhy: '公式里的 r 是半径。', visual: '扇形切分动画。', method: '几分之几法', explainBack: '弧长是圆周长的几分之几。', tryIt: '算一算半径 6、圆心角 60° 的扇形的弧长和面积。', demo: 'sector', recall: { q: '半径 6、圆心角 60° 的扇形，弧长是多少？', answer: '2π', hint: 'l=60×π×6÷180' }, practice: [{ q: '半径是 10、圆心角是 90° 的扇形面积是多少？', answer: '25π', hint: 'S=90×π×10²÷360', level: '基础' }, { q: '一个圆锥的底面半径是 3，母线长是 5，它的侧面积是多少？', answer: '15π', hint: 'πrl', level: '提高' }] },
  ] },
  { unit: '概率初步', term: '上', points: [
    { id: '9.9', title: '随机事件与概率', subtitle: '确定事件、随机事件、概率的定义', how: '概率 P(A)=m/n。', why: '概率是长期频率。', wrong: '抛硬币连续 3 次正面，下一次一定是反面', wrongWhy: '每次都是独立的。', visual: '抛硬币模拟器。', method: '长期频率法', explainBack: '概率是长期频率。', tryIt: '抛 10 次硬币，数一数正面几次。', demo: 'monty', recall: { q: '一个袋子里有 3 个红球、2 个白球，摸出一个球，摸到红球的概率是多少？', answer: '3/5', hint: '3 个红球，一共 5 个球' }, practice: [{ q: '掷一枚骰子，掷出偶数的概率是多少？', answer: '1/2', hint: '偶数有 3 个', level: '基础' }, { q: '一个转盘平均分成 8 份，其中 3 份是红色，指针停在红色区域的概率是多少？', answer: '3/8', hint: '3 份红色', level: '提高' }] },
    { id: '9.10', title: '列举法求概率与频率估计', subtitle: '列表法、树状图法、用频率估计概率', how: '列表法画表格，树状图法画分支。', why: '把所有可能都摆出来数。', wrong: '两枚骰子点数和是 7 的概率是 1/11', wrongWhy: '11 种和数不是等可能的。', visual: '树状图生成器。', method: '摆出来数清法', explainBack: '列表画树，把所有可能摆出来数。', tryIt: '掷两枚硬币，画树状图列出所有结果。', demo: 'tree', recall: { q: '掷两枚硬币，用树状图列一列，一共有几种可能的结果？', answer: '4 种', hint: '2×2' }, practice: [{ q: '同时掷两枚硬币，两枚都是正面的概率是多少？', answer: '1/4', hint: '4 种里只有正正 1 种', level: '基础' }, { q: '从 1、2、3、4 四张卡片中抽两张（不放回），两张都是奇数的概率是多少？', answer: '1/6', hint: '只有 (1,3) 1 种组合', level: '提高' }] },
  ] },
  { unit: '反比例函数', term: '下', points: [
    { id: '9.11', title: '反比例函数', subtitle: '反比例函数的概念、图象、性质、k 的几何意义', how: '反比例函数 y=k/x 的图象是双曲线。', why: 'y=k/x 是乘积一定。', wrong: '反比例函数图象经过原点', wrongWhy: 'x=0 时 y 没意义。', visual: '双曲线滑杆。', method: '乘积一定法', explainBack: 'xy=k，乘积一定。', tryIt: '画一画 y=6/x 和 y=-6/x 的图象。', demo: 'hyperbola', recall: { q: '点 (2,3) 在反比例函数 y=k/x 的图象上，k 是多少？', answer: '6', hint: 'k=xy' }, practice: [{ q: '反比例函数 y=6/x 的图象在第几象限？', answer: '第一、三象限', hint: 'k=6>0', level: '基础' }, { q: '若点 A(-2,3) 在反比例函数 y=k/x 的图象上，求 k，并判断点 B(3,-2) 在不在图象上。', answer: 'k=-6，B 在图象上', hint: '乘积都是 -6', level: '提高' }] },
  ] },
  { unit: '相似', term: '下', points: [
    { id: '9.12', title: '图形的相似与位似', subtitle: '相似图形、相似比、面积比、位似', how: '周长比=相似比，面积比=相似比的平方。', why: '相似是按比例放大缩小。', wrong: '面积比等于相似比', wrongWhy: '面积比是相似比的平方。', visual: '放大缩小动画。', method: '按比例放大法', explainBack: '周长比等于相似比，面积比等于相似比的平方。', tryIt: '算一算：相似比 2:3 的两个三角形，面积比是多少？', demo: 'similar', recall: { q: '两个相似三角形的相似比是 2:3，它们的面积比是多少？', answer: '4:9', hint: '平方' }, practice: [{ q: '两个相似多边形的相似比是 1:2，小多边形的周长是 10，大多边形的周长是多少？', answer: '20', hint: '周长比等于相似比', level: '基础' }, { q: '两个相似三角形的面积比是 9:16，相似比是多少？', answer: '3:4', hint: '开方', level: '提高' }] },
    { id: '9.13', title: '相似三角形', subtitle: '相似三角形的判定与性质、应用', how: '判定：AA、SAS、SSS、HL。', why: 'AA 就够了。', wrong: '两边成比例就能判定相似', wrongWhy: '还要夹角相等。', visual: '影子测高动画。', method: '影子测高法', explainBack: '两角相等就能判定相似。', tryIt: '量一量自己的影子和旗杆的影子。', demo: 'shadow', recall: { q: '△ABC∽△DEF，AB=6，DE=9，BC=8，EF 是多少？', answer: '12', hint: '6:9=8:EF' }, practice: [{ q: '△ABC∽△DEF，相似比是 2:5，△ABC 的周长是 12，△DEF 的周长是多少？', answer: '30', hint: '12×5÷2', level: '基础' }, { q: '旗杆的影子长 12 米，同一时刻身高 1.6 米的人影子长 2 米，旗杆高多少米？', answer: '9.6 米', hint: '1.6:2=旗杆高:12', level: '提高' }] },
  ] },
  { unit: '锐角三角函数', term: '下', points: [
    { id: '9.14', title: '锐角三角函数', subtitle: '正弦、余弦、正切、特殊角、同角关系', how: 'sin A=对边/斜边，cos A=邻边/斜边，tan A=对边/邻边。', why: 'sin、cos、tan 是角的比值。', wrong: 'sin30°=1/2，所以 sin60°=1', wrongWhy: '角度翻倍，比值不翻倍。', visual: '角的比值动画。', method: '角定比值定法', explainBack: 'sin 是对边比斜边。', tryIt: '在 Rt△ABC 中算一算 sin A、cos A、tan A。', demo: 'trig', recall: { q: '直角三角形中，∠A=30°，斜边是 10，∠A 的对边长是多少？', answer: '5', hint: 'sin30°=1/2' }, practice: [{ q: '在 Rt△ABC 中，∠C=90°，AC=3，BC=4，求 sin A 和 tan A 的值。', answer: 'sin A=4/5，tan A=4/3', hint: '斜边 AB=5', level: '基础' }, { q: '计算：sin²30°+cos²30° 的值。', answer: '1', hint: '(1/2)²+(√3/2)²', level: '提高' }] },
    { id: '9.15', title: '解直角三角形及其应用', subtitle: '解直角三角形、仰角俯角、坡度', how: '仰角俯角都是视线和水平线的夹角。', why: '选三角函数就是看已知什么、求什么。', wrong: '仰角是从铅垂线量的', wrongWhy: '仰角是视线和水平线的夹角。', visual: '仰角俯角演示。', method: '画图选函数法', explainBack: '已知什么、求什么，就选哪个三角函数。', tryIt: '测一测看旗杆顶的仰角。', demo: 'slope', recall: { q: '站在地面看 10 米高的楼顶，仰角是 30°，你离楼底多远？', answer: '约 17.3 米', hint: 'tan30°=10÷距离' }, practice: [{ q: '在 Rt△ABC 中，∠C=90°，∠A=30°，斜边 AB=8，求 BC 的长。', answer: '4', hint: 'sin30°=BC/8', level: '基础' }, { q: '一条斜坡的坡度是 1:1，坡面长是 4√2 米，坡的铅直高度是多少？', answer: '4 米', hint: 'h²+h²=(4√2)²', level: '提高' }] },
  ] },
  { unit: '投影与视图', term: '下', points: [
    { id: '9.16', title: '投影与视图', subtitle: '平行投影、中心投影、三视图', how: '主视图从前看，左视图从左看，俯视图从上看。', why: '三视图是三个方向的影子。', wrong: '俯视图是从下面看的', wrongWhy: '俯视图是从上面往下看。', visual: '三视图转盘。', method: '三个方向看影子法', explainBack: '长对正、高平齐、宽相等。', tryIt: '画一画圆柱和长方体的三视图。', demo: 'project', recall: { q: '一个正方体的主视图、左视图、俯视图分别是什么图形？', answer: '都是正方形', hint: '从哪个方向看都是正方形' }, practice: [{ q: '一个圆柱的主视图是什么图形？俯视图呢？', answer: '主视图是长方形，俯视图是圆形', hint: '从前面看是长方形', level: '基础' }, { q: '一个几何体的主视图是长方形，俯视图是圆形，这个几何体可能是什么？', answer: '圆柱', hint: '主视图长方形、俯视图圆形', level: '提高' }] },
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
// 注册表通用卡片 + 一张旧卡片挂进 demoGrid：桩不解析 index.html，
// applyView 的逐卡片 hidden 逻辑在桩里否则没有 children 可设。
// id 要手动补上（真实 DOM 里 id 来自 HTML，桩元素默认没有 id 属性）。
const animCardSeed = documentStub.getElementById('demo-anim');
animCardSeed.id = 'demo-anim';
documentStub.getElementById('demoGrid').appendChild(animCardSeed);
const oldCardSeed = documentStub.getElementById('demo-tenframe');
oldCardSeed.id = 'demo-tenframe';
documentStub.getElementById('demoGrid').appendChild(oldCardSeed);

// ---------- load MathWorld then the real app.js ----------
const root = require('path').resolve(__dirname, '..');
const worldSrc = fs.readFileSync(root + '/apps/web/math-world.js', 'utf8');
const apparatusSrc = fs.readFileSync(root + '/apps/web/apparatus.js', 'utf8');
const src = fs.readFileSync(root + '/apps/web/app.js', 'utf8');
const sandbox = { document: documentStub, window: windowStub, console, setTimeout, Math, JSON, Object, Array, String, Number, parseInt, parseFloat, isNaN, GRADE3_CONTENT, GRADE1_CONTENT, GRADE2_CONTENT, GRADE4_CONTENT, GRADE5_CONTENT, GRADE6_CONTENT, GRADE7_CONTENT, GRADE8_CONTENT, GRADE9_CONTENT, localStorage: localStorageStub };
vm.createContext(sandbox);
try {
  vm.runInContext(worldSrc, sandbox, { filename: 'math-world.js' });
  vm.runInContext(fs.readFileSync(root + '/apps/web/bench-views.js', 'utf8'), sandbox, { filename: 'bench-views.js' });
  sandbox.BenchViews = windowStub.BenchViews || sandbox.BenchViews || (sandbox.globalThis && sandbox.globalThis.BenchViews);
  // math-world attaches to window (windowStub) when present.
  sandbox.MathWorld = windowStub.MathWorld || sandbox.MathWorld || sandbox.globalThis && sandbox.globalThis.MathWorld;
  vm.runInContext(apparatusSrc, sandbox, { filename: 'apparatus.js' });
  sandbox.Apparatus = windowStub.Apparatus || sandbox.Apparatus;
  // 动画注册表（§5.1）：band 文件在 app.js 之前加载；文件不存在时跳过，
  // 这样新检查在改前代码上干净失败而不是整个测试崩掉。
  ['anims-registry.js', 'anims-band-1-3.js', 'anims-band-4-6.js', 'anims-band-7-9.js', 'anims-operations.js'].forEach(f => {
    const p = root + '/apps/web/' + f;
    if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), sandbox, { filename: f });
  });
  vm.runInContext(src, sandbox, { filename: 'app.js' });
  console.log('LOAD OK');
} catch (e) { console.log('LOAD FAILED: ' + e.message); process.exit(1); }
check('MathWorld available in app sandbox', !!(sandbox.MathWorld || windowStub.MathWorld));
check('Apparatus available in app sandbox', !!(sandbox.Apparatus || windowStub.Apparatus));

// 动画总数是算出来的，不是写死的：145 个旧演示（注册表之前的手写演示，数已冻结——
// 之后的新动画一律走注册表）+ 注册表里的动画数。写死一个数，下批动画一到分母就过期
// （2026-11-07：146 写死时 46 条失败）。旧代码没有注册表文件时 ANIM_REGISTRY 为空，总数就是 145。
const TOTAL_DEMOS = 145 + Object.keys(sandbox.ANIM_REGISTRY || {}).length;

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

// ---------- 3b. 模拟测（低压力自测） ----------
// 到这里 reviewStore 里只有 3.7（第 2 节标过一次答对），演示一个都还没玩，
// 所以“学过”只有 3.7：第一套题必然包含 3.7，且有 4 道是混合题补的。
// Math.random 固定为 0，让抽题完全确定：3.7 抽到的是第 1 道练习题（有分步）。
const examDetail = byId.examDetail;
function clickExam(el) { (examDetail._handlers.click || []).forEach(f => f({ target: el })); }
function examBtn(data) { const b = makeEl('button'); Object.assign(b.dataset, data); return b; }
// 把当前这道题标对 / 标错：有分步的题一步一步标，没分步的整题标。返回这道题是否有分步。
function examMarkCurrent(correct) {
  const hasSteps = examDetail.innerHTML.includes('data-exam-step-reveal');
  if (hasSteps) {
    const n = (examDetail.innerHTML.match(/data-exam-step-reveal="/g) || []).length;
    for (let si = 0; si < n; si++) {
      clickExam(examBtn({ examStepReveal: String(si) }));
      const b = examBtn({ examStepBtn: correct ? 'right' : 'wrong' });
      const row = makeEl('div'); row.dataset.examStepMark = String(si);
      b.closest = (sel) => sel === '[data-exam-step-btn]' ? b : (sel === '[data-exam-step-mark]' ? row : null);
      clickExam(b);
    }
  } else {
    clickExam(examBtn({ examMark: correct ? 'right' : 'wrong' }));
  }
  return hasSteps;
}
check("viewForKey('exam') is exam", sandbox.viewForKey('exam') === 'exam');
navGo('exam');
check('exam intro renders', byId.exam.hidden === false && examDetail.innerHTML.includes('模拟测') && examDetail.innerHTML.includes('开始模拟测'));
check('exam view: home panels + grades hidden', byId.panels.hidden === true && byId.grades.hidden === true && byId.review.hidden === true);
const origRandom = Math.random;
Math.random = () => 0;
clickExam(examBtn({ examBegin: '1' }));
check('exam: timer shows 10:00', (byId.examTimer.textContent || '').includes('10:00'));
check('exam: first question shown, no hint/answer in exam',
  examDetail.innerHTML.includes('第 1 / 5 题') &&
  !examDetail.innerHTML.includes('data-hint') && !examDetail.innerHTML.includes('看答案') &&
  !examDetail.innerHTML.includes('要提示'));
check('exam: honest note when learned points are fewer than 5',
  examDetail.innerHTML.includes('1 道来自你学过的知识点') && examDetail.innerHTML.includes('混合题'));
let examSawSteps = false;
for (let qi = 0; qi < 5; qi++) {
  if (examMarkCurrent(false)) examSawSteps = true;
  if (qi < 4) {
    clickExam(examBtn({ examNext: '1' }));
    check('exam: moved to question ' + (qi + 2), examDetail.innerHTML.includes('第 ' + (qi + 2) + ' / 5 题'));
  }
}
check('exam: a steps question was in the set (3.7 from learned)', examSawSteps);
clickExam(examBtn({ examSubmit: '1' }));
check('exam: report shown after 5 questions', examDetail.innerHTML.includes('模拟测报告'));
check('exam: all-wrong run scores 0', examDetail.innerHTML.includes('0 分') && examDetail.innerHTML.includes('正确率 0%'));
check('exam: report names the stuck step', examDetail.innerHTML.includes('你卡在第 1 步 · 看分母'));
const examStored = JSON.parse(lsData['math-review-v1'] || '{}');
check('exam: wrong points entered the review store',
  Object.keys(examStored).filter(id => examStored[id] && examStored[id].correct === false).length >= 5);
Math.random = origRandom;
// 第二套：再测一套 + 提前交卷（只标第 1 题对，剩下按答错算）。
clickExam(examBtn({ examAgain: '1' }));
check('exam: again starts a new set', examDetail.innerHTML.includes('第 1 / 5 题') && examDetail.innerHTML.includes('还剩 10:00'));
examMarkCurrent(true);
const earlySubmit = examBtn({ examSubmit: '1' });
clickExam(earlySubmit);
check('exam: early submit asks to confirm', earlySubmit.textContent.includes('确认交卷') &&
  examDetail.querySelector('[data-exam-remind]').textContent.includes('还有 4 道题没标对错'));
clickExam(earlySubmit);
check('exam: early submit reports with unanswered counted wrong',
  examDetail.innerHTML.includes('模拟测报告') && examDetail.innerHTML.includes('20 分') && examDetail.innerHTML.includes('正确率 20%'));
// 模拟测里错的题今天就进今天复习（due 拨到现在）：去今天复习看看，今天列表不是空的。
navGo('grade-3-review');
check('exam: wrong points show up in today review the same day',
  pointDetail.innerHTML.includes('今天复习') && !pointDetail.innerHTML.includes('今天没有到期的复习'));
navGo('home');
check('exam: leaving exam hides the exam section', byId.exam.hidden === true);

// 模拟测修复（真机复测 A/B/D）：分步题必出、计时不回跳、换数字题进模拟测。
// A · 分步题必出：学过只剩 3.12（没有分步题）时，连续 5 套题里每套都至少有一道分步题
// （改前是纯随机抽，3.12 一套里没有分步题就整套都没有；桩内容里只有 3.7 有分步题）。
const origLearnedAB = sandbox.learnedPointIds;
sandbox.learnedPointIds = () => new Set(['3.12']);
Math.random = () => 0;
let examStepOk = true;
for (let s = 0; s < 5; s++) {
  if (!sandbox.pickExamQuestions().qs.some(x => x.q && x.q.steps && x.q.steps.length)) examStepOk = false;
}
check('exam: every set contains a step question even when no learned point has steps', examStepOk);
// D · 换数字题进模拟测：抽题走参数化出题路径（改前这条路一直都在，这里是防退化锁），
// 题面带“换数字再练”药丸（和混着练一样一眼能认出来）；生成题答错了记下当初那组数字。
const examQgenSet = sandbox.pickExamQuestions();
check('exam: qgen-type learned point yields a generated variant (type set)',
  examQgenSet.qs.some(x => x.q && x.q.type));
navGo('exam');
clickExam(examBtn({ examBegin: '1' }));
let examTagSeen = false;
for (let i = 0; i < 5; i++) {
  const isGen = examDetail.innerHTML.includes('换数字再练');
  if (isGen) examTagSeen = true;
  examMarkCurrent(!isGen); // 生成题标错、别的标对：正好验一把错题记数
  if (i < 4) clickExam(examBtn({ examNext: '1' }));
}
check('exam: a generated variant in the set shows the 换数字再练 pill', examTagSeen);
clickExam(examBtn({ examSubmit: '1' })); // 5 道都标完了，直接出报告
check('exam: submitting a fully marked set reports directly',
  examDetail.innerHTML.includes('模拟测报告'));
const examFailed = JSON.parse(lsData['math-qgen-failed-v1'] || '{}')['3.12'];
check('exam: a generated variant marked wrong is stored for exact replay',
  examFailed && typeof examFailed.q === 'string' && examFailed.q.indexOf('一块长方形黑板') === 0);
sandbox.learnedPointIds = origLearnedAB;
Math.random = origRandom;
navGo('home');

// B · 计时不回跳：开考后把时间拨快 3 分半（Date.now 替身），再翻到下一题，
// 题面上的倒计时必须是从 10:00 往下走的 06:30，而不是回到 10:00。
// 注意：从外面读 sandbox.Date 是 undefined（vm 内建的 Date 不是沙箱的自有属性），
// 所以不能用“存起来再赋值回去”的办法恢复——直接删掉替身，内建 Date 就回来了。
navGo('exam');
clickExam(examBtn({ examBegin: '1' }));
const t0b = Date.now();
examMarkCurrent(true);
sandbox.Date = { now: () => t0b + 210000 };
clickExam(examBtn({ examNext: '1' }));
check('exam: timer keeps counting down on question render (06:30, not 10:00)',
  examDetail.innerHTML.includes('还剩 06:30'));
delete sandbox.Date;
navGo('home');

// ---------- 4. grade 1 ----------
navGo('grade-1');
check('grade-1 shows real units', gradeDetail.innerHTML.includes('20以内的进位加法') && gradeDetail.innerHTML.includes('100以内数的认识'));
check('grade-1 has mix/review buttons', gradeDetail.innerHTML.includes('混着练') && gradeDetail.innerHTML.includes('今天复习'));
navGo('unit-1-0');
check('grade-1 unit view lists points', pointDetail.innerHTML.includes('1.9'));
navGo('point-1.9');
check('point 1.9 shows olympiad section', pointDetail.innerHTML.includes('挑战 · 奥数') && pointDetail.innerHTML.includes('9+7+1+3'));
check('point 1.9 shows level pills', pointDetail.innerHTML.includes('基础') && pointDetail.innerHTML.includes('提高'));
check('point 1.9 links the thirteen experiment', pointDetail.innerHTML.includes('去玩13有几种凑法') && pointDetail.innerHTML.includes('data-demo-link="demo-thirteen"'));
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
check('demo counter counts a played demo', byId.progressCount.textContent === '1 / ' + TOTAL_DEMOS &&
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
// 今天复习：3.7 今天没到期（错了明天才来），所以 3.7 在明天回来里，不在今天列表里。
// 注意：模拟测（第 3b 节）错的题是当天进今天复习的，所以今天列表不再是空的——
// 这里只断言 3.7 的位置（第一次出现必须在“明天回来”之后），不断言今天列表为空。
navGo('grade-3-review');
check('tomorrow section lists the wrong step for tomorrow, not today',
  pointDetail.innerHTML.includes('明天回来') &&
  pointDetail.innerHTML.indexOf('3.7') > pointDetail.innerHTML.indexOf('明天回来'));
check('grade-3 review still renders after the fix',
  pointDetail.innerHTML.includes('今天复习') && /练过 \d+ 条/.test(pointDetail.innerHTML));

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
check('G1 demos count toward the ' + TOTAL_DEMOS + '-demo progress', g1ProgBefore === '4 / ' + TOTAL_DEMOS && byId.progressCount.textContent === '5 / ' + TOTAL_DEMOS);
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
const g1expected = {'1.1':'count','1.2':'position','1.3':'split','1.4':'addsub','1.5':'solids','1.6':'tenframe','1.7':'bundle','1.8':'clock','1.9':'thirteen','1.10':'tangram','1.11':'tenframe','1.12':'sort','1.13':'hundred','1.14':'shop','1.15':'place','1.16':'pattern'};
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
check('G2 demos count toward the ' + TOTAL_DEMOS + '-demo progress', g2ProgBefore === '17 / ' + TOTAL_DEMOS && byId.progressCount.textContent === '18 / ' + TOTAL_DEMOS);

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
check('G2: all 15 new demos tried by now', byId.progressCount.textContent === '32 / ' + TOTAL_DEMOS);

// ---------- 12. 全站布局改版（2026-11-06 真机审计） ----------
// CSS：顶栏实底不透光，模式栏不吸顶，演示单列，知识点页窄栏
check('layout CSS: topbar is solid opaque, no backdrop blur',
  !cssText.includes('backdrop-filter') && /\.topbar\{[^}]*background:#fff/.test(cssText));
check('layout CSS: mode bar is not sticky', cssText.includes('.mode-bar{position:static'));
check('layout CSS: open demo renders single-column full-width',
  cssText.includes('.demo-grid{display:grid;grid-template-columns:minmax(0,1fr)'));
check('layout CSS: point page is a narrow centered column',
  cssText.includes('.point-detail{scroll-margin-top:88px;max-width:760px;margin:0 auto'));
// index.html：首页 9 块面板分两组，含今天复习入口和闯关路入口；函数表有 x=4
const htmlText = fs.readFileSync(root + '/apps/web/index.html', 'utf8');
const panelsSec = htmlText.split('id="panels"')[1].split('</section>')[0];
check('home: 9 panels in two groups incl. 今天复习、闯关路、数学实验室',
  (panelsSec.match(/data-nav-key="/g) || []).length === 9 && panelsSec.includes('data-nav-key="today-review"') &&
  panelsSec.includes('data-nav-key="checkpoint"') && panelsSec.includes('data-nav-key="lab"') &&
  !panelsSec.includes('data-nav-key="world"') &&
  panelsSec.includes('开始学') && panelsSec.includes('工具箱'));
check("viewForKey('world') redirects to lab (NB)", sandbox.viewForKey('world') === 'lab');
navGo('world');
check('world bookmark opens lab with MathWorld workbench',
  byId.lab.hidden === false && byId.panels.hidden === true && documentStub.body.dataset.view === 'lab');
if (typeof sandbox.worldPlayRender === 'function') sandbox.worldPlayRender();
// 视觉大改后信号写成 innerHTML 的小标签（不再是 textContent 的文本行），
// 所以这里读 innerHTML；真机上两者都含“台上/合计”。
check('lab MathWorld workbench uses shared world',
  !!sandbox.MathWorld && byId.worldDerivedOut.innerHTML.includes('台上') &&
    byId.worldDerivedOut.innerHTML.includes('合计'));
// v0.9 addendum (NB 走访 §7)：整个世界自动保存，刷新后直接回来，不让学生丢东西
if (typeof sandbox.labWorldSave === 'function' && sandbox.labWorld) {
  sandbox.labWorldSave();
  const savedWorld = JSON.parse(lsData['math-lab-world-v1'] || 'null');
  check('lab autosave stores the whole world (bench + apparatus)',
    !!savedWorld && Array.isArray(savedWorld.bench) && !!savedWorld.linefn && savedWorld.linefn.k === 2);
  const restoredWorld = sandbox.labWorldRestore();
  check('lab restore brings the saved world back',
    !!restoredWorld && restoredWorld.linefn && restoredWorld.linefn.k === 2 && Array.isArray(restoredWorld.bench));
}
// 2026-11-07 复测修：刷新后进实验室，摆过的数、改过的器材值要全回来。
// 根因有二：(a) 加载时 labWbRender → labSyncBalanceToWorld 在 labWorld 为空时
// create 全新世界，之后再也不恢复，labWorldSave 还把空世界存回去毁掉保存；
// (b) 进题重设（seedQuestion）+ 同步的“全新世界只带回台面”把长方形/天平洗回默认值。
// 下面三条在改前代码上干净失败：1a 是空世界（rect 宽 1、台面 0、天平空），
// 1b/1c 是长方形宽被重设回 1、天平被重设回 1/2。
if (typeof sandbox.labWorldSave === 'function' && typeof sandbox.labWbRender === 'function') {
  // 摆一个有内容的世界：台上 2 和 5、长方形宽 4、天平左 1/2 + 1/4，保存。
  const wFix = sandbox.MathWorld.create({
    rect: { perim: 20, w: 4 },
    balance: { L: [{ n: 1, d: 2 }, { n: 1, d: 4 }], R: [] },
  });
  sandbox.labWorld = wFix; sandbox.mwPlay = wFix;
  const mkFix2 = sandbox.benchRun({ type: 'makePiece', piece: { kind: 'num', v: 2 } });
  if (mkFix2) sandbox.benchRun({ type: 'benchPut', pieceId: mkFix2.pieceId });
  const mkFix5 = sandbox.benchRun({ type: 'makePiece', piece: { kind: 'num', v: 5 } });
  if (mkFix5) sandbox.benchRun({ type: 'benchPut', pieceId: mkFix5.pieceId });
  sandbox.labWorldSave();
  // 1a：模拟刷新——世界变量清掉，再走加载时的 labWbRender。
  sandbox.labWorld = null; sandbox.mwPlay = null;
  sandbox.labWbRender();
  check('lab autosave survives load-time legacy render (bench 2+5, rect w=4, balance L 1/2+1/4 kept)',
    !!sandbox.labWorld && sandbox.labWorld.rect.w === 4 &&
    sandbox.labWorld.balance.L.length === 2 &&
    sandbox.MathWorld.derived(sandbox.labWorld).bench.count === 2);
  // 1b：模拟刷新后直接进题——保存的长方形宽 4 不能被 seedQuestion 重设回 1。
  sandbox.labWorld = null; sandbox.mwPlay = null; sandbox.labRestoredFlag = false;
  sandbox.labSeedWorld('q-maxarea');
  check('lab autosave survives entering a question (rect width kept, not reseeded to 1)',
    !!sandbox.labWorld && sandbox.labWorld.rect.w === 4);
  sandbox.labRestoredFlag = false;
  // 1c：模拟刷新后进天平题——legacy 重设（左 1/2）也要让路，保存的 1/2+1/4 和宽 4 都在。
  sandbox.labWorld = null; sandbox.mwPlay = null; sandbox.labRestoredFlag = false;
  sandbox.labEnterQuestion('q-balfrac');
  check('lab autosave survives entering balance question (legacy reset skipped, saved values kept)',
    !!sandbox.labWorld && sandbox.labWorld.rect.w === 4 &&
    sandbox.labWorld.balance.L.length === 2 && sandbox.labWbL.length === 2);
  sandbox.labRestoredFlag = false;
  // 1d：同步只换自己的器材——天平同步后，长方形宽 4、分数板、直线都不动。
  sandbox.labWbL = [{ kind: 'frac', n: 1, d: 2 }]; sandbox.labWbR = [{ kind: 'num', v: 3 }];
  sandbox.labSyncBalanceToWorld();
  check('lab balance sync keeps other apparatus (rect w=4, fracboard 1/2+1/3, linefn k=2)',
    !!sandbox.labWorld && sandbox.labWorld.rect.w === 4 &&
    sandbox.labWorld.fracboard.A.n === 1 && sandbox.labWorld.fracboard.A.d === 2 &&
    sandbox.labWorld.linefn.k === 2 &&
    sandbox.MathWorld.derived(sandbox.labWorld).bench.count === 2);
  // 收尾：天平 legacy 数组和世界恢复成空盘，别影响后面的 lab2 天平检查（它默认空盘起手）。
  sandbox.labWbL = []; sandbox.labWbR = [];
  sandbox.labSyncBalanceToWorld();
}
// 2026-11-07 复测修（第 2 阶段后）：进天平题台面就画天平；值没变别重建天平；
// 组合台的盘子跟世界走。下面每条在改前代码上干净失败。
if (typeof sandbox.labEnterQuestion === 'function' && typeof sandbox.labSyncBalanceToWorld === 'function') {
  // 修 2：之前放过长方形（benchShowBalance=false），天平也不在台面上
  // （benchBalance=false，默认台面是空的）。进天平题要把天平放上台 + 切回
  // 天平视图，不然台面还停在坐标系，盘子画不出来、砝码拖上去落不到盘上。
  sandbox.benchShowBalance = false; sandbox.benchPreferredView = 'coord';
  if (sandbox.labWorld) sandbox.labWorld.benchBalance = false;
  sandbox.labEnterQuestion('q-balfrac');
  check('lab entering balance question puts the balance on the bench and switches to the balance view (was coord after rect)',
    sandbox.benchShowBalance === true && sandbox.benchPreferredView === null &&
    sandbox.labWorld && sandbox.labWorld.benchBalance === true);
  // 修 3a：值没变再同步一次，piece id 不能换（旧代码无条件重建，id 全换——
  // create 的 id 是 Date.now+随机数，两次重建一定不一样）。
  sandbox.labWbL = [{ kind: 'frac', n: 1, d: 2 }]; sandbox.labWbR = [{ kind: 'num', v: 3 }];
  sandbox.labSyncBalanceToWorld();
  const balIdsBefore = (sandbox.labWorld.balance.L || []).concat(sandbox.labWorld.balance.R || []).slice();
  sandbox.labSyncBalanceToWorld();
  const balIdsAfter = (sandbox.labWorld.balance.L || []).concat(sandbox.labWorld.balance.R || []);
  check('lab balance sync is a no-op when values are unchanged (piece ids kept)',
    balIdsBefore.length === 2 && balIdsAfter.length === 2 &&
    balIdsBefore.every(function (id, i) { return id === balIdsAfter[i]; }));
  // 修 3b：世界右盘有 1/6，旧数组还是空（stale）→ 同步后旧数组要有 1/6，世界不动。
  if (typeof sandbox.labWbSyncFromWorld === 'function') {
    const wSync = sandbox.MathWorld.create({ balance: { L: [{ n: 1, d: 2 }], R: [{ n: 1, d: 6 }] } });
    sandbox.labWorld = wSync; sandbox.mwPlay = wSync;
    sandbox.labWbL = [{ kind: 'frac', n: 1, d: 2 }]; sandbox.labWbR = [];
    sandbox.labWbLastBal = null;
    sandbox.labWbSyncFromWorld();
    check('lab combo follows the world (stale right pan refreshed from world, world unchanged)',
      sandbox.labWbR.length === 1 && sandbox.labWbR[0].n === 1 && sandbox.labWbR[0].d === 6 &&
      sandbox.labWorld.balance.R.length === 1);
  } else {
    check('lab combo follows the world (stale right pan refreshed from world, world unchanged)', false);
  }
  // 收尾：恢复空盘，别影响后面的 lab2 天平检查。
  sandbox.labWbL = []; sandbox.labWbR = [];
  sandbox.labSyncBalanceToWorld();
  sandbox.labWbLastBal = null;
}
// 2026-11-07 复测修：学生界面不出现任何 goalMet/函数名/调试字样。
if (typeof sandbox.worldPlayRender === 'function') {
  sandbox.worldPlayRender();
  const studentTexts = ['worldBalMsg', 'worldFnMsg', 'worldDiceMsg', 'worldRectMsg', 'worldCkMsg', 'worldFracOut']
    .map(function (id) { return byId[id] ? (byId[id].textContent || '') : ''; }).join('\n');
  check('lab student UI shows no goalMet/debug strings',
    studentTexts.indexOf('goalMet') === -1 && studentTexts.indexOf('tilt=') === -1);
  check('lab student UI: balance message is plain words',
    byId.worldBalMsg.textContent.indexOf('平了') >= 0 || byId.worldBalMsg.textContent.indexOf('还不平') >= 0);
}
// 2026-11-07 复测修：台面清空 / 大器材拿下台面后，检查器回到“台面现状”，不留孤儿面板。
if (typeof sandbox.worldInspectSelect === 'function' && typeof sandbox.benchRun === 'function') {
  // 选中长方形检查器，再把它拿下台面 → 选择要清掉（旧代码：守卫缺失，选择留在那）。
  sandbox.benchRun({ type: 'benchRectToggle' });
  sandbox.worldInspectSelect({ apparatus: 'rect' });
  check('lab inspector opens for rect on bench', !!sandbox.worldInspectSel);
  sandbox.benchRun({ type: 'benchRectToggle' });
  sandbox.worldPlayRender();
  check('lab inspector closes when rect is taken off the bench', !sandbox.worldInspectSel);
  // 选中长方形检查器，点“全部拿走”（data-bench="clear"）→ 选择要清掉（旧代码：clear 分支不关检查器）。
  sandbox.benchRun({ type: 'benchRectToggle' });
  sandbox.worldInspectSelect({ apparatus: 'rect' });
  const clearBtn = makeEl('button');
  clearBtn.dataset.bench = 'clear';
  clearBtn.setAttribute('data-bench', 'clear');
  const benchCardHandlers = byId.worldBenchCard._handlers && byId.worldBenchCard._handlers.click;
  if (benchCardHandlers) benchCardHandlers.forEach(function (fn) { fn({ target: clearBtn }); });
  check('lab inspector closes on clear-all (bench emptied, inspector back to bench status)', !sandbox.worldInspectSel);
  sandbox.benchRun({ type: 'benchRectToggle' }); // 收尾：把长方形拿下台面，恢复默认状态
}
// 2026-11-07 复测修（第 3 批）：刷新后长方形 ⟳ 手柄点不动、站里砝码拖 8 次都放不进虚线区、
// 点画布上的数检查器不出来。下面每条在改前代码上干净失败。
// 1. 手柄：走卡片上的委托（和所有台面按钮同一条路），不再依赖 SVG 上一次性的 IIFE 绑定。
if (typeof sandbox.worldBenchRender === 'function' && typeof sandbox.benchRun === 'function') {
  const wRot = sandbox.MathWorld.create({ rect: { perim: 20, w: 4 } });
  sandbox.labWorld = wRot; sandbox.mwPlay = wRot;
  sandbox.benchRun({ type: 'benchRectToggle' });
  sandbox.worldInspectSelect({ apparatus: 'rect' });
  sandbox.labWorldSave();
  delete lsData['math-bench-v1']; // 台面是空的，别让旧的台面保存混进来
  // 模拟刷新：世界变量清掉、走加载路径恢复，长方形 4×6 还在。
  sandbox.labWorld = null; sandbox.mwPlay = null;
  sandbox.labSeedWorld(null);
  check('lab rect survives refresh before handle test (4x6 restored)',
    !!sandbox.labWorld && sandbox.labWorld.rect.w === 4 && sandbox.labWorld.benchRect);
  const handle = makeEl('g');
  handle.dataset.benchRotate = 'rect';
  handle.setAttribute('data-bench-rotate', 'rect');
  const cardHandlers = byId.worldBenchCard._handlers && byId.worldBenchCard._handlers.click;
  if (cardHandlers) cardHandlers.forEach(function (fn) {
    fn({ target: handle, stopPropagation: function () {}, preventDefault: function () {} });
  });
  check('lab rect handle rotates via card delegation after refresh (4x6 -> 6x4)',
    !!sandbox.labWorld && sandbox.labWorld.rect.w === 6);
  sandbox.worldInspectSelect(null);
  sandbox.labRestoredFlag = false; // 恢复标志只保护一次，别带到后面的进题测试里
  sandbox.benchRun({ type: 'benchRectToggle' }); // 收尾：长方形拿下台面
}
// 2. 站里拖放：合成输入的 pointerup 可能带错 pointerId、甚至坐标是 (0,0)，
//    这两种情况都不能直接丢弃；上一次拖放卡住也不能挡住下一次。
if (sandbox.Apparatus && byId.labMwWorkbench._handlers) {
  const wBal = sandbox.MathWorld.create({});
  sandbox.labWorld = wBal; sandbox.mwPlay = wBal;
  const dropL = makeEl('div');
  dropL.dataset.drop = 'balance.L';
  dropL.setAttribute('data-drop', 'balance.L');
  dropL.getBoundingClientRect = function () {
    return { left: 100, top: 200, right: 300, bottom: 260, width: 200, height: 60 };
  };
  function fakePtrEvt(target, x, y, pid) {
    return { target: target, clientX: x, clientY: y, pointerId: pid,
      stopPropagation: function () {}, preventDefault: function () {} };
  }
  function appDrag(chip, moves, up) {
    const h = byId.labMwWorkbench._handlers;
    (h.pointerdown || []).forEach(function (fn) { fn(fakePtrEvt(chip, moves[0][0], moves[0][1], moves[0][2])); });
    moves.slice(1).forEach(function (m) {
      (h.pointermove || []).forEach(function (fn) { fn(fakePtrEvt(chip, m[0], m[1], m[2])); });
    });
    (h.pointerup || []).forEach(function (fn) { fn(fakePtrEvt(chip, up[0], up[1], up[2])); });
  }
  function balChip(qty, label) {
    const c = makeEl('button');
    c.setAttribute('data-drag-chip', 'weight');
    c.setAttribute('data-qty', qty);
    c.textContent = label;
    return c;
  }
  // 2a：按下/移动是 pointerId 5，松手是 pointerId 7——旧代码直接 return，1 落不进左盘。
  appDrag(balChip('1', '1'), [[150, 150, 5], [200, 230, 5]], [200, 230, 7]);
  check('lab station drag lands when pointerup carries a different pointerId (1 -> left pan)',
    sandbox.labWorld.balance.L.length === 1);
  // 2b：松手坐标是 (0,0)——旧代码 hitAt(0,0) 找不到落点；新代码用最后一次 move 的位置。
  appDrag(balChip('1/2', '1/2'), [[150, 150, 5], [200, 230, 5]], [0, 0, 5]);
  check('lab station drag lands when pointerup reports (0,0) (1/2 -> left pan via last move)',
    sandbox.labWorld.balance.L.length === 2);
  // 2c：上一次拖放没收到 pointerup、drag 卡住了——新按下要先清掉旧的，再拖新的。
  //    旧代码：新按下被挡，松手时掉的是卡住的那个 1/3（总数 11/6）；新代码掉 1/4（总数 7/4）。
  const h2 = byId.labMwWorkbench._handlers;
  (h2.pointerdown || []).forEach(function (fn) { fn(fakePtrEvt(balChip('1/3', '1/3'), 150, 150, 5)); });
  appDrag(balChip('1/4', '1/4'), [[150, 150, 5], [200, 230, 5]], [200, 230, 5]);
  check('lab station drag recovers after a stuck drag (left total 7/4, not 11/6)',
    sandbox.MathWorld.derived(sandbox.labWorld).balance.Lstr === '7/4');
  // 收尾：天平清掉、落点元素移出注册表，别影响后面的测试。
  sandbox.labWorld = sandbox.MathWorld.apply(sandbox.labWorld, { type: 'balanceClear' }).world;
  sandbox.mwPlay = sandbox.labWorld;
  const dropIdx = registry.indexOf(dropL);
  if (dropIdx >= 0) registry.splice(dropIdx, 1);
}
// 3. 画布上的数能点：benchViewSvg 画出的卡片/圆点带 data-bench="pick"；
//    盘上合计数字带 data-bench="pick-pan"，点它看盘上最后那件砝码。
if (typeof sandbox.benchViewSvg === 'function' && typeof sandbox.worldBenchRender === 'function') {
  const wPick = sandbox.MathWorld.create({});
  sandbox.labWorld = wPick; sandbox.mwPlay = wPick;
  const mk5 = sandbox.benchRun({ type: 'makePiece', piece: { kind: 'num', v: 5 } });
  if (mk5) sandbox.benchRun({ type: 'benchPut', pieceId: mk5.pieceId });
  const bvItems = sandbox.MathWorld.derived(sandbox.labWorld).bench.items;
  const balSvg = sandbox.benchViewSvg('balance', bvItems, false, { k: 0, b: 0 },
    sandbox.MathWorld.derived(sandbox.labWorld).balance, null, false, null);
  check('lab bench canvas cards carry pick (canvas number is clickable)',
    balSvg.indexOf('data-bench="pick"') >= 0 && balSvg.indexOf('data-id="' + bvItems[0].id + '"') >= 0);
  const coordSvg = sandbox.benchViewSvg('coord', bvItems, false, { k: 0, b: 0 }, null, null, false, null);
  check('lab coord view dots carry pick', coordSvg.indexOf('data-bench="pick"') >= 0);
  // 点画布上的卡片（假 <g>，带 data-bench="pick"）→ 检查器要出“数字卡· 5”。
  const cardG = makeEl('g');
  cardG.dataset.bench = 'pick';
  cardG.setAttribute('data-bench', 'pick');
  cardG.setAttribute('data-id', bvItems[0].id);
  const cardHandlers3 = byId.worldBenchCard._handlers && byId.worldBenchCard._handlers.click;
  if (cardHandlers3) cardHandlers3.forEach(function (fn) {
    fn({ target: cardG, stopPropagation: function () {}, preventDefault: function () {} });
  });
  check('lab inspector opens for canvas number card (数字卡· 5)',
    String(byId.worldBenchInspector.innerHTML).indexOf('数字卡') >= 0);
  // 盘上合计：左盘放 1/2，点左盘合计 → 检查器出那件 1/2 的属性（分数条· 1/2）。
  sandbox.benchRun({ type: 'benchBalanceToggle' });
  const addL = sandbox.MathWorld.apply(sandbox.labWorld, { type: 'balanceAddQty', side: 'L', qty: { n: 1, d: 2 } });
  sandbox.labWorld = addL.world; sandbox.mwPlay = addL.world;
  const panTx = makeEl('text');
  panTx.dataset.bench = 'pick-pan';
  panTx.setAttribute('data-bench', 'pick-pan');
  panTx.setAttribute('data-side', 'L');
  if (cardHandlers3) cardHandlers3.forEach(function (fn) {
    fn({ target: panTx, stopPropagation: function () {}, preventDefault: function () {} });
  });
  check('lab inspector opens for pan total (分数条· 1/2 on left pan)',
    String(byId.worldBenchInspector.innerHTML).indexOf('分数条') >= 0 &&
    String(byId.worldBenchInspector.innerHTML).indexOf('1/2') >= 0);
  // 收尾：把“5”拿下台面（benchSave 会把空台面存回去，别让后面的进题测试
  // 在 benchRestore 里又捡回来）、天平清掉并拿下台面、检查器关掉、世界恢复成空的。
  sandbox.worldInspectSelect(null);
  if (mk5) sandbox.benchRun({ type: 'benchTake', pieceId: mk5.pieceId });
  sandbox.labWorld = sandbox.MathWorld.apply(sandbox.labWorld, { type: 'balanceClear' }).world;
  sandbox.mwPlay = sandbox.labWorld;
  sandbox.benchRun({ type: 'benchBalanceToggle' });
  sandbox.labWorld = sandbox.MathWorld.create({});
  sandbox.mwPlay = sandbox.labWorld;
  sandbox.labRestoredFlag = false;
  delete lsData['math-bench-v1'];
}
// 2026-11-07 复测修（第 4 批）：第 3 批后拖放全断、手柄刷新后消失、手柄盖标签、
// “全部拿走”后天平还画着、长方形拿下台面后还画着、组合台不保存。
// 下面每条在改前代码上干净失败。特别注意第 1 条：桩的 vm 上下文里严格模式
// 未声明赋值不抛错（悄悄创一个全局），所以“器材站拖放能跑”在桩里永远是通的；
// 真机 Chrome 里 bind() 直接抛 ReferenceError，整个器材站绑定没装上，
// 站拖放、清空重来、以及 worldPlayBind 之后的 8 个模拟 tier 绑定全死。
// 所以第 1 条判据有两条：源码里 onIntent 必须声明；加载后它不能漏成全局。
if (typeof sandbox.Apparatus !== 'undefined') {
  check('lab apparatus declares its intent callback (var onIntent) — batch 2 deleted it, bind threw in real browsers',
    /var\s+onIntent\s*=/.test(apparatusSrc));
  check('lab apparatus bind does not leak an implicit global onIntent (strict-mode ReferenceError in real browsers)',
    typeof sandbox.onIntent === 'undefined');
}
// 2. 长方形本体能点（pick-rect）+ 手柄/标签不重叠：直接验 benchViewSvg 画出来的串，
// 再走一次台面点击委托（点本体 → 选中长方形、检查器打开、重画出手柄）。
if (typeof sandbox.benchViewSvg === 'function' && typeof sandbox.worldBenchRender === 'function') {
  const rectSvg4 = sandbox.benchViewSvg('coord', [], false, { k: 0, b: 0 }, null, { w: 4, h: 6, area: 24 }, true, null);
  check('lab coord rect body is clickable after refresh (pick-rect group wraps the shape)',
    rectSvg4.indexOf('data-bench="pick-rect"') >= 0);
  // 手柄透明圆 vs (w,h) 标签：手柄左缘要在标签右缘之外（x 轴上分开，与 y 无关）。
  // 旧值：手柄 (bvX+16, bvY-16) r=20，标签 anchor=middle 在 (bvX, bvY-8)——
  // 手柄左缘 bvX-4，标签右缘约 bvX+18，重叠；新值：手柄 (bvX+28, bvY-28) r=16，
  // 标签 anchor=end、右缘 bvX-6——手柄左缘 bvX+12，分开。
  const handleM4 = rectSvg4.match(/data-bench-rotate="rect"[^>]*><circle cx="([\d.]+)" cy="([\d.]+)" r="(\d+)"/);
  const labelM4 = rectSvg4.match(/<text x="([\d.]+)" y="([\d.]+)"[^>]*text-anchor="(middle|end)"[^>]*>\((\d+),(\d+)\)<\/text>/);
  let noOverlap4 = false;
  if (handleM4 && labelM4) {
    const handleLeft4 = parseFloat(handleM4[1]) - parseFloat(handleM4[3]);
    const labelRight4 = labelM4[3] === 'end' ? parseFloat(labelM4[1]) : parseFloat(labelM4[1]) + 18;
    noOverlap4 = handleLeft4 > labelRight4;
  }
  check('lab rect handle does not cover the (w,h) label (handle left edge past label right edge)',
    !!handleM4 && !!labelM4 && noOverlap4);
  // 顶点圆点命中区：可见 r=4，下垫透明 r>=10 命中圆（复测 4489f21 第 4 项：
  // 圆点只有约 8px，点偏几像素就落到空白网格上、检查器不动；数轴圆点/手柄
  // 早就是透明大圆垫着）。命中圆必须和可见圆同心，且是真能接事件的画法
  // （rgba 0.001，不是 fill="none"）。
  const vtxM4 = rectSvg4.match(/<circle cx="([\d.]+)" cy="([\d.]+)" r="4" fill="#92400e"\/>/);
  const vtxHits4 = [...rectSvg4.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="(\d+)" fill="rgba\(255,255,255,0\.001\)"\/>/g)];
  let vtxHitOk4 = false;
  if (vtxM4) {
    vtxHitOk4 = vtxHits4.some(function (m) {
      return m[1] === vtxM4[1] && m[2] === vtxM4[2] && parseFloat(m[3]) >= 10;
    });
  }
  check('lab rect vertex dot has a transparent hit circle (r>=10) at the same center',
    !!vtxM4 && vtxHitOk4);
  // 点顶点圆点（圆点本身，closest 上走到 pick-rect 组）→ 检查器从数字卡切回长方形。
  // 复测 4489f21 第 4 项的确切顺序：先点 5 圆点（检查器停在数字卡·5），再点顶点圆点。
  const wVtx4 = sandbox.MathWorld.create({ rect: { perim: 20, w: 4 } });
  sandbox.labWorld = wVtx4; sandbox.mwPlay = wVtx4;
  sandbox.benchRun({ type: 'benchRectToggle' });
  const mk5v4 = sandbox.benchRun({ type: 'makePiece', piece: { kind: 'num', v: 5 } });
  if (mk5v4) sandbox.benchRun({ type: 'benchPut', pieceId: mk5v4.pieceId });
  if (mk5v4) sandbox.worldInspectSelect({ piece: mk5v4.pieceId });
  const beforeVtx4 = String(byId.worldBenchInspector.innerHTML).indexOf('数字卡') >= 0;
  const rectG4b = makeEl('g');
  rectG4b.dataset.bench = 'pick-rect';
  rectG4b.setAttribute('data-bench', 'pick-rect');
  const vtxDot4 = makeEl('circle');
  vtxDot4.closest = (sel) => sel === '[data-bench]' ? rectG4b : null;
  const cardHandlersVtx4 = byId.worldBenchCard._handlers && byId.worldBenchCard._handlers.click;
  if (cardHandlersVtx4) cardHandlersVtx4.forEach(function (fn) {
    fn({ target: vtxDot4, stopPropagation: function () {}, preventDefault: function () {} });
  });
  check('lab rect vertex dot click switches inspector from the number card back to the rect',
    beforeVtx4 && !!sandbox.worldInspectSel && sandbox.worldInspectSel.apparatus === 'rect' &&
    String(byId.worldBenchInspector.innerHTML).indexOf('长方形') >= 0);
  sandbox.worldInspectSelect(null);
  sandbox.benchRun({ type: 'benchRectToggle' }); // 收尾：长方形拿下台面
  // 点长方形本体（假 <g data-bench="pick-rect">）→ 选中长方形、检查器打开、重画出手柄。
  // 旧代码：本体没有 pick，点什么都没发生，检查器一直空着。
  const wRect4 = sandbox.MathWorld.create({ rect: { perim: 20, w: 4 } });
  sandbox.labWorld = wRect4; sandbox.mwPlay = wRect4;
  sandbox.benchRun({ type: 'benchRectToggle' });
  sandbox.worldInspectSelect(null);
  const rectG4 = makeEl('g');
  rectG4.dataset.bench = 'pick-rect';
  rectG4.setAttribute('data-bench', 'pick-rect');
  const cardHandlers4 = byId.worldBenchCard._handlers && byId.worldBenchCard._handlers.click;
  if (cardHandlers4) cardHandlers4.forEach(function (fn) {
    fn({ target: rectG4, stopPropagation: function () {}, preventDefault: function () {} });
  });
  check('lab coord rect body selects rect on click (inspector opens, handle drawn)',
    !!sandbox.worldInspectSel && sandbox.worldInspectSel.apparatus === 'rect' &&
    String(byId.worldBenchInspector.innerHTML).indexOf('长方形') >= 0 &&
    String(byId.worldBenchView.innerHTML).indexOf('data-bench-rotate') >= 0);
  sandbox.worldInspectSelect(null);
  sandbox.benchRun({ type: 'benchRectToggle' }); // 收尾：长方形拿下台面
}
// 4a. “全部拿走”：散数 + 天平/长方形/直线都下台（旧代码：只拿散数，天平砝码还画着，
//    按钮却说“台面清空了”）。站里的天平砝码不动——拿下台面不是删除。
if (typeof sandbox.labClearBench === 'function' && typeof sandbox.benchRun === 'function') {
  const wClear4 = sandbox.MathWorld.create({
    rect: { perim: 20, w: 4 }, balance: { L: [{ n: 1, d: 2 }], R: [] },
  });
  sandbox.labWorld = wClear4; sandbox.mwPlay = wClear4;
  sandbox.benchRun({ type: 'benchBalanceToggle' });
  sandbox.benchRun({ type: 'benchRectToggle' });
  sandbox.benchRun({ type: 'benchLineToggle' });
  const mkC4 = sandbox.benchRun({ type: 'makePiece', piece: { kind: 'num', v: 2 } });
  if (mkC4) sandbox.benchRun({ type: 'benchPut', pieceId: mkC4.pieceId });
  const clearBtn4 = makeEl('button');
  clearBtn4.dataset.bench = 'clear';
  clearBtn4.setAttribute('data-bench', 'clear');
  const cardHandlers4b = byId.worldBenchCard._handlers && byId.worldBenchCard._handlers.click;
  if (cardHandlers4b) cardHandlers4b.forEach(function (fn) {
    fn({ target: clearBtn4, stopPropagation: function () {}, preventDefault: function () {} });
  });
  check('lab clear-all takes apparatus off the bench too (balance/rect/line off, bench empty)',
    !!sandbox.labWorld && !sandbox.labWorld.benchBalance && !sandbox.labWorld.benchRect && !sandbox.labWorld.benchLine &&
    sandbox.MathWorld.derived(sandbox.labWorld).bench.count === 0);
  check('lab clear-all keeps the station balance weights (off the bench is not delete)',
    !!sandbox.labWorld && sandbox.labWorld.balance.L.length === 1);
  sandbox.labWorld = sandbox.MathWorld.create({});
  sandbox.mwPlay = sandbox.labWorld;
  sandbox.worldInspectSelect(null);
}
// 4b. 长方形拿下台面后，坐标系里不能再画它（旧代码：调用处传无条件的 derived.rect；
//    直线在台上时视图留在坐标系，金色长方形就一直画着）。
if (typeof sandbox.worldBenchRender === 'function' && typeof sandbox.benchRun === 'function') {
  const wRb4 = sandbox.MathWorld.create({ rect: { perim: 20, w: 4 } });
  sandbox.labWorld = wRb4; sandbox.mwPlay = wRb4;
  sandbox.benchRun({ type: 'benchRectToggle' });
  sandbox.benchRun({ type: 'benchLineToggle' }); // 直线在台上，视图留在坐标系
  sandbox.worldBenchRender();
  const drawnOn4 = String(byId.worldBenchView.innerHTML).indexOf('#fde68a') >= 0;
  sandbox.benchRun({ type: 'benchRectToggle' }); // 长方形拿下台面
  sandbox.worldBenchRender();
  const drawnOff4 = String(byId.worldBenchView.innerHTML).indexOf('#fde68a') >= 0;
  check('lab rect drawn while on the bench, gone after taking it off (line keeps coord view)',
    drawnOn4 && !drawnOff4);
  sandbox.benchRun({ type: 'benchLineToggle' }); // 收尾：直线也拿下
  sandbox.labWorld = sandbox.MathWorld.create({});
  sandbox.mwPlay = sandbox.labWorld;
  sandbox.worldInspectSelect(null);
}
// 4d. 组合台改完要进自动保存（旧代码：labWbRender 只同步不保存，刷新后左盘归零）。
if (typeof sandbox.labWbRender === 'function' && typeof sandbox.labWorldSave === 'function') {
  const wCombo4 = sandbox.MathWorld.create({ balance: { L: [], R: [] } });
  sandbox.labWorld = wCombo4; sandbox.mwPlay = wCombo4;
  sandbox.labWorldSave(); // 基线：空盘已保存
  sandbox.labWbL = [{ kind: 'num', v: 1 }]; sandbox.labWbR = [];
  sandbox.labWbRender();
  const savedCombo4 = JSON.parse(lsData['math-lab-world-v1'] || 'null');
  check('lab combo bench persists across reload (left pan 1 saved, not lost on refresh)',
    !!savedCombo4 && savedCombo4.balance && savedCombo4.balance.L.length === 1 &&
    sandbox.MathWorld.derived(savedCombo4).balance.Lstr === '1');
  // 收尾：盘子清掉并存回，别影响后面的检查。
  sandbox.labWbL = []; sandbox.labWbR = [];
  sandbox.labWbRender();
  sandbox.labWorld = sandbox.MathWorld.create({});
  sandbox.mwPlay = sandbox.labWorld;
}
// 2026-11-07 复测修：问题计数按卡片自己的按钮配题，不按位置配对；计数以可见卡片为准。
// 旧代码位置配对：卡片顺序一错位就藏错卡、计数撒谎（14 张卡写 13）。下面用打乱的卡片 + 领域筛选验：
// 3 张卡按 maxarea / fracadd / balfrac 的顺序放，筛“数与代数”应留 fracadd、balfrac，藏 maxarea；
// 旧代码按位置配 LAB_QUESTIONS[0..2]（thirteen / twentyfour / monty），会留 maxarea、藏 balfrac。
if (typeof sandbox.labFilterQuestions === 'function') {
  const labQBox = documentStub.getElementById('labQuestions');
  function seedLabQCard(suffix) {
    const card = makeEl('div');
    card.className = 'lab-q';
    card.parentNode = labQBox;
    const btn = makeEl('button');
    btn.id = 'labQ-' + suffix;
    card.querySelector = function (sel) { return sel.indexOf('labQ-') >= 0 ? btn : null; };
    return card;
  }
  const cardMax = seedLabQCard('maxarea');
  const cardFrac = seedLabQCard('fracadd');
  const cardBal = seedLabQCard('balfrac');
  byId.labQSearch.value = '';
  byId.labQGrade.value = 'all';
  sandbox.labQDomain = '数与代数';
  sandbox.labFilterQuestions();
  check('lab question filter pairs cards by their own button, not by position',
    cardMax.style.display === 'none' && cardFrac.style.display !== 'none' && cardBal.style.display !== 'none');
  check('lab question count counts visible cards',
    byId.labQCount.textContent === '找到 2 个问题');
  sandbox.labQDomain = 'all';
  sandbox.labFilterQuestions();
  check('lab question filter clears count when all cards are visible',
    byId.labQCount.textContent === '');
  [cardMax, cardFrac, cardBal].forEach(function (c) {
    const i = registry.indexOf(c);
    if (i >= 0) registry.splice(i, 1);
  });
}
// 2026-11-07 复测修：台面卡片在 DOM 里就是工作间第一张，不靠 order:-1 视觉置顶。
check('lab HTML: bench card is first in DOM inside the workbench stations',
  htmlText.indexOf('id="worldBenchCard"') < htmlText.indexOf('id="worldFracCard"'));
check('lab CSS: no order:-1 visual-first hack for the bench card',
  !cssText.includes('#worldBenchCard { order: -1; }'));
// v0.9 addendum (NB 走访 §2)：设置卡——作为默认 / 恢复初始值，存在本地
if (typeof sandbox.labDefaultsSave === 'function') {
  sandbox.labDefaultsSave({ linefn: { k: 3, b: 5 } });
  check('lab defaults round-trip through localStorage',
    JSON.parse(lsData['math-lab-defaults-v1'] || '{}').linefn.k === 3 &&
    sandbox.labDefaultsLoad().linefn.b === 5);
  sandbox.labDefaultsSave({});
}
// v0.9 addendum (NB 走访 §4)：台面上的直线是“通电的”，画出来会流动
check('bench line draws with a flow animation when it is live on the bench',
  sandbox.benchViewSvg('coord', [], true, { k: 2, b: 8 }, null, null).includes('bench-flow'));
check('lab HTML hosts MathWorld workbench',
  htmlText.includes('id="labMwWorkbench"') && htmlText.includes('data-world="fa-add"') &&
  htmlText.includes('id="worldFnCard"') && !htmlText.includes('id="world" class="section'));
check('lab HTML hosts SVG apparatus mounts',
  htmlText.includes('id="worldFracSvg"') && htmlText.includes('id="worldBalSvg"') &&
  htmlText.includes('id="worldCkSvg"') && htmlText.includes('id="worldLineSvg"') &&
  htmlText.includes('id="worldFnSvg"') && htmlText.includes('apparatus.js'));
if (typeof sandbox.worldPlayRender === 'function') sandbox.worldPlayRender();
check('lab HTML hosts procedure panel and fraction-mint button',
  htmlText.includes('id="worldProcOut"') && htmlText.includes('data-world="fa-mint"'));
check('lab HTML hosts the dice card with the sum buttons container',
  htmlText.includes('id="worldDiceCard"') && htmlText.includes('id="worldDiceBtns"'));
check('lab HTML: question chooser is inside the bench, above every instrument',
  htmlText.indexOf('id="labMwWorkbench"') < htmlText.indexOf('class="bench-choose"') &&
  htmlText.indexOf('class="bench-choose"') < htmlText.indexOf('id="labQuestions"') &&
  htmlText.indexOf('id="labQuestions"') < htmlText.indexOf('id="worldFracCard"'));
check('lab HTML: bench pieces can be dropped on the balance pans and the number line',
  htmlText.includes('data-drop="balance.L"') && htmlText.includes('data-drop="balance.R"') &&
  htmlText.includes('data-drop="numline"'));
check('lab HTML hosts the rectangle card with width buttons',
  htmlText.includes('id="worldRectCard"') && htmlText.includes('data-world="rect-w+"') &&
  htmlText.includes('data-world="rect-w-"'));
check('lab HTML hosts the two-point line control and the bench trash zone',
  htmlText.includes('data-world="fn-2pt"') && htmlText.includes('id="worldFnX1"') &&
  htmlText.includes('id="worldBenchTrash"'));
check('lab HTML hosts the bench card with shelf, merge, split, and clear',
  htmlText.includes('id="worldBenchCard"') && htmlText.includes('id="worldBenchShelf"') &&
  htmlText.includes('data-bench="merge"') && htmlText.includes('data-bench="split"') &&
  htmlText.includes('data-bench="clear"'));
check('Apparatus paints fraction SVG children',
  !!sandbox.Apparatus && byId.worldFracSvg.children.length > 0);
check('Apparatus paints balance + linefn SVG',
  byId.worldBalSvg.children.length > 0 && byId.worldFnSvg.children.length > 0);
navGo('home');
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
  byId.progressCard.innerHTML.includes('动画') && byId.progressCard.innerHTML.includes('已练'));
check('progress: 32 of 145 demos tried by now', byId.progressCount.textContent === '32 / ' + TOTAL_DEMOS);
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
check('G3 demos count toward the ' + TOTAL_DEMOS + '-demo progress', g3ProgBefore === '32 / ' + TOTAL_DEMOS && byId.progressCount.textContent === '33 / ' + TOTAL_DEMOS);

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
check('G3: all 14 new demos tried by now', byId.progressCount.textContent === '46 / ' + TOTAL_DEMOS);


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
check('G4 demos count toward the ' + TOTAL_DEMOS + '-demo progress', g4ProgBefore === '46 / ' + TOTAL_DEMOS && byId.progressCount.textContent === '47 / ' + TOTAL_DEMOS);

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
check('G4: all 16 new demos tried by now', byId.progressCount.textContent === '62 / ' + TOTAL_DEMOS);


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
check('G5 demos count toward the ' + TOTAL_DEMOS + '-demo progress', g5ProgBefore === '62 / ' + TOTAL_DEMOS && byId.progressCount.textContent === '63 / ' + TOTAL_DEMOS);

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
check('G5: all 11 new demos tried by now', byId.progressCount.textContent === '73 / ' + TOTAL_DEMOS);


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
check('G6 demos count toward the ' + TOTAL_DEMOS + '-demo progress', g6ProgBefore === '73 / ' + TOTAL_DEMOS && byId.progressCount.textContent === '74 / ' + TOTAL_DEMOS);

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
check('G6: all 12 new demos tried by now', byId.progressCount.textContent === '85 / ' + TOTAL_DEMOS);

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
check('G7 demos count toward the ' + TOTAL_DEMOS + '-demo progress', g7ProgBefore === '85 / ' + TOTAL_DEMOS && byId.progressCount.textContent === '86 / ' + TOTAL_DEMOS);

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
check('G7: all 13 new demos tried by now', byId.progressCount.textContent === '98 / ' + TOTAL_DEMOS);


// ---------- 8. 八年级实验（11 个新演示，146 个动画（当时）） ----------
check('G8 start: progress is 98 / ' + TOTAL_DEMOS + ' before any G8 demo is tried', byId.progressCount.textContent === '98 / ' + TOTAL_DEMOS);

navGo('demo-trisides');
check('trisides renders: 3-4-5 closes, angles sum to 180°',
  byId.tsRead.textContent.includes('能围成三角形') && byId.tsRead.textContent.includes('180°'));
click(byId.tsCPlus); click(byId.tsCPlus); // c=7
check('trisides: c=7 fails (3+4=7, not > 7)',
  byId.tsRead.textContent.includes('围不起来') && byId.tsRead.textContent.includes('3+4=7'));
click(byId.tsModeSeg.children[1]); // 多边形内角和
check('trisides polygon: pentagon interior sum 540°', byId.tsRead.textContent.includes('540°'));
click(byId.tsNPlus); // 6 边形
check('trisides polygon: hexagon interior sum 720°', byId.tsRead.textContent.includes('720°'));
check('G8: trisides counts toward the ' + TOTAL_DEMOS + '-demo progress', byId.progressCount.textContent === '99 / ' + TOTAL_DEMOS);

navGo('demo-congruent');
check('congruent renders: SSS 5-6-7 always congruent',
  byId.cgRead.textContent.includes('5、6、7') && byId.cgRead.textContent.includes('（SSS）'));
click(byId.cgCondSeg.children[4]); // HL
check('congruent HL: the other leg is forced to 4',
  byId.cgRead.textContent.includes('只能是 4') && byId.cgRead.textContent.includes('（HL）'));
click(byId.cgCondSeg.children[5]); // SSA
check('congruent SSA: shape one looks congruent at first', byId.cgRead.textContent.includes('形状一'));
click(byId.cgSsaSeg.children[1]); // 形状二
check('congruent SSA: shape two shows SSA cannot prove congruence',
  byId.cgRead.textContent.includes('SSA 不能判定全等'));
click(byId.cgCondSeg.children[6]); // AAA
check('congruent AAA: same shape, size can differ', byId.cgRead.textContent.includes('AAA 不能判定全等'));
click(byId.cgScalePlus); // ×2
check('congruent AAA: scale ×2 shown', byId.cgRead.textContent.includes('×2'));
check('G8: congruent counts toward the ' + TOTAL_DEMOS + '-demo progress', byId.progressCount.textContent === '100 / ' + TOTAL_DEMOS);

navGo('demo-foldmirror');
check('foldmirror renders: isosceles triangle fold prompt',
  byId.fmRead.textContent.includes('等腰三角形'));
click(byId.fmFoldBtn);
check('foldmirror fold: isosceles folds exactly',
  byId.fmRead.textContent.includes('对折后完全重合'));
click(byId.fmShapeSeg.children[1]); // 直角三角形
check('foldmirror fold: right triangle prompt', byId.fmRead.textContent.includes('直角三角形'));
click(byId.fmFoldBtn);
check('foldmirror fold: right triangle does not fold onto itself',
  byId.fmRead.textContent.includes('重合不了'));
click(byId.fmModeSeg.children[1]); // 坐标对称点
check('foldmirror coord: (2,-3) mirrors to (2,3) over the x-axis',
  byId.fmRead.textContent.includes('关于x 轴的对称点是 (2,3)'));
click(byId.fmSymSeg.children[1]); // 关于 y 轴
check('foldmirror coord: (2,-3) mirrors to (-2,-3) over the y-axis',
  byId.fmRead.textContent.includes('关于y 轴的对称点是 (-2,-3)'));
click(byId.fmModeSeg.children[2]); // 等腰三角形对折
check('foldmirror isosceles: base 70°, top 40°',
  byId.fmRead.textContent.includes('底角是 70°') && byId.fmRead.textContent.includes('顶角是 40°'));
click(byId.fmIsoFoldBtn);
check('foldmirror isosceles fold: the three lines coincide',
  byId.fmRead.textContent.includes('三线合一'));
check('G8: foldmirror counts toward the ' + TOTAL_DEMOS + '-demo progress', byId.progressCount.textContent === '101 / ' + TOTAL_DEMOS);

navGo('demo-algarea');
check('algarea renders: a³·a² = a⁵, exponents add',
  byId.aaRead.textContent.includes('a5') && byId.aaRead.textContent.includes('3+2=5'));
click(byId.aaPowSeg.children[1]); // 幂的乘方
check('algarea power: (a³)² = a⁶, exponents multiply',
  byId.aaRead.textContent.includes('a6') && byId.aaRead.textContent.includes('3×2=6'));
click(byId.aaModeSeg.children[1]); // (x+a)(x+b)
check('algarea mul: (x+2)(x+3) = x²+5x+6',
  byId.aaRead.textContent.includes('(x+2)(x+3) = x²+5x+6'));
click(byId.aaMulAPlus); // a=3
check('algarea mul: a=3 gives (x+3)(x+3) = x²+6x+9',
  byId.aaRead.textContent.includes('(x+3)(x+3) = x²+6x+9'));
click(byId.aaModeSeg.children[2]); // 乘法公式
check('algarea formula: (5+2)² = 25+20+4 = 49',
  byId.aaRead.textContent.includes('(5+2)² = 25+20+4 = 49'));
click(byId.aaFormSeg.children[2]); // 平方差
check('algarea formula: (5+2)(5−2) = 25−4 = 21',
  byId.aaRead.textContent.includes('25−4 = 21'));
click(byId.aaModeSeg.children[3]); // 因式分解
check('algarea factor: 1×1 and 1+1 both miss for x²+5x+6',
  byId.aaRead.textContent.includes('相乘 1×1=1（要 6）') && byId.aaRead.textContent.includes('相加 1+1=2（要 5）'));
click(byId.aaF1Plus); click(byId.aaF2Plus); click(byId.aaF2Plus); // 2, 3
check('algarea factor: (2,3) solves x²+5x+6 = (x+2)(x+3)',
  byId.aaRead.textContent.includes('x²+5x+6 = (x+2)(x+3)'));
check('G8: algarea counts toward the ' + TOTAL_DEMOS + '-demo progress', byId.progressCount.textContent === '102 / ' + TOTAL_DEMOS);

navGo('demo-algfrac');
check('algfrac renders: 12a²b/4ab prompt with remaining factors',
  byId.afRead.textContent.includes('12a²b/4ab') && byId.afRead.textContent.includes('还剩分子 3·4·a·a·b'));
click(byId.afNumChips.children[1]); // 约掉 4
check('algfrac cancel: 4 cancels, numerator left 3·a·a·b',
  byId.afRead.textContent.includes('还剩分子 3·a·a·b'));
click(byId.afNumChips.children[2]); // 约掉一个 a
check('algfrac cancel: one a cancels, numerator left 3·a·b',
  byId.afRead.textContent.includes('还剩分子 3·a·b'));
click(byId.afNumChips.children[3]); // 第二个 a 没得配
check('algfrac cancel: the second a has no partner in the denominator',
  byId.afRead.textContent.includes('约不掉'));
click(byId.afNumChips.children[4]); // 约掉 b，约完
check('algfrac cancel: finished, 12a²b/4ab = 3a',
  byId.afRead.textContent.includes('约分完了') && byId.afRead.textContent.includes('= 3a'));
click(byId.afModeSeg.children[1]); // 分母为 0
check('algfrac zero: x=0, denominator x−2 = -2, fraction defined',
  byId.afRead.textContent.includes('分母 x−2 = -2') && byId.afRead.textContent.includes('有意义'));
click(byId.afXPlus); click(byId.afXPlus); // x=2
check('algfrac zero: x=2, denominator 0, fraction undefined',
  byId.afRead.textContent.includes('分母 x−2 = 0') && byId.afRead.textContent.includes('没有意义'));
check('G8: algfrac counts toward the ' + TOTAL_DEMOS + '-demo progress', byId.progressCount.textContent === '103 / ' + TOTAL_DEMOS);

navGo('demo-eqsieve');
check('eqsieve renders: 2/(x−3) = 1/(x+1)',
  byId.esEq.textContent.includes('2/(x−3) = 1/(x+1)'));
click(byId.esStep1);
check('eqsieve step 1: clearing denominators gives 2(x+1) = x−3',
  byId.esLine1.hidden === false && byId.esLine1.textContent.includes('2(x+1) = x−3'));
click(byId.esStep2);
check('eqsieve step 2: solution x = −5', byId.esLine2.textContent.includes('x = −5'));
click(byId.esStep3);
check('eqsieve step 3: x=−5 checks out (denominators −8 and −4)',
  byId.esLine3.textContent.includes('是原方程的解'));
click(byId.esProbSeg.children[1]); // 1/(x−1) = 2/(x²−1)
check('eqsieve problem 2: 1/(x−1) = 2/(x²−1)',
  byId.esEq.textContent.includes('1/(x−1) = 2/(x²−1)'));
click(byId.esStep3);
check('eqsieve problem 2: x=1 is extraneous, no solution',
  byId.esLine3.textContent.includes('增根') && byId.esLine3.textContent.includes('无解'));
check('G8: eqsieve counts toward the ' + TOTAL_DEMOS + '-demo progress', byId.progressCount.textContent === '104 / ' + TOTAL_DEMOS);

navGo('demo-radical');
check('radical renders: simplify √12, largest square factor prompt',
  byId.rxRead.textContent.includes('√12') && byId.rxRead.textContent.includes('最大的平方因数'));
click(byId.rxChipSeg.children[0]); // 4
check('radical: √12 = 2√3 with square factor 4',
  byId.rxRead.textContent.includes('√12 = √(4×3) = 2√3'));
click(byId.rxNumSeg.children[3]); // 72
click(byId.rxChipSeg.children[0]); // 4
check('radical: √72 with 4 still simplifies further to 6√2',
  byId.rxRead.textContent.includes('还没化简完') && byId.rxRead.textContent.includes('6√2'));
click(byId.rxModeSeg.children[1]); // 合并同类
check('radical combine: √8 + √2 = 3√2', byId.rxRead.textContent.includes('3√2'));
click(byId.rxPairSeg.children[3]); // √5, √3
check('radical combine: √5 and √3 cannot merge', byId.rxRead.textContent.includes('合不了'));
check('G8: radical counts toward the ' + TOTAL_DEMOS + '-demo progress', byId.progressCount.textContent === '105 / ' + TOTAL_DEMOS);

navGo('demo-pythag');
check('pythag renders: 3²+4² = 5² by areas',
  byId.pyRead.textContent.includes('3²+4²') && byId.pyRead.textContent.includes('= 5²'));
click(byId.pyTripleSeg.children[1]); // 5, 12, 13
check('pythag: 5-12-13 also works',
  byId.pyRead.textContent.includes('5²+12²') && byId.pyRead.textContent.includes('= 13²'));
click(byId.pyModeSeg.children[1]); // 是直角三角形吗
check('pythag check: 5-12-13 is a right triangle',
  byId.pyRead.textContent.includes('是直角三角形'));
click(byId.pyCheckSeg.children[1]); // 3, 4, 6
check('pythag check: 3-4-6 is not (25 ≠ 36)',
  byId.pyRead.textContent.includes('不是直角三角形') && byId.pyRead.textContent.includes('≠ 36'));
check('G8: pythag counts toward the ' + TOTAL_DEMOS + '-demo progress', byId.progressCount.textContent === '106 / ' + TOTAL_DEMOS);

navGo('demo-pargram');
check('pargram renders: AB = CD = 11, diagonals bisect each other',
  byId.pgmRead.textContent.includes('AB = CD = 11') && byId.pgmRead.textContent.includes('AO = OC'));
click(byId.pgmAngPlus); // 65°
check('pargram push: angle 65°, opposite angles still equal',
  byId.pgmRead.textContent.includes('∠A = ∠C = 65°'));
click(byId.pgmModeSeg.children[1]); // 判定
check('pargram judge: two pairs of equal opposite sides proves a parallelogram',
  byId.pgmRead.textContent.includes('能判定是平行四边形'));
click(byId.pgmJudgeSeg.children[3]); // 一组对边平行、另一组对边相等
check('pargram judge: that may be an isosceles trapezoid, not a parallelogram',
  byId.pgmRead.textContent.includes('等腰梯形') && byId.pgmRead.textContent.includes('不能判定'));
check('G8: pargram counts toward the ' + TOTAL_DEMOS + '-demo progress', byId.progressCount.textContent === '107 / ' + TOTAL_DEMOS);

navGo('demo-specialquad');
check('specialquad renders: plain parallelogram',
  byId.spRead.textContent.includes('平行四边形'));
click(byId.spRectBtn); // 加一个直角
check('specialquad: add a right angle → rectangle, diagonals equal',
  byId.spRead.textContent.includes('矩形') && byId.spRead.textContent.includes('对角线相等'));
click(byId.spRectBtn); // 拿掉直角
click(byId.spRhomBtn); // 加一组邻边相等
check('specialquad: add equal adjacent sides → rhombus, area 6×8÷2 = 24',
  byId.spRead.textContent.includes('菱形') && byId.spRead.textContent.includes('6×8÷2 = 24'));
click(byId.spRectBtn); // 两个条件都加
check('specialquad: both conditions → square, area 36',
  byId.spRead.textContent.includes('正方形') && byId.spRead.textContent.includes('面积 36'));
check('G8: specialquad counts toward the ' + TOTAL_DEMOS + '-demo progress', byId.progressCount.textContent === '108 / ' + TOTAL_DEMOS);

navGo('demo-datastats');
check('datastats renders: 2,3,3,5,7 — mean 4, median 3, mode 3, variance 3.2',
  byId.dsRead.textContent.includes('平均数是 4') && byId.dsRead.textContent.includes('中位数是 3') &&
  byId.dsRead.textContent.includes('众数是 3') && byId.dsRead.textContent.includes('方差是 3.2'));
click(byId.dsChips.children[0]); // 第一个数 2→3
check('datastats edit: first value 2→3, mean 4.2, variance 2.56',
  byId.dsRead.textContent.includes('平均数是 4.2') && byId.dsRead.textContent.includes('方差是 2.56'));
click(byId.dsOutBtn); // 加一个 100
check('datastats outlier: adding 100 moves the mean to 20.17, median stays 4',
  byId.dsMsg.textContent.includes('平均数一下子变成 20.17') && byId.dsMsg.textContent.includes('中位数还是 4'));
click(byId.dsReset);
check('datastats reset: back to mean 4', byId.dsRead.textContent.includes('平均数是 4'));
click(byId.dsModeSeg.children[1]); // 比一比谁更稳定
check('datastats compare: same mean 9, group 甲 has smaller variance, more stable',
  byId.dsRead.textContent.includes('方差 2') && byId.dsRead.textContent.includes('方差 18') &&
  byId.dsRead.textContent.includes('甲更稳定'));
click(byId.dsPairSeg.children[1]); // 丙 / 丁
check('datastats compare: group 丙 variance 0, most stable',
  byId.dsRead.textContent.includes('丙更稳定'));
check('G8: all 11 new demos tried by now', byId.progressCount.textContent === '109 / ' + TOTAL_DEMOS);

// 知识点页 → 实验的链接（桩里的 grade-8.js）+ 真实 grade-8.js 的映射
const G8_LINKS = [
  ['8.1', 'trisides', '去玩三边围不围'], ['8.2', 'congruent', '去玩全等判定拼一拼'],
  ['8.3', 'foldmirror', '去玩对折看对称'], ['8.4', 'foldmirror', '去玩对折看对称'],
  ['8.5', 'algarea', '去玩面积模型算整式'], ['8.6', 'algarea', '去玩面积模型算整式'],
  ['8.7', 'algarea', '去玩面积模型算整式'], ['8.8', 'algfrac', '去玩分式约分'],
  ['8.9', 'eqsieve', '去玩分式方程过筛子'], ['8.10', 'radical', '去玩二次根式化简'],
  ['8.11', 'pythag', '去玩勾股定理面积拼图'], ['8.12', 'pargram', '去玩平行四边形推一推'],
  ['8.13', 'specialquad', '去玩加条件变特殊'], ['8.14', 'function', '去玩函数演示'],
  ['8.15', 'function', '去玩函数演示'], ['8.16', 'datastats', '去玩数据分析算一算']
];
G8_LINKS.forEach(function ([id, demo, label]) {
  navGo('point-' + id);
  check('point ' + id + ' links the ' + demo + ' experiment',
    pointDetail.innerHTML.includes(label) && pointDetail.innerHTML.includes('data-demo-link="demo-' + demo + '"'));
});
navGo('point-8.11');
sandbox.goDemoFromHere('demo-pythag');
check('G8 demo from point keeps point as parent', byId.crumbTitle.innerHTML.includes('勾股定理'));
sandbox.navBackFn();
check('G8 back from demo returns to point page', pointDetail.innerHTML.includes('勾股定理'));
const g8src = fs.readFileSync(root + '/content/grades/grade-8.js', 'utf8');
const g8ids = [...g8src.matchAll(/id: "([0-9.]+)"/g)].map(m => m[1]);
const g8demos = [...g8src.matchAll(/demo: (?:'([a-z]+)'|null)/g)].map(m => m[1] || null);
const g8expected = {'8.1':'trisides','8.2':'congruent','8.3':'foldmirror','8.4':'foldmirror','8.5':'algarea','8.6':'algarea','8.7':'algarea','8.8':'algfrac','8.9':'eqsieve','8.10':'radical','8.11':'pythag','8.12':'pargram','8.13':'specialquad','8.14':'function','8.15':'function','8.16':'datastats'};
check('grade-8.js: all 16 points map to the right experiment',
  g8ids.length === 16 && g8ids.every((id, i) => g8demos[i] === g8expected[id]));
const G8_DEMOS = ['trisides', 'congruent', 'foldmirror', 'algarea', 'algfrac', 'eqsieve', 'radical', 'pythag', 'pargram', 'specialquad', 'datastats'];
const labelSrc8 = src.match(/const DEMO_LABEL = \{([^}]*)\}/)[1];
check('DEMO_LABEL covers all 11 new demos',
  G8_DEMOS.every(k => labelSrc8.includes(k + ':')));
check('viewForKey covers all 11 new demos',
  G8_DEMOS.every(k => sandbox.viewForKey('demo-' + k) === 'demo-' + k));


// ---------- 9. 九年级实验（15 个新演示，146 个动画（当时）） ----------
check('G9 start: progress is 109 / ' + TOTAL_DEMOS + ' before any G9 demo is tried', byId.progressCount.textContent === '109 / ' + TOTAL_DEMOS);

navGo('demo-quad');
check('quad renders: x²−5x+6=0 completes to (x−2.5)²=0.25',
  byId.qqRead.textContent.includes('x²−5x+6=0') && byId.qqRead.textContent.includes('(x−2.5)²=0.25'));
click(byId.qqModeSeg.children[1]); // 公式法
check('quad formula: Δ=1, roots 2 and 3',
  byId.qqRead.textContent.includes('Δ=b²−4ac=1') && byId.qqMsg.textContent.includes('x=2') && byId.qqMsg.textContent.includes('x=3'));
click(byId.qqProbSeg.children[2]); // x²−4x+5=0
check('quad: x²−4x+5=0 has Δ=-4, no real roots',
  byId.qqRead.textContent.includes('Δ=b²−4ac=-4') && byId.qqMsg.textContent.includes('没有实数根'));
click(byId.qqModeSeg.children[3]); // 代回去验算
check('quad check: no real roots, nothing to substitute',
  byId.qqRead.textContent.includes('没有实数根'));
click(byId.qqProbSeg.children[1]); // x²+6x−7=0
click(byId.qqModeSeg.children[3]); // 代回去验算
check('quad check: x=1 and x=-7 both substitute to 0',
  byId.qqRead.textContent.includes('x=1') && byId.qqRead.textContent.includes('x=-7') &&
  byId.qqRead.textContent.includes('得 0'));
check('G9: quad counts toward the ' + TOTAL_DEMOS + '-demo progress', byId.progressCount.textContent === '110 / ' + TOTAL_DEMOS);

navGo('demo-growth');
check('growth renders: 100 yuan at 10% for 2 years is 121',
  byId.gwRead.textContent.includes('121'));
click(byId.gwXPlus); // 11%
check('growth: 11% for 2 years is 123.21, not 122',
  byId.gwRead.textContent.includes('123.21') && byId.gwMsg.textContent.includes('100×(1+11%)²=123.21'));
click(byId.gwModeSeg.children[1]); // 韦达
check('growth vieta: x²−3x+1=0, sum 3, product 1, squares sum 7',
  byId.gwRead.textContent.includes('x₁+x₂=3') && byId.gwRead.textContent.includes('x₁x₂=1') &&
  byId.gwMsg.textContent.includes('=7'));
click(byId.gwVietaSeg.children[1]); // x²−5x+6=0
check('growth vieta: x²−5x+6=0, squares sum 13',
  byId.gwMsg.textContent.includes('=13'));
check('G9: growth counts toward the ' + TOTAL_DEMOS + '-demo progress', byId.progressCount.textContent === '111 / ' + TOTAL_DEMOS);

navGo('demo-parabola');
check('parabola renders: y=x², vertex (0,0), tangent to x-axis',
  byId.ppRead.textContent.includes('顶点 (0,0)') && byId.ppRead.textContent.includes('开口向上') &&
  byId.ppMsg.textContent.includes('与 x 轴相切于 (0,0)'));
click(byId.ppKMinus); // k=-1
check('parabola: k=-1 crosses the x-axis at (-1,0) and (1,0)',
  byId.ppMsg.textContent.includes('与 x 轴交于 (-1,0) 和 (1,0)'));
click(byId.ppKPlus); click(byId.ppKPlus); // k=1
check('parabola: k=1 has no x-intercepts, Δ<0',
  byId.ppMsg.textContent.includes('与 x 轴没有交点'));
click(byId.ppModeSeg.children[1]); // 利润最高点
check('parabola profit: raise 5 yuan, max profit 2450',
  byId.ppRead.textContent.includes('总利润 2450 元') && byId.ppMsg.textContent.includes('最大利润 2450 元'));
click(byId.ppXMinus); // 4 元
check('parabola profit: raise 4 yuan, profit 2448',
  byId.ppRead.textContent.includes('总利润 2448 元'));
check('G9: parabola counts toward the ' + TOTAL_DEMOS + '-demo progress', byId.progressCount.textContent === '112 / ' + TOTAL_DEMOS);

navGo('demo-spin');
check('spin renders: square rotates 90°, distance from O unchanged',
  byId.snRead.textContent.includes('正方形') && byId.snRead.textContent.includes('转 90°') &&
  byId.snRead.textContent.includes('距离都是'));
check('spin: square at 90° coincides with itself',
  byId.snMsg.textContent.includes('重合'));
click(byId.snShapeSeg.children[0]); // 三角形
check('spin: scalene triangle at 90° does not coincide',
  byId.snMsg.textContent.includes('还没和原来重合'));
click(byId.snHalfBtn); // 转 180°
check('spin: 180° is central symmetry',
  byId.snRead.textContent.includes('转 180°') && byId.snMsg.textContent.includes('中心对称'));
click(byId.snShapeSeg.children[2]); // 等边三角形
click(byId.snAngPlus); click(byId.snAngPlus); click(byId.snAngPlus); click(byId.snAngPlus); // 180→300
check('spin: equilateral at 300° does not coincide (needs 120° steps)',
  byId.snMsg.textContent.includes('还没和原来重合'));
check('G9: spin counts toward the ' + TOTAL_DEMOS + '-demo progress', byId.progressCount.textContent === '113 / ' + TOTAL_DEMOS);

navGo('demo-circangle');
check('circangle renders: central 120°, inscribed 60°',
  byId.cjRead.textContent.includes('∠AOB=120°') && byId.cjRead.textContent.includes('∠ACB=60°'));
click(byId.cjCPosSeg.children[3]); // 劣弧 90°
check('circangle: C on the minor arc sees 120°',
  byId.cjRead.textContent.includes('∠ACB=120°'));
click(byId.cjModeSeg.children[1]); // 垂径
check('circangle chord: r=5, chord 8, distance 3',
  byId.cjRead.textContent.includes('弦长 8') && byId.cjRead.textContent.includes('距离是 3'));
click(byId.cjChordPlus); // 弦 6
check('circangle chord: chord 6, distance 4',
  byId.cjRead.textContent.includes('弦长 6') && byId.cjRead.textContent.includes('距离是 4'));
check('G9: circangle counts toward the ' + TOTAL_DEMOS + '-demo progress', byId.progressCount.textContent === '114 / ' + TOTAL_DEMOS);

navGo('demo-tangent');
check('tangent renders: r=4, d=5, separate, 0 intersections',
  byId.tgRead.textContent.includes('d=5') && byId.tgRead.textContent.includes('相离') && byId.tgRead.textContent.includes('0 个交点'));
click(byId.tgDMinus); // d=4
check('tangent: d=4, tangent, 1 intersection',
  byId.tgRead.textContent.includes('相切') && byId.tgRead.textContent.includes('1 个交点'));
click(byId.tgDMinus); // d=3
check('tangent: d=3, intersecting, 2 intersections',
  byId.tgRead.textContent.includes('相交') && byId.tgRead.textContent.includes('2 个交点'));
click(byId.tgModeSeg.children[1]); // 切线长
check('tangent length: OP=5, PA=PB=3',
  byId.tgRead.textContent.includes('PA=PB=3'));
click(byId.tgOPPlus); // OP=6
check('tangent length: OP=6, PA=PB=4.47',
  byId.tgRead.textContent.includes('PA=PB=4.47'));
check('G9: tangent counts toward the ' + TOTAL_DEMOS + '-demo progress', byId.progressCount.textContent === '115 / ' + TOTAL_DEMOS);

navGo('demo-sector');
check('sector renders: r=6, n=60°, arc 6.28, area 18.85',
  byId.sfRead.textContent.includes('弧长 l=6.28') && byId.sfRead.textContent.includes('面积 S=18.85'));
click(byId.sfNPlus); // n=90°
check('sector: n=90°, arc 9.42',
  byId.sfRead.textContent.includes('弧长 l=9.42'));
click(byId.sfModeSeg.children[1]); // 圆锥
check('sector cone: r=3, l=5, lateral area 15π, angle 216°',
  byId.sfRead.textContent.includes('15π') && byId.sfMsg.textContent.includes('216°'));
click(byId.sfCRPlus); // r=4
check('sector cone: r=4, lateral area 20π, angle 288°',
  byId.sfRead.textContent.includes('20π') && byId.sfMsg.textContent.includes('288°'));
check('G9: sector counts toward the ' + TOTAL_DEMOS + '-demo progress', byId.progressCount.textContent === '116 / ' + TOTAL_DEMOS);

navGo('demo-coin');
check('coin renders: no tosses yet',
  byId.cfRead.textContent.includes('还没抛'));
click(byId.cfToss10);
check('coin: 10 tosses counted, frequency shown',
  byId.cfRead.textContent.includes('抛了 10 次') && byId.cfRead.textContent.includes('频率是'));
click(byId.cfReset);
check('coin reset: back to no tosses', byId.cfRead.textContent.includes('还没抛'));
click(byId.cfModeSeg.children[1]); // 摸红球
check('coin ball: red probability 3/5',
  byId.cfRead.textContent.includes('3/5=0.6'));
click(byId.cfDrawBtn);
check('coin ball: one draw counted', byId.cfRead.textContent.includes('摸了 1 次'));
check('G9: coin counts toward the ' + TOTAL_DEMOS + '-demo progress', byId.progressCount.textContent === '117 / ' + TOTAL_DEMOS);

navGo('demo-tree');
check('tree renders: prompt to grow the next level',
  byId.twRead.textContent.includes('长出下一层'));
click(byId.twNextBtn);
check('tree level 1: first coin has 正面、反面',
  byId.twRead.textContent.includes('正面、反面'));
click(byId.twNextBtn);
check('tree level 2: two coins, 4 outcomes, both heads 1/4',
  byId.twRead.textContent.includes('4 种') && byId.twRead.textContent.includes('概率 1/4'));
click(byId.twScenSeg.children[1]); // 两枚骰子
click(byId.twNextBtn); click(byId.twNextBtn);
check('tree dice: 36 outcomes, sum 7 has 6, probability 1/6',
  byId.twRead.textContent.includes('36 种') && byId.twRead.textContent.includes('1/6'));
click(byId.twScenSeg.children[2]); // 抽两张卡片
click(byId.twNextBtn); click(byId.twNextBtn);
check('tree cards: 6 combinations, both odd 1/6',
  byId.twRead.textContent.includes('6 种组合') && byId.twRead.textContent.includes('概率 1/6'));
check('G9: tree counts toward the ' + TOTAL_DEMOS + '-demo progress', byId.progressCount.textContent === '118 / ' + TOTAL_DEMOS);

navGo('demo-hyperbola');
check('hyperbola renders: k=6 in quadrants I/III, P(2,3), area 6',
  byId.hbRead.textContent.includes('第一、三象限') && byId.hbRead.textContent.includes('P(2,3)') &&
  byId.hbRead.textContent.includes('矩形面积 |xy|=6'));
click(byId.hbKMinus); // k=4
check('hyperbola: k=4, P(2,2), area 4',
  byId.hbRead.textContent.includes('P(2,2)') && byId.hbRead.textContent.includes('矩形面积 |xy|=4'));
click(byId.hbKMinus); click(byId.hbKMinus); // k=-2
check('hyperbola: k=-2 in quadrants II/IV, P(2,-1)',
  byId.hbRead.textContent.includes('第二、四象限') && byId.hbRead.textContent.includes('P(2,-1)'));
check('G9: hyperbola counts toward the ' + TOTAL_DEMOS + '-demo progress', byId.progressCount.textContent === '119 / ' + TOTAL_DEMOS);

navGo('demo-similar');
check('similar renders: 3-4-5 scaled ×2 is 6-8-10, perimeter 24, area 24',
  byId.siRead.textContent.includes('6、8、10') && byId.siRead.textContent.includes('周长 24') &&
  byId.siRead.textContent.includes('面积 24'));
click(byId.siKPlus); // k=2.5
check('similar: ×2.5, sides 7.5-10-12.5, perimeter 30, area 37.5',
  byId.siRead.textContent.includes('7.5、10、12.5') && byId.siRead.textContent.includes('周长 30') &&
  byId.siRead.textContent.includes('面积 37.5'));
click(byId.siModeSeg.children[1]); // 位似
check('similar homothety: OA=2, k=2.5, OA′=5',
  byId.siRead.textContent.includes("OA′=5"));
click(byId.siKPlus); // k=3
check('similar homothety: k=3, area 5×9=45',
  byId.siMsg.textContent.includes('5×9=45'));
check('G9: similar counts toward the ' + TOTAL_DEMOS + '-demo progress', byId.progressCount.textContent === '120 / ' + TOTAL_DEMOS);

navGo('demo-shadow');
check('shadow renders: your shadow 2m, pole 9.6m',
  byId.swRead.textContent.includes('旗杆高 1.6×12÷2=9.6 米'));
click(byId.swSPlus); // 3 米
check('shadow: your shadow 3m, pole 6.4m',
  byId.swRead.textContent.includes('旗杆高 1.6×12÷3=6.4 米'));
click(byId.swModeSeg.children[1]); // AA 判定
check('shadow AA: ∠A=50°, ∠B=60°, ∠C=70°',
  byId.swRead.textContent.includes('∠C=70°') && byId.swMsg.textContent.includes('相似（AA）'));
click(byId.swAMinus); // ∠A=40°
check('shadow AA: ∠A=40°, ∠C=80°',
  byId.swRead.textContent.includes('∠C=80°'));
check('G9: shadow counts toward the ' + TOTAL_DEMOS + '-demo progress', byId.progressCount.textContent === '121 / ' + TOTAL_DEMOS);

navGo('demo-trig');
check('trig renders: ∠A=30°, opposite 5, adjacent 8.66, sin 0.5',
  byId.tjRead.textContent.includes('对边 5') && byId.tjRead.textContent.includes('邻边 8.66') &&
  byId.tjRead.textContent.includes('sin A=0.5'));
check('trig: sin²+cos²=1', byId.tjMsg.textContent.includes('sin²A+cos²A=1'));
click(byId.tjSpecialSeg.children[1]); // 45°
check('trig 45°: tan A=1, sin45°=cos45°=√2/2',
  byId.tjRead.textContent.includes('tan A=1') && byId.tjMsg.textContent.includes('sin45°=cos45°=√2/2'));
click(byId.tjSpecialSeg.children[2]); // 60°
check('trig 60°: sin60°=√3/2, opposite 8.66',
  byId.tjMsg.textContent.includes('sin60°=√3/2') && byId.tjRead.textContent.includes('对边 8.66'));
check('G9: trig counts toward the ' + TOTAL_DEMOS + '-demo progress', byId.progressCount.textContent === '122 / ' + TOTAL_DEMOS);

navGo('demo-slope');
check('slope renders: elevation 30°, 20m away, tower 11.55m',
  byId.soRead.textContent.includes('楼高=20×tan30°=11.55 米'));
click(byId.soAngSeg.children[1]); // 45°
check('slope: elevation 45°, 20m away, tower 20m',
  byId.soRead.textContent.includes('楼高=20×tan45°=20 米'));
click(byId.soModeSeg.children[1]); // 坡度
check('slope grade: 1:1, height 4m, slope face 4√2 ≈ 5.66m',
  byId.soRead.textContent.includes('坡面长 5.66 米') && byId.soMsg.textContent.includes('4√2'));
click(byId.soRatioSeg.children[1]); // 1:2
check('slope grade: 1:2, height 4m, horizontal 8m, slope face 8.94m',
  byId.soRead.textContent.includes('水平距离 8 米') && byId.soRead.textContent.includes('坡面长 8.94 米'));
check('G9: slope counts toward the ' + TOTAL_DEMOS + '-demo progress', byId.progressCount.textContent === '123 / ' + TOTAL_DEMOS);

navGo('demo-project');
check('project renders: 4m object, sun 45°, shadow 4m',
  byId.pjRead.textContent.includes('影长=4÷tan45°=4 米'));
click(byId.pjAngSeg.children[0]); // 30°
check('project sun: 30°, shadow 6.93m',
  byId.pjRead.textContent.includes('影长=4÷tan30°=6.93 米'));
click(byId.pjModeSeg.children[1]); // 灯光
check('project lamp: lamp 2m away, shadow 1m',
  byId.pjRead.textContent.includes('影长 1 米'));
click(byId.pjDPlus); // 3 米
check('project lamp: lamp 3m away, shadow 1.5m',
  byId.pjRead.textContent.includes('影长 1.5 米'));
click(byId.pjModeSeg.children[2]); // 三视图
check('project views: cylinder, front rectangle, top circle',
  byId.pjRead.textContent.includes('圆柱') && byId.pjRead.textContent.includes('主视图是长方形') &&
  byId.pjRead.textContent.includes('俯视图是圆形'));
click(byId.pjSolidSeg.children[1]); // 长方体
check('project views: cuboid 6×3×4, front 6×4, left 3×4, top 6×3',
  byId.pjRead.textContent.includes('主视图是长方形 6×4') && byId.pjRead.textContent.includes('左视图是长方形 3×4') &&
  byId.pjRead.textContent.includes('俯视图是长方形 6×3'));
check('G9: all 15 new demos tried by now', byId.progressCount.textContent === '124 / ' + TOTAL_DEMOS);

// 知识点页 → 实验的链接（桩里的 grade-9.js）+ 真实 grade-9.js 的映射
const G9_LINKS = [
  ['9.1', 'quad', '去玩一元二次方程'], ['9.2', 'growth', '去玩利滚利和韦达'],
  ['9.3', 'parabola', '去玩抛物线滑杆'], ['9.4', 'parabola', '去玩抛物线滑杆'],
  ['9.5', 'spin', '去玩旋转和中心对称'], ['9.6', 'circangle', '去玩圆周角'],
  ['9.7', 'tangent', '去玩直线和圆切线'], ['9.8', 'sector', '去玩扇形和圆锥'],
  ['9.9', 'monty', '去玩三门问题'], ['9.10', 'tree', '去玩树状图数一数'],
  ['9.11', 'hyperbola', '去玩双曲线'], ['9.12', 'similar', '去玩相似放大'],
  ['9.13', 'shadow', '去玩影子测高'], ['9.14', 'trig', '去玩锐角三角函数'],
  ['9.15', 'slope', '去玩仰角和坡度'], ['9.16', 'project', '去玩投影和三视图']
];
G9_LINKS.forEach(function ([id, demo, label]) {
  navGo('point-' + id);
  check('point ' + id + ' links the ' + demo + ' experiment',
    pointDetail.innerHTML.includes(label) && pointDetail.innerHTML.includes('data-demo-link="demo-' + demo + '"'));
});
navGo('point-9.3');
sandbox.goDemoFromHere('demo-parabola');
check('G9 demo from point keeps point as parent', byId.crumbTitle.innerHTML.includes('二次函数的图象和性质'));
sandbox.navBackFn();
check('G9 back from demo returns to point page', pointDetail.innerHTML.includes('二次函数的图象和性质'));
const g9src = fs.readFileSync(root + '/content/grades/grade-9.js', 'utf8');
const g9ids = [...g9src.matchAll(/id: "([0-9.]+)"/g)].map(m => m[1]);
const g9demos = [...g9src.matchAll(/demo: (?:'([a-z]+)'|null)/g)].map(m => m[1] || null);
const g9expected = {'9.1':'quad','9.2':'growth','9.3':'parabola','9.4':'parabola','9.5':'spin','9.6':'circangle','9.7':'tangent','9.8':'sector','9.9':'monty','9.10':'tree','9.11':'hyperbola','9.12':'similar','9.13':'shadow','9.14':'trig','9.15':'slope','9.16':'project'};
check('grade-9.js: all 16 points map to the right experiment',
  g9ids.length === 16 && g9ids.every((id, i) => g9demos[i] === g9expected[id]));
check('grade-9.js: 9.3/9.11 no longer point at the linear function demo',
  !g9src.includes("demo: 'function'"));
// 9.4 利润题：旧答案 (30+x)(80-4x) 顶点在 x=-5，2100 元不是最大值；已改成少卖 2 件，顶点 x=5、最大 2450 元。
const m94 = g9src.match(/id: "9\.4"[\s\S]*?最大利润(\d+)元/);
check('grade-9.js: 9.4 利润题答案是 2450 元（(30+5)×(80-10) 重算）',
  m94 && m94[1] === '2450' && (30 + 5) * (80 - 2 * 5) === 2450 && !g9src.includes('2100元'));
const G9_DEMOS = ['quad', 'growth', 'parabola', 'spin', 'circangle', 'tangent', 'sector', 'coin', 'tree', 'hyperbola', 'similar', 'shadow', 'trig', 'slope', 'project'];
const labelSrc9 = src.match(/const DEMO_LABEL = \{([^}]*)\}/)[1];
check('DEMO_LABEL covers all 15 new demos',
  G9_DEMOS.every(k => labelSrc9.includes(k + ':')));
check('viewForKey covers all 15 new demos',
  G9_DEMOS.every(k => sandbox.viewForKey('demo-' + k) === 'demo-' + k));
check('DEMO_GRADES puts all 15 new demos in grade 9',
  G9_DEMOS.every(k => src.includes(k + ': [9]')));

// ---------- 10. 复测修复 A–J ----------
const html = fs.readFileSync(root + '/apps/web/index.html', 'utf8');

// A. array demo: intro/foot/why follow rows/cols; square rotate message is meaningful.
navGo('demo-array');
// Navigate to 4×4 from whatever state the G2 test left (it ends at 4×4 already).
while (parseInt(byId.arrRowsTx.textContent) < 4) click(byId.arrRowsPlus);
while (parseInt(byId.arrRowsTx.textContent) > 4) click(byId.arrRowsMinus);
while (parseInt(byId.arrColsTx.textContent) < 4) click(byId.arrColsPlus);
while (parseInt(byId.arrColsTx.textContent) > 4) click(byId.arrColsMinus);
check('A array: at 4×4, heading/intro/foot/why all say 4 rows 4 columns, 16 dots',
  byId.arrTitle.textContent.includes('4 行 4 列') && byId.arrTitle.textContent.includes('16 个点') &&
  byId.arrIntro.textContent.includes('4 行 4 列') && byId.arrFoot.textContent.includes('4行4列') &&
  byId.arrWhy.innerHTML.includes('4 行 4 列') && byId.arrWhy.innerHTML.includes('16 个点') &&
  !byId.arrIntro.textContent.includes('3 行 4 列') && !byId.arrFoot.textContent.includes('3行4列') &&
  !byId.arrWhy.innerHTML.includes('3 行 4 列'));
click(byId.arrRotate);
check('A array: square rotate message says the square stays the same, no 4×4 vs 4×4 phrasing',
  byId.arrMsg.textContent.includes('正方形转一圈还是正方形') && !byId.arrMsg.textContent.includes('4×4 和 4×4'));
// A (cont.): 口诀 follows every rows/cols combo 2–6.
const ARR_CN_T = { 2: '二', 3: '三', 4: '四', 5: '五', 6: '六' };
const ARR_SMALL_T = { 4: '四', 5: '五', 6: '六', 8: '八', 9: '九' };
let kouOk = true;
for (let r = 2; r <= 6; r++) {
  for (let c = 2; c <= 6; c++) {
    while (parseInt(byId.arrRowsTx.textContent) < r) click(byId.arrRowsPlus);
    while (parseInt(byId.arrRowsTx.textContent) > r) click(byId.arrRowsMinus);
    while (parseInt(byId.arrColsTx.textContent) < c) click(byId.arrColsPlus);
    while (parseInt(byId.arrColsTx.textContent) > c) click(byId.arrColsMinus);
    const p = r * c;
    const exp = ARR_CN_T[r] + ARR_CN_T[c] + (p < 10 ? '得' + ARR_SMALL_T[p] : String(p));
    if (byId.arrKoujue.textContent !== '口诀：' + exp) kouOk = false;
  }
}
check('A array: 口诀 updates correctly for every rows/cols combo 2–6', kouOk);

// B. circle demo: real circle SVGs, wedge count follows slices.
check('B circle: real circle SVG with radius and diameter drawn',
  html.includes('id="ccCircSvg"') && html.includes('id="ccCircle"') &&
  html.includes('id="ccDiamLine"') && html.includes('id="ccRadiusLine"'));
check('B circle: area mode has wedge and rectangle SVGs',
  html.includes('id="ccWedgeSvg"') && html.includes('id="ccRectSvg"'));
navGo('demo-circle');
click(byId.ccSliceSeg.children[0]); // 4 片（此前是 16 片）
check('B circle: 4 slices in area mode → 4 wedge paths and 4 rectangle wedges',
  byId.ccWedgeSvg.children.length === 4 && byId.ccRectSvg.children.length === 4);
click(byId.ccSliceSeg.children[2]); // 16 片
check('B circle: 16 slices in area mode → 16 wedge paths and 16 rectangle wedges',
  byId.ccWedgeSvg.children.length === 16 && byId.ccRectSvg.children.length === 16);
click(byId.ccModeSeg.children[0]); // 周长模式
click(byId.ccRMinus); // r=4→3
check('B circle: circumference mode draws a circle with radius 33 (r=3)',
  byId.ccCircle.getAttribute('r') === '33');

// C. radar demo: rings SVG inside the map.
const rdMapHtml = html.slice(html.indexOf('id="rdMap"'), html.indexOf('id="rdRay"'));
check('C radar: rings SVG exists inside the radar map',
  rdMapHtml.includes('id="rdRings"') && rdMapHtml.includes('r="28"') && rdMapHtml.includes('r="140"') &&
  rdMapHtml.includes('100m') && rdMapHtml.includes('500m'));

// D. breadcrumb dedup: unit name shown once when it equals the point title.
navGo('point-6.6');
check('D breadcrumb: point 6.6 shows 百分数（一） exactly once',
  (byId.crumbTitle.innerHTML.match(/百分数（一）/g) || []).length === 1);
navGo('point-1.2');
check('D breadcrumb: point 1.2 shows 位置 exactly once',
  (byId.crumbTitle.innerHTML.match(/位置/g) || []).length === 1);
navGo('point-7.6');
check('D breadcrumb: normal point 7.6 still shows both unit and point title',
  byId.crumbTitle.innerHTML.includes('一元一次方程') && byId.crumbTitle.innerHTML.includes('解一元一次方程'));

// E. trialdiv: success text follows the problem; switching problems clears stale feedback.
navGo('demo-trialdiv');
click(byId.tdProbSeg.children[1]); // 161÷23
check('E trialdiv: switch to 161÷23, success text follows the problem and feedback resets',
  byId.tdFoot.textContent.includes('161') && byId.tdFoot.textContent.includes('7×23=161') &&
  byId.tdMsg.textContent === '先猜一个商，再点“乘回去验算”。');
click(byId.tdProbSeg.children[0]); // 150÷26
check('E trialdiv: switch back to 150÷26, success text says 5×26=130, remainder 20',
  byId.tdFoot.textContent.includes('130') && byId.tdFoot.textContent.includes('余 20'));

// F. baraxis why: plain wording that matches the demo's 28/24 data.
check('F baraxis: why now says plainly what the demo shows (28 vs 24, axis from 20)',
  html.includes('男生 28 人、女生 24 人') && html.includes('女生条只有男生条一半高'));
check('F baraxis: old confusing sentence is gone', !html.includes('只差一倍的一半'));

// G. grade numbering: unit cards carry their point ids.
navGo('grade-3');
check('G grade-3 numbering: unit card shows 3.15a · 复式统计表',
  gradeDetail.innerHTML.includes('3.15a · 复式统计表'));
navGo('grade-8');
check('G grade numbering: multi-point unit shows id range 8.3–8.4 · 轴对称',
  gradeDetail.innerHTML.includes('8.3–8.4 · 轴对称'));

// H. area demo: success text matches the starting state.
check('H area: success text matches the starting state (5 rows of 3, 15 tiles)',
  html.includes('5 行 3 块就是 15 块') && !html.includes('4 行 3 块就是 12 块'));

// I. calendar typo: February reads correctly for both years.
navGo('demo-calendar');
click(byId.caYearSeg.children[0]); // 2024 闰年（G3 测试留在了 2025 年）
click(byId.caMonthSeg.children[1]); // 2 月
check('I calendar: February leap year reads 2 月：2024 年是闰年，有 29 天',
  byId.caReadout.textContent.includes('2 月：2024 年是闰年，有 29 天'));
click(byId.caYearSeg.children[1]); // 2025 平年
check('I calendar: February common year reads 2 月：2025 年是平年，有 28 天',
  byId.caReadout.textContent.includes('2 月：2025 年是平年，有 28 天'));
click(byId.caMonthSeg.children[2]); // 3 月
check('I calendar: other months still read correctly (3 月是大月，有 31 天）',
  byId.caReadout.textContent.includes('3 月是大月，有 31 天'));

// J. divplace why: follows the selected problem; grade-3.js 3.10 why matches the default problem.
navGo('demo-divplace');
click(byId.d1ProbSeg.children[0]); // 96÷4（G3 测试留在了 408÷4）
check('J divplace: with 96÷4 shown, the why has no zero-placeholder sentence',
  byId.d1Why.innerHTML.includes('96÷4') && !byId.d1Why.innerHTML.includes('商中间的 0'));
click(byId.d1ProbSeg.children[1]); // 408÷4
check('J divplace: with 408÷4 shown, the why keeps the zero-placeholder sentence',
  byId.d1Why.innerHTML.includes('商中间的 0 是占位符'));
const m310 = g3src.match(/id: "3\.10"[\s\S]*?why: "([^"]*)"/);
check('J divplace: grade-3.js 3.10 why matches the default problem (no zero sentence)',
  m310 && !m310[1].includes('商中间的0'));
check('J divplace: grade-3.js 3.10 wrongWhy still explains the 408÷4 trap',
  g3src.includes('0是占位符：102是1个百、0个十、2个一'));

// ---------- K. 家长端 + 探究作业（Phase 3） ----------
// 先造一份有时间的练习记录：3.7 上次答错（本周内），1.9 答对且有把握（2 天前），
// 3.12 答对但没把握（1 天前），1.1 是 10 天前的旧记录（不在本周内）。
const now0 = Date.now();
lsData['math-review-v1'] = JSON.stringify({
  '3.7': { last: now0, correct: false, confident: false, streak: 0, due: now0 },
  '1.9': { last: now0 - 2 * 86400000, correct: true, confident: true, streak: 1, due: now0 + 86400000 },
  '3.12': { last: now0 - 1 * 86400000, correct: true, confident: false, streak: 0, due: now0 },
  '1.1': { last: now0 - 10 * 86400000, correct: true, confident: true, streak: 2, due: now0 + 7 * 86400000 },
});
lsData['math-tried-demos-v1'] = JSON.stringify(['tenframe', 'fraction']);
check("viewForKey('parent') is parent", sandbox.viewForKey('parent') === 'parent');
check("viewForKey('inquiry') is inquiry", sandbox.viewForKey('inquiry') === 'inquiry');
navGo('parent');
check('K parent view: review section + parent card visible, progress/review cards hidden',
  byId.review.hidden === false && byId.parentCard.hidden === false &&
  byId.progressCard.hidden === true && byId.reviewCard.hidden === true);
check('K parent: breadcrumb shows 家长看这里 under 我的进度',
  byId.crumbTitle.innerHTML.includes('家长看这里') && byId.crumbTitle.innerHTML.includes('我的进度'));
check('K parent: week summary counts 3 practiced this week (old 1.1 excluded)',
  byId.parentCard.innerHTML.includes('这 7 天一共练了 3 条知识点'));
check('K parent: week summary groups by grade/unit',
  byId.parentCard.innerHTML.includes('3 年级') && byId.parentCard.innerHTML.includes('1 年级'));
check('K parent: demos counted from stored tried list, honestly not weekly',
  byId.parentCard.innerHTML.includes('演示一共玩过 2 / ' + TOTAL_DEMOS + ' 个') && byId.parentCard.innerHTML.includes('没法按周分开算'));
check('K parent: difficulty lists the wrong point and the low-confidence point',
  byId.parentCard.innerHTML.includes('3.7') && byId.parentCard.innerHTML.includes('上次答错了') &&
  byId.parentCard.innerHTML.includes('3.12') && byId.parentCard.innerHTML.includes('没把握'));
check('K parent: wrong questions grouped by the point’s own wrong text',
  byId.parentCard.innerHTML.includes('错因：1/4 比 1/3 大'));
navGo('inquiry');
check('K inquiry view: inquiry section visible, review hidden',
  byId.inquiry.hidden === false && byId.review.hidden === true);
check('K inquiry: 6 tasks listed, low/mid/high bands + teach-a-lesson card',
  (byId.inquiryDetail.innerHTML.match(/data-inq-submit="/g) || []).length === 6 &&
  byId.inquiryDetail.innerHTML.includes('8+6') && byId.inquiryDetail.innerHTML.includes('23×14') &&
  byId.inquiryDetail.innerHTML.includes('反比例') && byId.inquiryDetail.innerHTML.includes('小老师讲题'));
function clickInq(el) { (byId.inquiryDetail._handlers.click || []).forEach(f => f({ target: el })); }
const inqTa = byId.inquiryDetail.querySelector('[data-inq-text="inq-tenframe"]');
inqTa.value = '第一种：给 8 凑 10，6 拆成 2 和 4；第二种：给 6 凑 10，8 拆成 4 和 4；第三种：6+6=12，再加 2。';
const inqSel = byId.inquiryDetail.querySelector('[data-inq-demo="inq-tenframe"]');
inqSel.value = 'tenframe';
const inqBtn = makeEl('button'); inqBtn.dataset.inqSubmit = 'inq-tenframe';
clickInq(inqBtn);
const inqSaved = JSON.parse(lsData['math-inquiry-v1'] || '[]');
check('K inquiry: submit saves process + demo to math-inquiry-v1',
  inqSaved.length === 1 && inqSaved[0].taskId === 'inq-tenframe' && inqSaved[0].demo === 'tenframe' &&
  inqSaved[0].text.includes('给 8 凑 10'));
check('K inquiry: submitted work shows in my list',
  byId.inquiryDetail.innerHTML.includes('给 8 凑 10'));
const teachQ = byId.inquiryDetail.querySelector('[data-teach-q]');
teachQ.value = '23×14 怎么算';
const teachTa = byId.inquiryDetail.querySelector('[data-teach-text]');
teachTa.value = '第一步把 14 拆成 10 和 4；第二步 23×10=230；第三步 23×4=92；最后 230+92=322。';
const teachBtn = makeEl('button'); teachBtn.dataset.teachSubmit = '1';
clickInq(teachBtn);
const inqSaved2 = JSON.parse(lsData['math-inquiry-v1'] || '[]');
check('K inquiry: teach-a-lesson saves with kind teach',
  inqSaved2.length === 2 && inqSaved2[1].kind === 'teach' && inqSaved2[1].question === '23×14 怎么算');
const inqTa2 = byId.inquiryDetail.querySelector('[data-inq-text="inq-array"]');
inqTa2.value = '';
const inqBtn2 = makeEl('button'); inqBtn2.dataset.inqSubmit = 'inq-array';
clickInq(inqBtn2);
check('K inquiry: empty process is not saved, reminder shown',
  JSON.parse(lsData['math-inquiry-v1'] || '[]').length === 2 &&
  byId.inquiryDetail.innerHTML.includes('先写几句过程再交'));
navGo('parent');
check('K parent: inquiry submissions visible to parents',
  byId.parentCard.innerHTML.includes('给 8 凑 10') && byId.parentCard.innerHTML.includes('小老师讲题') &&
  byId.parentCard.innerHTML.includes('23×14 怎么算'));
navGo('inquiry');
const dlBtn = makeEl('button'); dlBtn.dataset.inqDemoLink = 'demo-tenframe';
clickInq(dlBtn);
check('K inquiry: demo tool button opens the demo',
  documentStub.body.dataset.view === 'demo-tenframe');
sandbox.navBackFn();
check('K inquiry: back from demo returns to inquiry',
  byId.inquiryDetail.innerHTML.includes('探究作业'));
delete lsData['math-review-v1'];
delete lsData['math-tried-demos-v1'];
delete lsData['math-inquiry-v1'];
navGo('parent');
check('K parent: empty data says so honestly, no invented numbers',
  byId.parentCard.innerHTML.includes('还没有记录，先去练一练') &&
  !byId.parentCard.innerHTML.includes('这 7 天一共练了'));

// ---------- L. checkpoint / 闯关路 ----------
const checkpointDetail = byId.checkpointDetail;
function clickCp(el) { (checkpointDetail._handlers.click || []).forEach(f => f({ target: el })); }
navGo('checkpoint');
check('L checkpoint view: checkpoint section visible, review + grades hidden',
  documentStub.body.dataset.view === 'checkpoint' && byId.checkpoint.hidden === false && byId.review.hidden === true && byId.grades.hidden === true);
check('L checkpoint: empty data shows 0 lit and an empty badge wall, no fake badges',
  checkpointDetail.innerHTML.includes('已点亮 0 个') && checkpointDetail.innerHTML.includes('还没有徽章') &&
  !checkpointDetail.innerHTML.includes('小达人'));
// 3 年级“分数的初步认识”单元（stub 里只有 3.7 一个点，演示 fraction）：玩过演示 + 练过 3.7 → 2/2 点亮。
lsData['math-tried-demos-v1'] = JSON.stringify(['fraction']);
lsData['math-review-v1'] = JSON.stringify({ '3.7': { last: Date.now(), correct: true, confident: true, streak: 1, due: Date.now() + 86400000 } });
navGo('checkpoint');
check('L checkpoint: unit lights up only when all its tasks are done',
  checkpointDetail.innerHTML.includes('分数的初步认识小达人') && checkpointDetail.innerHTML.includes('已点亮 1 个'));
// 3.7 单元的动画本来就是 5 个（fraction + fraceq + buildfrac + fracnumline + m37-div），
// 旧断言的“动画 1 / 1”靠的是 6.1 单元当时只有 fraction 一个动画；6 年级第五批给 6.1
// 加了 m61-overlap / m61-scale / m61-wall / m61-groups，6.1 也变成 1 / 5，
// 所以断言改为点亮单元（3.7）的真实计数 1 / 5。
check('L checkpoint: lit unit shows task counts matching storage',
  checkpointDetail.innerHTML.includes('动画 1 / 5') && checkpointDetail.innerHTML.includes('已练 1 / 1 条') && checkpointDetail.innerHTML.includes('任务 2 / 2'));
check('L checkpoint: per-grade header labels the count as units (15 units, not 16 points)',
  /已点亮 \d+ \/ \d+ 个单元）/.test(checkpointDetail.innerHTML));
// 只玩演示、没练过 → 1/2，不点亮、不给徽章。
lsData['math-review-v1'] = JSON.stringify({});
navGo('checkpoint');
check('L checkpoint: half-done unit is not lit and earns no badge',
  checkpointDetail.innerHTML.includes('任务 1 / 2') && checkpointDetail.innerHTML.includes('已点亮 0 个') &&
  !checkpointDetail.innerHTML.includes('分数的初步认识小达人') && checkpointDetail.innerHTML.includes('还没有徽章'));
// 年级页和单元页也看得到点亮状态。
lsData['math-review-v1'] = JSON.stringify({ '3.7': { last: Date.now(), correct: true, confident: true, streak: 1, due: Date.now() + 86400000 } });
navGo('grade-3');
check('L checkpoint: grade page shows the lit unit',
  gradeDetail.innerHTML.includes('已点亮 1 / 4 个单元') && gradeDetail.innerHTML.includes('✓ 已点亮 · 分数的初步认识小达人'));
navGo('unit-3-0');
check('L checkpoint: unit page shows its task list and lit state',
  pointDetail.innerHTML.includes('闯关任务 · 已点亮') && pointDetail.innerHTML.includes('任务 2 / 2'));
// 1 年级单元挂着探究作业 inq-tenframe（点 1.9）：演示 + 练题都做了、没交作业 → 2/3 不点亮；交了才点亮。
// 注意：1.9 的演示已换成 thirteen（十格阵仍挂在 1.6/1.11），夹具里“玩过演示”就是玩过 thirteen。
lsData['math-tried-demos-v1'] = JSON.stringify(['thirteen']);
lsData['math-review-v1'] = JSON.stringify({ '1.9': { last: Date.now(), correct: true, confident: true, streak: 1, due: Date.now() + 86400000 } });
delete lsData['math-inquiry-v1'];
navGo('checkpoint');
check('L checkpoint: inquiry task counts only where one exists, and blocks lighting until submitted',
  checkpointDetail.innerHTML.includes('任务 2 / 3') && !checkpointDetail.innerHTML.includes('20以内的进位加法小达人'));
lsData['math-inquiry-v1'] = JSON.stringify([{ kind: 'inq', taskId: 'inq-tenframe', text: '三种凑十法', demo: 'tenframe', ts: Date.now() }]);
navGo('checkpoint');
check('L checkpoint: submitting the inquiry lights the unit and earns its badge',
  checkpointDetail.innerHTML.includes('20以内的进位加法小达人') && checkpointDetail.innerHTML.includes('已点亮 1 个'));
// 闯关路上的站能点进去（没有锁），点进去是单元页。
const cpBtn = makeEl('button'); cpBtn.dataset.cpUnit = '3-0';
clickCp(cpBtn);
check('L checkpoint: tapping a station opens its unit page, no lock',
  documentStub.body.dataset.view === 'unit-detail' && pointDetail.innerHTML.includes('分数的初步认识'));
// 我的进度页也看得到点亮数和徽章入口。
lsData['math-tried-demos-v1'] = JSON.stringify(['thirteen', 'fraction']);
lsData['math-review-v1'] = JSON.stringify({ '1.9': { last: Date.now(), correct: true, confident: true, streak: 1, due: Date.now() + 86400000 }, '3.7': { last: Date.now(), correct: true, confident: true, streak: 1, due: Date.now() + 86400000 } });
navGo('progress');
check('L checkpoint: progress page shows lit-unit counts and a badge-wall link',
  byId.progressCard.innerHTML.includes('已点亮 1 / 4 个单元') && byId.progressCard.innerHTML.includes('已拿到 2 个徽章'));

// ---------- M. 发现时刻（Phase 5）：120 个单元全有 story，知识点页在“为什么”之后渲染 ----------
// 文件级：每个年级的 story 字段数 = 单元数，且每则非空（≥20 字）。
const STORY_EXPECTED = { 1: 15, 2: 15, 3: 16, 4: 17, 5: 14, 6: 14, 7: 10, 8: 10, 9: 9 };
let storyTotal = 0, storyOk = true;
for (const g of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
  const fsrc = fs.readFileSync(root + '/content/grades/grade-' + g + '.js', 'utf8');
  const units = (fsrc.match(/^\s*unit: "/gm) || []).length;
  const stories = [...fsrc.matchAll(/story: "([^"]*)"/g)].map(m => m[1]);
  storyTotal += stories.length;
  if (units !== STORY_EXPECTED[g] || stories.length !== units || stories.some(s => s.length < 20)) storyOk = false;
}
check('M story: all 120 units have a non-empty story (15/15/16/17/14/14/10/10/9)',
  storyOk && storyTotal === 120);
// 抽查著名故事的关键事实词（改前文件里一个 story 都没有，这些检查必然失败）。
function storyHas(g, word) {
  const fsrc = fs.readFileSync(root + '/content/grades/grade-' + g + '.js', 'utf8');
  return fsrc.includes(word);
}
check('M story: Gauss 1+…+100=5050 in grade 4', storyHas(4, '高斯') && storyHas(4, '5050'));
check('M story: Zu Chongzhi pi to 7 decimals + Pythagoras in grade 6',
  storyHas(6, '祖冲之') && storyHas(6, '3.1415926') && storyHas(6, '毕达哥拉斯'));
check('M story: Venn + Stevin 1585 decimals in grade 3', storyHas(3, '韦恩') && storyHas(3, '斯蒂文'));
check('M story: Cao Chong weighing the elephant in grade 5', storyHas(5, '曹冲'));
check('M story: Buffon needle + Thales shadow in grade 9', storyHas(9, '蒲丰') && storyHas(9, '泰勒斯'));
check('M story: Harriot > < in grade 7', storyHas(7, '哈里奥特'));
// 渲染：知识点页“为什么”之后出现“发现时刻”，且在“容易错”之前；章节导航里也有。
navGo('point-3.7');
const whyIdx = pointDetail.innerHTML.indexOf('为什么');
const storyIdx = pointDetail.innerHTML.indexOf('发现时刻');
const wrongIdx = pointDetail.innerHTML.indexOf('容易错');
check('M story: point page renders 发现时刻 after 为什么 and before 容易错',
  storyIdx > whyIdx && whyIdx >= 0 && storyIdx > 0 && storyIdx < wrongIdx &&
  pointDetail.innerHTML.includes('古埃及人分面包'));
check('M story: point nav chip links to 发现时刻',
  pointDetail.innerHTML.includes('data-sec="sec-story"') && pointDetail.innerHTML.includes('id="sec-story"'));
// ---------- N. 参数化出题 qgen（Phase 6 Task A） ----------
// 每种题型生成 20 次，用题面里的数字独立重算答案（不信任生成器自己的答案），
// 再查连续 9 次生成的数字组合都不重复（最近 8 个组合的窗口保证的性质）。
// 这些检查在改前代码上必然失败：改前没有 qgenGenerate，调用会抛错。
function qgenGcdT(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; }
function qgenFracT(n, d) { const g = qgenGcdT(n, d); n /= g; d /= g; return d === 1 ? String(n) : n + '/' + d; }
function qgenNums(q) { const m = q.match(/-?\d+/g); return m ? m.map(Number) : []; }
// 每种题型：从题面解析参数，重算答案，和生成器给的答案逐字比对。
const QGEN_VERIFY = {
  'add-2d-1d': (g) => { const n = qgenNums(g.q); return n.length === 2 && String(n[0] + n[1]) === g.answer && (n[0] % 10) + n[1] >= 10; },
  'add-2d-carry': (g) => { const n = qgenNums(g.q); return n.length === 2 && String(n[0] + n[1]) === g.answer && (n[0] % 10) + (n[1] % 10) >= 10; },
  'add-3d': (g) => { const n = qgenNums(g.q); return n.length === 2 && String(n[0] + n[1]) === g.answer && n[0] >= 100 && n[1] >= 100; },
  'mul-2d': (g) => { const n = qgenNums(g.q); return n.length === 2 && (n[0] * n[1]) + '支' === g.answer; },
  'rect-area': (g) => { const n = qgenNums(g.q); return n.length === 2 && g.answer === '面积 ' + (n[0] * n[1]) + ' 平方米，周长 ' + (2 * (n[0] + n[1])) + ' 米'; },
  'frac-add': (g) => { const m = g.q.match(/(\d+)\/(\d+) \+ (\d+)\/(\d+)/); if (!m) return false;
    const num = (+m[1]) * (+m[4]) + (+m[3]) * (+m[2]), den = (+m[2]) * (+m[4]);
    return g.answer === qgenFracT(num, den) && num <= den; },
  'dec-mul': (g) => { const m = g.q.match(/0\.(\d) × 0\.(\d)/); if (!m) return false;
    const p = (+m[1]) * (+m[2]);
    const expect = p < 10 ? '0.0' + p : (p % 10 === 0 ? '0.' + (p / 10) : '0.' + p);
    return g.answer === expect; },
  'eq-2step': (g) => { const m = g.q.match(/(\d+)x \+ (\d+) = (\d+)/); if (!m) return false;
    const x = ((+m[3]) - (+m[2])) / (+m[1]);
    return Number.isInteger(x) && x >= 2 && g.answer === 'x = ' + x; },
  'frac-mul': (g) => { const m = g.q.match(/(\d+)\/(\d+) × (\d+)\/(\d+)/); if (!m) return false;
    return g.answer === qgenFracT((+m[1]) * (+m[3]), (+m[2]) * (+m[4])); },
  'quad-factor': (g) => { const m = g.q.match(/x²([+-]\d+)x([+-]\d+) = 0/); if (!m) return false;
    const b = +m[1], c = +m[2];
    const rm = g.answer.match(/x = (-?\d+) 或 x = (-?\d+)/); if (!rm) return false;
    const r = +rm[1], s = +rm[2];
    return r < s && r + s === -b && r * s === c && r !== 0 && s !== 0; },
};
const QGEN_TYPES = Object.keys(QGEN_VERIFY);
let qgenOk = true, qgenDistinctOk = true, qgenMetaOk = true;
QGEN_TYPES.forEach(t => {
  const keys = [];
  for (let i = 0; i < 20; i++) {
    const g = sandbox.qgenGenerate(t);
    if (!g || g.type !== t || !g.pointId || !g.level || !g.q || !g.answer || !g.hint) { qgenMetaOk = false; break; }
    if (!QGEN_VERIFY[t](g)) { qgenOk = false; console.log('  qgen wrong answer: ' + t + ' :: ' + g.q + ' => ' + g.answer); break; }
    keys.push(g.q);
    // 连续 9 次内不重复：qgenRecent 窗口是 8，所以最近 9 个题面必须全不同。
    if (keys.length >= 9) {
      const win = keys.slice(-9);
      if (new Set(win).size !== 9) { qgenDistinctOk = false; console.log('  qgen repeat in window: ' + t + ' :: ' + win.join(' | ')); break; }
    }
  }
});
check('N qgen: 10 types x 20 generations, answers recomputed from the question text', qgenOk);
check('N qgen: no repeat within any 9 consecutive generations (recent-8 window)', qgenDistinctOk);
check('N qgen: every generation carries type/pointId/level/q/answer/hint', qgenMetaOk);
// 覆盖面：10 个题型分属 7 个年级，知识点归属和难度照原题（1.15/2.2/3.2/3.11/3.12 基础，5.11 提高，5.1/6.1/7.6/9.1 基础）。
const QGEN_POINTS = { 'add-2d-1d': ['1.15', '基础'], 'add-2d-carry': ['2.2', '基础'], 'add-3d': ['3.2', '基础'], 'mul-2d': ['3.11', '基础'], 'rect-area': ['3.12', '基础'], 'frac-add': ['5.11', '提高'], 'dec-mul': ['5.1', '基础'], 'eq-2step': ['7.6', '基础'], 'frac-mul': ['6.1', '基础'], 'quad-factor': ['9.1', '基础'] };
check('N qgen: 10 types map to 7 grades with the original pointId + level',
  QGEN_TYPES.length === 10 &&
  QGEN_TYPES.every(t => { const g = sandbox.qgenGenerate(t); return g.pointId === QGEN_POINTS[t][0] && g.level === QGEN_POINTS[t][1]; }) &&
  new Set(QGEN_TYPES.map(t => QGEN_POINTS[t][0].split('.')[0])).size === 7);
// 练一练：有生成器的知识点页出现“换数字再练”块，原题还在；无生成器的点（3.7）没有这块。
navGo('point-3.12');
check('N qgen: point 3.12 shows 换数字再练 block next to the original questions',
  pointDetail.innerHTML.includes('换数字再练') && pointDetail.innerHTML.includes('换一题') &&
  pointDetail.innerHTML.includes('4 行 3 列是多少个方块？') && pointDetail.innerHTML.includes('data-qa="g"'));
navGo('point-3.7');
check('N qgen: point 3.7 without a generator shows no 换数字再练 block',
  !pointDetail.innerHTML.includes('换数字再练'));
// 换一题：点一下，块里的题面换成另一组数字（不碰原题）；再点“看答案”能看到答案，
// 自评“答对了 + 有把握”后，3.12 正常进复习库（和原题自评同一条路）。
navGo('point-3.12');
const qgenBox = pointDetail.querySelector('[data-qgen-box]');
qgenBox.innerHTML = 'BEFORE-SENTINEL';
const againBtn = makeEl('button'); againBtn.dataset.qgenAgain = '1';
clickPD(againBtn);
check('N qgen: 换一题 swaps the generated question in place',
  qgenBox.innerHTML.includes('换数字再练') && !qgenBox.innerHTML.includes('BEFORE-SENTINEL'));
const gAns = pointDetail.querySelector('[data-qa-a="g"]'); gAns.hidden = true;
const gBtn = makeEl('button'); gBtn.dataset.qa = 'g';
clickPD(gBtn);
check('N qgen: generated question 看答案 reveals the computed answer', gAns.hidden === false);
const gRow = pointDetail.querySelector('[data-qa-mark="g"]');
gRow.dataset.point = '3.12'; gRow.dataset.qaMark = 'g';
const gMark = makeEl('button'); gMark.dataset.mark = 'right';
const gConf = makeEl('button'); gConf.dataset.conf = 'yes';
gMark.closest = (sel) => sel === '[data-mark]' ? gMark : (sel === '[data-qa-mark]' ? gRow : null);
gConf.closest = (sel) => sel === '[data-conf]' ? gConf : (sel === '[data-qa-mark]' ? gRow : null);
clickPD(gMark); clickPD(gConf);
const gStored = JSON.parse(lsData['math-review-v1'] || '{}');
check('N qgen: self-mark on a generated question enters the review store for 3.12',
  gStored['3.12'] && gStored['3.12'].correct === true && gStored['3.12'].streak >= 1);
// 混着练：Math.random 固定为 0.4（< 0.5），有生成器的点必用换数字题；3 年级桩内容里 3.12 在列。
const origRandom2 = Math.random;
Math.random = () => 0.4;
navGo('grade-3-mix');
check('N qgen: mix uses a generated variant for a point that has one (3.12)',
  pointDetail.innerHTML.includes('换数字再练') && pointDetail.innerHTML.includes('混着练'));
Math.random = origRandom2;

// ---------- O. G8 修复 + 计数统一 + 错题原数重做 ----------
// 特殊的平行四边形：正方形状态下，对角线步进器显示按边长算出来的真值 8.49，
// 侧边显示 6，不再和图上（对角线 6√2、边长 6）打架；不决定图形的步进器禁用。
function clickSp(el) { (el._handlers.click || []).forEach(f => f()); }
if (byId.spRectBtn.getAttribute('aria-pressed') !== 'true') clickSp(byId.spRectBtn);
if (byId.spRhomBtn.getAttribute('aria-pressed') !== 'true') clickSp(byId.spRhomBtn);
check('specialquad: square state shows computed diagonals 8.49 and side 6, steppers disabled',
  byId.spD1Tx.textContent.includes('对角线 1 = 8.49') && byId.spD2Tx.textContent.includes('对角线 2 = 8.49') &&
  byId.spBTx.textContent.includes('侧边 = 6') &&
  byId.spD1Minus.disabled === true && byId.spD2Minus.disabled === true && byId.spBMinus.disabled === true &&
  byId.spAMinus.disabled === false);
check('specialquad: square read says diagonals are 6√2 ≈ 8.49',
  byId.spRead.textContent.includes('8.49'));
// 菱形状态：对角线 6、8 时边长是 5，底边/侧边显示 5 且禁用；对角线能调。
clickSp(byId.spRectBtn);
check('specialquad: rhombus state shows computed side 5, diagonals adjustable',
  byId.spATx.textContent.includes('底边 = 5') && byId.spBTx.textContent.includes('侧边 = 5') &&
  byId.spAMinus.disabled === true && byId.spD1Minus.disabled === false &&
  byId.spRead.textContent.includes('边长是 5'));
clickSp(byId.spRhomBtn);
check('specialquad: back to parallelogram, sides adjustable again',
  byId.spATx.textContent.includes('底边 = 6') && byId.spBTx.textContent.includes('侧边 = 4') &&
  byId.spAMinus.disabled === false && byId.spBMinus.disabled === false);

// 全等三角形：SSA 形状二的第三边 2.49 也要标在右图上（改前右边三个标签全是空的）。
function clickCg(el) { (el._handlers.click || []).forEach(f => f()); }
clickCg(byId.cgCondSeg.children.find(b => b.dataset.cgCond === 'ssa'));
clickCg(byId.cgSsaSeg.children.find(b => b.dataset.cgSsa === '2'));
check('congruent: SSA shape 2 labels its third side 2.49 on the right triangle',
  byId.cgLabE && byId.cgLabE.textContent === '2.49');
check('congruent: SSA shape 2 labels all three right sides (5, 2.49, 7)',
  byId.cgLabD && byId.cgLabD.textContent === '5' && byId.cgLabF && byId.cgLabF.textContent === '7');

// 计数统一：别的标签页改了已体验记录（这里模拟少一条），顶栏、面板、进度页、
// 家长端必须同数——改前顶栏读内存集合、家长端现读存储，两边分叉。
const triedBefore = JSON.parse(lsData['math-tried-demos-v1'] || '[]');
const simTried = triedBefore.length ? triedBefore.slice(1) : ['tenframe'];
const nTried = simTried.length;
lsData['math-tried-demos-v1'] = JSON.stringify(simTried);
sandbox.renderTried();
navGo('parent');
check('counter: topbar, panels, progress and parent agree after another tab writes',
  byId.progressCount.textContent.includes(nTried + ' / ' + TOTAL_DEMOS) &&
  byId.panelProgTx.textContent.includes(nTried + ' / ' + TOTAL_DEMOS) &&
  byId.panelDemoTx.textContent.includes(nTried + ' 已体验') &&
  byId.progressText.textContent.includes('已体验 ' + nTried + ' / ' + TOTAL_DEMOS) &&
  byId.parentCard.innerHTML.includes('演示一共玩过 ' + nTried + ' / ' + TOTAL_DEMOS + ' 个'));
lsData['math-tried-demos-v1'] = JSON.stringify(triedBefore);
sandbox.renderTried();
navGo('home');

// 两位数乘两位数：因数不取整十数（20×24 这种太容易）。50 次生成里两个因数都不能是整十数。
let mul2dOk = true;
for (let i = 0; i < 50; i++) {
  const g = sandbox.qgenGenerate('mul-2d');
  const m = g.q.match(/每盒装 (\d+) 支笔，买 (\d+) 盒/);
  if (!m || (+m[1]) % 10 === 0 || (+m[2]) % 10 === 0) mul2dOk = false;
}
check('N qgen: mul-2d factors are never multiples of 10', mul2dOk);

// 错题原数重做：换数字题答错了，下次回来先重做当初错的那组数字，
// 而不是换一组新的——错题本就是这个道理。答对了清掉，换一题只换当前显示。
navGo('point-3.12');
const q1 = sandbox.qgenShown && sandbox.qgenShown['3.12'] && sandbox.qgenShown['3.12'].q;
const gAns2 = pointDetail.querySelector('[data-qa-a="g"]'); gAns2.hidden = true;
const gBtn2 = makeEl('button'); gBtn2.dataset.qa = 'g';
clickPD(gBtn2);
const gRow2 = pointDetail.querySelector('[data-qa-mark="g"]');
gRow2.dataset.point = '3.12'; gRow2.dataset.qaMark = 'g';
const gMarkW = makeEl('button'); gMarkW.dataset.mark = 'wrong';
const gConfN = makeEl('button'); gConfN.dataset.conf = 'no';
gMarkW.closest = (sel) => sel === '[data-mark]' ? gMarkW : (sel === '[data-qa-mark]' ? gRow2 : null);
gConfN.closest = (sel) => sel === '[data-conf]' ? gConfN : (sel === '[data-qa-mark]' ? gRow2 : null);
clickPD(gMarkW); clickPD(gConfN);
check('N qgen: marking a generated question wrong stores its exact numbers',
  JSON.parse(lsData['math-qgen-failed-v1'] || '{}')['3.12'] &&
  JSON.parse(lsData['math-qgen-failed-v1'] || '{}')['3.12'].q === q1);
navGo('home');
navGo('point-3.12');
check('N qgen: revisiting the point replays the exact missed numbers, not a fresh variant',
  sandbox.qgenShown && sandbox.qgenShown['3.12'] && sandbox.qgenShown['3.12'].q === q1 &&
  pointDetail.innerHTML.includes('上次做错的那道题'));
const againBtn2 = makeEl('button'); againBtn2.dataset.qgenAgain = '1';
clickPD(againBtn2);
const q2 = sandbox.qgenShown && sandbox.qgenShown['3.12'] && sandbox.qgenShown['3.12'].q;
check('N qgen: 换一题 shows a fresh variant while the missed one stays stored',
  q2 && q2 !== q1 && JSON.parse(lsData['math-qgen-failed-v1'] || '{}')['3.12'].q === q1);
navGo('home');
navGo('point-3.12');
check('N qgen: after 换一题, revisiting still replays the missed numbers first',
  sandbox.qgenShown && sandbox.qgenShown['3.12'] && sandbox.qgenShown['3.12'].q === q1);
const gAns3 = pointDetail.querySelector('[data-qa-a="g"]'); gAns3.hidden = true;
const gBtn3 = makeEl('button'); gBtn3.dataset.qa = 'g';
clickPD(gBtn3);
const gRow3 = pointDetail.querySelector('[data-qa-mark="g"]');
gRow3.dataset.point = '3.12'; gRow3.dataset.qaMark = 'g';
const gMarkR = makeEl('button'); gMarkR.dataset.mark = 'right';
const gConfY = makeEl('button'); gConfY.dataset.conf = 'yes';
gMarkR.closest = (sel) => sel === '[data-mark]' ? gMarkR : (sel === '[data-qa-mark]' ? gRow3 : null);
gConfY.closest = (sel) => sel === '[data-conf]' ? gConfY : (sel === '[data-qa-mark]' ? gRow3 : null);
clickPD(gMarkR); clickPD(gConfY);
check('N qgen: marking the replayed question right clears the stored miss',
  !JSON.parse(lsData['math-qgen-failed-v1'] || '{}')['3.12']);
navGo('home');
navGo('point-3.12');
check('N qgen: after clearing, the point shows a fresh variant again',
  sandbox.qgenShown && sandbox.qgenShown['3.12'] && sandbox.qgenShown['3.12'].q !== q1 &&
  !pointDetail.innerHTML.includes('上次做错的那道题'));
// 错题原数重做（只点对错）：只点“答错了”不点“有没有把握”，也要记下当初那组数字——
// 改前存错题的逻辑在“对错和把握都点了”里面，只点对错就什么都不存，下次回来还是新题
// （真机复测：66×31 答错后重开变 61×26）。
// 注意：不用 3.12 测这条——它在本节前面已经被点过“答对+有把握”，qaState 里还留着
// confident=true，改前代码也会顺着这条漏网的把握把错题存下来，检查就测不出问题。
// 9.1 在本轮之前从没被点过自评，状态是干净的。
navGo('point-9.1');
const q1w = sandbox.qgenShown && sandbox.qgenShown['9.1'] && sandbox.qgenShown['9.1'].q;
const gAnsW = pointDetail.querySelector('[data-qa-a="g"]'); gAnsW.hidden = true;
const gBtnW = makeEl('button'); gBtnW.dataset.qa = 'g';
clickPD(gBtnW);
const gRowW = pointDetail.querySelector('[data-qa-mark="g"]');
gRowW.dataset.point = '9.1'; gRowW.dataset.qaMark = 'g';
const gMarkW2 = makeEl('button'); gMarkW2.dataset.mark = 'wrong';
gMarkW2.closest = (sel) => sel === '[data-mark]' ? gMarkW2 : (sel === '[data-qa-mark]' ? gRowW : null);
clickPD(gMarkW2); // 注意：不点 confidence
check('N qgen: marking wrong WITHOUT confidence still stores the exact numbers',
  JSON.parse(lsData['math-qgen-failed-v1'] || '{}')['9.1'] &&
  JSON.parse(lsData['math-qgen-failed-v1'] || '{}')['9.1'].q === q1w);
navGo('home');
navGo('point-9.1');
check('N qgen: wrong-only miss replays from the point page with the note',
  sandbox.qgenShown && sandbox.qgenShown['9.1'] && sandbox.qgenShown['9.1'].q === q1w &&
  pointDetail.innerHTML.includes('上次做错的那道题'));
// 清掉，免得污染后面的检查。
const gAnsW2 = pointDetail.querySelector('[data-qa-a="g"]'); gAnsW2.hidden = true;
const gBtnW2 = makeEl('button'); gBtnW2.dataset.qa = 'g';
clickPD(gBtnW2);
const gRowW2 = pointDetail.querySelector('[data-qa-mark="g"]');
gRowW2.dataset.point = '9.1'; gRowW2.dataset.qaMark = 'g';
const gMarkRW = makeEl('button'); gMarkRW.dataset.mark = 'right';
const gConfYW = makeEl('button'); gConfYW.dataset.conf = 'yes';
gMarkRW.closest = (sel) => sel === '[data-mark]' ? gMarkRW : (sel === '[data-qa-mark]' ? gRowW2 : null);
gConfYW.closest = (sel) => sel === '[data-conf]' ? gConfYW : (sel === '[data-qa-mark]' ? gRowW2 : null);
clickPD(gMarkRW); clickPD(gConfYW);
check('N qgen: wrong-only miss cleared after answering it right',
  !JSON.parse(lsData['math-qgen-failed-v1'] || '{}')['9.1']);
// 混着练里的换数字题答错了，也要记下当初那组数字——改前混着练的自评行 data-qa-mark 是题号
// （不是 'g'），又没记 mixShown，答错只进了复习库、数字丢了；重开知识点页总是新题
// （真机复测 7edb765：3.11 的 47×29 答错后重开变 35×68、48×74，全无“上次做错”提示）。
// 先把复习库和错题键拍个快照，查完还回去，免得污染后面的检查。
const mixReviewBefore = lsData['math-review-v1'];
const mixFailedBefore = lsData['math-qgen-failed-v1'];
const origRandom3 = Math.random;
Math.random = () => 0.4;
navGo('grade-3-mix');
Math.random = origRandom3;
const mixPids = Object.keys(sandbox.mixShown || {});
check('N qgen: mix shows at least one generated question with fixed random',
  mixPids.length >= 1 && pointDetail.innerHTML.includes('换数字再练'));
if (mixPids.length) {
  const mixPid = mixPids[0];
  const mixQ = sandbox.mixShown[mixPid].q;
  // 题面里找这条换数字题的自评行序号：data-qa-mark="N" data-point="pid"。
  const mixRowM = pointDetail.innerHTML.match(new RegExp('data-qa-mark="(\\d+)" data-point="' + mixPid.replace('.', '\\.') + '"'));
  const mixIdx = mixRowM ? mixRowM[1] : null;
  check('N qgen: mix generated question has a mark row', mixIdx !== null);
  const mixRow = pointDetail.querySelector('[data-qa-mark="' + mixIdx + '"]');
  mixRow.dataset.point = mixPid; mixRow.dataset.qaMark = mixIdx; mixRow.dataset.qgen = '1';
  const mixMarkW = makeEl('button'); mixMarkW.dataset.mark = 'wrong';
  const mixConfN = makeEl('button'); mixConfN.dataset.conf = 'no';
  mixMarkW.closest = (sel) => sel === '[data-mark]' ? mixMarkW : (sel === '[data-qa-mark]' ? mixRow : null);
  mixConfN.closest = (sel) => sel === '[data-conf]' ? mixConfN : (sel === '[data-qa-mark]' ? mixRow : null);
  clickPD(mixMarkW); clickPD(mixConfN);
  check('N qgen: marking a generated MIX question wrong stores its exact numbers',
    JSON.parse(lsData['math-qgen-failed-v1'] || '{}')[mixPid] &&
    JSON.parse(lsData['math-qgen-failed-v1'] || '{}')[mixPid].q === mixQ);
  navGo('home');
  navGo('point-' + mixPid);
  check('N qgen: mix-missed question replays from the point page with the note',
    sandbox.qgenShown && sandbox.qgenShown[mixPid] && sandbox.qgenShown[mixPid].q === mixQ &&
    pointDetail.innerHTML.includes('上次做错的那道题'));
  // 答对清掉（走练一练的 'g' 行），再把复习库和错题键还回快照。
  const mixAns = pointDetail.querySelector('[data-qa-a="g"]'); mixAns.hidden = true;
  const mixBtn = makeEl('button'); mixBtn.dataset.qa = 'g';
  clickPD(mixBtn);
  const mixRowG = pointDetail.querySelector('[data-qa-mark="g"]');
  mixRowG.dataset.point = mixPid; mixRowG.dataset.qaMark = 'g';
  const mixMarkR = makeEl('button'); mixMarkR.dataset.mark = 'right';
  const mixConfY = makeEl('button'); mixConfY.dataset.conf = 'yes';
  mixMarkR.closest = (sel) => sel === '[data-mark]' ? mixMarkR : (sel === '[data-qa-mark]' ? mixRowG : null);
  mixConfY.closest = (sel) => sel === '[data-conf]' ? mixConfY : (sel === '[data-qa-mark]' ? mixRowG : null);
  clickPD(mixMarkR); clickPD(mixConfY);
  check('N qgen: mix-missed question cleared after answering it right',
    !JSON.parse(lsData['math-qgen-failed-v1'] || '{}')[mixPid]);
}
lsData['math-review-v1'] = mixReviewBefore;
lsData['math-qgen-failed-v1'] = mixFailedBefore;
if (typeof sandbox.syncReviewFromStorage === 'function') sandbox.syncReviewFromStorage();
// 错题本跨标签页同步：别的窗口记了一笔错题，这边同步后错题本立刻跟上——
// 改前 reviewStore 只在启动时读一次，storage 事件只同步演示进度，
// 两个窗口的错题数会分叉（真机复测 7edb765：新开的标签页 5 条，原标签页 4 条）。
// 断言用“当前数 +1”：写死 5 条会在旧代码上偶然通过（当时库里正好 5 条错题）。
const wbBefore = lsData['math-review-v1'];
navGo('review');
const wbM = byId.reviewCard.innerHTML.match(/共 (\d+) 条错题/);
const wbN = wbM ? +wbM[1] : 0;
const wbCur = JSON.parse(lsData['math-review-v1'] || '{}');
const wbFreshId = ['1.13', '1.8', '3.3', '1.2'].find(id => !wbCur[id]) || '1.13';
wbCur[wbFreshId] = { last: Date.now(), correct: false, confident: false, streak: 0, due: Date.now() + 86400000 };
lsData['math-review-v1'] = JSON.stringify(wbCur);
// 注意：这里故意不调 syncReviewFromStorage()——错题本打开时自己就要重读存储；
// 改前 renderWrongBook 只读内存里的旧份，数就对不上。
navGo('review');
check('wrongbook: sync from another tab updates the wrong-book count',
  byId.reviewCard.innerHTML.includes('共 ' + (wbN + 1) + ' 条错题'));
lsData['math-review-v1'] = wbBefore;
if (typeof sandbox.syncReviewFromStorage === 'function') sandbox.syncReviewFromStorage();
// 跨标签页写：别的窗口记了一笔，这边再记一笔时不能盖掉别人的——
// 改前 recordAttempt 只写内存里的那份，后写盖掉先写。
const raBefore = lsData['math-review-v1'];
const raCur = JSON.parse(raBefore || '{}');
const raOtherId = ['1.13', '1.8', '3.3', '1.2'].find(id => !raCur[id]) || '1.13';
raCur[raOtherId] = { last: Date.now(), correct: false, confident: false, streak: 0, due: Date.now() + 86400000 };
lsData['math-review-v1'] = JSON.stringify(raCur);
navGo('point-3.12');
const raAns = pointDetail.querySelector('[data-qa-a="g"]'); raAns.hidden = true;
const raBtn = makeEl('button'); raBtn.dataset.qa = 'g';
clickPD(raBtn);
const raRow = pointDetail.querySelector('[data-qa-mark="g"]');
raRow.dataset.point = '3.12'; raRow.dataset.qaMark = 'g';
const raMark = makeEl('button'); raMark.dataset.mark = 'right';
const raConf = makeEl('button'); raConf.dataset.conf = 'yes';
raMark.closest = (sel) => sel === '[data-mark]' ? raMark : (sel === '[data-qa-mark]' ? raRow : null);
raConf.closest = (sel) => sel === '[data-conf]' ? raConf : (sel === '[data-qa-mark]' ? raRow : null);
clickPD(raMark); clickPD(raConf);
const raAfter = JSON.parse(lsData['math-review-v1'] || '{}');
check('review: recordAttempt syncs first, another tab\'s entry survives',
  raAfter[raOtherId] && raAfter[raOtherId].correct === false && raAfter['3.12'] && raAfter['3.12'].correct === true);
lsData['math-review-v1'] = raBefore;
if (typeof sandbox.syncReviewFromStorage === 'function') sandbox.syncReviewFromStorage();

// ---------- 11. 创意实验（8 个新演示，146 个动画（当时）） ----------
const CREATIVE = ['thirteen', 'twentyfour', 'monty', 'maxarea', 'matches', 'mobius', 'shopweek', 'fairgame', 'makerule'];
check('creative: DEMO_LABEL covers all 8 creative demos',
  CREATIVE.every(k => labelSrc9.includes(k + ':')));
check('creative: viewForKey covers all 8 creative demos',
  CREATIVE.every(k => sandbox.viewForKey('demo-' + k) === 'demo-' + k));
check('creative: DEMO_GRADES lists the 8 creative demos in their grades',
  src.includes('twentyfour: [4, 5]') && src.includes('monty: [9]') && src.includes('maxarea: [3, 4, 5]') &&
  src.includes('matches: [3, 4]') && src.includes('mobius: [6, 7]') && src.includes('shopweek: [5, 6]') &&
  src.includes('fairgame: [5]') && src.includes('makerule: [1, 2]') && src.includes('thirteen: [1]'));
check('creative: 8 creative panels + heading on the demos page',
  html.includes('创意实验') && CREATIVE.every(k => html.includes('data-nav-key="demo-' + k + '"')));
function triedCount() { return parseInt(byId.progressCount.textContent.split(' / ')[0], 10); }
// 第 11 节从干净的 tried 表开始数：L 节的夹具为了点亮 1.9 单元，把 thirteen 留在了 tried 表里，
// 这里不清掉，十三的“+1”和最后的“+9”都会因为 thirteen 已在表里而少算。
lsData['math-tried-demos-v1'] = '[]';
sandbox.renderTried();
const triedAtStart = JSON.parse(lsData['math-tried-demos-v1'] || '[]');
function tierLit(container, label) {
  // 桩 DOM 的 textContent 不汇总子元素；三档 chips 是容器的孩子，逐个查。
  for (let i = 0; i < container.children.length; i++) {
    if (container.children[i].textContent.indexOf('✓ ' + label) === 0) return true;
  }
  return false;
}
function findIn(container, sel, key, val) {
  const els = container.querySelectorAll(sel);
  for (let i = 0; i < els.length; i++) if (String(els[i].dataset[key]) === String(val)) return els[i];
  return null;
}

// 13有几种凑法：先猜 4 种，再摆 9+4 和 4+9（换位置也算一种），找全 8 种。
let c13 = triedCount();
navGo('demo-thirteen');
// 桩 DOM 只在 getElementById 时才建元素：改前代码不认 thMsg13/thIntro/thCrit，
// 直接读 byId 会抛错而不是干净失败，先把这几个 id 建出来。
documentStub.getElementById('thMsg13'); documentStub.getElementById('thIntro'); documentStub.getElementById('thCrit');
click(byId.thGuessSet);
check('thirteen: guess recorded before play, total revealed only as / 8',
  byId.thGuessTx.textContent.includes('你猜的是 4 种') && byId.thCount.textContent.includes('/ 8 种'));
function thFill(a, b) {
  click(byId.thClear);
  for (let i = 0; i < a; i++) click(findIn(byId.thFrameA, '#thFrameA [data-th-cell]', 'thCell', 'A-' + i));
  for (let i = 0; i < b; i++) click(findIn(byId.thFrameB, '#thFrameB [data-th-cell]', 'thCell', 'B-' + i));
}
thFill(9, 4);
check('thirteen: 9+4 shows the equation', byId.thEq.textContent.includes('9 + 4 = 13'));
click(byId.thRecord);
check('thirteen: 9+4 recorded with the make-ten note and counts toward progress',
  byId.thMsg13.textContent.includes('记下了：9+4 = 13') && byId.thMsg13.textContent.includes('9 再凑 1 个就是 10') &&
  byId.thFound.textContent.includes('9+4') && triedCount() === c13 + 1);
thFill(4, 9);
click(byId.thRecord);
check('thirteen: 4+9 counts as a different way and notes the swap',
  byId.thMsg13.textContent.includes('记下了：4+9 = 13') && byId.thMsg13.textContent.includes('换了位置') &&
  byId.thCount.textContent.includes('找到了 2 / 8 种'));
thFill(5, 5);
click(byId.thRecord);
check('thirteen: 5+5 is not 13 and is refused', byId.thMsg13.textContent.includes('不是 13'));
[[3, 10], [10, 3], [5, 8], [8, 5], [6, 7], [7, 6]].forEach(function (pr) { thFill(pr[0], pr[1]); click(byId.thRecord); });
check('thirteen: all 8 ordered ways found, why revealed',
  byId.thCount.textContent.includes('找到了 8 / 8 种') && byId.thCount.textContent.includes('找全了') &&
  byId.thWhy.hidden === false);
click(byId.thNewTarget);
check('thirteen: new target is 14', byId.thTargetTx.textContent.includes('14'));
click(byId.thGuessSet);
check('thirteen: guess for 14 reveals / 7', byId.thCount.textContent.includes('/ 7 种'));
thFill(10, 4); click(byId.thRecord);
check('thirteen: 10+4 on target 14 uses the 10-already-ten note',
  byId.thMsg13.textContent.includes('记下了：10+4 = 14') && byId.thMsg13.textContent.includes('10 已经是 10 了'));
// 换目标后，提示、成功条件、三档都要跟当前目标走——改前提示还写 13（其实写到了温度计的
// thMsg 上，十三自己的消息从来没变过），成功条件还是 13，三档全局一个，换到 14 后
// 提高 ✓ 还亮着。
check('thirteen: message id is thMsg13 (no longer collides with the thermometer thMsg)',
  html.includes('id="thMsg13"') && html.split('id="thMsg"').length - 1 === 1 &&
  src.includes("getElementById('thMsg13')"));
check('thirteen: after switching to 14, the intro and criteria follow the target',
  byId.thIntro.innerHTML.includes('14 能拆成几种') && byId.thCrit.textContent.includes('把 14 的凑法找全'));
check('thirteen: tiers are per-target — on 14 with 1 way found, only 基础 is lit',
  tierLit(byId.thTiers, '基础') && !tierLit(byId.thTiers, '提高') && !tierLit(byId.thTiers, '挑战'));
byId.thFind.value = '13 能拆成好多对';
click(byId.thFindSave);
check('thirteen: discovery saved into math-inquiry-v1',
  byId.thFindSaved.textContent.includes('记下来了') &&
  JSON.parse(lsData['math-inquiry-v1'] || '[]').some(function (e) { return e.kind === 'discovery' && e.demo === 'thirteen'; }));
check('thirteen: discovery renders as 我的发现 in the inquiry list, not as homework',
  sandbox.inquiryListHtml([{ kind: 'discovery', taskId: 'thirteen', text: '13 能拆成好多对', demo: 'thirteen', ts: Date.now() }], '空').includes('我的发现') &&
  sandbox.inquiryListHtml([{ kind: 'discovery', taskId: 'thirteen', text: '13 能拆成好多对', demo: 'thirteen', ts: Date.now() }], '空').includes('13有几种凑法') &&
  !sandbox.inquiryListHtml([{ kind: 'discovery', taskId: 'thirteen', text: '13 能拆成好多对', demo: 'thirteen', ts: Date.now() }], '空').includes('探究作业'));

// 24点：每组数的不同拼法数是穷举验算过的（精确分数算术，规范形式判重）——
// 默认第一组 (3,4,5,6) 有 5 种，(3,3,8,8) 只有 1 种真正解法，所以排在最后当挑战。
// 判重按表达式结构：只加括号重写不算第二种（改前只比文本，加括号也算第 2 个）。
function tf24CountSolutions(nums) {
  // 精确分数 + 规范形式的小穷举：和 app.js 的 canonTree 同一个思路，独立实现。
  function gcdT(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; }
  function fr(n, d) { if (d === 0) return null; if (d < 0) { n = -n; d = -d; } const g = gcdT(n, d); return { n: n / g, d: d / g }; }
  function ev(t) {
    if (t.n !== undefined) return fr(t.n, 1);
    const a = ev(t.l), b = ev(t.r);
    if (!a || !b) return null;
    if (t.op === '+') return fr(a.n * b.d + b.n * a.d, a.d * b.d);
    if (t.op === '-') return fr(a.n * b.d - b.n * a.d, a.d * b.d);
    if (t.op === '*') return fr(a.n * b.n, a.d * b.d);
    return fr(a.n * b.d, a.d * b.n);
  }
  function canon(t) {
    if (t.n !== undefined) return 'n' + t.n;
    const cl = canon(t.l), cr = canon(t.r);
    if (t.op === '+' || t.op === '*') { const s = [cl, cr].sort(); return '(' + s[0] + t.op + s[1] + ')'; }
    return '(' + cl + t.op + cr + ')';
  }
  function perms(arr) {
    if (arr.length <= 1) return [arr.slice()];
    const out = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = arr.slice(0, i).concat(arr.slice(i + 1));
      perms(rest).forEach(p => out.push([arr[i]].concat(p)));
    }
    return out;
  }
  function shapes(a, b, c, d) {
    return [
      { op: 'X', l: { op: 'X', l: { op: 'X', l: a, r: b }, r: c }, r: d },
      { op: 'X', l: { op: 'X', l: a, r: { op: 'X', l: b, r: c } }, r: d },
      { op: 'X', l: { op: 'X', l: a, r: b }, r: { op: 'X', l: c, r: d } },
      { op: 'X', l: a, r: { op: 'X', l: { op: 'X', l: b, r: c }, r: d } },
      { op: 'X', l: a, r: { op: 'X', l: b, r: { op: 'X', l: c, r: d } } },
    ];
  }
  const found = new Set();
  perms([0, 1, 2, 3]).forEach(p => {
    const leaves = p.map(i => ({ n: nums[i] }));
    shapes(leaves[0], leaves[1], leaves[2], leaves[3]).forEach(shape => {
      const nodes = [];
      (function walk(t) { if (t.op === 'X') { nodes.push(t); walk(t.l); walk(t.r); } })(shape);
      ['+', '-', '*', '/'].forEach(o1 => ['+', '-', '*', '/'].forEach(o2 => ['+', '-', '*', '/'].forEach(o3 => {
        nodes[0].op = o1; nodes[1].op = o2; nodes[2].op = o3;
        const v = ev(shape);
        if (v && v.n === 24 * v.d) found.add(canon(shape));
      })));
    });
  });
  return found.size;
}
const tf24Sets = [...src.matchAll(/nums: \[([\d, ]+)\]/g)].map(m => m[1].split(',').map(Number));
const tf24Hard = tf24Sets.find(s => s.join(',') === '3,3,8,8') || [0, 0, 0, 0];
check('twentyfour: 6 sets in the source, each has a solution, default has 2+, 3 3 8 8 has exactly 1',
  tf24Sets.length === 6 && tf24Sets.every(s => tf24CountSolutions(s) >= 1) &&
  tf24CountSolutions(tf24Sets[0]) >= 2 && tf24CountSolutions(tf24Hard) === 1);
let c0 = triedCount();
navGo('demo-twentyfour');
check('twentyfour: first set is 3 4 5 6', byId.tf24Nums.textContent === '3　4　5　6' &&
  byId.tf24NumRow.children.length === 4);
click(byId.tf24PredNo);
check('twentyfour: prediction recorded', byId.tf24PredTx.textContent.includes('拼不出 24'));
// 默认组第一种拼法：(3+5−4)×6 = 24。
click(findIn(byId.tf24OpRow, '#tf24OpRow [data-tf24-op]', 'tf24Op', '('));
click(findIn(byId.tf24NumRow, '#tf24NumRow [data-tf24-num]', 'tf24Num', 0));
click(findIn(byId.tf24OpRow, '#tf24OpRow [data-tf24-op]', 'tf24Op', '+'));
click(findIn(byId.tf24NumRow, '#tf24NumRow [data-tf24-num]', 'tf24Num', 2));
click(findIn(byId.tf24OpRow, '#tf24OpRow [data-tf24-op]', 'tf24Op', '−'));
click(findIn(byId.tf24NumRow, '#tf24NumRow [data-tf24-num]', 'tf24Num', 1));
click(findIn(byId.tf24OpRow, '#tf24OpRow [data-tf24-op]', 'tf24Op', ')'));
click(findIn(byId.tf24OpRow, '#tf24OpRow [data-tf24-op]', 'tf24Op', '×'));
click(findIn(byId.tf24NumRow, '#tf24NumRow [data-tf24-num]', 'tf24Num', 3));
click(byId.tf24Calc);
check('twentyfour: (3+5-4)x6 counts as 24, wrong prediction called out, tiers lit',
  byId.tf24Msg.textContent.includes('拼出来了') && byId.tf24Found.textContent.includes('1 种') &&
  byId.tf24Msg.textContent.includes('你猜错了') &&
  tierLit(byId.tf24Tiers, '基础') && triedCount() === c0 + 1);
// 同一组第二种真正不同的拼法：(5−(4−3))×6 = 24。
click(byId.tf24Clear);
click(findIn(byId.tf24OpRow, '#tf24OpRow [data-tf24-op]', 'tf24Op', '('));
click(findIn(byId.tf24NumRow, '#tf24NumRow [data-tf24-num]', 'tf24Num', 2));
click(findIn(byId.tf24OpRow, '#tf24OpRow [data-tf24-op]', 'tf24Op', '−'));
click(findIn(byId.tf24OpRow, '#tf24OpRow [data-tf24-op]', 'tf24Op', '('));
click(findIn(byId.tf24NumRow, '#tf24NumRow [data-tf24-num]', 'tf24Num', 1));
click(findIn(byId.tf24OpRow, '#tf24OpRow [data-tf24-op]', 'tf24Op', '−'));
click(findIn(byId.tf24NumRow, '#tf24NumRow [data-tf24-num]', 'tf24Num', 0));
click(findIn(byId.tf24OpRow, '#tf24OpRow [data-tf24-op]', 'tf24Op', ')'));
click(findIn(byId.tf24OpRow, '#tf24OpRow [data-tf24-op]', 'tf24Op', ')'));
click(findIn(byId.tf24OpRow, '#tf24OpRow [data-tf24-op]', 'tf24Op', '×'));
click(findIn(byId.tf24NumRow, '#tf24NumRow [data-tf24-num]', 'tf24Num', 3));
click(byId.tf24Calc);
check('twentyfour: a second, structurally different solution (5-(4-3))x6 is accepted',
  byId.tf24Msg.textContent.includes('拼出来了') && byId.tf24Found.textContent.includes('2 种') &&
  byId.tf24Found.textContent.includes('够两种了') && tierLit(byId.tf24Tiers, '提高'));
// 只加括号重写第一种拼法：((3+5)−4)×6 和 (3+5−4)×6 是同一棵树，不算第二种。
click(byId.tf24Clear);
click(findIn(byId.tf24OpRow, '#tf24OpRow [data-tf24-op]', 'tf24Op', '('));
click(findIn(byId.tf24OpRow, '#tf24OpRow [data-tf24-op]', 'tf24Op', '('));
click(findIn(byId.tf24NumRow, '#tf24NumRow [data-tf24-num]', 'tf24Num', 0));
click(findIn(byId.tf24OpRow, '#tf24OpRow [data-tf24-op]', 'tf24Op', '+'));
click(findIn(byId.tf24NumRow, '#tf24NumRow [data-tf24-num]', 'tf24Num', 2));
click(findIn(byId.tf24OpRow, '#tf24OpRow [data-tf24-op]', 'tf24Op', ')'));
click(findIn(byId.tf24OpRow, '#tf24OpRow [data-tf24-op]', 'tf24Op', '−'));
click(findIn(byId.tf24NumRow, '#tf24NumRow [data-tf24-num]', 'tf24Num', 1));
click(findIn(byId.tf24OpRow, '#tf24OpRow [data-tf24-op]', 'tf24Op', ')'));
click(findIn(byId.tf24OpRow, '#tf24OpRow [data-tf24-op]', 'tf24Op', '×'));
click(findIn(byId.tf24NumRow, '#tf24NumRow [data-tf24-num]', 'tf24Num', 3));
click(byId.tf24Calc);
check('twentyfour: a parenthesised rewrite of the first solution is rejected as a duplicate',
  byId.tf24Msg.textContent.includes('这个拼法已经记下了') && byId.tf24Found.textContent.includes('2 种'));
// 挑战：换到 3 3 8 8（第 6 组），不用提示拼出 8÷(3−8÷3)=24
// （浮点是 23.99999999999999，靠 1e-6 容差认出来）。
for (let i = 0; i < 5; i++) click(byId.tf24New);
check('twentyfour: 5 switches reach 3 3 8 8', byId.tf24Nums.textContent === '3　3　8　8');
click(findIn(byId.tf24NumRow, '#tf24NumRow [data-tf24-num]', 'tf24Num', 2));
click(findIn(byId.tf24OpRow, '#tf24OpRow [data-tf24-op]', 'tf24Op', '÷'));
click(findIn(byId.tf24OpRow, '#tf24OpRow [data-tf24-op]', 'tf24Op', '('));
click(findIn(byId.tf24NumRow, '#tf24NumRow [data-tf24-num]', 'tf24Num', 0));
click(findIn(byId.tf24OpRow, '#tf24OpRow [data-tf24-op]', 'tf24Op', '−'));
click(findIn(byId.tf24NumRow, '#tf24NumRow [data-tf24-num]', 'tf24Num', 3));
click(findIn(byId.tf24OpRow, '#tf24OpRow [data-tf24-op]', 'tf24Op', '÷'));
click(findIn(byId.tf24NumRow, '#tf24NumRow [data-tf24-num]', 'tf24Num', 1));
click(findIn(byId.tf24OpRow, '#tf24OpRow [data-tf24-op]', 'tf24Op', ')'));
click(byId.tf24Calc);
check('twentyfour: 8÷(3−8÷3) counts as 24 with no hint, challenge tier lit',
  byId.tf24Msg.textContent.includes('拼出来了') && byId.tf24Found.textContent.includes('1 种') &&
  tierLit(byId.tf24Tiers, '挑战'));
byId.tf24Find.value = '24 点没有标准答案，顺序最重要';
click(byId.tf24FindSave);
check('twentyfour: discovery saved', byId.tf24FindSaved.textContent.includes('记下来了'));

// 三门问题：固定种子模拟换门赢 68 次、不换赢 36 次；预测“不换更好”会被打脸。
c0 = triedCount();
navGo('demo-monty');
documentStub.getElementById('moCrit'); // 改前代码不认这个 id，直接读 byId 会抛错而不是干净失败
check('monty: three doors', byId.moDoors.children.length === 3);
check('monty: why + success criteria are hidden in the markup until the sim runs (no spoiler before predicting)',
  html.includes('id="moWhyStatic" hidden') && html.includes('id="moCrit" hidden'));
click(byId.moPredStay);
click(byId.moSim);
check('monty: seeded 100-round sim says switch wins 68, stay wins 36',
  byId.moSimOut.textContent.includes('换门赢了 68 次') && byId.moSimOut.textContent.includes('不换赢了 36 次') &&
  byId.moWhy.textContent.includes('你的预测错了') && byId.moWhyStatic.hidden === false && byId.moCrit.hidden === false && triedCount() === c0 + 1);
click(findIn(byId.moDoors, '#moDoors [data-mo-door]', 'moDoor', 0));
check('monty: host opens a goat door after the first pick', byId.moRound.textContent.includes('主持人打开了'));
click(byId.moStay);
check('monty: staying reveals the prize door', byId.moRound.textContent.includes('汽车在'));
check('monty: scoreboard tracks the played round',
  byId.moScore.textContent.includes('换门：0 胜 0 负') &&
  (byId.moScore.textContent.includes('不换：1 胜 0 负') || byId.moScore.textContent.includes('不换：0 胜 1 负')));
byId.moFind.value = '换门赢的可能大约是 2/3';
click(byId.moFindSave);
check('monty: discovery saved', byId.moFindSaved.textContent.includes('记下来了'));

// 周长一定面积最大：默认长 8（不是正方形），先猜长 7，再试出长 5 宽 5 面积 25 最大；再换周长 24。
c0 = triedCount();
navGo('demo-maxarea');
check('maxarea: default L=8 is not the square (8×2=16)', byId.maEq.textContent.includes('长 8 厘米，宽 2 厘米，面积 16 平方厘米'));
click(byId.maLMinus);
check('maxarea: L=7 gives 7×3=21', byId.maEq.textContent.includes('长 7 厘米，宽 3 厘米，面积 21 平方厘米'));
click(byId.maGuessSet);
check('maxarea: guess recorded', byId.maGuessTx.textContent.includes('长 7 厘米'));
click(byId.maRecord);
click(byId.maLPlus);
click(byId.maRecord);
click(byId.maLMinus); click(byId.maLMinus);
click(byId.maRecord);
click(byId.maLMinus);
click(byId.maRecord);
check('maxarea: after 4 recorded rows incl. 5×5, discovery names the square and the wrong guess',
  byId.maFind.textContent.includes('最大面积是 25') && byId.maFind.textContent.includes('长 5 宽 5') &&
  byId.maFind.textContent.includes('你猜的是长 7') && byId.maWhy.hidden === false &&
  tierLit(byId.maTiers, '提高') && triedCount() === c0 + 1);
// 周长 24：正方形是 6×6=36，找全两个周长才算挑战。
click(byId.maP24);
check('maxarea: perimeter 24 switches the range', byId.maPTx.textContent.includes('24 厘米') && byId.maEq.textContent.includes('宽 7 厘米'));
click(byId.maLPlus);
click(byId.maRecord);
click(byId.maLMinus); click(byId.maLMinus);
click(byId.maRecord);
click(byId.maLPlus); click(byId.maLPlus); click(byId.maLPlus);
click(byId.maRecord);
check('maxarea: perimeter 24 square 6×6=36 found, challenge tier lit',
  byId.maFind.textContent.includes('最大面积是 36') && byId.maFind.textContent.includes('长 6 宽 6') &&
  tierLit(byId.maTiers, '挑战'));
byId.maDisc.value = '周长一定，长宽越接近面积越大';
click(byId.maDiscSave);
check('maxarea: discovery saved', byId.maDiscSaved.textContent.includes('记下来了'));

// 火柴棒：第 1 题 6+4=4 → 8−4=4；第 2 题 9+3=5 → 3+3=6；错形、0 动都拒。
c0 = triedCount();
navGo('demo-matches');
check('matches: puzzle 1 is 6+4=4', byId.msTitle.textContent.includes('6 + 4 = 4'));
click(byId.msCheck);
check('matches: checking with 0 moves is refused', byId.msMsg.textContent.includes('动了 0 根'));
click(findIn(byId.msBoard, '#msBoard [data-ms-seg]', 'msSeg', '0-a'));
click(findIn(byId.msBoard, '#msBoard [data-ms-seg]', 'msSeg', '2-a'));
click(byId.msCheck);
check('matches: a move that breaks the digit shape is refused', byId.msMsg.textContent.includes('形状不对'));
click(byId.msReset);
click(byId.msPredOp);
click(findIn(byId.msBoard, '#msBoard [data-ms-seg]', 'msSeg', '1-v'));
click(findIn(byId.msBoard, '#msBoard [data-ms-seg]', 'msSeg', '0-b'));
click(byId.msCheck);
check('matches: puzzle 1 solved by moving + vertical to 6 (8−4=4), prediction right',
  byId.msMsg.textContent.includes('对了！8 − 4 = 4') && byId.msMsg.textContent.includes('你猜对了') &&
  byId.msSolved.textContent.includes('1 / 3') && triedCount() === c0 + 1);
click(byId.msNext);
check('matches: puzzle 2 is 9+3=5', byId.msTitle.textContent.includes('9 + 3 = 5'));
click(byId.msPredDigit);
click(findIn(byId.msBoard, '#msBoard [data-ms-seg]', 'msSeg', '0-f'));
click(findIn(byId.msBoard, '#msBoard [data-ms-seg]', 'msSeg', '4-e'));
click(byId.msCheck);
check('matches: puzzle 2 solved by moving 9’s f to 5’s e (3+3=6), prediction right',
  byId.msMsg.textContent.includes('对了！3 + 3 = 6') && byId.msMsg.textContent.includes('你猜对了') &&
  byId.msSolved.textContent.includes('2 / 3') && tierLit(byId.msTiers, '提高'));
byId.msFind.value = '一根火柴能拆数字也能补数字';
click(byId.msFindSave);
check('matches: discovery saved', byId.msFindSaved.textContent.includes('记下来了'));

// 莫比乌斯带：预测 2 个圈被打脸；1/3 处剪是 2 个套在一起的圈。
c0 = triedCount();
navGo('demo-mobius');
click(byId.mbPred2);
click(byId.mbCut);
check('mobius: center cut stays 1 loop and contradicts the 2-loop prediction',
  byId.mbResult.textContent.includes('还是 1 个圈') && byId.mbResult.textContent.includes('你猜的是 2 个圈，猜错了') &&
  byId.mbWhy.hidden === false && triedCount() === c0 + 1);
click(byId.mbPred2);
click(byId.mbCutThird);
check('mobius: cut at 1/3 gives 2 linked loops',
  byId.mbResult.textContent.includes('2 个圈，套在一起') && byId.mbResult.textContent.includes('你猜对了') &&
  tierLit(byId.mbTiers, '提高'));
click(byId.mbPred2Same);
click(byId.mbCutQuarter);
check('mobius: cut at 1/4 also gives 2 linked loops, second prediction right',
  byId.mbResult.textContent.includes('也是 2 个圈') && byId.mbResult.textContent.includes('你猜对了') &&
  tierLit(byId.mbTiers, '挑战'));
byId.mbFind.value = '剪的位置不一样，结果完全不一样';
click(byId.mbFindSave);
check('mobius: discovery saved', byId.mbFindSaved.textContent.includes('记下来了'));

// 开店一周：每天 12 元进 20 个，总收入 1680 元、现金利润 560 元（全卖完，剩货 0）。
c0 = triedCount();
navGo('demo-shopweek');
check('shopweek: day 1 with 200 cash', byId.swStatus.textContent.includes('第 1 天') && byId.swStatus.textContent.includes('200 元'));
click(byId.swGuessSet);
check('shopweek: profit guess recorded at 500', byId.swGuessTx.textContent.includes('你猜这一周能赚 500 元'));
click(byId.swOpen);
check('shopweek: day 1 at price 12 draws 23 customers and sells 20',
  byId.swDayOut.textContent.includes('来了 23 个顾客') && byId.swDayOut.textContent.includes('收入 240 元'));
for (let d = 0; d < 6; d++) click(byId.swOpen);
check('shopweek: a week at 12/20 ends with revenue 1680 and profit 560',
  byId.swReport.textContent.includes('总收入 1680 元') && byId.swReport.textContent.includes('利润：560 元') &&
  byId.swReport.textContent.includes('你猜一周能赚 500 元，实际利润是 560 元') &&
  byId.swReport.textContent.includes('猜得很准') &&
  byId.swStatus.textContent.includes('760 元') && triedCount() === c0 + 1);
// 利润是收入减已卖出商品的成本，不是现金变化：定价 20 元一周只卖 65 件，收入 1300 元、
// 成本 520 元，利润是 780 元（现金只从 200 变成 380 元，那 180 元是现金变化，不是利润）；
// 剩 75 件（成本 600 元）另列。改前 headline 写 180 元，挑战档永远打不着。
click(byId.swReplay);
for (let i = 0; i < 8; i++) click(byId.swPricePlus);
for (let d = 0; d < 7; d++) click(byId.swOpen);
check('shopweek: a week at 20/20 sells 65, profit is 780 (not the 180 cash change)',
  byId.swReport.textContent.includes('总收入 1300 元') && byId.swReport.textContent.includes('利润：780 元') &&
  byId.swReport.textContent.includes('还剩 75 个文具盒') && byId.swReport.textContent.includes('600 元') &&
  byId.swReport.textContent.includes('手里的钱从 200 元变成 380 元') &&
  byId.swReport.textContent.includes('比上周多赚了 220 元') && tierLit(byId.swTiers, '挑战'));
// 换个策略再来一周：14 元进 20 个，收入 1960 元、利润 840 元，比上周（780 元）多赚 60 元。
click(byId.swReplay);
click(byId.swPricePlus); click(byId.swPricePlus);
for (let d = 0; d < 7; d++) click(byId.swOpen);
check('shopweek: replay at 14/20 beats last week (profit 840)',
  byId.swReport.textContent.includes('总收入 1960 元') && byId.swReport.textContent.includes('利润：840 元') &&
  byId.swReport.textContent.includes('比上周多赚了 60 元') && tierLit(byId.swTiers, '挑战'));
byId.swFind.value = '卖贵一点，顾客少了但赚得更多';
click(byId.swFindSave);
check('shopweek: discovery saved', byId.swFindSaved.textContent.includes('记下来了'));

// 公平游戏：甲 {2–7} 乙 {8–12} 是 21 对 15，模拟 58 对 42；公平分法各 18 种。
c0 = triedCount();
navGo('demo-fairgame');
click(byId.fgPredYes);
check('fairgame: prediction recorded', byId.fgPredTx.textContent.includes('和的个数多，赢面就大'));
function fgClick(sum, times) { for (let i = 0; i < times; i++) click(findIn(byId.fgSums, '#fgSums [data-fg-sum]', 'fgSum', sum)); }
[2, 3, 4, 5, 6, 7].forEach(s => fgClick(s, 1));
[8, 9, 10, 11, 12].forEach(s => fgClick(s, 2));
check('fairgame: A {2–7} is 21 ways, B {8–12} is 15 ways, unfair',
  byId.fgWays.textContent.includes('甲：21 种可能') && byId.fgWays.textContent.includes('乙：15 种可能') &&
  byId.fgVerdict.textContent.includes('不公平'));
click(byId.fgSim);
check('fairgame: seeded 100-roll sim gives A 58, B 42',
  byId.fgSimOut.textContent.includes('甲赢 58 次') && byId.fgSimOut.textContent.includes('乙赢 42 次') &&
  triedCount() === c0 + 1);
click(byId.fgTable);
check('fairgame: 36-outcome table shows 7 has 6 ways and calls out the wrong prediction',
  byId.fgTableOut.textContent.includes('7 有 6 种') && byId.fgTableOut.textContent.includes('一共 36 种') &&
  byId.fgTableOut.textContent.includes('你猜错了') && byId.fgWhy.hidden === false);
click(byId.fgReset);
[2, 3, 4, 7, 10, 11, 12].forEach(s => fgClick(s, 1));
[5, 6, 8, 9].forEach(s => fgClick(s, 2));
check('fairgame: A {2,3,4,7,10,11,12} vs B {5,6,8,9} is fair at 18 each',
  byId.fgVerdict.textContent.includes('公平！甲乙各 18 种可能') && tierLit(byId.fgTiers, '提高'));
click(byId.fgReset);
[4, 5, 6, 7].forEach(s => fgClick(s, 1));
[2, 3, 8, 9, 10, 11, 12].forEach(s => fgClick(s, 2));
check('fairgame: a second fair split A {4,5,6,7} vs B {2,3,8,9,10,11,12} is also 18 each',
  byId.fgVerdict.textContent.includes('公平！甲乙各 18 种可能') && tierLit(byId.fgTiers, '挑战'));
byId.fgFind.value = '和有几个不重要，几种掷法才重要';
click(byId.fgFindSave);
check('fairgame: discovery saved', byId.fgFindSaved.textContent.includes('记下来了'));

// 造规律：单元 ●▲■，第 10 个是 ●，第 20 个是 ▲；错答只给提示不给答案。
c0 = triedCount();
navGo('demo-makerule');
documentStub.getElementById('mrWhy'); // 改前代码不认这个 id，直接读 byId 会抛错而不是干净失败
click(findIn(byId.mrPalette, '#mrPalette [data-mr-shape]', 'mrShape', '●'));
click(findIn(byId.mrPalette, '#mrPalette [data-mr-shape]', 'mrShape', '▲'));
click(findIn(byId.mrPalette, '#mrPalette [data-mr-shape]', 'mrShape', '■'));
check('makerule: unit ●▲■ repeats', byId.mrUnit.textContent.includes('● ▲ ■') &&
  byId.mrRow.textContent.includes('● ▲ ■ ● ▲ ■'));
click(findIn(byId.mrQ10, '#mrQ10 [data-mr-opt]', 'mrOpt', '▲'));
check('makerule: wrong 10th answer gets a hint, not the answer', byId.mrA10.textContent.includes('再想想'));
click(findIn(byId.mrQ10, '#mrQ10 [data-mr-opt]', 'mrOpt', '●'));
check('makerule: 10th is ● (4th unit, 1st item)',
  byId.mrA10.textContent.includes('对了！第 10 个是第 4 个单元的第 1 个') && triedCount() === c0 + 1);
click(findIn(byId.mrQ20, '#mrQ20 [data-mr-opt]', 'mrOpt', '▲'));
check('makerule: 20th is ▲ (7th unit, 2nd item)',
  byId.mrA20.textContent.includes('对了！第 20 个是第 7 个单元的第 2 个') && tierLit(byId.mrTiers, '提高'));
click(byId.mrCard);
check('makerule: challenge card names both answers',
  byId.mrCardOut.textContent.includes('出题卡') && byId.mrCardOut.textContent.includes('第 10 个 ●') &&
  byId.mrCardOut.textContent.includes('第 20 个 ▲'));
click(byId.mrClear);
click(findIn(byId.mrPalette, '#mrPalette [data-mr-shape]', 'mrShape', '●'));
click(findIn(byId.mrPalette, '#mrPalette [data-mr-shape]', 'mrShape', '★'));
click(byId.mrChallenge);
check('makerule: unit ●★ makes the 10th a ★',
  byId.mrChallengeOut.textContent.includes('做到了') && byId.mrChallengeOut.textContent.includes('第 10 个正好是第 5 个单元的第 2 个') &&
  tierLit(byId.mrTiers, '挑战'));
// 为什么要跟实际拼出的单元走：4 个一单元时还说“10 除以 3 余 1”就错了。
click(byId.mrClear);
click(findIn(byId.mrPalette, '#mrPalette [data-mr-shape]', 'mrShape', '●'));
click(findIn(byId.mrPalette, '#mrPalette [data-mr-shape]', 'mrShape', '▲'));
click(findIn(byId.mrPalette, '#mrPalette [data-mr-shape]', 'mrShape', '■'));
click(findIn(byId.mrPalette, '#mrPalette [data-mr-shape]', 'mrShape', '★'));
check('makerule: why follows the actual unit (4 shapes: 10÷4, 3rd unit 2nd item)',
  byId.mrWhy.innerHTML.includes('一个单元有 4 个') && byId.mrWhy.innerHTML.includes('第 3 个单元的第 2 个') &&
  byId.mrWhy.innerHTML.includes('10 除以 4 商 2 余 2'));
byId.mrFind.value = '第几个不用数，数第几个单元就行';
click(byId.mrFindSave);
check('makerule: discovery saved', byId.mrFindSaved.textContent.includes('记下来了'));

const triedAtEnd = JSON.parse(lsData['math-tried-demos-v1'] || '[]');
check('creative: all 8 creative demos are in the tried list',
  CREATIVE.every(k => triedAtEnd.includes(k)) && triedAtEnd.length === triedAtStart.length + 9);

// ---------- 12. 数学实验室 · 一间工作间（第二阶段） ----------
// 改前没有 labSetMode / 托盘 / 组合台 / 问题入口，相关函数不存在、按钮没有绑定——
// 每个检查都先确认函数存在（不存在就只记一条失败，不让整轮崩掉），再断言行为。
check('lab2: mode toggle + workbench functions exist',
  typeof sandbox.labSetMode === 'function' && typeof sandbox.labTrayAdd === 'function' &&
  typeof sandbox.labFracAdd === 'function' && typeof sandbox.labEnterQuestion === 'function' &&
  typeof sandbox.labSubmitChallenge === 'function');
if (typeof sandbox.labSetMode === 'function') {
  // 模式切换：挑战模式给 #lab 加 lab-challenge（提示藏起来），交卷盒出现；切回自由玩还原。
  sandbox.labSetMode('challenge');
  check('lab2: challenge mode adds the class and shows the submit box',
    byId.lab.classList.contains('lab-challenge') && byId.labChallengeBox.hidden === false &&
    byId.labModeTx.textContent.includes('挑战模式'));
  sandbox.labSetMode('free');
  check('lab2: back to free mode removes the class and hides the submit box',
    !byId.lab.classList.contains('lab-challenge') && byId.labChallengeBox.hidden === true);
  // 交卷空报告：挑战模式里一道题都没做过。
  sandbox.labSetMode('challenge');
  sandbox.labSubmitChallenge();
  check('lab2: empty challenge report says no attempts yet',
    byId.labChallengeReport.innerHTML.includes('还没在挑战模式里做过题'));
  // 做题过程中就实时列出已做的尝试，不用等交卷——改前点交卷之前列表一直是空的。
  click(byId['labQ-fracadd']);
  check('lab2: challenge attempts list live as questions are entered, before submitting',
    byId.labChallengeReport.innerHTML.includes('分母不一样') &&
    !byId.labChallengeReport.innerHTML.includes('还没在挑战模式里做过题'));
  // 分数加法台：默认 1/2+1/3，错拼 2/5、正确 5/6，错拼的条比正确的短。
  click(byId.labFaAdd);
  check('lab2: fraction bench shows naive 2/5 vs correct 5/6 and the gap',
    byId.labFracAddOut.textContent.includes('2/5') && byId.labFracAddOut.textContent.includes('5/6') &&
    byId.labFracAddOut.textContent.includes('少了') &&
    parseFloat(byId.labFracNaiveBar.style.width) < parseFloat(byId.labFracCorrectBar.style.width));
  // 和超过 1：3/4+2/3=17/12，正确的条越过 1 的刻度线。
  sandbox.labFaSet('A', 2, 2); sandbox.labFaSet('B', 1, 0);
  click(byId.labFaAdd);
  check('lab2: fraction bench overflow past 1 (3/4+2/3=17/12)',
    byId.labFracAddOut.textContent.includes('17/12') && byId.labFracAddOut.textContent.includes('5/7') &&
    parseFloat(byId.labFracCorrectBar.style.width) > parseFloat(byId.labFracOneMarkA.style.left));
  sandbox.labFaA = { n: 1, d: 2 }; sandbox.labFaB = { n: 1, d: 3 };
  sandbox.labFaTouched = { A: false, B: false }; sandbox.labFaRender();
  // 天平组合台：左盘 1/2，右边空——差 1/2，整数砝码凑不出；右盘再加 1/2 就平了。
  click(byId.labWbF2);
  check('lab2: balance bench names the 1/2 gap and says integers cannot make it',
    byId.labWbEq.textContent.includes('1/2') && byId.labWbMsg.textContent.includes('重 1/2') &&
    byId.labWbMsg.textContent.includes('凑不出 1/2') &&
    byId.labWbMsg.textContent.includes('分数砝码'));
  click(byId.labWbPanR); click(byId.labWbF2);
  check('lab2: balance bench balances when both pans are 1/2',
    byId.labWbMsg.textContent.includes('平了'));
  click(byId.labWbIntPlus);
  check('lab2: balance bench tilts by an integer difference',
    byId.labWbMsg.textContent.includes('右边重 1'));
  click(byId.labWbClear);
  check('lab2: balance bench clears both pans',
    byId.labWbEq.textContent.includes('左 0') && byId.labWbEq.textContent.includes('右 0'));
  // 托盘 + 数轴：1/2 上数轴，再放 1，两点差 1/2；7 放不下，留在托盘里；托盘最多 3 个。
  sandbox.labTrayAdd({ kind: 'frac', n: 1, d: 2, src: 'test' });
  check('lab2: tray holds a fraction chip',
    sandbox.labTray.length === 1 && byId.labTray.children.length === 1 &&
    byId.labTray.children[0].textContent.includes('1/2'));
  sandbox.labTraySend(0, 'line');
  check('lab2: tray chip lands on the number line',
    sandbox.labLinePts.length === 1 && sandbox.labTray.length === 0 &&
    byId.labLineMsg.textContent.includes('1/2'));
  sandbox.labTrayAdd({ kind: 'num', v: 1, src: 'test' });
  sandbox.labTraySend(0, 'line');
  check('lab2: two points on the line show their distance 1/2',
    sandbox.labLinePts.length === 2 && byId.labLineMsg.textContent.includes('差 1/2'));
  sandbox.labTrayAdd({ kind: 'num', v: 7, src: 'test' });
  sandbox.labTraySend(0, 'line');
  check('lab2: 7 does not fit on the 0-2 line and stays in the tray',
    sandbox.labLinePts.length === 2 && sandbox.labTray.length === 1 &&
    byId.labLineMsg.textContent.includes('放不下'));
  sandbox.labTrayAdd({ kind: 'frac', n: 1, d: 3, src: 'test' });
  sandbox.labTrayAdd({ kind: 'num', v: 2, src: 'test' });
  check('lab2: tray caps at 3, the 4th value is refused',
    sandbox.labTray.length === 3 &&
    sandbox.labTrayAdd({ kind: 'frac', n: 1, d: 4, src: 'test' }) === false &&
    byId.labTrayMsg.textContent.includes('托盘满了'));
  sandbox.labTray = []; sandbox.labTrayRender();
  sandbox.labLinePts = []; sandbox.labLineRender();
  // 小站往托盘送数：十格阵放 7 个点，点“放到托盘”，托盘里就是 7。
  for (let i = 0; i < 7; i++) sandbox.labTfToggle('A', i);
  click(byId.labTfToTray);
  check('lab2: ten-frame station sends its total 7 to the tray',
    sandbox.labTray.length === 1 && sandbox.labTray[0].v === 7);
  sandbox.labTray = []; sandbox.labTrayRender();
  for (let i = 0; i < 7; i++) sandbox.labTfToggle('A', i);
  // 挑战交卷：先进两道工作间问题（分数加法 + 天平），自由玩里进问题不记；打分交卷后，
  // 答错的 5.11 进复习库，报告点名 5.11；5.5 答对了，不在丢分报告里。
  const chReviewBefore = lsData['math-review-v1'];
  click(byId['labQ-fracadd']);
  click(byId['labQ-balfrac']);
  check('lab2: entering workbench questions in challenge mode records attempts',
    sandbox.labChallengeAttempts.includes('q-fracadd') && sandbox.labChallengeAttempts.includes('q-balfrac') &&
    byId.labCurrentQ.textContent.includes('天平一边放 1/2') &&
    sandbox.labWbL.length === 1 && sandbox.labWbL[0].n === 1 && sandbox.labWbL[0].d === 2);
  // The last question clicked above is q-balfrac, so the panel shows its procedure.
  check('lab2: challenge question shows an exam-mode procedure panel with no checklist',
    byId.worldProcOut.innerHTML.includes('天平上的分数') && byId.worldProcOut.innerHTML.includes('考试（无提示）') &&
    !byId.worldProcOut.innerHTML.includes('proc-steps'));
  // 2026-11-07 复测修（第 2 阶段后）：退出挑战要结束考试流程，不然流程面板一直挂着“考试进行中”。
  // 下面在改前代码上干净失败：旧代码 labSetMode('free') 只停表，不结束流程、不重算。
  check('lab2: exam panel shows “考试进行中” while in challenge',
    byId.worldProcOut.innerHTML.includes('考试进行中'));
  sandbox.labSetMode('free');
  check('lab2: leaving challenge ends the exam procedure, no stale “考试进行中” in free play',
    !(sandbox.labWorld && sandbox.labWorld.procedure && sandbox.labWorld.procedure.mode === 'exam') &&
    !byId.worldProcOut.innerHTML.includes('考试进行中'));
  sandbox.labSetMode('free');
  click(byId['labQ-numline']);
  check('lab2: entering a question in free mode records no attempt',
    sandbox.labChallengeAttempts.length === 2);
  sandbox.labSetMode('challenge');
  sandbox.labSubmitChallenge();
  check('lab2: challenge report lists the attempted questions',
    byId.labChallengeReport.innerHTML.includes('5.11') && byId.labChallengeReport.innerHTML.includes('5.5'));
  sandbox.labChallengeMark('q-fracadd', false);
  sandbox.labChallengeMark('q-balfrac', true);
  sandbox.labFinishChallenge();
  const chStored = JSON.parse(lsData['math-review-v1'] || '{}');
  check('lab2: challenge report names the lost point and files the miss',
    byId.labChallengeDone.textContent.includes('丢分报告') &&
    byId.labChallengeDone.textContent.includes('5.11') &&
    !byId.labChallengeDone.textContent.includes('5.5') &&
    chStored['5.11'] && chStored['5.11'].correct === false);
  lsData['math-review-v1'] = chReviewBefore;
  sandbox.syncReviewFromStorage();
  sandbox.labChallengeAttempts = []; sandbox.labChallengeMarks = {};
  sandbox.labSetMode('free');
  sandbox.labWbL = []; sandbox.labWbR = []; sandbox.labWbRender();
  // 跨次统计：考试结果写进历史；同一份报告不重复记；面板显示次数与最常丢的一步。
  const procRep = { labId: 'q-fracadd', title: '分数相加', mode: 'exam', score: 2, max: 4, done: false, opCount: 3, lost: ['把合起来的结果做成一块分数'], lines: [
    { id: 'combine', label: '把 1/2 和 1/3 合到一起', points: 1, got: true },
    { id: 'mint', label: '把合起来的结果做成一块分数', points: 2, got: false },
    { id: 'contrast', label: '看见错拼 2/5 与正确和 5/6 的差别', points: 1, got: true } ] };
  sandbox.procHistRecord(procRep);
  sandbox.procHistRecord(procRep);
  const hist = JSON.parse(lsData['math-lab-proc-v1'] || '{}');
  check('history: exam result stored once with attempts and lost counts',
    hist['q-fracadd'] && hist['q-fracadd'].attempts === 1 && hist['q-fracadd'].lost.mint === 1);
  check('history: summary names the most-lost step',
    sandbox.procHistSummaryHtml('q-fracadd').includes('考过 1 次') &&
    sandbox.procHistSummaryHtml('q-fracadd').includes('做成一块分数'));
  // 数轴题交卷后，自动判分重建世界，流程面板仍然在。
  sandbox.labSetMode('challenge');
  sandbox.labEnterQuestion('q-numline');
  sandbox.labSubmitChallenge();
  check('numline panel keeps its procedure after challenge auto-mark',
    byId.worldProcOut.innerHTML.includes('数轴上的数'));
  sandbox.labSetMode('free');
  // 实验台动作不计入挑战流程：不增加操作数，也不计失败。
  sandbox.labSetMode('challenge');
  sandbox.labEnterQuestion('q-fracadd');
  const opsBeforeBench = (sandbox.labWorld.ops || []).length;
  const benchMk = sandbox.benchRun({ type: 'makePiece', piece: { kind: 'frac', n: 1, d: 2 } });
  sandbox.benchRun({ type: 'benchPut', pieceId: benchMk.pieceId });
  sandbox.benchRun({ type: 'benchPut', pieceId: 'no-such-piece' });
  check('bench: bench moves do not add exam ops or errors, and keep the procedure',
    (sandbox.labWorld.ops || []).length === opsBeforeBench && (sandbox.labWorld.errors || []).length === 0 &&
    !!sandbox.labWorld.procedure && sandbox.labWorld.bench.length === 1);
  sandbox.labSetMode('free');
  // 台面跨题保留：换一道题，台上的数还在，并且存进了本机。
  const benchCountNow = sandbox.labWorld.bench.length;
  sandbox.labEnterQuestion('q-numline');
  check('bench: pieces stay on the bench when the question changes',
    benchCountNow >= 1 && sandbox.labWorld.bench.length === benchCountNow &&
    JSON.parse(lsData['math-bench-v1'] || '[]').length === benchCountNow);
  check('bench: chips draw a fraction bar', byId.worldBenchShelf.innerHTML.includes('bench-svg'));
  // 视图：直线放上台，台子自动变成坐标系，并画出直线
  sandbox.benchRun({ type: 'benchLineToggle' });
  sandbox.worldBenchRender();
  check('bench view: a line on the bench shows the coordinate system and draws it',
    byId.worldBenchViews.innerHTML.includes('坐标系') && byId.worldBenchView.innerHTML.includes('<polyline'));
  sandbox.benchRun({ type: 'benchLineToggle' });
  sandbox.worldBenchRender();
  check('bench view: taking the line off the bench goes back to the number line or fraction bars',
    !byId.worldBenchView.innerHTML.includes('<polyline'));
  check('lab HTML hosts the bench view canvas and the line button',
    htmlText.includes('id="worldBenchView"') && htmlText.includes('data-bench="line"') &&
    htmlText.includes('src="bench-views.js"'));
  // 实验记录：记一条，再点“清空记录”，记录就没了（改前没有清空按钮）。
  sandbox.labTrace('测试记录：1/2+1/3', true);
  check('lab2: trace list shows a logged attempt',
    byId.labTraceList.innerHTML.includes('测试记录'));
  click(byId.labTraceClear);
  check('lab2: clear-trace button empties the trace list',
    !byId.labTraceList.innerHTML.includes('测试记录'));
}


// ---------- 13. 互动模拟（PhET 式单概念模拟，第三阶段） ----------
// 改前没有这 8 个模拟，函数不存在、卡片和面板没有——每个检查都先确认函数存在。
const SIMS = ['maketen', 'areamul', 'fraceq', 'buildfrac', 'areabuild', 'quadmorph', 'numplay', 'fracnumline'];
check('sims: all 8 sims navigate and their cards are live',
  (function () {
    sandbox.navGo('demo-maketen'); if (byId.mkEq.textContent !== '8 + 5 = ?') return false;
    sandbox.navGo('demo-areamul'); if (byId.amProd.textContent !== '8 × 15 = ?') return false;
    sandbox.navGo('demo-fraceq'); if (byId.feText.textContent !== '1/2') return false;
    sandbox.navGo('demo-buildfrac'); if (byId.bfBuiltTx.textContent !== '你涂了：0/4') return false;
    sandbox.navGo('demo-areabuild'); if (byId.abRead.textContent !== '面积 0 · 周长 0') return false;
    sandbox.navGo('demo-quadmorph'); if (!byId.qmNow.textContent.includes('长方形')) return false;
    sandbox.navGo('demo-numplay'); if (byId.npNum.textContent !== '？') return false;
    sandbox.navGo('demo-fracnumline'); if (!byId.fnlGuessTx.textContent.includes('1/2')) return false;
    return true;
  })());
lsData['math-tried-demos-v1'] = '[]';
sandbox.renderTried();
const triedAtStart13 = JSON.parse(lsData['math-tried-demos-v1'] || '[]');

// 凑十：先猜错（3 个 vs 实际 2 个），再猜对；盒子满了就装不下，点蓝色格子能送回来。
check('sims: maketen functions exist',
  typeof sandbox.mtMove === 'function' && typeof sandbox.mkRender === 'function');
check('sims: maketen starts at 8+5 with an empty box',
  byId.mkEq.textContent === '8 + 5 = ?');
click(byId.mtGuessPlus); click(byId.mtGuessSet);
sandbox.mtMove(0); sandbox.mtMove(1);
check('sims: maketen fills the box and says the guess was wrong (3 vs 2)',
  byId.mkMsg.textContent.includes('盒子满了') && byId.mkMsg.textContent.includes('实际拿了 2 个') &&
  byId.mkEq.textContent.includes('= 13') && byId.mtWhy.hidden === false);
sandbox.mtMove(2);
check('sims: maketen overflow is blocked with a reason',
  byId.mkMsg.textContent.includes('装不下了'));
sandbox.mtBoxClick(8);
check('sims: maketen sends a dot back and the equation updates',
  byId.mkEq.textContent.includes('还差 1 个'));
click(byId.mtReset);
click(byId.mtGuessMinus); click(byId.mtGuessSet);
sandbox.mtMove(0); sandbox.mtMove(1);
check('sims: maketen correct guess lights the 提高 tier',
  byId.mkMsg.textContent.includes('猜对了') && tierLit(byId.mtTiers, '提高'));
sandbox.mtNewProblem();
click(byId.mtGuessMinus); click(byId.mtGuessSet);
sandbox.mtMove(0);
check('sims: maketen two correct guesses in a row lights the 挑战 tier',
  byId.mkMsg.textContent.includes('猜对了') && tierLit(byId.mtTiers, '挑战'));
byId.mtFind.value = '先凑满 10，剩下的直接加';
click(byId.mtFindSave);
check('sims: maketen discovery saved', byId.mtFindSaved.textContent.includes('记下来了'));

// 面积模型乘法：猜 100，实际 120；分步乘积 50+25+30+15；反过来找到宽 15。
check('sims: areamul functions exist',
  typeof sandbox.amSetA === 'function' && typeof sandbox.amCalc === 'function');
check('sims: areamul starts at 8x15 with the product hidden',
  byId.amProd.textContent === '8 × 15 = ?');
documentStub.getElementById('amGuess').value = '100';
click(byId.amGuessSet);
click(byId.amCalc);
check('sims: areamul reveals 120 and says the guess was 20 short',
  byId.amProd.textContent.includes('120') && byId.amuMsg.textContent.includes('少猜了 20') &&
  tierLit(byId.amTiers, '基础'));
click(byId.amParts);
check('sims: areamul partial products add up to 120',
  byId.amPartsOut.textContent.includes('50+30+25+15') && byId.amPartsOut.textContent.includes('= 120') &&
  tierLit(byId.amTiers, '提高'));
click(byId.amChallenge);
check('sims: areamul challenge hides the width and shows the target area',
  byId.amBLabel.textContent === '?' && byId.amProd.textContent.includes('目标是 120'));
// 挑战模式里“数一数”也要打基础档，但不能把宽亮出来——只报面积和还差多少。
click(byId.amCalc);
check('sims: areamul counting in challenge mode ticks 基础 without revealing the width',
  byId.amuMsg.textContent.includes('还差 40') && !byId.amProd.textContent.includes('8 × 10') &&
  byId.amProd.textContent.includes('目标是 120'));
sandbox.amSetB(15);
check('sims: areamul inverse challenge finds width 15',
  byId.amuMsg.textContent.includes('找到了！宽是 15') && tierLit(byId.amTiers, '挑战'));
click(byId.amChallenge);
byId.amFind.value = '长方形里的方块数就是积';
click(byId.amFindSave);
check('sims: areamul discovery saved', byId.amFindSaved.textContent.includes('记下来了'));

// 分数相等：只改分母不改分子，阴影少了 1/4；调成分子 2、分母 4，一样大。
check('sims: fraceq functions exist',
  typeof sandbox.feCompare === 'function' && typeof sandbox.feDraw === 'function');
check('sims: fraceq starts at 1/2',
  byId.feText.textContent === '1/2');
click(byId.feDPlus); click(byId.feDPlus);
click(byId.feCompare);
check('sims: fraceq changing only the denominator visibly shrinks the shaded amount',
  byId.feMsg.textContent.includes('少了 1/4'));
click(byId.feGuessSet);
click(byId.feNPlus);
click(byId.feCompare);
check('sims: fraceq 2/4 equals 1/2 and the guess was right',
  byId.feMsg.textContent.includes('一样大！1/2 = 2/4') && byId.feMsg.textContent.includes('猜对了') &&
  byId.feFound.textContent.includes('2/4') && tierLit(byId.feTiers, '提高'));
click(byId.feNext);
for (let i = 0; i < 3; i++) click(byId.feDPlus);
for (let i = 0; i < 2; i++) click(byId.feNPlus);
click(byId.feCompare);
check('sims: fraceq 4/6 equals 2/3',
  byId.feMsg.textContent.includes('一样大！2/3 = 4/6') && byId.feFound.textContent.includes('4/6'));
click(byId.feNext);
for (let i = 0; i < 9; i++) click(byId.feDPlus);
for (let i = 0; i < 6; i++) click(byId.feNPlus);
click(byId.feCompare);
check('sims: fraceq 9/12 equals 3/4 and all three targets light the 挑战 tier',
  byId.feMsg.textContent.includes('一样大！3/4 = 9/12') && tierLit(byId.feTiers, '挑战'));
byId.feFind.value = '分子分母一起变，量才不变';
click(byId.feFindSave);
check('sims: fraceq discovery saved', byId.feFindSaved.textContent.includes('记下来了'));

// 造分数：涂 2/4 比目标 3/4 少 1/4；涂满 3/4 造对了；再造 10/12 = 5/6 和 6/9 = 2/3。
check('sims: buildfrac functions exist',
  typeof sandbox.bfCheck === 'function' && typeof sandbox.bfRender === 'function');
check('sims: buildfrac starts with nothing shaded',
  byId.bfBuiltTx.textContent === '你涂了：0/4');
click(findIn(byId.bfPieces, '#bfPieces [data-i]', 'i', 0));
click(findIn(byId.bfPieces, '#bfPieces [data-i]', 'i', 1));
click(byId.bfCheck);
check('sims: buildfrac 2/4 is visibly short of the 3/4 target by 1/4',
  byId.bfBuiltTx.textContent === '你涂了：2/4' && byId.bfMsg.textContent.includes('少了 1/4'));
click(findIn(byId.bfPieces, '#bfPieces [data-i]', 'i', 2));
click(byId.bfCheck);
check('sims: buildfrac 3/4 built correctly',
  byId.bfMsg.textContent.includes('造对了！3/4 = 3/4') && tierLit(byId.bfTiers, '基础'));
// 等值分数按值接受：目标 3/4，拼出 6/8 也算对（改前认了“量对了”却不接受）。
for (let i = 0; i < 4; i++) click(byId.bfDPlus);
for (let i = 0; i < 6; i++) click(findIn(byId.bfPieces, '#bfPieces [data-i]', 'i', i));
click(byId.bfCheck);
check('sims: buildfrac 6/8 equals 3/4 and is accepted by value',
  byId.bfMsg.textContent.includes('造对了！6/8 = 3/4') && byId.bfMsg.textContent.includes('一样大，照样算对'));
click(byId.bfNext);
for (let i = 0; i < 4; i++) click(byId.bfGuessPlus);
click(byId.bfGuessSet);
for (let i = 0; i < 6; i++) click(byId.bfDPlus);
for (let i = 0; i < 10; i++) click(findIn(byId.bfPieces, '#bfPieces [data-i]', 'i', i));
click(byId.bfCheck);
check('sims: buildfrac 10/12 equals 5/6 and the guess was right',
  byId.bfMsg.textContent.includes('造对了！10/12 = 5/6') && byId.bfMsg.textContent.includes('猜对了') &&
  tierLit(byId.bfTiers, '提高'));
click(byId.bfNext);
for (let i = 0; i < 6; i++) click(byId.bfDPlus);
for (let i = 0; i < 6; i++) click(findIn(byId.bfPieces, '#bfPieces [data-i]', 'i', i));
click(byId.bfCheck);
check('sims: buildfrac 6/9 equals 2/3 and all three targets light the 挑战 tier',
  byId.bfMsg.textContent.includes('造对了！6/9 = 2/3') && tierLit(byId.bfTiers, '挑战'));
byId.bfFind.value = '切得越碎，要涂的份数也越多';
click(byId.bfFindSave);
check('sims: buildfrac discovery saved', byId.bfFindSaved.textContent.includes('记下来了'));

// 面积建造者：3×4（周长 14）、2×6（周长 16）、散开的 12 格（周长 18）。
check('sims: areabuild functions exist',
  typeof sandbox.abCheck === 'function' && typeof sandbox.abSetCells === 'function');
click(byId.abPredNo);
check('sims: areabuild prediction recorded',
  byId.abPredTx.textContent.includes('不一定'));
sandbox.abSetCells([0, 1, 2, 3, 6, 7, 8, 9, 12, 13, 14, 15]);
check('sims: areabuild 3x4 rectangle reads area 12 perimeter 14',
  byId.abRead.textContent === '面积 12 · 周长 14');
click(byId.abCheck);
check('sims: areabuild area-12 perimeter-14 built',
  byId.abMsg.textContent.includes('造出来了') && tierLit(byId.abTiers, '基础'));
click(byId.abNext);
sandbox.abSetCells([0, 1, 2, 3, 6, 7, 8, 9, 12, 13, 14, 15]);
click(byId.abCheck);
check('sims: areabuild same area with the wrong perimeter says it is too compact',
  byId.abMsg.textContent.includes('太紧凑'));
sandbox.abSetCells([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
check('sims: areabuild 2x6 rectangle reads area 12 perimeter 16',
  byId.abRead.textContent === '面积 12 · 周长 16');
click(byId.abCheck);
check('sims: areabuild second perimeter proves the prediction and lights 提高',
  byId.abMsg.textContent.includes('造出来了') && byId.abPredTx.textContent.includes('猜对了') &&
  tierLit(byId.abTiers, '提高') && byId.abWhy.hidden === false);
click(byId.abNext);
sandbox.abSetCells([1, 2, 6, 7, 8, 9, 12, 13, 14, 15, 19, 21]);
check('sims: areabuild scattered 12 cells read area 12 perimeter 18',
  byId.abRead.textContent === '面积 12 · 周长 18');
click(byId.abCheck);
check('sims: areabuild third perimeter lights the 挑战 tier',
  byId.abMsg.textContent.includes('造出来了') && tierLit(byId.abTiers, '挑战'));
byId.abFind.value = '面积一样，周长可以不一样';
click(byId.abFindSave);
check('sims: areabuild discovery saved', byId.abFindSaved.textContent.includes('记下来了'));

// 四边形变形：先猜“不是了”，拖 B 一格变成梯形；再把长方形改成正方形。
check('sims: quadmorph functions exist',
  typeof sandbox.qmClassify === 'function' && typeof sandbox.qmNudge === 'function');
check('sims: quadmorph starts as a rectangle',
  byId.qmNow.textContent.includes('现在是：长方形'));
// 选目标“正方形”时形状直接重置成正方形，提高档就该打勾，不用再拖一下才认。
sandbox.qmSetType('正方形');
check('sims: quadmorph picking the square target ticks 提高 at once',
  byId.qmNow.textContent.includes('现在是：正方形') && byId.qmMsg.textContent.includes('已经是正方形') &&
  tierLit(byId.qmTiers, '提高'));
sandbox.qmSetType('长方形');
click(byId.qmPredNo);
click(byId.qmV1);
click(byId.qmRight);
check('sims: quadmorph dragging one vertex breaks the rectangle into a trapezoid',
  byId.qmNow.textContent.includes('现在是：梯形') && byId.qmMsg.textContent.includes('猜对了') &&
  tierLit(byId.qmTiers, '基础') && byId.qmWhy.hidden === false);
sandbox.qmSetType('长方形');
click(byId.qmV1);
for (let i = 0; i < 4; i++) click(byId.qmLeft);
click(byId.qmV2);
for (let i = 0; i < 4; i++) click(byId.qmLeft);
check('sims: quadmorph moving B and C in makes a square',
  byId.qmNow.textContent.includes('现在是：正方形') && tierLit(byId.qmTiers, '提高'));
check('sims: quadmorph trapezoid also lights the 挑战 tier',
  tierLit(byId.qmTiers, '挑战'));
byId.qmFind.value = '名字是规矩决定的，不是样子决定的';
click(byId.qmFindSave);
check('sims: quadmorph discovery saved', byId.qmFindSaved.textContent.includes('记下来了'));

// 数一数：遮住数字猜 13，猜对；猜错 9；再造出 20。
check('sims: numplay functions exist',
  typeof sandbox.npSetN === 'function' && typeof sandbox.npReveal === 'function');
check('sims: numplay starts covered at 7',
  byId.npNum.textContent === '？' && byId.npDots.textContent === '●●●●●●●');
sandbox.npSetN(13, true);
for (let i = 0; i < 6; i++) click(byId.npGuessPlus);
click(byId.npGuessSet);
click(byId.npReveal);
check('sims: numplay guessing 13 from the dots alone is right and reveals all five forms',
  byId.npMsg.textContent.includes('猜对了') && byId.npNum.textContent === '13' && byId.npWords.textContent === '十三' &&
  tierLit(byId.npTiers, '提高'));
sandbox.npSetN(9, true);
click(byId.npGuessSet);
click(byId.npReveal);
check('sims: numplay a wrong guess says how many dots there really are',
  byId.npMsg.textContent.includes('猜错了') && byId.npMsg.textContent.includes('一共 9 个'));
sandbox.npSetN(20, true);
for (let i = 0; i < 7; i++) click(byId.npGuessPlus);
click(byId.npGuessSet);
click(byId.npReveal);
check('sims: numplay building 20 lights the 挑战 tier',
  byId.npMsg.textContent.includes('是 20') && tierLit(byId.npTiers, '挑战'));
// 为什么要跟实际揭示的数走：揭示 14 之后还拿 7 举例，学生会对不上号。
sandbox.npSetN(14, true);
click(byId.npReveal);
check('sims: numplay why follows the revealed number (14, not 7)',
  byId.npWhy.innerHTML.includes('14 个圆点') && byId.npWhy.innerHTML.includes('十四') &&
  !byId.npWhy.innerHTML.includes('7 个圆点'));
byId.npFind.value = '同一个数，有五种样子';
click(byId.npFindSave);
check('sims: numplay discovery saved', byId.npFindSaved.textContent.includes('记下来了'));

// 揭开按钮第一下必须有反应（真机记录：有时要点两下）。根因是两条路都能揭开，
// 只有一条做揭示的工作：npMinus/npPlus 调 npSetN(n, false) 顺带把数揭开了，
// 再点“揭开”正好撞上 npReveal 开头的 early-return，什么都不发生，按钮像死了一样。
sandbox.npSetN(7, true);
click(byId.npPlus);
check('sims: numplay +1 while covered keeps the number covered',
  byId.npNum.textContent === '？');
click(byId.npReveal);
check('sims: numplay reveal answers on the first tap after +/−',
  byId.npMsg.textContent.includes('是 8') && byId.npNum.textContent === '8' &&
  byId.npWhy.innerHTML.includes('8 个圆点') && byId.npWhy.hidden === false);
// 已经揭开后再改数、再点“揭开”，也要刷新到新数（改前 early-return 让为什么还停在旧数上）。
click(byId.npPlus);
click(byId.npReveal);
check('sims: numplay reveal after +/− on a revealed number follows the new number',
  byId.npMsg.textContent.includes('是 9') && byId.npWhy.innerHTML.includes('9 个圆点') &&
  !byId.npWhy.innerHTML.includes('8 个圆点'));

// 分数变数线：1/2 猜 0.5 猜对；3/4 猜 1.0 猜长了 1/4，再猜 0.75 猜对；5/4 猜 1.25 猜对。
check('sims: fracnumline functions exist',
  typeof sandbox.fnlSetGuess === 'function' && typeof sandbox.fnlUnfurl === 'function');
check('sims: fracnumline starts at 1/2',
  byId.fnlGuessTx.textContent.includes('1/2'));
sandbox.fnlSetGuess(0.5);
click(byId.fnlUnfurl);
check('sims: fracnumline 1/2 lands at 0.5',
  byId.fnlMsg.textContent.includes('猜对了') && tierLit(byId.fnlTiers, '基础'));
// 容差：0.45 猜 0.5 差了一整档，不能算对（改前 |差| <= 0.05 就认）。
sandbox.fnlSetGuess(0.45);
click(byId.fnlUnfurl);
check('sims: fracnumline 0.45 is not accepted for 0.5',
  byId.fnlMsg.textContent.includes('猜短了') && !byId.fnlMsg.textContent.includes('猜对了'));
// 点数轴：点的可能是刻度、圆点等子元素，位置必须按整条线算，不能按被点的子元素算——
// 改前用 e.target 的包围盒，点到刻度上位置就跳。
const fnlFakeChild = { getBoundingClientRect: function () { return { left: 100, width: 10 }; } };
(byId.fnlLine._handlers.click || []).forEach(function (f) { f({ target: fnlFakeChild, clientX: 90 }); });
check('sims: fracnumline clicking the line uses the line, not the clicked child',
  byId.fnlGuessLabel.textContent === '0.50');
click(byId.fnlNext);
sandbox.fnlSetGuess(1.0);
click(byId.fnlUnfurl);
check('sims: fracnumline guessing 1.0 for 3/4 is too long by 1/4',
  byId.fnlMsg.textContent.includes('猜长了') && byId.fnlMsg.textContent.includes('差了 1/4'));
sandbox.fnlSetGuess(0.75);
click(byId.fnlUnfurl);
check('sims: fracnumline 3/4 lands at 0.75',
  byId.fnlMsg.textContent.includes('猜对了') && tierLit(byId.fnlTiers, '提高'));
click(byId.fnlNext);
sandbox.fnlSetGuess(1.25);
click(byId.fnlUnfurl);
check('sims: fracnumline 5/4 lands past 1 at 1.25',
  byId.fnlMsg.textContent.includes('猜对了') && tierLit(byId.fnlTiers, '挑战'));
byId.fnlFind.value = '分数在数轴上有自己的位置';
click(byId.fnlFindSave);
check('sims: fracnumline discovery saved', byId.fnlFindSaved.textContent.includes('记下来了'));

// 8 个模拟的三档 ✓ 要进 localStorage（math-sim-tiers-v1），刷新页面不丢——
// 改前 makeTiers 只在内存里，刷新就全灭。
const simTiersSaved = JSON.parse(lsData['math-sim-tiers-v1'] || '{}');
check('sims: tiers persist to math-sim-tiers-v1 (numplay all three lit)',
  simTiersSaved.numplay && simTiersSaved.numplay[0] === true && simTiersSaved.numplay[1] === true && simTiersSaved.numplay[2] === true &&
  simTiersSaved.areamul && simTiersSaved.areamul[0] === true);
// 模拟一次刷新：新 makeTiers 从同一个键恢复，三档还是亮的。
const freshTiersEl = makeEl('div');
sandbox.makeTiers(freshTiersEl, ['基础：揭开一个数', '提高：只看圆点就猜对', '挑战：造出 20 的五种样子'], 'numplay');
check('sims: a fresh makeTiers restores the saved tiers from storage',
  tierLit(freshTiersEl, '基础') && tierLit(freshTiersEl, '提高') && tierLit(freshTiersEl, '挑战'));

const triedAtEnd13 = JSON.parse(lsData['math-tried-demos-v1'] || '[]');
check('sims: all 8 sims are in the tried list',
  SIMS.every(k => triedAtEnd13.includes(k)) && triedAtEnd13.length === triedAtStart13.length + 8);


// ---------- 实验放哪里（设计文档 docs/design/experiment-placement-20261106.md） ----------
// 注册表是唯一事实来源：点页、单元页、年级页都从 animsForPoint / animsForUnit 读。
// 每条都带 typeof 守卫：改前代码没有这些函数，守卫让它报 FAIL 而不是整个测试崩掉。
// 注意：桩内容（stub）只有一部分知识点（1.9 / 1.1 / 3.7 / 3.12 等），
// 所以行为检查用桩里有的点；真实一年级的 46 个动画与各单元数用下面的静态校验（读真实文件）来锁。
const hasAnims = typeof sandbox.animsForPoint === 'function' && typeof sandbox.animsForUnit === 'function';
check('anims: 1.9 has thirteen once + maketen + 3 new + op-maketen',
  hasAnims && JSON.stringify(sandbox.animsForPoint('1.9')) === JSON.stringify(['thirteen', 'maketen', 'm19-split', 'm19-line', 'm19-poker', 'op-maketen']));
check('anims: 3.7 has fraction + 3 sims',
  hasAnims && JSON.stringify(sandbox.animsForPoint('3.7')) === JSON.stringify(['fraction', 'fraceq', 'buildfrac', 'fracnumline', 'm37-div']));
check('anims: 3.12 has area + areabuild + maxarea from the lab question',
  hasAnims && JSON.stringify(sandbox.animsForPoint('3.12')) === JSON.stringify(['area', 'areabuild', 'maxarea', 'm312-cut', 'm312-unit']));
check('anims: 4.9 has zerodiv + mixop (METHOD_DEMOS dual-mount) + lab questions + op-bracket + op-storyex',
  hasAnims && JSON.stringify(sandbox.animsForPoint('4.9')) === JSON.stringify(['zerodiv', 'mixop', 'twentyfour', 'matches', 'op-bracket', 'op-storyex']));
check('anims: 5.14 has observe + m417-infer (dual-mount from 4.17) + 3 new',
  hasAnims && JSON.stringify(sandbox.animsForPoint('5.14')) === JSON.stringify(['observe', 'm417-infer', 'm514-guess', 'm514-three', 'm514-nums']));
check('anims: 2.3 has tenframe + place (METHOD_DEMOS dual-mount from 1.15) + op-vertical + op-maketen',
  hasAnims && JSON.stringify(sandbox.animsForPoint('2.3')) === JSON.stringify(['tenframe', 'place', 'op-vertical', 'op-maketen']));
check('anims: 6.8 has thermo + numline (METHOD_DEMOS dual-mount from 7.1/7.2) + m68-life',
  hasAnims && JSON.stringify(sandbox.animsForPoint('6.8')) === JSON.stringify(['thermo', 'numline', 'm68-life']));
check('anims: 1.1 has count + numplay + m1a-pair (registry) + op-compare',
  hasAnims && JSON.stringify(sandbox.animsForPoint('1.1')) === JSON.stringify(['count', 'numplay', 'm1a-pair', 'op-compare']));
check('checkpoint: 1.1 counts 4 animations from the registry (count + numplay + m1a-pair + op-compare), not 1 from p.demo',
  hasAnims && sandbox.unitCheckpoint(1, 2).demosTotal === 4);
check('anims: unknown point has none', hasAnims && sandbox.animsForPoint('9.99').length === 0);
check('anims: stub unit 1-0 （进位加法） has 6', hasAnims && sandbox.animsForUnit(1, 0).length === 6);
check('anims: stub unit 1-2 （准备课） has 4', hasAnims && sandbox.animsForUnit(1, 2).length === 4);
// 静态校验：按真实 grade-1.js 的 demo 字段 + app.js 里的 SIM_LINKS + LAB_QUESTIONS
// + 注册表（四个 anims 文件里的 registerAnim points）算出一年级每点动画，
// 去重后应为 49 个，各单元动画数应为 [4,3,5,3,5,3,2,6,1,4,2,5,2,4,4]
// （1.9 所在单元多了注册表的 op-maketen + 3 个新动画 m19-*；
// 1.2/1.3/1.4/1.5/1.6/1.7/1.8/1.11/1.12/1.13/1.14/1.15/1.16 各多了新动画）。
// （准备课多了注册表的 m1a-pair）。
// （2026-11-07 第四批：m113-bundle 挂在 1.13，1.13 所在单元 4→5，总数 46→47。）
// （2026-11-07 运算动画第 2 批第 1 小批：op-compare 挂在 1.1，准备课单元 3→4；
//   op-addlen 挂在 1.15，100以内的加法和减法（一）单元 3→4；总数 47→49。）
// （改前代码里没有 SIM_LINKS / LAB_QUESTIONS 的注册表逻辑，正则取不到就报 FAIL。）
// 注册表第五路：读四个 anims 文件里的 registerAnim(points)，按 key 归到各点。
// （文件不存在时跳过——改前代码上没有这些文件，静态校验按 18 个算，19 的断言干净失败。）
const regByPoint = {};
['anims-band-1-3.js', 'anims-band-4-6.js', 'anims-band-7-9.js', 'anims-operations.js'].forEach(f => {
  const p = root + '/apps/web/' + f;
  if (!fs.existsSync(p)) return;
  const t = fs.readFileSync(p, 'utf8');
  const rkeys = [...t.matchAll(/key\s*:\s*'([^']+)'/g)].map(m => m[1]);
  const rpts = [...t.matchAll(/points\s*:\s*\[([^\]]*)\]/g)].map(m => m[1]);
  rkeys.forEach((k, i) => {
    [...(rpts[i] || '').matchAll(/'([0-9.]+[a-z]?)'/g)].forEach(mm => {
      (regByPoint[mm[1]] = regByPoint[mm[1]] || []).push(k);
    });
  });
});
const g1src2 = fs.readFileSync(root + '/content/grades/grade-1.js', 'utf8');
const g1ids2 = [...g1src2.matchAll(/id: "([0-9.]+)"/g)].map(m => m[1]);
const g1demos2 = [...g1src2.matchAll(/demo: (?:'([a-z]+)'|null)/g)].map(m => m[1] || null);
const simLinksSrc = src.match(/var SIM_LINKS = (\{[\s\S]*?\n\});/);
const labQsSrc = src.match(/var LAB_QUESTIONS = (\[[\s\S]*?\n\]);/);
const simLinks = simLinksSrc ? eval('(' + simLinksSrc[1] + ')') : null;
const labQs = labQsSrc ? eval('(' + labQsSrc[1] + ')') : null;
let g1UnitCounts = null, g1Distinct = -1;
if (simLinks && labQs && g1ids2.length === 16) {
  const unitIdx = [...g1src2.matchAll(/unit: "([^"]+)"/g)].map(m => m.index);
  const pointIdx = [...g1src2.matchAll(/id: "([0-9.]+)"/g)].map(m => m.index);
  const unitSets = unitIdx.map(() => new Set());
  const allSet = new Set();
  pointIdx.forEach((pIdx, i) => {
    let ui = 0;
    unitIdx.forEach((uix, k) => { if (uix < pIdx) ui = k; });
    const keys = [];
    const push = k => { if (k && keys.indexOf(k) < 0) keys.push(k); };
    push(g1demos2[i]);
    (simLinks[g1ids2[i]] || []).forEach(push);
    labQs.forEach(q => { if (q.demo && q.points && q.points.indexOf(g1ids2[i]) >= 0) push(q.demo); });
    (regByPoint[g1ids2[i]] || []).forEach(push);
    keys.forEach(k => { unitSets[ui].add(k); allSet.add(k); });
  });
  g1UnitCounts = unitSets.map(s => s.size);
  g1Distinct = allSet.size;
}
check('anims: real grade-1 has 49 distinct animations', g1Distinct === 49);
check('anims: real grade-1 unit animation counts',
  JSON.stringify(g1UnitCounts) === JSON.stringify([4, 3, 5, 3, 5, 3, 2, 6, 1, 4, 2, 5, 2, 4, 4]));

// ---------- 14. 鸡兔同笼：一个点，四种方法（4.16） ----------
// 改前没有这 4 个动画：函数不存在、卡片和面板没有、METHOD_DEMOS 没有。
// 桩内容没有 4.16，所以注册表用静态校验（读真实文件），行为用演示本身测。
// grade-4.js 的 id/demo 列表已由 1488 行的 g4ids/g4demos 读过（双引号格式），这里复用。
const idx416 = g4ids.indexOf('4.16');
const methodSrc = src.match(/var METHOD_DEMOS = (\{[\s\S]*?\n\});/);
const methodDemos = methodSrc ? eval('(' + methodSrc[1] + ')') : null;
check('cr4: 4.16 registry is chickenrabbit + 4 methods in order',
  idx416 >= 0 && g4demos[idx416] === 'chickenrabbit' && !!methodDemos &&
  JSON.stringify(['chickenrabbit'].concat(methodDemos['4.16'])) ===
    JSON.stringify(['chickenrabbit', 'crslider', 'crdraw', 'crlist', 'crgolden']) &&
  src.includes('(METHOD_DEMOS[id] || []).forEach(push)'));
check('cr4: crSolve verifies all six problem sets',
  typeof sandbox.crSolve === 'function' &&
  JSON.stringify(sandbox.crSolve(10, 28)) === JSON.stringify({ r: 4, c: 6 }) &&
  JSON.stringify(sandbox.crSolve(35, 94)) === JSON.stringify({ r: 12, c: 23 }) &&
  JSON.stringify(sandbox.crSolve(24, 74)) === JSON.stringify({ r: 13, c: 11 }) &&
  JSON.stringify(sandbox.crSolve(20, 56)) === JSON.stringify({ r: 8, c: 12 }) &&
  JSON.stringify(sandbox.crSolve(8, 22)) === JSON.stringify({ r: 3, c: 5 }) &&
  JSON.stringify(sandbox.crSolve(12, 34)) === JSON.stringify({ r: 5, c: 7 }));
// 这 6 个存在性检查在改前代码上干净地 FAIL（不崩）；下面的行为检查只在
// 演示真实存在时跑——改前 byId 里没有这些卡片，直接读会抛错、拖垮整个测试。
check('cr4: crslider functions exist',
  typeof sandbox.csSet === 'function' && typeof sandbox.csSetGuess === 'function' && typeof sandbox.csNewProblem === 'function');
check('cr4: crdraw functions exist',
  typeof sandbox.cdAddLeg === 'function' && typeof sandbox.cdBig === 'function' && typeof sandbox.cdNewProblem === 'function');
check('cr4: crlist functions exist',
  typeof sandbox.clNext === 'function' && typeof sandbox.clJump === 'function' && typeof sandbox.clNewProblem === 'function');
check('cr4: crgolden functions exist',
  typeof sandbox.crgHalf === 'function' && typeof sandbox.crgCalc === 'function' && typeof sandbox.crgNewProblem === 'function');
const cr4Live = typeof sandbox.csSet === 'function' && typeof sandbox.cdAddLeg === 'function' &&
  typeof sandbox.clNext === 'function' && typeof sandbox.crgHalf === 'function' &&
  !!byId.csRead && !!byId.cdRead && !!byId.clRead && !!byId.crgRead;
if (cr4Live) {
check('cr4: all 4 methods navigate and their cards are live',
  (function () {
    sandbox.navGo('demo-crslider'); if (!byId.csRead.textContent.includes('目标 28 条')) return false;
    sandbox.navGo('demo-crdraw'); if (!byId.cdRead.textContent.includes('目标 22 条')) return false;
    sandbox.navGo('demo-crlist'); if (!byId.clRead.textContent.includes('目标 28 条')) return false;
    sandbox.navGo('demo-crgolden'); if (!byId.crgRead.textContent.includes('脚 28 只')) return false;
    return true;
  })());
lsData['math-tried-demos-v1'] = '[]';
sandbox.renderTried();
const triedAtStart14 = JSON.parse(lsData['math-tried-demos-v1'] || '[]');

// 猜了再滑：先猜错 3 只，再猜对 4 只；连对两道点亮挑战。
sandbox.navGo('demo-crslider');
check('cr4: crslider starts at 10/28 all chicken, 20 legs',
  byId.csRead.textContent.includes('一共 20 条腿') && byId.csRead.textContent.includes('目标 28 条'));
sandbox.csSet(2);
check('cr4: crslider two rabbits is 24 legs, cage shows 2 rabbits',
  byId.csRead.textContent.includes('一共 24 条腿') && byId.csMsg.textContent.includes('还差 4 条腿') &&
  byId.csCage.children.length === 10 &&
  byId.csCage.children.filter(c => c.className.includes('rabbit')).length === 2);
sandbox.csSetGuess(3);
sandbox.csSet(4);
check('cr4: crslider wrong guess 3 vs 4 says the shortfall and lights 基础',
  byId.csMsg.textContent.includes('正好 28 条腿') && byId.csMsg.textContent.includes('你猜 3 只，实际是 4 只') &&
  byId.csWhy.hidden === false && tierLit(byId.csTiers, '基础'));
sandbox.csSetGuess(4);
sandbox.csSet(3); sandbox.csSet(4);
check('cr4: crslider correct guess lights 提高 tier',
  byId.csMsg.textContent.includes('猜对了') && tierLit(byId.csTiers, '提高'));
sandbox.csNewProblem(1);
sandbox.csSetGuess(12);
sandbox.csSet(12);
check('cr4: crslider second correct guess in a row lights 挑战 tier (35/94)',
  byId.csMsg.textContent.includes('正好 94 条腿') && byId.csMsg.textContent.includes('兔 12 只，鸡 23 只') &&
  tierLit(byId.csTiers, '挑战'));
byId.csFind.value = '差几条腿就换几次，每次多 2 条';
click(byId.csFindSave);
check('cr4: crslider discovery saved', byId.csFindSaved.textContent.includes('记下来了'));
// 假设法文案：滑杆不会硬停，文案不能写“正好停住”。
check('cr4: crslider intro no longer promises a hard stop at 94 legs',
  html.includes('滑到 94 条就对了') && !html.includes('滑到 94 条正好停住'));

// 画图补腿：补 2 次到 20 条，再补 1 次到 22 条；点 4 条腿的头被拒绝。
sandbox.navGo('demo-crdraw');
check('cr4: crdraw starts at 8 heads, 16 legs, 6 short',
  byId.cdRead.textContent.includes('一共 16 条腿') && byId.cdRead.textContent.includes('还差 6 条'));
sandbox.cdAddLeg(0); sandbox.cdAddLeg(1);
check('cr4: crdraw two top-ups is 20 legs, 1 top-up left',
  byId.cdRead.textContent.includes('一共 20 条腿') && byId.cdMsg.textContent.includes('还要补 1 次'));
sandbox.cdAddLeg(0);
check('cr4: crdraw topping up a 4-leg head is refused with a reason',
  byId.cdMsg.textContent.includes('已经 4 条腿了'));
sandbox.cdAddLeg(2);
check('cr4: crdraw solves 8/22 as 3 rabbits 5 chickens',
  byId.cdMsg.textContent.includes('补满了') && byId.cdMsg.textContent.includes('3 只') &&
  byId.cdWhy.hidden === false && tierLit(byId.cdTiers, '基础'));
sandbox.cdBig();
check('cr4: crdraw 35-head button explains the transition to 假设法',
  byId.cdBigTx.textContent.includes('24÷2=12'));
sandbox.cdNewProblem(2);
sandbox.cdAddLeg(0); sandbox.cdAddLeg(1); sandbox.cdAddLeg(2); sandbox.cdAddLeg(3); sandbox.cdAddLeg(4);
check('cr4: crdraw solves 12/34 but 挑战 tier waits for the 35-head note',
  byId.cdMsg.textContent.includes('补满了') && byId.cdMsg.textContent.includes('35 头怎么办'));
sandbox.cdBig();
check('cr4: crdraw 挑战 tier lights after the 35-head note',
  tierLit(byId.cdTiers, '挑战'));
byId.cdFind.value = '少的腿 2 条 2 条补';
click(byId.cdFindSave);
check('cr4: crdraw discovery saved', byId.cdFindSaved.textContent.includes('记下来了'));

// 列表枚举：猜鸡 5 只（腿 30 条，多 2 条），试下一个正好是鸡 6 只；35 头要试 24 行。
sandbox.navGo('demo-crlist');
check('cr4: crlist starts empty with target 28',
  byId.clRead.textContent.includes('还没有试') && byId.clRead.textContent.includes('28'));
sandbox.clSetGuess(5);
click(byId.clJump);
check('cr4: crlist jump to chicken 5 shows 30 legs, 2 too many',
  byId.clMsg.textContent.includes('多了 2 条') && byId.clRead.textContent.includes('已经试了 6 行'));
sandbox.clNext();
check('cr4: crlist next row is the hit: 6 chickens 4 rabbits, 28 legs',
  byId.clMsg.textContent.includes('表里找到了') && byId.clMsg.textContent.includes('鸡 6 只，兔 4 只') &&
  tierLit(byId.clTiers, '基础'));
sandbox.clNewProblem(2);
for (let k = 0; k < 24; k++) sandbox.clNext();
check('cr4: crlist stepping 24 rows reaches 23 chickens 12 rabbits at 94 legs',
  byId.clMsg.textContent.includes('鸡 23 只，兔 12 只') && tierLit(byId.clTiers, '挑战'));
byId.clFind.value = '鸡每多 1 只，腿少 2 条';
click(byId.clFindSave);
check('cr4: crlist discovery saved', byId.clFindSaved.textContent.includes('记下来了'));

// 金鸡独立：没猜不让减半；猜错 3 只差 1 只脚；猜对两道点亮挑战。
sandbox.navGo('demo-crgolden');
check('cr4: crgolden starts at 10/28 with feet on the ground',
  byId.crgRead.textContent.includes('脚 28 只'));
click(byId.cgHalf);
check('cr4: crgolden refuses to halve before a guess',
  byId.crgMsg.textContent.includes('先猜兔有几只'));
sandbox.crgSetGuess(3);
click(byId.cgHalf);
check('cr4: crgolden wrong guess 3 vs 4 is 1 foot short, 14 feet standing',
  byId.crgMsg.textContent.includes('还差 1 只脚') && byId.crgRead.textContent.includes('14 只脚着地') &&
  byId.cgFeet.children.length === 14);
click(byId.cgCalc);
check('cr4: crgolden calc gives 4 rabbits 6 chickens, 基础 tier lit',
  byId.crgMsg.textContent.includes('兔 = 14 − 10 = 4 只') && byId.crgMsg.textContent.includes('鸡 = 10 − 4 = 6 只') &&
  tierLit(byId.cgTiers, '基础'));
sandbox.crgNewProblem(1);
sandbox.crgSetGuess(12);
click(byId.cgHalf);
check('cr4: crgolden correct guess on 35/94 lights 提高 tier',
  byId.crgMsg.textContent.includes('猜对了') && tierLit(byId.cgTiers, '提高'));
sandbox.crgNewProblem(2);
sandbox.crgSetGuess(13);
click(byId.cgHalf);
check('cr4: crgolden second correct guess in a row lights 挑战 tier (24/74)',
  byId.crgMsg.textContent.includes('猜对了') && tierLit(byId.cgTiers, '挑战'));
byId.cgFind.value = '脚减半多出来的就是兔';
click(byId.cgFindSave);
check('cr4: crgolden discovery saved', byId.cgFindSaved.textContent.includes('记下来了'));

const triedAtEnd14 = JSON.parse(lsData['math-tried-demos-v1'] || '[]');
check('cr4: all 4 chicken-rabbit methods are in the tried list',
  ['crslider', 'crdraw', 'crlist', 'crgolden'].every(k => triedAtEnd14.includes(k)) &&
  triedAtEnd14.length === triedAtStart14.length + 4);
}

navGo('point-3.7');
check('point page: animation group shows sim tags + demo button',
  pointDetail.innerHTML.includes('这个点的动画') && pointDetail.innerHTML.includes('【模拟】') &&
  pointDetail.innerHTML.includes('去玩分数演示') && pointDetail.innerHTML.includes('去玩分数相等'));
navGo('point-1.9');
check('point page: 1.9 shows experiment tag for thirteen',
  pointDetail.innerHTML.includes('【实验】') && pointDetail.innerHTML.includes('去玩13有几种凑法') &&
  pointDetail.innerHTML.includes('去玩凑十装满'));
navGo('unit-1-0');
check('unit page: animation list for the unit',
  pointDetail.innerHTML.includes('本单元的动画') && pointDetail.innerHTML.includes('去玩13有几种凑法') &&
  pointDetail.innerHTML.includes('去玩凑十装满'));
navGo('grade-1');
check('grade page: unit card shows animation count',
  gradeDetail.innerHTML.includes('动画 3 个'));
// 实验室进演示，返回回实验室（改前走 navGo，返回落到演示总站）。
navGo('lab');
sandbox.labEnterQuestion('q-monty');
check('lab: entering a demo question keeps lab as parent',
  byId.crumbTitle.innerHTML.includes('数学实验室'));
sandbox.navBackFn();
check('lab: back from the demo returns to the lab',
  byId.lab.hidden === false && byId.demos.hidden === true);
// ---------- 15. 动画注册表（§5.1） ----------
// 改前代码没有 ANIM_REGISTRY / navDefFor / isRegistryAnimView：
// hasRegistry 守卫让每条检查报 FAIL 而不是整个测试崩掉；band 文件
// 不存在时加载步骤会跳过（见文件头的加载块）。
const hasRegistry = typeof sandbox.ANIM_REGISTRY === 'object' && sandbox.ANIM_REGISTRY !== null &&
  typeof sandbox.registerAnim === 'function' && typeof sandbox.navDefFor === 'function' &&
  typeof sandbox.isRegistryAnimView === 'function' && typeof sandbox.renderRegistryAnim === 'function';
check('registry: ANIM_REGISTRY has m1a-pair', hasRegistry && !!sandbox.ANIM_REGISTRY['m1a-pair']);
check('registry: m1a-pair fields (kind/grade/points)', hasRegistry &&
  sandbox.ANIM_REGISTRY['m1a-pair'].kind === '实验' && sandbox.ANIM_REGISTRY['m1a-pair'].grade === 1 &&
  JSON.stringify(sandbox.ANIM_REGISTRY['m1a-pair'].points) === JSON.stringify(['1.1']));
check("registry: viewForKey('demo-m1a-pair') is itself",
  hasRegistry && sandbox.viewForKey('demo-m1a-pair') === 'demo-m1a-pair');
check("registry: viewForKey('demo-nope') falls back to home",
  hasRegistry && sandbox.viewForKey('demo-nope') === 'home');
check("registry: animsForPoint('1.1') includes m1a-pair",
  hasRegistry && sandbox.animsForPoint('1.1').indexOf('m1a-pair') >= 0);
check("registry: animKind('m1a-pair') is 实验",
  hasRegistry && sandbox.animKind('m1a-pair') === '实验');
check('registry: navDefFor returns 数学/动画/title crumbs',
  hasRegistry && JSON.stringify(sandbox.navDefFor('demo-m1a-pair').crumbs) === JSON.stringify(['数学', '动画', '一一对应配对法']) &&
  sandbox.navDefFor('demo-m1a-pair').target === 'demo-m1a-pair');
check('registry: navDefFor unknown key returns null',
  hasRegistry && sandbox.navDefFor('demo-nope') === null);
check('registry: navDefFor still returns the old def for demo-fraction',
  hasRegistry && sandbox.navDefFor('demo-fraction').crumbs.join('/') === '数学/动画/分数切一切');
// 点页 1.1 出注册表动画的按钮。
navGo('point-1.1');
check('registry: point 1.1 page offers 去玩一一对应配对法',
  hasRegistry && pointDetail.innerHTML.includes('去玩一一对应配对法') &&
  pointDetail.innerHTML.includes('data-demo-link="demo-m1a-pair"'));
// 进注册表动画：通用卡片画出来，旧卡片藏起来，总目录藏起来。
navGo('demo-m1a-pair');
check('registry: entering a registry anim renders the generic card',
  hasRegistry && byId['demo-anim'].hidden === false &&
  byId['demo-anim'].innerHTML.includes('一一对应配对法') &&
  byId['demo-tenframe'].hidden === true &&
  byId.animDirectory.hidden === true &&
  documentStub.body.dataset.view === 'demo-m1a-pair');
check('registry: breadcrumb shows 数学/动画/一一对应配对法',
  hasRegistry && byId.crumbTitle.innerHTML.includes('一一对应配对法'));
// 我的发现进 math-inquiry-v1。注意顺序：必须在第一次进入后立刻测——
// 桩里重复进入会给同一个保存按钮再绑一次处理器，第一个写成功、后面的
// 读到已清空的输入又把文案盖回去；真实浏览器每次重建 DOM，不会有这问题。
// 整段包在 hasRegistry 里：改前代码没跑过 render，桩里根本没有这些元素，
// 直接碰 byId['m1a-pair-find'] 会抛错而不是干净失败。
if (hasRegistry) {
  byId['m1a-pair-find'].value = '剩下的就是多出来的';
  click(byId['m1a-pair-find-save']);
}
check('registry: m1a-pair discovery saved',
  hasRegistry && byId['m1a-pair-find-saved'].textContent.includes('记下来了'));
check('registry: m1a-pair discovery stored in math-inquiry-v1',
  hasRegistry && JSON.parse(lsData['math-inquiry-v1'] || '[]').some(e => e && e.kind === 'discovery' && e.text === '剩下的就是多出来的'));
// 旧演示视图下通用卡片必须隐藏，不能留空卡。
navGo('demo-tenframe');
check('registry: generic card hidden on an old demo view',
  hasRegistry && byId['demo-anim'].hidden === true && byId['demo-tenframe'].hidden === false);
// 从演示总站进注册表动画：父级仍是演示总站，返回回演示总站。
navGo('demos');
navGo('demo-m1a-pair');
check('registry: entering from the demos list keeps demos as parent',
  hasRegistry && byId.crumbTitle.innerHTML.includes('动画'));
sandbox.navBackFn();
check('registry: back from a registry anim returns to the demos list',
  hasRegistry && byId.demos.hidden === false && byId.demoGrid.hidden === true);
// 玩一局：先猜上面多，再连 3 对（基础 5 比 3），出“上面多出 2 个”，基础档打勾，进度 +1。
navGo('demo-m1a-pair');
const regTriedBefore = parseInt((byId.progressCount.textContent.match(new RegExp('^(\\d+) \\/ ' + TOTAL_DEMOS)) || [])[1] || '0', 10);
if (hasRegistry) {
  click(byId['m1a-pair-guess-top']);
  for (let i = 0; i < 3; i++) {
    click(byId['m1a-pair-top'].children[i]);
    click(byId['m1a-pair-bottom'].children[i]);
  }
}
check('registry: m1a-pair round verdict says 上面多出 2 个',
  hasRegistry && byId['m1a-pair-msg'].textContent.includes('上面多出 2 个'));
check('registry: m1a-pair 基础 tier ticked',
  hasRegistry && byId['m1a-pair-tiers'].children[0].textContent.includes('✓'));
const regTriedAfter = parseInt((byId.progressCount.textContent.match(new RegExp('^(\\d+) \\/ ' + TOTAL_DEMOS)) || [])[1] || '0', 10);
check('registry: finishing a round counts toward tried progress',
  hasRegistry && regTriedAfter === regTriedBefore + 1);
// 总目录：只在演示列表视图出现，按年级 → 单元 → 知识点分组；年级筛选能藏起别的年级；条目能点进动画。
navGo('demos');
check('registry: directory lists m1a-pair under 1 年级/准备课',
  hasRegistry && byId.animDirectory.hidden === false &&
  byId.animDirectory.innerHTML.includes('一一对应配对法') &&
  byId.animDirectory.innerHTML.includes('准备课') &&
  byId.animDirectory.innerHTML.includes('data-demo-link="demo-m1a-pair"'));
if (hasRegistry) {
  const dirFilterBtn = makeEl('button'); dirFilterBtn.dataset.animFilter = '2';
  (byId.animDirectory._handlers.click || []).forEach(fn => fn({ target: dirFilterBtn }));
}
check('registry: directory grade filter hides other grades',
  hasRegistry && byId.animDirectory.innerHTML.indexOf('一一对应配对法') < 0);
if (hasRegistry) {
  const dirAllBtn = makeEl('button'); dirAllBtn.dataset.animFilter = 'all';
  (byId.animDirectory._handlers.click || []).forEach(fn => fn({ target: dirAllBtn }));
}
check('registry: directory filter back to all shows m1a-pair again',
  hasRegistry && byId.animDirectory.innerHTML.includes('一一对应配对法'));
if (hasRegistry) {
  const dirEntryBtn = makeEl('button'); dirEntryBtn.dataset.demoLink = 'demo-m1a-pair';
  (byId.animDirectory._handlers.click || []).forEach(fn => fn({ target: dirEntryBtn }));
}
check('registry: directory entry navigates to the anim',
  hasRegistry && documentStub.body.dataset.view === 'demo-m1a-pair');
navGo('home');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
