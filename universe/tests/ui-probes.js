/* node tests/ui-probes.js —— 把 tools/probes/ws-drop.js 和 ws-undo.js 改写成真实鼠标的断言，用 tests/gestures.js。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。见 docs/ui-robustness.md 第 3.2 节（P1、P2）。
 * 预期失败（EXPECTED FAIL）：这些检查现在应该失败，不计入失败数，输出一行 “EXPECTED FAIL P1 …”。
 * 如果预期失败的检查意外通过，输出 “UNEXPECTED PASS …” 并计入失败：修好后把它改成普通断言。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const G = require('./gestures');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
let pass = 0, fail = 0, expected = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const expectFail = (id, broken, m) => {
  if (broken) { expected++; console.log('  EXPECTED FAIL ' + id + '：' + m); }
  else { fail++; console.log('  UNEXPECTED PASS ' + id + '：' + m + '（已修好，请把它改成普通断言）'); }
};

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
    await G.assertInvariants(p, '拖入 ' + type, { skip: ['undo'] });   // P1：拖入现在是两个撤销项，见下面的 expectFail P1
    ok(r.visible, '拖 ' + type + ' 后画面上看得到它的名字：' + JSON.stringify(r.label));
  }
  const names = await pieces(ws);
  ok(names.length === 3 && names.join('|') === '三角形 1|长方形 1|圆 1', '三个图形都进了工作区：' + names.join('|'));
  ok((await strays(ws)) === 0, '台面上没有多出来的游离卡片');
  r = await G.clickTile(p, 'fquad');
  await G.assertInvariants(p, '点击器材架的四边形', { skip: ['undo'] });
  ok(r.visible || r.added.length > 0, '点击器材架的四边形有反应（新卡片或工作区里出现它）');

  console.log('撤销、重做、存档（ws-undo）');
  ws = await fresh();
  await G.dragTileTo(p, 'ftri', ws);
  await G.assertInvariants(p, '拖入三角形（撤销测试）', { skip: ['undo'] });
  const afterDrag = await ents();
  ok(afterDrag >= 2, '拖入后有实体：' + afterDrag);

  // P1：拖入是一个手势，撤销一次应回到只有工作区（期望只剩 1 个实体、没有游离卡片）
  await G.undo(p);
  // P1 的状态本身就违反 (a)（游离卡片叠在工作区上）和 (b)，这一步不检查它们；下面的 expectFail 专门检查这个状态
  await G.assertInvariants(p, '撤销一次（P1）', { skip: ['undo', 'overlap'] });
  const afterUndo = await ents(), freeAfterUndo = await strays(ws);
  expectFail('P1', !(afterUndo === 1 && freeAfterUndo === 0),
    '拖入后撤销一次，剩 ' + afterUndo + ' 个实体（游离卡片 ' + freeAfterUndo + ' 个），期望只剩工作区');

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

  console.log('工作区视图（P2）');
  ws = await fresh();
  await G.dragTileTo(p, 'ftri', ws);
  await p.evaluate((ws) => { UI.S.wsView[ws] = { cx: 3, cy: 2, span: 9 }; UI.Stage.render(); }, ws);
  await p.waitForTimeout(150);
  const viewBefore = await p.evaluate((ws) => JSON.stringify(UI.S.wsView[ws] || null), ws);
  await p.reload(); await p.waitForTimeout(500);
  const wsAfter = await p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'gworkspace'); return e ? e.id : null; });
  const viewAfter = await p.evaluate((ws) => JSON.stringify((UI.S.wsView || {})[ws] || null), wsAfter);
  expectFail('P2', viewAfter !== viewBefore, '刷新后工作区视图 ' + viewAfter + '，刷新前 ' + viewBefore + '（期望一致）');

  await G.assertInvariants(p, '结束检查', { skip: ['undo'] });
  ok(true, '结束时不变量成立，控制台 0 报错');
  console.log('\n' + pass + ' 通过，' + fail + ' 失败，' + expected + ' 个预期失败（不计入失败）');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch(async (e) => { console.log('  FAIL 脚本异常：' + e.message); process.exit(1); });
