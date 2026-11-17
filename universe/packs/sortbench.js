/* 器材包 sortbench：分类与整理（一年级）。
 *   上面一堆卡片（红、黄、蓝的圆、方块、三角）。先选“按颜色分”还是“按形状分”，下面出现几个框。
 *   点一张卡片（选中），再点一个框，把它放进去；放错了（不是这一类）不让放，说为什么。
 *   全部放完，每个框写出几个，下面写出“一共几个”，和原来的总数核对：对上了就是没有漏、没有重。
 *   换一种分法要重新分（同一堆东西，分法不同，每一类的个数也不同，但总数不变）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700;
  const COLORS = [['红', '#e87a6b'], ['黄', '#f5c542'], ['蓝', '#6fa3e0']], SHAPES = ['圆', '方', '三角'];
  const CRIT = ['按颜色分', '按形状分'];
  // items: “颜色编号形状编号”，比如 "00,01,20"
  function model(p) {
    const items = String(p.items || '').split(',').filter((x) => /^\d\d$/.test(x)).slice(0, 16).map((x) => ({ c: +x[0] % 3, s: +x[1] % 3 }));
    const crit = +p.crit === 1 ? 1 : 0, place = String(p.place || '').padEnd(items.length, '-').slice(0, items.length);
    const key = (it) => (crit === 0 ? it.c : it.s), cats = [...new Set(items.map(key))].sort();
    const counts = cats.map((k) => [...place].filter((x, i) => x === String(k)).length), all = items.length > 0 && [...place].every((x) => x !== '-');
    const sel = Number.isInteger(+p.sel) && +p.sel >= 0 && +p.sel < items.length ? +p.sel : -1;
    return { items, crit, place, key, cats, counts, all, sel, total: counts.reduce((s, x) => s + x, 0) };
  }
  const shape = (x, y, it, r) => { const col = COLORS[it.c][1]; return it.s === 0 ? K.circle(x, y, r, { fill: col, stroke: '#3a4a63', w: 1.2 }) : it.s === 1 ? K.rect(x - r, y - r, 2 * r, 2 * r, { fill: col, stroke: '#3a4a63', r: 2, w: 1.2 }) : '<polygon points="' + [x, y - r, x + r, y + r * 0.8, x - r, y + r * 0.8].join(',') + '" fill="' + col + '" stroke="#3a4a63" stroke-width="1.2"/>'; };
  const btn = (x, y, w, label, patch, enabled, tip, active) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: active ? 'var(--blue)' : enabled ? '#fff' : '#f1f3f6', stroke: enabled || active ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: active ? '#fff' : enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const pick = (patch, tip, inner) => '<g data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"><title>' + K.esc(tip) + '</title>' + inner + '</g>';
  function draw(c) {
    const p = c.props, m = model(p); let s = '';
    s += K.text(20, 26, '一共 ' + m.items.length + ' 张卡片：分一分，数一数', { size: 16, weight: 700, anchor: 'start' });
    CRIT.forEach((t, i) => { s += btn(420 + i * 130, 10, 122, t, { crit: i, place: '', sel: -1, msg: '' }, m.crit !== i, '换一种分法（要重新分）', m.crit === i); });
    const catName = (k) => (m.crit === 0 ? COLORS[k][0] + '色' : SHAPES[k]);
    // 还没分的卡片
    m.items.forEach((it, i) => {
      if (m.place[i] !== '-') return;
      const x = 40 + (i % 12) * 52, y = 70 + Math.floor(i / 12) * 52, on = m.sel === i;
      const body = (on ? K.rect(x - 22, y - 22, 44, 44, { fill: 'none', stroke: 'var(--blue)', r: 6, w: 3 }) : '') + shape(x, y, it, 16);
      s += pick({ sel: on ? -1 : i, msg: '' }, '卡片 ' + (i + 1) + '：' + COLORS[it.c][0] + '色的' + SHAPES[it.s], body);
    });
    // 框
    const bw = Math.min(200, (660 - 20 * (m.cats.length - 1)) / m.cats.length);
    m.cats.forEach((k, j) => {
      const x = 20 + j * (bw + 20), y = 150, inside = m.items.map((it, i) => [it, i]).filter(([, i]) => m.place[i] === String(k));
      let body = K.rect(x, y, bw, 150, { fill: '#f6f8fc', stroke: '#8a94a6', r: 10, w: 1.4 }) + K.text(x + bw / 2, y + 20, catName(k) + '：' + inside.length + ' 个', { size: 13, weight: 700 });
      inside.forEach(([it], t) => { body += shape(x + 22 + (t % 5) * 34, y + 50 + Math.floor(t / 5) * 34, it, 12); });
      if (m.sel >= 0) {
        const it = m.items[m.sel], ok = m.key(it) === k;
        body = pick(ok ? { place: m.place.slice(0, m.sel) + k + m.place.slice(m.sel + 1), sel: -1, msg: '' } : { msg: '这张是' + (m.crit === 0 ? COLORS[it.c][0] + '色的' : SHAPES[it.s]) + '，不能放进“' + catName(k) + '”', sel: m.sel }, '放进“' + catName(k) + '”', body);
      }
      s += body;
    });
    if (p.msg) s += K.text(20, 324, p.msg, { size: 13, weight: 700, anchor: 'start', fill: 'var(--bad)' });
    else if (m.sel >= 0) s += K.text(20, 324, '再点一个框，把它放进去', { size: 12, anchor: 'start', fill: '#5a6478' });
    if (m.all) s += '<g data-read="1">' + K.text(20, 352, m.cats.map((k, j) => catName(k) + ' ' + m.counts[j]).join(' + ') + ' = ' + m.total + ' 个', { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(20, 376, m.total === m.items.length ? '和总数 ' + m.items.length + ' 一样：没有漏，也没有重' : '和总数对不上', { size: 13, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    s += btn(580, 340, 100, '全部拿出来', { place: '', sel: -1, msg: '' }, [...m.place].some((x) => x !== '-'), '重新分');
    return s;
  }
  U.registerPack({
    id: 'sortbench', version: 1,
    types: {
      sortbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E1', 'E2'],
        label: '分类与整理', prefix: '分类', group: '统计与概率', grades: [1, 2],
        alias: ['分类', '整理', '按颜色分', '按形状分', '数一数', '分类计数'],
        props: {
          items: { type: 'text', label: '卡片（颜色编号形状编号，逗号分开）', default: '00,01,20,11,02,21', write: true },
          crit: { type: 'choice', label: '怎么分', default: 0, choices: CRIT, write: true },
          place: { type: 'text', label: '每张放在哪一类（自动）', default: '', write: true }, sel: { type: 'int', label: '选中的卡片（自动）', default: -1, min: -1, max: 15, write: true },
          msg: { type: 'text', label: '提示（自动）', default: '', write: true, hidden: true },
        },
        outputs: {
          total: { dim: null, kind: 'num', label: '分完以后加起来一共几个（分完才有）' }, cats: { dim: null, kind: 'num', label: '分成了几类' }, check: { dim: null, kind: 'num', label: '和总数对上了：1（分完才有）' },
        },
        icon: () => K.circle(14, 20, 7, { fill: '#e87a6b', stroke: 'var(--ink)', w: 1 }) + K.rect(28, 13, 14, 14, { fill: '#6fa3e0', stroke: 'var(--ink)', r: 1, w: 1 }) + K.rect(6, 32, 46, 10, { fill: '#f6f8fc', stroke: 'var(--ink)', r: 2, w: 1 }),
        size: () => [W, 400],
        grips: () => [],
        compute: (c) => { const m = model(c.props), o = { cats: num(m.cats.length) }; if (m.all) { o.total = num(m.total); if (m.total === m.items.length) o.check = num(1); } return o; },
        badge: () => '',
        draw,
      },
    },
  });
  U.SortBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
