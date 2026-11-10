/* 台面（§10.5.9 第 6 条）：尺子、量角器（标记）和标注。标记和标注存在台面上（scene.marks、scene.notes，见 js/core/measure.js），
 * 不是图形，也不改图形。这里只画和接鼠标；每次放、拖、删、标注都走 UI.Intent.run（动作只在 js/ui/intent.js 里）。
 * 拖动把手时用 SG.drag（kind 'mark'）预览，松手才提交一次（一个撤销项）。加载顺序见 index.html；跨文件的名字经 UI.StageCtx（SG）访问。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), Q = U.Q, K = U.kit;
  const SG = UI.StageCtx, L = UI.LAYOUT, M = L.MARK, RO = L.READOUT;
  const RULER_COL = '#b45309', PROT_COL = '#7c3aed', RO_COL = '#1e293b';   // 颜色和读数一样用字面值（标签的 fill 属性）
  const PRIO = 6;      // 标记的读数和标注的优先级：排在图形的读数（5）后面摆位
  const EPS = 1e-9;    // 长度为零的判断（浮点）

  const pickOfMark = (m) => 'mk:' + m.id;   // 选中名：和图形的名字一样放进 S.wsSel
  const marksOf = (ws) => (UI.S.scene.marks || []).filter((m) => m.ws === ws.id);
  const notesOf = (ws) => (UI.S.scene.notes || []).filter((n) => n.ws === ws.id);
  // 拖动中的把手用拖动的位置（松手才写台面）
  function ptsOf(m) {
    const d = SG.drag;
    if (!d || d.id !== m.id) return m.pts;
    if (d.kind === 'markbody') return m.pts.map((p) => ({ x: p.x + d.dx, y: p.y + d.dy }));
    if (d.kind === 'mark') return m.pts.map((p, k) => (k === d.i ? { x: d.x1, y: d.y1 } : p));
    return m.pts;
  }
  // 吸附的候选：工作区里所有可见图形的顶点（工作区坐标，浮点）
  function snapCands(fr) {
    const out = [];
    for (const v of fr.vals) if (v.fig && v.fig.pts) for (const p of v.fig.pts) out.push({ x: Q.num(p.x), y: Q.num(p.y) });
    return out;
  }
  const isInt = (p) => Number.isInteger(p.x) && Number.isInteger(p.y);
  const exactPt = (p) => ({ x: Q(p.x), y: Q(p.y) });
  // 尺子的读数：整数坐标是精确的（√ 形式），否则写近似值
  function rulerText(A, B) {
    if (isInt(A) && isInt(B)) return '长 ' + SG.lenText(exactPt(A), exactPt(B));
    return '长 ≈' + Math.hypot(B.x - A.x, B.y - A.y).toFixed(2);
  }
  // 量角器的角（度）：顶点 v 两边的夹角；有一条边长为零就是 null。结果取到 1e-9 度的精度，好让特殊角被认出来（angText）
  function angleOf(v, a, c) {
    const ax = a.x - v.x, ay = a.y - v.y, cx = c.x - v.x, cy = c.y - v.y;
    const la = Math.hypot(ax, ay), lc = Math.hypot(cx, cy);
    if (la < EPS || lc < EPS) return null;
    const cos = Math.max(-1, Math.min(1, (ax * cx + ay * cy) / (la * lc)));
    return Math.round(Math.acos(cos) * 180 / Math.PI * 1e9) / 1e9;
  }
  // 画布上从顶点 v 指向 p 的单位方向；两点重合就是 null
  function unitOf(v, p) {
    const dx = p.x - v.x, dy = p.y - v.y, d = Math.hypot(dx, dy);
    return d < EPS ? null : { x: dx / d, y: dy / d };
  }
  // 一条线（画布坐标）：attrs 是多出来的属性字符串
  const lineSvg = (p, q, attrs) => '<line x1="' + p.x.toFixed(1) + '" y1="' + p.y.toFixed(1) + '" x2="' + q.x.toFixed(1) + '" y2="' + q.y.toFixed(1) + '"' + attrs + '/>';
  // 文字中心在 (x, y) 沿 (u) 方向退开 ds 像素的候选位置（和读数一样，基线下移 RO.base）
  function around(x, y, u, text, ds) {
    const tw = SG.TXT_W(text);
    return ds.map((d) => [x + u.x * d - tw / 2, y + u.y * d + RO.base]);
  }
  // 标注的候选位置：锚点的四个角外面，再加下面一行
  function anchorCands(ax, ay, text) {
    const tw = SG.TXT_W(text);
    return [[ax + RO.corner, ay - RO.near], [ax + RO.corner, ay + RO.far], [ax - tw - RO.corner, ay - RO.near], [ax - tw - RO.corner, ay + RO.far], [ax - tw / 2, ay + RO.far + RO.corner]];
  }

  // 尺子：两条线（一条可以拖、一条加宽的透明命中线）、每个单位一个刻度（不太密时才画）、读数贴在中点旁边
  function rulerSvg(m, pts, P, col, on, fr, labs) {
    const [a, b] = P, pk = ' data-pick="' + pickOfMark(m) + '"', A = pts[0], B = pts[1];
    let g = lineSvg(a, b, ' stroke="' + col + '" stroke-width="' + (on ? M.RULER_W_ON : M.RULER_W) + '" stroke-opacity=".85" pointer-events="none"');
    g += lineSvg(a, b, ' stroke="transparent" stroke-width="14"' + pk + ' data-pri="1" style="cursor:move"');
    const lw = Math.hypot(B.x - A.x, B.y - A.y), sl = Math.hypot(b.x - a.x, b.y - a.y);   // lw：工作区里的长度；sl：画布上的长度
    const nx = sl > 0 ? -(b.y - a.y) / sl : 0, ny = sl > 0 ? (b.x - a.x) / sl : 1;      // 画布上朝外的法线（读数放在这一边）
    if (lw > 0 && sl > 0 && lw <= M.TICK_MAX && fr.s >= M.TICK_PX) {
      for (let k = 0; k <= Math.floor(lw); k++) {
        const t = k / lw, px = a.x + (b.x - a.x) * t, py = a.y + (b.y - a.y) * t;
        g += lineSvg({ x: px, y: py }, { x: px + nx * M.TICK_LEN, y: py + ny * M.TICK_LEN }, ' stroke="' + col + '" stroke-width="1.5" pointer-events="none"');
      }
    }
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, text = rulerText(A, B);
    labs.push({ text, c: RO_COL, cands: around(mid.x, mid.y, { x: nx, y: ny }, text, [RO.near, RO.far, -RO.near]), prio: PRIO, ro: 'ruler' });
    return g;
  }

  // 量角器：两条边（可以拖）、顶点到两边端点之间的弧、角度读数贴在弧的外面（角平分线方向）
  function protSvg(m, pts, P, col, on, labs) {
    const [p0, v, p2] = P, pk = ' data-pick="' + pickOfMark(m) + '"', w = on ? M.RULER_W_ON : M.RULER_W;
    let g = lineSvg(v, p0, ' stroke="' + col + '" stroke-width="' + w + '" pointer-events="none"') + lineSvg(v, p2, ' stroke="' + col + '" stroke-width="' + w + '" pointer-events="none"');
    g += lineSvg(v, p0, ' stroke="transparent" stroke-width="14"' + pk + ' data-pri="1" style="cursor:move"') + lineSvg(v, p2, ' stroke="transparent" stroke-width="14"' + pk + ' data-pri="1" style="cursor:move"');
    const angle = angleOf(pts[1], pts[0], pts[2]), ua = unitOf(v, p0), uc = unitOf(v, p2);
    if (angle === null || !ua || !uc) {
      labs.push({ text: '角不存在', c: RO_COL, cands: anchorCands(v.x, v.y, '角不存在'), prio: PRIO, ro: 'protractor' });
      return g;
    }
    const R = Math.min(M.ARC_R, 0.4 * Math.min(Math.hypot(p0.x - v.x, p0.y - v.y), Math.hypot(p2.x - v.x, p2.y - v.y)));
    const s0 = { x: v.x + ua.x * R, y: v.y + ua.y * R }, s1 = { x: v.x + uc.x * R, y: v.y + uc.y * R };
    // 画小的那一段弧（不超过半圆）
    const sweep = ua.x * uc.y - ua.y * uc.x > 0 ? 1 : 0;
    g += '<path d="M' + s0.x.toFixed(1) + ' ' + s0.y.toFixed(1) + ' A' + R.toFixed(1) + ' ' + R.toFixed(1) + ' 0 0 ' + sweep + ' ' + s1.x.toFixed(1) + ' ' + s1.y.toFixed(1) + '" fill="none" stroke="' + col + '" stroke-width="1.5" pointer-events="none"/>';
    const sx = ua.x + uc.x, sy = ua.y + uc.y, bl = Math.hypot(sx, sy);
    const bis = bl < EPS ? { x: -ua.y, y: ua.x } : { x: sx / bl, y: sy / bl };   // 角平分线方向（两边反向时取垂直的方向）
    const text = '∠ ' + SG.angText(angle);
    labs.push({ text, c: RO_COL, cands: around(v.x, v.y, bis, text, [R + RO.near, R + RO.far, -(R + RO.near)]), prio: PRIO, ro: 'protractor' });
    return g;
  }

  // 画布上的标记（把手在最上面）和标注。读数、标注进 labs，由 placeLabels 摆位（不叠、不出画布）
  function marksSvg(ws, fr, labs) {
    let g = '';
    const sel = (UI.S.wsSel || []).length === 1 ? UI.S.wsSel[0] : null;
    for (const m of marksOf(ws)) {
      const pts = ptsOf(m), P = pts.map((p) => ({ x: fr.X(p.x), y: fr.Y(p.y) })), on = sel === pickOfMark(m);
      const col = m.kind === 'ruler' ? RULER_COL : PROT_COL;
      g += m.kind === 'ruler' ? rulerSvg(m, pts, P, col, on, fr, labs) : protSvg(m, pts, P, col, on, labs);
      P.forEach((q, i) => { g += '<circle data-mhdl="1" data-mark="' + m.id + '" data-mi="' + i + '" cx="' + q.x.toFixed(1) + '" cy="' + q.y.toFixed(1) + '" r="' + M.HDL + '" fill="#fff" stroke="' + col + '" stroke-width="2.5" style="cursor:grab"/>'; });
    }
    for (const n of notesOf(ws)) {
      const at = anchorOf(ws, n, fr);
      if (at) labs.push({ text: n.text, c: RO_COL, cands: anchorCands(at.x, at.y, n.text), prio: PRIO, ro: 'note' });
    }
    return g;
  }
  // 标注的锚点（画布坐标）：线段的中点，或量角器的顶点。找不到（图形不在范围里、已删）就是 null
  function anchorOf(ws, n, fr) {
    const m = marksOf(ws).find((x) => x.id === n.ref);
    if (m) { const v = ptsOf(m)[1]; return { x: fr.X(v.x), y: fr.Y(v.y) }; }
    const seg = fr.vals.find((v) => v.id === n.ref && v.fig && v.fig.type === 'segment');
    if (!seg) return null;
    const a = seg.fig.pts[0], b = seg.fig.pts[1];
    return { x: fr.X((Q.num(a.x) + Q.num(b.x)) / 2), y: fr.Y((Q.num(a.y) + Q.num(b.y)) / 2) };
  }

  // 选中一把尺子或量角器时，它旁边的浮动工具条（卡片里的位置）：没有就是 null
  function markFloat(ws, name, fr, h) {
    if (!name || name.indexOf('mk:') !== 0) return null;
    const m = marksOf(ws).find((x) => pickOfMark(x) === name); if (!m) return null;
    const P = ptsOf(m).map((p) => ({ x: fr.X(p.x), y: fr.Y(p.y) }));
    const xs = P.map((q) => q.x), ys = P.map((q) => q.y);
    const top = Math.min(Math.max(...ys) + L.FLOAT.dy, h - M.NOTE_H);
    return { name, left: (Math.min(...xs) + Math.max(...xs)) / 2, top, mark: m.id, angle: m.kind === 'protractor', ref: m.kind === 'protractor' ? m.id : null };
  }
  // 浮动工具条里和标记、标注有关的部分：删除（标记），标注的输入框、加标注按钮、已有的标注（能删）
  function floatExtra(wsId, f) {
    const del = f.mark ? '<button data-mark-del="' + f.mark + '" data-ws="' + wsId + '">' + (f.angle ? '删除量角器' : '删除尺子') + '</button>' : '';
    if (!f.ref) return del ? '<div class="wsx-note">' + del + '</div>' : '';
    const list = (UI.S.scene.notes || []).filter((n) => n.ws === wsId && n.ref === f.ref)
      .map((n) => '<span class="wsx-note-one">' + K.esc(n.text) + ' <button data-note-del="' + n.id + '" aria-label="删除这条标注" title="删除这条标注">×</button></span>').join('');
    return '<div class="wsx-note">' + del + '<input data-note-in="1" maxlength="' + U.Measure.NOTE_MAX + '" placeholder="写一句说明" aria-label="标注的文字">' +
      '<button data-note-add="1" data-ws="' + wsId + '" data-ref="' + f.ref + '">加标注</button>' + list + '</div>';
  }
  // 这个选中名是不是还在台面上的标记（render 修剪选中项时用）
  const markExists = (n) => String(n).indexOf('mk:') === 0 && (UI.S.scene.marks || []).some((m) => pickOfMark(m) === n);
  // 标记的名字（选中提示、选中列表里用）
  function markName(name) {
    const m = (UI.S.scene.marks || []).find((x) => pickOfMark(x) === name);
    return m ? (m.kind === 'ruler' ? '尺子' : '量角器') : '标记';
  }

  // 工作区的工具行里放尺子、量角器两个按钮（stage-panel.js 调用）
  function measureBtns(wsId) {
    return '<button data-ws-tool="ruler" data-ws="' + wsId + '" title="放一把尺子：两端拖到点上，就量出它们的距离（按住尺子本身可以整把挪动）">尺子</button>' +
      '<button data-ws-tool="protractor" data-ws="' + wsId + '" title="放一个量角器：顶点和两条边的端点拖到点上，就量出角度；点它的边可以写标注">量角器</button>';
  }
  // 放一把尺子或一个量角器：默认放在工作区中心附近（整数坐标，直角的量角器）。一步
  function addMark(wsId, kind) {
    const S = UI.S, ws = S.scene.entities[wsId]; if (!ws) return;
    const g = SG.geom(ws), vw = SG.wsFrame(ws, g.w, g.h - L.HD).vw;
    const cx = vw.cx, cy = vw.cy, sp = vw.span, k = sp * M.DEF_FRAC, r = (v) => Math.round(v);
    const pts = kind === 'ruler'
      ? [{ x: r(cx - k), y: r(cy) }, { x: r(cx + k), y: r(cy) }]
      : [{ x: r(cx + k), y: r(cy) }, { x: r(cx), y: r(cy) }, { x: r(cx), y: r(cy + k) }];
    const res = UI.Intent.run('mark', { op: 'add', ws: wsId, kind, pts });
    if (!(res && res.ok)) SG.setMsg((res && res.why) || '放不下', false);
    SG.render();
  }

  // ---- 拖动把手（SG.drag.kind === 'mark'）----
  // 吸附：离鼠标最近的顶点（在 SNAP_PX 像素以内），否则四舍五入到整数坐标（精确的读数）
  function snapTo(d, x, y) {
    const r = M.SNAP_PX / d.px;
    let best = null, bd = r;
    for (const q of d.cands) { const dd = Math.hypot(q.x - x, q.y - y); if (dd <= bd) { best = q; bd = dd; } }
    if (best) return { x: best.x, y: best.y, snapped: true };
    return { x: Math.round(x) + 0, y: Math.round(y) + 0, snapped: false };
  }
  function markDown(el, ev) {
    const S = UI.S, wb = el.closest('.wsbody'), wsId = wb && wb.dataset.wsid, ws = wsId && S.scene.entities[wsId];
    const m = (S.scene.marks || []).find((x) => x.id === el.dataset.mark);
    if (!ws || !m) return;
    const i = +el.dataset.mi, fr = SG.wsFrame(ws, +wb.getAttribute('width'), +wb.getAttribute('height'));
    S.wsSel = [pickOfMark(m)];
    SG.drag = { kind: 'mark', id: m.id, i, wsId, vw: fr.vw, sc: UI.Space.canvasOf(wb.getBoundingClientRect(), fr.vw.span), px: fr.s, cands: snapCands(fr), sx: ev.clientX, sy: ev.clientY, x1: m.pts[i].x, y1: m.pts[i].y, moved: false };
    SG.render();
  }
  // 按住尺子或量角器本身（不是把手）拖：整把挪动。挪的距离取整数，坐标还是精确的
  function markBody(el, ev) {
    const S = UI.S, wb = el.closest('.wsbody'), wsId = wb && wb.dataset.wsid, ws = wsId && S.scene.entities[wsId];
    const m = (S.scene.marks || []).find((x) => pickOfMark(x) === el.dataset.pick);
    if (!ws || !m) return false;
    const fr = SG.wsFrame(ws, +wb.getAttribute('width'), +wb.getAttribute('height')), sc = UI.Space.canvasOf(wb.getBoundingClientRect(), fr.vw.span);
    const st = UI.Space.screenToWorkspace(ev, fr.vw, sc);
    S.wsSel = [pickOfMark(m)];
    SG.drag = { kind: 'markbody', id: m.id, wsId, vw: fr.vw, sc, px: fr.s, sx: ev.clientX, sy: ev.clientY, sx0: st.x, sy0: st.y, dx: 0, dy: 0, moved: false };
    return true;
  }
  function markMove(ev) {
    const d = SG.drag;
    if (!d.moved && Math.hypot(ev.clientX - d.sx, ev.clientY - d.sy) < L.DRAG_SLOP) return;
    d.moved = true;
    if (d.kind === 'markbody') {
      const w = UI.Space.screenToWorkspace(ev, d.vw, d.sc);
      d.dx = Math.round(w.x - d.sx0) + 0; d.dy = Math.round(w.y - d.sy0) + 0;
      SG.showTip(ev.clientX, ev.clientY, '挪动 ' + d.dx + ', ' + d.dy, true);
      SG.render();
      return;
    }
    const w = UI.Space.screenToWorkspace(ev, d.vw, d.sc), s = snapTo(d, w.x, w.y);
    d.x1 = s.x; d.y1 = s.y;
    SG.showTip(ev.clientX, ev.clientY, '坐标 ' + s.x + ', ' + s.y + (s.snapped ? '（吸附）' : ''), true);
    SG.render();
  }
  // 松手：把手挪到新位置，一步（没动就什么都不做）
  function markUp(d) {
    SG.showTip(0, 0, '');
    if (!d.moved) return;
    if (d.kind === 'markbody') {
      if (d.dx || d.dy) UI.Intent.run('mark', { op: 'shift', id: d.id, dx: d.dx, dy: d.dy });
      return;
    }
    const m = (UI.S.scene.marks || []).find((x) => x.id === d.id);
    if (!m || (m.pts[d.i].x === d.x1 && m.pts[d.i].y === d.y1)) return;
    UI.Intent.run('mark', { op: 'move', id: d.id, i: d.i, x: d.x1, y: d.y1 });
  }

  // ---- 标注、删除（按钮）----
  function noteAdd(btn) {
    const box = btn.closest('.wsx-note'), inp = box && box.querySelector('[data-note-in]');
    const r = UI.Intent.run('note', { op: 'add', ws: btn.dataset.ws, ref: btn.dataset.ref, text: inp ? inp.value : '' });
    if (!(r && r.ok)) SG.setMsg((r && r.why) || '这一步做不了', false);
    SG.render();
  }
  function noteDel(id) { UI.Intent.run('note', { op: 'del', id }); SG.render(); }
  function markDel(id) { UI.S.wsSel = []; UI.Intent.run('mark', { op: 'del', id }); SG.render(); }

  Object.assign(SG, { marksSvg, markFloat, floatExtra, markName, markExists, measureBtns, addMark, markDown, markBody, markMove, markUp, noteAdd, noteDel, markDel });
})(window);
