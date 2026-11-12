/* 器材包 iterate：递推与迭代。一项一项往下算，把整串结果交出来（数列），能接数列统计、数列变换、取值表、拟合。
 *   迭代器（iterate）：从起点开始，每一步把上一项代进一个式子 x → f(x)，例如 x/2 + 1、3x + 1、x² − 2。
 *   二阶递推（recur2）：下一项 = a·前一项 + b·前两项 + c，斐波那契数列就是 a = b = 1、c = 0。
 *   通项（seqform）：给一个关于 n 的式子，n 从几到几，得到数列，例如 2n − 1（奇数）、n²（平方数）。
 * 数是精确的有理数；数太长（分子分母超过 40 位）时改用 12 位小数的近似，整串标近似；越算越大（超过 10^100）时停下来并说明。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, P = U.Poly;
  const MAXN = 200, BIG = 40, ROUND = 1e12;

  const roundQ = (q) => { const f = Q.num(q); return Number.isFinite(f) ? Q.fromNumber(Math.round(f * ROUND) / ROUND) : null; };
  const tooLong = (q) => q.n.toString().length > BIG || q.d.toString().length > BIG;
  const parseQ = (v) => Q.parse(String(v));

  // 一项一项算：next(history) 返回下一项（有理数）。返回 { xs, approx, stopped }
  const run = (first, count, next) => {
    const xs = first.slice(); let approx = false, stopped = '';
    while (xs.length < count) {
      let nx = next(xs);
      if (approx || tooLong(nx)) { approx = true; nx = roundQ(nx); if (nx === null) { stopped = '数增长太快'; break; } }
      if (Math.abs(Q.num(nx)) > 1e100) { xs.push(nx); stopped = '越来越大（超过 10^100），停在这里'; break; }
      xs.push(nx);
    }
    return { xs, approx, stopped };
  };
  const pic = (s, c) => {   // 数列折线：横轴是第几项，纵轴是值
    const xs = s.map((q) => Q.num(q)).filter(Number.isFinite);
    if (!xs.length) return '';
    const L = 14, R = c.w - 104, T = c.h - 62, B = c.h - 14;   // 右边留给输出口的标签
    let lo = Math.min(...xs), hi = Math.max(...xs); if (hi === lo) { hi += 1; lo -= 1; }
    const sx = (i) => L + (xs.length === 1 ? 0.5 : i / (xs.length - 1)) * (R - L), sy = (v) => B - (v - lo) / (hi - lo) * (B - T);
    let out = K.line(L, B, R, B, { w: 1, stroke: 'var(--dim)' });
    let d = ''; xs.forEach((v, i) => { d += (i ? 'L' : 'M') + sx(i).toFixed(1) + ' ' + sy(v).toFixed(1); });
    out += '<path d="' + d + '" fill="none" stroke="var(--accent)" stroke-width="1.5"/>';
    if (xs.length <= 40) xs.forEach((v, i) => { out += K.circle(sx(i), sy(v), 2.5, { fill: 'var(--accent)' }); });
    return out;
  };
  const headText = (s) => (s ? s.slice(0, 6).map((q) => Q.showDec(q, 3)).join('，') + (s.length > 6 ? '，…' : '') : '');
  const outs = (r, extra) => {
    const ex = r.approx ? { exact: false } : {};
    const last = r.xs[r.xs.length - 1], prev = r.xs.length > 1 ? r.xs[r.xs.length - 2] : null;
    return Object.assign({ s: U.val('seq', r.xs, ex), last: U.val('num', last, ex) }, prev ? { diff: U.val('num', Q.sub(last, prev), ex) } : {}, extra || {});
  };
  const note = (c, r, what) => c.say(r.stopped ? 'info' : 'ok', what + (r.approx ? '（数太长，改用近似）' : '') + (r.stopped ? '；' + r.stopped : ''));

  U.registerPack({
    id: 'iterate', version: 1, needs: ['core@1', 'algebra@1'],
    types: {
      iterate: {
        workspaceRole: 'none', handles: true, essence: ['E6', 'E8'],
        label: '迭代器', prefix: '迭', group: '时间与变化', grades: [6, 9], alias: ['递推', '迭代', '数列', '重复代入', '逼近', '不动点', 'x→f(x)'],
        props: {
          start: { type: 'rat', label: '第 1 项', default: 1, min: -100000, max: 100000 },
          f: { type: 'text', label: '下一项 = （用 x 表示上一项）', default: 'x/2 + 1' },
          n: { type: 'int', label: '一共几项', default: 10, min: 2, max: MAXN },
          label: { type: 'text', label: '标签', default: '' },
        },
        outputs: { s: { dim: null, kind: 'seq', label: '数列' }, last: { dim: null, kind: 'num', label: '最后一项' }, diff: { dim: null, kind: 'num', label: '最后一步变化' } },
        icon: () => K.text(32, 26, 'x→f(x)', { size: 14, weight: 700 }) + '<path d="M12 46 Q22 28 32 36 T52 40" fill="none" stroke="var(--accent)" stroke-width="2.5"/>',
        size: () => [270, 140],
        compute: (c) => {
          let x0; try { x0 = parseQ(c.props.start); } catch (e) { c.say('reject', '第 1 项要填有理数'); return {}; }
          let p; try { p = P.parse(String(c.props.f)); } catch (e) { c.say('info', '式子写不对：' + e.message); return {}; }
          const vs = P.vars(p);
          if (vs.length > 1) { c.say('info', '式子里只能有一个字母（代表上一项）：' + vs.join('、')); return {}; }
          const v = vs[0] || 'x';
          const r = run([x0], c.props.n, (xs) => P.evalQ(p, { [v]: xs[xs.length - 1] }));
          note(c, r, '算了 ' + r.xs.length + ' 项');
          return outs(r);
        },
        badge: (c) => (c.out.last ? '末项 ' + U.showVal(c.out.last) : ''),
        draw: (c) => (c.out.s ? K.text((c.w - 90) / 2, 24, 'x → ' + c.props.f, { size: 14, weight: 700 }) + K.text((c.w - 90) / 2, 44, headText(c.out.s.data), { size: 11, fill: 'var(--dim)' }) + pic(c.out.s.data, c) : K.text(c.w / 2, c.h / 2, '…', { fill: 'var(--dim)' })),
      },

      recur2: {
        workspaceRole: 'none', handles: true, essence: ['E6', 'E8'],
        label: '二阶递推', prefix: '递', group: '时间与变化', grades: [6, 9], alias: ['斐波那契', '兔子数列', '递推', '前两项', '黄金分割'],
        props: {
          x0: { type: 'rat', label: '第 1 项', default: 0, min: -100000, max: 100000 },
          x1: { type: 'rat', label: '第 2 项', default: 1, min: -100000, max: 100000 },
          a: { type: 'rat', label: 'a（乘前一项）', default: 1, min: -1000, max: 1000 },
          b: { type: 'rat', label: 'b（乘前两项）', default: 1, min: -1000, max: 1000 },
          c: { type: 'rat', label: 'c（再加）', default: 0, min: -1000, max: 1000 },
          n: { type: 'int', label: '一共几项', default: 12, min: 3, max: MAXN },
          label: { type: 'text', label: '标签', default: '' },
        },
        outputs: { s: { dim: null, kind: 'seq', label: '数列' }, last: { dim: null, kind: 'num', label: '最后一项' }, ratio: { dim: null, kind: 'num', label: '最后两项的比' } },
        icon: () => K.text(32, 26, 'a+b', { size: 18, weight: 700 }) + '<path d="M10 48 L22 44 L32 36 L44 24 L54 10" fill="none" stroke="var(--accent)" stroke-width="2.5"/>',
        size: () => [290, 160],
        compute: (c) => {
          let x0, x1, a, b, k; try { x0 = parseQ(c.props.x0); x1 = parseQ(c.props.x1); a = parseQ(c.props.a); b = parseQ(c.props.b); k = parseQ(c.props.c); } catch (e) { c.say('reject', '各项要填有理数'); return {}; }
          const r = run([x0, x1], c.props.n, (xs) => Q.add(Q.add(Q.mul(a, xs[xs.length - 1]), Q.mul(b, xs[xs.length - 2])), k));
          note(c, r, '算了 ' + r.xs.length + ' 项');
          const o = outs(r), n = r.xs.length, last = r.xs[n - 1], prev = r.xs[n - 2];
          delete o.diff;
          if (prev.n !== 0n) o.ratio = U.val('num', Q.div(last, prev), r.approx ? { exact: false } : {});
          return o;
        },
        badge: (c) => (c.out.last ? '末项 ' + U.showVal(c.out.last) : ''),
        draw: (c) => (c.out.s ? K.text((c.w - 90) / 2, 24, '下一项 = ' + c.props.a + '·前 + ' + c.props.b + '·前前' + (Q.eq(parseQ(c.props.c), Q(0)) ? '' : ' + ' + c.props.c), { size: 13, weight: 700 }) + K.text((c.w - 90) / 2, 44, headText(c.out.s.data), { size: 11, fill: 'var(--dim)' }) + pic(c.out.s.data, c) : K.text(c.w / 2, c.h / 2, '…', { fill: 'var(--dim)' })),
      },

      seqform: {
        workspaceRole: 'none', handles: true, essence: ['E4', 'E8'],
        label: '通项', prefix: '通', group: '数与运算', grades: [5, 9], alias: ['通项公式', '数列', '第n项', '奇数', '平方数', '列表'],
        props: {
          f: { type: 'text', label: '第 n 项 =', default: '2n - 1' },
          from: { type: 'int', label: 'n 从', default: 1, min: -1000, max: 1000 },
          to: { type: 'int', label: 'n 到', default: 10, min: -1000, max: 1000 },
          label: { type: 'text', label: '标签', default: '' },
        },
        outputs: { s: { dim: null, kind: 'seq', label: '数列' }, sum: { dim: null, kind: 'num', label: '总和' } },
        icon: () => K.text(32, 30, 'aₙ', { size: 24, weight: 700 }),
        size: () => [250, 140],
        compute: (c) => {
          let p; try { p = P.parse(String(c.props.f)); } catch (e) { c.say('info', '式子写不对：' + e.message); return {}; }
          const vs = P.vars(p);
          if (vs.length > 1) { c.say('info', '式子里只能有一个字母（n）：' + vs.join('、')); return {}; }
          if (c.props.to < c.props.from) { c.say('reject', '“n 到”不能小于“n 从”'); return {}; }
          if (c.props.to - c.props.from + 1 > MAXN) { c.say('reject', '最多 ' + MAXN + ' 项'); return {}; }
          const v = vs[0] || 'n', xs = [];
          for (let i = c.props.from; i <= c.props.to; i++) xs.push(P.evalQ(p, { [v]: Q(i) }));
          const sum = xs.reduce((s, q) => Q.add(s, q), Q(0));
          c.say('ok', xs.length + ' 项，总和 ' + Q.show(sum));
          return { s: U.val('seq', xs), sum: U.val('num', sum) };
        },
        badge: (c) => (c.out.s ? c.out.s.data.length + ' 项 · 和 ' + U.showVal(c.out.sum) : ''),
        draw: (c) => (c.out.s ? K.text((c.w - 90) / 2, 24, 'aₙ = ' + c.props.f, { size: 14, weight: 700 }) + K.text((c.w - 90) / 2, 44, headText(c.out.s.data), { size: 11, fill: 'var(--dim)' }) + pic(c.out.s.data, c) : K.text(c.w / 2, c.h / 2, '…', { fill: 'var(--dim)' })),
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
