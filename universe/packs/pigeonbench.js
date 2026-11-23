/* 器材包 pigeonbench：摸球保证（抽屉原理、最不利原则）。
 *   袋里有几种颜色的球（红、黄、蓝、绿，每种 0–12 个）。问题是：闭着眼睛摸，至少摸几个，才能“保证”……
 *     want 0：有 m 个同色；want 1：每种颜色都有；want 2：有 m 个红的。
 *   孩子自己当“最倒霉的人”：点“摸一个红的”一个一个摸，尽量不让事情成功。
 *   摸到“不管再摸哪一个都一定成功”的时候（卡住了），台面问“那至少要摸几个才能保证？”，给三个数让孩子自己选（say）：
 *     选对了（摸了的 + 1）才出“保证”要摸的个数（guar）；选成“摸了的个数”或者“再多 1 个”，说清楚为什么不对。
 *   已经成功了（hit）说明运气还不够坏，要放回去换一种摸法。
 *   “每种都有”里卡住的摸法不止一种：把哪一种全摸完最倒霉？要自己比（guar 只说这种摸法要几个）。
 *   研究本（book）：找到最倒霉的摸法、说对“保证要摸几个”（等于真正的答案 best）时，自动记一条，换了袋子也不丢。
 *   换情况（adj，用逗号隔开的开关）：bag 换一袋（bags 里的几袋，si 第几袋）、m 改要几个、want 换问法。题目可带追问（ask / pick）。
 *   “摸完”一下把这种颜色全摸出来，大袋子不用点很多次。
 * 这一版的边界（如实写）：最多 4 种颜色，每种最多 12 个；只有这三种问法。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, RS = K.research;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700, CMAX = 12;
  const COL = [['红', '#e05a4f'], ['黄', '#f2c14e'], ['蓝', '#4f86d9'], ['绿', '#5bb26a']];
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  function model(p) {
    const c = [1, 2, 3, 4].map((i) => clamp(p['c' + i], 0, CMAX)), want = clamp(p.want, 0, 2), m = clamp(p.m, 1, CMAX);
    const x = [1, 2, 3, 4].map((i, j) => clamp(p['x' + i], 0, c[j]));
    const live = [0, 1, 2, 3].filter((i) => c[i] > 0);
    const hit = (y) => (want === 0 ? live.some((i) => y[i] >= m) : want === 1 ? live.length > 0 && live.every((i) => y[i] >= 1) : y[0] >= m);
    const drawn = x.reduce((a, b) => a + b, 0), total = c.reduce((a, b) => a + b, 0), h = hit(x);
    const more = live.filter((i) => x[i] < c[i]);
    const stuck = !h && more.length > 0 && more.every((i) => { const y = x.slice(); y[i]++; return hit(y); });
    const never = !h && more.length === 0;   // 全摸完了也不成功：这件事保证不了
    const say = stuck ? clamp(p.say, 0, total + 1) : 0;
    // 真正的答案：最倒霉的摸法再加 1（做不到是 null）
    const lc = live.map((i) => c[i]);
    const best = want === 0 ? (lc.some((v) => v >= m) ? lc.reduce((a, v) => a + Math.min(v, m - 1), 0) + 1 : null)
      : want === 1 ? (live.length ? total - Math.min(...lc) + 1 : null) : (c[0] >= m ? m - 1 + total - c[0] + 1 : null);
    const bags = String(p.bags || '').split('|').map((s) => s.split(',').map((v) => clamp(v, 0, CMAX))).filter((a) => a.length === 4 && a.some((v) => v > 0));
    const si = clamp(p.si, 0, Math.max(0, bags.length - 1)), adj = String(p.adj || '').split(',');
    const book = String(p.book || '').split(';').filter((e) => /^\d+,\d+,\d+,\d+:[012]:\d+:\d+$/.test(e)).filter((e, i, a) => a.indexOf(e) === i).slice(-30);
    const canAsk = book.length > 0, asks = RS.parseAsk(p.ask, p.pick, canAsk);
    return { c, x, want, m, live, hit: h, drawn, total, stuck, never, say, guar: stuck && say === drawn + 1 ? drawn + 1 : null, best,
      bags, si, adj: { bag: adj.includes('bag') && bags.length > 1, m: adj.includes('m'), want: adj.includes('want') }, book, canAsk, asks };
  }
  const WANT = (w, m) => (w === 0 ? m + ' 个同色' : w === 1 ? '每种都有' : m + ' 个红的');
  const bookSay = (e) => { const [cs, w, mm, g] = e.split(':'); return cs.split(',').map((v, i) => (+v ? COL[i][0] + v : '')).join('') + '，' + WANT(+w, mm) + '：' + g + ' 个'; };
  const items = (m) => m.book.map((e) => ({ say: bookSay(e) }));
  const RESET = { x1: 0, x2: 0, x3: 0, x4: 0, say: 0 };
  // 卡住以后：消息、选“保证要摸几个”、对了以后的读数（占 110 高）；再往下：换情况一行、研究本、追问
  const lay = (m) => { const y = 62 + m.live.length * 40 + 6, yc = y + 112, adj = m.adj.bag || m.adj.m || m.adj.want; const yb = yc + (adj ? 36 : 0); return { y, yc, adj, yb, ya: yb + RS.bookH(items(m)), end: yb + RS.bookH(items(m)) + RS.asksH(m.asks) }; };
  const ask = (m) => (m.want === 0 ? '有 ' + m.m + ' 个同色的' : m.want === 1 ? '每种颜色都有' : '有 ' + m.m + ' 个红的');
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  // 摸走的球在袋里留一个虚线的空位
  const ball = (x, y, col, gone) => (gone ? '<circle cx="' + x + '" cy="' + y + '" r="7.5" fill="none" stroke="#9aa3b0" stroke-width="1" stroke-dasharray="2 2"/>' : K.circle(x, y, 7.5, { fill: col, stroke: 'var(--ink)', w: 0.8 }));
  function draw(c) {
    const m = model(c.props); let s = '';
    s += K.text(20, 26, '闭着眼睛摸：至少摸几个，才能保证' + ask(m) + '？', { size: 15, weight: 700, anchor: 'start' });
    s += K.text(20, 50, '袋里', { size: 12, weight: 700, anchor: 'start' }) + K.text(470, 50, '摸出来的', { size: 12, weight: 700, anchor: 'start' });
    let y = 62;
    m.live.forEach((i) => {
      const [nm, col] = COL[i], left = m.c[i] - m.x[i];
      s += K.text(20, y + 18, nm + ' ' + left, { size: 12, anchor: 'start' });
      for (let k = 0; k < m.c[i]; k++) s += ball(70 + k * 20, y + 13, col, k >= left);
      s += btn(300, y, 62, '摸一个', { ['x' + (i + 1)]: m.x[i] + 1, say: 0 }, left > 0, '摸一个' + nm + '的');
      s += btn(366, y, 48, '放回', { ['x' + (i + 1)]: m.x[i] - 1, say: 0 }, m.x[i] > 0, '放回一个' + nm + '的');
      s += btn(418, y, 48, '摸完', { ['x' + (i + 1)]: m.c[i], say: 0 }, left > 0, '把' + nm + '的全摸出来');
      for (let k = 0; k < m.x[i]; k++) s += ball(478 + k * 18, y + 13, col, false);
      if (m.x[i]) s += K.text(478 + m.x[i] * 18 + 4, y + 18, String(m.x[i]), { size: 12, weight: 700, anchor: 'start' });
      y += 40;
    });
    y += 6;
    s += K.text(20, y, '一共摸了 ' + m.drawn + ' 个（袋里一共 ' + m.total + ' 个）', { size: 13, anchor: 'start' });
    let msg, col = 'var(--ink)';
    if (m.hit) { msg = '已经' + ask(m) + '了——运气还不够坏。最倒霉的人会怎么摸？放回去试试。'; col = '#b0552a'; }
    else if (m.stuck) msg = null;
    else if (m.never) msg = '全摸完了也做不到：这件事保证不了。';
    else if (m.drawn === 0) msg = '你来当最倒霉的人：一个一个摸，尽量不让它成功。';
    else msg = '还没成功。再摸一个，还能不成功吗？';
    if (msg) s += K.text(20, y + 24, msg, { size: 13, anchor: 'start', fill: col });
    else {
      s += K.text(20, y + 24, '卡住了：不管再摸哪一个，都一定' + ask(m) + '。', { size: 13, anchor: 'start' });
      s += K.text(20, y + 50, '那至少摸几个，才能保证？', { size: 13, weight: 700, anchor: 'start' });
      [m.drawn, m.drawn + 1, m.drawn + 2].forEach((v, i) => {
        const patch = { say: v };
        if (v === m.drawn + 1 && v === m.best) { const e = m.c.join(',') + ':' + m.want + ':' + m.m + ':' + v; patch.book = m.book.concat(m.book.includes(e) ? [] : [e]).join(';'); }
        s += btn(200 + i * 92, y + 33, 86, '摸 ' + v + ' 个', patch, true, '保证要摸 ' + v + ' 个');
      });
      if (m.guar !== null) {
        s += '<g data-read="1">' + K.text(20, y + 80, '对：最倒霉摸 ' + m.drawn + ' 个还不成功，再摸 1 个一定成功，' + m.drawn + ' + 1 = ' + m.guar + ' 个', { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
        if (m.guar === m.best) s += K.text(20, y + 100, m.want === 1 ? '这就是最倒霉的摸法：记进研究本了。' : '记进研究本了。', { size: 12, anchor: 'start', fill: '#2f7d3a' });
        else if (m.want === 1) s += K.text(20, y + 100, '卡住的摸法不止一种：把哪一种全摸完最倒霉？比一比。', { size: 12, anchor: 'start', fill: '#5f6773' });
      } else if (m.say === m.drawn) s += K.text(20, y + 80, '摸 ' + m.drawn + ' 个的时候，最倒霉的人还没成功呢（就是现在这样）。', { size: 13, anchor: 'start', fill: '#c0392b' });
      else if (m.say === m.drawn + 2) s += K.text(20, y + 80, '多了：现在再摸 1 个，不管摸到什么都已经成功了。', { size: 13, anchor: 'start', fill: '#c0392b' });
    }
    s += btn(560, y + 8, 110, '全部放回', Object.assign({}, RESET), m.drawn > 0, '全部放回袋里');
    // 换情况
    const L = lay(m);
    if (L.adj) {
      let x = 20;
      if (m.adj.bag) { const nx = (m.si + 1) % m.bags.length, b = m.bags[nx]; s += btn(x, L.yc, 170, '换一袋（第 ' + (m.si + 1) + ' / ' + m.bags.length + ' 袋）', Object.assign({ si: nx, c1: b[0], c2: b[1], c3: b[2], c4: b[3] }, RESET), true, '换一袋'); x += 180; }
      if (m.adj.m && m.want !== 1) {
        s += K.text(x, L.yc + 17, '要几个', { size: 12, weight: 700, anchor: 'start' }) + btn(x + 50, L.yc, 26, '−', Object.assign({ m: m.m - 1 }, RESET), m.m > 2, '少要一个') + K.text(x + 92, L.yc + 17, String(m.m), { size: 14, weight: 700 }) + btn(x + 106, L.yc, 26, '+', Object.assign({ m: m.m + 1 }, RESET), m.m < CMAX, '多要一个');
        x += 146;
      }
      if (m.adj.want) { const nw = (m.want + 1) % 3; s += btn(x, L.yc, 200, '换问法：' + ['几个同色', '每种都有', '几个红的'][nw], Object.assign({ want: nw }, RESET), true, '换问法：' + ['几个同色', '每种颜色都有', '几个红的'][nw]); }
    }
    s += RS.drawBook(L.yb, items(m), '研究本（找到最倒霉的摸法就记一条）');
    s += RS.drawAsks(L.ya, m.asks, m.canAsk);
    return s;
  }
  const P = {};
  [1, 2, 3, 4].forEach((i) => { P['c' + i] = { type: 'int', label: COL[i - 1][0] + '球个数', default: i <= 3 ? 4 : 0, min: 0, max: CMAX, write: true }; });
  P.want = { type: 'choice', label: '要保证什么', default: 0, choices: ['几个同色', '每种颜色都有', '几个红的'], write: true };
  P.m = { type: 'int', label: '要几个', default: 2, min: 1, max: CMAX, write: true };
  [1, 2, 3, 4].forEach((i) => { P['x' + i] = { type: 'int', label: '摸出的' + COL[i - 1][0] + '球', default: 0, min: 0, max: CMAX, write: true }; });
  P.say = { type: 'int', label: '卡住时说保证要摸几个', default: 0, min: 0, max: 50, write: true };
  P.bags = { type: 'text', label: '能换的几袋（红,黄,蓝,绿|…）', default: '', write: true };
  P.si = { type: 'int', label: '第几袋', default: 0, min: 0, max: 9, write: true };
  P.adj = { type: 'text', label: '台面上能换什么（bag,m,want）', default: '', write: true };
  P.book = { type: 'text', label: '研究本', default: '', write: true };
  P.ask = { type: 'text', label: '追问（题干|选项|*对的选项~…）', default: '', write: true };
  P.pick = { type: 'text', label: '追问选了第几个', default: '', write: true };
  U.registerPack({
    id: 'pigeonbench', version: 3,
    types: {
      pigeonbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E2', 'E7'],
        label: '摸球保证（最不利）', prefix: '摸球', group: '统计与概率', grades: [4, 6],
        alias: ['抽屉原理', '鸽巢原理', '最不利原则', '最坏情况', '摸球', '保证', '至少摸几个', '袜子', '手套'],
        props: P,
        outputs: {
          drawn: { dim: null, kind: 'num', label: '摸了几个' }, hit: { dim: null, kind: 'num', label: '已经成功了（1 是）' },
          guar: { dim: null, kind: 'num', label: '这样卡住，保证要摸几个（卡住才有）' },
          m: { dim: null, kind: 'num', label: '要几个' }, want: { dim: null, kind: 'num', label: '问法（0 同色，1 每种都有，2 红的）' }, si: { dim: null, kind: 'num', label: '第几袋' },
          cases: { dim: null, kind: 'num', label: '研究本里有几条' }, q1: { dim: null, kind: 'num', label: '追问 1 选了第几个' }, q2: { dim: null, kind: 'num', label: '追问 2 选了第几个' },
        },
        icon: () => K.circle(16, 22, 8, { fill: '#e05a4f', stroke: 'var(--ink)', w: 0.8 }) + K.circle(32, 22, 8, { fill: '#f2c14e', stroke: 'var(--ink)', w: 0.8 }) + K.circle(24, 38, 8, { fill: '#4f86d9', stroke: 'var(--ink)', w: 0.8 }) + K.text(44, 44, '?', { size: 14, weight: 700 }),
        size: (c) => [W, Math.max(260, lay(model((c && c.props) || {})).end + 30)],
        grips: () => [],
        compute: (c) => {
          const m = model(c.props), o = { drawn: num(m.drawn), hit: num(m.hit ? 1 : 0), m: num(m.m), want: num(m.want), si: num(m.si + 1), cases: num(m.book.length) };
          if (m.guar !== null) o.guar = num(m.guar);
          m.asks.forEach((a, i) => { if (a.pick) o['q' + (i + 1)] = num(a.pick); });
          return o;
        },
        badge: (c) => { const m = model(c.props); return m.guar !== null ? '保证 ' + m.guar + ' 个' : ''; },
        draw,
      },
    },
  });
  U.PigeonBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
