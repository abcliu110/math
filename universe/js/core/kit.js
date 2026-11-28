/* 器材包的小工具：画图用的 SVG 片段、取输入值。纯字符串，node 和浏览器通用。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const kit = {
    esc,
    // 联动组里刚改的地方闪一下（界面给 draw 的 c.flash = { s0, s1, step, age }，见 js/ui/stage-forms.js）：把这一块包起来，
    // CSS 动画（css/universe.css 的 .flash）1 秒左右淡出；age 是这一步过了多少毫秒，重画时用负的延迟接着上次的进度，不会重新闪。没有 fl 就什么都不画
    flash: (fl, inner) => (fl && inner ? '<g class="flash" data-flash="1" style="animation-delay:-' + Math.round(fl.age || 0) + 'ms">' + inner + '</g>' : ''),
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
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (o.r === undefined ? 4 : o.r) + '" fill="' + (o.fill || 'none') + '" stroke="' + (o.stroke || 'none') + '" stroke-width="' + (o.w || 1.5) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>';
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
  // 研究台共用的两块：研究本（做成的、证明做不到的，一条一条记下来）和追问（题目给的选择题，选了当场说对不对）。
  //   研究本 items：[{ say, no }]，no 是“证明做不到”（画红）。追问 ask：'题干|选项|*对的选项~题干|…'，pick：'2,0'（每题选了第几个，0 没选）。
  //   canAsk 为假时选项点不动（要先做一做）。所有画法返回 SVG 字符串；高度和画法用同一套算法。
  const tw = (s) => [...String(s)].reduce((a, c) => a + (/[\x00-\xff]/.test(c) ? 7 : 12.5), 0);
  const rbtn = (x, y, w, label, patch, enabled, tip, on) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + esc(tip) + '</title>' +
    kit.rect(x, y, w, 26, { fill: on ? '#dcebfb' : enabled ? '#fff' : '#f1f3f6', stroke: enabled || on ? 'var(--blue)' : '#b8c0cc', r: 7, w: on ? 2.2 : 1.4 }) + kit.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled || on ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const chipRows = (items) => { const rows = [[]]; let x = 0; items.forEach((it) => { const w = tw(it.say) + 18; if (x + w > 640 && rows[rows.length - 1].length) { rows.push([]); x = 0; } rows[rows.length - 1].push([it, x, w]); x += w + 6; }); return rows; };
  const askRow = (a) => a.opts.reduce((s, o) => s + tw(o) + 30, 0) < 600;
  kit.research = {
    tw, btn: rbtn,
    parseAsk(ask, pick, canAsk) {
      const picks = String(pick || '').split(',').map((x) => Math.max(0, Math.min(9, Math.round(+x) || 0)));
      return String(ask || '').split('~').filter(Boolean).slice(0, 2).map((s, i) => {
        const a = s.split('|'), opts = a.slice(1).map((o) => o.replace(/^\*/, ''));
        return { q: a[0], opts, right: a.slice(1).findIndex((o) => o[0] === '*') + 1, pick: canAsk ? Math.min(picks[i] || 0, opts.length) : 0 };
      });
    },
    bookH: (items) => (items.length ? 24 + chipRows(items).length * 30 : 0),
    drawBook(y, items, title) {
      if (!items.length) return '';
      let s = kit.text(20, y + 4, '📒 ' + (title || '研究本'), { size: 12, weight: 700, anchor: 'start' });
      chipRows(items).forEach((row, r) => row.forEach(([it, x, w]) => {
        const yy = y + 14 + r * 30;
        s += kit.rect(20 + x, yy, w, 24, { fill: it.no ? '#fde3dc' : '#e3f4e6', stroke: it.no ? '#c0392b' : '#4c9a5b', r: 6, w: 1 }) + kit.text(20 + x + w / 2, yy + 16, it.say, { size: 12 });
      }));
      return s;
    },
    asksH: (asks) => asks.reduce((y, a) => y + 24 + (askRow(a) ? 32 : a.opts.length * 30) + 10, 0),
    // key：选了第几个写进哪个属性（默认 pick；记录仪用 rcpick，免得和操作台自己的追问撞名）
    drawAsks(y, asks, canAsk, key) {
      let s = '';
      asks.forEach((a, qi) => {
        const qx = 20 + tw('❓ ' + a.q) + 16;
        s += kit.text(20, y + 16, '❓ ' + a.q, { size: 13, weight: 700, anchor: 'start' });
        if (!canAsk) s += kit.text(qx, y + 16, '（先做一做，再回答）', { size: 12, anchor: 'start', fill: '#8a93a3' });
        else if (a.pick) s += kit.text(qx, y + 16, a.pick === a.right ? '✓ 对' : '再想想', { size: 12, weight: 700, anchor: 'start', fill: a.pick === a.right ? '#2f7d3a' : '#c0392b' });
        y += 24;
        const row = askRow(a), pk = (o) => { const P = asks.map((b) => b.pick); P[qi] = o; return { [key || 'pick']: P.join(',') }; };
        let x = 36;
        a.opts.forEach((o, oi) => {
          const w = row ? tw(o) + 24 : 560;
          s += rbtn(x, y, w, o, pk(oi + 1), canAsk, o, a.pick === oi + 1);
          if (row) x += w + 6; else y += 30;
        });
        y += (row ? 32 : 0) + 10;
      });
      return s;
    },
    // 竖轴刻度的间隔：跨度大时刻度稀一点（60 以内和以前一样）
    tick: (span) => (span <= 12 ? 1 : span <= 24 ? 2 : span <= 60 ? 5 : span <= 120 ? 10 : span <= 240 ? 20 : span <= 600 ? 50 : 100),
    // “记下来”的图（docs/knob-graph-and-gallery.md 第一节）：一个框、标题、格子、刻度和两条轴。
    //   o：{ fx, fy, fw, fh 框的位置和大小, xa, xb 横轴范围, ya, yb 竖轴范围, title, bottom 框底下留多高（默认 42） }
    //   返回 { s, X(x), Y(y), X0, X1, Y0, Y1, xs, ys }，各台自己在上面画点。
    plot(o) {
      const X0 = o.fx + 50, X1 = o.fx + o.fw - 22, Y0 = o.fy + 48, Y1 = o.fy + o.fh - (o.bottom === undefined ? 42 : o.bottom);
      const xspan = Math.max(1, o.xb - o.xa), yspan = Math.max(1, o.yb - o.ya), xs = (X1 - X0) / xspan, ys = (Y1 - Y0) / yspan;
      const X = (x) => X0 + (x - o.xa) * xs, Y = (y) => Y1 - (y - o.ya) * ys;
      let s = kit.rect(o.fx, o.fy, o.fw, o.fh, { fill: '#fbfcfe', stroke: '#c9d3e3', r: 8, w: 1 });
      s += kit.text(o.fx + 10, o.fy + 18, o.title || '', { size: 12, weight: 700, anchor: 'start' });
      const tx = xspan <= 24 ? 1 : xspan <= 48 ? 2 : xspan <= 120 ? 5 : xspan <= 240 ? 10 : 20, ty = kit.research.tick(yspan);
      for (let x = Math.ceil(o.xa / tx) * tx; x <= o.xb; x += tx) s += kit.line(X(x), Y0, X(x), Y1, { w: 0.6, stroke: '#e1e6ef' }) + kit.text(X(x), Y1 + 13, String(x).replace('-', '−'), { size: 9, fill: '#5f6773' });
      for (let y = Math.ceil(o.ya / ty) * ty; y <= o.yb; y += ty) s += kit.line(X0, Y(y), X1, Y(y), { w: 0.6, stroke: '#e1e6ef' }) + kit.text(X0 - 8, Y(y) + 3, String(y), { size: 9, anchor: 'end', fill: '#5f6773' });
      s += kit.line(X0, Y1, X1, Y1, { w: 1.2 }) + kit.line(X0, Y0, X0, Y1, { w: 1.2 });
      return { s, X, Y, X0, X1, Y0, Y1, xs, ys };
    },
  };
  // 大数也画得下（试验台增强 7，2026-11-27，docs/instrument-design.md 的“台的尺寸和比例”）：各台共用的三种办法
  //   自动缩放：格子 / 单位长度跟着数变小，但可点的东西不小于 MIN_HIT 像素，拖动时按 grain 取整（每一步至少 GRAIN_PX 像素，好拖）；
  //   换单位：  刻度按 nice 取 1、2、5、10、20、50……一格，图上写“一格 = 10”（unitNote）；
  //   折叠：    中间重复的画成“……”，写出省略了几个（fold 给出要画哪几个，null 是省略号那一格）。
  //   CARD_MAX：操作台卡片最大多宽、多高（数再大，卡片也不超过它；tests/run.js 逐台检查）。
  const LADDER = [1, 2, 5];
  const nice = (x) => { if (!(x > 0)) return 1; let p = 1; while (p * 10 <= x) p *= 10; while (p > x) p /= 10; for (;;) { for (const k of LADDER) if (k * p >= x - 1e-9) return k * p; p *= 10; } };
  kit.big = {
    MIN_HIT: 14, GRAIN_PX: 4, CARD_MAX: [960, 760],
    nice,
    // 拖动时取整的步长：1、2、5、10……里最小的、一步至少 px 像素的（unit 是 1 在图上多少像素）
    grain: (unit, px) => (unit > 0 ? Math.max(1, nice((px || 4) / unit)) : 1),
    snap: (v, g) => Math.round(v / g) * g,
    // 一共 n 个，最多画 max 个：前 head 个、“……”、后 tail 个。返回下标数组，null 是省略号；omitted 是省略了几个
    fold: (n, max, head, tail) => {
      if (n <= max) return { idx: Array.from({ length: n }, (_, i) => i), omitted: 0 };
      const h = head === undefined ? Math.ceil((max - 1) / 2) : head, t = tail === undefined ? max - 1 - h : tail, idx = [];
      for (let i = 0; i < h; i++) idx.push(i);
      idx.push(null);
      for (let i = n - t; i < n; i++) idx.push(i);
      return { idx, omitted: n - h - t };
    },
    // 按真实比例分一段长度：vals 各占 total 的多少，太短的保留 min（从长的里面匀出来）。返回每段的像素长度，加起来是 total（都放不下 min 时每段 min）
    prop: (vals, total, min) => {
      const n = vals.length, out = new Array(n).fill(0), fixed = new Array(n).fill(false);
      if (n * min >= total) return out.fill(min);
      for (let pass = 0; pass < n; pass++) {
        const room = total - fixed.reduce((s, f) => s + (f ? min : 0), 0), sum = vals.reduce((s, v, i) => s + (fixed[i] ? 0 : Math.max(0, v)), 0);
        let again = false;
        vals.forEach((v, i) => { if (fixed[i]) { out[i] = min; return; } out[i] = sum > 0 ? room * Math.max(0, v) / sum : room / n; if (out[i] < min) { fixed[i] = true; again = true; } });
        if (!again) break;
      }
      return out.map((w, i) => (fixed[i] ? min : w));
    },
    // 图上写“一格 = 10”这类说明（右对齐在 x 处）
    unitNote: (x, y, text, anchor) => '<g data-unit-note="1">' + kit.text(x, y, text, { size: 11, weight: 700, anchor: anchor || 'end', fill: '#7a4fb3' }) + '</g>',
  };
  U.kit = kit;
})(typeof globalThis !== 'undefined' ? globalThis : window);
