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
        hidden: true, retired: true,   // 已经有操作台代替：不上器材架、搜不到；只留给内核测试当样板
        workspaceRole: 'none',
        handles: true, compactPorts: true,
        essence: ['E2'],
        label: '质因数积木', prefix: '积', group: '数与运算', grades: [4, 7], alias: ['质因数', '分解质因数', '公因数', '最大公因数', '最小公倍数', '约分', '因数个数', '积木'],
        props: {
          // 都在卡片上改：点积木拿掉一块（除以它），点下面的积木盒添一块（乘上它）；看什么用标题栏的“换一种”；先猜用 − / + 调好点“看看”
          a: { hidden: true, type: 'int', label: '数 a', default: 60, min: 1, max: 999999 },
          b: { hidden: true, type: 'int', label: '数 b（0 就是不用）', default: 0, min: 0, max: 999999 },
          mode: { hidden: true, type: 'choice', label: '看什么', default: 0, choices: MODES },
          guess: { hidden: true, type: 'text', label: '先猜：a 有几个因数', default: '' },
          gd: { hidden: true, type: 'int', label: '正在调的猜测', default: 0, min: 0, max: 999 },
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
        size: () => [340, 246],
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
          const p = c.props, W = c.w, G2 = 3;
          if (bad(p)) return K.text(W / 2, c.h / 2, '数要在 2 到 999999 之间', { size: 14, fill: 'var(--bad)' });
          const r = calc(p);
          const pick = (k, v, inner, tip, box) => '<g data-' + (box ? 'box' : 'blk') + '="' + k + '" data-pick-k="' + k + '" data-pick-v="' + v + '" style="cursor:pointer"><title>' + tip + '</title>' + inner + '</g>';
          const stack = (k, n, f, y, other) => {
            // 共有的积木排在前面（和另一摞对齐）；多出来的排在后面。点一块就拿掉它（数除以这块）；a 只剩一块时不能拿，b 拿完就是不用 b
            const common = [], rest = [];
            for (const [q, e] of f) { const m = other ? Math.min(e, expOf(other, q)) : 0; for (let i = 0; i < e; i++) (i < m ? common : rest).push(q); }
            const list = common.sort((x, y2) => x - y2).concat(rest.sort((x, y2) => x - y2)), S = Math.min(24, Math.floor((W - 20) / Math.max(list.length, 1)) - G2);
            return list.map((q, i) => {
              const inner = K.rect(10 + i * (S + G2), y, S, S, { fill: colorOf(q), r: 3, stroke: other && i < common.length ? 'var(--ink)' : undefined, w: 2.5 }) + K.text(10 + i * (S + G2) + S / 2, y + S / 2 + 5, String(q), { size: q > 99 || S < 18 ? 9 : 12, weight: 700, fill: '#fff' });
              if (k === 'a' && list.length === 1) return '<g data-blk="a">' + inner + '</g>';
              return pick(k, k === 'b' && n === q ? 0 : n / q, inner, '拿掉这块 ' + q);
            }).join('');
          };
          let s = K.text(10, 18, 'a = ' + r.a + (r.b ? '　　b = ' + r.b : '　（点积木拿掉一块）'), { size: 13, weight: 700, anchor: 'start' }) + stack('a', r.a, r.fa, 26, r.fb);
          if (r.fb) s += stack('b', r.b, r.fb, 26 + 24 + 8, r.fa);
          // 积木盒：给 a（或 b）添一块质数积木
          const box = (k, n, x, lab) => {
            let t = K.text(x, 104, lab, { size: 11, weight: 700, anchor: 'start' });
            [2, 3, 5, 7].forEach((q, i) => {
              const X = x + 52 + i * 26, can = (n || 1) * q <= 999999, inner = K.rect(X, 90, 22, 20, { fill: can ? colorOf(q) : 'var(--card)', r: 3 }) + K.text(X + 11, 104, String(q), { size: 11, weight: 700, fill: can ? '#fff' : 'var(--dim)' });
              t += can ? pick(k, (n || 1) * q, inner, '给 ' + k + ' 添一块 ' + q, true) : inner;
            });
            return t;
          };
          s += K.line(6, 84, W - 6, 84, { stroke: 'var(--dim)', w: 0.5 }) + box('a', r.a, 10, 'a 添一块') + box('b', r.b || 0, 176, r.b ? 'b 添一块' : '加一摞 b');
          const tx = (y, t) => K.text(10, y, t, { size: 12, fill: 'var(--accent)', weight: 700, anchor: 'start' });
          if (p.mode === SHOW_DIV) {
            if (!answered(p)) {
              // 先猜：− / + 调一个数，点“看看”才揭开全部因数
              const v = p.gd || 0, b2 = (x, w, t2, k, val, on) => (on ? '<g data-pick-k="' + k + '" data-pick-v="' + val + '" style="cursor:pointer">' : '<g>') + K.rect(x, c.h - 50, w, 22, { fill: on ? (t2 === '看看' ? 'var(--good)' : 'var(--sel-bg)') : 'var(--card)', r: 5 }) + K.text(x + w / 2, c.h - 34, t2, { size: 12, weight: 700, fill: on ? (t2 === '看看' ? '#fff' : 'var(--ink)') : 'var(--dim)' }) + '</g>';
              return s + K.text(10, c.h - 62, '先猜：' + r.a + ' 有几个因数？（不是积木的块数）', { size: 12, weight: 700, anchor: 'start', fill: 'var(--accent)' }) +
                b2(10, 22, '−', 'gd', v - 1, v > 0) + K.text(54, c.h - 34, String(v), { size: 14, weight: 700 }) + b2(76, 22, '+', 'gd', v + 1, v < 999) + b2(108, 50, '看看', 'guess', v, v > 0);
            }
            const d = divisors(r.a), g = parseGuess(p.guess);
            return s + tx(c.h - 52, '你猜 ' + g + ' 个：' + (g === d.length ? '猜对了！' : '差 ' + Math.abs(g - d.length))) + tx(c.h - 34, r.a + ' 的全部因数（' + d.length + ' 个）：每块积木用或不用') + K.text(10, c.h - 14, d.join('、').slice(0, 56), { size: 11, anchor: 'start' });
          }
          if (r.gcd !== undefined) s += p.mode === 3 ? tx(c.h - 34, r.a + '/' + r.b + ' = ' + r.rn + '/' + r.rd) + tx(c.h - 16, '拿掉共有的积木（共有 ' + r.gcd + '）') : tx(c.h - 34, '共有的 → 最大公因数 ' + r.gcd) + tx(c.h - 16, '合起来 → 最小公倍数 ' + r.lcm);
          else if (r.prime) s += tx(c.h - 16, '只有一块：质数');
          else if (p.mode === 1 || p.mode === 3) s += tx(c.h - 16, '还要第二个数：在“加一摞 b”里点积木');
          return s;
        },
      },
    },
  });
  function a_guess_hint(r) { return '先猜 ' + r.a + ' 有几个因数，再揭开（别数积木块数）'; }
})(typeof globalThis !== 'undefined' ? globalThis : window);
