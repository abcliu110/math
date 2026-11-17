/* 器材包 angle：三角形内角、不等式。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (q, exact) => U.val('num', q, { exact: exact !== false });
  U.registerPack({
    id: 'angle', version: 1,
    types: {
      ineq: {
        workspaceRole: 'none',
        handles: true,
        hidden: true,   // 旧器材：被 packs/equation.js 的新一套取代，不再放在器材架上（旧存档和旧题照样能用）
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
