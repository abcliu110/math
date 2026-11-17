/* 器材包 tilebench：代数砖（整式与乘法公式）。三种砖：x²（x × x 的大方块）、x（x × 1 的长条）、1（小方块）。
 *   - 拼长方形（因式分解）：手里的砖由式子给定。点长和宽的 + −（几个 x、几个 1），框按长 × 宽画好格子，
 *     手里的砖自动往格子里铺：缺的格子画红虚线，多出来的砖在旁边标红。正好铺满就是拼成了：长 × 宽就是因式。
 *     有的式子拼不成：点“拼不成”，判断对不对都会说明。
 *   - 展开（数砖）：框已经画好（长、宽给定），点“放一块 x²”“放一条 x”“放一个 1”一块一块铺；那种砖的位置满了会说。铺满了数一数就是展开式。
 *   - 补成正方形（配方）：大方块和长条是给定的，边长是 x + 几自己调；角上缺的小方块点“补一个”补齐。
 *   - 平方差：大正方形挖掉一个小正方形，点“沿虚线剪开”“拼过去”，拼成一个长方形：a² − b² = (a + b)(a − b)。
 * 这一版的边界（如实写）：没有负砖；长和宽最多 2 个 x 加 9 个 1；平方差用的是一个具体的图（边长可调），字母只是标签。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700, XU = 14, XL = 5, X = XL * XU, F0 = 40, FY = 70;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const MODES = ['拼长方形（因式分解）', '展开（数砖）', '补成正方形（配方）', '平方差'];
  const C2 = '#9fc3ea', C1 = '#f5c26b', C0 = '#9fd5ad';
  // 读 “x^2+5x+6” / “x²+6x”：返回 [x²的系数, x的系数, 常数]；读不出来返回 null
  function parse(t) {
    const s = String(t || '').replace(/\s+/g, '').replace(/²/g, '^2').replace(/\*/g, ''); if (!s) return null;
    const c = [0, 0, 0]; const re = /([+-]?)(\d*)(x\^2|x)?/g; let m, used = 0;
    while ((m = re.exec(s)) && m[0] !== '') { const sign = m[1] === '-' ? -1 : 1, k = m[2] === '' ? 1 : Number(m[2]); if (m[3] === undefined && m[2] === '') return null; c[m[3] === 'x^2' ? 0 : m[3] === 'x' ? 1 : 2] += sign * k; used += m[0].length; }
    return used === s.length && c.every((v) => v >= 0) ? c : null;
  }
  const need = (wa, wp, ha, hp) => [wa * ha, wa * hp + ha * wp, wp * hp];
  const same = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
  function factorable(c) {
    for (let wa = 1; wa <= 2; wa++) for (let ha = 1; ha <= 2; ha++) for (let wp = 0; wp <= 9; wp++) for (let hp = 0; hp <= 9; hp++) if (same(need(wa, wp, ha, hp), c)) return [wa, wp, ha, hp];
    return null;
  }
  const side = (a, p) => (a ? (a === 1 ? 'x' : a + 'x') : '') + (a && p ? ' + ' : '') + (p || !a ? p : '');
  const poly = (c) => { const t = []; if (c[0]) t.push((c[0] === 1 ? '' : c[0]) + 'x²'); if (c[1]) t.push((c[1] === 1 ? '' : c[1]) + 'x'); if (c[2]) t.push(String(c[2])); return t.join(' + ') || '0'; };
  function model(p) {
    const mode = clamp(p.mode, 0, 3), goal = parse(p.expr);
    let wa = clamp(p.wa, 1, 2), wp = clamp(p.wp, 0, 9), ha = clamp(p.ha, 1, 2), hp = clamp(p.hp, 0, 9);
    if (mode === 2) { wa = ha = 1; hp = wp; }
    const nd = need(wa, wp, ha, hp);
    let have;
    if (mode === 1) have = [clamp(p.p2, 0, nd[0]), clamp(p.p1, 0, nd[1]), clamp(p.p0, 0, nd[2])];
    else { const g = goal || [1, 0, 0]; have = [g[0], g[1], g[2] + (mode === 2 ? clamp(p.add, 0, 99) : 0)]; }
    const full = same(have, nd) && nd[0] > 0;
    const fac = mode === 0 && goal ? factorable(goal) : null;
    return { mode, goal, wa, wp, ha, hp, nd, have, full, fac, add: clamp(p.add, 0, 99), claim: p.claim === 1 || p.claim === true, a: clamp(p.a, 3, 12), b: clamp(p.b, 1, 11), cut: clamp(p.cut, 0, 2), sym: String(p.sym || 'a,b').split(',') };
  }
  const btn = (x, y, w, label, patch, enabled, tip, active) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 24, { fill: active ? 'var(--blue)' : enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 16, label, { size: 12, weight: 700, fill: active ? '#fff' : enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  // 框里的格子：先 x 列再 1 列；先 x 行再 1 行。按种类依次铺 have 块，没铺到的画红虚线
  function frame(m) {
    const cols = [], rows = []; for (let i = 0; i < m.wa; i++) cols.push(X); for (let i = 0; i < m.wp; i++) cols.push(XU); for (let i = 0; i < m.ha; i++) rows.push(X); for (let i = 0; i < m.hp; i++) rows.push(XU);
    const used = [0, 0, 0]; let s = '', y = FY;
    rows.forEach((rh) => { let x = F0; cols.forEach((cw) => { const k = cw === X && rh === X ? 0 : cw === XU && rh === XU ? 2 : 1, on = used[k] < m.have[k]; used[k]++; s += K.rect(x + 1, y + 1, cw - 2, rh - 2, on ? { fill: [C2, C1, C0][k], stroke: '#3a4a63', r: 1, w: 1 } : { fill: '#fff', stroke: 'var(--bad)', r: 1, w: 1, dash: '3 2' }); x += cw; }); y += rh; });
    const fw = cols.reduce((a, b) => a + b, 0), fh = rows.reduce((a, b) => a + b, 0);
    s += K.rect(F0, FY, fw, fh, { fill: 'none', stroke: 'var(--ink)', r: 0, w: 1.6 });
    s += K.text(F0 + fw / 2, FY - 8, '长 ' + side(m.wa, m.wp), { size: 12, weight: 700, fill: 'var(--blue)' }) + '<g transform="translate(' + (F0 - 10) + ',' + (FY + fh / 2) + ') rotate(-90)">' + K.text(0, 0, '宽 ' + side(m.ha, m.hp), { size: 12, weight: 700, fill: 'var(--blue)' }) + '</g>';
    return s;
  }
  const missing = (m) => [0, 1, 2].map((k) => m.nd[k] - m.have[k]);
  function draw(c) {
    const p = c.props, m = model(p); let s = '';
    const R0 = 380;
    if (m.mode <= 2) {
      s += frame(m);
      const gap = missing(m), names = ['x²', 'x', '1'];
      // 手里的砖
      s += K.text(R0, 28, m.mode === 1 ? '铺进去的砖：' : '手里的砖：' + (m.goal ? poly(m.have) : '（式子读不出来）'), { size: 13, weight: 700, anchor: 'start' });
      names.forEach((n, k) => {
        const y = 44 + k * 26, more = -gap[k], less = gap[k];
        s += K.rect(R0, y, 16, 16, { fill: [C2, C1, C0][k], stroke: '#3a4a63', r: 1, w: 1 }) + K.text(R0 + 24, y + 13, n + '：' + m.have[k] + ' 块' + (m.mode === 1 ? '（要 ' + m.nd[k] + ' 块）' : ''), { size: 12, anchor: 'start' });
        if (m.mode !== 1 && more > 0) s += K.text(R0 + 130, y + 13, '多 ' + more + ' 块', { size: 12, weight: 700, anchor: 'start', fill: 'var(--bad)' });
        if (m.mode !== 1 && less > 0) s += K.text(R0 + 130, y + 13, '缺 ' + less + ' 块', { size: 12, weight: 700, anchor: 'start', fill: 'var(--bad)' });
      });
      let y = 134;
      if (m.mode === 0) {
        s += K.text(R0, y, '长：', { size: 12, weight: 700, anchor: 'start' }) + btn(R0 + 30, y - 16, 44, 'x −', { wa: m.wa - 1, claim: 0, msg: '' }, m.wa > 1, '长少一个 x') + btn(R0 + 78, y - 16, 44, 'x +', { wa: m.wa + 1, claim: 0, msg: '' }, m.wa < 2, '长多一个 x') + btn(R0 + 136, y - 16, 44, '1 −', { wp: m.wp - 1, claim: 0, msg: '' }, m.wp > 0, '长少一个 1') + btn(R0 + 184, y - 16, 44, '1 +', { wp: m.wp + 1, claim: 0, msg: '' }, m.wp < 9, '长多一个 1');
        y += 32;
        s += K.text(R0, y, '宽：', { size: 12, weight: 700, anchor: 'start' }) + btn(R0 + 30, y - 16, 44, 'x −', { ha: m.ha - 1, claim: 0, msg: '' }, m.ha > 1, '宽少一个 x') + btn(R0 + 78, y - 16, 44, 'x +', { ha: m.ha + 1, claim: 0, msg: '' }, m.ha < 2, '宽多一个 x') + btn(R0 + 136, y - 16, 44, '1 −', { hp: m.hp - 1, claim: 0, msg: '' }, m.hp > 0, '宽少一个 1') + btn(R0 + 184, y - 16, 44, '1 +', { hp: m.hp + 1, claim: 0, msg: '' }, m.hp < 9, '宽多一个 1');
        y += 30;
        s += btn(R0, y, 120, '拼不成', { claim: 1, msg: m.fac ? '能拼成：再调调长和宽' : '' }, !m.full && m.goal !== null, '试过了，觉得这些砖拼不成长方形', m.claim && !m.fac);
        y += 52;
        if (m.full) s += '<g data-read="1">' + K.text(R0, y, '拼成了：' + poly(m.have) + ' = (' + side(m.wa, m.wp) + ')(' + side(m.ha, m.hp) + ')', { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
        else if (m.claim && !m.fac) s += '<g data-read="1">' + K.text(R0, y, '对：找不到两个整数，乘起来是 ' + m.goal[2] + '、加起来是 ' + m.goal[1], { size: 13, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(R0, y + 20, '这些砖拼不成长方形', { size: 13, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
        else if (p.msg) s += K.text(R0, y, p.msg, { size: 13, weight: 700, anchor: 'start', fill: 'var(--bad)' });
        else s += K.text(R0, y, '红虚线是缺的格子；调长和宽，让砖正好铺满', { size: 12, anchor: 'start', fill: '#5a6478' });
      } else if (m.mode === 1) {
        names.forEach((n, k) => { const key = ['p2', 'p1', 'p0'][k], full = m.have[k] >= m.nd[k]; s += btn(R0 + k * 104, y - 16, 98, '放一' + ['块 ', '条 ', '个 '][k] + n, full ? { msg: n + ' 的位置已经铺满了' } : { [key]: m.have[k] + 1, msg: '' }, !m.full, full ? n + ' 的位置满了' : '往框里放一块'); });
        y += 40;
        if (m.full) s += '<g data-read="1">' + K.text(R0, y, '铺满了：(' + side(m.wa, m.wp) + ')(' + side(m.ha, m.hp) + ')', { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(R0, y + 22, '= ' + poly(m.nd), { size: 16, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
        else if (p.msg) s += K.text(R0, y, p.msg, { size: 13, weight: 700, anchor: 'start', fill: 'var(--bad)' });
        else s += K.text(R0, y, '大方块是 x × x，长条是 x × 1，小方块是 1 × 1', { size: 12, anchor: 'start', fill: '#5a6478' });
      } else {
        s += K.text(R0, y, '边长 x + ' + m.wp, { size: 12, weight: 700, anchor: 'start' }) + btn(R0 + 90, y - 16, 34, '−', { wp: m.wp - 1 }, m.wp > 0, '边长少一个 1') + btn(R0 + 128, y - 16, 34, '+', { wp: m.wp + 1 }, m.wp < 9, '边长多一个 1');
        y += 32;
        s += btn(R0, y - 16, 120, '补一个小方块', { add: m.add + 1 }, m.add < 99, '往角上补一个 1') + btn(R0 + 128, y - 16, 120, '拿走一个小方块', { add: m.add - 1 }, m.add > 0, '拿走一个补上的 1');
        y += 40;
        if (m.full) s += '<g data-read="1">' + K.text(R0, y, '补了 ' + m.add + ' 个，拼成正方形：', { size: 13, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(R0, y + 22, poly(m.have) + ' = (x + ' + m.wp + ')²', { size: 16, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
        else s += K.text(R0, y, '长条要平分在大方块的两边；角上是 ' + m.wp + ' × ' + m.wp + ' 的空位', { size: 12, anchor: 'start', fill: '#5a6478' });
      }
    } else {
      const u = 22, a = m.a, b = Math.min(m.b, a - 1), A = m.sym[0] || 'a', B = m.sym[1] || 'b', x0 = 40, y0 = 60, cut = m.cut;
      const R = (x, y, w, h, f) => K.rect(x, y, w, h, { fill: f, stroke: '#3a4a63', r: 0, w: 1.4 });
      // 大正方形 a × a，右上角挖掉 b × b。上面一块：(a − b) × b；下面一块：a × (a − b)
      if (cut === 0) {
        s += R(x0, y0, (a - b) * u, b * u, C1) + R(x0, y0 + b * u, a * u, (a - b) * u, C2) + K.rect(x0 + (a - b) * u, y0, b * u, b * u, { fill: 'none', stroke: 'var(--bad)', r: 0, w: 1, dash: '4 3' });
        s += K.line(x0, y0 + b * u, x0 + (a - b) * u, y0 + b * u, { stroke: 'var(--bad)', w: 2, dash: '6 4' });
      } else if (cut === 1) {
        s += R(x0, y0 - 14, (a - b) * u, b * u, C1) + R(x0, y0 + b * u + 6, a * u, (a - b) * u, C2);
      } else {
        // 上面一块转过来接到右边：变成 (a + b) × (a − b)
        s += R(x0, y0 + b * u, a * u, (a - b) * u, C2) + R(x0 + a * u, y0 + b * u, b * u, (a - b) * u, C1);
        s += K.text(x0 + (a + b) * u / 2, y0 + b * u - 8, A + ' + ' + B, { size: 13, weight: 700, fill: 'var(--blue)' }) + K.text(x0 + (a + b) * u + 24, y0 + b * u + (a - b) * u / 2 + 4, A + ' − ' + B, { size: 13, weight: 700, fill: 'var(--blue)' });
      }
      if (cut < 2) s += K.text(x0 + a * u / 2, y0 + a * u + 22, A, { size: 13, weight: 700 }) + K.text(x0 - 14, y0 + b * u / 2 + 4, B, { size: 12 }) + K.text(x0 + (a - b) * u + b * u / 2, y0 + b * u / 2 + 4, B + '²', { size: 12, fill: 'var(--bad)' });
      const R1 = 420;
      s += K.text(R1, 40, cut === 0 ? A + '² − ' + B + '²：大正方形挖掉一个小正方形' : cut === 1 ? '剪成了两块长方形' : '拼成了一个长方形', { size: 13, weight: 700, anchor: 'start' });
      s += btn(R1, 60, 120, '沿虚线剪开', { cut: 1 }, cut === 0, '把剩下的部分剪成两块') + btn(R1 + 128, 60, 120, '拼过去', { cut: 2 }, cut === 1, '把上面一块转过来接到右边');
      s += btn(R1, 92, 120, '重来', { cut: 0 }, cut > 0, '回到挖掉小正方形的样子');
      s += K.text(R1, 140, '边长 ' + A + ' = ' + a, { size: 12, anchor: 'start' }) + btn(R1 + 80, 124, 30, '−', { a: a - 1, b: Math.min(b, a - 2) }, a > 3, '大正方形小一点') + btn(R1 + 114, 124, 30, '+', { a: a + 1 }, a < 12, '大正方形大一点');
      s += K.text(R1, 172, '边长 ' + B + ' = ' + b, { size: 12, anchor: 'start' }) + btn(R1 + 80, 156, 30, '−', { b: b - 1 }, b > 1, '小正方形小一点') + btn(R1 + 114, 156, 30, '+', { b: b + 1 }, b < a - 1, '小正方形大一点');
      if (cut === 2) s += '<g data-read="1">' + K.text(R1, 220, A + '² − ' + B + '² = (' + A + ' + ' + B + ')(' + A + ' − ' + B + ')', { size: 16, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(R1, 244, a + '² − ' + b + '² = ' + (a * a - b * b) + ' = ' + (a + b) + ' × ' + (a - b), { size: 13, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    }
    return s;
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  U.registerPack({
    id: 'tilebench', version: 1,
    types: {
      tilebench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E2', 'E8'],
        label: '代数砖', prefix: '代数砖', group: '关系', grades: [7, 9],
        alias: ['代数砖', '整式乘法', '展开', '因式分解', '十字相乘', '配方', '完全平方', '平方差', '乘法公式', '拼长方形'],
        props: {
          mode: { type: 'choice', label: '做什么', default: 0, choices: MODES, write: true },
          expr: { type: 'text', label: '手里的砖（式子，比如 x^2+5x+6）', default: 'x^2+5x+6', write: true },
          wa: I(1, 2, 1, '长里有几个 x'), wp: I(0, 9, 0, '长里有几个 1'), ha: I(1, 2, 1, '宽里有几个 x'), hp: I(0, 9, 0, '宽里有几个 1'),
          p2: I(0, 9, 0, '展开：铺了几块 x²'), p1: I(0, 40, 0, '展开：铺了几条 x'), p0: I(0, 99, 0, '展开：铺了几个 1'),
          add: I(0, 99, 0, '配方：补了几个小方块'), claim: I(0, 1, 0, '说了“拼不成”'), msg: { type: 'text', label: '提示（自动）', default: '', write: true, hidden: true },
          a: I(3, 12, 8, '平方差：大正方形边长'), b: I(1, 11, 3, '平方差：小正方形边长'), cut: I(0, 2, 0, '平方差：0 没剪，1 剪开，2 拼好'),
          sym: { type: 'text', label: '平方差：两个边长叫什么（逗号分开）', default: 'a,b', write: true },
        },
        outputs: {
          done: { dim: null, kind: 'num', label: '拼成了 / 铺满了：1 是，0 否' }, p2: { dim: null, kind: 'num', label: '框里 x² 的块数' }, p1: { dim: null, kind: 'num', label: '框里 x 的条数（一次项系数）' }, p0: { dim: null, kind: 'num', label: '框里小方块的个数（常数项）' },
          judged: { dim: null, kind: 'num', label: '说“拼不成”说对了：1（说了才有）' }, added: { dim: null, kind: 'num', label: '补成正方形时补了几个（补成了才有）' },
        },
        icon: () => K.rect(8, 8, 22, 22, { fill: C2, stroke: 'var(--ink)', w: 1 }) + K.rect(32, 8, 6, 22, { fill: C1, stroke: 'var(--ink)', w: 1 }) + K.rect(40, 8, 6, 22, { fill: C1, stroke: 'var(--ink)', w: 1 }) + K.rect(8, 32, 22, 6, { fill: C1, stroke: 'var(--ink)', w: 1 }) + K.rect(32, 32, 6, 6, { fill: C0, stroke: 'var(--ink)', w: 1 }),
        size: () => [W, 400],
        grips: () => [],
        compute: (c) => {
          const m = model(c.props), o = {};
          if (m.mode === 3) { o.done = num(m.cut === 2 ? 1 : 0); return o; }
          o.done = num(m.full ? 1 : 0); o.p2 = num(m.nd[0]); o.p1 = num(m.nd[1]); o.p0 = num(m.nd[2]);
          if (m.mode === 0 && m.claim) o.judged = num(m.fac ? 0 : 1);
          if (m.mode === 2 && m.full) o.added = num(m.add);
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.TileBench = { model, parse, factorable };
})(typeof globalThis !== 'undefined' ? globalThis : window);
