/* 器材包 workspace（任务 H1 内核，见 next-steps.md §10.5）：几何工作区。
 * 工作区是一个容器器材：放进去的步骤不再显示成卡片，而是在工作区里画出来（画法在界面层）。
 * 工具（workspace.tools）作用在选中的对象上，由世界的 t:'tool' 动作建出步骤器材（gcut、gplace、gasm、gmid），
 * 接好连线，放进工作区的 items 槽位。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;

  U.registerPack({
    id: 'workspace', version: 1, needs: ['geo'],
    types: {
      // ---------------- 几何工作区（容器）----------------
      gworkspace: {
        essence: ['E1', 'E5'],
        label: '几何工作区', prefix: '工作区', group: '图形', grades: [4, 9],
        slots: {
          items: { accepts: '*', max: null, layout: 'free' },
        },
        props: {
          title: { type: 'text', label: '标题', default: '' },
          show: { type: 'bool', label: '显示步骤', default: true },
        },
        lint: { minProps: 2, why: '工作区只有标题和显示开关，内容由放进去的步骤决定' },
        // 工具：选中的对象 → 步骤器材。rule 指向 geo-rules.js 登记的规则；defaults 是工具自带的参数
        workspace: {
          shows: ['fig', 'figs'],
          tools: [
            { id: 'cut', label: '剪', rule: 'geo.cut' },
            { id: 'move', label: '移动', rule: 'geo.place' },
            { id: 'rot', label: '旋转', rule: 'geo.place', defaults: { turn: 1 } },
            { id: 'flip', label: '翻转', rule: 'geo.place', defaults: { flip: 1 } },
            { id: 'merge', label: '合并', rule: 'geo.merge' },
            { id: 'mid', label: '中点', rule: 'geo.midpoint' },
          ],
        },
        outputs: {
          n: { dim: null, kind: 'num', label: '工作区里的步骤个数' },
        },
        icon: () => K.rect(6, 8, 52, 28, { stroke: 'var(--ink)', r: 3 }) + K.line(12, 30, 30, 16, { w: 2 }) + K.line(30, 16, 50, 30, { w: 2, dash: '4 3' }),
        size: () => [300, 220],
        compute: (c) => ({ n: U.val('num', Q(c.kids('items').length), { dim: null }) }),
        badge: (c) => (c.out && c.out.n ? U.showVal(c.out.n) + ' 步' : ''),
        draw: (c) => K.rect(4, 4, c.w - 8, c.h - 8, { stroke: 'var(--line)', r: 4 }) +
          K.text(c.w / 2, c.h / 2 + 4, (c.props.title || '几何工作区') + (c.out && c.out.n ? '：' + U.showVal(c.out.n) + ' 步' : ''), { size: 13, weight: 700 }),
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
