/* node tests/ui-digit.js —— 数位竖式工作台（D8，docs/direction.md 第 7 节 D8），真实鼠标。
 * (a) 题目 workbench 为 place-value：打开就进入竖式工作台（属性面板自动打开），器材架只列它声明过的器材；
 * (b) 减法示例题 62 − 37（place-sub）：个位 2 不够减 7，没退位时拖 5 进个位被拒绝（不记步骤）；
 *     点「退位」向十位借 1（一步，个位变 12、十位变 5）；拖 5 进个位（一步）；拖 2 进十位（一步）；结果 25，解出来了；
 * (c) 撤销到第 2 步：只剩 2 步，十位空着，不再解出来；再拖 2 进十位，回到 3 步；
 * (d) 加法 47 + 38（自由台面里放一台竖式）：个位 7 + 8 = 15，拖错的 4 被拒绝；拖 5 进个位（一步）；
 *     十位要先进位：没进位就写十位被拒绝；点「进位」（一步）；先点数字 8、再点十位（一步）；结果 85；
 * (e) 撤销到第 2 步，进位还在，结果没有了；步骤写在台面 scene.workbench 上，器材和连线数不变；
 *     判题的 steps 和 digits 查询读得到；页面没有错误。
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
  const msg = () => text('#insp .dg-msg');
  const now = () => text('#insp .dg-now');
  const cen = (box) => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
  // 真实鼠标：从数字块按下，拖到列上松手
  const drag = async (from, to) => {
    const s = cen(await p.locator(from).first().boundingBox()), d = cen(await p.locator(to).first().boundingBox());
    await p.mouse.move(s.x, s.y); await p.mouse.down();
    await p.mouse.move(d.x, d.y, { steps: 12 }); await p.mouse.up(); await p.waitForTimeout(120);
  };
  const tap = async (sel) => { await p.locator(sel).first().click(); await p.waitForTimeout(120); };
  // 题目做完后，完成报告约 700 毫秒后才弹出，盖住属性面板：等它弹出，再关掉
  const settle = async () => { await p.waitForTimeout(800); await p.evaluate(() => UI.Panels.closeDialog()); };

  console.log('(a) 题目声明工作台：减法示例题打开就进入竖式工作台');
  await p.evaluate(() => UI.App.openProblem('place-sub', 'practice')); await p.waitForTimeout(150);
  ok(await p.evaluate(() => U.problemById('place-sub').workbench === 'place-value'), '题目 place-sub 的 workbench 是 place-value');
  ok((await p.locator('#insp.open .dg').count()) === 1, '竖式工作台自动打开（属性面板里是竖式）');
  ok(/62 − 37/.test(await text('#insp .dg-title')), '竖式写的是 62 − 37');
  const shelf = await p.$$eval('#shelfbody .tile', (els) => els.map((e) => e.dataset.type));
  ok(shelf.length === 1 && shelf[0] === 'colbench', '器材架只列竖式工作台声明过的器材：' + shelf.join('、'));

  console.log('(b) 减法 62 − 37：退位、写数字，真实鼠标');
  await drag('#insp [data-dg-digit="5"]', '#insp [data-dg-cell="0"]');
  ok((await steps()).length === 0 && /退位/.test(await msg()), '个位不够减，没退位时拖 5 进去被拒绝，说明要先退位（' + (await msg()) + '）');
  await tap('#insp [data-dg-borrow="0"]');
  ok((await steps()).join() === 'digit.borrow', '点「退位」：一步（' + (await steps()).join() + '）');
  ok((await text('#insp [data-dg-top="0"]')) === '12' && (await text('#insp [data-dg-top="1"]')) === '5', '个位变成 12，十位变成 5');
  await drag('#insp [data-dg-digit="6"]', '#insp [data-dg-cell="0"]');
  ok((await steps()).length === 1, '拖错的 6 不记步骤');
  await drag('#insp [data-dg-digit="5"]', '#insp [data-dg-cell="0"]');
  ok((await steps()).join() === 'digit.borrow,digit.write', '拖 5 进个位：一步（12 − 7 = 5）');
  await drag('#insp [data-dg-digit="2"]', '#insp [data-dg-cell="1"]');
  ok((await steps()).length === 3, '拖 2 进十位：一步（5 − 3 = 2）');
  ok(/结果 25/.test(await now()), '现在写着：结果 25（' + (await now()) + '）');
  ok(await query({ digits: { solved: true, allKept: true } }), 'digits 查询（解出来、每步保持）为真');
  ok(await query({ steps: { used: 'digit.borrow', allKept: true } }), 'steps 查询：用过退位 → 真');

  console.log('(c) 撤销到第 2 步，再写回来');
  await settle();
  await tap('#insp [data-dg-undo="2"]');
  ok((await steps()).length === 2 && (await text('#insp [data-dg-cell="1"]')) === '', '撤销到第 2 步：只剩 2 步，十位空着');
  ok(!(await query({ digits: { solved: true } })), '撤销后不再是解出来的');
  await drag('#insp [data-dg-digit="2"]', '#insp [data-dg-cell="1"]');
  ok((await steps()).length === 3 && (await query({ digits: { solved: true } })), '再拖 2 进十位：回到 3 步，解出来（步骤 ' + (await steps()).length + '，提示：' + (await msg()) + '）');
  await settle();

  console.log('(d) 加法 47 + 38：进位，真实鼠标和点选');
  // 减法题做完了（完成报告已关掉）：到自由台面上做加法
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); }); await p.waitForTimeout(100);
  const add =await p.evaluate(() => UI.App.act({ t: 'add', type: 'colbench', x: 300, y: 200, props: { a: 47, b: 38, op: 0 } }).id);
  await p.dblclick('.card[data-id="' + add + '"] .hd'); await p.waitForTimeout(150);
  ok(/47 \+ 38/.test(await text('#insp .dg-title')), '竖式是 47 + 38');
  const c0 = await counts();
  await drag('#insp [data-dg-digit="4"]', '#insp [data-dg-cell="0"]');
  ok((await steps()).length === 0 && (await msg()).length > 0, '个位 7 + 8 写 4 被拒绝（' + (await msg()) + '）');
  await drag('#insp [data-dg-digit="5"]', '#insp [data-dg-cell="0"]');
  ok((await steps()).join() === 'digit.write', '个位写 5：一步（7 + 8 = 15）');
  await drag('#insp [data-dg-digit="8"]', '#insp [data-dg-cell="1"]');
  ok((await steps()).length === 1 && (await msg()).length > 0, '十位要先进位，没进位就写十位被拒绝（' + (await msg()) + '）');
  await tap('#insp [data-dg-carry="0"]');
  ok((await steps()).join() === 'digit.write,digit.carry', '点「进位」：一步，十位上面出现 1');
  await tap('#insp [data-dg-digit="8"]');
  await tap('#insp [data-dg-cell="1"]');
  ok((await steps()).length === 3, '先点数字 8，再点十位：一步（4 + 3 + 1 = 8）');
  ok(/结果 85/.test(await now()) && (await query({ digits: { solved: true } })), '结果 85，解出来了');
  ok((await counts()).n === c0.n && (await counts()).links === c0.links, '步骤写在台面上，器材和连线数不变');

  console.log('(e) 撤销到第 2 步：进位还在，结果没有了');
  await tap('#insp [data-dg-undo="2"]');
  ok((await steps()).length === 2 && !(await query({ digits: { solved: true } })), '撤销到第 2 步：只剩 2 步，还没解出来');
  ok(await query({ steps: { used: 'digit.carry', allKept: true } }), 'steps 查询：进位还在（撤销的是后面的写数字）');

  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n数位竖式工作台测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
