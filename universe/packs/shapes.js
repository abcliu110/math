/* 器材包 shapes：常见平面图形（梯形、菱形、直角三角形……）和图形的识别。
 *
 * 两件事：
 *  1. 常见图形的器材。每个图形一个器材（出现在器材架里）。拖进几何工作区时不变成「块」，而是变成
 *     一组自由点 + 一个围成多边形：顶点可以直接拖，边的中点可以吸附，辅助线可以画在图形里面。
 *     放在台面上（不在工作区里）时，它就是一个普通的图形器材，输出图形、面积、周长。
 *  2. U.Shapes.classify / describe：看一个多边形是什么图形（精确判断，不用浮点）：
 *     直角 / 等腰 / 等边三角形；平行四边形、长方形、菱形、正方形、梯形（等腰、直角）、筝形。
 *     工作区里选中一个图形时，面板显示它的名字、边长、面积和周长，改了顶点名字会跟着变。
 *
 * 坐标都是整数（自由点只存整数），放大倍数 s 只取整数，放大后仍是整数坐标。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, F = U.Fig;

  // 模板：顶点按逆时针排，坐标是整数，都在 0..8 之内（放大 1–2 倍后还在自由点的 ±10 范围里）
  const LIST = [
    { id: 'fscalene', label: '三角形（可编辑）', pts: [[0, 0], [6, 0], [2, 4]], alias: ['三角形', '任意三角形'], grades: [3, 9], group: 'tri' },
    { id: 'fquad4', label: '四边形（可编辑）', pts: [[0, 0], [6, 0], [5, 4], [1, 3]], alias: ['四边形', '任意四边形'], grades: [3, 9], group: 'quad' },
    { id: 'frtri', label: '直角三角形', pts: [[0, 0], [4, 0], [0, 3]], alias: ['勾股', '三角形'], grades: [3, 9] },
    { id: 'fisotri', label: '等腰三角形', pts: [[0, 0], [6, 0], [3, 4]], alias: ['三角形', '对称'], grades: [4, 9] },
    { id: 'frect', label: '长方形（可编辑）', pts: [[0, 0], [5, 0], [5, 3], [0, 3]], alias: ['长方形', '矩形', '面积', '周长'], grades: [3, 9] },
    { id: 'fsquare', label: '正方形（可编辑）', pts: [[0, 0], [4, 0], [4, 4], [0, 4]], alias: ['正方形', '面积', '周长'], grades: [3, 9] },
    { id: 'fpgram', label: '平行四边形（可编辑）', pts: [[0, 0], [5, 0], [7, 3], [2, 3]], alias: ['平行四边形', '剪拼', '面积'], grades: [4, 9] },
    { id: 'frhomb', label: '菱形', pts: [[0, 0], [5, 0], [8, 4], [3, 4]], alias: ['菱形', '对角线'], grades: [5, 9] },
    { id: 'ftrap', label: '梯形', pts: [[0, 0], [6, 0], [5, 3], [2, 3]], alias: ['梯形', '上底', '下底', '面积', '中位线'], grades: [5, 9] },
    { id: 'fisotrap', label: '等腰梯形', pts: [[0, 0], [6, 0], [5, 3], [1, 3]], alias: ['梯形', '等腰梯形', '对称'], grades: [6, 9] },
    { id: 'frtrap', label: '直角梯形', pts: [[0, 0], [6, 0], [3, 3], [0, 3]], alias: ['梯形', '直角梯形', '高'], grades: [5, 9] },
    { id: 'fkite', label: '筝形', pts: [[3, 0], [6, 1], [3, 5], [0, 1]], alias: ['筝形', '风筝', '对角线'], grades: [6, 9] },
  ];
  const BY = {}; LIST.forEach((t) => { BY[t.id] = t; });

  const sub = (a, b) => ({ x: Q.sub(a.x, b.x), y: Q.sub(a.y, b.y) });
  const dot = (u, v) => Q.add(Q.mul(u.x, v.x), Q.mul(u.y, v.y));
  const crs = (u, v) => Q.sub(Q.mul(u.x, v.y), Q.mul(u.y, v.x));
  const isZero = (q) => Q.eq(q, Q(0));
  const eq = (a, b) => Q.eq(a, b);

  // ---- 识别 ----
  // 返回 { name, facts: [..], kind }：kind 是简短的类别 id（triangle/quad/poly），facts 是学生能读懂的理由
  function classify(f) {
    if (!f || f.type !== 'polygon' || !f.pts || f.pts.length < 3) return null;
    const p = f.pts, n = p.length, e = p.map((a, i) => sub(p[(i + 1) % n], a)), l2 = e.map((v) => dot(v, v));
    const facts = [];
    if (n === 3) {
      const [a, b, c] = l2, iso = eq(a, b) || eq(b, c) || eq(a, c), equi = eq(a, b) && eq(b, c);
      const ang = p.map((_, i) => F.isRight(f, i)), right = ang.some(Boolean);
      // 钝角：某个角的两边点积 < 0（精确）
      const obtuse = p.some((o, i) => Q.cmp(dot(sub(p[(i + n - 1) % n], o), sub(p[(i + 1) % n], o)), Q(0)) < 0);
      if (equi) facts.push('三条边一样长');
      else if (iso) facts.push('有两条边一样长');
      if (right) facts.push('有一个直角');
      else if (obtuse) facts.push('有一个钝角');
      let name = equi ? '等边三角形' : iso && right ? '等腰直角三角形' : iso ? '等腰三角形' : right ? '直角三角形' : obtuse ? '钝角三角形' : '锐角三角形';
      return { name, facts, kind: 'triangle' };
    }
    if (n === 4) {
      // 凸四边形：相邻两边的叉积同号
      const cr = e.map((v, i) => crs(v, e[(i + 1) % 4])), pos = cr.every((c) => Q.cmp(c, Q(0)) > 0), neg = cr.every((c) => Q.cmp(c, Q(0)) < 0);
      if (!pos && !neg) return { name: '四边形（凹的或扭的）', facts: ['有一个角大于 180°，或者两条边交叉'], kind: 'quad' };
      const par02 = isZero(crs(e[0], e[2])), par13 = isZero(crs(e[1], e[3]));
      const rightAngle = p.some((_, i) => F.isRight(f, i)), allRight = p.every((_, i) => F.isRight(f, i));
      const allEq = eq(l2[0], l2[1]) && eq(l2[1], l2[2]) && eq(l2[2], l2[3]);
      if (par02 && par13) {
        if (allEq && allRight) return { name: '正方形', facts: ['四条边一样长', '四个角都是直角'], kind: 'quad' };
        if (allRight) return { name: '长方形', facts: ['两组对边平行', '四个角都是直角'], kind: 'quad' };
        if (allEq) return { name: '菱形', facts: ['两组对边平行', '四条边一样长'], kind: 'quad' };
        return { name: '平行四边形', facts: ['两组对边分别平行'], kind: 'quad' };
      }
      if (par02 || par13) {
        const legs = par02 ? [l2[1], l2[3]] : [l2[0], l2[2]], f2 = [par02 ? '上下两条边平行' : '左右两条边平行', '另一组对边不平行'];
        if (eq(legs[0], legs[1])) return { name: '等腰梯形', facts: f2.concat('两条腰一样长'), kind: 'quad' };
        if (rightAngle) return { name: '直角梯形', facts: f2.concat('有直角'), kind: 'quad' };
        return { name: '梯形', facts: f2, kind: 'quad' };
      }
      const kite = (eq(l2[0], l2[1]) && eq(l2[2], l2[3])) || (eq(l2[1], l2[2]) && eq(l2[3], l2[0]));
      if (kite) return { name: '筝形', facts: ['两组邻边分别相等'], kind: 'quad' };
      return { name: '一般四边形', facts: ['没有平行的边，也不是筝形'], kind: 'quad' };
    }
    const diag = p.map((_, i) => { const a = p[(i + n - 1) % n], b = p[(i + 1) % n]; return dot(sub(b, a), sub(b, a)); });
    const reg = l2.every((x) => eq(x, l2[0])) && diag.every((x) => eq(x, diag[0]));
    return { name: n + ' 边形', facts: reg ? ['各边一样长'] : [], kind: 'poly' };
  }

  // 给面板用的说明：名字、识别理由、各边长度、面积、周长（精确，显示成 √ 的形式）
  function describe(f) {
    if (!f || f.type !== 'polygon') return null;
    const c = classify(f), sh = (r) => U.showVal(U.val('real', r, { dim: null }));
    const per = F.perimeter(f), sides = F.edges(f).map(([a, b]) => sh(F.len(a, b)));
    return {
      name: c.name, facts: c.facts, kind: c.kind,
      sides,
      area: sh(F.area(f)),
      perim: per.exact ? sh(per.real) : sides.join(' + ') + ' ≈ ' + (+per.approx.toFixed(2)),
    };
  }

  // ---- 把图形放进工作区：建自由点（按名字顺序）和围成多边形，全部放进工作区的 items ----
  function nextName(scene, taken) {
    const used = new Set(taken || []);
    for (const e of Object.values(scene.entities)) {
      const d = U.types[e.type];
      if (!d || d.workspaceRole !== 'point') continue;
      for (const v of [e.props && e.props.mark, e.role, e.name]) if (v) used.add(String(v));
    }
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let n = 0; ; n++) for (const ch of letters) { const nm = n ? ch + n : ch; if (!used.has(nm)) return nm; }
  }
  // list：整数顶点 [[x,y],…]；以 (cx, cy) 为外框中心；整体平移进 ±10 的范围（自由点的坐标范围）
  function buildInto(scene, wsId, list, cx, cy, label) {
    const W = U.World, E = scene.entities;
    const xs = list.map((p) => p[0]), ys = list.map((p) => p[1]);
    let dx = Math.round(cx - (Math.min(...xs) + Math.max(...xs)) / 2), dy = Math.round(cy - (Math.min(...ys) + Math.max(...ys)) / 2);
    dx = Math.max(-10 - Math.min(...xs), Math.min(10 - Math.max(...xs), dx));
    dy = Math.max(-10 - Math.min(...ys), Math.min(10 - Math.max(...ys), dy));
    const names = [], ids = [];
    for (const [x, y] of list) {
      const mark = nextName(scene, names); names.push(mark);
      const id = W.add(scene, 'gpt', 0, 0, { x: x + dx, y: y + dy, mark }); E[id].role = mark;
      ids.push(id);
    }
    const poly = W.add(scene, 'gpoly', 0, 0, {});
    if (label) E[poly].name = label;
    for (const id of ids) { const r = W.act(scene, { t: 'link', from: id, fromPort: 'p', to: poly, toPort: 'pts' }); if (!r.ok) return r; }
    for (const id of ids.concat([poly])) { const r = W.act(scene, { t: 'put', id, parent: wsId, slot: 'items' }); if (!r.ok) return r; }
    return { ok: true, points: ids, poly };
  }
  // 从器材架拖进工作区（由 U.Piece.dropInto 调用）：用器材当前的顶点建自由点，再把这个器材删掉
  function dropFree(scene, e, ws, a) {
    const W = U.World;
    let D; try { D = W.evaluate(scene); } catch (err) { D = null; }
    const port = Object.keys(U.types[e.type].outputs).find((k) => U.types[e.type].outputs[k].kind === 'fig');
    const v = D && D[e.id] && D[e.id].out[port], f = v && v.data;
    if (!f || !f.pts) return { ok: false, why: '这个图形现在算不出来' };
    const list = f.pts.map((q) => [Q.num(q.x), Q.num(q.y)]);
    if (!list.every((q) => Number.isInteger(q[0]) && Number.isInteger(q[1]))) return { ok: false, why: '顶点不是整数坐标，不能变成自由点' };
    const bx = list.map((q) => q[0]), by = list.map((q) => q[1]);
    const cx = a.x !== undefined ? a.x : (Math.min(...bx) + Math.max(...bx)) / 2, cy = a.y !== undefined ? a.y : (Math.min(...by) + Math.max(...by)) / 2;
    const label = U.types[e.type].label.replace('（可编辑）', '');
    const r = buildInto(scene, ws.id, list, cx, cy, label);
    if (!r.ok) return r;
    W.act(scene, { t: 'del', id: e.id });
    return { ok: true, placed: r.poly, points: r.points };
  }

  // ---- 器材 ----
  const C = (lo, hi, d, label) => ({ type: 'int', label, default: d, min: lo, max: hi });
  const types = {};
  for (const t of LIST) {
    const icon = () => '<path d="' + t.pts.map((p, i) => (i ? 'L' : 'M') + (10 + p[0] * 44 / 8) + ' ' + (38 - p[1] * 28 / 5)).join(' ') + ' Z" fill="rgba(59,155,255,.15)" stroke="var(--ink)" stroke-width="1.5"/>';
    types[t.id] = {
      workspaceRole: 'none',
      workbenches: ['geometry'],
      freeShape: true,
      handles: true,
      essence: ['E3', 'E5'],
      label: t.label, prefix: t.label.replace('（可编辑）', ''), group: '图形', grades: t.grades, alias: t.alias,
      props: { s: C(1, 2, 1, '放大几倍'), ox: C(-5, 5, 0, '向右平移'), oy: C(-5, 5, 0, '向上平移') },
      outputs: { f: { dim: null, kind: 'fig', label: '图形' }, area: { dim: null, kind: 'num', label: '面积' }, perim: { dim: null, kind: 'num', label: '周长' } },
      icon,
      size: () => [170, 170],
      compute: (c) => {
        const s = c.props.s, f = F.polygon(t.pts.map((p) => [p[0] * s + c.props.ox, p[1] * s + c.props.oy])), a = F.area(f), per = F.perimeter(f);
        const num = (q, o) => U.val('num', q, Object.assign({ dim: null }, o || {}));
        const sh = classify(f);
        if (sh) c.say('info', '这是' + sh.name + '：' + sh.facts.join('，'));
        return {
          f: U.val('fig', f, { dim: null }),
          area: num(a.a),
          perim: per.exact && per.real.b.n === 0n && per.real.p.n === 0n ? num(per.real.a) : num(Q.fromNumber(+per.approx.toFixed(6)), { exact: false }),
        };
      },
      badge: (c) => (c.out.area ? '面积 ' + U.showVal(c.out.area) : ''),
      draw: (c) => '<g transform="translate(6,2)">' + F.svg(c.out.f.data, c.w - 12, c.h - 6, { box: [-1, -1, 12, 12] }) + '</g>',
    };
  }

  U.Shapes = { LIST, BY, classify, describe, buildInto, dropFree, nextName };
  U.registerPack({ id: 'shapes', version: 1, needs: ['figure', 'geo', 'workspace'], types });
})(typeof globalThis !== 'undefined' ? globalThis : window);
