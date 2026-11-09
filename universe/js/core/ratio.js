/* 有理式（分式）：分子、分母都是多项式（U.Poly，可以有多个字母）。
 * 表示：{ n: 多项式, d: 多项式 }，分母不能是 0 多项式。
 * 能做：加、减、乘、除（除数的分子不能是 0）、判断两个分式相等（交叉相乘后比较）、代入数值（分母为 0 时说明）、
 * 约分（分子分母同除以多元最大公因式，见 U.Poly.gcd；结果的分母首项系数为 1）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, P = U.Poly;

  const isZero = (p) => p.terms.length === 0;
  const isConst = (p) => p.terms.every((t) => Object.keys(t.m).length === 0);
  const ONE = () => P.const(Q(1));

  const R = {
    make(n, d) {
      if (isZero(d)) throw new Error('分母不能是 0');
      return { n, d };
    },
    fromPoly(p) { return { n: p, d: ONE() }; },
    // 分母首项系数化成 1（分子同乘同一个常数，式子的值不变）
    normalize(a) {
      const k = Q.div(Q(1), P.lead(a.d).c);
      return { n: P.mul(a.n, P.const(k)), d: P.mul(a.d, P.const(k)) };
    },
    // 约分：分子、分母同时除以最大公因式；分子是 0 时结果是 0
    simplify(a) {
      if (isZero(a.n)) return { n: P.const(Q(0)), d: ONE() };
      const g = P.gcd(a.n, a.d);
      const n = P.divExact(a.n, g), d = P.divExact(a.d, g);
      if (!n || !d) return R.normalize(a);
      return R.normalize({ n, d });
    },
    add(a, b) { return R.make(P.add(P.mul(a.n, b.d), P.mul(b.n, a.d)), P.mul(a.d, b.d)); },
    sub(a, b) { return R.make(P.sub(P.mul(a.n, b.d), P.mul(b.n, a.d)), P.mul(a.d, b.d)); },
    mul(a, b) { return R.make(P.mul(a.n, b.n), P.mul(a.d, b.d)); },
    div(a, b) {
      if (isZero(b.n)) throw new Error('除数是 0，不能除');
      return R.make(P.mul(a.n, b.d), P.mul(a.d, b.n));
    },
    // 交叉相乘：a.n·b.d = b.n·a.d 时两个分式相等（对所有使分母不为 0 的字母取值）
    eq(a, b) { return P.eq(P.mul(a.n, b.d), P.mul(b.n, a.d)); },
    // 代入：分母为 0 时返回 null（这一点没有定义）
    evalQ(a, env) {
      const d = P.evalQ(a.d, env);
      if (d.n === 0) return null;
      return Q.div(P.evalQ(a.n, env), d);
    },
    // 只有分母是常数时才能化成多项式
    toPoly(a) {
      if (!isConst(a.d)) return null;
      return P.mul(a.n, P.const(Q.div(Q(1), a.d.terms[0].c)));
    },
    show(a) {
      if (isConst(a.d) && Q.eq(a.d.terms[0] ? a.d.terms[0].c : Q(0), Q(1))) return P.show(a.n);
      const wrap = (p) => (p.terms.length > 1 ? '(' + P.show(p) + ')' : P.show(p));
      return wrap(a.n) + '/' + wrap(a.d);
    },
  };
  U.Ratio = R;

  U.defineKind('ratio', {
    label: '分式', color: '#f472b6',
    eq: (a, b) => R.eq(a, b),
    show: (a) => R.show(a),
    showApprox: (a) => R.show(a),
    brief: (a) => R.show(a),
    to: { poly: (a) => R.toPoly(a) },
  });
  U.KINDS.poly.to = Object.assign({}, U.KINDS.poly.to || {}, { ratio: (a) => R.fromPoly(a) });
  U.KINDS.expr.to = Object.assign({}, U.KINDS.expr.to || {}, { ratio: (a) => R.fromPoly(a) });
})(typeof globalThis !== 'undefined' ? globalThis : window);
