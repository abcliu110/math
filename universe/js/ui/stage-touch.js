/* 台面（V8，2.7）：触屏。只处理 pointerType 为 touch 的事件，鼠标的事件一概不走这里（鼠标行为不变）。
 *   (1) 点击范围：按下时如果手指没正好落在把手或端口上，就在触点附近找最近的一个（它的点击区放大到 TOUCH.min 像素）。
 *   (2) 双指缩放：第二个触点按下时，取消第一个手指正在做的拖动（已经动过的照常提交），之后两个触点的距离变化就是缩放倍数，
 *       中点的移动就是平移（台面，不是工作区）。
 *   (3) 长按（TOUCH.longMs 毫秒，移动不超过 TOUCH.slop 像素）弹出菜单：复制、删除、转 90°（块）、属性。
 * 跨文件的名字经 UI.StageCtx（SG）访问。加载顺序见 index.html。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {});
  const L = UI.LAYOUT, T = L.TOUCH;
  const SG = UI.StageCtx;
  // 可以被“放大点击范围”的把手和端口（画在台面上的、手指不容易点中的小东西）
  const SNAP_SEL = '[data-hdl],[data-drag],.rz,.port.out';
  // 按下时不开长按菜单的控件（它们有自己的按下动作）
  const CONTROL = 'button,input,select,textarea,.tool,.wsx,.wsx-float,.fbar,.wsmini,.fab,.pill,.ctxmenu,[data-why],[data-unlink],[data-link]';
  const MENU_ITEMS = { del: '删除', turn: '转 90°', insp: '属性' };

  SG.touches = new Map();   // 正在按着的触点：pointerId → { x, y }（只记触屏）
  SG.pinch = null;          // 双指缩放中：{ ids, lastD, lastX, lastY }
  SG.lp = null;             // 长按计时：{ id, x, y, what, timer }
  SG.ctxId = null;          // 长按菜单对着的器材（没有菜单时为 null）
  SG.lastTouchAt = 0;

  // (1) 触点附近最近的把手或端口：手指正好在上面就用它；否则找“点击区（至少 TOUCH.min）包住触点”的，取中心最近的
  function touchPick(ev) {
    const direct = ev.target.closest && ev.target.closest(SNAP_SEL);
    if (direct) return direct;
    let best = null, bd = Infinity;
    const x = ev.clientX, y = ev.clientY;
    SG.stageEl.querySelectorAll(SNAP_SEL).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) return;
      const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
      const hw = Math.max(r.width, T.min) / 2, hh = Math.max(r.height, T.min) / 2;
      if (Math.abs(x - cx) > hw || Math.abs(y - cy) > hh) return;
      const d = Math.hypot(x - cx, y - cy);
      if (d < bd) { bd = d; best = el; }
    });
    return best;
  }

  // 松手（或取消）时用：和鼠标的抬起一样，但不带触屏的标记，所以不会再被当成触点处理
  function fakeUp(ev) {
    return { type: 'pointerup', pointerType: 'mouse', pointerId: -1, clientX: ev.clientX, clientY: ev.clientY, target: ev.target,
      shiftKey: false, altKey: false, ctrlKey: false, metaKey: false, preventDefault() {}, stopPropagation() {} };
  }
  const spread = (a, b) => Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));

  // 触点按下。返回 true：这是第二个（或更多）触点，已经处理成双指缩放，调用方不要再处理它
  function touchDown(ev) {
    SG.touches.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    SG.lastTouchAt = Date.now();
    if (SG.pinch) return true;
    if (SG.touches.size < 2) return false;
    lpCancel();
    SG.linking = null; SG.shiftLine = null;
    if (SG.drag) SG.onUp(fakeUp(ev));   // 第一个手指正在拖：先按松手结束（已经动过的照常提交），不留下预览
    SG.drag = null;
    const ids = [...SG.touches.keys()].slice(0, 2), a = SG.touches.get(ids[0]), b = SG.touches.get(ids[1]);
    SG.pinch = { ids, lastD: spread(a, b), lastX: (a.x + b.x) / 2, lastY: (a.y + b.y) / 2 };
    return true;
  }
  // 触点移动。返回 true：双指缩放中，调用方不要再处理
  function touchMove(ev) {
    const p = SG.touches.get(ev.pointerId);
    if (!p) return false;
    p.x = ev.clientX; p.y = ev.clientY;
    if (SG.pinch) { pinchMove(); return true; }
    lpMove(ev);
    return false;
  }
  function pinchMove() {
    const P = SG.pinch, a = SG.touches.get(P.ids[0]), b = SG.touches.get(P.ids[1]);
    if (!a || !b) return;
    const d = spread(a, b), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, S = UI.S;
    SG.zoomAt(d / P.lastD, mx, my);   // 以中点为中心缩放（台面）
    S.view = SG.clampPan(Object.assign({}, S.view, { x: S.view.x + mx - P.lastX, y: S.view.y + my - P.lastY }));   // 中点移动就是平移（夹紧，不把卡片推到标题栏下面）
    P.lastD = d; P.lastX = mx; P.lastY = my;
    SG.render();
  }
  // 触点抬起或取消。返回 true：双指缩放中抬起的，不交给拖动的抬起处理
  function touchEnd(ev) {
    SG.touches.delete(ev.pointerId);
    if (SG.lp && SG.lp.id === ev.pointerId) lpCancel();
    if (SG.pinch) { if (SG.touches.size < 2) SG.pinch = null; return true; }
    return false;
  }
  function onCancel(ev) {
    if (ev.pointerType !== 'touch') return;
    if (!SG.pinch && SG.drag) SG.onUp(fakeUp(ev));   // 系统取消了触摸：拖动按松手结束
    touchEnd(ev);
  }

  // (3) 长按：按下时记下点的是什么（之后台面会重画，元素可能已经不在了，所以记的是名字和 id）
  function lpStart(ev, t) {
    lpCancel();
    if (!t || !t.closest || t.closest(CONTROL)) return;
    const wb = t.closest('.wsbody'), pk = t.closest('[data-pick]'), card = t.closest('.card[data-id]');
    const what = wb && pk ? { ws: wb.dataset.wsid, name: pk.dataset.pick } : card ? { card: card.dataset.id } : null;
    if (!what) return;
    SG.lp = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, what, timer: setTimeout(lpFire, T.longMs) };
  }
  function lpCancel() { if (SG.lp) { clearTimeout(SG.lp.timer); SG.lp = null; } }
  function lpMove(ev) {
    const lp = SG.lp;
    if (lp && lp.id === ev.pointerId && Math.hypot(ev.clientX - lp.x, ev.clientY - lp.y) > T.slop) lpCancel();
  }
  function lpFire() {
    const lp = SG.lp; SG.lp = null;
    if (!lp) return;
    if (SG.drag && SG.drag.moved) return;   // 已经在拖动了，不弹菜单
    let id = lp.what.card || null;
    if (lp.what.name) { const fi = SG.figByName(lp.what.ws, lp.what.name); id = fi ? fi.ent.id : null; }
    if (!id || !UI.S.scene.entities[id]) return;
    SG.drag = null; SG.linking = null;
    openCtx(id, lp.x, lp.y);
  }

  // 长按菜单：一个浮在台面上的小框，按钮是 data-ctx；动作都走 UI.Intent（和鼠标的按钮一样）
  function ensureMenu() {
    if (!SG.menuEl) {
      const el = document.createElement('div');
      el.className = 'ctxmenu'; el.setAttribute('role', 'menu'); el.setAttribute('aria-label', '更多操作');
      el.style.display = 'none';
      el.addEventListener('click', (ev) => {
        const b = ev.target.closest && ev.target.closest('[data-ctx]');
        if (!b || Date.now() - SG.ctxOpenedAt < T.recentMs / 2) return;   // 刚弹出来的一下，系统可能补发一个点击，不算
        ctxAct(b.dataset.ctx);
      });
      SG.stageEl.appendChild(el);
      SG.menuEl = el;
    }
    return SG.menuEl;
  }
  function openCtx(id, x, y) {
    const S = UI.S, e = S.scene.entities[id], el = ensureMenu();
    const keys = ['del'].concat(SG.roleOf(e) === 'piece' ? ['turn'] : [], ['insp']);
    el.innerHTML = keys.map((k) => '<button type="button" role="menuitem" aria-label="' + MENU_ITEMS[k] + '" data-ctx="' + k + '">' + MENU_ITEMS[k] + '</button>').join('');
    const p = UI.Space.stageLocal({ clientX: x, clientY: y });
    el.style.left = p.x + 'px'; el.style.top = p.y + 'px';
    el.style.display = '';
    SG.ctxId = id; SG.ctxOpenedAt = Date.now();
  }
  function closeCtx() {
    SG.ctxId = null;
    if (SG.menuEl) SG.menuEl.style.display = 'none';
  }
  function ctxAct(k) {
    const S = UI.S, id = SG.ctxId;
    closeCtx();
    if (!id || !S.scene.entities[id]) return;
    if (k === 'del') { S.sel = null; return UI.Intent.run('delete', { id }); }
    if (k === 'turn') return UI.Intent.run('piece', { ids: [id], what: 'turn', value: 1 });
    if (k === 'insp') { S.sel = id; S.selLink = null; S.inspOpen = true; UI.Panels.renderInsp(); SG.render(); }
  }

  // 页面级的监听：系统的触摸取消；双指或长按之后的右键菜单（系统补发的 contextmenu）不弹
  function touchBind() {
    G.addEventListener('pointercancel', onCancel);
    SG.stageEl.addEventListener('contextmenu', (ev) => { if (Date.now() - SG.lastTouchAt < T.recentMs) ev.preventDefault(); });
  }

  Object.assign(SG, { touchPick, touchDown, touchMove, touchEnd, lpStart, lpCancel, closeCtx, ctxAct, touchBind, fakeUp });
})(window);
