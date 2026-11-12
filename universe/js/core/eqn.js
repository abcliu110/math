/* 方程与不等式（任务 B.3，见 next-steps.md §3.3）。
 *  - kind eqn：{ lhs: poly, rhs: poly, rel: '=' | '<' | '>' | '≤' | '≥' }
 *  - U.Eqn.apply(e, { op: 'add'|'sub'|'mul'|'div', by })：两边同时做同一件事，返回 { eqn, say, rule }
 *      不等式两边乘除负数时不等号反向；乘除 0 被拒绝并说明。
 *  - U.Eqn.solveLinear(e, v)：一元一次（或不等式）的解；无解 / 无穷多解时说明。
 *  - U.Eqn.isIdentity(e)：lhs − rhs 规范化后为 0 → 恒等式（对所有取值成立）。
 *  - U.Eqn.solveSystem2(e1, e2, x, y)：二元一次方程组，消元法，每一步都记下来。
 *  - U.Eqn.quadratic(a, b, c)：一元二次方程的精确根（用 U.Real，例如 1 ± √2）。
 *  - kind interval：{ lo, hi, loOpen, hiOpen }，lo/hi 为 null 表示无穷端。
 * 所有计算都是有理数（或 U.Real）精确运算。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, P = U.Poly, R = U.Real;

  const FLIP = { '<': '>', '>': '<', '≤': '≥', '≥': '≤', '=': '=' };
  const isConstPoly = (p) => p.terms.every((t) => Object.keys(t.m).length === 0);
  const constOf = (p) => (p.terms.length ? p.terms[0].c : Q(0));

  const Eqn = {
    make(lhs, rhs, rel) { return { lhs, rhs, rel: rel || '=' }; },

    // 两边同时做同一件事。by：多项式（加减），或常数（乘除）
    apply(e, o) {
      const byP = o.by && o.by.terms ? o.by : P.const(o.by);
      if (o.op === 'add' || o.op === 'sub') {
        const f = o.op === 'add' ? (x) => P.add(x, byP) : (x) => P.sub(x, byP);
        return { eqn: { lhs: f(e.lhs), rhs: f(e.rhs), rel: e.rel }, say: '两边' + (o.op === 'add' ? '同时加上' : '同时减去') + ' ' + P.show(byP), rule: 'eq.both-sides' };
      }
      if (o.op === 'mul' || o.op === 'div') {
        if (!isConstPoly(byP)) return { error: '只能同时乘或除以一个数' };
        const k = constOf(byP);
        if (k.n === 0n) return { error: o.op === 'mul' ? '两边乘 0 得到 0 = 0，信息全丢了，不行' : '不能除以 0' };
        const f = o.op === 'mul' ? (x) => P.mul(x, byP) : (x) => P.mul(x, P.const(Q(k.d, k.n)));
        const rel = k.n < 0 ? FLIP[e.rel] : e.rel;
        const say = '两边' + (o.op === 'mul' ? '同时乘' : '同时除以') + ' ' + Q.show(k) + (k.n < 0 && e.rel !== '=' ? '，不等号反向' : '');
        return { eqn: { lhs: f(e.lhs), rhs: f(e.rhs), rel }, say, rule: 'eq.both-sides' };
      }
      return { error: '不认识的操作：' + o.op };
    },

    // lhs − rhs（移项到一边）
    diff(e) { return P.sub(e.lhs, e.rhs); },

    // 一元一次：a·v + b rel 0 → v rel' −b/a
    // 返回 { kind:'solution', value, rel, steps } | { kind:'none'|'all', steps } | { kind:'error', why }
    solveLinear(e, v) {
      const d = Eqn.diff(e), steps = [];
      if (P.degree(d) > 1 || P.vars(d).some((x) => x !== v)) return { kind: 'error', why: '只能解只含一个未知数 ' + v + ' 的一次式' };
      let a = Q(0), b = Q(0);
      for (const t of d.terms) { if (t.m[v] === 1) a = Q.add(a, t.c); else b = Q.add(b, t.c); }
      steps.push({ say: '移项，得到 ' + P.show(d) + ' ' + (e.rel === '=' ? '= 0' : e.rel + ' 0'), rule: 'eq.both-sides' });
      if (a.n === 0n) {
        // 没有未知数：0 rel b 是否成立
        const c = Q.cmp(Q(0), b);
        const holds = e.rel === '=' ? c === 0 : e.rel === '<' ? c < 0 : e.rel === '>' ? c > 0 : e.rel === '≤' ? c <= 0 : c >= 0;
        return holds ? { kind: 'all', steps } : { kind: 'none', steps };
      }
      const x = Q.div(Q.neg(b), a);
      const rel = a.n < 0 ? FLIP[e.rel] : e.rel;
      steps.push({ say: '两边除以 ' + Q.show(a) + (a.n < 0 && e.rel !== '=' ? '，不等号反向' : ''), rule: 'eq.both-sides' });
      return { kind: 'solution', value: x, rel, steps };
    },

    // n 元一次方程组（n 个方程）：高斯消元，每一步都记下来。vars 是未知数的名字数组。
    // 返回 { kind: 'solution', values: [有理数…], steps } | { kind: 'degenerate', steps } | { kind: 'error', why }
    solveLinearSystem(es, vars) {
      const n = vars.length, steps = [];
      if (es.length !== n) return { kind: 'error', why: '未知数有 ' + n + ' 个，方程要正好 ' + n + ' 个（现在 ' + es.length + ' 个）' };
      const rows = [];
      for (const e of es) {
        if (e.rel !== '=') return { kind: 'error', why: '方程组里只能是等式（不能是不等式）' };
        const d = Eqn.diff(e), row = new Array(n + 1).fill(null).map(() => Q(0));
        for (const t of d.terms) {
          const keys = Object.keys(t.m);
          if (!keys.length) { row[n] = Q.sub(row[n], t.c); continue; }
          if (keys.length === 1 && t.m[keys[0]] === 1 && vars.includes(keys[0])) { const j = vars.indexOf(keys[0]); row[j] = Q.add(row[j], t.c); continue; }
          return { kind: 'error', why: '只能解一次方程组（每一项只能是数，或者数乘一个未知数）' };
        }
        rows.push(row);
      }
      const showRow = (r) => r.slice(0, n).map((c, j) => (c.n === 0n ? '' : Q.show(c) + vars[j])).filter(Boolean).join(' + ').split('+ -').join('− ') + ' = ' + Q.show(r[n]);
      steps.push({ say: '写成：' + rows.map(showRow).join('；'), rule: 'eq.both-sides' });
      for (let k = 0; k < n; k++) {
        let p = k; while (p < n && rows[p][k].n === 0n) p++;
        if (p === n) { steps.push({ say: '消到第 ' + (k + 1) + ' 个未知数 ' + vars[k] + ' 时，剩下的方程里它的系数全是 0：方程组没有唯一的解', rule: 'eq.both-sides' }); return { kind: 'degenerate', steps }; }
        if (p !== k) { const t = rows[p]; rows[p] = rows[k]; rows[k] = t; }
        const pv = rows[k][k];
        for (let i = 0; i < n; i++) {
          if (i === k || rows[i][k].n === 0n) continue;
          const f = Q.div(rows[i][k], pv);
          rows[i] = rows[i].map((c, j) => Q.sub(c, Q.mul(f, rows[k][j])));
        }
        steps.push({ say: '用第 ' + (k + 1) + ' 个方程消去其余方程里的 ' + vars[k], rule: 'eq.both-sides' });
      }
      const values = rows.map((r, i) => Q.div(r[n], r[i]));
      steps.push({ say: values.map((v, i) => vars[i] + ' = ' + Q.show(v)).join('，'), rule: 'eq.both-sides' });
      return { kind: 'solution', values, steps };
    },

    // 恒等式：移项后规范化为 0（对所有取值都成立）
    isIdentity(e) { return e.rel === '=' && Eqn.diff(e).terms.length === 0; },

    // 二元一次方程组：消元法，记录每一步
    solveSystem2(e1, e2, x, y) {
      const steps = [];
      const lin = (e) => {
        const d = Eqn.diff(e); let a = Q(0), b = Q(0), c = Q(0);
        for (const t of d.terms) {
          const keys = Object.keys(t.m);
          if (keys.length === 1 && t.m[x] === 1) a = Q.add(a, t.c);
          else if (keys.length === 1 && t.m[y] === 1) b = Q.add(b, t.c);
          else if (!keys.length) c = Q.add(c, t.c);
          else return null;
        }
        return { a, b, c: Q.neg(c) }; // a x + b y = c
      };
      const A = lin(e1), B = lin(e2);
      if (!A || !B) return { kind: 'error', why: '只能解二元一次方程组' };
      const det = Q.sub(Q.mul(A.a, B.b), Q.mul(A.b, B.a));
      steps.push({ say: '写成 ' + Q.show(A.a) + 'x + ' + Q.show(A.b) + 'y = ' + Q.show(A.c) + '，以及 ' + Q.show(B.a) + 'x + ' + Q.show(B.b) + 'y = ' + Q.show(B.c), rule: 'eq.both-sides' });
      if (det.n === 0n) {
        steps.push({ say: '系数成比例，消元后没有唯一解', rule: 'eq.both-sides' });
        return { kind: 'degenerate', steps };
      }
      steps.push({ say: '消去 y：第一式 × ' + Q.show(B.b) + '，第二式 × ' + Q.show(A.b) + '，两式相减', rule: 'eq.both-sides' });
      const xv = Q.div(Q.sub(Q.mul(A.c, B.b), Q.mul(B.c, A.b)), det);
      steps.push({ say: 'x = ' + Q.show(xv), rule: 'eq.both-sides' });
      const yv = Q.div(Q.sub(Q.mul(A.a, B.c), Q.mul(B.a, A.c)), det);
      steps.push({ say: '代回去，y = ' + Q.show(yv), rule: 'eq.both-sides' });
      return { kind: 'solution', x: xv, y: yv, steps };
    },

    // 一元二次 a·v² + b·v + c = 0 的精确根（可能是 U.Real）
    quadratic(a, b, c) {
      const disc = Q.sub(Q.mul(b, b), Q.mul(Q(4), Q.mul(a, c)));
      const steps = [{ say: '判别式 b² − 4ac = ' + Q.show(disc), rule: 'eq.both-sides' }];
      if (disc.n < 0) return { kind: 'none', steps };
      const s = R.sqrt(disc);
      const base = R.from(Q.neg(b));
      const scale = (r) => R.mul(r, R.from(Q.div(Q(1), Q.mul(Q(2), a))));
      const r1 = scale(R.add(base, s));
      const r2 = scale(R.add(base, R.mul(s, R.from(Q(-1)))));
      steps.push({ say: '求根公式：(−b ± √判别式) / 2a', rule: 'eq.both-sides' });
      return { kind: 'roots', roots: [r1, r2], steps };
    },
    // 只含一个未知数 v 的二次方程（= 0 形式）：先移项，取出 a、b、c，再用求根公式
    solveQuadratic(e, v) {
      if (e.rel !== '=') return { kind: 'error', why: '二次不等式暂时只能用图形看，这台器材只解二次方程' };
      const d = Eqn.diff(e), steps = [];
      if (P.vars(d).some((x) => x !== v) || P.degree(d) !== 2) return { kind: 'error', why: '只能解只含一个未知数 ' + v + ' 的二次方程' };
      let a = Q(0), b = Q(0), c = Q(0);
      for (const t of d.terms) {
        const k = t.m[v] || 0;
        if (k === 2) a = Q.add(a, t.c); else if (k === 1) b = Q.add(b, t.c); else c = Q.add(c, t.c);
      }
      steps.push({ say: '移项，得到 ' + P.show(d) + ' = 0，其中 a = ' + Q.show(a) + '，b = ' + Q.show(b) + '，c = ' + Q.show(c), rule: 'eq.both-sides' });
      const r = Eqn.quadratic(a, b, c);
      return Object.assign({}, r, { steps: steps.concat(r.steps || []) });
    },
  };
  U.Eqn = Eqn;

  // 方程与不等式的值
  U.defineKind('eqn', {
    label: '方程', color: '#f472b6',
    eq: (a, b) => a.rel === b.rel && P.eq(a.lhs, b.lhs) && P.eq(a.rhs, b.rhs),
    show: (e) => P.show(e.lhs) + ' ' + e.rel + ' ' + P.show(e.rhs),
  });

  // 区间：lo / hi 为 null 表示无穷端
  const Interval = {
    make(lo, hi, loOpen, hiOpen) { return { lo: lo || null, hi: hi || null, loOpen: !!loOpen, hiOpen: !!hiOpen }; },
    contains(I, x) {
      if (I.lo) { const c = Q.cmp(x, I.lo); if (c < 0 || (c === 0 && I.loOpen)) return false; }
      if (I.hi) { const c = Q.cmp(x, I.hi); if (c > 0 || (c === 0 && I.hiOpen)) return false; }
      return true;
    },
    show(I) {
      const l = I.lo ? (I.loOpen ? '(' : '[') + Q.show(I.lo) : '(−∞';
      const h = I.hi ? Q.show(I.hi) + (I.hiOpen ? ')' : ']') : '+∞)';
      return l + ', ' + h;
    },
    // 一元一次不等式的解集（rel 是 'x rel value' 的形式）
    fromLinear(sol) {
      if (sol.kind !== 'solution') return null;
      const v = sol.value;
      if (sol.rel === '=') return Interval.make(v, v, false, false);
      if (sol.rel === '<') return Interval.make(null, v, false, true);
      if (sol.rel === '≤') return Interval.make(null, v, false, false);
      if (sol.rel === '>') return Interval.make(v, null, true, false);
      return Interval.make(v, null, false, false);
    },
  };
  U.Interval = Interval;
  U.defineKind('interval', {
    label: '区间', color: '#84cc16',
    eq: (a, b) => (a.lo === null ? b.lo === null : b.lo !== null && Q.eq(a.lo, b.lo)) && (a.hi === null ? b.hi === null : b.hi !== null && Q.eq(a.hi, b.hi)) && a.loOpen === b.loOpen && a.hiOpen === b.hiOpen,
    show: (I) => Interval.show(I),
  });

  // ---- 解集：解方程、解不等式的结果，统一成一种值 ----
  //  { v: 未知数的名字, items: [符号数…]（几个孤立的解） | iv: 区间 | segs: [段…]（几段，端点是符号数）| all: true（所有数都是解） | none: true（无解） }
  //  段 = { lo, hi, loOpen, hiOpen }，lo / hi 是符号数，null 表示无穷端；孤立的点是 lo = hi 的闭段。
  //  能自动变成：num（只有一个有理数解时）、interval（区间、单个解、所有数）；区间也能变成解集，所以旧的“解集（区间）”口还能接进新器材。
  //  并、交、补（U.Solset.union / intersect / complement）把各种写法统一看成“若干段”再算，结果再整理回最简单的写法。
  const isRat = (r) => r.b.n === 0n && r.p.n === 0n;
  const cmpR = (a, b) => { if (R.eq(a, b)) return 0; const d = R.approx(a) - R.approx(b); return d < 0 ? -1 : d > 0 ? 1 : 0; };
  const cmpRQ = (r, q) => (isRat(r) ? Q.cmp(r.a, q) : (R.approx(r) - Q.num(q) < 0 ? -1 : 1));   // 无理数不会等于有理数
  const seg = (lo, hi, loOpen, hiOpen) => ({ lo: lo || null, hi: hi || null, loOpen: !!loOpen, hiOpen: !!hiOpen });
  // 起点、终点的大小比较：null 是无穷；数相同时，闭的起点更靠前、闭的终点更靠后
  const cmpStart = (a, b) => { if (!a.lo || !b.lo) return a.lo === b.lo ? 0 : (a.lo ? 1 : -1); return cmpR(a.lo, b.lo) || (a.loOpen === b.loOpen ? 0 : (a.loOpen ? 1 : -1)); };
  const cmpEnd = (a, b) => { if (!a.hi || !b.hi) return a.hi === b.hi ? 0 : (a.hi ? -1 : 1); return cmpR(a.hi, b.hi) || (a.hiOpen === b.hiOpen ? 0 : (a.hiOpen ? -1 : 1)); };
  const nonEmpty = (s) => { if (!s.lo || !s.hi) return true; const c = cmpR(s.lo, s.hi); return c < 0 || (c === 0 && !s.loOpen && !s.hiOpen); };
  const touches = (a, b) => {   // 排好序后，b 能不能接在 a 后面合成一段（重叠或刚好相接且至少一边是闭的）
    if (!a.hi || !b.lo) return true;
    const c = cmpR(b.lo, a.hi); return c < 0 || (c === 0 && (!a.hiOpen || !b.loOpen));
  };
  const normSegs = (segs) => {
    const xs = segs.filter(nonEmpty).sort(cmpStart), out = [];
    for (const s of xs) {
      const last = out[out.length - 1];
      if (last && touches(last, s)) { if (cmpEnd(s, last) > 0) { last.hi = s.hi; last.hiOpen = s.hiOpen; } } else out.push(Object.assign({}, s));
    }
    return out;
  };
  const segsOf = (S) => {
    if (S.none) return [];
    if (S.all) return [seg(null, null, true, true)];
    if (S.segs) return S.segs;
    if (S.items) return S.items.map((r) => seg(r, r, false, false));
    const I = S.iv; return [seg(I.lo ? R.from(I.lo) : null, I.hi ? R.from(I.hi) : null, I.loOpen, I.hiOpen)];
  };
  const segRat = (s) => (!s.lo || isRat(s.lo)) && (!s.hi || isRat(s.hi));
  const fromSegs = (v, segs) => {   // 整理成最简单的写法
    const xs = normSegs(segs);
    if (!xs.length) return Solset.of(v, { none: true });
    if (xs.length === 1 && !xs[0].lo && !xs[0].hi) return Solset.of(v, { all: true });
    if (xs.every((s) => s.lo && s.hi && cmpR(s.lo, s.hi) === 0)) return Solset.of(v, { items: xs.map((s) => s.lo) });
    if (xs.length === 1 && segRat(xs[0])) return Solset.of(v, { iv: Interval.make(xs[0].lo && xs[0].lo.a, xs[0].hi && xs[0].hi.a, xs[0].loOpen, xs[0].hiOpen) });
    return Solset.of(v, { segs: xs });
  };
  const showSeg = (s, v) => {
    if (s.lo && s.hi && cmpR(s.lo, s.hi) === 0) return (s.lo.ap ? v + ' ≈ ' : v + ' = ') + R.show(s.lo);
    const rs = (r) => (r.ap ? '≈' : '') + R.show(r);   // 近似根前面标 ≈
    if (s.lo && s.hi) return rs(s.lo) + (s.loOpen ? ' < ' : ' ≤ ') + v + (s.hiOpen ? ' < ' : ' ≤ ') + rs(s.hi);
    if (s.lo) return v + (s.loOpen ? ' > ' : ' ≥ ') + rs(s.lo);
    return v + (s.hiOpen ? ' < ' : ' ≤ ') + rs(s.hi);
  };
  const Solset = {
    of(v, o) { return Object.assign({ v: v || 'x' }, o); },
    items(v, list) {   // 孤立解：按大小排好、去重
      const out = [];
      for (const r of list.slice().sort((a, b) => R.approx(a) - R.approx(b))) if (!out.some((x) => R.eq(x, r))) out.push(r);
      return Solset.of(v, { items: out });
    },
    seg, segsOf, fromSegs, cmpR,
    // 解里有没有数值求出来的近似根（有的话，结果要标近似）
    approx(S) { return segsOf(S).some((g) => (g.lo && g.lo.ap) || (g.hi && g.hi.ap)); },
    show(S) {
      const v = S.v || 'x';
      if (S.all) return v + ' 取任何数都行';
      if (S.none) return '无解';
      if (S.items) return S.items.map((r) => (r.ap ? v + ' ≈ ' : v + ' = ') + R.show(r)).join(' 或 ');
      if (S.segs) return S.segs.map((s) => showSeg(s, v)).join(' 或 ');
      const I = S.iv, q = (x) => Q.show(x).replace('-', '−');   // 负号用真正的减号，和根号写法（−√2）一致
      if (I.lo && I.hi && Q.eq(I.lo, I.hi)) return v + ' = ' + q(I.lo);
      if (I.lo && I.hi) return q(I.lo) + (I.loOpen ? ' < ' : ' ≤ ') + v + (I.hiOpen ? ' < ' : ' ≤ ') + q(I.hi);
      if (I.lo) return v + (I.loOpen ? ' > ' : ' ≥ ') + q(I.lo);
      if (I.hi) return v + (I.hiOpen ? ' < ' : ' ≤ ') + q(I.hi);
      return v + ' 取任何数都行';
    },
    // 一个有理数在不在解集里（符号数的解只在它恰好是有理数时才比得出来）
    contains(S, q) {
      if (S.all) return true;
      if (S.none) return false;
      if (S.iv) return Interval.contains(S.iv, q);
      if (S.segs) return S.segs.some((s) => {
        if (s.lo) { const c = cmpRQ(s.lo, q); if (c > 0 || (c === 0 && s.loOpen)) return false; }
        if (s.hi) { const c = cmpRQ(s.hi, q); if (c < 0 || (c === 0 && s.hiOpen)) return false; }
        return true;
      });
      return S.items.some((r) => isRat(r) && Q.eq(r.a, q));
    },
    // 只有一个有理数解时的那个数
    single(S) {
      if (S.items && S.items.length === 1 && isRat(S.items[0])) return S.items[0].a;
      if (S.iv && S.iv.lo && S.iv.hi && Q.eq(S.iv.lo, S.iv.hi)) return S.iv.lo;
      return null;
    },
    toInterval(S) {
      if (S.iv) return S.iv;
      if (S.all) return Interval.make(null, null, true, true);
      const q = Solset.single(S); return q ? Interval.make(q, q, false, false) : null;
    },
    // 交：两个解集同时成立（不等式组）
    intersect(A, B) {
      const out = [];
      for (const a of segsOf(A)) for (const b of segsOf(B)) {
        const lo = cmpStart(a, b) >= 0 ? a : b, hi = cmpEnd(a, b) <= 0 ? a : b;
        out.push(seg(lo.lo, hi.hi, lo.loOpen, hi.hiOpen));
      }
      return fromSegs(A.v, out);
    },
    // 并：至少一个成立
    union(A, B) { return fromSegs(A.v, segsOf(A).concat(segsOf(B))); },
    // 补：A 之外的所有数
    complement(A) {
      const xs = normSegs(segsOf(A)), out = [];
      if (!xs.length) return Solset.of(A.v, { all: true });
      if (xs[0].lo) out.push(seg(null, xs[0].lo, true, !xs[0].loOpen));
      for (let i = 0; i + 1 < xs.length; i++) out.push(seg(xs[i].hi, xs[i + 1].lo, !xs[i].hiOpen, !xs[i + 1].loOpen));
      const last = xs[xs.length - 1]; if (last.hi) out.push(seg(last.hi, null, !last.hiOpen, true));
      return fromSegs(A.v, out);
    },
  };
  U.Solset = Solset;
  U.defineKind('solset', {
    label: '解集', color: '#84cc16',
    eq: (a, b) => Solset.show(a) === Solset.show(b),
    show: (S) => Solset.show(S),
    to: { num: (S) => Solset.single(S), interval: (S) => Solset.toInterval(S) },
  });
  U.KINDS.interval.to = Object.assign({}, U.KINDS.interval.to || {}, { solset: (I) => Solset.of('x', { iv: I }) });

  // ---- 一元多项式的实根（精确）与不等式的符号表 ----
  // 先找有理根（有理根定理，逐个剥掉），剩下的一次、二次式再精确求根（根可能是 a + b√c）；
  // 剩下三次以上又没有有理根的，暂时解不了。返回 { roots: [{ r: 符号数, m: 重数 }…] } 或 { why }
  const ratDivisors = (n) => {
    n = Number(n < 0n ? -n : n); if (!isFinite(n) || n > 1e12) return null;
    const out = []; for (let d = 1; d * d <= n; d++) if (n % d === 0) { out.push(d); if (d * d !== n) out.push(n / d); }
    return out;
  };
  const gcdBig = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { [a, b] = [b, a % b]; } return a; };
  // 没有有理根的整系数多项式（系数数组，下标是次数，次数 ≥ 4）：试着分出整系数的二次因式（Kronecker 法：在 0、1、−1 三点上，
  // 二次因式的值必须整除多项式的值，枚举这些值，插值出二次式，再验证能不能整除）。返回 { quads: [系数数组…], rest: 系数数组 }
  const polyDivide = (a, b) => {   // a ÷ b：返回 { q, r }（系数数组）
    const nb = b.length - 1; let r = a.slice();
    const q = new Array(Math.max(a.length - nb, 1)).fill(Q(0));
    for (let i = a.length - 1; i >= nb; i--) {
      const f = Q.div(r[i], b[nb]); q[i - nb] = f;
      for (let j = 0; j <= nb; j++) r[i - nb + j] = Q.sub(r[i - nb + j], Q.mul(f, b[j]));
    }
    return { q, r: r.slice(0, Math.max(nb, 1)) };
  };
  const evalCoef = (a, x) => a.reduceRight((s, c) => Q.add(Q.mul(s, x), c), Q(0));
  const splitQuadratics = (a0) => {
    let a = a0.slice();
    const quads = [];
    for (let guard = 0; guard < 10 && a.length - 1 >= 4; guard++) {
      const ks = [0, 1, -1], vals = ks.map((k) => evalCoef(a, Q(k)));
      if (vals.some((x) => x.d !== 1n || x.n === 0n)) break;
      const dv = vals.map((x) => ratDivisors(x.n));
      if (dv.some((x) => !x) || dv.reduce((s, x) => s * 2 * x.length, 1) > 200000) break;
      let found = null;
      outer: for (const d0 of dv[0]) for (const s0 of [1, -1]) for (const d1 of dv[1]) for (const s1 of [1, -1]) for (const d2 of dv[2]) for (const s2 of [1, -1]) {
        const y0 = s0 * d0, y1 = s1 * d1, y2 = s2 * d2;
        // 过 (0,y0)、(1,y1)、(−1,y2) 的二次式 c + b x + a x²
        const c = y0, b2 = y1 - y2, a2 = y1 + y2 - 2 * y0;
        if (b2 % 2 !== 0 || a2 % 2 !== 0 || a2 === 0) continue;
        const cand = [Q(c), Q(b2 / 2), Q(a2 / 2)];
        const dm = polyDivide(a, cand);
        if (dm.r.every((x) => x.n === 0n)) { found = { cand, q: dm.q }; break outer; }
      }
      if (!found) break;
      quads.push(found.cand); a = found.q;
    }
    return { quads, rest: a };
  };
  Eqn.splitQuadratics = splitQuadratics;
  // 实根的数值解（只在没有别的办法时用）：先求导数的根把数轴分段，每段至多一个根，用二分法。返回从小到大的实根。
  const numRoots = (coef) => {
    const n = coef.length - 1;
    if (n < 1) return [];
    if (n === 1) return [-coef[0] / coef[1]];
    const ev = (x) => coef.reduceRight((s, c) => s * x + c, 0);
    const crit = numRoots(coef.slice(1).map((c, i) => c * (i + 1)));
    const B = 1 + Math.max.apply(null, coef.slice(0, n).map((c) => Math.abs(c / coef[n])));
    const pts = [-B].concat(crit.filter((c) => c > -B && c < B), [B]), out = [];
    for (let i = 0; i + 1 < pts.length; i++) {
      let lo = pts[i], hi = pts[i + 1], flo = ev(lo), fhi = ev(hi);
      if (flo === 0) { out.push(lo); continue; }
      if (flo * fhi < 0) {
        for (let it = 0; it < 200; it++) { const mid = (lo + hi) / 2, fm = ev(mid); if (fm === 0) { lo = hi = mid; break; } if (flo * fm < 0) { hi = mid; fhi = fm; } else { lo = mid; flo = fm; } }
        out.push((lo + hi) / 2);
      }
    }
    if (ev(B) === 0) out.push(B);
    return out.filter((x, i) => !i || Math.abs(x - out[i - 1]) > 1e-9);
  };
  const approxReal = (x) => { const r = R.from(Q.fromNumber(Math.round(x * 1e9) / 1e9)); r.ap = true; return r; };   // 近似根：带 ap 标记，显示成 ≈1.259921
  Eqn.realRoots = (d, v) => {
    let a = [];   // 系数，下标是次数
    for (const t of d.terms) { const k = t.m[v] || 0; a[k] = Q.add(a[k] || Q(0), t.c); }
    for (let i = 0; i < a.length; i++) if (!a[i]) a[i] = Q(0);
    const roots = [], addRoot = (r, m) => { const hit = roots.find((x) => R.eq(x.r, r)); if (hit) hit.m += m; else roots.push({ r, m }); };
    let zeros = 0; while (a.length > 1 && a[0].n === 0n) { a.shift(); zeros++; }
    if (zeros) addRoot(R.from(Q(0)), zeros);
    // 化成整数系数
    let den = 1n; for (const c of a) den = (den / gcdBig(den, c.d)) * c.d;
    a = a.map((c) => Q.mul(c, { n: den, d: 1n }));
    const evalAt = (r) => evalCoef(a, r);
    let approx = false;
    for (let guard = 0; guard < 80 && a.length > 3; guard++) {
      const ds0 = ratDivisors(a[0].n), dsn = ratDivisors(a[a.length - 1].n);
      if (!ds0 || !dsn) return { why: '系数太大，暂时解不了' };
      let found = null;
      outer: for (const p of ds0) for (const q of dsn) for (const s of [1, -1]) { const r = Q.div(Q(s * p), Q(q)); if (evalAt(r).n === 0n) { found = r; break outer; } }
      if (!found) break;
      const n = a.length - 1, qd = new Array(n); let carry = Q(0);
      for (let i = n; i >= 1; i--) { carry = Q.add(a[i], Q.mul(carry, found)); qd[i - 1] = carry; }
      a = qd; addRoot(R.from(found), 1);
    }
    const quadRoots = (c) => { const r = Eqn.quadratic(c[2], c[1], c[0]); if (r.kind === 'roots') for (const x of r.roots) addRoot(x, 1); };
    if (a.length > 3) {
      // 没有有理根了：先拆出二次因式，每个二次式精确求根
      const sp = splitQuadratics(a);
      for (const qd of sp.quads) quadRoots(qd);
      a = sp.rest;
      if (a.length > 3) {   // 剩下三次或更高又分不开：数值求根（精确到 9 位小数），结果标近似
        approx = true;
        for (const x of numRoots(a.map((c) => Q.num(c)))) addRoot(approxReal(x), 1);
        a = [];
      }
    }
    if (a.length === 3) quadRoots(a);
    else if (a.length === 2) addRoot(R.from(Q.neg(Q.div(a[0], a[1]))), 1);
    // 二次式重根（判别式 0）会被当成同一个根加两次：重数自然是 2，不用再处理
    roots.sort((x, y) => R.approx(x.r) - R.approx(y.r));
    return { approx, roots, lead: d.terms.reduce((best, t) => ((t.m[v] || 0) >= (best.m[v] || 0) ? t : best), d.terms[0]).c };
  };
  // 符号表：根把数轴分成几段，最右边的符号和首项系数相同，每过一个奇数重数的根符号变一次
  Eqn.solveByRoots = (e, v) => {
    const d = Eqn.diff(e), rr = Eqn.realRoots(d, v);
    if (rr.why) return { kind: 'error', why: rr.why };
    const roots = rr.roots, rel = e.rel, note = rr.approx ? ['剩下的三次或更高的部分分不开：用数值方法求近似根（精确到 9 位小数，结果标 ≈）'] : [];
    if (rel === '=') return { kind: 'ok', approx: rr.approx, set: roots.length ? Solset.items(v, roots.map((x) => x.r)) : Solset.of(v, { none: true }), steps: note.concat([roots.length ? '求出所有根：' + roots.map((x) => R.show(x.r) + (x.m > 1 ? '（重根）' : '')).join('、') : '没有实数根']) };
    const want = rel === '>' || rel === '≥' ? 1 : -1, closed = rel === '≥' || rel === '≤';
    const out = [];
    let sign = rr.lead.n > 0n ? 1 : -1;   // 最右边一段的符号
    // 从右往左：右边的段先处理
    const bounds = roots.slice().reverse();
    let hi = null, hiOpen = true;
    const steps = note.concat(['先求根：' + (roots.length ? roots.map((x) => R.show(x.r)).join('、') : '没有实数根'), '最右边那一段的符号和首项系数一样：' + (sign > 0 ? '正' : '负')]);
    for (const b of bounds) {
      if (sign === want) out.push(seg(b.r, hi, !closed, hiOpen));
      if (closed) out.push(seg(b.r, b.r, false, false));
      hi = b.r; hiOpen = !closed; if (b.m % 2 === 1) sign = -sign;
    }
    if (sign === want) out.push(seg(null, hi, true, hiOpen));
    steps.push('每过一个奇数重数的根，符号变一次；挑出符合“' + rel + ' 0”的段');
    return { kind: 'ok', set: fromSegs(v, out), steps, approx: rr.approx };
  };

  // 解方程 / 解不等式：一元一次（含不等式）、一元二次方程。返回 { kind:'ok', set, steps } | { kind:'error', why }
  Eqn.solve = (e, v) => {
    const d = Eqn.diff(e), others = P.vars(d).filter((x) => x !== v);
    if (others.length) return { kind: 'error', why: '式子里除了 ' + v + ' 还有 ' + others.join('、') + '：先把它们换成数（比如接代入器），或者换一个未知数' };
    const deg = P.degree(d);
    if (deg <= 1) {
      const s = Eqn.solveLinear(e, v);
      if (s.kind === 'solution') return { kind: 'ok', steps: s.steps, set: s.rel === '=' ? Solset.of(v, { items: [R.from(s.value)] }) : Solset.of(v, { iv: Interval.fromLinear(s) }) };
      if (s.kind === 'all') return { kind: 'ok', steps: s.steps, set: Solset.of(v, { all: true }) };
      if (s.kind === 'none') return { kind: 'ok', steps: s.steps, set: Solset.of(v, { none: true }) };
      return { kind: 'error', why: s.why };
    }
    if (deg === 2 && e.rel === '=') {
      const q = Eqn.solveQuadratic(e, v);
      if (q.kind === 'roots') return { kind: 'ok', steps: q.steps, set: Solset.items(v, q.roots) };
      if (q.kind === 'none') return { kind: 'ok', steps: q.steps, set: Solset.of(v, { none: true }) };
      return { kind: 'error', why: q.why };
    }
    // 二次不等式、三次以上：求出所有实根，再用符号表（只要根都能精确写出来）
    const g = Eqn.solveByRoots(e, v);
    if (g.kind !== 'ok') return g;
    return { kind: 'ok', set: g.set, approx: g.approx, steps: g.steps.map((x) => ({ say: x, rule: 'eq.both-sides' })) };
  };

  // ---- 函数 curve：y = f(x)，f 是 x 的多项式。直线、抛物线、一般多项式函数都是它。 ----
  // 一次及以下的 curve 能自动变回“直线”（fn），所以交点、代入、预测这些认直线的器材照样能接。
  // 数、代数式、方程也能直接当函数：数是水平线；代数式（只有一个字母）是 y = 这个式子；方程是 y = 左边 − 右边（它和 x 轴的交点就是解）。
  const toX = (p) => {
    const vs = P.vars(p);
    if (vs.length === 0) return p;
    if (vs.length > 1) return null;
    return vs[0] === 'x' ? p : P.subst(p, vs[0], P.variable('x'));
  };
  const linearOf = (p) => {
    if (P.degree(p) > 1) return null;
    let k = Q(0), b = Q(0);
    for (const t of p.terms) { if (t.m.x) k = Q.add(k, t.c); else b = Q.add(b, t.c); }
    return { k, b };
  };
  const Curve = { toX, linearOf, of: (p) => ({ p }) };
  U.Curve = Curve;
  U.defineKind('curve', {
    label: '函数', color: '#10b981',
    eq: (a, b) => P.eq(a.p, b.p),
    show: (c) => 'y = ' + P.show(c.p),
    brief: (c) => P.show(c.p),
    to: {
      poly: (c) => c.p,
      expr: (c) => c.p,
      eqn: (c) => Eqn.make(c.p, P.const(Q(0)), '='),
      fn: (c) => linearOf(c.p),
    },
  });
  const addTo = (kind, key, f) => { U.KINDS[kind].to = Object.assign({}, U.KINDS[kind].to || {}, { [key]: f }); };
  addTo('num', 'curve', (q) => ({ p: P.const(q) }));
  addTo('fn', 'curve', (f) => ({ p: P.norm([{ c: f.k, m: { x: 1 } }, { c: f.b, m: {} }]) }));
  const polyToCurve = (p) => { const x = toX(p); return x ? { p: x } : null; };
  addTo('poly', 'curve', polyToCurve);
  addTo('expr', 'curve', polyToCurve);
  addTo('eqn', 'curve', (e) => polyToCurve(Eqn.diff(e)));
})(typeof globalThis !== 'undefined' ? globalThis : window);

/* 代数式解析（B.4 的“代数式卡”）：整式，加上「除以一个非零的数」。数字、字母、+ − × * · 空格相乘、括号、乘方 ^n（或 ²³）。
 * 除法（D7）：「/」或「÷」后面必须是一个非零的数，如 a/2、3/4 a、a·h/2；½ ⅓ ¼ ⅔ ¾ 是分数的数，如 ½ × a × h。
 * 除以字母、除以 0 都抛出带原因的错误。系数是精确的有理数。
 * U.Poly.parse('2(x+y)') → poly。遇到不认识的字符抛出带原因的错误。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, P = U.Poly;
  const UFRAC = { '½': [1, 2], '⅓': [1, 3], '⅔': [2, 3], '¼': [1, 4], '¾': [3, 4] };
  const SUPN = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9 };

  P.parse = function (text) {
    const s = String(text).replace(/\s+/g, '').replace(/×/g, '*').replace(/·/g, '*').replace(/÷/g, '/');
    let i = 0;
    const peek = () => s[i];
    const fail = (why) => { throw new Error(why + '（位置 ' + (i + 1) + '）'); };
    const expr = () => {
      let v = term();
      while (peek() === '+' || peek() === '-') { const op = s[i++]; const r = term(); v = op === '+' ? P.add(v, r) : P.sub(v, r); }
      return v;
    };
    const startsFactor = () => /[0-9a-zA-Z(]/.test(peek() || '') || UFRAC[peek()] !== undefined;
    // 除以一个非零的数：除数必须是常数（a/b 不是整式，不认）
    const divide = (v, d) => {
      if (!d.terms.length) fail('不能除以 0');
      if (d.terms.length !== 1 || Object.keys(d.terms[0].m).length) fail('只能除以一个数，例如 /2');
      return P.mul(v, P.const(Q.div(Q(1), d.terms[0].c)));
    };
    const term = () => {
      let v = factor();
      for (;;) {
        if (peek() === '/') { i++; v = divide(v, factor()); continue; }
        if (peek() === '*') { i++; v = P.mul(v, factor()); continue; }
        if (startsFactor()) { v = P.mul(v, factor()); continue; }
        return v;
      }
    };
    const factor = () => {
      let v = unary();
      if (peek() === '^') { i++; const n = num(); if (n === null) fail('乘方要写整数'); v = P.pow(v, n); }
      while (SUPN[peek()] !== undefined) { let n = 0; while (SUPN[peek()] !== undefined) n = n * 10 + SUPN[s[i++]]; v = P.pow(v, n); }
      return v;
    };
    const unary = () => {
      // 乘方比负号先算：-x^2 = -(x²)，负号作用在带乘方的因子上
      if (peek() === '-') { i++; return P.neg(factor()); }
      if (peek() === '+') { i++; return unary(); }
      return primary();
    };
    const num = () => { const m = /^[0-9]+/.exec(s.slice(i)); if (!m) return null; i += m[0].length; return Number(m[0]); };
    const primary = () => {
      const c = peek();
      if (c === undefined) fail('式子没写完');
      if (/[0-9]/.test(c)) { const n = num(); let v = P.const(Q(n)); return v; }
      if (UFRAC[c]) { i++; return P.const(Q(UFRAC[c][0], UFRAC[c][1])); }
      if (/[a-zA-Z]/.test(c)) { i++; return P.variable(c); }
      if (c === '(') { i++; const v = expr(); if (peek() !== ')') fail('括号没有配对'); i++; return v; }
      fail('看不懂这个字符：“' + c + '”');
    };
    if (!s) fail('式子是空的');
    const v = expr();
    if (i < s.length) fail('多出了“' + s[i] + '”');
    return v;
  };

  // 数字卡可以直接接进只收多项式的口
  U.KINDS.num.to = Object.assign({}, U.KINDS.num.to || {}, { poly: (q) => P.const(q) });
})(typeof globalThis !== 'undefined' ? globalThis : window);
