/* 新手引导（2.13 / V7）：第一次看到几何工作区时，在台面右上角弹出一个四步的小卡片；点“知道了”关闭后记住（本地存储，
 * 写进 try/catch），以后不再自动弹出，菜单里的“几何工作区引导”可以再打开。
 * 卡片不挡鼠标：只有卡片本身和它的按钮能点，卡片外的台面照常操作。 */
(function (G) {
  'use strict';
  const UI = (G.UI = G.UI || {});
  const KEY = 'universe-guide-ws-v1';
  const STEPS = [
    '拖入器材：从右边器材架把图形拖进工作区，或拖台面上的图形卡片。',
    '画线：点工具条的「连线」，再点两下画一条线（Esc 取消）。',
    '剪：先选中一个多边形，点「剪」，再点两下画剪切线。',
    '删除：选中图形后按 Delete；步骤清单里的 ✕ 删除那一步。',
  ];
  let shownNow = false;   // 这个页面里是否已经弹过（本地存不下时，也只在本页弹一次）
  const $ = (s) => document.querySelector(s);
  const seen = () => { try { return G.localStorage.getItem(KEY) === '1'; } catch (e) { return false; } };
  const remember = () => { try { G.localStorage.setItem(KEY, '1'); } catch (e) { /* 存不下就算了，本页内不再自动弹 */ } };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function open() {
    const el = $('#guide'); if (!el) return;
    shownNow = true;
    el.innerHTML = '<div class="guide-hd"><b>几何工作区怎么用</b></div><ol class="guide-steps">' +
      STEPS.map((s) => '<li>' + esc(s) + '</li>').join('') +
      '</ol><div class="guide-ft"><button id="guide-close">知道了</button></div>';
    el.style.display = '';
    el.querySelector('#guide-close').onclick = close;
  }
  function close() {
    const el = $('#guide'); if (el) { el.style.display = 'none'; el.innerHTML = ''; }
    remember();
  }
  // 台面每次渲染后调用：有几何工作区、没看过、本页也还没弹过，就弹出
  function check(hasWs) { if (hasWs && !shownNow && !seen()) open(); }
  UI.Guide = { open, close, check, STEPS, KEY, seen };
})(window);
