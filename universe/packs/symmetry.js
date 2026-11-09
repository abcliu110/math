/* 器材包 symmetry：折纸。一张矩形纸、一条可以设定的折痕。折一次，看两半能不能完全重合；数一数有几对点互相对上。无状态：每次都从参数算出来。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n));
  const EPS = 1e-9;

  // 几何（纸的坐标：左下角 (0,0)，宽 w，高 ht；折痕过中心，再沿法向偏 offset）
  function geom(p) {
    const a = (p.angle * Math.PI) / 180, ux = Math.cos(a), uy = Math.sin(a);
    const nx = -uy, ny = ux, cx = p.w / 2, cy = p.ht / 2;
    return { ux, uy, nx, ny, qx: cx + p.offset * nx, qy: cy + p.offset * ny };
  }
  const side = (g, x, y) => (x - g.qx) * g.nx + (y - g.qy) * g.ny;
  function refl(g, x, y) {
    const vx = x - g.qx, vy = y - g.qy, d = vx * g.ux + vy * g.uy;
    return [g.qx + 2 * d * g.ux - vx, g.qy + 2 * d * g.uy - vy];
  }
  const rectPoly = (p) => [[0, 0], [p.w, 0], [p.w, p.ht], [0, p.ht]];
  // 凸多边形被折痕切开，取一侧（sg=+1 或 −1）
  function half(poly, g, sg) {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const A = poly[i], B = poly[(i + 1) % poly.length];
      const sa = sg * side(g, A[0], A[1]), sb = sg * side(g, B[0], B[1]);
      if (sa >= -EPS) out.push(A);
      if ((sa > EPS && sb < -EPS) || (sa < -EPS && sb > EPS)) {
        const t = sa / (sa - sb);
        out.push([A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])]);
      }
    }
    return out;
  }
  const area = (poly) => {
    let s = 0;
    for (let i = 0; i < poly.length; i++) { const A = poly[i], B = poly[(i + 1) % poly.length]; s += A[0] * B[1] - B[0] * A[1]; }
    return Math.abs(s) / 2;
  };
  // 两半能否重合：折过去的那一半，镜像后正好落在另一半里（面积相等 + 镜像顶点都在对面）
  function coincide(p, g) {
    const rect = rectPoly(p), A = half(rect, g, 1), B = half(rect, g, -1);
    const aA = area(A);
    if (aA < EPS || Math.abs(aA - area(B)) > 1e-7) return false;
    const inRect = (x, y) => x >= -1e-7 && x <= p.w + 1e-7 && y >= -1e-7 && y <= p.ht + 1e-7;
    return A.every((v) => { const r = refl(g, v[0], v[1]); return inRect(r[0], r[1]); });
  }
  // 有几对格点互相对上（格点 = 纸上的整数点；镜像后仍是格点且在纸上，不是折痕上的点）
  function pairsOf(p, g) {
    let n = 0;
    for (let i = 0; i <= p.w; i++) for (let j = 0; j <= p.ht; j++) {
      if (Math.abs(side(g, i, j)) < EPS) continue;
      const r = refl(g, i, j), ri = Math.round(r[0]), rj = Math.round(r[1]);
      if (Math.abs(r[0] - ri) < 1e-7 && Math.abs(r[1] - rj) < 1e-7 && ri >= 0 && ri <= p.w && rj >= 0 && rj <= p.ht) n++;
    }
    return n / 2;
  }
  // 折痕穿过纸的部分（端点）；折痕在纸外则返回 null
  function foldSeg(p, g) {
    const ts = [], edges = [[0, 0, p.w, 0], [p.w, 0, p.w, p.ht], [p.w, p.ht, 0, p.ht], [0, p.ht, 0, 0]];
    for (const [x1, y1, x2, y2] of edges) {
      const ex = x2 - x1, ey = y2 - y1, den = g.ux * ey - g.uy * ex;
      if (Math.abs(den) < 1e-12) continue;
      const dx = x1 - g.qx, dy = y1 - g.qy;
      const t = (dx * ey - dy * ex) / den, s = (dx * g.uy - dy * g.ux) / den;
      if (s >= -1e-9 && s <= 1 + 1e-9) ts.push(t);
    }
    if (ts.length < 2) return null;
    const t0 = Math.min(...ts), t1 = Math.max(...ts);
    return [[g.qx + t0 * g.ux, g.qy + t0 * g.uy], [g.qx + t1 * g.ux, g.qy + t1 * g.uy]];
  }
  const pts = (poly) => poly.map((v) => v[0].toFixed(2) + ',' + v[1].toFixed(2)).join(' ');

  U.registerPack({
    id: 'symmetry', version: 1,
    types: {
      fold: {
        essence: ['E10', 'E5'],
        label: '折纸', prefix: '折', group: '图形', grades: [3, 8], alias: ['对称', '对折', '折痕', '对称轴', '重合', '镜像', '对角线'],
        props: {
          w: { type: 'int', label: '纸宽（格）', default: 4, min: 2, max: 10, step: 1 },
          ht: { type: 'int', label: '纸高（格）', default: 4, min: 2, max: 10, step: 1 },
          fold: { type: 'choice', label: '折不折', default: 0, choices: ['不折', '折一次'] },
          angle: { type: 'num', label: '折痕方向（度，0=水平，90=竖直）', default: 90, min: 0, max: 179, step: 1 },
          offset: { type: 'num', label: '折痕离中心（格）', default: 0, min: 0, max: 10, step: 1 },
        },
        outputs: { same: { dim: null, kind: 'num', label: '两半重合（1 是 0 否）' }, pairs: { dim: null, kind: 'num', label: '互相对上的点对数' }, f: { dim: null, kind: 'fig', label: '纸片' } },
        icon: () => K.rect(12, 8, 40, 28, { fill: '#f08a1c55', stroke: 'var(--ink)', w: 2 }) + K.line(8, 38, 56, 6, { stroke: '#e5484d', w: 2 }),
        size: () => [300, 280],
        compute: (c) => {
          const p = c.props;
          if (p.fold === 0) {
            c.say('info', '还没折：把「折不折」改成「折一次」');
            return { same: num(0), pairs: num(0), f: U.val('fig', U.Fig.polygon(rectPoly(p))) };
          }
          const g = geom(p), same = coincide(p, g) ? 1 : 0, pairs = pairsOf(p, g);
          c.say(same ? 'ok' : 'info', same ? '两半完全重合' : '对不上：折过去有一块错位' + (pairs ? '，但有 ' + pairs + ' 对点能对上' : ''));
          return { same: num(same), pairs: num(pairs), f: U.val('fig', U.Fig.polygon(rectPoly(p))) };
        },
        badge: (c) => (c.props.fold === 0 ? '未折' : c.out.same && c.out.same.data.n === 1 ? '重合' : '不重合'),
        draw: (c) => {
          // 画布上方留给端口读数，下方留给折后的虚线镜像和说明文字
          const p = c.props, y0 = 84, y1 = c.h - 34;
          const S = Math.max(4, Math.min((c.w - 110) / p.w, (y1 - y0) / p.ht, 28));
          const ox = (c.w - p.w * S) / 2, top = y0 + ((y1 - y0) - p.ht * S) / 2;
          const X = (x) => ox + x * S, Y = (y) => top + (p.ht - y) * S;
          const scr = (poly) => poly.map((v) => [X(v[0]), Y(v[1])]);
          const g = geom(p);
          let svg = '<polygon points="' + pts(scr(rectPoly(p))) + '" fill="#f08a1c33" stroke="var(--ink)" stroke-width="2"/>';
          if (p.fold === 1) {
            // 被折过去的那一半：原来的位置淡淡画，镜像后的位置用虚线画
            const flap = half(rectPoly(p), g, 1);
            if (flap.length > 2) {
              const mir = flap.map((v) => refl(g, v[0], v[1]));
              svg += '<polygon points="' + pts(scr(mir)) + '" fill="#2b8cff22" stroke="#2b8cff" stroke-width="2" stroke-dasharray="6 4"/>';
            }
          }
          const seg = foldSeg(p, g);
          if (seg) {
            const s = scr(seg);
            svg += K.line(s[0][0], s[0][1], s[1][0], s[1][1], { stroke: '#e5484d', w: 2.5, dash: '8 4' });
          } else {
            svg += K.text(c.w / 2, c.h - 30, '折痕在纸外，什么也没折', { size: 12, fill: 'var(--dim)' });
          }
          const same = p.fold === 1 && coincide(p, g);
          const cap = (p.fold === 0 ? '未折' : same ? '两半重合' : '不重合') + '　折痕 ' + p.angle + '°，离中心 ' + p.offset;
          return svg + K.text(c.w / 2, c.h - 10, cap, { size: 12, fill: 'var(--dim)' });
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
