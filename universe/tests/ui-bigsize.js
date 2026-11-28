/* node tests/ui-bigsize.js —— 试验台增强 7：台的尺寸和比例（真实鼠标）。用大数开题，拖把手做完：
 *  1. 线段图：甲仓是乙仓的几倍、一共一千多吨（随机出题 quiz:tapebench:…:3）。按比例缩小画、写着“数大了”；拖一段的长度到差不多，再点 ±10、±1 微调，对上目标；
 *  2. 面积模型：两位数乘两位数（47 × 15 这样，quiz:areamodel:…:3）。格子画小了；从两个 ✂ 各拖出一刀，切成好算的四块；
 *  3. 分一分：三位数除以两位数（quiz:groupbench:…:3）。把每份几个拖到题目的数；份多了中间画成“……”，商和余数对；
 *  4. 行程：两辆汽车相距几百千米（quiz:travelbench:…:3）。拖时间条到相遇；
 *  5. 数轴：0 到 1000（换单位，写着“一小格 = 50”）。拖起点到 230（按 10 取整），拖落点跳 5 步到 730；
 *  每一步：卡片宽高不超过 U.kit.big.CARD_MAX；控制台 0 报错。
 *  设了环境变量 E7_SHOTS（一个目录）时，把每台开题和做完的卡片截图存进去（e7-*.png）。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
const SHOTS = process.env.E7_SHOTS || '';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(400);
  const closeDlg = () => p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
  const open = async (id) => {
    await p.waitForTimeout(500); await closeDlg();
    await p.evaluate((id) => { UI.App.openProblem(id, 'practice'); }, id); await p.waitForTimeout(300);
    await p.evaluate(() => {
      document.querySelectorAll('button').forEach((x) => { if (/^(知道了|跳过|先不猜|开始)$/.test(x.textContent.trim())) x.click(); });
      for (const k of Object.keys(UI.S.help || {})) UI.S.help[k] = false;
      if (UI.S.run) UI.S.run.armed = true;
      UI.Stage.render();
    });
    await p.waitForTimeout(200);
  };
  // 找一个出得了大数题的种子：test(props) 为真
  const seedOf = (type, level, test) => p.evaluate(([type, level, test]) => { const f = new Function('q', 'return ' + test); for (let s = 1; s < 600; s++) { const q = U.Quiz.make(type, s, level); if (q && f(q.quiz)) return { id: q.id, sol: q.quiz.sol, props: q.quiz.props }; } return null; }, [type, level, test]);
  const ent = (type) => p.evaluate((type) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === type); return e ? { id: e.id, props: Object.assign({}, e.props) } : null; }, type);
  const out = (type, port) => p.evaluate(([type, port]) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === type), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, [type, port]);
  const allDone = () => p.evaluate(() => !!(UI.S.problem && UI.S.run && UI.S.problem.goal.every((g) => UI.S.run.ms[g] && UI.S.run.ms[g].done)));
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);
  // 卡片画布坐标 → 屏幕坐标（卡片可能被缩放）
  const toScreen = (type, cx, cy) => p.evaluate(([type, cx, cy]) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === type), sv = document.querySelector('.card[data-id="' + e.id + '"] svg.bdy'), r = sv.getBoundingClientRect(), k = r.width / +sv.getAttribute('width'); return { x: r.x + cx * k, y: r.y + cy * k }; }, [type, cx, cy]);
  const gripAt = (gid) => p.evaluate((gid) => { const g = document.querySelector('.card svg.bdy [data-grip="' + gid + '"]'); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, gid);
  const dragTo = async (gid, to) => { await closeDlg(); const g = await gripAt(gid); await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move((g.x + to.x) / 2, (g.y + to.y) / 2, { steps: 6 }); await p.mouse.move(to.x, to.y, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(250); };
  const cardOk = async (m) => { const r = await p.evaluate(() => { const c = document.querySelector('.card'), M = U.kit.big.CARD_MAX; return { w: c.offsetWidth, h: c.offsetHeight, M }; }); ok(r.w <= r.M[0] && r.h <= r.M[1], m + '：卡片 ' + r.w + '×' + r.h + ' 不超过 ' + r.M.join('×')); };
  const shot = async (name) => { if (!SHOTS) return; await closeDlg(); await p.waitForTimeout(150); await p.locator('.card').first().screenshot({ path: path.join(SHOTS, 'e7-' + name + '.png') }); };
  const clickBtn = async (label) => { await closeDlg(); await p.locator('.card svg.bdy [data-pick-set]', { hasText: new RegExp(label.replace('+', '\\+') + '$') }).first().click(); await p.waitForTimeout(160); };

  console.log('1. 线段图：一共一千多吨');
  const T = await seedOf('tapebench', 3, "q.props.na === '甲仓' && q.props.tv >= 900");
  ok(!!T, '出得了大数的线段图题' + (T ? '：' + T.id + '，一共 ' + T.props.tv : ''));
  if (T) {
    await open(T.id); await shot('tape-start'); await cardOk('线段图开题');
    ok(/数大了，按比例缩小画/.test(await text()), '写着“数大了，按比例缩小画”');
    const e = await ent('tapebench'), sc = await p.evaluate((pr) => U.TapeBench.scaleOf(U.TapeBench.model(pr)), e.props);
    await dragTo('u', await toScreen('tapebench', 84 + T.sol.u * sc, 152 + 14));   // 把手在下面那条（乙）的中间高度
    let u = (await ent('tapebench')).props.u;
    ok(Math.abs(u - T.sol.u) <= 30 && u > 1, '拖一段的长度：到了 ' + u + '（要 ' + T.sol.u + '），按比例尺取整');
    for (let i = 0; i < 12 && u !== T.sol.u; i++) { const d = T.sol.u - u; await clickBtn(Math.abs(d) >= 10 ? (d > 0 ? '+10' : '−10') : d > 0 ? '+1' : '−1'); u = (await ent('tapebench')).props.u; }
    ok(u === T.sol.u && await out('tapebench', 'hit') === '1', '点 ±10、±1 微调：一段 ' + u + '，对上了');
    ok(await allDone(), '这道题做完了');
    await shot('tape-done'); await cardOk('线段图做完');
  }

  console.log('2. 面积模型：两位数乘两位数');
  const A = await seedOf('areamodel', 3, 'q.props.w >= 21 && q.props.h >= 11');
  ok(!!A, '出得了两位数乘两位数' + (A ? '：' + A.props.w + ' × ' + A.props.h : ''));
  if (A) {
    await open(A.id); await shot('area-start'); await cardOk('面积模型开题');
    ok(/格子画小了/.test(await text()), '写着“格子画小了”');
    const cell = Math.min(17, 510 / A.props.w, 340 / A.props.h);
    await dragTo('vnew', await toScreen('areamodel', 46 + (+A.sol.vcuts) * cell, 44 + A.props.h * cell / 3));
    ok((await ent('areamodel')).props.vcuts === A.sol.vcuts, '从上面的 ✂ 拖出一刀：竖着切在 ' + A.sol.vcuts);
    await dragTo('hnew', await toScreen('areamodel', 46 + A.props.w * cell / 3, 44 + 10 * cell));
    ok((await ent('areamodel')).props.hcuts === '10', '从左边的 ✂ 拖出一刀：横着切在 10');
    ok(await out('areamodel', 'parts') === '4' && await out('areamodel', 'friendly') === '1' && await allDone(), '切成四块，每块都好算，做完了');
    await shot('area-done'); await cardOk('面积模型做完');
  }

  console.log('3. 分一分：三位数除以两位数');
  const Gq = await seedOf('groupbench', 3, 'q.props.n > 100 && q.props.mode === 0 && q.props.n / q.sol.g > 23');
  ok(!!Gq, '出得了三位数除以两位数' + (Gq ? '：' + Gq.props.n + ' ÷ ' + Gq.sol.g : ''));
  if (Gq) {
    await open(Gq.id); await shot('group-start'); await cardOk('分一分开题');
    await dragTo('g', await toScreen('groupbench', 40 + (Gq.sol.g - 1) * 380 / 98, 340));
    const g = (await ent('groupbench')).props.g;
    ok(g === Gq.sol.g, '把每份几个拖到 ' + g);
    ok(/中间还有 \d+ 箱/.test(await text()), '份多了：中间画成“……中间还有几箱”');
    ok(await allDone(), '商和余数都对，做完了');
    await shot('group-done'); await cardOk('分一分做完');
  }

  console.log('4. 行程：两辆汽车相距几百千米');
  const V = await seedOf('travelbench', 3, "q.props.na === '客车' && q.props.len >= 300");
  ok(!!V, '出得了几百千米的相遇题' + (V ? '：' + V.props.len + ' 千米' : ''));
  if (V) {
    await open(V.id); await shot('travel-start'); await cardOk('行程开题');
    await dragTo('t', await toScreen('travelbench', 50 + V.sol.t * 290 / V.props.tmax, 240));
    ok((await ent('travelbench')).props.t === V.sol.t && await out('travelbench', 'gap') === '0', '拖时间条到 ' + V.sol.t + ' 小时：相遇');
    ok(await allDone(), '做完了');
    await shot('travel-done'); await cardOk('行程做完');
  }

  console.log('5. 数轴：0 到 1000');
  const nl = await p.evaluate(() => (U.problems.find((x) => (x.shelf || [])[0] === 'numlinebench' && Object.values(x.build().entities).some((e) => e.type === 'numlinebench' && !+e.props.mode)) || {}).id);
  ok(!!nl, '有数轴题可开');
  if (nl) {
    await open(nl);
    await p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'numlinebench'); Object.assign(e.props, { mode: 0, from: 0, to: 1000, a: 0, s: 100, n: 0 }); UI.S.D = U.World.evaluate(UI.S.scene); UI.Stage.render(); });
    await p.waitForTimeout(200); await shot('numline-start'); await cardOk('长数轴');
    ok(/一小格 = 50/.test(await text()), '数轴长了换单位：写着“一小格 = 50”');
    await dragTo('a', await toScreen('numlinebench', 36 + 232 * 548 / 1000, 150));
    ok((await ent('numlinebench')).props.a === 230, '拖起点到 230（按 10 取整）：' + (await ent('numlinebench')).props.a);
    await dragTo('end', await toScreen('numlinebench', 36 + 730 * 548 / 1000, 120));
    ok((await ent('numlinebench')).props.n === 5 && await out('numlinebench', 'value') === '730', '拖落点：跳 5 步，落在 730');
    await shot('numline-done');
  }

  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n大数测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
