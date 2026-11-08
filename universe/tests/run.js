/* node tests/run.js —— 内核测试，无依赖。 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const fsx = require('fs'), pk = (d) => fsx.readdirSync(path.join(root, d)).filter((f) => f.endsWith('.js')).sort().map((f) => d + '/' + f);
const files = ['js/core/rational.js', 'js/core/kinds.js', 'js/core/registry.js', 'js/core/world.js', 'js/core/kit.js', 'js/core/judge.js', 'js/core/events.js'].concat(pk('packs')).concat(['problems/starter.js'], pk('problems').filter((f) => !/starter/.test(f)));
const ctx = vm.createContext({ console });
ctx.globalThis = ctx;
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const U = ctx.U, W = U.World, Q = U.Q;

let pass = 0, fail = 0;
const t = (name, fn) => { try { fn(); pass++; console.log('  ok   ' + name); } catch (e) { fail++; console.log('  FAIL ' + name + '\n       ' + (e && e.message)); } };
const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error((m || '') + ' 期望 ' + JSON.stringify(b) + ' 实际 ' + JSON.stringify(a)); };
const truthy = (x, m) => { if (!x) throw new Error(m || '应为真'); };

console.log('器材 lint');
for (const id of Object.keys(U.types)) t('lint ' + id, () => { const r = U.lintType(U.types[id]); eq(r.errors, [], id); });

console.log('有理数');
t('2/5+1/3=11/15', () => eq(Q.show(Q.add(Q(2, 5), Q(1, 3))), '11/15'));
t('溢出抛错', () => { let e; try { Q.mul(Q(9e15, 1), Q(9e15, 1)); } catch (x) { e = x; } truthy(e && e.message === 'overflow'); });
t('混合数', () => eq(Q.showMixed(Q(7, 3)), '2又1/3'));

console.log('连线规则');
const mkOp = (s, o) => { const a = W.add(s, 'num', 0, 0, { n: 2, d: 5 }), b = W.add(s, 'num', 0, 0, { n: 1, d: 3 }), p = W.add(s, 'op', 0, 0, { op: o || 0 }); W.act(s, { t: 'link', from: a, to: p, toPort: 'a' }); W.act(s, { t: 'link', from: b, to: p, toPort: 'b' }); return { a, b, p }; };
t('异分母加法 = 11/15', () => { const s = W.blank(), o = mkOp(s), D = W.evaluate(s); eq(Q.show(D[o.p].out.r.data), '11/15'); });
t('除以 0 给 err 信号，不抛', () => { const s = W.blank(), o = mkOp(s, 3); W.act(s, { t: 'set', id: o.b, k: 'n', v: 0 }); const D = W.evaluate(s); truthy(D[o.p].sig.some((x) => x.lv === 'err')); });
t('无记忆的环被拒绝，并说原因', () => { const s = W.blank(), o = mkOp(s); const r = W.act(s, { t: 'link', from: o.p, to: o.p, toPort: 'a' }); eq(r.ok, false); truthy(/记忆/.test(r.why)); });
t('经过记忆器的环合法', () => {
  const s = W.blank(), m = W.add(s, 'memory', 0, 0), p = W.add(s, 'op', 0, 0), one = W.add(s, 'num', 0, 0, { n: 1 });
  eq(W.act(s, { t: 'link', from: m, to: p, toPort: 'a' }).ok, true); eq(W.act(s, { t: 'link', from: one, to: p, toPort: 'b' }).ok, true); eq(W.act(s, { t: 'link', from: p, to: m, toPort: 'in' }).ok, true);
  for (let i = 0; i < 10; i++) W.tick(s);
  eq(Q.show(W.evaluate(s)[m].out.v.data), '10');
});
t('单位不同的加法被拒绝', () => {
  const s = W.blank(), a = W.add(s, 'num', 0, 0, { n: 3, unit: 2 }), b = W.add(s, 'num', 0, 0, { n: 2, unit: 5 }), p = W.add(s, 'op', 0, 0);
  eq(W.act(s, { t: 'link', from: a, to: p, toPort: 'a' }).ok, true); const r = W.act(s, { t: 'link', from: b, to: p, toPort: 'b' }); eq(r.ok, false, '应拒绝'); eq(s.links.length, 1, '拒绝后连线不变');
});
t('类型不匹配被拒绝', () => { const s = W.blank(), c = W.add(s, 'compare', 0, 0), p = W.add(s, 'op', 0, 0); eq(W.act(s, { t: 'link', from: c, to: p, toPort: 'a' }).ok, false); });
t('属性被连线驱动后不能手动改', () => {
  const s = W.blank(), a = W.add(s, 'num', 0, 0, { n: 7 }), b = W.add(s, 'num', 0, 0);
  eq(W.act(s, { t: 'link', from: a, to: b, toPort: 'p.n' }).ok, true); eq(Q.show(W.evaluate(s)[b].out.v.data), '7'); eq(W.act(s, { t: 'set', id: b, k: 'n', v: 3 }).ok, false);
});
t('撤销数据 = JSON 往返一致', () => { const s = W.blank(); mkOp(s); const s2 = W.load(W.save(s)); eq(Q.show(W.evaluate(s2).e3.out.r.data), '11/15'); });

console.log('世界时钟');
const diceScene = () => {
  const s = W.blank(), d1 = W.add(s, 'dice', 0, 0), d2 = W.add(s, 'dice', 0, 0, { salt: 1 }), p = W.add(s, 'op', 0, 0), h = W.add(s, 'hist', 0, 0);
  W.act(s, { t: 'link', from: d1, to: p, toPort: 'a' }); W.act(s, { t: 'link', from: d2, to: p, toPort: 'b' }); W.act(s, { t: 'link', from: p, to: h, toPort: 'v' });
  return { s, h };
};
t('同样的台面同样的拍数 → 完全相同', () => {
  const a = diceScene(), b = diceScene();
  for (let i = 0; i < 300; i++) { W.tick(a.s); W.tick(b.s); }
  eq(a.s.entities[a.h].state, b.s.entities[b.h].state);
});
t('两骰子点数和：7 最多，且总数 = 拍数−1', () => {
  const a = diceScene(); for (let i = 0; i < 2000; i++) W.tick(a.s);
  const cs = a.s.entities[a.h].state.counts, mx = Math.max(...cs);
  eq(cs.indexOf(mx) + 2, 7, '众数'); eq(cs.reduce((x, y) => x + y, 0) >= 1990, true, '总数');
});
t('rewind 回到起点', () => { const a = diceScene(); for (let i = 0; i < 50; i++) W.tick(a.s); W.act(a.s, { t: 'clock', rewind: true }); eq(a.s.clock.n, 0); eq(a.s.entities[a.h].state.counts.reduce((x, y) => x + y, 0), 0); });

console.log('判分');
const J = U.Judge;
t('开场已满足的里程碑不给分；先假后真才给分', () => {
  const p = U.problemById('frac-add-unlike'), s = p.build(), run = J.start(p, 'practice');
  let D = W.evaluate(s); J.check(p, run, s, D);
  eq(J.score(p, run).got, 0);
  run.armed = true; run.ops = 1;
  const op = W.add(s, 'op', 300, 100); D = W.evaluate(s); let r = J.check(p, run, s, D); eq(r.newly.map((m) => m.id), ['op']);
  const ids = Object.keys(s.entities).filter((id) => s.entities[id].role === 'a' || s.entities[id].role === 'b');
  W.act(s, { t: 'link', from: ids[0], to: op, toPort: 'a' }); W.act(s, { t: 'link', from: ids[1], to: op, toPort: 'b' });
  D = W.evaluate(s); r = J.check(p, run, s, D);
  eq(r.newly.map((m) => m.id).sort(), ['res', 'wire']);
  eq(J.score(p, run).got, 10);
});
t('陷阱：手动写 3/8 被识别', () => {
  const p = U.problemById('frac-add-unlike'), s = p.build(), run = J.start(p, 'practice'); run.armed = true;
  const id = W.add(s, 'num', 0, 0, { n: 3, d: 8 }); const r = J.check(p, run, s, W.evaluate(s)); eq(r.traps.map((x) => x.id), ['bad38']);
});
t('提示第 3 层 → 该里程碑减半', () => {
  const p = U.problemById('frac-add-unlike'), run = J.start(p, 'practice'); J.nextHint(p, run); J.nextHint(p, run); J.nextHint(p, run);
  run.ms.op.done = true; eq(J.score(p, run).got, 1);
});
t('计数回路题可以通关', () => {
  const p = U.problemById('counter-loop'), s = p.build(), run = J.start(p, 'practice'); J.check(p, run, s, W.evaluate(s)); run.armed = true; run.ops = 1;
  const one = Object.keys(s.entities).find((id) => s.entities[id].role === 'one');
  const m = W.add(s, 'memory', 0, 0), o = W.add(s, 'op', 0, 0); J.check(p, run, s, W.evaluate(s));
  W.act(s, { t: 'link', from: m, to: o, toPort: 'a' }); W.act(s, { t: 'link', from: one, to: o, toPort: 'b' }); W.act(s, { t: 'link', from: o, to: m, toPort: 'in' });
  J.check(p, run, s, W.evaluate(s));
  for (let i = 0; i < 12; i++) J.check(p, run, s, W.tick(s));
  eq(J.score(p, run).got, J.score(p, run).max, '满分'); eq(run.finished, true);
});

console.log('参考解回归（每道题都必须能通关）');
const SOL = require('./solutions.js');
for (const p of U.problems) {
  t('题目 ' + p.id + ' 有参考解且能通关', () => {
    const fn = SOL[p.id]; if (!fn) throw new Error('缺参考解：在 tests/solutions.js 里补一条');
    const s = p.build(), J2 = U.Judge, run = J2.start(p, 'practice');
    J2.check(p, run, s, W.evaluate(s)); run.armed = true; run.ops = 1;
    const chk = () => J2.check(p, run, s, W.evaluate(s));
    const h = {
      add(type, props) { const r = W.act(s, { t: 'add', type, x: 0, y: 0, props }); if (!r.ok) throw new Error(r.why); chk(); return r.id; },
      link(from, to, toPort, fromPort) { const r = W.act(s, { t: 'link', from, to, toPort, fromPort }); if (!r.ok) throw new Error('连线失败：' + r.why); chk(); },
      set(id, k, v) { const r = W.act(s, { t: 'set', id, k, v }); if (!r.ok) throw new Error(r.why); chk(); },
      role(r) { const e = Object.values(s.entities).find((x) => x.role === r); if (!e) throw new Error('没有角色 ' + r); return e.id; },
      run(n) { for (let i = 0; i < n; i++) { J2.check(p, run, s, W.tick(s)); } },
    };
    fn(h); chk();
    const goal = p.goal || p.milestones.map((m) => m.id), miss = goal.filter((id) => !run.ms[id].done);
    if (miss.length) throw new Error('没通过的里程碑：' + miss.join(','));
  });
}

console.log('\n' + pass + ' 通过，' + fail + ' 失败');
process.exit(fail ? 1 : 0);
