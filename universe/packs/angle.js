/* 器材包 angle：三角形内角、不等式。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (q, exact) => U.val('num', q, { exact: exact !== false });
  U.registerPack({
    id: 'angle', version: 1,
    types: {
      angles: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E2', 'E5'],
        label: '三角形的角', prefix: '角', lint: { minProps: 2, why: '三角形只需两个角就确定第三个' }, group: '图形', grades: [4, 8], alias: ['内角和', '外角', '三角形内角和'],
        props: {
          A: { type: 'num', label: '角 A（度）', default: 50, min: 1, max: 178, step: 1 },
          B: { type: 'num', label: '角 B（度）', default: 60, min: 1, max: 178, step: 1 },
        },
        outputs: { C: { dim: null, kind: 'num', label: '角 C' }, ext: { dim: null, kind: 'num', label: 'C 的外角' } },
        icon: () => '<polygon points="10,38 54,38 34,8" fill="#f08a1c33" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>',
        size: () => [220, 170],
        compute: (c) => {
          const A = Q.fromNumber(c.props.A), B = Q.fromNumber(c.props.B), C = Q.sub(Q(180), Q.add(A, B));
          if (Q.num(C) <= 0) { c.say('reject', '两个角加起来已经 ≥ 180°，剩不下第三个角了——三角形内角和只有 180°'); return {}; }
          c.say('ok', '角 C = 180° − A − B = ' + Q.showDec(C, 2) + '°');
          return { C: num(C), ext: num(Q.add(A, B)) };
        },
        badge: (c) => (c.out.C ? 'C = ' + Q.showDec(c.out.C.data, 1) + '°' : ''),
        draw: (c) => {
          const A = c.props.A, B = c.props.B, C = 180 - A - B;
          if (C <= 0) return K.text(c.w / 2, c.h / 2, '画不出', { fill: 'var(--bad)' });
          const r = Math.PI / 180, L = c.w - 50, x0 = 25, y0 = c.h - 30, x1 = x0 + L, sa = Math.sin(B * r) / Math.sin(C * r) * L;
          const tx = x0 + sa * Math.cos(A * r), ty = y0 - sa * Math.sin(A * r), sc = Math.min(1, (c.h - 50) / Math.max(1, y0 - ty));
          const T = [x0, y0 - (y0 - y0) , ], px = tx, py = y0 - (y0 - ty) * sc, qx = x0 + (tx - x0) * sc, qx1 = x0 + L * sc;
          return '<polygon points="' + [x0, y0, qx1, y0, qx, py].map((v) => +v.toFixed(1)).join(',').replace(/(\S+?,\S+?),/g, '$1 ') + '" fill="#f08a1c33" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>'
            + K.text(x0 + 22, y0 - 6, A + '°', { size: 12, weight: 700 }) + K.text(qx1 - 22, y0 - 6, B + '°', { size: 12, weight: 700 }) + K.text(qx, py + 18, +C.toFixed(1) + '°', { size: 12, weight: 700, fill: 'var(--accent)' });
        },
      },

      ineq: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E4', 'E8'],
        label: '不等式', prefix: '式', group: '关系', grades: [7, 9], alias: ['不等式', '解集', '最小整数解'],
        props: {
          a: { type: 'num', label: 'x 的系数 a', default: 2, min: -20, max: 20, step: 1 },
          b: { type: 'num', label: '加 b', default: 1, min: -50, max: 50, step: 1 },
          dir: { type: 'choice', label: '比较', default: 0, choices: ['>', '≥', '<', '≤'] },
          c: { type: 'num', label: '右边 c', default: 7, min: -100, max: 100, step: 1 },
          x: { type: 'num', label: '试一试 x =', default: 0, min: -100, max: 100, step: 1 },
        },
        outputs: { ok: { dim: null, kind: 'num', label: '成立吗（1/0）' }, bound: { dim: null, kind: 'num', label: '分界点' } },
        icon: () => K.text(32, 26, 'ax+b>c', { size: 13, weight: 700 }),
        size: () => [260, 150],
        compute: (c) => {
          const a = Q.fromNumber(c.props.a), b = Q.fromNumber(c.props.b), cc = Q.fromNumber(c.props.c), x = Q.fromNumber(c.props.x);
          if (Q.num(a) === 0) { c.say('reject', 'a 不能是 0——那就没有 x 了'); return {}; }
          const l = Q.add(Q.mul(a, x), b), d = Q.num(Q.sub(l, cc)), dir = c.props.dir;
          const ok = dir === 0 ? d > 0 : dir === 1 ? d >= 0 : dir === 2 ? d < 0 : d <= 0;
          const bound = Q.div(Q.sub(cc, b), a);
          c.say(ok ? 'ok' : 'info', 'x = ' + c.props.x + '：左边 ' + Q.showDec(l, 2) + ' ' + ['>', '≥', '<', '≤'][dir] + ' ' + c.props.c + ' ' + (ok ? '成立' : '不成立') + '；分界点 x = ' + Q.showDec(bound, 3));
          return { ok: num(Q(ok ? 1 : 0)), bound: num(bound) };
        },
        badge: (c) => (c.out.ok ? (Q.num(c.out.ok.data) ? '✓ 成立' : '✗ 不成立') : ''),
        draw: (c) => {
          const s = ['>', '≥', '<', '≤'][c.props.dir], w = c.w, y = c.h - 40;
          let g = K.text(w / 2, 34, c.props.a + 'x ' + (c.props.b >= 0 ? '+ ' : '− ') + Math.abs(c.props.b) + ' ' + s + ' ' + c.props.c, { size: 20, weight: 700 }) + K.line(14, y, w - 14, y, { w: 2 });
          if (c.out.bound) {
            const bv = Q.num(c.out.bound.data), R = Math.max(5, Math.abs(bv) * 1.5, Math.abs(c.props.x) * 1.2), X = (v) => w / 2 + (v / R) * (w / 2 - 20);
            const right = (c.props.a > 0) === (c.props.dir < 2), bx = X(bv), strict = c.props.dir % 2 === 0;
            g += K.line(bx, y, right ? w - 14 : 14, y, { w: 6, stroke: 'var(--good)' }) + K.circle(bx, y, 6, { fill: strict ? 'var(--panel)' : 'var(--good)', stroke: 'var(--good)', w: 2.5 }) + K.text(bx, y + 22, +bv.toFixed(2), { size: 12 });
            g += K.circle(X(c.props.x), y - 14, 5, { fill: Q.num(c.out.ok.data) ? 'var(--good)' : 'var(--bad)' }) + K.text(X(c.props.x), y - 24, 'x', { size: 11 });
          }
          return g;
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
