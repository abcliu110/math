/* 器材包 asn：总是 / 有时 / 从不（docs/new-instruments.md 4.3）。给一句话（来自规则库的“说法”），学生造例子去检验，最后判断：总是对、有时对、还是从不对。
 * 例子在属性“例子”里写（整数 7、一对数 3,5、分数 1/2）；必须在这句话的取值范围里才有效。
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
    if (k === 'claim') return { tested: '', ex: '', guess: 0, msg: '' };
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
  function draw(c0) {
    const p = c0.props, J = judge(p), W = c0.w, H = []; let s = '';
    const say = J.c.say, per = Math.max(14, Math.floor((W - 20) / 13));
    const lines = []; for (let i = 0; i < say.length; i += per) lines.push(say.slice(i, i + per));
    lines.forEach((ln, i) => { s += K.text(10, 20 + i * 18, ln, { size: 13, weight: 700, anchor: 'start' }); });
    let y = 20 + lines.length * 18 + 6;
    s += K.text(10, y + 8, '这句话：', { size: 11, anchor: 'start', fill: 'var(--dim)' });
    [1, 2, 3].forEach((v, i) => { const x = 62 + i * 76, on = p.guess === v; s += K.rect(x, y - 6, 68, 22, { fill: on ? 'var(--accent)' : 'var(--sel-bg)', r: 11 }) + K.text(x + 34, y + 9, NAMES[v], { size: 12.5, weight: 700, fill: on ? '#fff' : 'var(--ink)' }); hitRect(H, x, y - 6, 68, 22, 'guess', on ? 0 : v); });
    y += 30; s += K.text(10, y, '试过 ' + J.res.length + ' 个：成立 ' + J.yes + '，不成立 ' + J.no + (J.no ? '（反例 ✗）' : ''), { size: 11, anchor: 'start', fill: 'var(--dim)' });
    y += 8;
    J.res.slice(-8).forEach((r, i) => { const x = 10 + (i % 4) * 90, yy = y + Math.floor(i / 4) * 22; s += K.rect(x, yy, 84, 18, { fill: r.ok ? 'var(--good)' : 'var(--bad)', r: 4 }) + K.text(x + 42, yy + 13, (r.ok ? '✓ ' : '✗ ') + r.key, { size: 11, weight: 700, fill: '#fff' }); });
    y += Math.ceil(Math.min(8, J.res.length) / 4) * 22 + 8;
    const m = J.msg || p.msg; if (m) s += K.text(10, y + 6, m.slice(0, 36), { size: 11.5, anchor: 'start', weight: 700, fill: J.ok ? 'var(--good)' : 'var(--dim)' });
    if (m && m.length > 36) s += K.text(10, y + 24, m.slice(36, 72), { size: 11.5, anchor: 'start', weight: 700, fill: J.ok ? 'var(--good)' : 'var(--dim)' });
    else if (!J.res.length) s += K.text(10, y + 24, '在右边的“例子”里写一个数，试它', { size: 11, anchor: 'start', fill: 'var(--dim)' });
    return s + H.join('');
  }

  U.registerPack({
    id: 'asn', version: 1, needs: [],
    types: {
      asn: {
        workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E9', 'E8'],
        label: '总是有时从不', prefix: '说', group: '关系', grades: [1, 9], alias: ['总是', '有时', '从不', '反例', '举例', '判断对错', '说法'],
        props: {
          claim: { type: 'int', label: '说法编号（出题人设）', default: 0, min: 0, max: N - 1 },
          ex: { type: 'text', label: '例子（写一个数，或一对数 3,5）', default: '' },
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
        size: (c) => [380, 170 + Math.ceil(claimOf(c.props).say.length / 25) * 18 + Math.ceil(Math.min(8, list(c.props.tested).length) / 4) * 22],
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
