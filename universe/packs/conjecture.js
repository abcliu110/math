/* 器材包 conjecture：猜想与反例。学生写一个关于 n 的公式（或相信一个说法），器材替他把 n=1,2,3… 一个个试，
 * 找到第一个反例就停下并亮红。“试了很多都对”只是证据，不是证明——器材每次都这样说。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q.fromNumber(n));

  // 小型表达式解析：数字、n、+ - * / ^ ( )，用精确分数算。
  function parse(src) {
    const t = String(src).replace(/[×·]/g, '*').replace(/÷/g, '/').replace(/\s+/g, '').match(/\d+\.?\d*|[n()+\-*/^]|./g) || [];
    let i = 0;
    const bad = (m) => { throw new Error(m); };
    const atom = () => {
      const x = t[i++];
      if (x === undefined) bad('式子没写完');
      if (x === '(') { const v = add(); if (t[i++] !== ')') bad('括号没配对'); return v; }
      if (x === '-') { const v = atom(); return (n) => Q.mul(Q(-1), v(n)); }
      if (x === 'n') return (n) => Q.fromNumber(n);
      if (/^\d/.test(x)) return () => Q.fromNumber(+x);
      return bad('看不懂“' + x + '”，只能用数字、n 和 + − × ÷ ^ ( )');
    };
    const pow = () => { const b = atom(); if (t[i] === '^') { i++; const e = atom(); return (n) => { const k = Q.num(e(n)); if (!Number.isInteger(k) || k < 0 || k > 8) bad('次方只能是 0~8 的整数'); let r = Q(1); const bv = b(n); for (let j = 0; j < k; j++) r = Q.mul(r, bv); return r; }; } return b; };
    const mul = () => { let l = pow(); while (t[i] === '*' || t[i] === '/' || (t[i] === 'n' || t[i] === '(')) { const op = t[i] === '*' || t[i] === '/' ? t[i++] : '*'; const r = pow(), a = l; l = op === '*' ? (n) => Q.mul(a(n), r(n)) : (n) => { const d = r(n); if (Q.num(d) === 0) bad('除数不能是 0'); return Q.div(a(n), d); }; } return l; };
    const add = () => { let l = mul(); while (t[i] === '+' || t[i] === '-') { const op = t[i++], r = mul(), a = l; l = op === '+' ? (n) => Q.add(a(n), r(n)) : (n) => Q.sub(a(n), r(n)); } return l; };
    const f = add(); if (i < t.length) bad('多出来的“' + t.slice(i).join('') + '”');
    return f;
  }
  const isPrime = (m) => { if (m < 2) return false; for (let d = 2; d * d <= m; d++) if (m % d === 0) return false; return true; };

  const LAWS = [
    { name: '前 n 个奇数的和 1+3+5+…', lo: 1, truth: (n) => Q(n * n), kind: 'eq', say: '写出 n 个奇数的和' },
    { name: 'n 边形的内角和（度）', lo: 3, truth: (n) => Q(180 * (n - 2)), kind: 'eq', say: '写出 n 边形的内角和' },
    { name: '1+2+…+n 的和', lo: 1, truth: (n) => Q(n * (n + 1), 2), kind: 'eq', say: '写出 1 加到 n' },
    { name: '说法：n×n+n+41 总是质数', lo: 1, kind: 'claim', test: (n) => isPrime(n * n + n + 41), say: '这个说法对吗？' },
    { name: '说法：n×n−n+11 总是质数', lo: 1, kind: 'claim', test: (n) => isPrime(n * n - n + 11), say: '这个说法对吗？' },
  ];

  // 逐个试 n，返回 {res, lo, bad, err}
  function run(props) {
    const L = LAWS[props.law], res = []; let f = null, bad = null;
    if (L.kind === 'eq') { try { f = parse(props.expr); } catch (e) { return { err: e.message }; } }
    for (let n = L.lo; n <= props.upto; n++) {
      let ok;
      if (L.kind === 'eq') { try { ok = Q.eq(f(n), L.truth(n)); } catch (e) { return { err: e.message }; } } else ok = L.test(n);
      res.push(ok); if (!ok && bad === null) bad = n;
    }
    return { res, lo: L.lo, bad };
  }

  U.registerPack({
    id: 'conjecture', version: 1,
    types: {
      conjecture: {
        essence: ['E9', 'E8'],
        label: '猜想与反例', prefix: '猜', group: '关系', grades: [4, 9], alias: ['猜想', '反例', '规律', '找规律', '证明'],
        props: {
          law: { type: 'choice', label: '要检验的', default: 0, choices: LAWS.map((l) => l.name) },
          expr: { type: 'text', label: '我的公式（用 n）', default: '2*n' },
          upto: { type: 'int', label: '试到 n =', default: 10, min: 1, max: 500 },
        },
        outputs: { tested: { kind: 'num', label: '试了几个' }, bad: { kind: 'num', label: '第一个反例 n' }, good: { kind: 'num', label: '全对吗（1/0）' } },
        icon: () => K.text(32, 24, 'n?', { size: 22, weight: 700, fill: 'var(--accent)' }) + K.line(12, 34, 52, 34, { w: 2 }),
        size: () => [320, 170],
        compute: (c) => {
          const L = LAWS[c.props.law], R = run(c.props);
          if (R.err) { c.say('reject', '公式有问题：' + R.err); return {}; }
          const res = R.res, badN = R.bad;
          const cnt = res.length;
          if (!cnt) { c.say('info', '“试到”要不小于 ' + L.lo); return { tested: num(0) }; }
          c.say(badN === null ? 'ok' : 'info', badN === null ? '试了 ' + cnt + ' 个都对。注意：这是证据，不是证明——再往后也一定对吗？' : 'n = ' + badN + ' 时不对：这就是反例，一个就够推翻！');
          const o = { tested: num(cnt), good: num(badN === null ? 1 : 0) };
          if (badN !== null) o.bad = num(badN);
          return o;
        },
        badge: (c) => (c.out.good ? (Q.num(c.out.good.data) ? '都对（证据）' : '反例 n=' + Q.num(c.out.bad.data)) : ''),
        draw: (c) => {
          const R = run(c.props); let g = K.text(c.w / 2, 24, LAWS[c.props.law].name, { size: 13, weight: 700 });
          if (R.err) return g + K.text(c.w / 2, c.h / 2, '公式有问题', { fill: 'var(--bad)' });
          const W = c.w - 24, cols = Math.min(R.res.length, 40), step = W / Math.max(cols, 1);
          R.res.slice(0, 40).forEach((ok, i) => { g += K.circle(12 + step * (i + 0.5), c.h / 2 + 6, Math.min(6, step / 2 - 1), { fill: ok ? 'var(--good)' : 'var(--bad)' }); });
          if (R.bad !== null) g += K.text(c.w / 2, c.h - 24, '反例：n = ' + R.bad, { size: 18, weight: 700, fill: 'var(--bad)' });
          else g += K.text(c.w / 2, c.h - 24, '试了 ' + R.res.length + ' 个都对', { size: 14, fill: 'var(--good)' });
          return g;
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
