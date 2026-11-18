/* node tests/ui-quiz.js —— 随机出题：真实鼠标测试。
 *  1. 竖式题的步骤栏有“🎲 随机出一题：容易 中等 难 倒推 找错”；点“难”：出一道竖式除法（quiz:vertbench:…:3），台面上是新数；
 *  2. 点“容易”：出一道竖式加法；像学生一样点进位圆圈、点数字键写完：做完，弹窗里有“🎲 再来一题”；
 *  3. 点“再来一题”：又是一道新的竖式题（种子不同，难度不变）；
 *  4. 实验库里“随机练习”：点“难”，再点“估一估”：出一道估一估的乘法题；
 *  5. 没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('vertbench');
  const p = H.p;
  const pid = () => p.evaluate(() => UI.S.problem && UI.S.problem.id);
  const closeDlg = () => p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
  const clickLeft = async (sel) => { await p.locator('#left ' + sel).first().click(); await p.waitForTimeout(300); await p.evaluate(() => { document.querySelectorAll('button').forEach((x) => { if (/^(知道了|跳过|先不猜|开始)$/.test(x.textContent.trim())) x.click(); }); if (UI.S.run) UI.S.run.armed = true; }); };

  console.log('1. 步骤栏：随机出一题');
  await H.open('vt-47-38');
  await p.evaluate(() => { UI.S.tab = 'steps'; UI.Panels.renderLeft(); });
  H.ok(await p.locator('#left .quizrow [data-quiz]').count() === 5, '步骤栏有“随机出一题”：容易、中等、难、倒推、找错（竖式的倒推是填缺数字，找错是找小明写错的一位）');
  await clickLeft('.quizrow [data-quiz="3"]');
  const id3 = await pid();
  H.ok(/^quiz:vertbench:\d+:3$/.test(id3) && (await H.props()).mode === 2, '点“难”：出一道竖式除法 ' + id3);

  console.log('2. 做一道随机加法');
  await p.evaluate(() => { UI.S.tab = 'steps'; UI.Panels.renderLeft(); });
  await clickLeft('.quizrow [data-quiz="1"]');
  const q = await p.evaluate(() => UI.S.problem.quiz);
  H.ok(q && q.type === 'vertbench' && q.level === 1 && q.props.mode === 0, '点“容易”：出一道竖式加法 ' + q.props.a + ' + ' + q.props.b);
  const marks = String(q.sol.marks || '').split(',').filter(Boolean).map(Number), res = String(q.sol.res);
  for (let j = 0; j < res.length; j++) {
    if (marks.includes(j)) { await closeDlg(); await p.locator('.card svg.bdy [data-mark="' + j + '"]').click(); await p.waitForTimeout(120); }
    await closeDlg(); await p.locator('.card svg.bdy [data-key="' + res[j] + '"]').click(); await p.waitForTimeout(120);
  }
  H.ok(await H.out('result') === String(q.props.a + q.props.b) && await H.done('g0'), '一位一位写完：' + (q.props.a + q.props.b));
  await p.waitForTimeout(1300);
  H.ok(await p.evaluate(() => !!document.querySelector('#dlg-quiz')), '做完的弹窗里有“🎲 再来一题”');

  console.log('3. 再来一题');
  const before = await pid();
  await p.locator('#dlg-quiz').click(); await p.waitForTimeout(400);
  const after = await pid();
  H.ok(/^quiz:vertbench:\d+:1$/.test(after) && after !== before, '再来一题：新的种子、难度不变');

  console.log('4. 实验库：随机练习');
  await p.evaluate(() => { UI.S.tab = 'lab'; UI.Panels.renderLeft(); });
  await clickLeft('[data-quiz-lv="3"]');
  await clickLeft('[data-quiz-type="estbench"]');
  const est = await p.evaluate(() => UI.S.problem && UI.S.problem.quiz);
  H.ok(est && est.type === 'estbench' && est.level === 3 && est.props.op === 2, '实验库点“难”“估一估”：出一道估一估乘法');
  await H.end('随机出题');
})();
