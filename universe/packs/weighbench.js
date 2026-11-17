/* 器材包 weighbench：找次品（天平称）。n 个零件，有 1 个轻一点。
 *   点零件：不放 → 放左盘 → 放右盘 → 不放。两边个数一样多才能点“称一下”。
 *   天平按“最不利”的情况回答：哪种结果剩下的可疑零件最多，就给哪种（所以称的次数是“保证能找出来”的次数，不靠运气）。
 *   称完：平了，次品在没上秤的里面；哪边翘起来（轻），次品就在哪边。不可能是次品的零件变灰。只剩 1 个可疑的，就找到了。
 *   找到以后写出称了几次，和“保证找出来最少要称几次”比（3 个一组：每次把可疑的平均分成 3 份）。
 * 这一版的边界（如实写）：最多 27 个；次品只会轻。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const minW = (n) => { let k = 0, c = 1; while (c < n) { c *= 3; k++; } return k; };
  // 按历史一步步算出还可疑的零件（天平按最不利的结果回答）
  function replay(n, hist) {
    let cand = Array.from({ length: n }, (_, i) => i); const res = [];
    for (const h of hist) {
      const L = cand.filter((i) => h[i] === '1'), R = cand.filter((i) => h[i] === '2'), O = cand.filter((i) => h[i] !== '1' && h[i] !== '2');
      const opts = [['平', O], ['左边轻（左盘翘起）', L], ['右边轻（右盘翘起）', R]].sort((a, b) => b[1].length - a[1].length);
      const pick = opts[0]; cand = pick[1]; res.push({ say: pick[0], left: L.length, right: R.length, cand: cand.length });
    }
    return { cand, res };
  }
  function model(p) {
    const n = clamp(p.n, 2, 27), pan = String(p.pan || '').padEnd(n, '0').slice(0, n), hist = String(p.hist || '').split(';').filter((h) => h.length === n);
    const { cand, res } = replay(n, hist), nl = [...pan].filter((x) => x === '1').length, nr = [...pan].filter((x) => x === '2').length;
    return { n, pan, hist, cand, res, nl, nr, found: cand.length === 1, best: minW(n) };
  }
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  function draw(c) {
    const p = c.props, m = model(p); let s = '';
    s += K.text(20, 26, m.n + ' 个零件里有 1 个轻一点。用天平称，找出它', { size: 16, weight: 700, anchor: 'start' });
    // 天平
    const last = m.res[m.res.length - 1], tilt = !last ? 0 : last.say.startsWith('左') ? -1 : last.say.startsWith('右') ? 1 : 0;
    s += K.line(350, 150, 350, 82, { w: 3 }) + '<g transform="rotate(' + tilt * -8 + ' 350 82)">' + K.line(210, 82, 490, 82, { w: 3 }) + K.rect(170, 92, 80, 10, { fill: '#c9d3e3', stroke: 'var(--ink)', r: 3, w: 1 }) + K.rect(450, 92, 80, 10, { fill: '#c9d3e3', stroke: 'var(--ink)', r: 3, w: 1 }) + K.text(210, 120, '左 ' + m.nl + ' 个', { size: 12, weight: 700 }) + K.text(490, 120, '右 ' + m.nr + ' 个', { size: 12, weight: 700 }) + '</g>' + K.rect(320, 150, 60, 8, { fill: 'var(--ink)', r: 2 });
    // 零件
    for (let i = 0; i < m.n; i++) {
      const x = 30 + (i % 14) * 46, y = 180 + Math.floor(i / 14) * 50, susp = m.cand.includes(i), at = m.pan[i];
      const col = !susp ? '#e3e7ef' : at === '1' ? '#9fc3ea' : at === '2' ? '#f5c26b' : '#fff';
      const body = K.rect(x, y, 40, 40, { fill: col, stroke: susp ? '#3a4a63' : '#c5ccda', r: 6, w: 1.2 }) + K.text(x + 20, y + 18, String(i + 1), { size: 12, weight: 700, fill: susp ? 'var(--ink)' : '#a0a8b8' }) + K.text(x + 20, y + 33, at === '1' ? '左' : at === '2' ? '右' : '', { size: 10, weight: 700 });
      const next = at === '1' ? '2' : at === '2' ? '0' : '1';
      s += m.found ? body : '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ pan: m.pan.slice(0, i) + next + m.pan.slice(i + 1) })) + '" style="cursor:pointer"><title>零件 ' + (i + 1) + '</title>' + body + '</g>';
    }
    const ok = m.nl > 0 && m.nl === m.nr;
    s += btn(30, 290, 110, '称一下', { hist: m.hist.concat([m.pan]).join(';'), pan: '' }, ok && !m.found, ok ? '看天平往哪边偏' : '两边要放一样多');
    s += btn(150, 290, 90, '重来', { hist: '', pan: '' }, m.hist.length > 0 || m.pan.includes('1') || m.pan.includes('2'), '从头再称');
    if (!ok && (m.nl || m.nr)) s += K.text(250, 307, '两边个数要一样多', { size: 12, weight: 700, anchor: 'start', fill: 'var(--bad)' });
    s += K.text(30, 344, m.res.length ? m.res.map((r, i) => '第 ' + (i + 1) + ' 次：' + r.left + ' 对 ' + r.right + '，' + r.say + '，还剩 ' + r.cand + ' 个可疑').join('；') : '还没称；可疑的有 ' + m.n + ' 个', { size: 12, anchor: 'start' });
    if (m.found) s += '<g data-read="1">' + K.text(30, 372, '找到了：零件 ' + (m.cand[0] + 1) + '。称了 ' + m.hist.length + ' 次' + (m.hist.length === m.best ? '，最少就是 ' + m.best + ' 次（每次分成差不多的 3 份）' : '；最少 ' + m.best + ' 次就能保证找出来'), { size: 14, weight: 700, anchor: 'start', fill: m.hist.length === m.best ? 'var(--blue)' : 'var(--bad)' }) + '</g>';
    return s;
  }
  U.registerPack({
    id: 'weighbench', version: 1,
    types: {
      weighbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E7', 'E2'],
        label: '找次品（天平）', prefix: '找次品', group: '关系', grades: [5, 5],
        alias: ['找次品', '天平', '称', '轻一点', '最少称几次', '最不利', '分三份'],
        props: {
          n: { type: 'int', label: '几个零件', default: 9, min: 2, max: 27, write: true },
          pan: { type: 'text', label: '这一次放在哪（自动）', default: '', write: true }, hist: { type: 'text', label: '称过的（自动）', default: '', write: true },
        },
        outputs: {
          weighs: { dim: null, kind: 'num', label: '称了几次' }, left: { dim: null, kind: 'num', label: '还剩几个可疑' }, found: { dim: null, kind: 'num', label: '找到了：1（找到才有）' }, best: { dim: null, kind: 'num', label: '用最少的次数找到：1（做到了才有）' },
        },
        icon: () => K.line(28, 38, 28, 14, { w: 2 }) + K.line(8, 14, 48, 14, { w: 2 }) + K.rect(4, 16, 14, 4, { fill: '#9fc3ea', stroke: 'var(--ink)', r: 1, w: 1 }) + K.rect(38, 16, 14, 4, { fill: '#f5c26b', stroke: 'var(--ink)', r: 1, w: 1 }),
        size: () => [W, 400],
        grips: () => [],
        compute: (c) => { const m = model(c.props), o = { weighs: num(m.hist.length), left: num(m.cand.length) }; if (m.found) { o.found = num(1); if (m.hist.length === m.best) o.best = num(1); } return o; },
        badge: () => '',
        draw,
      },
    },
  });
  U.WeighBench = { model, minW };
})(typeof globalThis !== 'undefined' ? globalThis : window);
