/* node tests/ui-deduce.js —— 排除表（2.14b 推理，next-steps.md §8.1），真实鼠标。
 * 格子三态：未定 → 不是（灰）→ 是（绿）。能推出的格子（同一行或同一列只剩它一个可能）点一下直接标“是”，
 * 标“是”会把同一行、同一列的别的格子排除（灰）。
 * (a) 题目 workbench 为 deduce：器材架只列排除表；表是 3 人 × 6 格（颜色、宠物两组）；
 * (b) 点一下标“不是”；只剩一格的时候标出“唯一剩下”；标“是”后同行同列的别的格子变灰；
 * (c) 被排除的格子点不了，给出原因，步骤不记；
 * (d) 按线索排完 12 步：每人的颜色和宠物都是“是”；里程碑全部通过；判题的 yes / solved 为真；
 * (e) 撤销到第 4 步：只剩 4 步，后面的格子回到未定；
 * (f) 没有页面错误。
 * 线索：① 小红穿红色衣服 ② 养猫的人穿蓝色衣服 ③ 小刚不穿蓝色衣服 ④ 小红不养狗。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const url = 'file://' + path.join(__dirname, '..', 'index.html');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

// 人：0 小明、1 小红、2 小刚；列：0 红、1 蓝、2 绿（颜色）、3 猫、4 狗、5 兔（宠物）
// 每一步：[人, 列, 点完以后这一格应该是什么]（n 不是、y 是）
const SEQ = [
  [2, 1, 'n'], [1, 1, 'n'], [1, 2, 'n'], [1, 0, 'y'],
  [2, 2, 'y'], [0, 1, 'y'],
  [1, 3, 'n'], [2, 3, 'n'], [0, 3, 'y'],
  [1, 4, 'n'], [1, 5, 'y'], [2, 4, 'y'],
];

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 860 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(300);

  const cell = (i, j) => p.locator('#insp [data-dd-cell="' + i + ',' + j + '"]');
  const st = (i, j) => cell(i, j).getAttribute('data-dd-st').catch(() => '');
  const only = (i, j) => cell(i, j).getAttribute('data-dd-only').catch(() => '');
  const msg = () => p.locator('#insp .dd-msg').innerText().then(norm).catch(() => '');
  const steps = () => p.locator('#insp .wb-step').count();
  const click = async (i, j) => { await cell(i, j).click(); await p.waitForTimeout(80); };
  const query = (c) => p.evaluate((c) => U.Judge.compile(c)(U.Judge.makeW(UI.S.scene, UI.S.D, {})), c);
  const milestones = () => p.evaluate(() => ['excl', 'red', 'cat', 'done'].map((k) => !!(UI.S.run && UI.S.run.ms[k] && UI.S.run.ms[k].done)));

  console.log('排除表：题目 workbench 为 deduce，真实鼠标');
  // (a) 题目进入排除表：器材架只列排除表，表是 3 人 × 6 格
  await p.evaluate(() => UI.App.openProblem('deduce-who', 'practice')); await p.waitForTimeout(200);
  const shelf = await p.locator('#shelfbody .tile').evaluateAll((els) => els.map((el) => el.dataset.type));
  ok(shelf.length === 1 && shelf[0] === 'deduce', '器材架只列排除表（' + shelf.join('、') + '）');
  const bid = await p.evaluate(() => Object.values(UI.S.scene.entities).find((e) => e.type === 'deduce').id);
  await p.dblclick('.card[data-id="' + bid + '"] .hd'); await p.waitForTimeout(150);
  ok(await p.locator('#insp [data-dd-cell]').count() === 18, '表是 3 人 × 6 格（颜色、宠物两组，共 18 格）');
  ok((await st(2, 1)) === 'u' && (await st(0, 0)) === 'u', '开始时所有格子都是未定');

  // (b) 点一下标“不是”（灰）；只剩一格的时候标出“唯一剩下”
  await click(2, 1);
  ok((await st(2, 1)) === 'n', '点小刚的蓝：标“不是”，格子变灰');
  ok(/不是/.test(await msg()), '说明：排除（不是）');
  ok((await milestones())[0] === true, '里程碑「排除了小刚的蓝」通过');
  await click(1, 1); await click(1, 2);   // 小红 不是 蓝、不是 绿
  ok((await only(1, 0)) === '1', '小红的颜色只剩红：这一格标出“唯一剩下”');
  await click(1, 0);
  ok((await st(1, 0)) === 'y', '点小红的红：标“是”（唯一剩下，可以直接标）');
  ok((await st(0, 0)) === 'x' && (await st(2, 0)) === 'x', '同一列的别人（小明、小刚的红）被排除，变灰');
  ok(/唯一剩下/.test(await msg()), '说明：唯一剩下，标是');

  // (c) 被排除的格子点不了：给出原因，步骤不记
  await click(2, 0);
  ok((await st(2, 0)) === 'x' && /已经被排除/.test(await msg()), '点小刚的红（已经被排除）：不能点，说明原因');
  ok((await steps()) === 4, '被拒绝的点击不记步骤（还是 4 步）');

  // (d) 按线索排完：每人的颜色和宠物都标“是”
  for (const [i, j, want] of SEQ.slice(4)) {
    await click(i, j);
    ok((await st(i, j)) === want, '第 ' + (await steps()) + ' 步：格子 (' + i + ',' + j + ') 是 ' + want + '（' + (await st(i, j)) + '）');
  }
  ok((await steps()) === 12, '按线索排完：共 12 步，每一步都记在台面上');
  ok((await p.locator('#insp .dd-cell.dd-y').count()) === 6, '3 人各 2 项：6 格是“是”');
  ok((await cell(1, 0).innerText()).trim() === '是', '“是”的格子上写着“是”');
  ok(await query({ deduce: { yes: { person: '小红', value: '红' } } }), 'yes 查询：小红 是 红 → 真');
  ok(!(await query({ deduce: { yes: { person: '小明', value: '红' } } })), 'yes 查询：小明 是 红 → 假（小明不是红）');
  ok(await query({ deduce: { solved: true } }), 'solved 查询：每人每组都排定 → 真');
  const ms = await milestones();
  ok(ms.every(Boolean), '四个里程碑全部通过（' + ms.join(',') + '）');
  await p.evaluate(() => { try { UI.Panels.closeDialog(); } catch (e) { /* 没有提示框 */ } }); await p.waitForTimeout(80);

  // (e) 撤销到第 4 步：只剩 4 步，后面的格子回到未定
  await p.click('#insp [data-dd-undo="4"]'); await p.waitForTimeout(120);
  ok((await steps()) === 4, '撤销到第 4 步：台面上剩 4 步');
  ok((await st(2, 2)) === 'u' && (await st(0, 1)) === 'u', '撤销后后面的格子回到未定');
  ok((await st(1, 0)) === 'y', '第 4 步留下的“是”还在');

  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n排除表界面测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
