/* 台面：卡片、端口、连线、拖拽、缩放、平移。DOM 卡片 + SVG 连线，整块重绘（卡片数 < 40，够快）。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), W = U.World, K = U.kit, Q = U.Q;
  const $ = (s) => document.querySelector(s);
  const L = UI.LAYOUT, HD = L.HD, PORT_Y0 = L.PORT_Y0, PORT_DY = L.PORT_DY, PILL_DY = L.PILL_DY, PILL_W = L.PILL_W, MIN_W = L.MIN_W, MIN_H = L.MIN_H;
  let stageEl, worldEl, focusEl, drag = null, linking = null, lastClick = { id: null, t: 0 }, dblKey = null, dblT = 0;

  const def = (e) => U.types[e.type];
  // 大小：实体上的 e.w、e.h（拖柄改的）优先，没有才用器材的 size()（§10.5.8 A1）
  const geom = (e) => { const sz = def(e).size(e); return { x: e.x, y: e.y, w: e.w > 0 ? e.w : sz[0], h: e.h > 0 ? e.h : sz[1] }; };
  // 同一个东西 400 毫秒内按两次：返回 true，并忘掉这一次，免得第三下又算一次
  function dbl(key) { const now = Date.now(); if (dblKey === key && now - dblT < 400) { dblKey = null; return true; } dblKey = key; dblT = now; return false; }
  const SIGLV = ['err', 'reject', 'warn', 'ok', 'info'];

  // ---------- 几何工作区（任务 H1，§10.5）----------
  // 工作区里的器材不显示成卡片；它们输出的 fig / figs 画在工作区的画布里，带名字，可以选、可以拖（自由点）。
  const STEP_TYPES = ['gseg', 'gmid', 'gfoot', 'gcut', 'gplace', 'gasm'];
  const STEP_LABEL = { gseg: '连线', gmid: '中点', gfoot: '垂线', gcut: '剪', gasm: '合并' };
  const WS_COL = ['#3b82f6', '#f97316', '#10b981', '#a855f7', '#ef4444'];
  const escA = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const numOf = (id) => +String(id).slice(1);
  const isWsDef = (type) => !!(U.types[type] && U.types[type].workspace);
  // 器材是不是放在某个工作区里面（是的话不画卡片，也不画连线）
  const inWs = (e) => { const p = e.parent && UI.S.scene.entities[e.parent]; return !!(p && isWsDef(p.type)); };
  const wsKids = (ws) => Object.values(UI.S.scene.entities).filter((x) => x.parent === ws.id).sort((a, b) => numOf(a.id) - numOf(b.id));
  const wsNames = () => { const m = {}; for (const x of U.Names.list(UI.S.scene)) m[x.id + '.' + x.port] = x.name; return m; };
  // 选中用的名字：有稳定名字的用名字；没有的（自由点围成的图形）用 '#' 加上它的输出口的键，选中以后照样能拖、能翻、能放缩
  const pickOf = (v) => v.name || '#' + v.key;
  // 找回选中的对象：'#' 开头的按键找（实体 id 和口），其余按稳定名字找。返回和 U.Names.resolve 一样的形状
  const resolvePick = (name) => { if (name[0] !== '#') return U.Names.resolve(UI.S.scene, name); const [id, port] = name.slice(1).split('.'); const e = UI.S.scene.entities[id]; if (!e) return 'missing: ' + name; const node = (UI.S.D || {})[id]; return { name, id, port, ent: e, value: (node && node.out[port]) || null }; };
  // 工作区里要显示的值：每个器材输出的 fig（没有 fig 时才用 figs），按放入的先后。key 是 器材id.口，层开关用它
  // ---- 学生看到的名字：只改显示；稳定名字（选中、解析用的）不变 ----
  const TXT_W = (t) => { let w = 0; for (const ch of String(t)) w += ch.charCodeAt(0) < 128 ? 6.6 : 11.5; return Math.ceil(w) + 4; };
  const vName = (n) => { const m = /^M\((.*)\)$/.exec(n); return m ? m[1] + '中点' : n; };
  const joinV = (xs) => (xs.every((x) => x.length === 1) ? xs.join('') : xs.join('、'));
  function pretty(nm) {
    if (!nm) return null;
    let m;
    if ((m = /^poly\((.*)\)$/.exec(nm))) { const vs = m[1].split(',').map(vName); return (vs.length === 3 ? '三角形 ' : vs.length === 4 ? '四边形 ' : '多边形 ') + joinV(vs); }
    if ((m = /^seg\((.*)\)$/.exec(nm))) return '线段 ' + m[1].split(',').map(vName).join(' 到 ');
    if (/^M\(/.test(nm)) return vName(nm);
    if (/^X\(/.test(nm)) return '交点';
    if (/^foot\(/.test(nm)) return '垂足';
    if (/^perp\(/.test(nm)) return '垂线段';
    if (/^step:/.test(nm)) return '摆出来的图形';
    if (/^cut:/.test(nm)) return '剪开的一块';
    return nm;
  }
  // 题目把哪个图形当作目标：看它的角色（题目里写的 role 含“目标”），不看器材类型——普通的四边形就是四边形
  const isTarget = (ent) => !!(ent && /目标/.test(ent.role || ''));
  const FIG_NAME = { polygon: '多边形', segment: '线段', circle: '圆', point: '点' };
  // 图形的标签：块用它自己的名字；目标图形（fquad）统一叫「目标图形」；其余用学生名字，没有就按图形的种类
  function figLabel(it, nm, fig) {
    if (it.type === 'gpiece') return it.props.name || it.name;
    if (isTarget(it)) return '目标图形';
    return pretty(nm) || it.name || FIG_NAME[fig && fig.type];
  }
  function wsValues(ws, names) {
    const S = UI.S, D = S.D || {}, shows = U.types[ws.type].workspace.shows, out = [];
    const E = S.scene.entities, L = S.scene.links;
    for (const it of wsKids(ws)) {
      if (it.hidden) continue;   // 被剪开的图形（entity.hidden）不画，块画在它的位置上
      const d = U.types[it.type], node = D[it.id]; if (!d || !node || !node.out) continue;
      const ports = Object.keys(d.outputs), hasFig = ports.some((p) => node.out[p] && node.out[p].kind === 'fig');
      for (const port of ports) {
        const v = node.out[port]; if (!v || !shows.includes(v.kind)) continue;
        // 剪开的一口已经接成了块：画块（它自己会移动），不再画剪刀的原样输出
        if (it.type === 'gcut' && L.some((l) => l.from === it.id && l.fromPort === port && E[l.to] && E[l.to].type === 'gpiece')) continue;
        const key = it.id + '.' + port, nm = names[key] || null;
        if (v.kind === 'figs') { if (hasFig) continue; v.data.forEach((f, i) => out.push({ key: key + '.' + i, name: null, label: figLabel(it, nm, f), fig: f, id: it.id, port })); continue; }
        out.push({ key, name: nm, label: figLabel(it, nm, v.data), fig: v.data, id: it.id, port });
      }
    }
    return out;
  }
  // 工作区里的步骤：工具造出来的步骤器材（连线、中点、垂线、剪、摆放、拼合）。标题的步数和步骤清单都用它
  const wsSteps = (ws) => wsKids(ws).filter((k) => STEP_TYPES.includes(k.type));
  // 选中的对象显示成学生的名字（找到了用图形的标签，找不到就按名字换算）
  const pickLabel = (x, vals) => { const v = vals.find((y) => pickOf(y) === x); return v ? v.label : pretty(x) || x; };
  // 拼合器材有两种：「合并」（没有目标口）和「对齐到目标」（目标口接着目标图形）；步骤清单要分得开
  const stepLabel = (st) => (st.type === 'gasm' && UI.S.scene.links.some((l) => l.to === st.id && l.toPort === 'target') ? '对齐到目标'
    : st.type === 'gplace' ? (st.props.flip ? '翻转' : st.props.turn ? '旋转' : '移动') : STEP_LABEL[st.type] || st.type);
  // ---- 工作区的坐标范围（§10.5.8 A2、A3）----
  // 工作区实体的 ui.view = {cx, cy, span}（见 js/ui/state.js）：可见的横向范围是 [cx-span/2, cx+span/2]，画布上 1 个坐标单位 = w/span 像素。
  // 没存过的，按内容自动选（横纵都装得下）。一旦拖过、滚过、改过大小、点过“适应”，就存下来：
  // 之后拉大卡片只是把图画大，坐标范围不变。
  function wsVisible(ws) { const hidden = UI.State.hiddenOf(ws); return wsValues(ws, wsNames()).filter((v) => !hidden[v.key] && v.fig); }
  // 一个图形在坐标里的外框（圆按半径算）；没有点就是 null
  function figBox(f) {
    if (!f || !f.pts || !f.pts.length) return null;
    const r = f.type === 'circle' ? Math.sqrt(Q.num(f.r2)) : 0, xs = f.pts.map((p) => Q.num(p.x)), ys = f.pts.map((p) => Q.num(p.y));
    return { x0: Math.min(...xs) - r, x1: Math.max(...xs) + r, y0: Math.min(...ys) - r, y1: Math.max(...ys) + r };
  }
  function wsBounds(vals) {
    const xs = [], ys = [];
    for (const v of vals) {
      const f = v.fig;
      const r = f.type === 'circle' ? Math.sqrt(Q.num(f.r2)) : 0;
      for (const p of f.pts || []) { xs.push(Q.num(p.x) - r, Q.num(p.x) + r); ys.push(Q.num(p.y) - r, Q.num(p.y) + r); }
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

  // 工作区的画布：把所有显示的值画在一起，按工作区的坐标范围画（范围定下来以后，卡片变大图也跟着变大）
  // 标签：先按候选位置挑第一个“在画布里、不和已放的标签叠”的；候选都不行，就找画布里一个空的格子；实在没有，夹到画布里
  function placeLabels(labs, w, h) {
    const M = 3, placed = [];
    const box = (x, y, t) => ({ x0: x, x1: x + TXT_W(t), y0: y - 11, y1: y + 3 });
    const inside = (b) => b.x0 >= M && b.x1 <= w - M && b.y0 >= M && b.y1 <= h - M;
    const hit = (b) => placed.some((p) => b.x0 < p.x1 && b.x1 > p.x0 && b.y0 < p.y1 && b.y1 > p.y0);
    const pick = (L) => {
      for (const [x, y] of L.cands) { const b = box(x, y, L.text); if (inside(b) && !hit(b)) return [x, y, b]; }
      for (let y = 14; y <= h - 4; y += 14) for (let x = M; x <= w - TXT_W(L.text) - M; x += 18) { const b = box(x, y, L.text); if (inside(b) && !hit(b)) return [x, y, b]; }
      const [x0, y0] = L.cands[0], b0 = box(x0, y0, L.text);
      const dx = Math.max(M - b0.x0, Math.min(0, w - M - b0.x1)), dy = Math.max(M - b0.y0, Math.min(0, h - M - b0.y1));
      return [x0 + dx, y0 + dy, box(x0 + dx, y0 + dy, L.text)];
    };
    let svg = '';
    for (const L of labs.slice().sort((a, b) => a.prio - b.prio)) {
      const [x, y, b] = pick(L); placed.push(b);
      svg += '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" font-size="11" font-weight="700" fill="' + L.c + '" font-family="var(--font)">' + K.esc(L.text) + '</text>';
    }
    return svg;
  }
  // 整个在坐标范围外面的图形：在画布边缘画一个箭头和名字，点一下就把范围调到它（wsFit）
  function offArrows(fr, ws) {
    const { vw, w, h, X, Y, vals } = fr, { hw, hh } = UI.Space.halfRange(w, h, vw), M = 6, out = [];
    vals.forEach((v, i) => {
      const bx = figBox(v.fig); if (!bx) return;
      if (bx.x1 >= vw.cx - hw && bx.x0 <= vw.cx + hw && bx.y1 >= vw.cy - hh && bx.y0 <= vw.cy + hh) return;
      const dx = X((bx.x0 + bx.x1) / 2) - w / 2, dy = Y((bx.y0 + bx.y1) / 2) - h / 2;
      if (!dx && !dy) return;
      const t = Math.min(dx ? (w / 2 - M - 14) / Math.abs(dx) : Infinity, dy ? (h / 2 - M - 14) / Math.abs(dy) : Infinity);
      const ax = w / 2 + dx * t, ay = h / 2 + dy * t, ang = Math.atan2(dy, dx) * 180 / Math.PI, c = WS_COL[i % WS_COL.length];
      const tw = TXT_W(v.label), tx = Math.max(M, Math.min(w - M - tw, ax - tw / 2)), ty = ay < h / 2 ? Math.min(h - M, ay + 26) : Math.max(M + 11, ay - 18);
      out.push('<g data-fit-ws="' + ws.id + '" data-fit-key="' + escA(v.key) + '" style="cursor:pointer">' +
        '<circle cx="' + ax.toFixed(1) + '" cy="' + ay.toFixed(1) + '" r="12" fill="#fff" stroke="' + c + '" stroke-width="2"/>' +
        '<path d="M-5 -4 L5 0 L-5 4 Z" fill="' + c + '" transform="translate(' + ax.toFixed(1) + ' ' + ay.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')"/>' +
        '<text x="' + tx.toFixed(1) + '" y="' + ty.toFixed(1) + '" font-size="11" font-weight="700" fill="' + c + '" font-family="var(--font)">' + K.esc(v.label) + '</text></g>');
    });
    return out.join('');
  }
  // 坐标范围跟着内容走：新加的、挪动过的图形如果超出了范围，就自动重新适应（拖动中不做，拖动开始时范围已经冻结）
  function checkViews() {
    const S = UI.S; if (drag) return;
    S.wsSig = S.wsSig || {};
    for (const ws of Object.values(S.scene.entities)) {
      if (!isWsDef(ws.type)) continue;
      // 这个工作区在本次打开后第一次看到（比如刷新后）：只记下签名，不因为“都是新的”就重新适应；存下的范围保留
      const first = !S.wsSig[ws.id];
      const vals = wsVisible(ws), prev = S.wsSig[ws.id] || {}, sig = {}, changed = [];
      for (const v of vals) {
        const f = v.fig, k = [f.type, (f.pts || []).map((p) => Q.show(p.x) + ',' + Q.show(p.y)).join(';'), f.r2 ? Q.show(f.r2) : ''].join('|');
        sig[v.key] = k; if (prev[v.key] !== k) changed.push(v);
      }
      S.wsSig[ws.id] = sig;
      if (!changed.length || first) continue;
      const g = geom(ws), w = g.w, h = g.h - HD, vw = wsView(ws, w, h), { hw, hh } = UI.Space.halfRange(w, h, vw);
      const out = changed.some((v) => { const bx = figBox(v.fig); return bx && (bx.x0 < vw.cx - hw || bx.x1 > vw.cx + hw || bx.y0 < vw.cy - hh || bx.y1 > vw.cy + hh); });
      if (out) UI.State.setUi(ws, 'view', autoView(wsBounds(vals), w, h));
    }
  }
  function wsBody(ws, w, h) {
    const S = UI.S, sel = new Set(S.wsSel || []), ents = S.scene.entities;
    const fr = wsFrame(ws, w, h), vals = fr.vals;
    if (!fr.b) return K.text(w / 2, h / 2 - 6, '把图形拖到这里', { size: 15, weight: 700, fill: 'var(--dim)' }) + K.text(w / 2, h / 2 + 16, '从右边器材架拖，或拖台面上的图形卡片', { size: 11, fill: 'var(--dim)' });
    const { vw, s, X, Y } = fr;
    const labs = [];   // 标签先收集，最后统一摆放（不叠、不出画布）
    const gsvg = guidesSvg(drag && drag.wsId === ws.id ? drag.guides || [] : [], fr, labs);   // 拖动时的对齐参考线（C12–C14）
    const fitOn = fitState(ws);   // 拼合正确的块变绿（C16）
    let g = '', top = '', hit = '';   // top：自由点的把手，画在所有图形的上面（图形的填充不能盖住点）；hit：没有别的把手的线和多边形的边，加宽的透明命中线
    vals.forEach((v, i) => {
      const f = v.fig; if (!f) return;
      // 块（§10.5.10）：用块自己的颜色；可以拖（data-drag，松手时一次 piece 移动）
      const ent = ents[v.id], isPc = !!ent && ent.type === 'gpiece' && v.port === 'f';
      const c = isPc ? (ent.props.color || WS_COL[0]) : WS_COL[i % WS_COL.length], on = sel.has(pickOf(v)), sw = on ? 4 : 2;
      const pk = " data-pick=\"" + escA(pickOf(v)) + "\"";
      const dg = isPc && !ent.props.locked ? ' data-drag="' + ent.id + '" data-s="' + s.toFixed(4) + '"' : '';
      const sty = isPc ? ' style="cursor:' + (ent.props.locked ? 'pointer' : 'grab') + '"' : " style=\"cursor:pointer\"";
      // 线和多边形的边：细线很难点中，所以（除了已经有把手的、块）再加一层加宽的透明线，点边就选中它
      const fi0 = figInfo(v), wantHit = (f.type === 'polygon' || f.type === 'segment') && !(fi0 && (fi0.kind === 'pts' || fi0.kind === 'piece'));
      let lx, ly, cands = [], prio = 1;
      if (f.type === 'polygon') {
        const d = f.pts.map((p, k) => (k ? 'L' : 'M') + X(Q.num(p.x)).toFixed(1) + ' ' + Y(Q.num(p.y)).toFixed(1)).join(' ') + ' Z';
        const fit = isPc && !!fitOn && fitOn.ids.includes(ent.id);
        g += '<path d="' + d + '" fill="' + c + '22" stroke="' + (fit ? '#16a34a' : c) + '" stroke-width="' + sw + '"' + (fit && fitOn.flash ? ' class="wsflash"' : '') + pk + dg + sty + '/>';
        if (wantHit) hit += '<path d="' + d + '" fill="none" stroke="transparent" stroke-width="12"' + pk + ' style="cursor:pointer"/>';
        lx = f.pts.reduce((a, p) => a + X(Q.num(p.x)), 0) / f.pts.length; ly = f.pts.reduce((a, p) => a + Y(Q.num(p.y)), 0) / f.pts.length;
        const tw = TXT_W(v.label); cands = [[lx - tw / 2, ly + 4], [lx - tw / 2, ly + 18], [lx - tw / 2, ly - 10], [lx - tw / 2, ly + 32]]; prio = 2;
      } else if (f.type === 'segment') {
        const a = f.pts[0], b = f.pts[1];
        g += '<line x1="' + X(Q.num(a.x)) + '" y1="' + Y(Q.num(a.y)) + '" x2="' + X(Q.num(b.x)) + '" y2="' + Y(Q.num(b.y)) + '" stroke="' + c + '" stroke-width="' + (on ? 5 : 2.5) + '"' + (f.dash ? ' stroke-dasharray="6 4"' : '') + ' stroke-linecap="round"' + pk + sty + '/>';
        if (wantHit) hit += '<line x1="' + X(Q.num(a.x)) + '" y1="' + Y(Q.num(a.y)) + '" x2="' + X(Q.num(b.x)) + '" y2="' + Y(Q.num(b.y)) + '" stroke="transparent" stroke-width="14"' + pk + ' style="cursor:pointer"/>';
        lx = (X(Q.num(a.x)) + X(Q.num(b.x))) / 2; ly = (Y(Q.num(a.y)) + Y(Q.num(b.y))) / 2;
        const tw = TXT_W(v.label); cands = [[lx + 6, ly - 6], [lx + 6, ly + 14], [lx - tw - 6, ly - 6], [lx - tw - 6, ly + 14]];
      } else if (f.type === 'circle') {
        const cx = X(Q.num(f.pts[0].x)), cy = Y(Q.num(f.pts[0].y));
        g += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (Math.sqrt(Q.num(f.r2)) * s) + '" fill="none" stroke="' + c + '" stroke-width="' + sw + '"' + pk + sty + '/>';
        lx = cx; ly = cy;
        const rr = Math.sqrt(Q.num(f.r2)) * s, tw = TXT_W(v.label), k = 0.71;
        cands = [[cx - tw / 2, cy + 4], [cx + rr * k + 3, cy - rr * k], [cx - rr * k - tw - 3, cy - rr * k], [cx - tw / 2, cy - rr - 6], [cx - tw / 2, cy + rr + 14]]; prio = 3;
      } else if (f.type === 'point') {
        const px = X(Q.num(f.pts[0].x)), py = Y(Q.num(f.pts[0].y)), src = f.tag && ents[f.tag] && ents[f.tag].type === 'gpt' ? f.tag : null;
        if (src) {
          // 自由点的把手：拖动改它的 x、y（沿用 onDown 的 data-drag 机制）
          top += '<circle data-drag="' + src + '" data-kx="x" data-ky="y" data-s="' + s.toFixed(4) + '" cx="' + px + '" cy="' + py + '" r="7" fill="#fff" stroke="' + c + '" stroke-width="' + (on ? 4 : 2.5) + '" style="cursor:grab"' + pk + '/>';
        } else g += '<circle cx="' + px + '" cy="' + py + '" r="' + (on ? 6 : 4) + '" fill="' + c + '"' + pk + sty + '/>';
        lx = px + 9; ly = py - 9;
        const tw = TXT_W(v.label); cands = [[px + 9, py - 9], [px + 9, py + 15], [px - 9 - tw, py - 9], [px - 9 - tw, py + 15]]; prio = 0;
      }
      if (lx !== undefined) labs.push({ text: v.label, c, cands, prio });
    });
    return wsEdges(fr) + g + hit + top + wsHandles(fr) + gsvg + drawPreview(ws, fr) + offArrows(fr, ws) + placeLabels(labs, w, h) + boardMsg(w, h);
  }
  // 画布顶部的一条消息（只占上面两行，不接收鼠标：底下的点和图形照常能点）
  function boardMsg(w, h) {
    const S = UI.S, t = S.wsMsg; if (!t || !(S.wsBoardUntil > Date.now())) return '';
    const good = S.wsMsgKind === 'good', per = Math.max(8, Math.floor((w - 16) / 11)), lines = [];
    for (let i = 0; i < t.length; i += per) lines.push(t.slice(i, i + per));
    const L = lines.slice(0, 2), bh = L.length * 14 + 6, col = good ? '#15803d' : '#b91c1c';
    let s = '<rect x="3" y="3" width="' + (w - 6) + '" height="' + bh + '" rx="5" fill="' + (good ? '#f0fdf4' : '#fef2f2') + '" stroke="' + col + '" stroke-width="1" pointer-events="none"/>';
    L.forEach((ln, i) => { s += '<text x="9" y="' + (3 + 14 + i * 14) + '" font-size="11" font-weight="700" fill="' + col + '" font-family="var(--font)" pointer-events="none">' + K.esc(ln) + '</text>'; });
    return s;
  }
  // 工作区的消息：文字和颜色一起设（好 / 坏）
  // 画布上的消息留 6 秒（面板里的那一行留到下一次操作）：到点重画一次把它收掉
  let msgTimer = 0;
  function setMsg(text, good) {
    const S = UI.S; S.wsMsg = text || ''; S.wsMsgKind = good ? 'good' : 'bad'; S.wsBoardUntil = Date.now() + 6000;
    clearTimeout(msgTimer); msgTimer = setTimeout(() => { if (!drag && UI.S.wsBoardUntil <= Date.now() && UI.S.wsMsg) render(); }, 6100);
  }
  // 画线时的预览：第一点（空心圈）、到光标吸附位置的虚线、光标处的吸附点
  function drawPreview(ws, fr) {
    const D = UI.S.wsDraw; if (!D || D.ws !== ws.id) return '';
    let g = '';
    if (D.pend) g += '<circle cx="' + fr.X(D.pend.x).toFixed(1) + '" cy="' + fr.Y(D.pend.y).toFixed(1) + '" r="6" fill="none" stroke="#fff" stroke-width="2"/>';
    if (D.pend && D.cur) g += '<line x1="' + fr.X(D.pend.x).toFixed(1) + '" y1="' + fr.Y(D.pend.y).toFixed(1) + '" x2="' + fr.X(D.cur.x).toFixed(1) + '" y2="' + fr.Y(D.cur.y).toFixed(1) + '" stroke="#fff" stroke-width="2" stroke-dasharray="6 4"/>';
    if (D.cur) g += '<circle cx="' + fr.X(D.cur.x).toFixed(1) + '" cy="' + fr.Y(D.cur.y).toFixed(1) + '" r="5" fill="#fff" fill-opacity=".35" stroke="#fff" stroke-width="2"/>';
    return g;
  }
  // 工作区底下的面板：工具行、选中的对象、消息、步骤历史、图层
  // dims：画布的宽高（专注模式里比卡片大）；inFocus：放在专注浮层的侧栏里，不用绝对定位
  function wsPanelHtml(ws, names, dims, inFocus) {
    const S = UI.S, g = geom(ws), wd = U.types[ws.type].workspace, hidden = UI.State.hiddenOf(ws);
    const pw = dims ? dims.w : g.w, ph = dims ? dims.h : g.h - HD;
    const vals = wsValues(ws, names), steps = wsSteps(ws), picks = S.wsSel || [];
    const pos = inFocus ? '' : ' style="width:' + g.w + 'px"';   // 位置由 UI.Layout.placePanels 在渲染后摆好（实测尺寸）
    let h = '<div class="wsx" data-ws="' + ws.id + '"' + pos + '>';
    const D = S.wsDraw && S.wsDraw.ws === ws.id ? S.wsDraw : null;
    h += '<div class="wsx-tools">' + wd.tools.map((t) => '<button data-ws-tool="' + t.id + '" data-ws="' + ws.id + '"' + (D && D.tool === t.id ? ' class="on"' : '') + '>' + K.esc(t.label) + '</button>').join('') +
      '<button data-ws-fit="' + ws.id + '" title="按内容选坐标范围，让图正好装下">适应</button></div>';
    h += '<div class="wsx-range">' + rangeText(ws, pw, ph) + '</div>';
    h += '<div class="wsx-args">移动时：向右 <input type="number" data-ws-arg="dx" value="' + escA(S.wsArgs.dx) + '"> 向上 <input type="number" data-ws-arg="dy" value="' + escA(S.wsArgs.dy) + '"></div>';
    h += '<div class="wsx-sel">' + (D ? (D.tool === 'cut' ? '剪：选中要剪的图形，点两下画剪切线（Esc 退出）' : '连线：点两下画一条线（Esc 退出）') : picks.length ? '选中：' + picks.map((x) => K.esc(pickLabel(x, vals))).join('、') : '点图形或点来选中（Shift 点可以多选）') + '</div>';
    // 选中的块：把手在这里（旋转、翻转、属性）；拖动是直接拖图形，R、F 键同样有效
    const pcs = selPieceIds().filter((id) => S.scene.entities[id].parent === ws.id);
    if (pcs.length) h += '<div class="wsx-piece"><b>' + K.esc(pcs.length === 1 ? S.scene.entities[pcs[0]].props.name : pcs.length + ' 块') + '</b>' +
      '<button data-piece-act="turn" title="也可以按 R">转 90°</button><button data-piece-act="flip" title="也可以按 F">左右翻</button><button data-piece-act="insp">属性</button>' +
      '<span class="wsx-hint">拖动块可以移动；拖出工作区，松手就变成台面上的器材</span></div>';
    h += '<div class="wsx-foot' + (S.wsMsg ? ' bad' : '') + '">' + K.esc(S.wsMsg || '') + '</div>';
    h += '<div class="wsx-h">步骤</div>';
    if (!steps.length) h += '<div class="wsx-none">还没有步骤</div>';
    steps.forEach((st, i) => {
      const srcs = S.scene.links.filter((l) => l.to === st.id).map((l) => pretty(names[l.from + '.' + l.fromPort]) || '?');
      h += '<div class="wsx-step" data-ws-step="' + st.id + '"><span>第 ' + (i + 1) + ' 步：' + K.esc(stepLabel(st)) + '（' + K.esc(srcs.join('、')) + '）</span>' +
        '<button data-ws-del="' + st.id + '" title="删除这一步">✕</button></div>';
    });
    h += '<div class="wsx-h">图层</div><div class="wsx-layers">' + (vals.length ? vals.map((v) => '<label><input type="checkbox" data-ws-layer="' + escA(v.key) + '" data-ws-of="' + ws.id + '"' + (hidden[v.key] ? '' : ' checked') + '> ' + K.esc(v.label) + '</label>').join('') : '<span class="wsx-none">没有图形</span>') + '</div>';
    return h + '</div>';
  }
  // 点选：没有 Shift 就只选这一个，有 Shift 就加上 / 去掉
  function wsPick(name, shift) {
    const S = UI.S, cur = S.wsSel || [];
    S.wsSel = shift ? (cur.includes(name) ? cur.filter((x) => x !== name) : cur.concat([name])) : [name];
    S.wsMsg = '';   // 换了选择，上一条消息就不再适用
  }
  // 删除工作区里的一步（步骤清单的 ✕）：后面的步骤还用着它的结果，就不删，并在画布上说明是哪几步；
  // 剪开的那一步连它剪出来的块一起删，被剪的图形恢复显示
  function delWs(stId) {
    const S = UI.S, E = S.scene.entities, st = E[stId]; if (!st) return;
    const ws = E[st.parent]; if (!ws) return;
    const num = (x) => wsSteps(ws).indexOf(x) + 1;
    const kids = S.scene.links.filter((l) => l.from === stId).map((l) => E[l.to]).filter(Boolean);
    const pieces = st.type === 'gcut' ? kids.filter((k) => k.type === 'gpiece') : [];
    const users = kids.filter((k) => k.type !== 'gpiece');
    for (const pc of pieces) for (const l of S.scene.links) if (l.from === pc.id && E[l.to]) users.push(E[l.to]);
    const uniqUsers = users.filter((u, i) => users.indexOf(u) === i && STEP_TYPES.includes(u.type));
    if (uniqUsers.length) {
      setMsg('这一步的结果还被第 ' + uniqUsers.map(num).join('、') + ' 步用着：先删掉那些步骤，再删这一步（撤销也能回去）', false);
      return render();
    }
    const src = st.type === 'gcut' ? (S.scene.links.find((l) => l.to === stId && l.toPort === 'f') || {}).from : null;
    S.wsSel = [];
    // 连它剪出来的块一起删，被剪的图形重新显示（撤销时快照里已经是原来的样子）
    const r = UI.Intent.run('delete', { step: stId, pieces: pieces.map((pc) => pc.id), src });
    if (!r.ok) setMsg(r.why, false); else setMsg('', true);
    render();
  }
  // 点工具：把选中的对象交给世界的 t:'tool' 动作（走 act，可以撤销）；失败就把原因放在画布上（和面板里）
  function wsRun(wsId, tool) {
    const S = UI.S, args = {}, picks = (S.wsSel || []).slice();
    const ws = S.scene.entities[wsId], T = ws && U.types[ws.type].workspace.tools.find((x) => x.id === tool), rule = T && U.RULES[T.rule];
    // 连线、剪：没有选够两个对象，就进入「点两下画线」的模式（§10.5.8 B11）
    if ((tool === 'seg' || tool === 'cut') && picks.length !== 2) return drawMode(wsId, tool);
    // 选的个数不够：先说清楚要选几个、现在选了几个（不去试，免得只在面板里说一句）
    if (rule && rule.device) {
      const fixed = rule.wire || [], need = rule.many ? Math.max(1, fixed.length) : fixed.length;
      if (rule.many ? picks.length < need : picks.length !== need) {
        setMsg('「' + T.label + '」要选 ' + (rule.many ? '至少 ' : '') + need + ' 个对象，现在选了 ' + picks.length + ' 个。点图形或点来选中，Shift 点可以多选', false);
        return render();
      }
    }
    if (tool === 'move') {
      const n = (v) => { const k = parseInt(v, 10); return Number.isFinite(k) ? k : 0; };
      args.dx = n(S.wsArgs.dx); args.dy = n(S.wsArgs.dy);
      if (!args.dx && !args.dy) { setMsg('移动要有距离：直接拖动块，或者在「向右」「向上」里填几格再点移动', false); return render(); }
    }
    // 对齐到目标：先算结论（拼对了没有、哪里不对），结论放在画布上（建步骤的同时也说给学生听）
    let verdict = null;
    if (tool === 'fit' && picks.length >= 2) {
      const rs = picks.map((n) => U.Names.resolve(S.scene, n));
      if (rs.every((x) => typeof x !== 'string' && x.value)) verdict = U.Geo.assemble(rs.slice(1).map((x) => x.value.data), rs[0].value.data);
    }
    const r = UI.Intent.run('tool', { ws: wsId, tool, picks, args });
    if (r && r.ok) {
      S.wsSel = [];
      if (verdict) setMsg(verdict.ok ? verdict.why : '还没拼对：' + verdict.why, !!verdict.ok); else setMsg('', true);
    } else setMsg((r && r.why) || '这一步做不了', false);
    render();
  }

  // 哪些属性口要画成药丸：被连线驱动的；正在拖线时再加上所有可写、没被驱动的
  function pillsOf(e, D) {
    const d = def(e), driven = (D[e.id] && D[e.id].driven) || {};
    return Object.keys(d.props).filter((k) => d.props[k].write && (driven[k] || linking));
  }
  function portPos(e, port, D, out) {
    const g = geom(e), d = def(e);
    if (out) { const i = Math.max(0, Object.keys(d.outputs).indexOf(port)); return { x: g.x + g.w, y: g.y + PORT_Y0 + i * PORT_DY }; }
    if (W.isProp(port)) { const k = port.slice(2), ps = pillsOf(e, D), i = Math.max(0, ps.indexOf(k)); return { x: g.x - L.PILL_GAP, y: g.y + PORT_Y0 + i * PILL_DY }; }
    const i = Math.max(0, Object.keys(d.inputs).indexOf(port)); return { x: g.x, y: g.y + PORT_Y0 + i * PORT_DY };
  }
  const bez = (a, b) => { const dx = Math.max(L.LINK_CURVE_MIN, Math.abs(b.x - a.x) / 2); return 'M' + a.x + ',' + a.y + ' C' + (a.x + dx) + ',' + a.y + ' ' + (b.x - dx) + ',' + b.y + ' ' + b.x + ',' + b.y; };

  function cardHtml(e, D, S) {
    const d = def(e), g = geom(e), dd = D[e.id], cH = g.h - HD;
    const c = { ent: e, props: dd.props || e.props, d: dd, out: dd.out, state: e.state, w: g.w, h: cH, t: S.scene.clock.t, n: S.scene.clock.n };
    let body = '', badge = '';
    try { body = d.workspace ? wsBody(e, g.w, cH) : d.draw(c); } catch (x) { body = K.text(g.w / 2, cH / 2, '画不出来', { fill: 'var(--bad)' }); }
    // 工作区的标题步数只数学生做的步骤（和下面的步骤清单是同一批）
    try { badge = d.workspace ? (wsSteps(e).length ? wsSteps(e).length + ' 步' : '') : d.badge ? d.badge(c) : ''; } catch (x) { badge = ''; }
    let h = '<div class="card' + (S.sel === e.id ? ' sel' : '') + '" data-id="' + e.id + '" style="left:' + g.x + 'px;top:' + g.y + 'px;width:' + g.w + 'px;height:' + g.h + 'px">';
    h += '<div class="hd" data-id="' + e.id + '"><span class="nm">' + K.esc(e.name) + '</span><span class="bd">' + K.esc(badge || '') + '</span></div>';
    h += '<svg class="bdy' + (d.workspace ? ' wsbody" data-wsid="' + e.id : '') + '" width="' + g.w + '" height="' + cH + '" viewBox="0 0 ' + g.w + ' ' + cH + '">' + body + '</svg>';
    Object.keys(d.inputs).forEach((k, i) => {
      h += '<i class="port in" data-id="' + e.id + '" data-port="' + k + '" style="left:0;top:' + (PORT_Y0 + i * PORT_DY) + 'px"></i>';
      h += '<span class="pl" style="left:' + L.PORT_LABEL_X + 'px;top:' + (PORT_Y0 + i * PORT_DY) + 'px">' + K.esc(d.inputs[k].label) + '</span>';
    });
    Object.keys(d.outputs).forEach((k, i) => {
      h += '<i class="port out" data-id="' + e.id + '" data-port="' + k + '" style="left:' + g.w + 'px;top:' + (PORT_Y0 + i * PORT_DY) + 'px;background:' + U.kindColor(d.outputs[k].kind) + '"></i>';
      if (!d.workspace) h += '<span class="pl" style="right:' + L.PORT_LABEL_X + 'px;top:' + (PORT_Y0 + i * PORT_DY) + 'px">' + K.esc(d.outputs[k].label) + '</span>';   // 工作区的步数标在标题栏里，这里不再写（会和画布里的把手叠在一起）
    });
    h += '<i class="rz" data-rz="' + e.id + '" title="拖动改大小；双击恢复默认"></i>';
    h += '</div>';
    // 属性药丸（在卡片左边外侧）
    pillsOf(e, D).forEach((k, i) => {
      const drv = dd.driven[k];
      h += '<div class="pill' + (drv ? ' driven' : '') + '" data-id="' + e.id + '" data-port="p.' + k + '" style="left:' + (g.x - PILL_W - L.PILL_GAP) + 'px;top:' + (g.y + PORT_Y0 + i * PILL_DY) + 'px">' + K.esc(d.props[k].label) + '</div>';
    });
    // 信号条
    const sg = (dd.sig || []).slice().sort((a, b) => SIGLV.indexOf(a.lv) - SIGLV.indexOf(b.lv))[0];
    if (sg && S.showSig) h += '<div class="sig ' + sg.lv + '" style="left:' + g.x + 'px;top:' + (g.y + g.h + L.SIG_GAP) + 'px">' + K.esc(sg.tx) + '</div>';
    // 选中工具条
    if (S.sel === e.id) {
      h += '<div class="tool" style="left:' + (g.x + g.w + L.TOOL_GAP) + 'px;top:' + g.y + 'px">' +
        '<button data-act="insp" title="属性">' + ico('gear') + '</button><button data-act="copy" title="复制">' + ico('copy') + '</button>' +
        (def(e).stateful ? '<button data-act="resetstate" title="记忆归零">' + ico('undo') + '</button>' : '') +
        (e.type === 'gpiece' ? '<button data-act="turn" title="转 90°（R）">' + ico('turn') + '</button><button data-act="flip" title="左右翻（F）">' + ico('flip') + '</button>' : '') +
        '<button data-act="del" title="删除">' + ico('trash') + '</button></div>';
    }
    if (d.workspace) { const ff = figFloat(e, g.w, cH); if (ff) h += floatHtml(e.id, ff, g.x, g.y + HD); }
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
      const F = E[l.from], T = E[l.to]; if (!F || !T || inWs(F) || inWs(T)) continue;
      const a = portPos(F, l.fromPort, D, true), b = portPos(T, l.toPort, D, false);
      const v = D[F.id] && D[F.id].out[l.fromPort], col = U.kindColor(def(F).outputs[l.fromPort] ? def(F).outputs[l.fromPort].kind : 'num');
      const sel = S.selLink === l.id, pd = bez(a, b);
      paths += '<path class="hit" data-link="' + l.id + '" d="' + pd + '"/><path class="ln' + (sel ? ' sel' : '') + '" stroke="' + col + '" d="' + pd + '"/>';
      if (S.scene.clock.running) paths += '<path class="flow" d="' + pd + '"/>';
      lbl += '<div class="lb' + (sel ? ' sel' : '') + '" data-link="' + l.id + '" style="left:' + ((a.x + b.x) / 2) + 'px;top:' + ((a.y + b.y) / 2) + 'px">' + K.esc(v ? U.briefVal(v) : '—') + (sel ? ' <button class="lbwhy" data-why="' + l.from + '|' + l.fromPort + '" title="这个数是怎么来的">？</button><button class="lbdel" data-unlink="' + l.id + '" title="删除这根线">✕</button>' : '') + '</div>';
    }
    if (linking && linking.cur) { const F = E[linking.from]; paths += '<path class="ln" stroke="#fff" stroke-dasharray="6 6" d="' + bez(portPos(F, linking.fromPort, D, true), linking.cur) + '" fill="none"/>'; }
    return { paths, lbl };
  }

  function render() {
    const S = UI.S; if (!S) return;
    checkViews();
    const D = S.D, E = S.scene.entities;
    const lk = linksHtml(S);
    let h = '<svg id="links" width="1" height="1">' + lk.paths + '</svg>';
    // 工作区里的器材不画卡片；工作区的选中对象只保留还存在的名字
    const names = wsNames(), known = new Set(Object.values(names));
    S.wsSel = (S.wsSel || []).filter((n) => known.has(n) || n[0] === "#");
    for (const id of Object.keys(E)) if (!inWs(E[id])) h += cardHtml(E[id], D, S);
    h += lk.lbl;
    for (const id of Object.keys(E)) if (isWsDef(E[id].type)) h += wsPanelHtml(E[id], names);
    worldEl.innerHTML = h;
    worldEl.style.transform = 'translate(' + S.view.x + 'px,' + S.view.y + 'px) scale(' + S.view.z + ')';
    UI.Layout.placePanels(worldEl, stageEl, S.view, (id) => { const e = S.scene.entities[id]; return e ? geom(e) : null; });
    const z = $('#zv'); if (z) z.textContent = Math.round(S.view.z * 100) + '%';
    if (focusEl) { focusEl.innerHTML = focusHtml(); focusEl.style.display = UI.State.focusedId() ? '' : 'none'; }
    if (UI.App && UI.App.persistView) UI.App.persistView();   // 视图改过就存档（不进撤销）
  }

  // ---- 专注模式（§10.5.8 A4）：工作区放大成覆盖台面的浮层，双击标题或按 Esc 还原 ----
  function setFocus(id) { UI.State.setFocusId(id || null); render(); }
  function focusHtml() {
    const S = UI.S, id = UI.State.focusedId(), e = id && S.scene.entities[id];
    if (!e || !isWsDef(e.type)) { if (id) UI.State.setFocusId(null); return ''; }
    const r = stageEl.getBoundingClientRect();
    const F = L.FOCUS, W = Math.max(F.minW, Math.round(r.width - F.side - F.padX)), H = Math.max(F.minH, Math.round(r.height - F.hdH - F.padY));
    let h = '<div class="wsf-hd" title="双击标题，或按 Esc，还原"><b>' + K.esc(e.name) + '</b><span>双击标题或按 Esc 还原</span><button data-ws-unfocus>还原</button></div>';
    h += '<div class="wsf-main"><svg class="bdy wsbody" data-wsid="' + e.id + '" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' + wsBody(e, W, H) + '</svg>';
    h += '<div class="wsf-side">' + wsPanelHtml(e, wsNames(), { w: W, h: H }, true) + '</div></div>';
    return h;
  }
  // 工作区里滚轮缩放：以指针为中心，只改这个工作区的坐标范围（台面不动）
  function wsZoomAt(wb, f, cx, cy) {
    const S = UI.S, id = wb.dataset.wsid, ws = S.scene.entities[id]; if (!ws) return;
    const cw = +wb.getAttribute('width'), ch = +wb.getAttribute('height'), Sp = UI.Space;
    const local = Sp.screenToCanvas({ clientX: cx, clientY: cy }, wb.getBoundingClientRect(), cw, ch);
    const v0 = wsView(ws, cw, ch), p = Sp.canvasToWorkspace(local, cw, ch, v0);
    const span = UI.Space.zoomSpan(v0, f);
    // 指针下面的那一点缩放前后位置不变：算出新范围的中心，使新范围下这一点仍然是 p
    const q = Sp.canvasToWorkspace(local, cw, ch, { cx: 0, cy: 0, span });
    UI.State.setUi(ws, 'view', { cx: p.x - q.x, cy: p.y - q.y, span });
    render();
  }
  // 适应：按内容选一个正好装下的坐标范围（之后拉大卡片不再变）
  // key 有值时只适应到这一个图形（超出范围的箭头用它）
  function wsFit(id, key) {
    const S = UI.S, ws = S.scene.entities[id]; if (!ws) return;
    const sv = UI.State.focusedId() === id && focusEl ? focusEl.querySelector('svg.wsbody') : null;
    let w, h;
    if (sv) { w = +sv.getAttribute('width'); h = +sv.getAttribute('height'); }
    else { const g = geom(ws); w = g.w; h = g.h - HD; }
    const vals = key ? wsVisible(ws).filter((v) => v.key === key) : wsVisible(ws);
    UI.State.setUi(ws, 'view', autoView(wsBounds(vals), w, h));
    render();
  }
  // 开始拖柄改大小：工作区先把现在看到的坐标范围存下来，之后拉大只是把图画大
  function startResize(id, ev) {
    const S = UI.S, e = S.scene.entities[id]; if (!e) return;
    ev.preventDefault(); ev.stopPropagation();
    const g = geom(e);
    if (isWsDef(e.type) && !UI.State.viewOf(e)) UI.State.setUi(e, 'view', wsView(e, g.w, g.h - HD));
    S.sel = id; S.selLink = null;
    drag = { kind: 'rz', id, sx: ev.clientX, sy: ev.clientY, w0: g.w, h0: g.h, zoom: S.view.z, moved: false };
  }

  function fit() {
    const S = UI.S, r = stageEl.getBoundingClientRect();
    let ids = Object.keys(S.scene.entities).filter((id) => !inWs(S.scene.entities[id]));
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    if (!ids.length) { S.view = { x: r.width / 2 - L.EMPTY_VIEW.dx, y: r.height / 2 - L.EMPTY_VIEW.dy, z: 1 }; return; }
    ids.forEach((id) => {
      const e = S.scene.entities[id], g = geom(e); x0 = Math.min(x0, g.x - L.FIT.padL); y0 = Math.min(y0, g.y); x1 = Math.max(x1, g.x + g.w + L.FIT.padR); y1 = Math.max(y1, g.y + g.h + L.FIT.padB);
      if (isWsDef(e.type)) { const pr = UI.Layout.panelRect(id, g); y1 = Math.max(y1, pr.y + pr.h); }   // 工作区底下的面板：实测（或估计）的高度
    });
    const FS = L.FIT_SCREEN, z = Math.max(L.ZOOM.fitMin, Math.min(L.ZOOM.fitMax, Math.min((r.width - 2 * FS.x) / (x1 - x0), (r.height - 2 * FS.y) / (y1 - y0))));
    const Sp = UI.Space;
    S.view = Sp.viewAt(z, { x: x0, y: y0 }, { x: (r.width - Sp.scaleLen(x1 - x0, z)) / 2, y: Math.max(L.FIT_TOP_MIN, (r.height - Sp.scaleLen(y1 - y0, z)) / 2) + L.FIT_TOP_NUDGE });
  }

  function zoomAt(f, cx, cy) {
    const S = UI.S, r = stageEl.getBoundingClientRect();
    const local = cx === undefined ? { x: r.width / 2, y: r.height / 2 } : UI.Space.stageLocal({ clientX: cx, clientY: cy });
    S.view = UI.Space.zoomView(S.view, f, local, L.ZOOM); render();
  }

  // ---- 拖线时的提示 ----
  const tip = () => $('#tip');
  function showTip(x, y, txt, good) { const t = tip(); if (!txt) { t.style.display = 'none'; return; } t.textContent = txt; t.className = good ? 'good' : ''; t.style.display = 'block'; t.style.left = x + L.TIP_OFFSET + 'px'; t.style.top = y + L.TIP_OFFSET + 'px'; }

  // ---- 块（§10.5.10）----
  // 选中的块：工作区里选中的（按名字找回），加上台面上选中的块卡片
  function selPieceIds() {
    const S = UI.S, out = [];
    for (const n of S.wsSel || []) { const r = U.Names.resolve(S.scene, n); if (r && r.ent && r.ent.type === 'gpiece' && !out.includes(r.id)) out.push(r.id); }
    const e = S.sel && S.scene.entities[S.sel];
    if (e && e.type === 'gpiece' && !inWs(e) && !out.includes(e.id)) out.push(e.id);
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
    if (pe.props.locked) { if (pk) render(); UI.Panels.renderInsp(); return; }
    ev.preventDefault(); ev.stopPropagation();
    // 坐标范围在拖动开始时冻结：工作区没存过范围时是按内容自动选的，块一动内容就变，不冻结的话每动一下比例都会变
    const svg = gh.closest('svg'), r = svg.getBoundingClientRect(), cw = +svg.getAttribute('width') || r.width, ch = +svg.getAttribute('height') || r.height;
    const ws = S.scene.entities[pe.parent], v0 = ws ? wsView(ws, cw, ch) : null;
    // 对齐准备：块的形状（拖动开始时的）和其余的顶点、边（目标图形也在里面），块自己的不算
    const pv = S.D[pe.id] && S.D[pe.id].out.f ? S.D[pe.id].out.f.data : null;
    const align = pv && ws ? buildAlign(ws, pv.pts, edgesOf(pv), [], (v) => v.id === pe.id) : null;
    drag = { kind: 'piece', id: pe.id, wsId: pe.parent, v0, unit: v0 ? UI.Space.canvasOf(r, v0.span).unit : UI.Space.figUnit(r, cw, +gh.dataset.s), dx0: pe.props.dx, dy0: pe.props.dy, sx: ev.clientX, sy: ev.clientY, dxn: 0, dyn: 0, out: false, moved: false, align, guides: [] };
    // 量完大小再重画：重画会换掉这个图形的 DOM，之后再量会得到 0
    if (pk) render();
  }
  function pieceMove(ev) {
    const S = UI.S, d = drag, e = S.scene.entities[d.id];
    if (!e) return;
    const mx = ev.clientX - d.sx, my = ev.clientY - d.sy;
    if (!d.moved && Math.hypot(mx, my) < L.DRAG_SLOP) return;
    if (!d.moved && d.v0) UI.State.setUi(S.scene.entities[d.wsId], 'view', d.v0);   // 拖动开始：把冻结的坐标范围存下来
    d.moved = true;
    d.out = !overWs(ev, d.wsId);
    const cl = (v) => Math.max(-200, Math.min(200, v));
    let nx = d.dx0, ny = d.dy0; d.guides = [];
    if (!d.out) {
      if (d.align) { d.align.alt = !!ev.altKey; const s = alignSolve(d.align, { x: UI.Space.pxToUnits(mx, d.unit), y: -UI.Space.pxToUnits(my, d.unit) }, d.unit); nx = cl(d.dx0 + s.dx); ny = cl(d.dy0 + s.dy); d.guides = s.guides; }
      else { nx = cl(d.dx0 + Math.round(UI.Space.pxToUnits(mx, d.unit))); ny = cl(d.dy0 - Math.round(UI.Space.pxToUnits(my, d.unit))); }
    }
    d.dxn = nx - d.dx0; d.dyn = ny - d.dy0;
    if (e.props.dx !== nx || e.props.dy !== ny) {
      e.props.dx = nx; e.props.dy = ny;
      // 还在工作区里：只重画工作区；拖出去了要变成台面上的卡片，整张台面重画
      if (d.out) UI.App.refresh(false); else { S.D = W.evaluate(S.scene); wsRedraw(d.wsId); }
    }
    showTip(ev.clientX, ev.clientY, d.out ? '松手放到台面上，就变成一张器材卡片' : '向右 ' + d.dxn + ' 格，向上 ' + d.dyn + ' 格', !d.out);
  }
  // 松手：还在工作区里，就是一步移动；拖出了工作区，就取出来放到台面上（落在别的容器上就放进那个容器）
  function pieceUp(d, ev) {
    const S = UI.S, e = S.scene.entities[d.id];
    showTip(0, 0, '');
    if (!e) return;
    if (!d.moved) { UI.Panels.renderInsp(); render(); return; }
    e.props.dx = d.dx0; e.props.dy = d.dy0;
    if (d.out) {
      const w = UI.Space.screenToStage(ev);
      UI.Intent.run('drop', { id: d.id, ev, piece: true, out: { x: w.x - L.PIECE_DROP.x, y: w.y - L.PIECE_DROP.y } });
    } else if (d.dxn || d.dyn) UI.Intent.run('piece', { ids: [d.id], what: 'move', value: { dx: d.dxn, dy: d.dyn } });
    else UI.App.refresh(false);
    // 松手后：拼对了就闪一下（判定在 wsBody 里每次重画时算，和「对齐到目标」一样用 U.Geo.assemble）
    if (!d.out) S.wsFit = { ws: d.wsId, until: Date.now() + 900 };
    UI.Panels.renderInsp(); render();
  }

  // ---- 工作区里直接用鼠标改图形（§10.5.8 B）----
  // 一个图形能被怎么改，看它从哪里来：由自由点（gpt）直接围成的（kind 'pts'，改点的 x、y）；
  // 块（'piece'，用块的动作：移、转、翻、放缩）；摆放出来的（'place'，改 dx、dy、turn、flip）。
  // 顶点是不是自由点，靠连线查：多边形或线段的输入口接着的 gpt 器材，坐标对得上的就是它的顶点。
  const uniq = (xs) => xs.filter((x, i) => xs.indexOf(x) === i);
  const SCALES = ['1/2', '2/3', '1', '3/2', '2', '3'].map((s) => Q.parse(s));
  const SNAP_PX = 9;
  const minQ = (a) => a.reduce((m, q) => (Q.cmp(q, m) < 0 ? q : m));
  const maxQ = (a) => a.reduce((m, q) => (Q.cmp(q, m) > 0 ? q : m));
  const modT = (x) => ((x % 4) + 4) % 4;
  // 工作区的画布框架：可见的值、范围、像素换算。w、h 是画布的宽高（属性）
  function wsFrame(ws, w, h) {
    const vals = wsVisible(ws), b = wsBounds(vals), vw = wsView(ws, w, h, b), s = UI.Space.perUnit(w, vw);
    return { vals, b, vw, s, w, h, X: (x) => UI.Space.canvasX(x, w, vw), Y: (y) => UI.Space.canvasY(y, h, vw) };
  }
  // 屏幕像素 → 工作区坐标：sc.unit 是一个坐标单位占的屏幕像素（已经算进台面的缩放）
  // 一个可以改的目标：实体 id、两个属性名（kx、ky）、原来的值、允许的范围
  function tgt(id, kx, ky) {
    const e = UI.S.scene.entities[id], P = U.types[e.type].props;
    const rg = (k) => [P[k] && P[k].min !== undefined ? P[k].min : -1e9, P[k] && P[k].max !== undefined ? P[k].max : 1e9];
    const a = rg(kx), b = rg(ky);
    return { id, kx, ky, x0: e.props[kx], y0: e.props[ky], lo: [a[0], b[0]], hi: [a[1], b[1]] };
  }
  // 一个图形的编辑信息：kind、实体、顶点（自由点的 id）、边（顶点下标对）。不能直接改的返回 null
  function figInfo(v) {
    const E = UI.S.scene.entities, ent = E[v.id], f = v.fig;
    if (!ent || !f) return null;
    if (ent.type === 'gpiece') return { kind: 'piece', ent, f, verts: [], edges: [] };
    if (ent.type === 'gplace') return { kind: 'place', ent, f, verts: [], edges: [] };
    if (ent.type === 'gpt' && f.type === 'point') return { kind: 'pts', ent, f, verts: [ent.id], edges: [] };
    if (f.type !== 'polygon' && f.type !== 'segment') return null;
    const srcs = uniq(UI.S.scene.links.filter((l) => l.to === ent.id && E[l.from] && E[l.from].type === 'gpt').map((l) => l.from));
    const verts = [];
    for (const p of f.pts) {
      const g = srcs.find((id) => Q.eq(Q(E[id].props.x), p.x) && Q.eq(Q(E[id].props.y), p.y));
      if (!g) return null;
      verts.push(g);
    }
    const n = verts.length, edges = f.type === 'polygon' ? verts.map((_, i) => [i, (i + 1) % n]) : [[0, 1]];
    return { kind: 'pts', ent, f, verts, edges };
  }
  function figByName(wsId, name) {
    const ws = UI.S.scene.entities[wsId]; if (!ws || !name) return null;
    const v = wsVisible(ws).find((x) => pickOf(x) === name); return v ? figInfo(v) : null;
  }
  const moveTargets = (fi) => (fi.kind === 'place' ? [tgt(fi.ent.id, 'dx', 'dy')] : uniq(fi.verts).map((g) => tgt(g, 'x', 'y')));

  // ---- 对齐线与吸附（§10.5.8 C12–C15）----
  // 拖动整块、顶点或边时：先找吸附的整数平移量（顶点重合优先，其次各方向的顶点对齐、坐标轴、两条竖直或水平的边共线），
  // 阈值是屏幕上的 6 像素；再按最终坐标算出精确成立的关系，画成参考线，旁边写关系。Alt 按住时不吸附、不画参考线。
  // 自由点只存整数，拖动量本来就取整，所以吸附到整数目标时结果和取整一样；只有非整数的目标不吸附（见报告）。
  const ALIGN_PX = 6, GUIDE_COL = '#0891b2';
  const cr2 = (u, w) => Q.sub(Q.mul(u.x, w.y), Q.mul(u.y, w.x));
  const dt2 = (u, w) => Q.add(Q.mul(u.x, w.x), Q.mul(u.y, w.y));
  const vsb = (a, b) => ({ x: Q.sub(a.x, b.x), y: Q.sub(a.y, b.y) });
  const numP = (p) => ({ x: Q.num(p.x), y: Q.num(p.y) });
  const rnd = (v) => Q(Math.round(v) || 0);
  const pdist = (p, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy, t = L ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L)) : 0; return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy); };
  const gapSeg = (a, b, c, d) => Math.min(pdist(a, c, d), pdist(b, c, d), pdist(c, a, b), pdist(d, a, b));
  const edgesOf = (f) => (f.type === 'polygon' ? f.pts.map((_, k) => [k, (k + 1) % f.pts.length]) : f.type === 'segment' ? [[0, 1]] : []);
  const gptPt = (id) => { const e = UI.S.scene.entities[id]; return { x: Q(e.props.x), y: Q(e.props.y) }; };
  // 拖动前准备：动点（拖动开始时的精确坐标）、动点之间的边（下标对），其余的顶点和边（动点本身和 exclude 指的图形不算）。名字用学生看到的
  function buildAlign(ws, base, edges, ids, exclude) {
    const names = wsNames(), O = [], OE = [];
    for (const v of wsVisible(ws)) {
      if (exclude && exclude(v)) continue;
      const fi = figInfo(v), pts = v.fig.pts || [], vid = fi && fi.kind === 'pts' ? fi.verts : null;
      const gid = (k) => (vid ? vid[k] : null), mv = (k) => { const g = gid(k); return !!g && ids.includes(g); };
      const nm = (k) => { const g = gid(k); return g && names[g + '.p'] ? names[g + '.p'] : null; };
      pts.forEach((p, k) => { if (!mv(k)) O.push({ p, name: nm(k) || v.label + '的顶点' }); });
      const n = pts.length, es = v.fig.type === 'polygon' ? pts.map((_, k) => [k, (k + 1) % n]) : v.fig.type === 'segment' ? [[0, 1]] : [];
      for (const [a, b] of es) {
        if (mv(a) || mv(b)) continue;
        OE.push({ a: pts[a], b: pts[b], name: nm(a) && nm(b) ? nm(a) + nm(b) : v.label + '的边' });
      }
    }
    return { base, edges, ids, others: O, oedges: OE, alt: false };
  }
  // 整个图形（自由点围成的，或摆放出来的）的对齐准备
  function alignOfFig(wsId, fi) {
    const ws = UI.S.scene.entities[wsId], ex = (v) => v.id === fi.ent.id;
    if (fi.kind === 'place') return buildAlign(ws, fi.f.pts, edgesOf(fi.f), [], ex);
    const ids = uniq(fi.verts), base = ids.map((g) => gptPt(g));
    const edges = fi.edges.map(([a, b]) => [ids.indexOf(fi.verts[a]), ids.indexOf(fi.verts[b])]);
    return buildAlign(ws, base, edges, ids, ex);
  }
  // 求吸附后的整数平移 {dx, dy}（Tc 是没有取整的拖动量，单位是坐标单位），以及精确成立的参考线 guides
  function alignSolve(al, Tc, unit) {
    const B = al.base, O = al.others, OE = al.oedges, guides = [];
    const pxd = (a, b) => UI.Space.unitsToPx(Math.hypot(a, b), unit);
    let T = null;
    if (!al.alt) {
      // 1. 顶点重合：两个方向都对上（目标的坐标是整数才行），阈值内取最近的
      let bc = null;
      for (const b of B) for (const v of O) {
        const tx = Q.sub(v.p.x, b.x), ty = Q.sub(v.p.y, b.y);
        if (!Q.isInt(tx) || !Q.isInt(ty)) continue;
        const d = pxd(Q.num(tx) - Tc.x, Q.num(ty) - Tc.y);
        if (d <= ALIGN_PX && (!bc || d < bc.d)) bc = { d, x: tx, y: ty };
      }
      if (bc) T = { x: bc.x, y: bc.y };
      else {
        // 2. 单方向：顶点同一竖线 / 横线、坐标轴、竖直（水平）的边共线；每个方向取最近的
        const cx = [], cy = [];
        const add = (L, val, d) => { if (Q.isInt(val) && d <= ALIGN_PX) L.push({ val, d }); };
        for (const b of B) {
          for (const v of O) {
            const vx = Q.sub(v.p.x, b.x), vy = Q.sub(v.p.y, b.y);
            add(cx, vx, UI.Space.unitsToPx(Math.abs(Q.num(vx) - Tc.x), unit));
            add(cy, vy, UI.Space.unitsToPx(Math.abs(Q.num(vy) - Tc.y), unit));
          }
          add(cx, Q.neg(b.x), UI.Space.unitsToPx(Math.abs(-Q.num(b.x) - Tc.x), unit));   // 纵轴 x = 0
          add(cy, Q.neg(b.y), UI.Space.unitsToPx(Math.abs(-Q.num(b.y) - Tc.y), unit));   // 横轴 y = 0
        }
        for (const [i, j] of al.edges) {
          const a = B[i], b = B[j];
          for (const o of OE) {
            if (Q.eq(a.x, b.x) && Q.eq(o.a.x, o.b.x)) add(cx, Q.sub(o.a.x, a.x), UI.Space.unitsToPx(Math.abs(Q.num(Q.sub(o.a.x, a.x)) - Tc.x), unit));
            if (Q.eq(a.y, b.y) && Q.eq(o.a.y, o.b.y)) add(cy, Q.sub(o.a.y, a.y), UI.Space.unitsToPx(Math.abs(Q.num(Q.sub(o.a.y, a.y)) - Tc.y), unit));
          }
        }
        const pick = (L) => L.reduce((m, c) => (!m || c.d < m.d ? c : m), null);
        const px = pick(cx), py = pick(cy);
        T = { x: px ? px.val : rnd(Tc.x), y: py ? py.val : rnd(Tc.y) };
      }
    }
    if (!T) T = { x: rnd(Tc.x), y: rnd(Tc.y) };   // Alt 或者没有吸附：和原来一样取整
    if (!al.alt) {
      // 3. 参考线：只画精确成立的关系（不管是不是吸附来的）；同一条线只画一次，最多 8 条
      const P = al.base.map((b) => ({ x: Q.add(b.x, T.x), y: Q.add(b.y, T.y) }));
      const seen = new Set(), add = (k, g) => { if (!seen.has(k) && guides.length < 8) { seen.add(k); guides.push(g); } };
      P.forEach((p, i) => {
        const at = numP(p);
        for (const v of O) {
          const sx = Q.eq(p.x, v.p.x), sy = Q.eq(p.y, v.p.y);
          if (sx && sy) add('pt' + at.x + ',' + at.y, { k: 'pt', x: at.x, y: at.y, at, text: '顶点重合' });
          else if (sx) add('vx' + at.x, { k: 'vl', x: at.x, at, text: '和 ' + v.name + ' 同一竖线' });
          else if (sy) add('hy' + at.y, { k: 'hl', y: at.y, at, text: '和 ' + v.name + ' 同一横线' });
        }
        if (Q.eq(p.x, Q(0))) add('ax' + at.x, { k: 'vl', x: 0, at, text: '在纵轴上' });
        if (Q.eq(p.y, Q(0))) add('ay' + at.y, { k: 'hl', y: 0, at, text: '在横轴上' });
        // 格点：整数位置，而且拖动的鼠标本来就离这个格点很近
        const bn = al.base[i], cx0 = Q.num(bn.x) + Tc.x, cy0 = Q.num(bn.y) + Tc.y;
        if (Q.isInt(p.x) && Q.isInt(p.y) && pxd(cx0 - at.x, cy0 - at.y) <= ALIGN_PX) add('gp' + at.x + ',' + at.y, { k: 'pt', x: at.x, y: at.y, at, text: '格点' });
      });
      for (const [i, j] of al.edges) {
        const ea = P[i], eb = P[j], u = vsb(eb, ea), A = numP(ea), Bp = numP(eb), mid = { x: (A.x + Bp.x) / 2, y: (A.y + Bp.y) / 2 };
        if (Q.eq(u.x, Q(0)) && Q.eq(u.y, Q(0))) continue;
        for (const o of OE) {
          const w = vsb(o.b, o.a), oa = numP(o.a), ob = numP(o.b), key = oa.x + ',' + oa.y + ',' + ob.x + ',' + ob.y;
          if (Q.eq(w.x, Q(0)) && Q.eq(w.y, Q(0))) continue;
          const c = cr2(u, w), near = UI.Space.unitsToPx(gapSeg(A, Bp, oa, ob), unit) <= ALIGN_PX;
          if (Q.eq(c, Q(0))) {
            if (Q.eq(cr2(u, vsb(o.a, ea)), Q(0))) add('ln' + key, { k: 'ln', a: oa, b: ob, at: mid, text: '和 ' + o.name + ' 共线' });
            else if (near) add('ln' + key, { k: 'ln', a: oa, b: ob, at: mid, text: '和 ' + o.name + ' 平行' });
          } else if (near && Q.eq(dt2(u, w), Q(0))) add('ln' + key, { k: 'ln', a: oa, b: ob, at: mid, text: '和 ' + o.name + ' 垂直' });
        }
      }
      // 等距：一个动点到另外两个不同的顶点距离相等（精确相等才算）
      const d2 = (p, q) => { const dx = Q.sub(p.x, q.x), dy = Q.sub(p.y, q.y); return Q.add(Q.mul(dx, dx), Q.mul(dy, dy)); };
      for (const p of P) {
        let n = 0;
        for (let a = 0; a < O.length && n < 1; a++) for (let b = a + 1; b < O.length && n < 1; b++) {
          if (O[a].name === O[b].name) continue;
          const d1 = d2(p, O[a].p), e2 = d2(p, O[b].p);
          if (Q.eq(d1, Q(0)) || !Q.eq(d1, e2)) continue;
          add('eq' + numP(p).x + ',' + numP(p).y + O[a].name + O[b].name, { k: 'seg2', a: numP(O[a].p), b: numP(O[b].p), at: numP(p), text: '与 ' + O[a].name + '、' + O[b].name + ' 等距' });
          n++;
        }
      }
    }
    return { dx: Q.num(T.x), dy: Q.num(T.y), guides };
  }
  // 参考线：细虚线画在工作区里，旁边写关系（labs 里 prio 为 -1，先摆位置）
  const gline = (x0, y0, x1, y1) => '<line class="wsguide" x1="' + x0.toFixed(1) + '" y1="' + y0.toFixed(1) + '" x2="' + x1.toFixed(1) + '" y2="' + y1.toFixed(1) + '" stroke="' + GUIDE_COL + '" stroke-width="1.2" stroke-dasharray="5 3" pointer-events="none"/>';
  function guidesSvg(gs, fr, labs) {
    const { X, Y, w, h } = fr; let s = '';
    for (const g of gs) {
      const ax = X(g.at.x), ay = Y(g.at.y);
      if (g.k === 'vl') s += gline(X(g.x), 0, X(g.x), h);
      else if (g.k === 'hl') s += gline(0, Y(g.y), w, Y(g.y));
      else if (g.k === 'ln') { const x0 = X(g.a.x), y0 = Y(g.a.y), x1 = X(g.b.x), y1 = Y(g.b.y), dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, K = (w + h) / L; s += gline(x0 - dx * K, y0 - dy * K, x1 + dx * K, y1 + dy * K); }
      else if (g.k === 'seg2') s += gline(X(g.a.x), Y(g.a.y), X(g.b.x), Y(g.b.y)) + gline(ax, ay, X(g.a.x), Y(g.a.y)) + gline(ax, ay, X(g.b.x), Y(g.b.y));
      s += '<circle class="wsguide" cx="' + ax.toFixed(1) + '" cy="' + ay.toFixed(1) + '" r="' + (g.k === 'pt' ? 6 : 3) + '" fill="' + (g.k === 'pt' ? 'none' : GUIDE_COL) + '" stroke="' + GUIDE_COL + '" stroke-width="2" pointer-events="none"/>';
      const tw = TXT_W(g.text);
      labs.push({ text: g.text, c: GUIDE_COL, cands: [[ax + 8, ay - 8], [ax + 8, ay + 16], [ax - tw - 8, ay - 8], [ax - tw - 8, ay + 16]], prio: -1 });
    }
    return s;
  }
  // 拼合判定（和「对齐到目标」用同一个 U.Geo.assemble）：工作区里的块拼成了目标图形，块的边线就变绿
  function fitState(ws) {
    const S = UI.S, tg = wsValues(ws, wsNames()).find((v) => isTarget(S.scene.entities[v.id]));
    const pcs = wsKids(ws).filter((k) => k.type === 'gpiece');
    if (!tg || !tg.fig || !pcs.length) return null;
    const figs = pcs.map((k) => S.D[k.id] && S.D[k.id].out.f && S.D[k.id].out.f.data);
    if (figs.some((f) => !f) || !U.Geo.assemble(figs, tg.fig).ok) return null;
    return { ids: pcs.map((k) => k.id), flash: !!(S.wsFit && S.wsFit.ws === ws.id && Date.now() < S.wsFit.until) };
  }
  // 开始一次图形拖动（tr 平移、sc 放缩、rot 旋转、pscale 块放缩、prot 块旋转、lrot 摆放的旋转）。
  // 拖动时只改实体的属性做预览，松手时还原，再把整段拖动记成一步（shapeUp）。坐标范围在拖动开始时冻结。
  function startShape(ev, wb, wsId, mode, targets, extra) {
    const S = UI.S, ws = S.scene.entities[wsId]; if (!ws) return;
    const fr = wsFrame(ws, +wb.getAttribute('width'), +wb.getAttribute('height'));
    UI.State.setUi(ws, 'view', fr.vw);
    const sc = UI.Space.canvasOf(wb.getBoundingClientRect(), fr.vw.span);
    drag = Object.assign({ kind: 'shape', mode, wsId, v: fr.vw, sc, unit: sc.unit, sx: ev.clientX, sy: ev.clientY, start: UI.Space.screenToWorkspace(ev, fr.vw, sc), targets, moved: false, out: [], f: Q(1), k: 0, guides: [] }, extra || {});
  }
  // 按下一个把手：边（整条边平移）、角（放缩）、旋转把手
  function startHandle(hd, ev) {
    const S = UI.S, wb = hd.closest('.wsbody'), wsId = wb.dataset.wsid, kind = hd.dataset.hdl;
    if (kind === 'edge') {
      if (hd.dataset.pick) wsPick(hd.dataset.pick, ev.shiftKey);
      const gids = uniq(hd.dataset.gids.split(','));
      startShape(ev, wb, wsId, 'tr', gids.map((g) => tgt(g, 'x', 'y')), { align: buildAlign(S.scene.entities[wsId], gids.map((g) => gptPt(g)), gids.length > 1 ? [[0, 1]] : [], gids, null) });
      render(); return;
    }
    const name = (S.wsSel || []).length === 1 ? S.wsSel[0] : null, fi = name ? figByName(wsId, name) : null;
    if (!fi || !fi.f.pts) return;
    const pts = fi.f.pts, qb = { x0: minQ(pts.map((p) => p.x)), x1: maxQ(pts.map((p) => p.x)), y0: minQ(pts.map((p) => p.y)), y1: maxQ(pts.map((p) => p.y)) };
    const polyLike = fi.kind === 'pts' && fi.f.type !== 'point';
    if (kind === 'corner') {
      const corner = +hd.dataset.corner;
      if (fi.kind === 'piece') return startShape(ev, wb, wsId, 'pscale', [], { id: fi.ent.id, s0: fi.ent.props.scale, qb, corner });
      if (polyLike) return startShape(ev, wb, wsId, 'sc', uniq(fi.verts).map((g) => tgt(g, 'x', 'y')), { qb, corner });
      return;
    }
    if (kind === 'rot') {
      const cf = { x: (Q.num(qb.x0) + Q.num(qb.x1)) / 2, y: (Q.num(qb.y0) + Q.num(qb.y1)) / 2 };
      const c = polyLike ? { x: Math.round(cf.x), y: Math.round(cf.y) } : cf;   // 图形的旋转中心取整数，旋转后仍然是整数坐标
      if (fi.kind === 'piece') return startShape(ev, wb, wsId, 'prot', [], { id: fi.ent.id, t0: fi.ent.props.turn, c, qb });
      if (fi.kind === 'place') return startShape(ev, wb, wsId, 'lrot', [], { id: fi.ent.id, t0: fi.ent.props.turn, c, qb });
      if (polyLike) return startShape(ev, wb, wsId, 'rot', uniq(fi.verts).map((g) => tgt(g, 'x', 'y')), { c, qb });
    }
  }
  // 拖动中：只改预览（实体属性），重算一次，只重画工作区
  function shapeMove(ev) {
    const S = UI.S, d = drag, E = S.scene.entities;
    const mx = ev.clientX - d.sx, my = ev.clientY - d.sy;
    if (!d.moved && Math.hypot(mx, my) < L.DRAG_SLOP) return;
    d.moved = true;
    const wp = UI.Space.screenToWorkspace(ev, d.v, d.sc), out = [];
    const put = (id, k, v) => { E[id].props[k] = v; out.push({ id, k, v }); };
    let tip = '';
    if (d.mode === 'tr') {
      let dX = Math.round(UI.Space.pxToUnits(mx, d.unit)), dY = -Math.round(UI.Space.pxToUnits(my, d.unit)), lx = -Infinity, hx = Infinity, ly = -Infinity, hy = Infinity;
      if (d.align) { d.align.alt = !!ev.altKey; const s = alignSolve(d.align, { x: UI.Space.pxToUnits(mx, d.unit), y: -UI.Space.pxToUnits(my, d.unit) }, d.unit); dX = s.dx; dY = s.dy; d.guides = s.guides; }
      for (const t of d.targets) { lx = Math.max(lx, t.lo[0] - t.x0); hx = Math.min(hx, t.hi[0] - t.x0); ly = Math.max(ly, t.lo[1] - t.y0); hy = Math.min(hy, t.hi[1] - t.y0); }
      dX = Math.max(lx, Math.min(hx, dX)); dY = Math.max(ly, Math.min(hy, dY));
      for (const t of d.targets) { put(t.id, t.kx, t.x0 + dX); put(t.id, t.ky, t.y0 + dY); }
      tip = dX || dY ? '向右 ' + dX + ' 格，向上 ' + dY + ' 格' : '';
    } else if (d.mode === 'sc' || d.mode === 'pscale') {
      // 放缩：以对角为中心（按住 Alt 以中心为准）；比例吸附到 1/2、2/3、1、3/2、2、3，并且结果要是整数坐标
      const qb = d.qb, cs = [[qb.x0, qb.y0], [qb.x1, qb.y0], [qb.x1, qb.y1], [qb.x0, qb.y1]];
      const A = ev.altKey ? { x: Q.div(Q.add(qb.x0, qb.x1), Q(2)), y: Q.div(Q.add(qb.y0, qb.y1), Q(2)) } : { x: cs[(d.corner + 2) % 4][0], y: cs[(d.corner + 2) % 4][1] };
      const ax = Q.num(A.x), ay = Q.num(A.y), v0x = Q.num(cs[d.corner][0]) - ax, v0y = Q.num(cs[d.corner][1]) - ay, den = v0x * v0x + v0y * v0y;
      if (!den) return;
      const tp = ((wp.x - ax) * v0x + (wp.y - ay) * v0y) / den;
      const order = SCALES.slice().sort((a, b) => Math.abs(Q.num(a) - tp) - Math.abs(Q.num(b) - tp));
      let pick = null;
      for (const f of order) {
        if (d.mode === 'pscale') { pick = { f, nv: [] }; break; }
        const nv = d.targets.map((t) => ({ t, x: Q.add(A.x, Q.mul(f, Q.sub(Q(t.x0), A.x))), y: Q.add(A.y, Q.mul(f, Q.sub(Q(t.y0), A.y))) }));
        if (nv.every((v) => Q.isInt(v.x) && Q.isInt(v.y))) { pick = { f, nv }; break; }
      }
      if (pick) {
        d.f = pick.f;
        if (d.mode === 'sc') for (const v of pick.nv) { put(v.t.id, v.t.kx, Q.num(v.x)); put(v.t.id, v.t.ky, Q.num(v.y)); }
        else E[d.id].props.scale = Q.show(Q.mul(Q.parse(d.s0), pick.f));
        tip = '放缩 ' + Q.show(pick.f) + ' 倍';
      } else tip = '这个比例会得到分数坐标（自由点只存整数），先不动';
    } else if (d.mode === 'rot' || d.mode === 'prot' || d.mode === 'lrot') {
      // 旋转：角度吸附到 90°，逆时针为正（和摆放器材的 turn 一致）
      const c = d.c, th0 = Math.atan2(d.start.y - c.y, d.start.x - c.x), th = Math.atan2(wp.y - c.y, wp.x - c.x);
      const k = Math.round((th - th0) / (Math.PI / 2));
      d.k = k;
      if (d.mode === 'rot') {
        for (const t of d.targets) {
          let x = t.x0, y = t.y0;
          for (let i = 0; i < modT(k); i++) { const dx = x - c.x, dy = y - c.y; x = c.x - dy; y = c.y + dx; }
          put(t.id, t.kx, x); put(t.id, t.ky, y);
        }
      } else E[d.id].props.turn = modT(d.t0 + k);
      tip = '转 ' + k * 90 + '°';
    }
    d.out = out;
    S.D = W.evaluate(S.scene);
    wsRedraw(d.wsId);
    if (tip) showTip(ev.clientX, ev.clientY, tip, true);
  }
  // 松手：先把预览还原，再把这一次拖动记成一步（一次 set 或一次块的动作，撤销就回到拖之前）
  function shapeUp(d) {
    const E = UI.S.scene.entities;
    showTip(0, 0, '');
    const orig = {};
    for (const t of d.targets) { orig[t.id + '|' + t.kx] = t.x0; orig[t.id + '|' + t.ky] = t.y0; E[t.id].props[t.kx] = t.x0; E[t.id].props[t.ky] = t.y0; }
    if (d.id && E[d.id]) { if (d.s0 !== undefined) E[d.id].props.scale = d.s0; if (d.t0 !== undefined) E[d.id].props.turn = d.t0; }
    if (!d.moved) return render();
    const last = {};
    for (const o of d.out) last[o.id + '|' + o.k] = o;
    const list = Object.values(last).filter((o) => o.v !== orig[o.id + '|' + o.k]).map((o) => ({ id: o.id, k: o.k, v: o.v }));
    if (d.mode === 'pscale' && d.f && !Q.eq(d.f, Q(1))) list.push({ id: d.id, what: 'scale', value: Q.show(d.f) });
    if (d.mode === 'prot' && d.k % 4) list.push({ id: d.id, what: 'turn', value: d.k });
    if (d.mode === 'lrot' && modT(d.t0 + d.k) !== d.t0) list.push({ id: d.id, k: 'turn', v: modT(d.t0 + d.k) });
    if (list.length) UI.Intent.run('params', { ops: list }); else render();
  }
  // 左右翻、上下翻（浮动工具条）：一次一步
  function figFlip(wsId, name, v) {
    const fi = figByName(wsId, name); if (!fi) return;
    if (fi.kind === 'piece') return UI.Intent.run('piece', { ids: [fi.ent.id], what: 'flip', value: v });
    const id = fi.ent.id;
    if (fi.kind === 'place') {
      // 摆放的状态是「先翻、再转」：翻转和转动的复合，按 F_v 与 R^t 的关系算出新状态（翻转和转动互相颠倒方向）
      const cur = fi.ent.props.flip, t0 = fi.ent.props.turn;
      const st = cur === v ? { flip: 0, turn: modT(-t0) } : cur === 0 ? { flip: v, turn: modT(-t0) } : { flip: 0, turn: modT(2 - t0) };
      return UI.Intent.run('params', { ops: [{ id, k: 'flip', v: st.flip }, { id, k: 'turn', v: st.turn }] });
    }
    if (fi.kind === 'pts' && fi.f.type !== 'point') {
      const q = v === 1 ? 'x' : 'y', pts = fi.f.pts, mn = minQ(pts.map((p) => p[q])), mx = maxQ(pts.map((p) => p[q]));
      const list = uniq(fi.verts).map((g) => ({ id: g, k: q, v: Q.num(Q.sub(Q.add(mn, mx), Q(UI.S.scene.entities[g].props[q]))) }));
      return UI.Intent.run('params', { ops: list });
    }
  }
  // 画布（工作区的 svg）重画：拖动和画线时只动这一块，不重画台面
  function wsRedraw(id) {
    const ws = UI.S.scene.entities[id]; if (!ws) return;
    document.querySelectorAll('svg.wsbody[data-wsid="' + id + '"]').forEach((sv) => { sv.innerHTML = wsBody(ws, +sv.getAttribute('width'), +sv.getAttribute('height')); });
  }
  // 选中一个图形时，它旁边的浮动工具条的位置（卡片里的坐标）
  function figFloat(ws, w, h) {
    const S = UI.S; if ((S.wsSel || []).length !== 1) return null;
    const name = S.wsSel[0], fr = wsFrame(ws, w, h), v = fr.vals.find((x) => pickOf(x) === name), fi = v && figInfo(v);
    if (!fi || !fi.f.pts || (fi.kind === 'pts' && fi.f.type === 'point')) return null;
    const xs = fi.f.pts.map((p) => Q.num(p.x)), ys = fi.f.pts.map((p) => Q.num(p.y));
    return { name, left: fr.X((Math.min(...xs) + Math.max(...xs)) / 2), top: Math.min(fr.Y(Math.min(...ys)) + L.FLOAT.dy, h - L.FLOAT.h) };   // 浮动工具条放在图形的下面（画布里面），不盖住标题和步数
  }
  function floatHtml(wsId, f, ox, oy) {
    const left = Math.max(L.FLOAT.edge, ox + f.left - L.FLOAT.halfW), top = Math.max(oy + L.FLOAT.top, oy + f.top), nm = escA(f.name);
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
      const fi = figInfo(v); if (!fi || !fi.f.pts || fi.kind !== 'pts' || fi.f.type === 'point') continue;
      const pts = fi.f.pts;
      fi.edges.forEach(([a, b]) => {
        const ga = fi.verts[a], gb = fi.verts[b]; if (ga === gb) return;
        g += '<line x1="' + X(Q.num(pts[a].x)).toFixed(1) + '" y1="' + Y(Q.num(pts[a].y)).toFixed(1) + '" x2="' + X(Q.num(pts[b].x)).toFixed(1) + '" y2="' + Y(Q.num(pts[b].y)).toFixed(1) + '" stroke="transparent" stroke-width="12" data-hdl="edge" data-gids="' + ga + ',' + gb + '" data-pick="' + escA(pickOf(v)) + '" style="cursor:move"/>';
      });
    }
    return g;
  }
  function wsHandles(fr) {
    const S = UI.S, sel = (S.wsSel || []).length === 1 ? S.wsSel[0] : null, X = fr.X, Y = fr.Y;
    const shown = new Set(fr.vals.filter((v) => v.fig && v.fig.type === 'point').map((v) => v.id));
    let g = '';
    fr.vals.forEach((v, i) => {
      const fi = figInfo(v); if (!fi || !fi.f.pts) return;
      const col = WS_COL[i % WS_COL.length], on = !!sel && pickOf(v) === sel, pts = fi.f.pts, isPt = fi.kind === 'pts' && fi.f.type === 'point';
      // 顶点：是自由点、又没有单独画出来的，画一个把手（拖动改它的 x、y）；已经画出来的点自己就是把手
      if (fi.kind === 'pts' && !isPt) pts.forEach((p, k) => { if (shown.has(fi.verts[k])) return; g += '<circle data-drag="' + fi.verts[k] + '" data-kx="x" data-ky="y" cx="' + X(Q.num(p.x)) + '" cy="' + Y(Q.num(p.y)) + '" r="4.5" fill="#fff" stroke="' + col + '" stroke-width="2" style="cursor:grab"/>'; });
      if (!on || isPt) return;
      const xs = pts.map((p) => Q.num(p.x)), ys = pts.map((p) => Q.num(p.y));
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      if (fi.kind === 'piece' || fi.kind === 'pts') {
        [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].forEach(([x, y], k) => {
          g += '<rect data-hdl="corner" data-corner="' + k + '" x="' + (X(x) - 5).toFixed(1) + '" y="' + (Y(y) - 5).toFixed(1) + '" width="10" height="10" fill="#fff" stroke="' + col + '" stroke-width="2" style="cursor:nwse-resize"/>';
        });
      }
      const cx = X((x0 + x1) / 2), ty = Math.max(12, Y(y1) - 28);   // 把手留在画布里面（画布外面会被卡片的标题盖住）
      g += '<line x1="' + cx.toFixed(1) + '" y1="' + Y(y1).toFixed(1) + '" x2="' + cx.toFixed(1) + '" y2="' + ty.toFixed(1) + '" stroke="' + col + '" stroke-dasharray="3 3"/>';
      g += '<circle data-hdl="rot" cx="' + cx.toFixed(1) + '" cy="' + ty.toFixed(1) + '" r="7" fill="#fff" stroke="' + col + '" stroke-width="2.5" style="cursor:grab"/>';
    });
    return g;
  }
  // ---- 工作区里两下画线（§10.5.8 B11）----
  function endDraw() { const S = UI.S; if (S.wsDraw) { S.wsDraw = null; S.wsMsg = ''; render(); } }
  function drawMode(wsId, tool) {
    const S = UI.S, D = S.wsDraw;
    if (D && D.ws === wsId && D.tool === tool) return endDraw();
    S.wsDraw = { ws: wsId, tool, pend: null, cur: null }; S.wsMsg = '';
    if (tool === 'seg') S.wsSel = [];
    render();
  }
  // 吸附：算法在 UI.Space.snap（顶点、边上的格点、格点）；这里只告诉它每个顶点属于哪个自由点
  function snapTo(fr, wp, sc) {
    return UI.Space.snap(fr.vals, wp, sc.unit, { px: SNAP_PX, ref: (v, i) => { const fi = figInfo(v); return fi && fi.kind === 'pts' && fi.verts[i] ? fi.verts[i] : null; } });
  }
  function drawClick(wb, ev) {
    const S = UI.S, D = S.wsDraw, ws = S.scene.entities[D.ws];
    if (!ws) return endDraw();
    const fr = wsFrame(ws, +wb.getAttribute('width'), +wb.getAttribute('height'));
    if (!UI.State.viewOf(ws)) UI.State.setUi(ws, 'view', fr.vw);   // 画线时坐标范围冻结
    const sc = UI.Space.canvasOf(wb.getBoundingClientRect(), fr.vw.span), sp = snapTo(fr, UI.Space.screenToWorkspace(ev, fr.vw, sc), sc);
    if (!D.pend) { D.pend = sp; D.cur = sp; S.wsMsg = ''; return wsRedraw(D.ws); }
    const a = D.pend; D.pend = null; D.cur = null;
    finishLine(D, a, sp);
  }
  function drawHover(ev) {
    const S = UI.S, D = S.wsDraw, ws = S.scene.entities[D.ws];
    const wb = [...document.querySelectorAll('svg.wsbody[data-wsid="' + D.ws + '"]')].find((el) => { const r = el.getBoundingClientRect(); return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom; });
    if (!ws || !wb) return;
    const fr = wsFrame(ws, +wb.getAttribute('width'), +wb.getAttribute('height')), sc = UI.Space.canvasOf(wb.getBoundingClientRect(), fr.vw.span);
    D.cur = snapTo(fr, UI.Space.screenToWorkspace(ev, fr.vw, sc), sc); wsRedraw(D.ws);
  }
  // 两个点都定了：建点（不是顶点的才建）、建线段；剪的模式再建剪刀、剪开。整串是一步
  function finishLine(D, a, b) {
    const S = UI.S, ws = S.scene.entities[D.ws];
    if (!ws) return endDraw();
    if (a.x === b.x && a.y === b.y) { setMsg('两个点不能重合', false); return render(); }
    let cut = null;
    const seg = { type: 'segment', pts: [{ x: Q(a.x), y: Q(a.y) }, { x: Q(b.x), y: Q(b.y) }] };
    if (D.tool === 'cut') {
      const sel = S.wsSel || [], pr = sel.length === 1 ? resolvePick(sel[0]) : null;
      if (!pr || typeof pr === 'string' || !pr.value || pr.value.data.type !== 'polygon') { setMsg('剪需要先选一个多边形，再画一条线', false); return render(); }
      const g = U.GeoRules.run('geo.cut', { f: pr.value.data, line: seg }, {});
      if (!g.ok) { setMsg(g.why, false); return render(); }
      cut = pr;
    }
    const r = UI.Intent.run('draw', { ws: ws.id, a, b, cut });
    D.pend = null; D.cur = null;
    if (r.ok) { S.wsSel = []; S.wsMsg = ''; } else setMsg(r.why, false);
    render();
  }

  function onDown(ev) {
    const S = UI.S, t = ev.target;
    if (t.closest('.tool') || t.closest('.wsx') || t.closest('.wsx-float')) return;   // 工作区底下的面板：让浏览器照常处理按钮和输入框
    // 超出范围的图形的箭头：点一下，范围调到它
    const arr = t.closest('[data-fit-key]');
    if (arr) { ev.preventDefault(); ev.stopPropagation(); wsFit(arr.dataset.fitWs, arr.dataset.fitKey); return; }
    // 专注浮层：标题双击还原；浮层里的画布和台面没有关系，照常往下处理
    const fo = t.closest('#wsfocus');
    if (fo && !t.closest('.wsbody')) { if (t.closest('.wsf-hd') && !t.closest('button') && dbl('focus-hd')) setFocus(null); return; }
    // 工作区里画线（点两下）；把手：边、角、旋转
    const wbd = t.closest('.wsbody');
    if (S.wsDraw && wbd && wbd.dataset.wsid === S.wsDraw.ws) {
      // 剪的模式：没有在画线的时候，点图形的线是选图形（方便先选好要剪的那一块）
      if (S.wsDraw.tool === 'cut' && !S.wsDraw.pend && /^(path|line)$/i.test(t.tagName) && t.closest('[data-pick]')) { wsPick(t.closest('[data-pick]').dataset.pick, ev.shiftKey); return render(); }
      ev.preventDefault(); ev.stopPropagation(); drawClick(wbd, ev); return;
    }
    const hd = t.closest('[data-hdl]');
    if (hd && wbd) { ev.preventDefault(); ev.stopPropagation(); startHandle(hd, ev); return; }
    // 卡片右下角的拖柄：拖动改大小；双击恢复默认大小（一次 act，可以撤销）
    const rz = t.closest('.rz');
    if (rz) {
      if (dbl('rz:' + rz.dataset.rz)) { S.sel = rz.dataset.rz; UI.Intent.run('resize', { id: rz.dataset.rz, w: null, h: null }); return; }
      startResize(rz.dataset.rz, ev); return;
    }
    // 工作区里选中对象（点、线、图形）：Shift 点是加选
    const pk = t.closest('[data-pick]');
    if (pk) wsPick(pk.dataset.pick, ev.shiftKey);
    // 自由点（工作区里的点、多边形的顶点）：直接拖动，改的是那个自由点的 x、y（格点吸附，范围内）；块走块的拖动
    const gh = t.closest('[data-drag]');
    if (gh) {
      const pe = S.scene.entities[gh.dataset.drag]; if (!pe) return;
      if (pe.type === 'gpiece') { pieceDown(pe, gh, pk, ev); return; }
      const gwb = gh.closest('.wsbody'); if (!gwb) return;
      ev.preventDefault(); ev.stopPropagation();
      startShape(ev, gwb, gwb.dataset.wsid, 'tr', [tgt(pe.id, gh.dataset.kx || 'x', gh.dataset.ky || 'y')], { align: buildAlign(UI.S.scene.entities[gwb.dataset.wsid], [gptPt(pe.id)], [], [pe.id], null) });
      if (pk) render();   // 选中状态变了，重画（拖动数据已经记下来了）
      return;
    }
    if (pk) {
      // 整个图形可以直接拖：自由点围成的图形整体平移（每个顶点各改一次 x、y，记成一步）；摆放出来的图形改 dx、dy
      const pwb = pk.closest('.wsbody'), fi = pwb && !ev.shiftKey ? figByName(pwb.dataset.wsid, pk.dataset.pick) : null;
      if (fi && (fi.kind === 'pts' || fi.kind === 'place')) { ev.preventDefault(); ev.stopPropagation(); startShape(ev, pwb, pwb.dataset.wsid, 'tr', moveTargets(fi), { align: alignOfFig(pwb.dataset.wsid, fi) }); }
      render(); return;
    }
    // 工作区的画布：点空白处取消选中，不移动工作区，也不平移台面
    // 工作区空白处拖动：平移这个工作区的坐标范围（不平移台面）；没有拖动就只是取消选中
    const wb = t.closest('.wsbody');
    if (wb) {
      const wid = wb.dataset.wsid, ws = S.scene.entities[wid], cw = +wb.getAttribute('width'), ch = +wb.getAttribute('height');
      if ((S.wsSel || []).length) { S.wsSel = []; render(); }
      if (ws) { const v0 = wsView(ws, cw, ch); drag = { kind: 'wspan', id: wid, sc: UI.Space.canvasOf(wb.getBoundingClientRect(), v0.span), sx: ev.clientX, sy: ev.clientY, moved: false, v0 }; }
      return;
    }
    const outp = t.closest('.port.out');
    if (outp) {
      ev.preventDefault();
      linking = { from: outp.dataset.id, fromPort: outp.dataset.port, cur: UI.Space.screenToStage(ev) };
      stageEl.setPointerCapture && 0; render(); return;
    }
    const ub = t.closest('[data-unlink]');
    if (ub) { S.selLink = null; UI.Intent.run('unlink', { id: ub.dataset.unlink }); return; }
    if (t.closest('[data-why]')) return;
    const lb = t.closest('[data-link]');
    if (lb) { S.selLink = lb.dataset.link; S.sel = null; UI.Panels.renderInsp(); render(); return; }
    const card = t.closest('.card');
    if (card) {
      const id = card.dataset.id; if (t.closest('.port')) return;
      const e = S.scene.entities[id];
      if (isWsDef(e.type)) {
        // 工作区：双击标题是专注模式（不开属性面板）
        if (t.closest('.hd') && dbl('hd:' + id)) { setFocus(id); return; }
      } else {
        const now = Date.now();
        if (lastClick.id === id && now - lastClick.t < 400) { S.inspOpen = true; lastClick = { id: null, t: 0 }; } else lastClick = { id, t: now };
      }
      S.sel = id; S.selLink = null;
      const w = UI.Space.screenToStage(ev);
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
  // 新加一张卡片放哪里：从想放的位置开始，往外一圈一圈找，找到和已有卡片（包括工作区底下的工具面板）都不重叠的空位
  function freeSpot(x, y, type) {
    const E = UI.S.scene.entities, d = U.types[type], sz = d && d.size ? d.size({ props: {} }) : L.DEFAULT_CARD, w = sz[0], h = sz[1];
    // 占地：卡片本身，加上工作区的面板（实测的尺寸和位置，见 UI.Layout.panelRect）
    const rects = [];
    for (const e of Object.values(E)) {
      if (e.parent) continue;
      const g = geom(e), P = L.CARD_PAD;
      rects.push({ x0: g.x - P, y0: g.y - P, x1: g.x + g.w + P, y1: g.y + g.h + P });
      if (isWsDef(e.type)) { const p = UI.Layout.panelRect(e.id, g); rects.push({ x0: p.x - P, y0: p.y - P, x1: p.x + p.w + P, y1: p.y + p.h + P }); }
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
    if (isWsDef(t.type) && !piece) {
      const g = geom(t); if (!UI.State.viewOf(t)) UI.State.setUi(t, 'view', wsView(t, g.w, g.h - HD));
      const wb = document.querySelector('svg.wsbody[data-wsid="' + t.id + '"]'), fr = wsFrame(t, g.w, g.h - HD);
      const pt = wb ? UI.Space.screenToWorkspace(ev, fr.vw, UI.Space.canvasOf(wb.getBoundingClientRect(), fr.vw.span)) : null;
      return { ws: t.id, x: pt ? pt.x : undefined, y: pt ? pt.y : undefined };
    }
    const accepting = slots.find((sn) => { const A = td.slots[sn].accepts; return A === '*' || A.includes(e.type); });
    const slot = piece ? accepting : (accepting || slots[0]);
    return slot ? { parent: t.id, slot } : null;
  }

  function onMove(ev) {
    const S = UI.S;
    if (linking) {
      linking.cur = UI.Space.screenToStage(ev);
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
    if (S.wsDraw && S.wsDraw.pend) drawHover(ev);
    if (!drag) return;
    if (drag.kind === 'piece') { pieceMove(ev); return; }
    if (drag.kind === 'shape') { shapeMove(ev); return; }
    if (drag.kind === 'rz') {
      const dx = ev.clientX - drag.sx, dy = ev.clientY - drag.sy;
      if (!drag.moved && Math.hypot(dx, dy) < 3) return;
      if (!drag.moved) { drag.moved = true; drag.before = UI.App.snapshot(); }
      const w = Math.max(MIN_W, Math.round(drag.w0 + UI.Space.stageDelta(dx, drag.zoom))), h = Math.max(MIN_H, Math.round(drag.h0 + UI.Space.stageDelta(dy, drag.zoom)));
      drag.w1 = w; drag.h1 = h;
      UI.Intent.preview('resize', { id: drag.id, w, h }); render();
      showTip(ev.clientX, ev.clientY, w + ' × ' + h, true);
      return;
    }
    if (drag.kind === 'wspan') {
      const dx = ev.clientX - drag.sx, dy = ev.clientY - drag.sy;
      if (!drag.moved && Math.hypot(dx, dy) < 4) return;
      drag.moved = true;
      UI.State.setUi(S.scene.entities[drag.id], 'view', { cx: drag.v0.cx - UI.Space.pxToUnits(dx, drag.sc.unit), cy: drag.v0.cy + UI.Space.pxToUnits(dy, drag.sc.unit), span: drag.v0.span });
      render(); return;
    }
    if (drag.kind === 'pan') { S.view.x = drag.vx + ev.clientX - drag.sx; S.view.y = drag.vy + ev.clientY - drag.sy; render(); return; }
    if (drag.kind === 'move') {
      if (!drag.moved && Math.hypot(ev.clientX - drag.sx, ev.clientY - drag.sy) < L.DRAG_SLOP) return;
      const w = UI.Space.screenToStage(ev);
      if (!drag.moved) { drag.moved = true; drag.before = UI.App.snapshot(); }
      drag.x1 = w.x - drag.dx; drag.y1 = w.y - drag.dy;
      UI.Intent.preview('move', { id: drag.id, x: drag.x1, y: drag.y1 }); render();
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
      if (h && (h.id !== L.from || h.port)) UI.Intent.run('link', { from: L.from, fromPort: L.fromPort, to: h.id, toPort: h.port || undefined }); else render();
      render(); return;
    }
    if (drag) {
      const d = drag; drag = null; stageEl.classList.remove('panning');
      if (d.moved) dblKey = null;   // 拖动过的不算点击：下一次按不能被当成双击
      document.querySelectorAll('.card.droptarget').forEach((c) => c.classList.remove('droptarget'));
      if (d.kind === 'piece') { pieceUp(d, ev); return; }
      if (d.kind === 'shape') { shapeUp(d, ev); return; }
      if (d.kind === 'rz') {
        showTip(0, 0, '');
        if (d.moved) UI.Intent.run('resize', { id: d.id, w: d.w1, h: d.h1, before: d.before });
        UI.Panels.renderInsp(); render(); if (d.moved) UI.App.afterMove(); return;
      }
      // 移动（和松手放进容器）是一个事务：一次拖动只一个撤销项
      if (d.kind === 'move' && d.moved) {
        UI.Intent.run('move', { id: d.id, x: d.x1, y: d.y1, ev, before: d.before });
        UI.App.afterMove();
      }
    }
  }

  function init() {
    stageEl = $('#stage'); worldEl = $('#world');
    // 专注浮层：放在台面外面（不跟着台面缩放平移），盖住整个台面
    focusEl = document.createElement('div'); focusEl.id = 'wsfocus'; focusEl.style.display = 'none'; stageEl.appendChild(focusEl);
    stageEl.addEventListener('pointerdown', onDown);
    // 拖卡片时不让浏览器接管成“原生拖放”（否则之后的 pointermove 全被吞掉）
    stageEl.addEventListener('dragstart', (ev) => ev.preventDefault());
    // 工作区面板：图层开关、移动工具的 dx、dy（只记下来，不重画，免得输入框失去焦点）
    stageEl.addEventListener('change', (ev) => {
      const l = ev.target.getAttribute && ev.target.getAttribute('data-ws-layer');
      if (l === null || l === undefined) return;
      const ws = UI.S.scene.entities[ev.target.getAttribute('data-ws-of')];
      if (!ws) return;
      const h = Object.assign({}, UI.State.hiddenOf(ws));
      if (ev.target.checked) delete h[l]; else h[l] = true;
      UI.State.setUi(ws, 'hiddenLayers', Object.keys(h).length ? h : null);
      render();
    });
    stageEl.addEventListener('input', (ev) => {
      const k = ev.target.getAttribute && ev.target.getAttribute('data-ws-arg');
      if (k) UI.S.wsArgs[k] = ev.target.value;
    });
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    // 滚轮：指在工作区上就只缩放这个工作区（§10.5.8 A3）；指在别处缩放台面；专注浮层里的其他地方不动台面
    stageEl.addEventListener('wheel', (ev) => {
      ev.preventDefault();
      const f = ev.deltaY < 0 ? 1.1 : 1 / 1.1, wb = ev.target.closest && ev.target.closest('.wsbody');
      if (wb) wsZoomAt(wb, f, ev.clientX, ev.clientY);
      else if (!(ev.target.closest && ev.target.closest('#wsfocus'))) zoomAt(f, ev.clientX, ev.clientY);
    }, { passive: false });
    stageEl.addEventListener('click', (ev) => {
      const why = ev.target.closest('[data-why]');
      if (why) { const [wid, wport] = why.dataset.why.split('|'); UI.Panels.whyDialog(wid, wport); return; }
      // 工作区面板：工具、步骤（点开看参数）、删除一步
      const ff = ev.target.closest('[data-fig-flip]');
      if (ff) { figFlip(ff.dataset.ws, ff.dataset.name, +ff.dataset.figFlip); return; }
      const wt = ev.target.closest('[data-ws-tool]');
      if (wt) { wsRun(wt.dataset.ws, wt.dataset.wsTool); return; }
      const wf = ev.target.closest('[data-ws-fit]');
      if (wf) { wsFit(wf.dataset.wsFit); return; }
      const wu = ev.target.closest('[data-ws-unfocus]');
      if (wu) { setFocus(null); return; }
      const wd = ev.target.closest('[data-ws-del]');
      if (wd) { delWs(wd.dataset.wsDel); return; }
      const wst = ev.target.closest('[data-ws-step]');
      if (wst) { const S = UI.S; S.sel = wst.dataset.wsStep; S.selLink = null; S.inspOpen = true; UI.Panels.renderInsp(); render(); return; }
      // 块的把手（工作区面板里）：转 90°、左右翻、属性
      const pa = ev.target.closest('[data-piece-act]');
      if (pa) {
        const S = UI.S, ids = selPieceIds();
        if (pa.dataset.pieceAct === 'insp') { if (ids[0]) { S.sel = ids[0]; S.inspOpen = true; UI.Panels.renderInsp(); render(); } }
        else UI.Intent.run('piece', { ids, what: pa.dataset.pieceAct, value: 1 });
        return;
      }
      const b = ev.target.closest('[data-act]'); if (!b) return;
      const S = UI.S, id = S.sel; if (!id) return;
      const a = b.dataset.act;
      if (a === 'turn' || a === 'flip') UI.Intent.run('piece', { ids: [id], what: a, value: 1 });
      else if (a === 'insp') { S.inspOpen = !S.inspOpen; UI.Panels.renderInsp(); }
      else if (a === 'copy') UI.Intent.run('copy', { id });
      else if (a === 'del') { S.sel = null; UI.Intent.run('delete', { id }); }
      else if (a === 'resetstate') UI.Intent.run('resetstate', { id });
    });
  }

  UI.Stage = { init, render, dropTarget, freeSpot, fit, zoomAt, geom, portPos, setFocus, wsZoomAt, wsFit, selPieceIds, endDraw, rangeOf: (id) => { const ws = UI.S.scene.entities[id]; if (!ws) return null; const g = geom(ws); return wsView(ws, g.w, g.h - HD); } };
})(window);
