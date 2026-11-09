/* node tests/ui-space.js —— 坐标换算层（U6，docs/ui-robustness.md 第 4.5 节和第 5 节 U6 验收，解决 P9）。
 * 1. 纯换算：屏幕 ↔ 台面 ↔ 工作区 互逆；同一屏幕点在不同缩放下换算回去仍是同一点；吸附结果是精确整数（格点、顶点）。
 * 2. 真值比对：工作区里 UI.Space.screenToWorkspace 的结果，和 svg 自己的 getScreenCTM() 算出来的一致（50%、100%、250%）。
 * 3. 台面：滚轮缩放以指针为中心（指针下的世界点不动）；缩放 50%、100%、200%、250% 后，用真实鼠标拖卡片，
 *    卡片跟着鼠标走，松手后落点与鼠标落点相差不超过 1 像素（缩放前先平移过一次）。
 * 4. 工作区：在 50% 和 250% 缩放下，用真实鼠标画点，落点是离真值最近的格点，且是整数。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const r2 = (v) => Math.round(v * 1000) / 1000;

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(400);

  console.log('纯换算：互逆，同一屏幕点在不同缩放下换算回去仍是同一点');
  const rt = await p.evaluate(() => {
    const Sp = UI.Space, out = { stage: 0, ws: 0, n: 0, maxErr: 0 };
    const st = document.querySelector('#stage').getBoundingClientRect();
    for (const z of [0.5, 1, 2.5]) {
      const view = { x: 137.25, y: -41.5, z };
      for (let i = 0; i < 30; i++) {
        const pt = { clientX: st.left + Math.random() * st.width, clientY: st.top + Math.random() * st.height };
        const w = Sp.localToStage(view, Sp.stageLocal(pt));
        const back = Sp.stageToLocal(view, w), loc = Sp.stageLocal(pt);
        out.maxErr = Math.max(out.maxErr, Math.abs(back.x - loc.x), Math.abs(back.y - loc.y));
        out.n++;
      }
      // 工作区：任意画布大小、范围，屏幕 → 工作区 → 屏幕 互逆
      const rect = { left: 300.5, top: 210.25, width: 380 * z, height: 272 * z };
      const sc = Sp.canvasOf(rect, 12.5);
      for (let i = 0; i < 30; i++) {
        const pt = { clientX: rect.left + Math.random() * rect.width, clientY: rect.top + Math.random() * rect.height };
        const vw = { cx: -1.25, cy: 2.5, span: 12.5 };
        const q = Sp.screenToWorkspace(pt, vw, sc), s2 = Sp.workspaceToScreen(q, vw, sc);
        out.maxErr = Math.max(out.maxErr, Math.abs(s2.x - pt.clientX), Math.abs(s2.y - pt.clientY));
        out.ws++;
      }
    }
    return out;
  });
  ok(rt.maxErr < 1e-6, '屏幕 ↔ 台面、屏幕 ↔ 工作区互逆（' + rt.n + ' + ' + rt.ws + ' 个随机点，最大误差 ' + rt.maxErr.toExponential(1) + ' 像素）');

  const ptest = await p.evaluate(() => {
    const Sp = UI.Space, out = {};
    // 吸附：顶点、格点都是整数；离顶点近就吸顶点，离格点近就吸格点
    const Q = U.Q, P = (x, y) => ({ x: Q(x), y: Q(y) });
    const fig = { type: 'polygon', pts: [P(2, 3), P(5, 3), P(5, 7)] };
    const vals = [{ key: 'T', fig }];
    const sA = Sp.snap(vals, { x: 2.2, y: 2.9 }, 20, { px: 9 });
    const sB = Sp.snap(vals, { x: 3.6, y: 9.4 }, 20, { px: 9 });
    out.vertex = [sA.x, sA.y];
    out.grid = [sB.x, sB.y];
    out.allInt = [sA, sB].every((s) => Number.isInteger(s.x) && Number.isInteger(s.y));
    // 挪到线段上的格点：线段 (2,3)-(5,3) 上离 (3.4, 3.2) 最近的整数格点是 (3,3)
    const sE = Sp.snap([{ key: 'T', fig: { type: 'segment', pts: [P(2, 3), P(5, 3)] } }], { x: 3.4, y: 3.2 }, 20, { px: 9 });
    out.edge = [sE.x, sE.y];
    return out;
  });
  ok(ptest.vertex[0] === 2 && ptest.vertex[1] === 3, '吸附：靠近顶点 (2,3) 时吸到顶点：' + JSON.stringify(ptest.vertex));
  ok(ptest.grid[0] === 4 && ptest.grid[1] === 9, '吸附：离格点近时吸到格点 (4,9)：' + JSON.stringify(ptest.grid));
  ok(ptest.edge[0] === 3 && ptest.edge[1] === 3, '吸附：边上的格点 (3,3)：' + JSON.stringify(ptest.edge));
  ok(ptest.allInt, '吸附坐标是精确整数（有理数），不是浮点近似');

  // 台面世界 → 工作区：卡片里画布的左上角（台面世界坐标，来自 DOM），换算后应当是可见范围的左上角
  const corner = await p.evaluate(() => {
    UI.App.openFree(); UI.App.act({ t: 'clear' });
    const ws = UI.S.scene.entities[UI.App.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id];
    const g = UI.Stage.geom(ws), vw = { cx: 1.5, cy: -2, span: 10 };
    UI.State.setUi(ws, 'view', vw); UI.Stage.render();
    const wb = document.querySelector('svg.wsbody[data-wsid="' + ws.id + '"]'), rect = wb.getBoundingClientRect();
    const W = +wb.getAttribute('width'), H = +wb.getAttribute('height');
    const tl = UI.Space.screenToStage({ clientX: rect.left, clientY: rect.top });
    const q = UI.Space.stageToWorkspace(tl, vw, UI.Space.canvasOf(rect, vw.span));
    return { x: q.x, y: q.y, wantX: vw.cx - vw.span / 2, wantY: vw.cy + (H / W) * vw.span / 2, gx: g.x, gy: g.y };
  });
  ok(Math.abs(corner.x - corner.wantX) < 1e-6 && Math.abs(corner.y - corner.wantY) < 1e-6, '台面 → 工作区：画布左上角换算后是可见范围的左上角 (' + r2(corner.x) + ', ' + r2(corner.y) + ')');

  console.log('台面：滚轮缩放以指针为中心');
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); UI.App.act({ t: 'add', type: 'num', x: 40, y: 40 }); UI.S.view = { x: 200, y: 150, z: 1 }; UI.Stage.render(); });
  await p.waitForTimeout(150);
  const wheelAt = { x: 620, y: 420 };
  const before = await p.evaluate(({ x, y }) => UI.Space.screenToStage({ clientX: x, clientY: y }), wheelAt);
  await p.mouse.move(wheelAt.x, wheelAt.y);
  await p.mouse.wheel(0, -300); await p.waitForTimeout(200);
  const afterZ = await p.evaluate(() => UI.S.view.z);
  const after = await p.evaluate(({ x, y }) => UI.Space.screenToStage({ clientX: x, clientY: y }), wheelAt);
  ok(afterZ !== 1, '滚轮改了缩放：' + afterZ);
  ok(Math.abs(before.x - after.x) < 1e-6 && Math.abs(before.y - after.y) < 1e-6, '缩放以指针为中心：指针下的世界点不动（误差 ' + Math.abs(before.x - after.x).toExponential(1) + '）');

  // 拖卡片的测试：先按 zoom 把视图摆好（卡片在台面中央），然后真实平移一下，再拖卡片
  const dragCase = async (z) => {
    await p.evaluate((z) => {
      const S = UI.S, e = Object.values(S.scene.entities).find((x) => x.type === 'num'), g = UI.Stage.geom(e), st = document.querySelector('#stage').getBoundingClientRect();
      S.view = { z, x: st.width / 2 - (g.x + g.w / 2) * z, y: st.height / 2 - (g.y + g.h / 2) * z };
      UI.Stage.render();
    }, z);
    await p.waitForTimeout(120);
    // 真实平移：在台面空白处拖一下（找一个没有卡片和端口的点）
    const empty = await p.evaluate(() => {
      const st = document.querySelector('#stage').getBoundingClientRect();
      for (let y = st.top + 20; y < st.bottom - 20; y += 23) for (let x = st.left + 20; x < st.right - 20; x += 23) {
        const el = document.elementFromPoint(x, y);
        if (el && el.closest('#stage') && !el.closest('.card, .pill, .port, .fab, #zoom, .pill, svg.wsbody')) return { x, y };
      }
      return null;
    });
    if (empty) { await p.mouse.move(empty.x, empty.y); await p.mouse.down(); await p.mouse.move(empty.x + 37, empty.y + 23, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(150); }
    const id = await p.evaluate(() => Object.values(UI.S.scene.entities).find((x) => x.type === 'num').id);
    const res = [];
    for (const [dx, dy] of [[173.3, 91.7], [-121.6, -55.2]]) {
      const hd = p.locator('.card[data-id="' + id + '"] .hd').first();
      await hd.scrollIntoViewIfNeeded();
      const hb = await hd.boundingBox();
      const G = { x: hb.x + hb.width / 2, y: hb.y + hb.height / 2 }, R = { x: G.x + dx, y: G.y + dy };
      await p.mouse.move(G.x, G.y); await p.mouse.down(); await p.mouse.move(R.x, R.y, { steps: 12 }); await p.mouse.up();
      await p.waitForTimeout(200);
      const hb2 = await p.locator('.card[data-id="' + id + '"] .hd').first().boundingBox();
      const G2 = { x: hb2.x + hb2.width / 2, y: hb2.y + hb2.height / 2 };
      res.push({ err: Math.hypot(G2.x - R.x, G2.y - R.y), dx: G2.x - G.x, dy: G2.y - G.y, want: [dx, dy] });
    }
    return { empty: !!empty, res };
  };
  console.log('台面：50%、100%、200%、250% 缩放下，真实鼠标拖卡片落点在 1 像素以内');
  for (const z of [0.5, 1, 2, 2.5]) {
    const r = await dragCase(z);
    ok(r.empty, z * 100 + '%：找到了台面空白处做平移');
    for (const k of r.res) ok(k.err <= 1, z * 100 + '%：卡片落点与鼠标落点相差 ' + k.err.toFixed(2) + ' 像素（卡片位移 ' + r2(k.dx) + ', ' + r2(k.dy) + '，鼠标位移 ' + k.want.join(', ') + '）');
  }

  console.log('工作区：坐标与 svg 真值一致；50% 和 250% 缩放下，真实鼠标画点落在离真值最近的整数格点上');
  for (const z of [0.5, 2.5]) {
    const id = await p.evaluate((z) => {
      UI.App.openFree(); UI.App.act({ t: 'clear' });
      const id = UI.App.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id;
      const S = UI.S, e = S.scene.entities[id], g = UI.Stage.geom(e), st = document.querySelector('#stage').getBoundingClientRect();
      S.view = { z, x: st.width / 2 - (g.x + g.w / 2) * z, y: st.height / 2 - (g.y + g.h / 2) * z };
      UI.State.setUi(e, 'view', { cx: 0.5, cy: -0.5, span: 12 });
      UI.Stage.render(); return id;
    }, z);
    await p.waitForTimeout(150);
    // 真值：svg 的 getScreenCTM 把屏幕点换到画布坐标，再换到工作区几何坐标（和 UI.Space 无关）
    const truth = await p.evaluate((id) => {
      const wb = document.querySelector('svg.wsbody[data-wsid="' + id + '"]'), m = wb.getScreenCTM().inverse();
      const W = +wb.getAttribute('width'), H = +wb.getAttribute('height'), v = UI.State.viewOf(UI.S.scene.entities[id]), s = W / v.span;
      const rect = wb.getBoundingClientRect(), pts = [];
      for (let i = 0; i < 9; i++) {
        const cx = rect.left + rect.width * (0.15 + 0.7 * (i % 3) / 2), cy = rect.top + rect.height * (0.15 + 0.7 * Math.floor(i / 3) / 2);
        const u = new DOMPoint(cx, cy).matrixTransform(m);
        pts.push({ sx: cx, sy: cy, tx: v.cx + (u.x - W / 2) / s, ty: v.cy - (u.y - H / 2) / s, ours: UI.Space.screenToWorkspace({ clientX: cx, clientY: cy }, v, UI.Space.canvasOf(rect, v.span)) });
      }
      return { W, H, span: v.span, maxErr: Math.max(...pts.map((q) => Math.max(Math.abs(q.tx - q.ours.x), Math.abs(q.ty - q.ours.y)))) };
    }, id);
    ok(truth.maxErr < 1e-6, z * 100 + '%：UI.Space.screenToWorkspace 与 svg 真值一致（最大误差 ' + truth.maxErr.toExponential(1) + '）');

    // 用真实鼠标画点：挑两个画布上没有被面板盖住的点（elementFromPoint 必须是这个 svg）
    const cand = await p.evaluate((id) => {
      const wb = document.querySelector('svg.wsbody[data-wsid="' + id + '"]'), rect = wb.getBoundingClientRect(), hit = [];
      for (let fy = 0.1; fy < 0.95; fy += 0.07) for (let fx = 0.1; fx < 0.95; fx += 0.07) {
        const x = rect.left + rect.width * fx, y = rect.top + rect.height * fy, el = document.elementFromPoint(x, y);
        if (el && el.closest && el.closest('svg.wsbody[data-wsid="' + id + '"]')) hit.push({ x, y });
      }
      return hit;
    }, id);
    const picks = [cand[Math.floor(cand.length * 0.2)], cand[Math.floor(cand.length * 0.8)]].filter(Boolean);
    ok(picks.length === 2, z * 100 + '%：画布上有两个可以点的位置（找到 ' + cand.length + ' 个）');
    await p.evaluate((id) => { UI.S.wsDraw = { ws: id, tool: 'seg', pend: null, cur: null }; UI.Stage.render(); }, id);
    await p.waitForTimeout(100);
    const expect = [];
    for (const q of picks) {
      const t = await p.evaluate(({ id, x, y }) => {
        const wb = document.querySelector('svg.wsbody[data-wsid="' + id + '"]'), rect = wb.getBoundingClientRect(), v = UI.State.viewOf(UI.S.scene.entities[id]);
        return UI.Space.screenToWorkspace({ clientX: x, clientY: y }, v, UI.Space.canvasOf(rect, v.span));
      }, { id, x: q.x, y: q.y });
      expect.push(t);
      await p.mouse.move(q.x, q.y); await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(80);
    }
    await p.waitForTimeout(150);
    const got = await p.evaluate(() => Object.values(UI.S.scene.entities).filter((e) => e.type === 'gpt').map((e) => ({ x: e.props.x, y: e.props.y })));
    ok(got.length >= 2, z * 100 + '%：画了两个点，场景里有 ' + got.length + ' 个点');
    const last = got.slice(-2);
    const near = last.every((g, i) => Math.abs(g.x - Math.round(expect[i].x)) === 0 && Math.abs(g.y - Math.round(expect[i].y)) === 0);
    ok(near, z * 100 + '%：落点是离鼠标最近的整数格点：' + JSON.stringify(last.map((g, i) => [g.x, g.y, r2(expect[i].x), r2(expect[i].y)])));
    await p.evaluate(() => { UI.S.wsDraw = null; UI.Stage.render(); });
  }

  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('坐标层测试异常：' + e.stack); process.exit(1); });
