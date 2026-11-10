/* 台面（D4 拆分）：画线：点两下画线、剪、构造点（中点）吸附。由 stage.js 拆出，只搬代码、不改逻辑；跨文件的名字经 UI.StageCtx（SG）访问。加载顺序见 index.html。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), W = U.World, K = U.kit, Q = U.Q;
  const $ = (s) => document.querySelector(s);
  const L = UI.LAYOUT, HD = L.HD, PORT_Y0 = L.PORT_Y0, PORT_DY = L.PORT_DY, PILL_DY = L.PILL_DY, PILL_W = L.PILL_W, MIN_W = L.MIN_W, MIN_H = L.MIN_H;
  const SG = UI.StageCtx;
  // ---- 工作区里两下画线（§10.5.8 B11）----
  function endDraw() { const S = UI.S; if (S.wsDraw) { S.wsDraw = null; S.wsMsg = ''; SG.render(); } }
  function drawMode(wsId, tool) {
    const S = UI.S, D = S.wsDraw;
    if (D && D.ws === wsId && D.tool === tool) return endDraw();
    S.wsDraw = { ws: wsId, tool, pend: null, cur: null }; S.wsMsg = '';
    if (tool === 'seg') S.wsSel = [];
    SG.render();
  }
  // 吸附：算法在 UI.Space.snap（顶点、构造点、边上的格点、格点）；这里告诉它每个顶点属于哪个自由点，以及有哪些构造点
  function snapTo(fr, wp, sc) {
    return UI.Space.snap(fr.vals, wp, sc.unit, {
      px: SG.SNAP_PX,
      ref: (v, i) => { const fi = SG.figInfo(v); return fi && fi.kind === 'pts' && fi.verts[i] ? fi.verts[i] : null; },
      cons: constructsOf(fr.vals, SG.wsNames()),
    });
  }
  // 构造点候选（V4）：器材声明里有 snap 的（geo 包里的中点），对每条边算一个候选点。
  // 候选的种类从声明读出来，不认具体器材名；边的两个端点必须是自由点（figInfo 的 verts），才能建构造器材接上去。
  // con 记下要建的器材（type）、接哪两个点（ids，按 wire 的顺序）、从哪个口取结果（out）。
  function constructsOf(vals, names) {
    const decl = Object.keys(U.types).filter((k) => U.types[k].snap);
    const out = [], seen = new Set();
    if (!decl.length) return out;
    for (const v of vals) {
      const fi = SG.figInfo(v); if (!fi || fi.kind !== 'pts') continue;
      for (const [i, j] of fi.edges) for (const type of decl) {
        const sn = U.types[type].snap, ids = [fi.verts[i], fi.verts[j]];
        if (sn.of !== 'edge') continue;
        const key = type + ':' + ids.slice().sort().join(',');
        if (seen.has(key)) continue;
        seen.add(key);
        const at = sn.at(v.fig.pts[i], v.fig.pts[j]), nm = ids.map((g) => names[g + '.p'] || null);
        const label = nm[0] && nm[1] ? nm[0] + nm[1] + ' 的' + sn.label : sn.label;
        out.push({ x: Q.num(at.x), y: Q.num(at.y), exact: at, label, con: { type, wire: sn.wire, out: sn.out, ids, label, mark: sn.mark } });
      }
    }
    return out;
  }
  function drawClick(wb, ev) {
    const S = UI.S, D = S.wsDraw, ws = S.scene.entities[D.ws];
    if (!ws) return endDraw();
    const fr = SG.wsFrame(ws, +wb.getAttribute('width'), +wb.getAttribute('height'));
    if (!UI.State.viewOf(ws)) UI.State.setUi(ws, 'view', fr.vw);   // 画线时坐标范围冻结
    const sc = UI.Space.canvasOf(wb.getBoundingClientRect(), fr.vw.span), sp = snapTo(fr, UI.Space.screenToWorkspace(ev, fr.vw, sc), sc);
    if (!D.pend) { D.pend = sp; D.cur = sp; S.wsMsg = ''; return SG.wsRedraw(D.ws); }
    const a = D.pend; D.pend = null; D.cur = null;
    finishLine(D, a, sp);
  }
  function drawHover(ev) {
    const S = UI.S, D = S.wsDraw, ws = S.scene.entities[D.ws];
    const wb = [...document.querySelectorAll('svg.wsbody[data-wsid="' + D.ws + '"]')].find((el) => { const r = el.getBoundingClientRect(); return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom; });
    if (!ws || !wb) return;
    const fr = SG.wsFrame(ws, +wb.getAttribute('width'), +wb.getAttribute('height')), sc = UI.Space.canvasOf(wb.getBoundingClientRect(), fr.vw.span);
    D.cur = snapTo(fr, UI.Space.screenToWorkspace(ev, fr.vw, sc), sc); SG.wsRedraw(D.ws);
  }
  // 两个点都定了：建点（不是顶点的才建）、建线段；剪的模式再建剪刀、剪开。整串是一步
  function finishLine(D, a, b) {
    const S = UI.S, ws = S.scene.entities[D.ws];
    if (!ws) return endDraw();
    // 精确坐标：吸附到构造点时用它的有理数值（中点可能是分数），否则是整数格点
    const ex = (s) => s.exact || { x: Q(s.x), y: Q(s.y) };
    const ea = ex(a), eb = ex(b);
    if (Q.eq(ea.x, eb.x) && Q.eq(ea.y, eb.y)) { SG.setMsg('两个点不能重合', false); return SG.render(); }
    let cut = null;
    const seg = { type: 'segment', pts: [ea, eb] };
    if (D.tool === 'cut') {
      const sel = S.wsSel || [], pr = sel.length === 1 ? SG.resolvePick(sel[0]) : null;
      if (!pr || typeof pr === 'string' || !pr.value || pr.value.data.type !== 'polygon') { SG.setMsg('剪需要先选一个多边形，再画一条线', false); return SG.render(); }
      const g = U.GeoRules.run('geo.cut', { f: pr.value.data, line: seg }, {});
      if (!g.ok) { SG.setMsg(g.why, false); return SG.render(); }
      cut = pr;
    }
    const r = UI.Intent.run('draw', { ws: ws.id, a, b, cut });
    D.pend = null; D.cur = null;
    if (r.ok) { S.wsSel = []; S.wsMsg = ''; } else SG.setMsg(r.why, false);
    SG.render();
  }
  Object.assign(SG, { endDraw, drawMode, snapTo, constructsOf, drawClick, drawHover, finishLine });
})(window);
