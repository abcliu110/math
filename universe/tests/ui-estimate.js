/* node tests/ui-estimate.js —— 先猜后看 + 估算器（docs/new-instruments.md 3.2、6.11）。真实页面：
 *   (a) 没填估计：估算器卡片显示“？”，卡片上没有实际值（899），标题右边的读数是“？”；台面里运算器的值照常是 899（只遮界面）；
 *   (b) 填了估计（改“我估”）：卡片揭开，显示实际值、差多少、差百分之几；记一条 guess 事件（猜错不扣分，只记差多少）；
 *   (c) 改成范围估计：最少、最多都填了才揭开；范围太宽时说明；
 *   (d) 估得离谱（差十倍以上）时，信号条问“你是怎么估的”；
 *   (e) 没有页面错误和控制台错误；每次操作后台面不变量成立。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const G = require('./gestures');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const cardText = (p, id) => p.evaluate((id) => { const c = document.querySelector('.card[data-id="' + id + '"]'); return c ? c.querySelector('svg.bdy').textContent : null; }, id);
const badge = (p, id) => p.evaluate((id) => { const c = document.querySelector('.card[data-id="' + id + '"] .bd'); return c ? c.textContent : null; }, id);
const act = (p, a) => p.evaluate((a) => UI.App.act(a), a);

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  G.attachErrorCollector(p);
  await p.goto(url); await p.waitForTimeout(300); await p.evaluate(() => { UI.S.helpAuto = false; });
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); });
  const a = (await act(p, { t: 'add', type: 'num', x: 40, y: 40, props: { n: 29 } })).id;
  const c = (await act(p, { t: 'add', type: 'num', x: 40, y: 200, props: { n: 31 } })).id;
  const o = (await act(p, { t: 'add', type: 'op', x: 260, y: 100, props: { op: 2 } })).id;
  const e = (await act(p, { t: 'add', type: 'estimate', x: 520, y: 100 })).id;
  await act(p, { t: 'link', from: a, to: o, toPort: 'a' }); await act(p, { t: 'link', from: c, to: o, toPort: 'b' });
  await act(p, { t: 'link', from: o, to: e, toPort: 'actual' });
  await p.waitForTimeout(200);
  await G.assertInvariants(p, '搭好');

  console.log('(a) 没填估计：遮住实际值');
  let t = await cardText(p, e);
  ok(t.includes('？'), '卡片显示“？”');
  ok(!t.includes('899'), '卡片上没有实际值 899');
  ok((await badge(p, e)) === '？', '标题右边的读数是“？”');
  ok(await p.evaluate((o) => { const d = UI.S.D[o]; return d.out.r && U.Q.num(d.out.r.data) === 899; }, o), '运算器的值照常是 899（只遮界面，台面里值照常流动）');
  const before = await p.evaluate(() => U.Events.log.filter((x) => x.type === 'guess').length);

  console.log('(b) 填了估计：揭开，记 guess 事件');
  await act(p, { t: 'set', id: e, k: 'guess', v: '900' });
  await p.waitForTimeout(200);
  t = await cardText(p, e);
  ok(t.includes('899') && t.includes('900'), '揭开后显示实际值 899 和你的估计 900');
  ok(/差 1/.test(t), '显示差 1');
  ok((await badge(p, e)) === '差 1', '标题右边的读数是“差 1”');
  const evs = await p.evaluate(() => U.Events.log.filter((x) => x.type === 'guess'));
  ok(evs.length === before + 1 && evs[evs.length - 1].data.right === true && evs[evs.length - 1].data.gap === 1, '记了一条 guess 事件：估准了，差 1');
  await G.assertInvariants(p, '填估计');

  console.log('(c) 范围估计');
  await act(p, { t: 'set', id: e, k: 'mode', v: 1 });
  await p.waitForTimeout(150);
  ok((await cardText(p, e)).includes('？'), '换成范围估计，范围还没填：重新遮住');
  await act(p, { t: 'set', id: e, k: 'lo', v: '800' });
  ok((await cardText(p, e)).includes('？'), '只填了最少：还是遮住');
  await act(p, { t: 'set', id: e, k: 'hi', v: '1000' }); await p.waitForTimeout(150);
  t = await cardText(p, e);
  ok(t.includes('899') && t.includes('估得准'), '最少最多都填了：揭开，899 在范围里');
  await act(p, { t: 'set', id: e, k: 'hi', v: '5000' }); await p.waitForTimeout(150);
  ok((await cardText(p, e)).includes('范围太宽'), '范围 800 到 5000：估中了，但范围太宽');
  const wide = await p.evaluate((e) => UI.S.D[e].sig.map((x) => x.tx).join('|'), e);
  ok(/范围太宽/.test(wide), '信号条也说“范围太宽”');

  console.log('(d) 估得离谱');
  await act(p, { t: 'set', id: e, k: 'mode', v: 0 }); await act(p, { t: 'set', id: e, k: 'guess', v: '50' }); await p.waitForTimeout(150);
  const off = await p.evaluate((e) => UI.S.D[e].sig.map((x) => x.tx).join('|'), e);
  ok(/怎么估的/.test(off), '差十倍以上，信号条问“你是怎么估的”');
  const last = await p.evaluate(() => U.Events.log.filter((x) => x.type === 'guess').pop().data);
  ok(last.right === false, '猜错只记 right=false 和差多少，不扣分');

  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  await b.close();
  console.log('\n' + pass + ' 通过，' + fail + ' 失败');
  process.exit(fail ? 1 : 0);
})();
