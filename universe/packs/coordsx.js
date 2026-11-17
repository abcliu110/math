/* 器材包 coordsx：数对表示位置（5 年级）、绕点旋转（5、9 年级）、反比例（9 年级）、直线与圆的位置关系（9 年级）。
 * 点的值是 {x, y}（有理数），用 U.val('point', …)。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;

  // 角度选择：选项的下标 0/1/2 对应 90/180/270 度（逆时针）
  const TURN = [90, 180, 270];

  // 抛物线 y = ax² + bx + c 的系数（任务 J）。a = 0 时不是抛物线：quadOf 返回 null 并说明
  const QUAD_PROPS = {
    a: { type: 'int', label: 'a（x² 前）', default: 1, min: -10, max: 10 },
    b: { type: 'int', label: 'b（x 前）', default: 0, min: -20, max: 20 },
    c: { type: 'int', label: 'c（常数）', default: 0, min: -20, max: 20 },
    label: { type: 'text', label: '标签', default: '' },
  };
  const quadOf = (c) => {
    const a = Q(Number(c.props.a)), b = Q(Number(c.props.b)), cc = Q(Number(c.props.c));
    if (a.n === 0n) { c.say('reject', 'a 不能是 0：那样就不是抛物线，是直线了'); return null; }
    return { a, b, c: cc };
  };

  U.registerPack({
    id: 'coordsx', version: 1,
    types: {
      // ---------------- 数对：第几列、第几行，输出点 ----------------
      // ---------------- 绕点旋转：输入一个点，绕中心逆时针转 90/180/270 度，输出新点 ----------------
      // ---------------- 反比例：y = k / x ----------------
      'inverse-prop': {
        workspaceRole: 'none',
        handles: true,
        essence: ['E3', 'E8'],
        label: '反比例', prefix: '反', group: '函数', grades: [9, 9], alias: ['反比例', 'y=k/x', '乘积', '积不变'],
        props: {
          k: { type: 'int', label: 'k（x 与 y 的乘积）', default: 6 },
          x: { type: 'num', label: 'x 等于', default: 2, min: -99999, max: 99999, step: 1 },
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
      // ---------------- 抛物线的精确坐标（任务 J，§10.7）：y = ax² + bx + c 的顶点、与 x 轴交点、与 y 轴交点 ----------------
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
