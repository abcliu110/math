/* 器材包 eqscale：等式的天平。盘里有“盒子 x”（重量藏起来了）和砝码。
 * 学生只能改盘里的东西；如果“两边同时做同一件事”，天平保持平衡；只动一边，天平立刻歪。
 * 目标：把一个盒子单独留在一边，另一边的砝码就是盒子的重量。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q.fromNumber(n));
  U.registerPack({
    id: 'eqscale', version: 1,
    types: {
      eqscale: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E4'],
        label: '解方程天平', prefix: '衡', group: '关系', grades: [5, 9], alias: ['方程', '等式的性质', '解方程', '移项', '未知数'],
        props: {
          lx: { type: 'int', label: '左盘：几个盒子', default: 3, min: 0, max: 20 },
          lc: { type: 'int', label: '左盘：砝码', default: 2, min: -50, max: 100 },
          rx: { type: 'int', label: '右盘：几个盒子', default: 1, min: 0, max: 20 },
          rc: { type: 'int', label: '右盘：砝码', default: 8, min: -50, max: 100 },
          x0: { type: 'num', label: '盒子的真实重量', default: 3, min: -50, max: 100, step: 1, hidden: true },
        },
        outputs: { eq: { dim: null, kind: 'eqn', label: '方程（左 = 右）' }, ok: { dim: null, kind: 'bool', label: '平衡' }, solved: { dim: null, kind: 'num', label: '盒子的重量（单独一个盒子时）' } },
        icon: () => K.line(10, 14, 54, 14, { w: 2.5 }) + K.line(32, 14, 32, 36, { w: 2 }) + K.rect(12, 16, 12, 10, { stroke: 'var(--accent)', w: 2 }) + K.line(16, 36, 48, 36, { w: 3 }),
        size: () => [300, 170],
        compute: (c) => {
          const p = c.props, l = p.lx * p.x0 + p.lc, r = p.rx * p.x0 + p.rc, ok = l === r;
          const o = { ok: U.val('bool', ok) };
          const X = U.Poly.variable('x'), C = (n) => U.Poly.const(U.Q(n));
          o.eq = U.val('eqn', U.Eqn.make(U.Poly.add(U.Poly.mul(C(p.lx), X), C(p.lc)), U.Poly.add(U.Poly.mul(C(p.rx), X), C(p.rc)), '='));
          if (!ok) { c.say('info', '天平歪了：左 ' + l + '，右 ' + r + '——你只动了一边，或者动得不一样'); return o; }
          if (p.lx === 1 && p.lc === 0 && p.rx === 0) { o.solved = num(p.rc); c.say('ok', '一个盒子 = ' + p.rc + '，解出来了！'); }
          else c.say('ok', '平衡：' + (p.lx ? p.lx + '个盒子' : '') + (p.lc ? (p.lc > 0 && p.lx ? ' + ' : ' ') + p.lc : '') + ' = ' + (p.rx ? p.rx + '个盒子' : '') + (p.rc ? (p.rc > 0 && p.rx ? ' + ' : ' ') + p.rc : ''));
          return o;
        },
        badge: (c) => (c.out.ok ? (c.out.ok.data ? '平衡' : '歪了') : ''),
        draw: (c) => {
          const p = c.props, l = p.lx * p.x0 + p.lc, r = p.rx * p.x0 + p.rc, d = l - r, ang = Math.max(-1, Math.min(1, d / (Math.abs(d) + 6))) * 14 * Math.PI / 180;
          const cx = c.w / 2, cy = 34, L = 100, sin = Math.sin(ang), cos = Math.cos(ang), lx = cx - L * cos, ly = cy + L * sin, rx = cx + L * cos, ry = cy - L * sin;
          let s = K.line(cx, cy, cx, c.h - 10, { w: 3 }) + K.line(cx - 30, c.h - 8, cx + 30, c.h - 8, { w: 4 }) + K.line(lx, ly, rx, ry, { w: 4, stroke: d === 0 ? 'var(--good)' : 'var(--accent)' });
          const pan = (x, y, nx, nc) => {
            let g = K.line(x - 40, y + 70, x + 40, y + 70, { w: 3 }), px = x - 36;
            for (let i = 0; i < nx; i++) { g += K.rect(px, y + 44, 20, 22, { fill: '#f08a1c55', stroke: 'var(--ink)', w: 2, r: 3 }) + K.text(px + 10, y + 60, 'x', { size: 13, weight: 700 }); px += 22; if (px > x + 30) break; }
            return g + (nc ? K.text(x, y + 90, (nc > 0 ? '+' : '−') + Math.abs(nc), { size: 14, weight: 700, fill: 'var(--good)' }) : '');
          };
          return s + K.line(lx, ly, lx, ly + 20, { w: 1 }) + K.line(rx, ry, rx, ry + 20, { w: 1 }) + pan(lx, ly - 10, p.lx, p.lc) + pan(rx, ry - 10, p.rx, p.rc);
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
