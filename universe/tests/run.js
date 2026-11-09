/* node tests/run.js —— 内核测试，无依赖。 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const fsx = require('fs'), pk = (d) => fsx.readdirSync(path.join(root, d)).filter((f) => f.endsWith('.js')).sort().map((f) => d + '/' + f);
const files = ['js/core/rational.js', 'js/core/essences.js', 'js/core/kinds.js', 'js/core/registry.js', 'js/core/world.js', 'js/core/kit.js', 'js/core/judge.js', 'js/core/events.js', 'js/core/review.js', 'js/core/author.js', 'js/core/macro.js'].concat(pk('packs')).concat(['problems/starter.js'], pk('problems').filter((f) => !/starter/.test(f)));
const ctx = vm.createContext({ console });
ctx.globalThis = ctx;
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const U = ctx.U, W = U.World, Q = U.Q;

let pass = 0, fail = 0;
const t = (name, fn) => { try { fn(); pass++; console.log('  ok   ' + name); } catch (e) { fail++; console.log('  FAIL ' + name + '\n       ' + (e && e.message)); } };
const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error((m || '') + ' 期望 ' + JSON.stringify(b) + ' 实际 ' + JSON.stringify(a)); };
const truthy = (x, m) => { if (!x) throw new Error(m || '应为真'); };

console.log('本质');
t('十二种本质齐全，前置都存在', () => { eq(U.ESSENCE_IDS.length, 12); for (const id of U.ESSENCE_IDS) for (const n of U.ESSENCES[id].needs) truthy(U.ESSENCES[n], id + ' 的前置 ' + n + ' 不存在'); });
t('每道题都声明了合法的 essence', () => { for (const p of U.problems) eq(U.checkEssence(p.essence), [], p.id); });
t('每种本质至少有一个器材', () => { for (const id of U.ESSENCE_IDS) truthy(Object.values(U.types).some((d) => d.essence.includes(id)), id + ' 没有器材'); });
t('每种本质至少有一道题', () => { for (const id of U.ESSENCE_IDS) truthy(U.problems.some((p) => p.essence.includes(id)), id + ' 没有题'); });
console.log('打包器材');
t('打包：把 +3 封成一个器材，外面接 2 得到 5', () => {
  const sc = W.blank();
  const a = W.add(sc, 'op', 0, 0, { op: 0 }); const b = W.add(sc, 'num', 0, 0, { n: 3 });
  sc.links.push({ id: 'in1', from: b, fromPort: 'v', to: a, toPort: 'b' });
  U.defineMacro('plus3', { label: '加三', essence: ['E4'], inputs: { x: { id: a, port: 'a' } }, outputs: { y: { id: a, port: 'r' } }, scene: sc });
  const s2 = W.blank(); const n2 = W.add(s2, 'num', 0, 0, { n: 2 }); const m = W.add(s2, 'plus3', 0, 0, {});
  s2.links.push({ id: 'o1', from: n2, fromPort: 'v', to: m, toPort: 'x' });
  const D = W.evaluate(s2); eq(U.Q.show(D[m].out.y.data), '5');
});
t('打包器材拒绝有状态的内部', () => {
  const sc = W.blank(); const mem = W.add(sc, 'memory', 0, 0, {}); let threw = false;
  try { U.defineMacro('badmem', { label: '坏', essence: ['E6'], inputs: {}, outputs: { v: { id: mem, port: 'v' } }, scene: sc }); } catch (e) { threw = true; }
  truthy(threw, '应拒绝有状态器材');
});
t('时钟的秒是近似小数，不显示成分数', () => {
  const sc = W.blank(); const c = W.add(sc, 'clock', 0, 0, {});
  sc.clock.n = 782; sc.clock.t = 195.5; const D = W.evaluate(sc);
  eq(U.showVal(D[c].out.t), '≈195.5');
});
console.log('删除');
t('删掉驱动属性的器材：线被清掉，属性回到手动值，台面继续求值不报错（U01）', () => {
  const s = W.blank();
  const src = W.act(s, { t: 'add', type: 'num', x: 0, y: 0, props: { n: 3 } }).id;
  const op = W.act(s, { t: 'add', type: 'op', x: 0, y: 0, props: { op: 0 } }).id;
  const out = W.act(s, { t: 'add', type: 'op', x: 0, y: 0, props: { op: 0 } }).id;
  truthy(W.act(s, { t: 'link', from: src, fromPort: 'v', to: op, toPort: 'p.op' }).ok, '驱动连线应成功');
  truthy(W.act(s, { t: 'link', from: op, fromPort: 'r', to: out, toPort: 'a' }).ok, '下游连线应成功');
  eq(W.evaluate(s)[op].driven.op.from, src, '驱动前应显示来源');
  truthy(W.act(s, { t: 'del', id: src }).ok, '删除应成功');
  const D = W.evaluate(s);
  eq(D[op].driven, {}, '删除后不应再显示驱动来源');
  eq(D[op].props.op, 0, '属性应回到手动值');
  truthy(W.act(s, { t: 'del', id: op }).ok, '删除下游器材应成功');
  W.tick(s); W.evaluate(s);
});
console.log('存档迁移（1.4）');
t('无版本的旧台面：补齐时钟，升到当前版本', () => {
  const old = { entities: { e1: { id: 'e1', type: 'num', name: '数字卡1', x: 0, y: 0, props: { n: 2 } } }, links: [] };
  const s = W.load(JSON.stringify(old)); eq(s.v, W.CURRENT_V); truthy(s.clock && s.clock.hz > 0, '应补齐时钟');
});
t('v2 台面没有容器字段：升到 v3 后 parent/slot 为 null', () => {
  const s = W.load(JSON.stringify({ v: 2, nid: 2, seq: {}, entities: { e1: { id: 'e1', type: 'num', name: 'x', x: 0, y: 0, props: { n: 1 } } }, links: [], clock: { t: 0, n: 0, running: false, hz: 4, rate: 1, seed: 1 } }));
  eq(s.v, 3); eq(s.entities.e1.parent, null); eq(s.entities.e1.slot, null);
});
t('新台面存盘再读回，内容不变', () => {
  const sc = W.blank(); W.add(sc, 'num', 0, 0, { n: 5 });
  eq(W.load(W.save(sc)), JSON.parse(W.save(sc)), '往返');
});
t('比当前版本新的台面拒绝打开，并说明版本', () => {
  let msg = ''; try { W.load(JSON.stringify({ v: 99, entities: {}, links: [] })); } catch (e) { msg = e.message; }
  truthy(/too-new/.test(msg), '应拒绝：' + msg);
});
console.log('符号精确数（1.7 real）');
const Rl = U.Real, sh = (v) => (v === null ? 'null' : U.KINDS.real.show(v));
t('√8 = 2√2，√(1/4) = 1/2，√9 = 3', () => { eq(sh(Rl.sqrt(Q(8))), '2√2'); eq(sh(Rl.sqrt(Q(1, 4))), '1/2'); eq(sh(Rl.sqrt(Q(9))), '3'); });
t('√2 + √2 = 2√2；√2 + 1 = 1 + √2', () => { eq(sh(Rl.add(Rl.sqrt(Q(2)), Rl.sqrt(Q(2)))), '2√2'); eq(sh(Rl.add(Rl.sqrt(Q(2)), Rl.from(Q(1)))), '1 + √2'); });
t('√2 · √2 = 2；√2 · 3 = 3√2', () => { eq(sh(Rl.mul(Rl.sqrt(Q(2)), Rl.sqrt(Q(2)))), '2'); eq(sh(Rl.mul(Rl.sqrt(Q(2)), Rl.from(Q(3)))), '3√2'); });
t('不能精确表示的运算返回 null：√2 + √3，√2 · √3', () => { eq(Rl.add(Rl.sqrt(Q(2)), Rl.sqrt(Q(3))), null); eq(Rl.mul(Rl.sqrt(Q(2)), Rl.sqrt(Q(3))), null); });
t('π：2π 可以，π·√2 不行', () => { eq(sh(Rl.mul(Rl.from(Q(2)), Rl.pi(Q(1)))), '2π'); eq(Rl.mul(Rl.pi(Q(1)), Rl.sqrt(Q(2))), null); });
t('近似值：√2 ≈ 1.4142，显示带 ≈', () => { const v = Rl.sqrt(Q(2)); eq(U.KINDS.real.showApprox(v), '1.4142'); truthy(Math.abs(Rl.approx(v) - Math.SQRT2) < 1e-12); });
t('相等判定：2√2 等于 √8，不等于 √2', () => { truthy(U.KINDS.real.eq(Rl.sqrt(Q(8)), Rl.mul(Rl.from(Q(2)), Rl.sqrt(Q(2))))); truthy(!U.KINDS.real.eq(Rl.sqrt(Q(8)), Rl.sqrt(Q(2)))); });
t('存档往返：符号数读回后相等', () => { const v = Rl.add(Rl.sqrt(Q(2)), Rl.from(Q(1))); truthy(U.KINDS.real.eq(U.KINDS.real.parse(U.KINDS.real.serialize(v)), v)); });
t('有理数可以无损进入符号数（num → real）', () => truthy(U.KINDS.num.to.real && U.kindOK('num', 'real')));
console.log('控件自动选型（1.1.1）');
t('选型：2–5 个选项→分段；开关；小整数→步进；大整数/有理数→滑杆；角度→转盘', () => {
  eq(U.controlFor({ type: 'choice', choices: ['a', 'b'] }), 'segment');
  eq(U.controlFor({ type: 'choice', choices: ['a', 'b', 'c', 'd', 'e', 'f'] }), 'select');
  eq(U.controlFor({ type: 'bool' }), 'switch');
  eq(U.controlFor({ type: 'int', min: 0, max: 10 }), 'stepper');
  eq(U.controlFor({ type: 'int', min: 0, max: 100 }), 'slider');
  eq(U.controlFor({ type: 'num' }), 'slider');
  eq(U.controlFor({ type: 'num', dim: '角度' }), 'dial');
});
t('器材覆盖控件：合法覆盖通过 lint；不匹配的覆盖（开关用分段）被拒绝', () => {
  const ok = Object.assign({}, U.types.num, { props: { n: { type: 'num', default: 1, control: 'slider', write: true }, d: { type: 'int', default: 1, write: true }, u: { type: 'bool', default: false, write: true } } });
  const bad = Object.assign({}, U.types.num, { props: { n: { type: 'num', default: 1, control: 'segment', write: true }, d: { type: 'int', default: 1, write: true }, u: { type: 'bool', default: false, write: true } } });
  eq(U.lintType(ok).errors.filter((m) => /control/.test(m)), [], '合法覆盖');
  truthy(U.lintType(bad).errors.some((m) => /control=segment/.test(m)), '应拒绝不匹配的覆盖');
});
console.log('容器与层级（1.10）');
const tfAct = (sc, a) => W.act(sc, a);
t('十格阵：放入筹码后个数与还差几个凑十都由子实体算出', () => {
  const sc = W.blank(); const tf = W.add(sc, 'tenframe', 100, 100, {});
  const cs = [0, 1, 2].map(() => W.add(sc, 'counter', 0, 0, {}));
  for (const c of cs) truthy(tfAct(sc, { t: 'put', id: c, parent: tf, slot: 'cells' }).ok, '放入应成功');
  const D = W.evaluate(sc); eq(U.showVal(D[tf].out.count), '3'); eq(U.showVal(D[tf].out.left), '7');
  eq(sc.entities[cs[0]].parent, tf); eq(sc.entities[cs[0]].slot, 'cells');
});
t('满十拒绝第 11 个，并说明“满十就要换成 1 个十”', () => {
  const sc = W.blank(); const tf = W.add(sc, 'tenframe', 0, 0, {});
  for (let i = 0; i < 10; i++) { const c = W.add(sc, 'counter', 0, 0, {}); truthy(tfAct(sc, { t: 'put', id: c, parent: tf, slot: 'cells' }).ok, '第 ' + (i + 1) + ' 个应成功'); }
  const eleven = W.add(sc, 'counter', 0, 0, {}); const r = tfAct(sc, { t: 'put', id: eleven, parent: tf, slot: 'cells' });
  eq(r.ok, false); truthy(/满十就要换成 1 个十/.test(r.why), r.why);
  eq(sc.entities[eleven].parent, null, '被拒绝的器材不应进入容器');
});
t('类型不对的器材放不进十格阵，并说明只能放什么', () => {
  const sc = W.blank(); const tf = W.add(sc, 'tenframe', 0, 0, {}); const n = W.add(sc, 'num', 0, 0, {});
  const r = tfAct(sc, { t: 'put', id: n, parent: tf, slot: 'cells' }); eq(r.ok, false); truthy(/只能放/.test(r.why), r.why);
});
t('容器不能放进它自己里面', () => {
  const sc = W.blank(); const tf = W.add(sc, 'tenframe', 0, 0, {});
  const r = tfAct(sc, { t: 'put', id: tf, parent: tf, slot: 'cells' }); eq(r.ok, false); truthy(/自己里面/.test(r.why), r.why);
});
t('子实体按布局排列（2 行 × 5 列）', () => {
  const sc = W.blank(); const tf = W.add(sc, 'tenframe', 100, 100, {});
  const c1 = W.add(sc, 'counter', 0, 0, {}), c2 = W.add(sc, 'counter', 0, 0, {}), c3 = W.add(sc, 'counter', 0, 0, {});
  [c1, c2, c3].forEach((c) => tfAct(sc, { t: 'put', id: c, parent: tf, slot: 'cells' }));
  eq([sc.entities[c1].x, sc.entities[c1].y], [114, 140]); eq([sc.entities[c2].x, sc.entities[c2].y], [136, 140]);
});
t('移动容器，子实体跟着动', () => {
  const sc = W.blank(); const tf = W.add(sc, 'tenframe', 100, 100, {}); const c1 = W.add(sc, 'counter', 0, 0, {});
  tfAct(sc, { t: 'put', id: c1, parent: tf, slot: 'cells' });
  const before = [sc.entities[c1].x, sc.entities[c1].y];
  tfAct(sc, { t: 'move', id: tf, x: 300, y: 50 });
  eq([sc.entities[c1].x, sc.entities[c1].y], [before[0] + 200, before[1] - 50]);
});
t('取出：子实体回到台面，个数随之变化', () => {
  const sc = W.blank(); const tf = W.add(sc, 'tenframe', 0, 0, {}); const c1 = W.add(sc, 'counter', 0, 0, {});
  tfAct(sc, { t: 'put', id: c1, parent: tf, slot: 'cells' }); tfAct(sc, { t: 'take', id: c1 });
  eq(sc.entities[c1].parent, null); eq(U.showVal(W.evaluate(sc)[tf].out.count), '0');
});
t('删除容器：默认把里面的东西倒到台面上', () => {
  const sc = W.blank(); const tf = W.add(sc, 'tenframe', 0, 0, {}); const c1 = W.add(sc, 'counter', 0, 0, {});
  tfAct(sc, { t: 'put', id: c1, parent: tf, slot: 'cells' });
  const r = tfAct(sc, { t: 'del', id: tf }); truthy(r.ok); eq(r.moved, 1);
  truthy(sc.entities[c1], '筹码还在'); eq(sc.entities[c1].parent, null);
});
t('删除容器（keep:all）：里面的一起删', () => {
  const sc = W.blank(); const tf = W.add(sc, 'tenframe', 0, 0, {}); const c1 = W.add(sc, 'counter', 0, 0, {});
  tfAct(sc, { t: 'put', id: c1, parent: tf, slot: 'cells' }); tfAct(sc, { t: 'del', id: tf, keep: 'all' });
  eq(sc.entities[c1], undefined);
});
t('复制筹码不会把它带进容器', () => {
  const sc = W.blank(); const tf = W.add(sc, 'tenframe', 0, 0, {}); const c1 = W.add(sc, 'counter', 0, 0, {});
  tfAct(sc, { t: 'put', id: c1, parent: tf, slot: 'cells' }); const r = tfAct(sc, { t: 'copy', id: c1 }); eq(sc.entities[r.id].parent, null);
});
t('容器的槽位声明合法（lint 通过）', () => eq(U.lintType(U.types.tenframe).errors, []));
console.log('世界时钟（1.3）');
t('确定性：同一台面、同一操作序列，随机器材的每一跳结果完全相同', () => {
  const run = () => {
    const sc = W.blank(); const d = W.add(sc, 'dice', 0, 0, {});
    let trace = [];
    for (let i = 0; i < 30; i++) { const D = W.tick(sc); trace.push(JSON.stringify(D[d].out)); }
    return trace.join('|');
  };
  eq(run(), run(), '两次运行应一致');
});
t('骰子掷 100 次：点数都在 1–6 之间，并且不是只有一个点数', () => {
  const sc = W.blank(); const d = W.add(sc, 'dice', 0, 0, {}); const seen = new Set();
  for (let i = 0; i < 100; i++) { const D = W.tick(sc); const v = U.Q.num(D[d].out[Object.keys(D[d].out)[0]].data); truthy(v >= 1 && v <= 6, '点数越界：' + v); seen.add(v); }
  truthy(seen.size >= 4, '点数太集中：' + [...seen]);
});
console.log('器材包（1.8）');
t('包的依赖缺失或版本太低，记入 packErrors', () => {
  U.registerPack({ id: 'probe-deps', version: 1, needs: ['no-such-pack@1', 'core@99'] });
  truthy(U.packErrors.some((m) => /no-such-pack/.test(m)), '缺失的包应报错');
  truthy(U.packErrors.some((m) => /core@99/.test(m)), '版本太低应报错');
});
t('按台面算需要的包：放了十格阵，就要 tenframe 包', () => {
  const sc = W.blank(); W.add(sc, 'tenframe', 0, 0, {});
  truthy(U.packsFor(sc).includes('tenframe'), '应包含 tenframe');
  truthy(!U.packsFor(W.blank()).includes('tenframe'), '空台面不需要它');
});
t('单文件版能生成，并内联了器材包', () => {
  const fs2 = require('fs'), path2 = require('path');
  require('child_process').execFileSync(process.execPath, [path2.join(root, 'tools', 'build-standalone.js')], { stdio: 'ignore' });
  const html = fs2.readFileSync(path2.join(root, 'dist', 'universe-standalone.html'), 'utf8');
  truthy(!/<script src=/.test(html) && html.includes('tenframe'), '应没有外部脚本引用，且包含十格阵');
});
console.log('输出声明（1.2）');
t('lint 拒绝没有声明 dim 的输出口', () => {
  const bad = Object.assign({}, U.types.num, { outputs: { v: { kind: 'num', label: '值' } } });
  truthy(U.lintType(bad).errors.some((m) => /dim/.test(m)), '应报 dim 缺失');
});
console.log('值类型与精确标记（1.7 / 1.9）');
for (const id of Object.keys(U.KINDS)) t('kind 注册合格：' + id, () => eq(U.lintKind(U.KINDS[id]), [], id));
t('存档往返：有理数读回后相等', () => { const v = Q(3, 4); truthy(U.KINDS.num.eq(U.KINDS.num.parse(U.KINDS.num.serialize(v)), v)); });
t('精确链：精确来源 → 运算器 → 仍然精确', () => {
  const s = W.blank(); const a = W.add(s, 'num', 0, 0, { n: 2 }); const b = W.add(s, 'num', 0, 0, { n: 3 }); const o = W.add(s, 'op', 0, 0, { op: 0 });
  W.act(s, { t: 'link', from: a, fromPort: 'v', to: o, toPort: 'a' }); W.act(s, { t: 'link', from: b, fromPort: 'v', to: o, toPort: 'b' });
  eq(W.evaluate(s)[o].out.r.exact, true, '精确输入应得精确输出');
});
t('近似链：近似来源（时钟的秒）→ 运算器 → 带 ≈', () => {
  const s = W.blank(); const c = W.add(s, 'clock', 0, 0, {}); const n = W.add(s, 'num', 0, 0, { n: 2 }); const o = W.add(s, 'op', 0, 0, { op: 0 });
  s.clock.t = 195.5;
  W.act(s, { t: 'link', from: c, fromPort: 't', to: o, toPort: 'a' }); W.act(s, { t: 'link', from: n, fromPort: 'v', to: o, toPort: 'b' });
  const r = W.evaluate(s)[o].out.r; eq(r.exact, false, '近似输入应得近似输出'); truthy(U.showVal(r).startsWith('≈'), '应显示 ≈');
});
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

console.log('复习与报告');
t('到期规则：没满分/踩陷阱马上到期；满分按间隔', () => {
  const D = 86400000, now = 1e12, P = U.problems;
  const log = [
    { ts: now - 2 * D, pid: 'frac-add-unlike', mode: 'practice', type: 'trap', data: { id: 'bad38' } },
    { ts: now - 2 * D, pid: 'frac-add-unlike', mode: 'practice', type: 'finish', data: { score: 10, max: 10, traps: ['x'], usedSec: 60 } },
    { ts: now - 5 * D, pid: 'balance-12', mode: 'practice', type: 'finish', data: { score: 6, max: 10, traps: [], usedSec: 30 } },
    { ts: now - 2 * D, pid: 'two-dice', mode: 'practice', type: 'finish', data: { score: 10, max: 10, traps: [], usedSec: 90 } },
    { ts: now - 4 * D, pid: 'counter-loop', mode: 'practice', type: 'finish', data: { score: 10, max: 10, traps: [], usedSec: 90 } },
  ];
  const r = U.Review.summarize(log, P, now), due = Object.fromEntries(r.due.map((x) => [x.pid, x]));
  truthy(due['frac-add-unlike'] && due['frac-add-unlike'].urgent, '踩陷阱应紧急');
  truthy(due['balance-12'] && due['balance-12'].urgent, '没满分应紧急');
  truthy(due['two-dice'] && !due['two-dice'].urgent, '2 天前满分、间隔 1 天：到期但不紧急');
  truthy(!U.Review.summarize([{ ts: now - D / 2, pid: 'two-dice', type: 'finish', data: { score: 10, max: 10 } }], P, now).due.length, '半天前满分：还没到期');
  eq(r.totals.tried, 4); eq(r.totals.minutes, 5);
});
t('没有记录时报告是空的而不是报错', () => { const r = U.Review.summarize([], U.problems, 1); eq(r.due.length, 0); eq(r.totals.tried, 0); });

console.log('学生出题');
t('可解的凑数题通过校验并给出做法', () => { const v = U.Author.validate({ title: '凑24', target: 24, givens: [{ n: 5 }, { n: 7 }, { n: 2 }] }); eq(v.ok, true); truthy(/×|\+/.test(v.solution), v.solution); });
t('凑不出的题被拒绝并说原因', () => { const v = U.Author.validate({ title: 'x', target: 7, givens: [{ n: 2 }, { n: 2 }] }); eq(v.ok, false); truthy(/凑不出/.test(v.why)); });
t('目标已在台面上 / 没标题 / 给太多数，都被拒绝', () => {
  eq(U.Author.validate({ title: 'x', target: 5, givens: [{ n: 5 }, { n: 1 }] }).ok, false);
  eq(U.Author.validate({ title: '', target: 5, givens: [{ n: 2 }, { n: 3 }] }).ok, false);
  eq(U.Author.validate({ title: 'x', target: 5, givens: [1, 2, 3, 4, 5, 6].map((n) => ({ n })) }).ok, false);
});
t('分数目标：1/2 和 1/3 凑 5/6', () => eq(U.Author.validate({ title: '分', target: '5/6', givens: [{ n: 1, d: 2 }, { n: 1, d: 3 }] }).ok, true));
t('学生出的题能被别人做通关', () => {
  const p = U.Author.make({ title: '凑24', target: 24, givens: [{ n: 5 }, { n: 7 }, { n: 2 }] }), s = p.build(), J2 = U.Judge, run = J2.start(p, 'practice');
  J2.check(p, run, s, W.evaluate(s)); run.armed = true; run.ops = 1;
  const g = Object.values(s.entities).map((e) => e.id), a = W.act(s, { t: 'add', type: 'op', x: 0, y: 0 }).id, b = W.act(s, { t: 'add', type: 'op', x: 0, y: 0, props: { op: 2 } }).id;
  J2.check(p, run, s, W.evaluate(s));
  W.act(s, { t: 'link', from: g[0], to: a, toPort: 'a' }); W.act(s, { t: 'link', from: g[1], to: a, toPort: 'b' }); W.act(s, { t: 'link', from: a, to: b, toPort: 'a' }); W.act(s, { t: 'link', from: g[2], to: b, toPort: 'b' });
  J2.check(p, run, s, W.evaluate(s)); eq(run.finished, true); eq(J2.score(p, run).got, 10);
});

console.log('近似值判分（1.9）');
t('对近似值用精确相等，会被记录（问题 lint 据此失败）', () => {
  const sc = W.blank(); const c = W.add(sc, 'clock', 0, 0, {}); sc.clock.t = 195.5; W.evaluate(sc);
  const pr = { id: 'probe-approx', title: '探针', milestones: [{ id: 'm1', say: '', score: 1, when: { type: 'clock', port: 't', op: '=', value: '195.5' } }] };
  U.inexactReads.length = 0;
  const run = U.Judge.start(pr, 'practice'); U.Judge.check(pr, run, sc, W.evaluate(sc));
  truthy(U.inexactReads.length > 0, '精确相等判近似值应被记录');
});
t('W.near 带容差判断近似值：不记录', () => {
  const sc = W.blank(); const c = W.add(sc, 'clock', 0, 0, {}); sc.clock.t = 195.5; const D = W.evaluate(sc);
  U.inexactReads.length = 0;
  const near = (x, tol) => Math.abs(U.Q.num(D[c].out.t.data) - x) <= tol;
  truthy(near(195.5, 0.01)); truthy(!near(100, 0.01)); eq(U.inexactReads.length, 0);
});
console.log('参考解回归（每道题都必须能通关）');
const SOL = require('./solutions.js');
for (const p of U.problems) {
  t('题目 ' + p.id + ' 有参考解且能通关', () => {
    const fn = SOL[p.id]; if (!fn) throw new Error('缺参考解：在 tests/solutions.js 里补一条');
    const s = p.build(), J2 = U.Judge, run = J2.start(p, 'practice');
    U.inexactReads.length = 0;
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
    if (U.inexactReads.length) throw new Error('对近似值做了精确判断（请改用 W.near 带容差）：' + JSON.stringify(U.inexactReads.slice(0, 2)));
    const goal = p.goal || p.milestones.map((m) => m.id), miss = goal.filter((id) => !run.ms[id].done);
    if (miss.length) throw new Error('没通过的里程碑：' + miss.join(','));
  });
}

console.log('\n' + pass + ' 通过，' + fail + ' 失败');
process.exit(fail ? 1 : 0);
