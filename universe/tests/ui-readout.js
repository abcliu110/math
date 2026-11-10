/* node tests/ui-readout.js —— 读数与旋转（V9，docs/ui-geometry-feedback.md 2.9、2.10 和第 3 节 V9）。用真实鼠标：
 *   2.9 读数（只读，不改台面）：
 *     (a) 单击线段，读数显示长度（data-ro="len"，文字“长 5”）；
 *     (b) 单击三角形 ABC（直角在 A），读数显示面积 6、三条边 3、4、5、角 90°（精确）和 ≈36.9°、≈53.1°（近似）；选中前后台面（去掉视图）不变。
 *   2.10 任意整数角度旋转（块，近似的部分标 ≈）：
 *     (c) 块的旋转把手拖到 37°，读数“旋转 ≈37°”；
 *     (d) 按住 Shift 再拖到约 40°，吸附到 15° 的倍数：读数“旋转 ≈45°”；
 *     (e) 撤销两次回到 0°（“旋转 0°”）。
 *   每次手势之后检查不变量（tests/gestures.js）；没有页面错误和控制台错误。需要 playwright（NODE_PATH 指向它的 node_modules）。 */
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

  // 工作区坐标 → 屏幕坐标（和 ui-snap 一样用 UI.Space 的换算）
  const scr = (ws, pts) => p.evaluate(({ ws, pts }) => {
    const wb = document.querySelector('.card[data-id="' + ws + '"] svg.wsbody');
    const r = wb.getBoundingClientRect(), vw = UI.Stage.rangeOf(ws), sc = UI.Space.canvasOf(r, vw.span);
    return pts.map((q) => UI.Space.workspaceToScreen(q, vw, sc));
  }, { ws, pts });
  // 台面上带 data-ro 的读数文字（kind 为空时取全部）
  const ro = (ws, kind) => p.evaluate(({ ws, kind }) => [...document.querySelectorAll('.card[data-id="' + ws + '"] svg.wsbody [data-ro' + (kind ? '="' + kind + '"' : '') + ']')].map((t) => t.textContent), { ws, kind });
  // 图形在工作区里的 pick 名字（和台面选中用的同一个名字）
  const pickOf = (ws, id) => p.evaluate(([ws, id]) => { const v = UI.StageCtx.wsVisible(UI.S.scene.entities[ws]).find((x) => x.id === id); return v ? UI.StageCtx.pickOf(v) : null; }, [ws, id]);
  const selected = () => p.evaluate(() => (UI.S.wsSel || []).slice());
  // 图形上一个可以点的位置：最上面的命中元素是这个图形的 data-pick（不是把手，也不是文字）
  const hitPoint = (ws, pick) => p.evaluate(([ws, pick]) => {
    const wb = document.querySelector('.card[data-id="' + ws + '"] svg.wsbody'), r = wb.getBoundingClientRect();
    for (let y = r.top + 6; y < r.bottom - 6; y += 4) for (let x = r.left + 6; x < r.right - 6; x += 4) {
      const el = document.elementFromPoint(x, y), pk = el && el.closest && el.closest('[data-pick]');
      if (pk && pk.dataset.pick === pick && pk.closest('svg.wsbody') === wb && !el.closest('[data-hdl]')) return { x, y };
    }
    return null;
  }, [ws, pick]);

  console.log('搭场景：三角形 ABC（A(0,0)、B(4,0)、C(0,3)，直角在 A）和线段 EF（E(6,0)、F(9,4)，长 5）');
  const ids = await p.evaluate(() => {
    const A = UI.App;
    const ws = A.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id;
    // 点的名字和标签一样（A、B…），台面上的图形名字都能在画布文字里找到（不变量）
    const pt = (name, x, y) => { const n = A.act({ t: 'add', type: 'gpt', x: 0, y: 0, props: { x, y, mark: name } }).id; A.act({ t: 'rename', id: n, name }); A.act({ t: 'put', id: n, parent: ws, slot: 'items' }); return n; };
    const seg = (p1, p2) => {
      const s = A.act({ t: 'add', type: 'gseg', x: 0, y: 0 }).id;
      A.act({ t: 'link', from: p1, fromPort: 'p', to: s, toPort: 'a' });
      A.act({ t: 'link', from: p2, fromPort: 'p', to: s, toPort: 'b' });
      A.act({ t: 'put', id: s, parent: ws, slot: 'items' });
      return s;
    };
    const a = pt('A', 0, 0), bb = pt('B', 4, 0), c = pt('C', 0, 3), e = pt('E', 6, 0), f = pt('F', 9, 4);
    const s = seg(e, f);
    const poly = A.act({ t: 'add', type: 'gpoly', x: 0, y: 0 }).id;
    for (const q of [a, bb, c]) A.act({ t: 'link', from: q, fromPort: 'p', to: poly, toPort: 'pts' });
    A.act({ t: 'put', id: poly, parent: ws, slot: 'items' });
    UI.Stage.fit(); UI.Stage.render();
    return { ws, seg: s, poly };
  });
  await p.waitForTimeout(250);
  // 这一段的台面只有自由点和线段（和 ui-snap 一样），不套用“每个图形都有标签”的不变量；不变量在旋转部分检查

  // ---- 2.9 (a)：单击线段，读数显示长度 5 ----
  const segPick = await pickOf(ids.ws, ids.seg);
  const mid = (await scr(ids.ws, [{ x: 7.5, y: 2 }]))[0];
  await G.clickAt(p, mid.x, mid.y, '单击线段中点');
  ok((await selected()).join() === segPick, '(a) 单击线段：选中它');
  const lenTexts = await ro(ids.ws, 'len');
  ok(lenTexts.length === 1 && lenTexts[0] === '长 5', '(a) 选中线段，读数显示长度 “长 5”（实际 ' + JSON.stringify(lenTexts) + '）');

  // ---- 2.9 (b)：选中三角形；读数不改台面 ----
  const polyPick = await pickOf(ids.ws, ids.poly);
  const strip = () => p.evaluate(() => JSON.stringify(UI.State.stripView(UI.S.scene)));
  const sceneBefore = await strip();
  const tp = await hitPoint(ids.ws, polyPick);
  ok(!!tp, '(b) 三角形上有一个可以点的位置');
  await G.clickAt(p, tp.x, tp.y, '单击三角形');
  ok((await selected()).join() === polyPick, '(b) 单击三角形：选中它');
  ok((await strip()) === sceneBefore, '(b) 选中三角形不改台面（世界数据不变）');
  const areaT = await ro(ids.ws, 'area');
  ok(areaT.length === 1 && areaT[0] === '面积 6', '(b) 读数显示面积 “面积 6”（实际 ' + JSON.stringify(areaT) + '）');
  const sides = (await ro(ids.ws, 'side')).sort();
  ok(JSON.stringify(sides) === JSON.stringify(['3', '4', '5']), '(b) 各边长 3、4、5（实际 ' + JSON.stringify(sides) + '）');
  const angles = (await ro(ids.ws, 'angle')).sort();
  ok(JSON.stringify(angles) === JSON.stringify(['90°', '≈36.9°', '≈53.1°']), '(b) 角：直角精确 90°，其余标 ≈（实际 ' + JSON.stringify(angles) + '）');

  // ---- 2.10：任意整数角度旋转（块）----
  await p.evaluate(() => { UI.App.act({ t: 'clear' }); });
  await p.waitForTimeout(150);
  const ws2 = await p.evaluate(() => UI.App.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id);
  await p.waitForTimeout(200);
  await G.dragTileTo(p, 'ftri', ws2);
  await G.assertInvariants(p, '拖入三角形（块）');
  const pieceId = await p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'gpiece'); return e ? e.id : null; });
  ok(!!pieceId, '搭场景：拖入三角形，台面上有一个块');
  const piecePick = await pickOf(ws2, pieceId);
  const pk = await hitPoint(ws2, piecePick);
  ok(!!pk, '块上有一个可以点的位置');
  await G.clickAt(p, pk.x, pk.y, '单击块');
  await G.assertInvariants(p, '单击块');
  ok((await selected()).join() === piecePick, '(c) 单击块：选中它');
  const rotTexts = () => ro(ws2, 'rot');
  ok((await rotTexts()).join() === '旋转 0°', '(c) 选中块：读数显示旋转 0°（实际 ' + JSON.stringify(await rotTexts()) + '）');

  // 转动中心：块的外框中心（台面坐标，和把手的圆心一致）
  const center = await p.evaluate((id) => { const pts = UI.S.D[id].out.f.data.pts; const xs = pts.map((q) => U.Q.num(q.x)), ys = pts.map((q) => U.Q.num(q.y)); return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2]; }, pieceId);
  const cS = (await scr(ws2, [{ x: center[0], y: center[1] }]))[0];
  // 把手从当前位置开始，沿圆转 deg 度（逆时针为正；屏幕 y 向下，所以用 −sin）
  const rotateBy = async (deg, shift) => {
    const h = await p.locator('.card[data-id="' + ws2 + '"] svg.wsbody [data-hdl="rot"]').first().boundingBox();
    const hx = h.x + h.width / 2, hy = h.y + h.height / 2;
    const th0 = Math.atan2(-(hy - cS.y), hx - cS.x), th = th0 + deg * Math.PI / 180, R = 300;
    const tx = cS.x + R * Math.cos(th), ty = cS.y - R * Math.sin(th);
    if (shift) await p.keyboard.down('Shift');
    await p.mouse.move(hx, hy); await p.mouse.down();
    await p.mouse.move(tx, ty, { steps: 10 }); await p.mouse.up();
    if (shift) await p.keyboard.up('Shift');
    await p.waitForTimeout(200);
  };

  // (c) 把手拖到约 37°
  await rotateBy(37, false);
  await G.assertInvariants(p, '旋转把手拖到 37°');
  const r37 = await rotTexts();
  ok(r37.join() === '旋转 ≈37°', '(c) 旋转把手拖到约 37°：读数 “旋转 ≈37°”（近似，实际 ' + JSON.stringify(r37) + '）');

  // (d) 按住 Shift 再转 3°（总角约 40°），吸附到 15° 的倍数：45°
  await rotateBy(3, true);
  await G.assertInvariants(p, '按住 Shift 旋转');
  const r45 = await rotTexts();
  ok(r45.join() === '旋转 ≈45°', '(d) 按住 Shift 拖到约 40°：吸附到 45°，读数 “旋转 ≈45°”（实际 ' + JSON.stringify(r45) + '）');

  // (e) 撤销两次回到 0°
  await p.click('#undo'); await p.waitForTimeout(150);
  await G.assertInvariants(p, '撤销（Shift 旋转）');
  ok((await rotTexts()).join() === '旋转 ≈37°', '(e) 撤销一次：回到 37°');
  await p.click('#undo'); await p.waitForTimeout(150);
  await G.assertInvariants(p, '撤销（37° 旋转）');
  ok((await rotTexts()).join() === '旋转 0°', '(e) 撤销两次：回到 0°');

  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n读数与旋转测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('  FAIL 脚本异常：' + e.message); process.exit(1); });
