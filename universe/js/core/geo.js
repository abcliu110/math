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
      if (den.n === 0) return null;
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
      if (pieces.some((q) => q.pts.length < 3 || F.area2(q).n === 0)) return { pieces: null, why: '切出来有一块是空的（线贴着边走）' };
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
        const mid = verts.filter((v) => !same(v, a) && !same(v, b) && cross(d, sub(v, a)).n === 0)
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
      const pts = ring.filter((p, i) => { const a = ring[(i + ring.length - 1) % ring.length], b = ring[(i + 1) % ring.length]; return cross(sub(p, a), sub(b, p)).n !== 0; });
      const poly = { type: 'polygon', pts };
      const area = (f) => { const a = F.area2(f); return Q.div(Q(Math.abs(a.n), a.d), Q(2)); };
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
      if (o.dx || o.dy) g = F.translate(g, Q(o.dx || 0), Q(o.dy || 0));
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
      const area = (f) => { const a = F.area2(f); return Q.div(Q(Math.abs(a.n), a.d), Q(2)); };
      const areaSum = pieces.reduce((s, f) => Q.add(s, area(f)), Q(0)), areaT = area(target);
      const boundaryOk = left.length === tgt.size && left.every((k) => tgt.has(k));
      if (!Q.eq(areaSum, areaT)) return { ok: false, why: Q.cmp(areaSum, areaT) < 0 ? '面积不够：还有空缺' : '面积多了：有重叠或多余的块', areaSum, areaT };
      if (!boundaryOk) return { ok: false, why: '面积对了，但外轮廓和目标不一样：位置还没摆对', areaSum, areaT };
      return { ok: true, why: '正好拼成：内部的边都两两对上，外边界就是目标', areaSum, areaT };
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
