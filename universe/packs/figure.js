/* 器材包 figure：图形作为值在连线上流动（底层见 js/core/figure.js）。
 * 三角形 / 四边形 / 圆 产生图形；变换器把图形平移、旋转、对称、放缩；量一量读出面积和周长；
 * 图形关系判全等与相似。全部精确：坐标是有理数，判定不用浮点。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, F = U.Fig;
  const num = (q, o) => U.val('num', q, Object.assign({ dim: null }, o || {}));
  const fig = (f) => U.val('fig', f, { dim: null });
  const real = (r) => U.val('real', r, { dim: null });
  const C = (lo, hi, d, label) => ({ type: 'int', label, default: d, min: lo, max: hi });
  // 符号精确数里只有有理部分时，转成普通的数（能接进运算器）；否则给近似值
  const realToNum = (r, approx) => (r && r.b.n === 0n && r.p.n === 0n ? num(r.a) : num(Q.fromNumber(+approx.toFixed(6)), { exact: false }));
  const box = (f) => {
    if (!f) return [-10, -10, 10, 10];
    const xs = f.pts.map((p) => Q.num(p.x)), ys = f.pts.map((p) => Q.num(p.y)), r = f.type === 'circle' ? Math.sqrt(Q.num(f.r2)) : 0;
    const m = Math.max(4, ...xs.map((x) => Math.abs(x) + r), ...ys.map((y) => Math.abs(y) + r)) + 1;
    return [-m, -m, m, m];
  };
  const drawFig = (c, f, extra) => '<g transform="translate(6,2)">' + F.svg(f, c.w - 12, c.h - 6, { box: box(f) }) + '</g>' + (extra || '');
  const figOf = (c, port) => { const v = (c.inp[port] || []).find((x) => x && x.kind === 'fig'); return v ? v.data : null; };
  // 多边形产出：图形、面积、周长
  const polyOut = (f) => {
    const a = F.area(f), per = F.perimeter(f);
    return { f: fig(f), area: num(a.a), perim: per.exact ? realToNum(per.real, per.approx) : num(Q.fromNumber(+per.approx.toFixed(6)), { exact: false }) };
  };

  U.registerPack({
    id: 'figure', version: 1,
    types: {
      // ---------------- 三角形 ----------------
      ftri: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E3', 'E5'],
        label: '三角形', prefix: '三角形', group: '图形', grades: [3, 9],
        props: { ax: C(-10, 10, 0, 'A 的 x'), ay: C(-10, 10, 0, 'A 的 y'), bx: C(-10, 10, 4, 'B 的 x'), by: C(-10, 10, 0, 'B 的 y'), cx: C(-10, 10, 0, 'C 的 x'), cy: C(-10, 10, 3, 'C 的 y') },
        outputs: { f: { dim: null, kind: 'fig', label: '图形' }, area: { dim: null, kind: 'num', label: '面积' }, perim: { dim: null, kind: 'num', label: '周长' } },
        icon: () => '<path d="M10 36 L54 36 L10 8 Z" fill="rgba(59,155,255,.15)" stroke="var(--ink)" stroke-width="1.5"/>',
        size: () => [170, 170],
        compute: (c) => polyOut(F.polygon([[c.props.ax, c.props.ay], [c.props.bx, c.props.by], [c.props.cx, c.props.cy]])),
        badge: (c) => (c.out.area ? '面积 ' + U.showVal(c.out.area) : ''),
        draw: (c) => drawFig(c, c.out.f ? c.out.f.data : null),
      },

      // ---------------- 四边形 ----------------
      fquad: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E3', 'E5'],
        label: '四边形', prefix: '四边形', group: '图形', grades: [3, 9],
        props: {
          ax: C(-10, 10, 0, 'A 的 x'), ay: C(-10, 10, 0, 'A 的 y'), bx: C(-10, 10, 4, 'B 的 x'), by: C(-10, 10, 0, 'B 的 y'),
          cx: C(-10, 10, 4, 'C 的 x'), cy: C(-10, 10, 3, 'C 的 y'), dx: C(-10, 10, 0, 'D 的 x'), dy: C(-10, 10, 3, 'D 的 y'),
        },
        outputs: { f: { dim: null, kind: 'fig', label: '图形' }, area: { dim: null, kind: 'num', label: '面积' }, perim: { dim: null, kind: 'num', label: '周长' } },
        icon: () => '<path d="M10 36 L54 36 L54 8 L10 8 Z" fill="rgba(59,155,255,.15)" stroke="var(--ink)" stroke-width="1.5"/>',
        size: () => [170, 170],
        compute: (c) => polyOut(F.polygon([[c.props.ax, c.props.ay], [c.props.bx, c.props.by], [c.props.cx, c.props.cy], [c.props.dx, c.props.dy]])),
        badge: (c) => (c.out.area ? '面积 ' + U.showVal(c.out.area) : ''),
        draw: (c) => drawFig(c, c.out.f ? c.out.f.data : null),
      },

      // ---------------- 圆 ----------------
      fcirc: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E3', 'E7'],
        label: '圆', prefix: '圆', group: '图形', grades: [5, 9],
        props: { cx: C(-10, 10, 0, '圆心 x'), cy: C(-10, 10, 0, '圆心 y'), r: C(1, 10, 2, '半径') },
        outputs: { f: { dim: null, kind: 'fig', label: '图形' }, area: { dim: null, kind: 'real', label: '面积（精确）' }, circum: { dim: null, kind: 'real', label: '周长（精确）' } },
        icon: () => K.circle(32, 22, 14, { stroke: 'var(--ink)' }),
        size: () => [170, 170],
        compute: (c) => {
          const f = F.circle([c.props.cx, c.props.cy], c.props.r * c.props.r);
          return { f: fig(f), area: real(F.area(f)), circum: real(U.Real.pi(Q(2 * c.props.r))) };
        },
        badge: (c) => (c.out.area ? '面积 ' + U.showVal(c.out.area) : ''),
        draw: (c) => drawFig(c, c.out.f ? c.out.f.data : null),
      },

      // ---------------- 变换器 ----------------
      xform: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E5'],
        label: '图形变换', prefix: '变换', group: '图形', grades: [4, 9],
        props: {
          mode: { type: 'choice', label: '怎么变', default: 0, choices: ['平移', '旋转 90°', '旋转 180°', '关于 x 轴对称', '关于 y 轴对称', '以原点放大缩小'] },
          dx: C(-10, 10, 2, '向右移'), dy: C(-10, 10, 1, '向上移'),
          k: C(1, 5, 2, '放大倍数（分子）'), kd: C(1, 5, 1, '放大倍数（分母）'),
        },
        inputs: { f: { kind: 'fig', label: '图形' } },
        outputs: { f: { dim: null, kind: 'fig', label: '变换后' } },
        icon: () => '<path d="M8 34 L24 34 L8 18 Z" fill="none" stroke="var(--ink)" stroke-width="1.5"/><path d="M36 26 L52 26 L36 10 Z" fill="rgba(59,155,255,.2)" stroke="var(--ink)" stroke-width="1.5"/>',
        size: () => [170, 170],
        compute: (c) => {
          const f = figOf(c, 'f'); if (!f) { c.say('info', '接一个图形进来'); return {}; }
          const O = { x: Q(0), y: Q(0) }, p = c.props;
          let g;
          if (p.mode === 0) g = F.translate(f, Q(p.dx), Q(p.dy));
          else if (p.mode === 1) g = F.rotate90(f, O, 1);
          else if (p.mode === 2) g = F.rotate90(f, O, 2);
          else if (p.mode === 3) g = F.reflect(f, O, { x: Q(1), y: Q(0) });
          else if (p.mode === 4) g = F.reflect(f, O, { x: Q(0), y: Q(1) });
          else g = F.scale(f, O, Q(p.k, p.kd));
          return { f: fig(g) };
        },
        draw: (c) => {
          const src = (c.d && c.d.inp && (c.d.inp.f || []).find((x) => x && x.kind === 'fig')) || null;
          const g = c.out.f ? c.out.f.data : null, b = box(g || (src && src.data));
          const bb = src ? box(src.data) : b, m = Math.max(b[2], bb[2]), bx = [-m, -m, m, m];
          return '<g transform="translate(6,2)">' + (src ? F.svg(src.data, c.w - 12, c.h - 6, { box: bx, stroke: 'var(--dim, #999)', fill: 'none' }) : '') +
            (g ? F.svg(g, c.w - 12, c.h - 6, { box: bx, grid: false }) : '') + '</g>';
        },
      },

      // ---------------- 量一量 ----------------
      figmeasure: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E3'],
        label: '量图形', prefix: '量', group: '图形', grades: [3, 9],
        props: {
          digits: { type: 'int', label: '近似值保留几位小数', default: 2, min: 0, max: 6 },
          showWhy: { type: 'bool', label: '显示怎么算的', default: true },
          note: { type: 'text', label: '备注', default: '' },
        },
        inputs: { f: { kind: 'fig', label: '图形' } },
        outputs: {
          area: { dim: null, kind: 'num', label: '面积' }, perim: { dim: null, kind: 'num', label: '周长' },
          n: { dim: null, kind: 'num', label: '顶点数' }, right: { dim: null, kind: 'num', label: '直角个数' },
        },
        icon: () => K.line(8, 34, 56, 34, { w: 2 }) + K.line(8, 30, 8, 38, {}) + K.line(56, 30, 56, 38, {}) + K.text(32, 26, 'cm', { size: 13 }),
        size: () => [170, 130],
        compute: (c) => {
          const f = figOf(c, 'f'); if (!f) { c.say('info', '接一个图形进来'); return {}; }
          const a = F.area(f), per = F.perimeter(f);
          const right = f.type === 'polygon' ? f.pts.filter((_, i) => F.isRight(f, i)).length : 0;
          if (f.type === 'polygon') c.say('info', '面积用“鞋带公式”精确算：各顶点坐标交叉相乘再相减，取一半');
          if (c.step && f.type === 'polygon') {
            const pts = f.pts; let terms = [];
            pts.forEach((pt, i) => { const q = pts[(i + 1) % pts.length]; terms.push(Q.sub(Q.mul(pt.x, q.y), Q.mul(q.x, pt.y))); });
            c.step('鞋带公式每一项（x₁y₂ − x₂y₁）：' + terms.map((t) => Q.show(t)).join('，'), null, 'fig.shoelace');
            c.step('把它们加起来再取一半，面积 = ' + Q.show(a.a !== undefined ? a.a : Q.div(terms.reduce((x, y) => Q.add(x, y), Q(0)), Q(2))), null, 'fig.shoelace');
            c.because('area', '鞋带公式：用坐标求多边形面积', 'fig.shoelace');
          }
          if (!per.exact) c.say('warn', '有的边长是不同的根号，不能精确相加，周长给的是近似值');
          return {
            area: realToNum(a, U.Real.approx(a)),
            perim: per.exact ? realToNum(per.real, per.approx) : num(Q.fromNumber(+per.approx.toFixed(6)), { exact: false }),
            n: num(Q(f.type === 'circle' ? 0 : f.pts.length)), right: num(Q(right)),
          };
        },
        draw: (c) => K.text(c.w / 2, c.h / 2 - 8, '面积 ' + (c.out.area ? U.showVal(c.out.area) : '—'), { size: 14, weight: 700 }) +
          K.text(c.w / 2, c.h / 2 + 14, '周长 ' + (c.out.perim ? U.showVal(c.out.perim) : '—'), { size: 13 }),
      },

      // ---------------- 图形关系 ----------------
      figrel: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E5', 'E1'],
        label: '图形关系', prefix: '关系', group: '图形', grades: [4, 9],
        props: {
          ask: { type: 'choice', label: '看什么', default: 0, choices: ['全等和相似', '只看全等', '只看相似'] },
          showMap: { type: 'bool', label: '显示对应关系', default: true },
          note: { type: 'text', label: '备注', default: '' },
        },
        inputs: { a: { kind: 'fig', label: '图形 甲' }, b: { kind: 'fig', label: '图形 乙' } },
        outputs: { cong: { dim: null, kind: 'bool', label: '全等' }, sim: { dim: null, kind: 'bool', label: '相似' }, k: { dim: null, kind: 'num', label: '相似比（乙:甲）' } },
        icon: () => K.text(32, 30, '≅', { size: 26, weight: 700 }),
        size: () => [170, 120],
        compute: (c) => {
          const a = figOf(c, 'a'), b = figOf(c, 'b'); if (!a || !b) { c.say('info', '接两个图形进来'); return {}; }
          const s = F.similar(a, b), cong = F.congruent(a, b);
          const out = { cong: U.val('bool', cong), sim: U.val('bool', s.ok) };
          if (s.ok) { const r = U.Real.sqrt(s.k2); out.k = r && r.b.n === 0n ? num(r.a) : num(Q.fromNumber(+Math.sqrt(Q.num(s.k2)).toFixed(6)), { exact: false }); }
          c.say(cong ? 'ok' : s.ok ? 'info' : 'warn', cong ? '对应边都相等：全等' : s.ok ? '对应边成同一个比：相似但不全等' : '找不到一种对应关系让各边成比例：不相似');
          return out;
        },
        draw: (c) => K.text(c.w / 2, c.h / 2 - 6, c.out.cong ? (c.out.cong.data ? '全等 ≅' : c.out.sim && c.out.sim.data ? '相似 ∼' : '不相似') : '—', { size: 16, weight: 700 }) +
          (c.out.k ? K.text(c.w / 2, c.h / 2 + 16, '相似比 ' + U.showVal(c.out.k), { size: 12 }) : ''),
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
