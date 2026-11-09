/* 器材包 coordsx：数对表示位置（5 年级）、绕点旋转（5、9 年级）、反比例（9 年级）、直线与圆的位置关系（9 年级）。
 * 点的值是 {x, y}（有理数），用 U.val('point', …)。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;

  // 角度选择：选项的下标 0/1/2 对应 90/180/270 度（逆时针）
  const TURN = [90, 180, 270];

  U.registerPack({
    id: 'coordsx', version: 1,
    types: {
      // ---------------- 数对：第几列、第几行，输出点 ----------------
      'pair-pos': {
        essence: ['E2'],
        label: '数对', prefix: '数对', group: '图形', grades: [5, 6], alias: ['位置', '列行', '第几列', '第几行'],
        props: {
          col: { type: 'int', label: '第几列（先写列）', default: 3, min: 0, max: 9 },
          row: { type: 'int', label: '第几行（后写行）', default: 2, min: 0, max: 9 },
          label: { type: 'text', label: '标签', default: '' },
        },
        outputs: { p: { dim: null, kind: 'point', label: '点' } },
        icon: () => K.line(8, 36, 56, 36, { w: 1.5 }) + K.line(12, 8, 12, 36, { w: 1.5 }) + K.circle(40, 20, 3.5, { fill: 'var(--accent)' }) + K.text(40, 14, '(4,3)', { size: 9 }),
        size: () => [170, 100],
        compute: (c) => {
          const col = c.props.col, row = c.props.row;
          c.say('ok', '第 ' + col + ' 列第 ' + row + ' 行');
          return { p: U.val('point', { x: Q(col), y: Q(row) }) };
        },
        badge: (c) => (c.out.p ? U.KINDS.point.show(c.out.p.data) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, '第 ' + c.props.col + ' 列第 ' + c.props.row + ' 行', { size: 14, weight: 700 }),
      },

      // ---------------- 绕点旋转：输入一个点，绕中心逆时针转 90/180/270 度，输出新点 ----------------
      'rotate-about': {
        essence: ['E5', 'E3'],
        label: '绕点旋转', prefix: '旋', group: '图形', grades: [5, 9], alias: ['旋转', '中心', '逆时针', '绕点'],
        props: {
          cx: { type: 'int', label: '中心 x', default: 0, min: -9, max: 9 },
          cy: { type: 'int', label: '中心 y', default: 0, min: -9, max: 9 },
          angle: { type: 'choice', label: '逆时针转', default: 0, choices: ['90°', '180°', '270°'] },
          label: { type: 'text', label: '标签', default: '' },
        },
        inputs: { p: { kind: 'point', label: '点' } },
        outputs: { q: { dim: null, kind: 'point', label: '旋转后的点' } },
        icon: () => K.circle(20, 24, 3, { fill: 'var(--ink)' }) + K.circle(44, 24, 3, { fill: 'var(--accent)' }) + K.line(20, 24, 44, 24, { w: 1, stroke: 'var(--dim)' }),
        size: () => [190, 110],
        compute: (c) => {
          const v = K.first(c.inp.p);
          if (!v || v.kind !== 'point') { c.say('info', '接一个点'); return {}; }
          const cx = Q(c.props.cx), cy = Q(c.props.cy);
          // 先把点平移到以中心为原点，再旋转，最后加回中心
          const dx = Q.sub(v.data.x, cx), dy = Q.sub(v.data.y, cy);
          const deg = TURN[c.props.angle];
          let rx, ry;
          if (deg === 90) { rx = Q.neg(dy); ry = dx; }
          else if (deg === 180) { rx = Q.neg(dx); ry = Q.neg(dy); }
          else { rx = dy; ry = Q.neg(dx); }
          const x = Q.add(rx, cx), y = Q.add(ry, cy);
          c.say('ok', '绕 (' + c.props.cx + ', ' + c.props.cy + ') 逆时针转 ' + deg + '°');
          return { q: U.val('point', { x, y }) };
        },
        badge: (c) => (c.out.q ? U.KINDS.point.show(c.out.q.data) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.out.q ? '转到 ' + U.KINDS.point.show(c.out.q.data) : '绕 (' + c.props.cx + ', ' + c.props.cy + ') 转 ' + TURN[c.props.angle] + '°', { size: 14, weight: 700 }),
      },

      // ---------------- 反比例：y = k / x ----------------
      'inverse-prop': {
        essence: ['E3', 'E8'],
        label: '反比例', prefix: '反', group: '函数', grades: [9, 9], alias: ['反比例', 'y=k/x', '乘积', '积不变'],
        props: {
          k: { type: 'int', label: 'k（x 与 y 的乘积）', default: 6 },
          x: { type: 'num', label: 'x 等于', default: 2, min: -99, max: 99, step: 1 },
          label: { type: 'text', label: '标签', default: '' },
        },
        outputs: { y: { dim: null, kind: 'num', label: 'y' } },
        icon: () => K.text(32, 28, 'y=k/x', { size: 15, weight: 700 }),
        size: () => [170, 100],
        compute: (c) => {
          if (Number(c.props.x) === 0) { c.say('reject', 'x 不能是 0'); return {}; }
          const y = Q.div(Q(c.props.k), Q.fromNumber(Number(c.props.x)));
          c.say('ok', c.props.k + ' ÷ ' + c.props.x + ' = ' + Q.show(y));
          return { y: U.val('num', y) };
        },
        badge: (c) => (c.out.y ? 'y = ' + Q.show(c.out.y.data) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.out.y ? 'y = ' + Q.show(c.out.y.data) : 'y = ' + c.props.k + ' / x', { size: 14, weight: 700 }),
      },

      // ---------------- 直线与圆：半径 r，圆心到直线的距离 d；输出 0 相离 / 1 相切 / 2 相交 ----------------
      'circle-line': {
        essence: ['E5', 'E3'],
        label: '直线与圆', prefix: '线', group: '图形', grades: [9, 9], alias: ['相离', '相切', '相交', '圆心到直线的距离'],
        props: {
          r: { type: 'int', label: '圆的半径 r', default: 3, min: 1, max: 20 },
          d: { type: 'num', label: '圆心到直线的距离 d', default: 2, min: 0, max: 20, step: 1 },
          label: { type: 'text', label: '标签', default: '' },
        },
        outputs: { rel: { dim: null, kind: 'num', label: '位置关系（0 相离，1 相切，2 相交）' } },
        icon: () => K.circle(30, 26, 12, { stroke: 'var(--ink)', fill: 'none' }) + K.line(6, 26, 58, 26, { w: 1.5, stroke: 'var(--accent)' }),
        size: () => [190, 110],
        compute: (c) => {
          const d = Q.fromNumber(Number(c.props.d)), r = Q(c.props.r);
          const k = Q.cmp(d, r);
          const word = k > 0 ? '相离' : k === 0 ? '相切' : '相交';
          const rel = k > 0 ? 0 : k === 0 ? 1 : 2;
          c.say(k === 0 ? 'ok' : 'info', '圆心到直线的距离 d = ' + Q.show(d) + '，半径 r = ' + r + '：' + word);
          return { rel: U.val('num', Q(rel)) };
        },
        badge: (c) => (c.out.rel ? ['相离', '相切', '相交'][c.out.rel.data.n] : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.out.rel ? ['相离', '相切', '相交'][c.out.rel.data.n] : '… ', { size: 16, weight: 700 }),
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
