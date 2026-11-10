/* 器材包 workspace（任务 H1 内核，见 next-steps.md §10.5）：几何工作区。
 * 工作区是一个容器器材：放进去的步骤不再显示成卡片，而是在工作区里画出来（画法在界面层）。
 * 工具（workspace.tools）作用在选中的对象上，由世界的 t:'tool' 动作建出步骤器材（gcut、gplace、gasm、gmid），
 * 接好连线，放进工作区的 items 槽位。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, F = U.Fig, Geo = U.Geo;
  const isPt = (f) => !!f && f.type === 'point' && f.pts && f.pts.length === 1;

  // 连线、垂线（§10.5.6 第 2 步的最小集，工作区要用它们做中线和高）。规则写在这里，内核的几何规则见 geo-rules.js。
  U.defineRule('geo.seg', {
    on: 'fig', label: '连线：两点连成一条线段', essence: ['E1'], grade: [4, 9], keeps: 'congruence',
    device: 'gseg', wire: ['a', 'b'],
    match(input) {
      if (!isPt(input.a) || !isPt(input.b)) return '连线要两个点';
      if (Q.num(F.d2(input.a.pts[0], input.b.pts[0])) === 0) return '连线要两个不同的点';
    },
    apply(input) { return { type: 'segment', pts: [input.a.pts[0], input.b.pts[0]] }; },
    check() { return true; },
  });

  U.defineRule('geo.perp', {
    on: 'fig', label: '垂线：过一点作线段所在直线的垂线（高）', essence: ['E1', 'E3'], grade: [7, 9], keeps: 'congruence',
    device: 'gfoot', wire: ['p', 's'],
    match(input) {
      if (!isPt(input.p)) return '垂线要从一个点作';
      const s = input.s;
      if (!s || s.type !== 'segment') return '垂线要对着一条线段作';
      if (Q.num(F.d2(s.pts[0], s.pts[1])) === 0) return '这条线段是一个点，作不出垂线';
    },
    apply(input) { const s = input.s; return { type: 'point', pts: [Geo.foot(input.p.pts[0], s.pts[0], s.pts[1])] }; },
    check(input, out) {
      const p = input.p.pts[0], q = out.pts[0], s = input.s;
      const dot = Q.add(Q.mul(Q.sub(q.x, p.x), Q.sub(s.pts[1].x, s.pts[0].x)), Q.mul(Q.sub(q.y, p.y), Q.sub(s.pts[1].y, s.pts[0].y)));
      return Q.num(dot) === 0;
    },
  });

  U.registerPack({
    id: 'workspace', version: 1, needs: ['geo'],
    types: {
      // ---------------- 几何工作区（容器）----------------
      gworkspace: {
        workspaceRole: 'container',
        workbenches: ['geometry'],
        handles: true,
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
            { id: 'seg', label: '连线', rule: 'geo.seg' },
            { id: 'perp', label: '垂线', rule: 'geo.perp' },
            { id: 'cut', label: '剪', rule: 'geo.cut' },
            { id: 'move', label: '移动', rule: 'geo.place' },
            { id: 'rot', label: '旋转', rule: 'geo.place', defaults: { turn: 1 } },
            { id: 'flip', label: '翻转', rule: 'geo.place', defaults: { flip: 1 } },
            { id: 'merge', label: '合并', rule: 'geo.merge' },
            { id: 'mid', label: '中点', rule: 'geo.midpoint' },
            { id: 'fit', label: '对齐到目标', rule: 'geo.fit' },
          ],
        },
        outputs: {
          n: { dim: null, kind: 'num', label: '工作区里的步骤个数' },
        },
        icon: () => K.rect(6, 8, 52, 28, { stroke: 'var(--ink)', r: 3 }) + K.line(12, 30, 30, 16, { w: 2 }) + K.line(30, 16, 50, 30, { w: 2, dash: '4 3' }),
        size: () => [380, 300],
        compute: (c) => ({ n: U.val('num', Q(c.kids('items').length), { dim: null }) }),
        badge: (c) => (c.out && c.out.n ? U.showVal(c.out.n) + ' 步' : ''),
        draw: (c) => K.rect(4, 4, c.w - 8, c.h - 8, { stroke: 'var(--line)', r: 4 }) +
          K.text(c.w / 2, c.h / 2 + 4, (c.props.title || '几何工作区') + (c.out && c.out.n ? '：' + U.showVal(c.out.n) + ' 步' : ''), { size: 13, weight: 700 }),
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
