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
  const gptPt = (id) => { const e = UI.S.scene.entities[id]; return { x: Q(e.props.x), y: Q(e.props.y) }; };
  // 拖动前准备：动点（拖动开始时的精确坐标）、动点之间的边（下标对），其余的顶点和边（动点本身和 exclude 指的图形不算）。名字用学生看到的
  function buildAlign(ws, base, edges, ids, exclude) {
    const names = SG.wsNames(), O = [], OE = [];
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
  Object.assign(SG, { ALIGN_PX, GUIDE_COL, cr2, dt2, vsb, numP, rnd, pdist, gapSeg, edgesOf, gptPt, buildAlign, alignOfFig, alignSolve });
})(window);
