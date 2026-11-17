/* 随机出题（操作台）：每个操作台一个出题器，按种子和难度（1 容易、2 中等、3 难）出一道题，题还是在操作台上动手做。
 *   出题器 gen(R, level) 返回 { title, hook, props, goals: [[输出口, 值, 说法, 提示]], sol, why }：
 *     props 是台面开始的样子，goals 是要做到的输出，sol 是一份“做完以后”的属性（测试用它检查这道题做得出来）。
 *   题目的 id 是 quiz:器材:种子:难度，打开时现做（不放进题库，不算进知识点覆盖）。
 *   出出来的题如果一开始就已经达到目标（不用动手），换一个种子重出。
 * 测试（tests/run.js “随机出题”）：每个出题器、每个难度、几十个种子：题目 lint 通过；一开始没达到目标；套上 sol 以后达到目标。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World, Q = U.Q;
  const GENS = {};
  const mkR = (seed) => { const r = U.Variants.rng(seed); const R = { r, int: (lo, hi) => lo + Math.floor(r() * (hi - lo + 1)), pick: (a) => a[Math.floor(r() * a.length)], bool: () => r() < 0.5 }; return R; };
  const qs = (n, d) => Q.show(Q(n, d || 1));
  const norm = (v) => { try { return Q.show(Q.parse(String(v))); } catch (e) { return String(v); } };
  const LEVELS = ['容易', '中等', '难'];
  // 某个器材在题库里最常用的知识点、领域（给随机题当“归属”）
  function home(type) {
    const ps = U.problems.filter((p) => (p.shelf || [])[0] === type), cnt = {};
    ps.forEach((p) => (p.points || []).forEach((x) => { cnt[x] = (cnt[x] || 0) + 1; }));
    const pts = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]);
    return { points: pts.slice(0, 1), domain: (ps[0] && ps[0].domain) || '数与运算', grade: ps.length ? Math.min(...ps.map((p) => p.grade || 9)) : 3 };
  }
  function build(type, props) { const s = W.blank(); const id = W.add(s, type, 40, 50, props); s.entities[id].role = 'q'; return s; }
  function reached(type, props, goals) {
    const s = build(type, props), D = W.evaluate(s), e = Object.values(s.entities).find((x) => x.type === type), out = (D[e.id] || {}).out || {};
    return goals.map(([port, value]) => !!out[port] && norm(U.Q.show(out[port].data)) === norm(value));
  }
  function make(type, seed, level) {
    const g = GENS[type]; if (!g) return null;
    let q = null;
    for (let i = 0; i < 30; i++) { const c = g.gen(mkR(seed + i * 7919), level); if (!reached(type, c.props, c.goals).some(Boolean)) { q = c; break; } }
    if (!q) return null;
    const h = home(type), t = U.types[type];
    const ms = q.goals.map(([port, value, say, hints], i) => ({ id: 'g' + i, say, score: Math.max(2, Math.round(8 / q.goals.length)), when: { role: 'q', port, op: '=', value: norm(value) }, hints: hints || ['看看台面上的说明。', '一步一步来。', '答案是 ' + value + '。'] }));
    return {
      id: 'quiz:' + type + ':' + seed + ':' + level, title: '🎲 ' + q.title, grade: h.grade, domain: h.domain, points: h.points, essence: t.essence || ['E2'], level: 'core', rung: level + 1,
      topics: ['随机练习'], alias: ['随机', '练习'], hook: q.hook, shelf: [type], build: () => build(type, q.props), milestones: ms, goal: ms.map((m) => m.id), traps: [], predict: null,
      why: q.why || '做对了。换一题再试试：同一种题，数不一样，想法一样。', quiz: { type, seed, level, sol: q.sol, props: q.props },
    };
  }
  U.Quiz = {
    LEVELS,
    add: (type, def) => { GENS[type] = def; },
    has: (type) => !!GENS[type] && !!U.types[type],
    types: () => Object.keys(GENS).filter((t) => U.types[t]),
    make, reached,
    id: (type, seed, level) => 'quiz:' + type + ':' + (seed >>> 0) + ':' + (level || 1),
    fromId(id) { const m = /^quiz:([a-z0-9_-]+):(\d+):([123])$/.exec(String(id)); return m ? make(m[1], +m[2], +m[3]) : null; },
  };
  const base = U.problemById;
  U.problemById = (id) => (String(id).startsWith('quiz:') ? U.Quiz.fromId(id) : base(id));

  // ===================== 出题器 =====================
  const add = U.Quiz.add;
  const digitsOf = (n) => String(n).split('').reverse().map(Number);
  // 竖式加法：要点进位的列；减法：要点退位的列
  function addMarks(a, b) { const A = digitsOf(a), B = digitsOf(b), ms = []; let c = 0; for (let j = 0; j < Math.max(A.length, B.length); j++) { const s = (A[j] || 0) + (B[j] || 0) + c; c = s >= 10 ? 1 : 0; if (c) ms.push(j + 1); } return ms; }
  function subMarks(a, b) { const A = digitsOf(a), B = digitsOf(b), ms = new Set(); for (let j = 0; j < A.length; j++) { const top = A[j] - (ms.has(j) ? 1 : 0); if (top < (B[j] || 0)) ms.add(j + 1); } return [...ms].sort(); }
  const rev = (n) => String(n).split('').reverse().join('');

  add('vertbench', { gen(R, lv) {
    if (lv === 1) { const a = R.int(15, 79), b = R.int(12, 99 - a); return { title: a + ' + ' + b + ' 用竖式算', hook: '从个位算起，一位一位点数字写；满十要先点上面的小圆圈进 1。', props: { mode: 0, a, b }, goals: [['result', a + b, a + ' + ' + b + ' = ' + (a + b)]], sol: { marks: addMarks(a, b).join(','), res: rev(a + b) } }; }
    if (lv === 2) { const a = R.int(120, 900), b = R.int(15, a - 10); return { title: a + ' − ' + b + ' 用竖式算', hook: '个位不够减就点前一位上面的小圆圈退 1；前一位是 0 要再往前借。', props: { mode: 1, a, b }, goals: [['result', a - b, a + ' − ' + b + ' = ' + (a - b)]], sol: { marks: subMarks(a, b).join(','), res: rev(a - b).replace(/0+$/, '') || '0' } }; }
    const b = R.int(2, 9), q = R.int(101, 299), r = R.int(0, b - 1), a = b * q + r; return { title: a + ' ÷ ' + b + ' 用竖式算', hook: '从高位起一步一步试商；不够除的那一位商写 0。', props: { mode: 2, a, b }, goals: [['q', Math.floor(a / b), '商是 ' + Math.floor(a / b) + (a % b ? '，余 ' + (a % b) : '')]], sol: { qd: String(Math.floor(a / b)) } };
  } });

  add('makebench', { gen(R, lv) {
    if (lv === 1) { const n = R.int(4, 10); return { title: n + ' 可以分成几和几？', hook: '点两个圆片之间的缝，把它们分成两份。全部分法都找出来。', props: { mode: 2, n }, goals: [['all', 1, '找全了：' + n + ' 有 ' + (n - 1) + ' 种分法']], sol: { splits: Array.from({ length: n - 1 }, (_, i) => i + 1).join(',') } }; }
    if (lv === 2) { const a = R.int(5, 9), b = R.int(11 - a, 9); return { title: a + ' + ' + b + '：凑成十再加', hook: '点右边的蓝片挪进左边的空格，把左边凑满十。', props: { mode: 0, a, b }, goals: [['sum', a + b, a + ' + ' + b + ' = ' + (a + b)]], sol: { moved: 10 - a } }; }
    const a = R.int(11, 18), b = R.int(a - 9, 9); return { title: a + ' − ' + b + '：破十或平十', hook: '点圆片划掉它，一共划 ' + b + ' 个。可以都从十格框里划，也可以先划外面的。', props: { mode: 1, a, b }, goals: [['diff', a - b, a + ' − ' + b + ' = ' + (a - b)]], sol: { cross: Array.from({ length: b }, (_, i) => i).join(',') } };
  } });

  // 小数：u t h 是“一、十分之一、百分之一”的个数
  const dsplit = (c) => [Math.floor(c / 100), Math.floor(c / 10) % 10, c % 10];
  const dstr = (c) => (c / 100).toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  add('decbench', { gen(R, lv) {
    if (lv === 1) { const a = R.int(1, 9) * 10 + R.int(0, 2) * 100, b = R.int(1, 9) * 10; const [u, t, h] = dsplit(a), [U2, T2, H2] = dsplit(a + b); return { title: dstr(a) + ' + ' + dstr(b), hook: '台面上是 ' + dstr(a) + '。点“放进来”，满十的换一换。', props: { mode: 1, u, t, h, b: dstr(b), k: 1 }, goals: [['value', qs(a + b, 100), dstr(a) + ' + ' + dstr(b) + ' = ' + dstr(a + b)]], sol: { u: U2, t: T2, h: H2, step: 1 } }; }
    if (lv === 2) { const a = R.int(110, 600), b = R.int(5, Math.min(99, a - 10)); const [u, t, h] = dsplit(a), [U2, T2, H2] = dsplit(a - b); return { title: dstr(a) + ' − ' + dstr(b), hook: '台面上是 ' + dstr(a) + '，要拿走 ' + dstr(b) + '。哪一位不够拿，先拆开前一位。', props: { mode: 2, u, t, h, b: dstr(b) }, goals: [['value', qs(a - b, 100), dstr(a) + ' − ' + dstr(b) + ' = ' + dstr(a - b)]], sol: { u: U2, t: T2, h: H2, step: 1 } }; }
    const b = R.int(2, 9) * 10, k = R.int(2, 5), tot = b * k; const [U2, T2, H2] = dsplit(tot); return { title: dstr(b) + ' × ' + k, hook: '台面是空的。把 ' + dstr(b) + ' 放进来 ' + k + ' 次，满十的换一换。', props: { mode: 1, b: dstr(b), k }, goals: [['value', qs(tot, 100), dstr(b) + ' × ' + k + ' = ' + dstr(tot)]], sol: { u: U2, t: T2, h: H2, step: k } };
  } });

  // 估一估：末位不取 0 和 5（离两端一样远就不好说“近”）
  const fuzzy = (R, lo, hi, unit) => { for (;;) { const x = R.int(lo, hi), m = x % unit; if (m !== 0 && m * 2 !== unit) return x; } };
  const near = (x, u) => { const lo = Math.floor(x / u) * u; return x - lo < lo + u - x ? [lo, 1] : [lo + u, 2]; };
  add('estbench', { gen(R, lv) {
    const op = lv === 3 ? 2 : R.int(0, 1), u = lv === 2 ? 100 : 10;
    let a = lv === 2 ? fuzzy(R, 210, 890, 100) : fuzzy(R, 21, 89, 10), b = lv === 2 ? fuzzy(R, 110, a - 20, 100) : fuzzy(R, 12, lv === 3 ? 49 : 79, 10);
    if (op === 1 && b > a) [a, b] = [b, a];
    const [ra, pa] = near(a, u), [rb, pb] = near(b, u), est = op === 0 ? ra + rb : op === 1 ? ra - rb : ra * rb, S = ['+', '−', '×'][op];
    return { title: a + ' ' + S + ' ' + b + ' 大约是多少？', hook: '先不算：点每个数离它近的那一端，看成整' + (u === 100 ? '百' : '十') + '数再算。', props: { mode: 0, op, a: String(a), b: String(b), ua: String(u), ub: String(u) }, goals: [['est', est, '估计：' + ra + ' ' + S + ' ' + rb + ' = ' + est]], sol: { pa, pb } };
  } });

  // 钱币：盘子里每种钱的张数（1 角、5 角、1 元、5 元、10 元、20 元、50 元）
  const DEN = [1, 5, 10, 50, 100, 200, 500];
  const greedy = (j) => { const t = DEN.map(() => 0); for (let i = DEN.length - 1; i >= 0; i--) { while (j >= DEN[i]) { t[i]++; j -= DEN[i]; } } return t.join(','); };
  const yj = (j) => { const y = Math.floor(j / 10), a = j % 10; return (y ? y + ' 元' : '') + (a ? (y ? ' ' : '') + a + ' 角' : '') || '0 元'; };
  add('moneybench', { gen(R, lv) {
    if (lv === 1) { const p = R.int(3, 30) * 10; return { title: '正好付 ' + yj(p), hook: '从钱包里点钱放进盘子，正好付 ' + yj(p) + '。', props: { mode: 0, price: p }, goals: [['exact', 1, '正好付了 ' + yj(p)]], sol: { tray: greedy(p) } }; }
    if (lv === 2) { const p = R.int(12, 99) * 10 + R.int(1, 9); return { title: '正好付 ' + yj(p), hook: '几元几角：元和角都要点够。', props: { mode: 0, price: p }, goals: [['exact', 1, '正好付了 ' + yj(p) + '（' + (p / 10) + ' 元）']], sol: { tray: greedy(p) } }; }
    const paid = R.pick([100, 200, 500]), p = R.int(Math.floor(paid / 4), paid - 3) * 1 - (R.bool() ? 5 : 0), price = Math.max(11, p); return { title: yj(price) + ' 的东西，付 ' + yj(paid) + '，找多少？', hook: '从 ' + (price / 10) + ' 元往上数，点钱包里的钱“数上去”，数到 ' + (paid / 10) + ' 元。', props: { mode: 1, price, paid }, goals: [['change', qs(paid - price, 10), '找零 ' + yj(paid - price)]], sol: { tray: greedy(paid - price) } };
  } });

  const DIM = (y, m) => [31, (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
  add('calbench', { gen(R, lv) {
    const WK = ['日', '一', '二', '三', '四', '五', '六'];
    if (lv === 3) { const s = R.int(0, 6), N = R.int(15, 150); return { title: '今天星期' + WK[s] + '，' + N + ' 天后是星期几？', hook: '点“过 7 天”一次跳一个星期（星期几不变），跳不了再一天一天过。', props: { mode: 1, start: s, N, go: 0 }, goals: [['weekday', (s + N) % 7, N + ' 天后是星期' + WK[(s + N) % 7]]], sol: { go: N } }; }
    const y = R.int(2020, 2030), mo = R.int(1, 12), nd = DIM(y, mo), d1 = R.int(1, 10), d2 = R.int(d1 + 5, nd);
    if (lv === 1) return { title: mo + ' 月 ' + d1 + ' 日到 ' + d2 + ' 日，一共几天？', hook: '点开始那天，再点结束那天。“一共几天”要把头尾两天都算上。', props: { mode: 0, y, mo }, goals: [['inclusive', d2 - d1 + 1, '两头都算：一共 ' + (d2 - d1 + 1) + ' 天']], sol: { d1, d2 } };
    return { title: '从 ' + mo + ' 月 ' + d1 + ' 日到 ' + d2 + ' 日，经过了几天？', hook: '点两天：“经过了几天”是结束减开始，不加 1。', props: { mode: 0, y, mo }, goals: [['between', d2 - d1, '经过了 ' + (d2 - d1) + ' 天']], sol: { d1, d2 } };
  } });

  add('rulerbench', { gen(R, lv) {
    if (lv === 1) { const len = R.int(3, 9), at = R.int(1, 15 - len); return { title: '这根铅笔有多长？', hook: '铅笔头在 ' + at + ' 厘米。拖到对准 0，或者数格子。', props: { mode: 0, len, at }, goals: [['len', len, '铅笔长 ' + len + ' 厘米']], sol: { at: 0 } }; }
    const L = R.int(lv === 2 ? 11 : 15, lv === 2 ? 20 : 30) * 10, cut = R.int(2, L / 5 - 2) * 5, mcm = (c) => (c >= 100 ? Math.floor(c / 100) + ' 米' + (c % 100 ? ' ' + (c % 100) + ' 厘米' : '') : c + ' 厘米');
    return { title: mcm(L) + ' 的绳子剪下 ' + mcm(cut) + '，还剩多少？', hook: '1 米 = 100 厘米。拖剪刀剪下 ' + cut + ' 厘米。', props: { mode: 1, L }, goals: [['rest', L - cut, '还剩 ' + (L - cut) + ' 厘米']], sol: { cut } };
  } });

  add('anglebench', { gen(R, lv) {
    if (lv === 1) { const a1 = R.int(0, 10) * 5, ang = R.int(3, 33) * 5, a2 = a1 + ang, prot = (a1 + R.pick([20, 35, 50, 65])) % 360; return { title: '量一量这个角', hook: '拖量角器边上的圆点转它，0° 线压在角的一条边上才读得出。', props: { mode: 0, a1, a2, prot }, goals: [['deg', ang, '这个角是 ' + ang + '°']], sol: { prot: a1 } }; }
    if (lv === 2) { const a = R.int(3, 33) * 5; return { title: '∠1 是 ' + a + '°，∠2 是几度？', hook: '一条直线上的两个角合起来是一个平角。点 ∠2 量一量。', props: { mode: 1, a }, goals: [['other', 180 - a, '∠2 = 180° − ' + a + '° = ' + (180 - a) + '°']], sol: { seen: '2' } }; }
    const n = R.int(4, 10); return { title: n + ' 边形的内角和是多少？', hook: '从一个顶点连对角线，切成几个三角形？', props: { mode: 3, n }, goals: [['sum', (n - 2) * 180, (n - 2) + ' 个三角形：' + (n - 2) * 180 + '°']], sol: { split: true } };
  } });

  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const divs = (n) => { const d = []; for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; };
  add('factorbench', { gen(R, lv) {
    if (lv === 1) { const n = R.pick([12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48]); return { title: n + ' 有几个因数？', hook: n + ' 个小方块，每行放几个能正好排满？排满一次找到一对因数。', props: { mode: 0, n }, goals: [['count', divs(n).length, n + ' 有 ' + divs(n).length + ' 个因数']], sol: { w: 1, found: divs(n).filter((d) => d * d <= n).join(',') } }; }
    for (;;) {
      const a = R.int(6, 40), b = R.int(6, 40); if (a === b) continue; const g = gcd(a, b), l = a * b / g;
      if (lv === 2 && g > 1) return { title: a + ' 和 ' + b + ' 的最大公因数', hook: '在“公因数”页一个一个试：能同时整除 ' + a + ' 和 ' + b + ' 的有哪些？', props: { mode: 1, a, b }, goals: [['gcd', g, '最大公因数是 ' + g]], sol: { tried: divs(g).join(',') } };
      if (lv === 3 && l <= 80 && g < Math.min(a, b)) return { title: a + ' 和 ' + b + ' 的最小公倍数', hook: '在“公倍数”页：两条跳跳线第一次落在同一点是哪里？', props: { mode: 2, a, b }, goals: [['lcm', l, '最小公倍数是 ' + l]], sol: { cm: String(l) } };
    }
  } });

  add('areabench', { gen(R, lv) {
    const b = R.int(3, 10), h = R.int(2, 6);
    if (lv === 1) { const s = R.int(1, Math.min(b, 4)); return { title: '底 ' + b + '、高 ' + h + ' 的平行四边形，面积是多少？', hook: '沿高剪下来，移到右边，拼成长方形再读面积。', props: { shape: 0, b, h, s }, goals: [['area', b * h, '面积 = ' + b + ' × ' + h + ' = ' + b * h]], sol: { step: 2, seen: String(s) } }; }
    if (lv === 2) { const s = R.int(0, b); return { title: '底 ' + b + '、高 ' + h + ' 的三角形，面积是多少？', hook: '再拿一个一样的三角形，转过来拼成平行四边形。', props: { shape: 1, b, h, s }, goals: [['area', qs(b * h, 2), '面积 = ' + b + ' × ' + h + ' ÷ 2']], sol: { step: 2 } }; }
    const t = R.int(1, Math.max(1, b - 1)), s = R.int(0, 4); return { title: '上底 ' + t + '、下底 ' + b + '、高 ' + h + ' 的梯形，面积是多少？', hook: '再拿一个一样的梯形，倒过来拼成平行四边形。', props: { shape: 2, b, t, h, s }, goals: [['area', qs((b + t) * h, 2), '面积 = (' + t + ' + ' + b + ') × ' + h + ' ÷ 2']], sol: { step: 2 } };
  } });

  add('seqbench', { gen(R, lv) {
    const KD = [[4, 3, '火柴摆正方形', '根火柴'], [4, 2, '桌子拼起来坐人', '个人'], [3, 2, '火柴摆三角形', '根火柴']], kind = lv === 1 ? R.int(0, 1) : R.int(0, 2), [a, d, name, unit] = KD[kind], n = lv === 1 ? R.int(5, 12) : lv === 2 ? R.int(15, 30) : R.int(40, 100);
    return { title: name + '：第 ' + n + ' 个要几' + unit + '？', hook: '先摆几个，找出“第 1 个是几、每次多几”，再算第 ' + n + ' 个。', props: { kind, k: 1, a: 0, d: 0, n }, goals: [['term', a + (n - 1) * d, '第 ' + n + ' 个：' + a + ' + (' + n + ' − 1) × ' + d + ' = ' + (a + (n - 1) * d)]], sol: { k: 3, a, d } };
  } });

  add('jobbench', { gen(R, lv) {
    if (lv === 3) { const a = R.int(2, 8), b = R.int(a + 1, 12); return { title: '进水管 ' + a + ' 小时注满，出水管 ' + b + ' 小时放完，一起开几小时注满？', hook: '每小时净多几格？', props: { mode: 1, a, b }, goals: [['days', qs(a * b, b - a), '注满要 ' + qs(a * b, b - a) + ' 小时']], sol: { t: Math.ceil(a * b / (b - a)) } }; }
    const a = R.int(2, lv === 1 ? 6 : 12), b = R.int(2, lv === 1 ? 6 : 15); return { title: '甲 ' + a + ' 天、乙 ' + b + ' 天，合作几天完成？', hook: '两人一起做，点“过一天”，看几天涂满。', props: { mode: 0, a, b }, goals: [['days', qs(a * b, a + b), '合作 ' + qs(a * b, a + b) + ' 天完成']], sol: { t: Math.ceil(a * b / (a + b)) } };
  } });

  add('chipbench', { gen(R, lv) {
    const sp = (v) => (v >= 0 ? { pos: v, neg: 0 } : { pos: 0, neg: -v });
    if (lv === 1) { const a = R.int(-6, -1), b = R.int(2, 9); return { title: '(' + a + ') + ' + b, hook: '放进来，再把零对一对一对消掉。', props: Object.assign({ mode: 0, op: 0, a, b }, sp(a)), goals: [['result', a + b, '(' + a + ') + ' + b + ' = ' + (a + b)]], sol: Object.assign({ step: 1 }, sp(a + b)) }; }
    if (lv === 2) { const a = R.int(1, 5), b = R.int(a + 1, 9); return { title: a + ' − ' + b, hook: '不够拿：先放进几对零对，再拿。', props: Object.assign({ mode: 0, op: 1, a, b }, sp(a)), goals: [['result', a - b, a + ' − ' + b + ' = ' + (a - b)]], sol: Object.assign({ step: 1 }, sp(a - b)) }; }
    const a = -R.int(2, 5), b = -R.int(2, 5); return { title: '(' + a + ') × (' + b + ')', hook: '拿走 ' + (-a) + ' 组，每组 ' + (-b) + ' 个 −1：先放零对再拿。', props: { mode: 1, a, b, pos: 0, neg: 0 }, goals: [['result', a * b, '(' + a + ') × (' + b + ') = ' + a * b]], sol: { pos: a * b, neg: 0, step: -a } };
  } });

  add('foldbench', { gen(R, lv) {
    const shape = lv === 1 ? R.pick([1, 2]) : lv === 2 ? 0 : R.pick([0, 4]), names = ['正方形', '长方形', '等腰三角形', '圆', '平行四边形'], axes = [[0, 45, 90, 135], [0, 90], [90], null, []][shape];
    return { title: names[shape] + '有几条对称轴？', hook: '转折痕、折一下，两半重合就是一条对称轴。都找出来' + (shape === 4 ? '；找不到就点“它没有对称轴”。' : '。'), props: { shape, angle: 30, off: 0 }, goals: [['all', 1, shape === 4 ? '平行四边形没有对称轴' : '找全了：' + axes.length + ' 条']], sol: shape === 4 ? { none: true } : { found: axes.join(',') } };
  } });

  add('blocksbench', { gen(R, lv) {
    const n = lv === 1 ? R.int(11, 49) : lv === 2 ? R.int(51, 99) : R.int(101, 399), hh = Math.floor(n / 100), t = Math.floor(n / 10) % 10, o = n % 10;
    return { title: '摆出 ' + n, hook: '用百板、十条、一块摆出 ' + n + '：' + (hh ? hh + ' 个百、' : '') + '几个十、几个一？', props: { mode: 0, h: 0, t: 0, o: 0 }, goals: [['value', n, '摆出了 ' + n]], sol: { h: hh, t, o } };
  } });

  add('clockbench', { gen(R, lv) {
    const h = R.int(1, 11), m = lv === 1 ? 0 : lv === 2 ? R.pick([15, 30, 45]) : R.int(1, 11) * 5, t = h * 60 + m;
    return { title: '把钟拨到 ' + h + ' 时' + (m ? ' ' + m + ' 分' : '整'), hook: '拖分针转，时针会跟着走。', props: { t: 0, start: 0, timing: false }, goals: [['t', t, h + ' 时' + (m ? ' ' + m + ' 分' : '整')]], sol: { t } };
  } });

  add('numlinebench', { gen(R, lv) {
    if (lv === 3) { const a = R.int(11, 19), b = R.int(a - 9, 9); return { title: a + ' − ' + b + '：往左跳', hook: '从 ' + a + ' 出发往左跳 ' + b + ' 步。', props: { mode: 0, from: 0, to: 20, a: 0, s: -1, n: 0 }, goals: [['value', a - b, a + ' − ' + b + ' = ' + (a - b)]], sol: { a, n: b } }; }
    const a = R.int(1, lv === 1 ? 5 : 9), b = R.int(1, lv === 1 ? 10 - a : 9); return { title: a + ' + ' + b + '：往右跳', hook: '先把起点拖到 ' + a + '，再往右跳 ' + b + ' 步。', props: { mode: 0, from: 0, to: 20, a: 0, s: 1, n: 0 }, goals: [['value', a + b, a + ' + ' + b + ' = ' + (a + b)]], sol: { a, n: b } };
  } });

  add('meanbench', { gen(R, lv) {
    const k = lv === 1 ? 3 : lv === 2 ? 4 : 5, m = R.int(3, 9); let v; for (;;) { v = Array.from({ length: k - 1 }, () => R.int(1, 2 * m)); const last = k * m - v.reduce((s, x) => s + x, 0); if (last >= 1 && last <= 15) { v.push(last); if (new Set(v).size > 1) break; } }
    return { title: v.join('、') + '：移多补少，平均每堆几块？', hook: '把多的搬给少的，搬到一样高。', props: { vals: v.join(','), showline: lv === 1 }, goals: [['level', 1, '一样高了：平均每堆 ' + m + ' 块']], sol: { vals: Array(k).fill(m).join(',') } };
  } });

  add('statbench', { gen(R, lv) {
    const n = 5 + lv, v = Array.from({ length: n }, () => R.int(1, 9)); if (lv === 1) v[R.int(0, n - 1)] = v[0];
    const cnt = {}; v.forEach((x) => { cnt[x] = (cnt[x] || 0) + 1; }); const top = Math.max(...Object.values(cnt)), modes = Object.keys(cnt).filter((x) => cnt[x] === top);
    if (lv === 1 && modes.length === 1) return { title: v.join('、') + '：出现最多的数（众数）是几？', hook: '点“众数”，看哪一个数出现得最多。', props: { vals: v.join(', ') }, goals: [['mode', modes[0], '众数是 ' + modes[0]]], sol: { smode: true } };
    const rng = Math.max(...v) - Math.min(...v); return { title: v.join('、') + '：最大和最小差多少（极差）？', hook: '点“极差”。', props: { vals: v.join(', ') }, goals: [['range', rng, '极差 = ' + Math.max(...v) + ' − ' + Math.min(...v) + ' = ' + rng]], sol: { srange: true } };
  } });

  add('swapbench', { gen(R, lv) {
    const n = R.int(lv === 1 ? 5 : 10, lv === 1 ? 10 : lv === 2 ? 20 : 35), b = R.int(1, n - 1), target = 2 * (n - b) + 4 * b;
    return { title: '鸡兔同笼：' + n + ' 个头，' + target + ' 条腿，兔有几只？', hook: '先假设全是鸡，再一只一只把鸡换成兔：每换一只多 2 条腿。', props: { n, k: 0, target }, goals: [['b', b, '兔有 ' + b + ' 只']], sol: { k: b } };
  } });

  add('travelbench', { gen(R, lv) {
    const t = R.int(2, 6), va = R.int(3, 12), vb = R.int(2, 9);
    if (lv === 3) { const v1 = Math.max(va, vb) + 1, v2 = Math.min(va, vb), gap0 = (v1 - v2) * t; return { title: '追及：乙先走了 ' + gap0 + ' 千米，甲每小时 ' + v1 + '，乙每小时 ' + v2 + '，几小时追上？', hook: '拖时间条，看两人之间的距离每小时少多少。', props: { len: gap0 + v2 * (t + 2), t: 0, tmax: t + 3, pa: 0, va: v1, da: 0, pb: gap0, vb: v2, db: 0, solo: false, lock: true }, goals: [['gap', 0, t + ' 小时追上']], sol: { t } }; }
    const len = (va + vb) * t; return { title: '相遇：相距 ' + len + ' 千米，甲每小时 ' + va + '，乙每小时 ' + vb + '，几小时相遇？', hook: '拖时间条，两人面对面走，每小时一共走多少？', props: { len, t: 0, tmax: t + 3, pa: 0, va, da: 0, pb: len, vb, db: 1, solo: false, lock: true }, goals: [['gap', 0, t + ' 小时相遇']], sol: { t } };
  } });

  add('tapebench', { gen(R, lv) {
    const u = R.int(3, 15), ka = R.int(2, lv === 1 ? 3 : 6);
    if (lv === 1) return { title: '乙有 ' + u + '，甲是乙的 ' + ka + ' 倍，甲有几？', hook: '把甲的线段调成 ' + ka + ' 份。', props: { ka: 1, kb: 1, u, tk: 2, lock: false }, goals: [['a', ka * u, '甲有 ' + ka * u]], sol: { ka } };
    if (lv === 2) { const tv = (ka + 1) * u; return { title: '甲是乙的 ' + ka + ' 倍，两人一共 ' + tv + '，乙有几？', hook: '甲 ' + ka + ' 份、乙 1 份，一共几份？拖一份的长度。', props: { ka, kb: 1, u: 1, tk: 0, tv, lock: true }, goals: [['hit', 1, '对上了：一份是 ' + u + '，乙有 ' + u]], sol: { u } }; }
    const tv = (ka - 1) * u; return { title: '甲是乙的 ' + ka + ' 倍，甲比乙多 ' + tv + '，乙有几？', hook: '甲比乙多几份？拖一份的长度。', props: { ka, kb: 1, u: 1, tk: 1, tv, lock: true }, goals: [['hit', 1, '对上了：乙有 ' + u]], sol: { u } };
  } });

  add('balancebench', { gen(R, lv) {
    const x = R.int(2, 12), a = lv === 1 ? 1 : R.int(2, 5), c = lv === 3 ? R.int(1, 9) : lv === 1 ? R.int(1, 9) : 0;
    const name = (a > 1 ? a : '') + 'x' + (c ? ' + ' + c : '') + ' = ' + (a * x + c);
    return { title: '解方程：' + name, hook: '天平两边同时拿走一样多、或者同时平分，一直保持平衡，直到一边只剩一个 x。', props: { lx: a, lc: c, rx: 0, rc: a * x + c, x0: x, sync: true, reveal: true }, goals: [['solved', x, 'x = ' + x]], sol: { lx: 1, lc: 0, rx: 0, rc: x } };
  } });

  add('termsbench', { gen(R, lv) {
    const a = R.int(2, 9), b = R.int(2, 9), c = R.int(2, 9);
    const [toks, val] = lv === 1 ? [[a, '+', b, '-', c], a + b - c] : lv === 2 ? [[a, '+', b, '*', c], a + b * c] : [[a * c, '-', a, '*', b, '+', c], a * c - a * b + c];
    if (val < 0) return this.gen(R, lv);
    const show = toks.join(' ').replace(/\*/g, '×').replace(/-/g, '−');
    return { title: show + ' = ?', hook: '按运算顺序，一步一步点着算：先乘除，后加减；同级从左往右。', props: { mode: 1, toks: toks.join(',') }, goals: [['value', val, show + ' = ' + val]], sol: { toks: String(val) } };
  } });

  // 竖式乘法：vals 是每一格的积（乘数从个位起，每一位乘被乘数的每一位，高位在前），再是每一行，再是总积
  add('mulbench', { gen(R, lv) {
    const a = lv === 1 ? R.int(12, 49) : lv === 2 ? R.int(21, 98) : R.int(102, 399), b = lv === 1 ? R.int(2, 9) : R.int(12, 49);
    const A = String(a).split('').map(Number), B = String(b).split('').map(Number).reverse(), cells = [], rows = [];
    B.forEach((bd, j) => { if (!bd) return; let row = 0; A.forEach((ad, i) => { if (!ad) return; const v = ad * Math.pow(10, A.length - 1 - i) * bd * Math.pow(10, j); cells.push(v); row += v; }); rows.push(row); });   // 是 0 的那一位整格、整行都不用算
    const vals = cells.concat(rows).concat(rows.length > 1 ? [a * b] : []);
    return { title: a + ' × ' + b, hook: '对着面积图，每一格先算，再一行一行加，最后相加。', props: { a, b }, goals: [['product', a * b, a + ' × ' + b + ' = ' + a * b]], sol: { vals: vals.join(',') } };
  } });

  add('solidbench', { gen(R, lv) {
    const rows = R.int(2, lv === 1 ? 3 : 4), cols = R.int(2, lv === 1 ? 3 : 5), hgt = R.int(1, lv === 3 ? 4 : 2), z = Array(rows).fill(Array(cols).fill(0).join(',')).join(';');
    return { title: '搭一个长 ' + cols + '、宽 ' + rows + '、高 ' + hgt + ' 的长方体，用几个小方块？', hook: '在每一格上点着往上摞，摞成 ' + hgt + ' 层。', props: { rows, cols, h: z }, goals: [['total', rows * cols * hgt, '一共 ' + rows * cols * hgt + ' 个小方块']], sol: { h: Array(rows).fill(Array(cols).fill(hgt).join(',')).join(';') } };
  } });
})(typeof globalThis !== 'undefined' ? globalThis : window);
