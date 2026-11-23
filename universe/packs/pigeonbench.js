/* 器材包 pigeonbench：摸球保证（抽屉原理、最不利原则）。
 *   袋里有几种颜色的球（红、黄、蓝、绿，每种 0–12 个）。问题是：闭着眼睛摸，至少摸几个，才能“保证”……
 *     want 0：有 m 个同色；want 1：每种颜色都有；want 2：有 m 个红的。
 *   孩子自己当“最倒霉的人”：点“摸一个红的”一个一个摸，尽量不让事情成功。
 *   摸到“不管再摸哪一个都一定成功”的时候（卡住了），台面问“那至少要摸几个才能保证？”，给三个数让孩子自己选（say）：
 *     选对了（摸了的 + 1）才出“保证”要摸的个数（guar）；选成“摸了的个数”或者“再多 1 个”，说清楚为什么不对。
 *   已经成功了（hit）说明运气还不够坏，要放回去换一种摸法。
 *   “每种都有”里卡住的摸法不止一种：把哪一种全摸完最倒霉？要自己比（guar 只说这种摸法要几个）。
 * 这一版的边界（如实写）：最多 4 种颜色，每种最多 12 个；只有这三种问法。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
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
    return { c, x, want, m, live, hit: h, drawn, total, stuck, never, say, guar: stuck && say === drawn + 1 ? drawn + 1 : null };
  }
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
      s += btn(330, y, 70, '摸一个', { ['x' + (i + 1)]: m.x[i] + 1, say: 0 }, left > 0, '摸一个' + nm + '的');
      s += btn(404, y, 52, '放回', { ['x' + (i + 1)]: m.x[i] - 1, say: 0 }, m.x[i] > 0, '放回一个' + nm + '的');
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
      [m.drawn, m.drawn + 1, m.drawn + 2].forEach((v, i) => { s += btn(200 + i * 92, y + 33, 86, '摸 ' + v + ' 个', { say: v }, true, '保证要摸 ' + v + ' 个'); });
      if (m.guar !== null) {
        s += '<g data-read="1">' + K.text(20, y + 80, '对：最倒霉摸 ' + m.drawn + ' 个还不成功，再摸 1 个一定成功，' + m.drawn + ' + 1 = ' + m.guar + ' 个', { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
        if (m.want === 1) s += K.text(20, y + 100, '卡住的摸法不止一种：把哪一种全摸完最倒霉？比一比。', { size: 12, anchor: 'start', fill: '#5f6773' });
      } else if (m.say === m.drawn) s += K.text(20, y + 80, '摸 ' + m.drawn + ' 个的时候，最倒霉的人还没成功呢（就是现在这样）。', { size: 13, anchor: 'start', fill: '#c0392b' });
      else if (m.say === m.drawn + 2) s += K.text(20, y + 80, '多了：现在再摸 1 个，不管摸到什么都已经成功了。', { size: 13, anchor: 'start', fill: '#c0392b' });
    }
    s += btn(560, y + 8, 110, '全部放回', { x1: 0, x2: 0, x3: 0, x4: 0, say: 0 }, m.drawn > 0, '全部放回袋里');
    return s;
  }
  const P = {};
  [1, 2, 3, 4].forEach((i) => { P['c' + i] = { type: 'int', label: COL[i - 1][0] + '球个数', default: i <= 3 ? 4 : 0, min: 0, max: CMAX, write: true }; });
  P.want = { type: 'choice', label: '要保证什么', default: 0, choices: ['几个同色', '每种颜色都有', '几个红的'], write: true };
  P.m = { type: 'int', label: '要几个', default: 2, min: 1, max: CMAX, write: true };
  [1, 2, 3, 4].forEach((i) => { P['x' + i] = { type: 'int', label: '摸出的' + COL[i - 1][0] + '球', default: 0, min: 0, max: CMAX, write: true }; });
  P.say = { type: 'int', label: '卡住时说保证要摸几个', default: 0, min: 0, max: 50, write: true };
  U.registerPack({
    id: 'pigeonbench', version: 2,
    types: {
      pigeonbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E2', 'E7'],
        label: '摸球保证（最不利）', prefix: '摸球', group: '统计与概率', grades: [4, 6],
        alias: ['抽屉原理', '鸽巢原理', '最不利原则', '最坏情况', '摸球', '保证', '至少摸几个', '袜子', '手套'],
        props: P,
        outputs: {
          drawn: { dim: null, kind: 'num', label: '摸了几个' }, hit: { dim: null, kind: 'num', label: '已经成功了（1 是）' },
          guar: { dim: null, kind: 'num', label: '这样卡住，保证要摸几个（卡住才有）' },
        },
        icon: () => K.circle(16, 22, 8, { fill: '#e05a4f', stroke: 'var(--ink)', w: 0.8 }) + K.circle(32, 22, 8, { fill: '#f2c14e', stroke: 'var(--ink)', w: 0.8 }) + K.circle(24, 38, 8, { fill: '#4f86d9', stroke: 'var(--ink)', w: 0.8 }) + K.text(44, 44, '?', { size: 14, weight: 700 }),
        size: (c) => [W, 62 + model((c && c.props) || {}).live.length * 40 + 6 + 140],
        grips: () => [],
        compute: (c) => { const m = model(c.props), o = { drawn: num(m.drawn), hit: num(m.hit ? 1 : 0) }; if (m.stuck) o.guar = num(m.guar); return o; },
        badge: (c) => { const m = model(c.props); return m.guar !== null ? '保证 ' + m.guar + ' 个' : ''; },
        draw,
      },
    },
  });
  U.PigeonBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
