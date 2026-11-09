/* 形式层（任务 F，见 next-steps.md §10.3）。新 kind：form。
 * 形式是一棵式子树：{ op: 'num'|'var'|'add'|'sub'|'mul'|'div'|'pow'|'neg'|'frac'|'group', args: [form…], n?, d?, name? }。
 * 形式不自动化简：2/4 保持 2/4，3x + 2x 保持原样。值（有理数或多项式）由 U.Form.value 随时算出，用来检查前后是否相等。
 * value 和 show 都不改变形式本身。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, P = U.Poly;

  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const bstr = (x) => BigInt(x).toString();
  const big = (x) => BigInt(x);
  const isPoly = (v) => !!v && Array.isArray(v.terms);
  const asPoly = (v) => (isPoly(v) ? v : P.const(v));
  // 接受 BigInt、整数、十进制整数字符串、分数字符串、{n,d} 形式的有理数
  const qOf = (x) => {
    if (x && typeof x === 'object' && 'n' in x) return Q(x.n, x.d === undefined ? 1n : x.d);
    if (typeof x === 'string') return Q.parse(x);
    if (typeof x === 'number' && !Number.isInteger(x)) return Q.fromNumber(x);
    return Q(x);
  };
  const need = (f, k) => {
    const a = f.args || [];
    if (a.length < k) throw new Error(f.op + ' 缺少运算数');
    return a;
  };

  // ---- 求值：内部一律用多项式运算，最后没有字母时还原成有理数 ----
  function ev(f, env) {
    switch (f.op) {
      case 'num': return P.const(qOf(f.n));
      case 'frac': return P.const(Q(f.n, f.d));
      case 'var': {
        const name = f.name || 'x';
        if (env && Object.prototype.hasOwnProperty.call(env, name)) {
          const v = env[name];
          return isPoly(v) ? v : P.const(qOf(v));
        }
        return P.variable(name);
      }
      case 'group': return ev(need(f, 1)[0], env);
      case 'add': return f.args.reduce((acc, a) => P.add(acc, ev(a, env)), P.const(Q(0)));
      case 'sub': { const [a, b] = need(f, 2); return P.sub(ev(a, env), ev(b, env)); }
      case 'neg': return P.neg(ev(need(f, 1)[0], env));
      case 'mul': return f.args.reduce((acc, a) => P.mul(acc, ev(a, env)), P.const(Q(1)));
      case 'div': {
        const [a, b] = need(f, 2);
        const x = ev(a, env), y = ev(b, env);
        if (P.vars(y).length) throw new Error('除式含字母，不能化成多项式');
        if (!y.terms.length) throw new Error('除数是 0，不能除');
        return P.mul(x, P.const(Q.div(Q(1), y.terms[0].c)));
      }
      case 'pow': {
        const [a, b] = need(f, 2);
        const base = ev(a, env), e = ev(b, env);
        if (P.vars(e).length) throw new Error('指数必须是数');
        const k = e.terms.length ? e.terms[0].c : Q(0);
        if (k.d !== 1n) throw new Error('指数必须是整数');
        const n = Number(k.n);
        if (n >= 0) return P.pow(base, n);
        if (P.vars(base).length) throw new Error('负指数只能作用于数');
        if (!base.terms.length) throw new Error('0 的负次幂没有定义');
        return P.const(Q.div(Q(1), P.pow(base, -n).terms[0].c));
      }
      default: throw new Error('未知的式子种类：' + f.op);
    }
  }

  // 没有字母：返回有理数；有字母：返回多项式。env 可以代入字母的值（有理数、数或多项式）。
  function value(f, env) {
    const p = ev(f, env || {});
    if (P.vars(p).length) return p;
    return p.terms.length ? p.terms[0].c : Q(0);
  }

  // ---- 显示：保留书写的顺序和括号 ----
  // 优先级：加减 1，取负 2，乘除和分数 3，乘方 4，其余（数、字母、括号）5
  const PREC = { add: 1, sub: 1, neg: 2, mul: 3, div: 3, frac: 3, pow: 4 };
  const prec = (f) => PREC[f.op] || 5;
  const fmtInt = (x) => bstr(x).replace('-', '−');
  const numLike = (f) => f.op === 'num' || f.op === 'frac';
  const wrap = (f, min) => (prec(f) < min ? '(' + show(f) + ')' : show(f));
  function show(f) {
    const a = f.args || [];
    switch (f.op) {
      case 'num': return fmtInt(f.n);
      case 'frac': return fmtInt(f.n) + '/' + fmtInt(f.d);
      case 'var': return f.name || 'x';
      case 'group': return '(' + show(need(f, 1)[0]) + ')';
      case 'neg': return '−' + wrap(need(f, 1)[0], 2);
      case 'add': return a.map((x, i) => (i === 0 ? show(x) : ' + ' + wrap(x, 3))).join('');
      case 'sub': { const [x, y] = need(f, 2); return show(x) + ' − ' + wrap(y, 3); }
      case 'mul': {
        return a.map((x, i) => {
          if (i === 0) return wrap(x, 3);
          return (numLike(x) ? ' × ' : '') + wrap(x, 4);
        }).join('');
      }
      case 'div': { const [x, y] = need(f, 2); return wrap(x, 3) + ' ÷ ' + wrap(y, 4); }
      case 'pow': {
        const [x, e] = need(f, 2);
        const base = wrap(x, 5);
        if (e.op === 'num' && big(e.n) >= 0n) return base + bstr(e.n).split('').map((d) => SUP[+d]).join('');
        return base + '^(' + show(e) + ')';
      }
      default: throw new Error('未知的式子种类：' + f.op);
    }
  }

  // ---- 等价：值相等 ----
  function equivalent(f, g) {
    const a = value(f), b = value(g);
    if (!isPoly(a) && !isPoly(b)) return Q.eq(a, b);
    return P.eq(asPoly(a), asPoly(b));
  }

  // ---- 标准形式判断 ----
  const monoKey = (m) => Object.keys(m).sort().map((v) => v + '^' + m[v]).join('*');
  // 加减号连起来的各项（展开 add、sub；括号和其他运算算作一项）
  const addLeaves = (f) => (f.op === 'add' || f.op === 'sub' ? f.args.flatMap(addLeaves) : [f]);

  function collected(f) {
    const seen = new Set();
    for (const leaf of addLeaves(f)) {
      for (const t of ev(leaf, {}).terms) {
        const k = monoKey(t.m);
        if (seen.has(k)) return false;
        seen.add(k);
      }
    }
    return true;
  }

  function factored(f) {
    let g = f;
    while (g.op === 'group') g = need(g, 1)[0];
    if (g.op !== 'mul' || g.args.length < 2) return false;
    const FAC = ['group', 'add', 'sub', 'num', 'var', 'pow', 'neg'];
    return g.args.every((a) => FAC.includes(a.op)) && g.args.some((a) => a.op === 'group' || a.op === 'add' || a.op === 'sub');
  }

  // 一项是“数字 × 10 的幂”时返回幂次 k，否则返回 null（数字 0 到 9；10 的幂写成 100 或 10²）
  const powK = (x) => {
    if (x.op === 'num' && /^10*$/.test(bstr(x.n))) return bstr(x.n).length - 1;
    if (x.op === 'pow' && x.args[0].op === 'num' && bstr(x.args[0].n) === '10' && x.args[1].op === 'num' && big(x.args[1].n) >= 0n) return Number(x.args[1].n);
    return null;
  };
  function placeTerm(t) {
    if (t.op === 'num') return big(t.n) >= 0n && big(t.n) <= 9n ? 0 : null;
    if (t.op === 'mul' && t.args.length === 2) {
      const [d, p] = t.args;
      if (d.op !== 'num' || big(d.n) < 0n || big(d.n) > 9n) return null;
      return powK(p);
    }
    return null;
  }
  function placeValue(f) {
    let g = f;
    while (g.op === 'group') g = need(g, 1)[0];
    if (g.op !== 'add') return false;
    const ls = (function flat(x) { return x.op === 'add' ? x.args.flatMap(flat) : [x]; })(g);
    if (ls.length < 2) return false;
    const ks = ls.map(placeTerm);
    if (ks.some((k) => k === null)) return false;
    return new Set(ks).size === ks.length;
  }

  function isNormal(f, kind) {
    switch (kind) {
      case 'reduced-fraction': {
        if (f.op !== 'frac') return false;
        const q = Q(f.n, f.d);
        return q.n === big(f.n) && q.d === big(f.d);
      }
      case 'collected': return collected(f);
      case 'factored': return factored(f);
      case 'place-value': return placeValue(f);
      default: throw new Error('未知的标准形式：' + kind);
    }
  }

  // ---- 多项式 ⇄ 形式 ----
  // 有理数 → 形式：整数用 num，分数用 frac（不约分）
  function fromNum(x) {
    const q = qOf(x);
    return q.d === 1n ? { op: 'num', n: q.n } : { op: 'frac', n: q.n, d: q.d };
  }
  function termForm(t) {
    const neg = t.c.n < 0n, mag = Q.abs(t.c);
    const vf = Object.keys(t.m).sort().map((v) => (t.m[v] === 1
      ? { op: 'var', name: v }
      : { op: 'pow', args: [{ op: 'var', name: v }, { op: 'num', n: BigInt(t.m[v]) }] }));
    let body;
    if (!vf.length) body = fromNum(mag);
    else if (Q.eq(mag, Q(1))) body = vf.length === 1 ? vf[0] : { op: 'mul', args: vf };
    else body = { op: 'mul', args: [fromNum(mag)].concat(vf) };
    return { neg, body };
  }
  // 多项式 → 形式：按项的顺序用加减号连起来（降幂排列）
  function fromPoly(p) {
    if (!p.terms.length) return { op: 'num', n: 0n };
    let acc = null;
    for (const t of p.terms) {
      const { neg, body } = termForm(t);
      if (!acc) acc = neg ? { op: 'neg', args: [body] } : body;
      else acc = { op: neg ? 'sub' : 'add', args: [acc, body] };
    }
    return acc;
  }

  // 结构相等用的规范形：数统一成十进制字符串，避免 BigInt 和普通数字混用时判不等
  const canon = (f) => {
    const o = { op: f.op };
    if (f.n !== undefined) o.n = bstr(f.n);
    if (f.d !== undefined) o.d = bstr(f.d);
    if (f.name !== undefined) o.name = f.name;
    if (f.args) o.args = f.args.map(canon);
    return o;
  };

  const F = { value, show, equivalent, isNormal, fromNum, fromPoly };
  U.Form = F;

  U.defineKind('form', {
    label: '式子', color: '#c084fc',
    eq: (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b)),
    show: (f) => show(f),
    brief: (f) => show(f),
    serialize: (f) => U.JSON.stringify(f),
    parse: (s) => U.JSON.parse(typeof s === 'string' ? s : U.JSON.stringify(s)),
    to: {
      num: (f) => { try { const v = value(f); return isPoly(v) ? null : v; } catch (e) { return null; } },
      poly: (f) => { try { return asPoly(value(f)); } catch (e) { return null; } },
    },
  });
  U.KINDS.num.to = Object.assign({}, U.KINDS.num.to || {}, { form: (q) => fromNum(q) });
  U.KINDS.poly.to = Object.assign({}, U.KINDS.poly.to || {}, { form: (p) => fromPoly(p) });
})(typeof globalThis !== 'undefined' ? globalThis : window);
