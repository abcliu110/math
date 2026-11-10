/* 台面（D4 拆分）：画线：点两下画线、剪、构造点（中点）吸附。由 stage.js 拆出，只搬代码、不改逻辑；跨文件的名字经 UI.StageCtx（SG）访问。加载顺序见 index.html。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), W = U.World, K = U.kit, Q = U.Q;
  const $ = (s) => document.querySelector(s);
  const L = UI.LAYOUT, HD = L.HD, PORT_Y0 = L.PORT_Y0, PORT_DY = L.PORT_DY, PILL_DY = L.PILL_DY, PILL_W = L.PILL_W, MIN_W = L.MIN_W, MIN_H = L.MIN_H;
  const SG = UI.StageCtx;
  // ---- 工作区里两下画线（§10.5.8 B11）----
  function endDraw() { const S = UI.S; if (S.wsDraw) { S.wsDraw = null; S.wsMsg = ''; SG.render(); } }
  // 快捷键作用在哪个工作区：正在画线的；鼠标最后停过的；台面上只有一个的
  function activeWs() {
    const S = UI.S, E = S.scene.entities;
    if (S.wsDraw && E[S.wsDraw.ws]) return S.wsDraw.ws;
    if (SG.hotWs && E[SG.hotWs] && SG.isWsDef(E[SG.hotWs].type)) return SG.hotWs;
    const all = Object.values(E).filter((e) => SG.isWsDef(e.type));
    return all.length === 1 ? all[0].id : null;
  }
  function drawMode(wsId, tool) {
    const S = UI.S, D = S.wsDraw;
    if (D && D.ws === wsId && D.tool === tool) return endDraw();
    S.wsDraw = { ws: wsId, tool, pend: null, cur: null }; S.wsMsg = '';
    if (tool === 'seg') S.wsSel = [];
    SG.render();
  }
  // 吸附：算法在 UI.Space.snap（顶点、构造点、边上的格点、格点）；这里告诉它每个顶点属于哪个自由点，以及有哪些构造点。
  // start：已经按下的起点（第二个点时才有）：垂足要从它算
  // 吸附开关（工具条的“吸附”）关了，或者按住 Alt：不吸附，点落在整数格点上（自由点只存整数）
  function snapFree(ev) { return UI.S.snapOn === false || !!(ev && ev.altKey); }
  function snapTo(fr, wp, sc, start, free) {
    if (free) return { x: Math.round(wp.x), y: Math.round(wp.y), ref: null };
    const E = UI.S.scene.entities;
    return UI.Space.snap(fr.vals, wp, sc.unit, {
      px: SG.SNAP_PX,
      // 顶点属于哪个器材：自由点围成的图形，顶点是那个自由点；单独画出来的构造点（中点、垂足、交点）就是它自己的 p 口
      ref: (v, i) => {
        const fi = SG.figInfo(v); if (fi && fi.kind === 'pts' && fi.verts[i]) return fi.verts[i];
        const ent = E[v.id];
        return v.fig.type === 'point' && v.port === 'p' && ent && SG.roleOf(ent) === 'step' ? v.id : null;
      },
      cons: constructsOf(fr.vals, SG.wsNames(), start),
    });
  }
  // 构造点候选：器材声明里有 snap 的（geo 包里的中点、垂足、交点）。候选的种类从声明读出来，不认具体器材名；
  // 边的端点必须是自由点（figInfo 的 verts），才能建构造器材接上去。三种取法（snap.of）：
  //   edge  每条边一个（中点）；  foot  起点到每条边所在直线的垂足（要先有起点）；  cross  每两条边在里面相交的交点（比如两条对角线）
  // con 记下要建的器材（type）、接哪几个点（ids，按 wire 的顺序；extra 是另外要接的口）、从哪个口取结果（out）。
  function constructsOf(vals, names, start) {
    const decl = Object.keys(U.types).filter((k) => U.types[k].snap);
    const out = [], seen = new Set();
    if (!decl.length) return out;
    const edges = [];   // { a, b: 端点坐标；ids: 端点的自由点 }
    for (const v of vals) {
      const fi = SG.figInfo(v); if (!fi || fi.kind !== 'pts' || fi.f.type === 'point') continue;
      for (const [i, j] of fi.edges) if (fi.verts[i] !== fi.verts[j]) edges.push({ a: v.fig.pts[i], b: v.fig.pts[j], ids: [fi.verts[i], fi.verts[j]] });
    }
    // 点的名字：画布上写的标签（A、B……，见 wsValues）；没有标签的用稳定名字
    const lab = new Map();
    for (const v of vals) { const fi = SG.figInfo(v); if (fi && fi.kind === 'pts' && v.fig.type === 'point' && fi.verts[0]) lab.set(fi.verts[0], v.label); }
    const nm = (ids) => ids.map((g) => lab.get(g) || names[g + '.p'] || null);
    const add = (type, sn, at, ids, extra, label) => {
      const key = type + ':' + ids.slice().sort().join(',') + ':' + extra.map((e) => e.id).join(',');
      if (seen.has(key)) return; seen.add(key);
      out.push({ x: Q.num(at.x), y: Q.num(at.y), exact: at, label, con: { type, wire: sn.wire, out: sn.out, ids, extra, label, mark: sn.mark } });
    };
    const sgn = (a, b, p) => U.Geo.side(a, b, p);
    for (const type of decl) {
      const sn = U.types[type].snap;
      if (sn.of === 'edge') {
        for (const e of edges) { const n = nm(e.ids); add(type, sn, sn.at(e.a, e.b), e.ids, [], n[0] && n[1] ? n[0] + n[1] + ' 的' + sn.label : sn.label); }
      } else if (sn.of === 'foot' && start && start.ref) {
        const sp = start.exact || { x: Q(start.x), y: Q(start.y) };
        for (const e of edges) {
          if (e.ids.includes(start.ref)) continue;
          const at = sn.at(e.a, e.b, sp); if (Q.eq(at.x, sp.x) && Q.eq(at.y, sp.y)) continue;
          const n = nm(e.ids);
          add(type, sn, at, e.ids, [{ port: 'p', id: start.ref }], n[0] && n[1] ? '到 ' + n[0] + n[1] + ' 的垂足（画出垂线）' : sn.label);
        }
      } else if (sn.of === 'cross') {
        for (let i = 0; i < edges.length; i++) for (let j = i + 1; j < edges.length; j++) {
          const e = edges[i], f = edges[j];
          if (e.ids.some((g) => f.ids.includes(g))) continue;
          if (sgn(e.a, e.b, f.a) * sgn(e.a, e.b, f.b) >= 0 || sgn(f.a, f.b, e.a) * sgn(f.a, f.b, e.b) >= 0) continue;   // 要在两条线段的里面真正相交
          const at = sn.at(e.a, e.b, f.a, f.b); if (!at) continue;
          add(type, sn, at, e.ids.concat(f.ids), [], sn.label);
        }
      }
    }
    return out;
  }
  // 鼠标位置 → 吸附后的点（画线时坐标范围冻结，免得画到一半图跳走）
  function snapAt(wb, ev, start) {
    const S = UI.S, ws = S.scene.entities[wb.dataset.wsid];
    if (!ws) return null;
    const fr = SG.wsFrame(ws, +wb.getAttribute('width'), +wb.getAttribute('height'));
    if (!UI.State.viewOf(ws)) UI.State.setUi(ws, 'view', fr.vw);
    const sc = UI.Space.canvasOf(wb.getBoundingClientRect(), fr.vw.span);
    return snapTo(fr, UI.Space.screenToWorkspace(ev, fr.vw, sc), sc, start !== undefined ? start : (S.wsDraw && S.wsDraw.pend), snapFree(ev));
  }
  function drawClick(wb, ev) {
    const S = UI.S, D = S.wsDraw, ws = S.scene.entities[D.ws];
    if (!ws) return endDraw();
    const sp = snapAt(wb, ev);
    if (!D.pend) { D.pend = sp; D.cur = sp; D.downAt = { x: ev.clientX, y: ev.clientY }; S.wsMsg = ''; return SG.wsRedraw(D.ws); }
    const a = D.pend; D.pend = null; D.cur = null; D.downAt = null;
    finishLine(D, a, sp);
  }
  // 直接拖出一条线（不用先点「连线」）：在画线模式里按下起点、拖到终点松手；或者不在任何模式里按住 Shift 拖。
  // 拖出来的线用的是同一套吸附（顶点、中点、交点、格点）和同一个建线动作，一条线就是一步。
  const DRAG_LINE_PX = 6;
  function lineDragStart(wb, ev, tool) {
    const S = UI.S, sp = snapAt(wb, ev); if (!sp) return false;
    S.wsDraw = { ws: wb.dataset.wsid, tool: tool || 'seg', pend: sp, cur: sp, temp: true, downAt: { x: ev.clientX, y: ev.clientY } };
    S.wsMsg = ''; SG.wsRedraw(S.wsDraw.ws); return true;
  }
  // 松手时：画线模式里按下—拖—松，或者 Shift 拖，都用这里收尾；返回 true 表示这次松手已经处理
  function lineDragEnd(ev) {
    const S = UI.S, D = S.wsDraw; if (!D || !D.pend || !D.downAt) return false;
    const moved = Math.hypot(ev.clientX - D.downAt.x, ev.clientY - D.downAt.y) >= DRAG_LINE_PX;
    if (!moved) { if (D.temp) endDraw(); return false; }   // 没拖：画线模式里照旧「点两下」，临时模式（Shift）取消
    const wb = [...document.querySelectorAll('svg.wsbody[data-wsid="' + D.ws + '"]')].find((el) => { const r = el.getBoundingClientRect(); return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom; });
    const a = D.pend, temp = D.temp;
    D.pend = null; D.cur = null; D.downAt = null;
    if (!wb) { if (temp) endDraw(); else SG.wsRedraw(D.ws); return true; }
    const b = snapAt(wb, ev, a);
    if (temp) S.wsDraw = null;
    finishLine(temp ? Object.assign({}, D, { pend: null }) : D, a, b);
    return true;
  }
  function drawHover(ev) {
    const S = UI.S, D = S.wsDraw, ws = S.scene.entities[D.ws];
    const wb = [...document.querySelectorAll('svg.wsbody[data-wsid="' + D.ws + '"]')].find((el) => { const r = el.getBoundingClientRect(); return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom; });
    if (!ws || !wb) return;
    const fr = SG.wsFrame(ws, +wb.getAttribute('width'), +wb.getAttribute('height')), sc = UI.Space.canvasOf(wb.getBoundingClientRect(), fr.vw.span);
    D.cur = snapTo(fr, UI.Space.screenToWorkspace(ev, fr.vw, sc), sc, D.pend, snapFree(ev)); SG.wsRedraw(D.ws);
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
  Object.assign(SG, { endDraw, activeWs, drawMode, snapFree, snapTo, snapAt, constructsOf, drawClick, drawHover, finishLine, lineDragStart, lineDragEnd, DRAG_LINE_PX });
})(window);
