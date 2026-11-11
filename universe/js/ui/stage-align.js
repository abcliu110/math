/* 台面（D4 拆分）：对齐与吸附：拖动时的对齐求解、参考线的关系判断。由 stage.js 拆出，只搬代码、不改逻辑；跨文件的名字经 UI.StageCtx（SG）访问。加载顺序见 index.html。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), W = U.World, K = U.kit, Q = U.Q;
  const $ = (s) => document.querySelector(s);
  const L = UI.LAYOUT, HD = L.HD, PORT_Y0 = L.PORT_Y0, PORT_DY = L.PORT_DY, PILL_DY = L.PILL_DY, PILL_W = L.PILL_W, MIN_W = L.MIN_W, MIN_H = L.MIN_H;
  const SG = UI.StageCtx;
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
  const gptPt = (id) => { const e = UI.S.scene.entities[id]; return { x: Q.parse(e.props.x), y: Q.parse(e.props.y) }; };
  // 工作区里点的名字（学生看到的 A、B……）：按 id 取，从画布上的点图形（标签）来；和 stage-draw 的 constructsOf 用同一个办法
  function pointNames(ws) {
    const m = {};
    for (const v of SG.wsVisible(ws)) { const fi = SG.figInfo(v); if (fi && fi.kind === 'pts' && v.fig.type === 'point' && fi.verts[0]) m[fi.verts[0] + '.p'] = v.label; }
    const wn = SG.wsNames();
    for (const k of Object.keys(wn)) if (!m[k]) m[k] = wn[k];
    return m;
  }
  // 拖动前准备：动点（拖动开始时的精确坐标）、动点之间的边（下标对），其余的顶点和边（动点本身和 exclude 指的图形不算）。名字用学生看到的
  function buildAlign(ws, base, edges, ids, exclude) {
    const names = pointNames(ws), O = [], OE = [];
    for (const v of SG.wsVisible(ws)) {
      if (exclude && exclude(v)) continue;
      const fi = SG.figInfo(v), pts = v.fig.pts || [], vid = fi && fi.kind === 'pts' ? fi.verts : null;
      const gid = (k) => (vid ? vid[k] : null), mv = (k) => { const g = gid(k); return !!g && ids.includes(g); };
      const nm = (k) => { const g = gid(k); return g && names[g + '.p'] ? names[g + '.p'] : null; };
      pts.forEach((p, k) => { if (!mv(k)) O.push({ p, name: nm(k) || v.label + '的顶点' }); });
      const n = pts.length, es = v.fig.type === 'polygon' ? pts.map((_, k) => [k, (k + 1) % n]) : v.fig.type === 'segment' ? [[0, 1]] : [];
      for (const [a, b] of es) {
        if (mv(a) || mv(b)) continue;
        OE.push({ a: pts[a], b: pts[b], name: nm(a) && nm(b) ? nm(a) + nm(b) : v.label + '的边' });
        // 边的中点（V4 剩余，1.3）：块的顶点可以对齐到别的图形边的中点（整数坐标的中点才能落在整数平移上）；等距判断不用它
        O.push({ p: { x: Q.div(Q.add(pts[a].x, pts[b].x), Q(2)), y: Q.div(Q.add(pts[a].y, pts[b].y), Q(2)) }, name: nm(a) && nm(b) ? nm(a) + nm(b) + ' 的中点' : v.label + ' 的边的中点', mid: true });
      }
    }
    return { base, edges, ids, others: O, oedges: OE, alt: false };
  }
  // 整个图形（自由点围成的，或摆放出来的）的对齐准备
  function alignOfFig(wsId, fi) {
    const ws = UI.S.scene.entities[wsId], ex = (v) => v.id === fi.ent.id;
    if (fi.kind === 'place') return buildAlign(ws, fi.f.pts, edgesOf(fi.f), [], ex);
    const ids = SG.uniq(fi.verts), base = ids.map((g) => gptPt(g));
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
        if (!al.frac && (!Q.isInt(tx) || !Q.isInt(ty))) continue;   // 块（frac）的平移是有理数，分数中点也能吸；其余只吸整数平移
        const d = pxd(Q.num(tx) - Tc.x, Q.num(ty) - Tc.y);
        if (d <= ALIGN_PX && (!bc || d < bc.d)) bc = { d, x: tx, y: ty };
      }
      if (bc) T = { x: bc.x, y: bc.y };
      else {
        // 2. 单方向：顶点同一竖线 / 横线、坐标轴、竖直（水平）的边共线；每个方向取最近的
        const cx = [], cy = [];
        const add = (L, val, d) => { if ((al.frac || Q.isInt(val)) && d <= ALIGN_PX) L.push({ val, d }); };
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
          if (sx && sy) add('pt' + at.x + ',' + at.y, { k: 'pt', x: at.x, y: at.y, at, text: v.mid ? '落在 ' + v.name + ' 上' : '顶点重合' });
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
          if (O[a].name === O[b].name || O[a].mid || O[b].mid) continue;
          const d1 = d2(p, O[a].p), e2 = d2(p, O[b].p);
          if (Q.eq(d1, Q(0)) || !Q.eq(d1, e2)) continue;
          add('eq' + numP(p).x + ',' + numP(p).y + O[a].name + O[b].name, { k: 'seg2', a: numP(O[a].p), b: numP(O[b].p), at: numP(p), text: '与 ' + O[a].name + '、' + O[b].name + ' 等距' });
          n++;
        }
      }
    }
    return { dx: Q.num(T.x), dy: Q.num(T.y), dxq: T.x, dyq: T.y, guides };   // dxq、dyq 是精确的有理数平移（块拖动用）
  }
  // 卡片拖动吸附（V4 剩余，1.3）：卡片不是几何对象，所以在屏幕上吸：卡片中心离可见工作区里某个顶点或线段（多边形边）的中点在 SNAP_PX 像素内，
  // 就吸过去，返回新的卡片位置和写给学生看的名字（“AB 的中点”）；Alt 按住或吸附开关关了就不吸。被拖的卡片本身的工作区不参与。
  function cardSnap(ev, id, x, y) {
    const S = UI.S, e = S.scene.entities[id];
    if (!e || SG.snapFree(ev)) return null;
    const g = SG.geom(e), cen = UI.Space.stageToScreen({ x: x + g.w / 2, y: y + g.h / 2 }, S.view);
    let best = null;
    for (const wb of document.querySelectorAll('svg.wsbody')) {
      const wid = wb.dataset.wsid, ws = S.scene.entities[wid];
      if (!ws || wid === id) continue;
      const fr = SG.wsFrame(ws, +wb.getAttribute('width'), +wb.getAttribute('height')), sc = UI.Space.canvasOf(wb.getBoundingClientRect(), fr.vw.span);
      const names = pointNames(ws);
      const consider = (p, label) => {
        const q = UI.Space.workspaceToScreen(p, fr.vw, sc), d = Math.hypot(q.x - cen.x, q.y - cen.y);
        if (d <= SG.SNAP_PX && (!best || d < best.d)) best = { d, q, label };
      };
      for (const v of fr.vals) {
        const f = v.fig; if (!f || !f.pts || f.type === 'circle') continue;
        const P = f.pts.map((p) => ({ x: Q.num(p.x), y: Q.num(p.y) }));
        // 名字用学生看到的点名（A、B……）：有就写“AB 的中点”，没有就用图形的名字
        const fi = SG.figInfo(v), nmk = (k) => (fi && fi.kind === 'pts' && names[fi.verts[k] + '.p']) || null;
        if (f.type === 'point') consider(P[0], nmk(0) || v.label);
        else {
          P.forEach((p, k) => consider(p, nmk(k) || v.label + '的顶点'));
          const n = P.length, es = f.type === 'polygon' ? P.map((_, k) => [k, (k + 1) % n]) : f.type === 'segment' ? [[0, 1]] : [];
          for (const [a, b] of es) consider({ x: (P[a].x + P[b].x) / 2, y: (P[a].y + P[b].y) / 2 }, nmk(a) && nmk(b) ? nmk(a) + nmk(b) + ' 的中点' : v.label + ' 的边的中点');
        }
      }
      // 几何交点：工作区里两条边（多边形的边、线段）在它们内部相交的点（端点已经是顶点，不重复算）
      const edges = [];
      for (const v of fr.vals) {
        const f = v.fig; if (!f || !f.pts || f.type === 'circle' || f.type === 'point') continue;
        const P = f.pts.map((p) => ({ x: Q.num(p.x), y: Q.num(p.y) })), fi = SG.figInfo(v), n = P.length;
        const nm = (k) => (fi && fi.kind === 'pts' && names[fi.verts[k] + '.p']) || null;
        const es = f.type === 'polygon' ? P.map((_, k) => [k, (k + 1) % n]) : [[0, 1]];
        for (const [a, b] of es) edges.push({ A: P[a], B: P[b], label: nm(a) && nm(b) ? nm(a) + nm(b) : v.label });
      }
      for (let i = 0; i < edges.length; i++) for (let j = i + 1; j < edges.length; j++) {
        const e1 = edges[i], e2 = edges[j];
        const r = { x: e1.B.x - e1.A.x, y: e1.B.y - e1.A.y }, t2 = { x: e2.B.x - e2.A.x, y: e2.B.y - e2.A.y };
        const den = r.x * t2.y - r.y * t2.x; if (Math.abs(den) < Number.EPSILON) continue;
        const qx = e2.A.x - e1.A.x, qy = e2.A.y - e1.A.y;
        const t = (qx * t2.y - qy * t2.x) / den, u = (qx * r.y - qy * r.x) / den;
        if (t <= 1e-9 || t >= 1 - 1e-9 || u <= 1e-9 || u >= 1 - 1e-9) continue;
        consider({ x: e1.A.x + t * r.x, y: e1.A.y + t * r.y }, e1.label + ' 与 ' + e2.label + ' 的交点');
      }
    }
    if (!best) return null;
    const w = UI.Space.screenToStage({ clientX: best.q.x, clientY: best.q.y }, S.view);
    return { x: w.x - g.w / 2, y: w.y - g.h / 2, label: best.label };
  }
  // ---- 多选对齐与等距分布（§10.5.9 第 3 条）：选中两个以上的图形，工具条上的八个按钮 ----
  // 每个按钮是一个手势（UI.Intent 的 align），整批 set 是一步撤销。算法全部用精确的有理数（Q）：
  // 目标位置和每个图形的平移量都必须是整数（自由点只存整数），做不到就说明原因、不动图形。
  const ALIGN_LABEL = { l: '左对齐', r: '右对齐', t: '顶对齐', b: '底对齐', hc: '水平居中', vc: '垂直居中', dh: '水平等距', dv: '垂直等距' };
  // 图形的外框（工作区坐标，Q 值）：边缘是哪一个顶点，就用哪一个的 Q 值（不转成数字，免得丢精度）
  function alignBoxOf(fi) {
    const P = fi.f.pts || [];
    const pick = (cmp, key) => P.reduce((m, q) => (!m || cmp(Q.num(q[key]), Q.num(m[key])) ? q : m), null);
    const lo = (k) => pick((a, b) => a < b, k)[k], hi = (k) => pick((a, b) => a > b, k)[k];
    return { x0: lo('x'), x1: hi('x'), y0: lo('y'), y1: hi('y') };
  }
  // 平移一个图形：块和摆放改 dx、dy；自由点围成的图形（或单个点）改每个顶点的 x、y（共用的顶点只挪一次）
  function alignMoveOps(fi, dx, dy, into) {
    if (fi.kind === 'pts') {
      for (const g of SG.uniq(fi.verts)) {
        const old = into.get(g);
        if (old) { if (!Q.eq(old.x, dx) || !Q.eq(old.y, dy)) return false; continue; }   // 同一个顶点被要求了不同的平移
        into.set(g, { x: dx, y: dy });
      }
      return true;
    }
    into.set(fi.ent.id, { piece: true, x: dx, y: dy });
    return true;
  }
  function alignWs(wsId, op) {
    const S = UI.S, E = S.scene.entities, items = [];
    for (const n of S.wsSel || []) {
      const fi = SG.figByName(wsId, n);
      if (!fi || items.some((it) => it.fi.ent.id === fi.ent.id)) continue;
      items.push({ fi, box: alignBoxOf(fi) });
    }
    const say = (why) => { SG.setMsg(why, false); return SG.render(); };
    if (items.length < 2) return say('对齐要先选两个以上的图形（按住 Shift 点）');
    if ((op === 'dh' || op === 'dv') && items.length < 3) return say('等距分布要至少三个图形（两个图形只有一个间距，没什么可分）');
    const ax = op === 'l' || op === 'r' || op === 'hc' || op === 'dh' ? 'x' : 'y';
    const lo = (it) => it.box[ax + '0'], hi = (it) => it.box[ax + '1'], mid = (it) => Q.div(Q.add(lo(it), hi(it)), Q(2));
    const minQ = (xs) => xs.reduce((m, v) => (!m || Q.num(v) < Q.num(m) ? v : m), null);
    const maxQ = (xs) => xs.reduce((m, v) => (!m || Q.num(v) > Q.num(m) ? v : m), null);
    // 每个图形要平移多少（Q 值）：这一步的目标位置
    let shift;
    if (op === 'l' || op === 'b') { const T = minQ(items.map((it) => (op === 'l' ? lo(it) : it.box.y0))); shift = (it) => Q.sub(T, op === 'l' ? lo(it) : it.box.y0); }
    else if (op === 'r' || op === 't') { const T = maxQ(items.map((it) => (op === 'r' ? hi(it) : it.box.y1))); shift = (it) => Q.sub(T, op === 'r' ? hi(it) : it.box.y1); }
    else if (op === 'hc' || op === 'vc') {
      const T = Q.div(Q.add(minQ(items.map(lo)), maxQ(items.map(hi))), Q(2));
      shift = (it) => Q.sub(T, mid(it));
    } else {
      // 等距：按起点排（从左到右，或从下到上），两端不动，中间的间距都是 gap（必须是整数）
      const sorted = items.slice().sort((a, b) => (Q.num(lo(a)) - Q.num(lo(b))));
      const F = sorted[0], L = sorted[sorted.length - 1];
      const W = sorted.reduce((s, it) => Q.add(s, Q.sub(hi(it), lo(it))), Q(0));
      const gap = Q.div(Q.sub(Q.sub(hi(L), lo(F)), W), Q(sorted.length - 1));
      if (!Q.isInt(gap)) return say('间距不是整数（' + Q.show(gap) + '），自由点只存整数格：先把图形挪到间距能整除的位置');
      const at = new Map();
      let cur = lo(F);
      for (const it of sorted) { at.set(it, cur); cur = Q.add(cur, Q.add(Q.sub(hi(it), lo(it)), gap)); }
      shift = (it) => Q.sub(at.get(it), lo(it));
    }
    // 生成每个图形的平移；锁定的图形不能动；所有平移量必须是整数
    const into = new Map();
    for (const it of items) {
      const d = shift(it), dx = ax === 'x' ? d : Q(0), dy = ax === 'y' ? d : Q(0);
      if (!Q.isInt(d)) return say('这样对齐会落在非整数的位置（自由点只存整数格），先把图形挪到格点上');
      if (Q.eq(d, Q(0))) continue;
      if (it.fi.ent.props.locked) return say('「' + (it.fi.ent.name || '这个图形') + '」锁定了，不能移动');
      if (!alignMoveOps(it.fi, dx, dy, into)) return say('有顶点同时属于几个图形，它们要的位置不同，没法一起对齐');
    }
    if (!into.size) return say('已经是这样对齐的了');
    // 转成动作：块改 dx/dy（加上原值），顶点改 x/y（加上原值）
    const ops = [];
    for (const [id, m] of into) {
      const e = E[id], px = m.piece ? 'dx' : 'x', py = m.piece ? 'dy' : 'y';
      if (!Q.eq(m.x, Q(0))) ops.push({ id, k: px, v: Q.num(Q.add(Q(e.props[px]), m.x)) });
      if (!Q.eq(m.y, Q(0))) ops.push({ id, k: py, v: Q.num(Q.add(Q(e.props[py]), m.y)) });
    }
    const r = UI.Intent.run('align', { ws: wsId, ops, label: ALIGN_LABEL[op] });
    if (r && r.ok === false) return say(r.why || '这一步做不了');
    SG.setMsg(ALIGN_LABEL[op] + '：' + items.length + ' 个图形已对齐（撤销一步回去）', true);
    return SG.render();
  }
  Object.assign(SG, { ALIGN_PX, GUIDE_COL, cr2, dt2, vsb, numP, rnd, pdist, gapSeg, edgesOf, gptPt, buildAlign, alignOfFig, alignSolve, cardSnap, alignWs, ALIGN_LABEL });
})(window);
