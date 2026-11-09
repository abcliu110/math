/* 序列表达式（证明器材的归纳与自定义规则用）。
 * 一个序列表达式是若干项之和，每项 = r^n · p(n)：r 是有理数（r = 1 时就是多项式），p 是 n 的多项式。
 * 例：n(n+1)/2 → [{r:1, p: n²/2 + n/2}]；2^n − 1 → [{r:2, p:1}, {r:1, p:−1}]。
 * 能做：加减、乘、除以整数、n 换成 n+1（平移）、代入整数 k（精确）、判断两个式子是否恒等（对所有 n）。
 * 语法：数字、n、+ − * / 空格相乘、括号、乘方 ^ 整数，或 ^ 后面跟 n、(n)、(n+c)、(n-c)（指数式，底数必须是数字）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, P = U.Poly;

  const N = P.variable('n');
  const one = Q(1);
  const key = (r) => r.n + '/' + r.d;

  // 合并同底数的项，去掉多项式为零的项
  function norm(terms) {
    const acc = {};
    for (const t of terms) {
      const k = key(t.r);
      acc[k] = acc[k] ? { r: t.r, p: P.add(acc[k].p, t.p) } : { r: t.r, p: t.p };
    }
    return Object.values(acc).filter((t) => t.p.terms.length > 0);
  }

  const Seq = {
    const(q) { return norm([{ r: one, p: P.const(q) }]); },
    n() { return norm([{ r: one, p: N }]); },
    add(a, b) { return norm(a.concat(b)); },
    neg(a) { return a.map((t) => ({ r: t.r, p: P.neg(t.p) })); },
    sub(a, b) { return norm(a.concat(Seq.neg(b))); },
    mul(a, b) {
      const out = [];
      for (const x of a) for (const y of b) out.push({ r: Q.mul(x.r, y.r), p: P.mul(x.p, y.p) });
      return norm(out);
    },
    scale(a, q) { return norm(a.map((t) => ({ r: t.r, p: P.mul(P.const(q), t.p) }))); },
    // n → n+1：r^n·p(n) 变成 r^n·(r·p(n+1))
    shift(a) {
      return norm(a.map((t) => ({ r: t.r, p: P.mul(P.const(t.r), P.subst(t.p, 'n', P.add(N, P.const(one)))) })));
    },
    // 代入整数 k（精确有理数）
    at(a, k) {
      const kq = Q(k);
      let s = Q(0);
      for (const t of a) {
        const pv = P.evalQ(t.p, { n: kq });
        s = Q.add(s, Q.mul(pv, Seq.powQ(t.r, k)));
      }
      return s;
    },
    powQ(r, k) {
      let x = one;
      const base = k >= 0 ? r : Q(r.d, r.n);
      for (let i = 0; i < Math.abs(k); i++) x = Q.mul(x, base);
      return x;
    },
    // 对所有 n 恒等：规范化后没有任何项
    identical(a, b) { return Seq.sub(a, b).length === 0; },
    isPolynomial(a) { return a.every((t) => Q.eq(t.r, one)); },
  };
  U.Seq = Seq;

  // ---- 解析 ----
  Seq.parse = function (text) {
    const s = String(text).replace(/\s+/g, '').replace(/×/g, '*').replace(/·/g, '*');
    let i = 0;
    const fail = (why) => { throw new Error(why + '（位置 ' + (i + 1) + '）'); };
    const peek = () => s[i];
    const isNum = (c) => c !== undefined && /[0-9]/.test(c);
    const startsFactor = () => { const c = peek(); return c !== undefined && (isNum(c) || c === 'n' || c === '('); };
    const expr = () => {
      let v = term();
      while (peek() === '+' || peek() === '-') { const op = s[i++]; const r = term(); v = op === '+' ? Seq.add(v, r) : Seq.sub(v, r); }
      return v;
    };
    const term = () => {
      let v = factor();
      for (;;) {
        if (peek() === '*') { i++; v = Seq.mul(v, factor()); }
        else if (peek() === '/') {
          i++; const m = /^[0-9]+/.exec(s.slice(i)); if (!m) fail('除号后面要写整数');
          i += m[0].length; const d = Number(m[0]); if (d === 0) fail('不能除以 0');
          v = Seq.scale(v, Q(1, d));
        } else if (startsFactor()) v = Seq.mul(v, factor());
        else break;
      }
      return v;
    };
    const factor = () => {
      let v = unary();
      if (peek() === '^') {
        i++;
        // 指数是 n、(n)、(n+c)、(n-c)：指数式
        const ex = /^\((n(?:[+-][0-9]+)?)\)|^(n)(?![0-9a-zA-Z])/.exec(s.slice(i));
        if (ex) {
          i += ex[0].length;
          const off = /[+-][0-9]+/.exec(ex[1] || ex[2]);
          const c = off ? Number(off[0]) : 0;
          if (!(v.length === 1 && Q.eq(v[0].r, one) && v[0].p.terms.length === 1 && v[0].p.terms[0].c && !Object.keys(v[0].p.terms[0].m).length)) fail('指数式的底数必须是数字');
          const base = v[0].p.terms[0].c;
          const pw = Seq.powQ(base, c);
          return [{ r: base, p: P.const(pw) }];
        }
        const m = /^[0-9]+/.exec(s.slice(i));
        if (!m) fail('乘方要写整数或 n');
        i += m[0].length;
        let out = Seq.const(one);
        for (let k = 0; k < Number(m[0]); k++) out = Seq.mul(out, v);
        return out;
      }
      return v;
    };
    const unary = () => {
      if (peek() === '-') { i++; return Seq.neg(unary()); }
      if (peek() === '+') { i++; return unary(); }
      return primary();
    };
    const primary = () => {
      const c = peek();
      if (c === undefined) fail('式子没写完');
      if (isNum(c)) { const m = /^[0-9]+/.exec(s.slice(i)); i += m[0].length; return Seq.const(Q(Number(m[0]))); }
      if (c === 'n') { i++; return Seq.n(); }
      if (c === '(') { i++; const v = expr(); if (peek() !== ')') fail('括号没有配对'); i++; return v; }
      fail('看不懂这个字符：“' + c + '”');
    };
    if (!s) fail('式子是空的');
    const v = expr();
    if (i < s.length) fail('多出了“' + s[i] + '”');
    return v;
  };

  // ---- 用户自己写的规则：“2n+1 是质数”“n^2+n 是偶数”“2^n > n” ----
  // 返回判断函数 n → 真假；写错时抛出说明
  Seq.compileRule = function (text) {
    const t = String(text).trim();
    const pred = t.match(/^(.+?)\s*是\s*(质数|素数|偶数|奇数|完全平方数)$/);
    if (pred) {
      const e = Seq.parse(pred[1]);
      const kind = pred[2];
      return (k) => {
        const v = Seq.at(e, k);
        if (v.d !== 1) return false;
        const x = v.n;
        if (kind === '偶数') return x % 2 === 0;
        if (kind === '奇数') return Math.abs(x) % 2 === 1;
        if (kind === '完全平方数') return x >= 0 && Math.round(Math.sqrt(x)) ** 2 === x;
        if (x < 2) return false;
        for (let d = 2; d * d <= x; d++) if (x % d === 0) return false;
        return true;
      };
    }
    const rel = t.match(/^(.+?)\s*(>=|≥|<=|≤|>|<|=)\s*(.+)$/);
    if (rel) {
      const a = Seq.parse(rel[1]), b = Seq.parse(rel[3]), op = rel[2];
      return (k) => {
        const c = Q.cmp(Seq.at(a, k), Seq.at(b, k));
        if (op === '=') return c === 0;
        if (op === '>') return c > 0;
        if (op === '<') return c < 0;
        if (op === '>=' || op === '≥') return c >= 0;
        return c <= 0;
      };
    }
    throw new Error('规则要写成“式子 是质数／偶数／奇数／完全平方数”，或“式子 > 式子”这样的比较');
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
