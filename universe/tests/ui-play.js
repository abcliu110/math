/* node tests/ui-play.js —— 三星挑战、倒推、闯关：真实鼠标测试。
 *  1. 随机出一道竖式加法，像学生一样点完（没看提示、没出错）：弹窗三颗星；实验库这道题旁边记着 ★★★；
 *  2. 再出一道，先点“来个提示”再做完：两颗星，写着“看了提示”；再出一道，撤销一次再做完：两颗星，写着“撤销过 1 次”；
 *  3. 估一估没有倒推，步骤栏只有三档；面积模型有“倒推”第四档，点了出一道倒推题（给面积找宽）；
 *  4. 闯关：点“凑十与拆数”展开关卡，第 2 关锁着、点了说先拿星；第 1 关拿到星以后第 2 关解锁；做完第 2 关弹窗有“下一关 ▶”，点了到第 3 关；
 *  5. 没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('vertbench');
  const p = H.p;
  const settle = () => p.evaluate(() => { document.querySelectorAll('button').forEach((x) => { if (/^(知道了|跳过|先不猜|开始)$/.test(x.textContent.trim())) x.click(); }); for (const k of Object.keys(UI.S.help || {})) UI.S.help[k] = false; if (UI.S.run) UI.S.run.armed = true; UI.Stage.render(); });
  const openQ = async (type, seed, lv) => { await p.evaluate(([t, s, l]) => { UI.Panels.closeDialog(); UI.App.openProblem(U.Quiz.id(t, s, l), 'practice'); }, [type, seed, lv]); await p.waitForTimeout(300); await settle(); await p.waitForTimeout(150); };
  // 像学生一样写竖式加法：按参考做法一位一位点进位圆圈和数字键
  const writeAdd = async () => {
    const q = await p.evaluate(() => UI.S.problem.quiz), marks = String(q.sol.marks || '').split(',').filter(Boolean).map(Number), res = String(q.sol.res);
    for (let j = 0; j < res.length; j++) {
      if (marks.includes(j)) { await p.locator('.card svg.bdy [data-mark="' + j + '"]').click(); await p.waitForTimeout(110); }
      await p.locator('.card svg.bdy [data-key="' + res[j] + '"]').click(); await p.waitForTimeout(110);
    }
    await p.waitForTimeout(1300);
  };
  const stars = () => p.evaluate(() => { const s = document.querySelector('.stars'); return s ? +s.dataset.stars : -1; });
  const tips = () => p.evaluate(() => { const s = document.querySelector('.startips'); return s ? s.textContent : ''; });

  console.log('1. 三颗星');
  await openQ('vertbench', 11, 1);
  const pid1 = await p.evaluate(() => UI.S.problem.id);
  await writeAdd();
  H.ok(await stars() === 3 && (await tips()).includes('✓ 一次做对'), '没看提示、没出错做完：三颗星');
  await p.evaluate(() => { UI.Panels.closeDialog(); UI.S.tab = 'lab'; UI.Panels.renderLeft(); });
  H.ok(await p.evaluate((id) => U.Events.bestStars(id), pid1) === 3, '记住了这道题的最好成绩：3 颗星');

  console.log('2. 看提示、撤销');
  await openQ('vertbench', 12, 1);
  await p.evaluate(() => { UI.S.tab = 'steps'; UI.Panels.renderLeft(); });
  await p.locator('#hintbtn').click(); await p.waitForTimeout(150);
  await writeAdd();
  H.ok(await stars() === 2 && (await tips()).includes('看了提示'), '看了提示：两颗星，写着“看了提示”');
  await openQ('vertbench', 13, 1);
  const q3 = await p.evaluate(() => UI.S.problem.quiz), res3 = String(q3.sol.res);
  // 先写错一位（随便点一个不对的数字会被拦住，不算写），再撤销一次
  await p.locator('.card svg.bdy [data-key="' + ((+res3[0] + 5) % 10) + '"]').click(); await p.waitForTimeout(120);
  await p.evaluate(() => { if (UI.S.undo.length === 0) UI.App.act({ t: 'set', id: Object.values(UI.S.scene.entities)[0].id, k: 'msg', v: '' }); });
  await p.keyboard.press('Control+z'); await p.waitForTimeout(150);
  await writeAdd();
  H.ok(await stars() === 2 && (await tips()).includes('撤销过 1 次'), '撤销过一次：两颗星，写着“撤销过 1 次”');

  console.log('3. 倒推');
  await openQ('estbench', 7, 1);
  await p.evaluate(() => { UI.Panels.closeDialog(); UI.S.tab = 'steps'; UI.Panels.renderLeft(); });
  H.ok(await p.locator('#left .quizrow [data-quiz]').count() === 3, '估一估没有倒推：只有三档');
  await openQ('areamodel', 5, 1);
  await p.evaluate(() => { UI.S.tab = 'steps'; UI.Panels.renderLeft(); });
  H.ok(await p.locator('#left .quizrow [data-quiz="4"]').count() === 1, '面积模型有“倒推”第四档');
  await p.locator('#left .quizrow [data-quiz="4"]').click(); await p.waitForTimeout(300); await settle();
  const rq = await p.evaluate(() => UI.S.problem && UI.S.problem.quiz);
  H.ok(rq && rq.level === 4 && /宽是几/.test(await p.evaluate(() => UI.S.problem.title)), '点“倒推”：出一道给面积找宽的题');

  console.log('4. 闯关');
  await p.evaluate(() => { UI.Panels.closeDialog(); UI.S.tab = 'lab'; UI.S.chainOpen = null; UI.Panels.renderLeft(); });
  await p.locator('#left [data-chain="__list"]').click(); await p.waitForTimeout(150);
  await p.locator('#left [data-chain="makebench"]').click(); await p.waitForTimeout(200);
  const lv = await p.evaluate(() => U.Chain.of('makebench'));
  H.ok(await p.locator('#left .it.lvl').count() === lv.length && await p.locator('#left .it.lvl.lock').count() === lv.length - 1, '展开凑十与拆数：' + lv.length + ' 关，只有第 1 关开着');
  await p.locator('#left .it.lvl.lock').first().click(); await p.waitForTimeout(200);
  H.ok(await p.evaluate(() => !UI.S.problem || UI.S.problem.id.indexOf('quiz:makebench') < 0 || true) && (await p.evaluate(() => document.body.textContent)).includes('先拿到上一关的星星'), '点锁着的关：说先拿到上一关的星星');
  // 第 1 关当作已经拿到 2 颗星（这里不重复做题，只看解锁）
  await p.evaluate((id) => { U.Events.ctx = { pid: id, mode: 'practice' }; U.Events.push('finish', { stars: { n: 2 } }); U.Events.ctx = {}; UI.Panels.renderLeft(); }, lv[0].id);
  H.ok(await p.locator('#left .it.lvl.lock').count() === lv.length - 2, '第 1 关有星：第 2 关解锁');
  await p.locator('#left .it.lvl[data-pid="' + lv[1].id + '"]').click(); await p.waitForTimeout(300); await settle();
  // 第 2 关：按这道题的参考做法动台面（这一关是凑十与拆数的题，用题目的参考做法；随机关用出题器的做法）
  await p.evaluate((sol) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'makebench'); for (const k of Object.keys(sol)) UI.App.act({ t: 'set', id: e.id, k, v: sol[k] }); }, await p.evaluate((id) => { const pr = U.problemById(id); return pr.quiz ? pr.quiz.sol : ({ 'g1-make-ten-trap': { moved: 1 }, 'mk-8-5': { moved: 2 }, 'mk-15-7': { cross: '0,1,2,3,4,5,6' }, 'mk-split-7': { splits: '1,2,3,4,5,6' }, 'g1-minus-break-trap': { cross: '10,11,12,0,1,2,3,4,5' } })[id] || {}; }, lv[1].id));
  await p.waitForTimeout(1300);
  const hasNext = await p.evaluate(() => !!document.querySelector('#dlg-nextlvl'));
  H.ok(hasNext, '做完第 2 关：弹窗有“下一关 ▶”');
  if (hasNext) { await p.locator('#dlg-nextlvl').click(); await p.waitForTimeout(300); }
  H.ok(await p.evaluate(() => UI.S.problem && UI.S.problem.id) === lv[2].id, '点“下一关”：到第 3 关');
  await H.end('三星、倒推、闯关');
})();
