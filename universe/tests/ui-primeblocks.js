/* node tests/ui-primeblocks.js —— 质因数积木（5.7）和找错台（4.2）的界面：真实页面，操作经意图层。
 *   质因数积木：分解显示积木（颜色块 + 质数）；公因数模式两摞并排并写出最大公因数、最小公倍数；搭因数模式先猜才显示因数；
 *   找错台：先判断才显示读数；点对行标红“错在这里”，点错行标绿“这步没问题”；选对理由后显示理由；没有页面错误。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const G = require('./gestures');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const body = (p, id) => p.evaluate((id) => { const c = document.querySelector('.card[data-id="' + id + '"]'); return c ? c.querySelector('svg.bdy').textContent : null; }, id);
const bdg = (p, id) => p.evaluate((id) => { const c = document.querySelector('.card[data-id="' + id + '"] .bd'); return c ? c.textContent : null; }, id);
const act = (p, a) => p.evaluate((a) => UI.App.act(a), a);
const set = (p, id, k, v) => act(p, { t: 'set', id, k, v });
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } }), errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  G.attachErrorCollector(p); await p.goto(url); await p.waitForTimeout(300); await p.evaluate(() => { UI.S.helpAuto = false; });
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); });

  console.log('质因数积木');
  const pb = (await act(p, { t: 'add', type: 'primeblocks', x: 40, y: 40, props: { a: 60 } })).id; await p.waitForTimeout(150);
  let t = await body(p, pb);
  ok(await p.evaluate((id) => document.querySelectorAll('.card[data-id="' + id + '"] svg.bdy rect').length, pb) === 4, '60 = 2×2×3×5：4 块积木');
  ok((await bdg(p, pb)) === '4 块', '标题读数 4 块');
  await set(p, pb, 'b', 84); await set(p, pb, 'mode', 1); await p.waitForTimeout(150);
  t = await body(p, pb);
  ok(t.includes('最大公因数 12') && t.includes('最小公倍数 420'), '60 和 84：最大公因数 12，最小公倍数 420');
  await set(p, pb, 'mode', 3); await p.waitForTimeout(100); t = await body(p, pb);
  ok(t.includes('5/7'), '约分 60/84 = 5/7');
  await set(p, pb, 'b', 0); await set(p, pb, 'mode', 2); await p.waitForTimeout(150);
  t = await body(p, pb);
  ok(t.includes('？') && !t.includes('全部因数'), '搭因数：没猜之前遮住');
  ok((await bdg(p, pb)) === '？', '标题读数“？”');
  await set(p, pb, 'guess', '8'); await p.waitForTimeout(150); t = await body(p, pb);
  ok(t.includes('12 个') && t.includes('30'), '猜了以后揭开：60 有 12 个因数');
  const ev = await p.evaluate(() => U.Events.log.filter((x) => x.type === 'guess').pop().data);
  ok(ev.right === false && ev.gap === 4, '记了 guess 事件：猜 8，差 4，不扣分');
  await G.assertInvariants(p, '质因数积木');

  console.log('找错台（真实鼠标点卡片上的行、按钮、理由）');
  const fb = (await act(p, { t: 'add', type: 'findbug', x: 520, y: 40, props: { caseId: 3 } })).id; await p.waitForTimeout(150);
  const click = async (k, v) => { await p.locator('.card[data-id="' + fb + '"] [data-pick-k="' + k + '"][data-pick-v="' + v + '"]').first().click(); await p.waitForTimeout(120); };
  const prop = (k) => p.evaluate(([id, k]) => UI.S.scene.entities[id].props[k], [fb, k]);
  ok((await bdg(p, fb)) === '？' && (await body(p, fb)).includes('先判断'), '没判断：读数遮住，提示先判断');
  await click('claim', 2); ok((await prop('claim')) === 2, '点“有错”按钮：判断设成有错');
  await click('pick', 3); ok((await prop('pick')) === 3 && (await body(p, fb)).includes('这步没问题'), '点第 3 行（没错）：标“这步没问题”，不扣分');
  await click('pick', 2); t = await body(p, fb);
  ok((await prop('pick')) === 2 && t.includes('错在这里') && t.includes('移项要变号'), '点第 2 行（错的）：标“错在这里”，列出四个理由');
  ok((await bdg(p, fb)) === '找到', '标题读数“找到”');
  await click('reason', 2); ok(await p.evaluate((id) => U.Q.num(UI.S.D[id].out.reasonOk.data) === 0, fb), '点错理由：不对（器材会代数给你看）');
  await click('reason', 1); ok(await p.evaluate((id) => U.Q.num(UI.S.D[id].out.reasonOk.data) === 1, fb), '点对理由：对');
  await click('reason', 0); ok((await prop('reason')) === 0, '再点一次已选的理由：取消');
  await click('reason', 1); await set(p, fb, 'fix', '3x=15'); await p.waitForTimeout(150);
  ok(await p.evaluate((id) => U.Q.num(UI.S.D[id].out.fixed.data) === 1, fb) && (await body(p, fb)).includes('改对了'), '改对了（改的那一行在属性面板里写）');
  const undo = await p.evaluate(() => { UI.App.undo(); return true; }); await p.waitForTimeout(100);
  await G.assertInvariants(p, '找错台');
  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  await b.close(); console.log('\n' + pass + ' 通过，' + fail + ' 失败'); process.exit(fail ? 1 : 0);
})();
