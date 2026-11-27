/* 全部在器材上操作：几何一组（真实鼠标）。海龟作图、剪拼、钉板、证明排序、尺规作图、式子台：
 * 开题，全程不打开属性面板，只点卡片上的按钮、积木、格点、卡片做完一道题；卡片标题栏不再有“✎ 填写 / ✎ 先猜”。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const SHOTS = process.env.GEO_SHOTS || require('os').tmpdir();   // 截图放临时目录（不进仓库）
(async () => {
  const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(400);
  const closeDlg = () => p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
  const click = async (loc) => { await closeDlg(); try { await loc.click({ timeout: 2500 }); } catch (e) { await closeDlg(); await loc.click(); } await p.waitForTimeout(120); };
  const open = async (id) => {
    await p.waitForTimeout(700); await closeDlg();
    await p.evaluate((id) => { UI.App.openProblem(id, 'practice'); }, id); await p.waitForTimeout(300);
    await p.evaluate(() => {
      document.querySelectorAll('button').forEach((x) => { if (/^(知道了|跳过|先不猜|开始)$/.test(x.textContent.trim())) x.click(); });
      for (const k of Object.keys(UI.S.help || {})) UI.S.help[k] = false;
      if (UI.S.run) UI.S.run.armed = true;
      UI.Stage.render();
    });
    await p.waitForTimeout(200);
  };
  const card = (type) => p.evaluate((type) => Object.values(UI.S.scene.entities).find((x) => x.type === type).id, type);
  const pick = (id, k, v, n) => click(p.locator('.card[data-id="' + id + '"] svg.bdy [data-pick-k="' + k + '"][data-pick-v="' + v + '"]').nth(n || 0));
  const has = (id, k, v) => p.locator('.card[data-id="' + id + '"] svg.bdy [data-pick-k="' + k + '"][data-pick-v="' + v + '"]').count();
  const press = (id, title) => click(p.locator('.card[data-id="' + id + '"] svg.bdy g[data-pick-set]').filter({ has: p.locator('title', { hasText: new RegExp('^' + title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$') }) }).first());
  const props = (id) => p.evaluate((id) => Object.assign({}, UI.S.scene.entities[id].props), id);
  const done = (ms) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), ms);
  const noChip = async (id, name) => ok((await p.locator('.card[data-id="' + id + '"] [data-card-insp]').count()) === 0, name + '：标题栏没有“✎ 填写 / ✎ 先猜”');
  const shot = async (id, name) => { await p.waitForTimeout(800); await closeDlg(); await p.waitForTimeout(100); const box = await p.locator('.card[data-id="' + id + '"]').boundingBox(); if (box) await p.screenshot({ path: path.join(SHOTS, 'geo-' + name + '.png'), clip: { x: Math.max(0, box.x - 8), y: Math.max(0, box.y - 8), width: box.width + 16, height: box.height + 16 } }); };

  console.log('海龟作图：正三角形（转角用 − / + 从 60° 调到 120°，先猜在卡片上点）');
  await open('tu-triangle'); let id = await card('turtle'); await noChip(id, '海龟');
  for (let i = 0; i < 4; i++) { const a = (await props(id)).a; await pick(id, 'a', a + 15); }
  ok((await props(id)).a === 120, '点 4 次“+15”：转角 60° → 120°');
  for (const v of [4, 1, 2, 5]) await pick(id, 'add', v);
  ok((await props(id)).prog === 'T3;F100;L120;E', '点积木：重复 3 次 [前进 100、左转 120°]');
  await shot(id, 'turtle-guess');
  await press(id, '我猜：会回到起点');
  ok((await props(id)).gans === 1 && await done('match'), '点“会回到起点”：揭开，画出了正三角形');
  await shot(id, 'turtle');

  console.log('剪拼：钝角（先猜点“c² 大”，夹角点 120°），圆（先猜“没变”，多切一倍，半径 − / +）');
  await open('dz-obtuse'); id = await card('dissect'); await noChip(id, '剪拼');
  await shot(id, 'dissect-guess');
  await press(id, '我猜：c² 大'); await press(id, '两边的夹角改成 120°');
  ok(await done('gap') && await done('guess'), '钝角时 c² 大；先猜对了');
  await press(id, '直角边 a 加 1'); ok((await props(id)).a === 6, '直角边 a 点“+”：5 → 6');
  await shot(id, 'dissect');
  await open('dz-circle'); id = await card('dissect');
  await press(id, '我猜：没变'); for (const v of [8, 16, 32]) await pick(id, 'n', v);
  await press(id, '半径 加 1'); ok((await props(id)).r === 6, '半径点“+”：5 → 6');
  ok(await done('fine') && await done('right'), '切成 32 份，差不到 1%；先猜对了');

  console.log('钉板：围 5 个多边形记进表，用 − / + 调出皮克公式，先猜面积');
  await open('gb-pick'); id = await card('geoboard'); await noChip(id, '钉板');
  const shapes = [[[0, 0], [2, 0], [2, 1], [0, 1]], [[0, 0], [3, 0], [0, 3]], [[0, 0], [4, 0], [3, 2], [1, 2]], [[0, 0], [3, 1], [1, 3]], [[0, 0], [2, 0], [2, 2], [0, 2]]];
  for (const [si, sh] of shapes.entries()) {
    for (const [x, y] of sh.concat([sh[0]])) await pick(id, 'pt', y * 7 + x + 1);
    if (si === 0) { for (let i = 0; i < 4; i++) await press(id, '猜的面积加 ½'); await press(id, '就猜这个面积'); ok((await props(id)).gans === '2', '第一个图形：先猜面积 2（四次“+½”，点“猜好了”）'); }
    await pick(id, 'rec', 1);
  }
  ok((await props(id)).rows.split(';').length === 5 && await done('rows'), '表里 5 行');
  await press(id, 'B 的系数减 ½'); await press(id, '常数减 ½'); await press(id, '常数减 ½');
  const gp = await props(id); ok(gp.fa === '1' && gp.fb === '1/2' && gp.fc === '-1', '公式：面积 = 1 × I + 1/2 × B + −1');
  ok(await done('formula'), '公式对了');
  await shot(id, 'geoboard');

  console.log('证明排序：点卡片、点依据');
  await open('ps-odd-odd'); id = await card('proofsort'); await noChip(id, '证明排序');
  const plan = await p.evaluate((id) => { const pp = UI.S.scene.entities[id].props, P = U.Proofsort.proofOf(pp), C = U.Proofsort.cardsOf(P); return P.steps.map((st, i) => [C.findIndex((c) => c.id === st.id) + 1, i * 10 + P.rules.indexOf(st.rule) + 1]); }, id);
  for (const [a, r] of plan) { await pick(id, 'add', a); await pick(id, 'rr', r); }
  ok(await done('ok'), '顺序和依据都对：证明完整');
  await shot(id, 'proofsort');

  console.log('尺规作图：垂直平分线（选工具、点点、取交点）');
  await open('cs-bisector'); id = await card('compass'); await noChip(id, '尺规作图');
  const tool = async (v) => { if (await has(id, 'tool', v)) await pick(id, 'tool', v); };
  const circle = async (c, q) => { await tool(1); await pick(id, 'pt', c + 1); await pick(id, 'pt', q + 1); };
  const line = async (a, c) => { await tool(2); await pick(id, 'pt', a + 1); await pick(id, 'pt', c + 1); };
  const take = async (i, j, w) => {
    const at = await p.evaluate(([id, i, j, w]) => { const C = U.Compass, pp = UI.S.scene.entities[id].props, S = String(pp.steps || '').split(';').filter(Boolean), giv = C.givOf(pp.task), B = C.build(S, giv), I = C.inter(B.P, B.O[i], B.O[j]), L = C.cands(S, giv); return L.findIndex((x) => Math.hypot(x.q[0] - I[w][0], x.q[1] - I[w][1]) < 1e-7); }, [id, i, j, w]);
    await tool(3); await pick(id, 'cand', at + 1);
  };
  await circle(0, 1); await circle(1, 0); await take(0, 1, 0); await take(0, 1, 1); await line(2, 3);
  ok((await p.evaluate((id) => U.Q.show(UI.S.D[id].out.ok.data), id)) === '1', '换 3 个位置也成立：作对了');
  await shot(id, 'compass');

  console.log('式子台：a、b、c、d 是题目摆好的，不用填');
  await open('ef-2x3-11'); id = await card('eqstepbench'); await noChip(id, '式子台');

  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n几何一组（器材上操作）测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
