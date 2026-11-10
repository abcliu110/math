/* 台面（D4 拆分）：放下与落点：指针下的卡片、连线目标、新卡片的空位、拖到容器上的判断。由 stage.js 拆出，只搬代码、不改逻辑；跨文件的名字经 UI.StageCtx（SG）访问。加载顺序见 index.html。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), W = U.World, K = U.kit, Q = U.Q;
  const $ = (s) => document.querySelector(s);
  const L = UI.LAYOUT, HD = L.HD, PORT_Y0 = L.PORT_Y0, PORT_DY = L.PORT_DY, PILL_DY = L.PILL_DY, PILL_W = L.PILL_W, MIN_W = L.MIN_W, MIN_H = L.MIN_H;
  const SG = UI.StageCtx;
  function hoverTarget(ev) {
    const el = document.elementFromPoint(ev.clientX, ev.clientY); if (!el) return null;
    const p = el.closest('.port.in, .pill'), c = el.closest('.card');
    if (p) return { el: p, id: p.dataset.id, port: p.dataset.port };
    if (c) return { el: c, id: c.dataset.id, port: null };
    return null;
  }

  // 指针下面（除了被拖的这张）的第一张卡片对应的实体；没有则 null
  // 指针下面（除了被拖的这张）、满足 pred 的第一张卡片对应的实体。容器常被里面的东西盖住，所以要一层层找。
  function cardUnder(ev, id, pred) {
    const S = UI.S;
    for (const n of document.elementsFromPoint(ev.clientX, ev.clientY)) {
      const c = n.closest && n.closest('.card'); if (!c || c.dataset.id === id) continue;
      const e = S.scene.entities[c.dataset.id]; if (e && (!pred || pred(e))) return e;
    }
    return null;
  }
  const isContainer = (e) => !!(U.types[e.type] && U.types[e.type].slots);
  // 1.10：松手时，如果落在能装它的容器上就放进去；落在别处且原来在容器里，就取出来
  // 新加一张卡片放哪里：从想放的位置开始，往外一圈一圈找，找到和已有卡片（包括工作区底下的工具面板）都不重叠的空位
  function freeSpot(x, y, type) {
    const E = UI.S.scene.entities, d = U.types[type], sz = d && d.size ? d.size({ props: {} }) : L.DEFAULT_CARD, w = sz[0], h = sz[1];
    // 占地：卡片本身，加上工作区的面板（实测的尺寸和位置，见 UI.Layout.panelRect）
    const rects = [];
    for (const e of Object.values(E)) {
      if (e.parent) continue;
      const g = SG.geom(e), P = L.CARD_PAD;
      rects.push({ x0: g.x - P, y0: g.y - P, x1: g.x + g.w + P, y1: g.y + g.h + P });
      if (SG.isWsDef(e.type)) { const p = UI.Layout.panelRect(e.id, g); rects.push({ x0: p.x - P, y0: p.y - P, x1: p.x + p.w + P, y1: p.y + p.h + P }); }
    }
    const hit = (px, py) => rects.some((r) => px < r.x1 && px + w > r.x0 && py < r.y1 && py + h > r.y0);
    if (!hit(x, y)) return { x, y };
    for (let ring = 1; ring <= L.SPOT_RINGS; ring++) {
      for (let i = -ring; i <= ring; i++) for (const [px, py] of [[x + i * L.SPOT_STEP, y - ring * L.SPOT_STEP], [x + i * L.SPOT_STEP, y + ring * L.SPOT_STEP], [x - ring * L.SPOT_STEP, y + i * L.SPOT_STEP], [x + ring * L.SPOT_STEP, y + i * L.SPOT_STEP]]) if (!hit(px, py)) return { x: px, y: py };
    }
    return { x, y };
  }
  // 松手时落在哪个容器上（只算结论，不动台面；动作由 UI.Intent 做）：
  // 工作区 → { ws, x, y }（图形落在鼠标松开的位置；放进去之前先把坐标范围定下来，免得每放一个就重新缩放）；
  // 能装它的槽位 → { parent, slot }；没有 → null。opt.piece：块拖出工作区时用，不进工作区，槽位只认明确接受它的。
  function dropTarget(ev, id, opt) {
    const S = UI.S, e = S.scene.entities[id]; if (!e) return null;
    const t = cardUnder(ev, id, isContainer);
    const td = t ? U.types[t.type] : null;
    const slots = td && td.slots ? Object.keys(td.slots) : [];
    if (!(t && slots.length)) return null;
    const piece = !!(opt && opt.piece);
    if (SG.isWsDef(t.type) && !piece) {
      const g = SG.geom(t); if (!UI.State.viewOf(t)) UI.State.setUi(t, 'view', SG.wsView(t, g.w, g.h - HD));
      const wb = document.querySelector('svg.wsbody[data-wsid="' + t.id + '"]'), fr = SG.wsFrame(t, g.w, g.h - HD);
      const pt = wb ? UI.Space.screenToWorkspace(ev, fr.vw, UI.Space.canvasOf(wb.getBoundingClientRect(), fr.vw.span)) : null;
      return { ws: t.id, x: pt ? pt.x : undefined, y: pt ? pt.y : undefined };
    }
    const accepting = slots.find((sn) => { const A = td.slots[sn].accepts; return A === '*' || A.includes(e.type); });
    const slot = piece ? accepting : (accepting || slots[0]);
    return slot ? { parent: t.id, slot } : null;
  }
  Object.assign(SG, { hoverTarget, cardUnder, isContainer, freeSpot, dropTarget });
})(window);
