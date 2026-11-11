/* node tests/ui-frac.js —— 块的分数吸附与存档迁移（真实鼠标），docs 里的“分数吸附”。
 * 工作区里：三角形 ABC（A(0,0)、B(3,0)、C(0,4)），三边中点 (3/2, 0)、(3/2, 2)、(0, 2)（前两个是分数）；
 *   一个块（三角形，放在 (-7, -5) 附近，离 ABC 远）。
 * (F1) 块的一个顶点拖到 AB 的中点 (3/2, 0) 附近（屏幕上 2 像素内），松手后顶点精确落在 (3/2, 0)；
 *      块的平移量是分数（存成 "n/d" 字符串，精确）；拖动时画布上写出“中点”。
 * (F2) 撤销一次：平移回到 0，顶点回到原来的地方。
 * (F3) 按住 Alt 拖到同一个中点：不吸附，平移量是整数（数字），顶点不在分数中点上。
 * (F4) 存档：分数平移存盘再读回不丢；v5 旧存档（平移是 {n, d} 写法）打开后版本升到 6，平移规范成 "1/2"。
 * 每次手势后检查不变量（tests/gestures.js）；没有页面错误和控制台错误。需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const G = require('./gestures');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  G.attachErrorCollector(p);
  await p.goto(url); await p.waitForTimeout(300);
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); });
  await p.waitForTimeout(150);

  const scr = (ws, pts) => p.evaluate(({ ws, pts }) => {
    const wb = document.querySelector('svg.wsbody[data-wsid="' + ws + '"]');
    const r = wb.getBoundingClientRect(), vw = UI.Stage.rangeOf(ws), sc = UI.Space.canvasOf(r, vw.span);
    return pts.map((q) => UI.Space.workspaceToScreen(q, vw, sc));
  }, { ws, pts });
  const unit = () => p.evaluate((ws) => { const wb = document.querySelector('svg.wsbody[data-wsid="' + ws + '"]'); return UI.Space.canvasOf(wb.getBoundingClientRect(), UI.Stage.rangeOf(ws).span).unit; }, ws);
  const canvasText = () => p.evaluate(() => [...document.querySelectorAll('svg.wsbody text')].map((t) => t.textContent).join('|'));
  const pieceOf = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'gpiece'); return e ? e.id : null; });
  const dxdy = (id) => p.evaluate((id) => { const e = UI.S.scene.entities[id]; return [e.props.dx, e.props.dy]; }, id);
  // 块的顶点（精确，字符串）：[ [x, y], … ]
  const verts = (id) => p.evaluate((id) => UI.S.D[id].out.f.data.pts.map((q) => [U.Q.show(q.x), U.Q.show(q.y)]), id);
  const undoLen = () => p.evaluate(() => UI.S.undo.length);
  const back = async () => { await G.undo(p); await p.waitForTimeout(150); };
  const inv = (label) => G.assertInvariants(p, label);

  let pieceId = null, ws = null;
  try {
    console.log('搭场景：工作区里 ABC（A(0,0)、B(3,0)、C(0,4)）和一个块（三角形，放在 (-7, -5) 附近）');
    const ws0 = await p.evaluate(() => {
      const A = UI.App;
      const ws = A.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id;
      const pt = (x, y) => { const n = A.act({ t: 'add', type: 'gpt', x: 0, y: 0, props: { x, y } }).id; A.act({ t: 'put', id: n, parent: ws, slot: 'items' }); return n; };
      const a = pt(0, 0), bb = pt(3, 0), c = pt(0, 4);
      const g = A.act({ t: 'add', type: 'gpoly', x: 0, y: 0 }).id;
      [a, bb, c].forEach((q) => A.act({ t: 'link', from: q, fromPort: 'p', to: g, toPort: 'pts' }));
      A.act({ t: 'put', id: g, parent: ws, slot: 'items' });
      const tri = A.act({ t: 'add', type: 'ftri', x: 0, y: 0 }).id;
      const r = A.act({ t: 'wsdrop', id: tri, ws, x: -7, y: -5 });
      if (!r.ok) throw new Error('放块失败：' + r.why);
      UI.Stage.fit(); UI.Stage.render();
      return ws;
    });
    ws = ws0;
    await p.waitForTimeout(250);
    pieceId = await pieceOf();
    ok(!!pieceId && !!ws, '搭场景：工作区、ABC 和一个块都放好');
    await inv('搭场景');

    // 块的第一个顶点 Vb（精确）；目标是 AB 的中点 M = (3/2, 0)；需要的平移 T = M − Vb（分数）
    const T = await p.evaluate((id) => {
      const q = UI.S.D[id].out.f.data.pts[0];
      const tx = U.Q.sub(U.Q(3, 2), q.x), ty = U.Q.sub(U.Q(0), q.y);
      return { x: U.Q.show(tx), y: U.Q.show(ty), xn: U.Q.num(tx), yn: U.Q.num(ty) };
    }, pieceId);
    // 放进工作区时块的平移已经不是 0（落点决定），所以期望值 = 起始平移 + T（精确相加，规范形式）
    const [dx0, dy0] = await dxdy(pieceId);
    const sum = await p.evaluate(({ a, b, t }) => [U.Q.store(U.Q.add(U.Q.parse(a), U.Q.parse(t.x))), U.Q.store(U.Q.add(U.Q.parse(b), U.Q.parse(t.y)))], { a: dx0, b: dy0, t: T });
    const wantDx = sum[0], wantDy = sum[1];
    ok(typeof wantDx === 'string' && wantDx.indexOf('/') >= 0, '(F1 前提) 起始平移 (' + dx0 + ', ' + dy0 + ')，加上到 AB 中点的平移，结果是分数 dx ' + wantDx + '：块的顶点要落在分数中点上');

    // 块上一个能按下去的点（块的中心，取它的三角形重心；要是块自己的 data-drag 元素）
    const center = await p.evaluate((id) => {
      const pts = UI.S.D[id].out.f.data.pts, n = pts.length;
      return { x: pts.reduce((s, q) => s + U.Q.num(q.x), 0) / n, y: pts.reduce((s, q) => s + U.Q.num(q.y), 0) / n };
    }, pieceId);
    const [cs] = await scr(ws, [center]);
    const hitOK = await p.evaluate(({ x, y, id }) => { const el = document.elementFromPoint(x, y); const d = el && el.closest && el.closest('[data-drag]'); return !!d && d.dataset.drag === id; }, { x: cs.x, y: cs.y, id: pieceId });
    ok(hitOK, '块的中心是块自己的图形（能用鼠标按下去）');

    const u = await unit();
    const dragTo = async (dx, dy, o) => {
      await p.mouse.move(cs.x, cs.y); await p.mouse.down();
      if (o && o.alt) await p.keyboard.down('Alt');
      await p.mouse.move(cs.x + dx, cs.y + dy, { steps: 10 });
      await p.waitForTimeout(120);
      const hold = await canvasText();
      await p.mouse.up();
      if (o && o.alt) await p.keyboard.up('Alt');
      await p.waitForTimeout(250);
      return hold;
    };

    // ---------- (F1) 拖到 AB 的中点：顶点精确落在 (3/2, 0) ----------
    // 鼠标多走 2 像素（在吸附半径 6 像素里）：屏幕上 x 右移 T.x、y 上移 T.y（世界 y 朝上）
    const hold1 = await dragTo(T.xn * u + 2, -T.yn * u + 1);
    await inv('拖块到 AB 的中点');
    const [dx1, dy1] = await dxdy(pieceId);
    ok(JSON.stringify([dx1, dy1]) === JSON.stringify([wantDx, wantDy]), '(F1) 块的平移量是精确的分数：dx = ' + JSON.stringify(dx1) + '，dy = ' + JSON.stringify(dy1) + '（期望 ' + JSON.stringify([wantDx, wantDy]) + '）');
    const vs1 = await verts(pieceId);
    ok(vs1.some((q) => q[0] === '3/2' && q[1] === '0'), '(F1) 块的顶点精确落在 AB 的中点 (3/2, 0) 上：' + JSON.stringify(vs1));
    ok(hold1.indexOf('中点') >= 0, '(F1) 拖动时画布上写出“中点”：「' + hold1.slice(0, 80) + '」');

    // ---------- (F2) 撤销一次：平移回到 0 ----------
    const uDone = await undoLen();
    await back();
    await inv('撤销块的分数拖动');
    const [dx2, dy2] = await dxdy(pieceId);
    ok(dx2 === dx0 && dy2 === dy0, '(F2) 撤销后平移回到起始 (' + dx0 + ', ' + dy0 + ')：' + JSON.stringify([dx2, dy2]) + '，撤销栈 ' + uDone + ' 步');
    ok(!(await verts(pieceId)).some((q) => q[0] === '3/2' && q[1] === '0'), '(F2) 撤销后顶点不再在 (3/2, 0)');

    // ---------- (F3) 按住 Alt 拖到同一个中点：不吸附，平移是整数 ----------
    await dragTo(T.xn * u + 2, -T.yn * u + 1, { alt: true });
    await inv('按住 Alt 拖块');
    const [dx3, dy3] = await dxdy(pieceId);
    ok(Number.isInteger(dx3) && Number.isInteger(dy3), '(F3) 按住 Alt：不吸附，平移量是整数：' + JSON.stringify([dx3, dy3]));
    ok(!(await verts(pieceId)).some((q) => q[0] === '3/2' && q[1] === '0'), '(F3) 按住 Alt：顶点没有落在分数中点上');
    await back();
    await inv('撤销 Alt 拖动');

    // ---------- (F4) 存档：分数平移存盘再读回不丢；v5 旧存档迁移 ----------
    await dragTo(T.xn * u + 2, -T.yn * u + 1);
    const rt = await p.evaluate((id) => U.World.load(U.World.save(UI.S.scene)).entities[id].props, pieceId);
    ok(rt.dx === wantDx && rt.dy === wantDy, '(F4) 分数平移存盘再读回：dx ' + JSON.stringify(rt.dx) + '、dy ' + JSON.stringify(rt.dy));
    const oldSave = await p.evaluate((id) => {
      const sc = U.JSON.parse(U.World.save(UI.S.scene));
      sc.v = 5;
      sc.entities[id].props.dx = { n: '1', d: '2' };   // 旧台面里的 {n, d} 写法，v6 迁移后成 "1/2"
      sc.entities[id].props.dy = 2;
      return U.JSON.stringify(sc);
    }, pieceId);
    await p.evaluate((s) => localStorage.setItem('universe-free-v1', s), oldSave);
    await p.reload(); await p.waitForTimeout(500);
    const mig = await p.evaluate((id) => ({ v: UI.S.scene.v, dx: UI.S.scene.entities[id] && UI.S.scene.entities[id].props.dx, dy: UI.S.scene.entities[id] && UI.S.scene.entities[id].props.dy }), pieceId);
    ok(mig.v === 7 && mig.dx === '1/2' && mig.dy === 2, '(F4) v5 旧存档打开后版本 ' + mig.v + '（当前版本 ' + 7 + '），平移 dx ' + JSON.stringify(mig.dx) + '、dy ' + JSON.stringify(mig.dy) + '（期望 "1/2"、2）');
    await inv('打开 v5 旧存档');
  } catch (e) {
    fail++; console.log('  FAIL 测试中断：' + e.message);
  }

  ok(errs.length === 0, '没有控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n分数吸附测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})();
