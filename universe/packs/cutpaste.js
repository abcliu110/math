/* 器材包 cutpaste：平行四边形（剪拼成长方形，面积是不变量）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (q, dim) => U.val('num', q, { dim: dim || null });

  U.registerPack({
    id: 'cutpaste', version: 1,
    types: {
      parallelogram: {
        essence: ['E5', 'E2'],
        label: '剪拼平行四边形', prefix: '平行', group: '图形', grades: [4, 6], alias: ['平行四边形', '底乘高', '剪拼', '面积'],
        props: {
          b: { type: 'num', label: '底', default: 5, min: 1, max: 20, step: 1 },
          h: { type: 'num', label: '高', default: 3, min: 1, max: 20, step: 1 },
          s: { type: 'num', label: '斜度（上边右移）', default: 2, min: 0, max: 10, step: 1 },
        },
        outputs: { area: { dim: null, kind: 'num', label: '面积' }, rect_w: { dim: null, kind: 'num', label: '长方形的长' }, f: { dim: null, kind: 'fig', label: '图形' }, cut: { dim: null, kind: 'fig', label: '剪拼成的长方形' } },
        icon: () => '<polygon points="16,34 40,34 52,12 28,12" fill="#f08a1c33" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>' + K.line(34, 12, 34, 34, { w: 1.2, stroke: 'var(--accent)', dash: '3 2' }),
        size: () => [240, 190],
        compute: (c) => {
          const b = Q.fromNumber(c.props.b), h = Q.fromNumber(c.props.h);
          c.say('ok', '面积 = 底 × 高 = ' + Q.show(Q.mul(b, h)) + '。斜度只改形状，不改面积');
          const s = Q.fromNumber(c.props.s);
          const f = U.Fig.polygon([[Q(0), Q(0)], [b, Q(0)], [Q.add(b, s), h], [s, h]]), cut = U.Fig.polygon([[Q(0), Q(0)], [b, Q(0)], [b, h], [Q(0), h]]);
          return { area: num(Q.mul(b, h), 'area'), rect_w: num(b, 'length'), f: U.val('fig', f), cut: U.val('fig', cut) };
        },
        badge: (c) => (c.out.area ? '面积 ' + Q.show(c.out.area.data) : ''),
        draw: (c) => {
          const b = c.props.b, h = c.props.h, s = c.props.s;
          const k = Math.min((c.w - 50) / (b + s), (c.h - 80) / h);
          const bw = (b + s) * k, H = h * k, ox = (c.w - bw) / 2, y0 = c.h - 22, yt = y0 - H;
          const A = [ox, y0], B = [ox + b * k, y0], C = [ox + (b + s) * k, yt], D = [ox + s * k, yt];
          const pts = [A, B, C, D].map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
          let g = '<polygon points="' + pts + '" fill="#f08a1c33" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>';
          g += K.line(D[0], D[1], D[0], y0, { stroke: 'var(--accent)', w: 2, dash: '6 4' });
          g += K.text(ox + (b * k) / 2, y0 + 16, '底 ' + b, { size: 12, weight: 700 });
          g += K.text(D[0] + 8, (yt + y0) / 2 + 4, '高 ' + h, { size: 12, weight: 700, anchor: 'start', fill: 'var(--accent)' });
          return g;
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
