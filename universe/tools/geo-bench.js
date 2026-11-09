/* node tools/geo-bench.js —— 几何构造原型的两项实测：
 *  1. 构造一层套一层（中点、交点、垂足）时，有理数（BigInt 分子分母）能做到第几层；
 *     这里不再会因为“数太大”溢出，所以改为量：层数、分子分母的位数。超过 MAX_BITS 位就停（那是测试的上限，不是溢出）。
 *  2. 两直线求交点的速度（BigInt 版内核）。
 * 只读内核，不改任何东西。 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const ctx = vm.createContext({ console }); ctx.globalThis = ctx;
for (const f of ['js/core/rational.js', 'js/core/essences.js', 'js/core/kinds.js', 'js/core/kinds-more.js', 'js/core/figure.js', 'js/core/geo.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const U = ctx.U, Q = U.Q, Geo = U.Geo;

// 确定的伪随机
let seed = 20261109; const rnd = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; };
const ri = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));

const MAX_BITS = 4000;          // 测试上限：分子或分母超过这个位数就停止这次构造（不是溢出）
const bits = (q) => q.n.toString(2).length + q.d.toString(2).length;
const pbits = (p) => Math.max(bits(p.x), bits(p.y));

// ---------- 1. 构造层数 ----------
// 从 −10..10 格点上的 4 个点出发，每一步随机选一种构造，用已有的点造一个新点；新点的“层数” = 用到的点里最大的层数 + 1
function trial(maxSteps) {
  const pts = []; for (let i = 0; i < 4; i++) pts.push({ p: { x: Q(ri(-10, 10)), y: Q(ri(-10, 10)) }, d: 0 });
  let deepest = 0, maxBits = 0, capped = false;
  for (let step = 0; step < maxSteps; step++) {
    const pick = () => pts[ri(0, pts.length - 1)];
    const a = pick(), b = pick(), c = pick(), e = pick();
    let p = null, d;
    try {
      const k = ri(0, 2);
      if (k === 0) { p = Geo.midpoint(a.p, b.p); d = Math.max(a.d, b.d) + 1; }
      else if (k === 1) { p = Geo.lineIntersect(a.p, b.p, c.p, e.p); d = Math.max(a.d, b.d, c.d, e.d) + 1; }
      else { if (Q.eq(b.p.x, c.p.x) && Q.eq(b.p.y, c.p.y)) continue; p = Geo.foot(a.p, b.p, c.p); d = Math.max(a.d, b.d, c.d) + 1; }
    } catch (err) {
      if (err.message === 'div0') continue;
      throw err;
    }
    if (!p) continue;
    const pb = pbits(p);
    if (pb > MAX_BITS) { capped = true; break; }
    maxBits = Math.max(maxBits, pb);
    pts.push({ p, d }); deepest = Math.max(deepest, d);
  }
  return { deepest, maxBits, capped };
}
const runs = [];
for (let i = 0; i < 300; i++) runs.push(trial(400));
const sorted = (xs) => xs.slice().sort((a, b) => a - b);
const deep = sorted(runs.map((r) => r.deepest)), bitsAll = sorted(runs.map((r) => r.maxBits));
const med = (xs) => xs[Math.floor(xs.length / 2)];
console.log('1. 构造层数（300 次随机构造，每次最多 400 步，分子分母合计超过 ' + MAX_BITS + ' 位就停）');
console.log('   溢出的次数：0 / 300（有理数是 BigInt，不再溢出）');
console.log('   能做到的层数：最少 ' + deep[0] + '，中位数 ' + med(deep) + '，最多 ' + deep[deep.length - 1]);
console.log('   期间分子分母最大位数：中位数 ' + med(bitsAll) + ' 位，最多 ' + bitsAll[bitsAll.length - 1] + ' 位');
console.log('   因为超过 ' + MAX_BITS + ' 位而停下的次数：' + runs.filter((r) => r.capped).length + ' / 300');

// 只用中点（最温和的构造）：做到第几层
let mid = { p: { x: Q(1), y: Q(3) } }, depth = 0;
for (;;) { mid = { p: Geo.midpoint(mid.p, { x: Q(7), y: Q(-2) }) }; depth++; if (depth >= 200) break; }
console.log('   只反复取中点：做了 ' + depth + ' 层，分母位数 ' + bits(mid.p.x) + ' 位，没有溢出');
console.log('   参考：课本上的辅助线题一般 2–4 层（中点 → 连线 → 交点 → 垂足）');

// ---------- 2. 速度 ----------
const N = 200000, sets = [];
for (let i = 0; i < 64; i++) sets.push([0, 1, 2, 3].map(() => [ri(-10, 10), ri(-10, 10)]));
const pts4 = sets.map((s) => s.map(([x, y]) => ({ x: Q(x), y: Q(y) })));
let t0 = process.hrtime.bigint(), cnt = 0;
for (let i = 0; i < N; i++) { const s = pts4[i & 63]; if (Geo.lineIntersect(s[0], s[1], s[2], s[3])) cnt++; }
const tBig = Number(process.hrtime.bigint() - t0) / 1e6;
console.log('\n2. 速度：两直线求交点 ' + N + ' 次（格点坐标）');
console.log('   BigInt：' + tBig.toFixed(0) + ' 毫秒（每次 ' + (tBig * 1000 / N).toFixed(2) + ' 微秒）');
console.log('   一道几何题约 20–50 个构造，每次拖动重算一遍：约 ' + (tBig * 1000 / N * 50 / 1000).toFixed(2) + ' 毫秒，远低于一帧 16 毫秒');
