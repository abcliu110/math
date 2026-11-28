/* 过程看得见、也留得下来（试验台增强 4，docs/instrument-design.md 末尾）。三件事的内核部分，界面在 js/ui/replay.js、panels.js、app.js：
 *
 * 1. 重放：一帧是一份台面快照（字符串，和撤销栈里的一样）。stepSay(a, b) 说第 i 步做了什么（一句人话）：
 *    联动组的这一步用组 log 的 label（“在「天平」上两边同时减 3”）；不然看这一步前后哪几个读数变了（“乙（兔）有几个 3 → 4，现在的总数 22 → 24”）；
 *    器材可以自己说（TALK[type].step(p0, p1)，比如天平写“2x + 3 = 11 → 2x = 8”）。重放只读快照，不改台面。
 * 2. 来历：why(scene, D, id, port, frames) → { head, calc:[…], group:[…], hist:[…] }，都是孩子听得懂的句子。
 *    calc：器材自己的算法（TALK[type].why，或器材声明 def.why(c, port)）；有追踪（D[id].trace，c.step / c.because）的用追踪；
 *    group：在联动组里的，组的 log（每一步在哪一台上做的、什么道理）；hist：这个数在每一步里是怎么变过来的（从重放的帧里算）。
 * 3. 看台面说话的提示：hintNow(problem, run, scene, D) → 一句话或 null。顺序：
 *    题目自己写的（problem.hintNow(W, m) 或 m.hintNow(W)）→ 器材声明的 def.hintNow(props, out, problem, ctx) → 这里登记的 TALK[type].hint(ctx)
 *    → 自动：当前这一步的里程碑有“某个读数 = 某个数”的目标，说“现在是几，要几：还差 / 多了几”。
 *    自动的那句只用在看得懂的读数上（开关、第几个、几次这类读数不说），先猜要藏住答案的那一步不说目标；说不出来就是 null（界面退回原来的三层提示）。
 * 都是纯函数：不改台面、不记事件。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q;
  const isNum = (v) => !!v && v.kind === 'num';
  const qOf = (v) => (isNum(v) ? v.data : null);
  const show = (q) => Q.show(q).replace(/^-/, '−');
  const showN = (n) => (n < 0 ? '−' + -n : String(n));
  // 看不懂“还差几”的读数：开关（1 是 0 否）、第几个、几次、进度、试了几种……
  const FLAG = /[：:，（(\s]1\s*(是|大|相交|（|，)|1\/0|\d\s*[一-龥]+[，,、]\s*\d|重合 1|\s1$|第几|选了|几次|进度|几种|几条|几个点|含的端点|被拦住|做了几步|算了几步/;
  // 读数的名字：去掉括号里的补充；“甲（分数）/ 上面的点”取前一半
  const cleanLabel = (s) => { const a = String(s || '').split(' / ')[0], b = a.split(/[（(]/)[0].trim(); return [...a].length <= 8 ? a : b || a; };

  // ---------- 器材自己说的话（最常用的几台操作台；器材也可以在声明里写 why / hintNow / stepSay，优先用声明的）----------
  // 每台：ports(props) 重放时说哪几个读数；name(port, props) 读数的名字；step(p0, p1) 这一步怎么说；why(ctx, port) 怎么来的；hint(ctx) 看台面说话。
  const CLS = '条个只张本朵根';
  const unitOf = (u) => { u = String(u || ''); return u.length >= 2 && CLS.includes(u[0]) ? { noun: u.slice(1), mw: u[0] } : { noun: '总数', mw: u }; };
  const TALK = {};

  TALK.swapbench = {
    ports: () => ['b', 'a', 'total'],
    why(c, port) {
      const S = U.SwapBench; if (!S || +c.props.view === 1) return null;
      const m = S.model(c.props), na = c.props.na, nb = c.props.nb, u = c.props.unit || '', k = m.k, j = m.n - m.k;
      if (port === 'total') return [k + ' 个' + nb + '，每个 ' + showN(m.lb) + ' ' + u + '：' + k + ' × ' + showN(m.lb) + ' = ' + showN(k * m.lb), j + ' 个' + na + '，每个 ' + showN(m.la) + ' ' + u + '：' + j + ' × ' + showN(m.la) + ' = ' + showN(j * m.la), '合起来：' + showN(k * m.lb) + ' + ' + showN(j * m.la) + ' = ' + showN(m.total) + ' ' + u];
      if (port === 'a') return ['一共 ' + m.n + ' 个，其中 ' + k + ' 个是' + nb + '：' + m.n + ' − ' + k + ' = ' + j + ' 个' + na];
      if (port === 'b') return ['你点成' + nb + '的有 ' + k + ' 个（点一个' + na + '变成' + nb + '，点一个' + nb + '变回' + na + '）'];
      if (port === 'gap') return ['要凑到 ' + showN(m.T) + '，现在是 ' + showN(m.total) + '：' + showN(m.T) + ' − ' + showN(m.total) + ' = ' + showN(m.diff)];
      return null;
    },
    hint(c) {
      const S = U.SwapBench; if (!S || +c.props.view === 1) return null;
      const m = S.model(c.props), na = c.props.na, nb = c.props.nb, un = unitOf(c.props.unit);
      if (m.diff === 0) return null;
      const d = Math.abs(m.diff), st = m.step;
      let s = '现在' + un.noun + '比要的' + (m.diff > 0 ? '少 ' : '多 ') + d + ' ' + un.mw + '。';
      if (!st) return s;
      s += '每把一个' + na + '换成' + nb + '，' + un.noun + (st > 0 ? '多 ' : '少 ') + Math.abs(st) + ' ' + un.mw + '：';
      if (m.ans === null) return s + '差的 ' + d + ' 不是 ' + Math.abs(st) + ' 的倍数，怎么换都对不上——是不是凑不出来？';
      const kk = m.ans - m.k;
      return s + (kk > 0 ? '是不是有 ' + kk + ' 个' + nb + '被当成了' + na + '？' : '是不是有 ' + -kk + ' 个' + na + '被当成了' + nb + '？');
    },
  };

  TALK.balancebench = {
    ports: () => ['eq', 'solved'],
    step(p0, p1) { const B = U.BalanceBench; if (!B) return null; const a = B.st(p0), b = B.st(p1); return B.eqText(a) === B.eqText(b) ? null : B.eqText(a) + '　→　' + B.eqText(b); },
    why(c, port) {
      const B = U.BalanceBench; if (!B) return null;
      const s = B.st(c.props), sol = B.solvedOf(s), log = B.parseLog(c.props.steps).map((x) => B.eqText(Object.assign({ x0: s.x0 }, x)));
      const out = [];
      if (port === 'solved' && sol !== null) {
        const left = s.lx === 1;
        out.push('盒子单独在' + (left ? '左' : '右') + '盘，' + (left ? '右' : '左') + '盘只有 ' + sol + ' 个砝码，天平是平的。', '所以一个盒子和 ' + sol + ' 个砝码一样重：x = ' + sol + '。');
      } else if (port === 'eq') out.push('天平下面的式子就是两个盘：盒子写成 x，砝码一个是 1。');
      else return null;
      if (log.length > 1) out.push('每一步的式子：' + log.join('　→　'));
      return out;
    },
    hint(c) {
      const B = U.BalanceBench; if (!B) return null;
      const s = B.st(c.props);
      if (B.solvedOf(s) !== null) return null;
      if (!s.lx && !s.rx) { const d = s.lc - s.rc; return d ? (d > 0 ? '右' : '左') + '盘比' + (d > 0 ? '左' : '右') + '盘少 ' + Math.abs(d) + ' 个砝码。' : null; }
      if (!B.balanced(s)) { const w = { l: s.lx * s.x0 + s.lc, r: s.rx * s.x0 + s.rc }; return '天平歪了：' + (w.l > w.r ? '左' : '右') + '盘重。刚才是不是只动了一边？在另一边也做一样的事，天平就回来了。'; }
      if (s.lx && s.rx) return '两边都有盒子：两边各拿走一个盒子，天平还是平的。';
      const L = s.lx > 0, bx = L ? s.lx : s.rx, bc = L ? s.lc : s.rc;
      if (bc) return (L ? '左' : '右') + '盘除了盒子还有 ' + bc + ' 个砝码：两边各拿走 ' + bc + ' 个砝码，盒子就单独在一边了。';
      if (bx > 1) return '盒子已经单独在一边了，一共 ' + bx + ' 个：把两边都平分成 ' + bx + ' 份，只留一份。';
      return null;
    },
  };

  const PLACE = ['百', '十', '个'];
  TALK.blocksbench = {
    ports: () => ['value', 'hundreds', 'tens', 'ones'],
    why(c, port) {
      const B = U.BlocksBench; if (!B || port !== 'value') return null;
      const s = B.st(c.props), v = B.valueOf(s), rows = [];
      if (s.h) rows.push(s.h + ' 个百：' + s.h + ' × 100 = ' + s.h * 100);
      if (s.t) rows.push(s.t + ' 个十：' + s.t + ' × 10 = ' + s.t * 10);
      if (s.o) rows.push(s.o + ' 个一：' + s.o);
      if (!rows.length) return ['台上还没有块：是 0。'];
      return rows.concat([rows.length > 1 ? '合起来：' + [s.h * 100, s.t * 10, s.o].filter(Boolean).join(' + ') + ' = ' + v : '就是 ' + v]);
    },
    hint(c) {
      const B = U.BlocksBench; if (!B) return null;
      const s = B.st(c.props), cols = [s.h, s.t, s.o];
      for (let i = 2; i >= 1; i--) if (cols[i] > 9) return PLACE[i] + '位有 ' + cols[i] + ' 块，超过 9 了：拿 10 块捆成一个，放到左边的' + PLACE[i - 1] + '位。';
      const t = c.target;
      if (t && t.port === 'value' && t.op === '=' && !c.hidden && +c.props.mode !== 1) {
        const d = t.wantN - B.valueOf(s); if (!d || !Number.isInteger(d)) return null;
        const a = Math.abs(d), hn = Math.floor(a / 100), tn = Math.floor(a / 10) % 10, on = a % 10, what = [hn ? hn + ' 个百（大方块）' : '', tn ? tn + ' 根长条' : '', on ? on + ' 个小方块' : ''].filter(Boolean).join('和 ');
        return '现在摆的是 ' + B.valueOf(s) + '，比要的' + (d > 0 ? '少 ' + a + '：再放 ' : '多 ' + a + '：拿走 ') + what + '。';
      }
      return null;
    },
  };

  TALK.numlinebench = {
    ports: (p) => (+p.mode === 2 ? ['lo', 'hi', 'ints'] : +p.mode === 1 ? ['value'] : +p.mode === 0 ? ['value', 'start', 'jumps'] : ['value']),
    why(c, port) {
      const N = U.NumLineBench; if (!N) return null;
      const mode = +c.props.mode; if (mode > 2) return null;
      const m = N.model(c.props);
      if (mode === 0 && port === 'value') return ['从起点 ' + showN(m.a) + ' 出发，每一步跳 ' + showN(m.s) + '，跳了 ' + m.n + ' 步。', showN(m.a) + (m.s < 0 ? ' − ' + -m.s : ' + ' + m.s) + ' × ' + m.n + ' = ' + showN(m.value)];
      if (mode === 1 && port === 'value') return ['从 ' + showN(m.from) + ' 开始，每一格切成 ' + m.d + ' 份，点在第 ' + m.k + ' 小格。', showN(m.from) + ' + ' + m.k + '/' + m.d + ' = ' + N.forms(m.value).join(' = ')];
      if (mode === 2 && (port === 'len' || port === 'ints')) return ['从 ' + showN(m.lo) + ' 到 ' + showN(m.hi) + '：长 ' + showN(m.hi) + ' − ' + showN(m.lo) + ' = ' + m.len + '。', '中间的整数有 ' + Math.max(0, m.hi - m.lo - 1) + ' 个，端点算进去的有 ' + (m.lc + m.hc) + ' 个：一共 ' + m.ints + ' 个。'];
      return null;
    },
    hint(c) {
      const N = U.NumLineBench, t = c.target; if (!N || !t || t.op !== '=') return null;
      const mode = +c.props.mode;
      if (mode === 0 && t.port === 'value') {
        const m = N.model(c.props), need = t.wantN - m.a; if (!Number.isInteger(t.wantN) || m.value === t.wantN) return null;
        if (need % m.s !== 0 || need / m.s < 0) return '从 ' + showN(m.a) + ' 每一步跳 ' + showN(m.s) + '，怎么跳都落不到那里：先看看起点和每一步跳几对不对。';
        const k = need / m.s - m.n;
        return '从 ' + showN(m.a) + ' 跳了 ' + m.n + ' 步，落在 ' + showN(m.value) + (c.hidden ? '' : '，要落在 ' + showN(t.wantN)) + '：' + (k > 0 ? '还要再跳 ' + k + ' 步。' : '多跳了 ' + -k + ' 步。');
      }
      if (mode === 1 && t.port === 'value') {
        const m = N.model(c.props), diff = Q.sub(t.want, m.value); if (Q.cmp(diff, Q(0)) === 0) return null;
        const cells = Q.mul(diff, Q(m.d));
        return '点现在在 ' + N.forms(m.value)[0] + '：' + (Q.isInt(cells) ? '往' + (Q.cmp(cells, Q(0)) > 0 ? '右' : '左') + '再拖 ' + show(Q.abs(cells)) + ' 小格' + (m.d > 1 ? '（每一格切成 ' + m.d + ' 份）' : '') + '。' : '每一格切成 ' + m.d + ' 份还不够细：换一种切法试试。');
      }
      return null;
    },
  };

  TALK.ratiobench = {
    ports: (p) => (+p.mode === 1 ? ['a', 'b'] : ['a', 'b', 'sum']),
    name: (port, p) => (+p.mode === 1 ? { a: '上面的点', b: '下面对着的数' }[port] : { a: '甲', b: '乙', sum: '合起来' }[port]) || null,
    why(c, port) {
      const R = U.RatioBench; if (!R) return null;
      const p = c.props, m = R.model(p);
      if (m.mode === 1 && (port === 'b' || port === 'rate')) {
        const ua = p.ua || '', ub = p.ub || '';
        const out = ['上面 ' + qty(m.pa, ua) + ' 对着下面 ' + qty(m.pb, ub) + '。', '所以每 ' + qty(1, ua) + ' 对着 ' + m.pb + ' ÷ ' + m.pa + ' = ' + qty(show(m.rate), ub) + '。'];
        if (port === 'b') out.push('上面的点在 ' + qty(m.t, ua) + '：' + m.t + ' × ' + show(m.rate) + ' = ' + qty(show(m.bottom), ub) + '。');
        return out;
      }
      if (m.mode === 0 && ['a', 'b', 'sum', 'diff'].includes(port)) {
        const d1 = Math.max(1, +p.d1 || 1), d2 = Math.max(1, +p.d2 || 1), n1 = +p.n1 || 0, n2 = +p.n2 || 0, out = ['甲：切成 ' + d1 + ' 份，涂了 ' + n1 + ' 份，是 ' + n1 + '/' + d1 + '。', '乙：切成 ' + d2 + ' 份，涂了 ' + n2 + ' 份，是 ' + n2 + '/' + d2 + '。'];
        if (port === 'sum' || port === 'diff') {
          const gcd = (a, b) => (b ? gcd(b, a % b) : a), L = d1 / gcd(d1, d2) * d2, x = n1 * L / d1, y = n2 * L / d2;
          out.push('切成一样细（都切成 ' + L + ' 份）：甲是 ' + x + '/' + L + '，乙是 ' + y + '/' + L + '。');
          out.push(port === 'sum' ? '合起来：' + x + '/' + L + ' + ' + y + '/' + L + ' = ' + (x + y) + '/' + L + (show(Q(x + y, L)) !== (x + y) + '/' + L ? ' = ' + show(Q(x + y, L)) : '') : '相差：' + Math.abs(x - y) + '/' + L + (show(Q(Math.abs(x - y), L)) !== Math.abs(x - y) + '/' + L ? ' = ' + show(Q(Math.abs(x - y), L)) : ''));
        }
        return out;
      }
      return null;
    },
    hint(c) {
      const R = U.RatioBench, t = c.target; if (!R || !t || t.op !== '=' || t.port !== 'b' || +c.props.mode !== 1) return null;
      const p = c.props, m = R.model(p), need = Q.div(t.want, m.rate);
      if (Q.cmp(m.bottom, t.want) === 0) return null;
      if (!Q.isInt(need) || Q.num(need) < 0 || Q.num(need) > m.tmax || Q.num(need) % m.tstep) return null;   // 拖不到那里就不说
      const nt = Number(show(need));
      return '上面的点现在在 ' + qty(m.t, p.ua) + '，下面对着 ' + qty(c.fmt(m.bottom), p.ub) + '。上面的点要拖到 ' + qty(nt, p.ua) + (c.hidden ? '，再看下面对着几。' : '，下面才对着 ' + qty(c.fmt(t.want), p.ub) + '。');
    },
  };

  const qty = (n, u) => n + (u === '%' ? '%' : u ? ' ' + u : '');
const easy = (n) => n < 10 || n % 10 === 0;
  TALK.areamodel = {
    ports: (p) => (+p.mode === 2 ? ['p1', 'p0'] : ['area', 'parts']),
    why(c, port) {
      const A = U.AreaModel; if (!A) return null;
      const m = A.model(c.props);
      if (port === 'perim' && m.mode === 0) return ['周长是四条边加起来：(' + m.w + ' + ' + m.h + ') × 2 = ' + m.perim];
      if (['area', 'p1', 'p0', 'cells', 'total'].includes(port)) return ['长方形的面积 = 长 × 宽；把边拆开，面积就拆成几块的和：'].concat(A.lines(m));
      if (port === 'parts' && m.mode === 0) return ['长切成了 ' + m.ws.length + ' 段（' + m.ws.join('、') + '），宽切成了 ' + m.hs.length + ' 段（' + m.hs.join('、') + '）：' + m.ws.length + ' × ' + m.hs.length + ' = ' + m.parts + ' 块。'];
      return null;
    },
    hint(c) {
      const A = U.AreaModel, t = c.target; if (!A || !t) return null;
      const m = A.model(c.props); if (m.mode !== 0) return null;
      if (t.port === 'friendly') {
        if (m.parts < 2) return '还没切：从左上角的 ✂ 拖出一刀，切在整十的地方。';
        const bad = m.ws.find((n) => !easy(n)), badh = m.hs.find((n) => !easy(n));
        if (bad !== undefined) return '长这边切出来有一段是 ' + bad + '，不是整十、也不是一位数，不好算：在 10 那里切。';
        if (badh !== undefined) return '宽这边切出来有一段是 ' + badh + '，不是整十、也不是一位数，不好算：在 10 那里切。';
        return null;
      }
      if (t.port === 'area' && t.op === '=' && !c.hidden && Number.isInteger(t.wantN) && m.area !== t.wantN) {
        const d = t.wantN - m.area;
        return '现在 ' + m.w + ' × ' + m.h + ' = ' + m.area + '，要 ' + t.wantN + '：' + (d > 0 ? '还差 ' + d : '多了 ' + -d) + '。拖右边或下边，改长或宽。';
      }
      if (t.port === 'perim' && t.op === '=' && !c.hidden && Number.isInteger(t.wantN) && m.perim !== t.wantN) {
        const d = t.wantN - m.perim;
        return '现在周长 (' + m.w + ' + ' + m.h + ') × 2 = ' + m.perim + '，要 ' + t.wantN + '：' + (d > 0 ? '还差 ' + d : '多了 ' + -d) + '。';
      }
      return null;
    },
  };

  const KNAME = { x2: 'x²', xy: 'xy', x: 'x', y: 'y', '': '常数' };
  TALK.termsbench = {
    ports: () => ['value', 'terms'],
    step(p0, p1) {
      const T = U.TermsBench; if (!T) return null;
      if (+p1.mode === 1) { const a = T.parseToks(p0.toks), b = T.parseToks(p1.toks); return a.join() === b.join() ? null : '算了一步：' + T.toksShow(a) + '　→　' + T.toksShow(b); }
      const a = T.parseTerms(p0.terms), b = T.parseTerms(p1.terms);
      return T.exprShow(a) === T.exprShow(b) ? null : '合并：' + T.exprShow(a) + '　→　' + T.exprShow(b);
    },
    why(c, port) {
      const T = U.TermsBench; if (!T || port !== 'value') return null;
      const m = T.model(c.props);
      if (m.mode === 1) return m.value === null ? null : ['一步一步算的：'].concat(m.hist.map((h, i) => (i ? '= ' : '') + h), ['= ' + show(m.value)]);
      return ['合并同类项只是换一种写法：把 x = 2、y = 3 代进去，原式 ' + T.exprShow(m.orig) + ' 是 ' + m.origValue + '，现在的 ' + T.exprShow(m.list) + ' 也是 ' + m.value + '。'];
    },
    hint(c) {
      const T = U.TermsBench; if (!T) return null;
      const m = T.model(c.props);
      if (m.mode === 1) {
        if (m.value !== null) return null;
        const al = T.allowed(m.toks), i = [...al.ok][0], ops = m.toks.filter((x) => ['+', '-', '*', '/'].includes(x)).length;
        const nx = i !== undefined && m.toks[i - 1] !== undefined && m.toks[i + 1] !== undefined && m.toks[i - 1] !== ')' && m.toks[i + 1] !== '(' ? T.toksShow(m.toks.slice(i - 1, i + 2)) : null;
        return '算式还没算完：还有 ' + ops + ' 个运算符。' + (nx ? '现在可以先算 ' + nx + '。' : '先算括号里的，再算 × ÷，最后从左往右算 + −。');
      }
      const by = {}; for (const t of m.list) (by[t.k] = by[t.k] || []).push(t);
      const k = Object.keys(by).find((x) => by[x].length > 1);
      if (k === undefined) return null;
      return (k === '' ? '常数' : KNAME[k] + ' 的项') + '还有 ' + by[k].length + ' 块（' + by[k].map((t) => T.exprShow([t])).join('、') + '）：把一块拖到另一块上合起来。';
    },
  };

  // ---------- 里程碑的目标 ----------
  // 条件里“某台的某个输出 op 某个数”的部分（all / any 里的也算），按写的顺序
  function conds(c, out) {
    if (!c || typeof c !== 'object') return out;
    if (Array.isArray(c.all)) c.all.forEach((x) => conds(x, out));
    else if (Array.isArray(c.any)) c.any.forEach((x) => conds(x, out));
    else if ((c.type || c.role) && c.value !== undefined && typeof c.value !== 'boolean') out.push(c);
    return out;
  }
  const entOf = (scene, c) => { const E = Object.values(scene.entities); return c.role ? E.find((e) => e.role === c.role) || null : E.find((e) => e.type === c.type) || null; };
  const OPS = { '=': (x) => x === 0, '>': (x) => x > 0, '<': (x) => x < 0, '>=': (x) => x >= 0, '<=': (x) => x <= 0, '!=': (x) => x !== 0 };
  // 这个里程碑第一个还没满足的数的目标：{ id, port, op, want(Q), wantN, cur(Q|null), met }；没有就 null
  function targetOf(m, scene, D) {
    for (const c of conds(m && m.when, [])) {
      const e = entOf(scene, c); if (!e) continue;
      const d = U.types[e.type], port = c.port || Object.keys((d && d.outputs) || {})[0]; if (!port) continue;
      let want; try { want = Q.parse(String(c.value)); } catch (x) { continue; }
      const v = D[e.id] && D[e.id].out[port], cur = qOf(v), op = c.op || '=';
      const met = cur !== null && OPS[op] && OPS[op](Q.cmp(cur, want));
      if (met) continue;
      return { id: e.id, type: e.type, port, op, want, wantN: Q.num(want), cur, exact: !v || v.exact !== false };
    }
    return null;
  }
  // 先猜：这一步的答案藏着（和步骤栏的“？”一致）
  function hiddenOf(problem, run, m) {
    if (!U.Predict || !U.Predict.of) return false;
    const pr = U.Predict.of(problem), st = run && run.ms && run.ms[m.id];
    return !!(st && !st.done && !(run.pred_done && run.pred === undefined) && U.Predict.hideSay(pr, m));
  }
  const talkOf = (type) => TALK[type] || {};
  function nameOf(type, port, props) {
    const d = U.types[type], T = talkOf(type), n = T.name ? T.name(port, props || {}) : null;
    return n || (d && d.outputs[port] ? cleanLabel(d.outputs[port].label) : port);
  }
  const flagPort = (type, port) => { const d = U.types[type], o = d && d.outputs[port]; return !o || FLAG.test(o.label || ''); };
  // 器材看台面说的话（器材声明优先，再看这里登记的）
  function benchCtx(scene, D, id, extra) {
    const e = scene.entities[id], dd = D[id] || {}, out = dd.out || {};
    return Object.assign({ ent: e, props: dd.props || e.props, out, d: dd, scene, num: (p) => { const q = qOf(out[p]); return q ? Q.num(q) : null; } }, extra || {});
  }

  // 说法里写着这个数的那一段（−3、2.5、3/5 都认），没有就是 null；写成小数的，说的时候也用小数
  const sayHas = (say, q) => (String(say || '').replace(/−/g, '-').match(/-?\d+(?:\.\d+)?(?:\/\d+)?/g) || []).find((x) => { try { return Q.eq(Q.parse(x), q); } catch (e) { return false; } }) || null;
  function curMilestone(problem, run) { return problem && run ? problem.milestones.find((x) => run.ms[x.id] && !run.ms[x.id].done) || null : null; }

  // ---------- 3. 看台面说话 ----------
  function hintNow(problem, run, scene, D) {
    const m = curMilestone(problem, run); if (!m) return null;
    const hidden = hiddenOf(problem, run, m), t = targetOf(m, scene, D);
    const say = (s) => (typeof s === 'string' && s.trim() ? s.trim() : null);
    // 题目自己写的
    let s = null;
    try { const W = U.Judge.makeW(scene, D, run); s = say(m.hintNow ? m.hintNow(W) : problem.hintNow ? problem.hintNow(W, m) : null); } catch (x) { s = null; }
    if (s) return s;
    // 器材说的：先问目标所在的那台，再问台面上其他操作台
    const ids = (t ? [t.id] : []).concat((U.benchOf(scene) || []).filter((id) => !t || id !== t.id));
    for (const id of ids) {
      const e = scene.entities[id]; if (!e) continue;
      const d = U.types[e.type] || {}, T = talkOf(e.type), c = benchCtx(scene, D, id, { problem, m, hidden, target: t && t.id === id ? t : null, fmt: (q) => (/\d\.\d/.test(m.say) ? Q.showDec(q, 4).replace(/^-/, '−') : show(q)) });
      try { s = say(d.hintNow ? d.hintNow(c.props, c.out, problem, c) : T.hint ? T.hint(c) : null); } catch (x) { s = null; }
      if (s) return s;
    }
    // 自动：还差 / 多了多少
    // 自动的那句只在这一步的说法里写着这个数时才说（“摆出了 16”）：编号、代码、开关这类目标数，说法里不会写，免得说出“摆法还差 1211”这种话
    if (!t || hidden || t.cur === null || !t.exact || flagPort(t.type, t.port) || !sayHas(m.say, t.want)) return null;
    const e = scene.entities[t.id], nm = nameOf(t.type, t.port, e.props), diff = Q.sub(t.want, t.cur), sg = Q.cmp(diff, Q(0));
    if (!sg) return null;
    const sh = sayHas(m.say, t.want).includes('.') ? (q) => Q.showDec(q, 4).replace(/^-/, '−') : show, d = sh(Q.abs(diff));
    const what = '「' + nm + '」现在是 ' + sh(t.cur) + '，要';
    if (t.op === '=') return what + ' ' + sh(t.want) + '：' + (sg > 0 ? '还差 ' : '多了 ') + d + '。';
    if (t.op === '>=') return what + '到 ' + sh(t.want) + '：还差 ' + d + '。';
    if (t.op === '<=') return what + '不超过 ' + sh(t.want) + '：多了 ' + d + '。';
    if (t.op === '>') return what + '比 ' + sh(t.want) + ' 大：现在还少 ' + d + '。';
    if (t.op === '<') return what + '比 ' + sh(t.want) + ' 小：现在还多 ' + d + '。';
    return null;
  }

  // ---------- 2. 来历 ----------
  // 步骤栏里“台面上现在”列哪几个读数：里程碑的数的目标所在的口（开关类不列），再加上器材登记的；最多 4 个
  function readings(problem, scene, D) {
    const bench = U.benchOf(scene); if (!bench) return [];
    const out = [], seen = {};
    const add = (id, port) => {
      const e = scene.entities[id], k = id + '|' + port; if (!e || seen[k] || flagPort(e.type, port)) return;
      const v = D[id] && D[id].out[port]; if (!v || v.kind === 'none') return;
      seen[k] = 1; out.push({ id, port, name: nameOf(e.type, port, e.props), value: v });
    };
    for (const m of (problem && problem.milestones) || []) for (const c of conds(m.when, [])) { const e = entOf(scene, c); if (e && bench.includes(e.id)) add(e.id, c.port || Object.keys(U.types[e.type].outputs)[0]); }
    // 器材登记了“怎么来的”的读数：说得出来才列
    for (const id of bench) {
      const e = scene.entities[id], T = talkOf(e.type), d = U.types[e.type] || {}, W = d.why || T.why; if (!W || !T.ports) continue;
      for (const p of T.ports(e.props)) { let r = null; try { r = W(benchCtx(scene, D, id), p); } catch (x) { r = null; } if (r && r.length) add(id, p); }
    }
    return out.slice(0, 4);
  }
  // 追踪（c.step / c.because）写成孩子的话：每台一段，追到源头
  function traceLines(scene, D, id, port) {
    const tree = U.World.explain(scene, D, id, port); if (!tree) return [];
    const lines = [];
    const walk = (t, top) => {
      const rule = t.rule && U.RULES[t.rule] ? U.RULES[t.rule].label : '';
      if (!top) lines.push('「' + t.name + '」给出 ' + U.briefVal(t.value) + (t.stateful ? '（上一拍的值）' : ''));
      for (const st of t.steps) lines.push((top ? '' : '　') + st.say);
      if (t.say || rule) lines.push((top ? '' : '　') + (t.say || '') + (t.say && rule ? '（' + rule + '）' : rule));
      for (const c of t.from) walk(c, false);
    };
    walk(tree, true);
    return lines.filter((x) => x.trim());
  }
  // 联动组：这一台和哪几台连在一起，做过哪几步（每一步在哪一台上做的、什么道理）
  function groupLines(scene, id) {
    const g = U.Forms && U.Forms.groupOf(scene, id); if (!g) return [];
    const nm = (x) => (scene.entities[x] ? scene.entities[x].name : x);
    const others = g.members.filter((x) => x !== id && scene.entities[x]).map((x) => '「' + nm(x) + '」');
    const out = ['这一台和' + others.join('') + '连在一起：是同一个等式的几种样子，在哪一台上做一步，别的台跟着做同一步。'];
    if (!g.log.length) out.push('还没有做过步子：现在是开场的样子。');
    g.log.forEach((r, i) => { const rule = r.rule && U.RULES[r.rule] ? U.RULES[r.rule].label : ''; out.push('第 ' + (i + 1) + ' 步：在「' + nm(r.by) + '」上' + r.label + (rule ? '（' + rule + '）' : '')); });
    return out;
  }
  const loadFrame = (f) => (typeof f === 'string' ? U.World.load(f) : f);
  // 这个数在每一帧里是几（重放的帧），变了的地方记下来
  function history(frames, id, port) {
    const out = []; let last = null;
    (frames || []).forEach((f, i) => {
      let v = null; try { const sc = loadFrame(f); if (sc.entities[id]) { const D = U.World.evaluate(sc); v = D[id] && D[id].out[port] ? U.briefVal(D[id].out[port]) : null; } } catch (x) { v = null; }
      if (v !== null && v !== last) out.push({ i, v });
      if (v !== null) last = v;
    });
    return out;
  }
  function why(scene, D, id, port, frames) {
    const e = scene.entities[id]; if (!e) return null;
    const d = U.types[e.type] || {}, T = talkOf(e.type), v = D[id] && D[id].out[port], nm = nameOf(e.type, port, e.props);
    const res = { name: nm, value: v ? U.briefVal(v) : '—', head: '「' + nm + '」现在是 ' + (v ? U.briefVal(v) : '—') + '。', calc: [], group: [], hist: [] };
    const c = benchCtx(scene, D, id);
    try { res.calc = (d.why ? d.why(c, port) : T.why ? T.why(c, port) : null) || []; } catch (x) { res.calc = []; }
    if (!res.calc.length) res.calc = traceLines(scene, D, id, port);
    res.group = groupLines(scene, id);
    const h = history(frames, id, port);
    if (h.length) res.hist = h.length === 1 ? [h[0].i === 0 ? '开场就是 ' + h[0].v + '，你还没有让它变过。' : '第 ' + h[0].i + ' 步变成 ' + h[0].v + '。'] : h.slice(-8).map((x, k) => (x.i === 0 ? '开场是 ' + x.v : '第 ' + x.i + ' 步' + (k === 0 ? '是 ' : '变成 ') + x.v));
    return res;
  }
  const whyText = (r) => (r ? [r.head].concat(r.calc, r.group, r.hist).join('\n') : '');

  // ---------- 1. 重放：第 i 步做了什么 ----------
  function stepSay(a, b) {
    const A = loadFrame(a), B = loadFrame(b), EA = A.entities, EB = B.entities;
    const nm = (E, id) => (E[id] ? E[id].name || id : id);
    // 联动组：新记下的那一步
    for (const g of B.groups || []) {
      const g0 = (A.groups || []).find((x) => x.id === g.id), n0 = g0 ? g0.log.length : 0;
      const fresh = g.log.length > n0 ? g.log.slice(n0) : g0 && g.log.length && JSON.stringify(g.log[g.log.length - 1]) !== JSON.stringify(g0.log[g0.log.length - 1]) ? g.log.slice(-1) : [];
      if (fresh.length) { const r = fresh[fresh.length - 1], oth = g.members.filter((x) => x !== r.by && EB[x]).map((x) => '「' + nm(EB, x) + '」'); return '在「' + nm(EB, r.by) + '」上' + r.label + (oth.length ? '，' + oth.join('') + '跟着做了同一步' : ''); }
    }
    const added = Object.keys(EB).filter((id) => !EA[id]), gone = Object.keys(EA).filter((id) => !EB[id]);
    if (added.length) return '拿出了' + added.slice(0, 3).map((id) => '「' + nm(EB, id) + '」').join('') + (added.length > 3 ? '等 ' + added.length + ' 个' : '');
    if (gone.length) return '拿走了' + gone.slice(0, 3).map((id) => '「' + nm(EA, id) + '」').join('') + (gone.length > 3 ? '等 ' + gone.length + ' 个' : '');
    if ((B.links || []).length !== (A.links || []).length) return (B.links.length > A.links.length ? '连了 ' : '拆了 ') + Math.abs(B.links.length - A.links.length) + ' 根线';
    const changed = Object.keys(EB).filter((id) => JSON.stringify(EB[id].props) !== JSON.stringify(EA[id].props));
    if (!changed.length) {
      const moved = Object.keys(EB).filter((id) => EB[id].x !== EA[id].x || EB[id].y !== EA[id].y || EB[id].parent !== EA[id].parent);
      if (moved.length) return '挪了挪' + moved.slice(0, 3).map((id) => '「' + nm(EB, id) + '」').join('') + '的位置';
      return '整理了台面';
    }
    const DA = U.World.evaluate(A), DB = U.World.evaluate(B), many = Object.keys(EB).filter((id) => !EB[id].parent).length > 1, parts = [];
    for (const id of changed) {
      const e = EB[id], d = U.types[e.type] || {}, T = talkOf(e.type);
      let s = null;
      try { s = d.stepSay ? d.stepSay(EA[id].props, e.props) : T.step ? T.step(EA[id].props, e.props) : null; } catch (x) { s = null; }
      if (!s) {
        const order = (T.ports ? T.ports(e.props) : []).concat(Object.keys(d.outputs || {}));
        const seen = {}, bits = [];
        for (const p of order) {
          if (seen[p] || flagPort(e.type, p)) continue; seen[p] = 1;
          const va = DA[id] && DA[id].out[p], vb = DB[id] && DB[id].out[p];
          const sa = va ? U.briefVal(va) : '—', sb = vb ? U.briefVal(vb) : '—';
          if (sa === sb || (sa + sb).length > 40) continue;
          bits.push(nameOf(e.type, p, e.props) + ' ' + sa + ' → ' + sb);
          if (bits.length >= 3) break;
        }
        if (bits.length) s = bits.join('，');
      }
      if (!s) {
        const ks = Object.keys(e.props).filter((k) => d.props && d.props[k] && !d.props[k].hidden && JSON.stringify(e.props[k]) !== JSON.stringify(EA[id].props[k]));
        s = ks.length ? '改了' + ks.slice(0, 2).map((k) => '「' + cleanLabel(d.props[k].label) + '」').join('') : '动了一下';
      }
      parts.push((many ? '「' + nm(EB, id) + '」：' : '') + s);
    }
    return parts.slice(0, 2).join('；');
  }

  U.Process = { TALK, FLAG, cleanLabel, nameOf, targetOf, hintNow, readings, why, whyText, history, stepSay, curMilestone };
})(typeof globalThis !== 'undefined' ? globalThis : window);
