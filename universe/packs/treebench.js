/* 器材包 treebench：枚举树（有顺序地列，不重不漏）。树横着画：根 → 第一层的每一枝一行 → 这一枝下面的叶子。
 *   mode 0 数字卡片排数：m 张卡片（1…m，或者带 0 的 0…m−1），排成 k 位数；可不可以重复用（rep）；还可以只要双数、单数（cond）。
 *     第一层按“最高位是几”分枝；0 打头的那一枝整枝剪掉；不合条件的叶子划掉，不算。
 *   mode 1 凑钱：用 1 元、2 元、5 元（或 1 元、5 元、10 元）凑 amt 元。第一层按“最大的钱用几张”分枝，
 *     下面按“中间的钱用几张”列叶子，剩下的都用 1 元。
 *   点“展开下一枝”一枝一枝地展开（open）：先定第一位（先定大的），再列下面的，就不会漏、不会重。
 *   全部展开以后才有“一共几个”（count）；每枝一样多时写成乘法，不一样多时只能加起来。
 * 这一版的边界（如实写）：卡片最多 5 张，位数 2–3（能重复用的三位数最多 4 张卡片）；凑钱最多 20 元（1、2、5）或 50 元（1、5、10）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700, OMAX = 6;
  const SETS = [[5, 2], [10, 5]];
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const CONDS = ['', '双数', '单数'];
  function model(p) {
    const mode = clamp(p.mode, 0, 1), k = clamp(p.k, 2, 3), rep = !!p.rep, zero = !!p.zero, cond = clamp(p.cond, 0, 2);
    const m = clamp(p.m, rep ? 2 : k, rep && k === 3 ? 4 : 5), set = clamp(p.set, 0, 1), [B, M] = SETS[set], amt = clamp(p.amt, 3, set ? 50 : 20);
    const rows = [];
    if (mode === 0) {
      const D = Array.from({ length: m }, (_, i) => (zero ? i : i + 1));
      const tails = (used, len) => {
        if (!len) return [[]];
        const out = [];
        D.forEach((d) => { if (!rep && used.includes(d)) return; tails(used.concat(d), len - 1).forEach((t) => out.push([d].concat(t))); });
        return out;
      };
      D.forEach((d) => {
        const cut = d === 0 ? '0 不能打头' : '';
        const leaves = cut ? [] : tails([d], k - 1).map((t) => { const s = [d].concat(t), last = s[s.length - 1], bad = cond === 1 ? last % 2 !== 0 : cond === 2 ? last % 2 === 0 : false; return { t: s.join(''), sub: String(s[1]), bad }; });
        rows.push({ label: String(d), cut, leaves });
      });
    } else {
      for (let i = 0; i * B <= amt; i++) {
        const rest = amt - i * B, leaves = [];
        for (let j = 0; j * M <= rest; j++) leaves.push({ t: M + '元×' + j, t2: '1元×' + (rest - j * M), bad: false });
        rows.push({ label: B + '元×' + i, cut: '', leaves });
      }
    }
    const open = clamp(p.open, 0, rows.length), good = (r) => r.leaves.filter((l) => !l.bad).length;
    const seen = rows.slice(0, open).reduce((a, r) => a + good(r), 0), all = open >= rows.length;
    const live = rows.filter((r) => !r.cut), per = live.map(good), same = per.length > 0 && per.every((v) => v === per[0]);
    return { mode, k, rep, zero, cond, m, set, B, M, amt, rows, open, seen, all, count: all ? seen : null, per, same };
  }
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const cards = (m) => Array.from({ length: m.m }, (_, i) => (m.zero ? i : i + 1));
  const title = (m) => (m.mode === 0
    ? '用 ' + cards(m).join('、') + ' 这 ' + m.m + ' 张卡片排' + (m.k === 2 ? '两' : '三') + '位数' + (m.cond ? '（只要' + CONDS[m.cond] + '）' : '') + (m.rep ? '，同一张可以重复用' : '，每张只能用一次')
    : '用 1 元、' + m.M + ' 元、' + m.B + ' 元凑 ' + m.amt + ' 元');
  function draw(c) {
    const m = model(c.props); let s = '';
    s += K.text(20, 26, title(m) + '：一共几种？', { size: 15, weight: 700, anchor: 'start' });
    const X0 = 24, XB = 92, XL = 150, LW = m.mode === 0 ? 40 : 48, PER = m.mode === 0 ? 13 : 10, RH = m.mode === 0 ? 26 : 34;
    let y = 46;
    s += K.rect(X0 - 4, y + 4, 30, 22, { fill: '#eef1f6', stroke: '#8a93a3', r: 6, w: 1 }) + K.text(X0 + 11, y + 19, '开始', { size: 10 });
    m.rows.forEach((r, i) => {
      const lines = Math.max(1, Math.ceil(r.leaves.length / PER)), h = (r.cut || i >= m.open ? 1 : lines) * RH + 6;
      const cy = y + 15;
      s += K.line(X0 + 26, 61, XB - 4, cy, { stroke: '#8a93a3', w: 1 });
      s += K.rect(XB - 4, cy - 12, 52, 24, { fill: i < m.open ? '#fff3d6' : '#f6f7f9', stroke: '#c9a24a', r: 6, w: 1 }) + K.text(XB + 22, cy + 4, r.label, { size: 12, weight: 700 });
      if (i >= m.open) s += K.text(XL + 4, cy + 4, '▸ 还没展开', { size: 12, anchor: 'start', fill: '#8a93a3' });
      else if (r.cut) s += K.line(XB - 4, cy, XB + 48, cy, { stroke: '#c0392b', w: 2 }) + K.text(XL + 4, cy + 4, '✂ ' + r.cut + '：这一枝整枝剪掉', { size: 12, anchor: 'start', fill: '#c0392b' });
      else {
        r.leaves.forEach((l, j) => {
          const lx = XL + (j % PER) * (LW + 2), ly = y + Math.floor(j / PER) * RH + 2;
          const fill = l.bad ? '#f1f3f6' : '#e3f4e6', st = l.bad ? '#b8c0cc' : '#4c9a5b';
          s += K.rect(lx, ly, LW, RH - 4, { fill, stroke: st, r: 4, w: 1 });
          if (l.t2) s += K.text(lx + LW / 2, ly + 12, l.t, { size: 10, weight: 700, fill: l.bad ? '#8a93a3' : 'var(--ink)' }) + K.text(lx + LW / 2, ly + 25, l.t2, { size: 10, fill: '#5f6773' });
          else s += K.text(lx + LW / 2, ly + 15, l.t, { size: 12, weight: 700, fill: l.bad ? '#8a93a3' : 'var(--ink)' });
          if (l.bad) s += K.line(lx + 3, ly + (RH - 4) / 2, lx + LW - 3, ly + (RH - 4) / 2, { stroke: '#c0392b', w: 1.2 });
          // 三位数：第二位换了，叶子之间留一道竖线，看得出下一层的分枝
          if (m.mode === 0 && m.k === 3 && j > 0 && j % PER && r.leaves[j - 1].sub !== l.sub) s += K.line(lx - 1, ly, lx - 1, ly + RH - 4, { stroke: '#c9a24a', w: 2 });
        });
        s += K.text(XL + Math.min(r.leaves.length, PER) * (LW + 2) + 6, cy + 4, r.leaves.filter((l) => !l.bad).length + ' 种', { size: 12, weight: 700, anchor: 'start', fill: '#4c9a5b' });
      }
      y += h;
    });
    y += 24;
    if (!m.open) s += K.text(20, y, '一枝一枝来：先定' + (m.mode === 0 ? '最高位是几' : '最大的钱用几张') + '，再列下面的。点“展开下一枝”。', { size: 13, anchor: 'start', fill: '#5f6773' });
    else if (!m.all) s += K.text(20, y, '展开了 ' + m.open + ' 枝（一共 ' + m.rows.length + ' 枝），已经列出 ' + m.seen + ' 种。', { size: 13, anchor: 'start' });
    else {
      const v = m.per.length;
      const how = m.same && v > 1 ? '每一枝都是 ' + m.per[0] + ' 种，有 ' + v + ' 枝：' + m.per[0] + ' × ' + v + ' = ' + m.count : v > 1 ? '每一枝不一样多，只能加起来：' + m.per.join(' + ') + ' = ' + m.count : '只有一枝：' + m.count;
      s += K.text(20, y, how, { size: 13, anchor: 'start' });
      s += '<g data-read="1">' + K.text(20, y + 26, '一共 ' + m.count + ' 种', { size: 16, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    }
    const yb = Math.max(330, y + 40);
    s += btn(20, yb, 110, '展开下一枝', { open: m.open + 1 }, !m.all, '展开下一枝');
    s += btn(136, yb, 90, '全部收起', { open: 0 }, m.open > 0, '全部收起');
    if (m.mode === 0) s += K.text(250, yb + 17, '几张卡片', { size: 12, weight: 700, anchor: 'start' }) + btn(310, yb, 26, '−', { m: m.m - 1, open: 0 }, m.m > (m.rep ? 2 : m.k), '少一张卡片') + K.text(352, yb + 17, String(m.m), { size: 14, weight: 700 }) + btn(368, yb, 26, '+', { m: m.m + 1, open: 0 }, m.m < (m.rep && m.k === 3 ? 4 : 5), '多一张卡片');
    else s += K.text(250, yb + 17, '凑几元', { size: 12, weight: 700, anchor: 'start' }) + btn(298, yb, 26, '−', { amt: m.amt - 1, open: 0 }, m.amt > 3, '少 1 元') + K.text(344, yb + 17, String(m.amt), { size: 14, weight: 700 }) + btn(364, yb, 26, '+', { amt: m.amt + 1, open: 0 }, m.amt < (m.set ? 50 : 20), '多 1 元');
    return s;
  }
  U.registerPack({
    id: 'treebench', version: 1,
    types: {
      treebench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E1', 'E2'],
        label: '枚举树', prefix: '树', group: '统计与概率', grades: [2, 6],
        alias: ['枚举', '树形图', '树状图', '有序枚举', '排数', '数字卡片', '凑钱', '不重不漏', '分类枚举', '搭配'],
        props: {
          mode: { type: 'choice', label: '玩什么', default: 0, choices: ['数字卡片排数', '凑钱'], write: true },
          m: { type: 'int', label: '几张卡片', default: 3, min: 2, max: 5, write: true },
          zero: { type: 'bool', label: '卡片里有 0', default: false, write: true },
          k: { type: 'int', label: '排几位数', default: 2, min: 2, max: 3, write: true },
          rep: { type: 'bool', label: '同一张可以重复用', default: false, write: true },
          cond: { type: 'choice', label: '只要', default: 0, choices: ['都要', '双数', '单数'], write: true },
          set: { type: 'choice', label: '用哪些钱', default: 0, choices: ['1、2、5 元', '1、5、10 元'], write: true },
          amt: { type: 'int', label: '凑几元', default: 10, min: 3, max: 50, write: true },
          open: { type: 'int', label: '展开了几枝', default: 0, min: 0, max: OMAX, write: true },
        },
        outputs: {
          rows: { dim: null, kind: 'num', label: '第一层有几枝' }, seen: { dim: null, kind: 'num', label: '已经列出几种' },
          count: { dim: null, kind: 'num', label: '一共几种（全部展开才有）' },
        },
        icon: () => K.line(8, 28, 26, 14, { w: 1.2 }) + K.line(8, 28, 26, 28, { w: 1.2 }) + K.line(8, 28, 26, 42, { w: 1.2 }) + [14, 28, 42].map((y) => K.line(26, y, 44, y - 5, { w: 1 }) + K.line(26, y, 44, y + 5, { w: 1 })).join(''),
        size: () => [W, 420],
        grips: () => [],
        compute: (c) => { const m = model(c.props), o = { rows: num(m.rows.length), seen: num(m.seen) }; if (m.all) o.count = num(m.count); return o; },
        badge: (c) => { const m = model(c.props); return m.all ? '一共 ' + m.count + ' 种' : ''; },
        draw,
      },
    },
  });
  U.TreeBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
