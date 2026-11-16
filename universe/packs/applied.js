/* 器材包 applied：百分数、比、方程组（两直线交点）、摸球。应用题的骨架。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (q, dim, exact) => U.val('num', q, { dim: dim || null, exact: exact !== false });

  U.registerPack({
    id: 'applied', version: 1,
    types: {
      bag: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E11'],
        label: '摸球袋', prefix: '袋', group: '统计与概率', grades: [5, 9], alias: ['摸球', '概率', '有放回', '不放回'],
        props: {
          red: { type: 'int', label: '红球几个', default: 3, min: 0, max: 50 },
          white: { type: 'int', label: '白球几个', default: 1, min: 0, max: 50 },
          replace: { type: 'bool', label: '摸完放回去', default: true },
        },
        reinit: ['red', 'white', 'replace'],
        outputs: { v: { dim: null, kind: 'num', label: '红球=1' } },
        icon: () => '<path d="M18 14 Q32 6 46 14 L50 38 H14 Z" fill="#f08a1c33" stroke="var(--ink)" stroke-width="2.5"/>' + K.circle(28, 30, 4, { fill: 'var(--bad)' }) + K.circle(38, 30, 4, { fill: '#fff', stroke: 'var(--ink)' }),
        size: () => [150, 120],
        init: (p) => ({ r: p.red, w: p.white, v: -1, draws: 0, reds: 0 }),
        read: (c) => (c.state.v < 0 ? {} : { v: num(Q(c.state.v)) }),
        step: (c) => {
          const s = c.state, tot = s.r + s.w; if (tot <= 0) return s;
          const red = c.rand(0) * tot < s.r, o = { r: s.r, w: s.w, v: red ? 1 : 0, draws: s.draws + 1, reds: s.reds + (red ? 1 : 0) };
          if (!c.props.replace) { if (red) o.r -= 1; else o.w -= 1; }
          return o;
        },
        sig: (c, say) => (c.state.r + c.state.w === 0 ? say('warn', '袋子空了（没放回，摸光了）') : say('info', '袋里还有 ' + c.state.r + ' 红 ' + c.state.w + ' 白' + (c.state.draws ? '；摸了 ' + c.state.draws + ' 次，红 ' + c.state.reds : ''))),
        badge: (c) => (c.state.v < 0 ? '' : c.state.v ? '红' : '白'),
        draw: (c) => {
          let s = '<path d="M30 30 Q75 8 120 30 L132 ' + (c.h - 8) + ' H18 Z" fill="#f08a1c22" stroke="var(--ink)" stroke-width="2.5"/>';
          const n = c.state.r + c.state.w;
          for (let i = 0; i < Math.min(n, 30); i++) s += K.circle(36 + (i % 10) * 8.6, 52 + Math.floor(i / 10) * 14, 5, { fill: i < c.state.r ? 'var(--bad)' : '#fff', stroke: 'var(--ink)', w: 1.5 });
          return s;
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
