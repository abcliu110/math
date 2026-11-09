/* 台面：卡片、端口、连线、拖拽、缩放、平移。DOM 卡片 + SVG 连线，整块重绘（卡片数 < 40，够快）。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), W = U.World, K = U.kit;
  const $ = (s) => document.querySelector(s);
  const HD = 28, PORT_Y0 = 40, PORT_DY = 22, PILL_DY = 26, PILL_W = 92;
  let stageEl, worldEl, drag = null, linking = null, lastClick = { id: null, t: 0 };

  const def = (e) => U.types[e.type];
  const geom = (e) => { const sz = def(e).size(e); return { x: e.x, y: e.y, w: sz[0], h: sz[1] }; };
  const SIGLV = ['err', 'reject', 'warn', 'ok', 'info'];

  // 哪些属性口要画成药丸：被连线驱动的；正在拖线时再加上所有可写、没被驱动的
  function pillsOf(e, D) {
    const d = def(e), driven = (D[e.id] && D[e.id].driven) || {};
    return Object.keys(d.props).filter((k) => d.props[k].write && (driven[k] || linking));
  }
  function portPos(e, port, D, out) {
    const g = geom(e), d = def(e);
    if (out) { const i = Math.max(0, Object.keys(d.outputs).indexOf(port)); return { x: g.x + g.w, y: g.y + PORT_Y0 + i * PORT_DY }; }
    if (W.isProp(port)) { const k = port.slice(2), ps = pillsOf(e, D), i = Math.max(0, ps.indexOf(k)); return { x: g.x - 8, y: g.y + PORT_Y0 + i * PILL_DY }; }
    const i = Math.max(0, Object.keys(d.inputs).indexOf(port)); return { x: g.x, y: g.y + PORT_Y0 + i * PORT_DY };
  }
  const bez = (a, b) => { const dx = Math.max(40, Math.abs(b.x - a.x) / 2); return 'M' + a.x + ',' + a.y + ' C' + (a.x + dx) + ',' + a.y + ' ' + (b.x - dx) + ',' + b.y + ' ' + b.x + ',' + b.y; };

  function cardHtml(e, D, S) {
    const d = def(e), g = geom(e), dd = D[e.id], cH = g.h - HD;
    const c = { ent: e, props: dd.props || e.props, d: dd, out: dd.out, state: e.state, w: g.w, h: cH, t: S.scene.clock.t, n: S.scene.clock.n };
    let body = '', badge = '';
    try { body = d.draw(c); } catch (x) { body = K.text(g.w / 2, cH / 2, '画不出来', { fill: 'var(--bad)' }); }
    try { badge = d.badge ? d.badge(c) : ''; } catch (x) { badge = ''; }
    let h = '<div class="card' + (S.sel === e.id ? ' sel' : '') + '" data-id="' + e.id + '" style="left:' + g.x + 'px;top:' + g.y + 'px;width:' + g.w + 'px;height:' + g.h + 'px">';
    h += '<div class="hd" data-id="' + e.id + '"><span class="nm">' + K.esc(e.name) + '</span><span class="bd">' + K.esc(badge || '') + '</span></div>';
    h += '<svg class="bdy" width="' + g.w + '" height="' + cH + '" viewBox="0 0 ' + g.w + ' ' + cH + '">' + body + '</svg>';
    Object.keys(d.inputs).forEach((k, i) => {
      const y = PORT_Y0 - HD + i * PORT_DY + HD - 0;
      h += '<i class="port in" data-id="' + e.id + '" data-port="' + k + '" style="left:0;top:' + (PORT_Y0 + i * PORT_DY - 0) + 'px"></i>';
      h += '<span class="pl" style="left:12px;top:' + (PORT_Y0 + i * PORT_DY) + 'px">' + K.esc(d.inputs[k].label) + '</span>';
    });
    Object.keys(d.outputs).forEach((k, i) => {
      h += '<i class="port out" data-id="' + e.id + '" data-port="' + k + '" style="left:' + g.w + 'px;top:' + (PORT_Y0 + i * PORT_DY) + 'px;background:' + U.kindColor(d.outputs[k].kind) + '"></i>';
      h += '<span class="pl" style="right:12px;top:' + (PORT_Y0 + i * PORT_DY) + 'px">' + K.esc(d.outputs[k].label) + '</span>';
    });
    h += '</div>';
    // 属性药丸（在卡片左边外侧）
    pillsOf(e, D).forEach((k, i) => {
      const drv = dd.driven[k];
      h += '<div class="pill' + (drv ? ' driven' : '') + '" data-id="' + e.id + '" data-port="p.' + k + '" style="left:' + (g.x - PILL_W - 8) + 'px;top:' + (g.y + PORT_Y0 + i * PILL_DY) + 'px">' + K.esc(d.props[k].label) + '</div>';
    });
    // 信号条
    const sg = (dd.sig || []).slice().sort((a, b) => SIGLV.indexOf(a.lv) - SIGLV.indexOf(b.lv))[0];
    if (sg && S.showSig) h += '<div class="sig ' + sg.lv + '" style="left:' + g.x + 'px;top:' + (g.y + g.h + 8) + 'px">' + K.esc(sg.tx) + '</div>';
    // 选中工具条
    if (S.sel === e.id) {
      h += '<div class="tool" style="left:' + (g.x + g.w + 14) + 'px;top:' + g.y + 'px">' +
        '<button data-act="insp" title="属性">' + ico('gear') + '</button><button data-act="copy" title="复制">' + ico('copy') + '</button>' +
        (def(e).stateful ? '<button data-act="resetstate" title="记忆归零">' + ico('undo') + '</button>' : '') +
        '<button data-act="del" title="删除">' + ico('trash') + '</button></div>';
    }
    return h;
  }
  const ICO = {
    gear: '<path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm8 3.5l-1.7-.6a6.6 6.6 0 0 0-.6-1.4l.8-1.6-1.9-1.9-1.6.8c-.4-.3-.9-.5-1.4-.6L12.4 4h-2.8l-.6 1.7c-.5.1-1 .3-1.4.6l-1.6-.8-1.9 1.9.8 1.6c-.3.4-.5.9-.6 1.4L4 12v2.8l1.7.6c.1.5.3 1 .6 1.4l-.8 1.6 1.9 1.9 1.6-.8c.4.3.9.5 1.4.6l.6 1.7h2.8l.6-1.7c.5-.1 1-.3 1.4-.6l1.6.8 1.9-1.9-.8-1.6c.3-.4.5-.9.6-1.4l1.7-.6z" transform="scale(.9) translate(1.3 -1)"/>',
    copy: '<path d="M8 8h10v12H8zM6 16H5V5h10v1" fill="none" stroke="currentColor" stroke-width="2"/>',
    trash: '<path d="M6 8h12M9 8V5h6v3M8 8l1 12h6l1-12" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    undo: '<path d="M7 9H4V6M4 9a8 8 0 1 1 1 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  };
  const ico = (n) => '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">' + ICO[n] + '</svg>';
  UI.ico = ico;

  function linksHtml(S) {
    const D = S.D, E = S.scene.entities;
    let paths = '', lbl = '';
    for (const l of S.scene.links) {
      const F = E[l.from], T = E[l.to]; if (!F || !T) continue;
      const a = portPos(F, l.fromPort, D, true), b = portPos(T, l.toPort, D, false);
      const v = D[F.id] && D[F.id].out[l.fromPort], col = U.kindColor(def(F).outputs[l.fromPort] ? def(F).outputs[l.fromPort].kind : 'num');
      const sel = S.selLink === l.id, pd = bez(a, b);
      paths += '<path class="hit" data-link="' + l.id + '" d="' + pd + '"/><path class="ln' + (sel ? ' sel' : '') + '" stroke="' + col + '" d="' + pd + '"/>';
      if (S.scene.clock.running) paths += '<path class="flow" d="' + pd + '"/>';
      lbl += '<div class="lb' + (sel ? ' sel' : '') + '" data-link="' + l.id + '" style="left:' + ((a.x + b.x) / 2) + 'px;top:' + ((a.y + b.y) / 2) + 'px">' + K.esc(v ? U.showVal(v) : '—') + (sel ? ' <button class="lbdel" data-unlink="' + l.id + '" title="删除这根线">✕</button>' : '') + '</div>';
    }
    if (linking && linking.cur) { const F = E[linking.from]; paths += '<path class="ln" stroke="#fff" stroke-dasharray="6 6" d="' + bez(portPos(F, linking.fromPort, D, true), linking.cur) + '" fill="none"/>'; }
    return { paths, lbl };
  }

  function render() {
    const S = UI.S; if (!S) return;
    const D = S.D, E = S.scene.entities;
    const lk = linksHtml(S);
    let h = '<svg id="links" width="1" height="1">' + lk.paths + '</svg>';
    for (const id of Object.keys(E)) h += cardHtml(E[id], D, S);
    h += lk.lbl;
    worldEl.innerHTML = h;
    worldEl.style.transform = 'translate(' + S.view.x + 'px,' + S.view.y + 'px) scale(' + S.view.z + ')';
    const z = $('#zv'); if (z) z.textContent = Math.round(S.view.z * 100) + '%';
  }

  const toWorld = (ev) => { const r = stageEl.getBoundingClientRect(), v = UI.S.view; return { x: (ev.clientX - r.left - v.x) / v.z, y: (ev.clientY - r.top - v.y) / v.z }; };

  function fit() {
    const S = UI.S, ids = Object.keys(S.scene.entities), r = stageEl.getBoundingClientRect();
    if (!ids.length) { S.view = { x: r.width / 2 - 200, y: r.height / 2 - 120, z: 1 }; return; }
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    ids.forEach((id) => { const e = S.scene.entities[id], g = geom(e); x0 = Math.min(x0, g.x - 110); y0 = Math.min(y0, g.y); x1 = Math.max(x1, g.x + g.w + 60); y1 = Math.max(y1, g.y + g.h + 50); });
    const z = Math.max(0.35, Math.min(1.15, Math.min((r.width - 80) / (x1 - x0), (r.height - 150) / (y1 - y0))));
    S.view = { z, x: (r.width - (x1 - x0) * z) / 2 - x0 * z, y: Math.max(50, (r.height - (y1 - y0) * z) / 2) - y0 * z + 20 };
  }

  function zoomAt(f, cx, cy) {
    const S = UI.S, v = S.view, r = stageEl.getBoundingClientRect();
    if (cx === undefined) { cx = r.width / 2; cy = r.height / 2; } else { cx -= r.left; cy -= r.top; }
    const z = Math.max(0.3, Math.min(2.5, v.z * f)), k = z / v.z;
    v.x = cx - (cx - v.x) * k; v.y = cy - (cy - v.y) * k; v.z = z; render();
  }

  // ---- 拖线时的提示 ----
  const tip = () => $('#tip');
  function showTip(x, y, txt, good) { const t = tip(); if (!txt) { t.style.display = 'none'; return; } t.textContent = txt; t.className = good ? 'good' : ''; t.style.display = 'block'; t.style.left = x + 14 + 'px'; t.style.top = y + 14 + 'px'; }

  function onDown(ev) {
    const S = UI.S, t = ev.target;
    if (t.closest('.tool')) return;
    const outp = t.closest('.port.out');
    if (outp) {
      ev.preventDefault();
      linking = { from: outp.dataset.id, fromPort: outp.dataset.port, cur: toWorld(ev) };
      stageEl.setPointerCapture && 0; render(); return;
    }
    const ub = t.closest('[data-unlink]');
    if (ub) { S.selLink = null; UI.App.act({ t: 'unlink', id: ub.dataset.unlink }); return; }
    const lb = t.closest('[data-link]');
    if (lb) { S.selLink = lb.dataset.link; S.sel = null; UI.Panels.renderInsp(); render(); return; }
    const card = t.closest('.card');
    if (card) {
      const id = card.dataset.id; if (t.closest('.port')) return;
      const now = Date.now();
      if (lastClick.id === id && now - lastClick.t < 400) { S.inspOpen = true; lastClick = { id: null, t: 0 }; } else lastClick = { id, t: now };
      S.sel = id; S.selLink = null;
      const w = toWorld(ev), e = S.scene.entities[id];
      drag = { kind: 'move', id, dx: w.x - e.x, dy: w.y - e.y, moved: false, sx: ev.clientX, sy: ev.clientY };
      UI.Panels.renderInsp(); render(); return;
    }
    if (t.closest('.pill')) return;
    S.sel = null; S.selLink = null; UI.Panels.renderInsp();
    drag = { kind: 'pan', sx: ev.clientX, sy: ev.clientY, vx: S.view.x, vy: S.view.y };
    stageEl.classList.add('panning'); render();
  }

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
  function dropOnContainer(id, ev) {
    const S = UI.S, e = S.scene.entities[id]; if (!e) return;
    const t = cardUnder(ev, id, isContainer);
    const td = t ? U.types[t.type] : null;
    const slots = td && td.slots ? Object.keys(td.slots) : [];
    if (t && slots.length) {
      const accepting = slots.find((sn) => { const A = td.slots[sn].accepts; return A === '*' || A.includes(e.type); });
      UI.App.act({ t: 'put', id, parent: t.id, slot: accepting || slots[0] });
    } else if (e.parent) UI.App.act({ t: 'take', id });
  }

  function onMove(ev) {
    const S = UI.S;
    if (linking) {
      linking.cur = toWorld(ev);
      document.querySelectorAll('.port.ok,.port.no,.pill.ok,.pill.no').forEach((n) => n.classList.remove('ok', 'no'));
      const h = hoverTarget(ev);
      if (h && h.id !== linking.from || (h && h.port)) {
        const r = W.dryLink(S.scene, { from: linking.from, fromPort: linking.fromPort, to: h.id, toPort: h.port || undefined });
        if (h.el.classList.contains('port') || h.el.classList.contains('pill')) h.el.classList.add(r.ok ? 'ok' : 'no');
        showTip(ev.clientX, ev.clientY, r.ok ? '松手连上' : r.why, r.ok);
      } else showTip(0, 0, '');
      // 只重画拖线那一条，避免整块重绘打断悬停状态
      const lp = worldEl.querySelector('#links path[stroke-dasharray]');
      const F = S.scene.entities[linking.from], a = portPos(F, linking.fromPort, S.D, true);
      if (lp) lp.setAttribute('d', bez(a, linking.cur)); else { const sv = worldEl.querySelector('#links'); sv.insertAdjacentHTML('beforeend', '<path class="ln" stroke="#fff" stroke-dasharray="6 6" fill="none" d="' + bez(a, linking.cur) + '"/>'); }
      return;
    }
    if (!drag) return;
    if (drag.kind === 'pan') { S.view.x = drag.vx + ev.clientX - drag.sx; S.view.y = drag.vy + ev.clientY - drag.sy; render(); return; }
    if (drag.kind === 'move') {
      if (!drag.moved && Math.hypot(ev.clientX - drag.sx, ev.clientY - drag.sy) < 4) return;
      const w = toWorld(ev);
      if (!drag.moved) { drag.moved = true; UI.App.snapshot(); }
      W.act(S.scene, { t: 'move', id: drag.id, x: w.x - drag.dx, y: w.y - drag.dy }); render();
      // 拖到容器上时，给容器加虚线框提示“松手放进去”
      const hov = cardUnder(ev, drag.id, isContainer);
      document.querySelectorAll('.card.droptarget').forEach((c) => c.classList.remove('droptarget'));
      if (hov) { const c = worldEl.querySelector('.card[data-id="' + hov.id + '"]'); if (c) c.classList.add('droptarget'); }
    }
  }

  function onUp(ev) {
    const S = UI.S;
    if (linking) {
      const h = hoverTarget(ev), L = linking; linking = null; showTip(0, 0, '');
      if (h && (h.id !== L.from || h.port)) UI.App.act({ t: 'link', from: L.from, fromPort: L.fromPort, to: h.id, toPort: h.port || undefined }); else render();
      render(); return;
    }
    if (drag) {
      const d = drag; drag = null; stageEl.classList.remove('panning');
      document.querySelectorAll('.card.droptarget').forEach((c) => c.classList.remove('droptarget'));
      if (d.kind === 'move' && d.moved) { dropOnContainer(d.id, ev); UI.App.afterMove(); }
    }
  }

  function init() {
    stageEl = $('#stage'); worldEl = $('#world');
    stageEl.addEventListener('pointerdown', onDown);
    // 拖卡片时不让浏览器接管成“原生拖放”（否则之后的 pointermove 全被吞掉）
    stageEl.addEventListener('dragstart', (ev) => ev.preventDefault());
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    stageEl.addEventListener('wheel', (ev) => { ev.preventDefault(); zoomAt(ev.deltaY < 0 ? 1.1 : 1 / 1.1, ev.clientX, ev.clientY); }, { passive: false });
    stageEl.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-act]'); if (!b) return;
      const S = UI.S, id = S.sel; if (!id) return;
      const a = b.dataset.act;
      if (a === 'insp') { S.inspOpen = !S.inspOpen; UI.Panels.renderInsp(); }
      else if (a === 'copy') UI.App.act({ t: 'copy', id });
      else if (a === 'del') { S.sel = null; UI.App.removeEntity(id); }
      else if (a === 'resetstate') UI.App.act({ t: 'resetstate', id });
    });
  }

  UI.Stage = { init, render, fit, zoomAt, toWorld, geom, portPos };
})(window);
