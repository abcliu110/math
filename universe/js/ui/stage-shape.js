/* 台面（D4 拆分）：图形直接编辑：拖整个图形、拖边、放缩、旋转、左右翻转。由 stage.js 拆出，只搬代码、不改逻辑；跨文件的名字经 UI.StageCtx（SG）访问。加载顺序见 index.html。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), W = U.World, K = U.kit, Q = U.Q;
  const $ = (s) => document.querySelector(s);
  const L = UI.LAYOUT, HD = L.HD, PORT_Y0 = L.PORT_Y0, PORT_DY = L.PORT_DY, PILL_DY = L.PILL_DY, PILL_W = L.PILL_W, MIN_W = L.MIN_W, MIN_H = L.MIN_H;
  const SG = UI.StageCtx;
  // ---- 工作区里直接用鼠标改图形（§10.5.8 B）----
  // 一个图形能被怎么改，看它从哪里来：由自由点（gpt）直接围成的（kind 'pts'，改点的 x、y）；
  // 块（'piece'，用块的动作：移、转、翻、放缩）；摆放出来的（'place'，改 dx、dy、turn、flip）。
  // 顶点是不是自由点，靠连线查：多边形或线段的输入口接着的 gpt 器材，坐标对得上的就是它的顶点。
  const uniq = (xs) => xs.filter((x, i) => xs.indexOf(x) === i);
  const SNAP_PX = 9;
  const minQ = (a) => a.reduce((m, q) => (Q.cmp(q, m) < 0 ? q : m));
  const maxQ = (a) => a.reduce((m, q) => (Q.cmp(q, m) > 0 ? q : m));
  const modT = (x) => ((x % 4) + 4) % 4;
  // 精确的旋转（2026-11）：转 A 度（整数度），cos、sin 取一对有理数，满足 cos² + sin² = 1（勾股数：
  //   t ≈ tan(r/2) 取分母不大的分数 p/q，cos = (q²−p²)/(q²+p²)，sin = 2pq/(q²+p²)）。这样转过去的图形和原来全等：
  //   边长、角、面积一点不变（长方形转完还是长方形，面积还是原来的数），不再把每个顶点四舍五入到 1/100 而把形状转歪。
  //   90° 的倍数是精确的；余下的 r（−45° 到 45°）误差不到 0.05°。
  function rotCS(A, tolDeg) {
    let k = Math.round(A / 90), r = A - 90 * k;
    let c = Q(1), sn = Q(0);
    if (Math.abs(r) > 1e-9) {
      const x = Math.tan(r * Math.PI / 360), tol = (tolDeg || 0.05) * Math.PI / 180, qmax = tolDeg && tolDeg < 0.05 ? 4000 : 400;
      let best = null;
      for (let q = 1; q <= qmax; q++) {
        const pp = Math.round(x * q); if (!pp) continue;
        const err = Math.abs(2 * Math.atan(pp / q) - r * Math.PI / 180);
        if (!best || err < best.err) best = { p: pp, q, err };
        if (err < tol) break;
      }
      if (best) {   // 角度小到分母 qmax 以内的分数都表示不了（比 0.01° 还小）：就当没转
        const P = BigInt(best.p), QQ = BigInt(best.q), den = QQ * QQ + P * P;
        c = Q(QQ * QQ - P * P, den); sn = Q(2n * P * QQ, den);
      }
    }
    k = modT(k);
    for (let j = 0; j < k; j++) { const t = c; c = Q.neg(sn); sn = t; }   // 再转 90°：(c, s) → (−s, c)
    return { c, s: sn };
  }
  // 有理数的平方根（是完全平方才有，否则 null）：判断“转到和某条边平行”“放缩到和某条边等长”能不能精确做到
  const isqrtB = (n) => { if (n < 2n) return n; let x = BigInt(Math.floor(Math.sqrt(Number(n)))); while (x * x > n) x--; while ((x + 1n) * (x + 1n) <= n) x++; return x; };
  const sqrtQ = (q) => { if (q.n < 0n) return null; const a = isqrtB(q.n), b = isqrtB(q.d); return a * a === q.n && b * b === q.d ? Q(a, b) : null; };
  const dotQ = (u, w) => Q.add(Q.mul(u.x, w.x), Q.mul(u.y, w.y)), crsQ = (u, w) => Q.sub(Q.mul(u.x, w.y), Q.mul(u.y, w.x));
  const DEG_PER_RAD = 180 / Math.PI;
  const angOf = (u) => Math.atan2(Q.num(u.y), Q.num(u.x)) * DEG_PER_RAD;
  // 转 deg 度（deg 是要转到的角度，和 u→w 的方向差差 180° 的整数倍）：u 转过去和 w 平行。
  // |u|·|w| 是有理数时精确（cos = u·w / |u||w|，sin = u×w / |u||w|）；否则用勾股数近似，误差不到 0.005°
  function rotToward(u, w, deg) {
    const L = sqrtQ(Q.mul(dotQ(u, u), dotQ(w, w)));
    if (!L || L.n === 0n) return Object.assign(rotCS(deg, 0.005), { exact: false });
    let c = Q.div(dotQ(u, w), L), sn = Q.div(crsQ(u, w), L);
    const base = Math.atan2(Q.num(sn), Q.num(c)) * 180 / Math.PI;
    if (Math.round((deg - base) / 180) % 2) { c = Q.neg(c); sn = Q.neg(sn); }   // 差 180°：反过来
    return { c, s: sn, exact: true };
  }
  const rotPts = (B, cq, R) => B.map((b) => { const dx = Q.sub(b.x, cq.x), dy = Q.sub(b.y, cq.y); return { x: Q.add(cq.x, Q.sub(Q.mul(dx, R.c), Q.mul(dy, R.s))), y: Q.add(cq.y, Q.add(Q.mul(dx, R.s), Q.mul(dy, R.c))) }; });
  const normDeg = (a) => ((a + 180) % 360 + 360) % 360 - 180;
  // 自己的边的名字（AB），没有名字的用“边”
  function ownEdgeNames(wsId, ids, edges) {
    const nm = SG.pointNames(UI.S.scene.entities[wsId]);
    return edges.map(([i, j]) => (nm[ids[i] + '.p'] && nm[ids[j] + '.p'] ? '边 ' + nm[ids[i] + '.p'] + nm[ids[j] + '.p'] : '这条边'));
  }
  // 旋转的吸附（2026-11）：转到某条边水平、竖直，或者和别的图形的边平行、垂直；离鼠标的角度在阈值里就吸过去。
  // 返回 { deg, R, guides }。没有吸附：按 step 取整（1°，Shift 15°）
  function rotSnap(d, raw, step, free) {
    const B = d.base, al = d.al, cands = [];
    if (!free) {
      const thr = Math.max(1.5, Math.min(4, (L.ROT_SNAP_PX / Math.max(20, d.rpx)) * 180 / Math.PI));
      const near = (target) => { const t = target + 360 * Math.round((raw - target) / 360); return { t, e: Math.abs(t - raw) }; };
      const dirs = [{ w: { x: Q(1), y: Q(0) }, kind: 'h' }, { w: { x: Q(0), y: Q(1) }, kind: 'v' }];
      for (const o of al.oedges) { const w = { x: Q.sub(o.b.x, o.a.x), y: Q.sub(o.b.y, o.a.y) }; if (Q.eq(w.x, Q(0)) && Q.eq(w.y, Q(0))) continue; dirs.push({ w, kind: 'par', o }, { w: { x: Q.neg(w.y), y: w.x }, kind: 'perp', o }); }
      al.edges.forEach(([i, j], ei) => {
        const u = { x: Q.sub(B[j].x, B[i].x), y: Q.sub(B[j].y, B[i].y) }; if (Q.eq(u.x, Q(0)) && Q.eq(u.y, Q(0))) return;
        const au = angOf(u);
        for (const dd of dirs) {
          const need = angOf(dd.w) - au;
          for (const t0 of [need, need + 180]) { const n = near(t0); if (n.e <= thr) cands.push(Object.assign({ deg: n.t, e: n.e, u, ei }, dd)); }
        }
      });
      const z = near(0); if (z.e <= thr) cands.push({ deg: z.t, e: z.e, kind: 'zero' });
    }
    // 优先级：误差小的先；同样近时，水平竖直 > 平行垂直
    cands.sort((a, b) => a.e - b.e || (a.kind === 'h' || a.kind === 'v' ? -1 : 0) - (b.kind === 'h' || b.kind === 'v' ? -1 : 0));
    const c = cands[0];
    if (!c) { const deg = normDeg(Math.round(raw / step) * step); return { deg, R: rotCS(deg), guides: [], snapped: false }; }
    const deg = normDeg(c.deg);
    if (c.kind === 'zero') return { deg: 0, R: { c: Q(1), s: Q(0) }, guides: [], snapped: true, text: '回到原来的方向' };
    const R = rotToward(c.u, c.w, c.deg), P = rotPts(B, d.cq, R), [i, j] = al.edges[c.ei], a = SG.numP(P[i]), b = SG.numP(P[j]), mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const en = d.enames[c.ei], ap = R.exact ? '' : '（近似）';   // 边长是无理数时转不到精确的平行，写明是近似
    const g = [{ k: 'seg', a, b, at: mid }];
    if (c.kind === 'h') g.push({ k: 'hl', y: mid.y, at: mid, text: en + ' 水平' + ap });
    else if (c.kind === 'v') g.push({ k: 'vl', x: mid.x, at: mid, text: en + ' 竖直' + ap });
    else g.push({ k: 'ln', a: SG.numP(c.o.a), b: SG.numP(c.o.b), at: mid, text: en + (c.kind === 'par' ? ' ∥ ' : ' ⊥ ') + c.o.name + ap });
    return { deg, R, guides: g, snapped: true };
  }
  // 放缩的吸附（2026-11）：放缩以后某个顶点和别的图形的顶点同一竖线 / 横线、落在坐标轴上，或者某条边和别的图形的边等长。
  // A 是放缩中心（不动的点），tp 是鼠标处的比例，v0len 是拖的角到 A 的距离（坐标单位），用来把比例的差换成屏幕像素
  function scaleSnap(d, A, tp, v0len, unit) {
    const B = d.base, al = d.al, cands = [], thr = L.SCALE_SNAP_PX;
    const tryF = (f, e) => { if (Q.cmp(f, Q(0)) <= 0) return; const px = UI.Space.unitsToPx(Math.abs(Q.num(f) - tp) * v0len, unit); if (px <= thr) cands.push(Object.assign({ f, px }, e)); };
    for (const b of B) {
      const bx = Q.sub(b.x, A.x), by = Q.sub(b.y, A.y);
      if (!Q.eq(bx, Q(0))) { for (const o of al.others) if (!o.mid) tryF(Q.div(Q.sub(o.p.x, A.x), bx), { kind: 'x' }); tryF(Q.div(Q.neg(A.x), bx), { kind: 'x' }); }
      if (!Q.eq(by, Q(0))) { for (const o of al.others) if (!o.mid) tryF(Q.div(Q.sub(o.p.y, A.y), by), { kind: 'y' }); tryF(Q.div(Q.neg(A.y), by), { kind: 'y' }); }
    }
    al.edges.forEach(([i, j], ei) => {
      const u = { x: Q.sub(B[j].x, B[i].x), y: Q.sub(B[j].y, B[i].y) }, l2 = dotQ(u, u); if (l2.n === 0n) return;
      for (const o of al.oedges) { const w = { x: Q.sub(o.b.x, o.a.x), y: Q.sub(o.b.y, o.a.y) }, f = sqrtQ(Q.div(dotQ(w, w), l2)); if (f) tryF(f, { kind: 'len', ei, o }); }
    });
    cands.sort((a, b) => a.px - b.px || (a.kind === 'len' ? -1 : 1));
    return cands[0] || null;
  }
  // 屏幕像素 → 工作区坐标：sc.unit 是一个坐标单位占的屏幕像素（已经算进台面的缩放）
  // 一个可以改的目标：实体 id、两个属性名（kx、ky）、原来的值、允许的范围
  function tgt(id, kx, ky) {
    const e = UI.S.scene.entities[id], P = U.types[e.type].props;
    const rg = (k) => [P[k] && P[k].min !== undefined ? P[k].min : -1e9, P[k] && P[k].max !== undefined ? P[k].max : 1e9];
    const a = rg(kx), b = rg(ky);
    // x0、y0 是属性里存的原样（整数是普通数字，分数是 "n/d"）；qx、qy 是精确的有理数，平移算的是它们
    return { id, kx, ky, x0: e.props[kx], y0: e.props[ky], qx: Q.parse(e.props[kx]), qy: Q.parse(e.props[ky]), lo: [a[0], b[0]], hi: [a[1], b[1]] };
  }
  // 一个图形的编辑信息：kind、实体、顶点（自由点的 id）、边（顶点下标对）。不能直接改的返回 null
  function figInfo(v) {
    const E = UI.S.scene.entities, ent = E[v.id], f = v.fig;
    if (!ent || !f) return null;
    if (SG.roleOf(ent) === 'piece') return { kind: 'piece', ent, f, verts: [], edges: [] };
    if (SG.defOf(ent).figEdit === 'place') return { kind: 'place', ent, f, verts: [], edges: [] };
    if (SG.roleOf(ent) === 'point' && f.type === 'point') return { kind: 'pts', ent, f, verts: [ent.id], edges: [] };
    if (f.type !== 'polygon' && f.type !== 'segment') return null;
    const srcs = uniq(UI.S.scene.links.filter((l) => l.to === ent.id && E[l.from] && SG.roleOf(E[l.from]) === 'point').map((l) => l.from));
    const verts = [];
    for (const p of f.pts) {
      const g = srcs.find((id) => Q.eq(Q.parse(E[id].props.x), p.x) && Q.eq(Q.parse(E[id].props.y), p.y));
      if (!g) return null;
      verts.push(g);
    }
    const n = verts.length, edges = f.type === 'polygon' ? verts.map((_, i) => [i, (i + 1) % n]) : [[0, 1]];
    return { kind: 'pts', ent, f, verts, edges };
  }
  function figByName(wsId, name) {
    const ws = UI.S.scene.entities[wsId]; if (!ws || !name) return null;
    const v = SG.wsVisible(ws).find((x) => SG.pickOf(x) === name); return v ? figInfo(v) : null;
  }
  const moveTargets = (fi) => (fi.kind === 'place' ? [tgt(fi.ent.id, 'dx', 'dy')] : uniq(fi.verts).map((g) => tgt(g, 'x', 'y')));
  // 开始一次图形拖动（tr 平移、sc 放缩、rot 旋转、pscale 块放缩、prot 块旋转、lrot 摆放的旋转）。
  // 拖动时只改实体的属性做预览，松手时还原，再把整段拖动记成一步（shapeUp）。坐标范围在拖动开始时冻结。
  function startShape(ev, wb, wsId, mode, targets, extra) {
    const S = UI.S, ws = S.scene.entities[wsId]; if (!ws) return;
    const fr = SG.wsFrame(ws, +wb.getAttribute('width'), +wb.getAttribute('height'));
    UI.State.setUi(ws, 'view', fr.vw);
    const sc = UI.Space.canvasOf(wb.getBoundingClientRect(), fr.vw.span);
    SG.drag = Object.assign({ kind: 'shape', mode, wsId, v: fr.vw, sc, unit: sc.unit, sx: ev.clientX, sy: ev.clientY, start: UI.Space.screenToWorkspace(ev, fr.vw, sc), targets, moved: false, out: [], f: Q(1), k: 0, guides: [] }, extra || {});
  }
  // 按下一个把手：边（整条边平移）、角（放缩）、旋转把手
  function startHandle(hd, ev) {
    const S = UI.S, wb = hd.closest('.wsbody'), wsId = wb.dataset.wsid, kind = hd.dataset.hdl;
    if (kind === 'edge') {
      if (hd.dataset.pick) SG.wsPick(hd.dataset.pick, ev.shiftKey);
      const gids = uniq(hd.dataset.gids.split(','));
      startShape(ev, wb, wsId, 'tr', gids.map((g) => tgt(g, 'x', 'y')), { align: SG.buildAlign(S.scene.entities[wsId], gids.map((g) => SG.gptPt(g)), gids.length > 1 ? [[0, 1]] : [], gids, null) });
      SG.render(); return;
    }
    const name = (S.wsSel || []).length === 1 ? S.wsSel[0] : null, fi = name ? figByName(wsId, name) : null;
    if (!fi || !fi.f.pts) return;
    const pts = fi.f.pts, qb = { x0: minQ(pts.map((p) => p.x)), x1: maxQ(pts.map((p) => p.x)), y0: minQ(pts.map((p) => p.y)), y1: maxQ(pts.map((p) => p.y)) };
    const polyLike = fi.kind === 'pts' && fi.f.type !== 'point';
    if (kind === 'corner') {
      const corner = +hd.dataset.corner;
      if (fi.kind === 'piece') return startShape(ev, wb, wsId, 'pscale', [], { id: fi.ent.id, s0: fi.ent.props.scale, qb, corner });
      if (polyLike) return startShape(ev, wb, wsId, 'sc', uniq(fi.verts).map((g) => tgt(g, 'x', 'y')), Object.assign({ qb, corner }, snapPrep(wsId, fi)));
      return;
    }
    if (kind === 'rot') {
      const cf = { x: (Q.num(qb.x0) + Q.num(qb.x1)) / 2, y: (Q.num(qb.y0) + Q.num(qb.y1)) / 2 };
      const c = cf;   // 旋转中心：外框的中心（cq 是精确的有理数，自由点图形按它精确地转）
      const cq = { x: Q.div(Q.add(qb.x0, qb.x1), Q(2)), y: Q.div(Q.add(qb.y0, qb.y1), Q(2)) };
      if (fi.kind === 'piece') return startShape(ev, wb, wsId, 'prot', [], { id: fi.ent.id, t0: fi.ent.props.turn, a0: SG.approxOf(fi.ent), A0: SG.totalDeg(fi.ent), c, qb });
      if (fi.kind === 'place') return startShape(ev, wb, wsId, 'lrot', [], { id: fi.ent.id, t0: fi.ent.props.turn, c, qb });
      if (polyLike) {
        startShape(ev, wb, wsId, 'rot', uniq(fi.verts).map((g) => tgt(g, 'x', 'y')), Object.assign({ c, cq, qb }, snapPrep(wsId, fi)));
        const dd = SG.drag; dd.rpx = UI.Space.unitsToPx(Math.hypot(dd.start.x - c.x, dd.start.y - c.y), dd.unit);   // 旋转把手到中心的屏幕距离（定吸附的角度阈值）
        return;
      }
    }
  }
  // 旋转、放缩的吸附准备：自己的顶点（精确坐标）、边、边的名字，别的图形的顶点和边（不含自己）
  function snapPrep(wsId, fi) {
    const al = SG.alignOfFig(wsId, fi);
    return { al, base: al.base, enames: ownEdgeNames(wsId, al.ids, al.edges) };
  }
  // 拖动自由点时的构造点候选（V4，§1.3 第 2、6 条）：别的图形的中点、交点（器材声明的 snap：of 为 edge、cross），
  // 以及别的自由点 R 到边所在直线的垂足（foot 声明，起点是 R）。拖动开始时算一次（拖动时别的图形不变）；不要用这个点自己的线。
  function dragCons(d) {
    if (d.cons) return d.cons;
    const ws = UI.S.scene.entities[d.wsId], vals = SG.wsVisible(ws), names = SG.wsNames(), P = d.pt, out = [];
    const usesP = (c) => c.con.ids.includes(P) || (c.con.extra || []).some((e) => e.id === P);
    for (const c of SG.constructsOf(vals, names, null)) if (!usesP(c)) out.push(c);
    for (const v of vals) {
      const fi = SG.figInfo(v); if (!fi || fi.kind !== 'pts' || v.fig.type !== 'point') continue;
      const R = fi.verts[0]; if (!R || R === P) continue;
      const rp = v.fig.pts[0];
      for (const c of SG.constructsOf(vals, names, { ref: R, x: Q.num(rp.x), y: Q.num(rp.y), exact: rp })) if (c.con.extra && c.con.extra.length && !usesP(c)) out.push(c);
    }
    d.cons = out; return out;
  }
  // 拖动中的点落在构造点的吸附半径（SNAP_PX 屏幕像素）里：返回最近的那个候选，否则 null
  function snapDragCon(d, mx, my) {
    const t = d.targets[0], px = Q.num(t.qx) + UI.Space.pxToUnits(mx, d.unit), py = Q.num(t.qy) - UI.Space.pxToUnits(my, d.unit);   // 坐标可能是分数，用 qx、qy
    let best = null, bd = Infinity;
    for (const c of dragCons(d)) { const dd = UI.Space.unitsToPx(Math.hypot(c.x - px, c.y - py), d.unit); if (dd <= SG.SNAP_PX && dd < bd) { bd = dd; best = c; } }
    return best;
  }
  // ---- 约束锁定（§10.5.9 第 1 条）：界面只问内核（U.Geo.locks），不认器材名 ----
  const touchesLock = (scene, ids) => U.Geo.locks.of(scene).some((c) => [c.a, c.b, c.c].some((k) => ids.includes(k)));
  // 拖动的门：一个点只能落在约束允许的位置（离鼠标最近的）；一组图形整体动，约束要都在组里（刚体）
  function lockGate(scene, d, dX, dY) {
    if (!d.pt) {
      const ids = d.targets.map((t) => t.id);
      return U.Geo.locks.rigid(scene, ids) ? { dX, dY, locked: false, tip: '' } : { dX: 0, dY: 0, locked: true, tip: '这块图形有约束连着外面的点，先解锁' };
    }
    // 用精确的 qx、qy 算位置（自由点是整数，结果与原来一样；约束的门不会因为分数写法被绕过）
    const t = d.targets[0], x0 = Q.num(t.qx), y0 = Q.num(t.qy);
    const r = U.Geo.locks.fit(scene, d.pt, { x: x0 + dX, y: y0 + dY });
    if (!r.ok) return { dX: 0, dY: 0, locked: true, tip: r.why };
    if (!r.locked) return { dX, dY, locked: false, tip: '' };
    const same = r.x === x0 + dX && r.y === y0 + dY;
    return { dX: r.x - x0, dY: r.y - y0, locked: true, tip: same ? '' : '约束：只能落在允许的位置' };
  }
  // 线段的定长约束（没有锁就是 null），画标签和读数用
  const segLenLock = (segId) => { const ends = U.Geo.locks.segEnds(UI.S.scene, segId); return ends ? U.Geo.locks.lenOf(UI.S.scene, ends) : null; };
  // 工具条的「锁长 / 锁直角」：选中一条线段或一个多边形时，说明它现在能做什么；没有可锁的就没有按钮
  function lockTarget(wsId) {
    const S = UI.S, sel = S.wsSel || [];
    if (sel.length !== 1) return null;
    const fi = figByName(wsId, sel[0]); if (!fi || fi.kind !== 'pts') return null;
    const LK = U.Geo.locks;
    if (fi.f.type === 'segment') {
      const ends = LK.segEnds(S.scene, fi.ent.id); if (!ends) return null;
      const on = !!LK.lenOf(S.scene, ends);
      return { seg: fi.ent.id, ws: wsId, label: on ? '解锁长' : '锁长', tip: on ? '解开这条线段的长度（拖动以后可以自由改变）' : '锁住这条线段的长度：拖动端点时长不变；双击长度的数字可以直接改' };
    }
    if (fi.f.type === 'polygon') {
      const tris = LK.rightAt(S.scene, fi.verts);
      if (!tris.length) return null;
      const on = tris.every((t) => LK.rightOf(S.scene, t));
      return { poly: fi.ent.id, verts: fi.verts, ws: wsId, label: on ? '解锁直角' : '锁直角', tip: on ? '解开这个图形所有直角的锁' : '锁住这个图形的直角：拖动顶点时直角保持（只能沿垂线走）' };
    }
    return null;
  }
  function wsLock(wsId) {
    const T = lockTarget(wsId); if (!T) return SG.render();
    const r = UI.Intent.run('lock', T);
    SG.setMsg(r && r.ok === false ? r.why : '', !(r && r.ok === false));
    SG.render();
  }
  // 直角锁的标记：锁住的直角顶点上画一个小方框（沿两条边），data-rmark 标出是哪个顶点
  function rightMarks(v, X, Y, sp) {
    const fi = figInfo(v); if (!fi || fi.kind !== 'pts' || fi.f.type !== 'polygon') return '';
    const LK = U.Geo.locks, n = fi.verts.length, unit = (x, y) => { const d = Math.hypot(x, y) || 1; return { x: x / d, y: y / d }; };
    let out = '';
    fi.verts.forEach((id, i) => {
      const tri = [fi.verts[(i + n - 1) % n], id, fi.verts[(i + 1) % n]];
      if (!LK.rightOf(UI.S.scene, tri)) return;
      const vx = X(sp[i].x), vy = Y(sp[i].y), u1 = unit(X(sp[(i + n - 1) % n].x) - vx, Y(sp[(i + n - 1) % n].y) - vy), u2 = unit(X(sp[(i + 1) % n].x) - vx, Y(sp[(i + 1) % n].y) - vy), s = L.RIGHT_MARK;
      const p1 = [vx + u1.x * s, vy + u1.y * s], p2 = [p1[0] + u2.x * s, p1[1] + u2.y * s], p3 = [vx + u2.x * s, vy + u2.y * s];
      out += '<path data-rmark="' + id + '" d="M' + p1.map((q) => q.toFixed(1)).join(' ') + ' L' + p2.map((q) => q.toFixed(1)).join(' ') + ' L' + p3.map((q) => q.toFixed(1)).join(' ') + '" fill="none" stroke="' + RIGHT_COL + '" stroke-width="1.5"/>';
    });
    return out;
  }
  const RIGHT_COL = '#7c3aed';
  // 拖动中：只改预览（实体属性），重算一次，只重画工作区
  function shapeMove(ev) {
    const S = UI.S, d = SG.drag, E = S.scene.entities;
    const mx = ev.clientX - d.sx, my = ev.clientY - d.sy;
    if (!d.moved && Math.hypot(mx, my) < L.DRAG_SLOP) return;
    d.moved = true;
    const wp = UI.Space.screenToWorkspace(ev, d.v, d.sc), out = [];
    const put = (id, k, v) => { E[id].props[k] = v; out.push({ id, k, v }); };
    let tip = '';
    // 约束（§10.5.9 第 1 条）：放缩会改长，锁着的图形不能放缩；旋转要是约束连着外面的点，也不能转
    if (d.mode === 'sc' || d.mode === 'rot') {
      const ids = d.targets.map((t) => t.id), bad = d.mode === 'sc' ? touchesLock(S.scene, ids) : !U.Geo.locks.rigid(S.scene, ids);
      if (bad) { SG.showTip(ev.clientX, ev.clientY, d.mode === 'sc' ? '有约束锁着，先解锁再放缩' : '有约束连着外面的点，先解锁再转', false); return; }
    }
    if (d.mode === 'tr') {
      let dX = Math.round(UI.Space.pxToUnits(mx, d.unit)), dY = -Math.round(UI.Space.pxToUnits(my, d.unit)), lx = -Infinity, hx = Infinity, ly = -Infinity, hy = Infinity;
      // 吸附开关关了、或者按住 Alt：不吸附（对齐线和构造点都不要）
      const free = SG.snapFree(ev);
      if (d.align) { d.align.alt = free; const s = SG.alignSolve(d.align, { x: UI.Space.pxToUnits(mx, d.unit), y: -UI.Space.pxToUnits(my, d.unit) }, d.unit); dX = s.dx; dY = s.dy; d.guides = s.guides; }
      for (const t of d.targets) { lx = Math.max(lx, t.lo[0] - Q.num(t.qx)); hx = Math.min(hx, t.hi[0] - Q.num(t.qx)); ly = Math.max(ly, t.lo[1] - Q.num(t.qy)); hy = Math.min(hy, t.hi[1] - Q.num(t.qy)); }
      dX = Math.max(lx, Math.min(hx, dX)); dY = Math.max(ly, Math.min(hy, dY));
      // 约束（§10.5.9 第 1 条）：拖一个点时，只能落在约束允许的位置（取离鼠标最近的）；拖一组时，约束要都在这组里
      const lk = lockGate(S.scene, d, dX, dY);
      dX = lk.dX; dY = lk.dY;
      // 拖动自由点靠近构造点：吸附。点先留在原来的地方，松手时变成构造点（shapeUp 提交）。锁住的点不吸附
      d.snap = d.pt && !free && !lk.locked ? snapDragCon(d, mx, my) : null;
      if (d.snap) {
        d.guides = [];
        for (const t of d.targets) { put(t.id, t.kx, Q.store(t.qx)); put(t.id, t.ky, Q.store(t.qy)); }
        tip = '松手变成「' + d.snap.label + '」';
      } else {
        // 平移是精确的有理数（块的分数平移）：从 qx、qy 精确相加；约束的门（lk）已经把 dX、dY 限在允许的位置
        for (const t of d.targets) { put(t.id, t.kx, Q.store(Q.add(t.qx, Q(dX)))); put(t.id, t.ky, Q.store(Q.add(t.qy, Q(dY)))); }
        tip = lk.tip || (dX || dY ? '向右 ' + dX + ' 格，向上 ' + dY + ' 格' : '');
      }
    } else if (d.mode === 'sc' || d.mode === 'pscale') {
      // 放缩：以对角为中心（按住 Alt 以中心为准）；比例任意（精确到 1/100）
      const qb = d.qb, cs = [[qb.x0, qb.y0], [qb.x1, qb.y0], [qb.x1, qb.y1], [qb.x0, qb.y1]];
      const A = ev.altKey ? { x: Q.div(Q.add(qb.x0, qb.x1), Q(2)), y: Q.div(Q.add(qb.y0, qb.y1), Q(2)) } : { x: cs[(d.corner + 2) % 4][0], y: cs[(d.corner + 2) % 4][1] };
      const ax = Q.num(A.x), ay = Q.num(A.y), v0x = Q.num(cs[d.corner][0]) - ax, v0y = Q.num(cs[d.corner][1]) - ay, den = v0x * v0x + v0y * v0y;
      if (!den) return;
      const tp = ((wp.x - ax) * v0x + (wp.y - ay) * v0y) / den;
      // 比例任意：取鼠标处的比例，精确到 1/100（有理数）；结果超出坐标范围时，往 1 那边让一点，停在能用的比例上
      // 比例吸附到好记的数：十分之几、几分之一（1/2、1/3、1/4……）和它们的倍数；按住 Shift 精确到 1/100
      const niceF = (x) => { let best = null; for (const dd of [10, 4, 3]) { const n = Math.max(1, Math.round(x * dd)), e = Math.abs(n / dd - x); if (!best || e < best.e - 1e-9) best = { n, dd, e }; } return Q(best.n, best.dd); };
      let fNear = ev.shiftKey ? Q.fromNumber(Math.max(0.01, Math.round(tp * 100) / 100)) : niceF(Math.max(0.1, tp)), sn = null;
      // 吸附（2026-11）：顶点对齐别的图形、某条边和别的边等长，优先于好记的比例；吸附开关关了或按住 Alt 不吸
      if (d.mode === 'sc' && d.al && !SG.snapFree(ev)) {
        sn = scaleSnap(d, A, tp, Math.sqrt(den), d.unit);
        // 鼠标就在好记的比例上（3 像素内），而吸附要的比例是很长的分数（转过的图形对齐时常这样）：用好记的
        if (sn && sn.f.d > 100n && UI.Space.unitsToPx(Math.abs(Q.num(fNear) - tp) * Math.sqrt(den), d.unit) <= 3) sn = null;
        if (sn) fNear = sn.f;
      }
      const hundredth = Q(1, 100);
      let f = fNear, pick = null, miss = '';
      for (let k = 0; k < 400 && !pick; k++) {
        if (d.mode === 'pscale') { pick = { f, nv: [] }; break; }
        // 用精确的 qx、qy（原来写 Q(t.x0)：顶点是分数（"3/2"）时 Q 不认字符串，抛 bad-number，转过或缩过的图形就再也缩放不了）
        const nv = d.targets.map((t) => ({ t, x: Q.add(A.x, Q.mul(f, Q.sub(t.qx, A.x))), y: Q.add(A.y, Q.mul(f, Q.sub(t.qy, A.y))) }));
        const inRange = (v) => { const x = Q.num(v.x), y = Q.num(v.y); return x >= v.t.lo[0] && x <= v.t.hi[0] && y >= v.t.lo[1] && y <= v.t.hi[1]; };
        if (nv.every(inRange)) { pick = { f, nv }; break; }
        if (k === 0) miss = '会超出坐标范围（±' + L.COORD_MAX + '）';
        if (Q.cmp(f, Q(1)) === 0) break;
        f = Q.cmp(f, Q(1)) > 0 ? Q.sub(f, hundredth) : Q.add(f, hundredth);
      }
      if (pick) {
        d.f = pick.f;
        if (d.mode === 'sc') for (const v of pick.nv) { put(v.t.id, v.t.kx, Q.store(v.x)); put(v.t.id, v.t.ky, Q.store(v.y)); }
        // 参考线：放缩以后精确成立的关系（同一竖线、横线、共线……），加上吸附到的“等长”
        if (d.mode === 'sc' && d.al) {
          const P = pick.nv.map((v) => ({ x: v.x, y: v.y })), gs = SG.relGuides(d.al, P, null, d.unit);
          if (sn && sn.kind === 'len' && Q.eq(sn.f, pick.f)) { const [i, j] = d.al.edges[sn.ei], a = SG.numP(P[i]), b = SG.numP(P[j]); gs.unshift({ k: 'seg', a, b, at: a }, { k: 'seg', a: SG.numP(sn.o.a), b: SG.numP(sn.o.b), at: a }, { k: 'pt', x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, at: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, text: d.enames[sn.ei] + ' 和 ' + sn.o.name + ' 等长', noDot: true }); }
          gs.push({ k: 'pt', x: Q.num(A.x), y: Q.num(A.y), at: { x: Q.num(A.x), y: Q.num(A.y) }, text: '' });   // 放缩中心
          d.guides = gs;
        }
        else E[d.id].props.scale = Q.show(Q.mul(Q.parse(d.s0), pick.f));
        tip = '放缩 ' + Q.show(pick.f) + ' 倍';
        if (miss) tip = Q.show(fNear) + ' 倍' + miss + '，停在 ' + Q.show(pick.f) + ' 倍';
      } else tip = '这个比例没有能用的结果，先不动';
    } else if (d.mode === 'prot') {
      // 块的旋转（V9，2.10）：总角度从按下时的角度开始，跟着鼠标走，按 1° 吸附（按住 Shift 按 15°）。
      // 90° 的倍数记在内核的 turn（精确），余下的 0–89 记在块的 approxDeg（界面层近似）。逆时针为正。
      const c = d.c, th0 = Math.atan2(d.start.y - c.y, d.start.x - c.x), th = Math.atan2(wp.y - c.y, wp.x - c.x);
      const step = ev.shiftKey ? L.ROT.coarse : L.ROT.step;
      let A = Math.round((d.A0 + (th - th0) * 180 / Math.PI) / step) * step;
      A = ((A % 360) + 360) % 360;
      d.A = A;
      E[d.id].props.turn = Math.floor(A / 90) % 4;
      if (A % 90) E[d.id][SG.APPROX] = A % 90; else delete E[d.id][SG.APPROX];
      tip = '转到 ' + (A % 90 ? '≈' : '') + A + '°';
    } else if (d.mode === 'rot' || d.mode === 'lrot') {
      // 自由点图形：任意角度（逆时针为正），每个顶点的坐标取到 1/100；转出 ±COORD_MAX 的范围就不动
      // 块（lrot）：角度吸附到 90°，和摆放器材的 turn 一致
      const c = d.c, th0 = Math.atan2(d.start.y - c.y, d.start.x - c.x), th = Math.atan2(wp.y - c.y, wp.x - c.x);
      if (d.mode === 'rot') {
        // 任意角度：按 1° 吸附（按住 Shift 按 15°），逆时针为正；坐标精确（rotCS），图形和原来全等。
        // 原来用 t.x0 − c.x：顶点是分数（字符串 "n/d"）时得到 NaN，转过一次的图形就转不动了；现在一律用精确的 qx、qy
        // 吸附（2026-11）：某条边转到水平、竖直，或者和别的图形的边平行、垂直时吸过去，画参考线（Alt 或吸附开关关了不吸）
        const step = ev.shiftKey ? L.ROT.coarse : L.ROT.step, raw = normDeg((th - th0) * 180 / Math.PI);
        const rs = rotSnap(d, raw, step, SG.snapFree(ev)), deg = rs.deg, R = rs.R;
        const P = rotPts(d.base, d.cq, R), nv = d.targets.map((t, k) => ({ t, x: P[k].x, y: P[k].y }));
        const inRange = (v) => { const x = Q.num(v.x), y = Q.num(v.y); return x >= v.t.lo[0] && x <= v.t.hi[0] && y >= v.t.lo[1] && y <= v.t.hi[1]; };
        if (!nv.every(inRange)) tip = '转到这个角度会超出坐标范围（±' + L.COORD_MAX + '），先不动';
        else {
          for (const v of nv) { put(v.t.id, v.t.kx, Q.store(v.x)); put(v.t.id, v.t.ky, Q.store(v.y)); }
          const shown = Math.round(deg * 10) / 10;
          tip = '转 ' + (Number.isInteger(deg) ? deg : '≈' + shown) + '°' + (rs.text ? '：' + rs.text : rs.snapped ? '' : '（Shift：每次 ' + L.ROT.coarse + '°，Alt：不吸附）');
          const a0 = Math.atan2(d.start.y - c.y, d.start.x - c.x);
          d.guides = [{ k: 'arc', at: { x: c.x, y: c.y }, rpx: Math.min(L.MARK.ARC_R, Math.max(L.MARK.ARC_MIN, d.rpx * 0.35)), a0, a1: a0 + deg / DEG_PER_RAD, text: (Number.isInteger(deg) ? deg : '≈' + shown) + '°' }].concat(rs.guides, SG.relGuides(d.al, P, null, d.unit).filter((g) => g.k !== 'ln'));
        }
      } else {
        const k = Math.round((th - th0) / (Math.PI / 2));
        d.k = k;
        E[d.id].props.turn = modT(d.t0 + k);
        tip = '转 ' + k * 90 + '°';
      }
    }
    d.out = out;
    S.D = W.evaluate(S.scene);
    SG.wsRedraw(d.wsId);
    if (tip) SG.showTip(ev.clientX, ev.clientY, tip, true);
  }
  // 松手：先把预览还原，再把这一次拖动记成一步（一次 set 或一次块的动作，撤销就回到拖之前）
  function shapeUp(d) {
    const E = UI.S.scene.entities;
    SG.showTip(0, 0, '');
    const orig = {};
    for (const t of d.targets) { orig[t.id + '|' + t.kx] = t.x0; orig[t.id + '|' + t.ky] = t.y0; E[t.id].props[t.kx] = t.x0; E[t.id].props[t.ky] = t.y0; }
    if (d.id && E[d.id]) { if (d.s0 !== undefined) E[d.id].props.scale = d.s0; if (d.t0 !== undefined) E[d.id].props.turn = d.t0; }
    if (d.mode === 'prot' && E[d.id]) { if (d.a0) E[d.id][SG.APPROX] = d.a0; else delete E[d.id][SG.APPROX]; }
    if (!d.moved) return SG.render();
    // 拖动自由点吸附到构造点（V4）：一步（建构造器材、改接线、删掉这个点）
    if (d.snap && d.pt) return UI.Intent.run('snapdrag', { ws: d.wsId, id: d.pt, con: d.snap.con });
    // 块的旋转（V9，2.10）：松手时一次提交（转过 90° 的部分是块的转动动作，余下的是 approxDeg），撤销一次回去
    if (d.mode === 'prot') {
      if (d.A === d.A0) return SG.render();
      return UI.Intent.run('spin', { id: d.id, turn: modT(Math.floor(d.A / 90) - d.t0), approx: d.A % 90 });
    }
    const last = {};
    for (const o of d.out) last[o.id + '|' + o.k] = o;
    const list = Object.values(last).filter((o) => o.v !== orig[o.id + '|' + o.k]).map((o) => ({ id: o.id, k: o.k, v: o.v }));
    if (d.mode === 'pscale' && d.f && !Q.eq(d.f, Q(1))) list.push({ id: d.id, what: 'scale', value: Q.show(d.f) });
    if (d.mode === 'lrot' && modT(d.t0 + d.k) !== d.t0) list.push({ id: d.id, k: 'turn', v: modT(d.t0 + d.k) });
    if (list.length) UI.Intent.run('params', { ops: list }); else SG.render();
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
      const list = uniq(fi.verts).map((g) => ({ id: g, k: q, v: Q.store(Q.sub(Q.add(mn, mx), Q.parse(UI.S.scene.entities[g].props[q]))) }));
      return UI.Intent.run('params', { ops: list });
    }
  }
  // ---- 浮动条和键盘（2026-11）：转一个角度、放缩一个倍数、摆正。都是一步（撤销一次回去），坐标精确 ----
  const say = (m, good) => { SG.setMsg(m, !!good); SG.render(); return { ok: !!good, why: good ? '' : m }; };
  // 自由点图形的顶点（精确）和外框中心
  function ptsOf(fi) {
    const ids = uniq(fi.verts), B = ids.map((g) => SG.gptPt(g)), xs = B.map((p) => p.x), ys = B.map((p) => p.y);
    return { ids, B, cq: { x: Q.div(Q.add(minQ(xs), maxQ(xs)), Q(2)), y: Q.div(Q.add(minQ(ys), maxQ(ys)), Q(2)) } };
  }
  // 把新坐标写回去（一步）；超出坐标范围就不动，说明原因
  function putPts(ids, P, what) {
    if (P.some((p) => Math.abs(Q.num(p.x)) > L.COORD_MAX || Math.abs(Q.num(p.y)) > L.COORD_MAX)) return say(what + '会超出坐标范围（±' + L.COORD_MAX + '），先把图形挪近中间');
    if (ids.some((g) => U.Geo.locks.of(UI.S.scene).some((c) => [c.a, c.b, c.c].includes(g))) && what.indexOf('放缩') === 0) return say('有约束锁着，先解锁再放缩');
    const ops = []; ids.forEach((g, k) => { ops.push({ id: g, k: 'x', v: Q.store(P[k].x) }, { id: g, k: 'y', v: Q.store(P[k].y) }); });
    UI.Intent.run('params', { ops }); SG.setMsg(what, true); SG.render(); return { ok: true };
  }
  const canEdit = (fi) => fi && fi.kind === 'pts' && fi.f.type !== 'point';
  // 转 deg 度（逆时针为正），绕外框中心
  function figRotateBy(wsId, name, deg) {
    const fi = figByName(wsId, name); if (!fi) return say('先选中一个图形');
    if (!canEdit(fi)) {
      if (deg % 90) return say('这个图形只能转 90° 的倍数（点「旋转」或按 R）');
      const k = modT(Math.round(deg / 90)); if (!k) return { ok: true };
      if (fi.kind === 'piece') return UI.Intent.run('piece', { ids: [fi.ent.id], what: 'turn', value: k });
      if (fi.kind === 'place') return UI.Intent.run('params', { ops: [{ id: fi.ent.id, k: 'turn', v: modT(fi.ent.props.turn + k) }] });
      return say('这个图形不能转');
    }
    if (!U.Geo.locks.rigid(UI.S.scene, uniq(fi.verts))) return say('有约束连着外面的点，先解锁再转');
    const o = ptsOf(fi), sh = Math.round(deg * 10) / 10;
    return putPts(o.ids, rotPts(o.B, o.cq, rotCS(deg)), '转了 ' + (Number.isInteger(deg) ? deg : '≈' + sh) + '°');
  }
  // 放缩 f 倍（有理数），绕外框中心
  function figScaleBy(wsId, name, f) {
    const fi = figByName(wsId, name); if (!fi) return say('先选中一个图形');
    if (Q.cmp(f, Q(0)) <= 0) return say('倍数要大于 0');
    if (fi.kind === 'piece') return UI.Intent.run('params', { ops: [{ id: fi.ent.id, what: 'scale', value: Q.show(f) }] });
    if (!canEdit(fi)) return say('这个图形不能放缩');
    const o = ptsOf(fi), P = o.B.map((b) => ({ x: Q.add(o.cq.x, Q.mul(f, Q.sub(b.x, o.cq.x))), y: Q.add(o.cq.y, Q.mul(f, Q.sub(b.y, o.cq.y))) }));
    return putPts(o.ids, P, '放缩 ' + Q.show(f) + ' 倍（形状不变）');
  }
  // 摆正：转最小的角度，让某一条边水平或竖直（|边长| 是有理数时精确，比如转过的长方形转回来）
  function figStraighten(wsId, name) {
    const fi = figByName(wsId, name); if (!fi) return say('先选中一个图形');
    if (!canEdit(fi)) return say('这个图形本来就是正的（只能转 90° 的倍数）');
    const o = ptsOf(fi), ids = o.ids, B = o.B;
    let best = null;
    for (const [a, b] of fi.edges) {
      const i = ids.indexOf(fi.verts[a]), j = ids.indexOf(fi.verts[b]), u = { x: Q.sub(B[j].x, B[i].x), y: Q.sub(B[j].y, B[i].y) };
      if (Q.eq(u.x, Q(0)) && Q.eq(u.y, Q(0))) continue;
      const au = angOf(u);
      for (const [w, t] of [[{ x: Q(1), y: Q(0) }, 0], [{ x: Q(0), y: Q(1) }, 90]]) {
        const need = t - au, deg = need - 180 * Math.round(need / 180);
        if (!best || Math.abs(deg) < Math.abs(best.deg) - 1e-9) best = { deg, u, w };
      }
    }
    if (!best) return say('这个图形没有边可以摆正');
    if (Math.abs(best.deg) < 1e-9) return say('已经是正的了（有边是水平或竖直的）', true);
    if (!U.Geo.locks.rigid(UI.S.scene, ids)) return say('有约束连着外面的点，先解锁再转');
    const R = rotToward(best.u, best.w, best.deg), sh = Number(best.deg.toFixed(1));
    return putPts(ids, rotPts(B, o.cq, R), '摆正：转了 ' + (R.exact ? '' : '≈') + sh + '°' + (R.exact ? '' : '（这条边的长不是整数，只能近似摆正）'));
  }
  // ---- 工具条上的图形操作：复制、旋转、翻转、删除（不用先选图形）----
  // 对谁做：选中的图形；没有选中，工作区里只有一个图形就是它；有好几个就等着：点一下要操作的图形（S.wsArm），点到就做
  const ACT_LABEL = { copy: '复制', mirror: '镜像复制', rot: '旋转', flip: '翻转', del: '删除' };
  const isFig = (fi) => !!fi && !!fi.f && (fi.f.type === 'polygon' || fi.f.type === 'circle');
  function wsFigures(wsId) {
    const ws = UI.S.scene.entities[wsId]; if (!ws) return [];
    return SG.wsVisible(ws).map((v) => ({ v, fi: figInfo(v) })).filter((x) => isFig(x.fi) || (x.v.fig && x.v.fig.type === 'polygon' && x.fi));
  }
  // 旋转：自由点围成的图形，每个顶点绕外框中心（取整数）逆时针转 90°，坐标仍是整数；转出 ±10 的范围就不转，说明原因
  function figRotate(fi) {
    const E = UI.S.scene.entities, ids = uniq(fi.verts), pts = fi.f.pts;
    // 外框中心用精确的有理数（不取整），转过去的坐标也是精确的
    const c = { x: Q.div(Q.add(minQ(pts.map((p) => p.x)), maxQ(pts.map((p) => p.x))), Q(2)), y: Q.div(Q.add(minQ(pts.map((p) => p.y)), maxQ(pts.map((p) => p.y))), Q(2)) };
    const ops = ids.map((id) => { const x = Q.parse(E[id].props.x), y = Q.parse(E[id].props.y); return { id, nx: Q.add(c.x, Q.sub(c.y, y)), ny: Q.add(c.y, Q.sub(x, c.x)) }; });
    if (ops.some((o) => Math.abs(Q.num(o.nx)) > L.COORD_MAX || Math.abs(Q.num(o.ny)) > L.COORD_MAX)) return { ok: false, why: '转过去会超出工作区的坐标范围（±' + L.COORD_MAX + '），先把图形挪近中间再转' };
    const list = []; for (const o of ops) { list.push({ id: o.id, k: 'x', v: Q.store(o.nx) }); list.push({ id: o.id, k: 'y', v: Q.store(o.ny) }); }
    return UI.Intent.run('params', { ops: list });
  }
  // 块和自由点图形的坐标（求值结果，Q 转成数），块没算出来就是 null
  function pieceVerts(id) {
    const d = UI.S.D[id], pts = d && d.out && d.out.f && d.out.f.data ? d.out.f.data.pts : null;
    return pts ? pts.map((q) => [Q.num(q.x), Q.num(q.y)]) : null;
  }
  // 复制、镜像复制（§10.5.9 第 4 条）：names 里的图形（块或自由点围成的图形）整批做成一步。点（单个自由点）不复制
  function pasteNames(wsId, names, mirror) {
    const items = [];
    for (const n of names) {
      const fi = figByName(wsId, n); if (!fi) continue;
      if (fi.kind === 'piece') {
        const pv = pieceVerts(fi.ent.id);
        if (mirror && !pv) return { ok: false, why: '这一块现在算不出形状，镜像不了' };
        items.push({ kind: 'piece', id: fi.ent.id, mirror: !!mirror, edgeX: pv ? Math.max(...pv.map((q) => q[0])) : 0, bottomY: pv ? Math.min(...pv.map((q) => q[1])) : 0 });
      } else if (fi.kind === 'pts' && fi.f.type !== 'point') items.push({ kind: 'pts', poly: fi.ent.id, verts: uniq(fi.verts), mirror: !!mirror });
    }
    if (!items.length) return { ok: false, why: '这个图形没法' + (mirror ? '镜像复制' : '复制') };
    return UI.Intent.run('paste', { ws: wsId, items });
  }
  // 复制（Ctrl+C）：记住选中的图形；粘贴（Ctrl+V）：放进当前的工作区（块只能回到它原来的工作区）
  function clipCopy(wsId) {
    const S = UI.S, items = [];
    for (const n of S.wsSel || []) {
      const fi = figByName(wsId, n); if (!fi) continue;
      if (fi.kind === 'piece') items.push({ kind: 'piece', id: fi.ent.id });
      else if (fi.kind === 'pts' && fi.f.type !== 'point') items.push({ kind: 'pts', poly: fi.ent.id, verts: uniq(fi.verts) });
    }
    S.wsClip = items;
    SG.setMsg(items.length ? '已复制 ' + items.length + ' 个图形，按 Ctrl+V 粘贴到工作区' : '选中的图形没法复制', items.length > 0);
    SG.render();
    return items.length > 0;
  }
  function clipPaste(wsId) {
    const S = UI.S, E = S.scene.entities, clip = S.wsClip || [], items = [];
    for (const c of clip) {
      if (c.kind === 'piece') { if (E[c.id] && E[c.id].parent === wsId) items.push({ kind: 'piece', id: c.id, mirror: false, edgeX: 0, bottomY: 0 }); }
      else if (E[c.poly] && c.verts.every((v) => E[v])) items.push({ kind: 'pts', poly: c.poly, verts: c.verts, mirror: false });
    }
    if (!items.length) { SG.setMsg(clip.length ? '复制的图形在这个工作区里找不到了' : '先选中图形，按 Ctrl+C 复制', false); SG.render(); return false; }
    const r = UI.Intent.run('paste', { ws: wsId, items });
    if (r && r.ok === false) SG.setMsg(r.why, false); else { S.wsSel = []; SG.setMsg('', true); }
    SG.render();
    return !(r && r.ok === false);
  }
  // 编组（§10.5.9 第 3 条）：选中两个以上的图形记成一组（同一个组号）。组里的图形点一个就一起选中，拖动一起动。
  // on 为假：取消选中图形所在的组（整组都取消）
  function groupMembers(wsId, gid) {
    const ws = UI.S.scene.entities[wsId]; if (!ws || !gid) return [];
    return SG.wsVisible(ws).map((v) => SG.figInfo(v)).filter((fi) => fi && fi.ent.group === gid);
  }
  function wsGroup(wsId, on) {
    const S = UI.S, fis = (S.wsSel || []).map((n) => figByName(wsId, n)).filter(Boolean);
    let ids = [], gid = null;
    if (on) {
      if (fis.length < 2) { SG.setMsg('编组要先选两个以上的图形（按住 Shift 点）', false); return SG.render(); }
      gid = 'grp' + Date.now().toString(36); ids = fis.map((fi) => fi.ent.id);
    } else {
      const gids = [...new Set(fis.map((fi) => fi.ent.group).filter(Boolean))];
      if (!gids.length) { SG.setMsg('选中的图形没有编组', false); return SG.render(); }
      ids = [].concat(...gids.map((g) => groupMembers(wsId, g).map((fi) => fi.ent.id)));
    }
    const r = UI.Intent.run('group', { ids, gid });
    if (r && r.ok === false) SG.setMsg(r.why, false); else SG.setMsg(on ? '已编成一组：点一个，两个一起选中；拖动一起动' : '已取消编组', true);
    SG.render();
  }
  // 组里的图形一起拖：每个图形的可动目标合在一起，松手是一步（和单个图形一样）；幽灵画出每个图形原来的位置
  function memberTargets(fi) { return fi.kind === 'piece' ? [tgt(fi.ent.id, 'dx', 'dy')] : moveTargets(fi); }
  function groupDrag(ev, wb, wsId, fi) {
    const gid = fi.ent.group; if (!gid) return false;
    const mem = groupMembers(wsId, gid).filter((m) => !m.ent.props.locked);
    if (mem.length < 2) return false;
    const targets = [].concat(...mem.map(memberTargets));
    const ghost = mem.filter((m) => m.f.type === 'polygon').map((m) => m.f.pts.map((q) => ({ x: Q.num(q.x), y: Q.num(q.y) })));
    startShape(ev, wb, wsId, 'tr', targets, { align: null, ghost });
    return true;
  }
  function figApply(wsId, act, name) {
    const fi = figByName(wsId, name); if (!fi) return { ok: false, why: '找不到这个图形' };
    if (act === 'flip') { figFlip(wsId, name, 1); return { ok: true }; }
    if (act === 'del') {
      if (fi.kind === 'pts') return UI.Intent.run('delete', { id: fi.ent.id, alsoVerts: uniq(fi.verts) });
      return UI.Intent.run('delete', { id: fi.ent.id });
    }
    if (act === 'rot') {
      if (fi.kind === 'pts') return figRotate(fi);
      if (fi.kind === 'piece') return UI.Intent.run('piece', { ids: [fi.ent.id], what: 'turn', value: 1 });
      return UI.Intent.run('params', { ops: [{ id: fi.ent.id, k: 'turn', v: modT(fi.ent.props.turn + 1) }] });
    }
    return { ok: false, why: '不认识的操作' };
  }
  function wsAct(wsId, act, name) {
    const S = UI.S; S.wsArm = null;
    let names = name ? [name] : (S.wsSel || []).filter((n) => isFig(figByName(wsId, n)) || (figByName(wsId, n) && figByName(wsId, n).f.type === 'polygon'));
    if (!names.length) {
      const all = wsFigures(wsId).map((x) => SG.pickOf(x.v));
      if (!all.length) { SG.setMsg('工作区里还没有图形：点「图形」放一个', false); return SG.render(); }
      if (all.length === 1) names = all;
      else { S.wsArm = { ws: wsId, act }; SG.setMsg('点一下要' + ACT_LABEL[act] + '的图形（Esc 取消）', true); return SG.render(); }
    }
    let bad = null;
    if (act === 'copy' || act === 'mirror') { const r = pasteNames(wsId, names, act === 'mirror'); if (r && r.ok === false) bad = r.why; }
    else for (const n of names) { const r = figApply(wsId, act, n); if (r && r.ok === false) { bad = r.why; break; } }
    if (act !== 'flip' && act !== 'rot') S.wsSel = [];
    SG.setMsg(bad || '', !bad);
    SG.render();
  }
  Object.assign(SG, { figRotateBy, figScaleBy, figStraighten, rotCS, wsAct, ACT_LABEL, uniq, SNAP_PX, minQ, maxQ, modT, tgt, figInfo, figByName, moveTargets, startShape, startHandle, shapeMove, shapeUp, figFlip, pieceVerts, clipCopy, clipPaste, wsGroup, groupMembers, groupDrag, touchesLock, segLenLock, lockTarget, wsLock, rightMarks });
})(window);
