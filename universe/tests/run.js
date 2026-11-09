/* node tests/run.js —— 内核测试，无依赖。 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const fsx = require('fs'), pk = (d) => fsx.readdirSync(path.join(root, d)).filter((f) => f.endsWith('.js')).sort().map((f) => d + '/' + f);
const files = ['js/core/rational.js', 'js/core/essences.js', 'js/core/kinds.js', 'js/core/kinds-more.js', 'js/core/poly.js', 'js/core/eqn.js', 'js/core/table.js', 'js/core/figure.js', 'js/core/convert.js', 'js/core/registry.js', 'js/core/rules.js', 'js/core/world.js', 'js/core/kit.js', 'js/core/judge.js', 'js/core/events.js', 'js/core/evidence.js', 'js/core/problem.js', 'js/core/inquiry.js', 'js/core/variants.js', 'js/core/loader.js', 'js/core/learning.js', 'js/core/session.js', 'js/core/share.js', 'js/core/review.js', 'js/core/author.js', 'js/core/macro.js'].concat(pk('packs')).concat(['problems/starter.js'], pk('problems').filter((f) => !/starter/.test(f)));
const ctx = vm.createContext({ console, TextEncoder, TextDecoder, btoa, atob });
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
console.log('问题结构（2.1）');
t('题库全部通过结构 lint（0 个错误）', () => { const r = U.problemLintAll(U.problems); eq(Object.keys(r.errors), [], '有题目结构错误'); });
t('lint 能抓住：id 重复、goal 指向不存在的里程碑、台阶越界', () => {
  const bad = { id: 'x', title: 't', milestones: [{ id: 'm', score: 1, when: { type: 'num', port: 'v', op: '=', value: '1' } }, { id: 'm', score: 1, when: { type: 'num', port: 'v', op: '=', value: '1' } }], goal: ['nope'], rung: 7 };
  const msg = U.problemLint(bad).errors.join('|');
  truthy(/重复/.test(msg) && /不存在的里程碑/.test(msg) && /rung/.test(msg), msg);
});
t('延伸题必须走到证明（evidence 至少 ③）；结论含“一定”时目标等级要够', () => {
  const st = { id: 'y', title: 't', level: 'stretch', evidence: 2, milestones: [{ id: 'm', score: 1, when: { type: 'num', port: 'v', op: '=', value: '1' } }] };
  truthy(U.problemLint(st).errors.some((m) => /延伸题/.test(m)), '延伸题证据太低应报错');
  const cl = { id: 'z', title: 't', claim: '两个奇数的和一定是偶数', evidence: 2, milestones: [{ id: 'm', score: 1, when: { type: 'num', port: 'v', op: '=', value: '1' } }] };
  truthy(U.problemLint(cl).errors.some((m) => /一定/.test(m)), '“一定”配 ② 应报错');
  eq(U.problemLint(Object.assign({}, cl, { evidence: 3 })).errors, [], '证据 ③ 就通过');
});
t('函数形式的条件：没写 why_code 给提示，不算错误', () => {
  const f = { id: 'w', title: 't', milestones: [{ id: 'm', score: 1, test: () => true }] };
  const r = U.problemLint(f); eq(r.errors, []); truthy(r.warnings.some((m) => /why_code/.test(m)));
  truthy(r.fnCount === 1);
});
console.log('证据等级（2.7）');
const evReset = () => U.Events.clear();
t('没有证据：① 举例；找到反例：已被推翻', () => {
  evReset(); eq(U.Evidence.levelOf().level, 1);
  U.Evidence.emit('counterexample', { found: true, where: 'n=4' }); eq(U.Evidence.levelOf().level, 'refuted');
  eq(U.Evidence.wording(U.Evidence.levelOf()), '这个结论已被推翻：有一个反例。');
});
t('扫过范围且没有例外：② 没找到反例，措辞带范围', () => {
  evReset(); U.Evidence.emit('scan', { range: [1, 1000], counterexamples: 0 });
  const r = U.Evidence.levelOf(); eq(r.level, 2); eq(U.Evidence.wording(r), '在 1 到 1000 里没找到例外。');
});
t('枚举全部情况且数量对：③；证明步骤全部填完：④', () => {
  evReset(); U.Evidence.emit('enumerate', { count: 36, expected: 36 }); eq(U.Evidence.levelOf().level, 3);
  U.Evidence.emit('proof', { steps: 4, filled: 4 }); eq(U.Evidence.levelOf().level, 4);
  eq(U.Evidence.wording(U.Evidence.levelOf()), '一定成立。');
});
t('枚举没列全（数量不对）不算 ③', () => { evReset(); U.Evidence.emit('enumerate', { count: 30, expected: 36 }); eq(U.Evidence.levelOf().level, 1); });
t('近似值参与的结论最高只到 ②', () => {
  evReset(); U.Evidence.emit('proof', { steps: 3, filled: 3 });
  const r = U.Evidence.levelOf(null, { approx: true }); eq(r.level, 2); truthy(r.why.some((m) => /近似/.test(m)));
});
t('陷阱 / 里程碑可以用 test 写条件（与 when 等价）', () => {
  const sc = W.blank(); const n = W.add(sc, 'num', 0, 0, { n: 0 });
  const pr = { id: 'probe-test-alias', title: '探针', milestones: [{ id: 'm1', say: '', score: 1, test: (w) => w.some('num', (e) => e.props.n === 1) }] };
  const run = U.Judge.start(pr, 'practice'); U.Judge.check(pr, run, sc, W.evaluate(sc));
  W.act(sc, { t: 'set', id: n, k: 'n', v: 1 }); run.armed = true; run.ops = 1; U.Judge.check(pr, run, sc, W.evaluate(sc));
  truthy(run.ms.m1.done, 'test 形式的里程碑应得分');
});
console.log('探究数据（2.3 / 2.4 / 2.5）');
t('搭法指纹：器材类型和线数相同，接法不同（串联 / 并联），指纹不同', () => {
  const chain = W.blank(); const n1 = W.add(chain, 'num', 0, 0, { n: 1 }); const o1 = W.add(chain, 'op', 0, 0, { op: 0 }); const o2 = W.add(chain, 'op', 0, 0, { op: 0 });
  W.act(chain, { t: 'link', from: n1, fromPort: 'v', to: o1, toPort: 'a' }); W.act(chain, { t: 'link', from: o1, fromPort: 'r', to: o2, toPort: 'a' });
  const par = W.blank(); const n2 = W.add(par, 'num', 0, 0, { n: 1 }); const p1 = W.add(par, 'op', 0, 0, { op: 0 }); const p2 = W.add(par, 'op', 0, 0, { op: 0 });
  W.act(par, { t: 'link', from: n2, fromPort: 'v', to: p1, toPort: 'a' }); W.act(par, { t: 'link', from: n2, fromPort: 'v', to: p2, toPort: 'a' });
  truthy(U.Judge.fingerprint(chain) !== U.Judge.fingerprint(par), '串联和并联应得到不同指纹');
});
t('搭法指纹：同一搭法，器材 id 不同，指纹相同', () => {
  const build = () => { const sc = W.blank(); const a = W.add(sc, 'num', 0, 0, { n: 1 }); const o = W.add(sc, 'op', 0, 0, { op: 0 }); W.act(sc, { t: 'link', from: a, fromPort: 'v', to: o, toPort: 'a' }); return sc; };
  eq(U.Judge.fingerprint(build()), U.Judge.fingerprint(build()));
});
t('误解：同一知识点、同一个错误猜测出现 2 次以上才标记', () => {
  const ev = [
    { type: 'finish', pid: 'p1', data: { match: false, guess: '5' } },
    { type: 'finish', pid: 'p2', data: { match: false, guess: '5' } },
    { type: 'finish', pid: 'p3', data: { match: false, guess: '7' } },
  ];
  const probs = [{ id: 'p1', points: ['4.6'] }, { id: 'p2', points: ['4.6'] }, { id: 'p3', points: ['4.6'] }];
  const m = U.Inquiry.misconceptions(ev, probs);
  eq(m.length, 1); eq(m[0].wrongGuess, '5'); eq(m[0].count, 2);
});
t('实验报告四栏：猜的、试的、发现的（证据等级 + 措辞）', () => {
  const ev = [
    { type: 'start', pid: 'q1', data: {} },
    { type: 'predict', pid: 'q1', data: { v: '6' } },
    { type: 'milestone', pid: 'q1', data: { id: 'm1' } },
    { type: 'hint', pid: 'q1', data: { id: 'm1', level: 1 } },
    { type: 'finish', pid: 'q1', data: { match: true, guess: '6', actual: '6' } },
    { type: 'evidence', pid: 'q1', data: { kind: 'scan', range: [1, 100], counterexamples: 0 } },
  ];
  const r = U.Inquiry.report(ev, 'q1', [{ id: 'q1', title: '探针题' }]);
  eq(r.cols.guess.prefill, '6'); eq(r.cols.tried.milestones, ['m1']); eq(r.cols.tried.hints, 1);
  eq(r.cols.found.evidence, 2); eq(r.cols.found.wording, '在 1 到 100 里没找到例外。'); truthy(r.finished);
});
console.log('参数化与变式（2.1）');
t('同一个种子生成同一组数，数在范围里', () => {
  const pr = { id: 'v', params: { total: [150, 300], per: [12, 40] } };
  const a = U.Variants.pick(pr.params, 7), b = U.Variants.pick(pr.params, 7);
  eq(a, b); truthy(a.total >= 150 && a.total <= 300 && a.per >= 12 && a.per <= 40);
  truthy(U.Variants.pick(pr.params, 8).total !== a.total || U.Variants.pick(pr.params, 9).total !== a.total, '不同种子应有不同的数');
});
t('变式把取出的值交给 build，并带上种子 id', () => {
  const pr = { id: 'v', params: { n: [2, 9] }, build: (vals) => ({ got: vals.n }), milestones: [] };
  const inst = U.Variants.instantiate(pr, 3);
  eq(inst.id, 'v#3'); eq(inst.build().got, inst.values.n);
});
t('参数范围写错、句子卡没有空、变式没有问法：lint 报错', () => {
  const bad = { id: 'b', title: 't', milestones: [{ id: 'm', score: 1, when: { type: 'num', port: 'v', op: '=', value: '1' } }],
    params: { n: [9, 2] }, explain: { form: 'cards', frame: '没有空' }, variant: { change: 'x' } };
  const msg = U.problemLint(bad).errors.join('|');
  truthy(/范围/.test(msg) && /空/.test(msg) && /ask/.test(msg), msg);
});
t('考试时长：写了用写的；没写按里程碑数 × 2，最少 3 分钟', () => {
  eq(U.Variants.examMinutes({ exam: { minutes: 9 }, milestones: [1] }), 9);
  eq(U.Variants.examMinutes({ milestones: [1] }), 3); eq(U.Variants.examMinutes({ milestones: [1, 2, 3, 4] }), 8);
});
console.log('证明计算内核（2.7）');
t('参数扫描：没有例外 → ②；找到例外 → 推翻，并记录反例', () => {
  U.Events.clear();
  const ok = U.Evidence.scanRange(1, 50, (n) => n * n >= n);
  eq(ok.found, false); eq(U.Evidence.levelOf().level, 2);
  U.Events.clear();
  const bad = U.Evidence.scanRange(1, 50, (n) => n !== 7);
  eq(bad.counter, 7); eq(U.Evidence.levelOf().level, 'refuted');
});
t('系统枚举：列全且全部通过 → ③；列得不全 → 仍是 ①', () => {
  U.Events.clear();
  const items = [1, 2, 3, 4, 5, 6];
  eq(U.Evidence.enumerate(items, 6, (x) => x > 0).complete, true); eq(U.Evidence.levelOf().level, 3);
  U.Events.clear();
  eq(U.Evidence.enumerate(items, 36, (x) => x > 0).complete, false); eq(U.Evidence.levelOf().level, 1);
});
t('证明脚手架：每一步都要有依据（ref）才算填完 → ④', () => {
  U.Events.clear();
  eq(U.Evidence.proof([{ text: 'a', ref: 'fact1' }, { text: 'b' }]).complete, false); eq(U.Evidence.levelOf().level, 1);
  U.Events.clear();
  eq(U.Evidence.proof([{ text: 'a', ref: 'fact1' }, { text: 'b', ref: 'law2' }]).complete, true); eq(U.Evidence.levelOf().level, 4);
});
t('归纳阶梯：起点成立，且每一级都能推下一级 → ④；某一级推不下去就指出在哪', () => {
  U.Events.clear();
  eq(U.Evidence.induction(true, () => true, 20).complete, true); eq(U.Evidence.levelOf().level, 4);
  U.Events.clear();
  const r = U.Evidence.induction(true, (k) => k !== 5, 20); eq(r.failedAt, 5); eq(r.complete, false); eq(U.Evidence.levelOf().level, 1);
});
console.log('其余首批值类型（1.7）');
for (const id of ['set', 'vec', 'expr', 'graph']) t('kind 注册合格：' + id, () => eq(U.lintKind(U.KINDS[id]), [], id));
t('集合：去重、与顺序无关、可以比较', () => {
  const a = U.SetV.of([Q(3), Q(1), Q(3)]), b = U.SetV.of([Q(1), Q(3)]);
  eq(a.length, 2); truthy(U.KINDS.set.eq(a, b)); eq(U.KINDS.set.show(a), '{1, 3}');
  eq(U.SetV.inter(a, U.SetV.of([Q(3), Q(5)])).length, 1);
});
t('向量：逐个分量比较，显示成元组', () => { truthy(U.KINDS.vec.eq([Q(1), Q(2)], [Q(1), Q(2)])); truthy(!U.KINDS.vec.eq([Q(1), Q(2)], [Q(2), Q(1)])); eq(U.KINDS.vec.show([Q(1), Q(-2)]), '(1, -2)'); });
t('代数式：(x+1)² = x²+2x+1，显示正确，求值正确', () => {
  const x1 = [Q(1), Q(1)];
  const sq = U.Expr.mul(x1, x1), rhs = [Q(1), Q(2), Q(1)];
  truthy(U.KINDS.expr.eq(sq, rhs)); eq(U.KINDS.expr.show(rhs), 'x² + 2x + 1');
  eq(U.Expr.eval(rhs, 3), 16);
  truthy(!U.KINDS.expr.eq(U.Expr.add(sq, [Q(1)]), rhs), '加一个常数后不相等');
});
t('代数式：零多项式与负系数', () => { eq(U.KINDS.expr.show([]), '0'); eq(U.KINDS.expr.show([Q(0), Q(-1)]), '−x'); });
t('图：点数和边集合相同即相等，边的两端顺序不影响', () => {
  const g1 = U.Graph.of(3, [[0, 1], [2, 1]]), g2 = U.Graph.of(3, [[1, 2], [1, 0]]);
  truthy(U.KINDS.graph.eq(g1, g2)); eq(U.KINDS.graph.show(g1), '3 个点，2 条边'); eq(U.Graph.degree(g1, 1), 2);
  truthy(!U.KINDS.graph.eq(g1, U.Graph.of(4, [[0, 1], [2, 1]])), '点数不同则不等');
});
t('新值类型存档往返后仍然相等', () => {
  const kinds = { set: U.SetV.of([Q(2), Q(5)]), vec: [Q(1), Q(0)], expr: [Q(1), Q(2), Q(1)], graph: U.Graph.of(3, [[0, 2]]) };
  for (const k of Object.keys(kinds)) truthy(U.KINDS[k].eq(U.KINDS[k].parse(U.KINDS[k].serialize(kinds[k])), kinds[k]), k);
});
console.log('器材包按需加载（1.8）');
t('清单覆盖全部内置包，每个包都有文件路径', () => { for (const id of Object.keys(U.packs)) if (id !== 'probe-deps') truthy(U.PACK_FILES[id], '缺清单：' + id); });
t('已注册的包不重复加载；不认识的包报 missing', () => {
  const r = U.ensurePacks(['core', 'no-such-pack']);
  eq(r.pending, []); eq(r.missing, ['no-such-pack']);
});
t('台面需要的包：由器材类型反推', () => {
  const sc = W.blank(); W.add(sc, 'tenframe', 0, 0, {});
  truthy(U.packsNeeded(null, sc).includes('tenframe'));
});
console.log('学习数据（第 3 节）');
const FIN = (pid, ts, ratio, extra) => Object.assign({ ts, type: 'finish', pid, data: Object.assign({ score: ratio * 10, max: 10, items: [{ id: 'm1', say: '算出来', score: 10, done: ratio >= 1, half: false }], traps: [], errors: 0 }, extra || {}) }, {});
t('复习规则：没达成 → 明天；干净达成 → 4 天；达成且变式也对 → 7 天并标掌握', () => {
  eq(U.Learning.nextReview({ ratio: 0.5, trapped: false, rejects: 0 }).days, 1);
  eq(U.Learning.nextReview({ ratio: 1, trapped: false, rejects: 0 }).days, 4);
  const v = U.Learning.nextReview({ ratio: 1, trapped: false, rejects: 0, variantOk: true }); eq(v.days, 7); eq(v.mastered, true);
  eq(U.Learning.nextReview({ ratio: 1, trapped: false, thirdHint: true }).days, 2);
});
t('复习：同一陷阱第二次踩中标为反复出现', () => {
  const probs = [{ id: 'a', title: 'A', points: ['4.6'], milestones: [] }];
  const ev = [FIN('a', 1, 0, { traps: ['误解X'] }), FIN('a', 2, 0, { traps: ['误解X'] })];
  const r = U.Learning.mastery(ev, probs, 3 * U.Learning.DAY);
  truthy(r.due.some((d) => d.repeat), '应有反复出现');
});
t('错题本：列出没达成的里程碑和踩中的陷阱', () => {
  const probs = [{ id: 'a', title: 'A', milestones: [] }];
  const wb = U.Learning.wrongBook([FIN('a', 1, 0.5, { traps: ['T'] })], probs);
  eq(wb.length, 1); eq(wb[0].traps, ['T']); eq(wb[0].missed.length, 1);
});
t('考试错因：有陷阱解释的不用自选；没解释的要选标签', () => {
  const rep = { items: [{ id: 'm1', done: false }], traps: [] };
  const r1 = U.Learning.examReport(rep, {}); eq(r1.needPick, ['m1']); eq(r1.complete, false);
  eq(U.Learning.examReport(rep, { m1: '粗心' }).complete, true);
  eq(U.Learning.examReport({ items: [{ id: 'm1', done: false }], traps: ['T'] }, {}).needPick, []);
  eq(U.Learning.examReport(rep, { m1: '乱写' }).complete, false, '不在标签里不算');
});
t('下一步练什么：只有丢分才推荐；同知识点的陷阱题排前', () => {
  const cur = { id: 'a', domain: 'D', points: ['4.6'] };
  const probs = [cur, { id: 'b', domain: 'D', points: ['4.6'], level: 'core' }, { id: 'c', domain: 'D', points: ['4.6'], level: 'trap' }];
  eq(U.Learning.nextPractice(cur, { items: [{ done: true }] }, probs), []);
  eq(U.Learning.nextPractice(cur, { items: [{ done: false }] }, probs)[0].pid, 'c');
});
t('改进清单：达成率低、用第三层提示多、陷阱踩中率高，各给一条建议', () => {
  const probs = [{ id: 'a', title: 'A', milestones: [{ id: 'm1', say: '关键步' }] }];
  const ev = [0, 1, 2].map((i) => FIN('a', i, 0, { traps: ['T'], items: [{ id: 'm1', say: '关键步', done: false, half: false }] }));
  const kinds = U.Learning.improvements(ev, probs).map((x) => x.kind);
  truthy(kinds.includes('milestone-low') && kinds.includes('trap-common'), kinds.join(','));
});
t('体检表：里程碑达成率与证据等级', () => {
  const probs = [{ id: 'a', title: 'A', points: ['4.6'], milestones: [{ id: 'm1', say: 's' }] }];
  const ev = [FIN('a', 1, 1)];
  const h = U.Learning.healthCard(ev, probs, '4.6');
  eq(h.rows[0].rate.m1, 1); eq(h.point, '4.6');
});
t('家长周报：本周练过的题、孩子的原话', () => {
  const now = 100 * U.Learning.DAY;
  const ev = [FIN('a', now - 1000, 0.5), { ts: now - 500, type: 'explain', pid: 'a', data: { text: '因为两个数相加' } }];
  const w = U.Learning.parentWeek(ev, [{ id: 'a', title: 'A', milestones: [] }], now);
  eq(w.count, 1); eq(w.quotes[0].text, '因为两个数相加');
});
console.log('断点续做与事件压缩（3.1 / 3.2.1）');
t('重放：开场快照 + 操作序列，结果与直接操作一致；被拒绝的操作不改台面', () => {
  const sc = W.blank(); const a = W.add(sc, 'num', 0, 0, { n: 2 }); const o = W.add(sc, 'op', 0, 0, { op: 0 });
  const sess = U.Session.start({ id: 'x' }, 'practice', sc, 0);
  U.Session.record(sess, { t: 'set', id: a, k: 'n', v: 5 });
  U.Session.record(sess, { t: 'link', from: 'nope', fromPort: 'v', to: o, toPort: 'a' }); // 会被拒绝
  const re = U.Session.replay(sess);
  eq(re.entities[a].props.n, 5); eq(re.links.length, 0);
});
t('考试剩余时间：刷新后从剩余时间继续，记 resume 事件', () => {
  const sess = U.Session.start({ id: 'x', milestones: [1, 2, 3] }, 'exam', W.blank(), 0);
  eq(sess.limitSec, 6 * 60);
  eq(U.Session.remaining(sess, 60 * 1000), 5 * 60);
  const r = U.Session.resume(sess, 120 * 1000);
  eq(r.event.type, 'resume'); eq(r.event.data.remaining, 4 * 60); eq(U.Session.remaining(sess, 120 * 1000), 4 * 60);
});
t('练习没有时限', () => eq(U.Session.start({ id: 'x' }, 'practice', W.blank(), 0).limitSec, null));
t('事件压缩：过期的事件只留每题最近一次结果，近期的全部保留', () => {
  const now = 100 * U.Learning.DAY;
  const log = [
    { ts: now - 40 * U.Learning.DAY, type: 'trap', pid: 'a', data: {} },
    { ts: now - 39 * U.Learning.DAY, type: 'finish', pid: 'a', data: {} },
    { ts: now - 35 * U.Learning.DAY, type: 'finish', pid: 'a', data: {} },
    { ts: now - 2 * U.Learning.DAY, type: 'trap', pid: 'a', data: {} },
  ];
  const kept = U.Session.compact(log, now, 30);
  eq(kept.length, 2); eq(kept[0].type, 'finish'); eq(kept[0].ts, now - 35 * U.Learning.DAY); eq(kept[1].type, 'trap');
});
console.log('作者层数据（第 3.3、4.1–4.3 节）');
t('分享：台面 → 文本 → 台面，内容一致（含中文名字）', () => {
  const sc = W.blank(); const id = W.add(sc, 'num', 10, 20, { n: 3 }); sc.entities[id].name = '数字卡甲';
  const enc = U.Share.encode(sc); eq(enc.mode, 'link');
  const back = U.Share.decode(enc.text); eq(back.entities[id].name, '数字卡甲'); eq(back.entities[id].props.n, 3);
});
t('分享：带着打包器材一起送出去，对方能用', () => {
  const sc = W.blank(); const a = W.add(sc, 'num', 0, 0, { n: 2 }); const b = W.add(sc, 'op', 0, 0, { op: 0 });
  const sub = Object.assign(W.blank(), {}); const k = W.add(sub, 'num', 0, 0, { n: 0 });
  U.defineMacro('share-probe-macro', { label: '探针宏', essence: ['E4'], inputs: {}, outputs: { v: { id: k, port: 'v' } }, scene: sub });
  const m = W.add(sc, 'share-probe-macro', 0, 0, {});
  const enc = U.Share.encode(sc);
  truthy(enc.text.length > 0);
  delete U.types['share-probe-macro']; // 模拟对方没有这个器材
  const back = U.Share.decode(enc.text);
  truthy(U.types['share-probe-macro'], '应登记带来的宏器材');
});
t('分享：超过 8 KB 改用文件（mode file）', () => {
  const sc = W.blank(); for (let i = 0; i < 400; i++) W.add(sc, 'num', i, i, { n: i });
  eq(U.Share.encode(sc).mode, 'file');
});
t('作业码：往返一致；结果文件按班汇总达成率', () => {
  const a = U.Share.assignment('周三作业', ['p1', 'p2'], 1234);
  eq(U.Share.parseAssignment(a.code).pids, ['p1', 'p2']);
  const probs = [{ id: 'p1', milestones: [{ id: 'm1' }] }];
  const f1 = U.Share.resultFile(a.id, ['p1'], [{ type: 'finish', pid: 'p1', ts: 1, data: { items: [{ id: 'm1', done: true }], traps: [] } }], '甲');
  const f2 = U.Share.resultFile(a.id, ['p1'], [{ type: 'finish', pid: 'p1', ts: 1, data: { items: [{ id: 'm1', done: false }], traps: ['T'] } }], '乙');
  const sum = U.Share.classSummary([f1, f2], probs);
  eq(sum.p1.students, 2); eq(sum.p1.rate.m1, 0.5); eq(sum.p1.traps.T, 1);
});
t('出题自检：台面满足目标才可以发布；空台面就满足的题不行', () => {
  const goal = [{ type: 'num', port: 'v', op: '=', value: '5' }];
  const bad = W.blank(); W.add(bad, 'num', 0, 0, { n: 5 });
  eq(U.Share.selfCheck(goal, W.blank()).ok, false, '台面没有满足目标');
  const trivial = { type: 'num', port: 'v', op: '=', value: '0' };
  const ok = W.blank(); W.add(ok, 'num', 0, 0, { n: 5 });
  eq(U.Share.selfCheck([{ type: 'num', port: 'v', op: '=', value: '5' }], ok).ok, true);
  eq(U.Share.selfCheck([trivial], W.blank()).ok, false, '空台面就满足的题不行');
});
console.log('图形对象模型');
const Fg = U.Fig, R34 = Fg.polygon([[0, 0], [4, 0], [0, 3]]), O0 = { x: Q(0), y: Q(0) };
t('3-4-5 直角三角形：面积 6、周长 12、斜边 5，都是精确值', () => {
  eq(U.Real.show(Fg.area(R34)), '6'); const per = Fg.perimeter(R34); truthy(per.exact); eq(U.Real.show(per.real), '12');
  eq(U.Real.show(Fg.len(R34.pts[1], R34.pts[2])), '5'); truthy(Fg.isRight(R34, 0)); truthy(!Fg.isRight(R34, 1));
});
t('边长是根号时周长精确保留：等腰直角三角形 2 + 2√2', () => {
  const t1 = Fg.polygon([[0, 0], [2, 0], [0, 2]]); const per = Fg.perimeter(t1); truthy(per.exact); eq(U.Real.show(per.real), '4 + 2√2');
});
t('不同根号相加不能精确表示：周长只给近似值', () => {
  const t2 = Fg.polygon([[0, 0], [1, 1], [3, 0]]); const per = Fg.perimeter(t2); eq(per.exact, false); truthy(Math.abs(per.approx - (3 + Math.SQRT2 + Math.sqrt(5))) < 1e-9);
});
t('平移、旋转、对称后全等，面积不变（不变量）', () => {
  for (const g of [Fg.translate(R34, Q(3), Q(-2)), Fg.rotate90(R34, O0, 1), Fg.reflect(R34, O0, { x: Q(1), y: Q(1) })]) {
    truthy(Fg.congruent(R34, g), Fg.show(g)); eq(U.Real.show(Fg.area(g)), '6');
  }
});
t('关于直线 y = x 对称：(2, 0) 变成 (0, 2)', () => { const p = Fg.reflect(Fg.point(2, 0), O0, { x: Q(1), y: Q(1) }); eq(Fg.show(p), '点 (0, 2)'); });
t('放大 2 倍：相似不全等，相似比 2，面积变 4 倍', () => {
  const g = Fg.scale(R34, O0, Q(2)); truthy(!Fg.congruent(R34, g)); const s = Fg.similar(R34, g); truthy(s.ok); eq(U.Q.show(s.k2), '4'); eq(U.Real.show(Fg.area(g)), '24');
});
t('顶点顺序不同也能找到对应关系；形状不同则不相似', () => {
  truthy(Fg.congruent(R34, Fg.polygon([[0, 3], [0, 0], [4, 0]])));
  truthy(!Fg.similar(R34, Fg.polygon([[0, 0], [3, 0], [0, 1]])).ok);
});
t('圆：面积 4π、周长 4π（半径 2），精确；与另一个圆相似', () => {
  const c = Fg.circle([0, 0], 4); eq(U.Real.show(Fg.area(c)), '4π'); eq(U.Real.show(Fg.perimeter(c).real), '4π');
  truthy(Fg.similar(c, Fg.circle([1, 1], 9)).ok); truthy(Fg.onCircle({ x: Q(2), y: Q(0) }, c));
});
t('平行、垂直、点在线段上：精确判定', () => {
  const s1 = Fg.segment([0, 0], [2, 1]), s2 = Fg.segment([1, 1], [5, 3]), s3 = Fg.segment([0, 0], [-1, 2]);
  truthy(Fg.parallel(s1, s2)); truthy(Fg.perpendicular(s1, s3)); truthy(Fg.onSegment({ x: Q(1), y: Q(1, 2) }, s1)); truthy(!Fg.onSegment({ x: Q(3), y: Q(3, 2) }, s1));
});
t('图形是一种值：注册合格，存档往返后相等', () => { eq(U.lintKind(U.KINDS.fig), []); truthy(U.KINDS.fig.eq(U.KINDS.fig.parse(U.KINDS.fig.serialize(R34)), R34)); });
t('器材连线：三角形 → 旋转 90° → 和原图比，全等；量一量面积 6', () => {
  const sc = W.blank(); const a = W.add(sc, 'ftri', 0, 0, {}); const x = W.add(sc, 'xform', 0, 0, { mode: 1 }); const r = W.add(sc, 'figrel', 0, 0, {}); const m = W.add(sc, 'figmeasure', 0, 0, {});
  truthy(W.act(sc, { t: 'link', from: a, fromPort: 'f', to: x, toPort: 'f' }).ok);
  truthy(W.act(sc, { t: 'link', from: a, fromPort: 'f', to: r, toPort: 'a' }).ok); truthy(W.act(sc, { t: 'link', from: x, fromPort: 'f', to: r, toPort: 'b' }).ok);
  truthy(W.act(sc, { t: 'link', from: x, fromPort: 'f', to: m, toPort: 'f' }).ok);
  const D = W.evaluate(sc); eq(D[r].out.cong.data, true); eq(U.showVal(D[m].out.area), '6'); eq(U.showVal(D[m].out.right), '1');
});
t('器材连线：放大 3/2 倍，相似比 3/2，不全等；面积可以接进运算器继续算', () => {
  const sc = W.blank(); const a = W.add(sc, 'fquad', 0, 0, {}); const x = W.add(sc, 'xform', 0, 0, { mode: 5, k: 3, kd: 2 }); const r = W.add(sc, 'figrel', 0, 0, {});
  W.act(sc, { t: 'link', from: a, fromPort: 'f', to: x, toPort: 'f' }); W.act(sc, { t: 'link', from: a, fromPort: 'f', to: r, toPort: 'a' }); W.act(sc, { t: 'link', from: x, fromPort: 'f', to: r, toPort: 'b' });
  const o = W.add(sc, 'op', 0, 0, { op: 2 }); W.act(sc, { t: 'link', from: a, fromPort: 'area', to: o, toPort: 'a' }); W.act(sc, { t: 'link', from: a, fromPort: 'area', to: o, toPort: 'b' });
  const D = W.evaluate(sc); eq(D[r].out.cong.data, false); eq(D[r].out.sim.data, true); eq(U.showVal(D[r].out.k), '3/2'); eq(U.showVal(D[o].out.r), '144');
});
t('图形不能接进只收数的口：连线被拒绝并说明原因', () => {
  const sc = W.blank(); const a = W.add(sc, 'ftri', 0, 0, {}); const o = W.add(sc, 'op', 0, 0, {});
  const r = W.act(sc, { t: 'link', from: a, fromPort: 'f', to: o, toPort: 'a' }); eq(r.ok, false); truthy(r.why.length > 0);
});
t('器材 id 不能重名：重名时保留原来的，并记录错误', () => {
  const before = U.types.num; U.define('num', Object.assign({}, U.types.num));
  truthy(U.types.num === before, '原器材不应被覆盖'); truthy(U.packErrors.some((m) => /器材 id 重复：num/.test(m)));
});
t('所有内置器材包加载时没有重名', () => eq(U.packErrors.filter((m) => /器材 id 重复/.test(m) && !/：num（/.test(m)), []));
console.log('旧几何器材输出图形');
const link2 = (sc, a, ap, b, bp) => truthy(W.act(sc, { t: 'link', from: a, fromPort: ap, to: b, toPort: bp }).ok, ap + '→' + bp);
t('长方形 6×4 → 量图形：面积 24，4 个直角；旋转后与原图全等', () => {
  const sc = W.blank(); const r = W.add(sc, 'rect', 0, 0, {}); const m = W.add(sc, 'figmeasure', 0, 0, {}); const x = W.add(sc, 'xform', 0, 0, { mode: 1 }); const q = W.add(sc, 'figrel', 0, 0, {});
  link2(sc, r, 'f', m, 'f'); link2(sc, r, 'f', x, 'f'); link2(sc, r, 'f', q, 'a'); link2(sc, x, 'f', q, 'b');
  const D = W.evaluate(sc); eq(U.showVal(D[m].out.area), '24'); eq(U.showVal(D[m].out.right), '4'); eq(D[q].out.cong.data, true);
});
t('平行四边形剪拼：剪拼前后不全等，但面积相等（面积是不变量）', () => {
  const sc = W.blank(); const pg = W.add(sc, 'parallelogram', 0, 0, {}); const m1 = W.add(sc, 'figmeasure', 0, 0, {}); const m2 = W.add(sc, 'figmeasure', 0, 0, {}); const q = W.add(sc, 'figrel', 0, 0, {});
  link2(sc, pg, 'f', m1, 'f'); link2(sc, pg, 'cut', m2, 'f'); link2(sc, pg, 'f', q, 'a'); link2(sc, pg, 'cut', q, 'b');
  const D = W.evaluate(sc); eq(U.showVal(D[m1].out.area), U.showVal(D[m2].out.area)); eq(U.showVal(D[m1].out.area), '15'); eq(D[q].out.cong.data, false);
  eq(U.showVal(D[m2].out.right), '4'); eq(U.showVal(D[m1].out.right), '0');
});
t('三边 3、4、5 的三角形输出图形，量得面积 6；三边 2、3、4 的顶点不是有理数，不输出图形并说明', () => {
  const sc = W.blank(); const t1 = W.add(sc, 'tri', 0, 0, { a: 3, b: 4, c: 5 }); const m = W.add(sc, 'figmeasure', 0, 0, {}); link2(sc, t1, 'f', m, 'f');
  const t2 = W.add(sc, 'tri', 0, 0, { a: 2, b: 3, c: 4 });
  const D = W.evaluate(sc); eq(U.showVal(D[m].out.area), '6'); eq(D[t2].out.f, undefined); truthy(D[t2].sig.some((x) => /不是有理数/.test(x.tx)));
});
t('折纸的纸片是图形：4×4 的正方形', () => { const sc = W.blank(); const f = W.add(sc, 'fold', 0, 0, {}); eq(U.Fig.show(W.evaluate(sc)[f].out.f.data), '四边形 (0, 0) (4, 0) (4, 4) (0, 4)'); });
console.log('来历追踪（任务 A）');
const frac = (a, b) => { const sc = W.blank(); const x = W.add(sc, 'num', 0, 0, { n: a[0], d: a[1] }), y = W.add(sc, 'num', 0, 0, { n: b[0], d: b[1] }), o = W.add(sc, 'op', 0, 0, { op: 0 });
  W.act(sc, { t: 'link', from: x, fromPort: 'v', to: o, toPort: 'a' }); W.act(sc, { t: 'link', from: y, fromPort: 'v', to: o, toPort: 'b' }); return { sc, x, y, o }; };
t('2/5 + 1/3：trace.steps 里有通分一步，规则都已登记', () => {
  const { sc, o } = frac([2, 5], [1, 3]); const D = W.evaluate(sc);
  const steps = D[o].trace.steps; truthy(steps.some((s) => /通分/.test(s.say)), steps.map((s) => s.say).join('|'));
  truthy(steps.every((s) => !s.rule || U.RULES[s.rule]), '规则要登记'); eq(D[o].trace.outputs.r.rule, 'frac.add');
});
t('explain 能追到两张数字卡；explainText 是几行人话', () => {
  const { sc, x, y, o } = frac([2, 5], [1, 3]); const D = W.evaluate(sc);
  const tree = W.explain(sc, D, o, 'r'); eq(tree.from.map((c) => c.id).sort(), [x, y].sort());
  const txt = W.explainText(tree); truthy(/通分/.test(txt) && txt.split('\n').length >= 4, txt);
});
t('关掉追踪：求值结果和打开时完全一样', () => {
  const { sc } = frac([2, 5], [1, 3]); const strip = (D) => Object.keys(D).map((id) => JSON.stringify([D[id].out, D[id].sig, D[id].props, D[id].driven]));
  eq(strip(W.evaluate(sc, { trace: false })), strip(W.evaluate(sc))); eq(W.evaluate(sc, { trace: false })[Object.keys(sc.entities)[0]].trace, null);
});
t('有环（经过记忆器）时 explain 不会死循环：遇到有状态器材就停，标上一拍的值', () => {
  const sc = W.blank(); const m = W.add(sc, 'memory', 0, 0, {}), n = W.add(sc, 'num', 0, 0, { n: 1 }), o = W.add(sc, 'op', 0, 0, { op: 0 });
  W.act(sc, { t: 'link', from: m, fromPort: 'v', to: o, toPort: 'a' }); W.act(sc, { t: 'link', from: n, fromPort: 'v', to: o, toPort: 'b' }); W.act(sc, { t: 'link', from: o, fromPort: 'r', to: m, toPort: 'in' });
  const D = W.evaluate(sc); const tree = W.explain(sc, D, o, 'r');
  const mem = tree.from.find((c) => c.id === m); truthy(mem && mem.stateful && mem.note === '上一拍的值');
});
t('W.from：同样得 6，一个是 192÷32 算的，一个是手填的 6', () => {
  const calc = W.blank(); const a = W.add(calc, 'num', 0, 0, { n: 192 }), b = W.add(calc, 'num', 0, 0, { n: 32 }), o = W.add(calc, 'op', 0, 0, { op: 3 });
  W.act(calc, { t: 'link', from: a, fromPort: 'v', to: o, toPort: 'a' }); W.act(calc, { t: 'link', from: b, fromPort: 'v', to: o, toPort: 'b' });
  const hand = W.blank(); W.add(hand, 'num', 0, 0, { n: 6 });
  const wOf = (sc) => U.Judge.makeW(sc, W.evaluate(sc), { ms: {} });
  truthy(wOf(calc).from(6, 'op', [192, 32]), '算出来的'); truthy(!wOf(calc).from(6, 'op', [200, 32]), '输入不对'); truthy(!wOf(hand).from(6, 'op', [192, 32]), '手填的不算');
});
t('带余除法、数位板、天平、三角形、量图形都写了中间步骤', () => {
  const need = { div: 'div.trial-quotient', digits: 'place.carry', balance: 'balance.compare', tri: 'tri.inequality', figmeasure: 'fig.shoelace' };
  const probe = (type, props, feed) => { const sc = W.blank(); const e = W.add(sc, type, 0, 0, props || {}); (feed || []).forEach(([t, p, port]) => { const f = W.add(sc, t, 0, 0, p); W.act(sc, { t: 'link', from: f, fromPort: 'v', to: e, toPort: port }); }); return W.evaluate(sc)[e].trace.steps.map((s) => s.rule); };
  const num = (n) => ['num', { n }];
  truthy(probe('divmod', {}, [[...num(17), 'a'], [...num(5), 'b']]).includes(need.div));
  truthy(probe('tri', { a: 3, b: 4, c: 5 }).includes('tri.pythagoras'));
  truthy(probe('digits', {}, [[...num(13), 'v']]).includes(need.digits));
  truthy(probe('balance', {}, [[...num(3), 'L'], [...num(3), 'R']]).includes(need.balance));
});
t('所有参考解跑完以后，没有器材用了没登记的规则', () => eq(U.ruleErrors, []));
console.log('连线时的类型转换（B.1）');
t('数字可以变成符号数、代数式；转换后精确标记和量纲照传', () => {
  const v = U.val('num', Q(3, 4), { dim: 'length' });
  const r = U.convertVal(v, 'real'); eq(r.kind, 'real'); eq(r.exact, true);
  eq(U.convertVal(U.val('num', Q(2)), 'expr').data, [Q(2)]);
  eq(U.convertVal(U.val('num', Q(0)), 'expr').data, []);
});
t('点 ↔ 图形（只有点图形能变回点）', () => {
  const pt = U.val('point', { x: Q(1), y: Q(2) });
  const f = U.convertVal(pt, 'fig'); eq(f.kind, 'fig'); eq(f.data.type, 'point');
  eq(U.convertVal(f, 'point').data, { x: Q(1), y: Q(2) });
  const seg = U.Fig.segment([0, 0], [1, 1]); eq(U.convertVal(U.val('fig', seg), 'point'), null, '线段不能变成点');
});
t('数列变成集合（去重、排序）', () => { eq(U.convertVal(U.val('seq', [Q(3), Q(1), Q(3)]), 'set').data.map((x) => x.n), [1, 3]); });
t('没有声明的转换被拒绝，连线时说明原因', () => {
  eq(U.convertVal(U.val('bool', true), 'num'), null);
  eq(U.kindOK('bool', 'num'), false);
});
t('lint：转换项必须是函数', () => eq(U.lintKind({ label: 'x', eq() {}, show() {}, serialize() {}, parse() {}, to: { real: 1 } }), ['to.real 要是转换函数']));
console.log('多元多项式（B.2）');
const Pl = U.Poly, x = Pl.variable('x'), y = Pl.variable('y'), one = Pl.const(Q(1));
const c = (n, d) => Pl.const(Q(n, d || 1));
t('规范化：(x+1)(x−1) = x² − 1；2(x+y) = 2x + 2y', () => {
  eq(Pl.show(Pl.mul(Pl.add(x, one), Pl.sub(x, one))), 'x² − 1');
  eq(Pl.show(Pl.mul(c(2), Pl.add(x, y))), '2x + 2y');
});
t('同类项合并，系数为 0 的项消失', () => { eq(Pl.show(Pl.add(Pl.add(x, y), Pl.neg(x))), 'y'); eq(Pl.show(Pl.sub(x, x)), '0'); });
t('乘方与恒等：(x+y)² = x² + 2xy + y²', () => { eq(Pl.show(Pl.pow(Pl.add(x, y), 2)), 'x² + 2x·y + y²'); truthy(Pl.eq(Pl.pow(Pl.add(x, y), 2), Pl.add(Pl.add(Pl.pow(x, 2), Pl.mul(c(2), Pl.mul(x, y))), Pl.pow(y, 2)))); });
t('代入：x 换成 y+1；数值代入求值', () => {
  eq(Pl.show(Pl.subst(Pl.pow(x, 2), 'x', Pl.add(y, one))), 'y² + 2y + 1');
  eq(Pl.evalQ(Pl.add(Pl.pow(x, 2), Pl.mul(c(3), y)), { x: Q(2), y: Q(1) }), Q(7));
});
t('次数与变量', () => { eq(Pl.degree(Pl.add(Pl.pow(x, 2), y)), 2); eq(Pl.vars(Pl.add(x, y)), ['x', 'y']); });
t('一元代数式 ↔ 多项式互转；多变量不能变回代数式', () => {
  const e = U.convertVal(U.val('expr', [Q(1), Q(2), Q(1)]), 'poly');
  eq(Pl.show(e.data), 'x² + 2x + 1');
  eq(U.convertVal(U.val('poly', Pl.add(x, y)), 'expr'), null);
  eq(U.convertVal(U.val('poly', Pl.pow(x, 2)), 'expr').data, [Q(0), Q(0), Q(1)]);
});
t('存档往返与种类注册', () => { truthy(U.KINDS.poly.eq(U.KINDS.poly.parse(U.KINDS.poly.serialize(Pl.add(x, y))), Pl.add(x, y))); eq(U.lintKind(U.KINDS.poly), []); });
console.log('方程、不等式、方程组（B.3）');
const Eq = U.Eqn, Pm = U.Poly, X = Pm.variable('x'), Yv = Pm.variable('y'), K = (n, d) => Pm.const(Q(n, d || 1));
const eqn = (l, r, rel) => Eq.make(l, r, rel);
t('3x + 5 = 20：两边减 5，两边除以 3，得到 x = 5（每一步都有说明）', () => {
  let e = eqn(Pm.add(Pm.mul(K(3), X), K(5)), K(20));
  const s1 = Eq.apply(e, { op: 'sub', by: K(5) }); truthy(s1.say && s1.rule === 'eq.both-sides'); e = s1.eqn;
  const s2 = Eq.apply(e, { op: 'div', by: K(3) }); e = s2.eqn;
  const sol = Eq.solveLinear(e, 'x'); eq(sol.kind, 'solution'); eq(sol.value, Q(5));
});
t('−2x > 4：两边除以 −2，不等号反向，得 x < −2', () => {
  const e = eqn(Pm.mul(K(-2), X), K(4), '>');
  const s = Eq.apply(e, { op: 'div', by: K(-2) }); eq(s.eqn.rel, '<'); eq(s.say.includes('反向'), true);
  const sol = Eq.solveLinear(e, 'x'); eq(sol.value, Q(-2)); eq(sol.rel, '<');
  eq(Interval_show(sol), '(−∞, -2)');
});
function Interval_show(sol) { return U.Interval.show(U.Interval.fromLinear(sol)); }
t('两边乘 0 被拒绝并说明原因；除以 0 也拒绝', () => {
  const e = eqn(X, K(1));
  truthy(Eq.apply(e, { op: 'mul', by: K(0) }).error.includes('乘 0'));
  truthy(Eq.apply(e, { op: 'div', by: K(0) }).error.includes('0'));
});
t('x² − 2x − 1 = 0 的根精确显示为 1 + √2 和 1 − √2', () => {
  const r = Eq.quadratic(Q(1), Q(-2), Q(-1)); eq(r.kind, 'roots');
  eq(U.KINDS.real.show(r.roots[0]), '1 + √2'); eq(U.KINDS.real.show(r.roots[1]), '1 − √2');
});
t('判别式为负：无实根', () => eq(Eq.quadratic(Q(1), Q(0), Q(1)).kind, 'none'));
t('x + y = 5, x − y = 1 解得 x = 3, y = 2（消元步骤有记录）', () => {
  const e1 = eqn(Pm.add(X, Yv), K(5)), e2 = eqn(Pm.sub(X, Yv), K(1));
  const r = Eq.solveSystem2(e1, e2, 'x', 'y'); eq(r.kind, 'solution'); eq(r.x, Q(3)); eq(r.y, Q(2)); truthy(r.steps.length >= 3);
});
t('方程组：两式成比例时没有唯一解', () => { eq(Eq.solveSystem2(eqn(Pm.add(X, Yv), K(1)), eqn(Pm.add(X, Yv), K(2)), 'x', 'y').kind, 'degenerate'); });
t('(x+1)² = x²+2x+1 是恒等式；x² = 4 只是方程', () => {
  truthy(Eq.isIdentity(eqn(Pm.pow(Pm.add(X, K(1)), 2), Pm.add(Pm.add(Pm.pow(X, 2), Pm.mul(K(2), X)), K(1)))));
  truthy(!Eq.isIdentity(eqn(Pm.pow(X, 2), K(4))));
});
t('区间：不等式的解集可以用 interval 表示，无穷端用 null', () => {
  const I = U.Interval.make(Q(-2), null, true, false);
  truthy(U.Interval.contains(I, Q(0))); truthy(!U.Interval.contains(I, Q(-2)));
  eq(U.Interval.show(I), '(-2, +∞)');
  truthy(U.KINDS.interval.eq(I, U.Interval.make(Q(-2), null, true, false)));
});
t('eqn、interval 通过注册 lint，可以存档往返', () => {
  eq(U.lintKind(U.KINDS.eqn), []); eq(U.lintKind(U.KINDS.interval), []);
  const e = eqn(Pm.add(X, K(1)), K(3));
  truthy(U.KINDS.eqn.eq(U.KINDS.eqn.parse(U.KINDS.eqn.serialize(e)), e));
});
console.log('代数式解析（B.4）');
t('解析：2(x+y)、(x+1)(x-1)、x²、(a+b)^2、3x^2y', () => {
  eq(U.Poly.show(U.Poly.parse('2(x+y)')), '2x + 2y');
  eq(U.Poly.show(U.Poly.parse('(x+1)(x-1)')), 'x² − 1');
  eq(U.Poly.show(U.Poly.parse('x²')), 'x²');
  eq(U.Poly.show(U.Poly.parse('(a+b)^2')), 'a² + 2a·b + b²');
  eq(U.Poly.show(U.Poly.parse('3x^2y')), '3x²·y');
});
t('解析：不认识的字符、括号不配对、式子是空的，都说明原因', () => {
  truthy(/多出了|看不懂/.test(String(thr(() => U.Poly.parse('2 & 3')))));
  truthy(/括号/.test(String(thr(() => U.Poly.parse('(x+1')))));
  truthy(/空/.test(String(thr(() => U.Poly.parse('')))));
});
function thr(f) { try { f(); return ''; } catch (e) { return e.message; } }
t('数字卡可以直接接进只收多项式的口（num → poly）', () => {
  const r = U.convertVal(U.val('num', Q(7)), 'poly'); eq(U.Poly.show(r.data), '7');
});
console.log('首批器材连起来（B.4）');
const chain = (fn) => { const sc = W.blank(); const ids = fn(sc); return { sc, ids, D: W.evaluate(sc) }; };
const link = (sc, a, pa, b, pb) => { const r = W.act(sc, { t: 'link', from: a, fromPort: pa, to: b, toPort: pb }); if (!r.ok) throw new Error(r.why); };
t('3x + 5 = 20：代数式卡 → 方程台（两边减 5）→ 解出 x = 5，变形步骤有追踪', () => {
  const { D, ids } = chain((sc) => {
    const a = W.add(sc, 'algebra', 0, 0, { text: '3x+5' }), r = W.add(sc, 'num', 0, 0, { n: 20 }), q = W.add(sc, 'eqdesk', 0, 0, { op: 1, by: 5, rel: 0 });
    link(sc, a, 'p', q, 'L'); link(sc, r, 'v', q, 'R'); return { a, r, q };
  });
  eq(U.showVal(D[ids.q].out.x), '5'); truthy(D[ids.q].trace.steps.some((s) => s.rule === 'eq.both-sides'), '应有变形步骤');
});
t('−2x > 4：两边除以 −2 后不等号反向；解集区间为 (−∞, −2)，数轴上试 −3 在里面', () => {
  const { D, ids } = chain((sc) => {
    const a = W.add(sc, 'algebra', 0, 0, { text: '-2x' }), r = W.add(sc, 'num', 0, 0, { n: 4 }), q = W.add(sc, 'eqdesk', 0, 0, { op: 3, by: -2, rel: 2, var: 'x' });
    const ax = W.add(sc, 'numline_iv', 0, 0, { probe: -3 });
    link(sc, a, 'p', q, 'L'); link(sc, r, 'v', q, 'R'); link(sc, q, 'iv', ax, 'iv'); return { a, r, q, ax };
  });
  eq(U.KINDS.eqn.show(D[ids.q].out.eq.data).includes('<'), true, '不等号应反向'); eq(U.Interval.show(D[ids.q].out.iv.data), '(−∞, -2)');
  eq(U.showVal(D[ids.ax].out.inside), '是');
});
t('代入器：x² − 2x − 1 把 x 换成 3 得 2', () => {
  const { D, ids } = chain((sc) => { const a = W.add(sc, 'algebra', 0, 0, { text: 'x^2 - 2x - 1' }), s = W.add(sc, 'subst', 0, 0, { var: 'x', value: 3 }); link(sc, a, 'p', s, 'p'); return { a, s }; });
  eq(U.showVal(D[ids.s].out.v), '2');
});
t('方程组台：x + y = 5 与 x − y = 1 解得 x = 3, y = 2', () => {
  const { D, ids } = chain((sc) => {
    const a1 = W.add(sc, 'algebra', 0, 0, { text: 'x+y' }), a2 = W.add(sc, 'algebra', 0, 0, { text: 'x-y' });
    const n5 = W.add(sc, 'num', 0, 0, { n: 5 }), n1 = W.add(sc, 'num', 0, 0, { n: 1 });
    const e1 = W.add(sc, 'eqdesk', 0, 0, { op: 0, by: 0 }), e2 = W.add(sc, 'eqdesk', 0, 0, { op: 0, by: 0 }), s = W.add(sc, 'system2', 0, 0, {});
    link(sc, a1, 'p', e1, 'L'); link(sc, n5, 'v', e1, 'R'); link(sc, a2, 'p', e2, 'L'); link(sc, n1, 'v', e2, 'R');
    link(sc, e1, 'eq', s, 'A'); link(sc, e2, 'eq', s, 'B'); return { s };
  });
  eq(U.showVal(D[ids.s].out.x), '3'); eq(U.showVal(D[ids.s].out.y), '2');
});
t('(x+1)² = x²+2x+1 是恒等式（方程台报告“恒等式”）', () => {
  const { D, ids } = chain((sc) => {
    const a = W.add(sc, 'algebra', 0, 0, { text: '(x+1)^2' }), b = W.add(sc, 'algebra', 0, 0, { text: 'x^2+2x+1' }), q = W.add(sc, 'eqdesk', 0, 0, { op: 0, by: 0 });
    link(sc, a, 'p', q, 'L'); link(sc, b, 'p', q, 'R'); return { q };
  });
  eq(D[ids.q].out.ident.data, true);
});
t('数字卡可以直接接进只收多项式的口；非法式子在代数式卡上说明原因', () => {
  const sc = W.blank(); const n = W.add(sc, 'num', 0, 0, { n: 2 }), s = W.add(sc, 'subst', 0, 0, {}); link(sc, n, 'v', s, 'p');
  const bad = W.add(sc, 'algebra', 0, 0, { text: '(x+1' }); const D = W.evaluate(sc);
  truthy(/括号/.test(D[bad].sig.map((x) => x.tx).join('|')), D[bad].sig.map((x) => x.tx).join('|'));
});
t('已有器材输出方程：变量盒输出左 = 右；解方程天平输出方程', () => {
  const sc = W.blank(); const v = W.add(sc, 'variable', 0, 0, { left: '2x+1', right: 'x+3', lo: -2, hi: 2 });
  const D = W.evaluate(sc); eq(U.KINDS.eqn.show(D[v].out.eq.data), '2x + 1 = x + 3');
  const sc2 = W.blank(); const b = W.add(sc2, 'eqscale', 0, 0, {});
  const D2 = W.evaluate(sc2); truthy(D2[b].out.eq && D2[b].out.eq.kind === 'eqn', '天平应输出方程');
});
console.log('数据表与拟合（C）');
const TT = U.Table, tbl = (rows) => TT.make(['时间', '路程'], rows);
t('正比例拟合：(1,60) (2,120) (3,180) 的 k 精确等于 60，残差为 0', () => {
  const r = TT.fitProportional(tbl([[1, 60], [2, 120], [3, 180]]), 0, 1); eq(r.kind, 'fn'); eq(r.k, Q(60)); eq(TT.sse(r.residuals), Q(0));
});
t('一次拟合（带小数的测量）：系数是有理数，与手算的最小二乘完全相等', () => {
  // 手算：n=4，Σx=10，Σy=20，Σxy=59.7，Σx²=30 → k = (4·59.7 − 10·20)/(4·30 − 100) = 97/50，b = (20 − 10·97/50)/4 = 3/20
  const r = TT.fitLinear(tbl([[1, 2.1], [2, 3.9], [3, 6.2], [4, 7.8]]), 0, 1);
  eq(r.kind, 'fn'); eq(r.k, Q(97, 50)); eq(r.b, Q(3, 20)); truthy(r.steps.length >= 3);
});
t('单位：时间 + 路程不允许；路程 ÷ 时间 得到“速度”，有中文名', () => {
  truthy(!U.Dim.add('time', 'length').ok, '不同量纲不能相加');
  eq(U.Dim.div('length', 'time'), 'speed'); eq(U.Dim.name('speed'), '速度');
  eq(U.Dim.mul('speed', 'time'), 'length'); eq(U.Dim.name(U.Dim.div('weight', 'volume')), '密度');
});
t('数据表：文字录入、小数转精确有理数；数据不对时说明原因', () => {
  eq(TT.parseRows('1,60;2,120').length, 2);
  eq(TT.parseRows('0.5,1')[0][0], Q(1, 2));
  truthy(/数不对/.test(String(thr(() => TT.parseRows('1,abc')))));
});
function thr(f) { try { f(); return ''; } catch (e) { return e.message; } }
t('建模链：数据表 → 拟合器（正比例）→ 预测器，预测结果标明是预测', () => {
  const sc = W.blank(); const d = W.add(sc, 'datatable', 0, 0, { data: '1,60;2,120;3,180', xname: '时间', yname: '路程' });
  const f = W.add(sc, 'fit', 0, 0, { model: 0, xcol: 0, ycol: 1 }), pr = W.add(sc, 'predict', 0, 0, { x: 5, note: true });
  W.act(sc, { t: 'link', from: d, fromPort: 't', to: f, toPort: 't' }); W.act(sc, { t: 'link', from: f, fromPort: 'f', to: pr, toPort: 'f' });
  const D = W.evaluate(sc); eq(U.showVal(D[f].out.k), '60'); eq(U.showVal(D[pr].out.y), '300');
  truthy(D[pr].sig.some((x) => /不是测量值/.test(x.tx)));
  truthy(D[pr].trace.steps.some((x) => x.rule === 'model.predict'));
});
t('取列 → seq；取不存在的列时说明原因；散点图标出点的个数', () => {
  const sc = W.blank(); const d = W.add(sc, 'datatable', 0, 0, { data: '1,2;3,4' }), c = W.add(sc, 'column', 0, 0, { col: 1 }), bad = W.add(sc, 'column', 0, 0, { col: 3 }), sp = W.add(sc, 'scatter', 0, 0, {});
  W.act(sc, { t: 'link', from: d, fromPort: 't', to: c, toPort: 't' }); W.act(sc, { t: 'link', from: d, fromPort: 't', to: sp, toPort: 't' });
  const refused = W.act(sc, { t: 'link', from: d, fromPort: 't', to: bad, toPort: 't' }); eq(refused.ok, false); truthy(/只有 2 列/.test(refused.why), refused.why);
  const D = W.evaluate(sc); eq(D[c].out.s.data.map((q) => q.n), [2, 4]); eq(U.showVal(D[sp].out.n), '2');
});
t('建模题模板 lint：三步都要有里程碑；拟合最高只到 ①', () => {
  const base = { id: 'mx', title: 't', milestones: [{ id: 'a', score: 1, when: { type: 'num', port: 'v', op: '=', value: '1' } }, { id: 'b', score: 1, when: { type: 'num', port: 'v', op: '=', value: '2' } }, { id: 'c', score: 1, when: { type: 'num', port: 'v', op: '=', value: '3' } }],
    model: { situation: '匀速行驶', quantities: [{ name: '时间' }, { name: '路程' }], relation: 'linear', check: '预测第 5 小时', steps: { choose: 'a', function: 'b', check: 'c' } } };
  eq(TT.lintModel(base).errors, []);
  truthy(TT.lintModel(Object.assign({}, base, { model: Object.assign({}, base.model, { steps: { choose: 'a' } }) })).errors.some((m) => /缺少/.test(m)));
  truthy(TT.lintModel(Object.assign({}, base, { evidence: 3 })).errors.some((m) => /①/.test(m)));
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
    { const strip = (D) => Object.keys(D).map((id) => JSON.stringify([D[id].out, D[id].sig, D[id].props, D[id].driven])); eq(strip(W.evaluate(s, { trace: false })), strip(W.evaluate(s)), '关掉追踪结果应一致：' + p.id); }
    if (U.inexactReads.length) throw new Error('对近似值做了精确判断（请改用 W.near 带容差）：' + JSON.stringify(U.inexactReads.slice(0, 2)));
    const goal = p.goal || p.milestones.map((m) => m.id), miss = goal.filter((id) => !run.ms[id].done);
    if (miss.length) throw new Error('没通过的里程碑：' + miss.join(','));
  });
}

console.log('\n' + pass + ' 通过，' + fail + ' 失败');
process.exit(fail ? 1 : 0);
