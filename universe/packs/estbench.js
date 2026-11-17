/* 器材包 estbench：估一估。
 *   - 凑整估算：每个数画在一小段数轴上，两端是它前后的整十（整百、整数、0.1……）。点一端，这个数就“看成”那一端；
 *     旁边写着离两端各有多远。两个数都选好了，估计值就算出来；再点“算一算”，揭开准确值，写出差多少（百分之几）。
 *     47 + 38 都往小里看（40 + 30 = 70）会差很多——都看得见。
 *   - 夹出范围：半径 r 的圆，画在外面的大正方形（面积 (2r)²）和里面的小正方形（面积 2r²）之间。在数轴上拖“最少”“最多”两个把手，
 *     定一个范围；点“揭开”，看圆的面积（按 π ≈ 3.14）落没落在里面、范围的中点差多少。
 * 这一版的边界（如实写）：凑整只做两个数的 + − ×；夹范围只有圆一种图。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const qv = (q) => U.val('num', q, { dim: null });
  const W = 700;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? +v : lo));
  const MODES = ['凑整估算', '夹出范围'], OPS = ['+', '−', '×'];
  const rq = (s) => { try { return Q.parse(String(s)); } catch (e) { return Q(0); } };
  const show = (q) => { const v = Q.num(q); return String(Math.round(v * 10000) / 10000); };
  const ap = (op, a, b) => (op === 0 ? Q.add(a, b) : op === 1 ? Q.sub(a, b) : Q.mul(a, b));
  // x 落在 [lo, hi]：lo、hi 是 unit 的倍数
  function ends(x, unit) { const lo = Q.mul(Q(Math.floor(Q.num(Q.div(x, unit)) + 1e-9)), unit); return [lo, Q.add(lo, unit)]; }
  function model(p) {
    const mode = clamp(Math.round(p.mode), 0, 1);
    if (mode === 0) {
      const op = clamp(Math.round(p.op), 0, 2), xs = [rq(p.a), rq(p.b)], us = [rq(p.ua || 10), rq(p.ub || 10)], pick = [Math.round(clamp(p.pa, 0, 2)), Math.round(clamp(p.pb, 0, 2))];
      const nums = xs.map((x, i) => { const [lo, hi] = ends(x, us[i]); return { x, lo, hi, dl: Q.sub(x, lo), dh: Q.sub(hi, x), pick: pick[i], as: pick[i] === 1 ? lo : pick[i] === 2 ? hi : null }; });
      const both = nums.every((n) => n.as !== null), est = both ? ap(op, nums[0].as, nums[1].as) : null, exact = ap(op, xs[0], xs[1]);
      const shown = !!p.reveal && both, pct = shown && Q.num(exact) !== 0 ? Math.round(Math.abs(Q.num(est) - Q.num(exact)) / Math.abs(Q.num(exact)) * 1000) / 10 : null;
      const nearest = nums.every((n) => n.as !== null && Q.num(n.pick === 1 ? n.dl : n.dh) <= Q.num(n.pick === 1 ? n.dh : n.dl));
      return { mode, op, nums, both, est, exact, shown, pct, nearest };
    }
    const r = clamp(Math.round(p.r), 1, 10), outer = 4 * r * r, inner = 2 * r * r, top = Math.ceil(outer * 1.2 / 10) * 10;
    const lo = clamp(Math.round(p.lo), 0, top), hi = clamp(Math.round(p.hi), 0, top), actual = Q.mul(Q(314, 100), Q(r * r));
    const a = Math.min(lo, hi), b = Math.max(lo, hi), inr = Q.num(actual) >= a && Q.num(actual) <= b, mid = (a + b) / 2, pct = Math.round(Math.abs(mid - Q.num(actual)) / Q.num(actual) * 1000) / 10;
    return { mode, r, outer, inner, top, lo: a, hi: b, actual, inr, mid, pct, shown: !!p.reveal };
  }
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const pickG = (patch, tip, inner) => '<g data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"><title>' + K.esc(tip) + '</title>' + inner + '</g>';
  const LX0 = 300, LX1 = 640, BX0 = 60, BX1 = 640, BY = 250;
  const bx = (m, v) => BX0 + (BX1 - BX0) * v / m.top;
  function grips(c) {
    const m = model(c.props); if (m.mode !== 1 || m.shown) return [];
    const g = (id, v, tip) => ({ id, x: bx(m, v), y: BY, r: 10, cursor: 'ew-resize', tip, drag: (c0, q) => { const m0 = model(c0.props); return { [id]: Math.max(0, Math.min(m0.top, Math.round((q.x - BX0) / (BX1 - BX0) * m0.top / 5) * 5)) }; }, say: (c1) => { const m1 = model(c1.props); return '范围 ' + m1.lo + ' 到 ' + m1.hi; } });
    return [g('lo', Number(c.props.lo) || 0, '拖：最少是多少'), g('hi', Number(c.props.hi) || 0, '拖：最多是多少')];
  }
  function draw(c) {
    const p = c.props, m = model(p); let s = '';
    if (m.mode === 0) {
      s += K.text(20, 28, show(m.nums[0].x) + ' ' + OPS[m.op] + ' ' + show(m.nums[1].x) + ' 大约是多少？', { size: 17, weight: 700, anchor: 'start' }) + K.text(W - 20, 28, '先不算：点每个数离它近的那一端', { size: 12, anchor: 'end', fill: '#5a6478' });
      m.nums.forEach((n, i) => {
        const y = 86 + i * 80, X = (v) => LX0 + (LX1 - LX0) * Q.num(Q.div(Q.sub(v, n.lo), Q.sub(n.hi, n.lo)));
        s += K.text(30, y + 5, show(n.x) + ' 看成：' + (n.as !== null ? show(n.as) : '？'), { size: 15, weight: 700, anchor: 'start', fill: n.as !== null ? 'var(--blue)' : 'var(--ink)' });
        s += K.line(LX0, y, LX1, y, { w: 2 }) + K.circle(X(n.x), y, 6, { fill: 'var(--bad)' }) + K.text(X(n.x), y - 12, show(n.x), { size: 12, weight: 700, fill: 'var(--bad)' });
        s += K.text((LX0 + X(n.x)) / 2, y + 22, '差 ' + show(n.dl), { size: 11, fill: '#5a6478' }) + K.text((X(n.x) + LX1) / 2, y + 22, '差 ' + show(n.dh), { size: 11, fill: '#5a6478' });
        [[n.lo, 1, LX0], [n.hi, 2, LX1]].forEach(([v, k, x]) => {
          const on = n.pick === k;
          s += pickG({ [i ? 'pb' : 'pa']: k, reveal: false }, '把 ' + show(n.x) + ' 看成 ' + show(v), K.rect(x - 26, y - 34, 52, 24, { fill: on ? 'var(--blue)' : '#fff', stroke: 'var(--blue)', r: 7, w: 1.4 }) + K.text(x, y - 17, show(v), { size: 13, weight: 700, fill: on ? '#fff' : 'var(--ink)' }) + K.line(x, y - 6, x, y + 6, { w: 2 }));
        });
      });
      if (m.both) s += '<g data-est="1">' + K.text(30, 262, '估计：' + show(m.nums[0].as) + ' ' + OPS[m.op] + ' ' + show(m.nums[1].as) + ' = ' + show(m.est), { size: 16, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
      else s += K.text(30, 262, '两个数都看成整的，估计才出来', { size: 13, anchor: 'start', fill: '#5a6478' });
      s += btn(30, 280, 110, '算一算', { reveal: true }, m.both && !m.shown, '揭开准确的结果');
      if (m.shown) s += '<g data-read="1">' + K.text(160, 298, '准确：' + show(m.exact) + '，估计差 ' + show(Q.sub(m.est, m.exact)).replace(/^(?!-)/, '+').replace('-', '−') + '（' + m.pct + '%）', { size: 14, weight: 700, anchor: 'start', fill: m.pct <= 10 ? 'var(--blue)' : 'var(--bad)' }) +
        K.text(160, 322, m.nearest ? '每个数都看成离它最近的整数：估得准' : '有的数没看成离它最近的那一端：差得多', { size: 12, anchor: 'start', fill: m.nearest ? 'var(--blue)' : 'var(--bad)' }) + '</g>';
    } else {
      const cx = 120, cy = 112, u = 66 / m.r;
      s += K.text(20, 28, '半径 ' + m.r + ' 的圆，面积大约是多少？', { size: 17, weight: 700, anchor: 'start' });
      s += K.rect(cx - m.r * u, cy - m.r * u, 2 * m.r * u, 2 * m.r * u, { fill: '#eef3fb', stroke: 'var(--blue)', r: 0, w: 1.4 });
      s += '<polygon points="' + [[cx, cy - m.r * u], [cx + m.r * u, cy], [cx, cy + m.r * u], [cx - m.r * u, cy]].map((q) => q.join(',')).join(' ') + '" fill="#fde2c4" stroke="#8a5a00" stroke-width="1.4"/>';
      s += K.circle(cx, cy, m.r * u, { fill: 'none', stroke: 'var(--bad)', w: 2 });
      s += K.text(260, 76, '外面的正方形：边长 ' + 2 * m.r + '，面积 ' + m.outer, { size: 13, anchor: 'start', fill: 'var(--blue)' }) + K.text(260, 100, '里面的正方形（斜放）：面积 ' + m.inner + '（大正方形的一半）', { size: 13, anchor: 'start', fill: '#8a5a00' }) + K.text(260, 124, '圆在它们中间', { size: 13, weight: 700, anchor: 'start', fill: 'var(--bad)' });
      s += K.line(BX0, BY, BX1, BY, { w: 2 });
      for (let v = 0; v <= m.top; v += 10) s += K.line(bx(m, v), BY - 4, bx(m, v), BY + 4, { w: 1 }) + (v % 20 === 0 ? K.text(bx(m, v), BY + 20, String(v), { size: 10, fill: '#5a6478' }) : '');
      s += K.rect(bx(m, m.lo), BY - 8, Math.max(1, bx(m, m.hi) - bx(m, m.lo)), 16, { fill: 'rgba(80,130,220,0.25)', stroke: 'none', r: 3 });
      [[m.inner, '#8a5a00'], [m.outer, 'var(--blue)']].forEach(([v, col]) => { s += K.line(bx(m, v), BY - 14, bx(m, v), BY + 14, { stroke: col, w: 2, dash: '3 2' }); });
      s += K.circle(bx(m, m.lo), BY, 8, { fill: '#fff', stroke: 'var(--blue)', w: 2 }) + K.circle(bx(m, m.hi), BY, 8, { fill: '#fff', stroke: 'var(--blue)', w: 2 });
      s += K.text(60, 210, '我估：最少 ' + m.lo + '，最多 ' + m.hi + '（拖数轴上的两个圆点）', { size: 14, weight: 700, anchor: 'start' });
      s += btn(60, 290, 90, '揭开', { reveal: true }, !m.shown && m.hi > m.lo, '看看圆的面积是多少') + btn(160, 290, 90, '再估一次', { reveal: false }, m.shown, '重新拖范围');
      if (m.shown) {
        s += K.line(bx(m, Q.num(m.actual)), BY - 18, bx(m, Q.num(m.actual)), BY + 18, { stroke: 'var(--bad)', w: 3 });
        s += '<g data-read="1">' + K.text(270, 308, '圆的面积 ≈ 3.14 × ' + m.r + ' × ' + m.r + ' = ' + show(m.actual) + '：' + (m.inr ? '在你的范围里' : '不在你的范围里'), { size: 14, weight: 700, anchor: 'start', fill: m.inr ? 'var(--blue)' : 'var(--bad)' }) +
          K.text(270, 330, '范围的中点 ' + m.mid + '，差 ' + m.pct + '%', { size: 12, anchor: 'start', fill: '#5a6478' }) + '</g>';
      }
    }
    return s;
  }
  U.registerPack({
    id: 'estbench', version: 1,
    types: {
      estbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E3', 'E7'],
        label: '估一估', prefix: '估一估', group: '数与运算', grades: [2, 6],
        alias: ['估算', '大约', '凑整', '四舍五入', '近似数', '整十数', '先估再算', '估一个范围', '夹逼'],
        props: {
          mode: { type: 'choice', label: '做什么', default: 0, choices: MODES, write: true },
          op: { type: 'choice', label: '凑整估算：算什么', default: 0, choices: OPS, write: true },
          a: { type: 'text', label: '第一个数', default: '47', write: true }, b: { type: 'text', label: '第二个数', default: '38', write: true },
          ua: { type: 'text', label: '第一个数看成几的倍数（10、100、1、0.1……）', default: '10', write: true }, ub: { type: 'text', label: '第二个数看成几的倍数', default: '10', write: true },
          pa: { type: 'int', label: '第一个数看成：1 小的一端，2 大的一端', default: 0, min: 0, max: 2, write: true }, pb: { type: 'int', label: '第二个数看成：1 小的一端，2 大的一端', default: 0, min: 0, max: 2, write: true },
          reveal: { type: 'bool', label: '揭开了', default: false, write: true },
          r: { type: 'int', label: '夹出范围：圆的半径', default: 5, min: 1, max: 10, write: true }, lo: { type: 'int', label: '我估：最少', default: 0, min: 0, max: 500, write: true }, hi: { type: 'int', label: '我估：最多', default: 0, min: 0, max: 500, write: true },
        },
        outputs: {
          est: { dim: null, kind: 'num', label: '估计值（两个数都选好了才有）' }, exact: { dim: null, kind: 'num', label: '准确值（揭开了才有）' }, pct: { dim: null, kind: 'num', label: '差百分之几（揭开了才有）' },
          inrange: { dim: null, kind: 'num', label: '夹出范围：圆的面积在范围里 1，不在 0（揭开了才有）' }, tight: { dim: null, kind: 'num', label: '夹出范围：在里面而且中点差不到 20%：1（揭开了才有）' },
        },
        icon: () => K.line(6, 30, 50, 30, { w: 2 }) + K.line(6, 24, 6, 36, { w: 2 }) + K.line(50, 24, 50, 36, { w: 2 }) + K.circle(41, 30, 4, { fill: 'var(--bad)' }) + K.text(28, 18, '≈', { size: 16, weight: 700 }),
        size: () => [W, 400],
        grips,
        compute: (c) => {
          const m = model(c.props), o = {};
          if (m.mode === 0) { if (m.both) o.est = qv(m.est); if (m.shown) { o.exact = qv(m.exact); o.pct = qv(Q.fromNumber ? Q.fromNumber(m.pct) : Q(Math.round(m.pct * 10), 10)); } }
          else if (m.shown) { o.inrange = qv(Q(m.inr ? 1 : 0)); o.tight = qv(Q(m.inr && m.pct < 20 ? 1 : 0)); o.exact = qv(m.actual); o.pct = qv(Q(Math.round(m.pct * 10), 10)); }
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.EstBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
