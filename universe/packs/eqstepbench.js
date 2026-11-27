/* 器材包 eqstepbench：式子台（docs/essence-forms.md）。一个等式 a·x + b = c·x + d，一行一行往下写，每行旁边写这一步做了什么。
 * 全部在卡片上直接动手：
 *   - 点最下面一行里的一项（比如 3），下面出来按钮：“两边都减 3”“两边都减 1”“只这边减 3”；点 x 那一项同理（减几个 x）。
 *   - 四个数有公因数时，有“两边 ÷ n”的按钮。
 *   - 只动一边，这一行写成 ≠，标红；再去另一边做同样的事，又写成 =。
 * 一个人用时就是“解方程”的格式；和天平（以后还有线段图、数轴）连成一组时，在哪一台做一步，这里就往下写一行（U.Forms 的 lineq）。
 * 这一版的边界（如实写）：只有 0 和正整数（没有负数、没有括号、没有分数系数）；不能“两边同时加”（用不上：没有负数就不用移回来）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 560, CX = 220, Y0 = 60, DY = 30, SHOW = 6, NMAX = 60;
  const LQ = () => U.Forms.LQ, FORM = () => U.Forms.FORMS.lineq;
  const st = (p) => ({ a: p.a, b: p.b, c: p.c, d: p.d, x0: p.x0 });
  const key = (s) => [s.a, s.b, s.c, s.d].join(',');
  const parseRows = (t) => String(t || '').split(';').filter(Boolean).map((r) => { const [n, label] = r.split('|'), a = n.split(',').map(Number); return a.length === 4 && a.every((v) => Number.isInteger(v) && v >= 0) ? { a: a[0], b: a[1], c: a[2], d: a[3], label: label || '' } : null; }).filter(Boolean);
  const rowsOf = (p) => { const r = parseRows(p.rows); return r.length ? r : [Object.assign(st(p), { label: '' })]; };
  // 写下新的一行（和上一行一样就不写）
  function append(p, s, label) {
    const r = rowsOf(p); if (key(r[r.length - 1]) === key(s)) return p.rows || '';
    r.push({ a: s.a, b: s.b, c: s.c, d: s.d, label });
    return r.slice(-12).map((x) => key(x) + '|' + x.label).join(';');
  }
  // 做一步：新的状态 → 属性补丁（这一行写的话由 U.Forms 的步子表来，和联动组用的是同一句）
  function stepTo(p, n) {
    const s0 = st(p), s = Object.assign({}, s0, n), step = FORM().diff(s0, s);
    if (!step || step.why) return {};
    return { a: s.a, b: s.b, c: s.c, d: s.d, rows: append(p, s, FORM().label(step)), sel: '' };
  }
  const xs = (k) => (k === 1 ? 'x' : k + 'x');
  // 一行式子拆成可点的几项：[{ id, tx }]，id 是 Lx/Lc/Rx/Rc（0 的项不出现，除非这一边什么都没有）
  function terms(s) {
    const side = (x, c, L) => { const t = []; if (x) t.push({ id: L + 'x', tx: xs(x) }); if (c || !x) t.push({ id: L + 'c', tx: String(c), zero: !c }); return t; };
    const out = [], l = side(s.a, s.b, 'L'), r = side(s.c, s.d, 'R');
    l.forEach((t, i) => { if (i) out.push({ tx: '+' }); out.push(t); });
    out.push({ tx: LQ().balanced(s) ? '=' : '≠', eq: true });
    r.forEach((t, i) => { if (i) out.push({ tx: '+' }); out.push(t); });
    return out;
  }
  const tw = (tx, size) => tx.length * size * 0.6 + (tx.length > 1 ? 4 : 8);
  const btn = (x, y, w, label, patch, on, tip, bad) => '<g' + (on ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' opacity="0.4"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: '#fff', stroke: on ? (bad ? 'var(--bad)' : 'var(--blue)') : '#8a94a8', r: 8, w: 1.6 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: bad && on ? 'var(--bad)' : 'var(--ink)' }) + '</g>';

  function draw(c) {
    const p = c.props, s = st(p), rows = rowsOf(p), ok = LQ().balanced(s), sol = LQ().solved(s);
    let h = K.text(16, 26, '式子：一步一行往下写', { size: 12, anchor: 'start', fill: '#4a5568' });
    const shown = rows.slice(-SHOW), last = shown.length - 1;
    shown.forEach((r, i) => {
      const rs = Object.assign({ x0: s.x0 }, r), good = LQ().balanced(rs), y = Y0 + i * DY;
      if (r.label) h += K.text(W - 112, y - 2, r.label, { size: 11, fill: good ? 'var(--blue)' : 'var(--bad)', weight: 700 });
      if (i < last) { h += K.text(CX, y, LQ().text(rs), { size: 16, fill: good ? '#4a5568' : 'var(--bad)' }); return; }
      // 最下面一行：每一项都能点
      const size = 22, ts = terms(s), total = ts.reduce((t, k) => t + tw(k.tx, size) + 6, -6);
      let x = CX - total / 2;
      for (const t of ts) {
        const w = tw(t.tx, size), on = t.id && !t.zero, picked = on && p.sel === t.id;
        if (on) h += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ sel: picked ? '' : t.id })) + '" style="cursor:pointer"><title>点一下：对这一项做一步</title>' +
          K.rect(x - 2, y - 22, w + 4, 30, { fill: picked ? '#dcebfb' : '#fff', stroke: picked ? 'var(--blue)' : '#c9d2df', r: 6, w: picked ? 2 : 1 });
        h += K.text(x + w / 2, y, t.tx, { size, weight: 700, fill: t.eq && !good ? 'var(--bad)' : 'var(--ink)' });
        if (on) h += '</g>';
        x += w + 6;
      }
    });
    // 这一项能做的事
    const ay = Y0 + last * DY + 22;
    const sel = p.sel && /^[LR][xc]$/.test(p.sel) ? p.sel : '', L = sel[0] === 'L', isX = sel[1] === 'x';
    const mine = sel ? (L ? (isX ? s.a : s.b) : (isX ? s.c : s.d)) : 0, other = sel ? (L ? (isX ? s.c : s.d) : (isX ? s.a : s.b)) : 0;
    if (sel && mine > 0) {
      const kx = isX ? 'a' : 'b', ky = isX ? 'c' : 'd', nm = (k) => (isX ? xs(k) : String(k));
      const both = (k) => stepTo(p, { [kx]: s[kx] - k, [ky]: s[ky] - k });
      const lone = (k) => stepTo(p, { [L ? kx : ky]: (L ? s[kx] : s[ky]) - k });
      let bx = 16;
      h += btn(bx, ay, 132, '两边都减 ' + nm(mine), both(mine), other >= mine, other >= mine ? '两边同时减去同一个：还相等' : '另一边不够减 ' + nm(mine) + '（这里没有负数）'); bx += 140;
      if (mine > 1) { h += btn(bx, ay, 116, '两边都减 ' + nm(1), both(1), other >= 1, other >= 1 ? '两边同时减去同一个：还相等' : '另一边没有可以减的'); bx += 124; }
      h += btn(bx, ay, 132, '只这边减 ' + nm(mine), lone(mine), true, '只动一边：两边不再相等', true);
    } else h += K.text(16, ay + 17, '点上面一行里的一项，对它做一步', { size: 12, anchor: 'start', fill: '#4a5568' });
    // 两边 ÷ n
    const dy = ay + 34, divs = [];
    if (s.a + s.c > 0) for (let n = 2; n <= NMAX && divs.length < 3; n++) if ([s.a, s.b, s.c, s.d].every((v) => v % n === 0)) divs.push(n);
    divs.forEach((n, i) => { h += btn(16 + i * 112, dy, 104, '两边 ÷ ' + n, stepTo(p, { a: s.a / n, b: s.b / n, c: s.c / n, d: s.d / n }), true, '两边同时除以 ' + n + '：还相等'); });
    // 说一句
    const ny = dy + 52;
    if (!ok) h += K.text(16, ny, '两边不再相等：只动了一边。在另一边做同样的事，就又相等了。', { size: 13, anchor: 'start', weight: 700, fill: 'var(--bad)' });
    else if (sol !== null) h += K.text(16, ny, 'x = ' + sol + '，解出来了', { size: 14, anchor: 'start', weight: 700, fill: 'var(--good)' });
    return h;
  }

  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  U.registerPack({
    id: 'eqstepbench', version: 1,
    types: {
      eqstepbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E4', 'E8'],
        label: '式子台', prefix: '式子', group: '关系', grades: [4, 9],
        alias: ['式子', '方程', '解方程', '等式的性质', '一步一步', '两边同时'],
        props: {
          a: I(0, NMAX, 2, '左边几个 x'), b: I(0, NMAX, 3, '左边的数'), c: I(0, NMAX, 0, '右边几个 x'), d: I(0, NMAX, 11, '右边的数'),
          x0: I(1, 20, 4, 'x 的真实值（出题人设）', { hidden: true }),
          sel: { type: 'text', label: '选中的项（自动）', default: '', write: true, hidden: true },
          rows: { type: 'text', label: '每一行（自动记录）', default: '', write: true, hidden: true },
        },
        outputs: {
          solved: { dim: null, kind: 'num', label: 'x 是多少（解出来以后才有）' },
          stage: { dim: null, kind: 'num', label: '进度：0 还混着，1 x 和数分开了，2 解出来了' },
          okn: { dim: null, kind: 'num', label: '两边相等：1 是，0 否' },
          moves: { dim: null, kind: 'num', label: '写了几步' },
          eq: { dim: null, kind: 'eqn', label: '方程（左 = 右）' },
        },
        icon: () => K.text(32, 22, '2x+3', { size: 13, weight: 700 }) + K.line(10, 28, 54, 28, { w: 1 }) + K.text(32, 44, '2x = 8', { size: 13, weight: 700, fill: 'var(--blue)' }),
        size: () => [W, 380],
        compute: (c) => {
          const s = st(c.props), ok = LQ().balanced(s), sol = LQ().solved(s), X = U.Poly.variable('x'), C = (n) => U.Poly.const(Q(n));
          const apart = ok && ((s.b === 0 && s.c === 0 && s.a > 0) || (s.d === 0 && s.a === 0 && s.c > 0));
          const o = { stage: num(sol !== null ? 2 : apart ? 1 : 0), okn: num(ok ? 1 : 0), moves: num(rowsOf(c.props).length - 1),
            eq: U.val('eqn', U.Eqn.make(U.Poly.add(U.Poly.mul(C(s.a), X), C(s.b)), U.Poly.add(U.Poly.mul(C(s.c), X), C(s.d)), '=')) };
          if (sol !== null) o.solved = num(sol);
          return o;
        },
        badge: (c) => { const s = st(c.props), sol = LQ().solved(s); return sol !== null ? 'x = ' + sol : LQ().balanced(s) ? '相等' : '不相等'; },
        draw,
      },
    },
  });
  U.Forms.adapt('lineq', 'eqstepbench', {
    toState: (p) => ({ a: p.a, b: p.b, c: p.c, d: p.d }),
    fromState: (s, p, step) => (step ? { a: s.a, b: s.b, c: s.c, d: s.d, x0: s.x0, rows: append(p, s, FORM().label(step)), sel: '' } : { a: s.a, b: s.b, c: s.c, d: s.d, x0: s.x0, rows: '', sel: '' }),
    can: (s) => ([s.a, s.b, s.c, s.d].every((v) => v <= NMAX) ? null : '式子台里的数最多到 ' + NMAX),
  });
  U.EqStepBench = { st, rowsOf, append, stepTo, terms };
})(typeof globalThis !== 'undefined' ? globalThis : window);
