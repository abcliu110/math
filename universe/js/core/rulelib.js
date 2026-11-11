/* 规则库（docs/new-instruments.md 3.3）：一条“可以判定的说法”。猜规则台、总是 / 有时 / 从不、找错台等共用。
 *   规则（kind 'rule'）：对一个例子判“算 / 不算”。num 域的例子是 1–60 的整数；tri 域的例子是格点三角形（固定的 24 个）。
 *   说法（kind 'claim'）：一句话，在它的取值范围（space）里逐个检查：每个都成立 = 总是，都不成立 = 从不，否则 = 有时。
 *   所有判定都是精确的（整数或 Q），取值范围有限，所以能穷举。
 * 例子的写法：整数 7；一对数 3,5；分数 1/2；三角形 0,0 4,0 0,3（三个顶点）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q;
  const L = { rules: [], claims: [], byId: {} };
  const isPrime = (n) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
  const digsum = (n) => String(n).split('').reduce((s, c) => s + Number(c), 0);
  const range = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };

  // ---- 三角形例子：格点三角形（边长平方、点积都是整数，判定精确）----
  const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
  const dot = (o, a, b) => (a[0] - o[0]) * (b[0] - o[0]) + (a[1] - o[1]) * (b[1] - o[1]);
  const det = (t) => (t[1][0] - t[0][0]) * (t[2][1] - t[0][1]) - (t[1][1] - t[0][1]) * (t[2][0] - t[0][0]);
  const angs = (t) => [dot(t[0], t[1], t[2]), dot(t[1], t[0], t[2]), dot(t[2], t[0], t[1])];   // 点积的符号：> 0 锐角，= 0 直角，< 0 钝角
  const sides = (t) => [d2(t[0], t[1]), d2(t[1], t[2]), d2(t[0], t[2])];
  const triPool = (() => {
    const pts = []; for (let x = 0; x <= 4; x++) for (let y = 0; y <= 4; y++) pts.push([x, y]);
    const all = []; for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) for (let k = j + 1; k < pts.length; k++) { const t = [pts[i], pts[j], pts[k]]; if (det(t) !== 0) all.push(t); }
    // 固定抽 24 个：从各种形状里轮流取，保证每条三角形规则在池里既有“算”也有“不算”
    const kinds = { iso: [], right: [], obtuse: [], plain: [] };
    for (const t of all) { const s = sides(t), a = angs(t); const iso = s[0] === s[1] || s[1] === s[2] || s[0] === s[2]; const r = a.includes(0), ob = a.some((v) => v < 0); (r ? kinds.right : ob ? kinds.obtuse : iso ? kinds.iso : kinds.plain).push(t); }
    const take = (arr, n) => { const out = [], step = Math.max(1, Math.floor(arr.length / n)); for (let i = 0; out.length < n && i < arr.length; i += step) out.push(arr[i]); return out; };
    return take(kinds.iso, 5).concat(take(kinds.right, 7), take(kinds.obtuse, 6), take(kinds.plain, 6));
  })();

  function add(r) { L.byId[r.id] = r; (r.kind === 'claim' ? L.claims : L.rules).push(r); return r; }
  const rule = (id, domain, level, say, test, near) => add({ id, kind: 'rule', domain, level, say, test, near: near || [] });
  // num 域：例子是整数 1–60
  rule('num.even', 'num', 1, '双数', (n) => n % 2 === 0, ['num.odd']);
  rule('num.odd', 'num', 1, '单数', (n) => n % 2 === 1, ['num.even']);
  rule('num.gt10', 'num', 1, '比 10 大的数', (n) => n > 10);
  rule('num.mul5', 'num', 1, '5 的倍数', (n) => n % 5 === 0);
  rule('num.mul3', 'num', 2, '3 的倍数', (n) => n % 3 === 0, ['num.mod3-1', 'num.mod3-2']);
  rule('num.mod3-1', 'num', 2, '除以 3 余 1 的数', (n) => n % 3 === 1, ['num.mod3-2', 'num.odd']);
  rule('num.mod3-2', 'num', 2, '除以 3 余 2 的数', (n) => n % 3 === 2, ['num.mod3-1']);
  rule('num.mul4', 'num', 2, '4 的倍数', (n) => n % 4 === 0, ['num.even']);
  rule('num.prime', 'num', 2, '质数', isPrime, ['num.odd']);
  rule('num.square', 'num', 2, '平方数（1、4、9……）', (n) => Math.round(Math.sqrt(n)) ** 2 === n);
  rule('num.mod4-1', 'num', 3, '除以 4 余 1 的数', (n) => n % 4 === 1, ['num.odd']);
  rule('num.digsum-even', 'num', 3, '各位数字的和是双数', (n) => digsum(n) % 2 === 0, ['num.even']);
  rule('num.ends37', 'num', 3, '个位是 3 或 7 的数', (n) => n % 10 === 3 || n % 10 === 7);
  rule('num.pow2', 'num', 3, '2 的幂（1、2、4、8……）', (n) => (n & (n - 1)) === 0);
  rule('num.trinum', 'num', 4, '三角形数（1、3、6、10……）', (n) => { const k = Math.round((Math.sqrt(8 * n + 1) - 1) / 2); return k * (k + 1) / 2 === n; });
  // tri 域：例子是三个顶点（格点）
  rule('tri.iso', 'tri', 1, '有两条边相等的三角形', (t) => { const s = sides(t); return s[0] === s[1] || s[1] === s[2] || s[0] === s[2]; }, ['tri.scalene']);
  rule('tri.scalene', 'tri', 1, '三条边都不相等的三角形', (t) => { const s = sides(t); return s[0] !== s[1] && s[1] !== s[2] && s[0] !== s[2]; }, ['tri.iso']);
  rule('tri.right', 'tri', 2, '有一个直角的三角形', (t) => angs(t).includes(0));
  rule('tri.obtuse', 'tri', 2, '有一个钝角的三角形', (t) => angs(t).some((v) => v < 0));
  rule('tri.acute', 'tri', 3, '三个角都是锐角的三角形', (t) => angs(t).every((v) => v > 0));
  rule('tri.areaint', 'tri', 3, '面积是整数的三角形', (t) => Math.abs(det(t)) % 2 === 0);

  // ---- 说法（总是 / 有时 / 从不）----
  const ints = range(1, 100), odds = range(1, 19).filter((n) => n % 2 === 1);
  const pairs = (xs, ys) => { const r = []; for (const a of xs) for (const b of ys) r.push([a, b]); return r; };
  const rats = (() => { const m = {}, r = []; for (let d = 1; d <= 5; d++) for (let k = 1; k <= 15; k++) { const q = Q(k, d), key = Q.show(q); if (!m[key]) { m[key] = 1; r.push(q); } } return r.sort((a, b) => Q.cmp(a, b)); })();
  const claim = (id, level, say, kind, space, test, hint) => add({ id, kind: 'claim', domain: 'claim', level, say, space: { kind, items: space }, test, hint: hint || '' });
  claim('c.sq-ge', 2, 'n × n 不小于 n（n 是整数）', 'int', ints, (n) => n * n >= n);
  claim('c.sq-ge-rat', 4, 'n × n 不小于 n（n 可以是分数）', 'rat', rats, (q) => Q.cmp(Q.mul(q, q), q) >= 0, '试试比 1 小的分数');
  claim('c.odd-odd-even', 2, '两个奇数的和是偶数', 'tuple', pairs(odds, odds), (p) => (p[0] + p[1]) % 2 === 0);
  claim('c.prime-odd', 2, '质数都是奇数', 'int', ints.filter(isPrime), (n) => n % 2 === 1);
  claim('c.prime-gt2-odd', 3, '大于 2 的质数都是奇数', 'int', ints.filter((n) => isPrime(n) && n > 2), (n) => n % 2 === 1);
  claim('c.mul-bigger', 1, '一个数乘以另一个整数，结果比原来大（两个数都是 1 到 6 和 0）', 'tuple', pairs(range(1, 6), range(0, 5)), (p) => p[0] * p[1] > p[0], '试试 × 0 和 × 1');
  claim('c.mul-gt1-bigger', 3, '一个数乘以大于 1 的数，结果比原来大', 'tuple', pairs(rats, rats.filter((q) => Q.cmp(q, Q(1)) > 0)), (p) => Q.cmp(Q.mul(p[0], p[1]), p[0]) > 0);
  claim('c.sum-bigger', 2, '两个数的和比其中每一个数都大（两个数可以是 0）', 'tuple', pairs(range(0, 10), range(0, 10)), (p) => p[0] + p[1] > p[0] && p[0] + p[1] > p[1]);
  claim('c.mod3-both', 3, '一个数除以 3 余 1，同时除以 3 余 2', 'int', ints, (n) => n % 3 === 1 && n % 3 === 2);
  claim('c.perim24-area36', 3, '周长是 24 厘米的长方形，面积是 36 平方厘米（长 + 宽 = 12）', 'tuple', range(1, 11).map((l) => [l, 12 - l]), (p) => p[0] * p[1] === 36);
  claim('c.even-sq-even', 2, '双数的平方是双数', 'int', ints.filter((n) => n % 2 === 0), (n) => (n * n) % 2 === 0);
  claim('c.sum3-mul3', 3, '连续三个整数的和是 3 的倍数', 'int', ints, (n) => (n + (n + 1) + (n + 2)) % 3 === 0);
  claim('c.sqrt-less', 4, '一个数的平方根比它本身小（数是正的，可以是分数）', 'rat', rats, (q) => Q.cmp(q, Q(1)) > 0, '试试 1 和比 1 小的数');
  claim('c.odd-odd-prod', 2, '两个奇数的积是奇数', 'tuple', pairs(odds, odds), (p) => (p[0] * p[1]) % 2 === 1);
  claim('c.div-smaller', 4, '一个数除以另一个数，商比被除数小（都是正数）', 'tuple', pairs(rats.filter((q) => Q.cmp(q, Q(3)) <= 0), [Q(1, 2), Q(1), Q(2), Q(3)]), (p) => Q.cmp(Q.div(p[0], p[1]), p[0]) < 0, '试试除以 1/2');
  claim('c.n2n41', 3, 'n × n + n + 41 总是质数', 'int', ints, (n) => isPrime(n * n + n + 41));
  claim('c.odd-mul3', 2, '单数都是 3 的倍数', 'int', ints.filter((n) => n % 2 === 1), (n) => n % 3 === 0);
  claim('c.even-and-odd', 1, '一个数既是双数又是单数', 'int', ints, (n) => n % 2 === 0 && n % 2 === 1);
  claim('c.mul5-end', 2, '5 的倍数的个位是 0 或 5', 'int', ints.filter((n) => n % 5 === 0), (n) => n % 10 === 0 || n % 10 === 5);
  claim('c.double-bigger', 3, '一个正数的 2 倍比它大', 'rat', rats, (q) => Q.cmp(Q.mul(q, Q(2)), q) > 0);
  claim('c.half-smaller', 3, '一个正数的一半比它小', 'rat', rats, (q) => Q.cmp(Q.div(q, Q(2)), q) < 0);
  claim('c.sqeven-even', 3, '平方是双数的整数一定是双数', 'int', ints.filter((n) => (n * n) % 2 === 0), (n) => n % 2 === 0);

  // ---- 接口 ----
  const showEx = (domain, x) => (domain === 'tri' ? x.map((p) => p.join(',')).join(' ') : Array.isArray(x) ? x.map((v) => (v && v.n !== undefined ? Q.show(v) : v)).join(',') : x && x.n !== undefined ? Q.show(x) : String(x));
  const spaceOf = (r) => (r.kind === 'claim' ? r.space.items : r.domain === 'tri' ? triPool : range(1, 60));
  // 把学生写的例子读成值；读不出来返回 null。kind 是 'int' | 'tuple' | 'rat' | 'tri'
  function parseEx(kind, text, tupleRat) {
    const t = String(text === undefined || text === null ? '' : text).trim(); if (!t) return null;
    try {
      if (kind === 'int') return /^\d+$/.test(t) ? Number(t) : null;
      if (kind === 'rat') return Q.parse(t);
      if (kind === 'tuple') { const p = t.split(/[,，\s]+/).filter(Boolean); if (p.length !== 2) return null; return tupleRat ? p.map((v) => Q.parse(v)) : p.map((v) => (/^\d+$/.test(v) ? Number(v) : NaN)).some(Number.isNaN) ? null : p.map(Number); }
      if (kind === 'tri') { const p = t.split(/\s+/).map((s) => s.split(',').map(Number)); return p.length === 3 && p.every((q) => q.length === 2 && q.every(Number.isInteger)) ? p : null; }
    } catch (e) { return null; }
    return null;
  }
  // 一条说法的真相：{ all, none, some, yes: [成立的例子], no: [不成立的例子], answer: '总是' | '有时' | '从不' }
  function truth(c) {
    const yes = [], no = [];
    for (const x of c.space.items) (c.test(x) ? yes : no).push(x);
    return { yes, no, all: no.length === 0, none: yes.length === 0, answer: no.length === 0 ? '总是' : yes.length === 0 ? '从不' : '有时' };
  }
  // 这个例子是不是在说法的取值范围里（学生交的例子要在范围里才有效）
  const inSpace = (c, x) => c.space.items.some((y) => showEx(c.domain, y) === showEx(c.domain, x));

  U.RuleLib = { add, get: (id) => L.byId[id] || null, rules: (domain) => L.rules.filter((r) => !domain || r.domain === domain), claims: () => L.claims.slice(), byId: L.byId, space: spaceOf, show: showEx, parse: parseEx, truth, inSpace, triPool, isPrime, range };
})(typeof globalThis !== 'undefined' ? globalThis : window);
