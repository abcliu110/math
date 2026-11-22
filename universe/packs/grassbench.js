/* 器材包 grassbench：牛吃草（草一边长、牛一边吃）。一头牛一天吃 1 份草。
 *   mode 0 找长速：两次记录——k1 头牛吃 d1 天、k2 头牛吃 d2 天正好吃完。每次吃掉的草画成一根长条：
 *     吃掉的 = 原来就有的草 + 这些天新长的草。孩子点 − + 改“每天长几份”（r），长条里“新长的”那一截跟着变，
 *     剩下的就是“原来的草”。两根长条里“原来的草”一样长时，r 就对了（原来的草只有一种）。
 *     对上以后出现第三行：k3 头牛能吃几天？点 − + 改天数，直到 k3 × 天数 = 原来的草 + 天数 × r。
 *   mode 1 一天一天看：原来 G 份，每天长 r 份，k 头牛每天吃 k 份。画出每天早上的草量，吃完是第几天；
 *     牛不比每天长的多，就永远吃不完。点 − + 改牛的头数。
 * 这一版的边界（如实写）：牛 1–60 头，天数 1–60，每天长 0–30 份，原有的草 0–600 份。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  function model(p) {
    const mode = clamp(p.mode, 0, 1), r = clamp(p.r, 0, 30), k1 = clamp(p.k1, 1, 60), d1 = clamp(p.d1, 1, 60), k2 = clamp(p.k2, 1, 60), d2 = clamp(p.d2, 1, 60), k3 = clamp(p.k3, 1, 60), t3 = clamp(p.t3, 1, 60);
    const e1 = k1 * d1, e2 = k2 * d2, g1 = e1 - r * d1, g2 = e2 - r * d2, match = g1 === g2 && g1 >= 0;
    const third = match && k3 * t3 === g1 + r * t3;
    const g = clamp(p.g, 0, 600), k = clamp(p.k, 1, 60), days = [];   // 一天一天：每天早上的草量
    let left = g, dead = null, exact = false;
    if (mode === 1) { for (let t = 1; t <= 60; t++) { days.push(left); left = left + r - k; if (left <= 0) { dead = t; exact = left === 0; break; } } }
    return { mode, r, k1, d1, k2, d2, k3, t3, e1, e2, g1, g2, match, third, g, k, days, dead, exact, never: mode === 1 && k <= r };
  }
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const OLD = '#9bd08f', NEW = '#d8f0c8', COW = '#f3d9a4';
  function bar(y, k, d, r, scale, label) {   // 吃掉的草：原来的（深绿）+ 新长的（浅绿，按天一格一格）
    const eaten = k * d, grown = r * d, old = eaten - grown, X0 = 150;
    let s = K.text(20, y + 18, label, { size: 13, weight: 700, anchor: 'start' });
    if (old >= 0) s += K.rect(X0, y, old * scale, 26, { fill: OLD, stroke: '#4c8a43', r: 3, w: 1 }) + (old * scale > 60 ? K.text(X0 + old * scale / 2, y + 18, '原来 ' + old, { size: 12, weight: 700 }) : '');
    else s += K.rect(X0, y, 2, 26, { fill: 'var(--bad)' });
    const x1 = X0 + Math.max(0, old) * scale;
    const gw = Math.min(grown * scale, 430 - (x1 - X0));   // 每天长得太多（猜得太大）时，新长的一截画不下，截到台面里
    s += K.rect(x1, y, gw, 26, { fill: NEW, stroke: '#7fb36f', r: 3, w: 1 }) + (gw > 70 ? K.text(x1 + gw / 2, y + 18, '新长 ' + d + ' × ' + r, { size: 12 }) : '');
    s += K.text(x1 + gw + 8, y + 18, '共吃 ' + k + ' × ' + d + ' = ' + eaten, { size: 12, anchor: 'start' });
    return { s, old };
  }
  function draw(c) {
    const m = model(c.props); let s = '';
    if (m.mode === 0) {
      s += K.text(20, 26, '草每天一样快地长。' + m.k1 + ' 头牛 ' + m.d1 + ' 天吃完，' + m.k2 + ' 头牛 ' + m.d2 + ' 天吃完。草每天长几份？', { size: 15, weight: 700, anchor: 'start' });
      const big = Math.max(m.e1, m.e2, m.k3 * m.t3, 1), scale = 360 / big;
      const b1 = bar(50, m.k1, m.d1, m.r, scale, m.k1 + ' 头 × ' + m.d1 + ' 天'), b2 = bar(90, m.k2, m.d2, m.r, scale, m.k2 + ' 头 × ' + m.d2 + ' 天');
      s += b1.s + b2.s;
      // 原来的草一样长吗：竖一条虚线在第一根的“原来”结尾
      if (b1.old >= 0) s += K.line(150 + b1.old * scale, 44, 150 + b1.old * scale, 122, { stroke: m.match ? 'var(--blue)' : 'var(--bad)', w: 1.5, dash: '4 3' });
      const dd = m.d1 - m.d2, de = m.e1 - m.e2;
      s += K.text(20, 146, m.match ? '原来的草一样多：' + m.g1 + ' 份。每天长 ' + m.r + ' 份就对了。' : '原来的草：上面 ' + m.g1 + '，下面 ' + m.g2 + '，不一样——原来的草只有一份，每天长的不是 ' + m.r + '。', { size: 13, weight: 700, anchor: 'start', fill: m.match ? 'var(--blue)' : 'var(--bad)' });
      s += '<g data-rel="1">' + K.text(20, 168, '两次比一比：多吃了 ' + Math.abs(dd) + ' 天，多吃了 ' + Math.abs(de) + ' 份——这 ' + Math.abs(de) + ' 份是那 ' + Math.abs(dd) + ' 天新长出来的。', { size: 13, anchor: 'start' }) + '</g>';
      s += K.text(20, 200, '每天长', { size: 12, weight: 700, anchor: 'start' }) + btn(66, 184, 26, '−', { r: m.r - 1, t3: 1 }, m.r > 0, '每天少长 1 份') + K.text(110, 201, m.r + ' 份', { size: 14, weight: 700 }) + btn(130, 184, 26, '+', { r: m.r + 1, t3: 1 }, m.r < 30, '每天多长 1 份');
      if (m.match) {
        const b3 = bar(232, m.k3, m.t3, m.r, scale, m.k3 + ' 头 × ' + m.t3 + ' 天');
        s += b3.s + K.line(150 + m.g1 * scale, 226, 150 + m.g1 * scale, 262, { stroke: 'var(--blue)', w: 1.5, dash: '4 3' });
        s += K.text(20, 284, m.k3 + ' 头牛吃几天？天数', { size: 12, weight: 700, anchor: 'start' }) + btn(140, 268, 26, '−', { t3: m.t3 - 1 }, m.t3 > 1, '少吃一天') + K.text(184, 285, m.t3 + ' 天', { size: 14, weight: 700 }) + btn(204, 268, 26, '+', { t3: m.t3 + 1 }, m.t3 < 60, '多吃一天');
        s += K.text(250, 285, m.third ? '正好吃完' : b3.old > m.g1 ? '吃得比有的多：天数太多' : '还没吃完：天数太少', { size: 13, weight: 700, anchor: 'start', fill: m.third ? 'var(--blue)' : '#8a5a00' });
        if (m.third) s += '<g data-read="1">' + K.text(20, 318, m.k3 + ' 头牛吃 ' + m.t3 + ' 天：原来 ' + m.g1 + ' 份，每天净少 ' + m.k3 + ' − ' + m.r + ' = ' + (m.k3 - m.r) + ' 份，' + m.g1 + ' ÷ ' + (m.k3 - m.r) + ' = ' + m.t3, { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
      }
      return s;
    }
    s += K.text(20, 26, '原来有 ' + m.g + ' 份草，每天长 ' + m.r + ' 份，' + m.k + ' 头牛每天吃 ' + m.k + ' 份。几天吃完？', { size: 15, weight: 700, anchor: 'start' });
    const n = m.days.length, BW = Math.min(30, 640 / Math.max(n, 1)), top = Math.max(m.g, ...m.days, 1), H = 170, Y0 = 220;
    m.days.forEach((v, i) => { const h = v / top * H; s += K.rect(30 + i * BW, Y0 - h, BW - 3, h, { fill: OLD, stroke: '#4c8a43', w: 0.8, r: 2 }); if (BW >= 18 || i % 5 === 0) s += K.text(30 + i * BW + (BW - 3) / 2, Y0 + 14, String(i + 1), { size: 10 }); });
    s += K.line(26, Y0, 680, Y0, { stroke: '#8a93a3', w: 1 }) + K.text(30, Y0 + 30, '第几天（早上的草量）', { size: 11, anchor: 'start', fill: '#5f6773' });
    s += K.text(20, 272, '每天：+' + m.r + '（长）− ' + m.k + '（吃）= ' + (m.r - m.k >= 0 ? '+' : '−') + Math.abs(m.r - m.k) + ' 份', { size: 13, anchor: 'start' });
    if (m.never) s += K.text(20, 296, '牛不比每天长的多：草越来越多（或者不变），永远吃不完。最多 ' + m.r + ' 头牛能一直吃下去。', { size: 13, weight: 700, anchor: 'start', fill: '#8a5a00' });
    else if (m.dead) s += '<g data-read="1">' + K.text(20, 296, '第 ' + m.dead + ' 天吃完：每天净少 ' + (m.k - m.r) + ' 份，' + m.g + ' ÷ ' + (m.k - m.r) + (m.g % (m.k - m.r) ? ' 不是整数，最后一天没吃饱' : ' = ' + m.dead), { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    else s += K.text(20, 296, '60 天还没吃完。', { size: 13, anchor: 'start' });
    s += K.text(20, 330, '牛', { size: 12, weight: 700, anchor: 'start' }) + btn(40, 314, 34, '−5', { k: m.k - 5 }, m.k > 5, '少 5 头牛') + btn(78, 314, 26, '−', { k: m.k - 1 }, m.k > 1, '少一头牛') + K.text(124, 331, m.k + ' 头', { size: 14, weight: 700 }) + btn(146, 314, 26, '+', { k: m.k + 1 }, m.k < 60, '多一头牛') + btn(176, 314, 34, '+5', { k: m.k + 5 }, m.k <= 55, '多 5 头牛');
    return s;
  }
  U.registerPack({
    id: 'grassbench', version: 1,
    types: {
      grassbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E4', 'E7'],
        label: '牛吃草', prefix: '牛吃草', group: '关系', grades: [5, 6],
        alias: ['牛吃草', '牛顿问题', '草一边长一边吃', '长速', '原有草量', '消长'],
        props: {
          mode: { type: 'choice', label: '玩什么', default: 0, choices: ['找长速（两次记录）', '一天一天看'], write: true },
          r: { type: 'int', label: '每天长几份', default: 0, min: 0, max: 30, write: true },
          k1: { type: 'int', label: '第一次：几头牛', default: 10, min: 1, max: 60, write: true }, d1: { type: 'int', label: '第一次：吃几天', default: 20, min: 1, max: 60, write: true },
          k2: { type: 'int', label: '第二次：几头牛', default: 15, min: 1, max: 60, write: true }, d2: { type: 'int', label: '第二次：吃几天', default: 10, min: 1, max: 60, write: true },
          k3: { type: 'int', label: '要问的：几头牛', default: 25, min: 1, max: 60, write: true }, t3: { type: 'int', label: '要问的：吃几天', default: 1, min: 1, max: 60, write: true },
          g: { type: 'int', label: '原来有几份草', default: 100, min: 0, max: 600, write: true }, k: { type: 'int', label: '几头牛', default: 10, min: 1, max: 60, write: true },
        },
        outputs: {
          g1: { dim: null, kind: 'num', label: '第一次里原来的草' }, g2: { dim: null, kind: 'num', label: '第二次里原来的草' },
          r: { dim: null, kind: 'num', label: '每天长几份（两次对上才有）' }, g: { dim: null, kind: 'num', label: '原来有几份草（对上才有，一天一天看时一直有）' },
          t3: { dim: null, kind: 'num', label: '要问的牛吃几天（正好吃完才有）' }, days: { dim: null, kind: 'num', label: '第几天吃完（吃得完才有）' }, exact: { dim: null, kind: 'num', label: '正好吃完用了几天（最后一天正好吃饱才有）' },
        },
        icon: () => K.rect(4, 22, 20, 12, { fill: OLD, stroke: 'var(--ink)', r: 2, w: 0.8 }) + K.rect(24, 22, 14, 12, { fill: NEW, stroke: 'var(--ink)', r: 2, w: 0.8 }) + K.circle(46, 16, 6, { fill: COW, stroke: 'var(--ink)', w: 0.8 }),
        size: () => [W, 380],
        grips: () => [],
        compute: (c) => {
          const m = model(c.props), o = {};
          if (m.mode === 0) { o.g1 = num(m.g1); o.g2 = num(m.g2); if (m.match) { o.r = num(m.r); o.g = num(m.g1); } if (m.third) o.t3 = num(m.t3); }
          else { o.g = num(m.g); o.r = num(m.r); if (m.dead) o.days = num(m.dead); if (m.exact) o.exact = num(m.dead); }
          return o;
        },
        badge: (c) => { const m = model(c.props); return m.mode === 0 ? (m.match ? '每天长 ' + m.r : '') : m.dead ? m.dead + ' 天吃完' : ''; },
        draw,
      },
    },
  });
  U.GrassBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
