/* node tests/ui-lab2.js —— 批次 7 器材的界面：海龟作图、展开图、小方块、尺规作图、两种解法对照（真实鼠标）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const G = require('./gestures');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const body = (p, id) => p.evaluate((id) => { const c = document.querySelector('.card[data-id="' + id + '"]'); return c ? c.querySelector('svg.bdy').textContent : null; }, id);
const act = (p, a) => p.evaluate((a) => UI.App.act(a), a);
const prop = (p, id, k) => p.evaluate(([id, k]) => UI.S.scene.entities[id].props[k], [id, k]);
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 2000, height: 1000 } }), errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  G.attachErrorCollector(p); await p.goto(url); await p.waitForTimeout(300); await p.evaluate(() => { UI.S.helpAuto = false; });
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); });
  const click = async (id, k, v) => { await p.locator('.card[data-id="' + id + '"] [data-pick-k="' + k + '"][data-pick-v="' + v + '"]').first().click(); await p.waitForTimeout(120); };
  const add = async (type, x, y, props) => { const id = (await act(p, { t: 'add', type, x, y, props })).id; await p.waitForTimeout(150); return id; };
  const set = async (id, k, v) => { await act(p, { t: 'set', id, k, v }); await p.waitForTimeout(100); };

  console.log('海龟作图');
  const t = await add('turtle', 10, 10, { tgt: 1 });
  for (const v of [4, 1, 2, 5]) await click(t, 'add', v);
  ok((await prop(p, t, 'prog')) === 'T4;F100;L90;E', '点积木：重复 4 次 [前进 100、左转 90°]');
  let s = await body(p, t); ok(s.includes('先猜'), '先猜之前：遮住是否回到起点');
  await set(t, 'gans', 1); s = await body(p, t); ok(s.includes('回到起点') && s.includes('共转 360°') && s.includes('画对了'), '先猜以后：回到起点，共转 360°，画对了正方形');
  await click(t, 'add', 6); await click(t, 'add', 6); await click(t, 'add', 6); await click(t, 'add', 6); ok((await prop(p, t, 'prog')) === '', '点“撤销”4 次：程序清空');
  await set(t, 'tgt', 2); await click(t, 'a', 75); ok((await prop(p, t, 'a')) === 75, '点“−15”：转角从 90° 变成 75°'); await set(t, 'a', 60); await set(t, 'k', 3); for (const v of [4, 1, 2, 5]) await click(t, 'add', v);
  s = await body(p, t); ok(s.includes('没回到起点'), '转 60° 的三角形（重复 4 次）：没回到起点，缺口看得见');

  console.log('展开图');
  const n = await add('net', 430, 10, {});
  s = await body(p, n); ok(s.includes('第 1 / 35 种') && s.includes('先猜'), '开场：第 1 / 35 种，先猜之前遮住');
  await set(n, 'gans', 1); await click(n, 'load', 2); ok((await prop(p, n, 'idx')) === 1, '点 ▶：看第 2 种');
  await click(n, 'say', 1); ok((await prop(p, n, 'ans')).startsWith('01') || (await prop(p, n, 'ans'))[1] === '1', '点“能”：记下回答');
  const c0 = (await prop(p, n, 'cells')).split(';')[0].split(',').map(Number); await click(n, 'cell', c0[1] * 6 + c0[0] + 1); ok((await prop(p, n, 'cells')).split(';').length === 5, '点一个有格子的位置：拿掉一格（剩 5 格）'); await click(n, 'cell', c0[1] * 6 + c0[0] + 1); ok((await prop(p, n, 'cells')).split(';').length === 6, '再点一下：放回来');

  console.log('小方块');
  const c = await add('cubes', 1100, 10, { tgt: 0 });
  await click(c, 'put', 2); await click(c, 'put', 3);
  ok((await prop(p, c, 'h'))[0] === '2', '点格子左半：加到 2 层');
  s = await body(p, c); ok(s.includes('先猜'), '先猜之前：块数和表面积被遮住');
  await set(c, 'gcnt', 4); s = await body(p, c); ok(s.includes('块数 2') && s.includes('表面积 10'), '先猜以后：块数 2，表面积 10');

  console.log('尺规作图');
  const k = await add('compass', 1550, 10, { task: 0 });
  await click(k, 'tool', 1); await click(k, 'pt', 1); await click(k, 'pt', 2);
  ok((await prop(p, k, 'steps')) === 'c:0,1', '圆规：点 A 再点 B，画出一个圆');
  await click(k, 'pt', 2); await click(k, 'pt', 1); await click(k, 'tool', 3);
  await click(k, 'cand', 1); await click(k, 'cand', 1);
  ok((await prop(p, k, 'steps')).split(';').length === 4, '取交点：取到两个交点');
  await click(k, 'tool', 2); await click(k, 'pt', 3); await click(k, 'pt', 4);
  s = await body(p, k); ok(s.includes('作对了'), '过两个交点画直线：换 3 个新位置，作法都成立');
  const k2 = await add('compass', 430, 225, { task: 0 });
  await click(k2, 'tool', 4); await set(k2, 'steps', ''); await set(k2, 'tool', 4);
  await act(p, { t: 'set', id: k2, k: 'free', v: (3 + 5) * 14 + 0 + 8 }); await act(p, { t: 'set', id: k2, k: 'free', v: (-3 + 5) * 14 + 0 + 8 }); await set(k2, 'tool', 2);
  await click(k2, 'pt', 3); await click(k2, 'pt', 4); s = await body(p, k2);
  ok(s.includes('1 / 4') && s.includes('凭眼睛放的点会散掉'), '凭眼睛放的点：原位置成立，换位置就散了（1 / 4）');

  console.log('两种解法对照');
  const w = await add('twoways', 1100, 260, { sc: 1 });
  await click(w, 'lp', 1); await click(w, 'rp', 4); ok((await prop(p, w, 'pairs')) === '0-2', '先点左边第 1 项，再点右边第 4 项：连了一对（左 0 对右 2）');
  await click(w, 'lp', 2); await click(w, 'rp', 2); ok((await prop(p, w, 'pairs')) === '0-2;1-1', '再连一对');
  s = await body(p, w); ok(s.includes('连了 2 对'), '显示连了 2 对');
  await click(w, 'lp', 1); ok((await prop(p, w, 'pairs')) === '1-1', '点已连的左边项：取消这一对');
  await click(w, 'n', 3); ok((await prop(p, w, 'n')) === 3, '换 n：两边的数一起变');
  ok(errs.length === 0, '没有页面错误：' + errs.slice(0, 2).join('|'));
  await G.assertInvariants(p, '批次7');
  await b.close(); console.log(pass + ' 通过，' + fail + ' 失败'); process.exit(fail ? 1 : 0);
})();
