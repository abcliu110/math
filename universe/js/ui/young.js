/* 低年级模式（next-steps 10.5.9 第二节第 11 条，§11）：字体更大、按钮更大、工作区的工具只留最常用的几个。
 * UI.Young.TOOLS 是声明的工具列表（工具 id，见 packs/workspace.js 的 workspace.tools）；不按器材名判断。
 * 菜单里的“低年级模式”开关：开了写 <html data-young="on">（css/universe.css 里 html[data-young="on"] 的规则放大字体和按钮），
 * 关了是 "off"。颜色不变，所以两套主题的对比度不受影响（tools/contrast.js 的 young 模式检查）。
 * 记在 localStorage（universe.young），和 theme.js 一样 try/catch：存储不可用就只在内存里生效。
 * 放在 <head> 里同步执行（紧跟 theme.js），首屏就是正确的状态。 */
(function (G) {
  'use strict';
  const UI = (G.UI = G.UI || {});
  const KEY = 'universe.young';
  // 声明：低年级模式下，工作区工具行只留这几个（移动、旋转、翻转、合并）
  const TOOLS = Object.freeze(['move', 'rot', 'flip', 'merge']);
  let on = false;
  try { on = G.localStorage.getItem(KEY) === 'on'; } catch (e) { /* 存储不可用：默认关 */ }
  // 按钮文字和 aria-pressed 写当前状态；按钮还没有生成时（脚本在 <head> 里先跑）等 DOM 好了再写
  function paint() {
    const b = G.document.getElementById('youngbtn');
    if (b) { b.textContent = '低年级模式：' + (on ? '开' : '关'); b.setAttribute('aria-pressed', on ? 'true' : 'false'); }
  }
  function apply() { G.document.documentElement.setAttribute('data-young', on ? 'on' : 'off'); paint(); }
  function toggle() {
    on = !on;
    try { if (on) G.localStorage.setItem(KEY, 'on'); else G.localStorage.removeItem(KEY); } catch (e) { /* 存储不可用：只在内存里生效 */ }
    apply();
    if (UI.Stage && UI.Stage.render) UI.Stage.render();   // 工作区的工具行跟着变
  }
  // 工具是否显示：低年级模式关时全部显示；开时只显示声明的
  const showTool = (id) => !on || TOOLS.indexOf(id) >= 0;
  apply();
  G.document.addEventListener('DOMContentLoaded', paint);
  G.document.addEventListener('click', (e) => { const t = e.target; if (t && t.closest && t.closest('#youngbtn')) toggle(); });
  UI.Young = { TOOLS, get: () => on, showTool, toggle };
})(window);
