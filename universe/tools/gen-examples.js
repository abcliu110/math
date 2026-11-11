/* node tools/gen-examples.js —— 生成“示例”菜单要用的已完成场景（problems/examples-data.js）。
 * 对每道 combo-* 题：build 摆好器材 → tests/solutions-combo.js 的参考解接线（循环题走 5 拍）→ 按数据流自动排版 → 存成 JSON。
 * 排版：每个器材的列 = 它到输入源的最长链长（没有输入的在第 0 列），同一列按摆放顺序往下排。
 * 运行后会打印每道示例里读数器的值，方便核对。 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'tools/check-types.js'), 'utf8');
const files = eval(src.match(/const files = (\[[\s\S]*?\])\.concat/)[1]).concat(
  fs.readdirSync(path.join(root, 'packs')).filter((f) => f.endsWith('.js')).sort().map((f) => 'packs/' + f));
const ctx = vm.createContext({ console }); ctx.globalThis = ctx;
const load = (f) => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
for (const f of files) load(f);
load('problems/starter.js');
for (const f of fs.readdirSync(path.join(root, 'problems')).sort()) if (f !== 'starter.js' && f.endsWith('.js') && f !== 'examples-data.js') load('problems/' + f);
const U = ctx.U, W = U.World;
const SOL = require(path.join(root, 'tests/solutions-combo.js'));

const X0 = 50, Y0 = 50, GAP_X = 110, GAP_Y = 64, GAP_COMP = 90, WRAP_W = 1250;

// 器材的大小：和界面一样，用 size(实体)（实体上手动改过的 w、h 优先）；拿不到就按小卡片估
function sizeOf(e) {
  const d = U.types[e.type];
  try { const z = d && d.size && d.size(e); if (z && z[0] > 0 && z[1] > 0) return [e.w > 0 ? e.w : z[0], e.h > 0 ? e.h : z[1]]; } catch (err) { /* 用默认 */ }
  return [120, 80];
}

// 排版：
//   1. 连通的一组器材（一条或一张数据流）自己排成一个“块”：从左到右按“离输入源多远”分列；
//      列里器材太多（超过 MAX_ROWS 个）就分成并排的几个小列；列里的顺序按“输入来自上面还是下面”排（重心法），连线少交叉；
//      列整体上下居中。用器材的真实大小，保证不重叠。
//   2. 各个块像书架一样排：一行放不下（超过 WRAP_W）就换行，整个场景接近方形，不会又高又窄。
//   3. 没有任何连线的器材最后横着排。
const MAX_ROWS = 5;
function layoutComp(s, comp) {
  const depth = {}; comp.forEach((id) => { depth[id] = 0; });
  for (let round = 0; round < comp.length; round++) {
    let changed = false;
    for (const l of s.links) {
      if (!(l.from in depth) || !(l.to in depth) || l.from === l.to) continue;
      const d = depth[l.from] + 1;
      if (d > depth[l.to] && d < comp.length) { depth[l.to] = d; changed = true; }
    }
    if (!changed) break;
  }
  const byDepth = {}; comp.forEach((id) => { (byDepth[depth[id]] = byDepth[depth[id]] || []).push(id); });
  const keys = Object.keys(byDepth).map(Number).sort((p, q) => p - q);
  const rank = {}, vcols = [];
  for (const k of keys) {
    let list = byDepth[k];
    if (k > 0) {
      const bary = (id) => {
        const ps = s.links.filter((l) => l.to === id && l.from in rank && depth[l.from] < k).map((l) => rank[l.from]);
        return ps.length ? ps.reduce((p, q) => p + q, 0) / ps.length : 0.5;
      };
      list = list.map((id, i) => ({ id, i, b: bary(id) })).sort((p, q) => p.b - q.b || p.i - q.i).map((x) => x.id);
    }
    list.forEach((id, i) => { rank[id] = (i + 0.5) / list.length; });
    const n = Math.ceil(list.length / MAX_ROWS), per = Math.ceil(list.length / n);
    for (let c = 0; c < n; c++) vcols.push({ ids: list.slice(c * per, (c + 1) * per) });
  }
  for (const vc of vcols) {
    vc.w = Math.max(...vc.ids.map((id) => sizeOf(s.entities[id])[0]));
    vc.h = vc.ids.reduce((h, id) => h + sizeOf(s.entities[id])[1], 0) + GAP_Y * (vc.ids.length - 1);
  }
  const H = Math.max(...vcols.map((vc) => vc.h));
  const items = []; let x = 0;
  for (const vc of vcols) {
    let yy = (H - vc.h) / 2;
    for (const id of vc.ids) { const [w, h] = sizeOf(s.entities[id]); items.push({ id, x: x + (vc.w - w) / 2, y: yy }); yy += h + GAP_Y; }
    x += vc.w + GAP_X;
  }
  return { items, w: x - GAP_X, h: H };
}
function layout(s) {
  const ids = Object.keys(s.entities);
  const parent = {}; ids.forEach((id) => { parent[id] = id; });
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  for (const l of s.links) parent[find(l.from)] = find(l.to);
  const comps = {}; ids.forEach((id) => { (comps[find(id)] = comps[find(id)] || []).push(id); });
  const order = Object.values(comps).sort((p, q) => ids.indexOf(p[0]) - ids.indexOf(q[0]));
  const blocks = order.filter((c) => c.length > 1).map((c) => layoutComp(s, c));
  // 没有连线的器材：每个自成一个小块
  for (const c of order.filter((c) => c.length === 1)) { const [w, h] = sizeOf(s.entities[c[0]]); blocks.push({ items: [{ id: c[0], x: 0, y: 0 }], w, h }); }
  // 一行放多宽：按所有块的总面积定，让整个场景略宽于高（约 1.3 : 1），不会又高又窄
  const area = blocks.reduce((t, bl) => t + (bl.w + GAP_COMP) * (bl.h + GAP_COMP), 0);
  const wrapW = Math.max(WRAP_W, Math.round(Math.sqrt(area * 1.3)), ...blocks.map((bl) => bl.w));
  let x = X0, y = Y0, rowH = 0;
  for (const bl of blocks) {
    if (x > X0 && x + bl.w > wrapW) { x = X0; y += rowH + GAP_COMP; rowH = 0; }
    for (const it of bl.items) { s.entities[it.id].x = Math.round(x + it.x); s.entities[it.id].y = Math.round(y + it.y); }
    x += bl.w + GAP_COMP; rowH = Math.max(rowH, bl.h);
  }
}

function harness(s) {
  return {
    add(type, props) { const r = W.act(s, { t: 'add', type, x: 0, y: 0, props }); if (!r.ok) throw new Error(r.why); return r.id; },
    link(from, to, toPort, fromPort) { const r = W.act(s, { t: 'link', from, to, toPort, fromPort }); if (!r.ok) throw new Error('连线失败：' + r.why); },
    set(id, k, v) { const r = W.act(s, { t: 'set', id, k, v }); if (!r.ok) throw new Error(r.why); },
    U, props(id) { return s.entities[id].props; },
    role(r) { const e = Object.values(s.entities).find((x) => x.role === r); if (!e) throw new Error('没有角色 ' + r); return e.id; },
    run(n) { for (let i = 0; i < n; i++) W.tick(s); },
  };
}

const out = [];
const readings = (s, D) => Object.keys(s.entities).filter((id) => s.entities[id].type === 'meter').map((id) => {
  const v = D[id] && D[id].out && D[id].out.v;
  const q = v && v.kind === 'num' ? U.Q.num(v.data) : null;
  return (s.entities[id].props.label || s.entities[id].role) + '=' + (q === null ? '—' : +q.toFixed(4));
});

// 1. 综合示例（tools/examples-src.js）：大场景，很多器材配合着用
for (const sp of require(path.join(root, 'tools/examples-src.js')).concat(require(path.join(root, 'tools/examples-src2.js')))) {
  const s = W.blank(), ids = {};
  for (const [role, type, props] of sp.ents) {
    const r = W.act(s, { t: 'add', type, x: 0, y: 0, props: props || {} });
    if (!r.ok) throw new Error(sp.id + ' 加器材失败 ' + type + '：' + r.why);
    s.entities[r.id].role = role; ids[role] = r.id;
  }
  for (const [child, parentRole, slot] of sp.puts || []) {   // 放进容器（几何工作区的 items 槽）
    const r = W.act(s, { t: 'put', id: ids[child], parent: ids[parentRole], slot });
    if (!r.ok) throw new Error(sp.id + ' 放进容器失败 ' + child + ' → ' + parentRole + '：' + r.why);
  }
  for (const [a, b, toPort, fromPort] of sp.links) {
    if (!ids[a] || !ids[b]) throw new Error(sp.id + ' 连线的角色不存在：' + a + ' → ' + b);
    const r = W.act(s, { t: 'link', from: ids[a], to: ids[b], toPort, fromPort });
    if (!r.ok) throw new Error(sp.id + ' 连线失败 ' + a + ' → ' + b + '：' + r.why);
  }
  for (let i = 0; i < (sp.run || 0); i++) W.tick(s);
  layout(s);
  const D = W.evaluate(s);
  console.log(sp.id.padEnd(28), Object.keys(s.entities).length + ' 个器材 ' + s.links.length + ' 条线  ', readings(s, D).join('  '));
  out.push({ id: sp.id, kind: '综合', title: sp.title, hook: sp.hook, grade: sp.grade, domain: sp.domain, scene: W.save(s) });
}

// 2. 小示例（combo-* 题）：几台器材配合；用参考解接线
for (const p of U.problems.filter((x) => /^combo-/.test(x.id))) {
  const s = p.build();
  const fn = SOL[p.id];
  if (!fn) throw new Error('缺参考解：' + p.id);
  fn(harness(s));
  layout(s);
  const D = W.evaluate(s);
  console.log(p.id.padEnd(28), readings(s, D).join('  '));
  out.push({ id: p.id, kind: '小示例', title: p.title, hook: p.hook || '', grade: p.grade, domain: p.domain, scene: W.save(s) });
}
const NL = String.fromCharCode(10);
const body = ['/* 由 tools/gen-examples.js 生成，不要手改。示例菜单用的已完成场景。 */',
  '(function (G) {',
  "  'use strict';",
  '  G.U.EXAMPLES = ' + JSON.stringify(out) + ';',
  "})(typeof globalThis !== 'undefined' ? globalThis : window);", ''].join(NL);
const target = path.join(root, 'problems/examples-data.js');
if (process.argv.includes('--check')) {   // 只检查：生成结果和现在的文件一致吗（不一致就失败，先运行 node tools/gen-examples.js）
  const cur = fs.existsSync(target) ? fs.readFileSync(target, 'utf8').split(String.fromCharCode(13, 10)).join(NL) : '';
  if (cur !== body) { console.error('problems/examples-data.js 过期了：运行 node tools/gen-examples.js 重新生成'); process.exit(1); }
  console.log('problems/examples-data.js 是最新的'); process.exit(0);
}
fs.writeFileSync(target, body);
console.log('写入 problems/examples-data.js（' + out.length + ' 个示例）');
