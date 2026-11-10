/* 台面（对外入口，D4 拆分后）：UI.Stage 的接口不变；实现在 stage-*.js 里按职责拆开（共用状态在 stage-core.js 的 UI.StageCtx），加载顺序见 index.html。 */
(function (G) {
  'use strict';
  const UI = (G.UI = G.UI || {}), SG = UI.StageCtx, HD = UI.LAYOUT.HD;
  UI.Stage = { init: SG.init, render: SG.render, dropTarget: SG.dropTarget, freeSpot: SG.freeSpot, fit: SG.fit, zoomAt: SG.zoomAt, geom: SG.geom, portPos: SG.portPos, setFocus: SG.setFocus, wsZoomAt: SG.wsZoomAt, wsFit: SG.wsFit, selPieceIds: SG.selPieceIds, keyNav: SG.keyNav, endDraw: SG.endDraw, wsAct: SG.wsAct, drawMode: SG.drawMode, activeWs: SG.activeWs, rangeOf: (id) => { const ws = UI.S.scene.entities[id]; if (!ws) return null; const g = SG.geom(ws); return SG.wsView(ws, g.w, g.h - HD); } };
})(window);
