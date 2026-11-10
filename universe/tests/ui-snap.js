/* node tests/ui-snap.js —— 吸附到构造点（V4，docs/ui-geometry-feedback.md 1.3 和第 3 节 V4）。
 * 用真实鼠标：工作区里有自由点 A(0,0)、B(5,1)、C(1,4)，线段 AB、BC。BC 的中点是 (3, 5/2)，不是整数格点。
 *   (a) 画线：第一下点 A（吸附到顶点），第二下点在 BC 的中点附近：应吸附到中点，背后建一个中点器材（gmid），
 *       它的两个输入连到 B、C；台面上没有多出自由点；这一整串是一个撤销项；
 *   (b) 拖动 B：中点跟着 BC 动，新线段的端点也跟着动（中点是构造出来的，不是孤立的自由点）；
 *   (c) 拖动 A：新线段的起点跟着 A 动。
 * 不按器材名判断吸附类型：吸附的种类从器材的 snap 声明读取（geo 包里 gmid 的声明）。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const G = require('./gestures');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (u, v) => !!u && !!v && Math.abs(u[0] - v[0]) < 1e-9 && Math.abs(u[1] - v[1]) < 1e-9;

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  G.attachErrorCollector(p);
  await p.goto(url); await p.waitForTimeout(300);
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); });
  await p.waitForTimeout(150);

  console.log('搭场景：工作区里 A(0,0)、B(5,1)、C(1,4)，线段 AB、BC');
  const ids = await p.evaluate(() => {
    const A = UI.App;
    const ws = A.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id;
    const pt = (name, x, y) => {
      const n = A.act({ t: 'add', type: 'gpt', x: 0, y: 0, props: { x, y, mark: name } }).id;
      A.act({ t: 'put', id: n, parent: ws, slot: 'items' });
      return n;
    };
    const seg = (p1, p2) => {
      const s = A.act({ t: 'add', type: 'gseg', x: 0, y: 0 }).id;
      A.act({ t: 'link', from: p1, fromPort: 'p', to: s, toPort: 'a' });
      A.act({ t: 'link', from: p2, fromPort: 'p', to: s, toPort: 'b' });
      A.act({ t: 'put', id: s, parent: ws, slot: 'items' });
      return s;
    };
    const a = pt('A', 0, 0), bb = pt('B', 5, 1), c = pt('C', 1, 4);
    seg(a, bb); seg(bb, c);
    UI.Stage.fit(); UI.Stage.render();
    return { ws, a, b: bb, c };
  });
  await p.waitForTimeout(250);
  ok(!!ids.ws, '工作区和 A、B、C、线段 AB、BC 放好');

  // 屏幕坐标：A 和 BC 的中点 (3, 5/2)
  const scr = (pts) => p.evaluate(({ ws, pts }) => {
    const wb = document.querySelector('svg.wsbody[data-wsid="' + ws + '"]');
    const r = wb.getBoundingClientRect(), vw = UI.Stage.rangeOf(ws), sc = UI.Space.canvasOf(r, vw.span);
    return pts.map((q) => UI.Space.workspaceToScreen(q, vw, sc));
  }, { ws: ids.ws, pts });
  const ents = (t) => p.evaluate((t) => Object.values(UI.S.scene.entities).filter((e) => e.type === t).map((e) => e.id), t);
  const gpCount = async () => (await ents('gpt')).length;
  const undoLen = () => p.evaluate(() => UI.S.undo.length);
  const outOf = (id, port) => p.evaluate(({ id, port }) => {
    const o = UI.S.D[id] && UI.S.D[id].out && UI.S.D[id].out[port];
    if (!o || !o.data || !o.data.pts) return null;
    return o.data.pts.map((q) => [U.Q.num(q.x), U.Q.num(q.y)]);
  }, { id, port });

  try {
    // ---- (a) 画线：A 到 BC 的中点 ----
    const [pA, pM] = await scr([{ x: 0, y: 0 }, { x: 3, y: 2.5 }]);
    const undoBefore = await undoLen();
    ok((await ents('gmid')).length === 0 && (await gpCount()) === 3, '开始：没有中点器材，自由点 3 个（A、B、C）');
    await p.locator('[data-ws-tool="seg"][data-ws="' + ids.ws + '"]').first().click();
    await p.waitForTimeout(120);
    await p.mouse.move(pA.x, pA.y); await p.mouse.click(pA.x, pA.y); await p.waitForTimeout(80);
    await p.mouse.move(pM.x + 1, pM.y + 1, { steps: 6 }); await p.waitForTimeout(80);
    await p.mouse.click(pM.x + 1, pM.y + 1); await p.waitForTimeout(250);

    const gms = await ents('gmid');
    ok(gms.length === 1, '(a) 画线到 BC 的中点：背后建了一个中点器材（gmid），实际 ' + gms.length + ' 个');
    const gm = gms[0] || null;
    const feeds = gm ? await p.evaluate((gm) => UI.S.scene.links.filter((l) => l.to === gm).map((l) => ({ port: l.toPort, from: l.from })), gm) : [];
    const fedBy = (port, id) => feeds.some((f) => f.port === port && f.from === id);
    ok(fedBy('a', ids.b) && fedBy('b', ids.c), '(a) 中点器材的输入 a、b 分别接在 B、C 上');
    ok((await gpCount()) === 3, '(a) 台面上没有多出自由点（自由点还是 3 个）');
    const undoDelta = (await undoLen()) - undoBefore;
    ok(undoDelta === 1, '(a) 整串（中点 + 线段）是一个撤销项（撤销栈增加 ' + undoDelta + '）');

    const newSeg = gm ? await p.evaluate((gm) => {
      const l = UI.S.scene.links.find((x) => x.from === gm && x.fromPort === 'p');
      return l ? l.to : null;
    }, gm) : null;
    ok(!!newSeg, '(a) 新线段的一端接在中点器材的输出口 p 上（不是自由点）');
    const e0 = newSeg ? await outOf(newSeg, 's') : null;
    ok(!!e0 && near(e0[0], [0, 0]) && near(e0[1], [3, 2.5]), '(a) 线段从 A (0, 0) 到中点 (3, 5/2)：' + JSON.stringify(e0));

    // 结束画线模式（再点一次同一个工具按钮）
    await p.locator('[data-ws-tool="seg"][data-ws="' + ids.ws + '"]').first().click();
    await p.waitForTimeout(120);

    // ---- (b) 拖动 B（右移一格）：中点、线段端点跟着动 ----
    const unit = await p.evaluate((ws) => document.querySelector('svg.wsbody[data-wsid="' + ws + '"]').getBoundingClientRect().width / UI.Stage.rangeOf(ws).span, ids.ws);
    const dragBy = async (id, dx) => {
      const bx = await p.locator('circle[data-drag="' + id + '"]').first().boundingBox();
      const cx = bx.x + bx.width / 2, cy = bx.y + bx.height / 2;
      await p.mouse.move(cx, cy); await p.mouse.down(); await p.mouse.move(cx + dx * unit, cy, { steps: 10 }); await p.mouse.up();
      await p.waitForTimeout(250);
    };
    await dragBy(ids.b, 1);
    const mAfterB = gm ? await outOf(gm, 'p') : null;
    ok(!!mAfterB && near(mAfterB[0], [3.5, 2.5]), '(b) 拖动 B 右移一格：中点跟着动到 (7/2, 5/2)：' + JSON.stringify(mAfterB));
    const eAfterB = newSeg ? await outOf(newSeg, 's') : null;
    ok(!!eAfterB && near(eAfterB[1], [3.5, 2.5]), '(b) 辅助线的终点跟着中点动：' + JSON.stringify(eAfterB));

    // ---- (c) 拖动 A（右移一格）：线段起点跟着 A 动 ----
    await dragBy(ids.a, 1);
    const eAfterA = newSeg ? await outOf(newSeg, 's') : null;
    ok(!!eAfterA && near(eAfterA[0], [1, 0]), '(c) 拖动 A 右移一格：辅助线的起点跟着 A 动到 (1, 0)：' + JSON.stringify(eAfterA));
  } catch (e) {
    fail++; console.log('  FAIL 测试中断：' + e.message);
  }

  ok(errs.length === 0, '没有控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n吸附到构造点测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})();
