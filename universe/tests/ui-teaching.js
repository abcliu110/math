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

  let t;
  console.log('代数砖');
  const tl = await add('tilebench', 20, 880, { mode: 0, expr: 'x^2+5x+6', wp: 1, hp: 1 });
  t = await body(p, tl); ok(t.includes('缺 3 块') || t.includes('多 3 块'), '长宽没调对：写出缺几块、多几块');
  await set(tl, 'wp', 3); await set(tl, 'hp', 2); t = await body(p, tl); ok(t.includes('拼成了') && t.includes('(x + 3)(x + 2)'), '长 x + 3、宽 x + 2：拼成了');
  await set(tl, 'mode', 3); await set(tl, 'cut', 2); t = await body(p, tl); ok(t.includes('(a + b)(a − b)'), '平方差：剪拼成长方形');

  console.log('函数机');
  const fm = await add('fmachine', 420, 420, { secret: 1 });
  await set(fm, 'ex', '3'); await set(fm, 'gy', '8'); t = await body(p, fm);
  ok(t.includes('3 → 7'), '喂 3 猜 8：记下 3 → 7（猜错，红色）');
  const ev = await p.evaluate(() => U.Events.log.filter((x) => x.type === 'guess').pop().data);
  ok(ev.right === false && ev.gap === 1, '记了 guess 事件：差 1，不扣分');
  await click(fm, 'hyp', 4); t = await body(p, fm); ok(t.includes('可你试过'), '点“+ 5”：和试过的对不上，指出来');
  const f2 = await add('fmachine', 820, 20, { view: 1, story: 0, k: 1, b: 0, y0: 0, y1: 1 });
  const fmTap = async (id, tag) => { await p.locator('.card[data-id="' + id + '"] [data-fm="' + tag + '"]').first().click(); await p.waitForTimeout(120); };   // 四联动的 − / + 是卡片上的按钮（2026-11-26）
  await fmTap(f2, 'kp'); await fmTap(f2, 'bp'); t = await body(p, f2);
  ok((await prop(p, f2, 'y1')) === 3 && (await prop(p, f2, 'y0')) === 1 && t.includes('y = 2x + 1'), '四联动：点 k、b → 式子、表格跟着变');
  await set(f2, 'y1', 9); ok((await prop(p, f2, 'k')) === 8 && (await prop(p, f2, 'b')) === 1, '改表格 x = 1 的值：k 跟着变');
  ok(errs.length === 0, '没有页面错误：' + errs.slice(0, 2).join('|'));
  await G.assertInvariants(p, '教具');
  await b.close(); console.log(pass + ' 通过，' + fail + ' 失败'); process.exit(fail ? 1 : 0);
})();
