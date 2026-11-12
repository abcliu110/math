/* 器材包 curves：函数成为一等公民。一个“函数”值（curve）= y 等于 x 的多项式；它可以来自函数卡、二次函数、代数式、方程，
 * 也可以变回直线，所以交点、代入、预测、散点图这些认直线的器材照样能接。
 *   函数卡（fncard）：写一个函数，例如 x^2 - 4x + 3、2x + 1。
 *   二次函数（fnquad）：y = ax² + bx + c，a、b、c 都能被别的器材驱动（比如扫描变量），同时给出顶点。
 *   函数求值（fnat）：给一个 x，得到 y（精确）。
 *   函数解（fnsolve）：解 f(x) = g(x)（g 不接就是 0，也就是求零点）或不等式 f(x) > g(x)，得到“解集”，可以接解集数轴。
 *   函数图像（fngraph）：同一个坐标系里画最多 4 条函数，标出前两条的交点，拖动“试的 x”看 y。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, P = U.Poly, E = U.Eqn;

  const curveIn = (c, port) => { const v = K.first(c.inp[port]); return v && v.kind === 'curve' ? v.data : null; };
  const fnOf = (cv) => {      // 多项式的浮点求值函数（画图用）
    const ts = cv.p.terms.map((t) => ({ c: Q.num(t.c), k: t.m.x || 0 }));
    return (x) => ts.reduce((s, t) => s + t.c * Math.pow(x, t.k), 0);
  };
  const COLORS = ['var(--accent)', 'var(--good)', 'var(--bad)', 'var(--ink)'];
  const show = (cv) => 'y = ' + P.show(cv.p);

  // 解 f(x) rel g(x)：差 f − g 当成方程 f − g rel 0
  const solveCurves = (f, g, rel) => {
    const lhs = g ? P.sub(f.p, g.p) : f.p;
    return E.solve(E.make(lhs, P.const(Q(0)), rel), 'x');
  };

  U.registerPack({
    id: 'curves', version: 1, needs: ['core@1', 'algebra@1', 'equation@1'],
    types: {
      fncard: {
        workspaceRole: 'none', handles: true, essence: ['E6', 'E10'],
        label: '函数卡', prefix: '函', group: '函数', grades: [7, 9], alias: ['函数', '一次函数', '二次函数', '解析式', 'y=', 'f(x)'],
        lint: { minProps: 2, why: '函数卡只有“函数”和标签两个属性' },
        props: { f: { type: 'text', label: '函数 y =', default: 'x^2 - 4x + 3' }, label: { type: 'text', label: '标签', default: '' } },
        outputs: { f: { dim: null, kind: 'curve', label: '函数' } },
        icon: () => '<path d="M10 14 Q32 58 54 14" fill="none" stroke="var(--accent)" stroke-width="3"/>' + K.text(32, 54, 'f(x)', { size: 12 }),
        size: () => [200, 90],
        compute: (c) => {
          const src = String(c.props.f).replace(/^\s*(y|f\s*\(\s*x\s*\))\s*[=＝]/i, '');
          let p; try { p = P.parse(src); } catch (e) { c.say('info', '函数写不对：' + e.message); return {}; }
          const x = U.Curve.toX(p);
          if (!x) { c.say('info', '函数里只能有一个字母（x）：' + P.vars(p).join('、')); return {}; }
          return { f: U.val('curve', { p: x }) };
        },
        badge: (c) => (c.out.f ? U.showVal(c.out.f) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 8, c.out.f ? U.showVal(c.out.f) : '—', { size: 20, weight: 700, fill: c.out.f ? 'var(--ink)' : 'var(--dim)' }),
      },

      fnquad: {
        workspaceRole: 'none', handles: true, essence: ['E10'],
        label: '二次函数', prefix: '二', group: '函数', grades: [9, 9], alias: ['抛物线', '顶点', 'ax²+bx+c', '开口', '对称轴'],
        props: {
          a: { type: 'rat', label: 'a（x² 前）', default: 1, min: -1000, max: 1000 },
          b: { type: 'rat', label: 'b（x 前）', default: -4, min: -1000, max: 1000 },
          c: { type: 'rat', label: 'c（常数）', default: 3, min: -1000, max: 1000 },
          label: { type: 'text', label: '标签', default: '' },
        },
        outputs: { f: { dim: null, kind: 'curve', label: '函数' }, vx: { dim: null, kind: 'num', label: '顶点x' }, vy: { dim: null, kind: 'num', label: '顶点y' } },
        icon: () => '<path d="M10 12 Q32 56 54 12" fill="none" stroke="var(--accent)" stroke-width="3"/>' + K.circle(32, 34, 3.5, { fill: 'var(--good)' }),
        size: () => [250, 120],
        compute: (c) => {
          let a, b, cc; try { a = Q.parse(c.props.a); b = Q.parse(c.props.b); cc = Q.parse(c.props.c); } catch (e) { c.say('reject', 'a、b、c 要填有理数'); return {}; }
          if (a.n === 0n) { c.say('info', 'a = 0 时不是二次函数（是一次函数 y = ' + Q.show(b) + 'x + ' + Q.show(cc) + '）'); }
          const p = P.norm([{ c: a, m: { x: 2 } }, { c: b, m: { x: 1 } }, { c: cc, m: {} }]);
          const out = { f: U.val('curve', { p }) };
          if (a.n !== 0n) {
            const vx = Q.neg(Q.div(b, Q.mul(Q(2), a)));
            out.vx = U.val('num', vx); out.vy = U.val('num', P.evalQ(p, { x: vx }));
          }
          return out;
        },
        badge: (c) => (c.out.vx ? '顶点 (' + U.showVal(c.out.vx) + ', ' + U.showVal(c.out.vy) + ')' : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 - 2, c.out.f ? U.showVal(c.out.f) : '—', { size: 18, weight: 700 }) +
          K.text(c.w / 2, c.h / 2 + 24, c.out.vx ? '顶点 (' + U.showVal(c.out.vx) + ', ' + U.showVal(c.out.vy) + ')' : '不是二次函数', { size: 13, fill: 'var(--dim)' }),
      },

      fnat: {
        workspaceRole: 'none', handles: true, essence: ['E6'],
        label: '函数求值', prefix: '值', group: '函数', grades: [7, 9], alias: ['代入', 'f(a)', '函数值'],
        lint: { minProps: 1, why: '函数求值只有标签一个属性' },
        props: { label: { type: 'text', label: '标签', default: '' } },
        inputs: { f: { kind: 'curve', label: '函数' }, x: { kind: 'num', label: 'x' } },
        outputs: { y: { dim: null, kind: 'num', label: 'y' } },
        icon: () => K.text(32, 30, 'f(a)', { size: 20, weight: 700 }),
        size: () => [170, 100],
        compute: (c) => {
          const f = curveIn(c, 'f'), x = K.first(c.inp.x);
          if (!f || !x) { c.say('info', '接一个函数和一个 x'); return {}; }
          return { y: U.val('num', P.evalQ(f.p, { x: x.data }), x.exact === false ? { exact: false } : {}) };
        },
        badge: (c) => (c.out.y ? U.showVal(c.out.y) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 8, c.out.y ? 'y = ' + U.showVal(c.out.y) : '—', { size: 24, weight: 700 }),
      },

      fnsolve: {
        workspaceRole: 'none', handles: true, essence: ['E6', 'E8'],
        label: '函数解', prefix: '解', group: '函数', grades: [8, 9], alias: ['零点', '函数与方程', '函数与不等式', '交点的横坐标', 'f(x)=g(x)'],
        props: {
          rel: { type: 'choice', label: '关系', default: 0, choices: ['f = g', 'f < g', 'f > g', 'f ≤ g', 'f ≥ g'] },
          label: { type: 'text', label: '标签', default: '' },
        },
        lint: { minProps: 2, why: '函数解只有“关系”和标签两个属性' },
        inputs: { f: { kind: 'curve', label: 'f' }, g: { kind: 'curve', label: 'g(可选)' } },
        outputs: { set: { dim: null, kind: 'solset', label: '解集' }, n: { dim: null, kind: 'num', label: '解的个数' } },
        icon: () => K.text(32, 30, 'f=g', { size: 22, weight: 700 }),
        size: () => [250, 120],
        compute: (c) => {
          const f = curveIn(c, 'f'), g = curveIn(c, 'g');
          if (!f) { c.say('info', '接一个函数（再接第二个，就解 f = g；不接就是求零点）'); return {}; }
          const rel = ['=', '<', '>', '≤', '≥'][c.props.rel];
          const r = solveCurves(f, g, rel);
          if (r.kind === 'error') { c.say('info', r.why); return {}; }
          c.say('ok', U.Solset.show(r.set));
          const S = r.set, n = S.items ? S.items.length : S.none ? 0 : null;
          const out = { set: U.val('solset', S) };
          if (n !== null) out.n = U.val('num', Q(n));
          return out;
        },
        badge: (c) => (c.out.set ? U.showVal(c.out.set) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 8, c.out.set ? U.showVal(c.out.set) : '—', { size: 18, weight: 700, fill: c.out.set ? 'var(--ink)' : 'var(--dim)' }),
      },

      fngraph: {
        workspaceRole: 'none', handles: true, essence: ['E6', 'E2'],
        label: '函数图像', prefix: '图', group: '函数', grades: [7, 9], alias: ['画图', '图像', '坐标系', '交点', '抛物线', '直线'],
        props: {
          xlo: { type: 'rat', label: 'x 从', default: -5, min: -1000, max: 1000 },
          xhi: { type: 'rat', label: 'x 到', default: 5, min: -1000, max: 1000 },
          probe: { type: 'rat', label: '试的 x', default: 1, min: -1000, max: 1000 },
          label: { type: 'text', label: '标签', default: '' },
        },
        inputs: { f: { kind: 'curve', many: true, label: '函数' } },
        outputs: { y: { dim: null, kind: 'num', label: 'y' }, n: { dim: null, kind: 'num', label: '交点数' } },
        icon: () => K.line(10, 32, 54, 32, { w: 1.5 }) + K.line(32, 8, 32, 56, { w: 1.5 }) + '<path d="M12 50 Q32 -6 52 50" fill="none" stroke="var(--accent)" stroke-width="2.5"/>',
        size: () => [340, 250],
        compute: (c) => {
          const fs = (c.inp.f || []).filter((v) => v && v.kind === 'curve').map((v) => v.data);
          if (!fs.length) { c.say('info', '接一个或几个函数'); return {}; }
          let lo, hi, px; try { lo = Q.parse(c.props.xlo); hi = Q.parse(c.props.xhi); px = Q.parse(c.props.probe); } catch (e) { c.say('reject', '范围要填有理数'); return {}; }
          if (Q.cmp(lo, hi) >= 0) { c.say('reject', '“x 从”要小于“x 到”'); return {}; }
          const out = { y: U.val('num', P.evalQ(fs[0].p, { x: px })) };
          if (fs.length >= 2) {
            const r = solveCurves(fs[0], fs[1], '=');
            if (r.kind === 'ok') { const S = r.set; out.n = U.val('num', Q(S.items ? S.items.length : S.none ? 0 : 0)); c.say('ok', '交点的 x：' + U.Solset.show(r.set)); }
          }
          return out;
        },
        badge: (c) => (c.out.n ? c.out.n.data.n + ' 个交点' : ''),
        // 画法：x、y 两个方向用同一个长度单位（1 个单位在横、竖方向一样长），所以抛物线不会被拉扁，斜率 1 的直线正好 45°。
        // “x 从 / 到”是至少要看到的范围；卡片比这个范围宽或高时，两边对称地多画一些。
        draw: (c) => {
          const fs = (((c.d && c.d.inp) || {}).f || []).filter((v) => v && v.kind === 'curve').map((v) => v.data);
          const ux0 = Q.num(Q.parse(c.props.xlo)), ux1 = Q.num(Q.parse(c.props.xhi)), px = Q.num(Q.parse(c.props.probe));
          const L = 34, R = c.w - 14, T = 16, B = c.h - 26, N = 160, W = R - L, H = B - T;
          if (!fs.length) return K.text(c.w / 2, c.h / 2, '接函数', { fill: 'var(--dim)' });
          const fns = fs.slice(0, 4).map(fnOf);
          // 1. 先在用户给的 x 范围里看 y 的范围，取能同时放下 x 范围和 y 范围的最大单位长度
          let ya = Infinity, yb = -Infinity;
          for (const f of fns) for (let i = 0; i <= N; i++) { const y = f(ux0 + (ux1 - ux0) * i / N); if (Math.abs(y) <= 100) { ya = Math.min(ya, y); yb = Math.max(yb, y); } }
          if (!isFinite(ya)) { ya = -1; yb = 1; }
          ya = Math.min(ya, 0); yb = Math.max(yb, 0);
          const yr = (yb - ya) * 1.1 || 2, scale = Math.min(W / (ux1 - ux0), H / yr);   // 每个单位多少像素
          // 2. 按这个单位，把 x、y 的可见范围各自对称地补满卡片
          const xc = (ux0 + ux1) / 2, yc = (ya + yb) / 2;
          const x0 = xc - W / scale / 2, x1 = xc + W / scale / 2, y0 = yc - H / scale / 2, y1 = yc + H / scale / 2;
          const sx = (x) => L + (x - x0) * scale, sy = (y) => B - (y - y0) * scale;
          const fmt = (v) => (Math.round(v * 100) / 100).toString().replace('-', '−');
          // 刻度间隔：1、2、5 × 10 的几次方，让相邻刻度至少隔 30 像素
          let step = 1; const mag = Math.pow(10, Math.floor(Math.log10(30 / scale)));
          for (const m of [1, 2, 5, 10]) { step = m * mag; if (step * scale >= 30) break; }
          let s = '';
          for (let gx = Math.ceil(x0 / step) * step; gx <= x1 + 1e-9; gx += step) s += K.line(sx(gx), T, sx(gx), B, { w: 1, stroke: 'var(--sel-bg)' });
          for (let gy = Math.ceil(y0 / step) * step; gy <= y1 + 1e-9; gy += step) s += K.line(L, sy(gy), R, sy(gy), { w: 1, stroke: 'var(--sel-bg)' });
          const ax = Math.max(L, Math.min(R, sx(0))), ay = Math.max(T, Math.min(B, sy(0)));   // 坐标轴：0 不在范围里就贴边
          s += K.line(L, ay, R, ay, { w: 1.5 }) + K.line(ax, T, ax, B, { w: 1.5 });
          for (let gx = Math.ceil(x0 / step) * step; gx <= x1 + 1e-9; gx += step) if (Math.abs(gx) > 1e-9) s += K.text(sx(gx), Math.min(B + 12, ay + 12), fmt(gx), { size: 10, fill: 'var(--dim)' });
          for (let gy = Math.ceil(y0 / step) * step; gy <= y1 + 1e-9; gy += step) if (Math.abs(gy) > 1e-9) s += K.text(ax - 4, sy(gy) + 3, fmt(gy), { size: 10, fill: 'var(--dim)', anchor: 'end' });
          s += K.text(R - 2, ay - 4, 'x', { size: 11, anchor: 'end' }) + K.text(ax + 6, T + 9, 'y', { size: 11, anchor: 'start' });
          // 曲线：超出画面的点断开
          fns.forEach((f, i) => {
            let d = '', pen = false;
            for (let k = 0; k <= N * 2; k++) {
              const x = x0 + (x1 - x0) * k / (N * 2), y = f(x);
              if (y < y0 - 1 || y > y1 + 1) { pen = false; continue; }
              d += (pen ? 'L' : 'M') + sx(x).toFixed(1) + ' ' + sy(y).toFixed(1); pen = true;
            }
            s += '<path d="' + d + '" fill="none" stroke="' + COLORS[i] + '" stroke-width="2.5"/>';
          });
          // 前两条的交点
          if (fs.length >= 2) {
            const r = solveCurves(fs[0], fs[1], '=');
            if (r.kind === 'ok' && r.set.items) for (const it of r.set.items) {
              const x = U.Real.approx(it), y = fns[0](x);
              if (x >= x0 && x <= x1 && y >= y0 && y <= y1) s += K.circle(sx(x), sy(y), 5, { fill: 'var(--card)', stroke: 'var(--ink)', w: 2 });
            }
          }
          // 试的 x：竖线加第一条曲线上的点
          if (px >= x0 && px <= x1) {
            const y = fns[0](px);
            s += K.line(sx(px), T, sx(px), B, { w: 1, stroke: 'var(--dim)' });
            if (y >= y0 && y <= y1) s += K.circle(sx(px), sy(y), 4, { fill: COLORS[0] }) + K.text(sx(px) + 6, sy(y) - 6, '(' + fmt(px) + ', ' + fmt(y) + ')', { size: 11, anchor: 'start' });
          }
          // 图例
          fs.slice(0, 4).forEach((f, i) => { s += K.text(L + 50, T + 12 + i * 14, show(f), { size: 11, anchor: 'start', fill: COLORS[i] }); });
          s += K.text(c.w - 14, c.h - 6, '1 格 = ' + fmt(step) + '（横竖一样长）', { size: 10, anchor: 'end', fill: 'var(--dim)' });
          return s;
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
