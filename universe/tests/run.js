/* node tests/run.js —— 内核测试，无依赖。 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const fsx = require('fs'), pk = (d) => fsx.readdirSync(path.join(root, d)).filter((f) => f.endsWith('.js')).sort().map((f) => d + '/' + f);
const files = ['js/core/rational.js', 'js/core/essences.js', 'js/core/kinds.js', 'js/core/kinds-more.js', 'js/core/poly.js', 'js/core/ratio.js', 'js/core/form.js', 'js/core/predict.js', 'js/core/eqn.js', 'js/core/seq.js', 'js/core/table.js', 'js/core/figure.js', 'js/core/geo.js', 'js/core/convert.js', 'js/core/registry.js', 'js/core/rules.js', 'js/core/rules-exec.js', 'js/core/workbench.js', 'js/core/digits.js', 'js/core/databench.js', 'js/core/deduce.js', 'js/core/geo-rules.js', 'js/core/world.js', 'js/core/measure.js', 'js/core/kit.js', 'js/core/judge.js', 'js/core/events.js', 'js/core/evidence.js', 'js/core/problem.js', 'js/core/inquiry.js', 'js/core/variants.js', 'js/core/curriculum.js', 'js/core/coverage.js', 'js/core/loader.js', 'js/core/learning.js', 'js/core/session.js', 'js/core/share.js', 'js/core/review.js', 'js/core/author.js', 'js/core/macro.js'].concat(pk('packs')).concat(['problems/starter.js'], pk('problems').filter((f) => !/starter/.test(f)));
const ctx = vm.createContext({ console, TextEncoder, TextDecoder, btoa, atob });
ctx.globalThis = ctx;
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const U = ctx.U, W = U.World, Q = U.Q;

let pass = 0, fail = 0;
const t = (name, fn) => { try { fn(); pass++; console.log('  ok   ' + name); } catch (e) { fail++; console.log('  FAIL ' + name + '\n       ' + (e && e.message)); } };
const bigStr = (v) => JSON.stringify(v, (k, x) => (typeof x === 'bigint' ? (Number.isSafeInteger(Number(x)) ? Number(x) : x.toString() + 'n') : x)); // BigInt 不能直接 JSON 化；小整数按数值比较
const eq = (a, b, m) => { if (bigStr(a) !== bigStr(b)) throw new Error((m || '') + ' 期望 ' + bigStr(b) + ' 实际 ' + bigStr(a)); };
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
  eq(s.v, W.CURRENT_V); eq(s.entities.e1.parent, null); eq(s.entities.e1.slot, null);
});
t('旧存档 v1–v4 都能读，升到 v6，实体补空的 ui（视图按自动适应），求值不报错', () => {
  const clock = { t: 0, n: 0, running: false, hz: 4, rate: 1, seed: 1 };
  const olds = [
    { entities: { e1: { id: 'e1', type: 'num', name: 'x', x: 0, y: 0, props: { n: 1 } } }, links: [] },
    { v: 2, nid: 2, seq: {}, entities: { e1: { id: 'e1', type: 'num', name: 'x', x: 0, y: 0, props: { n: 1 } } }, links: [], clock },
    { v: 3, nid: 2, seq: {}, entities: { e1: { id: 'e1', type: 'num', name: 'x', x: 0, y: 0, props: { n: 1 }, parent: null, slot: null } }, links: [], clock },
    { v: 4, nid: 2, seq: {}, entities: { e1: { id: 'e1', type: 'num', name: 'x', x: 0, y: 0, props: { n: 1 }, parent: null, slot: null } }, links: [], clock },
  ];
  for (const o of olds) {
    const s = W.load(JSON.stringify(o));
    eq(s.v, W.CURRENT_V, '升到当前版本（v6 起块的平移可以是分数，v7 起自由点坐标可以是分数）'); eq(s.entities.e1.ui, {}, '实体补空的 ui');
    W.evaluate(s);
  }
});
t('v5 台面的视图字段存盘再读回，不丢', () => {
  const sc = W.blank(); const id = W.add(sc, 'num', 0, 0, { n: 1 });
  sc.entities[id].ui = { view: { cx: 1, cy: 2, span: 9 }, hiddenLayers: { 'x.0': true } };
  eq(W.load(W.save(sc)).entities[id].ui, sc.entities[id].ui, '视图字段往返');
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
    for (let i = 0; i < 30; i++) { const D = W.tick(sc); trace.push(U.JSON.stringify(D[d].out)); }
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
  const sq = U.Poly.parse('(x+1)^2'), rhs = U.Poly.parse('x^2+2x+1');
  truthy(U.KINDS.expr.eq(sq, rhs)); eq(U.KINDS.expr.show(rhs), 'x² + 2x + 1');
  eq(U.Poly.evalQ(rhs, { x: Q(3) }), Q(16));
  truthy(!U.KINDS.expr.eq(U.Poly.add(sq, U.Poly.const(Q(1))), rhs), '加一个常数后不相等');
});
t('代数式：零多项式与负系数', () => { eq(U.KINDS.expr.show(U.Poly.const(Q(0))), '0'); eq(U.KINDS.expr.show(U.Poly.parse('-x')), '−x'); });
t('代数式读数只收代数式口：多字母代入求值；少代入的字母会说明', () => {
  const sc = W.blank(); const a = W.add(sc, 'algebra', 0, 0, { text: 'x*y+1' }), r = W.add(sc, 'exprread', 0, 0, { x: 2, y: 3 });
  eq(W.act(sc, { t: 'link', from: a, fromPort: 'p', to: r, toPort: 'e' }).ok, true);
  eq(U.showVal(W.evaluate(sc)[r].out.v), '7');
  const sc2 = W.blank(); const a2 = W.add(sc2, 'algebra', 0, 0, { text: 'x*z' }), r2 = W.add(sc2, 'exprread', 0, 0, { x: 1, y: 1 });
  const refused = W.act(sc2, { t: 'link', from: a2, fromPort: 'p', to: r2, toPort: 'e' });
  eq(refused.ok, false); truthy(/还有字母 z/.test(refused.why), refused.why);
});
t('代数式可以有多个字母（任务 B 遗留：原来只支持一元）', () => {
  const e = U.Poly.parse('x*y+1');
  eq(U.Poly.vars(e), ['x', 'y']); eq(U.Poly.evalQ(e, { x: Q(2), y: Q(3) }), Q(7));
  truthy(U.KINDS.expr.eq(e, U.Poly.parse('y*x+1')));
});
t('图：点数和边集合相同即相等，边的两端顺序不影响', () => {
  const g1 = U.Graph.of(3, [[0, 1], [2, 1]]), g2 = U.Graph.of(3, [[1, 2], [1, 0]]);
  truthy(U.KINDS.graph.eq(g1, g2)); eq(U.KINDS.graph.show(g1), '3 个点，2 条边'); eq(U.Graph.degree(g1, 1), 2);
  truthy(!U.KINDS.graph.eq(g1, U.Graph.of(4, [[0, 1], [2, 1]])), '点数不同则不等');
});
t('新值类型存档往返后仍然相等', () => {
  const kinds = { set: U.SetV.of([Q(2), Q(5)]), vec: [Q(1), Q(0)], expr: U.Poly.parse('x^2+2x+1'), graph: U.Graph.of(3, [[0, 2]]) };
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
t('断点续做：存成 JSON 读回后重放一致（含操作新建的器材）；连续走拍合并成一条', () => {
  const live = W.blank(); W.add(live, 'num', 0, 0, { n: 2 });
  const sess = U.Session.start({ id: 'x' }, 'practice', live, 0);
  const k = W.act(live, { t: 'add', type: 'num', x: 0, y: 0, props: { n: 4 } });
  U.Session.record(sess, { t: 'add', type: 'num', x: 0, y: 0, props: { n: 4 } });
  W.tick(live); W.tick(live); U.Session.record(sess, { tick: true }); U.Session.record(sess, { tick: true });
  W.act(live, { t: 'set', id: k.id, k: 'n', v: 7 }); U.Session.record(sess, { t: 'set', id: k.id, k: 'n', v: 7 });
  eq(sess.acts.length, 3, '两次走拍应合并');
  const back = JSON.parse(JSON.stringify(sess)); let steps = 0;
  const re = U.Session.replay(back, () => { steps++; });
  eq(steps, 3); eq(re.entities[k.id].props.n, 7);
  eq(JSON.stringify(re.entities), JSON.stringify(live.entities), '重放结果应和直接操作一致');
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
  const back = U.Share.parseResult(U.Share.resultCode(f1)); eq(back.student, '甲'); eq(back.results.p1.items[0].id, 'm1');
  let bad = ''; try { U.Share.parseResult(U.Share.resultCode({ v: 1 })); } catch (e) { bad = e.message; } truthy(/不是结果码/.test(bad), bad);
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
  const { sc } = frac([2, 5], [1, 3]); const strip = (D) => Object.keys(D).map((id) => U.JSON.stringify([D[id].out, D[id].sig, D[id].props, D[id].driven]));
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
  eq(U.KINDS.poly.show(U.convertVal(U.val('num', Q(2)), 'expr').data), '2');
  eq(U.KINDS.poly.show(U.convertVal(U.val('num', Q(0)), 'expr').data), '0');
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
t('代数式 ↔ 多项式互转（多变量也能变）', () => {
  const e = U.convertVal(U.val('expr', U.Poly.parse('x^2+2x+1')), 'poly');
  eq(Pl.show(e.data), 'x² + 2x + 1');
  eq(Pl.show(U.convertVal(U.val('poly', Pl.add(x, y)), 'expr').data), Pl.show(Pl.add(x, y)));
  eq(Pl.show(U.convertVal(U.val('poly', Pl.pow(x, 2)), 'expr').data), 'x²');
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
t('散点图接上拟合器后叠加直线（画面多一条线）', () => {
  const build = (withFit) => {
    const sc = W.blank(); const d = W.add(sc, 'datatable', 0, 0, { data: '1,2;2,4;3,6.5' }), sp = W.add(sc, 'scatter', 0, 0, {});
    W.act(sc, { t: 'link', from: d, fromPort: 't', to: sp, toPort: 't' });
    if (withFit) {
      const f = W.add(sc, 'fit', 0, 0, { model: 1 });
      W.act(sc, { t: 'link', from: d, fromPort: 't', to: f, toPort: 't' });
      W.act(sc, { t: 'link', from: f, fromPort: 'f', to: sp, toPort: 'line' });
    }
    const D = W.evaluate(sc);
    return U.types.scatter.draw({ props: D[sp].props, d: D[sp], out: {}, w: 230, h: 120 });
  };
  eq((build(true).match(/<line/g) || []).length, (build(false).match(/<line/g) || []).length + 1, '接上拟合器应多画一条拟合直线');
});
console.log('多元整除与最大公因式（约分用）');
t('精确整除：整除返回商，不整除返回 null', () => {
  const Pa = U.Poly.parse, P = U.Poly;
  eq(P.show(P.divExact(Pa('x^2-y^2'), Pa('x-y'))), 'x + y');
  eq(P.divExact(Pa('x^2+1'), Pa('x-1')), null);
});
t('最大公因式：一元与多元都对，首项系数为 1', () => {
  const Pa = U.Poly.parse, P = U.Poly;
  eq(P.show(P.gcd(Pa('x^2-1'), Pa('x+1'))), 'x + 1');
  eq(P.show(P.gcd(Pa('x^2-y^2'), Pa('x^2+2*x*y+y^2'))), 'x + y');
  eq(P.show(P.gcd(Pa('x^2*y-y'), Pa('x*y+y'))), 'x·y + y');
  eq(P.show(P.gcd(Pa('x*y+x'), Pa('x*y+y'))), '1', '互素');
  eq(P.show(P.gcd(Pa('x^2+1'), Pa('x+1'))), '1', '一元互素');
});
t('分式约分：分子分母同除以公因式；常数因子也约掉', () => {
  const R = U.Ratio, Pa = U.Poly.parse;
  eq(R.show(R.simplify(R.make(Pa('x^2-y^2'), Pa('x^2+2*x*y+y^2')))), '(x − y)/(x + y)');
  eq(R.show(R.simplify(R.make(Pa('x^2-1'), Pa('x+1')))), 'x − 1');
  eq(R.show(R.simplify(R.make(Pa('2'), Pa('2*x')))), '1/x');
  eq(R.show(R.simplify(R.make(Pa('0'), Pa('x+1')))), '0');
});
t('分式运算器材：结果自动约分，并说明“已约分”', () => {
  const sc = W.blank();
  const a = W.add(sc, 'fracnum', 0, 0, { num: 'x^2-1', den: 'x+1' }), b = W.add(sc, 'fracnum', 0, 0, { num: '1', den: '1' });
  const op = W.add(sc, 'ratop', 0, 0, { op: 2 });
  W.act(sc, { t: 'link', from: a, fromPort: 'f', to: op, toPort: 'a' }); W.act(sc, { t: 'link', from: b, fromPort: 'f', to: op, toPort: 'b' });
  const D = W.evaluate(sc);
  eq(U.showVal(D[op].out.r), 'x − 1');
  truthy(D[op].sig.some((s) => /已约分/.test(s.tx)));
});
t('平衡器材：二次方程给出两个精确根', () => {
  const sc = W.blank();
  const l = W.add(sc, 'algebra', 0, 0, { text: 'x^2-5x+6' }), r = W.add(sc, 'algebra', 0, 0, { text: '0' }), eq2 = W.add(sc, 'eqdesk', 0, 0, { rel: 0, op: 0, by: 0 });
  W.act(sc, { t: 'link', from: l, fromPort: 'p', to: eq2, toPort: 'L' }); W.act(sc, { t: 'link', from: r, fromPort: 'p', to: eq2, toPort: 'R' });
  const D = W.evaluate(sc);
  eq(U.showVal(D[eq2].out.r1), '3'); eq(U.showVal(D[eq2].out.r2), '2');
});
console.log('有理式（分式）');
t('分式种类注册合格', () => eq(U.lintKind(U.KINDS.ratio), []));
t('分式：加、减、乘、除，交叉相乘判相等（不需要约分）', () => {
  const R = U.Ratio, Pa = U.Poly.parse;
  const a = R.make(Pa('1'), Pa('x')), b = R.make(Pa('1'), Pa('y'));
  truthy(R.eq(R.add(a, b), R.make(Pa('x+y'), Pa('x*y'))), '1/x + 1/y = (x+y)/(xy)');
  truthy(!R.eq(R.add(a, b), R.make(Pa('x+y'), Pa('x+y'))), '分母不同、结果不同');
  truthy(R.eq(R.mul(a, R.make(Pa('x'), Pa('1'))), R.fromPoly(Pa('1'))), '1/x · x = 1');
  truthy(R.eq(R.div(R.fromPoly(Pa('x^2-1')), R.make(Pa('x+1'), Pa('1'))), R.make(Pa('x-1'), Pa('1'))), '(x²−1) ÷ (x+1) = x−1');
  eq(Q.show(R.evalQ(R.make(Pa('x+1'), Pa('x-1')), { x: Q(3) })), '2');
  eq(R.evalQ(R.make(Pa('1'), Pa('x-1')), { x: Q(1) }), null, '分母为 0 的地方没有值');
});
t('分式的错误：分母为 0、除以 0 都会说明', () => {
  const R = U.Ratio, Pa = U.Poly.parse;
  let m1 = ''; try { R.make(Pa('1'), Pa('0')); } catch (e) { m1 = e.message; } truthy(/分母不能是 0/.test(m1), m1);
  let m2 = ''; try { R.div(R.fromPoly(Pa('1')), R.fromPoly(Pa('0'))); } catch (e) { m2 = e.message; } truthy(/除数是 0/.test(m2), m2);
});
t('分式 ↔ 多项式：分母是常数才能化成多项式；多项式可以变成分式', () => {
  eq(U.KINDS.poly.show(U.convertVal(U.val('ratio', U.Ratio.make(U.Poly.parse('2x+4'), U.Poly.parse('2'))), 'poly').data), 'x + 2');
  eq(U.convertVal(U.val('ratio', U.Ratio.make(U.Poly.parse('1'), U.Poly.parse('x'))), 'poly'), null);
  eq(U.KINDS.ratio.show(U.convertVal(U.val('poly', U.Poly.parse('x+1')), 'ratio').data), 'x + 1');
});
t('分式器材：分式卡 → 分式运算 → 分式读数；分母为 0 的点连线就被拒绝', () => {
  const sc = W.blank();
  const a = W.add(sc, 'fracnum', 0, 0, { num: '1', den: 'x' }), b = W.add(sc, 'fracnum', 0, 0, { num: '1', den: 'y' });
  const op = W.add(sc, 'ratop', 0, 0, { op: 0 }), rd = W.add(sc, 'ratread', 0, 0, { x: 2, y: 4 });
  eq(W.act(sc, { t: 'link', from: a, fromPort: 'f', to: op, toPort: 'a' }).ok, true);
  eq(W.act(sc, { t: 'link', from: b, fromPort: 'f', to: op, toPort: 'b' }).ok, true);
  eq(W.act(sc, { t: 'link', from: op, fromPort: 'r', to: rd, toPort: 'f' }).ok, true);
  eq(U.showVal(W.evaluate(sc)[rd].out.v), '3/4');
  const sc2 = W.blank(); const a2 = W.add(sc2, 'fracnum', 0, 0, { num: '1', den: 'x' }), rd2 = W.add(sc2, 'ratread', 0, 0, { x: 0, y: 0 });
  const refused = W.act(sc2, { t: 'link', from: a2, fromPort: 'f', to: rd2, toPort: 'f' });
  eq(refused.ok, false); truthy(/分母是 0/.test(refused.why), refused.why);
});
t('表格式编辑：文字 ↔ 格子往返；空行丢掉；改完的文字能被数据表接受', () => {
  const view = TT.gridView('1,60;2,120');
  eq(view.length, 3); eq(view[2], ['', '']);
  eq(TT.gridText([['1', '60'], ['', '']]), '1,60');
  eq(TT.gridText([['1', '60'], ['2', '120'], ['3', '180']].filter((_, i) => i !== 1)), '1,60;3,180');
  eq(TT.gridText([['1', ' 60 '], ['2', '120']]), '1,60;2,120');
  const sc = W.blank(); const d = W.add(sc, 'datatable', 0, 0, { data: TT.gridText([['1', '2'], ['3', '4']]) });
  eq(W.evaluate(sc)[d].out.t.data.rows.length, 2);
});
t('建模题模板 lint：三步都要有里程碑；拟合最高只到 ①', () => {
  const base = { id: 'mx', title: 't', milestones: [{ id: 'a', score: 1, when: { type: 'num', port: 'v', op: '=', value: '1' } }, { id: 'b', score: 1, when: { type: 'num', port: 'v', op: '=', value: '2' } }, { id: 'c', score: 1, when: { type: 'num', port: 'v', op: '=', value: '3' } }],
    model: { situation: '匀速行驶', quantities: [{ name: '时间' }, { name: '路程' }], relation: 'linear', check: '预测第 5 小时', steps: { choose: 'a', function: 'b', check: 'c' } } };
  eq(TT.lintModel(base).errors, []);
  truthy(TT.lintModel(Object.assign({}, base, { model: Object.assign({}, base.model, { steps: { choose: 'a' } }) })).errors.some((m) => /缺少/.test(m)));
  truthy(TT.lintModel(Object.assign({}, base, { evidence: 3 })).errors.some((m) => /①/.test(m)));
});
console.log('知识点覆盖（D）');
t('知识点表：142 个，编号唯一，每个年级都有', () => {
  const ids = Object.keys(U.CURRICULUM); eq(ids.length, 142);
  for (let g = 1; g <= 9; g++) truthy(ids.some((id) => U.CURRICULUM[id].grade === g), '年级 ' + g + ' 没有知识点');
});
t('所有题目的 points 都在知识点表里（0 个错误）', () => { const bad = U.problems.map((p) => [p.id, U.CurriculumLint(p).errors]).filter((x) => x[1].length); eq(bad, []); });
t('没有对应知识点的题只给警告，不报错', () => { const p = { id: 'x', title: 't', points: [], milestones: [{ id: 'm', score: 1, when: { type: 'num', port: 'v', op: '=', value: '1' } }] }; eq(U.CurriculumLint(p).errors, []); truthy(U.CurriculumLint(p).warnings.length >= 1); });
t('覆盖统计：有题的知识点、按年级、按本质都能算出来', () => {
  const S = U.Coverage.summarize(U.problems);
  eq(S.points.length, 142); truthy(S.points.some((r) => r.problems.length > 0)); eq(S.grades.length, 9); eq(S.essences.length, 12);
});
console.log('排除表（2.14b 推理，next-steps.md §8.1）');
const DP = { people: '小明,小红,小刚', groups: '颜色：红,蓝,绿；宠物：猫,狗,兔' };
const DSOL = [[2, 1], [1, 1], [1, 2], [1, 0], [2, 2], [0, 1], [1, 3], [2, 3], [0, 3], [1, 4], [1, 5], [2, 4]];   // 参考解每一步 [人, 格]
const dRun = (list) => { let st = U.Deduce.start(DP); const steps = []; for (const [i, j] of list) { const r = U.Deduce.apply(st, 'mark', { i, j }); if (!r.ok) throw new Error('第 ' + (steps.length + 1) + ' 步不对：' + r.why); st = r.state; steps.push(r.step); } return { st, steps }; };
t('排除表：解析人、分组和值（中英文逗号、分号都认）', () => {
  const M = U.Deduce.parse(DP);
  eq(M.people, ['小明', '小红', '小刚']); eq(M.groups.map((g) => g.name), ['颜色', '宠物']); eq(M.cols.map((c) => c.name), ['红', '蓝', '绿', '猫', '狗', '兔']);
  eq(U.Deduce.parse({ people: '甲，乙', groups: '红、蓝' }).cols.length, 2);
});
t('排除表：值的个数和人数对不上、人名重复、值重名，都报错', () => {
  truthy(U.Deduce.parse({ people: '甲,乙,丙', groups: '红,蓝' }).error, '值的个数要和人数一样');
  truthy(U.Deduce.parse({ people: '甲,甲', groups: '红,蓝' }).error, '人名不能重复');
  truthy(U.Deduce.parse({ people: '甲,乙', groups: '红,蓝；颜色：红,绿' }).error, '值不能重名（判题按值的名字找）');
});
t('排除表：点一下标“不是”，再点（不能推出时）回到未定', () => {
  const st = U.Deduce.start(DP); let r = U.Deduce.apply(st, 'mark', { i: 2, j: 1 }); truthy(r.ok, '第一次点应当成功');
  eq(r.state.cells[2][1], 'n'); eq(r.step.args.to, 'n');
  r = U.Deduce.apply(r.state, 'mark', { i: 2, j: 1 }); truthy(r.ok); eq(r.state.cells[2][1], 'u', '再点回到未定');
});
t('排除表：同一行只剩一格时，点它直接标“是”，同列的别的格子变灰', () => {
  const { st } = dRun([[2, 1], [1, 1], [1, 2]]);   // 小刚不是蓝；小红不是蓝、不是绿
  truthy(U.Deduce.view(st).rows[1].cells[0].only, '小红的红是唯一剩下的');
  const r = U.Deduce.apply(st, 'mark', { i: 1, j: 0 }); truthy(r.ok, '唯一剩下的可以标是'); eq(r.state.cells[1][0], 'y');
  const v2 = U.Deduce.view(r.state);
  eq(v2.rows[0].cells[0].st, 'x', '同一列（红）的小明被排除（灰）'); eq(v2.rows[2].cells[0].st, 'x', '同一列（红）的小刚被排除（灰）');
  eq(v2.conclusions, ['小红 是 红']);
});
t('排除表：被排除的格子不能点，给出原因；没有唯一剩下时点一下只是排除', () => {
  const { st } = dRun([[2, 1], [1, 1], [1, 2], [1, 0]]);
  const r = U.Deduce.apply(st, 'mark', { i: 2, j: 0 }); truthy(!r.ok && /已经被排除/.test(r.why), '被排除的格子不能点');
  const r2 = U.Deduce.apply(U.Deduce.start(DP), 'mark', { i: 0, j: 0 }); eq(r2.state.cells[0][0], 'n', '开始时没有唯一剩下的格子，点一下只是排除');
});
t('排除表：参考解 12 步全部合法，排完后每人每组都是一个“是”（solved）', () => {
  const { st, steps } = dRun(DSOL);
  eq(steps.length, 12); truthy(U.Deduce.solved(st), '应当排完');
  eq(U.Deduce.view(st).now, '每人每一组都已经排定', '界面的进度');
});
t('排除表：步骤重放和逐步走的结果一致；撤销就是截短步骤后重放', () => {
  const { st, steps } = dRun(DSOL);
  eq(U.Deduce.replay(U.Deduce.start(DP), steps).cells, st.cells);
  eq(U.Deduce.replay(U.Deduce.start(DP), steps.slice(0, 4)).cells[1][0], 'y', '撤销到第 4 步，小红的红还是是');
});
t('排除表：判题（yes / no / solved）看台面上记的步骤；表换了，旧步骤不算', () => {
  const { steps } = dRun(DSOL);
  const scene = { entities: { h: { type: 'deduce', props: DP } }, links: [], clock: { t: 0, n: 0 }, workbench: { host: 'h', key: U.Deduce.keyOf(DP), steps } };
  const J = (c, sc) => U.Judge.compile(c)(U.Judge.makeW(sc || scene, {}, {}));
  truthy(J({ deduce: { yes: { person: '小红', value: '红' } } }), '小红 是 红');
  truthy(!J({ deduce: { yes: { person: '小明', value: '红' } } }), '小明 不是 红');
  truthy(J({ deduce: { no: { person: '小刚', value: '蓝' } } }), '小刚 不是 蓝（已排除）');
  truthy(J({ deduce: { solved: true } }), '排完了');
  const scene2 = Object.assign({}, scene, { workbench: Object.assign({}, scene.workbench, { key: 'deduce|别的表' }) });
  truthy(!J({ deduce: { solved: true } }, scene2), '表换了，旧步骤不算');
  truthy(!J({ deduce: { solved: true } }, { entities: {}, links: [], clock: { t: 0, n: 0 } }), '没有排除表，不算');
});
t('排除表：步骤的文字写着人、值和做法', () => {
  const { steps } = dRun([[2, 1], [2, 1]]);
  eq(U.Deduce.stepText(U.Deduce.parse(DP), steps[0]), '小刚 蓝：不是');
  eq(U.Deduce.stepText(U.Deduce.parse(DP), steps[1]), '小刚 蓝：取消排除');
});
t('排除表：是一种工作台（deduce），器材在排除表里，题目 deduce-who 有知识点 2.14b 且 lint 通过', () => {
  truthy(U.WORKBENCHES.includes('deduce'), 'WORKBENCHES 里要有 deduce');
  eq(U.types.deduce.wbUI, 'deduce'); truthy(U.WB_UIS.includes('deduce'));
  eq(U.types.deduce.workbenches, ['deduce']);
  const p = U.problems.find((x) => x.id === 'deduce-who');
  truthy(p, '有题 deduce-who'); eq(p.workbench, 'deduce'); truthy(p.points.includes('2.14b'));
  eq(U.problemLint(p).errors, [], '题目 lint 没有错误');
});
// 遗留状态（next-steps.md §8）：孤立题（没有知识点的题）和没有题的知识点，只允许下面列出的例外。
// 新增孤立题、或例外被接上了却没从这里删掉，都会失败。例外的理由写在 docs/next-steps.md §8。
const ORPHAN_OK = { 'seq-arith-20': '等差数列求和是高中内容，义务教育课标（2022）没有要求，知识点表里没有对应的点' };
const NO_PROBLEM_OK = {
  '6.14': '综合与实践 / 整理和复习：不是单一知识点，留到综合题批次',
};
t('遗留：孤立题（points 为空，不在任何知识点下）只剩允许的例外', () => {
  const S = U.Coverage.summarize(U.problems);
  eq(S.noPoint.slice().sort(), Object.keys(ORPHAN_OK).sort(), '孤立题');
  for (const id of Object.keys(ORPHAN_OK)) truthy(U.problems.some((p) => p.id === id), '例外里的题不存在：' + id);
});
t('遗留：没有题的知识点只剩允许的例外（6.14 综合）', () => {
  const S = U.Coverage.summarize(U.problems);
  eq(S.noProblemPoints.slice().sort(), Object.keys(NO_PROBLEM_OK).sort(), '没有题的知识点');
});
console.log('证明类器材（2.7）');
const pr = (type, props, feed) => { const sc = W.blank(); const e = W.add(sc, type, 0, 0, props || {}); (feed || []).forEach(([t, p2, port, fport]) => { const f = W.add(sc, t, 0, 0, p2); W.act(sc, { t: 'link', from: f, fromPort: fport || 'v', to: e, toPort: port }); }); return W.evaluate(sc)[e].out; };
const lvOf = (o) => (o.lv ? Q.num(o.lv.data) : null);
t('参数扫描器：规则在范围里没有例外 → ②；没有反例，不推翻', () => {
  const o = pr('scanner', { rule: 0, from: 1, to: 100 }); eq(lvOf(o), 2); eq(o.refuted.data, false); eq(o.checked.data.n, 100);
});
t('反例构造器：“质数都是奇数”在 1–50 里找到 2，结论被推翻', () => {
  const o = pr('counterex', { rule: 3, from: 1, to: 50 }); eq(o.refuted.data, true); eq(o.counter.data.n, 2);
});
t('系统枚举器：两个骰子列全 36 种，和为 7 的有 6 种 → ③；应有数不对就只是 ①', () => {
  const o = pr('enumerator', { target: 7, expected: 36 }); eq(lvOf(o), 3); eq(o.count.data.n, 6); eq(o.total.data.n, 36);
  eq(lvOf(pr('enumerator', { target: 7, expected: 30 })), 1);
});
t('证明脚手架：每一步的依据从台面上选：选中的事实成立 → 填完；选的事实不成立或没选 → 不算', () => {
  const sc = W.blank();
  const ok1 = W.add(sc, 'invariant', 0, 0, { change: 0, times: 2 }), ok2 = W.add(sc, 'invariant', 0, 0, { change: 0, times: 3 }), bad = W.add(sc, 'invariant', 0, 0, { change: 3, times: 2 });
  const e = W.add(sc, 'scaffold', 0, 0, { r1: ok1 + '.kept', r2: ok2 + '.kept', r3: ok1 + '.kept' });
  const D = W.evaluate(sc); eq(lvOf(D[e].out), 4); eq(D[e].out.filled.data.n, 3);
  const sc2 = W.blank();
  const g1 = W.add(sc2, 'invariant', 0, 0, { change: 0, times: 2 }), b1 = W.add(sc2, 'invariant', 0, 0, { change: 3, times: 2 });
  const e2 = W.add(sc2, 'scaffold', 0, 0, { r1: g1 + '.kept', r2: b1 + '.kept', r3: '' });
  const D2 = W.evaluate(sc2); eq(lvOf(D2[e2].out), 1); eq(D2[e2].out.filled.data.n, 1);
});
t('归纳阶梯：起点成立，每一级都能推下一级 → ④；起点没验证 → ①', () => {
  eq(lvOf(pr('induction', { rule: 0, upto: 20, base: true })), 4);
  eq(lvOf(pr('induction', { rule: 0, upto: 20, base: false })), 1);
});
t('不变量追踪器：变换每次都不变则 kept；加上非零数则不是不变量，不给等级', () => {
  eq(pr('invariant', { change: 0, times: 4 }).kept.data, true);
  const o = pr('invariant', { change: 3, times: 4 }); eq(o.kept.data, false); eq(lvOf(o), 0);
});
t('猜想板：只记录，等级是 0 或 ①，不推翻', () => { const o = pr('conjecture_board', { ok: true }); eq(lvOf(o), 1); eq(o.refuted.data, false); });
t('台面级证据：参数扫描得 ② 时整个台面的证据到 ②；有反例则推翻', () => {
  const sc = W.blank(); W.add(sc, 'scanner', 0, 0, { rule: 0, from: 1, to: 20 }); const r = U.Evidence.fromScene(W.evaluate(sc));
  eq(r.level, 2);
  const sc2 = W.blank(); W.add(sc2, 'counterex', 0, 0, { rule: 3, from: 1, to: 20 }); eq(U.Evidence.fromScene(W.evaluate(sc2)).level, 'refuted');
});
console.log('证明器材扩充');
t('新规则：2n+1 是质数在 1–20 里的反例是 4（2·4+1 = 9）；n²+2 的反例是 2（2²+2 = 6）', () => {
  const sc = W.blank(); const e = W.add(sc, 'counterex', 0, 0, { rule: 5, from: 1, to: 20 }); const D = W.evaluate(sc);
  eq(D[e].out.refuted.data, true); eq(D[e].out.counter.data.n, 4);
  const e2 = W.add(sc, 'counterex', 0, 0, { rule: 8, from: 1, to: 20 }); eq(W.evaluate(sc)[e2].out.counter.data.n, 2);
});
t('系统枚举器：两枚硬币的 4 种情况，正面数为 1 的有 2 种 → ③；三个骰子和为 10 有 27 种', () => {
  const sc = W.blank(); const e = W.add(sc, 'enumerator', 0, 0, { set: 1, target: 1, expected: 4 }); const D = W.evaluate(sc);
  eq(D[e].out.count.data.n, 2); eq(D[e].out.total.data.n, 4); eq(D[e].out.lv.data.n, 3);
  const sc2 = W.blank(); const e2 = W.add(sc2, 'enumerator', 0, 0, { set: 2, target: 10, expected: 216 });
  eq(W.evaluate(sc2)[e2].out.count.data.n, 27);
});
t('归纳阶梯：三条求和式子的步骤都是恒等式；起点与每一级都成立 → ④', () => {
  for (const r of [0, 1, 2]) {
    const sc = W.blank(); const e = W.add(sc, 'induction', 0, 0, { rule: r, upto: 30, base: true }); const D = W.evaluate(sc);
    eq(D[e].out.identity.data, true, '式子 ' + r + ' 的步骤应是恒等式'); eq(D[e].out.lv.data.n, 4);
  }
});
console.log('序列表达式（分式、指数式、用户规则）');
const SQ = U.Seq;
t('分式与恒等：n(n+1)/2 的步骤 S(n+1)−S(n) = n+1 对所有 n 成立', () => {
  const S = SQ.parse('n(n+1)/2'), t1 = SQ.parse('n');
  truthy(SQ.identical(SQ.sub(SQ.sub(SQ.shift(S), S), SQ.shift(t1)), []));
  eq(SQ.at(S, 10), Q(55));
});
t('指数式：2^n − 1 的求和 1+2+…+2^(n−1)：步骤恒等，n=5 时是 31', () => {
  const S = SQ.parse('2^n-1'), t1 = SQ.parse('2^(n-1)');
  truthy(SQ.identical(SQ.sub(SQ.sub(SQ.shift(S), S), SQ.shift(t1)), []), '步骤应恒等');
  eq(SQ.at(S, 5), Q(31)); eq(SQ.at(t1, 3), Q(4));
});
t('不是恒等的步骤判为不恒等：n² 与 n² + 1', () => {
  truthy(!SQ.identical(SQ.sub(SQ.parse('n^2'), SQ.parse('n^2+1')), []));
});
t('用户规则：“2n+1 是质数”在 1–20 里第一个反例是 4；“n^2 是偶数”的反例是 1', () => {
  const r1 = SQ.compileRule('2n+1 是质数'); truthy(r1(3)); truthy(!r1(4));
  const r2 = SQ.compileRule('n^2 是偶数'); truthy(!r2(1)); truthy(r2(2));
});
t('用户规则：比较两个式子，2^n > n 对 n ≥ 0 成立', () => {
  const r = SQ.compileRule('2^n > n'); truthy(r(0)); truthy(r(1)); truthy(r(10));
});
t('写错的规则给出说明', () => { truthy(/要写成/.test(String(thr(() => SQ.compileRule('随便写')))) ); truthy(/看不懂|多出/.test(String(thr(() => SQ.parse('2 & n'))))); });
function thr(f) { try { f(); return ''; } catch (e) { return e.message; } }
console.log('证明器材：自定义规则与指数式归纳');
t('反例构造器：选“自己写的规则”，写 2n+1 是质数，在 1–20 里找到反例 4', () => {
  const sc = W.blank(); const e = W.add(sc, 'counterex', 0, 0, { rule: 9, custom: '2n+1 是质数', from: 1, to: 20 });
  const o = W.evaluate(sc)[e].out; eq(o.refuted.data, true); eq(o.counter.data.n, 4);
});
t('参数扫描器：写错的自定义规则会说明原因，不算证据', () => {
  const sc = W.blank(); const e = W.add(sc, 'scanner', 0, 0, { rule: 9, custom: '随便写', from: 1, to: 5 });
  const D = W.evaluate(sc); truthy(/规则写不对/.test(D[e].sig.map((x) => x.tx).join('|')));
});
t('归纳阶梯：指数式 1+2+…+2^(n−1) = 2^n−1 的步骤是恒等式，证到 ④', () => {
  const sc = W.blank(); const e = W.add(sc, 'induction', 0, 0, { rule: 3, upto: 30, base: true }); const o = W.evaluate(sc)[e].out;
  eq(o.identity.data, true); eq(o.lv.data.n, 4);
});
console.log('规则：多变量、后算器材的安全');
t('多变量规则：x+y 是偶数，在 1–4 里反例是 x=1, y=2', () => {
  const sc = W.blank(); const e = W.add(sc, 'counterex', 0, 0, { rule: 9, custom: 'x+y 是偶数', from: 1, to: 4 });
  const o = W.evaluate(sc)[e].out; eq(o.refuted.data, true); eq(o.counter.data.n, 2);
});
t('多变量规则：x^2 > y 不成立时找到的组被说明；组数太多时说明', () => {
  const sc = W.blank(); const e = W.add(sc, 'scanner', 0, 0, { rule: 9, custom: 'x^2 > y', from: 1, to: 3 });
  truthy(W.evaluate(sc)[e].out.refuted.data, '1^2 > 3 不成立');
  const big = W.blank(); const b = W.add(big, 'scanner', 0, 0, { rule: 9, custom: 'x+y+z 是偶数', from: 1, to: 200 });
  truthy(/组数太多/.test(W.evaluate(big)[b].sig.map((x) => x.tx).join('|')));
});
t('后算器材：结论只能接后算器材；后算器材之间可以接；有记忆的器材不能接进后算器材', () => {
  const sc = W.blank(); const sf = W.add(sc, 'scaffold', 0, 0, {}); const o = W.add(sc, 'op', 0, 0, {});
  const r = W.act(sc, { t: 'link', from: sf, fromPort: 'lv', to: o, toPort: 'a' }); eq(r.ok, false); truthy(/只能接到别的后算器材上/.test(r.why), r.why);
  const pc = W.add(sc, 'proofcheck', 0, 0, { want: 1 });
  eq(W.act(sc, { t: 'link', from: sf, fromPort: 'lv', to: pc, toPort: 'lv' }).ok, true, '后算 → 后算 可以接');
  eq(W.evaluate(sc)[pc].out.ok.data, true, '空脚手架的证据等级是 1，要求 1，够');
  const coin = W.add(sc, 'coin', 0, 0, {}), pc2 = W.add(sc, 'proofcheck', 0, 0, { want: 1 });
  const rc = W.act(sc, { t: 'link', from: coin, fromPort: 'v', to: pc2, toPort: 'lv' }); eq(rc.ok, false); truthy(/有记忆/.test(rc.why), rc.why);
  eq(U.lintType(U.types.scaffold).errors, []);
  eq(U.lintType(U.types.proofcheck).errors, [], '后算器材可以有输入口，只要不是有状态的');
});
console.log('几何构造原型：辅助线、剪切、移动、翻转、粘贴');
const Gx = U.Geo, Pq = (x, y) => ({ x: Q(x), y: Q(y) });
t('构造：中点、两线交点、垂足，都是精确的有理数', () => {
  eq(U.Fig.show({ type: 'point', pts: [Gx.midpoint(Pq(1, 0), Pq(2, 3))] }), '点 (3/2, 3/2)');
  eq(U.Fig.show({ type: 'point', pts: [Gx.lineIntersect(Pq(0, 0), Pq(3, 1), Pq(0, 2), Pq(2, 0))] }), '点 (3/2, 1/2)');
  eq(U.Fig.show({ type: 'point', pts: [Gx.foot(Pq(1, 3), Pq(0, 0), Pq(4, 2))] }), '点 (2, 1)');
  eq(Gx.lineIntersect(Pq(0, 0), Pq(1, 1), Pq(0, 1), Pq(1, 2)), null);
});
t('剪切：中线把三角形剪成面积相等的两块；没穿过图形的线剪不开', () => {
  const tr = U.Fig.polygon([[0, 0], [6, 0], [2, 4]]); const r = Gx.cut(tr, Pq(0, 0), Gx.midpoint(Pq(6, 0), Pq(2, 4)));
  eq(r.pieces.length, 2); truthy(U.KINDS.real.eq(U.Fig.area(r.pieces[0]), U.Fig.area(r.pieces[1])));
  truthy(/没有穿过/.test(Gx.cut(tr, Pq(10, 10), Pq(11, 10)).why || ''), '水平线 y = 10 碰不到三角形');
});
t('剪切凹多边形：线穿过边界两次就能剪；四次时说明原型不支持', () => {
  const L = U.Fig.polygon([[0, 0], [4, 0], [4, 2], [2, 2], [2, 4], [0, 4]]);
  eq(Gx.cut(L, Pq(1, -1), Pq(1, 5)).pieces.length, 2);
  truthy(/不止两次/.test(Gx.cut(L, Pq(0, 5), Pq(5, 0)).why || ''), '直线 x + y = 5 穿过 L 形边界四次');
});
t('摆放：翻转、旋转、移动后都和原来全等', () => {
  const tr = U.Fig.polygon([[0, 0], [3, 0], [0, 1]]);
  for (const o of [{ flip: 1 }, { flip: 2 }, { turn: 1 }, { turn: 3, dx: 4, dy: -2 }, { flip: 1, turn: 2, dx: 1 }]) truthy(U.Fig.congruent(tr, Gx.place(tr, o)), JSON.stringify(o));
  eq(U.Fig.show(Gx.place(tr, { flip: 1 })), '三角形 (3, 0) (0, 0) (3, 1)');
});
t('粘贴：两块拼成一个图形，共线的点会去掉；叠在一起或没贴上会说明原因', () => {
  const a = U.Fig.polygon([[0, 0], [2, 0], [2, 2], [0, 2]]), b = U.Fig.polygon([[2, 0], [4, 0], [4, 2], [2, 2]]);
  const m = Gx.merge([a, b]); truthy(m.ok); eq(U.Fig.show(m.poly).split(' ')[0], '四边形'); eq(m.poly.pts.length, 4);
  truthy(/叠/.test(Gx.merge([a, a]).why)); truthy(/没有贴上|不止一块|一个点/.test(Gx.merge([a, U.Fig.polygon([[5, 5], [6, 5], [6, 6]])]).why));
});
t('拼合检查：平行四边形沿高剪开，移过去正好拼成长方形；没移到位要说明', () => {
  const pg = U.Fig.polygon([[0, 0], [5, 0], [7, 3], [2, 3]]), r = Gx.cut(pg, Pq(2, 3), Pq(2, 0));
  const tri = r.pieces.find((p) => p.pts.length === 3), quad = r.pieces.find((p) => p.pts.length === 4), target = U.Fig.polygon([[2, 0], [7, 0], [7, 3], [2, 3]]);
  truthy(Gx.assemble([quad, Gx.place(tri, { dx: 5 })], target).ok);
  truthy(/叠/.test(Gx.assemble([quad, Gx.place(tri, { dx: 4 })], target).why), '只移 4 格会和另一块叠在一起');
});
t('器材连线：拖动自由点（改 x、y）后，中线剪开的两块仍然面积相等（不变量）', () => {
  const p = U.problems.find((x) => x.id === 'geo-median-area'), sc = p.build();
  const role = (r) => Object.values(sc.entities).find((e) => e.role === r).id;
  const m = W.add(sc, 'gmid', 0, 0, {}); W.act(sc, { t: 'link', from: role('B'), fromPort: 'p', to: m, toPort: 'a' }); W.act(sc, { t: 'link', from: role('C'), fromPort: 'p', to: m, toPort: 'b' });
  const l = W.add(sc, 'gseg', 0, 0, {}); W.act(sc, { t: 'link', from: role('A'), fromPort: 'p', to: l, toPort: 'a' }); W.act(sc, { t: 'link', from: m, fromPort: 'p', to: l, toPort: 'b' });
  const c = W.add(sc, 'gcut', 0, 0, {}); W.act(sc, { t: 'link', from: role('图形'), fromPort: 'f', to: c, toPort: 'f' }); W.act(sc, { t: 'link', from: l, fromPort: 's', to: c, toPort: 'line' });
  for (const [x, y] of [[0, 0], [-3, 1], [1, -5], [7, 2]]) {
    W.act(sc, { t: 'set', id: role('A'), k: 'x', v: x }); W.act(sc, { t: 'set', id: role('A'), k: 'y', v: y });
    const D = W.evaluate(sc); truthy(U.KINDS.real.eq(U.Fig.area(D[c].out.a.data), U.Fig.area(D[c].out.b.data)), 'A=(' + x + ',' + y + ')');
  }
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
t('有理数不溢出：9e15 × 9e15 = 81 × 10^30，精确', () => { const x = Q.mul(Q(9e15, 1), Q(9e15, 1)); eq(x.n, 81n * 10n ** 30n); eq(x.d, 1n); });
t('任务 E：40 次交点式运算（加、乘、除混用）后仍然精确，分母超过普通数字范围，eq 成立', () => {
  let x = Q(1, 3);
  for (let k = 0; k < 40; k++) { const a = Q(k + 2, 1000003 + k * 7919), b = Q(1, 99991 + k * 104729); x = Q.div(Q.add(x, a), Q.add(Q(2), Q.mul(x, b))); }
  truthy(x.d > BigInt(Number.MAX_SAFE_INTEGER), '分母应该已经超过普通数字范围');
  // 同一条链再算一遍，结果必须完全相等；近似值和浮点计算接近
  let y = Q(1, 3), f = 1 / 3;
  for (let k = 0; k < 40; k++) { const a = Q(k + 2, 1000003 + k * 7919), b = Q(1, 99991 + k * 104729); y = Q.div(Q.add(y, a), Q.add(Q(2), Q.mul(y, b))); f = (f + (k + 2) / (1000003 + k * 7919)) / (2 + f / (99991 + k * 104729)); }
  truthy(Q.eq(x, y), '两次计算应相等'); truthy(Math.abs(Q.num(x) - f) < 1e-9, '近似值 ' + Q.num(x) + ' 与浮点 ' + f + ' 不接近');
  truthy(!Q.eq(x, Q.add(x, Q(1, 10 ** 30))), '差一点点也要分得出来');
});
t('任务 E：存档往返（U.JSON）：BigInt 写成 {"$big"}，读回仍是相等的有理数；旧台面的普通数字 {n, d} 读进来也变成 BigInt', () => {
  const big = Q(2n ** 80n + 1n, 3n * 7n); const sc = W.blank(); sc.extra = { q: big };
  const back = W.load(W.save(sc)); truthy(Q.eq(back.extra.q, big), '往返后应相等'); truthy(typeof back.extra.q.n === 'bigint', '读回应是 BigInt');
  const old = W.load(JSON.stringify({ v: 3, nid: 1, seq: {}, entities: {}, links: [], clock: { t: 0, n: 0, running: false, hz: 4, rate: 1, seed: 1 }, extra: { q: { n: 1, d: 2 } } }));
  truthy(typeof old.extra.q.n === 'bigint' && Q.eq(old.extra.q, Q(1, 2)), '旧存档的 {n, d} 应升级为 BigInt');
});
t('任务 E：Q.num(1/3) 约等于 0.3333', () => { truthy(Math.abs(Q.num(Q(1, 3)) - 0.3333) < 1e-4, String(Q.num(Q(1, 3)))); });
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
// 参考解：tests/solutions.js 加上每个年级的 tests/solutions-gN.js（内容代理分年级写，避免互相覆盖）
const SOL = Object.assign({}, require('./solutions.js'),
  ...fs.readdirSync(__dirname).filter((f) => /^solutions-[a-z0-9-]+\.js$/.test(f)).map((f) => require('./' + f)));
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
      // 工作台的步骤（D8）：list 是 [[工具, 参数]…]，每一步用内核检查，全部保持不变量后整体写进台面（scene.workbench）
      wb(host, key, list) {
        const kind = String(key).split('|')[0], api = kind === 'digits' ? U.Digits : U.DataBench;
        let st = kind === 'digits' ? api.start(JSON.parse(key.slice(7))) : api.start(); const steps = [];
        for (const [tool, args] of list) { const r = api.apply(st, tool, args); if (!r.ok) throw new Error('参考解第 ' + (steps.length + 1) + ' 步不对：' + r.why); st = r.state; steps.push(r.step); }
        const r = W.act(s, { t: 'wb', host, key, steps }); if (!r.ok) throw new Error(r.why); chk();
      },
      wbRaw(host, steps) { const r = W.act(s, { t: 'wb', host, key: U.ArithBench.keyOf(s.entities[host].props), steps }); if (!r.ok) throw new Error(r.why); chk(); },
      // 排除表（2.14b）：list 是 [[人, 格]…]，每一步用内核检查（不对就报错），全部通过后写进台面
      deduce(host, list) {
        const props = s.entities[host].props; let st = U.Deduce.start(props); const steps = [];
        for (const [i, j] of list) { const r = U.Deduce.apply(st, 'mark', { i, j }); if (!r.ok) throw new Error('参考解第 ' + (steps.length + 1) + ' 步不对：' + r.why); st = r.state; steps.push(r.step); }
        const r = W.act(s, { t: 'wb', host, key: U.Deduce.keyOf(props), steps }); if (!r.ok) throw new Error(r.why); chk();
      },
      run(n) { for (let i = 0; i < n; i++) { J2.check(p, run, s, W.tick(s)); } },
    };
    fn(h); chk();
    { const strip = (D) => Object.keys(D).map((id) => U.JSON.stringify([D[id].out, D[id].sig, D[id].props, D[id].driven])); eq(strip(W.evaluate(s, { trace: false })), strip(W.evaluate(s)), '关掉追踪结果应一致：' + p.id); }
    if (U.inexactReads.length) throw new Error('对近似值做了精确判断（请改用 W.near 带容差）：' + JSON.stringify(U.inexactReads.slice(0, 2)));
    const goal = p.goal || p.milestones.map((m) => m.id), miss = goal.filter((id) => !run.ms[id].done);
    if (miss.length) throw new Error('没通过的里程碑：' + miss.join(','));
  });
}

console.log('预测表单');
t('预测·pick：选中正确选项通过，选错不通过', () => {
  const p = { form: 'pick', options: [{ v: 'a', label: 'A' }, { v: 'b', label: 'B' }], answer: 'b' };
  truthy(U.Predict.check(p, 'b').ok, '选对应通过'); truthy(!U.Predict.check(p, 'a').ok, '选错应不通过');
});
t('预测·place：放在正确位置通过，放错不通过', () => {
  const p = { form: 'place', slots: ['甲', '乙', '丙'], answer: 1 };
  truthy(U.Predict.check(p, 1).ok, '正确位置应通过'); truthy(!U.Predict.check(p, 2).ok, '错误位置应不通过');
});
t('预测·more-less：多 / 少 / 一样 各自只对一个', () => {
  const p = { form: 'more-less', ref: '甲', answer: 'same' };
  truthy(U.Predict.check(p, 'same').ok, '一样应通过');
  truthy(!U.Predict.check(p, 'more').ok && !U.Predict.check(p, 'less').ok, '多、少都应不通过');
});
t('预测·number：按有理数精确比较（3/4 与 6/8 相等，0.75 也相等，0.7 不等）', () => {
  const p = { form: 'number', answer: '3/4' };
  truthy(U.Predict.check(p, '6/8').ok, '6/8 应等于 3/4'); truthy(U.Predict.check(p, '0.75').ok, '0.75 应等于 3/4');
  truthy(!U.Predict.check(p, '0.7').ok, '0.7 不应等于 3/4'); truthy(!U.Predict.check(p, 'abc').ok, '乱写应不通过');
});
t('预测·type：去掉首尾空格后，answer 或 accept 里的任一写法通过', () => {
  const p = { form: 'type', answer: '十二', accept: ['12', '12个'] };
  truthy(U.Predict.check(p, ' 十二 ').ok, '标准答案应通过'); truthy(U.Predict.check(p, '12个').ok, 'accept 应通过');
  truthy(!U.Predict.check(p, '13').ok, '其他答案应不通过');
});
t('报告·预测写成文字：place 写位置名，more-less 写多/少/一样，number、type 写原文', () => {
  const base = U.problemById('frac-add-unlike'), J = U.Judge;
  const mk = (predict, pred) => { const p = Object.assign({}, base, { predict }); const s = p.build(); const run = J.start(p, 'practice'); run.pred = pred; return J.report(p, run, s, W.evaluate(s)); };
  let r = mk({ form: 'place', q: '?', slots: ['甲', '乙', '丙'], answer: 1 }, 2);
  eq([r.guess, r.actual, r.match], ['丙', '乙', false], 'place');
  r = mk({ form: 'more-less', q: '?', ref: '甲', answer: 'less' }, 'more');
  eq([r.guess, r.actual, r.match], ['多', '少', false], 'more-less');
  r = mk({ form: 'number', q: '?', answer: '3/4' }, '6/8');
  eq([r.guess, r.actual, r.match], ['6/8', '3/4', true], 'number');
  r = mk({ form: 'type', q: '?', answer: '十二', accept: ['12'] }, '12');
  eq([r.guess, r.actual, r.match], ['12', '十二', true], 'type');
});
t('预测·lint：number 没写 answer 时报错', () => {
  const base = U.problems[0];
  const r = U.problemLint(Object.assign({}, base, { predict: { q: '猜一猜', form: 'number' } }));
  truthy(r.errors.some((m) => /answer/.test(m)), '应报 answer 缺失');
});

console.log('形式层（F）');
{
  const N = (n) => ({ op: 'num', n }), X = { op: 'var', name: 'x' };
  const G1 = (a) => ({ op: 'group', args: [a] });
  const add = (...args) => ({ op: 'add', args }), mul = (...args) => ({ op: 'mul', args });
  const pw = (b, e) => ({ op: 'pow', args: [b, N(e)] });
  const F = U.Form, K = U.KINDS.form;
  const snap = (f) => bigStr(f);
  t('形式：2/4 不约分，显示 2/4，值等于 1/2，不是最简分数', () => {
    const f = { op: 'frac', n: 2, d: 4 };
    eq(F.show(f), '2/4');
    truthy(Q.eq(F.value(f), Q(1, 2)), '值应为 1/2');
    truthy(!F.isNormal(f, 'reduced-fraction'), '2/4 不是最简');
    truthy(F.isNormal({ op: 'frac', n: 3, d: 4 }, 'reduced-fraction'), '3/4 是最简');
  });
  t('形式：8 + 2 + 3 与 8 + 5 等价，显示保留顺序与括号', () => {
    const f = add(N(8), N(2), N(3)), g = add(N(8), N(5));
    eq(F.show(f), '8 + 2 + 3');
    truthy(F.equivalent(f, g), '应等价');
    eq(F.show(add(N(8), G1(add(N(2), N(3))))), '8 + (2 + 3)');
    truthy(!F.equivalent(f, add(N(8), N(6))), '不等价的不能判等');
  });
  t('形式：(x+1)(x+2) 与 x² + 3x + 2 等价；前者因式分解，后者不是', () => {
    const fac = mul(G1(add(X, N(1))), G1(add(X, N(2))));
    const exp = add(add(pw(X, 2), mul(N(3), X)), N(2));
    eq(F.show(fac), '(x + 1)(x + 2)');
    eq(F.show(exp), 'x² + 3x + 2');
    truthy(F.equivalent(fac, exp), '应等价');
    truthy(F.isNormal(fac, 'factored'), '前者应是因式分解形式');
    truthy(!F.isNormal(exp, 'factored'), '后者不是因式分解形式');
    truthy(F.isNormal(exp, 'collected'), '后者已合并同类项');
    truthy(!F.isNormal(add(mul(N(3), X), mul(N(2), X)), 'collected'), '3x + 2x 没有合并');
  });
  t('形式：求值不改变形式本身', () => {
    const f = add(mul(N(3), X), mul(N(2), X));
    const before = snap(f);
    F.value(f, { x: Q(2) }); F.show(f); F.equivalent(f, N(5)); F.isNormal(f, 'collected');
    eq(snap(f), before);
    truthy(Q.eq(F.value(f, { x: Q(2) }), Q(10)), '代入 x = 2 应得 10');
  });
  t('形式：代入数值后得到有理数', () => {
    const f = mul(G1(add(X, N(1))), G1(add(X, N(2))));
    truthy(Q.eq(F.value(f, { x: Q(1, 2) }), Q(15, 4)), '(3/2)(5/2) = 15/4');
  });
  t('形式：存档往返（BigInt 超过 2^53）后值相等', () => {
    const f = add({ op: 'num', n: 2n ** 70n + 1n }, { op: 'frac', n: 5, d: 7 });
    const s = K.serialize(f), back = K.parse(s);
    truthy(F.equivalent(back, f), '往返后值应相等');
    eq(F.show(back), F.show(f));
    truthy(s.includes('"$big"'), 'BigInt 应按 U.JSON 存');
    truthy(K.eq(back, f), '结构也应相等');
  });
  t('形式：num 3 → 形式 → num 仍是 3', () => {
    const v = U.convertVal(U.val('num', Q(3)), 'form');
    truthy(v && v.kind === 'form', '应转成形式');
    eq(F.show(v.data), '3');
    const back = U.convertVal(v, 'num');
    truthy(back && Q.eq(back.data, Q(3)), '应回到 3');
  });
  t('形式：多项式 → 形式 → 多项式 不丢信息；形式 → 数', () => {
    const p = U.Poly.norm([{ c: Q(1), m: { x: 2 } }, { c: Q(3), m: { x: 1 } }, { c: Q(2), m: {} }]);
    const v = U.convertVal(U.val('poly', p), 'form');
    eq(F.show(v.data), 'x² + 3x + 2');
    truthy(U.Poly.eq(U.convertVal(v, 'poly').data, p), '回到多项式应相等');
    const nv = U.convertVal(U.val('form', { op: 'add', args: [N(8), N(5)] }), 'num');
    truthy(nv && Q.eq(nv.data, Q(13)), '8 + 5 应转成 13');
    eq(U.convertVal(U.val('form', add(X, N(1))), 'num'), null);
  });
  t('形式：除以字母不能化成多项式（返回 null，不抛错）', () => {
    const f = { op: 'div', args: [X, add(X, N(1))] };
    eq(U.KINDS.form.to.poly(f), null);
    eq(U.KINDS.form.to.num(f), null);
  });
  t('形式：位值分解（300 + 20 + 5）', () => {
    const f = add(mul(N(3), N(100)), mul(N(2), N(10)), N(5));
    truthy(F.isNormal(f, 'place-value'), '应是位值分解');
    eq(F.show(f), '3 × 100 + 2 × 10 + 5');
    truthy(!F.isNormal(add(N(3), N(2)), 'place-value'), '3 + 2 不是位值分解');
    truthy(!F.isNormal(N(350), 'place-value'), '单独的数不是和');
  });
  t('形式：显示 — 取负、乘法省略号、乘方', () => {
    eq(F.show({ op: 'neg', args: [N(3)] }), '−3');
    eq(F.show(mul(N(2), G1(add(X, N(1))))), '2(x + 1)');
    eq(F.show(mul(N(3), X)), '3x');
    eq(F.show(pw(N(2), 3)), '2³');
    eq(F.show(add(N(8), { op: 'neg', args: [N(3)] })), '8 + (−3)');
  });
  t('形式：kind 注册合格', () => eq(U.lintKind(U.KINDS.form), []));
}

console.log('可执行规则（G）');
{
  const N = (n) => ({ op: 'num', n }), X = { op: 'var', name: 'x' };
  const add = (...args) => ({ op: 'add', args }), mul = (...args) => ({ op: 'mul', args });
  const G1 = (a) => ({ op: 'group', args: [a] });
  const F = U.Form, FV = (f) => U.val('form', f), EV = (d) => U.val('eqn', d);
  const ap = U.applyRule;
  const cn = (s) => /[一-鿿]/.test(s || '');
  // 临时登记一条规则（比如故意写错的规则），用完删掉，并清掉它造成的登记检查记录
  const withRule = (id, def, fn) => {
    const n0 = U.ruleSpecErrors.length;
    U.defineRule(id, def);
    try { fn(); } finally { delete U.RULES[id]; U.ruleSpecErrors.splice(n0); }
  };
  const lin = { lhs: add(mul(N(2), X), N(3)), rhs: N(7), rel: '=' };

  t('可执行规则的登记项齐全，keeps 合法', () => eq(U.ruleSpecErrors, []));
  t('登记检查：缺 match、keeps 不合法时会报错', () => {
    const n0 = U.ruleSpecErrors.length;
    U.defineRule('test.badspec', { on: 'form', apply: () => null, keeps: 'length' });
    eq(U.ruleSpecErrors.length - n0, 2);
    delete U.RULES['test.badspec']; U.ruleSpecErrors.splice(n0);
  });
  t('七条规则都已登记', () => { for (const id of ['arith.split', 'arith.make-ten', 'arith.commute', 'arith.reduce-fraction', 'alg.move-term', 'alg.collect', 'alg.expand']) truthy(U.RULES[id] && U.RULES[id].apply && U.RULES[id].match, id); });
  t('未登记的规则：ok 为假，说明原因', () => { const r = ap('no.such', FV(N(3)), [], {}); eq(r.ok, false); truthy(cn(r.why), r.why); });

  t('拆数：8 拆成 3 + 5，值不变；num 会先转成式子', () => {
    const r = ap('arith.split', U.val('num', U.Q(8)), [], { parts: [3, 5] });
    eq(r.ok, true); eq(r.kept, true); eq(r.value.kind, 'form'); eq(F.show(r.value.data), '3 + 5');
  });
  t('拆数：部分加起来不等于原数，被拒绝并说明', () => { const r = ap('arith.split', FV(N(8)), [], { parts: [3, 4] }); eq(r.ok, false); eq(r.kept, false); truthy(cn(r.why), r.why); });
  t('凑十：8 + 5 → 8 + 2 + 3，值不变', () => { const r = ap('arith.make-ten', FV(add(N(8), N(5))), [], {}); eq(r.ok, true); eq(r.kept, true); eq(F.show(r.value.data), '8 + 2 + 3'); });
  t('凑十：2 + 3 不到 10，8 + 2 已是 10，都被拒绝并说明', () => {
    for (const f of [add(N(2), N(3)), add(N(8), N(2))]) { const r = ap('arith.make-ten', FV(f), [], {}); eq(r.ok, false); truthy(cn(r.why), r.why); }
  });
  t('交换律：3 + 5 → 5 + 3，值不变；单个数不能交换', () => {
    const r = ap('arith.commute', FV(add(N(3), N(5))), [], {}); eq(r.ok, true); eq(r.kept, true); eq(F.show(r.value.data), '5 + 3');
    const q = ap('arith.commute', FV(N(3)), [], {}); eq(q.ok, false); truthy(cn(q.why), q.why);
  });
  t('约分：2/4 → 1/2，值不变且是最简形式；1/2 已是最简，被拒绝', () => {
    const r = ap('arith.reduce-fraction', FV({ op: 'frac', n: 2, d: 4 }), [], {});
    eq(r.ok, true); eq(r.kept, true); eq(F.show(r.value.data), '1/2'); truthy(F.isNormal(r.value.data, 'reduced-fraction'));
    const q = ap('arith.reduce-fraction', FV({ op: 'frac', n: 1, d: 2 }), [], {}); eq(q.ok, false); truthy(cn(q.why), q.why);
  });
  // 竖式工作台（任务 H 第 4 步）的内核：逐列计算、拆数和凑十走规则、撤销从头重放
  t('竖式内核：47 + 38 从个位算起，个位 5 进 1，结果 85；跳过个位被拒绝', () => {
    const A = U.ArithBench, st0 = A.currentOf({}, 'x', { a: 47, b: 38, op: 0 });
    const bad = A.step(st0, 'col', { col: 1 }); truthy(bad.lastError, '跳过个位应被拒绝'); eq(bad.steps.length, 0, '步骤不变');
    const s2 = A.step(A.step(st0, 'col', { col: 0 }), 'col', { col: 1 });
    eq(s2.cols[0].digit, 5); eq(s2.cols[0].carry, 1); eq(s2.result, 85); eq(s2.steps.length, 2);
    eq(A.undo(s2, 1).result, null, '撤销到第 1 步，结果消失');
  });
  t('竖式内核：减法 52 − 27 借位得 25；乘数超过两位（23 × 123）被拒绝并说明', () => {
    const A = U.ArithBench;
    const d = A.step(A.step(A.currentOf({}, 'x', { a: 52, b: 27, op: 1 }), 'col', { col: 0 }), 'col', { col: 1 });
    eq(d.result, 25); eq(d.cols[0].carry, 1);
    truthy(A.currentOf({}, 'x', { a: 23, b: 123, op: 2 }).start.error, '乘数超过两位不做');
  });
  t('竖式内核：23 × 4 = 92，个位 12 写 2 进 1，十位 2 × 4 + 1 = 9', () => {
    const A = U.ArithBench;
    const m = A.step(A.step(A.currentOf({}, 'x', { a: 23, b: 4, op: 2 }), 'col', { col: 0 }), 'col', { col: 1 });
    eq(m.cols[0].digit, 2); eq(m.cols[0].carry, 1); eq(m.result, 92);
  });
  t('竖式内核：拆数只能在竖式开始前做；整十数、一位数不拆；凑十要两个一位数', () => {
    const A = U.ArithBench, st0 = A.currentOf({}, 'x', { a: 47, b: 38, op: 0 });
    const sp = A.step(st0, 'split', { term: 1 });
    eq(sp.lastError, null); eq(A.showState(sp), '47 + 30 + 8'); eq(sp.steps[0].rule, 'arith.split');
    truthy(A.step(A.currentOf({}, 'x', { a: 30, b: 5, op: 0 }), 'split', { term: 0 }).lastError, '整十数不拆');
    truthy(A.step(A.currentOf({}, 'x', { a: 8, b: 5, op: 0 }), 'split', { term: 0 }).lastError, '一位数不拆');
    truthy(A.step(st0, 'make-ten', {}).lastError, '47 + 38 不能凑十');
    const started = A.step(sp, 'col', { col: 0 });
    truthy(A.step(started, 'split', { term: 2 }).lastError, '竖式开始后不能再拆');
    const ten = A.step(A.currentOf({}, 'x', { a: 8, b: 5, op: 0 }), 'make-ten', {});
    eq(A.showState(ten), '8 + 2 + 3'); eq(ten.steps[0].rule, 'arith.make-ten');
  });
  t('竖式内核：步骤记在台面上；算式变了，旧步骤不用', () => {
    const A = U.ArithBench, props = { a: 47, b: 38, op: 0 };
    const st = A.step(A.step(A.currentOf({}, 'x', props), 'col', { col: 0 }), 'col', { col: 1 });
    const scene = { workbench: A.saveAction('x', props, st) };
    eq(scene.workbench.key, '47|0|38'); eq(A.stateOf(scene, 'x', props).result, 85, '按同一算式重放');
    eq(A.stateOf(scene, 'x', { a: 47, b: 39, op: 0 }), null, '换了数，旧历史不用');
    eq(A.stateOf(scene, 'other', props), null, '不是这台器材的历史不用');
  });
  t('移项：2x + 3 = 7，3 移到右边变号成 7 − 3，解仍是 x = 2', () => {
    const r = ap('alg.move-term', EV(lin), [1], {});
    eq(r.ok, true); eq(r.kept, true); eq(F.show(r.value.data.lhs), '2x'); eq(F.show(r.value.data.rhs), '7 − 3');
  });
  t('移项：位置没指明、左边只有一项、不是方程，都被拒绝并说明', () => {
    for (const r of [ap('alg.move-term', EV(lin), [], {}), ap('alg.move-term', EV({ lhs: X, rhs: N(2), rel: '=' }), [0], {}), ap('alg.move-term', FV(X), [0], {})]) {
      eq(r.ok, false); eq(r.kept, false); truthy(cn(r.why), r.why);
    }
  });
  t('移项：故意写错（不变号，右边加上 3）的规则，kept 为假', () => withRule('test.bad-move', {
    on: 'eqn', label: '错误的移项', essence: ['E4'], grade: [6, 9], keeps: 'equation',
    match: (eq, at) => (at.length === 1 && eq.lhs.op === 'add' && eq.lhs.args[at[0]] ? undefined : '位置不对'),
    apply: (eq, at) => { const L = eq.lhs, i = at[0]; const rest = L.args.filter((_, j) => j !== i); return { lhs: rest.length === 1 ? rest[0] : { op: 'add', args: rest }, rhs: add(eq.rhs, L.args[i]), rel: eq.rel }; },
  }, () => {
    const r = ap('test.bad-move', EV(lin), [1], {});
    eq(r.ok, true); eq(r.kept, false); truthy(cn(r.why), r.why);
  }));
  t('合并同类项：3x + 2x → 5x，值不变；3x + 2 不是同类项，被拒绝', () => {
    const r = ap('alg.collect', FV(add(mul(N(3), X), mul(N(2), X))), [], {});
    eq(r.ok, true); eq(r.kept, true); eq(F.show(r.value.data), '5x'); truthy(F.isNormal(r.value.data, 'collected'));
    const q = ap('alg.collect', FV(add(mul(N(3), X), N(2))), [], {}); eq(q.ok, false); eq(q.kept, false); truthy(cn(q.why), q.why);
  });
  t('展开：(x+1)(x+2) → x² + 3x + 2，值不变；3x 没有括号，被拒绝', () => {
    const r = ap('alg.expand', FV(mul(G1(add(X, N(1))), G1(add(X, N(2))))), [], {});
    eq(r.ok, true); eq(r.kept, true); eq(F.show(r.value.data), 'x² + 3x + 2'); truthy(F.isNormal(r.value.data, 'collected'));
    const q = ap('alg.expand', FV(mul(N(3), X)), [], {}); eq(q.ok, false); eq(q.kept, false); truthy(cn(q.why), q.why);
  });
  t('拆数：故意写错（3 + 5 变成 3 + 6）的规则，kept 为假', () => withRule('test.bad-split', {
    on: 'form', label: '错误的拆数', essence: [], grade: [1, 3], keeps: 'value', match: () => undefined,
    apply: () => add(N(3), N(6)),
  }, () => { const r = ap('test.bad-split', FV(N(8)), [], {}); eq(r.ok, true); eq(r.kept, false); truthy(cn(r.why), r.why); }));
  t('面积 / 全等不变量：没有 check 函数时 kept 为假并说明；有 check 且为真时保持', () => {
    withRule('test.area-nocheck', { on: 'form', label: '面积', essence: [], grade: [1, 9], keeps: 'area', match: () => undefined, apply: (f) => f }, () => {
      const r = ap('test.area-nocheck', FV(N(3)), [], {}); eq(r.kept, false); truthy(/check/.test(r.why), r.why);
    });
    withRule('test.area-check', { on: 'form', label: '面积', essence: [], grade: [1, 9], keeps: 'area', match: () => undefined, apply: (f) => f, check: () => true }, () => {
      eq(ap('test.area-check', FV(N(3)), [], {}).kept, true);
    });
  });
  t('方程规则不能用在式子上，被拒绝并说明', () => { const r = ap('alg.move-term', FV(X), [0], {}); eq(r.ok, false); truthy(cn(r.why), r.why); });
}

console.log('几何工作区（任务 H1 内核）：稳定名字、几何规则、工具动作');
// 三角形 A(2,6) B(0,0) C(8,0)，只用动作搭：自由点（带角色字母）、多边形、一个工作区
const hw = {};
hw.build = () => {
  const sc = W.blank();
  const pt = (role, x, y) => { const id = W.act(sc, { t: 'add', type: 'gpt', x: 0, y: 0, props: { x, y } }).id; sc.entities[id].role = role; return id; };
  const A = pt('A', 2, 6), B = pt('B', 0, 0), C = pt('C', 8, 0);
  const tri = W.act(sc, { t: 'add', type: 'gpoly', x: 0, y: 0, props: {} }).id;
  for (const p of [A, B, C]) truthy(W.act(sc, { t: 'link', from: p, fromPort: 'p', to: tri, toPort: 'pts' }).ok, '三角形接点');
  const ws = W.act(sc, { t: 'add', type: 'gworkspace', x: 300, y: 40, props: {} }).id;
  return { sc, A, B, C, tri, ws, pt };
};
// 线段：起点是 from（id，口 p），终点是 to（{id, port}）
hw.seg = (sc, from, to) => {
  const id = W.act(sc, { t: 'add', type: 'gseg', x: 0, y: 0, props: {} }).id;
  truthy(W.act(sc, { t: 'link', from, fromPort: 'p', to: id, toPort: 'a' }).ok, '线段接起点');
  truthy(W.act(sc, { t: 'link', from: to.id, fromPort: to.port, to: id, toPort: 'b' }).ok, '线段接终点');
  return id;
};
const areaEq = (D, id) => truthy(U.KINDS.real.eq(U.Fig.area(D[id].out.a.data), U.Fig.area(D[id].out.b.data)), '两半面积应相等');

t('稳定名字：排序后与创建顺序无关；原点用角色字母', () => {
  eq(U.Names.nameOfMidpoint('C', 'B'), 'M(BC)');
  eq(U.Names.nameOfMidpoint('B', 'C'), 'M(BC)');
  eq(U.Names.nameOfIntersection('seg(C,D)', 'seg(A,B)'), 'X(seg(A,B),seg(C,D))');
  eq(U.Names.nameOfCut('e7', 'b'), 'cut:e7:b');
  eq(U.Names.nameOfOrigin('A'), 'A');
});
t('U.Names.resolve：找不到的名字返回 missing 原因；找得到的返回对象和值', () => {
  const { sc } = hw.build();
  eq(U.Names.resolve(sc, 'Q9'), 'missing: Q9');
  truthy(U.Names.resolve(sc, 'A').value, '原点 A 应能找到');
});
t('几何规则登记为可执行规则：spec 检查无误，keeps 与 check 对应', () => {
  eq(U.ruleSpecErrors.filter((m) => /^geo\./.test(m)), []);
  eq(U.RULES['geo.cut'].keeps, 'area'); eq(U.RULES['geo.merge'].keeps, 'area');
  eq(U.RULES['geo.place'].keeps, 'congruence'); eq(U.RULES['geo.midpoint'].keeps, 'congruence');
  const tr = U.Fig.polygon([[0, 0], [6, 0], [2, 4]]);
  eq(U.GeoRules.run('geo.place', { f: tr }, { flip: 1, turn: 2, dx: 3 }).kept, true);
  const seg = { a: { type: 'point', pts: [{ x: Q(0), y: Q(0) }] }, b: { type: 'point', pts: [{ x: Q(4), y: Q(2) }] } };
  eq(U.GeoRules.run('geo.midpoint', seg, {}).kept, true, '中点两半等长');
});
t('中线平分面积（只用动作）：中点用工具“中点”，剪用工具“剪”；改顶点后两半面积仍相等', () => {
  const { sc, A, B, C, tri, ws } = hw.build();
  const m = W.act(sc, { t: 'tool', ws, tool: 'mid', picks: ['B', 'C'] }); truthy(m.ok, m.why);
  const mr = U.Names.resolve(sc, 'M(BC)'); eq(mr.value.data.type, 'point');
  hw.seg(sc, A, { id: mr.id, port: mr.port });
  eq(U.Names.resolve(sc, 'seg(A,M(BC))').ent.type, 'gseg', '中线的名字应能找回');
  const c = W.act(sc, { t: 'tool', ws, tool: 'cut', picks: ['poly(A,B,C)', 'seg(A,M(BC))'] }); truthy(c.ok, c.why);
  let D = W.evaluate(sc); areaEq(D, c.id);
  for (const [x, y] of [[-3, 6], [5, 1], [4, -2]]) {
    W.act(sc, { t: 'set', id: A, k: 'x', v: x }); W.act(sc, { t: 'set', id: A, k: 'y', v: y });
    D = W.evaluate(sc); areaEq(D, c.id);
  }
  eq(U.Names.resolve(sc, 'M(BC)').id, mr.id, '改顶点后名字不变');
  eq(W.childrenOf(sc, ws).length, 4, '中点、剪和两块（块器材）都放进了工作区');
});
t('合并与翻转：两半用工具“合并”粘回三角形（面积不变），块可以再翻转，结果有稳定名字', () => {
  const { sc, A, ws } = hw.build();
  const mr = W.act(sc, { t: 'tool', ws, tool: 'mid', picks: ['B', 'C'] }); truthy(mr.ok, mr.why);
  hw.seg(sc, A, U.Names.resolve(sc, 'M(BC)'));
  const c = W.act(sc, { t: 'tool', ws, tool: 'cut', picks: ['poly(A,B,C)', 'seg(A,M(BC))'] }); truthy(c.ok, c.why);
  const g = W.act(sc, { t: 'tool', ws, tool: 'merge', picks: ['cut:' + c.id + ':a', 'cut:' + c.id + ':b'] }); truthy(g.ok, g.why);
  let D = W.evaluate(sc);
  const merged = D[g.id].out.merged.data; eq(merged.pts.length, 3, '共线的中点应被去掉');
  truthy(U.KINDS.real.eq(U.Fig.area(merged), U.Fig.area(U.Fig.polygon([[2, 6], [0, 0], [8, 0]]))), '合并后面积等于三角形面积');
  const f = W.act(sc, { t: 'tool', ws, tool: 'flip', picks: ['cut:' + c.id + ':a'] }); truthy(f.ok, f.why);
  D = W.evaluate(sc);
  truthy(U.Fig.congruent(D[c.id].out.a.data, D[f.id].out.f.data), '翻转后的块与原来全等');
  eq(U.Names.resolve(sc, 'step:' + f.id + ':f').id, f.id, '翻转的结果有稳定名字');
});
t('剪切线改到不再穿过图形：剪的那一步说明原因，后面的步骤拿不到值（不算错值）', () => {
  const { sc, A, ws, pt } = hw.build();
  const P = pt('P', 1, -1), Q2 = pt('Q', 1, 5);
  hw.seg(sc, P, { id: Q2, port: 'p' });
  const c = W.act(sc, { t: 'tool', ws, tool: 'cut', picks: ['poly(A,B,C)', 'seg(P,Q)'] }); truthy(c.ok, c.why);
  let D = W.evaluate(sc); truthy(D[c.id].out.a && D[c.id].out.b, '线 x=1 穿过三角形，应能剪开');
  W.act(sc, { t: 'set', id: P, k: 'x', v: 9 }); W.act(sc, { t: 'set', id: Q2, k: 'x', v: 9 });
  D = W.evaluate(sc);
  truthy(D[c.id].sig.some((s) => s.lv === 'warn' && /没有穿过/.test(s.tx)), '应说明线不再穿过图形');
  eq(D[c.id].out.a, undefined, '切不开时不应输出'); eq(D[c.id].out.b, undefined);
  const f = W.act(sc, { t: 'tool', ws, tool: 'flip', picks: ['cut:' + c.id + ':a'] });
  eq(f.ok, false, '后面的步骤拿不到值，工具应拒绝'); truthy(/算不出来/.test(f.why), f.why);
  truthy(A, '原点还在');
});
t('工具动作失败：缺少选中对象、线不穿过图形、选的不是工作区，都返回 ok 为假和原因；不留下半截步骤', () => {
  const { sc, A, ws, pt } = hw.build();
  const r1 = W.act(sc, { t: 'tool', ws, tool: 'mid', picks: ['B', 'ZZ'] }); eq(r1.ok, false); eq(r1.why, 'missing: ZZ');
  const r2 = W.act(sc, { t: 'tool', ws, tool: 'mid', picks: ['B'] }); eq(r2.ok, false); truthy(/要选/.test(r2.why), r2.why);
  const P = pt('P', 9, -1), Q2 = pt('Q', 9, 5); hw.seg(sc, P, { id: Q2, port: 'p' });
  const r3 = W.act(sc, { t: 'tool', ws, tool: 'cut', picks: ['poly(A,B,C)', 'seg(P,Q)'] }); eq(r3.ok, false); truthy(/没有穿过/.test(r3.why), r3.why);
  eq(W.childrenOf(sc, ws).length, 0, '失败的工具不留下步骤');
  eq(W.act(sc, { t: 'tool', ws: A, tool: 'mid', picks: ['B', 'C'] }).ok, false, '不是工作区的器材不能用工具');
});
t('工作区的工具声明完整：每个工具的规则都登记过，并能建出步骤器材；工作区 lint 通过', () => {
  for (const tl of U.types.gworkspace.workspace.tools) {
    const r = U.RULES[tl.rule]; truthy(r && r.device && U.types[r.device], tl.id + ' 的规则不完整');
  }
  eq(U.lintType(U.types.gworkspace).errors, []);
});
t('存档往返：带工作区的台面存下再读回，步骤、名字与剪的结果都还在', () => {
  const { sc, A, ws } = hw.build();
  W.act(sc, { t: 'tool', ws, tool: 'mid', picks: ['B', 'C'] });
  hw.seg(sc, A, U.Names.resolve(sc, 'M(BC)'));
  const c = W.act(sc, { t: 'tool', ws, tool: 'cut', picks: ['poly(A,B,C)', 'seg(A,M(BC))'] }); truthy(c.ok, c.why);
  const s2 = W.load(W.save(sc));
  const D = W.evaluate(s2);
  eq(W.childrenOf(s2, ws).length, W.childrenOf(sc, ws).length);
  eq(U.Names.resolve(s2, 'M(BC)').id, U.Names.resolve(sc, 'M(BC)').id);
  areaEq(D, c.id);
});

console.log('式子工作台内核（任务 H 第 3a 步）：两边同除同乘、稳定标签、工作台');
{
  const N = (n) => ({ op: 'num', n: BigInt(n) }), X = { op: 'var', name: 'x' };
  const add = (...args) => ({ op: 'add', args }), mul = (...args) => ({ op: 'mul', args });
  const F = U.Form, FV = (f) => U.val('form', f), EV = (d) => U.val('eqn', d);
  const ap = U.applyRule, WB = U.Workbench;
  const cn = (s) => /[一-鿿]/.test(s || '');
  const linEqn = () => ({ lhs: add(mul(N(3), X), N(5)), rhs: N(20), rel: '=' });

  t('两边同除、两边同乘已登记，登记检查无错', () => { truthy(U.RULES['alg.divide'] && U.RULES['alg.multiply']); eq(U.ruleSpecErrors, []); });
  t('两边同除：2x = 4 除以 2，得到 x = 2，解不变', () => {
    const r = ap('alg.divide', EV({ lhs: mul(N(2), X), rhs: N(4), rel: '=' }), [], { by: 2 });
    eq(r.ok, true); eq(r.kept, true); eq(F.show(r.value.data.lhs), 'x'); eq(F.show(r.value.data.rhs), '2');
  });
  t('两边同除以 0：被拒绝，说明原因，kept 为假', () => {
    const r = ap('alg.divide', EV({ lhs: X, rhs: N(4), rel: '=' }), [], { by: 0 });
    eq(r.ok, false); eq(r.kept, false); truthy(cn(r.why), r.why);
  });
  t('两边同乘：x = 3 乘以 2，得到 2x = 6；乘以 0 或没有给数，都被拒绝', () => {
    const r = ap('alg.multiply', EV({ lhs: X, rhs: N(3), rel: '=' }), [], { by: 2 });
    eq(r.ok, true); eq(r.kept, true); eq(F.show(r.value.data.lhs), '2x'); eq(F.show(r.value.data.rhs), '6');
    const z = ap('alg.multiply', EV({ lhs: X, rhs: N(3), rel: '=' }), [], { by: 0 });
    eq(z.ok, false); eq(z.kept, false); truthy(cn(z.why), z.why);
    const n = ap('alg.multiply', EV({ lhs: X, rhs: N(3), rel: '=' }), [], {});
    eq(n.ok, false); truthy(cn(n.why), n.why);
  });
  t('不等式两边同除以负数：不等号反向，解集不变', () => {
    const r = ap('alg.divide', EV({ lhs: mul(N(2), X), rhs: N(4), rel: '>' }), [], { by: -2 });
    eq(r.ok, true); eq(r.kept, true); eq(r.value.data.rel, '<');
  });
  t('移项打标签：移过去的 +5 带 moved#1；没有 stepIndex 时不打标签；标签不影响相等', () => {
    const r = ap('alg.move-term', EV(linEqn()), [1], { stepIndex: 1 });
    eq(r.kept, true); eq(F.show(r.value.data.rhs), '20 − 5');
    eq(F.find(r.value.data.rhs, 'moved#1'), [1]); eq(F.tagOf(r.value.data.rhs, [1]), 'moved#1');
    eq(F.find(r.value.data.rhs, 'moved#2'), null); eq(F.find(r.value.data.rhs, 'no-such'), null);
    const plain = ap('alg.move-term', EV(linEqn()), [1], {});
    eq(F.find(plain.value.data.rhs, 'moved#1'), null);
    truthy(U.KINDS.form.eq(r.value.data.rhs, plain.value.data.rhs), '标签不应改变相等');
  });
  t('合并同类项打标签 collected#k；tagOf 对没有标签的路径返回 null', () => {
    const r = ap('alg.collect', FV(add(mul(N(3), X), mul(N(2), X))), [], { stepIndex: 2 });
    eq(r.kept, true); eq(F.tagOf(r.value.data, []), 'collected#2'); eq(F.tagOf(r.value.data, [0]), null);
    eq(F.tagOf(r.value.data, [5]), null);
  });

  t('工作台 工具列表：方程四个、式子三个，标签是中文', () => {
    eq(WB.tools(EV(linEqn())).map((x) => x.id), ['move-term', 'divide', 'multiply', 'collect']);
    eq(WB.tools(FV(add(X, N(1)))).map((x) => x.id), ['collect', 'expand', 'reduce-fraction']);
    truthy(WB.tools(EV(linEqn())).every((x) => cn(x.label)));
  });
  t('工作台 (a)：3x + 5 = 20，移项、两边同除以 3，两步，解为 x = 5', () => {
    let s = WB.create(EV(linEqn()));
    s = WB.step(s, 'move-term', [1], {});
    eq(s.lastError, null); eq(s.steps.length, 1);
    eq(F.show(s.current.data.lhs), '3x'); eq(F.value(s.current.data.rhs), U.Q(15));
    s = WB.step(s, 'divide', null, { by: 3 });
    eq(s.lastError, null); eq(s.steps.length, 2);
    eq(WB.solution(s), { solved: true, x: U.Q(5) });
    eq(WB.stepLog(s).length, 2); truthy(/^第 1 步：移项：3x \+ 5 = 20 → /.test(WB.stepLog(s)[0]), WB.stepLog(s)[0]);
    truthy(/^第 2 步：两边同除：/.test(WB.stepLog(s)[1]), WB.stepLog(s)[1]);
  });
  t('工作台 (b)：撤销到第 1 步，等于走完第 1 步后的状态', () => {
    const s1 = WB.step(WB.create(EV(linEqn())), 'move-term', [1], {});
    const s2 = WB.step(s1, 'divide', null, { by: 3 });
    eq(bigStr(WB.undo(s2, 1)), bigStr(s1)); eq(WB.undo(s2, 0).steps.length, 0);
  });
  t('工作台 (c)：两边同除以 0 被拒绝，说明原因，步骤数不变', () => {
    const s1 = WB.step(WB.create(EV(linEqn())), 'move-term', [1], {});
    const s2 = WB.step(s1, 'divide', null, { by: 0 });
    eq(s2.steps.length, 1); truthy(cn(s2.lastError), s2.lastError); eq(bigStr(s2.current), bigStr(s1.current));
  });
  t('工作台 (d)：故意写错的规则（改掉了解）不会被记入步骤', () => {
    const n0 = U.ruleSpecErrors.length;
    U.defineRule('test.bad-scale', {
      on: 'eqn', label: '错误的两边同除', essence: ['E4'], grade: [6, 9], keeps: 'equation',
      match: () => undefined,
      apply: (e) => ({ lhs: add(e.lhs, N(1)), rhs: e.rhs, rel: e.rel }),
    });
    try {
      const s = WB.stepRule(WB.create(EV(linEqn())), 'test.bad-scale', null, {});
      eq(s.steps.length, 0); eq(s.lastError, '这一步破坏了不变量，已拒绝');
    } finally { delete U.RULES['test.bad-scale']; U.ruleSpecErrors.splice(n0); }
  });
  t('工作台 (e)：从 start 重放全部步骤，得到同一个 current', () => {
    let s = WB.create(EV(linEqn()));
    s = WB.step(s, 'move-term', [1], {}); s = WB.step(s, 'divide', null, { by: 3 });
    eq(bigStr(WB.replay(s.start, s.steps).current), bigStr(s.current));
  });
  t('工作台：引用用标签；找不到标签、移项对右边的标签、不认识的工具，都说明原因且步骤不变', () => {
    const s1 = WB.step(WB.create(EV(linEqn())), 'move-term', 'moved#9', {});
    eq(s1.steps.length, 0); truthy(cn(s1.lastError), s1.lastError);
    const s2 = WB.step(WB.step(WB.create(EV(linEqn())), 'move-term', [1], {}), 'collect', 'moved#1', {});
    eq(s2.steps.length, 1); truthy(cn(s2.lastError), s2.lastError);
    const s3 = WB.step(WB.create(EV(linEqn())), 'no-such-tool', [], {});
    eq(s3.steps.length, 0); truthy(cn(s3.lastError), s3.lastError);
  });
  t('工作台（形式）：合并同类项后 solution 为 solved: false；未解的方程也是 solved: false', () => {
    const f = WB.step(WB.create(FV(add(mul(N(3), X), mul(N(2), X)))), 'collect', [], {});
    eq(F.show(f.current.data), '5x'); eq(WB.solution(f), { solved: false });
    eq(WB.solution(WB.create(EV(linEqn()))), { solved: false });
  });
  t('D5 合并同类项：减法 20 − 5 合并成 15（移项后的右边）；pick 只合并选中的几项，其余原样留下', () => {
    const sub20 = { op: 'sub', args: [N(20), N(5)] };
    const s = ap('alg.collect', FV(sub20), [], {});
    eq(s.ok, true); eq(s.kept, true); eq(F.show(s.value.data), '15');
    const f = add(mul(N(3), X), N(5), mul(N(2), X));
    const p = ap('alg.collect', FV(f), [], { pick: [0, 2] });
    eq(p.ok, true); eq(p.kept, true); eq(F.show(p.value.data), '5x + 5');
    const q = ap('alg.collect', FV(f), [], { pick: [0, 1] });
    eq(q.ok, false); eq(q.kept, false); truthy(cn(q.why), q.why);
    const bad = ap('alg.collect', FV(f), [], { pick: [0] });
    eq(bad.ok, false); truthy(cn(bad.why), bad.why);
    const neg = ap('alg.collect', FV({ op: 'sub', args: [mul(N(2), X), mul(N(5), X)] }), [], {});
    eq(neg.kept, true); eq(F.show(neg.value.data), '−3x');
    const st = WB.step(WB.step(WB.create(EV(linEqn())), 'move-term', [1], {}), 'collect', ['rhs'], { pick: [0, 1] });
    eq(st.steps.length, 2); eq(F.show(st.current.data.rhs), '15');
    eq(WB.coef(WB.create(EV({ lhs: mul(N(3), X), rhs: N(20), rel: '=' }))).n, 3n);
    eq(WB.coef(WB.create(EV(linEqn()))), null);
    eq(WB.coef(WB.create(EV({ lhs: X, rhs: N(5), rel: '=' }))), null);
  });
}

console.log('改大小（resize，§10.5.8 A1）');
t('resize：写下 e.w、e.h，存档读回一样，撤销（快照还原）后回到原来的大小', () => {
  const sc = W.blank(); const id = W.add(sc, 'num', 0, 0, { n: 1 });
  const before = W.save(sc);
  truthy(W.act(sc, { t: 'resize', id, w: 260, h: 190 }).ok, 'resize 应成功');
  eq([sc.entities[id].w, sc.entities[id].h], [260, 190]);
  const back = W.load(W.save(sc));
  eq([back.entities[id].w, back.entities[id].h], [260, 190]);
  const undone = W.load(before);
  eq(undone.entities[id].w, undefined, '撤销后不应再有 w');
});
t('resize：w、h 取整；不是正数的拒绝，场景不变', () => {
  const sc = W.blank(); const id = W.add(sc, 'num', 0, 0, { n: 1 });
  W.act(sc, { t: 'resize', id, w: 200.4, h: 150.6 });
  eq([sc.entities[id].w, sc.entities[id].h], [200, 151]);
  for (const bad of [0, -5, NaN, 'abc', undefined]) {
    const r = W.act(sc, { t: 'resize', id, w: bad, h: 100 });
    eq(r.ok, false, '非法宽度 ' + String(bad) + ' 应拒绝');
  }
  eq([sc.entities[id].w, sc.entities[id].h], [200, 151]);
});
t('resize：w、h 都是 null 时清掉，回到器材的 size()；找不到器材说明原因', () => {
  const sc = W.blank(); const id = W.add(sc, 'num', 0, 0, { n: 1 });
  W.act(sc, { t: 'resize', id, w: 300, h: 220 });
  truthy(W.act(sc, { t: 'resize', id, w: null, h: null }).ok, '清除应成功');
  eq('w' in sc.entities[id] || 'h' in sc.entities[id], false, '清除后不应留着 w、h');
  const r = W.act(sc, { t: 'resize', id: 'nope', w: 100, h: 100 });
  eq(r.ok, false); truthy(/找不到/.test(r.why), r.why);
});
t('resize：整理（tidy）用实际大小排版，列与列之间不重叠', () => {
  const sc = W.blank(); const a = W.add(sc, 'num', 0, 0, { n: 1 }); const b = W.add(sc, 'num', 0, 0, { n: 2 });
  sc.links.push({ id: 'lx', from: a, fromPort: 'v', to: b, toPort: 'a' });
  W.act(sc, { t: 'resize', id: a, w: 500, h: 300 });
  W.act(sc, { t: 'tidy' });
  truthy(sc.entities[b].x >= sc.entities[a].x + 500, '第二列应在第一列的实际宽度之后');
});

console.log('剪开以后的块（§10.5.10 内核）：块器材、移动旋转翻转放缩、撤销、改顶点');
// 同一个三角形，用线 x=1 剪开；返回两块的器材 id（按创建顺序）
const pc = {};
pc.cut = () => {
  const { sc, A, B, C, ws, pt } = hw.build();
  const P = pt('P', 1, -1), Q2 = pt('Q', 1, 5);
  hw.seg(sc, P, { id: Q2, port: 'p' });
  const c = W.act(sc, { t: 'tool', ws, tool: 'cut', picks: ['poly(A,B,C)', 'seg(P,Q)'] }); truthy(c.ok, c.why);
  const pieces = Object.values(sc.entities).filter((e) => e.type === 'gpiece').map((e) => e.id);
  return { sc, A, B, C, ws, c, pieces };
};
t('剪开：建两个块器材，名字是「块 1」「块 2」，各有颜色；原图隐藏；没有摆放器材', () => {
  const { sc, ws, c, pieces } = pc.cut();
  eq(pieces.length, 2, '应有两个块器材');
  eq(pieces.map((id) => sc.entities[id].props.name), ['块 1', '块 2']);
  eq(pieces.map((id) => sc.entities[id].name), ['块 1', '块 2']);
  truthy(pieces.every((id) => /^#[0-9a-f]{6}$/i.test(sc.entities[id].props.color)), '每块都有颜色');
  truthy(sc.entities[pieces[0]].props.color !== sc.entities[pieces[1]].props.color, '两块颜色不同');
  eq(Object.values(sc.entities).filter((e) => e.type === 'gplace').length, 0, '剪的工具不建摆放器材');
  eq(sc.entities[U.Names.resolve(sc, 'poly(A,B,C)').id].hidden, true, '被剪的三角形隐藏');
  eq(sc.links.filter((l) => l.from === c.id && sc.entities[l.to].type === 'gpiece').length, 2, '剪切步骤的 a、b 各接一块');
  eq(pieces.map((id) => W.childrenOf(sc, ws).some((e) => e.id === id)), [true, true], '两块都在工作区里');
  const D = W.evaluate(sc);
  truthy(pieces.every((id) => D[id].out.f && D[id].out.f.kind === 'fig'), '两块都有形状输出');
});
t('块的移动：移动块 2 三次，仍只有这一个块器材，每次一步；撤销最后一步回到前一个 dx', () => {
  const { sc, pieces } = pc.cut();
  const b2 = pieces[1], steps = [], snaps = [];
  for (let i = 0; i < 3; i++) {
    const before = W.save(sc);
    const r = W.act(sc, { t: 'piece', id: b2, what: 'move', value: { dx: 5, dy: 0 } }); truthy(r.ok, r.why);
    snaps.push(before); steps.push(r.step);
  }
  eq(Object.values(sc.entities).filter((e) => e.type === 'gpiece').length, 2, '仍只有两个块器材');
  eq(steps.length, 3, '记了三步');
  eq(sc.entities[b2].props.dx, 15);
  const back = W.load(snaps.pop());
  eq(back.entities[b2].props.dx, 10, '撤销最后一步，回到前一个 dx');
});
console.log('块的分数平移（分数吸附，存档 v6）');
t('有理数属性：整数存普通数字，分数存 "n/d" 字符串；范围和非法写法照常检查；控件是文本框', () => {
  const P = { type: 'rat', label: '向右移', default: 0, min: -200, max: 200 };
  eq(U.coerceProp(P, 3), { ok: true, v: 3 });
  eq(U.coerceProp(P, '1/2'), { ok: true, v: '1/2' });
  eq(U.coerceProp(P, '4/2'), { ok: true, v: 2 }, '约分后是整数，存普通数字');
  eq(U.coerceProp(P, '-3/4'), { ok: true, v: '-3/4' });
  eq(U.coerceProp(P, Q(3, 2)), { ok: true, v: '3/2' }, 'U.Q 数也接受');
  eq(U.coerceProp(P, 0.25), { ok: true, v: '1/4' }, '小数 0.25 精确成 1/4');
  truthy(!U.coerceProp(P, 'abc').ok, '不是有理数要拒绝');
  truthy(!U.coerceProp(P, 201).ok && !U.coerceProp(P, '-201/1').ok, '范围外拒绝');
  eq(Q.store(Q(4, 2)), 2); eq(Q.store(Q(-1, 2)), '-1/2'); eq(Q.store(Q(0)), 0);
  eq(U.controlFor(P), 'text', '有理数属性用文本框（精确写法）');
  eq(U.types.gpiece.props.dx.type, 'rat', '块的 dx、dy 是有理数属性');
});
t('块的分数平移：移 1/2 再移 1/2 得整数 1；再移 −3/2、上移 1/4，顶点精确平移', () => {
  const { sc, pieces } = pc.cut();
  const b = pieces[0], base = W.evaluate(sc)[b].out.f.data.pts;
  const mv = (v) => { const r = W.act(sc, { t: 'piece', id: b, what: 'move', value: v }); truthy(r.ok, r.why); return r; };
  mv({ dx: '1/2', dy: 0 });
  eq(sc.entities[b].props.dx, '1/2', '第一次移 1/2，存成分数');
  mv({ dx: '1/2', dy: 0 });
  eq(sc.entities[b].props.dx, 1, '两个 1/2 加起来是整数 1，存成数字');
  mv({ dx: '-3/2', dy: '1/4' });
  eq(sc.entities[b].props.dx, '-1/2', '加上 −3/2 得 −1/2');
  eq(sc.entities[b].props.dy, '1/4', '向上移 1/4');
  const got = W.evaluate(sc)[b].out.f.data.pts.map((p) => Q.show(p.x) + ',' + Q.show(p.y)).sort();
  const want = base.map((p) => Q.show(Q.add(p.x, Q(-1, 2))) + ',' + Q.show(Q.add(p.y, Q(1, 4)))).sort();
  eq(got, want, '每个顶点精确地平移 (−1/2, 1/4)');
  truthy(!W.act(sc, { t: 'piece', id: b, what: 'move', value: { dx: 'x' } }).ok, '平移量不是有理数，拒绝');
  sc.entities[b].props.locked = true;
  truthy(!W.act(sc, { t: 'piece', id: b, what: 'move', value: { dx: 1 } }).ok, '锁住的块不能动');
});
t('摆放：平移量可以是分数（精确）；整数平移的结果不变', () => {
  const tr = U.Fig.polygon([[0, 0], [2, 0], [0, 2]]);
  const pts = (f) => f.pts.map((p) => Q.show(p.x) + ',' + Q.show(p.y));
  eq(pts(Gx.place(tr, { dx: '1/2', dy: '-1/4' })), ['1/2,-1/4', '5/2,-1/4', '1/2,7/4']);
  eq(pts(Gx.place(tr, { dx: 3 })), ['3,0', '5,0', '3,2']);
});
t('v6 迁移：v5 台面的块平移，整数保持数字，其余写法统一成规范形式；v6 再读回来不变', () => {
  const clock = { t: 0, n: 0, running: false, hz: 4, rate: 1, seed: 1 };
  const blk = (id, dx, dy) => ({ id, type: 'gpiece', name: id, x: 0, y: 0, parent: null, slot: null, props: { dx, dy, turn: 0, flip: 0, scale: '1', name: id, color: '#f6c177', locked: false } });
  const old = { v: 5, nid: 4, seq: {}, clock, links: [], entities: {
    b1: blk('b1', 3, 0),
    b2: blk('b2', { n: '1', d: '2' }, 0),
    b3: blk('b3', 0.75, '3/4'),
  } };
  const s = W.load(JSON.stringify(old));
  eq(s.v, W.CURRENT_V, '升到当前版本');
  eq([s.entities.b1.props.dx, s.entities.b1.props.dy], [3, 0], '整数平移不变（仍是普通数字）');
  eq([s.entities.b2.props.dx, s.entities.b2.props.dy], ['1/2', 0], '{n, d} 写法统一成 "1/2"');
  eq([s.entities.b3.props.dx, s.entities.b3.props.dy], ['3/4', '3/4'], '非整数的数精确成 3/4，字符串不变');
  const again = W.load(W.save(s));
  eq(again.entities.b3.props.dx, '3/4', '存了再读，分数还在');
  eq(W.save(again), W.save(s), 'v6 台面再迁移不变（幂等）');
  W.evaluate(s);
});
t('块的旋转：块 1 转 90°，输出顶点等于原顶点绕左下角逆时针转 90° 的结果', () => {
  const { sc, pieces } = pc.cut();
  const p1 = pieces[0];
  const before = W.evaluate(sc)[p1].out.f.data.pts;
  const xs = before.map((p) => p.x), ys = before.map((p) => p.y);
  const x0 = xs.reduce((m, q) => (Q.cmp(q, m) < 0 ? q : m)), y0 = ys.reduce((m, q) => (Q.cmp(q, m) < 0 ? q : m));
  const expect = before.map((p) => ({ x: Q.sub(x0, Q.sub(p.y, y0)), y: Q.add(y0, Q.sub(p.x, x0)) })).map((p) => Q.show(p.x) + ',' + Q.show(p.y)).sort();
  truthy(W.act(sc, { t: 'piece', id: p1, what: 'turn', value: 1 }).ok, '转一次');
  eq(sc.entities[p1].props.turn, 1);
  const after = W.evaluate(sc)[p1].out.f.data.pts.map((p) => Q.show(p.x) + ',' + Q.show(p.y)).sort();
  eq(after, expect, '旋转后的顶点');
  truthy(W.act(sc, { t: 'piece', id: p1, what: 'turn', value: 3 }).ok, '再转三次回到 0');
  eq(sc.entities[p1].props.turn, 0, '转满一圈（mod 360）');
});
t('块的翻转与放缩：翻转两次回到原样；放缩 1/2 后面积是原来的四分之一；锁住的块不能动', () => {
  const { sc, pieces } = pc.cut();
  const b1 = pieces[0];
  const a2 = (id) => Q.abs(U.Fig.area2(W.evaluate(sc)[id].out.f.data));
  const area0 = a2(b1);
  W.act(sc, { t: 'piece', id: b1, what: 'flip', value: 1 });
  eq(sc.entities[b1].props.flip, 1); W.act(sc, { t: 'piece', id: b1, what: 'flip', value: 1 }); eq(sc.entities[b1].props.flip, 0, '再翻一次翻回去');
  W.act(sc, { t: 'piece', id: b1, what: 'scale', value: '1/2' });
  eq(sc.entities[b1].props.scale, '1/2');
  eq(Q.eq(Q.mul(a2(b1), Q(4)), area0), true, '面积变成四分之一');
  sc.entities[b1].props.locked = true;
  const r = W.act(sc, { t: 'piece', id: b1, what: 'move', value: { dx: 1, dy: 0 } });
  eq(r.ok, false); truthy(/锁住/.test(r.why), r.why);
});
t('改原三角形的顶点：两块形状跟着变，位置和朝向（dx/dy/turn）保持不变', () => {
  const { sc, A, pieces } = pc.cut();
  const p1 = pieces[0];
  W.act(sc, { t: 'piece', id: p1, what: 'move', value: { dx: 3, dy: 2 } });
  W.act(sc, { t: 'piece', id: p1, what: 'turn', value: 1 });
  const before = W.evaluate(sc)[p1].out.f.data.pts.map((p) => Q.show(p.x) + ',' + Q.show(p.y)).join(' ');
  W.act(sc, { t: 'set', id: A, k: 'x', v: -3 }); W.act(sc, { t: 'set', id: A, k: 'y', v: 6 });
  const D = W.evaluate(sc);
  eq([sc.entities[p1].props.dx, sc.entities[p1].props.dy, sc.entities[p1].props.turn], [3, 2, 1], '属性不变');
  truthy(D[p1].out.f && D[p1].out.f.data.pts.map((p) => Q.show(p.x) + ',' + Q.show(p.y)).join(' ') !== before, '形状变了');
  eq(Object.values(sc.entities).filter((e) => e.type === 'gpiece').length, 2, '块仍是两个');
});

console.log('合并用移动后的块、再剪一块、对齐到目标（几何工作区续）');
// 三角形剪成两块（线 x=1），返回工作区、剪切步骤与点的构造函数
const cutTri = () => {
  const { sc, A, ws, pt } = hw.build();
  const P = pt('P', 1, -1), Q2 = pt('Q', 1, 5); hw.seg(sc, P, { id: Q2, port: 'p' });
  const c = W.act(sc, { t: 'tool', ws, tool: 'cut', picks: ['poly(A,B,C)', 'seg(P,Q)'] }); truthy(c.ok, c.why);
  return { sc, A, ws, c, pt };
};
t('合并用块移动后的形状：移动块 2 后两块不再贴上，合并被拒；两块都移 3 格后，合并出的顶点是原三角形平移 3 格', () => {
  const { sc, ws, c } = cutTri();
  const picks = ['cut:' + c.id + ':a', 'cut:' + c.id + ':b'];
  const m0 = W.act(sc, { t: 'tool', ws, tool: 'merge', picks }); truthy(m0.ok, '不动时两块能合回去：' + m0.why);
  const [b1, b2] = Object.values(sc.entities).filter((e) => e.type === 'gpiece').map((e) => e.id);
  W.act(sc, { t: 'piece', id: b2, what: 'move', value: { dx: 3, dy: 0 } });
  const m1 = W.act(sc, { t: 'tool', ws, tool: 'merge', picks }); eq(m1.ok, false, '只动块 2，两块不再贴上'); truthy(/没有贴上/.test(m1.why), m1.why);
  W.act(sc, { t: 'piece', id: b1, what: 'move', value: { dx: 3, dy: 0 } });
  const m2 = W.act(sc, { t: 'tool', ws, tool: 'merge', picks }); truthy(m2.ok, m2.why);
  const got = W.evaluate(sc)[m2.id].out.merged.data;
  truthy(U.Fig.eq(got, U.Fig.polygon([[5, 6], [3, 0], [11, 0]])), '合并的顶点应是 (5,6)(3,0)(11,0)：' + U.Fig.show(got));
});
t('再剪一块：剪块 2 得到块 3、块 4（同一工作区），块 2 隐藏但留在历史里，旧的剪开步骤还在；撤销回到剪之前', () => {
  const { sc, ws, c, pt } = cutTri();
  const R = pt('R', 5, -1), S = pt('S', 5, 5); hw.seg(sc, R, { id: S, port: 'p' });
  const b2 = U.Names.resolve(sc, 'cut:' + c.id + ':b').id;
  eq(sc.entities[b2].type, 'gpiece', '块 2 是块器材');
  const before = W.save(sc);
  const r = W.act(sc, { t: 'tool', ws, tool: 'cut', picks: ['cut:' + c.id + ':b', 'seg(R,S)'] }); truthy(r.ok, r.why);
  eq(r.pieces.map((id) => sc.entities[id].props.name), ['块 3', '块 4'], '新块编号接着来');
  eq(r.pieces.map((id) => sc.entities[id].name), ['块 3', '块 4']);
  eq(sc.entities[b2].hidden, true, '块 2 隐藏');
  truthy(sc.entities[c.id], '旧的剪开步骤还在');
  eq(r.pieces.map((id) => W.childrenOf(sc, ws).some((e) => e.id === id)), [true, true], '新块都在同一个工作区');
  eq(Object.values(sc.entities).filter((e) => e.type === 'gpiece').length, 4, '一共四块（含隐藏的块 2）');
  const r2 = W.act(sc, { t: 'tool', ws, tool: 'cut', picks: ['cut:' + c.id + ':b', 'seg(R,S)'] });
  eq(r2.ok, false, '隐藏的块不能再剪'); truthy(/剪开过/.test(r2.why), r2.why);
  const back = W.load(before);
  eq(back.entities[b2].hidden, undefined, '撤销后块 2 回来');
  eq(Object.values(back.entities).filter((e) => e.type === 'gpiece').length, 2, '撤销后只有两块');
  eq(W.childrenOf(back, ws).length, W.childrenOf(W.load(before), ws).length);
});
t('对齐到目标（几何工作区续）：平行四边形沿高剪开，三角形向右移底边 AB 那么长，「对齐到目标」为真；不移或移少了为假', () => {
  const p = U.problems.find((x) => x.id === 'geo-pgram-cut'), sc = p.build();
  const ws = Object.values(sc.entities).find((e) => e.type === 'gworkspace').id;
  const role = (r) => Object.values(sc.entities).find((e) => e.role === r).id;
  const run = (tool, picks) => W.act(sc, { t: 'tool', ws, tool, picks });
  const dx = sc.entities[role('B')].props.x - sc.entities[role('A')].props.x;
  eq(dx, 5, '底边 AB 长 5，所以三角形要向右移 5');
  truthy(run('seg', ['A', 'B']).ok); truthy(run('perp', ['D', 'seg(A,B)']).ok);
  const c = run('cut', ['poly(A,B,C,D)', 'perp(D,seg(A,B))']); truthy(c.ok, c.why);
  const pieces = Object.values(sc.entities).filter((e) => e.type === 'gpiece').map((e) => e.id);
  const names = U.Names.list(sc), nameOf = (id) => names.find((n) => n.id === id && n.port === 'f').name;
  const D0 = W.evaluate(sc), tri = pieces.find((id) => D0[id].out.f.data.pts.length === 3), quad = pieces.find((id) => id !== tri);
  const fit0 = run('fit', ['目标长方形', nameOf(tri), nameOf(quad)]); truthy(fit0.ok, fit0.why);
  eq(W.evaluate(sc)[fit0.id].out.ok.data, false, '没移，不算拼对');
  W.act(sc, { t: 'piece', id: tri, what: 'move', value: { dx: 4, dy: 0 } });
  const fit1 = run('fit', ['目标长方形', nameOf(tri), nameOf(quad)]); truthy(fit1.ok, fit1.why);
  eq(W.evaluate(sc)[fit1.id].out.ok.data, false, '只移 4 格，还没拼对');
  W.act(sc, { t: 'piece', id: tri, what: 'move', value: { dx: 1, dy: 0 } });
  eq(sc.entities[tri].props.dx, dx, '三角形的 dx 正好是 5');
  const fit2 = run('fit', ['目标长方形', nameOf(tri), nameOf(quad)]); truthy(fit2.ok, fit2.why);
  eq(W.evaluate(sc)[fit2.id].out.ok.data, true, '移 5 格后对齐到目标为真');
  eq(U.RULES['geo.fit'].device, 'gasm', '对齐到目标建的是拼合检查器材');
  truthy(U.Fig.eq(W.evaluate(sc)[fit2.id].out.merged.data, U.Fig.polygon([[2, 0], [7, 0], [7, 3], [2, 3]])), '粘成的就是目标长方形');
});

console.log('数据形式的条件：构造、形式、步骤（任务 I）');
t('构造查询：台面上作出 BC 的中点才算；没作、或接的不是 B 和 C，都不算', () => {
  const pm = U.problems.find((x) => x.id === 'geo-median-area');
  const cond = U.Judge.compile({ built: { rule: 'geo.midpoint', of: ['B', 'C'] } });
  const scene = (ins) => {
    const sc = pm.build(), role = (r) => Object.values(sc.entities).find((e) => e.role === r).id;
    if (ins) {
      const m = W.add(sc, 'gmid', 0, 0, {});
      truthy(W.act(sc, { t: 'link', from: role(ins[0]), fromPort: 'p', to: m, toPort: 'a' }).ok, '连 a');
      truthy(W.act(sc, { t: 'link', from: role(ins[1]), fromPort: 'p', to: m, toPort: 'b' }).ok, '连 b');
    }
    return sc;
  };
  const holds = (sc) => cond(U.Judge.makeW(sc, W.evaluate(sc), {}));
  eq(holds(scene(null)), false, '没有中点器材');
  eq(holds(scene(['A', 'C'])), false, '接的是 A 和 C');
  eq(holds(scene(['B', 'C'])), true, '接的是 B 和 C');
  eq(holds(scene(['C', 'B'])), true, '两个输入口对调也算');
  truthy(/还没有作出/.test(U.Judge.unmetWhy({ built: { rule: 'geo.midpoint', of: ['B', 'C'] } }, scene(null), W.evaluate(scene(null)))), '未满足时给中文原因');
});
t('形式查询：结果是因式分解形式就过，展开的不过；没有这个角色也不过', () => {
  const N = (n) => ({ op: 'num', n }), X = { op: 'var', name: 'x' };
  const G1 = (a) => ({ op: 'group', args: [a] });
  const add = (...args) => ({ op: 'add', args }), mul = (...args) => ({ op: 'mul', args });
  const pw = (b, e) => ({ op: 'pow', args: [b, N(e)] });
  const fac = mul(G1(add(X, N(1))), G1(add(X, N(2))));
  const exp = add(add(pw(X, 2), mul(N(3), X)), N(2));
  const sc = W.blank(); const ent = W.add(sc, 'algebra', 0, 0, { text: 'x + 1' }); sc.entities[ent].role = '结果';
  const cond = U.Judge.compile({ form: { role: '结果', is: 'factored' } });
  const holds = (f) => cond(U.Judge.makeW(sc, { [ent]: { out: { p: U.val('form', f) } } }, {}));
  eq(holds(fac), true, '(x+1)(x+2) 是因式分解形式');
  eq(holds(exp), false, 'x²+3x+2 是展开形式');
  const sc2 = W.blank(); W.add(sc2, 'algebra', 0, 0, { text: 'x' });
  eq(U.Judge.compile({ form: { role: '结果', is: 'factored' } })(U.Judge.makeW(sc2, W.evaluate(sc2), {})), false, '台面上没有“结果”角色');
  truthy(/因式分解/.test(U.Judge.unmetWhy({ form: { role: '结果', is: 'factored' } }, sc, { [ent]: { out: { p: U.val('form', exp) } } })), '未满足时给中文原因');
});
t('步骤查询：用过规则且每步都保持不变量才算；场景里没有步骤记录时说明原因', () => {
  const sc = W.blank(), cond = (c) => U.Judge.compile(c);
  const want = { steps: { used: 'alg.factor', allKept: true } };
  const D = W.evaluate(sc);
  eq(cond(want)(U.Judge.makeW(sc, D, {})), false, '没有步骤记录');
  truthy(/工作台/.test(U.Judge.unmetWhy(want, sc, D)), '原因应指出没有工作台记录');
  sc.workbench = { steps: [{ rule: 'alg.collect', kept: true }] };
  eq(cond(want)(U.Judge.makeW(sc, D, {})), false, '没用过 alg.factor');
  sc.workbench = { steps: [{ rule: 'alg.factor', kept: true }, { rule: 'alg.collect', kept: false }] };
  eq(cond(want)(U.Judge.makeW(sc, D, {})), false, '有一步没保持不变量');
  eq(cond({ steps: { used: 'alg.factor' } })(U.Judge.makeW(sc, D, {})), true, '不要求 allKept 时只看用没用过');
  sc.workbench = { steps: [{ rule: 'alg.factor', kept: true }] };
  eq(cond(want)(U.Judge.makeW(sc, D, {})), true, '用过且每步都保持');
});
t('几何示例题的参考做法能过里程碑：中线剪开（mid 数据化，cut 仍是函数）；沿高剪开、移过去拼成长方形', () => {
  // 中线题：B、C 的中点，连 A 到中点，沿线剪开
  const pm = U.problems.find((x) => x.id === 'geo-median-area'), sm = pm.build(), J = U.Judge;
  const role = (sc, r) => Object.values(sc.entities).find((e) => e.role === r).id;
  const run1 = J.start(pm, 'practice'); J.check(pm, run1, sm, W.evaluate(sm)); run1.armed = true;
  const step = (p, sc, run, fn) => { fn(); run.ops++; return J.check(p, run, sc, W.evaluate(sc)); };
  const m = W.add(sm, 'gmid', 0, 0, {});
  step(pm, sm, run1, () => { W.act(sm, { t: 'link', from: role(sm, 'B'), fromPort: 'p', to: m, toPort: 'a' }); W.act(sm, { t: 'link', from: role(sm, 'C'), fromPort: 'p', to: m, toPort: 'b' }); });
  eq(run1.ms.mid.done, true, 'mid 数据条件应满足');
  const l = W.add(sm, 'gseg', 0, 0, {}), c = W.add(sm, 'gcut', 0, 0, {});
  step(pm, sm, run1, () => { W.act(sm, { t: 'link', from: role(sm, 'A'), fromPort: 'p', to: l, toPort: 'a' }); W.act(sm, { t: 'link', from: m, fromPort: 'p', to: l, toPort: 'b' }); W.act(sm, { t: 'link', from: role(sm, '图形'), fromPort: 'f', to: c, toPort: 'f' }); W.act(sm, { t: 'link', from: l, fromPort: 's', to: c, toPort: 'line' }); });
  eq(run1.ms.cut.done, true, '中线剪开，两块面积相等');
  eq(pm.milestones.map((x) => x.why_code || null).filter(Boolean), ['要比较剪刀两个输出块的面积'], '中线题只剩 cut 用函数（带 why_code）');
  // 平行四边形题：从 D 作 AB 的高，沿高剪开，移过去拼成长方形
  const pp = U.problems.find((x) => x.id === 'geo-pgram-cut'), sp = pp.build();
  const run2 = J.start(pp, 'practice'); J.check(pp, run2, sp, W.evaluate(sp)); run2.armed = true;
  const sg = W.add(sp, 'gseg', 0, 0, {}), ft = W.add(sp, 'gfoot', 0, 0, {}), cu = W.add(sp, 'gcut', 0, 0, {}), pl = W.add(sp, 'gplace', 0, 0, { dx: 5 }), ga = W.add(sp, 'gasm', 0, 0, {});
  const fq = Object.values(sp.entities).find((e) => e.type === 'fquad');
  step(pp, sp, run2, () => { W.act(sp, { t: 'link', from: role(sp, 'A'), fromPort: 'p', to: sg, toPort: 'a' }); W.act(sp, { t: 'link', from: role(sp, 'B'), fromPort: 'p', to: sg, toPort: 'b' }); W.act(sp, { t: 'link', from: role(sp, 'D'), fromPort: 'p', to: ft, toPort: 'p' }); W.act(sp, { t: 'link', from: sg, fromPort: 's', to: ft, toPort: 's' }); });
  eq(run2.ms.height.done, true, '从 D 作 AB 的垂线');
  step(pp, sp, run2, () => { W.act(sp, { t: 'link', from: role(sp, '图形'), fromPort: 'f', to: cu, toPort: 'f' }); W.act(sp, { t: 'link', from: ft, fromPort: 'h', to: cu, toPort: 'line' }); });
  eq(run2.ms.cut.done, true, '沿高剪开');
  const D2 = W.evaluate(sp), pieces = [D2[cu].out.a.data, D2[cu].out.b.data];
  const triPort = pieces[0].pts.length === 3 ? 'a' : 'b', quadPort = triPort === 'a' ? 'b' : 'a';
  step(pp, sp, run2, () => {
    W.act(sp, { t: 'link', from: cu, fromPort: triPort, to: pl, toPort: 'f' });
    W.act(sp, { t: 'link', from: cu, fromPort: quadPort, to: ga, toPort: 'pieces' });
    W.act(sp, { t: 'link', from: pl, fromPort: 'f', to: ga, toPort: 'pieces' });
    W.act(sp, { t: 'link', from: fq.id, fromPort: 'f', to: ga, toPort: 'target' });
  });
  eq(run2.ms.fit.done, true, '移过去正好拼成长方形');
  eq(pp.milestones.filter((x) => x.why_code).map((x) => x.id), ['cut', 'fit'], '平行四边形题只剩 cut、fit 用函数');
});
t('lint：认数据形式的新条件；拒绝未知字段、不认识的构造、错的形式名', () => {
  const one = (when, traps) => ({ id: 'q', title: 't', milestones: [{ id: 'm', score: 1, when }], traps: traps || [] });
  for (const when of [{ built: { rule: 'geo.midpoint', of: ['B', 'C'] } }, { form: { role: '结果', is: 'factored' } }, { steps: { used: 'alg.factor', allKept: true } }]) {
    const r = U.problemLint(one(when)); eq(r.errors, [], JSON.stringify(when)); eq(r.fnCount, 0);
  }
  truthy(U.problemLint(one({ built: { rule: 'geo.midpoint', of: ['B', 'C'], foo: 1 } })).errors.some((m) => /未知字段“foo”/.test(m)), 'built 的未知字段');
  truthy(U.problemLint(one({ form: { role: '结果', is: 'factored', x: 2 } })).errors.some((m) => /未知字段“x”/.test(m)), 'form 的未知字段');
  truthy(U.problemLint(one({ steps: { used: 'alg.factor', extra: true } })).errors.some((m) => /未知字段“extra”/.test(m)), 'steps 的未知字段');
  truthy(U.problemLint(one({ built: { rule: 'geo.nope', of: ['B', 'C'] } })).errors.some((m) => /built.rule/.test(m)), '不认识的构造');
  truthy(U.problemLint(one({ form: { role: '结果', is: 'pretty' } })).errors.some((m) => /form.is/.test(m)), '不认识的形式');
  const tr = U.problemLint(one({ type: 'num', port: 'v', value: '1' }, [{ id: 't1', wrong: '错', when: { built: { rule: 'geo.midpoint', of: ['B', 'C'], bad: 1 } } }]));
  truthy(tr.errors.some((m) => /未知字段“bad”/.test(m)), '陷阱里也要查');
  eq(U.problemLint(one({ type: 'num', port: 'v', value: '1' }, [{ id: 't2', wrong: '错', when: { form: { role: '结果', is: 'factored' } } }])).errors, [], '陷阱里可以用形式查询');
});

console.log('常见图形');
t('常见图形：每个模板被识别成自己的名字（精确判断）', () => {
  const want = { fscalene: '锐角三角形', fquad4: '一般四边形', frtri: '直角三角形', fisotri: '等腰三角形', frect: '长方形', fsquare: '正方形', fpgram: '平行四边形', frhomb: '菱形', ftrap: '梯形', fisotrap: '等腰梯形', frtrap: '直角梯形', fkite: '筝形' };
  for (const sh of U.Shapes.LIST) eq(U.Shapes.classify(U.Fig.polygon(sh.pts)).name, want[sh.id], sh.id);
  eq(U.Shapes.LIST.length, 12, '共 12 种');
});
t('常见图形：识别边界——拉歪一个顶点就不再是原来的图形', () => {
  const F = U.Fig, c = (pts) => U.Shapes.classify(F.polygon(pts)).name;
  eq(c([[0, 0], [6, 0], [5, 3], [3, 3]]), '梯形', '上底变短仍是梯形');
  eq(c([[0, 0], [6, 0], [5, 3], [2, 4]]), '一般四边形', '没有平行边');
  eq(c([[0, 0], [4, 0], [1, 1], [0, 4]]), '四边形（凹的或扭的）', '凹四边形');
  eq(c([[0, 0], [3, 0], [1, 2]]), '锐角三角形'); eq(c([[0, 0], [4, 0], [5, 1]]), '钝角三角形'); eq(c([[0, 0], [4, 0], [2, 2]]), '等腰直角三角形');
});
t('常见图形：描述给出精确的边长、面积、周长', () => {
  const d = U.Shapes.describe(U.Fig.polygon([[0, 0], [4, 0], [0, 3]]));
  eq(d.area, '6'); eq(d.sides, ['4', '5', '3'], '边长 4、5、3'); eq(d.perim, '12', '3-4-5 三角形周长 12');
  const t2 = U.Shapes.describe(U.Fig.polygon([[0, 0], [6, 0], [5, 3], [2, 3]]));
  eq(t2.area, '27/2', '梯形面积 (3+6)×3÷2 = 27/2');
});
t('常见图形：器材放进工作区变成自由点和多边形，顶点可改，识别跟着变', () => {
  const sc = W.blank(), ws = W.add(sc, 'gworkspace', 0, 0, {}), sh = W.add(sc, 'ftrap', 0, 0, {});
  const r = W.act(sc, { t: 'wsdrop', id: sh, ws, x: 0, y: 0 }); truthy(r.ok, r.why);
  eq(sc.entities[sh], undefined, '器材本身删掉了');
  const pts = Object.values(sc.entities).filter((e) => e.type === 'gpt'), poly = Object.values(sc.entities).find((e) => e.type === 'gpoly');
  eq(pts.length, 4, '四个自由点'); truthy(pts.every((p) => p.parent === ws) && poly.parent === ws, '都在工作区里');
  eq(pts.map((p) => p.props.mark), ['A', 'B', 'C', 'D'], '顶点按字母命名');
  let D = W.evaluate(sc); eq(U.Shapes.classify(D[poly.id].out.f.data).name, '梯形');
  W.act(sc, { t: 'set', id: pts[2].id, k: 'y', v: pts[2].props.y + 1 }); W.act(sc, { t: 'set', id: pts[3].id, k: 'y', v: pts[3].props.y - 1 });
  D = W.evaluate(sc); eq(U.Shapes.classify(D[poly.id].out.f.data).name, '一般四边形', '拖歪两个顶点，不再有平行边');
});
t('常见图形：落点在边缘时整体挪回 ±10 里，坐标仍是整数', () => {
  const sc = W.blank(), ws = W.add(sc, 'gworkspace', 0, 0, {}), sh = W.add(sc, 'frhomb', 0, 0, {});
  truthy(W.act(sc, { t: 'wsdrop', id: sh, ws, x: 40, y: -40 }).ok);
  for (const p of Object.values(sc.entities).filter((e) => e.type === 'gpt')) truthy(Math.abs(p.props.x) <= 10 && Math.abs(p.props.y) <= 10, '在范围内');
});
t('常见图形：放在台面上是普通图形器材，放大 2 倍面积是 4 倍', () => {
  const sc = W.blank(), a = W.add(sc, 'ftrap', 0, 0, { s: 2 }), b = W.add(sc, 'ftrap', 0, 0, {}), D = W.evaluate(sc);
  eq(U.Q.mul(D[b].out.area.data, U.Q(4)), D[a].out.area.data);
});

// ---- 任务 I（next-steps.md §10.6）：判分看路径和形式 ----
const FXI = U.Form, PXI = U.Poly;
const formI = (s) => FXI.fromPoly(PXI.parse(s));
const eqnI = (l, r) => U.val('eqn', { lhs: PXI.parse(l), rhs: PXI.parse(r), rel: '=' });   // 方程台输出的两边是多项式（和 eqdesk 一样）
const falsy = (x, m) => { if (x) throw new Error(m || '应为假'); };
t('I: alg.factor 把 x²−5x+6 分解成 (x−2)(x−3)，值不变，结果是因式分解形式', () => {
  const r = U.applyRule('alg.factor', U.val('form', formI('x^2 - 5x + 6')), [], { r1: 2, r2: 3 });
  truthy(r.ok, r.why); truthy(r.kept, r.why);
  eq(FXI.show(r.value.data), '(x − 2)(x − 3)');
  truthy(FXI.isNormal(r.value.data, 'factored'), '结果应是因式分解形式');
});
t('I: alg.factor 负根：x²+x−6 = (x+3)(x−2)', () => {
  const r = U.applyRule('alg.factor', U.val('form', formI('x^2 + x - 6')), [], { r1: -3, r2: 2 });
  truthy(r.ok && r.kept, r.why); eq(FXI.show(r.value.data), '(x + 3)(x − 2)');
});
t('I: alg.factor 拒绝：根不对、缺根、首项系数不是 1、已经是乘积', () => {
  const v = U.val('form', formI('x^2 - 5x + 6'));
  const a = U.applyRule('alg.factor', v, [], { r1: 1, r2: 3 });
  truthy(!a.ok && /不等于/.test(a.why), '根不对要说明相乘不等于原式：' + a.why);
  truthy(!U.applyRule('alg.factor', v, [], { r1: 2 }).ok, '缺一个根');
  truthy(!U.applyRule('alg.factor', U.val('form', formI('2x^2 - 10x + 12')), [], { r1: 2, r2: 3 }).ok, '首项系数不是 1');
  const prodI = { op: 'mul', args: [{ op: 'group', args: [{ op: 'sub', args: [{ op: 'var', name: 'x' }, { op: 'num', n: 2n }] }] }, { op: 'group', args: [{ op: 'sub', args: [{ op: 'var', name: 'x' }, { op: 'num', n: 3n }] }] }] };
  truthy(!U.applyRule('alg.factor', U.val('form', prodI), [], { r1: 2, r2: 3 }).ok, '已经是乘积');
});
t('I: 工作台按规则 id 执行因式分解（stepRule）：一步记进历史、写进步骤说明；根不对时说明原因、步骤不变', () => {
  const st0 = U.Workbench.create(eqnI('x^2 - 5x + 6', '0'));
  const bad = U.Workbench.stepRule(st0, 'alg.factor', ['lhs'], { r1: 1, r2: 3 });
  truthy(/不等于/.test(bad.lastError || ''), '根不对要说明');
  eq(bad.steps.length, 0, '步骤不变');
  const st = U.Workbench.stepRule(st0, 'alg.factor', ['lhs'], { r1: 2, r2: 3 });
  eq(st.lastError, null); eq(st.steps.length, 1); eq(st.steps[0].rule, 'alg.factor');
  truthy(/因式分解/.test(U.Workbench.stepLog(st)[0]), U.Workbench.stepLog(st)[0]);
  truthy(U.Workbench.stepLog(st)[0].indexOf('(x − 2)(x − 3)') >= 0, '结果写进了说明');
  eq(U.Workbench.replay(st0.start, st.steps).current.kind, 'eqn', '重放得到同样的方程');
});

// 工作台的步骤写在台面（scene.workbench），判题的 steps 查询读它（judge.js 原有的读法，不改）
const JI = U.Judge;
const stepsQ = (sc, c) => JI.compile(c)(JI.makeW(sc, W.evaluate(sc), {}));
const saveWB = (sc, host, eqv, st) => { const r = W.act(sc, U.ExprBench.saveAction(host, eqv, st)); truthy(r.ok, r.why || '写台面失败'); };
// 方程台接工作台（和界面上一样：代数式卡 → 方程台 → 工作台）
const wireEq = (sc, host, l, r) => {
  const a = W.add(sc, 'algebra', 0, 0, { text: l }), b = W.add(sc, 'algebra', 0, 0, { text: r }), q = W.add(sc, 'eqdesk', 0, 0, { by: 0 });
  link(sc, a, 'p', q, 'L'); link(sc, b, 'p', q, 'R'); link(sc, q, 'eq', host, 'e');
};
const moveThenCollectDivide = () => {
  const eqv = eqnI('3x+5', '20');
  let st = U.Workbench.step(U.Workbench.create(eqv), 'move-term', 1, {});
  st = U.Workbench.step(st, 'collect', ['rhs'], {}); eq(st.lastError, null, '合并：' + st.lastError);
  st = U.Workbench.step(st, 'divide', null, { by: '3' }); eq(st.lastError, null, '除：' + st.lastError);
  return { eqv, st };
};
t('I: 工作台的步骤写在台面（scene.workbench），不是器材，不改器材和连线', () => {
  const sc = W.blank(), host = W.add(sc, 'exprbench', 0, 0, {}), n0 = Object.keys(sc.entities).length;
  const { eqv, st } = moveThenCollectDivide();
  saveWB(sc, host, eqv, st);
  eq(Object.keys(sc.entities).length, n0, '器材数不变'); eq(sc.links.length, 0, '连线数不变');
  eq(sc.workbench.host, host, '记在这台工作台上'); eq(sc.workbench.steps.map((s) => s.rule), ['alg.move-term', 'alg.collect', 'alg.divide'], '三步，按顺序');
});
t('I: 没有步骤时，steps 查询为假，并说明没有记录', () => {
  const sc = W.blank(); W.add(sc, 'exprbench', 0, 0, {});
  falsy(stepsQ(sc, { steps: { used: 'alg.move-term' } }));
  truthy(/没有式子工作台的步骤记录/.test(JI.unmetWhy({ steps: { used: 'alg.move-term' } }, sc, W.evaluate(sc))));
});
t('I: 一道代数题做完工作台步骤后，judge 的 steps 查询为真（移项、合并、两边同除）', () => {
  const sc = W.blank(), host = W.add(sc, 'exprbench', 0, 0, {});
  wireEq(sc, host, '3x+5', '20');
  const { eqv, st } = moveThenCollectDivide();
  eq(U.Workbench.solution(st).solved, true, '解出 x = 5');
  saveWB(sc, host, eqv, st);
  truthy(stepsQ(sc, { steps: { used: 'alg.move-term', allKept: true } }), '用过移项，且每步都保持了不变量');
  truthy(stepsQ(sc, { steps: { used: 'alg.divide' } }), '用过两边同除');
  falsy(stepsQ(sc, { steps: { used: 'alg.factor' } }), '没有用因式分解');
  eq(W.evaluate(sc)[host].out.solved.data, true, '工作台的「解出来了」输出为真（从台面上的步骤算出来）');
});
t('I: 撤销到第 1 步：台面上只剩移项；换一个方程：旧步骤不再用', () => {
  const sc = W.blank(), host = W.add(sc, 'exprbench', 0, 0, {});
  const { eqv, st } = moveThenCollectDivide();
  saveWB(sc, host, eqv, st);
  saveWB(sc, host, eqv, U.Workbench.undo(st, 1));
  eq(sc.workbench.steps.length, 1, '剩 1 步');
  truthy(stepsQ(sc, { steps: { used: 'alg.move-term' } }) && !stepsQ(sc, { steps: { used: 'alg.divide' } }), '只剩移项');
  const eq2 = eqnI('2x', '4');
  truthy(U.ExprBench.currentOf(sc, host, eq2).steps.length === 0, '方程换了：旧步骤不用，从新方程开始');
  eq(U.Workbench.stepLog(U.ExprBench.currentOf(sc, host, eq2)).length, 0, '没有历史');
  saveWB(sc, host, eq2, U.Workbench.create(eq2));
  eq(sc.workbench, undefined, '清掉了旧步骤');
});
t('I: 工作台状态从台面重算，和内存里的历史一致；删掉工作台，步骤也没了', () => {
  const sc = W.blank(), host = W.add(sc, 'exprbench', 0, 0, {});
  const { eqv, st } = moveThenCollectDivide();
  saveWB(sc, host, eqv, st);
  eq(U.Workbench.stepLog(U.ExprBench.currentOf(sc, host, eqv)), U.Workbench.stepLog(st), '日志一致');
  W.act(sc, { t: 'del', id: host });
  eq(sc.workbench, undefined, '工作台删了，步骤也删了');
});
t('I: 因式分解进工作台：alg.factor 步骤记在台面上，steps 查询（用过且保持）为真', () => {
  const sc = W.blank(), host = W.add(sc, 'exprbench', 0, 0, {}), eqv = eqnI('x^2 - 5x + 6', '0');
  const st = U.Workbench.stepRule(U.Workbench.create(eqv), 'alg.factor', ['lhs'], { r1: 2, r2: 3 });
  saveWB(sc, host, eqv, st);
  truthy(stepsQ(sc, { steps: { used: 'alg.factor', allKept: true } }), '用过因式分解，且保持了不变量');
  eq(U.ExprBench.currentOf(sc, host, eqv).current.kind, 'eqn', '重算得到分解后的方程');
});
t('I: 工作台器材的「有没有步骤」在台面上：没有台面步骤时，它的状态是方程本身', () => {
  const sc = W.blank(), host = W.add(sc, 'exprbench', 0, 0, {}), eqv = eqnI('3x+5', '20');
  eq(U.ExprBench.currentOf(sc, host, eqv).steps.length, 0);
  eq(U.ExprBench.stepsOf(sc, host).length, 0);
});

// ---- 任务 J（next-steps.md §10.7）：二次扩域坐标、增量求值、文件清单 ----
console.log('任务 J：二次扩域坐标');
t('J1 顶点：y = 2x² − 8x + 5 的顶点精确为 (2, −3)', () => {
  const sc = W.blank(), id = W.add(sc, 'quad-vertex', 0, 0, { a: 2, b: -8, c: 5 });
  const v = W.evaluate(sc)[id].out.v;
  truthy(v && v.kind === 'spoint', '应输出符号点');
  eq(U.KINDS.spoint.show(v.data), '(2, −3)'); eq(v.exact, true);
});
t('J1 交点：y = x² − 2 与 x 轴交于 √2 和 −√2（精确，不是近似）', () => {
  const sc = W.blank(), id = W.add(sc, 'quad-xint', 0, 0, { a: 1, b: 0, c: -2 });
  const o = W.evaluate(sc)[id].out;
  eq(U.Real.show(o.p1.data.x), '√2'); eq(U.Real.show(o.p2.data.x), '−√2');
  eq(U.Real.show(o.p1.data.y), '0'); eq(o.p1.exact, true);
});
t('J1 交点：x² − 4x + 1 = 0 的根是 2 ± √3（只用一个根式 √3）', () => {
  const sc = W.blank(), id = W.add(sc, 'quad-xint', 0, 0, { a: 1, b: -4, c: 1 });
  const o = W.evaluate(sc)[id].out;
  eq(U.Real.show(o.p1.data.x), '2 + √3'); eq(U.Real.show(o.p2.data.x), '2 − √3');
});
t('J1 判别式为负：没有 x 轴交点（没有输出）', () => {
  const sc = W.blank(), id = W.add(sc, 'quad-xint', 0, 0, { a: 1, b: 0, c: 1 });
  const o = W.evaluate(sc)[id].out;
  eq(o.p1, undefined); eq(o.p2, undefined);
});
t('J1 y 轴交点是 (0, c)', () => {
  const sc = W.blank(), id = W.add(sc, 'quad-yint', 0, 0, { a: 2, b: 3, c: -5 });
  eq(U.KINDS.spoint.show(W.evaluate(sc)[id].out.p.data), '(0, −5)');
});
t('J1 a = 0 不是抛物线：拒绝并说明', () => {
  const sc = W.blank(), id = W.add(sc, 'quad-vertex', 0, 0, { a: 0, b: 1, c: 1 });
  const D = W.evaluate(sc);
  eq(D[id].out.v, undefined); truthy(D[id].sig.some((s) => s.lv === 'reject'), '应有拒绝说明');
});
t('J1 混用两个根式（√2 + √3）：退回近似值，标 ≈', () => {
  const r2 = U.Real.sqrt(U.Q(2)), r3 = U.Real.sqrt(U.Q(3));
  const p = U.SPoint.add(U.SPoint.of(r2, U.Real.from(U.Q(0))), U.SPoint.of(r3, U.Real.from(U.Q(0))));
  eq(p.exact, false); truthy(U.showVal(p).startsWith('≈'), '应显示 ≈');
  truthy(Math.abs(U.Real.approx(p.data.x) - (Math.SQRT2 + Math.sqrt(3))) < 1e-3, '近似值接近 √2 + √3');
});
t('J1 同一个根式内相加：精确（1 + √2 与 1 − √2 相加得 2）', () => {
  const r2 = U.Real.sqrt(U.Q(2));
  const a = U.SPoint.of(U.Real.add(U.Real.from(U.Q(1)), r2), U.Real.from(U.Q(0)));
  const b = U.SPoint.of(U.Real.add(U.Real.from(U.Q(1)), U.Real.mul(r2, U.Real.from(U.Q(-1)))), U.Real.from(U.Q(0)));
  const s = U.SPoint.add(a, b);
  eq(s.exact, true); eq(U.Real.show(s.data.x), '2');
});
t('J1 符号点存档往返后相等', () => {
  const v = U.SPoint.of(U.Real.sqrt(U.Q(3)), U.Real.from(U.Q(-1)));
  const back = U.KINDS.spoint.parse(U.KINDS.spoint.serialize(v.data));
  truthy(U.KINDS.spoint.eq(back, v.data), '往返相等');
});

console.log('任务 J：增量求值与局部渲染');
// 一条链（3 台器材）：num → op1（甲乙两口都接它）→ op2（甲接 op1，乙接 num）；返回 [num, op1, op2]
const jChain = (sc, x, y, n) => {
  const a = W.add(sc, 'num', x, y, { n }), b = W.add(sc, 'op', x, y, { op: 0 }), c = W.add(sc, 'op', x, y, { op: 0 });
  const ln = (from, fromPort, to, toPort) => sc.links.push({ id: 'l' + sc.nid++, from, fromPort, to, toPort });
  ln(a, 'v', b, 'a'); ln(a, 'v', b, 'b'); ln(b, 'r', c, 'a'); ln(a, 'v', c, 'b');
  return [a, b, c];
};
const jCount = (fn) => { const count = {}; fn(count); return count; };
const jSum = (count, ids) => ids.reduce((s, id) => s + (count[id] || 0), 0);
t('J2 改一个无关器材：其他器材的求值次数为 0（计数）', () => {
  const sc = W.blank(), A = jChain(sc, 0, 0, 1), B = jChain(sc, 100, 0, 2), C = W.add(sc, 'num', 200, 0, { n: 3 });
  const cache = {};
  W.evaluateCached(sc, cache);
  sc.entities[C].props.n = 7;
  const count = jCount((k) => W.evaluateCached(sc, cache, { count: k }));
  eq(jSum(count, A.concat(B)), 0, '链 A、链 B 的求值次数');
  eq(count[C], 1, '被改的器材算了一次');
});
t('J2 改上游：下游器材重算，别的链为 0', () => {
  const sc = W.blank(), A = jChain(sc, 0, 0, 1), B = jChain(sc, 100, 0, 2);
  const cache = {};
  W.evaluateCached(sc, cache);
  const before = bigStr(cache.D[A[2]].out);
  sc.entities[A[0]].props.n = 5;
  const count = jCount((k) => W.evaluateCached(sc, cache, { count: k }));
  truthy(count[A[0]] === 1 && count[A[1]] === 1 && count[A[2]] === 1, '链 A 的三台都重算');
  eq(jSum(count, B), 0, '链 B 为 0');
  truthy(bigStr(cache.D[A[2]].out) !== before, '下游的结果已更新');
});
t('J2 增量结果与全量求值完全一致', () => {
  const sc = W.blank(), A = jChain(sc, 0, 0, 1), B = jChain(sc, 100, 0, 2), C = W.add(sc, 'num', 200, 0, { n: 3 });
  const cache = {};
  W.evaluateCached(sc, cache);
  sc.entities[A[0]].props.n = 9; sc.entities[C].props.n = 4;
  const inc = W.evaluateCached(sc, cache), full = W.evaluate(sc);
  for (const id of Object.keys(full)) eq(bigStr(inc[id].out), bigStr(full[id].out), id + ' 的输出');
});
t('J2 子器材改动：父器材（容器）也重算', () => {
  const sc = W.blank(), P = W.add(sc, 'num', 0, 0, { n: 1 }), K = W.add(sc, 'num', 0, 0, { n: 2 });
  sc.entities[K].parent = P; sc.entities[K].slot = 'k';
  const cache = {};
  W.evaluateCached(sc, cache);
  sc.entities[K].props.n = 8;
  const count = jCount((k) => W.evaluateCached(sc, cache, { count: k }));
  eq(count[K], 1); eq(count[P], 1, '父器材重算');
});
t('J2 删掉子器材：原来的父器材重算（不会用旧结果）', () => {
  const sc = W.blank(), P = W.add(sc, 'num', 0, 0, { n: 1 }), K = W.add(sc, 'num', 0, 0, { n: 2 });
  sc.entities[K].parent = P; sc.entities[K].slot = 'k';
  const cache = {};
  W.evaluateCached(sc, cache);
  delete sc.entities[K];
  const count = jCount((k) => W.evaluateCached(sc, cache, { count: k }));
  eq(count[P], 1, '父器材重算');
  eq(bigStr(cache.D), bigStr(W.evaluate(sc)), '结果与全量一致');
});
t('J2 时钟走一拍：全部器材重算（时钟不能增量）', () => {
  const sc = W.blank(), A = jChain(sc, 0, 0, 1), B = jChain(sc, 100, 0, 2);
  const cache = {};
  W.evaluateCached(sc, cache);
  sc.clock.n += 1;
  const count = jCount((k) => W.evaluateCached(sc, cache, { count: k }));
  eq(jSum(count, A.concat(B)), 6, '六台都算了一次');
});
t('J2 没有改动：一台都不重算', () => {
  const sc = W.blank(); jChain(sc, 0, 0, 1);
  const cache = {};
  W.evaluateCached(sc, cache);
  const count = jCount((k) => W.evaluateCached(sc, cache, { count: k }));
  eq(Object.keys(count).length, 0);
});
t('J2 影响范围：affected 包括下游，不包括无关的器材', () => {
  const sc = W.blank(), A = jChain(sc, 0, 0, 1), B = jChain(sc, 100, 0, 2);
  const s = W.affected(sc, [A[0]]);
  eq([...s].sort(), A.slice().sort());
});
t('J2 工作区里 300 个对象，改一个点，增量求值中位数 < 16 毫秒', () => {
  const sc = W.blank();
  const heads = [];
  for (let i = 0; i < 100; i++) heads.push(jChain(sc, i * 10, 0, i)[0]);
  const cache = {};
  const tFull0 = Date.now(); W.evaluateCached(sc, cache); const fullMs = Date.now() - tFull0;
  const times = [];
  for (let i = 0; i < 9; i++) {
    sc.entities[heads[i]].props.n = i + 50;
    const t0 = process.hrtime.bigint();
    W.evaluateCached(sc, cache);
    times.push(Number(process.hrtime.bigint() - t0) / 1e6);
  }
  times.sort((x, y) => x - y);
  const med = times[4];
  console.log('       300 个对象：全量 ' + fullMs + ' 毫秒，增量中位数 ' + med.toFixed(3) + ' 毫秒');
  truthy(med < 16, '增量中位数 ' + med + ' 毫秒，应 < 16');
});

console.log('任务 J：文件清单');
// 解析 index.html 里 packs/ 下的脚本
const htmlSrcs = [...fs.readFileSync(path.join(root, 'index.html'), 'utf8').matchAll(/<script src="(packs\/[^"]+)"><\/script>/g)].map((m) => m[1]);
const dirPacks = fs.readdirSync(path.join(root, 'packs')).filter((f) => f.endsWith('.js')).sort().map((f) => 'packs/' + f);
t('J3 清单和 index.html 一致（仓库里的真实文件）', () => {
  eq(U.checkPackManifest(U.PACK_FILES, htmlSrcs, dirPacks), []);
});
t('J3 清单检查：一致时没有错误', () => {
  eq(U.checkPackManifest({ core: 'packs/core.js' }, ['packs/core.js'], ['packs/core.js']), []);
});
t('J3 清单检查：index.html 漏了一个包，检查失败并指出是哪个', () => {
  const errs = U.checkPackManifest({ core: 'packs/core.js', time: 'packs/time.js' }, ['packs/core.js'], ['packs/core.js', 'packs/time.js']);
  truthy(errs.length > 0, '应报错'); truthy(errs.some((m) => m.includes('packs/time.js')), '应指出 time');
});
t('J3 清单检查：清单里有一个包的文件不存在，检查失败', () => {
  const errs = U.checkPackManifest({ core: 'packs/core.js', ghost: 'packs/ghost.js' }, ['packs/core.js', 'packs/ghost.js'], ['packs/core.js']);
  truthy(errs.some((m) => m.includes('ghost')), '应指出 ghost');
});
t('J3 清单检查：packs 里有文件没登记，检查失败', () => {
  const errs = U.checkPackManifest({ core: 'packs/core.js' }, ['packs/core.js'], ['packs/core.js', 'packs/new.js']);
  truthy(errs.some((m) => m.includes('new.js')), '应指出 new.js');
});

console.log('D7：跨工作台（分数的公式、几何的面积读数）');
t('D7 解析：斜线是除以一个数（a/2 与 a·(1/2) 一样）', () => { eq(U.Q.show(U.Poly.evalQ(U.Poly.parse('a/2'), { a: Q(4) })), '2'); });
t('D7 解析：½ × a × h 与 a·h/2 、(a·h)/2 、½ah 都得到 ½ah', () => {
  const env = { a: Q(6), h: Q(4) };
  for (const s of ['½ × a × h', 'a·h/2', '(a·h)/2', '½ah', '3/6 a h', 'a*h*1/2']) eq(U.Q.show(U.Poly.evalQ(U.Poly.parse(s), env)), '12', s);
});
t('D7 解析：分数系数的多项式（3/4 a 与 a 的和）', () => { eq(U.Q.show(U.Poly.evalQ(U.Poly.parse('3/4 a + a/4'), { a: Q(8) })), '8'); });
t('D7 解析：除以 0、除以字母都说明原因', () => {
  truthy(/0/.test(String(thr(() => U.Poly.parse('a/0')))), '除以 0 应说明');
  truthy(/一个数/.test(String(thr(() => U.Poly.parse('a/b')))), '除以字母应说明只能除以一个数');
  truthy(/一个数/.test(String(thr(() => U.Poly.parse('1/x')))), '1/x 不是整式');
});
t('D7 显示：½ah 的式子写成 1/2 乘 a 乘 h（分数照常写成 n/d，显示可以再议）', () => { const s = U.Form.show(U.Form.fromPoly(U.Poly.parse('½ah'))); truthy(/1\/2/.test(s) && /a/.test(s) && /h/.test(s), s); });
t('D7 式子：几何的面积（12）接上 S = ½ × a × h，代入 a = 6、h = 4 后 solution 为 12', () => {
  const fx = U.ExprBench.workEqnIn({ g: [U.val('num', Q(12), { dim: 'area' })], f: [U.val('poly', U.Poly.parse('½ × a × h'))] });
  truthy(fx && fx.geo === true, '应是几何来的方程');
  let st = U.Workbench.create(fx, { formula: true });
  st = U.Workbench.step(st, 'substitute', null, { var: 'a', val: '6' }); eq(st.lastError, null, '代入 a：' + st.lastError);
  st = U.Workbench.step(st, 'substitute', null, { var: 'h', val: '4' }); eq(st.lastError, null, '代入 h：' + st.lastError);
  eq(U.Workbench.solution(st).x, Q(12));
  eq(U.Workbench.stepLog(st).length, 2);
});
t('D7 代入和算出数能处理分数：a = 1/2、h = 4 代入 ½ × a × h，算出数得到 S = 1', () => {
  const fx = U.ExprBench.workEqnIn({ g: [U.val('num', Q(1), { dim: 'area' })], f: [U.val('poly', U.Poly.parse('½ × a × h'))] });
  let st = U.Workbench.create(fx, { formula: true });
  st = U.Workbench.step(st, 'substitute', null, { var: 'a', val: '1/2' }); eq(st.lastError, null, '代入分数：' + st.lastError);
  st = U.Workbench.step(st, 'substitute', null, { var: 'h', val: '4' }); eq(st.lastError, null, '代入 h：' + st.lastError);
  eq(U.Workbench.solution(st).x, Q(1), '代入后右边已经是数 1（分数先乘开）');
});
t('D7 式子：只接几何的面积（没有公式）时没有方程', () => {
  eq(U.ExprBench.workEqnIn({ g: [U.val('num', Q(12), { dim: 'area' })] }), null);
});
t('D7 读数对照：式子算出的 S 与几何的面积一致；不一致时写出两个数', () => {
  const fx = U.ExprBench.workEqnIn({ g: [U.val('num', Q(12), { dim: 'area' })], f: [U.val('poly', U.Poly.parse('½ah'))] });
  let st = U.Workbench.create(fx, { formula: true });
  st = U.Workbench.step(st, 'substitute', null, { var: 'a', val: '6' });
  st = U.Workbench.step(st, 'substitute', null, { var: 'h', val: '4' });
  const same = U.ExprBench.areaNote(st, U.val('num', Q(12), { dim: 'area' }));
  eq(same.same, true); truthy(/一致/.test(same.text), same.text);
  const off = U.ExprBench.areaNote(st, U.val('num', Q(15), { dim: 'area' }));
  eq(off.same, false); truthy(/15/.test(off.text) && /12/.test(off.text), off.text);
  const early = U.ExprBench.areaNote(U.Workbench.create(fx, { formula: true }), U.val('num', Q(12), { dim: 'area' }));
  eq(early.same, null); truthy(/还没有解/.test(early.text), early.text);
});

console.log('H4 遗留：凑整、两位数乘两位数、负数结果（竖式）');
{
const N = (n) => ({ op: 'num', n: BigInt(n) }), add = (...args) => ({ op: 'add', args });
const FV = (f) => U.val('form', f), ap = U.applyRule, F = U.Form, cn = (s) => /[一-鿿]/.test(s || '');
t('凑整：47 + 38 点选 47 凑成 50，得 47 + 3 + 35，值不变', () => {
  const r = ap('arith.round', FV(add(N(47), N(38))), [], { near: 0 });
  eq(r.ok, true); eq(r.kept, true); eq(F.show(r.value.data), '47 + 3 + 35');
});
t('凑整：点选第二个数 38 时，凑成 40，得 38 + 2 + 45', () => {
  const r = ap('arith.round', FV(add(N(47), N(38))), [], { near: 1 });
  eq(r.ok, true); eq(r.kept, true); eq(F.show(r.value.data), '38 + 2 + 45');
});
t('凑整：整十数不用凑；另一个数不比差大（47 + 2、47 + 3）都被拒绝并说明', () => {
  for (const f of [add(N(40), N(38)), add(N(47), N(2)), add(N(47), N(3))]) {
    const r = ap('arith.round', FV(f), [], { near: 0 }); eq(r.ok, false); eq(r.kept, false); truthy(cn(r.why), r.why);
  }
});
t('凑整：不是两个数的加法、或者点选的不是第一、第二个数，都被拒绝', () => {
  for (const [f, near] of [[N(47), 0], [add(N(47), N(38)), 2]]) {
    const r = ap('arith.round', FV(f), [], { near }); eq(r.ok, false); truthy(cn(r.why), r.why);
  }
});
t('竖式内核：47 + 38 先凑整（一步），再竖式两列，得 85；凑整要在竖式开始前', () => {
  const A = U.ArithBench, st0 = A.currentOf({}, 'x', { a: 47, b: 38, op: 0 });
  const rd = A.step(st0, 'round', { term: 0 });
  eq(rd.lastError, null, rd.lastError); eq(A.showState(rd), '47 + 3 + 35'); eq(rd.steps[0].rule, 'arith.round');
  truthy(A.step(st0, 'round', {}).lastError, '没点选要凑整的数应提示');
  const done = A.step(A.step(rd, 'col', { col: 0 }), 'col', { col: 1 });
  eq(done.result, 85); eq(done.steps.length, 3);
  eq(A.stepLog(rd)[0], '第 1 步：凑整：47 + 38 = 47 + 3 + 35');
  truthy(A.step(A.step(rd, 'col', { col: 0 }), 'round', { term: 0 }).lastError, '竖式开始后不能凑整');
  const props = { a: 47, b: 38, op: 0 }, scene = { workbench: A.saveAction('x', props, done) };
  eq(A.stateOf(scene, 'x', props).result, 85, '凑整的步骤存进台面后能重放');
});
t('两位数乘两位数：23 × 14 先算个位的部分积 92，再算十位的部分积 230，相加得 322', () => {
  const A = U.ArithBench, st0 = A.currentOf({}, 'x', { a: 23, b: 14, op: 2 });
  eq(st0.start.error, null);
  truthy(A.step(st0, 'part', { digit: 1 }).lastError, '要先算个位的部分积');
  truthy(A.step(st0, 'sum', {}).lastError, '部分积没算完，不能相加');
  const p0 = A.step(st0, 'part', { digit: 0 }); eq(p0.lastError, null);
  eq(p0.parts[0].value, 92);
  const p1 = A.step(p0, 'part', { digit: 1 }); eq(p1.lastError, null);
  eq(p1.parts[1].value, 230);
  const s = A.step(p1, 'sum', {}); eq(s.lastError, null); eq(s.result, 322); eq(s.steps.length, 3);
  eq(A.stepLog(s)[1], '第 2 步：十位：23 × 1 = 23，向左移一位，得 230');
  eq(A.stepLog(s)[2], '第 3 步：相加：92 + 230 = 322');
  truthy(A.step(s, 'part', { digit: 0 }).lastError, '相加以后不能再算部分积');
  eq(A.undo(s, 2).result, null, '撤销到第 2 步，结果消失');
  eq(A.resultText(s), '322');
});
t('两位数乘两位数只接受两位数：23 × 123、123 × 12 被拒绝并说明；被乘数三位、乘数一位仍用竖式列', () => {
  const A = U.ArithBench;
  truthy(A.currentOf({}, 'x', { a: 23, b: 123, op: 2 }).start.error, '乘数三位不做');
  truthy(A.currentOf({}, 'x', { a: 123, b: 12, op: 2 }).start.error, '被乘数三位（两位数乘两位数的范围外）不做');
  eq(A.currentOf({}, 'x', { a: 123, b: 4, op: 2 }).start.error, null);
});
t('负数结果：23 − 47 把大数写在上面，竖式得 24，结果 −24（精确，显示负号）', () => {
  const A = U.ArithBench, props = { a: 23, b: 47, op: 1 };
  const st0 = A.currentOf({}, 'x', props); eq(st0.start.error, null, '不再拒绝');
  eq(A.showState(st0), '23 − 47'); eq(A.rowsOf(st0.start), [47, 23], '大数写在上面');
  const d = A.step(A.step(st0, 'col', { col: 0 }), 'col', { col: 1 });
  eq(d.lastError, null); eq(d.cols[0].digit, 4); eq(d.cols[1].digit, 2);
  eq(d.result, -24); eq(A.resultText(d), '−24'); eq(Q.show(Q(d.result)), '-24');
  const scene = { workbench: A.saveAction('x', props, d) };
  eq(A.stateOf(scene, 'x', props).result, -24, '存进台面后重放仍是 −24');
});
t('负数结果：27 − 52 = −25，与 52 − 27 = 25 互为相反数', () => {
  const A = U.ArithBench;
  const d = A.step(A.step(A.currentOf({}, 'x', { a: 27, b: 52, op: 1 }), 'col', { col: 0 }), 'col', { col: 1 });
  eq(d.result, -25); eq(d.result, -A.step(A.step(A.currentOf({}, 'x', { a: 52, b: 27, op: 1 }), 'col', { col: 0 }), 'col', { col: 1 }).result);
});
}
console.log('任务 J 遗留：清单生成（tools/gen-manifest.js）');
// 生成器不可用时，这一组测试失败，而不是让 run.js 崩掉
let GM = null, gmErr = '';
try { GM = require('../tools/gen-manifest.js'); } catch (e) { gmErr = e.message; }
t('J4 生成器可以加载', () => { truthy(GM, '加载 tools/gen-manifest.js 失败：' + gmErr); });
t('J4 生成结果和现在的 index.html、loader.js 一致（不一致就失败）', () => {
  eq(GM ? GM.check(root) : ['生成器不可用'], []);
});
t('J4 生成的包列表 = packs/ 目录里的全部文件（不多不少）', () => {
  const want = dirPacks.map((p) => p.replace(/^packs\//, '').replace(/\.js$/, ''));
  eq(GM ? GM.packIds(root).slice().sort() : [], want.slice().sort());
});
t('J4 生成的加载顺序：每个包声明的依赖都排在它前面（否则注册时记下“还没加载”）', () => {
  const ids = GM ? GM.packIds(root) : [];
  const deps = GM ? GM.depsOf(root) : {};
  for (const id of ids) for (const d of deps[id] || []) if (deps[d]) truthy(ids.indexOf(d) < ids.indexOf(id), id + ' 的依赖 ' + d + ' 应排在它前面');
  truthy(ids.length > 0 && ids.some((id) => (deps[id] || []).length), '应能读到包的依赖声明');
});
t('J4 生成的 PACK_FILES 对每个注册的包都有路径', () => {
  const r = GM ? GM.render(root) : null;
  truthy(r && Object.keys(r.packFiles).length === dirPacks.length, '清单条数应等于 packs 文件数');
  for (const id of Object.keys(U.packs)) if (id !== 'probe-deps') truthy(r.packFiles[id] === 'packs/' + id + '.js', '生成的清单缺 ' + id);
});
t('J4 index.html 漏掉一个 packs 脚本，检查失败并指出是哪一个', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace(/<script src="packs\/time\.js"><\/script>\r?\n/, '');
  const errs = GM ? GM.check(root, { html }) : [];
  truthy(errs.some((m) => m.includes('index.html') && m.includes('packs/time.js')), '应报错并指出 packs/time.js，实际：' + JSON.stringify(errs));
});
t('J4 loader.js 的清单多了一个不存在的包，检查失败并指出', () => {
  const js = fs.readFileSync(path.join(root, 'js/core/loader.js'), 'utf8');
  const bad = js.replace("  'core': 'packs/core.js',", "  'core': 'packs/core.js',\n  'ghost': 'packs/ghost.js',");
  truthy(bad !== js, '测试前提：loader.js 里应有 core 的清单行');
  const errs = GM ? GM.check(root, { loader: bad }) : [];
  truthy(errs.some((m) => m.includes('loader.js') && m.includes('ghost')), '应报错并指出 ghost，实际：' + JSON.stringify(errs));
});
t('J4 生成是幂等的：对生成结果再生成，内容不变', () => {
  const r = GM ? GM.render(root) : null;
  const again = GM ? GM.render(root, { html: r.html, loader: r.loader }) : null;
  eq(again ? again.html : 'x', r ? r.html : 'y');
  eq(again ? again.loader : 'x', r ? r.loader : 'y');
});

// §10.5.9 第 10 条：出题人控制。题目用字段声明器材、工具、能不能改名、能不能删题目给的图形；界面不按器材名硬编码。
t('出题人控制：没写新字段时的默认值（工具不设白名单，题目给的图形可改名、可删）', () => {
  const r = U.problemRules({ id: 'x', title: 'x', milestones: [] });
  eq(r.rename, true); eq(r.deleteGiven, true); eq(r.shelfOnly, false); eq(r.tools, null);
});
t('出题人控制：tools 只能写工作区工具的 id，写错了 lint 报错并指出是哪一个', () => {
  const base = U.problems.find((p) => p.id === 'geo-median-area');
  const bad = U.problemLint(Object.assign({}, base, { tools: ['seg', 'nope'] })).errors;
  truthy(bad.some((m) => m.includes('nope')), '应报错并指出 nope，实际：' + JSON.stringify(bad));
  eq(U.problemLint(Object.assign({}, base, { tools: ['seg', 'cut'] })).errors.length, 0, 'seg、cut 是工作区工具，lint 应通过');
  truthy(U.problemLint(Object.assign({}, base, { tools: 'seg' })).errors.length > 0, 'tools 要是数组');
});
t('出题人控制：shelfOnly 要是布尔值，并且要和 shelf 一起写', () => {
  const base = U.problems.find((p) => p.id === 'geo-median-area');
  truthy(U.problemLint(Object.assign({}, base, { shelfOnly: 'yes' })).errors.some((m) => m.includes('shelfOnly')), 'shelfOnly 不是布尔值应报错');
  truthy(U.problemLint(Object.assign({}, base, { shelfOnly: true, shelf: undefined })).errors.some((m) => m.includes('shelfOnly')), '没有 shelf 却写 shelfOnly 应报错');
  eq(U.problemLint(Object.assign({}, base, { shelfOnly: true })).errors.length, 0, 'shelfOnly: true 配 shelf 应通过');
});
t('出题人控制：rename、deleteGiven 要是布尔值', () => {
  const base = U.problems.find((p) => p.id === 'geo-median-area');
  truthy(U.problemLint(Object.assign({}, base, { rename: 0 })).errors.some((m) => m.includes('rename')), 'rename 不是布尔值应报错');
  truthy(U.problemLint(Object.assign({}, base, { deleteGiven: 'no' })).errors.some((m) => m.includes('deleteGiven')), 'deleteGiven 不是布尔值应报错');
});
t('出题人控制：problemToolAllowed 只看 tools 白名单，没有白名单就都允许', () => {
  eq(U.problemToolAllowed({}, 'cut'), true);
  eq(U.problemToolAllowed({ tools: ['seg'] }, 'cut'), false);
  eq(U.problemToolAllowed({ tools: ['seg'] }, 'seg'), true);
});
t('出题人控制：problemGivenIds 就是题目 build 出来的器材 id（学生加的不算）', () => {
  const p = U.problemById('geo-teacher-median');
  const ids = U.problemGivenIds(p);
  eq([...ids].sort().join(','), Object.keys(p.build().entities).sort().join(','), '题目给的器材 id');
  eq(U.problemGivenIds(null).size, 0, '没有题目时没有题目给的图形');
});
t('出题人控制：示例题 geo-teacher-median 声明了器材架、工具白名单、不许改名、不许删题目给的图形', () => {
  const p = U.problemById('geo-teacher-median');
  truthy(p, '示例题要存在');
  eq(p.shelfOnly, true); eq(p.rename, false); eq(p.deleteGiven, false);
  eq(p.tools.slice().sort().join(','), 'cut,mid,seg', '工具只留连线、中点和剪');
  const r = U.problemRules(p);
  eq(r.rename, false); eq(r.deleteGiven, false); eq(r.shelfOnly, true);
  eq(U.problemLint(p).errors.length, 0, '示例题 lint 通过');
});
t('出题人控制：题库里所有题目的 lint 没有错误（含新字段）', () => {
  const r = U.problemLintAll(U.problems);
  eq(Object.keys(r.errors).length, 0, '有错误的题：' + Object.keys(r.errors).join('、'));
});
// ---- 约束锁定与尺寸驱动（§10.5.9 第 1、2 条）----
console.log('约束锁定与尺寸驱动（§10.5.9 第 1、2 条）');
// 场景：定长约束接着两个点（kind 0），或直角约束接着三个点（kind 1，b 为顶点）。约束器材 gcon 的输入口是 a、b、c
const lockScene = (kind, len, pts) => {
  const sc = W.blank(), ids = pts.map(([x, y]) => W.add(sc, 'gpt', 0, 0, { x, y }));
  const con = W.add(sc, 'gcon', 0, 0, { kind, len });
  const ports = kind === 0 ? ['a', 'b'] : ['a', 'b', 'c'];
  ports.forEach((p, i) => sc.links.push({ id: 'k' + i, from: ids[i], fromPort: 'p', to: con, toPort: p }));
  return { sc, ids, con };
};
t('约束器材 gcon 在包里声明 constraint，lint 通过', () => {
  truthy(U.types.gcon && U.types.gcon.constraint === true, 'gcon 应声明 constraint: true');
  eq(U.lintType(U.types.gcon).errors, []);
});
t('定长约束的输出是锁住的长度（求值结果是 5）', () => {
  const { sc, con } = lockScene(0, 5, [[0, 0], [3, 4]]);
  eq(U.Q.show(W.evaluate(sc)[con].out.n.data), '5');
});
t('Geo.locks.of 读出约束的端点；少接一个点就不起作用', () => {
  const { sc, ids, con } = lockScene(0, 5, [[0, 0], [3, 4]]);
  const L = U.Geo.locks.of(sc);
  eq(L.length, 1); eq(L[0].kind, 'len'); eq(L[0].a, ids[0]); eq(L[0].b, ids[1]); eq(L[0].id, con);
  sc.links = sc.links.filter((l) => l.toPort !== 'b');
  eq(U.Geo.locks.of(sc).length, 0);
});
t('拖动锁长的端点：B 拖到 (6,0)，只能落在长 5 的圆上，取最近的 (5,0)', () => {
  const { sc, ids } = lockScene(0, 5, [[0, 0], [3, 4]]);
  eq(U.Geo.locks.fit(sc, ids[1], { x: 6, y: 0 }), { ok: true, x: 5, y: 0, locked: true });
});
t('拖动没有约束的点，原样返回', () => {
  const sc = W.blank(), p = W.add(sc, 'gpt', 0, 0, { x: 1, y: 1 });
  eq(U.Geo.locks.fit(sc, p, { x: 7, y: -3 }), { ok: true, x: 7, y: -3, locked: false });
});
t('拖动锁长的端点 A：落点仍在离 B 长 5 的圆上', () => {
  const { sc, ids } = lockScene(0, 5, [[0, 0], [3, 4]]);
  const r = U.Geo.locks.fit(sc, ids[0], { x: 1, y: -6 });
  truthy(r.ok, '应能落在圆上');
  eq((r.x - 3) * (r.x - 3) + (r.y - 4) * (r.y - 4), 25);
});
t('尺寸驱动：把长改成 4，B 从 (5,0) 落到长 4 的圆上最近的 (4,0)', () => {
  const { sc, ids, con } = lockScene(0, 5, [[0, 0], [5, 0]]);
  const r = U.Geo.locks.dim(sc, con, 4);
  eq(r.ok, true); eq(r.id, ids[1]); eq([r.x, r.y], [4, 0]);
});
t('尺寸驱动：b 动不了就动 a：长改成 11，B(3,4) 不动，A 落到离原来最近的 (3,-7)', () => {
  const { sc, ids, con } = lockScene(0, 5, [[0, 0], [3, 4]]);
  const r = U.Geo.locks.dim(sc, con, 11);
  eq(r.ok, true); eq(r.id, ids[0]); eq([r.x, r.y], [3, -7]);
});
t('尺寸驱动：两端都画不出来的长（20：工作区里没有整数点到 A、B 的距离是 20）说明原因，不动', () => {
  const { sc, con } = lockScene(0, 5, [[0, 0], [3, 4]]);
  const r = U.Geo.locks.dim(sc, con, 20);
  eq(r.ok, false); truthy(/画不出来/.test(r.why || ''), '应说明画不出来');
});
t('尺寸驱动：长度只能是 1 到 20 的整数', () => {
  const { sc, con } = lockScene(0, 5, [[0, 0], [3, 4]]);
  eq(U.Geo.locks.dim(sc, con, 2.5).ok, false); eq(U.Geo.locks.dim(sc, con, 0).ok, false);
});
t('锁长：只有长是整数的线段能锁（3、4、5 能，√2 不能）', () => {
  const { sc, ids } = lockScene(0, 5, [[0, 0], [3, 4]]);
  eq(U.Geo.locks.canLen(sc, ids[0], ids[1]).len, 5);
  const s2 = W.blank(), p = W.add(s2, 'gpt', 0, 0, { x: 0, y: 0 }), q = W.add(s2, 'gpt', 0, 0, { x: 1, y: 1 });
  eq(U.Geo.locks.canLen(s2, p, q).ok, false);
});
t('直角：多边形里的直角顶点；A(0,0)、B(4,0)、C(0,3) 只有 A 是直角', () => {
  const sc = W.blank(), ids = [[0, 0], [4, 0], [0, 3]].map(([x, y]) => W.add(sc, 'gpt', 0, 0, { x, y }));
  const r = U.Geo.locks.rightAt(sc, ids);
  eq(r.length, 1); eq(r[0][1], ids[0]);
});
t('直角约束：拖 P(4,0) 到 (3,5)，只能沿与 BC 垂直的线走，落到 (3,0)', () => {
  const { sc, ids } = lockScene(1, 0, [[4, 0], [0, 0], [0, 3]]);
  eq(U.Geo.locks.fit(sc, ids[0], { x: 3, y: 5 }), { ok: true, x: 3, y: 0, locked: true });
});
t('整体移动：约束的点都在移动的那组里才算刚体；只动一端不是', () => {
  const { sc, ids } = lockScene(0, 5, [[0, 0], [3, 4]]);
  eq(U.Geo.locks.rigid(sc, ids), true);
  eq(U.Geo.locks.rigid(sc, [ids[0]]), false);
});
console.log('分步定型（bake，§10.5.6 第 5 步）：前面的步骤折成一步，撤销回到定型前，判题仍能读到定型前的步骤');
{
  const N = (n) => ({ op: 'num', n: BigInt(n) }), X = { op: 'var', name: 'x' };
  const add = (...args) => ({ op: 'add', args }), mul = (...args) => ({ op: 'mul', args });
  const WB = U.Workbench, EV = (d) => U.val('eqn', d), cn = (s) => /[一-鿿]/.test(s || '');
  const lin = () => ({ lhs: add(mul(N(3), X), N(5)), rhs: N(20), rel: '=' });
  // 3x + 5 = 20：移项、两边同除以 3，两步，解为 x = 5
  const two = () => { const s = WB.create(EV(lin())); const m = WB.step(s, 'move-term', [1], {}); return WB.step(m, 'divide', null, { by: 3 }); };
  // 方程台送来的方程：两边是多项式（ExprBench 用它记台面上的 key）
  const polyEqn = () => { const d = lin(); return EV({ lhs: U.Form.value(d.lhs), rhs: U.Poly.norm([{ c: U.Q(20), m: {} }]), rel: '=' }); };

  t('定型：没有新步骤时说明原因，步骤不变；定型后马上再定型也被拒绝', () => {
    const b = WB.bake(WB.create(EV(lin())));
    truthy(cn(b.lastError), b.lastError); eq(b.steps.length, 0);
    const done = WB.bake(two()); eq(done.steps.length, 3);
    const again = WB.bake(done); truthy(cn(again.lastError), again.lastError); eq(again.steps.length, 3, '没有新步骤，步骤不变');
  });
  t('定型：两步折成一步（bake），当前值不变，解还在，说明里有「定型」', () => {
    const s = two(), b = WB.bake(s);
    eq(b.lastError, null); eq(b.steps.length, 3); eq(b.steps[2].tool, 'bake'); eq(b.steps[2].rule, 'bake');
    eq(bigStr(b.current), bigStr(s.current), '定型不改值');
    eq(WB.solution(b).solved, true); eq(WB.solution(b).x, U.Q(5));
    truthy(WB.stepLog(b)[2].indexOf('定型') >= 0, WB.stepLog(b)[2]);
  });
  t('定型的折叠信息：一次定型是一个折叠（前 2 步）；定型后没有待定型的步骤，定型前有 2 步待定', () => {
    const b = WB.bake(two());
    eq(WB.folds(b), [{ from: 0, bake: 2 }]); eq(WB.pending(b), 0); eq(WB.pending(two()), 2);
  });
  t('定型后撤销到定型前：撤销到定型那一步之前，回到两步，解回来了；撤销到定型之后不影响', () => {
    const b = WB.bake(two());
    const back = WB.undo(b, 2);
    eq(back.lastError, null); eq(back.steps.length, 2); eq(WB.solution(back).solved, true);
    eq(WB.undo(b, 3).steps.length, 3);
  });
  t('定型的折叠不能拆开：撤销到折叠中间被拒绝，说明原因，步骤不变；撤到折叠的起点是整组一起撤', () => {
    const b = WB.bake(two());
    const bad = WB.undo(b, 1);
    truthy(cn(bad.lastError), bad.lastError); eq(bad.steps.length, 3, '步骤不变');
    eq(WB.undo(b, 0).steps.length, 0, '整组一起撤');
  });
  t('定型可以接着做：第二次定型只折叠它之后的步骤，撤销按折叠分段', () => {
    let s = WB.create(EV(lin()));
    s = WB.bake(WB.step(s, 'move-term', [1], {}));
    s = WB.bake(WB.step(s, 'divide', null, { by: 3 }));
    eq(s.lastError, null); eq(s.steps.map((x) => x.tool), ['move-term', 'bake', 'divide', 'bake']);
    eq(WB.solution(s).solved, true);
    eq(WB.folds(s), [{ from: 0, bake: 1 }, { from: 2, bake: 3 }]);
    eq(WB.undo(s, 3).steps.length, 3, '撤销到第二次定型之前：只去掉第二次定型');
    eq(WB.undo(s, 2).steps.length, 2, '撤销到第一次定型之后');
    eq(WB.undo(s, 2).steps.map((x) => x.tool), ['move-term', 'bake']);
    eq(bigStr(WB.replay(s.start, s.steps).current), bigStr(s.current), '重放结果一致');
  });
  t('定型的结果进台面：存进 scene.workbench 后重算的状态一样，步骤里有定型那一步', () => {
    const e0 = polyEqn(), b = WB.bake(two());   // 台面上的方程两边是多项式（和方程台送来的一样）
    const act = U.ExprBench.saveAction('w1', e0, b);
    eq(act.steps.map((x) => x.tool), ['move-term', 'divide', 'bake']);
    const sc = { entities: {}, links: [], clock: { t: 0, n: 0 }, workbench: { host: 'w1', key: U.ExprBench.keyOf(e0), steps: act.steps } };
    const st = U.ExprBench.stateOf(sc, 'w1', e0);
    truthy(st, '台面上的步骤应能重算');
    eq(U.ExprBench.showState(st), U.ExprBench.showState(b)); eq(st.steps.length, 3); eq(st.steps[2].tool, 'bake');
  });
  t('判题的步骤查询：定型后仍能读到定型前用过的规则，每一步保持不变量', () => {
    const sc = W.blank(), D = W.evaluate(sc), cond = (c) => U.Judge.compile(c);
    sc.workbench = { host: 'w1', steps: U.ExprBench.saveAction('w1', polyEqn(), WB.bake(two())).steps };
    eq(cond({ steps: { used: 'alg.move-term', allKept: true } })(U.Judge.makeW(sc, D, {})), true, '定型前用过移项');
    eq(cond({ steps: { used: 'alg.divide', allKept: true } })(U.Judge.makeW(sc, D, {})), true, '定型前用过两边同除');
    eq(cond({ steps: { used: 'alg.collect' } })(U.Judge.makeW(sc, D, {})), false, '没用过的规则仍然是假');
  });
}

console.log('\n' + pass + ' 通过，' + fail + ' 失败');
process.exit(fail ? 1 : 0);
