/* 器材包 nth：取第 n 项。无状态：每拍读当前拍数 n，按规则算出第 n 项。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  U.registerPack({
    id: 'nth', version: 1, needs: ['time'],
    types: {
      nth: {
        essence: ['E6', 'E8'],
        label: '取第n项', prefix: '项', group: '时间与变化', grades: [4, 9], alias: ['通项', '第n项', '数列', '规律'],
        props: {
          a: { type: 'num', label: '系数 a', default: 1, min: -99, max: 99, step: 1 },
          b: { type: 'num', label: '常数 b', default: 0, min: -99, max: 99, step: 1 },
          mode: { type: 'choice', label: '规则', default: 0, choices: ['a×n + b', 'a×n² + b'] },
        },
        outputs: { v: { kind: 'num', label: '第 n 项' } },
        icon: () => K.text(32, 22, 'n→', { size: 18, weight: 700 }) + K.text(32, 40, 'f(n)', { size: 12, fill: 'var(--dim)' }),
        size: () => [190, 110],
        compute: (c) => {
          const n = c.n, p = c.props;
          const f = p.mode === 0 ? p.a * n + p.b : p.a * n * n + p.b;
          c.say('info', '第 ' + n + ' 拍：第 ' + n + ' 项 = ' + f);
          return { v: U.val('num', Q.fromNumber(f)) };
        },
        badge: (c) => (c.out.v ? '第 ' + c.n + ' 项' : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 - 2, '第 ' + c.n + ' 项', { size: 13, fill: 'var(--dim)' }) + K.text(c.w / 2, c.h / 2 + 22, c.out.v ? Q.show(c.out.v.data) : '—', { size: 26, weight: 700, fill: 'var(--accent)' }),
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
