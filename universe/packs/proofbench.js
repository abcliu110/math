/* 器材包 proofbench：证明台（多米诺归纳、写证明、猜想）。全部在卡片上点，不用开属性面板。
 * 右上角一直画着“证据阶梯”：① 记录 ② 很多例子 ③ 列全 ④ 证明，台面上做到哪一级就亮到哪一级（输出口 lv，和别的证明器材一样）。
 *   - 多米诺（归纳）：一排多米诺骨牌就是 n = 1、2、3……。点“看第 1 块”验证起点；点“看任意一块推下一块”，
 *     用式子（不是用具体的数）检查 S(k) + 第 k+1 项 = S(k+1)：两边化简一样就是恒等式。两件事都看过了，点“推倒第一块”：
 *     都成立，所有骨牌都倒（证据 ④）；起点不成立，一块也不倒；推一级不成立，倒到半路停下，写出停在哪一块。
 *     式子里有两条故意错的：一条推一级没问题但起点不对；一条 n = 1、2 都对，第 3 块就推不倒了。
 *   - 写证明：三步，每步点一个依据。依据只能是台面上已经看过、成立的事：起点验证过、推一级是恒等式、前两条合起来。
 *     “试了好多例子都对”不能当依据（例子再多也只是证据 ②）。三步依据都成立 → ④。
 *   - 猜想：点“如果……”“那么……”拼一条猜想，点“试例子”在 1–30 里检查：都对就记下来（①，还只是猜想）；有不对的写出反例（推翻）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, S = U.Seq;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const MODES = ['多米诺（归纳）', '写证明', '猜想'];
  const DEFS = [
    { name: '1 + 3 + … + (2n − 1) = n²', S: 'n^2', t: '2n-1', st: 'k² + (2k + 1) = k² + 2k + 1 = (k + 1)²' },
    { name: '1 + 2 + … + n = n(n + 1)/2', S: 'n(n+1)/2', t: 'n', st: 'k(k + 1)/2 + (k + 1) = (k + 1)(k + 2)/2' },
    { name: '2 + 4 + … + 2n = n(n + 1)', S: 'n(n+1)', t: '2n', st: 'k(k + 1) + 2(k + 1) = (k + 1)(k + 2)' },
    { name: '1 + 2 + 4 + … + 2ⁿ⁻¹ = 2ⁿ − 1', S: '2^n-1', t: '2^(n-1)', st: '(2ᵏ − 1) + 2ᵏ = 2ᵏ⁺¹ − 1' },
    { name: '1 + 3 + … + (2n − 1) = n² + 1 ？', S: 'n^2+1', t: '2n-1', st: '(k² + 1) + (2k + 1) = (k + 1)² + 1' },
    { name: '1 + 2 + … + n = n² − n + 1 ？', S: 'n^2-n+1', t: 'n', st: '(k² − k + 1) + (k + 1) = k² + 2 ≠ k² + k + 1' },
  ];
  const D = DEFS.map((d) => { const Sn = S.parse(d.S), tn = S.parse(d.t); return Object.assign({}, d, { Sn, tn, identity: S.sub(S.sub(S.shift(Sn), Sn), S.shift(tn)).length === 0, sum: (k) => { let s = Q(0); for (let i = 1; i <= k; i++) s = Q.add(s, S.at(tn, i)); return s; }, f: (k) => S.at(Sn, k) }); });
  const IFS = [['n 是奇数', (n) => n % 2 === 1], ['n 是偶数', (n) => n % 2 === 0], ['n 是 3 的倍数', (n) => n % 3 === 0], ['n 是质数', (n) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; }]];
  const THENS = [['n + 2 是奇数', (n) => (n + 2) % 2 === 1], ['n + 2 是偶数', (n) => (n + 2) % 2 === 0], ['n × n 是奇数', (n) => (n * n) % 2 === 1], ['n 是奇数', (n) => n % 2 === 1], ['n + 3 是 3 的倍数', (n) => (n + 3) % 3 === 0]];
  const REASONS = ['第 1 块验证过了（n = 1 成立）', '推一级是恒等式（对每个 k 都对）', '前两条合起来：每一块都会倒', '试了好多例子都对'];
  function model(p) {
    const mode = clamp(p.mode, 0, 2), rule = clamp(p.rule, 0, DEFS.length - 1), d = D[rule];
    const baseOk = Q.eq(d.sum(1), d.f(1)), seenBase = !!p.base, seenStep = !!p.step, pushed = !!p.push;
    let failedAt = null; if (baseOk && !d.identity) { for (let k = 1; k <= 30; k++) if (!Q.eq(Q.add(d.f(k), S.at(d.tn, k + 1)), d.f(k + 1))) { failedAt = k; break; } }
    const proved = seenBase && seenStep && baseOk && d.identity;
    const rs = [p.r1, p.r2, p.r3].map((x) => (x === undefined || x === '' ? -1 : clamp(x, -1, 3)));
    const valid = [rs[0] === 0 && seenBase && baseOk, rs[1] === 1 && seenStep && d.identity, rs[2] === 2 && seenBase && seenStep && baseOk && d.identity];
    const filled = valid.filter(Boolean).length;
    const ci = clamp(p.ci, -1, IFS.length - 1), ct = clamp(p.ct, -1, THENS.length - 1), tried = !!p.tried;
    let counter = null; if (ci >= 0 && ct >= 0) for (let n = 1; n <= 30; n++) if (IFS[ci][1](n) && !THENS[ct][1](n)) { counter = n; break; }
    const conjLv = tried && ci >= 0 && ct >= 0 && counter === null ? 1 : 0;
    const lv = mode === 0 ? (proved && pushed ? 4 : 0) : mode === 1 ? (filled === 3 ? 4 : 0) : conjLv;
    return { mode, rule, d, baseOk, seenBase, seenStep, pushed, failedAt, proved, rs, valid, filled, ci, ct, tried, counter, lv };
  }
  const btn = (x, y, w, label, patch, enabled, tip, active) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 24, { fill: active ? 'var(--blue)' : enabled ? '#fff' : '#f1f3f6', stroke: enabled || active ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 16, label, { size: 12, weight: 700, fill: active ? '#fff' : enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const show = (q) => Q.show(q);
  function ladder(lv, refuted) {
    let s = K.text(560, 50, refuted ? '被推翻了' : '证据', { size: 11, weight: 700, fill: refuted ? 'var(--bad)' : '#5a6478' });
    ['① 记录', '② 很多例子', '③ 列全', '④ 证明'].forEach((t, i) => { const on = lv >= i + 1; s += K.rect(600, 36 + (3 - i) * 22, 84, 20, { fill: on ? '#d6ecff' : '#fff', stroke: on ? 'var(--blue)' : '#c5ccda', r: 4, w: 1 }) + K.text(642, 50 + (3 - i) * 22, t, { size: 11, weight: on ? 700 : 400, fill: on ? '#1d4fa3' : '#8a94a6' }); });
    return s;
  }
  function draw(c) {
    const p = c.props, m = model(p); let s = '';
    MODES.forEach((t, i) => { s += btn(20 + i * 120, 8, 112, t, { mode: i }, m.mode !== i, '换到“' + t + '”', m.mode === i); });
    s += ladder(m.lv, m.mode === 2 && m.tried && m.counter !== null);
    if (m.mode === 0) {
      s += K.text(20, 54, '要证明：' + m.d.name, { size: 15, weight: 700, anchor: 'start' });
      DEFS.forEach((d, i) => { s += btn(20 + i * 30, 64, 26, String(i + 1), { rule: i, base: false, step: false, push: false, r1: '', r2: '', r3: '' }, m.rule !== i, '换一条：' + d.name, m.rule === i); });
      s += K.text(210, 81, '（换一条式子）', { size: 11, anchor: 'start', fill: '#5a6478' });
      // 多米诺：12 块
      const fallTo = !m.pushed ? 0 : !m.baseOk ? 0 : m.proved ? 12 : m.failedAt ? Math.min(12, m.failedAt) : 0;
      for (let i = 1; i <= 12; i++) {
        const x = 40 + (i - 1) * 44, y = 190, down = i <= fallTo;
        s += down ? '<g transform="rotate(' + (i === fallTo && !m.proved ? 60 : 72) + ' ' + (x + 14) + ' ' + y + ')">' + K.rect(x, y - 60, 14, 60, { fill: '#9fc3ea', stroke: '#2f4a73', r: 2, w: 1.2 }) + '</g>' : K.rect(x, y - 60, 14, 60, { fill: '#fff', stroke: '#2f4a73', r: 2, w: 1.2 });
        s += K.text(x + 7, y + 18, String(i), { size: 11, fill: '#5a6478' });
      }
      s += btn(20, 222, 150, '看第 1 块（n = 1）', { base: true }, !m.seenBase, '验证起点');
      if (m.seenBase) s += K.text(180, 239, '左边 ' + show(m.d.sum(1)) + '，右边 ' + show(m.d.f(1)) + (m.baseOk ? '：成立 ✓' : '：不成立 ✗'), { size: 13, weight: 700, anchor: 'start', fill: m.baseOk ? '#1f6a34' : '#a12a1f' });
      s += btn(20, 254, 150, '看任意一块推下一块', { step: true }, !m.seenStep, '用 k 代表任意一块，检查 S(k) + 第 k+1 项 = S(k+1)');
      if (m.seenStep) s += K.text(180, 271, m.d.st + (m.d.identity ? '：恒等式 ✓' : '：两边不一样 ✗'), { size: 12, weight: 700, anchor: 'start', fill: m.d.identity ? '#1f6a34' : '#a12a1f' });
      s += btn(20, 286, 150, '推倒第一块', { push: true }, m.seenBase && m.seenStep && !m.pushed, '两件事都看过了才能推') + btn(178, 286, 70, '扶起来', { push: false }, m.pushed, '把骨牌都扶起来');
      if (m.pushed) {
        const t = m.proved ? ['所有骨牌都倒了：第 1 块倒，每一块又推倒下一块', '对所有 n 都成立（证据 ④）'] : !m.baseOk ? ['第 1 块就不成立：一块也不倒', '推一级再对也没用，起点是证明的一半'] : ['第 ' + m.failedAt + ' 块倒了，没推倒第 ' + (m.failedAt + 1) + ' 块', 'n = ' + (m.failedAt + 1) + ' 时不成立：前面几个例子对，不等于都对'];
        s += '<g data-read="1">' + t.map((x, i) => K.text(20, 340 + i * 22, x, { size: 14, weight: 700, anchor: 'start', fill: m.proved ? 'var(--blue)' : 'var(--bad)' })).join('') + '</g>';
      }
    } else if (m.mode === 1) {
      s += K.text(20, 54, '写证明：' + m.d.name, { size: 15, weight: 700, anchor: 'start' });
      s += K.text(20, 74, '每一步点一个依据。依据只能是台面上已经看过、成立的事。', { size: 12, anchor: 'start', fill: '#5a6478' });
      const steps = ['起点：n = 1 时成立', '推一级：' + m.d.st, '所以对所有 n 都成立'];
      steps.forEach((t, i) => {
        const y = 88 + i * 82, key = 'r' + (i + 1), r = m.rs[i];
        s += K.rect(20, y, 520, 76, { fill: m.valid[i] ? '#eef7ee' : '#fff', stroke: m.valid[i] ? '#1f6a34' : '#c5ccda', r: 8, w: 1.2 }) + K.text(32, y + 20, '第 ' + (i + 1) + ' 步：' + t, { size: 13, weight: 700, anchor: 'start' });
        REASONS.forEach((rt, j) => { s += btn(32 + (j % 2) * 252, y + 28 + Math.floor(j / 2) * 26, 246, rt, { [key]: j }, r !== j, '用这条当依据', r === j); });
        if (r === 3) s += K.text(540, y + 20, '例子不是依据', { size: 11, weight: 700, anchor: 'end', fill: 'var(--bad)' });
        else if (r >= 0 && !m.valid[i]) s += K.text(540, y + 20, r === i ? ((i === 0 ? m.seenBase : i === 1 ? m.seenStep : m.seenBase && m.seenStep) ? '这一条其实不成立' : '还没在多米诺里看过') : '这条依据管不到这一步', { size: 11, weight: 700, anchor: 'end', fill: 'var(--bad)' });
      });
      if (m.filled === 3) s += '<g data-read="1">' + K.text(20, 352, '三步的依据都成立：证明完成（证据 ④）', { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
      else s += K.text(20, 352, '依据成立的步数：' + m.filled + ' / 3', { size: 13, anchor: 'start' });
    } else {
      s += K.text(20, 54, '拼一条猜想：如果……那么……', { size: 15, weight: 700, anchor: 'start' });
      s += K.text(20, 82, '如果', { size: 13, weight: 700, anchor: 'start' });
      IFS.forEach((x, i) => { s += btn(60 + i * 120, 66, 114, x[0], { ci: i, tried: false }, m.ci !== i, '如果' + x[0], m.ci === i); });
      s += K.text(20, 118, '那么', { size: 13, weight: 700, anchor: 'start' });
      THENS.forEach((x, i) => { s += btn(60 + (i % 3) * 160, 102 + Math.floor(i / 3) * 30, 154, x[0], { ct: i, tried: false }, m.ct !== i, '那么' + x[0], m.ct === i); });
      if (m.ci >= 0 && m.ct >= 0) s += K.text(20, 186, '猜想：如果 ' + IFS[m.ci][0] + '，那么 ' + THENS[m.ct][0] + '。', { size: 14, weight: 700, anchor: 'start' });
      s += btn(20, 200, 150, '在 1 到 30 里试例子', { tried: true }, m.ci >= 0 && m.ct >= 0 && !m.tried, '一个一个检查');
      if (m.tried) {
        const ex = []; for (let n = 1; n <= 30 && ex.length < 6; n++) if (IFS[m.ci][1](n)) ex.push(n);
        s += K.text(20, 250, '例子：' + ex.map((n) => 'n = ' + n + (THENS[m.ct][1](n) ? ' ✓' : ' ✗')).join('，'), { size: 12, anchor: 'start' });
        s += '<g data-read="1">' + (m.counter === null ? K.text(20, 280, '1 到 30 里都对：记下来，这还只是猜想（证据 ①）', { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(20, 302, '要说“总是对”，得像多米诺那样证明', { size: 12, anchor: 'start', fill: 'var(--blue)' })
          : K.text(20, 280, '反例：n = ' + m.counter + '，' + IFS[m.ci][0] + '，可 ' + THENS[m.ct][0].replace(/n/g, String(m.counter)) + ' 不成立：猜想被推翻', { size: 14, weight: 700, anchor: 'start', fill: 'var(--bad)' })) + '</g>';
      }
    }
    return s;
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  U.registerPack({
    id: 'proofbench', version: 1,
    types: {
      proofbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E9', 'E6'],
        label: '证明台', prefix: '证明', group: '关系', grades: [5, 9],
        alias: ['证明', '数学归纳法', '多米诺', '归纳', '依据', '猜想', '反例', '如果那么', '证据'],
        props: {
          mode: { type: 'choice', label: '做什么', default: 0, choices: MODES, write: true },
          rule: { type: 'choice', label: '要证明的式子', default: 0, choices: DEFS.map((d) => d.name), write: true },
          base: { type: 'bool', label: '看过第 1 块', default: false, write: true }, step: { type: 'bool', label: '看过推一级', default: false, write: true }, push: { type: 'bool', label: '推倒了', default: false, write: true },
          r1: { type: 'text', label: '第 1 步的依据（编号）', default: '', write: true }, r2: { type: 'text', label: '第 2 步的依据', default: '', write: true }, r3: { type: 'text', label: '第 3 步的依据', default: '', write: true },
          ci: I(-1, 3, -1, '猜想：如果（编号）'), ct: I(-1, 4, -1, '猜想：那么（编号）'), tried: { type: 'bool', label: '试过例子', default: false, write: true },
        },
        outputs: {
          lv: { dim: null, kind: 'num', label: '证据等级' }, refuted: { dim: null, kind: 'bool', label: '被推翻' },
          base: { dim: null, kind: 'num', label: '起点成立 1、不成立 0（看过才有）' }, step: { dim: null, kind: 'num', label: '推一级是恒等式 1、不是 0（看过才有）' },
          failedAt: { dim: null, kind: 'num', label: '骨牌停在第几块（推了、停下才有）' }, filled: { dim: null, kind: 'num', label: '写证明：依据成立的步数' }, counter: { dim: null, kind: 'num', label: '猜想的反例（试过、有反例才有）' },
        },
        icon: () => [0, 1, 2, 3].map((i) => '<g transform="rotate(' + (i < 2 ? 60 : 0) + ' ' + (12 + i * 11) + ' 40)">' + K.rect(8 + i * 11, 16, 7, 24, { fill: i < 2 ? '#9fc3ea' : '#fff', stroke: 'var(--ink)', r: 1, w: 1 }) + '</g>').join(''),
        size: () => [W, 400],
        grips: () => [],
        compute: (c) => {
          const m = model(c.props), o = { lv: num(m.lv), refuted: U.val('bool', m.mode === 2 && m.tried && m.counter !== null), filled: num(m.filled) };
          if (m.seenBase) o.base = num(m.baseOk ? 1 : 0);
          if (m.seenStep) o.step = num(m.d.identity ? 1 : 0);
          if (m.pushed && m.baseOk && !m.proved && m.failedAt) o.failedAt = num(m.failedAt);
          if (m.mode === 2 && m.tried && m.counter !== null) o.counter = num(m.counter);
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.ProofBench = { model, DEFS };
})(typeof globalThis !== 'undefined' ? globalThis : window);
