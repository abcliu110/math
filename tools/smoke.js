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
    getContext() {
      // canvas 2d stub: function demo draws on it at load.
      return { clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {},
        fillText() {}, arc() {}, fill() {}, fillRect() {},
        strokeStyle: '', lineWidth: 1, fillStyle: '', font: '' };
    },
    addEventListener(t, fn) { (this._handlers[t] = this._handlers[t] || []).push(fn); },
    appendChild(c) { this.children.push(c); c.parentNode = this; return c; },
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
  return false;
}
const byId = {};
const documentStub = {
  getElementById(id) { if (!byId[id]) byId[id] = makeEl('div'); return byId[id]; },
  createElement(tag) { return makeEl(tag); },
  querySelector(sel) { return registry.find(e => matchSel(e, sel)) || makeEl('div'); },
  querySelectorAll(sel) { return registry.filter(e => matchSel(e, sel)); },
  body: makeEl('body'),
};
const windowStub = { scrollTo() {}, document: documentStub };

// ---------- stub grade content (small but schema-faithful) ----------
const GRADE3_CONTENT = { grade: 3, edition: 'A', units: [
  { unit: '分数的初步认识', term: '上', points: [
    { id: '3.7', title: '分数的初步认识', subtitle: '几分之一、几分之几', how: '把一个整体平均分。', why: '分母是切了几份。', wrong: '1/4 比 1/3 大', wrongWhy: '分母是大小不是个数。', visual: '分数条。', method: '分数条 + 数轴', explainBack: '1/4 是一份。', tryIt: '把纸对折两次。', demo: 'fraction', recall: { q: '一个饼切成 4 等份，吃了 1 份，吃了几分之几？', answer: '1/4', hint: '一共 4 份，吃了 1 份' }, practice: [{ q: '1/2 和 1/4 谁大？', answer: '1/2 大', hint: '份数少，每份大' }, { q: '2/7 + 3/7 = ?', answer: '5/7', hint: '分母不变，分子相加' }] },
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
    { id: '1.13', title: '100以内数的认识', subtitle: '十和一', how: '10 个一是 1 个十。', why: '十位值是 10。', wrong: '46 比 38 小', wrongWhy: '只看了个位。', visual: '百数表。', method: '捆小棒', explainBack: '46 有 4 个十。', tryIt: '捆 4 捆加 6 根。', demo: null, recall: { q: '46 里有几个十？', answer: '4 个十', hint: '4 在十位上' }, practice: [{ q: '38 有几个十几个一？', answer: '3 个十 8 个一', hint: '3 在十位，8 在个位', level: '基础' }, { q: '比 46 大 1 的数是？', answer: '47', hint: '个位加 1', level: '提高' }] },
  ] },
] };
const lsData = {};
const localStorageStub = { getItem(k) { return lsData[k] || null; }, setItem(k, v) { lsData[k] = String(v); } };

// ---------- load the real app.js ----------
const root = require('path').resolve(__dirname, '..');
const src = fs.readFileSync(root + '/apps/web/app.js', 'utf8');
const sandbox = { document: documentStub, window: windowStub, console, setTimeout, Math, JSON, Object, Array, String, Number, parseInt, parseFloat, isNaN, GRADE3_CONTENT, GRADE1_CONTENT, localStorage: localStorageStub };
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
check('fading: Q2 hint hidden behind button', pointDetail.innerHTML.includes('要提示') && pointDetail.innerHTML.includes('data-hint-t="1" hidden'));
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
check('demo counter counts a played demo', byId.progressCount.textContent === '1 / 4' &&
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

// ---------- 6. grade 3 still works ----------
navGo('grade-3-mix');
check('grade-3 mix still renders', pointDetail.innerHTML.includes('混着练') && pointDetail.hidden === false);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
