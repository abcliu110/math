/* node tests/ui-align10.js —— §10.5.9 第 3 条：多选对齐与等距分布工具条（真实鼠标）。
 *  1. 选中两块和一个自由点围成的梯形（Shift 点）后，工具条出现八个按钮；只选一个时没有；
 *  2. 左、右、顶、底对齐：边缘坐标精确相等，另一个方向不动；点一次，撤销一次回到原样；
 *  3. 水平、垂直居中：能精确落在整数格上时中心精确相等，并且一步撤销；做不到就说明原因、不动图形；
 *  4. 水平、垂直等距：两端不动，中间的间距精确相等，一步撤销；间距不是整数时说明原因、不动图形；
 *  5. 只选两个图形做等距：说明至少要三个。
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

  const pieceIds = () => p.evaluate((ws) => Object.values(UI.S.scene.entities).filter((e) => e.parent === ws && e.type === 'gpiece').map((e) => e.id), ws);
  const gptIds = () => p.evaluate(() => Object.values(UI.S.scene.entities).filter((e) => e.type === 'gpt').map((e) => e.id));
  const pickOf = (id) => p.evaluate(([ws, id]) => { const v = UI.StageCtx.wsVisible(UI.S.scene.entities[ws]).find((x) => x.id === id); return v ? UI.StageCtx.pickOf(v) : null; }, [ws, id]);
  const hitPoint = (pick) => p.evaluate((pick) => {
    const wb = document.querySelector('svg.wsbody'), r = wb.getBoundingClientRect();
    for (let y = r.top + 6; y < r.bottom - 6; y += 4) for (let x = r.left + 6; x < r.right - 6; x += 4) {
      const el = document.elementFromPoint(x, y), pk = el && el.closest && el.closest('[data-pick]');
      if (pk && pk.dataset.pick === pick && pk.closest('svg.wsbody') === wb && !el.closest('[data-hdl]')) return { x, y };
    }
    return null;
  }, pick);
  const clickPick = async (pick, shift) => {
    const h = await hitPoint(pick);
    if (shift) await p.keyboard.down('Shift');
    await p.mouse.click(h.x, h.y); await p.waitForTimeout(160);
    if (shift) await p.keyboard.up('Shift');
  };
  const selectedCount = () => p.evaluate(() => (UI.S.wsSel || []).length);
  const msg = () => p.evaluate(() => UI.S.wsMsg || '');
  const undo = async () => { await p.keyboard.press('Control+z'); await p.waitForTimeout(220); };
  // 真实鼠标点工具条上的按钮
  const clickBar = async (op) => {
    const bb = await p.locator('[data-fbar="' + op + '"]').first().boundingBox();
    if (!bb) return false;
    await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(260);
    return true;
  };
  // 图形的外框（工作区坐标）：块用求值结果（台面上画出来的），自由点围成的图形用它的顶点
  const boxes = (items) => p.evaluate((items) => items.map((it) => {
    let P;
    if (it.kind === 'piece') P = UI.S.D[it.id].out.f.data.pts.map((q) => ({ x: U.Q.num(q.x), y: U.Q.num(q.y) }));
    else P = it.ids.map((g) => ({ x: UI.S.scene.entities[g].props.x, y: UI.S.scene.entities[g].props.y }));
    const xs = P.map((q) => q.x), ys = P.map((q) => q.y);
    return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
  }), items);
  const sameBoxes = (A, B) => A.length === B.length && A.every((a, i) => ['x0', 'x1', 'y0', 'y1'].every((k) => a[k] === B[i][k]));
  // 把图形整体平移（块改 dx、dy；自由点围成的图形改每个顶点的 x、y）
  const moveBy = (it, dx, dy) => p.evaluate(([it, dx, dy]) => {
    if (it.kind === 'piece') {
      const e = UI.S.scene.entities[it.id];
      if (dx) UI.App.act({ t: 'set', id: it.id, k: 'dx', v: e.props.dx + dx });
      if (dy) UI.App.act({ t: 'set', id: it.id, k: 'dy', v: e.props.dy + dy });
    } else for (const g of it.ids) {
      const e = UI.S.scene.entities[g];
      if (dx) UI.App.act({ t: 'set', id: g, k: 'x', v: e.props.x + dx });
      if (dy) UI.App.act({ t: 'set', id: g, k: 'y', v: e.props.y + dy });
    }
  }, [it, dx, dy]);
  // 把第 i 个图形的左下角（x0, y0）挪到 (x0, y0)
  const placeAt = async (items, i, x0, y0) => { const bx = (await boxes(items))[i]; await moveBy(items[i], x0 - bx.x0, y0 - bx.y0); await p.waitForTimeout(120); };
  // 选中三个图形（第一个单击，后两个 Shift 点）
  const sel3 = async (items) => {
    await p.evaluate(() => { UI.S.wsSel = []; UI.Stage.render(); }); await p.waitForTimeout(120);
    await clickPick(items[0].pick, false);
    await clickPick(items[1].pick, true);
    await clickPick(items[2].pick, true);
  };
  const wOf = (v, ax) => v[ax + '1'] - v[ax + '0'];

  console.log('搭场景：两块（三角形、长方形）和一个自由点围成的梯形');
  await G.dragTileTo(p, 'ftri', ws);
  await G.dragTileTo(p, 'rect', ws);
  await G.assertInvariants(p, '拖入两块');
  const pc = await pieceIds();
  ok(pc.length === 2, '工作区里有两块');
  const g0 = await gptIds();
  await p.locator('.wsmini .shape-menu summary').first().click();
  await p.locator('.wsmini .shape-pop button[data-ws-shape="ftrap"]').first().click(); await p.waitForTimeout(250);
  await p.evaluate(() => document.querySelectorAll('details.shape-menu[open]').forEach((d) => { d.open = false; })); await p.waitForTimeout(100);
  const trapG = (await gptIds()).filter((g) => !g0.includes(g));
  ok(trapG.length === 4, '放了一个梯形（4 个自由点）');
  // 梯形的四个点放到确定的位置：x 从 -9 到 -5，y 从 -1 到 2
  await p.evaluate(([ids, xy]) => { ids.forEach((id, i) => UI.App.act({ t: 'set', id, k: 'x', v: xy[i][0] })); ids.forEach((id, i) => UI.App.act({ t: 'set', id, k: 'y', v: xy[i][1] })); }, [trapG, [[-9, -1], [-5, -1], [-6, 2], [-8, 2]]]);
  await p.waitForTimeout(200);
  // items[0]、items[1] 是块，items[2] 是梯形（自由点围成的图形）
  const items = [{ kind: 'piece', id: pc[0] }, { kind: 'piece', id: pc[1] }, { kind: 'pts', ids: trapG }];
  items[0].pick = await pickOf(pc[0]);
  items[1].pick = await pickOf(pc[1]);
  items[2].pick = await p.evaluate(([ws, skip]) => { const el = [...document.querySelectorAll('svg.wsbody[data-wsid="' + ws + '"] path[data-pick]')].find((x) => x.dataset.pri === '2' && !skip.includes(x.dataset.pick)); return el ? el.dataset.pick : null; }, [ws, [items[0].pick, items[1].pick]]);
  ok(items.every((it) => !!it.pick), '三个图形都能在画面上点到');
  // 摆到互不重叠的位置
  await placeAt(items, 0, -3, -6);
  await placeAt(items, 1, 3, 3);

  console.log('1. 工具条');
  await sel3(items);
  ok((await selectedCount()) === 3, '多选三个（Shift 点）');
  ok(await p.locator('[data-fbar^="al-"]').count() === 8, '选中多个时工具条出现八个对齐和分布按钮');
  await clickPick(items[0].pick, false);
  ok(await p.locator('[data-fbar^="al-"]').count() === 0, '只选一个时没有对齐按钮');
  await sel3(items);

  console.log('2. 左、右、顶、底对齐（每个一步，撤销一次回去）');
  const edgeOps = [
    ['al-l', '左对齐', 'x', 'x0', (B) => Math.min(...B.map((v) => v.x0))],
    ['al-r', '右对齐', 'x', 'x1', (B) => Math.max(...B.map((v) => v.x1))],
    ['al-t', '顶对齐', 'y', 'y1', (B) => Math.max(...B.map((v) => v.y1))],
    ['al-b', '底对齐', 'y', 'y0', (B) => Math.min(...B.map((v) => v.y0))],
  ];
  for (const [op, label, ax, key, target] of edgeOps) {
    await sel3(items);
    const before = await boxes(items);
    const t = target(before);
    await clickBar(op);
    const after = await boxes(items);
    ok(after.every((v) => v[key] === t), label + '：三个图形的 ' + key + ' 都等于 ' + t + '（' + after.map((v) => v[key]).join(' / ') + '）消息：' + (await msg()));
    const other = ax === 'x' ? ['y0', 'y1'] : ['x0', 'x1'];
    ok(after.every((v, i) => other.every((k) => v[k] === before[i][k])), label + '：另一个方向不动');
    await undo();
    ok(sameBoxes(await boxes(items), before), label + '：撤销一次，回到原来的位置');
  }

  console.log('3. 水平、垂直居中');
  for (const [op, label, ax] of [['al-hc', '水平居中', 'x'], ['al-vc', '垂直居中', 'y']]) {
    await sel3(items);
    const before = await boxes(items);
    const target = (Math.min(...before.map((v) => v[ax + '0'])) + Math.max(...before.map((v) => v[ax + '1']))) / 2;
    // 能精确居中：每个图形的中心到目标中心的距离都是整数（否则不动，并说明原因）
    const feasible = before.every((v) => Number.isInteger(target - (v[ax + '0'] + v[ax + '1']) / 2));
    await clickBar(op);
    const after = await boxes(items);
    if (feasible) {
      ok(after.every((v) => (v[ax + '0'] + v[ax + '1']) / 2 === target), label + '：三个图形的中心都在 ' + target + '（精确）');
      await undo();
      ok(sameBoxes(await boxes(items), before), label + '：撤销一次，回到原来的位置');
    } else {
      ok(sameBoxes(after, before) && (await msg()).length > 0, label + '：中心不能精确落在整数格上，不动图形，并说明原因（' + (await msg()) + '）');
    }
  }

  console.log('4. 水平、垂直等距');
  // 摆成：梯形在最小端（x0 = -9），块 A 的最小端 = -2，块 B 的最大端 = -9 + 三个宽度之和 + 4，这样两个间距都是 2
  const arrange = async (ax) => {
    const mn = ax + '0', mx = ax + '1';
    const at = async (i, target) => { const bx = await boxes(items); const d = target - bx[i][mn]; await moveBy(items[i], ax === 'x' ? d : 0, ax === 'y' ? d : 0); };
    await at(2, -9);
    await at(0, -2);
    const bx = await boxes(items);
    const sum = bx.reduce((s, v) => s + wOf(v, ax), 0);
    const want = -9 + sum + 4;
    const d = want - bx[1][mx];
    await moveBy(items[1], ax === 'x' ? d : 0, ax === 'y' ? d : 0);
    await p.waitForTimeout(120);
  };
  for (const [op, label, ax] of [['al-dh', '水平等距', 'x'], ['al-dv', '垂直等距', 'y']]) {
    await arrange(ax);
    await sel3(items);
    const before = await boxes(items);
    const lo = (v) => v[ax + '0'], hi = (v) => v[ax + '1'];
    const order = [0, 1, 2].sort((i, j) => lo(before[i]) - lo(before[j]));
    const [L, M, R] = order.map((i) => before[i]);
    await clickBar(op);
    const after = await boxes(items);
    const aL = after[order[0]], aM = after[order[1]], aR = after[order[2]];
    ok(lo(aL) === lo(L) && hi(aR) === hi(R), label + '：两端不动');
    ok(lo(aM) - hi(aL) === 2 && lo(aR) - hi(aM) === 2, label + '：中间的两个间距都是 2（' + (lo(aM) - hi(aL)) + '、' + (lo(aR) - hi(aM)) + '）');
    await undo();
    ok(sameBoxes(await boxes(items), before), label + '：撤销一次，回到原来的位置');
    // 间距不是整数（右边的图形挪 1 格，间距变成 2.5）：说明原因，不动图形
    const far = order[2];
    await moveBy(items[far], ax === 'x' ? 1 : 0, ax === 'y' ? 1 : 0);
    await p.waitForTimeout(120);
    await sel3(items);
    const before2 = await boxes(items);
    await clickBar(op);
    ok(sameBoxes(await boxes(items), before2) && (await msg()).length > 0, label + '：间距不是整数，不动图形，并说明原因（' + (await msg()) + '）');
    await moveBy(items[far], ax === 'x' ? -1 : 0, ax === 'y' ? -1 : 0);
    await p.waitForTimeout(120);
  }

  console.log('5. 只选两个图形做等距');
  await p.evaluate(() => { UI.S.wsSel = []; UI.Stage.render(); }); await p.waitForTimeout(120);
  await clickPick(items[0].pick, false);
  await clickPick(items[1].pick, true);
  const before3 = await boxes(items);
  await clickBar('al-dh');
  ok(sameBoxes(await boxes(items), before3) && (await msg()).indexOf('三个') >= 0, '两个图形不能等距分布，说明至少要三个（' + (await msg()) + '）');

  await G.assertInvariants(p, '本文件结束', { skip: ['undo'] });
  await b.close();
  console.log('\n界面测试（§10.5.9 第 3 条：对齐与等距）：' + pass + ' 通过，' + fail + ' 失败');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 异常：' + e.message); process.exit(1); });
