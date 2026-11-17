/* 器材包 tablebench：复式统计表。一张有行有列的表，学生一格一格点着数，最后自己说“数完了”；再加上每行、每列的合计看看对不对。
 * 全部在图上直接动手：
 *   - 点一个格子：圈起来（算进去）；再点一下：取消。上面写着已经圈了几格、加起来是多少。
 *   - 点“我数完了”：交出自己数的总数。漏了格子，表上把没圈的格子标红。
 *   - 点“每行合计”“每列合计”：表的右边和下面多出合计；右下角是总数。用两种合计对一对，两种加法得到的总数一样。
 * 这一版的边界（如实写）：最多 4 行 4 列，都是 0 到 99 的整数；只有一张表（没有条形图对照）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 640, X0 = 120, Y0 = 70, CW = 70, CH = 44;
  const on = (v) => v === true || v === 1;
  const parse = (t) => { const rows = String(t || '').split(';').map((r) => r.split(',').map((x) => Math.max(0, Math.min(99, parseInt(x, 10) || 0)))).slice(0, 4); const c = Math.min(4, Math.max(...rows.map((r) => r.length))); return rows.map((r) => Array.from({ length: c }, (_, j) => r[j] || 0)); };
  function model(p) {
    const g = parse(p.data), R = g.length, C = g[0].length, picked = String(p.picked || '').split(',').filter(Boolean).map(Number).filter((k) => k >= 0 && k < R * C);
    const set = new Set(picked), sum = picked.reduce((s, k) => s + g[Math.floor(k / C)][k % C], 0), total = g.flat().reduce((a, b) => a + b, 0);
    return { g, R, C, set, sum, total, all: set.size === R * C, done: on(p.done) };
  }
  const btn = (x, y, w, label, patch, active, tip) => '<g data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: active ? 'var(--blue)' : '#fff', stroke: 'var(--blue)', r: 8, w: 1.5 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: active ? '#fff' : 'var(--ink)' }) + '</g>';
  function draw(c) {
    const p = c.props, m = model(p), rn = String(p.rnames || '').split(/[,，]/), cn = String(p.cnames || '').split(/[,，]/), sr = on(p.rsum), sc = on(p.csum); let s = '';
    s += K.text(20, 26, '圈了 ' + m.set.size + ' / ' + m.R * m.C + ' 格，加起来是 ' + m.sum, { size: 15, weight: 700, anchor: 'start' });
    for (let j = 0; j < m.C; j++) s += K.text(X0 + j * CW + CW / 2, Y0 - 10, cn[j] || '第 ' + (j + 1) + ' 列', { size: 12, weight: 700 });
    for (let i = 0; i < m.R; i++) {
      s += K.text(X0 - 10, Y0 + i * CH + CH / 2 + 5, rn[i] || '第 ' + (i + 1) + ' 行', { size: 12, weight: 700, anchor: 'end' });
      for (let j = 0; j < m.C; j++) {
        const k = i * m.C + j, hit = m.set.has(k), miss = m.done && !hit, ids = hit ? [...m.set].filter((x) => x !== k) : [...m.set, k];
        s += '<g data-cell="' + k + '" data-pick-set="' + encodeURIComponent(JSON.stringify({ picked: ids.sort((a, b) => a - b).join(','), done: false })) + '" style="cursor:pointer"><title>' + (hit ? '取消' : '圈进去') + '</title>' +
          K.rect(X0 + j * CW, Y0 + i * CH, CW, CH, { fill: miss ? '#fde8e8' : hit ? '#fde9a8' : '#fff', stroke: miss ? 'var(--bad)' : 'var(--ink)', r: 0, w: miss ? 2 : 1.2 }) +
          (hit ? K.circle(X0 + j * CW + CW / 2, Y0 + i * CH + CH / 2, 15, { fill: 'none', stroke: '#c0392b', w: 2 }) : '') + K.text(X0 + j * CW + CW / 2, Y0 + i * CH + CH / 2 + 6, String(m.g[i][j]), { size: 17, weight: 700 }) + '</g>';
      }
      if (sr) s += K.rect(X0 + m.C * CW, Y0 + i * CH, CW, CH, { fill: '#e3ecf8', stroke: 'var(--ink)', r: 0, w: 1.2 }) + K.text(X0 + m.C * CW + CW / 2, Y0 + i * CH + CH / 2 + 6, String(m.g[i].reduce((a, b) => a + b, 0)), { size: 16, weight: 700, fill: 'var(--blue)' });
    }
    if (sr) s += K.text(X0 + m.C * CW + CW / 2, Y0 - 10, '合计', { size: 12, weight: 700, fill: 'var(--blue)' });
    if (sc) { s += K.text(X0 - 10, Y0 + m.R * CH + CH / 2 + 5, '合计', { size: 12, weight: 700, anchor: 'end', fill: 'var(--blue)' }); for (let j = 0; j < m.C; j++) s += K.rect(X0 + j * CW, Y0 + m.R * CH, CW, CH, { fill: '#e3ecf8', stroke: 'var(--ink)', r: 0, w: 1.2 }) + K.text(X0 + j * CW + CW / 2, Y0 + m.R * CH + CH / 2 + 6, String(m.g.reduce((a, r) => a + r[j], 0)), { size: 16, weight: 700, fill: 'var(--blue)' }); }
    if (sr && sc) s += '<g data-grand="1">' + K.rect(X0 + m.C * CW, Y0 + m.R * CH, CW, CH, { fill: '#cfe8d6', stroke: 'var(--ink)', r: 0, w: 1.6 }) + K.text(X0 + m.C * CW + CW / 2, Y0 + m.R * CH + CH / 2 + 6, String(m.total), { size: 17, weight: 700, fill: 'var(--good)' }) + '</g>';
    const by = Y0 + (m.R + 1) * CH + 22;
    s += btn(20, by, 100, '我数完了', { done: true }, m.done, '交出自己数的总数') + btn(130, by, 96, '每行合计', { rsum: !sr }, sr, '在右边加一列：每一行加起来') + btn(232, by, 96, '每列合计', { csum: !sc }, sc, '在下面加一行：每一列加起来');
    if (m.done) s += '<g data-msg="1">' + K.text(20, by + 50, m.all ? '你数的总数是 ' + m.sum + '：每一格都算进去了' : '你数的总数是 ' + m.sum + '：还有 ' + (m.R * m.C - m.set.size) + ' 格没圈（红色的），0 也是一格', { size: 13, weight: 700, anchor: 'start', fill: m.all ? 'var(--good)' : 'var(--bad)' }) + '</g>';
    if (sr && sc) s += K.text(20, by + 74, '先按行加：' + m.g.map((r) => r.reduce((a, b) => a + b, 0)).join(' + ') + ' = ' + m.total + '；先按列加：' + Array.from({ length: m.C }, (_, j) => m.g.reduce((a, r) => a + r[j], 0)).join(' + ') + ' = ' + m.total, { size: 12, anchor: 'start', fill: '#5a6478' });
    return s;
  }
  U.registerPack({
    id: 'tablebench', version: 1,
    types: {
      tablebench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E7', 'E2'],
        label: '复式统计表', prefix: '统计表', group: '统计与概率', grades: [2, 5],
        alias: ['复式统计表', '统计表', '合计', '总数', '行', '列'],
        props: {
          data: { type: 'text', label: '表里的数（每行一组，行之间用分号）', default: '3,2;1,4', write: true },
          rnames: { type: 'text', label: '每行叫什么（用逗号隔开）', default: '', write: true }, cnames: { type: 'text', label: '每列叫什么（用逗号隔开）', default: '', write: true },
          picked: { type: 'text', label: '圈了哪些格（自动）', default: '', write: true, hidden: true },
          done: { type: 'bool', label: '数完了', default: false, write: true }, rsum: { type: 'bool', label: '显示每行合计', default: false, write: true }, csum: { type: 'bool', label: '显示每列合计', default: false, write: true },
        },
        outputs: {
          sum: { dim: null, kind: 'num', label: '圈起来的格子加起来' }, answer: { dim: null, kind: 'num', label: '点“我数完了”时交出的总数' },
          all: { dim: null, kind: 'num', label: '每一格都圈了：1 是，0 否' }, total: { dim: null, kind: 'num', label: '表的总数（行合计和列合计都打开才有）' },
        },
        icon: () => K.rect(10, 10, 44, 28, { fill: '#fff', stroke: 'var(--ink)', w: 1.2, r: 1 }) + K.line(32, 10, 32, 38, { w: 1 }) + K.line(10, 24, 54, 24, { w: 1 }) + K.circle(21, 17, 5, { fill: 'none', stroke: '#a12a1f', w: 1.4 }),
        size: () => [W, 420],
        grips: () => [],
        compute: (c) => { const m = model(c.props), o = { sum: num(m.sum), all: num(m.all ? 1 : 0) }; if (m.done) o.answer = num(m.sum); if (on(c.props.rsum) && on(c.props.csum)) o.total = num(m.total); return o; },
        badge: () => '',
        draw,
      },
    },
  });
  U.TableBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
