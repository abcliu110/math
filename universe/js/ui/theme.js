/* 外观（V10，docs/ui-geometry-feedback.md 2.11）：深色 / 浅色两套颜色令牌（css/universe.css：:root 是深色，:root[data-theme="light"] 是浅色）。
 * 默认跟随系统（prefers-color-scheme）；菜单里的“外观”按钮循环切换：跟随系统 → 浅色 → 深色，选择记在 localStorage（try/catch，存储不可用就只在内存里生效）。
 * 实现：这里算出实际主题，写到 <html data-theme="light|dark">；CSS 只看这个属性。系统偏好变了（跟随系统时）也会跟着换。
 * 放在 <head> 里同步执行，首屏就是正确的主题，不会先闪一下深色。 */
(function (G) {
  'use strict';
  const UI = (G.UI = G.UI || {});
  const KEY = 'universe.theme', MODES = ['auto', 'light', 'dark'];
  const LABEL = { auto: '跟随系统', light: '浅色', dark: '深色' };
  const mq = G.matchMedia ? G.matchMedia('(prefers-color-scheme: light)') : null;
  let mode = 'auto';
  try { const v = G.localStorage.getItem(KEY); if (MODES.indexOf(v) >= 0) mode = v; } catch (e) { /* 存储不可用：跟随系统 */ }
  const resolved = () => (mode === 'auto' ? (mq && mq.matches ? 'light' : 'dark') : mode);
  // 页面上的按钮文字写当前选择；按钮还没有生成时（脚本在 <head> 里先跑）等 DOM 好了再写
  function paintButton() { const b = G.document.getElementById('themebtn'); if (b) b.textContent = '外观：' + LABEL[mode]; }
  function apply() { G.document.documentElement.setAttribute('data-theme', resolved()); paintButton(); }
  function set(m) {
    if (MODES.indexOf(m) < 0) return;
    mode = m;
    try { if (m === 'auto') G.localStorage.removeItem(KEY); else G.localStorage.setItem(KEY, m); } catch (e) { /* 存储不可用：只在内存里生效 */ }
    apply();
  }
  const cycle = () => set(MODES[(MODES.indexOf(mode) + 1) % MODES.length]);
  // 高对比度（V10，2.6b）：菜单里的开关，开了写 data-contrast="high"（css/universe.css 里两套高对比度令牌）；记在 localStorage，同样 try/catch
  const CKEY = 'universe.contrast';
  let high = false;
  try { high = G.localStorage.getItem(CKEY) === 'high'; } catch (e) { /* 存储不可用：只在内存里生效 */ }
  function paintContrast() { const b = G.document.getElementById('contrastbtn'); if (b) { b.textContent = '高对比度：' + (high ? '开' : '关'); b.setAttribute('aria-pressed', high ? 'true' : 'false'); } }
  function applyContrast() { G.document.documentElement.setAttribute('data-contrast', high ? 'high' : 'normal'); paintContrast(); }
  function toggleContrast() {
    high = !high;
    try { if (high) G.localStorage.setItem(CKEY, 'high'); else G.localStorage.removeItem(CKEY); } catch (e) { /* 存储不可用：只在内存里生效 */ }
    applyContrast();
    if (G.UI && G.UI.Stage && G.UI.Stage.render) G.UI.Stage.render();   // 线型跟着高对比度换（工作区的线，2026-11）
  }
  applyContrast();
  G.document.addEventListener('click', (e) => { const t = e.target; if (t && t.closest && t.closest('#contrastbtn')) toggleContrast(); });
  // 动画（§10.5.9 第 7 条）：步骤之间的过渡（≤ 300 毫秒）。菜单里的开关；记在 localStorage（'on' / 'off'）。
  // 没有记录时，系统要求减少动态效果（prefers-reduced-motion）就默认关。关了写 data-anim="off"，css 里所有过渡都不播。
  const AKEY = 'universe.anim';
  let anim = true;
  try {
    const v = G.localStorage.getItem(AKEY);
    anim = v === 'on' ? true : v === 'off' ? false : !(G.matchMedia && G.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (e) { /* 存储不可用：按系统设置 */ }
  function paintAnim() { const b = G.document.getElementById('animbtn'); if (b) { b.textContent = '动画：' + (anim ? '开' : '关'); b.setAttribute('aria-pressed', anim ? 'true' : 'false'); } }
  function applyAnim() { G.document.documentElement.setAttribute('data-anim', anim ? 'on' : 'off'); paintAnim(); }
  function toggleAnim() {
    anim = !anim;
    try { G.localStorage.setItem(AKEY, anim ? 'on' : 'off'); } catch (e) { /* 存储不可用：只在内存里生效 */ }
    applyAnim();
  }
  applyAnim();
  G.document.addEventListener('click', (e) => { const t = e.target; if (t && t.closest && t.closest('#animbtn')) toggleAnim(); });
  if (mq) {
    const onChange = () => { if (mode === 'auto') apply(); };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
  }
  apply();
  G.document.addEventListener('DOMContentLoaded', () => { paintButton(); paintContrast(); paintAnim(); });
  G.document.addEventListener('click', (e) => { const t = e.target; if (t && t.closest && t.closest('#themebtn')) cycle(); });
  UI.Theme = { get: () => mode, resolved, set, cycle, LABEL, isHigh: () => high, toggleContrast, anim: () => anim, toggleAnim };
})(window);
