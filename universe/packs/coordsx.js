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
      'pair-pos': {
        workspaceRole: 'none',
        handles: true,
        essence: ['E2'],
        label: '数对', prefix: '数对', group: '图形', grades: [5, 6], alias: ['位置', '列行', '第几列', '第几行'],
        props: {
          col: { type: 'int', label: '第几列（先写列）', default: 3, min: 0, max: 9 },
          row: { type: 'int', label: '第几行（后写行）', default: 2, min: 0, max: 9 },
          label: { type: 'text', label: '标签', default: '' },
        },
        outputs: { p: { dim: null, kind: 'point', label: '点' } },
        icon: () => K.line(8, 36, 56, 36, { w: 1.5 }) + K.line(12, 8, 12, 36, { w: 1.5 }) + K.circle(40, 20, 3.5, { fill: 'var(--accent)' }) + K.text(40, 14, '(4,3)', { size: 12 }),
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
        workspaceRole: 'none',
        handles: true,
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
      'circle-line': {
        workspaceRole: 'none',
        handles: true,
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

      // ---------------- 抛物线的精确坐标（任务 J，§10.7）：y = ax² + bx + c 的顶点、与 x 轴交点、与 y 轴交点 ----------------
      // 输出是符号点（kind spoint），坐标可以是 有理数 + 有理数 × √d。a = 0 不是抛物线。
      'quad-vertex': {
        workspaceRole: 'none',
        handles: true,
        essence: ['E10', 'E8'],
        label: '抛物线顶点（精确）', prefix: '顶', group: '函数', grades: [9, 9], alias: ['顶点', '二次函数', '精确坐标', '抛物线'],
        props: QUAD_PROPS,
        outputs: { v: { dim: null, kind: 'spoint', label: '顶点（精确坐标）' } },
        icon: () => '<path d="M10 12 Q32 56 54 12" fill="none" stroke="var(--good)" stroke-width="3"/>' + K.circle(32, 34, 3.5, { fill: 'var(--accent)' }),
        size: () => [200, 110],
        compute: (c) => {
          const q = quadOf(c); if (!q) return {};
          const vx = Q.neg(Q.div(q.b, Q.mul(Q(2), q.a)));
          const vy = Q.add(Q.mul(q.a, Q.mul(vx, vx)), Q.add(Q.mul(q.b, vx), q.c));
          const v = U.SPoint.of(U.Real.from(vx), U.Real.from(vy));
          c.say('ok', '顶点 ' + U.KINDS.spoint.show(v.data));
          return { v };
        },
        badge: (c) => (c.out.v ? U.showVal(c.out.v) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.out.v ? '顶点 ' + U.showVal(c.out.v) : '顶点', { size: 14, weight: 700 }),
      },

      'quad-xint': {
        workspaceRole: 'none',
        handles: true,
        essence: ['E10', 'E8'],
        label: '抛物线与 x 轴交点（精确）', prefix: '交', group: '函数', grades: [9, 9], alias: ['与 x 轴', '根', '判别式', '二次函数'],
        props: QUAD_PROPS,
        outputs: {
          p1: { dim: null, kind: 'spoint', label: '交点 1（x 较小的那个，或 + 的那个）' },
          p2: { dim: null, kind: 'spoint', label: '交点 2' },
        },
        icon: () => '<path d="M8 40 Q32 -8 56 40" fill="none" stroke="var(--good)" stroke-width="3"/>' + K.line(6, 40, 58, 40, { w: 1.5, stroke: 'var(--dim)' }),
        size: () => [200, 110],
        compute: (c) => {
          const q = quadOf(c); if (!q) return {};
          const disc = Q.sub(Q.mul(q.b, q.b), Q.mul(Q(4), Q.mul(q.a, q.c)));
          if (disc.n < 0) { c.say('info', '判别式 < 0，与 x 轴没有交点'); return {}; }
          // 求根公式：精确根（一个根式）。根号太大时退回近似值（标 ≈）
          let roots = null;
          try { roots = U.Eqn.quadratic(q.a, q.b, q.c).roots; } catch (e) { roots = null; }
          let out;
          if (roots && roots.length === 2) {
            out = { p1: U.SPoint.of(roots[0], U.Real.from(Q(0))), p2: U.SPoint.of(roots[1], U.Real.from(Q(0))) };
          } else {
            const a = Q.num(q.a), b = Q.num(q.b), s = Math.sqrt(Q.num(disc));
            out = { p1: U.SPoint.approx((-b + s) / (2 * a), 0), p2: U.SPoint.approx((-b - s) / (2 * a), 0) };
          }
          c.say('ok', '与 x 轴交点 ' + U.showVal(out.p1) + (disc.n === 0n ? '（只有一个）' : '、' + U.showVal(out.p2)));
          return out;
        },
        badge: (c) => (c.out.p1 ? U.showVal(c.out.p1) + (c.out.p2 ? '、' + U.showVal(c.out.p2) : '') : '无交点'),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.out.p1 ? '与 x 轴：' + U.showVal(c.out.p1) + (c.out.p2 ? '、' + U.showVal(c.out.p2) : '') : '与 x 轴没有交点', { size: 13, weight: 700 }),
      },

      'quad-yint': {
        workspaceRole: 'none',
        handles: true,
        essence: ['E10', 'E8'],
        label: '抛物线与 y 轴交点（精确）', prefix: '纵', group: '函数', grades: [9, 9], alias: ['与 y 轴', '常数项', '二次函数'],
        props: QUAD_PROPS,
        outputs: { p: { dim: null, kind: 'spoint', label: '与 y 轴的交点 (0, c)' } },
        icon: () => K.line(32, 6, 32, 58, { w: 1.5, stroke: 'var(--dim)' }) + K.circle(32, 40, 3.5, { fill: 'var(--accent)' }),
        size: () => [200, 110],
        compute: (c) => {
          const q = quadOf(c); if (!q) return {};
          const p = U.SPoint.of(U.Real.from(Q(0)), U.Real.from(q.c));
          c.say('ok', '与 y 轴交于 ' + U.KINDS.spoint.show(p.data));
          return { p };
        },
        badge: (c) => (c.out.p ? U.showVal(c.out.p) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.out.p ? '与 y 轴：' + U.showVal(c.out.p) : '与 y 轴', { size: 14, weight: 700 }),
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
