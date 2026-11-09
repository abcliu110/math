/* 图形对象模型（底层）：图形是一种可以在连线上流动的值（kind 'fig'），和数、点、函数一样。
 *
 * 值 = { type: 'point' | 'segment' | 'polygon' | 'circle', pts: [{x, y}…], r2?: 有理数 }
 *   坐标全部是精确有理数；圆用圆心 pts[0] 和半径的平方 r2 表示（半径可能是无理数）。
 *
 * 原则：所有“判定”（全等、相似、直角、平行、垂直、在线上）都用有理数精确算：比的是距离的平方、
 * 叉积、点积，不开方、不用浮点。只有“显示一个度数”这类结果才是近似值。
 *
 * U.Fig 提供：
 *   构造   point / segment / polygon / circle
 *   度量   d2（距离平方）、len（长度，符号精确数）、area、perimeter、angle（度，近似）、isRight
 *   变换   translate / rotate90 / reflect / scale        —— 有理数坐标进、有理数坐标出，精确
 *   关系   congruent / similar / parallel / perpendicular / onSegment / onCircle
 *   画法   svg(f, w, h)：给器材画缩略图用 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q;

  const P = (x, y) => ({ x: typeof x === 'object' ? x : Q.fromNumber(x), y: typeof y === 'object' ? y : Q.fromNumber(y) });
  const sub = (a, b) => ({ x: Q.sub(a.x, b.x), y: Q.sub(a.y, b.y) });
  const dot = (u, v) => Q.add(Q.mul(u.x, v.x), Q.mul(u.y, v.y));
  const cross = (u, v) => Q.sub(Q.mul(u.x, v.y), Q.mul(u.y, v.x));
  const zero = (q) => q.n === 0;
  const NAMES = { point: '点', segment: '线段', circle: '圆' };
  const polyName = (n) => ({ 3: '三角形', 4: '四边形', 5: '五边形', 6: '六边形' }[n] || n + ' 边形');

  const F = {
    // ---------- 构造 ----------
    point: (x, y) => ({ type: 'point', pts: [P(x, y)] }),
    segment: (a, b) => ({ type: 'segment', pts: [P(a[0], a[1]), P(b[0], b[1])] }),
    polygon: (list) => ({ type: 'polygon', pts: list.map((p) => P(p[0], p[1])) }),
    circle: (c, r2) => ({ type: 'circle', pts: [P(c[0], c[1])], r2: typeof r2 === 'object' ? r2 : Q.fromNumber(r2) }),

    name(f) { return f.type === 'polygon' ? polyName(f.pts.length) : NAMES[f.type]; },

    // ---------- 度量 ----------
    d2: (a, b) => { const v = sub(a, b); return dot(v, v); },
    len: (a, b) => U.Real.sqrt(F.d2(a, b)),
    // 边的端点对（多边形首尾相连；线段只有一条边）
    edges(f) {
      const p = f.pts;
      if (f.type === 'segment') return [[p[0], p[1]]];
      if (f.type !== 'polygon') return [];
      return p.map((a, i) => [a, p[(i + 1) % p.length]]);
    },
    // 有符号面积的两倍（鞋带公式），精确
    area2(f) {
      if (f.type !== 'polygon') return Q(0);
      let s = Q(0); const p = f.pts;
      for (let i = 0; i < p.length; i++) s = Q.add(s, cross(p[i], p[(i + 1) % p.length]));
      return s;
    },
    // 面积：多边形是有理数（返回符号精确数）；圆是 π r²（也精确）
    area(f) {
      if (f.type === 'circle') return U.Real.pi(f.r2);
      const a = F.area2(f);
      return U.Real.from(Q.div(Q(Math.abs(a.n), a.d), Q(2)));
    },
    // 周长：各边长度相加；不同根式相加不能精确表示时，exact 为 false，只给近似值
    perimeter(f) {
      if (f.type === 'circle') {
        const r = U.Real.sqrt(f.r2);
        const exact = r && r.b.n === 0 ? U.Real.pi(Q.mul(Q(2), r.a)) : null;
        return { exact: !!exact, real: exact, approx: 2 * Math.PI * Math.sqrt(Q.num(f.r2)) };
      }
      let sum = U.Real.from(Q(0)), ok = true, approx = 0;
      for (const [a, b] of F.edges(f)) {
        const l = F.len(a, b); approx += Math.sqrt(Q.num(F.d2(a, b)));
        if (ok) { const s = U.Real.add(sum, l); if (s) sum = s; else ok = false; }
      }
      return { exact: ok, real: ok ? sum : null, approx };
    },
    // 顶点 i 处的角：是否直角（精确）、度数（近似）
    isRight(f, i) {
      const p = f.pts, n = p.length, a = p[(i + n - 1) % n], o = p[i], b = p[(i + 1) % n];
      return zero(dot(sub(a, o), sub(b, o)));
    },
    angle(f, i) {
      const p = f.pts, n = p.length, a = p[(i + n - 1) % n], o = p[i], b = p[(i + 1) % n];
      const u = sub(a, o), v = sub(b, o);
      const c = Q.num(dot(u, v)) / Math.sqrt(Q.num(dot(u, u)) * Q.num(dot(v, v)));
      return Math.acos(Math.max(-1, Math.min(1, c))) * 180 / Math.PI;
    },

    // ---------- 变换（精确） ----------
    map(f, fn) { return Object.assign({}, f, { pts: f.pts.map(fn) }); },
    translate: (f, dx, dy) => F.map(f, (p) => ({ x: Q.add(p.x, dx), y: Q.add(p.y, dy) })),
    // 绕点 c 逆时针转 k 个 90°
    rotate90(f, c, k) {
      k = ((k % 4) + 4) % 4;
      return F.map(f, (p) => {
        let v = sub(p, c);
        for (let i = 0; i < k; i++) v = { x: Q.neg(v.y), y: v.x };
        return { x: Q.add(c.x, v.x), y: Q.add(c.y, v.y) };
      });
    },
    // 关于过 a、b 两点的直线对称
    reflect(f, a, b) {
      const d = sub(b, a), dd = dot(d, d);
      return F.map(f, (p) => {
        const t = Q.div(dot(sub(p, a), d), dd);
        const foot = { x: Q.add(a.x, Q.mul(t, d.x)), y: Q.add(a.y, Q.mul(t, d.y)) };
        return { x: Q.sub(Q.mul(Q(2), foot.x), p.x), y: Q.sub(Q.mul(Q(2), foot.y), p.y) };
      });
    },
    // 以 c 为中心放大 k 倍（k 是有理数）；圆的半径平方乘 k²
    scale(f, c, k) {
      const g = F.map(f, (p) => ({ x: Q.add(c.x, Q.mul(k, Q.sub(p.x, c.x))), y: Q.add(c.y, Q.mul(k, Q.sub(p.y, c.y))) }));
      if (f.type === 'circle') g.r2 = Q.mul(f.r2, Q.mul(k, k));
      return g;
    },

    // ---------- 关系（精确） ----------
    // 顶点之间所有距离平方的矩阵，按对应关系 map(i) 取
    _match(a, b, test) {
      const n = a.pts.length; if (b.pts.length !== n) return false;
      for (let s = 0; s < n; s++) for (const dir of [1, -1]) {
        const m = (i) => (s + dir * i + n * 2) % n;
        let ok = true;
        for (let i = 0; i < n && ok; i++) for (let j = i + 1; j < n && ok; j++) ok = test(F.d2(a.pts[i], a.pts[j]), F.d2(b.pts[m(i)], b.pts[m(j)]));
        if (ok) return true;
      }
      return false;
    },
    congruent(a, b) {
      if (a.type !== b.type) return false;
      if (a.type === 'circle') return Q.eq(a.r2, b.r2);
      if (a.type === 'point') return true;
      return F._match(a, b, (x, y) => Q.eq(x, y));
    },
    // 相似：返回 { ok, k2 }，k2 是相似比的平方（b 比 a）
    similar(a, b) {
      if (a.type !== b.type) return { ok: false, k2: null };
      if (a.type === 'circle') return { ok: true, k2: Q.div(b.r2, a.r2) };
      if (a.type === 'point') return { ok: true, k2: Q(1) };
      const n = a.pts.length; if (b.pts.length !== n) return { ok: false, k2: null };
      // 每一种顶点对应关系（起点 s、方向 dir）单独试：所有距离平方都按同一个比 k2 放大才算相似
      for (let s = 0; s < n; s++) for (const dir of [1, -1]) {
        const m = (i) => (s + dir * i + n * 2) % n;
        let k2 = null, ok = true;
        for (let i = 0; i < n && ok; i++) for (let j = i + 1; j < n && ok; j++) {
          const x = F.d2(a.pts[i], a.pts[j]), y = F.d2(b.pts[m(i)], b.pts[m(j)]);
          if (zero(x)) { ok = zero(y); continue; }
          if (k2 === null) k2 = Q.div(y, x); else ok = Q.eq(Q.mul(x, k2), y);
        }
        if (ok && k2 && !zero(k2)) return { ok: true, k2 };
      }
      return { ok: false, k2: null };
    },
    parallel: (s, t) => zero(cross(sub(s.pts[1], s.pts[0]), sub(t.pts[1], t.pts[0]))),
    perpendicular: (s, t) => zero(dot(sub(s.pts[1], s.pts[0]), sub(t.pts[1], t.pts[0]))),
    onSegment(p, s) {
      const a = s.pts[0], b = s.pts[1];
      if (!zero(cross(sub(b, a), sub(p, a)))) return false;
      const t = dot(sub(p, a), sub(b, a)), L = dot(sub(b, a), sub(b, a));
      return Q.cmp(t, Q(0)) >= 0 && Q.cmp(t, L) <= 0;
    },
    onCircle: (p, c) => Q.eq(F.d2(p, c.pts[0]), c.r2),

    // ---------- 相等与显示 ----------
    eq(a, b) {
      if (a.type !== b.type || a.pts.length !== b.pts.length) return false;
      if (a.type === 'circle') return Q.eq(a.pts[0].x, b.pts[0].x) && Q.eq(a.pts[0].y, b.pts[0].y) && Q.eq(a.r2, b.r2);
      const n = a.pts.length, same = (p, q) => Q.eq(p.x, q.x) && Q.eq(p.y, q.y);
      for (let s = 0; s < n; s++) for (const dir of [1, -1]) {
        let ok = true;
        for (let i = 0; i < n && ok; i++) ok = same(a.pts[i], b.pts[(s + dir * i + n * 2) % n]);
        if (ok) return true;
      }
      return false;
    },
    show(f) {
      const pt = (p) => '(' + Q.show(p.x) + ', ' + Q.show(p.y) + ')';
      if (f.type === 'circle') {
        const r = U.Real.sqrt(f.r2);
        return '圆 圆心' + pt(f.pts[0]) + ' 半径 ' + (r ? U.Real.show(r) : '√' + Q.show(f.r2));
      }
      return F.name(f) + ' ' + f.pts.map(pt).join(' ');
    },

    // ---------- 画法 ----------
    // 把图形画进 w×h 的框：box 是坐标范围 [xmin, ymin, xmax, ymax]（默认 −10..10），y 轴向上
    svg(f, w, h, o) {
      o = o || {};
      const box = o.box || [-10, -10, 10, 10], sx = w / (box[2] - box[0]), sy = h / (box[3] - box[1]), s = Math.min(sx, sy);
      const X = (q) => (Q.num(q) - box[0]) * s + (w - (box[2] - box[0]) * s) / 2, Y = (q) => h - ((Q.num(q) - box[1]) * s + (h - (box[3] - box[1]) * s) / 2);
      const stroke = o.stroke || 'var(--blue, #3b9bff)', fill = o.fill || 'rgba(59,155,255,.15)';
      let g = o.grid === false ? '' : '<line x1="' + X(Q(box[0])) + '" y1="' + Y(Q(0)) + '" x2="' + X(Q(box[2])) + '" y2="' + Y(Q(0)) + '" stroke="var(--line, #ccc)"/>' +
        '<line x1="' + X(Q(0)) + '" y1="' + Y(Q(box[1])) + '" x2="' + X(Q(0)) + '" y2="' + Y(Q(box[3])) + '" stroke="var(--line, #ccc)"/>';
      if (!f) return g;
      if (f.type === 'circle') return g + '<circle cx="' + X(f.pts[0].x) + '" cy="' + Y(f.pts[0].y) + '" r="' + Math.sqrt(Q.num(f.r2)) * s + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2"/>';
      if (f.type === 'point') return g + '<circle cx="' + X(f.pts[0].x) + '" cy="' + Y(f.pts[0].y) + '" r="3" fill="' + stroke + '"/>';
      const d = f.pts.map((p, i) => (i ? 'L' : 'M') + X(p.x).toFixed(1) + ' ' + Y(p.y).toFixed(1)).join(' ') + (f.type === 'polygon' ? ' Z' : '');
      return g + '<path d="' + d + '" fill="' + (f.type === 'polygon' ? fill : 'none') + '" stroke="' + stroke + '" stroke-width="2"/>';
    },
  };

  U.Fig = F;
  U.defineKind('fig', { label: '图形', color: '#2dd4bf', eq: (a, b) => F.eq(a, b), show: (f) => F.show(f), brief: (f) => F.name(f) });
})(typeof globalThis !== 'undefined' ? globalThis : window);
