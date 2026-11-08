/* 器材包 modclock：同余钟。m 个刻度排成一圈，指针每拍走一步。余数 = 圈上的位置。
 * 加法钟：位置 = (位置 + k) 除以 m 的余数；乘法钟：位置 = (位置 × k) 除以 m 的余数。
 * 走过的格子会亮起来；回到起点就记下“一圈几拍”。N 除以 m 的余数随时可读。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q.fromNumber(n));
  const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
  const modp = (a, m) => ((a % m) + m) % m;

  U.registerPack({
    id: 'modclock', version: 1, needs: ['time'],
    types: {
      modclock: {
        label: '同余钟', prefix: '钟', group: '数与运算', grades: [3, 8], alias: ['余数', '同余', '周期', '星期几', '个位数字', '循环', '最大公因数'],
        props: {
          m: { type: 'int', label: '钟面几格', default: 12, min: 2, max: 60 },
          s: { type: 'int', label: '从第几格出发', default: 0, min: 0, max: 59 },
          k: { type: 'int', label: '每拍的步长 k', default: 0, min: 0, max: 59 },
          mode: { type: 'choice', label: '怎么走', default: 0, choices: ['加：每拍 +k', '乘：每拍 ×k'] },
          N: { type: 'int', label: '一个数 N（读它除以格数的余数）', default: 0, min: 0, max: 1000000 },
        },
        reinit: ['m', 's', 'k', 'mode'],
        outputs: {
          pos: { kind: 'num', label: '指针在第几格' },
          visits: { kind: 'num', label: '走过几个不同的格' },
          back: { kind: 'num', label: '回到起点用几拍' },
          tick: { kind: 'num', label: '已走几拍' },
          rem: { kind: 'num', label: 'N 除以格数的余数' },
        },
        icon: () => K.circle(32, 24, 16, { fill: 'none', stroke: 'var(--ink)', w: 2.5 }) + K.line(32, 24, 32, 12, { w: 2.5, stroke: 'var(--accent)' }) + K.line(32, 24, 41, 28, { w: 2.5 }),
        size: () => [270, 240],
        init: (p) => {
          const m = p.m, s = modp(p.s, m), seen = new Array(m).fill(0); seen[s] = 1;
          return { pos: s, seen, t: 0, back: -1 };
        },
        read: (c) => {
          const s = c.state, m = c.props.m, o = {
            pos: num(s.pos), visits: num(s.seen.reduce((a, b) => a + b, 0)), tick: num(s.t), rem: num(modp(c.props.N, m)),
          };
          if (s.back >= 0) o.back = num(s.back);
          return o;
        },
        step: (c) => {
          const st = c.state, p = c.props, m = p.m;
          const np = p.mode === 1 ? modp(st.pos * p.k, m) : modp(st.pos + p.k, m);
          const seen = st.seen.slice(); seen[np] = 1;
          const start = modp(p.s, m);
          return { pos: np, seen, t: st.t + 1, back: st.back < 0 && np === start ? st.t + 1 : st.back };
        },
        sig: (c, say) => {
          const s = c.state, v = s.seen.reduce((a, b) => a + b, 0);
          if (!s.t) return say('info', '让时钟走起来：每拍指针走一步，走过的格子会亮');
          say('ok', '第 ' + s.t + ' 拍，指针在第 ' + s.pos + ' 格；走过 ' + v + ' 个不同的格' + (s.back >= 0 ? '；第 ' + s.back + ' 拍回到了起点' : ''));
        },
        badge: (c) => '第 ' + c.state.pos + ' 格',
        draw: (c) => {
          const s = c.state, m = c.props.m, R = Math.min(c.w, c.h) / 2 - 30, cx = c.w / 2, cy = c.h / 2 + 4;
          const ang = (i) => (i / m) * 2 * Math.PI - Math.PI / 2, P = (i, r) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))];
          let g = K.circle(cx, cy, R, { fill: 'none', stroke: 'var(--dim)', w: 2 });
          const cur = P(s.pos, R - 8);
          g += K.line(cx, cy, cur[0], cur[1], { w: 3, stroke: 'var(--accent)' });
          for (let i = 0; i < m; i++) {
            const p = P(i, R), vis = s.seen[i], isCur = i === s.pos, r = Math.max(3, Math.min(9, (Math.PI * R) / m - 1));
            g += K.circle(p[0], p[1], isCur ? r + 2 : r, { fill: vis ? 'var(--accent)' : 'var(--card2)', stroke: isCur ? '#fff' : 'var(--dim)', w: isCur ? 2.5 : 1.5 });
            if (m <= 14) { const q = P(i, R + 17); g += K.text(q[0], q[1] + 4, m === 7 ? WEEK[i] : i, { size: 11, fill: 'var(--dim)' }); }
          }
          return g + K.circle(cx, cy, 4, { fill: 'var(--ink)' }) + K.text(cx, cy + 24, '第 ' + s.t + ' 拍', { size: 12, fill: 'var(--dim)' });
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
