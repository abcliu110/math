/* 器材包的小工具：画图用的 SVG 片段、取输入值。纯字符串，node 和浏览器通用。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const kit = {
    esc,
    // 文字。o: {size, anchor, fill, weight, family}
    text(x, y, s, o) {
      o = o || {};
      return '<text x="' + x + '" y="' + y + '" font-size="' + (o.size || 12) + '" text-anchor="' + (o.anchor || 'middle') + '" fill="' + (o.fill || 'var(--ink)') + '"' +
        (o.weight ? ' font-weight="' + o.weight + '"' : '') + ' font-family="' + (o.family || 'var(--font)') + '">' + esc(s) + '</text>';
    },
    line(x1, y1, x2, y2, o) {
      o = o || {};
      return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (o.stroke || 'var(--ink)') + '" stroke-width="' + (o.w || 1.5) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + ' stroke-linecap="round"/>';
    },
    rect(x, y, w, h, o) {
      o = o || {};
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (o.r === undefined ? 4 : o.r) + '" fill="' + (o.fill || 'none') + '" stroke="' + (o.stroke || 'none') + '" stroke-width="' + (o.w || 1.5) + '"/>';
    },
    circle(x, y, r, o) {
      o = o || {};
      return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (o.fill || 'none') + '" stroke="' + (o.stroke || 'none') + '" stroke-width="' + (o.w || 1.5) + '"/>';
    },
    // 分数的竖排画法：分子 / 横线 / 分母
    frac(x, y, q, size, fill) {
      size = size || 22; fill = fill || 'var(--ink)';
      const neg = q.n < 0n, n = neg ? -q.n : q.n;
      if (q.d === 1n) return kit.text(x, y + size * 0.35, (neg ? '−' : '') + n, { size, fill, weight: 700 });
      const w = Math.max(String(n).length, String(q.d).length) * size * 0.55 + 6;
      return (neg ? kit.text(x - w / 2 - 8, y + size * 0.2, '−', { size, fill, weight: 700 }) : '') +
        kit.text(x, y - 3, n, { size: size * 0.8, fill, weight: 700 }) +
        kit.line(x - w / 2, y + 1, x + w / 2, y + 1, { stroke: fill, w: 2 }) +
        kit.text(x, y + size * 0.8 + 2, q.d, { size: size * 0.8, fill, weight: 700 });
    },
    nums: (arr) => (arr || []).filter((v) => v && v.kind === 'num'),
    first: (arr) => (arr || []).find((v) => v) || null,
    sum(vals) {
      let s = Q(0), dim = null;
      for (const v of vals) {
        const r = U.Dim.add(dim, v.dim);
        if (!r.ok) return { bad: [dim, v.dim] };
        dim = r.dim; s = Q.add(s, v.data);
      }
      return { q: s, dim };
    },
    showForm(q, form, digits) {
      if (form === 1) return Q.showMixed(q);
      if (form === 2) return Q.showDec(q, digits === undefined ? 3 : digits);
      return Q.show(q);
    },
  };
  U.kit = kit;
})(typeof globalThis !== 'undefined' ? globalThis : window);
