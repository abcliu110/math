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

/* ---------- 进度（原型：只记三个演示是否玩过） ---------- */
const tried = new Set();
const FLAGSHIP = ['fraction', 'balance', 'function'];
// 刷新后进度还在：已体验的演示存在本地（只存本机，不上传）。
try { JSON.parse(lsGet('math-tried-demos-v1') || '[]').forEach(k => tried.add(k)); } catch (e) {}
function renderTried() {
  document.getElementById('progressCount').textContent = tried.size + ' / 3';
  document.getElementById('progressFill').style.width = (tried.size / 3 * 100) + '%';
  const pf = document.getElementById('panelProgFill');
  if (pf) pf.style.width = (tried.size / 3 * 100) + '%';
  const pt = document.getElementById('panelProgTx');
  if (pt) pt.textContent = tried.size + ' / 3 个演示';
  const dp = document.getElementById('panelDemoProg');
  if (dp) dp.style.width = (tried.size / 3 * 100) + '%';
  const dt = document.getElementById('panelDemoTx');
  if (dt) dt.textContent = '3 个演示 · ' + tried.size + ' 已体验';
  document.getElementById('progressText').textContent =
    tried.size === 3 ? '三个演示都玩过了！下一步可以选一个年级做完整单元。'
    : '已体验 ' + tried.size + ' / 3 个演示，继续玩剩下的吧。';
}
function markTried(key) {
  if (!FLAGSHIP.includes(key)) return; // “为什么”小实验不计入 3 个招牌演示的进度
  if (!tried.has(key)) {
    tried.add(key);
    lsSet('math-tried-demos-v1', JSON.stringify([...tried]));
    renderTried();
  }
}
renderTried();

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

/* ---------- 年级选择 ---------- */
/* 年级菜单层级是面板：9 块年级面板，点一块进该年级（走 navGo，不是直接调 selectGrade）。 */
const gradePanels = document.getElementById('gradePanels');
const gradeDetail = document.getElementById('gradeDetail');
let currentGrade = 3;
Object.keys(GRADES).forEach(g => {
  const b = document.createElement('button');
  b.className = 'panel'; b.type = 'button'; b.dataset.navKey = 'grade-' + g;
  b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(+g === currentGrade));
  b.innerHTML = '<span class="panel-icon" aria-hidden="true">' + g + '</span><b>' + g + ' 年级</b>' +
    '<span class="panel-sub">' + GRADES[g].stage + ' · ' + GRADES[g].title.split('· ')[1] + '</span>' +
    '<span class="panel-prog"><i style="width:0%"></i></span>' +
    '<span class="panel-tx">' + GRADES[g].units.length + ' 个单元</span>';
  gradePanels.appendChild(b);
});
function selectGrade(g) {
  currentGrade = g;
  updateModeUI('grade');
  [...gradePanels.children].forEach((el, i) => el.setAttribute('aria-selected', String(i + 1 === g)));
  const d = GRADES[g];
  const g3 = (g === 3) ? grade3Data() : null;
  if (g3) {
    // 3 年级已有真实内容：按人教版 A 版单元列出，点一个单元进它的知识点。
    const total = g3.units.reduce((n, u) => n + u.points.length, 0);
    const due = duePointIds().length;
    gradeDetail.innerHTML =
      '<h3>' + d.title + '</h3><p class="muted">人教版 A 版顺序 · ' + g3.units.length + ' 个单元 · ' + total + ' 个知识点；每条都有怎么做、为什么、容易错、讲回来。</p>' +
      '<div class="btn-row"><button class="btn primary" type="button" data-g3-mix="1">混着练：5 道不同单元的题</button>' +
      '<button class="btn ghost" type="button" data-g3-review="1">今天复习（' + due + ' 条）</button></div>' +
      '<div class="unit-list">' + g3.units.map((u, i) =>
        '<button class="unit unit-btn" type="button" data-unit="' + i + '"><b>' + esc(u.unit) + '</b><p>' + esc(u.term) + ' · ' + u.points.length + ' 个知识点</p>' +
        '<span class="pill">内容已完成</span></button>'
      ).join('') + '</div>';
    gradeDetail.querySelectorAll('[data-unit]').forEach(btn =>
      btn.addEventListener('click', () => navGo('unit-3-' + btn.dataset.unit)));
    gradeDetail.querySelectorAll('[data-g3-mix]').forEach(btn =>
      btn.addEventListener('click', () => navGo('grade-3-mix')));
    gradeDetail.querySelectorAll('[data-g3-review]').forEach(btn =>
      btn.addEventListener('click', () => navGo('grade-3-review')));
    return;
  }
  gradeDetail.innerHTML =
    '<h3>' + d.title + '</h3><p class="muted">每节课走四步：动手试一试 → 说一说 → 练一练 → 测一测。</p>' +
    '<div class="unit-list">' + d.units.map(u =>
      '<div class="unit"><b>' + u.name + '</b><p>' + u.topics + '</p>' +
      '<span class="pill">可视化：' + u.visual + '</span><span class="pill">状态：待制作</span></div>'
    ).join('') + '</div>';
}
selectGrade(currentGrade);

/* ---------- 3 年级真实内容（content/grades/grade-3.js 提供 GRADE3_CONTENT） ----------
   内容与原型逻辑分开：知识点文字只活在 content/ 里，app.js 只负责渲染。
   层级：3 年级 → 单元 → 知识点，每条知识点一页：怎么做、为什么、容易错、
   看图学、动手试一试、讲回来、练一练。文件没加载到时，3 年级退回旧的 4 单元占位。 */
const pointDetail = document.getElementById('pointDetail');
function grade3Data() { return (typeof GRADE3_CONTENT !== 'undefined' && GRADE3_CONTENT) || null; }
function findPoint(id) {
  const g3 = grade3Data();
  if (!g3) return null;
  for (let ui = 0; ui < g3.units.length; ui++) {
    const p = g3.units[ui].points.find(pt => pt.id === id);
    if (p) return { point: p, unit: g3.units[ui], unitIndex: ui };
  }
  return null;
}
function renderUnit(ui) {
  const g3 = grade3Data();
  if (!g3 || !g3.units[ui]) return;
  const u = g3.units[ui];
  pointDetail.innerHTML =
    '<h3>' + esc(u.unit) + '</h3><p class="muted">' + esc(u.term) + ' · ' + u.points.length + ' 个知识点 · 点一条进内容。</p>' +
    '<div class="unit-list">' + u.points.map(p =>
      '<button class="unit unit-btn" type="button" data-point="' + esc(p.id) + '"><b>' + esc(p.id) + ' · ' + esc(p.title) + '</b><p>' + esc(p.subtitle) + '</p>' +
      '<span class="pill">' + esc(p.method) + '</span></button>'
    ).join('') + '</div>';
  pointDetail.querySelectorAll('[data-point]').forEach(btn =>
    btn.addEventListener('click', () => navGo('point-' + btn.dataset.point)));
}
function renderPoint(id) {
  const f = findPoint(id);
  if (!f) return;
  const p = f.point;
  currentPointId = id;
  const recallHtml = p.recall
    ? '<div class="point-sec recall"><h4>先考一考（先想，再往下看）</h4><p>' + esc(p.recall.q) + '</p>' +
      '<button class="btn ghost small qa-btn" type="button" data-recall="1">想好了，看答案</button>' +
      '<p class="qa-a" data-recall-a hidden>答案：' + esc(p.recall.answer) + '（提示：' + esc(p.recall.hint) + '）</p></div>'
    : '';
  let html = '<h3>' + esc(p.id) + ' · ' + esc(p.title) + '</h3>' +
    '<p class="muted">' + esc(f.unit.unit) + '（' + esc(f.unit.term) + '）· 最佳方法：' + esc(p.method) + '</p>' +
    '<p class="muted">' + esc(p.subtitle) + '</p>' + recallHtml +
    '<div class="point-sec"><h4>怎么做</h4><p>' + esc(p.how) + '</p></div>' +
    '<div class="point-sec"><h4>为什么</h4><p>' + esc(p.why) + '</p></div>' +
    '<div class="point-sec warn"><h4>容易错</h4><p>错法：' + esc(p.wrong) + '</p><p>为什么错：' + esc(p.wrongWhy) + '</p></div>' +
    '<div class="point-sec"><h4>看图学</h4><p>' + esc(p.visual) + '</p></div>' +
    '<div class="point-sec"><h4>动手试一试</h4><p>' + esc(p.tryIt) + '</p>' +
    (p.demo === 'fraction' ? '<div class="btn-row"><button class="btn primary" type="button" data-demo-link="demo-fraction">去玩分数演示</button></div>' : '') + '</div>' +
    '<div class="point-sec talk"><h4>讲回来</h4><p>“' + esc(p.explainBack) + '”</p></div>' +
    '<div class="point-sec"><h4>练一练</h4><p class="muted">第一道题提示直接给，第二道题先自己做，卡住了再点“要提示”。答完先对答案，再告诉我你答对没、有把握没——答错的和没把握的，明天会回来找你。</p>' + p.practice.map((q, i) =>
      '<div class="qa"><p>' + (i + 1) + '. ' + esc(q.q) + '</p>' +
      (i === 0 ? '<p class="hint">提示：' + esc(q.hint) + '</p>' : '') +
      (i === 1 ? '<button class="btn ghost small qa-btn" type="button" data-hint="' + i + '">要提示</button><p class="hint" data-hint-t="' + i + '" hidden>提示：' + esc(q.hint) + '</p>' : '') +
      '<button class="btn ghost small qa-btn" type="button" data-qa="' + i + '">看答案</button>' +
      '<p class="qa-a" data-qa-a="' + i + '" hidden>答案：' + esc(q.answer) + '</p>' +
      '<div class="qa-mark" data-qa-mark="' + i + '" data-point="' + esc(id) + '" hidden>' +
      '<p>你答对了吗？ <button class="btn small" type="button" data-mark="right">答对了</button> <button class="btn small" type="button" data-mark="wrong">答错了</button></p>' +
      '<p>答之前有把握吗？ <button class="btn small" type="button" data-conf="yes">有把握</button> <button class="btn small" type="button" data-conf="no">没把握</button></p>' +
      '<p class="qa-a" data-qa-saved="' + i + '" hidden></p></div></div>'
    ).join('') + '</div>';
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
function renderMix() {
  const g3 = grade3Data();
  if (!g3) return;
  const picks = shuffle(g3.units.filter(u => u.points.length)).slice(0, 5).map(u => {
    const p = u.points[Math.floor(Math.random() * u.points.length)];
    return { point: p, q: p.practice[Math.floor(Math.random() * p.practice.length)] };
  });
  currentPointId = null;
  pointDetail.innerHTML = '<h3>混着练</h3><p class="muted">5 道题，来自 5 个不同单元——混着练比一个单元一个单元刷记得更牢。答完对答案，再告诉我对错和把握。</p>' + picks.map((pk, i) =>
    '<div class="point-sec"><h4>' + esc(pk.point.id) + ' · ' + esc(pk.point.title) + '</h4><p>' + esc(pk.q.q) + '</p>' +
    '<button class="btn ghost small qa-btn" type="button" data-qa="' + i + '">看答案</button>' +
    '<p class="qa-a" data-qa-a="' + i + '" hidden>答案：' + esc(pk.q.answer) + '（提示：' + esc(pk.q.hint) + '）</p>' +
    '<div class="qa-mark" data-qa-mark="' + i + '" data-point="' + esc(pk.point.id) + '" hidden>' +
    '<p>你答对了吗？ <button class="btn small" type="button" data-mark="right">答对了</button> <button class="btn small" type="button" data-mark="wrong">答错了</button></p>' +
    '<p>答之前有把握吗？ <button class="btn small" type="button" data-conf="yes">有把握</button> <button class="btn small" type="button" data-conf="no">没把握</button></p>' +
    '<p class="qa-a" data-qa-saved="' + i + '" hidden></p></div></div>'
  ).join('') + '<div class="btn-row"><button class="btn primary" type="button" data-mix-again="1">再混 5 道</button></div>';
  pointDetail.querySelectorAll('[data-mix-again]').forEach(b => b.addEventListener('click', renderMix));
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
  pointDetail.innerHTML = html;
  pointDetail.querySelectorAll('[data-point]').forEach(btn =>
    btn.addEventListener('click', () => navGo('point-' + btn.dataset.point)));
}
if (pointDetail) pointDetail.addEventListener('click', e => {
  const recallBtn = e.target.closest('[data-recall]');
  if (recallBtn) {
    const ans = pointDetail.querySelector('[data-recall-a]');
    if (ans) { ans.hidden = !ans.hidden; recallBtn.textContent = ans.hidden ? '想好了，看答案' : '收起答案'; }
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
    '<li><b>' + t.g + ' 年级 · ' + esc(t.t) + '</b><p class="why-line">为什么：' + esc(t.why) + '</p></li>'
  ).join('') + '</ul>';
}
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
    html += d.cats.map(c =>
      '<div class="dim-cat"><h3>' + esc(c.name) + '</h3><p>' + esc(c.desc) + '</p>' + topicListHTML(c.topics) + '</div>'
    ).join('');
  }
  dimDetail.innerHTML = html;
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
    '<span class="panel-prog"><i style="width:20%"></i></span><span class="panel-tx">' + count + '</span>';
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
  'demo-fraction': { crumbs: ['数学', '互动演示', '分数切一切'], target: 'demo-fraction' },
  'demo-balance':  { crumbs: ['数学', '互动演示', '天平解方程'], target: 'demo-balance' },
  'demo-function': { crumbs: ['数学', '互动演示', '函数滑杆'], target: 'demo-function' },
  why:        { crumbs: ['数学', '互动演示', '为什么小实验'], target: 'why' },
  review:     { crumbs: ['数学', '错题本'], target: 'review' },
  progress:   { crumbs: ['数学', '我的进度'], target: 'progressCard' },
};
Object.keys(GRADES).forEach(g => {
  NAV_DEFS['grade-' + g] = { crumbs: ['数学', '选年级', g + ' 年级'], target: 'grades', action: () => selectGrade(+g) };
});
DIMENSIONS.forEach(d => {
  NAV_DEFS['dim-' + d.id] = { crumbs: ['数学', '换维度', d.name], target: 'dimensions', action: () => { renderDimension(d.id); updateModeUI('dimension'); } };
});
/* 3 年级内容导航：单元与知识点各一级（面包屑：数学 › 选年级 › 3 年级 › 单元 › 知识点）。
   内容文件没加载到时不注册，3 年级保持旧的 4 单元占位。 */
(function registerGrade3Nav() {
  const g3 = grade3Data();
  if (!g3) return;
  g3.units.forEach((u, ui) => {
    NAV_DEFS['unit-3-' + ui] = { crumbs: ['数学', '选年级', '3 年级', u.unit], target: 'grades', action: () => renderUnit(ui) };
    u.points.forEach(p => {
      NAV_DEFS['point-' + p.id] = { crumbs: ['数学', '选年级', '3 年级', u.unit, p.title], target: 'grades', action: () => renderPoint(p.id) };
    });
  });
  NAV_DEFS['grade-3-mix'] = { crumbs: ['数学', '选年级', '3 年级', '混着练'], target: 'grades', action: renderMix };
  NAV_DEFS['grade-3-review'] = { crumbs: ['数学', '选年级', '3 年级', '今天复习'], target: 'grades', action: renderReview };
  // 3 年级面板改显示真实进度：16 个知识点已完成。
  const panel3 = document.querySelector('[data-nav-key="grade-3"] .panel-tx');
  if (panel3) panel3.textContent = g3.units.reduce((n, u) => n + u.points.length, 0) + ' 个知识点 · 已完成';
})();

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
const reviewSec = document.getElementById('review');
const progressCardEl = document.getElementById('progressCard');
const reviewCardEl = document.getElementById('reviewCard');
const nextStepsEl = document.getElementById('nextSteps');
const footerEl = document.getElementById('pageFooter');
function viewForKey(key) {
  if (key === 'home') return 'home';
  if (key === 'grades') return 'grades';
  // 注意顺序：'grade-3-mix' / 'grade-3-review' 也以 'grade-' 开头，必须先精确匹配，
  // 否则会被下面的 startsWith('grade-') 吞掉，混着练和今天复习就会显示成年级详情（2026-11-06 真机测出）。
  if (key === 'grade-3-mix') return 'mix';
  if (key === 'grade-3-review') return 'review';
  if (key.startsWith('grade-')) return 'grade-detail';
  if (key.startsWith('unit-')) return 'unit-detail';
  if (key.startsWith('point-')) return 'point-detail';
  if (key === 'dimensions') return 'dimensions';
  if (key.startsWith('dim-')) return 'dim-detail';
  if (key === 'path') return 'path';
  if (key.startsWith('path-step-')) return 'path-step';
  if (key === 'demos') return 'demos';
  if (key === 'demo-fraction' || key === 'demo-balance' || key === 'demo-function') return key;
  if (key === 'why') return 'why';
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
  const inGrades = view === 'grades' || view === 'grade-detail' || view === 'unit-detail' || view === 'point-detail' || view === 'mix' || view === 'review';
  setHidden(gradesSec, !inGrades);
  setHidden(gradePanels, view !== 'grades');
  setHidden(gradeDetail, view !== 'grade-detail');
  setHidden(pointDetail, !(view === 'unit-detail' || view === 'point-detail' || view === 'mix' || view === 'review'));
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
  const demoLeaf = view === 'demo-fraction' || view === 'demo-balance' || view === 'demo-function';
  setHidden(demosSec, !(view === 'demos' || demoLeaf));
  setHidden(demoPanelsEl, view !== 'demos');
  setHidden(demoGridEl, !demoLeaf); // 演示卡片网格只在某一个演示的叶子视图里出现，列表视图只留演示面板
  setHidden(demosSec.querySelector('h2'), demoLeaf);
  setHidden(demosSec.querySelector('.section-sub'), demoLeaf);
  [...demoGridEl.children].forEach(el => { el.hidden = demoLeaf && el.id !== view; });
  setHidden(whySec, view !== 'why');
  // 复习与进度：错题本只留错题卡片，我的进度只留进度卡片
  setHidden(reviewSec, !(view === 'review' || view === 'progress'));
  setHidden(progressCardEl, view !== 'progress');
  setHidden(reviewCardEl, view !== 'review');
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
  if (key.startsWith('unit-')) return 'grade-3';
  if (key === 'grade-3-mix' || key === 'grade-3-review') return 'grade-3';
  if (key.startsWith('point-')) {
    const f = findPoint(key.slice('point-'.length));
    return f ? 'unit-3-' + f.unitIndex : 'grade-3';
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

/* ---------- P1 分数 ---------- */
let denom = 4, numer = 3;
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
  for (let i = 0; i < denom; i++) {
    const a0 = i * 360 / denom, a1 = (i + 1) * 360 / denom;
    const filled = i < numer;
    svg += '<path d="' + sector(100, 100, 88, a0, a1) + '" fill="' + (filled ? '#ff8a3d' : '#fff3e6') +
      '" stroke="#c2410c" stroke-width="2" data-slice="' + i + '" style="cursor:pointer"/>';
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

/* ---------- P2 天平 ---------- */
let balStage = 0; // 0: 3x+5=20, 1: 3x=15, 2: x=5
let balTilt = 0;
function renderBalance() {
  const eq = document.getElementById('balanceEq');
  const msg = document.getElementById('balanceMsg');
  const beam = document.getElementById('beamGroup');
  beam.setAttribute('transform', 'rotate(' + balTilt + ' 160 70)');
  let left = '', right = '';
  if (balStage === 0) {
    eq.textContent = '3x + 5 = 20';
    for (let i = 0; i < 3; i++) left += '<rect x="' + (38 + i * 20) + '" y="78" width="18" height="18" rx="3" fill="#2563eb"/><text x="' + (47 + i * 20) + '" y="92" font-size="11" fill="#fff" text-anchor="middle">x</text>';
    left += '<rect x="48" y="58" width="24" height="16" rx="3" fill="#ff8a3d"/><text x="60" y="70" font-size="11" fill="#fff" text-anchor="middle">5</text>';
    right += '<rect x="248" y="58" width="24" height="16" rx="3" fill="#ff8a3d"/><text x="260" y="70" font-size="11" fill="#fff" text-anchor="middle">20</text>';
    if (balTilt !== 0) msg.textContent = '天平歪了！只动一边不行，两边要一起动。点“重置”再试。';
    else msg.textContent = '天平是平的。先试试两边同时 −5。';
  } else if (balStage === 1) {
    eq.textContent = '3x = 15';
    for (let i = 0; i < 3; i++) left += '<rect x="' + (38 + i * 20) + '" y="78" width="18" height="18" rx="3" fill="#2563eb"/><text x="' + (47 + i * 20) + '" y="92" font-size="11" fill="#fff" text-anchor="middle">x</text>';
    right += '<rect x="248" y="58" width="24" height="16" rx="3" fill="#ff8a3d"/><text x="260" y="70" font-size="11" fill="#fff" text-anchor="middle">15</text>';
    msg.textContent = '两边都拿掉 5，天平还是平的。现在两边同时 ÷3。';
  } else {
    eq.textContent = 'x = 5';
    left += '<rect x="48" y="78" width="18" height="18" rx="3" fill="#2563eb"/><text x="57" y="92" font-size="11" fill="#fff" text-anchor="middle">x</text>';
    right += '<rect x="248" y="58" width="24" height="16" rx="3" fill="#ff8a3d"/><text x="260" y="70" font-size="11" fill="#fff" text-anchor="middle">5</text>';
    msg.textContent = '解出来了：x = 5。验算：3×5 + 5 = 20 ✓';
  }
  document.getElementById('leftWeights').innerHTML = left;
  document.getElementById('rightWeights').innerHTML = right;
  document.getElementById('balMinus5').disabled = balStage !== 0 || balTilt !== 0;
  document.getElementById('balDiv3').disabled = balStage !== 1;
  document.getElementById('balWrong').disabled = balStage !== 0 || balTilt !== 0;
}
document.getElementById('balMinus5').addEventListener('click', () => { balStage = 1; balTilt = 0; renderBalance(); markTried('balance'); });
document.getElementById('balDiv3').addEventListener('click', () => { balStage = 2; renderBalance(); markTried('balance'); });
document.getElementById('balWrong').addEventListener('click', () => { balTilt = -12; renderBalance(); markTried('balance'); });
document.getElementById('balReset').addEventListener('click', () => { balStage = 0; balTilt = 0; renderBalance(); });
renderBalance();

/* ---------- P3 函数 ---------- */
const canvas = document.getElementById('funcCanvas');
const ctx = canvas.getContext('2d');
function drawFunc() {
  const k = parseFloat(document.getElementById('kRange').value);
  const b = parseFloat(document.getElementById('bRange').value);
  document.getElementById('kLabel').textContent = k;
  document.getElementById('bLabel').textContent = b;
  document.getElementById('funcK').textContent = k;
  document.getElementById('funcB').textContent = b;
  const W = canvas.width, H = canvas.height;
  const xMin = -5, xMax = 6, yMin = -10, yMax = 24;
  const X = x => 50 + (x - xMin) / (xMax - xMin) * (W - 70);
  const Y = y => H - 40 - (y - yMin) / (yMax - yMin) * (H - 70);
  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
  for (let x = xMin; x <= xMax; x++) { ctx.beginPath(); ctx.moveTo(X(x), Y(yMin)); ctx.lineTo(X(x), Y(yMax)); ctx.stroke(); }
  for (let y = -10; y <= 20; y += 5) { ctx.beginPath(); ctx.moveTo(X(xMin), Y(y)); ctx.lineTo(X(xMax), Y(y)); ctx.stroke(); }
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(X(xMin), Y(0)); ctx.lineTo(X(xMax), Y(0)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(X(0), Y(yMin)); ctx.lineTo(X(0), Y(yMax)); ctx.stroke();
  ctx.fillStyle = '#64748b'; ctx.font = '13px system-ui';
  ctx.fillText('x', X(xMax) - 8, Y(0) - 8); ctx.fillText('y', X(0) + 8, Y(yMax) + 14);
  // line y = kx + b
  ctx.strokeStyle = '#ff8a3d'; ctx.lineWidth = 4; ctx.beginPath();
  ctx.moveTo(X(xMin), Y(k * xMin + b)); ctx.lineTo(X(xMax), Y(k * xMax + b)); ctx.stroke();
  // intercept (0,b)
  ctx.fillStyle = '#2563eb'; ctx.beginPath(); ctx.arc(X(0), Y(b), 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1d4ed8'; ctx.font = 'bold 14px system-ui';
  ctx.fillText('(0, ' + b + ')', X(0) + 12, Y(b) - 8);
  // table
  [0, 1, 2, 3, 5].forEach(x => { document.getElementById('y' + x).textContent = (k * x + b); });
  document.getElementById('funcChallenge').textContent =
    '小挑战：x = 2 公里时要付 ' + (k * 2 + b) + ' 元。试试把起步价调到 10 元，2 公里又是多少？';
}
document.getElementById('kRange').addEventListener('input', () => { drawFunc(); markTried('function'); });
document.getElementById('bRange').addEventListener('input', () => { drawFunc(); markTried('function'); });
drawFunc();

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
