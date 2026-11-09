/* 多元多项式（任务 B.2，见 next-steps.md §3.2）。新 kind：poly。
 * 值 = { terms: [ { c: 有理数, m: { 变量: 指数 } }, … ] }，规范化：合并同类项、去掉系数为 0 的项、
 * 指数 ≥ 1、项按次数降序排列。兼容：一元 expr（系数数组）可以无损转换成 poly。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q;

  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const sup = (n) => String(n).split('').map((d) => SUP[+d]).join('');
  const mkey = (m) => Object.keys(m).sort().map((v) => (m[v] === 1 ? v : v + '^' + m[v])).join('*');
  const deg = (m) => Object.values(m).reduce((s, x) => s + x, 0);
  // 同次数时按字典序：先比字母靠前的变量的指数（x² 排在 xy 前面）
  function cmpLex(a, b) {
    const vs = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
    for (const v of vs) { const d = (b[v] || 0) - (a[v] || 0); if (d) return d; }
    return 0;
  }

  const P = {
    norm(list) {
      const acc = {};
      for (const t of list) {
        const m = {}; for (const v of Object.keys(t.m || {})) if (t.m[v] > 0) m[v] = t.m[v];
        const k = mkey(m);
        acc[k] = acc[k] ? { c: Q.add(acc[k].c, t.c), m } : { c: t.c, m };
      }
      const terms = Object.values(acc).filter((t) => t.c.n !== 0);
      terms.sort((a, b) => deg(b.m) - deg(a.m) || cmpLex(a.m, b.m));
      return { terms };
    },
    const(q) { return P.norm([{ c: q, m: {} }]); },
    variable(name) { return P.norm([{ c: Q(1), m: { [name]: 1 } }]); },
    add(a, b) { return P.norm(a.terms.concat(b.terms)); },
    neg(a) { return P.norm(a.terms.map((t) => ({ c: Q.neg(t.c), m: t.m }))); },
    sub(a, b) { return P.add(a, P.neg(b)); },
    mul(a, b) {
      const out = [];
      for (const x of a.terms) for (const y of b.terms) {
        const m = Object.assign({}, x.m); for (const v of Object.keys(y.m)) m[v] = (m[v] || 0) + y.m[v];
        out.push({ c: Q.mul(x.c, y.c), m });
      }
      return P.norm(out);
    },
    pow(a, n) { let r = P.const(Q(1)); for (let i = 0; i < n; i++) r = P.mul(r, a); return r; },
    vars(a) { const s = new Set(); a.terms.forEach((t) => Object.keys(t.m).forEach((v) => s.add(v))); return [...s].sort(); },
    degree(a) { return a.terms.reduce((mx, t) => Math.max(mx, deg(t.m)), a.terms.length ? 0 : -1); },
    eq(a, b) { return a.terms.length === b.terms.length && a.terms.every((t, i) => Q.eq(t.c, b.terms[i].c) && mkey(t.m) === mkey(b.terms[i].m)); },
    // 把某个变量换成多项式（或数）：subst(p, 'x', q)
    subst(a, v, val) {
      const r = a.terms.map((t) => {
        const m = Object.assign({}, t.m), k = m[v] || 0; delete m[v];
        return { c: t.c, m, _k: k };
      });
      let out = P.norm([]);
      for (const t of r) {
        let term = P.norm([{ c: t.c, m: t.m }]);
        if (t._k) term = P.mul(term, P.pow(val.terms ? val : P.const(val), t._k));
        out = P.add(out, term);
      }
      return out;
    },
    // 代入数值：env = { x: Q, y: Q }，结果是一个有理数（缺的变量报错）
    evalQ(a, env) {
      let s = Q(0);
      for (const t of a.terms) {
        let term = t.c;
        for (const v of Object.keys(t.m)) { if (!(v in env)) throw new Error('缺变量 ' + v); for (let i = 0; i < t.m[v]; i++) term = Q.mul(term, env[v]); }
        s = Q.add(s, term);
      }
      return s;
    },
    show(a) {
      if (!a.terms.length) return '0';
      return a.terms.map((t, i) => {
        const neg = t.c.n < 0, mag = Q(Math.abs(t.c.n), t.c.d);
        const vs = Object.keys(t.m).sort().map((v) => v + (t.m[v] > 1 ? sup(t.m[v]) : ''));
        const coef = Q.eq(mag, Q(1)) && vs.length ? '' : Q.show(mag);
        const body = coef + vs.join('·');
        return (i === 0 ? (neg ? '−' : '') : (neg ? ' − ' : ' + ')) + body;
      }).join('');
    },
    // 一元 expr（系数数组）→ poly；poly → expr（只有一个变量或没有变量时）
    fromExpr(c, v) { v = v || 'x'; return P.norm(c.map((q, i) => ({ c: q, m: i ? { [v]: i } : {} }))); },
    toExpr(a) {
      const vs = P.vars(a);
      if (vs.length > 1) return null;
      const v = vs[0] || 'x', out = [];
      for (const t of a.terms) { const i = t.m[v] || 0; while (out.length <= i) out.push(Q(0)); out[i] = Q.add(out[i], t.c); }
      return out;
    },

    // ---- 多元整除与最大公因式（约分用）----
    // 字典序（字母按字母顺序）下最大的那一项
    lead(a) { let best = null; for (const t of a.terms) if (!best || cmpLex(t.m, best.m) < 0) best = t; return best; },
    // 单项式相除：整除返回商的指数，不整除返回 null
    monoDiv(ma, mb) {
      const out = {};
      for (const v of new Set([...Object.keys(ma), ...Object.keys(mb)])) {
        const d = (ma[v] || 0) - (mb[v] || 0);
        if (d < 0) return null;
        if (d) out[v] = d;
      }
      return out;
    },
    // 精确整除：a = q·b 时返回 q，否则返回 null（单个除式时余数为 0 ⇔ 整除）
    divExact(a, b) {
      if (!b.terms.length) return null;
      const lb = P.lead(b), q = [];
      let r = a;
      for (let guard = 0; r.terms.length; guard++) {
        if (guard > 5000) return null;
        const lr = P.lead(r), m = P.monoDiv(lr.m, lb.m);
        if (!m) return null;
        const term = { c: Q.div(lr.c, lb.c), m };
        q.push(term);
        const prod = b.terms.map((t) => { const mm = Object.assign({}, t.m); for (const v of Object.keys(term.m)) mm[v] = (mm[v] || 0) + term.m[v]; return { c: Q.mul(t.c, term.c), m: mm }; });
        r = P.sub(r, P.norm(prod));
      }
      return P.norm(q);
    },
    degIn(a, v) { return a.terms.reduce((mx, t) => Math.max(mx, t.m[v] || 0), a.terms.length ? 0 : -1); },
    // 按 v 的次数拆成系数（下标是次数，系数是不含 v 的多项式）
    coeffsIn(a, v) {
      const byPow = [];
      for (const t of a.terms) {
        const k = t.m[v] || 0, m = Object.assign({}, t.m); delete m[v];
        (byPow[k] = byPow[k] || []).push({ c: t.c, m });
      }
      const out = [];
      for (let k = 0; k < byPow.length; k++) out.push(P.norm(byPow[k] || []));
      return out;
    },
    // 关于 v 的内容：各系数的最大公因式（常数之间的公因式视为 1，因为非零常数在 Q 上都是单位）
    content(a, v) {
      const cs = P.coeffsIn(a, v).filter((c) => c.terms.length);
      if (!cs.length) return P.const(Q(1));
      return cs.reduce((g, c) => P.gcd(g, c));
    },
    // 伪余数：(lc_b)^k·a 减去 ... 不做除法，所以系数仍是多项式
    prem(a, b, v) {
      const db = P.degIn(b, v), lb = P.coeffsIn(b, v).pop(), xv = P.variable(v);
      let r = a;
      while (r.terms.length && P.degIn(r, v) >= db) {
        const dr = P.degIn(r, v), lr = P.coeffsIn(r, v).pop();
        r = P.sub(P.mul(lb, r), P.mul(P.mul(lr, P.pow(xv, dr - db)), b));
      }
      return r;
    },
    // 首项系数化成 1（只改常数倍，不改式子本身）
    monic(a) { if (!a.terms.length) return a; return P.mul(a, P.const(Q.div(Q(1), P.lead(a).c))); },
    // 最大公因式（首项系数为 1）：内容的公因式 × 本原部分的公因式（本原部分用伪余数求）
    gcd(f, g) {
      if (!f.terms.length) return P.monic(g);
      if (!g.terms.length) return P.monic(f);
      const vs = [...new Set(P.vars(f).concat(P.vars(g)))].sort();
      if (!vs.length || !P.vars(f).length || !P.vars(g).length) return P.const(Q(1));
      const v = vs[0];
      const cf = P.content(f, v), cg = P.content(g, v);
      const c = P.gcd(cf, cg);
      let a = P.divExact(f, cf), b = P.divExact(g, cg);
      if (P.degIn(a, v) < P.degIn(b, v)) { const t = a; a = b; b = t; }
      let gp;
      for (;;) {
        if (P.degIn(b, v) <= 0) { gp = P.const(Q(1)); break; }
        const r = P.prem(a, b, v);
        if (!r.terms.length) { gp = b; break; }
        const pr = P.divExact(r, P.content(r, v));
        if (!pr) { gp = P.const(Q(1)); break; }   // 不应发生；保守地当作互素
        a = b; b = pr;
      }
      return P.monic(P.mul(c, gp));
    },
  };
  U.Poly = P;

  U.defineKind('poly', {
    label: '多项式', color: '#f97316',
    eq: (a, b) => P.eq(a, b),
    show: (a) => P.show(a),
    showApprox: (a) => P.show(a),
    brief: (a) => P.show(a),
  });
  // 代数式（expr）与多项式是同一种表示，可以有多个字母，互相转换不丢信息（旧的一元系数数组已不再使用）
  U.defineKind('expr', {
    label: '代数式', color: '#fb923c',
    eq: (a, b) => P.eq(a, b),
    show: (a) => P.show(a),
    showApprox: (a) => P.show(a),
    brief: (a) => P.show(a),
    to: { poly: (a) => a },
  });
  U.KINDS.poly.to = Object.assign({}, U.KINDS.poly.to || {}, { expr: (a) => a });
})(typeof globalThis !== 'undefined' ? globalThis : window);
