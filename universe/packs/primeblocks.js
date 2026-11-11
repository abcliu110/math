/* 器材包 primeblocks：质因数积木（docs/new-instruments.md 5.7）。每个质数一种颜色的积木，一个数就是一摞积木。
 *  分解：a 变成一摞积木（1 没有积木）；公因数：a、b 两摞并排，共有的积木对齐（最大公因数）、合起来共有的只算一次（最小公倍数）；
 *  搭因数：每块用或不用，能搭出的数就是全部因数——先猜有几个（先猜后看，只遮界面）；约分：把共有的积木成对拿掉。
 * 计算都是精确的整数；a、b 都限制在 999999 以内。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const MODES = ['分解', '公因数', '搭因数', '约分'];
  const SHOW_DIV = 2;
  const COLORS = { 2: '#ef4444', 3: '#3b82f6', 5: '#22c55e', 7: '#eab308', 11: '#a855f7', 13: '#f97316' };
  const colorOf = (p) => COLORS[p] || '#94a3b8';

  // 质因数分解：[[质数, 个数]…]，1 → []
  const factor = (n) => { const f = []; for (let p = 2; p * p <= n; p++) { let e = 0; while (n % p === 0) { n /= p; e++; } if (e) f.push([p, e]); } if (n > 1) f.push([n, 1]); return f; };
  const expand = (f) => { const r = []; for (const [p, e] of f) for (let i = 0; i < e; i++) r.push(p); return r; };
  const expOf = (f, p) => { const x = f.find((y) => y[0] === p); return x ? x[1] : 0; };
  const divisors = (n) => { const d = []; for (let i = 1; i * i <= n; i++) if (n % i === 0) { d.push(i); if (i * i !== n) d.push(n / i); } return d.sort((x, y) => x - y); };
  const parseGuess = (s) => { const t = String(s === undefined || s === null ? '' : s).trim(); return /^\d+$/.test(t) ? Number(t) : null; };
  const answered = (p) => p.mode !== SHOW_DIV || parseGuess(p.guess) !== null;

  // 纯计算：a 必须是 2–999999；b 是 0 或 2–9999（0 就是不用）
  function calc(p) {
    const a = p.a, b = p.b, fa = factor(a), r = { a, fa, blocks: expand(fa).length, count: divisors(a).length, prime: fa.length === 1 && fa[0][1] === 1 };
    if (b >= 2) {
      const fb = factor(b); let g = 1, l = 1;
      const ps = [...new Set(fa.map((x) => x[0]).concat(fb.map((x) => x[0])))];
      for (const q of ps) { const ea = expOf(fa, q), eb = expOf(fb, q); g *= Math.pow(q, Math.min(ea, eb)); l *= Math.pow(q, Math.max(ea, eb)); }
      Object.assign(r, { b, fb, gcd: g, lcm: l, rn: a / g, rd: b / g });
    }
    return r;
  }
  const bad = (p) => (!Number.isInteger(p.a) || p.a < 2 || p.a > 999999) ? 'a 要是 2 到 999999 的整数（1 没有积木）' : (p.b !== 0 && (!Number.isInteger(p.b) || p.b < 2 || p.b > 999999)) ? 'b 要是 0（不用）或 2 到 999999 的整数' : null;

  U.registerPack({
    id: 'primeblocks', version: 1,
    types: {
      primeblocks: {
        workspaceRole: 'none',
        handles: true, compactPorts: true,
        essence: ['E2'],
        label: '质因数积木', prefix: '积', group: '数与运算', grades: [4, 7], alias: ['质因数', '分解质因数', '公因数', '最大公因数', '最小公倍数', '约分', '因数个数', '积木'],
        props: {
          a: { type: 'int', label: '数 a', default: 60, min: 1, max: 999999 },
          b: { type: 'int', label: '数 b（0 就是不用）', default: 0, min: 0, max: 999999 },
          mode: { type: 'choice', label: '看什么', default: 0, choices: MODES },
          guess: { type: 'text', label: '先猜：a 有几个因数', default: '' },
        },
        // 先猜后看：“搭因数”时，猜了 a 有几个因数才揭开个数（只遮界面）；猜对没有、差多少记进 guess 事件
        guess: {
          props: ['guess', 'mode'], ports: ['count', 'gap'], answered,
          score: (o, p) => { const g = parseGuess(p.guess), c = o.count ? Number(o.count.data.n) : null; return g === null || c === null ? null : { right: g === c, gap: Math.abs(g - c) }; },
        },
        outputs: {
          blocks: { dim: null, kind: 'num', label: '积木块数' }, count: { dim: null, kind: 'num', label: 'a 的因数个数' },
          gcd: { dim: null, kind: 'num', label: '最大公因数' }, lcm: { dim: null, kind: 'num', label: '最小公倍数' },
          rn: { dim: null, kind: 'num', label: '约分后的分子' }, rd: { dim: null, kind: 'num', label: '约分后的分母' },
          gap: { dim: null, kind: 'num', label: '因数个数猜差几' },
        },
        icon: () => K.rect(8, 24, 16, 14, { fill: '#ef4444' }) + K.rect(24, 24, 16, 14, { fill: '#ef4444' }) + K.rect(40, 24, 16, 14, { fill: '#3b82f6' }) + K.rect(16, 10, 16, 14, { fill: '#22c55e' }),
        size: () => [340, 190],
        compute: (c) => {
          const w = bad(c.props); if (w) { c.say('reject', w); return {}; }
          const r = calc(c.props), o = { blocks: num(r.blocks), count: num(r.count) };
          if (r.gcd !== undefined) { o.gcd = num(r.gcd); o.lcm = num(r.lcm); o.rn = num(r.rn); o.rd = num(r.rd); }
          const g = parseGuess(c.props.guess);
          if (c.props.mode === SHOW_DIV && g !== null) o.gap = num(Math.abs(g - r.count));
          const s = r.prime ? r.a + ' 是质数：只有一块积木' : r.a + ' = ' + expand(r.fa).join(' × ');
          c.say('ok', s + (r.gcd !== undefined ? '；最大公因数 ' + r.gcd + '，最小公倍数 ' + r.lcm : ''));
          if (c.props.mode === SHOW_DIV && g === null) c.say('info', a_guess_hint(r));
          return o;
        },
        badge: (c) => (c.masked ? '？' : (c.out.gcd ? '公因数 ' + c.out.gcd.data.n : c.out.blocks ? c.out.blocks.data.n + ' 块' : '')),
        draw: (c) => {
          const p = c.props, W = c.w, S = 24, G2 = 3;
          if (bad(p)) return K.text(W / 2, c.h / 2, '数要在 2 到 999999 之间', { size: 14, fill: 'var(--bad)' });
          const r = calc(p);
          const stack = (f, y, other) => {
            // 共有的积木排在前面（和另一摞对齐）；多出来的排在后面
            const common = [], rest = [];
            for (const [q, e] of f) { const m = other ? Math.min(e, expOf(other, q)) : 0; for (let i = 0; i < e; i++) (i < m ? common : rest).push(q); }
            const list = common.sort((x, y2) => x - y2).concat(rest.sort((x, y2) => x - y2));
            return list.map((q, i) => K.rect(10 + i * (S + G2), y, S, S, { fill: colorOf(q), r: 3, stroke: other && i < common.length ? 'var(--ink)' : undefined, w: 2.5 }) + K.text(10 + i * (S + G2) + S / 2, y + S / 2 + 5, String(q), { size: q > 99 ? 9 : 12, weight: 700, fill: '#fff' })).join('');
          };
          if (p.mode === SHOW_DIV) {
            if (!answered(p)) return K.text(W / 2, c.h / 2 - 6, '？', { size: 40, weight: 700, fill: 'var(--accent)' }) + K.text(W / 2, c.h - 24, '先猜：' + r.a + ' 有几个因数？（写在“先猜”里）', { size: 12, fill: 'var(--dim)' });
            const d = divisors(r.a); return K.text(W / 2, 22, r.a + ' 的全部因数（' + d.length + ' 个）：每块积木用或不用', { size: 12, weight: 700 }) + K.text(W / 2, 70, d.join('、').slice(0, 60), { size: d.length > 12 ? 12 : 16 });
          }
          let s = K.text(10, 18, r.a + (r.b ? '　和　' + r.b : ''), { size: 13, weight: 700, anchor: 'start' }) + stack(r.fa, 28, r.fb);
          if (r.fb) s += stack(r.fb, 28 + S + 10, r.fa);
          const tx = (y, t) => K.text(10, y, t, { size: 12, fill: 'var(--accent)', weight: 700, anchor: 'start' });
          if (r.gcd !== undefined) s += p.mode === 3 ? tx(c.h - 34, r.a + '/' + r.b + ' = ' + r.rn + '/' + r.rd) + tx(c.h - 16, '拿掉共有的积木（共有 ' + r.gcd + '）') : tx(c.h - 34, '共有的 → 最大公因数 ' + r.gcd) + tx(c.h - 16, '合起来 → 最小公倍数 ' + r.lcm);
          else if (r.prime) s += tx(c.h - 16, '只有一块：质数');
          return s;
        },
      },
    },
  });
  function a_guess_hint(r) { return '先猜 ' + r.a + ' 有几个因数，再揭开（别数积木块数）'; }
})(typeof globalThis !== 'undefined' ? globalThis : window);
