/* 器材包 areabench：面积公式推导。方格纸上一个图形，拖角改底、高、斜度；再一步一步剪、移、拼，变成已经会算的图形。
 *   - 平行四边形：点“沿高剪下来”，左边剪下一个三角形；点“移到右边”，拼成长方形：长就是底，宽就是高，面积 = 底 × 高。
 *     推斜了再剪拼一次（“重来”以后拖斜度），面积还是一样：记下拼过几种斜度。
 *   - 三角形：点“再拿一个一样的”，点“转过来拼上”，两个拼成平行四边形：三角形是它的一半，面积 = 底 × 高 ÷ 2。
 *   - 梯形：同样两个拼成平行四边形，底是上底 + 下底：面积 = (上底 + 下底) × 高 ÷ 2。
 * 拼好以前读不出面积（面积要靠拼出来）。
 * 这一版的边界（如实写）：边长都是整格；平行四边形的斜度不超过底（剪下的三角形落在底边上）；圆的切拼在“剪拼”器材里。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const qv = (q) => U.val('num', q, { dim: null });
  const W = 700, X0 = 40, YB = 290, UN = 22;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const SHAPES = ['平行四边形', '三角形', '梯形'];
  const X = (u) => X0 + u * UN, Y = (v) => YB - v * UN;
  function model(p) {
    const shape = clamp(p.shape, 0, 2), b = clamp(p.b, 2, 12), h = clamp(p.h, 1, 8), t = clamp(p.t, 1, 10);
    const s = shape === 0 ? clamp(p.s, 0, b) : shape === 1 ? clamp(p.s, 0, b) : clamp(p.s, 0, 6), step = clamp(p.step, 0, 2);
    const seen = [...new Set(String(p.seen || '').split(',').filter((x) => x !== '').map(Number))];
    const base = shape === 2 ? b + t : b, area = shape === 0 ? Q(b * h) : Q(base * h, 2);
    return { shape, b, h, t, s, step, seen, base, area };
  }
  const poly = (pts, fill, o) => '<polygon points="' + pts.map(([u, v]) => X(u) + ',' + Y(v)).join(' ') + '" fill="' + fill + '" stroke="' + ((o && o.stroke) || '#3a4a63') + '" stroke-width="' + ((o && o.w) || 1.8) + '"' + (o && o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>';
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const CA = '#cfe3fb', CB = '#fde2c4';
  function grips(c) {
    const m = model(c.props); if (m.step) return [];
    const u = (q) => (q.x - X0) / UN, v = (q) => (YB - q.y) / UN, out = [];
    out.push({ id: 'b', x: X(m.b), y: Y(0), r: 9, cursor: 'ew-resize', tip: '拖：改底', drag: (c0, q) => ({ b: clamp(u(q), 2, 12) }), say: (c1) => '底 ' + model(c1.props).b });
    const topX = m.shape === 1 ? m.s : m.s + (m.shape === 0 ? m.b : m.t) / 2;
    out.push({ id: 'h', x: X(topX), y: Y(m.h), r: 9, cursor: 'ns-resize', tip: '拖：改高', drag: (c0, q) => ({ h: clamp(v(q), 1, 8) }), say: (c1) => '高 ' + model(c1.props).h });
    if (m.shape !== 1) out.push({ id: 's', x: X(m.s), y: Y(m.h), r: 9, cursor: 'ew-resize', tip: '拖：推斜一点', drag: (c0, q) => ({ s: clamp(u(q), 0, m.shape === 0 ? model(c0.props).b : 6) }), say: (c1) => '斜度 ' + model(c1.props).s });
    else out.push({ id: 's', x: X(m.s) - 0.01, y: Y(m.h) - 16, r: 8, cursor: 'ew-resize', tip: '拖：顶点往左右挪', drag: (c0, q) => ({ s: clamp(u(q), 0, model(c0.props).b) }), say: (c1) => '顶点在 ' + model(c1.props).s });
    if (m.shape === 2) out.push({ id: 't', x: X(m.s + m.t), y: Y(m.h), r: 9, cursor: 'ew-resize', tip: '拖：改上底', drag: (c0, q) => ({ t: clamp(u(q) - model(c0.props).s, 1, 10) }), say: (c1) => '上底 ' + model(c1.props).t });
    return out;
  }
  function draw(c) {
    const p = c.props, m = model(p); let s = '';
    // 方格
    for (let i = 0; i <= 28; i++) s += K.line(X(i), Y(0), X(i), Y(8), { stroke: '#e3e7ef', w: 1 });
    for (let j = 0; j <= 8; j++) s += K.line(X(0), Y(j), X(28), Y(j), { stroke: '#e3e7ef', w: 1 });
    const { b, h, t } = m, sl = m.s;
    let title = '', lines = [];
    if (m.shape === 0) {
      title = '平行四边形：底 ' + b + '，高 ' + h + (sl ? '，斜度 ' + sl : '');
      if (m.step === 0) s += poly([[0, 0], [b, 0], [b + sl, h], [sl, h]], CA) + K.line(X(sl), Y(h), X(sl), Y(0), { stroke: 'var(--bad)', w: 1.6, dash: '5 4' });
      else if (m.step === 1) s += poly([[sl, 0], [b, 0], [b + sl, h], [sl, h]], CA) + poly([[0, 0], [sl, 0], [sl, h]], CB, { dash: '5 3' }) + K.text(X(sl / 2), Y(0) + 18, '剪下来的三角形', { size: 11, fill: '#8a5a00' });
      else s += poly([[sl, 0], [b, 0], [b + sl, h], [sl, h]], CA) + poly([[b, 0], [b + sl, 0], [b + sl, h]], CB) + poly([[sl, 0], [b + sl, 0], [b + sl, h], [sl, h]], 'none', { stroke: 'var(--blue)', w: 2.6 });
      s += btn(380, 330, 100, '沿高剪下来', { step: 1 }, m.step === 0 && sl > 0, sl > 0 ? '沿红虚线（高）剪下左边的三角形' : '已经是长方形了：先拖左上角推斜一点') + btn(486, 330, 100, '移到右边', { step: 2, seen: [...new Set(m.seen.concat([sl]))].join(',') }, m.step === 1, '把三角形平移到右边');
      if (m.step === 2) lines = ['拼成了长方形：长 = 底 = ' + b + '，宽 = 高 = ' + h, '面积 = 底 × 高 = ' + b + ' × ' + h + ' = ' + b * h, m.seen.length > 1 ? '拼过 ' + m.seen.length + ' 种斜度（' + m.seen.join('、') + '），面积都一样' : '“重来”以后推斜一点，再剪拼一次看看'];
    } else if (m.shape === 1) {
      title = '三角形：底 ' + b + '，高 ' + h;
      const tri = [[0, 0], [b, 0], [sl, h]], copy = [[b, 0], [sl, h], [b + sl, h]];
      s += poly(tri, CA) + K.line(X(sl), Y(h), X(sl), Y(0), { stroke: 'var(--bad)', w: 1.4, dash: '5 4' });
      if (m.step === 1) s += poly(copy, CB, { dash: '5 3', stroke: '#8a5a00' }) + K.text(X(b + sl / 2), Y(h) - 8, '一样的三角形转半圈，放在这里', { size: 11, fill: '#8a5a00' });
      if (m.step === 2) s += poly(copy, CB) + poly([[0, 0], [b, 0], [b + sl, h], [sl, h]], 'none', { stroke: 'var(--blue)', w: 2.6 });
      s += btn(380, 330, 120, '再拿一个一样的', { step: 1 }, m.step === 0, '再拿一个完全一样的三角形') + btn(506, 330, 100, '转过来拼上', { step: 2 }, m.step === 1, '转半圈，拼到斜边上');
      if (m.step === 2) lines = ['两个一样的三角形拼成平行四边形：底 ' + b + '，高 ' + h, '平行四边形面积 ' + b + ' × ' + h + ' = ' + b * h + '，三角形是它的一半', '三角形面积 = 底 × 高 ÷ 2 = ' + Q.show(m.area)];
    } else {
      title = '梯形：上底 ' + t + '，下底 ' + b + '，高 ' + h;
      const trap = [[0, 0], [b, 0], [sl + t, h], [sl, h]], copy = [[b, 0], [b + t, 0], [b + sl + t, h], [sl + t, h]];
      s += poly(trap, CA);
      if (m.step === 1) s += poly(copy, CB, { dash: '5 3', stroke: '#8a5a00' }) + K.text(X(b + (sl + t) / 2), Y(h) - 8, '一样的梯形转半圈，放在这里', { size: 11, fill: '#8a5a00' });
      if (m.step === 2) s += poly(copy, CB) + poly([[0, 0], [b + t, 0], [b + sl + t, h], [sl, h]], 'none', { stroke: 'var(--blue)', w: 2.6 });
      s += btn(380, 330, 120, '再拿一个一样的', { step: 1 }, m.step === 0, '再拿一个完全一样的梯形') + btn(506, 330, 100, '转过来拼上', { step: 2 }, m.step === 1, '转半圈，拼到右边的腰上');
      if (m.step === 2) lines = ['两个一样的梯形拼成平行四边形：底 = 上底 + 下底 = ' + t + ' + ' + b + ' = ' + (b + t), '平行四边形面积 ' + (b + t) + ' × ' + h + ' = ' + (b + t) * h + '，梯形是它的一半', '梯形面积 = (上底 + 下底) × 高 ÷ 2 = ' + Q.show(m.area)];
    }
    s += btn(612, 330, 70, '重来', { step: 0 }, m.step > 0, '回到原来的图形，可以再拖');
    s += K.text(20, 26, title, { size: 16, weight: 700, anchor: 'start' });
    if (lines.length) s += '<g data-read="1">' + lines.map((l, i) => K.text(20, 50 + i * 20, l, { size: 13, weight: i === 1 ? 700 : 400, anchor: 'start', fill: 'var(--blue)' })).join('') + '</g>';
    else s += K.text(20, 50, m.step === 0 ? '拖角改底、高' + (m.shape === 1 ? '、顶点' : '、斜度') + '；再剪一剪、拼一拼' : '还没拼好', { size: 12, anchor: 'start', fill: '#5a6478' });
    return s;
  }
  const I = (lo, hi, d, label) => ({ type: 'int', label, default: d, min: lo, max: hi, write: true });
  U.registerPack({
    id: 'areabench', version: 1,
    types: {
      areabench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E5', 'E4'],
        label: '面积公式推导', prefix: '面积推导', group: '图形', grades: [4, 5],
        alias: ['平行四边形的面积', '三角形的面积', '梯形的面积', '面积公式', '剪拼', '割补', '底乘高', '转化', '等积变形'],
        props: {
          shape: { type: 'choice', label: '什么图形', default: 0, choices: SHAPES, write: true },
          b: I(2, 12, 6, '底（梯形是下底）'), t: I(1, 10, 3, '梯形的上底'), h: I(1, 8, 4, '高'), s: I(0, 12, 2, '斜度（三角形是顶点的位置）'),
          step: I(0, 2, 0, '剪拼到第几步'), seen: { type: 'text', label: '平行四边形：拼成长方形时的斜度（自动记）', default: '', write: true },
        },
        outputs: {
          area: { dim: null, kind: 'num', label: '面积（拼好了才有）' }, base: { dim: null, kind: 'num', label: '拼成的图形的底（拼好了才有）' }, seen: { dim: null, kind: 'num', label: '平行四边形：拼过几种斜度' },
        },
        icon: () => '<polygon points="8,36 34,36 46,14 20,14" fill="' + CA + '" stroke="#3a4a63" stroke-width="1.4"/>' + K.line(20, 14, 20, 36, { stroke: 'var(--bad)', w: 1.4, dash: '3 2' }),
        size: () => [W, 400],
        grips,
        compute: (c) => {
          const m = model(c.props), o = { seen: qv(Q(m.seen.length)) };
          if (m.step === 2) { o.area = qv(m.area); o.base = qv(Q(m.base)); }
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.AreaBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
