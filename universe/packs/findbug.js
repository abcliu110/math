/* 器材包 findbug：找错台（docs/new-instruments.md 4.2）。给一份完整的解题过程，其中一步是错的（或整份都对）：
 *  先判断（整份都对 / 有错），再点出错的那一行，选“它违反了什么”，最后把这一行改对。
 * 点错了不扣分：系统把那一步重新算给你看（“这一步没变”）；选错理由，代进去给你看两行不相等。
 * 错例库（U.BugLib）里每一条都由内核验证：错的那一步确实不成立，其余的步骤确实成立（tests/run.js 的 lint）。
 * 步骤是式子（可以含 x）或一元一次方程；“成立”= 前后两行的值处处相等 / 解相同（精确分数计算）。
 * 与设计稿的差别：第一版放在关系画布上用属性面板操作（还没有单独的工作台界面）；错例库在本包里，没有拆成 js/core/buglib.js。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, P = U.Poly;
  const num = (n) => U.val('num', Q(n), { dim: null });

  // ---- 检查两行是否等价（纯计算）----
  const norm = (s) => String(s).replace(/[×·]/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-').replace(/＝/g, '=').replace(/\s+/g, '');
  const XS = [-2, -1, 0, 1, 2, 3, 5];
  const evalAt = (src, x) => P.evalQ(P.parse(src), { x: Q(x) });
  // 方程的解：f(x) = 左 − 右 是一次式；返回 { root: Q } | { all: true } | { none: true }
  function solveEq(line) {
    const parts = norm(line).split('=');
    if (parts.length !== 2 || !parts[0] || !parts[1]) throw new Error('方程要写成“左边 = 右边”');
    const f = (x) => Q.sub(evalAt(parts[0], x), evalAt(parts[1], x));
    const b = f(0), a = Q.sub(f(1), b);
    if (Q.eq(f(2), Q.add(b, Q.mul(a, Q(2)))) === false) throw new Error('只支持一次方程');
    if (Q.cmp(a, Q(0)) === 0) return Q.cmp(b, Q(0)) === 0 ? { all: true } : { none: true };
    return { root: Q.div(Q.sub(Q(0), b), a) };
  }
  const sameSol = (u, v) => (u.all ? !!v.all : u.none ? !!v.none : !!v.root && Q.eq(u.root, v.root));
  const showSol = (u) => (u.all ? '所有 x 都是解' : u.none ? '没有解' : 'x = ' + Q.show(u.root));
  const isEq = (line) => norm(line).includes('=');
  // 后一行能不能由前一行得到：同为等式比较解，同为式子比较处处的值
  function valid(prev, next) {
    try {
      if (isEq(prev) !== isEq(next)) return { ok: false, why: '一行是方程，一行不是' };
      if (isEq(prev)) { const a = solveEq(prev), b = solveEq(next); return { ok: sameSol(a, b), a: showSol(a), b: showSol(b), eq: true }; }
      const p = norm(prev), n = norm(next);
      for (const x of XS) if (!Q.eq(evalAt(p, x), evalAt(n, x))) return { ok: false, a: Q.show(evalAt(p, x)), b: Q.show(evalAt(n, x)), x: /x/.test(p + n) ? x : null };
      return { ok: true, a: Q.show(evalAt(p, 2)), x: /x/.test(p + n) ? 2 : null };
    } catch (e) { return { ok: false, why: e.message }; }
  }

  // ---- 错例库：lines 是每一行；bugAt 是错的那一行（第几行，从 2 起；0 = 整份都对）；reasons 里 reason 是正确理由的下标 ----
  const CASES = [
    { id: 'fb-dist', title: '运算律：25×(4+8)', grade: 4, lines: ['25×(4+8)', '25×4+8', '100+8', '108'], bugAt: 2, reason: 0,
      reasons: ['乘法分配律：括号里每一项都要乘', '加法交换律用错了', '要先算乘法再算加法', '括号可以直接去掉'] },
    { id: 'fb-frac-add', title: '分数加法：1/2+1/3', grade: 5, lines: ['1/2+1/3', '(1+1)/(2+3)', '2/5'], bugAt: 2, reason: 1,
      reasons: ['分子分母各自相乘', '分母不同不能直接相加，要先通分', '分数加法只加分子', '要把分数化成小数'] },
    { id: 'fb-order', title: '混合运算：12−2×(3+1)', grade: 4, lines: ['12−2×(3+1)', '10×(3+1)', '40'], bugAt: 2, reason: 2,
      reasons: ['括号里的要先算', '减法不能和乘法一起算', '乘除要先于加减：不能先算 12−2', '12 要先拆开'] },
    { id: 'fb-eq-move', title: '解方程：3x+5=20', grade: 7, lines: ['3x+5=20', '3x=25', 'x=25/3'], bugAt: 2, reason: 0,
      reasons: ['移项要变号：+5 移到右边变成 −5', '两边要乘同一个数', '5 和 20 不能相减', '等号两边要交换'] },
    { id: 'fb-eq-paren', title: '解方程：2(x−3)=10', grade: 7, lines: ['2(x−3)=10', '2x−3=10', '2x=13', 'x=13/2'], bugAt: 2, reason: 3,
      reasons: ['移项要变号', '两边要除以同一个数', '括号可以直接去掉', '去括号时，括号外的数要乘括号里的每一项'] },
    { id: 'fb-square', title: '乘法公式：(x+3)²', grade: 8, lines: ['(x+3)^2', 'x^2+3^2', 'x^2+9'], bugAt: 2, reason: 1,
      reasons: ['平方就是乘以 2', '(a+b)² 不等于 a²+b²：漏了中间的 2ab', '要先把 3 平方', 'x 的平方不能写成 x^2'] },
    { id: 'fb-ok-eq', title: '解方程：2x−3=7（整份都对吗？）', grade: 7, lines: ['2x−3=7', '2x=7+3', '2x=10', 'x=5'], bugAt: 0, reason: 0,
      reasons: ['没有错：每一步都成立', '', '', ''] },
    { id: 'fb-ok-expr', title: '运算律：3×(10−1)（整份都对吗？）', grade: 4, lines: ['3×(10−1)', '3×10−3×1', '30−3', '27'], bugAt: 0, reason: 0,
      reasons: ['没有错：每一步都成立', '', '', ''] },
    { id: 'fb-neg', title: '负数：−3−(−2)', grade: 7, lines: ['−3−(−2)', '−3−2', '−5'], bugAt: 2, reason: 0,
      reasons: ['减去一个负数，等于加上它的相反数', '负号可以直接去掉', '先算括号外面的减号', '−3 要变成 3'] },
    { id: 'fb-div-frac', title: '分数除法：(2/3)÷(4/5)', grade: 6, lines: ['(2/3)÷(4/5)', '(2/3)×(4/5)', '8/15'], bugAt: 2, reason: 2,
      reasons: ['除号可以直接换成乘号', '分子分母要交换', '除以一个数，等于乘它的倒数：除数要倒过来', '要先通分'] },
    { id: 'fb-sub-frac', title: '分数减法：3/4−1/2', grade: 5, lines: ['3/4−1/2', '(3−1)/(4−2)', '2/2', '1'], bugAt: 2, reason: 1,
      reasons: ['分子相减，分母相乘', '分母不同不能直接相减，要先通分', '减法要变成加法', '分数不能相减'] },
    { id: 'fb-ltr', title: '同级运算：8÷2×4', grade: 4, lines: ['8÷2×4', '8÷8', '1'], bugAt: 2, reason: 0,
      reasons: ['乘除同级，要从左往右算：先 8÷2', '乘法要先于除法', '括号可以随便加', '除号后面的要先算'] },
    { id: 'fb-eq-div', title: '解方程：4x=12', grade: 7, lines: ['4x=12', 'x=12×4', 'x=48'], bugAt: 2, reason: 1,
      reasons: ['两边要加上同一个数', '要把 x 前面的 4 化成 1：两边同除以 4，不是乘 4', '4x 就是 4+x', '等号两边要交换'] },
    { id: 'fb-eq-neg', title: '解方程：−2x=8', grade: 7, lines: ['−2x=8', 'x=8÷2', 'x=4'], bugAt: 2, reason: 0,
      reasons: ['−2 也要除过去：两边同除以 −2，符号会变', '要两边同时乘 2', '负号可以丢掉', '8 要移到左边'] },
    { id: 'fb-eq-both', title: '解方程：2x+3=x+7', grade: 7, lines: ['2x+3=x+7', '2x−x=7+3', 'x=10'], bugAt: 2, reason: 0,
      reasons: ['移项要变号：+3 移到右边变成 −3', '含 x 的项不能移', '要先去分母', '两边都要乘 2'] },
    { id: 'fb-combine', title: '合并同类项：3x+2x', grade: 7, lines: ['3x+2x', '5x^2', '5x^2'], bugAt: 2, reason: 3,
      reasons: ['同类项相乘', '要先去括号', 'x 不能合并', '合并同类项只把系数相加，x 的指数不变'] },
    { id: 'fb-sq2', title: '完全平方：(x−1)²', grade: 8, lines: ['(x−1)^2', 'x^2−1', 'x^2−1'], bugAt: 2, reason: 1,
      reasons: ['平方就是乘以 2', '(a−b)² 不等于 a²−b²：漏了中间的 −2ab', '1 的平方是 1', '括号里的减号要变成加号'] },
    { id: 'fb-ok-frac', title: '分数加法：1/2+1/3（整份都对吗？）', grade: 5, lines: ['1/2+1/3', '3/6+2/6', '5/6'], bugAt: 0, reason: 0,
      reasons: ['没有错：每一步都成立', '', '', ''] },
    { id: 'fb-ok-factor', title: '乘法公式：(x+2)(x−2)（整份都对吗？）', grade: 8, lines: ['(x+2)(x−2)', 'x^2−2x+2x−4', 'x^2−4'], bugAt: 0, reason: 0,
      reasons: ['没有错：每一步都成立', '', '', ''] },
  ];
  // 错例库自检：错的那一步不成立，其余的步骤都成立；返回错误列表
  function lintCase(C) {
    const errs = [];
    if (C.lines.length < 3 || C.lines.length > 7) errs.push(C.id + '：步数要在 3 到 7 之间');
    if (C.reasons.length !== 4) errs.push(C.id + '：理由要有 4 个');
    for (let i = 1; i < C.lines.length; i++) {
      const r = valid(C.lines[i - 1], C.lines[i]), shouldBeBad = C.bugAt === i + 1;
      if (r.ok === shouldBeBad) errs.push(C.id + '：第 ' + (i + 1) + ' 行' + (shouldBeBad ? ' 应该是错的，但它成立' : ' 应该是对的，但它不成立') + (r.why ? '（' + r.why + '）' : ''));
    }
    return errs;
  }
  U.BugLib = { CASES, valid, lintCase, norm };

  const caseOf = (p) => CASES[p.caseId] || CASES[0];
  const claimOk = (p) => p.claim !== 0 && ((p.claim === 2) === (caseOf(p).bugAt > 0));
  function judge(p) {
    const C = caseOf(p), r = { found: 0, reasonOk: 0, fixed: 0, claimOk: claimOk(p) ? 1 : 0, msg: null };
    if (C.bugAt === 0) {
      r.found = p.claim === 1 ? 1 : 0;
      if (p.pick > 0 && p.pick <= C.lines.length) { const v = p.pick >= 2 ? valid(C.lines[p.pick - 2], C.lines[p.pick - 1]) : null; r.msg = v ? '第 ' + p.pick + ' 行没有错：' + explain(v) : '第 1 行是题目'; }
      return r;
    }
    if (p.pick >= 2 && p.pick <= C.lines.length) {
      const v = valid(C.lines[p.pick - 2], C.lines[p.pick - 1]);
      if (p.pick === C.bugAt) r.found = 1; else r.msg = '第 ' + p.pick + ' 行没有错：' + explain(v);
    } else if (p.pick === 1) r.msg = '第 1 行是题目，不是解题的一步';
    if (r.found && p.reason > 0) { if (p.reason - 1 === C.reason) r.reasonOk = 1; else { const v = valid(C.lines[C.bugAt - 2], C.lines[C.bugAt - 1]); r.msg = '再想想：' + explain(v, true); } }
    if (r.found && String(p.fix || '').trim()) { const v = valid(C.lines[C.bugAt - 2], p.fix); if (v.ok && !valid(C.lines[C.bugAt - 1], p.fix).ok) r.fixed = 1; else if (!v.ok) r.msg = '你改的这一行和上一行不相等：' + explain(v, true); }
    return r;
  }
  function explain(v, bad) {
    if (v.why) return v.why;
    if (v.eq) return bad ? '上一行的解是 ' + v.a + '，这一行的解是 ' + v.b : '前后两行的解都是 ' + v.a;
    const at = v.x !== null && v.x !== undefined ? '代入 x = ' + v.x + '，' : '';
    return bad ? at + '上一行是 ' + v.a + '，这一行是 ' + v.b + '，不相等' : at + '前后两行都是 ' + v.a + '，没有变';
  }

  U.registerPack({
    id: 'findbug', version: 1,
    types: {
      findbug: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E4', 'E9'],
        label: '找错台', prefix: '错', group: '关系', grades: [3, 9], alias: ['找错', '改错', '哪一步错了', '检查解答', '错在哪里'],
        props: {
          caseId: { type: 'choice', label: '哪份解答', default: 0, choices: CASES.map((c) => c.title) },
          claim: { type: 'choice', label: '先判断', default: 0, choices: ['还没判断', '整份都对', '有错'] },
          pick: { type: 'int', label: '错在第几行（0 = 还没选）', default: 0, min: 0, max: 7 },
          reason: { type: 'int', label: '理由是第几个（0 = 还没选）', default: 0, min: 0, max: 4 },
          fix: { type: 'text', label: '把这一行改对', default: '' },
        },
        // 先猜后看：先判断“整份都对 / 有错”；判断以后才显示读数。猜的结果记进 guess 事件（right = 判断对了没有）
        guess: { props: ['claim', 'caseId'], ports: ['found', 'reasonOk', 'fixed'], answered: (p) => p.claim !== 0, score: (o) => (o.claimOk ? { right: Q.num(o.claimOk.data) === 1, gap: Q.num(o.claimOk.data) === 1 ? 0 : 1 } : null) },
        outputs: {
          found: { dim: null, kind: 'num', label: '找到了（1/0）' }, reasonOk: { dim: null, kind: 'num', label: '理由对（1/0）' },
          fixed: { dim: null, kind: 'num', label: '改对了（1/0）' }, claimOk: { dim: null, kind: 'num', label: '判断对了（1/0）' },
        },
        icon: () => K.text(32, 30, '✕?', { size: 22, weight: 700, fill: 'var(--bad)' }),
        size: (ent) => [380, 205 + 24 * caseOf((ent && ent.props) || { caseId: 0 }).lines.length],
        compute: (c) => {
          const p = c.props, C = caseOf(p), r = judge(p);
          const o = { found: num(r.found), reasonOk: num(r.reasonOk), fixed: num(r.fixed), claimOk: num(r.claimOk) };
          if (p.claim === 0) c.say('info', '先判断：这份解答整份都对，还是有错？（猜错不扣分）');
          else if (r.msg) c.say('info', r.msg);
          else if (C.bugAt === 0) c.say(r.found ? 'ok' : 'info', r.found ? '对：每一步都成立。敢说“没有错”，也是本事' : '再检查每一行：真的有错吗？');
          else if (!r.found) c.say('info', p.pick ? '再找找' : (p.claim === 1 ? '再检查每一行：有的行前后不相等' : '点出错的那一行（写“错在第几行”）'));
          else if (!r.reasonOk) c.say('ok', '找到了：第 ' + C.bugAt + ' 行。再选它违反了什么（理由第几个）');
          else if (!r.fixed) c.say('ok', '理由对。把第 ' + C.bugAt + ' 行改对，写在“把这一行改对”里');
          else c.say('ok', '全对：找到、说清、改对');
          return o;
        },
        badge: (c) => (c.masked ? '？' : (c.out.found && Q.num(c.out.found.data) ? '找到' : '')),
        // 可点的区域：每一行（点一下选“错在这一行”，再点取消）、两个判断按钮、四个理由。用 data-pick-k / data-pick-v 告诉台面“点了就设哪个属性”
        draw: (c) => {
          const p = c.props, C = caseOf(p), r = judge(p), W = c.w;
          // 点击区域放在最上面（透明的矩形），这样点在文字上也算；底色另画在文字下面
          const H = [];
          const hit = (x, y, w, h, k, v, fill) => { if (fill && fill !== 'transparent') s += K.rect(x, y, w, h, { fill, r: 5 }); H.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="5" fill="transparent" data-pick-k="' + k + '" data-pick-v="' + v + '" style="cursor:pointer"/>'); };
          let s = K.text(W / 2, 18, C.title, { size: 13, weight: 700 });
          C.lines.forEach((ln, i) => {
            const y = 44 + i * 24, pick = p.pick === i + 1, bug = pick && r.found && C.bugAt === i + 1;
            const col = bug ? 'var(--bad)' : (pick && i >= 1 ? 'var(--good)' : 'var(--ink)');
            if (i >= 1) hit(6, y - 17, W - 12, 22, 'pick', pick ? 0 : i + 1, pick ? 'var(--sel-bg)' : 'transparent');
            s += K.text(14, y, String(i + 1) + '.', { size: 12, fill: 'var(--dim)', anchor: 'start' }) + K.text(34, y, ln, { size: 15, anchor: 'start', fill: col, weight: pick ? 700 : 400 });
            if (bug) s += K.text(W - 12, y, '✗ 错在这里', { size: 12, anchor: 'end', fill: 'var(--bad)', weight: 700 });
            else if (pick && i >= 1) s += K.text(W - 12, y, '✓ 这步没问题', { size: 12, anchor: 'end', fill: 'var(--good)' });
          });
          let y = 44 + C.lines.length * 24 + 4;
          // 判断按钮：先判断，再找（整份都对 / 有错）
          [[1, '整份都对'], [2, '有错']].forEach(([v, t], i) => {
            const x = 14 + i * 104, on = p.claim === v;
            hit(x, y, 96, 24, 'claim', v, on ? 'var(--accent)' : 'var(--sel-bg)'); s += K.text(x + 48, y + 17, t, { size: 13, weight: 700, fill: on ? '#fff' : 'var(--ink)' });
          });
          y += 34;
          if (p.claim === 0) return s + K.text(14, y + 6, '先判断：整份都对，还是有错？点上面的按钮', { size: 12, fill: 'var(--accent)', anchor: 'start' }) + H.join('');
          if (r.found && C.bugAt > 0) {
            s += K.text(14, y + 4, '它违反了什么？点一个理由', { size: 11, fill: 'var(--dim)', anchor: 'start' });
            C.reasons.forEach((t, i) => {
              const on = p.reason === i + 1, col = on ? (r.reasonOk ? 'var(--good)' : 'var(--bad)') : 'var(--ink)';
              hit(6, y + 10 + i * 20, W - 12, 19, 'reason', on ? 0 : i + 1, on ? 'var(--sel-bg)' : 'transparent'); s += K.text(14, y + 24 + i * 20, (i + 1) + ') ' + t, { size: 11, anchor: 'start', fill: col, weight: on ? 700 : 400 });
            });
            if (r.reasonOk) s += K.text(14, y + 24 + 4 * 20 + 6, r.fixed ? '✓ 改对了' : '把这一行改对：在属性面板的“把这一行改对”里写', { size: 11, anchor: 'start', fill: r.fixed ? 'var(--good)' : 'var(--accent)' });
          } else if (C.bugAt === 0 && r.found) s += K.text(14, y + 6, '✓ 每一步都成立：没有错', { size: 13, fill: 'var(--good)', weight: 700, anchor: 'start' });
          else if (!r.found) s += K.text(14, y + 6, C.bugAt === 0 ? '再检查每一行：真的有错吗？' : '点出错的那一行', { size: 12, fill: 'var(--accent)', anchor: 'start' });
          return s + H.join('');
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
