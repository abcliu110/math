/* node tests/ui-select.js —— 工作区选择（V3，docs/ui-geometry-feedback.md 1.5 和第 3 节 V3）。
 * 用真实鼠标：工作区里放两个重叠的图形，在重叠处：
 *   (a) 单击选中最上面的（和以前一样）；
 *   (b) 同一位置双击：第一次选中最上面的，之后每双击一次依次换到下一个（栈里的顺序），到最后一个再回到最上面的；
 *   (c) 每次手势之后检查不变量（tests/gestures.js）。
 * 不写死器材名：重叠处的图形列表从页面上的命中结果读出来。需要 playwright（NODE_PATH 指向它的 node_modules）。 */
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

  console.log('搭场景：工作区里放两个重叠的图形（器材架拖入，落在同一处）');
  const ws = await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); return UI.App.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id; });
  await p.waitForTimeout(200);
  await G.dragTileTo(p, 'ftri', ws);
  await G.dragTileTo(p, 'rect', ws);
  await G.assertInvariants(p, '放入两个重叠的图形');

  // 找一个鼠标下面至少有两个图形的点（从页面命中结果读出，按栈顶在前的顺序）。
  // 选中的图形会在它的外框角上画缩放把手（10 像素的方块，把手优先于图形），所以这个点要离所有图形的外框角尽量远。
  const spot = await p.evaluate((ws) => {
    const wb = document.querySelector('svg.wsbody[data-wsid="' + ws + '"]');
    const r = wb.getBoundingClientRect();
    const picks = [...wb.querySelectorAll('[data-pick]')];
    const corners = [];
    for (const el of picks) { const q = el.getBoundingClientRect(); corners.push([q.left, q.top], [q.right, q.top], [q.left, q.bottom], [q.right, q.bottom]); }
    const stackAt = (x, y) => {
      const out = [];
      for (const el of document.elementsFromPoint(x, y)) {
        const pk = el.closest && el.closest('[data-pick]');
        if (pk && pk.closest('.wsbody') === wb && !out.includes(pk.dataset.pick)) out.push(pk.dataset.pick);
      }
      return out;
    };
    let best = null;
    for (let y = r.top + 4; y < r.bottom - 4; y += 3) for (let x = r.left + 4; x < r.right - 4; x += 3) {
      const st = stackAt(x, y);
      if (st.length < 2) continue;
      const d = Math.min(...corners.map(([cx, cy]) => Math.hypot(cx - x, cy - y)));
      if (!best || d > best.d) best = { x, y, stack: st, d };
    }
    return best && best.d >= 12 ? best : null;
  }, ws);
  ok(!!spot, '找到一个重叠点，下面有 ' + (spot ? spot.stack.length : 0) + ' 个图形（' + (spot ? spot.stack.join('、') : '无') + '）');
  if (!spot) { console.log('\n工作区选择测试：' + pass + ' 通过，' + fail + ' 失败'); await b.close(); process.exit(1); }

  const sel = () => p.evaluate(() => (UI.S.wsSel || []).slice());
  const n = spot.stack.length;

  // (a) 单击：选中最上面的
  await G.clickAt(p, spot.x, spot.y, '单击重叠处');
  await G.assertInvariants(p, '单击重叠处');
  let s = await sel();
  ok(s.length === 1 && s[0] === spot.stack[0], '(a) 单击选中最上面的图形：' + JSON.stringify(s) + '（期望 ' + spot.stack[0] + '）');

  await p.waitForTimeout(600);   // 单击和双击之间隔开：两下点击在 500 毫秒内算一次双击
  // (b) 同一位置连续双击 n+1 次：依次选中栈里的每一个，然后回到最上面的
  for (let k = 0; k <= n; k++) {
    await G.dblClickAt(p, spot.x, spot.y, '双击重叠处第 ' + (k + 1) + ' 次');
    await G.assertInvariants(p, '双击重叠处第 ' + (k + 1) + ' 次');
    const want = spot.stack[k % n];
    s = await sel();
    const label = k === n ? '第 ' + (k + 1) + ' 次双击，回到最上面的' : '第 ' + (k + 1) + ' 次双击';
    ok(s.length === 1 && s[0] === want, '(b) ' + label + '：选中 ' + JSON.stringify(s) + '（期望 ' + want + '）');
  }

  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n工作区选择测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
