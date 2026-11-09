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
      'protractor-read': {
        essence: ['E3'],
        label: '量角器', prefix: '角', group: '图形', grades: [2, 6], alias: ['量角', '角的度数', '直角', '钝角', '锐角'],
        props: {
          angle: { type: 'int', label: '角的度数（0–180）', default: 90, min: 0, max: 180 },
          label: { type: 'text', label: '标签', default: '' },
        },
        lint: { minProps: 2, why: '量角器只有“角的度数”和标签两个属性' },
        outputs: {
          deg: { dim: null, kind: 'num', label: '度数' },
          kind: { dim: null, kind: 'num', label: '种类（0 锐角 1 直角 2 钝角 3 平角）' },
        },
        icon: () => K.circle(32, 36, 22, { stroke: 'var(--ink)', w: 1.5 }) + K.line(32, 36, 54, 36, { w: 2 }) + K.line(32, 36, 42, 16, { w: 2, stroke: 'var(--accent)' }),
        size: () => [200, 120],
        compute: (c) => {
          const d = c.props.angle;
          if (d === 0) { c.say('info', '0° 还不是角，把角的一边转开一点'); return { deg: U.val('num', Q(0)), kind: null }; }
          const kind = d < 90 ? 0 : d === 90 ? 1 : d < 180 ? 2 : 3;
          c.say('ok', d + '° 是' + KIND_NAMES[kind]);
          return { deg: U.val('num', Q(d)), kind: U.val('num', Q(kind)) };
        },
        badge: (c) => (c.out && c.out.kind ? KIND_NAMES[c.out.kind.data.n] : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.out && c.out.deg ? c.out.deg.data.n + '° ' + (c.out.kind ? KIND_NAMES[c.out.kind.data.n] : '') : '…', { size: 16, weight: 700 }),
      },

      // ---------------- 圆周角：圆心角 → 圆周角（同弧所对的圆周角是圆心角的一半）----------------
      'circle-angle': {
        essence: ['E5'],
        label: '圆周角', prefix: '周', group: '图形', grades: [9, 9], alias: ['圆心角', '圆周角', '同弧'],
        props: {
          center_angle: { type: 'int', label: '圆心角（度）', default: 60, min: 0, max: 360 },
          label: { type: 'text', label: '标签', default: '' },
        },
        lint: { minProps: 2, why: '圆周角器材只有“圆心角”和标签两个属性' },
        outputs: { inscribed: { dim: null, kind: 'num', label: '圆周角（度）' } },
        icon: () => K.circle(32, 24, 16, { stroke: 'var(--ink)', w: 1.5 }) + K.line(32, 24, 22, 40, { w: 1.5 }) + K.line(32, 24, 46, 40, { w: 1.5 }),
        size: () => [200, 120],
        compute: (c) => {
          const d = c.props.center_angle;
          const half = Q.div(Q(d), Q(2));
          c.say('ok', '圆周角是圆心角的一半：' + d + '° ÷ 2 = ' + Q.show(half) + '°');
          return { inscribed: U.val('num', half) };
        },
        badge: (c) => (c.out && c.out.inscribed ? Q.show(c.out.inscribed.data) + '°' : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.out && c.out.inscribed ? '圆周角 ' + Q.show(c.out.inscribed.data) + '°' : '…', { size: 16, weight: 700 }),
      },

      // ---------------- 特殊角的三角函数：30° / 45° / 60° → sin、cos、tan（精确值）----------------
      'trig-table': {
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
