/* 器材包 curved：改规则的世界。同一个三角形，放在平面上和球面上，内角和的规则不同。
 * 平面：三个角加起来必须是 180°。球面：必须大于 180°，多出来的部分（角盈）正比于三角形占球面的面积。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (q) => U.val('num', q);
  U.registerPack({
    id: 'curved', version: 1,
    types: {
      curved: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E9', 'E5'],
        label: '三角形的世界', prefix: '界', group: '图形', grades: [6, 9], alias: ['球面', '非欧几何', '内角和', '角盈', '公理'],
        props: {
          space: { type: 'choice', label: '放在哪个世界', default: 0, choices: ['平面', '球面'] },
          A: { type: 'num', label: '角 A（度）', default: 60, min: 1, max: 359, step: 1 },
          B: { type: 'num', label: '角 B（度）', default: 60, min: 1, max: 359, step: 1 },
          C: { type: 'num', label: '角 C（度）', default: 60, min: 1, max: 359, step: 1 },
        },
        outputs: { sum: { dim: null, kind: 'num', label: '内角和' }, excess: { dim: null, kind: 'num', label: '比 180° 多多少' }, frac: { dim: null, kind: 'num', label: '占整个球面的几分之几' } },
        icon: () => K.circle(32, 22, 16, { fill: 'none', stroke: 'var(--ink)', w: 2.5 }) + '<path d="M32 6 L48 24 L16 24 Z" fill="#f08a1c55" stroke="var(--ink)" stroke-width="2"/>',
        size: () => [250, 190],
        compute: (c) => {
          const p = c.props, s = p.A + p.B + p.C;
          if (p.space === 0) {
            if (s !== 180) { c.say('reject', '平面的规则：三角形三个角加起来必须是 180°。现在是 ' + s + '°——这在平面上画不出来。换到球面试试？'); return {}; }
            c.say('ok', '平面：内角和永远是 180°');
            return { sum: num(Q(180)), excess: num(Q(0)) };
          }
          if (s < 180) { c.say('reject', '球面的规则：三角形三个角加起来不能小于 180°（球面是鼓起来的）。现在是 ' + s + '°'); return {}; }
          if (s >= 540) { c.say('reject', '球面上三角形三个角加起来要小于 540°。现在是 ' + s + '°'); return {}; }
          const ex = s - 180;
          c.say('ok', ex === 0 ? '球面：内角和刚好 180°，三角形小到几乎是平的（面积 0）' : '球面：内角和 ' + s + '°，多出 ' + ex + '°，占球面 ' + ex + '/720');
          return { sum: num(Q(s)), excess: num(Q(ex)), frac: num(Q(ex, 720)) };
        },
        badge: (c) => (c.out.sum ? (c.props.space ? '球面 ' : '平面 ') + Q.show(c.out.sum.data) + '°' : ''),
        draw: (c) => {
          const p = c.props, s = p.A + p.B + p.C, cx = c.w / 2, cy = c.h / 2 - 6, R = Math.min(c.w, c.h) / 2 - 26;
          if (p.space === 0) return K.line(14, cy + R * 0.7, c.w - 14, cy + R * 0.7, { w: 2, stroke: 'var(--dim)' }) + '<polygon points="' + [cx - R * 0.8, cy + R * 0.7, cx + R * 0.8, cy + R * 0.7, cx, cy - R * 0.6].join(',').replace(/(-?[\d.]+),(-?[\d.]+),/g, '$1,$2 ') + '" fill="#f08a1c33" stroke="var(--ink)" stroke-width="2.5"/>' + K.text(cx, c.h - 18, '平面：内角和 ' + s + '°', { size: 13, fill: 'var(--dim)' });
          const ex = Math.max(0, Math.min(540, s) - 180), r = Math.sqrt(ex / 720) * R * 1.6;
          return K.circle(cx, cy, R, { fill: '#2b3a55', stroke: 'var(--ink)', w: 2.5 }) + K.circle(cx, cy, Math.min(r, R - 2), { fill: '#f08a1caa', stroke: '#fff', w: 2 }) + K.text(cx, c.h - 18, '球面：内角和 ' + s + '°', { size: 13, fill: 'var(--dim)' });
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
