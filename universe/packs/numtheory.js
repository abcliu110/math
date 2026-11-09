/* 器材包 numtheory：数论小工具（公因数公倍数、质数、因数）、开方、乘方。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (q, dim, exact) => U.val('num', q, { dim: dim || null, exact: exact !== false });
  const intOf = (v) => (v && v.data.d === 1n ? Number(v.data.n) : null);
  const gcd = (a, b) => { while (b) { [a, b] = [b, a % b]; } return a; };
  const factor = (n) => { const f = []; for (let p = 2; p * p <= n; p++) while (n % p === 0) { f.push(p); n /= p; } if (n > 1) f.push(n); return f; };
  const divisors = (n) => { const d = []; for (let i = 1; i * i <= n; i++) if (n % i === 0) { d.push(i); if (i * i !== n) d.push(n / i); } return d.sort((x, y) => x - y); };

  U.registerPack({
    id: 'numtheory', version: 1,
    types: {
      numtheory: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E2'],
        label: '数的性质', prefix: '性', group: '数与运算', grades: [4, 6], alias: ['质数', '合数', '因数', '最大公因数', '最小公倍数', '分解质因数'],
        props: {
          show: { type: 'choice', label: '展示', default: 0, choices: ['质因数分解', '全部因数'] },
          limit: { type: 'int', label: '最多处理到', default: 100000, min: 10, max: 1000000000 },
          label: { type: 'text', label: '标签', default: '' },
        },
        inputs: { a: { kind: 'num', label: '甲' }, b: { kind: 'num', label: '乙（可不接）' } },
        outputs: { prime: { dim: null, kind: 'bool', label: '甲是质数' }, count: { dim: null, kind: 'num', label: '甲的因数个数' }, gcd: { dim: null, kind: 'num', label: '最大公因数' }, lcm: { dim: null, kind: 'num', label: '最小公倍数' } },
        icon: () => K.text(32, 29, '质?', { size: 22, weight: 700 }),
        size: () => [230, 130],
        compute: (c) => {
          const a = intOf(K.first(c.inp.a)), bq = K.first(c.inp.b), b = intOf(bq);
          if (a === null) { c.say('info', '接一个正整数'); return {}; }
          if (a < 1 || a > c.props.limit) { c.say('reject', '只处理 1 到 ' + c.props.limit + ' 的整数'); return {}; }
          const f = factor(a), out = { prime: U.val('bool', a > 1 && f.length === 1), count: num(Q(divisors(a).length)) };
          if (bq) {
            if (b === null || b < 1 || b > c.props.limit) { c.say('reject', '乙也要是 1 到 ' + c.props.limit + ' 的整数'); return {}; }
            const g = gcd(a, b), l = (a / g) * b;
            if (!Number.isSafeInteger(l)) { c.say('err', '公倍数太大了'); return out; }
            out.gcd = num(Q(g)); out.lcm = num(Q(l));
          }
          c.say('ok', a + (a === 1 ? ' 既不是质数也不是合数' : out.prime.data ? ' 是质数' : ' = ' + f.join(' × ')));
          return out;
        },
        badge: (c) => (c.out.prime ? (c.out.prime.data ? '质数' : '') + (c.out.gcd ? ' 公因数 ' + c.out.gcd.data.n : '') : c.props.label),
        draw: (c) => {
          const a = intOf(K.first(c.d && c.d.inp && c.d.inp.a));
          if (a === null || a < 1 || a > c.props.limit) return K.text(c.w / 2, c.h / 2 + 8, '？', { size: 26, fill: 'var(--dim)' });
          const f = factor(a), t = c.props.show === 0 ? (a === 1 ? '1' : f.length === 1 ? a + '（质数）' : a + ' = ' + f.join(' × ')) : divisors(a).join('、');
          let s = K.text(c.w / 2, c.h / 2 - 2, t.length > 22 ? t.slice(0, 22) + '…' : t, { size: t.length > 14 ? 14 : 20, weight: 700 });
          if (c.out.gcd) s += K.text(c.w / 2, c.h - 14, '最大公因数 ' + c.out.gcd.data.n + '　最小公倍数 ' + c.out.lcm.data.n, { size: 13, fill: 'var(--accent)', weight: 700 });
          return s;
        },
      },

      sqrt: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E7'],
        label: '开方', prefix: '根', group: '数与运算', grades: [7, 9], alias: ['平方根', '立方根', '根号', '无理数'],
        props: {
          mode: { type: 'choice', label: '开什么方', default: 0, choices: ['平方根（算术）', '立方根'] },
          digits: { type: 'int', label: '近似保留小数', default: 3, min: 0, max: 8 },
          show: { type: 'choice', label: '写法', default: 0, choices: ['小数', '分数（能写成时）'] },
        },
        inputs: { v: { kind: 'num', label: '被开方数' } },
        outputs: { r: { dim: null, kind: 'num', label: '结果' }, exact: { dim: null, kind: 'bool', label: '开得尽' } },
        icon: () => K.text(32, 30, '√', { size: 30, weight: 700 }),
        size: () => [180, 104],
        compute: (c) => {
          const v = K.first(c.inp.v); if (!v) { c.say('info', '接一个数'); return {}; }
          const q = v.data, sq = c.props.mode === 0;
          if (sq && q.n < 0) { c.say('reject', '负数没有（实数范围的）平方根'); return {}; }
          const root = (x, k) => { const r = Math.round(Math.pow(Math.abs(x), 1 / k)); return r ** k === Math.abs(x) ? Math.sign(x) * r : null; };
          const a = root(Number(q.n), sq ? 2 : 3), b = root(Number(q.d), sq ? 2 : 3);
          if (a !== null && b !== null) { c.say('ok', '开得尽：' + Q.show(Q(a, b))); return { r: num(Q(a, b), null), exact: U.val('bool', true) }; }
          const x = sq ? Math.sqrt(Q.num(q)) : Math.cbrt(Q.num(q));
          c.say('info', '开不尽：是无限不循环小数，只能取近似值 ≈ ' + x.toFixed(c.props.digits));
          return { r: num(Q.fromNumber(Math.round(x * 1e6) / 1e6), null, false), exact: U.val('bool', false) };
        },
        badge: (c) => (c.out.r ? U.showVal(c.out.r) : ''),
        draw: (c) => (c.out.r ? K.text(c.w / 2, c.h / 2 + 8, (c.out.exact.data ? '' : '≈ ') + (c.props.show === 1 && c.out.exact.data ? Q.show(c.out.r.data) : Q.showDec(c.out.r.data, c.props.digits)), { size: 26, weight: 700 }) : K.text(c.w / 2, c.h / 2 + 8, '？', { size: 26, fill: 'var(--dim)' })),
      },

      power: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E6', 'E2'],
        label: '乘方', prefix: '方', group: '数与运算', grades: [6, 9], alias: ['幂', '平方', '立方', '指数', '科学记数法'],
        props: {
          e: { type: 'int', label: '几次方', default: 2, min: -10, max: 40 },
          sci: { type: 'bool', label: '科学记数法显示', default: false },
          label: { type: 'text', label: '标签', default: '' },
        },
        inputs: { a: { kind: 'num', label: '底数' } },
        outputs: { r: { dim: null, kind: 'num', label: '结果' } },
        icon: () => K.text(24, 32, 'a', { size: 26, weight: 700 }) + K.text(40, 18, 'n', { size: 16, weight: 700, fill: 'var(--accent)' }),
        size: () => [190, 100],
        compute: (c) => {
          const a = K.first(c.inp.a); if (!a) { c.say('info', '接底数'); return {}; }
          const e = c.props.e; let r = Q(1);
          if (e < 0 && a.data.n === 0n) { c.say('err', '0 不能做负指数的底数'); return {}; }
          for (let i = 0; i < Math.abs(e); i++) r = Q.mul(r, a.data);
          if (e < 0) r = Q.div(Q(1), r);
          c.say('ok', Q.show(a.data) + '^' + e + ' = ' + Q.show(r));
          return { r: num(r) };
        },
        badge: (c) => c.props.label,
        draw: (c) => {
          if (!c.out.r) return K.text(c.w / 2, c.h / 2 + 8, '？', { size: 26, fill: 'var(--dim)' });
          const x = Q.num(c.out.r.data), t = c.props.sci && x !== 0 ? (x / 10 ** Math.floor(Math.log10(Math.abs(x)))).toFixed(2).replace(/\.?0+$/, '') + ' × 10^' + Math.floor(Math.log10(Math.abs(x))) : Q.show(c.out.r.data);
          return K.text(c.w / 2, c.h / 2 + 8, t.length > 16 ? t.slice(0, 15) + '…' : t, { size: t.length > 10 ? 18 : 26, weight: 700 });
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
