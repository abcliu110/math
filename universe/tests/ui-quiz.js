/* node tests/ui-quiz.js —— 随机出题：真实鼠标测试。
 *  1. 竖式题的步骤栏有“🎲 随机出一题：容易 中等 难 倒推 找错”；点“难”：出一道竖式除法（quiz:vertbench:…:3），台面上是新数；
 *  2. 点“容易”：出一道竖式加法；像学生一样点进位圆圈、点数字键写完：做完，弹窗里有“🎲 再来一题”；
 *  3. 点“再来一题”：又是一道新的竖式题（种子不同，难度不变）；
 *  4. 实验库里“随机练习”：点“难”，再点“估一估”：出一道估一估的乘法题；
 *  5. 先猜：先写答案，再做出来验证；
 *  6. 通用任务层“找全”：面积模型拖把手，把长和宽的每一种都找出来，步骤栏没做到前不露答案；
 *  7. “推广”：先写猜想，再做三个例子和远一点的那个；
 *  8. 实验库的新档位只列出得来的操作台；没有报错。 */
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
  H.ok(await p.locator('#left .quizrow [data-quiz]').count() === 6, '步骤栏有“随机出一题”：容易、中等、难、倒推、找错、先猜（竖式的倒推是填缺数字，找错是找小明写错的一位）');
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
  console.log('5. 先猜：先写答案，再做出来验证');
  await H.open('vt-47-38');
  await p.evaluate(() => { UI.S.tab = 'steps'; UI.Panels.renderLeft(); });
  await p.locator('#left .quizrow [data-quiz="6"]').first().click(); await p.waitForTimeout(300);
  const g = await p.evaluate(() => ({ id: UI.S.problem.id, pr: UI.S.problem.predict, sol: UI.S.problem.quiz.sol }));
  H.ok(/^quiz:vertbench:\d+:6$/.test(g.id) && g.pr && g.pr.form === 'number' && (await p.locator('#predin').count()) === 1, '点“先猜”：先要写下答案（输入框）');
  await p.locator('#predin').fill(g.pr.answer); await p.locator('[data-pred="submit"]').click(); await p.waitForTimeout(200);
  H.ok(await p.evaluate(() => UI.S.run.pred_done && String(UI.S.run.pred)) === g.pr.answer, '写下答案 ' + g.pr.answer + '，提交');
  await p.evaluate((sol) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'vertbench'); for (const k of Object.keys(sol)) UI.App.act({ t: 'set', id: e.id, k, v: sol[k] }); }, g.sol); await p.waitForTimeout(300);
  H.ok(await p.evaluate(() => UI.S.run.ms.g0 && UI.S.run.ms.g0.done), '在操作台上做出来：和猜的一样，完成');

  console.log('6. 通用任务层：面积模型的“找全”，真实鼠标拖把手，一种一种找出来');
  // 拖面积模型的把手：长、宽各调到几（一格多少像素从两个把手的位置算出来）
  const gripAt = (id) => p.evaluate((id) => { const g = document.querySelector('.card svg.bdy [data-grip="' + id + '"]'); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  const amProps = () => p.evaluate(() => Object.assign({}, Object.values(UI.S.scene.entities).find((x) => x.type === 'areamodel').props));
  const setWH = async (w, h) => {
    for (const [k, v] of [['w', w], ['h', h]]) {
      const pr = await amProps(), gw = await gripAt('w'), gh = await gripAt('h'), cell = await p.evaluate((pr) => { const sv = document.querySelector('.card svg.bdy'), k = sv.getBoundingClientRect().width / +sv.getAttribute('width'); return k * Math.min(17, 510 / pr.w, 340 / pr.h); }, pr),   // 一格多少屏幕像素（2026-11-27：以前用两个把手的距离估，w 小时估大了，靠长最多 30 截住；现在长能到 99）
      g = k === 'w' ? gw : gh, d = (v - pr[k]) * cell;
      if (!d) continue;
      await p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
      await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move(g.x + (k === 'w' ? d / 2 : 0), g.y + (k === 'h' ? d / 2 : 0), { steps: 4 }); await p.mouse.move(g.x + (k === 'w' ? d : 0), g.y + (k === 'h' ? d : 0), { steps: 4 }); await p.mouse.up(); await p.waitForTimeout(160);
    }
  };
  const fid = await p.evaluate(() => { for (let s = 1; s < 60; s++) { const q = U.Quiz.make('areamodel', s * 977, 7); if (q && q.quiz.sols.length >= 3 && q.quiz.sols.every((x) => x.w !== undefined && x.h !== undefined)) return q.id; } return null; });
  H.ok(!!fid, '面积模型出得了“长和宽找全”：' + fid);
  await H.open(fid);
  const fq = await p.evaluate(() => ({ title: UI.S.problem.title, sols: UI.S.problem.quiz.sols, n: UI.S.problem.milestones.length }));
  H.ok(/找出来/.test(fq.title) && fq.n === fq.sols.length, '题目说“把所有的都找出来”，一种做法一个里程碑：' + fq.title);
  await p.evaluate(() => { UI.S.tab = 'steps'; UI.Panels.renderLeft(); });
  const steps0 = await p.evaluate(() => [...document.querySelectorAll('#left .step .sy')].map((x) => x.textContent));
  H.ok(steps0.length === fq.sols.length && steps0.every((x, i) => x.replace(/^[^\p{L}]+/u, '').startsWith('第 ' + (i + 1) + ' 种：？')), '步骤栏没做到之前不露答案：' + steps0.slice(0, 2).join(' / '));
  for (let i = 0; i < fq.sols.length; i++) {
    await setWH(fq.sols[i].w, fq.sols[i].h);
    const pr = await amProps(), got = await p.evaluate(() => Object.values(UI.S.run.ms).filter((x) => x.done).length);
    H.ok(pr.w === fq.sols[i].w && pr.h === fq.sols[i].h && got === i + 1, '拖成 长 ' + fq.sols[i].w + '、宽 ' + fq.sols[i].h + '：找到第 ' + (i + 1) + ' 种（已找到 ' + got + '）');
  }
  await p.waitForTimeout(1300);
  H.ok(await p.evaluate(() => Object.values(UI.S.run.ms).every((x) => x.done) && !!document.querySelector('#dlg-quiz')), '全部找到：做完，弹窗里有“再来一题”');

  console.log('7. 通用任务层：推广——先写猜想，再做出三个例子和远一点的那个');
  const gid = await p.evaluate(() => { for (let s = 1; s < 60; s++) { const q = U.Quiz.make('areamodel', s * 977, 9); if (q && q.quiz.sols.every((x) => Object.keys(x).length === 1 && (x.w !== undefined || x.h !== undefined))) return q.id; } return null; });
  await H.open(gid);
  const gq = await p.evaluate(() => ({ pr: UI.S.problem.predict, sols: UI.S.problem.quiz.sols, props: UI.S.problem.quiz.props }));
  H.ok(gq.pr && gq.pr.form === 'number' && (await p.locator('#predin').count()) === 1 && gq.sols.length === 4, '推广题：有猜想输入框，三个例子 + 一个远一点的');
  await p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); }); await p.waitForTimeout(100);
  await p.locator('#predin').fill(gq.pr.answer); await p.locator('[data-pred="submit"]').click(); await p.waitForTimeout(200);
  for (const x of gq.sols) await setWH(x.w !== undefined ? x.w : gq.props.w, x.h !== undefined ? x.h : gq.props.h);
  await p.waitForTimeout(300);
  H.ok(await p.evaluate(() => Object.values(UI.S.run.ms).every((x) => x.done)), '四个都做出来：完成（猜的 ' + gq.pr.answer + '）');

  console.log('8. 实验库：新档位只列出得来的操作台');
  await p.waitForTimeout(1300); await p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); UI.S.tab = 'lab'; UI.Panels.renderLeft(); });
  await clickLeft('[data-quiz-lv="7"]');
  const chips = await p.evaluate(() => [...document.querySelectorAll('#left [data-quiz-type]')].map((x) => x.dataset.quizType));
  H.ok(chips.includes('areamodel') && !chips.includes('vertbench') && /找全/.test(await p.locator('#left .qnote').first().textContent()), '“找全”档：有面积模型，没有竖式（' + chips.length + ' 个操作台）');
  await clickLeft('[data-quiz-type="groupbench"]');
  H.ok(/^quiz:groupbench:\d+:7$/.test(await pid()), '点“分一分”：出一道找全题');
  await H.end('随机出题');
})();
