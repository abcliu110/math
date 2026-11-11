/* node tests/ui-probes.js —— 把 tools/probes/ws-drop.js 和 ws-undo.js 改写成真实鼠标的断言，用 tests/gestures.js。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。见 docs/ui-robustness.md 第 3.2 节（P1、P2）。
 * P1 已修好（U2），P2 已修好（U4：视图在工作区实体的 ui 里，随存档保存），都是普通断言。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const G = require('./gestures');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  G.attachErrorCollector(p);
  await p.goto(url); await p.waitForTimeout(400);

  // 新建一个只有一个工作区的台面
  const fresh = async () => {
    const id = await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); return UI.App.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id; });
    await p.waitForTimeout(200);
    return id;
  };
  const ents = () => p.evaluate(() => Object.keys(UI.S.scene.entities).length);
  const strays = (ws) => p.evaluate((ws) => Object.values(UI.S.scene.entities).filter((e) => !e.parent && e.id !== ws && !(U.types[e.type] && U.types[e.type].workspace)).length, ws);
  const pieces = (ws) => p.evaluate((ws) => Object.values(UI.S.scene.entities).filter((e) => e.parent === ws && e.type === 'gpiece').map((e) => e.props.name), ws);

  console.log('从器材架拖三个图形进工作区（ws-drop）');
  let ws = await fresh();
  let r;
  for (const type of ['ftri', 'rect', 'fcirc']) {
    r = await G.dragTileTo(p, type, ws);
    await G.assertInvariants(p, '拖入 ' + type);
    ok(r.visible, '拖 ' + type + ' 后画面上看得到它的名字：' + JSON.stringify(r.label));
  }
  const names = await pieces(ws);
  ok(names.length === 3 && names.join('|') === '三角形 1|长方形 1|圆 1', '三个图形都进了工作区：' + names.join('|'));
  ok((await strays(ws)) === 0, '台面上没有多出来的游离卡片');
  r = await G.clickTile(p, 'fquad');
  await G.assertInvariants(p, '点击器材架的四边形');
  ok(r.visible || r.added.length > 0, '点击器材架的四边形有反应（新卡片或工作区里出现它）');

  console.log('撤销、重做、存档（ws-undo）');
  ws = await fresh();
  await G.dragTileTo(p, 'ftri', ws);
  await G.assertInvariants(p, '拖入三角形（撤销测试）');
  const afterDrag = await ents();
  ok(afterDrag >= 2, '拖入后有实体：' + afterDrag);

  // P1（U2 已修）：拖入是一个手势，撤销一次回到只有工作区：只剩 1 个实体，没有游离卡片
  await G.undo(p);
  await G.assertInvariants(p, '撤销一次（P1）');
  const afterUndo = await ents(), freeAfterUndo = await strays(ws);
  ok(afterUndo === 1 && freeAfterUndo === 0, 'P1：拖入后撤销一次回到空工作区，剩 ' + afterUndo + ' 个实体（游离卡片 ' + freeAfterUndo + ' 个）');

  // 撤销之后重做，应回到拖入之后的样子（这一条现在应当通过）
  await G.redo(p);
  await G.assertInvariants(p, '重做一次');
  ok((await ents()) === afterDrag, '重做后实体数回到拖入之后：' + (await ents()));

  // 存档读回（U.World.save / load）
  const back = await p.evaluate(() => { const s = U.World.save(UI.S.scene), sc = U.World.load(s); return { n: Object.keys(sc.entities).length, hidden: Object.values(sc.entities).filter((e) => e.hidden).length, nowN: Object.keys(UI.S.scene.entities).length }; });
  ok(back.n === back.nowN, '存档读回后实体数不变：' + back.n);

  // 刷新页面后实体数不变（自由台面自动保存）
  const before = await ents();
  await p.reload(); await p.waitForTimeout(500);
  ok((await ents()) === before, '刷新页面后实体数不变：' + (await ents()) + '（刷新前 ' + before + '）');

  console.log('事务（U2）：一个手势一个撤销项，失败整段回滚');
  ws = await fresh();
  // 成功：两步记成一个撤销项、一次撤销全撤掉
  const tr = await p.evaluate(() => { const n0 = Object.keys(UI.S.scene.entities).length, u0 = UI.S.undo.length; UI.App.tx('两步', (A) => { A({ t: 'add', type: 'num', x: 60, y: 520, props: { n: 1 } }); A({ t: 'add', type: 'num', x: 200, y: 520, props: { n: 2 } }); }); return { grew: Object.keys(UI.S.scene.entities).length - n0, undo: UI.S.undo.length - u0 }; });
  ok(tr.grew === 2 && tr.undo === 1, 'tx 成功：实体 +' + tr.grew + '，撤销项 +' + tr.undo + '（期望 +2、+1）');
  await G.undo(p);
  await G.assertInvariants(p, '撤销 tx 两步');
  ok((await ents()) === 1, '一次撤销回到 tx 之前（实体 ' + (await ents()) + '）');
  // 失败：第二步不成立，整段回滚，撤销项不增加，并提示原因
  const bad = await p.evaluate(() => { const n0 = Object.keys(UI.S.scene.entities).length, u0 = UI.S.undo.length; const r = UI.App.tx('会失败', (A) => { A({ t: 'add', type: 'num', x: 60, y: 520, props: { n: 3 } }); A({ t: 'set', id: 'no-such-id', k: 'n', v: 1 }); }); return { ok: r.ok, why: r.why || '', grew: Object.keys(UI.S.scene.entities).length - n0, undo: UI.S.undo.length - u0, banner: document.querySelector('#banner').textContent || '' }; });
  ok(!bad.ok && bad.grew === 0 && bad.undo === 0 && bad.why !== '' && bad.banner.indexOf(bad.why) >= 0, '失败的 tx 整段回滚，并在台面上提示原因：' + bad.why);
  await G.assertInvariants(p, '失败的 tx 之后');
  // 把台面上的卡片拖进工作区，撤销一次，卡片回到工作区外面
  ws = await fresh();
  const dropped = await G.clickTile(p, 'fquad');
  const cid = dropped.added[0];
  ok(!!cid, '点器材架的四边形，台面上多出一张卡片：' + cid);
  await G.dragCardTo(p, cid, ws);
  await G.assertInvariants(p, '把台面上的卡片拖进工作区');
  const inside = await p.evaluate((id) => !!UI.S.scene.entities[id] && UI.S.scene.entities[id].parent != null, cid);
  ok(inside, '卡片进了工作区');
  await G.undo(p);
  await G.assertInvariants(p, '撤销：卡片拖进工作区');
  const outside = await p.evaluate((id) => { const e = UI.S.scene.entities[id]; return !!e && !e.parent; }, cid);
  ok(outside, '撤销一次，卡片回到工作区外面');

  console.log('工作区视图（P2，U4：视图在工作区实体的 ui 里）');
  const viewOf = (id) => p.evaluate((id) => JSON.stringify(UI.State.viewOf(UI.S.scene.entities[id]) || null), id);
  ws = await fresh();
  await G.dragTileTo(p, 'ftri', ws);
  await p.evaluate((ws) => { UI.State.setUi(UI.S.scene.entities[ws], 'view', { cx: 3, cy: 2, span: 9 }); UI.Stage.render(); }, ws);
  await p.waitForTimeout(150);
  const viewBefore = await viewOf(ws);
  await p.reload(); await p.waitForTimeout(500);
  const wsAfter = await p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'gworkspace'); return e ? e.id : null; });
  const viewAfter = await viewOf(wsAfter);
  ok(viewBefore !== 'null' && viewAfter === viewBefore, 'P2：刷新后工作区视图 ' + viewAfter + '，刷新前 ' + viewBefore + '（一致）');

  console.log('视图状态（U4）：真实滚轮缩放后撤销不回退视图；图层开关刷新后保留；旧存档能打开');
  ws = await fresh();
  await G.dragTileTo(p, 'ftri', ws);
  await G.assertInvariants(p, '拖入三角形（视图测试）');
  const wb = await p.locator('svg.wsbody[data-wsid="' + ws + '"]').first().boundingBox();
  await p.mouse.move(wb.x + wb.width / 2, wb.y + wb.height / 2);
  await p.mouse.wheel(0, -300); await p.waitForTimeout(200);
  const zoomed = await viewOf(ws);
  ok(zoomed !== 'null', '滚轮缩放工作区后，视图记在工作区实体上：' + zoomed);
  await G.assertInvariants(p, '滚轮缩放工作区');
  const beforeUndo = await viewOf(ws);
  await G.dragTileTo(p, 'rect', ws);   // 一个可撤销的手势
  await G.assertInvariants(p, '拖入长方形（视图测试）');
  await G.undo(p);
  await G.assertInvariants(p, '撤销（视图测试）');
  const viewUndone = await viewOf(ws);
  ok(viewUndone === beforeUndo, '撤销一次，工作区视图不回退（撤销前 ' + beforeUndo + '，撤销后 ' + viewUndone + '）');

  // 图层开关：真实点击隐藏一个图层，刷新后仍是隐藏的
  ws = await fresh();
  await G.dragTileTo(p, 'ftri', ws);
  await p.locator('input[data-ws-layer]').first().uncheck(); await p.waitForTimeout(150);
  const hiddenBefore = await p.evaluate((ws) => JSON.stringify(UI.State.hiddenOf(UI.S.scene.entities[ws])), ws);
  ok(hiddenBefore !== '{}', '点掉一个图层，工作区记下了隐藏：' + hiddenBefore);
  await p.reload(); await p.waitForTimeout(500);
  const hiddenAfter = await p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'gworkspace'); return e ? JSON.stringify(UI.State.hiddenOf(e)) : null; });
  ok(hiddenAfter === hiddenBefore, '刷新后图层开关保持：' + hiddenAfter);

  // 旧存档（v4，实体没有 ui）：能打开，不报错，版本升到 5，实体数不变
  ws = await fresh();
  await G.dragTileTo(p, 'ftri', ws);
  const nOld = await ents();
  const oldSave = await p.evaluate(() => { const sc = U.JSON.parse(U.World.save(UI.S.scene)); sc.v = 4; for (const e of Object.values(sc.entities)) delete e.ui; return U.JSON.stringify(sc); });
  await p.evaluate((s) => localStorage.setItem('universe-free-v1', s), oldSave);
  await p.reload(); await p.waitForTimeout(500);
  const oldLoaded = await p.evaluate(() => ({ n: Object.keys(UI.S.scene.entities).length, v: UI.S.scene.v }));
  ok(oldLoaded.n === nOld && oldLoaded.v === 7, '旧存档（v4）打开后实体数 ' + oldLoaded.n + '，版本 ' + oldLoaded.v + '（期望 ' + nOld + '、7）');
  await G.assertInvariants(p, '打开旧存档');

  await G.assertInvariants(p, '结束检查', { skip: ['undo'] });
  ok(true, '结束时不变量成立，控制台 0 报错');
  console.log('\n' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch(async (e) => { console.log('  FAIL 脚本异常：' + e.message); process.exit(1); });
