/* 器材包 twoways：两种解法对照（docs/new-instruments.md 5.6）。同一道题两种解法并排：左边 4 项，右边 4 项（右边的顺序是打乱的），
 *   把左边每一项连到右边“讲同一件事”的那一项。改题目里的数（n 是兔的只数 / 乙是多少），两边每一项的值都跟着变：
 *   连对的一对，两边的值永远一样；连错的，换个数就对不上，两个数标红。判对错靠“n 取 1 到 8 的每个值，两边的值都一样”（穷举，③）。
 *   最后一个选择题：两种方法哪里一样、哪里不一样？
 * 和设计文档的差别（如实写）：这是一台独立的器材，不是“分屏放两个现有工作台”的题目版式（要 UI.Stage 同屏两个工作台，这一轮没做）；
 *   两种解法是内置的两道题（鸡兔同笼：假设法和列表法；和倍问题：线段图和方程），每边 4 项文字加一个会变的数，不是真的线段图和式子工作台；
 *   没有接 W.from 来历追踪，判对错用“值随 n 一起变”。*/
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', typeof n === 'number' ? Q(n) : n, { dim: null });
  const SCN = [
    {
      name: '鸡兔同笼：假设法和列表法', note: '一共 10 个头，脚 = 20 + 2n，n 是兔的只数',
      L: ['假设全是鸡，脚数', '实际比假设多的脚数', '换一只鸡成兔，多的脚数', '要换的只数 = 兔的只数'], R: ['表里“兔 0 只”那一行的脚数', '目标那一行比第一行多的脚数', '表里每多一只兔，脚数多', '目标那一行是第几行（从 0 起）'],
      lv: [() => 20, (n) => 2 * n, () => 2, (n) => n], rv: [() => 20, (n) => 2 * n, () => 2, (n) => n], perm: [2, 0, 3, 1],
      disc: ['数是一样的，说法和顺序不同', '两种方法得到的数完全不同', '只有最后的答案一样'],
    },
    {
      name: '和倍问题：线段图和方程', note: '乙是 n，甲是乙的 3 倍，两数的和是 4n',
      L: ['甲是乙的几倍（几份）', '一共几份', '一份是多少', '甲是多少'], R: ['甲 = 3x 里 x 的系数', 'x + 3x = 4n 里 x 的系数', '解得 x =', '甲 = 3x ='],
      lv: [() => 3, () => 4, (n) => n, (n) => 3 * n], rv: [() => 3, () => 4, (n) => n, (n) => 3 * n], perm: [3, 1, 0, 2],
      disc: ['数是一样的，说法和顺序不同', '两种方法得到的数完全不同', '只有最后的答案一样'],
    },
  ];
  const pairs = (s) => String(s || '').split(';').filter(Boolean).map((t) => t.split('-').map(Number));
  const NS = [1, 2, 3, 4, 5, 6, 7, 8];
  function judge(p) {
    const sc = SCN[p.sc], P = pairs(p.pairs), eqAll = (l, r) => NS.every((n) => sc.lv[l](n) === sc.rv[r](n));
    const right = P.filter(([l, r]) => eqAll(l, r)).length, wrong = P.length - right, all = P.length === 4 && right === 4 ? 1 : 0;
    return { sc, P, right, wrong, all, discOk: p.disc === 1 ? 1 : 0 };
  }
  function onSet(p, k, v) {
    const P = pairs(p.pairs), sc = SCN[p.sc], str = (a) => a.map((x) => x.join('-')).join(';');
    if (k === 'sc') return { pairs: '', ls: -1, disc: 0, n: 2 };
    if (k === 'lp') { if (!(v > 0)) return { lp: 0 }; const l = v - 1; const at = P.findIndex((x) => x[0] === l); if (at >= 0) { P.splice(at, 1); return { lp: 0, pairs: str(P), ls: -1 }; } return { lp: 0, ls: l }; }
    if (k === 'rp') { if (!(v > 0)) return { rp: 0 }; const r = sc.perm[v - 1], at = P.findIndex((x) => x[1] === r); if (at >= 0 && p.ls < 0) { P.splice(at, 1); return { rp: 0, pairs: str(P) }; } if (p.ls < 0) return { rp: 0 }; const Q2 = P.filter((x) => x[0] !== p.ls && x[1] !== r); Q2.push([p.ls, r]); Q2.sort((a, b) => a[0] - b[0]); return { rp: 0, pairs: str(Q2), ls: -1 }; }
    return null;
  }
  function draw(c) {
    const p = c.props, J = judge(p), sc = J.sc, H = []; let s = '', bw = 150, bh = 30, lx = 10, rx = 220, y0 = 36;
    s += K.text(10, 14, sc.name, { size: 11.5, anchor: 'start', weight: 700 }) + K.text(10, 28, sc.note, { size: 9.5, anchor: 'start', fill: 'var(--dim)' });
    const n = p.n;
    const rIdx = (slot) => sc.perm[slot], slotOf = (r) => sc.perm.indexOf(r);
    for (let i = 0; i < 4; i++) { const y = y0 + i * 38, sel = p.ls === i; s += K.rect(lx, y, bw, bh, { fill: sel ? 'var(--accent)' : 'var(--sel-bg)', r: 6 }) + K.text(lx + 6, y + 13, sc.L[i], { size: 9.5, anchor: 'start', fill: sel ? '#fff' : 'var(--ink)' }) + K.text(lx + bw - 6, y + 26, String(sc.lv[i](n)), { size: 11, anchor: 'end', weight: 700, fill: sel ? '#fff' : 'var(--ink)' }); H.push(hit('lp', i + 1, lx, y, bw, bh)); }
    for (let k = 0; k < 4; k++) { const y = y0 + k * 38, r = rIdx(k); s += K.rect(rx, y, bw, bh, { fill: 'var(--sel-bg)', r: 6 }) + K.text(rx + 6, y + 13, sc.R[r], { size: 9.5, anchor: 'start' }) + K.text(rx + bw - 6, y + 26, String(sc.rv[r](n)), { size: 11, anchor: 'end', weight: 700 }); H.push(hit('rp', k + 1, rx, y, bw, bh)); }
    J.P.forEach(([l, r]) => { const y1 = y0 + l * 38 + bh / 2, y2 = y0 + slotOf(r) * 38 + bh / 2, same = sc.lv[l](n) === sc.rv[r](n); s += '<line x1="' + (lx + bw) + '" y1="' + y1 + '" x2="' + rx + '" y2="' + y2 + '" stroke="' + (same ? 'var(--good)' : 'var(--bad)') + '" stroke-width="2.2"/>'; });
    s += K.text(10, y0 + 4 * 38 + 6, 'n = ' + n, { size: 12, anchor: 'start', weight: 700 });
    [[-1, '−'], [1, '+']].forEach(([d, tx], i) => { const x = 62 + i * 32; s += btn(x, y0 + 4 * 38 - 8, 28, 20, tx, false); H.push(hit('n', Math.max(1, Math.min(8, n + d)), x, y0 + 4 * 38 - 8, 28, 20)); });
    s += K.text(130, y0 + 4 * 38 + 6, J.P.length ? '连了 ' + J.P.length + ' 对，红线：换个数就对不上' : '先点左边一项，再点右边对应的一项', { size: 10, anchor: 'start', fill: J.wrong ? 'var(--bad)' : 'var(--dim)' });
    if (J.all) { s += K.text(10, y0 + 4 * 38 + 34, '问：两种方法哪里一样、哪里不一样？', { size: 10.5, anchor: 'start', weight: 700 }); sc.disc.forEach((tx, i) => { const y = y0 + 4 * 38 + 40 + i * 20, on = p.disc === i + 1; s += btn(10, y, 360, 17, tx + (on ? (i === 0 ? '　✓' : '　✗') : ''), on); H.push(hit('disc', on ? 0 : i + 1, 10, y, 360, 17)); }); }
    return s + H.join('');
  }
  const hit = (k, v, x, y, w, h) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="transparent" data-pick-k="' + k + '" data-pick-v="' + v + '" style="cursor:pointer"/>';
  const btn = (x, y, w, h, tx, on) => K.rect(x, y, w, h, { fill: on ? 'var(--accent)' : 'var(--sel-bg)', r: 5 }) + K.text(x + w / 2, y + h * 0.72, tx, { size: 10.5, weight: 700, fill: on ? '#fff' : 'var(--ink)' });
  U.registerPack({
    id: 'twoways', version: 1, needs: [], types: {
      twoways: {
        workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E12', 'E3', 'E4'], label: '两种解法对照', prefix: '对', group: '关系', grades: [3, 7], alias: ['两种解法', '对应', '鸡兔同笼', '和倍问题', '线段图', '方程', '假设法'],
        props: { sc: { type: 'choice', label: '哪道题', default: 0, choices: SCN.map((x) => x.name) }, n: { type: 'int', label: '题里的数 n', default: 2, min: 1, max: 8 }, pairs: { hidden: true, type: 'text', label: '连的对应', default: '', write: false }, ls: { hidden: true, type: 'int', label: '选中的左边项（−1 没有）', default: -1, min: -1, max: 3, write: false }, lp: { hidden: true, type: 'int', label: '点左边一项', default: 0, min: 0, max: 4 }, rp: { hidden: true, type: 'int', label: '点右边一项', default: 0, min: 0, max: 4 }, disc: { hidden: true, type: 'int', label: '哪里一样（1 数一样 2 数不同 3 只有答案一样）', default: 0, min: 0, max: 3 } },
        onSet,
        outputs: { right: { dim: null, kind: 'num', label: '连对了几对' }, wrong: { dim: null, kind: 'num', label: '连错了几对' }, all: { dim: null, kind: 'num', label: '4 对全连对（1/0）' }, discOk: { dim: null, kind: 'num', label: '选对了“哪里一样”（1/0）' }, lv: { dim: null, kind: 'num', label: '证据等级' } },
        icon: () => '<rect x="6" y="10" width="20" height="14" rx="3" fill="var(--sel-bg)"/><rect x="38" y="30" width="20" height="14" rx="3" fill="var(--sel-bg)"/><line x1="26" y1="17" x2="38" y2="37" stroke="var(--accent)" stroke-width="2"/>',
        size: (c) => [380, 250 + (judge(c.props).all ? 90 : 0)],
        compute: (c) => { const J = judge(c.props); c.say(J.all ? 'ok' : 'info', J.all ? '4 对全对' : J.P.length ? '连了 ' + J.P.length + ' 对，对 ' + J.right : '连对应'); return { right: num(J.right), wrong: num(J.wrong), all: num(J.all), discOk: num(J.discOk), lv: num(J.all ? 3 : 0) }; },
        badge: (c) => (c.out.right ? c.out.right.data.n + ' / 4' : ''),
        draw,
      },
    },
  });
  U.TwoWays = { SCN, judge, NS };
})(typeof globalThis !== 'undefined' ? globalThis : window);
