/* node tools/geo-bench.js —— 几何构造原型的两项实测：
 *  1. 构造一层套一层（中点、交点、垂足）时，第几层会因为有理数太大而溢出（普通数字存分子分母）
 *  2. 换成 BigInt 存分子分母，同样的构造慢多少
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

// ---------- 1. 溢出深度 ----------
// 从 −10..10 格点上的 4 个点出发，每一步随机选一种构造，用已有的点造一个新点；新点的“层数” = 用到的点里最大的层数 + 1
function trial(maxSteps) {
  const pts = []; for (let i = 0; i < 4; i++) pts.push({ p: { x: Q(ri(-10, 10)), y: Q(ri(-10, 10)) }, d: 0 });
  let deepest = 0;
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
      if (err.message === 'overflow') return { overflowAt: d === undefined ? deepest + 1 : d, steps: step };
      if (err.message === 'div0') continue;
      throw err;
    }
    if (!p) continue;
    pts.push({ p, d }); deepest = Math.max(deepest, d);
  }
  return { overflowAt: null, steps: maxSteps, deepest };
}
const runs = [];
for (let i = 0; i < 300; i++) runs.push(trial(400));
const hit = runs.filter((r) => r.overflowAt !== null).map((r) => r.overflowAt).sort((a, b) => a - b);
const pct = (q) => hit[Math.min(hit.length - 1, Math.floor(q * hit.length))];
console.log('1. 溢出深度（300 次随机构造，每次最多 400 步）');
console.log('   溢出的次数：' + hit.length + ' / 300');
if (hit.length) console.log('   溢出时的构造层数：最少 ' + hit[0] + '，10% 分位 ' + pct(0.1) + '，中位数 ' + pct(0.5) + '，90% 分位 ' + pct(0.9));
const stepsAt = runs.filter((r) => r.overflowAt !== null).map((r) => r.steps).sort((a, b) => a - b);
if (stepsAt.length) console.log('   溢出前走了多少步构造：最少 ' + stepsAt[0] + '，中位数 ' + stepsAt[Math.floor(stepsAt.length / 2)]);

// 只用中点（最温和的构造）：多少层溢出
let mid = { p: { x: Q(1), y: Q(3) } }, depth = 0;
try { for (;;) { mid = { p: Geo.midpoint(mid.p, { x: Q(7), y: Q(-2) }) }; depth++; if (depth > 200) break; } } catch (e) { /* overflow */ }
console.log('   只反复取中点：第 ' + (depth + 1) + ' 层溢出（分母每层乘 2）');

// 典型的课本题：三角形里连中线、取重心、作高、求垂足，层数
console.log('   参考：课本上的辅助线题一般 2–4 层（中点 → 连线 → 交点 → 垂足）');

// ---------- 2. BigInt 有多慢 ----------
const bgcd = (a, b) => { if (a < 0n) a = -a; if (b < 0n) b = -b; while (b) { const t = a % b; a = b; b = t; } return a || 1n; };
const BQ = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = bgcd(n, d); return { n: n / g, d: d / g }; };
const B = { add: (a, b) => BQ(a.n * b.d + b.n * a.d, a.d * b.d), sub: (a, b) => BQ(a.n * b.d - b.n * a.d, a.d * b.d), mul: (a, b) => BQ(a.n * b.n, a.d * b.d), div: (a, b) => BQ(a.n * b.d, a.d * b.n) };
function bInter(p1, p2, q1, q2) {
  const r = { x: B.sub(p2.x, p1.x), y: B.sub(p2.y, p1.y) }, s = { x: B.sub(q2.x, q1.x), y: B.sub(q2.y, q1.y) };
  const cr = (u, v) => B.sub(B.mul(u.x, v.y), B.mul(u.y, v.x));
  const den = cr(r, s); if (den.n === 0n) return null;
  const t = B.div(cr({ x: B.sub(q1.x, p1.x), y: B.sub(q1.y, p1.y) }, s), den);
  return { x: B.add(p1.x, B.mul(t, r.x)), y: B.add(p1.y, B.mul(t, r.y)) };
}
const N = 200000, sets = [];
for (let i = 0; i < 64; i++) sets.push([0, 1, 2, 3].map(() => [ri(-10, 10), ri(-10, 10)]));
let t0 = process.hrtime.bigint(), cnt = 0;
for (let i = 0; i < N; i++) { const s = sets[i & 63]; const r = Geo.lineIntersect(...s.map(([x, y]) => ({ x: Q(x), y: Q(y) }))); if (r) cnt++; }
const tNum = Number(process.hrtime.bigint() - t0) / 1e6;
t0 = process.hrtime.bigint();
for (let i = 0; i < N; i++) { const s = sets[i & 63]; const r = bInter(...s.map(([x, y]) => ({ x: BQ(BigInt(x)), y: BQ(BigInt(y)) }))); if (r) cnt++; }
const tBig = Number(process.hrtime.bigint() - t0) / 1e6;
console.log('\n2. 速度：两直线求交点 ' + N + ' 次（格点坐标）');
console.log('   普通数字：' + tNum.toFixed(0) + ' 毫秒（每次 ' + (tNum * 1000 / N).toFixed(2) + ' 微秒）');
console.log('   BigInt：  ' + tBig.toFixed(0) + ' 毫秒（每次 ' + (tBig * 1000 / N).toFixed(2) + ' 微秒），慢 ' + (tBig / tNum).toFixed(1) + ' 倍');
console.log('   一道几何题约 20–50 个构造，每次拖动重算一遍：BigInt 下约 ' + (tBig * 1000 / N * 50 / 1000).toFixed(2) + ' 毫秒，远低于一帧 16 毫秒');
