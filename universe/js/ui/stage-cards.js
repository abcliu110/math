/* 台面（D4 拆分）：台面卡片：卡片、端口、药丸、连线、渲染总入口、专注模式。由 stage.js 拆出，只搬代码、不改逻辑；跨文件的名字经 UI.StageCtx（SG）访问。加载顺序见 index.html。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), W = U.World, K = U.kit, Q = U.Q;
  const $ = (s) => document.querySelector(s);
  const L = UI.LAYOUT, HD = L.HD, PORT_Y0 = L.PORT_Y0, PORT_DY = L.PORT_DY, PILL_DY = L.PILL_DY, PILL_W = L.PILL_W, MIN_W = L.MIN_W, MIN_H = L.MIN_H;
  const SG = UI.StageCtx;
  // 哪些属性口要画成药丸：被连线驱动的；正在拖线时再加上所有可写、没被驱动的
  function pillsOf(e, D) {
    const d = SG.def(e), driven = (D[e.id] && D[e.id].driven) || {};
    return Object.keys(d.props).filter((k) => d.props[k].write && (driven[k] || SG.linking));
  }
  function portPos(e, port, D, out) {
    const g = SG.geom(e), d = SG.def(e);
    if (out) { const i = Math.max(0, Object.keys(d.outputs).indexOf(port)); return { x: g.x + g.w, y: g.y + PORT_Y0 + i * PORT_DY }; }
    if (W.isProp(port)) { const k = port.slice(2), ps = pillsOf(e, D), i = Math.max(0, ps.indexOf(k)); return { x: g.x - L.PILL_GAP, y: g.y + PORT_Y0 + i * PILL_DY }; }
    const i = Math.max(0, Object.keys(d.inputs).indexOf(port)); return { x: g.x, y: g.y + PORT_Y0 + i * PORT_DY };
  }
  const bez = (a, b) => { const dx = Math.max(L.LINK_CURVE_MIN, Math.abs(b.x - a.x) / 2); return 'M' + a.x + ',' + a.y + ' C' + (a.x + dx) + ',' + a.y + ' ' + (b.x - dx) + ',' + b.y + ' ' + b.x + ',' + b.y; };

  function cardHtml(e, D, S) {
    const d = SG.def(e), g = SG.geom(e), dd = D[e.id], cH = g.h - HD;
    const c = { ent: e, props: dd.props || e.props, d: dd, out: dd.out, state: e.state, w: g.w, h: cH, t: S.scene.clock.t, n: S.scene.clock.n };
    let body = '', badge = '';
    try { body = SG.isWsDef(e.type) ? SG.wsBody(e, g.w, cH) : d.draw(c); } catch (x) { body = K.text(g.w / 2, cH / 2, '画不出来', { fill: 'var(--bad)' }); }
    // 工作区的标题步数只数学生做的步骤（和下面的步骤清单是同一批）
    try { badge = SG.isWsDef(e.type) ? (SG.wsSteps(e).length ? SG.wsSteps(e).length + ' 步' : '') : d.badge ? d.badge(c) : ''; } catch (x) { badge = ''; }
    let h = '<div class="card' + (S.sel === e.id ? ' sel' : '') + '" data-id="' + e.id + '" style="left:' + g.x + 'px;top:' + g.y + 'px;width:' + g.w + 'px;height:' + g.h + 'px">';
    h += '<div class="hd" data-id="' + e.id + '"><span class="nm">' + K.esc(e.name) + '</span><span class="bd">' + K.esc(badge || '') + '</span></div>';
    const drawing = S.wsDraw && S.wsDraw.ws === e.id;   // 正在画线：指针变成十字（2.5）
    h += '<svg class="bdy' + (SG.isWsDef(e.type) ? ' wsbody' + (drawing ? ' drawing' : '') + '" data-wsid="' + e.id : '') + '" width="' + g.w + '" height="' + cH + '" viewBox="0 0 ' + g.w + ' ' + cH + '">' + body + '</svg>';
    Object.keys(d.inputs).forEach((k, i) => {
      h += '<i class="port in" data-id="' + e.id + '" data-port="' + k + '" style="left:0;top:' + (PORT_Y0 + i * PORT_DY) + 'px"></i>';
      h += '<span class="pl" style="left:' + L.PORT_LABEL_X + 'px;top:' + (PORT_Y0 + i * PORT_DY) + 'px">' + K.esc(d.inputs[k].label) + '</span>';
    });
    Object.keys(d.outputs).forEach((k, i) => {
      h += '<i class="port out" data-id="' + e.id + '" data-port="' + k + '" style="left:' + g.w + 'px;top:' + (PORT_Y0 + i * PORT_DY) + 'px;background:' + U.kindColor(d.outputs[k].kind) + '"></i>';
      if (!SG.isWsDef(e.type)) h += '<span class="pl" style="right:' + L.PORT_LABEL_X + 'px;top:' + (PORT_Y0 + i * PORT_DY) + 'px">' + K.esc(d.outputs[k].label) + '</span>';   // 工作区的步数标在标题栏里，这里不再写（会和画布里的把手叠在一起）
    });
    if (d.handles) h += '<i class="rz" data-rz="' + e.id + '" title="拖动改大小；双击恢复默认"></i>';   // 把手由器材声明（handles）
    h += '</div>';
    // 属性药丸（在卡片左边外侧）
    pillsOf(e, D).forEach((k, i) => {
      const drv = dd.driven[k];
      h += '<div class="pill' + (drv ? ' driven' : '') + '" data-id="' + e.id + '" data-port="p.' + k + '" style="left:' + (g.x - PILL_W - L.PILL_GAP) + 'px;top:' + (g.y + PORT_Y0 + i * PILL_DY) + 'px">' + K.esc(d.props[k].label) + '</div>';
    });
    // 信号条
    const sg = (dd.sig || []).slice().sort((a, b) => SG.SIGLV.indexOf(a.lv) - SG.SIGLV.indexOf(b.lv))[0];
    if (sg && S.showSig) h += '<div class="sig ' + sg.lv + '" style="left:' + g.x + 'px;top:' + (g.y + g.h + L.SIG_GAP) + 'px">' + K.esc(sg.tx) + '</div>';
    // 选中工具条
    if (S.sel === e.id) {
      h += '<div class="tool" style="left:' + (g.x + g.w + L.TOOL_GAP) + 'px;top:' + g.y + 'px">' +
        '<button data-act="insp" title="属性">' + ico('gear') + '</button><button data-act="copy" title="复制">' + ico('copy') + '</button>' +
        (SG.def(e).stateful ? '<button data-act="resetstate" title="记忆归零">' + ico('undo') + '</button>' : '') +
        (SG.roleOf(e) === 'piece' ? '<button data-act="turn" title="转 90°（R）">' + ico('turn') + '</button><button data-act="flip" title="左右翻（F）">' + ico('flip') + '</button>' : '') +
        '<button data-act="del" title="删除">' + ico('trash') + '</button></div>';
    }
    if (SG.isWsDef(e.type)) { const ff = SG.figFloat(e, g.w, cH); if (ff) h += SG.floatHtml(e.id, ff, g.x, g.y + HD); }
    return h;
  }
  const ICO = {
    gear: '<path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm8 3.5l-1.7-.6a6.6 6.6 0 0 0-.6-1.4l.8-1.6-1.9-1.9-1.6.8c-.4-.3-.9-.5-1.4-.6L12.4 4h-2.8l-.6 1.7c-.5.1-1 .3-1.4.6l-1.6-.8-1.9 1.9.8 1.6c-.3.4-.5.9-.6 1.4L4 12v2.8l1.7.6c.1.5.3 1 .6 1.4l-.8 1.6 1.9 1.9 1.6-.8c.4.3.9.5 1.4.6l.6 1.7h2.8l.6-1.7c.5-.1 1-.3 1.4-.6l1.6.8 1.9-1.9-.8-1.6c.3-.4.5-.9.6-1.4l1.7-.6z" transform="scale(.9) translate(1.3 -1)"/>',
    copy: '<path d="M8 8h10v12H8zM6 16H5V5h10v1" fill="none" stroke="currentColor" stroke-width="2"/>',
    trash: '<path d="M6 8h12M9 8V5h6v3M8 8l1 12h6l1-12" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    undo: '<path d="M7 9H4V6M4 9a8 8 0 1 1 1 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    turn: '<path d="M19 12a7 7 0 1 1-2.05-4.95M19 4v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    flip: '<path d="M12 3v18M4 7l5 5-5 5zM20 7l-5 5 5 5z" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  };
  const ico = (n) => '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">' + ICO[n] + '</svg>';
  UI.ico = ico;

  function linksHtml(S) {
    const D = S.D, E = S.scene.entities;
    let paths = '', lbl = '';
    for (const l of S.scene.links) {
      const F = E[l.from], T = E[l.to]; if (!F || !T || SG.inWs(F) || SG.inWs(T)) continue;
      const a = portPos(F, l.fromPort, D, true), b = portPos(T, l.toPort, D, false);
      const v = D[F.id] && D[F.id].out[l.fromPort], col = U.kindColor(SG.def(F).outputs[l.fromPort] ? SG.def(F).outputs[l.fromPort].kind : 'num');
      const sel = S.selLink === l.id, pd = bez(a, b);
      paths += '<path class="hit" data-link="' + l.id + '" d="' + pd + '"/><path class="ln' + (sel ? ' sel' : '') + '" stroke="' + col + '" d="' + pd + '"/>';
      if (S.scene.clock.running) paths += '<path class="flow" d="' + pd + '"/>';
      lbl += '<div class="lb' + (sel ? ' sel' : '') + '" data-link="' + l.id + '" style="left:' + ((a.x + b.x) / 2) + 'px;top:' + ((a.y + b.y) / 2) + 'px">' + K.esc(v ? U.briefVal(v) : '—') + (sel ? ' <button class="lbwhy" data-why="' + l.from + '|' + l.fromPort + '" title="这个数是怎么来的">？</button><button class="lbdel" data-unlink="' + l.id + '" title="删除这根线">✕</button>' : '') + '</div>';
    }
    if (SG.linking && SG.linking.cur) { const F = E[SG.linking.from]; paths += '<path class="ln" stroke="#fff" stroke-dasharray="6 6" d="' + bez(portPos(F, SG.linking.fromPort, D, true), SG.linking.cur) + '" fill="none"/>'; }
    return { paths, lbl };
  }

  function render() {
    const S = UI.S; if (!S) return;
    SG.checkViews();
    const D = S.D, E = S.scene.entities;
    const lk = linksHtml(S);
    let h = '<svg id="links" width="1" height="1">' + lk.paths + '</svg>';
    // 工作区里的器材不画卡片；工作区的选中对象只保留还存在的名字
    const names = SG.wsNames(), known = new Set(Object.values(names));
    S.wsSel = (S.wsSel || []).filter((n) => known.has(n) || n[0] === "#");
    for (const id of Object.keys(E)) if (!SG.inWs(E[id])) h += cardHtml(E[id], D, S);
    h += lk.lbl;
    for (const id of Object.keys(E)) if (SG.isWsDef(E[id].type)) h += SG.wsPanelHtml(E[id], names);
    SG.worldEl.innerHTML = h;
    if (UI.Guide) UI.Guide.check(Object.values(E).some((x) => SG.isWsDef(x.type)));   // 2.13：第一次看到几何工作区，弹一次引导
    SG.worldEl.style.transform = 'translate(' + S.view.x + 'px,' + S.view.y + 'px) scale(' + S.view.z + ')';
    UI.Layout.placePanels(SG.worldEl, SG.stageEl, S.view, (id) => { const e = S.scene.entities[id]; return e ? SG.geom(e) : null; });
    renderBars();
    const z = $('#zv'); if (z) z.textContent = Math.round(S.view.z * 100) + '%';
    if (SG.focusEl) { SG.focusEl.innerHTML = focusHtml(); SG.focusEl.style.display = UI.State.focusedId() ? '' : 'none'; }
    if (UI.App && UI.App.persistView) UI.App.persistView();   // 视图改过就存档（不进撤销）
  }

  // 浮动工具条（V2）：每个工作区一条，贴在画布上方（屏幕像素，不随台面缩放）；专注时不画，标题栏里有同样的按钮
  function renderBars() {
    if (!SG.barsEl) return;
    const S = UI.S, Sp = UI.Space;
    let h = '';
    if (!UI.State.focusedId()) for (const id of Object.keys(S.scene.entities)) {
      const e = S.scene.entities[id];
      if (!SG.isWsDef(e.type) || SG.inWs(e)) continue;
      const g = SG.geom(e), at = Sp.stageToLocal(S.view, { x: g.x, y: g.y });
      h += SG.barHtml(e, { x: at.x, y: at.y - L.BAR.h - L.BAR.gap });
    }
    SG.barsEl.innerHTML = h;
  }
  // ---- 专注模式（§10.5.8 A4，V2）：工作区放大成覆盖台面的浮层，双击标题、按 Esc 或再点“全屏”还原 ----
  // 画布占满台面（抽屉展开时让出右边一栏）；标题栏里有工具，抽屉（图层、步骤、范围）可以收起
  function setFocus(id) { UI.State.setFocusId(id || null); render(); }
  function focusHtml() {
    const S = UI.S, id = UI.State.focusedId(), e = id && S.scene.entities[id];
    if (!e || !SG.isWsDef(e.type)) { if (id) UI.State.setFocusId(null); return ''; }
    const r = SG.stageEl.getBoundingClientRect(), F = L.FOCUS, open = UI.Chrome.focusSideOpen();
    const W = Math.max(F.minW, Math.round(r.width - F.padX - (open ? F.side : 0))), H = Math.max(F.minH, Math.round(r.height - F.hdH - F.padY));
    let h = '<div class="wsf-hd" title="双击标题，或按 Esc，还原"><b>' + K.esc(e.name) + '</b><span>双击标题或按 Esc 还原</span>' + SG.barTools(e) +
      '<button data-fbar="side" data-ws="' + e.id + '" title="展开或收起右边的抽屉（图层、步骤、范围）">' + (open ? '收起抽屉' : '展开抽屉') + '</button>' +
      '<button data-fbar="focus" data-ws="' + e.id + '" title="还原到台面">还原</button></div>';
    h += '<div class="wsf-main"><svg class="bdy wsbody" data-wsid="' + e.id + '" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' + SG.wsBody(e, W, H) + '</svg>';
    if (open) h += '<div class="wsf-side">' + SG.wsPanelHtml(e, SG.wsNames(), { w: W, h: H }, true) + '</div>';
    return h + '</div>';
  }
  Object.assign(SG, { pillsOf, portPos, bez, cardHtml, ICO, ico, linksHtml, render, setFocus, focusHtml });
})(window);
