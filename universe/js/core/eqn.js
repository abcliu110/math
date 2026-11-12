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
  //  { v: 未知数的名字, items: [符号数…]（几个孤立的解） | iv: 区间 | all: true（所有数都是解） | none: true（无解） }
  //  能自动变成：num（只有一个有理数解时）、interval（区间、单个解、所有数）；区间也能变成解集，所以旧的“解集（区间）”口还能接进新器材。
  const isRat = (r) => r.b.n === 0n && r.p.n === 0n;
  const Solset = {
    of(v, o) { return Object.assign({ v: v || 'x' }, o); },
    items(v, list) {   // 孤立解：按大小排好、去重
      const out = [];
      for (const r of list.slice().sort((a, b) => R.approx(a) - R.approx(b))) if (!out.some((x) => R.eq(x, r))) out.push(r);
      return Solset.of(v, { items: out });
    },
    show(S) {
      const v = S.v || 'x';
      if (S.all) return v + ' 取任何数都行';
      if (S.none) return '无解';
      if (S.items) return S.items.map((r) => v + ' = ' + R.show(r)).join(' 或 ');
      const I = S.iv;
      if (I.lo && I.hi && Q.eq(I.lo, I.hi)) return v + ' = ' + Q.show(I.lo);
      if (I.lo && I.hi) return Q.show(I.lo) + (I.loOpen ? ' < ' : ' ≤ ') + v + (I.hiOpen ? ' < ' : ' ≤ ') + Q.show(I.hi);
      if (I.lo) return v + (I.loOpen ? ' > ' : ' ≥ ') + Q.show(I.lo);
      if (I.hi) return v + (I.hiOpen ? ' < ' : ' ≤ ') + Q.show(I.hi);
      return v + ' 取任何数都行';
    },
    // 一个有理数在不在解集里（符号数的解只在它恰好是有理数时才比得出来）
    contains(S, q) {
      if (S.all) return true;
      if (S.none) return false;
      if (S.iv) return Interval.contains(S.iv, q);
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
  };
  U.Solset = Solset;
  U.defineKind('solset', {
    label: '解集', color: '#84cc16',
    eq: (a, b) => Solset.show(a) === Solset.show(b),
    show: (S) => Solset.show(S),
    to: { num: (S) => Solset.single(S), interval: (S) => Solset.toInterval(S) },
  });
  U.KINDS.interval.to = Object.assign({}, U.KINDS.interval.to || {}, { solset: (I) => Solset.of('x', { iv: I }) });

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
    if (deg === 2) {
      const q = Eqn.solveQuadratic(e, v);
      if (q.kind === 'roots') return { kind: 'ok', steps: q.steps, set: Solset.items(v, q.roots) };
      if (q.kind === 'none') return { kind: 'ok', steps: q.steps, set: Solset.of(v, { none: true }) };
      return { kind: 'error', why: q.why };
    }
    return { kind: 'error', why: '三次以上的方程暂时解不了' };
  };
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
