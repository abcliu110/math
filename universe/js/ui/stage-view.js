/* 台面（D4 拆分）：缩放与平移：工作区滚轮缩放、适应范围、台面适应、台面缩放。由 stage.js 拆出，只搬代码、不改逻辑；跨文件的名字经 UI.StageCtx（SG）访问。加载顺序见 index.html。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), W = U.World, K = U.kit, Q = U.Q;
  const $ = (s) => document.querySelector(s);
  const L = UI.LAYOUT, HD = L.HD, PORT_Y0 = L.PORT_Y0, PORT_DY = L.PORT_DY, PILL_DY = L.PILL_DY, PILL_W = L.PILL_W, MIN_W = L.MIN_W, MIN_H = L.MIN_H;
  const SG = UI.StageCtx;
  // 工作区里滚轮缩放：以指针为中心，只改这个工作区的坐标范围（台面不动）
  function wsZoomAt(wb, f, cx, cy) {
    const S = UI.S, id = wb.dataset.wsid, ws = S.scene.entities[id]; if (!ws) return;
    const cw = +wb.getAttribute('width'), ch = +wb.getAttribute('height'), Sp = UI.Space;
    const local = Sp.screenToCanvas({ clientX: cx, clientY: cy }, wb.getBoundingClientRect(), cw, ch);
    const v0 = SG.wsView(ws, cw, ch), p = Sp.canvasToWorkspace(local, cw, ch, v0);
    const span = UI.Space.zoomSpan(v0, f);
    // 指针下面的那一点缩放前后位置不变：算出新范围的中心，使新范围下这一点仍然是 p
    const q = Sp.canvasToWorkspace(local, cw, ch, { cx: 0, cy: 0, span });
    UI.State.setUi(ws, 'view', { cx: p.x - q.x, cy: p.y - q.y, span });
    SG.render();
  }
  // 适应：按内容选一个正好装下的坐标范围（之后拉大卡片不再变）
  // key 有值时只适应到这一个图形（超出范围的箭头用它）
  function wsFit(id, key) {
    const S = UI.S, ws = S.scene.entities[id]; if (!ws) return;
    const sv = UI.State.focusedId() === id && SG.focusEl ? SG.focusEl.querySelector('svg.wsbody') : null;
    let w, h;
    if (sv) { w = +sv.getAttribute('width'); h = +sv.getAttribute('height'); }
    else { const g = SG.geom(ws); w = g.w; h = g.h - HD; }
    const vals = key ? SG.wsVisible(ws).filter((v) => v.key === key) : SG.wsVisible(ws);
    UI.State.setUi(ws, 'view', SG.autoView(SG.wsBounds(vals), w, h));
    SG.render();
  }
  // 有工作区时的适应（V2，1.2）：画布要占台面的大部分（1024×768 下 ≥ 60%）。四周不留图形的边（FIT.wsPad），
  // 顶部留出浮动工具条的位置，底部留出浮动条（缩放、时钟）的位置；展开的抽屉占画布右边一栏，先给它让出位置。
  function fitWs(ids) {
    const S = UI.S, Sp = UI.Space, FS = L.FIT_SCREEN, BAR = L.BAR, r = SG.stageEl.getBoundingClientRect();
    const plain = ids.some((id) => !SG.isWsDef(S.scene.entities[id].type));
    const P = plain ? { l: L.FIT.padL, r: L.FIT.padR, b: L.FIT.padB } : { l: L.FIT.wsPad, r: L.FIT.wsPad, b: L.FIT.wsPad };
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    ids.forEach((id) => { const g = SG.geom(S.scene.entities[id]); x0 = Math.min(x0, g.x - P.l); y0 = Math.min(y0, g.y); x1 = Math.max(x1, g.x + g.w + P.r); y1 = Math.max(y1, g.y + g.h + P.b); });
    const reserve = ids.some((id) => SG.isWsDef(S.scene.entities[id].type) && UI.Layout.drawerOpen(id)) ? L.DRAWER.px + L.DRAWER.gap : 0;
    const top = BAR.top + BAR.h + BAR.gap, bottom = UI.Layout.bottomReserve(SG.stageEl, BAR.fabGap);
    const availW = r.width - 2 * FS.x - reserve, availH = r.height - top - bottom;
    const z = Math.max(L.ZOOM.fitMin, Math.min(L.ZOOM.wsMax, Math.min(availW / (x1 - x0), availH / (y1 - y0))));
    const left = FS.x + (availW - Sp.scaleLen(x1 - x0, z)) / 2, t = top + (availH - Sp.scaleLen(y1 - y0, z)) / 2;
    S.view = Sp.viewAt(z, { x: x0, y: y0 }, { x: left, y: t });
  }
  function fit() {
    UI.Chrome.apply();   // 栏收成窄条或展开会改变台面的宽度，先摆好两侧栏，再量台面
    const S = UI.S, r = SG.stageEl.getBoundingClientRect();
    let ids = Object.keys(S.scene.entities).filter((id) => !SG.inWs(S.scene.entities[id]));
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    if (!ids.length) { S.view = { x: r.width / 2 - L.EMPTY_VIEW.dx, y: r.height / 2 - L.EMPTY_VIEW.dy, z: 1 }; return; }
    if (ids.some((id) => SG.isWsDef(S.scene.entities[id].type))) { fitWs(ids); return; }
    ids.forEach((id) => {
      const e = S.scene.entities[id], g = SG.geom(e); x0 = Math.min(x0, g.x - L.FIT.padL); y0 = Math.min(y0, g.y); x1 = Math.max(x1, g.x + g.w + L.FIT.padR); y1 = Math.max(y1, g.y + g.h + L.FIT.padB);
      if (SG.isWsDef(e.type)) { const pr = UI.Layout.panelRect(id, g); y1 = Math.max(y1, pr.y + pr.h); }   // 工作区底下的面板：实测（或估计）的高度
    });
    const FS = L.FIT_SCREEN, z = Math.max(L.ZOOM.fitMin, Math.min(L.ZOOM.fitMax, Math.min((r.width - 2 * FS.x) / (x1 - x0), (r.height - 2 * FS.y) / (y1 - y0))));
    const Sp = UI.Space;
    S.view = Sp.viewAt(z, { x: x0, y: y0 }, { x: (r.width - Sp.scaleLen(x1 - x0, z)) / 2, y: Math.max(L.FIT_TOP_MIN, (r.height - Sp.scaleLen(y1 - y0, z)) / 2) + L.FIT_TOP_NUDGE });
  }

  function zoomAt(f, cx, cy) {
    const S = UI.S, r = SG.stageEl.getBoundingClientRect();
    const local = cx === undefined ? { x: r.width / 2, y: r.height / 2 } : UI.Space.stageLocal({ clientX: cx, clientY: cy });
    S.view = UI.Space.zoomView(S.view, f, local, L.ZOOM); SG.render();
  }
  Object.assign(SG, { wsZoomAt, wsFit, fit, zoomAt });
})(window);
