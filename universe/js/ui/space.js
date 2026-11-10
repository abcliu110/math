/* UI.Space —— 坐标换算的唯一入口（docs/ui-robustness.md 第 4.5 节，U6）。
 * 四种坐标：
 *   屏幕：鼠标事件的 clientX、clientY（像素，浏览器缩放已经算进去）；
 *   台面局部：相对 #stage 左上角的屏幕像素，还没除以台面缩放；
 *   台面世界：卡片的 x、y。S.view = { x, y, z }：局部 = 世界 × z + (x, y)；
 *   工作区几何：图形的坐标（格点、有理数）。范围 vw = { cx, cy, span }：横向看到 [cx − span/2, cx + span/2]，
 *     画布宽 w 个像素对应 span 个坐标单位，所以每单位 w/span 像素；画布 Y 轴朝下，几何 Y 轴朝上。
 * 屏幕 ↔ 工作区用的是 svg 的实测屏幕矩形（getBoundingClientRect，已经算进台面缩放），不再另外乘 z。
 * 界面代码（stage.js、panels.js、layout.js、app.js）不许自己写这些换算：tools/lint-ui.js 的 U6 规则检查。
 * 这个文件只做数学，不读 UI.S 以外的状态；屏幕矩形由调用方传入，或在这里用 #stage 量。 */
(function (G) {
  'use strict';
  const UI = (G.UI = G.UI || {});

  const stageRect = () => document.querySelector('#stage').getBoundingClientRect();

  // ---- 台面：屏幕 ↔ 局部 ↔ 世界 ----
  // 屏幕像素（鼠标事件或 {clientX, clientY}）→ 台面局部像素
  function stageLocal(pt) { const r = stageRect(); return { x: pt.clientX - r.left, y: pt.clientY - r.top }; }
  // 台面局部像素 → 世界坐标（view = S.view）
  function localToStage(view, p) { return { x: (p.x - view.x) / view.z, y: (p.y - view.y) / view.z }; }
  // 世界坐标 → 台面局部像素
  function stageToLocal(view, p) { return { x: p.x * view.z + view.x, y: p.y * view.z + view.y }; }
  // 屏幕像素 → 世界坐标（view 缺省用 UI.S.view）
  function screenToStage(pt, view) { return localToStage(view || UI.S.view, stageLocal(pt)); }
  // 世界坐标 → 屏幕像素（用来判断一个世界点画在屏幕哪里）
  function stageToScreen(p, view) { const r = stageRect(), l = stageToLocal(view || UI.S.view, p); return { x: r.left + l.x, y: r.top + l.y }; }
  // 台面可视区中心的世界坐标（新卡片的落点用）
  function stageCenter(view) { const r = stageRect(); return localToStage(view || UI.S.view, { x: r.width / 2, y: r.height / 2 }); }
  // 世界长度 → 屏幕像素长度（台面）；view 的 x、y 把世界点 p 放在局部像素 local 上
  function scaleLen(d, z) { return d * z; }
  function viewAt(z, p, local) { return { x: local.x - p.x * z, y: local.y - p.y * z, z }; }
  // 屏幕位移 → 世界位移（台面）
  function stageDelta(d, z) { return d / z; }
  // 以局部像素 local 为中心缩放 f 倍，缩放夹在 lim = {min, max} 之间；返回新的 view，不改旧的。
  // 缩放前后，local 指的那一点（世界上的点）位置不变。
  function zoomView(view, f, local, lim) {
    const z = Math.max(lim.min, Math.min(lim.max, view.z * f)), k = z / view.z;
    return { x: local.x - (local.x - view.x) * k, y: local.y - (local.y - view.y) * k, z };
  }

  // ---- 工作区画布 ----
  // svg 的屏幕矩形 rect、横向范围 span → sc = { unit（屏幕像素 / 坐标单位）, cx, cy（画布中心的屏幕坐标） }
  function canvasOf(rect, span) { return { unit: rect.width / span, cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 }; }
  // 屏幕 → 工作区几何坐标；工作区几何坐标 → 屏幕（sc 来自 canvasOf）
  function screenToWorkspace(pt, vw, sc) { return { x: vw.cx + (pt.clientX - sc.cx) / sc.unit, y: vw.cy - (pt.clientY - sc.cy) / sc.unit }; }
  function workspaceToScreen(p, vw, sc) { return { x: sc.cx + (p.x - vw.cx) * sc.unit, y: sc.cy - (p.y - vw.cy) * sc.unit }; }
  // 台面世界坐标 → 工作区几何坐标（先到屏幕，再到工作区；view 缺省用 UI.S.view）
  function stageToWorkspace(p, vw, sc, view) { const s = stageToScreen(p, view); return screenToWorkspace({ clientX: s.x, clientY: s.y }, vw, sc); }
  // 工作区范围按 f 倍缩放（f > 1 放大，范围变小），范围夹在 [1e-3, 1e6]
  function zoomSpan(vw, f) { return Math.max(1e-3, Math.min(1e6, vw.span / f)); }
  // 屏幕 → 画布像素（svg 的 width、height 属性坐标，0..w、0..h）；rect 是 svg 的屏幕矩形
  function screenToCanvas(pt, rect, w, h) { return { x: (pt.clientX - rect.left) * w / rect.width, y: (pt.clientY - rect.top) * h / rect.height }; }
  // 画布像素每单位数：w / span
  function perUnit(w, vw) { return w / vw.span; }
  // 几何坐标 → 画布像素（w、h 是画布的宽高）；反过来
  function canvasX(x, w, vw) { return w / 2 + (x - vw.cx) * perUnit(w, vw); }
  function canvasY(y, h, vw, w) { return h / 2 - (y - vw.cy) * (w / vw.span); }
  function canvasToWorkspace(p, w, h, vw) { const s = perUnit(w, vw); return { x: vw.cx + (p.x - w / 2) / s, y: vw.cy - (p.y - h / 2) / s }; }
  function workspaceToCanvas(p, w, h, vw) { return { x: canvasX(p.x, w, vw), y: canvasY(p.y, h, vw, w) }; }
  // 工作区的横向半宽、纵向半高（几何单位）；横纵都按同一个每单位像素数算
  function halfRange(w, h, vw) { return { hw: vw.span / 2, hh: vw.span * h / w / 2 }; }
  // 没有工作区范围时：图形数据里的单位长度 s（data-s，图形坐标系）在 cw 像素宽的画布上占的屏幕像素
  function figUnit(rect, cw, s) { return s * rect.width / cw; }
  // 屏幕位移（像素）→ 几何位移（单位），按 sc.unit。y 不取反：工作区 y 朝上，调用方决定符号
  function pxToUnits(d, unit) { return d / unit; }
  function unitsToPx(u, unit) { return u * unit; }

  // ---- 吸附 ----
  // 把世界点 wp（几何坐标）吸到附近的目标上：先吸整数顶点（vals 里图形的点），再吸边上的格点，最后吸整数格点。
  // vals：工作区里可见的值，每个有 fig = { type, pts: [{x, y}] }（点是有理数）；unit：每单位屏幕像素；
  // opts.px：吸附半径（屏幕像素）；opts.ref(v, i)：顶点 i 属于哪个自由点（没有就返回 null）；
  // opts.cons：构造点候选（中点等），每个 { x, y（数）, exact（精确有理数点）, label, con }；比顶点后、比边上的格点先。
  // 返回 { x, y, ref }：x、y 是精确有理数（整数或有理数的 num 值），ref 是被吸到的自由点 id 或 null；
  // 吸到构造点时还有 con（建哪个器材、接哪两个点）和 exact（精确坐标）。
  function snap(vals, wp, unit, opts) {
    const Q = G.U.Q, R = opts.px / unit, near = (x, y) => Math.hypot(x - wp.x, y - wp.y) <= R;
    let best = null, bd = Infinity;
    for (const v of vals) {
      const f = v.fig; if (!f || !f.pts) continue;
      f.pts.forEach((p, i) => {
        // 整数坐标的点都可以吸；分数坐标的点（中点、垂足、交点）只有它本身是一个器材（ref）时才吸，吸到的是这个器材，精确坐标跟着带上
        const intp = Q.isInt(p.x) && Q.isInt(p.y), r0 = opts.ref ? opts.ref(v, i) : null;
        if (!intp && !r0) return;
        const x = Q.num(p.x), y = Q.num(p.y), d = Math.hypot(x - wp.x, y - wp.y);
        if (d <= R && d < bd) { bd = d; best = { x, y, ref: r0 }; if (!intp) best.exact = { x: p.x, y: p.y }; }
      });
    }
    if (best) return best;
    let cb = null, cd = Infinity;
    for (const c of opts.cons || []) { const d = Math.hypot(c.x - wp.x, c.y - wp.y); if (d <= R && d < cd) { cd = d; cb = c; } }
    if (cb) return { x: cb.x, y: cb.y, ref: null, con: cb.con, exact: cb.exact };
    for (const v of vals) {
      const f = v.fig; if (!f || !f.pts || (f.type !== 'polygon' && f.type !== 'segment')) continue;
      const n = f.pts.length, m = f.type === 'polygon' ? n : 1;
      for (let i = 0; i < m; i++) {
        const ax = Q.num(f.pts[i].x), ay = Q.num(f.pts[i].y), bx = Q.num(f.pts[(i + 1) % n].x), by = Q.num(f.pts[(i + 1) % n].y);
        const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy; if (!L2) continue;
        const t = Math.max(0, Math.min(1, ((wp.x - ax) * dx + (wp.y - ay) * dy) / L2));
        const rx = Math.round(ax + t * dx), ry = Math.round(ay + t * dy);
        const on = Math.abs((rx - ax) * dy - (ry - ay) * dx) < 1e-9 && (rx - ax) * dx + (ry - ay) * dy >= -1e-9 && (rx - ax) * dx + (ry - ay) * dy <= L2 + 1e-9;
        if (on && near(rx, ry)) return { x: rx, y: ry, ref: null };
      }
    }
    return { x: Math.round(wp.x), y: Math.round(wp.y), ref: null };
  }

  UI.Space = {
    stageLocal, localToStage, stageToLocal, screenToStage, stageToScreen, stageCenter, stageDelta, zoomView, scaleLen, viewAt,
    canvasOf, screenToWorkspace, workspaceToScreen, stageToWorkspace, screenToCanvas,
    perUnit, canvasX, canvasY, canvasToWorkspace, workspaceToCanvas, halfRange, pxToUnits, unitsToPx, zoomSpan, figUnit,
    snap,
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
