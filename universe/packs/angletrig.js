/* 器材包 angletrig：量角器读数、圆周角、特殊角的三角函数（2.4 直角、9.6 圆周角、9.14 锐角三角函数）。
 * 符号值用 U.Real（精确的 a + b√c），不用小数。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, R = U.Real;

  const KIND_NAMES = ['锐角', '直角', '钝角', '平角'];
  // 特殊角 30°、45°、60° 的三个三角函数（精确值）
  const TRIG = [
    { sin: R.from(Q(1, 2)), cos: R.sqrt(Q(3, 4)), tan: R.sqrt(Q(1, 3)) },
    { sin: R.sqrt(Q(1, 2)), cos: R.sqrt(Q(1, 2)), tan: R.from(Q(1)) },
    { sin: R.sqrt(Q(3, 4)), cos: R.from(Q(1, 2)), tan: R.sqrt(Q(3)) },
  ];

  U.registerPack({
    id: 'angletrig', version: 1,
    types: {
      // ---------------- 量角器：角的度数 → 读数与种类（锐角/直角/钝角/平角）----------------
      // ---------------- 圆周角：圆心角 → 圆周角（同弧所对的圆周角是圆心角的一半）----------------
      // ---------------- 特殊角的三角函数：30° / 45° / 60° → sin、cos、tan（精确值）----------------
      'trig-table': {
        workspaceRole: 'none',
        handles: true,
        essence: ['E3'],
        label: '特殊角的三角函数', prefix: '三', group: '图形', grades: [9, 9], alias: ['正弦', '余弦', '正切', '特殊角', 'sin', 'cos', 'tan'],
        props: {
          angle: { type: 'choice', label: '角', default: 0, choices: ['30°', '45°', '60°'] },
        },
        lint: { minProps: 1, why: '特殊角表只有一个属性：选哪个角' },
        outputs: {
          sin: { dim: null, kind: 'real', label: 'sin' },
          cos: { dim: null, kind: 'real', label: 'cos' },
          tan: { dim: null, kind: 'real', label: 'tan' },
        },
        icon: () => K.text(32, 22, 'sin', { size: 13 }) + K.text(32, 40, 'tan', { size: 13 }),
        size: () => [200, 120],
        compute: (c) => {
          const v = TRIG[c.props.angle];
          c.say('ok', ['30°', '45°', '60°'][c.props.angle] + ' 的三个值是精确值，不用小数');
          return { sin: U.val('real', v.sin), cos: U.val('real', v.cos), tan: U.val('real', v.tan) };
        },
        badge: (c) => (c.out && c.out.sin ? 'sin ' + U.KINDS.real.show(c.out.sin.data) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.out && c.out.sin ? 'sin ' + U.KINDS.real.show(c.out.sin.data) + '  tan ' + U.KINDS.real.show(c.out.tan.data) : '…', { size: 14, weight: 700 }),
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
