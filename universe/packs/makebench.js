/* 器材包 makebench：凑十与拆数（一年级）。两个十格框，点圆片就能挪、能划掉。
 *   - 凑十加法（9 + 6）：左框 9 个红片，右框 6 个蓝片。点右框里的片，它就挪进左框的空格；左框满了就是 10，
 *     下面写出“6 拆成 1 和 5”“10 + 5 = 15”。左框没满时读不出得数（还没凑成十）。
 *   - 破十减法（13 − 9）：左框满满 10 个，右边 3 个。点片就划掉它。先在十格框里划 9 个是“破十法”：10 − 9 = 1，1 + 3 = 4；
 *     先划右边的 3 个再划框里的 6 个是“平十法”：13 − 3 = 10，10 − 6 = 4。划够了就写出用的是哪种方法。
 *   - 分与合：一排 n 个圆片，点两片之间的缝把它分成两份，每找到一种分法记下来；全部找到就说“找全了”。
 * 这一版的边界（如实写）：只到 20 以内；分与合最多 10 个。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700, CA = '#e87a6b', CB = '#6fa3e0', R0 = 18, D = 44;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const MODES = ['凑十加法', '破十减法', '分与合', '对对碰'];
  const list = (t) => String(t || '').split(/[,，\s]+/).filter((x) => x !== '').map(Number).filter(Number.isInteger);
  function model(p) {
    const mode = clamp(p.mode, 0, 2);
    if (mode === 0) { const a = clamp(p.a, 1, 9), b = clamp(p.b, 1, 9), moved = clamp(p.moved, 0, Math.min(b, 10 - a)); return { mode, a, b, moved, left: a + moved, made: a + moved === 10, rest: b - moved }; }
    if (mode === 1) {
      const a = clamp(p.a, 11, 19), b = clamp(p.b, 1, 9), loose = a - 10, cross = [...new Set(list(p.cross))].filter((i) => i >= 0 && i < 10 + loose);
      const inTen = cross.filter((i) => i < 10).length, inLoose = cross.length - inTen, firstTen = cross.length ? cross[0] < 10 : null;
      const done = cross.length === b;
      // 方法：划的全在框里 → 破十（1）；先把右边的划光再划框里的 → 平十（2）；其他 → 0
      const method = !done ? 0 : inTen === b ? 1 : (inLoose === Math.min(loose, b) && cross.slice(0, inLoose).every((i) => i >= 10)) ? 2 : 0;
      return { mode, a, b, loose, cross, inTen, inLoose, done, method, left: a - cross.length, firstTen };
    }
    const n = clamp(p.n, 2, 10), splits = [...new Set(list(p.splits))].filter((k) => k >= 1 && k < n).sort((x, y) => x - y);
    return { mode, n, splits, all: splits.length === n - 1 };
  }
  // 十格框：两行五列
  const frame = (x0, y0) => { let s = K.rect(x0, y0, 5 * D, 2 * D, { fill: '#fffdf6', stroke: 'var(--ink)', r: 2, w: 1.6 }); for (let i = 1; i < 5; i++) s += K.line(x0 + i * D, y0, x0 + i * D, y0 + 2 * D, { stroke: '#8a94a6', w: 1 }); return s + K.line(x0, y0 + D, x0 + 5 * D, y0 + D, { stroke: '#8a94a6', w: 1 }); };
  const slot = (x0, y0, i) => [x0 + (i % 5) * D + D / 2, y0 + Math.floor(i / 5) * D + D / 2];
  const pick = (patch, tip, inner) => '<g data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"><title>' + K.esc(tip) + '</title>' + inner + '</g>';
  const disk = (x, y, f) => K.circle(x, y, R0, { fill: f, stroke: '#3a4a63', w: 1.4 });
  const cross = (x, y) => K.line(x - 13, y - 13, x + 13, y + 13, { stroke: 'var(--ink)', w: 3 }) + K.line(x - 13, y + 13, x + 13, y - 13, { stroke: 'var(--ink)', w: 3 });

  // ---------- 对对碰（mode 3）：cards 是一排数，taken 是已经配掉的，pick 是选中的那一张 ----------
  function pairModel(p) {
    const cards = String(p.cards || '3,7,9,1,5,5,2').split(',').map(Number).filter((x) => x >= 0 && x <= 10).slice(0, 14);
    const taken = new Set(String(p.taken || '').split(',').filter((x) => x !== '').map(Number).filter((i) => i < cards.length));
    const pick = Number.isFinite(+p.pick) && +p.pick >= 0 && +p.pick < cards.length && !taken.has(+p.pick) ? +p.pick : -1;
    const left = cards.map((v, i) => [v, i]).filter(([, i]) => !taken.has(i));
    let more = false; for (let a = 0; a < left.length; a++) for (let b = a + 1; b < left.length; b++) if (left[a][0] + left[b][0] === 10) more = true;
    return { cards, taken, pick, pairs: taken.size / 2, more };
  }
  function drawPair(c) {
    const p = c.props, m = pairModel(p); let s = '';
    s += K.text(20, 28, '对对碰：找出加起来是 10 的两张，配成一对', { size: 16, weight: 700, anchor: 'start' });
    m.cards.forEach((v, i) => {
      const x = 40 + (i % 7) * 88, y = 70 + Math.floor(i / 7) * 96, gone = m.taken.has(i), on = m.pick === i;
      const body = K.rect(x, y, 70, 82, { fill: gone ? '#eef7ee' : on ? '#d6ecff' : '#fff', stroke: gone ? '#9fd5ad' : on ? 'var(--blue)' : '#8a94a6', r: 10, w: on ? 3 : 1.4 }) + K.text(x + 35, y + 52, String(v), { size: 30, weight: 700, fill: gone ? '#9fb8a6' : 'var(--ink)' });
      if (gone) { s += body; return; }
      let patch;
      if (m.pick < 0 || m.pick === i) patch = { pick: m.pick === i ? -1 : i, msg: '' };
      else if (m.cards[m.pick] + v === 10) patch = { taken: [...m.taken, m.pick, i].join(','), pick: -1, msg: '' };
      else patch = { pick: -1, msg: m.cards[m.pick] + ' + ' + v + ' = ' + (m.cards[m.pick] + v) + '，不是 10' };
      s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"><title>卡片 ' + (i + 1) + '：' + v + '</title>' + body + '</g>';
    });
    s += K.text(40, 290, '配成了 ' + m.pairs + ' 对', { size: 14, weight: 700, anchor: 'start' });
    if (p.msg) s += K.text(40, 316, p.msg, { size: 13, weight: 700, anchor: 'start', fill: 'var(--bad)' });
    if (!m.more) s += '<g data-read="1">' + K.text(40, 344, '找完了：剩下的再也凑不成 10' + (m.pairs ? '（' + [...m.taken].sort((a, b) => a - b).map((i) => m.cards[i]).join('、') + '）' : ''), { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ taken: '', pick: -1, msg: '' })) + '" style="cursor:pointer"><title>重来</title>' + K.rect(560, 330, 110, 26, { fill: '#fff', stroke: 'var(--blue)', r: 7, w: 1.4 }) + K.text(615, 348, '重来', { size: 12, weight: 700 }) + '</g>';
    return s;
  }
  function draw(c) {
    if (+c.props.mode === 3) return drawPair(c);
    const p = c.props, m = model(p); let s = '';
    if (m.mode === 0) {
      const LX = 40, RX = 340, Y = 70;
      s += K.text(20, 28, m.a + ' + ' + m.b + ' = ?', { size: 18, weight: 700, anchor: 'start' }) + K.text(W - 20, 28, '点右边的蓝片，挪进左边的空格', { size: 12, anchor: 'end', fill: '#5a6478' });
      s += frame(LX, Y) + frame(RX, Y);
      for (let i = 0; i < m.a; i++) { const [x, y] = slot(LX, Y, i); s += disk(x, y, CA); }
      for (let i = 0; i < m.moved; i++) { const [x, y] = slot(LX, Y, m.a + i); s += disk(x, y, CB); }
      for (let i = 0; i < m.rest; i++) { const [x, y] = slot(RX, Y, i); const ok = !m.made; s += ok ? pick({ moved: m.moved + 1 }, '挪进左边', disk(x, y, CB)) : disk(x, y, CB); }
      s += K.text(LX + 110, Y + 2 * D + 22, '左边：' + m.left + ' 个', { size: 13, weight: 700, fill: m.made ? 'var(--blue)' : 'var(--ink)' }) + K.text(RX + 110, Y + 2 * D + 22, '右边：' + m.rest + ' 个', { size: 13, weight: 700 });
      if (m.moved > 0) {
        // 拆数图：b 拆成 moved 和 rest
        const cx = RX + 110, cy = 250;
        s += K.circle(cx, cy, 18, { fill: '#fff', stroke: 'var(--ink)', w: 1.4 }) + K.text(cx, cy + 6, String(m.b), { size: 16, weight: 700 });
        s += K.line(cx - 8, cy + 16, cx - 34, cy + 44, { w: 1.4 }) + K.line(cx + 8, cy + 16, cx + 34, cy + 44, { w: 1.4 });
        s += K.text(cx - 40, cy + 64, String(m.moved), { size: 16, weight: 700, fill: CB }) + K.text(cx + 40, cy + 64, String(m.rest), { size: 16, weight: 700 });
      }
      if (m.made) s += '<g data-read="1">' + K.text(40, 270, m.a + ' + ' + m.moved + ' = 10（凑成十）', { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(40, 296, '10 + ' + m.rest + ' = ' + (10 + m.rest), { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(40, 326, m.a + ' + ' + m.b + ' = ' + (m.a + m.b), { size: 18, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
      else s += K.text(40, 280, m.a + ' 还差 ' + (10 - m.left) + ' 个就满十', { size: 13, anchor: 'start', fill: '#5a6478' });
      if (m.moved > 0) s += pick({ moved: 0 }, '把挪过去的片都放回右边', K.rect(560, 330, 110, 26, { fill: '#fff', stroke: 'var(--blue)', r: 7, w: 1.4 }) + K.text(615, 348, '放回去重来', { size: 12, weight: 700 }));
    } else if (m.mode === 1) {
      const LX = 40, RX = 320, Y = 70;
      s += K.text(20, 28, m.a + ' − ' + m.b + ' = ?', { size: 18, weight: 700, anchor: 'start' }) + K.text(W - 20, 28, '点一个片就划掉它，一共划 ' + m.b + ' 个', { size: 12, anchor: 'end', fill: '#5a6478' });
      s += frame(LX, Y);
      const crossed = new Set(m.cross);
      const one = (i, x, y) => { const on = crossed.has(i), body = disk(x, y, CA) + (on ? cross(x, y) : ''); return on ? pick({ cross: m.cross.filter((j) => j !== i).join(',') }, '不划这个了', body) : (m.done ? body : pick({ cross: m.cross.concat([i]).join(',') }, '划掉', body)); };
      for (let i = 0; i < 10; i++) { const [x, y] = slot(LX, Y, i); s += one(i, x, y); }
      for (let j = 0; j < m.loose; j++) { const x = RX + j * D + D / 2, y = Y + D / 2; s += one(10 + j, x, y); }
      s += K.text(LX + 110, Y + 2 * D + 22, '十格框里 10 个', { size: 12, fill: '#5a6478' }) + K.text(RX + m.loose * D / 2, Y + D + 22, '还有 ' + m.loose + ' 个', { size: 12, fill: '#5a6478' });
      s += K.text(40, 236, '划掉了 ' + m.cross.length + ' / ' + m.b + ' 个（框里 ' + m.inTen + '，外面 ' + m.inLoose + '）', { size: 13, anchor: 'start' });
      if (m.done) {
        const ls = m.method === 1 ? ['破十法：先从 10 里减 ' + m.b + '：10 − ' + m.b + ' = ' + (10 - m.b), '再和外面的 ' + m.loose + ' 合起来：' + (10 - m.b) + ' + ' + m.loose + ' = ' + m.left]
          : m.method === 2 ? ['平十法：先减外面的 ' + m.loose + '：' + m.a + ' − ' + m.loose + ' = 10', '再减剩下的 ' + (m.b - m.loose) + '：10 − ' + (m.b - m.loose) + ' = ' + m.left]
            : ['划够了 ' + m.b + ' 个，还剩 ' + m.left + ' 个'];
        s += '<g data-read="1">' + ls.map((t, i) => K.text(40, 266 + i * 24, t, { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' })).join('') + K.text(40, 330, m.a + ' − ' + m.b + ' = ' + m.left, { size: 18, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
      }
      if (m.cross.length) s += pick({ cross: '' }, '全部不划了', K.rect(560, 330, 110, 26, { fill: '#fff', stroke: 'var(--blue)', r: 7, w: 1.4 }) + K.text(615, 348, '重来', { size: 12, weight: 700 }));
    } else {
      const X0 = 60, Y = 110, got = new Set(m.splits);
      s += K.text(20, 28, m.n + ' 可以分成几和几？', { size: 18, weight: 700, anchor: 'start' }) + K.text(W - 20, 28, '点两个圆片之间的缝，分成两份', { size: 12, anchor: 'end', fill: '#5a6478' });
      const last = m.splits.length ? Number(p.last) : 0;
      for (let i = 0; i < m.n; i++) { const x = X0 + i * 56 + (last && i >= last ? 24 : 0); s += disk(x, Y, last && i >= last ? CB : CA); }
      for (let k = 1; k < m.n; k++) {
        const x = X0 + k * 56 - 28 + (last && k > last ? 24 : last === k ? 12 : 0);
        s += pick({ splits: m.splits.concat([k]).join(','), last: k }, '从这里分开：' + k + ' 和 ' + (m.n - k), K.rect(x - 9, Y - 26, 18, 52, { fill: 'transparent', stroke: '#c5ccda', r: 4, w: 1, dash: '3 2' }));
      }
      if (last) s += K.text(40, 170, m.n + ' 分成 ' + last + ' 和 ' + (m.n - last), { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' });
      s += K.text(40, 206, '找到的分法（' + m.splits.length + ' / ' + (m.n - 1) + ' 种）：', { size: 13, weight: 700, anchor: 'start' });
      m.splits.forEach((k, i) => { s += K.text(40 + (i % 5) * 120, 232 + Math.floor(i / 5) * 24, k + ' 和 ' + (m.n - k), { size: 14, anchor: 'start', fill: got.has(m.n - k) && k !== m.n - k ? 'var(--ink)' : 'var(--ink)' }); });
      if (m.all) s += '<g data-read="1">' + K.text(40, 300, '找全了：' + m.n + ' 一共有 ' + (m.n - 1) + ' 种分法', { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(40, 324, '一份多 1，另一份就少 1：' + m.splits.map((k) => k + ' 和 ' + (m.n - k)).join('、'), { size: 12, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    }
    return s;
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  U.registerPack({
    id: 'makebench', version: 1,
    types: {
      makebench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E2', 'E3'],
        label: '凑十与拆数', prefix: '凑十', group: '数与运算', grades: [1, 2],
        alias: ['凑十', '凑十法', '破十法', '平十法', '十格框', '拆数', '分与合', '20 以内进位加法', '20 以内退位减法', '几和几'],
        props: {
          mode: { type: 'choice', label: '做什么', default: 0, choices: MODES, write: true },
          a: I(1, 19, 9, '第一个数'), b: I(1, 9, 6, '第二个数'), n: I(2, 10, 7, '分与合：几个'),
          moved: I(0, 9, 0, '凑十：挪过去几个'), cross: { type: 'text', label: '破十：划掉了哪几个（编号）', default: '', write: true }, splits: { type: 'text', label: '分与合：找到的分法', default: '', write: true }, cards: { type: 'text', label: '对对碰：一排数字卡片', default: '3,7,9,1,5,5,2', write: true }, taken: { type: 'text', label: '对对碰：配掉的卡片（自动）', default: '', write: true, hidden: true }, pick: { type: 'int', label: '对对碰：选中的卡片（自动）', default: -1, min: -1, max: 13, write: true, hidden: true }, msg: { type: 'text', label: '提示（自动）', default: '', write: true, hidden: true }, last: I(0, 9, 0, '分与合：刚点的缝（自动）', { hidden: true }),
        },
        outputs: {
          sum: { dim: null, kind: 'num', label: '凑成十以后的和（凑成了才有）' }, moved: { dim: null, kind: 'num', label: '挪过去几个' },
          diff: { dim: null, kind: 'num', label: '划够以后还剩几个（划够了才有）' }, method: { dim: null, kind: 'num', label: '用的方法：1 破十，2 平十，0 别的' },
          found: { dim: null, kind: 'num', label: '分与合：找到几种' }, all: { dim: null, kind: 'num', label: '分与合：找全了 1（找全了才有）' }, pairs: { dim: null, kind: 'num', label: '对对碰：配成了几对' }, paired: { dim: null, kind: 'num', label: '对对碰：找完了 1（再也凑不成 10 才有）' },
        },
        icon: () => K.rect(6, 12, 40, 18, { fill: '#fffdf6', stroke: 'var(--ink)', r: 1, w: 1 }) + K.circle(12, 21, 3.5, { fill: CA }) + K.circle(20, 21, 3.5, { fill: CA }) + K.circle(28, 21, 3.5, { fill: CA }) + K.circle(36, 21, 3.5, { fill: CB }) + K.text(26, 44, '凑十', { size: 9, weight: 700 }),
        size: () => [W, 400],
        grips: () => [],
        compute: (c) => {
          if (+c.props.mode === 3) { const q = pairModel(c.props), o = { pairs: U.val('num', Q(q.pairs), { dim: null }) }; if (!q.more) o.paired = U.val('num', Q(1), { dim: null }); return o; }
          const m = model(c.props), o = {};
          if (m.mode === 0) { o.moved = num(m.moved); if (m.made) o.sum = num(m.a + m.b); }
          else if (m.mode === 1) { if (m.done) { o.diff = num(m.left); o.method = num(m.method); } }
          else { o.found = num(m.splits.length); if (m.all) o.all = num(1); }
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.MakeBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
