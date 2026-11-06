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
   145 个动画全都计入：4 个经典演示 + 13 个一年级实验 + 15 个二年级实验 + 14 个三年级实验 + 20 个四年级实验（16 个 + 鸡兔同笼 4 种方法） + 11 个五年级实验 + 12 个六年级实验 + 13 个七年级实验 + 11 个八年级实验 + 15 个九年级实验 + 9 个创意实验 + 8 个互动模拟 = 145 个。
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
  'decadd', 'moveshape', 'average', 'chickenrabbit', 'crslider', 'crdraw', 'crlist', 'crgolden',
  'decmul', 'gridpos', 'decdiv', 'prob', 'polyarea', 'planttree',
  'factor', 'cuboid', 'fracadd', 'rotate', 'findbad',
  'radar', 'ratio', 'circle', 'percent', 'fan', 'lsquare', 'thermo', 'negmul',
  'discount', 'cylinder', 'pigeon', 'conceptmap',
  'numline', 'powerup', 'monomial', 'liketerms', 'meetline', 'lineseg', 'anglepair',
  'vertangle', 'parangles', 'roots', 'coordplane', 'ineqline', 'histogram',
  'trisides', 'congruent', 'foldmirror', 'algarea', 'algfrac', 'eqsieve',
  'radical', 'pythag', 'pargram', 'specialquad', 'datastats',
  'quad', 'growth', 'parabola', 'spin', 'circangle', 'tangent', 'sector', 'coin',
  'tree', 'hyperbola', 'similar', 'shadow', 'trig', 'slope', 'project',
  'twentyfour', 'monty', 'maxarea', 'matches', 'mobius', 'shopweek', 'fairgame', 'makerule', 'thirteen', 'maketen', 'areamul', 'fraceq', 'buildfrac', 'areabuild', 'quadmorph', 'numplay', 'fracnumline'];
// 刷新后进度还在：已体验的演示存在本地（只存本机，不上传）。
try { JSON.parse(lsGet('math-tried-demos-v1') || '[]').forEach(k => tried.add(k)); } catch (e) {}
// 已体验演示的唯一事实来源：内存里的 tried 集合。启动时从存储读一次，
// 之后 markTried 只改集合 + 写回存储；别的标签页改了存储时，storage 事件
// 会把集合重新同步过来。所有显示（顶栏、面板、进度页、家长端、闯关路）
// 都读这个集合，不再各读各的存储快照——以前家长端现读存储、别处读内存，
// 并行开两个窗口时两边数字会分叉（真机复测：39/124 对 31/124，43/109 对 42/109）。
function syncTriedFromStorage() {
  try {
    const a = JSON.parse(lsGet('math-tried-demos-v1') || '[]');
    if (Array.isArray(a)) { tried.clear(); a.forEach(k => { if (ALL_DEMOS.includes(k)) tried.add(k); }); }
  } catch (e) {}
}
function renderTried() {
  syncTriedFromStorage();
  const n = ALL_DEMOS.length;
  const pc = document.getElementById('progressCount');
  if (pc) pc.textContent = tried.size + ' / ' + n;
  const pf = document.getElementById('panelProgFill');
  if (pf) pf.style.width = (tried.size / n * 100) + '%';
  const pt = document.getElementById('panelProgTx');
  if (pt) pt.textContent = tried.size + ' / ' + n + ' 个动画';
  const dp = document.getElementById('panelDemoProg');
  if (dp) dp.style.width = (tried.size / n * 100) + '%';
  const dt = document.getElementById('panelDemoTx');
  if (dt) dt.textContent = n + ' 个动画 · ' + tried.size + ' 已体验';
  const pFill = document.getElementById('progressFill');
  if (pFill) pFill.style.width = (tried.size / n * 100) + '%';
  const pText = document.getElementById('progressText');
  if (pText) pText.textContent =
    tried.size === n ? '动画都玩过了！下一步可以选一个年级做完整单元。'
    : '已体验 ' + tried.size + ' / ' + n + ' 个动画，继续玩剩下的吧。';
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
// 别的标签页改了已体验记录：同步过来、刷新所有显示（storage 事件只在
// 改动的那个标签页之外的标签页触发，本页自己的 markTried 不走这里）。
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('storage', function (e) {
    if (e && e.key === 'math-tried-demos-v1') { syncTriedFromStorage(); renderTried(); }
    // 复习库也是跨标签页共享的：别的窗口记了一笔错题，这边错题本、进度页都要立刻跟上
    // （和演示进度一样的单源头 + storage 事件；换数字错题不用同步，它每次现读存储）。
    if (e && e.key === REVIEW_KEY) { syncReviewFromStorage(); renderWrongBook(); renderProgress(); }
  });
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
/* 别的标签页改了复习库：重新从存储读一份，内存里那份就作废——
   以前只同步了演示进度，复习库只在启动时读一次，两个窗口的错题数会分叉
   （真机复测 7edb765：新开的标签页 5 条，原标签页 4 条）。 */
function syncReviewFromStorage() {
  try {
    const a = JSON.parse(lsGet(REVIEW_KEY) || '{}');
    if (a && typeof a === 'object') reviewStore = a;
  } catch (e) {}
}
/* 8 个模拟的三档 ✓ 存在这里（demoKey -> [三档是否打勾]），刷新页面后恢复。
   复用不了已有的键：math-tried-demos-v1 只记“玩过没有”，review/inquiry 各有自己的结构。 */
const SIM_TIERS_KEY = 'math-sim-tiers-v1';
function loadSimTiers() {
  try { const o = JSON.parse(lsGet(SIM_TIERS_KEY) || '{}'); return o && typeof o === 'object' ? o : {}; }
  catch (e) { return {}; }
}
function saveSimTiers(o) { lsSet(SIM_TIERS_KEY, JSON.stringify(o)); }
function recordAttempt(pointId, correct, confident) {
  // 先从存储重读一份再写：两个标签页同时记题，后写的会盖掉先写的
  // （真机复测：一个标签页 5 条、新开的标签页 4 条）。storeFailedQgen 本来就每次现读，
  // 复习库这里以前只读内存里的那份。
  syncReviewFromStorage();
  const prev = reviewStore[pointId] || { streak: 0 };
  const streak = correct ? (prev.streak || 0) + 1 : 0;
  const days = !correct ? 1 : (!confident ? 1 : (streak >= 2 ? 7 : 3));
  reviewStore[pointId] = { last: Date.now(), correct: !!correct, confident: !!confident, streak: streak, due: Date.now() + days * 86400000 };
  saveReview();
  updateHomeReviewTx();
  updateWrongBookTx();
  updateCheckpointHomeTx();
  return days;
}
function duePointIds() {
  const now = Date.now();
  return Object.keys(reviewStore).filter(id => reviewStore[id] && reviewStore[id].due <= now);
}

/* ---------- 参数化出题 qgen（参考 kenowong/math-mastery 的 qgen(n) 模式） ----------
   题目由参数生成、答案由构造过程算出：同一题型每次数字不同，答案不是写死的。
   题型来源只取内容文件里已有的 practice 原题（题面、知识点归属、难度都照原题），
   不新编未经核验的题型；原题全部保留，生成题只是“换数字再练一遍”。
   每道生成题返回 { type, pointId, level, q, answer, hint }，和 practice 题同形，
   所以练一练 / 混着练 / 模拟测都能直接复用同一套自评和复习库。
   不重复：每个题型记最近 8 个数字组合（qgenRecent），短期内不出现完全相同的组合；
   组合池很小（最少也有 60 多种）时，50 次都撞上就直接返回最后一道，不死循环。
   数字与答案的核验逻辑（分数通分约分、方程代回、十进制小数位数）写在各 gen 里，
   工具 smoke.js 对每种题型做 20 次生成 + 独立重算答案的检查。 */
function qgenGcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; }
function qgenFracText(n, d) { const g = qgenGcd(n, d); n /= g; d /= g; return d === 1 ? String(n) : n + '/' + d; }
function qgenInt(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function qgenSigned(n) { return n >= 0 ? '+' + n : String(n); }
const QGEN_DEFS = {
  // 1.15 100以内加减法（一）· 基础：原题“算一算47+8：个位7+8满10了，怎么办？”
  'add-2d-1d': { pointId: '1.15', level: '基础', gen: function () {
    let a, b;
    do { a = qgenInt(11, 99); b = qgenInt(2, 9); } while ((a % 10) + b < 10);
    return { key: a + '+' + b, q: '算一算 ' + a + ' + ' + b + ' = ？', answer: String(a + b),
      hint: '个位 ' + (a % 10) + ' + ' + b + ' = ' + ((a % 10) + b) + '，满十向十位进 1。' };
  } },
  // 2.2 100以内加减法（二）· 基础：原题“算一算36+24。”
  'add-2d-carry': { pointId: '2.2', level: '基础', gen: function () {
    let a, b;
    do { a = qgenInt(12, 89); b = qgenInt(12, 89); } while ((a % 10) + (b % 10) < 10);
    return { key: a + '+' + b, q: '算一算 ' + a + ' + ' + b + ' = ？', answer: String(a + b),
      hint: '个位 ' + (a % 10) + ' + ' + (b % 10) + ' = ' + ((a % 10) + (b % 10)) + '，满十进 1；十位再加进来的 1。' };
  } },
  // 3.2 万以内加减法 · 基础：原题“书架上有456本书，又买来278本，一共有多少本？”
  'add-3d': { pointId: '3.2', level: '基础', gen: function () {
    const a = qgenInt(102, 989), b = qgenInt(102, 989);
    return { key: a + '+' + b, q: '算一算 ' + a + ' + ' + b + ' = ？', answer: String(a + b),
      hint: '从个位加起，哪一位满十就向前面进 1；也可以用减法验算：和减一个加数等于另一个加数。' };
  } },
  // 3.11 两位数乘两位数 · 基础：原题“每盒装24支笔，买13盒一共多少支？”
  // 因数不取整十数：20×24 这种一半是整十的太容易，练不到两位数乘法。
  'mul-2d': { pointId: '3.11', level: '基础', gen: function () {
    let a, b;
    do { a = qgenInt(12, 89); b = qgenInt(12, 89); } while (a % 10 === 0 || b % 10 === 0);
    const ones = b % 10, tens = Math.floor(b / 10) * 10;
    return { key: a + 'x' + b, q: '每盒装 ' + a + ' 支笔，买 ' + b + ' 盒一共多少支？', answer: (a * b) + '支',
      hint: '先算 ' + a + ' × ' + ones + ' = ' + (a * ones) + '，再算 ' + a + ' × ' + tens + ' = ' + (a * tens) + '，加起来。' };
  } },
  // 3.12 面积 · 基础：原题“一块长方形黑板长4米，宽2米，它的面积是多少？周长是多少？”
  'rect-area': { pointId: '3.12', level: '基础', gen: function () {
    const a = qgenInt(3, 12), b = qgenInt(2, 9);
    return { key: a + 'x' + b, q: '一块长方形黑板长 ' + a + ' 米，宽 ' + b + ' 米，它的面积是多少？周长是多少？',
      answer: '面积 ' + (a * b) + ' 平方米，周长 ' + (2 * (a + b)) + ' 米',
      hint: '面积 = 长 × 宽 = ' + a + ' × ' + b + '；周长 = (长 + 宽) × 2。' };
  } },
  // 5.11 分数的加法和减法 · 提高：原题“1/2+1/3=？”（异分母相加，和不超过 1）
  'frac-add': { pointId: '5.11', level: '提高', gen: function () {
    let d1, d2, n1, n2;
    do {
      d1 = qgenInt(2, 9); d2 = qgenInt(2, 9);
      n1 = qgenInt(1, d1 - 1); n2 = qgenInt(1, d2 - 1);
    } while (d1 === d2 || n1 * d2 + n2 * d1 > d1 * d2);
    const num = n1 * d2 + n2 * d1, den = d1 * d2;
    return { key: n1 + '/' + d1 + '+' + n2 + '/' + d2,
      q: '算一算：' + n1 + '/' + d1 + ' + ' + n2 + '/' + d2 + ' = ？',
      answer: qgenFracText(num, den),
      hint: '先通分：' + n1 + '/' + d1 + ' = ' + (n1 * d2) + '/' + den + '，' + n2 + '/' + d2 + ' = ' + (n2 * d1) + '/' + den + '，再把分子加起来' + (qgenGcd(num, den) > 1 ? '，最后约分' : '') + '。' };
  } },
  // 5.1 小数乘法 · 基础：原题“0.3×0.4 是比 0.4 大，还是比 0.4 小？”
  // 整数算：0.A × 0.B = (A×B)/100，A、B 是 2–9 的一位小数，不用浮点算小数。
  'dec-mul': { pointId: '5.1', level: '基础', gen: function () {
    const A = qgenInt(2, 9), B = qgenInt(2, 9);
    const p = A * B;
    const ans = p < 10 ? '0.0' + p : (p % 10 === 0 ? '0.' + (p / 10) : '0.' + p);
    return { key: A + 'x' + B, q: '算一算：0.' + A + ' × 0.' + B + ' = ？', answer: ans,
      hint: '先算 ' + A + ' × ' + B + ' = ' + p + '，再数小数位数：两个一位小数，积是两位小数。' };
  } },
  // 7.6 解一元一次方程 · 基础：原题“解方程：3x-5=7。”（ax+b=c，解 x 是整数，由 a、x、b 倒推 c）
  'eq-2step': { pointId: '7.6', level: '基础', gen: function () {
    const a = qgenInt(2, 9), x = qgenInt(2, 12), b = qgenInt(1, 20);
    const c = a * x + b;
    return { key: a + 'x+' + b + '=' + c, q: '解方程：' + a + 'x + ' + b + ' = ' + c + '。', answer: 'x = ' + x,
      hint: '先把 +' + b + ' 移到右边变 −' + b + '：' + a + 'x = ' + c + ' − ' + b + ' = ' + (a * x) + '；再两边同时除以 ' + a + '。' };
  } },
  // 6.1 分数乘法 · 基础：原题“算一算：3/4 × 2/5 = ？（可以约分）”
  'frac-mul': { pointId: '6.1', level: '基础', gen: function () {
    const d1 = qgenInt(2, 9), n1 = qgenInt(1, d1 - 1);
    const d2 = qgenInt(2, 9), n2 = qgenInt(1, d2 - 1);
    return { key: n1 + '/' + d1 + 'x' + n2 + '/' + d2,
      q: '算一算：' + n1 + '/' + d1 + ' × ' + n2 + '/' + d2 + ' = ？（可以约分）',
      answer: qgenFracText(n1 * n2, d1 * d2),
      hint: '分子乘分子是 ' + (n1 * n2) + '，分母乘分母是 ' + (d1 * d2) + '，再约分。' };
  } },
  // 9.1 解一元二次方程 · 基础：原题“解方程：x²-5x+6=0（用因式分解法）。”
  // 先定两个整数根 r、s（都不为 0、不相等、和不为 0），再由 b=-(r+s)、c=r·s 倒推方程，代回必成立。
  'quad-factor': { pointId: '9.1', level: '基础', gen: function () {
    let r, s;
    do { r = qgenInt(-9, 9); s = qgenInt(-9, 9); } while (r === 0 || s === 0 || r === s || r + s === 0);
    const b = -(r + s), c = r * s;
    const lo = Math.min(r, s), hi = Math.max(r, s);
    return { key: lo + ',' + hi,
      q: '解方程：x²' + qgenSigned(b) + 'x' + qgenSigned(c) + ' = 0（用因式分解法）。',
      answer: 'x = ' + lo + ' 或 x = ' + hi,
      hint: '找两个数，相加得 ' + (-b) + '、相乘得 ' + c + '：是 ' + lo + ' 和 ' + hi + '。' };
  } },
};
const QGEN_BY_POINT = {};
Object.keys(QGEN_DEFS).forEach(function (t) { QGEN_BY_POINT[QGEN_DEFS[t].pointId] = t; });
var qgenRecent = {}; // type -> 最近 8 个数字组合的 key
/* 做错的换数字题：下次回来先重做原题。错题重做要对着当初错的那组数字——
   换一组新的，学生没法验证自己改没改对（错题本就是这个道理）。
   记在单独的键 math-qgen-failed-v1 里（pointId -> { q, answer, hint, level }），
   不动 reviewStore 的结构；答对了就清掉，换一题只换当前显示、不清它。 */
const FAILED_QGEN_KEY = 'math-qgen-failed-v1';
function loadFailedQgen() {
  try { const o = JSON.parse(lsGet(FAILED_QGEN_KEY) || '{}'); return o && typeof o === 'object' ? o : {}; }
  catch (e) { return {}; }
}
function saveFailedQgen(o) { lsSet(FAILED_QGEN_KEY, JSON.stringify(o)); }
function clearFailedQgen(pid) {
  const f = loadFailedQgen();
  if (f[pid]) { delete f[pid]; saveFailedQgen(f); }
}
function storeFailedQgen(pid, gq) {
  if (!gq) return;
  const f = loadFailedQgen();
  f[pid] = { q: gq.q, answer: gq.answer, hint: gq.hint, level: gq.level };
  saveFailedQgen(f);
}
var qgenShown = {}; // pid -> 当前显示的那道换数字题（练一练里正在看的那组数字）
var mixShown = {}; // pid -> 混着练里当前显示的那道换数字题（和 qgenShown 一样，只记当前这 5 道）
function qgenGenerate(type) {
  const def = QGEN_DEFS[type];
  if (!def) return null;
  const seen = qgenRecent[type] || (qgenRecent[type] = []);
  for (let t = 0; t < 50; t++) {
    const item = def.gen();
    if (seen.indexOf(item.key) < 0) {
      seen.push(item.key);
      if (seen.length > 8) seen.shift();
      return { type: type, pointId: def.pointId, level: def.level, q: item.q, answer: item.answer, hint: item.hint };
    }
  }
  const item = def.gen();
  return { type: type, pointId: def.pointId, level: def.level, q: item.q, answer: item.answer, hint: item.hint };
}
function qgenForPoint(pointId) {
  const t = QGEN_BY_POINT[pointId];
  return t ? qgenGenerate(t) : null;
}
/* 练一练里的换数字同类题：和原题同一套自评（索引固定用 'g'，自评键是 pointId + ':g'，
   点“看答案”才出现自评行，和原题一样）。点“换一题”只换这一块的内容，不动原题。 */
function qgenInnerHtml(pid, fresh) {
  // 没做错过就换一组新的；做错过没改对的，先重做当初错的那组数字。
  const failed = !fresh && loadFailedQgen()[pid];
  const gq = failed || qgenForPoint(pid);
  if (!gq) return '<p class="muted">换数字再练：这条暂时没有换数字的题。</p>';
  qgenShown[pid] = gq;
  return '<p><span class="pill">换数字再练</span> ' + (gq.level ? '<span class="pill">' + esc(gq.level) + '</span> ' : '') + esc(gq.q) + '</p>' +
    (failed
      ? '<p class="muted">这是你上次做错的那道题——先把它做对，再换新的。</p>'
      : '<p class="muted">同一题型，数字换过了——和上面原题是同类题，不是新题型。</p>') +
    '<button class="btn ghost small qa-btn" type="button" data-hint="g">要提示</button><p class="hint" data-hint-t="g" hidden>提示：' + esc(gq.hint) + '</p>' +
    '<button class="btn ghost small qa-btn" type="button" data-qa="g">看答案</button>' +
    '<p class="qa-a" data-qa-a="g" hidden>答案：' + esc(gq.answer) + '</p>' +
    '<div class="qa-mark" data-qa-mark="g" data-point="' + esc(pid) + '" hidden>' +
    '<p>你答对了吗？ <button class="btn small" type="button" data-mark="right">答对了</button> <button class="btn small" type="button" data-mark="wrong">答错了</button></p>' +
    '<p>答之前有把握吗？ <button class="btn small" type="button" data-conf="yes">有把握</button> <button class="btn small" type="button" data-conf="no">没把握</button></p>' +
    '<p class="qa-a" data-qa-saved="g" hidden></p></div>' +
    '<button class="btn ghost small qa-btn" type="button" data-qgen-again="1">换一题（数字不一样，同类题）</button>';
}
function qgenBlockHtml(pid) {
  if (!QGEN_BY_POINT[pid]) return '';
  return '<div class="qa qgen" data-qgen-box="1">' + qgenInnerHtml(pid) + '</div>';
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
    const litCount = gd.units.filter((u, i) => { const cp = unitCheckpoint(g, i); return cp && cp.lit; }).length;
    gradeDetail.innerHTML =
      '<h3>' + d.title + '</h3><p class="muted">人教版 A 版顺序 · ' + gd.units.length + ' 个单元 · ' + total + ' 个知识点；每条都有怎么做、为什么、容易错、讲回来。本年级已点亮 ' + litCount + ' / ' + gd.units.length + ' 个单元。</p>' +
      '<div class="btn-row"><button class="btn primary" type="button" data-g-mix="1">混着练：5 道不同单元的题</button>' +
      '<button class="btn ghost" type="button" data-g-review="1">今天复习（' + due + ' 条）</button>' +
      '<button class="btn ghost" type="button" data-cp-link="1">去闯关路</button></div>' +
      '<div class="unit-list">' + gd.units.map((u, i) => {
        // 单元卡片带上知识点编号：单点单元是“3.15a · 复式统计表”，多点单元是“8.3–8.4 · 轴对称”。
        // 编号是主题标签（3.15a/3.15b 是拆分的两个点），和知识点页的编号一致，不再让读者按卡片数数。
        const cp = unitCheckpoint(g, i);
        const status = cp ? (cp.lit ? '✓ 已点亮 · ' + cp.badge : '闯关 ' + cp.done + ' / ' + cp.total) : '';
        const animN = animsForUnit(g, i).length;
        return '<button class="unit unit-btn' + (cp && cp.lit ? ' cp-lit' : '') + '" type="button" data-unit="' + i + '"><b>' + esc(u.points.length === 1 ? u.points[0].id + ' · ' + u.unit : u.points[0].id + '–' + u.points[u.points.length - 1].id + ' · ' + u.unit) + '</b><p>' + esc(u.term) + ' · ' + u.points.length + ' 个知识点</p>' +
        '<span class="pill">内容已完成</span><span class="pill">动画 ' + animN + ' 个</span>' + (status ? '<span class="pill">' + esc(status) + '</span>' : '') + '</button>';
      }).join('') + '</div>';
    gradeDetail.querySelectorAll('[data-unit]').forEach(btn =>
      btn.addEventListener('click', () => navGo('unit-' + g + '-' + btn.dataset.unit)));
    gradeDetail.querySelectorAll('[data-g-mix]').forEach(btn =>
      btn.addEventListener('click', () => navGo('grade-' + g + '-mix')));
    gradeDetail.querySelectorAll('[data-g-review]').forEach(btn =>
      btn.addEventListener('click', () => navGo('grade-' + g + '-review')));
    gradeDetail.querySelectorAll('[data-cp-link]').forEach(btn =>
      btn.addEventListener('click', () => navGo('checkpoint')));
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
const examDetail = document.getElementById('examDetail');
const inquiryDetail = document.getElementById('inquiryDetail');
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
  const cp = unitCheckpoint(g, ui);
  const cpBox = cp ? '<div class="point-sec"><h4>闯关任务' + (cp.lit ? ' · 已点亮' : '') + '</h4>' + cpTaskListHtml(cp) +
    '<p class="muted">顺序只是建议：这一站做完就点亮，想先去别的站也可以直接点。</p>' +
    '<div class="btn-row"><button class="btn ghost" type="button" data-cp-link="1">去闯关路看看</button></div></div>' : '';
  const storyBox = u.story ? '<div class="point-sec story"><h4>发现时刻</h4><p>' + esc(u.story) + '</p></div>' : '';
  // 本单元的动画：闯关任务"玩一玩本单元的演示"的落点就在这里——每点一行，点一个就去玩。
  const animsBox = '<div class="point-sec"><h4>本单元的动画</h4><p class="muted">每个知识点有哪些动画（演示 / 模拟 / 实验），点一个就去玩；做完回来，单元还是这个单元。</p>' +
    u.points.map(p => {
      const a = animsForPoint(p.id);
      return '<div class="unit-anim-row"><b>' + esc(p.id) + ' · ' + esc(p.title) + '</b> ' +
        (a.length ? a.map(k => animBtnHtml(k, 'btn small ghost')).join(' ') : '<span class="muted">暂无动画</span>') + '</div>';
    }).join('') + '</div>';
  pointDetail.innerHTML =
    '<h3>' + esc(u.unit) + '</h3><p class="muted">' + esc(u.term) + ' · ' + u.points.length + ' 个知识点 · 点一条进内容。</p>' + storyBox + cpBox + animsBox +
    '<div class="unit-list">' + u.points.map(p =>
      '<button class="unit unit-btn" type="button" data-point="' + esc(p.id) + '"><b>' + esc(p.id) + ' · ' + esc(p.title) + '</b><p>' + esc(p.subtitle) + '</p>' +
      '<span class="pill">' + esc(p.method) + '</span></button>'
    ).join('') + '</div>';
  pointDetail.querySelectorAll('[data-point]').forEach(btn =>
    btn.addEventListener('click', () => navGo('point-' + btn.dataset.point)));
  pointDetail.querySelectorAll('[data-cp-link]').forEach(btn =>
    btn.addEventListener('click', () => navGo('checkpoint')));
  pointDetail.querySelectorAll('[data-demo-link]').forEach(el =>
    el.addEventListener('click', () => goDemoFromHere(el.dataset.demoLink)));
}
const DEMO_LABEL = { fraction: '去玩分数演示', tenframe: '去玩十格阵', balance: '去玩天平演示', function: '去玩函数演示', count: '去玩数一数', position: '去玩转身找左右', split: '去玩分一分', addsub: '去玩合起来拿走', solids: '去玩立体图形', bundle: '去玩捆小棒', clock: '去玩拨时钟', tangram: '去玩七巧板', sort: '去玩分类分一分', hundred: '去玩百数表', shop: '去玩开小店', place: '去玩数位块', pattern: '去玩找规律', ruler: '去玩尺子量一量', estimate: '去玩先估后算', angle: '去玩转一转角', array: '去玩点阵乘法', observe: '去玩换个方向看', time: '去玩拨时钟（时和分）', share: '去玩轮流分一分', motion: '去玩折一折转一转', mixop: '去玩先算哪一堆', remain: '去玩装一包装不满', thousand: '去玩数轴找近似数', weight: '去玩天平称一称', chart: '去玩投票变条形图', logic: '去玩排除格推理', pair: '去玩搭配连一连', elapsed: '去玩时间轴走一走', verify: '去玩算回去验算', units: '去玩单位楼梯', times: '去玩条形复制', splitmul: '去玩面积切一切', rectsq: '去玩拉一拉变正方形', venn: '去玩韦恩图拖人', compass: '去玩指南针转一转', divplace: '去玩按数位分一分', stattable: '去玩复式统计表', fourgrid: '去玩四格面积模型', area: '去玩铺方砖数面积', calendar: '去玩日历翻一翻', decimal: '去玩十分条比大小', bignum: '去玩大数数轴', field: '去玩足球场拼一拼', protractor: '去玩量角器', areamodel: '去玩面积模型', parallelogram: '去玩平行四边形', trialdiv: '去玩试商调商', baraxis: '去玩条形图轴', teatime: '去玩沏茶排一排', zerodiv: '去玩除以0', laws: '去玩运算定律', placeslider: '去玩数位滑块', tearangle: '去玩撕角拼平角', decadd: '去玩小数加减对齐', moveshape: '去玩图形平移', average: '去玩削峰填谷', chickenrabbit: '去玩鸡兔同笼', crslider: '去玩猜了再滑', crdraw: '去玩画图补腿', crlist: '去玩列表枚举', crgolden: '去玩金鸡独立', decmul: '去玩单位正方形', gridpos: '去玩数对点一点', decdiv: '去玩两数同乘', prob: '去玩摸球模拟', polyarea: '去玩切一刀变长方形', planttree: '去玩种树数间隔', factor: '去玩拼长方形', cuboid: '去玩分层装块', fracadd: '去玩先重切再数', rotate: '去玩绕钉旋转', findbad: '去玩三组称找次品', radar: '去玩雷达找地方', ratio: '去玩比条分一分', circle: '去玩绕绳量圆', percent: '去玩百分条', fan: '去玩扇形转一转', lsquare: '去玩一层层包正方形', thermo: '去玩温度计比一比', negmul: '去玩负数乘法规律', discount: '去玩打折算一算', cylinder: '去玩倒沙装满圆柱', pigeon: '去玩鸽子找洞', conceptmap: '去玩认出老办法', numline: '去玩数轴标一点', powerup: '去玩对折纸和科学记数法', monomial: '去玩拆零件看系数次数', liketerms: '去玩合并同类项', meetline: '去玩相向而行', lineseg: '去玩直线射线线段', anglepair: '去玩余角补角拼一拼', vertangle: '去玩对顶角转一转', parangles: '去玩平行线截角', roots: '去玩开方机器', coordplane: '去玩坐标平面点一点', ineqline: '去玩不等式画数轴', histogram: '去玩直方图分组', trisides: '去玩三边围不围', congruent: '去玩全等判定拼一拼', foldmirror: '去玩对折看对称', algarea: '去玩面积模型算整式', algfrac: '去玩分式约分', eqsieve: '去玩分式方程过筛子', radical: '去玩二次根式化简', pythag: '去玩勾股定理面积拼图', pargram: '去玩平行四边形推一推', specialquad: '去玩加条件变特殊', datastats: '去玩数据分析算一算', quad: '去玩一元二次方程', growth: '去玩利滚利和韦达', parabola: '去玩抛物线滑杆', spin: '去玩旋转和中心对称', circangle: '去玩圆周角', tangent: '去玩直线和圆切线', sector: '去玩扇形和圆锥', coin: '去玩抛硬币摸红球', tree: '去玩树状图数一数', hyperbola: '去玩双曲线', similar: '去玩相似放大', shadow: '去玩影子测高', trig: '去玩锐角三角函数', slope: '去玩仰角和坡度', project: '去玩投影和三视图', twentyfour: '去玩24点拼一拼', monty: '去玩三门问题', maxarea: '去玩周长面积最大', matches: '去玩火柴棒', mobius: '去玩莫比乌斯带', shopweek: '去玩开店一周', fairgame: '去玩公平游戏', makerule: '去玩造规律', thirteen: '去玩13有几种凑法', maketen: '去玩凑十装满', areamul: '去玩面积模型乘法', fraceq: '去玩分数相等', buildfrac: '去玩造分数', areabuild: '去玩面积建造者', quadmorph: '去玩四边形变形', numplay: '去玩一个数五种样子', fracnumline: '去玩分数变数线' };
/* ---------- 一个点的全部动画（实验放哪里的答案） ----------
   动画 = 所有能上手玩的东西（总称）；演示 = 看明白的工具（124 + 4 旗舰）；
   模拟 = 一个概念一种玩法（8 个）；实验 = 一个问题（9 个创意 + 实验室问题）。
   一个点有哪些动画，只从这里算，不手写两份：
     p.demo（内容文件里的主演示）
     + SIM_LINKS（模拟 → 知识点，只写核对过标题的）
     + METHOD_DEMOS（一个点多种方法：同一点的不同解法，各一个动画——第一个是 4.16 鸡兔同笼）
     + LAB_QUESTIONS 里 points 含该点的演示型问题（实验的家在实验室，点上是第二个门）
   点页、单元页、年级页都读同一份注册表；演示页下阶段也从注册表生成（见设计文档）。 */
var CREATIVE_DEMOS = ['thirteen', 'twentyfour', 'monty', 'maxarea', 'matches', 'mobius', 'shopweek', 'fairgame', 'makerule'];
var SIM_DEMOS = ['maketen', 'areamul', 'fraceq', 'buildfrac', 'areabuild', 'quadmorph', 'numplay', 'fracnumline'];
function animKind(key) {
  if (CREATIVE_DEMOS.indexOf(key) >= 0) return '实验';
  if (SIM_DEMOS.indexOf(key) >= 0) return '模拟';
  return '演示';
}
var SIM_LINKS = {
  '1.9': ['maketen'],
  '1.1': ['numplay'],
  '1.7': ['numplay'],
  '3.11': ['areamul'],
  '3.7': ['fraceq', 'buildfrac', 'fracnumline'],
  '5.10': ['fraceq', 'buildfrac', 'fracnumline'],
  '3.12': ['areabuild'],
  '5.6': ['areabuild'],
  '4.5': ['quadmorph'],
  '8.13': ['quadmorph'],
};
/* 一个点多种方法：点 id → 该点的各方法动画（按方法顺序排，点页上就按这个顺序出按钮）。
   第一个是 4.16 鸡兔同笼：4 种方法各一个动画，旧的 chickenrabbit（腿数滑杆步进版）照旧排第一个。 */
var METHOD_DEMOS = {
  '4.16': ['crslider', 'crdraw', 'crlist', 'crgolden'],
};
function animsForPoint(id) {
  const f = findPoint(id);
  if (!f) return [];
  const keys = [];
  const push = k => { if (k && keys.indexOf(k) < 0) keys.push(k); };
  if (f.point.demo) push(f.point.demo);
  (SIM_LINKS[id] || []).forEach(push);
  (METHOD_DEMOS[id] || []).forEach(push);
  // 实验室问题：points 含该点的演示型问题也算该点的实验（bench 型没有独立卡片，进不了点页）。
  if (typeof LAB_QUESTIONS !== 'undefined') {
    LAB_QUESTIONS.forEach(q => { if (q.demo && q.points && q.points.indexOf(id) >= 0) push(q.demo); });
  }
  return keys;
}
function animsForUnit(g, ui) {
  const gd = gradeData(g);
  if (!gd || !gd.units[ui]) return [];
  const keys = [];
  gd.units[ui].points.forEach(p => animsForPoint(p.id).forEach(k => { if (keys.indexOf(k) < 0) keys.push(k); }));
  return keys;
}
function animBtnHtml(key, cls) {
  const kind = animKind(key);
  const tag = kind === '演示' ? '' : '【' + kind + '】';
  return '<button class="' + (cls || 'btn primary') + '" type="button" data-demo-link="demo-' + esc(key) + '">' + tag + (DEMO_LABEL[key] || '去玩演示') + '</button>';
}
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
  const anims = animsForPoint(id);
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
  secs.push(['sec-how', '怎么做'], ['sec-why', '为什么']);
  if (f.unit.story) secs.push(['sec-story', '发现时刻']);
  secs.push(['sec-wrong', '容易错'],
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
    // 发现时刻：单元故事，放在“为什么”之后（内容文件里 unit.story，可选字段，老单元没有也不报错）。
    (f.unit.story ? '<div class="point-sec story" id="sec-story"><h4>发现时刻</h4><p>' + esc(f.unit.story) + '</p></div>' : '') +
    '<div class="point-sec warn" id="sec-wrong"><h4>容易错</h4><p>错法：' + esc(p.wrong) + '</p><p>为什么错：' + esc(p.wrongWhy) + '</p></div>' +
    '<div class="point-sec" id="sec-visual"><h4>看图学</h4><p>' + esc(p.visual) + '</p></div>' +
    '<div class="point-sec" id="sec-try"><h4>动手试一试</h4><p>' + esc(p.tryIt) + '</p>' +
    (anims.length ? '<p class="muted">这个点的动画（演示 / 模拟 / 实验），每种方法一个：</p><div class="btn-row">' + anims.map(k => animBtnHtml(k)).join('') + '</div>' : '') + '</div>' +
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
    ).join('') + qgenBlockHtml(id) + '</div>' + olympiadHtml + pagerHtml;
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
  mixShown = {};
  const gd = gradeData(mixGrade);
  if (!gd) return;
  const picks = shuffle(gd.units.filter(u => u.points.length)).slice(0, 5).map(u => {
    const p = u.points[Math.floor(Math.random() * u.points.length)];
    // 一半概率用换数字的同类题（该知识点有参数化题型时）：混着练的题本来就每次重抽，
    // 换数字的题也一样，每次数字都不同；题面带“换数字再练”药丸，一眼能认出来。
    const gq = qgenForPoint(p.id);
    if (gq && Math.random() < 0.5) { mixShown[p.id] = gq; return { point: p, q: gq, qgen: true }; }
    return { point: p, q: p.practice[Math.floor(Math.random() * p.practice.length)] };
  });
  currentPointId = null;
  pointDetail.innerHTML = '<h3>混着练</h3><p class="muted">5 道题，来自 5 个不同单元——混着练比一个单元一个单元刷记得更牢。答完对答案，再告诉我对错和把握。带“换数字再练”的题是同类题换了数字，答案是现算的。</p>' + picks.map((pk, i) =>
    '<div class="point-sec"><h4>' + esc(pk.point.id) + ' · ' + esc(pk.point.title) + '</h4><p>' + (pk.qgen ? '<span class="pill">换数字再练</span> ' : '') + (pk.q.level ? '<span class="pill">' + esc(pk.q.level) + '</span> ' : '') + esc(pk.q.q) + '</p>' +
    '<button class="btn ghost small qa-btn" type="button" data-qa="' + i + '">看答案</button>' +
    '<p class="qa-a" data-qa-a="' + i + '" hidden>答案：' + esc(pk.q.answer) + '（提示：' + esc(pk.q.hint) + '）</p>' +
    practiceStepsHtml(pk.q, i, pk.point.id) +
    '<div class="qa-mark" data-qa-mark="' + i + '" data-point="' + esc(pk.point.id) + '"' + (pk.qgen ? ' data-qgen="1"' : '') + ' hidden>' +
    '<p>你答对了吗？ <button class="btn small" type="button" data-mark="right">答对了</button> <button class="btn small" type="button" data-mark="wrong">答错了</button></p>' +
    '<p>答之前有把握吗？ <button class="btn small" type="button" data-conf="yes">有把握</button> <button class="btn small" type="button" data-conf="no">没把握</button></p>' +
    '<p class="qa-a" data-qa-saved="' + i + '" hidden></p></div></div>'
  ).join('') + '<div class="btn-row"><button class="btn primary" type="button" data-mix-again="1">再混 5 道</button></div>';
  pointDetail.querySelectorAll('[data-mix-again]').forEach(b => b.addEventListener('click', () => renderMix()));
}
/* 今天复习（间隔重复）：到期的知识点列出来，点一条回去重练。 */
function renderReview() {
  syncReviewFromStorage(); // 打开就重读：别的标签页记的题，这边也要立刻看到
  const due = duePointIds();
  const practiced = Object.keys(reviewStore).length;
  const mastered = Object.keys(reviewStore).filter(id => reviewStore[id].streak >= 2).length;
  let html = '<h3>今天复习</h3><p class="muted">练过 ' + practiced + ' 条 · 已掌握 ' + mastered + ' 条（连续答对两次算掌握）。答错和没把握的第二天回来，答对且有把握的 3 天后回来，掌握的 7 天后回来。</p>' +
    '<div class="btn-row"><button class="btn primary" type="button" data-exam-start="1">去模拟测</button></div>';
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
/* ---------- 模拟测（低压力自测，不是高压考试） ----------
   定位是“检验自己学到哪了”：5 道题，10 分钟，考完才给答案。
   出题只复用各年级内容文件里已有的 practice 题目（q/answer/hint/level），不新编题；
   一半概率用换数字的同类题（qgen：同一题型、数字现生成、答案现算），题面和原题同属一个知识点。
   考试中不显示提示和答案：没有“要提示”按钮，没有“看答案”，解析也不出现；
   有 steps 的题复用分步计分 UI（每步“看这一步”+ 对/错自评），没 steps 的题整题自评。
   计时用 setTimeout 链（不用 setInterval：smoke 沙箱只提供 setTimeout）。
   错题只用已有的 reviewStore：recordAttempt(pid, false, false) 后把 due 拨到现在，
   这样错题今天就出现在“今天复习”里；不另造一套存储。 */
const EXAM_COUNT = 5;
const EXAM_MINUTES = 10;
const EXAM_MS = EXAM_MINUTES * 60 * 1000;
const EXAM_SCORE_PER_Q = 20; // 5 题 × 20 分 = 100 分
let exam = null; // { qs, fromLearned, idx, marks, startedAt, deadline, submitted, timedOut, confirmSubmit, seq }
let examSeq = 0;
function allPoints() {
  const out = [];
  for (const g of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    const gd = gradeData(g);
    if (!gd) continue;
    gd.units.forEach(u => u.points.forEach(p => { if (p.practice && p.practice.length) out.push(p); }));
  }
  return out;
}
/* 学过 = 在 reviewStore 里练过，或该知识点的演示已经玩过（math-tried-demos-v1）。 */
function learnedPointIds() {
  const ids = new Set(Object.keys(reviewStore));
  allPoints().forEach(p => { if (p.demo && tried.has(p.demo)) ids.add(p.id); });
  return ids;
}
/* 模拟测抽题：原题和换数字同类题各一半概率（该知识点有参数化题型时），
   换数字的题答案是现算的，考完报告里照常显示答案；自评、错题进复习都不变。 */
function pickExamQuestion(p) {
  const gq = qgenForPoint(p.id);
  if (gq && Math.random() < 0.5) return gq;
  return p.practice[Math.floor(Math.random() * p.practice.length)];
}
/* 模拟测抽题：先保证至少一道分步题（“有分步的题就一步一步标”是写在介绍里的承诺，
   不能靠运气——原来 5 道全从学过的里随机抽，分步题常常抽不到，实测两套 10 道里一道都没有）。
   其余按原逻辑：先学过的，再混合补足；原题和换数字同类题各一半概率。
   fromLearned 按最后成套的题里学过的条数实算。 */
function stepQuestionOf(p) {
  return (p.practice || []).find(function (q) { return q.steps && q.steps.length; }) || null;
}
function pickExamQuestions() {
  const learnedIds = learnedPointIds();
  const learnedPts = shuffle([...learnedIds].map(id => findPoint(id)).filter(f => f).map(f => f.point));
  const qs = [];
  const used = new Set();
  const stepPool = learnedPts.filter(p => stepQuestionOf(p));
  const stepFrom = stepPool.length ? stepPool : allPoints().filter(p => stepQuestionOf(p));
  if (stepFrom.length) {
    const p = stepFrom[Math.floor(Math.random() * stepFrom.length)];
    qs.push({ pointId: p.id, title: p.title, q: stepQuestionOf(p) });
    used.add(p.id);
  }
  learnedPts.forEach(p => {
    if (qs.length >= EXAM_COUNT || used.has(p.id)) return;
    qs.push({ pointId: p.id, title: p.title, q: pickExamQuestion(p) });
    used.add(p.id);
  });
  if (qs.length < EXAM_COUNT) {
    shuffle(allPoints().filter(p => !used.has(p.id))).forEach(p => {
      if (qs.length >= EXAM_COUNT) return;
      qs.push({ pointId: p.id, title: p.title, q: pickExamQuestion(p) });
      used.add(p.id);
    });
  }
  const fromLearned = qs.filter(x => learnedIds.has(x.pointId)).length;
  return { qs: shuffle(qs), fromLearned };
}
function fmtClock(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return (m < 10 ? '0' + m : '' + m) + ':' + (r < 10 ? '0' + r : '' + r);
}
function examTick(seq) {
  if (!exam || exam.submitted || exam.seq !== seq) return;
  if (document.body.dataset.view !== 'exam') return; // 离开模拟测就停表，不在后台交卷
  const left = exam.deadline - Date.now();
  const t = document.getElementById('examTimer');
  if (left <= 0) { if (t) t.textContent = '时间到'; submitExam(true); return; }
  if (t) t.textContent = '还剩 ' + fmtClock(left);
  setTimeout(() => examTick(seq), 1000);
}
function renderExamIntro() {
  exam = null;
  const learned = learnedPointIds().size;
  const total = allPoints().length;
  examDetail.innerHTML = '<h3>模拟测</h3><p class="muted">检验一下自己学到哪了——不是正式考试，不用紧张。错了也没关系，错的题会回到今天复习里。</p>' +
    '<div class="point-sec"><h4>怎么考</h4><p>5 道题，10 分钟。考试的时候不给提示、不给答案，答完自己标对错；有分步的题就一步一步标。时间到了自动交卷，也可以提前交卷。</p>' +
    '<p>你已经练过 ' + learned + ' 条知识点（共 ' + total + ' 条）。出题先从你学过的里面抽；学过的不够 5 条时，用各年级混合题补足，到时候会如实告诉你哪几道是补的。</p></div>' +
    '<div class="btn-row"><button class="btn primary" type="button" data-exam-begin="1">开始模拟测（5 道题 · 10 分钟）</button></div>';
}
function startExam() {
  const picked = pickExamQuestions();
  exam = { qs: picked.qs, fromLearned: picked.fromLearned, idx: 0,
    marks: picked.qs.map(() => ({ correct: null, steps: {} })),
    startedAt: Date.now(), deadline: Date.now() + EXAM_MS,
    submitted: false, timedOut: false, confirmSubmit: false, seq: ++examSeq };
  renderExamQuestion();
  examTick(exam.seq);
}
function examIsMarked(i) {
  const m = exam.marks[i];
  const q = exam.qs[i].q;
  if (q.steps && q.steps.length) return q.steps.every((s, si) => m.steps[si] !== undefined);
  return m.correct !== null;
}
function renderExamQuestion() {
  const item = exam.qs[exam.idx];
  const q = item.q;
  const m = exam.marks[exam.idx];
  const hasSteps = !!(q.steps && q.steps.length);
  let bodyHtml = '';
  if (hasSteps) {
    bodyHtml = '<div class="steps"><p class="muted">这道题可以拆成 ' + q.steps.length + ' 步：每一步先自己算，再点开对一对，告诉我这一步你做对没。</p>' +
      q.steps.map((s, si) =>
        '<div class="step"><p><b>第 ' + (si + 1) + ' 步 · ' + esc(s.label) + '</b> ' +
        '<button class="btn ghost small qa-btn" type="button" data-exam-step-reveal="' + si + '">看这一步</button></p>' +
        '<p class="step-a" data-exam-step-a="' + si + '" hidden>' + esc(s.text) + '</p>' +
        '<div class="step-mark" data-exam-step-mark="' + si + '" hidden>' +
        '<p>这一步你做对了吗？ <button class="btn small" type="button" data-exam-step-btn="right">对了</button> <button class="btn small" type="button" data-exam-step-btn="wrong">错了</button></p>' +
        '<p class="qa-a" data-exam-step-saved="' + si + '" hidden></p></div></div>'
      ).join('') + '<p class="muted">全部标完后才能去下一题。</p></div>';
  } else {
    bodyHtml = '<div class="qa-mark"><p>这道题你做对了吗？ <button class="btn small" type="button" data-exam-mark="right">答对了</button> <button class="btn small" type="button" data-exam-mark="wrong">答错了</button></p></div>';
  }
  const last = exam.idx === exam.qs.length - 1;
  const srcNote = exam.fromLearned < EXAM_COUNT
    ? '<p class="muted">这套题里 ' + exam.fromLearned + ' 道来自你学过的知识点，' + (EXAM_COUNT - exam.fromLearned) + ' 道是各年级混合题（学过的不够 5 条，补足的）。</p>'
    : '<p class="muted">这套题 5 道都来自你学过的知识点。</p>';
  exam.confirmSubmit = false;
  examDetail.innerHTML = '<h3>模拟测</h3>' +
    '<p class="exam-timer" id="examTimer">还剩 ' + fmtClock(exam.deadline - Date.now()) + '</p>' +
    '<p class="muted">第 ' + (exam.idx + 1) + ' / ' + exam.qs.length + ' 题 · 5 道题，10 分钟；考试中不给提示和答案，答完自己标对错。时间到了自动交卷。</p>' + srcNote +
    '<div class="point-sec"><h4>' + esc(item.pointId) + ' · ' + esc(item.title) + '</h4>' +
    '<p>' + (q.type ? '<span class="pill">换数字再练</span> ' : '') + (q.level ? '<span class="pill">' + esc(q.level) + '</span> ' : '') + esc(q.q) + '</p>' +
    bodyHtml +
    '<p class="qa-a" data-exam-saved hidden></p>' +
    '<p class="qa-a" data-exam-remind hidden></p></div>' +
    '<div class="btn-row">' +
    (last
      ? '<button class="btn primary" type="button" data-exam-submit="1">交卷</button>'
      : '<button class="btn primary" type="button" data-exam-next="1">下一题 →</button>' +
        '<button class="btn ghost" type="button" data-exam-submit="1">提前交卷</button>') +
    '</div>';
  // 已经标过的题回来时，把标过的状态写回去（只写文字，不恢复按钮状态）。
  if (examIsMarked(exam.idx)) {
    const saved = examDetail.querySelector('[data-exam-saved]');
    if (saved) { saved.hidden = false; saved.textContent = m.correct === true ? '已记下：这道题答对了。' : '已记下：这道题答错了。'; }
  }
}
function submitExam(timedOut) {
  if (!exam || exam.submitted) return;
  exam.submitted = true;
  exam.timedOut = !!timedOut;
  const usedMs = Date.now() - exam.startedAt;
  let score = 0;
  const rows = exam.qs.map((item, i) => {
    const m = exam.marks[i];
    const correct = m.correct === true; // 没标对错的按答错算
    if (correct) {
      score += EXAM_SCORE_PER_Q;
      if (item.q && item.q.type) clearFailedQgen(item.pointId);
    } else {
      recordAttempt(item.pointId, false, false);
      if (item.q && item.q.type) storeFailedQgen(item.pointId, item.q);
      // 模拟测里错的题今天就复习：把 due 拨到现在（练一练里答错是明天再来，考试错了马上练）。
      if (reviewStore[item.pointId]) { reviewStore[item.pointId].due = Date.now(); saveReview(); updateHomeReviewTx(); }
    }
    const wrongSteps = (item.q.steps || []).map((s, si) => ({ s, si })).filter(x => m.steps[x.si] === false);
    return { item, correct, wrongSteps };
  });
  const right = rows.filter(r => r.correct).length;
  const total = exam.qs.length;
  const pct = Math.round(right / total * 100);
  const wrongIds = rows.filter(r => !r.correct).map(r => r.item.pointId);
  const head = exam.timedOut
    ? '<p class="muted">时间到了，自动交卷了——没做完的题也别慌，下次再来。</p>'
    : '<p class="muted">用时 ' + fmtClock(usedMs) + '。不着急，错的地方就是接下来要练的。</p>';
  const advice = right === total
    ? '<p>全对，思路很稳——可以去挑战下一级，或者再测一套换一批题。</p>'
    : '<p>答错的 ' + wrongIds.length + ' 条已经放进今天复习，点一条回去重练；练一练里再对一遍，明天还会回来找你。</p>';
  examDetail.innerHTML = '<h3>模拟测报告</h3>' + head +
    '<div class="point-sec"><h4>得分：' + score + ' 分（满分 100 分）· 答对 ' + right + ' / ' + total + ' 题 · 正确率 ' + pct + '%</h4>' + advice + '</div>' +
    '<div class="point-sec"><h4>每道题</h4><ol>' + rows.map((r, i) => {
      let line = '<li><b>第 ' + (i + 1) + ' 题 · ' + esc(r.item.pointId) + ' ' + esc(r.item.title) + '</b> ' + (r.correct ? '答对了' : '答错了') + '。';
      if (!r.correct) {
        if (r.wrongSteps.length) {
          line += '<br>丢分报告：你卡在' + r.wrongSteps.map(x => '第 ' + (x.si + 1) + ' 步 · ' + x.s.label).join('、') + '。';
        } else {
          line += '<br>丢分报告：这道题整题答错了，回去把 ' + esc(r.item.pointId) + ' 再练一遍。';
        }
        line += ' <button class="btn ghost small" type="button" data-point="' + esc(r.item.pointId) + '">回 ' + esc(r.item.pointId) + ' 重练</button>';
      }
      line += '<br><span class="muted">答案：' + esc(r.item.q.answer) + '</span></li>';
      return line;
    }).join('') + '</ol></div>' +
    '<div class="btn-row"><button class="btn primary" type="button" data-exam-again="1">再测一套</button>' +
    '<button class="btn ghost" type="button" data-exam-review="1">去今天复习</button>' +
    '<button class="btn ghost" type="button" data-exam-home="1">回首页</button></div>';
}
if (examDetail) examDetail.addEventListener('click', e => {
  const beginBtn = e.target.closest('[data-exam-begin]');
  if (beginBtn) { startExam(); return; }
  const againBtn = e.target.closest('[data-exam-again]');
  if (againBtn) { startExam(); return; }
  const reviewBtn = e.target.closest('[data-exam-review]');
  if (reviewBtn) { navGo('today-review'); return; }
  const homeBtn = e.target.closest('[data-exam-home]');
  if (homeBtn) { navGo('home'); return; }
  const pointBtn = e.target.closest('[data-point]');
  if (pointBtn) { navGo('point-' + pointBtn.dataset.point); return; }
  if (!exam || exam.submitted) return;
  const stepReveal = e.target.closest('[data-exam-step-reveal]');
  if (stepReveal) {
    const si = stepReveal.dataset.examStepReveal;
    const a = examDetail.querySelector('[data-exam-step-a="' + si + '"]');
    const m = examDetail.querySelector('[data-exam-step-mark="' + si + '"]');
    if (a) { a.hidden = !a.hidden; stepReveal.textContent = a.hidden ? '看这一步' : '收起这一步'; }
    if (m) m.hidden = a ? a.hidden : true;
    return;
  }
  const stepBtn = e.target.closest('[data-exam-step-btn]');
  if (stepBtn) {
    const row = e.target.closest('[data-exam-step-mark]');
    if (!row) return;
    const si = +row.dataset.examStepMark;
    const correct = stepBtn.dataset.examStepBtn === 'right';
    exam.marks[exam.idx].steps[si] = correct;
    row.querySelectorAll('[data-exam-step-btn]').forEach(b => b.setAttribute('aria-pressed', String(b === stepBtn)));
    const saved = examDetail.querySelector('[data-exam-step-saved="' + si + '"]');
    if (saved) { saved.hidden = false; saved.textContent = correct ? '记下了：第 ' + (si + 1) + ' 步对了。' : '记下了：第 ' + (si + 1) + ' 步错了。'; }
    const q = exam.qs[exam.idx].q;
    if (q.steps.every((s, i) => exam.marks[exam.idx].steps[i] !== undefined)) {
      const allRight = q.steps.every((s, i) => exam.marks[exam.idx].steps[i] === true);
      exam.marks[exam.idx].correct = allRight;
      const allSaved = examDetail.querySelector('[data-exam-saved]');
      if (allSaved) {
        allSaved.hidden = false;
        allSaved.textContent = allRight ? '这道题的每一步都对了，记下了：答对了。' : '这道题的每一步都标完了，记下了：答错了。';
      }
    }
    return;
  }
  const markBtn = e.target.closest('[data-exam-mark]');
  if (markBtn) {
    const correct = markBtn.dataset.examMark === 'right';
    exam.marks[exam.idx].correct = correct;
    const saved = examDetail.querySelector('[data-exam-saved]');
    if (saved) { saved.hidden = false; saved.textContent = correct ? '已记下：这道题答对了。' : '已记下：这道题答错了。'; }
    return;
  }
  const nextBtn = e.target.closest('[data-exam-next]');
  if (nextBtn) {
    if (!examIsMarked(exam.idx)) {
      const rem = examDetail.querySelector('[data-exam-remind]');
      if (rem) { rem.hidden = false; rem.textContent = '先标一下这道题对错，再往下走。'; }
      return;
    }
    exam.idx++;
    renderExamQuestion();
    return;
  }
  const submitBtn = e.target.closest('[data-exam-submit]');
  if (submitBtn) {
    const unmarked = exam.marks.filter((m, i) => !examIsMarked(i)).length;
    if (unmarked > 0 && !exam.confirmSubmit) {
      exam.confirmSubmit = true;
      submitBtn.textContent = '确认交卷（剩 ' + unmarked + ' 题按答错算）';
      const rem = examDetail.querySelector('[data-exam-remind]');
      if (rem) { rem.hidden = false; rem.textContent = '还有 ' + unmarked + ' 道题没标对错，交卷后按答错算。想继续做就点“下一题”，确认交卷就再点一次交卷。'; }
      return;
    }
    submitExam(false);
    return;
  }
});
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
  syncReviewFromStorage(); // 打开就重读：别的标签页记的题，这边也要立刻看到
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
  updateWrongBookTx();
  updateHomeReviewTx();
}
/* 首页错题本面板的小字：真实错题条数。记一次答题就刷新一次——
   以前只在打开错题本时刷，首页面板上的数字会比实际少（真机复测 7edb765：答错后面板还停在 4 条）。 */
function updateWrongBookTx() {
  const tx = document.querySelector('[data-nav-key="review"] .panel-tx');
  if (!tx) return;
  const n = Object.keys(reviewStore).filter(id => reviewStore[id] && reviewStore[id].correct === false).length;
  tx.textContent = n ? n + ' 条错题' : '还没有错题';
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
  crslider: [4], crdraw: [4], crlist: [4], crgolden: [4],
  decmul: [5], gridpos: [5], decdiv: [5], prob: [5], polyarea: [5], planttree: [5],
  factor: [5], cuboid: [5], fracadd: [5], rotate: [5], findbad: [5],
  radar: [6], ratio: [6], circle: [6], percent: [6], fan: [6], lsquare: [6],
  thermo: [6], negmul: [6], discount: [6], cylinder: [6], pigeon: [6], conceptmap: [6],
  numline: [7], powerup: [7], monomial: [7], liketerms: [7], meetline: [7], lineseg: [7], anglepair: [7],
  vertangle: [7], parangles: [7], roots: [7], coordplane: [7], ineqline: [7], histogram: [7],
  trisides: [8], congruent: [8], foldmirror: [8], algarea: [8], algfrac: [8], eqsieve: [8],
  radical: [8], pythag: [8], pargram: [8], specialquad: [8], datastats: [8],
  quad: [9], growth: [9], parabola: [9], spin: [9], circangle: [9], tangent: [9], sector: [9], coin: [9],
  tree: [9], hyperbola: [9], similar: [9], shadow: [9], trig: [9], slope: [9], project: [9],
  twentyfour: [4, 5], monty: [9], maxarea: [3, 4, 5], matches: [3, 4],
  mobius: [6, 7], shopweek: [5, 6], fairgame: [5], makerule: [1, 2], thirteen: [1],
  maketen: [1, 2], areamul: [3, 4], fraceq: [3, 4, 5], buildfrac: [3, 4, 5],
  areabuild: [3, 4, 5], quadmorph: [4, 7, 8], numplay: [1], fracnumline: [3, 4, 5] };
function renderProgress() {
  syncReviewFromStorage(); // 打开就重读：别的标签页记的题，这边也要立刻看到
  const card = document.getElementById('progressCard');
  if (!card) return;
  const practiced = Object.keys(reviewStore).length;
  const mastered = Object.keys(reviewStore).filter(id => reviewStore[id].streak >= 2).length;
  let html = '<h3>我的进度</h3><p class="muted">一共玩过 ' + tried.size + ' / ' + ALL_DEMOS.length + ' 个动画 · 练过 ' + practiced + ' 条知识点 · 已掌握 ' + mastered + ' 条（连续答对两次算掌握）。进度只存在本机浏览器里。</p>';
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
    const litUnits = gd.units.filter((u, ui) => { const cp = unitCheckpoint(g, ui); return cp && cp.lit; }).length;
    const pct = total ? Math.round(done / total * 100) : 0;
    html += '<div class="prog-row"><b>' + g + ' 年级 · ' + esc(GRADES[g].title.split('· ')[1] || '') + '</b>' +
      '<p class="prog-nums">动画 ' + demosDone + ' / ' + demosInGrade.length + ' · 已练 ' + done + ' / ' + total + ' 条 · 已掌握 ' + mast + ' 条 · 已点亮 ' + litUnits + ' / ' + gd.units.length + ' 个单元</p>' +
      '<div class="prog-track"><i style="width:' + pct + '%"></i></div></div>';
  }
  const allCp = allUnitCheckpoints();
  const litAll = allCp.filter(cp => cp.lit).length;
  html += '<div class="point-sec"><h4>徽章</h4><p>' + (litAll ? '已拿到 ' + litAll + ' 个徽章（点亮 ' + litAll + ' / ' + allCp.length + ' 个单元）。' : '还没有徽章。点亮一个单元（把它的任务都做完），徽章就会出现。') + '</p>' +
    '<div class="btn-row"><button class="btn primary" type="button" data-checkpoint-link="1">去闯关路看徽章墙</button></div></div>';
  html += '<div class="btn-row"><button class="btn primary" type="button" data-exam-start="1">去模拟测</button>' +
    '<button class="btn ghost" type="button" data-parent-link="1">家长看这里：这周练了什么、卡在哪</button></div>';
  card.innerHTML = html;
  card.querySelectorAll('[data-exam-start]').forEach(b => b.addEventListener('click', () => navGo('exam')));
  card.querySelectorAll('[data-parent-link]').forEach(b => b.addEventListener('click', () => navGo('parent')));
  card.querySelectorAll('[data-checkpoint-link]').forEach(b => b.addEventListener('click', () => navGo('checkpoint')));
  updateCheckpointHomeTx();
}

/* ---------- 家长端 + 探究作业（Phase 3，本地-only，不登录、不联网）
   家长端只读已经存下来的数据：math-review-v1（练题记录）和
   math-tried-demos-v1（玩过的演示），外加探究作业自己的 math-inquiry-v1。
   不新建别的存储键，不改 reviewStore 的结构；每次渲染都从存储里现读现算，
   展示的数字全部来自真实记录。
   探究作业交的是过程（文字说明 + 用了哪个演示），小老师讲题只写字、不录音：
   浏览器录音存 localStorage 不可靠、体积也大，所以如实只做文字版。 */
const INQUIRY_KEY = 'math-inquiry-v1';
const WEEK_MS = 7 * 86400000;
function fmtDate(ts) {
  const d = new Date(ts);
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}
/* 家长端每次都从存储现读，不用内存里的 reviewStore：
   这样渲染出来的数字一定和存下来的记录一致。
   已体验演示只读 tried 集合（loadTriedKeys 先从存储同步一次），
   和顶栏、面板、进度页是同一份数字，不再各读各的。 */
function loadStoredReview() {
  try { return JSON.parse(lsGet(REVIEW_KEY) || '{}') || {}; } catch (e) { return {}; }
}
function loadTriedKeys() {
  syncTriedFromStorage();
  return [...tried];
}
function loadInquiry() {
  try { const a = JSON.parse(lsGet(INQUIRY_KEY) || '[]'); return Array.isArray(a) ? a : []; }
  catch (e) { return []; }
}
function saveInquiry(list) { lsSet(INQUIRY_KEY, JSON.stringify(list)); }
function demoName(key) {
  const def = NAV_DEFS['demo-' + key];
  return def ? def.crumbs[def.crumbs.length - 1] : key;
}
function taskTitle(taskId) {
  const t = INQUIRY_TASKS.find(x => x.id === taskId);
  return t ? t.title : '探究作业';
}
function inquiryListHtml(list, emptyText) {
  if (!list.length) return '<p class="muted">' + esc(emptyText) + '</p>';
  return '<ul class="wrong-list">' + list.slice().reverse().map(e => {
    const kind = e.kind === 'teach' ? '小老师讲题' : e.kind === 'discovery' ? '我的发现' : '探究作业';
    const title = e.kind === 'teach' ? (e.question || '没写题目') : e.kind === 'discovery' ? demoName(e.demo) : taskTitle(e.taskId);
    const demo = e.demo ? '用了动画：' + demoName(e.demo) : '没用演示';
    return '<li><b>' + esc(kind) + ' · ' + esc(title) + '</b><small>' + fmtDate(e.ts) + ' · ' + esc(demo) + '</small><p>' + esc(e.text || '') + '</p></li>';
  }).join('') + '</ul>';
}
function renderParent() {
  const card = document.getElementById('parentCard');
  if (!card) return;
  const store = loadStoredReview();
  const ids = Object.keys(store);
  const triedKeys = loadTriedKeys();
  const inq = loadInquiry();
  let html = '<h3>家长看这里</h3><p class="muted">只看这台设备上已经存下来的练习记录，不登录、不上传。下面所有数字都是从记录里数出来的。</p>';
  if (!ids.length && !triedKeys.length && !inq.length) {
    html += '<div class="point-sec"><p>还没有记录，先去练一练。练过题、玩过动画、交过探究作业，这里才会有内容。</p></div>' +
      '<div class="btn-row"><button class="btn primary" type="button" data-parent-grades="1">选一个年级开始</button></div>';
    card.innerHTML = html;
    card.querySelectorAll('[data-parent-grades]').forEach(b => b.addEventListener('click', () => navGo('grades')));
    return;
  }
  // ① 本周小结：近 7 天练了多少条、哪些年级/单元有进展；演示只记总数，不记哪天玩的，如实说明。
  const now = Date.now();
  const weekIds = ids.filter(id => store[id] && typeof store[id].last === 'number' && store[id].last >= now - WEEK_MS);
  const byGrade = {};
  let unknown = 0;
  weekIds.forEach(id => {
    const f = findPoint(id);
    if (!f) { unknown++; return; }
    const k = f.grade + ' 年级 · ' + f.unit.unit;
    byGrade[k] = (byGrade[k] || 0) + 1;
  });
  html += '<div class="point-sec"><h4>本周小结（近 7 天）</h4>';
  if (!weekIds.length) {
    html += '<p>这 7 天里没有练题记录。一共练过 ' + ids.length + ' 条，都是 7 天以前的。</p>';
  } else {
    html += '<p>这 7 天一共练了 ' + weekIds.length + ' 条知识点。</p>';
    if (Object.keys(byGrade).length) {
      html += '<ul>' + Object.keys(byGrade).map(k => '<li>' + esc(k) + '：练了 ' + byGrade[k] + ' 条</li>').join('') + '</ul>';
    }
    if (unknown) html += '<p>还有 ' + unknown + ' 条在内容里找不到对应的知识点，没算进上面。</p>';
  }
  html += '<p>演示一共玩过 ' + triedKeys.length + ' / ' + ALL_DEMOS.length + ' 个。演示只记总数、不记哪天玩的，所以这一项没法按周分开算。</p></div>';
  // ② 困难提醒：上次答错的 + 答对了但没把握的，各自写清楚下一步练什么。
  const wrongIds = ids.filter(id => store[id] && store[id].correct === false);
  const lowConfIds = ids.filter(id => store[id] && store[id].correct === true && store[id].confident === false);
  html += '<div class="point-sec"><h4>困难提醒：卡在哪</h4>';
  if (!wrongIds.length && !lowConfIds.length) {
    html += '<p>没有正在卡住的知识点：最近一次都答对了，而且有把握。</p>';
  } else {
    html += '<div class="unit-list">';
    wrongIds.forEach(id => {
      const f = findPoint(id);
      const title = f ? f.point.title : id;
      const wrong = f ? '容易错：' + f.point.wrong + '——' + f.point.wrongWhy : '';
      html += '<button class="unit unit-btn" type="button" data-point="' + esc(id) + '"><b>' + esc(id) + ' · ' + esc(title) + '</b><p>上次答错了。' + esc(wrong) + '下一步：点这里回去重练这条，明天复习里也会再出现。</p><span class="pill">去练这条</span></button>';
    });
    lowConfIds.forEach(id => {
      const f = findPoint(id);
      const title = f ? f.point.title : id;
      html += '<button class="unit unit-btn" type="button" data-point="' + esc(id) + '"><b>' + esc(id) + ' · ' + esc(title) + '</b><p>答对了，但答之前没把握。下一步：明天再练一次，练到有把握为止。</p><span class="pill">去练这条</span></button>';
    });
    html += '</div>';
  }
  html += '</div>';
  // ③ 错题按错因分组：错因就是各知识点内容里已有的 wrong 字段原文，不新编标签。
  html += '<div class="point-sec"><h4>错题按错因分</h4>';
  if (!wrongIds.length) {
    html += '<p>现在没有错题。</p>';
  } else {
    const groups = {};
    wrongIds.forEach(id => {
      const f = findPoint(id);
      const key = f ? f.point.wrong : id;
      (groups[key] = groups[key] || []).push(id);
    });
    Object.keys(groups).forEach(wrongText => {
      html += '<p><b>错因：' + esc(wrongText) + '</b></p><ul class="wrong-list">' + groups[wrongText].map(id => {
        const f = findPoint(id);
        const title = f ? f.point.title : id;
        const why = f ? f.point.wrongWhy : '';
        return '<li><button class="unit unit-btn" type="button" data-point="' + esc(id) + '"><b>' + esc(id) + ' · ' + esc(title) + '</b><small>' + esc(why) + '</small></button></li>';
      }).join('') + '</ul>';
    });
  }
  html += '</div>';
  // ④ 孩子交的探究作业。
  html += '<div class="point-sec"><h4>孩子交的探究作业</h4>' + inquiryListHtml(inq, '还没有交过探究作业。') + '</div>';
  card.innerHTML = html;
  card.querySelectorAll('[data-point]').forEach(btn => btn.addEventListener('click', () => navGo('point-' + btn.dataset.point)));
}

/* 探究任务：6 个，覆盖低中高年级，每个都挂在一个真实存在的知识点和演示上。
   数字都手算过：8+6=14（三种凑十法）；23×14=322（200+80+30+12）；
   1/2+1/3=5/6（先都切成 1/6）；3²+4²=9+16=25=5²。任务文字里不直接给答案。 */
const INQUIRY_TASKS = [
  { id: 'inq-tenframe', band: '1–2 年级', title: '用十格阵拼出 8+6 的三种方法',
    task: '8+6 是多少？别直接写答案：先去十格阵里摆一摆，找出三种不同的凑十办法，再写下来你每种办法是怎么凑的。',
    pointId: '1.9', demo: 'tenframe' },
  { id: 'inq-array', band: '2–3 年级', title: '3 行 4 列的点阵，转个方向还是 12 个吗？',
    task: '在点阵演示里摆一个 3 行 4 列的点阵，数一数有几个点；再把它转个方向，变成 4 行 3 列，再数一数。写下来：两次数出来一样吗？你觉得为什么会这样？',
    pointId: '2.5', demo: 'array' },
  { id: 'inq-fourgrid', band: '3–4 年级', title: '用面积模型算 23×14，并把图画出来',
    task: '23×14 是多少？在四格面积模型里把 23×14 的长方形切成四块，每块的面积是多少、四块加起来是多少，写下来。也可以在纸上把这个长方形画出来，再把过程写在这里。',
    pointId: '3.11', demo: 'fourgrid' },
  { id: 'inq-fracadd', band: '5 年级', title: '1/2 + 1/3：先拼一拼，再说为什么不能直接加',
    task: '先在分数条上拼一拼：1/2 和 1/3 各是几份？拼在一起是多少？再写下来：为什么不能把分子加分子、分母加分母？要先做什么，才能加？',
    pointId: '5.11', demo: 'fracadd' },
  { id: 'inq-hyperbola', band: '9 年级', title: '找一个生活中的反比例例子，并说明为什么',
    task: '找一个你身边的例子：两个量，一个变大、另一个变小，而且它们的乘积不变。写下来你找的是什么、两个量分别是多少、乘积是多少，再说说为什么它是反比例、不是别的。',
    pointId: '9.11', demo: 'hyperbola' },
  { id: 'inq-pythag', band: '8 年级', title: '拼出 3² + 4² = 5²，再说说为什么',
    task: '在勾股定理面积拼图里拼一拼：边长 3 和边长 4 的两个正方形，面积加起来是不是等于边长 5 的正方形？写下来你是怎么拼的、每块面积是多少，再说说你觉得为什么会这样。',
    pointId: '8.11', demo: 'pythag' },
];
let inqNotice = '';
function renderInquiry() {
  if (!inquiryDetail) return;
  const list = loadInquiry();
  // 演示下拉框：6 个任务用到的演示 + 没用演示（可点名，不硬凑全表）。
  const demoKeys = [];
  INQUIRY_TASKS.forEach(t => { if (!demoKeys.includes(t.demo)) demoKeys.push(t.demo); });
  const demoOpts = '<option value="">没用演示</option>' +
    demoKeys.map(k => '<option value="' + esc(k) + '">' + esc(demoName(k)) + '</option>').join('');
  let html = '<h3>探究作业</h3><p class="muted">交的是过程，不是答案：写下来你是怎么想的、怎么试的，用了哪个动画帮忙。只存在这台设备上，不上传，家长能在“家长看这里”看到。</p>';
  if (inqNotice) {
    html += '<p class="qa-a" data-inq-notice>' + esc(inqNotice) + '</p>';
    inqNotice = '';
  }
  html += INQUIRY_TASKS.map(t => {
    const f = findPoint(t.pointId);
    return '<div class="point-sec"><h4><span class="pill">' + esc(t.band) + '</span> ' + esc(t.title) + '</h4><p>' + esc(t.task) + '</p>' +
      '<div class="btn-row"><button class="btn ghost" type="button" data-inq-demo-link="demo-' + esc(t.demo) + '">先去玩' + esc(demoName(t.demo)) + '演示</button>' +
      (f ? '<button class="btn ghost" type="button" data-point="' + esc(t.pointId) + '">看看相关知识点 ' + esc(t.pointId) + ' · ' + esc(f.point.title) + '</button>' : '') + '</div>' +
      '<p class="muted">写下你的过程：</p><textarea class="inq-textarea" data-inq-text="' + esc(t.id) + '" placeholder="写下来你是怎么做的、怎么想的……"></textarea>' +
      '<p class="muted">用了哪个动画？ <select class="inq-select" data-inq-demo="' + esc(t.id) + '">' + demoOpts + '</select></p>' +
      '<div class="btn-row"><button class="btn primary" type="button" data-inq-submit="' + esc(t.id) + '">交这份作业</button></div></div>';
  }).join('');
  html += '<div class="point-sec"><h4>小老师讲题</h4><p>选一道你做过的题，用文字把它讲给别人听：第一步做什么、第二步做什么，每一步为什么这样做。写得让没做过这道题的人也能看懂，就算讲明白了。只写字，不录音。</p>' +
    '<p class="muted">讲的是哪道题？</p><input class="inq-input" type="text" data-teach-q placeholder="例如：23×14 怎么算">' +
    '<p class="muted">你的讲解：</p><textarea class="inq-textarea" data-teach-text placeholder="第一步……第二步……每一步为什么这样做……"></textarea>' +
    '<div class="btn-row"><button class="btn primary" type="button" data-teach-submit="1">交这份讲解</button></div></div>';
  html += '<div class="point-sec"><h4>我的提交（只存在这台设备上）</h4>' + inquiryListHtml(list, '还没有提交过。交一份作业或讲一次题，这里就会出现。') + '</div>';
  inquiryDetail.innerHTML = html;
  inquiryDetail.querySelectorAll('[data-point]').forEach(btn => btn.addEventListener('click', () => navGo('point-' + btn.dataset.point)));
}
if (inquiryDetail) inquiryDetail.addEventListener('click', e => {
  const dl = e.target.closest('[data-inq-demo-link]');
  if (dl) { goDemoFromHere(dl.dataset.inqDemoLink); return; }
  const sub = e.target.closest('[data-inq-submit]');
  if (sub) {
    const taskId = sub.dataset.inqSubmit;
    const ta = inquiryDetail.querySelector('[data-inq-text="' + taskId + '"]');
    const sel = inquiryDetail.querySelector('[data-inq-demo="' + taskId + '"]');
    const text = ta && ta.value ? ta.value.trim() : '';
    if (!text) { inqNotice = '先写几句过程再交：你是怎么做的、怎么想的？'; renderInquiry(); return; }
    const list = loadInquiry();
    list.push({ kind: 'inq', taskId: taskId, text: text, demo: sel ? sel.value : '', ts: Date.now() });
    saveInquiry(list);
    inqNotice = '交好了，只存在这台设备上。家长在“家长看这里”能看到这份作业。';
    renderInquiry();
    return;
  }
  const teach = e.target.closest('[data-teach-submit]');
  if (teach) {
    const q = inquiryDetail.querySelector('[data-teach-q]');
    const ta = inquiryDetail.querySelector('[data-teach-text]');
    const text = ta && ta.value ? ta.value.trim() : '';
    if (!text) { inqNotice = '先写下你的讲解步骤再交。'; renderInquiry(); return; }
    const list = loadInquiry();
    list.push({ kind: 'teach', question: q && q.value ? q.value.trim() : '', text: text, demo: '', ts: Date.now() });
    saveInquiry(list);
    inqNotice = '交好了，只存在这台设备上。家长在“家长看这里”能看到这份讲解。';
    renderInquiry();
    return;
  }
});

/* ---------- 闯关路（Phase 4：只做视觉层，不改内容结构） ----------
   已有的学习进度变成一条看得见的路：一个单元一站，按年级顺序往下走。
   每站的任务全部取自 app 已有的行为，不新增题目：
   ① 玩过该单元的演示（math-tried-demos-v1 里有该单元任一演示即算）；
   ② 练过该单元的知识点（math-review-v1 里有该单元任一知识点即算）；
   ③ 交过挂在本单元的探究作业（math-inquiry-v1 里有对应 taskId 的提交即算；
   只有 6 个单元挂着探究作业，其他单元只有前两项任务）。
   模拟测考完不记成绩，所以不算进任务里；小老师讲题没挂在具体单元上，也不算。
   点亮 = 该站任务全做完；不锁后面的站，顺序只是建议的视觉引导。
   徽章名直接用单元已有的标题 + “小达人”，只来自真实完成记录。
   每次渲染都从存储现读（loadStoredReview / loadTriedKeys / loadInquiry），
   不用内存里的 reviewStore / tried，这样数字一定和存下来的记录一致。 */
function inquiryTaskForUnit(g, ui) {
  for (const t of INQUIRY_TASKS) {
    const f = findPoint(t.pointId);
    if (f && f.grade === g && f.unitIndex === ui) return t;
  }
  return null;
}
function unitCheckpoint(g, ui) {
  const gd = gradeData(g);
  if (!gd || !gd.units[ui]) return null;
  const u = gd.units[ui];
  const store = loadStoredReview();
  const triedKeys = loadTriedKeys();
  const demos = animsForUnit(g, ui);
  const demosDone = demos.filter(k => triedKeys.indexOf(k) >= 0).length;
  const practiced = u.points.filter(p => store[p.id]).length;
  const inq = inquiryTaskForUnit(g, ui);
  const inqDone = inq ? loadInquiry().some(e => e && e.kind === 'inq' && e.taskId === inq.id) : false;
  const tasks = [
    { key: 'demo', label: '玩一玩本单元的动画', done: demosDone > 0, detail: '动画 ' + demosDone + ' / ' + demos.length },
    { key: 'practice', label: '练一练本单元的知识点', done: practiced > 0, detail: '已练 ' + practiced + ' / ' + u.points.length + ' 条' },
  ];
  if (inq) tasks.push({ key: 'inquiry', label: '交一份探究作业：' + inq.title, done: inqDone, detail: inqDone ? '已交' : '还没交' });
  const done = tasks.filter(t => t.done).length;
  return { grade: g, unitIndex: ui, unit: u.unit, term: u.term, pointsTotal: u.points.length, demosTotal: demos.length, demosDone: demosDone, practiced: practiced, tasks: tasks, done: done, total: tasks.length, lit: done === tasks.length, badge: u.unit + '小达人' };
}
function allUnitCheckpoints() {
  const list = [];
  for (let g = 1; g <= 9; g++) {
    const gd = gradeData(g);
    if (!gd) continue;
    gd.units.forEach((u, ui) => { const cp = unitCheckpoint(g, ui); if (cp) list.push(cp); });
  }
  return list;
}
function cpTaskListHtml(cp) {
  return '<ul class="cp-tasks">' + cp.tasks.map(t =>
    '<li>' + (t.done ? '✓ ' : '○ ') + esc(t.label) + '（' + esc(t.detail) + '）</li>'
  ).join('') + '</ul>' +
  '<div class="prog-track"><i style="width:' + Math.round(cp.done / cp.total * 100) + '%"></i></div>' +
  '<p class="prog-nums">任务 ' + cp.done + ' / ' + cp.total + (cp.lit ? ' · 已点亮，拿到徽章「' + esc(cp.badge) + '」' : '') + '</p>';
}
const checkpointDetail = document.getElementById('checkpointDetail');
function renderCheckpoint() {
  if (!checkpointDetail) return;
  const all = allUnitCheckpoints();
  const lit = all.filter(cp => cp.lit);
  let n = 0;
  let html = '<h3>闯关路</h3><p class="muted">一个单元就是一站，按年级顺序往下走，就是建议的顺序——每一站都能直接点进去，没有锁，想先去哪一站都可以。任务只数本机已经存下来的记录：玩过的演示、练过的知识点、交过的探究作业。</p>' +
    '<p class="muted">一共 ' + all.length + ' 个单元 · 已点亮 ' + lit.length + ' 个 · 拿到 ' + lit.length + ' 个徽章</p>';
  for (let g = 1; g <= 9; g++) {
    const gd = gradeData(g);
    if (!gd) continue;
    const units = all.filter(cp => cp.grade === g);
    if (!units.length) continue;
    const gl = units.filter(cp => cp.lit).length;
    html += '<div class="point-sec"><h4>' + g + ' 年级 · ' + esc(GRADES[g].title.split('· ')[1] || '') + '（已点亮 ' + gl + ' / ' + units.length + ' 个单元）</h4><div class="unit-list">' +
      units.map(cp => {
        n++;
        return '<button class="unit unit-btn' + (cp.lit ? ' cp-lit' : '') + '" type="button" data-cp-unit="' + cp.grade + '-' + cp.unitIndex + '"><b>第 ' + n + ' 站 · ' + esc(cp.unit) + '</b><p>' + esc(cp.term) + ' · ' + cp.pointsTotal + ' 个知识点</p>' + cpTaskListHtml(cp) +
        '<span class="pill">' + (cp.lit ? '🏅 已点亮 · ' + esc(cp.badge) : '进行中 · 任务 ' + cp.done + ' / ' + cp.total) + '</span></button>';
      }).join('') + '</div></div>';
  }
  html += '<div class="point-sec"><h4>徽章墙</h4>';
  if (!lit.length) {
    html += '<p>还没有徽章。点亮一个单元（把它的任务都做完），徽章就会出现在这里。</p>';
  } else {
    html += '<div class="cp-wall">' + lit.map(cp => '<span class="cp-badge">🏅 ' + cp.grade + ' 年级 · ' + esc(cp.badge) + '</span>').join('') + '</div>';
  }
  html += '</div>';
  html += '<p class="muted">模拟测考完不记成绩，所以不算进闯关任务里；探究作业只挂在 6 个单元上，其他单元只有前面两项任务。</p>';
  checkpointDetail.innerHTML = html;
  updateCheckpointHomeTx();
}
if (checkpointDetail) checkpointDetail.addEventListener('click', e => {
  const b = e.target.closest('[data-cp-unit]');
  if (b) { const parts = b.dataset.cpUnit.split('-'); navGo('unit-' + parts[0] + '-' + parts[1]); }
});
/* 首页“闯关路”面板的小字：已点亮的单元数。练题 / 玩演示 / 交作业后都刷新一次。 */
function updateCheckpointHomeTx() {
  const tx = document.getElementById('panelCpTx');
  const fill = document.getElementById('panelCpFill');
  if (!tx && !fill) return;
  const all = allUnitCheckpoints();
  const lit = all.filter(cp => cp.lit).length;
  if (tx) tx.textContent = lit ? '已点亮 ' + lit + ' / ' + all.length + ' 个单元' : '还没有点亮的单元';
  if (fill) fill.style.width = (all.length ? lit / all.length * 100 : 0) + '%';
}
if (pointDetail) pointDetail.addEventListener('click', e => {
  const examStartBtn = e.target.closest('[data-exam-start]');
  if (examStartBtn) { navGo('exam'); return; }
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
  // 换数字再练 · 换一题：只重画这一块（换一组数字），原题不动；旧的自评先清掉，
  // 不然新题一点“答对了”会直接用上一题的“有把握没”把分记下来。
  const qgenBtn = e.target.closest('[data-qgen-again]');
  if (qgenBtn) {
    const box = pointDetail.querySelector('[data-qgen-box]');
    if (box && currentPointId) {
      delete qaState[currentPointId + ':g'];
      box.innerHTML = qgenInnerHtml(currentPointId, true);
    }
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
    // 换数字题：只点“答错了/答对了”也要记下当初那组数字——不能等“有没有把握”也点了才记，
    // 不然只点对错的学生下次回来还是新题（真机复测：66×31 答错后重开变 61×26）。
    // 练一练里是 data-qa-mark="g" + qgenShown；混着练里是序号 + data-qgen + mixShown。
    if (markBtn && (row.dataset.qaMark === 'g' || row.dataset.qgen)) {
      const gq = row.dataset.qaMark === 'g' ? qgenShown[pid] : mixShown[pid];
      if (st.correct) clearFailedQgen(pid);
      else storeFailedQgen(pid, gq);
    }
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
  pathDetail.innerHTML = '<h3>第 ' + n + ' 步 · ' + s.title + '</h3><p>' + s.desc + '</p>' +
    (n === 4 ? '<div class="btn-row"><button class="btn primary" type="button" data-exam-start="1">去模拟测</button></div>' : '');
  pathDetail.querySelectorAll('[data-exam-start]').forEach(b => b.addEventListener('click', () => navGo('exam')));
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
  demos:      { crumbs: ['数学', '动画'], target: 'demos' },
  'demo-tenframe': { crumbs: ['数学', '动画', '十格阵凑十'], target: 'demo-tenframe' },
  'demo-fraction': { crumbs: ['数学', '动画', '分数切一切'], target: 'demo-fraction' },
  'demo-balance':  { crumbs: ['数学', '动画', '天平解方程'], target: 'demo-balance' },
  'demo-function': { crumbs: ['数学', '动画', '函数滑杆'], target: 'demo-function' },
  'demo-count': { crumbs: ['数学', '动画', '数一数，比一比'], target: 'demo-count' },
  'demo-position': { crumbs: ['数学', '动画', '转身找左右'], target: 'demo-position' },
  'demo-split': { crumbs: ['数学', '动画', '分一分'], target: 'demo-split' },
  'demo-addsub': { crumbs: ['数学', '动画', '合起来，拿走'], target: 'demo-addsub' },
  'demo-solids': { crumbs: ['数学', '动画', '立体图形滚一滚'], target: 'demo-solids' },
  'demo-bundle': { crumbs: ['数学', '动画', '捆小棒认数'], target: 'demo-bundle' },
  'demo-clock': { crumbs: ['数学', '动画', '认识钟表'], target: 'demo-clock' },
  'demo-tangram': { crumbs: ['数学', '动画', '七巧板转一转'], target: 'demo-tangram' },
  'demo-sort': { crumbs: ['数学', '动画', '分类分一分'], target: 'demo-sort' },
  'demo-hundred': { crumbs: ['数学', '动画', '百数表比大小'], target: 'demo-hundred' },
  'demo-shop': { crumbs: ['数学', '动画', '开小店'], target: 'demo-shop' },
  'demo-place': { crumbs: ['数学', '动画', '数位块加减法'], target: 'demo-place' },
  'demo-pattern': { crumbs: ['数学', '动画', '找规律'], target: 'demo-pattern' },
  'demo-ruler': { crumbs: ['数学', '动画', '尺子量长度'], target: 'demo-ruler' },
  'demo-estimate': { crumbs: ['数学', '动画', '先估后算'], target: 'demo-estimate' },
  'demo-angle': { crumbs: ['数学', '动画', '转一转角'], target: 'demo-angle' },
  'demo-array': { crumbs: ['数学', '动画', '点阵乘法'], target: 'demo-array' },
  'demo-observe': { crumbs: ['数学', '动画', '换个方向看'], target: 'demo-observe' },
  'demo-time': { crumbs: ['数学', '动画', '认识时间：时和分'], target: 'demo-time' },
  'demo-share': { crumbs: ['数学', '动画', '轮流分一分'], target: 'demo-share' },
  'demo-motion': { crumbs: ['数学', '动画', '折一折，转一转'], target: 'demo-motion' },
  'demo-mixop': { crumbs: ['数学', '动画', '先算哪一堆'], target: 'demo-mixop' },
  'demo-remain': { crumbs: ['数学', '动画', '装一包，剩几颗'], target: 'demo-remain' },
  'demo-thousand': { crumbs: ['数学', '动画', '数轴找近似数'], target: 'demo-thousand' },
  'demo-weight': { crumbs: ['数学', '动画', '天平称一称'], target: 'demo-weight' },
  'demo-chart': { crumbs: ['数学', '动画', '投票变条形图'], target: 'demo-chart' },
  'demo-logic': { crumbs: ['数学', '动画', '排除格推理'], target: 'demo-logic' },
  'demo-pair': { crumbs: ['数学', '动画', '搭配连一连'], target: 'demo-pair' },
  'demo-elapsed': { crumbs: ['数学', '动画', '时间轴走一走'], target: 'demo-elapsed' },
  'demo-verify': { crumbs: ['数学', '动画', '算一算，再算回去'], target: 'demo-verify' },
  'demo-units': { crumbs: ['数学', '动画', '单位楼梯'], target: 'demo-units' },
  'demo-times': { crumbs: ['数学', '动画', '条形复制'], target: 'demo-times' },
  'demo-splitmul': { crumbs: ['数学', '动画', '面积切一切'], target: 'demo-splitmul' },
  'demo-rectsq': { crumbs: ['数学', '动画', '拉一拉变正方形'], target: 'demo-rectsq' },
  'demo-venn': { crumbs: ['数学', '动画', '韦恩图拖人'], target: 'demo-venn' },
  'demo-compass': { crumbs: ['数学', '动画', '指南针转一转'], target: 'demo-compass' },
  'demo-divplace': { crumbs: ['数学', '动画', '按数位分一分'], target: 'demo-divplace' },
  'demo-stattable': { crumbs: ['数学', '动画', '复式统计表'], target: 'demo-stattable' },
  'demo-fourgrid': { crumbs: ['数学', '动画', '四格面积模型'], target: 'demo-fourgrid' },
  'demo-area': { crumbs: ['数学', '动画', '铺方砖数面积'], target: 'demo-area' },
  'demo-calendar': { crumbs: ['数学', '动画', '日历翻一翻'], target: 'demo-calendar' },
  'demo-decimal': { crumbs: ['数学', '动画', '十分条比大小'], target: 'demo-decimal' },
  'demo-bignum': { crumbs: ['数学', '动画', '大数数轴'], target: 'demo-bignum' },
  'demo-field': { crumbs: ['数学', '动画', '足球场拼平方千米'], target: 'demo-field' },
  'demo-protractor': { crumbs: ['数学', '动画', '量角器量一量'], target: 'demo-protractor' },
  'demo-areamodel': { crumbs: ['数学', '动画', '面积模型乘三位数'], target: 'demo-areamodel' },
  'demo-parallelogram': { crumbs: ['数学', '动画', '平行四边形推一推'], target: 'demo-parallelogram' },
  'demo-trialdiv': { crumbs: ['数学', '动画', '试商调商'], target: 'demo-trialdiv' },
  'demo-baraxis': { crumbs: ['数学', '动画', '条形图会说谎'], target: 'demo-baraxis' },
  'demo-teatime': { crumbs: ['数学', '动画', '沏茶排一排'], target: 'demo-teatime' },
  'demo-zerodiv': { crumbs: ['数学', '动画', '除以0没有答案'], target: 'demo-zerodiv' },
  'demo-laws': { crumbs: ['数学', '动画', '运算定律'], target: 'demo-laws' },
  'demo-placeslider': { crumbs: ['数学', '动画', '数位滑块'], target: 'demo-placeslider' },
  'demo-tearangle': { crumbs: ['数学', '动画', '撕角拼平角'], target: 'demo-tearangle' },
  'demo-decadd': { crumbs: ['数学', '动画', '小数加减对齐'], target: 'demo-decadd' },
  'demo-moveshape': { crumbs: ['数学', '动画', '图形平移和对称'], target: 'demo-moveshape' },
  'demo-average': { crumbs: ['数学', '动画', '削峰填谷求平均数'], target: 'demo-average' },
  'demo-chickenrabbit': { crumbs: ['数学', '动画', '鸡兔同笼腿数滑杆'], target: 'demo-chickenrabbit' },
  'demo-crslider': { crumbs: ['数学', '动画', '鸡兔同笼：猜了再滑'], target: 'demo-crslider' },
  'demo-crdraw': { crumbs: ['数学', '动画', '鸡兔同笼：画图补腿'], target: 'demo-crdraw' },
  'demo-crlist': { crumbs: ['数学', '动画', '鸡兔同笼：列表枚举'], target: 'demo-crlist' },
  'demo-crgolden': { crumbs: ['数学', '动画', '鸡兔同笼：金鸡独立'], target: 'demo-crgolden' },
  'demo-decmul': { crumbs: ['数学', '动画', '小数乘法：单位正方形'], target: 'demo-decmul' },
  'demo-gridpos': { crumbs: ['数学', '动画', '位置：数对点一点'], target: 'demo-gridpos' },
  'demo-decdiv': { crumbs: ['数学', '动画', '小数除法：两数同乘'], target: 'demo-decdiv' },
  'demo-prob': { crumbs: ['数学', '动画', '可能性：摸球模拟'], target: 'demo-prob' },
  'demo-polyarea': { crumbs: ['数学', '动画', '多边形的面积：切一刀'], target: 'demo-polyarea' },
  'demo-planttree': { crumbs: ['数学', '动画', '植树问题：种树数间隔'], target: 'demo-planttree' },
  'demo-factor': { crumbs: ['数学', '动画', '因数与倍数：拼长方形'], target: 'demo-factor' },
  'demo-cuboid': { crumbs: ['数学', '动画', '长方体：分层装块'], target: 'demo-cuboid' },
  'demo-fracadd': { crumbs: ['数学', '动画', '分数加减法：先重切再数'], target: 'demo-fracadd' },
  'demo-rotate': { crumbs: ['数学', '动画', '图形的运动：绕钉旋转'], target: 'demo-rotate' },
  'demo-findbad': { crumbs: ['数学', '动画', '找次品：三组称'], target: 'demo-findbad' },
  'demo-radar': { crumbs: ['数学', '动画', '位置与方向：雷达找地方'], target: 'demo-radar' },
  'demo-ratio': { crumbs: ['数学', '动画', '比：比条分一分'], target: 'demo-ratio' },
  'demo-circle': { crumbs: ['数学', '动画', '圆：绕绳量一量'], target: 'demo-circle' },
  'demo-percent': { crumbs: ['数学', '动画', '百分数：百分条'], target: 'demo-percent' },
  'demo-fan': { crumbs: ['数学', '动画', '扇形统计图：转一转'], target: 'demo-fan' },
  'demo-lsquare': { crumbs: ['数学', '动画', '数与形：一层层包正方形'], target: 'demo-lsquare' },
  'demo-thermo': { crumbs: ['数学', '动画', '负数：温度计'], target: 'demo-thermo' },
  'demo-negmul': { crumbs: ['数学', '动画', '负数运算：翻一翻'], target: 'demo-negmul' },
  'demo-discount': { crumbs: ['数学', '动画', '百分数（二）：打折和利息'], target: 'demo-discount' },
  'demo-cylinder': { crumbs: ['数学', '动画', '圆柱与圆锥：倒沙'], target: 'demo-cylinder' },
  'demo-pigeon': { crumbs: ['数学', '动画', '鸽巢问题：先每洞一只'], target: 'demo-pigeon' },
  'demo-conceptmap': { crumbs: ['数学', '动画', '整理和复习：认出老办法'], target: 'demo-conceptmap' },
  'demo-numline': { crumbs: ['数学', '动画', '数轴：标一点、走一走'], target: 'demo-numline' },
  'demo-powerup': { crumbs: ['数学', '动画', '乘方：对折纸和科学记数法'], target: 'demo-powerup' },
  'demo-monomial': { crumbs: ['数学', '动画', '整式：拆零件看系数次数'], target: 'demo-monomial' },
  'demo-liketerms': { crumbs: ['数学', '动画', '整式的加减：合并同类项'], target: 'demo-liketerms' },
  'demo-meetline': { crumbs: ['数学', '动画', '相向而行：几小时相遇'], target: 'demo-meetline' },
  'demo-lineseg': { crumbs: ['数学', '动画', '直线、射线、线段'], target: 'demo-lineseg' },
  'demo-anglepair': { crumbs: ['数学', '动画', '角：余角、补角、角平分线'], target: 'demo-anglepair' },
  'demo-vertangle': { crumbs: ['数学', '动画', '相交线：对顶角和垂线段'], target: 'demo-vertangle' },
  'demo-parangles': { crumbs: ['数学', '动画', '平行线：截角和平移'], target: 'demo-parangles' },
  'demo-roots': { crumbs: ['数学', '动画', '实数：开方机器和 √2'], target: 'demo-roots' },
  'demo-coordplane': { crumbs: ['数学', '动画', '平面直角坐标系：点一点'], target: 'demo-coordplane' },
  'demo-ineqline': { crumbs: ['数学', '动画', '不等式：数轴上画解集'], target: 'demo-ineqline' },
  'demo-histogram': { crumbs: ['数学', '动画', '直方图：分组数频数'], target: 'demo-histogram' },
  'demo-trisides': { crumbs: ['数学', '动画', '三角形：三边围不围'], target: 'demo-trisides' },
  'demo-congruent': { crumbs: ['数学', '动画', '全等三角形：判定拼一拼'], target: 'demo-congruent' },
  'demo-foldmirror': { crumbs: ['数学', '动画', '轴对称：对折看对称'], target: 'demo-foldmirror' },
  'demo-algarea': { crumbs: ['数学', '动画', '整式：面积模型'], target: 'demo-algarea' },
  'demo-algfrac': { crumbs: ['数学', '动画', '分式：约分'], target: 'demo-algfrac' },
  'demo-eqsieve': { crumbs: ['数学', '动画', '分式方程：过筛检验'], target: 'demo-eqsieve' },
  'demo-radical': { crumbs: ['数学', '动画', '二次根式：化简'], target: 'demo-radical' },
  'demo-pythag': { crumbs: ['数学', '动画', '勾股定理：面积拼图'], target: 'demo-pythag' },
  'demo-pargram': { crumbs: ['数学', '动画', '平行四边形：推一推'], target: 'demo-pargram' },
  'demo-specialquad': { crumbs: ['数学', '动画', '特殊的平行四边形：加条件变身'], target: 'demo-specialquad' },
  'demo-datastats': { crumbs: ['数学', '动画', '数据的分析：算一算'], target: 'demo-datastats' },
  'demo-quad': { crumbs: ['数学', '动画', '一元二次方程：配方法、判别式'], target: 'demo-quad' },
  'demo-growth': { crumbs: ['数学', '动画', '增长率与韦达定理'], target: 'demo-growth' },
  'demo-parabola': { crumbs: ['数学', '动画', '二次函数：抛物线'], target: 'demo-parabola' },
  'demo-spin': { crumbs: ['数学', '动画', '旋转与中心对称'], target: 'demo-spin' },
  'demo-circangle': { crumbs: ['数学', '动画', '圆：圆周角与垂径定理'], target: 'demo-circangle' },
  'demo-tangent': { crumbs: ['数学', '动画', '直线和圆、切线长'], target: 'demo-tangent' },
  'demo-sector': { crumbs: ['数学', '动画', '弧长、扇形与圆锥'], target: 'demo-sector' },
  'demo-coin': { crumbs: ['数学', '动画', '随机事件与概率'], target: 'demo-coin' },
  'demo-tree': { crumbs: ['数学', '动画', '树状图求概率'], target: 'demo-tree' },
  'demo-hyperbola': { crumbs: ['数学', '动画', '反比例函数：双曲线'], target: 'demo-hyperbola' },
  'demo-similar': { crumbs: ['数学', '动画', '相似与位似'], target: 'demo-similar' },
  'demo-shadow': { crumbs: ['数学', '动画', '相似三角形：影子测高'], target: 'demo-shadow' },
  'demo-trig': { crumbs: ['数学', '动画', '锐角三角函数'], target: 'demo-trig' },
  'demo-slope': { crumbs: ['数学', '动画', '仰角、俯角与坡度'], target: 'demo-slope' },
  'demo-project': { crumbs: ['数学', '动画', '投影与三视图'], target: 'demo-project' },
  'demo-twentyfour': { crumbs: ['数学', '动画', '24点：四个数拼出24'], target: 'demo-twentyfour' },
  'demo-monty': { crumbs: ['数学', '动画', '三门问题：换还是不换'], target: 'demo-monty' },
  'demo-maxarea': { crumbs: ['数学', '动画', '周长20，面积谁最大'], target: 'demo-maxarea' },
  'demo-matches': { crumbs: ['数学', '动画', '火柴棒：动一根就对了'], target: 'demo-matches' },
  'demo-mobius': { crumbs: ['数学', '动画', '莫比乌斯带：剪一刀'], target: 'demo-mobius' },
  'demo-shopweek': { crumbs: ['数学', '动画', '开店一周：怎么赚钱'], target: 'demo-shopweek' },
  'demo-fairgame': { crumbs: ['数学', '动画', '公平游戏：自己定规则'], target: 'demo-fairgame' },
  'demo-makerule': { crumbs: ['数学', '动画', '造规律：考考第20个'], target: 'demo-makerule' },
  'demo-thirteen': { crumbs: ['数学', '动画', '13有几种凑法'], target: 'demo-thirteen' },
  'demo-maketen': { crumbs: ['数学', '动画', '凑十：把 10 装满'], target: 'demo-maketen' },
  'demo-areamul': { crumbs: ['数学', '动画', '面积模型乘法'], target: 'demo-areamul' },
  'demo-fraceq': { crumbs: ['数学', '动画', '分数相等'], target: 'demo-fraceq' },
  'demo-buildfrac': { crumbs: ['数学', '动画', '造分数'], target: 'demo-buildfrac' },
  'demo-areabuild': { crumbs: ['数学', '动画', '面积建造者'], target: 'demo-areabuild' },
  'demo-quadmorph': { crumbs: ['数学', '动画', '四边形变形'], target: 'demo-quadmorph' },
  'demo-numplay': { crumbs: ['数学', '动画', '数一数：一个数，五种样子'], target: 'demo-numplay' },
  'demo-fracnumline': { crumbs: ['数学', '动画', '分数变数线'], target: 'demo-fracnumline' },
  why:        { crumbs: ['数学', '动画', '为什么小实验'], target: 'why' },
  lab:        { crumbs: ['数学', '数学实验室'], target: 'lab' },
  review:     { crumbs: ['数学', '错题本'], target: 'review', action: renderWrongBook },
  'today-review': { crumbs: ['数学', '今天复习'], target: 'grades', action: renderReview },
  progress:   { crumbs: ['数学', '我的进度'], target: 'progressCard', action: renderProgress },
  exam:       { crumbs: ['数学', '模拟测'], target: 'exam', action: renderExamIntro },
  parent:     { crumbs: ['数学', '我的进度', '家长看这里'], target: 'parentCard', action: renderParent },
  inquiry:    { crumbs: ['数学', '探究作业'], target: 'inquiry', action: renderInquiry },
  checkpoint: { crumbs: ['数学', '闯关路'], target: 'checkpoint', action: renderCheckpoint },
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
      // 单元名和知识点名一样时只出现一次（68 个点标题等于单元名，如 6.6 百分数（一））。
      NAV_DEFS['point-' + p.id] = { crumbs: u.unit === p.title ? ['数学', '选年级', g + ' 年级', p.title] : ['数学', '选年级', g + ' 年级', u.unit, p.title], target: 'grades', action: () => renderPoint(p.id) };
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
const creativePanelsEl = document.getElementById('creativePanels');
const creativeLabelEl = document.getElementById('creativeLabel');
const simPanelsEl = document.getElementById('simPanels');
const simLabelEl = document.getElementById('simLabel');
const demoLabelEl = document.getElementById('demoLabel');
const demoGridEl = document.getElementById('demoGrid');
const whySec = document.getElementById('why');
const labSec = document.getElementById('lab');
const reviewSec = document.getElementById('review');
const examSec = document.getElementById('exam');
const progressCardEl = document.getElementById('progressCard');
const reviewCardEl = document.getElementById('reviewCard');
const parentCardEl = document.getElementById('parentCard');
const inquirySec = document.getElementById('inquiry');
const checkpointSec = document.getElementById('checkpoint');
const inquiryEntryRow = document.getElementById('inquiryEntryRow');
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
  if (key === 'demo-tenframe' || key === 'demo-fraction' || key === 'demo-balance' || key === 'demo-function' || key === 'demo-count' || key === 'demo-position' || key === 'demo-split' || key === 'demo-addsub' || key === 'demo-solids' || key === 'demo-bundle' || key === 'demo-clock' || key === 'demo-tangram' || key === 'demo-sort' || key === 'demo-hundred' || key === 'demo-shop' || key === 'demo-place' || key === 'demo-pattern' || key === 'demo-ruler' || key === 'demo-estimate' || key === 'demo-angle' || key === 'demo-array' || key === 'demo-observe' || key === 'demo-time' || key === 'demo-share' || key === 'demo-motion' || key === 'demo-mixop' || key === 'demo-remain' || key === 'demo-thousand' || key === 'demo-weight' || key === 'demo-chart' || key === 'demo-logic' || key === 'demo-pair' || key === 'demo-elapsed' || key === 'demo-verify' || key === 'demo-units' || key === 'demo-times' || key === 'demo-splitmul' || key === 'demo-rectsq' || key === 'demo-venn' || key === 'demo-compass' || key === 'demo-divplace' || key === 'demo-stattable' || key === 'demo-fourgrid' || key === 'demo-area' || key === 'demo-calendar' || key === 'demo-decimal' || key === 'demo-bignum' || key === 'demo-field' || key === 'demo-protractor' || key === 'demo-areamodel' || key === 'demo-parallelogram' || key === 'demo-trialdiv' || key === 'demo-baraxis' || key === 'demo-teatime' || key === 'demo-zerodiv' || key === 'demo-laws' || key === 'demo-placeslider' || key === 'demo-tearangle' || key === 'demo-decadd' || key === 'demo-moveshape' || key === 'demo-average' || key === 'demo-chickenrabbit' || key === 'demo-crslider' || key === 'demo-crdraw' || key === 'demo-crlist' || key === 'demo-crgolden' || key === 'demo-decmul' || key === 'demo-gridpos' || key === 'demo-decdiv' || key === 'demo-prob' || key === 'demo-polyarea' || key === 'demo-planttree' || key === 'demo-factor' || key === 'demo-cuboid' || key === 'demo-fracadd' || key === 'demo-rotate' || key === 'demo-findbad' || key === 'demo-radar' || key === 'demo-ratio' || key === 'demo-circle' || key === 'demo-percent' || key === 'demo-fan' || key === 'demo-lsquare' || key === 'demo-thermo' || key === 'demo-negmul' || key === 'demo-discount' || key === 'demo-cylinder' || key === 'demo-pigeon' || key === 'demo-numline' || key === 'demo-powerup' || key === 'demo-monomial' || key === 'demo-liketerms' || key === 'demo-meetline' || key === 'demo-lineseg' || key === 'demo-anglepair' || key === 'demo-vertangle' || key === 'demo-parangles' || key === 'demo-roots' || key === 'demo-coordplane' || key === 'demo-ineqline' || key === 'demo-histogram' || key === 'demo-trisides' || key === 'demo-congruent' || key === 'demo-foldmirror' || key === 'demo-algarea' || key === 'demo-algfrac' || key === 'demo-eqsieve' || key === 'demo-radical' || key === 'demo-pythag' || key === 'demo-pargram' || key === 'demo-specialquad' || key === 'demo-datastats' || key === 'demo-quad' || key === 'demo-growth' || key === 'demo-parabola' || key === 'demo-spin' || key === 'demo-circangle' || key === 'demo-tangent' || key === 'demo-sector' || key === 'demo-coin' || key === 'demo-tree' || key === 'demo-hyperbola' || key === 'demo-similar' || key === 'demo-shadow' || key === 'demo-trig' || key === 'demo-slope' || key === 'demo-project' || key === 'demo-twentyfour' || key === 'demo-monty' || key === 'demo-maxarea' || key === 'demo-matches' || key === 'demo-mobius' || key === 'demo-shopweek' || key === 'demo-fairgame' || key === 'demo-makerule' || key === 'demo-thirteen' || key === 'demo-maketen' || key === 'demo-areamul' || key === 'demo-fraceq' || key === 'demo-buildfrac' || key === 'demo-areabuild' || key === 'demo-quadmorph' || key === 'demo-numplay' || key === 'demo-fracnumline') return key;
  if (key === 'why') return 'why';
  if (key === 'lab') return 'lab';
  if (key === 'review') return 'review';
  if (key === 'progress') return 'progress';
  if (key === 'parent') return 'parent';
  if (key === 'exam') return 'exam';
  if (key === 'inquiry') return 'inquiry';
  if (key === 'checkpoint') return 'checkpoint';
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
  setHidden(inquiryEntryRow, view !== 'path');
  setHidden(pathSec.querySelector('h2'), view === 'path-step');
  setHidden(pathSec.querySelector('.section-sub'), view === 'path-step');
  const stepN = view === 'path-step' ? key.slice('path-step-'.length) : null;
  [...pathPanelsEl.children].forEach(el => { el.hidden = !!(stepN && el.id !== 'step-' + stepN); });
  // 互动演示：列表留演示面板；叶子只留该演示卡片；为什么小实验只留 #why 区
  const demoLeaf = view === 'demo-tenframe' || view === 'demo-fraction' || view === 'demo-balance' || view === 'demo-function' || view === 'demo-count' || view === 'demo-position' || view === 'demo-split' || view === 'demo-addsub' || view === 'demo-solids' || view === 'demo-bundle' || view === 'demo-clock' || view === 'demo-tangram' || view === 'demo-sort' || view === 'demo-hundred' || view === 'demo-shop' || view === 'demo-place' || view === 'demo-pattern' || view === 'demo-ruler' || view === 'demo-estimate' || view === 'demo-angle' || view === 'demo-array' || view === 'demo-observe' || view === 'demo-time' || view === 'demo-share' || view === 'demo-motion' || view === 'demo-mixop' || view === 'demo-remain' || view === 'demo-thousand' || view === 'demo-weight' || view === 'demo-chart' || view === 'demo-logic' || view === 'demo-pair' || view === 'demo-elapsed' || view === 'demo-verify' || view === 'demo-units' || view === 'demo-times' || view === 'demo-splitmul' || view === 'demo-rectsq' || view === 'demo-venn' || view === 'demo-compass' || view === 'demo-divplace' || view === 'demo-stattable' || view === 'demo-fourgrid' || view === 'demo-area' || view === 'demo-calendar' || view === 'demo-decimal' || view === 'demo-bignum' || view === 'demo-field' || view === 'demo-protractor' || view === 'demo-areamodel' || view === 'demo-parallelogram' || view === 'demo-trialdiv' || view === 'demo-baraxis' || view === 'demo-teatime' || view === 'demo-zerodiv' || view === 'demo-laws' || view === 'demo-placeslider' || view === 'demo-tearangle' || view === 'demo-decadd' || view === 'demo-moveshape' || view === 'demo-average' || view === 'demo-chickenrabbit' || view === 'demo-crslider' || view === 'demo-crdraw' || view === 'demo-crlist' || view === 'demo-crgolden' || view === 'demo-decmul' || view === 'demo-gridpos' || view === 'demo-decdiv' || view === 'demo-prob' || view === 'demo-polyarea' || view === 'demo-planttree' || view === 'demo-factor' || view === 'demo-cuboid' || view === 'demo-fracadd' || view === 'demo-rotate' || view === 'demo-findbad' || view === 'demo-radar' || view === 'demo-ratio' || view === 'demo-circle' || view === 'demo-percent' || view === 'demo-fan' || view === 'demo-lsquare' || view === 'demo-thermo' || view === 'demo-negmul' || view === 'demo-discount' || view === 'demo-cylinder' || view === 'demo-pigeon' || view === 'demo-numline' || view === 'demo-powerup' || view === 'demo-monomial' || view === 'demo-liketerms' || view === 'demo-meetline' || view === 'demo-lineseg' || view === 'demo-anglepair' || view === 'demo-vertangle' || view === 'demo-parangles' || view === 'demo-roots' || view === 'demo-coordplane' || view === 'demo-ineqline' || view === 'demo-histogram' || view === 'demo-trisides' || view === 'demo-congruent' || view === 'demo-foldmirror' || view === 'demo-algarea' || view === 'demo-algfrac' || view === 'demo-eqsieve' || view === 'demo-radical' || view === 'demo-pythag' || view === 'demo-pargram' || view === 'demo-specialquad' || view === 'demo-datastats' || view === 'demo-quad' || view === 'demo-growth' || view === 'demo-parabola' || view === 'demo-spin' || view === 'demo-circangle' || view === 'demo-tangent' || view === 'demo-sector' || view === 'demo-coin' || view === 'demo-tree' || view === 'demo-hyperbola' || view === 'demo-similar' || view === 'demo-shadow' || view === 'demo-trig' || view === 'demo-slope' || view === 'demo-project' || view === 'demo-twentyfour' || view === 'demo-monty' || view === 'demo-maxarea' || view === 'demo-matches' || view === 'demo-mobius' || view === 'demo-shopweek' || view === 'demo-fairgame' || view === 'demo-makerule' || view === 'demo-thirteen' || view === 'demo-maketen' || view === 'demo-areamul' || view === 'demo-fraceq' || view === 'demo-buildfrac' || view === 'demo-areabuild' || view === 'demo-quadmorph' || view === 'demo-numplay' || view === 'demo-fracnumline';
  setHidden(demosSec, !(view === 'demos' || demoLeaf));
  setHidden(demoPanelsEl, view !== 'demos');
  setHidden(creativePanelsEl, view !== 'demos');
  setHidden(creativeLabelEl, view !== 'demos');
  setHidden(simPanelsEl, view !== 'demos');
  setHidden(simLabelEl, view !== 'demos');
  setHidden(demoLabelEl, view !== 'demos');
  setHidden(demoGridEl, !demoLeaf); // 演示卡片网格只在某一个演示的叶子视图里出现，列表视图只留演示面板
  setHidden(demosSec.querySelector('h2'), demoLeaf);
  setHidden(demosSec.querySelector('.section-sub'), demoLeaf);
  [...demoGridEl.children].forEach(el => { el.hidden = demoLeaf && el.id !== view; });
  setHidden(whySec, view !== 'why');
  // 数学实验室：只有进实验室才显示整个 #lab 区
  setHidden(labSec, view !== 'lab');
  // 复习与进度：错题本只留错题卡片，我的进度只留进度卡片，家长端只留家长卡片；
  // 今天复习不留 #review 区（它的列表在 pointDetail 里）。
  setHidden(reviewSec, !(isWrongBook || view === 'progress' || view === 'parent'));
  setHidden(progressCardEl, view !== 'progress');
  setHidden(reviewCardEl, !isWrongBook);
  setHidden(parentCardEl, view !== 'parent');
  // 模拟测：只有进模拟测才显示整个 #exam 区
  setHidden(examSec, view !== 'exam');
  // 探究作业：只有进探究作业才显示整个 #inquiry 区
  setHidden(inquirySec, view !== 'inquiry');
  // 闯关路：只有进闯关路才显示整个 #checkpoint 区
  setHidden(checkpointSec, view !== 'checkpoint');
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
  if (key === 'parent') return 'progress';
  if (key === 'inquiry') return 'path';
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

/* ================= 数学实验室 · 一间工作间（第二阶段） =================
   一张桌子：托盘（共用零件盒）+ 3 个组合台（分数加法 / 天平 / 数轴）
   + 13 个问题入口（9 个创意实验 + 4 个工作间问题）+ 自由玩/挑战两种模式 + 实验记录。
   技术只用三件小东西（按“数学应该更简单”的要求）：
   (1) 数字引擎——分数全按 [分子, 分母] 对算，绝不用 0.333 这类浮点近似；
   (2) 几何引擎——SVG 按坐标画（天平横梁旋转、数轴落点都是坐标算出来的）；
   (3) 规则引擎——放不下的数放不下（数轴只到 2、托盘最多 3 个、负数不能上天平），
   规则是撞出来的，不是念出来的。四个小站原样保留，只是多了“放到托盘”的口子。 */

/* ---------- 小值：分数按 [n, d] 对算，整数就是分母为 1 的分数 ---------- */
function labFracReduce(n, d) { const g = gcd(Math.abs(n), d); return { n: n / g, d: d / g }; }
function labFracStr(n, d) { const r = labFracReduce(n, d); return r.d === 1 ? String(r.n) : r.n + '/' + r.d; }
function labFracAddF(a, b) {
  const l = a.d * b.d / gcd(a.d, b.d);
  return labFracReduce(a.n * (l / a.d) + b.n * (l / b.d), l);
}
function labValFrac(v) { return v.kind === 'frac' ? labFracReduce(v.n, v.d) : { n: v.v, d: 1 }; }
function labValNum(v) { return v.kind === 'frac' ? v.n / v.d : v.v; }
function labValLabel(v) { return v.kind === 'frac' ? labFracStr(v.n, v.d) : String(v.v); }

/* ---------- 托盘：最多 3 个值，四个小站往里放，组合台往外拿 ---------- */
var labTray = []; // {kind:'frac', n, d, src} 或 {kind:'num', v, src}
function labTrayRender() {
  const box = document.getElementById('labTray');
  clearChildren(box);
  labTray.forEach((v, i) => {
    const chip = document.createElement('span');
    chip.className = 'lab-chip';
    chip.textContent = labValLabel(v) + ' ';
    [['加', 'frac', '加法台'], ['平', 'bal', '天平'], ['线', 'line', '数轴']].forEach(([t, bench, name]) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn small ghost'; b.textContent = t;
      b.setAttribute('aria-label', '把 ' + labValLabel(v) + ' 送到' + name);
      b.addEventListener('click', () => labTraySend(i, bench));
      chip.appendChild(b);
    });
    const x = document.createElement('button');
    x.type = 'button'; x.className = 'btn small ghost'; x.textContent = '×';
    x.setAttribute('aria-label', '拿掉 ' + labValLabel(v));
    x.addEventListener('click', () => { labTray.splice(i, 1); labTrayRender(); });
    chip.appendChild(x);
    box.appendChild(chip);
  });
  document.getElementById('labTrayMsg').textContent = labTray.length
    ? '托盘里有 ' + labTray.length + ' 个。点“加 / 平 / 线”把它送到对应的组合台。'
    : '托盘是空的。去下面的四个小站玩一玩，点“放到托盘”，就能把数带上来。';
}
function labTrayAdd(v) {
  if (labTray.length >= 3) {
    document.getElementById('labTrayMsg').textContent = '托盘满了（最多 3 个），先用掉一个再放。';
    labTrace('托盘满了，放不下 ' + labValLabel(v), false);
    return false;
  }
  labTray.push(v);
  labTrayRender();
  labTrace('放到托盘：' + labValLabel(v) + '（来自' + v.src + '）', true);
  return true;
}
function labTraySend(i, bench) {
  const v = labTray[i];
  if (!v) return;
  if (bench === 'frac') {
    if (v.kind !== 'frac') {
      document.getElementById('labTrayMsg').textContent = '只有分数能送到加法台，' + labValLabel(v) + ' 不是分数。';
      labTrace('加法台不要 ' + labValLabel(v) + '（不是分数）', false);
      return;
    }
    if (!labFaTouched.A) { labFaA = { n: v.n, d: v.d }; labFaTouched.A = true; }
    else if (!labFaTouched.B) { labFaB = { n: v.n, d: v.d }; labFaTouched.B = true; }
    else { labFaA = { n: v.n, d: v.d }; labFaTouched.A = true; }
    labFaRender();
    labTray.splice(i, 1); labTrayRender();
    labTrace('把 ' + labValLabel(v) + ' 送到加法台', true);
  } else if (bench === 'bal') {
    if (labValNum(v) < 0) {
      document.getElementById('labTrayMsg').textContent = '负数不能当地平砝码——天平上只放正的数。';
      labTrace('天平不要负数 ' + labValLabel(v), false);
      return;
    }
    labWbAdd(v, labWbPan);
    labTray.splice(i, 1); labTrayRender();
  } else if (bench === 'line') {
    if (labLinePlace(v)) { labTray.splice(i, 1); labTrayRender(); }
  }
}
/* 四个小站往托盘里送数：分数站送当前分数，十格阵送两边总数，
   天平站送左边的总数，函数站送 x=2 时的 y（2k+b）。0 不送（什么都没放）。 */
function labSendFrac() {
  if (labNumer === 0) { document.getElementById('labTrayMsg').textContent = '分数站现在是 0，送过去也是 0——先取几份再送。'; return; }
  labTrayAdd({ kind: 'frac', n: labNumer, d: labDenom, src: '分数站' });
}
function labSendTf() {
  const t = labTfA + labTfB;
  if (t === 0) { document.getElementById('labTrayMsg').textContent = '十格阵现在是 0 个，送过去也是 0——先放几个圆点再送。'; return; }
  labTrayAdd({ kind: 'num', v: t, src: '十格阵' });
}
function labSendBal() {
  if (labBalL === 0) { document.getElementById('labTrayMsg').textContent = '天平左边现在是 0，送过去也是 0——先往左边加几个砝码再送。'; return; }
  labTrayAdd({ kind: 'num', v: labBalL, src: '天平站' });
}
function labSendFunc() {
  const k = parseFloat(document.getElementById('labFuncKRange').value);
  const b = parseFloat(document.getElementById('labFuncBRange').value);
  labTrayAdd({ kind: 'num', v: 2 * k + b, src: '函数站' });
}
document.getElementById('labFracToTray').addEventListener('click', labSendFrac);
document.getElementById('labTfToTray').addEventListener('click', labSendTf);
document.getElementById('labBalToTray').addEventListener('click', labSendBal);
document.getElementById('labFuncToTray').addEventListener('click', labSendFunc);

/* ---------- 分数加法台：错拼（分子加分子）画出来，看它为什么拼不上 ---------- */
var labFaA = { n: 1, d: 2 }, labFaB = { n: 1, d: 3 };
var labFaTouched = { A: false, B: false };
function labFaSet(which, dn, dd) {
  const f = which === 'A' ? labFaA : labFaB;
  if (dd) f.d = Math.max(2, Math.min(8, f.d + dd));
  if (dn) f.n = Math.max(0, Math.min(f.d, f.n + dn));
  if (f.n > f.d) f.n = f.d;
  labFaTouched[which] = true;
  labFaRender();
}
function labFaRender() {
  document.getElementById('labFaAN').textContent = labFaA.n;
  document.getElementById('labFaAD').textContent = labFaA.d;
  document.getElementById('labFaBN').textContent = labFaB.n;
  document.getElementById('labFaBD').textContent = labFaB.d;
  document.getElementById('labFracNaiveBar').style.width = '0%';
  document.getElementById('labFracCorrectBar').style.width = '0%';
  document.getElementById('labFracAddOut').textContent = '还没拼。先调两个分数，再点“拼一拼”。';
}
function labFracAdd() {
  const aL = labFracStr(labFaA.n, labFaA.d), bL = labFracStr(labFaB.n, labFaB.d);
  const naive = labFracReduce(labFaA.n + labFaB.n, labFaA.d + labFaB.d);
  const l = labFaA.d * labFaB.d / gcd(labFaA.d, labFaB.d);
  const aN = labFaA.n * (l / labFaA.d), bN = labFaB.n * (l / labFaB.d);
  const sum = labFracReduce(aN + bN, l);
  const naiveL = labFracStr(naive.n, naive.d), sumL = labFracStr(sum.n, sum.d);
  const gap = labFracReduce(sum.n * naive.d - naive.n * sum.d, sum.d * naive.d);
  const gapL = labFracStr(gap.n, gap.d);
  const correctNum = sum.n / sum.d, naiveNum = naive.n / naive.d;
  const scale = Math.max(1.25, correctNum * 1.05);
  document.getElementById('labFracNaiveBar').style.width = (naiveNum / scale * 100) + '%';
  document.getElementById('labFracCorrectBar').style.width = (correctNum / scale * 100) + '%';
  document.getElementById('labFracOneMarkA').style.left = (1 / scale * 100) + '%';
  document.getElementById('labFracOneMarkB').style.left = (1 / scale * 100) + '%';
  let out;
  if (gap.n === 0) {
    out = '两个分数都是 0，加起来还是 0。';
  } else if (labFaA.d === labFaB.d) {
    out = '按分子加分子、分母加分母拼出来 ' + naiveL + '——分母本来就一样大，不用切：' + aL + ' + ' + bL + ' = ' + sumL + '，这才是对的。错拼比正确少了 ' + gapL + '。';
  } else {
    out = '按分子加分子、分母加分母拼出来 ' + naiveL + '——可是 ' + aL + ' 的格子和 ' + bL + ' 的格子大小不一样，拼不到一块，少了 ' + gapL + '。把 ' + aL + ' 切成 ' + labFracStr(aN, l) + '，' + bL + ' 切成 ' + labFracStr(bN, l) + '，' + labFracStr(aN, l) + ' + ' + labFracStr(bN, l) + ' = ' + sumL + '，这才是对的。';
  }
  document.getElementById('labFracAddOut').textContent = out;
  labTrace('分数加法台：' + aL + ' + ' + bL + ' = ' + sumL + '（错拼 ' + naiveL + ' 拼不上）', true);
}
[['labFaANMinus', 'A', -1, 0], ['labFaANPlus', 'A', 1, 0], ['labFaADMinus', 'A', 0, -1], ['labFaADPlus', 'A', 0, 1],
 ['labFaBNMinus', 'B', -1, 0], ['labFaBNPlus', 'B', 1, 0], ['labFaBDMinus', 'B', 0, -1], ['labFaBDPlus', 'B', 0, 1]
].forEach(([id, w, dn, dd]) => document.getElementById(id).addEventListener('click', () => labFaSet(w, dn, dd)));
document.getElementById('labFaAdd').addEventListener('click', labFracAdd);

/* ---------- 天平组合台：分数砝码 + 整数砝码，横梁按重量差实时倾斜 ---------- */
var labWbL = [], labWbR = []; // 每边一串小值 {kind:'frac',n,d} 或 {kind:'num',v}
var labWbPan = 'L';
function labWbSum(pan) {
  let s = { n: 0, d: 1 };
  (pan === 'L' ? labWbL : labWbR).forEach(v => { s = labFracAddF(s, labValFrac(v)); });
  return s;
}
function labWbWeightsHtml(arr, x0) {
  let h = '';
  arr.forEach((v, i) => {
    const x = x0 + (i % 4) * 14, y = 76 + Math.floor(i / 4) * 14;
    h += '<rect x="' + x + '" y="' + y + '" width="12" height="12" rx="2" fill="' + (v.kind === 'frac' ? '#ff8a3d' : '#2563eb') + '" data-lab-wb="' + x0 + ':' + i + '" style="cursor:pointer"/>';
  });
  return h;
}
function labWbListText(arr) {
  return arr.length ? arr.map(labValLabel).join(' + ') : '空';
}
function labWbRender() {
  const L = labWbSum('L'), R = labWbSum('R');
  const lNum = L.n / L.d, rNum = R.n / R.d;
  const tilt = Math.max(-15, Math.min(15, (rNum - lNum) * 3));
  document.getElementById('labWbBeam').setAttribute('transform', 'rotate(' + tilt + ' 160 70)');
  document.getElementById('labWbLeftWeights').innerHTML = labWbWeightsHtml(labWbL, 33);
  document.getElementById('labWbRightWeights').innerHTML = labWbWeightsHtml(labWbR, 233);
  document.getElementById('labWbEq').textContent = '左 ' + labFracStr(L.n, L.d) + ' ＝ 右 ' + labFracStr(R.n, R.d);
  document.getElementById('labWbList').textContent = '左盘：' + labWbListText(labWbL) + '　右盘：' + labWbListText(labWbR);
  let msg;
  if (L.n * R.d === R.n * L.d) {
    msg = '平了！左盘和右盘都是 ' + labFracStr(L.n, L.d) + '。';
  } else {
    const diff = labFracReduce(Math.abs(L.n * R.d - R.n * L.d), L.d * R.d);
    const diffL = labFracStr(diff.n, diff.d);
    msg = (lNum > rNum ? '左边重 ' : '右边重 ') + diffL + '。';
    if (diff.d !== 1) msg += '整数砝码一次加 1，凑不出 ' + diffL + '，试试下面的分数砝码。';
  }
  document.getElementById('labWbMsg').textContent = msg;
}
function labWbAdd(v, pan) {
  (pan === 'L' ? labWbL : labWbR).push(v);
  labWbRender();
  labTrace('天平组合台：' + (pan === 'L' ? '左盘' : '右盘') + '加了 ' + labValLabel(v), true);
}
function labWbSetPan(pan) {
  labWbPan = pan;
  document.getElementById('labWbPanL').setAttribute('aria-pressed', String(pan === 'L'));
  document.getElementById('labWbPanR').setAttribute('aria-pressed', String(pan === 'R'));
}
function labWbIntMinus() {
  const arr = labWbPan === 'L' ? labWbL : labWbR;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i].kind === 'num') { arr.splice(i, 1); labWbRender(); return; }
  }
  document.getElementById('labWbMsg').textContent = '这个盘里没有整数砝码可拿——先放一个整数砝码，或者点盘子里的砝码拿掉它。';
}
document.getElementById('labWbPanL').addEventListener('click', () => labWbSetPan('L'));
document.getElementById('labWbPanR').addEventListener('click', () => labWbSetPan('R'));
[['labWbF2', 2], ['labWbF3', 3], ['labWbF4', 4], ['labWbF6', 6]].forEach(([id, d]) =>
  document.getElementById(id).addEventListener('click', () => labWbAdd({ kind: 'frac', n: 1, d: d }, labWbPan)));
document.getElementById('labWbIntPlus').addEventListener('click', () => labWbAdd({ kind: 'num', v: 1 }, labWbPan));
document.getElementById('labWbIntMinus').addEventListener('click', labWbIntMinus);
document.getElementById('labWbClear').addEventListener('click', () => { labWbL = []; labWbR = []; labWbRender(); });
document.getElementById('labWbSvg').addEventListener('click', e => {
  const t = e.target && e.target.dataset ? e.target.dataset.labWb : null;
  if (!t) return;
  const [x0, i] = t.split(':');
  const arr = x0 === '33' ? labWbL : labWbR;
  arr.splice(+i, 1);
  labWbRender();
});

/* ---------- 数轴组合台：0 到 2，托盘里的数落在哪，两点之间差多少 ---------- */
var labLinePts = []; // 最多 2 个 {n, d}
function labLinePlace(v) {
  const f = labValFrac(v);
  const num = f.n / f.d;
  if (num < 0 || num > 2) {
    document.getElementById('labLineMsg').textContent = labValLabel(v) + ' 放不下：这条数轴只到 2，' + labValLabel(v) + ' 在 2 外面。';
    labTrace('数轴放不下 ' + labValLabel(v) + '（只到 2）', false);
    return false;
  }
  if (labLinePts.length >= 2) {
    document.getElementById('labLineMsg').textContent = '数轴上已经有 2 个点了，点一个点可以拿掉它。';
    return false;
  }
  labLinePts.push(f);
  labLineRender();
  labTrace('数轴上放了 ' + labValLabel(v), true);
  return true;
}
function labLineRemove(i) { labLinePts.splice(i, 1); labLineRender(); }
function labLineRender() {
  let s = '<line x1="20" y1="40" x2="300" y2="40" stroke="#334155" stroke-width="3" stroke-linecap="round"/>';
  [[0, '0'], [0.5, '1/2'], [1, '1'], [1.5, '3/2'], [2, '2']].forEach(([t, label]) => {
    const x = 20 + t / 2 * 280;
    s += '<line x1="' + x + '" y1="34" x2="' + x + '" y2="46" stroke="#334155" stroke-width="2"/>';
    s += '<text x="' + x + '" y="68" font-size="13" fill="#64748b" text-anchor="middle">' + label + '</text>';
  });
  labLinePts.forEach((p, i) => {
    const x = 20 + (p.n / p.d) / 2 * 280;
    s += '<circle cx="' + x + '" cy="40" r="10" fill="' + (i === 0 ? '#ff8a3d' : '#2563eb') + '" stroke="#fff" stroke-width="3" data-lab-pt="' + i + '" style="cursor:pointer"/>';
    s += '<text x="' + x + '" y="22" font-size="13" fill="#334155" text-anchor="middle">' + labFracStr(p.n, p.d) + '</text>';
  });
  if (labLinePts.length === 2) {
    const a = labLinePts[0], b = labLinePts[1];
    const x1 = 20 + (a.n / a.d) / 2 * 280, x2 = 20 + (b.n / b.d) / 2 * 280;
    s += '<line x1="' + Math.min(x1, x2) + '" y1="56" x2="' + Math.max(x1, x2) + '" y2="56" stroke="#16a34a" stroke-width="3"/>';
  }
  document.getElementById('labLineSvg').innerHTML = s;
  const msg = document.getElementById('labLineMsg');
  if (labLinePts.length === 0) {
    msg.textContent = '数轴上还没有点。点托盘里的数块下面的“线”，把它放到数轴上（0 到 2 之间才放得下）。';
  } else if (labLinePts.length === 1) {
    msg.textContent = labFracStr(labLinePts[0].n, labLinePts[0].d) + ' 落在这里。再放一个点，就能看出两个数差多少。';
  } else {
    const a = labLinePts[0], b = labLinePts[1];
    const diff = labFracReduce(Math.abs(a.n * b.d - b.n * a.d), a.d * b.d);
    const hi = (a.n / a.d) >= (b.n / b.d) ? a : b, lo = hi === a ? b : a;
    msg.textContent = labFracStr(hi.n, hi.d) + ' − ' + labFracStr(lo.n, lo.d) + ' = ' + labFracStr(diff.n, diff.d) + '：两点之间差 ' + labFracStr(diff.n, diff.d) + '。';
  }
}
document.getElementById('labLineSvg').addEventListener('click', e => {
  const t = e.target && e.target.dataset ? e.target.dataset.labPt : null;
  if (t !== null && t !== undefined) labLineRemove(+t);
});
document.getElementById('labLineClear').addEventListener('click', () => { labLinePts = []; labLineRender(); });

/* ---------- 13 个问题入口 + 自由玩 / 挑战两种模式 + 交卷报告 ---------- */
var LAB_QUESTIONS = [
  { qid: 'q-thirteen', title: '13 有几种凑法？', demo: 'thirteen', points: ['1.6', '1.9', '1.11'], primary: '1.9' },
  { qid: 'q-twentyfour', title: '24 点', demo: 'twentyfour', points: ['4.9'], primary: '4.9' },
  { qid: 'q-monty', title: '换一扇门', demo: 'monty', points: ['9.9'], primary: '9.9' },
  { qid: 'q-maxarea', title: '周长一定面积最大', demo: 'maxarea', points: ['3.12'], primary: '3.12' },
  { qid: 'q-matches', title: '动 1 根火柴', demo: 'matches', points: ['4.9'], primary: '4.9' },
  { qid: 'q-mobius', title: '莫比乌斯带', demo: 'mobius', points: ['6.5'], primary: '6.5' },
  { qid: 'q-shopweek', title: '开店一周', demo: 'shopweek', points: ['6.6'], primary: '6.6' },
  { qid: 'q-fairgame', title: '公平游戏', demo: 'fairgame', points: ['5.4'], primary: '5.4' },
  { qid: 'q-makerule', title: '造规律', demo: 'makerule', points: ['1.16'], primary: '1.16' },
  { qid: 'q-fracadd', title: '分母不一样，分数能直接加吗？', bench: 'fracadd', points: ['5.11'], primary: '5.11' },
  { qid: 'q-balfrac', title: '天平一边放 1/2', bench: 'balfrac', points: ['5.5'], primary: '5.5' },
  { qid: 'q-numline', title: '7 在数轴上是哪里？', bench: 'numline', points: ['1.9'], primary: '1.9' },
  { qid: 'q-funcline', title: 'k 变成负数，直线往哪倒？', bench: 'funcline', points: ['8.15'], primary: '8.15' },
];
var labMode = 'free'; // 自由玩 | 挑战（本节课有效，不存档）
var labChallengeAttempts = []; // 挑战模式里点开过的问题 id（去重）
var labChallengeMarks = {}; // qid -> true 答对 / false 答错
var labChallengeSubmitted = false; // 交过卷之后盒子里是打分界面，实时列表不再覆盖它；新开一道题算新一轮
/* 挑战模式里做过的题：不用等点“交卷”才看到——做一道，这里就实时列一道。
   交卷之后是打分界面（有“提交报告”按钮），那时不再用这个列表覆盖它。 */
function labChallengeRenderLive() {
  const box = document.getElementById('labChallengeReport');
  if (!box) return;
  if (labChallengeSubmitted) return; // 已经交过卷，正在打分
  if (!labChallengeAttempts.length) {
    box.innerHTML = '<p>还没在挑战模式里做过题，先选一个问题。</p>';
    return;
  }
  box.innerHTML = '<p>已经做了 ' + labChallengeAttempts.length + ' 道：' +
    labChallengeAttempts.map(function (qid) {
      const q = LAB_QUESTIONS.find(function (x) { return x.qid === qid; });
      return esc(q ? q.title : qid);
    }).join('、') + '。做完点“交卷”，再给每一道打分。</p>';
}
function labEnterQuestion(qid) {
  const q = LAB_QUESTIONS.find(x => x.qid === qid);
  if (!q) return;
  if (labMode === 'challenge' && labChallengeAttempts.indexOf(qid) === -1) {
    labChallengeAttempts.push(qid);
    labChallengeSubmitted = false; // 新开一道题，算新一轮，实时列表重新接管盒子
    labTrace('挑战：开始做「' + q.title + '」', true);
  }
  labChallengeRenderLive();
  if (q.demo) { goDemoFromHere('demo-' + q.demo); return; } // 演示压在实验室上面，返回回实验室（以前走 navGo，返回落到演示总站）
  // 工作间问题：留在实验室，摆好这道题的架势（给的是题面，不是答案）。
  if (q.bench === 'fracadd') {
    labFaA = { n: 1, d: 2 }; labFaB = { n: 1, d: 3 }; labFaTouched = { A: false, B: false }; labFaRender();
    document.getElementById('labCurrentQ').textContent = '当前问题：分母不一样，分数能直接加吗？——先猜 1/2+1/3 是多少，再点“拼一拼”。';
  } else if (q.bench === 'balfrac') {
    labWbL = [{ kind: 'frac', n: 1, d: 2 }]; labWbR = []; labWbRender();
    document.getElementById('labCurrentQ').textContent = '当前问题：天平一边放 1/2，另一边要放多少才平？——左盘已经放了 1/2，右边你来配。';
  } else if (q.bench === 'numline') {
    document.getElementById('labCurrentQ').textContent = '当前问题：十格阵里的 7 个，放在这条 0 到 2 的数轴上是哪里？——先猜放不放得下，再去十格阵站放 7 个点、送到托盘、放到数轴上。';
  } else if (q.bench === 'funcline') {
    document.getElementById('labCurrentQ').textContent = '当前问题：k 变成负数，直线往哪倒？b 变成 0 呢？——去函数站拖一拖 k 和 b。';
  }
  labTrace('开始做「' + q.title + '」', true);
}
function labSetMode(m) {
  labMode = m;
  const lab = document.getElementById('lab');
  if (m === 'challenge') lab.classList.add('lab-challenge');
  else lab.classList.remove('lab-challenge');
  document.getElementById('labModeFree').setAttribute('aria-pressed', String(m === 'free'));
  document.getElementById('labModeChallenge').setAttribute('aria-pressed', String(m === 'challenge'));
  document.getElementById('labChallengeBox').hidden = (m !== 'challenge');
  if (m === 'challenge') labChallengeRenderLive(); // 进挑战模式就把已做的题列出来，不用等交卷
  document.getElementById('labModeTx').textContent = m === 'challenge'
    ? '挑战模式：没有提示，做完点“交卷”，答错的进今天复习。'
    : '自由玩：随便试，提示都在。';
}
function labSubmitChallenge() {
  const box = document.getElementById('labChallengeReport');
  labChallengeSubmitted = true; // 从这里起盒子里是打分界面，实时列表不再覆盖它
  if (!labChallengeAttempts.length) {
    box.innerHTML = '<p>还没在挑战模式里做过题，先选一个问题。</p>';
    return;
  }
  let html = '<p>挑战里做过的题（' + labChallengeAttempts.length + ' 道）：给每一道打个分，再点“提交报告”。</p>';
  labChallengeAttempts.forEach(qid => {
    const q = LAB_QUESTIONS.find(x => x.qid === qid);
    const f = findPoint(q.primary);
    const title = f ? f.point.title : q.primary;
    const mk = labChallengeMarks[qid];
    html += '<div class="point-sec"><h4>' + esc(q.title) + '</h4><p class="muted">用到：' + esc(q.primary) + ' ' + esc(title) + '</p>' +
      '<p>你答对了吗？ <button class="btn small" type="button" data-lab-mark="right" data-lab-q="' + qid + '"' + (mk === true ? ' aria-pressed="true"' : '') + '>答对了</button> ' +
      '<button class="btn small" type="button" data-lab-mark="wrong" data-lab-q="' + qid + '"' + (mk === false ? ' aria-pressed="true"' : '') + '>答错了</button></p>' +
      (mk === undefined ? '<p class="muted">还没打分。</p>' : '<p>记下了：' + (mk ? '答对了。' : '答错了。') + '</p>') + '</div>';
  });
  html += '<div class="btn-row"><button class="btn small primary" id="labChallengeFinish" type="button">提交报告</button></div><p id="labChallengeDone"></p>';
  box.innerHTML = html;
  box.querySelectorAll('[data-lab-mark]').forEach(b => b.addEventListener('click', () => {
    labChallengeMark(b.dataset.labQ, b.dataset.labMark === 'right');
  }));
  const fin = document.getElementById('labChallengeFinish');
  if (fin) fin.addEventListener('click', labFinishChallenge);
}
function labChallengeMark(qid, correct) {
  labChallengeMarks[qid] = correct;
  labSubmitChallenge();
}
function labFinishChallenge() {
  const unmarked = labChallengeAttempts.filter(qid => labChallengeMarks[qid] === undefined);
  const done = document.getElementById('labChallengeDone');
  if (unmarked.length) {
    if (done) done.textContent = '还有 ' + unmarked.length + ' 道没打分，先打分再交卷。';
    return;
  }
  const wrong = labChallengeAttempts.filter(qid => labChallengeMarks[qid] === false);
  wrong.forEach(qid => {
    const q = LAB_QUESTIONS.find(x => x.qid === qid);
    recordAttempt(q.primary, false, false);
  });
  labChallengeAttempts.filter(qid => labChallengeMarks[qid] === true).forEach(qid => {
    const q = LAB_QUESTIONS.find(x => x.qid === qid);
    recordAttempt(q.primary, true, true);
  });
  let summary;
  if (!wrong.length) {
    summary = '全对，思路很稳。';
  } else {
    summary = '丢分报告：你卡在 ' + wrong.map(qid => {
      const q = LAB_QUESTIONS.find(x => x.qid === qid);
      const f = findPoint(q.primary);
      return q.primary + ' ' + (f ? f.point.title : '');
    }).join('、') + '——回去把这几条再练一遍。';
  }
  if (done) done.textContent = summary;
  labTrace('挑战交卷：' + summary, !wrong.length);
}
document.getElementById('labModeFree').addEventListener('click', () => labSetMode('free'));
document.getElementById('labModeChallenge').addEventListener('click', () => labSetMode('challenge'));
LAB_QUESTIONS.forEach(q => {
  const btn = document.getElementById('labQ-' + q.qid.slice(2));
  if (btn) btn.addEventListener('click', () => labEnterQuestion(q.qid));
});
document.getElementById('labChallengeSubmit').addEventListener('click', labSubmitChallenge);
document.getElementById('labTraceClear').addEventListener('click', () => {
  labTraceLog.length = 0;
  const ul = document.getElementById('labTraceList');
  if (ul) ul.innerHTML = '';
});
labTrayRender();
labFaRender();
labWbRender();
labLineRender();

/* ================= 互动模拟（PhET 式单概念模拟） ================= */

/* ---- 凑十：把 10 装满 ---- */
const MT_PROBS = [[8, 5], [9, 6], [7, 5], [6, 7], [9, 8]];
let mtIdx = 0, mtGuess = 2, mtGuessed = false, mtMoved = 0, mtStreak = 0, mtUsed = [];
let mtTiers = null;
function mtTarget() { return MT_PROBS[mtIdx]; }
function mkRender() {
  const A = mtTarget()[0], B = mtTarget()[1];
  const box = document.getElementById('mtBox');
  clearChildren(box);
  for (let i = 0; i < 10; i++) {
    const c = document.createElement('button');
    c.type = 'button';
    c.className = 'tf-cell' + (i < A ? ' filled' : (i < A + mtMoved ? ' filled b' : ''));
    c.textContent = i < A + mtMoved ? '●' : '';
    c.dataset.idx = i;
    c.addEventListener('click', function () { mtBoxClick(i); });
    box.appendChild(c);
  }
  const out = document.getElementById('mtOutside');
  clearChildren(out);
  for (let j = 0; j < B; j++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn small' + (mtUsed[j] ? ' ghost' : ' primary');
    b.textContent = '●';
    b.disabled = !!mtUsed[j];
    b.dataset.j = j;
    b.addEventListener('click', function () { mtMove(j); });
    out.appendChild(b);
  }
  document.getElementById('mtLeftTx').textContent = '外面还剩 ' + (B - mtMoved) + ' 个';
  const m = mtMoved;
  document.getElementById('mkEq').textContent = m === 0 ? A + ' + ' + B + ' = ?' :
    (A + mtMoved === 10 ? A + ' + ' + B + ' = ' + A + ' + ' + m + ' + ' + (B - m) + ' = 10 + ' + (B - m) + ' = ' + (A + B) :
      A + ' + ' + B + ' = ' + A + ' + ' + m + ' + ' + (B - m) + '（盒子里 ' + (A + m) + ' 个，还差 ' + (10 - A - m) + ' 个）');
}
function mtBoxClick(i) {
  const A = mtTarget()[0];
  if (i >= A && i < A + mtMoved) {
    mtMoved--;
    const j = mtUsed.indexOf(true);
    if (j >= 0) mtUsed[j] = false;
    mkRender();
    document.getElementById('mkMsg').textContent = '拿回一个，外面又多了 1 个。';
  } else if (i < A) {
    document.getElementById('mkMsg').textContent = '这是盒子里原来的 ' + A + ' 个，拿不出来——要拿的是外面蓝色的。';
  }
}
function mtMove(j) {
  const A = mtTarget()[0], B = mtTarget()[1];
  if (mtUsed[j]) return;
  if (A + mtMoved >= 10) {
    document.getElementById('mkMsg').textContent = '装不下了！盒子只能装 10 个，再放就溢出来了。';
    return;
  }
  mtUsed[j] = true; mtMoved++;
  mkRender();
  if (A + mtMoved === 10) {
    const need = 10 - A;
    const ok = mtGuessed && mtGuess === need;
    document.getElementById('mkMsg').textContent = '盒子满了！' + A + ' + ' + B + ' = 10 + ' + (B - need) + ' = ' + (A + B) +
      (mtGuessed ? (ok ? '你猜要拿 ' + need + ' 个，猜对了！' : '你猜要拿 ' + mtGuess + ' 个，实际拿了 ' + need + ' 个。') : '（先猜要拿几个，再动手，猜得更准。）');
    if (ok) { mtStreak++; if (mtTiers) mtTiers.done(1); } else mtStreak = 0;
    if (mtTiers) mtTiers.done(0);
    if (mtStreak >= 2 && mtTiers) mtTiers.done(2);
    document.getElementById('mtWhy').hidden = false;
    markTried('maketen');
    labTrace('凑十：' + A + '+' + B + ' 拿了 ' + need + ' 个凑满 10', true);
  }
}
function mtNewProblem() {
  mtIdx = (mtIdx + 1) % MT_PROBS.length;
  mtMoved = 0; mtUsed = []; mtGuessed = false;
  mtGuess = 2;
  document.getElementById('mtGuessLabel').textContent = '2 个';
  document.getElementById('mtGuessTx').textContent = mtTarget()[0] + '+' + mtTarget()[1] + '，要从第二个数里拿几个给第一个，才能凑成 10？先猜一个数。';
  document.getElementById('mkMsg').textContent = '先猜要拿几个，再点蓝色的圆点往盒子里送。';
  mkRender();
}
(function () {
  const g = document.getElementById('mtGuessSet'); if (!g) return;
  mtTiers = makeTiers(document.getElementById('mtTiers'), ['基础：装满一次', '提高：猜对要拿几个', '挑战：连续两道都猜对'], 'maketen');
  wireDiscovery('maketen', 'mtFind', 'mtFindSave', 'mtFindSaved');
  document.getElementById('mtGuessMinus').addEventListener('click', function () { mtGuess = Math.max(0, mtGuess - 1); document.getElementById('mtGuessLabel').textContent = mtGuess + ' 个'; });
  document.getElementById('mtGuessPlus').addEventListener('click', function () { mtGuess = Math.min(mtTarget()[1], mtGuess + 1); document.getElementById('mtGuessLabel').textContent = mtGuess + ' 个'; });
  g.addEventListener('click', function () { mtGuessed = true; document.getElementById('mtGuessTx').textContent = '你猜要拿 ' + mtGuess + ' 个。动手吧——点蓝色的圆点往盒子里送。'; });
  document.getElementById('mtNext').addEventListener('click', function () { mtNewProblem(); });
  document.getElementById('mtReset').addEventListener('click', function () { mtMoved = 0; mtUsed = []; mkRender(); document.getElementById('mkMsg').textContent = '重新摆。'; });
  mkRender();
})();

/* ---- 面积模型乘法 ---- */
let amA = 8, amB = 15, amA1 = 5, amB1 = 10, amGuess = null, amPartsOn = false, amChal = false, amRevealed = false;
let amTiers = null;
function amCell() { return Math.floor(300 / Math.max(amA, amB)); }
function amDraw() {
  const svg = document.getElementById('amSvg');
  const cell = amCell(), W = amA * cell, H = amB * cell;
  const a2 = amA - amA1, b2 = amB - amB1;
  let s = '<rect x="20" y="20" width="' + W + '" height="' + H + '" fill="#fff7ed" stroke="#ea580c" stroke-width="2"/>';
  for (let i = 1; i < amA; i++) s += '<line x1="' + (20 + i * cell) + '" y1="20" x2="' + (20 + i * cell) + '" y2="' + (20 + H) + '" stroke="#fdba74" stroke-width="1"/>';
  for (let j = 1; j < amB; j++) s += '<line x1="20" y1="' + (20 + j * cell) + '" x2="' + (20 + W) + '" y2="' + (20 + j * cell) + '" stroke="#fdba74" stroke-width="1"/>';
  if (amPartsOn) {
    const cols = ['#fde68a', '#bfdbfe', '#bbf7d0', '#fecaca'];
    const parts = [[0, 0, amA1, amB1], [amA1, 0, a2, amB1], [0, amB1, amA1, b2], [amA1, amB1, a2, b2]];
    for (let k = 0; k < 4; k++) {
      const p = parts[k];
      s += '<rect x="' + (20 + p[0] * cell) + '" y="' + (20 + p[1] * cell) + '" width="' + (p[2] * cell) + '" height="' + (p[3] * cell) + '" fill="' + cols[k] + '" fill-opacity="0.65"/>';
    }
    s += '<line x1="' + (20 + amA1 * cell) + '" y1="20" x2="' + (20 + amA1 * cell) + '" y2="' + (20 + H) + '" stroke="#b45309" stroke-width="2"/>';
    s += '<line x1="20" y1="' + (20 + amB1 * cell) + '" x2="' + (20 + W) + '" y2="' + (20 + amB1 * cell) + '" stroke="#b45309" stroke-width="2"/>';
    for (let k = 0; k < 4; k++) {
      const p = parts[k];
      const cx = 20 + (p[0] + p[2] / 2) * cell, cy = 20 + (p[1] + p[3] / 2) * cell;
      const pw = [amA1, a2][k % 2], ph = [amB1, b2][Math.floor(k / 2)];
      s += '<text x="' + cx + '" y="' + cy + '" text-anchor="middle" font-size="13" fill="#7c2d12">' + (pw * ph) + '</text>';
    }
  }
  s += '<text x="20" y="14" font-size="12" fill="#57534e">长 ' + amA + '</text><text x="12" y="' + (20 + H / 2) + '" font-size="12" fill="#57534e" transform="rotate(-90 12 ' + (20 + H / 2) + ')">宽 ' + amB + '</text>';
  svg.innerHTML = s;
  document.getElementById('amALabel').textContent = amA;
  document.getElementById('amBLabel').textContent = amChal ? '?' : amB;
  document.getElementById('amA1Label').textContent = amA1;
  document.getElementById('amB1Label').textContent = amB1;
  if (amChal) {
    document.getElementById('amProd').textContent = '面积是 ' + (amA * amB) + '，目标是 120。宽是几？';
  } else if (amRevealed) {
    document.getElementById('amProd').textContent = amA + ' × ' + amB + ' = ' + (amA * amB);
  } else {
    document.getElementById('amProd').textContent = amA + ' × ' + amB + ' = ?';
  }
  if (amPartsOn) {
    const p1 = amA1 * amB1, p2 = a2 * amB1, p3 = amA1 * b2, p4 = a2 * b2;
    document.getElementById('amPartsOut').textContent = amA + '×' + amB + ' = (' + amA1 + '+' + a2 + ')×(' + amB1 + '+' + b2 + ') = ' + amA1 + '×' + amB1 + ' + ' + a2 + '×' + amB1 + ' + ' + amA1 + '×' + b2 + ' + ' + a2 + '×' + b2 + ' = ' + p1 + '+' + p2 + '+' + p3 + '+' + p4 + ' = ' + (amA * amB);
  } else {
    document.getElementById('amPartsOut').textContent = '';
  }
}
function amSetA(v) { amA = Math.max(2, Math.min(12, v)); amA1 = Math.max(1, Math.min(amA - 1, amA1)); amRevealed = false; amDraw(); }
function amSetB(v) {
  amB = Math.max(2, Math.min(15, v)); amB1 = Math.max(1, Math.min(amB - 1, amB1)); amRevealed = false; amDraw();
  if (amChal && amA * amB === 120) {
    document.getElementById('amuMsg').textContent = '找到了！宽是 15。8×15=120，面积正好 120。';
    if (amTiers) amTiers.done(2);
    document.getElementById('amWhy').hidden = false;
    markTried('areamul');
    labTrace('面积模型：反过来找到了宽 15', true);
  }
}
function amCalc() {
  const prod = amA * amB;
  if (amChal) {
    // 挑战模式：宽藏着，不能把“8 × 15”直接亮出来；只报面积，让学生自己调宽。
    // 面积本来就写在图上，不算剧透；基础档两种模式都要打勾（真机复测：挑战模式不打勾）。
    if (prod === 120) {
      document.getElementById('amProd').textContent = '面积是 120，目标达到了！';
      document.getElementById('amuMsg').textContent = '面积正好是 120，宽就是 ' + amB + '。8×' + amB + '=120。';
      if (amTiers) amTiers.done(2);
    } else if (prod < 120) {
      document.getElementById('amProd').textContent = '面积是 ' + prod + '，目标是 120。宽是几？';
      document.getElementById('amuMsg').textContent = '现在面积是 ' + prod + '，还差 ' + (120 - prod) + ' 才到 120——宽再调一调。';
    } else {
      document.getElementById('amProd').textContent = '面积是 ' + prod + '，目标是 120。宽是几？';
      document.getElementById('amuMsg').textContent = '现在面积是 ' + prod + '，超过 120 了 ' + (prod - 120) + '——宽调小一点。';
    }
  } else {
    amRevealed = true;
    document.getElementById('amProd').textContent = amA + ' × ' + amB + ' = ' + prod;
    if (amGuess !== null) {
      document.getElementById('amuMsg').textContent = amGuess === prod ? '你猜 ' + amGuess + '，猜对了！长方形里的方块数就是积。' : '你猜 ' + amGuess + '，实际是 ' + prod + '——' + (amGuess < prod ? '少猜了 ' + (prod - amGuess) : '多猜了 ' + (amGuess - prod)) + '。数一数长方形里的方块，就知道了。';
    } else {
      document.getElementById('amuMsg').textContent = '一共 ' + prod + ' 个小方块。下次先猜一个再数。';
    }
  }
  if (amTiers) amTiers.done(0);
  markTried('areamul');
  labTrace('面积模型：' + amA + '×' + amB + ' = ' + prod, true);
}
(function () {
  const g = document.getElementById('amGuessSet'); if (!g) return;
  amTiers = makeTiers(document.getElementById('amTiers'), ['基础：数出一个积', '提高：看懂分步乘积', '挑战：反过来找到宽'], 'areamul');
  wireDiscovery('areamul', 'amFind', 'amFindSave', 'amFindSaved');
  g.addEventListener('click', function () {
    const v = parseInt(document.getElementById('amGuess').value, 10);
    if (isNaN(v)) { document.getElementById('amGuessTx').textContent = '先写个数字再猜。'; return; }
    amGuess = v;
    document.getElementById('amGuessTx').textContent = '你猜积是 ' + v + '。调一调长方形，再点“数一数”。';
  });
  document.getElementById('amAMinus').addEventListener('click', function () { amSetA(amA - 1); });
  document.getElementById('amAPlus').addEventListener('click', function () { amSetA(amA + 1); });
  document.getElementById('amBMinus').addEventListener('click', function () { amSetB(amB - 1); });
  document.getElementById('amBPlus').addEventListener('click', function () { amSetB(amB + 1); });
  document.getElementById('amA1Minus').addEventListener('click', function () { amA1 = Math.max(1, amA1 - 1); amDraw(); });
  document.getElementById('amA1Plus').addEventListener('click', function () { amA1 = Math.min(amA - 1, amA1 + 1); amDraw(); });
  document.getElementById('amB1Minus').addEventListener('click', function () { amB1 = Math.max(1, amB1 - 1); amDraw(); });
  document.getElementById('amB1Plus').addEventListener('click', function () { amB1 = Math.min(amB - 1, amB1 + 1); amDraw(); });
  document.getElementById('amParts').addEventListener('click', function () {
    amPartsOn = !amPartsOn; amDraw();
    if (amPartsOn) {
      if (amTiers) amTiers.done(1);
      document.getElementById('amWhy').hidden = false;
      document.getElementById('amuMsg').textContent = '四块加起来就是总数：分着算，加起来，和直接数是一样的。';
    }
  });
  document.getElementById('amCalc').addEventListener('click', function () { amCalc(); });
  document.getElementById('amChallenge').addEventListener('click', function () {
    amChal = !amChal;
    if (amChal) {
      amA = 8; amB = 10; amA1 = 5; amB1 = 5; amPartsOn = false;
      document.getElementById('amProd').textContent = '面积是 80，目标是 120。宽是几？';
      document.getElementById('amuMsg').textContent = '宽藏起来了（显示“?”）。调宽的按钮，看面积变到 120 时宽是几。';
    } else {
      amB = 15; amRevealed = false;
      document.getElementById('amProd').textContent = '8 × 15 = ?';
      document.getElementById('amuMsg').textContent = '回到自由玩。';
    }
    amDraw();
  });
  amDraw();
})();

/* ---- 分数相等 ---- */
const FE_TASKS = [{ n: 1, d: 2, need: 4 }, { n: 2, d: 3, need: 6 }, { n: 3, d: 4, need: 12 }];
let feIdx = 0, feN = 1, feD = 2, feGuess = 2, feGuessed = false, feFound = [];
let feTiers = null;
function feTask() { return FE_TASKS[feIdx]; }
function feFracDiff(n1, d1, n2, d2) {
  const num = Math.abs(n1 * d2 - n2 * d1), den = d1 * d2, g = gcd(num, den) || 1;
  return { text: (num / g) + '/' + (den / g), more: n1 * d2 > n2 * d1 };
}
function feDraw() {
  const t = feTask();
  document.getElementById('feNLabel').textContent = feN;
  document.getElementById('feDLabel').textContent = feD;
  document.getElementById('feText').textContent = feN + '/' + feD;
  document.getElementById('feTarget').textContent = '目标：' + t.n + '/' + t.d + '（切成 ' + t.need + ' 份来找）';
  document.getElementById('feGuessTx').textContent = '目标是 ' + t.n + '/' + t.d + '。把它切成 ' + t.need + ' 份，分子要变成几，阴影才一样多？先猜。';
  document.getElementById('feGuessLabel').textContent = feGuess;
  let s = '<circle cx="100" cy="100" r="88" fill="#fff" stroke="#78716c" stroke-width="2"/>';
  for (let i = 0; i < feN; i++) s += '<path d="' + sector(100, 100, 88, -90 + i * 360 / feD, -90 + (i + 1) * 360 / feD) + '" fill="#f97316"/>';
  for (let i = 1; i < feD; i++) { const a = -90 + i * 360 / feD, p = polar(100, 100, 88, a); s += '<line x1="100" y1="100" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '" stroke="#78716c" stroke-width="1"/>'; }
  document.getElementById('fePie').innerHTML = s;
  let b = '';
  const rows = [[t.n, t.d, 8, '目标'], [feN, feD, 36, '我的']];
  rows.forEach(function (r) {
    b += '<text x="4" y="' + (r[2] + 14) + '" font-size="12" fill="#57534e">' + r[3] + '</text>';
    for (let i = 0; i < r[1]; i++) {
      b += '<rect x="' + (44 + i * 260 / r[1]) + '" y="' + r[2] + '" width="' + (260 / r[1]) + '" height="20" fill="' + (i < r[0] ? '#f97316' : '#fff') + '" stroke="#78716c" stroke-width="1"/>';
    }
  });
  document.getElementById('feBar').innerHTML = b;
  let l = '<line x1="20" y1="40" x2="300" y2="40" stroke="#78716c" stroke-width="2"/>';
  for (let i = 0; i <= 4; i++) { const x = 20 + i * 70; l += '<line x1="' + x + '" y1="34" x2="' + x + '" y2="46" stroke="#78716c" stroke-width="1"/><text x="' + x + '" y="60" font-size="11" text-anchor="middle" fill="#57534e">' + (i / 4) + '</text>'; }
  const tx = 20 + (t.n / t.d) * 280, mx = 20 + (feN / feD) * 280;
  l += '<line x1="' + tx + '" y1="28" x2="' + tx + '" y2="52" stroke="#16a34a" stroke-width="2" stroke-dasharray="4 2"/>';
  l += '<circle cx="' + mx + '" cy="40" r="6" fill="#f97316" stroke="#7c2d12" stroke-width="1"/>';
  document.getElementById('feLine').innerHTML = l;
}
function feCompare() {
  const t = feTask();
  const equal = feN * t.d === t.n * feD;
  const key = feN + '/' + feD;
  if (equal && feD === t.need) {
    const ok = feGuessed && feGuess === feN;
    document.getElementById('feMsg').textContent = '一样大！' + t.n + '/' + t.d + ' = ' + feN + '/' + feD + '。' + (feGuessed ? (ok ? '你猜分子是 ' + feN + '，猜对了！' : '你猜分子是 ' + feGuess + '，实际是 ' + feN + '。') : '');
    if (feFound.indexOf(key) < 0) feFound.push(key);
    document.getElementById('feFound').textContent = '已经找到的相等分数：' + feFound.join('、');
    if (feTiers) feTiers.done(0);
    if (ok && feTiers) feTiers.done(1);
    if (feFound.length >= 3 && feTiers) feTiers.done(2);
    document.getElementById('feWhy').hidden = false;
    markTried('fraceq');
    labTrace('分数相等：找到了 ' + t.n + '/' + t.d + ' = ' + key, true);
  } else if (equal) {
    document.getElementById('feMsg').textContent = '量是一样大（' + feN + '/' + feD + ' = ' + t.n + '/' + t.d + '），但分母不是 ' + t.need + '——题目要的是切成 ' + t.need + ' 份的那个。';
  } else {
    const diff = feFracDiff(feN, feD, t.n, t.d);
    document.getElementById('feMsg').textContent = '阴影不一样多：你的 ' + feN + '/' + feD + ' 比目标 ' + t.n + '/' + t.d + (diff.more ? ' 多了 ' : ' 少了 ') + diff.text + '——只改分母，大小就变了。看上面的两条长条，阴影的长度不一样。';
  }
}
function feNextTask() {
  feIdx = (feIdx + 1) % FE_TASKS.length;
  const t = feTask();
  feN = t.n; feD = t.d; feGuessed = false; feGuess = Math.floor(t.need / 2);
  document.getElementById('feMsg').textContent = '新目标：' + t.n + '/' + t.d + '，切成 ' + t.need + ' 份来找。';
  feDraw();
}
(function () {
  const g = document.getElementById('feGuessSet'); if (!g) return;
  feTiers = makeTiers(document.getElementById('feTiers'), ['基础：找到一个相等分数', '提高：猜对分子', '挑战：三个目标都找到'], 'fraceq');
  wireDiscovery('fraceq', 'feFind', 'feFindSave', 'feFindSaved');
  document.getElementById('feGuessMinus').addEventListener('click', function () { feGuess = Math.max(0, feGuess - 1); feDraw(); });
  document.getElementById('feGuessPlus').addEventListener('click', function () { feGuess = Math.min(feTask().need, feGuess + 1); feDraw(); });
  g.addEventListener('click', function () { feGuessed = true; document.getElementById('feGuessTx').textContent = '你猜切成 ' + feTask().need + ' 份时，分子是 ' + feGuess + '。动手调一调，再点“比一比”。'; });
  document.getElementById('feNMinus').addEventListener('click', function () { feN = Math.max(0, feN - 1); feDraw(); });
  document.getElementById('feNPlus').addEventListener('click', function () { feN = Math.min(feD, feN + 1); feDraw(); });
  document.getElementById('feDMinus').addEventListener('click', function () { feD = Math.max(2, feD - 1); feN = Math.min(feN, feD); feDraw(); });
  document.getElementById('feDPlus').addEventListener('click', function () { feD = Math.min(12, feD + 1); feDraw(); });
  document.getElementById('feCompare').addEventListener('click', function () { feCompare(); });
  document.getElementById('feNext').addEventListener('click', function () { feNextTask(); });
  feDraw();
})();

/* ---- 造分数 ---- */
const BF_TASKS = [{ n: 3, d: 4, need: 4 }, { n: 5, d: 6, need: 12 }, { n: 2, d: 3, need: 9 }];
let bfIdx = 0, bfD = 4, bfShaded = [], bfGuess = 2, bfGuessed = false, bfDoneIdx = [];
let bfTiers = null;
function bfTask() { return BF_TASKS[bfIdx]; }
function bfRender() {
  const t = bfTask();
  document.getElementById('bfDLabel').textContent = bfD;
  document.getElementById('bfTargetTx').textContent = t.n + '/' + t.d + '（先试试切成 ' + t.need + ' 份来造）';
  document.getElementById('bfGuessTx').textContent = '目标 ' + t.n + '/' + t.d + '。切成 ' + t.need + ' 份的话，要涂几份？先猜。';
  document.getElementById('bfGuessLabel').textContent = bfGuess + ' 份';
  let tb = '';
  for (let i = 0; i < t.d; i++) tb += '<rect x="' + (10 + i * 300 / t.d) + '" y="10" width="' + (300 / t.d) + '" height="26" fill="' + (i < t.n ? '#16a34a' : '#fff') + '" stroke="#78716c" stroke-width="1"/>';
  tb += '<text x="10" y="48" font-size="12" fill="#57534e">目标 ' + t.n + '/' + t.d + '</text>';
  document.getElementById('bfTargetBar').innerHTML = tb;
  const box = document.getElementById('bfPieces');
  clearChildren(box);
  for (let i = 0; i < bfD; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'bf-piece' + (bfShaded[i] ? ' filled' : '');
    b.textContent = bfShaded[i] ? '■' : '□';
    b.dataset.i = i;
    b.addEventListener('click', function () { bfShaded[i] = !bfShaded[i]; bfRender(); });
    box.appendChild(b);
  }
  const n = bfShaded.filter(Boolean).length;
  document.getElementById('bfBuiltTx').textContent = '你涂了：' + n + '/' + bfD;
}
function bfCheck() {
  const t = bfTask();
  const n = bfShaded.filter(Boolean).length;
  // 按值接受：量对了就算对（和分数挑战模式一致）。“切成 N 份”只是基础档的提示，
  // 不是拒绝理由——6/8 和 3/4 是一样大的量。
  const equal = n * t.d === t.n * bfD;
  if (equal) {
    // 猜的是“切成 need 份时涂几份”，只有按 need 切的时候猜的数才对得上。
    const sameCut = bfD === t.need;
    const ok = sameCut && bfGuessed && bfGuess === n;
    let msg = '造对了！' + n + '/' + bfD + ' = ' + t.n + '/' + t.d + '。';
    if (sameCut) {
      msg += bfGuessed ? (ok ? '你猜要涂 ' + n + ' 份，猜对了！' : '你猜要涂 ' + bfGuess + ' 份，实际是 ' + n + ' 份。') : '';
    } else {
      msg += '题目建议切成 ' + t.need + ' 份，你切成了 ' + bfD + ' 份——一样大，照样算对。';
    }
    document.getElementById('bfMsg').textContent = msg;
    if (bfDoneIdx.indexOf(bfIdx) < 0) bfDoneIdx.push(bfIdx);
    if (bfTiers) bfTiers.done(0);
    if (ok && bfTiers) bfTiers.done(1);
    if (bfDoneIdx.length >= 3 && bfTiers) bfTiers.done(2);
    document.getElementById('bfWhy').hidden = false;
    markTried('buildfrac');
    labTrace('造分数：造出了 ' + t.n + '/' + t.d + ' = ' + n + '/' + bfD, true);
  } else {
    const diff = feFracDiff(n, bfD, t.n, t.d);
    document.getElementById('bfMsg').textContent = '还不对：你涂了 ' + n + '/' + bfD + '，目标是 ' + t.n + '/' + t.d + '——阴影' + (diff.more ? '多了 ' : '少了 ') + diff.text + '。看上面的目标条，再调一调。';
  }
}
function bfNextTask() {
  bfIdx = (bfIdx + 1) % BF_TASKS.length;
  const t = bfTask();
  bfD = t.d; bfShaded = []; bfGuessed = false; bfGuess = Math.floor(t.need / 2);
  document.getElementById('bfMsg').textContent = '新目标：' + t.n + '/' + t.d + '，先试试切成 ' + t.need + ' 份来造。';
  bfRender();
}
(function () {
  const g = document.getElementById('bfGuessSet'); if (!g) return;
  bfTiers = makeTiers(document.getElementById('bfTiers'), ['基础：造出一个目标分数', '提高：猜对要涂几份', '挑战：三个目标都造出来'], 'buildfrac');
  wireDiscovery('buildfrac', 'bfFind', 'bfFindSave', 'bfFindSaved');
  document.getElementById('bfGuessMinus').addEventListener('click', function () { bfGuess = Math.max(0, bfGuess - 1); bfRender(); });
  document.getElementById('bfGuessPlus').addEventListener('click', function () { bfGuess = Math.min(bfTask().need, bfGuess + 1); bfRender(); });
  g.addEventListener('click', function () { bfGuessed = true; document.getElementById('bfGuessTx').textContent = '你猜切成 ' + bfTask().need + ' 份时，要涂 ' + bfGuess + ' 份。动手涂一涂，再点“检查”。'; });
  document.getElementById('bfDMinus').addEventListener('click', function () { bfD = Math.max(2, bfD - 1); bfShaded = []; bfRender(); });
  document.getElementById('bfDPlus').addEventListener('click', function () { bfD = Math.min(12, bfD + 1); bfShaded = []; bfRender(); });
  document.getElementById('bfCheck').addEventListener('click', function () { bfCheck(); });
  document.getElementById('bfNext').addEventListener('click', function () { bfNextTask(); });
  bfRender();
})();


/* ---- 面积建造者 ---- */
const AB_TASKS = [{ area: 12, per: 14 }, { area: 12, per: 16 }, { area: 12, per: 18 }];
let abIdx = 0, abCells = [], abPred = null, abDoneIdx = [];
let abTiers = null;
function abRead() {
  const n = abCells.filter(Boolean).length;
  let shared = 0;
  for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) {
    if (!abCells[r * 6 + c]) continue;
    if (c < 5 && abCells[r * 6 + c + 1]) shared++;
    if (r < 5 && abCells[(r + 1) * 6 + c]) shared++;
  }
  return { n: n, per: 4 * n - 2 * shared };
}
function abRender() {
  const box = document.getElementById('abGrid');
  clearChildren(box);
  for (let i = 0; i < 36; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ab-cell' + (abCells[i] ? ' filled' : '');
    b.textContent = abCells[i] ? '■' : '';
    b.dataset.i = i;
    b.addEventListener('click', function () { abCells[i] = !abCells[i]; abRender(); });
    box.appendChild(b);
  }
  const r = abRead();
  document.getElementById('abRead').textContent = '面积 ' + r.n + ' · 周长 ' + r.per;
  const t = AB_TASKS[abIdx];
  document.getElementById('abTaskTx').textContent = '造一个面积 ' + t.area + '、周长 ' + t.per + ' 的图形';
}
function abCheck() {
  const t = AB_TASKS[abIdx];
  const r = abRead();
  if (r.n === t.area && r.per === t.per) {
    document.getElementById('abMsg').textContent = '造出来了！面积 ' + r.n + '，周长 ' + r.per + '。';
    if (abDoneIdx.indexOf(abIdx) < 0) abDoneIdx.push(abIdx);
    if (abTiers) abTiers.done(0);
    if (abDoneIdx.indexOf(0) >= 0 && abDoneIdx.indexOf(1) >= 0 && abTiers) {
      abTiers.done(1);
      document.getElementById('abPredTx').textContent = abPred === 'no' ? '你猜“不一定”，猜对了——面积都是 12，周长可以是 14 也可以是 16。' : '你猜“一定是 14”，猜错了——面积都是 12，周长可以是 14 也可以是 16。同样 12 格，排得越散周长越大。';
      document.getElementById('abWhy').hidden = false;
    }
    if (abDoneIdx.length >= 3 && abTiers) abTiers.done(2);
    markTried('areabuild');
    labTrace('面积建造者：造出了面积 12、周长 ' + t.per, true);
  } else if (r.n === t.area) {
    document.getElementById('abMsg').textContent = '面积对了（' + r.n + '），周长是 ' + r.per + ' 不是 ' + t.per + '——这个图形太' + (r.per > t.per ? '散' : '紧凑') + '了，' + (r.per > t.per ? '排紧凑一点（长方形最紧凑）' : '拉长一点、排松一点') + '。';
  } else {
    document.getElementById('abMsg').textContent = '面积是 ' + r.n + '，不是 ' + t.area + '——再' + (r.n < t.area ? '加' : '减') + '几个格子。';
  }
}
function abSetCells(list) { abCells = []; for (let i = 0; i < 36; i++) abCells.push(false); list.forEach(function (i) { abCells[i] = true; }); abRender(); }
(function () {
  const g = document.getElementById('abCheck'); if (!g) return;
  abTiers = makeTiers(document.getElementById('abTiers'), ['基础：造出一个面积 12 的图形', '提高：同样面积造出两种周长', '挑战：面积 12、周长 18 也造出来'], 'areabuild');
  wireDiscovery('areabuild', 'abFind', 'abFindSave', 'abFindSaved');
  document.getElementById('abPredYes').addEventListener('click', function () { abPred = 'yes'; document.getElementById('abPredTx').textContent = '你猜“一定是 14”。动手造一造，看能不能造出周长不是 14 的。'; });
  document.getElementById('abPredNo').addEventListener('click', function () { abPred = 'no'; document.getElementById('abPredTx').textContent = '你猜“不一定”。动手造一造：面积 12 的图形，周长能不能不是 14？'; });
  g.addEventListener('click', function () { abCheck(); });
  document.getElementById('abClear').addEventListener('click', function () { abCells = []; abRender(); document.getElementById('abMsg').textContent = '清空了，重新造。'; });
  document.getElementById('abNext').addEventListener('click', function () { abIdx = (abIdx + 1) % AB_TASKS.length; abCells = []; abRender(); document.getElementById('abMsg').textContent = '新任务：面积 12，周长 ' + AB_TASKS[abIdx].per + '。'; });
  abRender();
})();

/* ---- 四边形变形 ---- */
const QM_TYPES = ['长方形', '平行四边形', '菱形', '正方形', '梯形'];
const QM_SHAPES = {
  '长方形': [[40, 60], [160, 60], [160, 140], [40, 140]],
  '平行四边形': [[60, 60], [160, 60], [140, 140], [40, 140]],
  '菱形': [[100, 40], [170, 100], [100, 160], [30, 100]],
  '正方形': [[60, 60], [140, 60], [140, 140], [60, 140]],
  '梯形': [[40, 140], [160, 140], [130, 60], [70, 60]]
};
let qmType = '长方形', qmPts = QM_SHAPES['长方形'].map(function (p) { return [p[0], p[1]]; });
let qmSel = 0, qmPred = null, qmPredChecked = false, qmDrag = -1, qmMoved = false;
let qmTiers = null;
function qmVec(a, b) { return [b[0] - a[0], b[1] - a[1]]; }
function qmLen(v) { return Math.sqrt(v[0] * v[0] + v[1] * v[1]); }
function qmParallel(u, v) { return Math.abs(u[0] * v[1] - u[1] * v[0]) / (qmLen(u) * qmLen(v) || 1) < 0.08; }
function qmRight(a, b, c) {
  const u = qmVec(b, a), v = qmVec(b, c);
  return Math.abs(u[0] * v[0] + u[1] * v[1]) / (qmLen(u) * qmLen(v) || 1) < 0.07;
}
function qmEq(x, y) { return Math.abs(x - y) < 3; }
function qmSides() {
  const P = qmPts;
  return [qmLen(qmVec(P[0], P[1])), qmLen(qmVec(P[1], P[2])), qmLen(qmVec(P[2], P[3])), qmLen(qmVec(P[3], P[0]))];
}
function qmPars() {
  const P = qmPts;
  return [qmParallel(qmVec(P[0], P[1]), qmVec(P[3], P[2])), qmParallel(qmVec(P[1], P[2]), qmVec(P[0], P[3]))];
}
function qmAllRight() {
  const P = qmPts;
  return qmRight(P[3], P[0], P[1]) && qmRight(P[0], P[1], P[2]) && qmRight(P[1], P[2], P[3]) && qmRight(P[2], P[3], P[0]);
}
function qmClassify() {
  const s = qmSides(), par = qmPars();
  const allRight = qmAllRight();
  const allEq = qmEq(s[0], s[1]) && qmEq(s[1], s[2]) && qmEq(s[2], s[3]);
  const oppEq = qmEq(s[0], s[2]) && qmEq(s[1], s[3]);
  if (allEq && allRight) return '正方形';
  if (allRight && oppEq) return '长方形';
  if (allEq && par[0] && par[1]) return '菱形';
  if (par[0] && par[1]) return '平行四边形';
  if (par[0] !== par[1]) return '梯形';
  return '一般四边形';
}
function qmPropsFor(type) {
  const s = qmSides(), par = qmPars();
  const allRight = qmAllRight();
  const allEq = qmEq(s[0], s[1]) && qmEq(s[1], s[2]) && qmEq(s[2], s[3]);
  const oppEq = qmEq(s[0], s[2]) && qmEq(s[1], s[3]);
  if (type === '长方形') return [['四个角都是直角', allRight], ['对边相等', oppEq]];
  if (type === '平行四边形') return [['两组对边分别平行', par[0] && par[1]], ['对边相等', oppEq]];
  if (type === '菱形') return [['四条边都相等', allEq], ['对边平行', par[0] && par[1]]];
  if (type === '正方形') return [['四条边都相等', allEq], ['四个角都是直角', allRight]];
  return [['一组对边平行', par[0] || par[1]], ['另一组对边不平行', !(par[0] && par[1])]];
}
function qmRender() {
  const svg = document.getElementById('qmSvg');
  const P = qmPts;
  const pts = P.map(function (p) { return p[0] + ',' + p[1]; }).join(' ');
  let s = '<polygon points="' + pts + '" fill="#fff7ed" stroke="#ea580c" stroke-width="2"/>';
  const names = ['A', 'B', 'C', 'D'];
  for (let i = 0; i < 4; i++) {
    s += '<circle cx="' + P[i][0] + '" cy="' + P[i][1] + '" r="9" fill="' + (i === qmSel ? '#ea580c' : '#fff') + '" stroke="#7c2d12" stroke-width="2" data-qmv="' + i + '"/>';
    s += '<text x="' + (P[i][0] + 12) + '" y="' + (P[i][1] - 10) + '" font-size="13" fill="#57534e">' + names[i] + '</text>';
  }
  svg.innerHTML = s;
  const now = qmClassify();
  document.getElementById('qmNow').textContent = '目标：' + qmType + '；现在是：' + now;
  const props = qmPropsFor(qmType);
  document.getElementById('qmProps').textContent = qmType + '的规矩：' + props.map(function (p) { return (p[1] ? '✓ ' : '✗ ') + p[0]; }).join('；');
  const seg = document.getElementById('qmTypeSeg');
  clearChildren(seg);
  QM_TYPES.forEach(function (t) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn small' + (t === qmType ? ' primary' : ' ghost');
    b.textContent = t;
    b.addEventListener('click', function () { qmSetType(t); });
    seg.appendChild(b);
  });
}
function qmAfterMove() {
  qmMoved = true;
  const now = qmClassify();
  let said = false;
  if (qmType === '长方形' && !qmPredChecked && now !== '长方形') {
    qmPredChecked = true;
    document.getElementById('qmMsg').textContent = qmPred === 'no' ? '你猜“不是了”，猜对了——拖完这个角不是直角了，所以它不再是长方形。' : qmPred === 'yes' ? '你猜“还是长方形”，猜错了——拖完这个角不是直角了，所以它不再是长方形。' : '拖完这个角不是直角了，所以它不再是长方形。先猜一个再拖，下次能猜对吗？';
    if (qmTiers) qmTiers.done(0);
    document.getElementById('qmWhy').hidden = false;
    said = true;
  }
  if (now === '正方形' && qmTiers) { qmTiers.done(1); if (!said) { document.getElementById('qmMsg').textContent = '是正方形了！四条边相等，四个角都是直角。'; said = true; } }
  if (now === '梯形' && qmTiers) { qmTiers.done(2); if (!said) document.getElementById('qmMsg').textContent = '是梯形了！只有一组对边平行。'; }
  markTried('quadmorph');
  qmRender();
}
function qmNudge(dx, dy) {
  const p = qmPts[qmSel];
  p[0] = Math.max(10, Math.min(190, Math.round((p[0] + dx) / 10) * 10));
  p[1] = Math.max(10, Math.min(190, Math.round((p[1] + dy) / 10) * 10));
  qmAfterMove();
}
function qmSetType(t) {
  qmType = t;
  qmPts = QM_SHAPES[t].map(function (p) { return [p[0], p[1]]; });
  qmPredChecked = false; qmMoved = false;
  qmRender();
  // 选目标时形状直接重置成目标图形：已经是正方形/梯形了，就该打勾，
  // 不能等学生再拖一下才认（真机复测：选“正方形”后 提高 ✓ 不亮）。
  const now = qmClassify();
  if (now === '正方形' && qmTiers) {
    qmTiers.done(1);
    document.getElementById('qmMsg').textContent = '目标换成正方形了——它已经是正方形：四条边相等，四个角都是直角。';
  } else if (now === '梯形' && qmTiers) {
    qmTiers.done(2);
    document.getElementById('qmMsg').textContent = '目标换成梯形了——它已经是梯形：只有一组对边平行。';
  } else {
    document.getElementById('qmMsg').textContent = '目标换成' + t + '了。拖顶点，看看什么时候是' + t + '、什么时候不是。';
  }
}
(function () {
  const g = document.getElementById('qmPredYes'); if (!g) return;
  qmTiers = makeTiers(document.getElementById('qmTiers'), ['基础：把长方形拖成不是长方形', '提高：拼出一个正方形', '挑战：拼出一个梯形'], 'quadmorph');
  wireDiscovery('quadmorph', 'qmFind', 'qmFindSave', 'qmFindSaved');
  g.addEventListener('click', function () { qmPred = 'yes'; document.getElementById('qmPredTx').textContent = '你猜“还是长方形”。动手拖一个顶点验证。'; });
  document.getElementById('qmPredNo').addEventListener('click', function () { qmPred = 'no'; document.getElementById('qmPredTx').textContent = '你猜“不是了”。动手拖一个顶点验证。'; });
  document.getElementById('qmV0').addEventListener('click', function () { qmSel = 0; qmRender(); });
  document.getElementById('qmV1').addEventListener('click', function () { qmSel = 1; qmRender(); });
  document.getElementById('qmV2').addEventListener('click', function () { qmSel = 2; qmRender(); });
  document.getElementById('qmV3').addEventListener('click', function () { qmSel = 3; qmRender(); });
  document.getElementById('qmLeft').addEventListener('click', function () { qmNudge(-10, 0); });
  document.getElementById('qmRight').addEventListener('click', function () { qmNudge(10, 0); });
  document.getElementById('qmUp').addEventListener('click', function () { qmNudge(0, -10); });
  document.getElementById('qmDown').addEventListener('click', function () { qmNudge(0, 10); });
  const svg = document.getElementById('qmSvg');
  svg.addEventListener('pointerdown', function (e) {
    const v = e.target && e.target.dataset ? e.target.dataset.qmv : null;
    if (v === undefined || v === null) return;
    qmDrag = parseInt(v, 10); qmSel = qmDrag;
    if (svg.setPointerCapture && e.pointerId !== undefined) { try { svg.setPointerCapture(e.pointerId); } catch (err) {} }
  });
  svg.addEventListener('pointermove', function (e) {
    if (qmDrag < 0) return;
    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 200;
    const y = (e.clientY - rect.top) / rect.height * 200;
    qmPts[qmDrag][0] = Math.max(10, Math.min(190, Math.round(x / 10) * 10));
    qmPts[qmDrag][1] = Math.max(10, Math.min(190, Math.round(y / 10) * 10));
    qmRender();
  });
  svg.addEventListener('pointerup', function () { if (qmDrag >= 0) { qmDrag = -1; qmAfterMove(); } });
  qmRender();
})();

/* ---- 数一数：一个数，五种样子 ---- */
const NP_WORDS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十'];
let npN = 7, npGuess = 7, npGuessed = false, npCovered = true;
let npTiers = null;
function npRender() {
  document.getElementById('npNum').textContent = npCovered ? '？' : '' + npN;
  document.getElementById('npWords').textContent = npCovered ? '？' : NP_WORDS[npN];
  let dots = '';
  for (let i = 0; i < npN; i++) dots += '●';
  document.getElementById('npDots').textContent = dots || '（0 个）';
  [['npFrameA', 0], ['npFrameB', 10]].forEach(function (f) {
    const box = document.getElementById(f[0]);
    clearChildren(box);
    for (let i = 0; i < 10; i++) {
      const c = document.createElement('span');
      c.className = 'tf-cell' + (npN > f[1] + i ? ' filled' : '');
      c.textContent = npN > f[1] + i ? '●' : '';
      box.appendChild(c);
    }
  });
  let l = '<line x1="10" y1="40" x2="310" y2="40" stroke="#78716c" stroke-width="2"/>';
  for (let i = 0; i <= 20; i += 5) { const x = 10 + i * 15; l += '<line x1="' + x + '" y1="34" x2="' + x + '" y2="46" stroke="#78716c" stroke-width="1"/><text x="' + x + '" y="60" font-size="11" text-anchor="middle" fill="#57534e">' + i + '</text>'; }
  const mx = 10 + npN * 15;
  l += '<circle cx="' + mx + '" cy="40" r="7" fill="#f97316" stroke="#7c2d12" stroke-width="1"/>';
  document.getElementById('npLine').innerHTML = l;
  if (npN === 20 && !npCovered && npTiers) npTiers.done(2);
}
function npSetN(n, cover) {
  npN = Math.max(0, Math.min(20, n));
  npCovered = !!cover;
  npGuessed = false;
  npRender();
  document.getElementById('npMsg').textContent = npCovered ? '只看圆点、十格阵和数轴，猜猜是几？' : '五种样子都在这儿了。';
}
function npReveal() {
  if (!npCovered) return;
  npCovered = false;
  npRender();
  const ok = npGuessed && npGuess === npN;
  document.getElementById('npMsg').textContent = '是 ' + npN + '（' + NP_WORDS[npN] + '）。' + (npGuessed ? (ok ? '你猜 ' + npGuess + '，猜对了！' : '你猜 ' + npGuess + '，猜错了——数一数圆点，一共 ' + npN + ' 个。') : '（下次先猜一个再揭开。）');
  // 为什么要跟实际揭示的数走：揭示 14 之后还拿 7 举例，学生会对不上号。
  document.getElementById('npWhy').innerHTML = '<b>为什么？</b>数不是符号，是“多少”：' + npN + ' 个圆点、十格阵里的 ' + npN + ' 格、数轴上 ' + npN + ' 的位置、汉字“' + NP_WORDS[npN] + '”，说的都是同一个“' + npN + '”。会数数，就是能在这些样子之间来回换。';
  if (npTiers) npTiers.done(0);
  if (ok && npTiers) npTiers.done(1);
  document.getElementById('npWhy').hidden = false;
  markTried('numplay');
  labTrace('数一数：' + npN + ' 的五种样子', true);
}
(function () {
  const g = document.getElementById('npGuessSet'); if (!g) return;
  npTiers = makeTiers(document.getElementById('npTiers'), ['基础：揭开一个数', '提高：只看圆点就猜对', '挑战：造出 20 的五种样子'], 'numplay');
  wireDiscovery('numplay', 'npFind', 'npFindSave', 'npFindSaved');
  document.getElementById('npGuessMinus').addEventListener('click', function () { npGuess = Math.max(0, npGuess - 1); document.getElementById('npGuessLabel').textContent = npGuess; });
  document.getElementById('npGuessPlus').addEventListener('click', function () { npGuess = Math.min(20, npGuess + 1); document.getElementById('npGuessLabel').textContent = npGuess; });
  g.addEventListener('click', function () { npGuessed = true; document.getElementById('npGuessTx').textContent = '你猜是 ' + npGuess + '。点“揭开”看看。'; });
  document.getElementById('npReveal').addEventListener('click', function () { npReveal(); });
  document.getElementById('npNew').addEventListener('click', function () { npSetN(5 + Math.floor(Math.random() * 16), true); });
  document.getElementById('npMinus').addEventListener('click', function () { npSetN(npN - 1, false); });
  document.getElementById('npPlus').addEventListener('click', function () { npSetN(npN + 1, false); });
  npRender();
})();

/* ---- 分数变数线 ---- */
const FNL_TARGETS = [{ n: 1, d: 2 }, { n: 3, d: 4 }, { n: 5, d: 4 }, { n: 2, d: 3 }];
let fnlIdx = 0, fnlGuess = 0.5, fnlShown = false, fnlDoneIdx = [];
let fnlTiers = null;
function fnlTarget() { return FNL_TARGETS[fnlIdx]; }
function fnlTrue() { const t = fnlTarget(); return t.n / t.d; }
function fnlRender() {
  const t = fnlTarget();
  document.getElementById('fnlGuessTx').textContent = '目标是 ' + t.n + '/' + t.d + '。它会落在数轴上的哪里？先在数轴上点一下（或拖滑杆），再点“展开”。';
  document.getElementById('fnlGuessLabel').textContent = fnlGuess.toFixed(2);
  let s = '<circle cx="100" cy="100" r="88" fill="#fff" stroke="#78716c" stroke-width="2"/>';
  const shaded = Math.min(t.n, t.d);
  for (let i = 0; i < shaded; i++) s += '<path d="' + sector(100, 100, 88, -90 + i * 360 / t.d, -90 + (i + 1) * 360 / t.d) + '" fill="#f97316"/>';
  for (let i = 1; i < t.d; i++) { const a = -90 + i * 360 / t.d, p = polar(100, 100, 88, a); s += '<line x1="100" y1="100" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '" stroke="#78716c" stroke-width="1"/>'; }
  if (t.n > t.d) s += '<text x="100" y="104" font-size="13" text-anchor="middle" fill="#7c2d12">1 个整饼 + ' + (t.n - t.d) + '/' + t.d + '</text>';
  document.getElementById('fnlPie').innerHTML = s;
  const gx = 20 + fnlGuess * 140, tx = 20 + fnlTrue() * 140;
  let l = '<line x1="20" y1="40" x2="300" y2="40" stroke="#78716c" stroke-width="2"/>';
  for (let i = 0; i <= 4; i++) { const x = 20 + i * 70; l += '<line x1="' + x + '" y1="34" x2="' + x + '" y2="46" stroke="#78716c" stroke-width="1"/><text x="' + x + '" y="58" font-size="11" text-anchor="middle" fill="#57534e">' + (i / 2) + '</text>'; }
  if (fnlShown) l += '<rect x="20" y="30" width="' + (fnlTrue() * 140) + '" height="8" fill="#16a34a" fill-opacity="0.5"/>';
  l += '<path d="M' + gx + ' 28 l5 -10 l5 10 Z" fill="#ea580c"/>';
  if (fnlShown) l += '<circle cx="' + tx + '" cy="40" r="6" fill="#16a34a" stroke="#14532d" stroke-width="1"/>';
  document.getElementById('fnlLine').innerHTML = l;
}
function fnlSetGuess(v) {
  fnlGuess = Math.max(0, Math.min(2, Math.round(v * 20) / 20));
  const r = document.getElementById('fnlGuessRange'); if (r) r.value = fnlGuess;
  fnlRender();
}
function fnlUnfurl() {
  const t = fnlTarget(), tv = fnlTrue();
  fnlShown = true;
  fnlRender();
  // 猜的位置按 0.05 一档走：只有落在和目标同一档才算对。以前用 |差| <= 0.05，
  // 0.45 猜 0.5 也算对——差了一整档，不能算对。用整数档比较，不怕浮点抖动。
  const hit = Math.round(fnlGuess * 20) === Math.round(tv * 20);
  const diff = fnlGuess - tv;
  let verdict;
  if (hit) {
    verdict = '猜对了！' + t.n + '/' + t.d + ' 正好落在 ' + tv + ' 那里。';
  } else {
    const g20 = Math.round(fnlGuess * 20);
    const num = Math.abs(g20 * t.d - t.n * 20), den = 20 * t.d, g = gcd(num, den) || 1;
    verdict = (diff < 0 ? '猜短了：' : '猜长了：') + '你猜 ' + fnlGuess.toFixed(2) + '，实际是 ' + tv + '，差了 ' + (num / g) + '/' + (den / g) + '——圆饼展开比你想的' + (diff < 0 ? '长' : '短') + '。';
  }
  document.getElementById('fnlMsg').textContent = verdict + '一个圆饼（1）展开就是数轴上 0 到 1 的距离；' + t.n + '/' + t.d + ' 个圆饼就是 ' + tv + ' 的距离。';
  if (hit) {
    if (fnlDoneIdx.indexOf(fnlIdx) < 0) fnlDoneIdx.push(fnlIdx);
    if (fnlTiers) fnlTiers.done(0);
    if (fnlIdx >= 1 && fnlTiers) fnlTiers.done(1);
    if (fnlDoneIdx.indexOf(2) >= 0 && fnlTiers) fnlTiers.done(2);
    document.getElementById('fnlWhy').hidden = false;
    markTried('fracnumline');
    labTrace('分数变数线：' + t.n + '/' + t.d + ' 落在 ' + tv, true);
  }
}
(function () {
  const g = document.getElementById('fnlUnfurl'); if (!g) return;
  fnlTiers = makeTiers(document.getElementById('fnlTiers'), ['基础：把 1/2 放对位置', '提高：把 3/4 放对位置', '挑战：把 5/4（超过 1）放对位置'], 'fracnumline');
  wireDiscovery('fracnumline', 'fnlFind', 'fnlFindSave', 'fnlFindSaved');
  document.getElementById('fnlGuessRange').addEventListener('input', function (e) { fnlSetGuess(parseFloat(e.target.value)); });
  document.getElementById('fnlLine').addEventListener('click', function (e) {
    // 点的是数轴这条线：e.target 可能是里面的刻度、圆点等子元素，它们的包围盒
    // 不是整条线，算出来的位置会跳。一定要用 svg 自己的包围盒。
    const svgEl = document.getElementById('fnlLine');
    const rect = svgEl.getBoundingClientRect ? svgEl.getBoundingClientRect() : { left: 0, width: 320 };
    const x = (e.clientX - rect.left) / rect.width * 320;
    fnlSetGuess((x - 20) / 140);
  });
  g.addEventListener('click', function () { fnlUnfurl(); });
  document.getElementById('fnlNext').addEventListener('click', function () {
    fnlIdx = (fnlIdx + 1) % FNL_TARGETS.length;
    fnlShown = false; fnlGuess = 0.5;
    document.getElementById('fnlMsg').textContent = '新分数：' + fnlTarget().n + '/' + fnlTarget().d + '。先猜位置，再点“展开”。';
    fnlRender();
  });
  fnlRender();
})();


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
  // 介绍、成功标准和为什么也跟着行列走：正方形转过来还是一样，别把相同的因数
  // 说成两道题（2026-11-06 真机复测：静态文本还写着 3×4，行列早变了）。
  const total = arrRows * arrCols;
  const kou = arrKoujue(arrRows, arrCols);
  const introHead = '乘法是“几个几相加”的简便写法：' + arrRows + ' 个 ' + arrCols + ' 相加，写成 ' + arrRows + '×' + arrCols + '=' + total + '。';
  const footHead = '成功标准：说出“' + arrRows + '乘' + arrCols + '是' + arrRows + '组' + arrCols + '，一共' + total + '个点，排成' + arrRows + '行' + arrCols + '列”；';
  const whyTail = '口诀不是背下来的顺口溜，是点阵数出来的：' + kou + '，就是 ' + arrRows + ' 行 ' + arrCols + ' 列一共 ' + total + ' 个点。';
  if (arrRows === arrCols) {
    document.getElementById('arrIntro').textContent = introHead + '画成点阵是 ' + arrRows + ' 行 ' + arrCols + ' 列，是个正方形。转个方向，正方形还是一样，行和列都是 ' + arrRows + '，点还是 ' + total + ' 个。';
    document.getElementById('arrFoot').textContent = footHead + '正方形转过来还是一样，行和列都是 ' + arrRows + '。';
    document.getElementById('arrWhy').innerHTML = '<b>为什么？</b>' + arrRows + '×' + arrCols + ' 的点阵是个正方形，转个方向还是 ' + arrRows + ' 行 ' + arrCols + ' 列，点还是 ' + total + ' 个。' + whyTail;
  } else {
    document.getElementById('arrIntro').textContent = introHead + '画成点阵是 ' + arrRows + ' 行 ' + arrCols + ' 列。转个方向，点阵变成 ' + arrCols + ' 行 ' + arrRows + ' 列，点还是 ' + total + ' 个。';
    document.getElementById('arrFoot').textContent = footHead + '说出 ' + arrRows + '×' + arrCols + ' 和 ' + arrCols + '×' + arrRows + ' 是一道题。';
    document.getElementById('arrWhy').innerHTML = '<b>为什么？</b>' + arrRows + '×' + arrCols + ' 的点阵转个方向就变成 ' + arrCols + '×' + arrRows + '，点还是 ' + total + ' 个，所以 ' + arrRows + '×' + arrCols + '=' + arrCols + '×' + arrRows + '。口诀不是背下来的顺口溜，是点阵数出来的：' + kou + '，就是 ' + arrRows + ' 行 ' + arrCols + ' 列一共 ' + total + ' 个点。';
  }
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
  { label: '96 ÷ 4', why: '96÷4，先分 9 个十，每人 2 个十，用掉 8 个十，剩下 1 个十变成 10 个一，和 6 个一合起来是 16 个一，再分，每人 4 个一。', steps: ['先看十位：9 个十，每人分 2 个十，用掉 8 个十', '剩下 1 个十，换成 10 个一，和 6 个一合起来是 16 个一', '16 个一，每人分 4 个一', '结果：96 ÷ 4 = 24'] },
  { label: '408 ÷ 4', why: '408÷4，百位分 1 个百，十位 0 个十不够分，写 0 占位，个位再分 8 个一。商中间的 0 是占位符，跳过它，后面的数位就全移位了。', steps: ['百位：4 个百，每人分 1 个百', '十位：0 个十，不够分，写 0 占位', '个位：8 个一，每人分 2 个一', '结果：408 ÷ 4 = 102——中间的 0 是占位符，跳过它就变成 12 了'] },
  { label: '84 ÷ 2', why: '84÷2，先分 8 个十，每人 4 个十，再分 4 个一，每人 2 个一。', steps: ['十位：8 个十，每人分 4 个十', '个位：4 个一，每人分 2 个一', '结果：84 ÷ 2 = 42'] }
];
let d1ProbIdx = 0;
let d1Step = 0;
function d1Render() {
  const p = D1_PROBS[d1ProbIdx];
  document.getElementById('d1Eq').textContent = p.label + ' = ?';
  // 为什么跟着题目走：96÷4 的商里没有 0，占位符那句只属于 408÷4。
  document.getElementById('d1Why').innerHTML = '<b>为什么？</b>' + p.why;
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
  document.getElementById('caReadout').textContent = caMonth === 2
    ? '2 月：' + kind + '，有 ' + days + ' 天。'
    : caMonth + ' 月是' + kind + '，有 ' + days + ' 天。';
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
// 每道题的成功标准跟着题目走：150÷26 商 5 余 20，161÷23 商 7，312÷39 商 8，96÷12 商 8。
const TD_FOOT = [
  '我试 5，5×26=130，余 20，商是 5 余 20',
  '我试 7，7×23=161，正好，商是 7',
  '我试 8，8×39=312，正好，商是 8',
  '我试 8，8×12=96，正好，商是 8'
];
function tdRender() {
  const p = TD_PROBS[tdProbIdx];
  document.getElementById('tdEq').textContent = p.d + ' ÷ ' + p.v + ' = ?';
  document.getElementById('tdGuessTx').textContent = '试商：' + tdGuess;
  document.getElementById('tdFoot').textContent = '成功标准：说出“' + TD_FOOT[tdProbIdx] + '”。';
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
    b.addEventListener('click', function () { tdProbIdx = i; tdGuess = p.g; markTried('trialdiv'); document.getElementById('tdMsg').textContent = '先猜一个商，再点“乘回去验算”。'; tdRender(); });
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

/* ---------- 4.16 鸡兔同笼：一个点，四种方法 ----------
   调研（band-4-6.json 4.16）给的 4 种方法，各一个动画；旧的 chickenrabbit（步进换兔，
   没有先猜、没有三档）照旧保留，排在点页第一个。
   每道题都验算过：10 头 28 腿 → 兔 4 鸡 6；35 头 94 腿 → 兔 12 鸡 23；
   24 头 74 腿 → 兔 13 鸡 11；20 头 56 腿 → 兔 8 鸡 12；8 头 22 腿 → 兔 3 鸡 5；
   12 头 34 腿 → 兔 5 鸡 7。金鸡独立要求腿数是偶数，上面全是偶数。 */
function crSolve(h, l) { const r = (l - 2 * h) / 2; return { r: r, c: h - r }; }

/* ---- 方法一：假设法——猜了再滑 ----
   和旧演示的区别：旧的是 +/− 步进、直接给答案；这里先猜兔的只数，再拖一条真正的滑杆，
   笼子里的鸡一只一只变成兔，滑到目标腿数就对了（滑过头会提示多几条腿，不会硬停），猜错了能看到差几条腿。 */
const CS_PROBS = [
  { heads: 10, legs: 28 },
  { heads: 35, legs: 94 },
  { heads: 24, legs: 74 }
];
let csProbIdx = 0, csRabbits = 0, csGuess = 2, csGuessed = false, csStreak = 0, csSolved = false, csCounted = '';
let csTiers = null;
function csProb() { return CS_PROBS[csProbIdx]; }
function csLegs() { const p = csProb(); return (p.heads - csRabbits) * 2 + csRabbits * 4; }
function csRender() {
  const p = csProb();
  const chickens = p.heads - csRabbits;
  const legs = csLegs();
  document.getElementById('csRead').textContent = '鸡 ' + chickens + ' 只，兔 ' + csRabbits + ' 只，一共 ' + legs + ' 条腿（目标 ' + p.legs + ' 条）。';
  document.getElementById('csFill').style.width = Math.round(legs / (p.heads * 4) * 100) + '%';
  document.getElementById('csRabbitTx').textContent = '兔 ' + csRabbits + ' 只';
  const range = document.getElementById('csRange');
  range.max = p.heads;
  range.value = csRabbits;
  const cage = document.getElementById('csCage');
  clearChildren(cage);
  for (let i = 0; i < p.heads; i++) {
    const cell = document.createElement('div');
    const rabbit = i < csRabbits;
    cell.className = 'cr-cell' + (rabbit ? ' rabbit' : '');
    const nm = document.createElement('div');
    nm.textContent = rabbit ? '兔' : '鸡';
    const lg = document.createElement('div');
    lg.className = 'legs';
    lg.textContent = rabbit ? '●●●●' : '●●';
    cell.appendChild(nm);
    cell.appendChild(lg);
    cage.appendChild(cell);
  }
  document.querySelectorAll('#csProbSeg [data-cs-prob]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.csProb === csProbIdx));
  });
}
function csGuessText(sol) {
  if (!csGuessed) return '（先猜兔有几只再动手，猜得更准。）';
  if (csGuess === sol.r) return '你猜 ' + sol.r + ' 只，猜对了！';
  const d = (sol.r - csGuess) * 2;
  return d > 0
    ? '你猜 ' + csGuess + ' 只，实际是 ' + sol.r + ' 只——还差 ' + d + ' 条腿，每只兔多 2 条腿，还差 ' + (d / 2) + ' 只兔。'
    : '你猜 ' + csGuess + ' 只，实际是 ' + sol.r + ' 只——多了 ' + (-d) + ' 条腿，兔换回 ' + (-d / 2) + ' 只鸡。';
}
function csSet(n) {
  const p = csProb();
  csRabbits = Math.max(0, Math.min(p.heads, n));
  markTried('crslider');
  csRender();
  const legs = csLegs(), diff = p.legs - legs;
  const msg = document.getElementById('csMsg');
  if (diff === 0) {
    const sol = crSolve(p.heads, p.legs);
    msg.textContent = '正好 ' + p.legs + ' 条腿！兔 ' + sol.r + ' 只，鸡 ' + sol.c + ' 只——验算：' + sol.c + '×2+' + sol.r + '×4=' + p.legs + '。' + csGuessText(sol);
    if (csGuessed) {
      const key = csProbIdx + ':' + csGuess;
      if (csGuess === sol.r) {
        if (csCounted !== key) {
          csCounted = key;
          csStreak++;
          if (csTiers) csTiers.done(1);
          if (csStreak >= 2 && csTiers) csTiers.done(2);
        }
      } else { csStreak = 0; csCounted = ''; }
    }
    if (!csSolved && csTiers) csTiers.done(0);
    if (!csSolved) {
      csSolved = true;
      document.getElementById('csWhy').hidden = false;
      labTrace('鸡兔同笼·猜了再滑：' + p.heads + ' 头 ' + p.legs + ' 腿，兔 ' + sol.r + ' 只', true);
    }
  } else if (diff > 0) {
    msg.textContent = '还差 ' + diff + ' 条腿：每换一只兔多 2 条腿，还要换 ' + (diff / 2) + ' 只兔。';
  } else {
    msg.textContent = '多了 ' + (-diff) + ' 条腿：换回去 ' + (-diff / 2) + ' 只鸡。';
  }
}
function csSetGuess(n) {
  const p = csProb();
  csGuess = Math.max(0, Math.min(p.heads, n));
  csGuessed = true;
  document.getElementById('csGuessLabel').textContent = csGuess + ' 只';
  document.getElementById('csGuessTx').textContent = '你猜兔有 ' + csGuess + ' 只。动手吧——拖滑杆，滑到目标腿数就停。';
}
function csNewProblem(i) {
  csProbIdx = i;
  csRabbits = 0; csGuessed = false; csGuess = 2; csSolved = false; csCounted = '';
  document.getElementById('csGuessLabel').textContent = '2 只';
  document.getElementById('csGuessTx').textContent = '头 ' + csProb().heads + ' 个，脚 ' + csProb().legs + ' 只：兔有几只？先猜一个数。';
  document.getElementById('csMsg').textContent = '先猜要换几只兔，再拖滑杆。';
  csRender();
}
(function csInit() {
  const seg = document.getElementById('csProbSeg');
  if (!seg) return;
  csTiers = makeTiers(document.getElementById('csTiers'), ['基础：滑到目标腿数', '提高：猜对兔的只数', '挑战：连续两道都猜对']);
  wireDiscovery('crslider', 'csFind', 'csFindSave', 'csFindSaved');
  CS_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = '头 ' + p.heads + ' 个，脚 ' + p.legs + ' 只';
    b.dataset.csProb = String(i);
    b.addEventListener('click', function () { csNewProblem(i); });
    seg.appendChild(b);
  });
  document.getElementById('csGuessMinus').addEventListener('click', function () { csGuess = Math.max(0, csGuess - 1); document.getElementById('csGuessLabel').textContent = csGuess + ' 只'; });
  document.getElementById('csGuessPlus').addEventListener('click', function () { csGuess = Math.min(csProb().heads, csGuess + 1); document.getElementById('csGuessLabel').textContent = csGuess + ' 只'; });
  document.getElementById('csGuessSet').addEventListener('click', function () { csSetGuess(csGuess); });
  document.getElementById('csRange').addEventListener('input', function (e) { csSet(+e.target.value); });
  document.getElementById('csMinus').addEventListener('click', function () { csSet(csRabbits - 1); });
  document.getElementById('csPlus').addEventListener('click', function () { csSet(csRabbits + 1); });
  document.getElementById('csAllChicken').addEventListener('click', function () { csSet(0); });
  csRender();
})();

/* ---- 方法二：画图法——先画 2 条腿，再 2 条 2 条补 ----
   每个头先画 2 条腿，少的腿 2 条 2 条往上补，补满 4 条的就是兔。
   数大了画不完（35 个头要补 12 次），自然过渡到假设法——挑战档就是这个过渡。 */
const CD_PROBS = [
  { heads: 8, legs: 22 },
  { heads: 10, legs: 28 },
  { heads: 12, legs: 34 }
];
let cdProbIdx = 0, cdLegs = [], cdGuess = 1, cdGuessed = false, cdSolved = false, cdBigSeen = false, cdSolved2 = false;
let cdTiers = null;
function cdProb() { return CD_PROBS[cdProbIdx]; }
function cdSum() { return cdLegs.reduce(function (a, b) { return a + b; }, 0); }
function cdRender() {
  const p = cdProb();
  const box = document.getElementById('cdHeads');
  clearChildren(box);
  cdLegs.forEach(function (legs, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cr-head' + (legs === 4 ? ' rabbit' : '');
    b.dataset.cdHead = String(i);
    const hd = document.createElement('div');
    hd.textContent = legs === 4 ? '兔' : '头';
    const lg = document.createElement('div');
    lg.textContent = legs === 4 ? '●●●●' : '●●';
    b.appendChild(hd);
    b.appendChild(lg);
    b.addEventListener('click', function () { cdAddLeg(i); });
    box.appendChild(b);
  });
  document.getElementById('cdRead').textContent = '一共 ' + cdSum() + ' 条腿（目标 ' + p.legs + ' 条），还差 ' + (p.legs - cdSum()) + ' 条。';
  document.querySelectorAll('#cdProbSeg [data-cd-prob]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.cdProb === cdProbIdx));
  });
}
function cdGuessText(sol) {
  if (!cdGuessed) return '（先猜兔有几只再动手，猜得更准。）';
  if (cdGuess === sol.r) return '你猜 ' + sol.r + ' 只，猜对了！';
  const d = sol.r - cdGuess;
  return d > 0
    ? '你猜 ' + cdGuess + ' 只，实际是 ' + sol.r + ' 只——少补了 ' + d + ' 次，每次补 2 条腿。'
    : '你猜 ' + cdGuess + ' 只，实际是 ' + sol.r + ' 只——多补了 ' + (-d) + ' 次。';
}
function cdAddLeg(i) {
  const p = cdProb(), sol = crSolve(p.heads, p.legs);
  const sum = cdSum();
  const msg = document.getElementById('cdMsg');
  if (sum >= p.legs) {
    msg.textContent = '腿已经够了！再补就超过 ' + p.legs + ' 条了——数一数 4 条腿的有几只，那就是兔。';
    return;
  }
  if (cdLegs[i] === 4) {
    msg.textContent = '这只已经 4 条腿了，再补就 6 条了——兔只有 4 条腿，补到这里就停。';
    return;
  }
  cdLegs[i] = 4;
  markTried('crdraw');
  cdRender();
  const now = cdSum(), diff = p.legs - now;
  if (diff === 0) {
    cdSolved = true;
    msg.textContent = '补满了！4 条腿的有 ' + sol.r + ' 只，就是兔；2 条腿的有 ' + sol.c + ' 只，是鸡。' + cdGuessText(sol);
    if (cdProbIdx === 2) {
      cdSolved2 = true;
      if (cdBigSeen && cdTiers) cdTiers.done(2);
      else msg.textContent += '再点“35 头怎么办”，想想大数怎么画。';
    } else if (cdTiers) { cdTiers.done(cdProbIdx); }
    document.getElementById('cdWhy').hidden = false;
    labTrace('鸡兔同笼·画图补腿：' + p.heads + ' 头 ' + p.legs + ' 腿，兔 ' + sol.r + ' 只', true);
  } else {
    msg.textContent = '还差 ' + diff + ' 条腿：每次补 2 条，还要补 ' + (diff / 2) + ' 次。';
  }
}
function cdBig() {
  cdBigSeen = true;
  document.getElementById('cdBigTx').textContent = '35 个头画不完吧？先全当鸡是 70 条腿，少 24 条；2 条 2 条补，要补 12 次——24÷2=12 只兔。画图法画到大数，就变成了假设法。';
  if (cdSolved2 && cdTiers) cdTiers.done(2);
  markTried('crdraw');
}
function cdSetGuess(n) {
  const p = cdProb();
  cdGuess = Math.max(0, Math.min(p.heads, n));
  cdGuessed = true;
  document.getElementById('cdGuessLabel').textContent = cdGuess + ' 只';
  document.getElementById('cdGuessTx').textContent = '你猜兔有 ' + cdGuess + ' 只。动手吧——点一个头，给它补 2 条腿。';
}
function cdNewProblem(i) {
  cdProbIdx = i;
  cdLegs = [];
  for (let k = 0; k < cdProb().heads; k++) cdLegs.push(2);
  cdGuessed = false; cdGuess = 1; cdSolved = false; cdBigSeen = false; cdSolved2 = false;
  document.getElementById('cdGuessLabel').textContent = '1 只';
  document.getElementById('cdGuessTx').textContent = '头 ' + cdProb().heads + ' 个，脚 ' + cdProb().legs + ' 只：兔有几只？先猜一个数。';
  document.getElementById('cdBigTx').textContent = '';
  document.getElementById('cdMsg').textContent = '每个头先画 2 条腿，再 2 条 2 条往上补。';
  cdRender();
}
(function cdInit() {
  const seg = document.getElementById('cdProbSeg');
  if (!seg) return;
  cdTiers = makeTiers(document.getElementById('cdTiers'), ['基础：画出 8 头 22 腿', '提高：画出 10 头 28 腿', '挑战：画出 12 头 34 腿，再想想 35 头']);
  wireDiscovery('crdraw', 'cdFind', 'cdFindSave', 'cdFindSaved');
  CD_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = '头 ' + p.heads + ' 个，脚 ' + p.legs + ' 只';
    b.dataset.cdProb = String(i);
    b.addEventListener('click', function () { cdNewProblem(i); });
    seg.appendChild(b);
  });
  document.getElementById('cdGuessMinus').addEventListener('click', function () { cdGuess = Math.max(0, cdGuess - 1); document.getElementById('cdGuessLabel').textContent = cdGuess + ' 只'; });
  document.getElementById('cdGuessPlus').addEventListener('click', function () { cdGuess = Math.min(cdProb().heads, cdGuess + 1); document.getElementById('cdGuessLabel').textContent = cdGuess + ' 只'; });
  document.getElementById('cdGuessSet').addEventListener('click', function () { cdSetGuess(cdGuess); });
  document.getElementById('cdBig').addEventListener('click', function () { cdBig(); });
  cdNewProblem(0);
})();

/* ---- 方法三：列表枚举法——鸡从 0 只试到头数 ----
   腿数一行一行变，35 头 94 腿只在 23 鸡 12 兔处对上。
   慢但可靠：每行都写清多了还是少了，方向本身就是规律（鸡每多 1 只，腿少 2 条）。 */
const CL_PROBS = [
  { heads: 10, legs: 28 },
  { heads: 20, legs: 56 },
  { heads: 35, legs: 94 }
];
let clProbIdx = 0, clShown = 0, clGuess = 3, clGuessed = false, clSolved = false;
let clTiers = null;
function clProb() { return CL_PROBS[clProbIdx]; }
function clHitN() { const p = clProb(); return p.heads - crSolve(p.heads, p.legs).r; }
function clRowLegs(n) { const p = clProb(); return 2 * n + 4 * (p.heads - n); }
function clRenderRows() {
  const p = clProb();
  const box = document.getElementById('clRows');
  clearChildren(box);
  for (let n = 0; n < clShown; n++) {
    const legs = clRowLegs(n);
    const row = document.createElement('div');
    const hit = legs === p.legs;
    row.className = 'cr-row' + (hit ? ' hit' : '');
    row.textContent = '鸡 ' + n + ' 只 · 兔 ' + (p.heads - n) + ' 只 · 腿 ' + legs + ' 条' +
      (hit ? ' ✓ 正好' : (legs > p.legs ? '（多了 ' + (legs - p.legs) + ' 条）' : '（少了 ' + (p.legs - legs) + ' 条）'));
    box.appendChild(row);
  }
  document.getElementById('clRead').textContent = clShown === 0
    ? '还没有试，目标 ' + p.legs + ' 条腿。'
    : '已经试了 ' + clShown + ' 行（鸡 0 只到鸡 ' + (clShown - 1) + ' 只），目标 ' + p.legs + ' 条腿。' +
      (clShown >= 3 ? '看出来了吗：鸡每多 1 只，腿就少 2 条。' : '');
  document.querySelectorAll('#clProbSeg [data-cl-prob]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.clProb === clProbIdx));
  });
}
function clGuessText(sol) {
  if (!clGuessed) return '（先猜鸡有几只再试，猜得更准。）';
  if (clGuess === sol.c) return '你猜鸡 ' + sol.c + ' 只，猜对了！';
  const d = clRowLegs(clGuess) - clProb().legs;
  return d > 0
    ? '你猜鸡 ' + clGuess + ' 只，腿是 ' + clRowLegs(clGuess) + ' 条，多了 ' + d + ' 条——鸡太少了，腿多了就要加鸡。'
    : '你猜鸡 ' + clGuess + ' 只，腿是 ' + clRowLegs(clGuess) + ' 条，少了 ' + (-d) + ' 条——鸡太多了，腿少了就要减鸡。';
}
function clCheckSolved() {
  const p = clProb();
  if (clSolved || clHitN() >= clShown) return;
  clSolved = true;
  const sol = crSolve(p.heads, p.legs);
  document.getElementById('clMsg').textContent = '表里找到了：鸡 ' + sol.c + ' 只，兔 ' + sol.r + ' 只，腿正好 ' + p.legs + ' 条。' + clGuessText(sol);
  if (clTiers) clTiers.done(clProbIdx);
  document.getElementById('clWhy').hidden = false;
  labTrace('鸡兔同笼·列表枚举：' + p.heads + ' 头 ' + p.legs + ' 腿，兔 ' + sol.r + ' 只', true);
}
function clNext() {
  const p = clProb();
  if (clShown > p.heads) { document.getElementById('clMsg').textContent = '都试完了，只有一行正好。'; return; }
  const n = clShown;
  clShown++;
  markTried('crlist');
  clRenderRows();
  const legs = clRowLegs(n);
  if (legs !== p.legs) {
    document.getElementById('clMsg').textContent = '鸡 ' + n + ' 只，腿 ' + legs + ' 条，' +
      (legs > p.legs ? '多了 ' + (legs - p.legs) + ' 条：鸡太少了，加 1 只鸡，腿就少 2 条。' : '少了 ' + (p.legs - legs) + ' 条：鸡太多了，减 1 只鸡，腿就多 2 条。');
  }
  clCheckSolved();
}
function clSetGuess(n) {
  const p = clProb();
  clGuess = Math.max(0, Math.min(p.heads, n));
  clGuessed = true;
  document.getElementById('clGuessLabel').textContent = clGuess + ' 只';
  document.getElementById('clGuessTx').textContent = '你猜鸡有 ' + clGuess + ' 只。跳到那一行看看，对不对。';
}
function clJump() {
  if (!clGuessed) clSetGuess(clGuess);
  clShown = Math.max(clShown, clGuess + 1);
  markTried('crlist');
  clRenderRows();
  const p = clProb();
  const legs = clRowLegs(clGuess);
  if (legs !== p.legs) {
    document.getElementById('clMsg').textContent = '鸡 ' + clGuess + ' 只，腿 ' + legs + ' 条，' +
      (legs > p.legs ? '多了 ' + (legs - p.legs) + ' 条：鸡太少了，继续往下试，腿会越来越少。' : '少了 ' + (p.legs - legs) + ' 条：鸡太多了，跳过头了，正好的那行在上面。');
  }
  clCheckSolved();
}
function clNewProblem(i) {
  clProbIdx = i;
  clShown = 0; clGuessed = false; clGuess = 3; clSolved = false;
  document.getElementById('clGuessLabel').textContent = '3 只';
  document.getElementById('clGuessTx').textContent = '头 ' + clProb().heads + ' 个，脚 ' + clProb().legs + ' 只：鸡有几只？先猜一个数。';
  document.getElementById('clMsg').textContent = '鸡从 0 只开始，一行一行试下去。';
  clRenderRows();
}
(function clInit() {
  const seg = document.getElementById('clProbSeg');
  if (!seg) return;
  clTiers = makeTiers(document.getElementById('clTiers'), ['基础：试出 10 头 28 腿', '提高：试出 20 头 56 腿', '挑战：试出 35 头 94 腿']);
  wireDiscovery('crlist', 'clFind', 'clFindSave', 'clFindSaved');
  CL_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = '头 ' + p.heads + ' 个，脚 ' + p.legs + ' 只';
    b.dataset.clProb = String(i);
    b.addEventListener('click', function () { clNewProblem(i); });
    seg.appendChild(b);
  });
  document.getElementById('clGuessMinus').addEventListener('click', function () { clGuess = Math.max(0, clGuess - 1); document.getElementById('clGuessLabel').textContent = clGuess + ' 只'; });
  document.getElementById('clGuessPlus').addEventListener('click', function () { clGuess = Math.min(clProb().heads, clGuess + 1); document.getElementById('clGuessLabel').textContent = clGuess + ' 只'; });
  document.getElementById('clGuessSet').addEventListener('click', function () { clSetGuess(clGuess); });
  document.getElementById('clNext').addEventListener('click', function () { clNext(); });
  document.getElementById('clJump').addEventListener('click', function () { clJump(); });
  document.getElementById('clReset').addEventListener('click', function () { clNewProblem(clProbIdx); });
  clNewProblem(0);
})();

/* ---- 方法四：金鸡独立法——脚减半 ----
   总脚数减半：鸡变 1 只脚、兔变 2 只脚，脚比头多出来的数就是兔数。
   94÷2−35=12。脚数必须是偶数——这三道题全是偶数。 */
const CG_PROBS = [
  { heads: 10, legs: 28 },
  { heads: 35, legs: 94 },
  { heads: 24, legs: 74 }
];
let crgProbIdx = 0, crgGuess = 2, crgGuessed = false, crgHalved = false, crgSolved = false, crgStreak = 0, crgCounted = '';
let crgTiers = null;
function crgProb() { return CG_PROBS[crgProbIdx]; }
function crgRender() {
  const p = crgProb();
  const heads = document.getElementById('cgHeads');
  clearChildren(heads);
  for (let i = 0; i < p.heads; i++) {
    const s = document.createElement('span');
    s.className = 'cr-dot heads';
    s.textContent = '○';
    heads.appendChild(s);
  }
  const feet = document.getElementById('cgFeet');
  clearChildren(feet);
  if (crgHalved) {
    const half = p.legs / 2;
    for (let i = 0; i < half; i++) {
      const s = document.createElement('span');
      s.className = 'cr-dot feet' + (i >= p.heads ? ' extra' : '');
      s.textContent = '●';
      feet.appendChild(s);
    }
  } else {
    for (let i = 0; i < p.legs; i++) {
      const s = document.createElement('span');
      s.className = 'cr-dot feet dim';
      s.textContent = '●';
      feet.appendChild(s);
    }
  }
  document.getElementById('crgRead').textContent = crgHalved
    ? '脚减半：一共 ' + p.legs + '÷2 = ' + (p.legs / 2) + ' 只脚着地。绿点是每头 1 只脚，橙点是多出来的。'
    : '头 ' + p.heads + ' 个，脚 ' + p.legs + ' 只：脚都在地上。先猜兔有几只，再点“金鸡独立”。';
  document.querySelectorAll('#cgProbSeg [data-crg-prob]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(+b.dataset.crgProb === crgProbIdx));
  });
}
function crgHalf() {
  const p = crgProb();
  if (!crgGuessed) {
    document.getElementById('crgMsg').textContent = '先猜兔有几只，再金鸡独立——不然你就直接看到答案了。';
    return;
  }
  if (!crgHalved) {
    crgHalved = true;
    markTried('crgolden');
    crgRender();
  }
  const sol = crSolve(p.heads, p.legs);
  const half = p.legs / 2;
  const expected = p.heads + crgGuess;
  let t = '现在着地 ' + half + ' 只脚。' + p.heads + ' 个头，每个头至少 1 只脚着地，用掉 ' + p.heads + ' 只，还剩 ' + (half - p.heads) + ' 只脚——这 ' + (half - p.heads) + ' 只脚一定是兔子的，因为鸡已经只有 1 只脚了。';
  if (crgGuess === sol.r) {
    t += '你猜 ' + sol.r + ' 只，猜对了！';
    const key = crgProbIdx + ':' + crgGuess;
    if (crgCounted !== key) {
      crgCounted = key;
      crgStreak++;
      if (crgTiers && crgProbIdx === 1) crgTiers.done(1);
      if (crgStreak >= 2 && crgTiers) crgTiers.done(2);
    }
  } else if (expected < half) {
    t += '你猜兔 ' + crgGuess + ' 只：着地的脚应该是 ' + expected + ' 只，可实际是 ' + half + ' 只，还差 ' + (half - expected) + ' 只脚——每只兔多 1 只脚，还差 ' + (half - expected) + ' 只兔。';
    crgStreak = 0; crgCounted = '';
  } else {
    t += '你猜兔 ' + crgGuess + ' 只：着地的脚应该是 ' + expected + ' 只，可实际只有 ' + half + ' 只，多了 ' + (expected - half) + ' 只脚——每只兔多 1 只脚，兔要少 ' + (expected - half) + ' 只。';
    crgStreak = 0; crgCounted = '';
  }
  document.getElementById('crgMsg').textContent = t;
}
function crgCalc() {
  const p = crgProb();
  if (!crgHalved) {
    document.getElementById('crgMsg').textContent = '先点“金鸡独立”，让脚减半，再算。';
    return;
  }
  if (crgSolved) return;
  crgSolved = true;
  const sol = crSolve(p.heads, p.legs);
  const half = p.legs / 2;
  document.getElementById('crgMsg').textContent = '兔 = ' + half + ' − ' + p.heads + ' = ' + sol.r + ' 只，鸡 = ' + p.heads + ' − ' + sol.r + ' = ' + sol.c + ' 只。验算：' + sol.c + '×2+' + sol.r + '×4=' + p.legs + '。';
  if (crgTiers) crgTiers.done(0);
  document.getElementById('cgWhy').hidden = false;
  labTrace('鸡兔同笼·金鸡独立：' + p.heads + ' 头 ' + p.legs + ' 腿，兔 ' + sol.r + ' 只', true);
}
function crgSetGuess(n) {
  const p = crgProb();
  crgGuess = Math.max(0, Math.min(p.heads, n));
  crgGuessed = true;
  document.getElementById('cgGuessLabel').textContent = crgGuess + ' 只';
  document.getElementById('cgGuessTx').textContent = '你猜兔有 ' + crgGuess + ' 只。动手吧——点“金鸡独立”。';
}
function crgNewProblem(i) {
  crgProbIdx = i;
  crgGuessed = false; crgGuess = 2; crgHalved = false; crgSolved = false; crgCounted = '';
  document.getElementById('cgGuessLabel').textContent = '2 只';
  document.getElementById('cgGuessTx').textContent = '头 ' + crgProb().heads + ' 个，脚 ' + crgProb().legs + ' 只：兔有几只？先猜一个数。';
  document.getElementById('crgMsg').textContent = '先猜兔有几只，再让它们金鸡独立。';
  crgRender();
}
(function crgInit() {
  const seg = document.getElementById('cgProbSeg');
  if (!seg) return;
  crgTiers = makeTiers(document.getElementById('cgTiers'), ['基础：脚减半算出 10 头 28 腿', '提高：猜对 35 头 94 腿的兔数', '挑战：连续两道都猜对']);
  wireDiscovery('crgolden', 'cgFind', 'cgFindSave', 'cgFindSaved');
  CG_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = '头 ' + p.heads + ' 个，脚 ' + p.legs + ' 只';
    b.dataset.crgProb = String(i);
    b.addEventListener('click', function () { crgNewProblem(i); });
    seg.appendChild(b);
  });
  document.getElementById('cgGuessMinus').addEventListener('click', function () { crgGuess = Math.max(0, crgGuess - 1); document.getElementById('cgGuessLabel').textContent = crgGuess + ' 只'; });
  document.getElementById('cgGuessPlus').addEventListener('click', function () { crgGuess = Math.min(crgProb().heads, crgGuess + 1); document.getElementById('cgGuessLabel').textContent = crgGuess + ' 只'; });
  document.getElementById('cgGuessSet').addEventListener('click', function () { crgSetGuess(crgGuess); });
  document.getElementById('cgHalf').addEventListener('click', function () { crgHalf(); });
  document.getElementById('cgCalc').addEventListener('click', function () { crgCalc(); });
  crgNewProblem(0);
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
  document.getElementById('ccRectTx').textContent = '长 ' + g6fmt(3.14 * ccR) + ' 厘米、宽 ' + ccR + ' 厘米的长方形';
  // 画出真正的圆：周长模式是带半径和直径的圆；面积模式是切成扇形的圆 + 扇形拼成的长方形。
  ccCircDraw();
  if (ccMode === 'a') ccAreaDraw();
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
function ccWedgePath(cx, cy, r, a0, a1) {
  const x1 = cx + r * Math.cos(a0), y1 = cy + r * Math.sin(a0);
  const x2 = cx + r * Math.cos(a1), y2 = cy + r * Math.sin(a1);
  return 'M ' + cx + ',' + cy + ' L ' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' A ' + r + ',' + r + ' 0 0,1 ' + x2.toFixed(1) + ',' + y2.toFixed(1) + ' Z';
}
function ccCircDraw() {
  const R = ccR * 11, cx = 110, cy = 120;
  document.getElementById('ccCircle').setAttribute('r', R);
  const dl = document.getElementById('ccDiamLine');
  dl.setAttribute('x1', cx - R); dl.setAttribute('x2', cx + R);
  dl.setAttribute('y1', cy); dl.setAttribute('y2', cy);
  const rl = document.getElementById('ccRadiusLine');
  rl.setAttribute('x1', cx); rl.setAttribute('x2', cx + R);
  rl.setAttribute('y1', cy); rl.setAttribute('y2', cy);
  const rLab = document.getElementById('ccRLab');
  rLab.setAttribute('x', cx + R / 2); rLab.setAttribute('y', cy - 10);
  const dLab = document.getElementById('ccDLab');
  dLab.setAttribute('x', cx - R / 2); dLab.setAttribute('y', cy + 24);
}
function ccAreaDraw() {
  const NS = 'http://www.w3.org/2000/svg';
  const R = ccR * 11, cx = 110, cy = 120, n = ccSlices;
  const theta = 2 * Math.PI / n;
  const wedgeSvg = document.getElementById('ccWedgeSvg');
  while (wedgeSvg.firstChild) wedgeSvg.removeChild(wedgeSvg.firstChild);
  for (let i = 0; i < n; i++) {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', ccWedgePath(cx, cy, R, i * theta, (i + 1) * theta));
    p.setAttribute('fill', i % 2 === 0 ? '#dbeafe' : '#fef3c7');
    p.setAttribute('stroke', '#1e293b'); p.setAttribute('stroke-width', 1);
    wedgeSvg.appendChild(p);
  }
  // 拼长方形：上排扇形尖朝下、下排尖朝上，错开半个扇形；长约 πr，宽是 r。
  const rectSvg = document.getElementById('ccRectSvg');
  while (rectSvg.firstChild) rectSvg.removeChild(rectSvg.firstChild);
  const s = Math.sin(theta / 2), c = Math.cos(theta / 2);
  const step = 2 * R * s;
  const W = step * (n / 2 + 0.5);
  const X0 = (640 - W) / 2 + step / 2, Y0 = 45;
  const base = 'M 0,0 L ' + (R * s).toFixed(1) + ',' + (R * c).toFixed(1) + ' A ' + R + ',' + R + ' 0 0,1 ' + (-R * s).toFixed(1) + ',' + (R * c).toFixed(1) + ' Z';
  for (let i = 0; i < n / 2; i++) {
    const top = document.createElementNS(NS, 'path');
    top.setAttribute('d', base);
    top.setAttribute('transform', 'translate(' + (X0 + step * i).toFixed(1) + ',' + (Y0 + R) + ') rotate(180)');
    top.setAttribute('fill', '#dbeafe');
    top.setAttribute('stroke', '#1e293b'); top.setAttribute('stroke-width', 1);
    rectSvg.appendChild(top);
    const bot = document.createElementNS(NS, 'path');
    bot.setAttribute('d', base);
    bot.setAttribute('transform', 'translate(' + (X0 + step * (i + 0.5)).toFixed(1) + ',' + Y0 + ')');
    bot.setAttribute('fill', '#fef3c7');
    bot.setAttribute('stroke', '#1e293b'); bot.setAttribute('stroke-width', 1);
    rectSvg.appendChild(bot);
  }
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

/* ---------- 7 年级实验：共用小工具 ----------
   g7sup：把指数写成上标（10⁸、2¹⁰、10⁻⁴）；g7sgn：负数写成 −3 的样子。 */
function g7sup(n) { var m = {'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'}; return String(n).split('').map(function (c) { return m[c]; }).join(''); }
function g7sgn(n) { return n < 0 ? '−' + (-n) : String(n); }

/* ---------- demo-numline · 7.1/7.2 有理数与数轴（方法：数轴排队 + 走路） ----------
   标一标：点一个数，看它在数轴上的位置、相反数（关于原点对称的点）和绝对值
   （到原点的距离）。走一走：从起点出发，加法向右走、减法向左走，停在哪答案就是哪。
   默认 −4+7：从 −4 向右走 7 步，停在 3。 */
let nlMode = 'mark', nlVal = -3, nlA = -4, nlB = 7;
function nlX(v) { return 320 + v * 30; }
function nlRender() {
  document.getElementById('nlMarkBox').hidden = nlMode !== 'mark';
  document.getElementById('nlWalkBox').hidden = nlMode !== 'walk';
  document.getElementById('nlValTx').textContent = '这个数是 ' + g7sgn(nlVal);
  document.getElementById('nlATx').textContent = '从 ' + g7sgn(nlA) + ' 出发';
  document.getElementById('nlBTx').textContent = (nlB >= 0 ? '向右走 ' + nlB + ' 步' : '向左走 ' + (-nlB) + ' 步');
  document.querySelectorAll('#nlModeSeg [data-nl-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.nlMode === nlMode));
  });
  const dot = document.getElementById('nlDot'), opp = document.getElementById('nlOppDot');
  const start = document.getElementById('nlStartDot'), arrow = document.getElementById('nlArrow');
  const read = document.getElementById('nlRead');
  if (nlMode === 'mark') {
    dot.setAttribute('cx', nlX(nlVal)); dot.setAttribute('cy', 70);
    opp.setAttribute('cx', nlX(-nlVal)); opp.setAttribute('cy', 70);
    opp.style.display = ''; start.style.display = 'none'; arrow.style.display = 'none';
    read.textContent = nlVal === 0
      ? '0 在原点上：它的相反数还是 0，|0| = 0。'
      : g7sgn(nlVal) + ' 在原点' + (nlVal < 0 ? '左边' : '右边') + ' ' + Math.abs(nlVal) + ' 个单位：它的相反数是 ' + g7sgn(-nlVal) + '，到原点的距离是 ' + Math.abs(nlVal) + '，所以 |' + g7sgn(nlVal) + '| = ' + Math.abs(nlVal) + '。';
  } else {
    const end = nlA + nlB;
    start.setAttribute('cx', nlX(nlA)); start.setAttribute('cy', 70);
    dot.setAttribute('cx', nlX(end)); dot.setAttribute('cy', 70);
    opp.style.display = 'none'; start.style.display = '';
    arrow.style.display = '';
    const x1 = nlX(nlA), x2 = nlX(end);
    arrow.setAttribute('d', nlB === 0 ? '' : 'M ' + x1 + ' 62 Q ' + ((x1 + x2) / 2) + ' 18 ' + x2 + ' 62');
    read.textContent = g7sgn(nlA) + (nlB >= 0 ? ' + ' : ' − ') + Math.abs(nlB) + '：从 ' + g7sgn(nlA) + ' 出发，' +
      (nlB === 0 ? '原地不动' : (nlB > 0 ? '向右走 ' + nlB + ' 步' : '向左走 ' + (-nlB) + ' 步')) + '，停在 ' + g7sgn(end) + '。';
  }
}
(function nlInit() {
  const ticks = document.getElementById('nlTicks');
  for (let v = -10; v <= 10; v++) {
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    t.setAttribute('x1', nlX(v)); t.setAttribute('x2', nlX(v));
    t.setAttribute('y1', 64); t.setAttribute('y2', 76);
    t.setAttribute('stroke', '#1e293b'); t.setAttribute('stroke-width', 2);
    ticks.appendChild(t);
    const lab = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    lab.setAttribute('x', nlX(v)); lab.setAttribute('y', 96);
    lab.setAttribute('text-anchor', 'middle'); lab.setAttribute('font-size', 13);
    lab.textContent = String(v);
    ticks.appendChild(lab);
  }
  const modeSeg = document.getElementById('nlModeSeg');
  [['mark', '标一标：相反数和绝对值'], ['walk', '走一走：加减法']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.nlMode = m[0];
    b.addEventListener('click', function () { nlMode = m[0]; markTried('numline'); nlRender(); });
    modeSeg.appendChild(b);
  });
  document.getElementById('nlValMinus').addEventListener('click', function () { if (nlVal > -5) nlVal--; markTried('numline'); nlRender(); });
  document.getElementById('nlValPlus').addEventListener('click', function () { if (nlVal < 5) nlVal++; markTried('numline'); nlRender(); });
  document.getElementById('nlAMinus').addEventListener('click', function () { if (nlA > -5) nlA--; if (nlA + nlB > 10) nlB = 10 - nlA; if (nlA + nlB < -10) nlB = -10 - nlA; markTried('numline'); nlRender(); });
  document.getElementById('nlAPlus').addEventListener('click', function () { if (nlA < 5) nlA++; if (nlA + nlB > 10) nlB = 10 - nlA; if (nlA + nlB < -10) nlB = -10 - nlA; markTried('numline'); nlRender(); });
  document.getElementById('nlBMinus').addEventListener('click', function () { if (nlB > -9) nlB--; if (nlA + nlB < -10) nlB = -10 - nlA; markTried('numline'); nlRender(); });
  document.getElementById('nlBPlus').addEventListener('click', function () { if (nlB < 9) nlB++; if (nlA + nlB > 10) nlB = 10 - nlA; markTried('numline'); nlRender(); });
  nlRender();
})();

/* ---------- demo-powerup · 7.3 乘方与科学记数法（方法：对折纸 + 移小数点） ----------
   对折：纸厚 0.1 毫米，对折一次厚度翻一倍，n 次就是 2ⁿ 倍。10 次是 1024 倍，
   0.1×1024 = 102.4 毫米，大约 10 厘米。科学记数法：小数点移几位，10 的指数就是几；
   大数指数是正的，小数指数是负的，a 必须在 1 和 10 之间。 */
let puMode = 'fold', puFolds = 10, puNum = 'big', puShift = 8;
function puRender() {
  document.getElementById('puFoldBox').hidden = puMode !== 'fold';
  document.getElementById('puSciBox').hidden = puMode !== 'sci';
  document.getElementById('puFoldTx').textContent = '对折 ' + puFolds + ' 次';
  document.getElementById('puShiftTx').textContent = '小数点移动了 ' + puShift + ' 位';
  document.querySelectorAll('#puModeSeg [data-pu-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.puMode === puMode));
  });
  document.querySelectorAll('#puNumSeg [data-pu-num]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.puNum === puNum));
  });
  const read = document.getElementById('puRead');
  if (puMode === 'fold') {
    const times = Math.pow(2, puFolds), mm = 0.1 * times;
    document.getElementById('puBar').style.height = Math.max(2, Math.min(100, mm / 102.4 * 100)) + '%';
    read.textContent = '对折 ' + puFolds + ' 次：厚度是原来的 2' + g7sup(puFolds) + ' = ' + times + ' 倍：0.1 毫米 × ' + times + ' = ' + g6fmt(mm) + ' 毫米' +
      (mm >= 10 ? '，大约 ' + g6fmt(mm / 10) + ' 厘米' : '') + '。';
    document.getElementById('puMsg').textContent = '乘方是翻倍的增长：每多对折一次，厚度就再翻一倍——不是加 0.1 毫米，是乘 2。';
  } else {
    let a, ok, note;
    if (puNum === 'big') {
      a = 360000000 / Math.pow(10, puShift);
      ok = a >= 1 && a < 10;
      note = ok ? 'a = ' + g6fmt(a) + '，在 1 和 10 之间，写对了。' : (a >= 10 ? 'a = ' + g6fmt(a) + '，太大了：小数点还要往左移。' : 'a = ' + g6fmt(a) + '，太小了（要 ≥1）：移过头了，往右移一位。');
      read.textContent = '360000000 = ' + g6fmt(a) + '×10' + g7sup(puShift) + '：' + note;
    } else {
      a = 0.00012 * Math.pow(10, puShift);
      ok = a >= 1 && a < 10;
      note = ok ? 'a = ' + g6fmt(a) + '，在 1 和 10 之间，写对了。' : (a < 1 ? 'a = ' + g6fmt(a) + '，太小了：小数点还要往右移。' : 'a = ' + g6fmt(a) + '，太大了：移过头了，往左移一位。');
      read.textContent = '0.00012 = ' + g6fmt(a) + '×10' + g7sup(-puShift) + '：' + note;
    }
    document.getElementById('puMsg').textContent = '小数点向左移，指数是正的；向右移，指数是负的——数本身没变，只是换了个写法。';
  }
}
(function puInit() {
  const modeSeg = document.getElementById('puModeSeg');
  [['fold', '对折纸：2ⁿ'], ['sci', '科学记数法']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.puMode = m[0];
    b.addEventListener('click', function () { puMode = m[0]; markTried('powerup'); puRender(); });
    modeSeg.appendChild(b);
  });
  const numSeg = document.getElementById('puNumSeg');
  [['big', '360000000'], ['small', '0.00012']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.puNum = m[0];
    b.addEventListener('click', function () { puNum = m[0]; puShift = m[0] === 'big' ? 8 : 4; markTried('powerup'); puRender(); });
    numSeg.appendChild(b);
  });
  document.getElementById('puFoldMinus').addEventListener('click', function () { if (puFolds > 0) puFolds--; markTried('powerup'); puRender(); });
  document.getElementById('puFoldPlus').addEventListener('click', function () { if (puFolds < 10) puFolds++; markTried('powerup'); puRender(); });
  document.getElementById('puShiftMinus').addEventListener('click', function () { if (puShift > 0) puShift--; markTried('powerup'); puRender(); });
  document.getElementById('puShiftPlus').addEventListener('click', function () { if (puShift < (puNum === 'big' ? 9 : 5)) puShift++; markTried('powerup'); puRender(); });
  puRender();
})();

/* ---------- demo-monomial · 7.4 整式（方法：拆零件） ----------
   单项式拆成“数字 × 字母 × 字母”：系数是数字因数，次数是所有字母的指数加起来。
   多项式拆成一排单项式：次数是最高次项的次数，项数是单项式的个数。
   −5a²b：系数 −5，次数 3（a 的 2 次 + b 的 1 次）。 */
const MN_MONO = [
  { label: '−5a²b', coeff: '−5', deg: 3, parts: ['−5', 'a²', 'b'], note: 'a 的 2 次 + b 的 1 次' },
  { label: '3x²', coeff: '3', deg: 2, parts: ['3', 'x²'], note: 'x 的 2 次' },
  { label: '2x²y', coeff: '2', deg: 3, parts: ['2', 'x²', 'y'], note: 'x 的 2 次 + y 的 1 次' },
  { label: '−xy', coeff: '−1', deg: 2, parts: ['−1', 'x', 'y'], note: '系数是 −1（1 不写出来），x 的 1 次 + y 的 1 次' },
  { label: '7', coeff: '7', deg: 0, parts: ['7'], note: '常数项，没有字母，次数是 0' },
  { label: '4a³b²', coeff: '4', deg: 5, parts: ['4', 'a³', 'b²'], note: 'a 的 3 次 + b 的 2 次' }
];
const MN_POLY = [
  { label: '3x²−2x+1', terms: ['3x²', '−2x', '+1'], deg: 2, count: 3, name: '二次三项式', top: 0 },
  { label: '4x³−3x²+2x−5', terms: ['4x³', '−3x²', '+2x', '−5'], deg: 3, count: 4, name: '三次四项式', top: 0 },
  { label: '2x³−x+4', terms: ['2x³', '−x', '+4'], deg: 3, count: 3, name: '三次三项式', top: 0 }
];
let mnMode = 'mono', mnIdx = 0;
function mnRender() {
  const items = mnMode === 'mono' ? MN_MONO : MN_POLY;
  if (mnIdx >= items.length) mnIdx = 0;
  const item = items[mnIdx];
  document.querySelectorAll('#mnModeSeg [data-mn-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.mnMode === mnMode));
  });
  const seg = document.getElementById('mnItemSeg');
  while (seg.firstChild) seg.removeChild(seg.firstChild);
  items.forEach(function (it, i) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = it.label; b.dataset.mnItem = String(i);
    b.setAttribute('aria-pressed', String(i === mnIdx));
    b.addEventListener('click', function () { mnIdx = i; markTried('monomial'); mnRender(); });
    seg.appendChild(b);
  });
  const chips = document.getElementById('mnChips');
  while (chips.firstChild) chips.removeChild(chips.firstChild);
  const read = document.getElementById('mnRead');
  if (mnMode === 'mono') {
    item.parts.forEach(function (p, i) {
      const c = document.createElement('span');
      c.className = 'g7-chip' + (i === 0 ? ' g7-chip-hot' : '');
      c.textContent = p;
      chips.appendChild(c);
    });
    read.textContent = '单项式 ' + item.label + '：系数是 ' + item.coeff + '（数字因数），次数是 ' + item.deg + '（' + item.note + '）。';
  } else {
    item.terms.forEach(function (t, i) {
      const c = document.createElement('span');
      c.className = 'g7-chip' + (i === item.top ? ' g7-chip-hot' : '');
      c.textContent = t;
      chips.appendChild(c);
    });
    read.textContent = '多项式 ' + item.label + '：一共 ' + item.count + ' 项，最高次项是 ' + item.terms[item.top] + '，次数是 ' + item.deg + '，是' + item.name + '。';
  }
}
(function mnInit() {
  const modeSeg = document.getElementById('mnModeSeg');
  [['mono', '单项式'], ['poly', '多项式']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.mnMode = m[0];
    b.addEventListener('click', function () { mnMode = m[0]; mnIdx = 0; markTried('monomial'); mnRender(); });
    modeSeg.appendChild(b);
  });
  mnRender();
})();

/* ---------- demo-liketerms · 7.5 整式的加减（方法：同筐合并 + 减号翻面） ----------
   同类项才能合并：字母相同、相同字母的指数也相同，系数相加，字母和指数不变。
   3a 和 2b 不是同类项，合不了。去括号：括号前面是“+”照抄，是“−”里面每一项都变号。
   5−(2a−3b) = 5−2a+3b；3x²+5x−2x²+x = x²+6x。 */
const LT_MERGE = [
  { expr: '3x²+5x−2x²+x', chips: [['3x²', '#fed7aa'], ['5x', '#bfdbfe'], ['−2x²', '#fed7aa'], ['+x', '#bfdbfe']], result: '3x²+5x−2x²+x = x²+6x', why: 'x² 和 x² 是一类，x 和 x 是一类：3−2 = 1 个 x²，5+1 = 6 个 x。' },
  { expr: '3a+5a−2a', chips: [['3a', '#bbf7d0'], ['5a', '#bbf7d0'], ['−2a', '#bbf7d0']], result: '3a+5a−2a = 6a', why: '都是 a：3+5−2 = 6 个 a。' },
  { expr: '3a+2b', chips: [['3a', '#bbf7d0'], ['2b', '#e9d5ff']], result: '3a+2b：合不了', why: '3a 和 2b 不是同类项：字母不一样，各是一类，谁也合不到谁身上，只能写成 3a+2b。' },
  { expr: '4y−2y+3y', chips: [['4y', '#99f6e4'], ['−2y', '#99f6e4'], ['3y', '#99f6e4']], result: '4y−2y+3y = 5y', why: '都是 y：4−2+3 = 5 个 y。' }
];
const LT_BRACKET = [
  { expr: '5−(2a−3b)', result: '5−(2a−3b) = 5−2a+3b', why: '括号前面是减号，里面的每一项都要变号：2a 变 −2a，−3b 变 +3b。' },
  { expr: '3x+(2x−1)', result: '3x+(2x−1) = 5x−1', why: '括号前面是加号，照抄就行：3x+2x−1 = 5x−1。' },
  { expr: '4−(a+2b)', result: '4−(a+2b) = 4−a−2b', why: '括号前面是减号：a 变 −a，+2b 变 −2b。' }
];
let ltMode = 'merge', ltIdx = 0, ltDone = false;
function ltRender() {
  const items = ltMode === 'merge' ? LT_MERGE : LT_BRACKET;
  if (ltIdx >= items.length) ltIdx = 0;
  const item = items[ltIdx];
  document.querySelectorAll('#ltModeSeg [data-lt-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.ltMode === ltMode));
  });
  const seg = document.getElementById('ltExprSeg');
  while (seg.firstChild) seg.removeChild(seg.firstChild);
  items.forEach(function (it, i) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = it.expr; b.dataset.ltExpr = String(i);
    b.setAttribute('aria-pressed', String(i === ltIdx));
    b.addEventListener('click', function () { ltIdx = i; ltDone = false; markTried('liketerms'); ltRender(); });
    seg.appendChild(b);
  });
  const chips = document.getElementById('ltChips');
  while (chips.firstChild) chips.removeChild(chips.firstChild);
  const go = document.getElementById('ltGo');
  const read = document.getElementById('ltRead');
  if (ltMode === 'merge') {
    item.chips.forEach(function (ch) {
      const c = document.createElement('span');
      c.className = 'g7-chip';
      c.style.background = ch[1];
      c.textContent = ch[0];
      chips.appendChild(c);
    });
    go.textContent = '合并同类项';
    read.textContent = ltDone ? item.result + '。' + item.why
      : '点“合并同类项”，看看哪些能合到一起：同一种颜色的是一类。';
  } else {
    const c = document.createElement('span');
    c.className = 'g7-chip';
    c.textContent = item.expr;
    chips.appendChild(c);
    go.textContent = '去掉括号';
    read.textContent = ltDone ? item.result + '。' + item.why
      : '点“去掉括号”，看看括号里的符号怎么变。';
  }
}
(function ltInit() {
  const modeSeg = document.getElementById('ltModeSeg');
  [['merge', '合并同类项'], ['bracket', '去括号']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.ltMode = m[0];
    b.addEventListener('click', function () { ltMode = m[0]; ltIdx = 0; ltDone = false; markTried('liketerms'); ltRender(); });
    modeSeg.appendChild(b);
  });
  document.getElementById('ltGo').addEventListener('click', function () { ltDone = true; markTried('liketerms'); ltRender(); });
  ltRender();
})();

/* ---------- demo-meetline · 7.7 实际问题与一元一次方程（方法：等量关系拼图） ----------
   甲乙相向而行：甲每小时 15 千米，乙每小时 25 千米，两地相距 120 千米。
   甲走的路程 + 乙走的路程 = 全程：15t + 25t = 120，t = 3 小时相遇，相遇点离甲 45 千米。
   t = 2 时：甲 30 千米，乙 50 千米，合起来 80 千米，还差 40 千米。 */
let mtT = 3;
function mtRender() {
  document.getElementById('mtTx').textContent = '走了 ' + g6fmt(mtT) + ' 小时';
  const aKm = 15 * mtT, bKm = 25 * mtT, sum = aKm + bKm;
  document.getElementById('mtDotA').setAttribute('cx', 40 + aKm * 4.6);
  document.getElementById('mtDotB').setAttribute('cx', 592 - bKm * 4.6);
  document.getElementById('mtTxA').setAttribute('x', 40 + aKm * 4.6);
  document.getElementById('mtTxB').setAttribute('x', 592 - bKm * 4.6);
  document.getElementById('mtTxA').textContent = '甲 ' + g6fmt(aKm) + ' 千米';
  document.getElementById('mtTxB').textContent = '乙 ' + g6fmt(bKm) + ' 千米';
  document.getElementById('mtEq').textContent = '15×' + g6fmt(mtT) + ' + 25×' + g6fmt(mtT) + ' = ' + g6fmt(sum) + '（千米）';
  document.getElementById('mtRead').textContent = mtT === 0
    ? '还没出发：甲在 0 千米处，乙在 120 千米处。方程是 15t + 25t = 120。'
    : sum < 120
      ? 't = ' + g6fmt(mtT) + ' 小时：甲走了 15×' + g6fmt(mtT) + ' = ' + g6fmt(aKm) + ' 千米，乙走了 25×' + g6fmt(mtT) + ' = ' + g6fmt(bKm) + ' 千米，合起来 ' + g6fmt(sum) + ' 千米，还差 ' + g6fmt(120 - sum) + ' 千米。'
      : 't = 3 小时：甲走了 45 千米，乙走了 75 千米，合起来 120 千米，正好相遇！15t + 25t = 120，t = 3。';
}
(function mtInit() {
  document.getElementById('mtTMinus').addEventListener('click', function () { if (mtT > 0) mtT = Math.round((mtT - 0.5) * 10) / 10; markTried('meetline'); mtRender(); });
  document.getElementById('mtTPlus').addEventListener('click', function () { if (mtT < 3) mtT = Math.round((mtT + 0.5) * 10) / 10; markTried('meetline'); mtRender(); });
  mtRender();
})();

/* ---------- demo-lineseg · 7.8 直线、射线、线段（方法：点线面体动画） ----------
   直线没有端点，向两边无限长；射线有一个端点，向一方无限长；线段有两个端点，
   能量出长度：AB = 5 厘米。两点确定一条直线；两点之间，线段最短。 */
let sgMode = 'seg', sgCurve = false;
function sgRender() {
  document.querySelectorAll('#sgModeSeg [data-sg-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.sgMode === sgMode));
  });
  document.getElementById('sgLine').style.display = sgMode === 'line' ? '' : 'none';
  document.getElementById('sgRayA').style.display = sgMode === 'rayab' ? '' : 'none';
  document.getElementById('sgRayB').style.display = sgMode === 'rayba' ? '' : 'none';
  document.getElementById('sgSeg').style.display = sgMode === 'seg' ? '' : 'none';
  document.getElementById('sgCurve').style.display = sgCurve ? '' : 'none';
  document.getElementById('sgCurveBtn').setAttribute('aria-pressed', String(sgCurve));
  const base = {
    line: '直线 AB：没有端点，向两边无限长，量不出长度。经过 A、B 两点只能画 1 条直线。',
    rayab: '射线 AB：只有 A 这一个端点，从 A 出发经过 B，向右无限长，量不出长度。',
    rayba: '射线 BA：只有 B 这一个端点，从 B 出发经过 A，向左无限长。',
    seg: '线段 AB：有两个端点 A 和 B，能量出长度：AB = 5 厘米。'
  }[sgMode];
  document.getElementById('sgRead').textContent = base + (sgCurve ? '弯路比直路长：走线段 AB 是 5 厘米，走弯路更长——两点之间，线段最短。' : '');
}
(function sgInit() {
  const modeSeg = document.getElementById('sgModeSeg');
  [['line', '直线'], ['rayab', '射线 AB'], ['rayba', '射线 BA'], ['seg', '线段 AB']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.sgMode = m[0];
    b.addEventListener('click', function () { sgMode = m[0]; markTried('lineseg'); sgRender(); });
    modeSeg.appendChild(b);
  });
  document.getElementById('sgCurveBtn').addEventListener('click', function () { sgCurve = !sgCurve; markTried('lineseg'); sgRender(); });
  sgRender();
})();

/* ---------- demo-anglepair · 7.9 角（方法：张开程度 + 凑满拼图） ----------
   余角凑满 90°，补角凑满 180°，角平分线把一个角分成两个相等的角。
   ∠A = 35°：余角 55°（35+55 = 90），补角 145°（35+145 = 180），平分后每个 17.5°。
   1° = 60′。 */
let apMode = 'comp', apAngle = 35;
function apRender() {
  if (apMode === 'comp' && apAngle > 85) apAngle = 85;
  document.getElementById('apAngleTx').textContent = '∠A = ' + apAngle + '°';
  document.querySelectorAll('#apModeSeg [data-ap-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.apMode === apMode));
  });
  const barA = document.getElementById('apBarA'), barB = document.getElementById('apBarB');
  const read = document.getElementById('apRead');
  if (apMode === 'comp') {
    const c = 90 - apAngle;
    barA.style.width = (apAngle / 90 * 100) + '%'; barB.style.width = (c / 90 * 100) + '%';
    barA.textContent = '∠A ' + apAngle + '°'; barB.textContent = '余角 ' + c + '°';
    read.textContent = '∠A = ' + apAngle + '°，它的余角是 ' + c + '°：' + apAngle + '°+' + c + '° = 90°，正好凑满一个直角。';
  } else if (apMode === 'supp') {
    const s = 180 - apAngle;
    barA.style.width = (apAngle / 180 * 100) + '%'; barB.style.width = (s / 180 * 100) + '%';
    barA.textContent = '∠A ' + apAngle + '°'; barB.textContent = '补角 ' + s + '°';
    read.textContent = '∠A = ' + apAngle + '°，它的补角是 ' + s + '°：' + apAngle + '°+' + s + '° = 180°，正好凑满一个平角。';
  } else {
    const h = apAngle / 2;
    barA.style.width = '50%'; barB.style.width = '50%';
    barA.textContent = g6fmt(h) + '°'; barB.textContent = g6fmt(h) + '°';
    read.textContent = '∠A = ' + apAngle + '°，角平分线把它分成两个相等的角，每个是 ' + g6fmt(h) + '°：' + g6fmt(h) + '°+' + g6fmt(h) + '° = ' + apAngle + '°。';
  }
}
(function apInit() {
  const modeSeg = document.getElementById('apModeSeg');
  [['comp', '余角：凑满 90°'], ['supp', '补角：凑满 180°'], ['bisect', '角平分线']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.apMode = m[0];
    b.addEventListener('click', function () { apMode = m[0]; markTried('anglepair'); apRender(); });
    modeSeg.appendChild(b);
  });
  document.getElementById('apAngleMinus').addEventListener('click', function () { if (apAngle > 5) apAngle -= 5; markTried('anglepair'); apRender(); });
  document.getElementById('apAnglePlus').addEventListener('click', function () { if (apAngle < (apMode === 'comp' ? 85 : 175)) apAngle += 5; markTried('anglepair'); apRender(); });
  apRender();
})();

/* ---------- demo-vertangle · 7.10 相交线（方法：对顶角亮灯 + 垂线段最短） ----------
   两条直线相交：对顶角相等，邻补角互补。∠1 = 50° 时 ∠2 = 130°、∠3 = 50°、∠4 = 130°。
   点到直线的距离是垂线段的长度：垂线段 5 厘米，斜线段 7 厘米、9 厘米，垂线段最短。 */
let vaMode = 'vert', vaAngle = 50, vaSeg = 0;
function vaRender() {
  document.getElementById('vaCrossBox').hidden = vaMode !== 'vert';
  document.getElementById('vaPerpBox').hidden = vaMode !== 'perp';
  document.getElementById('vaAngleTx').textContent = '∠1 = ' + vaAngle + '°';
  document.querySelectorAll('#vaModeSeg [data-va-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.vaMode === vaMode));
  });
  if (vaMode === 'vert') {
    const th = vaAngle * Math.PI / 180, L = 160, cx = 320, cy = 130;
    const dx = L * Math.cos(th), dy = L * Math.sin(th);
    const l2 = document.getElementById('vaLine2');
    l2.setAttribute('x1', cx - dx); l2.setAttribute('y1', cy + dy);
    l2.setAttribute('x2', cx + dx); l2.setAttribute('y2', cy - dy);
    const vals = [vaAngle, 180 - vaAngle, vaAngle, 180 - vaAngle];
    for (let i = 0; i < 4; i++) {
      document.getElementById('vaL' + (i + 1)).textContent = '∠' + (i + 1) + ' = ' + vals[i] + '°';
    }
    document.getElementById('vaRead').textContent =
      '∠1 = ' + vaAngle + '°，∠2 = ' + (180 - vaAngle) + '°，∠3 = ' + vaAngle + '°，∠4 = ' + (180 - vaAngle) + '°：对顶角相等（∠1 = ∠3），邻补角互补（∠1+∠2 = 180°）。';
  } else {
    const lens = [5, 7, 9], names = ['垂线段', '斜线段 1', '斜线段 2'];
    for (let i = 0; i < 3; i++) {
      const el = document.getElementById('vaSeg' + i);
      el.setAttribute('stroke', i === vaSeg ? '#ff8a3d' : '#94a3b8');
      el.setAttribute('stroke-width', i === vaSeg ? 5 : 3);
    }
    document.querySelectorAll('#vaSegSeg [data-va-seg]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(+btn.dataset.vaSeg === vaSeg));
    });
    document.getElementById('vaRead').textContent =
      names[vaSeg] + '长 ' + lens[vaSeg] + ' 厘米：垂线段 5 厘米最短，斜线段 7 厘米、9 厘米都比它长——点 P 到直线的距离是 5 厘米。';
  }
}
(function vaInit() {
  const modeSeg = document.getElementById('vaModeSeg');
  [['vert', '对顶角'], ['perp', '垂线段最短']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.vaMode = m[0];
    b.addEventListener('click', function () { vaMode = m[0]; markTried('vertangle'); vaRender(); });
    modeSeg.appendChild(b);
  });
  const segSeg = document.getElementById('vaSegSeg');
  ['垂线段 5 厘米', '斜线段 7 厘米', '斜线段 9 厘米'].forEach(function (label, i) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = label; b.dataset.vaSeg = String(i);
    b.addEventListener('click', function () { vaSeg = i; markTried('vertangle'); vaRender(); });
    segSeg.appendChild(b);
  });
  document.getElementById('vaAngleMinus').addEventListener('click', function () { if (vaAngle > 20) vaAngle -= 10; markTried('vertangle'); vaRender(); });
  document.getElementById('vaAnglePlus').addEventListener('click', function () { if (vaAngle < 160) vaAngle += 10; markTried('vertangle'); vaRender(); });
  vaRender();
})();

/* ---------- demo-parangles · 7.11 平行线与平移（方法：亮灯辨角法） ----------
   两条平行线被第三条直线所截：同位角相等、内错角相等、同旁内角互补。
   截线和水平线夹 70° 时：同位角 ∠4 = ∠8 = 70°；内错角 ∠3 = ∠5 = 110°；
   同旁内角 ∠4+∠5 = 70°+110° = 180°。把下面那条线转 15°，不平行了，角就不相等了。
   平移：图形整体向右滑，形状大小不变，每个点都走了同样的距离。 */
let plMode = 'corr', plAngle = 70, plPar = true, plDx = 3;
function plRender() {
  document.getElementById('plAngleBox').hidden = plMode === 'trans';
  document.getElementById('plTransBox').hidden = plMode !== 'trans';
  document.getElementById('plAngleTx').textContent = '截线夹角 ' + plAngle + '°';
  document.getElementById('plDxTx').textContent = '向右平移 ' + plDx + ' 格';
  document.querySelectorAll('#plPairSeg [data-pl-pair]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.plPair === plMode));
  });
  document.querySelectorAll('#plParSeg [data-pl-par]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String((btn.dataset.plPar === 'yes') === plPar));
  });
  const read = document.getElementById('plRead');
  if (plMode === 'trans') {
    const pts = [[140, 220], [200, 120], [260, 220]].map(function (p) { return (p[0] + plDx * 30) + ',' + p[1]; }).join(' ');
    document.getElementById('plTri').setAttribute('points', pts);
    document.getElementById('plTransArrow').setAttribute('x2', 140 + plDx * 30);
    read.textContent = '向右平移 ' + plDx + ' 格：三角形的形状、大小都没变，每个点都向右走了 ' + plDx + ' 格，对应点连线平行且相等。';
    return;
  }
  const a = plAngle, b = plPar ? a : a - 15;
  const rad = a * Math.PI / 180, dx = Math.cos(rad), dy = Math.sin(rad);
  const trans = document.getElementById('plTrans');
  trans.setAttribute('x1', 320 - 130 * dx); trans.setAttribute('y1', 150 - 130 * dy);
  trans.setAttribute('x2', 320 + 130 * dx); trans.setAttribute('y2', 150 + 130 * dy);
  const l2 = document.getElementById('plLine2');
  if (plPar) { l2.setAttribute('x1', 60); l2.setAttribute('y1', 210); l2.setAttribute('x2', 580); l2.setAttribute('y2', 210); }
  else { l2.setAttribute('x1', 68.8); l2.setAttribute('y1', 142.7); l2.setAttribute('x2', 571.2); l2.setAttribute('y2', 277.3); }
  // 两个交点：I1 在 y=90 的线上，I2 在 y=210 的线（平行时）或转了 15° 的线上。
  const i1x = 320 - 60 * dx / dy, i1y = 90;
  let i2x, i2y;
  if (plPar) { i2x = 320 + 60 * dx / dy; i2y = 210; }
  else {
    const ex = Math.cos(15 * Math.PI / 180), ey = Math.sin(15 * Math.PI / 180);
    const t = 60 * dx / (ex * dy - ey * dx);
    i2x = 320 + t * ex; i2y = 210 + t * ey;
  }
  const vals1 = [180 - a, a, 180 - a, a];
  const vals2 = [180 - b, b, 180 - b, b];
  const offs = [[34, -26], [-34, -26], [-34, 32], [34, 32]];
  for (let i = 0; i < 4; i++) {
    const t1 = document.getElementById('plT' + (i + 1));
    t1.setAttribute('x', i1x + offs[i][0]); t1.setAttribute('y', i1y + offs[i][1]);
    t1.textContent = '∠' + (i + 1) + ' ' + vals1[i] + '°';
    const t2 = document.getElementById('plT' + (i + 5));
    t2.setAttribute('x', i2x + offs[i][0]); t2.setAttribute('y', i2y + offs[i][1]);
    t2.textContent = '∠' + (i + 5) + ' ' + vals2[i] + '°';
  }
  const pair = { corr: [4, 8], alt: [3, 5], same: [4, 5] }[plMode];
  for (let i = 1; i <= 8; i++) {
    const t = document.getElementById('plT' + i);
    const on = pair.indexOf(i) >= 0;
    t.setAttribute('fill', on ? '#c2410c' : '#1e293b');
    t.setAttribute('font-weight', on ? 'bold' : 'normal');
  }
  if (plMode === 'corr') {
    read.textContent = plPar
      ? '同位角：∠4 = ' + a + '°，∠8 = ' + b + '°，它们相等——两直线平行，同位角相等。'
      : '同位角：∠4 = ' + a + '°，∠8 = ' + b + '°，不再相等——下面那条线转了 15°，不平行了，同位角就不相等了。';
  } else if (plMode === 'alt') {
    read.textContent = plPar
      ? '内错角：∠3 = ' + (180 - a) + '°，∠5 = ' + (180 - b) + '°，它们相等——两直线平行，内错角相等。'
      : '内错角：∠3 = ' + (180 - a) + '°，∠5 = ' + (180 - b) + '°，不再相等——不平行，内错角就不相等。';
  } else {
    read.textContent = plPar
      ? '同旁内角：∠4 = ' + a + '°，∠5 = ' + (180 - b) + '°，' + a + '°+' + (180 - b) + '° = 180°，互补——两直线平行，同旁内角互补。'
      : '同旁内角：∠4 = ' + a + '°，∠5 = ' + (180 - b) + '°，' + a + '°+' + (180 - b) + '° = ' + (a + 180 - b) + '°，不再互补。';
  }
}
(function plInit() {
  const pairSeg = document.getElementById('plPairSeg');
  [['corr', '同位角'], ['alt', '内错角'], ['same', '同旁内角'], ['trans', '平移']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.plPair = m[0];
    b.addEventListener('click', function () { plMode = m[0]; markTried('parangles'); plRender(); });
    pairSeg.appendChild(b);
  });
  const parSeg = document.getElementById('plParSeg');
  [['yes', '两条线平行'], ['no', '下面那条转 15°']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.plPar = m[0];
    b.addEventListener('click', function () { plPar = m[0] === 'yes'; markTried('parangles'); plRender(); });
    parSeg.appendChild(b);
  });
  document.getElementById('plAngleMinus').addEventListener('click', function () { if (plAngle > 40) plAngle -= 10; markTried('parangles'); plRender(); });
  document.getElementById('plAnglePlus').addEventListener('click', function () { if (plAngle < 80) plAngle += 10; markTried('parangles'); plRender(); });
  document.getElementById('plDxMinus').addEventListener('click', function () { if (plDx > 0) plDx--; markTried('parangles'); plRender(); });
  document.getElementById('plDxPlus').addEventListener('click', function () { if (plDx < 6) plDx++; markTried('parangles'); plRender(); });
  plRender();
})();

/* ---------- demo-roots · 7.12 实数（方法：对角线定位 + 开方机器） ----------
   正数有两个平方根，互为相反数；0 的平方根是 0；负数没有平方根。
   √16 = 4，16 的平方根是 ±4；³√27 = 3，³√(−8) = −2。
   边长是 1 的正方形，对角线长 √2 ≈ 1.414，落在 1 和 2 之间，是无限不循环小数。 */
const SQ_SETS = {
  sqrt: { vals: [4, 9, 16, 25, 36, -4], labels: ['4', '9', '16', '25', '36', '−4'] },
  cbrt: { vals: [8, 27, 64, -8, -27], labels: ['8', '27', '64', '−8', '−27'] },
  line: { vals: [2, 3, 5], labels: ['√2', '√3', '√5'] }
};
let sqMode = 'sqrt', sqA = 16;
function sqRender() {
  document.getElementById('sqLineBox').hidden = sqMode !== 'line';
  document.querySelectorAll('#sqModeSeg [data-sq-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.sqMode === sqMode));
  });
  const set = SQ_SETS[sqMode];
  if (set.vals.indexOf(sqA) < 0) sqA = set.vals[0];
  const seg = document.getElementById('sqASeg');
  while (seg.firstChild) seg.removeChild(seg.firstChild);
  set.vals.forEach(function (v, i) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = set.labels[i]; b.dataset.sqA = String(v);
    b.setAttribute('aria-pressed', String(v === sqA));
    b.addEventListener('click', function () { sqA = v; markTried('roots'); sqRender(); });
    seg.appendChild(b);
  });
  const read = document.getElementById('sqRead');
  if (sqMode === 'sqrt') {
    if (sqA < 0) {
      read.textContent = '−4 没有平方根：任何数的平方都不会是负数。';
    } else {
      const r = Math.sqrt(sqA);
      read.textContent = '√' + sqA + ' = ' + r + '，因为 ' + r + '² = ' + sqA + '；' + sqA + ' 的平方根是 ±' + r + '。';
    }
  } else if (sqMode === 'cbrt') {
    const r = Math.round(Math.cbrt(sqA));
    read.textContent = '³√(' + g7sgn(sqA) + ') = ' + g7sgn(r) + '，因为 (' + g7sgn(r) + ')³ = ' + g7sgn(sqA) + '。任何数都有一个立方根。';
  } else {
    const v = Math.sqrt(sqA), lo = Math.floor(v), hi = lo + 1;
    document.getElementById('sqDot').setAttribute('cx', 40 + v * 180);
    read.textContent = '边长是 1 的正方形，对角线长 √' + sqA + ' ≈ ' + v.toFixed(3) + '，落在 ' + lo + ' 和 ' + hi + ' 之间：√' + sqA + ' 是无限不循环小数，是无理数。';
  }
}
(function sqInit() {
  const modeSeg = document.getElementById('sqModeSeg');
  [['sqrt', '平方根'], ['cbrt', '立方根'], ['line', '√2 在数轴上哪']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.sqMode = m[0];
    b.addEventListener('click', function () { sqMode = m[0]; markTried('roots'); sqRender(); });
    modeSeg.appendChild(b);
  });
  sqRender();
})();

/* ---------- demo-coordplane · 7.13 平面直角坐标系（方法：编地址法） ----------
   点的位置用一对有序数对 (x, y) 表示：先横后纵。第一象限 (+,+)，第二象限 (−,+)，第
   三象限 (−,−)，第四象限 (+,−)；x 轴上的点纵坐标是 0，y 轴上的点横坐标是 0。
   (2,3) 关于 x 轴的对称点是 (2,−3)，关于 y 轴是 (−2,3)，关于原点是 (−2,−3)。 */
const XY_POINTS = [[2, 3], [-1, 2], [-2, -1], [3, -2], [0, 4], [3, 0]];
let xyIdx = 0, xySym = 'none';
function xyQuad(x, y) {
  if (y === 0) return '在 x 轴上';
  if (x === 0) return '在 y 轴上';
  return x > 0 ? (y > 0 ? '在第一象限' : '在第四象限') : (y > 0 ? '在第二象限' : '在第三象限');
}
function xyRender() {
  const p = XY_POINTS[xyIdx], x = p[0], y = p[1];
  document.getElementById('xyDot').setAttribute('cx', 260 + x * 52);
  document.getElementById('xyDot').setAttribute('cy', 260 - y * 52);
  document.getElementById('xyPtTx').textContent = '点 (' + g7sgn(x) + ',' + g7sgn(y) + ')';
  document.querySelectorAll('#xyPtSeg [data-xy-pt]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.xyPt === xyIdx));
  });
  document.querySelectorAll('#xySymSeg [data-xy-sym]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.xySym === xySym));
  });
  const ghost = document.getElementById('xyGhost');
  let read = '点 (' + g7sgn(x) + ',' + g7sgn(y) + ') ' + xyQuad(x, y) + '：横坐标是 ' + g7sgn(x) + '，纵坐标是 ' + g7sgn(y) + '。';
  if (xySym === 'none') {
    ghost.style.display = 'none';
  } else {
    const sp = xySym === 'x' ? [x, -y] : xySym === 'y' ? [-x, y] : [-x, -y];
    ghost.style.display = '';
    ghost.setAttribute('cx', 260 + sp[0] * 52);
    ghost.setAttribute('cy', 260 - sp[1] * 52);
    const name = xySym === 'x' ? 'x轴' : xySym === 'y' ? 'y轴' : '原点';
    const rule = xySym === 'x' ? '横坐标不变，纵坐标变号' : xySym === 'y' ? '纵坐标不变，横坐标变号' : '横、纵坐标都变号';
    read += sp[0] === x && sp[1] === y
      ? '关于' + name + '的对称点还是 (' + g7sgn(sp[0]) + ',' + g7sgn(sp[1]) + ')：它就在' + name + '上。'
      : '关于' + name + '的对称点是 (' + g7sgn(sp[0]) + ',' + g7sgn(sp[1]) + ')：' + rule + '。';
  }
  document.getElementById('xyRead').textContent = read;
}
(function xyInit() {
  const grid = document.getElementById('xyGrid');
  for (let v = -5; v <= 5; v++) {
    [['x1', 260 + v * 52, 'y1', 0, 'x2', 260 + v * 52, 'y2', 520],
     ['x1', 0, 'y1', 260 - v * 52, 'x2', 520, 'y2', 260 - v * 52]].forEach(function (a) {
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', a[1]); l.setAttribute('y1', a[3]);
      l.setAttribute('x2', a[5]); l.setAttribute('y2', a[7]);
      l.setAttribute('stroke', v === 0 ? '#1e293b' : '#e2e8f0');
      l.setAttribute('stroke-width', v === 0 ? 2 : 1);
      grid.appendChild(l);
    });
  }
  const ptSeg = document.getElementById('xyPtSeg');
  XY_POINTS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = '(' + g7sgn(p[0]) + ',' + g7sgn(p[1]) + ')'; b.dataset.xyPt = String(i);
    b.addEventListener('click', function () { xyIdx = i; markTried('coordplane'); xyRender(); });
    ptSeg.appendChild(b);
  });
  const symSeg = document.getElementById('xySymSeg');
  [['none', '不画对称点'], ['x', '关于 x 轴对称'], ['y', '关于 y 轴对称'], ['o', '关于原点对称']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.xySym = m[0];
    b.addEventListener('click', function () { xySym = m[0]; markTried('coordplane'); xyRender(); });
    symSeg.appendChild(b);
  });
  xyRender();
})();

/* ---------- demo-ineqline · 7.15 不等式与不等式组（方法：数轴画段法） ----------
   解不等式和解方程差不多，但两边同乘（或除以）一个负数时，不等号要变方向：
   −2x > 6，两边除以 −2，得 x < −3。空心圈是不包括这个点，实心点是包括。
   不等式组取公共部分：{x+2>0, 2x−1≤5} 的解是 −2 < x ≤ 3；{x>5, x<3} 无解。 */
const IQ_ONE = [
  { expr: '−2x > 6', steps: '两边同时除以 −2，不等号要变方向', sol: 'x < −3', open: true, dir: 'left', val: -3 },
  { expr: '2x − 3 < 5', steps: '先移项：2x < 8，再把系数化为 1', sol: 'x < 4', open: true, dir: 'left', val: 4 },
  { expr: '3x + 1 ≥ 7', steps: '先移项：3x ≥ 6，再把系数化为 1', sol: 'x ≥ 2', open: false, dir: 'right', val: 2 },
  { expr: 'x + 2 > 0', steps: '移项：x > −2', sol: 'x > −2', open: true, dir: 'right', val: -2 }
];
const IQ_SYS = [
  { a: 'x + 2 > 0', b: '2x − 1 ≤ 5', sa: 'x > −2', sb: 'x ≤ 3', sol: '−2 < x ≤ 3', lo: -2, loClosed: false, hi: 3, hiClosed: true, empty: false },
  { a: 'x − 1 > 2', b: '3x < 12', sa: 'x > 3', sb: 'x < 4', sol: '3 < x < 4', lo: 3, loClosed: false, hi: 4, hiClosed: false, empty: false },
  { a: 'x > 5', b: 'x < 3', sa: 'x > 5', sb: 'x < 3', sol: '无解', lo: 5, loClosed: false, hi: 3, hiClosed: false, empty: true }
];
let iqMode = 'one', iqIdx = 0;
function iqX(v) { return 320 + v * 50; }
function iqRender() {
  document.getElementById('iqOneBox').hidden = iqMode !== 'one';
  document.getElementById('iqSysBox').hidden = iqMode !== 'sys';
  document.querySelectorAll('#iqModeSeg [data-iq-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.iqMode === iqMode));
  });
  const items = iqMode === 'one' ? IQ_ONE : IQ_SYS;
  if (iqIdx >= items.length) iqIdx = 0;
  const seg = document.getElementById('iqExprSeg');
  while (seg.firstChild) seg.removeChild(seg.firstChild);
  items.forEach(function (it, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = iqMode === 'one' ? it.expr : '{' + it.a + '，' + it.b + '}';
    b.dataset.iqExpr = String(i);
    b.setAttribute('aria-pressed', String(i === iqIdx));
    b.addEventListener('click', function () { iqIdx = i; markTried('ineqline'); iqRender(); });
    seg.appendChild(b);
  });
  const read = document.getElementById('iqRead');
  if (iqMode === 'one') {
    const it = items[iqIdx];
    const ray = document.getElementById('iqRay'), dot = document.getElementById('iqDot');
    if (it.dir === 'left') { ray.setAttribute('x1', 20); ray.setAttribute('x2', iqX(it.val)); }
    else { ray.setAttribute('x1', iqX(it.val)); ray.setAttribute('x2', 620); }
    dot.setAttribute('cx', iqX(it.val));
    dot.setAttribute('fill', it.open ? '#fff' : '#ff8a3d');
    read.textContent = it.expr + '：' + it.steps + '，得 ' + it.sol + '。数轴上 ' + g7sgn(it.val) + ' 是' + (it.open ? '空心圈（不包括它）' : '实心点（包括它）') + '，往' + (it.dir === 'left' ? '左' : '右') + '画。';
  } else {
    const it = items[iqIdx];
    const rayA = document.getElementById('iqRayA'), rayB = document.getElementById('iqRayB');
    const dotA = document.getElementById('iqDotA'), dotB = document.getElementById('iqDotB');
    const over = document.getElementById('iqOverlap');
    rayA.setAttribute('x1', iqX(it.lo)); rayA.setAttribute('x2', 620);
    rayB.setAttribute('x1', 20); rayB.setAttribute('x2', iqX(it.hi));
    dotA.setAttribute('cx', iqX(it.lo)); dotA.setAttribute('fill', it.loClosed ? '#ff8a3d' : '#fff');
    dotB.setAttribute('cx', iqX(it.hi)); dotB.setAttribute('fill', it.hiClosed ? '#ff8a3d' : '#fff');
    if (it.empty) {
      over.style.display = 'none';
      read.textContent = it.a + ' 得 ' + it.sa + '；' + it.b + ' 得 ' + it.sb + '：两个没有公共部分，这个不等式组无解。';
    } else {
      over.style.display = '';
      over.setAttribute('x1', iqX(it.lo)); over.setAttribute('x2', iqX(it.hi));
      read.textContent = it.a + ' 得 ' + it.sa + '；' + it.b + ' 得 ' + it.sb + '：公共部分是 ' + it.sol + '，数轴上 ' + g7sgn(it.lo) + ' 是' + (it.loClosed ? '实心点' : '空心圈') + '、' + g7sgn(it.hi) + ' 是' + (it.hiClosed ? '实心点' : '空心圈') + '，中间那一段亮起来。';
    }
  }
}
(function iqInit() {
  ['iqTicks', 'iqTicksB'].forEach(function (gid) {
    const ticks = document.getElementById(gid);
    for (let v = -6; v <= 6; v++) {
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      t.setAttribute('x1', iqX(v)); t.setAttribute('x2', iqX(v));
      t.setAttribute('y1', 54); t.setAttribute('y2', 66);
      t.setAttribute('stroke', '#1e293b'); t.setAttribute('stroke-width', 2);
      ticks.appendChild(t);
      const lab = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lab.setAttribute('x', iqX(v)); lab.setAttribute('y', 86);
      lab.setAttribute('text-anchor', 'middle'); lab.setAttribute('font-size', 13);
      lab.textContent = String(v);
      ticks.appendChild(lab);
    }
  });
  const modeSeg = document.getElementById('iqModeSeg');
  [['one', '解一个不等式'], ['sys', '解不等式组']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.iqMode = m[0];
    b.addEventListener('click', function () { iqMode = m[0]; iqIdx = 0; markTried('ineqline'); iqRender(); });
    modeSeg.appendChild(b);
  });
  iqRender();
})();

/* ---------- demo-histogram · 7.16 统计调查与直方图（方法：随机抽样 + 分组数频数） ----------
   全班 40 人的身高（厘米）：140~145 有 3 人，145~150 有 4 人，150~155、155~160、
   160~165、165~170、170~175 各 5 人，175~180 有 4 人，180~185 有 3 人，185~190 有 1 人。
   10 厘米一组：140~150 有 7 人，150~160 有 10 人，160~170 有 10 人，170~180 有 9 人，
   180~190 有 4 人。频率 = 频数 ÷ 总数：140~145 这组是 3÷40 = 0.075。
   抽样 10 人（每 4 人抽 1 个）：每组人数变少，但形状差不多——样本要随机才有代表性。 */
const HG_ALL = [141, 143, 144, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 180, 182, 184, 186];
const HG_SAMPLE = [141, 147, 151, 155, 160, 164, 168, 172, 176, 182];
let hgGroup = 5, hgSet = 'all';
function hgRender() {
  document.querySelectorAll('#hgGroupSeg [data-hg-group]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.hgGroup === hgGroup));
  });
  document.querySelectorAll('#hgSetSeg [data-hg-set]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.hgSet === hgSet));
  });
  const data = hgSet === 'all' ? HG_ALL : HG_SAMPLE;
  const n = data.length;
  const bins = [];
  for (let lo = 140; lo < 190; lo += hgGroup) {
    const hi = lo + hgGroup;
    const c = data.filter(function (h) { return h >= lo && h < hi; }).length;
    bins.push({ lo: lo, hi: hi, c: c });
  }
  const bars = document.getElementById('hgBars');
  while (bars.firstChild) bars.removeChild(bars.firstChild);
  bins.forEach(function (bin) {
    const col = document.createElement('div');
    col.className = 'g7-hg-col';
    const bar = document.createElement('div');
    bar.className = 'g7-hg-bar';
    bar.style.height = Math.max(2, bin.c * 16) + 'px';
    const cnt = document.createElement('span');
    cnt.className = 'g7-hg-cnt';
    cnt.textContent = bin.c + ' 人';
    const lab = document.createElement('span');
    lab.className = 'g7-hg-lab';
    lab.textContent = bin.lo + '~' + bin.hi;
    col.appendChild(cnt);
    col.appendChild(bar);
    col.appendChild(lab);
    bars.appendChild(col);
  });
  const parts = bins.map(function (bin) { return bin.lo + '~' + bin.hi + '：' + bin.c + ' 人'; }).join('；');
  const first = bins[0];
  document.getElementById('hgRead').textContent =
    (hgSet === 'all' ? '全班 40 人' : '抽样 10 人') + '，每 ' + hgGroup + ' 厘米一组：' + parts + '。' +
    first.lo + '~' + first.hi + ' 这组的频率是 ' + first.c + '÷' + n + ' = ' + (Math.round(first.c / n * 1000) / 1000) + '。';
  document.getElementById('hgMsg').textContent = hgSet === 'all'
    ? '直方图的长方形之间没有空隙：身高是连续的数据；条形图的长方形之间有空隙。'
    : '只抽 10 人：每组的人数变少了，但形状和全班差不多——样本要随机、有代表性，结论才靠得住。';
}
(function hgInit() {
  const groupSeg = document.getElementById('hgGroupSeg');
  [[5, '5 厘米一组'], [10, '10 厘米一组']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.hgGroup = String(m[0]);
    b.addEventListener('click', function () { hgGroup = m[0]; markTried('histogram'); hgRender(); });
    groupSeg.appendChild(b);
  });
  const setSeg = document.getElementById('hgSetSeg');
  [['all', '全班 40 人'], ['sample', '抽样 10 人']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.hgSet = m[0];
    b.addEventListener('click', function () { hgSet = m[0]; markTried('histogram'); hgRender(); });
    setSeg.appendChild(b);
  });
  hgRender();
})();

/* ---------- demo-trisides · 8.1 三角形（方法：撕角拼图法 / 三边关系 + 内角和） ----------
   三边：a、b、c 三个步进器（2–10，默认 3、4、5）；能围成时画出三角形并报三个角
   （大约：前两个角四舍五入，第三个角按 180° 减，保证和是 180°）；围不成时画两条
   够不着的边，报哪条不等式不成立。多边形：n 边形（3–8）从一个顶点切成 (n−2) 个
   三角形，内角和 = (n−2)×180°。 */
let tsA = 3, tsB = 4, tsC = 5, tsMode = 'sides', tsN = 5;
function tsDeg(r) { return r * 180 / Math.PI; }
function tsCanClose() { return tsA + tsB > tsC && tsA + tsC > tsB && tsB + tsC > tsA; }
function tsRender() {
  document.querySelectorAll('#tsModeSeg [data-ts-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.tsMode === tsMode));
  });
  document.getElementById('tsSidesBox').hidden = tsMode !== 'sides';
  document.getElementById('tsPolyBox').hidden = tsMode !== 'poly';
  document.getElementById('tsATx').textContent = 'a = ' + tsA;
  document.getElementById('tsBTx').textContent = 'b = ' + tsB;
  document.getElementById('tsCTx').textContent = 'c = ' + tsC;
  document.getElementById('tsNTx').textContent = tsN + ' 边形';
  if (tsMode === 'poly') { tsPolyRender(); return; }
  const tri = document.getElementById('tsTri');
  const lA = document.getElementById('tsLineA'), lB = document.getElementById('tsLineB');
  const labA = document.getElementById('tsLabA'), labB = document.getElementById('tsLabB'), labC = document.getElementById('tsLabC');
  const sc = 24, ax = 70, ay = 225, bx = ax + sc * tsC;
  if (tsCanClose()) {
    tri.style.display = '';
    lA.style.display = 'none'; lB.style.display = 'none';
    const xrel = (tsB * tsB + tsC * tsC - tsA * tsA) / (2 * tsC);
    const h = Math.sqrt(Math.max(0, tsB * tsB - xrel * xrel));
    const cx = ax + sc * xrel, cy = ay - sc * h;
    tri.setAttribute('points', ax + ',' + ay + ' ' + bx + ',' + ay + ' ' + cx.toFixed(1) + ',' + cy.toFixed(1));
    labA.setAttribute('x', (bx + cx) / 2 + 14); labA.setAttribute('y', (ay + cy) / 2);
    labA.textContent = 'a=' + tsA;
    labB.setAttribute('x', (ax + cx) / 2 - 16); labB.setAttribute('y', (ay + cy) / 2);
    labB.textContent = 'b=' + tsB;
    labC.setAttribute('x', (ax + bx) / 2); labC.setAttribute('y', ay + 22);
    labC.textContent = 'c=' + tsC;
    const aA = Math.round(tsDeg(Math.acos((tsB * tsB + tsC * tsC - tsA * tsA) / (2 * tsB * tsC))));
    const aB = Math.round(tsDeg(Math.acos((tsA * tsA + tsC * tsC - tsB * tsB) / (2 * tsA * tsC))));
    const aC = 180 - aA - aB;
    document.getElementById('tsRead').textContent =
      tsA + '+' + tsB + '>' + tsC + '，' + tsA + '+' + tsC + '>' + tsB + '，' + tsB + '+' + tsC + '>' + tsA +
      '：能围成三角形。三个角大约是 ' + aA + '°、' + aB + '°、' + aC + '°，加起来是 180°。';
    document.getElementById('tsMsg').textContent = '三边关系：任意两边之和大于第三边。内角和永远是 180°。';
  } else {
    tri.style.display = 'none';
    lA.style.display = ''; lB.style.display = '';
    // 两条边够不着：从 A 出发的 b 边和从 B 出发的 a 边，端点之间留一道缝。
    lA.setAttribute('x1', ax); lA.setAttribute('y1', ay);
    lA.setAttribute('x2', ax + sc * tsB * 0.5); lA.setAttribute('y2', ay - sc * tsB * 0.866);
    lB.setAttribute('x1', bx); lB.setAttribute('y1', ay);
    lB.setAttribute('x2', bx - sc * tsA * 0.5); lB.setAttribute('y2', ay - sc * tsA * 0.866);
    labA.textContent = ''; labB.textContent = ''; labC.textContent = 'c=' + tsC;
    labC.setAttribute('x', (ax + bx) / 2); labC.setAttribute('y', ay + 22);
    const bad = [];
    if (tsA + tsB <= tsC) bad.push(tsA + '+' + tsB + '=' + (tsA + tsB) + '，不大于 ' + tsC);
    if (tsA + tsC <= tsB) bad.push(tsA + '+' + tsC + '=' + (tsA + tsC) + '，不大于 ' + tsB);
    if (tsB + tsC <= tsA) bad.push(tsB + '+' + tsC + '=' + (tsB + tsC) + '，不大于 ' + tsA);
    document.getElementById('tsRead').textContent = bad.join('；') + '：两条短边加起来还够不着第三边，围不起来。';
    document.getElementById('tsMsg').textContent = '三边关系是因为“两点之间线段最短”：两条短边加起来还没第三边长，就围不起来。';
  }
}
function tsPolyRender() {
  const svg = document.getElementById('tsPolySvg');
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  const cx = 320, cy = 130, r = 95;
  const pts = [];
  for (let i = 0; i < tsN; i++) {
    const ang = -Math.PI / 2 + i * 2 * Math.PI / tsN;
    pts.push([cx + r * Math.cos(ang), cy + r * Math.sin(ang)]);
  }
  const NS = 'http://www.w3.org/2000/svg';
  const poly = document.createElementNS(NS, 'polygon');
  poly.setAttribute('points', pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '));
  poly.setAttribute('fill', '#dbeafe'); poly.setAttribute('stroke', '#2563eb'); poly.setAttribute('stroke-width', 3);
  svg.appendChild(poly);
  for (let i = 2; i <= tsN - 2; i++) {
    const d = document.createElementNS(NS, 'line');
    d.setAttribute('x1', pts[0][0].toFixed(1)); d.setAttribute('y1', pts[0][1].toFixed(1));
    d.setAttribute('x2', pts[i][0].toFixed(1)); d.setAttribute('y2', pts[i][1].toFixed(1));
    d.setAttribute('stroke', '#ff8a3d'); d.setAttribute('stroke-width', 2); d.setAttribute('stroke-dasharray', '6 4');
    svg.appendChild(d);
  }
  const n = tsN - 2, sum = n * 180;
  document.getElementById('tsRead').textContent =
    tsN + ' 边形从一个顶点出发，可以切成 ' + n + ' 个三角形，内角和是 ' + n + '×180° = ' + sum + '°。';
  document.getElementById('tsMsg').textContent = '多边形内角和 = (n−2)×180°：切成几个三角形，就有几个 180°。';
}
(function tsInit() {
  const modeSeg = document.getElementById('tsModeSeg');
  [['sides', '三边围不围'], ['poly', '多边形内角和']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.tsMode = m[0];
    b.addEventListener('click', function () { tsMode = m[0]; markTried('trisides'); tsRender(); });
    modeSeg.appendChild(b);
  });
  function tsStepper(idMinus, idPlus, get, set, lo, hi) {
    document.getElementById(idMinus).addEventListener('click', function () { set(Math.max(lo, get() - 1)); markTried('trisides'); tsRender(); });
    document.getElementById(idPlus).addEventListener('click', function () { set(Math.min(hi, get() + 1)); markTried('trisides'); tsRender(); });
  }
  tsStepper('tsAMinus', 'tsAPlus', function () { return tsA; }, function (v) { tsA = v; }, 2, 10);
  tsStepper('tsBMinus', 'tsBPlus', function () { return tsB; }, function (v) { tsB = v; }, 2, 10);
  tsStepper('tsCMinus', 'tsCPlus', function () { return tsC; }, function (v) { tsC = v; }, 2, 10);
  tsStepper('tsNMinus', 'tsNPlus', function () { return tsN; }, function (v) { tsN = v; }, 3, 8);
  tsRender();
})();

/* ---------- demo-congruent · 8.2 全等三角形的判定（方法：边定形状法） ----------
   选一个判定条件：SSS、SAS、ASA、AAS、HL 五个能判定，SSA 和 AAA 两个不能。
   能判定的：左右两个三角形按条件画出来，边/角步进器一改，两个一起变，形状始终锁死。
   SSA：同一组数据（∠A=30°，AB=7，BC=5）能拼出两种三角形——sin C = 7×sin30°/5 = 0.7，
   C 是 44.4° 或 135.6°；形状一切换，右边的三角形就变一个样。
   AAA：三个角 50°、60°、70°，大小步进器一拉，形状一样、大小不一样。 */
let cgCond = 'sss', cgSide = 5, cgAng = 50, cgSsa = 1, cgScale = 1;
function cgRad(d) { return d * Math.PI / 180; }
function cgFromSides(a, b, c) {
  // a=BC（对角 A），b=CA，c=AB：A=(0,0)，B=(c,0)，C 按余弦定理算。
  const x = (b * b + c * c - a * a) / (2 * c);
  const h = Math.sqrt(Math.max(0, b * b - x * x));
  return [[0, 0], [c, 0], [x, h]];
}
function cgVerts(shape, scale) {
  // 返回 {v: 三个顶点（数学坐标，y 向上）, ang: 要标的角（度数，null 表示不标）}。
  const s = cgSide, a = cgAng;
  if (cgCond === 'sss') return { v: cgFromSides(s, s + 1, s + 2), ang: null };
  if (cgCond === 'sas') {
    const s2 = s + 1;
    return { v: [[0, 0], [s, 0], [s2 * Math.cos(cgRad(a)), s2 * Math.sin(cgRad(a))]], ang: a };
  }
  if (cgCond === 'asa') {
    const a3 = 180 - a - 60;
    const ac = s * Math.sin(cgRad(60)) / Math.sin(cgRad(a3));
    return { v: [[0, 0], [s, 0], [ac * Math.cos(cgRad(a)), ac * Math.sin(cgRad(a))]], ang: a };
  }
  if (cgCond === 'aas') {
    // 角 A=a，角 B=60°，对边 AC=s（角 B 的对边）。
    const a3 = 180 - a - 60;
    const ab = s * Math.sin(cgRad(a3)) / Math.sin(cgRad(60));
    return { v: [[0, 0], [ab, 0], [s * Math.cos(cgRad(a)), s * Math.sin(cgRad(a))]], ang: a };
  }
  if (cgCond === 'hl') {
    // 直角在 A：直角边 AC=3，斜边 BC=s，另一条直角边 = √(s²−9)。
    return { v: [[0, 0], [Math.sqrt(s * s - 9), 0], [0, 3]], ang: 90 };
  }
  if (cgCond === 'ssa') {
    // ∠A=30°，AB=7，BC=5：sin C = 0.7，C 是 44.4° 或 135.6°，两种形状。
    const cAng = shape === 1 ? 180 / Math.PI * Math.asin(0.7) : 180 - 180 / Math.PI * Math.asin(0.7);
    const bAng = 180 - 30 - cAng;
    const bSide = 10 * Math.sin(cgRad(bAng));
    return { v: [[0, 0], [7, 0], [bSide * Math.cos(cgRad(30)), bSide * Math.sin(cgRad(30))]], ang: 30 };
  }
  // aaa：三个角 50°、60°、70°，边长按 scale 缩放。
  const ab = 4 * (scale || 1);
  const ac = ab * Math.sin(cgRad(60)) / Math.sin(cgRad(70));
  return { v: [[0, 0], [ab, 0], [ac * Math.cos(cgRad(50)), ac * Math.sin(cgRad(50))]], ang: 50 };
}
function cgPlace(verts, ox, oy, maxW, maxH) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  verts.forEach(function (v) {
    minX = Math.min(minX, v[0]); maxX = Math.max(maxX, v[0]);
    minY = Math.min(minY, v[1]); maxY = Math.max(maxY, v[1]);
  });
  const sc = Math.min(maxW / Math.max(0.1, maxX - minX), maxH / Math.max(0.1, maxY - minY));
  const placed = verts.map(function (v) {
    return [ox + (v[0] - minX) * sc, oy + (maxY - v[1]) * sc];
  });
  return {
    points: placed.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '),
    placed: placed
  };
}
function cgDist(p, q) { return Math.sqrt((p[0] - q[0]) * (p[0] - q[0]) + (p[1] - q[1]) * (p[1] - q[1])); }
function cgRender() {
  document.querySelectorAll('#cgCondSeg [data-cg-cond]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.cgCond === cgCond));
  });
  document.querySelectorAll('#cgSsaSeg [data-cg-ssa]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.cgSsa === cgSsa));
  });
  document.getElementById('cgSideTx').textContent = '边 = ' + cgSide;
  document.getElementById('cgAngTx').textContent = '角 = ' + cgAng + '°';
  document.getElementById('cgScaleTx').textContent = '大小 ×' + cgScale;
  document.getElementById('cgSsaBox').hidden = cgCond !== 'ssa';
  document.getElementById('cgScaleBox').hidden = cgCond !== 'aaa';
  document.getElementById('cgStepBox').hidden = (cgCond === 'ssa' || cgCond === 'aaa');
  const leftSpec = cgVerts(1, 1);
  const rightSpec = cgCond === 'ssa' ? cgVerts(cgSsa, 1) : cgCond === 'aaa' ? cgVerts(1, cgScale) : cgVerts(1, 1);
  const left = cgPlace(leftSpec.v, 40, 40, 240, 180);
  const right = cgPlace(rightSpec.v, 360, 40, 240, 180);
  document.getElementById('cgTriA').setAttribute('points', left.points);
  document.getElementById('cgTriB').setAttribute('points', right.points);
  // 左三角形：标三条边长（按边长比例算，不直接写输入值）和已知的角。
  const pl = left.placed;
  const raw = leftSpec.v;
  const rawSides = [cgDist(raw[1], raw[2]), cgDist(raw[0], raw[2]), cgDist(raw[0], raw[1])];
  const labs = [document.getElementById('cgLabA'), document.getElementById('cgLabB'), document.getElementById('cgLabC')];
  const mids = [[(pl[1][0] + pl[2][0]) / 2 + 16, (pl[1][1] + pl[2][1]) / 2],
    [(pl[0][0] + pl[2][0]) / 2 - 18, (pl[0][1] + pl[2][1]) / 2],
    [(pl[0][0] + pl[1][0]) / 2, (pl[0][1] + pl[1][1]) / 2 + 20]];
  labs.forEach(function (lab, i) {
    lab.setAttribute('x', mids[i][0].toFixed(1)); lab.setAttribute('y', mids[i][1].toFixed(1));
    lab.textContent = fmtNum(rawSides[i]);
  });
  const angLab = document.getElementById('cgLabAng');
  if (leftSpec.ang === null) { angLab.textContent = ''; }
  else {
    angLab.setAttribute('x', pl[0][0] + 34); angLab.setAttribute('y', pl[0][1] - 8);
    angLab.textContent = '∠A=' + leftSpec.ang + '°';
  }
  // 右三角形：三条边也标出来，和左边同一套算法。SSA 形状二的第三边是 2.49，
  // 以前右边没有标签，两种形状的区别在图上看不出来。
  const pr = right.placed;
  const rawR = rightSpec.v;
  const rawSidesR = [cgDist(rawR[1], rawR[2]), cgDist(rawR[0], rawR[2]), cgDist(rawR[0], rawR[1])];
  const labsR = [document.getElementById('cgLabD'), document.getElementById('cgLabE'), document.getElementById('cgLabF')];
  const midsR = [[(pr[1][0] + pr[2][0]) / 2 + 16, (pr[1][1] + pr[2][1]) / 2],
    [(pr[0][0] + pr[2][0]) / 2 - 18, (pr[0][1] + pr[2][1]) / 2],
    [(pr[0][0] + pr[1][0]) / 2, (pr[0][1] + pr[1][1]) / 2 + 20]];
  labsR.forEach(function (lab, i) {
    lab.setAttribute('x', midsR[i][0].toFixed(1)); lab.setAttribute('y', midsR[i][1].toFixed(1));
    lab.textContent = fmtNum(rawSidesR[i]);
  });
  document.getElementById('cgShapeA').textContent = cgCond === 'ssa' ? '形状一' : '△1';
  document.getElementById('cgShapeB').textContent = cgCond === 'ssa' ? (cgSsa === 1 ? '形状一' : '形状二') : '△2';
  const s = cgSide, a = cgAng;
  let read = '', msg = '';
  if (cgCond === 'sss') {
    read = '三条边是 ' + s + '、' + (s + 1) + '、' + (s + 2) + '：边长定死了，形状就定死了——两个三角形一定全等（SSS）。';
    msg = '三条边定死了，三角形就定死了——边长不变，形状变不了，这就是 SSS 为什么够用。';
  } else if (cgCond === 'sas') {
    read = '两边是 ' + s + ' 和 ' + (s + 1) + '，夹角是 ' + a + '°：夹角定了，第三边就定了——两个三角形一定全等（SAS）。';
    msg = 'SAS 要的是夹角：两边张开的角度定了，第三边就定了；要是角不在两边中间，第三边还能晃。';
  } else if (cgCond === 'asa') {
    read = '两个角是 ' + a + '° 和 60°，夹边是 ' + s + '：两个三角形一定全等（ASA）。';
    msg = '两角和它们的夹边：角定了方向，边定了大小，三角形就锁死了。';
  } else if (cgCond === 'aas') {
    read = '两个角是 ' + a + '° 和 60°，其中一个角的对边是 ' + s + '：两个三角形一定全等（AAS）。';
    msg = 'AAS 和 ASA 是一回事：两个角定了，第三个角也定了，对边一量就知道大小。';
  } else if (cgCond === 'hl') {
    read = '直角三角形，斜边是 ' + s + '，一条直角边是 3：另一条直角边只能是 ' + fmtNum(Math.sqrt(s * s - 9)) + '——两个三角形一定全等（HL）。';
    msg = 'HL 只对直角三角形用：斜边和一条直角边定了，另一条直角边用勾股定理一算就出来了。';
  } else if (cgCond === 'ssa') {
    if (cgSsa === 1) {
      read = '形状一：∠A=30°，AB=7，BC=5。看起来和左边一样——别急，点“形状二”看看。';
      msg = 'SSA 的角要不是夹角，三角形还能晃出两种形状。';
    } else {
      read = '形状二：还是 ∠A=30°，AB=7，BC=5，可三角形变了：同一个条件能拼出两种三角形，SSA 不能判定全等。';
      msg = 'SSA 不行：那个角要不是夹角，三角形还能晃出两种形状。';
    }
  } else {
    read = '三个角都是 50°、60°、70°，可大小能变（现在 ×' + cgScale + '）：形状一样，大小不一定一样，AAA 不能判定全等。';
    msg = 'AAA 只能说明形状一样（相似），大小不一定一样。';
  }
  document.getElementById('cgRead').textContent = read;
  document.getElementById('cgMsg').textContent = msg;
}
(function cgInit() {
  const condSeg = document.getElementById('cgCondSeg');
  [['sss', 'SSS'], ['sas', 'SAS'], ['asa', 'ASA'], ['aas', 'AAS'], ['hl', 'HL'], ['ssa', 'SSA'], ['aaa', 'AAA']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.cgCond = m[0];
    b.addEventListener('click', function () { cgCond = m[0]; markTried('congruent'); cgRender(); });
    condSeg.appendChild(b);
  });
  const ssaSeg = document.getElementById('cgSsaSeg');
  [[1, '形状一'], [2, '形状二']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.cgSsa = String(m[0]);
    b.addEventListener('click', function () { cgSsa = m[0]; markTried('congruent'); cgRender(); });
    ssaSeg.appendChild(b);
  });
  document.getElementById('cgSideMinus').addEventListener('click', function () { cgSide = Math.max(3, cgSide - 1); markTried('congruent'); cgRender(); });
  document.getElementById('cgSidePlus').addEventListener('click', function () { cgSide = Math.min(8, cgSide + 1); markTried('congruent'); cgRender(); });
  document.getElementById('cgAngMinus').addEventListener('click', function () { cgAng = Math.max(30, cgAng - 5); markTried('congruent'); cgRender(); });
  document.getElementById('cgAngPlus').addEventListener('click', function () { cgAng = Math.min(80, cgAng + 5); markTried('congruent'); cgRender(); });
  document.getElementById('cgScaleMinus').addEventListener('click', function () { cgScale = Math.max(1, cgScale - 1); markTried('congruent'); cgRender(); });
  document.getElementById('cgScalePlus').addEventListener('click', function () { cgScale = Math.min(3, cgScale + 1); markTried('congruent'); cgRender(); });
  cgRender();
})();

/* ---------- demo-foldmirror · 8.3 轴对称 + 8.4 等腰三角形（方法：对折镜像法 / 对折重合法） ----------
   对折图形：沿一条直线翻过去——翻过去的图形（橙色）和原来那个完全重合，这条线才是
   对称轴；等腰三角形是重合的，直角三角形和旗形重合不了。坐标对称：点 (x,y) 关于
   x 轴 / y 轴 / 原点的对称点。等腰对折：沿顶角平分线对折，两个底角重合，三线合一。 */
let fmMode = 'fold', fmShape = 'iso', fmFolded = false, fmX = 2, fmY = -3, fmSym = 'x', fmBase = 70, fmIsoFolded = false;
function fmMirrorX(x) { return 640 - x; }
function fmRender() {
  document.querySelectorAll('#fmModeSeg [data-fm-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.fmMode === fmMode));
  });
  document.querySelectorAll('#fmShapeSeg [data-fm-shape]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.fmShape === fmShape));
  });
  document.querySelectorAll('#fmSymSeg [data-fm-sym]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.fmSym === fmSym));
  });
  document.getElementById('fmFoldBox').hidden = fmMode !== 'fold';
  document.getElementById('fmCoordBox').hidden = fmMode !== 'coord';
  document.getElementById('fmIsoBox').hidden = fmMode !== 'isosceles';
  document.getElementById('fmFoldBtn').textContent = fmFolded ? '展开' : '对折';
  document.getElementById('fmIsoFoldBtn').textContent = fmIsoFolded ? '展开' : '对折';
  document.getElementById('fmXTx').textContent = 'x = ' + fmX;
  document.getElementById('fmYTx').textContent = 'y = ' + fmY;
  document.getElementById('fmBaseTx').textContent = '底角 = ' + fmBase + '°';
  let read = '', msg = '';
  if (fmMode === 'fold') {
    // 形状（左半边在轴线左边画不全？不：整图形画出来，翻过去看它和自己重不重合）。
    const shapes = {
      iso: [[320, 60], [180, 220], [460, 220]],
      right: [[200, 60], [200, 220], [460, 220]],
      flag: [[300, 60], [300, 120], [420, 90]]
    };
    const pts = shapes[fmShape];
    const poly = document.getElementById('fmShape');
    poly.setAttribute('points', pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' '));
    document.getElementById('fmPole').style.display = fmShape === 'flag' ? '' : 'none';
    const mir = document.getElementById('fmMirror');
    mir.setAttribute('points', pts.map(function (p) { return fmMirrorX(p[0]) + ',' + p[1]; }).join(' '));
    mir.style.display = fmFolded ? '' : 'none';
    document.getElementById('fmMirrorPole').style.display = (fmShape === 'flag' && fmFolded) ? '' : 'none';
    const conns = [document.getElementById('fmConnA'), document.getElementById('fmConnB'), document.getElementById('fmConnC')];
    conns.forEach(function (ln, i) {
      ln.style.display = fmFolded ? '' : 'none';
      ln.setAttribute('x1', pts[i][0]); ln.setAttribute('y1', pts[i][1]);
      ln.setAttribute('x2', fmMirrorX(pts[i][0])); ln.setAttribute('y2', pts[i][1]);
    });
    if (!fmFolded) {
      read = fmShape === 'iso' ? '这是一个等腰三角形，沿中间这条虚线对折，两边会怎么样？点“对折”看看。'
        : fmShape === 'right' ? '这是一个直角三角形（两条直角边不一样长），沿中间这条虚线对折，会重合吗？点“对折”看看。'
        : '这是一面小旗，沿中间这条虚线对折，旗子会指到哪边？点“对折”看看。';
      msg = '轴对称：沿一条直线对折，两边完全重合；这条直线叫对称轴。';
    } else if (fmShape === 'iso') {
      read = '对折后完全重合：橙色的翻过来的三角形和原来那个一模一样，这条线就是它的对称轴。';
      msg = '对应点连线被对称轴垂直平分：对应点到对称轴的距离相等。';
    } else if (fmShape === 'right') {
      read = '对折后重合不了：直角边一边长、一边短，橙色的三角形歪到一边去了——这条线不是对称轴。';
      msg = '不是每条线都是对称轴：对折后必须完全重合才算。';
    } else {
      read = '对折后重合不了：旗子翻过去指反了——这条线不是对称轴。';
      msg = '镜子里的左手是右手：轴对称的两个图形也是一一对应的镜像。';
    }
  } else if (fmMode === 'coord') {
    const mx = fmSym === 'x' ? fmX : fmSym === 'y' ? -fmX : -fmX;
    const my = fmSym === 'x' ? -fmY : fmSym === 'y' ? fmY : -fmY;
    const px = function (v) { return 320 + v * 26; }, py = function (v) { return 150 - v * 26; };
    const dot = document.getElementById('fmDot'), dotM = document.getElementById('fmDotM');
    dot.setAttribute('cx', px(fmX)); dot.setAttribute('cy', py(fmY));
    dotM.setAttribute('cx', px(mx)); dotM.setAttribute('cy', py(my));
    const cl = document.getElementById('fmConnLine');
    cl.setAttribute('x1', px(fmX)); cl.setAttribute('y1', py(fmY));
    cl.setAttribute('x2', px(mx)); cl.setAttribute('y2', py(my));
    const names = { x: 'x 轴', y: 'y 轴', o: '原点' };
    const rules = { x: '横坐标不变，纵坐标变号', y: '纵坐标不变，横坐标变号', o: '横、纵坐标都变号' };
    read = '(' + fmX + ',' + fmY + ') 关于' + names[fmSym] + '的对称点是 (' + mx + ',' + my + ')：' + rules[fmSym] + '。';
    msg = '对应点连线被对称轴垂直平分：两个点到对称轴的距离相等。';
  } else {
    const top = 180 - 2 * fmBase;
    const half = 180 * Math.tan((top / 2) * Math.PI / 180);
    const ax = 320, ay = 50, by = 230;
    const blx = ax - half, brx = ax + half;
    const tri = document.getElementById('fmIsoTri');
    tri.setAttribute('points', ax + ',' + ay + ' ' + blx.toFixed(1) + ',' + by + ' ' + brx.toFixed(1) + ',' + by);
    const bis = document.getElementById('fmIsoBisect');
    bis.setAttribute('x1', ax); bis.setAttribute('y1', ay);
    bis.setAttribute('x2', ax); bis.setAttribute('y2', by);
    const mir = document.getElementById('fmIsoMirror');
    // 左半边（顶点、底边左端、底边中点）沿平分线翻过去。
    mir.setAttribute('points', ax + ',' + ay + ' ' + (640 - blx).toFixed(1) + ',' + by + ' ' + ax + ',' + by);
    mir.style.display = fmIsoFolded ? '' : 'none';
    const lt = document.getElementById('fmIsoLabTop');
    lt.setAttribute('x', ax); lt.setAttribute('y', ay + 26);
    lt.textContent = '顶角 ' + top + '°';
    const ll = document.getElementById('fmIsoLabL');
    ll.setAttribute('x', blx + 30); ll.setAttribute('y', by - 8);
    ll.textContent = '底角 ' + fmBase + '°';
    const lr = document.getElementById('fmIsoLabR');
    lr.setAttribute('x', brx - 30); lr.setAttribute('y', by - 8);
    lr.textContent = '底角 ' + fmBase + '°';
    if (!fmIsoFolded) {
      read = '等腰三角形：底角是 ' + fmBase + '°，顶角是 ' + top + '°。沿顶角平分线（虚线）对折，两个底角会重合吗？点“对折”看看。';
      msg = '等腰三角形对折后两边重合，所以底角相等——都是一次对折看出来的。';
    } else {
      read = '对折后两个底角重合：等边对等角。顶角平分线、底边上的中线、底边上的高是同一条线（三线合一）。';
      msg = '等边三角形是“最对称”的三角形：三个角都是 60°，有 3 条对称轴。';
    }
  }
  document.getElementById('fmRead').textContent = read;
  document.getElementById('fmMsg').textContent = msg;
}
(function fmInit() {
  const modeSeg = document.getElementById('fmModeSeg');
  [['fold', '对折图形'], ['coord', '坐标对称点'], ['isosceles', '等腰三角形对折']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.fmMode = m[0];
    b.addEventListener('click', function () { fmMode = m[0]; markTried('foldmirror'); fmRender(); });
    modeSeg.appendChild(b);
  });
  const shapeSeg = document.getElementById('fmShapeSeg');
  [['iso', '等腰三角形'], ['right', '直角三角形'], ['flag', '小旗']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.fmShape = m[0];
    b.addEventListener('click', function () { fmShape = m[0]; fmFolded = false; markTried('foldmirror'); fmRender(); });
    shapeSeg.appendChild(b);
  });
  const symSeg = document.getElementById('fmSymSeg');
  [['x', '关于 x 轴'], ['y', '关于 y 轴'], ['o', '关于原点']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.fmSym = m[0];
    b.addEventListener('click', function () { fmSym = m[0]; markTried('foldmirror'); fmRender(); });
    symSeg.appendChild(b);
  });
  document.getElementById('fmFoldBtn').addEventListener('click', function () { fmFolded = !fmFolded; markTried('foldmirror'); fmRender(); });
  document.getElementById('fmIsoFoldBtn').addEventListener('click', function () { fmIsoFolded = !fmIsoFolded; markTried('foldmirror'); fmRender(); });
  function fmStepper(idMinus, idPlus, get, set, lo, hi) {
    document.getElementById(idMinus).addEventListener('click', function () { set(Math.max(lo, get() - 1)); markTried('foldmirror'); fmRender(); });
    document.getElementById(idPlus).addEventListener('click', function () { set(Math.min(hi, get() + 1)); markTried('foldmirror'); fmRender(); });
  }
  fmStepper('fmXMinus', 'fmXPlus', function () { return fmX; }, function (v) { fmX = v; }, -5, 5);
  fmStepper('fmYMinus', 'fmYPlus', function () { return fmY; }, function (v) { fmY = v; }, -5, 5);
  fmStepper('fmBaseMinus', 'fmBasePlus', function () { return fmBase; }, function (v) { fmBase = v; }, 30, 80);
  fmRender();
})();

/* ---------- demo-algarea · 8.5 幂的运算与整式乘法 + 8.6 乘法公式 + 8.7 因式分解 ----------
   面积模型：(x+a)(x+b) 切成 x²、ax、bx、ab 四块；乘法公式：(a+b)²、(a−b)²、
   (a+b)(a−b) 三张面积图；因式分解是乘法的逆运算：给出 x²+px+q，猜两个因数，
   相乘是 q、相加是 p 才对。幂的运算：a 的个数数一数——同底数幂相乘指数加，
   幂的乘方指数乘。 */
let aaMode = 'power', aaPowKind = 'mul', aaM = 3, aaN = 2;
let aaMulA = 2, aaMulB = 3, aaFormKind = 'sqplus', aaFormA = 5, aaFormB = 2;
let aaFacIdx = 0, aaF1 = 1, aaF2 = 1;
const AA_FAC = [[2, 3], [3, 4], [2, 5], [1, 6]];
function aaRepeat(s, n) { const arr = []; for (let i = 0; i < n; i++) arr.push(s); return arr.join('·'); }
function aaRender() {
  document.querySelectorAll('#aaModeSeg [data-aa-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.aaMode === aaMode));
  });
  document.querySelectorAll('#aaPowSeg [data-aa-pow]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.aaPow === aaPowKind));
  });
  document.querySelectorAll('#aaFormSeg [data-aa-form]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.aaForm === aaFormKind));
  });
  document.querySelectorAll('#aaFacSeg [data-aa-fac]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.aaFac === aaFacIdx));
  });
  document.getElementById('aaPowBox').hidden = aaMode !== 'power';
  document.getElementById('aaMulBox').hidden = aaMode !== 'mul';
  document.getElementById('aaFormBox').hidden = aaMode !== 'formula';
  document.getElementById('aaFacBox').hidden = aaMode !== 'factor';
  document.getElementById('aaMTx').textContent = 'm = ' + aaM;
  document.getElementById('aaNTx').textContent = 'n = ' + aaN;
  document.getElementById('aaMulATx').textContent = 'a = ' + aaMulA;
  document.getElementById('aaMulBTx').textContent = 'b = ' + aaMulB;
  document.getElementById('aaForATx').textContent = 'a = ' + aaFormA;
  document.getElementById('aaForBTx').textContent = 'b = ' + aaFormB;
  document.getElementById('aaF1Tx').textContent = '第一个因数 = ' + aaF1;
  document.getElementById('aaF2Tx').textContent = '第二个因数 = ' + aaF2;
  let read = '', msg = '';
  if (aaMode === 'power') {
    if (aaPowKind === 'mul') {
      read = 'a' + aaM + '·a' + aaN + ' = (' + aaRepeat('a', aaM) + ')·(' + aaRepeat('a', aaN) + ') = a' + (aaM + aaN) +
        '：指数是“几个相同因数相乘”的计数，相乘就是指数相加，' + aaM + '+' + aaN + '=' + (aaM + aaN) + '。';
      msg = 'a²·a³ 是 a⁵，不是 a⁶：同底数幂相乘，指数相加，不是相乘。';
    } else {
      read = '(a' + aaM + ')' + aaN + ' = ' + aaRepeat('a' + aaM, aaN) + ' = a' + (aaM * aaN) +
        '：' + aaN + ' 个 a' + aaM + ' 相乘，一共 ' + aaM + '×' + aaN + '=' + (aaM * aaN) + ' 个 a，指数相乘。';
      msg = '(a²)³ 是 a⁶，不是 a⁵：幂的乘方，指数相乘，不是相加。';
    }
  } else if (aaMode === 'mul') {
    aaMulDraw();
    read = '(x+' + aaMulA + ')(x+' + aaMulB + ') = x²+' + (aaMulA + aaMulB) + 'x+' + (aaMulA * aaMulB) +
      '：每一项乘每一项，四块面积加起来：x² + ' + aaMulA + 'x + ' + aaMulB + 'x + ' + (aaMulA * aaMulB) + '。';
    msg = '多项式乘多项式：每一项乘每一项，再相加——面积图就是把乘法画出来。';
  } else if (aaMode === 'formula') {
    aaFormDraw();
    const a = aaFormA, b = aaFormB;
    if (aaFormKind === 'sqplus') {
      read = '(a+b)² = a²+2ab+b²：(' + a + '+' + b + ')² = ' + (a * a) + '+' + (2 * a * b) + '+' + (b * b) + ' = ' + ((a + b) * (a + b)) + '。';
      msg = '完全平方：首平方、尾平方，2 倍首尾放中间。';
    } else if (aaFormKind === 'sqminus') {
      read = '(a−b)² = a²−2ab+b²：(' + a + '−' + b + ')² = ' + (a * a) + '−' + (2 * a * b) + '+' + (b * b) + ' = ' + ((a - b) * (a - b)) + '。';
      msg = '(a−b)² 不是 a²−b²：中间的 −2ab 不能丢。';
    } else {
      read = '(a+b)(a−b) = a²−b²：(' + a + '+' + b + ')(' + a + '−' + b + ') = ' + (a * a) + '−' + (b * b) + ' = ' + (a * a - b * b) + ' = ' + (a + b) + '×' + (a - b) + '。';
      msg = '平方差是面积图：边长 a 的大正方形减去边长 b 的小正方形，剩下的拼成长方形。';
    }
  } else {
    const pair = AA_FAC[aaFacIdx];
    const p = pair[0] + pair[1], q = pair[0] * pair[1];
    const okMul = aaF1 * aaF2 === q, okAdd = aaF1 + aaF2 === p;
    if (okMul && okAdd) {
      read = aaF1 + '×' + aaF2 + '=' + q + ' ✓，' + aaF1 + '+' + aaF2 + '=' + p + ' ✓：x²+' + p + 'x+' + q + ' = (x+' + aaF1 + ')(x+' + aaF2 + ')。分解完了：每个因式都不能再分了。';
      msg = '因式分解是乘法的逆运算：乘法是展开，因式分解是收拢。';
    } else {
      read = 'x²+' + p + 'x+' + q + '：相乘 ' + aaF1 + '×' + aaF2 + '=' + (aaF1 * aaF2) + '（要 ' + q + '）' + (okMul ? ' ✓' : ' ✗') +
        '；相加 ' + aaF1 + '+' + aaF2 + '=' + (aaF1 + aaF2) + '（要 ' + p + '）' + (okAdd ? ' ✓' : ' ✗') + '。再想想：哪两个数相乘是 ' + q + '、相加是 ' + p + '？';
      msg = '先提公因式，再套公式；分解要彻底：每个因式都不能再分解了才算完。';
    }
  }
  document.getElementById('aaRead').textContent = read;
  document.getElementById('aaMsg').textContent = msg;
}
function aaSvgRect(svg, NS, x, y, w, h, fill, stroke) {
  const r = document.createElementNS(NS, 'rect');
  r.setAttribute('x', x); r.setAttribute('y', y);
  r.setAttribute('width', w); r.setAttribute('height', h);
  r.setAttribute('fill', fill); r.setAttribute('stroke', stroke || '#1e293b'); r.setAttribute('stroke-width', 2);
  svg.appendChild(r);
  return r;
}
function aaSvgText(svg, NS, x, y, txt, size) {
  const t = document.createElementNS(NS, 'text');
  t.setAttribute('x', x); t.setAttribute('y', y);
  t.setAttribute('text-anchor', 'middle'); t.setAttribute('font-size', size || 16); t.setAttribute('fill', '#1e293b');
  t.textContent = txt;
  svg.appendChild(t);
  return t;
}
function aaMulDraw() {
  const svg = document.getElementById('aaMulSvg');
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  const NS = 'http://www.w3.org/2000/svg';
  const u = 22, x0 = 90, y0 = 40, xu = 4;
  const w = (xu + aaMulA) * u, h = (xu + aaMulB) * u;
  aaSvgRect(svg, NS, x0, y0, xu * u, xu * u, '#dbeafe');
  aaSvgText(svg, NS, x0 + xu * u / 2, y0 + xu * u / 2 + 6, 'x²', 18);
  aaSvgRect(svg, NS, x0 + xu * u, y0, aaMulA * u, xu * u, '#fef3c7');
  aaSvgText(svg, NS, x0 + xu * u + aaMulA * u / 2, y0 + xu * u / 2 + 6, aaMulA + 'x', 18);
  aaSvgRect(svg, NS, x0, y0 + xu * u, xu * u, aaMulB * u, '#dcfce7');
  aaSvgText(svg, NS, x0 + xu * u / 2, y0 + xu * u + aaMulB * u / 2 + 6, aaMulB + 'x', 18);
  aaSvgRect(svg, NS, x0 + xu * u, y0 + xu * u, aaMulA * u, aaMulB * u, '#fee2e2');
  aaSvgText(svg, NS, x0 + xu * u + aaMulA * u / 2, y0 + xu * u + aaMulB * u / 2 + 6, String(aaMulA * aaMulB), 18);
  aaSvgText(svg, NS, x0 + w / 2, y0 - 12, '长 x+' + aaMulA, 15);
  aaSvgText(svg, NS, x0 - 12, y0 + h / 2, '宽 x+' + aaMulB, 15);
}
function aaFormDraw() {
  const svg = document.getElementById('aaFormSvg');
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  const NS = 'http://www.w3.org/2000/svg';
  const a = aaFormA, b = aaFormB;
  if (aaFormKind === 'sqplus') {
    const u = 20, x0 = 90, y0 = 40;
    aaSvgRect(svg, NS, x0, y0, a * u, a * u, '#dbeafe');
    aaSvgText(svg, NS, x0 + a * u / 2, y0 + a * u / 2 + 6, 'a²', 18);
    aaSvgRect(svg, NS, x0 + a * u, y0, b * u, a * u, '#fef3c7');
    aaSvgText(svg, NS, x0 + a * u + b * u / 2, y0 + a * u / 2 + 6, 'ab', 18);
    aaSvgRect(svg, NS, x0, y0 + a * u, a * u, b * u, '#fef3c7');
    aaSvgText(svg, NS, x0 + a * u / 2, y0 + a * u + b * u / 2 + 6, 'ab', 18);
    aaSvgRect(svg, NS, x0 + a * u, y0 + a * u, b * u, b * u, '#fee2e2');
    aaSvgText(svg, NS, x0 + a * u + b * u / 2, y0 + a * u + b * u / 2 + 6, 'b²', 18);
    aaSvgText(svg, NS, x0 + (a + b) * u / 2, y0 - 12, '边长 a+b', 15);
  } else if (aaFormKind === 'sqminus') {
    const u = 22, x0 = 90, y0 = 40, d = a - b;
    aaSvgRect(svg, NS, x0, y0, a * u, a * u, '#fff');
    aaSvgRect(svg, NS, x0, y0, d * u, d * u, '#dbeafe');
    aaSvgText(svg, NS, x0 + d * u / 2, y0 + d * u / 2 + 6, '(a−b)²', 18);
    aaSvgRect(svg, NS, x0 + d * u, y0, b * u, d * u, '#fef3c7');
    aaSvgText(svg, NS, x0 + d * u + b * u / 2, y0 + d * u / 2 + 6, 'ab', 16);
    aaSvgRect(svg, NS, x0, y0 + d * u, a * u, b * u, '#fef3c7');
    aaSvgText(svg, NS, x0 + a * u / 2, y0 + d * u + b * u / 2 + 6, 'ab', 16);
    aaSvgText(svg, NS, x0 + a * u / 2, y0 - 12, '边长 a 的正方形', 15);
  } else {
    const u = 20, x0 = 70, y0 = 40;
    aaSvgRect(svg, NS, x0, y0, a * u, a * u, '#dbeafe');
    aaSvgRect(svg, NS, x0 + (a - b) * u, y0 + (a - b) * u, b * u, b * u, '#fff');
    const cr = document.createElementNS(NS, 'rect');
    cr.setAttribute('x', x0 + (a - b) * u); cr.setAttribute('y', y0 + (a - b) * u);
    cr.setAttribute('width', b * u); cr.setAttribute('height', b * u);
    cr.setAttribute('fill', 'none'); cr.setAttribute('stroke', '#ef4444'); cr.setAttribute('stroke-width', 2); cr.setAttribute('stroke-dasharray', '5 3');
    svg.appendChild(cr);
    aaSvgText(svg, NS, x0 + a * u / 2, y0 + a * u / 2, 'a²−b²', 18);
    aaSvgText(svg, NS, x0 + a * u / 2, y0 - 12, '大正方形切掉小正方形', 15);
    const rx = 360, rw = (a + b) * u, rh = (a - b) * u;
    aaSvgRect(svg, NS, rx, y0, rw, rh, '#dcfce7');
    aaSvgText(svg, NS, rx + rw / 2, y0 + rh / 2 + 6, '(a+b)(a−b)', 18);
    aaSvgText(svg, NS, rx + rw / 2, y0 - 12, '拼成长方形', 15);
  }
}
(function aaInit() {
  const modeSeg = document.getElementById('aaModeSeg');
  [['power', '幂的运算'], ['mul', '(x+a)(x+b)'], ['formula', '乘法公式'], ['factor', '因式分解']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.aaMode = m[0];
    b.addEventListener('click', function () { aaMode = m[0]; markTried('algarea'); aaRender(); });
    modeSeg.appendChild(b);
  });
  const powSeg = document.getElementById('aaPowSeg');
  [['mul', '同底数幂相乘'], ['pow', '幂的乘方']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.aaPow = m[0];
    b.addEventListener('click', function () { aaPowKind = m[0]; markTried('algarea'); aaRender(); });
    powSeg.appendChild(b);
  });
  const formSeg = document.getElementById('aaFormSeg');
  [['sqplus', '(a+b)²'], ['sqminus', '(a−b)²'], ['diff', '(a+b)(a−b)']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.aaForm = m[0];
    b.addEventListener('click', function () { aaFormKind = m[0]; markTried('algarea'); aaRender(); });
    formSeg.appendChild(b);
  });
  const facSeg = document.getElementById('aaFacSeg');
  AA_FAC.forEach(function (pair, i) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = 'x²+' + (pair[0] + pair[1]) + 'x+' + (pair[0] * pair[1]);
    b.dataset.aaFac = String(i);
    b.addEventListener('click', function () { aaFacIdx = i; aaF1 = 1; aaF2 = 1; markTried('algarea'); aaRender(); });
    facSeg.appendChild(b);
  });
  function aaStepper(idMinus, idPlus, get, set, lo, hi) {
    document.getElementById(idMinus).addEventListener('click', function () { set(Math.max(lo, get() - 1)); markTried('algarea'); aaRender(); });
    document.getElementById(idPlus).addEventListener('click', function () { set(Math.min(hi, get() + 1)); markTried('algarea'); aaRender(); });
  }
  aaStepper('aaMMinus', 'aaMPlus', function () { return aaM; }, function (v) { aaM = v; }, 1, 5);
  aaStepper('aaNMinus', 'aaNPlus', function () { return aaN; }, function (v) { aaN = v; }, 1, 5);
  aaStepper('aaMulAMinus', 'aaMulAPlus', function () { return aaMulA; }, function (v) { aaMulA = v; }, 1, 5);
  aaStepper('aaMulBMinus', 'aaMulBPlus', function () { return aaMulB; }, function (v) { aaMulB = v; }, 1, 5);
  aaStepper('aaForAMinus', 'aaForAPlus', function () { return aaFormA; }, function (v) { aaFormA = v; if (aaFormB >= aaFormA) aaFormB = aaFormA - 1; }, 3, 6);
  document.getElementById('aaForBMinus').addEventListener('click', function () { aaFormB = Math.max(1, aaFormB - 1); markTried('algarea'); aaRender(); });
  document.getElementById('aaForBPlus').addEventListener('click', function () { aaFormB = Math.min(aaFormA - 1, aaFormB + 1); markTried('algarea'); aaRender(); });
  aaStepper('aaF1Minus', 'aaF1Plus', function () { return aaF1; }, function (v) { aaF1 = v; }, 1, 6);
  aaStepper('aaF2Minus', 'aaF2Plus', function () { return aaF2; }, function (v) { aaF2 = v; }, 1, 6);
  aaRender();
})();

/* ---------- demo-algfrac · 8.8 分式及其运算（方法：分数对照法） ----------
   约分：分子分母的因式画成小牌子，点一对相同的因式就一起约掉——只能约乘积里的
   公因式，加号里的项约不掉。分母为 0：拖一拖 x，看分母什么时候变成 0，分式就
   什么时候没有意义。 */
let afMode = 'cancel', afProb = 0, afZeroIdx = 0, afX = 0;
let afCancelNum = [], afCancelDen = [];
const AF_PROBS = [
  { expr: '12a²b/4ab', num: ['3', '4', 'a', 'a', 'b'], den: ['4', 'a', 'b'], result: '3a' },
  { expr: '6x²y/3xy', num: ['2', '3', 'x', 'x', 'y'], den: ['3', 'x', 'y'], result: '2x' },
  { expr: '(x²−9)/(x+3)', num: ['x+3', 'x−3'], den: ['x+3'], result: 'x−3' }
];
const AF_ZERO = [
  { expr: '1/(x−2)', bad: 2, denText: 'x−2', val: function (x) { return '1/' + (x - 2); } },
  { expr: 'x/(x+1)', bad: -1, denText: 'x+1', val: function (x) { return fmtNum(x / (x + 1)); } }
];
function afRender() {
  document.querySelectorAll('#afModeSeg [data-af-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.afMode === afMode));
  });
  document.querySelectorAll('#afProbSeg [data-af-prob]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.afProb === afProb));
  });
  document.querySelectorAll('#afZeroSeg [data-af-zero]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.afZero === afZeroIdx));
  });
  document.getElementById('afCancelBox').hidden = afMode !== 'cancel';
  document.getElementById('afZeroBox').hidden = afMode !== 'zero';
  document.getElementById('afXTx').textContent = 'x = ' + afX;
  let read = '', msg = '';
  if (afMode === 'cancel') {
    const prob = AF_PROBS[afProb];
    const numBox = document.getElementById('afNumChips'), denBox = document.getElementById('afDenChips');
    while (numBox.firstChild) numBox.removeChild(numBox.firstChild);
    while (denBox.firstChild) denBox.removeChild(denBox.firstChild);
    prob.num.forEach(function (f, i) {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = f;
      if (afCancelNum.indexOf(i) >= 0) b.className = 'g8-off';
      b.addEventListener('click', function () { afCancel('num', i); });
      numBox.appendChild(b);
    });
    prob.den.forEach(function (f, i) {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = f;
      if (afCancelDen.indexOf(i) >= 0) b.className = 'g8-off';
      b.addEventListener('click', function () { afCancel('den', i); });
      denBox.appendChild(b);
    });
    const restNum = prob.num.filter(function (_, i) { return afCancelNum.indexOf(i) < 0; });
    const restDen = prob.den.filter(function (_, i) { return afCancelDen.indexOf(i) < 0; });
    const done = !prob.num.some(function (f, i) {
      return afCancelNum.indexOf(i) < 0 && prob.den.some(function (g, j) { return g === f && afCancelDen.indexOf(j) < 0; });
    });
    if (done) {
      const remStr = (restNum.length ? restNum.join('·') : '1') + (restDen.length ? ' / ' + restDen.join('·') : '');
      read = '约分完了：' + prob.expr + ' = ' + (remStr === prob.result ? prob.result : remStr + ' = ' + prob.result) + '。';
      msg = '约分只能约掉乘积里的公因式：加号里的项约不掉。';
    } else {
      read = '分式 ' + prob.expr + '：点一对相同的因式（一个在分子、一个在分母），就一起约掉。还剩分子 ' +
        (restNum.length ? restNum.join('·') : '1') + '，分母 ' + (restDen.length ? restDen.join('·') : '1') + '。';
      msg = '分式就是分数的“字母版”：分数的约分规则全都照搬，只是数字换成了字母。';
    }
  } else {
    const z = AF_ZERO[afZeroIdx];
    const d = afX - z.bad;
    if (d === 0) {
      read = 'x=' + afX + ' 时，分母 ' + z.denText + ' = 0，分式 ' + z.expr + ' 没有意义。';
      msg = '分母不能为 0，是因为除数不能为 0——分式就是一场除法。';
    } else {
      read = 'x=' + afX + ' 时，分母 ' + z.denText + ' = ' + d + '，分式有意义：' + z.expr + ' = ' + z.val(afX) + '。';
      msg = 'x=0 时分母不一定是 0：要看分母那一项是不是 0。';
    }
  }
  document.getElementById('afRead').textContent = read;
  document.getElementById('afMsg').textContent = msg;
}
function afCancel(side, i) {
  const prob = AF_PROBS[afProb];
  const mine = side === 'num' ? afCancelNum : afCancelDen;
  const other = side === 'num' ? prob.den : prob.num;
  const otherDone = side === 'num' ? afCancelDen : afCancelNum;
  if (mine.indexOf(i) >= 0) return;
  const f = (side === 'num' ? prob.num : prob.den)[i];
  let j = -1;
  other.forEach(function (g, k) { if (j < 0 && g === f && otherDone.indexOf(k) < 0) j = k; });
  markTried('algfrac');
  if (j < 0) {
    document.getElementById('afRead').textContent = '分母里没有能和 ' + f + ' 配对的因式了：这个 ' + f + ' 约不掉。';
    return;
  }
  mine.push(i); otherDone.push(j);
  afRender();
}
(function afInit() {
  const modeSeg = document.getElementById('afModeSeg');
  [['cancel', '约分：点一对约一对'], ['zero', '分母为 0 就没意义']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.afMode = m[0];
    b.addEventListener('click', function () { afMode = m[0]; markTried('algfrac'); afRender(); });
    modeSeg.appendChild(b);
  });
  const probSeg = document.getElementById('afProbSeg');
  AF_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = p.expr; b.dataset.afProb = String(i);
    b.addEventListener('click', function () { afProb = i; afCancelNum = []; afCancelDen = []; markTried('algfrac'); afRender(); });
    probSeg.appendChild(b);
  });
  const zeroSeg = document.getElementById('afZeroSeg');
  AF_ZERO.forEach(function (z, i) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = z.expr; b.dataset.afZero = String(i);
    b.addEventListener('click', function () { afZeroIdx = i; markTried('algfrac'); afRender(); });
    zeroSeg.appendChild(b);
  });
  document.getElementById('afReset').addEventListener('click', function () { afCancelNum = []; afCancelDen = []; markTried('algfrac'); afRender(); });
  document.getElementById('afXMinus').addEventListener('click', function () { afX = Math.max(-3, afX - 1); markTried('algfrac'); afRender(); });
  document.getElementById('afXPlus').addEventListener('click', function () { afX = Math.min(5, afX + 1); markTried('algfrac'); afRender(); });
  afRender();
})();

/* ---------- demo-eqsieve · 8.9 分式方程（方法：过筛检验法） ----------
   三步走：① 去分母（两边同乘最简公分母，每一项都要乘）；② 解整式方程；
   ③ 检验：把解代回原方程，分母是 0 就是增根，要筛掉。第二道题的解 x=1
   代回去分母是 0——是增根，原方程无解。 */
let esProb = 0, esStep = 0;
const ES_PROBS = [
  { eq: '2/(x−3) = 1/(x+1)', cleared: '两边同乘 (x−3)(x+1)：2(x+1) = x−3',
    solved: '2x+2 = x−3，解得 x = −5',
    checked: '把 x=−5 代回原方程：分母是 x−3 = −8、x+1 = −4，都不是 0——x=−5 是原方程的解。' },
  { eq: '1/(x−1) = 2/(x²−1)', cleared: 'x²−1 = (x−1)(x+1)，两边同乘 (x−1)(x+1)：x+1 = 2',
    solved: 'x+1 = 2，解得 x = 1',
    checked: '把 x=1 代回原方程：分母是 x−1 = 0、x²−1 = 0——x=1 是增根，舍去，原方程无解。' }
];
function esRender() {
  document.querySelectorAll('#esProbSeg [data-es-prob]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.esProb === esProb));
  });
  const p = ES_PROBS[esProb];
  document.getElementById('esEq').textContent = '解方程：' + p.eq;
  document.getElementById('esLine1').hidden = esStep < 1;
  document.getElementById('esLine2').hidden = esStep < 2;
  document.getElementById('esLine3').hidden = esStep < 3;
  document.getElementById('esLine1').textContent = '① 去分母：' + p.cleared + '。';
  document.getElementById('esLine2').textContent = '② 解整式方程：' + p.solved + '。';
  document.getElementById('esLine3').textContent = '③ 检验：' + p.checked;
  document.getElementById('esRead').textContent = esStep === 0
    ? '分式方程：分母里有未知数。先去分母，再解整式方程，最后一定要检验。'
    : esStep === 3 ? '检验完了：增根是方程变形的副产品，不是原方程的解。'
    : '继续：下一步是' + (esStep === 1 ? '解这个整式方程。' : '把解代回原方程检验。');
  document.getElementById('esMsg').textContent = '去分母是两边同乘，不含分母的项也要乘，不能漏；解完不检验，增根就混进答案里了。';
}
(function esInit() {
  const probSeg = document.getElementById('esProbSeg');
  ES_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = p.eq; b.dataset.esProb = String(i);
    b.addEventListener('click', function () { esProb = i; esStep = 0; markTried('eqsieve'); esRender(); });
    probSeg.appendChild(b);
  });
  document.getElementById('esStep1').addEventListener('click', function () { esStep = Math.max(esStep, 1); markTried('eqsieve'); esRender(); });
  document.getElementById('esStep2').addEventListener('click', function () { esStep = Math.max(esStep, 2); markTried('eqsieve'); esRender(); });
  document.getElementById('esStep3').addEventListener('click', function () { esStep = Math.max(esStep, 3); markTried('eqsieve'); esRender(); });
  esRender();
})();

/* ---------- demo-radical · 8.10 二次根式（方法：提平方因数法） ----------
   化简：点一个平方因数，把它从根号里提出来——要提最大的那个，不然还没化简完。
   √72 = √(36×2) = 6√2；只提 4 出来是 2√18，18 里还有 9，能再化简。
   合并：先化简，再看根号里的数一不一样：一样才能合，不一样合不了。 */
let rxMode = 'simplify', rxNum = 12, rxPicked = null, rxPair = 0;
const RX_SQUARES = [36, 25, 16, 9, 4];
function rxLargestSquare(n) {
  for (let i = 0; i < RX_SQUARES.length; i++) if (n % RX_SQUARES[i] === 0) return RX_SQUARES[i];
  return 1;
}
function rxSimplify(n) {
  const s = rxLargestSquare(n);
  return { k: Math.sqrt(s), r: n / s };
}
const RX_PAIRS = [[8, 2], [12, 3], [18, 8], [5, 3]];
function rxRender() {
  document.querySelectorAll('#rxModeSeg [data-rx-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.rxMode === rxMode));
  });
  document.querySelectorAll('#rxNumSeg [data-rx-num]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.rxNum === rxNum));
  });
  document.querySelectorAll('#rxPairSeg [data-rx-pair]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.rxPair === rxPair));
  });
  document.getElementById('rxSimpBox').hidden = rxMode !== 'simplify';
  document.getElementById('rxCombBox').hidden = rxMode !== 'combine';
  let read = '', msg = '';
  if (rxMode === 'simplify') {
    const best = rxLargestSquare(rxNum);
    if (rxPicked === null) {
      read = '化简 √' + rxNum + '：点一个平方因数，把它从根号里提出来。' + rxNum + ' 里最大的平方因数是几？';
      msg = '化简就是把被开方数里的平方因数提出来，化成最简二次根式。';
    } else if (rxNum % rxPicked !== 0) {
      read = rxNum + ' 不能被 ' + rxPicked + ' 整除：' + rxPicked + ' 不是 ' + rxNum + ' 的平方因数，提不出来。';
      msg = '平方因数要能整除被开方数才行。';
    } else if (rxPicked === best) {
      const rest = rxNum / rxPicked, k = Math.sqrt(rxPicked);
      read = '√' + rxNum + ' = √(' + rxPicked + '×' + rest + ') = ' + k + '√' + rest + '：提完了，' + rest + ' 里没有平方因数了，是最简二次根式。';
      msg = '√12 = 2√3：12 = 4×3，√4 = 2 提出来。';
    } else {
      const rest = rxNum / rxPicked, k = Math.sqrt(rxPicked);
      const s2 = rxSimplify(rest);
      read = '√' + rxNum + ' = √(' + rxPicked + '×' + rest + ') = ' + k + '√' + rest + '：还没化简完，' + rest + ' 里还有平方因数 ' + (rest / s2.r) +
        '，能再提：' + k + '√' + rest + ' = ' + (k * s2.k) + '√' + s2.r + '。';
      msg = '化简要彻底：提一个小的平方因数出来，根号里可能还藏着更大的。';
    }
  } else {
    const pair = RX_PAIRS[rxPair];
    const s1 = rxSimplify(pair[0]), s2 = rxSimplify(pair[1]);
    const f1 = s1.k === 1 ? '√' + s1.r : s1.k + '√' + s1.r;
    const f2 = s2.k === 1 ? '√' + s2.r : s2.k + '√' + s2.r;
    if (s1.r === s2.r) {
      read = '√' + pair[0] + ' = ' + f1 + '，√' + pair[1] + ' = ' + f2 + '：根号里的数都是 ' + s1.r + '，能合并：' +
        f1 + '+' + f2 + ' = ' + (s1.k + s2.k) + '√' + s1.r + '。';
      msg = '合并同类二次根式和合并同类项一样——“同类才能合”。';
    } else {
      read = '√' + pair[0] + ' = ' + f1 + '，√' + pair[1] + ' = ' + f2 + '：根号里的数是 ' + s1.r + ' 和 ' + s2.r + '，不一样，合不了。';
      msg = '√2 和 √3 长得不一样，合不起来：√a+√b 不能写成 √(a+b)。';
    }
  }
  document.getElementById('rxRead').textContent = read;
  document.getElementById('rxMsg').textContent = msg;
}
(function rxInit() {
  const modeSeg = document.getElementById('rxModeSeg');
  [['simplify', '化简：提平方因数'], ['combine', '合并：同类才能合']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.rxMode = m[0];
    b.addEventListener('click', function () { rxMode = m[0]; markTried('radical'); rxRender(); });
    modeSeg.appendChild(b);
  });
  const numSeg = document.getElementById('rxNumSeg');
  [12, 18, 50, 72].forEach(function (n) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = '√' + n; b.dataset.rxNum = String(n);
    b.addEventListener('click', function () { rxNum = n; rxPicked = null; markTried('radical'); rxRender(); });
    numSeg.appendChild(b);
  });
  const chipSeg = document.getElementById('rxChipSeg');
  [4, 9, 16, 25, 36].forEach(function (f) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = String(f); b.dataset.rxChip = String(f);
    b.addEventListener('click', function () { rxPicked = f; markTried('radical'); rxRender(); });
    chipSeg.appendChild(b);
  });
  const pairSeg = document.getElementById('rxPairSeg');
  RX_PAIRS.forEach(function (pair, i) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = '√' + pair[0] + '+√' + pair[1]; b.dataset.rxPair = String(i);
    b.addEventListener('click', function () { rxPair = i; markTried('radical'); rxRender(); });
    pairSeg.appendChild(b);
  });
  rxRender();
})();

/* ---------- demo-pythag · 8.11 勾股定理与逆定理（方法：面积拼图法） ----------
   面积拼图：直角三角形三条边上各画一个正方形，a²+b²=c²——两条直角边上正方形的
   面积加起来，正好等于斜边上正方形的面积。勾股数：3-4-5、5-12-13、8-15-17、
   7-24-25。逆定理：三边满足 a²+b²=c²，这个三角形就是直角三角形。 */
let pyMode = 'squares', pyTriple = 0, pyCheck = 0;
const PY_TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]];
const PY_CHECKS = [[5, 12, 13], [3, 4, 6], [6, 8, 11], [9, 12, 15]];
function pyRender() {
  document.querySelectorAll('#pyModeSeg [data-py-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.pyMode === pyMode));
  });
  document.querySelectorAll('#pyTripleSeg [data-py-triple]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.pyTriple === pyTriple));
  });
  document.querySelectorAll('#pyCheckSeg [data-py-check]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.pyCheck === pyCheck));
  });
  document.getElementById('pySqBox').hidden = pyMode !== 'squares';
  document.getElementById('pyCheckBox').hidden = pyMode !== 'check';
  let read = '', msg = '';
  if (pyMode === 'squares') {
    const t = PY_TRIPLES[pyTriple];
    const a = t[0], b = t[1], c = t[2];
    const s = 150 / c;
    const ax = 210, ay = 230;
    const bx = ax + s * a, by = ay;
    const cx = ax, cy = ay - s * b;
    document.getElementById('pyTri').setAttribute('points', ax + ',' + ay + ' ' + bx.toFixed(1) + ',' + by + ' ' + cx + ',' + cy.toFixed(1));
    // 底边上的正方形（向下），左边上的正方形（向左），斜边上的正方形（向外）。
    document.getElementById('pySqA').setAttribute('points',
      ax + ',' + ay + ' ' + bx.toFixed(1) + ',' + by + ' ' + bx.toFixed(1) + ',' + (by + s * a).toFixed(1) + ' ' + ax + ',' + (ay + s * a).toFixed(1));
    document.getElementById('pySqB').setAttribute('points',
      ax + ',' + ay + ' ' + cx + ',' + cy.toFixed(1) + ' ' + (cx - s * b).toFixed(1) + ',' + cy.toFixed(1) + ' ' + (ax - s * b).toFixed(1) + ',' + ay);
    const vx = cx - bx, vy = cy - by;
    const n1 = [-vy, vx], n2 = [vy, -vx];
    const midX = (bx + cx) / 2, midY = (by + cy) / 2;
    const d1 = (midX + n1[0] - ax) * (midX + n1[0] - ax) + (midY + n1[1] - ay) * (midY + n1[1] - ay);
    const d2 = (midX + n2[0] - ax) * (midX + n2[0] - ax) + (midY + n2[1] - ay) * (midY + n2[1] - ay);
    const n = d1 > d2 ? n1 : n2;
    document.getElementById('pySqC').setAttribute('points',
      bx.toFixed(1) + ',' + by + ' ' + cx + ',' + cy.toFixed(1) + ' ' +
      (cx + n[0]).toFixed(1) + ',' + (cy + n[1]).toFixed(1) + ' ' + (bx + n[0]).toFixed(1) + ',' + (by + n[1]).toFixed(1));
    const labA = document.getElementById('pyLabA');
    labA.setAttribute('x', (ax + bx) / 2); labA.setAttribute('y', ay + s * a / 2 + 6);
    labA.textContent = a + '²=' + (a * a);
    const labB = document.getElementById('pyLabB');
    labB.setAttribute('x', ax - s * b / 2); labB.setAttribute('y', (ay + cy) / 2 + 6);
    labB.textContent = b + '²=' + (b * b);
    const labC = document.getElementById('pyLabC');
    labC.setAttribute('x', midX + n[0] / 2); labC.setAttribute('y', midY + n[1] / 2 + 6);
    labC.textContent = c + '²=' + (c * c);
    read = a + '²+' + b + '² = ' + (a * a) + '+' + (b * b) + ' = ' + (a * a + b * b) + ' = ' + (c * c) + ' = ' + c + '²：两条直角边上正方形的面积加起来，正好等于斜边上正方形的面积。';
    msg = '勾股定理是“面积守恒”：a²+b²=c²，c 是斜边——最长的那条边。';
  } else {
    const t = PY_CHECKS[pyCheck];
    const a = t[0], b = t[1], c = t[2];
    const lhs = a * a + b * b, rhs = c * c;
    if (lhs === rhs) {
      read = a + '²+' + b + '² = ' + (a * a) + '+' + (b * b) + ' = ' + lhs + ' = ' + rhs + ' = ' + c + '²：满足 a²+b²=c²，是直角三角形。';
      msg = '勾股定理的逆定理：三边满足这个关系，角就一定是直角。';
    } else {
      read = a + '²+' + b + '² = ' + (a * a) + '+' + (b * b) + ' = ' + lhs + ' ≠ ' + rhs + ' = ' + c + '²：不满足 a²+b²=c²，不是直角三角形。';
      msg = '3、4、6 不是勾股数：3²+4²=25，6²=36，不相等。';
    }
  }
  document.getElementById('pyRead').textContent = read;
  document.getElementById('pyMsg').textContent = msg;
}
(function pyInit() {
  const modeSeg = document.getElementById('pyModeSeg');
  [['squares', '面积拼图'], ['check', '是直角三角形吗']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.pyMode = m[0];
    b.addEventListener('click', function () { pyMode = m[0]; markTried('pythag'); pyRender(); });
    modeSeg.appendChild(b);
  });
  const triSeg = document.getElementById('pyTripleSeg');
  PY_TRIPLES.forEach(function (t, i) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = t[0] + '-' + t[1] + '-' + t[2]; b.dataset.pyTriple = String(i);
    b.addEventListener('click', function () { pyTriple = i; markTried('pythag'); pyRender(); });
    triSeg.appendChild(b);
  });
  const chkSeg = document.getElementById('pyCheckSeg');
  PY_CHECKS.forEach(function (t, i) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = t[0] + '、' + t[1] + '、' + t[2]; b.dataset.pyCheck = String(i);
    b.addEventListener('click', function () { pyCheck = i; markTried('pythag'); pyRender(); });
    chkSeg.appendChild(b);
  });
  pyRender();
})();

/* ---------- demo-pargram · 8.12 平行四边形（方法：推一推变形法） ----------
   推一推：拖夹角滑杆，平行四边形左右推，形状变了，对边还是相等、对角还是相等、
   对角线还是互相平分（对角线交于同一点）。判定：四种条件，三个能判定是平行四边形，
   “一组对边平行、另一组对边相等”不能——可能是等腰梯形。 */
let pgmMode = 'push', pgmAng = 60, pgmJudge = 0;
const PGM_JUDGE = ['两组对边分别相等', '一组对边平行且相等', '对角线互相平分', '一组对边平行、另一组对边相等'];
function pgmRender() {
  document.querySelectorAll('#pgmModeSeg [data-pgm-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.pgmMode === pgmMode));
  });
  document.querySelectorAll('#pgmJudgeSeg [data-pgm-judge]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.pgmJudge === pgmJudge));
  });
  document.getElementById('pgmPushBox').hidden = pgmMode !== 'push';
  document.getElementById('pgmJudgeBox').hidden = pgmMode !== 'judge';
  document.getElementById('pgmAngTx').textContent = '夹角 = ' + pgmAng + '°';
  let read = '', msg = '';
  if (pgmMode === 'push') {
    const base = 220, side = 140, ax = 80, ay = 220;
    const rad = pgmAng * Math.PI / 180;
    const dx = side * Math.cos(rad), dy = side * Math.sin(rad);
    const A = [ax, ay], B = [ax + base, ay], D = [ax + dx, ay - dy], C = [ax + base + dx, ay - dy];
    const poly = document.getElementById('pgmPoly');
    poly.setAttribute('points', [A, B, C, D].map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '));
    const d1 = document.getElementById('pgmDiag1'), d2 = document.getElementById('pgmDiag2');
    d1.setAttribute('x1', A[0]); d1.setAttribute('y1', A[1]); d1.setAttribute('x2', C[0]); d1.setAttribute('y2', C[1]);
    d2.setAttribute('x1', B[0]); d2.setAttribute('y1', B[1]); d2.setAttribute('x2', D[0]); d2.setAttribute('y2', D[1]);
    const ox = (A[0] + C[0]) / 2, oy = (A[1] + C[1]) / 2;
    const dot = document.getElementById('pgmDotO');
    dot.setAttribute('cx', ox.toFixed(1)); dot.setAttribute('cy', oy.toFixed(1));
    const labAB = document.getElementById('pgmLabAB');
    labAB.setAttribute('x', (A[0] + B[0]) / 2); labAB.setAttribute('y', ay + 24);
    labAB.textContent = 'AB = CD = 11';
    const labAD = document.getElementById('pgmLabAD');
    labAD.setAttribute('x', (A[0] + D[0]) / 2 - 40); labAD.setAttribute('y', (A[1] + D[1]) / 2);
    labAD.textContent = 'AD = BC = 7';
    read = '夹角是 ' + pgmAng + '°：AB = CD = 11，AD = BC = 7，∠A = ∠C = ' + pgmAng + '°，两条对角线交于同一点 O，AO = OC，BO = OD。';
    msg = '推一推：形状变了，对边还是平行相等——平行四边形没有三角形的稳定性。';
  } else {
    const poly = document.getElementById('pgmJudgePoly');
    if (pgmJudge === 3) {
      poly.setAttribute('points', '120,220 400,220 340,110 180,110');
      read = '一组对边平行、另一组对边相等：不能判定——可能是等腰梯形（上底 160、下底 280，两条腰相等）。';
      msg = '要判定平行四边形，得是“同一组对边”平行且相等。';
    } else {
      const base = 220, side = 140, ax = 120, ay = 220;
      const dx = side * Math.cos(Math.PI / 3), dy = side * Math.sin(Math.PI / 3);
      poly.setAttribute('points', ax + ',' + ay + ' ' + (ax + base) + ',' + ay + ' ' + (ax + base + dx).toFixed(1) + ',' + (ay - dy).toFixed(1) + ' ' + (ax + dx).toFixed(1) + ',' + (ay - dy).toFixed(1));
      read = PGM_JUDGE[pgmJudge] + '：能判定是平行四边形。';
      msg = '性质和判定又是一对反话：性质是“是平行四边形，所以对边相等”；判定是“对边相等，所以是平行四边形”。';
    }
  }
  document.getElementById('pgmRead').textContent = read;
  document.getElementById('pgmMsg').textContent = msg;
}
(function pgmInit() {
  const modeSeg = document.getElementById('pgmModeSeg');
  [['push', '推一推'], ['judge', '判定：哪个条件够用']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.pgmMode = m[0];
    b.addEventListener('click', function () { pgmMode = m[0]; markTried('pargram'); pgmRender(); });
    modeSeg.appendChild(b);
  });
  const judgeSeg = document.getElementById('pgmJudgeSeg');
  PGM_JUDGE.forEach(function (name, i) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = name; b.dataset.pgmJudge = String(i);
    b.addEventListener('click', function () { pgmJudge = i; markTried('pargram'); pgmRender(); });
    judgeSeg.appendChild(b);
  });
  document.getElementById('pgmAngMinus').addEventListener('click', function () { pgmAng = Math.max(40, pgmAng - 5); markTried('pargram'); pgmRender(); });
  document.getElementById('pgmAngPlus').addEventListener('click', function () { pgmAng = Math.min(80, pgmAng + 5); markTried('pargram'); pgmRender(); });
  pgmRender();
})();

/* ---------- demo-specialquad · 8.13 特殊的平行四边形（方法：加条件变身法） ----------
   在平行四边形上“加条件”：加一个直角变成矩形（对角线相等）；加一组邻边相等变成
   菱形（对角线互相垂直平分，面积 = 对角线乘积的一半）；两个条件都加就是正方形。 */
let spRect = false, spRhom = false, spA = 6, spB = 4, spD1 = 6, spD2 = 8;
function spRender() {
  document.getElementById('spRectBtn').setAttribute('aria-pressed', String(spRect));
  document.getElementById('spRhomBtn').setAttribute('aria-pressed', String(spRhom));
  // 四个数字永远不能互相矛盾：只有真正决定当前图形的参数能调，
  // 不决定图形的步进器禁用，标签显示按图形算出来的真值。
  // 正方形：边长就是底边 spA，对角线都是 spA·√2；菱形：边长由两条对角线定，
  // 是 √((D1/2)²+(D2/2)²)，底边/侧边步进器这时并不画图。
  const spDiag = spA * Math.SQRT2;
  const spSide = Math.sqrt(spD1 * spD1 / 4 + spD2 * spD2 / 4);
  function spSetStepper(minusId, plusId, txId, label, enabled) {
    document.getElementById(txId).textContent = label;
    document.getElementById(minusId).disabled = !enabled;
    document.getElementById(plusId).disabled = !enabled;
  }
  if (spRhom && spRect) {
    spSetStepper('spAMinus', 'spAPlus', 'spATx', '底边 = ' + spA, true);
    spSetStepper('spBMinus', 'spBPlus', 'spBTx', '侧边 = ' + spA, false);
    spSetStepper('spD1Minus', 'spD1Plus', 'spD1Tx', '对角线 1 = ' + fmtNum(spDiag), false);
    spSetStepper('spD2Minus', 'spD2Plus', 'spD2Tx', '对角线 2 = ' + fmtNum(spDiag), false);
  } else if (spRhom) {
    spSetStepper('spAMinus', 'spAPlus', 'spATx', '底边 = ' + fmtNum(spSide), false);
    spSetStepper('spBMinus', 'spBPlus', 'spBTx', '侧边 = ' + fmtNum(spSide), false);
    spSetStepper('spD1Minus', 'spD1Plus', 'spD1Tx', '对角线 1 = ' + spD1, true);
    spSetStepper('spD2Minus', 'spD2Plus', 'spD2Tx', '对角线 2 = ' + spD2, true);
  } else {
    spSetStepper('spAMinus', 'spAPlus', 'spATx', '底边 = ' + spA, true);
    spSetStepper('spBMinus', 'spBPlus', 'spBTx', '侧边 = ' + spB, true);
    spSetStepper('spD1Minus', 'spD1Plus', 'spD1Tx', '对角线 1 = ' + spD1, false);
    spSetStepper('spD2Minus', 'spD2Plus', 'spD2Tx', '对角线 2 = ' + spD2, false);
  }
  document.getElementById('spDiagBox').hidden = !spRhom;
  const poly = document.getElementById('spPoly');
  const d1 = document.getElementById('spDiag1'), d2 = document.getElementById('spDiag2');
  let read = '', msg = '';
  if (spRhom && spRect) {
    // 正方形：边长 spA。
    const u = 22, x0 = 320 - spA * u / 2, y0 = 60;
    const s = spA * u;
    poly.setAttribute('points', x0 + ',' + y0 + ' ' + (x0 + s) + ',' + y0 + ' ' + (x0 + s) + ',' + (y0 + s) + ' ' + x0 + ',' + (y0 + s));
    d1.setAttribute('x1', x0); d1.setAttribute('y1', y0); d1.setAttribute('x2', x0 + s); d1.setAttribute('y2', y0 + s);
    d2.setAttribute('x1', x0 + s); d2.setAttribute('y1', y0); d2.setAttribute('x2', x0); d2.setAttribute('y2', y0 + s);
    read = '正方形：既是矩形又是菱形。边长 ' + spA + '，面积 ' + (spA * spA) + '，对角线相等，都是 ' + spA + '√2 ≈ ' + fmtNum(spA * Math.SQRT2) + '，还互相垂直平分。';
    msg = '两个条件都加就是正方形：矩形的对角线相等，菱形的对角线垂直平分，它全占了。';
  } else if (spRhom) {
    // 菱形：由两条对角线画出来。
    const cx = 320, cy = 150, k = 11;
    const pts = [[cx + spD1 * k, cy], [cx, cy + spD2 * k], [cx - spD1 * k, cy], [cx, cy - spD2 * k]];
    poly.setAttribute('points', pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' '));
    d1.setAttribute('x1', cx - spD1 * k); d1.setAttribute('y1', cy); d1.setAttribute('x2', cx + spD1 * k); d1.setAttribute('y2', cy);
    d2.setAttribute('x1', cx); d2.setAttribute('y1', cy - spD2 * k); d2.setAttribute('x2', cx); d2.setAttribute('y2', cy + spD2 * k);
    read = '菱形：有一组邻边相等的平行四边形。对角线互相垂直平分，面积 = 对角线乘积的一半 = ' + spD1 + '×' + spD2 + '÷2 = ' + (spD1 * spD2 / 2) + '。四条边都相等，边长是 ' + fmtNum(spSide) + '。';
    msg = '菱形面积是对角线乘积的一半：两条对角线把菱形切成了 4 个一样的小直角三角形。';
  } else {
    const u = 22, ax = 150, ay = 220;
    const theta = spRect ? Math.PI / 2 : Math.PI / 3;
    const dx = spB * u * Math.cos(theta), dy = spB * u * Math.sin(theta);
    const A = [ax, ay], B = [ax + spA * u, ay], D = [ax + dx, ay - dy], C = [ax + spA * u + dx, ay - dy];
    poly.setAttribute('points', [A, B, C, D].map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '));
    d1.setAttribute('x1', A[0]); d1.setAttribute('y1', A[1]); d1.setAttribute('x2', C[0]); d1.setAttribute('y2', C[1]);
    d2.setAttribute('x1', B[0]); d2.setAttribute('y1', B[1]); d2.setAttribute('x2', D[0]); d2.setAttribute('y2', D[1]);
    if (spRect) {
      read = '矩形：有一个角是直角的平行四边形。对角线相等，都是 √(' + spA + '²+' + spB + '²) = ' + fmtNum(Math.sqrt(spA * spA + spB * spB)) + '。面积是 ' + (spA * spB) + '。';
      msg = '直角三角形斜边上的中线等于斜边的一半：矩形的对角线交点到四个顶点的距离都相等。';
    } else {
      read = '平行四边形：对边相等、对角相等、对角线互相平分。点“加一个直角”或“加一组邻边相等”，看看它变成什么。';
      msg = '矩形、菱形、正方形都是在平行四边形上“加条件”：加一个直角变成矩形，加一组邻边相等变成菱形。';
    }
  }
  document.getElementById('spRead').textContent = read;
  document.getElementById('spMsg').textContent = msg;
}
(function spInit() {
  document.getElementById('spRectBtn').addEventListener('click', function () { spRect = !spRect; markTried('specialquad'); spRender(); });
  document.getElementById('spRhomBtn').addEventListener('click', function () { spRhom = !spRhom; markTried('specialquad'); spRender(); });
  function spStepper(idMinus, idPlus, get, set, lo, hi) {
    document.getElementById(idMinus).addEventListener('click', function () { set(Math.max(lo, get() - 1)); markTried('specialquad'); spRender(); });
    document.getElementById(idPlus).addEventListener('click', function () { set(Math.min(hi, get() + 1)); markTried('specialquad'); spRender(); });
  }
  spStepper('spAMinus', 'spAPlus', function () { return spA; }, function (v) { spA = v; }, 4, 8);
  spStepper('spBMinus', 'spBPlus', function () { return spB; }, function (v) { spB = v; }, 4, 8);
  spStepper('spD1Minus', 'spD1Plus', function () { return spD1; }, function (v) { spD1 = v; }, 4, 10);
  spStepper('spD2Minus', 'spD2Plus', function () { return spD2; }, function (v) { spD2 = v; }, 4, 10);
  spRender();
})();

/* ---------- demo-datastats · 8.16 数据的分析（方法：排队找中间法） ----------
   改一个数：点一格数据，它加 1（到 10 回到 0），平均数、中位数、众数、方差跟着变；
   “加一个 100”：平均数一下子被拉高，中位数几乎不动——平均数怕极端值，中位数不怕。
   比一比谁更稳定：两组平均数一样，方差小的那组更稳定。 */
let dsMode = 'edit', dsVals = [2, 3, 3, 5, 7], dsOutlier = false, dsPair = 0;
const DS_PAIRS = [
  { n1: '甲', d1: [7, 8, 9, 10, 11], n2: '乙', d2: [3, 6, 9, 12, 15] },
  { n1: '丙', d1: [9, 9, 9, 9, 9], n2: '丁', d2: [5, 7, 9, 11, 13] }
];
function dsStats(vals) {
  const n = vals.length;
  const sorted = vals.slice().sort(function (x, y) { return x - y; });
  const mean = vals.reduce(function (s, v) { return s + v; }, 0) / n;
  const median = n % 2 === 1 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const counts = {};
  vals.forEach(function (v) { counts[v] = (counts[v] || 0) + 1; });
  let best = 1, modes = [];
  Object.keys(counts).forEach(function (k) {
    if (counts[k] > best) { best = counts[k]; modes = [+k]; }
    else if (counts[k] === best && best > 1) modes.push(+k);
  });
  const variance = vals.reduce(function (s, v) { return s + (v - mean) * (v - mean); }, 0) / n;
  return { sorted: sorted, mean: mean, median: median, mode: best > 1 ? modes : null, variance: variance };
}
function dsRender() {
  document.querySelectorAll('#dsModeSeg [data-ds-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.dsMode === dsMode));
  });
  document.querySelectorAll('#dsPairSeg [data-ds-pair]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.dsPair === dsPair));
  });
  document.getElementById('dsEditBox').hidden = dsMode !== 'edit';
  document.getElementById('dsCmpBox').hidden = dsMode !== 'compare';
  document.getElementById('dsOutBtn').textContent = dsOutlier ? '去掉 100' : '加一个 100';
  let read = '', msg = '';
  if (dsMode === 'edit') {
    const vals = dsOutlier ? dsVals.concat([100]) : dsVals.slice();
    const st = dsStats(vals);
    const chips = document.getElementById('dsChips');
    while (chips.firstChild) chips.removeChild(chips.firstChild);
    dsVals.forEach(function (v, i) {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = String(v); b.dataset.dsVal = String(i);
      b.addEventListener('click', function () { dsVals[i] = (dsVals[i] + 1) % 11; markTried('datastats'); dsRender(); });
      chips.appendChild(b);
    });
    if (dsOutlier) {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = '100'; b.className = 'g8-off';
      chips.appendChild(b);
    }
    // 点图：数轴 0–10（加了 100 就拉到 0–100），平均数画一条橙线。
    const svg = document.getElementById('dsSvg');
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const NS = 'http://www.w3.org/2000/svg';
    const max = dsOutlier ? 100 : 10;
    const px = function (v) { return 20 + v / max * 600; };
    const axis = document.createElementNS(NS, 'line');
    axis.setAttribute('x1', 20); axis.setAttribute('y1', 60); axis.setAttribute('x2', 620); axis.setAttribute('y2', 60);
    axis.setAttribute('stroke', '#1e293b'); axis.setAttribute('stroke-width', 3);
    svg.appendChild(axis);
    vals.forEach(function (v) {
      const dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', px(v).toFixed(1)); dot.setAttribute('cy', 60); dot.setAttribute('r', 10);
      dot.setAttribute('fill', '#2563eb'); dot.setAttribute('stroke', '#fff'); dot.setAttribute('stroke-width', 2);
      svg.appendChild(dot);
    });
    const ml = document.createElementNS(NS, 'line');
    ml.setAttribute('x1', px(st.mean).toFixed(1)); ml.setAttribute('y1', 20);
    ml.setAttribute('x2', px(st.mean).toFixed(1)); ml.setAttribute('y2', 100);
    ml.setAttribute('stroke', '#ff8a3d'); ml.setAttribute('stroke-width', 3); ml.setAttribute('stroke-dasharray', '6 4');
    svg.appendChild(ml);
    const lab = document.createElementNS(NS, 'text');
    lab.setAttribute('x', Math.min(560, Math.max(60, px(st.mean)))); lab.setAttribute('y', 110);
    lab.setAttribute('text-anchor', 'middle'); lab.setAttribute('font-size', 14); lab.setAttribute('fill', '#c2410c');
    lab.textContent = '平均数 ' + fmtNum(st.mean);
    svg.appendChild(lab);
    read = '数据：' + vals.join('、') + '。排好序是 ' + st.sorted.join('、') + '；平均数是 ' + fmtNum(st.mean) +
      '，中位数是 ' + fmtNum(st.median) + '，众数是 ' + (st.mode ? st.mode.join('、') : '没有众数') +
      '，方差是 ' + fmtNum(st.variance) + '。';
    msg = dsOutlier
      ? '加了一个 100：平均数一下子变成 ' + fmtNum(st.mean) + '，中位数还是 ' + fmtNum(st.median) + '——平均数怕极端值，中位数不怕。'
      : '方差是“离平均数有多远”的平均：离得越远，波动越大。';
  } else {
    const pair = DS_PAIRS[dsPair];
    const s1 = dsStats(pair.d1), s2 = dsStats(pair.d2);
    const svg = document.getElementById('dsCmpSvg');
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const NS = 'http://www.w3.org/2000/svg';
    const px = function (v) { return 20 + v / 16 * 600; };
    [[pair.d1, 50], [pair.d2, 130]].forEach(function (row) {
      const axis = document.createElementNS(NS, 'line');
      axis.setAttribute('x1', 20); axis.setAttribute('y1', row[1]); axis.setAttribute('x2', 620); axis.setAttribute('y2', row[1]);
      axis.setAttribute('stroke', '#94a3b8'); axis.setAttribute('stroke-width', 2);
      svg.appendChild(axis);
      row[0].forEach(function (v) {
        const dot = document.createElementNS(NS, 'circle');
        dot.setAttribute('cx', px(v).toFixed(1)); dot.setAttribute('cy', row[1]); dot.setAttribute('r', 10);
        dot.setAttribute('fill', '#2563eb'); dot.setAttribute('stroke', '#fff'); dot.setAttribute('stroke-width', 2);
        svg.appendChild(dot);
      });
    });
    const ml = document.createElementNS(NS, 'line');
    ml.setAttribute('x1', px(9).toFixed(1)); ml.setAttribute('y1', 20);
    ml.setAttribute('x2', px(9).toFixed(1)); ml.setAttribute('y2', 160);
    ml.setAttribute('stroke', '#ff8a3d'); ml.setAttribute('stroke-width', 3); ml.setAttribute('stroke-dasharray', '6 4');
    svg.appendChild(ml);
    const stable = s1.variance < s2.variance ? pair.n1 : s2.variance < s1.variance ? pair.n2 : '一样稳定';
    read = pair.n1 + '组：' + pair.d1.join('、') + '，平均数 ' + fmtNum(s1.mean) + '，方差 ' + fmtNum(s1.variance) + '；' +
      pair.n2 + '组：' + pair.d2.join('、') + '，平均数 ' + fmtNum(s2.mean) + '，方差 ' + fmtNum(s2.variance) +
      '。两组平均数一样，' + stable + '更稳定。';
    msg = '方差越小，数据越稳定：甲组的数据都贴着平均数，乙组的数据散得远。';
  }
  document.getElementById('dsRead').textContent = read;
  document.getElementById('dsMsg').textContent = msg;
}
(function dsInit() {
  const modeSeg = document.getElementById('dsModeSeg');
  [['edit', '改一个数，看四个量'], ['compare', '比一比谁更稳定']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.dsMode = m[0];
    b.addEventListener('click', function () { dsMode = m[0]; markTried('datastats'); dsRender(); });
    modeSeg.appendChild(b);
  });
  const pairSeg = document.getElementById('dsPairSeg');
  DS_PAIRS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = p.n1 + '组对' + p.n2 + '组'; b.dataset.dsPair = String(i);
    b.addEventListener('click', function () { dsPair = i; markTried('datastats'); dsRender(); });
    pairSeg.appendChild(b);
  });
  document.getElementById('dsOutBtn').addEventListener('click', function () { dsOutlier = !dsOutlier; markTried('datastats'); dsRender(); });
  document.getElementById('dsReset').addEventListener('click', function () { dsVals = [2, 3, 3, 5, 7]; dsOutlier = false; markTried('datastats'); dsRender(); });
  dsRender();
})();

/* ---------- 九年级实验（15 个新演示） ----------
   每个实验一个认知动作：滑杆/步进改一个量，图和数立刻跟着变；不评分。 */
function g9El(tag, attrs) {
  const NS = 'http://www.w3.org/2000/svg';
  const el = document.createElementNS(NS, tag);
  Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
  return el;
}
function g9Clear(svg) { while (svg.firstChild) svg.removeChild(svg.firstChild); }
function g9SvgText(svg, x, y, txt, size, fill, anchor) {
  const t = g9El('text', { x: x, y: y, 'font-size': size || 15, fill: fill || '#1e293b', 'text-anchor': anchor || 'middle' });
  t.textContent = txt; svg.appendChild(t); return t;
}
function g9SvgLine(svg, x1, y1, x2, y2, stroke, w, dash) {
  const l = g9El('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: stroke || '#1e293b', 'stroke-width': w || 2 });
  if (dash) l.setAttribute('stroke-dasharray', dash);
  svg.appendChild(l); return l;
}

/* ---------- demo-quad · 9.1 解一元二次方程（方法：配方法拼图 + 判别式红绿灯） ----------
   三道题：x²−5x+6=0（Δ=1，根 2、3）、x²+6x−7=0（Δ=64，根 1、−7）、
   x²−4x+5=0（Δ=−4，没有实数根）。根由公式法算出，代回去验算用数值代入验。 */
const QQ_PROBS = [
  { eq: 'x²−5x+6=0', a: 1, b: -5, c: 6, comp: '(x−2.5)²=0.25', fac: '(x−2)(x−3)=0' },
  { eq: 'x²+6x−7=0', a: 1, b: 6, c: -7, comp: '(x+3)²=16', fac: '(x−1)(x+7)=0' },
  { eq: 'x²−4x+5=0', a: 1, b: -4, c: 5, comp: '(x−2)²=−1', fac: '分解不了（没有实数根）' }
];
let qqProb = 0, qqMode = 'complete';
function qqRoots(p) {
  const d = p.b * p.b - 4 * p.a * p.c;
  if (d < 0) return { d: d, roots: null };
  const s = Math.sqrt(d);
  return { d: d, roots: [(-p.b - s) / (2 * p.a), (-p.b + s) / (2 * p.a)] };
}
function qqRender() {
  document.querySelectorAll('#qqProbSeg [data-qq-prob]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.qqProb === qqProb));
  });
  document.querySelectorAll('#qqModeSeg [data-qq-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.qqMode === qqMode));
  });
  const p = QQ_PROBS[qqProb];
  const r = qqRoots(p);
  const light = r.d > 0 ? '绿灯' : (r.d === 0 ? '黄灯' : '红灯');
  let read = '', msg = '';
  if (qqMode === 'complete') {
    read = p.eq + '：配方得 ' + p.comp + '。';
    msg = r.roots
      ? '补上缺的那一块正方形：' + p.comp + '，开平方得 x=' + fmtNum(r.roots[0]) + ' 或 x=' + fmtNum(r.roots[1]) + '。'
      : '配方得 (x−2)²=−1：平方不可能是负数，所以没有实数根。';
  } else if (qqMode === 'formula') {
    read = p.eq + '：Δ=b²−4ac=' + r.d + '（' + light + '）。';
    msg = r.roots
      ? 'Δ=' + r.d + ' > 0，有两个不相等的实数根：x=' + fmtNum(r.roots[0]) + ' 或 x=' + fmtNum(r.roots[1]) + '。'
      : 'Δ=' + r.d + ' < 0，根号里是负数，开不出来，没有实数根。';
  } else if (qqMode === 'factor') {
    read = p.eq + '：因式分解得 ' + p.fac + '。';
    msg = r.roots
      ? '乘积是 0，括号里必有一个是 0：x=' + fmtNum(r.roots[0]) + ' 或 x=' + fmtNum(r.roots[1]) + '。先化成一边=0 才能这样拆。'
      : '它分解不了：Δ<0，没有实数根，乘积永远拆不出两个一次因式。';
  } else {
    if (!r.roots) { read = p.eq + '：Δ=' + r.d + ' < 0，没有实数根，没什么可代的。'; msg = '先看判别式：没有实数根，就不用代了。'; }
    else {
      const chk = r.roots.map(function (x) { return fmtNum(p.a * x * x + p.b * x + p.c); });
      read = p.eq + '：把 x=' + fmtNum(r.roots[0]) + ' 代回去得 ' + chk[0] + '，把 x=' + fmtNum(r.roots[1]) + ' 代回去得 ' + chk[1] + '。';
      msg = '两个根代回去都是 0，根是对的。配方、公式、因式分解，三种解法是同一个答案。';
    }
  }
  document.getElementById('qqRead').textContent = read;
  document.getElementById('qqMsg').textContent = msg;
}
(function qqInit() {
  const probSeg = document.getElementById('qqProbSeg');
  QQ_PROBS.forEach(function (p, i) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = p.eq; b.dataset.qqProb = String(i);
    b.addEventListener('click', function () { qqProb = i; markTried('quad'); qqRender(); });
    probSeg.appendChild(b);
  });
  const modeSeg = document.getElementById('qqModeSeg');
  [['complete', '配方法'], ['formula', '公式法 · 判别式'], ['factor', '因式分解法'], ['check', '代回去验算']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.qqMode = m[0];
    b.addEventListener('click', function () { qqMode = m[0]; markTried('quad'); qqRender(); });
    modeSeg.appendChild(b);
  });
  qqRender();
})();

/* ---------- demo-growth · 9.2 增长率与韦达定理（方法：利滚利法） ----------
   利滚利：100 元每年涨 x%，两年是 100(1+x)²。韦达：三道题，和与积藏在系数里，
   x₁²+x₂²=(x₁+x₂)²−2x₁x₂，不用解方程。 */
const GW_VIETA = [
  { eq: 'x²−3x+1=0', sum: 3, prod: 1 },
  { eq: 'x²−5x+6=0', sum: 5, prod: 6 },
  { eq: 'x²−2x−3=0', sum: 2, prod: -3 }
];
let gwMode = 'growth', gwX = 10, gwVieta = 0;
function gwRender() {
  document.querySelectorAll('#gwModeSeg [data-gw-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.gwMode === gwMode));
  });
  document.querySelectorAll('#gwVietaSeg [data-gw-vieta]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.gwVieta === gwVieta));
  });
  document.getElementById('gwGrowthBox').hidden = gwMode !== 'growth';
  document.getElementById('gwVietaBox').hidden = gwMode !== 'vieta';
  document.getElementById('gwXTx').textContent = 'x = ' + gwX + '%';
  let read = '', msg = '';
  if (gwMode === 'growth') {
    const y1 = 100 * (1 + gwX / 100), y2 = 100 * (1 + gwX / 100) * (1 + gwX / 100);
    read = '100 元每年涨 ' + gwX + '%：第一年 ' + fmtNum(y1) + ' 元，第二年 ' + fmtNum(y2) + ' 元。';
    msg = '100×(1+' + gwX + '%)²=' + fmtNum(y2) + ' 元；写成 100×(1+2×' + gwX + '%)=' + fmtNum(100 * (1 + 2 * gwX / 100)) + ' 元就错了——第二年是在第一年的基础上再涨。';
  } else {
    const v = GW_VIETA[gwVieta];
    const sq = v.sum * v.sum - 2 * v.prod;
    read = v.eq + '：x₁+x₂=' + v.sum + '，x₁x₂=' + v.prod + '。';
    msg = '不解方程：x₁²+x₂²=(x₁+x₂)²−2x₁x₂=' + v.sum + '²−2×(' + v.prod + ')=' + sq + '。';
  }
  document.getElementById('gwRead').textContent = read;
  document.getElementById('gwMsg').textContent = msg;
}
(function gwInit() {
  const modeSeg = document.getElementById('gwModeSeg');
  [['growth', '利滚利'], ['vieta', '韦达定理']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.gwMode = m[0];
    b.addEventListener('click', function () { gwMode = m[0]; markTried('growth'); gwRender(); });
    modeSeg.appendChild(b);
  });
  const vietaSeg = document.getElementById('gwVietaSeg');
  GW_VIETA.forEach(function (v, i) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = v.eq; b.dataset.gwVieta = String(i);
    b.addEventListener('click', function () { gwVieta = i; markTried('growth'); gwRender(); });
    vietaSeg.appendChild(b);
  });
  document.getElementById('gwXMinus').addEventListener('click', function () { gwX = Math.max(0, gwX - 1); markTried('growth'); gwRender(); });
  document.getElementById('gwXPlus').addEventListener('click', function () { gwX = Math.min(20, gwX + 1); markTried('growth'); gwRender(); });
  gwRender();
})();

/* ---------- demo-parabola · 9.3/9.4 二次函数的图象、性质与应用（方法：滑杆看抛物线法） ----------
   顶点式 y=a(x−h)²+k：a 管开口，(h,k) 是顶点；交点横坐标就是方程的根，顶点处取最值。
   利润模式用 9.4 练一练 Q2 同一道题：每件利润 30 元，每天卖 80 件，每涨 1 元少卖 2 件，
   利润=(30+x)(80−2x)=−2x²+20x+2400，顶点 x=5，最大利润 2450 元。
   （演示和知识点页用同一组数字，顶点、最大值处处对得上。） */
let ppMode = 'para', ppA = 1, ppH = 0, ppK = 0, ppX = 5;
function ppDrawPara() {
  const svg = document.getElementById('ppSvg');
  g9Clear(svg);
  const px = function (x) { return 320 + x * 50; }, py = function (y) { return 180 - y * 20; };
  g9SvgLine(svg, 20, 180, 620, 180, '#94a3b8', 2);
  g9SvgLine(svg, 320, 20, 320, 340, '#94a3b8', 2);
  g9SvgText(svg, 612, 168, 'x', 15, '#64748b');
  g9SvgText(svg, 332, 30, 'y', 15, '#64748b');
  g9SvgLine(svg, px(ppH), 20, px(ppH), 340, '#f59e0b', 2, '6 4');
  let d = '';
  for (let x = -6; x <= 6.01; x += 0.1) {
    const y = ppA * (x - ppH) * (x - ppH) + ppK;
    if (y < -8.5 || y > 8.5) { if (d) { svg.appendChild(g9El('path', { d: d, fill: 'none', stroke: '#2563eb', 'stroke-width': 3 })); d = ''; } continue; }
    d += (d ? ' L' : 'M') + px(x).toFixed(1) + ',' + py(y).toFixed(1);
  }
  if (d) svg.appendChild(g9El('path', { d: d, fill: 'none', stroke: '#2563eb', 'stroke-width': 3 }));
  const v = g9El('circle', { cx: px(ppH), cy: py(ppK), r: 8, fill: '#ff8a3d', stroke: '#fff', 'stroke-width': 2 });
  svg.appendChild(v);
  g9SvgText(svg, px(ppH) + 8, py(ppK) - 12, '顶点(' + ppH + ',' + ppK + ')', 15, '#c2410c', 'start');
}
function ppDrawProfit() {
  const svg = document.getElementById('ppProfitSvg');
  g9Clear(svg);
  const px = function (x) { return 40 + x * 28; }, py = function (p) { return 330 - p / 2600 * 300; };
  g9SvgLine(svg, 40, 330, 620, 330, '#94a3b8', 2);
  g9SvgLine(svg, 40, 30, 40, 330, '#94a3b8', 2);
  g9SvgText(svg, 612, 318, '涨价 x 元', 14, '#64748b', 'end');
  g9SvgText(svg, 48, 44, '利润（元）', 14, '#64748b', 'start');
  let d = '';
  for (let x = 0; x <= 20.01; x += 0.5) {
    const p = (30 + x) * (80 - 2 * x);
    d += (d ? ' L' : 'M') + px(x).toFixed(1) + ',' + py(p).toFixed(1);
  }
  svg.appendChild(g9El('path', { d: d, fill: 'none', stroke: '#2563eb', 'stroke-width': 3 }));
  const p = (30 + ppX) * (80 - 2 * ppX);
  const dot = g9El('circle', { cx: px(ppX), cy: py(p), r: 8, fill: '#ff8a3d', stroke: '#fff', 'stroke-width': 2 });
  svg.appendChild(dot);
  const top = g9El('circle', { cx: px(5), cy: py(2450), r: 8, fill: '#16a34a', stroke: '#fff', 'stroke-width': 2 });
  svg.appendChild(top);
  g9SvgText(svg, px(5) + 8, py(2450) - 12, '最高点 (5, 2450)', 15, '#15803d', 'start');
}
function ppRender() {
  document.querySelectorAll('#ppModeSeg [data-pp-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.ppMode === ppMode));
  });
  document.getElementById('ppParaBox').hidden = ppMode !== 'para';
  document.getElementById('ppProfitBox').hidden = ppMode !== 'profit';
  document.getElementById('ppATx').textContent = 'a = ' + fmtNum(ppA);
  document.getElementById('ppHTx').textContent = 'h = ' + ppH;
  document.getElementById('ppKTx').textContent = 'k = ' + ppK;
  document.getElementById('ppXTx').textContent = '涨 ' + ppX + ' 元';
  let read = '', msg = '';
  if (ppMode === 'para') {
    ppDrawPara();
    const open = ppA > 0 ? '开口向上' : '开口向下';
    const wide = Math.abs(ppA) > 1 ? '|a| 大，开口收得紧' : (Math.abs(ppA) < 1 ? '|a| 小，开口张得开' : '开口不宽不窄');
    let inter = '';
    const disc = -ppK / ppA;
    if (disc < 0) inter = '与 x 轴没有交点（Δ<0，方程没有实数根）';
    else if (disc === 0) inter = '与 x 轴相切于 (' + ppH + ',0)（Δ=0，只有一个根）';
    else {
      const s = Math.sqrt(disc);
      inter = '与 x 轴交于 (' + fmtNum(ppH - s) + ',0) 和 (' + fmtNum(ppH + s) + ',0)（Δ>0，两个根）';
    }
    read = 'y=' + fmtNum(ppA) + '(x−(' + ppH + '))²+(' + ppK + ')：' + open + '，对称轴 x=' + ppH + '，顶点 (' + ppH + ',' + ppK + ')。';
    msg = wide + '；' + inter + '；' + (ppA > 0 ? '顶点处取最小值 ' + ppK : '顶点处取最大值 ' + ppK) + '。';
  } else {
    ppDrawProfit();
    const p = (30 + ppX) * (80 - 2 * ppX);
    read = '涨 ' + ppX + ' 元：每件利润 ' + (30 + ppX) + ' 元，每天卖 ' + (80 - 2 * ppX) + ' 件，总利润 ' + p + ' 元。';
    msg = ppX === 5
      ? '涨 5 元时利润最大，最大利润 2450 元：利润=(30+x)(80−2x)=−2x²+20x+2400，顶点横坐标 x=5。涨价不是越多越好，涨多了卖得少。'
      : '利润=(30+x)(80−2x)=−2x²+20x+2400；顶点在 x=5，最大利润 2450 元。现在是 ' + p + ' 元，比最高点少 ' + (2450 - p) + ' 元。';
  }
  document.getElementById('ppRead').textContent = read;
  document.getElementById('ppMsg').textContent = msg;
}
(function ppInit() {
  const modeSeg = document.getElementById('ppModeSeg');
  [['para', '抛物线'], ['profit', '利润最高点']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.ppMode = m[0];
    b.addEventListener('click', function () { ppMode = m[0]; markTried('parabola'); ppRender(); });
    modeSeg.appendChild(b);
  });
  document.getElementById('ppAMinus').addEventListener('click', function () { ppA = Math.max(-2, ppA - 0.5); if (ppA === 0) ppA = -0.5; markTried('parabola'); ppRender(); });
  document.getElementById('ppAPlus').addEventListener('click', function () { ppA = Math.min(2, ppA + 0.5); if (ppA === 0) ppA = 0.5; markTried('parabola'); ppRender(); });
  document.getElementById('ppHMinus').addEventListener('click', function () { ppH = Math.max(-3, ppH - 1); markTried('parabola'); ppRender(); });
  document.getElementById('ppHPlus').addEventListener('click', function () { ppH = Math.min(3, ppH + 1); markTried('parabola'); ppRender(); });
  document.getElementById('ppKMinus').addEventListener('click', function () { ppK = Math.max(-4, ppK - 1); markTried('parabola'); ppRender(); });
  document.getElementById('ppKPlus').addEventListener('click', function () { ppK = Math.min(4, ppK + 1); markTried('parabola'); ppRender(); });
  document.getElementById('ppXMinus').addEventListener('click', function () { ppX = Math.max(0, ppX - 1); markTried('parabola'); ppRender(); });
  document.getElementById('ppXPlus').addEventListener('click', function () { ppX = Math.min(20, ppX + 1); markTried('parabola'); ppRender(); });
  ppRender();
})();

/* ---------- demo-spin · 9.5 图形的旋转与中心对称（方法：钉住一点转） ----------
   绕中心转：对应点到中心的距离不变。三角形转 90° 不重合，正方形转 90° 重合，
   等边三角形转 120° 重合；转 180° 重合就是中心对称。 */
const SN_SHAPES = [
  { name: '三角形', pts: [[-80, 40], [80, 40], [0, -70]], back: '转 360° 才重合' },
  { name: '正方形', pts: [[-60, -60], [60, -60], [60, 60], [-60, 60]], back: '转 90° 就重合' },
  { name: '等边三角形', pts: [[0, -70], [61, 35], [-61, 35]], back: '转 120° 就重合' }
];
let snShape = 1, snAng = 90;
function snRot(pt, deg) {
  const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
  return [pt[0] * c - pt[1] * s, pt[0] * s + pt[1] * c];
}
function snRender() {
  document.querySelectorAll('#snShapeSeg [data-sn-shape]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.snShape === snShape));
  });
  document.getElementById('snAngTx').textContent = '转 ' + snAng + '°';
  const shape = SN_SHAPES[snShape];
  const svg = document.getElementById('snSvg');
  g9Clear(svg);
  const cx = 200, cy = 200;
  const poly = function (pts, fill, stroke) {
    const p = g9El('polygon', { points: pts.map(function (q) { return (cx + q[0]) + ',' + (cy + q[1]); }).join(' '), fill: fill, stroke: stroke, 'stroke-width': 3 });
    svg.appendChild(p);
  };
  poly(shape.pts, '#f1f5f9', '#94a3b8');
  poly(shape.pts.map(function (q) { return snRot(q, snAng); }), '#dbeafe', '#2563eb');
  const o = g9El('circle', { cx: cx, cy: cy, r: 7, fill: '#ff8a3d', stroke: '#fff', 'stroke-width': 2 });
  svg.appendChild(o);
  g9SvgText(svg, cx + 12, cy - 10, '旋转中心 O', 15, '#c2410c', 'start');
  const a0 = shape.pts[0], a1 = snRot(a0, snAng);
  g9SvgLine(svg, cx, cy, cx + a0[0], cy + a0[1], '#94a3b8', 2, '5 4');
  g9SvgLine(svg, cx, cy, cx + a1[0], cy + a1[1], '#2563eb', 2, '5 4');
  const d = Math.sqrt(a0[0] * a0[0] + a0[1] * a0[1]);
  const coinc = (snShape === 1 && snAng % 90 === 0 && snAng !== 0) || (snShape === 2 && snAng % 120 === 0 && snAng !== 0);
  let read = shape.name + '绕中心 O 转 ' + snAng + '°：对应点到 O 的距离都是 ' + fmtNum(d) + '，转前转后距离没变。';
  let msg = '';
  if (snAng === 180) msg = '转 180° 后，对应点连线都经过 O、被 O 平分——这就是中心对称。';
  else if (snAng === 0) msg = '还没转。点一点“＋”，看图形怎么转。';
  else if (coinc) msg = shape.name + '转 ' + snAng + '° 就和原来重合了（' + shape.back + '）。';
  else msg = shape.name + '转 ' + snAng + '° 还没和原来重合（' + shape.back + '）；但形状和大小一点没变。';
  document.getElementById('snRead').textContent = read;
  document.getElementById('snMsg').textContent = msg;
}
(function snInit() {
  const shapeSeg = document.getElementById('snShapeSeg');
  SN_SHAPES.forEach(function (sh, i) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = sh.name; b.dataset.snShape = String(i);
    b.addEventListener('click', function () { snShape = i; markTried('spin'); snRender(); });
    shapeSeg.appendChild(b);
  });
  document.getElementById('snAngMinus').addEventListener('click', function () { snAng = (snAng + 330) % 360; markTried('spin'); snRender(); });
  document.getElementById('snAngPlus').addEventListener('click', function () { snAng = (snAng + 30) % 360; markTried('spin'); snRender(); });
  document.getElementById('snHalfBtn').addEventListener('click', function () { snAng = 180; markTried('spin'); snRender(); });
  snRender();
})();

/* ---------- demo-circangle · 9.6 圆的有关性质（方法：站圆上看弦法） ----------
   A 在 150°、B 在 30°，圆心角 ∠AOB=120°；点 C 在优弧上走，圆周角永远是 60°，
   走到劣弧上就变成 120°。垂径模式：r=5，弦 8→距 3，弦 6→距 4（3-4-5）。 */
let cjMode = 'angle', cjCPos = 0, cjChord = 8;
const CJ_CPOS = [
  { name: '优弧上 · 210°', ang: 210, expect: 60 },
  { name: '优弧上 · 250°', ang: 250, expect: 60 },
  { name: '优弧上 · 290°', ang: 290, expect: 60 },
  { name: '劣弧上 · 90°', ang: 90, expect: 120 }
];
function cjPt(ang, r) {
  const rad = ang * Math.PI / 180;
  return [200 + r * Math.cos(rad), 200 - r * Math.sin(rad)];
}
function cjAngleAt(c, a, b) {
  const v1 = [a[0] - c[0], a[1] - c[1]], v2 = [b[0] - c[0], b[1] - c[1]];
  const dot = v1[0] * v2[0] + v1[1] * v2[1];
  const n1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]), n2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
  return Math.acos(Math.max(-1, Math.min(1, dot / (n1 * n2)))) * 180 / Math.PI;
}
function cjDrawAngle() {
  const svg = document.getElementById('cjSvg');
  g9Clear(svg);
  svg.appendChild(g9El('circle', { cx: 200, cy: 200, r: 120, fill: 'none', stroke: '#2563eb', 'stroke-width': 3 }));
  const A = cjPt(150, 120), B = cjPt(30, 120), C = cjPt(CJ_CPOS[cjCPos].ang, 120);
  g9SvgLine(svg, 200, 200, A[0], A[1], '#94a3b8', 2);
  g9SvgLine(svg, 200, 200, B[0], B[1], '#94a3b8', 2);
  g9SvgLine(svg, C[0], C[1], A[0], A[1], '#2563eb', 3);
  g9SvgLine(svg, C[0], C[1], B[0], B[1], '#2563eb', 3);
  [[200, 200, 'O'], [A[0], A[1], 'A'], [B[0], B[1], 'B'], [C[0], C[1], 'C']].forEach(function (p) {
    svg.appendChild(g9El('circle', { cx: p[0], cy: p[1], r: 6, fill: '#ff8a3d', stroke: '#fff', 'stroke-width': 2 }));
    g9SvgText(svg, p[0] + 12, p[1] - 8, p[2], 16, '#1e293b', 'start');
  });
  return cjAngleAt(C, A, B);
}
function cjDrawChord() {
  const svg = document.getElementById('cjChordSvg');
  g9Clear(svg);
  const cx = 200, cy = 200, R = 120, scale = R / 5;
  svg.appendChild(g9El('circle', { cx: cx, cy: cy, r: R, fill: 'none', stroke: '#2563eb', 'stroke-width': 3 }));
  const half = cjChord / 2, d = Math.sqrt(25 - half * half);
  const y = cy - d * scale;
  const x1 = cx - half * scale, x2 = cx + half * scale;
  g9SvgLine(svg, x1, y, x2, y, '#2563eb', 3);
  g9SvgLine(svg, cx, cy - R, cx, cy + R, '#f59e0b', 2, '6 4');
  g9SvgLine(svg, cx, cy, cx, y, '#ef4444', 3);
  svg.appendChild(g9El('circle', { cx: cx, cy: cy, r: 6, fill: '#ff8a3d', stroke: '#fff', 'stroke-width': 2 }));
  g9SvgText(svg, cx + 12, cy + 6, 'O', 16, '#1e293b', 'start');
  g9SvgText(svg, (x1 + x2) / 2, y - 10, '弦长 ' + cjChord, 15, '#1e293b');
  g9SvgText(svg, cx + 10, (cy + y) / 2, '距 ' + fmtNum(d), 15, '#dc2626', 'start');
  return d;
}
function cjRender() {
  document.querySelectorAll('#cjModeSeg [data-cj-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.cjMode === cjMode));
  });
  document.querySelectorAll('#cjCPosSeg [data-cj-cpos]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.cjCpos === cjCPos));
  });
  document.getElementById('cjAngleBox').hidden = cjMode !== 'angle';
  document.getElementById('cjChordBox').hidden = cjMode !== 'chord';
  document.getElementById('cjChordTx').textContent = '弦长 ' + cjChord;
  let read = '', msg = '';
  if (cjMode === 'angle') {
    const ang = cjDrawAngle();
    read = '圆心角 ∠AOB=120°，点 C 在' + CJ_CPOS[cjCPos].name + '，圆周角 ∠ACB=' + Math.round(ang) + '°。';
    msg = cjCPos < 3
      ? '点 C 在优弧上怎么走，∠ACB 都是 60°——同弧所对的圆周角相等，都是圆心角的一半。'
      : '点 C 走到了劣弧上：它看的是另一条弧，∠ACB 变成 120°，是 240° 圆心角的一半。';
  } else {
    const d = cjDrawChord();
    read = '半径 5，弦长 ' + cjChord + '，弦到圆心的距离是 ' + fmtNum(d) + '。';
    msg = '直径垂直于弦，弦被平分成两段：' + fmtNum(cjChord / 2) + '²+' + fmtNum(d) + '²=5²，勾股定理算出来的。注意：平分弦的直径垂直于弦，前提是这条弦不是直径。';
  }
  document.getElementById('cjRead').textContent = read;
  document.getElementById('cjMsg').textContent = msg;
}
(function cjInit() {
  const modeSeg = document.getElementById('cjModeSeg');
  [['angle', '圆周角'], ['chord', '垂径定理']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.cjMode = m[0];
    b.addEventListener('click', function () { cjMode = m[0]; markTried('circangle'); cjRender(); });
    modeSeg.appendChild(b);
  });
  const cposSeg = document.getElementById('cjCPosSeg');
  CJ_CPOS.forEach(function (c, i) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = c.name; b.dataset.cjCpos = String(i);
    b.addEventListener('click', function () { cjCPos = i; markTried('circangle'); cjRender(); });
    cposSeg.appendChild(b);
  });
  document.getElementById('cjChordMinus').addEventListener('click', function () { cjChord = cjChord === 8 ? 6 : 8; markTried('circangle'); cjRender(); });
  document.getElementById('cjChordPlus').addEventListener('click', function () { cjChord = cjChord === 8 ? 6 : 8; markTried('circangle'); cjRender(); });
  cjRender();
})();

/* ---------- demo-tangent · 9.7 点、直线和圆的位置关系（方法：距离比半径法） ----------
   r=4：d=5 相离（0 个交点）、d=4 相切（1 个）、d=3 相交（2 个）。
   切线长：OP=5 时 PA=PB=3（3-4-5）；OP=10 时是 √84≈9.17。 */
let tgMode = 'line', tgD = 5, tgOP = 5;
function tgDrawLine() {
  const svg = document.getElementById('tgSvg');
  g9Clear(svg);
  const cx = 200, cy = 180, R = 100, scale = 25;
  svg.appendChild(g9El('circle', { cx: cx, cy: cy, r: R, fill: 'none', stroke: '#2563eb', 'stroke-width': 3 }));
  const ly = cy - tgD * scale;
  g9SvgLine(svg, 40, ly, 360, ly, '#ef4444', 3);
  g9SvgLine(svg, cx, cy, cx, ly, '#94a3b8', 2, '5 4');
  svg.appendChild(g9El('circle', { cx: cx, cy: cy, r: 6, fill: '#ff8a3d', stroke: '#fff', 'stroke-width': 2 }));
  g9SvgText(svg, cx + 12, cy + 6, 'O', 16, '#1e293b', 'start');
  g9SvgText(svg, 350, ly - 10, 'd=' + tgD, 15, '#dc2626', 'end');
  g9SvgText(svg, cx, cy + R + 24, 'r=4', 15, '#1e293b');
}
function tgDrawTan() {
  const svg = document.getElementById('tgTanSvg');
  g9Clear(svg);
  const cx = 160, cy = 180, scale = 25, R = 4 * scale;
  const px = cx + tgOP * scale;
  const L = Math.sqrt(tgOP * tgOP - 16);
  const tx = 16 / tgOP, ty = 4 * L / tgOP;
  svg.appendChild(g9El('circle', { cx: cx, cy: cy, r: R, fill: 'none', stroke: '#2563eb', 'stroke-width': 3 }));
  [[tx, ty], [tx, -ty]].forEach(function (t) {
    const x = cx + t[0] * scale, y = cy - t[1] * scale;
    g9SvgLine(svg, cx, cy, x, y, '#94a3b8', 2);
    g9SvgLine(svg, px, cy, x, y, '#ef4444', 3);
    svg.appendChild(g9El('circle', { cx: x, cy: y, r: 6, fill: '#ff8a3d', stroke: '#fff', 'stroke-width': 2 }));
  });
  g9SvgLine(svg, cx, cy, px, cy, '#94a3b8', 2, '5 4');
  svg.appendChild(g9El('circle', { cx: cx, cy: cy, r: 6, fill: '#ff8a3d', stroke: '#fff', 'stroke-width': 2 }));
  svg.appendChild(g9El('circle', { cx: px, cy: cy, r: 7, fill: '#16a34a', stroke: '#fff', 'stroke-width': 2 }));
  g9SvgText(svg, cx - 12, cy + 6, 'O', 16, '#1e293b', 'end');
  g9SvgText(svg, px + 10, cy + 6, 'P', 16, '#1e293b', 'start');
  return L;
}
function tgRender() {
  document.querySelectorAll('#tgModeSeg [data-tg-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.tgMode === tgMode));
  });
  document.getElementById('tgLineBox').hidden = tgMode !== 'line';
  document.getElementById('tgTanBox').hidden = tgMode !== 'tan';
  document.getElementById('tgDTx').textContent = 'd = ' + tgD;
  document.getElementById('tgOPTx').textContent = 'OP = ' + tgOP;
  let read = '', msg = '';
  if (tgMode === 'line') {
    tgDrawLine();
    if (tgD > 4) { read = 'r=4，d=' + tgD + '：d>r，直线和圆相离，0 个交点。'; msg = '直线离得太远，碰不上圆。再往下挪 1 格，d=4，就刚好碰一下。'; }
    else if (tgD === 4) { read = 'r=4，d=4：d=r，直线和圆相切，1 个交点（切点）。'; msg = '刚好碰一下：这条直线过切点、和半径垂直，就是切线。再往下挪，就穿进圆里了。'; }
    else { read = 'r=4，d=' + tgD + '：d<r，直线和圆相交，2 个交点。'; msg = '直线穿进圆里了，有两个交点。d 越小，圆里那段弦越长。'; }
  } else {
    const L = tgDrawTan();
    read = 'r=4，OP=' + tgOP + '：从 P 引两条切线，切线长 PA=PB=' + fmtNum(L) + '。';
    msg = 'PA²+4²=' + tgOP + '²，PA=√(' + (tgOP * tgOP - 16) + ')=' + fmtNum(L) + '。两条切线和两条半径构成两个全等的直角三角形，所以切线长相等。';
  }
  document.getElementById('tgRead').textContent = read;
  document.getElementById('tgMsg').textContent = msg;
}
(function tgInit() {
  const modeSeg = document.getElementById('tgModeSeg');
  [['line', '直线和圆'], ['tan', '切线长']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.tgMode = m[0];
    b.addEventListener('click', function () { tgMode = m[0]; markTried('tangent'); tgRender(); });
    modeSeg.appendChild(b);
  });
  document.getElementById('tgDMinus').addEventListener('click', function () { tgD = Math.max(0, tgD - 1); markTried('tangent'); tgRender(); });
  document.getElementById('tgDPlus').addEventListener('click', function () { tgD = Math.min(7, tgD + 1); markTried('tangent'); tgRender(); });
  document.getElementById('tgOPMinus').addEventListener('click', function () { tgOP = Math.max(5, tgOP - 1); markTried('tangent'); tgRender(); });
  document.getElementById('tgOPPlus').addEventListener('click', function () { tgOP = Math.min(10, tgOP + 1); markTried('tangent'); tgRender(); });
  tgRender();
})();

/* ---------- demo-sector · 9.8 弧长和扇形面积（方法：几分之几法） ----------
   扇形：l=nπr/180，S=nπr²/360；默认 r=6、n=60°：弧长 2π，面积 6π。
   圆锥：母线 l=5，底面半径 r=3：侧面积 πrl=15π，展开扇形圆心角 216°。 */
let sfMode = 'sector', sfR = 6, sfN = 60, sfCR = 3;
function sfDrawSector() {
  const svg = document.getElementById('sfSvg');
  g9Clear(svg);
  const cx = 200, cy = 200, R = 130;
  const a = sfN * Math.PI / 180;
  const x = cx + R * Math.cos(a), y = cy - R * Math.sin(a);
  const large = sfN > 180 ? 1 : 0;
  svg.appendChild(g9El('path', { d: 'M' + cx + ',' + cy + ' L' + (cx + R) + ',' + cy + ' A' + R + ',' + R + ' 0 ' + large + ' 0 ' + x.toFixed(1) + ',' + y.toFixed(1) + ' Z', fill: '#dbeafe', stroke: '#2563eb', 'stroke-width': 3 }));
  g9SvgText(svg, cx + 60, cy + 24, 'n=' + sfN + '°', 15, '#1e293b');
  g9SvgText(svg, cx + R / 2, cy + 18, 'r=' + sfR, 15, '#1e293b');
}
function sfDrawCone() {
  const svg = document.getElementById('sfConeSvg');
  g9Clear(svg);
  const cx = 200, cy = 200, R = 130;
  const n = 360 * sfCR / 5, a = n * Math.PI / 180;
  const x = cx + R * Math.cos(a), y = cy - R * Math.sin(a);
  const large = n > 180 ? 1 : 0;
  svg.appendChild(g9El('path', { d: 'M' + cx + ',' + cy + ' L' + (cx + R) + ',' + cy + ' A' + R + ',' + R + ' 0 ' + large + ' 0 ' + x.toFixed(1) + ',' + y.toFixed(1) + ' Z', fill: '#fef3c7', stroke: '#d97706', 'stroke-width': 3 }));
  g9SvgText(svg, cx + 52, cy + 24, 'n=' + fmtNum(n) + '°', 15, '#1e293b');
  g9SvgText(svg, cx + R / 2, cy + 18, 'l=5', 15, '#1e293b');
}
function sfRender() {
  document.querySelectorAll('#sfModeSeg [data-sf-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.sfMode === sfMode));
  });
  document.getElementById('sfSectorBox').hidden = sfMode !== 'sector';
  document.getElementById('sfConeBox').hidden = sfMode !== 'cone';
  document.getElementById('sfRTx').textContent = 'r = ' + sfR;
  document.getElementById('sfNTx').textContent = 'n = ' + sfN + '°';
  document.getElementById('sfCRTx').textContent = 'r = ' + sfCR;
  let read = '', msg = '';
  if (sfMode === 'sector') {
    sfDrawSector();
    const l = sfN * Math.PI * sfR / 180, s = sfN * Math.PI * sfR * sfR / 360;
    read = 'r=' + sfR + '，n=' + sfN + '°：弧长 l=' + fmtNum(l) + '（' + sfN + 'π×' + sfR + '÷180=' + fmtNum(sfN * sfR / 180) + 'π），扇形面积 S=' + fmtNum(s) + '。';
    msg = '圆心角占 360° 的 ' + fmtNum(sfN / 360) + '，弧长就是圆周长的 ' + fmtNum(sfN / 360) + '，面积就是圆面积的 ' + fmtNum(sfN / 360) + '。扇形面积也可以算 (1/2)lr。';
  } else {
    sfDrawCone();
    const n = 360 * sfCR / 5;
    read = '圆锥：底面半径 ' + sfCR + '，母线 l=5，侧面积=πrl=' + (sfCR * 5) + 'π≈' + fmtNum(sfCR * 5 * Math.PI) + '。';
    msg = '侧面摊开是扇形：扇形的弧长=底面圆的周长 2π×' + sfCR + '=' + (2 * sfCR) + 'π，圆心角 n=360°×' + sfCR + '÷5=' + fmtNum(n) + '°。';
  }
  document.getElementById('sfRead').textContent = read;
  document.getElementById('sfMsg').textContent = msg;
}
(function sfInit() {
  const modeSeg = document.getElementById('sfModeSeg');
  [['sector', '扇形'], ['cone', '圆锥展开']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.sfMode = m[0];
    b.addEventListener('click', function () { sfMode = m[0]; markTried('sector'); sfRender(); });
    modeSeg.appendChild(b);
  });
  document.getElementById('sfRMinus').addEventListener('click', function () { sfR = Math.max(3, sfR - 1); markTried('sector'); sfRender(); });
  document.getElementById('sfRPlus').addEventListener('click', function () { sfR = Math.min(10, sfR + 1); markTried('sector'); sfRender(); });
  document.getElementById('sfNMinus').addEventListener('click', function () { sfN = Math.max(30, sfN - 30); markTried('sector'); sfRender(); });
  document.getElementById('sfNPlus').addEventListener('click', function () { sfN = Math.min(360, sfN + 30); markTried('sector'); sfRender(); });
  document.getElementById('sfCRMinus').addEventListener('click', function () { sfCR = Math.max(2, sfCR - 1); markTried('sector'); sfRender(); });
  document.getElementById('sfCRPlus').addEventListener('click', function () { sfCR = Math.min(5, sfCR + 1); markTried('sector'); sfRender(); });
  sfRender();
})();

/* ---------- demo-coin · 9.9 随机事件与概率（方法：长期频率法） ----------
   抛硬币：次数越多，正面频率越贴近 1/2。摸红球：3 红 2 白，摸到红球的概率是 3/5。 */
let cfMode = 'coin', cfToss = 0, cfHeads = 0, cfDraws = 0, cfReds = 0;
function cfRender() {
  document.querySelectorAll('#cfModeSeg [data-cf-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.cfMode === cfMode));
  });
  document.getElementById('cfCoinBox').hidden = cfMode !== 'coin';
  document.getElementById('cfBallBox').hidden = cfMode !== 'ball';
  let read = '', msg = '';
  if (cfMode === 'coin') {
    if (cfToss === 0) { read = '还没抛。点“抛 10 次”或“抛 100 次”。'; msg = '抛硬币 1000 次，正面大约 500 次——频率越抛越接近 1/2。'; }
    else {
      const f = cfHeads / cfToss;
      read = '抛了 ' + cfToss + ' 次，正面 ' + cfHeads + ' 次，频率是 ' + fmtNum(f) + '。';
      msg = cfToss < 100
        ? '只抛了 ' + cfToss + ' 次，频率 ' + fmtNum(f) + ' 离 1/2 还有点远——次数少，波动大。再抛 100 次试试。'
        : '抛了 ' + cfToss + ' 次，频率 ' + fmtNum(f) + '，越来越贴近 1/2。概率不是“下一次一定怎么样”，而是“很多次下来大概怎么样”。';
    }
  } else {
    if (cfDraws === 0) { read = '袋子里 3 个红球、2 个白球。摸到红球的概率是 3/5=0.6。'; msg = '点“摸一个球”，摸完放回去再摸。'; }
    else {
      read = '摸了 ' + cfDraws + ' 次，红球 ' + cfReds + ' 次，频率是 ' + fmtNum(cfReds / cfDraws) + '；理论概率是 3/5=0.6。';
      msg = '摸得越多，频率越接近 3/5。每次摸之前，红球还是 3 个、白球还是 2 个——前面摸到什么，不影响下一次。';
    }
  }
  document.getElementById('cfRead').textContent = read;
  document.getElementById('cfMsg').textContent = msg;
}
(function cfInit() {
  const modeSeg = document.getElementById('cfModeSeg');
  [['coin', '抛硬币'], ['ball', '摸红球']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.cfMode = m[0];
    b.addEventListener('click', function () { cfMode = m[0]; markTried('coin'); cfRender(); });
    modeSeg.appendChild(b);
  });
  document.getElementById('cfToss10').addEventListener('click', function () {
    for (let i = 0; i < 10; i++) { cfToss++; if (Math.random() < 0.5) cfHeads++; }
    markTried('coin'); cfRender();
  });
  document.getElementById('cfToss100').addEventListener('click', function () {
    for (let i = 0; i < 100; i++) { cfToss++; if (Math.random() < 0.5) cfHeads++; }
    markTried('coin'); cfRender();
  });
  document.getElementById('cfReset').addEventListener('click', function () { cfToss = 0; cfHeads = 0; markTried('coin'); cfRender(); });
  document.getElementById('cfDrawBtn').addEventListener('click', function () {
    cfDraws++; if (Math.random() < 0.6) cfReds++;
    markTried('coin'); cfRender();
  });
  document.getElementById('cfDrawReset').addEventListener('click', function () { cfDraws = 0; cfReds = 0; markTried('coin'); cfRender(); });
  cfRender();
})();

/* ---------- demo-tree · 9.10 列举法求概率（方法：摆出来数清法） ----------
   两枚硬币 4 种结果，两正 1/4；两枚骰子 36 种，和为 7 有 6 种，概率 1/6；
   1、2、3、4 抽两张（不放回）6 种组合，两张都奇数 1 种，概率 1/6。 */
const TW_SCEN = [
  { name: '两枚硬币', levels: [['正面', '反面'], ['正正', '正反', '反正', '反反']], total: '4 种', fav: '两枚都是正面：1 种，概率 1/4' },
  { name: '两枚骰子 · 和为 7', levels: [['1', '2', '3', '4', '5', '6'], ['(1,6)', '(2,5)', '(3,4)', '(4,3)', '(5,2)', '(6,1)']], total: '36 种', fav: '点数和是 7：6 种，概率 6/36=1/6' },
  { name: '抽两张卡片', levels: [['1', '2', '3', '4'], ['(1,2)', '(1,3)', '(1,4)', '(2,3)', '(2,4)', '(3,4)']], total: '6 种组合', fav: '两张都是奇数：(1,3) 只有 1 种，概率 1/6' }
];
let twScen = 0, twStep = 0;
function twRender() {
  document.querySelectorAll('#twScenSeg [data-tw-scen]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.twScen === twScen));
  });
  const sc = TW_SCEN[twScen];
  let read = '', msg = '';
  if (twStep === 0) { read = sc.name + '：先想一想，第一步有几种可能？点“长出下一层”。'; msg = '列表和画树是“把所有可能都摆出来数”——数清楚了，概率就不会漏、不会重。'; }
  else if (twStep === 1) { read = sc.name + '：第一层长出来了——' + sc.levels[0].join('、') + '。再点一次，第二层长出来。'; msg = '第一步有 ' + sc.levels[0].length + ' 种可能，每一种下面再分叉。'; }
  else {
    read = sc.name + '：一共 ' + sc.total + '：' + sc.levels[1].join('、') + '。' + sc.fav + '。';
    msg = twScen === 1
      ? '点数和有 2~12 共 11 种，但它们不是等可能的：和是 7 有 6 种组合，和是 2 只有 1 种。'
      : '先数清“所有等可能结果”，再数“合要求的有几种”，一除就是概率。';
  }
  document.getElementById('twRead').textContent = read;
  document.getElementById('twMsg').textContent = msg;
}
(function twInit() {
  const scenSeg = document.getElementById('twScenSeg');
  TW_SCEN.forEach(function (sc, i) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = sc.name; b.dataset.twScen = String(i);
    b.addEventListener('click', function () { twScen = i; twStep = 0; markTried('tree'); twRender(); });
    scenSeg.appendChild(b);
  });
  document.getElementById('twNextBtn').addEventListener('click', function () { twStep = Math.min(2, twStep + 1); markTried('tree'); twRender(); });
  document.getElementById('twResetBtn').addEventListener('click', function () { twStep = 0; markTried('tree'); twRender(); });
  twRender();
})();

/* ---------- demo-hyperbola · 9.11 反比例函数（方法：乘积一定法） ----------
   y=k/x：k>0 在一、三象限，k<0 在二、四象限；点 P 向两轴作垂线，矩形面积永远是 |k|。
   默认 k=6、x=2：P(2,3)，面积 6；点 (−2,−3) 也在同一条曲线上。 */
const HB_KS = [-12, -8, -6, -4, -2, 2, 4, 6, 8, 12];
let hbKi = 7, hbX = 2;
function hbDraw() {
  const svg = document.getElementById('hbSvg');
  g9Clear(svg);
  const k = HB_KS[hbKi];
  const px = function (x) { return 320 + x * 50; }, py = function (y) { return 180 - y * 20; };
  g9SvgLine(svg, 20, 180, 620, 180, '#94a3b8', 2);
  g9SvgLine(svg, 320, 20, 320, 340, '#94a3b8', 2);
  g9SvgText(svg, 612, 168, 'x', 15, '#64748b');
  g9SvgText(svg, 332, 30, 'y', 15, '#64748b');
  [[-6, -0.3], [0.3, 6]].forEach(function (rg) {
    let d = '';
    for (let x = rg[0]; x <= rg[1]; x += 0.1) {
      const y = k / x;
      if (y < -8.5 || y > 8.5) continue;
      d += (d ? ' L' : 'M') + px(x).toFixed(1) + ',' + py(y).toFixed(1);
    }
    if (d) svg.appendChild(g9El('path', { d: d, fill: 'none', stroke: '#2563eb', 'stroke-width': 3 }));
  });
  const y = k / hbX;
  const rx = Math.min(px(0), px(hbX)), rw = Math.abs(px(hbX) - px(0));
  const ry = Math.min(py(0), py(y)), rh = Math.abs(py(y) - py(0));
  svg.appendChild(g9El('rect', { x: rx, y: ry, width: rw, height: rh, fill: '#fef3c7', stroke: '#d97706', 'stroke-width': 2 }));
  g9SvgLine(svg, px(hbX), py(0), px(hbX), py(y), '#d97706', 2, '5 4');
  g9SvgLine(svg, px(0), py(y), px(hbX), py(y), '#d97706', 2, '5 4');
  svg.appendChild(g9El('circle', { cx: px(hbX), cy: py(y), r: 8, fill: '#ff8a3d', stroke: '#fff', 'stroke-width': 2 }));
  g9SvgText(svg, px(hbX) + 10, py(y) - 10, 'P(' + hbX + ',' + fmtNum(y) + ')', 15, '#c2410c', 'start');
}
function hbRender() {
  const k = HB_KS[hbKi];
  document.getElementById('hbKTx').textContent = 'k = ' + k;
  document.getElementById('hbXTx').textContent = 'x = ' + hbX;
  hbDraw();
  const y = k / hbX;
  const quad = k > 0 ? '第一、三象限' : '第二、四象限';
  const trend = k > 0 ? '在每个象限内，y 随 x 增大而减小' : '在每个象限内，y 随 x 增大而增大';
  const read = 'y=' + k + '/x：图象在' + quad + '；点 P(' + hbX + ',' + fmtNum(y) + ')，矩形面积 |xy|=' + Math.abs(hbX * y) + '=|k|。';
  const msg = trend + '。点 (' + (-hbX) + ',' + fmtNum(-y) + ') 也在同一条曲线上——横纵坐标乘积也是 ' + k + '，双曲线关于原点对称。';
  document.getElementById('hbRead').textContent = read;
  document.getElementById('hbMsg').textContent = msg;
}
(function hbInit() {
  document.getElementById('hbKMinus').addEventListener('click', function () { hbKi = Math.max(0, hbKi - 1); markTried('hyperbola'); hbRender(); });
  document.getElementById('hbKPlus').addEventListener('click', function () { hbKi = Math.min(HB_KS.length - 1, hbKi + 1); markTried('hyperbola'); hbRender(); });
  document.getElementById('hbXMinus').addEventListener('click', function () { hbX = hbX - 1; if (hbX === 0) hbX = -1; if (hbX < -6) hbX = -6; markTried('hyperbola'); hbRender(); });
  document.getElementById('hbXPlus').addEventListener('click', function () { hbX = hbX + 1; if (hbX === 0) hbX = 1; if (hbX > 6) hbX = 6; markTried('hyperbola'); hbRender(); });
  hbRender();
})();

/* ---------- demo-similar · 9.12 图形的相似与位似（方法：按比例放大法） ----------
   原三角形 3-4-5（周长 12，面积 6）：放大 k 倍，边长 ×k，周长 ×k，面积 ×k²。
   位似：OA=2，OA′=2k；k=3 时面积 5×9=45（9.12 奥数题）。 */
const SI_KS = [1, 1.5, 2, 2.5, 3];
let siMode = 'similar', siKi = 2;
function siDraw() {
  const svg = document.getElementById('siSvg');
  g9Clear(svg);
  const k = SI_KS[siKi];
  const tri = function (ox, oy, s, fill, stroke) {
    const pts = [[ox, oy], [ox + 3 * s, oy], [ox, oy - 4 * s]];
    svg.appendChild(g9El('polygon', { points: pts.map(function (q) { return q[0] + ',' + q[1]; }).join(' '), fill: fill, stroke: stroke, 'stroke-width': 3 }));
    return pts;
  };
  if (siMode === 'similar') {
    tri(80, 300, 20, '#f1f5f9', '#94a3b8');
    g9SvgText(svg, 140, 322, '3-4-5', 15, '#64748b');
    tri(360, 300, 20 * k, '#dbeafe', '#2563eb');
    g9SvgText(svg, 360 + 3 * 20 * k / 2, 322, fmtNum(3 * k) + '-' + fmtNum(4 * k) + '-' + fmtNum(5 * k), 15, '#1e293b');
    g9SvgText(svg, 360, 60, '放大 ' + fmtNum(k) + ' 倍', 16, '#1e293b');
  } else {
    const ox = 320, oy = 180;
    svg.appendChild(g9El('circle', { cx: ox, cy: oy, r: 7, fill: '#ff8a3d', stroke: '#fff', 'stroke-width': 2 }));
    g9SvgText(svg, ox + 12, oy - 10, '位似中心 O', 15, '#c2410c', 'start');
    const A = [ox + 40, oy + 30], B = [ox + 100, oy + 30], C = [ox + 40, oy - 50];
    const sc = function (p) { return [ox + (p[0] - ox) * k, oy + (p[1] - oy) * k]; };
    [A, B, C].forEach(function (p) { g9SvgLine(svg, ox, oy, sc(p)[0], sc(p)[1], '#94a3b8', 2, '5 4'); });
    const poly = function (pts, fill, stroke) {
      svg.appendChild(g9El('polygon', { points: pts.map(function (q) { return q[0] + ',' + q[1]; }).join(' '), fill: fill, stroke: stroke, 'stroke-width': 3 }));
    };
    poly([A, B, C], '#f1f5f9', '#94a3b8');
    poly([sc(A), sc(B), sc(C)], '#dbeafe', '#2563eb');
    g9SvgText(svg, A[0] + 8, A[1] + 16, 'A', 15, '#1e293b', 'start');
    g9SvgText(svg, sc(A)[0] + 8, sc(A)[1] + 16, "A'", 15, '#1e293b', 'start');
  }
}
function siRender() {
  document.querySelectorAll('#siModeSeg [data-si-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.siMode === siMode));
  });
  document.getElementById('siKTx').textContent = 'k = ' + fmtNum(SI_KS[siKi]);
  siDraw();
  const k = SI_KS[siKi];
  let read = '', msg = '';
  if (siMode === 'similar') {
    read = '3-4-5 的三角形放大 ' + fmtNum(k) + ' 倍：边长是 ' + fmtNum(3 * k) + '、' + fmtNum(4 * k) + '、' + fmtNum(5 * k) + '，周长 ' + fmtNum(12 * k) + '（×' + fmtNum(k) + '），面积 ' + fmtNum(6 * k * k) + '（×' + fmtNum(k * k) + '）。';
    msg = '周长比等于相似比，面积比等于相似比的平方：长和宽都乘了 ' + fmtNum(k) + '，面积就乘了 ' + fmtNum(k) + '²=' + fmtNum(k * k) + '。';
  } else {
    read = '位似中心 O，OA=2，放大 ' + fmtNum(k) + ' 倍：OA′=' + fmtNum(2 * k) + '，面积比是 ' + fmtNum(k * k) + '。';
    msg = k === 3
      ? '△ABC 与 △DEF 位似，OA=2，OD=6，相似比是 3，△ABC 的面积是 5，△DEF 的面积是 5×9=45。'
      : '位似是特殊的相似：对应点连线都交于位似中心 O。对应点到 O 的距离也成比例。';
  }
  document.getElementById('siRead').textContent = read;
  document.getElementById('siMsg').textContent = msg;
}
(function siInit() {
  const modeSeg = document.getElementById('siModeSeg');
  [['similar', '相似放大'], ['homothety', '位似']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.siMode = m[0];
    b.addEventListener('click', function () { siMode = m[0]; markTried('similar'); siRender(); });
    modeSeg.appendChild(b);
  });
  document.getElementById('siKMinus').addEventListener('click', function () { siKi = Math.max(0, siKi - 1); markTried('similar'); siRender(); });
  document.getElementById('siKPlus').addEventListener('click', function () { siKi = Math.min(SI_KS.length - 1, siKi + 1); markTried('similar'); siRender(); });
  siRender();
})();

/* ---------- demo-shadow · 9.13 相似三角形（方法：影子测高法） ----------
   影子测高：你高 1.6 米，影子 s 米，旗杆影子 12 米，旗杆高 1.6×12÷s；
   s=2 时是 9.6 米。AA 判定：∠B=60° 固定，∠A 可调，第三个角被 180° 定住。 */
let swMode = 'shadow', swS = 2, swA = 50;
function swDrawShadow() {
  const svg = document.getElementById('swSvg');
  g9Clear(svg);
  const H = 19.2 / swS;
  const gy = 300, sc = 12;
  g9SvgLine(svg, 30, gy, 620, gy, '#1e293b', 3);
  const personX = 150, poleX = 430;
  const ph = 1.6 * sc, poleH = H * sc;
  g9SvgLine(svg, personX, gy, personX, gy - ph, '#2563eb', 5);
  g9SvgLine(svg, poleX, gy, poleX, gy - poleH, '#2563eb', 5);
  g9SvgLine(svg, personX, gy, personX + swS * sc, gy, '#f59e0b', 4);
  g9SvgLine(svg, poleX, gy, poleX + 12 * sc, gy, '#f59e0b', 4);
  g9SvgLine(svg, personX, gy - ph, personX + swS * sc, gy, '#94a3b8', 2, '5 4');
  g9SvgLine(svg, poleX, gy - poleH, poleX + 12 * sc, gy, '#94a3b8', 2, '5 4');
  g9SvgText(svg, personX, gy + 22, '你 1.6 米', 14, '#1e293b');
  g9SvgText(svg, poleX, gy + 22, '旗杆', 14, '#1e293b');
  g9SvgText(svg, personX + swS * sc / 2, gy - 12, '影 ' + swS + ' 米', 14, '#b45309');
  g9SvgText(svg, poleX + 12 * sc / 2, gy - 12, '影 12 米', 14, '#b45309');
  g9SvgText(svg, 320, 40, '太阳光是平行的', 16, '#64748b');
}
function swDrawAA() {
  const svg = document.getElementById('swAASvg');
  g9Clear(svg);
  const B = 60, C = 180 - swA - B;
  const draw = function (ox, base, fill, stroke) {
    const b = base * Math.sin(B * Math.PI / 180) / Math.sin(C * Math.PI / 180);
    const ax = ox + b * Math.cos(swA * Math.PI / 180), ay = 300 - b * Math.sin(swA * Math.PI / 180);
    svg.appendChild(g9El('polygon', { points: ox + ',300 ' + (ox + base) + ',300 ' + ax.toFixed(1) + ',' + ay.toFixed(1), fill: fill, stroke: stroke, 'stroke-width': 3 }));
    g9SvgText(svg, ox + 14, 288, '∠A=' + swA + '°', 14, '#1e293b', 'start');
    g9SvgText(svg, ox + base - 14, 288, '∠B=60°', 14, '#1e293b', 'end');
    g9SvgText(svg, ax, ay - 10, '∠C=' + C + '°', 14, '#1e293b');
  };
  draw(60, 200, '#dbeafe', '#2563eb');
  draw(380, 120, '#fef3c7', '#d97706');
  g9SvgText(svg, 320, 40, '两个角相等，第三个角也被 180° 定住了', 16, '#64748b');
}
function swRender() {
  document.querySelectorAll('#swModeSeg [data-sw-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.swMode === swMode));
  });
  document.getElementById('swShadowBox').hidden = swMode !== 'shadow';
  document.getElementById('swAABox').hidden = swMode !== 'aa';
  document.getElementById('swSTx').textContent = swS + ' 米';
  document.getElementById('swATx').textContent = '∠A = ' + swA + '°';
  let read = '', msg = '';
  if (swMode === 'shadow') {
    swDrawShadow();
    const H = 19.2 / swS;
    read = '你高 1.6 米，影子 ' + swS + ' 米；旗杆影子 12 米，旗杆高 1.6×12÷' + swS + '=' + fmtNum(H) + ' 米。';
    msg = '同一时刻太阳光平行，两个三角形相似：高度比=影子比。你的影子越短，算出的旗杆越高——因为比值 12÷' + swS + ' 变大了。';
  } else {
    swDrawAA();
    read = '△ABC：∠A=' + swA + '°，∠B=60°，∠C=' + (180 - swA - 60) + '°；另一个三角形也有 ∠A=' + swA + '° 和 ∠B=60°。';
    msg = '两个角相等，第三个角也被 180° 定住了，形状锁死——两个三角形相似（AA）。只有一边成比例、没有夹角，判定不了。';
  }
  document.getElementById('swRead').textContent = read;
  document.getElementById('swMsg').textContent = msg;
}
(function swInit() {
  const modeSeg = document.getElementById('swModeSeg');
  [['shadow', '影子测高'], ['aa', 'AA 判定']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.swMode = m[0];
    b.addEventListener('click', function () { swMode = m[0]; markTried('shadow'); swRender(); });
    modeSeg.appendChild(b);
  });
  document.getElementById('swSMinus').addEventListener('click', function () { swS = Math.max(1, swS - 1); markTried('shadow'); swRender(); });
  document.getElementById('swSPlus').addEventListener('click', function () { swS = Math.min(4, swS + 1); markTried('shadow'); swRender(); });
  document.getElementById('swAMinus').addEventListener('click', function () { swA = Math.max(30, swA - 10); markTried('shadow'); swRender(); });
  document.getElementById('swAPlus').addEventListener('click', function () { swA = Math.min(70, swA + 10); markTried('shadow'); swRender(); });
  swRender();
})();

/* ---------- demo-trig · 9.14 锐角三角函数（方法：角定比值定法） ----------
   斜边固定 10：∠A=30° 时对边 5、邻边约 8.66；sin²+cos²=1。
   特殊角：sin30°=1/2，sin45°=cos45°=√2/2，sin60°=√3/2。 */
const TJ_EXACT = {
  30: 'sin30°=1/2，cos30°=√3/2，tan30°=√3/3',
  45: 'sin45°=cos45°=√2/2，tan45°=1',
  60: 'sin60°=√3/2，cos60°=1/2，tan60°=√3'
};
let tjAng = 30;
function tjRender() {
  document.querySelectorAll('#tjSpecialSeg [data-tj-ang]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.tjAng === tjAng));
  });
  document.getElementById('tjAngTx').textContent = '∠A = ' + tjAng + '°';
  const svg = document.getElementById('tjSvg');
  g9Clear(svg);
  const rad = tjAng * Math.PI / 180;
  const opp = 10 * Math.sin(rad), adj = 10 * Math.cos(rad), sc = 22;
  const cx = 140, gy = 300;
  const ax = cx + adj * sc, by = gy - opp * sc;
  svg.appendChild(g9El('polygon', { points: cx + ',' + gy + ' ' + ax.toFixed(1) + ',' + gy + ' ' + cx + ',' + by.toFixed(1), fill: '#dbeafe', stroke: '#2563eb', 'stroke-width': 3 }));
  g9SvgLine(svg, cx, gy - 18, cx + 18, gy - 18, '#94a3b8', 2);
  g9SvgLine(svg, cx + 18, gy - 18, cx + 18, gy, '#94a3b8', 2);
  g9SvgText(svg, cx - 12, (gy + by) / 2, '对边 ' + fmtNum(opp), 15, '#1e293b', 'end');
  g9SvgText(svg, (cx + ax) / 2, gy + 22, '邻边 ' + fmtNum(adj), 15, '#1e293b');
  g9SvgText(svg, (cx + ax) / 2 + 10, (gy + by) / 2 - 10, '斜边 10', 15, '#1e293b', 'start');
  g9SvgText(svg, ax + 12, gy - 6, 'A', 16, '#1e293b', 'start');
  g9SvgText(svg, cx - 12, by - 6, 'B', 16, '#1e293b', 'end');
  g9SvgText(svg, cx - 12, gy + 6, 'C', 16, '#1e293b', 'end');
  const s = Math.sin(rad), c = Math.cos(rad), t = Math.tan(rad);
  const read = '∠A=' + tjAng + '°，斜边 10：对边 ' + fmtNum(opp) + '，邻边 ' + fmtNum(adj) + '；sin A=' + fmtNum(s) + '，cos A=' + fmtNum(c) + '，tan A=' + fmtNum(t) + '。';
  const msg = 'sin²A+cos²A=' + fmtNum(s * s + c * c) + '（永远是 1）。' + (TJ_EXACT[tjAng] ? TJ_EXACT[tjAng] + '。' : '把三角形放大一倍，角不变，三个比值一个都不变。');
  document.getElementById('tjRead').textContent = read;
  document.getElementById('tjMsg').textContent = msg;
}
(function tjInit() {
  const specialSeg = document.getElementById('tjSpecialSeg');
  [30, 45, 60].forEach(function (a) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = a + '°'; b.dataset.tjAng = String(a);
    b.addEventListener('click', function () { tjAng = a; markTried('trig'); tjRender(); });
    specialSeg.appendChild(b);
  });
  document.getElementById('tjAngMinus').addEventListener('click', function () { tjAng = Math.max(15, tjAng - 15); markTried('trig'); tjRender(); });
  document.getElementById('tjAngPlus').addEventListener('click', function () { tjAng = Math.min(75, tjAng + 15); markTried('trig'); tjRender(); });
  tjRender();
})();

/* ---------- demo-slope · 9.15 解直角三角形及其应用（方法：画图选函数法） ----------
   仰角：楼高=距离×tan(仰角)；默认 20 米、30°，楼高约 11.55 米。
   坡度：坡比 1:1、铅直高度 4 米时水平距离 4 米，坡面长 4√2 米≈5.66 米。 */
let soMode = 'elev', soAng = 30, soD = 20, soRatio = 1, soH = 4;
function soDrawElev() {
  const svg = document.getElementById('soSvg');
  g9Clear(svg);
  const h = soD * Math.tan(soAng * Math.PI / 180);
  const gy = 300, ox = 80, tx = ox + soD * 10, sc = 4;
  g9SvgLine(svg, 30, gy, 620, gy, '#1e293b', 3);
  g9SvgLine(svg, tx, gy, tx, gy - h * sc, '#2563eb', 5);
  g9SvgLine(svg, ox, gy, tx, gy, '#94a3b8', 2, '5 4');
  g9SvgLine(svg, ox, gy, tx, gy - h * sc, '#ef4444', 3);
  svg.appendChild(g9El('circle', { cx: ox, cy: gy, r: 7, fill: '#ff8a3d', stroke: '#fff', 'stroke-width': 2 }));
  g9SvgText(svg, ox, gy + 22, '你', 15, '#1e293b');
  g9SvgText(svg, tx, gy + 22, '楼', 15, '#1e293b');
  g9SvgText(svg, (ox + tx) / 2, gy - 12, '仰角 ' + soAng + '°', 15, '#dc2626');
  g9SvgText(svg, tx + 12, gy - h * sc / 2, fmtNum(h) + ' 米', 15, '#1e293b', 'start');
  g9SvgText(svg, (ox + tx) / 2, gy + 40, '距离 ' + soD + ' 米', 14, '#64748b');
  return h;
}
function soDrawSlope() {
  const svg = document.getElementById('soSlopeSvg');
  g9Clear(svg);
  const horiz = soH * soRatio, len = Math.sqrt(soH * soH + horiz * horiz);
  const gy = 300, ox = 80, sc = 20;
  g9SvgLine(svg, 30, gy, 620, gy, '#1e293b', 3);
  svg.appendChild(g9El('polygon', { points: ox + ',' + gy + ' ' + (ox + horiz * sc) + ',' + gy + ' ' + (ox + horiz * sc) + ',' + (gy - soH * sc), fill: '#dbeafe', stroke: '#2563eb', 'stroke-width': 3 }));
  g9SvgText(svg, ox + horiz * sc / 2, gy + 22, '水平 ' + fmtNum(horiz) + ' 米', 14, '#1e293b');
  g9SvgText(svg, ox + horiz * sc + 10, gy - soH * sc / 2, '铅直 ' + soH + ' 米', 14, '#1e293b', 'start');
  g9SvgText(svg, ox + horiz * sc / 2 - 10, gy - soH * sc / 2 - 8, '坡面 ' + fmtNum(len) + ' 米', 14, '#1e293b', 'end');
  g9SvgText(svg, 320, 40, '坡度 1:' + soRatio + '，坡度越大坡越陡', 16, '#64748b');
  return { horiz: horiz, len: len };
}
function soRender() {
  document.querySelectorAll('#soModeSeg [data-so-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.soMode === soMode));
  });
  document.querySelectorAll('#soAngSeg [data-so-ang]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.soAng === soAng));
  });
  document.querySelectorAll('#soRatioSeg [data-so-ratio]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.soRatio === soRatio));
  });
  document.getElementById('soElevBox').hidden = soMode !== 'elev';
  document.getElementById('soSlopeBox').hidden = soMode !== 'slope';
  document.getElementById('soDTx').textContent = soD + ' 米';
  document.getElementById('soHTx').textContent = soH + ' 米';
  let read = '', msg = '';
  if (soMode === 'elev') {
    const h = soDrawElev();
    read = '仰角 ' + soAng + '°，你离楼底 ' + soD + ' 米：楼高=' + soD + '×tan' + soAng + '°=' + fmtNum(h) + ' 米。';
    msg = '仰角是视线和水平线的夹角。已知邻边（距离）求对边（楼高），用正切。';
  } else {
    const r = soDrawSlope();
    read = '坡度 1:' + soRatio + '，铅直高度 ' + soH + ' 米：水平距离 ' + fmtNum(r.horiz) + ' 米，坡面长 ' + fmtNum(r.len) + ' 米。';
    msg = soRatio === 1 && soH === 4
      ? '坡面长是 4√2 米≈5.66 米：4²+4²=32，√32=4√2。坡度=铅直高度÷水平距离，越大越陡。'
      : '坡度=铅直高度÷水平距离=1:' + soRatio + '。走 ' + fmtNum(r.horiz) + ' 米水平才爬 ' + soH + ' 米高。';
  }
  document.getElementById('soRead').textContent = read;
  document.getElementById('soMsg').textContent = msg;
}
(function soInit() {
  const modeSeg = document.getElementById('soModeSeg');
  [['elev', '仰角测高'], ['slope', '坡度']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.soMode = m[0];
    b.addEventListener('click', function () { soMode = m[0]; markTried('slope'); soRender(); });
    modeSeg.appendChild(b);
  });
  const angSeg = document.getElementById('soAngSeg');
  [30, 45, 60].forEach(function (a) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = a + '°'; b.dataset.soAng = String(a);
    b.addEventListener('click', function () { soAng = a; markTried('slope'); soRender(); });
    angSeg.appendChild(b);
  });
  const ratioSeg = document.getElementById('soRatioSeg');
  [1, 2, 3].forEach(function (r) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = '1:' + r; b.dataset.soRatio = String(r);
    b.addEventListener('click', function () { soRatio = r; markTried('slope'); soRender(); });
    ratioSeg.appendChild(b);
  });
  document.getElementById('soDMinus').addEventListener('click', function () { soD = Math.max(10, soD - 5); markTried('slope'); soRender(); });
  document.getElementById('soDPlus').addEventListener('click', function () { soD = Math.min(40, soD + 5); markTried('slope'); soRender(); });
  document.getElementById('soHMinus').addEventListener('click', function () { soH = Math.max(2, soH - 1); markTried('slope'); soRender(); });
  document.getElementById('soHPlus').addEventListener('click', function () { soH = Math.min(8, soH + 1); markTried('slope'); soRender(); });
  soRender();
})();

/* ---------- demo-project · 9.16 投影与视图（方法：三个方向看影子法） ----------
   阳光：影长=高÷tan(太阳高度角)；默认高 4 米、45°，影长 4 米。
   灯光：灯高 6 米、物体高 2 米，灯离物体 d 米，影长 d/2 米。
   三视图：圆柱主/左是长方形、俯是圆形；长方体 6×3×4：主 6×4、左 3×4、俯 6×3。 */
let pjMode = 'sun', pjH = 4, pjAng = 45, pjD = 2, pjSolid = 0;
const PJ_SOLIDS = [
  { name: '圆柱', main: '长方形', left: '长方形', top: '圆形' },
  { name: '长方体（长 6、宽 3、高 4）', main: '长方形 6×4', left: '长方形 3×4', top: '长方形 6×3' },
  { name: '正方体', main: '正方形', left: '正方形', top: '正方形' }
];
function pjDrawSun() {
  const svg = document.getElementById('pjSvg');
  g9Clear(svg);
  const shadow = pjH / Math.tan(pjAng * Math.PI / 180);
  const gy = 300, sc = 30, ox = 300;
  g9SvgLine(svg, 30, gy, 620, gy, '#1e293b', 3);
  g9SvgLine(svg, ox, gy, ox, gy - pjH * sc, '#2563eb', 5);
  g9SvgLine(svg, ox, gy, ox + shadow * sc, gy, '#f59e0b', 4);
  const tan = Math.tan(pjAng * Math.PI / 180);
  g9SvgLine(svg, ox - 80, gy - pjH * sc - 80 * tan, ox + shadow * sc, gy, '#94a3b8', 2, '5 4');
  g9SvgText(svg, ox, gy + 22, '物体 ' + pjH + ' 米', 14, '#1e293b');
  g9SvgText(svg, ox + shadow * sc / 2, gy - 12, '影长 ' + fmtNum(shadow) + ' 米', 14, '#b45309');
  g9SvgText(svg, 320, 40, '阳光是平行投影，影子方向相同', 16, '#64748b');
  return shadow;
}
function pjDrawLamp() {
  const svg = document.getElementById('pjLampSvg');
  g9Clear(svg);
  const gy = 300, sc = 30, lx = 80, ly = gy - 6 * sc;
  const ox = lx + pjD * sc, shadow = pjD / 2;
  g9SvgLine(svg, 30, gy, 620, gy, '#1e293b', 3);
  svg.appendChild(g9El('circle', { cx: lx, cy: ly, r: 10, fill: '#f59e0b', stroke: '#fff', 'stroke-width': 2 }));
  g9SvgText(svg, lx, ly - 16, '灯（高 6 米）', 14, '#b45309');
  g9SvgLine(svg, ox, gy, ox, gy - 2 * sc, '#2563eb', 5);
  g9SvgLine(svg, ox, gy, ox + shadow * sc, gy, '#f59e0b', 4);
  g9SvgLine(svg, lx, ly, ox + shadow * sc, gy, '#94a3b8', 2, '5 4');
  g9SvgText(svg, ox, gy + 22, '物体 2 米', 14, '#1e293b');
  g9SvgText(svg, ox + shadow * sc / 2, gy - 12, '影长 ' + fmtNum(shadow) + ' 米', 14, '#b45309');
  g9SvgText(svg, 320, 40, '灯光是中心投影，影子向外发散', 16, '#64748b');
  return shadow;
}
function pjDrawSolid() {
  const svg = document.getElementById('pjSolidSvg');
  g9Clear(svg);
  const drawBox = function (ox, label, kind, w, h) {
    g9SvgText(svg, ox + 70, 60, label, 16, '#1e293b');
    if (kind === 'circle') svg.appendChild(g9El('circle', { cx: ox + 70, cy: 160, r: 50, fill: '#dbeafe', stroke: '#2563eb', 'stroke-width': 3 }));
    else svg.appendChild(g9El('rect', { x: ox + 70 - w / 2, y: 160 - h / 2, width: w, height: h, fill: '#dbeafe', stroke: '#2563eb', 'stroke-width': 3 }));
  };
  if (pjSolid === 0) { drawBox(20, '主视图', 'rect', 90, 130); drawBox(230, '左视图', 'rect', 90, 130); drawBox(440, '俯视图', 'circle'); }
  else if (pjSolid === 1) { drawBox(20, '主视图', 'rect', 120, 80); drawBox(230, '左视图', 'rect', 60, 80); drawBox(440, '俯视图', 'rect', 120, 60); }
  else { drawBox(20, '主视图', 'rect', 100, 100); drawBox(230, '左视图', 'rect', 100, 100); drawBox(440, '俯视图', 'rect', 100, 100); }
  g9SvgText(svg, 320, 280, '长对正、高平齐、宽相等', 16, '#64748b');
}
function pjRender() {
  document.querySelectorAll('#pjModeSeg [data-pj-mode]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.pjMode === pjMode));
  });
  document.querySelectorAll('#pjAngSeg [data-pj-ang]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.pjAng === pjAng));
  });
  document.querySelectorAll('#pjSolidSeg [data-pj-solid]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(+btn.dataset.pjSolid === pjSolid));
  });
  document.getElementById('pjSunBox').hidden = pjMode !== 'sun';
  document.getElementById('pjLampBox').hidden = pjMode !== 'lamp';
  document.getElementById('pjSolidBox').hidden = pjMode !== 'solid';
  document.getElementById('pjHTx').textContent = pjH + ' 米';
  document.getElementById('pjDTx').textContent = pjD + ' 米';
  let read = '', msg = '';
  if (pjMode === 'sun') {
    const shadow = pjDrawSun();
    read = '物体高 ' + pjH + ' 米，太阳高度角 ' + pjAng + '°：影长=' + pjH + '÷tan' + pjAng + '°=' + fmtNum(shadow) + ' 米。';
    msg = '平行投影：太阳光是平行的，影子方向相同。太阳越高，影子越短。';
  } else if (pjMode === 'lamp') {
    const shadow = pjDrawLamp();
    read = '灯高 6 米，物体高 2 米，灯离物体 ' + pjD + ' 米：影长 ' + fmtNum(shadow) + ' 米。';
    msg = '中心投影：灯光从一点发散，影子向外发散。灯离物体越远，影子越长。';
  } else {
    pjDrawSolid();
    const s = PJ_SOLIDS[pjSolid];
    read = s.name + '：主视图是' + s.main + '，左视图是' + s.left + '，俯视图是' + s.top + '。';
    msg = '三个视图合起来，立体形状就定了：主视图看高和长，俯视图看长和宽，左视图看宽和高。';
  }
  document.getElementById('pjRead').textContent = read;
  document.getElementById('pjMsg').textContent = msg;
}
(function pjInit() {
  const modeSeg = document.getElementById('pjModeSeg');
  [['sun', '阳光投影'], ['lamp', '灯光投影'], ['solid', '三视图']].forEach(function (m) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1]; b.dataset.pjMode = m[0];
    b.addEventListener('click', function () { pjMode = m[0]; markTried('project'); pjRender(); });
    modeSeg.appendChild(b);
  });
  const angSeg = document.getElementById('pjAngSeg');
  [30, 45, 60].forEach(function (a) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = a + '°'; b.dataset.pjAng = String(a);
    b.addEventListener('click', function () { pjAng = a; markTried('project'); pjRender(); });
    angSeg.appendChild(b);
  });
  const solidSeg = document.getElementById('pjSolidSeg');
  PJ_SOLIDS.forEach(function (s, i) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = s.name.split('（')[0]; b.dataset.pjSolid = String(i);
    b.addEventListener('click', function () { pjSolid = i; markTried('project'); pjRender(); });
    solidSeg.appendChild(b);
  });
  document.getElementById('pjHMinus').addEventListener('click', function () { pjH = Math.max(2, pjH - 1); markTried('project'); pjRender(); });
  document.getElementById('pjHPlus').addEventListener('click', function () { pjH = Math.min(6, pjH + 1); markTried('project'); pjRender(); });
  document.getElementById('pjDMinus').addEventListener('click', function () { pjD = Math.max(1, pjD - 1); markTried('project'); pjRender(); });
  document.getElementById('pjDPlus').addEventListener('click', function () { pjD = Math.min(4, pjD + 1); markTried('project'); pjRender(); });
  pjRender();
})();

/* ---------- 创意实验（2026-11-06）：先猜、再玩、再想明白 ----------
   每一个都是开放式 / 多解 / 有意外 / 要试好几次的真实验，不是滑杆看答案。
   mulberry32 是确定性伪随机：模拟结果每次一样，方便复现和核对（节点数见注释）。 */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/* 清空一个容器的子元素：不能用 innerHTML=''，因为桩 DOM 的 children 数组不会跟着清。 */
function clearChildren(el) { while (el.firstChild) el.removeChild(el.firstChild); }
/* ---------- 创意实验的通用件（设计原则：猜→玩→说；三档；我的发现） ---------- */
/* 三档：基础 / 提高 / 挑战。每个实验自己决定三档是什么，done(i) 点亮第 i 档。 */
/* 三档 ✓：默认只记在内存里；传了 persistKey（演示 key）就同时存进 math-sim-tiers-v1，
   刷新页面后恢复——8 个模拟的三档是“做到过”的徽章，刷新不该丢（真机复测）。
   创意实验不传：它们的状态（找到几种拼法、拼出几个解）本身只在内存里，
   只存三档会和实际状态对不上；十三的三档由 render() 按当前目标重算，也不走这里。 */
function makeTiers(el, labels, persistKey) {
  clearChildren(el);
  const chips = labels.map(function (label) {
    const s = document.createElement('span');
    s.className = 'tier-chip';
    s.textContent = '○ ' + label;
    el.appendChild(s);
    return s;
  });
  function paint(i, on) {
    if (!chips[i]) return;
    if (on) { chips[i].classList.add('done'); chips[i].textContent = '✓ ' + labels[i]; }
    else { chips[i].classList.remove('done'); chips[i].textContent = '○ ' + labels[i]; }
  }
  function persist() {
    if (!persistKey) return;
    const all = loadSimTiers();
    all[persistKey] = labels.map(function (_, i) { return chips[i].classList.contains('done'); });
    saveSimTiers(all);
  }
  if (persistKey) {
    const saved = loadSimTiers()[persistKey];
    if (saved) saved.forEach(function (on, i) { if (on) paint(i, true); });
  }
  return {
    done: function (i) { paint(i, true); persist(); },
    set: function (i, on) { paint(i, !!on); persist(); }
  };
}
/* “我的发现”：存在已有的探究作业键里（kind 'discovery'），不在这里新开键；
   探究作业列表会把它标成“我的发现”，不混进作业；挑战模式的错题另由 recordAttempt 记进错题本。 */
function wireDiscovery(demoKey, inputId, btnId, outId) {
  const input = document.getElementById(inputId);
  const out = document.getElementById(outId);
  document.getElementById(btnId).addEventListener('click', function () {
    const text = (input.value || '').trim();
    if (!text) { out.textContent = '先写一句你的发现，再记下来。'; return; }
    const list = JSON.parse(lsGet(INQUIRY_KEY) || '[]');
    list.push({ kind: 'discovery', taskId: demoKey, text: text, demo: demoKey, ts: Date.now() });
    lsSet(INQUIRY_KEY, JSON.stringify(list));
    out.textContent = '记下来了：' + text;
    labTrace('我的发现（' + demoKey + '）：' + text, true);
    input.value = '';
  });
}
/* 实验室“实验记录”：只记在本页（不存 localStorage）；挑战模式的错题另由 recordAttempt 记进错题本。 */
const labTraceLog = [];
function labTrace(text, ok) {
  labTraceLog.push({ text: text, ok: !!ok });
  if (labTraceLog.length > 40) labTraceLog.shift();
  const ul = document.getElementById('labTraceList');
  if (ul) ul.innerHTML = labTraceLog.slice(-12).map(function (e) { return '<li>' + (e.ok ? '✓ ' : '✗ ') + esc(e.text) + '</li>'; }).join('');
}

/* ---------- 创意实验 1：24点（4–5 年级，自由组合） ----------
   6 组数都用穷举验算过（精确分数算术，见 tools/smoke.js 的断言）：
   每组至少一种拼法；默认第一组 (3,4,5,6) 有 5 种不同拼法，提高档“找到两种”一上来就能拿到；
   (3,3,8,8) 只有一种真正解法 8÷(3−8÷3)，所以排在最后当挑战。
   8÷(3−8÷3) 浮点算出来是 23.99999999999999，判等用 1e-6 的容差。 */
(function () {
  const SETS = [
    { nums: [3, 4, 5, 6], hint: '先凑出 4，再乘 6。' },
    { nums: [2, 3, 4, 5], hint: '先凑出 12，再乘 2；或者先凑出 6，再乘 4。' },
    { nums: [2, 4, 6, 8], hint: '6×8 是 48，48 除以几是 24？' },
    { nums: [1, 2, 3, 4], hint: '1+3 是 4，4+2 是 6，4×6 是……' },
    { nums: [3, 6, 6, 9], hint: '6÷6 是 1，9 减去 1 是 8……' },
    { nums: [3, 3, 8, 8], hint: '8÷3 不是整数——但 3 减去它之后，再用 8 去除，试试？' }
  ];
  let si = 0, tokens = [], found = [], pred = null, hintUsed = false;
  const tiers = makeTiers(document.getElementById('tf24Tiers'),
    ['基础：拼出一种', '提高：同一组找到两种拼法', '挑战：不用提示拼出 3 3 8 8']);
  const numsEl = document.getElementById('tf24Nums');
  const exprEl = document.getElementById('tf24Expr');
  const msgEl = document.getElementById('tf24Msg');
  const foundEl = document.getElementById('tf24Found');
  const numRow = document.getElementById('tf24NumRow');
  const opRow = document.getElementById('tf24OpRow');
  function renderNums() {
    numsEl.textContent = SETS[si].nums.join('　');
    clearChildren(numRow);
    SETS[si].nums.forEach(function (n, i) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn small primary'; b.textContent = n;
      b.dataset.tf24Num = i;
      b.addEventListener('click', function () {
        if (b.disabled) return;
        tokens.push({ k: 'n', v: n, chip: i });
        b.disabled = true; b.classList.add('tf24-used');
        renderExpr();
      });
      numRow.appendChild(b);
    });
    clearChildren(opRow);
    ['+', '−', '×', '÷', '(', ')'].forEach(function (s) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn small ghost'; b.textContent = s;
      b.dataset.tf24Op = s;
      b.addEventListener('click', function () {
        const v = s === '−' ? '-' : s === '×' ? '*' : s === '÷' ? '/' : s;
        tokens.push({ k: 'o', v: v });
        renderExpr();
      });
      opRow.appendChild(b);
    });
  }
  function renderExpr() {
    exprEl.textContent = tokens.length ? tokens.map(function (t) {
      return t.k === 'n' ? String(t.v) : t.v === '*' ? '×' : t.v === '/' ? '÷' : t.v === '-' ? '−' : t.v;
    }).join(' ') : '（点下面的数字和符号）';
  }
  // 算式先解析成树（括号只决定树的形状），再按树算值、按树判重：
  // 只加括号重写（比如 ((3+5)−4)×6 和 (3+5−4)×6）是同一棵树，不算第二种拼法。
  // 规范形式：加法和乘法的两个孩子按规范串排好序，减法和除法保持顺序。
  function parseTree(tk) {
    let p = 0;
    function expr() { let v = term(); while (p < tk.length && (tk[p].v === '+' || tk[p].v === '-')) { const op = tk[p++].v; const w = term(); v = { op: op, l: v, r: w }; } return v; }
    function term() { let v = fact(); while (p < tk.length && (tk[p].v === '*' || tk[p].v === '/')) { const op = tk[p++].v; const w = fact(); v = { op: op, l: v, r: w }; } return v; }
    function fact() {
      if (p >= tk.length) return null;
      const t = tk[p];
      if (t.v === '(') { p++; const v = expr(); if (tk[p] && tk[p].v === ')') p++; return v; }
      if (t.v === '-') { p++; const w = fact(); return w ? { op: 'neg', x: w } : null; }
      if (t.k === 'n') { p++; return { n: t.v }; }
      return null;
    }
    const v = expr();
    return (p === tk.length) ? v : null;
  }
  function evalTree(t) {
    if (!t) return NaN;
    if (t.n !== undefined) return t.n;
    if (t.op === 'neg') return -evalTree(t.x);
    const a = evalTree(t.l), b = evalTree(t.r);
    if (t.op === '+') return a + b;
    if (t.op === '-') return a - b;
    if (t.op === '*') return a * b;
    return a / b;
  }
  function canonTree(t) {
    if (t.n !== undefined) return 'n' + t.n;
    if (t.op === 'neg') return '(-' + canonTree(t.x) + ')';
    const cl = canonTree(t.l), cr = canonTree(t.r);
    if (t.op === '+' || t.op === '*') {
      const s = [cl, cr].sort();
      return '(' + s[0] + t.op + s[1] + ')';
    }
    return '(' + cl + t.op + cr + ')';
  }
  document.getElementById('tf24Back').addEventListener('click', function () {
    const t = tokens.pop();
    if (t && t.k === 'n') {
      [...numRow.children].forEach(function (b, i) { if (i === t.chip) { b.disabled = false; b.classList.remove('tf24-used'); } });
    }
    renderExpr();
  });
  document.getElementById('tf24Clear').addEventListener('click', function () {
    tokens = []; renderExpr();
    [...numRow.children].forEach(function (b) { b.disabled = false; b.classList.remove('tf24-used'); });
    msgEl.textContent = '算式清空了，重新拼。';
  });
  document.getElementById('tf24Hint').addEventListener('click', function () {
    hintUsed = true;
    msgEl.textContent = '提示：' + SETS[si].hint;
  });
  document.getElementById('tf24PredYes').addEventListener('click', function () {
    pred = 'yes';
    document.getElementById('tf24PredTx').textContent = '你的预测：这组数能拼出 24。拼出来看看。';
  });
  document.getElementById('tf24PredNo').addEventListener('click', function () {
    pred = 'no';
    document.getElementById('tf24PredTx').textContent = '你的预测：这组数拼不出 24。拼出来看看。';
  });
  document.getElementById('tf24New').addEventListener('click', function () {
    si = (si + 1) % SETS.length; tokens = []; found = []; pred = null; hintUsed = false;
    document.getElementById('tf24PredTx').textContent = '先猜一个，再动手拼。';
    renderNums(); renderExpr();
    foundEl.textContent = '这组数已经找到的拼法：0 种。';
    msgEl.textContent = '换了一组数：' + SETS[si].nums.join('、') + '。';
  });
  document.getElementById('tf24Calc').addEventListener('click', function () {
    if (!tokens.length) { msgEl.textContent = '先拼一个算式。'; return; }
    const used = tokens.filter(function (t) { return t.k === 'n'; }).map(function (t) { return t.chip; });
    if (used.length < 4) { msgEl.textContent = '还有数字没用上：每个数都要恰好用一次。'; labTrace('24点：算式里少了数字', false); return; }
    const tree = parseTree(tokens);
    const v = evalTree(tree);
    if (!tree || isNaN(v) || !isFinite(v)) { msgEl.textContent = '这个算式算不出来（可能是分母为 0，或者符号没拼对）。'; labTrace('24点：算式拼错了，算不出来', false); return; }
    const key = canonTree(tree);
    if (Math.abs(v - 24) < 1e-6) {
      if (found.indexOf(key) >= 0) { msgEl.textContent = '这个拼法已经记下了，换个拼法试试——同一组数不止一种。'; return; }
      found.push(key);
      foundEl.textContent = '这组数已经找到的拼法：' + found.length + ' 种。' + (found.length >= 2 ? '够两种了，真会了！' : '再找一种不同的拼法。');
      msgEl.textContent = '拼出来了！' + exprEl.textContent + ' = 24。' +
        (pred === 'yes' ? '你猜对了：这组数能拼出来。' : pred === 'no' ? '你猜错了——这组数其实能拼出来！' : '下次先猜再拼。');
      if (found.length >= 1) tiers.done(0);
      if (found.length >= 2) tiers.done(1);
      if (SETS[si].nums.join(',') === '3,3,8,8' && !hintUsed) tiers.done(2);
      markTried('twentyfour');
      labTrace('24点：拼出 ' + exprEl.textContent + ' = 24', true);
    } else {
      msgEl.textContent = '算出来是 ' + (Math.round(v * 100) / 100) + '，不是 24（' + (v < 24 ? '还差 ' + (Math.round((24 - v) * 100) / 100) : '多了 ' + (Math.round((v - 24) * 100) / 100)) + '）。再调一调。';
      labTrace('24点：算出来 ' + (Math.round(v * 100) / 100) + '，不是 24', false);
    }
  });
  wireDiscovery('twentyfour', 'tf24Find', 'tf24FindSave', 'tf24FindSaved');
  renderNums(); renderExpr();
})();

/* ---------- 创意实验 2：三门问题（9 年级，预测打脸） ----------
   100 次模拟用固定种子 mulberry32(20261106)：换门赢 68 次，不换赢 36 次（Node 验算过）。 */
(function () {
  let pred = null, prize = -1, pick = -1, opened = -1, phase = 'pick';
  let swW = 0, swL = 0, stW = 0, stL = 0, played = 0, swPlayed = 0, stPlayed = 0;
  const scoreEl = document.getElementById('moScore');
  const tiers = makeTiers(document.getElementById('moTiers'),
    ['基础：玩 1 局', '提高：跑 100 次模拟', '挑战：换门和不换门各玩至少 2 局（共 5 局以上）']);
  function renderScore() { scoreEl.textContent = '换门：' + swW + ' 胜 ' + swL + ' 负 · 不换：' + stW + ' 胜 ' + stL + ' 负'; }
  const roundEl = document.getElementById('moRound');
  const predTx = document.getElementById('moPredTx');
  const simOut = document.getElementById('moSimOut');
  const whyEl = document.getElementById('moWhy');
  const doorsEl = document.getElementById('moDoors');
  for (let i = 0; i < 3; i++) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn small primary mo-door'; b.textContent = '🚪 ' + (i + 1) + ' 号门';
    b.dataset.moDoor = i;
    b.addEventListener('click', function () { pickDoor(i); });
    doorsEl.appendChild(b);
  }
  function pickDoor(i) {
    if (phase !== 'pick') return;
    pick = i;
    prize = Math.floor(Math.random() * 3);
    const goats = [0, 1, 2].filter(function (d) { return d !== prize && d !== pick; });
    opened = goats[Math.floor(Math.random() * goats.length)];
    phase = 'decide';
    roundEl.textContent = '你选了 ' + (pick + 1) + ' 号门。主持人打开了 ' + (opened + 1) + ' 号门——里面是山羊 🐐。现在：换到另一扇门，还是坚持原来的？';
  }
  function finish(doSwitch) {
    if (phase !== 'decide') return;
    const finalPick = doSwitch ? [0, 1, 2].find(function (d) { return d !== pick && d !== opened; }) : pick;
    const win = finalPick === prize;
    phase = 'done';
    played++;
    if (doSwitch) { swPlayed++; if (win) swW++; else swL++; } else { stPlayed++; if (win) stW++; else stL++; }
    renderScore();
    tiers.done(0);
    if (played >= 5 && swPlayed >= 2 && stPlayed >= 2) tiers.done(2);
    roundEl.textContent = '你最后选了 ' + (finalPick + 1) + ' 号门，里面是 ' + (win ? '汽车 🚗——赢了！' : '山羊 🐐——没赢。') + '汽车在 ' + (prize + 1) + ' 号门后面。';
    labTrace('三门问题：' + (doSwitch ? '换门' : '不换门') + '，' + (win ? '赢了' : '输了'), win);
    markTried('monty');
  }
  document.getElementById('moSwitch').addEventListener('click', function () { finish(true); });
  document.getElementById('moStay').addEventListener('click', function () { finish(false); });
  document.getElementById('moNewRound').addEventListener('click', function () {
    phase = 'pick'; pick = -1; prize = -1; opened = -1;
    roundEl.textContent = '点一扇门，选你的第一扇。';
  });
  function setPred(p, label) {
    pred = p;
    predTx.textContent = '你的预测：' + label + '。玩一局，再跑 100 次模拟，看看预测对不对。';
  }
  document.getElementById('moPredSwitch').addEventListener('click', function () { setPred('switch', '换门更好'); });
  document.getElementById('moPredStay').addEventListener('click', function () { setPred('stay', '不换更好'); });
  document.getElementById('moPredSame').addEventListener('click', function () { setPred('same', '换不换都一样'); });
  document.getElementById('moSim').addEventListener('click', function () {
    const rand = mulberry32(20261106);
    function oneRound(doSwitch) {
      const pr = Math.floor(rand() * 3), pk = Math.floor(rand() * 3);
      const goats = [0, 1, 2].filter(function (d) { return d !== pr && d !== pk; });
      const op = goats[Math.floor(rand() * goats.length)];
      const fin = doSwitch ? [0, 1, 2].find(function (d) { return d !== pk && d !== op; }) : pk;
      return fin === pr;
    }
    let sw = 0, st = 0;
    for (let i = 0; i < 100; i++) if (oneRound(true)) sw++;
    for (let i = 0; i < 100; i++) if (oneRound(false)) st++;
    clearChildren(simOut);
    simOut.textContent = '100 次模拟：换门赢了 ' + sw + ' 次，不换赢了 ' + st + ' 次。';
    const bar1 = document.createElement('div'); bar1.className = 'mo-bar';
    const fill1 = document.createElement('i'); fill1.className = 'switch'; fill1.style.width = sw + '%';
    bar1.appendChild(fill1); simOut.appendChild(bar1);
    const lab1 = document.createElement('p'); lab1.textContent = '换门：' + sw + ' / 100'; simOut.appendChild(lab1);
    const bar2 = document.createElement('div'); bar2.className = 'mo-bar';
    const fill2 = document.createElement('i'); fill2.style.width = st + '%';
    bar2.appendChild(fill2); simOut.appendChild(bar2);
    const lab2 = document.createElement('p'); lab2.textContent = '不换：' + st + ' / 100'; simOut.appendChild(lab2);
    whyEl.textContent = pred === 'switch' ? '你的预测对了：换门赢的可能大约是 2/3，不换大约是 1/3。'
      : pred ? '你的预测错了——换门赢 ' + sw + ' 次，不换只赢 ' + st + ' 次。这正是三门问题出名的原因：直觉说“换不换都一样”，数学说“换”。'
      : '换门赢 ' + sw + ' 次，不换只赢 ' + st + ' 次——换门赢的可能大约是 2/3。';
    document.getElementById('moWhyStatic').hidden = false; // 为什么只在看过模拟结果之后出现，猜之前不剧透
    document.getElementById('moCrit').hidden = false; // 成功标准里写着 2/3 的答案，同样看过模拟之后才出现
    tiers.done(1);
    labTrace('三门问题：100 次模拟，换门赢 ' + sw + ' 次，不换赢 ' + st + ' 次', sw > st);
    markTried('monty');
  });
  wireDiscovery('monty', 'moFind', 'moFindSave', 'moFindSaved');
  renderScore();
})();

/* ---------- 创意实验 3：周长一定，面积最大（3–5 年级，预测 + 开放探究） ----------
   周长 20：长 1–9、宽 9–1，面积 9、16、21、24、25、24、21、16、9——最大值在正方形。 */
(function () {
  let L = 8, per = 20, guess = null, rows = [];
  const foundPer = {};
  const tiers = makeTiers(document.getElementById('maTiers'),
    ['基础：记下 1 种长方形', '提高：在一个周长下找出最大面积', '挑战：周长 20 和 24 都找出最大面积']);
  const svg = document.getElementById('maSvg');
  const eqEl = document.getElementById('maEq');
  const tableEl = document.getElementById('maTable');
  const findEl = document.getElementById('maFind');
  const guessTx = document.getElementById('maGuessTx');
  const whyEl = document.getElementById('maWhy');
  const rangeEl = document.getElementById('maLRange');
  const labelEl = document.getElementById('maLLabel');
  function render() {
    const W = per / 2 - L, A = L * W;
    labelEl.textContent = L;
    rangeEl.value = L;
    rangeEl.max = per / 2 - 1;
    document.getElementById('maHalfTx').textContent = per / 2;
    eqEl.textContent = '长 ' + L + ' 厘米，宽 ' + W + ' 厘米，面积 ' + A + ' 平方厘米';
    const w = 40 + L * 24, h = 40 + W * 12;
    svg.innerHTML = '<rect x="' + (160 - w / 2) + '" y="' + (95 - h / 2) + '" width="' + w + '" height="' + h + '" fill="#fff3e6" stroke="#ff8a3d" stroke-width="3" rx="6"/>' +
      '<text x="160" y="100" font-size="16" text-anchor="middle" fill="#334155">长 ' + L + ' × 宽 ' + W + '</text>';
  }
  function setL(v) { L = Math.max(1, Math.min(per / 2 - 1, v)); render(); }
  function setPer(p) {
    per = p;
    if (L >= per / 2) L = per / 2 - 1;
    document.getElementById('maPTx').textContent = per + ' 厘米';
    render();
  }
  document.getElementById('maP20').addEventListener('click', function () { setPer(20); });
  document.getElementById('maP24').addEventListener('click', function () { setPer(24); });
  rangeEl.addEventListener('input', function (e) { setL(+e.target.value); });
  document.getElementById('maLMinus').addEventListener('click', function () { setL(L - 1); });
  document.getElementById('maLPlus').addEventListener('click', function () { setL(L + 1); });
  document.getElementById('maGuessSet').addEventListener('click', function () {
    guess = L;
    guessTx.textContent = '你猜：长 ' + guess + ' 厘米时面积最大。动手试试，记下来验证。';
    labTrace('周长面积：猜长 ' + guess + ' 厘米时面积最大', true);
  });
  document.getElementById('maRecord').addEventListener('click', function () {
    const W = per / 2 - L, A = L * W;
    if (rows.some(function (r) { return r.P === per && r.L === L; })) { findEl.textContent = '周长 ' + per + ' 时，长 ' + L + ' 已经记过了，换个长试试。'; return; }
    rows.push({ P: per, L: L, W: W, A: A });
    tiers.done(0);
    tableEl.innerHTML = rows.map(function (r) { return '<tr><td>' + r.L + '</td><td>' + r.W + '</td><td>' + r.A + '</td></tr>'; }).join('');
    const mine = rows.filter(function (r) { return r.P === per; });
    const sq = per / 4; // 正方形的边长 = 周长 ÷ 4（20→5，24→6）；per/2 是“长+宽”，不是边长
    if (!foundPer[per] && mine.some(function (r) { return r.L === sq; }) && mine.length >= 3) {
      foundPer[per] = true;
      const best = mine.reduce(function (a, b) { return b.A > a.A ? b : a; }, mine[0]);
      findEl.textContent = '你试出来的最大面积是 ' + best.A + ' 平方厘米（长 ' + best.L + ' 宽 ' + best.W + '）。' +
        (guess === null ? '你还没猜过——下次先猜再试。' : guess === sq ? '和你猜的一样！' : '你猜的是长 ' + guess + '，实际是长 ' + sq + '——猜错了也没关系，表不会骗人。');
      whyEl.hidden = false;
      markTried('maxarea');
      labTrace('周长面积：发现最大面积 ' + best.A + '（长 ' + best.L + ' 宽 ' + best.W + '）', true);
      tiers.done(1);
      if (foundPer[20] && foundPer[24]) tiers.done(2);
    } else if (!foundPer[per] && mine.length >= 5) {
      findEl.textContent = '记了 ' + mine.length + ' 种了，还没试过长 ' + sq + ' 宽 ' + sq + ' 吗？';
    } else if (!foundPer[per]) {
      findEl.textContent = '记下了 ' + mine.length + ' 种。继续试——面积最大的那一种藏在表里。';
    }
  });
  document.getElementById('maReset').addEventListener('click', function () {
    rows = []; guess = null;
    for (const k in foundPer) delete foundPer[k];
    tableEl.innerHTML = ''; findEl.textContent = ''; guessTx.textContent = '还没猜';
    whyEl.hidden = true;
  });
  wireDiscovery('maxarea', 'maDisc', 'maDiscSave', 'maDiscSaved');
  render();
})();

/* ---------- 创意实验 4：火柴棒（3–4 年级，自由组合 + 开放探究） ----------
   3 道题都验算过（七段数码）：6+4=4 → 8−4=4（把 + 的竖棍移到 6 的右上）；
   9+3=5 → 3+3=6（把 9 的左上棍移到 5 的左下）；7−2=3 → 7−2=5（把 3 的右上棍移到左上）。
   检查只认“算式成立且恰好动了 1 根”，别的拼法只要成立也算对。 */
(function () {
  const DIGITS = { '0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc', '5': 'afgcd', '6': 'afgcde', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg' };
  const SEG_POS = {
    a: { left: '8px', top: '0px', width: '28px', height: '6px' },
    b: { right: '0px', top: '6px', width: '6px', height: '28px' },
    c: { right: '0px', bottom: '6px', width: '6px', height: '28px' },
    d: { left: '8px', bottom: '0px', width: '28px', height: '6px' },
    e: { left: '0px', bottom: '6px', width: '6px', height: '28px' },
    f: { left: '0px', top: '6px', width: '6px', height: '28px' },
    g: { left: '8px', top: '35px', width: '28px', height: '6px' }
  };
  const PUZZLES = [
    { text: '第 1 题：6 + 4 = 4', chars: ['6', '+', '4', '=', '4'] },
    { text: '第 2 题：9 + 3 = 5', chars: ['9', '+', '3', '=', '5'] },
    { text: '第 3 题：7 − 2 = 3', chars: ['7', '−', '2', '=', '3'] }
  ];
  let pi = 0, moves = 0, held = null, solved = 0, pred = null, movedFrom = null;
  const tiers = makeTiers(document.getElementById('msTiers'),
    ['基础：做对 1 题', '提高：做对 2 题', '挑战：3 题都做对']);
  const solvedSet = {};
  const board = document.getElementById('msBoard');
  const msgEl = document.getElementById('msMsg');
  const titleEl = document.getElementById('msTitle');
  const solvedEl = document.getElementById('msSolved');
  let charState = [];
  function litFor(ch) {
    if (DIGITS[ch]) return new Set(DIGITS[ch].split(''));
    if (ch === '+') return new Set(['h', 'v']);
    if (ch === '−') return new Set(['h']);
    return new Set();
  }
  function render() {
    clearChildren(board);
    charState = [];
    const puz = PUZZLES[pi];
    titleEl.textContent = puz.text;
    puz.chars.forEach(function (ch, ci) {
      const wrap = document.createElement('div');
      wrap.className = 'ms-char';
      if (ch === '=') {
        const b1 = document.createElement('div'); b1.className = 'ms-eqbar'; b1.style.top = '26px';
        const b2 = document.createElement('div'); b2.className = 'ms-eqbar'; b2.style.top = '44px';
        wrap.appendChild(b1); wrap.appendChild(b2);
        charState.push({ kind: 'eq', lit: new Set() });
      } else if (ch === '+' || ch === '−') {
        const lit = litFor(ch);
        charState.push({ kind: 'op', lit: lit });
        const h = document.createElement('button');
        h.type = 'button'; h.className = 'ms-seg' + (lit.has('h') ? ' lit' : '');
        h.style.left = '8px'; h.style.top = '35px'; h.style.width = '28px'; h.style.height = '6px';
        h.dataset.msSeg = ci + '-h'; h.dataset.msLit = lit.has('h') ? '1' : '0';
        h.setAttribute('aria-label', '算符横向火柴');
        h.addEventListener('click', function () { segClick(ci, 'h', h); });
        wrap.appendChild(h);
        const v = document.createElement('button');
        v.type = 'button'; v.className = 'ms-seg' + (lit.has('v') ? ' lit' : '');
        v.style.left = '19px'; v.style.top = '6px'; v.style.width = '6px'; v.style.height = '64px';
        v.dataset.msSeg = ci + '-v'; v.dataset.msLit = lit.has('v') ? '1' : '0';
        v.setAttribute('aria-label', '算符纵向火柴');
        v.addEventListener('click', function () { segClick(ci, 'v', v); });
        wrap.appendChild(v);
      } else {
        const lit = litFor(ch);
        charState.push({ kind: 'digit', lit: lit });
        Object.keys(SEG_POS).forEach(function (seg) {
          const b = document.createElement('button');
          b.type = 'button'; b.className = 'ms-seg' + (lit.has(seg) ? ' lit' : '');
          const pos = SEG_POS[seg];
          b.style.left = pos.left || ''; b.style.top = pos.top || '';
          b.style.right = pos.right || ''; b.style.bottom = pos.bottom || '';
          b.style.width = pos.width; b.style.height = pos.height;
          b.dataset.msSeg = ci + '-' + seg; b.dataset.msLit = lit.has(seg) ? '1' : '0';
          b.setAttribute('aria-label', '数字第 ' + (ci + 1) + ' 位火柴 ' + seg);
          b.addEventListener('click', function () { segClick(ci, seg, b); });
          wrap.appendChild(b);
        });
      }
      board.appendChild(wrap);
    });
    moves = 0; held = null; pred = null; movedFrom = null;
    msgEl.textContent = '点一根亮着的火柴把它拿起来，再点一个空着的位置放下去。';
    document.getElementById('msPredTx').textContent = '先猜一个，再动手。';
  }
  function segClick(ci, seg, el) {
    const st = charState[ci];
    const isLit = st.lit.has(seg);
    if (held) {
      if (held.ci === ci && held.seg === seg) {
        st.lit.add(seg); el.classList.add('lit'); el.dataset.msLit = '1';
        el.classList.remove('held');
        held = null;
        msgEl.textContent = '放回去了。再想想拿哪一根。';
        return;
      }
      if (isLit) { msgEl.textContent = '那根火柴已经亮着——先把手里的火柴放到一个空位上。'; return; }
      held.el.classList.remove('held');
      st.lit.add(seg); el.classList.add('lit'); el.dataset.msLit = '1';
      moves++;
      held = null;
      msgEl.textContent = '动了 ' + moves + ' 根火柴。动完点“检查”。';
      return;
    }
    if (!isLit) { msgEl.textContent = '这里没有火柴——先点一根亮着的火柴拿起来。'; return; }
    st.lit.delete(seg); el.classList.remove('lit'); el.dataset.msLit = '0';
    el.classList.add('held');
    held = { ci: ci, seg: seg, el: el };
    movedFrom = st.kind === 'op' ? 'op' : 'digit';
    msgEl.textContent = '手里有一根火柴，点一个空着的位置放下去。点原来那根可以放回去。';
  }
  function parseChar(st) {
    if (st.kind === 'eq') return '=';
    if (st.kind === 'op') {
      if (st.lit.has('h') && st.lit.has('v')) return '+';
      if (st.lit.has('h') && !st.lit.has('v')) return '−';
      return null;
    }
    const key = [...st.lit].sort().join('');
    for (const d in DIGITS) if (DIGITS[d].split('').sort().join('') === key) return d;
    return null;
  }
  document.getElementById('msCheck').addEventListener('click', function () {
    const vals = charState.map(parseChar);
    if (vals.some(function (v) { return v === null; })) { msgEl.textContent = '有个数字（或符号）的形状不对——火柴拼不出这个数，先调一调。'; labTrace('火柴棒：拼出的形状不是数字', false); return; }
    if (moves !== 1) { msgEl.textContent = '动了 ' + moves + ' 根火柴，只能动 1 根——点“重摆这道题”再试。'; return; }
    const a = +vals[0], b = +vals[2], c = +vals[4];
    const left = vals[1] === '+' ? a + b : a - b;
    if (left === c) {
      msgEl.textContent = '对了！' + a + ' ' + vals[1] + ' ' + b + ' = ' + c + '，只动了一根火柴。' +
        (pred ? ((pred === 'op') === (movedFrom === 'op') ? '你猜对了：这次动的正是' + (movedFrom === 'op' ? '加号（减号）。' : '数字。') : '你猜错了——这次动的其实是' + (movedFrom === 'op' ? '加号（减号）。' : '数字。')) : '');
      if (!solvedSet[pi]) { solvedSet[pi] = true; solved++; solvedEl.textContent = '已经做对的题：' + solved + ' / 3。'; }
      if (solved >= 1) tiers.done(0);
      if (solved >= 2) tiers.done(1);
      if (solved >= 3) tiers.done(2);
      markTried('matches');
      labTrace('火柴棒：第 ' + (pi + 1) + ' 题做对了', true);
    } else {
      msgEl.textContent = '还不对：左边是 ' + left + '，右边是 ' + c + '。再动一动。';
      labTrace('火柴棒：第 ' + (pi + 1) + ' 题还不对（' + left + ' ≠ ' + c + '）', false);
    }
  });
  document.getElementById('msPredOp').addEventListener('click', function () {
    pred = 'op';
    document.getElementById('msPredTx').textContent = '你的预测：要动加号（或减号）。动手吧。';
  });
  document.getElementById('msPredDigit').addEventListener('click', function () {
    pred = 'digit';
    document.getElementById('msPredTx').textContent = '你的预测：要动数字。动手吧。';
  });
  document.getElementById('msReset').addEventListener('click', function () { render(); });
  document.getElementById('msNext').addEventListener('click', function () { pi = (pi + 1) % PUZZLES.length; render(); });
  wireDiscovery('matches', 'msFind', 'msFindSave', 'msFindSaved');
  render();
})();

/* ---------- 创意实验 5：莫比乌斯带（6–7 年级，预测打脸） ----------
   中间剪还是 1 个圈（长一倍、4 个半拧）；离边缘 1/3 处剪是 2 个套在一起的圈。 */
(function () {
  let pred = null, pred2 = null;
  const cutKinds = {};
  const tiers = makeTiers(document.getElementById('mbTiers'),
    ['基础：剪过 1 次', '提高：中间和 1/3 处都剪过', '挑战：猜对“1/4 和 1/3 结果一样”']);
  const svg = document.getElementById('mbSvg');
  const predTx = document.getElementById('mbPredTx');
  const resultEl = document.getElementById('mbResult');
  const whyEl = document.getElementById('mbWhy');
  function drawBand() {
    svg.innerHTML = '<ellipse cx="160" cy="95" rx="110" ry="60" fill="none" stroke="#ff8a3d" stroke-width="26"/>' +
      '<ellipse cx="160" cy="95" rx="110" ry="60" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="4 8"/>' +
      '<text x="160" y="99" font-size="15" text-anchor="middle" fill="#334155">莫比乌斯带：拧了一下再粘起来</text>' +
      '<line x1="160" y1="20" x2="160" y2="170" stroke="#1d4ed8" stroke-width="2" stroke-dasharray="6 5"/>' +
      '<text x="160" y="14" font-size="13" text-anchor="middle" fill="#1d4ed8">从这里剪下去</text>';
  }
  function drawCenterCut() {
    svg.innerHTML = '<ellipse cx="160" cy="95" rx="140" ry="72" fill="none" stroke="#ff8a3d" stroke-width="18"/>' +
      '<text x="160" y="99" font-size="15" text-anchor="middle" fill="#334155">还是 1 个圈，长了一倍，拧了 4 个半圈</text>';
  }
  function drawThirdCut() {
    svg.innerHTML = '<ellipse cx="120" cy="95" rx="70" ry="48" fill="none" stroke="#ff8a3d" stroke-width="16"/>' +
      '<ellipse cx="210" cy="95" rx="95" ry="62" fill="none" stroke="#2563eb" stroke-width="16"/>' +
      '<text x="160" y="182" font-size="15" text-anchor="middle" fill="#334155">2 个圈，套在一起</text>';
  }
  function setPred(p, label) { pred = p; predTx.textContent = '你的预测：' + label + '。现在剪下去看看。'; }
  document.getElementById('mbPred2').addEventListener('click', function () { setPred('two', '剪完是 2 个圈'); });
  document.getElementById('mbPred1').addEventListener('click', function () { setPred('one', '还是 1 个圈'); });
  document.getElementById('mbPredKnot').addEventListener('click', function () { setPred('knot', '变成一个结'); });
  function cut(which) {
    cutKinds[which] = true;
    tiers.done(0);
    if (cutKinds.center && cutKinds.third) tiers.done(1);
    if (which === 'center') {
      drawCenterCut();
      resultEl.textContent = '剪完了：还是 1 个圈！只是长了一倍，拧了 4 个半圈。' + (pred === 'one' ? '你猜对了。' : pred ? '你猜的是' + (pred === 'two' ? ' 2 个圈' : '一个结') + '，猜错了——这正是莫比乌斯带出名的地方。' : '先猜再剪，下次试试。');
      labTrace('莫比乌斯带：中间剪，还是 1 个圈', pred === 'one');
    } else if (which === 'third') {
      drawThirdCut();
      resultEl.textContent = '剪完了：2 个圈，套在一起！一个小的还是莫比乌斯带，一个大的有了两面。' + (pred === 'two' ? '你猜对了。' : pred ? '你猜的是' + (pred === 'one' ? '还是 1 个圈' : '一个结') + '，猜错了——换个地方剪，结果完全不一样。' : '');
      labTrace('莫比乌斯带：1/3 处剪，变成 2 个套在一起的圈', pred === 'two');
    } else {
      drawThirdCut();
      resultEl.textContent = '剪完了：也是 2 个圈，套在一起！和 1/3 处剪一样——只要不剪在正中间，都是 2 个圈。' +
        (pred2 === 'same' ? '你猜对了。' : pred2 === 'diff' ? '你猜错了——1/4 和 1/3 剪出来一样，都是 2 个圈。' : '先猜再剪，下次试试。');
      if (pred2 === 'same') tiers.done(2);
      labTrace('莫比乌斯带：1/4 处剪，也是 2 个套在一起的圈', pred2 === 'same');
    }
    whyEl.hidden = false;
    pred = null;
    predTx.textContent = '再猜一次：换个地方剪，会变成几个圈？';
    markTried('mobius');
  }
  document.getElementById('mbCut').addEventListener('click', function () { cut('center'); });
  document.getElementById('mbCutThird').addEventListener('click', function () { cut('third'); });
  document.getElementById('mbCutQuarter').addEventListener('click', function () { cut('quarter'); });
  document.getElementById('mbPred2Same').addEventListener('click', function () {
    pred2 = 'same';
    document.getElementById('mbPred2Tx').textContent = '你的预测：1/4 和 1/3 剪出来一样，都是 2 个圈。现在剪下去看看。';
  });
  document.getElementById('mbPred2Diff').addEventListener('click', function () {
    pred2 = 'diff';
    document.getElementById('mbPred2Tx').textContent = '你的预测：1/4 和 1/3 剪出来不一样。现在剪下去看看。';
  });
  document.getElementById('mbReset').addEventListener('click', function () {
    pred = null; pred2 = null;
    for (const k in cutKinds) delete cutKinds[k];
    drawBand();
    predTx.textContent = '先选一个猜测，再剪。';
    document.getElementById('mbPred2Tx').textContent = '先猜一个，再剪。';
    resultEl.textContent = '';
    whyEl.hidden = true;
  });
  wireDiscovery('mobius', 'mbFind', 'mbFindSave', 'mbFindSaved');
  drawBand();
})();

/* ---------- 创意实验 6：开店一周（5–6 年级，现实使命） ----------
   进价 8 元，本钱 200 元；需求 = 50 − 2×售价 + 噪声（噪声按天固定：mulberry32(1000+天)，
   第 1–7 天依次是 −3、0、−1、−2、−1、−1、+3）。策略“每天 12 元进 20 个”验算过：
   总收入 1680 元，已卖成本 1120 元，总利润 560 元。定价 20 元一周：卖 65 件，
   收入 1300 元，已卖成本 520 元，利润 780 元；剩 75 件（成本 600 元）另列，手里的钱 200→380 元。 */
(function () {
  const COST = 8, START_CASH = 200;
  let day = 1, cash = START_CASH, stock = 0, price = 12, qty = 20;
  let totalCost = 0, totalRev = 0, totalLost = 0, totalSold = 0;
  let guess = null, lastProfit = null, weeks = 0;
  const tiers = makeTiers(document.getElementById('swTiers'),
    ['基础：开完一周', '提高：猜的利润和实际差在 100 元以内', '挑战：第二周比第一周赚得多']);
  const statusEl = document.getElementById('swStatus');
  const planEl = document.getElementById('swPlan');
  const dayOutEl = document.getElementById('swDayOut');
  const tableEl = document.getElementById('swTable');
  const reportEl = document.getElementById('swReport');
  const priceLabel = document.getElementById('swPriceLabel');
  const qtyLabel = document.getElementById('swQtyLabel');
  function noise(d) { return Math.floor(mulberry32(1000 + d)() * 7) - 3; }
  function customersFor(p, d) { return Math.max(0, Math.min(40, (50 - 2 * p) + noise(d))); }
  function clampQty() { const max = Math.floor(cash / COST); if (qty > max) qty = max; }
  function render() {
    if (day <= 7) statusEl.textContent = '第 ' + day + ' 天 · 手里 ' + cash + ' 元 · 库存 ' + stock + ' 个';
    priceLabel.textContent = price + ' 元';
    qtyLabel.textContent = qty + ' 个';
    planEl.textContent = '今天要花 ' + (qty * COST) + ' 元进货。' + (qty * COST > cash ? '钱不够！最多只能进 ' + Math.floor(cash / COST) + ' 个。' : '');
  }
  document.getElementById('swPriceMinus').addEventListener('click', function () { price = Math.max(10, price - 1); render(); });
  document.getElementById('swPricePlus').addEventListener('click', function () { price = Math.min(20, price + 1); render(); });
  document.getElementById('swQtyMinus').addEventListener('click', function () { qty = Math.max(0, qty - 1); render(); });
  document.getElementById('swQtyPlus').addEventListener('click', function () { qty = Math.min(30, qty + 1); clampQty(); render(); });
  document.getElementById('swOpen').addEventListener('click', function () {
    if (day > 7) { dayOutEl.textContent = '一周已经开完了，点“换个策略再来一周”。'; return; }
    clampQty();
    const cost = qty * COST;
    cash -= cost; stock += qty; totalCost += cost;
    const cust = customersFor(price, day);
    const sold = Math.min(cust, stock);
    const rev = sold * price;
    const lost = cust - sold;
    cash += rev; stock -= sold; totalRev += rev; totalLost += lost; totalSold += sold;
    tableEl.innerHTML += '<tr><td>' + day + '</td><td>' + price + '</td><td>' + qty + '</td><td>' + cust + '</td><td>' + sold + '</td><td>' + rev + '</td></tr>';
    dayOutEl.textContent = '第 ' + day + ' 天：来了 ' + cust + ' 个顾客，卖出 ' + sold + ' 个，收入 ' + rev + ' 元。' +
      (lost > 0 ? '有 ' + lost + ' 个顾客想买但没货了。' : '') + (stock > 0 ? '还剩 ' + stock + ' 个没卖掉。' : '货卖完了。');
    labTrace('开店：第 ' + day + ' 天卖 ' + price + ' 元，卖出 ' + sold + ' 个，收入 ' + rev + ' 元', sold > 0);
    day++;
    if (day > 7) {
      weeks++;
      // 利润 = 总收入 − 已卖出商品的成本（卖了几个 × 进价）；压在剩货里的进货钱既不是
      // 这周的成本，也不算利润，另列。手里的钱变化 = 利润 − 剩货成本，所以现金变少也可能是在赚钱。
      const profit = totalRev - totalSold * COST;
      const leftoverValue = stock * COST;
      reportEl.textContent = '一周总账：总收入 ' + totalRev + ' 元，卖了 ' + totalSold + ' 个，已卖出商品的成本 ' + (totalSold * COST) + ' 元。利润：' + profit + ' 元。' +
        (stock > 0 ? '还剩 ' + stock + ' 个文具盒，值 ' + leftoverValue + ' 元成本——下次能接着卖，不算进这周的利润里。手里的钱从 200 元变成 ' + cash + ' 元（进货一共花了 ' + totalCost + ' 元）。' : '货全卖完了，手里的钱从 200 元变成 ' + cash + ' 元。') +
        (guess != null ? '你猜一周能赚 ' + guess + ' 元，实际利润是 ' + profit + ' 元' + (Math.abs(guess - profit) <= 100 ? '——猜得很准！' : '——差了 ' + Math.abs(guess - profit) + ' 元，下次再猜准一点。') : '') +
        (lastProfit != null ? (profit > lastProfit ? '比上周多赚了 ' + (profit - lastProfit) + ' 元！' : '比上周少赚了 ' + (lastProfit - profit) + ' 元。') : '') +
        (totalLost > 0 ? '一共有 ' + totalLost + ' 个顾客因为没货白跑了——下次多进点，或者别定太贵。' : '');
      statusEl.textContent = '一周开完了 · 手里 ' + cash + ' 元 · 库存 ' + stock + ' 个';
      tiers.done(0);
      if (guess != null && Math.abs(guess - profit) <= 100) tiers.done(1);
      if (lastProfit != null && profit > lastProfit) tiers.done(2);
      lastProfit = profit;
      markTried('shopweek');
      labTrace('开店：一周利润 ' + profit + ' 元', profit > 0);
    }
    render();
  });
  document.getElementById('swGuessMinus').addEventListener('click', function () {
    guess = Math.max(0, (guess == null ? 500 : guess) - 10);
    document.getElementById('swGuessLabel').textContent = guess + ' 元';
  });
  document.getElementById('swGuessPlus').addEventListener('click', function () {
    guess = Math.min(2000, (guess == null ? 500 : guess) + 10);
    document.getElementById('swGuessLabel').textContent = guess + ' 元';
  });
  document.getElementById('swGuessSet').addEventListener('click', function () {
    if (guess == null) guess = 500;
    document.getElementById('swGuessTx').textContent = '你猜这一周能赚 ' + guess + ' 元。开完 7 天再来对答案。';
    labTrace('开店：猜一周赚 ' + guess + ' 元', true);
  });
  document.getElementById('swReplay').addEventListener('click', function () {
    day = 1; cash = START_CASH; stock = 0; price = 12; qty = 20;
    totalCost = 0; totalRev = 0; totalLost = 0; totalSold = 0; guess = null;
    tableEl.innerHTML = ''; dayOutEl.textContent = ''; reportEl.textContent = '';
    document.getElementById('swGuessTx').textContent = '先猜一个数，再开门。';
    document.getElementById('swGuessLabel').textContent = '500 元';
    render();
  });
  wireDiscovery('shopweek', 'swFind', 'swFindSave', 'swFindSaved');
  render();
})();

/* ---------- 创意实验 7：公平游戏（5 年级，开放探究 + 学生出题） ----------
   两枚骰子点数之和的掷法数：2:1、3:2、4:3、5:4、6:5、7:6、8:5、9:4、10:3、11:2、12:1。
   公平分法之一：甲 {2,3,4,7,10,11,12}、乙 {5,6,8,9}，各 18 种。
   模拟用固定种子 mulberry32(777)：甲 {2–7}、乙 {8–12} 时甲赢 58 次、乙赢 42 次。 */
(function () {
  const WAYS = { 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1 };
  const assign = {};
  let pred = null;
  const fairSigs = [];
  const tiers = makeTiers(document.getElementById('fgTiers'),
    ['基础：分完规则并模拟 1 次', '提高：找出一种公平分法', '挑战：找出第二种不同的公平分法']);
  const sumsEl = document.getElementById('fgSums');
  const waysEl = document.getElementById('fgWays');
  const verdictEl = document.getElementById('fgVerdict');
  const simOut = document.getElementById('fgSimOut');
  const tableOut = document.getElementById('fgTableOut');
  const whyEl = document.getElementById('fgWhy');
  const sumBtns = {};
  for (let s = 2; s <= 12; s++) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn small ghost'; b.textContent = s;
    b.dataset.fgSum = s;
    b.addEventListener('click', function () {
      assign[s] = assign[s] === undefined ? 'A' : assign[s] === 'A' ? 'B' : undefined;
      render();
    });
    sumsEl.appendChild(b); sumBtns[s] = b;
  }
  function waysOf(who) {
    let n = 0;
    for (let s = 2; s <= 12; s++) if (assign[s] === who) n += WAYS[s];
    return n;
  }
  function allAssigned() { for (let s = 2; s <= 12; s++) if (!assign[s]) return false; return true; }
  function render() {
    for (let s = 2; s <= 12; s++) {
      const b = sumBtns[s];
      b.classList.remove('fg-a', 'fg-b');
      if (assign[s] === 'A') { b.classList.add('fg-a'); b.textContent = s + '·甲'; }
      else if (assign[s] === 'B') { b.classList.add('fg-b'); b.textContent = s + '·乙'; }
      else b.textContent = s;
    }
    const wa = waysOf('A'), wb = waysOf('B');
    waysEl.textContent = '甲：' + wa + ' 种可能 · 乙：' + wb + ' 种可能';
    if (!allAssigned()) verdictEl.textContent = '还有和没分完——2–12 都要分给甲或乙。';
    else if (wa === wb) {
      verdictEl.textContent = '公平！甲乙各 ' + wa + ' 种可能。';
      const sig = [];
      for (let s = 2; s <= 12; s++) if (assign[s] === 'A') sig.push(s);
      const key = sig.join(',');
      if (fairSigs.indexOf(key) < 0) {
        fairSigs.push(key);
        if (fairSigs.length >= 1) tiers.done(1);
        if (fairSigs.length >= 2) tiers.done(2);
      }
    }
    else verdictEl.textContent = '不公平：甲 ' + wa + ' 种，乙 ' + wb + ' 种——' + (wa > wb ? '甲赢面大。' : '乙赢面大。');
  }
  document.getElementById('fgSim').addEventListener('click', function () {
    if (!allAssigned()) { simOut.textContent = '先把 2–12 分完再模拟。'; return; }
    const rand = mulberry32(777);
    let aw = 0, bw = 0, dw = 0;
    for (let i = 0; i < 100; i++) {
      const s = 1 + Math.floor(rand() * 6) + 1 + Math.floor(rand() * 6);
      if (assign[s] === 'A') aw++; else if (assign[s] === 'B') bw++; else dw++;
    }
    simOut.textContent = '模拟 100 次：甲赢 ' + aw + ' 次，乙赢 ' + bw + ' 次' + (dw ? '，' + dw + ' 次没人赢' : '') + '。' +
      (waysOf('A') === waysOf('B') ? '分法公平，赢的次数也差不多。' : '赢的次数差这么多，就是因为两种和出现的可能不一样多。');
    tiers.done(0);
    labTrace('公平游戏：模拟 100 次，甲赢 ' + aw + ' 次，乙赢 ' + bw + ' 次', waysOf('A') === waysOf('B'));
    markTried('fairgame');
  });
  document.getElementById('fgPredYes').addEventListener('click', function () {
    pred = 'yes';
    document.getElementById('fgPredTx').textContent = '你的预测：和的个数多，赢面就大。分完规则、模拟 100 次，再看 36 种可能验证。';
  });
  document.getElementById('fgPredNo').addEventListener('click', function () {
    pred = 'no';
    document.getElementById('fgPredTx').textContent = '你的预测：和的个数多，赢面不一定大——要看每种和有几种掷法。分完规则、模拟 100 次，再看 36 种可能验证。';
  });
  document.getElementById('fgTable').addEventListener('click', function () {
    tableOut.hidden = false;
    tableOut.textContent = '36 种掷法：和 2 有 1 种，3 有 2 种，4 有 3 种，5 有 4 种，6 有 5 种，7 有 6 种，8 有 5 种，9 有 4 种，10 有 3 种，11 有 2 种，12 有 1 种。一共 36 种。' +
      (pred === 'no' ? '你猜对了：和有几个不重要，重要的是每种和有几种掷法——和 7 有 6 种，和 2 只有 1 种。'
        : pred === 'yes' ? '你猜错了：和 2 和 12 各只有 1 种掷法，和 7 有 6 种——个数一样多，赢面可以差 6 倍。' : '');
    whyEl.hidden = false;
  });
  document.getElementById('fgReset').addEventListener('click', function () {
    for (let s = 2; s <= 12; s++) delete assign[s];
    simOut.textContent = ''; tableOut.hidden = true; whyEl.hidden = true;
    render();
  });
  wireDiscovery('fairgame', 'fgFind', 'fgFindSave', 'fgFindSaved');
  render();
})();

/* ---------- 创意实验 8：造规律（1–2 年级，学生出题） ----------
   单元长 n，第 k 个是第 ceil(k/n) 个单元的第 ((k−1)%n)+1 个。 */
(function () {
  const SHAPES = ['●', '▲', '■', '★', '◆', '♥'];
  let unit = [], q10ok = false, q20ok = false;
  const tiers = makeTiers(document.getElementById('mrTiers'),
    ['基础：排好一个单元', '提高：第 10 个和第 20 个都答对', '挑战：造出“第 10 个是 ★”的单元']);
  const unitEl = document.getElementById('mrUnit');
  const rowEl = document.getElementById('mrRow');
  const a10El = document.getElementById('mrA10');
  const a20El = document.getElementById('mrA20');
  const cardOut = document.getElementById('mrCardOut');
  const paletteEl = document.getElementById('mrPalette');
  const q10El = document.getElementById('mrQ10');
  const q20El = document.getElementById('mrQ20');
  function buildOptions(container, n, outEl) {
    SHAPES.forEach(function (s) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn small ghost mr-shape'; b.textContent = s;
      b.dataset.mrOpt = s;
      b.addEventListener('click', function () { answer(n, s, outEl); });
      container.appendChild(b);
    });
  }
  SHAPES.forEach(function (s) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn small ghost mr-shape'; b.textContent = s;
    b.dataset.mrShape = s;
    b.addEventListener('click', function () {
      if (unit.length >= 5) { unitEl.textContent = '单元最多 5 个，够长了。'; return; }
      unit.push(s); a10El.textContent = ''; a20El.textContent = ''; cardOut.textContent = '';
      q10ok = false; q20ok = false;
      if (unit.length >= 2) tiers.done(0);
      render();
    });
    paletteEl.appendChild(b);
  });
  buildOptions(q10El, 10, a10El);
  buildOptions(q20El, 20, a20El);
  function answer(n, s, outEl) {
    if (unit.length < 2) { outEl.textContent = '先排一个单元（至少 2 个图形）。'; return; }
    const idx = (n - 1) % unit.length;
    const right = unit[idx];
    const full = Math.floor(n / unit.length), rem = n % unit.length;
    const unitNo = full + (rem ? 1 : 0), pos = rem || unit.length;
    if (s === right) {
      if (n === 10) q10ok = true;
      if (n === 20) q20ok = true;
      if (q10ok && q20ok) tiers.done(1);
      outEl.textContent = '对了！第 ' + n + ' 个是第 ' + unitNo + ' 个单元的第 ' + pos + ' 个，就是 ' + right + '。';
      labTrace('造规律：第 ' + n + ' 个答对了（' + right + '）', true);
      markTried('makerule');
    } else {
      outEl.textContent = '再想想：一个单元有 ' + unit.length + ' 个，' + n + ' 里面有 ' + full + ' 个完整单元，还多 ' + rem + ' 个——第 ' + n + ' 个是第 ' + unitNo + ' 个单元的第 ' + pos + ' 个。';
      labTrace('造规律：第 ' + n + ' 个答错了', false);
    }
  }
  function render() {
    unitEl.textContent = unit.length ? unit.join(' ') : '（点下面的图形，排 2–5 个）';
    let row = '';
    if (unit.length) { for (let i = 0; i < 15; i++) row += unit[i % unit.length] + ' '; }
    rowEl.textContent = unit.length ? '这样重复下去：' + row + '……' : '';
    // 为什么要跟实际拼出的单元走：4 个一单元时还说“10 除以 3 余 1”就错了。
    const whyEl = document.getElementById('mrWhy');
    if (whyEl) {
      if (unit.length >= 2) {
        const n = unit.length, full = Math.floor(10 / n), rem = 10 % n;
        const unitNo = full + (rem ? 1 : 0), pos = rem || n;
        whyEl.innerHTML = '<b>为什么？</b>一个单元有 ' + n + ' 个，第 10 个就是第 ' + unitNo + ' 个单元的第 ' + pos + ' 个——10 除以 ' + n + ' 商 ' + full + ' 余 ' + rem + '。规律题不用数到 20，数“第几个单元、单元里第几个”就行。';
      } else {
        whyEl.innerHTML = '<b>为什么？</b>规律题不用数到 20，数“第几个单元、单元里第几个”就行：先看一个单元有几个，再算第 10 个落在哪一个单元的第几个。';
      }
    }
  }
  document.getElementById('mrDel').addEventListener('click', function () {
    unit.pop(); a10El.textContent = ''; a20El.textContent = ''; q10ok = false; q20ok = false; render();
  });
  document.getElementById('mrClear').addEventListener('click', function () {
    unit = []; a10El.textContent = ''; a20El.textContent = ''; cardOut.textContent = ''; q10ok = false; q20ok = false; render();
  });
  document.getElementById('mrChallenge').addEventListener('click', function () {
    const out = document.getElementById('mrChallengeOut');
    if (unit.length < 2) { out.textContent = '先排一个单元（至少 2 个图形）。'; return; }
    const idx = unit.indexOf('★');
    if (idx < 0) { out.textContent = '单元里没有 ★——先把 ★ 排进去。'; return; }
    const full = Math.floor(10 / unit.length), rem = 10 % unit.length;
    const unitNo = full + (rem ? 1 : 0), pos = rem || unit.length;
    if ((10 - 1) % unit.length === idx) {
      out.textContent = '做到了！你的单元是 ' + unit.join('') + '，第 10 个正好是第 ' + unitNo + ' 个单元的第 ' + pos + ' 个，就是 ★。';
      tiers.done(2);
      markTried('makerule');
      labTrace('造规律：造出“第 10 个是 ★”的单元', true);
    } else {
      out.textContent = '还差一点：你的单元是 ' + unit.join('') + '，第 10 个是 ' + unit[(10 - 1) % unit.length] + '，不是 ★。想想 ★ 该放在单元的第几个。';
      labTrace('造规律：第 10 个是 ★ 的挑战还没做出来', false);
    }
  });
  document.getElementById('mrCard').addEventListener('click', function () {
    if (unit.length < 2) { cardOut.textContent = '先排一个单元（至少 2 个图形）。'; return; }
    const t10 = unit[(10 - 1) % unit.length], t20 = unit[(20 - 1) % unit.length];
    cardOut.textContent = '出题卡：我的规律是 ' + unit.join('') + ' 重复。第 10 个是什么？第 20 个是什么？（答案：第 10 个 ' + t10 + '，第 20 个 ' + t20 + '）';
    markTried('makerule');
  });
  wireDiscovery('makerule', 'mrFind', 'mrFindSave', 'mrFindSaved');
  render();
})();

/* ---------- 创意实验 0：13有几种凑法？（1 年级，加法） ----------
   两个十格阵，每边最多 10 个；13 的拆法是 8 种有序对（3+10 … 10+3）。
   总数公式：min(10, T−1) − max(1, T−10) + 1（T=12→9，13→8，14→7，15→6）。
   顺序很重要：swap 标记要在把新凑法推进 found 之前算，否则自己跟自己比。 */
(function () {
  const TARGETS = [13, 14, 15, 12];
  function totalWays(t) { return Math.min(10, t - 1) - Math.max(1, t - 10) + 1; }
  let ti = 0;
  let guess = 4;
  const found = {};      // target -> ['9+4', ...]
  const guessedMap = {}; // target -> guess
  const completed = {};  // target -> true
  const cells = { A: [], B: [] };
  const tiers = makeTiers(document.getElementById('thTiers'),
    ['基础：找到 1 种凑法', '提高：把一个目标的凑法找全', '挑战：换个目标也找全']);
  function target() { return TARGETS[ti]; }
  function count(f) { return cells[f].filter(function (c) { return c.classList.contains('filled'); }).length; }
  function guessed() { return guessedMap[target()] != null; }
  function completedCount() { return TARGETS.filter(function (t) { return completed[t]; }).length; }
  function render() {
    const t = target(), L = count('A'), R = count('B');
    const list = found[t] || [];
    document.getElementById('thTargetTx').textContent = '' + t;
    // 开头介绍和成功标准都跟随当前目标：换到 14，里面就不能还写 13。
    document.getElementById('thIntro').innerHTML = '1 年级的加法也能做实验：<b>' + t + ' 能拆成几种？</b>十格阵演示是算 9+4 等于几；这里反过来——和是 ' + t + '，加数能有几种拆法？左边的十格阵和右边的十格阵不一样，两个加数换位置是两种摆法。';
    document.getElementById('thCrit').textContent = '成功标准：把 ' + t + ' 的凑法找全，并且换个目标数也找全。';
    document.getElementById('thLabelA').textContent = '左边 · ' + L + ' 个';
    document.getElementById('thLabelB').textContent = '右边 · ' + R + ' 个';
    document.getElementById('thEq').textContent = L + ' + ' + R + ' = ' + (L + R);
    document.getElementById('thGuessLabel').textContent = guess + ' 种';
    document.getElementById('thGuessTx').textContent = guessed()
      ? '你猜的是 ' + guessedMap[t] + ' 种。找一找，看看到底有几种。'
      : t + ' 有几种凑法？先猜一个数（1–12），再点“就猜这个”。';
    document.getElementById('thFound').textContent = list.length
      ? '已经找到的凑法：' + list.join('、') + '。'
      : '已经找到的凑法：还没有。';
    document.getElementById('thCount').textContent = guessed()
      ? '找到了 ' + list.length + ' / ' + totalWays(t) + ' 种。你猜的是 ' + guessedMap[t] + ' 种。' +
        (list.length === totalWays(t) ? '——找全了！' : '')
      : '找到了 ' + list.length + ' 种（先猜一共有几种，再告诉你目标）。';
    // 三档按当前目标分别记：换个目标，三档要跟着变，不能全局一个
    // （真机复测：13 找全后换到 14，提高 ✓ 还亮着）。
    tiers.set(0, list.length >= 1);
    tiers.set(1, list.length === totalWays(t));
    tiers.set(2, completedCount() >= 2);
    document.getElementById('thWhy').hidden = completedCount() < 1;
  }
  function buildFrame(frameId, f) {
    const frame = document.getElementById(frameId);
    clearChildren(frame);
    cells[f] = [];
    for (let i = 0; i < 10; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tf-cell' + (f === 'B' ? ' b' : '');
      b.dataset.thCell = f + '-' + i;
      b.addEventListener('click', function () {
        b.classList.toggle('filled');
        render();
      });
      frame.appendChild(b);
      cells[f].push(b);
    }
  }
  buildFrame('thFrameA', 'A');
  buildFrame('thFrameB', 'B');
  document.getElementById('thGuessMinus').addEventListener('click', function () {
    guess = Math.max(1, guess - 1); render();
  });
  document.getElementById('thGuessPlus').addEventListener('click', function () {
    guess = Math.min(12, guess + 1); render();
  });
  document.getElementById('thGuessSet').addEventListener('click', function () {
    guessedMap[target()] = guess;
    document.getElementById('thMsg13').textContent =
      '记下了：你猜 ' + target() + ' 有 ' + guess + ' 种凑法。现在开始找。';
    render();
  });
  document.getElementById('thClear').addEventListener('click', function () {
    cells.A.concat(cells.B).forEach(function (c) { c.classList.remove('filled'); });
    render();
  });
  document.getElementById('thNewTarget').addEventListener('click', function () {
    ti = (ti + 1) % TARGETS.length;
    guess = guessedMap[target()] != null ? guessedMap[target()] : 4;
    cells.A.concat(cells.B).forEach(function (c) { c.classList.remove('filled'); });
    document.getElementById('thMsg13').textContent = '目标换成 ' + target() + ' 了。先猜，再找。';
    render();
  });
  document.getElementById('thRecord').addEventListener('click', function () {
    const t = target(), L = count('A'), R = count('B'), sum = L + R;
    if (sum !== t) {
      document.getElementById('thMsg13').textContent =
        '现在摆的是 ' + L + ' + ' + R + ' = ' + sum + '，不是 ' + t + '。再添几个或拿掉几个。';
      return;
    }
    const list = found[t] || (found[t] = []);
    const key = L + '+' + R;
    if (list.indexOf(key) >= 0) {
      document.getElementById('thMsg13').textContent = '这个凑法已经记过了——换个摆法试试。';
      return;
    }
    const swap = list.indexOf(R + '+' + L) >= 0; // 一定要在 push 之前算
    list.push(key);
    const mx = Math.max(L, R), give = 10 - mx;
    const tenNote = give === 0
      ? '10 已经是 10 了，10 + ' + (t - 10) + ' = ' + t + '。'
      : mx + ' 再凑 ' + give + ' 个就是 10，10 + ' + (t - 10) + ' = ' + t + '。';
    let msg = '记下了：' + key + ' = ' + t + '。' + tenNote;
    if (swap) msg += R + '+' + L + ' 是它换了位置——加法里，两个加数换位置，和不变。';
    if (list.length === 1) markTried('thirteen');
    if (list.length === totalWays(t)) { completed[t] = true; msg += '——' + t + ' 的凑法找全了！'; }
    document.getElementById('thMsg13').textContent = msg;
    cells.A.concat(cells.B).forEach(function (c) { c.classList.remove('filled'); });
    render();
  });
  wireDiscovery('thirteen', 'thFind', 'thFindSave', 'thFindSaved');
  render();
})();
