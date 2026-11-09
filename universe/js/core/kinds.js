/* 值类型注册表 KINDS。加一种新类型只改这里（或某个器材包里调 U.defineKind），内核不写 if(kind===…)。
 * 每种 kind 必须有 label / eq / show；可选 to（可自动转换到哪些 kind）、color（界面连线与端口颜色）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q;
  U.KINDS = {};
  // 1.7：每种 kind 都要能存档、读回（默认按 JSON 往返；值只能是普通数据）
  U.defineKind = (id, def) => {
    def.id = id;
    if (!def.serialize) def.serialize = (v) => JSON.parse(JSON.stringify(v));
    if (!def.parse) def.parse = (s) => JSON.parse(JSON.stringify(s));
    U.KINDS[id] = def; return def;
  };
  // 注册表 lint：每种 kind 必须有 eq / show，且存档往返后相等
  U.lintKind = (def) => {
    const errors = [];
    if (typeof def.label !== 'string') errors.push('缺 label');
    if (typeof def.eq !== 'function') errors.push('缺 eq');
    if (typeof def.show !== 'function') errors.push('缺 show');
    if (typeof def.serialize !== 'function' || typeof def.parse !== 'function') errors.push('缺 serialize/parse');
    return errors;
  };

  // 带类型的值：{kind, data, dim, exact}。exact=false 表示近似（浮点、取样），界面上带 ≈。
  U.val = (kind, data, o) => ({ kind, data, dim: (o && o.dim) || null, exact: !(o && o.exact === false) });
  U.vals = (arr) => (arr || []).filter(Boolean);

  // toProp(v, P)：这种值能不能填进属性 P（连线驱动属性时调用）。返回 {ok, v} 或 {ok:false, why}；不实现 = 不能驱动。
  U.defineKind('num', { label: '数', color: '#3b9bff', eq: (a, b) => Q.eq(a, b), show: (a) => Q.show(a), approx: (a) => Q.showDec(a, 3), showApprox: (a) => Q.showDec(a, 4),
    toProp: (v, P) => U.coerceProp(P, v.data) });
  U.defineKind('bool', { label: '真假', color: '#f5a524', eq: (a, b) => a === b, show: (a) => (a ? '是' : '否'),
    toProp: (v, P) => (P.type === 'bool' ? { ok: true, v: v.data } : { ok: false, silent: true, why: '真假值只能填进开关' }) });
  U.defineKind('dist', {
    label: '分布', color: '#a78bfa',
    eq: (a, b) => a.lo === b.lo && a.counts.length === b.counts.length && a.counts.every((c, i) => c === b.counts[i]),
    show: (a) => '共 ' + a.counts.reduce((s, c) => s + c, 0) + ' 次',
  });
  U.defineKind('fn', {
    label: '直线', color: '#34d399',
    eq: (a, b) => Q.eq(a.k, b.k) && Q.eq(a.b, b.b),
    show: (f) => {
      const k = f.k, b = f.b;
      const kx = k.n === 0 ? '' : Q.eq(k, Q(1)) ? 'x' : Q.eq(k, Q(-1)) ? '−x' : (k.n < 0 ? '−' : '') + Q.show(Q(Math.abs(k.n), k.d)) + 'x';
      const bs = b.n === 0 ? (kx ? '' : '0') : (kx ? (b.n < 0 ? ' − ' : ' + ') : (b.n < 0 ? '−' : '')) + Q.show(Q(Math.abs(b.n), b.d));
      return 'y = ' + kx + bs;
    },
  });
  U.defineKind('point', { label: '点', color: '#fb7185', eq: (a, b) => Q.eq(a.x, b.x) && Q.eq(a.y, b.y), show: (p) => '(' + Q.show(p.x) + ', ' + Q.show(p.y) + ')' });
  U.defineKind('seq', { label: '数列', color: '#f472b6', eq: (a, b) => a.length === b.length && a.every((x, i) => x === b[i]), show: (a) => '共 ' + a.length + ' 项' });

  // 符号精确数（1.7 real，裁决 #7：只做 a + b√c 与 π 的有理倍数）。
  // 值 = { a: 有理数, b: 有理数, c: 无平方因子的正整数（c=1 表示无根式）, p: 有理数（π 的系数） }。
  // 不能表示的运算（如 √2 + √3）返回 null，由调用方说明原因；内核不做一般代数数。
  const sqfree = (m) => { // m = s² · r，返回 {s, r}
    let s = 1, r = m;
    for (let f = 2; f * f <= r; f++) while (r % (f * f) === 0) { r /= f * f; s *= f; }
    return { s, r };
  };
  const R = {
    from: (q) => ({ a: q, b: Q(0), c: 1, p: Q(0) }),
    pi: (q) => ({ a: Q(0), b: Q(0), c: 1, p: q }),
    // √q（q 为非负有理数）：√(n/d) = s√(r·d)/d
    sqrt(q) {
      if (q.n < 0) return null;
      if (q.n === 0) return R.from(Q(0));
      const { s, r } = sqfree(q.n * q.d);
      return R.norm({ a: Q(0), b: Q(s, q.d), c: r, p: Q(0) });
    },
    add(x, y) {
      if (!(x.b.n === 0 || y.b.n === 0 || x.c === y.c)) return null;
      const c = x.b.n !== 0 ? x.c : y.c;
      return R.norm({ a: Q.add(x.a, y.a), b: Q.add(x.b, y.b), c, p: Q.add(x.p, y.p) });
    },
    mul(x, y) {
      if (!(x.b.n === 0 || y.b.n === 0 || x.c === y.c)) return null;
      const c = x.b.n !== 0 ? x.c : y.c;
      const same = x.b.n !== 0 && y.b.n !== 0; // √c·√c = c（同一根式）
      const a = Q.add(Q.mul(x.a, y.a), same ? Q.mul(Q.mul(x.b, y.b), Q(x.c)) : Q(0));
      const b = Q.add(Q.mul(x.a, y.b), Q.mul(x.b, y.a));
      // π 只能乘有理数：π·√c、π·π 不在这个形式里，返回 null
      if (x.p.n !== 0 && (y.b.n !== 0 || y.p.n !== 0)) return null;
      if (y.p.n !== 0 && (x.b.n !== 0 || x.p.n !== 0)) return null;
      const p = Q.add(Q.mul(x.a, y.p), Q.mul(x.p, y.a));
      return R.norm({ a, b, c, p });
    },
    // 规范化：根式系数为 0 时 c 归一为 1；c 是 1 时把 b 并入 a
    norm(v) {
      if (v.b.n === 0) v.c = 1;
      if (v.c === 1 && v.b.n !== 0) { v.a = Q.add(v.a, v.b); v.b = Q(0); }
      return v;
    },
    approx: (v) => v.a.n / v.a.d + (v.b.n / v.b.d) * Math.sqrt(v.c) + (v.p.n / v.p.d) * Math.PI,
    show(v) {
      // 每一项写成 [符号, 文字]，第一项不带前导加号，之后用 " + " 或 " − " 连接
      const terms = [];
      const term = (x, body) => {
        if (x.n === 0) return;
        const mag = Math.abs(x.n), coef = Q.eq(Q(mag, x.d), Q(1)) ? '' : Q.show(Q(mag, x.d));
        terms.push({ neg: x.n < 0, text: coef + body });
      };
      if (v.a.n !== 0) terms.push({ neg: v.a.n < 0, text: Q.show(Q(Math.abs(v.a.n), v.a.d)) });
      term(v.b, '√' + v.c);
      term(v.p, 'π');
      if (!terms.length) return '0';
      return terms.map((t, i) => (i === 0 ? (t.neg ? '−' : '') : (t.neg ? ' − ' : ' + ')) + t.text).join('');
    },
  };
  U.Real = R;
  U.defineKind('real', {
    label: '符号数', color: '#22d3ee', exact: true,
    eq: (a, b) => Q.eq(a.a, b.a) && Q.eq(a.b, b.b) && a.c === b.c && Q.eq(a.p, b.p),
    show: (v) => R.show(v),
    showApprox: (v) => { const x = R.approx(v); return (Math.round(x * 1e4) / 1e4).toString(); },
  });
  // 有理数可以无损进入符号数（num → real）
  U.KINDS.num.to = Object.assign({}, U.KINDS.num.to || {}, { real: (q) => R.from(q) });

  U.kindOK = (src, dst) => src === dst || dst === 'any' || !!(U.KINDS[src] && U.KINDS[src].to && U.KINDS[src].to[dst]);
  U.kindName = (k) => (U.KINDS[k] ? U.KINDS[k].label : k);
  U.kindColor = (k) => (U.KINDS[k] ? U.KINDS[k].color : '#94a3b8');
  // 值的文字表示（读数、连线气泡）。近似值带 ≈。
  U.showVal = (v) => {
    if (!v) return '—';
    const K = U.KINDS[v.kind];
    const s = v.exact === false && K && K.showApprox ? K.showApprox(v.data) : K ? K.show(v.data) : String(v.data);
    return (v.exact === false ? '≈' : '') + s;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
