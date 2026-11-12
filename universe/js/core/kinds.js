/* 值类型注册表 KINDS。加一种新类型只改这里（或某个器材包里调 U.defineKind），内核不写 if(kind===…)。
 * 每种 kind 必须有 label / eq / show；可选 to（可自动转换到哪些 kind）、color（界面连线与端口颜色）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q;
  U.KINDS = {};
  // 1.7：每种 kind 都要能存档、读回（默认按 JSON 往返；值只能是普通数据）
  U.defineKind = (id, def) => {
    def.id = id;
    if (!def.serialize) def.serialize = (v) => U.JSON.parse(U.JSON.stringify(v));
    if (!def.parse) def.parse = (s) => U.JSON.parse(U.JSON.stringify(s));
    U.KINDS[id] = def; return def;
  };
  // 注册表 lint：每种 kind 必须有 eq / show，且存档往返后相等
  U.lintKind = (def) => {
    const errors = [];
    if (typeof def.label !== 'string') errors.push('缺 label');
    if (typeof def.eq !== 'function') errors.push('缺 eq');
    if (typeof def.show !== 'function') errors.push('缺 show');
    if (typeof def.serialize !== 'function' || typeof def.parse !== 'function') errors.push('缺 serialize/parse');
    for (const k of Object.keys(def.to || {})) if (typeof def.to[k] !== 'function') errors.push('to.' + k + ' 要是转换函数');
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
      const kx = k.n === 0n ? '' : Q.eq(k, Q(1)) ? 'x' : Q.eq(k, Q(-1)) ? '−x' : (k.n < 0n ? '−' : '') + Q.show(Q.abs(k)) + 'x';
      const bs = b.n === 0n ? (kx ? '' : '0') : (kx ? (b.n < 0n ? ' − ' : ' + ') : (b.n < 0n ? '−' : '')) + Q.show(Q.abs(b));
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
      if (q.n < 0n) return null;
      if (q.n === 0n) return R.from(Q(0));
      const m = q.n * q.d;
      if (m > BigInt(Number.MAX_SAFE_INTEGER)) return null; // 根号里的数太大，不做精确化简
      const { s, r } = sqfree(Number(m));
      return R.norm({ a: Q(0), b: Q(s, q.d), c: r, p: Q(0) });
    },
    add(x, y) {
      if (!(x.b.n === 0n || y.b.n === 0n || x.c === y.c)) return null;
      const c = x.b.n !== 0n ? x.c : y.c;
      return R.norm({ a: Q.add(x.a, y.a), b: Q.add(x.b, y.b), c, p: Q.add(x.p, y.p) });
    },
    mul(x, y) {
      if (!(x.b.n === 0n || y.b.n === 0n || x.c === y.c)) return null;
      const c = x.b.n !== 0n ? x.c : y.c;
      const same = x.b.n !== 0n && y.b.n !== 0n; // √c·√c = c（同一根式）
      const a = Q.add(Q.mul(x.a, y.a), same ? Q.mul(Q.mul(x.b, y.b), Q(x.c)) : Q(0));
      const b = Q.add(Q.mul(x.a, y.b), Q.mul(x.b, y.a));
      // π 只能乘有理数：π·√c、π·π 不在这个形式里，返回 null
      if (x.p.n !== 0n && (y.b.n !== 0n || y.p.n !== 0n)) return null;
      if (y.p.n !== 0n && (x.b.n !== 0n || x.p.n !== 0n)) return null;
      const p = Q.add(Q.mul(x.a, y.p), Q.mul(x.p, y.a));
      return R.norm({ a, b, c, p });
    },
    // 规范化：根式系数为 0 时 c 归一为 1；c 是 1 时把 b 并入 a
    norm(v) {
      if (v.b.n === 0n) v.c = 1;
      if (v.c === 1 && v.b.n !== 0n) { v.a = Q.add(v.a, v.b); v.b = Q(0); }
      return v;
    },
    approx: (v) => U.Q.num(v.a) + U.Q.num(v.b) * Math.sqrt(v.c) + U.Q.num(v.p) * Math.PI,
    show(v) {
      if (v.ap) return (Q.showDec(v.a, 6) + '').replace('-', '−');   // 数值求出的近似根：直接写小数（外面再标 ≈）
      // 每一项写成 [符号, 文字]，第一项不带前导加号，之后用 " + " 或 " − " 连接
      const terms = [];
      const term = (x, body) => {
        if (x.n === 0n) return;
        const ax = Q.abs(x), coef = Q.eq(ax, Q(1)) ? '' : Q.show(ax);
        terms.push({ neg: x.n < 0n, text: coef + body });
      };
      if (v.a.n !== 0n) terms.push({ neg: v.a.n < 0n, text: Q.show(Q.abs(v.a)) });
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
  R.eq = (a, b) => Q.eq(a.a, b.a) && Q.eq(a.b, b.b) && a.c === b.c && Q.eq(a.p, b.p);

  // 符号点（任务 J，§10.7）：{x, y} 两个坐标都是符号数。每个坐标各自最多一个根式（如 2 + √3），
  // 所以抛物线的顶点、与坐标轴的交点都能精确写出。混用两个不同根式（如 √2 + √3）时，单个坐标精确表示不了：
  // 退回近似值（四位小数的有理数），标 exact:false，显示带 ≈。
  const toReal = (v) => (v && typeof v === 'object' && 'c' in v ? v : v && typeof v === 'object' && 'n' in v ? R.from(v) : R.from(Q.fromNumber(v)));
  const approxReal = (x) => R.from(Q.fromNumber(Math.round(x * 1e6) / 1e6));
  U.SPoint = {
    // 精确的符号点（x、y 可以是符号数、有理数或整数）
    of(x, y) { return U.val('spoint', { x: toReal(x), y: toReal(y) }); },
    // 从近似的浮点数得到近似点（标 ≈）
    approx(x, y) { return U.val('spoint', { x: approxReal(x), y: approxReal(y) }, { exact: false }); },
    // 两点相加（坐标逐个加）。某个坐标两个根式混用：该坐标退回近似，整个点标 ≈
    add(p, q) {
      let exact = p.exact !== false && q.exact !== false;
      const one = (a, b) => {
        const s = R.add(a, b);
        if (s) return s;
        exact = false;
        return approxReal(R.approx(a) + R.approx(b));
      };
      const x = one(p.data.x, q.data.x), y = one(p.data.y, q.data.y);
      return U.val('spoint', { x, y }, { exact });
    },
  };
  U.defineKind('spoint', {
    label: '符号点', color: '#fb7185', exact: true,
    eq: (a, b) => R.eq(a.x, b.x) && R.eq(a.y, b.y),
    show: (p) => '(' + R.show(p.x) + ', ' + R.show(p.y) + ')',
    showApprox: (p) => '(' + (Math.round(R.approx(p.x) * 1e4) / 1e4) + ', ' + (Math.round(R.approx(p.y) * 1e4) / 1e4) + ')',
  });

  // 连线气泡用的短文字：kind 可以提供 brief（例如图形只写“三角形”），否则同 showVal
  U.briefVal = (v) => { const K = v && U.KINDS[v.kind]; return K && K.brief ? (v.exact === false ? '≈' : '') + K.brief(v.data) : U.showVal(v); };
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
