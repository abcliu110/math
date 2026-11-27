/* 器材包 asn：总是 / 有时 / 从不（docs/new-instruments.md 4.3）。给一句话（来自规则库的“说法”），学生造例子去检验，最后判断：总是对、有时对、还是从不对。
 * 例子在卡片上点（2026-11-26 起不用属性面板）：范围里的每个例子都摆在卡片上，点一下就试，试过的染成 ✓ / ✗；一对数排成方格表（太多时先点第 1 个再点第 2 个）。
 *   内部仍记在属性“例子”（整数 7、一对数 3,5、分数 1/2）上，参考解照旧可以直接写。
 * 判断要有依据才算：说“有时”——要有一个成立的例子，也要有一个不成立的；说“总是 / 从不”——试够 5 个，没找到反例（证据 ②），把范围里的全试完才是穷举（③）；
 * 找到反例的话，“有时”才对（有时对的两边例子都摆出来了，证据 ④）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, RL = U.RuleLib;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const CL = RL.claims(), N = CL.length;
  const claimOf = (p) => CL[Math.max(0, Math.min(Number(p && p.claim) || 0, N - 1))];
  const sh = (c, x) => RL.show(c.domain, x);
  const list = (s) => String(s || '').split(';').filter(Boolean);
  const NAMES = ['还没选', '总是', '有时', '从不'];
  const itemOf = (c, text) => {
    const k = c.space.kind, items = c.space.items, tupleRat = k === 'tuple' && !!(items[0] && items[0][0] && items[0][0].n !== undefined);
    const v = RL.parse(k, text, tupleRat); if (v === null) return { err: k === 'tuple' ? '写成两个数，中间用逗号，比如 3,5' : k === 'rat' ? '写一个数，整数或分数都行，比如 1/2' : '写一个整数' };
    const key = RL.show(c.domain, v), hit = items.find((x) => RL.show(c.domain, x) === key);
    return hit === undefined ? { err: key + ' 不在这句话的范围里：' + (c.hint || '换一个') } : { item: hit, key };
  };

  function onSet(p, k, v) {
    if (k === 'claim') return { tested: '', ex: '', pa: '', guess: 0, msg: '' };
    if (k === 'ex') {
      const c = claimOf(p), t = String(v || '').trim(); if (!t) return { ex: '' };
      const r = itemOf(c, t); if (r.err) return { ex: '', msg: r.err };
      if (list(p.tested).includes(r.key)) return { ex: '', msg: r.key + ' 已经试过了' };
      const ok = c.test(r.item);
      return { tested: p.tested ? p.tested + ';' + r.key : r.key, ex: '', msg: r.key + (ok ? '：这句话对它成立' : '：这句话对它不成立——这是一个反例') };
    }
    return null;
  }
  function judge(p) {
    const c = claimOf(p), keys = list(p.tested), res = keys.map((key) => { const x = c.space.items.find((y) => sh(c, y) === key); return { key, ok: x !== undefined && c.test(x) }; });
    const yes = res.filter((r) => r.ok).length, no = res.length - yes, tr = RL.truth(c), full = res.length >= c.space.items.length;
    let lv = 0, ok = 0, msg = null;
    if (p.guess >= 1) {
      const a = tr.answer, mine = NAMES[p.guess];
      if (mine !== a) {
        const hit = p.guess === 1 ? no > 0 : p.guess === 3 ? yes > 0 : (yes === 0 || no === 0);
        msg = hit ? '你自己试出来的例子和“' + mine + '”对不上：' + (p.guess === 2 ? (yes === 0 ? '还没有一个例子让它成立' : '还没有一个例子让它不成立') : '看看红的那些') : '再想想：试试有没有例子让它不成立（成立）';
      } else if (p.guess === 2) { if (yes > 0 && no > 0) { ok = 1; lv = 4; msg = '“有时”：有成立的例子，也有不成立的例子，两边都摆出来了'; } else msg = '你说“有时”，还需要' + (yes === 0 ? '一个让它成立' : '一个让它不成立') + '的例子来证明'; }
      else if (res.length >= 5 || full) { ok = 1; lv = full ? 3 : 2; msg = full ? '“' + mine + '”：范围里的每一个都试过了' : '“' + mine + '”：试了 ' + res.length + ' 个，没有找到反例。但没试完的，还不能算证明'; }
      else msg = '你说“' + mine + '”，再多试几个例子（至少 5 个）';
    }
    return { c, res, yes, no, lv, ok, msg, answer: tr.answer };
  }

  const hitRect = (H, x, y, w, h, k, v) => H.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="transparent" data-pick-k="' + k + '" data-pick-v="' + v + '" style="cursor:pointer"/>');
  const pset = (H, x, y, w, h, o, tag) => H.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3" fill="transparent" data-pick-set="' + encodeURIComponent(JSON.stringify(o)) + '"' + (tag ? ' data-asn="' + K.esc(tag) + '"' : '') + ' style="cursor:pointer"/>');
  const fv = (t) => { const m = String(t).split('/'); return m.length === 2 ? Number(m[0]) / Number(m[1]) : Number(t); };
  // 例子板（2026-11-26，全部在卡片上操作）：这句话范围里的每个例子都摆在卡片上，点一下就试它，试过的染色（✓ 绿、✗ 红）。
  //   一个数：排成格子；一对数：两个数都不多（≤ 12）时排成“第 1 个 × 第 2 个”的方格表，太多时先点第 1 个数、再点第 2 个数。
  //   返回 { h, s }；size 和 draw 用同一套算法（H 为 null 时只量高度）。
  function board(p, W, y0, H) {
    const c = claimOf(p), keys = c.space.items.map((x) => sh(c, x)), done = {}, J = judge(p);
    J.res.forEach((r) => { done[r.key] = r.ok; });
    let s = '';
    const chip = (x, y, w, h, key, label, tag) => {
      const st = done[key], fill = st === undefined ? 'var(--sel-bg)' : st ? 'var(--good)' : 'var(--bad)';
      s += K.rect(x + 1, y + 1, w - 2, h - 2, { fill, r: 3 }) + K.text(x + w / 2, y + h / 2 + 4, label, { size: 10.5, weight: 700, fill: st === undefined ? 'var(--ink)' : '#fff' });
      if (H && st === undefined) pset(H, x, y, w, h, { ex: key }, tag || key);
    };
    if (c.space.kind !== 'tuple') {
      const cols = c.space.kind === 'rat' ? 9 : 10, cw = Math.floor((W - 20) / cols), rows = Math.ceil(keys.length / cols);
      keys.forEach((k, i) => chip(10 + (i % cols) * cw, y0 + Math.floor(i / cols) * 20, cw, 20, k, k));
      return { h: rows * 20, s };
    }
    const pairs = keys.map((k) => k.split(',')), uniq = (a) => [...new Set(a)].sort((x, y) => fv(x) - fv(y));
    const A = uniq(pairs.map((q) => q[0])), B = uniq(pairs.map((q) => q[1])), has = new Set(keys);
    if (A.length <= 12 && B.length <= 12) {
      const cw = Math.min(30, Math.floor((W - 56) / B.length)), x0 = 46;
      s += K.text(10, y0 + 13, '1＼2', { size: 9.5, anchor: 'start', fill: 'var(--dim)' });
      B.forEach((b, j) => { s += K.text(x0 + j * cw + cw / 2, y0 + 13, b, { size: 10, weight: 700, fill: 'var(--dim)' }); });
      A.forEach((a, i) => {
        const y = y0 + 18 + i * 19; s += K.text(x0 - 8, y + 13, a, { size: 10, weight: 700, anchor: 'end', fill: 'var(--dim)' });
        B.forEach((b, j) => { const k = a + ',' + b; if (has.has(k)) chip(x0 + j * cw, y, cw, 19, k, done[k] === undefined ? '·' : done[k] ? '✓' : '✗'); });
      });
      return { h: 18 + A.length * 19, s };
    }
    // 两步：先点第 1 个数，再点第 2 个数
    const cols = 10, cw = Math.floor((W - 20) / cols), pa = String(p.pa || '');
    s += K.text(10, y0 + 12, '先点第 1 个数：', { size: 10.5, anchor: 'start', fill: 'var(--dim)' });
    let y = y0 + 18;
    A.forEach((a, i) => {
      const x = 10 + (i % cols) * cw, yy = y + Math.floor(i / cols) * 20, on = a === pa;
      s += K.rect(x + 1, yy + 1, cw - 2, 18, { fill: on ? 'var(--accent)' : 'var(--sel-bg)', r: 3 }) + K.text(x + cw / 2, yy + 14, a, { size: 10.5, weight: 700, fill: on ? '#fff' : 'var(--ink)' });
      if (H) pset(H, x, yy, cw, 20, { pa: on ? '' : a }, 'a:' + a);
    });
    y += Math.ceil(A.length / cols) * 20 + 4;
    if (!pa) return { h: y - y0, s };
    s += K.text(10, y + 12, '再点第 2 个数（' + pa + ', ?）：', { size: 10.5, anchor: 'start', fill: 'var(--dim)' }); y += 18;
    const S2 = pairs.filter((q) => q[0] === pa).map((q) => q[1]).sort((x2, y2) => fv(x2) - fv(y2));
    S2.forEach((b, i) => chip(10 + (i % cols) * cw, y + Math.floor(i / cols) * 20, cw, 20, pa + ',' + b, b));
    y += Math.ceil(S2.length / cols) * 20;
    return { h: y - y0, s };
  }
  const sayLines = (say, W) => { const per = Math.max(14, Math.floor((W - 20) / 13)), lines = []; for (let i = 0; i < say.length; i += per) lines.push(say.slice(i, i + per)); return lines; };
  function draw(c0) {
    const p = c0.props, J = judge(p), W = c0.w, H = []; let s = '';
    const lines = sayLines(J.c.say, W);
    lines.forEach((ln, i) => { s += K.text(10, 20 + i * 18, ln, { size: 13, weight: 700, anchor: 'start' }); });
    let y = 20 + lines.length * 18 + 4;
    s += K.text(10, y + 10, '点一个例子试试（试过的变色：✓ 成立，✗ 不成立）', { size: 11, anchor: 'start', weight: 700 });
    const B = board(p, W, y + 16, H); s += B.s; y += 16 + B.h + 18;
    s += K.text(10, y, '试过 ' + J.res.length + ' 个：成立 ' + J.yes + '，不成立 ' + J.no + (J.no ? '（反例 ✗）' : ''), { size: 11, anchor: 'start', fill: 'var(--dim)' });
    const last = J.res[J.res.length - 1]; if (last) s += K.text(W - 10, y, '上一个：' + (last.ok ? '✓ ' : '✗ ') + last.key, { size: 11, anchor: 'end', weight: 700, fill: last.ok ? 'var(--good)' : 'var(--bad)' });
    y += 22;
    s += K.text(10, y + 8, '这句话：', { size: 11, anchor: 'start', fill: 'var(--dim)' });
    [1, 2, 3].forEach((v, i) => { const x = 62 + i * 76, on = p.guess === v; s += K.rect(x, y - 6, 68, 22, { fill: on ? 'var(--accent)' : 'var(--sel-bg)', r: 11 }) + K.text(x + 34, y + 9, NAMES[v], { size: 12.5, weight: 700, fill: on ? '#fff' : 'var(--ink)' }); hitRect(H, x, y - 6, 68, 22, 'guess', on ? 0 : v); });
    y += 30;
    const m = J.msg || p.msg; if (m) s += K.text(10, y, m.slice(0, 36), { size: 11.5, anchor: 'start', weight: 700, fill: J.ok ? 'var(--good)' : 'var(--dim)' });
    if (m && m.length > 36) s += K.text(10, y + 18, m.slice(36, 72), { size: 11.5, anchor: 'start', weight: 700, fill: J.ok ? 'var(--good)' : 'var(--dim)' });
    return s + H.join('');
  }
  const sizeOf = (c) => { const p = c.props, lines = sayLines(claimOf(p).say, 380).length; return [380, 20 + lines * 18 + 4 + 16 + board(p, 380, 0, null).h + 18 + 22 + 30 + 40]; };

  U.registerPack({
    id: 'asn', version: 1, needs: [],
    types: {
      asn: {
        explore: true,   // 探究和游戏：器材架上放在最后的“拓展”组
        workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E9', 'E8'],
        label: '总是有时从不', prefix: '说', group: '关系', grades: [1, 9], alias: ['总是', '有时', '从不', '反例', '举例', '判断对错', '说法'],
        props: {
          claim: { hidden: true, type: 'int', label: '说法编号（出题人设）', default: 0, min: 0, max: N - 1 },
          ex: { hidden: true, type: 'text', label: '例子（写一个数，或一对数 3,5）', default: '' }, pa: { hidden: true, type: 'text', label: '一对数：先点的第 1 个数', default: '' },
          tested: { hidden: true, type: 'text', label: '试过的例子', default: '', write: false },
          guess: { hidden: true, type: 'int', label: '我的判断（1 总是 2 有时 3 从不）', default: 0, min: 0, max: 3 },
          msg: { hidden: true, type: 'text', label: '提示', default: '', write: false },
        },
        onSet,
        outputs: {
          tests: { dim: null, kind: 'num', label: '试过几个' }, yes: { dim: null, kind: 'num', label: '成立的例子数' }, counter: { dim: null, kind: 'num', label: '反例数' },
          ok: { dim: null, kind: 'num', label: '判断对了且有依据（1/0）' }, lv: { dim: null, kind: 'num', label: '证据等级' }, guess: { dim: null, kind: 'num', label: '我的判断（1/2/3）' },
        },
        icon: () => K.text(32, 30, '总?', { size: 22, weight: 700, fill: 'var(--accent)' }),
        size: sizeOf,
        compute: (c) => {
          const J = judge(c.props);
          c.say(J.ok ? 'ok' : 'info', J.msg || c.props.msg || '选“总是 / 有时 / 从不”之前，先造几个例子试试');
          return { tests: num(J.res.length), yes: num(J.yes), counter: num(J.no), ok: num(J.ok), lv: num(J.lv), guess: num(c.props.guess) };
        },
        badge: (c) => (c.out.ok && Q.num(c.out.ok.data) ? '判断对了' : c.out.tests ? '试了 ' + c.out.tests.data.n : ''),
        draw,
      },
    },
  });
  U.Asn = { judge, itemOf };
})(typeof globalThis !== 'undefined' ? globalThis : window);
