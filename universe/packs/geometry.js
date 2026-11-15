/* 器材包 geometry：分数条、数轴、长方形（图形与量）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, D = U.Dim;
  const num = (q, dim) => U.val('num', q, { dim: dim || null });

  U.registerPack({
    id: 'geometry', version: 1,
    types: {
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
