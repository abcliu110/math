/* 界面外框（V2，docs/ui-geometry-feedback.md 1.2 和第 3 节 V2）：左右栏收成窄条、工作区浮动工具条和抽屉的收起状态。
 * 状态只记在这里（UI.Chrome），不进台面的存档、也不进撤销：
 *   left / right：左右栏，'open' 展开、'rail' 收成窄条；没设过（undefined）时，几何工作区打开且窗口窄于 RAIL.autoBP 就自动收起。
 *   bar：工作区浮动工具条，'shut' 收起、其余展开。
 *   focusSide：专注模式里的抽屉，'open' 或 'shut'；没设过时按窗口宽度（DRAWER.wideBP）定。
 * 偏好存在 localStorage（读写都包在 try 里，不可用时就只在本次页面里记住）。
 * 只在桌面宽度（超过 RAIL.overlayBP）才收窄条；窄屏的栏本来就是盖在上面的（见 css/universe.css 的 @media）。 */
(function (G) {
  'use strict';
  const UI = (G.UI = G.UI || {}), L = UI.LAYOUT;
  const KEY = 'universe.chrome';
  let prefs = null;
  function load() {
    if (prefs) return prefs;
    try { prefs = JSON.parse(G.localStorage.getItem(KEY) || '{}') || {}; } catch (e) { prefs = {}; }
    return prefs;
  }
  function get(k) { return load()[k]; }
  function set(k, v) {
    load()[k] = v;
    try { G.localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) { /* 存不了就只在本页记住 */ }
  }
  // 台面上有没有几何工作区（有了才会自动收起左右栏）
  function hasWorkspace() {
    const S = UI.S;
    return !!S && Object.values(S.scene.entities).some((e) => !!(G.U.types[e.type] || {}).workspace);
  }
  function railWanted(side) {
    if (G.innerWidth <= L.RAIL.overlayBP) return false;   // 窄屏：栏是盖在上面的，不收窄条
    const v = get(side);
    if (v === 'rail') return true;
    if (v === 'open') return false;
    return G.innerWidth < L.RAIL.autoBP && hasWorkspace();
  }
  // 按偏好和窗口宽度，把两侧栏摆成展开或窄条；返回有没有变（变了，台面要重新适应）
  function apply() {
    const body = G.document.body, before = body.className;
    const lw = railWanted('left'), rw = railWanted('right');
    body.classList.toggle('rail-l', lw);
    body.classList.toggle('rail-r', rw);
    const lb = G.document.getElementById('lrail'), rb = G.document.getElementById('rrail');
    if (lb) { lb.textContent = lw ? '›' : '‹'; lb.title = lw ? '展开实验库' : '收起实验库'; }
    if (rb) { rb.textContent = rw ? '‹' : '›'; rb.title = rw ? '展开器材架' : '收起器材架'; }
    return body.className !== before;
  }
  function railOn(side) { return G.document.body.classList.contains('rail-' + (side === 'left' ? 'l' : 'r')); }
  // 点按钮：翻过来，记下偏好
  function toggleRail(side) { set(side, railOn(side) ? 'open' : 'rail'); return apply(); }
  function barShut() { return get('bar') === 'shut'; }
  function toggleBar() { set('bar', barShut() ? 'open' : 'shut'); }
  function focusSideOpen() {
    const v = get('focusSide');
    if (v === undefined) return G.innerWidth >= L.DRAWER.wideBP;
    return v === 'open';
  }
  function toggleFocusSide() { set('focusSide', focusSideOpen() ? 'shut' : 'open'); }

  UI.Chrome = { apply, toggleRail, railOn, barShut, toggleBar, focusSideOpen, toggleFocusSide, hasWorkspace };
})(window);
