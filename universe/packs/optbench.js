/* 器材包 optbench：优化（合理安排时间、烙饼）。
 *   - 安排时间（沏茶）：几件事，每件要几分钟。有的事要人一直做（洗茶杯），有的事人开个头它就自己进行（烧水：开了火，人就能去做别的）。
 *     有的事要等别的事做完（泡茶要等水开、杯子洗好；烧水要先洗水壶）。点下面的事，按点的顺序排进时间线：
 *     “人”一行一件接一件；“自己进行”的事放在“水壶”一行，开始以后人就空出来了。前面的事没做完，人只能等（画成灰色的“等”）。
 *     全排完写出一共几分钟；和最少的时间比，说“最省时间”还是“还能更快”。
 *   - 烙饼：锅里一次能放 2 张饼的一面，每面要烙几分钟。点“放进锅”选这一锅烙哪两面（同一张饼的两面不能同时烙），一锅一锅烙，
 *     每张饼两面都烙好就完成，写出一共几分钟；最少是“总面数 ÷ 2，有余数再加一锅”。
 * 这一版的边界（如实写）：安排时间最多 6 件事；烙饼最多 5 张。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const MODES = ['安排时间', '烙饼'];
  // 任务：名:分钟:类型（人 / 自）:依赖（编号，用 + 分开）
  function parseTasks(t) {
    return String(t || '').split(';').filter(Boolean).slice(0, 6).map((s, i) => { const [name, min, kind, dep] = s.split(':'); return { i, name, min: Math.max(1, +min || 1), auto: kind === '自', dep: String(dep || '').split('+').filter((x) => x !== '').map(Number) }; });
  }
  // 按顺序排：返回每件事的开始、结束，人等了多久
  function schedule(tasks, order) {
    let person = 0, idle = 0; const end = {}, start = {}, waits = [];
    for (const i of order) {
      const t = tasks[i]; const ready = Math.max(0, ...t.dep.map((d) => (end[d] === undefined ? Infinity : end[d])));
      if (!Number.isFinite(ready)) return null;
      const st = Math.max(person, ready); if (st > person) { waits.push([person, st]); idle += st - person; }
      start[i] = st; end[i] = st + t.min; person = t.auto ? st : st + t.min;
    }
    return { start, end, idle, waits, total: order.length ? Math.max(...order.map((i) => end[i])) : 0 };
  }
  function best(tasks) {
    let b = Infinity; const n = tasks.length, used = [];
    const go = (ord) => { if (ord.length === n) { const s = schedule(tasks, ord); if (s) b = Math.min(b, s.total); return; } for (let i = 0; i < n; i++) if (!used[i]) { used[i] = true; go(ord.concat([i])); used[i] = false; } };
    go([]); return b;
  }
  function model(p) {
    const mode = clamp(p.mode, 0, 1);
    if (mode === 0) {
      const tasks = parseTasks(p.tasks), order = [...new Set(String(p.order || '').split(',').filter((x) => x !== '').map(Number))].filter((i) => i < tasks.length);
      const sch = schedule(tasks, order) || { start: {}, end: {}, idle: 0, waits: [], total: 0 }, all = order.length === tasks.length && tasks.length > 0;
      const can = tasks.map((t) => !order.includes(t.i) && t.dep.every((d) => order.includes(d)));
      return { mode, tasks, order, sch, all, can, best: best(tasks), sum: tasks.reduce((s, t) => s + t.min, 0) };
    }
    const n = clamp(p.n, 1, 5), m = clamp(p.m, 1, 9), pots = String(p.pots || '').split(';').filter(Boolean).map((x) => x.split(',').map(Number)), sides = Array.from({ length: n }, () => 0);
    pots.forEach((pt) => pt.forEach((k) => { if (k >= 0 && k < n) sides[k]++; }));
    const pick = String(p.pick || '').split(',').filter((x) => x !== '').map(Number).filter((k) => k < n);
    const done = sides.every((x) => x >= 2), minPots = n === 1 ? 2 : n;   // 一张饼的两面不能同时烙；2 张以上每锅都能放满
    return { mode, n, m, pots, sides, pick, done, minPots, time: pots.length * m };
  }
  const btn = (x, y, w, label, patch, enabled, tip, active) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: active ? 'var(--blue)' : enabled ? '#fff' : '#f1f3f6', stroke: enabled || active ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: active ? '#fff' : enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const COL = ['#cfe3fb', '#fde2c4', '#d6f0d6', '#ead9f7', '#fbd5dc', '#fff3bf'];
  function draw(c) {
    const p = c.props, m = model(p); let s = '';
    if (m.mode === 0) {
      s += K.text(20, 26, '怎样安排最省时间？按顺序点下面的事', { size: 16, weight: 700, anchor: 'start' });
      const span = Math.max(m.sum, 10), X0 = 90, X1 = 680, x = (t) => X0 + (X1 - X0) * t / span;
      s += K.text(20, 82, '人', { size: 13, weight: 700, anchor: 'start' }) + K.text(20, 132, '自己进行', { size: 12, weight: 700, anchor: 'start' });
      for (let t = 0; t <= span; t++) s += K.line(x(t), 56, x(t), 150, { stroke: '#e3e7ef', w: 1 }) + (t % 2 === 0 || span <= 12 ? K.text(x(t), 166, String(t), { size: 9, fill: '#5a6478' }) : '');
      m.sch.waits.forEach(([a, b]) => { s += K.rect(x(a), 64, x(b) - x(a), 28, { fill: '#eceff4', stroke: '#b8c0cc', r: 3, w: 1, dash: '3 2' }) + K.text((x(a) + x(b)) / 2, 82, '等', { size: 11, fill: '#5f6773' }); });
      m.order.forEach((i) => { const t = m.tasks[i], y = t.auto ? 114 : 64; s += K.rect(x(m.sch.start[i]), y, x(m.sch.end[i]) - x(m.sch.start[i]), 28, { fill: COL[i % 6], stroke: '#3a4a63', r: 3, w: 1.2 }) + K.text((x(m.sch.start[i]) + x(m.sch.end[i])) / 2, y + 18, t.name, { size: 11, weight: 700 }); });
      m.tasks.forEach((t, i) => {
        const bx = 20 + (i % 3) * 225, by = 186 + Math.floor(i / 3) * 34, placed = m.order.includes(i);
        const why = placed ? '已经排了' : m.can[i] ? (t.auto ? '开个头，它自己进行；人可以去做别的' : '人要一直做') : '要先做：' + t.dep.map((d) => m.tasks[d].name).join('、');
        s += btn(bx, by, 215, t.name + ' ' + t.min + ' 分' + (t.auto ? '（自己进行）' : ''), { order: m.order.concat([i]).join(',') }, m.can[i], why, placed);
      });
      s += btn(20, 262, 100, '重新排', { order: '' }, m.order.length > 0, '全部拿下来重排');
      if (m.all) s += '<g data-read="1">' + K.text(20, 302, '一共 ' + m.sch.total + ' 分钟' + (m.sch.idle ? '（人等了 ' + m.sch.idle + ' 分钟）' : ''), { size: 16, weight: 700, anchor: 'start', fill: 'var(--blue)' }) +
        K.text(20, 326, m.sch.total === m.best ? '最省时间！能同时做的事放在一起做了' : '还能更快：最少 ' + m.best + ' 分钟。哪件事可以在“自己进行”的时候做？', { size: 13, weight: 700, anchor: 'start', fill: m.sch.total === m.best ? 'var(--blue)' : 'var(--bad)' }) +
        K.text(20, 348, '一件一件全加起来是 ' + m.sum + ' 分钟', { size: 12, anchor: 'start', fill: '#5a6478' }) + '</g>';
    } else {
      s += K.text(20, 26, m.n + ' 张饼，每面烙 ' + m.m + ' 分钟，锅里一次放 2 张', { size: 16, weight: 700, anchor: 'start' });
      for (let k = 0; k < m.n; k++) {
        const x0 = 30 + k * 110, on = m.pick.includes(k), full = m.sides[k] >= 2;
        const body = K.circle(x0 + 40, 90, 34, { fill: full ? '#c98a3a' : m.sides[k] === 1 ? '#e8c27a' : '#f6e3b4', stroke: on ? 'var(--blue)' : '#8a5a00', w: on ? 4 : 1.6 }) + K.text(x0 + 40, 86, '饼 ' + (k + 1), { size: 12, weight: 700 }) + K.text(x0 + 40, 104, m.sides[k] + ' / 2 面', { size: 11 });
        const np = on ? m.pick.filter((x) => x !== k) : m.pick.length < 2 && !full ? m.pick.concat([k]) : null;
        s += np ? '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ pick: np.join(',') })) + '" style="cursor:pointer"><title>' + (on ? '不放这张' : '放这张的一面') + '</title>' + body + '</g>' : body;
      }
      s += btn(30, 150, 140, '烙一锅（' + m.m + ' 分）', { pots: m.pots.map((x) => x.join(',')).concat([m.pick.join(',')]).join(';'), pick: '' }, m.pick.length >= 1 && !m.done, '把选好的放进锅里烙一面') + btn(180, 150, 90, '重来', { pots: '', pick: '' }, m.pots.length > 0, '全部重新烙');
      s += K.text(30, 206, '已经烙了 ' + m.pots.length + ' 锅：' + m.pots.map((x, i) => '第 ' + (i + 1) + ' 锅 ' + x.map((k) => '饼' + (k + 1)).join('+')).join('，'), { size: 12, anchor: 'start' });
      if (m.done) s += '<g data-read="1">' + K.text(30, 250, '全部烙好：' + m.pots.length + ' 锅 × ' + m.m + ' 分 = ' + m.time + ' 分钟', { size: 16, weight: 700, anchor: 'start', fill: 'var(--blue)' }) +
        K.text(30, 276, m.pots.length === m.minPots ? '最省时间：每一锅都放满了 2 面' : '还能更快：一共 ' + 2 * m.n + ' 面，每锅 2 面，最少 ' + m.minPots + ' 锅', { size: 13, weight: 700, anchor: 'start', fill: m.pots.length === m.minPots ? 'var(--blue)' : 'var(--bad)' }) + '</g>';
    }
    return s;
  }
  const I = (lo, hi, d, label) => ({ type: 'int', label, default: d, min: lo, max: hi, write: true });
  U.registerPack({
    id: 'optbench', version: 1,
    types: {
      optbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E4', 'E7'],
        label: '优化（安排时间）', prefix: '优化', group: '时间与变化', grades: [4, 4],
        alias: ['优化', '合理安排时间', '沏茶', '烧水', '烙饼', '统筹', '同时做', '最省时间'],
        props: {
          mode: { type: 'choice', label: '做什么', default: 0, choices: MODES, write: true },
          tasks: { type: 'text', label: '事情（名:分钟:人/自:要先做的编号；分号分开）', default: '洗水壶:1:人:;烧水:10:自:0;洗茶杯:2:人:;拿茶叶:1:人:;泡茶:1:人:1+2+3', write: true },
          order: { type: 'text', label: '排的顺序（自动）', default: '', write: true },
          n: I(1, 5, 3, '烙饼：几张'), m: I(1, 9, 3, '烙饼：每面几分钟'), pots: { type: 'text', label: '烙饼：每一锅放了哪几张（自动）', default: '', write: true }, pick: { type: 'text', label: '烙饼：这一锅选了哪几张（自动）', default: '', write: true },
        },
        outputs: {
          total: { dim: null, kind: 'num', label: '一共几分钟（排完 / 烙完才有）' }, best: { dim: null, kind: 'num', label: '最省时间：1（做到了才有）' }, idle: { dim: null, kind: 'num', label: '人等了几分钟（排完才有）' },
        },
        icon: () => K.rect(6, 12, 30, 10, { fill: '#cfe3fb', stroke: 'var(--ink)', r: 2, w: 1 }) + K.rect(20, 26, 30, 10, { fill: '#fde2c4', stroke: 'var(--ink)', r: 2, w: 1 }) + K.line(6, 42, 50, 42, { w: 1.4 }),
        size: () => [W, 400],
        grips: () => [],
        compute: (c) => {
          const m = model(c.props), o = {};
          if (m.mode === 0 && m.all) { o.total = num(m.sch.total); o.idle = num(m.sch.idle); if (m.sch.total === m.best) o.best = num(1); }
          if (m.mode === 1 && m.done) { o.total = num(m.time); if (m.pots.length === m.minPots) o.best = num(1); }
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.OptBench = { model, schedule, best, parseTasks };
})(typeof globalThis !== 'undefined' ? globalThis : window);
