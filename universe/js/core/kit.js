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
    // 点的标记形状（V10，2.6b）：不同的器材用不同形状，只靠颜色区分不开的学生也能分。
    // shape：circle、square、triangle、tdown（倒三角）、diamond、cross、star。o: { fill, stroke, w, extra（额外的 SVG 属性，比如点选、拖动） }
    mark(x, y, shape, r, o) {
      o = o || {};
      const fill = o.fill || 'none', st = o.stroke || (o.fill ? 'none' : 'var(--ink)'), sw = o.w || 1.5;
      const ex = (o.extra || '') + ' data-shape="' + shape + '"';
      const att = ' fill="' + fill + '" stroke="' + st + '" stroke-width="' + sw + '"';
      const f1 = (v) => v.toFixed(1);
      const poly = (ps) => '<polygon points="' + ps.map((p) => f1(p[0]) + ',' + f1(p[1])).join(' ') + '"' + att + ex + '/>';
      if (shape === 'square') return '<rect x="' + f1(x - r) + '" y="' + f1(y - r) + '" width="' + f1(2 * r) + '" height="' + f1(2 * r) + '"' + att + ex + '/>';
      if (shape === 'triangle') return poly([[x, y - 1.2 * r], [x + 1.1 * r, y + 0.8 * r], [x - 1.1 * r, y + 0.8 * r]]);
      if (shape === 'tdown') return poly([[x, y + 1.2 * r], [x + 1.1 * r, y - 0.8 * r], [x - 1.1 * r, y - 0.8 * r]]);
      if (shape === 'diamond') return poly([[x, y - 1.3 * r], [x + 1.3 * r, y], [x, y + 1.3 * r], [x - 1.3 * r, y]]);
      if (shape === 'cross') return '<path d="M' + f1(x - r) + ' ' + f1(y) + 'L' + f1(x + r) + ' ' + f1(y) + 'M' + f1(x) + ' ' + f1(y - r) + 'L' + f1(x) + ' ' + f1(y + r) + '" fill="none" stroke="' + (o.fill || st) + '" stroke-width="' + f1(sw + 0.5) + '"' + ex + '/>';
      if (shape === 'star') {
        const ps = [];
        for (let k = 0; k < 10; k++) { const rr = k % 2 ? 0.5 * r : 1.3 * r, a = -Math.PI / 2 + k * Math.PI / 5; ps.push([x + rr * Math.cos(a), y + rr * Math.sin(a)]); }
        return poly(ps);
      }
      return '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + f1(r) + '"' + att + ex + '/>';
    },
    // 填充纹理（V10，2.6b）：多边形可以选斜线（hatch）或点阵（dots），和颜色一起区分。纹理的图案按颜色生成，id 带颜色。
    // texDefs(colors) 返回所有 <pattern> 定义（每个工作区的 svg 都放一份，id 相同、内容相同，重复也无妨）；texFill(f, c) 是填充属性
    texDefs(colors) {
      return '<defs>' + colors.map((c) => {
        const id = String(c).replace(/[^0-9a-zA-Z]/g, '');
        return '<pattern id="tex-hatch-' + id + '" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="' + c + '" stroke-width="2"/></pattern>' +
          '<pattern id="tex-dots-' + id + '" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.6" fill="' + c + '"/></pattern>';
      }).join('') + '</defs>';
    },
    texFill(f, c) {
      if (!f || !f.tex) return c + '22';
      return 'url(#tex-' + (f.tex === 'dots' ? 'dots' : 'hatch') + '-' + String(c).replace(/[^0-9a-zA-Z]/g, '') + ')';
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
