/* 器材包 road：路上的两辆车（相遇、追及、环形跑道）。有状态：让时钟走起来，每拍各走一份速度。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n, dim) => U.val('num', Q.fromNumber(n), { dim: dim || null });
  U.registerPack({
    id: 'road', version: 1, needs: ['time'],
    types: {
      road: {
        label: '两辆车', prefix: '路', group: '时间与变化', grades: [4, 9], alias: ['行程', '相遇', '追及', '环形跑道', '行程问题', '速度'],
        props: {
          len: { type: 'num', label: '路长（环形=周长）', default: 100, min: 10, max: 2000, step: 10 },
          loop: { type: 'bool', label: '环形跑道', default: false },
          x1: { type: 'num', label: '甲 出发位置', default: 0, min: 0, max: 2000, step: 5 },
          v1: { type: 'num', label: '甲 每拍走', default: 1, min: -50, max: 50, step: 1 },
          x2: { type: 'num', label: '乙 出发位置', default: 100, min: 0, max: 2000, step: 5 },
          v2: { type: 'num', label: '乙 每拍走', default: -1, min: -50, max: 50, step: 1 },
        },
        reinit: ['len', 'loop', 'x1', 'v1', 'x2', 'v2'],
        outputs: { gap: { kind: 'num', label: '相距' }, at: { kind: 'num', label: '相遇时刻（拍）' } },
        icon: () => K.line(6, 30, 58, 30, { w: 3 }) + K.circle(18, 24, 5, { fill: 'var(--accent)' }) + K.circle(46, 24, 5, { fill: 'var(--good)' }),
        size: () => [320, 120],
        init: (p) => ({ a: Math.min(p.x1, p.len), b: Math.min(p.x2, p.len), t: 0, at: -1 }),
        read: (c) => {
          const s = c.state, o = { gap: num(Math.abs(s.b - s.a)) };
          if (s.at >= 0) o.at = num(s.at);
          return o;
        },
        step: (c) => {
          const s = c.state, p = c.props, L = p.len;
          let a = s.a + p.v1, b = s.b + p.v2, at = s.at;
          if (p.loop) { a = ((a % L) + L) % L; b = ((b % L) + L) % L; if (at < 0 && (((a - b) % L) + L) % L === 0) at = s.t + 1; }
          else {
            a = Math.max(0, Math.min(L, a)); b = Math.max(0, Math.min(L, b));
            if (at < 0 && (s.a - s.b) * (a - b) <= 0 && !(s.a === s.b && s.t === 0)) at = s.t + 1;
          }
          return { a, b, t: s.t + 1, at };
        },
        sig: (c, say) => {
          const s = c.state;
          if (c.props.loop && c.props.v1 === c.props.v2) return say('info', '两人一样快，永远追不上');
          say(s.at >= 0 ? 'ok' : 'info', s.at >= 0 ? '第 ' + s.at + ' 拍相遇' : s.t ? '第 ' + s.t + ' 拍，还没相遇，相距 ' + +Math.abs(s.b - s.a).toFixed(2) : '让时钟走起来');
        },
        badge: (c) => (c.state.at >= 0 ? '第 ' + c.state.at + ' 拍相遇' : '第 ' + c.state.t + ' 拍'),
        draw: (c) => {
          const s = c.state, L = c.props.len, W = c.w - 40, X = (v) => 20 + (v / L) * W, y = c.h / 2 + 8;
          let g;
          if (c.props.loop) {
            const R = Math.min(c.h / 2 - 20, W / 2), cx = c.w / 2, cy = c.h / 2 + 4, P = (v) => [cx + R * Math.cos((v / L) * 2 * Math.PI - Math.PI / 2), cy + R * Math.sin((v / L) * 2 * Math.PI - Math.PI / 2)];
            g = K.circle(cx, cy, R, { fill: 'none', stroke: 'var(--dim)', w: 3 });
            const pa = P(s.a), pb = P(s.b);
            return g + K.circle(pa[0], pa[1], 7, { fill: 'var(--accent)', stroke: '#fff', w: 2 }) + K.circle(pb[0], pb[1], 7, { fill: 'var(--good)', stroke: '#fff', w: 2 }) + K.text(cx, cy + 5, '周长 ' + L, { size: 13, fill: 'var(--dim)' });
          }
          g = K.line(20, y, c.w - 20, y, { w: 4, stroke: 'var(--dim)' }) + K.text(20, y + 22, 0, { size: 11, fill: 'var(--dim)' }) + K.text(c.w - 20, y + 22, L, { size: 11, fill: 'var(--dim)' });
          return g + K.circle(X(s.a), y - 12, 8, { fill: 'var(--accent)', stroke: '#fff', w: 2 }) + K.text(X(s.a), y - 28, '甲 ' + +s.a.toFixed(1), { size: 11 }) + K.circle(X(s.b), y - 12, 8, { fill: 'var(--good)', stroke: '#fff', w: 2 }) + K.text(X(s.b), y - 44, '乙 ' + +s.b.toFixed(1), { size: 11 });
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
