/* MathWorld — pure model (no DOM).
   One world: pieces live in slots; laws only compute derived.
   Verbs: makePiece / place / take / combine / set (domain sugar).
   v0.3: procedures (NB-style). A lab procedure is a list of scored steps.
   Each step is checked against the world after every action. Practice mode
   exposes a hint for the next missed step; exam mode hides hints and only
   reports the score, the lost steps and the failed actions.
   Browser: window.MathWorld. Node: module.exports. */
(function (root) {
  'use strict';

  function gcd(a, b) {
    a = Math.abs(a | 0); b = Math.abs(b | 0);
    while (b) { const t = a % b; a = b; b = t; }
    return a || 1;
  }

  const Q = {
    of: function (n, d) {
      if (d === undefined) {
        if (!Number.isInteger(n)) throw new Error('MathWorld.Q: integer required, got ' + n);
        return { n: n, d: 1 };
      }
      if (!Number.isInteger(n) || !Number.isInteger(d)) {
        throw new Error('MathWorld.Q: integers required, got ' + n + '/' + d);
      }
      if (d === 0) throw new Error('MathWorld.Q: denominator 0');
      if (d < 0) { n = -n; d = -d; }
      return Q.reduce({ n: n, d: d });
    },
    int: function (v) { return Q.of(v, 1); },
    reduce: function (q) {
      const g = gcd(q.n, q.d);
      return { n: q.n / g, d: q.d / g };
    },
    add: function (a, b) {
      const l = a.d * b.d / gcd(a.d, b.d);
      return Q.reduce({ n: a.n * (l / a.d) + b.n * (l / b.d), d: l });
    },
    sub: function (a, b) { return Q.add(a, { n: -b.n, d: b.d }); },
    mul: function (a, b) { return Q.reduce({ n: a.n * b.n, d: a.d * b.d }); },
    neg: function (a) { return { n: -a.n, d: a.d }; },
    abs: function (a) { return a.n < 0 ? Q.neg(a) : Q.reduce(a); },
    cmp: function (a, b) {
      const d = a.n * b.d - b.n * a.d;
      return d < 0 ? -1 : d > 0 ? 1 : 0;
    },
    eq: function (a, b) { return Q.cmp(a, b) === 0; },
    toNumber: function (q) { return q.n / q.d; },
    str: function (q) {
      const r = Q.reduce(q);
      return r.d === 1 ? String(r.n) : r.n + '/' + r.d;
    },
    fromPiece: function (p) {
      if (!p) return Q.int(0);
      if (p.kind === 'frac') return Q.of(p.n, p.d);
      return Q.int(p.v);
    },
  };

  function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

  function emptyWorld(extra) {
    const w = {
      pieces: {},
      tray: [],
      tenframe: { A: 0, B: 0 },
      balance: { L: [], R: [] },
      numline: { pts: [], min: 0, max: 2 },
      fracboard: { A: Q.of(1, 2), B: Q.of(1, 3), touched: { A: false, B: false }, combined: false },
      linefn: { k: 2, b: 8 },
      chicken: null,
      log: [],
      meta: {},
      bench: [],
      dice: { A: [] }, // 两个骰子的点数之和分给 A 的那些；其余归 B
      benchLine: false, // 直线（linefn）是否放在实验台上
      benchBalance: false, // 天平是否放在实验台上（视图里显示天平）
      rect: { perim: 20, w: 1 }, // 周长一定的长方形：只调宽，长 = 周长/2 - 宽
    };
    if (extra) Object.keys(extra).forEach(function (k) { w[k] = extra[k]; });
    return w;
  }

  function pushLog(w, text, ok) {
    w.log.push({ t: Date.now(), text: text, ok: !!ok });
    if (w.log.length > 80) w.log.shift();
  }

  function sumPan(ids, pieces) {
    let s = Q.int(0);
    (ids || []).forEach(function (id) {
      const p = pieces[id];
      if (p) s = Q.add(s, Q.fromPiece(p));
    });
    return s;
  }

  function removeFromSlots(w, id) {
    w.bench = (w.bench || []).filter(function (x) { return x !== id; }); // 从台面拿到器材上
    w.tray = w.tray.filter(function (x) { return x !== id; });
    w.balance.L = w.balance.L.filter(function (x) { return x !== id; });
    w.balance.R = w.balance.R.filter(function (x) { return x !== id; });
  }

  function setPieceAt(w, id, at) {
    if (!w.pieces[id]) return;
    w.pieces[id].at = at;
  }

  /* ---------- Laws → derived (the only place consequences live) ---------- */
  function derived(world) {
    const w = world;
    const L = sumPan(w.balance.L, w.pieces);
    const R = sumPan(w.balance.R, w.pieces);
    const balDiff = Q.sub(L, R); // >0 left heavier
    const tilt = Math.max(-15, Math.min(15, -Q.toNumber(balDiff) * 3));
    const balEq = Q.eq(L, R);

    const tfSum = (w.tenframe.A | 0) + (w.tenframe.B | 0);

    let gap = null;
    if (w.numline.pts.length === 2) {
      const a = w.numline.pts[0], b = w.numline.pts[1];
      gap = Q.sub(
        Q.cmp(a, b) >= 0 ? a : b,
        Q.cmp(a, b) >= 0 ? b : a
      );
    }

    const A = w.fracboard.A, B = w.fracboard.B;
    const naive = Q.reduce({ n: A.n + B.n, d: A.d + B.d });
    const trueSum = Q.add(A, B);
    const fracGap = Q.sub(trueSum, naive);
    const combined = !!(w.fracboard.combined || (w.meta && w.meta.fracAdded));

    const k = w.linefn.k, b0 = w.linefn.b;
    const ys = [0, 1, 2, 3, 4, 5].map(function (x) { return k * x + b0; });

    let chicken = null;
    if (w.chicken) {
      const c = w.chicken;
      const rabbits = c.rabbits | 0;
      const chickens = c.chickens | 0;
      const heads = rabbits + chickens;
      const legs = 4 * rabbits + 2 * chickens;
      const headGap = (c.targetHeads | 0) - heads;
      const legGap = (c.targetLegs | 0) - legs; // >0 means short
      // 可行性：全是鸡时腿最少 2H，全是兔时腿最多 4H；腿数必须是偶数，兔数 = (L - 2H) / 2。
      const H = c.targetHeads | 0, Lg = c.targetLegs | 0;
      const diff = Lg - 2 * H;
      let infeasibleReason = null;
      let solutionRabbits = null;
      if (H < 0) infeasibleReason = 'bad-heads';
      else if (diff < 0) infeasibleReason = 'legs-too-few';
      else if (diff > 2 * H) infeasibleReason = 'legs-too-many';
      else if (diff % 2 !== 0) infeasibleReason = 'odd-legs';
      else solutionRabbits = diff / 2;
      chicken = {
        feasible: infeasibleReason === null,
        infeasibleReason: infeasibleReason,
        solutionRabbits: solutionRabbits,
        rabbits: rabbits,
        chickens: chickens,
        heads: heads,
        legs: legs,
        targetHeads: c.targetHeads | 0,
        targetLegs: c.targetLegs | 0,
        headGap: headGap,
        legGap: legGap,
        headsOk: headGap === 0,
        legsOk: legGap === 0,
        solved: headGap === 0 && legGap === 0,
        // dual-constraint residual: each rabbit swap changes legs by +2 if heads fixed
        legPerRabbitSwap: 2,
        rabbitsToFixLegs: headGap === 0 ? Math.round(legGap / 2) : null,
      };
    }

    // Structured signals: what the world is telling the student right now.
    const signals = [];
    if (!balEq) {
      signals.push({
        domain: 'balance',
        level: 'warn',
        code: Q.toNumber(balDiff) > 0 ? 'left-heavy' : 'right-heavy',
        text: (Q.toNumber(balDiff) > 0 ? '左边重 ' : '右边重 ') + Q.str(Q.abs(balDiff)),
        residual: balDiff,
      });
    } else if ((w.balance.L.length + w.balance.R.length) > 0) {
      signals.push({ domain: 'balance', level: 'ok', code: 'equal', text: '天平平了：两边都是 ' + Q.str(L) });
    }

    if (combined) {
      if (!Q.eq(naive, trueSum)) {
        signals.push({
          domain: 'fracboard',
          level: 'warn',
          code: 'naive-wrong',
          text: '错拼 ' + Q.str(naive) + ' ≠ 正确 ' + Q.str(trueSum) + '（差 ' + Q.str(fracGap) + '）',
          naive: naive, trueSum: trueSum, gap: fracGap,
        });
      } else {
        signals.push({ domain: 'fracboard', level: 'ok', code: 'methods-agree', text: '两种拼法一样：' + Q.str(trueSum) });
      }
    }

    if (w.meta && w.meta.lastNumlineReject) {
      signals.push({ domain: 'numline', level: 'error', code: 'out-of-range', text: '数轴拒绝：不在 [' + w.numline.min + ', ' + w.numline.max + '] 里' });
    }
    if (gap) {
      signals.push({ domain: 'numline', level: 'info', code: 'gap', text: '两点相差 ' + Q.str(gap), gap: gap });
    }

    if (chicken && !chicken.feasible) {
      const why = {
        'bad-heads': '头数不能是负数',
        'legs-too-few': '腿数比全是鸡时还少，怎么配都不可能',
        'legs-too-many': '腿数比全是兔时还多，怎么配都不可能',
        'odd-legs': '腿的总数是奇数，鸡和兔的腿都是偶数，凑不出来',
      };
      signals.push({
        domain: 'chicken', level: 'error', code: chicken.infeasibleReason,
        text: '无解：' + (why[chicken.infeasibleReason] || '题目数据有问题'),
      });
    }
    if (chicken) {
      if (chicken.solved) {
        signals.push({ domain: 'chicken', level: 'ok', code: 'solved', text: '头腿都对上了：鸡 ' + chicken.chickens + '，兔 ' + chicken.rabbits });
      } else if (chicken.headsOk && !chicken.legsOk) {
        const need = chicken.rabbitsToFixLegs;
        signals.push({
          domain: 'chicken',
          level: 'warn',
          code: 'legs-off',
          text: chicken.legGap > 0
            ? ('腿还差 ' + chicken.legGap + '：头已对，大约还要换 ' + need + ' 只兔')
            : ('腿多了 ' + (-chicken.legGap) + '：头已对，大约要少 ' + (-need) + ' 只兔'),
          legGap: chicken.legGap,
        });
      } else {
        signals.push({
          domain: 'chicken',
          level: 'info',
          code: 'searching',
          text: '鸡 ' + chicken.chickens + ' · 兔 ' + chicken.rabbits + ' · 腿 ' + chicken.legs + '/' + chicken.targetLegs,
        });
      }
    }

    if (k < 0) {
      signals.push({ domain: 'linefn', level: 'info', code: 'negative-slope', text: 'k=' + k + ' < 0：直线向右下倾斜' });
    } else if (k === 0) {
      signals.push({ domain: 'linefn', level: 'info', code: 'horizontal', text: 'k=0：水平线，y 恒为 ' + b0 });
    } else {
      signals.push({ domain: 'linefn', level: 'info', code: 'positive-slope', text: 'k=' + k + ' > 0：直线向右上倾斜' });
    }

    const rectV = rectView(w.rect);
    signals.push.apply(signals, rectV.signals);
    const diceV = diceView(w.dice || { A: [] });
    signals.push.apply(signals, diceV.signals);

    if (tfSum > 0) {
      signals.push({ domain: 'tenframe', level: 'info', code: 'sum', text: '十格阵合计 ' + tfSum });
    }

    return {
      balance: {
        L: L, R: R, tilt: tilt, equal: balEq,
        Lstr: Q.str(L), Rstr: Q.str(R),
        diff: balDiff, diffStr: Q.str(Q.abs(balDiff)),
        leftHeavy: Q.cmp(L, R) > 0, rightHeavy: Q.cmp(L, R) < 0,
      },
      tenframe: {
        A: w.tenframe.A | 0, B: w.tenframe.B | 0, sum: tfSum,
        fullA: (w.tenframe.A | 0) === 10, fullB: (w.tenframe.B | 0) === 10,
        canMintPiece: tfSum > 0,
      },
      numline: { pts: w.numline.pts.slice(), gap: gap, gapStr: gap ? Q.str(gap) : null, min: w.numline.min, max: w.numline.max },
      fracboard: {
        A: A, B: B, naive: naive, trueSum: trueSum,
        naiveStr: Q.str(naive), trueStr: Q.str(trueSum),
        gap: fracGap, gapStr: Q.str(fracGap),
        sameDenom: A.d === B.d, equalMethods: Q.eq(naive, trueSum),
        combined: combined,
      },
      linefn: { k: k, b: b0, ys: ys, yAt2: 2 * k + b0, intercept: b0, slope: k },
      chicken: chicken,
      trayCount: w.tray.length,
      trayIds: w.tray.slice(),
      bench: benchView(w),
      rect: rectV,
      dice: diceV,
      signals: signals,
      pieceCount: Object.keys(w.pieces).length,
    };
  }

  function goalMet(world, goal) {
    if (!goal || !goal.type) return false;
    const d = derived(world);
    switch (goal.type) {
      case 'balanceEqual': return d.balance.equal;
      case 'fracTrueKnown': return d.fracboard.trueStr === goal.trueStr;
      case 'fracExplored': return !!d.fracboard.combined &&
        (!goal.trueStr || d.fracboard.trueStr === goal.trueStr);
      case 'numlineRejected': return world.meta && world.meta.lastNumlineReject === true;
      case 'numlineHasPts': return d.numline.pts.length >= (goal.n || 1);
      case 'linefn': {
        const okK = goal.k === undefined || world.linefn.k === goal.k;
        const okB = goal.b === undefined || world.linefn.b === goal.b;
        return okK && okB;
      }
      case 'chickenSolved': return !!(d.chicken && d.chicken.solved);
      case 'tenframeSum': return d.tenframe.sum === goal.sum;
      case 'rectMaxArea': return d.rect.area === d.rect.best.area;
      case 'diceFair': return d.dice.fair;
      default: return false;
    }
  }

  /* ---------- Procedures (v0.3) ---------- */
  /* Pieces currently placed somewhere (tray, balance, numline, fracboard). */
  function slotPieceValues(w) {
    return Object.keys(w.pieces).map(function (id) { return w.pieces[id]; })
      .filter(function (p) { return p.at && p.at !== 'free'; });
  }

  function hasFracPiece(w, trueStr) {
    return slotPieceValues(w).some(function (p) {
      return p.kind === 'frac' && Q.str(Q.of(p.n, p.d)) === trueStr;
    });
  }

  /* Each step: id, label (student-facing), points, check(world) -> bool.
     A step counts once it has been true after any action (see track). */
  const LAB_PROCEDURES = {
    'q-fracadd': {
      title: '分数相加',
      steps: [
        { id: 'combine', label: '把 1/2 和 1/3 合到一起', points: 1, via: ['fracCombine'],
          check: function (w) { return !!w.fracboard.combined; } },
        { id: 'mint', label: '把合起来的结果做成一块分数', points: 2, via: ['fracMint'], after: ['combine'],
          check: function (w) { return hasFracPiece(w, '5/6'); } },
        { id: 'contrast', label: '看见错拼 2/5 与正确和 5/6 的差别', points: 1, after: ['combine'],
          check: function (w) { return derived(w).signals.some(function (s) { return s.code === 'naive-wrong'; }); } },
      ],
    },
    'q-balfrac': {
      title: '天平上的分数',
      steps: [
        { id: 'addRight', label: '在右边放上分数', points: 1, via: ['balanceAddQty', 'place'],
          check: function (w) { return w.balance.R.length > 0; } },
        { id: 'equal', label: '让天平两边相等', points: 2, via: ['balanceAddQty', 'place'], after: ['addRight'],
          check: function (w) { return derived(w).balance.equal; } },
      ],
    },
    'q-numline': {
      title: '数轴上的数',
      steps: [
        { id: 'reject', label: '试一个超出范围的数，看数轴怎么拒绝', points: 1, via: ['place'],
          check: function (w) { return !!(w.meta && w.meta.lastNumlineReject); } },
        { id: 'place', label: '在数轴上放一个点', points: 1, via: ['place'],
          check: function (w) { return w.numline.pts.length >= 1; } },
        { id: 'gap', label: '放两个点，读出它们的距离', points: 2, via: ['place'], after: ['place'],
          check: function (w) { return w.numline.pts.length === 2; } },
      ],
    },
    'q-funcline': {
      title: '一次函数的斜率',
      steps: [
        { id: 'negative', label: '把 k 调成负数', points: 1, via: ['linefnSet'],
          check: function (w) { return w.linefn.k < 0; } },
        { id: 'target', label: '让 k 恰好是 -1', points: 2, via: ['linefnSet'], after: ['negative'],
          check: function (w) { return w.linefn.k === -1; } },
      ],
    },
    'q-chicken': {
      title: '鸡兔同笼',
      steps: [
        { id: 'try', label: '试一个兔子数', points: 1, via: ['chickenSetRabbits'],
          check: function (w) { return !!(w.chicken && w.chicken.rabbits > 0); } },
        { id: 'solve', label: '头和腿都对上', points: 2, via: ['chickenSetRabbits'], after: ['try'],
          check: function (w) { return !!(derived(w).chicken && derived(w).chicken.solved); } },
      ],
    },
  };

  /* Credit a step when all of these hold:
       - its state is true now,
       - the action just taken is one of its allowed types (via), so a seeded
         state alone does not count,
       - every prerequisite step (after) was already credited.
     Credited steps stay credited. Each step records the op index that earned it. */
  function track(w, type) {
    if (!w.procedure) return;
    const def = LAB_PROCEDURES[w.procedure.labId];
    if (!def) return;
    w.steps = w.steps || {};
    def.steps.forEach(function (s) {
      if (w.steps[s.id]) return;
      if (s.via && s.via.indexOf(type) < 0) return;
      if (s.after && !s.after.every(function (id) { return !!w.steps[id]; })) return;
      if (s.check(w)) w.steps[s.id] = { op: (w.ops || []).length };
    });
  }

  function procedureReport(world) {
    const p = world.procedure;
    if (!p) return null;
    const def = LAB_PROCEDURES[p.labId];
    if (!def) return null;
    const steps = world.steps || {};
    const lines = def.steps.map(function (s) {
      return { id: s.id, label: s.label, points: s.points, got: !!steps[s.id], op: steps[s.id] ? steps[s.id].op : null };
    });
    const max = lines.reduce(function (a, l) { return a + l.points; }, 0);
    const score = lines.reduce(function (a, l) { return a + (l.got ? l.points : 0); }, 0);
    const missed = lines.filter(function (l) { return !l.got; });
    const errors = world.errors || [];
    return {
      labId: p.labId,
      title: def.title,
      mode: p.mode,
      score: score,
      max: max,
      done: missed.length === 0,
      lines: lines,
      lost: missed.map(function (l) { return l.label; }),
      opCount: (world.ops || []).length,
      errorCount: errors.length,
      errorReasons: errors.map(function (e) { return e.reason; }),
      // Hints only in practice mode. Exam mode never reveals the next step.
      nextHint: p.mode === 'practice' && missed.length ? missed[0].label : null,
    };
  }

  /* ---------- 概率（v0.7）：两个骰子点数之和，分给 A 和 B，算概率，判断公平 ---------- */
  const DICE_TOTAL = 36; // 两个骰子 6×6 种结果
  function diceView(dc) {
    const A = dc.A || [];
    const sums = [];
    let pA = Q.int(0);
    for (let s = 2; s <= 12; s++) {
      const ways = 6 - Math.abs(s - 7); // 和为 s 的方法数：2 有 1 种，7 有 6 种
      const p = Q.of(ways, DICE_TOTAL);
      const who = A.indexOf(s) >= 0 ? 'A' : 'B';
      if (who === 'A') pA = Q.add(pA, p);
      sums.push({ sum: s, ways: ways, pStr: Q.str(p), who: who });
    }
    const pB = Q.sub(Q.int(1), pA);
    const fair = Q.eq(pA, pB);
    const signals = [fair
      ? { domain: 'dice', level: 'ok', code: 'fair', text: '公平：两人各得 ' + Q.str(pA) }
      : { domain: 'dice', level: 'warn', code: 'unfair', text: 'A 得 ' + Q.str(pA) + '，B 得 ' + Q.str(pB) + '，不公平' }];
    return { sums: sums, pA: pA, pAStr: Q.str(pA), pBStr: Q.str(pB), fair: fair, signals: signals };
  }

  /* ---------- 几何（v0.6）：周长一定的长方形，最大面积是正方形 ---------- */
  function rectView(r) {
    const perim = r.perim | 0;
    const half = perim / 2;
    const w = r.w | 0;
    const h = half - w;
    const area = w * h;
    // 最大面积：周长能被 4 整除时是正方形；否则宽取 floor(周长/4)，长取剩下的。
    const bw = Math.floor(perim / 4);
    const bh = half - bw;
    const bestArea = bw * bh;
    const signals = [];
    if (area === bestArea) {
      signals.push({ domain: 'rect', level: 'ok', code: 'max-area', text: '面积已经最大：' + bw + '×' + bh + '＝' + bestArea });
    } else {
      signals.push({ domain: 'rect', level: 'info', code: 'can-grow', text: '这个周长下面积还能更大：' + bw + '×' + bh + '＝' + bestArea + '（现在 ' + area + '）' });
    }
    return {
      perim: perim, w: w, h: h, area: area,
      isSquare: w === h,
      best: { w: bw, h: bh, area: bestArea },
      signals: signals,
    };
  }

  /* ---------- 实验台（v0.4）：自由拿数放上台，合并、拆分、看合计 ---------- */
  const BENCH_MAX = 6;
  function benchView(w) {
    const ids = w.bench || [];
    const items = ids.map(function (id) {
      const p = w.pieces[id];
      const q = p ? Q.fromPiece(p) : Q.int(0);
      return { id: id, q: q, str: Q.str(q), kind: p ? p.kind : null };
    });
    let total = Q.int(0);
    items.forEach(function (it) { total = Q.add(total, it.q); });
    const dens = {};
    items.forEach(function (it) { if (it.q.d !== 1) dens[it.q.d] = true; });
    return {
      items: items,
      total: total,
      totalStr: Q.str(total),
      count: items.length,
      mixedDen: Object.keys(dens).length > 1, // 分母不同：不能直接把分子相加
      full: items.length >= BENCH_MAX,
    };
  }

  function addPiece(w, piece, at) {
    const id = piece.id || ('p' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7));
    const p = Object.assign({ id: id, at: at || 'free' }, piece);
    w.pieces[id] = p;
    return id;
  }

  function applyRaw(world, intent) {
    if (!intent || !intent.type) return { world: world, ok: false, reason: 'missing intent' };
    const w = deepClone(world);
    const type = intent.type;

    if (type === 'reset') {
      const nw = emptyWorld();
      if (intent.seed) Object.assign(nw, intent.seed);
      return { world: nw, ok: true };
    }

    if (type === 'makePiece') {
      const pc = intent.piece || {};
      const ok = pc.kind === 'frac'
        ? Number.isInteger(pc.n) && Number.isInteger(pc.d) && pc.d > 0
        : Number.isInteger(pc.v);
      if (!ok) return { world: world, ok: false, reason: 'bad-number' };
      const id = addPiece(w, intent.piece, intent.at || 'free');
      pushLog(w, 'make ' + id, true);
      return { world: w, ok: true, pieceId: id };
    }

    if (type === 'trayAdd') {
      if (w.tray.length >= 3) {
        pushLog(w, 'tray full', false);
        return { world: world, ok: false, reason: 'tray-full' };
      }
      let id = intent.pieceId;
      if (!id && intent.piece) id = addPiece(w, intent.piece, 'tray');
      if (!id || !w.pieces[id]) return { world: world, ok: false, reason: 'no-piece' };
      removeFromSlots(w, id);
      w.tray.push(id);
      setPieceAt(w, id, 'tray');
      pushLog(w, 'tray add ' + id, true);
      return { world: w, ok: true };
    }

    if (type === 'trayClear') {
      w.tray.forEach(function (id) { if (w.pieces[id]) w.pieces[id].at = 'free'; });
      w.tray = [];
      return { world: w, ok: true };
    }

    /* Mint a piece from tenframe sum and put it on the tray (composition bridge). */
    if (type === 'tenframeMint') {
      const sum = (w.tenframe.A | 0) + (w.tenframe.B | 0);
      if (sum <= 0) return { world: world, ok: false, reason: 'tenframe-empty' };
      if (w.tray.length >= 3) return { world: world, ok: false, reason: 'tray-full' };
      const id = addPiece(w, { kind: 'num', v: sum, src: 'tenframe' }, 'tray');
      w.tray.push(id);
      pushLog(w, 'mint tenframe sum ' + sum, true);
      return { world: w, ok: true, pieceId: id };
    }

    if (type === 'place') {
      const id = intent.pieceId;
      const target = intent.target;
      if (!id || !w.pieces[id]) return { world: world, ok: false, reason: 'no-piece' };
      const p = w.pieces[id];
      const qty = Q.fromPiece(p);

      if (target === 'balance.L' || target === 'balance.R') {
        if (Q.toNumber(qty) < 0) {
          pushLog(w, 'balance rejects negative', false);
          return { world: world, ok: false, reason: 'balance-no-negative' };
        }
        const side = target === 'balance.L' ? 'L' : 'R';
        removeFromSlots(w, id);
        w.balance[side].push(id);
        setPieceAt(w, id, target);
        pushLog(w, 'place ' + id + ' on ' + target, true);
        return { world: w, ok: true };
      }

      if (target === 'numline') {
        const num = Q.toNumber(qty);
        if (num < w.numline.min || num > w.numline.max) {
          const rejected = deepClone(world);
          rejected.meta = Object.assign({}, rejected.meta, { lastNumlineReject: true });
          pushLog(rejected, 'numline reject ' + Q.str(qty), false);
          return { world: rejected, ok: false, reason: 'numline-out-of-range' };
        }
        if (w.numline.pts.length >= 2) {
          return { world: world, ok: false, reason: 'numline-full' };
        }
        w.numline.pts.push(Q.reduce(qty));
        w.meta.lastNumlineReject = false;
        removeFromSlots(w, id);
        setPieceAt(w, id, 'numline');
        pushLog(w, 'numline place ' + Q.str(qty), true);
        return { world: w, ok: true };
      }

      if (target === 'fracboard.A' || target === 'fracboard.B') {
        if (p.kind !== 'frac') return { world: world, ok: false, reason: 'fracboard-needs-frac' };
        const side = target === 'fracboard.A' ? 'A' : 'B';
        w.fracboard[side] = Q.of(p.n, p.d);
        w.fracboard.touched[side] = true;
        w.fracboard.combined = false;
        if (w.meta) w.meta.fracAdded = false;
        removeFromSlots(w, id);
        setPieceAt(w, id, target);
        return { world: w, ok: true };
      }

      return { world: world, ok: false, reason: 'unknown-target' };
    }

    if (type === 'take') {
      const id = intent.pieceId;
      if (!id || !w.pieces[id]) return { world: world, ok: false, reason: 'no-piece' };
      removeFromSlots(w, id);
      setPieceAt(w, id, 'free');
      return { world: w, ok: true };
    }

    if (type === 'balanceClear') {
      w.balance.L.forEach(function (id) { if (w.pieces[id]) w.pieces[id].at = 'free'; });
      w.balance.R.forEach(function (id) { if (w.pieces[id]) w.pieces[id].at = 'free'; });
      w.balance = { L: [], R: [] };
      return { world: w, ok: true };
    }

    if (type === 'balanceAddQty') {
      const side = intent.side === 'R' ? 'R' : 'L';
      const q = intent.qty ? Q.reduce(intent.qty) : Q.int(intent.v || 0);
      if (Q.toNumber(q) < 0) return { world: world, ok: false, reason: 'balance-no-negative' };
      const id = addPiece(w, q.d === 1 ? { kind: 'num', v: q.n } : { kind: 'frac', n: q.n, d: q.d }, 'balance.' + side);
      w.balance[side].push(id);
      return { world: w, ok: true, pieceId: id };
    }

    if (type === 'numlineClear') {
      w.numline.pts = [];
      w.meta.lastNumlineReject = false;
      Object.keys(w.pieces).forEach(function (id) {
        if (w.pieces[id].at === 'numline') w.pieces[id].at = 'free';
      });
      return { world: w, ok: true };
    }

    if (type === 'tenframeSet') {
      const side = intent.side === 'B' ? 'B' : 'A';
      let n = intent.n | 0;
      if (n < 0 || n > 10) return { world: world, ok: false, reason: 'tenframe-range' };
      w.tenframe[side] = n;
      return { world: w, ok: true };
    }

    if (type === 'tenframeToggle') {
      const side = intent.side === 'B' ? 'B' : 'A';
      const cur = w.tenframe[side] | 0;
      const filled = intent.filled;
      if (typeof filled === 'boolean') {
        w.tenframe[side] = filled ? Math.min(10, cur + 1) : Math.max(0, cur - 1);
      } else {
        w.tenframe[side] = cur >= 10 ? 9 : cur + 1;
      }
      return { world: w, ok: true };
    }

    if (type === 'fracboardSet') {
      const side = intent.side === 'B' ? 'B' : 'A';
      w.fracboard[side] = Q.of(intent.n, intent.d);
      w.fracboard.touched[side] = true;
      w.fracboard.combined = false;
      if (w.meta) w.meta.fracAdded = false;
      return { world: w, ok: true };
    }

    /* Combine A+B: laws expose naive vs true. This is the explore verb. */
    if (type === 'fracCombine') {
      w.fracboard.combined = true;
      w.meta = w.meta || {};
      w.meta.fracAdded = true; // back-compat with older goals/UI
      pushLog(w, 'frac combine', true);
      return { world: w, ok: true };
    }

    /* Mint a real fraction piece from the combined sum, so it can go on the
       balance or the number line. Composition, not just a flag. */
    if (type === 'fracMint') {
      if (!w.fracboard.combined) return { world: world, ok: false, reason: 'frac-not-combined' };
      if (w.tray.length >= 3) return { world: world, ok: false, reason: 'tray-full' };
      const s = Q.add(w.fracboard.A, w.fracboard.B);
      const id = addPiece(w, { kind: 'frac', n: s.n, d: s.d, src: 'fracboard' }, 'tray');
      w.tray.push(id);
      pushLog(w, 'mint frac ' + Q.str(s), true);
      return { world: w, ok: true, pieceId: id };
    }

    /* Start a lab procedure. mode: 'practice' (hints) or 'exam' (no hints). */
    if (type === 'procedureStart') {
      if (!LAB_PROCEDURES[intent.labId]) return { world: world, ok: false, reason: 'unknown-lab' };
      w.procedure = { labId: intent.labId, mode: intent.mode === 'exam' ? 'exam' : 'practice' };
      w.steps = {};
      w.errors = [];
      w.ops = [];
      return { world: w, ok: true };
    }

    /* 实验台动作 */
    if (type === 'benchPut') {
      const id = intent.pieceId;
      w.bench = w.bench || [];
      if (!id || !w.pieces[id]) return { world: world, ok: false, reason: 'no-piece' };
      if (w.bench.indexOf(id) >= 0) return { world: world, ok: false, reason: 'already-on-bench' };
      const at = w.pieces[id].at;
      if (at === 'numline' || (at && at.indexOf('fracboard') === 0)) return { world: world, ok: false, reason: 'piece-locked' };
      if (w.bench.length >= BENCH_MAX) return { world: world, ok: false, reason: 'bench-full' };
      removeFromSlots(w, id);
      w.bench.push(id);
      setPieceAt(w, id, 'bench');
      pushLog(w, 'bench put ' + id, true);
      return { world: w, ok: true };
    }

    if (type === 'benchTake') {
      const id = intent.pieceId;
      w.bench = w.bench || [];
      if (w.bench.indexOf(id) < 0) return { world: world, ok: false, reason: 'not-on-bench' };
      w.bench = w.bench.filter(function (x) { return x !== id; });
      setPieceAt(w, id, 'free');
      return { world: w, ok: true };
    }

    /* 合并：把台上几个数加成一个新数（真正的分数加法，分母按正确的方式算）。 */
    if (type === 'benchMerge') {
      const ids = (intent.ids || []).filter(function (x, i, a) { return a.indexOf(x) === i; });
      w.bench = w.bench || [];
      if (ids.length < 2) return { world: world, ok: false, reason: 'merge-needs-two' };
      if (ids.some(function (id) { return w.bench.indexOf(id) < 0; })) return { world: world, ok: false, reason: 'not-on-bench' };
      let s = Q.int(0);
      ids.forEach(function (id) { s = Q.add(s, Q.fromPiece(w.pieces[id])); });
      s = Q.reduce(s);
      w.bench = w.bench.filter(function (x) { return ids.indexOf(x) < 0; });
      ids.forEach(function (id) { delete w.pieces[id]; });
      const nid = addPiece(w, s.d === 1
        ? { kind: 'num', v: s.n, src: 'bench' }
        : { kind: 'frac', n: s.n, d: s.d, src: 'bench' }, 'bench');
      w.bench.push(nid);
      pushLog(w, 'bench merge = ' + Q.str(s), true);
      return { world: w, ok: true, pieceId: nid };
    }

    /* 拆分：把一个数平均拆成 k 份，每份是原来的 1/k。 */
    if (type === 'benchSplit') {
      const id = intent.pieceId;
      const k = intent.k | 0;
      w.bench = w.bench || [];
      if (w.bench.indexOf(id) < 0) return { world: world, ok: false, reason: 'not-on-bench' };
      if (k < 2 || k > BENCH_MAX) return { world: world, ok: false, reason: 'split-range' };
      if (w.bench.length - 1 + k > BENCH_MAX) return { world: world, ok: false, reason: 'bench-full' };
      const q = Q.fromPiece(w.pieces[id]);
      const part = Q.reduce({ n: q.n, d: q.d * k });
      w.bench = w.bench.filter(function (x) { return x !== id; });
      delete w.pieces[id];
      const ids = [];
      for (let i = 0; i < k; i++) {
        ids.push(addPiece(w, part.d === 1
          ? { kind: 'num', v: part.n, src: 'bench' }
          : { kind: 'frac', n: part.n, d: part.d, src: 'bench' }, 'bench'));
      }
      w.bench = w.bench.concat(ids);
      pushLog(w, 'bench split into ' + k + ' of ' + Q.str(part), true);
      return { world: w, ok: true, pieceIds: ids };
    }

    /* 直线拿上台面或拿下来。直线本身是 linefn（k、b），这里只记它在不在台上。 */
    if (type === 'benchLineToggle') {
      w.benchLine = !w.benchLine;
      return { world: w, ok: true };
    }
    if (type === 'benchBalanceToggle') {
      w.benchBalance = !w.benchBalance;
      return { world: w, ok: true };
    }

    /* 骰子：点一个和，就在 A 和 B 之间切换它的归属。 */
    if (type === 'diceToggle') {
      const s = intent.sum;
      if (!Number.isInteger(s) || s < 2 || s > 12) return { world: world, ok: false, reason: 'bad-sum' };
      const cur = (w.dice.A || []).slice();
      const i = cur.indexOf(s);
      if (i >= 0) cur.splice(i, 1); else cur.push(s);
      w.dice.A = cur.sort(function (a, b) { return a - b; });
      return { world: w, ok: true };
    }

    /* 长方形：只调宽，宽必须在 1 到 周长/2 - 1 之间，长和宽都是整数。 */
    if (type === 'rectSet') {
      const r = w.rect;
      const nw = intent.w;
      if (!Number.isInteger(nw)) return { world: world, ok: false, reason: 'bad-number' };
      if (nw < 1 || nw > r.perim / 2 - 1) return { world: world, ok: false, reason: 'rect-range' };
      r.w = nw;
      return { world: w, ok: true };
    }

    /* 过两点定直线：k = Δy/Δx，b = y1 - k·x1。 */
    if (type === 'linefnFromPoints') {
      const x1 = +intent.x1, y1 = +intent.y1, x2 = +intent.x2, y2 = +intent.y2;
      if (![x1, y1, x2, y2].every(Number.isFinite)) return { world: world, ok: false, reason: 'bad-points' };
      if (x1 === x2) return { world: world, ok: false, reason: 'vertical-line' };
      const k = (y2 - y1) / (x2 - x1);
      w.linefn.k = Math.round(k * 1e6) / 1e6;
      w.linefn.b = Math.round((y1 - k * x1) * 1e6) / 1e6;
      return { world: w, ok: true };
    }

    if (type === 'linefnSet') {
      if (intent.k !== undefined) w.linefn.k = +intent.k;
      if (intent.b !== undefined) w.linefn.b = +intent.b;
      return { world: w, ok: true };
    }

    if (type === 'chickenSeed') {
      w.chicken = {
        targetHeads: intent.targetHeads | 0,
        targetLegs: intent.targetLegs | 0,
        rabbits: intent.rabbits | 0,
        chickens: intent.chickens !== undefined ? (intent.chickens | 0) : ((intent.targetHeads | 0) - (intent.rabbits | 0)),
      };
      if (w.chicken.chickens < 0) w.chicken.chickens = 0;
      return { world: w, ok: true };
    }

    if (type === 'chickenSetRabbits') {
      if (!w.chicken) return { world: world, ok: false, reason: 'no-chicken' };
      const r = intent.rabbits | 0;
      if (r < 0 || r > w.chicken.targetHeads) return { world: world, ok: false, reason: 'rabbit-range' };
      w.chicken.rabbits = r;
      w.chicken.chickens = w.chicken.targetHeads - r;
      return { world: w, ok: true };
    }

    return { world: world, ok: false, reason: 'unknown-intent:' + type };
  }

  /* Public apply: runs the action, then (inside a procedure) records newly
     met steps and counts failed actions as errors. */
  function apply(world, intent) {
    let r;
    try {
      r = applyRaw(world, intent);
    } catch (e) {
      // Q rejects non-integers. Report it as a refused action, never a crash.
      return { world: world, ok: false, reason: 'bad-number' };
    }
    if (!intent || intent.type === 'procedureStart' || !r.world.procedure) return r;
    const w = r.ok ? r.world : deepClone(r.world);
    w.ops = (w.ops || []).concat([{ type: intent.type, ok: r.ok }]);
    if (!r.ok) {
      w.errors = (w.errors || []).concat([{ reason: r.reason, intent: intent.type }]);
    }
    track(w, intent.type);
    return { world: w, ok: r.ok, reason: r.reason, pieceId: r.pieceId };
  }

  function create(seed) {
    const w = emptyWorld();
    if (!seed) return w;
    if (seed.chicken) {
      w.chicken = {
        targetHeads: seed.chicken.targetHeads | 0,
        targetLegs: seed.chicken.targetLegs | 0,
        rabbits: seed.chicken.rabbits | 0,
        chickens: seed.chicken.chickens !== undefined
          ? (seed.chicken.chickens | 0)
          : ((seed.chicken.targetHeads | 0) - (seed.chicken.rabbits | 0)),
      };
    }
    if (seed.fracboard) {
      if (seed.fracboard.A) w.fracboard.A = Q.reduce(seed.fracboard.A);
      if (seed.fracboard.B) w.fracboard.B = Q.reduce(seed.fracboard.B);
      if (seed.fracboard.combined) w.fracboard.combined = true;
    }
    if (seed.balance) {
      (seed.balance.L || []).forEach(function (q) {
        const id = addPiece(w, q.d === 1 ? { kind: 'num', v: q.n } : { kind: 'frac', n: q.n, d: q.d }, 'balance.L');
        w.balance.L.push(id);
      });
      (seed.balance.R || []).forEach(function (q) {
        const id = addPiece(w, q.d === 1 ? { kind: 'num', v: q.n } : { kind: 'frac', n: q.n, d: q.d }, 'balance.R');
        w.balance.R.push(id);
      });
    }
    if (seed.tenframe) {
      w.tenframe.A = seed.tenframe.A | 0;
      w.tenframe.B = seed.tenframe.B | 0;
    }
    if (seed.linefn) {
      if (seed.linefn.k !== undefined) w.linefn.k = +seed.linefn.k;
      if (seed.linefn.b !== undefined) w.linefn.b = +seed.linefn.b;
    }
    if (seed.rect) {
      if (seed.rect.perim !== undefined) w.rect.perim = seed.rect.perim | 0;
      if (seed.rect.w !== undefined) w.rect.w = seed.rect.w | 0;
    }
    if (seed.numline) {
      if (seed.numline.min !== undefined) w.numline.min = +seed.numline.min;
      if (seed.numline.max !== undefined) w.numline.max = +seed.numline.max;
    }
    return w;
  }

  const LAB_SEEDS = {
    'q-fracadd': function () { return create({ fracboard: { A: Q.of(1, 2), B: Q.of(1, 3) } }); },
    'q-balfrac': function () { return create({ balance: { L: [Q.of(1, 2)], R: [] } }); },
    'q-numline': function () { return create({ tenframe: { A: 7, B: 0 }, numline: { min: 0, max: 2 } }); },
    'q-funcline': function () { return create({ linefn: { k: 2, b: 8 } }); },
    'q-chicken': function () {
      return create({ chicken: { targetHeads: 35, targetLegs: 94, rabbits: 0 } });
    },
    'q-maxarea': function () { return create({ rect: { perim: 20, w: 1 } }); },
    'q-fairgame': function () { return create(); },
  };

  const LAB_GOALS = {
    'q-fracadd': { type: 'fracExplored', trueStr: '5/6' },
    'q-balfrac': { type: 'balanceEqual' },
    'q-numline': { type: 'numlineRejected' },
    'q-funcline': { type: 'linefn', k: -1 },
    'q-chicken': { type: 'chickenSolved' },
    'q-maxarea': { type: 'rectMaxArea' },
    'q-fairgame': { type: 'diceFair' },
  };

  const api = {
    Q: Q,
    create: create,
    apply: apply,
    derived: derived,
    goalMet: goalMet,
    LAB_SEEDS: LAB_SEEDS,
    LAB_GOALS: LAB_GOALS,
    LAB_PROCEDURES: LAB_PROCEDURES,
    procedureReport: procedureReport,
    BENCH_MAX: BENCH_MAX,
    version: '0.8.0',
  };

  root.MathWorld = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
