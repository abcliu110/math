/* node tests/ui-oncard-ex.js —— 真实鼠标：逼近器、最优化沙盘、缩放对比、影子测高、球面三角形、出租车几何全在卡片上操作（2026-11-26）。
 * 每台开一道题，全程不打开属性面板（结尾查 !UI.S.inspOpen），只在卡片上点：先猜的按钮、倍数卡片、− / +、数字、格子，把题做完。
 * 截图：设了环境变量 SHOT_DIR 就存到那里（文件名 ex-器材.png），没设就不存。 */
'use strict';
const path = require('path');
(async () => {
  const H = await require('./bench-harness.js')('approach'), p = H.p, ok = H.ok;
  const closeDlg = () => p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
  const clk = async (loc) => { await closeDlg(); try { await loc.click({ timeout: 2500 }); } catch (e) { await closeDlg(); await loc.click(); } await p.waitForTimeout(140); };
  const re = (s) => new RegExp('^' + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$');
  // 卡片上的按钮：字完全一样的第 n 个（“+”有两个时用 n 区分）
  const press = (label, n) => clk(p.locator('.card svg.bdy g[data-pick-set]').filter({ hasText: re(label) }).nth(n || 0));
  const pickK = (k, v) => clk(p.locator('.card svg.bdy [data-pick-k="' + k + '"][data-pick-v="' + v + '"]').first());
  const byTitle = (t) => clk(p.locator('.card svg.bdy [data-pick-set]').filter({ has: p.locator('title', { hasText: re(t) }) }).first());
  const ent = (type) => p.evaluate((t) => Object.values(UI.S.scene.entities).find((x) => x.type === t), type);
  const out = (type, port) => p.evaluate(([t, k]) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === t), v = UI.S.D[e.id].out[k]; return v ? U.Q.show(v.data) : null; }, [type, port]);
  const text = () => p.evaluate(() => Array.from(document.querySelectorAll('.card svg.bdy text')).map((t) => t.textContent).join('|'));
  const noChip = async (name) => ok(await p.locator('.card [data-card-insp]').count() === 0, name + '：标题栏没有“✎ 填写 / 先猜”');
  const shot = async (name) => { if (process.env.SHOT_DIR) { await p.waitForTimeout(800); await closeDlg(); await p.waitForTimeout(150); } if (process.env.SHOT_DIR) await p.locator('.card').first().screenshot({ path: path.join(process.env.SHOT_DIR, 'ex-' + name + '.png') }); };

  console.log('逼近器：0.999… 和 1');
  await H.open('ap-999'); await noChip('逼近器');
  ok((await text()).includes('先猜'), '开场：先猜（点按钮）');
  await press('永远差一点'); ok(await out('approach', 'guessed') === '1', '点“永远差一点”：猜了，猜对');
  for (let i = 1; i <= 6; i++) await pickK('step', i);
  ok((await ent('approach')).props.step === 6 && await H.done('steps'), '点 6 次“下一步”：走到第 6 步');
  await press('+'); ok((await text()).includes('还不够小'), '+ 到 1 步：差距还不够小');
  for (let i = 0; i < 6; i++) await press('+');
  ok((await ent('approach')).props.sfg === 7 && (await text()).includes('就是它') && await H.done('six'), '+ 到 7 步：就是它，做完“要 7 步”');
  await shot('approach');

  console.log('最优化沙盘：将军饮马');
  await H.open('op-horse'); await noChip('最优化沙盘');
  ok((await text()).includes('先猜：点一个数'), '开场：那排数字是“我猜”');
  await byTitle('我猜 3 最好'); ok((await ent('optimize')).props.gx === 3 && (await text()).includes('▲我猜'), '点 3：插上“▲我猜”');
  for (const x of [0, 2, 4, 6, 3]) await pickK('x', x);
  ok(await H.done('five') && await H.done('hit') && await out('optimize', 'guessed') === '1', '试 0、2、4、6、3：试到了最短的，猜对了');
  await shot('optimize');

  console.log('缩放对比：边长放大 2 倍');
  await H.open('sc-area'); await noChip('缩放对比');
  ok((await text()).includes('先点一个放大倍数'), '开场 k = 1：先点倍数');
  await press('2'); ok((await ent('scale')).props.k === '2', '点倍数卡片 2：k = 2');
  await press('4'); ok(await out('scale', 'guessed') === '1' && (await text()).includes('猜对了') && await H.done('two'), '候选数里点 4：猜对了，面积是 4 倍');
  await press('3/2'); ok(await H.done('half'), '点 3/2：面积 9/4 倍');
  await shot('scale');

  console.log('影子测高');
  await H.open('sh-tree'); await noChip('影子测高');
  await pickK('sun', 1); await pickK('sun', 2); ok(await H.done('suns'), '点“中高”“中低”：换了太阳高度');
  await press('+', 0); ok((await ent('shadow')).props.pole === 3, '杆高 +：3 米'); await press('−', 0); ok((await ent('shadow')).props.pole === 2, '杆高 −：回到 2 米');
  await press('+', 1); await press('我猜树高 6 米'); ok((await ent('shadow')).props.hgt === '6' && (await text()).includes('树高是几'), '虚线调到 6，点“我猜”：先给比例，不直接给答案');
  await press('+', 1); await press('+', 1); await press('算好了：树高 8 米');
  ok(await out('shadow', 'ok') === '1' && await H.done('ok') && (await text()).includes('算对了'), '虚线调到 8，点“算好了”：算对了');
  await shot('shadow');

  console.log('球面三角形：三个直角');
  await H.open('st-three-right'); await noChip('球面三角形');
  await press('比它大'); for (const i of [1, 2, 3]) await pickK('pk', i);
  ok(await H.done('three') && (await text()).includes('✓ 猜对了'), '点“比它大”，选北极和赤道两点：三个直角，猜对了');
  await shot('spheretri');

  console.log('出租车几何：“圆”');
  await H.open('tx-circle'); await noChip('出租车几何');
  await press('+'); ok((await ent('taxi')).props.r === 4, 'r +：4'); await press('−'); ok((await ent('taxi')).props.r === 3, 'r −：回到 3');
  await press('斜放的正方形'); ok((await ent('taxi')).props.gans === 2, '点“斜放的正方形”：猜了');
  const cells = await p.evaluate(() => U.WhatIf.tTruth({ mode: 0, r: 3, pair: 0 }));
  for (const i of cells) await pickK('cell', i + 1);
  ok(await H.done('all') && /斜放的正方形\|✓/.test(await text()), '标齐 12 个路口：全对，猜的形状打 ✓');
  await shot('taxi');

  await H.end('全在卡片上操作（ex 组）');
})();
