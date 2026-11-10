/* node tests/ui-robust.js —— 界面健壮性（docs/ui-robustness.md 第 3.2 节 P6、第 5 节 U8）。
 * 全部用真实鼠标（tests/gestures.js）：
 *   (a) 端口遮挡：另一张卡片伸出来的端口压在这张卡片的标题栏上，在那一点点击，要选中标题栏所在的卡片（不是端口）。
 *   (b) P6：十格阵（只放筹码）：从器材架拖筹码进去成功；拖一个它不接受的器材上去，不能盖在十格阵上，要留在台面的空位。
 *   (c) 每个手势之后检查不变量（G.assertInvariants）。
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
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  G.attachErrorCollector(p);
  await p.goto(url); await p.waitForTimeout(300);

  console.log('(a) 端口遮挡标题栏：点标题栏上被别的卡片端口压住的那一点');
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); });
  const ids = await p.evaluate(() => {
    const B = UI.App.act({ t: 'add', type: 'balance', x: 0, y: 0 }).id;
    const A = UI.App.act({ t: 'add', type: 'balance', x: 500, y: 200 }).id;
    return { A, B };
  });
  await p.waitForTimeout(250);
  // 把卡片 A 挪到 B 的输出端口上：A 的标题栏中心对准 B 的端口中心
  const target = await p.evaluate(({ A, B }) => {
    const pr = document.querySelector('.port.out[data-id="' + B + '"]').getBoundingClientRect();
    const ar = document.querySelector('.card[data-id="' + A + '"]').getBoundingClientRect();
    const z = UI.S.view.z;
    const dx = (pr.left + pr.width / 2 - (ar.left + ar.width / 2)) / z, dy = (pr.top + pr.height / 2 - (ar.top + 14)) / z;
    const e = UI.S.scene.entities[A];
    UI.App.act({ t: 'move', id: A, x: Math.round(e.x + dx), y: Math.round(e.y + dy) });
    return { x: pr.left + pr.width / 2, y: pr.top + pr.height / 2 };
  }, ids);
  await p.waitForTimeout(250);
  const top = await p.evaluate(({ x, y, A }) => {
    const el = document.elementFromPoint(x, y);
    return { hit: el ? (el.closest('.hd') ? 'hd' : el.tagName) : null, card: el && el.closest('.card') ? el.closest('.card').dataset.id : null, want: A };
  }, { ...target, A: ids.A });
  ok(top.hit === 'hd' && top.card === ids.A, '端口位置的最上层元素是卡片 A 的标题栏（实际：' + JSON.stringify(top) + '）');
  await G.assertInvariants(p, '卡片 A 压在 B 的端口上');
  await p.mouse.click(target.x, target.y);
  await p.waitForTimeout(200);
  const sel = await p.evaluate(() => ({ sel: UI.S.sel, linking: !!(window.UI && UI.Stage && UI.S.linking) }));
  ok(sel.sel === ids.A, '点击标题栏：选中卡片 A（实际选中 ' + sel.sel + '，期望 ' + ids.A + '）');
  await G.assertInvariants(p, '点击卡片 A 的标题栏（端口旁）');

  console.log('(b) P6：十格阵只放筹码');
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); UI.App.act({ t: 'add', type: 'tenframe', x: 400, y: 200 }); });
  await p.waitForTimeout(250);
  const tf = await p.evaluate(() => Object.values(UI.S.scene.entities).find((e) => e.type === 'tenframe').id);
  const tfCenter = async () => p.evaluate((id) => { const r = document.querySelector('.card[data-id="' + id + '"]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, tf);
  await G.dragTileTo(p, 'counter', await tfCenter());
  await G.assertInvariants(p, '拖筹码到十格阵');
  const cnt = await p.evaluate(() => Object.values(UI.S.scene.entities).filter((e) => e.type === 'counter' && e.parent).map((e) => ({ parent: e.parent, slot: e.slot })));
  ok(cnt.length === 1 && cnt[0].parent === tf && cnt[0].slot === 'cells', '筹码放进十格阵的 cells（实际 ' + JSON.stringify(cnt) + '）');

  await G.dragTileTo(p, 'balance', await tfCenter());
  await G.assertInvariants(p, '拖天平到十格阵（它不接受）');
  const over = await p.evaluate((id) => {
    const t = document.querySelector('.card[data-id="' + id + '"]').getBoundingClientRect();
    const hits = [...document.querySelectorAll('.card[data-id]')].filter((c) => {
      const e = UI.S.scene.entities[c.dataset.id];
      if (!e || e.parent || c.dataset.id === id) return false;
      const r = c.getBoundingClientRect();
      return r.left < t.right && r.right > t.left && r.top < t.bottom && r.bottom > t.top;
    }).map((c) => c.dataset.id);
    return hits;
  }, tf);
  ok(over.length === 0, '天平没有盖在十格阵上（重叠的游离卡片：' + JSON.stringify(over) + '）');
  const bal = await p.evaluate(() => Object.values(UI.S.scene.entities).filter((e) => e.type === 'balance').map((e) => ({ parent: e.parent || null })));
  ok(bal.length === 1 && bal[0].parent === null, '天平留在台面上（不在十格阵里）（实际 ' + JSON.stringify(bal) + '）');

  console.log('(d) P11：删除工作区后，选中项和消息不残留');
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); });
  const ws2 = await p.evaluate(() => UI.App.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id);
  await p.waitForTimeout(250);
  await G.dragTileTo(p, 'ftri', ws2);
  await G.assertInvariants(p, '工作区里放一个三角形');
  // 残留的状态（选中项指向一个已经不存在的实体、旧消息）：删除之后都应当清掉
  await G.clickCard(p, ws2);
  await p.evaluate(() => { UI.S.wsSel = ['#e999.n', '#e998.0']; UI.S.wsMsg = '旧消息'; UI.S.wsMsgKind = 'bad'; });
  await G.press(p, 'Delete');
  await p.waitForTimeout(250);
  if (await p.evaluate(() => !!document.querySelector('#dlg.open'))) { await G.clickSel(p, '#dlg-delall'); await p.waitForTimeout(250); }
  await G.assertInvariants(p, '删除工作区');
  const left = await p.evaluate(() => ({ ws: Object.values(UI.S.scene.entities).filter((e) => e.type === 'gworkspace').length, sel: UI.S.wsSel, msg: UI.S.wsMsg }));
  ok(left.ws === 0 && left.sel.length === 0 && left.msg === '', '删除工作区后没有残留的选中项和消息（实际 ' + JSON.stringify(left) + '）');

  console.log('(e) P7：断点续做的重放，和真实鼠标做出来的台面一致');
  await p.evaluate(() => UI.App.openProblem('geo-median-area', 'practice'));
  await p.waitForTimeout(300);
  const wsP = await p.evaluate(() => Object.values(UI.S.scene.entities).find((e) => e.type === 'gworkspace') || null);
  if (!wsP) { ok(false, '几何题里找不到工作区（题目数据变了？）'); } else {
    // 这道题的器材架只开放一部分器材（练习模式按步骤解锁）：用开着的 figmeasure，先放到台面，再拖进工作区
    await G.dragTileTo(p, 'figmeasure', { x: 1000, y: 620 });
    const fm = await p.evaluate(() => Object.values(UI.S.scene.entities).filter((e) => e.type === 'figmeasure').map((e) => e.id));
    ok(fm.length === 1, '器材架拖出的图形落在台面上（' + JSON.stringify(fm) + '）');
    await G.dragCardTo(p, fm[0], wsP.id);
    await G.assertInvariants(p, '台面上的图形拖进工作区');
    await G.dragTileTo(p, 'figmeasure', { x: 900, y: 500 });
    const beforeUndo = await p.evaluate(() => {
      const strip = (sc) => JSON.stringify(Object.values(sc.entities).map((e) => { const c = Object.assign({}, e); delete c.ui; return c; }).sort((a, b) => (a.id < b.id ? -1 : 1)));
      return { ok: strip(U.Session.replay(UI.S.session)) === strip(UI.S.scene), n: UI.S.session.acts.length };
    });
    ok(beforeUndo.ok && beforeUndo.n > 0, '拖放之后：重放的台面和当前台面一致（记录了 ' + beforeUndo.n + ' 条操作）');
    await G.undo(p);
    await G.redo(p);
    await G.assertInvariants(p, '题目里放图形、撤销、重做');
    const same = await p.evaluate(() => {
      const strip = (sc) => JSON.stringify(Object.values(sc.entities).map((e) => { const c = Object.assign({}, e); delete c.ui; return c; }).sort((a, b) => (a.id < b.id ? -1 : 1)));
      const rep = U.Session.replay(UI.S.session);
      const a = Object.values(rep.entities).map((e) => JSON.stringify(e)).sort(), c = Object.values(UI.S.scene.entities).map((e) => JSON.stringify(Object.assign({}, e, { ui: undefined }))).sort();
      return { ok: strip(rep) === strip(UI.S.scene), n: UI.S.session.acts.length, nr: a.length, nl: c.length, ex: a.filter((x) => !c.includes(x)).slice(0, 1).concat(c.filter((x) => !a.includes(x)).slice(0, 1)) };
    });
    ok(same.ok, '重放的台面和当前台面一致（记录了 ' + same.n + ' 条操作；差异 ' + JSON.stringify(same) + '）');
  }

  console.log('(f) P8：复制工作区里的图形，复制品留在同一个工作区里（动作层面：工作区图形没有复制按钮）');
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); UI.App.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }); });
  await p.waitForTimeout(250);
  const ws3 = await p.evaluate(() => Object.values(UI.S.scene.entities).find((e) => e.type === 'gworkspace').id);
  await G.dragTileTo(p, 'ftri', ws3);
  await G.assertInvariants(p, '工作区里放一个三角形');
  const fig = await p.evaluate((ws) => Object.values(UI.S.scene.entities).find((e) => e.parent === ws).id, ws3);
  await p.evaluate((id) => UI.App.act({ t: 'copy', id }), fig);
  await G.assertInvariants(p, '复制工作区里的图形');
  const kids = await p.evaluate((ws) => Object.values(UI.S.scene.entities).filter((e) => e.parent === ws).map((e) => e.type), ws3);
  // 拖进工作区时，图形旁边还会带一个块（gpiece），只数图形本身
  ok(kids.filter((t) => t === 'ftri').length === 2, '复制品还在同一个工作区里（工作区的子器材：' + JSON.stringify(kids) + '）');

  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n界面健壮性测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message.split('\n')[0]); process.exit(1); });
