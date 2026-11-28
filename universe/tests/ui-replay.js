/* node tests/ui-replay.js —— 试验台增强 4：过程看得见，也要留得下来（真实鼠标）。
 *  1. 看台面说话：鸡兔同笼（换一换）点成 3 个兔，点“💡 来个提示”：先说台面上的话（腿比要的少 4 条……2 个兔被当成了鸡？），
 *     步骤里跟着台面变；再点才是原来的“提示 1/3”；看台面的提示不算“看了提示”。
 *  2. 操作台上的来历：步骤栏“📍 台面上现在”列出读数，点“怎么来的？”：说清怎么算的、一步一步怎么变过来的。
 *  3. 回放（做到一半）：点“🎬 看看我是怎么做的”：回放条出来、时钟条藏起来，台面回到开始；下一步、上一步、拖进度，每步一句人话；
 *     回放中点台面不改东西、不进撤销、不记事件、不判分；Esc 退出回到原样（同一个台面对象）。
 *  4. 回放（做完了）：做完弹出的“做完了”对话框里点“🎬 看看我是怎么做的”：从头自动放；放的时候不再弹“做完了”、不记事件；退出回到原样。
 *  5. 联动组（天平和式子一起做）：在天平上两边各拿走一个砝码，回放说“在「天平1」上两边同时减 1，「式子1」跟着做了同一步”，回放中不闪。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('swapbench');
  const p = H.p, SP = process.env.SHOT_DIR;
  const shot = async (name, loc) => { if (SP) await (loc || p).screenshot({ path: SP + '/e4-' + name + '.png' }); };
  const k = () => p.evaluate(() => Object.values(UI.S.scene.entities)[0].props.k);
  const banner = () => p.evaluate(() => document.querySelector('#banner').textContent);
  const evN = () => p.evaluate(() => U.Events.log.length);
  const replay = () => p.evaluate(() => { const b = document.querySelector('#replaybar'); return { on: !!UI.S.replay, bar: !!b && getComputedStyle(b).display !== 'none', clock: getComputedStyle(document.querySelector('#clockbar')).display !== 'none', say: b ? b.querySelector('#rp-say').textContent : '', n: b ? b.querySelector('#rp-n').textContent : '', i: UI.S.replay ? UI.S.replay.i : -1 }; });

  console.log('1. 看台面说话');
  await H.open('sw-8-26');
  for (let i = 0; i < 3; i++) await H.byTitle('点一下：换成兔');
  H.ok(await k() === 3 && await H.out('total') === '22', '点了 3 次“换成兔”：3 个兔，22 条腿');
  await p.locator('#hintbtn').click(); await p.waitForTimeout(150);
  H.ok(/👀 看台面：现在腿比要的少 4 条。每把一个鸡换成兔，腿多 2 条：是不是有 2 个兔被当成了鸡？/.test(await banner()), '第一次点提示：先说台面上的话');
  H.ok(/看台面：现在腿比要的少 4 条/.test(await p.locator('#leftbody .step.cur .hint.now').textContent()), '步骤里这一步下面写着看台面的话');
  await shot('hint-now', p.locator('#left'));
  await H.byTitle('点一下：换成兔');
  H.ok(/少 2 条.*是不是有 1 个兔被当成了鸡/.test(await p.locator('#leftbody .step.cur .hint.now').textContent()), '再换一个：步骤里的话跟着台面变（少 2 条、1 个兔）');
  await p.locator('#hintbtn').click(); await p.waitForTimeout(150);
  H.ok(/少 2 条/.test(await banner()), '台面变了再点提示：先说新的话');
  await p.locator('#hintbtn').click(); await p.waitForTimeout(150);
  H.ok(/^提示 1\/3：/.test(await banner()), '话说过了再点：原来的三层提示 1/3');
  H.ok(await p.evaluate(() => { const r = UI.S.run, m = UI.S.problem.milestones[0]; return r.hintLevel[m.id] === 1 && r.nowSaid[m.id]; }), '看台面的提示不加提示层数（只有点出“提示 1/3”那次算一层）');

  console.log('2. 操作台上的来历');
  const rows = await p.locator('#leftbody .nowbox .nowrow').allTextContents();
  H.ok(rows.length === 3 && /乙（兔）有几个\s*4/.test(rows[0]) && /现在的总数\s*24/.test(rows[2]), '步骤栏“台面上现在”：乙 4、甲 4、总数 24');
  await p.locator('#leftbody .nowbox [data-bwhy$="|total"]').click(); await p.waitForTimeout(150);
  const dl = await p.locator('#dlg .box').textContent();
  H.ok(/这个数是怎么来的/.test(dl) && /4 个兔，每个 4 条腿：4 × 4 = 16/.test(dl) && /合起来：16 \+ 8 = 24 条腿/.test(dl), '点“怎么来的？”：总数怎么算的');
  H.ok(/开场是 16/.test(dl) && /第 4 步变成 24/.test(dl), '一步一步变过来的：开场 16 …… 第 4 步变成 24');
  await shot('why', p.locator('#dlg .box'));
  await p.locator('#dlg-close').click(); await p.waitForTimeout(100);

  console.log('3. 回放（做到一半）');
  const undo0 = await p.evaluate(() => UI.S.undo.length), ev0 = await evN(), sc0 = await p.evaluate(() => { window.__real = UI.S.scene; return U.JSON.stringify(UI.S.scene); });
  await p.locator('#replaybtn').click(); await p.waitForTimeout(150);
  await p.locator('#rp-play').click();   // 先停下（进来会自动放）
  let r = await replay();
  H.ok(r.on && r.bar && !r.clock, '回放条出来了，时钟条藏起来');
  H.ok(r.i === 0 && await k() === 0 && /开始的样子/.test(r.say), '从开始的样子放：台面上 0 个兔');
  await p.locator('#rp-next').click(); await p.waitForTimeout(120); r = await replay();
  H.ok(r.i === 1 && await k() === 1 && r.say === '第 1 步：乙（兔）有几个 0 → 1，甲（鸡）有几个 8 → 7，现在的总数 16 → 18' && r.n === '第 1 / 4 步', '下一步：第 1 步的一句人话');
  await shot('replay-mid');
  // 拖进度条到最后
  const bx = await p.locator('#rp-pos').boundingBox();
  await p.mouse.click(bx.x + bx.width - 3, bx.y + bx.height / 2); await p.waitForTimeout(150); r = await replay();
  H.ok(r.i === 4 && await k() === 4 && /这就是现在的台面/.test(r.say), '拖进度到最后：就是现在的台面');
  await p.locator('#rp-prev').click(); await p.waitForTimeout(120); r = await replay();
  H.ok(r.i === 3 && await k() === 3, '上一步：第 3 步');
  // 回放中点台面上的鸡：不改东西
  const cb = await p.locator('.card svg.bdy g[data-pick-set]').first().boundingBox();
  await p.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2); await p.waitForTimeout(150);
  H.ok(await k() === 3 && /正在回放/.test(await banner()), '回放中点台面：不改，提示“正在回放”');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(100);
  H.ok(await p.evaluate(() => UI.S.undo.length) === undo0 && await evN() === ev0, '不进撤销、不记事件（Ctrl+Z 也不撤）');
  await p.keyboard.press('Escape'); await p.waitForTimeout(150); r = await replay();
  H.ok(!r.on && !r.bar && r.clock, 'Esc 退出回放：回放条收起，时钟条回来');
  H.ok(await p.evaluate((s) => UI.S.scene === window.__real && U.JSON.stringify(UI.S.scene) === s, sc0) && await k() === 4, '回到原样：同一个台面对象，4 个兔');

  console.log('4. 回放（做完了）');
  await H.byTitle('点一下：换成兔');
  H.ok(await H.done(await p.evaluate(() => UI.S.problem.milestones[0].id)), '换到 5 个兔：腿数正好 26');
  await p.waitForTimeout(900);
  H.ok(await p.locator('#dlg.open').count() === 1 && /做完了/.test(await p.locator('#dlg .box').textContent()), '“做完了”对话框弹出来');
  H.ok(await p.locator('#dlg-replay').count() === 1 && /看看我是怎么做的（5 步）/.test(await p.locator('#dlg-replay').textContent()), '对话框里有“🎬 看看我是怎么做的（5 步）”');
  await shot('done-dialog', p.locator('#dlg .box'));
  const ev1 = await evN(), fin = await p.evaluate(() => UI.S.run.reported);
  await p.locator('#dlg-replay').click(); await p.waitForTimeout(150);
  r = await replay();
  H.ok(r.on && r.i === 0 && await p.locator('#dlg.open').count() === 0, '点了：对话框关上，从头开始放');
  await p.waitForTimeout(3000); r = await replay();
  H.ok(r.i >= 2, '自动播放：过了 3 秒放到第 ' + r.i + ' 步');
  await shot('replay-auto');
  await p.waitForTimeout(1200);
  H.ok(await p.locator('#dlg.open').count() === 0 && await evN() === ev1 && await p.evaluate(() => UI.S.run.reported) === fin, '放的时候不再弹“做完了”、不记事件');
  await p.locator('#rp-exit').click(); await p.waitForTimeout(150);
  H.ok(!(await replay()).on && await k() === 5 && await p.locator('#dlg.open').count() === 0, '“✕ 退出回放”：回到 5 个兔，没有再弹对话框');

  console.log('5. 联动组：在天平上做一步，回放说出跟着做的台');
  await H.open('ef-2x3-11');
  // 天平卡片上的按钮“两边各拿走 1 个砝码”（真实鼠标）
  const bid = await p.evaluate(() => Object.values(UI.S.scene.entities).find((x) => x.type === 'balancebench').id);
  await p.locator('.card[data-id="' + bid + '"] svg.bdy g[data-pick-set]').filter({ hasText: '两边各拿走 1 个砝码' }).first().click();
  await p.waitForTimeout(200);
  H.ok(await p.evaluate(() => UI.S.scene.groups[0].log.length) === 1, '天平上两边各拿走一个砝码：联动组记下一步');
  await p.locator('#replaybtn').click(); await p.waitForTimeout(150); await p.locator('#rp-play').click();
  await p.locator('#rp-next').click(); await p.waitForTimeout(150); r = await replay();
  H.ok(/^第 1 步：在「天平1」上两边同时减 1，「式子1」跟着做了同一步/.test(r.say), '回放：' + r.say);
  H.ok(await p.evaluate(() => UI.S.flash === null && !document.querySelector('.card .flash, .card [data-flash]')), '回放中不闪');
  await shot('replay-group');
  await p.locator('#rp-exit').click(); await p.waitForTimeout(100);
  H.ok(!(await replay()).on, '退出回放');
  await H.end('过程看得见（回放、来历、看台面说话）');
})();
