/* 预测表单（纯逻辑，无 DOM）：问题的 predict 可以是五种形式之一。
 * pick：选项（options，每项 {v,label}）；answer 是正确选项的 v
 * place：位置（slots，标签数组）；answer 是正确位置的下标
 * more-less：参照物 ref；answer 是 'more' | 'less' | 'same'（多 / 少 / 一样）
 * number：answer 是精确数字的文字，比如 '12'、'3/4'；按有理数精确比较
 * type：answer 是标准答案文字；accept 是可以接受的其他写法（去掉首尾空格后比较）
 * 没写 form 时：有 options 就当作 pick（兼容旧题目）。 */
(function (G) {
  'use strict';
  const U = G.U;

  const FORMS = ['pick', 'place', 'more-less', 'number', 'type'];
  const CMP = { more: '多', less: '少', same: '一样' };

  // 这道题的预测属于哪些形式（不合法的 form 返回空数组）
  U.Predict = {
    FORMS,
    CMP,
    normalize(predict) {
      if (!predict || typeof predict !== 'object') return [];
      if (predict.form === undefined) return Array.isArray(predict.options) ? ['pick'] : [];
      return FORMS.includes(predict.form) ? [predict.form] : [];
    },
    // 检查学生的回答 answer 是否正确。返回 {ok, why}，why 是给学生看的中文说明
    check(predict, answer) {
      const form = predict.form === undefined ? 'pick' : predict.form;
      if (form === 'pick') {
        if (predict.answer === undefined) return { ok: false, why: '这道题没有标准答案' };
        const ok = String(answer) === String(predict.answer);
        const o = (predict.options || []).find((x) => String(x.v) === String(predict.answer));
        return { ok, why: ok ? '猜对了' : '不对，正确的是「' + (o ? o.label : predict.answer) + '」' };
      }
      if (form === 'place') {
        const slots = predict.slots || [];
        const i = Number(answer);
        if (!Number.isInteger(i) || i < 0 || i >= slots.length) return { ok: false, why: '没有这个位置' };
        const ok = i === Number(predict.answer);
        return { ok, why: ok ? '放对了' : '不对，正确的是「' + slots[predict.answer] + '」' };
      }
      if (form === 'more-less') {
        if (!Object.prototype.hasOwnProperty.call(CMP, answer)) return { ok: false, why: '没有这个选项' };
        const ok = answer === predict.answer;
        return { ok, why: ok ? '对了' : '不对，正确的是「' + CMP[predict.answer] + '」' };
      }
      if (form === 'number') {
        let a;
        try { a = U.Q.parse(answer); } catch (e) { return { ok: false, why: '请写成整数、小数或分数，比如 12、0.5、3/4' }; }
        let b;
        try { b = U.Q.parse(predict.answer); } catch (e) { return { ok: false, why: '这道题的标准答案写错了' }; }
        const ok = U.Q.eq(a, b);
        return { ok, why: ok ? '答对了' : '不对，正确答案是 ' + predict.answer };
      }
      if (form === 'type') {
        const s = String(answer).trim();
        const want = [predict.answer].concat(predict.accept || []).map((x) => String(x).trim());
        const ok = s !== '' && want.includes(s);
        return { ok, why: ok ? '答对了' : '不对，正确答案是「' + predict.answer + '」' };
      }
      return { ok: false, why: '不认识这种预测形式' };
    },
  };

  // ===================== 自动先猜（docs/instrument-design.md 2026-11-26 条目）=====================
  // 操作台题（器材架或台面上有 bench 器材）自己没写 predict 时，从里程碑自动出一道“先猜”选择题：
  //   答案 = 某个里程碑要做到的数（优先：里程碑条件里“某个输出 = 某个数”；其次：里程碑说法里的数）；
  //     题目、开场白里已经给出的数是条件，不拿来猜；0/1 开关值（对不对、是不是）不拿来猜。
  //   干扰项按常见错法生成，不随机：算反（加减、乘除弄反，分子分母倒过来）、只算一部分（忘了进位 / 退位、只算了一半、只数一份）、
  //     差一（多数 / 少数一个）、多算一倍；凑不够 3 个再用“差 2、差 3……”补。
  // 返回的 predict 和手写的 pick 一样用（form: 'pick'），多了 auto: true、ms（答案来自哪个里程碑）、wrong（每个干扰项是哪种错法）。
  // 题目自己写了 predict 的，一律不覆盖。先猜猜错不扣分：做到那个里程碑时只记一条 guess 事件（对没对、差多少）。
  const NUM_RE = /[-−]?\d+(?:\.\d+)?(?:\/\d+)?/g;
  const BOOL_LAB = /1\/0|1 是|0 否|（1|1=|1＝|是不是|对不对/;
  const toQ = (s) => { try { return U.Q.parse(String(s).replace('−', '-')); } catch (e) { return null; } };
  const canon = (s) => { const q = toQ(s); return q ? U.Q.show(q) : null; };
  const numsIn = (s) => String(s || '').match(NUM_RE) || [];
  const autoCache = new WeakMap();
  // 说法里等于 ans 的数换成“？”（前后不能紧挨着数字、小数点、分数线）
  function hideNum(say, ans) {
    let raw = null;
    const s = String(say || '').replace(/(^|[^0-9./])([-−]?\d+(?:\.\d+)?(?:\/\d+)?)(?![0-9./])/g, (m0, pre, x) => (canon(x) === ans ? ((raw = raw || x.replace('−', '-')), pre + '？') : m0));
    return raw === null ? null : { s, raw };
  }
  function benchScene(p) {
    let sc = null; try { sc = typeof p.build === 'function' ? p.build() : null; } catch (e) { sc = null; }
    const shelfBench = (p.shelf || []).some((t) => U.types[t] && U.types[t].bench);
    const ents = sc && sc.entities ? Object.values(sc.entities) : [];
    return shelfBench || ents.some((e) => U.types[e.type] && U.types[e.type].bench) ? { ents } : null;
  }
  // 台面上开了记录仪（“记下来”）的题：记录仪自己每个点都先猜，不再叠一道题目级的先猜
  const hasRecorder = (bs) => !!U.Recorder && bs.ents.some((e) => U.Recorder.on(e.props));
  // 里程碑条件里“输出 = 值”的叶子（all 里面的也算；any、not 不算：那不是“一定要做到的数”）
  function leaves(w, acc) {
    if (!w || typeof w !== 'object') return acc;
    if (Array.isArray(w.all)) w.all.forEach((x) => leaves(x, acc));
    else if (typeof w.port === 'string' && (w.op === undefined || w.op === '=') && w.value !== undefined) acc.push(w);
    return acc;
  }
  function findTarget(p, ents) {
    const ms = p.milestones || [], gs = new Set(numsIn((p.title || '') + ' ' + (p.hook || '')).map(canon).filter(Boolean));
    // 1. 里程碑要某个输出等于某个数：从最后一个里程碑往前找（最后的往往是答案）
    for (let i = ms.length - 1; i >= 0; i--) {
      const m = ms[i];
      for (const l of leaves(m.when, []).reverse()) {
        const ans = canon(l.value); if (ans === null || gs.has(ans)) continue;
        const e = l.type ? { type: l.type } : ents.find((x) => x.role === l.role), d = e && U.types[e.type], o = d && d.outputs && d.outputs[l.port];
        if (!o) continue;
        const sayNums = numsIn(m.say).map(canon);
        if ((ans === '0' || ans === '1') && (BOOL_LAB.test(o.label || '') || !sayNums.includes(ans))) continue;
        // 说法里要写着这个数（才好把它换成“？”来问）；说法里没写的输出口（内部计数、编码）不拿来问
        const h = hideNum(m.say, ans); if (!h) continue;
        return { m, ans, raw: h.raw };
      }
    }
    // 2. 里程碑说法里的数（判的是“对不对”，但说法里写着做出来的数，比如“整理好了：42”“最少 16 分钟”）
    for (let i = ms.length - 1; i >= 0; i--) {
      const m = ms[i], xs = numsIn(m.say).filter((x) => { const c = canon(x); return c !== null && !gs.has(c); });
      if (xs.length) { const x = xs[xs.length - 1]; return { m, ans: canon(x), raw: x.replace('−', '-') }; }
    }
    const title = String(p.title || ''), trap = p.level === 'trap' || /-trap$/.test(p.id);
    // 3. 标题问的是“A 还是 B”：两个说法里，最后做到的里程碑说的是哪一个（前面带“不”的不算）
    const hs = /([^，。：？?、\s]+)还是([^，。：？?、\s]+)[？?]/.exec(title);
    if (hs) {
      const Y = hs[2], X = hs[1].slice(-Y.length);
      const says = (w, s) => s.split(w).slice(1).length > 0 && s.split(w).slice(0, -1).some((pre) => !/不$/.test(pre));
      for (let i = ms.length - 1; i >= 0; i--) {
        const s = String(ms[i].say || ''), a = says(X, s), b = says(Y, s);
        if (a !== b) return { word: true, m: ms[i], q: '动手之前先猜：' + title, options: [X, Y], answer: a ? X : Y, wrong: { [a ? Y : X]: '猜反了' } };
      }
    }
    // 3b. 标题问“A 和 B，哪个大 / 小 / 高 / 冷 / 在左边”，A、B 是两个数：比一比就知道答案（和里程碑说的那个数一致）
    const cmp = /([-−]?\d+(?:\.\d+)?(?:\/\d+)?)[^\d，,]*和\s*([-−]?\d+(?:\.\d+)?(?:\/\d+)?)[^\d，,]*[，,]\s*哪个([^？?]*)[？?]/.exec(title);
    if (cmp && toQ(cmp[1]) && toQ(cmp[2]) && ms.length) {
      const big = /大|高|热|右/.test(cmp[3]), small = /小|低|冷|左/.test(cmp[3]);
      if (big !== small) {
        const a = toQ(cmp[1]), b = toQ(cmp[2]), first = (U.Q.cmp(a, b) > 0) === big, X = cmp[1], Y = cmp[2];
        return { word: true, m: ms[ms.length - 1], q: '动手之前先猜：' + title, options: [X, Y], answer: first ? X : Y, wrong: { [first ? Y : X]: '比反了' } };
      }
    }
    // 3c. 标题问点在哪里、怎么写：里程碑说法里的点 (x, y)；干扰项是横纵颠倒、符号弄反、差一格
    const pt = /哪里|怎么写|哪个点/.test(title) && ms.length && /\(\s*([-−]?\d+)\s*,\s*([-−]?\d+)\s*\)/.exec(String(ms[ms.length - 1].say || ''));
    if (pt) {
      const x = +pt[1].replace('−', '-'), y = +pt[2].replace('−', '-'), P = (a, b) => '(' + a + ', ' + b + ')', ans = P(x, y), seen = new Set([ans]), opts = [ans], wrong = {};
      for (const [a, b, why] of [[y, x, '横、纵颠倒了'], [-x, -y, '方向弄反了'], [x, -y, '纵坐标符号弄反了'], [-x, y, '横坐标符号弄反了'], [x + 1, y, '差了一格'], [x, y + 1, '差了一格']]) {
        const s = P(a, b); if (opts.length < 4 && !seen.has(s)) { seen.add(s); opts.push(s); wrong[s] = why; }
      }
      return { word: true, m: ms[ms.length - 1], q: '动手之前先猜：' + title, options: opts.sort(), answer: ans, wrong };
    }
    // 4. 标题是问句、问的是一个数（几、多少、多远、哪个最多）：最后一个里程碑说法里的数，题目里给过也算（比如中位数正好是数据里的一个）
    if (/几|多少|多远|哪个[^？?]*最/.test(title)) {
      for (let i = ms.length - 1; i >= 0; i--) {
        const s = String(ms[i].say || ''), mm = /(?:=|是|：|一共|最少|最多|有|剩)\s*([-−]?\d+(?:\.\d+)?(?:\/\d+)?)(?![0-9./])[^=是：]*$/.exec(s);
        const x = mm ? mm[1] : numsIn(s)[0];
        if (x && canon(x) !== null) return { m: ms[i], ans: canon(x), raw: x.replace('−', '-') };
      }
    }
    // 5. 标题是“……吗？”：能 / 不能、是 / 不是。答案看最后一个里程碑说的是不是否定。
    //    陷阱题不出：陷阱题的里程碑说的常常是“改对以后”的样子，和标题问的那个情形正好相反
    if ((/吗[？?]\s*$/.test(title) || /能不能[^？?]*[？?]\s*$/.test(title)) && !trap && ms.length) {
      const pair = /能/.test(title) ? ['能', '不能'] : /有/.test(title) ? ['有', '没有'] : /对吗/.test(title) ? ['对', '不对'] : /会/.test(title) ? ['会', '不会'] : ['是', '不是'];
      const m = ms[ms.length - 1], neg = NEG.test(String(m.say || ''));
      return { word: true, m, q: '动手之前先猜：' + title, options: pair, answer: pair[neg ? 1 : 0], wrong: { [pair[neg ? 0 : 1]]: '猜反了' }, neg };
    }
    return null;
  }
  const NEG = /不能|不成立|没有|不是|不一样|不对|拼不成|找不到|做不到|永远不|不全等|不相等/;
  // 干扰项：按常见错法，从题目给的数和答案推出来
  function distractors(A, raw, givens) {
    const Q = U.Q, Z = Q(0), neg = Q.cmp(A, Z) < 0, int = Q.isInt(A), dec = (/\.(\d+)/.exec(raw) || [, ''])[1].length;
    const big = Math.max(1000, Math.abs(Q.num(A)) * 10 + 10);
    const ok = (x) => x && (neg || Q.cmp(x, Z) >= 0) && (!int || Q.isInt(x)) && Math.abs(Q.num(x)) <= big && !Q.eq(x, A);
    const C = { rev: [], part: [], one: [], dbl: [] };
    const put = (k, f, why) => { let x = null; try { x = f(); } catch (e) { x = null; } if (ok(x)) C[k].push({ x, why }); };
    const gs = []; givens.forEach((s) => { const q = toQ(s); if (q && !gs.some((y) => Q.eq(y, q))) gs.push(q); });
    for (let i = 0; i < gs.length && i < 8; i++) for (let j = 0; j < gs.length && j < 8; j++) {
      if (i === j) continue;
      const a = gs[i], b = gs[j];
      if (i < j && Q.eq(Q.add(a, b), A)) {
        put('rev', () => Q.abs(Q.sub(a, b)), '把加法算成了减法');
        if (Q.isInt(a) && Q.isInt(b) && (Number(a.n % 10n) + Number(b.n % 10n)) >= 10) put('part', () => Q.sub(A, Q(10)), '忘了进位');
      }
      if (Q.eq(Q.sub(a, b), A) && Q.cmp(a, b) > 0) {
        put('rev', () => Q.add(a, b), '把减法算成了加法');
        if (Q.isInt(a) && Q.isInt(b) && Number(a.n % 10n) < Number(b.n % 10n)) put('part', () => Q.add(A, Q(10)), '忘了退位');
      }
      if (i < j && Q.eq(Q.mul(a, b), A)) { put('rev', () => Q.add(a, b), '把乘法算成了加法'); put('rev', () => Q.div(a, b), '把乘法算成了除法'); }
      if (!Q.eq(b, Z) && Q.eq(Q.div(a, b), A)) { put('rev', () => Q.mul(a, b), '把除法算成了乘法'); put('rev', () => Q.sub(a, b), '把除法算成了减法'); }
    }
    if (!int && !dec && A.n !== 0n) put('rev', () => Q.div(Q(1), A), '分子分母倒过来了');
    if (!int && !dec) put('part', () => Q(1n, A.d), '只数了一份');
    if (int && A.n % 2n === 0n && Q.cmp(Q.abs(A), Q(4)) >= 0) put('part', () => Q.div(A, Q(2)), '只算了一半');
    const unit = dec ? Q(1n, 10n ** BigInt(dec)) : int ? Q(1) : Q(1n, A.d);
    put('one', () => Q.add(A, unit), '多数了一个'); put('one', () => Q.sub(A, unit), '少数了一个');
    put('dbl', () => Q.mul(A, Q(2)), '多算了一倍');
    const seen = new Set([Q.show(A)]), out = [];
    const take = (c) => { if (out.length < 3 && c && !seen.has(Q.show(c.x))) { seen.add(Q.show(c.x)); out.push(c); return true; } return false; };
    // 轮流从每种错法里拿一个，免得三个干扰项都是同一种错
    for (let round = 0; round < 4 && out.length < 3; round++) for (const k of ['rev', 'part', 'one', 'dbl']) { while (C[k].length && !take(C[k].shift())) { /* 跳过重复的 */ } }
    for (const k of [2, 3, 4, 5, 6, 10, 20]) { if (out.length >= 3) break; put('dbl', () => Q.add(A, Q.mul(unit, Q(k))), '差得多一点'); put('dbl', () => Q.sub(A, Q.mul(unit, Q(k))), '差得多一点'); while (C.dbl.length) take(C.dbl.shift()); }
    return out;
  }
  function fmt(x, raw) {
    const dec = (/\.(\d+)/.exec(raw) || [, ''])[1].length;
    return dec ? String(+U.Q.num(x).toFixed(dec)) : U.Q.show(x);
  }
  U.Predict.auto = function (p) {
    if (!p || typeof p !== 'object' || p.predict) return null;
    if (autoCache.has(p)) return autoCache.get(p);
    let pr = null;
    const bs = benchScene(p), t = bs && !hasRecorder(bs) && findTarget(p, bs.ents);
    if (t && t.word) {
      pr = { form: 'pick', q: t.q, options: t.options.map((w) => ({ v: w, label: w })), answer: t.answer, auto: true, word: true, ms: t.m.id, wrong: t.wrong, hidden: null };
      if (t.neg !== undefined) pr.neg = t.neg;
    } else if (t) {
      const A = toQ(t.ans), givens = numsIn((p.title || '') + ' ' + (p.hook || '')).map((x) => x.replace('−', '-'));
      const ds = distractors(A, t.raw, givens);
      if (ds.length === 3) {
        const opts = [{ x: A, why: null }].concat(ds).sort((a, b) => U.Q.cmp(a.x, b.x));
        const h = hideNum(t.m.say, t.ans), hid = h ? h.s : null;
        const q = '动手之前先猜：' + (hid || p.title);
        const wrong = {}; ds.forEach((d) => { wrong[U.Q.show(d.x)] = d.why; });
        pr = { form: 'pick', q, options: opts.map((o) => ({ v: U.Q.show(o.x), label: fmt(o.x, t.raw) })), answer: t.ans, auto: true, ms: t.m.id, wrong, hidden: hid };
      }
    }
    if (pr) { const o = pr.options.find((x) => x.v === pr.answer), al = o ? o.label : pr.answer; pr.reveal = () => ({ v: pr.answer, label: al }); }
    autoCache.set(p, pr);
    return pr;
  };
  // 操作台题里出不了自动先猜的，说清为什么（测试用：每道操作台题要么有先猜，要么有这里的理由）
  U.Predict.exempt = function (p) {
    if (!p || p.predict || U.Predict.auto(p)) return null;
    const bs = benchScene(p); if (!bs) return null;
    if (hasRecorder(bs)) return '台面上开了记录仪（js/core/recorder.js）：每记一个点前都有记录仪自己的先猜';
    if (!/[？?]/.test(String(p.title || ''))) return '照着做：要做到的东西题目里已经给了，没有可猜的数';
    if (p.level === 'trap' || /-trap$/.test(p.id)) return '陷阱题：里程碑说的是改对以后的样子，和标题问的情形相反，不自动出';
    return '答案不是一个数，也不是两选一（比如方向、推理、作图），要出题人自己写';
  };
  // 这道题用的先猜：题目自己写的优先，没写才自动出
  U.Predict.of = (p) => (p && p.predict) || U.Predict.auto(p);
  // 自动先猜的答案来自的那个里程碑，做到以前步骤栏里把答案换成“？”（免得先猜时一眼看到答案）
  U.Predict.hideSay = (pr, m) => (pr && pr.auto && m && m.id === pr.ms && !m.ask ? pr.hidden : null);
  // 猜的和答案比：对没对、差多少（和器材的 guess 事件一样，猜错不扣分，只记差多少）
  U.Predict.gap = function (pr, v) {
    const a = toQ(pr.answer), g = toQ(v);
    if (!a || !g) return { right: String(v) === String(pr.answer), gap: null };
    return { right: U.Q.eq(a, g), gap: +Math.abs(U.Q.num(U.Q.sub(g, a))).toFixed(6) };
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
