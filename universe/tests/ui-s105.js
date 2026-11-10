/* node tests/ui-s105.js —— §10.5.9 剩余项：复制粘贴、镜像复制、多选编组、幽灵对照（真实鼠标和键盘）。
 *  1. 复制粘贴：选中一个块，Ctrl+C、Ctrl+V 得到第二块（同一个剪切来源、同样大小、名字不同）；撤销一次回去；
 *  2. 镜像复制：选中一个块按 M，副本是原来的镜像（顶点是 2×右边界 − x，贴在右边）；工具条有「镜像」按钮；
 *  3. 复制（Ctrl+C/V）对自由点围成的图形同样可用，镜像（M）也可用，撤销一次回去；
 *  4. 多选编组：Shift 点两块，Ctrl+G 编组；点一块，两块都选中；拖动一块，两块一起动、移动量一样；
 *     Ctrl+Shift+G 取消编组；Ctrl+Z 撤销编组；
 *  5. 幽灵对照：拖动块的过程中，原来的位置留一个虚线的幽灵，松手就没有了；没有拖动时没有幽灵。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
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
  const ws = await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); return UI.App.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id; });
  await p.waitForTimeout(200);
  await p.evaluate(() => { const g = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '知道了'); if (g) g.click(); });

  // ---- 辅助：块（gpiece）的列表、画面上的点、图形的名字、外框、顶点 ----
  const pieces = () => p.evaluate((ws) => Object.values(UI.S.scene.entities).filter((e) => e.parent === ws && e.type === 'gpiece').map((e) => ({
    id: e.id, name: e.props.name, dx: e.props.dx, dy: e.props.dy, flip: e.props.flip, turn: e.props.turn, group: e.group || null,
    from: UI.S.scene.links.filter((l) => l.to === e.id && l.toPort === 'f').map((l) => l.from + '.' + l.fromPort),
  })), ws);
  const pickOf = (id) => p.evaluate(([ws, id]) => { const v = UI.StageCtx.wsVisible(UI.S.scene.entities[ws]).find((x) => x.id === id); return v ? UI.StageCtx.pickOf(v) : null; }, [ws, id]);
  const hitPoint = (pick) => p.evaluate((pick) => {
    const wb = document.querySelector('.card[data-id="' + UI.Stage.activeWs() + '"] svg.wsbody') || document.querySelector('svg.wsbody'), r = wb.getBoundingClientRect();
    for (let y = r.top + 6; y < r.bottom - 6; y += 4) for (let x = r.left + 6; x < r.right - 6; x += 4) {
      const el = document.elementFromPoint(x, y), pk = el && el.closest && el.closest('[data-pick]');
      if (pk && pk.dataset.pick === pick && pk.closest('svg.wsbody') === wb && !el.closest('[data-hdl]')) return { x, y };
    }
    return null;
  }, pick);
  const selected = () => p.evaluate(() => (UI.S.wsSel || []).slice());
  const state = () => p.evaluate(() => '[选中:' + JSON.stringify(UI.S.wsSel || []) + ' 消息:' + (UI.S.wsMsg || '无') + ']');
  const clickPick = async (pick, shift) => {
    const h = await hitPoint(pick);
    if (shift) await p.keyboard.down('Shift');
    await p.mouse.click(h.x, h.y); await p.waitForTimeout(160);
    if (shift) await p.keyboard.up('Shift');
  };
  // 图形（块、自由点围成的图形）的外框和顶点：来自求值结果（台面上真正画出来的）
  const verts = (id) => p.evaluate((id) => { const d = UI.S.D[id]; if (!d || !d.out || !d.out.f || !d.out.f.data || !d.out.f.data.pts) return null; return d.out.f.data.pts.map((q) => [U.Q.num(q.x), U.Q.num(q.y)]); }, id);
  const area = (vs) => { let s = 0; for (let i = 0; i < vs.length; i++) { const a = vs[i], c = vs[(i + 1) % vs.length]; s += a[0] * c[1] - c[0] * a[1]; } return Math.abs(s) / 2; };
  const key = (v) => v[0].toFixed(6) + ',' + v[1].toFixed(6);
  const sameSet = (A, B) => A.length === B.length && A.every((a) => B.some((b) => key(a) === key(b)));
  const undo = async () => { await p.keyboard.press('Control+z'); await p.waitForTimeout(200); };
  const bigStep = () => p.waitForTimeout(160);

  console.log('搭场景：三角形和长方形两块（剪的工具之外，从器材架拖进工作区）');
  await G.dragTileTo(p, 'ftri', ws);
  await G.dragTileTo(p, 'rect', ws);
  await G.assertInvariants(p, '拖入长方形');
  await p.evaluate((ws) => { const ps = Object.values(UI.S.scene.entities).filter((e) => e.parent === ws && e.type === 'gpiece'); UI.App.act({ t: 'piece', id: ps[1].id, what: 'move', value: { dx: 7, dy: 1 } }); }, ws);
  await p.waitForTimeout(200);
  let ps = await pieces();
  ok(ps.length === 2, '搭场景：工作区里有两块（' + ps.map((q) => q.name).join('、') + '）');
  const TRI = ps[0].id, REC = ps[1].id;
  const triPick = await pickOf(TRI), recPick = await pickOf(REC);
  ok(!!triPick && !!recPick, '两块都能在画面上点到');

  console.log('1. 复制粘贴（块）');
  await clickPick(triPick, false);
  ok((await selected()).join() === triPick, '点一下三角形块：选中它');
  const triArea = area(await verts(TRI));
  await p.keyboard.press('Control+c'); await bigStep();
  await p.keyboard.press('Control+v'); await p.waitForTimeout(250);
  ps = await pieces();
  ok(ps.length === 3, 'Ctrl+C、Ctrl+V 之后多了一块（现在 ' + ps.length + ' 块）');
  const copy = ps.find((q) => q.id !== TRI && q.id !== REC);
  ok(!!copy && copy.from.join() === ps[0].from.join() && copy.from.length === 1, '副本接着同一个剪切来源（不是空块）');
  ok(!!copy && copy.name !== ps[0].name, '副本有自己的名字：' + (copy ? copy.name : '无'));
  const copyArea = copy ? area(await verts(copy.id)) : -1;
  ok(Math.abs(copyArea - triArea) < 1e-9 && triArea > 0, '副本和原来的面积一样（' + copyArea + ' = ' + triArea + '）');
  await undo();
  ok((await pieces()).length === 2, '撤销一次，副本没了');

  console.log('2. 镜像复制（块，按 M）');
  await clickPick(triPick, false);
  const triV = await verts(TRI);
  const maxX = Math.max(...triV.map((v) => v[0])), minY = Math.min(...triV.map((v) => v[1]));
  const mirrorBtn = await p.locator('[data-fbar="mirror"]').count();
  ok(mirrorBtn > 0, '浮动工具条里有「镜像」按钮');
  await p.keyboard.press('m'); await p.waitForTimeout(250);
  ps = await pieces();
  ok(ps.length === 3, '按 M：多了一块镜像副本（现在 ' + ps.length + ' 块）');
  const mir = ps.find((q) => q.id !== TRI && q.id !== REC);
  const mV = mir ? await verts(mir.id) : null;
  const expect = triV.map((v) => [2 * maxX - v[0], v[1]]);
  ok(!!mV && sameSet(mV, expect), '副本是原图沿右边界的镜像（顶点 x → 2×' + maxX + ' − x，y 不变）');
  ok(!!mV && Math.abs(Math.min(...mV.map((v) => v[1])) - minY) < 1e-9, '副本和原图底边对齐');
  await undo();
  ok((await pieces()).length === 2, '撤销一次，镜像副本没了');

  console.log('3. 复制、镜像对自由点围成的图形');
  await p.locator('.wsmini .shape-menu summary').first().click();
  await p.locator('.wsmini .shape-pop button[data-ws-shape="ftrap"]').first().click(); await p.waitForTimeout(250);
  await p.evaluate(() => document.querySelectorAll('details.shape-menu[open]').forEach((d) => { d.open = false; })); await p.waitForTimeout(100);   // 菜单收起，免得盖住画布
  const trapPick = await p.evaluate(([ws, skip]) => { const el = [...document.querySelectorAll('svg.wsbody[data-wsid="' + ws + '"] path[data-pick]')].find((x) => x.dataset.pri === '2' && !skip.includes(x.dataset.pick)); return el ? el.dataset.pick : null; }, [ws, [triPick, recPick]]);
  ok(!!trapPick, '放了一个梯形，画面上能点到');
  // 梯形放到一个确定的位置（搭场景）：镜像要放得下，±10 之内
  const pts0 = await p.evaluate(() => Object.values(UI.S.scene.entities).filter((e) => e.type === 'gpt').map((e) => e.id));
  const trapXY = [[-6, -1], [-2, -1], [-3, 2], [-5, 2]];
  await p.evaluate(([ids, xy]) => { ids.forEach((id, i) => UI.App.act({ t: 'set', id, k: 'x', v: xy[i][0] })); ids.forEach((id, i) => UI.App.act({ t: 'set', id, k: 'y', v: xy[i][1] })); }, [pts0, trapXY]);
  await p.waitForTimeout(200);
  const polys0 = await p.evaluate(() => Object.values(UI.S.scene.entities).filter((e) => e.type === 'gpoly').length);
  await clickPick(trapPick, false);
  await p.keyboard.press('Control+c'); await bigStep();
  await p.keyboard.press('Control+v'); await p.waitForTimeout(250);
  const polysAfterPaste = await p.evaluate(() => Object.values(UI.S.scene.entities).filter((e) => e.type === 'gpoly').length);
  ok(polysAfterPaste === polys0 + 1, 'Ctrl+V：复制了一个自由图形（多边形 ' + polys0 + ' → ' + polysAfterPaste + '）' + await state());
  await undo();
  ok(await p.evaluate(() => Object.values(UI.S.scene.entities).filter((e) => e.type === 'gpoly').length) === polys0, '撤销一次，复制品没了');
  await clickPick(trapPick, false);
  const trapIds = await p.evaluate((ws) => Object.values(UI.S.scene.entities).filter((e) => e.type === 'gpt').map((e) => ({ id: e.id, x: U.Q.num(U.Q(e.props.x)), y: e.props.y })).filter(() => true), ws);
  const origPts = trapIds.filter((q) => pts0.includes(q.id)).map((q) => [q.x, q.y]);
  const maxTx = Math.max(...origPts.map((v) => v[0]));
  await p.keyboard.press('m'); await p.waitForTimeout(250);
  const newPts = (await p.evaluate((ws) => Object.values(UI.S.scene.entities).filter((e) => e.type === 'gpt').map((e) => [e.id, Number(e.props.x), Number(e.props.y)]), ws)).filter((r) => !pts0.includes(r[0])).map((r) => [r[1], r[2]]);
  ok(newPts.length === 4 && sameSet(newPts, origPts.map((v) => [2 * maxTx - v[0], v[1]])), '按 M：自由点的副本是镜像（4 个新点，x → 2×' + maxTx + ' − x）' + await state());
  await undo();
  ok(await p.evaluate(() => Object.values(UI.S.scene.entities).filter((e) => e.type === 'gpt').length) === pts0.length, '撤销一次，镜像副本的点也没了');

  console.log('4. 多选编组（块）');
  await p.evaluate(() => UI.App.act({ t: 'clear' })); await p.waitForTimeout(150);
  // 用 Ctrl+Z 撤销会把编组也撤掉，所以这里重新搭场景
  const ws2 = await p.evaluate(() => UI.App.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id);
  await p.waitForTimeout(200);
  await G.dragTileTo(p, 'ftri', ws2);
  await G.dragTileTo(p, 'rect', ws2);
  await p.evaluate((ws) => { const ps = Object.values(UI.S.scene.entities).filter((e) => e.parent === ws && e.type === 'gpiece'); UI.App.act({ t: 'piece', id: ps[1].id, what: 'move', value: { dx: 7, dy: 1 } }); }, ws2);
  await p.waitForTimeout(200);
  const pk = async (pieceIdx) => { const list = await p.evaluate((ws) => Object.values(UI.S.scene.entities).filter((e) => e.parent === ws && e.type === 'gpiece').map((e) => e.id), ws2); const id = list[pieceIdx]; return { id, pick: await p.evaluate(([ws, id]) => { const v = UI.StageCtx.wsVisible(UI.S.scene.entities[ws]).find((x) => x.id === id); return v ? UI.StageCtx.pickOf(v) : null; }, [ws2, id]) }; };
  const A = await pk(0), B = await pk(1);
  const hit = (pick) => p.evaluate((pick) => { const wb = document.querySelector('svg.wsbody'); const r = wb.getBoundingClientRect(); for (let y = r.top + 6; y < r.bottom - 6; y += 4) for (let x = r.left + 6; x < r.right - 6; x += 4) { const el = document.elementFromPoint(x, y), pk = el && el.closest && el.closest('[data-pick]'); if (pk && pk.dataset.pick === pick && !el.closest('[data-hdl]')) return { x, y }; } return null; }, pick);
  const clickIt = async (pick, shift) => { const h = await hit(pick); if (shift) await p.keyboard.down('Shift'); await p.mouse.click(h.x, h.y); await p.waitForTimeout(160); if (shift) await p.keyboard.up('Shift'); };
  await clickIt(A.pick, false);
  await clickIt(B.pick, true);
  ok((await selected()).length === 2, 'Shift 点两块：选中两块');
  await p.keyboard.press('Control+g'); await p.waitForTimeout(200);
  const grp = await p.evaluate((ids) => ids.map((id) => UI.S.scene.entities[id].group || null), [A.id, B.id]);
  ok(!!grp[0] && grp[0] === grp[1], 'Ctrl+G：两块编成同一组');
  await p.evaluate(() => { UI.S.wsSel = []; UI.Stage.render(); });
  await clickIt(A.pick, false);
  ok((await selected()).length === 2, '点编了组的一块：两块都选中');
  const d0 = await p.evaluate((ids) => ids.map((id) => UI.S.scene.entities[id].props.dx), [A.id, B.id]);
  const h0 = await hit(A.pick);
  await p.waitForTimeout(600);   // 点击之后要过 500 毫秒，否则同一位置的按下会被当成双击循环选中（V3）
  await p.mouse.move(h0.x, h0.y); await p.mouse.down();
  await p.mouse.move(h0.x + 30, h0.y, { steps: 6 }); await p.mouse.move(h0.x + 60, h0.y, { steps: 6 });
  await p.mouse.up(); await p.waitForTimeout(220);
  const d1 = await p.evaluate((ids) => ids.map((id) => UI.S.scene.entities[id].props.dx), [A.id, B.id]);
  const mv = [d1[0] - d0[0], d1[1] - d0[1]];
  ok(mv[0] > 0 && mv[0] === mv[1], '拖一块：两块一起动，移动量一样（' + mv.join(' / ') + ' 格）' + await state());
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await p.evaluate((ids) => ids.map((id) => UI.S.scene.entities[id].group || null), [A.id, B.id])).every((g) => g === grp[0]), '撤销拖动，编组还在');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await p.evaluate((ids) => ids.map((id) => UI.S.scene.entities[id].group || null), [A.id, B.id])).every((g) => !g), '撤销编组：两块各自独立');
  await clickIt(A.pick, false);
  await p.keyboard.press('Control+g'); await p.waitForTimeout(200);
  await p.keyboard.press('Control+Shift+G'); await p.waitForTimeout(200);
  ok((await p.evaluate((ids) => ids.map((id) => UI.S.scene.entities[id].group || null), [A.id, B.id])).every((g) => !g), 'Ctrl+Shift+G：取消编组');
  await p.evaluate(() => { UI.S.wsSel = []; UI.Stage.render(); });
  await clickIt(A.pick, false);
  ok((await selected()).length === 1, '取消编组后，点一块只选中它');
  ok(await p.locator('[data-fbar="group"]').count() > 0, '浮动工具条里有「编组」按钮');

  console.log('5. 幽灵对照');
  await p.evaluate(() => { UI.S.wsSel = []; UI.Stage.render(); });
  const hB = await hit(B.pick);
  await p.waitForTimeout(600);
  await p.mouse.move(hB.x, hB.y); await p.mouse.down();
  await p.mouse.move(hB.x + 4, hB.y, { steps: 1 });
  ok(await p.evaluate(() => document.querySelectorAll('svg.wsbody [data-ghost]').length) === 0, '刚按下、没有拖开：没有幽灵');
  await p.mouse.move(hB.x + 50, hB.y + 10, { steps: 8 });
  const gh = await p.evaluate(() => { const els = [...document.querySelectorAll('svg.wsbody [data-ghost]')]; return { n: els.length, dash: els.map((e) => e.getAttribute('stroke-dasharray')), op: els.map((e) => e.getAttribute('opacity')) }; });
  ok(gh.n >= 1 && gh.dash.every((d) => d) && gh.op.every((o) => o && +o < 1), '拖动中：原来的位置有一个虚线、半透明的幽灵（' + gh.n + ' 个）');
  await p.mouse.up(); await p.waitForTimeout(200);
  ok(await p.evaluate(() => document.querySelectorAll('svg.wsbody [data-ghost]').length) === 0, '松手以后幽灵没了');

  await G.assertInvariants(p, '本文件结束', { skip: ['undo'] });   // 控制台报错、标签、范围等不变量（撤销项数已在各个手势之后检查过）
  await b.close();
  console.log('\n界面测试（§10.5.9 剩余项）：' + pass + ' 通过，' + fail + ' 失败');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 异常：' + e.message); process.exit(1); });
