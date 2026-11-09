/* 器材包 tenframe：十格阵与筹码（1.10 容器的首批器材）。
 * 十格阵有一个槽位 cells（2 行 × 5 列，最多 10 个）；筹码放进去，十格阵就数得出个数、算得出还差几个凑十。
 * 满了再放：拒绝并说明“满十就要换成 1 个十”——这本身就是进位的课。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (q) => U.val('num', q, { dim: null });

  U.registerPack({
    id: 'tenframe', version: 1,
    types: {
      // ---------------- 筹码（可以放进十格阵的小东西）----------------
      counter: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E1', 'E2'],
        label: '筹码', prefix: '筹', group: '数与运算', grades: [1, 2],
        props: {
          color: { type: 'choice', label: '颜色', default: 0, choices: ['红', '蓝', '黄'] },
          mark: { type: 'text', label: '标记', default: '' },
        },
        lint: { minProps: 2, why: '筹码只有颜色和标记两个属性，其余都由容器决定' },
        outputs: { v: { dim: null, kind: 'num', label: '1 个' } },
        icon: () => K.circle(32, 22, 12, { stroke: 'var(--ink)' }),
        size: () => [70, 60],
        compute: () => ({ v: num(Q(1)) }),
        draw: (c) => {
          const fill = ['#ef4444', '#3b82f6', '#eab308'][c.props.color] || '#94a3b8';
          return K.circle(c.w / 2, c.h / 2 - 4, 12, { fill });
        },
      },

      // ---------------- 十格阵（容器）----------------
      tenframe: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E1', 'E2'],
        label: '十格阵', prefix: '十格阵', group: '数与运算', grades: [1, 2],
        slots: {
          cells: { accepts: ['counter'], max: 10, layout: 'grid2x5', fullWhy: '已经满 10 个了——满十就要换成 1 个十' },
        },
        props: {
          label: { type: 'text', label: '标签', default: '' },
          show: { type: 'bool', label: '显示个数', default: true },
        },
        lint: { minProps: 2, why: '容器只有标签和显示开关，内容由放进去的东西决定' },
        outputs: {
          count: { dim: null, kind: 'num', label: '个数' },
          left: { dim: null, kind: 'num', label: '还差几个凑十' },
        },
        icon: () => K.rect(6, 10, 52, 26, { stroke: 'var(--ink)', r: 3 }),
        size: () => [140, 110],
        compute: (c) => {
          const n = c.kids('cells').length;
          return { count: num(Q(n)), left: num(Q(10 - n)) };
        },
        badge: (c) => (c.out && c.out.count ? U.showVal(c.out.count) + ' 个' : ''),
        draw: (c) => {
          let s = '';
          for (let i = 0; i < 10; i++) {
            const col = i % 5, row = Math.floor(i / 5);
            s += K.rect(14 + col * 22, 40 + row * 22 - 28, 20, 20, { stroke: 'var(--line)', r: 2 });
          }
          if (c.props.show && c.out && c.out.count) s += K.text(c.w / 2, c.h - 6, U.showVal(c.out.count) + ' 个', { size: 12, anchor: 'middle', fill: 'var(--dim)' });
          return s;
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
