/* node tests/ui-guessall.js —— 自动先猜（js/core/predict.js 的 U.Predict.auto）：真实鼠标，4 道原来没有先猜的操作台题。
 *  1. 猜对：2024 年 2 月有几天（日历）。开题左栏出“动手之前先猜”，步骤里的 29 换成“？”；点 29，等着揭晓；
 *     翻到 2 月做出来：揭晓“猜对了”，记一条 guess 事件 { right: true, gap: 0 }；
 *  2. 猜错：5 月 1 日到 31 日一共几天。点 30；做出来是 31：“没猜中：差 1（猜错不扣分）”，提示“少数了一个”；分照样拿满；guess 事件 gap 1；
 *  3. 跳过：27 + 15（计数器）。点“先不猜，直接做”：先猜的表单收起，步骤里照常写 42，不记 guess 事件；
 *  4. 先猜：2x = 10（天平）。点 5：左栏写“你的猜想：5（做到第 1 步就揭晓）”，步骤里还是“？”；
 *  5. 题目自己写了先猜的（ef- 题）不被自动先猜盖掉；没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('calbench');
  const p = H.p, SP = process.env.SHOT_DIR;
  const closeDlg = () => p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
  // 开题，但不点“先不猜”（bench-harness 的 open 会替你跳过先猜）
  const open = async (id) => {
    await p.waitForTimeout(700); await closeDlg();
    await p.evaluate((id) => { UI.App.openProblem(id, 'practice'); }, id); await p.waitForTimeout(300);
    await p.evaluate(() => {
      document.querySelectorAll('button').forEach((x) => { if (/^(知道了|跳过|开始)$/.test(x.textContent.trim())) x.click(); });
      for (const k of Object.keys(UI.S.help || {})) UI.S.help[k] = false;
      if (UI.S.run) UI.S.run.armed = true;
      UI.Stage.render();
    });
    await p.waitForTimeout(200);
  };
  const left = () => p.evaluate(() => document.querySelector('#leftbody').innerText);
  const steps = () => p.evaluate(() => Array.from(document.querySelectorAll('#leftbody .step .sy')).map((x) => x.textContent).join(' / '));
  const pick = async (label) => { await closeDlg(); await p.locator('#leftbody [data-autopred="ask"] button').filter({ hasText: new RegExp('^' + label + '$') }).click(); await p.waitForTimeout(200); };
  const guesses = (pid) => p.evaluate((pid) => U.Events.log.filter((e) => e.type === 'guess' && e.pid === pid).map((e) => e.data), pid);
  const card = (k) => p.locator('#leftbody [data-autopred="' + k + '"]').count();

  console.log('1. 猜对');
  await open('cal-feb-2024');
  H.ok(await card('ask') === 1 && /动手之前先猜：2024 年 2 月有 ？ 天/.test(await left()), '开题：左栏出“动手之前先猜”，问题里不露答案');
  H.ok(/？/.test(await steps()) && !/29/.test(await steps()), '步骤里的 29 换成了“？”');
  H.ok(await p.locator('#leftbody [data-autopred="ask"] button').filter({ hasText: '先不猜，直接做' }).count() === 1, '有“先不猜，直接做”');
  if (SP) await p.locator('#left').screenshot({ path: SP + '/guessall-ask.png' });
  await pick('29');
  H.ok(await card('wait') === 1 && /你的猜想：29（做到第 1 步就揭晓）/.test(await left()), '点 29：等着揭晓，还没说对不对');
  await H.press('▶');
  H.ok(await H.done('feb') && await card('right') === 1 && /你猜 29，做出来是 29　✓ 猜对了/.test(await left()), '翻到 2 月：揭晓“猜对了”');
  H.ok(JSON.stringify(await guesses('cal-feb-2024')) === JSON.stringify([{ ent: 'predict', right: true, gap: 0 }]), '记一条 guess 事件：对，差 0');
  if (SP) await p.locator('#left').screenshot({ path: SP + '/guessall-right.png' });

  console.log('2. 猜错');
  await open('cal-may-days');
  H.ok(await card('ask') === 1, '开题：先猜表单');
  await pick('30');
  await H.byTitle('5 月 1 日'); await H.byTitle('5 月 31 日');
  H.ok(await H.done('all') && await card('wrong') === 1, '做出来：一共 31 天，揭晓');
  const t2 = await left();
  H.ok(/你猜 30，做出来是 31　没猜中：差 1（猜错不扣分）/.test(t2) && /是不是少数了一个/.test(t2), '“没猜中：差 1（猜错不扣分）”，提示“少数了一个”');
  H.ok(JSON.stringify(await guesses('cal-may-days')) === JSON.stringify([{ ent: 'predict', right: false, gap: 1 }]), 'guess 事件：错，差 1');
  H.ok(await p.evaluate(() => { const s = U.Judge.score(UI.S.problem, UI.S.run); return s.got === s.max; }), '猜错不扣分：分照样拿满');
  if (SP) await p.locator('#left').screenshot({ path: SP + '/guessall-wrong.png' });

  console.log('3. 跳过');
  await open('bk-27-15');
  H.ok(await card('ask') === 1 && /整理好了：？/.test(await steps()), '开题：先猜表单，步骤里是“整理好了：？”');
  await closeDlg(); await p.locator('#leftbody [data-autopred="ask"] button').filter({ hasText: '先不猜，直接做' }).click(); await p.waitForTimeout(200);
  H.ok(await card('ask') === 0 && await card('wait') === 0 && /整理好了：42/.test(await steps()), '点“先不猜，直接做”：表单收起，步骤照常写 42');
  H.ok((await guesses('bk-27-15')).length === 0 && await p.evaluate(() => UI.S.run.pred === undefined && UI.S.run.pred_done), '不记 guess，也不记猜想');

  console.log('4. 先猜（天平）');
  await open('bb-2x-10');
  H.ok(await card('ask') === 1 && /一个盒子 = ？/.test(await left()), '开题：先猜“一个盒子 = ？”');
  await pick('5');
  H.ok(/你的猜想：5（做到第 1 步就揭晓）/.test(await left()) && /？/.test(await steps()) && await p.evaluate(() => UI.S.run.pred === '5'), '点 5：等着揭晓，步骤里还是“？”');
  H.ok((await p.evaluate(() => U.Events.log.filter((e) => e.type === 'predict' && e.pid === 'bb-2x-10').map((e) => e.data.v))).join() === '5', '记一条 predict 事件');

  console.log('5. 题目自己写的先猜不被盖掉');
  await open('ef-2x3-11');
  H.ok(await card('ask') === 0 && await p.locator('#leftbody .pred').count() === 1 && /两边各拿走 1 个砝码/.test(await left()), 'ef- 题：用它自己写的先猜');
  await H.end('自动先猜');
})();
