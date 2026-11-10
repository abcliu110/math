/* 台面（D4 拆分）：台面初始化：绑定台面上的事件（按下、滚轮、面板的输入和点击）。由 stage.js 拆出，只搬代码、不改逻辑；跨文件的名字经 UI.StageCtx（SG）访问。加载顺序见 index.html。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), W = U.World, K = U.kit, Q = U.Q;
  const $ = (s) => document.querySelector(s);
  const L = UI.LAYOUT, HD = L.HD, PORT_Y0 = L.PORT_Y0, PORT_DY = L.PORT_DY, PILL_DY = L.PILL_DY, PILL_W = L.PILL_W, MIN_W = L.MIN_W, MIN_H = L.MIN_H;
  const SG = UI.StageCtx;
  function init() {
    SG.stageEl = $('#stage'); SG.worldEl = $('#world');
    // 专注浮层：放在台面外面（不跟着台面缩放平移），盖住整个台面
    SG.focusEl = document.createElement('div'); SG.focusEl.id = 'wsfocus'; SG.focusEl.style.display = 'none'; SG.stageEl.appendChild(SG.focusEl);
    SG.stageEl.addEventListener('pointerdown', SG.onDown);
    // 拖卡片时不让浏览器接管成“原生拖放”（否则之后的 pointermove 全被吞掉）
    SG.stageEl.addEventListener('dragstart', (ev) => ev.preventDefault());
    // 工作区面板：图层开关、移动工具的 dx、dy（只记下来，不重画，免得输入框失去焦点）
    SG.stageEl.addEventListener('change', (ev) => {
      // 选中图形的顶点坐标：改一个数，就是改那个自由点的 x 或 y（一步，可撤销；超出范围就夹回 ±10）
      const vx = ev.target.getAttribute && ev.target.getAttribute('data-ws-vx');
      if (vx) {
        let n = parseInt(ev.target.value, 10); if (!Number.isFinite(n)) return SG.render();
        n = Math.max(-10, Math.min(10, n));
        UI.Intent.run('params', { ops: [{ id: vx, k: ev.target.getAttribute('data-ws-vk'), v: n }] }); SG.render(); return;
      }
      const l = ev.target.getAttribute && ev.target.getAttribute('data-ws-layer');
      if (l === null || l === undefined) return;
      const ws = UI.S.scene.entities[ev.target.getAttribute('data-ws-of')];
      if (!ws) return;
      const h = Object.assign({}, UI.State.hiddenOf(ws));
      if (ev.target.checked) delete h[l]; else h[l] = true;
      UI.State.setUi(ws, 'hiddenLayers', Object.keys(h).length ? h : null);
      SG.render();
    });
    SG.stageEl.addEventListener('input', (ev) => {
      const k = ev.target.getAttribute && ev.target.getAttribute('data-ws-arg');
      if (k) UI.S.wsArgs[k] = ev.target.value;
    });
    window.addEventListener('pointermove', SG.onMove);
    window.addEventListener('pointerup', SG.onUp);
    // 滚轮：指在工作区上就只缩放这个工作区（§10.5.8 A3）；指在别处缩放台面；专注浮层里的其他地方不动台面
    SG.stageEl.addEventListener('wheel', (ev) => {
      ev.preventDefault();
      const f = ev.deltaY < 0 ? 1.1 : 1 / 1.1, wb = ev.target.closest && ev.target.closest('.wsbody');
      if (wb) SG.wsZoomAt(wb, f, ev.clientX, ev.clientY);
      else if (!(ev.target.closest && ev.target.closest('#wsfocus'))) SG.zoomAt(f, ev.clientX, ev.clientY);
    }, { passive: false });
    SG.stageEl.addEventListener('click', (ev) => {
      const why = ev.target.closest('[data-why]');
      if (why) { const [wid, wport] = why.dataset.why.split('|'); UI.Panels.whyDialog(wid, wport); return; }
      // 工作区面板：工具、步骤（点开看参数）、删除一步
      const ff = ev.target.closest('[data-fig-flip]');
      if (ff) { SG.figFlip(ff.dataset.ws, ff.dataset.name, +ff.dataset.figFlip); return; }
      const wfo = ev.target.closest('[data-ws-fold]');
      if (wfo) { UI.Layout.toggleFold(wfo.dataset.wsFold); SG.render(); return; }
      const wmd = ev.target.closest('[data-ws-mode]');
      if (wmd) { SG.endDraw(); UI.S.wsSel = []; SG.render(); return; }
      const wsh = ev.target.closest('[data-ws-shape]');
      if (wsh) { SG.wsAddShape(wsh.dataset.ws, wsh.dataset.wsShape); return; }
      const wt = ev.target.closest('[data-ws-tool]');
      if (wt) { SG.wsRun(wt.dataset.ws, wt.dataset.wsTool); return; }
      const wf = ev.target.closest('[data-ws-fit]');
      if (wf) { SG.wsFit(wf.dataset.wsFit); return; }
      const wu = ev.target.closest('[data-ws-unfocus]');
      if (wu) { SG.setFocus(null); return; }
      // 图层分组（2.4）：点标题展开或收起；全部显示、全部隐藏（隐藏的是这个工作区的所有图形，不只是现在看得见的）
      const lg = ev.target.closest('[data-ws-lgroup]');
      if (lg) { const S = UI.S, o = Object.assign({}, S.wsLayerOpen || {}), k = lg.dataset.wsLgroup; if (o[k]) delete o[k]; else o[k] = true; S.wsLayerOpen = o; SG.render(); return; }
      const la = ev.target.closest('[data-ws-layers]');
      if (la) {
        const ws = UI.S.scene.entities[la.dataset.wsOf]; if (!ws) return;
        const h = {};
        if (la.dataset.wsLayers === 'hide') for (const v of SG.wsValues(ws, SG.wsNames())) h[v.key] = true;
        UI.State.setUi(ws, 'hiddenLayers', Object.keys(h).length ? h : null);
        SG.render(); return;
      }
      const wd = ev.target.closest('[data-ws-del]');
      if (wd) { SG.delWs(wd.dataset.wsDel); return; }
      const wst = ev.target.closest('[data-ws-step]');
      if (wst) { const S = UI.S; S.sel = wst.dataset.wsStep; S.selLink = null; S.inspOpen = true; UI.Panels.renderInsp(); SG.render(); return; }
      // 块的把手（工作区面板里）：转 90°、左右翻、属性
      const pa = ev.target.closest('[data-piece-act]');
      if (pa) {
        const S = UI.S, ids = SG.selPieceIds();
        if (pa.dataset.pieceAct === 'insp') { if (ids[0]) { S.sel = ids[0]; S.inspOpen = true; UI.Panels.renderInsp(); SG.render(); } }
        else UI.Intent.run('piece', { ids, what: pa.dataset.pieceAct, value: 1 });
        return;
      }
      const b = ev.target.closest('[data-act]'); if (!b) return;
      const S = UI.S, id = S.sel; if (!id) return;
      const a = b.dataset.act;
      if (a === 'turn' || a === 'flip') UI.Intent.run('piece', { ids: [id], what: a, value: 1 });
      else if (a === 'insp') { S.inspOpen = !S.inspOpen; UI.Panels.renderInsp(); }
      else if (a === 'copy') UI.Intent.run('copy', { id });
      else if (a === 'del') { S.sel = null; UI.Intent.run('delete', { id }); }
      else if (a === 'resetstate') UI.Intent.run('resetstate', { id });
    });
  }
  Object.assign(SG, { init });
})(window);
