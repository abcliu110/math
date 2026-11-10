/* 器材包 databench：数据图表台（D8，docs/direction.md 第 7 节 D8）。
 * 录数据、画散点图、拟合直线，都在它自己的面板里用鼠标做（js/ui/wb-kit.js）；步骤写在台面的 scene.workbench 上（U.DataBench）。
 * 拟合出来的直线，斜率 k 和截距 b 从输出口给出去，别的器材可以接。 */
(function (G) {
  'use strict';
  const U = G.U, K = U.kit;

  const safe = (fn, fb) => { try { return fn(); } catch (e) { return fb; } };

  U.registerPack({
    id: 'databench', version: 1,
    types: {
      databench: {
        workspaceRole: 'none',
        handles: true,
        inspector: 'workbench',
        wbUI: 'data',
        workbenches: ['data'],
        essence: ['E3', 'E7'],
        label: '数据图表台', prefix: '图表', group: '统计与概率', grades: [6, 9], alias: ['散点图', '拟合', '录数据', '画图', '直线'],
        props: {
          title: { type: 'text', label: '标题', default: '实验数据' },
        },
        lint: { minProps: 1, why: '图表台只有一个标题；数据和直线都在它自己的面板里录、画、拟合' },
        outputs: {
          k: { dim: null, kind: 'num', label: '斜率 k' },
          b: { dim: null, kind: 'num', label: '截距 b' },
        },
        icon: () => K.line(10, 34, 56, 10, { w: 2, stroke: 'var(--accent)' }) + [[14, 28], [26, 22], [38, 18], [50, 12]].map(([x, y]) => K.circle(x, y, 2.5, { fill: 'var(--ink)' })).join(''),
        size: () => [230, 120],
        compute: (c) => {
          const st = safe(() => U.DataBench.current(c.scene, c.ent.id), null);
          if (!st || !st.fit) { c.say('info', '还没有拟合出直线'); return {}; }
          c.say('ok', U.DataBench.fitText(st.fit));
          return { k: U.val('num', st.fit.k), b: U.val('num', st.fit.b) };
        },
        badge: (c) => (c.out.k ? '拟合好了' : ''),
        draw: (c) => {
          const v = safe(() => U.DataBench.view(U.DataBench.current(c.scene, c.ent.id)), null);
          const t = v ? (v.fit ? v.fit.text : v.n + ' 组数据') : '还没有数据';
          return K.text(c.w / 2, c.h / 2 - 4, c.props.title || '数据图表台', { size: 13, weight: 700, fill: 'var(--dim)' }) +
            K.text(c.w / 2, c.h / 2 + 16, t, { size: 15, weight: 700 });
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
