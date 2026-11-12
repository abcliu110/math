/* node tests/ui-games.js —— 取石子、汉诺塔、一笔画的界面：真实鼠标点卡片上的按钮、柱子、点。
 *   取石子：开始一局 → 点“取 n” → 电脑回一步；局面表点格子换标记，显示“表对到第几个”；先猜之前遮住读数；
 *   汉诺塔：点柱子拿起、再点放下；大盘压小盘被拒；搬完显示“用最少的步数搬完”；
 *   一笔画：点点走过去；先猜之前遮住；“数每个点连几条边”显示度数；改图模式点两个点加一条边。 */
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
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } }), errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  G.attachErrorCollector(p); await p.goto(url); await p.waitForTimeout(300); await p.evaluate(() => { UI.S.helpAuto = false; });
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); });
  const click = async (id, k, v) => { await p.locator('.card[data-id="' + id + '"] [data-pick-k="' + k + '"][data-pick-v="' + v + '"]').first().click(); await p.waitForTimeout(120); };
  const add = async (type, x, y, props) => { const id = (await act(p, { t: 'add', type, x, y, props })).id; await p.waitForTimeout(150); return id; };
  const set = async (id, k, v) => { await act(p, { t: 'set', id, k, v }); await p.waitForTimeout(100); };

  console.log('取石子');
  const n = await add('nim', 20, 20, { n: 10, k: 2, level: 2 });
  let t = await body(p, n); ok(t.includes('点“开始一局”') && t.includes('先猜'), '开场：先猜之前表的读数被遮住');
  await click(n, 'go', 1); ok((await prop(p, n, 'pile')) === 10 && (await prop(p, n, 'phase')) === 1, '点“开始一局”：10 颗，轮到我');
  await click(n, 'take', 1); ok((await prop(p, n, 'pile')) < 9 && (await body(p, n)).includes('电脑取'), '取 1 颗：电脑回了一步');
  await click(n, 'tm', 2);
  ok((await prop(p, n, 'tbl')).length === 11, '点局面表的格子：记下标记');
  await set(n, 'gwin', 1); t = await body(p, n); ok(t.includes('表对到第'), '先猜以后：显示表对到第几个');
  for (let i = 0; i < 12 && (await prop(p, n, 'phase')) === 1; i++) { const pile = await prop(p, n, 'pile'); await click(n, 'take', pile % 3 === 0 ? 1 : pile % 3); }
  ok((await prop(p, n, 'phase')) === 2 && (await prop(p, n, 'wins')) === 1, '照 3 的倍数的办法取：赢了一局');

  console.log('汉诺塔');
  const h = await add('hanoi', 420, 20, { n: 3 });
  t = await body(p, h); ok(t.includes('先猜'), '先猜之前：最少步数被遮住');
  await set(h, 'gmin', 7);
  await click(h, 'mv', 1); await click(h, 'mv', 3); ok((await prop(p, h, 'pegs')) === '32;;1' && (await prop(p, h, 'moves')) === 1, '点第 1 根再点第 3 根：小盘搬过去');
  await click(h, 'mv', 1); await click(h, 'mv', 3); t = await body(p, h); ok(t.includes('大盘不能压在小盘上') && (await prop(p, h, 'moves')) === 1, '大盘压小盘：被拒，步数不变');
  const seq = [[1, 2], [3, 2], [1, 3], [2, 1], [2, 3], [1, 3]];
  for (const [a, c] of seq) { await click(h, 'mv', a); await click(h, 'mv', c); }
  t = await body(p, h); ok(t.includes('用最少的步数搬完') && t.includes('走了 7 步'), '7 步搬完：用最少的步数');

  console.log('一笔画');
  const e = await add('euler', 820, 20, { graph: 0 });
  t = await body(p, e); ok(t.includes('先猜'), '先猜之前：遮住能不能');
  await click(e, 'go', 3); await click(e, 'go', 1); t = await body(p, e); ok(t.includes('已走 1 / 7'), '点点走过去：已走 1 / 7 条边');
  await click(e, 'go', 4); t = await body(p, e); ok(t.includes('这条路走过了，或者这两个点之间没有路'), '点不相连的点：说明走不通');
  await click(e, 'showdeg', 1); t = await body(p, e); ok(t.includes('3') && t.includes('2'), '数每个点连几条边：显示度数');
  const br = await add('euler', 820, 270, { graph: 2, mode: 1 });
  await click(br, 'go', 2); await click(br, 'go', 3); ok((await prop(p, br, 'extra')) === '1-2', '改图：点两个点加一条边');
  await set(br, 'gposs', 1); await set(br, 'showdeg', 1); t = await body(p, br); ok(t.includes('奇点 2 个'), '加了一座桥：奇点只剩 2 个');
  ok(errs.length === 0, '没有页面错误：' + errs.slice(0, 2).join('|'));
  await G.assertInvariants(p, '游戏');
  await b.close(); console.log(pass + ' 通过，' + fail + ' 失败'); process.exit(fail ? 1 : 0);
})();
