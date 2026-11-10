/* node tests/ui-deps.js —— 删除与依赖（V5，docs/ui-geometry-feedback.md 2.1、2.2 和第 3 节 V5）。
 * 用真实鼠标和键盘：
 *   (a) 删除被依赖的点 D（多边形 ABCD 和线段 AD 都用到它）：弹出确认，列出受影响的器材；取消后什么都没变（四边形仍是 4 个顶点，撤销栈不变）；
 *   (b) 再删一次，确认「删除并同时删除依赖」：D、多边形、线段一起删；撤销一次全部恢复（四边形仍是 4 个顶点）；
 *   (c) 没有依赖的器材（自由点 E）直接删，不弹确认；
 *   (d) 清空台面：先问会删几个器材；取消什么都不变；确认后清空；撤销一次找回。
 * 每个手势之后检查不变量（tests/gestures.js）。需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const G = require('./gestures');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  G.attachErrorCollector(p);
  await p.goto(url); await p.waitForTimeout(300);
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); });
  await p.waitForTimeout(150);

  // 搭场景：台面上四个自由点 A、B、C、D，多边形 ABCD 由四个点围成（顶点按连线先后），线段 AD；另有一个没人用的自由点 E
  const ids = await p.evaluate(() => {
    const A = UI.App;
    const pt = (x, y, X, Y) => A.act({ t: 'add', type: 'gpt', x: X, y: Y, props: { x, y } }).id;
    const [a, b, c, d] = [pt(0, 0, 60, 60), pt(4, 0, 260, 60), pt(4, 3, 260, 240), pt(0, 3, 60, 240)];
    const e = pt(9, 6, 460, 420);
    const poly = A.act({ t: 'add', type: 'gpoly', x: 420, y: 80 }).id;
    [a, b, c, d].forEach((id) => A.act({ t: 'link', from: id, fromPort: 'p', to: poly, toPort: 'pts' }));
    const seg = A.act({ t: 'add', type: 'gseg', x: 420, y: 260 }).id;
    A.act({ t: 'link', from: a, fromPort: 'p', to: seg, toPort: 'a' });
    A.act({ t: 'link', from: d, fromPort: 'p', to: seg, toPort: 'b' });
    UI.Stage.fit(); UI.Stage.render();
    return { a, b, c, d, e, poly, seg };
  });
  await p.waitForTimeout(150);
  await p.waitForTimeout(150);
  await G.assertInvariants(p, '搭好四边形');

  const verts = () => p.evaluate((pid) => {
    const o = UI.S.D[pid] && UI.S.D[pid].out, f = o && o.f;
    return f && f.data && f.data.pts ? f.data.pts.length : 0;
  }, ids.poly);
  const count = () => p.evaluate(() => Object.keys(UI.S.scene.entities).length);
  const alive = (id) => p.evaluate((i) => !!UI.S.scene.entities[i], id);
  const undoLen = () => p.evaluate(() => UI.S.undo.length);
  const dlgOpen = () => p.locator('#dlg.open').count().then((n) => n > 0);
  const dlgText = () => p.evaluate(() => (document.querySelector('#dlg .box') || {}).textContent || '');
  const nameOf = (id) => p.evaluate((i) => (UI.S.scene.entities[i] || {}).name || '', id);

  // 真实鼠标点一下台面上的点（点它的标题栏），选中它
  const clickPoint = async (id) => {
    await G.clickCard(p, id);
    return (await p.evaluate(() => UI.S.sel)) === id;
  };

  const v0 = await verts(), n0 = await count();
  ok(v0 === 4, '搭好后四边形有 4 个顶点（' + v0 + '）');
  const polyName = await nameOf(ids.poly), dName = await nameOf(ids.d);
  console.log('      器材名字：四边形「' + polyName + '」，点「' + dName + '」，线段「' + (await nameOf(ids.seg)) + '」');

  // (c) 没有依赖的点 E：直接删，不弹确认
  ok(await clickPoint(ids.e), '(c) 真实鼠标点中自由点 E 并选中');
  await G.press(p, 'Delete');
  await G.assertInvariants(p, '删除没有依赖的点 E');
  ok(!(await dlgOpen()) && !(await alive(ids.e)), '(c) 没有依赖的点 E 直接删除，不弹确认');
  await p.click('#undo'); await p.waitForTimeout(120);
  ok(await alive(ids.e) && (await count()) === n0, '(c) 撤销：E 回来');

  // (a) 删除被依赖的点 D：弹出确认，列出受影响的器材；取消后什么都没变
  ok(await clickPoint(ids.d), '(a) 真实鼠标点中被依赖的点 D 并选中');
  const undo0 = await undoLen();
  await G.press(p, 'Delete');
  await G.assertInvariants(p, '删除被依赖的点 D（弹确认）');
  const txt = await dlgText();
  ok(await dlgOpen(), '(a) 删除 D 时弹出确认框（而不是直接删）');
  ok(txt.indexOf(polyName) >= 0 && txt.indexOf('2 个器材') >= 0, '(a) 确认框列出受影响的器材：「' + polyName + '」等 2 个（' + txt.replace(/\s+/g, ' ').slice(0, 120) + '）');
  ok(await alive(ids.d) && (await count()) === n0, '(a) 确认前：D 还在，器材数不变');
  ok((await verts()) === 4, '(a) 确认前：四边形仍是 4 个顶点');

  await p.click('#dlg-close'); await p.waitForTimeout(150);   // 取消（真实点击）
  await G.assertInvariants(p, '取消删除 D');
  ok(!(await dlgOpen()), '(a) 取消：确认框关闭');
  ok(await alive(ids.d) && (await count()) === n0, '(a) 取消：D、多边形、线段都还在，器材数不变');
  ok((await verts()) === 4, '(a) 取消后四边形仍是 4 个顶点（' + (await verts()) + '）');
  ok((await undoLen()) === undo0, '(a) 取消不增加撤销项');

  // (b) 再删 D，确认「删除并同时删除依赖」：D、多边形、线段一起删；撤销一次全部恢复
  ok(await clickPoint(ids.d), '(b) 再次真实鼠标点中 D 并选中');
  await G.press(p, 'Delete');
  ok(await dlgOpen(), '(b) 再次按 Delete 弹出确认');
  await p.click('#dlg-confirm'); await p.waitForTimeout(200);
  await G.assertInvariants(p, '确认：删除并同时删除依赖');
  ok(!(await alive(ids.d)) && !(await alive(ids.poly)) && !(await alive(ids.seg)), '(b) 确认后 D、四边形、线段一起删除');
  ok(await alive(ids.e) && !(await dlgOpen()), '(b) 无关的 E 还在，确认框已关闭');
  await p.click('#undo'); await p.waitForTimeout(150);
  await G.assertInvariants(p, '撤销一次');
  ok(await alive(ids.d) && await alive(ids.poly) && await alive(ids.seg), '(b) 撤销一次：D、四边形、线段全部恢复');
  ok((await count()) === n0, '(b) 撤销后器材数回到 ' + n0 + '（' + (await count()) + '）');
  ok((await verts()) === 4, '(b) 撤销后四边形仍是 4 个顶点（' + (await verts()) + '）');

  // (d) 清空台面：先问会删几个器材；取消不变；确认后清空；撤销一次找回
  const n1 = await count(), undo1 = await undoLen();
  await p.click('#clear'); await p.waitForTimeout(150);
  await G.assertInvariants(p, '清空台面（弹确认）');
  const ctxt = await dlgText();
  ok(await dlgOpen() && ctxt.indexOf('会删除 ' + n1 + ' 个器材') >= 0, '(d) 清空前弹出确认，说明会删除 ' + n1 + ' 个器材');
  ok((await count()) === n1, '(d) 确认前台面没有变');
  await p.click('#dlg-close'); await p.waitForTimeout(150);
  ok((await count()) === n1 && (await undoLen()) === undo1, '(d) 取消：台面不变，撤销栈不变');

  await p.click('#clear'); await p.waitForTimeout(150);
  await p.click('#dlg-confirm'); await p.waitForTimeout(200);
  await G.assertInvariants(p, '确认清空台面');
  ok((await count()) === 0, '(d) 确认后台面清空');
  await p.click('#undo'); await p.waitForTimeout(150);
  ok((await count()) === n1, '(d) 撤销一次：台面全部找回（' + (await count()) + '/' + n1 + '）');

  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n删除与依赖测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
