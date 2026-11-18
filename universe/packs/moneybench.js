/* 器材包 moneybench：钱币（人民币：1 角、5 角、1 元、5 元、10 元、20 元、50 元）。
 *   - 付钱：上面是钱包，点一张就放进下面的盘子，点盘子里的就拿回来。盘子里一共多少写成“几元几角”和小数“几元”。
 *     题目给了价钱的，付够了说“正好”还是“多付了几元几角”。
 *   - 找零：顾客先付了一张大钱。店员从价钱往上数：点钱包里的钱一张一张“数上去”，数到顾客付的钱为止，数上去的就是找的零钱。
 *   - 换钱：1 元可以换 10 个 1 角，10 个 1 角换 1 元，按钮在钱包旁边。
 * 钱全部按“角”精确计算。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const yuan = (j) => U.val('num', Q(j, 10), { dim: null });
  const W = 700;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const MODES = ['付钱', '找零'];
  const DEN = [1, 5, 10, 50, 100, 200, 500];   // 角
  const NAME = ['1 角', '5 角', '1 元', '5 元', '10 元', '20 元', '50 元'];
  const COL = ['#d8c08a', '#e7c46b', '#9fd5ad', '#c9a0dc', '#7fb0e8', '#a3d39c', '#9ec6c2'];
  const show = (j) => { const y = Math.floor(j / 10), a = j % 10; return (y ? y + ' 元' : '') + (a ? (y ? ' ' : '') + a + ' 角' : '') || '0 元'; };
  const dec = (j) => (j % 10 ? (j / 10).toFixed(1) : String(j / 10)) + ' 元';
  const counts = (t) => { const c = String(t || '').split(',').map(Number); return DEN.map((_, i) => clamp(c[i] || 0, 0, 20)); };
  function model(p) {
    const mode = clamp(p.mode, 0, 1), price = clamp(p.price, 0, 1000), paid = clamp(p.paid, 0, 1000), tray = counts(p.tray), wallet = p.wallet === undefined || p.wallet === '' ? DEN.map(() => 20) : counts(p.wallet);
    const total = tray.reduce((s, n, i) => s + n * DEN[i], 0), pieces = tray.reduce((s, n) => s + n, 0);
    // 最少张数：人民币的面额从大往小拿就是最少（1、5、10、50 角……这套面额贪心就是最优）
    let rest = price, fewest = 0; for (let i = DEN.length - 1; i >= 0; i--) { fewest += Math.floor(rest / DEN[i]); rest %= DEN[i]; }
    return { mode, price, paid, tray, wallet, total, pieces, fewest };
  }
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const piece = (x, y, i) => (DEN[i] < 10 || DEN[i] === 10 ? K.circle(x + 22, y + 15, 15, { fill: COL[i], stroke: '#5a4a10', w: 1.2 }) : K.rect(x, y, 46, 30, { fill: COL[i], stroke: '#3a4a63', r: 3, w: 1.2 })) + K.text(x + 22, y + 19, NAME[i], { size: 10, weight: 700 });
  function draw(c) {
    const p = c.props, m = model(p); let s = '';
    const enc = (tray) => tray.join(',');
    s += K.text(20, 26, m.mode === 0 ? (m.price ? '要付 ' + show(m.price) + '（' + dec(m.price) + '）' : '摆一摆：盘子里一共多少钱？') : '东西 ' + show(m.price) + '，顾客付了 ' + show(m.paid) + '：找多少？', { size: 16, weight: 700, anchor: 'start' });
    s += K.text(20, 54, m.mode === 0 ? '钱包：点一张放进盘子' : '从 ' + dec(m.price) + ' 往上数：点一张“数上去”', { size: 12, anchor: 'start', fill: '#5a6478' });
    DEN.forEach((d, i) => { const x = 20 + i * 70, y = 64; const t = m.tray.slice(); t[i]++; s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ tray: enc(t) })) + '" style="cursor:pointer"><title>放一张 ' + NAME[i] + '</title>' + piece(x, y, i) + '</g>'; });
    const t1 = m.tray.slice(); const canBreak = t1[2] > 0, canJoin = t1[0] >= 10;
    if (canBreak) { t1[2]--; t1[0] += 10; }
    s += btn(510, 64, 170, '盘子里 1 元换 10 个 1 角', { tray: enc(t1) }, canBreak && m.tray[0] <= 10, '把盘子里的一个 1 元换成 10 个 1 角');
    const t2 = m.tray.slice(); if (canJoin) { t2[0] -= 10; t2[2]++; }
    s += btn(510, 96, 170, '10 个 1 角换 1 元', { tray: enc(t2) }, canJoin, '把 10 个 1 角换成 1 个 1 元');
    // 盘子
    s += K.rect(20, 140, 660, 150, { fill: '#f6f8fc', stroke: '#c5ccda', r: 10, w: 1.2 }) + K.text(36, 160, m.mode === 0 ? '盘子' : '数上去的钱（找给顾客）', { size: 12, weight: 700, anchor: 'start', fill: '#5a6478' });
    let x = 36, y = 172;
    DEN.forEach((d, i) => { for (let k = 0; k < m.tray[i]; k++) { const t = m.tray.slice(); t[i]--; s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ tray: enc(t) })) + '" style="cursor:pointer"><title>拿回一张 ' + NAME[i] + '</title>' + piece(x, y, i) + '</g>'; x += 52; if (x > 630) { x = 36; y += 36; } } });
    if (m.mode === 0) {
      s += '<g data-read="1">' + K.text(20, 320, '盘子里一共：' + show(m.total) + ' = ' + dec(m.total), { size: 16, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
      if (m.price) s += K.text(20, 346, m.total === m.price ? '正好！用了 ' + m.pieces + ' 张' + (m.pieces === m.fewest ? '：最少就是 ' + m.fewest + ' 张' : '，最少只要 ' + m.fewest + ' 张（大面额先用）') : m.total < m.price ? '还差 ' + show(m.price - m.total) : '多付了 ' + show(m.total - m.price), { size: 14, weight: 700, anchor: 'start', fill: m.total === m.price ? 'var(--blue)' : 'var(--bad)' });
    } else {
      const at = m.price + m.total;
      s += '<g data-read="1">' + K.text(20, 320, '数到了 ' + dec(at) + (at === m.paid ? '：正好数到顾客付的 ' + dec(m.paid) : at < m.paid ? '，还没数到 ' + dec(m.paid) : '，数过头了'), { size: 15, weight: 700, anchor: 'start', fill: at === m.paid ? 'var(--blue)' : at < m.paid ? 'var(--ink)' : 'var(--bad)' }) + (at === m.paid ? K.text(20, 346, '找零 ' + show(m.total) + '：' + dec(m.paid) + ' − ' + dec(m.price) + ' = ' + dec(m.total), { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) : '') + '</g>';
    }
    return s;
  }
  U.registerPack({
    id: 'moneybench', version: 1,
    types: {
      moneybench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E3', 'E2'],
        label: '钱币', prefix: '钱币', group: '数与运算', grades: [1, 4],
        alias: ['人民币', '元角分', '钱', '付钱', '找零', '换钱', '几元几角', '小数'],
        props: {
          mode: { type: 'choice', label: '做什么', default: 0, choices: MODES, write: true },
          price: { type: 'int', label: '价钱（角）', default: 0, min: 0, max: 1000, write: true }, paid: { type: 'int', label: '找零：顾客付了（角）', default: 0, min: 0, max: 1000, write: true },
          tray: { type: 'text', label: '盘子里每种钱各几张（1 角、5 角、1 元、5 元、10 元、20 元、50 元）', default: '', write: true }, wallet: { type: 'text', label: '（备用）', default: '', write: true, hidden: true },
        },
        outputs: {
          total: { dim: null, kind: 'num', label: '盘子里一共几元' }, exact: { dim: null, kind: 'num', label: '付钱：正好付够 1（正好才有）' }, fewest: { dim: null, kind: 'num', label: '付钱：正好而且张数最少 1' }, change: { dim: null, kind: 'num', label: '找零：找几元（正好数到才有）' },
        },
        icon: () => K.rect(6, 12, 30, 18, { fill: '#7fb0e8', stroke: 'var(--ink)', r: 2, w: 1 }) + K.circle(44, 30, 9, { fill: '#e7c46b', stroke: 'var(--ink)', w: 1 }) + K.text(21, 25, '10', { size: 9, weight: 700 }),
        size: () => [W, 400],
        grips: () => [],
        compute: (c) => {
          const m = model(c.props), o = { total: yuan(m.total) };
          if (m.mode === 0 && m.price && m.total === m.price) { o.exact = U.val('num', Q(1), { dim: null }); if (m.pieces === m.fewest) o.fewest = U.val('num', Q(1), { dim: null }); }
          if (m.mode === 1 && m.price + m.total === m.paid && m.total > 0) o.change = yuan(m.total);
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.MoneyBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
