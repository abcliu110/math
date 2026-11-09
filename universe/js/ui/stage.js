/* 台面：卡片、端口、连线、拖拽、缩放、平移。DOM 卡片 + SVG 连线，整块重绘（卡片数 < 40，够快）。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), W = U.World, K = U.kit, Q = U.Q;
  const $ = (s) => document.querySelector(s);
  const HD = 28, PORT_Y0 = 40, PORT_DY = 22, PILL_DY = 26, PILL_W = 92, MIN_W = 120, MIN_H = 90;
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
  // 工作区里要显示的值：每个器材输出的 fig（没有 fig 时才用 figs），按放入的先后。key 是 器材id.口，层开关用它
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
        if (v.kind === 'figs') { if (hasFig) continue; v.data.forEach((f, i) => out.push({ key: key + '.' + i, name: null, label: nm || it.name, fig: f, id: it.id, port })); continue; }
        out.push({ key, name: nm, label: nm || (port === 'p' || port === 'f' ? it.name : it.name + '·' + port), fig: v.data, id: it.id, port });
      }
    }
    return out;
  }
  const stepLabel = (st) => (st.type === 'gplace' ? (st.props.flip ? '翻转' : st.props.turn ? '旋转' : '移动') : STEP_LABEL[st.type] || st.type);
  // ---- 工作区的坐标范围（§10.5.8 A2、A3）----
  // S.wsView[id] = {cx, cy, span}：可见的横向范围是 [cx-span/2, cx+span/2]，画布上 1 个坐标单位 = w/span 像素。
  // 没存过的，按内容自动选（横纵都装得下）。一旦拖过、滚过、改过大小、点过“适应”，就存下来：
  // 之后拉大卡片只是把图画大，坐标范围不变。
  function wsVisible(ws) { const hidden = UI.S.wsHidden || {}; return wsValues(ws, wsNames()).filter((v) => !hidden[v.key] && v.fig); }
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
    const span = Math.max(b.x1 - b.x0, (b.y1 - b.y0) * w / Math.max(h, 1)) * 1.15;
    return { cx: (b.x0 + b.x1) / 2, cy: (b.y0 + b.y1) / 2, span };
  }
  function wsView(ws, w, h, b) {
    const v = UI.S.wsView && UI.S.wsView[ws.id];
    return v || autoView(b === undefined ? wsBounds(wsVisible(ws)) : b, w, h);
  }
  const fmtN = (n) => String(Math.round(n * 100) / 100);
  function rangeText(ws, w, h) {
    const v = wsView(ws, w, h), hh = h * v.span / w / 2, hw = v.span / 2;
    return '横向 ' + fmtN(v.cx - hw) + ' 到 ' + fmtN(v.cx + hw) + '　纵向 ' + fmtN(v.cy - hh) + ' 到 ' + fmtN(v.cy + hh);
  }

  // 工作区的画布：把所有显示的值画在一起，按工作区的坐标范围画（范围定下来以后，卡片变大图也跟着变大）
  function wsBody(ws, w, h) {
    const S = UI.S, sel = new Set(S.wsSel || []), ents = S.scene.entities;
    const vals = wsVisible(ws);
    const b = wsBounds(vals);
    if (!b) return K.text(w / 2, h / 2, '工作区里还没有图形', { size: 12, fill: 'var(--dim)' });
    const vw = wsView(ws, w, h, b), s = w / vw.span;
    const X = (x) => w / 2 + (x - vw.cx) * s, Y = (y) => h / 2 - (y - vw.cy) * s;
    let g = '';
    vals.forEach((v, i) => {
      const f = v.fig; if (!f) return;
      const c = WS_COL[i % WS_COL.length], on = !!v.name && sel.has(v.name), sw = on ? 4 : 2;
      const pk = v.name ? ' data-pick="' + escA(v.name) + '"' : '';
      const sty = v.name ? ' style="cursor:pointer"' : '';
      let lx, ly;
      if (f.type === 'polygon') {
        const d = f.pts.map((p, k) => (k ? 'L' : 'M') + X(Q.num(p.x)).toFixed(1) + ' ' + Y(Q.num(p.y)).toFixed(1)).join(' ') + ' Z';
        g += '<path d="' + d + '" fill="' + c + '22" stroke="' + c + '" stroke-width="' + sw + '"' + pk + sty + '/>';
        lx = f.pts.reduce((a, p) => a + X(Q.num(p.x)), 0) / f.pts.length; ly = f.pts.reduce((a, p) => a + Y(Q.num(p.y)), 0) / f.pts.length;
      } else if (f.type === 'segment') {
        const a = f.pts[0], b = f.pts[1];
        g += '<line x1="' + X(Q.num(a.x)) + '" y1="' + Y(Q.num(a.y)) + '" x2="' + X(Q.num(b.x)) + '" y2="' + Y(Q.num(b.y)) + '" stroke="' + c + '" stroke-width="' + (on ? 5 : 2.5) + '"' + (f.dash ? ' stroke-dasharray="6 4"' : '') + ' stroke-linecap="round"' + pk + sty + '/>';
        lx = (X(Q.num(a.x)) + X(Q.num(b.x))) / 2; ly = (Y(Q.num(a.y)) + Y(Q.num(b.y))) / 2;
      } else if (f.type === 'circle') {
        const cx = X(Q.num(f.pts[0].x)), cy = Y(Q.num(f.pts[0].y));
        g += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (Math.sqrt(Q.num(f.r2)) * s) + '" fill="none" stroke="' + c + '" stroke-width="' + sw + '"' + pk + sty + '/>';
        lx = cx; ly = cy;
      } else if (f.type === 'point') {
        const px = X(Q.num(f.pts[0].x)), py = Y(Q.num(f.pts[0].y)), src = f.tag && ents[f.tag] && ents[f.tag].type === 'gpt' ? f.tag : null;
        if (src) {
          // 自由点的把手：拖动改它的 x、y（沿用 onDown 的 data-drag 机制）
          g += '<circle data-drag="' + src + '" data-kx="x" data-ky="y" data-s="' + s.toFixed(4) + '" cx="' + px + '" cy="' + py + '" r="7" fill="#fff" stroke="' + c + '" stroke-width="' + (on ? 4 : 2.5) + '" style="cursor:grab"' + pk + '/>';
        } else g += '<circle cx="' + px + '" cy="' + py + '" r="' + (on ? 6 : 4) + '" fill="' + c + '"' + pk + sty + '/>';
        lx = px + 9; ly = py - 9;
      }
      if (lx !== undefined) g += '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" font-size="11" font-weight="700" fill="' + c + '" font-family="var(--font)">' + K.esc(v.label) + '</text>';
    });
    return g;
  }
  // 工作区底下的面板：工具行、选中的对象、消息、步骤历史、图层
  // dims：画布的宽高（专注模式里比卡片大）；inFocus：放在专注浮层的侧栏里，不用绝对定位
  function wsPanelHtml(ws, names, dims, inFocus) {
    const S = UI.S, g = geom(ws), wd = U.types[ws.type].workspace, hidden = S.wsHidden || {};
    const pw = dims ? dims.w : g.w, ph = dims ? dims.h : g.h - HD;
    const kids = wsKids(ws), steps = kids.filter((k) => STEP_TYPES.includes(k.type)), vals = wsValues(ws, names), picks = S.wsSel || [];
    const pos = inFocus ? '' : ' style="left:' + g.x + 'px;top:' + (g.y + g.h + 36) + 'px;width:' + g.w + 'px"';
    let h = '<div class="wsx" data-ws="' + ws.id + '"' + pos + '>';
    h += '<div class="wsx-tools">' + wd.tools.map((t) => '<button data-ws-tool="' + t.id + '" data-ws="' + ws.id + '">' + K.esc(t.label) + '</button>').join('') +
      '<button data-ws-fit="' + ws.id + '" title="按内容选坐标范围，让图正好装下">适应</button></div>';
    h += '<div class="wsx-range">' + rangeText(ws, pw, ph) + '</div>';
    h += '<div class="wsx-args">移动时：向右 <input type="number" data-ws-arg="dx" value="' + escA(S.wsArgs.dx) + '"> 向上 <input type="number" data-ws-arg="dy" value="' + escA(S.wsArgs.dy) + '"></div>';
    h += '<div class="wsx-sel">' + (picks.length ? '选中：' + picks.map((x) => K.esc(x)).join('、') : '点图形或点来选中（Shift 点可以多选）') + '</div>';
    h += '<div class="wsx-foot' + (S.wsMsg ? ' bad' : '') + '">' + K.esc(S.wsMsg || '') + '</div>';
    h += '<div class="wsx-h">步骤</div>';
    if (!steps.length) h += '<div class="wsx-none">还没有步骤</div>';
    steps.forEach((st, i) => {
      const srcs = S.scene.links.filter((l) => l.to === st.id).map((l) => names[l.from + '.' + l.fromPort] || '?');
      h += '<div class="wsx-step" data-ws-step="' + st.id + '"><span>第 ' + (i + 1) + ' 步：' + K.esc(stepLabel(st)) + '（' + K.esc(srcs.join('、')) + '）</span>' +
        '<button data-ws-del="' + st.id + '" title="删除这一步">✕</button></div>';
    });
    h += '<div class="wsx-h">图层</div><div class="wsx-layers">' + (vals.length ? vals.map((v) => '<label><input type="checkbox" data-ws-layer="' + escA(v.key) + '"' + (hidden[v.key] ? '' : ' checked') + '> ' + K.esc(v.label) + '</label>').join('') : '<span class="wsx-none">没有图形</span>') + '</div>';
    return h + '</div>';
  }
  // 点选：没有 Shift 就只选这一个，有 Shift 就加上 / 去掉
  function wsPick(name, shift) {
    const S = UI.S, cur = S.wsSel || [];
    S.wsSel = shift ? (cur.includes(name) ? cur.filter((x) => x !== name) : cur.concat([name])) : [name];
  }
  // 点工具：把选中的对象交给世界的 t:'tool' 动作（走 act，可以撤销）；失败就把原因放在面板的消息里
  function wsRun(wsId, tool) {
    const S = UI.S, args = {};
    if (tool === 'move') { const n = (v) => { const k = parseInt(v, 10); return Number.isFinite(k) ? k : 0; }; args.dx = n(S.wsArgs.dx); args.dy = n(S.wsArgs.dy); }
    const r = UI.App.act({ t: 'tool', ws: wsId, tool, picks: (S.wsSel || []).slice(), args });
    if (r && r.ok) { S.wsSel = []; S.wsMsg = ''; } else S.wsMsg = (r && r.why) || '这一步做不了';
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
    if (W.isProp(port)) { const k = port.slice(2), ps = pillsOf(e, D), i = Math.max(0, ps.indexOf(k)); return { x: g.x - 8, y: g.y + PORT_Y0 + i * PILL_DY }; }
    const i = Math.max(0, Object.keys(d.inputs).indexOf(port)); return { x: g.x, y: g.y + PORT_Y0 + i * PORT_DY };
  }
  const bez = (a, b) => { const dx = Math.max(40, Math.abs(b.x - a.x) / 2); return 'M' + a.x + ',' + a.y + ' C' + (a.x + dx) + ',' + a.y + ' ' + (b.x - dx) + ',' + b.y + ' ' + b.x + ',' + b.y; };

  function cardHtml(e, D, S) {
    const d = def(e), g = geom(e), dd = D[e.id], cH = g.h - HD;
    const c = { ent: e, props: dd.props || e.props, d: dd, out: dd.out, state: e.state, w: g.w, h: cH, t: S.scene.clock.t, n: S.scene.clock.n };
    let body = '', badge = '';
    try { body = d.workspace ? wsBody(e, g.w, cH) : d.draw(c); } catch (x) { body = K.text(g.w / 2, cH / 2, '画不出来', { fill: 'var(--bad)' }); }
    try { badge = d.badge ? d.badge(c) : ''; } catch (x) { badge = ''; }
    let h = '<div class="card' + (S.sel === e.id ? ' sel' : '') + '" data-id="' + e.id + '" style="left:' + g.x + 'px;top:' + g.y + 'px;width:' + g.w + 'px;height:' + g.h + 'px">';
    h += '<div class="hd" data-id="' + e.id + '"><span class="nm">' + K.esc(e.name) + '</span><span class="bd">' + K.esc(badge || '') + '</span></div>';
    h += '<svg class="bdy' + (d.workspace ? ' wsbody" data-wsid="' + e.id : '') + '" width="' + g.w + '" height="' + cH + '" viewBox="0 0 ' + g.w + ' ' + cH + '">' + body + '</svg>';
    Object.keys(d.inputs).forEach((k, i) => {
      const y = PORT_Y0 - HD + i * PORT_DY + HD - 0;
      h += '<i class="port in" data-id="' + e.id + '" data-port="' + k + '" style="left:0;top:' + (PORT_Y0 + i * PORT_DY - 0) + 'px"></i>';
      h += '<span class="pl" style="left:12px;top:' + (PORT_Y0 + i * PORT_DY) + 'px">' + K.esc(d.inputs[k].label) + '</span>';
    });
    Object.keys(d.outputs).forEach((k, i) => {
      h += '<i class="port out" data-id="' + e.id + '" data-port="' + k + '" style="left:' + g.w + 'px;top:' + (PORT_Y0 + i * PORT_DY) + 'px;background:' + U.kindColor(d.outputs[k].kind) + '"></i>';
      h += '<span class="pl" style="right:12px;top:' + (PORT_Y0 + i * PORT_DY) + 'px">' + K.esc(d.outputs[k].label) + '</span>';
    });
    h += '<i class="rz" data-rz="' + e.id + '" title="拖动改大小；双击恢复默认"></i>';
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
    const D = S.D, E = S.scene.entities;
    const lk = linksHtml(S);
    let h = '<svg id="links" width="1" height="1">' + lk.paths + '</svg>';
    // 工作区里的器材不画卡片；工作区的选中对象只保留还存在的名字
    const names = wsNames(), known = new Set(Object.values(names));
    S.wsSel = (S.wsSel || []).filter((n) => known.has(n));
    for (const id of Object.keys(E)) if (!inWs(E[id])) h += cardHtml(E[id], D, S);
    h += lk.lbl;
    for (const id of Object.keys(E)) if (isWsDef(E[id].type)) h += wsPanelHtml(E[id], names);
    worldEl.innerHTML = h;
    worldEl.style.transform = 'translate(' + S.view.x + 'px,' + S.view.y + 'px) scale(' + S.view.z + ')';
    const z = $('#zv'); if (z) z.textContent = Math.round(S.view.z * 100) + '%';
    if (focusEl) { focusEl.innerHTML = focusHtml(); focusEl.style.display = S.focusWs ? '' : 'none'; }
  }

  // ---- 专注模式（§10.5.8 A4）：工作区放大成覆盖台面的浮层，双击标题或按 Esc 还原 ----
  function setFocus(id) { UI.S.focusWs = id || null; render(); }
  function focusHtml() {
    const S = UI.S, id = S.focusWs, e = id && S.scene.entities[id];
    if (!e || !isWsDef(e.type)) { S.focusWs = null; return ''; }
    const r = stageEl.getBoundingClientRect();
    const W = Math.max(200, Math.round(r.width - 300 - 72)), H = Math.max(160, Math.round(r.height - 32 - 56));
    let h = '<div class="wsf-hd" title="双击标题，或按 Esc，还原"><b>' + K.esc(e.name) + '</b><span>双击标题或按 Esc 还原</span><button data-ws-unfocus>还原</button></div>';
    h += '<div class="wsf-main"><svg class="bdy wsbody" data-wsid="' + e.id + '" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' + wsBody(e, W, H) + '</svg>';
    h += '<div class="wsf-side">' + wsPanelHtml(e, wsNames(), { w: W, h: H }, true) + '</div></div>';
    return h;
  }
  // 工作区里滚轮缩放：以指针为中心，只改这个工作区的坐标范围（台面不动）
  function wsZoomAt(wb, f, cx, cy) {
    const S = UI.S, id = wb.dataset.wsid, ws = S.scene.entities[id]; if (!ws) return;
    const cw = +wb.getAttribute('width'), ch = +wb.getAttribute('height');
    const r = wb.getBoundingClientRect(), k = r.width / cw;
    const lx = (cx - r.left) / k, ly = (cy - r.top) / k;
    const v0 = wsView(ws, cw, ch), s0 = cw / v0.span;
    const px = v0.cx + (lx - cw / 2) / s0, py = v0.cy - (ly - ch / 2) / s0;
    const span = Math.max(1e-3, Math.min(1e6, v0.span / f)), s1 = cw / span;
    S.wsView = S.wsView || {};
    S.wsView[id] = { cx: px - (lx - cw / 2) / s1, cy: py + (ly - ch / 2) / s1, span };
    render();
  }
  // 适应：按内容选一个正好装下的坐标范围（之后拉大卡片不再变）
  function wsFit(id) {
    const S = UI.S, ws = S.scene.entities[id]; if (!ws) return;
    const sv = S.focusWs === id && focusEl ? focusEl.querySelector('svg.wsbody') : null;
    let w, h;
    if (sv) { w = +sv.getAttribute('width'); h = +sv.getAttribute('height'); }
    else { const g = geom(ws); w = g.w; h = g.h - HD; }
    S.wsView = S.wsView || {};
    S.wsView[id] = autoView(wsBounds(wsVisible(ws)), w, h);
    render();
  }
  // 开始拖柄改大小：工作区先把现在看到的坐标范围存下来，之后拉大只是把图画大
  function startResize(id, ev) {
    const S = UI.S, e = S.scene.entities[id]; if (!e) return;
    ev.preventDefault(); ev.stopPropagation();
    const g = geom(e);
    if (isWsDef(e.type)) { S.wsView = S.wsView || {}; if (!S.wsView[id]) S.wsView[id] = wsView(e, g.w, g.h - HD); }
    S.sel = id; S.selLink = null;
    drag = { kind: 'rz', id, sx: ev.clientX, sy: ev.clientY, w0: g.w, h0: g.h, zoom: S.view.z, moved: false };
  }

  const toWorld = (ev) => { const r = stageEl.getBoundingClientRect(), v = UI.S.view; return { x: (ev.clientX - r.left - v.x) / v.z, y: (ev.clientY - r.top - v.y) / v.z }; };

  function fit() {
    const S = UI.S, r = stageEl.getBoundingClientRect();
    let ids = Object.keys(S.scene.entities).filter((id) => !inWs(S.scene.entities[id]));
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    if (!ids.length) { S.view = { x: r.width / 2 - 200, y: r.height / 2 - 120, z: 1 }; return; }
    ids.forEach((id) => {
      const e = S.scene.entities[id], g = geom(e); x0 = Math.min(x0, g.x - 110); y0 = Math.min(y0, g.y); x1 = Math.max(x1, g.x + g.w + 60); y1 = Math.max(y1, g.y + g.h + 50);
      if (isWsDef(e.type)) y1 = Math.max(y1, g.y + g.h + 36 + 420);   // 工作区底下的面板
    });
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
    if (t.closest('.tool') || t.closest('.wsx')) return;   // 工作区底下的面板：让浏览器照常处理按钮和输入框
    // 专注浮层：标题双击还原；浮层里的画布和台面没有关系，照常往下处理
    const fo = t.closest('#wsfocus');
    if (fo && !t.closest('.wsbody')) { if (t.closest('.wsf-hd') && !t.closest('button') && dbl('focus-hd')) setFocus(null); return; }
    // 卡片右下角的拖柄：拖动改大小；双击恢复默认大小（一次 act，可以撤销）
    const rz = t.closest('.rz');
    if (rz) {
      if (dbl('rz:' + rz.dataset.rz)) { S.sel = rz.dataset.rz; UI.App.act({ t: 'resize', id: rz.dataset.rz, w: null, h: null }); return; }
      startResize(rz.dataset.rz, ev); return;
    }
    // 工作区里选中对象（点、线、图形）：Shift 点是加选
    const pk = t.closest('[data-pick]');
    if (pk) wsPick(pk.dataset.pick, ev.shiftKey);
    // 几何画板上的自由点：直接拖动，改的是那个自由点器材的 x、y（按格点吸附）
    const gh = t.closest('[data-drag]');
    if (gh) {
      const pe = S.scene.entities[gh.dataset.drag]; if (!pe) return;
      ev.preventDefault(); ev.stopPropagation();
      const svg = gh.closest('svg'), r = svg.getBoundingClientRect(), zoom = r.width / (+svg.getAttribute('width') || r.width);
      const kx = gh.dataset.kx || 'x', ky = gh.dataset.ky || 'y', P = U.types[pe.type].props;
      drag = { kind: 'gpt', id: pe.id, kx, ky, lo: [P[kx].min, P[ky].min], hi: [P[kx].max, P[ky].max], sx: ev.clientX, sy: ev.clientY, x0: pe.props[kx], y0: pe.props[ky], unit: (+gh.dataset.s) * zoom, moved: false };
      if (pk) render();   // 选中状态变了，重画（拖动数据已经记下来了）
      return;
    }
    if (pk) { render(); return; }
    // 工作区的画布：点空白处取消选中，不移动工作区，也不平移台面
    // 工作区空白处拖动：平移这个工作区的坐标范围（不平移台面）；没有拖动就只是取消选中
    const wb = t.closest('.wsbody');
    if (wb) {
      const wid = wb.dataset.wsid, ws = S.scene.entities[wid], cw = +wb.getAttribute('width'), ch = +wb.getAttribute('height');
      const k = wb.getBoundingClientRect().width / cw;
      if ((S.wsSel || []).length) { S.wsSel = []; render(); }
      if (ws) drag = { kind: 'wspan', id: wid, cw, ch, k, sx: ev.clientX, sy: ev.clientY, moved: false, v0: wsView(ws, cw, ch) };
      return;
    }
    const outp = t.closest('.port.out');
    if (outp) {
      ev.preventDefault();
      linking = { from: outp.dataset.id, fromPort: outp.dataset.port, cur: toWorld(ev) };
      stageEl.setPointerCapture && 0; render(); return;
    }
    const ub = t.closest('[data-unlink]');
    if (ub) { S.selLink = null; UI.App.act({ t: 'unlink', id: ub.dataset.unlink }); return; }
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
      const w = toWorld(ev);
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
    if (drag.kind === 'rz') {
      const dx = ev.clientX - drag.sx, dy = ev.clientY - drag.sy;
      if (!drag.moved && Math.hypot(dx, dy) < 3) return;
      if (!drag.moved) { drag.moved = true; UI.App.snapshot(); }
      const w = Math.max(MIN_W, Math.round(drag.w0 + dx / drag.zoom)), h = Math.max(MIN_H, Math.round(drag.h0 + dy / drag.zoom));
      W.act(S.scene, { t: 'resize', id: drag.id, w, h }); render();
      showTip(ev.clientX, ev.clientY, w + ' × ' + h, true);
      return;
    }
    if (drag.kind === 'wspan') {
      const dx = ev.clientX - drag.sx, dy = ev.clientY - drag.sy;
      if (!drag.moved && Math.hypot(dx, dy) < 4) return;
      drag.moved = true;
      const s0 = drag.cw / drag.v0.span;
      S.wsView = S.wsView || {};
      S.wsView[drag.id] = { cx: drag.v0.cx - dx / drag.k / s0, cy: drag.v0.cy + dy / drag.k / s0, span: drag.v0.span };
      render(); return;
    }
    if (drag.kind === 'gpt') {
      const cl = (v, i) => Math.max(drag.lo[i], Math.min(drag.hi[i], v));
      const nx = cl(drag.x0 + Math.round((ev.clientX - drag.sx) / drag.unit), 0), ny = cl(drag.y0 - Math.round((ev.clientY - drag.sy) / drag.unit), 1);
      const e = S.scene.entities[drag.id]; if (!e || (e.props[drag.kx] === nx && e.props[drag.ky] === ny)) return;
      if (!drag.moved) { drag.moved = true; UI.App.snapshot(); }
      W.act(S.scene, { t: 'set', id: drag.id, k: drag.kx, v: nx }); W.act(S.scene, { t: 'set', id: drag.id, k: drag.ky, v: ny });
      UI.App.refresh(); return;
    }
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
      if (d.moved) dblKey = null;   // 拖动过的不算点击：下一次按不能被当成双击
      document.querySelectorAll('.card.droptarget').forEach((c) => c.classList.remove('droptarget'));
      if (d.kind === 'rz') { showTip(0, 0, ''); UI.Panels.renderInsp(); render(); if (d.moved) UI.App.afterMove(); return; }
      if (d.kind === 'move' && d.moved) { dropOnContainer(d.id, ev); UI.App.afterMove(); }
      if (d.kind === 'gpt' && d.moved && S.scene.entities[d.id]) UI.App.act({ t: 'set', id: d.id, k: d.ky, v: S.scene.entities[d.id].props[d.ky] });
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
      const S = UI.S; S.wsHidden = S.wsHidden || {};
      if (ev.target.checked) delete S.wsHidden[l]; else S.wsHidden[l] = true;
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
      const wt = ev.target.closest('[data-ws-tool]');
      if (wt) { wsRun(wt.dataset.ws, wt.dataset.wsTool); return; }
      const wf = ev.target.closest('[data-ws-fit]');
      if (wf) { wsFit(wf.dataset.wsFit); return; }
      const wu = ev.target.closest('[data-ws-unfocus]');
      if (wu) { setFocus(null); return; }
      const wd = ev.target.closest('[data-ws-del]');
      if (wd) { UI.S.wsSel = []; UI.App.removeEntity(wd.dataset.wsDel); return; }
      const wst = ev.target.closest('[data-ws-step]');
      if (wst) { const S = UI.S; S.sel = wst.dataset.wsStep; S.selLink = null; S.inspOpen = true; UI.Panels.renderInsp(); render(); return; }
      const b = ev.target.closest('[data-act]'); if (!b) return;
      const S = UI.S, id = S.sel; if (!id) return;
      const a = b.dataset.act;
      if (a === 'insp') { S.inspOpen = !S.inspOpen; UI.Panels.renderInsp(); }
      else if (a === 'copy') UI.App.act({ t: 'copy', id });
      else if (a === 'del') { S.sel = null; UI.App.removeEntity(id); }
      else if (a === 'resetstate') UI.App.act({ t: 'resetstate', id });
    });
  }

  UI.Stage = { init, render, fit, zoomAt, toWorld, geom, portPos, setFocus, wsZoomAt, wsFit, rangeOf: (id) => { const ws = UI.S.scene.entities[id]; if (!ws) return null; const g = geom(ws); return wsView(ws, g.w, g.h - HD); } };
})(window);
