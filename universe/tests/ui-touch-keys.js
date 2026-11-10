/* node tests/ui-touch-keys.js —— 触屏与键盘（V8，docs/ui-geometry-feedback.md 2.7、2.8 和第 3 节 V8）。
 * 触屏：用 CDP 的 Input.dispatchTouchEvent 发真正的触摸事件（浏览器据此产生 pointerType 为 touch 的 pointer 事件），
 *   不用鼠标模拟。测：(a) 把手的点击范围至少 24 像素（离把手中心 9 像素的触点照样拖动它）；
 *   (b) 双指缩放台面（两个触点分开，倍数变大；合拢，倍数变小）；(c) 长按 500 毫秒弹出菜单，点“复制”生效；
 *   (d) 长按时手指移动了，不弹菜单，而是拖动。
 * 键盘：用 playwright 的 keyboard 发按键。测：Tab 循环图形（每个都到，第 n+1 次回到第一个）、Enter 打开属性、
 *   方向键移动（一格，Shift 五格，每次一个撤销项）、Delete 删除图形、Ctrl+Z 撤销、Esc 取消选择。
 * 无障碍：每个没有文字的按钮有 aria-label；图形有 aria-label（“点 A，坐标 x, y”）。
 * 没能在 playwright 里实测的（只有代码路径）：真实平板的手势、Safari/Firefox 上的触摸（见文件末尾的说明和汇报）。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const G = require('./gestures');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const wait = (p, ms) => p.waitForTimeout(ms);

// ---- 真实触摸：CDP 的 Input.dispatchTouchEvent。touchPoints 是当前按着的所有触点（结束时传空数组）----
function touchSender(cdp) {
  const send = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((q) => ({ x: q.x, y: q.y, id: q.id })) });
  return {
    start: (pts) => send('touchStart', pts),
    move: (pts) => send('touchMove', pts),
    end: () => send('touchEnd', []),
    // 从 a 滑到 b（分 steps 步，每步 gap 毫秒），所有触点一起走；ids 是触点编号
    async slide(p, from, to, steps, gap) {
      for (let i = 1; i <= steps; i++) {
        const f = i / steps;
        await send('touchMove', from.map((q, k) => ({ x: q.x + (to[k].x - q.x) * f, y: q.y + (to[k].y - q.y) * f, id: q.id })));
        await wait(p, gap);
      }
    },
  };
}
// 元素的屏幕中心（视口坐标，和 CDP 的坐标一致；页面不滚动）
const centerOf = (p, sel) => p.evaluate((sel) => {
  const el = document.querySelector(sel); if (!el) return null;
  const r = el.getBoundingClientRect(); return { x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 };
}, sel);

// ---- 场景：一个几何工作区，里面两条线段（四个自由点）----
async function buildScene(p) {
  return p.evaluate(() => {
    UI.App.openFree(); UI.App.act({ t: 'clear' });
    const ws = UI.App.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id;
    UI.Intent.run('draw', { ws, a: { x: 0, y: 0 }, b: { x: 4, y: 0 } });
    UI.Intent.run('draw', { ws, a: { x: 0, y: 3 }, b: { x: 4, y: 3 } });
    // 线段起名（不然不变量检查说“没有标签”：画线直接画出来的线段还没有名字）
    let nSeg = 0;
    for (const e of Object.values(UI.S.scene.entities)) if (e.type === 'gseg') { const nm = 'L' + (++nSeg); UI.App.act({ t: 'rename', id: e.id, name: nm }); UI.App.act({ t: 'set', id: e.id, k: 'mark', v: nm }); }
    UI.Stage.fit(); UI.Stage.render();
    return ws;
  });
}

(async () => {
  const b = await chromium.launch();
  const errs = [];

  // ================= 触屏 =================
  console.log('触屏（CDP 真实触摸事件）');
  const tctx = await b.newContext({ hasTouch: true, viewport: { width: 1024, height: 768 } });
  const tp = await tctx.newPage();
  tp.on('pageerror', (e) => errs.push(e.message));
  tp.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  G.attachErrorCollector(tp);
  await tp.goto(url); await wait(tp, 300);
  const cdp = await tctx.newCDPSession(tp);
  const T = touchSender(cdp);
  const ws = await buildScene(tp);
  await wait(tp, 200);

  // (a) 点击范围：顶点圆圈半径 7 像素，手指离中心 9 像素（圆圈外面，24 像素点击区里面）照样拖动它
  // 把台面缩小：把手的半径跟着台面的缩放变小（世界坐标里 r = 7），这样 9 像素的偏移就在圆圈外面、点击区里面
  await tp.evaluate(() => { const r = document.getElementById('stage').getBoundingClientRect(); UI.Stage.zoomAt(0.5 / UI.S.view.z, r.left + r.width / 2, r.top + r.height / 2); });
  await wait(tp, 150);
  const hd = await tp.evaluate(() => { const c = document.querySelector('svg.wsbody circle[data-drag]'); return c ? c.getAttribute('data-drag') : null; });
  ok(!!hd, '找到一个自由点的把手（circle[data-drag]）');
  const hw = await tp.evaluate(() => document.querySelector('svg.wsbody circle[data-drag]').getBoundingClientRect().width);
  ok(hw < 14, '台面缩到 50% 以后，把手的画面直径只有 ' + hw.toFixed(1) + ' 像素（远小于 24）');
  const ptx0 = await tp.evaluate((id) => UI.S.scene.entities[id].props.x, hd);
  const hc = await centerOf(tp, 'svg.wsbody circle[data-drag]');
  const start = { x: hc.x + 9, y: hc.y, id: 0 };
  // 确认这个点上没有圆圈（不是靠 elementsFromPoint 直接命中把手）：直接命中的话就不测“放大”了
  const direct = await tp.evaluate((q) => { const el = document.elementFromPoint(q.x, q.y); return !!(el && el.closest && el.closest('[data-drag]')); }, start);
  ok(!direct, '离把手中心 9 像素的触点不在把手上（只能靠 24 像素的点击区命中）');
  T.start([start]);
  await T.slide(tp, [start], [{ x: start.x + 80, y: start.y, id: 0 }], 8, 16);
  T.end(); await wait(tp, 250);
  const ptx1 = await tp.evaluate((id) => UI.S.scene.entities[id].props.x, hd);
  ok(ptx1 !== ptx0, '触摸离把手 9 像素拖动：自由点的 x 从 ' + ptx0 + ' 变到 ' + ptx1 + '（点击范围至少 24 像素）');
  await G.assertInvariants(tp, '触摸拖动把手之后');

  // (b) 双指缩放：两个触点分开 → 台面放大；合拢 → 缩小。中点不动，所以是围绕中点缩放
  const z0 = await tp.evaluate(() => UI.S.view.z);
  const mid = { x: 380, y: 380 };
  const a0 = { x: mid.x - 40, y: mid.y, id: 1 }, c0 = { x: mid.x + 40, y: mid.y, id: 2 };
  T.start([a0]); T.start([a0, c0]);
  await T.slide(tp, [a0, c0], [{ x: mid.x - 120, y: mid.y, id: 1 }, { x: mid.x + 120, y: mid.y, id: 2 }], 8, 16);
  const z1 = await tp.evaluate(() => UI.S.view.z);
  const pinching = await tp.evaluate(() => !!UI.StageCtx.pinch);
  await T.slide(tp, [{ x: mid.x - 120, y: mid.y, id: 1 }, { x: mid.x + 120, y: mid.y, id: 2 }], [{ x: mid.x - 20, y: mid.y, id: 1 }, { x: mid.x + 20, y: mid.y, id: 2 }], 8, 16);
  const z2 = await tp.evaluate(() => UI.S.view.z);
  T.end(); await wait(tp, 200);
  ok(pinching && z1 > z0 * 1.5, '双指分开：台面放大（' + Math.round(z0 * 100) + '% → ' + Math.round(z1 * 100) + '%）');
  ok(z2 < z1 * 0.7, '双指合拢：台面缩小（' + Math.round(z1 * 100) + '% → ' + Math.round(z2 * 100) + '%）');
  ok((await tp.evaluate(() => !UI.StageCtx.pinch && UI.StageCtx.touches.size === 0)), '手指都抬起后，双指缩放结束，触点记录清空');
  await G.assertInvariants(tp, '双指缩放之后');

  // (c) 长按 500 毫秒弹出菜单（不动）；点“复制”，台面多一个卡片
  const cardId = await tp.evaluate(() => { const id = UI.App.act({ t: 'add', type: 'num', x: -200, y: -150 }).id; UI.Stage.fit(); UI.Stage.render(); return id; });
  await wait(tp, 200);
  const hdC = await centerOf(tp, '.card[data-id="' + cardId + '"] .hd');
  const cardsBefore = await tp.evaluate(() => Object.keys(UI.S.scene.entities).length);
  T.start([{ x: hdC.x, y: hdC.y, id: 3 }]);
  await wait(tp, 750);
  const menu = await tp.evaluate(() => { const m = document.querySelector('.ctxmenu'); return m && m.style.display !== 'none' ? [...m.querySelectorAll('[data-ctx]')].map((x) => x.dataset.ctx) : null; });
  T.end(); await wait(tp, 600);
  ok(!!menu && menu.includes('copy') && menu.includes('del') && menu.includes('insp'), '长按 500 毫秒（手指不动）弹出菜单：' + (menu ? menu.join('、') : '没有菜单'));
  ok(!!menu && !menu.includes('turn'), '普通卡片的菜单没有“转 90°”（只有块有）');
  const copyAt = await tp.evaluate(() => { const b2 = document.querySelector('.ctxmenu [data-ctx="copy"]'); if (!b2) return null; const r = b2.getBoundingClientRect(); return { x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 }; });
  if (copyAt) { T.start([{ x: copyAt.x, y: copyAt.y, id: 4 }]); T.end(); await wait(tp, 300); }
  const cardsAfter = await tp.evaluate(() => Object.keys(UI.S.scene.entities).length);
  ok(cardsAfter === cardsBefore + 1, '点菜单里的“复制”：器材多了一个（' + cardsBefore + ' → ' + cardsAfter + '）');
  ok((await tp.evaluate(() => !document.querySelector('.ctxmenu') || document.querySelector('.ctxmenu').style.display === 'none')), '复制以后菜单收起');
  await G.assertInvariants(tp, '长按菜单：复制之后');

  // (d) 长按时手指移动了：不弹菜单，按拖动处理（卡片跟着走）
  await tp.evaluate(() => UI.Stage.fit());
  await wait(tp, 150);
  const card2 = await tp.evaluate(() => Object.keys(UI.S.scene.entities).find((id) => UI.S.scene.entities[id].type === 'num'));
  const hd2 = await centerOf(tp, '.card[data-id="' + card2 + '"] .hd');
  const xBefore = await tp.evaluate((id) => UI.S.scene.entities[id].x, card2);
  T.start([{ x: hd2.x, y: hd2.y, id: 5 }]);
  await T.slide(tp, [{ x: hd2.x, y: hd2.y, id: 5 }], [{ x: hd2.x + 60, y: hd2.y + 10, id: 5 }], 10, 40);
  await wait(tp, 300);
  const menuMoved = await tp.evaluate(() => { const m = document.querySelector('.ctxmenu'); return !!m && m.style.display !== 'none'; });
  T.end(); await wait(tp, 300);
  const xAfter = await tp.evaluate((id) => UI.S.scene.entities[id].x, card2);
  ok(!menuMoved, '长按前手指就动了（超过 10 像素）：不弹菜单');
  ok(xAfter !== xBefore, '这一下是拖动：卡片的 x 从 ' + Math.round(xBefore) + ' 变到 ' + Math.round(xAfter));
  await G.assertInvariants(tp, '长按时移动：拖动之后');

  // (e) 工具按钮在触屏上至少 36 像素（只在粗指针下）
  const coarse = await tp.evaluate(() => matchMedia('(pointer: coarse)').matches);
  if (coarse) {
    const small = await tp.evaluate(() => [...document.querySelectorAll('.wsx-tools button, .tool button')].filter((el) => el.offsetParent && (el.getBoundingClientRect().width < 36 || el.getBoundingClientRect().height < 36)).length);
    ok(small === 0, '触屏下工具按钮都在 36 像素以上（不合格 ' + small + ' 个）');
  } else {
    console.log('  skip 这个环境不是粗指针（pointer: coarse 不成立），工具按钮 36 像素只由 CSS 媒体查询保证，未在这里实测');
  }
  ok(errs.length === 0, '触屏部分：没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  await tctx.close();

  // ================= 键盘 =================
  console.log('键盘（playwright keyboard）');
  const kctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const kp = await kctx.newPage();
  kp.on('pageerror', (e) => errs.push(e.message));
  kp.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  G.attachErrorCollector(kp);
  await kp.goto(url); await wait(kp, 300);
  await buildScene(kp);
  await wait(kp, 200);
  // 进入工作区：鼠标停在画布上一下（之后 Tab 才归工作区；键盘单独进不去，见汇报）
  const wc = await centerOf(kp, 'svg.wsbody');
  await kp.mouse.move(wc.x, wc.y); await wait(kp, 100);
  ok((await kp.evaluate(() => !!UI.StageCtx.hotWs)), '鼠标停在工作区上，工作区拿到焦点（之后 Tab 归它）');

  const sel = () => kp.evaluate(() => (UI.S.wsSel || []).slice());
  const names = () => kp.evaluate(() => UI.StageCtx.kbNames(UI.StageCtx.activeWs()));
  const kinfo = (name) => kp.evaluate((name) => { const fi = UI.StageCtx.figByName(UI.StageCtx.activeWs(), name); return fi ? { kind: fi.kind, type: fi.f.type, ent: fi.ent.id, x: fi.ent.props.x, y: fi.ent.props.y } : null; }, name);
  const undoLen = () => kp.evaluate(() => UI.S.undo.length);

  // (f) Tab 循环：每个图形都到，第 n+1 次回到第一个；选中的是 wsSel 的唯一一个
  const all = await names();
  ok(all.length >= 4, '工作区里有 ' + all.length + ' 个可以用键盘选中的图形');
  const seen = [];
  for (let i = 0; i < all.length; i++) { await kp.keyboard.press('Tab'); await wait(kp, 60); seen.push((await sel())[0]); }
  ok(new Set(seen).size === all.length && seen.every((n) => all.includes(n)), 'Tab 依次选中每个图形（' + seen.length + ' 次，各不相同）');
  await kp.keyboard.press('Tab'); await wait(kp, 60);
  ok((await sel())[0] === seen[0], 'Tab 第 ' + (all.length + 1) + ' 次回到第一个图形');
  await kp.keyboard.press('Shift+Tab'); await wait(kp, 60);
  ok((await sel())[0] === seen[all.length - 1], 'Shift+Tab 倒着选：回到最后一个');

  // (g) 选中一个自由点，Enter 打开属性
  let idx = 0; const pointName = async () => { for (const n of await names()) { const k = await kinfo(n); if (k && k.kind === 'pts' && k.type === 'point') return n; } return null; };
  let pn = await pointName();
  for (let i = 0; i <= all.length && pn && (await sel())[0] !== pn; i++) { await kp.keyboard.press('Tab'); await wait(kp, 40); }
  ok(!!pn && (await sel())[0] === pn, '用 Tab 选中一个自由点');
  const pinfo = await kinfo(pn);
  await kp.keyboard.press('Enter'); await wait(kp, 150);
  const insp = await kp.evaluate(() => ({ open: !!UI.S.inspOpen, sel: UI.S.sel }));
  ok(insp.open && insp.sel === pinfo.ent, 'Enter 打开选中图形的属性（器材 ' + pinfo.ent + '）');

  // (h) 方向键移动：一格（每次一个撤销项），Shift 五格，上下也行
  const u0 = await undoLen();
  await kp.keyboard.press('ArrowLeft'); await wait(kp, 120);
  const k1 = await kinfo(pn);
  ok(k1.x === pinfo.x - 1 && k1.y === pinfo.y, '左方向键：点左移一格（x ' + pinfo.x + ' → ' + k1.x + '）');
  ok((await undoLen()) === u0 + 1, '左方向键：一步，一个撤销项');
  await kp.keyboard.press('Shift+ArrowLeft'); await wait(kp, 120);
  const k2 = await kinfo(pn);
  ok(k2.x === k1.x - 5, 'Shift+左方向键：移五格（x ' + k1.x + ' → ' + k2.x + '）');
  await kp.keyboard.press('ArrowDown'); await wait(kp, 120);
  const k3 = await kinfo(pn);
  ok(k3.y === k2.y - 1, '下方向键：点下移一格（y ' + k2.y + ' → ' + k3.y + '）');
  await kp.keyboard.press('Control+z'); await wait(kp, 120);
  const k4 = await kinfo(pn);
  ok(k4.y === k2.y, 'Ctrl+Z：撤销上一步（下移被撤销）');
  await G.assertInvariants(kp, '键盘移动之后');

  // (i) Delete 删除选中的线段（它的端点留着），Ctrl+Z 找回
  let sn = null;
  for (const n of await names()) { const k = await kinfo(n); if (k && k.type === 'segment') { sn = n; break; } }
  for (let i = 0; i <= all.length && sn && (await sel())[0] !== sn; i++) { await kp.keyboard.press('Tab'); await wait(kp, 40); }
  const segCount = () => kp.evaluate(() => Object.values(UI.S.scene.entities).filter((e) => e.type === 'gseg').length);
  const sc0 = await segCount();
  ok(!!sn && (await sel())[0] === sn, '用 Tab 选中一条线段');
  await kp.keyboard.press('Delete'); await wait(kp, 200);
  const sc1 = await segCount();
  ok(sc1 === sc0 - 1, 'Delete：线段删掉了（' + sc0 + ' → ' + sc1 + ' 条）');
  await kp.keyboard.press('Control+z'); await wait(kp, 200);
  ok((await segCount()) === sc0, 'Ctrl+Z：线段找回来');
  await G.assertInvariants(kp, '键盘删除和撤销之后');

  // (j) Esc 取消选择
  await kp.keyboard.press('Tab'); await wait(kp, 60);
  ok((await sel()).length === 1, 'Tab 选中一个图形');
  await kp.keyboard.press('Escape'); await wait(kp, 100);
  ok((await sel()).length === 0, 'Esc 取消选择');

  // (k) 无障碍：没有文字的按钮都有 aria-label；图形有 aria-label（点的读法带坐标）
  const noName = await kp.evaluate(() => [...document.querySelectorAll('button')].filter((el) => el.offsetParent && !el.getAttribute('aria-label') && !(el.textContent || '').trim()).map((el) => el.id || el.className || el.outerHTML.slice(0, 60)));
  ok(noName.length === 0, '每个没有文字的按钮都有 aria-label（不合格 ' + noName.length + ' 个' + (noName.length ? '：' + noName.slice(0, 3).join('；') : '') + '）');
  const iconIds = ['burger', 'lrail', 'rrail', 'zout', 'zin', 'rew', 'go', 'step1'];
  const missIcon = await kp.evaluate((ids) => ids.filter((id) => { const el = document.getElementById(id); return el && !el.getAttribute('aria-label'); }), iconIds);
  ok(missIcon.length === 0, '图标按钮（' + iconIds.length + ' 个）都有中文 aria-label' + (missIcon.length ? '，缺：' + missIcon.join('、') : ''));
  const pointLabel = await kp.evaluate(() => { const el = document.querySelector('svg.wsbody [data-pick][aria-label^="点 "]'); return el ? el.getAttribute('aria-label') : null; });
  ok(!!pointLabel && /坐标 -?\d/.test(pointLabel), '点的 aria-label 读出名字和坐标：' + pointLabel);

  ok(errs.length === 0, '键盘部分：没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  await kctx.close();

  console.log('\n触屏与键盘测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
