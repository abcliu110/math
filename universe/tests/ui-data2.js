/* node tests/ui-data2.js —— 数据图表台的数字盘（D8 遗留，docs/direction.md 第 7 节 D8），只用鼠标，不用键盘。
 * (a) 题目 data-fit 打开就进入数据图表台；x、y 两个数据格各有一个「数字盘」按钮，盘默认收起；
 * (b) 点 x 的数字盘：盘上有 0–9、小数点、负号、⌫、清空；盘写的是「正在写 x」；
 *     点 1、2、小数点、5：x 变成 12.5（一步都不记，录入要点「加一行」）；再点小数点：被拒绝，说明已经有小数点，x 不变；
 *     点 ⌫ 再点 5：x 还是 12.5；点 y 的数字盘：盘换到 y；点 负号、3：y 是 −3（写成 -3）；点负号再点：y 去掉负号；
 * (c) 点「加一行」：录入一组 (12.5, −3)（一步），表里多一行，两个格子清空，盘还开着；
 * (d) 用盘录完四组数据 (1, 58)、(2, 121)、(3, 179)、(4, 242)，点「画散点图」「拟合直线」：y = 61x − 2.5；
 * (e) 清空键：y 清空；盘收起后不再有盘；步骤写在台面上，器材和连线数不变；页面没有错误。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const url = 'file://' + path.join(__dirname, '..', 'index.html');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 860 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(300);

  const steps = () => p.evaluate(() => (UI.S.scene.workbench && UI.S.scene.workbench.steps ? UI.S.scene.workbench.steps.map((s) => s.rule) : []));
  const counts = () => p.evaluate(() => ({ n: Object.keys(UI.S.scene.entities).length, links: UI.S.scene.links.length }));
  const query = (c) => p.evaluate((c) => U.Judge.compile(c)(U.Judge.makeW(UI.S.scene, UI.S.D, {})), c);
  const text = (sel) => p.locator(sel).first().innerText().then(norm).catch(() => '');
  const count = (sel) => p.locator(sel).count();
  const val = (sel) => p.locator(sel).first().inputValue().catch(() => '<none>');
  const msg = () => text('#insp .db-msg');
  const tap = async (sel) => { await p.locator(sel).first().click(); await p.waitForTimeout(120); };
  const key = (k) => tap('#insp .db-pad [data-db-key="' + k + '"]');
  // 点一串键：字符 '-' 是负号，'.' 是小数点，'<' 是 ⌫，'C' 是清空
  const keys = async (s) => { for (const ch of s) await key(ch); };
  const openPad = (f) => tap('#insp [data-db-pad="' + f + '"]');
  // 用盘录一组：x 盘写 xs，y 盘写 ys，点「加一行」
  const enter = async (xs, ys) => {
    await openPad('x'); await keys(xs);
    await openPad('y'); await keys(ys);
    await tap('#insp [data-db-add]');
  };

  console.log('(a) 题目声明工作台；x、y 各有数字盘按钮，盘默认收起');
  await p.evaluate(() => UI.App.openProblem('data-fit', 'practice')); await p.waitForTimeout(150);
  ok((await count('#insp.open .db')) === 1, '数据图表台自动打开');
  ok((await count('#insp [data-db-pad="x"]')) === 1 && (await count('#insp [data-db-pad="y"]')) === 1, 'x、y 两个数据格各有一个数字盘按钮');
  ok((await count('#insp .db-pad')) === 0, '盘默认收起');

  console.log('(b) 点 x 的盘写 12.5；点 y 的盘写 −3；小数点只能有一个');
  await openPad('x');
  ok((await count('#insp .db-pad')) === 1 && /正在写 x/.test(await text('#insp .db-pad-to')), '点 x 的数字盘：盘打开，写的是 x');
  const digitsOnPad = await p.$$eval('#insp .db-pad [data-db-key]', (els) => els.map((e) => e.dataset.dbKey));
  ok(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '-', '<', 'C'].every((k) => digitsOnPad.includes(k)), '盘上有 0–9、小数点、负号、⌫、清空（' + digitsOnPad.join(' ') + '）');
  await keys('12.5');
  ok((await val('#insp [data-db-x]')) === '12.5', '点 1、2、小数点、5：x 是 12.5（' + (await val('#insp [data-db-x]')) + '）');
  ok((await steps()).length === 0, '盘写字不记步骤（要点「加一行」才录入）');
  await key('.');
  ok((await val('#insp [data-db-x]')) === '12.5' && /小数点/.test(await msg()), '再点小数点：被拒绝，说明已经有小数点（' + (await msg()) + '）');
  await key('<');
  ok((await val('#insp [data-db-x]')) === '12.', '点 ⌫：删掉 5，x 是 12.');
  await key('5');
  ok((await val('#insp [data-db-x]')) === '12.5', '再点 5：x 又是 12.5');
  await openPad('y');
  ok(/正在写 y/.test(await text('#insp .db-pad-to')), '点 y 的数字盘：盘换到 y');
  await keys('-3');
  ok((await val('#insp [data-db-y]')) === '-3', '点负号、3：y 是 −3（写成 -3）（' + (await val('#insp [data-db-y]')) + '）');
  await key('-');
  ok((await val('#insp [data-db-y]')) === '3', '再点负号：去掉负号，y 是 3');
  await key('-');
  ok((await val('#insp [data-db-y]')) === '-3', '又点负号：y 回到 -3');

  console.log('(c) 点「加一行」：录入一组，格子清空，盘还开着');
  await tap('#insp [data-db-add]');
  ok((await steps()).length === 1 && (await count('#insp .db-row')) === 1, '录入 (12.5, −3)：一步，表里一行');
  ok((await val('#insp [data-db-x]')) === '' && (await val('#insp [data-db-y]')) === '', '两个格子清空');
  ok((await count('#insp .db-pad')) === 1, '盘还开着');

  console.log('(d) 用盘录完四组数据，画图、拟合');
  await enter('1', '58');
  await enter('2', '121');
  await enter('3', '179');
  await enter('4', '242');
  ok((await steps()).length === 5 && (await count('#insp .db-row')) === 5, '再录四组：表里 5 行（12.5 那组也在）');
  // 这一组不要：删掉第 1 行（用按钮），剩下四组
  await tap('#insp [data-db-del="0"]');
  ok((await steps()).length === 6 && (await count('#insp .db-row')) === 4, '删掉 12.5 那一行：一步，表里 4 行');
  await tap('#insp [data-db-plot]');
  ok((await count('#insp .db-plot circle')) === 4, '画散点图：图上有 4 个点');
  await tap('#insp [data-db-fit]');
  ok(/y = 61x − 2\.5/.test(await text('#insp .db-eq')), '拟合直线：y = 61x − 2.5（' + (await text('#insp .db-eq')) + '）');
  ok(await query({ data: { minRows: 4, plotted: true, fitted: true } }), 'data 查询（4 组、画了图、拟合了）为真');

  console.log('(e) 清空键；收起盘；台面和连线');
  await openPad('y');
  await key('C');
  ok((await val('#insp [data-db-y]')) === '', '点清空：y 清空');
  await tap('#insp [data-db-pad-close]');
  ok((await count('#insp .db-pad')) === 0, '点收起：盘收起');
  ok((await steps()).length === 8, '一共 8 步（录 5 组、删一行、画图、拟合）');
  ok(await p.evaluate(() => UI.S.scene.workbench.steps.length === 8), '步骤写在台面上（scene.workbench）');
  const c0 = await counts();
  ok(c0.n === 1 && c0.links === 0, '台面上只有一台数据图表台，没有连线');

  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n数据图表台数字盘测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
