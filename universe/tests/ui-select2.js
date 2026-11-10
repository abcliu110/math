/* node tests/ui-select2.js —— 工作区选择（V3 剩余，docs/ui-geometry-feedback.md 1.5 和第 3 节 V3）。
 * 用真实鼠标和键盘：
 *   (1) 选中提示：选中图形后，画布上出现“已选中：…，按 Tab 切换，Esc 取消”，Esc 后消失；
 *   (2) Alt 点击：按住 Alt 点一下，选中点击位置下面的第二个图形（不用双击）；
 *   (3) Tab / Shift+Tab：在工作区的图形之间切换选中（复用 stage-keys.js 的 kbNames 顺序）；
 *   (4) 优先级：同一位置有线段和填充区域时，单击选线段（不是填充）；Alt 点击选下面的那个（填充）；
 *   (5) 每次手势之后检查不变量（tests/gestures.js）。
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

  // 同一位置的图形名字（从上到下，按页面上的命中结果；只看这个工作区）
  const stackAt = (ws, x, y) => p.evaluate(({ ws, x, y }) => {
    const wb = document.querySelector('svg.wsbody[data-wsid="' + ws + '"]'), out = [];
    for (const el of document.elementsFromPoint(x, y)) {
      const pk = el.closest && el.closest('[data-pick]');
      if (pk && pk.closest('.wsbody') === wb && !out.includes(pk.dataset.pick)) out.push(pk.dataset.pick);
    }
    return out;
  }, { ws, x, y });
  const sel = () => p.evaluate(() => (UI.S.wsSel || []).slice());
  const hintText = () => p.evaluate(() => [...document.querySelectorAll('svg.wsbody text')].map((t) => t.textContent).filter((t) => t.indexOf('已选中') >= 0).join('|'));
  const screenOf = (ws, pts) => p.evaluate(({ ws, pts }) => {
    const wb = document.querySelector('svg.wsbody[data-wsid="' + ws + '"]');
    const r = wb.getBoundingClientRect(), vw = UI.Stage.rangeOf(ws), sc = UI.Space.canvasOf(r, vw.span);
    return pts.map((q) => UI.Space.workspaceToScreen(q, vw, sc));
  }, { ws, pts });
  let ws = null;

  // ---------- 场景一：两个重叠的图形（和 ui-select.js 一样，器材架拖入同一处） ----------
  console.log('搭场景一：工作区里两个重叠的图形');
  ws = await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); return UI.App.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id; });
  await p.waitForTimeout(200);
  await G.dragTileTo(p, 'ftri', ws);
  await G.dragTileTo(p, 'rect', ws);
  await G.assertInvariants(p, '放入两个重叠的图形');

  const spot = await p.evaluate((ws) => {
    const wb = document.querySelector('svg.wsbody[data-wsid="' + ws + '"]');
    const r = wb.getBoundingClientRect();
    const picks = [...wb.querySelectorAll('[data-pick]')];
    const corners = [];
    for (const el of picks) { const q = el.getBoundingClientRect(); corners.push([q.left, q.top], [q.right, q.top], [q.left, q.bottom], [q.right, q.bottom]); }
    const stackAtXY = (x, y) => {
      const out = [];
      for (const el of document.elementsFromPoint(x, y)) {
        const pk = el.closest && el.closest('[data-pick]');
        if (pk && pk.closest('.wsbody') === wb && !out.includes(pk.dataset.pick)) out.push(pk.dataset.pick);
      }
      return out;
    };
    let best = null;
    for (let y = r.top + 4; y < r.bottom - 4; y += 3) for (let x = r.left + 4; x < r.right - 4; x += 3) {
      const st = stackAtXY(x, y);
      if (st.length < 2) continue;
      const d = Math.min(...corners.map(([cx, cy]) => Math.hypot(cx - x, cy - y)));
      if (!best || d > best.d) best = { x, y, stack: st, d };
    }
    return best && best.d >= 12 ? best : null;
  }, ws);
  ok(!!spot, '找到一个重叠点，下面有 ' + (spot ? spot.stack.length : 0) + ' 个图形');
  if (!spot) { console.log('\n工作区选择测试 2：' + pass + ' 通过，' + fail + ' 失败'); await b.close(); process.exit(1); }

  // (1) 选中提示：单击选中最上面的，画布上出现提示；Esc 之后提示消失
  await G.clickAt(p, spot.x, spot.y, '单击重叠处');
  await G.assertInvariants(p, '单击重叠处');
  let s = await sel();
  let h = await hintText();
  ok(s.length === 1 && s[0] === spot.stack[0], '(1) 单击选中最上面的图形：' + JSON.stringify(s));
  ok(h.indexOf('已选中：') >= 0 && h.indexOf('按 Tab 切换') >= 0 && h.indexOf('Esc 取消') >= 0, '(1) 选中后画布上有选中提示：「' + h + '」');
  await G.press(p, 'Escape');
  await G.assertInvariants(p, 'Esc 取消选中');
  h = await hintText();
  ok((await sel()).length === 0 && h === '', '(1) Esc 之后选中和提示都没有了（提示：「' + h + '」）');

  // (2) Alt 点击：按住 Alt 点一下，选中下面的第二个图形（不用双击）
  await p.waitForTimeout(600);
  await p.keyboard.down('Alt');
  await p.mouse.click(spot.x, spot.y);
  await p.keyboard.up('Alt');
  await p.waitForTimeout(200);
  await G.assertInvariants(p, 'Alt 点击重叠处');
  s = await sel();
  ok(s.length === 1 && s[0] === spot.stack[1], '(2) Alt 点击选中下面的第二个图形：' + JSON.stringify(s) + '（期望 ' + spot.stack[1] + '）');

  // (3) Tab / Shift+Tab：在图形之间切换（顺序和 kbNames 一样）
  const names = await p.evaluate((ws) => UI.StageCtx.kbNames(ws), ws);
  const cur = names.indexOf(spot.stack[1]), n = names.length;
  await G.press(p, 'Tab');
  await G.assertInvariants(p, 'Tab 切换');
  s = await sel();
  ok(s.length === 1 && s[0] === names[(cur + 1) % n], '(3) Tab 切换到下一个图形：' + JSON.stringify(s) + '（期望 ' + names[(cur + 1) % n] + '）');
  await G.press(p, 'Shift+Tab');
  s = await sel();
  ok(s.length === 1 && s[0] === names[cur], '(3) Shift+Tab 切回去：' + JSON.stringify(s) + '（期望 ' + names[cur] + '）');
  h = await hintText();
  ok(h.indexOf('已选中：') >= 0, '(3) Tab 切换后提示还在：「' + h + '」');
  await G.press(p, 'Escape');

  // ---------- 场景二：线段压在多边形的填充上（填充后画，压在线段上面） ----------
  console.log('搭场景二：线段压在多边形的填充上（优先级：线段 > 填充）');
  ws = await p.evaluate(() => {
    const A = UI.App; A.openFree(); A.act({ t: 'clear' });
    const w = A.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id;
    const pt = (name, x, y) => { const n = A.act({ t: 'add', type: 'gpt', x: 0, y: 0, props: { x, y, mark: name } }).id; A.act({ t: 'put', id: n, parent: w, slot: 'items' }); return n; };
    const q = [pt('Q', -6, -6), pt('R', 6, -6), pt('T', 6, 6), pt('U', -6, 6)];
    const p1 = pt('P', -4, 0), p2 = pt('S', 4, 0);
    const seg = A.act({ t: 'add', type: 'gseg', x: 0, y: 0 }).id;
    A.act({ t: 'link', from: p1, fromPort: 'p', to: seg, toPort: 'a' });
    A.act({ t: 'link', from: p2, fromPort: 'p', to: seg, toPort: 'b' });
    A.act({ t: 'put', id: seg, parent: w, slot: 'items' });
    const poly = A.act({ t: 'add', type: 'gpoly', x: 0, y: 0 }).id;
    for (const id of q) A.act({ t: 'link', from: id, fromPort: 'p', to: poly, toPort: 'pts' });
    A.act({ t: 'put', id: poly, parent: w, slot: 'items' });
    UI.Stage.fit(); UI.Stage.render();
    return w;
  });
  await p.waitForTimeout(250);
  ok(!!ws, '场景二放好：线段 PS 压在四边形的填充上');
  const [mid] = await screenOf(ws, [{ x: 0, y: 0 }]);
  const st2 = await stackAt(ws, mid.x, mid.y);
  const segName = await p.evaluate(({ ws, x, y }) => {
    const wb = document.querySelector('svg.wsbody[data-wsid="' + ws + '"]');
    for (const el of document.elementsFromPoint(x, y)) { const pk = el.closest && el.closest('[data-pick]'); if (pk && pk.closest('.wsbody') === wb && pk.tagName.toLowerCase() === 'line') return pk.dataset.pick; }
    return null;
  }, { ws, x: mid.x, y: mid.y });
  const polyName = st2.find((x) => x !== segName) || null;
  ok(!!segName && !!polyName && st2.length >= 2, '(4) 同一位置有线段和多边形：' + JSON.stringify(st2));
  if (!segName || !polyName) { console.log('\n工作区选择测试 2：' + pass + ' 通过，' + fail + ' 失败'); await b.close(); process.exit(1); }

  await p.waitForTimeout(600);
  await G.clickAt(p, mid.x, mid.y, '单击线段和填充重叠处');
  await G.assertInvariants(p, '单击线段和填充重叠处');
  s = await sel();
  ok(s.length === 1 && s[0] === segName, '(4) 单击选线段（优先级高于填充）：' + JSON.stringify(s) + '（期望 ' + segName + '）');
  await G.press(p, 'Escape');

  await p.waitForTimeout(600);
  await p.keyboard.down('Alt');
  await p.mouse.click(mid.x, mid.y);
  await p.keyboard.up('Alt');
  await p.waitForTimeout(200);
  await G.assertInvariants(p, 'Alt 点击线段和填充重叠处');
  s = await sel();
  ok(s.length === 1 && s[0] === polyName, '(4) Alt 点击选下面的第二个（填充）：' + JSON.stringify(s) + '（期望 ' + polyName + '）');

  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n工作区选择测试 2：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
