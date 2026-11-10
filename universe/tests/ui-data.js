/* node tests/ui-data.js —— 数据图表台（D8，docs/direction.md 第 7 节 D8），真实鼠标：录数据 → 画图 → 拟合。
 * (a) 题目 workbench 为 data（示例题 data-fit）：打开就进入数据图表台（属性面板自动打开），器材架只列它声明过的器材；
 * (b) 录入 4 组数据（点输入框、键盘输入、点「加一行」）：每组一步；输入 abc 被拒绝，不记步骤；
 * (c) 没画图就拟合：被拒绝，说明要先画散点图；点「画散点图」：一步，图上有 4 个点；
 * (d) 点「拟合直线」：一步，写出 y = 61x − 2.5（最小二乘，精确有理数）；判题的 data 查询为真；
 * (e) 删掉第 4 行：图和直线都作废（判题 plotted 为假）；撤销到 4 步后，图和直线都没有了（只剩 4 组数据）；
 * (f) 步骤写在台面 scene.workbench 上，器材和连线数不变；页面没有错误。
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
  const msg = () => text('#insp .db-msg');
  const tap = async (sel) => { await p.locator(sel).first().click(); await p.waitForTimeout(120); };
  // 真实键盘输入：点输入框，清空，键入
  const typeIn = async (sel, v) => { const f = p.locator(sel).first(); await f.click(); await f.fill(''); await p.keyboard.type(v); };

  console.log('(a) 题目声明工作台：数据题打开就进入数据图表台');
  await p.evaluate(() => UI.App.openProblem('data-fit', 'practice')); await p.waitForTimeout(150);
  ok(await p.evaluate(() => U.problemById('data-fit').workbench === 'data'), '题目 data-fit 的 workbench 是 data');
  ok((await count('#insp.open .db')) === 1, '数据图表台自动打开（属性面板里是数据图表台）');
  const shelf = await p.$$eval('#shelfbody .tile', (els) => els.map((e) => e.dataset.type));
  ok(shelf.length === 1 && shelf[0] === 'databench', '器材架只列数据图表台声明过的器材：' + shelf.join('、'));

  console.log('(b) 录数据：键盘输入，点「加一行」');
  await typeIn('#insp [data-db-x]', 'abc'); await typeIn('#insp [data-db-y]', '5');
  await tap('#insp [data-db-add]');
  ok((await steps()).length === 0 && (await msg()).length > 0, '输入 abc 被拒绝，不记步骤（' + (await msg()) + '）');
  const rows = [['1', '58'], ['2', '121'], ['3', '179'], ['4', '242']];
  for (const [x, y] of rows) {
    await typeIn('#insp [data-db-x]', x); await typeIn('#insp [data-db-y]', y);
    await tap('#insp [data-db-add]');
  }
  ok((await steps()).length === 4 && (await count('#insp .db-row')) === 4, '录入 4 组数据：4 步，表里 4 行');

  console.log('(c) 没画图就拟合被拒绝；画散点图');
  await tap('#insp [data-db-fit]');
  ok((await steps()).length === 4 && /散点图|先画/.test(await msg()), '没画图就拟合：被拒绝（' + (await msg()) + '）');
  await tap('#insp [data-db-plot]');
  ok((await steps()).length === 5 && (await count('#insp .db-plot circle')) === 4, '画散点图：一步，图上有 4 个点');
  ok(await query({ data: { minRows: 4, plotted: true } }), 'data 查询（至少 4 组、画了图）为真');

  console.log('(d) 拟合直线：y = 61x − 2.5');
  await tap('#insp [data-db-fit]');
  ok((await steps()).length === 6 && /y = 61x − 2\.5/.test(await text('#insp .db-eq')), '拟合直线：一步，写出 y = 61x − 2.5（' + (await text('#insp .db-eq')) + '）');
  ok(await query({ data: { minRows: 4, plotted: true, fitted: true } }), 'data 查询（4 组、画了图、拟合了）为真');
  ok(await query({ steps: { used: 'fit.least-squares', allKept: true } }), 'steps 查询：用过拟合，每步保持 → 真');

  // 题目做完后，完成报告约 700 毫秒后才弹出，盖住属性面板：等它弹出，再关掉
  await p.waitForTimeout(800); await p.evaluate(() => UI.Panels.closeDialog());
  console.log('(e) 删掉第 4 行：图和直线作废；撤销到 4 步');
  await tap('#insp [data-db-del="3"]');
  ok((await steps()).length === 7 && !(await query({ data: { plotted: true } })), '删掉第 4 行：一步，图作废（判题 plotted 为假）');
  await tap('#insp [data-db-undo="4"]');
  ok((await steps()).length === 4 && (await count('#insp .db-plot circle')) === 0 && (await count('#insp .db-eq')) === 0, '撤销到 4 步：只剩 4 组数据，没有图和直线');

  ok(await p.evaluate(() => (UI.S.scene.workbench.steps.length === 4)), '步骤写在台面上（scene.workbench）');
  const c0 = await counts();
  ok(c0.n === 1 && c0.links === 0, '台面上只有一台数据图表台，没有连线（步骤不是器材）');

  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n数据图表台测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
