/* 器材包 fmachine：函数机和四联动（docs/new-instruments.md 6.5）。
 *   机器：里面藏着一个函数（× 3、× 2 + 1、x² + x + 1……）。学生喂一个数，先猜吐出几，再看（猜对连续 3 次，才有资格写规则）；
 *   觉得知道了就挑一条规则：它和真规则在 0 到 20 的整数上有不一样的地方，系统就喂那个数来区分（只喂 0 和 1 被骗的那种）。
 *   四联动：表格（x = 0 和 x = 1 两行）、图像（一条直线）、式子（y = kx + b）、情境（水箱注水），改任何一个，其余三个跟着变。
 * 和设计文档的差别（如实写）：函数库是固定的 8 条（不是任意式子）；四联动只做一次函数，表格只有 x = 0、x = 1 两行可改；
 * 规则相同的判定在 0–20 的整数上穷举（证据 ①，不是代数恒等）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', typeof n === 'number' ? Q(n) : n, { dim: null });
  const FN = [
    { say: '× 3', f: (x) => 3 * x }, { say: '× 2 + 1', f: (x) => 2 * x + 1 }, { say: 'x² + x + 1', f: (x) => x * x + x + 1 }, { say: '+ 5', f: (x) => x + 5 },
    { say: '× 2', f: (x) => 2 * x }, { say: '× 3 − 2', f: (x) => 3 * x - 2 }, { say: 'x²', f: (x) => x * x }, { say: '× 2 + 3', f: (x) => 2 * x + 3 },
  ];
  const STORY = ['每分钟注水 k 升，水箱里原来有 b 升（y = 现在的水量）', '每千克 k 元，另收 b 元包装费（y = 一共付多少元）', '每走 1 小时走 k 千米，出发时离家 b 千米（y = 离家多远）'];
  const toks = (s) => String(s || '').split(',').filter(Boolean).map((t) => { const m = t.split(':'); return { x: Number(m[0]), g: Number(m[1]), y: Number(m[2]) }; });
  const same = (a, b) => { for (let x = 0; x <= 20; x++) if (a.f(x) !== b.f(x)) return x; return -1; };
  const sec = (p) => FN[Math.max(0, Math.min(p.secret, FN.length - 1))];
  function onSet(p, k, v) {
    if (p.view === 0 && k === 'gy') {
      const t = String(v).trim(); if (t === '') return null;
      const x = Number(String(p.ex).trim()); if (!/^-?\d+$/.test(String(p.ex).trim()) || Math.abs(x) > 99) return { gy: '', msg: '先写一个要喂的整数（−99 到 99）' };
      const g = Number(t); if (!Number.isFinite(g)) return { gy: '', msg: '猜的结果写成一个数' };
      const y = sec(p).f(x);
      return { tried: p.tried ? p.tried + ',' + x + ':' + g + ':' + y : x + ':' + g + ':' + y, ex: '', gy: '', msg: x + ' 进去，出来 ' + y + (g === y ? '：猜对了' : '（你猜 ' + g + '）'), $guess: { right: g === y, gap: Math.abs(g - y) } };
    }
    if (k === 'k' || k === 'b') { const kk = k === 'k' ? v : p.k, bb = k === 'b' ? v : p.b; return { y0: bb, y1: kk + bb }; }
    if (k === 'y0' || k === 'y1') { const a = k === 'y0' ? v : p.y0, c = k === 'y1' ? v : p.y1; return { b: a, k: c - a }; }
    if (k === 'secret') return { tried: '', hyp: 0, ex: '', gy: '', msg: '' };
    return null;
  }
  function judge(p) {
    const t = toks(p.tried), r = sec(p); let streak = 0; for (let i = t.length - 1; i >= 0 && t[i].g === t[i].y; i--) streak++;
    const o = { tried: t.length, streak, solved: 0, counter: -1, msg: null };
    if (p.hyp >= 1 && p.hyp <= FN.length) {
      const H = FN[p.hyp - 1], bad = t.find((q) => H.f(q.x) !== q.y);
      if (bad) o.msg = '“' + H.say + '”放 ' + bad.x + ' 进去是 ' + H.f(bad.x) + '，可你试过：出来的是 ' + bad.y;
      else { const d = same(H, r); if (d >= 0) { o.counter = d; o.msg = '你试过的都对得上，但喂 ' + d + '：你的规则说 ' + H.f(d) + '，机器说 ' + r.f(d) + '。'; } else if (streak >= 3) { o.solved = 1; o.msg = '猜对了：' + r.say + '。在 0 到 20 的每个整数上都和机器一样（你是靠举例猜出来的）'; } else o.msg = '规则像是对的，但先连续猜对 3 次再说（现在连续 ' + streak + ' 次）'; }
    }
    return o;
  }
  const hit = (H, x, y, w, h, k, v) => H.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="transparent" data-pick-k="' + k + '" data-pick-v="' + v + '" style="cursor:pointer"/>');
  function draw(c) {
    const p = c.props, W = c.w, H = []; let s = '';
    if (p.view === 0) {
      const J = judge(p), t = toks(p.tried);
      s += K.rect(10, 10, 70, 36, { fill: 'var(--sel-bg)', r: 6 }) + K.text(45, 33, p.ex === '' ? '喂一个数' : String(p.ex), { size: 12, weight: 700 }) + K.text(95, 33, '→', { size: 18 });
      s += K.rect(110, 6, 70, 44, { fill: 'var(--accent)', r: 8 }) + K.text(145, 33, '？', { size: 22, weight: 700, fill: '#fff' }) + K.text(195, 33, '→', { size: 18 });
      s += K.rect(210, 10, 70, 36, { fill: 'var(--card)', stroke: 'var(--dim)', r: 6 }) + K.text(245, 33, p.gy === '' ? '先猜' : String(p.gy), { size: 12, weight: 700, fill: 'var(--dim)' });
      s += K.text(10, 66, '已喂 ' + t.length + ' 个，连续猜对 ' + J.streak + ' 次　（在右边“喂的数”“我猜”里写）', { size: 11, anchor: 'start', fill: 'var(--dim)' });
      t.slice(-7).forEach((q, i) => { const x = 10 + (i % 4) * 90, y = 74 + Math.floor(i / 4) * 22; s += K.rect(x, y, 84, 18, { fill: q.g === q.y ? 'var(--good)' : 'var(--bad)', r: 4 }) + K.text(x + 42, y + 13, q.x + ' → ' + q.y, { size: 11, weight: 700, fill: '#fff' }); });
      let y = 74 + Math.ceil(Math.min(7, t.length) / 4) * 22 + 14;
      s += K.text(10, y, '觉得知道了？点一条规则：', { size: 11.5, weight: 700, anchor: 'start' }); y += 8;
      let x = 10; FN.forEach((q, i) => { const wd = q.say.length * 9 + 22; if (x + wd > W - 8) { x = 10; y += 24; } const on = p.hyp === i + 1; s += K.rect(x, y, wd, 20, { fill: on ? 'var(--accent)' : 'var(--sel-bg)', r: 10 }) + K.text(x + wd / 2, y + 14, q.say, { size: 11, weight: on ? 700 : 400, fill: on ? '#fff' : 'var(--ink)' }); hit(H, x, y, wd, 20, 'hyp', on ? 0 : i + 1); x += wd + 5; });
      y += 36; const m = J.msg || p.msg; if (m) { s += K.text(10, y, m.slice(0, 34), { size: 11.5, anchor: 'start', weight: 700, fill: J.solved ? 'var(--good)' : 'var(--bad)' }); if (m.length > 34) s += K.text(10, y + 16, m.slice(34, 70), { size: 11.5, anchor: 'start', weight: 700, fill: J.solved ? 'var(--good)' : 'var(--bad)' }); }
    } else {
      s += K.text(10, 18, '情境：' + STORY[p.story], { size: 11.5, anchor: 'start', weight: 700 });
      const stp = (x, y, lab, k, val, lo, hi) => { s += K.text(x, y + 13, lab, { size: 11, anchor: 'start', fill: 'var(--dim)' }); [['−', Math.max(lo, val - 1), x + 30], ['+', Math.min(hi, val + 1), x + 80]].forEach(([tx, v, xx]) => { s += K.rect(xx, y, 20, 18, { fill: 'var(--sel-bg)', r: 4 }) + K.text(xx + 10, y + 13, tx, { size: 13, weight: 700 }); hit(H, xx, y, 20, 18, k, v); }); s += K.text(x + 63, y + 13, String(val), { size: 12, weight: 700 }); };
      stp(10, 30, 'k', 'k', p.k, -9, 9); stp(130, 30, 'b', 'b', p.b, -20, 40);
      s += K.text(10, 70, '式子：y = ' + (p.k === 1 ? '' : p.k === -1 ? '−' : p.k) + 'x ' + (p.b >= 0 ? '+ ' : '− ') + Math.abs(p.b), { size: 13, weight: 700, anchor: 'start' });
      s += K.text(10, 92, '表格', { size: 11, anchor: 'start', fill: 'var(--dim)' });
      for (let x = 0; x <= 4; x++) { const xx = 50 + x * 50; s += K.rect(xx, 80, 46, 36, { fill: x < 2 ? 'var(--sel-bg)' : 'var(--card)', stroke: 'var(--dim)', w: 0.8, r: 0 }) + K.text(xx + 23, 95, 'x=' + x, { size: 10.5, fill: 'var(--dim)' }) + K.text(xx + 23, 110, String(p.k * x + p.b), { size: 12, weight: 700 }); }
      s += K.text(10, 134, '每多 1，多 ' + p.k + '；x = 0 时，是 ' + p.b + (p.b === 0 ? '（正比例）' : ''), { size: 11.5, anchor: 'start' });
      const gx = 20, gy = 150, gw = W - 40, gh = 90, ymax = Math.max(10, p.k * 4 + p.b, p.b, 1), ymin = Math.min(0, p.k * 4 + p.b, p.b);
      const X = (x) => gx + x / 4 * gw, Y = (y) => gy + gh - (y - ymin) / (ymax - ymin) * gh;
      s += K.line(gx, Y(0), gx + gw, Y(0), { stroke: 'var(--dim)', w: 1 }) + K.line(X(0), gy, X(0), gy + gh, { stroke: 'var(--dim)', w: 1 }) + K.line(X(0), Y(p.b), X(4), Y(p.k * 4 + p.b), { stroke: 'var(--accent)', w: 2.5 });
      for (let x = 0; x <= 4; x++) s += K.circle(X(x), Y(p.k * x + p.b), 4, { fill: 'var(--accent)' });
    }
    return s + H.join('');
  }
  U.registerPack({
    id: 'fmachine', version: 1, needs: [],
    types: {
      fmachine: {
        workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E1', 'E8', 'E12'],
        label: '函数机', prefix: '机', group: '函数', grades: [3, 9], alias: ['函数机', '函数', '规则', '正比例', '一次函数', '四联动', '表格图像式子'],
        props: {
          secret: { type: 'int', label: '机器里的规则（出题人设）', default: 0, min: 0, max: FN.length - 1 },
          view: { type: 'choice', label: '看', default: 0, choices: ['机器', '四联动'] }, story: { type: 'choice', label: '情境', default: 0, choices: ['水箱注水', '买东西', '走路'] },
          ex: { type: 'text', label: '喂的数', default: '' }, gy: { type: 'text', label: '我猜吐出几', default: '' },
          tried: { hidden: true, type: 'text', label: '记录', default: '', write: false }, hyp: { hidden: true, type: 'int', label: '我的规则（第几条）', default: 0, min: 0, max: FN.length }, msg: { hidden: true, type: 'text', label: '提示', default: '', write: false },
          k: { type: 'int', label: 'k（每多 1 多几）', default: 1, min: -999, max: 999 }, b: { type: 'int', label: 'b（x = 0 时）', default: 0, min: -9999, max: 9999 },
          y0: { type: 'int', label: '表格：x = 0 时的 y', default: 0, min: -99999, max: 99999 }, y1: { type: 'int', label: '表格：x = 1 时的 y', default: 1, min: -99999, max: 99999 },
        },
        onSet,
        outputs: {
          tried: { dim: null, kind: 'num', label: '喂了几个' }, streak: { dim: null, kind: 'num', label: '连续猜对几次' }, solved: { dim: null, kind: 'num', label: '规则猜对了（1/0）' },
          counter: { dim: null, kind: 'num', label: '能区分的数（没有是 −1）' }, slope: { dim: null, kind: 'num', label: '斜率 k' }, intercept: { dim: null, kind: 'num', label: 'x = 0 时的值 b' }, direct: { dim: null, kind: 'num', label: '是正比例（1/0）' },
        },
        icon: () => K.rect(10, 18, 44, 28, { fill: 'var(--accent)', r: 6 }) + K.text(32, 38, 'f', { size: 18, weight: 700, fill: '#fff' }),
        size: (c) => (c.props.view === 0 ? [380, 270] : [380, 260]),
        compute: (c) => {
          const J = judge(c.props), p = c.props; c.say(J.solved ? 'ok' : 'info', J.msg || (p.view === 0 ? '喂一个数进去' : 'y = ' + p.k + 'x + ' + p.b));
          return { tried: num(J.tried), streak: num(J.streak), solved: num(J.solved), counter: num(J.counter), slope: num(p.k), intercept: num(p.b), direct: num(p.b === 0 && p.k !== 0 ? 1 : 0) };
        },
        badge: (c) => (c.out.solved && Q.num(c.out.solved.data) ? '猜对了' : ''),
        draw,
      },
    },
  });
  U.FMachine = { FN, judge };
})(typeof globalThis !== 'undefined' ? globalThis : window);
