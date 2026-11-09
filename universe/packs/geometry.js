/* 器材包 geometry：分数条、数轴、长方形（图形与量）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, D = U.Dim;
  const num = (q, dim) => U.val('num', q, { dim: dim || null });

  U.registerPack({
    id: 'geometry', version: 1,
    types: {
      fracbar: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E3'],
        label: '分数条', prefix: '条', group: '分数', grades: [3, 6], alias: ['分数', '比大小'],
        props: {
          parts: { type: 'int', label: '平均分成几份', default: 6, min: 1, max: 24 },
          whole: { type: 'num', label: '整条是几', default: 1, min: 1, max: 10, step: 1 },
          shade: { type: 'bool', label: '涂色', default: true },
        },
        inputs: { v: { kind: 'num', label: '值' } },
        outputs: { v: { dim: null, kind: 'num', label: '原样输出' } },
        icon: () => K.rect(6, 12, 52, 20, { stroke: 'var(--ink)', r: 3, w: 2 }) + K.rect(6, 12, 26, 20, { fill: 'var(--accent)', r: 3 }) + K.line(32, 12, 32, 32, { w: 1.5 }),
        size: () => [220, 92],
        compute: (c) => { const v = K.first(c.inp.v); if (!v) { c.say('info', '接一个分数进来'); return {}; } return { v }; },
        badge: (c) => (c.out.v ? U.showVal(c.out.v) : ''),
        draw: (c) => {
          const v = c.out.v, P = c.props.parts, whole = c.props.whole, bw = c.w - 24, x0 = 12, y0 = c.h / 2 - 14;
          const frac = v ? Math.max(0, Math.min(1, Q.num(v.data) / whole)) : 0;
          let s = c.props.shade && v ? K.rect(x0, y0, bw * frac, 28, { fill: 'var(--accent)', r: 2 }) : '';
          s += K.rect(x0, y0, bw, 28, { stroke: 'var(--ink)', r: 3, w: 2 });
          for (let i = 1; i < P; i++) s += K.line(x0 + (bw * i) / P, y0, x0 + (bw * i) / P, y0 + 28, { w: 1, stroke: 'var(--dim)' });
          if (v) { const lands = Math.abs(Q.num(v.data) / whole * P - Math.round(Q.num(v.data) / whole * P)) < 1e-9; s += K.text(x0 + bw * frac, y0 + 46, lands ? '刚好落在分界线上' : '没落在分界线上', { size: 11, fill: lands ? 'var(--good)' : 'var(--dim)' }); }
          return s;
        },
      },

      numline: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E1', 'E3'],
        label: '数轴', prefix: '轴', group: '数与运算', grades: [1, 9], alias: ['数线', '位置'],
        props: {
          lo: { type: 'num', label: '起点', default: 0, min: -100, max: 100, step: 1 },
          hi: { type: 'num', label: '终点', default: 2, min: -99, max: 200, step: 1 },
          tick: { type: 'num', label: '刻度间隔', default: 1, min: 0.01, max: 50, step: 0.25 },
        },
        inputs: { v: { kind: 'num', label: '点', many: true } },
        outputs: { n: { dim: null, kind: 'num', label: '点的个数' } },
        icon: () => K.line(6, 26, 58, 26, { w: 2 }) + [12, 24, 36, 48].map((x) => K.line(x, 22, x, 30, { w: 1.5 })).join('') + K.circle(36, 26, 4, { fill: 'var(--accent)' }),
        size: () => [300, 110],
        compute: (c) => {
          const pts = K.nums(c.inp.v);
          if (c.props.hi <= c.props.lo) { c.say('reject', '终点要比起点大'); return {}; }
          const out = pts.filter((p) => Q.num(p.data) < c.props.lo || Q.num(p.data) > c.props.hi).length;
          if (out) c.say('warn', out + ' 个点在数轴外面，调大范围才看得到');
          return { n: num(Q(pts.length)) };
        },
        badge: (c) => (c.out.n ? c.out.n.data.n + ' 个点' : ''),
        draw: (c) => {
          const lo = c.props.lo, hi = c.props.hi, tk = c.props.tick, x0 = 20, x1 = c.w - 24, y = c.h / 2 + 4;
          const X = (v) => x0 + ((v - lo) / (hi - lo)) * (x1 - x0);
          let s = K.line(x0 - 8, y, x1 + 10, y, { w: 2 }) + '<path d="M' + (x1 + 12) + ',' + y + ' l-7,-4 v8z" fill="var(--ink)"/>';
          const n = Math.floor((hi - lo) / tk + 1e-9);
          for (let i = 0; i <= n && i < 60; i++) { const v = lo + i * tk; s += K.line(X(v), y - 6, X(v), y + 6, { w: 1.5 }) + (n <= 14 || i % Math.ceil(n / 12) === 0 ? K.text(X(v), y + 22, +v.toFixed(2), { size: 11, fill: 'var(--dim)' }) : ''); }
          const pts = c.d && c.d.inp && c.d.inp.v ? K.nums(c.d.inp.v) : [];
          pts.forEach((p, i) => { const v = Q.num(p.data); if (v >= lo && v <= hi) s += K.circle(X(v), y, 6, { fill: 'var(--accent)', stroke: '#fff', w: 2 }) + K.text(X(v), y - 14 - (i % 2) * 12, Q.show(p.data), { size: 12, weight: 700 }); });
          return s;
        },
      },

      rect: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E2', 'E3'],
        label: '长方形', prefix: '形', group: '图形', grades: [3, 6], alias: ['面积', '周长'],
        props: {
          w: { type: 'num', label: '长', default: 6, min: 0.5, max: 40, step: 0.5 },
          h: { type: 'num', label: '宽', default: 4, min: 0.5, max: 40, step: 0.5 },
          grid: { type: 'bool', label: '画方格', default: true },
        },
        outputs: { area: { dim: null, kind: 'num', label: '面积' }, perim: { dim: null, kind: 'num', label: '周长' }, f: { dim: null, kind: 'fig', label: '图形' } },
        icon: () => K.rect(8, 10, 48, 24, { stroke: 'var(--ink)', r: 2, w: 2.5, fill: '#f08a1c33' }),
        size: () => [220, 150],
        compute: (c) => {
          const w = Q.fromNumber(c.props.w), h = Q.fromNumber(c.props.h);
          const f = U.Fig.polygon([[Q(0), Q(0)], [w, Q(0)], [w, h], [Q(0), h]]);
          return { area: num(Q.mul(w, h), 'area'), perim: num(Q.mul(Q.add(w, h), Q(2)), 'length'), f: U.val('fig', f) };
        },
        badge: (c) => (c.out.area ? '面积 ' + Q.showDec(c.out.area.data, 2) : ''),
        draw: (c) => {
          const w = c.props.w, h = c.props.h, k = Math.min((c.w - 40) / w, (c.h - 36) / h), rw = w * k, rh = h * k, x0 = (c.w - rw) / 2, y0 = (c.h - rh) / 2 - 4;
          let s = K.rect(x0, y0, rw, rh, { fill: '#f08a1c33', stroke: 'var(--ink)', r: 2, w: 2.5 });
          if (c.props.grid) { for (let i = 1; i < w; i++) s += K.line(x0 + i * k, y0, x0 + i * k, y0 + rh, { w: 1, stroke: 'var(--dim)' }); for (let j = 1; j < h; j++) s += K.line(x0, y0 + j * k, x0 + rw, y0 + j * k, { w: 1, stroke: 'var(--dim)' }); }
          return s + K.text(c.w / 2, y0 + rh + 16, '长 ' + w + '　宽 ' + h, { size: 12, fill: 'var(--dim)' });
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
