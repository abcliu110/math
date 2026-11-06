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
    { id: '3.12', title: '面积', subtitle: '面积单位、长方形面积', how: '数小方块。', why: '面积就是盖了多少个单位正方形。', wrong: '面积就是周长', wrongWhy: '周长是边，面积是面。', visual: '方格纸铺一铺。', method: '铺方块数一数', explainBack: '面积是里面有几个方块。', tryIt: '用小方块铺长方形。', demo: null, recall: { q: '长 4 宽 3 的长方形里能铺几个小方块？', answer: '12 个', hint: '4×3' }, practice: [{ q: '4 行 3 列是多少个方块？', answer: '12 个', hint: '4×3' }, { q: '边长 6 厘米的正方形面积？', answer: '36 平方厘米', hint: '边长×边长' }] },
  ] },
  { unit: '测量', term: '上', points: [
    { id: '3.3', title: '测量', subtitle: '毫米/分米/千米/吨', how: '看进率换算。', why: '单位是打包办法。', wrong: '1 千米=100 米', wrongWhy: '米到千米是 1000 倍。', visual: '单位楼梯。', method: '单位楼梯', explainBack: '1 千米是 1000 米。', tryIt: '量一量书的厚度。', demo: null, recall: { q: '2 千米是多少米？', answer: '2000 米', hint: '1 千米=1000 米' }, practice: [{ q: '3 吨是多少千克？', answer: '3000 千克', hint: '1 吨=1000 千克' }, { q: '5000 米是多少千米？', answer: '5 千米', hint: '1000 米=1 千米' }] },
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
const sandbox = { document: documentStub, window: windowStub, console, setTimeout, Math, JSON, Object, Array, String, Number, parseInt, parseFloat, isNaN, GRADE3_CONTENT, GRADE1_CONTENT, GRADE2_CONTENT, localStorage: localStorageStub };
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
check('demo counter counts a played demo', byId.progressCount.textContent === '1 / 32' &&
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
check('G1 demos count toward the 32-demo progress', g1ProgBefore === '4 / 32' && byId.progressCount.textContent === '5 / 32');
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
check('G2 demos count toward the 32-demo progress', g2ProgBefore === '17 / 32' && byId.progressCount.textContent === '18 / 32');

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
click(byId.arrRotate);
check('array: rotate -> 4 x 2 = 8, same dots', byId.arrEq.textContent === '4 × 2 = 8' && byId.arrMsg.textContent.includes('点还是 8 个'));

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
check('G2: all 15 new demos tried by now', byId.progressCount.textContent === '32 / 32');

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
// 我的进度：分年级真数字；到这里 32 个演示都玩过了
navGo('progress');
check('progress: per-grade rows with real numbers',
  byId.progressCard.innerHTML.includes('1 年级') && byId.progressCard.innerHTML.includes('3 年级') &&
  byId.progressCard.innerHTML.includes('演示') && byId.progressCard.innerHTML.includes('已练'));
check('progress: all 32 demos tried by now', byId.progressCount.textContent === '32 / 32');
// 首页不显示孤零零的“数学”面包屑，子页面显示完整面包屑
navGo('home');
check('home hides the lone crumb title', byId.crumbTitle.hidden === true);
navGo('grades');
check('sub-page shows the breadcrumb', byId.crumbTitle.hidden === false && byId.crumbTitle.innerHTML.includes('数学'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
