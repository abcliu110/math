/* 器材包 treebench：枚举树（有顺序地列，不重不漏）。树横着画：根 → 第一层的每一枝一行 → 这一枝下面的叶子。
 *   mode 0 数字卡片排数：m 张卡片（1…m，或者带 0 的 0…m−1），排成 k 位数；可不可以重复用（rep）；还可以只要双数、单数（cond）。
 *     第一层按“最高位是几”分枝（台面给好）；下面的数要孩子自己一个一个列：点卡片，一位一位排出来。
 *   mode 1 凑钱：用 1 元、2 元、5 元（或 1 元、5 元、10 元）凑 amt 元。第一层按“最大的钱用几张”分枝，
 *     孩子自己点“中间的钱用几张”列出这一枝的凑法，剩下的自动用 1 元。
 *   一枝一枝来：当前这一枝列好了，自己点“这一枝列完了”。列全了才能往下走；没列全只说“还没列全”，不说缺哪个。
 *     同一张卡片用两次、列重复了、不合条件（只要双数却列了单数）、钱凑超了，都当场说出来，不记上。
 *     0 打头的那一枝排不出数来，要自己点“剪掉这一枝”。
 *   got 记下列出来的数（凑钱记成“大钱张数-中钱张数”），cur 是三位数排了一半的，open 是列完了几枝，err 是刚才那一下的提醒。
 *   全部列完才有“一共几个”（count）；每枝一样多时写成乘法，不一样多时只能加起来。
 * 这一版的边界（如实写）：卡片最多 5 张，位数 2–3（能重复用的三位数最多 4 张卡片）；凑钱最多 20 元（1、2、5）或 50 元（1、5、10）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700, OMAX = 6;
  const SETS = [[5, 2], [10, 5]];
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const CONDS = ['', '双数', '单数'];
  const POS = [[], ['', '个位'], ['', '十位', '个位']];
  function model(p) {
    const mode = clamp(p.mode, 0, 1), k = clamp(p.k, 2, 3), rep = !!p.rep, zero = !!p.zero, cond = clamp(p.cond, 0, 2);
    const m = clamp(p.m, rep ? 2 : k, rep && k === 3 ? 4 : 5), set = clamp(p.set, 0, 1), [B, M] = SETS[set], amt = clamp(p.amt, 3, set ? 50 : 20);
    const D = Array.from({ length: m }, (_, i) => (zero ? i : i + 1));
    const bad = (t) => { const last = +t[t.length - 1]; return cond === 1 ? last % 2 !== 0 : cond === 2 ? last % 2 === 0 : false; };
    const rows = [];
    if (mode === 0) {
      const tails = (used, len) => {
        if (!len) return [[]];
        const out = [];
        D.forEach((d) => { if (!rep && used.includes(d)) return; tails(used.concat(d), len - 1).forEach((t) => out.push([d].concat(t))); });
        return out;
      };
      D.forEach((d) => {
        const cut = d === 0 ? '0 不能打头' : '';
        const good = cut ? [] : tails([d], k - 1).map((t) => [d].concat(t).join('')).filter((t) => !bad(t));
        rows.push({ key: String(d), label: String(d), cut, good });
      });
    } else {
      for (let i = 0; i * B <= amt; i++) {
        const good = [];
        for (let j = 0; j * M <= amt - i * B; j++) good.push(i + '-' + j);
        rows.push({ key: String(i), label: B + '元×' + i, cut: '', good });
      }
    }
    const rowOf = (t) => (mode === 0 ? t[0] : t.split('-')[0]);
    const valid = new Set([].concat(...rows.map((r) => r.good)));
    const got = String(p.got || '').split(',').filter((t, i, a) => valid.has(t) && a.indexOf(t) === i);
    rows.forEach((r) => { r.mine = got.filter((t) => rowOf(t) === r.key); r.full = r.cut ? r.mine.length === 0 : r.mine.length === r.good.length; });
    let open = 0; const want = clamp(p.open, 0, rows.length);
    while (open < want && rows[open].full) open++;
    const all = open >= rows.length, cr = all ? null : rows[open];
    let cur = mode === 0 && k === 3 && cr ? String(p.cur || '').replace(/[^0-9]/g, '').slice(0, 1) : '';
    if (cur && !D.includes(+cur)) cur = '';
    const total = rows.reduce((a, r) => a + r.good.length, 0);
    const live = rows.filter((r) => !r.cut), per = live.map((r) => r.good.length), same = per.length > 0 && per.every((v) => v === per[0]);
    return { mode, k, rep, zero, cond, m, set, B, M, amt, D, rows, got, open, all, cr, cur, bad, err: String(p.err || '').slice(0, 60), seen: got.length, count: all ? total : null, per, same };
  }
  // 参考做法：每一枝都按从小到大列全
  const solve = (p) => { const m = model(Object.assign({}, p, { got: '', open: 0 })); return { got: [].concat(...m.rows.map((r) => r.good)).join(','), open: m.rows.length, cur: '', err: '' }; };
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const cards = (m) => m.D;
  const title = (m) => (m.mode === 0
    ? '用 ' + cards(m).join('、') + ' 这 ' + m.m + ' 张卡片排' + (m.k === 2 ? '两' : '三') + '位数' + (m.cond ? '（只要' + CONDS[m.cond] + '）' : '') + (m.rep ? '，同一张可以重复用' : '，每张只能用一次')
    : '用 1 元、' + m.M + ' 元、' + m.B + ' 元凑 ' + m.amt + ' 元');
  const shape = (m) => ({ LW: m.mode === 0 ? 40 : 48, PER: m.mode === 0 ? 13 : 10, RH: m.mode === 0 ? 26 : 34 });
  // 每一枝占几行：列完的和正在列的按叶子数折行，还没轮到的占一行
  function treeEnd(m) {
    const { PER, RH } = shape(m); let y = 46;
    m.rows.forEach((r, i) => { const n = i <= m.open && !r.cut ? r.mine.length + (i === m.open && m.cur ? 1 : 0) : 0; y += Math.max(1, Math.ceil(n / PER)) * RH + 6; });
    return y;
  }
  const bottom = (m) => treeEnd(m) + (m.all ? 24 + 46 : 20 + 64) + 26;
  const leafText = (m, t) => (m.mode === 0 ? [t] : (() => { const [i, j] = t.split('-').map(Number); return [m.M + '元×' + j, '1元×' + (m.amt - i * m.B - j * m.M)]; })());
  function draw(c) {
    const m = model(c.props); let s = '';
    s += K.text(20, 26, title(m) + '：一共几种？', { size: 15, weight: 700, anchor: 'start' });
    const X0 = 24, XB = 92, XL = 150, { LW, PER, RH } = shape(m);
    let y = 46;
    s += K.rect(X0 - 4, y + 4, 30, 22, { fill: '#eef1f6', stroke: '#8a93a3', r: 6, w: 1 }) + K.text(X0 + 11, y + 19, '开始', { size: 10 });
    m.rows.forEach((r, i) => {
      const now = i === m.open, done = i < m.open;
      const show = (done || now) && !r.cut ? r.mine.slice() : [];
      const part = now && m.cur ? r.key + m.cur + '_' : '';
      const n = show.length + (part ? 1 : 0), h = Math.max(1, Math.ceil(n / PER)) * RH + 6, cy = y + 15;
      s += K.line(X0 + 26, 61, XB - 4, cy, { stroke: '#8a93a3', w: 1 });
      s += K.rect(XB - 4, cy - 12, 52, 24, { fill: done ? '#fff3d6' : now ? '#dcebfb' : '#f6f7f9', stroke: now ? 'var(--blue)' : '#c9a24a', r: 6, w: now ? 2 : 1 }) + K.text(XB + 22, cy + 4, r.label, { size: 12, weight: 700 });
      if (!done && !now) s += K.text(XL + 4, cy + 4, '还没轮到', { size: 12, anchor: 'start', fill: '#8a93a3' });
      else if (done && r.cut) s += K.line(XB - 4, cy, XB + 48, cy, { stroke: '#c0392b', w: 2 }) + K.text(XL + 4, cy + 4, '✂ ' + r.cut + '：这一枝整枝剪掉', { size: 12, anchor: 'start', fill: '#c0392b' });
      else if (now && !n) s += K.text(XL + 4, cy + 4, '← 正在列这一枝：在下面点，一个一个列出来', { size: 12, anchor: 'start', fill: 'var(--blue)' });
      else {
        show.concat(part ? [part] : []).forEach((t, j) => {
          const lx = XL + (j % PER) * (LW + 2), ly = y + Math.floor(j / PER) * RH + 2, half = part && j === show.length;
          s += K.rect(lx, ly, LW, RH - 4, { fill: half ? '#fff' : '#e3f4e6', stroke: half ? 'var(--blue)' : '#4c9a5b', r: 4, w: 1 });
          const tx = half ? [t] : leafText(m, t);
          if (tx.length > 1) s += K.text(lx + LW / 2, ly + 12, tx[0], { size: 10, weight: 700 }) + K.text(lx + LW / 2, ly + 25, tx[1], { size: 10, fill: '#5f6773' });
          else s += K.text(lx + LW / 2, ly + 15, tx[0], { size: 12, weight: 700 });
        });
        if (done) s += K.text(XL + Math.min(show.length, PER) * (LW + 2) + 6, cy + 4, show.length + ' 种', { size: 12, weight: 700, anchor: 'start', fill: '#4c9a5b' });
      }
      y += h;
    });
    const H = (x) => x.join(','), base = { cur: '', err: '' };
    if (!m.all) {
      const r = m.cr, mine = r.mine;
      y += 20;
      if (m.mode === 0) {
        const pre = r.key + m.cur, pos = POS[m.k - 1][pre.length];
        s += K.text(20, y + 17, '“' + r.label + '”这一枝：' + pre + '□，' + pos + '放', { size: 13, weight: 700, anchor: 'start' });
        m.D.forEach((d, i) => {
          let patch;
          if (r.cut) patch = { err: '0 打头，排出来的就不是' + (m.k === 2 ? '两' : '三') + '位数了' };
          else if (!m.rep && pre.includes(String(d))) patch = { err: '每张卡片只能用一次：' + d + ' 已经用了' };
          else {
            const t = pre + d;
            if (t.length < m.k) patch = { cur: m.cur + d, err: '' };
            else if (m.got.includes(t)) patch = Object.assign({}, base, { err: t + ' 已经列过了' });
            else if (m.bad(t)) patch = Object.assign({}, base, { err: t + ' 是' + (+d % 2 ? '单' : '双') + '数，这题只要' + CONDS[m.cond] });
            else patch = Object.assign({}, base, { got: H(m.got.concat(t)) });
          }
          s += btn(240 + i * 44, y, 38, String(d), patch, true, pos + '放 ' + d);
        });
      } else {
        const i0 = +r.key, rest = m.amt - i0 * m.B;
        s += K.text(20, y + 17, m.B + ' 元用 ' + i0 + ' 张，' + m.M + ' 元用几张？', { size: 13, weight: 700, anchor: 'start' });
        for (let j = 0; j * m.M <= m.amt; j++) {
          const t = i0 + '-' + j;
          const patch = j * m.M > rest ? { err: m.B + ' 元 ' + i0 + ' 张、' + m.M + ' 元 ' + j + ' 张，已经 ' + (i0 * m.B + j * m.M) + ' 元，超过 ' + m.amt + ' 元了' }
            : m.got.includes(t) ? { err: m.M + ' 元用 ' + j + ' 张的已经列过了' } : { got: H(m.got.concat(t)), err: '' };
          s += btn(240 + j * 40, y, 34, String(j), patch, true, m.M + ' 元用 ' + j + ' 张');
        }
      }
      let msg = m.err, col = '#c0392b';
      if (!msg) {
        col = '#5f6773';
        const sorted = mine.every((t, j) => !j || (m.mode === 0 ? +mine[j - 1] < +t : +mine[j - 1].split('-')[1] < +t.split('-')[1]));
        msg = '列完了 ' + m.open + ' 枝（一共 ' + m.rows.length + ' 枝），已经列出 ' + m.seen + ' 种。' + (sorted ? '' : '按从小到大列，更容易看出漏没漏。');
      }
      s += K.text(20, y + 46, msg, { size: 13, anchor: 'start', fill: col });
      const yb = y + 60;
      const done = r.cut ? { err: '这一枝一个也排不出来？想想为什么，把它剪掉' } : mine.length === r.good.length ? Object.assign({}, base, { open: m.open + 1 }) : { err: '这一枝还没列全。按从小到大一个一个试，看看缺了谁。' };
      let x = 20;
      s += btn(x, yb, 116, '这一枝列完了', done, true, '这一枝列完了'); x += 122;
      if (m.mode === 0) { s += btn(x, yb, 96, '剪掉这一枝', r.cut ? Object.assign({}, base, { open: m.open + 1 }) : { err: r.label + ' 打头能排出数来，不能剪' }, true, '剪掉这一枝'); x += 102; }
      const undo = m.cur ? { cur: m.cur.slice(0, -1), err: '' } : Object.assign({}, base, { got: H(m.got.filter((t) => t !== mine[mine.length - 1])) });
      s += btn(x, yb, 104, '擦掉最后一个', undo, !!m.cur || mine.length > 0, '擦掉最后一个'); x += 110;
      s += btn(x, yb, 80, '全部重来', { got: '', cur: '', open: 0, err: '' }, m.got.length > 0 || m.open > 0, '全部重来');
      s += ctl(m, yb);
    } else {
      y += 24;
      const v = m.per.length;
      const how = m.same && v > 1 ? '每一枝都是 ' + m.per[0] + ' 种，有 ' + v + ' 枝：' + m.per[0] + ' × ' + v + ' = ' + m.count : v > 1 ? '每一枝不一样多，只能加起来：' + m.per.join(' + ') + ' = ' + m.count : '只有一枝：' + m.count;
      s += K.text(20, y, how, { size: 13, anchor: 'start' });
      s += '<g data-read="1">' + K.text(20, y + 26, '一共 ' + m.count + ' 种', { size: 16, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
      const yb = y + 40;
      s += btn(20, yb, 80, '全部重来', { got: '', cur: '', open: 0, err: '' }, true, '全部重来') + ctl(m, yb);
    }
    return s;
  }
  // 卡片张数、凑几元：换了就从头列
  const ctl = (m, yb) => {
    const reset = { got: '', cur: '', open: 0, err: '' };
    return m.mode === 0
      ? K.text(500, yb + 17, '几张卡片', { size: 12, weight: 700, anchor: 'start' }) + btn(560, yb, 26, '−', Object.assign({ m: m.m - 1 }, reset), m.m > (m.rep ? 2 : m.k), '少一张卡片') + K.text(602, yb + 17, String(m.m), { size: 14, weight: 700 }) + btn(618, yb, 26, '+', Object.assign({ m: m.m + 1 }, reset), m.m < (m.rep && m.k === 3 ? 4 : 5), '多一张卡片')
      : K.text(500, yb + 17, '凑几元', { size: 12, weight: 700, anchor: 'start' }) + btn(548, yb, 26, '−', Object.assign({ amt: m.amt - 1 }, reset), m.amt > 3, '少 1 元') + K.text(594, yb + 17, String(m.amt), { size: 14, weight: 700 }) + btn(614, yb, 26, '+', Object.assign({ amt: m.amt + 1 }, reset), m.amt < (m.set ? 50 : 20), '多 1 元');
  };
  U.registerPack({
    id: 'treebench', version: 2,
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
          got: { type: 'text', label: '列出来的', default: '', write: true },
          cur: { type: 'text', label: '排了一半的', default: '', write: true },
          open: { type: 'int', label: '列完了几枝', default: 0, min: 0, max: OMAX, write: true },
          err: { type: 'text', label: '提醒', default: '', write: true },
        },
        outputs: {
          rows: { dim: null, kind: 'num', label: '第一层有几枝' }, seen: { dim: null, kind: 'num', label: '已经列出几种' },
          count: { dim: null, kind: 'num', label: '一共几种（全部列完才有）' },
        },
        icon: () => K.line(8, 28, 26, 14, { w: 1.2 }) + K.line(8, 28, 26, 28, { w: 1.2 }) + K.line(8, 28, 26, 42, { w: 1.2 }) + [14, 28, 42].map((y) => K.line(26, y, 44, y - 5, { w: 1 }) + K.line(26, y, 44, y + 5, { w: 1 })).join(''),
        size: (c) => [W, Math.max(380, bottom(model((c && c.props) || {})) + 40)],
        grips: () => [],
        compute: (c) => { const m = model(c.props), o = { rows: num(m.rows.length), seen: num(m.seen) }; if (m.all) o.count = num(m.count); return o; },
        badge: (c) => { const m = model(c.props); return m.all ? '一共 ' + m.count + ' 种' : ''; },
        draw,
      },
    },
  });
  U.TreeBench = { model, solve };
})(typeof globalThis !== 'undefined' ? globalThis : window);
