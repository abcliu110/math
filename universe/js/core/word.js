/* 数量关系引擎（应用题的“结构层”）。
 * 一道应用题 = 一组量 + 它们之间的关系 + 哪些已知 + 问哪个。引擎先定答案（保证是整数、唯一），再从关系里挑已知条件，
 * 最后用情境库和几种说法讲成故事。同一个结构可以交给不同的操作台去摆（线段图、天平、换一换、盈亏、双数轴、行程）。
 *   结构的种类（family）：
 *     pair     两个量：倍（A = k × B）、和差（A = B + d）、几倍多几 / 少几（A = k × B ± c）、比（A : B = p : q）；已知和或差
 *     age      年龄：差不变，几年后（前）是几倍
 *     swap     鸡兔同笼型：两种东西一共 n 个，每种各算 la、lb，总数 T（假设法）
 *     surplus  盈亏：每份 a 多（少）r1，每份 b 多（少）r2
 *     rate     率：总量 = 每份数 × 份数（单价 × 数量 = 总价、速度 × 时间 = 路程、工效 × 时间 = 工作量），归一、归总
 *     meet     相遇、追及
 *   变式的维度（vary）：数的大小（size 1–3）、问哪个（ask）、条件的先后、说法（正说 / 反说）、干扰条件（noise）。
 * 每个结构带着 solve()（答案）和 benches（能摆在哪些操作台上，各自的属性、目标、参考解）。 */
(function (G) {
  'use strict';
  const U = G.U;
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  // ---------- 情境库 ----------
  const PAIR = [['哥哥', '弟弟', '张', '邮票', '两人'], ['红花', '黄花', '朵', '', '两种花'], ['甲仓', '乙仓', '吨', '粮食', '两个仓'], ['故事书', '科技书', '本', '', '两种书'],
    ['男生', '女生', '人', '', '全班'], ['大桶', '小桶', '升', '油', '两桶'], ['长绳', '短绳', '米', '', '两根绳'], ['小明', '小红', '元', '钱', '两人'],
    ['苹果', '梨', '千克', '', '两种水果'], ['上午', '下午', '个', '零件', '一天'], ['一班', '二班', '棵', '树', '两个班'], ['白兔', '灰兔', '只', '', '两种兔']];
  const SWAP = [['鸡', '兔', '只', '条腿', 2, 4, '头'], ['自行车', '三轮车', '辆', '个轮子', 2, 3, '辆车'], ['两人桌', '四人桌', '张', '个座位', 2, 4, '张桌子'],
    ['小船', '大船', '条', '人', 4, 6, '条船'], ['5 角硬币', '1 元硬币', '枚', '角', 5, 10, '枚硬币'], ['单人间', '三人间', '间', '人', 1, 3, '间房'], ['蜘蛛', '蜻蜓', '只', '条腿', 8, 6, '只']];
  const SURPLUS = [['苹果', '个', '小朋友', '人'], ['本子', '本', '学生', '人'], ['糖', '块', '小组', '组'], ['树苗', '棵', '班', '班'], ['气球', '个', '小朋友', '人']];
  const RATE = [
    { T: '总价', P: '单价', N: '数量', tu: '元', nu: '支', item: '铅笔', per: (p) => '每支 ' + p + ' 元', tot: (t) => '一共 ' + t + ' 元', cnt: (n) => '买 ' + n + ' 支' },
    { T: '路程', P: '速度', N: '时间', tu: '千米', nu: '小时', item: '汽车', per: (p) => '每小时行 ' + p + ' 千米', tot: (t) => '一共行了 ' + t + ' 千米', cnt: (n) => '行了 ' + n + ' 小时' },
    { T: '工作量', P: '工效', N: '时间', tu: '个', nu: '天', item: '工人', per: (p) => '每天做 ' + p + ' 个零件', tot: (t) => '一共做了 ' + t + ' 个零件', cnt: (n) => '做了 ' + n + ' 天' },
    { T: '页数', P: '每天看的', N: '天数', tu: '页', nu: '天', item: '小明', per: (p) => '每天看 ' + p + ' 页', tot: (t) => '一共看了 ' + t + ' 页', cnt: (n) => '看了 ' + n + ' 天' },
  ];
  const NOISE = ['今天天气很好。', '他们是同一个班的。', '这件事发生在星期三。', '路上用了 10 分钟。'];

  const sizeOf = (lv) => (lv <= 1 ? 1 : lv === 2 ? 2 : 3);
  // ---------- pair：两个量 ----------
  function pair(R, o) {
    const sz = sizeOf(o.lv), kinds = o.kinds || (sz === 1 ? ['times'] : sz === 2 ? ['times', 'times', 'sumdiff'] : ['more', 'more', 'ratio', 'ratio', 'sumdiff']);
    for (let tries = 0; tries < 400; tries++) {
      const c = PAIR[R.int(0, PAIR.length - 1)], [na, nb, un] = c, kind = R.pick(kinds), u = R.int(2, kind === 'ratio' ? 12 : sz === 1 ? 10 : 20), bigA = R.bool();
      let ka = 1, kb = 1, ea = 0, eb = 0, rel = '', tk = kind === 'sumdiff' ? 0 : R.int(0, 1);
      const big = bigA ? na : nb, small = bigA ? nb : na;
      if (kind === 'times') { const k = R.int(2, sz === 1 ? 4 : 6); if (bigA) ka = k; else kb = k; rel = R.pick([big + '是' + small + '的 ' + k + ' 倍', small + '的 ' + k + ' 倍正好是' + big, small + '是' + big + '的 1/' + k]); }
      else if (kind === 'sumdiff') { const d = R.int(2, 30); if (bigA) ea = d; else eb = d; rel = R.pick([big + '比' + small + '多 ' + d + ' ' + un, small + '比' + big + '少 ' + d + ' ' + un]); }
      else if (kind === 'more') { const k = R.int(2, 5), cc = R.int(1, Math.min(12, u * (k - 1))) * (R.bool() ? 1 : -1); if (bigA) { ka = k; ea = cc; } else { kb = k; eb = cc; } rel = big + '比' + small + '的 ' + k + ' 倍' + (cc > 0 ? '多 ' + cc : '少 ' + (-cc)) + ' ' + un; }
      else { const p = R.int(1, 6), q = R.int(2, 7); if (p === q || gcd(p, q) !== 1) continue; ka = p; kb = q; rel = R.pick([na + '是' + nb + '的 ' + p + '/' + q, na + '和' + nb + '的比是 ' + p + ' : ' + q, na + '的数量相当于' + nb + '的 ' + p + '/' + q]); }
      const A = ka * u + ea, B = kb * u + eb; if (A <= 0 || B <= 0 || (A === B && tk === 1)) continue;
      const tv = tk === 0 ? A + B : Math.abs(A - B);
      if ((tk === 0 && ka + kb + ea + eb === tv) || (tk === 1 && Math.abs(ka - kb + ea - eb) === tv)) continue;   // 一段 1 的时候就对上了：不要
      const fact = tk === 0 ? R.pick([na + '和' + nb + '一共 ' + tv + ' ' + un, c[4] + '一共有 ' + tv + ' ' + un]) : (A > B ? R.pick([na + '比' + nb + '多 ' + tv + ' ' + un, nb + '比' + na + '少 ' + tv + ' ' + un]) : R.pick([nb + '比' + na + '多 ' + tv + ' ' + un, na + '比' + nb + '少 ' + tv + ' ' + un]));
      const askA = o.ask === 'A' ? true : o.ask === 'B' ? false : R.bool(), ask = askA ? na : nb, ans = askA ? A : B;
      const noise = o.noise ? R.pick(NOISE) : '';
      const title = (R.bool() ? rel + '，' + fact : fact + '，' + rel) + '。' + noise + (c[3] ? ask + '的' + c[3] : ask) + '有多少' + un + '？';
      return { family: 'pair', kind, title, ctx: c, na, nb, un, ka, kb, ea, eb, u, A, B, tk, tv, ask, ans, askA };
    }
    throw new Error('pair: 出不来');
  }
  // ---------- age：年龄差不变 ----------
  function age(R, o) {
    for (;;) {
      const k = R.int(2, 4), n = R.int(1, 8), later = R.bool(), u = R.int(4, 14), son = later ? u - n : u + n; if (son < 2) continue;
      const d = (k - 1) * u, ago = later ? n + ' 年后' : n + ' 年前';
      const ask = R.bool() ? 'son' : 'dad', ans = ask === 'son' ? son : son + d;
      const title = R.pick(['爸爸比儿子大 ' + d + ' 岁，', '爸爸今年的年龄减去儿子今年的年龄是 ' + d + ' 岁，']) + ago + '爸爸的年龄是儿子的 ' + k + ' 倍。' + (ask === 'son' ? '儿子' : '爸爸') + '今年几岁？';
      return { family: 'age', title, k, n, later, u, d, son, ask, ans };
    }
  }
  // ---------- swap：鸡兔同笼型 ----------
  function swap(R, o) {
    const sz = sizeOf(o.lv);
    for (;;) {
      const c = SWAP[R.int(0, SWAP.length - 1)], [na, nb, mu, unit, la0, lb0, head] = c;
      const la = Math.min(la0, lb0), lb = Math.max(la0, lb0), first = la0 < lb0;   // 换一换从“全是小的”开始
      const n = R.int(sz === 1 ? 5 : 10, sz === 1 ? 10 : sz === 2 ? 20 : 35), kb = R.int(1, n - 1), T = la * (n - kb) + lb * kb;
      const nameLo = first ? na : nb, nameHi = first ? nb : na;
      const askHi = R.bool(), ans = askHi ? kb : n - kb;
      const title = R.pick([nameLo + '和' + nameHi + '一共 ' + n + ' ' + (head === '头' ? '个头' : head) + '，一共 ' + T + ' ' + unit + '。', '有' + nameLo + '也有' + nameHi + '，共 ' + n + ' ' + (head === '头' ? '只' : head) + '，' + unit.replace(/^个|^条/, '') + '一共 ' + T + '。']) + (askHi ? nameHi : nameLo) + '有几' + mu + '？';
      return { family: 'swap', title, na: nameLo, nb: nameHi, unit, la, lb, n, kb, T, ask: askHi ? nameHi : nameLo, ans, askHi };
    }
  }
  // ---------- surplus：盈亏 ----------
  function surplus(R, o) {
    const sz = sizeOf(o.lv);
    for (;;) {
      const c = SURPLUS[R.int(0, SURPLUS.length - 1)], [item, iu, who, wu] = c;
      const N = R.int(3, sz === 1 ? 6 : 10), a = R.int(2, 8), b = R.int(a + 1, Math.min(12, a + (sz === 1 ? 2 : 4)));
      const type = sz === 1 ? 'pm' : R.pick(['pm', 'pm', 'pp', 'mm']);
      let r1, r2;
      if (type === 'pm') { r1 = R.int(1, 12); r2 = (a - b) * N + r1; if (r2 >= 0) continue; }
      else if (type === 'pp') { r2 = R.int(1, 8); r1 = (b - a) * N + r2; }
      else { r1 = -R.int(1, 8); r2 = (a - b) * N + r1; }
      const tot = a * N + r1; if (tot <= 0 || Math.abs(r1) > 30 || Math.abs(r2) > 30) continue;
      const say = (r) => (r > 0 ? '多 ' + r + ' ' + iu : r < 0 ? '少 ' + (-r) + ' ' + iu : '正好分完');
      const askN = R.bool();
      const title = '一些' + item + '分给' + who + '：每' + wu.replace('人', '人') + '分 ' + a + ' ' + iu + '，' + say(r1) + '；每' + wu + '分 ' + b + ' ' + iu + '，' + say(r2) + '。' + (askN ? '有几' + (wu === '人' ? '个' + who : wu) + '？' : item + '一共有几' + iu + '？');
      return { family: 'surplus', title, item, iu, who, wu, N, a, b, r1, r2, tot, ask: askN ? 'N' : 'tot', ans: askN ? N : tot };
    }
  }
  // ---------- rate：归一、归总 ----------
  function rate(R, o) {
    const sz = sizeOf(o.lv), c = RATE[R.int(0, RATE.length - 1)];
    const P = R.int(2, sz === 1 ? 9 : 25), N1 = R.int(2, 6), N2 = R.int(2, sz === 1 ? 9 : 12); if (N1 === N2) return rate(R, o);
    const T1 = P * N1, T2 = P * N2;
    const kind = sz === 1 ? 'total' : R.pick(['unit', 'unit', 'back']);
    if (kind === 'total') return { family: 'rate', kind, ctx: c, title: c.item + c.per(P) + '，' + c.cnt(N2) + '，' + c.tot('多少').replace(' 多少 ', '多少') + '？', P, N1: 1, T1: P, N2, ans: T2, ask: 'T' };
    if (kind === 'unit') return { family: 'rate', kind, ctx: c, title: c.item + c.cnt(N1) + '，' + c.tot(T1) + '。照这样，' + c.cnt(N2) + '，' + c.tot('多少').replace(' 多少 ', '多少') + '？', P, N1, T1, N2, ans: T2, ask: 'T' };
    return { family: 'rate', kind, ctx: c, title: c.item + c.cnt(N1) + '，' + c.tot(T1) + '。照这样，' + c.tot(T2) + '要' + c.cnt('几').replace('几 ', '几') + '？', P, N1, T1, N2, T2, ans: N2, ask: 'N' };
  }
  // ---------- meet：相遇、追及 ----------
  function meet(R, o) {
    const sz = sizeOf(o.lv), t = R.int(2, 6), va = R.int(3, 12), vb = R.int(2, 9), names = R.pick([['甲', '乙'], ['小明', '小红'], ['客车', '货车'], ['哥哥', '弟弟']]);
    if (sz === 3 && va !== vb) { const v1 = Math.max(va, vb), v2 = Math.min(va, vb), gap = (v1 - v2) * t; return { family: 'meet', kind: 'chase', title: names[1] + '先走了 ' + gap + ' 千米，' + names[0] + '每小时 ' + v1 + ' 千米，' + names[1] + '每小时 ' + v2 + ' 千米，' + names[0] + '几小时追上' + names[1] + '？', names, v1, v2, gap, t, ans: t }; }
    const len = (va + vb) * t; return { family: 'meet', kind: 'meet', title: names[0] + '和' + names[1] + '从相距 ' + len + ' 千米的两地同时相向而行，' + names[0] + '每小时 ' + va + ' 千米，' + names[1] + '每小时 ' + vb + ' 千米，几小时相遇？', names, va, vb, len, t, ans: t };
  }

  // ---------- 摆到操作台上：每个结构能去哪些操作台，各给属性、目标、参考解、提示 ----------
  const ADAPT = {
    tapebench(s) {
      if (s.family === 'pair') return { props: { ka: s.ka, kb: s.kb, u: 1, ea: s.ea, eb: s.eb, tk: s.tk, tv: s.tv, lock: true, na: s.na, nb: s.nb, unit: s.un }, goals: [['hit', 1, s.ask + ' ' + s.ans + ' ' + s.un]], sol: { u: s.u },
        hook: '线段图上段数已经摆好。先看' + (s.tk === 0 ? '一共' : '相差') + '几段' + (s.ea || s.eb ? '（多的先去掉，少的先补上）' : '') + '，再拖一段的长度。' };
      if (s.family === 'age') { const fut = s.later; return { props: { ka: s.k, kb: 1, u: 1, tk: 1, tv: s.d, lock: true, na: '爸爸', nb: '儿子', unit: '岁' }, goals: [['hit', 1, (fut ? s.n + ' 年后' : s.n + ' 年前') + '儿子 ' + s.u + ' 岁：儿子今年 ' + s.son + ' 岁，爸爸 ' + (s.son + s.d) + ' 岁']], sol: { u: s.u },
        hook: '年龄差永远不变。线段图画的是' + (fut ? s.n + ' 年后' : s.n + ' 年前') + '：爸爸 ' + s.k + ' 段、儿子 1 段，相差 ' + s.d + ' 岁。拖一段的长度，再' + (fut ? '减去 ' : '加上 ') + s.n + '。' }; }
      return null;
    },
    balancebench(s) {
      // 只有“问的是小的那个、关系是几倍（多几）、已知是和”才摆成天平：(k + 1) 个盒子 + c = 和
      if (s.family !== 'pair' || s.tk !== 0 || (s.kind !== 'times' && s.kind !== 'more')) return null;
      const bigA = s.ka > 1, k = bigA ? s.ka : s.kb, c = bigA ? s.ea : s.eb, x = s.u;
      if (s.askA === bigA) return null;   // 天平上求的是小的那个（一个盒子）：问的是大的就换一道
      if (c < 0) return { props: { lx: k + 1, lc: 0, rx: 0, rc: s.tv - c, x0: x, sync: true, reveal: true }, goals: [['solved', x, (bigA ? s.nb : s.na) + ' ' + x]], sol: { lx: 1, lc: 0, rx: 0, rc: x },
        hook: '把小的那个当成一个盒子 x。少的 ' + (-c) + ' 先补上：两边一共 ' + (k + 1) + ' 个盒子 = ' + (s.tv - c) + '。两边一起平分。' };
      return { props: { lx: k + 1, lc: c, rx: 0, rc: s.tv, x0: x, sync: true, reveal: true }, goals: [['solved', x, (bigA ? s.nb : s.na) + ' ' + x]], sol: { lx: 1, lc: 0, rx: 0, rc: x },
        hook: '把小的那个当成一个盒子 x，大的就是 ' + k + ' 个盒子' + (c ? ' 加 ' + c + ' 个砝码' : '') + '。天平两边一起拿走、一起平分，留下一个盒子。' };
    },
    swapbench(s) {
      if (s.family !== 'swap') return null;
      return { props: { n: s.n, k: 0, target: s.T, la: s.la, lb: s.lb, na: s.na, nb: s.nb, unit: s.unit, style: 1 }, goals: [['b', s.kb, s.nb + ' ' + s.kb + '，' + s.na + ' ' + (s.n - s.kb)]], sol: { k: s.kb },
        hook: '先假设全是' + s.na + '：一共 ' + s.la * s.n + '，比 ' + s.T + ' 少 ' + (s.T - s.la * s.n) + '。每把一个' + s.na + '换成' + s.nb + '，多 ' + (s.lb - s.la) + '。' };
    },
    surplusbench(s) {
      if (s.family !== 'surplus') return null;
      return { props: { a: s.a, r1: s.r1, b: s.b, r2: s.r2, n: 1, item: s.iu, who: s.wu }, goals: [['total', s.tot, s.N + ' ' + s.wu + '，' + s.tot + ' ' + s.iu]], sol: { n: s.N },
        hook: '两种分法每' + s.wu + '差 ' + (s.b - s.a) + ' ' + s.iu + '，一共差 ' + Math.abs(s.r1 - s.r2) + ' ' + s.iu + '。改' + s.wu + '数，让上下两排需要的一样多。' };
    },
    ratiobench(s) {
      if (s.family !== 'rate' || s.ask !== 'T') return null;
      const c = s.ctx, top = Math.max(s.N1, s.N2) + 2;
      return { props: { mode: 1, pa: s.N1, pb: s.T1, tmax: top, tstep: 1, t: 0, ua: c.nu, ub: c.tu }, goals: [['b', s.ans, s.N2 + ' ' + c.nu + '：' + s.ans + ' ' + c.tu]], sol: { t: s.N2 },
        hook: '双数轴：上面是' + c.N + '（' + c.nu + '），下面是' + c.T + '（' + c.tu + '）。' + s.N1 + ' ' + c.nu + '对着 ' + s.T1 + '，先看 1 ' + c.nu + '对着几，再拖到 ' + s.N2 + '。' };
    },
    travelbench(s) {
      if (s.family !== 'meet') return null;
      if (s.kind === 'chase') return { props: { len: Math.max(s.gap + s.v2 * s.t + 10, 30), pa: 0, va: s.v1, da: 0, pb: s.gap, vb: s.v2, db: 0, t: 0, tmax: s.t + 4, lock: true, na: s.names[0], nb: s.names[1] }, goals: [['gap', 0, s.t + ' 小时追上']], sol: { t: s.t }, hook: '拖时间条：每小时追近 ' + (s.v1 - s.v2) + ' 千米。' };
      return { props: { len: s.len, pa: 0, va: s.va, da: 0, pb: s.len, vb: s.vb, db: 1, t: 0, tmax: s.t + 4, lock: true, na: s.names[0], nb: s.names[1] }, goals: [['gap', 0, s.t + ' 小时相遇']], sol: { t: s.t }, hook: '拖时间条：两人面对面走，每小时一共近 ' + (s.va + s.vb) + ' 千米。' };
    },
  };
  // ---------- 关系图：把结构画成“量 + 关系”，连同几张常见的错关系卡（比如 一份 = 和 ÷ 倍数）----------
  // qs: [[名字, 知道?, 数]]；rels/bad: ['0=1+2']；ask: 第几个量
  function graph(qs, rels, bad, ask, R) {
    const cards = rels.concat(bad).map((r, i) => [r, i]);
    for (let i = cards.length - 1; i > 0; i--) { const j = R.int(0, i); [cards[i], cards[j]] = [cards[j], cards[i]]; }
    const props = { qs: qs.map((q) => q[0] + '|' + (q[1] ? 1 : 0) + '|' + q[2]).join(';'), rels: rels.join(';'), cand: cards.map((c) => c[0]).join(';'), ask, chosen: '', got: '', need: '', wrong: 0 };
    // 参考解：连上所有对的卡，再按能算的顺序一步一步算
    const chosen = cards.map((c, i) => (c[1] < rels.length ? i : -1)).filter((i) => i >= 0);
    const known = qs.map((q) => q[1]), got = []; let moved = true;
    const P = rels.map((r) => { const m = /^(\d+)=(\d+)([-+*/])(\d+)$/.exec(r); return { key: r, ids: [+m[1], +m[2], +m[4]] }; });
    while (moved) { moved = false; for (const r of P) { const miss = r.ids.filter((i) => !known[i]); if (miss.length === 1) { known[miss[0]] = true; got.push(miss[0] + '@' + r.key); moved = true; } } }
    return { props, sol: { chosen: chosen.join(','), got: got.join(',') } };
  }
  ADAPT.relbench = (s, R) => {
    let qs, rels, bad, ask, say;
    if (s.family === 'pair' && s.kind === 'times') {
      const bigA = s.ka > 1, k = bigA ? s.ka : s.kb, big = bigA ? s.na : s.nb, small = bigA ? s.nb : s.na, sv = s.u, bv = s.u * k, sum = s.tk === 0;
      qs = [[big, 0, bv], [small, 0, sv], [sum ? '一共' : '相差', 1, s.tv], ['倍数', 1, k], ['1 份', 1, 1], [sum ? '一共几份' : '相差几份', 0, sum ? k + 1 : k - 1]];
      rels = [sum ? '5=3+4' : '5=3-4', '1=2/5', '0=1*3']; bad = [sum ? '1=2/3' : '1=2/3', '0=2-1'];
      ask = s.ask === big ? 0 : 1; say = s.ask + ' ' + (ask === 0 ? bv : sv);
    } else if (s.family === 'pair' && s.kind === 'sumdiff' && s.tk === 0) {
      const bigA = s.ea > 0, d = bigA ? s.ea : s.eb, big = bigA ? s.na : s.nb, small = bigA ? s.nb : s.na, sv = s.u, bv = s.u + d;
      qs = [[big, 0, bv], [small, 0, sv], ['一共', 1, s.tv], ['多的', 1, d], ['去掉多的', 0, s.tv - d], ['2', 1, 2]];
      rels = ['4=2-3', '1=4/5', '0=1+3']; bad = ['1=2/5', '0=2-3'];
      ask = s.ask === big ? 0 : 1; say = s.ask + ' ' + (ask === 0 ? bv : sv);
    } else if (s.family === 'rate') {
      const c = s.ctx;
      qs = [[c.N + '（' + s.N1 + '）', 1, s.N1], [c.T + '（' + s.N1 + ' ' + c.nu + '）', 1, s.T1], [c.P, 0, s.P], [c.N + '（后来）', s.ask === 'N' ? 0 : 1, s.N2], [c.T + '（后来）', s.ask === 'N' ? 1 : 0, s.T2 || s.P * s.N2]];
      rels = s.ask === 'N' ? ['2=1/0', '3=4/2'] : ['2=1/0', '4=2*3']; bad = s.ask === 'N' ? ['3=4/0'] : ['4=1*3'];
      ask = s.ask === 'N' ? 3 : 4; say = (s.ask === 'N' ? s.N2 : s.T2 || s.P * s.N2) + '';
    } else if (s.family === 'swap') {
      qs = [[s.nb, 0, s.kb], [s.na, 0, s.n - s.kb], ['一共几个', 1, s.n], ['一共' + s.unit.replace(/^个|^条/, ''), 1, s.T], ['每个' + s.na, 1, s.la], ['每个' + s.nb, 1, s.lb], ['假设全是' + s.na, 0, s.la * s.n], ['少了', 0, s.T - s.la * s.n], ['换一个多', 0, s.lb - s.la]];
      qs = [qs[0], qs[1], qs[2], qs[3], qs[4], qs[6], qs[7], ['换一个多', 1, s.lb - s.la]]; rels = ['5=4*2', '6=3-5', '0=6/7', '1=2-0']; bad = ['0=3/7'];
      ask = s.askHi ? 0 : 1; say = s.ans + '';
    } else if (s.family === 'surplus' && s.r1 > 0 && s.r2 < 0) {
      qs = [[s.who.replace(/^/, '') + '数', 0, s.N], ['一共几' + s.iu, 0, s.tot], ['每' + s.wu + '分 ' + s.a, 1, s.a], ['每' + s.wu + '分 ' + s.b, 1, s.b], ['多', 1, s.r1], ['少', 1, -s.r2], ['每' + s.wu + '差', 0, s.b - s.a], ['一共差', 0, s.r1 - s.r2]];
      rels = ['6=3-2', '7=4+5', '0=7/6']; bad = ['7=4-5', '0=4/6'];
      if (s.ask === 'tot') return null;
      ask = 0; say = s.N + '';
    } else if (s.family === 'meet' && s.kind === 'meet') {
      qs = [['相距', 1, s.len], [s.names[0] + '的速度', 1, s.va], [s.names[1] + '的速度', 1, s.vb], ['速度和', 0, s.va + s.vb], ['相遇时间', 0, s.t]];
      rels = ['3=1+2', '4=0/3']; bad = ['4=0/1']; ask = 4; say = s.t + ' 小时';
    } else return null;
    const g = graph(qs, rels, bad, ask, R);
    return { props: g.props, goals: [['ans', +qs[ask][2], '算出来了：' + say]], sol: g.sol, hook: '先点右边对的关系卡把关系连上，再点关系圈一步一步算。不知道先算什么，就点问题连着的关系圈：看还缺什么。' };
  };
  const FAM = { pair, age, swap, surplus, rate, meet };
  // 出一道：fam 结构种类，bench 摆到哪个操作台；o.lv 难度，o.noise 加干扰条件，o.ask 指定问谁
  function make(R, fam, bench, o) {
    for (let i = 0; i < 200; i++) {
      const s = FAM[fam](R, o || {}), a = ADAPT[bench] && ADAPT[bench](s, R);
      if (a) return Object.assign({ title: s.title, struct: s, answer: s.ans }, a);
    }
    throw new Error('word: ' + fam + ' 摆不到 ' + bench);
  }
  // ---------- 算式配情境：a op b → 一句应用题（加：合并、增加、比多；减：剩余、比较、比少、求另一部分；乘：每份几个、单价、几倍；除：等分、包含，可以有余数）----------
  const ITEM = [['苹果', '个'], ['铅笔', '支'], ['糖', '块'], ['本子', '本'], ['邮票', '张'], ['气球', '个'], ['画片', '张'], ['贴纸', '张']];
  const WHO = ['小明', '小红', '小华', '小林', '哥哥', '妹妹', '小亮', '小芳'];
  function story(R, op, a, b) {
    if (!Number.isInteger(a) || !Number.isInteger(b)) {   // 小数：讲成钱、长度、重量
      const [x, u] = R.pick([['元', '元'], ['米', '米'], ['千克', '千克']]);
      if (op === '+') return R.pick(['买书用了 ' + a + ' ' + u + '，买笔用了 ' + b + ' ' + u + '，一共用了多少' + u + '？', '一根绳子剪下 ' + a + ' ' + u + '，还剩 ' + b + ' ' + u + '，原来长多少' + u + '？'].slice(0, x === '元' ? 1 : 2));
      if (op === '−') return R.pick(['有 ' + a + ' ' + u + '，用去 ' + b + ' ' + u + '，还剩多少' + u + '？', '甲有 ' + a + ' ' + u + '，乙有 ' + b + ' ' + u + '，甲比乙多多少' + u + '？']);
      if (op === '×') return '每份 ' + a + ' ' + u + '，' + b + ' 份一共多少' + u + '？';
    }
    const [it, q] = R.pick(ITEM), i = R.int(0, WHO.length - 1), p1 = WHO[i], p2 = WHO[(i + R.int(1, WHO.length - 1)) % WHO.length];
    if (op === '+') return R.pick([p1 + '有 ' + a + ' ' + q + it + '，' + p2 + '有 ' + b + ' ' + q + '，两人一共有多少' + q + '？', p1 + '原来有 ' + a + ' ' + q + it + '，又买来 ' + b + ' ' + q + '，现在有多少' + q + '？', p1 + '有 ' + a + ' ' + q + it + '，' + p2 + '比' + p1 + '多 ' + b + ' ' + q + '，' + p2 + '有多少' + q + '？']);
    if (op === '−') return R.pick([p1 + '有 ' + a + ' ' + q + it + '，送给别人 ' + b + ' ' + q + '，还剩多少' + q + '？', p1 + '有 ' + a + ' ' + q + it + '，' + p2 + '有 ' + b + ' ' + q + '，' + p1 + '比' + p2 + '多多少' + q + '？', p1 + '有 ' + a + ' ' + q + it + '，' + p2 + '比' + p1 + '少 ' + b + ' ' + q + '，' + p2 + '有多少' + q + '？', '一共有 ' + a + ' ' + q + it + '，其中红色的 ' + b + ' ' + q + '，其余的有多少' + q + '？']);
    if (op === '×') return R.pick(['每盒装 ' + a + ' ' + q + it + '，' + b + ' 盒一共多少' + q + '？', '一' + q + it + ' ' + a + ' 元，买 ' + b + ' ' + q + '要多少元？', '每排坐 ' + a + ' 人，坐了 ' + b + ' 排，一共多少人？', p1 + '有 ' + a + ' ' + q + it + '，' + p2 + '的是' + p1 + '的 ' + b + ' 倍，' + p2 + '有多少' + q + '？']);
    const r = a % b;
    return r ? R.pick([a + ' ' + q + it + '，每 ' + b + ' ' + q + '装一袋，能装几袋？还剩几' + q + '？', a + ' ' + q + it + '平均分给 ' + b + ' 个小朋友，每人最多分几' + q + '？还剩几' + q + '？'])
      : R.pick([a + ' ' + q + it + '平均分给 ' + b + ' 个小朋友，每人分几' + q + '？', a + ' ' + q + it + '，每 ' + b + ' ' + q + '装一袋，能装几袋？', '一根绳子长 ' + a + ' 米，每 ' + b + ' 米剪一段，能剪几段？']);
  }
  U.Word = { make, FAM, ADAPT, PAIR, SWAP, SURPLUS, RATE, story };
})(typeof globalThis !== 'undefined' ? globalThis : window);
