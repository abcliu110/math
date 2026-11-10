/* 台面（D4 拆分）：拖动与手势：按下、移动、松手，双击循环选中，拖线和拖卡片。由 stage.js 拆出，只搬代码、不改逻辑；跨文件的名字经 UI.StageCtx（SG）访问。加载顺序见 index.html。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), W = U.World, K = U.kit, Q = U.Q;
  const $ = (s) => document.querySelector(s);
  const L = UI.LAYOUT, HD = L.HD, PORT_Y0 = L.PORT_Y0, PORT_DY = L.PORT_DY, PILL_DY = L.PILL_DY, PILL_W = L.PILL_W, MIN_W = L.MIN_W, MIN_H = L.MIN_H;
  const SG = UI.StageCtx;
  // 开始拖柄改大小：工作区先把现在看到的坐标范围存下来，之后拉大只是把图画大
  function startResize(id, ev) {
    const S = UI.S, e = S.scene.entities[id]; if (!e) return;
    ev.preventDefault(); ev.stopPropagation();
    const g = SG.geom(e);
    if (SG.isWsDef(e.type) && !UI.State.viewOf(e)) UI.State.setUi(e, 'view', SG.wsView(e, g.w, g.h - HD));
    S.sel = id; S.selLink = null;
    SG.drag = { kind: 'rz', id, sx: ev.clientX, sy: ev.clientY, w0: g.w, h0: g.h, zoom: S.view.z, moved: false };
  }
  // ---- 拖线时的提示 ----
  const tip = () => $('#tip');
  function showTip(x, y, txt, good) { const t = tip(); if (!txt) { t.style.display = 'none'; return; } t.textContent = txt; t.className = good ? 'good' : ''; t.style.display = 'block'; t.style.left = x + L.TIP_OFFSET + 'px'; t.style.top = y + L.TIP_OFFSET + 'px'; }
  // 工作区双击循环选中（V3，§1.5）。pointer 事件拿不到点击次数，所以自己配对：同一位置（4 像素内）500 毫秒内的两下点击是一次双击。
  // 双击的第一下照常选最上面的；第二下（wsCyc 记着上一次循环到哪里了）依次换到鼠标下面的下一个图形，栈顶在前，2 秒内连续双击有效。
  const WS_DBL_PX = 4;   // 两下点击离得不超过这么多像素才算同一位置
  // 同一位置的图形（V3，1.5 第 4 条）：从页面的命中结果读出（只看这个工作区），按优先级稳定排序：
  // 点（把手）0 > 线段、边 1 > 填充区域 2；同一优先级按栈的顺序（上面的在前）。第一个就是单击选中的。
  function pickStack(wb, x, y) {
    const seen = [], out = [];
    for (const el of document.elementsFromPoint(x, y)) {
      const pk = el.closest ? el.closest('[data-pick]') : null;
      if (!pk || pk.closest('.wsbody') !== wb || seen.includes(pk.dataset.pick)) continue;
      seen.push(pk.dataset.pick);
      out.push({ name: pk.dataset.pick, el: pk, pri: +(pk.dataset.pri || 2), i: out.length });
    }
    return out.sort((a, b) => a.pri - b.pri || a.i - b.i);
  }
  function wsCycPick(ev, wb, stack) {
    const now = Date.now(), last = SG.wsPress, same = (a) => Math.abs(a.x - ev.clientX) <= WS_DBL_PX && Math.abs(a.y - ev.clientY) <= WS_DBL_PX;
    SG.wsPress = { x: ev.clientX, y: ev.clientY, t: now, second: false };
    if (!last || last.second || !same(last) || now - last.t >= 500) return null;   // 第一下（或者已经配对过的）：照常选最上面的
    SG.wsPress.second = true;
    const names = stack.map((s) => s.name);
    if (!names.length) return null;
    const c = SG.wsCyc, near = !!c && c.wsid === wb.dataset.wsid && same(c) && now - c.t < 2000;
    const idx = near ? (c.idx + 1) % names.length : 0;
    SG.wsCyc = { wsid: wb.dataset.wsid, x: ev.clientX, y: ev.clientY, t: now, idx };
    return names[idx];
  }
  function onDown(ev) {
    const S = UI.S;
    if (ev.target.closest('.ctxmenu')) return;   // 长按菜单自己处理（V8）
    if (SG.ctxId) SG.closeCtx();
    let t = ev.target;
    if (ev.pointerType === 'touch') {   // 触屏（V8，2.7）：第二个触点是双指缩放；第一个触点的点击范围放大到 24 像素，并开始计长按
      if (SG.touchDown(ev)) return;
      t = SG.touchPick(ev) || t;
      SG.lpStart(ev, t);
    }
    if (t.closest('.tool') || t.closest('.wsx') || t.closest('.wsx-float') || t.closest('.fbar') || t.closest('.wsmini')) return;   // 工作区底下的面板和浮动工具条（.fbar，也带 .wsmini）：让浏览器照常处理按钮和输入框
    // 超出范围的图形的箭头：点一下，范围调到它
    const arr = t.closest('[data-fit-key]');
    if (arr) { ev.preventDefault(); ev.stopPropagation(); SG.wsFit(arr.dataset.fitWs, arr.dataset.fitKey); return; }
    // 专注浮层：标题双击还原；浮层里的画布和台面没有关系，照常往下处理
    const fo = t.closest('#wsfocus');
    if (fo && !t.closest('.wsbody')) { if (t.closest('.wsf-hd') && !t.closest('button') && SG.dbl('focus-hd')) SG.setFocus(null); return; }
    // 工作区里画线（点两下）；把手：边、角、旋转
    const wbd = t.closest('.wsbody');
    if (wbd) SG.hotWs = wbd.dataset.wsid;
    // Shift + 拖：不用点「连线」，直接拖出一条线（起点、终点都吸附）。按下后先不动手：不拖就还是原来的 Shift 点选（松手时处理）
    if (ev.shiftKey && wbd && !S.wsDraw && !t.closest('[data-hdl]') && !t.closest('.rz') && !t.closest('[data-fit-key]')) {
      const pk0 = t.closest('[data-pick]');
      ev.preventDefault(); ev.stopPropagation();
      SG.shiftLine = { wb: wbd, x: ev.clientX, y: ev.clientY, pick: pk0 ? pk0.dataset.pick : null };
      return;
    }
    if (S.wsDraw && wbd && wbd.dataset.wsid === S.wsDraw.ws) {
      // 剪的模式：没有在画线的时候，点图形的线是选图形（方便先选好要剪的那一块）
      if (S.wsDraw.tool === 'cut' && !S.wsDraw.pend && /^(path|line)$/i.test(t.tagName) && t.closest('[data-pick]')) { SG.wsPick(t.closest('[data-pick]').dataset.pick, ev.shiftKey); return SG.render(); }
      ev.preventDefault(); ev.stopPropagation(); SG.drawClick(wbd, ev); return;
    }
    // 尺子、量角器的把手（§10.5.9 第 6 条）：拖动挪它的一个点，松手提交一步
    const mh = t.closest('[data-mhdl]');
    if (mh && wbd) { ev.preventDefault(); ev.stopPropagation(); SG.markDown(mh, ev); return; }
    const hd = t.closest('[data-hdl]');
    if (hd && wbd) { ev.preventDefault(); ev.stopPropagation(); SG.startHandle(hd, ev); return; }
    // 卡片右下角的拖柄：拖动改大小；双击恢复默认大小（一次 act，可以撤销）
    const rz = t.closest('.rz');
    if (rz) {
      if (SG.dbl('rz:' + rz.dataset.rz)) { S.sel = rz.dataset.rz; UI.Intent.run('resize', { id: rz.dataset.rz, w: null, h: null }); return; }
      startResize(rz.dataset.rz, ev); return;
    }
    // 双击线段的长度（§10.5.9 第 2 条）：标签不是图形，点它不改选中；第二下开输入框，直接输入长度
    const dm = t.closest('[data-dim]');
    if (dm && wbd) { ev.preventDefault(); ev.stopPropagation(); if (SG.dbl('dim:' + dm.dataset.dim)) SG.startDim(dm.dataset.dim); return; }
    // 双击点的标签：改名（2.6）。第一下照常（标签不是选中的对象），第二下开输入框
    const rn = t.closest('[data-ren]');
    if (rn && wbd && SG.dbl('ren:' + rn.dataset.ren)) { ev.preventDefault(); ev.stopPropagation(); SG.startRename(rn.dataset.ren); return; }
    // 工作区里选中对象（点、线、图形）：Shift 点是加选
    let pk = t.closest('[data-pick]');
    // 复制、旋转、翻转、删除在等「点一下要操作的图形」：点到图形就做；点到别处取消
    if (S.wsArm && wbd && wbd.dataset.wsid === S.wsArm.ws) {
      const a = S.wsArm; S.wsArm = null;
      if (pk && pk.closest('.wsbody') === wbd) { ev.preventDefault(); ev.stopPropagation(); SG.wsAct(a.ws, a.act, pk.dataset.pick); return; }
      SG.setMsg('', true);
    }
    // 同一位置的图形：单击选栈顶（优先级最高的）；双击的第二下换到下一个（V3，原有）；Alt 点击选第二个（V3，1.5 第 2 条）
    const stack = pk && wbd ? pickStack(wbd, ev.clientX, ev.clientY) : [];
    const cyc = pk && wbd && !ev.shiftKey && !ev.altKey ? wsCycPick(ev, wbd, stack) : null;
    // 自由点（工作区里的点、多边形的顶点）：直接拖动（把手优先，Alt 也一样：按住 Alt 拖动是“拖动时暂时不吸附”）
    const gh = cyc ? null : t.closest('[data-drag]');
    // Alt 按下时：点在自由点的把手上照常拖（按住 Alt 拖动 = 暂时不吸附）；点在别的图形（包括块）上就是 Alt 点击，选第二个
    const ghEnt = gh ? S.scene.entities[gh.dataset.drag] : null, ghPoint = !!ghEnt && SG.roleOf(ghEnt) === 'point';
    const altPick = !!pk && !!wbd && ev.altKey && !ev.shiftKey && !ghPoint && stack.length > 1;
    let pick = stack.length ? stack[0].name : (pk ? pk.dataset.pick : null);
    if (cyc) pick = cyc;
    if (altPick) pick = stack[1].name;
    if (pick && pk) pk = (stack.find((s) => s.name === pick) || { el: pk }).el;
    if (altPick) { SG.wsPick(pick, false); SG.render(); return; }
    // 尺子、量角器本身（直接按在它上面）：整把挪动。优先于压在它下面的点（点的优先级比线高，但这里要的是尺子）
    const mkT = t.closest('[data-pick]');
    if (mkT && wbd && !ev.shiftKey && String(mkT.dataset.pick).indexOf('mk:') === 0 && SG.markBody(mkT, ev)) { ev.preventDefault(); ev.stopPropagation(); SG.render(); return; }
    if (pick) SG.wsPick(pick, ev.shiftKey);
    if (gh) {
      const pe = S.scene.entities[gh.dataset.drag]; if (!pe) return;
      if (SG.roleOf(pe) === 'piece') {
        // 编了组的块：拖动一起动（§10.5.9 第 3 条）；没编组就是原来的块拖动
        const gw = gh.closest('.wsbody'), pfi = gw && pk ? SG.figByName(gw.dataset.wsid, pk.dataset.pick) : null;
        if (pfi && pfi.ent.group && SG.groupDrag(ev, gw, gw.dataset.wsid, pfi)) { ev.preventDefault(); ev.stopPropagation(); SG.render(); return; }
        SG.pieceDown(pe, gh, pk, ev); return;
      }
      const gwb = gh.closest('.wsbody'); if (!gwb) return;
      ev.preventDefault(); ev.stopPropagation();
      // 拖动的是自由点（pt）：松手时可以吸附到构造点（V4，1.3 第 5、6 条）
      SG.startShape(ev, gwb, gwb.dataset.wsid, 'tr', [SG.tgt(pe.id, gh.dataset.kx || 'x', gh.dataset.ky || 'y')], { align: SG.buildAlign(UI.S.scene.entities[gwb.dataset.wsid], [SG.gptPt(pe.id)], [], [pe.id], null), pt: SG.roleOf(pe) === 'point' ? pe.id : null });
      if (pk) SG.render();   // 选中状态变了，重画（拖动数据已经记下来了）
      return;
    }
    if (pk) {
      // 整个图形可以直接拖：自由点围成的图形整体平移（每个顶点各改一次 x、y，记成一步）；摆放出来的图形改 dx、dy
      const pwb = pk.closest('.wsbody'), fi = pwb && !ev.shiftKey ? SG.figByName(pwb.dataset.wsid, pk.dataset.pick) : null;
      if (fi && (fi.kind === 'pts' || fi.kind === 'place')) { ev.preventDefault(); ev.stopPropagation(); if (!SG.groupDrag(ev, pwb, pwb.dataset.wsid, fi)) SG.startShape(ev, pwb, pwb.dataset.wsid, 'tr', SG.moveTargets(fi), { align: SG.alignOfFig(pwb.dataset.wsid, fi) }); }
      SG.render(); return;
    }
    // 工作区的画布：点空白处取消选中，不移动工作区，也不平移台面
    // 工作区空白处拖动：平移这个工作区的坐标范围（不平移台面）；没有拖动就只是取消选中
    const wb = t.closest('.wsbody');
    if (wb) {
      const wid = wb.dataset.wsid, ws = S.scene.entities[wid], cw = +wb.getAttribute('width'), ch = +wb.getAttribute('height');
      if ((S.wsSel || []).length) { S.wsSel = []; SG.render(); }
      if (ws) { const v0 = SG.wsView(ws, cw, ch); SG.drag = { kind: 'wspan', id: wid, sc: UI.Space.canvasOf(wb.getBoundingClientRect(), v0.span), sx: ev.clientX, sy: ev.clientY, moved: false, v0 }; }
      return;
    }
    const outp = t.closest('.port.out');
    if (outp) {
      ev.preventDefault();
      SG.linking = { from: outp.dataset.id, fromPort: outp.dataset.port, cur: UI.Space.screenToStage(ev) };
      SG.stageEl.setPointerCapture && 0; SG.render(); return;
    }
    const ub = t.closest('[data-unlink]');
    if (ub) { S.selLink = null; UI.Intent.run('unlink', { id: ub.dataset.unlink }); return; }
    if (t.closest('[data-why]')) return;
    const lb = t.closest('[data-link]');
    if (lb) { S.selLink = lb.dataset.link; S.sel = null; UI.Panels.renderInsp(); SG.render(); return; }
    const card = t.closest('.card');
    if (card) {
      const id = card.dataset.id; if (t.closest('.port')) return;
      const e = S.scene.entities[id];
      if (SG.isWsDef(e.type)) {
        // 工作区：双击标题是专注模式（不开属性面板）
        if (t.closest('.hd') && SG.dbl('hd:' + id)) { SG.setFocus(id); return; }
      } else {
        const now = Date.now();
        if (SG.lastClick.id === id && now - SG.lastClick.t < 400) { S.inspOpen = true; SG.lastClick = { id: null, t: 0 }; } else SG.lastClick = { id, t: now };
      }
      S.sel = id; S.selLink = null;
      const w = UI.Space.screenToStage(ev);
      SG.drag = { kind: 'move', id, dx: w.x - e.x, dy: w.y - e.y, moved: false, sx: ev.clientX, sy: ev.clientY };
      UI.Panels.renderInsp(); SG.render(); return;
    }
    if (t.closest('.pill')) return;
    S.sel = null; S.selLink = null; UI.Panels.renderInsp();
    SG.drag = { kind: 'pan', sx: ev.clientX, sy: ev.clientY, vx: S.view.x, vy: S.view.y };
    SG.stageEl.classList.add('panning'); SG.render();
  }
  function onMove(ev) {
    const S = UI.S;
    if (ev.pointerType === 'touch' && SG.touchMove(ev)) return;   // 双指缩放中（V8）
    if (SG.linking) {
      SG.linking.cur = UI.Space.screenToStage(ev);
      document.querySelectorAll('.port.ok,.port.no,.pill.ok,.pill.no').forEach((n) => n.classList.remove('ok', 'no'));
      const h = SG.hoverTarget(ev);
      if (h && h.id !== SG.linking.from || (h && h.port)) {
        const r = W.dryLink(S.scene, { from: SG.linking.from, fromPort: SG.linking.fromPort, to: h.id, toPort: h.port || undefined });
        if (h.el.classList.contains('port') || h.el.classList.contains('pill')) h.el.classList.add(r.ok ? 'ok' : 'no');
        showTip(ev.clientX, ev.clientY, r.ok ? '松手连上' : r.why, r.ok);
      } else showTip(0, 0, '');
      // 只重画拖线那一条，避免整块重绘打断悬停状态
      const lp = SG.worldEl.querySelector('#links path[stroke-dasharray]');
      const F = S.scene.entities[SG.linking.from], a = SG.portPos(F, SG.linking.fromPort, S.D, true);
      if (lp) lp.setAttribute('d', SG.bez(a, SG.linking.cur)); else { const sv = SG.worldEl.querySelector('#links'); sv.insertAdjacentHTML('beforeend', '<path data-prev="1" class="ln" style="stroke:var(--flow)" stroke-dasharray="6 6" fill="none" d="' + SG.bez(a, SG.linking.cur) + '"/>'); }
      return;
    }
    const hw = ev.target.closest && ev.target.closest('.wsbody'); if (hw) SG.hotWs = hw.dataset.wsid;   // 快捷键作用在鼠标最后停过的工作区
    // Shift 按下后拖过一小段：变成画线（起点是按下的位置）
    if (SG.shiftLine) {
      const sl = SG.shiftLine;
      if (Math.hypot(ev.clientX - sl.x, ev.clientY - sl.y) >= SG.DRAG_LINE_PX) {
        SG.shiftLine = null;
        if (SG.lineDragStart(sl.wb, { clientX: sl.x, clientY: sl.y }, 'seg')) SG.drawHover(ev);
      }
      return;
    }
    if (S.wsDraw && S.wsDraw.pend) SG.drawHover(ev);
    if (!SG.drag) return;
    if (SG.drag.kind === 'mark' || SG.drag.kind === 'markbody') { SG.markMove(ev); return; }
    if (SG.drag.kind === 'piece') { SG.pieceMove(ev); return; }
    if (SG.drag.kind === 'shape') { SG.shapeMove(ev); return; }
    if (SG.drag.kind === 'rz') {
      const dx = ev.clientX - SG.drag.sx, dy = ev.clientY - SG.drag.sy;
      if (!SG.drag.moved && Math.hypot(dx, dy) < 3) return;
      if (!SG.drag.moved) { SG.drag.moved = true; SG.drag.before = UI.App.snapshot(); }
      const w = Math.max(MIN_W, Math.round(SG.drag.w0 + UI.Space.stageDelta(dx, SG.drag.zoom))), h = Math.max(MIN_H, Math.round(SG.drag.h0 + UI.Space.stageDelta(dy, SG.drag.zoom)));
      SG.drag.w1 = w; SG.drag.h1 = h;
      UI.Intent.preview('resize', { id: SG.drag.id, w, h }); SG.render();
      showTip(ev.clientX, ev.clientY, w + ' × ' + h, true);
      return;
    }
    if (SG.drag.kind === 'wspan') {
      const dx = ev.clientX - SG.drag.sx, dy = ev.clientY - SG.drag.sy;
      if (!SG.drag.moved && Math.hypot(dx, dy) < 4) return;
      SG.drag.moved = true;
      UI.State.setUi(S.scene.entities[SG.drag.id], 'view', { cx: SG.drag.v0.cx - UI.Space.pxToUnits(dx, SG.drag.sc.unit), cy: SG.drag.v0.cy + UI.Space.pxToUnits(dy, SG.drag.sc.unit), span: SG.drag.v0.span });
      SG.render(); return;
    }
    if (SG.drag.kind === 'pan') { S.view.x = SG.drag.vx + ev.clientX - SG.drag.sx; S.view.y = SG.drag.vy + ev.clientY - SG.drag.sy; SG.render(); return; }
    if (SG.drag.kind === 'move') {
      if (!SG.drag.moved && Math.hypot(ev.clientX - SG.drag.sx, ev.clientY - SG.drag.sy) < L.DRAG_SLOP) return;
      const w = UI.Space.screenToStage(ev);
      if (!SG.drag.moved) { SG.drag.moved = true; SG.drag.before = UI.App.snapshot(); }
      SG.drag.x1 = w.x - SG.drag.dx; SG.drag.y1 = w.y - SG.drag.dy;
      // 卡片靠近工作区里的顶点、线段中点时吸过去（V4 剩余，1.3），松手按吸到的位置放
      const sn = SG.cardSnap(ev, SG.drag.id, SG.drag.x1, SG.drag.y1);
      if (sn) { SG.drag.x1 = sn.x; SG.drag.y1 = sn.y; showTip(ev.clientX, ev.clientY, '吸附到 ' + sn.label, true); } else showTip(0, 0, '');
      UI.Intent.preview('move', { id: SG.drag.id, x: SG.drag.x1, y: SG.drag.y1 }); SG.render();
      // 拖到容器上时，给容器加虚线框提示“松手放进去”
      const hov = SG.cardUnder(ev, SG.drag.id, SG.isContainer);
      document.querySelectorAll('.card.droptarget').forEach((c) => c.classList.remove('droptarget'));
      if (hov) { const c = SG.worldEl.querySelector('.card[data-id="' + hov.id + '"]'); if (c) c.classList.add('droptarget'); }
    }
  }

  function onUp(ev) {
    const S = UI.S;
    if (ev.pointerType === 'touch' && SG.touchEnd(ev)) return;   // 双指缩放中抬起的手指（V8）
    if (SG.shiftLine) {   // Shift 按下后没拖：就是 Shift 点选（加选 / 去掉）
      const sl = SG.shiftLine; SG.shiftLine = null;
      if (sl.pick) SG.wsPick(sl.pick, true);
      SG.render(); return;
    }
    if (S.wsDraw && S.wsDraw.pend && SG.lineDragEnd(ev)) return;
    if (SG.linking) {
      const h = SG.hoverTarget(ev), L = SG.linking; SG.linking = null; showTip(0, 0, '');
      if (h && (h.id !== L.from || h.port)) UI.Intent.run('link', { from: L.from, fromPort: L.fromPort, to: h.id, toPort: h.port || undefined }); else SG.render();
      SG.render(); return;
    }
    if (SG.drag) {
      const d = SG.drag; SG.drag = null; SG.stageEl.classList.remove('panning');
      if (d.moved) SG.dblKey = null;   // 拖动过的不算点击：下一次按不能被当成双击
      document.querySelectorAll('.card.droptarget').forEach((c) => c.classList.remove('droptarget'));
      if (d.kind === 'mark' || d.kind === 'markbody') { SG.markUp(d); SG.render(); return; }
      if (d.kind === 'piece') { SG.pieceUp(d, ev); return; }
      if (d.kind === 'shape') { SG.shapeUp(d, ev); return; }
      if (d.kind === 'rz') {
        showTip(0, 0, '');
        if (d.moved) UI.Intent.run('resize', { id: d.id, w: d.w1, h: d.h1, before: d.before });
        UI.Panels.renderInsp(); SG.render(); if (d.moved) UI.App.afterMove(); return;
      }
      // 移动（和松手放进容器）是一个事务：一次拖动只一个撤销项
      if (d.kind === 'move' && d.moved) {
        UI.Intent.run('move', { id: d.id, x: d.x1, y: d.y1, ev, before: d.before });
        UI.App.afterMove();
      }
    }
  }
  Object.assign(SG, { startResize, tip, showTip, WS_DBL_PX, wsCycPick, onDown, onMove, onUp });
})(window);
