/* 器材包 seqtools：数列、符号数、符号点的“出口”。让这些值能继续往下接，不再是死胡同。
 *   数列统计（seqstat）：一串数 → 个数、和、平均数、中位数、众数、最大、最小、极差、方差、标准差、第 n 项。
 *   数列变换（seqmap）：对数列的每一项套一个式子（比如 2x + 1、x^2），得到新的数列。
 *   符号数读数（realread）：把 √2、2 + √3、π 这类精确的数读成近似小数，同时保留精确写法。
 *   符号点读数（spread）：把抛物线顶点这类符号点拆成 x、y 两个符号数。
 * 数列还能直接接数据表的口（变成“序号、值”两列）和统计量的口（整数时变成分布）：转换写在 js/core/convert.js。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, P = U.Poly;

  const WANT = ['个数', '和', '平均数', '中位数', '众数', '最大', '最小', '极差', '方差', '标准差', '第 n 项'];
  const sorted = (xs) => xs.slice().sort((a, b) => Q.cmp(a, b));
  const sum = (xs) => xs.reduce((s, x) => Q.add(s, x), Q(0));

  // 数列统计的核心：返回 { v: 有理数, exact: 是否精确 } 或 { err: 原因 }
  const stat = (xs, want, n) => {
    const m = xs.length;
    if (!m && want !== 0) return { err: '数列是空的' };
    switch (want) {
      case 0: return { v: Q(m) };
      case 1: return { v: sum(xs) };
      case 2: return { v: Q.div(sum(xs), Q(m)) };
      case 3: { const s = sorted(xs); return { v: m % 2 ? s[(m - 1) / 2] : Q.div(Q.add(s[m / 2 - 1], s[m / 2]), Q(2)) }; }
      case 4: {
        const s = sorted(xs); let best = null, bc = 0, i = 0;
        while (i < m) { let j = i; while (j < m && Q.eq(s[j], s[i])) j++; if (j - i > bc) { bc = j - i; best = s[i]; } i = j; }
        return { v: best };
      }
      case 5: return { v: sorted(xs)[m - 1] };
      case 6: return { v: sorted(xs)[0] };
      case 7: { const s = sorted(xs); return { v: Q.sub(s[m - 1], s[0]) }; }
      case 8: case 9: {
        const mean = Q.div(sum(xs), Q(m));
        const v = Q.div(sum(xs.map((x) => Q.mul(Q.sub(x, mean), Q.sub(x, mean)))), Q(m));   // 总体方差：各数与平均数之差的平方的平均
        if (want === 8) return { v };
        const f = Math.sqrt(Q.num(v));
        return { v: Q.fromNumber(Math.round(f * 1e6) / 1e6), exact: Q.isInt(v) && Number.isInteger(f) ? undefined : false };
      }
      default: {
        if (n < 1 || n > m) return { err: '数列只有 ' + m + ' 项，没有第 ' + n + ' 项' };
        return { v: xs[n - 1] };
      }
    }
  };

  const realApprox = (r) => Math.round(U.Real.approx(r) * 1e4) / 1e4;

  U.registerPack({
    id: 'seqtools', version: 1, needs: ['core@1', 'algebra@1'],
    types: {
      seqstat: {
        workspaceRole: 'none', handles: true, essence: ['E8', 'E11'],
        label: '数列统计', prefix: '统', group: '统计与概率', grades: [4, 9], alias: ['平均数', '中位数', '众数', '方差', '标准差', '极差', '求和', '个数', '第n项', '统计量'],
        props: {
          want: { type: 'choice', label: '求什么', default: 2, choices: WANT },
          n: { type: 'int', label: '第几项（求“第 n 项”时用）', default: 1, min: 1, max: 100000 },
          label: { type: 'text', label: '标签', default: '' },
        },
        inputs: { s: { kind: 'seq', label: '数列' } },
        outputs: { v: { dim: null, kind: 'num', label: '结果' } },
        icon: () => K.text(32, 24, 'x̄', { size: 22, weight: 700 }) + K.line(10, 34, 54, 34, { w: 2 }) + K.text(32, 48, '∑', { size: 14 }),
        size: () => [170, 110],
        compute: (c) => {
          const s = K.first(c.inp.s);
          if (!s) { c.say('info', '接一个数列'); return {}; }
          const r = stat(s.data, c.props.want, c.props.n);
          if (r.err) { c.say('info', r.err); return {}; }
          return { v: U.val('num', r.v, r.exact === false ? { exact: false } : {}) };
        },
        badge: (c) => (c.out.v ? WANT[c.props.want] + ' ' + U.showVal(c.out.v) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 8, c.out.v ? U.showVal(c.out.v) : '—', { size: 26, weight: 700, fill: c.out.v ? 'var(--ink)' : 'var(--dim)' }) +
          K.text(c.w / 2, c.h - 14, WANT[c.props.want], { size: 12, fill: 'var(--dim)' }),
      },

      seqmap: {
        workspaceRole: 'none', handles: true, essence: ['E4', 'E8'],
        label: '数列变换', prefix: '变', group: '数与运算', grades: [5, 9], alias: ['数列', '每一项', '映射', '套公式', '通项'],
        lint: { minProps: 2, why: '数列变换只有“式子”和标签两个属性' },
        props: {
          f: { type: 'text', label: '每一项 x 变成', default: '2x + 1' },
          label: { type: 'text', label: '标签', default: '' },
        },
        inputs: { s: { kind: 'seq', label: '数列' } },
        outputs: { s: { dim: null, kind: 'seq', label: '新数列' } },
        icon: () => K.text(32, 22, 'f(x)', { size: 16, weight: 700 }) + [14, 26, 38, 50].map((x) => K.circle(x, 40, 3, { fill: 'var(--accent)' })).join(''),
        size: () => [190, 100],
        compute: (c) => {
          const s = K.first(c.inp.s);
          if (!s) { c.say('info', '接一个数列'); return {}; }
          let p; try { p = P.parse(String(c.props.f)); } catch (e) { c.say('info', '式子写不对：' + e.message); return {}; }
          const vs = P.vars(p);
          if (vs.length > 1) { c.say('info', '式子里只能有一个字母（代表数列的每一项），现在有：' + vs.join('、')); return {}; }
          const v = vs[0] || 'x';
          return { s: U.val('seq', s.data.map((x) => P.evalQ(p, { [v]: x }))) };
        },
        badge: (c) => (c.out.s ? c.out.s.data.length + ' 项' : ''),
        draw: (c) => {
          const s = c.out.s ? c.out.s.data : null;
          const head = s ? s.slice(0, 5).map((x) => Q.showDec(x, 2)).join('，') + (s.length > 5 ? '，…' : '') : '—';
          return K.text(c.w / 2, c.h / 2 + 2, 'x → ' + c.props.f, { size: 15, weight: 700 }) + K.text(c.w / 2, c.h - 16, head, { size: 12, fill: 'var(--dim)' });
        },
      },

      realread: {
        workspaceRole: 'none', handles: true, essence: ['E1'],
        label: '符号数读数', prefix: '读', group: '数与运算', grades: [8, 9], alias: ['根号', '无理数', '近似值', '精确值', 'π'],
        lint: { minProps: 2, why: '符号数读数只有“保留小数”和标签两个属性' },
        props: { digits: { type: 'int', label: '保留小数', default: 4, min: 0, max: 8 }, label: { type: 'text', label: '标签', default: '' } },
        inputs: { r: { kind: 'real', label: '符号数' } },
        outputs: { v: { dim: null, kind: 'num', label: '近似值' } },
        icon: () => K.text(32, 30, '√', { size: 28, weight: 700 }) + K.text(46, 42, '≈', { size: 14 }),
        size: () => [190, 110],
        compute: (c) => {
          const r = K.first(c.inp.r);
          if (!r) { c.say('info', '接一个符号数（根号、π 这类精确的数）'); return {}; }
          const exactQ = r.data.b.n === 0n && r.data.p.n === 0n;
          if (exactQ) return { v: U.val('num', r.data.a) };
          const f = 10 ** c.props.digits;
          return { v: U.val('num', Q.fromNumber(Math.round(U.Real.approx(r.data) * f) / f), { exact: false }) };
        },
        badge: (c) => (c.out.v ? U.showVal(c.out.v) : ''),
        draw: (c) => {
          const r = K.first(c.d.inp.r);
          return K.text(c.w / 2, c.h / 2 - 4, r ? U.Real.show(r.data) : '—', { size: 20, weight: 700 }) +
            K.text(c.w / 2, c.h / 2 + 24, c.out.v ? U.showVal(c.out.v) : '', { size: 16, fill: 'var(--dim)' });
        },
      },

      spread: {
        workspaceRole: 'none', handles: true, essence: ['E2'],
        label: '符号点读数', prefix: '点', group: '图形', grades: [8, 9], alias: ['顶点', '坐标', '拆开', '横坐标', '纵坐标'],
        lint: { minProps: 1, why: '符号点读数只有标签一个属性' },
        props: { label: { type: 'text', label: '标签', default: '' } },
        inputs: { p: { kind: 'spoint', label: '点' } },
        outputs: { x: { dim: null, kind: 'real', label: 'x 坐标' }, y: { dim: null, kind: 'real', label: 'y 坐标' } },
        icon: () => K.circle(32, 28, 4, { fill: 'var(--accent)' }) + K.text(32, 46, '(x, y)', { size: 12 }),
        size: () => [180, 100],
        compute: (c) => {
          const p = K.first(c.inp.p);
          if (!p) { c.say('info', '接一个点（比如抛物线的顶点）'); return {}; }
          const ex = p.exact === false ? { exact: false } : {};
          return { x: U.val('real', p.data.x, ex), y: U.val('real', p.data.y, ex) };
        },
        badge: (c) => (c.out.x ? '(' + U.showVal(c.out.x) + ', ' + U.showVal(c.out.y) + ')' : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.out.x ? '(' + U.showVal(c.out.x) + ', ' + U.showVal(c.out.y) + ')' : '—', { size: 18, weight: 700 }),
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
