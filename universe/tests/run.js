/* node tests/run.js —— 内核测试，无依赖。 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const fsx = require('fs'), pk = (d) => fsx.readdirSync(path.join(root, d)).filter((f) => f.endsWith('.js')).sort().map((f) => d + '/' + f);
const files = ['js/core/rational.js', 'js/core/essences.js', 'js/core/kinds.js', 'js/core/kinds-more.js', 'js/core/poly.js', 'js/core/ratio.js', 'js/core/form.js', 'js/core/predict.js', 'js/core/eqn.js', 'js/core/seq.js', 'js/core/rulelib.js', 'js/core/game.js', 'js/core/prooflib.js', 'js/core/table.js', 'js/core/figure.js', 'js/core/geo.js', 'js/core/convert.js', 'js/core/registry.js', 'js/core/rules.js', 'js/core/rules-exec.js', 'js/core/workbench.js', 'js/core/digits.js', 'js/core/databench.js', 'js/core/deduce.js', 'js/core/geo-rules.js', 'js/core/world.js', 'js/core/forms.js', 'js/core/measure.js', 'js/core/kit.js', 'js/core/recorder.js', 'js/core/judge.js', 'js/core/word.js', 'js/core/events.js', 'js/core/evidence.js', 'js/core/problem.js', 'js/core/inquiry.js', 'js/core/variants.js', 'js/core/curriculum.js', 'js/core/coverage.js', 'js/core/loader.js', 'js/core/learning.js', 'js/core/session.js', 'js/core/share.js', 'js/core/review.js', 'js/core/author.js', 'js/core/macro.js'].concat(pk('packs')).concat(['problems/starter.js'], pk('problems').filter((f) => !/starter/.test(f)));
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
t('道理地图：12 个节点都有孩子看的名字和一句话，不写“本质”；箭头两头都是节点；只有“两边一样”能点进去', () => {
  for (const id of U.ESSENCE_IDS) { const k = U.ESSENCE_KID[id]; truthy(k && k.name && k.one, id + ' 缺名字或一句话'); truthy(!/本质/.test(k.name + k.one), id + ' 写了“本质”'); }
  eq(Object.keys(U.ESSENCE_KID).length, 12); eq(U.ESSENCE_ARROWS.length, 12);
  for (const [a, b] of U.ESSENCE_ARROWS) truthy(U.ESSENCE_KID[a] && U.ESSENCE_KID[b], a + '→' + b);
  eq(U.ESSENCE_IDS.filter((id) => U.ESSENCE_KID[id].open).join(), 'E4');
});
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
t('长方形 6×4 → 量图形：面积 24，4 个直角', () => {
  const sc = W.blank(); const r = W.add(sc, 'rect', 0, 0, {}); const m = W.add(sc, 'figmeasure', 0, 0, {});
  link2(sc, r, 'f', m, 'f');
  const D = W.evaluate(sc); eq(U.showVal(D[m].out.area), '24'); eq(U.showVal(D[m].out.right), '4');
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
t('数位板、天平都写了中间步骤', () => {
  const probe = (type, props, feed) => { const sc = W.blank(); const e = W.add(sc, type, 0, 0, props || {}); (feed || []).forEach(([t, p, port]) => { const f = W.add(sc, t, 0, 0, p); W.act(sc, { t: 'link', from: f, fromPort: 'v', to: e, toPort: port }); }); return W.evaluate(sc)[e].trace.steps.map((s) => s.rule); };
  const num = (n) => ['num', { n }];
  truthy(probe('digits', {}, [[...num(13), 'v']]).includes('place.carry'));
  truthy(probe('balance', {}, [[...num(3), 'L'], [...num(3), 'R']]).includes('balance.compare'));
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
t('已有器材输出方程：变量盒输出左 = 右；天平与方程操作台输出方程', () => {
  const sc = W.blank(); const v = W.add(sc, 'variable', 0, 0, { left: '2x+1', right: 'x+3', lo: -2, hi: 2 });
  const D = W.evaluate(sc); eq(U.KINDS.eqn.show(D[v].out.eq.data), '2x + 1 = x + 3');
  const sc2 = W.blank(); const b = W.add(sc2, 'balancebench', 0, 0, {});
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
t('排除表：是一种工作台（deduce）；题目 deduce-who 已经搬到推理台，有知识点 2.14b 且 lint 通过', () => {
  truthy(U.WORKBENCHES.includes('deduce'), 'WORKBENCHES 里要有 deduce');
  eq(U.types.deduce.wbUI, 'deduce'); truthy(U.WB_UIS.includes('deduce'));
  eq(U.types.deduce.workbenches, ['deduce']);
  const p = U.problems.find((x) => x.id === 'deduce-who');
  truthy(p, '有题 deduce-who'); eq(p.bench, 'logicbench', '已经搬到推理台'); eq(p.workbench, undefined); truthy(p.points.includes('2.14b'));
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
t('归纳阶梯：起点成立，每一级都能推下一级 → ④；起点没验证 → ①', () => {
  eq(lvOf(pr('induction', { rule: 0, upto: 20, base: true })), 4);
  eq(lvOf(pr('induction', { rule: 0, upto: 20, base: false })), 1);
});
t('猜想板：只记录，等级是 0 或 ①，不推翻', () => { const o = pr('conjecture_board', { ok: true }); eq(lvOf(o), 1); eq(o.refuted.data, false); });
console.log('证明器材扩充');
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
t('参数扫描器：写错的自定义规则会说明原因，不算证据', () => {
  const sc = W.blank(); const e = W.add(sc, 'scanner', 0, 0, { rule: 9, custom: '随便写', from: 1, to: 5 });
  const D = W.evaluate(sc); truthy(/规则写不对/.test(D[e].sig.map((x) => x.tx).join('|')));
});
t('归纳阶梯：指数式 1+2+…+2^(n−1) = 2^n−1 的步骤是恒等式，证到 ④', () => {
  const sc = W.blank(); const e = W.add(sc, 'induction', 0, 0, { rule: 3, upto: 30, base: true }); const o = W.evaluate(sc)[e].out;
  eq(o.identity.data, true); eq(o.lv.data.n, 4);
});
console.log('规则：多变量、后算器材的安全');
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
  const coin = W.add(sc, 'dice', 0, 0, {}), pc2 = W.add(sc, 'proofcheck', 0, 0, { want: 1 });
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
console.log('先猜后看');
t('先猜后看：填猜测记一条 guess 事件（不扣分）', () => {
  U.Events.clear();
  const sc = W.blank(), e = W.add(sc, 'primeblocks', 0, 0, { a: 36, b: 0, mode: 2 });
  W.act(sc, { t: 'set', id: e, k: 'guess', v: '4' });
  const g = U.Events.log.filter((x) => x.type === 'guess'); eq(g.length, 1); truthy(g[0].data.right === false, '36 有 9 个因数，猜 4 不对');
});
t('先猜后看：guess 声明不合法（口或属性不存在）进不了注册表', () => {
  const bad = Object.assign({}, U.types.primeblocks, { guess: { props: ['nope'], ports: ['count'], answered: () => true } });
  truthy(U.lintType(bad).errors.some((m) => /guess\.props/.test(m)));
  const bad2 = Object.assign({}, U.types.primeblocks, { guess: { props: ['guess'], ports: ['nope'], answered: () => true } });
  truthy(U.lintType(bad2).errors.some((m) => /guess\.ports/.test(m)));
});
t('质因数积木：2–1000 的 gcd、lcm、因数个数、积木块数和直接计算一致', () => {
  const gcd = (a, b) => (b ? gcd(b, a % b) : a), divs = (n) => { let c = 0; for (let i = 1; i <= n; i++) if (n % i === 0) c++; return c; };
  const bl = (n) => { let c = 0; for (let p = 2; n > 1; p++) while (n % p === 0) { n /= p; c++; } return c; };
  for (let a = 2; a <= 1000; a += 7) {
    const sc = W.blank(), e = W.add(sc, 'primeblocks', 0, 0, { a, b: 0, mode: 0 }); let o = W.evaluate(sc)[e].out;
    eq(Q.num(o.count.data), divs(a), 'count ' + a); eq(Q.num(o.blocks.data), bl(a), 'blocks ' + a);
    for (const b of [2, 12, 36, 97, 360]) {
      W.act(sc, { t: 'set', id: e, k: 'b', v: b }); o = W.evaluate(sc)[e].out; const g = gcd(a, b);
      eq(Q.num(o.gcd.data), g, 'gcd ' + a + ',' + b); eq(Q.num(o.lcm.data), a / g * b, 'lcm ' + a + ',' + b); eq(Q.num(o.rn.data) * b, a * Q.num(o.rd.data), '约分 ' + a + '/' + b);
    }
  }
});
t('质因数积木：1 没有积木（拒绝）；质数是一块；搭因数先猜才有“差几”，猜对差 0，记 guess 事件', () => {
  const sc = W.blank(), e = W.add(sc, 'primeblocks', 0, 0, { a: 36, mode: 2 });
  eq(U.lintType(U.types.primeblocks).errors, []);
  truthy(!W.act(sc, { t: 'set', id: e, k: 'a', v: 1 }).ok || W.evaluate(sc)[e].sig.some((x) => x.lv === 'reject'));
  W.act(sc, { t: 'set', id: e, k: 'a', v: 13 }); eq(W.evaluate(sc)[e].out.blocks.data.n, 1);
  W.act(sc, { t: 'set', id: e, k: 'a', v: 36 }); eq(W.evaluate(sc)[e].out.gap, undefined, '没猜没有 gap');
  U.Events.clear(); W.act(sc, { t: 'set', id: e, k: 'guess', v: '4' });
  eq(Q.num(W.evaluate(sc)[e].out.gap.data), 5); const g = U.Events.log.filter((x) => x.type === 'guess'); eq(g.length, 1); eq(g[0].data.right, false); eq(g[0].data.gap, 5);
  W.act(sc, { t: 'set', id: e, k: 'guess', v: '9' }); eq(Q.num(W.evaluate(sc)[e].out.gap.data), 0);
});
console.log('找错台');
t('错例库自检：每条的错步确实不成立，其余步骤确实成立；整份都对的确实都成立', () => {
  const errs = []; for (const C of U.BugLib.CASES) errs.push(...U.BugLib.lintCase(C)); eq(errs, []);
  truthy(U.BugLib.CASES.some((C) => C.bugAt === 0), '要有整份都对的'); truthy(U.BugLib.CASES.length >= 8);
  eq(U.lintType(U.types.findbug).errors, []);
});
t('找错台：先判断，点错行不扣分（说明为什么这行对），点对行，选理由，改对；改错再说明', () => {
  const sc = W.blank(), e = W.add(sc, 'findbug', 0, 0, { caseId: 3 });   // 解方程 3x+5=20 → 3x=25（第 2 行错）
  const out = () => W.evaluate(sc)[e], set = (k, v) => W.act(sc, { t: 'set', id: e, k, v });
  U.Events.clear(); set('claim', 2); eq(U.Events.log.filter((x) => x.type === 'guess').pop().data.right, true, '判断“有错”对');
  set('pick', 3); eq(Q.num(out().out.found.data), 0); truthy(/没有错/.test(out().sig.map((x) => x.tx).join('|')), '点错行：说明这行没有错');
  set('pick', 2); eq(Q.num(out().out.found.data), 1);
  set('reason', 2); eq(Q.num(out().out.reasonOk.data), 0); truthy(/不相等|解/.test(out().sig.map((x) => x.tx).join('|')), '理由选错：代进去给你看');
  set('reason', 1); eq(Q.num(out().out.reasonOk.data), 1);
  set('fix', '3x=24'); eq(Q.num(out().out.fixed.data), 0);
  set('fix', '3x=15'); eq(Q.num(out().out.fixed.data), 1);
  set('fix', '3x=25'); eq(Q.num(out().out.fixed.data), 0, '改回原来的错行不算');
});
t('找错台：整份都对的那份，判断“整份都对”才算；判断“有错”不算，点任何行都是“没有错”', () => {
  const sc = W.blank(), e = W.add(sc, 'findbug', 0, 0, { caseId: 6 }), set = (k, v) => W.act(sc, { t: 'set', id: e, k, v });
  set('claim', 2); eq(Q.num(W.evaluate(sc)[e].out.found.data), 0); eq(Q.num(W.evaluate(sc)[e].out.claimOk.data), 0);
  set('claim', 1); eq(Q.num(W.evaluate(sc)[e].out.found.data), 1); eq(Q.num(W.evaluate(sc)[e].out.claimOk.data), 1);
});
console.log('规则库');
t('规则库：每条规则在例子空间里既有“算”也有“不算”；三角形池 24 个且互不相同、都不退化', () => {
  const RL = U.RuleLib; truthy(RL.rules('num').length >= 15 && RL.rules('tri').length >= 6);
  for (const r of RL.rules()) { const sp = RL.space(r); truthy(sp.some((x) => r.test(x)) && sp.some((x) => !r.test(x)), r.id + ' 要两边都有'); }
  eq(RL.triPool.length, 24); eq(new Set(RL.triPool.map((x) => RL.show('tri', x))).size, 24);
});
t('规则库：说法的标准答案（总是 / 有时 / 从不）和穷举一致，三种答案都有，共 20 条以上', () => {
  const RL = U.RuleLib, cs = RL.claims(), ans = {};
  truthy(cs.length >= 20); for (const c of cs) { const T = RL.truth(c); ans[T.answer] = (ans[T.answer] || 0) + 1; eq(T.yes.length + T.no.length, c.space.items.length); }
  truthy(ans['总是'] >= 5 && ans['有时'] >= 5 && ans['从不'] >= 2, JSON.stringify(ans));
  eq(RL.truth(RL.get('c.sq-ge')).answer, '总是'); eq(RL.truth(RL.get('c.sq-ge-rat')).answer, '有时'); eq(RL.truth(RL.get('c.mod3-both')).answer, '从不');
  eq(RL.truth(RL.get('c.n2n41')).answer, '有时'); eq(RL.truth(RL.get('c.prime-odd')).answer, '有时'); eq(RL.truth(RL.get('c.sum3-mul3')).answer, '总是');
});
t('规则库：例子的读法（整数、一对数、分数、三角形）读不出来返回 null', () => {
  const RL = U.RuleLib; eq(RL.parse('int', '7'), 7); eq(RL.parse('int', '7.5'), null); eq(RL.parse('tuple', '3, 5'), [3, 5]); eq(RL.parse('tuple', '3'), null);
  eq(Q.show(RL.parse('rat', '1/2')), '1/2'); eq(RL.parse('tri', '0,0 4,0 0,3'), [[0, 0], [4, 0], [0, 3]]); eq(RL.parse('tri', '0,0 4,0'), null);
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
      act(a) { const r = W.act(s, a); if (!r.ok) throw new Error(r.why); chk(); return r; },
      U, props(id) { return s.entities[id].props; },
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
console.log('猜规则台');
t('猜规则台：先猜后记，猜错也记；猜想被反例推翻，摆出反例；对了才算猜对', () => {
  eq(U.lintType(U.types.guessrule).errors, []);
  const sc = W.blank(), e = W.add(sc, 'guessrule', 0, 0, { secret: 5 }), set = (k, v) => W.act(sc, { t: 'set', id: e, k, v }), out = (k) => Q.num(W.evaluate(sc)[e].out[k].data);
  truthy(set('ex', 4).ok && set('gs', 2).ok, '点例子再猜');   // 4 除以 3 余 1，算；我猜了不算
  eq(out('tried'), 1); eq(W.evaluate(sc)[e].props.ex, 0, '提交后选中清空');
  truthy(!set('ex', 4).ok || (set('gs', 1), out('tried') === 1), '同一个例子不重复记');
  set('hyp', 2); eq(out('solved'), 0); truthy(out('counter') > 0, '单数被推翻');
  set('hyp', 6); eq(out('solved'), 1); eq(out('lv'), 3);
});
t('猜规则台：互换，系统每次问能把候选分成两半的例子，答错被指出，最终猜出', () => {
  const sc = W.blank(), e = W.add(sc, 'guessrule', 0, 0, { secret: 0, mode: 1 }), set = (k, v) => W.act(sc, { t: 'set', id: e, k, v }), pr = () => sc.entities[e].props;
  set('mine', 9); let n = 0;   // 质数
  for (; n < 40; n++) { const q = U.GuessRule.pending(pr()); if (!q) break; const bad = set('ans', q.truth ? 2 : 1); eq(W.evaluate(sc)[e].props.msg.length > 0, true, '答错要有说明'); set('ans', q.truth ? 1 : 2); }
  eq(Q.num(W.evaluate(sc)[e].out.sysSolved.data), 1); truthy(n <= 12, '半分法用不了几个例子：' + n);
});

console.log('全部在卡片上操作（函数机一组）');
// 卡片上的按钮：从器材画出来的 SVG 里按标记找 data-pick-set，像界面一样按顺序一项一项设（一步）
const cardPick = (sc, id, attr, tag) => {
  const e = sc.entities[id], d = U.types[e.type], sz = d.size ? d.size({ props: e.props }) : [380, 300];
  const svg = d.draw({ props: e.props, w: sz[0], h: sz[1], masked: !!(d.guess && !d.guess.answered(e.props)) });
  const pos = svg.indexOf(' ' + attr + '="' + tag + '"'), st = svg.lastIndexOf('<', pos), m = pos < 0 ? null : /data-pick-set="([^"]+)"/.exec(svg.slice(st, pos));
  if (!m) throw new Error('卡片上找不到按钮 ' + attr + '=' + tag);
  const o = JSON.parse(decodeURIComponent(m[1])); for (const k of Object.keys(o)) { const r = W.act(sc, { t: 'set', id, k, v: o[k] }); if (r && r.ok === false) throw new Error('设 ' + k + ' 失败：' + r.why); }
  return o;
};
const noFill = (type) => { const d = U.types[type]; return !Object.keys(d.props).some((k) => d.props[k].write && !d.props[k].hidden); };
t('六台器材没有要在属性面板里填的属性（标题栏不再出现“✎ 填写”）', () => {
  for (const n of ['fmachine', 'guessrule', 'asn', 'newop', 'twoways', 'ptree']) truthy(noFill(n), n + ' 还有没藏起来的可写属性');
});
t('函数机：点数字卡片喂数、− / + 调猜的数、点“看看”揭开并记进表', () => {
  const sc = W.blank(), id = W.add(sc, 'fmachine', 0, 0, { secret: 0 }), p = () => sc.entities[id].props, out = (k) => Q.num(W.evaluate(sc)[id].out[k].data);
  eq(cardPick(sc, id, 'data-fm', 'n4'), { ex: '4', gv: 4 }, '点 4：喂 4，猜的数从 4 起');
  cardPick(sc, id, 'data-fm', 'p10'); cardPick(sc, id, 'data-fm', 'm1'); cardPick(sc, id, 'data-fm', 'm1'); eq(p().gv, 12, '4 + 10 − 1 − 1 = 12');
  cardPick(sc, id, 'data-fm', 'look'); eq(p().tried, '4:12:12', '看看：4 进去 12 出来，猜对'); eq(p().ex, '', '入口清空');
  let threw = false; try { cardPick(sc, id, 'data-fm', 'look'); } catch (x) { threw = true; } truthy(threw, '没喂数时“看看”点不动');
  for (const x of [1, 2]) { cardPick(sc, id, 'data-fm', 'n' + x); for (let i = 0; i < 2 * x; i++) cardPick(sc, id, 'data-fm', 'p1'); cardPick(sc, id, 'data-fm', 'look'); }
  eq(out('streak'), 3); W.act(sc, { t: 'set', id, k: 'hyp', v: 1 }); eq(out('solved'), 1, '连续猜对 3 次，点“× 3”通关');
  const svg = U.types.fmachine.draw({ props: p(), w: 380, h: 340 }); truthy(svg.indexOf('>1<') < svg.indexOf('>2<') && svg.includes('2 → 6'), '喂过的数自动排成表、写出上一个');
});
t('函数机四联动：情境分段按钮、k / b 的 − +、表格两格的 − +、图上两个把手', () => {
  const sc = W.blank(), id = W.add(sc, 'fmachine', 0, 0, { view: 1, story: 0, k: 1, b: 0, y0: 0, y1: 1 }), p = () => sc.entities[id].props;
  cardPick(sc, id, 'data-fm', 'story2'); eq(p().story, 2);
  cardPick(sc, id, 'data-fm', 'kp'); cardPick(sc, id, 'data-fm', 'bp'); eq([p().k, p().b, p().y0, p().y1], [2, 1, 1, 3], 'k、b 各加 1，表格跟着变');
  cardPick(sc, id, 'data-fm', 'y1p'); eq([p().k, p().b], [3, 1], '表格 x = 1 那格加 1：k 变成 3');
  const gs = U.types.fmachine.grips({ props: p(), w: 380, h: 330 }); eq(gs.map((g) => g.id), ['b', 'k1']);
  const c0 = { props: p(), w: 380, h: 330 }, Y = (v) => gs[0].y + (1 - v) * (gs[0].y - gs[1].y) / (4 - 1);   // b 点在 y = 1，k1 点在 y = 4
  eq(gs[0].drag(c0, { x: 0, y: Y(5) }), { b: 5, y0: 5, y1: 8 }, '把 x = 0 的点拖到 5：b = 5');
  eq(gs[1].drag(c0, { x: 0, y: Y(7) }), { k: 6, y0: 1, y1: 7 }, '把 x = 1 的点拖到 7：k = 6');
  eq(U.types.fmachine.grips({ props: Object.assign({}, p(), { view: 0 }), w: 380, h: 340 }), [], '机器那一面没有把手');
});
t('总是有时从不：例子都摆在卡片上，点一下就试；一对数排成方格表，太多时先点第 1 个再点第 2 个', () => {
  const ci = (cid) => U.RuleLib.claims().findIndex((c) => c.id === cid);
  let sc = W.blank(), id = W.add(sc, 'asn', 0, 0, { claim: ci('c.n2n41') });
  cardPick(sc, id, 'data-asn', '40'); eq(sc.entities[id].props.tested, '40'); eq(Q.num(W.evaluate(sc)[id].out.counter.data), 1, '点 40：反例');
  sc = W.blank(); id = W.add(sc, 'asn', 0, 0, { claim: ci('c.mul-bigger') }); cardPick(sc, id, 'data-asn', '3,0'); eq(sc.entities[id].props.tested, '3,0', '方格表里点 (3, 0)');
  sc = W.blank(); id = W.add(sc, 'asn', 0, 0, { claim: ci('c.mul-gt1-bigger') }); cardPick(sc, id, 'data-asn', 'a:1/2'); eq(sc.entities[id].props.pa, '1/2');
  cardPick(sc, id, 'data-asn', '1/2,3/2'); eq(sc.entities[id].props.tested, '1/2,3/2', '先点 1/2，再点 3/2');
});
t('换一种运算：点表里一格试交换律，点三个数试结合律', () => {
  const sc = W.blank(), id = W.add(sc, 'newop', 0, 0, { op: 4 }), p = () => sc.entities[id].props;
  cardPick(sc, id, 'data-nw', 'c1-2'); eq(p().tried, '1,2'); truthy(p().msg.includes('反例'));
  cardPick(sc, id, 'data-nw', 't0'); cardPick(sc, id, 'data-nw', 't1'); eq(p().abc, '0,1'); cardPick(sc, id, 'data-nw', 't2');
  eq([p().abc, p().tried], ['', '1,2;0,1,2'], '点满三个数就试一次结合律');
  cardPick(sc, id, 'data-nw', 't3'); cardPick(sc, id, 'data-nw', 'clr'); eq(p().abc, '', '清空');
});
t('树状图：在卡片上点一个概率先猜，点“树 / 面积 / 都要”换看法', () => {
  const sc = W.blank(), id = W.add(sc, 'ptree', 0, 0, { exp: 0, ev: 1 }), p = () => sc.entities[id].props;
  truthy(U.types.ptree.draw({ props: p(), w: 380, h: 322, masked: true }).includes('在下面一排里点一个'), '没猜时提示在卡片上点');
  cardPick(sc, id, 'data-pt', 'g6'); eq(p().gans, '1/2'); cardPick(sc, id, 'data-pt', 'v1'); eq(p().view, 1);
  W.act(sc, { t: 'set', id, k: 'tg', v: 2 }); W.act(sc, { t: 'set', id, k: 'tg', v: 3 }); eq(Q.num(W.evaluate(sc)[id].out.guessed.data), 1);
});

console.log('对手与游戏');
t('取石子：穷举的必胜判断和 n mod (k+1) 一致；最好的走法留下 (k+1) 的倍数；“取到最后的输”的表也对', () => {
  for (let k = 2; k <= 5; k++) { const tr = U.Games.nimTruth(30, k, false); for (let n = 0; n <= 30; n++) eq(tr[n], n % (k + 1) === 0 ? 'L' : 'W', 'k=' + k + ' n=' + n); }
  const g = U.Games.nimGame(3, false); for (let n = 1; n <= 20; n++) { const b = U.Game.best(g, { pile: n, turn: 0, by: 1 }); if (b.win) eq((n - b.move) % 4, 0, 'n=' + n); }
  const tm = U.Games.nimTruth(12, 3, true); eq(tm[1], 'L'); eq(tm[2], 'W'); eq(tm[5], 'L');   // 取最后一颗的输：剩 1 颗必败，剩 4k+1 必败
});
t('对手：难度 2 总走最好的；难度 0 / 1 同一个局面同一个 seed 走法不变；难度 1 有时走错', () => {
  const g = U.Games.nimGame(3, false), st = { pile: 10, turn: 0, by: 1 };
  for (let sd = 0; sd < 20; sd++) eq(U.Game.opponent(g, st, 2, sd), 2);
  eq(U.Game.opponent(g, st, 1, 5), U.Game.opponent(g, st, 1, 5));
  let bad = 0; for (let sd = 0; sd < 200; sd++) if (U.Game.opponent(g, st, 1, sd) !== 2) bad++;
  truthy(bad > 20 && bad < 120, '难度 1 大约三成走错：' + bad);
});
t('汉诺塔：最少步数是 2ⁿ − 1；按递归搬法搬完正好是最少，多走一步就不是最少', () => {
  const hanoi = (n, a, b, c, out) => { if (!n) return; hanoi(n - 1, a, c, b, out); out.push([a, c]); hanoi(n - 1, b, a, c, out); };
  for (let n = 1; n <= 7; n++) {
    const sc = W.blank(), e = W.add(sc, 'hanoi', 0, 0, { n }), set = (k, v) => W.act(sc, { t: 'set', id: e, k, v }), mv = []; hanoi(n, 1, 2, 3, mv);
    for (const [a, b] of mv) { truthy(set('mv', a).ok); truthy(set('mv', b).ok); }
    const o = W.evaluate(sc)[e].out; eq(Q.num(o.min.data), 2 ** n - 1); eq(Q.num(o.moves.data), 2 ** n - 1); eq(Q.num(o.optimal.data), 1);
  }
  const sc = W.blank(), e = W.add(sc, 'hanoi', 0, 0, { n: 2 }), set = (k, v) => W.act(sc, { t: 'set', id: e, k, v });
  set('mv', 1); set('mv', 2); set('mv', 1); set('mv', 2); eq(sc.entities[e].props.msg, '大盘不能压在小盘上'); eq(sc.entities[e].props.moves, 1);
});
t('一笔画：possible 和“奇点 0 或 2 个且连通”一致，并且和穷举走法一致（图库 5 张图）', () => {
  const GL = U.Games.GRAPHS; eq(GL.map((g, i) => { const sc = W.blank(), e = W.add(sc, 'euler', 0, 0, { graph: i }), E = U.Games.edgesOf(sc.entities[e].props), st = U.Games.eulerStats(g.v.length, E); return [st.possible, U.Games.findPath(g.v.length, E) ? 1 : 0, st.odd]; }), [[1, 1, 2], [0, 0, 4], [0, 0, 4], [1, 1, 0], [1, 1, 2]]);
  const sc = W.blank(), e = W.add(sc, 'euler', 0, 0, { graph: 2, mode: 1 }), set = (k, v) => W.act(sc, { t: 'set', id: e, k, v });
  set('go', 2); set('go', 3); eq(Q.num(W.evaluate(sc)[e].out.possible.data), 1); eq(Q.num(W.evaluate(sc)[e].out.odd.data), 2);
});
t('卡片上操作（游戏一组）：属性全藏起来，不出“✎ 填写”；卡片上的按钮改出来的属性对', () => {
  for (const ty of ['nim', 'hanoi', 'euler', 'net', 'cubes', 'primeblocks']) { const d = U.types[ty]; eq(Object.keys(d.props).filter((k) => d.props[k].write && !d.props[k].hidden), [], ty + ' 没有给孩子填的属性'); }
  // 汉诺塔：换盘数重新摆、先猜重来、表留着；搬完“记进表里”把步数写进那一格
  let sc = W.blank(), e = W.add(sc, 'hanoi', 0, 0, { n: 2 }); const set = (k, v) => W.act(sc, { t: 'set', id: e, k, v }), P = () => sc.entities[e].props;
  set('gd', 3); set('gmin', 3); set('t1', 1); set('mv', 1); set('mv', 2); set('mv', 1); set('mv', 3); set('mv', 2); set('mv', 3);
  eq(P().moves, 3); set('rec', 1); eq([P().t2, P().rec], [3, 0]);
  set('n', 3); eq([P().pegs, P().moves, P().gmin, P().gd, P().t1, P().t2], ['321;;', 0, 0, 0, 1, 3]);
  set('rec', 1); eq(P().t3, 0, '没搬完不能记');
  // 展开图：第一次点“能 / 不能”就是先猜，记 guess 事件；自己拼的图形只记先猜，不记进 35 种的回答
  U.Events.clear(); sc = W.blank(); const n = W.add(sc, 'net', 0, 0, {}); W.act(sc, { t: 'set', id: n, k: 'say', v: 2 });
  eq([sc.entities[n].props.gans, sc.entities[n].props.ans[0]], [2, '2']); eq(U.Events.log.filter((x) => x.type === 'guess').length, 1);
  W.act(sc, { t: 'set', id: n, k: 'say', v: 1 }); eq(sc.entities[n].props.gans, 2, '先猜只记第一次');
  const n2 = W.add(sc, 'net', 0, 0, { cells: '' }); for (const v of [2, 7, 8, 9, 10, 14]) W.act(sc, { t: 'set', id: n2, k: 'cell', v });
  W.act(sc, { t: 'set', id: n2, k: 'say', v: 1 }); eq([sc.entities[n2].props.gans, sc.entities[n2].props.ans], [1, '']);
  // 小方块：换目标清空底板，先猜重来
  const cu = W.add(sc, 'cubes', 0, 0, { tgt: 0 }); W.act(sc, { t: 'set', id: cu, k: 'gcnt', v: 4 }); W.act(sc, { t: 'set', id: cu, k: 'put', v: 3 }); W.act(sc, { t: 'set', id: cu, k: 'tgt', v: 1 });
  eq([sc.entities[cu].props.h, sc.entities[cu].props.gcnt], ['0'.repeat(16), 0]);
});

console.log('证明排序');
t('证明库：每条证明合格（需要的步骤都存在、没有环、每步都被用到、依据在选项里、有干扰卡）', () => { const errs = []; for (const p of U.ProofLib.all()) errs.push(...U.ProofLib.lint(p)); eq(errs, []); truthy(U.ProofLib.all().length >= 4); });
t('证明排序：顺序颠倒会指出“用到的还没出现”；放干扰卡被指出；排对且依据对才 ok', () => {
  const sc = W.blank(), e = W.add(sc, 'proofsort', 0, 0, { pid: 0 }), set = (k, v) => W.act(sc, { t: 'set', id: e, k, v }), P = U.ProofLib.get('odd-odd-even'), C = U.Proofsort.cardsOf(P), idx = (id) => C.findIndex((c) => c.id === id) + 1;
  set('add', idx('s3')); let J = U.Proofsort.judge(sc.entities[e].props); eq(J.orderOk, false); truthy(J.notes[0].includes('还没有出现'));
  set('del', 1); set('add', idx('d2')); J = U.Proofsort.judge(sc.entities[e].props); eq(J.dist, 1); truthy(J.notes[0].includes('循环论证'));
  set('del', 1); P.steps.forEach((st, i) => { set('add', idx(st.id)); set('rr', i * 10 + P.rules.indexOf(st.rule) + 1); });
  eq(Q.num(W.evaluate(sc)[e].out.ok.data), 1); eq(Q.num(W.evaluate(sc)[e].out.lv.data), 4);
  set('rr', 0 * 10 + 1 + 1); eq(Q.num(W.evaluate(sc)[e].out.ok.data), 0);   // 第一步的依据改错
});

console.log('逼近器');
t('逼近器：取一半第 n 步的差精确等于 1/2ⁿ；0.999… 的差是 1/10ⁿ；割圆的上下界夹住 π、每次翻倍区间缩小；√2 的区间端点是精确分数且夹住 √2', () => {
  const A = U.Approach; for (let n = 0; n <= 12; n++) { eq(Q.show(A.at(0, n).gap), Q.show(Q(1, 2 ** n))); eq(Q.show(A.at(2, n).gap), Q.show(Q(1, 10 ** n))); }
  let prev = 9; for (let n = 0; n <= 8; n++) { const a = A.at(1, n), lo = Q.num(a.lo), hi = Q.num(a.hi); truthy(lo < Math.PI && Math.PI < hi, '割圆 n=' + n); truthy(hi - lo < prev); prev = hi - lo; }
  for (let n = 0; n <= 15; n++) { const a = A.at(3, n); truthy(Q.num(a.lo) <= Math.SQRT2 && Math.SQRT2 <= Q.num(a.hi)); eq(Q.show(a.gap), Q.show(Q(1, 2 ** n))); truthy(Q.cmp(Q.mul(a.lo, a.lo), Q(2)) < 0 && Q.cmp(Q.mul(a.hi, a.hi), Q(2)) > 0); }
  eq(A.stepsFor(2, Q(1, 1000000)), 7); eq(A.stepsFor(0, Q(1, 1000)), 10);
});

console.log('钉板');
t('钉板：随机 200 个格点多边形，独立数出的 B、I 和鞋带公式的面积满足皮克公式；内置 60 个多边形都简单', () => {
  const GB = U.Geoboard; let seed = 12345, n = 0; const rnd = (m) => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % m; };
  while (n < 200) { const k = 3 + rnd(3), P = []; for (let i = 0; i < k; i++) P.push([rnd(7), rnd(7)]); if (!GB.simple(P)) continue; const c = GB.count(P); eq(c.A2, 2 * c.I + c.B - 2, JSON.stringify(P)); n++; }
  truthy(GB.TEST.length >= 50 && GB.TEST.every((P) => GB.simple(P)));
  eq(GB.simple([[0, 0], [2, 2], [2, 0], [0, 2]]), false);   // 蝴蝶结，边交叉
});

console.log('改规则的世界');
t('出租车圆：r=1..5 都是 4r 个路口；A(0,0)B(2,2) 的等距集合是一片区域（>11 个）', () => {
  const WI = U.WhatIf; for (let r = 1; r <= 5; r++) eq(WI.tTruth({ mode: 0, r, pair: 0 }).length, 4 * r);
  truthy(WI.tTruth({ mode: 1, r: 1, pair: 1 }).length > 11); eq(WI.tTruth({ mode: 1, r: 1, pair: 0 }).length, 11);
});
t('球面三角形：北极+赤道 0°/90° 三个直角、内角和 270；三点共大圆无三角形', () => {
  const WI = U.WhatIf, J = WI.sJudge({ pts: '0,1,2' }); eq(J.sum, 270); eq(J.exact, true); eq(J.angles.join(), '90,90,90');
  eq(WI.sJudge({ pts: '1,2,3' }).degenerate, true);
  for (const p of ['0,5,6', '5,6,7', '8,9,0', '1,6,9']) { const j = WI.sJudge({ pts: p }); if (j.ok) truthy(j.sum > 180 && j.sum < 540); }
});
t('换一种运算：5 张表的交换律/结合律/单位元/逆元与已知结论一致', () => {
  const WI = U.WhatIf, T = WI.OPS.map((o) => WI.nTruth(o));
  eq(T[0].comm && T[0].assoc && T[0].hasId && T[0].inv, true);     // 模 5 加法是群
  eq(T[1].comm && T[1].assoc && T[1].hasId, true); eq(T[1].inv, false);   // 模 6 乘法没有逆元
  eq(T[2].comm && T[2].assoc && T[2].hasId && !T[2].inv, true);
  eq(T[3].comm, true); eq(T[3].assoc, false);                     // |a−b| 不满足结合律
  eq(T[4].comm, false); eq(T[4].assoc, false); eq(T[4].hasId, false);
});

console.log('海龟作图');
t('海龟：正方形、三角形（转 120°）闭合且共转 360°；转 60° 不闭合；五角星共转 720° 且画对；左右镜像也算对', () => {
  const T = U.Turtle, sq = T.run('T4;F100;R90;E'); eq(sq.closed, true); eq(sq.turned, 360);
  eq(T.run('T3;F100;L120;E').closed, true); eq(T.run('T3;F100;L60;E').closed, false);
  const st = T.run('T5;F100;L144;E'); eq(st.closed, true); eq(st.turned, 720);
  eq(T.same(T.sig(T.run('T5;F100;L144;E').pts), T.sig(T.run('T5;F100;R144;E').pts)), true);
  eq(T.same(T.sig(sq.pts), T.sig(T.run('T6;F100;L60;E').pts)), false);
  for (let n = 3; n <= 12; n++) { if (360 % n === 0) { const r = T.run('T' + n + ';F50;L' + (360 / n) + ';E'); eq(r.closed, true); eq(r.turned, 360); } }
  eq(T.parse([{ c: 'T', v: 2 }]).err !== '', true);
});

console.log('展开图和小方块');
t('展开图：六连方共 35 种，恰好 11 种能折成正方体；田字加两格不能折；每个能折的展开图 6 个面各出现一次', () => {
  const SN = U.SolidNet; eq(SN.HEX.length, 35); const ok = SN.HEX.filter((c) => SN.fold(c).foldable); eq(ok.length, 11);
  SN.HEX.forEach((c) => eq(SN.connected(c), true));
  ok.forEach((c) => eq(SN.fold(c).face.slice().sort().join(), '0,1,2,3,4,5'));
  eq(SN.fold([[0, 0], [1, 0], [0, 1], [1, 1], [2, 0], [3, 0]]).foldable, false);
  eq(SN.fold([[0, 0], [1, 0], [2, 0], [3, 0], [1, 1], [1, -1]].map(([x, y]) => [x, y + 1])).foldable, true);   // 1-4-1 型
});
t('小方块：单块表面积 6；拿掉角上的方块表面积不变；三个目标有解且最少 ≤ 最多', () => {
  const SN = U.SolidNet, h = '1000000000000000'.split('').map(Number); eq(SN.surface(h), 6);
  const a = '1100000000000000'.split('').map(Number), b = '2100000000000000'.split('').map(Number); eq(SN.surface(a), 10); eq(SN.surface(b), 14);
  SN.TGT.forEach((t, i) => { const r = SN.range(i); truthy(r[0] <= r[1]); const V = SN.views(t.split('').map(Number)); truthy(r[0] <= t.split('').map(Number).reduce((x, y) => x + y, 0) && r[1] >= t.split('').map(Number).reduce((x, y) => x + y, 0)); });
});

console.log('尺规作图');
t('尺规：标准作法 4 个位置都成立；凭眼睛放的点只在原位置成立；半径不相等的作法不成立', () => {
  const C = U.Compass, J = (task, st) => C.judge({ task, steps: st });
  eq(J(0, 'c:0,1;c:1,0;m:0,1,0;m:0,1,1;l:2,3').ok, 1); eq(J(1, 'c:0,1;c:1,0;m:0,1,0').ok, 1);
  const e = J(0, 'f:0,3;f:0,-3;l:2,3'); eq(e.first, 1); eq(e.ok, 0); truthy(e.passed < 4);
  eq(J(0, 'c:0,1;c:1,1;m:0,1,0;m:0,1,1;l:2,3').ok, 0);      // 第二个圆的半径是 0（圆心和圆上点同一个）
  eq(J(0, 'c:0,1;c:1,0;m:0,1,0;l:0,2').ok, 0);
  for (const m of C.MAPS) eq(C.passTask(0, ['c:0,1', 'c:1,0', 'm:0,1,0', 'm:0,1,1', 'l:2,3'], m), true);
});

console.log('两种解法对照');
t('两种解法：每道题左右各 4 项，值随 n 一一对应且互不重复；连对判对错与是否为对应项一致', () => {
  const T = U.TwoWays; T.SCN.forEach((sc, k) => { for (let l = 0; l < 4; l++) { const m = [0, 1, 2, 3].filter((r) => T.NS.every((n) => sc.lv[l](n) === sc.rv[r](n))); eq(m, [l]); }
    eq(sc.perm.slice().sort().join(), '0,1,2,3');
    eq(T.judge({ sc: k, pairs: '0-0;1-1;2-2;3-3', disc: 1 }).all, 1); eq(T.judge({ sc: k, pairs: '0-1;1-0', disc: 0 }).wrong, 2); });
});

console.log('最优化、缩放、概率树');
t('最优化：围篱笆最大在 5（25）、靠墙最大在 5（50）、将军饮马最短在 3（6√2）', () => {
  const O = U.Optimize; eq(O.bestX(0), 5); eq(O.val(0, 5), 25); eq(O.bestX(1), 5); eq(O.val(1, 5), 50);
  eq(O.bestX(2), 3); truthy(Math.abs(O.val(2, 3) - 6 * Math.SQRT2) < 1e-9);
});
t('缩放：边长放大 k 倍，周长 k 倍、面积 k² 倍、体积 k³ 倍', () => {
  const S = U.ScaleLab; for (const k of ['2', '3', '1/2', '5/2']) { const J = S.sJudge({ k, shape: 0, gans: '' }), q = Q.parse(k); eq(Q.cmp(J.perim, q), 0); eq(Q.cmp(J.area, Q.mul(q, q)), 0); }
});
t('概率树：每个实验所有路径的概率之和是 1', () => {
  const PT = U.PTree; PT.EXPS.forEach((E) => { let tot = Q(0); PT.pathsOf(E).forEach((x) => { tot = Q.add(tot, x.p); }); eq(Q.cmp(tot, Q(1)), 0, E.name); });
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
  t('数字卡连到文字属性：分数写成 1/3，不是乱码（估一估的两个数是文字属性）', () => {
    const s = W.blank(), n1 = W.act(s, { t: 'add', type: 'num', x: 0, y: 0, props: { n: 1, d: 3 } }).id, n2 = W.act(s, { t: 'add', type: 'num', x: 0, y: 0, props: { n: 3, d: 4 } }).id;
    const f = W.act(s, { t: 'add', type: 'estbench', x: 0, y: 0, props: { op: 2 } }).id;
    truthy(W.act(s, { t: 'link', from: n1, fromPort: 'v', to: f, toPort: 'p.a' }).ok, '第一个数的口能连');
    truthy(W.act(s, { t: 'link', from: n2, fromPort: 'v', to: f, toPort: 'p.b' }).ok, '第二个数的口能连');
    const D = W.evaluate(s); eq(D[f].props.a, '1/3', '第一个数收到 1/3'); eq(D[f].props.b, '3/4', '第二个数收到 3/4');
  });
  t('大一点的数：十进制和很大的整数精确读入，数字卡分子分母放宽', () => {
    eq(U.Q.show(U.Q.parse('12345678901234567890')), '12345678901234567890', '20 位整数不丢位');
    eq(U.Q.show(U.Q.parse('0.123456789')), '123456789/1000000000', '9 位小数不被舍入');
    eq(U.Q.show(U.Q.parse('-2.5')), '-5/2', '负小数');
    const s = W.blank(), n = W.act(s, { t: 'add', type: 'num', x: 0, y: 0, props: { n: 999999999, d: 999999 } });
    truthy(n.ok, '分子 999999999、分母 999999 的数字卡能放'); eq(U.Q.show(W.evaluate(s)[n.id].out.v.data), '1001001/1001', '约分以后的值（公因数 999）');
  });
}

console.log('方程与不等式（packs/equation.js）：一种“方程”、一种“解集”，每台器材只做一件事');
{
  const mk = () => {
    const s = W.blank(), add = (type, props) => { const r = W.act(s, { t: 'add', type, x: 0, y: 0, props }); if (!r.ok) throw new Error(type + '：' + r.why); return r.id; };
    const link = (a, b, tp, fp) => { const r = W.act(s, { t: 'link', from: a, to: b, toPort: tp, fromPort: fp }); if (!r.ok) throw new Error('连线 ' + tp + '：' + r.why); };
    return { s, add, link };
  };
  const show = (v) => U.showVal(v);
  const solved = (text, props) => { const m = mk(), e = m.add('eqcard', { text }), so = m.add('solve', props || {}); m.link(e, so, 'eq', 'eq'); const D = W.evaluate(m.s)[so]; return { set: D.out.set && show(D.out.set), x: D.out.x && show(D.out.x), sig: D.sig.map((g) => g.tx).join('|') }; };
  t('解：一次方程、不等式、二次方程（精确根）、恒等式、无解', () => {
    eq(solved('2x + 1 = 7').set, 'x = 3'); eq(solved('2x + 1 = 7').x, '3');
    eq(solved('3x - 5 >= x + 1').set, 'x ≥ 3'); eq(solved('2x + 1 > 7').set, 'x > 3');
    eq(solved('-2x < 6').set, 'x > −3', '两边除以负数，不等号反向');
    eq(solved('x^2 - 5x + 6 = 0').set, 'x = 2 或 x = 3'); eq(solved('x^2 - 2 = 0').set, 'x = −√2 或 x = √2');
    eq(solved('x^2 - 2x + 1 = 0').set, 'x = 1', '两个根相同只留一个'); eq(solved('x^2 = -1').set, '无解');
    eq(solved('x + 1 = x + 1').set, 'x 取任何数都行'); eq(solved('x + 1 = x + 2').set, '无解');
  });
  t('解：不会解的只提示、不报错、没有输出；字母名对不上时自动用方程里唯一的字母', () => {
    const a = solved('x^3 = 2'); eq(a.set, 'x ≈ 1.259921', '∛2 没法精确写，用数值求近似根');
    const b = solved('x + y = 3'); truthy(!b.set && b.sig.includes('y'), b.sig);
    eq(solved('2t + 1 = 7').x, '3', '只有一个字母 t，自动用 t');
  });
  t('方程卡：整行写方程；没有等号、两个等号、写不出的式子都被拒绝并说明原因', () => {
    for (const [txt, why] of [['2x + 1', '等号'], ['1 < x < 3', '只能有一个'], ['2x + = 7', '']]) {
      const m = mk(), e = m.add('eqcard', {}), r = W.act(m.s, { t: 'set', id: e, k: 'text', v: txt }); truthy(!r.ok, txt + ' 应该被拒绝'); truthy(r.why.includes(why), r.why);
    }
    const m = mk(), e = m.add('eqcard', { text: '3x−5≥x+1' }); eq(show(W.evaluate(m.s)[e].out.eq), '3x − 5 ≥ x + 1', '全角符号也认');
  });
  t('验根：代进去看成不成立（等式和不等式），给出左 − 右', () => {
    const chk = (text, n) => { const m = mk(), e = m.add('eqcard', { text }), k = m.add('num', { n }), c = m.add('eqcheck', {}); m.link(e, c, 'eq', 'eq'); m.link(k, c, 'x', 'v'); const o = W.evaluate(m.s)[c].out; return [o.ok.data, show(o.gap)]; };
    eq(chk('2x + 1 = 7', 3).join(), 'true,0'); eq(chk('2x + 1 = 7', 4).join(), 'false,2');
    eq(chk('2x + 1 > 7', 3).join(), 'false,0', '3 取不到'); eq(chk('2x + 1 > 7', 4).join(), 'true,2'); eq(chk('2x + 1 >= 7', 3).join(), 'true,0');
  });
  t('解集能自动变成数、区间：接读数器、解集数轴；旧的“解集（区间）”口也能接新数轴', () => {
    const m = mk(), e = m.add('eqcard', { text: '3x - 5 >= x + 1' }), so = m.add('solve', {}), ax = m.add('numline_iv', { probe: 4 }), me = m.add('meter', {});
    m.link(e, so, 'eq', 'eq'); m.link(so, ax, 'iv', 'set'); m.link(so, me, 'v', 'set');
    const D = W.evaluate(m.s); eq(D[ax].out.inside.data, true); truthy(!D[me].out.v, '区间不能变成一个数，读数器不该有值');
    const m2 = mk(), e2 = m2.add('eqcard', { text: 'x^2 - 5x + 6 = 0' }), s2 = m2.add('solve', {}), a2 = m2.add('numline_iv', { probe: 2 }), a3 = m2.add('numline_iv', { probe: 4 });
    m2.link(e2, s2, 'eq', 'eq'); m2.link(s2, a2, 'iv', 'set'); const o = W.evaluate(m2.s)[a2].out; eq(o.inside.data, true, '2 是根'); a3 && m2.link(s2, a3, 'iv', 'set'); eq(W.evaluate(m2.s)[a3].out.inside.data, false, '4 不是根');
    const m3 = mk(), l = m3.add('algebra', { text: '2x+1' }), r = m3.add('algebra', { text: '7' }), ed = m3.add('eqdesk', { rel: 2 }), a4 = m3.add('numline_iv', { probe: 4 });
    m3.link(l, ed, 'L', 'p'); m3.link(r, ed, 'R', 'p'); m3.link(ed, a4, 'iv', 'iv'); eq(W.evaluate(m3.s)[a4].out.inside.data, true, '旧方程台的区间口接新数轴');
  });
  t('旧的方程台、方程组台、解方程、不等式不再放在器材架上，但旧存档里的它们照样能算', () => {
    for (const n of ['eqdesk', 'system2', 'linsolve', 'ineq']) { truthy(U.types[n].hidden === true, n + ' 应该隐藏'); }
    const m = mk(), l = m.add('algebra', { text: 'x+1' }), r = m.add('algebra', { text: '3' }), ed = m.add('eqdesk', {}); m.link(l, ed, 'L', 'p'); m.link(r, ed, 'R', 'p'); eq(show(W.evaluate(m.s)[ed].out.x), '2');
  });
  t('每道题的器材架里不能有被隐藏的器材（学生拖不出来就做不了题）', () => {
    const OLD = ['eqdesk', 'system2', 'linsolve', 'ineq'];   // 被新方程器材取代的旧器材
    for (const p of U.problems) for (const ty of p.shelf || []) { truthy(U.types[ty], p.id + ' 的器材架里有不存在的器材 ' + ty); truthy(!OLD.includes(ty), p.id + ' 的器材架里还有被取代的旧器材 ' + ty); }
  });
  t('卡片尺寸：每台器材的卡片都容得下所有的口（高）和口旁边的文字（宽）', () => {
    const C = U.CARD;
    for (const [n, d] of Object.entries(U.types)) {
      if (d.workspaceRole !== 'none' || d.sizeFixed) continue;
      const outs = Object.fromEntries(Object.entries(d.outputs).filter(([, o]) => !o.rec));   // 记录仪的口只在开了记录仪时画（那时卡片高得多）
      const sz = d.size({ props: U.defaultProps(d) }), np = Math.max(Object.keys(d.inputs).length, Object.keys(outs).length);
      if (np) truthy(sz[1] >= C.PORT_Y0 + (np - 1) * C.PORT_DY + C.PAD_BOTTOM, n + ' 卡片太矮：' + sz[1] + '，有 ' + np + ' 个口');
      const lab = (o) => Math.min(C.LABEL_MAXCH, Math.max(0, ...Object.values(o).map((p) => String(p.label).length)));
      const side = (o) => (Object.keys(o).length ? C.LABEL_X + lab(o) * C.LABEL_CHAR : 0);
      if (np) truthy(sz[0] >= side(d.inputs) + (d.compactPorts ? 0 : side(outs)) + C.BODY_MIN_W, n + ' 卡片太窄：' + sz[0]);
    }
  });
}

console.log('扫描（packs/sweep.js）：让一个量变化，把每一步的结果收成表');
{
  const mk = () => {
    const s = W.blank(), add = (type, props) => { const r = W.act(s, { t: 'add', type, x: 0, y: 0, props }); if (!r.ok) throw new Error(r.why); return r.id; };
    const link = (a, b, tp, fp) => { const r = W.act(s, { t: 'link', from: a, to: b, toPort: tp, fromPort: fp }); if (!r.ok) throw new Error(r.why); };
    return { s, add, link };
  };
  // y = x² − 4x：x 从 −2 到 6，每次 1/2（17 个点）
  const parabola = (sweepProps, tabProps) => {
    const m = mk(), x = m.add('sweepx', sweepProps), mul = m.add('op', { op: 2 }), sub = m.add('op', { op: 1 }), four = m.add('num', { n: 4 }), m4 = m.add('op', { op: 2 }), tab = m.add('sweeptab', tabProps || {});
    m.link(x, mul, 'a', 'x'); m.link(x, mul, 'b', 'x'); m.link(x, m4, 'a', 'x'); m.link(four, m4, 'b', 'v'); m.link(mul, sub, 'a', 'r'); m.link(m4, sub, 'b', 'r');
    m.link(x, tab, 'x', 'x'); m.link(sub, tab, 'y', 'r');
    return Object.assign(m, { x, tab });
  };
  const show = (v) => U.showVal(v);
}

console.log('解集的并交补与高次不等式（js/core/eqn.js、packs/equation.js）');
{
  const sol = (text0) => { const text = text0.replace('>=', '≥').replace('<=', '≤'); const r = U.Eqn.solve(U.Eqn.make ? (() => { const i = text.search(/[<>≤≥=]/); const rel = /[≤≥]/.test(text[i]) ? text[i] : text[i]; return U.Eqn.make(U.Poly.parse(text.slice(0, i)), U.Poly.parse(text.slice(i + 1)), rel); })() : null, 'x'); return r.kind === 'ok' ? U.Solset.show(r.set) : 'ERR ' + r.why; };
  t('二次不等式：符号表给出两段、一段、全体、无解、一点', () => {
    eq(sol('x^2-x-6>0'), 'x < −2 或 x > 3'); eq(sol('x^2-x-6≤0'), '−2 ≤ x ≤ 3'); eq(sol('x^2-x-6<0'), '−2 < x < 3');
    eq(sol('x^2>=0'), 'x 取任何数都行'); eq(sol('x^2<0'), '无解'); eq(sol('(x-1)^2<=0'), 'x = 1'); eq(sol('(x-1)^2>0'), 'x < 1 或 x > 1');
    eq(sol('-x^2+1>0'), '−1 < x < 1');
  });
  t('二次不等式：根是根号时端点也精确写出', () => {
    eq(sol('x^2-2<0'), '−√2 < x < √2'); eq(sol('x^2-2>=0'), 'x ≤ −√2 或 x ≥ √2');
  });
  t('三次及以上：有有理根就能解（方程和不等式）；没有有理根只提示', () => {
    eq(sol('x^3-6x^2+11x-6=0'), 'x = 1 或 x = 2 或 x = 3'); eq(sol('x^3=1'), 'x = 1');
    eq(sol('x^3-x>=0'), '−1 ≤ x ≤ 0 或 x ≥ 1'); eq(sol('x^3-6x^2+11x-6<0'), 'x < 1 或 2 < x < 3');
    eq(sol('(x-1)^2*(x+2)>0'.replace('*', '')), '-2 < x < 1 或 x > 1'.replace('-2', '−2'));
    eq(sol('x^3=2'), 'x ≈ 1.259921', '没有有理根的三次：数值求近似根（标 ≈）');
    eq(sol('x^3-3x+1>0'), '≈−1.879385 < x < ≈0.347296 或 x > ≈1.532089', '三次不等式的端点也是近似根');
    eq(sol('x^4+x^2+1=0'), '无解', 'x⁴ + x² + 1 没有实根');
    eq(sol('x^4-5x^2+6=0'), 'x = −√3 或 x = −√2 或 x = √2 或 x = √3', '分成两个二次因式，根是精确的根号');
    eq(sol('x^4+4x^2-5=0'), 'x = −1 或 x = 1');
    eq(sol('x^4-5x^2+4=0'), 'x = −2 或 x = −1 或 x = 1 或 x = 2');
  });
  t('解集的交、并、补：不等式组、至少一个成立、之外', () => {
    const S = U.Solset, E = U.Eqn, P = U.Poly;
    const sv = (a, rel) => E.solve(E.make(P.parse(a), P.const(U.Q(0)), rel), 'x').set;
    const A = sv('2x-1', '>'), B = sv('x-4', '<');   // x > 1/2，x < 4
    eq(S.show(S.intersect(A, B)), '1/2 < x < 4'); eq(S.show(S.union(A, B)), 'x 取任何数都行');
    const C = sv('x^2-x-6', '>');   // x < −2 或 x > 3
    eq(S.show(S.intersect(C, sv('x', '>'))), 'x > 3'); eq(S.show(S.complement(C)), '−2 ≤ x ≤ 3');
    eq(S.show(S.intersect(sv('x-1', '>'), sv('x-1', '<'))), '无解'); eq(S.show(S.union(sv('x-1', '>'), sv('x-1', '<'))), 'x < 1 或 x > 1');
    eq(S.show(S.union(sv('x-1', '>'), sv('x-1', '='))), 'x ≥ 1', '边界点并进去变成闭端');
    eq(S.show(S.complement(S.of('x', { none: true }))), 'x 取任何数都行');
    truthy(S.contains(C, U.Q(4)) && !S.contains(C, U.Q(0)) && S.contains(sv('x^2-2', '<'), U.Q(1)), 'contains 对几段也对');
  });
}

console.log('三元一次方程组（packs/equation.js 的方程组）');
{
  const mk = () => {
    const s = W.blank(), add = (type, props) => { const r = W.act(s, { t: 'add', type, x: 0, y: 0, props }); if (!r.ok) throw new Error(r.why); return r.id; };
    const link = (a, b, tp, fp) => W.act(s, { t: 'link', from: a, to: b, toPort: tp, fromPort: fp });
    return { s, add, link };
  };
  const sys3 = (texts, props) => {
    const m = mk(), g = m.add('eqsys', props || {});
    for (const text of texts) { const e = m.add('eqcard', { text }); m.link(e, g, 'eqs', 'eq'); }
    return W.evaluate(m.s)[g].out;
  };
}

console.log('示例菜单（problems/examples-data.js，由 tools/gen-examples.js 生成）');
{
  const EX = U.EXAMPLES || [];
  t('示例数据是最新的（node tools/gen-examples.js --check）', () => {
    const r = require('child_process').spawnSync(process.execPath, [path.join(root, 'tools', 'gen-examples.js'), '--check'], { encoding: 'utf8' });
    eq(r.status, 0, r.stdout + r.stderr);
  });
  t('示例：每个都能读回来、能求值；综合示例器材多、线多', () => {
    truthy(EX.length >= 1, '示例菜单是空的');
    for (const ex of EX) {
      const s = W.load(U.JSON.parse(ex.scene)); W.evaluate(s);
      truthy(Object.keys(s.entities).length >= 1, ex.id + ' 是空的');
      if (ex.kind === '综合') { truthy(Object.keys(s.entities).length >= 12, ex.id + ' 器材少于 12 个'); truthy(s.links.length >= 12, ex.id + ' 连线少于 12 条'); }
    }
  });
  t('示例：卡片互相不重叠（布局整齐）', () => {
    for (const ex of EX) {
      const s = W.load(U.JSON.parse(ex.scene));
      const R = Object.values(s.entities).map((e) => { const z = U.types[e.type].size(e); return { id: e.id, x: e.x, y: e.y, w: e.w > 0 ? e.w : z[0], h: e.h > 0 ? e.h : z[1] }; });
      for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) {
        const a = R[i], b = R[j];
        if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) throw new Error(ex.id + '：' + a.id + ' 和 ' + b.id + ' 重叠');
      }
    }
  });
  t('示例：每个操作台都至少在一个示例里用到', () => {
    const used = new Set();
    for (const ex of EX) for (const e of Object.values(U.JSON.parse(ex.scene).entities)) used.add(e.type);
    const packTypes = new Set(Object.values(U.packs).flatMap((p) => p.types));   // 只算器材包里的器材（测试里临时定义的宏不算）
    const missing = Object.keys(U.types).filter((id) => packTypes.has(id) && U.types[id].bench && !used.has(id));
    eq(missing, [], '这些操作台没有出现在示例里：' + missing.join('、'));
  });
}

t('参数扫描器写自己的规则：2n+1 是质数在 1–20 里的反例是 4；x+y 是偶数在 1–4 里反例是第 2 个；n×n+n+41 的反例是 40', () => {
  const run = (custom, to) => { const sc = W.blank(); const e = W.add(sc, 'scanner', 0, 0, { rule: 9, custom, from: 1, to }); return W.evaluate(sc)[e].out; };
  let o = run('2n+1 是质数', 20); eq(o.refuted.data, true); eq(U.showVal(o.counter), '4');
  o = run('x+y 是偶数', 4); eq(o.refuted.data, true); eq(U.showVal(o.counter), '2');
  o = run('n×n+n+41 是质数', 50); eq(U.showVal(o.counter), '40');
});

t('可能性：列出所有情况，两个骰子 36 种里和为 7 的有 6 种（1/6）、和为 13 的 0 种；三个骰子 216 种里和为 10 的有 27 种', () => {
  const run = (props) => { const sc = W.blank(); const e = W.add(sc, 'chancebench', 0, 0, Object.assign({ list: true }, props)); return W.evaluate(sc)[e].out; };
  let o = run({ mode: 1, sumv: 7 }); eq(U.showVal(o.all), '36'); eq(U.showVal(o.ways), '6'); eq(U.showVal(o.pways), '1/6');
  o = run({ mode: 1, sumv: 13 }); eq(U.showVal(o.ways), '0');
  o = run({ mode: 4, sumv: 10 }); eq(U.showVal(o.all), '216'); eq(U.showVal(o.ways), '27');
  eq(run({ mode: 1, list: false }).ways, undefined, '没点开就没有');
});

console.log('随机出题（操作台）');
t('随机出题：每个出题器、每个难度、25 个种子都出得了题，lint 通过，一开始没做到，套上参考做法就做到', () => {
  const bad = [];
  for (const type of U.Quiz.types()) for (const lv of [1, 2, 3, 4, 5, 6].filter((x) => U.Quiz.offers(type, x) && !U.Quiz.isTask(type, x))) for (let seed = 1; seed <= 25; seed++) {
    const p = U.Quiz.make(type, seed * 101, lv);
    if (!p) { bad.push(type + ' L' + lv + ' #' + seed + '：出不了题'); continue; }
    const errs = U.problemLint(p).errors; if (errs.length) { bad.push(p.id + '：' + errs[0]); continue; }
    if (U.Quiz.done(p, p.quiz.props).some(Boolean)) bad.push(p.id + '：一开始就做到了');
    const after = U.Quiz.done(p, Object.assign({}, p.quiz.props, p.quiz.sol));
    if (!after.every(Boolean)) bad.push(p.id + '：套上参考做法还没做到 ' + p.milestones.filter((m, i) => !after[i]).map((m) => m.say).join(','));
  }
  eq(bad.slice(0, 8), []);
});
// 通用任务层（倒推的自动版、找全、最多最少、推广）：从普通题变出来，不认操作台名字。
// 每种做法（找全的每一种、推广的每一个例子）都单独判得到；开场一个也没做到；说“全部”就真的是全部（整个取值范围扫过）
t('通用任务层：倒推、找全、最多最少、推广 出得来，开场没做到，每一种做法都判得到', () => {
  const bad = [], cnt = {};
  for (const type of U.Quiz.types()) for (const lv of [4, 7, 8, 9].filter((x) => U.Quiz.isTask(type, x) && U.Quiz.offers(type, x))) {
    cnt[lv] = (cnt[lv] || 0) + 1; let made = 0;
    for (let seed = 1; seed <= 10; seed++) {
      const p = U.Quiz.make(type, seed * 101, lv); if (!p) continue; made++;
      const errs = U.problemLint(p).errors; if (errs.length) { bad.push(p.id + '：' + errs[0]); continue; }
      if (U.Quiz.done(p, p.quiz.props).some(Boolean)) bad.push(p.id + '：一开始就做到了');
      if (p.quiz.sols) p.quiz.sols.forEach((x, i) => { if (!U.Quiz.done(p, Object.assign({}, p.quiz.props, x))[i]) bad.push(p.id + '：第 ' + (i + 1) + ' 种做法没判到'); });
      else if (!U.Quiz.done(p, Object.assign({}, p.quiz.props, p.quiz.sol)).every(Boolean)) bad.push(p.id + '：参考做法没做到');
      if (lv === 9 && !(p.predict && p.predict.form === 'number')) bad.push(p.id + '：推广要先写猜想');
    }
    if (made < 6) bad.push(type + ' L' + lv + '：10 个种子只出了 ' + made + ' 道');
  }
  eq(bad.slice(0, 8), []);
  truthy((cnt[7] || 0) >= 5 && (cnt[8] || 0) >= 3 && (cnt[9] || 0) >= 8, '找全至少 5 个、最多最少至少 3 个、推广至少 8 个操作台：' + JSON.stringify(cnt));
  // 找全：长和宽真的全部找出来了（长 1–20、宽 1–12 一个一个试，和出题的答案一样）
  const p = [1, 2, 3, 4, 5, 6, 7, 8].map((s) => U.Quiz.make('areamodel', s * 977, 7)).find((x) => x && x.quiz.sols[0].w !== undefined && x.quiz.sols[0].h !== undefined);
  truthy(p, '面积模型出得了“长和宽找全”');
  const w0 = p.milestones[0].when.all[0], want = [];   // 题目要的那个输出（面积或周长……）等于几
  for (let w = 1; w <= 20; w++) for (let h = 1; h <= 12; h++) if (U.Quiz.sim('areamodel', Object.assign({}, p.quiz.props, { w, h }))[w0.port] === w0.value) want.push(w + 'x' + h);
  eq(p.quiz.sols.map((x) => x.w + 'x' + x.h).sort(), want.sort());
  // 按钮只能 ×2 ×3 的属性（分数条的“又切成几份”）不能当“任意值”去找全
  for (let s = 1; s <= 10; s++) { const q = U.Quiz.make('fracbench', s * 101, 7); truthy(!q || !q.quiz.sols.some((x) => x.ka === 7 || x.kc === 7), '分数条不会要孩子切成 7 份'); }
});
t('随机出题：同一个 id 出同一道题；U.problemById 认 quiz: 开头的 id；小学的操作台都有出题器', () => {
  const id = U.Quiz.id('vertbench', 12345, 2), a = U.problemById(id), b = U.problemById(id);
  truthy(a && b && a.title === b.title && a.hook === b.hook, '同一个 id 同一道题');
  truthy(U.problemById('quiz:nosuchbench:1:1') === null, '没有这个出题器：null');
  truthy(U.Quiz.types().length >= 42, '至少 42 个操作台能随机出题');
  truthy(U.Quiz.types().filter(U.Quiz.hasRev).length >= 11, '至少 11 个操作台有倒推题');
  truthy(U.Quiz.hasBug('vertbench'), '竖式有找错题');
});
t('思想方法：标签从操作台、档位、题型、方法词来；每种方法一条链，链里每关打得开、来自至少 2 个操作台（大多数 3 个以上）；下一关按方法链走', () => {
  const M = U.Methods; truthy(M && M.LIST.length >= 12, '至少 12 种思想方法');
  for (const p of U.problems) for (const m of M.of(p)) truthy(M.get(m), p.id + ' 的方法 ' + m + ' 认得');
  eq(M.of(U.Quiz.make('swapbench', 101, 2)).includes('assume'), true);                 // 换一换（鸡兔同笼）→ 假设
  eq(M.of(U.Quiz.make('areamodel', 977, 7)).includes('enum'), true);                   // 找全 → 枚举
  eq(M.of(U.Quiz.make('areamodel', 977, 9)).includes('pattern'), true);                // 推广 → 找规律
  eq(M.of({ id: 'x', title: '先假设全是鸡', shelf: ['vertbench'] }), ['assume']);       // 题面写了“假设”
  eq(M.of({ id: 'x', title: '34 × 12', hook: '对着面积图', shelf: ['vertbench'] }), []);  // 没写方法词、竖式台本身也没有方法：不乱标
  const ms = M.chains(); let wide = 0; truthy(ms.length >= 12, '至少 12 条方法链：' + ms.join(','));
  for (const m of ms) {
    const L = U.Chain.of('m:' + m), types = new Set(L.map((x) => x.type));
    // 精选阶梯：可以只用一个台，但至少 6 级，每级一道至少三层（三个里程碑）的题
    const lad = L.filter((x) => x.kind === '阶梯');
    if (lad.length) { truthy(lad.length >= 6 && lad.every((x) => (U.problemById(x.id).goal || []).length >= 3) && L.slice(0, lad.length).every((x) => x.kind === '阶梯'), M.get(m).name + '：阶梯在前、至少 6 级、每级三层'); }
    else { truthy(L.length >= 4 && types.size >= 2, M.get(m).name + '：' + L.length + ' 关，' + types.size + ' 个操作台'); if (types.size >= 3) wide++; }
    for (const x of L) { const p = U.problemById(x.id); truthy(p && M.of(p).includes(m), M.get(m).name + ' 的 ' + x.id + ' 打得开，也标了这个方法'); }
    eq(new Set(L.map((x) => x.id)).size, L.length);
  }
  truthy(wide >= 10, '至少 10 条方法链来自 3 个以上的操作台：' + wide);
  const L = U.Chain.of('m:enum');
  eq(U.Chain.next(L[0].id, 'm:enum').id, L[1].id);
  eq(U.Chain.next(L[L.length - 1].id, 'm:enum'), null);
  const s = U.Chain.status('m:enum', () => 0); eq(s.levels.filter((x) => x.open).length, 1);
});
t('三星挑战：做完 1 星，没看提示再 1 星，一次做对（没陷阱、没被拦、没撤销）再 1 星；没做完 0 星', () => {
  const p = { milestones: [{ id: 'a' }, { id: 'b' }], goal: ['b'] }, run = (o) => Object.assign({ ms: { a: { done: true }, b: { done: true } }, hintLevel: {}, trapsHit: {}, errors: 0, undos: 0 }, o);
  eq(U.Judge.stars(p, run({})).n, 3);
  eq(U.Judge.stars(p, run({ hintLevel: { b: 1 } })).n, 2);
  eq(U.Judge.stars(p, run({ undos: 1 })).why, ['撤销过 1 次']);
  eq(U.Judge.stars(p, run({ trapsHit: { x: true }, hintLevel: { a: 2 } })).n, 1);
  eq(U.Judge.stars(p, run({ ms: { a: { done: true }, b: { done: false } } })).n, 0);
});
t('闯关：每条关卡链的每一关都能打开；上一关有星下一关才解锁；倒推放在最后', () => {
  const ts = U.Chain.types(); truthy(ts.length >= 40, '至少 40 条关卡链');
  for (const type of ts) for (const x of U.Chain.of(type)) truthy(U.problemById(x.id), type + ' 的 ' + x.id + ' 打得开');
  const L = U.Chain.of('areamodel'); eq(L[L.length - 1].kind, '倒推');
  const best = (st) => (id) => st[id] || 0;
  let s = U.Chain.status('areamodel', best({})); eq(s.levels.filter((x) => x.open).length, 1);
  s = U.Chain.status('areamodel', best({ [L[0].id]: 1, [L[1].id]: 3 })); eq(s.levels.filter((x) => x.open).length, 3); eq(s.stars, 4);
  eq(U.Chain.next(L[0].id).id, L[1].id); eq(U.Chain.next(L[L.length - 1].id), null);
});
console.log('旧题搬到操作台');
t('搬题：每个要搬的 id 都找到了题；搬过去的题器材架上只有操作台，开场台面上就有它', () => {
  eq(U.benchMigrateMissing, [], '找不到的 id');
  truthy(U.benchMigrated.length >= 283, '至少搬了 283 道');
  const BENCH = ['areamodel', 'invbench', 'pigeonbench', 'treebench', 'gaussbench', 'grassbench', 'surplusbench', 'relbench', 'statebench', 'featbench', 'ringbench', 'pourbench', 'balancebench', 'numlinebench', 'ratiobench', 'coordbench', 'blocksbench', 'termsbench', 'swapbench', 'systembench', 'gapbench', 'meanbench', 'tapebench', 'vennbench', 'travelbench', 'mulbench', 'fastbench', 'statbench', 'chancebench', 'clockbench', 'groupbench', 'solidbench', 'conjbench', 'fitbench', 'pairbench', 'tribench', 'circlebench', 'gridbench', 'tablebench', 'vertbench', 'decbench', 'tilebench', 'chipbench', 'makebench', 'estbench', 'areabench', 'factorbench', 'anglebench', 'rulerbench', 'moneybench', 'calbench', 'seqbench', 'jobbench', 'foldbench', 'logicbench', 'proofbench', 'fracbench', 'optbench', 'weighbench', 'sortbench', 'combobench', 'dirbench'];
  for (const id of U.benchMigrated) {
    const p = U.problems.find((x) => x.id === id), s = p.build();
    truthy(p.shelf.length === 1 && BENCH.includes(p.shelf[0]), id + ' 的器材架');
    truthy(Object.values(s.entities).some((e) => e.type === p.shelf[0]), id + ' 的开场台面');
    eq(U.problemLint(p).errors, [], id + ' 的结构');
  }
});
t('操作台的题：只用四个管道件（数字、运算器、读数、比较）的题比搬之前少', () => {
  const basic = ['num', 'op', 'meter', 'compare'];
  const only = U.problems.filter((p) => (p.shelf || []).length && p.shelf.every((x) => basic.includes(x))).length;
  truthy(only <= 55, '现在还有 ' + only + ' 道（搬之前 110 道）');
});
console.log('代数式操作台');
t('代数式：同类项才能合并；系数相加；合并到 0 这一项消失', () => {
  const T = U.TermsBench, L = T.parseTerms('3x,2,2x,5,-x');
  eq(L.map((x) => x.c + ':' + x.k), ['3:x', '2:', '2:x', '5:', '-1:x'], '解析');
  eq(T.merge(L, 0, 1), null, '3x 和 2 不是同类项');
  eq(T.exprShow(T.merge(L, 2, 0)), '5x + 2 + 5 − x', '2x 并到 3x 上');
  eq(T.exprShow(T.merge(T.parseTerms('x,-x,4'), 0, 1)), '4', 'x − x 消掉');
  eq(T.exprShow(T.merge(T.parseTerms('x,-x'), 0, 1)), '0', '全消掉剩 0');
  eq(T.merge(T.parseTerms('x2,x'), 0, 1), null, 'x² 和 x 不是同类项');
  eq(T.simplified(T.parseTerms('5x,7')), true); eq(T.simplified(T.parseTerms('5x,7,x')), false);
});
t('代数式：合并前后代入的值不变（随机 200 次）', () => {
  const T = U.TermsBench, kinds = ['x', 'x2', 'y', 'xy', ''];
  let seed = 7; const rnd = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
  const val = (list) => { const w = W.blank(), id = W.add(w, 'termsbench', 0, 0, { terms: list.map((t) => (t.k === '' ? t.c : (t.c === 1 ? '' : t.c === -1 ? '-' : t.c) + t.k)).join(',') }); return U.Q.num(W.evaluate(w)[id].out.value.data); };
  for (let r = 0; r < 200; r++) {
    const n = 2 + rnd(5), list = []; for (let j = 0; j < n; j++) list.push({ c: rnd(19) - 9 || 1, k: kinds[rnd(5)] });
    const a = rnd(n), b = rnd(n), m = T.merge(list, a, b); if (!m) continue;
    eq(val(m), val(list), '第 ' + r + ' 次');
  }
});
t('运算顺序：先括号、再乘除、后加减；连加连乘可以任选，连减连除只能从左', () => {
  const T = U.TermsBench, ok = (s) => [...T.allowed(T.parseToks(s)).ok].sort((a, b) => a - b), why = (s, i) => T.allowed(T.parseToks(s)).why[i];
  eq(ok('2,+,3,*,4'), [3], '有乘法：只能先算乘'); eq(why('2,+,3,*,4', 1), '先算乘除，再算加减');
  eq(ok('(,2,+,3,),*,4'), [2], '有括号：只能先算括号里'); eq(why('(,2,+,3,),*,4', 5), '先算括号里的');
  eq(ok('30,-,10,-,5'), [1], '连减：只能从左'); eq(why('30,-,10,-,5', 3), '加减混在一起，从左往右算');
  eq(ok('2,+,3,+,4'), [1, 3], '连加：都可以'); eq(ok('25,*,4,*,8'), [1, 3], '连乘：都可以');
  eq(ok('12,/,4,*,2'), [1], '乘除混合：从左'); eq(ok('8,-,3,+,2'), [1], '加减混合：从左');
  eq(ok('(,1,+,2,),*,(,3,+,4,)'), [2, 8], '两对括号：哪一对先算都行');
  eq(T.applyOp(T.parseToks('(,2,+,3,),*,4'), 2), ['5', '*', '4'], '括号里算完，括号去掉');
  eq(T.applyOp(T.parseToks('1,/,0'), 1), null, '除以 0 不算');
  eq(T.applyOp(T.parseToks('7,/,2'), 1), ['7/2'], '除不尽：保留分数');
});
t('运算顺序：按允许的顺序一路点到底，结果和直接算一样（随机 200 个算式）', () => {
  const T = U.TermsBench; let seed = 11; const rnd = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
  for (let r = 0; r < 200; r++) {
    const n = 2 + rnd(4), toks = [String(1 + rnd(9))]; for (let j = 1; j < n; j++) toks.push(['+', '-', '*'][rnd(3)], String(1 + rnd(9)));
    const want = Function('return ' + toks.join(' '))();
    let cur = toks.slice(), guard = 0;
    while (cur.length > 1 && guard++ < 20) { const a = [...T.allowed(cur).ok]; truthy(a.length > 0, '总有一步可以算：' + cur.join(' ')); cur = T.applyOp(cur, a[rnd(a.length)]); }
    eq(Number(cur[0]), want, toks.join(' '));
  }
});
console.log('两架天平（方程组）');
t('两架天平：消元、代入、拿走、平分的结果', () => {
  const S = U.SystemBench, P = S.parse;
  eq(S.dropOn([P('1,1,0,0,0,7'), P('2,1,0,0,0,10')], 0, 1).e, [1, 0, 0, 0, 0, 3], '(2x+y) − (x+y)：x = 3');
  truthy(S.dropOn([P('1,1,0,0,0,8'), P('2,4,0,0,0,26')], 1, 0).why, '大的拖到小的上：拿不出来，给出原因');
  eq(S.dropOn([P('1,0,0,0,0,3'), P('1,1,0,0,0,7')], 0, 1).e, [0, 1, 3, 0, 0, 7], '代入 x = 3：3 + y = 7');
  eq(S.dropOn([P('1,0,0,0,1,2'), P('1,1,0,0,0,8')], 0, 1).e, [0, 2, 2, 0, 0, 8], '代入 x = y + 2：2y + 2 = 8');
  eq(S.cancel(P('0,1,3,0,0,7')), [0, 1, 0, 0, 0, 4], '两边拿走 3 个砝码'); eq(S.cancel(P('1,0,0,0,0,3')), null, '没有一样的东西可拿');
  eq(S.divisor(P('0,2,0,0,0,10')), 2); eq(S.divisor(P('2,1,0,0,0,8')), 0);
  eq(S.known(P('0,0,5,0,1,0')), { v: 1, n: 5 }, '盒子在右边也认'); eq(S.eqStr(P('2,1,0,0,0,10')), '2x + y = 10');
});
t('两架天平：随机做几百步，每一步之后两架天平在真实重量下都还是平的', () => {
  const S = U.SystemBench; let seed = 5; const rnd = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
  const bal = (e, x, y) => e[0] * x + e[1] * y + e[2] === e[3] * x + e[4] * y + e[5];
  let done = 0;
  for (let r = 0; r < 500; r++) {
    const x = 1 + rnd(6), y = 1 + rnd(6), mk = () => { const a = 1 + rnd(3), b = rnd(3); return [a, b, 0, 0, 0, a * x + b * y]; };
    let es = [mk(), mk()];
    for (let k = 0; k < 5; k++) {
      const i = rnd(2), op = rnd(4); let ne = null;
      if (op === 0) { const d = S.dropOn(es, i, 1 - i); if (d.e) { es = es.slice(); es[1 - i] = d.e; ne = d.e; } }
      else if (op === 1) { const d = S.scale(es[i], 2); if (S.fits(d)) { es = es.slice(); es[i] = d; ne = d; } }
      else if (op === 2) { const d = S.divisor(es[i]); if (d) { es = es.slice(); es[i] = es[i].map((n) => n / d); ne = es[i]; } }
      else { const d = S.cancel(es[i]); if (d) { es = es.slice(); es[i] = d; ne = d; } }
      if (ne) { done++; truthy(bal(es[0], x, y) && bal(es[1], x, y), '第 ' + r + ' 组第 ' + k + ' 步后不平了：' + S.eqStr(es[0]) + '；' + S.eqStr(es[1]) + '（x=' + x + ', y=' + y + '）'); }
    }
  }
  truthy(done >= 100, '实际做了 ' + done + ' 步');
});
t('篱笆围地：改一共几米，“记下这一种”的列表清空；改成一样的数、改别的属性都不清空', () => {
  const on = U.types.areabench.onSet, p = { shape: 3, P: 20, w: 3, tried: '2,3,4' };
  eq(on(p, 'P', 24), { tried: '' }, '20 改成 24：清空');
  eq(on(p, 'P', 20), null, '还是 20：不清空'); eq(on(p, 'w', 5), null, '改长：不清空');
});
console.log('通用记录仪（js/core/recorder.js）');
{
  const R = U.Recorder;
  // 按画出来的按钮点：找 <title> 是 tip 的 data-pick-set，把里面的属性按顺序一个一个 set（和界面的 params 意图一样）
  const drawOf = (s, id) => { const e = s.entities[id], D = W.evaluate(s); return U.types[e.type].draw({ ent: e, props: D[id].props || e.props, d: D[id], out: D[id].out, w: 700, h: 900, t: 0, n: 0, kids: () => [] }); };
  const patchOf = (s, id, tip) => { for (const m of drawOf(s, id).matchAll(/<g data-pick-set="([^"]+)"[^>]*><title>([^<]*)<\/title>/g)) if (m[2] === tip) return JSON.parse(decodeURIComponent(m[1])); return null; };
  const press = (s, id, tip, log) => { const o = patchOf(s, id, tip); if (!o) throw new Error('点不到：' + tip); for (const k of Object.keys(o)) { const r = W.act(s, { t: 'set', id, k, v: o[k] }); if (!r.ok) throw new Error(r.why); if (log) log.push([k, o[k]]); } };
  const set = (s, id, k, v, log) => { const r = W.act(s, { t: 'set', id, k, v }); if (!r.ok) throw new Error(r.why); if (log) log.push([k, v]); };
  const out = (s, id, p) => { const v = W.evaluate(s)[id].out[p]; return v ? Q.show(v.data) : null; };
  const open = (pid) => { const s = U.problemById(pid).build(); return [s, Object.keys(s.entities)[0]]; };
  // 高斯求和：倒过来写、对齐相加，再记下来
  const doOne = (s, id, log) => { if (!s.entities[id].props.flip) set(s, id, 'flip', true, log); set(s, id, 'pair', true, log); press(s, id, '把这个个数记到图上', log); };
  t('通用记录仪：能开的操作台都包上了；撞名的（换一换、分一分）不包；包上的过 lint，没开时和以前一样', () => {
    for (const ty of ['gaussbench', 'circlebench', 'travelbench', 'calbench', 'areabench']) truthy(R.wrapped(ty), ty + ' 应包上');
    for (const ty of ['swapbench', 'groupbench']) { truthy(!R.wrapped(ty), ty + ' 不应包上'); truthy(/撞名/.test(R.why(ty)), ty + ' 的原因'); }
    for (const [ty, d] of Object.entries(U.types)) if (R.wrapped(ty)) {
      eq(U.lintType(d).errors, [], ty + ' 的 lint');
      for (const k of R.OUTS) truthy(d.outputs[k].rec && d.outputs[k].kind === 'num' && d.outputs[k].dim === null, ty + ' 的输出口 ' + k);
      for (const k of R.PROPS) truthy(d.props[k].hidden && d.props[k].write, ty + ' 的属性 ' + k + ' 藏着、能写');
      const s = W.blank(), id = W.add(s, ty, 0, 0), o = W.evaluate(s)[id].out;
      truthy(R.OUTS.every((k) => !o[k]), ty + ' 没开记录仪：不出记录仪的输出');
      truthy(!/data-rec-knob/.test(drawOf(s, id)), ty + ' 没开记录仪：不画“记下来”');
    }
  });
  t('通用记录仪：配置不对的说清楚；新题的配置都合法；开了以后 compute 还是纯函数', () => {
    eq(R.check('gaussbench', { knob: 'n', out: 'total', range: [2, 12] }), []);
    truthy(/不认识的配置/.test(R.check('gaussbench', { knob: 'n', out: 'total', range: [2, 12], gues: 1 }).join()), '拼错的键');
    truthy(/knob/.test(R.check('gaussbench', { knob: 'flip', out: 'total', range: [2, 12] }).join()), '旋钮要是整数属性');
    truthy(/out/.test(R.check('gaussbench', { knob: 'n', out: 'nope', range: [2, 12] }).join()), '输出口要有');
    truthy(/range/.test(R.check('gaussbench', { knob: 'n', out: 'total', range: [2, 200] }).join()), '范围超出旋钮');
    truthy(/asks/.test(R.check('gaussbench', { knob: 'n', out: 'total', range: [2, 12], asks: ['题|a|b'] }).join()), '追问要有一个 *');
    truthy(/开不了/.test(R.check('swapbench', { knob: 'target', out: 'b', range: [16, 32] }).join()), '撞名的台开不了');
    const deepFreeze = (o) => { if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); for (const k of Object.keys(o)) deepFreeze(o[k]); } return o; };
    for (const p of U.problems) {
      const s = p.build();
      for (const e of Object.values(s.entities)) if (e.props && e.props.rcfg) {
        eq(R.check(e.type, JSON.parse(e.props.rcfg)), [], p.id + ' 的配置');
        const ctx = deepFreeze({ ent: JSON.parse(JSON.stringify(e)), props: Object.assign({}, e.props), inp: {}, t: 0, n: 0, seed: 1 });
        U.types[e.type].compute(Object.assign({}, ctx, { say() {}, kids: () => [] }));
      }
    }
  });
  t('通用记录仪：记点（要在台面上做出来才能记；同一个不能记两次）', () => {
    const [s, id] = open('gr-gauss-n');
    eq(patchOf(s, id, '把这个个数记到图上'), null, '没算出和：记下来点不了');
    doOne(s, id);
    eq(out(s, id, 'pts'), '1'); eq(s.entities[id].props.rclog, '4,10,1/1');
    eq(patchOf(s, id, '把这个个数记到图上'), null, '记过了：点不了');
    press(s, id, '个数多 1'); eq([s.entities[id].props.n, s.entities[id].props.pair], [5, false], '拧旋钮：台面复位（reset）');
    doOne(s, id); press(s, id, '个数多 1'); doOne(s, id);
    eq(out(s, id, 'pts'), '3'); eq(R.state('gaussbench', s.entities[id].props).group.map((a) => a.y), [10, 15, 21]);
  });
  t('通用记录仪：先猜锁定（盖住台面、不给读数、不能记）；猜了揭开，当场判对错；不猜直接看不算', () => {
    const [s, id] = open('gr-gauss-n');
    doOne(s, id); press(s, id, '个数多 1'); doOne(s, id); press(s, id, '个数多 1'); doOne(s, id); press(s, id, '个数多 1');
    set(s, id, 'flip', true); set(s, id, 'pair', true);   // 台面上的和算好了，也读不到
    const st = R.state('gaussbench', s.entities[id].props, true);
    truthy(st.hidden && st.mode === 'values' && st.ans === 28, '个数 7：先猜');
    eq(out(s, id, 'total'), null, '和这个口先不给'); eq(U.types.gaussbench.badge({ props: s.entities[id].props }), '', '标题栏也不写');
    const svg = drawOf(s, id); truthy(/data-rec-cover/.test(svg) && /先猜一猜/.test(svg), '台面盖上了');
    eq(patchOf(s, id, '把这个个数记到图上'), null, '先猜时记不了');
    press(s, id, '猜和 28');
    eq([out(s, id, 'gtry'), out(s, id, 'gok'), out(s, id, 'total')], ['1', '1', '28'], '猜和 28：猜对，揭开');
    truthy(!/data-rec-cover/.test(drawOf(s, id)), '盖子揭开了');
    press(s, id, '把这个个数记到图上'); press(s, id, '个数多 1');
    press(s, id, '猜和 28'); eq([out(s, id, 'gtry'), out(s, id, 'gok')], ['2', '1'], '个数 8 猜 28：猜错（是 36）');
    set(s, id, 'n', 9); truthy(R.state('gaussbench', s.entities[id].props).hidden, '换了个数：猜的清掉，又要先猜');
    press(s, id, '不猜，直接看'); truthy(!R.state('gaussbench', s.entities[id].props).hidden, '不猜直接看：揭开'); eq(out(s, id, 'gtry'), '2', '不算猜');
  });
  t('通用记录仪：猜的格子太多时按间隔分格，落在最近的一格算对', () => {
    const s = W.blank(), id = W.add(s, 'gaussbench', 0, 0, Object.assign({ a: 1, d: 1, n: 23, flip: true, pair: true, rclog: '20,210,1/1;21,231,1/1;22,253,1/1' }, R.props({ knob: 'n', out: 'total', keep: ['a', 'd'], range: [2, 30], names: ['个数', '和'], done: { flip: true, pair: true } })));
    const st = R.state('gaussbench', s.entities[id].props, true);
    truthy(st.hidden && st.mode === 'grid' && st.step === 50 && st.cells.length <= 16, '值有 29 种：按 50 一格（' + st.step + '）');
    eq(st.ans, 276); eq(st.cells[st.ansIdx], 300, '276 落在 300 那一格');
    press(s, id, '猜和 300'); eq([out(s, id, 'gtry'), out(s, id, 'gok')], ['1', '1'], '猜 300：算对');
    truthy(/猜对了！（是 276，就在这一格）/.test(drawOf(s, id)), '说出真正的数');
  });
  t('通用记录仪：全部试一遍（5 个点以后才能点）；换 keep 里的属性只显示这一组的点，记录不丢', () => {
    const [s, id] = open('gr-gauss-n');
    for (let i = 0; i < 4; i++) { doOne(s, id); press(s, id, '个数多 1'); if (i >= 2) press(s, id, '不猜，直接看'); }
    eq(patchOf(s, id, '每个个数都画上'), null, '4 个点：还不能全部试一遍');
    doOne(s, id); press(s, id, '每个个数都画上');
    eq(out(s, id, 'all'), '1'); eq((drawOf(s, id).match(/fill="#9cc3ee"/g) || []).length, 11, '个数 2 到 12 都画上');
    set(s, id, 'a', 2); eq(out(s, id, 'pts'), '0', '第一个数改成 2：这一组没有点'); eq((drawOf(s, id).match(/data-rec-pt/g) || []).length, 0);
    doOne(s, id); eq(out(s, id, 'pts'), '1', '这一组记一个'); eq(R.state('gaussbench', s.entities[id].props).log.length, 6, '两组一共 6 条');
    set(s, id, 'a', 1); eq(out(s, id, 'pts'), '5', '改回 1：5 个点又回来了');
  });
  t('通用记录仪：存档读回、按同样的步骤重放，结果一样', () => {
    const [s, id] = open('gr-travel-gap'), log = [];
    press(s, id, '把这个时间记到图上', log); for (let k = 1; k <= 3; k++) { press(s, id, '时间多 1', log); if (k === 3) press(s, id, '猜相距 45', log); press(s, id, '把这个时间记到图上', log); }
    press(s, id, '15 千米：两人的速度和', log);
    const snap = (sc) => { const e = Object.values(sc.entities)[0], D = W.evaluate(sc)[e.id]; return U.JSON.stringify([e.props, D.out, drawOf(sc, e.id)]); };
    eq([out(s, id, 'pts'), out(s, id, 'gok'), out(s, id, 'q1')], ['4', '1', '1']);
    eq(snap(W.load(W.save(s))), snap(s), '存档读回');
    const [s2, id2] = open('gr-travel-gap'); for (const [k, v] of log) set(s2, id2, k, v);
    eq(snap(s2), snap(s), '重放');
  });
  t('通用记录仪：操作台自己藏（recHide）：篱笆围地先猜时不盖台面，面积写成“？”，把手还在', () => {
    const [s, id] = open('gr-fence-20');
    set(s, id, 'rclog', '2,16,20;3,21,20;4,24,20'); set(s, id, 'w', 6);
    const svg = drawOf(s, id);
    truthy(!/data-rec-cover/.test(svg) && /面积 = 6 × 4 = ？/.test(svg) && !/24 平方米/.test(svg), '不盖台面，面积写成“？”');
    eq(out(s, id, 'area'), null, '面积这个口先不给');
    const e = s.entities[id]; eq(U.types.areabench.grips({ ent: e, props: e.props }).length, 1, '拖长的把手还在');
    set(s, id, 'P', 24); eq(out(s, id, 'pts'), '0', '篱笆改成 24 米：另一组'); set(s, id, 'P', 20); eq(out(s, id, 'pts'), '3', '改回 20 米：3 个点还在');
  });
}
console.log('操作台模式（U.benchOf / U.benchModeOf）');
{
  const P = U.problems.find((p) => p.id === 'gr-gauss-n'), prob = { problem: P, mode: 'practice' };
  t('单台操作台的题 → 操作台模式，返回那台操作台；练习、考试都算', () => {
    for (const id of ['gr-gauss-n', 'gr-fence-20', 'balance-12']) {
      const p = U.problems.find((x) => x.id === id), s = p.build(), bid = U.benchOf(s);
      truthy(bid && bid.length === 1 && U.types[s.entities[bid[0]].type].bench, id + ' 应有一台操作台（返回一个 id 的列表）');
      eq(U.benchModeOf(s, { problem: p, mode: 'practice' }), bid, id + ' 练习');
      eq(U.benchModeOf(s, { problem: p, mode: 'exam' }), bid, id + ' 考试');
    }
  });
  t('所有台面上只有一台操作台、没有连线的题都进操作台模式', () => {
    let n = 0;
    for (const p of U.problems) { const s = p.build(), es = Object.values(s.entities).filter((e) => !e.parent); if (es.length === 1 && !s.links.length && U.types[es[0].type].bench) { n++; eq(U.benchModeOf(s, { problem: p, mode: 'practice' }), [es[0].id], p.id); } }
    truthy(n > 100, '应有一百多道操作台的题，实际 ' + n);
  });
  t('多台器材、有连线、不是操作台 → 不是操作台模式', () => {
    const s = P.build(); const b = U.benchOf(s)[0];
    const two = JSON.parse(JSON.stringify(s)); W.add(two, 'num', 0, 0, { n: 3 });
    eq(U.benchModeOf(two, prob), null, '再放一台器材');
    const lk = W.blank(); const a = W.add(lk, 'num', 0, 0, { n: 3 }), c = W.add(lk, 'op', 0, 0, { op: 0 }); lk.links.push({ id: 'l1', from: a, fromPort: 'v', to: c, toPort: 'a' });
    eq(U.benchModeOf(lk, prob), null, '两台器材有连线');
    const one = JSON.parse(JSON.stringify(s)); one.links.push({ id: 'l9', from: b, fromPort: 'x', to: b, toPort: 'y' });
    eq(U.benchModeOf(one, prob), null, '一台但有连线');
    const nb = W.blank(); W.add(nb, 'num', 0, 0, { n: 3 });
    eq(U.benchModeOf(nb, prob), null, '只有一台，但不是操作台');
    eq(U.benchModeOf(W.blank(), prob), null, '空台面');
  });
  t('联动组：顶层全是操作台、全在同一个组里、没有连线 → 这几台都是操作台模式（U.inBench 判断某一台）', () => {
    const F = U.Forms, mk = (types) => { const s = W.blank(), ids = types.map((ty, i) => W.add(s, ty, i * 700, 0, {})); F.join(s, 'lineq', ids, { a: 2, b: 3, c: 0, d: 11, x0: 4 }); return { s, ids }; };
    const two = mk(['balancebench', 'eqstepbench']), four = mk(['balancebench', 'eqstepbench', 'tapebench', 'numlinebench']);
    eq(U.benchModeOf(two.s, prob), two.ids, '两台连成一组');
    eq(U.benchModeOf(four.s, prob), four.ids, '四台连成一组');
    truthy(four.ids.every((id) => U.inBench(U.benchOf(four.s), id)) && !U.inBench(U.benchOf(four.s), 'e99') && !U.inBench(null, four.ids[0]), 'U.inBench：组里每一台都是，别的不是，null 时都不是');
    for (const id of ['ef-2x3-11', 'ef-3x2-x10', 'ef-x5-12']) { const p = U.problems.find((x) => x.id === id), s = p.build(); eq(U.benchModeOf(s, { problem: p, mode: 'practice' }), Object.keys(s.entities), id + '：两台都是操作台模式'); }
    const extra = JSON.parse(JSON.stringify(two.s)); W.add(extra, 'eqstepbench', 0, 600, {});
    eq(U.benchModeOf(extra, prob), null, '组外还有一台操作台');
    const nb = JSON.parse(JSON.stringify(two.s)); W.add(nb, 'num', 0, 600, { n: 3 });
    eq(U.benchModeOf(nb, prob), null, '组外还有一台不是操作台的器材');
    const lk = JSON.parse(JSON.stringify(two.s)); lk.links.push({ id: 'l1', from: two.ids[0], fromPort: 'okn', to: two.ids[1], toPort: 'p.a' });
    eq(U.benchModeOf(lk, prob), null, '组里有连线');
    const s2 = W.blank(), a = W.add(s2, 'balancebench', 0, 0, {}), b = W.add(s2, 'eqstepbench', 700, 0, {}), c = W.add(s2, 'tapebench', 0, 500, {}), d = W.add(s2, 'eqstepbench', 700, 500, {});
    F.join(s2, 'lineq', [a, b], { a: 2, b: 3, c: 0, d: 11, x0: 4 }); F.join(s2, 'lineq', [c, d], { a: 1, b: 5, c: 0, d: 12, x0: 7 });
    eq(U.benchModeOf(s2, prob), null, '两个联动组：不是同一个组');
    eq(U.benchModeOf(four.s, { problem: P, mode: 'practice', showPorts: true }), null, '联动组点了“显示口”');
    eq(U.benchModeOf(four.s, { problem: P, mode: 'free' }), null, '联动组在自由探究里');
  });
  t('自由探究、没在做题、点了“显示口” → 不是操作台模式', () => {
    const s = P.build();
    eq(U.benchModeOf(s, { problem: P, mode: 'free' }), null, '自由探究');
    eq(U.benchModeOf(s, { problem: null, mode: 'practice' }), null, '没在做题');
    eq(U.benchModeOf(s, { problem: P, mode: 'practice', showPorts: true }), null, '显示口');
    eq(U.benchModeOf(s), null, '不给参数');
  });
  t('操作台模式只是不画口：卡片按台面算（换一换 19 个口不再撑高卡片），输出照常算', () => {
    const d = U.types.swapbench, e = { type: 'swapbench', props: U.defaultProps(d) }, a = d.size(e), b = d.size(e, { bench: true });
    truthy(b[1] < a[1] && b[0] <= a[0], '换一换：操作台模式卡片更矮 ' + a + ' → ' + b);
    const g = U.types.gaussbench, ge = { type: 'gaussbench', props: U.defaultProps(g) };
    truthy(g.size(ge, { bench: true })[0] <= g.size(ge)[0], '高斯：不更宽');
    const s = P.build(), id = U.benchOf(s)[0], D = W.evaluate(s);
    truthy(Object.keys(D[id].out).length > 0, '输出照常算（S.D[id].out 有值）');
  });
}
console.log('联动组：一个道理，几种样子（js/core/forms.js）');
{
  const F = U.Forms, LF = F.FORMS.lineq, S0 = { a: 2, b: 3, c: 0, d: 11, x0: 4 };
  const mk = () => { const s = W.blank(), b = W.add(s, 'balancebench', 0, 0, {}), e = W.add(s, 'eqstepbench', 700, 0, {}); F.join(s, 'lineq', [b, e], S0); return { s, b, e }; };
  const set = (s, id, o) => { for (const k of Object.keys(o)) { const r = W.act(s, { t: 'set', id, k, v: o[k] }); if (!r.ok) throw new Error(r.why); } return W.act(s, { t: 'settle' }); };
  const abcd = (p, t) => (t === 'balancebench' ? [p.lx, p.lc, p.rx, p.rc] : [p.a, p.b, p.c, p.d]);
  t('步子表：两边减数、减 x、除、只动一边、挪过去都认得出来；一次改两样不认', () => {
    const d = (n) => LF.diff(S0, Object.assign({}, S0, n));
    eq(LF.label(d({ b: 0, d: 8 })), '两边同时减 3'); eq(LF.rule(d({ b: 0, d: 8 })), 'eq.both-sides');
    eq(LF.label(LF.diff({ a: 3, b: 2, c: 1, d: 10 }, { a: 2, b: 2, c: 0, d: 10 })), '两边同时减 x');
    eq(LF.label(LF.diff({ a: 2, b: 0, c: 0, d: 8 }, { a: 1, b: 0, c: 0, d: 4 })), '两边同时除以 2');
    eq(LF.label(d({ b: 0 })), '只在左边减 3'); eq(LF.rule(d({ b: 0 })), 'balance.lone');
    eq(LF.label(d({ b: 2, d: 12 })), '把 1 从左边挪到右边'); eq(LF.rule(d({ b: 2, d: 12 })), 'balance.move');
    truthy(d({ a: 1, b: 2, c: 0, d: 10 }).why, '盒子和砝码一起变：不认');
    eq(d({}), null);
  });
  t('出题：join 把两台摆成同一个等式；不能摆的、已经在组里的、不认识的器材都报错', () => {
    const { s, b, e } = mk();
    eq(abcd(s.entities[b].props, 'balancebench'), [2, 3, 0, 11]); eq(abcd(s.entities[e].props, 'eqstepbench'), [2, 3, 0, 11]);
    eq(s.entities[b].props.x0, 4); eq(s.entities[e].props.x0, 4); eq(s.groups.length, 1);
    let bad = 0; try { F.join(s, 'lineq', [b, e], S0); } catch (x) { bad++; }
    const s2 = W.blank(), b2 = W.add(s2, 'balancebench', 0, 0, {}), e2 = W.add(s2, 'eqstepbench', 0, 0, {}), m2 = W.add(s2, 'meter', 0, 0, {});
    try { F.join(s2, 'lineq', [b2, e2], { a: 9, b: 0, c: 0, d: 36, x0: 4 }); } catch (x) { bad++; }
    try { F.join(s2, 'lineq', [b2, m2], S0); } catch (x) { bad++; }
    eq(bad, 3);
  });
  t('在天平上做一步，式子往下写一行；在式子上做一步，天平跟着动；都记进组的步子', () => {
    const { s, b, e } = mk();
    const r = set(s, b, { lc: 2, rc: 10 });
    eq(abcd(s.entities[e].props, 'eqstepbench'), [2, 2, 0, 10]); eq(r.steps[0].label, '两边同时减 1'); eq(r.steps[0].by, b);
    truthy(/两边同时减 1/.test(s.entities[e].props.rows), '式子写下了这一步：' + s.entities[e].props.rows);
    set(s, e, U.EqStepBench.stepTo(s.entities[e].props, { b: 0, d: 8 }));
    eq(abcd(s.entities[b].props, 'balancebench'), [2, 0, 0, 8]);
    set(s, e, U.EqStepBench.stepTo(s.entities[e].props, { a: 1, b: 0, c: 0, d: 4 }));
    const D = W.evaluate(s);
    eq(Q.show(D[b].out.solved.data), '4'); eq(Q.show(D[e].out.solved.data), '4');
    eq(s.groups[0].log.map((x) => x.label), ['两边同时减 1', '两边同时减 2', '两边同时除以 2']);
    eq(s.groups[0].log.map((x) => x.rule), ['eq.both-sides', 'eq.both-sides', 'eq.both-sides']);
  });
  t('只动一边：两台一起不平（天平歪、式子写 ≠）；在另一边补上同一步，两台一起回来', () => {
    const { s, b, e } = mk();
    set(s, b, { sync: false }); set(s, b, { lc: 0 });
    let D = W.evaluate(s); eq(Q.show(D[b].out.okn.data), '0'); eq(Q.show(D[e].out.okn.data), '0');
    truthy(/只在左边减 3/.test(s.entities[e].props.rows));
    set(s, e, U.EqStepBench.stepTo(s.entities[e].props, { d: 8 }));
    D = W.evaluate(s); eq(Q.show(D[b].out.okn.data), '1'); eq(Q.show(D[e].out.okn.data), '1');
    eq(s.groups[0].log.map((x) => x.rule), ['balance.lone', 'balance.lone']);
  });
  t('有一台画不出来就整步不做，说出原因；一次在两台上各改一样也不做', () => {
    const { s, b, e } = mk();
    W.act(s, { t: 'set', id: e, k: 'a', v: 8 });
    const r = W.act(s, { t: 'settle' }); truthy(!r.ok && /天平/.test(r.why) && /画不出来/.test(r.why), r.why);
    const { s: s2, b: b2, e: e2 } = mk();
    W.act(s2, { t: 'set', id: b2, k: 'lc', v: 2 }); W.act(s2, { t: 'set', id: e2, k: 'd', v: 9 });
    const r2 = W.act(s2, { t: 'settle' }); truthy(!r2.ok && /一次只在一块上/.test(r2.why), r2.why);
    eq(W.act(W.blank(), { t: 'settle' }).ok, true, '没有组的台面：什么都不做');
  });
  t('存档读回组还在；删掉一台，组散掉；清空台面，组也清掉', () => {
    const { s, b, e } = mk(); set(s, b, { lc: 2, rc: 10 });
    const s2 = W.load(W.save(s)); eq(s2.groups[0].state, s.groups[0].state); eq(s2.groups[0].log.length, 1);
    set(s2, e, U.EqStepBench.stepTo(s2.entities[e].props, { b: 0, d: 8 })); eq(abcd(s2.entities[b].props, 'balancebench'), [2, 0, 0, 8]);
    W.act(s2, { t: 'del', id: b }); W.act(s2, { t: 'settle' }); eq(s2.groups, undefined);
    W.act(s, { t: 'clear' }); eq(s.groups, undefined);
  });
  // ---- 第 2 批：线段图、数轴（两边各走）----
  const S3 = { a: 3, b: 2, c: 1, d: 10, x0: 4 }, TB = U.TapeBench, NB = U.NumLineBench;
  const abcd4 = (p, t) => (t === 'tapebench' ? [p.ka, p.ea, p.kb, p.eb] : t === 'numlinebench' ? [p.qa, p.qb, p.qc, p.qd] : abcd(p, t));
  const mk4 = (st) => { const s = W.blank(), ids = ['balancebench', 'eqstepbench', 'tapebench', 'numlinebench'].map((t, i) => W.add(s, t, i * 760, 0, {})); F.join(s, 'lineq', ids, st || S3); return { s, b: ids[0], e: ids[1], tp: ids[2], n: ids[3] }; };
  const all4 = (s, o) => [o.b, o.e, o.tp, o.n].map((id) => abcd4(s.entities[id].props, s.entities[id].type));
  const gripOf = (s, id, gid) => U.types[s.entities[id].type].grips({ props: s.entities[id].props }).find((g) => g.id === gid);
  const tapeUnit = (p) => TB.scaleOf(TB.model(p));
  const okOf = (s, o) => { const D = W.evaluate(s), tm = TB.model(s.entities[o.tp].props); return [Q.show(D[o.b].out.okn.data), Q.show(D[o.e].out.okn.data), tm.a === tm.b ? '1' : '0']; };
  t('线段图的适配器：上面 a 段 x + 一截 b，下面 c 段 x + 一截 d；一段 = x0；等式模式写左边右边、没有目标；画不了就说原因', () => {
    const A = F.adapterOf('lineq', 'tapebench'), p = Object.assign(U.defaultProps(U.types.tapebench), A.fromState(S3, {}, null));
    eq([p.ka, p.ea, p.kb, p.eb, p.u, p.eqm, p.tk, p.na, p.nb], [3, 2, 1, 10, 4, true, 2, '左边', '右边']);
    eq(A.toState(p), { a: 3, b: 2, c: 1, d: 10 });
    eq(A.can(S3), null); truthy(/8 段/.test(A.can({ a: 9, b: 0, c: 0, d: 36, x0: 4 })), '9 段画不了'); truthy(/60/.test(A.can({ a: 1, b: 61, c: 0, d: 65, x0: 4 })), '一截 61 画不了');
    const svg = U.types.tapebench.draw({ props: p }); truthy(!/一共要|相差要/.test(svg) && />x</.test(svg) && !/>4</.test(svg), '段上写 x 不写数，没有目标那一行');
    eq(U.types.tapebench.grips({ props: p }).map((g) => g.id), ['cb', 'cd'], '没有“一段多长”的把手，两条右端各一个');
    const p0 = U.defaultProps(U.types.tapebench); eq(U.types.tapebench.grips({ props: p0 }).map((g) => g.id), ['u'], '不在组里：和原来一样');
  });
  t('数轴的适配器：用法换成“两边各走”，g 从 0 开始、不进状态；范围只由 a、b、c、d 定；画不了就说原因', () => {
    const A = F.adapterOf('lineq', 'numlinebench'), p = Object.assign(U.defaultProps(U.types.numlinebench), A.fromState(S3, { g: 5 }, null));
    eq([p.mode, p.qa, p.qb, p.qc, p.qd, p.g], [4, 3, 2, 1, 10, 0]);
    eq(A.toState(Object.assign({}, p, { g: 9 })), { a: 3, b: 2, c: 1, d: 10 }, 'toState 不读 g');
    eq(A.fromState(S3, p, { op: 'sub', what: 'c', k: 1 }).g, undefined, '做一步不动 g');
    eq(NB.eqRange({ a: 1, b: 5, c: 0, d: 12 }), { G: 12, to: 24 }); eq(NB.eqRange({ a: 3, b: 2, c: 1, d: 10 }), { G: 10, to: 40 });
    const r1 = NB.eqModel(Object.assign({}, p, { g: 0 })), r2 = NB.eqModel(Object.assign({}, p, { g: 10 })); eq([r1.to, r1.G], [r2.to, r2.G], '拖 g 数轴范围不变');
    eq(A.can(S3), null); truthy(/10 下/.test(A.can({ a: 11, b: 0, c: 0, d: 0, x0: 1 }))); truthy(/太长/.test(A.can({ a: 10, b: 60, c: 9, d: 0, x0: 1 })), '数轴太长');
  });
  t('在线段图上做一步（拖右端剪掉 2、点“两条都剪掉一段 x”），天平、式子、数轴都跟着变', () => {
    const o = mk4(), s = o.s, g = gripOf(s, o.tp, 'cb'), P = s.entities[o.tp].props;
    const patch = g.drag({ props: P }, { x: g.x - 2 * tapeUnit(P), y: g.y }); eq(patch, { ea: 0, eb: 8 }, '两条一起剪开着：另一条也剪 2');
    const r = set(s, o.tp, patch); eq(r.steps[0].label, '两边同时减 2'); eq(r.steps[0].by, o.tp);
    eq(all4(s, o), [[3, 0, 1, 8], [3, 0, 1, 8], [3, 0, 1, 8], [3, 0, 1, 8]]);
    set(s, o.tp, { ka: 2, kb: 0 });
    eq(all4(s, o), [[2, 0, 0, 8], [2, 0, 0, 8], [2, 0, 0, 8], [2, 0, 0, 8]]); eq(s.groups[0].log[1].label, '两边同时减 x');
    eq(okOf(s, o), ['1', '1', '1']);
  });
  t('在数轴上做一步（拖落点往左 2、两边都少跳一下 x、两边 ÷ 2），另外三台跟着变；两个落点一起走，差不变', () => {
    const o = mk4(), s = o.s; set(s, o.n, { g: 3 });
    const P = s.entities[o.n].props, d0 = NB.eqModel(P), g = gripOf(s, o.n, 'L');
    const patch = g.drag({ props: P }, { x: g.x - 2 * d0.u, y: g.y }); eq(patch, { qb: 0, qd: 8 });
    set(s, o.n, patch); const d1 = NB.eqModel(s.entities[o.n].props);
    eq(d0.L - d0.R, d1.L - d1.R, '差不变'); eq([d1.L, d1.R], [d0.L - 2, d0.R - 2]);
    eq(all4(s, o), [[3, 0, 1, 8], [3, 0, 1, 8], [3, 0, 1, 8], [3, 0, 1, 8]]);
    set(s, o.n, { qa: 2, qc: 0 }); eq(all4(s, o)[0], [2, 0, 0, 8]); eq(s.groups[0].log[1].label, '两边同时减 x');
    set(s, o.n, { qa: 1, qd: 4 }); eq(all4(s, o)[2], [1, 0, 0, 4]); eq(s.groups[0].log[2].label, '两边同时除以 2');
    const D = W.evaluate(s); eq(Q.show(D[o.b].out.solved.data), '4'); eq(Q.show(D[o.e].out.solved.data), '4');
  });
  t('只动一边：线段图只剪一条、数轴只动一个落点，四台一起不平；改 g 不算一步', () => {
    const o = mk4(), s = o.s; set(s, o.tp, { cut2: false });
    const g = gripOf(s, o.tp, 'cb'), P = s.entities[o.tp].props, patch = g.drag({ props: P }, { x: g.x - 2 * tapeUnit(P), y: g.y });
    eq(patch, { ea: 0 }); set(s, o.tp, patch);
    eq(okOf(s, o), ['0', '0', '0']); eq(s.groups[0].log.map((x) => x.rule), ['balance.lone']);
    set(s, o.n, { g: 4 }); eq(Q.show(W.evaluate(s)[o.n].out.meet.data), '0', 'g = 真实值时数轴两个落点也分开');
    eq(s.groups[0].log.length, 1, '改 g 不记步子');
    const o2 = mk4(), s2 = o2.s; set(s2, o2.n, { link: false, g: 4 });
    eq(Q.show(W.evaluate(s2)[o2.n].out.meet.data), '1', 'g = 4：重合');
    const g2 = gripOf(s2, o2.n, 'R'), P2 = s2.entities[o2.n].props, pt = g2.drag({ props: P2 }, { x: g2.x - 3 * NB.eqModel(P2).u, y: g2.y });
    eq(pt, { qd: 7 }); set(s2, o2.n, pt);
    eq(okOf(s2, o2), ['0', '0', '0']); eq(Q.show(W.evaluate(s2)[o2.n].out.meet.data), '0'); eq(s2.groups[0].log[0].label, '只在右边减 3');
    const r = set(s2, o2.n, { g: 2 }); eq(r.steps, []); eq(s2.groups[0].log.length, 1);
  });
  t('数轴的 g：两边一模一样时 g 是几都重合；x 的个数一样、数不一样时 g 是几都差这么多', () => {
    const base = Object.assign(U.defaultProps(U.types.numlinebench), { mode: 4 });
    for (const g of [0, 3, 10]) {
      const a = NB.eqSay(Object.assign({}, base, { qa: 2, qb: 3, qc: 2, qd: 3, g })), b = NB.eqSay(Object.assign({}, base, { qa: 2, qb: 3, qc: 2, qd: 7, g }));
      truthy(a.meet && /一模一样/.test(a.tx), a.tx); truthy(!b.meet && /差这么多/.test(b.tx) && /4/.test(b.tx), b.tx);
    }
    const c = NB.eqSay(Object.assign({}, base, { qa: 1, qb: 5, qc: 0, qd: 12, g: 7 })); truthy(c.meet && /x = 7/.test(c.tx), c.tx);
    const d = NB.eqSay(Object.assign({}, base, { qa: 1, qb: 5, qc: 0, qd: 12, g: 4 })); truthy(!d.meet && /差 3/.test(d.tx), d.tx);
  });
  t('有一台画不出来就整步不做：式子上改成 9x = 7x + …，线段图（最多 8 段）、天平都画不了', () => {
    const o = mk4(), s = o.s; W.act(s, { t: 'set', id: o.e, k: 'a', v: 9 }); W.act(s, { t: 'set', id: o.e, k: 'c', v: 7 });
    const r = W.act(s, { t: 'settle' }); truthy(!r.ok && /画不出来/.test(r.why), r.why);
    eq(all4(s, o)[0], [3, 2, 1, 10], '天平没动');
  });
}
console.log('全部在器材上操作：几何一组（海龟作图、剪拼、钉板、证明排序、尺规作图、式子台）');
{
  // 画一张卡片，取出上面所有按钮的补丁（data-pick-set 的 JSON）
  const patchesOf = (s, id, masked) => { const e = s.entities[id], D = W.evaluate(s); const svg = U.types[e.type].draw({ ent: e, props: D[id].props || e.props, d: D[id], out: D[id].out, w: U.types[e.type].size({ props: e.props })[0], h: 400, t: 0, n: 0, masked: !!masked, scene: s }); return Array.from(svg.matchAll(/data-pick-set="([^"]*)"/g)).map((m) => JSON.parse(decodeURIComponent(m[1]))); };
  const has = (L, o) => L.some((x) => bigStr(x) === bigStr(o));
  const apply = (s, id, o) => { for (const k of Object.keys(o)) W.act(s, { t: 'set', id, k, v: o[k] }); };
  const outOf = (s, id, port) => Q.show(W.evaluate(s)[id].out[port].data);
  t('海龟：先猜在卡片上点“会回到起点 / 回不到”；n、a、k、目标图、先猜都不进“✎ 填写”', () => {
    const s = W.blank(), id = W.add(s, 'turtle', 0, 0, { tgt: 1 }), d = U.types.turtle;
    for (const k of ['n', 'a', 'k', 'tgt', 'gans']) truthy(d.props[k].hidden, k + ' 应 hidden');
    eq(patchesOf(s, id, true), [], '还没有程序：不问');
    for (const v of [4, 1, 2, 5]) W.act(s, { t: 'set', id, k: 'add', v });
    const L = patchesOf(s, id, true); truthy(has(L, { gans: 1 }) && has(L, { gans: 2 }), bigStr(L));
    apply(s, id, { gans: 1 }); eq(outOf(s, id, 'closed'), '1'); eq(outOf(s, id, 'match'), '1');
    eq(patchesOf(s, id, false), [], '猜过了：按钮收起');
  });
  t('剪拼：直角边 − / +、夹角三个按钮、先猜三个答案都在卡片上', () => {
    const s = W.blank(), id = W.add(s, 'dissect', 0, 0, { scene: 0, a: 3, b: 4, angle: 2 }), d = U.types.dissect;
    for (const k of ['scene', 'a', 'b', 'angle', 'r', 'n', 'gans']) truthy(d.props[k].hidden, k + ' 应 hidden');
    const L = patchesOf(s, id, true);
    for (const o of [{ a: 2 }, { a: 4 }, { b: 3 }, { b: 5 }, { angle: 0 }, { angle: 1 }, { angle: 2 }, { gans: 1 }, { gans: 2 }, { gans: 3 }]) truthy(has(L, o), bigStr(o) + ' 不在卡片上');
    apply(s, id, { gans: 3 }); apply(s, id, { angle: 1 }); eq(outOf(s, id, 'c2'), '25'); eq(outOf(s, id, 'guessed'), '1');
    const s2 = W.blank(), i2 = W.add(s2, 'dissect', 0, 0, { scene: 1, r: 1, n: 4 }), L2 = patchesOf(s2, i2, true);
    truthy(has(L2, { r: 2 }) && !has(L2, { r: 0 }) && has(L2, { gans: 1 }), '圆：半径到 1 不能再减；先猜三个答案');
  });
  t('钉板：公式系数按 ½ 一格调，先猜面积先调草稿再点“猜好了”', () => {
    const s = W.blank(), id = W.add(s, 'geoboard', 0, 0, {}), d = U.types.geoboard;
    for (const k of ['fa', 'fb', 'fc', 'gans', 'gt']) truthy(d.props[k].hidden, k + ' 应 hidden');
    let L = patchesOf(s, id, true);
    for (const o of [{ fa: '1/2' }, { fa: '3/2' }, { fb: '1/2' }, { fc: '-1/2' }, { fc: '1/2' }, { gt: 1 }, { gt: 2 }, { gans: '0' }]) truthy(has(L, o), bigStr(o) + ' 不在卡片上');
    truthy(!has(L, { gt: -1 }), '草稿不能小于 0');
    apply(s, id, { gt: 12 }); L = patchesOf(s, id, true); truthy(has(L, { gans: '6' }), '草稿 12 → 猜 6');
    apply(s, id, { fc: '5' }); truthy(!patchesOf(s, id, true).some((o) => 'fc' in o && o.fc === '11/2'), '系数到 5 不再加');
    // 用卡片上的补丁凑出皮克公式：fb 1 → 1/2，fc 0 → −1/2 → −1
    const s3 = W.blank(), g = W.add(s3, 'geoboard', 0, 0, {}), poly = (P) => { for (const [x, y] of P) W.act(s3, { t: 'set', id: g, k: 'pt', v: y * 7 + x + 1 }); W.act(s3, { t: 'set', id: g, k: 'pt', v: P[0][1] * 7 + P[0][0] + 1 }); };
    for (const P of [[[0, 0], [2, 0], [2, 1], [0, 1]], [[0, 0], [3, 0], [0, 3]], [[0, 0], [4, 0], [3, 2], [1, 2]], [[0, 0], [3, 1], [1, 3]], [[0, 0], [2, 0], [2, 2], [0, 2]]]) { poly(P); W.act(s3, { t: 'set', id: g, k: 'rec', v: 1 }); }
    for (const o of [{ fb: '1/2' }, { fc: '-1/2' }, { fc: '-1' }]) { truthy(has(patchesOf(s3, g, false), o), bigStr(o)); apply(s3, g, o); }
    eq(outOf(s3, g, 'formula'), '1');
  });
  t('证明排序的证明编号、尺规作图的“作什么”、式子台的 a、b、c、d 是出题人设的：hidden', () => {
    truthy(U.types.proofsort.props.pid.hidden); truthy(U.types.compass.props.task.hidden);
    for (const k of ['a', 'b', 'c', 'd']) truthy(U.types.eqstepbench.props[k].hidden, 'eqstepbench.' + k);
  });
  t('总检查：题目里用到的器材，compactPorts 又没有把手的，不再有孩子要填的属性（write 且不 hidden）', () => {
    // 永久例外：{ 器材: { 属性: 理由 } }。现在没有。
    const ALLOW = {};
    // 暂时例外：别的组正在改，合并时删掉
    const TEMP = {
      fmachine: '函数机一组在改', guessrule: '函数机一组在改', asn: '函数机一组在改', newop: '函数机一组在改', twoways: '函数机一组在改', ptree: '函数机一组在改',
      approach: '探究一组在改', optimize: '探究一组在改', scale: '探究一组在改', shadow: '探究一组在改', spheretri: '探究一组在改', taxi: '探究一组在改',
      hanoi: '游戏一组在改', nim: '游戏一组在改', euler: '游戏一组在改', net: '游戏一组在改', cubes: '游戏一组在改', primeblocks: '游戏一组在改',
    };
    const used = new Set(); for (const p of U.problems) { (p.shelf || []).forEach((x) => used.add(x)); Object.values(p.build().entities).forEach((e) => used.add(e.type)); }
    const bad = [];
    for (const ty of used) {
      const d = U.types[ty]; if (!d || !d.compactPorts || d.grips || TEMP[ty]) continue;
      for (const k of Object.keys(d.props)) if (d.props[k].write && !d.props[k].hidden && !(ALLOW[ty] && ALLOW[ty][k])) bad.push(ty + '.' + k);
    }
    eq(bad, [], '还要打开属性面板填的');
  });
}
console.log('\n' + pass + ' 通过，' + fail + ' 失败');
process.exit(fail ? 1 : 0);
