/* 器材包 time：时钟、记忆器（有状态）、骰子（有状态、种子随机）、直方图（有状态、累计）。
 * 这四台是“世界时钟”的主角：它们每拍变一次，台面从此会自己走。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (q) => U.val('num', q);
  const PIPS = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };

  U.registerPack({
    id: 'time', version: 1,
    types: {
      clock: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E6'],
        label: '时钟', prefix: '钟', group: '时间与变化', grades: [1, 9],
        props: {
          every: { type: 'int', label: '几拍算一次', default: 1, min: 1, max: 100 },
          scale: { type: 'num', label: '每拍当几', default: 1, min: -100, max: 100, step: 0.5 },
          offset: { type: 'num', label: '起点', default: 0, min: -1000, max: 1000, step: 1 },
        },
        outputs: { n: { dim: null, kind: 'num', label: '拍数' }, t: { dim: null, kind: 'num', label: '秒' } },
        icon: () => K.circle(32, 22, 16, { stroke: 'var(--ink)', w: 2.5 }) + K.line(32, 22, 32, 11, { w: 2.5 }) + K.line(32, 22, 41, 26, { w: 2.5 }),
        size: () => [150, 92],
        compute: (c) => {
          const k = Math.floor(c.n / c.props.every);
          return { n: num(Q.fromNumber(k * c.props.scale + c.props.offset)), t: U.val('num', Q.fromNumber(Math.round(c.t * 1000) / 1000), { exact: false }) };
        },
        badge: (c) => (c.out.n ? '拍 ' + U.showVal(c.out.n) : ''),
        draw: (c) => {
          const a = ((c.t || 0) % 60) / 60 * Math.PI * 2, cx = c.w / 2, cy = c.h / 2 + 2, r = Math.min(c.w, c.h) / 2 - 8;
          return K.circle(cx, cy, r, { stroke: 'var(--ink)', w: 2.5 }) + K.line(cx, cy, cx + Math.sin(a) * (r - 6), cy - Math.cos(a) * (r - 6), { w: 2.5, stroke: 'var(--accent)' }) + K.circle(cx, cy, 3, { fill: 'var(--ink)' });
        },
      },

      memory: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E6'],
        label: '记忆器', prefix: '记', group: '时间与变化', grades: [3, 9], alias: ['寄存器', '递推', '迭代'],
        props: {
          init: { type: 'num', label: '起始值', default: 0, min: -9999, max: 9999, step: 1 },
          hold: { type: 'int', label: '几拍记一次', default: 1, min: 1, max: 50 },
          wrap: { type: 'num', label: '超过就回起点', default: 0, min: 0, max: 99999, step: 1 },
        },
        reinit: ['init'],
        inputs: { in: { kind: 'num', label: '新值' } },
        outputs: { v: { dim: null, kind: 'num', label: '记着的数' } },
        icon: () => K.rect(10, 8, 44, 28, { stroke: 'var(--ink)', r: 5, w: 2.5 }) + K.text(32, 29, 'M', { size: 20, weight: 700, fill: 'var(--accent)' }),
        size: () => [150, 92],
        init: (p) => ({ v: Q.fromNumber(p.init) }),
        read: (c) => ({ v: num(c.state.v) }),
        step: (c) => {
          let v = c.state.v;
          const inp = K.first(c.inp.in);
          if (c.n % c.props.hold === 0 && inp) v = inp.data;
          if (c.props.wrap > 0 && Q.num(v) > c.props.wrap) v = Q.fromNumber(c.props.init);
          return { v };
        },
        sig: (c, say) => say(c.inp.in && c.inp.in.length ? 'ok' : 'info', c.inp.in && c.inp.in.length ? '每拍记下新值' : '没接新值：一直记着 ' + Q.show(c.state.v)),
        badge: (c) => (c.out.v ? U.showVal(c.out.v) : ''),
        draw: (c) => K.frac(c.w / 2, c.h / 2 - 2, c.state.v, 26),
      },

      dice: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E11'],
        label: '骰子', prefix: '骰', group: '统计与概率', grades: [3, 9], alias: ['随机', '概率'],
        props: {
          sides: { type: 'int', label: '几面', default: 6, min: 2, max: 20 },
          every: { type: 'int', label: '几拍掷一次', default: 1, min: 1, max: 20 },
          salt: { type: 'int', label: '种子偏移', default: 0, min: 0, max: 99 },
        },
        reinit: ['sides'],
        outputs: { v: { dim: null, kind: 'num', label: '点数' } },
        icon: () => K.rect(10, 6, 34, 34, { stroke: 'var(--ink)', r: 7, w: 2.5 }) + [[-1, -1], [0, 0], [1, 1]].map((p) => K.circle(27 + p[0] * 8, 23 + p[1] * 8, 3, { fill: 'var(--ink)' })).join(''),
        size: () => [120, 100],
        init: () => ({ v: 0, rolls: 0 }),
        read: (c) => (c.state.v ? { v: num(Q(c.state.v)) } : {}),
        step: (c) => {
          const st = c.state;
          if (c.n % c.props.every !== 0) return st;
          return { v: 1 + Math.floor(c.rand(c.props.salt) * c.props.sides), rolls: st.rolls + 1 };
        },
        sig: (c, say) => say('info', c.state.rolls ? '掷了 ' + c.state.rolls + ' 次，现在是 ' + c.state.v : '还没掷：让时钟走起来'),
        badge: (c) => (c.state.v ? '点数 ' + c.state.v : ''),
        draw: (c) => {
          const v = c.state.v, s = Math.min(c.w, c.h) - 18, x0 = (c.w - s) / 2, y0 = (c.h - s) / 2;
          let g = K.rect(x0, y0, s, s, { fill: 'var(--card2)', stroke: 'var(--ink)', r: 10, w: 2.5 });
          if (v && PIPS[v] && c.props.sides <= 6) g += PIPS[v].map((p) => K.circle(c.w / 2 + p[0] * s * 0.25, c.h / 2 + p[1] * s * 0.25, s * 0.08, { fill: 'var(--ink)' })).join('');
          else g += K.text(c.w / 2, c.h / 2 + 9, v || '?', { size: 28, weight: 700 });
          return g;
        },
      },

      hist: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E11', 'E7'],
        label: '直方图', prefix: '图', group: '统计与概率', grades: [3, 9], alias: ['频数', '分布', '统计'],
        props: {
          lo: { type: 'int', label: '最小值', default: 2, min: -50, max: 50 },
          hi: { type: 'int', label: '最大值', default: 12, min: -49, max: 60 },
          mode: { type: 'choice', label: '纵轴', default: 0, choices: ['次数', '占比'] },
        },
        reinit: ['lo', 'hi'],
        inputs: { v: { kind: 'num', label: '每拍的数', many: true } },
        outputs: { dist: { dim: null, kind: 'dist', label: '分布' }, n: { dim: null, kind: 'num', label: '总次数' } },
        icon: () => [8, 16, 26, 20, 10].map((h, i) => K.rect(8 + i * 10, 38 - h, 8, h, { fill: 'var(--accent)', r: 2 })).join(''),
        size: () => [240, 150],
        init: (p) => ({ lo: p.lo, counts: new Array(Math.max(1, p.hi - p.lo + 1)).fill(0) }),
        read: (c) => {
          const tot = c.state.counts.reduce((s, x) => s + x, 0);
          return { dist: U.val('dist', { lo: c.state.lo, counts: c.state.counts.slice() }), n: num(Q(tot)) };
        },
        step: (c) => {
          const st = c.state, counts = st.counts.slice();
          for (const v of K.nums(c.inp.v)) {
            if (v.data.d !== 1n) continue;
            const i = Number(v.data.n) - st.lo;
            if (i >= 0 && i < counts.length) counts[i] += 1;
          }
          return { lo: st.lo, counts };
        },
        sig: (c, say) => {
          const tot = c.state.counts.reduce((s, x) => s + x, 0);
          if (c.props.hi < c.props.lo) say('reject', '最大值不能比最小值小');
          else say(tot ? 'ok' : 'info', tot ? '已经统计 ' + tot + ' 次' : '还没有数据：让时钟走起来');
        },
        badge: (c) => '共 ' + c.state.counts.reduce((s, x) => s + x, 0) + ' 次',
        draw: (c) => {
          const cs = c.state.counts, tot = cs.reduce((s, x) => s + x, 0), mx = Math.max(1, ...cs), n = cs.length;
          const W = c.w - 16, H = c.h - 26, bw = W / n;
          let s = K.line(8, H, c.w - 8, H, { w: 1.5 });
          cs.forEach((x, i) => {
            const h = (x / mx) * (H - 14);
            s += K.rect(8 + i * bw + 1, H - h, Math.max(2, bw - 2), h, { fill: 'var(--accent)', r: 2 });
            if (n <= 14) s += K.text(8 + i * bw + bw / 2, H + 13, c.state.lo + i, { size: 11, fill: 'var(--dim)' });
            if (x && n <= 14) s += K.text(8 + i * bw + bw / 2, H - h - 3, c.props.mode ? Math.round((x / tot) * 100) + '%' : x, { size: 10 });
          });
          return s;
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
