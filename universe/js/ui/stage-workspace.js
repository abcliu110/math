/* 台面（D4 拆分）：工作区的数据与坐标：图层的值、步骤、坐标范围、画布框架、范围自动检查。由 stage.js 拆出，只搬代码、不改逻辑；跨文件的名字经 UI.StageCtx（SG）访问。加载顺序见 index.html。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), W = U.World, K = U.kit, Q = U.Q;
  const $ = (s) => document.querySelector(s);
  const L = UI.LAYOUT, HD = L.HD, PORT_Y0 = L.PORT_Y0, PORT_DY = L.PORT_DY, PILL_DY = L.PILL_DY, PILL_W = L.PILL_W, MIN_W = L.MIN_W, MIN_H = L.MIN_H;
  const SG = UI.StageCtx;
  function wsValues(ws, names) {
    const S = UI.S, D = S.D || {}, shows = SG.wsCfg(ws.type).shows, out = [];
    const E = S.scene.entities, L = S.scene.links;
    for (const it of SG.wsKids(ws)) {
      if (it.hidden) continue;   // 被剪开的图形（entity.hidden）不画，块画在它的位置上
      const d = U.types[it.type], node = D[it.id]; if (!d || !node || !node.out) continue;
      const ports = Object.keys(d.outputs), hasFig = ports.some((p) => node.out[p] && node.out[p].kind === 'fig');
      for (const port of ports) {
        const v = node.out[port]; if (!v || !shows.includes(v.kind)) continue;
        // 剪开的一口已经接成了块：画块（它自己会移动），不再画剪刀的原样输出
        if (SG.defOf(it).splitsPieces && L.some((l) => l.from === it.id && l.fromPort === port && E[l.to] && SG.roleOf(E[l.to]) === 'piece')) continue;
        const key = it.id + '.' + port, nm = names[key] || null;
        if (v.kind === 'figs') { if (hasFig) continue; v.data.forEach((f, i) => out.push({ key: key + '.' + i, name: null, label: SG.figLabel(it, nm, f), fig: f, id: it.id, port })); continue; }
        out.push({ key, name: nm, label: SG.figLabel(it, nm, v.data), fig: v.data, id: it.id, port });
      }
    }
    return out;
  }
  // 工作区里的步骤：工具造出来的步骤器材（连线、中点、垂线、剪、摆放、拼合）。标题的步数和步骤清单都用它
  const wsSteps = (ws) => SG.wsKids(ws).filter((k) => SG.roleOf(k) === 'step');
  // ---- 工作区的坐标范围（§10.5.8 A2、A3）----
  // 工作区实体的 ui.view = {cx, cy, span}（见 js/ui/state.js）：可见的横向范围是 [cx-span/2, cx+span/2]，画布上 1 个坐标单位 = w/span 像素。
  // 没存过的，按内容自动选（横纵都装得下）。一旦拖过、滚过、改过大小、点过“适应”，就存下来：
  // 之后拉大卡片只是把图画大，坐标范围不变。
  function wsVisible(ws) { const hidden = UI.State.hiddenOf(ws); return wsValues(ws, SG.wsNames()).filter((v) => !hidden[v.key] && v.fig); }
  // 一个图形在坐标里的外框（圆按半径算）；没有点就是 null。按画出来的样子算（近似旋转的块转过去以后的外框，V9）
  function figBox(f, ent) {
    if (!f || !f.pts || !f.pts.length) return null;
    const r = f.type === 'circle' ? Math.sqrt(Q.num(f.r2)) : 0, pts = SG.shownPts(f, ent), xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
    return { x0: Math.min(...xs) - r, x1: Math.max(...xs) + r, y0: Math.min(...ys) - r, y1: Math.max(...ys) + r };
  }
  function wsBounds(vals) {
    const xs = [], ys = [];
    for (const v of vals) {
      const f = v.fig;
      const r = f.type === 'circle' ? Math.sqrt(Q.num(f.r2)) : 0;
      for (const p of f.pts ? SG.shownPts(f, UI.S.scene.entities[v.id]) : []) { xs.push(p.x - r, p.x + r); ys.push(p.y - r, p.y + r); }
    }
    if (!xs.length) return null;
    let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    if (x1 - x0 < 2) { x0 -= 1; x1 += 1; } if (y1 - y0 < 2) { y0 -= 1; y1 += 1; }
    return { x0, x1, y0, y1 };
  }
  // 按内容自动选范围：内容的中心在中间，横纵两个方向都装得下，四周留一点边
  function autoView(b, w, h) {
    if (!b) return { cx: 0, cy: 0, span: 10 };
    const span = Math.max(b.x1 - b.x0, (b.y1 - b.y0) * w / Math.max(h, 1)) * L.AUTO_MARGIN;
    return { cx: (b.x0 + b.x1) / 2, cy: (b.y0 + b.y1) / 2, span };
  }
  function wsView(ws, w, h, b) {
    const v = UI.State.viewOf(ws);
    return v || autoView(b === undefined ? wsBounds(wsVisible(ws)) : b, w, h);
  }
  // 范围的数取最近的 1/2：写成 −1/2、7 1/2 这样
  const fmtHalf = (n) => { const k = Math.round(n * 2), a = Math.abs(k), whole = Math.floor(a / 2), half = a % 2; return (k < 0 ? '−' : '') + (half ? (whole ? whole + ' ' : '') + '1/2' : String(whole)); };
  function rangeText(ws, w, h) {
    const v = wsView(ws, w, h), { hw, hh } = UI.Space.halfRange(w, h, v);
    return '横向 ' + fmtHalf(v.cx - hw) + ' 到 ' + fmtHalf(v.cx + hw) + '　纵向 ' + fmtHalf(v.cy - hh) + ' 到 ' + fmtHalf(v.cy + hh);
  }

  // 坐标范围跟着内容走：新加的、挪动过的图形如果超出了范围，就自动重新适应（拖动中不做，拖动开始时范围已经冻结）
  function checkViews() {
    const S = UI.S; if (SG.drag) return;
    S.wsSig = S.wsSig || {};
    for (const ws of Object.values(S.scene.entities)) {
      if (!SG.isWsDef(ws.type)) continue;
      // 这个工作区在本次打开后第一次看到（比如刷新后）：只记下签名，不因为“都是新的”就重新适应；存下的范围保留
      const first = !S.wsSig[ws.id];
      const vals = wsVisible(ws), prev = S.wsSig[ws.id] || {}, sig = {}, changed = [];
      for (const v of vals) {
        const f = v.fig, k = [f.type, (f.pts || []).map((p) => Q.show(p.x) + ',' + Q.show(p.y)).join(';'), f.r2 ? Q.show(f.r2) : ''].join('|');
        sig[v.key] = k; if (prev[v.key] !== k) changed.push(v);
      }
      S.wsSig[ws.id] = sig;
      if (!changed.length || first) continue;
      const g = SG.geom(ws), w = g.w, h = g.h - HD, vw = wsView(ws, w, h), { hw, hh } = UI.Space.halfRange(w, h, vw);
      const out = changed.some((v) => { const bx = figBox(v.fig, UI.S.scene.entities[v.id]); return bx && (bx.x0 < vw.cx - hw || bx.x1 > vw.cx + hw || bx.y0 < vw.cy - hh || bx.y1 > vw.cy + hh); });
      if (out) UI.State.setUi(ws, 'view', autoView(wsBounds(vals), w, h));
    }
  }
  // 工作区的画布框架：可见的值、范围、像素换算。w、h 是画布的宽高（属性）
  function wsFrame(ws, w, h) {
    const vals = wsVisible(ws), b = wsBounds(vals), vw = wsView(ws, w, h, b), s = UI.Space.perUnit(w, vw);
    return { vals, b, vw, s, w, h, X: (x) => UI.Space.canvasX(x, w, vw), Y: (y) => UI.Space.canvasY(y, h, vw, w) };
  }
  Object.assign(SG, { wsValues, wsSteps, wsVisible, figBox, wsBounds, autoView, wsView, fmtHalf, rangeText, checkViews, wsFrame });
})(window);
