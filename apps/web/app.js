/* 数学小宇宙 · 原型逻辑（原创）
   三个演示都用 Pointer Events / 原生滑杆，触屏和鼠标同一套。 */
'use strict';

/* ---------- 年级内容（按人教版常规顺序整理，待与教材逐册核对） ---------- */
const GRADES = {
  1: { stage: '小学', title: '1 年级 · 认识数', units: [
    { name: '100 以内的数', topics: '数数、数的组成、比大小', visual: '数棒 / 十格阵' },
    { name: '加法与减法', topics: '进位加、退位减、凑十法', visual: '合并与拿走的动画' },
    { name: '认识图形与钟表', topics: '长方形、正方形、整时、半时', visual: '拼图、拨钟表' },
    { name: '简单的加减应用题', topics: '看图列式、讲数学故事', visual: '条形图起步' } ] },
  2: { stage: '小学', title: '2 年级 · 乘法口诀', units: [
    { name: '表内乘法', topics: '乘法口诀、乘法就是几个几', visual: '点阵排一排' },
    { name: '1000 以内的数', topics: '千以内数的读写、比大小', visual: '数位块' },
    { name: '长度与角', topics: '厘米、米、直角、锐角、钝角', visual: '量一量、折一折' },
    { name: '有余数的除法', topics: '分一分、余数比除数小', visual: '分组动画' } ] },
  3: { stage: '小学', title: '3 年级 · 分数初见', units: [
    { name: '多位数乘除法', topics: '口算、笔算、估算', visual: '面积模型' },
    { name: '分数的初步认识', topics: '几分之一、几分之几、比较大小', visual: '切饼、数轴（原型 P1）' },
    { name: '面积与周长', topics: '长方形、正方形', visual: '小方块铺一铺' },
    { name: '时间与数据', topics: '年、月、日、条形统计图', visual: '日历、条形图' } ] },
  4: { stage: '小学', title: '4 年级 · 运算律', units: [
    { name: '四则运算与运算律', topics: '加法交换律、结合律、乘法分配律', visual: '点阵重排' },
    { name: '小数的初步认识', topics: '小数读写、比较大小', visual: '元角分、数轴' },
    { name: '三角形与平行四边形', topics: '分类、内角和、底和高', visual: '拖顶点看角度' },
    { name: '条形统计图', topics: '收集、整理、分析数据', visual: '拖数据点' } ] },
  5: { stage: '小学', title: '5 年级 · 分数与方程', units: [
    { name: '小数乘除法', topics: '小数乘小数、除数是小数的除法', visual: '面积模型、数轴' },
    { name: '简易方程', topics: '用字母表示数、解方程', visual: '天平（原型 P2）' },
    { name: '分数加减与约分通分', topics: '同分母、异分母、约分', visual: '分数条拼一拼' },
    { name: '多边形的面积', topics: '平行四边形、三角形、梯形', visual: '剪拼变形' } ] },
  6: { stage: '小学', title: '6 年级 · 比与圆', units: [
    { name: '分数乘除法', topics: '分数乘分数、除以一个数', visual: '面积模型、倒数' },
    { name: '比和百分数', topics: '比、比例、折扣、税率', visual: '条形图、双条对比' },
    { name: '圆', topics: '周长、面积、圆周率', visual: '滚动一圈量周长' },
    { name: '负数初步与统计', topics: '负数、扇形统计图', visual: '温度数轴' } ] },
  7: { stage: '初中', title: '7 年级 · 有理数与方程', units: [
    { name: '有理数', topics: '正负数、数轴、绝对值', visual: '温度、海拔、电梯' },
    { name: '整式加减', topics: '同类项、合并同类项', visual: '同色方块合并' },
    { name: '一元一次方程', topics: '等式性质、移项、解方程', visual: '天平（原型 P2）' },
    { name: '几何图形初步', topics: '线、角、相交线、平行线', visual: '拖动看角' } ] },
  8: { stage: '初中', title: '8 年级 · 函数与几何', units: [
    { name: '一次函数', topics: 'y=kx+b、斜率、截距', visual: '滑杆联动（原型 P3）' },
    { name: '三角形全等与轴对称', topics: '全等判定、对称图形', visual: '叠合、翻折' },
    { name: '勾股定理', topics: 'a²+b²=c²、面积拼图', visual: '拼面积证明' },
    { name: '数据的分析', topics: '平均数、中位数、方差', visual: '拖数据点' } ] },
  9: { stage: '初中', title: '9 年级 · 二次函数与圆', units: [
    { name: '二次函数', topics: '顶点、对称轴、平移', visual: '拖顶点看抛物线' },
    { name: '反比例函数', topics: 'y=k/x、图象与性质', visual: '滑杆 + 双曲线' },
    { name: '圆', topics: '弧、弦、切线、圆周角', visual: '拖点看圆周角不变' },
    { name: '相似与概率', topics: '相似三角形、概率初步', visual: '缩放对比、模拟实验' } ] },
};

/* ---------- 进度（原型：记演示是否玩过） ----------
   85 个演示全都计入：4 个经典演示 + 13 个一年级实验 + 15 个二年级实验 + 14 个三年级实验 + 16 个四年级实验 + 11 个五年级实验 + 12 个六年级实验。以前只记 4 个经典，
   首页却写着“4 个演示”，演示页上却是 17 张卡，数字对不上
   （2026-11-06 真机审计第 6 条）。 */
const tried = new Set();
const FLAGSHIP = ['tenframe', 'fraction', 'balance', 'function'];
const ALL_DEMOS = ['tenframe', 'fraction', 'balance', 'function',
  'count', 'position', 'split', 'addsub', 'solids', 'bundle', 'clock',
  'tangram', 'sort', 'hundred', 'shop', 'place', 'pattern',
  'ruler', 'estimate', 'angle', 'array', 'observe', 'time', 'share',
  'motion', 'mixop', 'remain', 'thousand', 'weight', 'chart', 'logic', 'pair',
  'elapsed', 'verify', 'units', 'times', 'splitmul', 'rectsq', 'venn',
  'compass', 'divplace', 'stattable', 'fourgrid', 'area', 'calendar', 'decimal',
  'bignum', 'field', 'protractor', 'areamodel', 'parallelogram', 'trialdiv',
  'baraxis', 'teatime', 'zerodiv', 'laws', 'placeslider', 'tearangle',
  'decadd', 'moveshape', 'average', 'chickenrabbit',
  'decmul', 'gridpos', 'decdiv', 'prob', 'polyarea', 'planttree',
  'factor', 'cuboid', 'fracadd', 'rotate', 'findbad',
  'radar', 'ratio', 'circle', 'percent', 'fan', 'lsquare', 'thermo', 'negmul',
  'discount', 'cylinder', 'pigeon', 'conceptmap'];
// 刷新后进度还在：已体验的演示存在本地（只存本机，不上传）。
try { JSON.parse(lsGet('math-tried-demos-v1') || '[]').forEach(k => tried.add(k)); } catch (e) {}
function renderTried() {
  const n = ALL_DEMOS.length;
  const pc = document.getElementById('progressCount');
  if (pc) pc.textContent = tried.size + ' / ' + n;
  const pf = document.getElementById('panelProgFill');
  if (pf) pf.style.width = (tried.size / n * 100) + '%';
  const pt = document.getElementById('panelProgTx');
  if (pt) pt.textContent = tried.size + ' / ' + n + ' 个演示';
  const dp = document.getElementById('panelDemoProg');
  if (dp) dp.style.width = (tried.size / n * 100) + '%';
  const dt = document.getElementById('panelDemoTx');
  if (dt) dt.textContent = n + ' 个演示 · ' + tried.size + ' 已体验';
  const pFill = document.getElementById('progressFill');
  if (pFill) pFill.style.width = (tried.size / n * 100) + '%';
  const pText = document.getElementById('progressText');
  if (pText) pText.textContent =
    tried.size === n ? '演示都玩过了！下一步可以选一个年级做完整单元。'
    : '已体验 ' + tried.size + ' / ' + n + ' 个演示，继续玩剩下的吧。';
  renderProgress();
}
function markTried(key) {
  if (!ALL_DEMOS.includes(key)) return; // “为什么”小实验不计入演示进度
  if (!tried.has(key)) {
    tried.add(key);
    lsSet('math-tried-demos-v1', JSON.stringify([...tried]));
    renderTried();
  }
}
// 注意：首次 renderTried() 不在这里调——它会调 renderProgress()，而 reviewStore
// 和 progressCardEl 在文件后面才初始化；首次调用放在文件末尾的初始化里。

/* ---------- 第 3 轮学习技巧落到内容里（提取、间隔、交叉、渐撤、反馈、校准） ----------
   只记在本地（localStorage；打不开就只记在内存里，不上传、不建账号）。
   间隔：答错 / 没把握 → 明天再来；答对且有把握 → 3 天后再来；连续答对两次 → 7 天后再来。
   交叉：混着练每次从不同单元各抽 1 道题。渐撤：第一道题提示直接给，第二道题要先点“要提示”。 */
function lsGet(k) { try { return (typeof localStorage !== 'undefined') ? localStorage.getItem(k) : null; } catch (e) { return null; } }
function lsSet(k, v) { try { if (typeof localStorage !== 'undefined') localStorage.setItem(k, v); } catch (e) {} }
const REVIEW_KEY = 'math-review-v1';
let reviewStore = {};
try { reviewStore = JSON.parse(lsGet(REVIEW_KEY) || '{}') || {}; } catch (e) { reviewStore = {}; }
function saveReview() { lsSet(REVIEW_KEY, JSON.stringify(reviewStore)); }
function recordAttempt(pointId, correct, confident) {
  const prev = reviewStore[pointId] || { streak: 0 };
  const streak = correct ? (prev.streak || 0) + 1 : 0;
  const days = !correct ? 1 : (!confident ? 1 : (streak >= 2 ? 7 : 3));
  reviewStore[pointId] = { last: Date.now(), correct: !!correct, confident: !!confident, streak: streak, due: Date.now() + days * 86400000 };
  saveReview();
  updateHomeReviewTx();
  return days;
}
function duePointIds() {
  const now = Date.now();
  return Object.keys(reviewStore).filter(id => reviewStore[id] && reviewStore[id].due <= now);
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
let currentPointId = null;
let qaState = {}; // key: pointId + ':' + idx -> {correct, confident}
let stepState = {}; // key: pointId + ':' + qIdx + ':' + stepIdx -> {correct}
let stepQuestions = {}; // key: pointId + ':' + qIdx -> steps array (set at render time)

/* ---------- 年级选择 ---------- */
/* 年级菜单层级是面板：9 块年级面板，点一块进该年级（走 navGo，不是直接调 selectGrade）。 */
const gradePanels = document.getElementById('gradePanels');
const gradeDetail = document.getElementById('gradeDetail');
let currentGrade = null; // 首次加载不预选任何年级：以前默认选中 3 年级，没道理（2026-11-06 真机审计第 10 条）
Object.keys(GRADES).forEach(g => {
  const b = document.createElement('button');
  b.className = 'panel'; b.type = 'button'; b.dataset.navKey = 'grade-' + g;
  b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', 'false');
  b.innerHTML = '<span class="panel-icon" aria-hidden="true">' + g + '</span><b>' + g + ' 年级</b>' +
    '<span class="panel-sub">' + GRADES[g].stage + ' · ' + GRADES[g].title.split('· ')[1] + '</span>' +
    '<span class="panel-tx">' + GRADES[g].units.length + ' 个单元</span>';
  gradePanels.appendChild(b);
});
function selectGrade(g) {
  currentGrade = g;
  updateModeUI('grade');
  [...gradePanels.children].forEach((el, i) => el.setAttribute('aria-selected', String(i + 1 === g)));
  const d = GRADES[g];
  const gd = gradeData(g);
  if (gd) {
    // 该年级已有真实内容：按人教版 A 版单元列出，点一个单元进它的知识点。
    const total = gd.units.reduce((n, u) => n + u.points.length, 0);
    const due = duePointIds().length;
    gradeDetail.innerHTML =
      '<h3>' + d.title + '</h3><p class="muted">人教版 A 版顺序 · ' + gd.units.length + ' 个单元 · ' + total + ' 个知识点；每条都有怎么做、为什么、容易错、讲回来。</p>' +
      '<div class="btn-row"><button class="btn primary" type="button" data-g-mix="1">混着练：5 道不同单元的题</button>' +
      '<button class="btn ghost" type="button" data-g-review="1">今天复习（' + due + ' 条）</button></div>' +
      '<div class="unit-list">' + gd.units.map((u, i) =>
        '<button class="unit unit-btn" type="button" data-unit="' + i + '"><b>' + esc(u.unit) + '</b><p>' + esc(u.term) + ' · ' + u.points.length + ' 个知识点</p>' +
        '<span class="pill">内容已完成</span></button>'
      ).join('') + '</div>';
    gradeDetail.querySelectorAll('[data-unit]').forEach(btn =>
      btn.addEventListener('click', () => navGo('unit-' + g + '-' + btn.dataset.unit)));
    gradeDetail.querySelectorAll('[data-g-mix]').forEach(btn =>
      btn.addEventListener('click', () => navGo('grade-' + g + '-mix')));
    gradeDetail.querySelectorAll('[data-g-review]').forEach(btn =>
      btn.addEventListener('click', () => navGo('grade-' + g + '-review')));
    return;
  }
  gradeDetail.innerHTML =
    '<h3>' + d.title + '</h3><p class="muted">每节课走四步：动手试一试 → 说一说 → 练一练 → 测一测。</p>' +
    '<div class="unit-list">' + d.units.map(u =>
      '<div class="unit"><b>' + u.name + '</b><p>' + u.topics + '</p>' +
      '<span class="pill">可视化：' + u.visual + '</span><span class="pill">状态：待制作</span></div>'
    ).join('') + '</div>';
}

/* ---------- 真实内容（content/grades/grade-N.js 提供 GRADE1_CONTENT … GRADE9_CONTENT） ----------
   内容与原型逻辑分开：知识点文字只活在 content/ 里，app.js 只负责渲染。
   层级：年级 → 单元 → 知识点，每条知识点一页：怎么做、为什么、容易错、
   看图学、动手试一试、讲回来、练一练（由浅入深：基础 → 提高 → 奥数挑战）。文件没加载到时，该年级退回旧的占位。 */
const pointDetail = document.getElementById('pointDetail');
// 每个年级文件都是顶层 const；typeof 守卫让没加载到的年级安全地返回 null。
// map 建在函数里（不在顶层建 const）：加载时 selectGrade() 在它之前就跑，
// 顶层 const 会撞上暂时性死区。
function gradeData(g) {
  const map = {
    1: (typeof GRADE1_CONTENT !== 'undefined' && GRADE1_CONTENT) || null,
    2: (typeof GRADE2_CONTENT !== 'undefined' && GRADE2_CONTENT) || null,
    3: (typeof GRADE3_CONTENT !== 'undefined' && GRADE3_CONTENT) || null,
    4: (typeof GRADE4_CONTENT !== 'undefined' && GRADE4_CONTENT) || null,
    5: (typeof GRADE5_CONTENT !== 'undefined' && GRADE5_CONTENT) || null,
    6: (typeof GRADE6_CONTENT !== 'undefined' && GRADE6_CONTENT) || null,
    7: (typeof GRADE7_CONTENT !== 'undefined' && GRADE7_CONTENT) || null,
    8: (typeof GRADE8_CONTENT !== 'undefined' && GRADE8_CONTENT) || null,
    9: (typeof GRADE9_CONTENT !== 'undefined' && GRADE9_CONTENT) || null,
  };
  return map[g] || null;
}
function grade3Data() { return gradeData(3); }
function findPoint(id) {
  for (const g of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    const gd = gradeData(g);
    if (!gd) continue;
    for (let ui = 0; ui < gd.units.length; ui++) {
      const p = gd.units[ui].points.find(pt => pt.id === id);
      if (p) return { point: p, unit: gd.units[ui], unitIndex: ui, grade: g };
    }
  }
  return null;
}
function renderUnit(g, ui) {
  const gd = gradeData(g);
  if (!gd || !gd.units[ui]) return;
  const u = gd.units[ui];
  pointDetail.innerHTML =
    '<h3>' + esc(u.unit) + '</h3><p class="muted">' + esc(u.term) + ' · ' + u.points.length + ' 个知识点 · 点一条进内容。</p>' +
    '<div class="unit-list">' + u.points.map(p =>
      '<button class="unit unit-btn" type="button" data-point="' + esc(p.id) + '"><b>' + esc(p.id) + ' · ' + esc(p.title) + '</b><p>' + esc(p.subtitle) + '</p>' +
      '<span class="pill">' + esc(p.method) + '</span></button>'
    ).join('') + '</div>';
  pointDetail.querySelectorAll('[data-point]').forEach(btn =>
    btn.addEventListener('click', () => navGo('point-' + btn.dataset.point)));
}
const DEMO_LABEL = { fraction: '去玩分数演示', tenframe: '去玩十格阵', balance: '去玩天平演示', function: '去玩函数演示', count: '去玩数一数', position: '去玩转身找左右', split: '去玩分一分', addsub: '去玩合起来拿走', solids: '去玩立体图形', bundle: '去玩捆小棒', clock: '去玩拨时钟', tangram: '去玩七巧板', sort: '去玩分类分一分', hundred: '去玩百数表', shop: '去玩开小店', place: '去玩数位块', pattern: '去玩找规律', ruler: '去玩尺子量一量', estimate: '去玩先估后算', angle: '去玩转一转角', array: '去玩点阵乘法', observe: '去玩换个方向看', time: '去玩拨时钟（时和分）', share: '去玩轮流分一分', motion: '去玩折一折转一转', mixop: '去玩先算哪一堆', remain: '去玩装一包装不满', thousand: '去玩数轴找近似数', weight: '去玩天平称一称', chart: '去玩投票变条形图', logic: '去玩排除格推理', pair: '去玩搭配连一连', elapsed: '去玩时间轴走一走', verify: '去玩算回去验算', units: '去玩单位楼梯', times: '去玩条形复制', splitmul: '去玩面积切一切', rectsq: '去玩拉一拉变正方形', venn: '去玩韦恩图拖人', compass: '去玩指南针转一转', divplace: '去玩按数位分一分', stattable: '去玩复式统计表', fourgrid: '去玩四格面积模型', area: '去玩铺方砖数面积', calendar: '去玩日历翻一翻', decimal: '去玩十分条比大小', bignum: '去玩大数数轴', field: '去玩足球场拼一拼', protractor: '去玩量角器', areamodel: '去玩面积模型', parallelogram: '去玩平行四边形', trialdiv: '去玩试商调商', baraxis: '去玩条形图轴', teatime: '去玩沏茶排一排', zerodiv: '去玩除以0', laws: '去玩运算定律', placeslider: '去玩数位滑块', tearangle: '去玩撕角拼平角', decadd: '去玩小数加减对齐', moveshape: '去玩图形平移', average: '去玩削峰填谷', chickenrabbit: '去玩鸡兔同笼', decmul: '去玩单位正方形', gridpos: '去玩数对点一点', decdiv: '去玩两数同乘', prob: '去玩摸球模拟', polyarea: '去玩切一刀变长方形', planttree: '去玩种树数间隔', factor: '去玩拼长方形', cuboid: '去玩分层装块', fracadd: '去玩先重切再数', rotate: '去玩绕钉旋转', findbad: '去玩三组称找次品', radar: '去玩雷达找地方', ratio: '去玩比条分一分', circle: '去玩绕绳量圆', percent: '去玩百分条', fan: '去玩扇形转一转', lsquare: '去玩一层层包正方形', thermo: '去玩温度计比一比', negmul: '去玩负数乘法规律', discount: '去玩打折算一算', cylinder: '去玩倒沙装满圆柱', pigeon: '去玩鸽子找洞', conceptmap: '去玩认出老办法' };
/* 分步评分：多步骤题拆成一步一步对。steps 是可选字段，没有 steps 的题照旧渲染。
   自评不是机器判题：每一步的对错都是学生自己标的，丢分报告只是把你标错的步骤列出来。 */
function practiceStepsHtml(q, i, pointId) {
  if (!q.steps || !q.steps.length) return '';
  stepQuestions[pointId + ':' + i] = q.steps;
  q.steps.forEach((s, si) => { delete stepState[pointId + ':' + i + ':' + si]; });
  return '<div class="steps" data-steps="' + i + '" data-steps-point="' + esc(pointId) + '">' +
    '<p class="muted">这道题可以拆成 ' + q.steps.length + ' 步：每一步先自己算，再点开对一对，告诉我这一步你做对没。</p>' +
    q.steps.map((s, si) =>
      '<div class="step"><p><b>第 ' + (si + 1) + ' 步 · ' + esc(s.label) + '</b> ' +
      '<button class="btn ghost small qa-btn" type="button" data-step-reveal="' + i + '-' + si + '">看这一步</button></p>' +
      '<p class="step-a" data-step-a="' + i + '-' + si + '" hidden>' + esc(s.text) + '</p>' +
      '<div class="step-mark" data-step-mark="' + i + '-' + si + '" hidden>' +
      '<p>这一步你做对了吗？ <button class="btn small" type="button" data-step-mark-btn="right">对了</button> <button class="btn small" type="button" data-step-mark-btn="wrong">错了</button></p>' +
      '<p class="qa-a" data-step-saved="' + i + '-' + si + '" hidden></p></div></div>'
    ).join('') +
    '<p class="qa-a step-report" data-step-report="' + i + '" hidden></p></div>';
}
function updateStepReport(pid, qi) {
  const steps = stepQuestions[pid + ':' + qi];
  const report = pointDetail.querySelector('[data-step-report="' + qi + '"]');
  if (!steps || !report) return;
  const marks = steps.map((s, si) => stepState[pid + ':' + qi + ':' + si]);
  if (marks.some(m => !m)) return; // 还有没标的步，先不报
  report.hidden = false;
  const wrong = steps.map((s, si) => ({ s, si })).filter(x => !marks[x.si].correct);
  if (!wrong.length) {
    report.textContent = '丢分报告：全对，思路很稳——每一步都对上了。';
  } else {
    report.textContent = '丢分报告：你卡在' + wrong.map(x => '第 ' + (x.si + 1) + ' 步 · ' + x.s.label).join('、') +
      '。再对一遍' + (wrong.length > 1 ? '这些步' : '这一步') + '：' + wrong.map(x => x.s.text).join('；') + '。';
  }
}
/* 上一篇 / 下一篇：按年级 → 单元 → 知识点顺序，找相邻的两条。 */
function adjacentPoints(id) {
  const order = [];
  for (const g of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    const gd = gradeData(g);
    if (!gd) continue;
    gd.units.forEach(u => u.points.forEach(p => order.push(p)));
  }
  const i = order.findIndex(p => p.id === id);
  if (i < 0) return { prev: null, next: null };
  return { prev: order[i - 1] || null, next: order[i + 1] || null };
}
function renderPoint(id) {
  const f = findPoint(id);
  if (!f) return;
  const p = f.point;
  currentPointId = id;
  const recallHtml = p.recall
    ? '<div class="point-sec recall" id="sec-recall"><h4>先考一考（先想，再往下看）</h4><p>' + esc(p.recall.q) + '</p>' +
      '<button class="btn ghost small qa-btn" type="button" data-recall="1">想好了，看答案</button>' +
      '<p class="qa-a" data-recall-a hidden>答案：' + esc(p.recall.answer) + '（提示：' + esc(p.recall.hint) + '）</p></div>'
    : '';
  // 由浅入深：练一练两道题是 基础 → 提高；有奥数题的知识点再加一道挑战（没有就不显示，不硬凑）。
  const olympiadHtml = p.olympiad
    ? '<div class="point-sec olympiad" id="sec-olympiad"><h4>挑战 · 奥数</h4><p>' + esc(p.olympiad.q) + '</p>' +
      '<button class="btn ghost small qa-btn" type="button" data-olympiad="1">想好了，看答案</button>' +
      '<p class="qa-a" data-olympiad-a hidden>答案：' + esc(p.olympiad.answer) + '（提示：' + esc(p.olympiad.hint) + '）</p></div>'
    : '';
  // 章节导航：一行小药丸，点一个跳到那一节（scrollIntoView，不走锚点 href）。
  const secs = [];
  if (p.recall) secs.push(['sec-recall', '先考一考']);
  secs.push(['sec-how', '怎么做'], ['sec-why', '为什么'], ['sec-wrong', '容易错'],
    ['sec-visual', '看图学'], ['sec-try', '动手试一试'], ['sec-talk', '讲回来'], ['sec-practice', '练一练']);
  if (p.olympiad) secs.push(['sec-olympiad', '挑战 · 奥数']);
  const navHtml = '<div class="point-nav">' + secs.map(s =>
    '<button type="button" data-sec="' + s[0] + '">' + s[1] + '</button>').join('') + '</div>';
  // 上一篇 / 下一篇：按年级 → 单元 → 知识点顺序接着学。
  const adj = adjacentPoints(id);
  const pagerHtml = '<div class="point-pager">' +
    (adj.prev ? '<button type="button" data-pager="point-' + esc(adj.prev.id) + '">← 上一篇 · ' + esc(adj.prev.id) + ' ' + esc(adj.prev.title) + '</button>'
      : '<button type="button" disabled>← 没有上一篇了</button>') +
    (adj.next ? '<button type="button" class="pager-next" data-pager="point-' + esc(adj.next.id) + '">下一篇 · ' + esc(adj.next.id) + ' ' + esc(adj.next.title) + ' →</button>'
      : '<button type="button" class="pager-next" disabled>没有下一篇了 →</button>') +
    '</div>';
  let html = '<h3>' + esc(p.id) + ' · ' + esc(p.title) + '</h3>' +
    '<p class="muted">' + esc(f.unit.unit) + '（' + esc(f.unit.term) + '）· 最佳方法：' + esc(p.method) + '</p>' +
    '<p class="muted">' + esc(p.subtitle) + '</p>' + navHtml + recallHtml +
    '<div class="point-sec" id="sec-how"><h4>怎么做</h4><p>' + esc(p.how) + '</p></div>' +
    '<div class="point-sec" id="sec-why"><h4>为什么</h4><p>' + esc(p.why) + '</p></div>' +
    '<div class="point-sec warn" id="sec-wrong"><h4>容易错</h4><p>错法：' + esc(p.wrong) + '</p><p>为什么错：' + esc(p.wrongWhy) + '</p></div>' +
    '<div class="point-sec" id="sec-visual"><h4>看图学</h4><p>' + esc(p.visual) + '</p></div>' +
    '<div class="point-sec" id="sec-try"><h4>动手试一试</h4><p>' + esc(p.tryIt) + '</p>' +
    (p.demo ? '<div class="btn-row"><button class="btn primary" type="button" data-demo-link="demo-' + esc(p.demo) + '">' + (DEMO_LABEL[p.demo] || '去玩演示') + '</button></div>' : '') + '</div>' +
    // 讲回来只包一层引号：内容文件里的 explainBack 本身已经带了 “ ”，
    // 以前这里又包了一层，全站 142 条都显示成 ““… ””（2026-11-06 真机审计第 10 条）。
    '<div class="point-sec talk" id="sec-talk"><h4>讲回来</h4><p>' + esc(p.explainBack) + '</p></div>' +
    '<div class="point-sec" id="sec-practice"><h4>练一练</h4><p class="muted">两道题由浅入深：基础 → 提高。卡住了点“要提示”，再点“看答案”对一对。答完告诉我你答对没、有把握没——答错的和没把握的，明天会回来找你。' + (p.olympiad ? '做完还有一道奥数挑战。' : '') + '</p>' + p.practice.map((q, i) =>
      '<div class="qa"><p>' + (i + 1) + '. ' + (q.level ? '<span class="pill">' + esc(q.level) + '</span> ' : '') + esc(q.q) + '</p>' +
      // 提示一律收在“要提示”按钮后面：以前 Q1 的提示直接露在题下面，
      // Q2 的提示却要先点按钮，两道题不一致（2026-11-06 真机审计第 4 条）。
      '<button class="btn ghost small qa-btn" type="button" data-hint="' + i + '">要提示</button><p class="hint" data-hint-t="' + i + '" hidden>提示：' + esc(q.hint) + '</p>' +
      '<button class="btn ghost small qa-btn" type="button" data-qa="' + i + '">看答案</button>' +
      '<p class="qa-a" data-qa-a="' + i + '" hidden>答案：' + esc(q.answer) + '</p>' +
      practiceStepsHtml(q, i, id) +
      '<div class="qa-mark" data-qa-mark="' + i + '" data-point="' + esc(id) + '" hidden>' +
      '<p>你答对了吗？ <button class="btn small" type="button" data-mark="right">答对了</button> <button class="btn small" type="button" data-mark="wrong">答错了</button></p>' +
      '<p>答之前有把握吗？ <button class="btn small" type="button" data-conf="yes">有把握</button> <button class="btn small" type="button" data-conf="no">没把握</button></p>' +
      '<p class="qa-a" data-qa-saved="' + i + '" hidden></p></div></div>'
    ).join('') + '</div>' + olympiadHtml + pagerHtml;
  pointDetail.innerHTML = html;
  pointDetail.querySelectorAll('[data-demo-link]').forEach(el =>
    el.addEventListener('click', () => goDemoFromHere(el.dataset.demoLink)));
}
/* 从知识点页进演示：演示压在当前栈顶，返回回知识点页（而不是跳去演示总站）。
   从演示总站进演示还是走 navGo，父级仍是演示总站。 */
function goDemoFromHere(demoKey) {
  const def = NAV_DEFS[demoKey];
  if (!def) return;
  const top = navStack[navStack.length - 1];
  const entry = { key: demoKey, crumbs: top.crumbs.concat([def.crumbs[def.crumbs.length - 1]]), target: def.target };
  navStack.push(entry);
  enterNavEntry(entry);
  renderNav();
}
/* 混着练（交叉练习）：每次从 5 个不同单元各抽 1 道题，打乱顺序练。 */
let mixGrade = 3;
function renderMix(g) {
  if (g) mixGrade = g;
  const gd = gradeData(mixGrade);
  if (!gd) return;
  const picks = shuffle(gd.units.filter(u => u.points.length)).slice(0, 5).map(u => {
    const p = u.points[Math.floor(Math.random() * u.points.length)];
    return { point: p, q: p.practice[Math.floor(Math.random() * p.practice.length)] };
  });
  currentPointId = null;
  pointDetail.innerHTML = '<h3>混着练</h3><p class="muted">5 道题，来自 5 个不同单元——混着练比一个单元一个单元刷记得更牢。答完对答案，再告诉我对错和把握。</p>' + picks.map((pk, i) =>
    '<div class="point-sec"><h4>' + esc(pk.point.id) + ' · ' + esc(pk.point.title) + '</h4><p>' + (pk.q.level ? '<span class="pill">' + esc(pk.q.level) + '</span> ' : '') + esc(pk.q.q) + '</p>' +
    '<button class="btn ghost small qa-btn" type="button" data-qa="' + i + '">看答案</button>' +
    '<p class="qa-a" data-qa-a="' + i + '" hidden>答案：' + esc(pk.q.answer) + '（提示：' + esc(pk.q.hint) + '）</p>' +
    practiceStepsHtml(pk.q, i, pk.point.id) +
    '<div class="qa-mark" data-qa-mark="' + i + '" data-point="' + esc(pk.point.id) + '" hidden>' +
    '<p>你答对了吗？ <button class="btn small" type="button" data-mark="right">答对了</button> <button class="btn small" type="button" data-mark="wrong">答错了</button></p>' +
    '<p>答之前有把握吗？ <button class="btn small" type="button" data-conf="yes">有把握</button> <button class="btn small" type="button" data-conf="no">没把握</button></p>' +
    '<p class="qa-a" data-qa-saved="' + i + '" hidden></p></div></div>'
  ).join('') + '<div class="btn-row"><button class="btn primary" type="button" data-mix-again="1">再混 5 道</button></div>';
  pointDetail.querySelectorAll('[data-mix-again]').forEach(b => b.addEventListener('click', () => renderMix()));
}
/* 今天复习（间隔重复）：到期的知识点列出来，点一条回去重练。 */
function renderReview() {
  const due = duePointIds();
  const practiced = Object.keys(reviewStore).length;
  const mastered = Object.keys(reviewStore).filter(id => reviewStore[id].streak >= 2).length;
  let html = '<h3>今天复习</h3><p class="muted">练过 ' + practiced + ' 条 · 已掌握 ' + mastered + ' 条（连续答对两次算掌握）。答错和没把握的第二天回来，答对且有把握的 3 天后回来，掌握的 7 天后回来。</p>';
  if (!due.length) {
    html += '<div class="point-sec"><p>今天没有到期的复习。去练一练新的，或者点“混着练”。</p></div>';
  } else {
    html += '<div class="unit-list">' + due.map(id => {
      const f = findPoint(id);
      const title = f ? f.point.title : id;
      const st = reviewStore[id];
      return '<button class="unit unit-btn" type="button" data-point="' + esc(id) + '"><b>' + esc(id) + ' · ' + esc(title) + '</b><p>' + (st.correct ? '上次答对' : '上次答错') + ' · ' + (st.confident ? '有把握' : '没把握') + '</p><span class="pill">今天复习</span></button>';
    }).join('') + '</div>';
  }
  // 明天回来：已经排进明天、但今天还没到期的（答错 / 没把握的第二天回来）。
  // 不写这一段，刚答错的题今天看不到、明天才突然出现，没人知道它被排进去了
  // （2026-11-06 真机测试：第 4 项按“今天能看到”判了错，数据其实是对的）。
  const now = Date.now();
  const tomorrow = Object.keys(reviewStore).filter(id => {
    const st = reviewStore[id];
    return st && st.due > now && st.due <= now + 86400000;
  });
  if (tomorrow.length) {
    html += '<div class="point-sec"><h4>明天回来</h4><p>这些明天到期，到时候再练。</p><div class="unit-list">' + tomorrow.map(id => {
      const f = findPoint(id);
      const title = f ? f.point.title : id;
      const st = reviewStore[id];
      return '<button class="unit unit-btn" type="button" data-point="' + esc(id) + '"><b>' + esc(id) + ' · ' + esc(title) + '</b><p>' + (st.correct ? '上次答对' : '上次答错') + ' · ' + (st.confident ? '有把握' : '没把握') + '</p><span class="pill">明天</span></button>';
    }).join('') + '</div></div>';
  }
  pointDetail.innerHTML = html;
  pointDetail.querySelectorAll('[data-point]').forEach(btn =>
    btn.addEventListener('click', () => navGo('point-' + btn.dataset.point)));
}
/* 错题本（首页面板）：真实错题列表——最近一次答错的知识点，点一条回知识点页重练。
   之前这里只有 2 条占位示例，而且因为它和各年级的今天复习共用 view 'review'，
   点进来还会把上一个知识点页的旧内容留在屏幕上（2026-11-06 真机测出）。
   现在错题本一屏里还有今天复习和明天回来：错了的题今天练、明天练，都在这里找得到。 */
function reviewItemHtml(id, pill) {
  const f = findPoint(id);
  const title = f ? f.point.title : id;
  const st = reviewStore[id];
  return '<button class="unit unit-btn" type="button" data-point="' + esc(id) + '"><b>' + esc(id) + ' · ' + esc(title) + '</b><p>' + (st.correct ? '上次答对' : '上次答错') + ' · ' + (st.confident ? '有把握' : '没把握') + '</p><span class="pill">' + pill + '</span></button>';
}
function renderWrongBook() {
  const wrong = Object.keys(reviewStore).filter(id => reviewStore[id] && reviewStore[id].correct === false);
  let html = '<h3>错题本</h3>';
  if (!wrong.length) {
    html += '<p class="muted">还没有错题。练一练里答错的题会自动记到这里，点一条回去重练。</p>';
  } else {
    html += '<p class="muted">共 ' + wrong.length + ' 条错题，点一条回去重练。</p><ul class="wrong-list">' + wrong.map(id => {
      const f = findPoint(id);
      const title = f ? f.point.title : id;
      const st = reviewStore[id];
      const when = st.due <= Date.now() ? '今天复习' : '明天回来';
      return '<li><button class="unit unit-btn" type="button" data-point="' + esc(id) + '"><b>' + esc(id) + ' · ' + esc(title) + '</b><small>上次答错 · ' + when + '</small></button></li>';
    }).join('') + '</ul>';
  }
  const due = duePointIds();
  if (due.length) {
    html += '<div class="point-sec"><h4>今天复习</h4><p>这些今天到期，点一条回去重练。</p><div class="unit-list">' + due.map(id => reviewItemHtml(id, '今天复习')).join('') + '</div></div>';
  } else {
    html += '<div class="point-sec"><h4>今天复习</h4><p>今天没有到期的复习。去练一练新的，或者点“混着练”。</p></div>';
  }
  const now = Date.now();
  const tomorrow = Object.keys(reviewStore).filter(id => {
    const st = reviewStore[id];
    return st && st.due > now && st.due <= now + 86400000;
  });
  if (tomorrow.length) {
    html += '<div class="point-sec"><h4>明天回来</h4><p>这些明天到期，到时候再练。</p><div class="unit-list">' + tomorrow.map(id => reviewItemHtml(id, '明天')).join('') + '</div></div>';
  }
  reviewCardEl.innerHTML = html;
  reviewCardEl.querySelectorAll('[data-point]').forEach(btn =>
    btn.addEventListener('click', () => navGo('point-' + btn.dataset.point)));
  // 首页错题本面板的小字也改成真实条数，别再写“2 条示例”。
  const tx = document.querySelector('[data-nav-key="review"] .panel-tx');
  if (tx) tx.textContent = wrong.length ? wrong.length + ' 条错题' : '还没有错题';
  updateHomeReviewTx();
}
/* 首页“今天复习”面板的小字：今天到期的条数。记一次答题就刷新一次。 */
function updateHomeReviewTx() {
  const tx = document.getElementById('todayReviewTx');
  if (!tx) return;
  const n = duePointIds().length;
  tx.textContent = n ? '今天有 ' + n + ' 条到期' : '今天没有到期的';
}
/* 我的进度：每年级一行真数字——演示玩过几个 / 练过几条 / 掌握几条。
   只用本机已有的数据（tried 演示集合 + reviewStore），不编假数据。
   条的宽度 = 练过知识点 / 该年级全部知识点。 */
const DEMO_GRADES = { tenframe: [1, 2], fraction: [3, 4, 5, 6], balance: [5, 6, 7], function: [6, 7, 8],
  count: [1], position: [1], split: [1], addsub: [1], solids: [1], bundle: [1], clock: [1],
  tangram: [1], sort: [1], hundred: [1], shop: [1], place: [1], pattern: [1],
  ruler: [2], estimate: [2], angle: [2], array: [2], observe: [2, 4, 5], time: [2], share: [2],
  motion: [2], mixop: [2], remain: [2], thousand: [2], weight: [2], chart: [2], logic: [2], pair: [2, 3],
  elapsed: [3], verify: [3], units: [3], times: [3], splitmul: [3], rectsq: [3], venn: [3],
  compass: [3], divplace: [3], stattable: [3], fourgrid: [3], area: [3], calendar: [3], decimal: [3],
  bignum: [4], field: [4], protractor: [4], areamodel: [4], parallelogram: [4], trialdiv: [4],
  baraxis: [4], teatime: [4], zerodiv: [4], laws: [4], placeslider: [4], tearangle: [4],
  decadd: [4], moveshape: [4], average: [4], chickenrabbit: [4],
  decmul: [5], gridpos: [5], decdiv: [5], prob: [5], polyarea: [5], planttree: [5],
  factor: [5], cuboid: [5], fracadd: [5], rotate: [5], findbad: [5],
  radar: [6], ratio: [6], circle: [6], percent: [6], fan: [6], lsquare: [6],
  thermo: [6], negmul: [6], discount: [6], cylinder: [6], pigeon: [6], conceptmap: [6] };
function renderProgress() {
  const card = document.getElementById('progressCard');
  if (!card) return;
  const practiced = Object.keys(reviewStore).length;
  const mastered = Object.keys(reviewStore).filter(id => reviewStore[id].streak >= 2).length;
  let html = '<h3>我的进度</h3><p class="muted">一共玩过 ' + tried.size + ' / ' + ALL_DEMOS.length + ' 个演示 · 练过 ' + practiced + ' 条知识点 · 已掌握 ' + mastered + ' 条（连续答对两次算掌握）。进度只存在本机浏览器里。</p>';
  for (let g = 1; g <= 9; g++) {
    const gd = gradeData(g);
    if (!gd) continue;
    const total = gd.units.reduce((n, u) => n + u.points.length, 0);
    const ids = [];
    gd.units.forEach(u => u.points.forEach(p => ids.push(p.id)));
    const done = ids.filter(id => reviewStore[id]).length;
    const mast = ids.filter(id => reviewStore[id] && reviewStore[id].streak >= 2).length;
    const demosInGrade = ALL_DEMOS.filter(k => (DEMO_GRADES[k] || []).includes(g));
    const demosDone = demosInGrade.filter(k => tried.has(k)).length;
    const pct = total ? Math.round(done / total * 100) : 0;
    html += '<div class="prog-row"><b>' + g + ' 年级 · ' + esc(GRADES[g].title.split('· ')[1] || '') + '</b>' +
      '<p class="prog-nums">演示 ' + demosDone + ' / ' + demosInGrade.length + ' · 已练 ' + done + ' / ' + total + ' 条 · 已掌握 ' + mast + ' 条</p>' +
      '<div class="prog-track"><i style="width:' + pct + '%"></i></div></div>';
  }
  card.innerHTML = html;
}
if (pointDetail) pointDetail.addEventListener('click', e => {
  const secBtn = e.target.closest('[data-sec]');
  if (secBtn) {
    // 章节导航：跳到那一节的顶部，顶栏吸顶的高度由 .point-sec 的 scroll-margin-top 留出来。
    const t = pointDetail.querySelector('#' + secBtn.dataset.sec);
    if (t && t.scrollIntoView) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  const pagerBtn = e.target.closest('[data-pager]');
  if (pagerBtn) { navGo(pagerBtn.dataset.pager); return; }
  const recallBtn = e.target.closest('[data-recall]');
  if (recallBtn) {
    const ans = pointDetail.querySelector('[data-recall-a]');
    if (ans) { ans.hidden = !ans.hidden; recallBtn.textContent = ans.hidden ? '想好了，看答案' : '收起答案'; }
    return;
  }
  const olyBtn = e.target.closest('[data-olympiad]');
  if (olyBtn) {
    const ans = pointDetail.querySelector('[data-olympiad-a]');
    if (ans) { ans.hidden = !ans.hidden; olyBtn.textContent = ans.hidden ? '想好了，看答案' : '收起答案'; }
    return;
  }
  const hintBtn = e.target.closest('[data-hint]');
  if (hintBtn) {
    const t = pointDetail.querySelector('[data-hint-t="' + hintBtn.dataset.hint + '"]');
    if (t) { t.hidden = !t.hidden; hintBtn.textContent = t.hidden ? '要提示' : '收起提示'; }
    return;
  }
  const qaBtn = e.target.closest('[data-qa]');
  if (qaBtn) {
    const i = qaBtn.dataset.qa;
    const ans = pointDetail.querySelector('[data-qa-a="' + i + '"]');
    const mark = pointDetail.querySelector('[data-qa-mark="' + i + '"]');
    if (ans) { ans.hidden = !ans.hidden; qaBtn.textContent = ans.hidden ? '看答案' : '收起答案'; }
    if (mark) mark.hidden = ans ? ans.hidden : true;
    return;
  }
  const stepReveal = e.target.closest('[data-step-reveal]');
  if (stepReveal) {
    const key = stepReveal.dataset.stepReveal;
    const a = pointDetail.querySelector('[data-step-a="' + key + '"]');
    const m = pointDetail.querySelector('[data-step-mark="' + key + '"]');
    if (a) { a.hidden = !a.hidden; stepReveal.textContent = a.hidden ? '看这一步' : '收起这一步'; }
    if (m) m.hidden = a ? a.hidden : true;
    return;
  }
  const stepMarkBtn = e.target.closest('[data-step-mark-btn]');
  if (stepMarkBtn) {
    const markRow = e.target.closest('[data-step-mark]');
    if (!markRow) return;
    const key = markRow.dataset.stepMark; // "qi-si"
    const qi = key.split('-')[0];
    const si = key.split('-')[1];
    const stepsEl = pointDetail.querySelector('[data-steps="' + qi + '"]');
    const pid = (stepsEl && stepsEl.dataset.stepsPoint) || currentPointId;
    const skey = pid + ':' + qi + ':' + si;
    const wasWrong = stepState[skey] && stepState[skey].correct === false;
    const correct = stepMarkBtn.dataset.stepMarkBtn === 'right';
    stepState[skey] = { correct };
    markRow.querySelectorAll('[data-step-mark-btn]').forEach(b => b.setAttribute('aria-pressed', String(b === stepMarkBtn)));
    const saved = pointDetail.querySelector('[data-step-saved="' + key + '"]');
    if (saved) {
      saved.hidden = false;
      if (!correct) {
        saved.textContent = '记下了：这一步错了，明天复习时会回来找你。';
        if (!wasWrong) recordAttempt(pid, false, false);
      } else {
        saved.textContent = '这一步对了。';
      }
    }
    updateStepReport(pid, qi);
    return;
  }
  const markBtn = e.target.closest('[data-mark]');
  const confBtn = e.target.closest('[data-conf]');
  if (markBtn || confBtn) {
    const row = e.target.closest('[data-qa-mark]');
    if (!row) return;
    const pid = row.dataset.point || currentPointId;
    const key = pid + ':' + row.dataset.qaMark;
    qaState[key] = qaState[key] || {};
    if (markBtn) qaState[key].correct = markBtn.dataset.mark === 'right';
    if (confBtn) qaState[key].confident = confBtn.dataset.conf === 'yes';
    if (markBtn) row.querySelectorAll('[data-mark]').forEach(b => b.setAttribute('aria-pressed', String(b === markBtn)));
    if (confBtn) row.querySelectorAll('[data-conf]').forEach(b => b.setAttribute('aria-pressed', String(b === confBtn)));
    const st = qaState[key];
    if (st.correct !== undefined && st.confident !== undefined) {
      const days = recordAttempt(pid, st.correct, st.confident);
      const saved = pointDetail.querySelector('[data-qa-saved="' + row.dataset.qaMark + '"]');
      if (saved) {
        saved.hidden = false;
        saved.textContent = st.correct
          ? (st.confident ? '记下了：答对且有把握，' + days + ' 天后再练这条。' : '记下了：答对但没把握，明天再练一次。')
          : '记下了：这次错了，明天再练一次。';
      }
    }
  }
});

/* ---------- 维度切换：同一批 1–6 年级内容，按 5 个维度重分组 ----------
   映射为本原型的整理，待与人教版教材逐册核对（待核实）。
   WHY 均为原创中文改写，没有直接复制任何教程文字。 */
const DIMENSIONS = [
  { id: 'domain', name: '内容领域', short: '按内容分', desc: '课标的四大块。同一知识点只归一个主领域，方便看目录和进度。', cats: [
    { name: '数与代数', desc: '数、运算、字母和方程，算的是数量关系。', topics: [
      { g: 1, t: '100以内数、加减法', why: '10个一换1个十，进位就是打包，退位就是拆包。' },
      { g: 2, t: '表内乘法、除法', why: '乘法是几组几相加，除法是反过来找每份是多少。' },
      { g: 3, t: '分数初步、多位数乘除', why: '分数是平均分出来的数；乘法是面积，分开算再合起来。' },
      { g: 4, t: '运算律、小数意义', why: '交换、结合、分配，都是换顺序、换分组，总量不变。' },
      { g: 5, t: '小数乘除、简易方程、分数加减', why: '小数是分母为10的分数；方程是天平，两边要一起动。' },
      { g: 6, t: '分数乘除、比、百分数、负数', why: '比是两个量相除，百分数是分母为100的比，负数是往反方向走。' } ] },
    { name: '图形与几何', desc: '认图形、量长度面积体积，看图形怎么动。', topics: [
      { g: 1, t: '认识图形与钟表', why: '会滚的是球，能叠的是盒子，形状看边和角，不看大小颜色。' },
      { g: 2, t: '长度与角、观察物体', why: '量长度要从0开始数单位；角看张开多大，不看边长。' },
      { g: 3, t: '长方形和正方形、面积', why: '面积是数小方块，长乘宽就是数有几行、每行几个。' },
      { g: 4, t: '三角形、平行四边形、角的度量', why: '三角形三个角撕下来拼成一条直线，所以是180度。' },
      { g: 5, t: '多边形的面积、长方体和正方体', why: '平行四边形剪一刀拼成长方形，体积是一层一层摞起来的。' },
      { g: 6, t: '圆、圆柱与圆锥', why: '圆的周长除以直径永远约等于3.14，三个圆锥正好装满一个圆柱。' } ] },
    { name: '统计与概率', desc: '收集、整理、看图说话，再看发生的可能性。', topics: [
      { g: 1, t: '分类与整理', why: '先定一条规则再分，每样东西只进一个盒子，加起来要等于总数。' },
      { g: 2, t: '数据收集整理、推理', why: '一个记号就是一个真实答案，排除掉不可能的，剩下的就是答案。' },
      { g: 3, t: '复式统计表、条形图起步', why: '条形的长短就是多少，放在一起才能比。' },
      { g: 4, t: '条形统计图、平均数', why: '平均数是把总数重新平分，不是中间那个数。' },
      { g: 5, t: '折线统计图、可能性', why: '折线斜表示变化快慢；可能性是几分之几，不是下一次一定发生。' },
      { g: 6, t: '扇形统计图、百分数应用', why: '圆是100%，1%就是3.6度，角度和份额成正比。' } ] },
    { name: '综合与实践', desc: '把几块知识拼起来解决一个真问题。', topics: [
      { g: 1, t: '数学乐园、小小商店', why: '买东西就是加减法，钱是换算过的数。' },
      { g: 2, t: '量一量、比一比', why: '先估再量，估错了也能从量里发现。' },
      { g: 3, t: '掷一掷、搭配', why: '先列出所有可能，再数一数，不要漏也不要重。' },
      { g: 4, t: '优化、鸡兔同笼', why: '一次换一只鸡成兔，腿就多2条，差几条就换几次。' },
      { g: 5, t: '植树问题、找次品', why: '10个间隔要11棵树；称一次能分三堆，不是两堆。' },
      { g: 6, t: '鸽巢问题、绿色出行', why: '先每个洞放一只，多的那只一定得和别人挤一个洞。' } ] }
  ] },
  { id: 'cognitive', name: '认知层次', short: '按深浅分', desc: '同一个知识点，从知道名字到能用它解决问题，是四级台阶。', cats: [
    { name: '知道', desc: '能认出来、能叫出名字。', topics: [
      { g: 1, t: '认识数、认识图形、认识钟表', why: '先认出它是什么，再说它叫什么。' },
      { g: 2, t: '认识厘米和米、认识角、认识时间', why: '知道单位和工具长什么样，是动手的前提。' },
      { g: 3, t: '认识分数、小数、年、月、日', why: '先知道分数和小数是数，不是两个数字叠在一起。' },
      { g: 4, t: '认识大数、认识公顷、认识角的分类', why: '大数按万分组读，角按张开大小分类。' } ] },
    { name: '理解', desc: '能说出为什么，能用图讲明白。', topics: [
      { g: 2, t: '乘法就是几个几、除法是乘法的反面', why: '3乘4是3组4，倒过来12除以3就是每组4。' },
      { g: 3, t: '分数是数轴上的一个点', why: '3/4和6/8落在同一个点，吃的量一样多。' },
      { g: 4, t: '运算律为什么成立、小数点为什么移动', why: '换顺序不改变总量；小数点移动其实是数字在移动。' },
      { g: 6, t: '负负得正、圆周率为什么不变', why: '乘负1是翻一次，翻两次就回来了；每个圆的周长除以直径都一样。' } ] },
    { name: '掌握', desc: '能熟练算对，能自己列式。', topics: [
      { g: 1, t: '20以内进位加法、退位减法', why: '凑十和破十都是围着10打包和拆包。' },
      { g: 2, t: '表内乘法口诀、100以内加减', why: '口诀是点阵的总结，不是死背的顺口溜。' },
      { g: 4, t: '三位数乘两位数、除数是两位数的除法', why: '试商就是先猜一个商，再用乘法验算，不对就调。' },
      { g: 5, t: '小数乘除、分数加减', why: '先把单位统一，再算；分数加减要先切成一样大的份。' } ] },
    { name: '运用', desc: '能用到新问题里，能自己选方法。', topics: [
      { g: 3, t: '两位数乘两位数解决问题、面积应用', why: '先看清题目要的是几行几列，再决定用乘法还是面积。' },
      { g: 4, t: '优化、鸡兔同笼、行程问题', why: '先想清楚每换一次差多少，再算要换几次。' },
      { g: 5, t: '列方程解应用题、按比分配', why: '先把未知数当成一个数，天平两边一起动。' },
      { g: 6, t: '比例、折扣税率利率、圆柱圆锥应用', why: '先找准单位1，再看百分率是按哪个数算的。' } ] }
  ] },
  { id: 'literacy', name: '核心素养', short: '按能力分', desc: '课标里评价孩子的六种能力，同一个能力会横跨好几个年级。', cats: [
    { name: '运算能力', desc: '算得对、算得快，还知道为什么这样算。', topics: [
      { g: 1, t: '20以内加减、100以内加减', why: '满十进一，借一当十，总量不变。' },
      { g: 3, t: '多位数乘除、口算估算', why: '先估一个大概，再算精确值，估算能帮你验算。' },
      { g: 5, t: '小数乘除、分数加减', why: '小数点对齐就是相同数位对齐，分数要先通分。' } ] },
    { name: '推理意识', desc: '能从已知推出未知，能排除不可能。', topics: [
      { g: 1, t: '找规律', why: '找到重复的单元，才能预测下一个。' },
      { g: 2, t: '推理、搭配', why: '排除掉不可能的，剩下的就是答案。' },
      { g: 4, t: '鸡兔同笼、优化', why: '每换一次差一个固定数，差多少就换几次。' },
      { g: 6, t: '鸽巢问题、数与形', why: '先每个洞放一只，多的那只一定得挤。' } ] },
    { name: '模型意识', desc: '能把文字变成图、变成算式。', topics: [
      { g: 1, t: '看图列式、条形图起步', why: '图里的每一部分都能对应算式里的一项。' },
      { g: 3, t: '倍的认识、条形图', why: '12是4的3倍，就是12的条子是4的条子的3份。' },
      { g: 5, t: '用字母表示数、简易方程', why: '字母就是一个还不知道的数，天平就是等式。' },
      { g: 6, t: '比、比例、正反比例', why: '正比例是比值不变，反比例是乘积不变。' } ] },
    { name: '空间观念', desc: '能在脑子里转一转、拼一拼图形。', topics: [
      { g: 1, t: '认识立体图形、拼一拼', why: '会滚的是球，能叠的是盒子。' },
      { g: 3, t: '长方形和正方形、面积', why: '面积是数小方块，拼一拼总量不变。' },
      { g: 5, t: '多边形的面积、旋转', why: '剪下来拼过去，面积不变，形状变了。' },
      { g: 6, t: '圆、圆柱与圆锥', why: '侧面展开是一张长方形，长就是圆的周长。' } ] },
    { name: '数据意识', desc: '会收集、会看图、会说数据告诉了什么。', topics: [
      { g: 2, t: '数据收集整理', why: '一个记号就是一个人，数漏了总数就对不上。' },
      { g: 4, t: '条形统计图、平均数', why: '条形要从0开始比，平均数是重新平分。' },
      { g: 5, t: '折线统计图', why: '线陡表示变化快，线平表示变化慢。' },
      { g: 6, t: '扇形统计图', why: '圆是整体，每一份的角度和份额成正比。' } ] },
    { name: '应用意识', desc: '能把数学用到生活里。', topics: [
      { g: 1, t: '认识人民币、小小商店', why: '1元是10角，买东西就是换算加减。' },
      { g: 3, t: '时间、测量、购物问题', why: '先看清单位，再决定是加减还是乘除。' },
      { g: 6, t: '折扣、税率、利率、比例尺', why: '百分率永远是按某一个数算的，先找准这个数。' } ] }
  ] },
  { id: 'prereq', name: '前置关系', short: '按先后分', desc: '点一条链，再点其中一步，就能看到它前面需要什么、后面通向哪里。', chains: [
    { name: '加减法链', desc: '从数数到多位数加减，核心一直是10个一换1个十。', steps: [
      { g: 1, t: '数数与分合', why: '数就是一个一个配对，最后一句话就是总数。' },
      { g: 1, t: '20以内进位加法', why: '凑十：给9补1变成10，再加剩下的。' },
      { g: 1, t: '100以内加减', why: '个位加个位，十位加十位，满十再打包。' },
      { g: 2, t: '两位数加减与进位退位', why: '借来的1个十就是10个一，总量不变。' },
      { g: 3, t: '万以内加减与验算', why: '加法用减法验算，减法用加法验算，互为反面。' } ] },
    { name: '乘除法链', desc: '乘法是几组几，除法是反过来找，余数是分不完剩下的。', steps: [
      { g: 2, t: '表内乘法', why: '3乘4是3组4，点阵转个方向还是12个点。' },
      { g: 2, t: '表内除法', why: '12除以3是每份4，因为4乘3等于12。' },
      { g: 2, t: '有余数的除法', why: '余数一定比除数小，不然还能再分一组。' },
      { g: 3, t: '多位数乘一位数', why: '23乘4是20乘4加3乘4，面积分开算。' },
      { g: 4, t: '三位数乘两位数、除数是两位数的除法', why: '试商先猜，再用乘法验算，不对就调。' } ] },
    { name: '分数链', desc: '分数先是平均分出来的数，再变成可以加减乘除的数。', steps: [
      { g: 3, t: '分数初步认识', why: '把一个整体平均分成几份，取其中的几份。' },
      { g: 5, t: '分数意义与性质、约分通分', why: '分子分母同乘一个数就是乘1，量不变，只是切法变了。' },
      { g: 5, t: '分数加减', why: '份的大小不一样不能直接加，先切成一样大的份。' },
      { g: 6, t: '分数乘法', why: '三分之二乘五分之四，是先涂五分之四，再取其中的三分之二。' },
      { g: 6, t: '分数除法', why: '除以五分之一，就是数里面能装几个五分之一。' } ] },
    { name: '小数链', desc: '小数是分母为10、100的分数，写成了另一种样子。', steps: [
      { g: 3, t: '小数初步认识', why: '0.5就是5个十分之一，钱里的角就是十分之一元。' },
      { g: 4, t: '小数意义与性质', why: '0.5等于0.50，因为5个十分之一就是50个百分之一。' },
      { g: 4, t: '小数加减', why: '小数点对齐，就是相同数位对齐。' },
      { g: 5, t: '小数乘除', why: '0.3乘0.4是12个百分之一，先算3乘4，再看小数点。' },
      { g: 6, t: '百分数', why: '百分数就是分母为100的比，方便直接比大小。' } ] },
    { name: '图形与面积链', desc: '从认图形，到量长度，到数面积，再到算体积。', steps: [
      { g: 1, t: '认识图形', why: '看边和角认图形，不看大小和颜色。' },
      { g: 3, t: '长方形和正方形、面积', why: '面积是数小方块，长乘宽就是数有几行、每行几个。' },
      { g: 4, t: '三角形、平行四边形', why: '三角形三个角拼起来是一条直线，平行四边形剪一刀能拼成长方形。' },
      { g: 5, t: '多边形的面积', why: '两个一样的三角形拼成一个平行四边形，所以三角形面积要除以2。' },
      { g: 6, t: '圆、圆柱与圆锥', why: '圆切成小扇形能拼成近似长方形，三个圆锥正好装满一个圆柱。' } ] },
    { name: '数据链', desc: '从分类数数，到画图，再到用平均数和概率说话。', steps: [
      { g: 1, t: '分类与整理', why: '先定一条规则再分，加起来要等于总数。' },
      { g: 2, t: '数据收集整理', why: '一个记号就是一个真实答案。' },
      { g: 4, t: '条形统计图、平均数', why: '条形要从0开始比，平均数是重新平分。' },
      { g: 5, t: '折线统计图、可能性', why: '折线斜表示变化快，可能性是几分之几。' },
      { g: 6, t: '扇形统计图', why: '圆是整体，每一份的角度和份额成正比。' } ] }
  ] },
  { id: 'qtype', name: '问题类型', short: '按题型分', desc: '同一知识点，换个问法就是另一种题，练的时候要换着练。', cats: [
    { name: '计算', desc: '算对、算快，还要能验算。', topics: [
      { g: 1, t: '20以内加减口算', why: '凑十和破十都是围着10打包和拆包。' },
      { g: 2, t: '表内乘除口算', why: '口诀是点阵的总结，除法是倒着背口诀。' },
      { g: 4, t: '三位数乘两位数笔算', why: '先分开算部分积，再合起来，记得进位。' },
      { g: 5, t: '小数乘除、分数加减计算', why: '先统一单位和份的大小，再算。' } ] },
    { name: '概念辨析', desc: '分清容易混的两个概念。', topics: [
      { g: 1, t: '第几和几个', why: '第几是位置，几个是数量，同一个数字问法不同。' },
      { g: 3, t: '周长和面积', why: '周长是绕一圈的长度，面积是里面小方块的个数。' },
      { g: 4, t: '平均数和中位数', why: '平均数是重新平分，中位数是排好队中间那个。' },
      { g: 6, t: '比和分数、负数大小', why: '比是部分比部分，分数是部分比整体；负数离0越远越小。' } ] },
    { name: '应用题', desc: '把文字变成图，再变成算式。', topics: [
      { g: 1, t: '看图列式、小小商店', why: '先看图里有几部分，再决定是加还是减。' },
      { g: 3, t: '倍数应用题、行程起步', why: '先画条形图，几倍就是几份。' },
      { g: 5, t: '列方程解应用题', why: '先把未知数当成一个数，天平两边一起动。' },
      { g: 6, t: '按比分配、折扣问题', why: '先找准单位1，再看百分率是按哪个数算的。' } ] },
    { name: '探究证明', desc: '不是算答案，是想办法证明它一定对。', topics: [
      { g: 2, t: '找规律、推理', why: '找到重复的单元，才能预测下一个；排除掉不可能的，剩下的就是答案。' },
      { g: 4, t: '鸡兔同笼、优化', why: '每换一次差一个固定数，差多少就换几次。' },
      { g: 5, t: '植树问题、找次品', why: '10个间隔要11棵树；称一次能分三堆。' },
      { g: 6, t: '鸽巢问题、数与形', why: '先每个洞放一只，多的那只一定得挤；奇数一层一层包出正方形。' } ] }
  ] }
];

const dimBar = document.getElementById('dimBar');
const dimDetail = document.getElementById('dimDetail');
let currentDim = 'domain';
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
function topicListHTML(topics) {
  return '<ul class="dim-topics">' + topics.map(t =>
    '<li><button class="dim-topic" type="button" data-grade="' + t.g + '"><span><b>' + t.g + ' 年级 · ' + esc(t.t) + '</b><p class="why-line">为什么：' + esc(t.why) + '</p></span><span class="dim-chev" aria-hidden="true">›</span></button></li>'
  ).join('') + '</ul>';
}
let dimGradeFilter = null; // 维度详情里的年级筛选：null = 全部年级
function renderDimension(id) {
  currentDim = id;
  [...dimBar.children].forEach(el => el.setAttribute('aria-selected', String(el.dataset.dim === id)));
  const d = DIMENSIONS.find(x => x.id === id);
  let html = '<h3>' + d.name + '</h3><p class="muted">' + esc(d.desc) + '（1–6 年级；7–9 年级内容仍按年级主线看。）</p>';
  if (d.id === 'prereq') {
    html += d.chains.map((c, ci) => {
      const steps = c.steps.map((s, si) =>
        '<button class="prereq-step" type="button" data-chain="' + ci + '" data-step="' + si + '" aria-pressed="false">' + s.g + ' 年级 · ' + esc(s.t) + '</button>'
      ).join('<span class="prereq-arrow">→</span>');
      return '<div class="prereq-chain"><b>' + esc(c.name) + '</b><p class="muted">' + esc(c.desc) + '</p><div class="prereq-steps">' + steps + '</div><div class="prereq-detail" id="prereqDetail-' + ci + '">点上面任意一步，看它前面需要什么、后面通向哪里。</div></div>';
    }).join('');
  } else {
    // 按年级筛选：39 条塞在一个长列里没法找（2026-11-06 真机审计第 5 条）。
    html += '<div class="dim-filter" role="group" aria-label="按年级筛选"><button type="button" data-gfilter="0" aria-pressed="' + (dimGradeFilter === null) + '">全部年级</button>' +
      [1, 2, 3, 4, 5, 6].map(g => '<button type="button" data-gfilter="' + g + '" aria-pressed="' + (dimGradeFilter === g) + '">' + g + ' 年级</button>').join('') + '</div>';
    html += d.cats.map(c => {
      const topics = dimGradeFilter ? c.topics.filter(t => t.g === dimGradeFilter) : c.topics;
      if (!topics.length) return '';
      return '<div class="dim-cat"><h3>' + esc(c.name) + '</h3><p>' + esc(c.desc) + '</p>' + topicListHTML(topics) + '</div>';
    }).join('');
  }
  dimDetail.innerHTML = html;
  dimDetail.querySelectorAll('.dim-topic').forEach(btn => btn.addEventListener('click', () => navGo('grade-' + btn.dataset.grade)));
  dimDetail.querySelectorAll('[data-gfilter]').forEach(btn => btn.addEventListener('click', () => {
    dimGradeFilter = +btn.dataset.gfilter === 0 ? null : +btn.dataset.gfilter;
    renderDimension(currentDim);
  }));
  if (d.id === 'prereq') {
    dimDetail.querySelectorAll('.prereq-step').forEach(btn => btn.addEventListener('click', () => {
      const ci = +btn.dataset.chain, si = +btn.dataset.step;
      const chain = d.chains[ci], step = chain.steps[si];
      dimDetail.querySelectorAll('.prereq-step').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      const needs = si === 0 ? '没有前置，是这条链的起点。' : '需要：' + chain.steps[si - 1].g + ' 年级 · ' + esc(chain.steps[si - 1].t);
      const leads = si === chain.steps.length - 1 ? '这是这条链目前的终点，往后通向初中内容。' : '通向：' + chain.steps[si + 1].g + ' 年级 · ' + esc(chain.steps[si + 1].t);
      document.getElementById('prereqDetail-' + ci).innerHTML =
        '<b>' + step.g + ' 年级 · ' + esc(step.t) + '</b><p>为什么：' + esc(step.why) + '</p><p>' + needs + '</p><p>' + leads + '</p>';
    }));
  }
}
DIMENSIONS.forEach(d => {
  const b = document.createElement('button');
  b.className = 'dim-btn'; b.type = 'button'; b.dataset.dim = d.id;
  b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(d.id === currentDim));
  b.innerHTML = d.name + '<small>' + d.short + '</small>';
  b.addEventListener('click', () => goDimension(d.id));
  dimBar.appendChild(b);
});
/* 维度菜单层级也是面板：5 块维度面板，点一块进该维度（走 navGo，见下方的 [data-nav-key] 绑定）。 */
const DIM_ICONS = { domain: '◇', cognitive: '◎', literacy: '✦', prereq: '→', qtype: '？' };
const dimPanels = document.getElementById('dimPanels');
DIMENSIONS.forEach(d => {
  const b = document.createElement('button');
  b.className = 'panel'; b.type = 'button'; b.dataset.navKey = 'dim-' + d.id;
  const count = d.cats ? d.cats.length + ' 个分类' : d.chains.length + ' 条链';
  b.innerHTML = '<span class="panel-icon" aria-hidden="true">' + (DIM_ICONS[d.id] || '◇') + '</span><b>' + d.name + '</b>' +
    '<span class="panel-sub">' + d.short + '</span>' +
    '<span class="panel-tx">' + count + '</span>';
  dimPanels.appendChild(b);
});
renderDimension(currentDim);

/* ---------- 模式切换（主界面模式栏，与维度渲染保持同步）
   模式栏是全页唯一一份维度切换器：不在侧边栏，也不在测试栏（原型里没有测试栏）。
   updateModeUI 只改按钮状态和维度按钮行的显隐，不渲染、不滚动、不动导航栈，
   所以任何入口（模式栏、导航、面板、选年级）调它都是安全的。 */
function updateModeUI(mode) {
  const mg = document.getElementById('modeGrade');
  const md = document.getElementById('modeDim');
  const dims = document.getElementById('dimBar');
  const bar = document.getElementById('modeBar');
  if (!mg || !md || !dims) return;
  mg.setAttribute('aria-selected', String(mode === 'grade'));
  md.setAttribute('aria-selected', String(mode === 'dimension'));
  dims.hidden = mode !== 'dimension';
  if (bar) bar.setAttribute('data-mode', mode);
}

/* ---------- 学习路径：每一步的说明（点一步只显示这一步的面板 + 这段说明） ---------- */
const PATH_STEPS = {
  1: { title: '动手试一试', desc: '拖、切、拼、调，先玩出感觉。玩明白了，再说它叫什么名字。' },
  2: { title: '说一说', desc: '用自己的话讲出规律。讲不出来，就回去再玩一遍，玩到能讲出来为止。' },
  3: { title: '练一练', desc: '3–5 道题，都用同一张图来练，不换花样。图换了，思路就断了。' },
  4: { title: '测一测', desc: '小测验过关才往下走；错了回退一步，用图再讲一遍，不直接刷下一题。' }
};
const pathDetail = document.getElementById('pathDetail');
function showPathStep(n) {
  const s = PATH_STEPS[n];
  if (!s || !pathDetail) return;
  pathDetail.innerHTML = '<h3>第 ' + n + ' 步 · ' + s.title + '</h3><p>' + s.desc + '</p>';
}

/* ---------- 逻辑导航（借汉字 App FRONTEND_UI.md §7 的规则，用自己的写法实现）
   只用界面层级，不用浏览器历史：全站禁止用浏览器历史 API 做导航。
   一个层级栈 navStack 记录当前路径，每一级带自己的进入函数（选年级 / 换维度 / 滚动到某节）。
   顶栏最左只有一个「← 返回」，回上一级；只有在最外层（首页）时才没有返回。
   顶栏标题是面包屑，每一级可点，点哪级回哪级，最后一级是当前页，不可点。
   菜单、面板、首页按钮的每一次跳转都调 navGo()，不走锚点 href。 */
const NAV_DEFS = {
  home:       { crumbs: ['数学'], target: 'top', action: () => updateModeUI('grade') },
  grades:     { crumbs: ['数学', '选年级'], target: 'grades', action: () => updateModeUI('grade') },
  dimensions: { crumbs: ['数学', '换维度'], target: 'dimensions', action: () => { updateModeUI('dimension'); renderDimension(currentDim); } },
  path:       { crumbs: ['数学', '学习路径'], target: 'path' },
  'path-step-1': { crumbs: ['数学', '学习路径', '动手试一试'], target: 'step-1', flash: 'step-1', action: () => showPathStep(1) },
  'path-step-2': { crumbs: ['数学', '学习路径', '说一说'], target: 'step-2', flash: 'step-2', action: () => showPathStep(2) },
  'path-step-3': { crumbs: ['数学', '学习路径', '练一练'], target: 'step-3', flash: 'step-3', action: () => showPathStep(3) },
  'path-step-4': { crumbs: ['数学', '学习路径', '测一测'], target: 'step-4', flash: 'step-4', action: () => showPathStep(4) },
  demos:      { crumbs: ['数学', '互动演示'], target: 'demos' },
  'demo-tenframe': { crumbs: ['数学', '互动演示', '十格阵凑十'], target: 'demo-tenframe' },
  'demo-fraction': { crumbs: ['数学', '互动演示', '分数切一切'], target: 'demo-fraction' },
  'demo-balance':  { crumbs: ['数学', '互动演示', '天平解方程'], target: 'demo-balance' },
  'demo-function': { crumbs: ['数学', '互动演示', '函数滑杆'], target: 'demo-function' },
  'demo-count': { crumbs: ['数学', '互动演示', '数一数，比一比'], target: 'demo-count' },
  'demo-position': { crumbs: ['数学', '互动演示', '转身找左右'], target: 'demo-position' },
  'demo-split': { crumbs: ['数学', '互动演示', '分一分'], target: 'demo-split' },
  'demo-addsub': { crumbs: ['数学', '互动演示', '合起来，拿走'], target: 'demo-addsub' },
  'demo-solids': { crumbs: ['数学', '互动演示', '立体图形滚一滚'], target: 'demo-solids' },
  'demo-bundle': { crumbs: ['数学', '互动演示', '捆小棒认数'], target: 'demo-bundle' },
  'demo-clock': { crumbs: ['数学', '互动演示', '认识钟表'], target: 'demo-clock' },
  'demo-tangram': { crumbs: ['数学', '互动演示', '七巧板转一转'], target: 'demo-tangram' },
  'demo-sort': { crumbs: ['数学', '互动演示', '分类分一分'], target: 'demo-sort' },
  'demo-hundred': { crumbs: ['数学', '互动演示', '百数表比大小'], target: 'demo-hundred' },
  'demo-shop': { crumbs: ['数学', '互动演示', '开小店'], target: 'demo-shop' },
  'demo-place': { crumbs: ['数学', '互动演示', '数位块加减法'], target: 'demo-place' },
  'demo-pattern': { crumbs: ['数学', '互动演示', '找规律'], target: 'demo-pattern' },
  'demo-ruler': { crumbs: ['数学', '互动演示', '尺子量长度'], target: 'demo-ruler' },
  'demo-estimate': { crumbs: ['数学', '互动演示', '先估后算'], target: 'demo-estimate' },
  'demo-angle': { crumbs: ['数学', '互动演示', '转一转角'], target: 'demo-angle' },
  'demo-array': { crumbs: ['数学', '互动演示', '点阵乘法'], target: 'demo-array' },
  'demo-observe': { crumbs: ['数学', '互动演示', '换个方向看'], target: 'demo-observe' },
  'demo-time': { crumbs: ['数学', '互动演示', '认识时间：时和分'], target: 'demo-time' },
  'demo-share': { crumbs: ['数学', '互动演示', '轮流分一分'], target: 'demo-share' },
  'demo-motion': { crumbs: ['数学', '互动演示', '折一折，转一转'], target: 'demo-motion' },
  'demo-mixop': { crumbs: ['数学', '互动演示', '先算哪一堆'], target: 'demo-mixop' },
  'demo-remain': { crumbs: ['数学', '互动演示', '装一包，剩几颗'], target: 'demo-remain' },
  'demo-thousand': { crumbs: ['数学', '互动演示', '数轴找近似数'], target: 'demo-thousand' },
  'demo-weight': { crumbs: ['数学', '互动演示', '天平称一称'], target: 'demo-weight' },
  'demo-chart': { crumbs: ['数学', '互动演示', '投票变条形图'], target: 'demo-chart' },
  'demo-logic': { crumbs: ['数学', '互动演示', '排除格推理'], target: 'demo-logic' },
  'demo-pair': { crumbs: ['数学', '互动演示', '搭配连一连'], target: 'demo-pair' },
  'demo-elapsed': { crumbs: ['数学', '互动演示', '时间轴走一走'], target: 'demo-elapsed' },
  'demo-verify': { crumbs: ['数学', '互动演示', '算一算，再算回去'], target: 'demo-verify' },
  'demo-units': { crumbs: ['数学', '互动演示', '单位楼梯'], target: 'demo-units' },
  'demo-times': { crumbs: ['数学', '互动演示', '条形复制'], target: 'demo-times' },
  'demo-splitmul': { crumbs: ['数学', '互动演示', '面积切一切'], target: 'demo-splitmul' },
  'demo-rectsq': { crumbs: ['数学', '互动演示', '拉一拉变正方形'], target: 'demo-rectsq' },
  'demo-venn': { crumbs: ['数学', '互动演示', '韦恩图拖人'], target: 'demo-venn' },
  'demo-compass': { crumbs: ['数学', '互动演示', '指南针转一转'], target: 'demo-compass' },
  'demo-divplace': { crumbs: ['数学', '互动演示', '按数位分一分'], target: 'demo-divplace' },
  'demo-stattable': { crumbs: ['数学', '互动演示', '复式统计表'], target: 'demo-stattable' },
  'demo-fourgrid': { crumbs: ['数学', '互动演示', '四格面积模型'], target: 'demo-fourgrid' },
  'demo-area': { crumbs: ['数学', '互动演示', '铺方砖数面积'], target: 'demo-area' },
  'demo-calendar': { crumbs: ['数学', '互动演示', '日历翻一翻'], target: 'demo-calendar' },
  'demo-decimal': { crumbs: ['数学', '互动演示', '十分条比大小'], target: 'demo-decimal' },
  'demo-bignum': { crumbs: ['数学', '互动演示', '大数数轴'], target: 'demo-bignum' },
  'demo-field': { crumbs: ['数学', '互动演示', '足球场拼平方千米'], target: 'demo-field' },
  'demo-protractor': { crumbs: ['数学', '互动演示', '量角器量一量'], target: 'demo-protractor' },
  'demo-areamodel': { crumbs: ['数学', '互动演示', '面积模型乘三位数'], target: 'demo-areamodel' },
  'demo-parallelogram': { crumbs: ['数学', '互动演示', '平行四边形推一推'], target: 'demo-parallelogram' },
  'demo-trialdiv': { crumbs: ['数学', '互动演示', '试商调商'], target: 'demo-trialdiv' },
  'demo-baraxis': { crumbs: ['数学', '互动演示', '条形图会说谎'], target: 'demo-baraxis' },
  'demo-teatime': { crumbs: ['数学', '互动演示', '沏茶排一排'], target: 'demo-teatime' },
  'demo-zerodiv': { crumbs: ['数学', '互动演示', '除以0没有答案'], target: 'demo-zerodiv' },
  'demo-laws': { crumbs: ['数学', '互动演示', '运算定律'], target: 'demo-laws' },
  'demo-placeslider': { crumbs: ['数学', '互动演示', '数位滑块'], target: 'demo-placeslider' },
  'demo-tearangle': { crumbs: ['数学', '互动演示', '撕角拼平角'], target: 'demo-tearangle' },
  'demo-decadd': { crumbs: ['数学', '互动演示', '小数加减对齐'], target: 'demo-decadd' },
  'demo-moveshape': { crumbs: ['数学', '互动演示', '图形平移和对称'], target: 'demo-moveshape' },
  'demo-average': { crumbs: ['数学', '互动演示', '削峰填谷求平均数'], target: 'demo-average' },
  'demo-chickenrabbit': { crumbs: ['数学', '互动演示', '鸡兔同笼腿数滑杆'], target: 'demo-chickenrabbit' },
  'demo-decmul': { crumbs: ['数学', '互动演示', '小数乘法：单位正方形'], target: 'demo-decmul' },
  'demo-gridpos': { crumbs: ['数学', '互动演示', '位置：数对点一点'], target: 'demo-gridpos' },
  'demo-decdiv': { crumbs: ['数学', '互动演示', '小数除法：两数同乘'], target: 'demo-decdiv' },
  'demo-prob': { crumbs: ['数学', '互动演示', '可能性：摸球模拟'], target: 'demo-prob' },
  'demo-polyarea': { crumbs: ['数学', '互动演示', '多边形的面积：切一刀'], target: 'demo-polyarea' },
  'demo-planttree': { crumbs: ['数学', '互动演示', '植树问题：种树数间隔'], target: 'demo-planttree' },
  'demo-factor': { crumbs: ['数学', '互动演示', '因数与倍数：拼长方形'], target: 'demo-factor' },
  'demo-cuboid': { crumbs: ['数学', '互动演示', '长方体：分层装块'], target: 'demo-cuboid' },
  'demo-fracadd': { crumbs: ['数学', '互动演示', '分数加减法：先重切再数'], target: 'demo-fracadd' },
  'demo-rotate': { crumbs: ['数学', '互动演示', '图形的运动：绕钉旋转'], target: 'demo-rotate' },
  'demo-findbad': { crumbs: ['数学', '互动演示', '找次品：三组称'], target: 'demo-findbad' },
  'demo-radar': { crumbs: ['数学', '互动演示', '位置与方向：雷达找地方'], target: 'demo-radar' },
  'demo-ratio': { crumbs: ['数学', '互动演示', '比：比条分一分'], target: 'demo-ratio' },
  'demo-circle': { crumbs: ['数学', '互动演示', '圆：绕绳量一量'], target: 'demo-circle' },
  'demo-percent': { crumbs: ['数学', '互动演示', '百分数：百分条'], target: 'demo-percent' },
  'demo-fan': { crumbs: ['数学', '互动演示', '扇形统计图：转一转'], target: 'demo-fan' },
  'demo-lsquare': { crumbs: ['数学', '互动演示', '数与形：一层层包正方形'], target: 'demo-lsquare' },
  'demo-thermo': { crumbs: ['数学', '互动演示', '负数：温度计'], target: 'demo-thermo' },
  'demo-negmul': { crumbs: ['数学', '互动演示', '负数运算：翻一翻'], target: 'demo-negmul' },
  'demo-discount': { crumbs: ['数学', '互动演示', '百分数（二）：打折和利息'], target: 'demo-discount' },
  'demo-cylinder': { crumbs: ['数学', '互动演示', '圆柱与圆锥：倒沙'], target: 'demo-cylinder' },
  'demo-pigeon': { crumbs: ['数学', '互动演示', '鸽巢问题：先每洞一只'], target: 'demo-pigeon' },
  'demo-conceptmap': { crumbs: ['数学', '互动演示', '整理和复习：认出老办法'], target: 'demo-conceptmap' },
  why:        { crumbs: ['数学', '互动演示', '为什么小实验'], target: 'why' },
  lab:        { crumbs: ['数学', '数学实验室'], target: 'lab' },
  review:     { crumbs: ['数学', '错题本'], target: 'review', action: renderWrongBook },
  'today-review': { crumbs: ['数学', '今天复习'], target: 'grades', action: renderReview },
  progress:   { crumbs: ['数学', '我的进度'], target: 'progressCard', action: renderProgress },
};
Object.keys(GRADES).forEach(g => {
  NAV_DEFS['grade-' + g] = { crumbs: ['数学', '选年级', g + ' 年级'], target: 'grades', action: () => selectGrade(+g) };
});
DIMENSIONS.forEach(d => {
  NAV_DEFS['dim-' + d.id] = { crumbs: ['数学', '换维度', d.name], target: 'dimensions', action: () => { renderDimension(d.id); updateModeUI('dimension'); } };
});
/* 年级内容导航：单元与知识点各一级（面包屑：数学 › 选年级 › N 年级 › 单元 › 知识点）。
   内容文件没加载到时不注册，该年级保持旧的占位。 */
function registerGradeNav(g) {
  const gd = gradeData(g);
  if (!gd) return;
  gd.units.forEach((u, ui) => {
    NAV_DEFS['unit-' + g + '-' + ui] = { crumbs: ['数学', '选年级', g + ' 年级', u.unit], target: 'grades', action: () => renderUnit(g, ui) };
    u.points.forEach(p => {
      NAV_DEFS['point-' + p.id] = { crumbs: ['数学', '选年级', g + ' 年级', u.unit, p.title], target: 'grades', action: () => renderPoint(p.id) };
    });
  });
  NAV_DEFS['grade-' + g + '-mix'] = { crumbs: ['数学', '选年级', g + ' 年级', '混着练'], target: 'grades', action: () => renderMix(g) };
  NAV_DEFS['grade-' + g + '-review'] = { crumbs: ['数学', '选年级', g + ' 年级', '今天复习'], target: 'grades', action: renderReview };
  // 该年级面板改显示真实进度：N 个知识点 · 已完成。
  const panel = document.querySelector('[data-nav-key="grade-' + g + '"] .panel-tx');
  if (panel) panel.textContent = gd.units.reduce((n, u) => n + u.points.length, 0) + ' 个知识点 · 已完成';
}
for (let g = 1; g <= 9; g++) registerGradeNav(g);

const navBack = document.getElementById('navBack');
const crumbTitle = document.getElementById('crumbTitle');
let navStack = [{ key: 'home', crumbs: ['数学'], target: 'top' }];

/* ---------- 视图隔离：一次只显示一个视图（Iris 2026-11-06 的要求）
   首页只显示顶栏、模式栏、首页介绍和首页面板；模块内容（年级、维度、学习路径、
   演示、为什么、错题本、进度、下一步、页脚）在首页一律藏起来，下滑也看不到。
   点面板进模块时只显示该面板对应的内容，首页面板和介绍同时藏起来；
   返回 / 面包屑 / 点品牌回首页时，模块内容重新藏起来，上一级面板再出现。
   实现：renderNav() 每次都调 applyView()，按栈顶算出视图，逐项设 hidden；
   样式里 [hidden]{display:none !important} 保证 .panels/.hero 的 display 规则盖不掉 hidden，
   body[data-view] 的 CSS 规则是第二道防线（见 styles.css）。 */
const heroEl = document.getElementById('hero');
const panelsSec = document.getElementById('panels');
const gradesSec = document.getElementById('grades');
const dimsSec = document.getElementById('dimensions');
const pathSec = document.getElementById('path');
const pathPanelsEl = document.getElementById('pathPanels');
const demosSec = document.getElementById('demos');
const demoPanelsEl = document.getElementById('demoPanels');
const demoGridEl = document.getElementById('demoGrid');
const whySec = document.getElementById('why');
const labSec = document.getElementById('lab');
const reviewSec = document.getElementById('review');
const progressCardEl = document.getElementById('progressCard');
const reviewCardEl = document.getElementById('reviewCard');
const nextStepsEl = document.getElementById('nextSteps');
const footerEl = document.getElementById('pageFooter');
function viewForKey(key) {
  if (key === 'home') return 'home';
  if (key === 'grades') return 'grades';
  // 首页“今天复习”和各年级的“今天复习”都映射到 view 'review'（到期列表画进 pointDetail）。
  if (key === 'today-review') return 'review';
  // 注意顺序：'grade-3-mix' / 'grade-3-review' 也以 'grade-' 开头，必须先精确匹配，
  // 否则会被下面的 startsWith('grade-') 吞掉，混着练和今天复习就会显示成年级详情（2026-11-06 真机测出）。
  if (/^grade-\d+-mix$/.test(key)) return 'mix';
  if (/^grade-\d+-review$/.test(key)) return 'review';
  if (key.startsWith('grade-')) return 'grade-detail';
  if (key.startsWith('unit-')) return 'unit-detail';
  if (key.startsWith('point-')) return 'point-detail';
  if (key === 'dimensions') return 'dimensions';
  if (key.startsWith('dim-')) return 'dim-detail';
  if (key === 'path') return 'path';
  if (key.startsWith('path-step-')) return 'path-step';
  if (key === 'demos') return 'demos';
  if (key === 'demo-tenframe' || key === 'demo-fraction' || key === 'demo-balance' || key === 'demo-function' || key === 'demo-count' || key === 'demo-position' || key === 'demo-split' || key === 'demo-addsub' || key === 'demo-solids' || key === 'demo-bundle' || key === 'demo-clock' || key === 'demo-tangram' || key === 'demo-sort' || key === 'demo-hundred' || key === 'demo-shop' || key === 'demo-place' || key === 'demo-pattern' || key === 'demo-ruler' || key === 'demo-estimate' || key === 'demo-angle' || key === 'demo-array' || key === 'demo-observe' || key === 'demo-time' || key === 'demo-share' || key === 'demo-motion' || key === 'demo-mixop' || key === 'demo-remain' || key === 'demo-thousand' || key === 'demo-weight' || key === 'demo-chart' || key === 'demo-logic' || key === 'demo-pair' || key === 'demo-elapsed' || key === 'demo-verify' || key === 'demo-units' || key === 'demo-times' || key === 'demo-splitmul' || key === 'demo-rectsq' || key === 'demo-venn' || key === 'demo-compass' || key === 'demo-divplace' || key === 'demo-stattable' || key === 'demo-fourgrid' || key === 'demo-area' || key === 'demo-calendar' || key === 'demo-decimal' || key === 'demo-bignum' || key === 'demo-field' || key === 'demo-protractor' || key === 'demo-areamodel' || key === 'demo-parallelogram' || key === 'demo-trialdiv' || key === 'demo-baraxis' || key === 'demo-teatime' || key === 'demo-zerodiv' || key === 'demo-laws' || key === 'demo-placeslider' || key === 'demo-tearangle' || key === 'demo-decadd' || key === 'demo-moveshape' || key === 'demo-average' || key === 'demo-chickenrabbit' || key === 'demo-decmul' || key === 'demo-gridpos' || key === 'demo-decdiv' || key === 'demo-prob' || key === 'demo-polyarea' || key === 'demo-planttree' || key === 'demo-factor' || key === 'demo-cuboid' || key === 'demo-fracadd' || key === 'demo-rotate' || key === 'demo-findbad' || key === 'demo-radar' || key === 'demo-ratio' || key === 'demo-circle' || key === 'demo-percent' || key === 'demo-fan' || key === 'demo-lsquare' || key === 'demo-thermo' || key === 'demo-negmul' || key === 'demo-discount' || key === 'demo-cylinder' || key === 'demo-pigeon' || key === 'demo-conceptmap') return key;
  if (key === 'why') return 'why';
  if (key === 'lab') return 'lab';
  if (key === 'review') return 'review';
  if (key === 'progress') return 'progress';
  return 'home';
}
function setHidden(el, hidden) { if (el) el.hidden = hidden; }
function applyView() {
  const key = navStack[navStack.length - 1].key;
  const view = viewForKey(key);
  document.body.dataset.view = view;
  // 首页：只留介绍和首页面板
  setHidden(heroEl, view !== 'home');
  setHidden(panelsSec, view !== 'home');
  // 选年级：列表只留 9 块年级面板；叶子只留该年级详情；3 年级再往下是单元和知识点
  // 注意：view 'review' 有三种入口，内容不一样——
  //   首页错题本（key 'review'）画进 reviewCard；
  //   今天复习（key 'today-review' / 'grade-N-review'）把到期列表画进 pointDetail。
  // 三种绝不能互相把旧内容留在屏幕上（2026-11-06 真机测出）。
  const isWrongBook = key === 'review';
  const isReviewList = view === 'review' && !isWrongBook;
  const inGrades = view === 'grades' || view === 'grade-detail' || view === 'unit-detail' || view === 'point-detail' || view === 'mix' || isReviewList;
  setHidden(gradesSec, !inGrades);
  setHidden(gradePanels, view !== 'grades');
  setHidden(gradeDetail, view !== 'grade-detail');
  setHidden(pointDetail, !(view === 'unit-detail' || view === 'point-detail' || view === 'mix' || isReviewList));
  setHidden(gradesSec.querySelector('h2'), inGrades && view !== 'grades');
  setHidden(gradesSec.querySelector('.section-sub'), inGrades && view !== 'grades');
  // 换维度：列表只留 5 块维度面板；叶子只留该维度的分组内容
  setHidden(dimsSec, !(view === 'dimensions' || view === 'dim-detail'));
  setHidden(dimPanels, view !== 'dimensions');
  setHidden(dimDetail, view !== 'dim-detail');
  setHidden(dimsSec.querySelector('h2'), view === 'dim-detail');
  setHidden(dimsSec.querySelector('.section-sub'), view === 'dim-detail');
  setHidden(dimsSec.querySelector('.muted'), view !== 'dim-detail');
  // 学习路径：列表留 4 步面板；叶子只留该步的面板 + 说明
  setHidden(pathSec, !(view === 'path' || view === 'path-step'));
  setHidden(pathDetail, view !== 'path-step');
  setHidden(pathSec.querySelector('h2'), view === 'path-step');
  setHidden(pathSec.querySelector('.section-sub'), view === 'path-step');
  const stepN = view === 'path-step' ? key.slice('path-step-'.length) : null;
  [...pathPanelsEl.children].forEach(el => { el.hidden = !!(stepN && el.id !== 'step-' + stepN); });
  // 互动演示：列表留演示面板；叶子只留该演示卡片；为什么小实验只留 #why 区
  const demoLeaf = view === 'demo-tenframe' || view === 'demo-fraction' || view === 'demo-balance' || view === 'demo-function' || view === 'demo-count' || view === 'demo-position' || view === 'demo-split' || view === 'demo-addsub' || view === 'demo-solids' || view === 'demo-bundle' || view === 'demo-clock' || view === 'demo-tangram' || view === 'demo-sort' || view === 'demo-hundred' || view === 'demo-shop' || view === 'demo-place' || view === 'demo-pattern' || view === 'demo-ruler' || view === 'demo-estimate' || view === 'demo-angle' || view === 'demo-array' || view === 'demo-observe' || view === 'demo-time' || view === 'demo-share' || view === 'demo-motion' || view === 'demo-mixop' || view === 'demo-remain' || view === 'demo-thousand' || view === 'demo-weight' || view === 'demo-chart' || view === 'demo-logic' || view === 'demo-pair' || view === 'demo-elapsed' || view === 'demo-verify' || view === 'demo-units' || view === 'demo-times' || view === 'demo-splitmul' || view === 'demo-rectsq' || view === 'demo-venn' || view === 'demo-compass' || view === 'demo-divplace' || view === 'demo-stattable' || view === 'demo-fourgrid' || view === 'demo-area' || view === 'demo-calendar' || view === 'demo-decimal' || view === 'demo-bignum' || view === 'demo-field' || view === 'demo-protractor' || view === 'demo-areamodel' || view === 'demo-parallelogram' || view === 'demo-trialdiv' || view === 'demo-baraxis' || view === 'demo-teatime' || view === 'demo-zerodiv' || view === 'demo-laws' || view === 'demo-placeslider' || view === 'demo-tearangle' || view === 'demo-decadd' || view === 'demo-moveshape' || view === 'demo-average' || view === 'demo-chickenrabbit' || view === 'demo-decmul' || view === 'demo-gridpos' || view === 'demo-decdiv' || view === 'demo-prob' || view === 'demo-polyarea' || view === 'demo-planttree' || view === 'demo-factor' || view === 'demo-cuboid' || view === 'demo-fracadd' || view === 'demo-rotate' || view === 'demo-findbad' || view === 'demo-radar' || view === 'demo-ratio' || view === 'demo-circle' || view === 'demo-percent' || view === 'demo-fan' || view === 'demo-lsquare' || view === 'demo-thermo' || view === 'demo-negmul' || view === 'demo-discount' || view === 'demo-cylinder' || view === 'demo-pigeon' || view === 'demo-conceptmap';
  setHidden(demosSec, !(view === 'demos' || demoLeaf));
  setHidden(demoPanelsEl, view !== 'demos');
  setHidden(demoGridEl, !demoLeaf); // 演示卡片网格只在某一个演示的叶子视图里出现，列表视图只留演示面板
  setHidden(demosSec.querySelector('h2'), demoLeaf);
  setHidden(demosSec.querySelector('.section-sub'), demoLeaf);
  [...demoGridEl.children].forEach(el => { el.hidden = demoLeaf && el.id !== view; });
  setHidden(whySec, view !== 'why');
  // 数学实验室：只有进实验室才显示整个 #lab 区
  setHidden(labSec, view !== 'lab');
  // 复习与进度：错题本只留错题卡片，我的进度只留进度卡片；
  // 今天复习不留 #review 区（它的列表在 pointDetail 里）。
  setHidden(reviewSec, !(isWrongBook || view === 'progress'));
  setHidden(progressCardEl, view !== 'progress');
  setHidden(reviewCardEl, !isWrongBook);
  setHidden(reviewSec.querySelector('h2'), true); // 卡片自带 h3 标题，区标题“进度与错题本”不再出现
  // 维度切换 pills 只在某个维度的详情页出现：维度卡片列表页上，
  // 模式栏的 5 个 pills 和下面 5 张卡片是同一批内容，重复了（2026-11-06 真机审计第 5 条）。
  if (dimBar) dimBar.hidden = view !== 'dim-detail';
  // 下一步与页脚：视图隔离后不再出现（首页不露出任何模块内容，模块视图只显示本面板内容）
  setHidden(nextStepsEl, true);
  setHidden(footerEl, true);
}

function enterNavEntry(entry) {
  const def = NAV_DEFS[entry.key] || {};
  if (def.action) def.action();
  // 一次只显示一个视图，内容都在页顶，不再按目标滚动。
  // 直接跳到顶（不用平滑滚动）：平滑滚动中标题会从吸顶栏底下滑过，看着像被栏遮住。
  window.scrollTo({ top: 0, behavior: 'auto' });
  if (def.flash) {
    const el = document.getElementById(def.flash);
    if (el) { el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1600); }
  }
}
function renderNav() {
  const top = navStack[navStack.length - 1];
  applyView();
  navBack.hidden = navStack.length <= 1;
  // 首页只有一级面包屑“数学”，和品牌“数学小宇宙”重了，顶栏里看着像残字：首页藏起它，子页面再显示完整面包屑。
  crumbTitle.hidden = top.key === 'home';
  crumbTitle.innerHTML = top.crumbs.map((c, i) =>
    i < top.crumbs.length - 1
      ? '<button class="crumb" type="button" data-crumb="' + i + '">' + esc(c) + '</button><span class="crumb-sep">›</span>'
      : '<span class="crumb cur">' + esc(c) + '</span>'
  ).join('');
  document.querySelectorAll('[data-nav-key]').forEach(el =>
    el.setAttribute('aria-current', String(el.dataset.navKey === top.key)));
}
/* 叶子级的父级：面包屑里的每一级都必须是栈里的真层级，否则点面包屑的父级会跳不回去。 */
const NAV_PARENT = { 'grade-': 'grades', 'dim-': 'dimensions', 'path-step-': 'path', 'demo-': 'demos' };
function parentOf(key) {
  if (key === 'why') return 'demos';
  if (key.startsWith('unit-')) return 'grade-' + key.split('-')[1];
  if (/^grade-\d+-(mix|review)$/.test(key)) return 'grade-' + key.split('-')[1];
  if (key.startsWith('point-')) {
    const f = findPoint(key.slice('point-'.length));
    return f ? 'unit-' + f.grade + '-' + f.unitIndex : 'grade-3';
  }
  for (const p of ['grade-', 'dim-', 'path-step-', 'demo-']) if (key.startsWith(p)) return NAV_PARENT[p];
  return null;
}
function navGo(key) {
  const def = NAV_DEFS[key];
  if (!def) return;
  const top = navStack[navStack.length - 1];
  if (key === 'home') { navStack = [navStack[0]]; enterNavEntry(navStack[0]); }
  else if (top.key === key) { enterNavEntry(top); }
  // 从某个维度回「换维度」这一级、从某年级回「选年级」这一级时，回到父级而不是再入栈一层。
  else if ((key === 'dimensions' && top.key.startsWith('dim-')) ||
           (key === 'grades' && top.key.startsWith('grade-'))) {
    navStack[navStack.length - 1] = { key, crumbs: def.crumbs, target: def.target };
    enterNavEntry(navStack[navStack.length - 1]);
  }
  // 同一族内切换（维度换维度、年级换年级、单元换单元、知识点换知识点）替换栈顶，不层层入栈：
  // 面包屑始终是「数学 › 换维度 › 某个维度」，不会越点越长。
  else if ((key.startsWith('dim-') && top.key.startsWith('dim-')) ||
           (/^grade-\d+$/.test(key) && /^grade-\d+$/.test(top.key)) ||
           (key.startsWith('unit-') && top.key.startsWith('unit-')) ||
           (key.startsWith('point-') && top.key.startsWith('point-'))) {
    navStack[navStack.length - 1] = { key, crumbs: def.crumbs, target: def.target };
    enterNavEntry(navStack[navStack.length - 1]);
    // 注意：年级这里不能写 startsWith('grade-')——'grade-3-mix' / 'grade-3-review' 也以 grade- 开头，
    // 它们是 3 年级的孩子不是同级；写成前缀判断会把 3 年级从栈里换掉，面包屑就少一级，
    // 点“3 年级”没反应、返回也会跳到选年级去（2026-11-06 真机测出）。
  }
  else {
    // 进叶子级时先补上父级（例如从首页点 3 年级面板，栈是 [首页, 选年级, 3 年级]）；
    // 跨分支跳转时从首页重开一条路，不把旧分支留在面包屑里。
    const parent = parentOf(key);
    const entry = { key, crumbs: def.crumbs, target: def.target };
    if (parent) {
      const pdef = NAV_DEFS[parent];
      if (top.key === parent) { navStack.push(entry); }
      else {
        // 跨分支跳进来时重建完整祖先链：只补一级父级会让栈比面包屑少一级，
        // 点面包屑的中间级就会跳错（2026-11-06 真机测出：单元页点“3 年级”没反应）。
        const chain = [entry];
        let k = parent;
        while (k) {
          const d = NAV_DEFS[k];
          chain.unshift({ key: k, crumbs: d.crumbs, target: d.target });
          k = parentOf(k);
        }
        navStack = [navStack[0], ...chain];
      }
    } else { navStack.push(entry); }
    enterNavEntry(navStack[navStack.length - 1]);
  }
  renderNav();
}
function navBackFn() {
  if (navStack.length <= 1) return;
  navStack.pop();
  enterNavEntry(navStack[navStack.length - 1]);
  renderNav();
}
/* 模式切换（主界面模式栏）：不是入栈一级，而是跳到顶层视图。
   点「按年级」就回到 [数学 › 选年级]，点「按维度」就回到 [数学 › 换维度]，
   这样从维度切回年级后，点「← 返回」不会又掉回维度里。 */
function setModeView(mode) {
  const key = mode === 'dimension' ? 'dimensions' : 'grades';
  const def = NAV_DEFS[key];
  navStack = [navStack[0], { key, crumbs: def.crumbs, target: def.target }];
  enterNavEntry(navStack[1]);
  renderNav();
}
/* 点模式栏里的某个维度：已在维度分支内就替换栈顶（换维度不堆叠），
   不在维度分支内就从首页直接进该维度。 */
function goDimension(id) {
  const key = 'dim-' + id;
  const def = NAV_DEFS[key];
  if (!def) return;
  const entry = { key, crumbs: def.crumbs, target: def.target };
  const top = navStack[navStack.length - 1];
  if (top.key === 'dimensions') navStack.push(entry);
  else if (top.key.startsWith('dim-')) navStack[navStack.length - 1] = entry;
  else navStack = [navStack[0], { key: 'dimensions', crumbs: NAV_DEFS.dimensions.crumbs, target: NAV_DEFS.dimensions.target }, entry];
  enterNavEntry(entry);
  renderNav();
}
navBack.addEventListener('click', navBackFn);
crumbTitle.addEventListener('click', e => {
  const b = e.target.closest('[data-crumb]');
  if (!b) return;
  const i = +b.dataset.crumb;
  if (i >= navStack.length - 1) return;
  navStack.length = i + 1;
  enterNavEntry(navStack[navStack.length - 1]);
  renderNav();
});
document.getElementById('brandHome').addEventListener('click', () => navGo('home'));
// 没有侧边栏：菜单层级全部是面板——年级面板（gradePanels）、维度面板（dimPanels）、
// 学习路径面板（#pathPanels，写在 index.html 里）、互动演示面板（#demoPanels，写在 index.html 里）。
// 它们都带 data-nav-key，由下面统一的 [data-nav-key] 绑定走 navGo()。
document.querySelectorAll('[data-nav-key]').forEach(el =>
  el.addEventListener('click', () => navGo(el.dataset.navKey)));
// 模式栏的两个模式按钮走同一套逻辑导航：按年级进年级视图，按维度进维度视图。
document.getElementById('modeGrade').addEventListener('click', () => setModeView('grade'));
document.getElementById('modeDim').addEventListener('click', () => setModeView('dimension'));
renderNav();
renderTried(); // 首次刷新进度：这时 reviewStore 和 progressCardEl 都已初始化
renderWrongBook(); // 首页错题本卡片和面板条数一进页面就是真实的，不是占位示例。

function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); return b ? gcd(b, a % b) : a; }

/* ---------- P1 分数 ---------- */
let denom = 4, numer = 3;
/* 分数挑战：目标分数（分母只用演示里有的 2/3/4/6/8），拼错了图会标出来——
   多出来的块变红，还差的块描绿框，数轴上绿点是目标位置；拼对了也包括等值分数（6/8 = 3/4）。 */
const FRAC_CH = [{ n: 3, d: 4 }, { n: 1, d: 2 }, { n: 5, d: 6 }, { n: 2, d: 3 }, { n: 5, d: 8 }, { n: 1, d: 3 }];
let fracChallenge = false, fracChIdx = 0, fracPrev = null;
const lineTargetDot = document.getElementById('lineTargetDot');
function fracVerdict() {
  const t = FRAC_CH[fracChIdx];
  const diff = numer * t.d - t.n * denom, cd = denom * t.d, g = gcd(diff, cd);
  const dTxt = Math.abs(diff) / g + '/' + cd / g;
  if (diff === 0) return { ok: true, text: '拼对了！' + (denom === t.d ? '你拼的 ' + numer + '/' + denom + ' 就是目标。' : '你拼的 ' + numer + '/' + denom + ' 和 ' + t.n + '/' + t.d + ' 一样大，都落在数轴的同一个点上。') };
  const dir = diff > 0 ? '多了 ' + dTxt + '。' : '少了 ' + dTxt + '。';
  const where = denom === t.d
    ? (diff > 0 ? '红块是多出来的，点一下拿掉。' : '绿框是还差的，点饼或拖滑杆来拼。')
    : '绿点是目标位置，你的点在它' + (diff > 0 ? '右边。' : '左边。');
  return { ok: false, text: '你拼的是 ' + numer + '/' + denom + '，目标是 ' + t.n + '/' + t.d + '，' + dir + where };
}
const pieSvg = document.getElementById('pieSvg');
const lineTicks = document.getElementById('lineTicks');
const lineDot = document.getElementById('lineDot');
const denomSeg = document.getElementById('denomSeg');
[2, 3, 4, 6, 8].forEach(d => {
  const b = document.createElement('button');
  b.type = 'button'; b.textContent = d; b.setAttribute('aria-pressed', String(d === denom));
  b.addEventListener('click', () => { denom = d; if (numer > d) numer = d; renderFraction(); markTried('fraction'); });
  denomSeg.appendChild(b);
});
function polar(cx, cy, r, deg) { const a = (deg - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
function sector(cx, cy, r, a0, a1) {
  const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1);
  return 'M' + cx + ' ' + cy + ' L' + x0.toFixed(1) + ' ' + y0.toFixed(1) +
    ' A' + r + ' ' + r + ' 0 ' + ((a1 - a0) > 180 ? 1 : 0) + ' 1 ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' Z';
}
function renderFraction() {
  [...denomSeg.children].forEach((el, i) => el.setAttribute('aria-pressed', String([2, 3, 4, 6, 8][i] === denom)));
  document.getElementById('numRange').max = denom;
  document.getElementById('numRange').value = numer;
  document.getElementById('numLabel').textContent = numer;
  let svg = '';
  const t = FRAC_CH[fracChIdx];
  for (let i = 0; i < denom; i++) {
    const a0 = i * 360 / denom, a1 = (i + 1) * 360 / denom;
    const filled = i < numer;
    let fill = filled ? '#ff8a3d' : '#fff3e6', stroke = '#c2410c', dash = '';
    if (fracChallenge && numer * t.d !== t.n * denom) {
      // 按值比较，不看分母是否相同：目标换算成现在的份数（可能不是整数），
      // 超出目标的已填块变红、目标以内还没填的块描绿框；等值分数不标。
      const targetSlices = t.n * denom / t.d;
      if (filled && i + 1 > targetSlices) fill = '#ef4444'; // 多出来的块：变红
      if (!filled && i < targetSlices) { fill = '#bbf7d0'; stroke = '#15803d'; dash = ' stroke-dasharray="5 4"'; } // 还差的块：绿框
    }
    svg += '<path d="' + sector(100, 100, 88, a0, a1) + '" fill="' + fill +
      '" stroke="' + stroke + '" stroke-width="2"' + dash + ' data-slice="' + i + '" style="cursor:pointer"/>';
  }
  pieSvg.innerHTML = svg;
  pieSvg.querySelectorAll('[data-slice]').forEach(p => p.addEventListener('click', () => {
    const i = +p.dataset.slice; numer = (i < numer) ? i : i + 1; renderFraction(); markTried('fraction');
  }));
  const dec = denom ? (numer / denom) : 0;
  document.getElementById('fracText').textContent = numer + '/' + denom;
  document.getElementById('fracDecimal').textContent = dec.toFixed(2).replace(/0$/, '');
  document.getElementById('fracNote').textContent =
    numer === 0 ? '还没取，试着拖滑杆或点一块饼。' :
    numer === denom ? '取满了，就是 1 个整体。' :
    '取了 ' + numer + ' 份，每份是 1/' + denom + '。' +
    (denom === 4 && numer === 3 ? ' 3/4 = 6/8，都落在数轴的同一个点上。' : '');
  // 数轴刻度与点
  let ticks = '';
  for (let i = 0; i <= denom; i++) {
    const x = 20 + i * 280 / denom;
    ticks += '<line x1="' + x + '" y1="22" x2="' + x + '" y2="38" stroke="#94a3b8" stroke-width="2"/>';
  }
  lineTicks.innerHTML = ticks;
  lineDot.setAttribute('cx', 20 + dec * 280);
  // 挑战模式：数轴上再放一个绿点标目标位置；拼对了消息变绿。
  if (lineTargetDot) {
    // 注意：这是 SVG <circle>，没有 `hidden` 的 IDL 属性——写 `.hidden = false`
    // 只会挂一个 JS 属性，index.html 里的 hidden 属性还在，CSS 的 [hidden] 规则
    // 会一直把它藏起来。所以必须直接改 hidden 属性。
    if (fracChallenge) lineTargetDot.removeAttribute('hidden');
    else lineTargetDot.setAttribute('hidden', '');
    if (fracChallenge) lineTargetDot.setAttribute('cx', 20 + (FRAC_CH[fracChIdx].n / FRAC_CH[fracChIdx].d) * 280);
  }
  const fracMsgEl = document.getElementById('fracChallengeMsg');
  if (fracMsgEl) {
    if (fracChallenge) {
      const m = fracVerdict();
      fracMsgEl.textContent = m.text;
      fracMsgEl.classList.toggle('ok', m.ok);
    } else { fracMsgEl.textContent = ''; fracMsgEl.classList.remove('ok'); }
  }
}
document.getElementById('numRange').addEventListener('input', e => { numer = +e.target.value; renderFraction(); markTried('fraction'); });
// 拖数轴上的点（Pointer Events，触屏 + 鼠标同一套）
(function () {
  const svg = document.getElementById('lineSvg');
  let dragging = false;
  function setFromEvent(e) {
    const r = svg.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    const xSvg = 20 + ratio * 280;
    numer = Math.max(0, Math.min(denom, Math.round((xSvg - 20) / 280 * denom)));
    renderFraction(); markTried('fraction');
  }
  lineDot.addEventListener('pointerdown', e => { dragging = true; lineDot.setPointerCapture(e.pointerId); setFromEvent(e); });
  lineDot.addEventListener('pointermove', e => { if (dragging) setFromEvent(e); });
  lineDot.addEventListener('pointerup', () => { dragging = false; });
})();
renderFraction();
/* 分数挑战开关：进挑战先把分子清 0（分母不动，拼出一样大的也算对），出挑战恢复进挑战前的样子。 */
function fracSetChallenge(on) {
  fracChallenge = on;
  const box = document.getElementById('fracChallengeBox');
  const btn = document.getElementById('fracChallengeBtn');
  if (on) {
    fracPrev = { denom, numer };
    fracChIdx = 0; numer = 0;
    document.getElementById('fracChallengeTarget').textContent =
      '挑战：拼出 ' + FRAC_CH[0].n + '/' + FRAC_CH[0].d + '（拼出一样大的分数也算对）';
    btn.textContent = '退出挑战';
  } else {
    if (fracPrev) { denom = fracPrev.denom; numer = fracPrev.numer; }
    btn.textContent = '挑战一下';
  }
  box.hidden = !on;
  renderFraction();
  if (on) markTried('fraction');
}
document.getElementById('fracChallengeBtn').addEventListener('click', () => fracSetChallenge(!fracChallenge));
document.getElementById('fracChallengeNext').addEventListener('click', () => {
  fracChIdx = (fracChIdx + 1) % FRAC_CH.length;
  numer = 0;
  const t = FRAC_CH[fracChIdx];
  document.getElementById('fracChallengeTarget').textContent =
    '挑战：拼出 ' + t.n + '/' + t.d + '（拼出一样大的分数也算对）';
  renderFraction();
});

/* ---------- P2 天平 ---------- */
/* 天平挑战：目标方程轮着来（3x+5=20、2x+6=16、4x+3=19，x 都是整数）。
   只动一边天平会歪——挑战模式多一行数字：左边比右边轻几、还差几才能平衡。 */
const BAL_CH = [{ a: 3, b: 5, c: 20 }, { a: 2, b: 6, c: 16 }, { a: 4, b: 3, c: 19 }];
let balEq = { a: 3, b: 5, c: 20 };
let balChallenge = false, balChIdx = 0, balPrev = null;
let balStage = 0; // 0: ax+b=c, 1: ax=c-b, 2: x=(c-b)/a
let balTilt = 0;
function renderBalance() {
  const eq = document.getElementById('balanceEq');
  const msg = document.getElementById('balanceMsg');
  const beam = document.getElementById('beamGroup');
  beam.setAttribute('transform', 'rotate(' + balTilt + ' 160 70)');
  const a = balEq.a, b = balEq.b, c = balEq.c, x = (c - b) / a;
  const x0 = 38 - (a - 3) * 10; // x 方块居中摆（a=3 时和原来一模一样）
  let left = '', right = '';
  const xBox = i => '<rect x="' + (x0 + i * 20) + '" y="78" width="18" height="18" rx="3" fill="#2563eb"/><text x="' + (x0 + 9 + i * 20) + '" y="92" font-size="11" fill="#fff" text-anchor="middle">x</text>';
  if (balStage === 0) {
    eq.textContent = a + 'x + ' + b + ' = ' + c;
    for (let i = 0; i < a; i++) left += xBox(i);
    left += '<rect x="48" y="58" width="24" height="16" rx="3" fill="#ff8a3d"/><text x="60" y="70" font-size="11" fill="#fff" text-anchor="middle">' + b + '</text>';
    right += '<rect x="248" y="58" width="24" height="16" rx="3" fill="#ff8a3d"/><text x="260" y="70" font-size="11" fill="#fff" text-anchor="middle">' + c + '</text>';
    if (balTilt !== 0) msg.textContent = '天平歪了！只动一边不行，两边要一起动。点“重置”再试。';
    else msg.textContent = '天平是平的。先试试两边同时 −' + b + '。';
  } else if (balStage === 1) {
    eq.textContent = a + 'x = ' + (c - b);
    for (let i = 0; i < a; i++) left += xBox(i);
    right += '<rect x="248" y="58" width="24" height="16" rx="3" fill="#ff8a3d"/><text x="260" y="70" font-size="11" fill="#fff" text-anchor="middle">' + (c - b) + '</text>';
    msg.textContent = '两边都拿掉 ' + b + '，天平还是平的。现在两边同时 ÷' + a + '。';
  } else {
    eq.textContent = 'x = ' + x;
    left += '<rect x="48" y="78" width="18" height="18" rx="3" fill="#2563eb"/><text x="57" y="92" font-size="11" fill="#fff" text-anchor="middle">x</text>';
    right += '<rect x="248" y="58" width="24" height="16" rx="3" fill="#ff8a3d"/><text x="260" y="70" font-size="11" fill="#fff" text-anchor="middle">' + x + '</text>';
    msg.textContent = '解出来了：x = ' + x + '。验算：' + a + '×' + x + ' + ' + b + ' = ' + c + ' ✓';
  }
  document.getElementById('leftWeights').innerHTML = left;
  document.getElementById('rightWeights').innerHTML = right;
  document.getElementById('balMinus5').disabled = balStage !== 0 || balTilt !== 0;
  document.getElementById('balDiv3').disabled = balStage !== 1;
  document.getElementById('balWrong').disabled = balStage !== 0 || balTilt !== 0;
  // 按钮文案跟着当前方程走（默认 3x+5=20 时和原来一字不差）。
  document.getElementById('balMinus5').textContent = '两边同时 −' + b;
  document.getElementById('balDiv3').textContent = '两边同时 ÷' + a;
  document.getElementById('balWrong').textContent = '只左边 −' + b + '（试试）';
  // 挑战模式的数字缺口：歪了就报轻几、还差几；平了就报下一步。
  const gapEl = document.getElementById('balGap');
  if (gapEl) {
    if (!balChallenge) { gapEl.textContent = ''; gapEl.classList.remove('ok'); }
    else if (balStage === 2) {
      gapEl.textContent = 'x = ' + x + '：验算 ' + a + '×' + x + ' + ' + b + ' = ' + c + '，拼对了！';
      gapEl.classList.add('ok');
    } else if (balStage === 1) {
      gapEl.textContent = '左边 ' + a + 'x = ' + (c - b) + '，右边 ' + (c - b) + '：平了。下一步：两边同时 ÷' + a + '。';
      gapEl.classList.remove('ok');
    } else if (balTilt !== 0) {
      gapEl.textContent = '只动了左边：左边 ' + a + 'x = ' + (c - b) + '，右边 ' + c + '：左边轻 ' + b + '，还差 ' + b + ' 才能平衡。点“重置”再试。';
      gapEl.classList.remove('ok');
    } else {
      gapEl.textContent = '左边 ' + a + 'x+' + b + '，右边 ' + c + '：平的。下一步：两边同时 −' + b + '。';
      gapEl.classList.remove('ok');
    }
  }
}
document.getElementById('balMinus5').addEventListener('click', () => { balStage = 1; balTilt = 0; renderBalance(); markTried('balance'); });
document.getElementById('balDiv3').addEventListener('click', () => { balStage = 2; renderBalance(); markTried('balance'); });
document.getElementById('balWrong').addEventListener('click', () => { balTilt = -12; renderBalance(); markTried('balance'); });
document.getElementById('balReset').addEventListener('click', () => { balStage = 0; balTilt = 0; renderBalance(); });
renderBalance();
/* 天平挑战开关：进挑战从第一道题、第一步开始，出挑战恢复进挑战前的方程和进度。 */
function balSetChallenge(on) {
  balChallenge = on;
  const box = document.getElementById('balChallengeBox');
  const btn = document.getElementById('balChallengeBtn');
  if (on) {
    balPrev = { eq: { ...balEq }, stage: balStage, tilt: balTilt };
    balChIdx = 0; balEq = { ...BAL_CH[0] }; balStage = 0; balTilt = 0;
    document.getElementById('balChallengeTarget').textContent =
      '挑战：解 ' + balEq.a + 'x + ' + balEq.b + ' = ' + balEq.c + '，x 是几？';
    btn.textContent = '退出挑战';
  } else {
    if (balPrev) { balEq = balPrev.eq; balStage = balPrev.stage; balTilt = balPrev.tilt; }
    btn.textContent = '挑战一下';
  }
  box.hidden = !on;
  renderBalance();
  if (on) markTried('balance');
}
document.getElementById('balChallengeBtn').addEventListener('click', () => balSetChallenge(!balChallenge));
document.getElementById('balChallengeNext').addEventListener('click', () => {
  balChIdx = (balChIdx + 1) % BAL_CH.length;
  balEq = { ...BAL_CH[balChIdx] }; balStage = 0; balTilt = 0;
  document.getElementById('balChallengeTarget').textContent =
    '挑战：解 ' + balEq.a + 'x + ' + balEq.b + ' = ' + balEq.c + '，x 是几？';
  renderBalance();
});

/* ---------- P3 函数 ---------- */
const canvas = document.getElementById('funcCanvas');
const ctx = canvas.getContext('2d');
function fmtNum(v) { return String(Math.round(v * 100) / 100); }
function fmtFunc(t) {
  const ks = t.k === 1 ? 'x' : t.k === -1 ? '-x' : fmtNum(t.k) + 'x';
  return 'y = ' + ks + (t.b >= 0 ? ' + ' + fmtNum(t.b) : ' − ' + fmtNum(-t.b));
}
/* 函数挑战：目标直线（蓝色虚线），k、b 都在滑杆范围内；错了不只说错，
   图上把两条线在取样点的落差连起来，文案报出差几、斜率还是截距不对。 */
const FUNC_CH = [{ k: 2, b: 1 }, { k: 1, b: 10 }, { k: -1, b: 12 }, { k: 3, b: 0 }, { k: 0.5, b: 5 }];
let funcChallenge = false, funcChIdx = 0, funcPrev = null;
/* 画一次函数图像（主演示和数学实验室共用）：给 k、b 和一块画布，就画网格、坐标轴、
   直线 y = kx + b 和 (0, b) 截距点。标签和表格各由调用方自己管。
   挑战模式多传一个 target {k, b}：目标直线画成蓝色虚线，并在取样点把两条线的
   落差连起来标出差几；返回取样点的落差数据（没传 target 时返回 null）。 */
function drawFuncGraph(c2, cv, k, b, target) {
  const W = cv.width, H = cv.height;
  const xMin = -5, xMax = 6, yMin = -10, yMax = 24;
  const X = x => 50 + (x - xMin) / (xMax - xMin) * (W - 70);
  const Y = y => H - 40 - (y - yMin) / (yMax - yMin) * (H - 70);
  c2.clearRect(0, 0, W, H);
  c2.strokeStyle = '#e2e8f0'; c2.lineWidth = 1;
  for (let x = xMin; x <= xMax; x++) { c2.beginPath(); c2.moveTo(X(x), Y(yMin)); c2.lineTo(X(x), Y(yMax)); c2.stroke(); }
  for (let y = -10; y <= 20; y += 5) { c2.beginPath(); c2.moveTo(X(xMin), Y(y)); c2.lineTo(X(xMax), Y(y)); c2.stroke(); }
  c2.strokeStyle = '#334155'; c2.lineWidth = 2;
  c2.beginPath(); c2.moveTo(X(xMin), Y(0)); c2.lineTo(X(xMax), Y(0)); c2.stroke();
  c2.beginPath(); c2.moveTo(X(0), Y(yMin)); c2.lineTo(X(0), Y(yMax)); c2.stroke();
  c2.fillStyle = '#64748b'; c2.font = '13px system-ui';
  c2.fillText('x', X(xMax) - 8, Y(0) - 8); c2.fillText('y', X(0) + 8, Y(yMax) + 14);
  // line y = kx + b
  c2.strokeStyle = '#ff8a3d'; c2.lineWidth = 4; c2.beginPath();
  c2.moveTo(X(xMin), Y(k * xMin + b)); c2.lineTo(X(xMax), Y(k * xMax + b)); c2.stroke();
  // intercept (0,b)
  c2.fillStyle = '#2563eb'; c2.beginPath(); c2.arc(X(0), Y(b), 7, 0, Math.PI * 2); c2.fill();
  c2.fillStyle = '#1d4ed8'; c2.font = 'bold 14px system-ui';
  c2.fillText('(0, ' + b + ')', X(0) + 12, Y(b) - 8);
  if (!target) return null;
  const tk = target.k, tb = target.b;
  c2.strokeStyle = '#2563eb'; c2.lineWidth = 3;
  c2.setLineDash([8, 6]);
  c2.beginPath(); c2.moveTo(X(xMin), Y(tk * xMin + tb)); c2.lineTo(X(xMax), Y(tk * xMax + tb)); c2.stroke();
  c2.setLineDash([]);
  c2.fillStyle = '#1d4ed8'; c2.font = 'bold 14px system-ui';
  c2.fillText('目标 ' + fmtFunc(target), 12, 24);
  // 取样点：从大到小找一个两条线的 y 都在图里的 x，落差画出来。
  let sx = 0, uy = b, ty = tb;
  for (const x of [5, 3, 2, 1, 0]) {
    const a = k * x + b, c = tk * x + tb;
    if (a >= yMin && a <= yMax && c >= yMin && c <= yMax) { sx = x; uy = a; ty = c; break; }
  }
  if (Math.abs(uy - ty) > 0.001) {
    c2.strokeStyle = '#dc2626'; c2.lineWidth = 2; c2.setLineDash([4, 4]);
    c2.beginPath(); c2.moveTo(X(sx), Y(uy)); c2.lineTo(X(sx), Y(ty)); c2.stroke();
    c2.setLineDash([]);
    c2.fillStyle = '#ff8a3d'; c2.beginPath(); c2.arc(X(sx), Y(uy), 6, 0, Math.PI * 2); c2.fill();
    c2.fillStyle = '#2563eb'; c2.beginPath(); c2.arc(X(sx), Y(ty), 6, 0, Math.PI * 2); c2.fill();
    c2.fillStyle = '#dc2626'; c2.font = 'bold 14px system-ui';
    c2.fillText('差 ' + fmtNum(Math.abs(uy - ty)), X(sx) + 10, (Y(uy) + Y(ty)) / 2);
  }
  return { sampleX: sx, userY: uy, targetY: ty };
}
function drawFunc() {
  const k = parseFloat(document.getElementById('kRange').value);
  const b = parseFloat(document.getElementById('bRange').value);
  document.getElementById('kLabel').textContent = k;
  document.getElementById('bLabel').textContent = b;
  document.getElementById('funcK').textContent = k;
  document.getElementById('funcB').textContent = b;
  const gap = drawFuncGraph(ctx, canvas, k, b, funcChallenge ? FUNC_CH[funcChIdx] : null);
  // table: x = 0..5 连续，4 不能跳过（以前是 0,1,2,3,5，4 莫名缺席）。
  [0, 1, 2, 3, 4, 5].forEach(x => { document.getElementById('y' + x).textContent = (k * x + b); });
  document.getElementById('funcChallenge').textContent =
    '小挑战：x = 2 公里时要付 ' + (k * 2 + b) + ' 元。试试把起步价调到 10 元，2 公里又是多少？';
  const gapEl = document.getElementById('funcGapMsg');
  if (gapEl) {
    if (!funcChallenge) { gapEl.textContent = ''; gapEl.classList.remove('ok'); }
    else {
      const t = FUNC_CH[funcChIdx];
      if (k === t.k && b === t.b) {
        gapEl.textContent = '画对了！你的直线和目标完全重合：' + fmtFunc(t) + '。';
        gapEl.classList.add('ok');
      } else {
        const diff = gap ? gap.userY - gap.targetY : 0;
        const sx = gap ? gap.sampleX : 0;
        const uy = gap ? gap.userY : k * sx + b;
        const ty = gap ? gap.targetY : t.k * sx + t.b;
        let hint;
        if (k === t.k) hint = '斜率对了，截距还差 ' + fmtNum(Math.abs(b - t.b)) + '：b 应该是 ' + fmtNum(t.b) + '。';
        else if (b === t.b) hint = '截距对了，斜率还差 ' + fmtNum(Math.abs(k - t.k)) + '：k 应该是 ' + fmtNum(t.k) + '。';
        else hint = '再调调 k 和 b，让两条线重合。';
        gapEl.textContent = '在 x = ' + sx + ' 处，你的 y 是 ' + fmtNum(uy) + '，目标是 ' + fmtNum(ty) + '，' +
          (diff > 0 ? '大了 ' + fmtNum(diff) : diff < 0 ? '小了 ' + fmtNum(-diff) : '正好对上') + '。' + hint;
        gapEl.classList.remove('ok');
      }
    }
  }
}
document.getElementById('kRange').addEventListener('input', () => { drawFunc(); markTried('function'); });
document.getElementById('bRange').addEventListener('input', () => { drawFunc(); markTried('function'); });
drawFunc();
/* 函数挑战开关：进挑战不改滑杆（从当前直线出发调），出挑战恢复进挑战前的 k、b。 */
function funcSetChallenge(on) {
  funcChallenge = on;
  const box = document.getElementById('funcChallengeBox');
  const btn = document.getElementById('funcChallengeBtn');
  if (on) {
    funcPrev = { k: document.getElementById('kRange').value, b: document.getElementById('bRange').value };
    funcChIdx = 0;
    document.getElementById('funcChallengeTarget').textContent =
      '挑战：画出 ' + fmtFunc(FUNC_CH[0]) + '（蓝色虚线是目标）';
    btn.textContent = '退出挑战';
  } else {
    if (funcPrev) {
      document.getElementById('kRange').value = funcPrev.k;
      document.getElementById('bRange').value = funcPrev.b;
    }
    btn.textContent = '挑战一下';
  }
  box.hidden = !on;
  drawFunc();
  if (on) markTried('function');
}
document.getElementById('funcChallengeBtn').addEventListener('click', () => funcSetChallenge(!funcChallenge));
document.getElementById('funcChallengeNext').addEventListener('click', () => {
  funcChIdx = (funcChIdx + 1) % FUNC_CH.length;
  document.getElementById('funcChallengeTarget').textContent =
    '挑战：画出 ' + fmtFunc(FUNC_CH[funcChIdx]) + '（蓝色虚线是目标）';
  drawFunc();
});

/* ---------- P0 十格阵：凑十 / 破十（1 年级招牌教法） ----------
   加法：点右边一个圆点，把它搬到左边凑成 10（也可以拖过去）；减法：点满 10 的格子
   里的圆点拿走。凑十和破十是同一招的两面：都是围着 10 重捆。 */
const TF_ADD = [[9, 4], [8, 5], [7, 6], [9, 7], [8, 8]];
const TF_SUB = [[13, 5], [12, 4], [15, 8], [14, 6], [11, 7]];
/* 十格阵挑战：目标总数（比如 13），格子随便点、随便拿；拼错了图会标出来——
   多出来的圆点描红框，还差几个文案直接报数。凑十/破十照常用（只换位置，不改总数）。 */
const TF_CH = [{ t: 13, hint: '9 + 4' }, { t: 12, hint: '8 + 4' }, { t: 14, hint: '7 + 7' }, { t: 15, hint: '9 + 6' }, { t: 11, hint: '5 + 6' }];
let tfChallenge = false, tfChIdx = 0, tfPrev = null;
let tfMode = 'add';
let tfProb = 0;
let tfA = 9, tfB = 4; // 加法：A 框个数，B 框个数；减法：A 框是满 10 框里剩的，B 是零散个数
let tfTaken = 0; // 减法：已经拿走了几个
const tfAEl = document.getElementById('tfA');
const tfBEl = document.getElementById('tfB');
const tfCells = { A: [], B: [] };
let tfDrag = null;
function tfCellClick(f, i) {
  if (tfChallenge) {
    // 挑战模式：格子随便点、随便拿，点一下放一个、再点拿走。
    const cell = tfCells[f][i];
    cell.classList.toggle('filled');
    tfA = tfCells.A.filter(c => c.classList.contains('filled')).length;
    tfB = tfCells.B.filter(c => c.classList.contains('filled')).length;
    tfRender(); markTried('tenframe');
    return;
  }
  if (tfMode === 'add' && f === 'B' && i < tfB) tfMoveOne();
  else if (tfMode === 'sub' && f === 'A' && i < tfA) tfTakeOne();
}
function tfCellDown(f, i) {
  if (tfChallenge) return; // 挑战模式只点不拖
  // 只支持加法从 B 框拖到 A 框；减法拿走直接点。
  if (tfMode === 'add' && f === 'B' && i < tfB) {
    tfDrag = { f, i };
    tfCells.B[i].classList.add('dragging');
  }
}
function tfCellUp(f) {
  if (!tfDrag) return;
  tfCells[tfDrag.f][tfDrag.i].classList.remove('dragging');
  const ok = tfMode === 'add' && tfDrag.f === 'B' && f === 'A';
  tfDrag = null;
  if (ok) tfMoveOne();
}
['A', 'B'].forEach(f => {
  const box = f === 'A' ? tfAEl : tfBEl;
  for (let i = 0; i < 10; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tf-cell' + (f === 'B' ? ' b' : '');
    b.setAttribute('aria-label', (f === 'A' ? '第一个格子第 ' : '第二个格子第 ') + (i + 1) + ' 格');
    b.addEventListener('click', () => tfCellClick(f, i));
    b.addEventListener('pointerdown', () => tfCellDown(f, i));
    b.addEventListener('pointercancel', () => tfCellCancel());
    box.appendChild(b);
    tfCells[f].push(b);
  }
});
// 松手落在整副格子上都算（不只落在圆点上）：快拖时手指常落在格子缝里，
// 只绑在圆点上的 pointerup 会丢。框的 pointerup 先跑，wrap 的随后只做清理。
tfAEl.addEventListener('pointerup', () => tfCellUp('A'));
tfBEl.addEventListener('pointerup', () => tfCellUp('B'));
document.getElementById('tfWrap').addEventListener('pointerup', () => tfCellCancel());
function tfCellCancel() {
  if (!tfDrag) return;
  tfCells[tfDrag.f][tfDrag.i].classList.remove('dragging');
  tfDrag = null;
}
function tfMoveOne() {
  if (tfA >= 10 || tfB <= 0) return;
  tfA++; tfB--;
  tfRender(); markTried('tenframe');
}
function tfTakeOne() {
  const take = TF_SUB[tfProb][1];
  if (tfTaken >= take) return;
  tfA--; tfTaken++;
  tfRender(); markTried('tenframe');
}
function tfAuto() {
  if (tfMode === 'add') { while (tfA < 10 && tfB > 0) { tfA++; tfB--; } }
  else { const take = TF_SUB[tfProb][1]; while (tfTaken < take) { tfA--; tfTaken++; } }
  tfRender(); markTried('tenframe');
}
function tfSetProblem(mode, idx) {
  if (tfChallenge) return; // 挑战进行中不换题（玩法和题目段都已灰掉），免得把拼了一半的清掉
  tfMode = mode; tfProb = idx; tfTaken = 0;
  const list = mode === 'add' ? TF_ADD : TF_SUB;
  tfA = mode === 'add' ? list[idx][0] : 10;
  tfB = mode === 'add' ? list[idx][1] : list[idx][0] - 10;
  document.querySelectorAll('#tfModeSeg [data-tf-mode]').forEach(b =>
    b.setAttribute('aria-pressed', String(b.dataset.tfMode === mode)));
  const seg = document.getElementById('tfProbSeg');
  seg.innerHTML = '';
  list.forEach((pr, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = pr[0] + (mode === 'add' ? '+' : '−') + pr[1];
    b.setAttribute('aria-pressed', String(i === idx));
    b.addEventListener('click', () => tfSetProblem(mode, i));
    seg.appendChild(b);
  });
  document.getElementById('tfAuto').textContent = mode === 'add' ? '凑十！' : '破十！';
  tfRender();
}
function tfRender() {
  tfCells.A.forEach((c, i) => c.classList.toggle('filled', i < tfA));
  tfCells.B.forEach((c, i) => c.classList.toggle('filled', i < tfB));
  tfCells.A.concat(tfCells.B).forEach(c => c.classList.remove('extra'));
  const eq = document.getElementById('tfEq');
  const note = document.getElementById('tfNote');
  if (tfChallenge) {
    const target = TF_CH[tfChIdx].t;
    const total = tfA + tfB;
    document.getElementById('tfLabelA').textContent = '第一个格子 · ' + tfA + ' 个';
    document.getElementById('tfLabelB').textContent = '第二个格子 · ' + tfB + ' 个';
    eq.textContent = tfA + ' + ' + tfB + ' = ' + total;
    if (total === target) {
      note.textContent = '拼对了！' + tfA + ' + ' + tfB + ' = ' + total + '。' + (tfA === 10 ? '你凑成了 10 再加 ' + tfB + '，不用一个一个数了。' : '换个拼法试试：凑成 10 再加，行不行？');
    } else if (total > target) {
      note.textContent = '你拼出的是 ' + tfA + ' + ' + tfB + ' = ' + total + '，不是 ' + target + '：多了 ' + (total - target) + ' 个，红框的是多出来的，点一下拿掉。';
      // 多出来的圆点描红框：按 A 再 B 的顺序，目标之外的已填格子就是多出来的。
      let seen = 0;
      tfCells.A.concat(tfCells.B).forEach(c => {
        if (!c.classList.contains('filled')) return;
        seen++;
        if (seen > target) c.classList.add('extra');
      });
    } else {
      note.textContent = '你拼出的是 ' + tfA + ' + ' + tfB + ' = ' + total + '，不是 ' + target + '：还差 ' + (target - total) + ' 个，再放 ' + (target - total) + ' 个圆点。';
    }
    return;
  }
  document.getElementById('tfLabelA').textContent =
    tfMode === 'add' ? '第一个格子 · ' + tfA + ' 个' : '满 10 的格子 · 还剩 ' + tfA + ' 个';
  document.getElementById('tfLabelB').textContent =
    tfMode === 'add' ? '第二个格子 · ' + tfB + ' 个' : '零散的 · ' + tfB + ' 个';
  if (tfMode === 'add') {
    const pr = TF_ADD[tfProb];
    if (tfA < 10) {
      eq.textContent = pr[0] + ' + ' + pr[1] + ' = ?';
      note.textContent = '还差 ' + (10 - tfA) + ' 个满 10：点右边一个圆点搬过来，或点“凑十！”。也可以拖过去。';
    } else {
      eq.textContent = pr[0] + ' + ' + pr[1] + ' = ' + (10 + tfB);
      note.textContent = '10 + ' + tfB + ' = ' + (10 + tfB) + '。' + pr[0] + ' 凑成 10 之后，剩下 ' + tfB + ' 个，不用一个一个数了。';
    }
  } else {
    const pr = TF_SUB[tfProb];
    const take = pr[1];
    if (tfTaken < take) {
      eq.textContent = pr[0] + ' − ' + take + ' = ?';
      note.textContent = '已经拿走 ' + tfTaken + ' 个，还要拿 ' + (take - tfTaken) + ' 个：点上面满格里的圆点。';
    } else {
      eq.textContent = pr[0] + ' − ' + take + ' = ' + (10 - take + tfB);
      note.textContent = '(10 − ' + take + ') + ' + tfB + ' = ' + (10 - take + tfB) + '。先从 10 里拿走，再加零散的 ' + tfB + ' 个。';
    }
  }
}
document.querySelectorAll('#tfModeSeg [data-tf-mode]').forEach(b =>
  b.addEventListener('click', () => tfSetProblem(b.dataset.tfMode, 0)));
document.getElementById('tfAuto').addEventListener('click', tfAuto);
document.getElementById('tfReset').addEventListener('click', () => {
  if (tfChallenge) { tfA = 0; tfB = 0; tfRender(); return; } // 挑战里的“重来”是清空重拼
  tfSetProblem(tfMode, tfProb);
});
tfSetProblem('add', 0);
/* 十格阵挑战开关：进挑战先切回加法、清空重拼，出挑战恢复进挑战前的玩法和题目。 */
function tfSetChallenge(on) {
  const card = document.getElementById('demo-tenframe');
  const btn = document.getElementById('tfChallengeBtn');
  const box = document.getElementById('tfChallengeBox');
  if (on) {
    tfPrev = { mode: tfMode, prob: tfProb };
    tfChIdx = 0;
    tfSetProblem('add', 0); // tfChallenge 还是 false，能正常切题
    tfChallenge = true;
    tfA = 0; tfB = 0; tfTaken = 0;
    document.getElementById('tfChallengeTarget').textContent =
      '挑战：拼出 ' + TF_CH[0].t + '（比如 ' + TF_CH[0].hint + '，也可以凑成 10 再加）';
    card.classList.add('challenge-on');
    btn.textContent = '退出挑战';
    box.hidden = false;
    tfRender();
    markTried('tenframe');
  } else {
    tfChallenge = false;
    card.classList.remove('challenge-on');
    btn.textContent = '挑战一下';
    box.hidden = true;
    tfSetProblem(tfPrev ? tfPrev.mode : 'add', tfPrev ? tfPrev.prob : 0);
  }
}
document.getElementById('tfChallengeBtn').addEventListener('click', () => tfSetChallenge(!tfChallenge));
document.getElementById('tfChallengeNext').addEventListener('click', () => {
  tfChIdx = (tfChIdx + 1) % TF_CH.length;
  tfA = 0; tfB = 0;
  const t = TF_CH[tfChIdx];
  document.getElementById('tfChallengeTarget').textContent =
    '挑战：拼出 ' + t.t + '（比如 ' + t.hint + '，也可以凑成 10 再加）';
  tfRender();
});

/* ---------- 为什么小实验 ---------- */
// 进位：从 8 个一开始，+1 到 10 就打包成 1 个十
let carryOnes = 8, carryTens = 0;
function renderCarry() {
  const el = document.getElementById('carryVisual');
  let html = '';
  for (let i = 0; i < carryTens; i++) html += '<span class="dot-ten">1 个十</span>';
  for (let i = 0; i < carryOnes; i++) html += '<span class="dot-one">1</span>';
  html += '<span style="margin-left:6px;font-weight:700">' + (carryTens * 10 + carryOnes) + ' = ' + carryTens + ' 个十 + ' + carryOnes + ' 个一</span>';
  el.innerHTML = html;
}
document.getElementById('carryAdd').addEventListener('click', () => {
  carryOnes++;
  if (carryOnes === 10) { carryOnes = 0; carryTens++; }
  renderCarry(); markTried('why-carry');
});
document.getElementById('carryReset').addEventListener('click', () => { carryOnes = 8; carryTens = 0; renderCarry(); });
renderCarry();

// 分数除法：3/4 里有几个 1/4
let fracDivCounted = 0;
function renderFracDiv() {
  const el = document.getElementById('fracDivVisual');
  let html = '';
  for (let i = 0; i < 3; i++) {
    html += '<span class="frac-piece' + (i < fracDivCounted ? ' counted' : '') + '" style="width:72px">1/4</span>';
  }
  html += '<span style="font-weight:700">3/4 ÷ 1/4 = ' + fracDivCounted + '（已数 ' + fracDivCounted + ' 个）</span>';
  el.innerHTML = html;
}
document.getElementById('fracDivCount').addEventListener('click', () => {
  if (fracDivCounted < 3) fracDivCounted++;
  renderFracDiv(); markTried('why-fracdiv');
});
document.getElementById('fracDivReset').addEventListener('click', () => { fracDivCounted = 0; renderFracDiv(); });
renderFracDiv();

// 面积：行 × 列 = 小方块总数
let areaRows = 3, areaCols = 4;
function renderArea() {
  document.getElementById('areaRowsLabel').textContent = areaRows;
  document.getElementById('areaColsLabel').textContent = areaCols;
  const svg = document.getElementById('areaGrid');
  const cw = 280 / areaCols, ch = 140 / areaRows;
  let s = '';
  for (let r = 0; r < areaRows; r++) for (let c = 0; c < areaCols; c++) {
    s += '<rect x="' + (20 + c * cw).toFixed(1) + '" y="' + (20 + r * ch).toFixed(1) + '" width="' + (cw - 3).toFixed(1) + '" height="' + (ch - 3).toFixed(1) + '" rx="4" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>';
  }
  svg.innerHTML = s;
  document.getElementById('areaText').textContent = areaRows + ' 行 × ' + areaCols + ' 列 = ' + (areaRows * areaCols) + ' 个小方块，面积就是 ' + (areaRows * areaCols) + '。';
}
document.getElementById('areaRowPlus').addEventListener('click', () => { if (areaRows < 5) areaRows++; renderArea(); markTried('why-area'); });
document.getElementById('areaRowMinus').addEventListener('click', () => { if (areaRows > 1) areaRows--; renderArea(); markTried('why-area'); });
document.getElementById('areaColPlus').addEventListener('click', () => { if (areaCols < 6) areaCols++; renderArea(); markTried('why-area'); });
document.getElementById('areaColMinus').addEventListener('click', () => { if (areaCols > 1) areaCols--; renderArea(); markTried('why-area'); });
renderArea();

/* ---------- 数学实验室 · 自由玩（借 NB实验室“自由组合、即时看后果”的做法）
   四个小站是独立的自由模式实例，原演示一字不动：
   - 分数站复用 polar()/sector() 画饼 + 同款数轴拖点；
   - 十格阵站复用 .tf-cell 样式，点格子放/拿圆点；
   - 天平站复用横梁 SVG 结构，砝码随便加减，横梁按两边重量实时倾斜；
   - 函数站复用 drawFuncGraph() 画图，k/b 随便调。
   四个小站都没有固定题目、不判对错、不计入“已体验演示”进度——实验室就是来玩的。 */

/* 分数自由玩：分母、分子随便改，饼和数轴实时跟上 */
let labDenom = 4, labNumer = 3;
const labPieSvg = document.getElementById('labFracPie');
const labLineTicks = document.getElementById('labFracTicks');
const labLineDot = document.getElementById('labFracDot');
const labDenomSeg = document.getElementById('labFracDenomSeg');
[2, 3, 4, 6, 8].forEach(d => {
  const b = document.createElement('button');
  b.type = 'button'; b.textContent = d; b.setAttribute('aria-pressed', String(d === labDenom));
  b.addEventListener('click', () => { labDenom = d; if (labNumer > d) labNumer = d; labRenderFrac(); });
  labDenomSeg.appendChild(b);
});
function labRenderFrac() {
  [...labDenomSeg.children].forEach((el, i) => el.setAttribute('aria-pressed', String([2, 3, 4, 6, 8][i] === labDenom)));
  document.getElementById('labFracNumRange').max = labDenom;
  document.getElementById('labFracNumRange').value = labNumer;
  document.getElementById('labFracNumLabel').textContent = labNumer;
  let svg = '';
  for (let i = 0; i < labDenom; i++) {
    const a0 = i * 360 / labDenom, a1 = (i + 1) * 360 / labDenom;
    svg += '<path d="' + sector(100, 100, 88, a0, a1) + '" fill="' + (i < labNumer ? '#ff8a3d' : '#fff3e6') +
      '" stroke="#c2410c" stroke-width="2" data-lab-slice="' + i + '" style="cursor:pointer"/>';
  }
  labPieSvg.innerHTML = svg;
  labPieSvg.querySelectorAll('[data-lab-slice]').forEach(p => p.addEventListener('click', () => {
    const i = +p.dataset.labSlice; labNumer = (i < labNumer) ? i : i + 1; labRenderFrac();
  }));
  const dec = labDenom ? (labNumer / labDenom) : 0;
  document.getElementById('labFracText').textContent = labNumer + '/' + labDenom;
  document.getElementById('labFracDecimal').textContent = dec.toFixed(2).replace(/0$/, '');
  document.getElementById('labFracNote').textContent =
    labNumer === 0 ? '还没取，试着拖滑杆或点一块饼。' :
    labNumer === labDenom ? '取满了，就是 1 个整体。' :
    '取了 ' + labNumer + ' 份，每份是 1/' + labDenom + '。';
  let ticks = '';
  for (let i = 0; i <= labDenom; i++) {
    const x = 20 + i * 280 / labDenom;
    ticks += '<line x1="' + x + '" y1="22" x2="' + x + '" y2="38" stroke="#94a3b8" stroke-width="2"/>';
  }
  labLineTicks.innerHTML = ticks;
  labLineDot.setAttribute('cx', 20 + dec * 280);
}
document.getElementById('labFracNumRange').addEventListener('input', e => { labNumer = +e.target.value; labRenderFrac(); });
document.getElementById('labFracReset').addEventListener('click', () => { labDenom = 4; labNumer = 3; labRenderFrac(); });
(function () {
  const svg = document.getElementById('labFracLine');
  let dragging = false;
  function setFromEvent(e) {
    const r = svg.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    const xSvg = 20 + ratio * 280;
    labNumer = Math.max(0, Math.min(labDenom, Math.round((xSvg - 20) / 280 * labDenom)));
    labRenderFrac();
  }
  labLineDot.addEventListener('pointerdown', e => { dragging = true; labLineDot.setPointerCapture(e.pointerId); setFromEvent(e); });
  labLineDot.addEventListener('pointermove', e => { if (dragging) setFromEvent(e); });
  labLineDot.addEventListener('pointerup', () => { dragging = false; });
})();
labRenderFrac();

/* 十格阵自由玩：点格子放一个圆点，再点拿走；算式实时算两边加起来是多少 */
let labTfA = 0, labTfB = 0;
const labTfAEl = document.getElementById('labTfA');
const labTfBEl = document.getElementById('labTfB');
const labTfCells = { A: [], B: [] };
['A', 'B'].forEach(f => {
  const box = f === 'A' ? labTfAEl : labTfBEl;
  for (let i = 0; i < 10; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tf-cell' + (f === 'B' ? ' b' : '');
    b.setAttribute('aria-label', (f === 'A' ? '左边第 ' : '右边第 ') + (i + 1) + ' 格');
    b.addEventListener('click', () => labTfToggle(f, i));
    box.appendChild(b);
    labTfCells[f].push(b);
  }
});
function labTfToggle(f, i) {
  const cell = labTfCells[f][i];
  cell.classList.toggle('filled', !cell.classList.contains('filled'));
  labTfA = labTfCells.A.filter(c => c.classList.contains('filled')).length;
  labTfB = labTfCells.B.filter(c => c.classList.contains('filled')).length;
  labTfRender();
}
function labTfRender() {
  document.getElementById('labTfLabelA').textContent = '左边 · ' + labTfA + ' 个';
  document.getElementById('labTfLabelB').textContent = '右边 · ' + labTfB + ' 个';
  document.getElementById('labTfEq').textContent = labTfA + ' + ' + labTfB + ' = ' + (labTfA + labTfB);
  document.getElementById('labTfNote').textContent =
    (labTfA === 10 && labTfB === 10) ? '两边都满了：10 + 10 = 20。' :
    (labTfA + labTfB === 0) ? '试试：两边都放满 10 个，是多少？只放一边 10 个、另一边 0 个呢？' :
    '现在是 ' + labTfA + ' + ' + labTfB + ' = ' + (labTfA + labTfB) + '。再点一个格子试试？';
}
document.getElementById('labTfReset').addEventListener('click', () => {
  labTfCells.A.forEach(c => c.classList.remove('filled'));
  labTfCells.B.forEach(c => c.classList.remove('filled'));
  labTfA = 0; labTfB = 0; labTfRender();
});
labTfRender();

/* 天平自由玩：两边砝码随便加减（按钮或点砝码），横梁按重量差实时倾斜 */
let labBalL = 5, labBalR = 3;
function labRenderBal() {
  const tilt = Math.max(-15, Math.min(15, (labBalR - labBalL) * 3));
  document.getElementById('labBeamGroup').setAttribute('transform', 'rotate(' + tilt + ' 160 70)');
  let left = '', right = '';
  for (let i = 0; i < labBalL; i++) {
    left += '<rect x="' + (33 + (i % 5) * 13) + '" y="' + (76 + Math.floor(i / 5) * 13) + '" width="11" height="11" rx="2" fill="#2563eb" data-lab-w="L" style="cursor:pointer"/>';
  }
  for (let i = 0; i < labBalR; i++) {
    right += '<rect x="' + (233 + (i % 5) * 13) + '" y="' + (76 + Math.floor(i / 5) * 13) + '" width="11" height="11" rx="2" fill="#ff8a3d" data-lab-w="R" style="cursor:pointer"/>';
  }
  document.getElementById('labLeftWeights').innerHTML = left;
  document.getElementById('labRightWeights').innerHTML = right;
  document.querySelectorAll('#labBalSvg [data-lab-w]').forEach(w => w.addEventListener('click', () => {
    if (w.dataset.labW === 'L' && labBalL > 0) labBalL--;
    if (w.dataset.labW === 'R' && labBalR > 0) labBalR--;
    labRenderBal();
  }));
  document.getElementById('labBalEq').textContent = '左 ' + labBalL + ' ＝ 右 ' + labBalR;
  document.getElementById('labBalMsg').textContent =
    labBalL === labBalR ? '天平平了，左右一样重。' :
    labBalL > labBalR ? '左边重 ' + (labBalL - labBalR) + '，天平向左歪了。试试右边再加几个。' :
    '右边重 ' + (labBalR - labBalL) + '，天平向右歪了。试试左边再加几个。';
}
function labBalChange(side, d) {
  if (side === 'L') labBalL = Math.max(0, Math.min(10, labBalL + d));
  else labBalR = Math.max(0, Math.min(10, labBalR + d));
  labRenderBal();
}
document.getElementById('labBalAddL').addEventListener('click', () => labBalChange('L', 1));
document.getElementById('labBalSubL').addEventListener('click', () => labBalChange('L', -1));
document.getElementById('labBalAddR').addEventListener('click', () => labBalChange('R', 1));
document.getElementById('labBalSubR').addEventListener('click', () => labBalChange('R', -1));
document.getElementById('labBalReset').addEventListener('click', () => { labBalL = 0; labBalR = 0; labRenderBal(); });
labRenderBal();

/* 函数自由玩：k、b 随便调，直线和表格实时跟上（画图走共用的 drawFuncGraph） */
const labFuncCanvas = document.getElementById('labFuncCanvas');
const labFuncCtx = labFuncCanvas.getContext('2d');
function drawLabFunc() {
  const k = parseFloat(document.getElementById('labFuncKRange').value);
  const b = parseFloat(document.getElementById('labFuncBRange').value);
  document.getElementById('labFuncKLabel').textContent = k;
  document.getElementById('labFuncBLabel').textContent = b;
  document.getElementById('labFuncK').textContent = k;
  document.getElementById('labFuncB').textContent = b;
  drawFuncGraph(labFuncCtx, labFuncCanvas, k, b);
  [0, 1, 2, 3, 4, 5].forEach(x => { document.getElementById('labY' + x).textContent = (k * x + b); });
}
document.getElementById('labFuncKRange').addEventListener('input', drawLabFunc);
document.getElementById('labFuncBRange').addEventListener('input', drawLabFunc);
drawLabFunc();


/* ================= 一年级实验（1.1–1.16，2026-11-06） =================
   13 个新实验：1.6/1.9/1.11 继续用十格阵，其余 13 条各一个小实验。
   每个实验只做一个认知动作，不评分、不记进度、不碰浏览器历史。
   （片段来自 ~/workspace/g1-demos/group-a..d，由 assemble.py 拼进来。） */

/* 一年级 A 组演示（1.1 数数 / 1.2 位置 / 1.3 分与合 / 1.4 加减法与 0）
   手算验算过的数（2026-11-06）：
   数数：5 对 7 → 下面多 2（7−5=2）；5 对 5 → 一样多；10 对 0 → 上面多 10；0 对 0 → 一样多。
   位置（小人在 (1,1)，星星的相对位置按朝向算；朝上=前是北，朝右=前是东，朝下=前是南，朝左=前是西）：
     星在北 (0,1)：朝上→前面，朝右→左手边，朝下→后面，朝左→右手边。
     星在东 (1,2)：朝上→右手边，朝右→前面，朝下→左手边，朝左→后面。
     星在南 (2,1)：朝上→后面，朝右→右手边，朝下→前面，朝左→左手边。
     星在西 (1,0)：朝上→左手边，朝右→后面，朝下→右手边，朝左→前面。
     对角线如西北 (0,0)：朝上→左前方，朝右→左后方，朝下→右后方，朝左→右前方。
   分与合：5 的分法是 1+4、2+3、3+2、4+1（每部分 ≥1，共 4 种）；4 的分法是 1+3、2+2、3+1；
     3 的分法是 1+2、2+1。两盘之和恒等于总数（搬一块过去，一盘 +1、另一盘 −1）。
     第几个 vs 几个：第 3 个是 1 个人（排第 3 位）；拿 3 个是 3 个人（前 3 位）。
   加减法：2+2=4；5−2=3；3+0=3；3−0=3；5−5=0；0+0=0。减法 B ≤ A（B 想超过 A 时显示“不够减”）。
   注意：无评分、无浏览器存储、无 markTried、无 history；只读写本组自己的元素。 */

/* ---------- 1.1 数数、一一对应、比多少（配对法） ---------- */
let countA = 5, countB = 7;
let countCountedA = [false, false, false, false, false, false, false, false, false, false];
let countCountedB = [false, false, false, false, false, false, false, false, false, false];
let countPaired = false;
let countDotsA = [], countDotsB = [];
let countZeroA = null, countZeroB = null;

function countBuildRow(rowEl, dots, which) {
  for (let i = 0; i < 10; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'count-dot';
    b.textContent = String(i + 1);
    b.setAttribute('aria-label', (which === 'A' ? '上面第 ' : '下面第 ') + (i + 1) + ' 个圆点');
    b.addEventListener('click', () => countDotClick(which, i));
    rowEl.appendChild(b);
    dots.push(b);
  }
  const z = document.createElement('span');
  z.className = 'count-zero';
  z.textContent = '0 个';
  rowEl.appendChild(z);
  return z;
}
countZeroA = countBuildRow(document.getElementById('countRowA'), countDotsA, 'A');
countZeroB = countBuildRow(document.getElementById('countRowB'), countDotsB, 'B');

function countDotClick(which, i) {
  const n = which === 'A' ? countA : countB;
  if (i >= n) return;
  if (which === 'A') countCountedA[i] = !countCountedA[i];
  else countCountedB[i] = !countCountedB[i];
  countRender();
  markTried('count');
  const counted = which === 'A'
    ? countCountedA.filter(Boolean).length
    : countCountedB.filter(Boolean).length;
  document.getElementById('countCount').textContent = counted === 0
    ? '还没数。再点一个圆点，数一数。'
    : (which === 'A' ? '上面数到了第 ' + counted + ' 个。' : '下面数到了第 ' + counted + ' 个。');
}

function countCompareText() {
  const el = document.getElementById('countResult');
  if (countA === countB) {
    el.textContent = '上面 ' + countA + ' 个，下面 ' + countB + ' 个，一样多。';
  } else if (countA > countB) {
    el.textContent = '上面 ' + countA + ' 个，下面 ' + countB + ' 个，上面多 ' + (countA - countB) + ' 个。';
  } else {
    el.textContent = '上面 ' + countA + ' 个，下面 ' + countB + ' 个，下面多 ' + (countB - countA) + ' 个。';
  }
}

function countRender() {
  document.getElementById('countReadA').textContent = countA + ' 个';
  document.getElementById('countReadB').textContent = countB + ' 个';
  const m = Math.min(countA, countB);
  countDotsA.forEach((d, i) => {
    d.hidden = i >= countA;
    d.classList.toggle('count-counted', countCountedA[i]);
    d.classList.toggle('count-paired', countPaired && i < m);
    d.classList.toggle('count-extra', countPaired && countA > countB && i >= m);
  });
  countDotsB.forEach((d, i) => {
    d.hidden = i >= countB;
    d.classList.toggle('count-counted', countCountedB[i]);
    d.classList.toggle('count-paired', countPaired && i < m);
    d.classList.toggle('count-extra', countPaired && countB > countA && i >= m);
  });
  countZeroA.hidden = countA !== 0;
  countZeroB.hidden = countB !== 0;
  if (countPaired) countCompareText();
}

function countChange(which, d) {
  if (which === 'A') {
    countA = Math.max(0, Math.min(10, countA + d));
    for (let i = countA; i < 10; i++) countCountedA[i] = false;
  } else {
    countB = Math.max(0, Math.min(10, countB + d));
    for (let i = countB; i < 10; i++) countCountedB[i] = false;
  }
  countPaired = false;
  document.getElementById('countResult').textContent = '还没比。点“连一连比多少”看看哪排多。';
  document.getElementById('countCount').textContent = '点一个圆点，数一数。';
  countRender();
}
document.getElementById('countAMinus').addEventListener('click', () => countChange('A', -1));
document.getElementById('countAPlus').addEventListener('click', () => countChange('A', 1));
document.getElementById('countBMinus').addEventListener('click', () => countChange('B', -1));
document.getElementById('countBPlus').addEventListener('click', () => countChange('B', 1));
document.getElementById('countCompare').addEventListener('click', () => {
  countPaired = true;
  countRender();
});
document.getElementById('countReset').addEventListener('click', () => {
  countA = 5; countB = 7; countPaired = false;
  countCountedA = [false, false, false, false, false, false, false, false, false, false];
  countCountedB = [false, false, false, false, false, false, false, false, false, false];
  document.getElementById('countResult').textContent = '还没比。点“连一连比多少”看看哪排多。';
  document.getElementById('countCount').textContent = '点一个圆点，数一数。';
  countRender();
});
countRender();

/* ---------- 1.2 位置（转身法） ---------- */
let posFacing = 0; // 0 上，1 右，2 下，3 左（顺时针）
let posFaceMe = false;
let posStar = null; // { r, c } 或 null
let posCells = [];

const posPersonEl = document.createElement('div');
posPersonEl.className = 'pos-person';
const posHeadEl = document.createElement('div');
posHeadEl.className = 'pos-head';
const posNoseEl = document.createElement('div');
posNoseEl.className = 'pos-nose';
posHeadEl.appendChild(posNoseEl);
const posBodyEl = document.createElement('div');
posBodyEl.className = 'pos-body';
const posHandEl = document.createElement('div');
posHandEl.className = 'pos-hand';
const posHandLabelEl = document.createElement('span');
posHandLabelEl.className = 'pos-hand-label';
posHandLabelEl.textContent = '左';
posHandEl.appendChild(posHandLabelEl);
posPersonEl.appendChild(posHeadEl);
posPersonEl.appendChild(posBodyEl);
posPersonEl.appendChild(posHandEl);

const posStarEl = document.createElement('span');
posStarEl.className = 'pos-star';
posStarEl.textContent = '★';

const posGridEl = document.getElementById('posGrid');
for (let r = 0; r < 3; r++) {
  for (let c = 0; c < 3; c++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pos-cell';
    if (r === 1 && c === 1) {
      b.classList.add('pos-center');
      b.setAttribute('aria-label', '小人站在这里');
      b.appendChild(posPersonEl);
    } else {
      b.setAttribute('aria-label', '第 ' + (r + 1) + ' 行第 ' + (c + 1) + ' 列，点一下放星星');
      b.addEventListener('click', () => posPlaceStar(r, c));
    }
    posGridEl.appendChild(b);
    posCells.push(b);
  }
}

function posRelative(dr, dc) {
  // 朝向的前方向量和右手方向向量（行，列；行 +1 是向下，列 +1 是向右）
  const fwd = [[-1, 0], [0, 1], [1, 0], [0, -1]][posFacing];
  const rgt = [[0, 1], [1, 0], [0, -1], [-1, 0]][posFacing];
  const f = dr * fwd[0] + dc * fwd[1];
  const s = dr * rgt[0] + dc * rgt[1];
  const front = f > 0 ? '前' : (f < 0 ? '后' : '');
  const side = s > 0 ? '右' : (s < 0 ? '左' : '');
  if (front && side) return side + front + '方';
  if (front) return front + '面';
  if (side) return side + '手边';
  return '这里';
}

function posPlaceStar(r, c) {
  posStar = { r, c };
  posRender();
  markTried('position');
}

function posRender() {
  const names = ['上', '右', '下', '左'];
  document.getElementById('posFace').textContent =
    '小人现在面朝' + names[posFacing] + (posFaceMe ? '（面对着你）' : '');
  posPersonEl.style.transform = 'rotate(' + (posFacing * 90) + 'deg)';
  posHandLabelEl.style.transform = 'rotate(' + (-posFacing * 90) + 'deg)';
  document.getElementById('posFaceMe').setAttribute('aria-pressed', String(posFaceMe));
  if (posStar) {
    posCells[posStar.r * 3 + posStar.c].appendChild(posStarEl);
  } else if (posStarEl.parentNode) {
    posStarEl.parentNode.removeChild(posStarEl);
  }
  const read = document.getElementById('posRead');
  if (!posStar) {
    read.textContent = '先点一个格子，放一颗星星。';
    return;
  }
  let t = '星星在小人的' + posRelative(posStar.r - 1, posStar.c - 1) + '。';
  if (posFaceMe) {
    t += '他面对着你，他的左手在你右手这一边——左右反过来了，你看到的左边是他的右边。';
  }
  read.textContent = t;
}
document.getElementById('posTurn').addEventListener('click', () => {
  posFacing = (posFacing + 1) % 4;
  posFaceMe = false;
  posRender();
});
document.getElementById('posFaceMe').addEventListener('click', () => {
  posFaceMe = !posFaceMe;
  if (posFaceMe) posFacing = 2; // 面对着你 = 朝下（朝向屏幕外、朝向看的人）
  posRender();
});
document.getElementById('posReset').addEventListener('click', () => {
  posStar = null;
  posRender();
});
posRender();

/* ---------- 1.3 1–5的认识、分与合（数分合）+ 第几 vs 几个 ---------- */
let splitTotal = 5;
let splitLeft = 2; // 右盘 = splitTotal - splitLeft
let splitPicked = null; // 排队里点中的小孩下标（0–4），或 null
let splitTaken = false; // “拿 3 个”高亮是否开着
let splitBlocksL = [], splitBlocksR = [], splitKids = [];

function splitBuildPlate(el, blocks, side) {
  for (let i = 0; i < 5; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'split-block';
    b.setAttribute('aria-label', '一块积木，点一下搬到另一个盘子');
    b.addEventListener('click', () => splitMove(side));
    el.appendChild(b);
    blocks.push(b);
  }
}
splitBuildPlate(document.getElementById('splitPlateL'), splitBlocksL, 'L');
splitBuildPlate(document.getElementById('splitPlateR'), splitBlocksR, 'R');

const splitKidsEl = document.getElementById('splitKids');
for (let i = 0; i < 5; i++) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'split-kid';
  b.textContent = String(i + 1);
  b.setAttribute('aria-label', '排队的小朋友，第 ' + (i + 1) + ' 个');
  b.addEventListener('click', () => splitPick(i));
  splitKidsEl.appendChild(b);
  splitKids.push(b);
}

function splitMove(side) {
  if (side === 'L' && splitLeft > 0) splitLeft--;
  else if (side === 'R' && splitLeft < splitTotal) splitLeft++;
  splitRender();
  markTried('split');
}

function splitPick(i) {
  splitPicked = i;
  splitTaken = false;
  document.getElementById('splitOrdinal').textContent =
    '你点的是第 ' + (i + 1) + ' 个小朋友——只有 1 个人。';
  document.getElementById('splitTake').textContent =
    '“拿 3 个”是拿走 3 个小朋友，和“第 3 个”不是一回事。';
  splitRender();
}

function splitSetTotal(t) {
  splitTotal = t;
  splitLeft = Math.floor(t / 2); // 3→1+2，4→2+2，5→2+3
  document.querySelectorAll('#splitTotalSeg [data-split-total]').forEach(b =>
    b.setAttribute('aria-pressed', String(Number(b.dataset.splitTotal) === t)));
  splitRender();
}

function splitRender() {
  const right = splitTotal - splitLeft;
  document.getElementById('splitLabelL').textContent = '左盘 · ' + splitLeft + ' 个';
  document.getElementById('splitLabelR').textContent = '右盘 · ' + right + ' 个';
  splitBlocksL.forEach((b, i) => { b.hidden = i >= splitLeft; });
  splitBlocksR.forEach((b, i) => { b.hidden = i >= right; });
  document.getElementById('splitEq').textContent = splitLeft + ' + ' + right + ' = ' + splitTotal;
  const list = document.getElementById('splitList');
  list.innerHTML = '';
  for (let a = 1; a < splitTotal; a++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'split-opt' + (a === splitLeft ? ' split-cur' : '');
    b.textContent = a + '和' + (splitTotal - a);
    b.setAttribute('aria-pressed', String(a === splitLeft));
    b.addEventListener('click', () => { splitLeft = a; splitRender(); });
    list.appendChild(b);
  }
  splitKids.forEach((k, i) => {
    k.classList.toggle('split-picked', splitPicked === i);
    k.classList.toggle('split-taken', splitTaken && i < 3);
  });
}
document.querySelectorAll('#splitTotalSeg [data-split-total]').forEach(b =>
  b.addEventListener('click', () => splitSetTotal(Number(b.dataset.splitTotal))));
document.getElementById('splitTake3').addEventListener('click', () => {
  splitTaken = true;
  document.getElementById('splitTake').textContent =
    '拿了 3 个小朋友：是第 1、第 2、第 3 个，一共 3 个人。“第 3 个”是 1 个人，“3 个”是 3 个人，不一样！';
  splitRender();
});
document.getElementById('splitReset').addEventListener('click', () => {
  splitLeft = Math.floor(splitTotal / 2);
  splitPicked = null;
  splitTaken = false;
  document.getElementById('splitOrdinal').textContent = '点一个小朋友，看看他是第几个。';
  document.getElementById('splitTake').textContent = '“拿 3 个”是拿走 3 个小朋友，和“第 3 个”不是一回事。';
  splitRender();
});
splitRender();

/* ---------- 1.4 5以内加减法、0（合盘与拿走） ---------- */
let addsubA = 2, addsubB = 2, addsubMode = 'add';
let addsubNote = '';
let addsubDotsA = [], addsubDotsB = [];

function addsubBuildPlate(el, dots) {
  for (let i = 0; i < 5; i++) {
    const s = document.createElement('span');
    s.className = 'addsub-dot';
    s.textContent = String(i + 1);
    el.appendChild(s);
    dots.push(s);
  }
  const e = document.createElement('span');
  e.className = 'addsub-empty';
  e.textContent = '空盘子是 0';
  el.appendChild(e);
  return e;
}
const addsubEmptyA = addsubBuildPlate(document.getElementById('addsubPlateA'), addsubDotsA);
const addsubEmptyB = addsubBuildPlate(document.getElementById('addsubPlateB'), addsubDotsB);

function addsubRender() {
  document.getElementById('addsubLabelA').textContent =
    'A 盘 · ' + addsubA + ' 个' + (addsubA === 0 ? ' · 空盘子是 0' : '');
  document.getElementById('addsubLabelB').textContent =
    'B 盘 · ' + addsubB + ' 个' + (addsubB === 0 ? ' · 空盘子是 0' : '');
  addsubDotsA.forEach((s, i) => { s.hidden = i >= addsubA; });
  addsubDotsB.forEach((s, i) => { s.hidden = i >= addsubB; });
  addsubEmptyA.hidden = addsubA !== 0;
  addsubEmptyB.hidden = addsubB !== 0;
  document.querySelectorAll('#addsubModeSeg [data-addsub-mode]').forEach(b =>
    b.setAttribute('aria-pressed', String(b.dataset.addsubMode === addsubMode)));
  const hint = document.getElementById('addsubHint');
  if (addsubMode === 'add') {
    document.getElementById('addsubEq').textContent = addsubA + ' + ' + addsubB + ' = ' + (addsubA + addsubB);
    hint.textContent = addsubNote || ('两盘并成一盘，一共 ' + (addsubA + addsubB) + ' 块。'
      + (addsubB === 0 ? 'B 是空盘子，是 0：' + addsubA + ' + 0 = ' + addsubA + '，一点没变。' : '')
      + (addsubA === 0 && addsubB !== 0 ? 'A 是空盘子，是 0：0 + ' + addsubB + ' = ' + addsubB + '。' : ''));
  } else {
    document.getElementById('addsubEq').textContent = addsubA + ' − ' + addsubB + ' = ' + (addsubA - addsubB);
    hint.textContent = addsubNote || ('从 A 盘拿走 ' + addsubB + ' 块，还剩 ' + (addsubA - addsubB) + ' 块。'
      + (addsubB === 0 ? 'B 是 0，什么都没拿走：' + addsubA + ' − 0 = ' + addsubA + '，一点没变。' : ''));
  }
  addsubNote = '';
}

function addsubChange(which, d) {
  if (which === 'A') {
    const next = Math.max(0, Math.min(5, addsubA + d));
    if (next === addsubA) {
      addsubNote = addsubA === 0 ? 'A 盘已经是空盘子了，是 0。' : 'A 盘最多放 5 块。';
    } else {
      addsubA = next;
      if (addsubMode === 'sub' && addsubB > addsubA) {
        addsubB = addsubA;
        addsubNote = 'A 变小了，B 也跟着变小，不然不够减。';
      }
    }
  } else {
    if (addsubMode === 'sub' && d > 0 && addsubB + 1 > addsubA) {
      addsubNote = '不够减：B 不能比 A 多。先把 A 加大，或者把 B 变小。';
    } else {
      const next = Math.max(0, Math.min(5, addsubB + d));
      if (next === addsubB) {
        addsubNote = addsubB === 0 ? 'B 盘已经是空盘子了，是 0。' : 'B 盘最多放 5 块。';
      } else {
        addsubB = next;
      }
    }
  }
  addsubRender();
  markTried('addsub');
}

function addsubSetMode(m) {
  addsubMode = m;
  if (m === 'sub' && addsubB > addsubA) {
    addsubB = addsubA;
    addsubNote = '切到减法：B 不能比 A 多，B 跟着变小了。';
  }
  addsubRender();
}
document.querySelectorAll('#addsubModeSeg [data-addsub-mode]').forEach(b =>
  b.addEventListener('click', () => addsubSetMode(b.dataset.addsubMode)));
document.getElementById('addsubAMinus').addEventListener('click', () => addsubChange('A', -1));
document.getElementById('addsubAPlus').addEventListener('click', () => addsubChange('A', 1));
document.getElementById('addsubBMinus').addEventListener('click', () => addsubChange('B', -1));
document.getElementById('addsubBPlus').addEventListener('click', () => addsubChange('B', 1));
document.getElementById('addsubReset').addEventListener('click', () => {
  addsubA = 2; addsubB = 2; addsubMode = 'add'; addsubNote = '';
  addsubRender();
});
addsubRender();

/* group-b.js — 1 年级形状/分类演示（1.5 立体图形、1.10 平面图形·七巧板、1.12 分类与整理）
   只操作本组元素（id 前缀 solid- / tang- / sort-），不做浏览器存储、不调进度记录、不碰页面历史。
   交互子元素用 document.createElement / createElementNS + appendChild 生成，读数用 textContent，
   静态按钮在加载时用 getElementById(...).addEventListener 绑定，每个演示加载时各调一次初始渲染。
   已验算的数字（逐条手算，来源：content/grades/grade-1.js 的 1.5 / 1.10 / 1.12）：
   - 1.5：长方体 6 个面（上下、左右、前后各 1 对）；正方体 6 个面；
     大正方体长、宽、高都要 2 个小正方体，2×2×2=8 个；4 个小正方体拼不成大正方体；
     一层 4 个、放满 2 层也是 2×4=8 个。
   - 1.10：七巧板 7 块 = 2 个大三角形 + 1 个中三角形 + 2 个小三角形 + 1 个正方形 + 1 个平行四边形；
     三角形一共 2+1+2=5 个，最大的 2 个；三角形 3 条边、3 个角；
     正方形 4 条边一样长、4 个角都是直角；
     两块小三角形：斜边对斜边拼成正方形，直角边对直角边拼成大三角形。
   - 1.12：10 件物品 = 4 个红● + 2 个蓝● + 2 个红▲ + 2 个蓝■，4+2+2+2=10；
     按颜色：红 6 个、蓝 4 个，6+4=10；按形状：● 6 个、▲ 2 个、■ 2 个，6+2+2=10。 */

/* ================= 演示 1：立体图形（1.5） ================= */
const SOLID_SHAPES = [
  { key: 'ball', name: '球', canRoll: true, canStack: false,
    roll: '球滚起来了！它没有平平的面，到处都能滚。',
    stack: '球叠不起来，一放就滚走了。' },
  { key: 'cylinder', name: '圆柱', canRoll: true, canStack: true,
    roll: '圆柱躺着能滚，骨碌碌滚走了。',
    stack: '圆柱立着能叠，它上下有两个平平的面。' },
  { key: 'cuboid', name: '长方体', canRoll: false, canStack: true,
    roll: '长方体滚不动，它有平平的面，会卡住。',
    stack: '长方体有 6 个平平的面，能叠起来。' },
  { key: 'cube', name: '正方体', canRoll: false, canStack: true,
    roll: '正方体滚不动，6 个面都是平平的。',
    stack: '正方体有 6 个平平的面，能叠得很高。' }
];
let solidSelected = null;
let solidCubeCount = 0;
const solidCardBtns = {};

function solidSvgEl(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
  return el;
}

function solidBuildShapeSvg(key) {
  const svg = solidSvgEl('svg', { viewBox: '0 0 80 80', width: '72', height: '72' });
  svg.setAttribute('aria-hidden', 'true');
  if (key === 'ball') {
    svg.appendChild(solidSvgEl('circle', { cx: '40', cy: '42', r: '30', fill: '#ff8a3d', stroke: '#c2410c', 'stroke-width': '2' }));
    svg.appendChild(solidSvgEl('ellipse', { cx: '30', cy: '30', rx: '10', ry: '6', fill: '#ffffff', opacity: '0.75' }));
  } else if (key === 'cylinder') {
    svg.appendChild(solidSvgEl('ellipse', { cx: '40', cy: '16', rx: '26', ry: '9', fill: '#dbeafe', stroke: '#2563eb', 'stroke-width': '2' }));
    svg.appendChild(solidSvgEl('rect', { x: '14', y: '16', width: '52', height: '46', fill: '#93c5fd', stroke: '#2563eb', 'stroke-width': '2' }));
    svg.appendChild(solidSvgEl('ellipse', { cx: '40', cy: '62', rx: '26', ry: '9', fill: '#dbeafe', stroke: '#2563eb', 'stroke-width': '2' }));
  } else if (key === 'cuboid') {
    svg.appendChild(solidSvgEl('polygon', { points: '14,32 28,16 64,16 50,32', fill: '#dcfce7', stroke: '#15803d', 'stroke-width': '2' }));
    svg.appendChild(solidSvgEl('polygon', { points: '50,32 64,16 64,50 50,66', fill: '#86efac', stroke: '#15803d', 'stroke-width': '2' }));
    svg.appendChild(solidSvgEl('polygon', { points: '14,32 50,32 50,66 14,66', fill: '#bbf7d0', stroke: '#15803d', 'stroke-width': '2' }));
  } else {
    svg.appendChild(solidSvgEl('polygon', { points: '20,34 32,20 66,20 54,34', fill: '#fff7ed', stroke: '#c2410c', 'stroke-width': '2' }));
    svg.appendChild(solidSvgEl('polygon', { points: '54,34 66,20 66,54 54,68', fill: '#fde68a', stroke: '#c2410c', 'stroke-width': '2' }));
    svg.appendChild(solidSvgEl('polygon', { points: '20,34 54,34 54,68 20,68', fill: '#fef3c7', stroke: '#c2410c', 'stroke-width': '2' }));
  }
  return svg;
}

function solidBuildCards() {
  const box = document.getElementById('solidCards');
  SOLID_SHAPES.forEach(function (s) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'solid-card';
    b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', s.name);
    const pic = document.createElement('span');
    pic.className = 'solid-shape';
    pic.appendChild(solidBuildShapeSvg(s.key));
    const name = document.createElement('span');
    name.className = 'solid-name';
    name.textContent = s.name;
    b.appendChild(pic);
    b.appendChild(name);
    b.addEventListener('click', function () {
      solidSelected = s.key;
      solidRender();
      markTried('solids');
    });
    box.appendChild(b);
    solidCardBtns[s.key] = b;
  });
}

function solidRender() {
  SOLID_SHAPES.forEach(function (s) {
    const b = solidCardBtns[s.key];
    const on = solidSelected === s.key;
    b.classList.toggle('solid-selected', on);
    b.setAttribute('aria-pressed', String(on));
  });
  const out = document.getElementById('solidResult');
  if (!solidSelected) {
    out.textContent = '先点一个图形';
    return;
  }
  const s = SOLID_SHAPES.find(function (x) { return x.key === solidSelected; });
  out.textContent = s.name + '：点“滚一滚”或“叠一叠”，试试它会怎么样。';
}

function solidAnimate(kind) {
  if (!solidSelected) {
    document.getElementById('solidResult').textContent = '先点一个图形，再按“滚一滚”或“叠一叠”。';
    return;
  }
  const s = SOLID_SHAPES.find(function (x) { return x.key === solidSelected; });
  const pic = solidCardBtns[s.key].querySelector('.solid-shape');
  let cls = '';
  let text = '';
  if (kind === 'roll') {
    text = s.roll;
    cls = s.canRoll ? 'solid-anim-roll' : 'solid-anim-shake';
  } else {
    text = s.stack;
    cls = s.canStack ? 'solid-anim-stack' : 'solid-anim-roll';
  }
  document.getElementById('solidResult').textContent = s.name + '：' + text;
  pic.classList.remove('solid-anim-roll', 'solid-anim-stack', 'solid-anim-shake');
  void pic.offsetWidth;
  pic.classList.add(cls);
  window.setTimeout(function () { pic.classList.remove(cls); }, 900);
}

function solidCubeRender() {
  document.getElementById('solidCubeCount').textContent = '已经拼了 ' + solidCubeCount + ' 个小正方体';
  const msg = document.getElementById('solidCubeMsg');
  const row = document.getElementById('solidCubeRow');
  row.classList.toggle('solid-cube-done', solidCubeCount === 8);
  document.getElementById('solidCubeAdd').disabled = solidCubeCount >= 8;
  if (solidCubeCount === 8) {
    msg.textContent = '拼成大正方体了！2×2×2=8个';
  } else if (solidCubeCount === 4) {
    msg.textContent = '4 个还拼不成大正方体：大正方体长、宽、高都要 2 个，一共要 8 个。';
  } else if (solidCubeCount > 0) {
    msg.textContent = '再加 ' + (8 - solidCubeCount) + ' 个就拼成大正方体了。';
  } else {
    msg.textContent = '';
  }
}

function solidCubeReset() {
  solidCubeCount = 0;
  const row = document.getElementById('solidCubeRow');
  while (row.firstChild) { row.removeChild(row.firstChild); }
  solidCubeRender();
}

document.getElementById('solidRollBtn').addEventListener('click', function () { solidAnimate('roll'); });
document.getElementById('solidStackBtn').addEventListener('click', function () { solidAnimate('stack'); });
document.getElementById('solidCubeAdd').addEventListener('click', function () {
  if (solidCubeCount >= 8) { return; }
  solidCubeCount++;
  const c = document.createElement('div');
  c.className = 'solid-mini-cube';
  c.textContent = String(solidCubeCount);
  document.getElementById('solidCubeRow').appendChild(c);
  solidCubeRender();
});
document.getElementById('solidCubeReset').addEventListener('click', solidCubeReset);
solidBuildCards();
solidRender();
solidCubeRender();

/* ================= 演示 2：七巧板（1.10） ================= */
/* 7 块板的坐标拼成一个 200×200 的正方形（已验算：面积 10000+10000+5000+2500+2500+5000+5000=40000）。 */
const TANG_PIECES = [
  { key: 'big1', name: '大三角形', kind: 'triangle', points: [[0, 0], [200, 0], [100, 100]], fill: '#ff8a3d' },
  { key: 'big2', name: '大三角形', kind: 'triangle', points: [[0, 0], [0, 200], [100, 100]], fill: '#fbbf24' },
  { key: 'mid', name: '中三角形', kind: 'triangle', points: [[200, 0], [200, 100], [100, 100]], fill: '#93c5fd' },
  { key: 'small1', name: '小三角形', kind: 'triangle', points: [[200, 100], [200, 200], [150, 150]], fill: '#86efac' },
  { key: 'small2', name: '小三角形', kind: 'triangle', points: [[150, 150], [200, 200], [100, 200]], fill: '#fda4af' },
  { key: 'square', name: '正方形', kind: 'square', points: [[100, 100], [150, 150], [100, 200], [50, 150]], fill: '#c4b5fd' },
  { key: 'para', name: '平行四边形', kind: 'para', points: [[0, 200], [50, 150], [150, 150], [100, 200]], fill: '#67e8f9' }
];
let tangSelected = null;
const tangAngles = {};
const tangPolys = {};
const tangCenters = {};

function tangBuildPieces() {
  const svg = document.getElementById('tangSvg');
  TANG_PIECES.forEach(function (p) {
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', p.points.map(function (pt) { return pt[0] + ',' + pt[1]; }).join(' '));
    poly.setAttribute('fill', p.fill);
    poly.setAttribute('stroke', '#1e293b');
    poly.setAttribute('stroke-width', '2');
    poly.setAttribute('class', 'tang-piece');
    poly.setAttribute('role', 'button');
    poly.setAttribute('tabindex', '0');
    poly.setAttribute('aria-label', p.name + '，点一下转 45 度');
    const cx = p.points.reduce(function (a, pt) { return a + pt[0]; }, 0) / p.points.length;
    const cy = p.points.reduce(function (a, pt) { return a + pt[1]; }, 0) / p.points.length;
    tangCenters[p.key] = { x: cx, y: cy };
    tangAngles[p.key] = 0;
    poly.addEventListener('click', function () {
      tangAngles[p.key] = (tangAngles[p.key] + 45) % 360;
      tangSelected = p.key;
      tangRender();
      markTried('tangram');
    });
    poly.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tangAngles[p.key] = (tangAngles[p.key] + 45) % 360;
        tangSelected = p.key;
        tangRender();
      }
    });
    svg.appendChild(poly);
    tangPolys[p.key] = poly;
  });
}

function tangRender() {
  TANG_PIECES.forEach(function (p) {
    const poly = tangPolys[p.key];
    const c = tangCenters[p.key];
    poly.setAttribute('transform', 'rotate(' + tangAngles[p.key] + ' ' + c.x + ' ' + c.y + ')');
    poly.classList.toggle('tang-selected', tangSelected === p.key);
  });
  const out = document.getElementById('tangReadout');
  if (!tangSelected) {
    out.textContent = '点一块板，看看它有几条边、几个角';
    return;
  }
  const p = TANG_PIECES.find(function (x) { return x.key === tangSelected; });
  const deg = tangAngles[p.key];
  if (p.kind === 'triangle') {
    out.textContent = p.name + '：3条边，3个角，是三角形。转了 ' + deg + '°，倒过来还是三角形！';
  } else if (p.kind === 'square') {
    out.textContent = '正方形：4条边一样长，4个角都是直角。转了 ' + deg + '°，边还是一样长！';
  } else {
    out.textContent = '平行四边形：4条边，对边一样长，4个角。转了 ' + deg + '°，还是平行四边形！';
  }
}

/* 两块小三角形拼一拼：直角边长 50 的等腰直角三角形 */
const TANG_PAIR_STATES = {
  apart: {
    a: '10,30 60,30 10,80', b: '100,30 150,30 100,80',
    label: '两块一样的小三角形，分开摆着。试试拼一拼！'
  },
  square: {
    a: '55,55 105,55 55,105', b: '105,105 105,55 55,105',
    label: '拼成正方形了！斜边对斜边，正方形的 4 条边一样长。'
  },
  big: {
    a: '55,105 105,105 55,55', b: '55,105 105,105 55,155',
    label: '拼成大三角形了！直角边对直角边，大三角形还是 3 条边、3 个角。'
  }
};
let tangPairState = 'apart';

function tangPairBuild() {
  const svg = document.getElementById('tangPairSvg');
  const a = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  a.setAttribute('id', 'tangPairA');
  a.setAttribute('fill', '#86efac');
  a.setAttribute('stroke', '#15803d');
  a.setAttribute('stroke-width', '2');
  const b = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  b.setAttribute('id', 'tangPairB');
  b.setAttribute('fill', '#fda4af');
  b.setAttribute('stroke', '#be123c');
  b.setAttribute('stroke-width', '2');
  svg.appendChild(a);
  svg.appendChild(b);
}

function tangPairRender() {
  const st = TANG_PAIR_STATES[tangPairState];
  document.getElementById('tangPairA').setAttribute('points', st.a);
  document.getElementById('tangPairB').setAttribute('points', st.b);
  document.getElementById('tangPairLabel').textContent = st.label;
  const svg = document.getElementById('tangPairSvg');
  svg.classList.remove('tang-pair-pop');
  void svg.offsetWidth;
  svg.classList.add('tang-pair-pop');
}

document.getElementById('tangPairSquareBtn').addEventListener('click', function () {
  tangPairState = 'square';
  tangPairRender();
});
document.getElementById('tangPairBigBtn').addEventListener('click', function () {
  tangPairState = 'big';
  tangPairRender();
});
document.getElementById('tangPairResetBtn').addEventListener('click', function () {
  tangPairState = 'apart';
  tangPairRender();
});
tangBuildPieces();
tangRender();
tangPairBuild();
tangPairRender();

/* ================= 演示 3：分类与整理（1.12） ================= */
/* 10 件物品（已验算 4+2+2+2=10）：4 个红●、2 个蓝●、2 个红▲、2 个蓝■。 */
const SORT_SPEC = [
  { shape: '●', shapeName: '圆形', color: '红', n: 4 },
  { shape: '●', shapeName: '圆形', color: '蓝', n: 2 },
  { shape: '▲', shapeName: '三角形', color: '红', n: 2 },
  { shape: '■', shapeName: '正方形', color: '蓝', n: 2 }
];
const SORT_TOTAL = 10;
let sortRule = 'color';
let sortItems = [];

function sortBuild() {
  sortItems = [];
  const pool = document.getElementById('sortPool');
  while (pool.firstChild) { pool.removeChild(pool.firstChild); }
  ['sortTrayRed', 'sortTrayBlue', 'sortTrayCircle', 'sortTrayTri', 'sortTraySquare'].forEach(function (id) {
    const tray = document.getElementById(id);
    const kids = Array.prototype.slice.call(tray.children);
    kids.forEach(function (k) { if (!k.classList.contains('sort-tray-title')) { tray.removeChild(k); } });
  });
  SORT_SPEC.forEach(function (spec) {
    for (let i = 0; i < spec.n; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'sort-item ' + (spec.color === '红' ? 'sort-red' : 'sort-blue');
      b.textContent = spec.shape;
      b.setAttribute('aria-label', spec.color + '色' + spec.shapeName);
      const item = { shape: spec.shape, shapeName: spec.shapeName, color: spec.color, el: b, placed: false };
      b.addEventListener('click', function () { sortPlace(item); });
      pool.appendChild(b);
      sortItems.push(item);
    }
  });
  document.getElementById('sortMsg').textContent = '点一个小图形，把它送到对应的盘子里。';
  sortRender();
}

function sortTrayIdFor(item) {
  if (sortRule === 'color') { return item.color === '红' ? 'sortTrayRed' : 'sortTrayBlue'; }
  if (item.shape === '●') { return 'sortTrayCircle'; }
  if (item.shape === '▲') { return 'sortTrayTri'; }
  return 'sortTraySquare';
}

function sortPlace(item) {
  if (item.placed) { return; }
  item.placed = true;
  document.getElementById(sortTrayIdFor(item)).appendChild(item.el);
  sortRender();
  markTried('sort');
}

function sortCounts() {
  const c = { red: 0, blue: 0, circle: 0, tri: 0, square: 0, placed: 0 };
  sortItems.forEach(function (it) {
    if (!it.placed) { return; }
    c.placed++;
    if (it.color === '红') { c.red++; } else { c.blue++; }
    if (it.shape === '●') { c.circle++; }
    else if (it.shape === '▲') { c.tri++; }
    else { c.square++; }
  });
  return c;
}

function sortRender() {
  const c = sortCounts();
  document.getElementById('sortCountRed').textContent = String(c.red);
  document.getElementById('sortCountBlue').textContent = String(c.blue);
  document.getElementById('sortCountCircle').textContent = String(c.circle);
  document.getElementById('sortCountTri').textContent = String(c.tri);
  document.getElementById('sortCountSquare').textContent = String(c.square);
  document.getElementById('sortTotal').textContent =
    '已经分了 ' + c.placed + ' 个 · 还剩 ' + (SORT_TOTAL - c.placed) + ' 个 · 一共 10 个';
  document.getElementById('sortTraysColor').hidden = sortRule !== 'color';
  document.getElementById('sortTraysShape').hidden = sortRule !== 'shape';
  document.querySelectorAll('#sortRuleSeg [data-sort-rule]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(b.dataset.sortRule === sortRule));
  });
}

function sortCheck() {
  const c = sortCounts();
  const left = SORT_TOTAL - c.placed;
  const msg = document.getElementById('sortMsg');
  if (left === 0) {
    if (sortRule === 'color') {
      msg.textContent = '红 6 个 + 蓝 4 个 = 10 ✓，都分好了！';
    } else {
      msg.textContent = '● 6 个 + ▲ 2 个 + ■ 2 个 = 10 ✓，都分好了！';
    }
    return;
  }
  let sumText;
  if (sortRule === 'color') {
    sumText = '红 ' + c.red + ' 个 + 蓝 ' + c.blue + ' 个';
  } else {
    sumText = '● ' + c.circle + ' 个 + ▲ ' + c.tri + ' 个 + ■ ' + c.square + ' 个';
  }
  msg.textContent = '还剩 ' + left + ' 个没分。' + sumText + ' = ' + c.placed +
    '，不等于 10，少了 ' + left + ' 个！';
}

document.querySelectorAll('#sortRuleSeg [data-sort-rule]').forEach(function (b) {
  b.addEventListener('click', function () {
    sortRule = b.dataset.sortRule;
    sortBuild();
  });
});
document.getElementById('sortCheckBtn').addEventListener('click', sortCheck);
document.getElementById('sortResetBtn').addEventListener('click', sortBuild);
sortBuild();

/* Group C — Grade 1 place-value demos (points 1.7, 1.13, 1.15).
   No scoring, no browser storage, no markTried. Readouts via textContent;
   interactive children built with document.createElement + appendChild.
   Static buttons bound at load with getElementById(...).addEventListener.

   VERIFIED NUMBERS (checked by hand against grade-1.js):
   - demo-bundle (1.7): 13 = 1个十 + 3个一 = 10 + 3; 10 + 6 = 16; 10 + 9 = 19.
     Default 13 = 1 bundle + 3 loose sticks. 20 = 2 bundles + 0 loose.
   - demo-hundred (1.13): 46 > 38 because 4个十 > 3个十; 52 > 25 because
     5个十 > 2个十; the only 整十数 between 45 and 60 is 50.
     46 = 4个十和6个一; 38 = 3个十和8个一; 100 = 10个十和0个一.
   - demo-place (1.15): 23 + 5 = 28 (3 + 5 = 8, tens stay 2);
     35 + 20 = 55 (3个十 + 2个十 = 5个十, ones stay 5);
     47 + 8 = 55 (7 + 8 = 15, 写5进1, tens 4 + 1 = 5);
     36 − 8 = 28 (6 < 8, 借1个十: 6 -> 16, 16 − 8 = 8, tens 3 − 1 = 2). */

/* ---------- demo-bundle (1.7: 11–20, 捆小棒) ---------- */
let bundleBundles = 1; // 捆好的 1捆 = 10根
let bundleLoose = 3;   // 散的根数; default 13 = 1捆 + 3根
const BUNDLE_MAX = 20;

function bundleTotal() { return bundleBundles * 10 + bundleLoose; }

function bundleMakeBundle() {
  const bundle = document.createElement('div');
  bundle.className = 'bundle-bundle';
  for (let i = 0; i < 10; i++) {
    const mini = document.createElement('span');
    mini.className = 'bundle-mini';
    bundle.appendChild(mini);
  }
  const lab = document.createElement('span');
  lab.className = 'bundle-bundle-label';
  lab.textContent = '1捆';
  bundle.appendChild(lab);
  return bundle;
}

function bundleRender() {
  const bundlesEl = document.getElementById('bundleBundles');
  bundlesEl.innerHTML = '';
  for (let b = 0; b < bundleBundles; b++) bundlesEl.appendChild(bundleMakeBundle());
  if (bundleBundles === 0) {
    const none = document.createElement('span');
    none.className = 'bundle-empty';
    none.textContent = '还没有捆';
    bundlesEl.appendChild(none);
  }
  const looseEl = document.getElementById('bundleLoose');
  looseEl.innerHTML = '';
  for (let i = 0; i < bundleLoose; i++) {
    const s = document.createElement('span');
    s.className = 'bundle-stick';
    looseEl.appendChild(s);
  }
  if (bundleLoose === 0) {
    const none = document.createElement('span');
    none.className = 'bundle-empty';
    none.textContent = '没有散的';
    looseEl.appendChild(none);
  }
  const total = bundleTotal();
  const tens = Math.floor(total / 10);
  const ones = total % 10;
  document.getElementById('bundleReadout').textContent = tens + '个十和' + ones + '个一 = ' + total;
  document.getElementById('bundleEq').textContent = (tens * 10) + ' + ' + ones + ' = ' + total;
  document.getElementById('bundleCount').textContent = '一共 ' + total + ' 根小棒';
  document.getElementById('bundleTens').textContent = String(tens);
  document.getElementById('bundleOnes').textContent = String(ones);
}

function bundleNoteSet(t) { document.getElementById('bundleNote').textContent = t; }

function bundleAddOne() {
  if (bundleTotal() >= BUNDLE_MAX) { bundleNoteSet('已经是20根了，不能再加了。'); return; }
  bundleLoose++;
  let bundled = false;
  while (bundleLoose >= 10) { bundleLoose -= 10; bundleBundles++; bundled = true; }
  bundleRender();
  bundleNoteSet(bundled ? '10根捆成1捆！现在一共' + bundleTotal() + '根。' : '加了1根，现在一共' + bundleTotal() + '根。');
  markTried('bundle');
}

function bundleMinusOne() {
  if (bundleTotal() <= 0) { bundleNoteSet('已经是0根了，不能再拿了。'); return; }
  if (bundleLoose > 0) bundleLoose--;
  else { bundleBundles--; bundleLoose = 9; }
  bundleRender();
  bundleNoteSet('拿走1根，现在一共' + bundleTotal() + '根。');
}

function bundleBundleUp() {
  if (bundleLoose >= 10) {
    const n = Math.floor(bundleLoose / 10);
    bundleBundles += n;
    bundleLoose = bundleLoose % 10;
    bundleRender();
    bundleNoteSet('捆好了！' + n + '捆，10根捆成1捆。');
  } else {
    bundleNoteSet('散的还不到10根，捆不了。再加几根吧。');
  }
}

function bundleUnbundle() {
  if (bundleBundles <= 0) { bundleNoteSet('没有捆可以拆。'); return; }
  bundleBundles--;
  bundleLoose += 10;
  bundleRender();
  bundleNoteSet('1捆拆开是10根散小棒。试试再点“捆一捆”。');
}

document.getElementById('bundleAdd').addEventListener('click', bundleAddOne);
document.getElementById('bundleMinus').addEventListener('click', bundleMinusOne);
document.getElementById('bundleBundle').addEventListener('click', bundleBundleUp);
document.getElementById('bundleUnbundle').addEventListener('click', bundleUnbundle);
bundleRender();

/* ---------- demo-hundred (1.13: 100以内数, 百数表 + 捆棒) ---------- */
let hundFirst = 46;   // 默认第一个数: 46 = 4个十和6个一
let hundSecond = 38;  // 默认第二个数: 38 = 3个十和8个一
let hundTensOnly = false;
const hundCells = [];

function hundTens(n) { return Math.floor(n / 10); }
function hundOnes(n) { return n % 10; }

function hundBuildGrid() {
  const grid = document.getElementById('hundGrid');
  for (let n = 1; n <= 100; n++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'hund-cell';
    b.textContent = String(n);
    b.setAttribute('aria-label', '选 ' + n);
    b.addEventListener('click', () => hundPick(n));
    grid.appendChild(b);
    hundCells.push(b);
  }
}

function hundPick(n) {
  if (hundSecond !== null) { hundFirst = n; hundSecond = null; }
  else if (hundFirst === null) { hundFirst = n; }
  else if (n !== hundFirst) { hundSecond = n; }
  hundRender();
  markTried('hundred');
}

function hundRenderBundles(el, n) {
  el.innerHTML = '';
  for (let b = 0; b < hundTens(n); b++) {
    const bundle = document.createElement('div');
    bundle.className = 'hund-bundle';
    for (let i = 0; i < 10; i++) {
      const mini = document.createElement('span');
      mini.className = 'hund-mini';
      bundle.appendChild(mini);
    }
    const lab = document.createElement('span');
    lab.className = 'hund-bundle-label';
    lab.textContent = '1个十';
    bundle.appendChild(lab);
    el.appendChild(bundle);
  }
  for (let i = 0; i < hundOnes(n); i++) {
    const s = document.createElement('span');
    s.className = 'hund-stick';
    el.appendChild(s);
  }
}

function hundCompareText(a, b) {
  if (a === b) return a + '和' + b + '一样大。';
  const big = Math.max(a, b);
  const small = Math.min(a, b);
  if (hundTensOnly && hundTens(a) === hundTens(b)) {
    return '只看十位：两个数都是' + hundTens(a) + '个十，分不出大小。关掉“只看十位”，再比个位吧。';
  }
  if (hundTens(a) !== hundTens(b)) {
    return big + '大，因为' + hundTens(big) + '个十比' + hundTens(small) + '个十多。';
  }
  return big + '大，因为十位都是' + hundTens(a) + '个十，个位' + hundOnes(big) + '比' + hundOnes(small) + '多。';
}

function hundRender() {
  hundCells.forEach((c, i) => {
    const n = i + 1;
    c.className = 'hund-cell' + (n === hundFirst ? ' hund-first' : '') + (n === hundSecond ? ' hund-second' : '');
  });
  document.getElementById('hundFirstLabel').textContent = '第一个数：' + hundFirst;
  document.getElementById('hundFirstReadout').textContent =
    hundFirst + ' = ' + hundTens(hundFirst) + '个十和' + hundOnes(hundFirst) + '个一';
  hundRenderBundles(document.getElementById('hundFirstBundles'), hundFirst);
  if (hundSecond === null) {
    document.getElementById('hundSecondLabel').textContent = '第二个数：还没选';
    document.getElementById('hundSecondReadout').textContent = '再点一个数来比一比。';
    document.getElementById('hundSecondBundles').innerHTML = '';
    document.getElementById('hundCompare').textContent = '再点一个数，就能比一比谁大。';
  } else {
    document.getElementById('hundSecondLabel').textContent = '第二个数：' + hundSecond;
    document.getElementById('hundSecondReadout').textContent =
      hundSecond + ' = ' + hundTens(hundSecond) + '个十和' + hundOnes(hundSecond) + '个一';
    hundRenderBundles(document.getElementById('hundSecondBundles'), hundSecond);
    document.getElementById('hundCompare').textContent = hundCompareText(hundFirst, hundSecond);
  }
  document.getElementById('hundCompareWrap').classList.toggle('hund-tens-only', hundTensOnly);
  const tog = document.getElementById('hundTensToggle');
  tog.setAttribute('aria-pressed', String(hundTensOnly));
  tog.textContent = hundTensOnly ? '只看十位（开）' : '只看十位';
}

document.getElementById('hundTensToggle').addEventListener('click', () => {
  hundTensOnly = !hundTensOnly;
  hundRender();
});
document.getElementById('hundReset').addEventListener('click', () => {
  hundFirst = 46;
  hundSecond = 38;
  hundTensOnly = false;
  hundRender();
});
hundBuildGrid();
hundRender();

/* ---------- demo-place (1.15: 100以内加减法(一), 数位块并排算) ---------- */
const PLACE_PROBLEMS = [
  { a: 23, op: '+', b: 5, label: '23+5' },
  { a: 35, op: '+', b: 20, label: '35+20' },
  { a: 47, op: '+', b: 8, label: '47+8' },
  { a: 36, op: '−', b: 8, label: '36−8' }
];
let placeProb = 0;
let placeTens = 2;
let placeOnes = 3;
let placeDone = false;
let placeCarried = false;
let placeBorrowed = false;
let placeNoteText = '先看第一道数摆好了，再点“加 5”。';

function placeActLabel(p) { return (p.op === '+' ? '加 ' : '减 ') + p.b; }

function placeBuildSeg() {
  const seg = document.getElementById('placeProbSeg');
  PLACE_PROBLEMS.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = p.label;
    b.setAttribute('aria-pressed', String(i === placeProb));
    b.addEventListener('click', () => placeSetProblem(i));
    seg.appendChild(b);
  });
}

function placeSetProblem(i) {
  placeProb = i;
  placeStart();
}

function placeStart() {
  const p = PLACE_PROBLEMS[placeProb];
  placeTens = Math.floor(p.a / 10);
  placeOnes = p.a % 10;
  placeDone = false;
  placeCarried = false;
  placeBorrowed = false;
  placeNoteText = '先看第一道数摆好了，再点“' + placeActLabel(p) + '”。';
  placeRender();
}

function placeApply() {
  if (placeDone) { placeNoteText = '这道题已经算完啦，点“换一道题”重新算。'; placeRender(); return; }
  const p = PLACE_PROBLEMS[placeProb];
  const oldOnes = placeOnes;
  const oldTens = placeTens;
  if (p.op === '+') {
    if (p.b < 10) {
      const sum = oldOnes + p.b;
      if (sum >= 10) {
        placeOnes = sum - 10;
        placeTens += 1;
        placeCarried = true;
        placeNoteText = oldOnes + ' + ' + p.b + ' = ' + sum + '，满10进1个十，个位写' + (sum - 10) + '。';
      } else {
        placeOnes = sum;
        placeNoteText = '个位 ' + oldOnes + ' + ' + p.b + ' = ' + sum + '，十位不变。';
      }
    } else {
      placeTens += p.b / 10;
      placeNoteText = oldTens + '个十加' + (p.b / 10) + '个十是' + placeTens + '个十，个位还是' + placeOnes + '。';
    }
  } else {
    if (oldOnes >= p.b) {
      placeOnes = oldOnes - p.b;
      placeNoteText = '个位 ' + oldOnes + ' − ' + p.b + ' = ' + placeOnes + '，十位不变。';
    } else {
      placeBorrowed = true;
      placeTens -= 1;
      placeOnes = oldOnes + 10 - p.b;
      placeNoteText = '个位不够减，借1个十：' + oldOnes + '变成' + (oldOnes + 10) + '，' + (oldOnes + 10) + ' − ' + p.b + ' = ' + placeOnes + '，十位少了1个十。';
    }
  }
  placeDone = true;
  placeRender();
  markTried('place');
}

function placeRender() {
  const p = PLACE_PROBLEMS[placeProb];
  const seg = document.getElementById('placeProbSeg');
  Array.prototype.forEach.call(seg.children, (b, i) => {
    b.setAttribute('aria-pressed', String(i === placeProb));
  });
  const blocks = document.getElementById('placeBlocks');
  blocks.innerHTML = '';
  for (let t = 0; t < placeTens; t++) {
    const bundle = document.createElement('div');
    bundle.className = 'place-bundle';
    for (let i = 0; i < 10; i++) {
      const mini = document.createElement('span');
      mini.className = 'place-mini';
      bundle.appendChild(mini);
    }
    const lab = document.createElement('span');
    lab.className = 'place-bundle-label';
    lab.textContent = '1个十';
    bundle.appendChild(lab);
    blocks.appendChild(bundle);
  }
  for (let i = 0; i < placeOnes; i++) {
    const s = document.createElement('span');
    s.className = 'place-stick';
    blocks.appendChild(s);
  }
  const value = placeTens * 10 + placeOnes;
  document.getElementById('placeNow').textContent =
    '现在是：' + placeTens + '个十和' + placeOnes + '个一 = ' + value;
  const ans = p.op === '+' ? p.a + p.b : p.a - p.b;
  document.getElementById('placeEq').textContent =
    p.a + ' ' + p.op + ' ' + p.b + ' = ' + (placeDone ? ans : '?');
  const act = document.getElementById('placeAct');
  act.textContent = placeActLabel(p);
  act.disabled = placeDone;
  const line1 = '  ' + p.a;
  const line2 = p.op + ' ' + (p.b < 10 ? ' ' : '') + p.b;
  const line3 = '——';
  const line4 = '  ' + (placeDone ? ans : '?');
  document.getElementById('placeVert').textContent = line1 + '\n' + line2 + '\n' + line3 + '\n' + line4;
  document.getElementById('placeMark').textContent = placeCarried
    ? '进1：个位满10，进了1个十。'
    : (placeBorrowed ? '借1：个位不够减，借了1个十当10个一。' : '');
  document.getElementById('placeNote').textContent = placeNoteText;
}

document.getElementById('placeAct').addEventListener('click', placeApply);
document.getElementById('placeReset').addEventListener('click', placeStart);
placeBuildSeg();
placeSetProblem(0);

/* group-d · 1 年级演示：时钟 / 开小店 / 找规律
   不评分、不记进度：不调用进度记录函数，不用浏览器存储。
   ---- 手算核对过的数字（全部验算通过）----
   时钟：分针 +5 分钟按 12 次 = 60 分钟，时针正好 +1 格；分针转一圈时针 +1 格。
     6 点往前推 3 小时是 3 点（6−3=3，练一练提高题）。7 点半 = 时针 7、分针 30。
     时针角 = 小时×30° + 分钟×0.5°（7 点半是 225°，在 7 和 8 正中间）；分针角 = 分钟×6°。
   开小店：初始钱包 2×10角 + 2×5角 + 10×1角 = 20+10+10 = 40角 = 4元
     （任务稿写的“35角 = 3元5角”算错了，40角才是对的，本文件用 40角）。
     本子 5角 + 橡皮 2角 = 7角；1元买 3角铅笔：10角−3角 = 7角找回。
     1元 = 10角，1角 = 10分；1元5角 = 10角+5角 = 15角；换钱：10个1角 = 1元。
     找零示例：付 1元（10角）买 3角铅笔，找回 10−3 = 7角，以 7 个 1角硬币放回钱包。
   找规律：(a) 红蓝蓝单元长 3，蓝蓝后面是红；(b) ▲●单元长 2，第 7、8、9 个是 ▲、●、▲；
     (c) ○○△单元长 3，第 10 个：10 = 3×3+1，是第 4 组的第 1 个 → ○；
     (d) 数字 1、2、4、7、11，相邻差 +1、+2、+3、+4，下一个 11+5 = 16，
     再往后 16+6 = 22、22+7 = 29。
   注意：数字组只给出 5 个数（1、2、4、7、11），所以它显示 5 个数 + 3 个空，
   第 1 个空的答案是 16（选项 16、15、13）；图形组是 6 个 + 3 个空。 */

  /* ---------- demo-clock · 认识钟表（1.8，方法：联动表针钟） ---------- */
  let clockHour = 7;
  let clockMin = 0;
  let clockTargetIdx = 0;
  const CLOCK_TARGETS = [
    { h: 7, m: 0, label: '7点' },
    { h: 9, m: 0, label: '9点' },
    { h: 3, m: 0, label: '3点' },
    { h: 7, m: 30, label: '7点半' },
    { h: 12, m: 0, label: '12点' }
  ];
  function clockBuildFace() {
    const g = document.getElementById('clockTicks');
    const NS = 'http://www.w3.org/2000/svg';
    for (let i = 0; i < 12; i++) {
      const a = i * 30 * Math.PI / 180;
      const tick = document.createElementNS(NS, 'line');
      tick.setAttribute('x1', String(100 + 84 * Math.sin(a)));
      tick.setAttribute('y1', String(100 - 84 * Math.cos(a)));
      tick.setAttribute('x2', String(100 + 91 * Math.sin(a)));
      tick.setAttribute('y2', String(100 - 91 * Math.cos(a)));
      tick.setAttribute('stroke', '#334155');
      tick.setAttribute('stroke-width', '3');
      tick.setAttribute('stroke-linecap', 'round');
      g.appendChild(tick);
      const num = document.createElementNS(NS, 'text');
      num.setAttribute('x', String(100 + 68 * Math.sin(a)));
      num.setAttribute('y', String(100 - 68 * Math.cos(a) + 6));
      num.setAttribute('text-anchor', 'middle');
      num.setAttribute('font-size', '17');
      num.setAttribute('font-weight', '700');
      num.setAttribute('fill', '#1e293b');
      num.textContent = String(i === 0 ? 12 : i);
      g.appendChild(num);
    }
  }
  function clockTimeText(h, m) {
    if (m === 0) return h + ' 点';
    if (m === 30) return h + ' 点半';
    return h + ' 点 ' + m + ' 分';
  }
  function clockHourStep() {
    clockHour = clockHour % 12 + 1;
  }
  function clockRender() {
    const hourAngle = (clockHour % 12) * 30 + clockMin * 0.5;
    const minAngle = clockMin * 6;
    document.getElementById('clockHourHand').setAttribute('transform', 'rotate(' + hourAngle + ' 100 100)');
    document.getElementById('clockMinHand').setAttribute('transform', 'rotate(' + minAngle + ' 100 100)');
    document.getElementById('clockReadout').textContent = '现在是 ' + clockTimeText(clockHour, clockMin);
    const t = CLOCK_TARGETS[clockTargetIdx];
    document.getElementById('clockTarget').textContent = '目标：拨到 ' + t.label;
    document.getElementById('clockMsg').textContent =
      (clockHour === t.h && clockMin === t.m)
        ? '对了，就是' + t.label + '！'
        : '目标是' + t.label + '，再拨一拨。';
  }
  document.getElementById('clockHourPlus').addEventListener('click', function () { clockHourStep(); clockRender(); markTried('clock'); });
  document.getElementById('clockMinPlus').addEventListener('click', function () {
    clockMin += 5;
    if (clockMin >= 60) { clockMin -= 60; clockHourStep(); }
    clockRender();
  });
  document.getElementById('clockMinFull').addEventListener('click', function () { clockHourStep(); clockRender(); });
  document.getElementById('clockNextTarget').addEventListener('click', function () {
    clockTargetIdx = (clockTargetIdx + 1) % CLOCK_TARGETS.length;
    clockRender();
  });
  clockBuildFace();
  clockRender();

  /* ---------- demo-shop · 开小店（1.14，方法：开小店 + 换钱动画） ---------- */
  const SHOP_ITEMS = [
    { name: '本子', price: 5 },
    { name: '橡皮', price: 2 },
    { name: '铅笔', price: 3 }
  ];
  const SHOP_COINS = [
    { key: 'yuan', label: '1元', value: 10 },
    { key: 'five', label: '5角', value: 5 },
    { key: 'one', label: '1角', value: 1 }
  ];
  const SHOP_INIT = { yuan: 2, five: 2, one: 10 };
  let shopWallet = { yuan: 2, five: 2, one: 10 };
  let shopItemIdx = -1;
  let shopPaid = 0;
  let shopBought = false;
  let shopPaidCoins = { yuan: 0, five: 0, one: 0 };
  function shopTotal() {
    return shopWallet.yuan * 10 + shopWallet.five * 5 + shopWallet.one;
  }
  function shopMoneyText(total) {
    const y = Math.floor(total / 10);
    const j = total % 10;
    return total + '角 = ' + y + '元' + (j ? j + '角' : '');
  }
  function shopRender() {
    const itemsBox = document.getElementById('shopItems');
    itemsBox.innerHTML = '';
    SHOP_ITEMS.forEach(function (it, i) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn small ghost shop-item';
      b.textContent = it.name + ' ' + it.price + '角';
      b.setAttribute('aria-pressed', String(i === shopItemIdx));
      b.addEventListener('click', function () { shopSelect(i); });
      itemsBox.appendChild(b);
    });
    const walletBox = document.getElementById('shopWallet');
    walletBox.innerHTML = '';
    SHOP_COINS.forEach(function (c) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn small ghost shop-coin';
      b.textContent = c.label + ' ×' + shopWallet[c.key];
      b.disabled = shopWallet[c.key] <= 0 || shopItemIdx < 0 || shopBought;
      b.addEventListener('click', function () { shopPay(c.key, c.value); });
      walletBox.appendChild(b);
    });
    document.getElementById('shopWalletTotal').textContent = '钱包一共 ' + shopMoneyText(shopTotal());
    const sel = document.getElementById('shopSelected');
    if (shopBought) sel.textContent = '已经买到' + SHOP_ITEMS[shopItemIdx].name + '了';
    else if (shopItemIdx >= 0) sel.textContent = '要买的：' + SHOP_ITEMS[shopItemIdx].name + ' ' + SHOP_ITEMS[shopItemIdx].price + '角';
    else sel.textContent = '还没选要买的东西，先点一个';
    document.getElementById('shopPaid').textContent = '已付 ' + shopPaid + '角';
  }
  function shopSelect(i) {
    if (shopBought) return;
    shopItemIdx = i;
    document.getElementById('shopMsg').textContent = '要买' + SHOP_ITEMS[i].name + '，一共 ' + SHOP_ITEMS[i].price + '角，点钱包里的钱来付。';
    shopRender();
  }
  function shopPay(key, value) {
    if (shopItemIdx < 0 || shopBought) return;
    if (shopWallet[key] <= 0) return;
    markTried('shop');
    shopWallet[key]--;
    shopPaidCoins[key]++;
    shopPaid += value;
    const price = SHOP_ITEMS[shopItemIdx].price;
    if (shopPaid >= price) {
      const change = shopPaid - price;
      shopWallet.one += change;
      shopBought = true;
      document.getElementById('shopMsg').textContent = change > 0
        ? '买到了！找回 ' + change + '角（已经放回钱包，变成1角硬币了）。'
        : '买到了！不多不少，正好 ' + price + '角。';
    } else {
      document.getElementById('shopMsg').textContent = '已付 ' + shopPaid + '角，还差 ' + (price - shopPaid) + '角。';
    }
    shopRender();
  }
  function shopAgain() {
    shopItemIdx = -1; shopPaid = 0; shopBought = false;
    shopPaidCoins = { yuan: 0, five: 0, one: 0 };
    document.getElementById('shopMsg').textContent = '再选一个想买的东西。';
    shopRender();
  }
  function shopRefund() {
    if (shopPaid <= 0 || shopBought) return;
    shopWallet.yuan += shopPaidCoins.yuan;
    shopWallet.five += shopPaidCoins.five;
    shopWallet.one += shopPaidCoins.one;
    shopPaidCoins = { yuan: 0, five: 0, one: 0 };
    shopPaid = 0;
    document.getElementById('shopMsg').textContent = '钱都退回钱包了。';
    shopRender();
  }
  function shopExchange() {
    const note = document.getElementById('shopNote');
    if (shopWallet.one >= 10) {
      shopWallet.one -= 10;
      shopWallet.yuan += 1;
      note.textContent = '10个1角换1元，换好了！';
    } else {
      note.textContent = '1角还不够10个（现在只有 ' + shopWallet.one + ' 个），换不了。';
    }
    shopRender();
  }
  function shopReset() {
    shopWallet = { yuan: 2, five: 2, one: 10 };
    shopItemIdx = -1; shopPaid = 0; shopBought = false;
    shopPaidCoins = { yuan: 0, five: 0, one: 0 };
    document.getElementById('shopMsg').textContent = '重新开店了，钱包回到一开始的样子。';
    document.getElementById('shopNote').textContent = '10个1角可以换成1张1元。';
    shopRender();
  }
  document.getElementById('shopAgain').addEventListener('click', shopAgain);
  document.getElementById('shopRefund').addEventListener('click', shopRefund);
  document.getElementById('shopExchange').addEventListener('click', shopExchange);
  document.getElementById('shopReset').addEventListener('click', shopReset);
  shopRender();

  /* ---------- demo-pattern · 找规律（1.16，方法：找重复单元） ---------- */
  function patShapeEl(key) {
    const s = document.createElement('span');
    s.className = 'pat-shape pat-' + key;
    s.setAttribute('aria-hidden', 'true');
    return s;
  }
  const PATTERNS = [
    { name: '红蓝蓝', kind: 'shape', unit: ['red', 'blue', 'blue'], unitText: '红蓝蓝',
      answers: ['red', 'blue', 'blue'],
      choices: [{ k: 'red', label: '红色' }, { k: 'blue', label: '蓝色' }],
      wrong: '再想想，单元是红蓝蓝', right: '对了！单元是红蓝蓝，蓝后面又是红。' },
    { name: '三角圆', kind: 'shape', unit: ['tri', 'dot'], unitText: '▲●',
      answers: ['tri', 'dot', 'tri'],
      choices: [{ k: 'tri', label: '三角形' }, { k: 'dot', label: '圆形' }],
      wrong: '再想想，单元是▲●，三角和圆轮流出现', right: '对了！单元是▲●，三角和圆轮流出现。' },
    { name: '圆圆三角', kind: 'shape', unit: ['ring', 'ring', 'tri'], unitText: '○○△',
      answers: ['ring', 'ring', 'tri'],
      choices: [{ k: 'ring', label: '圆圈' }, { k: 'tri', label: '三角形' }],
      wrong: '再想想，单元是○○△', right: '对了！单元是○○△，两个圆圈后面是三角形。' },
    { name: '数字', kind: 'number', terms: [1, 2, 4, 7, 11], answers: [16, 22, 29],
      wrong: '再想想，相邻两个数相差 1、2、3、4，每次多 1',
      right: '对了！每次多 1，11 再加 5 是 16。' }
  ];
  let patIdx = 0;
  let patFilled = [];
  let patShowUnit = false;
  function patShown() {
    const p = PATTERNS[patIdx];
    if (p.kind === 'number') return p.terms.slice();
    const out = [];
    for (let i = 0; i < 6; i++) out.push(p.unit[i % p.unit.length]);
    return out;
  }
  function patChoicesFor(blankIdx) {
    const p = PATTERNS[patIdx];
    if (p.kind === 'number') {
      const a = p.answers[blankIdx];
      return [a, a - 1, a - 3];
    }
    return p.choices;
  }
  function patRender() {
    const p = PATTERNS[patIdx];
    const seg = document.getElementById('patSeg');
    seg.innerHTML = '';
    PATTERNS.forEach(function (pp, i) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = pp.name;
      b.setAttribute('aria-pressed', String(i === patIdx));
      b.addEventListener('click', function () { patSet(i); });
      seg.appendChild(b);
    });
    const seq = document.getElementById('patSeq');
    seq.innerHTML = '';
    patShown().forEach(function (v, i) {
      const cell = document.createElement('div');
      cell.className = 'pat-cell';
      if (patShowUnit && (p.kind === 'number' || i < p.unit.length)) cell.classList.add('pat-in-unit');
      if (p.kind === 'number') cell.textContent = String(v);
      else cell.appendChild(patShapeEl(v));
      seq.appendChild(cell);
    });
    for (let i = 0; i < 3; i++) {
      const cell = document.createElement('div');
      cell.className = 'pat-cell pat-blank';
      if (i < patFilled.length) {
        cell.classList.remove('pat-blank');
        cell.classList.add('pat-filled');
        if (p.kind === 'number') cell.textContent = String(patFilled[i]);
        else cell.appendChild(patShapeEl(patFilled[i]));
      } else {
        cell.textContent = '?';
      }
      seq.appendChild(cell);
    }
    const ch = document.getElementById('patChoices');
    ch.innerHTML = '';
    if (patFilled.length < 3) {
      patChoicesFor(patFilled.length).forEach(function (o) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn small ghost pat-choice';
        if (p.kind === 'number') {
          b.textContent = String(o);
        } else {
          b.appendChild(patShapeEl(o.k));
          const t = document.createElement('span');
          t.textContent = o.label;
          b.appendChild(t);
        }
        b.addEventListener('click', function () { patChoose(o); });
        ch.appendChild(b);
      });
    }
    document.getElementById('patUnitBtn').setAttribute('aria-pressed', String(patShowUnit));
  }
  function patChoose(o) {
    const p = PATTERNS[patIdx];
    markTried('pattern');
    const idx = patFilled.length;
    if (idx >= 3) return;
    const val = p.kind === 'number' ? o : o.k;
    if (val === p.answers[idx]) {
      patFilled.push(val);
      const msg = document.getElementById('patMsg');
      if (patFilled.length === 3) {
        msg.textContent = p.kind === 'number'
          ? '全对了！1、2、4、7、11、16、22、29，每次多 1。'
          : '全对了！单元是' + p.unitText + '，它一遍一遍重复出现。';
      } else {
        msg.textContent = p.right;
      }
    } else {
      document.getElementById('patMsg').textContent = p.wrong + '。';
    }
    patRender();
  }
  function patSet(i) {
    patIdx = i;
    patFilled = [];
    patShowUnit = false;
    document.getElementById('patMsg').textContent = '找一找重复的单元，再选下一个。';
    patRender();
  }
  document.getElementById('patUnitBtn').addEventListener('click', function () {
    patShowUnit = !patShowUnit;
    if (patShowUnit) {
      const p = PATTERNS[patIdx];
      document.getElementById('patMsg').textContent = p.kind === 'number'
        ? '数字没有重复的单元，规律是每次多 1：已经给出的 5 个数都框出来了。'
        : '框出来的是一个单元：' + p.unitText + '，它会一遍一遍重复。';
    }
    patRender();
  });
  document.getElementById('patNextBtn').addEventListener('click', function () {
    patSet((patIdx + 1) % PATTERNS.length);
  });
  patRender();

/* ================= 二年级实验（2.1–2.15，2026-11-06） =================
   Group E — Grade 2 demos. One small tool per point, same patterns as the
   Grade 1 groups: seg buttons built once at init (never rebuilt, so the
   smoke stub's children lists stay stable), readouts in textContent,
   markTried() on the main interaction, no scoring, no login.
   Numbers verified by hand — see the comments on each problem set. */

/* ---------- demo-ruler · 2.1 长度单位、线段（方法：从0量起 + 身体尺） ---------- */
const RUL_OBJS = [
  { name: '铅笔', len: 7 },
  { name: '橡皮', len: 3 },
  { name: '彩带', len: 12 }
];
let rulObjIdx = 0;
let rulFromOne = false;
function rulBuildTicks() {
  const g = document.getElementById('rulTicks');
  const NS = 'http://www.w3.org/2000/svg';
  for (let cm = 0; cm <= 15; cm++) {
    const x = 10 + cm * 20;
    const tick = document.createElementNS(NS, 'line');
    tick.setAttribute('x1', String(x));
    tick.setAttribute('y1', '34');
    tick.setAttribute('x2', String(x));
    tick.setAttribute('y2', cm % 5 === 0 ? '14' : '24');
    tick.setAttribute('stroke', '#334155');
    tick.setAttribute('stroke-width', cm % 5 === 0 ? '3' : '2');
    g.appendChild(tick);
    if (cm % 5 === 0) {
      const num = document.createElementNS(NS, 'text');
      num.setAttribute('x', String(x));
      num.setAttribute('y', '58');
      num.setAttribute('text-anchor', 'middle');
      num.setAttribute('font-size', '13');
      num.setAttribute('fill', '#64748b');
      num.textContent = String(cm);
      g.appendChild(num);
    }
  }
}
function rulBuildMeter() {
  const strip = document.getElementById('rulMeter');
  for (let i = 0; i < 100; i++) {
    const s = document.createElement('span');
    s.className = 'rul-cm';
    strip.appendChild(s);
  }
}
function rulRender() {
  const obj = RUL_OBJS[rulObjIdx];
  const x0 = rulFromOne ? 30 : 10; // 从1量：条子的左端对着刻度1
  const bar = document.getElementById('rulBar');
  bar.setAttribute('x', String(x0));
  bar.setAttribute('width', String(obj.len * 20));
  document.getElementById('rulReadout').textContent = rulFromOne
    ? '尺子上读到 ' + (obj.len + 1) + ' 厘米'
    : '从0量到 ' + obj.len + '，是 ' + obj.len + ' 厘米';
  document.getElementById('rulMsg').textContent = rulFromOne
    ? '从1开始量，读出来是 ' + (obj.len + 1) + '，可是' + obj.name + '只有 ' + obj.len + ' 厘米——从1量会多算1厘米，一定要从0量。'
    : '0对准一端，另一端停在 ' + obj.len + '，就是 ' + obj.len + ' 厘米。';
  document.getElementById('rulFromBtn').textContent = rulFromOne ? '改回从0量' : '试试从1开始量';
  document.querySelectorAll('#rulObjSeg [data-rul-obj]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.rulObj === rulObjIdx));
  });
}
(function rulInit() {
  const seg = document.getElementById('rulObjSeg');
  RUL_OBJS.forEach(function (o, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = o.name + ' ' + o.len + '厘米';
    b.dataset.rulObj = String(i);
    b.addEventListener('click', function () { rulObjIdx = i; markTried('ruler'); rulRender(); });
    seg.appendChild(b);
  });
  document.getElementById('rulFromBtn').addEventListener('click', function () {
    rulFromOne = !rulFromOne;
    markTried('ruler');
    rulRender();
  });
  rulBuildTicks();
  rulBuildMeter();
  rulRender();
})();

/* ---------- demo-estimate · 2.2 先估后算（方法：先估后算） ----------
   48+31=79（估 50+30=80），26+38=64（估 30+40=70）。 */
const EST_PROBS = [
  { a: 48, b: 31, est: 80, exact: 79, near: '48接近50，31接近30' },
  { a: 26, b: 38, est: 70, exact: 64, near: '26接近30，38接近40' }
];
let estProbIdx = 0;
let estGuess = null;
function estRender() {
  const p = EST_PROBS[estProbIdx];
  document.getElementById('estLine').textContent = p.a + ' → ' + (Math.round(p.a / 10) * 10) + '　　' + p.b + ' → ' + (Math.round(p.b / 10) * 10) + '　　大约 ' + p.est;
  document.getElementById('estEq').textContent = p.a + ' + ' + p.b + ' = ?';
  document.querySelectorAll('#estProbSeg [data-est-prob]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.estProb === estProbIdx));
  });
  document.querySelectorAll('#estGuessSeg [data-est-guess]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(estGuess !== null && +b.dataset.estGuess === estGuess));
  });
}
(function estInit() {
  const seg = document.getElementById('estProbSeg');
  EST_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = p.a + ' + ' + p.b;
    b.dataset.estProb = String(i);
    b.addEventListener('click', function () { estProbIdx = i; estGuess = null; document.getElementById('estMsg').textContent = '先估一估：' + p.near + '，大约是多少？'; estRender(); });
    seg.appendChild(b);
  });
  const gseg = document.getElementById('estGuessSeg');
  [60, 70, 80, 90].forEach(function (g) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = '大约 ' + g;
    b.dataset.estGuess = String(g);
    b.addEventListener('click', function () {
      const p = EST_PROBS[estProbIdx];
      estGuess = g;
      markTried('estimate');
      document.getElementById('estMsg').textContent = g === p.est
        ? '对了！' + p.near + '，加起来应该接近 ' + p.est + '。'
        : '离 ' + p.est + ' 有点远——' + p.near + '，再想想。';
      estRender();
    });
    gseg.appendChild(b);
  });
  document.getElementById('estExactBtn').addEventListener('click', function () {
    const p = EST_PROBS[estProbIdx];
    markTried('estimate');
    document.getElementById('estEq').textContent = p.a + ' + ' + p.b + ' = ' + p.exact;
    document.getElementById('estMsg').textContent = estGuess === p.est
      ? '精确答案是 ' + p.exact + '，落在 ' + p.est + ' 附近，估对了！'
      : '精确答案是 ' + p.exact + '，在 ' + p.est + ' 附近——先估一估，算错了马上能抓住。';
  });
  document.getElementById('estMsg').textContent = '先估一估：48接近50，31接近30，大约是多少？';
  estRender();
})();

/* ---------- demo-angle · 2.4 角的初步认识、直角（方法：角是“转了多少”） ----------
   张开 15°–165°，步进 15°；90° 是直角。臂长 60 / 90，角度数不变。 */
let angDeg = 45;
let angLong = false;
function angRender() {
  const len = angLong ? 60 : 90;
  const rad = angDeg * Math.PI / 180;
  const x = 100 + len * Math.cos(rad);
  const y = 140 - len * Math.sin(rad);
  const arm = document.getElementById('angArm');
  arm.setAttribute('x2', String(Math.round(x * 10) / 10));
  arm.setAttribute('y2', String(Math.round(y * 10) / 10));
  const kind = angDeg < 90 ? '比直角小' : (angDeg === 90 ? '是直角' : '比直角大');
  document.getElementById('angReadout').textContent = '张开了 ' + angDeg + '°，' + kind;
  document.getElementById('angMsg').textContent = angDeg === 90
    ? '这就是直角：方方正正的角，像书角、桌角一样。'
    : '臂张开多少，角就是多少；把臂拉长，角一点没变。';
  const mark = document.getElementById('angRightMark');
  if (angDeg === 90) mark.removeAttribute('hidden'); else mark.setAttribute('hidden', '');
  document.getElementById('angLenBtn').textContent = angLong ? '臂变短' : '臂变长';
}
(function angInit() {
  document.getElementById('angOpen').addEventListener('click', function () {
    if (angDeg < 165) angDeg += 15;
    markTried('angle');
    angRender();
  });
  document.getElementById('angClose').addEventListener('click', function () {
    if (angDeg > 15) angDeg -= 15;
    markTried('angle');
    angRender();
  });
  document.getElementById('angLenBtn').addEventListener('click', function () {
    angLong = !angLong;
    markTried('angle');
    angRender();
  });
  angRender();
})();

/* ---------- demo-array · 2.5 乘法初步认识、口诀（方法：阵列点阵） ----------
   行 2–6，列 2–6；口诀：积 <10 用“得”，否则直接读数。3×4=12 三四十二。 */
const ARR_CN = { 2: '二', 3: '三', 4: '四', 5: '五', 6: '六' };
const ARR_SMALL = { 4: '四', 5: '五', 6: '六', 8: '八', 9: '九' };
let arrRows = 3;
let arrCols = 4;
function arrKoujue(r, c) {
  const p = r * c;
  return ARR_CN[r] + ARR_CN[c] + (p < 10 ? '得' + ARR_SMALL[p] : String(p));
}
function arrRender() {
  const grid = document.getElementById('arrGrid');
  for (let i = 0; i < grid.children.length; i++) {
    const r = Math.floor(i / 6);
    const c = i % 6;
    const on = r < arrRows && c < arrCols;
    grid.children[i].classList.toggle('arr-on', on);
    grid.children[i].style.visibility = on ? 'visible' : 'hidden';
  }
  document.getElementById('arrEq').textContent = arrRows + ' × ' + arrCols + ' = ' + (arrRows * arrCols);
  document.getElementById('arrTitle').textContent = '点阵乘法：' + arrRows + ' 行 ' + arrCols + ' 列是 ' + (arrRows * arrCols) + ' 个点';
  document.getElementById('arrKoujue').textContent = '口诀：' + arrKoujue(arrRows, arrCols);
  document.getElementById('arrRowsTx').textContent = arrRows + ' 行';
  document.getElementById('arrColsTx').textContent = arrCols + ' 列';
}
(function arrInit() {
  const grid = document.getElementById('arrGrid');
  for (let i = 0; i < 36; i++) {
    const d = document.createElement('span');
    d.className = 'arr-dot';
    grid.appendChild(d);
  }
  document.getElementById('arrRowsMinus').addEventListener('click', function () { if (arrRows > 2) arrRows--; markTried('array'); arrRender(); });
  document.getElementById('arrRowsPlus').addEventListener('click', function () { if (arrRows < 6) arrRows++; markTried('array'); arrRender(); });
  document.getElementById('arrColsMinus').addEventListener('click', function () { if (arrCols > 2) arrCols--; markTried('array'); arrRender(); });
  document.getElementById('arrColsPlus').addEventListener('click', function () { if (arrCols < 6) arrCols++; markTried('array'); arrRender(); });
  document.getElementById('arrRotate').addEventListener('click', function () {
    const t = arrRows; arrRows = arrCols; arrCols = t;
    markTried('array');
    arrRender();
    // 正方形转一圈还是正方形：行列本来就一样，“互换”没说什么新东西，别写同义反复。
    document.getElementById('arrMsg').textContent = arrRows === arrCols
      ? '转个方向：' + arrRows + ' × ' + arrCols + ' = ' + (arrRows * arrCols) + '，点还是 ' + (arrRows * arrCols) + ' 个——正方形转一圈还是正方形，样子一点没变。'
      : '转个方向：' + arrRows + ' × ' + arrCols + ' = ' + (arrRows * arrCols) + '，点还是 ' + (arrRows * arrCols) + ' 个——所以 ' + arrCols + '×' + arrRows + ' 和 ' + arrRows + '×' + arrCols + ' 是一道题。';
  });
  arrRender();
})();

/* ---------- demo-observe · 2.6 观察物体（方法：拖动旋转3D物体） ----------
   积木堆：底下一排 3 个，中间上面 1 个。前面 4 个正方形，左面 2 个，上面 3 个。
   转 90° 后前面和左面互换。 */
const OBS_VIEWS = {
  front: { cells: [[0, 0], [1, 0], [2, 0], [1, 1]], label: '前面', n: 4 },
  left: { cells: [[0, 0], [0, 1]], label: '左面', n: 2 },
  top: { cells: [[0, 0], [1, 0], [2, 0]], label: '上面', n: 3 }
};
let obsView = 'front';
let obsRotated = false;
function obsRender() {
  const key = obsView === 'top' ? 'top' : (obsRotated ? (obsView === 'front' ? 'left' : 'front') : obsView);
  const v = OBS_VIEWS[key];
  const svg = document.getElementById('obsSvg');
  svg.innerHTML = '';
  const NS = 'http://www.w3.org/2000/svg';
  v.cells.forEach(function (cell) {
    const r = document.createElementNS(NS, 'rect');
    const cols = v.cells.reduce(function (m, c) { return Math.max(m, c[0] + 1); }, 0);
    const x = 110 - cols * 22 + cell[0] * 44;
    const y = 96 - cell[1] * 44 - 40;
    r.setAttribute('x', String(x));
    r.setAttribute('y', String(y));
    r.setAttribute('width', '40');
    r.setAttribute('height', '40');
    r.setAttribute('rx', '6');
    r.setAttribute('fill', '#dbeafe');
    r.setAttribute('stroke', '#2563eb');
    r.setAttribute('stroke-width', '2');
    svg.appendChild(r);
  });
  document.getElementById('obsMsg').textContent = '从' + OBS_VIEWS[obsView].label + '看：看到 ' + v.n + ' 个正方形。' +
    (obsRotated && obsView !== 'top' ? '（积木转了 90°，前面和左面换过来了。）' : '东西本身没有变，变的是你站的位置。');
  document.querySelectorAll('#obsViewSeg [data-obs-view]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(b.dataset.obsView === obsView));
  });
}
(function obsInit() {
  const seg = document.getElementById('obsViewSeg');
  ['front', 'left', 'top'].forEach(function (k) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = OBS_VIEWS[k].label;
    b.dataset.obsView = k;
    b.addEventListener('click', function () { obsView = k; markTried('observe'); obsRender(); });
    seg.appendChild(b);
  });
  document.getElementById('obsRotate').addEventListener('click', function () {
    obsRotated = !obsRotated;
    markTried('observe');
    obsRender();
  });
  obsRender();
})();

/* ---------- demo-time · 2.7 认识时间（方法：联动表针 + 5分跳数） ----------
   目标：7时05分、7时45分、9时40分。分针满 60 分进 1 时。 */
let tmHour = 7;
let tmMin = 0;
let tmTargetIdx = 0;
let tmWrapped = false;
const TM_TARGETS = [
  { h: 7, m: 5, label: '7时05分' },
  { h: 7, m: 45, label: '7时45分' },
  { h: 9, m: 40, label: '9时40分' }
];
function tmTimeText(h, m) {
  return h + '时' + (m < 10 ? '0' + m : String(m)) + '分';
}
function tmBuildFace() {
  const g = document.getElementById('tmTicks');
  const NS = 'http://www.w3.org/2000/svg';
  for (let i = 0; i < 12; i++) {
    const a = i * 30 * Math.PI / 180;
    const tick = document.createElementNS(NS, 'line');
    tick.setAttribute('x1', String(100 + 84 * Math.sin(a)));
    tick.setAttribute('y1', String(100 - 84 * Math.cos(a)));
    tick.setAttribute('x2', String(100 + 91 * Math.sin(a)));
    tick.setAttribute('y2', String(100 - 91 * Math.cos(a)));
    tick.setAttribute('stroke', '#334155');
    tick.setAttribute('stroke-width', '3');
    tick.setAttribute('stroke-linecap', 'round');
    g.appendChild(tick);
    const num = document.createElementNS(NS, 'text');
    num.setAttribute('x', String(100 + 68 * Math.sin(a)));
    num.setAttribute('y', String(100 - 68 * Math.cos(a) + 6));
    num.setAttribute('text-anchor', 'middle');
    num.setAttribute('font-size', '17');
    num.setAttribute('font-weight', '700');
    num.setAttribute('fill', '#1e293b');
    num.textContent = String(i === 0 ? 12 : i);
    g.appendChild(num);
  }
}
function tmHourStep() { tmHour = tmHour % 12 + 1; }
function tmRender() {
  const hourAngle = (tmHour % 12) * 30 + tmMin * 0.5;
  const minAngle = tmMin * 6;
  document.getElementById('tmHourHand').setAttribute('transform', 'rotate(' + hourAngle + ' 100 100)');
  document.getElementById('tmMinHand').setAttribute('transform', 'rotate(' + minAngle + ' 100 100)');
  document.getElementById('tmReadout').textContent = '现在是 ' + tmTimeText(tmHour, tmMin);
  const t = TM_TARGETS[tmTargetIdx];
  document.getElementById('tmTarget').textContent = '目标：拨到 ' + t.label;
  document.getElementById('tmMsg').textContent =
    (tmHour === t.h && tmMin === t.m) ? '对了，就是' + t.label + '！' : '目标是' + t.label + '，再拨一拨。';
  document.getElementById('tmWrap').textContent = tmWrapped
    ? '刚才分针转满了一圈，时针走了一格——1时=60分。' : '';
}
function tmAddMin(n) {
  tmMin += n;
  if (tmMin >= 60) { tmMin -= 60; tmHourStep(); tmWrapped = true; }
  markTried('time');
  tmRender();
}
(function tmInit() {
  document.getElementById('tmMinPlus1').addEventListener('click', function () { tmAddMin(1); });
  document.getElementById('tmMinPlus5').addEventListener('click', function () { tmAddMin(5); });
  document.getElementById('tmHourPlus').addEventListener('click', function () { tmHourStep(); markTried('time'); tmRender(); });
  document.getElementById('tmNextTarget').addEventListener('click', function () {
    tmTargetIdx = (tmTargetIdx + 1) % TM_TARGETS.length;
    tmWrapped = false;
    tmRender();
  });
  tmBuildFace();
  tmRender();
})();

/* ---------- demo-pair · 2.15 搭配（一）（方法：搭配树/连线：定住一种，配另一种） ----------
   3 件上衣 × 2 条裤子 = 6 种穿法，不是 3+2=5。 */
const PAIR_SHIRTS = ['红上衣', '蓝上衣', '绿上衣'];
const PAIR_PANTS = ['黑裤子', '白裤子'];
let pairShirt = 0;
let pairPants = 0;
const pairFound = new Set();
function pairRender() {
  document.getElementById('pairCount').textContent = '已经配出 ' + pairFound.size + ' / 6 种';
  document.getElementById('pairSel').textContent = '现在选的是：' + PAIR_SHIRTS[pairShirt] + ' + ' + PAIR_PANTS[pairPants];
  document.querySelectorAll('#pairShirtSeg [data-pair-shirt]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.pairShirt === pairShirt));
  });
  document.querySelectorAll('#pairPantsSeg [data-pair-pants]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.pairPants === pairPants));
  });
}
(function pairInit() {
  const sseg = document.getElementById('pairShirtSeg');
  PAIR_SHIRTS.forEach(function (s, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = s;
    b.dataset.pairShirt = String(i);
    b.addEventListener('click', function () { pairShirt = i; pairRender(); });
    sseg.appendChild(b);
  });
  const pseg = document.getElementById('pairPantsSeg');
  PAIR_PANTS.forEach(function (s, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = s;
    b.dataset.pairPants = String(i);
    b.addEventListener('click', function () { pairPants = i; pairRender(); });
    pseg.appendChild(b);
  });
  document.getElementById('pairMake').addEventListener('click', function () {
    const key = pairShirt + '-' + pairPants;
    const combo = PAIR_SHIRTS[pairShirt] + ' + ' + PAIR_PANTS[pairPants];
    markTried('pair');
    const msg = document.getElementById('pairMsg');
    if (pairFound.has(key)) {
      msg.textContent = combo + '已经配过了，换一身试试。';
    } else {
      pairFound.add(key);
      const chip = document.createElement('span');
      chip.className = 'pair-chip';
      chip.textContent = combo;
      document.getElementById('pairFound').appendChild(chip);
      msg.textContent = pairFound.size === 6
        ? '都配出来了：3件上衣 × 2条裤子 = 6种穿法，不是3+2=5种——每件上衣都能配2条裤子。'
        : '配好了 ' + combo + '，还有 ' + (6 - pairFound.size) + ' 种没配。';
    }
    pairRender();
  });
  document.getElementById('pairReset').addEventListener('click', function () {
    pairFound.clear();
    document.getElementById('pairFound').innerHTML = '';
    document.getElementById('pairMsg').textContent = '先定住一件上衣，再配一条裤子。';
    pairRender();
  });
  pairRender();
})();

/* ---------- demo-chart · 2.14a 数据收集整理（方法：投票变条形图 + 总数校验） ----------
   全班 30 人：苹果 12、香蕉 10、橘子 6、葡萄 0，一共 28 票，少了 2 票。 */
const CH_FRUITS = [
  { name: '苹果', n: 12 },
  { name: '香蕉', n: 10 },
  { name: '橘子', n: 6 },
  { name: '葡萄', n: 0 }
];
function chTotal() { return CH_FRUITS.reduce(function (s, f) { return s + f.n; }, 0); }
function chRender() {
  CH_FRUITS.forEach(function (f, i) {
    document.getElementById('chBar' + i).style.width = (f.n / 15 * 100) + '%';
    document.getElementById('chNum' + i).textContent = f.n + ' 票';
  });
  document.getElementById('chTotal').textContent = '已经投了 ' + chTotal() + ' / 30 票';
}
(function chInit() {
  const box = document.getElementById('chVotes');
  CH_FRUITS.forEach(function (f, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn small ghost';
    b.textContent = '投' + f.name + '一票';
    b.addEventListener('click', function () {
      f.n++;
      markTried('chart');
      chRender();
      document.getElementById('chMsg').textContent = '投给了' + f.name + '，它现在有 ' + f.n + ' 票。';
    });
    box.appendChild(b);
  });
  document.getElementById('chCheck').addEventListener('click', function () {
    markTried('chart');
    const t = chTotal();
    document.getElementById('chMsg').textContent = t < 30
      ? '一共 ' + t + ' 票，还差 ' + (30 - t) + ' 票——有人的票漏数了。'
      : t === 30
        ? '30 票都数了：' + CH_FRUITS.map(function (f) { return f.n; }).join('+') + '=30，对上了！'
        : '一共 ' + t + ' 票，比 30 多了 ' + (t - 30) + ' 票——有人数了两次。';
  });
  chRender();
})();

/* ---------- demo-share · 2.8 除法初步认识（方法：轮流发牌） ----------
   12÷3=4，15÷5=3，20÷4=5。平均分：轮流发；包含除：每次拿走一份。 */
const SH_PROBS = [
  { total: 12, per: 3, label: '12颗糖分给3个人', names: ['小红', '小明', '小刚'] },
  { total: 15, per: 5, label: '15个苹果分给5个小朋友', names: ['小红', '小明', '小刚', '小丽', '小强'] },
  { total: 20, per: 4, label: '20块饼干分给4个人', names: ['小红', '小明', '小刚', '小丽'] }
];
let shProbIdx = 0;
let shMode = 'deal';
let shRemaining = 12;
let shEach = [0, 0, 0, 0, 0];
let shGroups = 0;
function shReset() {
  const p = SH_PROBS[shProbIdx];
  shRemaining = p.total;
  shEach = [0, 0, 0, 0, 0];
  shGroups = 0;
}
function shRender() {
  const p = SH_PROBS[shProbIdx];
  const trays = document.getElementById('shTrays');
  for (let i = 0; i < 5; i++) {
    const t = trays.children[i];
    if (shMode === 'deal') {
      t.hidden = i >= p.per;
      if (i < p.per) t.textContent = p.names[i] + '：' + shEach[i] + '个';
    } else {
      t.hidden = i >= shGroups;
      if (i < shGroups) t.textContent = '第' + (i + 1) + '份：' + p.per + '个';
    }
  }
  document.getElementById('shLeft').textContent = '还没分的：' + shRemaining + '个';
  document.getElementById('shEq').textContent = shRemaining === 0
    ? p.total + ' ÷ ' + p.per + ' = ' + (p.total / p.per)
    : p.total + ' ÷ ' + p.per + ' = ?';
  document.querySelectorAll('#shProbSeg [data-sh-prob]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.shProb === shProbIdx));
  });
  document.querySelectorAll('#shModeSeg [data-sh-mode]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(b.dataset.shMode === shMode));
  });
  document.getElementById('shDeal').textContent = shMode === 'deal' ? '轮流发一圈' : '拿走' + p.per + '个';
}
(function shInit() {
  const trays = document.getElementById('shTrays');
  for (let i = 0; i < 5; i++) {
    const t = document.createElement('div');
    t.className = 'sh-tray';
    trays.appendChild(t);
  }
  const seg = document.getElementById('shProbSeg');
  SH_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = p.label;
    b.dataset.shProb = String(i);
    b.addEventListener('click', function () { shProbIdx = i; shReset(); document.getElementById('shMsg').textContent = '点“轮流发一圈”，一人一颗轮流发。'; shRender(); });
    seg.appendChild(b);
  });
  const mseg = document.getElementById('shModeSeg');
  [['deal', '平均分：轮流发'], ['take', '包含除：每次拿走一份']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = m[1];
    b.dataset.shMode = m[0];
    b.addEventListener('click', function () { shMode = m[0]; shReset(); document.getElementById('shMsg').textContent = shMode === 'deal' ? '点“轮流发一圈”，一人一颗轮流发。' : '点“拿走' + SH_PROBS[shProbIdx].per + '个”，每次拿走一份，看看能拿几次。'; shRender(); });
    mseg.appendChild(b);
  });
  document.getElementById('shDeal').addEventListener('click', function () {
    const p = SH_PROBS[shProbIdx];
    markTried('share');
    const msg = document.getElementById('shMsg');
    if (shRemaining <= 0) { msg.textContent = '已经分完了。'; return; }
    if (shMode === 'deal') {
      for (let i = 0; i < p.per; i++) shEach[i]++;
      shRemaining -= p.per;
      if (shRemaining === 0) msg.textContent = '每人 ' + (p.total / p.per) + ' 个，' + (p.total / p.per) + ' × ' + p.per + ' = ' + p.total + '，平均分对了。';
      else msg.textContent = '发了一圈，每人 ' + shEach[0] + ' 个，还剩 ' + shRemaining + ' 个。';
    } else {
      if (shRemaining < p.per) { msg.textContent = '剩下的不够 ' + p.per + ' 个了。'; return; }
      shGroups++;
      shRemaining -= p.per;
      if (shRemaining === 0) msg.textContent = '一共拿了 ' + shGroups + ' 次，' + (p.total / p.per) + ' × ' + p.per + ' = ' + p.total + '。';
      else msg.textContent = '拿走了 1 份，还剩 ' + shRemaining + ' 个，能拿 ' + shGroups + ' 次了。';
    }
    shRender();
  });
  document.getElementById('shResetBtn').addEventListener('click', function () { shReset(); document.getElementById('shMsg').textContent = '重新来。'; shRender(); });
  shReset();
  shRender();
})();

/* ---------- demo-motion · 2.9 图形的运动（方法：折纸 + 镜面拖） ----------
   对折：长方形竖✓横✓斜✗；正方形竖✓横✓斜✓；平行四边形全✗。 */
const MO_SHAPES = [
  { name: '长方形', folds: { '竖': true, '横': true, '斜': false } },
  { name: '正方形', folds: { '竖': true, '横': true, '斜': true } },
  { name: '平行四边形', folds: { '竖': false, '横': false, '斜': false } }
];
let moShapeIdx = 0;
let moFold = '竖';
let moMoveX = 0;
let moRot = 0;
function moRenderShape() {
  const svg = document.getElementById('moFoldSvg');
  svg.innerHTML = '';
  const NS = 'http://www.w3.org/2000/svg';
  const s = MO_SHAPES[moShapeIdx];
  let pts;
  if (moShapeIdx === 0) pts = '40,40 180,40 180,110 40,110';
  else if (moShapeIdx === 1) pts = '60,30 160,30 160,130 60,130';
  else pts = '70,40 180,40 150,110 40,110';
  const poly = document.createElementNS(NS, 'polygon');
  poly.setAttribute('points', pts);
  poly.setAttribute('fill', '#dbeafe');
  poly.setAttribute('stroke', '#2563eb');
  poly.setAttribute('stroke-width', '2');
  svg.appendChild(poly);
  const line = document.createElementNS(NS, 'line');
  if (moFold === '竖') { line.setAttribute('x1', '110'); line.setAttribute('y1', '20'); line.setAttribute('x2', '110'); line.setAttribute('y2', '140'); }
  else if (moFold === '横') { line.setAttribute('x1', '20'); line.setAttribute('y1', '80'); line.setAttribute('x2', '200'); line.setAttribute('y2', '80'); }
  else { line.setAttribute('x1', '40'); line.setAttribute('y1', '20'); line.setAttribute('x2', '180'); line.setAttribute('y2', '140'); }
  line.setAttribute('stroke', '#dc2626');
  line.setAttribute('stroke-width', '2');
  line.setAttribute('stroke-dasharray', '6 4');
  svg.appendChild(line);
  document.querySelectorAll('#moShapeSeg [data-mo-shape]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.moShape === moShapeIdx));
  });
  document.querySelectorAll('#moFoldSeg [data-mo-fold]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(b.dataset.moFold === moFold));
  });
}
(function moInit() {
  const sseg = document.getElementById('moShapeSeg');
  MO_SHAPES.forEach(function (s, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = s.name;
    b.dataset.moShape = String(i);
    b.addEventListener('click', function () { moShapeIdx = i; document.getElementById('moFoldMsg').textContent = '选一条线，点“对折”，看看两半能不能重合。'; moRenderShape(); });
    sseg.appendChild(b);
  });
  const fseg = document.getElementById('moFoldSeg');
  ['竖', '横', '斜'].forEach(function (f) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = f + '着折';
    b.dataset.moFold = f;
    b.addEventListener('click', function () { moFold = f; moRenderShape(); });
    fseg.appendChild(b);
  });
  document.getElementById('moFoldBtn').addEventListener('click', function () {
    const s = MO_SHAPES[moShapeIdx];
    markTried('motion');
    document.getElementById('moFoldMsg').textContent = s.folds[moFold]
      ? '沿' + moFold + '线折过去，两半完全重合——这条线是对称轴。'
      : '沿' + moFold + '线折过去，两半重合不了——这条线不是对称轴。';
  });
  document.getElementById('moMoveBtn').addEventListener('click', function () {
    moMoveX = (moMoveX + 36) % 144;
    markTried('motion');
    document.getElementById('moTri').setAttribute('transform', 'translate(' + moMoveX + ' 0) rotate(' + moRot + ' 110 60)');
    document.getElementById('moMoveMsg').textContent = '整个图形直直地滑过去了，样子和方向都没变。';
  });
  document.getElementById('moRotBtn').addEventListener('click', function () {
    moRot = (moRot + 90) % 360;
    markTried('motion');
    document.getElementById('moTri').setAttribute('transform', 'translate(' + moMoveX + ' 0) rotate(' + moRot + ' 110 60)');
    document.getElementById('moMoveMsg').textContent = '绕着点转了 90°，样子没变，方向变了——转过的图形还是原来的图形。';
  });
  moRenderShape();
})();

/* ---------- demo-mixop · 2.10 混合运算（方法：条形分堆） ----------
   2+3×4=14（错算 20），5+2×3=11（错算 21），(2+3)×4=20（错算 14），(18-6)÷2=6（错算 15）。 */
const MX_PROBS = [
  { label: '2+3×4', first: '先算乘法', firstText: '3×4=12，再加2', result: 14, wrong: 20, wrongText: '从左往右算：2+3=5，5×4=20——那是(2+3)×4的答案，不是2+3×4的。', bars: [4, 4, 4, 2] },
  { label: '5+2×3', first: '先算乘法', firstText: '2×3=6，再加5', result: 11, wrong: 21, wrongText: '从左往右算：5+2=7，7×3=21——错了，乘法那堆要先算。', bars: [3, 3, 5] },
  { label: '(2+3)×4', first: '先算括号里', firstText: '2+3=5，再算5×4', result: 20, wrong: 14, wrongText: '不算括号先算乘法：3×4=12，再加2是14——那是2+3×4的答案，括号说了“这一堆先算”。', bars: [5, 5, 5, 5] },
  { label: '(18-6)÷2', first: '先算括号里', firstText: '18-6=12，再算12÷2', result: 6, wrong: 15, wrongText: '不算括号：6÷2=3，18-3=15——错了，括号里的要先算。', bars: [6, 6] }
];
let mxProbIdx = 0;
function mxRender() {
  const p = MX_PROBS[mxProbIdx];
  document.getElementById('mxEq').textContent = p.label + ' = ?';
  document.getElementById('mxFirstBtn').textContent = p.first;
  const bars = document.getElementById('mxBars');
  bars.innerHTML = '';
  p.bars.forEach(function (n) {
    const bar = document.createElement('div');
    bar.className = 'mx-bar';
    for (let i = 0; i < n; i++) {
      const u = document.createElement('span');
      u.className = 'mx-unit';
      bar.appendChild(u);
    }
    bars.appendChild(bar);
  });
  document.querySelectorAll('#mxProbSeg [data-mx-prob]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.mxProb === mxProbIdx));
  });
}
(function mxInit() {
  const seg = document.getElementById('mxProbSeg');
  MX_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = p.label;
    b.dataset.mxProb = String(i);
    b.addEventListener('click', function () { mxProbIdx = i; document.getElementById('mxMsg').textContent = '先想一想：哪一堆要先算？'; mxRender(); });
    seg.appendChild(b);
  });
  document.getElementById('mxFirstBtn').addEventListener('click', function () {
    const p = MX_PROBS[mxProbIdx];
    markTried('mixop');
    document.getElementById('mxEq').textContent = p.label + ' = ' + p.result;
    document.getElementById('mxMsg').textContent = '对了！' + p.firstText + '，是 ' + p.result + '。';
  });
  document.getElementById('mxLeftBtn').addEventListener('click', function () {
    const p = MX_PROBS[mxProbIdx];
    markTried('mixop');
    document.getElementById('mxMsg').textContent = '错了：' + p.wrongText;
  });
  mxRender();
})();

/* ---------- demo-remain · 2.11 有余数的除法（方法：分到不够分为止） ----------
   17÷5=3余2，20÷6=3余2，23÷4=5余3。 */
const REM_PROBS = [
  { total: 17, size: 5 },
  { total: 20, size: 6 },
  { total: 23, size: 4 }
];
let remProbIdx = 0;
let remBags = 0;
let remLeft = 17;
function remReset() {
  remBags = 0;
  remLeft = REM_PROBS[remProbIdx].total;
}
function remRender() {
  const p = REM_PROBS[remProbIdx];
  document.getElementById('remPackBtn').textContent = '装一包（' + p.size + '颗）';
  document.getElementById('remBags').textContent = '已经装了 ' + remBags + ' 包';
  document.getElementById('remLeft').textContent = '还剩 ' + remLeft + ' 颗';
  document.getElementById('remEq').textContent = (remLeft < p.size && remBags > 0)
    ? p.total + ' ÷ ' + p.size + ' = ' + remBags + ' …… ' + remLeft
    : p.total + ' ÷ ' + p.size + ' = ?';
  document.querySelectorAll('#remProbSeg [data-rem-prob]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.remProb === remProbIdx));
  });
}
(function remInit() {
  const seg = document.getElementById('remProbSeg');
  REM_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = p.total + ' ÷ ' + p.size;
    b.dataset.remProb = String(i);
    b.addEventListener('click', function () { remProbIdx = i; remReset(); document.getElementById('remMsg').textContent = '每 ' + p.size + ' 颗装一包，装到不够 ' + p.size + ' 颗就停下。'; remRender(); });
    seg.appendChild(b);
  });
  document.getElementById('remPackBtn').addEventListener('click', function () {
    const p = REM_PROBS[remProbIdx];
    markTried('remain');
    const msg = document.getElementById('remMsg');
    if (remLeft < p.size) {
      msg.textContent = '剩下的 ' + remLeft + ' 颗不够 ' + p.size + ' 颗，装不了了。';
    } else {
      remBags++;
      remLeft -= p.size;
      if (remLeft < p.size) msg.textContent = '装了 ' + remBags + ' 包，剩下的 ' + remLeft + ' 颗不够 ' + p.size + ' 颗，不能再装了——余数 ' + remLeft + ' 比除数 ' + p.size + ' 小。';
      else msg.textContent = '装了 ' + remBags + ' 包，还剩 ' + remLeft + ' 颗，还能再装。';
    }
    remRender();
  });
  document.getElementById('remResetBtn').addEventListener('click', function () { remReset(); document.getElementById('remMsg').textContent = '重新来。'; remRender(); });
  remReset();
  remRender();
})();

/* ---------- demo-thousand · 2.12 万以内数的认识、近似数（方法：千方块 + 数轴半点） ----------
   678→700（22 vs 78），649→600（49 vs 51），589→600，612→600，549→500，450→500（满5进1）。 */
const TH_NUMS = [678, 649, 589, 612, 549, 450];
let thNum = 678;
function thRender() {
  const n = thNum;
  const lower = Math.floor(n / 100) * 100;
  const upper = lower + 100;
  const mid = lower + 50;
  const dLow = n - lower;
  const dUp = upper - n;
  const approx = dUp <= dLow ? upper : lower;
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const o = n % 10;
  document.getElementById('thPlace').textContent = n + ' = ' + h + '个百、' + t + '个十、' + o + '个一';
  document.getElementById('thApprox').textContent = dLow === dUp
    ? n + '到' + upper + '和到' + lower + '都是' + dLow + '，正好在中间，满5进1，大约是' + approx + '。'
    : n + '到' + upper + '是' + dUp + '，到' + lower + '是' + dLow + '，离' + approx + '近，大约是' + approx + '。';
  const dot = document.getElementById('thDot');
  dot.setAttribute('cx', String(20 + (n - lower) / 100 * 280));
  document.getElementById('thLowTx').textContent = String(lower);
  document.getElementById('thMidTx').textContent = String(mid);
  document.getElementById('thUpTx').textContent = String(upper);
  document.querySelectorAll('#thNumSeg [data-th-num]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.thNum === n));
  });
}
(function thInit() {
  const seg = document.getElementById('thNumSeg');
  TH_NUMS.forEach(function (n) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = String(n);
    b.dataset.thNum = String(n);
    b.addEventListener('click', function () { thNum = n; markTried('thousand'); thRender(); });
    seg.appendChild(b);
  });
  thRender();
})();

/* ---------- demo-weight · 2.13 克和千克（方法：天平称 + 基准物） ----------
   苹果 150 克，一袋盐 500 克，一袋洗衣粉 2 千克，一袋大米 5 千克。1 千克 = 1000 克。 */
const WT_ITEMS = [
  { name: '苹果', g: 150 },
  { name: '一袋盐', g: 500 },
  { name: '一袋洗衣粉', g: 2000 },
  { name: '一袋大米', g: 5000 }
];
const wtCounts = [0, 0, 0, 0];
function wtTotal() { return WT_ITEMS.reduce(function (s, it, i) { return s + it.g * wtCounts[i]; }, 0); }
function wtText(total) {
  if (total < 1000) return total + '克';
  const kg = Math.floor(total / 1000);
  const rest = total % 1000;
  return total + '克 = ' + kg + '千克' + (rest ? rest + '克' : '');
}
function wtRender() {
  const total = wtTotal();
  document.getElementById('wtTotal').textContent = '盘子里一共 ' + wtText(total);
  document.getElementById('wtBarFill').style.width = Math.min(total / 5000 * 100, 100) + '%';
  let msg;
  if (total === 0) msg = '点一样东西放到盘子里，称一称它有多重。';
  else if (total < 1000) msg = '比1千克轻。';
  else if (total === 1000) msg = '正好是1千克。';
  else msg = '比1千克重。';
  if (wtCounts[1] === 4) msg += '4袋盐 = 2000克 = 2千克。';
  document.getElementById('wtMsg').textContent = msg;
  WT_ITEMS.forEach(function (it, i) {
    document.getElementById('wtCount' + i).textContent = '×' + wtCounts[i];
  });
}
(function wtInit() {
  const box = document.getElementById('wtItems');
  WT_ITEMS.forEach(function (it, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn small ghost';
    b.innerHTML = it.name + ' ' + (it.g >= 1000 ? (it.g / 1000) + '千克' : it.g + '克') + ' <b id="wtCount' + i + '">×0</b>';
    b.addEventListener('click', function () { wtCounts[i]++; markTried('weight'); wtRender(); });
    box.appendChild(b);
  });
  document.getElementById('wtReset').addEventListener('click', function () {
    for (let i = 0; i < wtCounts.length; i++) wtCounts[i] = 0;
    wtRender();
  });
  wtRender();
})();

/* ---------- demo-logic · 2.14b 推理（方法：排除格） ----------
   小红拿的不是苹果，小明拿的不是梨也不是苹果 → 小明拿香蕉，小红拿梨，小刚拿苹果。 */
const LG_PEOPLE = ['小红', '小明', '小刚'];
const LG_FRUITS = ['苹果', '梨', '香蕉'];
const lgGrid = [];
for (let i = 0; i < 3; i++) lgGrid.push(['', '', '']);
function lgCellEl(r, c) { return document.getElementById('lgGrid').children[r * 3 + c]; }
function lgResolve() {
  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 0; r < 3; r++) {
      const xs = lgGrid[r].filter(function (v) { return v === 'x'; }).length;
      const blank = lgGrid[r].indexOf('');
      if (xs === 2 && blank >= 0) { lgGrid[r][blank] = 'y'; changed = true; }
      const yi = lgGrid[r].indexOf('y');
      if (yi >= 0) {
        for (let c = 0; c < 3; c++) if (c !== yi && lgGrid[r][c] === '') { lgGrid[r][c] = 'x'; changed = true; }
      }
    }
    for (let c = 0; c < 3; c++) {
      const col = [lgGrid[0][c], lgGrid[1][c], lgGrid[2][c]];
      const xs = col.filter(function (v) { return v === 'x'; }).length;
      const blank = col.indexOf('');
      if (xs === 2 && blank >= 0) { lgGrid[blank][c] = 'y'; changed = true; }
      const yi = col.indexOf('y');
      if (yi >= 0) {
        for (let r = 0; r < 3; r++) if (r !== yi && lgGrid[r][c] === '') { lgGrid[r][c] = 'x'; changed = true; }
      }
    }
  }
}
function lgRender() {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const el = lgCellEl(r, c);
      const v = lgGrid[r][c];
      el.textContent = v === 'x' ? '✕' : (v === 'y' ? '✓' : '');
      el.classList.toggle('lg-x', v === 'x');
      el.classList.toggle('lg-yes', v === 'y');
      el.setAttribute('aria-pressed', String(v === 'x'));
    }
  }
  const done = lgGrid.every(function (row) { return row.indexOf('y') >= 0; });
  if (done) {
    const ans = [];
    for (let r = 0; r < 3; r++) ans.push(LG_PEOPLE[r] + '拿' + LG_FRUITS[lgGrid[r].indexOf('y')]);
    document.getElementById('lgMsg').textContent = '都找出来了：' + ans.join('，') + '。';
  }
}
function lgMark(r, c) {
  if (lgGrid[r][c] === 'y') return;
  lgGrid[r][c] = lgGrid[r][c] === 'x' ? '' : 'x';
  lgResolve();
  lgRender();
}
(function lgInit() {
  const grid = document.getElementById('lgGrid');
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'lg-cell';
      b.setAttribute('aria-label', LG_PEOPLE[r] + '拿' + LG_FRUITS[c]);
      b.addEventListener('click', function () { markTried('logic'); lgMark(r, c); });
      grid.appendChild(b);
    }
  }
  const clues = [
    { id: 'lgClue1', r: 0, c: 0, text: '小红拿的不是苹果' },
    { id: 'lgClue2', r: 1, c: 1, text: '小明拿的不是梨' },
    { id: 'lgClue3', r: 1, c: 0, text: '小明拿的不是苹果' }
  ];
  clues.forEach(function (cl) {
    document.getElementById(cl.id).addEventListener('click', function () {
      markTried('logic');
      if (lgGrid[cl.r][cl.c] !== 'y') lgGrid[cl.r][cl.c] = 'x';
      lgResolve();
      lgRender();
      if (document.getElementById('lgMsg').textContent.indexOf('都找出来了') < 0) {
        document.getElementById('lgMsg').textContent = '划掉了：' + cl.text + '。再用一条线索。';
      }
    });
  });
  document.getElementById('lgReset').addEventListener('click', function () {
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) lgGrid[r][c] = '';
    document.getElementById('lgMsg').textContent = '点一个格子划掉不可能的，或者先点一条线索。';
    lgRender();
  });
  lgRender();
})();

/* ================= 三年级实验（3.1–3.15，2026-11-06） =================
   Group F — Grade 3 demos. One small tool per point, same patterns as the
   Grade 1/2 groups: seg buttons built once at init (never rebuilt, so the
   smoke stub's children lists stay stable), readouts in textContent,
   markTried() on the main interaction, no scoring, no login.
   Numbers verified by hand — see the comments on each problem set.
   3.7 reuses the fraction demo, 3.15b reuses the Grade 2 pair demo. */

/* ---------- demo-elapsed · 3.1 时、分、秒（方法：时间轴跳格） ----------
   7:45→8:10 是 25 分；7:30→9:05 是 95 分 = 1 小时 35 分；8:10→8:35 是 25 分。
   1 时 = 60 分，借 1 小时是借 60 分，不是 100 分。 */
const EL_PROBS = [
  { sh: 7, sm: 45, eh: 8, em: 10, label: '7:45 → 8:10' },
  { sh: 7, sm: 30, eh: 9, em: 5, label: '7:30 → 9:05' },
  { sh: 8, sm: 10, eh: 8, em: 35, label: '8:10 → 8:35' }
];
let elProbIdx = 0;
let elCur = 0; // 从起点走了几分钟
function elTotal(p) { return (p.eh * 60 + p.em) - (p.sh * 60 + p.sm); }
function elFmt(h, m) { return h + '时' + (m < 10 ? '0' + m : String(m)) + '分'; }
function elFmtElapsed(n) {
  if (n < 60) return n + ' 分钟';
  const h = Math.floor(n / 60), m = n % 60;
  return m === 0 ? h + ' 小时' : h + ' 小时 ' + m + ' 分';
}
function elCurTime(p) {
  const t = p.sh * 60 + p.sm + elCur;
  return elFmt(Math.floor(t / 60), t % 60);
}
function elRender() {
  const p = EL_PROBS[elProbIdx];
  const total = elTotal(p);
  document.getElementById('elMarker').style.left = (elCur / total * 100) + '%';
  document.getElementById('elReadout').textContent = '现在是 ' + elCurTime(p) + '，走了 ' + elCur + ' 分钟';
  document.getElementById('elTarget').textContent = '从 ' + elFmt(p.sh, p.sm) + ' 走到 ' + elFmt(p.eh, p.em) + '，一共要走多久？';
  document.getElementById('elMsg').textContent = elCur >= total
    ? '到了！一共走了 ' + elFmtElapsed(total) + '。'
    : '先跳到整点，再跳分钟：从 ' + elFmt(p.sh, p.sm) + ' 出发。';
  document.querySelectorAll('#elProbSeg [data-el-prob]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.elProb === elProbIdx));
  });
}
function elAdd(n) {
  const p = EL_PROBS[elProbIdx];
  elCur = Math.min(elCur + n, elTotal(p));
  markTried('elapsed');
  elRender();
}
(function elInit() {
  const seg = document.getElementById('elProbSeg');
  EL_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = p.label;
    b.dataset.elProb = String(i);
    b.addEventListener('click', function () { elProbIdx = i; elCur = 0; elRender(); });
    seg.appendChild(b);
  });
  document.getElementById('elJump').addEventListener('click', function () {
    const p = EL_PROBS[elProbIdx];
    const now = p.sh * 60 + p.sm + elCur;
    const toHour = 60 - (now % 60);
    elAdd(toHour === 60 ? 60 : toHour);
  });
  document.getElementById('elPlus10').addEventListener('click', function () { elAdd(10); });
  document.getElementById('elPlus5').addEventListener('click', function () { elAdd(5); });
  document.getElementById('elPlus1').addEventListener('click', function () { elAdd(1); });
  elRender();
})();

/* ---------- demo-verify · 3.2 万以内加减法（方法：逆运算验算） ----------
   456+278=734（验算 734−278=456）；1000−658=342（验算 342+658=1000）；
   345+255=600（验算 600−255=345）。验算不是再算一遍，是用相反的运算算回去。 */
const VF_PROBS = [
  { label: '456 + 278', op: '+',
    steps: ['个位：6+8=14，写 4，向十位进 1', '十位：5+7=12，再加进来的 1 是 13，写 3，向百位进 1', '百位：4+2=6，再加进来的 1 是 7', '结果：456 + 278 = 734'],
    verify: '验算：734 − 278 = 456，减回来了，和原来一样，算对了！' },
  { label: '1000 − 658', op: '−',
    steps: ['个位：0−8 不够减，向十位借 1；十位是 0，再向百位借 1', '借完：个位变成 10，10−8=2', '十位：9−5=4（百位借走 1 个百，十位变成 9）', '百位：9−6=3，千位变成 0', '结果：1000 − 658 = 342'],
    verify: '验算：342 + 658 = 1000，加回来了，和原来一样，算对了！' },
  { label: '345 + 255', op: '+',
    steps: ['个位：5+5=10，写 0，向十位进 1', '十位：4+5=9，再加进来的 1 是 10，写 0，向百位进 1', '百位：3+2=5，再加进来的 1 是 6', '结果：345 + 255 = 600'],
    verify: '验算：600 − 255 = 345，减回来了，和原来一样，算对了！' }
];
let vfProbIdx = 0;
let vfStep = 0;
function vfRender() {
  const p = VF_PROBS[vfProbIdx];
  document.getElementById('vfEq').textContent = p.label + ' = ?';
  for (let i = 0; i < 5; i++) {
    const row = document.getElementById('vfStep' + i);
    row.hidden = i >= vfStep || !p.steps[i];
    row.textContent = p.steps[i] || '';
  }
  document.querySelectorAll('#vfProbSeg [data-vf-prob]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.vfProb === vfProbIdx));
  });
}
(function vfInit() {
  const seg = document.getElementById('vfProbSeg');
  VF_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = p.label;
    b.dataset.vfProb = String(i);
    b.addEventListener('click', function () { vfProbIdx = i; vfStep = 0; document.getElementById('vfMsg').textContent = '一步一步算，每算一位看一位。'; vfRender(); });
    seg.appendChild(b);
  });
  document.getElementById('vfNext').addEventListener('click', function () {
    const p = VF_PROBS[vfProbIdx];
    markTried('verify');
    if (vfStep < p.steps.length) vfStep++;
    document.getElementById('vfMsg').textContent = vfStep >= p.steps.length
      ? '算完了，点“验算”：用相反的运算算回去。'
      : '再算下一位。';
    vfRender();
  });
  document.getElementById('vfVerify').addEventListener('click', function () {
    markTried('verify');
    document.getElementById('vfMsg').textContent = VF_PROBS[vfProbIdx].verify;
  });
  document.getElementById('vfReset').addEventListener('click', function () {
    vfStep = 0;
    document.getElementById('vfMsg').textContent = '一步一步算，每算一位看一位。';
    vfRender();
  });
  vfRender();
})();

/* ---------- demo-units · 3.3 测量（方法：单位楼梯） ----------
   长度：毫米—厘米—分米—米（每级 ×10），米—千米 ×1000。
   重量：克—千克—吨（每级 ×1000）。2 千米 = 2000 米；3 吨 = 3000 千克；2 米 = 200 厘米。 */
const UN_LEN = [
  { name: '毫米', fact: '1 厘米 = 10 毫米；毫米是最小的长度单位，用来量很薄的东西。' },
  { name: '厘米', fact: '1 厘米 = 10 毫米；1 分米 = 10 厘米。' },
  { name: '分米', fact: '1 分米 = 10 厘米；1 米 = 10 分米。' },
  { name: '米', fact: '1 米 = 10 分米 = 100 厘米 = 1000 毫米；1 千米 = 1000 米。' },
  { name: '千米', fact: '1 千米 = 1000 米；从家到学校 2 千米，就是 2000 米。' }
];
const UN_WT = [
  { name: '克', fact: '1 千克 = 1000 克；一个鸡蛋大约重 50 克。' },
  { name: '千克', fact: '1 千克 = 1000 克；1 吨 = 1000 千克。' },
  { name: '吨', fact: '1 吨 = 1000 千克；一头大象大约重 3 吨，就是 3000 千克。' }
];
const UN_PROBS = [
  { q: '2 千米 = ? 米', options: [200, 2000, 20000], answer: 2000, why: '1 千米 = 1000 米，2 千米就是 2 个 1000 米。' },
  { q: '3 吨 = ? 千克', options: [300, 3000, 30000], answer: 3000, why: '1 吨 = 1000 千克，3 吨就是 3 个 1000 千克。' },
  { q: '2 米 = ? 厘米', options: [20, 200, 2000], answer: 200, why: '1 米 = 100 厘米，2 米就是 2 个 100 厘米。' }
];
let unProbIdx = 0;
function unRenderOpts() {
  const p = UN_PROBS[unProbIdx];
  document.getElementById('unProbTx').textContent = p.q;
  for (let i = 0; i < 3; i++) {
    document.getElementById('unOpt' + i).textContent = String(p.options[i]);
  }
  document.querySelectorAll('#unProbSeg [data-un-prob]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.unProb === unProbIdx));
  });
}
(function unInit() {
  const lseg = document.getElementById('unLenSeg');
  UN_LEN.forEach(function (u, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = u.name;
    b.dataset.unLen = String(i);
    b.addEventListener('click', function () {
      markTried('units');
      document.getElementById('unReadout').textContent = u.name + '：' + u.fact;
      document.querySelectorAll('#unLenSeg [data-un-len]').forEach(function (x) { x.setAttribute('aria-pressed', String(+x.dataset.unLen === i)); });
    });
    lseg.appendChild(b);
  });
  const wseg = document.getElementById('unWtSeg');
  UN_WT.forEach(function (u, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = u.name;
    b.dataset.unWt = String(i);
    b.addEventListener('click', function () {
      markTried('units');
      document.getElementById('unReadout').textContent = u.name + '：' + u.fact;
      document.querySelectorAll('#unWtSeg [data-un-wt]').forEach(function (x) { x.setAttribute('aria-pressed', String(+x.dataset.unWt === i)); });
    });
    wseg.appendChild(b);
  });
  const pseg = document.getElementById('unProbSeg');
  UN_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = p.q;
    b.dataset.unProb = String(i);
    b.addEventListener('click', function () { unProbIdx = i; document.getElementById('unMsg').textContent = '想想进率是多少，再选。'; unRenderOpts(); });
    pseg.appendChild(b);
  });
  for (let i = 0; i < 3; i++) {
    document.getElementById('unOpt' + i).addEventListener('click', function () {
      const p = UN_PROBS[unProbIdx];
      const v = p.options[i];
      markTried('units');
      document.getElementById('unMsg').textContent = v === p.answer
        ? '对了！' + p.why
        : '不是 ' + v + '——' + p.why;
    });
  }
  unRenderOpts();
})();

/* ---------- demo-times · 3.4 倍的认识（方法：条形复制） ----------
   12 是 4 的 3 倍（12 里有 3 个 4）；9 是 3 的 3 倍；10 是 5 的 2 倍。
   倍是数有几个一份，不是多几。 */
const TX_PROBS = [
  { small: 4, big: 12 },
  { small: 3, big: 9 },
  { small: 5, big: 10 }
];
let txProbIdx = 0;
let txCopies = 0;
function txNeeded() { const p = TX_PROBS[txProbIdx]; return p.big / p.small; }
function txRender() {
  const p = TX_PROBS[txProbIdx];
  document.getElementById('txSmallBar').style.width = (p.small * 24) + 'px';
  document.getElementById('txBigBar').style.width = (p.big * 24) + 'px';
  document.getElementById('txSmallTx').textContent = '小条是 ' + p.small;
  document.getElementById('txBigTx').textContent = '大条是 ' + p.big;
  const box = document.getElementById('txCopies');
  for (let i = 0; i < box.children.length; i++) {
    const c = box.children[i];
    c.hidden = i >= txCopies;
    c.style.width = (p.small * 24) + 'px';
  }
  document.getElementById('txReadout').textContent = '已经复制了 ' + txCopies + ' 份';
  document.getElementById('txMsg').textContent = txCopies >= txNeeded()
    ? '拼起来和大条一样长：' + p.big + ' 是 ' + p.small + ' 的 ' + txNeeded() + ' 倍——倍是数有几个一份，不是多几。'
    : '点“复制一份”，把小条复制出来，拼一拼能不能和大条一样长。';
  document.querySelectorAll('#txProbSeg [data-tx-prob]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.txProb === txProbIdx));
  });
}
(function txInit() {
  const box = document.getElementById('txCopies');
  for (let i = 0; i < 6; i++) {
    const d = document.createElement('div');
    d.className = 'tx-copy';
    box.appendChild(d);
  }
  const seg = document.getElementById('txProbSeg');
  TX_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = p.big + ' 是 ' + p.small + ' 的几倍';
    b.dataset.txProb = String(i);
    b.addEventListener('click', function () { txProbIdx = i; txCopies = 0; txRender(); });
    seg.appendChild(b);
  });
  document.getElementById('txCopyBtn').addEventListener('click', function () {
    markTried('times');
    if (txCopies < 6) txCopies++;
    txRender();
  });
  document.getElementById('txReset').addEventListener('click', function () { txCopies = 0; txRender(); });
  txRender();
})();

/* ---------- demo-splitmul · 3.5 多位数乘一位数（方法：开放阵列 / 面积模型） ----------
   23×4=92（20×4=80，3×4=12）；32×3=96（30×3=90，2×3=6）；
   18×3=54（10×3=30，8×3=24）。23 大约是 20，20×4=80，答案在 80 左右。 */
const M1_PROBS = [
  { a: 23, b: 4, split: 20, rem: 3, est: '23 大约是 20，20×4=80，答案应该在 80 左右。' },
  { a: 32, b: 3, split: 30, rem: 2, est: '32 大约是 30，30×3=90，答案应该在 90 左右。' },
  { a: 18, b: 3, split: 10, rem: 8, est: '18 大约是 20，20×3=60，答案应该在 60 左右。' }
];
let m1ProbIdx = 0;
let m1RevA = false;
let m1RevB = false;
function m1Render() {
  const p = M1_PROBS[m1ProbIdx];
  const A = document.getElementById('m1BlockA');
  const B = document.getElementById('m1BlockB');
  A.style.width = (p.split / p.a * 100) + '%';
  B.style.width = (p.rem / p.a * 100) + '%';
  A.textContent = m1RevA ? p.split + '×' + p.b + '=' + (p.split * p.b) : p.split + '×' + p.b;
  B.textContent = m1RevB ? p.rem + '×' + p.b + '=' + (p.rem * p.b) : p.rem + '×' + p.b;
  document.getElementById('m1Eq').textContent = p.a + ' × ' + p.b + ' = ?';
  document.getElementById('m1Est').textContent = '先估一估：' + p.est;
  if (m1RevA && m1RevB) {
    document.getElementById('m1Msg').textContent = (p.split * p.b) + '+' + (p.rem * p.b) + '=' + (p.a * p.b) + '——' + p.a + ' 拆成 ' + p.split + ' 和 ' + p.rem + '，分别乘 ' + p.b + ' 再加起来。';
  } else {
    document.getElementById('m1Msg').textContent = '点一块，看它是多少；两块都点开，就能加出答案。';
  }
  document.querySelectorAll('#m1ProbSeg [data-m1-prob]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.m1Prob === m1ProbIdx));
  });
}
(function m1Init() {
  const seg = document.getElementById('m1ProbSeg');
  M1_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = p.a + ' × ' + p.b;
    b.dataset.m1Prob = String(i);
    b.addEventListener('click', function () { m1ProbIdx = i; m1RevA = false; m1RevB = false; m1Render(); });
    seg.appendChild(b);
  });
  document.getElementById('m1BlockA').addEventListener('click', function () { m1RevA = true; markTried('splitmul'); m1Render(); });
  document.getElementById('m1BlockB').addEventListener('click', function () { m1RevB = true; markTried('splitmul'); m1Render(); });
  m1Render();
})();

/* ---------- demo-rectsq · 3.6 长方形和正方形（方法：包含图 / 拉一拉） ----------
   长方形：4 个直角，对边相等。长和宽一样长时，四条边都相等，它就变成正方形——
   正方形也是长方形。默认长 8 厘米、宽 5 厘米。 */
let rsLen = 8;
let rsWid = 5;
function rsRender() {
  document.getElementById('rsRect').style.width = (rsLen * 28) + 'px';
  document.getElementById('rsRect').style.height = (rsWid * 28) + 'px';
  document.getElementById('rsLenTx').textContent = '长 ' + rsLen + ' 厘米';
  document.getElementById('rsWidTx').textContent = '宽 ' + rsWid + ' 厘米';
  document.getElementById('rsReadout').textContent = rsLen === rsWid
    ? '长和宽一样，都是 ' + rsLen + ' 厘米：四条边都相等，它变成正方形了！'
    : '长 ' + rsLen + ' 厘米，宽 ' + rsWid + ' 厘米：4 个直角，对边相等，是长方形。';
  document.getElementById('rsMsg').textContent = rsLen === rsWid
    ? '正方形有 4 个直角、对边相等，满足长方形的所有要求，所以正方形也是长方形。'
    : '把宽拉到和长一样长，看看它变成什么图形。';
}
(function rsInit() {
  document.getElementById('rsLenMinus').addEventListener('click', function () { if (rsLen > 3) rsLen--; markTried('rectsq'); rsRender(); });
  document.getElementById('rsLenPlus').addEventListener('click', function () { if (rsLen < 10) rsLen++; markTried('rectsq'); rsRender(); });
  document.getElementById('rsWidMinus').addEventListener('click', function () { if (rsWid > 3) rsWid--; markTried('rectsq'); rsRender(); });
  document.getElementById('rsWidPlus').addEventListener('click', function () { if (rsWid < 10) rsWid++; markTried('rectsq'); rsRender(); });
  rsRender();
})();

/* ---------- demo-venn · 3.8 集合（方法：韦恩图拖人） ----------
   15 个人：只会画画 7 人，两样都会 3 人，只会唱歌 5 人。
   会画画 10 人（7+3），会唱歌 8 人（5+3），总数 10+8−3=15 人。
   点一个人，他会换一个圈：重叠的人在两组里都出现过，相加时被数了两次。 */
const VN_NAMES = ['小红', '小明', '小刚', '小丽', '小强', '小华', '小芳', '小军', '小亮', '小雪', '小东', '小娜', '小杰', '小雨', '小峰'];
const vnZone = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2]; // 0 只画画，1 两样都会，2 只唱歌
function vnCounts() {
  const a = vnZone.filter(function (z) { return z === 0; }).length;
  const b = vnZone.filter(function (z) { return z === 1; }).length;
  const c = vnZone.filter(function (z) { return z === 2; }).length;
  return { onlyA: a, both: b, onlyB: c, A: a + b, B: c + b, total: a + b + c };
}
function vnRender() {
  const c = vnCounts();
  document.getElementById('vnCountA').textContent = '会画画：' + c.A + ' 人（' + c.onlyA + ' + ' + c.both + '）';
  document.getElementById('vnCountB').textContent = '会唱歌：' + c.B + ' 人（' + c.onlyB + ' + ' + c.both + '）';
  document.getElementById('vnCountTotal').textContent = '一共 ' + c.total + ' 个人';
  const zones = [document.getElementById('vnOnlyA'), document.getElementById('vnBoth'), document.getElementById('vnOnlyB')];
  zones.forEach(function (z, zi) {
    for (let i = 0; i < z.children.length; i++) {
      const chip = z.children[i];
      chip.hidden = vnZone[+chip.dataset.vnIdx] !== zi;
    }
  });
}
(function vnInit() {
  const zones = [document.getElementById('vnOnlyA'), document.getElementById('vnBoth'), document.getElementById('vnOnlyB')];
  VN_NAMES.forEach(function (name, i) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'vn-chip';
    chip.textContent = name;
    chip.dataset.vnIdx = String(i);
    chip.addEventListener('click', function () {
      markTried('venn');
      vnZone[i] = (vnZone[i] + 1) % 3;
      zones[vnZone[i]].appendChild(chip);
      document.getElementById('vnMsg').textContent = vnZone[i] === 1
        ? name + '现在两样都会，站在两个圈重叠的地方。'
        : vnZone[i] === 0 ? name + '现在只会画画。' : name + '现在只会唱歌。';
      vnRender();
    });
    zones[vnZone[i]].appendChild(chip);
  });
  document.getElementById('vnCheck').addEventListener('click', function () {
    const c = vnCounts();
    markTried('venn');
    document.getElementById('vnMsg').textContent = '画画 ' + c.A + ' 人 + 唱歌 ' + c.B + ' 人 = ' + (c.A + c.B) + '，减去数了两次的 ' + c.both + ' 人，一共 ' + c.total + ' 人。';
  });
  vnRender();
})();

/* ---------- demo-compass · 3.9 位置与方向（方法：指南针 + 路线描） ----------
   北是地球定好的方向，转地图北也不动。路线：广场向北 200 米，再向东 300 米，
   公园在广场的东北方向。面向东，左手边是北。 */
let cpRotated = false;
let cpSteps = 0;
(function cpInit() {
  document.getElementById('cpRotate').addEventListener('click', function () {
    cpRotated = !cpRotated;
    markTried('compass');
    document.getElementById('cpMap').style.transform = cpRotated ? 'rotate(90deg)' : '';
    document.getElementById('cpNeedle').textContent = cpRotated
      ? '地图转了 90°，针头还指着北——转的是纸，地球没有转，北一直是北。'
      : '针头一直指北。转一转地图，看看针头动不动。';
  });
  document.getElementById('cpNorth').addEventListener('click', function () {
    markTried('compass');
    if (cpSteps === 0) {
      cpSteps = 1;
      document.getElementById('cpRoute').textContent = '从广场出发，向北走了 200 米。';
      document.getElementById('cpMsg').textContent = '再向东走 300 米。';
    } else {
      document.getElementById('cpMsg').textContent = '已经向北走过了，再向东走。';
    }
  });
  document.getElementById('cpEast').addEventListener('click', function () {
    markTried('compass');
    if (cpSteps === 1) {
      cpSteps = 2;
      document.getElementById('cpRoute').textContent = '从广场出发，向北 200 米，再向东 300 米，到了公园。';
      document.getElementById('cpMsg').textContent = '又向北又向东，公园在广场的东北方向。';
    } else if (cpSteps === 0) {
      document.getElementById('cpMsg').textContent = '先向北走 200 米，再向东走。';
    } else {
      document.getElementById('cpMsg').textContent = '已经到公园了：公园在广场的东北方向。';
    }
  });
  document.getElementById('cpReset').addEventListener('click', function () {
    cpSteps = 0;
    document.getElementById('cpRoute').textContent = '从广场出发。';
    document.getElementById('cpMsg').textContent = '先向北走 200 米，再向东走 300 米。';
  });
  const qseg = document.getElementById('cpQuizSeg');
  [['北', true], ['南', false]].forEach(function (opt) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = opt[0];
    b.addEventListener('click', function () {
      markTried('compass');
      document.getElementById('cpQuizMsg').textContent = opt[1]
        ? '对了！面向东，左手边就是北；也可以想想地图上北在上面。'
        : '不对——面向东，左手边是北，右手边才是南。';
    });
    qseg.appendChild(b);
  });
})();

/* ---------- demo-divplace · 3.10 除数是一位数的除法（方法：先部分商、后竖式） ----------
   96÷4=24（先分 9 个十，剩 1 个十换成 10 个一，再分 16 个一）；
   408÷4=102（十位 0 不够分，写 0 占位）；84÷2=42。 */
const D1_PROBS = [
  { label: '96 ÷ 4', steps: ['先看十位：9 个十，每人分 2 个十，用掉 8 个十', '剩下 1 个十，换成 10 个一，和 6 个一合起来是 16 个一', '16 个一，每人分 4 个一', '结果：96 ÷ 4 = 24'] },
  { label: '408 ÷ 4', steps: ['百位：4 个百，每人分 1 个百', '十位：0 个十，不够分，写 0 占位', '个位：8 个一，每人分 2 个一', '结果：408 ÷ 4 = 102——中间的 0 是占位符，跳过它就变成 12 了'] },
  { label: '84 ÷ 2', steps: ['十位：8 个十，每人分 4 个十', '个位：4 个一，每人分 2 个一', '结果：84 ÷ 2 = 42'] }
];
let d1ProbIdx = 0;
let d1Step = 0;
function d1Render() {
  const p = D1_PROBS[d1ProbIdx];
  document.getElementById('d1Eq').textContent = p.label + ' = ?';
  for (let i = 0; i < 4; i++) {
    const row = document.getElementById('d1Step' + i);
    row.hidden = i >= d1Step || !p.steps[i];
    row.textContent = p.steps[i] || '';
  }
  document.getElementById('d1Msg').textContent = d1Step >= p.steps.length
    ? '分完了：除法从最高位开始分，哪一位不够分就写 0 占位。'
    : '点“下一步”，按数位一次一次分。';
  document.querySelectorAll('#d1ProbSeg [data-d1-prob]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.d1Prob === d1ProbIdx));
  });
}
(function d1Init() {
  const seg = document.getElementById('d1ProbSeg');
  D1_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = p.label;
    b.dataset.d1Prob = String(i);
    b.addEventListener('click', function () { d1ProbIdx = i; d1Step = 0; d1Render(); });
    seg.appendChild(b);
  });
  document.getElementById('d1Next').addEventListener('click', function () {
    const p = D1_PROBS[d1ProbIdx];
    markTried('divplace');
    if (d1Step < p.steps.length) d1Step++;
    d1Render();
  });
  document.getElementById('d1Reset').addEventListener('click', function () { d1Step = 0; d1Render(); });
  d1Render();
})();

/* ---------- demo-stattable · 3.15a 复式统计表（方法：双向表总数校验） ----------
   30 名同学：男生喜欢跑步 8 人、跳绳 4 人；女生喜欢跑步 5 人、跳绳 13 人。
   行加起来、列加起来都要等于总人数 30：30−8−4−5=13。 */
const T2_OPTS = [10, 12, 13, 15];
let t2Guess = null;
function t2Render() {
  const d = t2Guess === null ? 0 : t2Guess;
  document.getElementById('t2D').textContent = t2Guess === null ? '？' : String(t2Guess);
  document.getElementById('t2RowM').textContent = String(8 + 4);
  document.getElementById('t2RowF').textContent = String(5 + d);
  document.getElementById('t2ColR').textContent = String(8 + 5);
  document.getElementById('t2ColJ').textContent = String(4 + d);
  document.getElementById('t2Total').textContent = String(17 + d);
}
(function t2Init() {
  for (let i = 0; i < 4; i++) {
    const b = document.getElementById('t2Opt' + i);
    b.textContent = String(T2_OPTS[i]);
    b.addEventListener('click', function () {
      t2Guess = T2_OPTS[i];
      markTried('stattable');
      document.getElementById('t2Msg').textContent = '女生喜欢跳绳填了 ' + t2Guess + ' 人，点“对一对总数”看看行和列加起来是不是 30。';
      t2Render();
    });
  }
  document.getElementById('t2Check').addEventListener('click', function () {
    markTried('stattable');
    if (t2Guess === null) {
      document.getElementById('t2Msg').textContent = '先猜一猜女生喜欢跳绳的有几人，再对总数。';
      return;
    }
    const total = 17 + t2Guess;
    document.getElementById('t2Msg').textContent = total === 30
      ? '对上了！男生 12 人 + 女生 18 人 = 30 人；跑步 13 人 + 跳绳 17 人 = 30 人。'
      : '行和列加起来是 ' + total + ' 人，不是 30 人——再想想：30−8−4−5=？';
  });
  t2Render();
})();

/* ---------- demo-fourgrid · 3.11 两位数乘两位数（方法：四格面积模型） ----------
   23×15=345：20×10=200，20×5=100，3×10=30，3×5=15；四块加起来 345。
   竖式第二行是 23×10=230，就是 200+30 那两块。
   24×13=312：20×10=200，20×3=60，4×10=40，4×3=12。 */
const M2_PROBS = [
  { a: 23, b: 15, splitA: 20, remA: 3, splitB: 10, remB: 5,
    blocks: ['20×10=200', '20×5=100', '3×10=30', '3×5=15'],
    total: '200+100+30+15=345',
    rows: '竖式里：23×5=115 是第一行，23×10=230 是第二行——230 就是 200+30 那两块。' },
  { a: 24, b: 13, splitA: 20, remA: 4, splitB: 10, remB: 3,
    blocks: ['20×10=200', '20×3=60', '4×10=40', '4×3=12'],
    total: '200+60+40+12=312',
    rows: '竖式里：24×3=72 是第一行，24×10=240 是第二行——240 就是 200+40 那两块。' }
];
let m2ProbIdx = 0;
const m2Rev = [false, false, false, false];
function m2Render() {
  const p = M2_PROBS[m2ProbIdx];
  for (let i = 0; i < 4; i++) {
    const b = document.getElementById('m2B' + i);
    b.textContent = m2Rev[i] ? p.blocks[i] : p.blocks[i].split('=')[0];
  }
  document.getElementById('m2Eq').textContent = p.a + ' × ' + p.b + ' = ?';
  document.getElementById('m2Msg').textContent = m2Rev.every(Boolean)
    ? p.total + '。' + p.rows
    : '点一块，看它是多少；四块都点开，就能加出答案。';
  document.querySelectorAll('#m2ProbSeg [data-m2-prob]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.m2Prob === m2ProbIdx));
  });
}
(function m2Init() {
  const seg = document.getElementById('m2ProbSeg');
  M2_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = p.a + ' × ' + p.b;
    b.dataset.m2Prob = String(i);
    b.addEventListener('click', function () {
      m2ProbIdx = i;
      for (let j = 0; j < 4; j++) m2Rev[j] = false;
      m2Render();
    });
    seg.appendChild(b);
  });
  for (let i = 0; i < 4; i++) {
    document.getElementById('m2B' + i).addEventListener('click', function () {
      m2Rev[i] = true;
      markTried('fourgrid');
      m2Render();
    });
  }
  m2Render();
})();

/* ---------- demo-area · 3.12 面积（方法：数方格 → 公式） ----------
   长方形面积 = 长 × 宽：长 5 格、宽 3 格，一共 15 块小方砖，面积 15 平方厘米。
   周长是围一圈：(5+3)×2=14 厘米。1 平方米 = 100×100 = 10000 平方厘米。 */
let arLen = 5;
let arWid = 3;
let arShowPerim = false;
function arRender() {
  const grid = document.getElementById('arGrid');
  for (let i = 0; i < grid.children.length; i++) {
    const r = Math.floor(i / 8);
    const c = i % 8;
    grid.children[i].classList.toggle('ar-on', r < arWid && c < arLen);
  }
  document.getElementById('arLenTx').textContent = '长 ' + arLen + ' 格';
  document.getElementById('arWidTx').textContent = '宽 ' + arWid + ' 格';
  document.getElementById('arReadout').textContent = '长 ' + arLen + ' 格，宽 ' + arWid + ' 格，一共 ' + (arLen * arWid) + ' 块小方砖，面积是 ' + (arLen * arWid) + ' 平方厘米。';
  document.getElementById('arMsg').textContent = arShowPerim
    ? '围一圈是 (' + arLen + '+' + arWid + ')×2=' + ((arLen + arWid) * 2) + ' 厘米——周长是边，面积是面，别弄混。'
    : '面积是里面能铺几块方砖：' + arWid + ' 行，每行 ' + arLen + ' 块。';
  document.getElementById('arPerim').textContent = arShowPerim ? '收起周长' : '围一围，看周长';
}
(function arInit() {
  const grid = document.getElementById('arGrid');
  for (let i = 0; i < 64; i++) {
    const d = document.createElement('span');
    d.className = 'ar-cell';
    grid.appendChild(d);
  }
  document.getElementById('arLenMinus').addEventListener('click', function () { if (arLen > 1) arLen--; markTried('area'); arRender(); });
  document.getElementById('arLenPlus').addEventListener('click', function () { if (arLen < 8) arLen++; markTried('area'); arRender(); });
  document.getElementById('arWidMinus').addEventListener('click', function () { if (arWid > 1) arWid--; markTried('area'); arRender(); });
  document.getElementById('arWidPlus').addEventListener('click', function () { if (arWid < 8) arWid++; markTried('area'); arRender(); });
  document.getElementById('arPerim').addEventListener('click', function () { arShowPerim = !arShowPerim; markTried('area'); arRender(); });
  arRender();
})();

/* ---------- demo-calendar · 3.13 年、月、日（方法：日历探索 + 指节口诀 + 24 小时时间轴） ----------
   大月 31 天（1、3、5、7、8、10、12 月），小月 30 天（4、6、9、11 月），
   2 月平年 28 天、闰年 29 天。2024 年是闰年，2025 年是平年。
   24 时：下午 3:00 是 15:00，夜里 11:00 是 23:00。 */
const CA_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const CA_BIG = [1, 3, 5, 7, 8, 10, 12];
let caMonth = 3;
let caLeap = true; // 2024 年闰年
function caRender() {
  const days = caMonth === 2 ? (caLeap ? 29 : 28) : CA_DAYS[caMonth - 1];
  const kind = caMonth === 2
    ? (caLeap ? '2024 年是闰年' : '2025 年是平年')
    : (CA_BIG.indexOf(caMonth) >= 0 ? '大月' : '小月');
  document.getElementById('caReadout').textContent = caMonth + ' 月是' + kind + '，有 ' + days + ' 天。';
  document.getElementById('caKnuckle').textContent = caMonth === 2
    ? '2 月单独记：平年 28 天，闰年 29 天。'
    : (CA_BIG.indexOf(caMonth) >= 0
      ? '握起拳头数一数：凸起来的月份是 31 天——' + caMonth + ' 月是凸起来的。'
      : '握起拳头数一数：凹下去的月份是 30 天——' + caMonth + ' 月是凹下去的。');
  document.querySelectorAll('#caMonthSeg [data-ca-month]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.caMonth === caMonth));
  });
  document.querySelectorAll('#caYearSeg [data-ca-leap]').forEach(function (b) {
    b.setAttribute('aria-pressed', String((b.dataset.caLeap === '1') === caLeap));
  });
}
(function caInit() {
  const mseg = document.getElementById('caMonthSeg');
  for (let m = 1; m <= 12; m++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = m + ' 月';
    b.dataset.caMonth = String(m);
    b.addEventListener('click', function () { caMonth = m; markTried('calendar'); caRender(); });
    mseg.appendChild(b);
  }
  const yseg = document.getElementById('caYearSeg');
  [['2024 年（闰年）', true], ['2025 年（平年）', false]].forEach(function (y) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = y[0];
    b.dataset.caLeap = y[1] ? '1' : '0';
    b.addEventListener('click', function () { caLeap = y[1]; markTried('calendar'); caRender(); });
    yseg.appendChild(b);
  });
  const tseg = document.getElementById('caTimeSeg');
  [['上午 9:00', '9:00', '上午的时间不用加 12。'], ['下午 3:00', '15:00', '下午的时间加 12：3+12=15。'], ['夜里 11:00', '23:00', '夜里 11 点是 23 时：11+12=23。'], ['凌晨 1:00', '1:00', '凌晨的时间不用加 12。']].forEach(function (t) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = t[0];
    b.addEventListener('click', function () {
      markTried('calendar');
      document.getElementById('caTimeReadout').textContent = t[0] + ' 用 24 时计时法是 ' + t[1] + '。' + t[2];
    });
    tseg.appendChild(b);
  });
  caRender();
})();

/* ---------- demo-decimal · 3.14 小数的初步认识（方法：钱 + 十分条） ----------
   0.5 是 5 个十分之一，0.25 是 2 个十分之一、5 个百分之一。
   比较小数先比十分位，十分位一样再比百分位：0.5 比 0.25 大。 */
let dcA = 50; // 以百分之一为单位：0.50
let dcB = 25; // 0.25
function dcFmt(v) {
  const t = Math.floor(v / 10), h = v % 10;
  return '0.' + t + (h === 0 ? '' : String(h));
}
function dcWords(v) {
  const t = Math.floor(v / 10), h = v % 10;
  return t + ' 个十分之一' + (h === 0 ? '' : '、' + h + ' 个百分之一');
}
function dcRenderBar(barId, v) {
  const bar = document.getElementById(barId);
  for (let i = 0; i < bar.children.length; i++) {
    const c = bar.children[i];
    c.classList.toggle('dc-on', i < Math.floor(v / 10));
    c.classList.toggle('dc-half', i === Math.floor(v / 10) && v % 10 !== 0);
  }
}
function dcRender() {
  dcRenderBar('dcBarA', dcA);
  dcRenderBar('dcBarB', dcB);
  document.getElementById('dcReadA').textContent = 'A 是 ' + dcFmt(dcA) + '：' + dcWords(dcA);
  document.getElementById('dcReadB').textContent = 'B 是 ' + dcFmt(dcB) + '：' + dcWords(dcB);
}
function dcCompare() {
  const ta = Math.floor(dcA / 10), tb = Math.floor(dcB / 10);
  let msg;
  if (ta !== tb) {
    msg = ta > tb
      ? dcFmt(dcA) + ' 大：先比十分位，' + ta + ' 比 ' + tb + ' 大。'
      : dcFmt(dcB) + ' 大：先比十分位，' + tb + ' 比 ' + ta + ' 大。';
  } else {
    const ha = dcA % 10, hb = dcB % 10;
    msg = ha === hb
      ? '一样大：十分位都是 ' + ta + '，百分位也一样——' + dcFmt(dcA) + ' 和 ' + dcFmt(dcB) + ' 相等。'
      : ha > hb
        ? dcFmt(dcA) + ' 大：十分位一样，再比百分位，' + ha + ' 比 ' + hb + ' 大。'
        : dcFmt(dcB) + ' 大：十分位一样，再比百分位，' + hb + ' 比 ' + ha + ' 大。';
  }
  document.getElementById('dcMsg').textContent = msg;
}
(function dcInit() {
  ['dcBarA', 'dcBarB'].forEach(function (id) {
    const bar = document.getElementById(id);
    for (let i = 0; i < 10; i++) {
      const d = document.createElement('span');
      d.className = 'dc-cell';
      bar.appendChild(d);
    }
  });
  document.getElementById('dcAMinus').addEventListener('click', function () { if (dcA > 10) dcA -= 10; markTried('decimal'); dcRender(); });
  document.getElementById('dcAPlus').addEventListener('click', function () { if (dcA < 90) dcA += 10; markTried('decimal'); dcRender(); });
  document.getElementById('dcBMinus').addEventListener('click', function () { if (dcB > 5) dcB -= 5; markTried('decimal'); dcRender(); });
  document.getElementById('dcBPlus').addEventListener('click', function () { if (dcB < 95) dcB += 5; markTried('decimal'); dcRender(); });
  document.getElementById('dcCompare').addEventListener('click', function () { markTried('decimal'); dcCompare(); });
  dcRender();
  dcCompare();
})();

/* ---------- demo-bignum · 4.1 大数的认识、近似数（方法：万分组数位表 + 数轴半点） ----------
   48932 离 5万近（差 1068）离 4万远（差 8932），约是 5万；
   62850 离 6万近（差 2850），约是 6万；75000 正好在半点上，满 5 进 1，约是 8万。 */
const BN_PROBS = [
  { n: 48932, low: 40000, high: 50000, ans: '5万', read: '四万八千九百三十二',
    why: '要舍掉 8932，第一位是 8，满 5 进 1' },
  { n: 62850, low: 60000, high: 70000, ans: '6万', read: '六万二千八百五十',
    why: '要舍掉 2850，第一位是 2，不到 5，舍掉' },
  { n: 75000, low: 70000, high: 80000, ans: '8万', read: '七万五千',
    why: '要舍掉 5000，第一位是 5，正好是半点，满 5 进 1' }
];
let bnProbIdx = 0;
let bnVal = 48932;
function bnRender() {
  const p = BN_PROBS[bnProbIdx];
  const pct = Math.max(0, Math.min(100, (bnVal - p.low) / (p.high - p.low) * 100));
  document.getElementById('bnMarker').style.left = pct + '%';
  const dLow = bnVal - p.low, dHigh = p.high - bnVal;
  const lowWan = p.low / 10000, highWan = p.high / 10000;
  document.getElementById('bnNear').textContent = dLow === dHigh
    ? bnVal + ' 正好在半点上，离 ' + lowWan + '万和 ' + highWan + '万一样远。'
    : dLow < dHigh
      ? bnVal + ' 离 ' + lowWan + '万更近（差 ' + dLow + '），离 ' + highWan + '万差 ' + dHigh + '。'
      : bnVal + ' 离 ' + highWan + '万更近（差 ' + dHigh + '），离 ' + lowWan + '万差 ' + dLow + '。';
  document.getElementById('bnRead').textContent = '读作：' + p.read + '。万级是 ' + Math.floor(p.n / 10000) + '，个级是 ' + (p.n % 10000) + '。';
  document.getElementById('bnTicks').textContent = p.low + '　' + ((p.low + p.high) / 2) + '（半点）　' + p.high;
  document.querySelectorAll('#bnProbSeg [data-bn-prob]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.bnProb === bnProbIdx));
  });
}
(function bnInit() {
  const seg = document.getElementById('bnProbSeg');
  BN_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = String(p.n);
    b.dataset.bnProb = String(i);
    b.addEventListener('click', function () {
      bnProbIdx = i; bnVal = p.n;
      const sl = document.getElementById('bnSlider');
      sl.min = String(p.low); sl.max = String(p.high); sl.value = String(p.n);
      markTried('bignum');
      bnRender();
    });
    seg.appendChild(b);
  });
  document.getElementById('bnSlider').addEventListener('input', function (e) {
    bnVal = +e.target.value;
    bnRender();
  });
  document.getElementById('bnRound').addEventListener('click', function () {
    const p = BN_PROBS[bnProbIdx];
    markTried('bignum');
    document.getElementById('bnMsg').textContent = p.n + ' 省略万后面的尾数，约是 ' + p.ans + '：' + p.why + '。';
  });
  bnRender();
})();

/* ---------- demo-field · 4.2 公顷和平方千米（方法：操场基准——足球场叠加） ----------
   1 个足球场约 1 公顷 = 10000 平方米；100 个足球场 = 100 公顷 = 1 平方千米。 */
let fdCount = 1;
function fdRender() {
  const grid = document.getElementById('fdGrid');
  for (let i = 0; i < grid.children.length; i++) {
    grid.children[i].classList.toggle('fd-on', i < fdCount);
  }
  document.getElementById('fdCountTx').textContent = fdCount + ' 个足球场';
  document.getElementById('fdReadout').textContent = fdCount + ' 个足球场 = ' + fdCount + ' 公顷 = ' + (fdCount * 10000) + ' 平方米' +
    (fdCount === 100 ? '——100 公顷就是 1 平方千米！' : '；100 个足球场拼起来才是 1 平方千米。');
}
(function fdInit() {
  const grid = document.getElementById('fdGrid');
  for (let i = 0; i < 100; i++) {
    const d = document.createElement('span');
    d.className = 'fd-cell';
    grid.appendChild(d);
  }
  document.getElementById('fdMinus').addEventListener('click', function () { if (fdCount > 1) fdCount--; markTried('field'); fdRender(); });
  document.getElementById('fdPlus').addEventListener('click', function () { if (fdCount < 100) fdCount++; markTried('field'); fdRender(); });
  fdRender();
})();

/* ---------- demo-protractor · 4.3 角的度量（方法：角即旋转——量角器） ----------
   中心对顶点，0 对一边，读数从 0 开始的那一圈；边画长画短，角度数一点不变。 */
let prDeg = 30;
let prLong = true;
function prKind(d) { return d < 90 ? '锐角' : d === 90 ? '直角' : d < 180 ? '钝角' : '平角'; }
function prRender() {
  const cx = 150, cy = 160, len = prLong ? 120 : 70;
  const rad = prDeg * Math.PI / 180;
  const ex = cx + len * Math.cos(rad), ey = cy - len * Math.sin(rad);
  const arm = document.getElementById('prArm');
  arm.setAttribute('x2', String(Math.round(ex)));
  arm.setAttribute('y2', String(Math.round(ey)));
  // 扇形用取样多边形画，不用 arc（省得记 sweep 方向）：从 0° 到当前角，每 5° 取一个点。
  const pts = [cx + ',' + cy];
  for (let a = 0; a <= prDeg; a += 5) {
    const r = a * Math.PI / 180;
    pts.push(Math.round(cx + len * Math.cos(r)) + ',' + Math.round(cy - len * Math.sin(r)));
  }
  document.getElementById('prWedge').setAttribute('points', pts.join(' '));
  document.getElementById('prRead').textContent = prDeg + '°，是' + prKind(prDeg) + '。';
  document.querySelectorAll('#prSeg [data-pr-deg]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.prDeg === prDeg));
  });
}
(function prInit() {
  const seg = document.getElementById('prSeg');
  [30, 45, 65, 90, 130, 180].forEach(function (d) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = d + '°';
    b.dataset.prDeg = String(d);
    b.addEventListener('click', function () { prDeg = d; markTried('protractor'); prRender(); });
    seg.appendChild(b);
  });
  document.getElementById('prMinus').addEventListener('click', function () { if (prDeg > 5) prDeg -= 5; markTried('protractor'); prRender(); });
  document.getElementById('prPlus').addEventListener('click', function () { if (prDeg < 180) prDeg += 5; markTried('protractor'); prRender(); });
  document.getElementById('prLen').addEventListener('click', function () {
    prLong = !prLong;
    markTried('protractor');
    prRender();
    document.getElementById('prMsg').textContent = '边' + (prLong ? '画长了' : '画短了') + '，角度还是 ' + prDeg + '°——角的大小只看张开多少，不看边长。';
  });
  prRender();
})();

/* ---------- demo-areamodel · 4.4 三位数乘两位数（方法：面积模型拆两边） ----------
   123×45：45=40+5，123×40=4920，123×5=615，4920+615=5535。
   138×24：138×20=2760，138×4=552，和 3312。125×16：125×10=1250，125×6=750，和 2000。 */
const AM_PROBS = [
  { a: 123, b: 45, s: 40, r: 5, blocks: ['123×40=4920', '123×5=615'], total: '4920+615=5535',
    note: '竖式第二行是 123×40=4920——那个 0 就是乘 40 的意思。' },
  { a: 138, b: 24, s: 20, r: 4, blocks: ['138×20=2760', '138×4=552'], total: '2760+552=3312',
    note: '竖式第二行是 138×20=2760。' },
  { a: 125, b: 16, s: 10, r: 6, blocks: ['125×10=1250', '125×6=750'], total: '1250+750=2000',
    note: '125×16 拆成 125×10 和 125×6。' }
];
let amProbIdx = 0;
const amRev = [false, false];
function amRender() {
  const p = AM_PROBS[amProbIdx];
  for (let i = 0; i < 2; i++) {
    const b = document.getElementById('amB' + i);
    b.textContent = amRev[i] ? p.blocks[i] : (i === 0 ? p.a + '×' + p.s : p.a + '×' + p.r);
  }
  document.getElementById('amEq').textContent = p.a + ' × ' + p.b + ' = ?';
  document.getElementById('amSplit0').style.width = (p.s / p.b * 100) + '%';
  document.getElementById('amSplit1').style.width = (p.r / p.b * 100) + '%';
  document.getElementById('amSplit0').textContent = String(p.s);
  document.getElementById('amSplit1').textContent = String(p.r);
  document.getElementById('amMsg').textContent = amRev[0] && amRev[1]
    ? p.total + '。' + p.note
    : '点一块，看它是多少；两块都点开，就能加出答案。';
  document.querySelectorAll('#amProbSeg [data-am-prob]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.amProb === amProbIdx));
  });
}
(function amInit() {
  const seg = document.getElementById('amProbSeg');
  AM_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = p.a + ' × ' + p.b;
    b.dataset.amProb = String(i);
    b.addEventListener('click', function () { amProbIdx = i; amRev[0] = amRev[1] = false; markTried('areamodel'); amRender(); });
    seg.appendChild(b);
  });
  for (let i = 0; i < 2; i++) {
    document.getElementById('amB' + i).addEventListener('click', function () { amRev[i] = true; markTried('areamodel'); amRender(); });
  }
  amRender();
})();

/* ---------- demo-parallelogram · 4.5 平行四边形和梯形（方法：拖顶点看不变性） ----------
   平行四边形两组对边分别平行；长方形、正方形是特殊的平行四边形；梯形只有一组对边平行。 */
const PG_SHAPES = {
  par: { label: '平行四边形', pairs: 2, text: '平行四边形：两组对边分别平行，对边一样长。推一推，形状变了，对边还是平行的。' },
  rect: { label: '长方形', pairs: 2, text: '长方形：两组对边分别平行，四个角都是直角——长方形是特殊的平行四边形。' },
  square: { label: '正方形', pairs: 2, text: '正方形：两组对边分别平行，四条边一样长——正方形也是特殊的平行四边形。' },
  trap: { label: '梯形', pairs: 1, text: '梯形：只有一组对边平行——所以梯形不是平行四边形。' }
};
let pgShape = 'par';
let pgSlant = 30;
function pgPoints() {
  if (pgShape === 'rect') return '60,30 260,30 260,140 60,140';
  if (pgShape === 'square') return '110,30 220,30 220,140 110,140';
  if (pgShape === 'trap') return '100,30 220,30 270,140 50,140';
  const s = pgSlant;
  return (60 + s) + ',30 ' + (260 + s) + ',30 260,140 60,140';
}
function pgRender() {
  document.getElementById('pgPoly').setAttribute('points', pgPoints());
  const sh = PG_SHAPES[pgShape];
  document.getElementById('pgRead').textContent = sh.text;
  document.getElementById('pgMsg').textContent = '对边平行的组数：' + sh.pairs + ' 组。' +
    (sh.pairs === 2 ? '两组对边都平行，所以是平行四边形。' : '只有一组对边平行，所以不是平行四边形。');
  document.querySelectorAll('#pgShapeSeg [data-pg-shape]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(b.dataset.pgShape === pgShape));
  });
}
(function pgInit() {
  const seg = document.getElementById('pgShapeSeg');
  Object.keys(PG_SHAPES).forEach(function (k) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = PG_SHAPES[k].label;
    b.dataset.pgShape = k;
    b.addEventListener('click', function () { pgShape = k; markTried('parallelogram'); pgRender(); });
    seg.appendChild(b);
  });
  document.getElementById('pgSlantMinus').addEventListener('click', function () { if (pgShape === 'par' && pgSlant > 0) pgSlant -= 10; markTried('parallelogram'); pgRender(); });
  document.getElementById('pgSlantPlus').addEventListener('click', function () { if (pgShape === 'par' && pgSlant < 50) pgSlant += 10; markTried('parallelogram'); pgRender(); });
  pgRender();
})();

/* ---------- demo-trialdiv · 4.6 除数是两位数的除法（方法：试商面板） ----------
   150÷26 试 7：7×26=182 比 150 大，调小试 5：5×26=130，余 20，商是 5 余 20。
   161÷23=7；312÷39=8；96÷12=8。 */
const TD_PROBS = [
  { d: 150, v: 26, g: 7 },
  { d: 161, v: 23, g: 5 },
  { d: 312, v: 39, g: 6 },
  { d: 96, v: 12, g: 6 }
];
let tdProbIdx = 0;
let tdGuess = 7;
function tdRender() {
  const p = TD_PROBS[tdProbIdx];
  document.getElementById('tdEq').textContent = p.d + ' ÷ ' + p.v + ' = ?';
  document.getElementById('tdGuessTx').textContent = '试商：' + tdGuess;
  document.querySelectorAll('#tdProbSeg [data-td-prob]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.tdProb === tdProbIdx));
  });
}
function tdCheck() {
  const p = TD_PROBS[tdProbIdx];
  const prod = tdGuess * p.v;
  let msg;
  if (prod > p.d) {
    msg = tdGuess + '×' + p.v + '=' + prod + '，比 ' + p.d + ' 大——商大了，调小一点再试。';
  } else {
    const rem = p.d - prod;
    msg = rem >= p.v
      ? tdGuess + '×' + p.v + '=' + prod + '，余 ' + rem + '，余数比除数 ' + p.v + ' 还大——商小了，调大一点再试。'
      : '商是 ' + tdGuess + (rem === 0 ? '，正好除尽：' + tdGuess + '×' + p.v + '=' + p.d + '。' : '，余 ' + rem + '：' + tdGuess + '×' + p.v + '=' + prod + '，' + p.d + '−' + prod + '=' + rem + '。');
  }
  document.getElementById('tdMsg').textContent = msg;
}
(function tdInit() {
  const seg = document.getElementById('tdProbSeg');
  TD_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = p.d + ' ÷ ' + p.v;
    b.dataset.tdProb = String(i);
    b.addEventListener('click', function () { tdProbIdx = i; tdGuess = p.g; markTried('trialdiv'); tdRender(); });
    seg.appendChild(b);
  });
  document.getElementById('tdMinus').addEventListener('click', function () { if (tdGuess > 1) tdGuess--; markTried('trialdiv'); tdRender(); });
  document.getElementById('tdPlus').addEventListener('click', function () { if (tdGuess < 20) tdGuess++; markTried('trialdiv'); tdRender(); });
  document.getElementById('tdCheck').addEventListener('click', function () { markTried('trialdiv'); tdCheck(); });
  tdRender();
})();

/* ---------- demo-baraxis · 4.7 条形统计图（方法：可拖坐标轴起点） ----------
   男生 28 人，女生 24 人，只少 4 个人；纵轴从 20 开始，女生条看着只有男生条一半高——轴在说谎。 */
let baStart = 0;
function baRender() {
  const max = 30;
  const hM = (28 - baStart) / (max - baStart) * 200;
  const hF = (24 - baStart) / (max - baStart) * 200;
  document.getElementById('baBarM').style.height = Math.round(hM) + 'px';
  document.getElementById('baBarF').style.height = Math.round(hF) + 'px';
  document.getElementById('baMsg').textContent = baStart === 0
    ? '轴从 0 开始：女生条比男生条矮一点，矮的正好是 4 个人——图说的是实话。'
    : baStart === 10
      ? '轴从 10 开始：女生条看着比男生条矮不少——其实只少 4 个人，轴已经开始“说谎”了。'
      : '轴从 20 开始：女生条只有男生条的一半高，看着像少了一半——其实只少 4 个人，轴在说谎！';
  document.querySelectorAll('#baStartSeg [data-ba-start]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.baStart === baStart));
  });
}
(function baInit() {
  const seg = document.getElementById('baStartSeg');
  [0, 10, 20].forEach(function (s) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = '从 ' + s + ' 开始';
    b.dataset.baStart = String(s);
    b.addEventListener('click', function () { baStart = s; markTried('baraxis'); baRender(); });
    seg.appendChild(b);
  });
  baRender();
})();

/* ---------- demo-teatime · 4.8 优化（方法：并行时间轴） ----------
   沏茶一件一件做要 14 分钟；烧水的 8 分钟里洗茶杯、找茶叶，总共只要 11 分钟。
   烙饼：1 张 2 分钟，3 张 3 分钟，5 张 5 分钟，9 张 9 分钟。 */
let ttWash = false;
let ttTea = false;
let ttCakes = 3;
function ttTotal() { return 11 + (ttWash ? 0 : 2) + (ttTea ? 0 : 1); }
function ttRenderLane(laneId, tasks) {
  const lane = document.getElementById(laneId);
  while (lane.firstChild) lane.removeChild(lane.firstChild);
  tasks.forEach(function (t) {
    const s = document.createElement('span');
    s.className = 'tt-task';
    s.style.width = (t.min * 22) + 'px';
    s.style.background = t.color;
    s.textContent = t.name + ' ' + t.min + '分';
    lane.appendChild(s);
  });
}
function ttRender() {
  ttRenderLane('ttLaneA', [
    { name: '洗水壶', min: 1, color: '#dbeafe' }, { name: '接水', min: 1, color: '#dbeafe' },
    { name: '烧水', min: 8, color: '#fed7aa' }, { name: '沏茶', min: 1, color: '#dcfce7' }
  ]);
  ttRenderLane('ttLaneB', ttWash || ttTea
    ? (ttWash ? [{ name: '洗茶杯', min: 2, color: '#fce7f3' }] : []).concat(ttTea ? [{ name: '找茶叶', min: 1, color: '#fce7f3' }] : [])
    : [{ name: '（烧水时空闲着）', min: 8, color: '#f1f5f9' }]);
  document.getElementById('ttTotal').textContent = '一共 ' + ttTotal() + ' 分钟';
  document.getElementById('ttMsg').textContent = ttWash && ttTea
    ? '11 分钟！烧水的 8 分钟里，洗茶杯和找茶叶都做完了——同时做的事只算一次时间。'
    : ttWash || ttTea
      ? ttTotal() + ' 分钟：还有一件小事没挪进烧水的时间里，再挪进来还能省。'
      : '一件一件做要 14 分钟：洗水壶 1 + 接水 1 + 烧水 8 + 洗茶杯 2 + 找茶叶 1 + 沏茶 1。';
  document.getElementById('ttWashBtn').setAttribute('aria-pressed', String(ttWash));
  document.getElementById('ttTeaBtn').setAttribute('aria-pressed', String(ttTea));
  const mins = ttCakes === 1 ? 2 : ttCakes;
  document.getElementById('ttCakeMsg').textContent = ttCakes === 1
    ? '1 张饼要 2 分钟：两面各烙 1 分钟，不能只算 1 分钟。'
    : ttCakes + ' 张饼要 ' + mins + ' 分钟：' + ttCakes + '×2=' + (ttCakes * 2) + ' 面次，每次烙 2 面，' + (ttCakes * 2) + '÷2=' + mins + ' 分钟。';
  document.querySelectorAll('#ttCakeSeg [data-tt-cakes]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.ttCakes === ttCakes));
  });
}
(function ttInit() {
  document.getElementById('ttWashBtn').addEventListener('click', function () { ttWash = !ttWash; markTried('teatime'); ttRender(); });
  document.getElementById('ttTeaBtn').addEventListener('click', function () { ttTea = !ttTea; markTried('teatime'); ttRender(); });
  const seg = document.getElementById('ttCakeSeg');
  [1, 3, 5, 9].forEach(function (n) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = n + ' 张饼';
    b.dataset.ttCakes = String(n);
    b.addEventListener('click', function () { ttCakes = n; markTried('teatime'); ttRender(); });
    seg.appendChild(b);
  });
  ttRender();
})();

/* ---------- demo-zerodiv · 4.9 四则运算（方法：逆运算证伪） ----------
   5÷0 在问“什么数乘 0 等于 5”：0 到 9 都试一遍，没有一个乘 0 等于 5，所以没有答案。
   0÷5=0；0÷0 没法确定，任何数乘 0 都是 0。 */
const zdTried = new Set();
function zdRender() {
  document.querySelectorAll('#zdNumSeg [data-zd-num]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(zdTried.has(+b.dataset.zdNum)));
  });
}
(function zdInit() {
  const seg = document.getElementById('zdNumSeg');
  for (let n = 0; n <= 9; n++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = String(n);
    b.dataset.zdNum = String(n);
    b.addEventListener('click', function () {
      zdTried.add(n);
      markTried('zerodiv');
      document.getElementById('zdMsg').textContent = n + ' × 0 = 0，不等于 5。' +
        (zdTried.size === 10
          ? '10 个数都试过了，没有一个乘 0 等于 5——所以 5÷0 没有答案。'
          : '已经试了 ' + zdTried.size + ' 个数。');
      zdRender();
    });
    seg.appendChild(b);
  }
  document.getElementById('zdDivFive').addEventListener('click', function () {
    markTried('zerodiv');
    document.getElementById('zdMsg').textContent = '0÷5=0：因为 0×5=0，0 除以 5 就是 0。';
  });
  document.getElementById('zdDivZero').addEventListener('click', function () {
    markTried('zerodiv');
    document.getElementById('zdMsg').textContent = '0÷0 没法确定：任何数乘 0 都是 0，答案有无数个。';
  });
  zdRender();
})();

/* ---------- demo-laws · 4.10 运算定律（方法：每条定律一个动画） ----------
   交换律：3×4 的点阵转个方向是 4×3，点还是 12 个。
   结合律：25×7×4，先算 25×4=100 再乘 7 是 700，先算 7×4=28 再乘 25 也是 700。
   分配律：102×36=(100+2)×36=3600+72=3672。 */
let lwMode = 'mul';
let lwRows = 3, lwCols = 4;
const LW_PANELS = { mul: 'lwPanelmul', assoc: 'lwPanelassoc', dist: 'lwPaneldist' };
function lwRender() {
  Object.keys(LW_PANELS).forEach(function (m) {
    document.getElementById(LW_PANELS[m]).hidden = lwMode !== m;
  });
  document.querySelectorAll('#lwModeSeg [data-lw-mode]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(b.dataset.lwMode === lwMode));
  });
  const grid = document.getElementById('lwDots');
  for (let i = 0; i < grid.children.length; i++) {
    const r = Math.floor(i / 4), c = i % 4;
    grid.children[i].classList.toggle('off', !(r < lwRows && c < lwCols));
  }
  document.getElementById('lwEq').textContent = lwRows + ' × ' + lwCols + ' = ' + (lwRows * lwCols);
}
(function lwInit() {
  const seg = document.getElementById('lwModeSeg');
  [['mul', '交换律'], ['assoc', '结合律'], ['dist', '分配律']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = m[1];
    b.dataset.lwMode = m[0];
    b.addEventListener('click', function () { lwMode = m[0]; markTried('laws'); lwRender(); });
    seg.appendChild(b);
  });
  const grid = document.getElementById('lwDots');
  for (let i = 0; i < 16; i++) {
    const d = document.createElement('span');
    d.className = 'lw-dot';
    grid.appendChild(d);
  }
  document.getElementById('lwRotate').addEventListener('click', function () {
    const t = lwRows; lwRows = lwCols; lwCols = t;
    markTried('laws');
    lwRender();
    document.getElementById('lwMsg').textContent = '转个方向：' + lwRows + '×' + lwCols + '，点还是 ' + (lwRows * lwCols) + ' 个——所以 3×4 和 4×3 是一道题。';
  });
  document.getElementById('lwAssocA').addEventListener('click', function () {
    markTried('laws');
    document.getElementById('lwAssocMsg').textContent = '先算 25×4=100，再算 100×7=700。25 和 4 先凑成整百，算起来最快。';
  });
  document.getElementById('lwAssocB').addEventListener('click', function () {
    markTried('laws');
    document.getElementById('lwAssocMsg').textContent = '先算 7×4=28，再算 25×28=700。两种算法都是 700——先算哪一堆，结果都一样。';
  });
  const lwDistRev = [false, false];
  function lwDistRender() {
    document.getElementById('lwDistA').textContent = lwDistRev[0] ? '100×36=3600' : '100×36';
    document.getElementById('lwDistB').textContent = lwDistRev[1] ? '2×36=72' : '2×36';
    document.getElementById('lwDistMsg').textContent = lwDistRev[0] && lwDistRev[1]
      ? '3600+72=3672，所以 102×36=3672。102 拆成 100+2，每一块都要乘 36。'
      : '点一块，看它是多少；两块都点开，就能加出答案。';
  }
  document.getElementById('lwDistA').addEventListener('click', function () { lwDistRev[0] = true; markTried('laws'); lwDistRender(); });
  document.getElementById('lwDistB').addEventListener('click', function () { lwDistRev[1] = true; markTried('laws'); lwDistRender(); });
  lwRender();
  lwDistRender();
})();

/* ---------- demo-placeslider · 4.11 小数的意义和性质（方法：数位滑块） ----------
   乘 10：每位数字向左移一位，2.4→24→240；除以 10：向右移一位，2.4→0.24→0.024。
   0.5=0.50：5 个十分之一就是 50 个百分之一。 */
let psDecPos = 1; // 小数点在第几位数字后面：2.4 是 1
const PS_DIGITS = ['2', '4'];
let psLastOp = '';
function psValueStr() {
  const d = PS_DIGITS.join('');
  if (psDecPos >= d.length) return d + '0'.repeat(psDecPos - d.length);
  if (psDecPos <= 0) return '0.' + '0'.repeat(-psDecPos) + d;
  return d.slice(0, psDecPos) + '.' + d.slice(psDecPos);
}
function psRender() {
  const v = psValueStr();
  const parts = v.split('.');
  const intP = parts[0], fracP = parts[1] || '';
  const intCells = [document.getElementById('psC0'), document.getElementById('psC1'), document.getElementById('psC2')];
  const fracCells = [document.getElementById('psC3'), document.getElementById('psC4'), document.getElementById('psC5')];
  const intPad = intP.padStart(3, ' ');
  for (let i = 0; i < 3; i++) intCells[i].textContent = intPad[i] === ' ' ? '' : intPad[i];
  for (let i = 0; i < 3; i++) fracCells[i].textContent = fracP[i] || '';
  document.getElementById('psRead').textContent = '现在是 ' + v + '。' +
    (psLastOp === 'mul' ? '乘 10：每位数字向左移一位，小数点不用动。'
      : psLastOp === 'div' ? '除以 10：每位数字向右移一位，小数点不用动。'
      : '滑一滑：2.4 乘 10 是 24，除以 10 是 0.24。');
}
(function psInit() {
  document.getElementById('psMul').addEventListener('click', function () { if (psDecPos < 3) psDecPos++; psLastOp = 'mul'; markTried('placeslider'); psRender(); });
  document.getElementById('psDiv').addEventListener('click', function () { if (psDecPos > -1) psDecPos--; psLastOp = 'div'; markTried('placeslider'); psRender(); });
  const bar = document.getElementById('psBar');
  for (let i = 0; i < 10; i++) {
    const d = document.createElement('span');
    d.className = 'ps-tiny' + (i < 5 ? ' on' : '');
    bar.appendChild(d);
  }
  const mini = document.getElementById('psMini');
  for (let i = 0; i < 100; i++) {
    const d = document.createElement('span');
    d.className = 'ps-mini-cell' + (i < 50 ? ' on' : '');
    mini.appendChild(d);
  }
  mini.hidden = true;
  document.getElementById('psSplit').addEventListener('click', function () {
    mini.hidden = !mini.hidden;
    markTried('placeslider');
    document.getElementById('psSplitMsg').textContent = mini.hidden ? '' : '5 个十分之一就是 50 个百分之一——0.5 和 0.50 一样大，涂色的地方一点没变。';
  });
  psRender();
})();

/* ---------- demo-tearangle · 4.12 三角形（方法：撕角拼直线 + 棍长测试） ----------
   60°+70°+50°=180°，90°+45°+45°=180°：三个角拼成一条直线，就是平角 180°。
   2 厘米、3 厘米、10 厘米围不成三角形：2+3=5，比 10 短。
   三角形的三个顶点按角度算出来（正弦定理），不是随手画的：底边 180，
   顶点 = 底边左端 + 第三边 × (cos B, −sin B)，第三边 = 底边 × sin C / sin A。 */
const TA_PROBS = [
  { a: 60, b: 70, c: 50, kind: '锐角三角形' },
  { a: 90, b: 45, c: 45, kind: '直角三角形' }
];
let taProbIdx = 0;
const taTorn = [false, false, false];
function taSectorPoints(cx, cy, r, deg1, deg2) {
  const pts = [cx + ',' + cy];
  for (let d = deg1; d >= deg2; d -= 5) {
    const rad = d * Math.PI / 180;
    pts.push(Math.round(cx + r * Math.cos(rad)) + ',' + Math.round(cy - r * Math.sin(rad)));
  }
  return pts.join(' ');
}
function taTriPoints() {
  const p = TA_PROBS[taProbIdx];
  const rad = function (d) { return d * Math.PI / 180; };
  const base = 180, bx = 35, by = 175;
  const cSide = base * Math.sin(rad(p.c)) / Math.sin(rad(p.a));
  const ax = bx + cSide * Math.cos(rad(p.b));
  const ay = by - cSide * Math.sin(rad(p.b));
  return { A: [Math.round(ax), Math.round(ay)], B: [bx, by], C: [bx + base, by] };
}
function taRender() {
  const p = TA_PROBS[taProbIdx];
  const angs = [p.a, p.b, p.c];
  const tri = taTriPoints();
  const pts = [tri.A, tri.B, tri.C];
  document.getElementById('taTri').setAttribute('points', pts.map(function (q) { return q[0] + ',' + q[1]; }).join(' '));
  const labels = [[tri.A[0], tri.A[1] - 13], [tri.B[0] - 8, tri.B[1] + 22], [tri.C[0] + 8, tri.C[1] + 22]];
  for (let i = 0; i < 3; i++) {
    const corner = document.getElementById('taCorner' + i);
    corner.setAttribute('cx', String(pts[i][0]));
    corner.setAttribute('cy', String(pts[i][1]));
    corner.setAttribute('opacity', taTorn[i] ? '0.3' : '1');
    const label = document.getElementById('taLabel' + i);
    label.setAttribute('x', String(labels[i][0]));
    label.setAttribute('y', String(labels[i][1]));
    label.textContent = '∠' + 'ABC'[i] + ' ' + angs[i] + '°';
    document.getElementById('taTear' + i).textContent = '撕下 ∠' + 'ABC'[i] + '（' + angs[i] + '°）';
  }
  let start = 180;
  for (let i = 0; i < 3; i++) {
    const el = document.getElementById('taWedge' + i);
    if (taTorn[i]) {
      el.setAttribute('points', taSectorPoints(160, 70, 55, start, start - angs[i]));
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
    start -= angs[i];
  }
  const tornN = taTorn.filter(Boolean).length;
  document.getElementById('taMsg').textContent = tornN === 3
    ? angs[0] + '° + ' + angs[1] + '° + ' + angs[2] + '° = 180°——三个角拼成一条直线，就是一个平角 180°！'
    : '已经撕下 ' + tornN + ' 个角，拼到下面的直线上去；三个都拼上，就能看见 180°。';
  document.querySelectorAll('#taProbSeg [data-ta-prob]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.taProb === taProbIdx));
  });
}
const taSticks = [2, 3, 10];
function taStickRender() {
  const a = taSticks[0], b = taSticks[1], c = taSticks[2];
  document.getElementById('taStickRead').textContent = a + ' 厘米、' + b + ' 厘米、' + c + ' 厘米';
  for (let i = 0; i < 3; i++) document.getElementById('taStick' + i + 'Tx').textContent = taSticks[i] + ' 厘米';
  const ok = a + b > c && a + c > b && b + c > a;
  document.getElementById('taStickMsg').textContent = ok
    ? '能围成三角形：' + a + '+' + b + '=' + (a + b) + '>' + c + '，两边之和大于第三边。'
    : '围不成三角形：' + (a + b <= c ? a + '+' + b + '=' + (a + b) + '，比 ' + c + ' 短，两根短棒够不到一起。' : a + c <= b ? a + '+' + c + '=' + (a + c) + '，比 ' + b + ' 短。' : b + '+' + c + '=' + (b + c) + '，比 ' + a + ' 短。');
}
(function taInit() {
  const seg = document.getElementById('taProbSeg');
  TA_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = p.a + '°、' + p.b + '°、' + p.c + '°';
    b.dataset.taProb = String(i);
    b.addEventListener('click', function () {
      taProbIdx = i;
      taTorn[0] = taTorn[1] = taTorn[2] = false;
      markTried('tearangle');
      taRender();
    });
    seg.appendChild(b);
  });
  for (let i = 0; i < 3; i++) {
    document.getElementById('taTear' + i).addEventListener('click', function () { taTorn[i] = true; markTried('tearangle'); taRender(); });
  }
  for (let i = 0; i < 3; i++) {
    document.getElementById('taStick' + i + 'Minus').addEventListener('click', function () { if (taSticks[i] > 2) taSticks[i]--; markTried('tearangle'); taStickRender(); });
    document.getElementById('taStick' + i + 'Plus').addEventListener('click', function () { if (taSticks[i] < 12) taSticks[i]++; markTried('tearangle'); taStickRender(); });
  }
  taRender();
  taStickRender();
})();

/* ---------- demo-decadd · 4.13 小数的加法和减法（方法：对齐小数点） ----------
   2.5+0.25：小数点对齐是 2.75；末尾对齐是 2.30——5 个十分之一加到了 5 个百分之一上。
   1.5+2.3=3.8；3.6−1.25=2.35；5−2.4=2.6（5 写成 5.0）。 */
const DA_PROBS = [
  { a: '2.5', b: '0.25', op: '+', correct: '2.75', wrong: '2.30',
    wrongNote: '末尾对齐：5 个十分之一加到了 5 个百分之一上，结果是 2.30——错的。' },
  { a: '1.5', b: '2.3', op: '+', correct: '3.8', wrong: '3.8',
    wrongNote: '这两个数都是一位小数，末尾对齐和小数点对齐是一样的，都是 3.8。' },
  { a: '3.6', b: '1.25', op: '−', correct: '2.35', wrong: '',
    wrongNote: '末尾对齐时数位全错位了：3 的下面是 2，6 的下面是 5——竖式没法算。' },
  { a: '5', b: '2.4', op: '−', correct: '2.6', wrong: '',
    wrongNote: '末尾对齐时 5 的下面是 4，数位错了——先把 5 写成 5.0，再对齐小数点。' }
];
let daProbIdx = 0;
let daAlign = 'point'; // 'point' 小数点对齐 | 'end' 末尾对齐
let daShown = false;
function daMap(num, align) {
  // 列：0 十位，1 个位，2 小数点，3 十分位，4 百分位
  const parts = num.split('.');
  const map = {};
  if (align === 'point') {
    const intP = parts[0];
    for (let i = 0; i < intP.length; i++) map[1 - (intP.length - 1 - i)] = intP[i];
    map[2] = '.';
    const fracP = parts[1] || '';
    for (let i = 0; i < fracP.length; i++) map[3 + i] = fracP[i];
  } else {
    const digits = num.replace('.', '');
    for (let i = 0; i < digits.length; i++) map[4 - (digits.length - 1 - i)] = digits[i];
  }
  return map;
}
function daFill(rowId, num, align) {
  const row = document.getElementById(rowId);
  const map = num ? daMap(num, align) : {};
  for (let i = 0; i < 5; i++) row.children[i].textContent = map[i] || '';
}
function daRender() {
  const p = DA_PROBS[daProbIdx];
  document.getElementById('daOpB').textContent = p.op;
  daFill('daRowA', p.a, daAlign);
  daFill('daRowB', p.b, daAlign);
  daFill('daRowR', daShown ? (daAlign === 'point' ? p.correct : p.wrong) : '', daAlign);
  document.getElementById('daMsg').textContent = daShown
    ? (daAlign === 'point' ? p.a + p.op + p.b + '=' + p.correct + '：小数点对齐，十分位才能加十分位。' : p.wrongNote)
    : '先选对齐方式，再点“算一算”。';
  document.querySelectorAll('#daAlignSeg [data-da-align]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(b.dataset.daAlign === daAlign));
  });
  document.querySelectorAll('#daProbSeg [data-da-prob]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.daProb === daProbIdx));
  });
}
(function daInit() {
  ['daRowA', 'daRowB', 'daRowR'].forEach(function (rowId) {
    const row = document.getElementById(rowId);
    for (let i = 0; i < 5; i++) {
      const d = document.createElement('span');
      d.className = 'da-cell';
      row.appendChild(d);
    }
  });
  const pseg = document.getElementById('daProbSeg');
  DA_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = p.a + p.op + p.b;
    b.dataset.daProb = String(i);
    b.addEventListener('click', function () { daProbIdx = i; daShown = false; markTried('decadd'); daRender(); });
    pseg.appendChild(b);
  });
  const aseg = document.getElementById('daAlignSeg');
  [['point', '小数点对齐'], ['end', '末尾对齐（错）']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = m[1];
    b.dataset.daAlign = m[0];
    b.addEventListener('click', function () { daAlign = m[0]; markTried('decadd'); daRender(); });
    aseg.appendChild(b);
  });
  document.getElementById('daCalc').addEventListener('click', function () { daShown = true; markTried('decadd'); daRender(); });
  daRender();
})();

/* ---------- demo-moveshape · 4.14 图形的运动（二）（方法：网格整体拖） ----------
   平移：每个点都向同一个方向移动相同的格数，形状、大小一点不变。
   轴对称：对称点到对称轴的距离相等；对称轴穿过第 3 列的正中间，左边的第 c 列照镜子是第 6−c 列。 */
let mvMode = 'move';
let mvOx = 2, mvOy = 2;
let mvDx = 0, mvDy = 0;
let mvMirror = -1;
const MV_SHAPE = [[0, 0], [1, 0], [2, 0], [1, 1]];
function mvCells() { return MV_SHAPE.map(function (c) { return [c[0] + mvOx, c[1] + mvOy]; }); }
function mvRender() {
  const grid = document.getElementById('mvGrid');
  const shapeSet = {};
  mvCells().forEach(function (c) { shapeSet[c[1] * 8 + c[0]] = true; });
  for (let i = 0; i < grid.children.length; i++) {
    const cell = grid.children[i];
    cell.classList.toggle('mv-on', !!shapeSet[i]);
    cell.classList.toggle('mv-axis', (i % 8) === 3);
    cell.classList.toggle('mv-mirror', i === mvMirror);
  }
  const parts = [];
  if (mvDx > 0) parts.push('向右移了 ' + mvDx + ' 格');
  if (mvDx < 0) parts.push('向左移了 ' + (-mvDx) + ' 格');
  if (mvDy > 0) parts.push('向下移了 ' + mvDy + ' 格');
  if (mvDy < 0) parts.push('向上移了 ' + (-mvDy) + ' 格');
  document.getElementById('mvRead').textContent = parts.length
    ? '小船' + parts.join('，') + '——每个点都走了同样的格数，形状一点没变。'
    : '小船还没有动：点方向按钮，把它平移几格。';
  document.querySelectorAll('#mvModeSeg [data-mv-mode]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(b.dataset.mvMode === mvMode));
  });
}
function mvMove(dx, dy) {
  const nx = mvOx + dx, ny = mvOy + dy;
  const ok = MV_SHAPE.every(function (c) {
    const x = c[0] + nx, y = c[1] + ny;
    return x >= 0 && x < 8 && y >= 0 && y < 6;
  });
  if (!ok) { document.getElementById('mvRead').textContent = '到边了，再移就出格子了。'; return; }
  mvOx = nx; mvOy = ny; mvDx += dx; mvDy += dy; mvMirror = -1;
  markTried('moveshape');
  mvRender();
}
(function mvInit() {
  const seg = document.getElementById('mvModeSeg');
  [['move', '平移'], ['mirror', '轴对称']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = m[1];
    b.dataset.mvMode = m[0];
    b.addEventListener('click', function () { mvMode = m[0]; mvMirror = -1; markTried('moveshape'); mvRender(); });
    seg.appendChild(b);
  });
  const grid = document.getElementById('mvGrid');
  for (let i = 0; i < 48; i++) {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'mv-cell';
    d.dataset.mvCell = String(i);
    d.addEventListener('click', function () {
      if (mvMode !== 'mirror') return;
      const col = i % 8, row = Math.floor(i / 8);
      if (col > 3) {
        document.getElementById('mvMsg').textContent = '先在对称轴左边点一个点——右边的点照镜子会跑出格子。';
        return;
      }
      const mirCol = 6 - col;
      const dist = 3 - col;
      mvMirror = row * 8 + mirCol;
      markTried('moveshape');
      document.getElementById('mvMsg').textContent = dist === 0
        ? '这个点就在对称轴上，对称点就是它自己。'
        : '这个点到对称轴是 ' + dist + ' 格，对称点到对称轴也是 ' + dist + ' 格——两边一样远。';
      mvRender();
    });
    grid.appendChild(d);
  }
  document.getElementById('mvLeft').addEventListener('click', function () { mvMove(-1, 0); });
  document.getElementById('mvRight').addEventListener('click', function () { mvMove(1, 0); });
  document.getElementById('mvUp').addEventListener('click', function () { mvMove(0, -1); });
  document.getElementById('mvDown').addEventListener('click', function () { mvMove(0, 1); });
  mvRender();
})();

/* ---------- demo-average · 4.15 平均数（方法：削峰填谷） ----------
   80、90、100、90：总数 360，360÷4=90。60、80、100：总数 240，240÷3=80。
   平均数是削峰填谷以后的高度，不一定是原来的某个数。 */
const AV_DATA = [
  { label: '跳绳', vals: [80, 90, 100, 90],
    level: '把 100 的 10 分给 80：80 变 90，100 变 90，4 条一样高了。' },
  { label: '看书', vals: [60, 80, 100],
    level: '把 100 的 20 分给 60：60 变 80，100 变 80，3 条一样高了。' }
];
let avIdx = 0;
let avLeveled = false;
function avRender() {
  const d = AV_DATA[avIdx];
  const total = d.vals.reduce(function (s, x) { return s + x; }, 0);
  const avg = total / d.vals.length;
  const bars = document.getElementById('avBars');
  while (bars.firstChild) bars.removeChild(bars.firstChild);
  d.vals.forEach(function (v) {
    const col = document.createElement('div');
    col.className = 'av-col';
    const t = document.createElement('div');
    t.className = 'av-val';
    t.textContent = String(avLeveled ? avg : v);
    const b = document.createElement('div');
    b.className = 'av-bar' + (avLeveled ? ' av-flat' : '');
    b.style.height = (avLeveled ? avg : v) * 2 + 'px';
    col.appendChild(t);
    col.appendChild(b);
    bars.appendChild(col);
  });
  document.getElementById('avRead').textContent = avLeveled
    ? '总数是 ' + total + '，' + total + '÷' + d.vals.length + '=' + avg + '——平均数是 ' + avg + '。' + d.level
    : d.label + '：' + d.vals.join('、') + '。点“削一削”，把高的削下来补给矮的。';
  document.querySelectorAll('#avDataSeg [data-av-data]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.avData === avIdx));
  });
}
(function avInit() {
  const seg = document.getElementById('avDataSeg');
  AV_DATA.forEach(function (d, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = d.label;
    b.dataset.avData = String(i);
    b.addEventListener('click', function () { avIdx = i; avLeveled = false; markTried('average'); avRender(); });
    seg.appendChild(b);
  });
  document.getElementById('avLevel').addEventListener('click', function () { avLeveled = true; markTried('average'); avRender(); });
  avRender();
})();

/* ---------- demo-chickenrabbit · 4.16 鸡兔同笼（方法：腿数滑杆） ----------
   头 35 个，脚 94 只：全当鸡是 70 条腿，每换一只兔多 2 条腿，差 24 条，换 12 只兔。
   头 10 个，脚 28 只：全当鸡 20 条腿，差 8 条，换 4 只兔。 */
const CR_PROBS = [
  { heads: 35, legs: 94 },
  { heads: 10, legs: 28 }
];
let crProbIdx = 0;
let crRabbits = 0;
function crRender() {
  const p = CR_PROBS[crProbIdx];
  const chickens = p.heads - crRabbits;
  const legs = chickens * 2 + crRabbits * 4;
  document.getElementById('crRead').textContent = '鸡 ' + chickens + ' 只，兔 ' + crRabbits + ' 只，一共 ' + legs + ' 条腿（目标 ' + p.legs + ' 条）。';
  document.getElementById('crRabbitTx').textContent = '兔 ' + crRabbits + ' 只';
  document.getElementById('crFill').style.width = Math.round(legs / (p.heads * 4) * 100) + '%';
  const diff = p.legs - legs;
  document.getElementById('crMsg').textContent = diff === 0
    ? '对了！兔 ' + crRabbits + ' 只，鸡 ' + chickens + ' 只——验算：' + chickens + '×2+' + crRabbits + '×4=' + legs + '。'
    : diff > 0
      ? '还差 ' + diff + ' 条腿：每换一只兔多 2 条腿，还要换 ' + (diff / 2) + ' 只兔。'
      : '多了 ' + (-diff) + ' 条腿：换回去 ' + (-diff / 2) + ' 只鸡。';
  document.querySelectorAll('#crProbSeg [data-cr-prob]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.crProb === crProbIdx));
  });
}
(function crInit() {
  const seg = document.getElementById('crProbSeg');
  CR_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = '头 ' + p.heads + ' 个，脚 ' + p.legs + ' 只';
    b.dataset.crProb = String(i);
    b.addEventListener('click', function () { crProbIdx = i; crRabbits = 0; markTried('chickenrabbit'); crRender(); });
    seg.appendChild(b);
  });
  document.getElementById('crMinus').addEventListener('click', function () { if (crRabbits > 0) crRabbits--; markTried('chickenrabbit'); crRender(); });
  document.getElementById('crPlus').addEventListener('click', function () { if (crRabbits < CR_PROBS[crProbIdx].heads) crRabbits++; markTried('chickenrabbit'); crRender(); });
  document.getElementById('crAllChicken').addEventListener('click', function () { crRabbits = 0; markTried('chickenrabbit'); crRender(); });
  crRender();
})();

/* ---------- demo-decmul · 5.1 小数乘法（方法：单位正方形重叠） ----------
   0.3×0.4：横着涂 3 份，竖着涂 4 份，重叠 3×4=12 个小格，每个小格是 0.01，所以是 0.12。
   0.2×0.5=0.10=0.1；0.6×0.7=0.42。 */
let dmA = 3, dmB = 4;
const DM_PROBS = [[3, 4, '0.3×0.4'], [2, 5, '0.2×0.5'], [6, 7, '0.6×0.7']];
function dmDec(x) { return (x / 10).toFixed(1); }
function dmRender() {
  const grid = document.getElementById('dmGrid');
  for (let i = 0; i < grid.children.length; i++) {
    const col = i % 10, row = Math.floor(i / 10);
    const h = col < dmA, v = row < dmB;
    grid.children[i].classList.toggle('dm-h', h && !v);
    grid.children[i].classList.toggle('dm-v', v && !h);
    grid.children[i].classList.toggle('dm-both', h && v);
  }
  const n = dmA * dmB;
  const prod = (n / 100).toFixed(2);
  const prodTx = n % 10 === 0 ? prod + '，也就是 ' + (n / 100).toFixed(1) : prod;
  document.getElementById('dmRead').textContent =
    dmDec(dmA) + '×' + dmDec(dmB) + '：横着涂 ' + dmA + ' 份，竖着涂 ' + dmB + ' 份，重叠 ' + n +
    ' 个小格，每个小格是 0.01，所以是 ' + prodTx + '。';
  document.getElementById('dmMsg').textContent =
    '乘积 ' + prodTx + ' 比 ' + dmDec(dmB) + ' 小：乘一个比 1 小的数，积会变小——' +
    dmDec(dmA) + '×' + dmDec(dmB) + ' 是 ' + dmDec(dmB) + ' 的十分之 ' + dmA + '，是它的一部分。';
  document.getElementById('dmATx').textContent = '第一个因数 ' + dmDec(dmA);
  document.getElementById('dmBTx').textContent = '第二个因数 ' + dmDec(dmB);
  document.querySelectorAll('#dmProbSeg [data-dm-prob]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.dmProb === DM_PROBS.findIndex(function (p) { return p[0] === dmA && p[1] === dmB; })));
  });
}
(function dmInit() {
  const seg = document.getElementById('dmProbSeg');
  DM_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = p[2];
    b.dataset.dmProb = String(i);
    b.addEventListener('click', function () { dmA = p[0]; dmB = p[1]; markTried('decmul'); dmRender(); });
    seg.appendChild(b);
  });
  const grid = document.getElementById('dmGrid');
  for (let i = 0; i < 100; i++) {
    const d = document.createElement('div');
    d.className = 'dm-cell';
    grid.appendChild(d);
  }
  document.getElementById('dmAMinus').addEventListener('click', function () { if (dmA > 1) dmA--; markTried('decmul'); dmRender(); });
  document.getElementById('dmAPlus').addEventListener('click', function () { if (dmA < 9) dmA++; markTried('decmul'); dmRender(); });
  document.getElementById('dmBMinus').addEventListener('click', function () { if (dmB > 1) dmB--; markTried('decmul'); dmRender(); });
  document.getElementById('dmBPlus').addEventListener('click', function () { if (dmB < 9) dmB++; markTried('decmul'); dmRender(); });
  dmRender();
})();

/* ---------- demo-gridpos · 5.2 位置（方法：坐标网格 + 军舰游戏） ----------
   数对先列后行：(3,2) 是第 3 列第 2 行，(2,3) 是第 2 列第 3 行，是两个不同的点。 */
let gpMode = 'free';
let gpTarget = [3, 2];
let gpSel = -1;
const GP_TARGETS = [[3, 2], [2, 3], [5, 5], [4, 1]];
function gpRender() {
  const grid = document.getElementById('gpGrid');
  for (let i = 0; i < grid.children.length; i++) {
    grid.children[i].classList.toggle('gp-on', i === gpSel);
  }
  document.querySelectorAll('#gpModeSeg [data-gp-mode]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(b.dataset.gpMode === gpMode));
  });
  document.querySelectorAll('#gpTargetSeg [data-gp-target]').forEach(function (b) {
    const t = GP_TARGETS[+b.dataset.gpTarget];
    b.setAttribute('aria-pressed', String(t[0] === gpTarget[0] && t[1] === gpTarget[1]));
  });
}
function gpSay(col, row) {
  if (gpMode === 'free') {
    document.getElementById('gpRead').textContent = '第 ' + col + ' 列第 ' + row + ' 行，数对是 (' + col + ',' + row + ')。';
    return;
  }
  document.getElementById('gpRead').textContent = (col === gpTarget[0] && row === gpTarget[1])
    ? '对了！(' + gpTarget[0] + ',' + gpTarget[1] + ') 就是第 ' + gpTarget[0] + ' 列第 ' + gpTarget[1] + ' 行。'
    : '不对：要找的是 (' + gpTarget[0] + ',' + gpTarget[1] + ')，你点的是第 ' + col + ' 列第 ' + row + ' 行——先数列，再数行。';
}
(function gpInit() {
  const mseg = document.getElementById('gpModeSeg');
  [['free', '自由点一点'], ['quiz', '考一考']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = m[1];
    b.dataset.gpMode = m[0];
    b.addEventListener('click', function () { gpMode = m[0]; gpSel = -1; markTried('gridpos'); gpRender(); document.getElementById('gpRead').textContent = gpMode === 'free' ? '点一个格子，看看它的数对。' : '要找的是 (' + gpTarget[0] + ',' + gpTarget[1] + ')：点一点它在哪。'; });
    mseg.appendChild(b);
  });
  const tseg = document.getElementById('gpTargetSeg');
  GP_TARGETS.forEach(function (t, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = '(' + t[0] + ',' + t[1] + ')';
    b.dataset.gpTarget = String(i);
    b.addEventListener('click', function () { gpTarget = t; gpSel = -1; markTried('gridpos'); gpRender(); document.getElementById('gpRead').textContent = gpMode === 'quiz' ? '要找的是 (' + t[0] + ',' + t[1] + ')：点一点它在哪。' : '点一个格子，看看它的数对。'; });
    tseg.appendChild(b);
  });
  const grid = document.getElementById('gpGrid');
  for (let i = 0; i < 30; i++) {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'gp-cell';
    d.dataset.gpCell = String(i);
    d.addEventListener('click', function () {
      const col = i % 6 + 1, row = Math.floor(i / 6) + 1;
      gpSel = i;
      markTried('gridpos');
      gpRender();
      gpSay(col, row);
    });
    grid.appendChild(d);
  }
  gpRender();
})();

/* ---------- demo-decdiv · 5.3 小数除法（方法：两数同乘） ----------
   2.4÷0.6：两边都乘 10，变成 24÷6=4。1.8÷0.6=3；0.35÷0.7：乘 10 是 3.5÷7=0.5。 */
const DD_PROBS = [
  { a: 2.4, b: 0.6, q: '4' },
  { a: 1.8, b: 0.6, q: '3' },
  { a: 0.35, b: 0.7, q: '0.5' }
];
let ddProbIdx = 0, ddScale = 1;
function ddFmt(x) { return String(Math.round(x * 100) / 100); }
function ddRender() {
  const p = DD_PROBS[ddProbIdx];
  const sa = p.a * ddScale, sb = p.b * ddScale;
  const max = Math.max(sa, sb);
  document.getElementById('ddBarA').style.width = Math.round(sa / max * 100) + '%';
  document.getElementById('ddBarB').style.width = Math.round(sb / max * 100) + '%';
  document.getElementById('ddBarATx').textContent = '被除数 ' + ddFmt(sa);
  document.getElementById('ddBarBTx').textContent = '除数 ' + ddFmt(sb);
  const isInt = Number.isInteger(sb);
  document.getElementById('ddRead').textContent = isInt
    ? ddFmt(p.a) + '÷' + ddFmt(p.b) + '：两边都乘 ' + ddScale + '，变成 ' + ddFmt(sa) + '÷' + ddFmt(sb) + '=' + p.q + '。'
    : ddFmt(p.a) + '÷' + ddFmt(p.b) + '：两边都乘 ' + ddScale + '，除数 ' + ddFmt(sb) + ' 还不是整数——再乘大一点。';
  document.querySelectorAll('#ddProbSeg [data-dd-prob]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.ddProb === ddProbIdx));
  });
  document.querySelectorAll('#ddScaleSeg [data-dd-scale]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.ddScale === ddScale));
  });
}
(function ddInit() {
  const pseg = document.getElementById('ddProbSeg');
  DD_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = ddFmt(p.a) + '÷' + ddFmt(p.b);
    b.dataset.ddProb = String(i);
    b.addEventListener('click', function () { ddProbIdx = i; ddScale = 1; markTried('decdiv'); ddRender(); });
    pseg.appendChild(b);
  });
  const sseg = document.getElementById('ddScaleSeg');
  [1, 10, 100].forEach(function (s) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = '×' + s;
    b.dataset.ddScale = String(s);
    b.addEventListener('click', function () { ddScale = s; markTried('decdiv'); ddRender(); });
    sseg.appendChild(b);
  });
  ddRender();
})();

/* ---------- demo-prob · 5.4 可能性（方法：先模拟 100 次） ----------
   3 红 7 蓝：摸到红球的可能性是 3/10。长期摸下去，红球大约每 10 次出现 3 次；
   但每一次都是新的开始，前面的结果不会影响后面。 */
const PB_COMPS = [
  { red: 3, total: 10, label: '3 红 7 蓝' },
  { red: 5, total: 10, label: '5 红 5 蓝' }
];
let pbCompIdx = 0, pbRed = 0, pbBlue = 0;
function pbDrawOnce() {
  if (Math.random() < PB_COMPS[pbCompIdx].red / PB_COMPS[pbCompIdx].total) pbRed++; else pbBlue++;
}
function pbRender() {
  const c = PB_COMPS[pbCompIdx], total = pbRed + pbBlue;
  document.getElementById('pbRead').textContent = total === 0
    ? '袋子里有 ' + c.red + ' 个红球、' + (c.total - c.red) + ' 个蓝球，摸到红球的可能性是 ' + c.red + '/' + c.total + '。点“摸 100 次”，看看红球出现几次。'
    : '一共摸了 ' + total + ' 次：红球 ' + pbRed + ' 次，蓝球 ' + pbBlue + ' 次。红球的可能性是 ' + c.red + '/' + c.total + '，理论上大约 ' + Math.round(total * c.red / c.total) + ' 次。';
  document.getElementById('pbFill').style.width = (total === 0 ? c.red / c.total * 100 : pbRed / total * 100) + '%';
  document.querySelectorAll('#pbCompSeg [data-pb-comp]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.pbComp === pbCompIdx));
  });
}
(function pbInit() {
  const seg = document.getElementById('pbCompSeg');
  PB_COMPS.forEach(function (c, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = c.label;
    b.dataset.pbComp = String(i);
    b.addEventListener('click', function () { pbCompIdx = i; pbRed = 0; pbBlue = 0; markTried('prob'); pbRender(); });
    seg.appendChild(b);
  });
  document.getElementById('pbOnce').addEventListener('click', function () { pbDrawOnce(); markTried('prob'); pbRender(); });
  document.getElementById('pbTen').addEventListener('click', function () { for (let i = 0; i < 10; i++) pbDrawOnce(); markTried('prob'); pbRender(); });
  document.getElementById('pbHundred').addEventListener('click', function () { for (let i = 0; i < 100; i++) pbDrawOnce(); markTried('prob'); pbRender(); });
  document.getElementById('pbReset').addEventListener('click', function () { pbRed = 0; pbBlue = 0; markTried('prob'); pbRender(); });
  pbRender();
})();

/* ---------- demo-polyarea · 5.6 多边形的面积（方法：切一刀平移） ----------
   平行四边形 底 6 高 4：面积 6×4=24；三角形 6×4÷2=12；梯形 上底 3 下底 6 高 4：(3+6)×4÷2=18。
   梯形练习题 (3+7)×4÷2=20 在点 5.6 的练一练里。 */
let paShape = 'para';
let paBase = 6, paHeight = 4, paTop = 3, paCut = false;
function paArea() {
  if (paShape === 'para') return paBase * paHeight;
  if (paShape === 'tri') return paBase * paHeight / 2;
  return (paTop + paBase) * paHeight / 2;
}
function paRender() {
  const s = 24, hPx = paHeight * 20, top = 140 - hPx;
  const shape = document.getElementById('paShape');
  const cutTri = document.getElementById('paCutTri');
  const cutLine = document.getElementById('paCutLine');
  if (paShape === 'para') {
    if (paCut) {
      shape.setAttribute('points', '74,' + 140 + ' ' + (74 + paBase * s) + ',' + 140 + ' ' + (74 + paBase * s) + ',' + top + ' 74,' + top);
      cutTri.setAttribute('points', (50 + paBase * s) + ',' + 140 + ' ' + (74 + paBase * s) + ',' + 140 + ' ' + (74 + paBase * s) + ',' + top);
      cutTri.hidden = false;
      cutLine.hidden = true;
    } else {
      shape.setAttribute('points', '50,' + 140 + ' ' + (50 + paBase * s) + ',' + 140 + ' ' + (74 + paBase * s) + ',' + top + ' 74,' + top);
      cutTri.hidden = true;
      cutLine.setAttribute('x1', '74'); cutLine.setAttribute('y1', String(top));
      cutLine.setAttribute('x2', '74'); cutLine.setAttribute('y2', '140');
      cutLine.hidden = false;
    }
  } else if (paShape === 'tri') {
    shape.setAttribute('points', '50,140 ' + (50 + paBase * s) + ',140 ' + (50 + paBase * s / 2) + ',' + top);
    cutTri.hidden = true;
    cutLine.hidden = true;
  } else {
    const off = (paBase - paTop) * s / 2;
    shape.setAttribute('points', '50,140 ' + (50 + paBase * s) + ',140 ' + (50 + off + paTop * s) + ',' + top + ' ' + (50 + off) + ',' + top);
    cutTri.hidden = true;
    cutLine.hidden = true;
  }
  const area = paArea();
  const read = document.getElementById('paRead');
  const msg = document.getElementById('paMsg');
  if (paShape === 'para') {
    read.textContent = '平行四边形：底 ' + paBase + ' 厘米，高 ' + paHeight + ' 厘米，面积 = ' + paBase + '×' + paHeight + ' = ' + area + ' 平方厘米。';
    msg.textContent = paCut
      ? '切下来的三角形滑到对面，就变成一个长方形——长还是 ' + paBase + ' 厘米，宽是高 ' + paHeight + ' 厘米，面积还是 ' + area + ' 平方厘米。'
      : '斜边不是高：高是和底垂直的那条线。点“切一刀”，看看它怎么变成长方形。';
  } else if (paShape === 'tri') {
    read.textContent = '三角形：底 ' + paBase + ' 厘米，高 ' + paHeight + ' 厘米，面积 = ' + paBase + '×' + paHeight + '÷2 = ' + area + ' 平方厘米。';
    msg.textContent = '两个一样的三角形能拼成一个平行四边形，所以一个三角形是它的一半，要除以 2。';
  } else {
    read.textContent = '梯形：上底 ' + paTop + ' 厘米，下底 ' + paBase + ' 厘米，高 ' + paHeight + ' 厘米，面积 = (' + paTop + '+' + paBase + ')×' + paHeight + '÷2 = ' + area + ' 平方厘米。';
    msg.textContent = '梯形是两个三角形拼起来的，上下底加起来除以 2，就是平均的底。';
  }
  document.getElementById('paBaseTx').textContent = '底 ' + paBase + ' 厘米';
  document.getElementById('paHeightTx').textContent = '高 ' + paHeight + ' 厘米';
  document.getElementById('paTopTx').textContent = '上底 ' + paTop + ' 厘米';
  document.getElementById('paTopRow').hidden = paShape !== 'trap';
  document.querySelectorAll('#paShapeSeg [data-pa-shape]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(b.dataset.paShape === paShape));
  });
}
(function paInit() {
  const seg = document.getElementById('paShapeSeg');
  [['para', '平行四边形'], ['tri', '三角形'], ['trap', '梯形']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = m[1];
    b.dataset.paShape = m[0];
    b.addEventListener('click', function () { paShape = m[0]; paCut = false; markTried('polyarea'); paRender(); });
    seg.appendChild(b);
  });
  document.getElementById('paBaseMinus').addEventListener('click', function () { if (paBase > 2) paBase--; markTried('polyarea'); paRender(); });
  document.getElementById('paBasePlus').addEventListener('click', function () { if (paBase < 8) paBase++; markTried('polyarea'); paRender(); });
  document.getElementById('paHeightMinus').addEventListener('click', function () { if (paHeight > 2) paHeight--; markTried('polyarea'); paRender(); });
  document.getElementById('paHeightPlus').addEventListener('click', function () { if (paHeight < 6) paHeight++; markTried('polyarea'); paRender(); });
  document.getElementById('paTopMinus').addEventListener('click', function () { if (paTop > 1) paTop--; markTried('polyarea'); paRender(); });
  document.getElementById('paTopPlus').addEventListener('click', function () { if (paTop < 5) paTop++; markTried('polyarea'); paRender(); });
  document.getElementById('paCut').addEventListener('click', function () {
    if (paShape !== 'para') { document.getElementById('paMsg').textContent = '先选平行四边形，再切一刀。'; return; }
    paCut = !paCut;
    markTried('polyarea');
    paRender();
  });
  paRender();
})();

/* ---------- demo-planttree · 5.7 植树问题（方法：拖树数间隔） ----------
   100 米，每 10 米一棵：10 个间隔，两端都种要 11 棵；一端种或围成一圈是 10 棵。
   60 米，每 10 米一棵：6 个间隔，两端都种要 7 棵。 */
const PT_LENS = [60, 100];
const PT_SPACINGS = [5, 10];
let ptLenIdx = 1, ptSpIdx = 1, ptMode = 'both';
function ptIntervals() { return PT_LENS[ptLenIdx] / PT_SPACINGS[ptSpIdx]; }
function ptTrees() { const n = ptIntervals(); return ptMode === 'both' ? n + 1 : n; }
function ptRender() {
  const n = ptIntervals(), t = ptTrees();
  const row = document.getElementById('ptRow');
  for (let i = 0; i < row.children.length; i++) {
    row.children[i].classList.toggle('pt-on', i < t);
  }
  const len = PT_LENS[ptLenIdx], sp = PT_SPACINGS[ptSpIdx];
  document.getElementById('ptRead').textContent =
    len + ' 米的路，每 ' + sp + ' 米种一棵，有 ' + n + ' 个间隔，' +
    (ptMode === 'both' ? '两端都种要 ' + t + ' 棵树。'
      : ptMode === 'one' ? '一端种、不种另一端，棵数和间隔数一样多，要 ' + t + ' 棵树。'
      : '围成一圈，最后一棵树后面也有间隔，棵数和间隔数一样多，要 ' + t + ' 棵树。');
  document.querySelectorAll('#ptLenSeg [data-pt-len]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.ptLen === ptLenIdx));
  });
  document.querySelectorAll('#ptSpSeg [data-pt-sp]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.ptSp === ptSpIdx));
  });
  document.querySelectorAll('#ptModeSeg [data-pt-mode]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(b.dataset.ptMode === ptMode));
  });
}
(function ptInit() {
  const lseg = document.getElementById('ptLenSeg');
  PT_LENS.forEach(function (l, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = l + ' 米';
    b.dataset.ptLen = String(i);
    b.addEventListener('click', function () { ptLenIdx = i; markTried('planttree'); ptRender(); });
    lseg.appendChild(b);
  });
  const sseg = document.getElementById('ptSpSeg');
  PT_SPACINGS.forEach(function (s, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = '每 ' + s + ' 米';
    b.dataset.ptSp = String(i);
    b.addEventListener('click', function () { ptSpIdx = i; markTried('planttree'); ptRender(); });
    sseg.appendChild(b);
  });
  const mseg = document.getElementById('ptModeSeg');
  [['both', '两端都种'], ['one', '一端种'], ['circle', '围成一圈']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = m[1];
    b.dataset.ptMode = m[0];
    b.addEventListener('click', function () { ptMode = m[0]; markTried('planttree'); ptRender(); });
    mseg.appendChild(b);
  });
  const row = document.getElementById('ptRow');
  for (let i = 0; i < 21; i++) {
    const d = document.createElement('div');
    d.className = 'pt-tree';
    row.appendChild(d);
  }
  ptRender();
})();

/* ---------- demo-factor · 5.8 因数与倍数（方法：因数游戏 + 矩形阵列） ----------
   12 的因数：1、2、3、4、6、12，能拼 1×12、2×6、3×4 三种长方形。
   13、17 只有 1 和它本身两个因数，是质数。24 和 36 的最大公因数是 12，最小公倍数是 72。 */
const FC_NUMS = [12, 18, 24, 30, 13, 17];
let fcNumIdx = 0;
function fcPairs(n) {
  const pairs = [];
  for (let a = 1; a * a <= n; a++) if (n % a === 0) pairs.push([a, n / a]);
  return pairs;
}
function fcFactors(n) {
  const f = [];
  for (let a = 1; a <= n; a++) if (n % a === 0) f.push(a);
  return f;
}
function fcRender() {
  const n = FC_NUMS[fcNumIdx];
  const pairs = fcPairs(n);
  let html = '';
  pairs.forEach(function (pr) {
    html += '<div class="fc-row"><span>' + pr[0] + ' × ' + pr[1] + '</span>' +
      '<svg width="' + (pr[1] * 8 + 4) + '" height="' + (pr[0] * 14 + 4) + '" role="img" aria-label="' + pr[0] + '乘' + pr[1] + '的长方形">' +
      '<rect x="2" y="2" width="' + pr[1] * 8 + '" height="' + pr[0] * 14 + '" rx="4" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/></svg></div>';
  });
  document.getElementById('fcRects').innerHTML = html;
  document.getElementById('fcRead').textContent = n + ' 的因数：' + fcFactors(n).join('、') + '。';
  document.getElementById('fcKind').textContent = pairs.length === 1
    ? n + ' 只有 1 和它本身两个因数，是质数。'
    : n + ' 除了 1 和它本身，还有别的因数，是合数——能拼成 ' + pairs.length + ' 种长方形。';
  document.querySelectorAll('#fcNumSeg [data-fc-num]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.fcNum === fcNumIdx));
  });
}
(function fcInit() {
  const seg = document.getElementById('fcNumSeg');
  FC_NUMS.forEach(function (n, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = String(n);
    b.dataset.fcNum = String(i);
    b.addEventListener('click', function () { fcNumIdx = i; markTried('factor'); fcRender(); });
    seg.appendChild(b);
  });
  fcRender();
})();

/* ---------- demo-cuboid · 5.9 长方体和正方体（方法：展开图折叠 + 分层装块） ----------
   长 5 宽 4 高 3：一层有 5×4=20 个小方块，有 3 层，体积 20×3=60 立方厘米；
   表面积 2×(5×4+5×3+4×3)=94 平方厘米。正方体棱长 4：一个面 16，6 个面 96。 */
let cbL = 5, cbW = 4, cbH = 3;
function cbRender() {
  const grid = document.getElementById('cbGrid');
  for (let i = 0; i < grid.children.length; i++) {
    grid.children[i].classList.toggle('cb-on', i < cbL * cbW);
  }
  const vol = cbL * cbW * cbH;
  const surf = 2 * (cbL * cbW + cbL * cbH + cbW * cbH);
  document.getElementById('cbRead').textContent =
    '长 ' + cbL + ' 厘米、宽 ' + cbW + ' 厘米、高 ' + cbH + ' 厘米：一层有 ' + cbL + '×' + cbW + '=' + (cbL * cbW) +
    ' 个小方块，有 ' + cbH + ' 层，体积 = ' + (cbL * cbW) + '×' + cbH + '=' + vol + ' 立方厘米。';
  document.getElementById('cbMsg').textContent =
    '表面积 = 2×(' + cbL + '×' + cbW + '+' + cbL + '×' + cbH + '+' + cbW + '×' + cbH + ')=' + surf + ' 平方厘米。1 升 = 1 立方分米。' +
    (cbL === cbW && cbW === cbH ? '长、宽、高都是 ' + cbL + '，这是正方体。' : '');
  document.getElementById('cbLTx').textContent = '长 ' + cbL + ' 厘米';
  document.getElementById('cbWTx').textContent = '宽 ' + cbW + ' 厘米';
  document.getElementById('cbHTx').textContent = '高 ' + cbH + ' 厘米';
}
(function cbInit() {
  const grid = document.getElementById('cbGrid');
  for (let i = 0; i < 25; i++) {
    const d = document.createElement('div');
    d.className = 'cb-cell';
    grid.appendChild(d);
  }
  document.getElementById('cbLMinus').addEventListener('click', function () { if (cbL > 1) cbL--; markTried('cuboid'); cbRender(); });
  document.getElementById('cbLPlus').addEventListener('click', function () { if (cbL < 5) cbL++; markTried('cuboid'); cbRender(); });
  document.getElementById('cbWMinus').addEventListener('click', function () { if (cbW > 1) cbW--; markTried('cuboid'); cbRender(); });
  document.getElementById('cbWPlus').addEventListener('click', function () { if (cbW < 5) cbW++; markTried('cuboid'); cbRender(); });
  document.getElementById('cbHMinus').addEventListener('click', function () { if (cbH > 1) cbH--; markTried('cuboid'); cbRender(); });
  document.getElementById('cbHPlus').addEventListener('click', function () { if (cbH < 5) cbH++; markTried('cuboid'); cbRender(); });
  cbRender();
})();

/* ---------- demo-fracadd · 5.11 分数的加法和减法（方法：先重切、再数） ----------
   1/2+1/3：先都切成六分之一，3/6+2/6=5/6。2/3+1/4=8/12+3/12=11/12；1/3+1/6=2/6+1/6=3/6，也就是 1/2。 */
const FA_A = [[1, 2], [1, 3], [2, 3], [3, 4]];
const FA_B = [[1, 3], [1, 4], [1, 6], [1, 2]];
let faAIdx = 0, faBIdx = 0;
function faGcd(a, b) { return b ? faGcd(b, a % b) : a; }
function faFrac(fr) { return fr[0] + '/' + fr[1]; }
function faRender() {
  const A = FA_A[faAIdx], B = FA_B[faBIdx];
  const den = A[1] * B[1] / faGcd(A[1], B[1]);
  const aN = A[0] * den / A[1], bN = B[0] * den / B[1], sumN = aN + bN;
  const bars = [['faBarA', aN, 'fa-a'], ['faBarB', bN, 'fa-b'], ['faBarSum', sumN, 'fa-s']];
  bars.forEach(function (bar) {
    const el = document.getElementById(bar[0]);
    for (let i = 0; i < el.children.length; i++) {
      el.children[i].classList.toggle('fa-on', i < bar[1]);
      el.children[i].classList.toggle(bar[2], i < bar[1]);
    }
  });
  const g = faGcd(sumN, den);
  const reduced = g > 1 ? '，也就是 ' + (sumN / g) + '/' + (den / g) : '';
  const over = sumN > den ? '和比 1 大，是假分数。' : '';
  document.getElementById('faRead').textContent =
    faFrac(A) + ' = ' + aN + '/' + den + '，' + faFrac(B) + ' = ' + bN + '/' + den + '，' +
    aN + '/' + den + '+' + bN + '/' + den + '=' + sumN + '/' + den + reduced + '。' + over;
  document.querySelectorAll('#faASeg [data-fa-a]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.faA === faAIdx));
  });
  document.querySelectorAll('#faBSeg [data-fa-b]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.faB === faBIdx));
  });
}
(function faInit() {
  const aseg = document.getElementById('faASeg');
  FA_A.forEach(function (fr, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = faFrac(fr);
    b.dataset.faA = String(i);
    b.addEventListener('click', function () { faAIdx = i; markTried('fracadd'); faRender(); });
    aseg.appendChild(b);
  });
  const bseg = document.getElementById('faBSeg');
  FA_B.forEach(function (fr, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = faFrac(fr);
    b.dataset.faB = String(i);
    b.addEventListener('click', function () { faBIdx = i; markTried('fracadd'); faRender(); });
    bseg.appendChild(b);
  });
  ['faBarA', 'faBarB', 'faBarSum'].forEach(function (id) {
    const el = document.getElementById(id);
    for (let i = 0; i < 16; i++) {
      const d = document.createElement('div');
      d.className = 'fa-cell';
      el.appendChild(d);
    }
  });
  faRender();
})();

/* ---------- demo-rotate · 5.12 图形的运动（三）（方法：绕钉旋转 + 角度盘） ----------
   旋转三件事：绕哪个中心转、往哪个方向转、转多少度。转 90°、180°，还是原来的三角形；
   分针从 12 走到 3，转了 90°，顺时针。正方形绕中心转 90°、180° 都和自己重合。 */
let rtDeg = 0;
function rtRender() {
  document.getElementById('rtShape').setAttribute('transform', 'rotate(' + rtDeg + ' 160 127)');
  document.getElementById('rtRead').textContent = rtDeg === 0
    ? '三角形还没有转：点“顺时针转 90°”，看看它转到哪。'
    : '转了 ' + rtDeg + '°：还是原来的三角形，边长、角度一点没变，形状、大小一点没变。';
}
(function rtInit() {
  document.getElementById('rtCw').addEventListener('click', function () { rtDeg = (rtDeg + 90) % 360; markTried('rotate'); rtRender(); });
  document.getElementById('rtCcw').addEventListener('click', function () { rtDeg = (rtDeg + 270) % 360; markTried('rotate'); rtRender(); });
  document.getElementById('rtHalf').addEventListener('click', function () { rtDeg = (rtDeg + 180) % 360; markTried('rotate'); rtRender(); });
  document.getElementById('rtReset').addEventListener('click', function () { rtDeg = 0; markTried('rotate'); rtRender(); });
  rtRender();
})();

/* ---------- demo-findbad · 5.13 折线统计图、找次品（方法：三组称重） ----------
   9 个零件 1 个次品（轻一点）：第一次把 9 个分成 3 组称两组，找出次品在的 3 个；
   第二次在这 3 个里称一次——2 次就找出来了。27 个里找 1 个要 3 次：27→9→3→1。 */
const FB_LIGHTS = [8, 2, 5];
const FB_GROUPS = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
let fbRound = 0, fbStage = 0, fbSuspect = -1, fbWeighs = 0;
function fbLight() { return FB_LIGHTS[fbRound]; }
function fbGroupOf(n) { return n <= 3 ? 0 : n <= 6 ? 1 : 2; }
function fbRender() {
  const coins = document.getElementById('fbCoins');
  for (let i = 0; i < coins.children.length; i++) {
    const n = i + 1;
    coins.children[i].classList.toggle('fb-suspect', fbStage >= 1 && fbSuspect >= 0 && FB_GROUPS[fbSuspect].indexOf(n) >= 0);
    coins.children[i].classList.toggle('fb-found', fbStage === 2 && n === fbLight());
  }
  document.getElementById('fbWeighAB').hidden = fbStage !== 0;
  document.getElementById('fbWeighPair').hidden = fbStage !== 1;
  if (fbStage === 1) {
    const g = FB_GROUPS[fbSuspect];
    document.getElementById('fbWeighPair').textContent = '称第 ' + g[0] + ' 个和第 ' + g[1] + ' 个';
  }
}
function fbRead0() {
  document.getElementById('fbRead').textContent =
    '9 个硬币里有 1 个轻一点。先把它们分成 3 组：A 组是 1、2、3 号，B 组是 4、5、6 号，C 组是 7、8、9 号。点“称 A 组和 B 组”。';
}
(function fbInit() {
  const coins = document.getElementById('fbCoins');
  for (let i = 1; i <= 9; i++) {
    const d = document.createElement('div');
    d.className = 'fb-coin';
    d.textContent = String(i);
    coins.appendChild(d);
  }
  document.getElementById('fbWeighAB').addEventListener('click', function () {
    fbWeighs = 1;
    fbSuspect = fbGroupOf(fbLight());
    fbStage = 1;
    markTried('findbad');
    const names = ['A', 'B', 'C'];
    document.getElementById('fbRead').textContent = fbSuspect === 2
      ? '两边一样重，次品在 C 组（7、8、9 号里）。这是第 1 次称。'
      : names[fbSuspect] + ' 组轻了，次品在 ' + names[fbSuspect] + ' 组（' + FB_GROUPS[fbSuspect].join('、') + ' 号里）。这是第 1 次称。';
    fbRender();
  });
  document.getElementById('fbWeighPair').addEventListener('click', function () {
    fbWeighs = 2;
    fbStage = 2;
    markTried('findbad');
    const g = FB_GROUPS[fbSuspect];
    const light = fbLight();
    document.getElementById('fbRead').textContent = light === g[0]
      ? '第 ' + g[0] + ' 个最轻！一共称了 2 次就找出来了。'
      : light === g[1]
        ? '第 ' + g[1] + ' 个最轻！一共称了 2 次就找出来了。'
        : '两个一样重，次品是第 ' + g[2] + ' 个！一共称了 2 次就找出来了。';
    fbRender();
  });
  document.getElementById('fbNew').addEventListener('click', function () {
    fbRound = (fbRound + 1) % FB_LIGHTS.length;
    fbStage = 0; fbSuspect = -1; fbWeighs = 0;
    markTried('findbad');
    fbRead0();
    fbRender();
  });
  fbRead0();
  fbRender();
})();

/* ---------- 六年级实验 ---------- */
function g6fmt(x) { return String(Math.round(x * 100) / 100); }

/* ---------- demo-radar · 6.3 位置与方向（二）（方法：雷达扫） ----------
   方向 + 距离才能定住一个点：只说方向是一条射线，射线上有无数个点。
   北偏东 30°、200 米：从北往东偏 30°，再走 200 米。 */
const RD_DIRS = [
  { name: '北偏东', sx: 1, sy: -1, rot: -90 },
  { name: '北偏西', sx: -1, sy: -1, rot: -90 },
  { name: '南偏东', sx: 1, sy: 1, rot: 90 },
  { name: '南偏西', sx: -1, sy: 1, rot: 90 }
];
let rdDir = 0, rdAng = 30, rdDist = 200, rdMode = 'both';
function rdRender() {
  const d = RD_DIRS[rdDir];
  const rad = rdAng * Math.PI / 180;
  const px = rdDist / 500 * 140;
  const dx = d.sx * Math.sin(rad) * px, dy = d.sy * Math.cos(rad) * px;
  const dot = document.getElementById('rdDot');
  dot.style.left = (160 + dx - 14) + 'px';
  dot.style.top = (160 + dy - 14) + 'px';
  dot.hidden = rdMode !== 'both';
  const ray = document.getElementById('rdRay');
  ray.style.width = (rdMode === 'both' ? px : 140) + 'px';
  ray.style.transform = 'rotate(' + (d.rot + d.sx * rdAng) + 'deg)';
  [170, 330, 500].forEach(function (dist, i) {
    const g = document.getElementById('rdGhost' + (i + 1));
    const gp = dist / 500 * 140;
    g.style.left = (160 + d.sx * Math.sin(rad) * gp - 8) + 'px';
    g.style.top = (160 + d.sy * Math.cos(rad) * gp - 8) + 'px';
    g.hidden = rdMode !== 'dir';
  });
  document.getElementById('rdRead').textContent = rdMode === 'both'
    ? '小明家在学校' + d.name + ' ' + rdAng + '°、' + rdDist + ' 米处。方向定了一条线，距离定了线上哪一个点——两个都有，才是一个确切的地方。'
    : '只说“' + d.name + ' ' + rdAng + '°”，是一条射线：100 米处是这个方向，300 米处也是这个方向——射线上有无数个点，找不到小明家。';
  document.getElementById('rdAngTx').textContent = '偏 ' + rdAng + '°';
  document.getElementById('rdDistTx').textContent = rdDist + ' 米';
  document.querySelectorAll('#rdDirSeg [data-rd-dir]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.rdDir === rdDir));
  });
  document.querySelectorAll('#rdModeSeg [data-rd-mode]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(b.dataset.rdMode === rdMode));
  });
}
(function rdInit() {
  const dirSeg = document.getElementById('rdDirSeg');
  RD_DIRS.forEach(function (d, i) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = d.name; b.dataset.rdDir = String(i);
    b.addEventListener('click', function () { rdDir = i; markTried('radar'); rdRender(); });
    dirSeg.appendChild(b);
  });
  const modeSeg = document.getElementById('rdModeSeg');
  [['both', '方向 + 距离'], ['dir', '只说方向']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.rdMode = m[0];
    b.addEventListener('click', function () { rdMode = m[0]; markTried('radar'); rdRender(); });
    modeSeg.appendChild(b);
  });
  document.getElementById('rdAngMinus').addEventListener('click', function () { if (rdAng > 0) rdAng -= 10; markTried('radar'); rdRender(); });
  document.getElementById('rdAngPlus').addEventListener('click', function () { if (rdAng < 90) rdAng += 10; markTried('radar'); rdRender(); });
  document.getElementById('rdDistMinus').addEventListener('click', function () { if (rdDist > 50) rdDist -= 50; markTried('radar'); rdRender(); });
  document.getElementById('rdDistPlus').addEventListener('click', function () { if (rdDist < 500) rdDist += 50; markTried('radar'); rdRender(); });
  rdRender();
})();

/* ---------- demo-ratio · 6.4 比（方法：比条 + 双数轴） ----------
   比是“部分比部分”：2:3 一共 5 份，每份是整体的五分之一。
   50 元按 2:3 分：每份 10 元，20 元和 30 元。 */
let raA = 2, raB = 3, raTotal = 50;
function raRender() {
  const tot = raA + raB, per = raTotal / tot;
  const a = document.getElementById('raBarA'), b = document.getElementById('raBarB');
  a.style.width = (raA / tot * 100) + '%';
  b.style.width = (raB / tot * 100) + '%';
  a.textContent = raA + ' 份';
  b.textContent = raB + ' 份';
  document.getElementById('raRead').textContent =
    raA + ':' + raB + '，一共 ' + tot + ' 份，每份 ' + g6fmt(per) + ' 元：一个人分 ' + g6fmt(per * raA) + ' 元，另一个人分 ' + g6fmt(per * raB) + ' 元。';
  document.getElementById('raMsg').textContent =
    raA + ' 份是整体的 ' + raA + '/' + tot + '：' + raA + ':' + raB + ' 是部分比部分，' + raA + '/' + tot + ' 是部分比整体，别弄混。';
  document.getElementById('raATx').textContent = '前项 ' + raA + ' 份';
  document.getElementById('raBTx').textContent = '后项 ' + raB + ' 份';
  document.querySelectorAll('#raTotalSeg [data-ra-total]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.raTotal === raTotal));
  });
}
(function raInit() {
  const seg = document.getElementById('raTotalSeg');
  [50, 60, 100].forEach(function (t) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = t + ' 元'; b.dataset.raTotal = String(t);
    b.addEventListener('click', function () { raTotal = t; markTried('ratio'); raRender(); });
    seg.appendChild(b);
  });
  document.getElementById('raAMinus').addEventListener('click', function () { if (raA > 1) raA--; markTried('ratio'); raRender(); });
  document.getElementById('raAPlus').addEventListener('click', function () { if (raA < 9) raA++; markTried('ratio'); raRender(); });
  document.getElementById('raBMinus').addEventListener('click', function () { if (raB > 1) raB--; markTried('ratio'); raRender(); });
  document.getElementById('raBPlus').addEventListener('click', function () { if (raB < 9) raB++; markTried('ratio'); raRender(); });
  raRender();
})();

/* ---------- demo-circle · 6.5 圆（方法：绕绳量 + 切扇形拼长方形） ----------
   周长是绳子绕一圈：半径 3 厘米，直径 6 厘米，周长 18.84 厘米，18.84÷6=3.14。
   面积是切扇形拼长方形：长是 πr，宽是 r，所以是 πr×r=πr²。 */
let ccR = 3, ccMode = 'c', ccSlices = 8;
function ccRender() {
  const d = 2 * ccR, c = 2 * 3.14 * ccR, s = 3.14 * ccR * ccR;
  document.getElementById('ccRTx').textContent = '半径 ' + ccR + ' 厘米';
  document.getElementById('ccRopeBar').style.width = Math.round(c * 8) + 'px';
  document.getElementById('ccDiamBar').style.width = Math.round(d * 8) + 'px';
  document.getElementById('ccRopeTx').textContent = '绳子（周长）' + g6fmt(c) + ' 厘米';
  document.getElementById('ccDiamTx').textContent = '直径 ' + d + ' 厘米';
  const rect = document.getElementById('ccRect');
  rect.style.width = Math.round(3.14 * ccR * 14) + 'px';
  rect.style.height = Math.round(ccR * 14) + 'px';
  document.getElementById('ccRectTx').textContent = '长 ' + g6fmt(3.14 * ccR) + ' 厘米、宽 ' + ccR + ' 厘米的长方形';
  document.getElementById('ccCircBox').hidden = ccMode !== 'c';
  document.getElementById('ccAreaBox').hidden = ccMode !== 'a';
  document.getElementById('ccSliceRow').hidden = ccMode !== 'a';
  document.getElementById('ccRead').textContent = ccMode === 'c'
    ? '半径 ' + ccR + ' 厘米，直径 ' + d + ' 厘米：绳子绕一圈是 ' + g6fmt(c) + ' 厘米；' + g6fmt(c) + ' ÷ ' + d + ' = 3.14。'
    : '切成 ' + ccSlices + ' 个小扇形，拼成长方形：长是 πr = ' + g6fmt(3.14 * ccR) + ' 厘米，宽是 r = ' + ccR + ' 厘米，面积 = ' + g6fmt(3.14 * ccR) + ' × ' + ccR + ' = ' + g6fmt(s) + ' 平方厘米。';
  document.getElementById('ccMsg').textContent = ccMode === 'c'
    ? '周长是 π×直径，不是 π×半径；π 是比值，所有圆都一样大——这正是 π 的发现。'
    : '片越多，拼得越像长方形：4 片还是锯齿，16 片已经很像长方形了。';
  document.querySelectorAll('#ccModeSeg [data-cc-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.ccMode === ccMode));
  });
  document.querySelectorAll('#ccSliceSeg [data-cc-slices]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.ccSlices === ccSlices));
  });
}
(function ccInit() {
  const modeSeg = document.getElementById('ccModeSeg');
  [['c', '周长：绕绳量'], ['a', '面积：切扇形拼长方形']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.ccMode = m[0];
    b.addEventListener('click', function () { ccMode = m[0]; markTried('circle'); ccRender(); });
    modeSeg.appendChild(b);
  });
  const sliceSeg = document.getElementById('ccSliceSeg');
  [4, 8, 16].forEach(function (n) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = n + ' 片'; b.dataset.ccSlices = String(n);
    b.addEventListener('click', function () { ccSlices = n; markTried('circle'); ccRender(); });
    sliceSeg.appendChild(b);
  });
  document.getElementById('ccRMinus').addEventListener('click', function () { if (ccR > 1) ccR--; markTried('circle'); ccRender(); });
  document.getElementById('ccRPlus').addEventListener('click', function () { if (ccR < 10) ccR++; markTried('circle'); ccRender(); });
  ccRender();
})();

/* ---------- demo-percent · 6.6 百分数（一）（方法：百分条 0–100） ----------
   百分数就是每 100 里有几：25% = 25/100 = 1/4 = 0.25。
   100 元先降 20% 再涨 20% 是 96 元：第二次的底数是 80 元，不是 100 元。 */
let pcP = 25, pcStep = 0;
function pcGcd(a, b) { return b ? pcGcd(b, a % b) : a; }
function pcRender() {
  document.getElementById('pcFill').style.width = pcP + '%';
  document.getElementById('pcTx').textContent = pcP + '%';
  const g = pcGcd(pcP, 100);
  const frac = pcP === 0 ? '0' : pcP === 100 ? '1' : (pcP / g) + '/' + (100 / g);
  document.getElementById('pcRead').textContent =
    pcP + '% = ' + pcP + '/100 = ' + frac + ' = ' + g6fmt(pcP / 100) + '：每 100 里有 ' + pcP + '。';
  document.getElementById('pcStepRead').textContent = pcStep === 0
    ? '100 元的衣服，先降价 20%，再涨价 20%，能回到 100 元吗？点“第 1 步”试试。'
    : pcStep === 1
      ? '第 1 步：100 元降价 20%，便宜了 100×20% = 20 元，现在是 80 元。'
      : '第 2 步：在 80 元的基础上涨 20%，涨了 80×20% = 16 元，现在是 96 元——没有回到 100 元！第二次的底数是 80 元，不是 100 元。';
}
(function pcInit() {
  document.getElementById('pcMinus').addEventListener('click', function () { if (pcP > 0) pcP -= 5; markTried('percent'); pcRender(); });
  document.getElementById('pcPlus').addEventListener('click', function () { if (pcP < 100) pcP += 5; markTried('percent'); pcRender(); });
  document.getElementById('pcDown').addEventListener('click', function () { pcStep = 1; markTried('percent'); pcRender(); });
  document.getElementById('pcUp').addEventListener('click', function () {
    if (pcStep === 0) { document.getElementById('pcStepRead').textContent = '先降价，再涨价：点“第 1 步：降价 20%”。'; return; }
    pcStep = 2; markTried('percent'); pcRender();
  });
  document.getElementById('pcReset').addEventListener('click', function () { pcStep = 0; markTried('percent'); pcRender(); });
  pcRender();
})();

/* ---------- demo-fan · 6.7a 扇形统计图（方法：角度 = 百分数 × 3.6°） ----------
   整个圆是 360°，也是 100%，所以 1% 是 3.6°：40% 是 144°，25% 是 90°（直角）。 */
let fnA = 40, fnB = 35;
function fnRender() {
  const c = 100 - fnA - fnB;
  const pie = document.getElementById('fnPie');
  pie.style.background = 'conic-gradient(#f97316 0 ' + fnA + '%, #38bdf8 ' + fnA + '% ' + (fnA + fnB) + '%, #4ade80 ' + (fnA + fnB) + '% 100%)';
  document.getElementById('fnRead').textContent =
    '苹果 ' + fnA + '%，圆心角 ' + g6fmt(fnA * 3.6) + '°；香蕉 ' + fnB + '%，' + g6fmt(fnB * 3.6) + '°；橙子 ' + c + '%，' + g6fmt(c * 3.6) + '°。';
  document.getElementById('fnMsg').textContent = c === 25
    ? '橙子 25% 的扇形正好是直角：25×3.6° = 90°。每 1% 是 3.6°。'
    : '每 1% 是 3.6°：' + fnA + '% 就是 ' + fnA + '×3.6° = ' + g6fmt(fnA * 3.6) + '°。';
  document.getElementById('fnATx').textContent = '苹果 ' + fnA + '%';
  document.getElementById('fnBTx').textContent = '香蕉 ' + fnB + '%';
  document.getElementById('fnCTx').textContent = '橙子 ' + c + '%';
}
(function fnInit() {
  document.getElementById('fnAMinus').addEventListener('click', function () { if (fnA > 5) fnA -= 5; markTried('fan'); fnRender(); });
  document.getElementById('fnAPlus').addEventListener('click', function () { if (fnA < 90 && fnA + fnB < 95) fnA += 5; markTried('fan'); fnRender(); });
  document.getElementById('fnBMinus').addEventListener('click', function () { if (fnB > 5) fnB -= 5; markTried('fan'); fnRender(); });
  document.getElementById('fnBPlus').addEventListener('click', function () { if (fnB < 90 && fnA + fnB < 95) fnB += 5; markTried('fan'); fnRender(); });
  fnRender();
})();

/* ---------- demo-lsquare · 6.7b 数与形（方法：L 形拼正方形） ----------
   奇数一个一个加上去，拼出来的就是正方形：1 是 1×1，1+3 是 2×2，1+3+5 是 3×3。
   每个奇数都是一个 L 形（拐角）：每加一个奇数，就是给正方形包上一层。 */
let lsN = 1;
const LS_COLORS = ['#f97316', '#38bdf8', '#4ade80', '#c084fc', '#f472b6', '#facc15'];
function lsRender() {
  const grid = document.getElementById('lsGrid');
  grid.style.gridTemplateColumns = 'repeat(' + lsN + ', 1fr)';
  for (let i = 0; i < grid.children.length; i++) {
    const r = Math.floor(i / 6), c = i % 6;
    const cell = grid.children[i];
    const on = r < lsN && c < lsN;
    cell.hidden = !on;
    if (on) cell.style.background = LS_COLORS[Math.max(r, c)];
  }
  const odds = [];
  for (let k = 1; k <= lsN; k++) odds.push(2 * k - 1);
  document.getElementById('lsRead').textContent =
    odds.join('+') + ' = ' + (lsN * lsN) + '，是 ' + lsN + '²：' + lsN + ' 个奇数加起来是 ' + lsN + ' 的平方。';
  document.getElementById('lsMsg').textContent = lsN < 6
    ? '第 ' + (lsN + 1) + ' 层要包 ' + (2 * lsN + 1) + ' 块：每层比上一层多 2 块，拼成 ' + (lsN + 1) + '×' + (lsN + 1) + ' = ' + ((lsN + 1) * (lsN + 1)) + '。'
    : '已经包到 6 层了：1+3+5+7+9+11 = 36，是 6²。';
}
(function lsInit() {
  const grid = document.getElementById('lsGrid');
  for (let i = 0; i < 36; i++) {
    const d = document.createElement('div');
    d.className = 'ls-cell';
    grid.appendChild(d);
  }
  document.getElementById('lsMore').addEventListener('click', function () { if (lsN < 6) lsN++; markTried('lsquare'); lsRender(); });
  document.getElementById('lsLess').addEventListener('click', function () { if (lsN > 1) lsN--; markTried('lsquare'); lsRender(); });
  lsRender();
})();

/* ---------- demo-thermo · 6.8 负数（方法：竖直温度计） ----------
   负数是正数的反面：零上是正、零下是负。−5 在 −2 下面，更冷，所以更小。 */
let tpA = -3, tpB = -8;
function tpT(n) { return n < 0 ? '−' + (-n) : String(n); }
function tpRender() {
  document.getElementById('thFillA').style.height = ((tpA + 10) / 20 * 100) + '%';
  document.getElementById('thFillB').style.height = ((tpB + 10) / 20 * 100) + '%';
  document.getElementById('thATx').textContent = '今天 ' + tpT(tpA) + '℃';
  document.getElementById('thBTx').textContent = '明天 ' + tpT(tpB) + '℃';
  const read = document.getElementById('thRead');
  if (tpA === tpB) {
    read.textContent = '今天和明天一样冷：' + tpT(tpA) + '℃ = ' + tpT(tpB) + '℃。';
  } else {
    const cold = Math.min(tpA, tpB), warm = Math.max(tpA, tpB);
    const coldDay = tpA < tpB ? '今天' : '明天';
    read.textContent = '今天 ' + tpT(tpA) + '℃，明天 ' + tpT(tpB) + '℃：' + tpT(cold) + '℃ 在 ' + tpT(warm) + '℃ 下面，更冷，所以 ' + tpT(cold) + ' < ' + tpT(warm) + '——' + coldDay + '更冷。';
  }
}
(function tpInit() {
  document.getElementById('thAMinus').addEventListener('click', function () { if (tpA > -10) tpA--; markTried('thermo'); tpRender(); });
  document.getElementById('thAPlus').addEventListener('click', function () { if (tpA < 10) tpA++; markTried('thermo'); tpRender(); });
  document.getElementById('thBMinus').addEventListener('click', function () { if (tpB > -10) tpB--; markTried('thermo'); tpRender(); });
  document.getElementById('thBPlus').addEventListener('click', function () { if (tpB < 10) tpB++; markTried('thermo'); tpRender(); });
  tpRender();
})();

/* ---------- demo-negmul · 6.9 负数运算（方法：数列规律 + 翻面动画） ----------
   乘 −1 是“翻到数轴的对面”：翻一次到对面，翻两次就回来了，所以负乘负是正。
   数列：3×(−2)=−6，2×(−2)=−4，1×(−2)=−2，0×(−2)=0，(−1)×(−2)=+2。 */
const NM_ROWS = [[3, -6], [2, -4], [1, -2], [0, 0], [-1, 2], [-2, 4]];
let nmFlip = 0;
function nmRender() {
  const v = nmFlip === 0 ? 3 : -3;
  const m = document.getElementById('nmMarker');
  m.style.left = ((v + 5) / 10 * 100) + '%';
  m.textContent = (v > 0 ? '+' : '−') + Math.abs(v);
  document.getElementById('nmFlipRead').textContent = nmFlip === 0
    ? '数轴上的 3 是 +3。点“乘 −1”，看看它翻到哪。'
    : '3 乘 −1，翻到对面，是 −3。再点一次，又翻回 +3。所以负乘负是正。';
}
(function nmInit() {
  const box = document.getElementById('nmRows');
  NM_ROWS.forEach(function (row) {
    const a = row[0], ans = row[1];
    const div = document.createElement('div');
    div.className = 'nm-row';
    const label = document.createElement('span');
    label.className = 'nm-label';
    label.textContent = a + '×(−2) = ';
    const out = document.createElement('span');
    out.className = 'nm-out';
    out.textContent = '？';
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn small';
    b.textContent = '看答案';
    b.addEventListener('click', function () {
      out.textContent = (ans >= 0 ? '+' : '−') + Math.abs(ans);
      markTried('negmul');
    });
    div.appendChild(label);
    div.appendChild(out);
    div.appendChild(b);
    box.appendChild(div);
  });
  document.getElementById('nmFlip').addEventListener('click', function () { nmFlip = 1 - nmFlip; markTried('negmul'); nmRender(); });
  nmRender();
})();

/* ---------- demo-discount · 6.10 百分数（二）（方法：百分条标底数） ----------
   折扣、成数、税率、利率都是“部分 = 比率 × 底数”：先问“底数是谁”，再算。
   200 元打八折付 160 元；5000 元、年利率 2.5%、存 3 年，利息 375 元，一共取回 5375 元。 */
let diMode = 'sale', diPrice = 200, diRate = 80, diPrin = 5000, diIRate = 2.5, diYears = 3;
const DI_RATES = [[80, '八折'], [90, '九折'], [75, '七五折']];
function diRender() {
  document.getElementById('dcSaleBox').hidden = diMode !== 'sale';
  document.getElementById('dcIntBox').hidden = diMode !== 'interest';
  document.getElementById('dcPriceTx').textContent = '标价 ' + diPrice + ' 元';
  document.getElementById('dcPrinTx').textContent = '本金 ' + diPrin + ' 元';
  document.getElementById('dcYearsTx').textContent = '存 ' + diYears + ' 年';
  const rateName = DI_RATES.filter(function (r) { return r[0] === diRate; })[0][1];
  if (diMode === 'sale') {
    const pay = diPrice * diRate / 100;
    document.getElementById('dcRead').textContent =
      '标价 ' + diPrice + ' 元，打' + rateName + '：付 ' + diPrice + '×' + diRate + '% = ' + g6fmt(pay) + ' 元，省了 ' + g6fmt(diPrice - pay) + ' 元。';
    document.getElementById('diMsg').textContent =
      rateName + '是付标价的 ' + diRate + '%，不是 ' + (100 - diRate) + '%——条上 ' + diRate + '% 的部分才是要付的。';
  } else {
    const interest = diPrin * diIRate / 100 * diYears;
    document.getElementById('dcRead').textContent =
      '本金 ' + diPrin + ' 元，年利率 ' + diIRate + '%，存 ' + diYears + ' 年：利息 = ' + diPrin + '×' + diIRate + '%×' + diYears + ' = ' + g6fmt(interest) + ' 元，到期一共取回 ' + g6fmt(diPrin + interest) + ' 元。';
    document.getElementById('diMsg').textContent =
      '利息要乘时间：每一年都产生一份，存 ' + diYears + ' 年是 ' + diYears + ' 份。';
  }
  document.querySelectorAll('#dcModeSeg [data-dc-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.dcMode === diMode));
  });
  document.querySelectorAll('#dcRateSeg [data-dc-rate]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.dcRate === diRate));
  });
  document.querySelectorAll('#dcPrinSeg [data-dc-prin]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.dcPrin === diPrin));
  });
  document.querySelectorAll('#dcIRateSeg [data-dc-irate]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.dcIrate === diIRate));
  });
}
(function diInit() {
  const modeSeg = document.getElementById('dcModeSeg');
  [['sale', '打折'], ['interest', '利息']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.dcMode = m[0];
    b.addEventListener('click', function () { diMode = m[0]; markTried('discount'); diRender(); });
    modeSeg.appendChild(b);
  });
  const rateSeg = document.getElementById('dcRateSeg');
  DI_RATES.forEach(function (r) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = r[1]; b.dataset.dcRate = String(r[0]);
    b.addEventListener('click', function () { diRate = r[0]; markTried('discount'); diRender(); });
    rateSeg.appendChild(b);
  });
  const prinSeg = document.getElementById('dcPrinSeg');
  [1000, 5000].forEach(function (p) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = p + ' 元'; b.dataset.dcPrin = String(p);
    b.addEventListener('click', function () { diPrin = p; markTried('discount'); diRender(); });
    prinSeg.appendChild(b);
  });
  const irateSeg = document.getElementById('dcIRateSeg');
  [2, 2.5].forEach(function (r) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = r + '%'; b.dataset.dcIrate = String(r);
    b.addEventListener('click', function () { diIRate = r; markTried('discount'); diRender(); });
    irateSeg.appendChild(b);
  });
  document.getElementById('dcPriceMinus').addEventListener('click', function () { if (diPrice > 50) diPrice -= 50; markTried('discount'); diRender(); });
  document.getElementById('dcPricePlus').addEventListener('click', function () { if (diPrice < 500) diPrice += 50; markTried('discount'); diRender(); });
  document.getElementById('dcYearsMinus').addEventListener('click', function () { if (diYears > 1) diYears--; markTried('discount'); diRender(); });
  document.getElementById('dcYearsPlus').addEventListener('click', function () { if (diYears < 5) diYears++; markTried('discount'); diRender(); });
  diRender();
})();

/* ---------- demo-cylinder · 6.11 圆柱与圆锥（方法：展开标签 + 倒沙实验） ----------
   侧面展开是长方形：长是底面周长 2πr，宽是高 h。体积 = 底面积 × 高。
   圆锥是同底等高圆柱的 1/3：3 锥沙倒满 1 圆柱。半径 3、高 4：圆柱 113.04，圆锥 37.68。 */
let cyR = 3, cyH = 4, cyPour = 0;
function cyRender() {
  const v = 3.14 * cyR * cyR * cyH, cone = v / 3;
  const side = 2 * 3.14 * cyR * cyH, bases = 2 * 3.14 * cyR * cyR;
  document.getElementById('cyRTx').textContent = '底面半径 ' + cyR + ' 厘米';
  document.getElementById('cyHTx').textContent = '高 ' + cyH + ' 厘米';
  document.getElementById('cyRead').textContent =
    '底面半径 ' + cyR + ' 厘米，高 ' + cyH + ' 厘米：圆柱的体积 = 3.14×' + cyR + '×' + cyR + '×' + cyH + ' = ' + g6fmt(v) + ' 立方厘米；圆锥的体积是它的 1/3，是 ' + g6fmt(cone) + ' 立方厘米。';
  document.getElementById('cyMsg').textContent =
    '侧面展开是长方形：长是底面周长 ' + g6fmt(2 * 3.14 * cyR) + ' 厘米，宽是高 ' + cyH + ' 厘米，侧面积 ' + g6fmt(side) + ' 平方厘米；表面积再加两个底面 ' + g6fmt(bases) + '，一共 ' + g6fmt(side + bases) + ' 平方厘米。';
  document.getElementById('cyFill').style.height = (cyPour / 3 * 100) + '%';
  document.getElementById('cyPourRead').textContent = cyPour === 0
    ? '圆锥里装满沙，点“倒一锥沙”，看看圆柱装了多少。'
    : cyPour < 3
      ? '倒了 ' + cyPour + ' 锥沙：圆柱装了 ' + cyPour + '/3，还没满。'
      : '倒了 3 锥沙：圆柱正好满了！3 个圆锥 = 1 个圆柱，圆锥的体积是圆柱的 1/3。';
}
(function cyInit() {
  document.getElementById('cyRMinus').addEventListener('click', function () { if (cyR > 1) cyR--; markTried('cylinder'); cyRender(); });
  document.getElementById('cyRPlus').addEventListener('click', function () { if (cyR < 5) cyR++; markTried('cylinder'); cyRender(); });
  document.getElementById('cyHMinus').addEventListener('click', function () { if (cyH > 2) cyH--; markTried('cylinder'); cyRender(); });
  document.getElementById('cyHPlus').addEventListener('click', function () { if (cyH < 10) cyH++; markTried('cylinder'); cyRender(); });
  document.getElementById('cyPour').addEventListener('click', function () { if (cyPour < 3) cyPour++; markTried('cylinder'); cyRender(); });
  document.getElementById('cyReset').addEventListener('click', function () { cyPour = 0; markTried('cylinder'); cyRender(); });
  cyRender();
})();

/* ---------- demo-pigeon · 6.13 鸽巢问题（方法：先每洞一只） ----------
   n+1 只鸽子飞进 n 个鸽巢，一定有一个巢里至少有 2 只：先每个巢放 1 只，
   第 n+1 只没地方去，只能合住。13 支铅笔放进 4 个盒，至少一个盒里有 4 支。 */
let piN = 5, piM = 4, piStage = 0;
function piCounts() {
  const base = Math.floor(piN / piM), rem = piN % piM;
  const a = [];
  for (let i = 0; i < piM; i++) a.push(base + (i < rem ? 1 : 0));
  return a;
}
function piRender() {
  const nests = document.getElementById('pgNests');
  const counts = piCounts();
  for (let i = 0; i < nests.children.length; i++) {
    const nest = nests.children[i];
    nest.hidden = i >= piM;
    if (i < piM) {
      const dots = nest.children[1].children;
      const show = piStage === 0 ? 0 : piStage === 1 ? 1 : counts[i];
      for (let j = 0; j < dots.length; j++) dots[j].hidden = j >= show;
      nest.children[0].textContent = '洞 ' + (i + 1) + '：' + show + ' 只';
    }
  }
  const left = document.getElementById('pgLeft');
  left.textContent = piStage === 0
    ? '一共 ' + piN + ' 只鸽子。'
    : piStage === 1
      ? '每个洞先放 1 只，放了 ' + piM + ' 只，还剩 ' + (piN - piM) + ' 只没地方去。'
      : '分完了：' + counts.join('、') + ' 只。';
  const read = document.getElementById('piRead');
  if (piStage === 0) {
    read.textContent = piN + ' 只鸽子，' + piM + ' 个鸽巢：点“每个洞先放一只”。';
  } else if (piStage === 1) {
    read.textContent = '每个洞先放 1 只，还剩 ' + (piN - piM) + ' 只——它们只能进已经有鸽子的洞。点“剩下的只能合住”。';
  } else {
    read.textContent = '一定有一个洞里至少有 ' + Math.ceil(piN / piM) + ' 只鸽子：' + piN + '÷' + piM + ' = ' + Math.floor(piN / piM) + ' 余 ' + (piN % piM) + '，多出来的只能合住。';
  }
  document.querySelectorAll('#pgNSeg [data-pg-n]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.pgN === piN));
  });
  document.querySelectorAll('#pgMSeg [data-pg-m]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.pgM === piM));
  });
}
(function piInit() {
  const nests = document.getElementById('pgNests');
  for (let i = 0; i < 9; i++) {
    const nest = document.createElement('div');
    nest.className = 'pg-nest';
    const label = document.createElement('div');
    label.className = 'pg-label';
    const dots = document.createElement('div');
    dots.className = 'pg-dots';
    for (let j = 0; j < 5; j++) {
      const d = document.createElement('span');
      d.className = 'pg-bird';
      d.textContent = '●';
      dots.appendChild(d);
    }
    nest.appendChild(label);
    nest.appendChild(dots);
    nests.appendChild(nest);
  }
  const nSeg = document.getElementById('pgNSeg');
  [5, 7, 10, 13].forEach(function (n) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = n + ' 只'; b.dataset.pgN = String(n);
    b.addEventListener('click', function () { piN = n; piStage = 0; markTried('pigeon'); piRender(); });
    nSeg.appendChild(b);
  });
  const mSeg = document.getElementById('pgMSeg');
  [3, 4, 9].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m + ' 个'; b.dataset.pgM = String(m);
    b.addEventListener('click', function () { piM = m; piStage = 0; markTried('pigeon'); piRender(); });
    mSeg.appendChild(b);
  });
  document.getElementById('pgStep1').addEventListener('click', function () { piStage = 1; markTried('pigeon'); piRender(); });
  document.getElementById('pgStep2').addEventListener('click', function () {
    if (piStage === 0) { document.getElementById('piRead').textContent = '先点“每个洞先放一只”。'; return; }
    piStage = 2; markTried('pigeon'); piRender();
  });
  document.getElementById('pgReset').addEventListener('click', function () { piStage = 0; markTried('pigeon'); piRender(); });
  piRender();
})();

/* ---------- demo-conceptmap · 6.14 整理和复习（方法：概念地图 + 一题多解） ----------
   复习不是重背步骤，是认出老办法：这道题是条形图？是 ×1？是切一切？
   先问“这是哪个老办法”，再动手。 */
const CM_ITEMS = [
  { q: '甲、乙两数的和是 48，甲数是乙数的 3 倍，甲、乙两数各是多少？', m: '条形图', a: '乙是 1 份，甲是 3 份，一共 4 份，每份 12：甲 36，乙 12。' },
  { q: '1/2 = 2/4 = 3/6，约分、比的基本性质，背后是同一个什么办法？', m: '×1', a: '分子分母同时乘同一个数，值不变：2/4 是 1/2 的分子分母同时乘 2，乘 2/2 就是乘 1。' },
  { q: '一根绳子长 12 米，先用去它的 1/3，再用去剩下的 1/4，还剩多少米？', m: '找整体和部分', a: '第一次用去 12 的 1/3 是 4 米，剩 8 米；第二次用去 8 的 1/4 是 2 米，还剩 6 米。' }
];
(function cmInit() {
  const list = document.getElementById('cmList');
  CM_ITEMS.forEach(function (item, i) {
    const card = document.createElement('div');
    card.className = 'cm-card';
    const q = document.createElement('p');
    q.className = 'cm-q';
    q.textContent = (i + 1) + '. ' + item.q;
    const ans = document.createElement('p');
    ans.className = 'func-eq';
    ans.textContent = '点按钮，看看它用了哪个老办法。';
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn small primary';
    b.textContent = '这是哪个老办法？';
    b.addEventListener('click', function () {
      ans.textContent = '老办法：' + item.m + '——' + item.a;
      markTried('conceptmap');
    });
    card.appendChild(q);
    card.appendChild(ans);
    card.appendChild(b);
    list.appendChild(card);
  });
})();
