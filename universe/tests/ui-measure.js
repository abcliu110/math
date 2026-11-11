/* node tests/ui-measure.js —— 尺子、量角器、标注（docs/next-steps.md §10.5.9 第 6 条），真实鼠标和键盘：
 *   (a) 尺子：工作区的「尺子」按钮放一把尺子（台面上的标记，不是图形）；两个把手拖到点 A、B（吸附到已有的点），读数“长 4”；
 *   (b) 量角器：「量角器」放一个；三个把手拖到 A（顶点）、B、C，读数“∠ 90°”；
 *   (c) 尺子和量角器不改图形：除了标记本身，台面的数据和放尺子之前一样；每个手势最多一个撤销项；
 *   (d) 标注：单击线段 EF，输入框写一句话，点「加标注」，线段旁边出现这句话，存在台面的 notes 里（引用线段的器材 id）；撤销一次就没了；
 *   (e) 标注量角器的角：单击量角器的一条边，写一句话加标注，出现在顶点旁边；
 *   (f) 存档读回：W.load 之后尺子、量角器和两条标注都还在；删除量角器的按钮能删掉它和它的标注；
 *   (g) 没有页面错误和控制台错误。
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
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); });
  await p.waitForTimeout(150);

  // 工作区坐标 → 屏幕坐标
  const scr = (ws, pts) => p.evaluate(({ ws, pts }) => {
    const wb = document.querySelector('.card[data-id="' + ws + '"] svg.wsbody');
    const r = wb.getBoundingClientRect(), vw = UI.Stage.rangeOf(ws), sc = UI.Space.canvasOf(r, vw.span);
    return pts.map((q) => UI.Space.workspaceToScreen(q, vw, sc));
  }, { ws, pts });
  // 台面上带 data-ro 的读数文字
  const ro = (ws, kind) => p.evaluate(({ ws, kind }) => [...document.querySelectorAll('.card[data-id="' + ws + '"] svg.wsbody [data-ro' + (kind ? '="' + kind + '"' : '') + ']')].map((t) => t.textContent), { ws, kind });
  const selected = () => p.evaluate(() => (UI.S.wsSel || []).slice());
  // 标记（尺子、量角器）的把手在屏幕上的中心：按标记 id 和把手号找（尺子和量角器的把手号都从 0 开始）
  const handle = (ws, i, mark) => p.evaluate(({ ws, i, mark }) => {
    const el = document.querySelector('.card[data-id="' + ws + '"] svg.wsbody [data-mhdl][data-mark="' + (mark || '') + '"][data-mi="' + i + '"]');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, { ws, i, mark });
  // 图形上一个可以点的位置：最上面的命中元素是这个图形的 data-pick（和 ui-readout 一样）
  const hitPoint = (ws, pick) => p.evaluate(([ws, pick]) => {
    const wb = document.querySelector('.card[data-id="' + ws + '"] svg.wsbody'), r = wb.getBoundingClientRect();
    for (let y = r.top + 6; y < r.bottom - 6; y += 4) for (let x = r.left + 6; x < r.right - 6; x += 4) {
      const el = document.elementFromPoint(x, y), pk = el && el.closest && el.closest('[data-pick]');
      if (pk && pk.dataset.pick === pick && pk.closest('svg.wsbody') === wb && !el.closest('[data-hdl]') && !el.closest('[data-mhdl]')) return { x, y };
    }
    return null;
  }, [ws, pick]);
  const pickOf = (ws, id) => p.evaluate(([ws, id]) => { const v = UI.StageCtx.wsVisible(UI.S.scene.entities[ws]).find((x) => x.id === id); return v ? UI.StageCtx.pickOf(v) : null; }, [ws, id]);
  // 真实鼠标拖动：按下、分步移动、松开
  const dragTo = async (from, to) => {
    await p.mouse.move(from.x, from.y); await p.mouse.down();
    await p.mouse.move(to.x, to.y, { steps: 10 }); await p.mouse.up();
    await p.waitForTimeout(220);
  };
  // 不含标记（尺子、量角器、标注）的台面数据：图形不能因为放了尺子而变
  // 图形数据：器材和连线（不含视图和标记、标注；id 计数器也不算，标记放上去会用到它）
  const figData = () => p.evaluate(() => { const s = UI.State.stripView(UI.S.scene); return JSON.stringify({ entities: s.entities, links: s.links }); });
  const undoLen = () => p.evaluate(() => UI.S.undo.length);
  const marksOf = () => p.evaluate(() => (UI.S.scene.marks || []).map((m) => ({ id: m.id, kind: m.kind, ws: m.ws, n: m.pts.length })));
  const notesOf = () => p.evaluate(() => (UI.S.scene.notes || []).map((n) => ({ id: n.id, ref: n.ref, text: n.text, ws: n.ws })));

  console.log('搭场景：三角形 ABC（A(0,0)、B(4,0)、C(0,3)），线段 EF（E(6,0)、F(9,4)）');
  const ids = await p.evaluate(() => {
    const A = UI.App;
    const ws = A.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id;
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
  const { ws } = ids;
  const base = await figData();   // 放尺子之前的图形数据

  // ---- (a) 尺子 ----
  await p.click('.wsx[data-ws="' + ws + '"] [data-ws-tool="ruler"]');
  await p.waitForTimeout(200);
  await G.assertInvariants(p, '放尺子');
  const rm = await marksOf();
  ok(rm.length === 1 && rm[0].kind === 'ruler' && rm[0].ws === ws && rm[0].n === 2, '(a) 点「尺子」：台面上多一把尺子（两个把手）（实际 ' + JSON.stringify(rm) + '）');
  const rulerId = rm[0] && rm[0].id;
  const undo0 = await undoLen();
  const [pA, pB] = await scr(ws, [{ x: 0, y: 0 }, { x: 4, y: 0 }]);
  const h0 = await handle(ws, 0, rulerId), h1 = await handle(ws, 1, rulerId);
  ok(!!h0 && !!h1, '(a) 尺子的两个把手在屏幕上');
  await dragTo(h0, pA);
  await G.assertInvariants(p, '把尺子的第一个把手拖到 A');
  await dragTo(await handle(ws, 1, rulerId), pB);
  await G.assertInvariants(p, '把尺子的第二个把手拖到 B');
  const rr = await ro(ws, 'ruler');
  ok(rr.length === 1 && rr[0] === '长 4', '(a) 两个把手吸附到 A、B：读数 “长 4”（实际 ' + JSON.stringify(rr) + '）');
  const pts = await p.evaluate((id) => UI.S.scene.marks.find((m) => m.id === id).pts, rulerId);
  ok(JSON.stringify(pts) === JSON.stringify([{ x: 0, y: 0 }, { x: 4, y: 0 }]), '(a) 尺子的两端存的是精确的 A、B 坐标（实际 ' + JSON.stringify(pts) + '）');
  ok((await undoLen()) === undo0 + 2, '(c) 每次拖动是一个撤销项（两次拖动，撤销栈长度 +2）');
  ok((await figData()) === base, '(c) 放尺子、拖尺子：图形数据（点、线、块）一个字都没变');

  // ---- (a) 整把尺子拖动：按住尺子本身，两端一起挪 2 个单位，再挪回来 ----
  const hA = await handle(ws, 0, rulerId), hB = await handle(ws, 1, rulerId);
  const midOf = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const [o2, u2] = await scr(ws, [{ x: 0, y: 0 }, { x: 2, y: 0 }]);
  const step = { x: u2.x - o2.x, y: u2.y - o2.y };   // 2 个单位对应的屏幕位移
  const m0 = midOf(hA, hB);
  const undoBody = await undoLen();
  await dragTo(m0, { x: m0.x + step.x, y: m0.y + step.y });
  await G.assertInvariants(p, '按住尺子拖动（右移 2）');
  const shifted = await p.evaluate((id) => UI.S.scene.marks.find((m) => m.id === id).pts, rulerId);
  ok(JSON.stringify(shifted) === JSON.stringify([{ x: 2, y: 0 }, { x: 6, y: 0 }]), '(a) 按住尺子拖动：两端整体挪 2 个单位，坐标仍是整数（实际 ' + JSON.stringify(shifted) + '）');
  ok((await ro(ws, 'ruler')).join() === '长 4', '(a) 挪动以后读数还是 “长 4”');
  ok((await undoLen()) === undoBody + 1, '(c) 拖动尺子是一个撤销项');
  const h2 = midOf(await handle(ws, 0, rulerId), await handle(ws, 1, rulerId));
  await dragTo(h2, { x: h2.x - step.x, y: h2.y - step.y });   // 挪回来
  await G.assertInvariants(p, '按住尺子拖回来（左移 2）');
  const back = await p.evaluate((id) => UI.S.scene.marks.find((m) => m.id === id).pts, rulerId);
  ok(JSON.stringify(back) === JSON.stringify([{ x: 0, y: 0 }, { x: 4, y: 0 }]), '(a) 拖回来：尺子回到 A、B');
  ok((await figData()) === base, '(c) 拖尺子：图形数据还是和放之前一样');

  // ---- (b) 量角器 ----
  await p.click('.wsx[data-ws="' + ws + '"] [data-ws-tool="protractor"]');
  await p.waitForTimeout(200);
  await G.assertInvariants(p, '放量角器');
  const pm = (await marksOf()).filter((m) => m.kind === 'protractor');
  ok(pm.length === 1 && pm[0].n === 3, '(b) 点「量角器」：台面上多一个量角器（三个把手）');
  const protId = pm[0] && pm[0].id;
  const [pA2, pB2, pC2] = await scr(ws, [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 3 }]);
  // 量角器的三个把手：0 是第一条边的端点，1 是顶点，2 是第二条边的端点
  await dragTo(await handle(ws, 1, protId), pA2);   // 顶点到 A
  await dragTo(await handle(ws, 0, protId), pB2);   // 一条边到 B
  await dragTo(await handle(ws, 2, protId), pC2);   // 另一条边到 C
  await G.assertInvariants(p, '量角器三个把手拖到 A、B、C');
  const pr = await ro(ws, 'protractor');
  ok(pr.length === 1 && pr[0] === '∠ 90°', '(b) 量角器顶点在 A、边到 B、C：读数 “∠ 90°”（实际 ' + JSON.stringify(pr) + '）');
  ok((await figData()) === base, '(c) 量角器不改图形：图形数据还是和放之前一样');

  // ---- (d) 标注：线段 ----
  const segPick = await pickOf(ws, ids.seg);
  const mid = (await scr(ws, [{ x: 7.5, y: 2 }]))[0];
  await G.clickAt(p, mid.x, mid.y, '单击线段 EF');
  ok((await selected()).join() === segPick, '(d) 单击线段：选中它');
  await p.fill('[data-note-in]', '这条线段是中位线');
  await G.clickSel(p, '[data-note-add]');
  await G.assertInvariants(p, '给线段加标注');
  const nt = await notesOf();
  ok(nt.length === 1 && nt[0].ref === ids.seg && nt[0].text === '这条线段是中位线', '(d) 点「加标注」：台面上记下一条标注，引用线段的器材（实际 ' + JSON.stringify(nt) + '）');
  const nr = await ro(ws, 'note');
  ok(nr.join() === '这条线段是中位线', '(d) 标注的文字画在线段旁边（实际 ' + JSON.stringify(nr) + '）');
  ok((await figData()) === base, '(c) 标注不改图形数据');
  await G.undo(p);
  await G.assertInvariants(p, '撤销标注', { skip: [] });
  ok((await notesOf()).length === 0 && (await ro(ws, 'note')).length === 0, '(d) 撤销一次：标注没了');
  // 撤销回到加标注之前，再加回来（之后的存档测试要用）
  await G.clickAt(p, mid.x, mid.y, '再单击线段 EF');
  await p.fill('[data-note-in]', '这条线段是中位线');
  await G.clickSel(p, '[data-note-add]');
  await G.assertInvariants(p, '重新加标注');

  // ---- (e) 标注：量角器的角 ----
  const protPick = 'mk:' + protId;
  const armPt = await hitPoint(ws, protPick);
  ok(!!armPt, '(e) 量角器的边上有一个可以点的位置');
  if (armPt) await G.clickAt(p, armPt.x, armPt.y, '单击量角器的边');
  ok((await selected()).join() === protPick, '(e) 单击量角器的边：选中量角器');
  await p.fill('[data-note-in]', '这是直角');
  await G.clickSel(p, '[data-note-add]');
  await G.assertInvariants(p, '给量角器的角加标注');
  const nt2 = (await notesOf()).filter((n) => n.ref === protId);
  ok(nt2.length === 1 && nt2[0].text === '这是直角', '(e) 量角器的角上加标注：引用量角器（实际 ' + JSON.stringify(nt2) + '）');
  ok((await ro(ws, 'note')).includes('这是直角'), '(e) 标注“这是直角”画在顶点旁边');

  // ---- (f) 存档读回：标记和标注都在 ----
  const saved = await p.evaluate(() => { const s = JSON.stringify(UI.S.scene); const back = U.World.load(s); return { marks: (back.marks || []).length, notes: (back.notes || []).length, same: JSON.stringify(back.marks) === JSON.stringify(UI.S.scene.marks) && JSON.stringify(back.notes) === JSON.stringify(UI.S.scene.notes) }; });
  ok(saved.marks === 2 && saved.notes === 2 && saved.same, '(f) 存档读回：两把标记、两条标注都在，内容一致（实际 ' + JSON.stringify(saved) + '）');

  // ---- (f) 删除量角器：它的标注一起删 ----
  await G.clickAt(p, armPt ? armPt.x : mid.x, armPt ? armPt.y : mid.y, '再单击量角器的边');
  await p.click('[data-mark-del]');
  await G.assertInvariants(p, '删除量角器');
  const left = await marksOf();
  ok(left.length === 1 && left[0].kind === 'ruler', '(f) 删除量角器：只剩尺子');
  ok((await notesOf()).every((n) => n.ref !== protId), '(f) 删除量角器：它的标注一起删掉');

  ok((await figData()) === base, '(c) 全部操作之后，图形数据和开始时一样');
  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n尺子、量角器、标注测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('  FAIL 脚本异常：' + e.message); process.exit(1); });
