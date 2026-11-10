/* 台面（D4 拆分）：工作区画布：画图形、标签、把手、参考线、消息、画线预览。由 stage.js 拆出，只搬代码、不改逻辑；跨文件的名字经 UI.StageCtx（SG）访问。加载顺序见 index.html。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), W = U.World, K = U.kit, Q = U.Q;
  const $ = (s) => document.querySelector(s);
  const L = UI.LAYOUT, HD = L.HD, PORT_Y0 = L.PORT_Y0, PORT_DY = L.PORT_DY, PILL_DY = L.PILL_DY, PILL_W = L.PILL_W, MIN_W = L.MIN_W, MIN_H = L.MIN_H;
  const SG = UI.StageCtx;
  // 工作区的画布：把所有显示的值画在一起，按工作区的坐标范围画（范围定下来以后，卡片变大图也跟着变大）
  // 标签（V6，2.3）：标签的矩形不能和别的标签叠，也不能压住障碍（线、顶点圆圈、点、圆的线，见 figObs）。
  // 先按候选位置挑第一个“在画布里、不叠、不压住障碍”的；候选都不行，就在画布里按格子找；实在没有，夹到画布里（这时才可能叠，但不会比候选更差）。
  function placeLabels(labs, w, h, obs) {
    const M = 3, LB = L.LABEL, placed = [], blockers = obs || [];
    const box = (x, y, t) => ({ x0: x, x1: x + SG.TXT_W(t), y0: y - LB.up, y1: y + LB.down });
    const inside = (b) => b.x0 >= M && b.x1 <= w - M && b.y0 >= M && b.y1 <= h - M;
    const hit = (b) => placed.some((p) => b.x0 < p.x1 && b.x1 > p.x0 && b.y0 < p.y1 && b.y1 > p.y0);
    const blocked = (b) => blockers.some((o) => boxHits(o, b, LB.pad));
    const free = (b) => inside(b) && !hit(b) && !blocked(b);
    const pick = (T) => {
      for (const [x, y] of T.cands) { const b = box(x, y, T.text); if (free(b)) return [x, y, b]; }
      // 找不到候选：在画布里按格子找，离第一个候选近的先试（标签留在它的图形旁边）
      const [x0, y0] = T.cands[0], b0 = box(x0, y0, T.text), grid = [];
      for (let y = LB.up + M; y <= h - LB.down - M; y += LB.grid) for (let x = M; x <= w - SG.TXT_W(T.text) - M; x += LB.grid) grid.push([x, y]);
      grid.sort((a, c) => Math.hypot(a[0] - x0, a[1] - y0) - Math.hypot(c[0] - x0, c[1] - y0));
      for (const [x, y] of grid) { const b = box(x, y, T.text); if (free(b)) return [x, y, b]; }
      const dx = Math.max(M - b0.x0, Math.min(0, w - M - b0.x1)), dy = Math.max(M - b0.y0, Math.min(0, h - M - b0.y1));
      return [x0 + dx, y0 + dy, box(x0 + dx, y0 + dy, T.text)];
    };
    let svg = '';
    for (const T of labs.slice().sort((a, b) => a.prio - b.prio)) {
      const [x, y, b] = pick(T); placed.push(b);
      svg += '<text' + (T.ren ? ' data-ren="' + T.ren + '" style="cursor:text"' : '') + ' x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" font-size="12" font-weight="700" fill="' + T.c + '" stroke="#f4f6fb" stroke-width="3" paint-order="stroke" stroke-linejoin="round" font-family="var(--font)">' + K.esc(T.text) + '</text>';
    }
    return svg;
  }
  // 标签的障碍（2.3）：图形的线、多边形的边、顶点圆圈、点、圆的线。画布坐标（像素）。
  //   seg：线段；disc：实心的圆（点、顶点）；ring：只有圆周（圆）
  function figObs(f, X, Y, s, obs) {
    if (!f.pts || !f.pts.length) return;
    const P = (q) => [X(Q.num(q.x)), Y(Q.num(q.y))];
    if (f.type === 'circle') { const c = P(f.pts[0]); obs.push({ k: 'ring', x: c[0], y: c[1], r: Math.sqrt(Q.num(f.r2)) * s }); return; }
    if (f.type === 'point') { const c = P(f.pts[0]); obs.push({ k: 'disc', x: c[0], y: c[1], r: L.LABEL.dot }); return; }
    const n = f.pts.length;
    f.pts.forEach((q) => { const c = P(q); obs.push({ k: 'disc', x: c[0], y: c[1], r: L.LABEL.vertex }); });
    for (let k = 0; k < (f.type === 'polygon' ? n : n - 1); k++) { const a = P(f.pts[k]), c = P(f.pts[(k + 1) % n]); obs.push({ k: 'seg', x1: a[0], y1: a[1], x2: c[0], y2: c[1] }); }
  }
  // 标签的矩形 b 和障碍 o 是否相交（m 是留的空隙）：线段用 Liang–Barsky 裁剪，圆用最近点、最远角的距离
  function boxHits(o, b, m) {
    if (o.k === 'seg') {
      let t0 = 0, t1 = 1; const dx = o.x2 - o.x1, dy = o.y2 - o.y1, bx0 = b.x0 - m, bx1 = b.x1 + m, by0 = b.y0 - m, by1 = b.y1 + m;
      const pp = [-dx, dx, -dy, dy], qq = [o.x1 - bx0, bx1 - o.x1, o.y1 - by0, by1 - o.y1];
      for (let i = 0; i < 4; i++) {
        if (pp[i] === 0) { if (qq[i] < 0) return false; continue; }
        const r = qq[i] / pp[i];
        if (pp[i] < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; }
      }
      return true;
    }
    const nx = Math.max(b.x0, Math.min(o.x, b.x1)), ny = Math.max(b.y0, Math.min(o.y, b.y1));   // 矩形上离圆心最近的点
    const near = Math.hypot(nx - o.x, ny - o.y);
    if (o.k === 'disc') return near <= o.r + m;
    const far = Math.hypot(Math.max(Math.abs(o.x - b.x0), Math.abs(o.x - b.x1)), Math.max(Math.abs(o.y - b.y0), Math.abs(o.y - b.y1)));   // 离圆心最远的角
    return near <= o.r + m && far >= o.r - m;
  }
  // 整个在坐标范围外面的图形：在画布边缘画一个箭头和名字，点一下就把范围调到它（wsFit）
  function offArrows(fr, ws) {
    const { vw, w, h, X, Y, vals } = fr, { hw, hh } = UI.Space.halfRange(w, h, vw), M = 6, out = [];
    vals.forEach((v, i) => {
      const bx = SG.figBox(v.fig); if (!bx) return;
      if (bx.x1 >= vw.cx - hw && bx.x0 <= vw.cx + hw && bx.y1 >= vw.cy - hh && bx.y0 <= vw.cy + hh) return;
      const dx = X((bx.x0 + bx.x1) / 2) - w / 2, dy = Y((bx.y0 + bx.y1) / 2) - h / 2;
      if (!dx && !dy) return;
      const t = Math.min(dx ? (w / 2 - M - 14) / Math.abs(dx) : Infinity, dy ? (h / 2 - M - 14) / Math.abs(dy) : Infinity);
      const ax = w / 2 + dx * t, ay = h / 2 + dy * t, ang = Math.atan2(dy, dx) * 180 / Math.PI, c = SG.WS_COL[i % SG.WS_COL.length];
      const tw = SG.TXT_W(v.label), tx = Math.max(M, Math.min(w - M - tw, ax - tw / 2)), ty = ay < h / 2 ? Math.min(h - M, ay + 26) : Math.max(M + 11, ay - 18);
      out.push('<g data-fit-ws="' + ws.id + '" data-fit-key="' + SG.escA(v.key) + '" style="cursor:pointer">' +
        '<circle cx="' + ax.toFixed(1) + '" cy="' + ay.toFixed(1) + '" r="12" fill="#fff" stroke="' + c + '" stroke-width="2"/>' +
        '<path d="M-5 -4 L5 0 L-5 4 Z" fill="' + c + '" transform="translate(' + ax.toFixed(1) + ' ' + ay.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')"/>' +
        '<text x="' + tx.toFixed(1) + '" y="' + ty.toFixed(1) + '" font-size="12" font-weight="700" fill="' + c + '" stroke="#f4f6fb" stroke-width="3" paint-order="stroke" stroke-linejoin="round" font-family="var(--font)">' + K.esc(v.label) + '</text></g>');
    });
    return out.join('');
  }
  function wsBody(ws, w, h) {
    const S = UI.S, sel = new Set(S.wsSel || []), ents = S.scene.entities;
    const fr = SG.wsFrame(ws, w, h), vals = fr.vals;
    if (!fr.b) return K.text(w / 2, h / 2 - 6, '把图形拖到这里', { size: 15, weight: 700, fill: 'var(--dim)' }) + K.text(w / 2, h / 2 + 16, '从右边器材架拖，或拖台面上的图形卡片', { size: 12, fill: 'var(--dim)' }) + statusFor(ws, fr);   // 空的工作区也要显示当前工具状态（2.5）
    const { vw, s, X, Y } = fr;
    const labs = [], obs = [];   // 标签先收集，最后统一摆放（不叠、不压住线和圆、不出画布）；obs 是图形的障碍（2.3）
    const gsvg = guidesSvg(SG.drag && SG.drag.wsId === ws.id ? SG.drag.guides || [] : [], fr, labs);   // 拖动时的对齐参考线（C12–C14）
    const fitOn = fitState(ws);   // 拼合正确的块变绿（C16）
    let g = '', top = '', hit = '';   // top：自由点的把手，画在所有图形的上面（图形的填充不能盖住点）；hit：没有别的把手的线和多边形的边，加宽的透明命中线
    vals.forEach((v, i) => {
      const f = v.fig; if (!f) return;
      figObs(f, X, Y, s, obs);
      // 块（§10.5.10）：用块自己的颜色；可以拖（data-drag，松手时一次 piece 移动）
      const ent = ents[v.id], isPc = !!ent && SG.roleOf(ent) === 'piece' && v.port === 'f';
      const c = isPc ? (ent.props.color || SG.WS_COL[0]) : SG.WS_COL[i % SG.WS_COL.length], on = sel.has(SG.pickOf(v)), sw = on ? 4 : 2;
      const pk = " data-pick=\"" + SG.escA(SG.pickOf(v)) + "\"";
      const dg = isPc && !ent.props.locked ? ' data-drag="' + ent.id + '" data-s="' + s.toFixed(4) + '"' : '';
      const sty = isPc ? ' style="cursor:' + (ent.props.locked ? 'pointer' : 'grab') + '"' : " style=\"cursor:pointer\"";
      // 线和多边形的边：细线很难点中，所以（除了已经有把手的、块）再加一层加宽的透明线，点边就选中它
      const fi0 = SG.figInfo(v), wantHit = (f.type === 'polygon' || f.type === 'segment') && !(fi0 && (fi0.kind === 'pts' || fi0.kind === 'piece'));
      let lx, ly, cands = [], prio = 1;
      if (f.type === 'polygon') {
        const d = f.pts.map((p, k) => (k ? 'L' : 'M') + X(Q.num(p.x)).toFixed(1) + ' ' + Y(Q.num(p.y)).toFixed(1)).join(' ') + ' Z';
        const fit = isPc && !!fitOn && fitOn.ids.includes(ent.id);
        g += '<path d="' + d + '" fill="' + c + '22" stroke="' + (fit ? '#16a34a' : c) + '" stroke-width="' + sw + '"' + (fit && fitOn.flash ? ' class="wsflash"' : '') + pk + dg + sty + '/>';
        if (wantHit) hit += '<path d="' + d + '" fill="none" stroke="transparent" stroke-width="12"' + pk + ' style="cursor:pointer"/>';
        lx = f.pts.reduce((a, p) => a + X(Q.num(p.x)), 0) / f.pts.length; ly = f.pts.reduce((a, p) => a + Y(Q.num(p.y)), 0) / f.pts.length;
        const tw = SG.TXT_W(v.label); cands = [[lx - tw / 2, ly + 4], [lx - tw / 2, ly + 18], [lx - tw / 2, ly - 10], [lx - tw / 2, ly + 32]]; prio = 2;
      } else if (f.type === 'segment') {
        const a = f.pts[0], b = f.pts[1];
        g += '<line x1="' + X(Q.num(a.x)) + '" y1="' + Y(Q.num(a.y)) + '" x2="' + X(Q.num(b.x)) + '" y2="' + Y(Q.num(b.y)) + '" stroke="' + c + '" stroke-width="' + (on ? 5 : 2.5) + '"' + (f.dash ? ' stroke-dasharray="6 4"' : '') + ' stroke-linecap="round"' + pk + sty + '/>';
        if (wantHit) hit += '<line x1="' + X(Q.num(a.x)) + '" y1="' + Y(Q.num(a.y)) + '" x2="' + X(Q.num(b.x)) + '" y2="' + Y(Q.num(b.y)) + '" stroke="transparent" stroke-width="14"' + pk + ' style="cursor:pointer"/>';
        lx = (X(Q.num(a.x)) + X(Q.num(b.x))) / 2; ly = (Y(Q.num(a.y)) + Y(Q.num(b.y))) / 2;
        const tw = SG.TXT_W(v.label); cands = [[lx + 6, ly - 6], [lx + 6, ly + 14], [lx - tw - 6, ly - 6], [lx - tw - 6, ly + 14]];
      } else if (f.type === 'circle') {
        const cx = X(Q.num(f.pts[0].x)), cy = Y(Q.num(f.pts[0].y));
        g += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (Math.sqrt(Q.num(f.r2)) * s) + '" fill="none" stroke="' + c + '" stroke-width="' + sw + '"' + pk + sty + '/>';
        lx = cx; ly = cy;
        const rr = Math.sqrt(Q.num(f.r2)) * s, tw = SG.TXT_W(v.label), k = 0.71;
        cands = [[cx - tw / 2, cy + 4], [cx + rr * k + 3, cy - rr * k], [cx - rr * k - tw - 3, cy - rr * k], [cx - tw / 2, cy - rr - 6], [cx - tw / 2, cy + rr + 14]]; prio = 3;
      } else if (f.type === 'point') {
        const px = X(Q.num(f.pts[0].x)), py = Y(Q.num(f.pts[0].y)), src = f.tag && SG.roleOf(ents[f.tag]) === 'point' ? f.tag : null;
        if (src) {
          // 自由点的把手：拖动改它的 x、y（沿用 onDown 的 data-drag 机制）
          top += '<circle data-drag="' + src + '" data-kx="x" data-ky="y" data-s="' + s.toFixed(4) + '" cx="' + px + '" cy="' + py + '" r="7" fill="#fff" stroke="' + c + '" stroke-width="' + (on ? 4 : 2.5) + '" style="cursor:grab"' + pk + '/>';
        } else g += '<circle cx="' + px + '" cy="' + py + '" r="' + (on ? 6 : 4) + '" fill="' + c + '"' + pk + sty + '/>';
        lx = px + 9; ly = py - 9;
        const tw = SG.TXT_W(v.label); cands = [[px + 9, py - 9], [px + 9, py + 15], [px - 9 - tw, py - 9], [px - 9 - tw, py + 15]]; prio = 0;
      }
      if (lx !== undefined) labs.push({ text: v.label, c, cands, prio, ren: f.type === 'point' && ents[v.id] && SG.roleOf(ents[v.id]) === 'point' ? v.id : null });   // 点的标签可以双击改名（2.6）
    });
    return wsEdges(fr) + g + hit + top + wsHandles(fr) + gsvg + drawPreview(ws, fr) + offArrows(fr, ws) + placeLabels(labs, w, h, obs) + boardMsg(w, h);
  }
  // 画布顶部的一条消息（只占上面两行，不接收鼠标：底下的点和图形照常能点）
  function boardMsg(w, h) {
    const S = UI.S, t = S.wsMsg; if (!t || !(S.wsBoardUntil > Date.now())) return '';
    const good = S.wsMsgKind === 'good', per = Math.max(8, Math.floor((w - 16) / 11)), lines = [];
    for (let i = 0; i < t.length; i += per) lines.push(t.slice(i, i + per));
    const L = lines.slice(0, 2), bh = L.length * 14 + 6, col = good ? '#15803d' : '#b91c1c';
    let s = '<rect x="3" y="3" width="' + (w - 6) + '" height="' + bh + '" rx="5" fill="' + (good ? '#f0fdf4' : '#fef2f2') + '" stroke="' + col + '" stroke-width="1" pointer-events="none"/>';
    L.forEach((ln, i) => { s += '<text x="9" y="' + (3 + 14 + i * 14) + '" font-size="12" font-weight="700" fill="' + col + '" font-family="var(--font)" pointer-events="none">' + K.esc(ln) + '</text>'; });
    return s;
  }
  // 工作区的消息：文字和颜色一起设（好 / 坏）
  // 画布上的消息留 6 秒（面板里的那一行留到下一次操作）：到点重画一次把它收掉
  function setMsg(text, good) {
    const S = UI.S; S.wsMsg = text || ''; S.wsMsgKind = good ? 'good' : 'bad'; S.wsBoardUntil = Date.now() + 6000;
    clearTimeout(SG.msgTimer); SG.msgTimer = setTimeout(() => { if (!SG.drag && UI.S.wsBoardUntil <= Date.now() && UI.S.wsMsg) SG.render(); }, 6100);
  }
  // 当前工具状态（2.5）：正在“点两下画线”等模式时，画布左下角写一行：当前是什么工具、怎么操作（文字从 UI.ToolHelp 读）。
  // 文字的描边当作身后的底色（颜色用令牌）
  function toolStatus(D, fr) {
    const t = UI.ToolHelp.status(D.tool); if (!t) return '';
    const L = UI.LAYOUT;
    return '<text x="' + L.TOOL_STATUS_X + '" y="' + (fr.h - L.TOOL_STATUS_Y).toFixed(1) + '" font-size="13" font-weight="700" font-family="var(--font)" style="fill:var(--ink);stroke:var(--card);stroke-width:4px;paint-order:stroke" pointer-events="none">' + K.esc(t) + '</text>';
  }
  // 这个工作区正在画线时的当前工具状态，否则空串
  function statusFor(ws, fr) { const D = UI.S.wsDraw; return D && D.ws === ws.id ? toolStatus(D, fr) : ''; }
  // 画线时的预览：第一点（空心圈）、到光标吸附位置的虚线、光标处的吸附点
  function drawPreview(ws, fr) {
    const D = UI.S.wsDraw; if (!D || D.ws !== ws.id) return '';
    let g = toolStatus(D, fr);
    if (D.pend) g += '<circle cx="' + fr.X(D.pend.x).toFixed(1) + '" cy="' + fr.Y(D.pend.y).toFixed(1) + '" r="6" fill="none" stroke="#fff" stroke-width="2"/>';
    if (D.pend && D.cur) g += '<line x1="' + fr.X(D.pend.x).toFixed(1) + '" y1="' + fr.Y(D.pend.y).toFixed(1) + '" x2="' + fr.X(D.cur.x).toFixed(1) + '" y2="' + fr.Y(D.cur.y).toFixed(1) + '" stroke="#fff" stroke-width="2" stroke-dasharray="6 4"/>';
    if (D.cur) g += '<circle cx="' + fr.X(D.cur.x).toFixed(1) + '" cy="' + fr.Y(D.cur.y).toFixed(1) + '" r="5" fill="#fff" fill-opacity=".35" stroke="#fff" stroke-width="2"/>';
    // 吸附到构造点（中点等）：外圈加一个标记，旁边写出是哪一种、哪两个点的
    if (D.cur && D.cur.con) {
      const x = fr.X(D.cur.x), y = fr.Y(D.cur.y);
      g += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="9" fill="none" stroke="#fff" stroke-width="2"/>';
      g += '<text x="' + (x + 12).toFixed(1) + '" y="' + (y - 12).toFixed(1) + '" font-size="13" font-weight="700" fill="#fff" stroke="#0b1020" stroke-width="3" paint-order="stroke">' + K.esc(D.cur.con.label) + '</text>';
    }
    return g;
  }
  // 参考线：细虚线画在工作区里，旁边写关系（labs 里 prio 为 -1，先摆位置）
  const gline = (x0, y0, x1, y1) => '<line class="wsguide" x1="' + x0.toFixed(1) + '" y1="' + y0.toFixed(1) + '" x2="' + x1.toFixed(1) + '" y2="' + y1.toFixed(1) + '" stroke="' + SG.GUIDE_COL + '" stroke-width="1.2" stroke-dasharray="5 3" pointer-events="none"/>';
  function guidesSvg(gs, fr, labs) {
    const { X, Y, w, h } = fr; let s = '';
    for (const g of gs) {
      const ax = X(g.at.x), ay = Y(g.at.y);
      if (g.k === 'vl') s += gline(X(g.x), 0, X(g.x), h);
      else if (g.k === 'hl') s += gline(0, Y(g.y), w, Y(g.y));
      else if (g.k === 'ln') { const x0 = X(g.a.x), y0 = Y(g.a.y), x1 = X(g.b.x), y1 = Y(g.b.y), dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, K = (w + h) / L; s += gline(x0 - dx * K, y0 - dy * K, x1 + dx * K, y1 + dy * K); }
      else if (g.k === 'seg2') s += gline(X(g.a.x), Y(g.a.y), X(g.b.x), Y(g.b.y)) + gline(ax, ay, X(g.a.x), Y(g.a.y)) + gline(ax, ay, X(g.b.x), Y(g.b.y));
      s += '<circle class="wsguide" cx="' + ax.toFixed(1) + '" cy="' + ay.toFixed(1) + '" r="' + (g.k === 'pt' ? 6 : 3) + '" fill="' + (g.k === 'pt' ? 'none' : SG.GUIDE_COL) + '" stroke="' + SG.GUIDE_COL + '" stroke-width="2" pointer-events="none"/>';
      const tw = SG.TXT_W(g.text);
      labs.push({ text: g.text, c: SG.GUIDE_COL, cands: [[ax + 8, ay - 8], [ax + 8, ay + 16], [ax - tw - 8, ay - 8], [ax - tw - 8, ay + 16]], prio: -1 });
    }
    return s;
  }
  // 拼合判定（和「对齐到目标」用同一个 U.Geo.assemble）：工作区里的块拼成了目标图形，块的边线就变绿
  function fitState(ws) {
    const S = UI.S, tg = SG.wsValues(ws, SG.wsNames()).find((v) => SG.isTarget(S.scene.entities[v.id]));
    const pcs = SG.wsKids(ws).filter((k) => SG.roleOf(k) === 'piece');
    if (!tg || !tg.fig || !pcs.length) return null;
    const figs = pcs.map((k) => S.D[k.id] && S.D[k.id].out.f && S.D[k.id].out.f.data);
    if (figs.some((f) => !f) || !U.Geo.assemble(figs, tg.fig).ok) return null;
    return { ids: pcs.map((k) => k.id), flash: !!(S.wsFit && S.wsFit.ws === ws.id && Date.now() < S.wsFit.until) };
  }
  // 画布（工作区的 svg）重画：拖动和画线时只动这一块，不重画台面
  function wsRedraw(id) {
    const ws = UI.S.scene.entities[id]; if (!ws) return;
    document.querySelectorAll('svg.wsbody[data-wsid="' + id + '"]').forEach((sv) => { sv.innerHTML = wsBody(ws, +sv.getAttribute('width'), +sv.getAttribute('height')); });
  }
  // 选中一个图形时，它旁边的浮动工具条的位置（卡片里的坐标）
  function figFloat(ws, w, h) {
    const S = UI.S; if ((S.wsSel || []).length !== 1) return null;
    const name = S.wsSel[0], fr = SG.wsFrame(ws, w, h), v = fr.vals.find((x) => SG.pickOf(x) === name), fi = v && SG.figInfo(v);
    if (!fi || !fi.f.pts || (fi.kind === 'pts' && fi.f.type === 'point')) return null;
    const xs = fi.f.pts.map((p) => Q.num(p.x)), ys = fi.f.pts.map((p) => Q.num(p.y));
    return { name, left: fr.X((Math.min(...xs) + Math.max(...xs)) / 2), top: Math.min(fr.Y(Math.min(...ys)) + L.FLOAT.dy, h - L.FLOAT.h) };   // 浮动工具条放在图形的下面（画布里面），不盖住标题和步数
  }
  function floatHtml(wsId, f, ox, oy) {
    const left = Math.max(L.FLOAT.edge, ox + f.left - L.FLOAT.halfW), top = Math.max(oy + L.FLOAT.top, oy + f.top), nm = SG.escA(f.name);
    return '<div class="wsx-float" style="left:' + left + 'px;top:' + top + 'px">' +
      '<button data-fig-flip="1" data-ws="' + wsId + '" data-name="' + nm + '">左右翻</button>' +
      '<button data-fig-flip="2" data-ws="' + wsId + '" data-name="' + nm + '">上下翻</button></div>';
  }
  // 画布上的把手：边（拖边平移）、角（放缩）、旋转把手；顶点是自由点的把手（和原来的 data-drag 一样）
  // 边的命中线：画在图形的下面（点和图形本身在上面，点不会被边盖住）；拖边 = 整条边平移
  function wsEdges(fr) {
    const S = UI.S, X = fr.X, Y = fr.Y;
    let g = '';
    for (const v of fr.vals) {
      const fi = SG.figInfo(v); if (!fi || !fi.f.pts || fi.kind !== 'pts' || fi.f.type === 'point') continue;
      const pts = fi.f.pts;
      fi.edges.forEach(([a, b]) => {
        const ga = fi.verts[a], gb = fi.verts[b]; if (ga === gb) return;
        g += '<line x1="' + X(Q.num(pts[a].x)).toFixed(1) + '" y1="' + Y(Q.num(pts[a].y)).toFixed(1) + '" x2="' + X(Q.num(pts[b].x)).toFixed(1) + '" y2="' + Y(Q.num(pts[b].y)).toFixed(1) + '" stroke="transparent" stroke-width="12" data-hdl="edge" data-gids="' + ga + ',' + gb + '" data-pick="' + SG.escA(SG.pickOf(v)) + '" style="cursor:move"/>';
      });
    }
    return g;
  }
  function wsHandles(fr) {
    const S = UI.S, sel = (S.wsSel || []).length === 1 ? S.wsSel[0] : null, X = fr.X, Y = fr.Y;
    const shown = new Set(fr.vals.filter((v) => v.fig && v.fig.type === 'point').map((v) => v.id));
    let g = '';
    fr.vals.forEach((v, i) => {
      const fi = SG.figInfo(v); if (!fi || !fi.f.pts) return;
      const col = SG.WS_COL[i % SG.WS_COL.length], on = !!sel && SG.pickOf(v) === sel, pts = fi.f.pts, isPt = fi.kind === 'pts' && fi.f.type === 'point';
      // 顶点：是自由点、又没有单独画出来的，画一个把手（拖动改它的 x、y）；已经画出来的点自己就是把手
      if (fi.kind === 'pts' && !isPt) pts.forEach((p, k) => { if (shown.has(fi.verts[k])) return; g += '<circle data-drag="' + fi.verts[k] + '" data-kx="x" data-ky="y" cx="' + X(Q.num(p.x)) + '" cy="' + Y(Q.num(p.y)) + '" r="4.5" fill="#fff" stroke="' + col + '" stroke-width="2" style="cursor:grab"/>'; });
      if (!on || isPt) return;
      const xs = pts.map((p) => Q.num(p.x)), ys = pts.map((p) => Q.num(p.y));
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      if (fi.kind === 'piece' || fi.kind === 'pts') {
        // 放缩把手画在外框的角外面一点：长方形、梯形的顶点正好在外框的角上，把手不能盖住顶点（否则选中后就拖不到顶点了）
        const CO = [[-9, 9], [9, 9], [9, -9], [-9, -9]];
        [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].forEach(([x, y], k) => {
          g += '<rect data-hdl="corner" data-corner="' + k + '" x="' + (X(x) - 5 + CO[k][0]).toFixed(1) + '" y="' + (Y(y) - 5 + CO[k][1]).toFixed(1) + '" width="10" height="10" fill="#fff" stroke="' + col + '" stroke-width="2" style="cursor:nwse-resize"/>';
        });
      }
      const cx = X((x0 + x1) / 2), ty = Math.max(12, Y(y1) - 28);   // 把手留在画布里面（画布外面会被卡片的标题盖住）
      g += '<line x1="' + cx.toFixed(1) + '" y1="' + Y(y1).toFixed(1) + '" x2="' + cx.toFixed(1) + '" y2="' + ty.toFixed(1) + '" stroke="' + col + '" stroke-dasharray="3 3"/>';
      g += '<circle data-hdl="rot" cx="' + cx.toFixed(1) + '" cy="' + ty.toFixed(1) + '" r="7" fill="#fff" stroke="' + col + '" stroke-width="2.5" style="cursor:grab"/>';
    });
    return g;
  }
  Object.assign(SG, { placeLabels, offArrows, wsBody, boardMsg, setMsg, drawPreview, gline, guidesSvg, fitState, wsRedraw, figFloat, floatHtml, wsEdges, wsHandles });
})(window);
