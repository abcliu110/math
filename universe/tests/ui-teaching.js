/* node tests/ui-teaching.js —— 教具类器材的界面（批次 3）：线段图、分数面积模型、代数砖、函数机。真实鼠标点卡片上的按钮。
 *   线段图：点 + / − 改份数和额外，按图算出的结果写在卡片上，“先猜”之前不显示；
 *   分数面积：乘法显示重叠格数，先猜之前遮住结果；加法没通分时提示格子不一样大；
 *   代数砖：砖数不对时写差几块，对了写“拼成了”；
 *   函数机：喂数先猜后看、点规则、四联动里点 k、b 同步表格。 */
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

  console.log('线段图');
  const bm = await add('barmodel', 20, 20, { story: '小明有 8 个，小红比他多 5 个', gk: 2, gv: '8', tq: 1, truth: '1,1,0,5', gans: '' });
  let t = await body(p, bm);
  ok(t.includes('先猜'), '没猜之前：不显示按图算出的结果');
  await set(bm, 'gans', '13'); t = await body(p, bm); ok(t.includes('按你的图：A = 8，B = 8'), '猜了以后：两条一样长 → B = 8');
  await click(bm, 'eb', 1); await click(bm, 'eb', 2); await click(bm, 'eb', 3); await click(bm, 'eb', 4); await click(bm, 'eb', 5);
  t = await body(p, bm); ok((await prop(p, bm, 'eb')) === 5 && t.includes('B = 13'), '点 + 五次：B 额外 +5，B = 13');
  await click(bm, 'sb', 2); await click(bm, 'sb', 3); await click(bm, 'sb', 4); await click(bm, 'sb', 5); t = await body(p, bm); ok(t.includes('B = 45'), '把 B 画成 5 份：按你的图 B = 45（和题面对不上，自己发现）');

  console.log('分数面积');
  const fa = await add('fracarea', 420, 20, { a: '2/3', b: '4/5', op: 1, view: 0 });
  t = await body(p, fa); ok(!t.includes('重叠 8 格') && !t.includes('重叠 ') || t.includes('蓝：竖着涂'), '先猜之前：结果遮住'); await set(fa, 'gans', '1/2'); await set(fa, 'st', 5); t = await body(p, fa); ok(t.includes('2×4 = 8 格') && t.includes('15 格'), '乘：重叠 8 格，一共 15 格');
  await set(fa, 'op', 2); await set(fa, 'st', 0); t = await body(p, fa); ok(t.includes('格子大小不一样'), '加：没通分，提示格子大小不一样');
  await set(fa, 'a', '1/2'); await set(fa, 'b', '1/3'); await set(fa, 'st', 3); t = await body(p, fa); ok(t.includes('每格 1/6') && t.includes('5 格'), '再切 6 份：小格一样大，数出 5 格');
  await set(fa, 'op', 0); await set(fa, 'view', 1); await set(fa, 'a', '5/4'); t = await body(p, fa); ok(t.includes('第一个 5/4'), '数轴：5/4 超过 1');

  console.log('代数砖');
  const tl = await add('tiles', 20, 420, { expr: 'x^2+5x+6', wa: 1, wp: 3, ha: 1, hp: 2 });
  t = await body(p, tl); ok(t.includes('先猜'), '没猜之前：遮住拼没拼成');
  await set(tl, 'gans', 1); t = await body(p, tl); ok(t.includes('拼不满') && t.includes('少'), '砖没取够：写出差几块');
  await set(tl, 'n2', 1); await set(tl, 'n1x', 5); await set(tl, 'n1', 6); t = await body(p, tl); ok(t.includes('拼成了长方形'), '取对砖：拼成了');
  await set(tl, 'x', 7); t = await body(p, tl); ok(t.includes('拼成了长方形'), '把 x 改成 7：拼法不变');

  console.log('函数机');
  const fm = await add('fmachine', 420, 420, { secret: 1 });
  await set(fm, 'ex', '3'); await set(fm, 'gy', '8'); t = await body(p, fm);
  ok(t.includes('3 → 7'), '喂 3 猜 8：记下 3 → 7（猜错，红色）');
  const ev = await p.evaluate(() => U.Events.log.filter((x) => x.type === 'guess').pop().data);
  ok(ev.right === false && ev.gap === 1, '记了 guess 事件：差 1，不扣分');
  await click(fm, 'hyp', 4); t = await body(p, fm); ok(t.includes('可你试过'), '点“+ 5”：和试过的对不上，指出来');
  const f2 = await add('fmachine', 820, 20, { view: 1, story: 0, k: 1, b: 0, y0: 0, y1: 1 });
  await click(f2, 'k', 2); await click(f2, 'b', 1); t = await body(p, f2);
  ok((await prop(p, f2, 'y1')) === 3 && (await prop(p, f2, 'y0')) === 1 && t.includes('y = 2x + 1'), '四联动：点 k、b → 式子、表格跟着变');
  await set(f2, 'y1', 9); ok((await prop(p, f2, 'k')) === 8 && (await prop(p, f2, 'b')) === 1, '改表格 x = 1 的值：k 跟着变');
  ok(errs.length === 0, '没有页面错误：' + errs.slice(0, 2).join('|'));
  await G.assertInvariants(p, '教具');
  await b.close(); console.log(pass + ' 通过，' + fail + ' 失败'); process.exit(fail ? 1 : 0);
})();
