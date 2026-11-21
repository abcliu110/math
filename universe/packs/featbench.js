/* 器材包 featbench：数的特征（2、3、5、9 的倍数，奇数和偶数）。
 *   - 拼数（mode 0）：一排数字卡片，点卡片放进空位，拼成一个数（tpl 里写好的数字不能动，? 是空位）。
 *     拼满了就写出：个位是几（看 2、5）、各位数字加起来是几（看 3、9），每个条件打 ✓ 或 ✗，并写出为什么：
 *     比如 432 = 4 × 99 + 3 × 9 + (4 + 3 + 2)：前两块一定是 9 的倍数，所以只看数字和。
 *     题目可以要“随便拼一个”“最大的”“最小的”“全部找出来”（点“记下这个”）。卡片可以设成只能用一次，或者随便用（填数字）。
 *   - 奇偶（mode 1）：两个数画成两排点子，两个两个配成对；点“合起来”：两个数的点放在一起重新配对，落单的点一眼看得出。
 *     换不同的数多试几次，表里记下“奇 + 奇 = 偶”这样的结果。
 * 这一版的边界（如实写）：最多 4 位数；奇偶只做加法，两个数都不超过 15。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 680;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const CONDS = [
    ['2 的倍数', (n) => n % 2 === 0], ['3 的倍数', (n) => n % 3 === 0], ['5 的倍数', (n) => n % 5 === 0], ['9 的倍数', (n) => n % 9 === 0],
    ['2 和 5 的公倍数', (n) => n % 10 === 0], ['2 和 3 的公倍数', (n) => n % 6 === 0], ['2、3、5 的公倍数', (n) => n % 30 === 0],
    ['奇数', (n) => n % 2 === 1], ['偶数', (n) => n % 2 === 0],
  ];
  const GOALS = ['拼一个', '最大的', '最小的', '全部找出来'];
  const list = (t) => String(t || '').split(',');
  function model(p) {
    const cards = String(p.cards || '2,3,5,0').split(',').filter((x) => /^\d$/.test(x)).map(Number).slice(0, 10);
    const tpl = (String(p.tpl || '???').replace(/[^0-9?]/g, '') || '???').slice(0, 4), holes = [...tpl].map((ch, i) => (ch === '?' ? i : -1)).filter((i) => i >= 0);
    const reuse = !!p.reuse, cond = clamp(p.cond, 0, CONDS.length - 1), gk = clamp(p.gk, 0, 3);
    const raw = list(p.pick).slice(0, holes.length); while (raw.length < holes.length) raw.push('');
    const pick = []; const used = new Set();
    raw.forEach((x) => { const i = x === '' ? -1 : +x; if (i >= 0 && i < cards.length && (reuse || !used.has(i))) { pick.push(i); used.add(i); } else pick.push(-1); });
    const digits = [...tpl].map((ch, i) => (ch === '?' ? (pick[holes.indexOf(i)] >= 0 ? cards[pick[holes.indexOf(i)]] : null) : +ch));
    const full = digits.every((d) => d !== null), lead0 = full && digits.length > 1 && digits[0] === 0;
    const n = full && !lead0 ? +digits.join('') : null;
    // 所有能拼出来、符合条件的数
    const valid = new Set();
    const rec = (k, usedSet, ds) => {
      if (k === holes.length) { const d = [...tpl].map((ch, i) => (ch === '?' ? ds[holes.indexOf(i)] : +ch)); if (d.length > 1 && d[0] === 0) return; const v = +d.join(''); if (CONDS[cond][1](v)) valid.add(v); return; }
      cards.forEach((c, i) => { if (!reuse && usedSet.has(i)) return; const s2 = new Set(usedSet); s2.add(i); rec(k + 1, s2, ds.concat([c])); });
    };
    rec(0, new Set(), []);
    const vs = [...valid].sort((a, b) => a - b);
    const found = [...new Set(list(p.found).filter((x) => /^\d+$/.test(x)).map(Number))].filter((v) => valid.has(v)).sort((a, b) => a - b);
    const ok = n !== null ? CONDS[cond][1](n) : null;
    return { cards, tpl, holes, reuse, cond, gk, pick, used, digits, full, lead0, n, vs, found, ok, max: vs[vs.length - 1], min: vs[0] };
  }
  function parityModel(p) {
    const a = clamp(p.a, 1, 15), b = clamp(p.b, 1, 15), joined = !!p.joined;
    const tried = list(p.tried).filter((x) => /^\d+\+\d+$/.test(x)).map((x) => x.split('+').map(Number));
    const oo = new Set(tried.filter(([x, y]) => x % 2 && y % 2).map((t) => t.join('+'))).size;
    return { a, b, joined, tried, oo, sum: a + b };
  }
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const PW = { 1: '', 10: '9', 100: '99', 1000: '999' };
  function drawCards(c) {
    const p = c.props, m = model(p); let s = '';
    const want = CONDS[m.cond][0], what = m.gk === 1 ? '最大的' : m.gk === 2 ? '最小的' : m.gk === 3 ? '所有的' : '一个';
    s += K.text(20, 28, '拼出' + what + '“' + want + '”' + (m.reuse ? '（数字可以重复用）' : '（每张卡片只能用一次）'), { size: 16, weight: 700, anchor: 'start' });
    // 空位
    const X0 = 40, SW = 62;
    [...m.tpl].forEach((ch, i) => {
      const x = X0 + i * (SW + 8), hole = ch === '?', d = m.digits[i], k = m.holes.indexOf(i);
      const body = K.rect(x, 50, SW, 70, { fill: hole ? (d === null ? '#fff' : '#fff4d6') : '#eef1f6', stroke: hole ? 'var(--blue)' : '#b8c0cc', r: 8, w: hole ? 2 : 1.2 }) + K.text(x + SW / 2, 98, d === null ? '' : String(d), { size: 34, weight: 700 });
      if (hole && d !== null) { const np = m.pick.slice(); np[k] = -1; s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ pick: np.map((v) => (v < 0 ? '' : v)).join(','), msg: '' })) + '" style="cursor:pointer"><title>拿下第 ' + (i + 1) + ' 位</title>' + body + '</g>'; } else s += body;
    });
    // 卡片
    const first = m.pick.indexOf(-1);
    m.cards.forEach((d, i) => {
      const x = 40 + i * 52, y = 150, can = first >= 0 && (m.reuse || !m.used.has(i)), np = m.pick.slice(); if (first >= 0) np[first] = i;
      const body = K.rect(x, y, 44, 52, { fill: can ? '#fff' : '#eef1f6', stroke: can ? '#8a5a00' : '#c5ccda', r: 6, w: 1.6 }) + K.text(x + 22, y + 35, String(d), { size: 24, weight: 700, fill: can ? 'var(--ink)' : '#a0a8b8' });
      s += can ? '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ pick: np.map((v) => (v < 0 ? '' : v)).join(','), msg: '' })) + '" style="cursor:pointer"><title>卡片 ' + d + '</title>' + body + '</g>' : body;
    });
    // 看特征
    const RX = 336; let y = 58;
    if (m.lead0) s += K.text(RX, y, '最高位不能是 0', { size: 14, weight: 700, anchor: 'start', fill: 'var(--bad)' });
    else if (m.n !== null) {
      const ds = m.digits, last = ds[ds.length - 1], sum = ds.reduce((a, b) => a + b, 0);
      const tick = (b) => (b ? ' ✓' : ' ✗');
      s += K.text(RX, y, '个位是 ' + last + '：2 的倍数' + tick(last % 2 === 0) + '，5 的倍数' + tick(last % 5 === 0), { size: 13, anchor: 'start' });
      y += 22; s += K.text(RX, y, '数字和 ' + ds.join(' + ') + ' = ' + sum + '：3 的倍数' + tick(sum % 3 === 0) + '，9 的倍数' + tick(sum % 9 === 0), { size: 13, anchor: 'start' });
      if (ds.length > 1) {
        const parts = ds.slice(0, -1).map((d, i) => d + ' × ' + PW[Math.pow(10, ds.length - 1 - i)]).join(' + ');
        y += 22; s += '<g data-why="1">' + K.text(RX, y, m.n + ' = ' + parts + ' + (' + ds.join(' + ') + ')', { size: 12, anchor: 'start', fill: '#3a4a63' }) + '</g>';
        y += 18; s += K.text(RX, y, '前面几块都是 9 的倍数，所以只看数字和', { size: 11, anchor: 'start', fill: '#5a6478' });
      }
      y += 22; s += '<g data-read="1">' + K.text(RX, y, m.n + (m.ok ? ' 是 ' : ' 不是 ') + want + (m.ok && m.gk === 1 ? (m.n === m.max ? '，而且是最大的！' : '，但还有更大的') : m.ok && m.gk === 2 ? (m.n === m.min ? '，而且是最小的！' : '，但还有更小的') : ''), { size: 15, weight: 700, anchor: 'start', fill: m.ok ? 'var(--blue)' : 'var(--bad)' }) + '</g>';
    } else s += K.text(RX, y, '点卡片放进空位；点空位里的数字拿下来', { size: 13, anchor: 'start', fill: '#5a6478' });
    // 找全
    if (m.gk === 3) {
      const can = m.ok && !m.found.includes(m.n);
      s += btn(40, 220, 92, '记下这个', can ? { found: m.found.concat([m.n]).join(','), pick: '', msg: '' } : { msg: m.n === null ? '先拼满' : !m.ok ? m.n + ' 不是 ' + want : '已经记过了' }, true, '记下这个数');
      s += K.text(40, 270, '找到 ' + m.found.length + ' 个：' + (m.found.join('、') || '还没有'), { size: 14, weight: 700, anchor: 'start' });
      if (m.found.length === m.vs.length) s += '<g data-all="1">' + K.text(40, 292, '找全了：一共 ' + m.vs.length + ' 个', { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    }
    s += btn(m.gk === 3 ? 140 : 40, 220, 70, '清空', { pick: '', msg: '' }, m.pick.some((v) => v >= 0), '把空位都清空');
    if (p.msg) s += K.text(40, 330, p.msg, { size: 13, weight: 700, anchor: 'start', fill: 'var(--bad)' });
    return s;
  }
  function dots(x, y, n, col) {
    let s = ''; for (let i = 0; i < n; i++) { const cx = x + Math.floor(i / 2) * 22, cy = y + (i % 2) * 22; s += K.circle(cx, cy, 8, { fill: col, stroke: 'var(--ink)', w: 1 }); }
    if (n % 2) { const cx = x + Math.floor((n - 1) / 2) * 22; s += K.circle(cx, y, 12, { fill: 'none', stroke: 'var(--bad)', w: 2 }); }
    return s;
  }
  const par = (n) => (n % 2 ? '奇' : '偶');
  function drawParity(c) {
    const p = c.props, m = parityModel(p); let s = '';
    s += K.text(20, 28, '两个两个配成对：有没有落单的？', { size: 16, weight: 700, anchor: 'start' });
    const row = (y, n, col, key, name) => K.text(20, y + 15, name + ' ' + n, { size: 14, weight: 700, anchor: 'start' }) + dots(90, y, n, col) +
      btn(470, y - 2, 30, '−', { [key]: n - 1, joined: false }, n > 1, name + '少 1') + btn(506, y - 2, 30, '+', { [key]: n + 1, joined: false }, n < 15, name + '多 1') + K.text(548, y + 15, par(n) + '数', { size: 13, weight: 700, anchor: 'start', fill: n % 2 ? 'var(--bad)' : 'var(--blue)' });
    s += row(56, m.a, '#f5c26b', 'a', '甲') + row(116, m.b, '#9fc3ea', 'b', '乙');
    const key = m.a + '+' + m.b, tried = m.tried.some(([x, y]) => x === m.a && y === m.b);
    s += btn(20, 176, 100, '合起来', { joined: true, tried: tried ? m.tried.map((t) => t.join('+')).join(',') : m.tried.map((t) => t.join('+')).concat([key]).join(',') }, !m.joined, '两排点子放在一起重新配对');
    if (m.joined) {
      let t = ''; for (let i = 0; i < m.sum; i++) { const cx = 90 + Math.floor(i / 2) * 18, cy = 220 + (i % 2) * 18; t += K.circle(cx, cy, 7, { fill: i < m.a ? '#f5c26b' : '#9fc3ea', stroke: 'var(--ink)', w: 1 }); }
      if (m.sum % 2) t += K.circle(90 + Math.floor((m.sum - 1) / 2) * 18, 220, 11, { fill: 'none', stroke: 'var(--bad)', w: 2 });
      s += K.text(20, 236, '合起来 ' + m.sum, { size: 14, weight: 700, anchor: 'start' }) + t;
      s += '<g data-read="1">' + K.text(20, 290, m.a + ' + ' + m.b + ' = ' + m.sum + '：' + par(m.a) + ' + ' + par(m.b) + ' = ' + par(m.sum) + (m.a % 2 && m.b % 2 ? '（两个落单的点正好配成一对）' : ''), { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    }
    if (m.tried.length) {
      s += K.text(470, 186, '试过的', { size: 12, weight: 700, anchor: 'start' });
      m.tried.slice(-7).forEach(([x, y], i) => { s += K.text(470, 206 + i * 17, x + ' + ' + y + '：' + par(x) + ' + ' + par(y) + ' = ' + par(x + y), { size: 12, anchor: 'start' }); });
    }
    return s;
  }
  U.registerPack({
    id: 'featbench', version: 1,
    types: {
      featbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E3', 'E7'],
        label: '数的特征', prefix: '数的特征', group: '数与运算', grades: [4, 6],
        alias: ['倍数特征', '2 的倍数', '3 的倍数', '5 的倍数', '9 的倍数', '数字和', '个位', '奇数', '偶数', '奇偶', '数字卡片', '拼数'],
        props: {
          mode: { type: 'choice', label: '做什么', default: 0, choices: ['拼数', '奇偶'], write: true },
          cards: { type: 'text', label: '拼数：卡片上的数字（逗号分开）', default: '2,3,5,0', write: true },
          tpl: { type: 'text', label: '拼数：数的样子（? 是空位）', default: '???', write: true },
          reuse: { type: 'bool', label: '拼数：卡片可以重复用', default: false, write: true },
          cond: { type: 'choice', label: '拼数：要什么样的数', default: 1, choices: CONDS.map((x) => x[0]), write: true },
          gk: { type: 'choice', label: '拼数：要几个', default: 0, choices: GOALS, write: true },
          pick: { type: 'text', label: '拼数：每个空位放的卡片（自动）', default: '', write: true },
          found: { type: 'text', label: '拼数：记下的数（自动）', default: '', write: true },
          a: { type: 'int', label: '奇偶：甲', default: 3, min: 1, max: 15, write: true }, b: { type: 'int', label: '奇偶：乙', default: 5, min: 1, max: 15, write: true },
          joined: { type: 'bool', label: '奇偶：合起来了（自动）', default: false, write: true },
          tried: { type: 'text', label: '奇偶：试过的（自动）', default: '', write: true },
          msg: { type: 'text', label: '提示（自动）', default: '', write: true, hidden: true },
        },
        outputs: {
          n: { dim: null, kind: 'num', label: '拼数：拼出的数（拼满才有）' }, ok: { dim: null, kind: 'num', label: '拼数：符合要求 1、不符合 0（拼满才有）' },
          best: { dim: null, kind: 'num', label: '拼数：符合要求而且是最大（最小）的 1（做到才有）' }, found: { dim: null, kind: 'num', label: '拼数：记下了几个' }, all: { dim: null, kind: 'num', label: '拼数：全部找出来了 1（找全才有）' },
          sum: { dim: null, kind: 'num', label: '奇偶：合起来是几（合起来才有）' }, even: { dim: null, kind: 'num', label: '奇偶：合起来是偶数 1、奇数 0（合起来才有）' }, oo: { dim: null, kind: 'num', label: '奇偶：试过几组“奇 + 奇”' },
        },
        icon: () => K.rect(6, 12, 16, 22, { fill: '#fff', stroke: '#8a5a00', r: 3, w: 1.4 }) + K.text(14, 28, '3', { size: 12, weight: 700 }) + K.rect(26, 12, 16, 22, { fill: '#fff', stroke: '#8a5a00', r: 3, w: 1.4 }) + K.text(34, 28, '6', { size: 12, weight: 700 }) + K.text(48, 28, '✓', { size: 12, weight: 700, fill: 'var(--blue)' }),
        size: () => [W, 360],
        grips: () => [],
        compute: (c) => {
          if (+c.props.mode === 1) { const m = parityModel(c.props), o = { oo: num(m.oo) }; if (m.joined) { o.sum = num(m.sum); o.even = num(m.sum % 2 ? 0 : 1); } return o; }
          const m = model(c.props), o = { found: num(m.found.length) };
          if (m.n !== null) { o.n = num(m.n); o.ok = num(m.ok ? 1 : 0); if (m.ok && ((m.gk === 1 && m.n === m.max) || (m.gk === 2 && m.n === m.min))) o.best = num(1); }
          if (m.gk === 3 && m.vs.length && m.found.length === m.vs.length) o.all = num(1);
          return o;
        },
        badge: () => '',
        draw: (c) => (+c.props.mode === 1 ? drawParity(c) : drawCards(c)),
      },
    },
  });
  U.FeatBench = { model, CONDS };
})(typeof globalThis !== 'undefined' ? globalThis : window);
