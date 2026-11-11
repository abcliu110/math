/* 器材包 estimate：估算器（docs/new-instruments.md 6.11、3.2「先猜后看」）。
 * 接一个会算出结果的器材：先给一个估计（一个数，或一个范围），揭开以后看差多少。
 * 没有“错”，只有准不准；猜错不扣分，只记一条 guess 事件（见 world.js 的 set）。
 * 遮盖只是界面的：台面里的值照常流动、判分照常；估算器自己的卡片在估计填好之前显示“？”，不把实际值画出来。
 * 声明 guess 的器材（def.guess）都走同一套：ports 是揭开前被遮住的输出，props 是“填了估计”的属性，answered(props) 判断填了没有。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (q) => U.val('num', q, { dim: null });
  const TOL = Q(1, 5);          // 一个数的估计：差在实际值的 20% 以内算“估得准”
  const WIDE = Q(1);            // 范围估计：范围宽度超过实际值本身，算“太宽”
  const TENFOLD = Q(10);        // 差 10 倍以上，问一句“怎么估的”

  const parseQ = (s) => { const t = String(s === undefined || s === null ? '' : s).trim(); if (!t) return null; try { return Q.parse(t); } catch (e) { return null; } };
  const MODES = ['一个数', '一个范围'];
  // 估计填好了没有：一个数要填 guess；一个范围要 lo 和 hi 都填，且 lo ≤ hi
  const answered = (p) => {
    if (p.mode === 1) { const a = parseQ(p.lo), b = parseQ(p.hi); return !!(a && b && Q.cmp(a, b) <= 0); }
    return parseQ(p.guess) !== null;
  };
  const fmt = (q) => Q.showDec(q, 3);
  const abs = (q) => (Q.cmp(q, Q(0)) < 0 ? Q.sub(Q(0), q) : q);

  // 纯计算：actual 是 Q（或 null）。返回 { gap, pct, inRange, wide, off10 } 或 null（没填估计 / 没接实际值）
  function judge(p, actual) {
    if (!actual || !answered(p)) return null;
    if (p.mode === 1) {
      const lo = parseQ(p.lo), hi = parseQ(p.hi), inR = Q.cmp(lo, actual) <= 0 && Q.cmp(actual, hi) <= 0;
      const mid = Q.div(Q.add(lo, hi), Q(2)), gap = abs(Q.sub(actual, mid));
      const w = Q.sub(hi, lo), a = abs(actual);
      return { gap, pct: Q.cmp(a, Q(0)) === 0 ? null : Q.mul(Q.div(gap, a), Q(100)), inRange: inR, wide: inR && Q.cmp(a, Q(0)) > 0 && Q.cmp(w, Q.mul(a, WIDE)) > 0, off10: false, mid };
    }
    const g = parseQ(p.guess), gap = abs(Q.sub(actual, g)), a = abs(actual), zero = Q.cmp(a, Q(0)) === 0;
    const rel = zero ? null : Q.div(gap, a);
    return { gap, pct: rel === null ? null : Q.mul(rel, Q(100)), inRange: zero ? Q.cmp(gap, Q(0)) === 0 : Q.cmp(rel, TOL) <= 0, wide: false,
      off10: !zero && (Q.cmp(abs(g), Q.mul(a, TENFOLD)) >= 0 || (Q.cmp(abs(g), Q(0)) > 0 && Q.cmp(a, Q.mul(abs(g), TENFOLD)) >= 0)), mid: g };
  }
  const actualOf = (c) => { const v = K.first(c.d && c.d.inp ? c.d.inp.actual : null); return v && v.kind === 'num' ? v.data : null; };

  U.registerPack({
    id: 'estimate', version: 1,
    types: {
      estimate: {
        workspaceRole: 'none',
        handles: true, compactPorts: true,
        essence: ['E3', 'E7'],
        label: '估算器', prefix: '估', group: '数与运算', grades: [1, 9], alias: ['估算', '先估再算', '估一估', '大约', '范围'],
        props: {
          mode: { type: 'choice', label: '估的方式', default: 0, choices: MODES },
          guess: { type: 'text', label: '我估（一个数）', default: '' },
          lo: { type: 'text', label: '我估，最少', default: '' },
          hi: { type: 'text', label: '我估，最多', default: '' },
        },
        // 先猜后看：这几个输出在估计填好之前不显示（界面遮盖，内核照常算）；这几个属性改了就算“猜了一次”
        guess: { props: ['guess', 'lo', 'hi', 'mode'], ports: ['gap', 'pct', 'inRange'], answered },
        inputs: { actual: { kind: 'num', label: '实际值' } },
        outputs: {
          gap: { dim: null, kind: 'num', label: '差多少' }, pct: { dim: null, kind: 'num', label: '差百分之几' },
          inRange: { dim: null, kind: 'bool', label: '估准了（20% 以内 / 在范围里）' },
        },
        icon: () => K.text(32, 28, '≈?', { size: 22, weight: 700, fill: 'var(--accent)' }),
        size: () => [230, 130],
        compute: (c) => {
          const v = K.first(c.inp.actual);
          if (!v || v.kind !== 'num') { c.say('info', '接一个会算出结果的器材进来；结果先不给你看'); return {}; }
          if (!answered(c.props)) { c.say('info', c.props.mode === 1 ? '先估一个范围（最少、最多），再揭开' : '先估一个数，再揭开'); return {}; }
          const r = judge(c.props, v.data);
          const o = { gap: num(r.gap), inRange: U.val('bool', r.inRange) };
          if (r.pct !== null) o.pct = num(r.pct);
          if (r.off10) c.say('info', '差了十倍以上。你是怎么估的？先把数凑整再估试试。');
          else if (c.props.mode === 1) c.say(r.inRange ? (r.wide ? 'info' : 'ok') : 'info', r.inRange ? (r.wide ? '估中了，但范围太宽：试着缩小一点' : '估中了，范围也不大') : '实际值不在你估的范围里');
          else c.say(r.inRange ? 'ok' : 'info', r.inRange ? '估得准：差在 20% 以内' : '差了一些，再估一次看看能不能更近');
          return o;
        },
        badge: (c) => (c.masked ? '？' : (c.out.gap ? '差 ' + fmt(c.out.gap.data) : '')),
        draw: (c) => {
          const W = c.w, H = c.h;
          if (!answered(c.props)) return K.text(W / 2, H / 2 - 4, '？', { size: 40, weight: 700, fill: 'var(--accent)' }) + K.text(W / 2, H - 22, c.props.mode === 1 ? '先估一个范围' : '先估一个数', { size: 13, fill: 'var(--dim)' });
          const a = actualOf(c);
          if (!a) return K.text(W / 2, H / 2, '接一个实际值', { size: 14, fill: 'var(--dim)' });
          const r = judge(c.props, a), say = c.props.mode === 1 ? '你估 ' + c.props.lo + ' 到 ' + c.props.hi : '你估 ' + c.props.guess;
          const col = r.inRange ? 'var(--good)' : 'var(--ink)';
          return K.text(W / 2, 32, '实际 ' + fmt(a), { size: 22, weight: 700 }) + K.text(W / 2, 60, say, { size: 13 })
            + K.text(W / 2, 86, '差 ' + fmt(r.gap) + (r.pct !== null ? '（' + fmt(r.pct) + '%）' : ''), { size: 14, fill: col })
            + K.text(W / 2, 108, r.inRange ? (r.wide ? '估中了，范围太宽' : '估得准') : '再估一次？', { size: 12, fill: col });
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
