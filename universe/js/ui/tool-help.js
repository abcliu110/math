/* 工作区工具说明（2.5 / V7）：每个工具一条，集中在这一张表里。
 * tip：悬停或键盘聚焦到工具按钮时显示的说明（先选什么、再点什么）；
 * now：工具进入“点两下画线”等模式后，台面上显示的当前工具状态（没有 now 的工具没有持续状态，只有 tip）。
 * 表的键是工具 id（packs/workspace.js 里 workspace.tools 的 id），界面代码不写器材名；加一个工具，只在这里加一行。
 * 没有说明的工具：UI.ToolHelp.of 返回 null，按钮不显示说明（tests/ui-feedback.js 会检查每个工具都有说明）。 */
(function (G) {
  'use strict';
  const UI = (G.UI = G.UI || {});
  const TABLE = {
    seg:   { tip: '点两下画一条线（也可以按住从起点拖到终点）。快捷键 L；不选工具，按住 Shift 拖也能画', now: '当前工具：连线，拖出一条线，或点两下（V 或 Esc 退出）' },
    cut:   { tip: '先选中一个多边形，再拖出（或点两下）一条剪切线。快捷键 C', now: '当前工具：剪，拖出一条剪切线，或点两下（V 或 Esc 退出）' },
    perp:  { tip: '选一个点和一条线段（先后不限），点这里画出过这个点的垂线' },
    move:  { tip: '选中图形，在「向右」「向上」里填格数，再点这里移动；直接拖动块也行' },
    rot:   { tip: '选中块，点这里转 90°（选中块后按 R 也行）' },
    flip:  { tip: '选中块，点这里左右翻转（选中块后按 F 也行）' },
    merge: { tip: '选中几块边对边贴着的块（Shift 点可以多选），点这里拼成一个图形' },
    mid:   { tip: '先选两个点，点这里取它们连线的中点' },
    fit:   { tip: '先点目标图形，再点要摆进去的块（Shift 点可以多选），看能不能拼成目标' },
  };
  // 工具的说明（没有就是 null）
  const of = (id) => (Object.prototype.hasOwnProperty.call(TABLE, id) ? TABLE[id] : null);
  // 台面上的当前工具状态文字（没有就是空串）
  const status = (id) => { const h = of(id); return h && h.now ? h.now : ''; };
  UI.ToolHelp = { TABLE, of, status };
})(window);
