/* 台面（V9）：读数与近似旋转。由 stage.js 拆出，跨文件的名字经 UI.StageCtx（SG）访问。加载顺序见 index.html。
 *   读数（2.9）：选中一个图形，在它旁边写长度（线段）、面积、各边长、各角（多边形），块还写旋转角度。
 *     全部是只读的：由 U.Fig 的有理数计算得到（长度用 U.Real 的 √ 形式），不改台面。角度只有直角和几个常见的特殊角是精确的，其余标 ≈。
 *   近似旋转（2.10）：块的 90° 倍数仍然是内核的 turn（精确、不改语义）；其余的角度（0–89）存在块自己的 approxDeg 上，
 *     界面层绕转动中心（块的剪下部分的左下角，平移 dx、dy 之后的位置，也是 90° 转动的不动点）转过去。
 *     近似的块不参与拼合判定（见 stage-canvas.js 的 fitState）。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), Q = U.Q, F = U.Fig, R = U.Real;
  const SG = UI.StageCtx, L = UI.LAYOUT, RO = L.READOUT;
  const APPROX = 'approxDeg';          // 块的近似角度（度，0–89），写在实体顶层，不在 props 里
  const RO_COL = '#1e293b';            // 读数的文字颜色（和台面的标签一样，描边是浅色）
  const SPECIAL = [30, 45, 60, 90, 120, 135, 150];   // 这些角度的值是精确的（整数坐标的图形里，判定到 1e-9 度）
  const FULL = 360, QUARTER = 90;

  // 块的近似角度（没有就是 0）
  const approxOf = (ent) => (ent && ent[APPROX]) || 0;
  // 块的总角度（度，0–359）：转过的 90° 倍数（turn）加上近似的部分
  const totalDeg = (ent) => (((ent.props.turn * QUARTER + approxOf(ent)) % FULL) + FULL) % FULL;
  // 块的转动中心（工作区坐标）：剪下的那一块的左下角，平移 (dx, dy) 以后的位置
  function pivotOf(ent) {
    const D = UI.S.D && UI.S.D[ent.id], inp = D && D.inp && D.inp.f;
    const v = inp && inp.find((x) => x && x.kind === 'fig');
    const f = v && v.data;
    if (!f || !f.pts || !f.pts.length) return null;
    const xs = f.pts.map((p) => Q.num(p.x)), ys = f.pts.map((p) => Q.num(p.y));
    return { x: Math.min(...xs) + Q.num(Q.parse(ent.props.dx)), y: Math.min(...ys) + Q.num(Q.parse(ent.props.dy)) };
  }
  // 图形显示用的顶点（工作区坐标，浮点）：块有近似角度时绕转动中心转过去，其余就是内核的精确坐标
  function shownPts(f, ent) {
    const pts = f.pts.map((p) => ({ x: Q.num(p.x), y: Q.num(p.y) }));
    const a = ent && SG.roleOf(ent) === 'piece' ? approxOf(ent) : 0;
    if (!a || f.type !== 'polygon') return pts;
    const pv = pivotOf(ent);
    if (!pv) return pts;
    const t = a * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
    return pts.map((p) => { const dx = p.x - pv.x, dy = p.y - pv.y; return { x: pv.x + dx * c - dy * s, y: pv.y + dx * s + dy * c }; });
  }

  // 长度：√ 形式或有理数（U.Real）；根式太大时退回近似值
  function lenText(a, b) {
    const d2 = F.d2(a, b), r = R.sqrt(d2);
    return r ? R.show(r) : '≈' + Math.sqrt(Q.num(d2)).toFixed(2);
  }
  // 角：特殊角是精确值，其余标 ≈（一位小数）
  function angText(deg) {
    const k = SPECIAL.find((s) => Math.abs(s - deg) < 1e-9);
    return k !== undefined ? k + '°' : '≈' + (Math.round(deg * 10) / 10) + '°';
  }
  // 多边形在第 i 个顶点的内角（度，浮点，只用来判定特殊角和显示近似值）：从 b 边的方向逆时针转到 a 边的方向；
  // 多边形是逆时针的就取它，否则取 360 度减去它
  function innerDeg(pts, i, ccw) {
    const n = pts.length, o = pts[i], a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
    const ux = b.x - o.x, uy = b.y - o.y, vx = a.x - o.x, vy = a.y - o.y;
    let phi = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
    if (phi < 0) phi += 2 * Math.PI;
    const deg = phi * 180 / Math.PI;
    return ccw ? deg : FULL - deg;
  }
  const unit = (x, y) => { const d = Math.hypot(x, y) || 1; return { x: x / d, y: y / d }; };
  // 文字（中心在 (x, y) 沿 (ux, uy) 方向退开 d 像素）的候选位置：左上角（labs 的格式）
  function around(x, y, u, text, ds) {
    const tw = SG.TXT_W(text);
    return ds.map((d) => [x + u.x * d - tw / 2, y + u.y * d + RO.base]);
  }
  const avg = (xs) => xs.reduce((s, v) => s + v, 0) / xs.length;

  // 选中的图形的读数，加进台面的标签（prio 5：排在名字后面，不挡名字；标签的避让由 placeLabels 负责）。
  // v 是台面上的值，ent 是它的实体，f 是它的图形（内核的精确值），X、Y 把工作区坐标换成画布坐标
  function readoutsFor(ent, f, X, Y, labs) {
    if (!f || !f.pts || !f.pts.length || f.type === 'point' || f.type === 'circle') return;
    const kp = f.pts.map((p) => ({ x: Q.num(p.x), y: Q.num(p.y) }));          // 精确值的浮点（角度用）
    const sp = shownPts(f, ent).map((p) => ({ x: X(p.x), y: Y(p.y) }));       // 画布上的位置
    const add = (text, cands, ro, dim) => labs.push({ text, c: RO_COL, cands, prio: 5, ro, dim: dim || null });
    const cen = { x: avg(sp.map((p) => p.x)), y: avg(sp.map((p) => p.y)) };
    if (f.type === 'segment') {
      // 选中的线段：读数可以双击改长度（§10.5.9 第 2 条，dim）；锁着的写「锁」
      const a = sp[0], b = sp[1], u = unit(-(b.y - a.y), b.x - a.x), lk = ent ? SG.segLenLock(ent.id) : null, text = (lk ? '锁 ' : '') + '长 ' + lenText(f.pts[0], f.pts[1]);
      add(text, around((a.x + b.x) / 2, (a.y + b.y) / 2, u, text, [RO.near, RO.far, -RO.near]), 'len', ent ? ent.id : null);
      return;
    }
    if (f.type !== 'polygon') return;
    const n = sp.length, ccw = F.area2(f).n > 0n;
    const area = Q.div(Q.abs(F.area2(f)), Q(2));
    const at = '面积 ' + Q.show(area);
    add(at, around(cen.x, cen.y, { x: 0, y: 1 }, at, [0, RO.line]), 'area');
    for (let i = 0; i < n; i++) {
      const a = sp[i], b = sp[(i + 1) % n], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      let u = unit(-(b.y - a.y), b.x - a.x);
      if (u.x * (mx - cen.x) + u.y * (my - cen.y) < 0) u = { x: -u.x, y: -u.y };   // 朝外
      const text = lenText(f.pts[i], f.pts[(i + 1) % n]);
      add(text, around(mx, my, u, text, [RO.near, RO.far, -RO.near]), 'side');
    }
    for (let i = 0; i < n; i++) {
      const text = F.isRight(f, i) ? '90°' : angText(innerDeg(kp, i, ccw));
      const u = unit(cen.x - sp[i].x, cen.y - sp[i].y);   // 朝里
      add(text, around(sp[i].x, sp[i].y, u, text, [RO.corner, RO.corner + RO.near]), 'angle');
    }
    if (ent && SG.roleOf(ent) === 'piece') {
      const text = '旋转 ' + (approxOf(ent) ? '≈' : '') + totalDeg(ent) + '°';
      add(text, around(cen.x, cen.y, { x: 0, y: 1 }, text, RO.rot), 'rot');
    }
  }

  Object.assign(SG, { APPROX, approxOf, totalDeg, pivotOf, shownPts, readoutsFor, lenText, angText });   // lenText、angText 也给尺子和量角器用（stage-measure.js）
})(window);
