/* 几何构造（原型）：辅助线、剪切、拼合的统一底层。
 *
 * 思路：几何就是一张构造图。每个点、每条线是一个小器材，由谁构造出来就和谁连线，
 * 求值、拖动、撤销、存档、判分全部沿用世界内核。这里只放“构造”和“剪拼”的精确计算：
 *   - 构造：中点、两直线交点、垂足 —— 有理数坐标进，有理数坐标出
 *   - 剪切：用一条直线把多边形切成两块（直线正好穿过边界两次）
 *   - 拼合：边对消（内部边成对抵消、剩下的外边界正好是目标）+ 面积之和等于目标面积
 * 图形值见 figure.js（U.Fig）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, F = U.Fig;

  const sub = (a, b) => ({ x: Q.sub(a.x, b.x), y: Q.sub(a.y, b.y) });
  const cross = (u, v) => Q.sub(Q.mul(u.x, v.y), Q.mul(u.y, v.x));
  const dot = (u, v) => Q.add(Q.mul(u.x, v.x), Q.mul(u.y, v.y));
  const sgn = (q) => (q.n > 0 ? 1 : q.n < 0 ? -1 : 0);
  const key = (p) => Q.show(p.x) + ',' + Q.show(p.y);
  const same = (p, q) => Q.eq(p.x, q.x) && Q.eq(p.y, q.y);

  const Geo = {
    // ---------- 构造 ----------
    midpoint: (a, b) => ({ x: Q.div(Q.add(a.x, b.x), Q(2)), y: Q.div(Q.add(a.y, b.y), Q(2)) }),
    // 直线 p1p2 与直线 q1q2 的交点；平行或重合返回 null
    lineIntersect(p1, p2, q1, q2) {
      const r = sub(p2, p1), s = sub(q2, q1), den = cross(r, s);
      if (den.n === 0n) return null;
      const t = Q.div(cross(sub(q1, p1), s), den);
      return { x: Q.add(p1.x, Q.mul(t, r.x)), y: Q.add(p1.y, Q.mul(t, r.y)) };
    },
    // 点 p 到直线 ab 的垂足
    foot(p, a, b) {
      const d = sub(b, a), t = Q.div(dot(sub(p, a), d), dot(d, d));
      return { x: Q.add(a.x, Q.mul(t, d.x)), y: Q.add(a.y, Q.mul(t, d.y)) };
    },
    // 点 p 在直线 ab 的哪一侧：1 左、−1 右、0 在线上
    side: (a, b, p) => sgn(cross(sub(b, a), sub(p, a))),
    // 三角形 abc 的重心（三个顶点的平均，有理数）
    centroid: (a, b, c) => ({ x: Q.div(Q.add(Q.add(a.x, b.x), c.x), Q(3)), y: Q.div(Q.add(Q.add(a.y, b.y), c.y), Q(3)) }),
    // 三角形 abc 的外心（三边中垂线的交点，有理数）；三点共线时没有，返回 null
    circumcenter(a, b, c) {
      const d = Q.mul(Q(2), Q.add(Q.add(Q.mul(a.x, Q.sub(b.y, c.y)), Q.mul(b.x, Q.sub(c.y, a.y))), Q.mul(c.x, Q.sub(a.y, b.y))));
      if (d.n === 0n) return null;
      const sa = Q.add(Q.mul(a.x, a.x), Q.mul(a.y, a.y)), sb = Q.add(Q.mul(b.x, b.x), Q.mul(b.y, b.y)), sc = Q.add(Q.mul(c.x, c.x), Q.mul(c.y, c.y));
      const ux = Q.add(Q.add(Q.mul(sa, Q.sub(b.y, c.y)), Q.mul(sb, Q.sub(c.y, a.y))), Q.mul(sc, Q.sub(a.y, b.y)));
      const uy = Q.add(Q.add(Q.mul(sa, Q.sub(c.x, b.x)), Q.mul(sb, Q.sub(a.x, c.x))), Q.mul(sc, Q.sub(b.x, a.x)));
      return { x: Q.div(ux, d), y: Q.div(uy, d) };
    },
    // 线段 ab 上靠近 a 的 k/3 点（k = 1 或 2）：三等分点
    trisect: (a, b, k) => ({ x: Q.add(a.x, Q.div(Q.mul(Q(k), Q.sub(b.x, a.x)), Q(3))), y: Q.add(a.y, Q.div(Q.mul(Q(k), Q.sub(b.y, a.y)), Q(3))) }),

    // ---------- 剪切 ----------
    // 用直线 ab 把多边形切成两块。返回 { pieces: [poly1, poly2] } 或 { pieces: null, why }
    cut(poly, a, b) {
      const P = poly.pts, n = P.length, s = P.map((p) => Geo.side(a, b, p));
      const ring = [], cuts = [];
      for (let i = 0; i < n; i++) {
        const p = P[i], j = (i + 1) % n;
        if (s[i] === 0) {
          const sp = s[(i + n - 1) % n], sn = s[j];
          ring.push(p);
          if (sp * sn < 0) cuts.push(ring.length - 1);       // 线正好穿过这个顶点
        } else ring.push(p);
        if (s[i] * s[j] < 0) {                                  // 线穿过这条边：插入交点
          ring.push(Geo.lineIntersect(p, P[j], a, b));
          cuts.push(ring.length - 1);
        }
      }
      if (cuts.length !== 2) return { pieces: null, why: cuts.length < 2 ? '这条线没有穿过图形，切不开' : '这条线穿过边界不止两次，原型只支持切成两块' };
      const [i1, i2] = cuts;
      const one = ring.slice(i1, i2 + 1), two = ring.slice(i2).concat(ring.slice(0, i1 + 1));
      const pieces = [one, two].map((pts) => ({ type: 'polygon', pts }));
      if (pieces.some((q) => q.pts.length < 3 || F.area2(q).n === 0n)) return { pieces: null, why: '切出来有一块是空的（线贴着边走）' };
      return { pieces };
    },

    // ---------- 拼合 ----------
    // 多边形的有向边（统一成逆时针），并在落在边上的其他顶点处断开
    _edges(poly, verts) {
      let pts = poly.pts;
      if (sgn(F.area2(poly)) < 0) pts = pts.slice().reverse();
      const out = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length], d = sub(b, a), L = dot(d, d);
        // 这条边内部的其他顶点，按沿边的位置排序
        const mid = verts.filter((v) => !same(v, a) && !same(v, b) && cross(d, sub(v, a)).n === 0n)
          .map((v) => ({ v, t: Q.div(dot(sub(v, a), d), L) }))
          .filter((o) => Q.cmp(o.t, Q(0)) > 0 && Q.cmp(o.t, Q(1)) < 0)
          .sort((x, y) => Q.cmp(x.t, y.t));
        let prev = a;
        for (const o of mid) { out.push([prev, o.v]); prev = o.v; }
        out.push([prev, b]);
      }
      return out;
    },
    // 粘贴：把几块合成一个图形。内部边抵消，剩下的边必须正好连成一圈。
    // 返回 { ok, poly, why }；不成功时说明原因（重叠、没贴上、拼出了洞）
    merge(pieces) {
      if (!pieces.length) return { ok: false, poly: null, why: '还没有块' };
      if (pieces.length === 1) return { ok: true, poly: pieces[0], why: '只有一块' };
      const verts = [];
      for (const f of pieces) for (const p of f.pts) if (!verts.some((v) => same(v, p))) verts.push(p);
      const edges = new Map();
      for (const f of pieces) for (const [a, b] of Geo._edges(f, verts)) {
        const k = key(a) + '>' + key(b), r = key(b) + '>' + key(a);
        if (edges.has(k)) return { ok: false, poly: null, why: '有两块叠在一起了' };
        if (edges.has(r)) edges.delete(r); else edges.set(k, [a, b]);
      }
      const next = new Map();
      for (const [a, b] of edges.values()) {
        if (next.has(key(a))) return { ok: false, poly: null, why: '外边界不是一圈：拼出了洞，或者两块只碰在一个点上' };
        next.set(key(a), b);
      }
      const first = [...edges.values()][0][0], ring = [first];
      let cur = next.get(key(first));
      while (cur && !same(cur, first) && ring.length <= edges.size) { ring.push(cur); cur = next.get(key(cur)); }
      if (ring.length !== edges.size) return { ok: false, poly: null, why: '拼出来不止一块：有的块没有贴上' };
      // 去掉共线的中间点
      const pts = ring.filter((p, i) => { const a = ring[(i + ring.length - 1) % ring.length], b = ring[(i + 1) % ring.length]; return cross(sub(p, a), sub(b, p)).n !== 0n; });
      const poly = { type: 'polygon', pts };
      const area = (f) => { const a = F.area2(f); return Q.div(Q.abs(a), Q(2)); };
      const sum = pieces.reduce((s, f) => Q.add(s, area(f)), Q(0));
      if (!Q.eq(area(poly), sum)) return { ok: false, poly: null, why: '面积对不上：有重叠' };
      return { ok: true, poly, why: '粘成了一个' + F.name(poly) + '，面积 ' + Q.show(sum) };
    },

    // 摆放：翻转（以自己的左下角为准）、旋转 90° 的倍数、平移。全部精确
    place(f, o) {
      const xs = f.pts.map((p) => p.x), ys = f.pts.map((p) => p.y);
      const min = (a) => a.reduce((m, q) => (Q.cmp(q, m) < 0 ? q : m));
      const max = (a) => a.reduce((m, q) => (Q.cmp(q, m) > 0 ? q : m));
      const x0 = min(xs), y0 = min(ys), x1 = max(xs), y1 = max(ys);
      let g = f;
      if (o.flip === 1) g = F.map(g, (p) => ({ x: Q.sub(Q.add(x0, x1), p.x), y: p.y }));        // 左右翻
      if (o.flip === 2) g = F.map(g, (p) => ({ x: p.x, y: Q.sub(Q.add(y0, y1), p.y) }));        // 上下翻
      if (o.turn) g = F.rotate90(g, { x: x0, y: y0 }, o.turn);
      const tx = Q.parse(o.dx || 0), ty = Q.parse(o.dy || 0);   // 平移量可以是有理数（块的分数平移），精确
      if (tx.n || ty.n) g = F.translate(g, tx, ty);
      return g;
    },

    // 检查 pieces 能否正好拼成 target。返回 { ok, why, areaSum, target }
    assemble(pieces, target) {
      if (!pieces.length) return { ok: false, why: '还没有块' };
      const verts = [];
      for (const f of pieces.concat([target])) for (const p of f.pts) if (!verts.some((v) => same(v, p))) verts.push(p);
      const count = new Map();
      for (const f of pieces) for (const [a, b] of Geo._edges(f, verts)) {
        const k = key(a) + '>' + key(b), r = key(b) + '>' + key(a);
        if (count.get(k)) return { ok: false, why: '有两块叠在一起了（同一条边出现两次）' };
        if (count.get(r)) count.delete(r); else count.set(k, 1);   // 内部边：一正一反，抵消
      }
      const tgt = new Set(Geo._edges(target, verts).map(([a, b]) => key(a) + '>' + key(b)));
      const left = [...count.keys()];
      const area = (f) => { const a = F.area2(f); return Q.div(Q.abs(a), Q(2)); };
      const areaSum = pieces.reduce((s, f) => Q.add(s, area(f)), Q(0)), areaT = area(target);
      const boundaryOk = left.length === tgt.size && left.every((k) => tgt.has(k));
      if (!Q.eq(areaSum, areaT)) return { ok: false, why: Q.cmp(areaSum, areaT) < 0 ? '面积不够：还有空缺' : '面积多了：有重叠或多余的块', areaSum, areaT };
      if (!boundaryOk) return { ok: false, why: '面积对了，但外轮廓和目标不一样：位置还没摆对', areaSum, areaT };
      return { ok: true, why: '正好拼成：内部的边都两两对上，外边界就是目标', areaSum, areaT };
    },
  };
  // ---- 约束锁定（§10.5.9 第 1 条）----
  // 约束器材（声明 constraint: true，见 packs/geo.js 的 gcon）：kind 0 定长（a、b 的距离的平方 = len²），kind 1 直角（b 处 BA ⊥ BC）。
  // 自由点只存整数坐标，所以只在整数格点上找满足约束的位置：拖动时取离鼠标最近的那个，改长度时取离原来最近的那个。
  // 找不到就不动（说明原因）。界面只调用这里的函数，不按器材名判断。
  // 近似坐标（数字）：给只要大概位置的计算用；精确的计算用 U.Q.parse(props.x)。分数坐标存成 "n/d" 字符串，这里转成数字
  const pos = (scene, id) => { const p = scene.entities[id].props; const num = (v) => (v === undefined ? v : U.Q.num(U.Q.parse(v))); return { x: num(p.x), y: num(p.y) }; };
  function locksOf(scene) {
    const E = scene.entities, out = [];
    for (const e of Object.values(E)) {
      const d = U.types[e.type]; if (!d || !d.constraint) continue;
      const from = (port) => { const l = scene.links.find((x) => x.to === e.id && x.toPort === port); return l && E[l.from] ? l.from : null; };
      const kind = e.props.kind === 1 ? 'right' : 'len';
      const c = { id: e.id, kind, len: +e.props.len || 0, a: from('a'), b: from('b'), c: from('c') };
      if (!c.a || !c.b || (kind === 'right' && !c.c)) continue;   // 接不全的约束不起作用（比如它的点被删了）
      out.push(c);
    }
    return out;
  }
  // 约束在某组点的位置（P(id) 给坐标）下是否成立；len 可以覆盖定长的长度（改长度时用）
  function holds(c, P, len) {
    if (c.kind === 'len') {
      const A = P(c.a), B = P(c.b), L = len === undefined ? c.len : len, dx = A.x - B.x, dy = A.y - B.y;
      return dx * dx + dy * dy === L * L;
    }
    const A = P(c.a), B = P(c.b), C = P(c.c);
    const u = [A.x - B.x, A.y - B.y], v = [C.x - B.x, C.y - B.y];
    if (!(u[0] || u[1]) || !(v[0] || v[1])) return false;   // 两条边退化成一个点，不算直角
    return u[0] * v[0] + u[1] * v[1] === 0;
  }
  // 把点 id 移到 want 附近：满足它的所有约束（别的点不动）的整数格点里，离 want 最近的一个（平手取 x 小的，再取 y 小的）
  function fitPoint(scene, id, want, over) {
    const cons = locksOf(scene).filter((c) => c.a === id || c.b === id || c.c === id);
    if (!cons.length) return { ok: true, x: want.x, y: want.y, locked: false };
    const d = U.types.gpt.props, x0 = d.x.min, x1 = d.x.max, y0 = d.y.min, y1 = d.y.max;
    let best = null, bd = Infinity;
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) {
      const P = (k) => (k === id ? { x, y } : pos(scene, k));
      if (!cons.every((c) => holds(c, P, over ? over[c.id] : undefined))) continue;
      const dd = (x - want.x) * (x - want.x) + (y - want.y) * (y - want.y);
      if (dd < bd) { bd = dd; best = { x, y }; }
    }
    if (!best) return { ok: false, why: '这个点被约束锁着，附近没有它能放的位置', locked: true };
    return { ok: true, x: best.x, y: best.y, locked: true };
  }
  const isInt = (v) => Number.isInteger(v) && v >= 1 && v <= 20;
  Geo.locks = {
    // 所有约束（只列接全了的）
    of: locksOf,
    // 拖动一个点到 want：返回允许的位置（ok 为假时说明原因）
    fit: (scene, id, want) => fitPoint(scene, id, want, null),
    // 把定长约束 conId 的长度改成 L：先动 b，动不了再动 a（离原来的位置最近的）。返回要移动的点 id 和新坐标
    dim(scene, conId, L) {
      const c = locksOf(scene).find((x) => x.id === conId && x.kind === 'len');
      if (!c) return { ok: false, why: '这条线没有锁长' };
      if (!isInt(L)) return { ok: false, why: '长度要填 1 到 20 之间的整数' };
      for (const id of [c.b, c.a]) {
        const r = fitPoint(scene, id, pos(scene, id), { [conId]: L });
        if (r.ok) return Object.assign({ id }, r);
      }
      return { ok: false, why: '长 ' + L + ' 画不出来：没有整数格点能满足这条线的约束（长的平方要能写成两个整数的平方和，而且别的约束也要成立）' };
    },
    // 当前这条线能不能锁长：两端都是整数格点，长的平方是整数的平方（3、4、5 这样的长）
    canLen(scene, a, b) {
      const A = pos(scene, a), B = pos(scene, b), d2 = (A.x - B.x) ** 2 + (A.y - B.y) ** 2, r = Math.round(Math.sqrt(d2));
      if (!d2 || r * r !== d2 || r > 20) return { ok: false, why: '这条线的长不是整数（平方是 ' + d2 + '），锁不住：先把它拖到 3、4、5 这样的整数长' };
      return { ok: true, len: r };
    },
    // 多边形（按顶点顺序的 id 数组）上哪些顶点是直角：返回 [前一点, 顶点, 后一点] 的三元组
    rightAt(scene, ids) {
      const n = ids.length, out = [];
      for (let i = 0; i < n; i++) {
        const tri = [ids[(i + n - 1) % n], ids[i], ids[(i + 1) % n]];
        if (holds({ kind: 'right', a: tri[0], b: tri[1], c: tri[2] }, (k) => pos(scene, k))) out.push(tri);
      }
      return out;
    },
    // 线段器材 seg 的两端点 id（按 a、b 口）；接不全返回 null
    segEnds(scene, seg) {
      const a = scene.links.find((l) => l.to === seg && l.toPort === 'a'), b = scene.links.find((l) => l.to === seg && l.toPort === 'b');
      return a && b ? [a.from, b.from] : null;
    },
    // 这两个点之间的定长约束（不论顺序），没有返回 null
    lenOf(scene, ids) {
      return locksOf(scene).find((c) => c.kind === 'len' && ((c.a === ids[0] && c.b === ids[1]) || (c.a === ids[1] && c.b === ids[0]))) || null;
    },
    // 顶点 tri[1] 上、两条边是 tri[0] 和 tri[2] 的直角约束，没有返回 null
    rightOf(scene, tri) {
      return locksOf(scene).find((c) => c.kind === 'right' && c.b === tri[1] && ((c.a === tri[0] && c.c === tri[2]) || (c.a === tri[2] && c.c === tri[0]))) || null;
    },
    // 一组点整体移动（平移、旋转）时，约束要是都在这组点里，移动后仍然成立（长和直角不变）
    rigid(scene, ids) {
      const set = new Set(ids);
      return locksOf(scene).every((c) => !([c.a, c.b, c.c].some((k) => set.has(k))) || [c.a, c.b, c.c].every((k) => !k || set.has(k)));
    },
  };
  U.Geo = Geo;

  // 图形组（剪切的结果）：一组图形
  U.defineKind('figs', {
    label: '图形组', color: '#5eead4',
    eq: (a, b) => a.length === b.length && a.every((f, i) => F.eq(f, b[i])),
    show: (a) => a.length + ' 块：' + a.map((f) => F.name(f)).join('、'),
    brief: (a) => a.length + ' 块',
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
