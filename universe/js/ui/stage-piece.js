/* 台面（D4 拆分）：块：选中的块、块的拖动（松手时记成一步）。由 stage.js 拆出，只搬代码、不改逻辑；跨文件的名字经 UI.StageCtx（SG）访问。加载顺序见 index.html。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), W = U.World, K = U.kit, Q = U.Q;
  const $ = (s) => document.querySelector(s);
  const L = UI.LAYOUT, HD = L.HD, PORT_Y0 = L.PORT_Y0, PORT_DY = L.PORT_DY, PILL_DY = L.PILL_DY, PILL_W = L.PILL_W, MIN_W = L.MIN_W, MIN_H = L.MIN_H;
  const SG = UI.StageCtx;
  // ---- 块（§10.5.10）----
  // 选中的块：工作区里选中的（按名字找回），加上台面上选中的块卡片
  function selPieceIds() {
    const S = UI.S, out = [];
    for (const n of S.wsSel || []) { const r = U.Names.resolve(S.scene, n); if (r && r.ent && SG.roleOf(r.ent) === 'piece' && !out.includes(r.id)) out.push(r.id); }
    const e = S.sel && S.scene.entities[S.sel];
    if (e && SG.roleOf(e) === 'piece' && !SG.inWs(e) && !out.includes(e.id)) out.push(e.id);
    return out;
  }
  // 指针下面有没有这个工作区（卡片上的画布，或专注浮层里的画布）
  function overWs(ev, wsId) {
    return document.elementsFromPoint(ev.clientX, ev.clientY).some((n) => n.closest && (n.closest('[data-wsid="' + wsId + '"]') || n.closest('.card[data-id="' + wsId + '"]')));
  }
  // 按下块：拖动中只改块的 dx、dy 作预览；松手时再一次 piece 移动动作，撤销就回到原来的位置
  function pieceDown(pe, gh, pk, ev) {
    const S = UI.S;
    S.sel = pe.id; S.selLink = null;
    if (pe.props.locked) { if (pk) SG.render(); UI.Panels.renderInsp(); return; }
    ev.preventDefault(); ev.stopPropagation();
    // 坐标范围在拖动开始时冻结：工作区没存过范围时是按内容自动选的，块一动内容就变，不冻结的话每动一下比例都会变
    const svg = gh.closest('svg'), r = svg.getBoundingClientRect(), cw = +svg.getAttribute('width') || r.width, ch = +svg.getAttribute('height') || r.height;
    const ws = S.scene.entities[pe.parent], v0 = ws ? SG.wsView(ws, cw, ch) : null;
    // 对齐准备：块的形状（拖动开始时的）和其余的顶点、边（目标图形也在里面），块自己的不算
    const pv = S.D[pe.id] && S.D[pe.id].out.f ? S.D[pe.id].out.f.data : null;
    const align = pv && ws ? SG.buildAlign(ws, pv.pts, SG.edgesOf(pv), [], (v) => v.id === pe.id) : null;
    SG.drag = { kind: 'piece', id: pe.id, wsId: pe.parent, v0, unit: v0 ? UI.Space.canvasOf(r, v0.span).unit : UI.Space.figUnit(r, cw, +gh.dataset.s), dx0: pe.props.dx, dy0: pe.props.dy, sx: ev.clientX, sy: ev.clientY, dxn: 0, dyn: 0, out: false, moved: false, align, guides: [], ghost: pv ? [pv.pts.map((q) => ({ x: Q.num(q.x), y: Q.num(q.y) }))] : [] };
    // 量完大小再重画：重画会换掉这个图形的 DOM，之后再量会得到 0
    if (pk) SG.render();
  }
  function pieceMove(ev) {
    const S = UI.S, d = SG.drag, e = S.scene.entities[d.id];
    if (!e) return;
    const mx = ev.clientX - d.sx, my = ev.clientY - d.sy;
    if (!d.moved && Math.hypot(mx, my) < L.DRAG_SLOP) return;
    if (!d.moved && d.v0) UI.State.setUi(S.scene.entities[d.wsId], 'view', d.v0);   // 拖动开始：把冻结的坐标范围存下来
    d.moved = true;
    d.out = !overWs(ev, d.wsId);
    const cl = (v) => Math.max(-200, Math.min(200, v));
    let nx = d.dx0, ny = d.dy0; d.guides = [];
    if (!d.out) {
      if (d.align) { d.align.alt = !!ev.altKey; const s = SG.alignSolve(d.align, { x: UI.Space.pxToUnits(mx, d.unit), y: -UI.Space.pxToUnits(my, d.unit) }, d.unit); nx = cl(d.dx0 + s.dx); ny = cl(d.dy0 + s.dy); d.guides = s.guides; }
      else { nx = cl(d.dx0 + Math.round(UI.Space.pxToUnits(mx, d.unit))); ny = cl(d.dy0 - Math.round(UI.Space.pxToUnits(my, d.unit))); }
    }
    d.dxn = nx - d.dx0; d.dyn = ny - d.dy0;
    if (e.props.dx !== nx || e.props.dy !== ny) {
      e.props.dx = nx; e.props.dy = ny;
      // 还在工作区里：只重画工作区；拖出去了要变成台面上的卡片，整张台面重画
      if (d.out) UI.App.refresh(false); else { S.D = W.evaluate(S.scene); SG.wsRedraw(d.wsId); }
    }
    SG.showTip(ev.clientX, ev.clientY, d.out ? '松手放到台面上，就变成一张器材卡片' : '向右 ' + d.dxn + ' 格，向上 ' + d.dyn + ' 格', !d.out);
  }
  // 松手：还在工作区里，就是一步移动；拖出了工作区，就取出来放到台面上（落在别的容器上就放进那个容器）
  function pieceUp(d, ev) {
    const S = UI.S, e = S.scene.entities[d.id];
    SG.showTip(0, 0, '');
    if (!e) return;
    if (!d.moved) { UI.Panels.renderInsp(); SG.render(); return; }
    e.props.dx = d.dx0; e.props.dy = d.dy0;
    if (d.out) {
      const w = UI.Space.screenToStage(ev);
      UI.Intent.run('drop', { id: d.id, ev, piece: true, out: { x: w.x - L.PIECE_DROP.x, y: w.y - L.PIECE_DROP.y } });
    } else if (d.dxn || d.dyn) UI.Intent.run('piece', { ids: [d.id], what: 'move', value: { dx: d.dxn, dy: d.dyn } });
    else UI.App.refresh(false);
    // 松手后：拼对了就闪一下（判定在 wsBody 里每次重画时算，和「对齐到目标」一样用 U.Geo.assemble）
    if (!d.out) S.wsFit = { ws: d.wsId, until: Date.now() + 900 };
    UI.Panels.renderInsp(); SG.render();
  }
  Object.assign(SG, { selPieceIds, overWs, pieceDown, pieceMove, pieceUp });
})(window);
