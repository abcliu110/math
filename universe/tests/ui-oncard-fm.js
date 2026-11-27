/* node tests/ui-oncard-fm.js —— 全部在卡片上操作（函数机一组，2026-11-26）：函数机、猜规则台、总是有时从不、换一种运算、两种解法对照、树状图。
 *   每台都开一道用到它的题，用真实鼠标点、拖卡片上的东西做完，全程不打开属性面板；标题栏不再有“✎ 填写 / ✎ 先猜”。
 *   截图存到 SHOT_DIR（默认 tests/shots），文件名以 fm- 开头。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
const SHOT = process.env.SHOT_DIR || path.join(__dirname, 'shots');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } }), errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(400);
  const closeDlg = () => p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
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
  // 点卡片上的一个东西（真实鼠标）：sel 是卡片 svg 里的选择器
  const tap = async (sel) => {
    await closeDlg(); const loc = p.locator('.card svg.bdy ' + sel).first();
    try { await loc.click({ timeout: 2500 }); } catch (e) { await closeDlg(); await loc.click(); }
    await p.waitForTimeout(110);
  };
  const props = (type) => p.evaluate((type) => Object.assign({}, Object.values(UI.S.scene.entities).find((x) => x.type === type).props), type);
  const goal = () => p.evaluate(() => UI.S.problem.goal.every((id) => UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done));
  const noChip = () => p.evaluate(() => document.querySelectorAll('.card .gchip[data-card-insp]').length === 0);
  const shot = async (name) => { const c = p.locator('.card').first(); await c.screenshot({ path: path.join(SHOT, 'fm-' + name + '.png') }); };
  const text = () => p.evaluate(() => Array.from(document.querySelectorAll('.card svg.bdy text')).map((t) => t.textContent).join('|'));
  const drag = async (from, to) => {
    await closeDlg();
    const sc = (x, y) => p.evaluate(([x, y]) => { const svg = document.querySelector('.card svg.bdy'), pt = svg.createSVGPoint(); pt.x = x; pt.y = y; const q = pt.matrixTransform(svg.getScreenCTM()); return [q.x, q.y]; }, [x, y]);
    const [x0, y0] = await sc(...from), [x1, y1] = await sc(...to);
    await p.mouse.move(x0, y0); await p.mouse.down(); await p.mouse.move((x0 + x1) / 2, (y0 + y1) / 2, { steps: 5 }); await p.mouse.move(x1, y1, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(200);
  };
  // 函数机：点数字卡片喂 x，用 +10 / +1 / −1 把猜的数调到 g，点“看看”
  const feed = async (x, g) => {
    await tap('[data-fm="n' + x + '"]');
    let v = (await props('fmachine')).gv;
    while (g - v >= 10) { await tap('[data-fm="p10"]'); v += 10; }
    while (g > v) { await tap('[data-fm="p1"]'); v++; }
    while (g < v) { await tap('[data-fm="m1"]'); v--; }
    await tap('[data-fm="look"]');
  };

  console.log('函数机：这台机器里是什么规则？');
  await open('fm-times3');
  ok(await noChip(), '标题栏没有“✎ 填写 / ✎ 先猜”');
  await tap('[data-fm="n2"]'); let t = await text();
  ok(t.includes('盖着 ?') && t.includes('咕噜'), '点 2：喂进机器，出口先盖着');
  await shot('machine-feeding');
  await tap('[data-fm="p1"]'); await tap('[data-fm="look"]'); t = await text();
  ok(t.includes('上一个：2 → 6') && t.includes('你猜 3，差 3'), '猜 3 点“看看”：揭开是 6，差 3');
  for (const x of [1, 3, 5]) await feed(x, 3 * x);
  const pr = await props('fmachine'); ok(pr.tried === '2:3:6,1:3:3,3:9:9,5:15:15', '喂了 2、1、3、5，后三次猜对');
  t = await text(); ok(t.indexOf('|1|') >= 0 && t.indexOf('|1|') < t.indexOf('|2|') && t.indexOf('|2|') < t.indexOf('|3|'), '喂过的数自动从小到大排成表');
  await tap('[data-pick-k="hyp"][data-pick-v="1"]');
  ok(await goal(), '点“× 3”：题做完了');
  await shot('machine-solved');

  console.log('函数机：只喂 0 和 1，会被骗');
  await open('fm-cheat');
  await feed(0, 1); await feed(1, 3); await tap('[data-pick-k="hyp"][data-pick-v="2"]');
  ok((await text()).includes('你试过的都对得上，但喂 2'), '点“× 2 + 1”：机器指出喂 2 就不一样');
  for (const x of [2, 3, 4]) await feed(x, x * x + x + 1);
  await tap('[data-pick-k="hyp"][data-pick-v="3"]');
  ok(await goal(), '喂 2、3、4 都猜对，点“x² + x + 1”：做完了');

  console.log('函数机四联动：水箱注水');
  await open('fm-tank');
  ok(await noChip(), '四联动也没有“✎ 填写”');
  await tap('[data-fm="story1"]'); ok((await props('fmachine')).story === 1, '点“买东西”：情境换了'); await tap('[data-fm="story0"]');
  await tap('[data-fm="kp"]'); await tap('[data-fm="kp"]'); ok((await props('fmachine')).k === 3, 'k 的“+”点两下：k = 3');
  const g = await p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'fmachine'), c = { props: e.props, w: UI.Stage && UI.StageCtx ? UI.StageCtx.geom(e).w : 380 }; return U.types.fmachine.grips(c).map((q) => [q.id, q.x, q.y]); });
  const gb = g.find((q) => q[0] === 'b'), ppu = 116 / 50;
  await drag([gb[1], gb[2]], [gb[1], gb[2] - 5 * ppu]);
  const q2 = await props('fmachine'); ok(q2.b === 5 && q2.y0 === 5 && q2.y1 === 8, '把图上 x = 0 的点往上拖到 5：b = 5，表格跟着变');
  ok(await goal(), 'k = 3、b = 5：做完了');
  await shot('linked');

  console.log('函数机四联动：正比例');
  await open('fm-proportional');
  for (let i = 0; i < 5; i++) await tap('[data-fm="bm"]');
  ok((await props('fmachine')).b === 0 && (await goal()), 'b 的“−”点 5 下：b = 0，是正比例');

  console.log('猜规则台');
  await open('gr-even');
  ok(await noChip(), '没有“✎ 填写”');
  for (const i of [1, 2, 3]) { await tap('[data-pick-k="ex"][data-pick-v="' + i + '"]'); await tap('[data-pick-k="gs"][data-pick-v="1"]'); }
  await tap('[data-pick-k="hyp"][data-pick-v="1"]'); ok(await goal(), '点 1、2、3 各猜一次，点猜想：做完了');

  console.log('总是有时从不');
  await open('asn-perim');
  ok(await noChip(), '没有“✎ 填写”');
  for (const k of ['6,6', '4,8', '1,11', '2,10', '5,7']) await tap('[data-asn="' + k + '"]');
  t = await text(); ok(t.includes('试过 5 个：成立 1，不成立 4'), '在方格表里点 5 对：成立 1，不成立 4');
  await shot('asn');
  await tap('[data-pick-k="guess"][data-pick-v="2"]'); ok(await goal(), '点“有时”：做完了');

  console.log('换一种运算');
  await open('nw-sub');
  ok(await noChip(), '没有“✎ 填写”');
  await tap('[data-nw="c1-2"]'); ok((await props('newop')).tried === '1,2', '点表里 1 − 2 那一格：试交换律');
  for (const a of [0, 1, 2]) await tap('[data-nw="t' + a + '"]');
  ok((await props('newop')).tried === '1,2;0,1,2', '点 0、1、2：试结合律');
  for (const k of ['qc', 'qa', 'qi', 'qv']) await tap('[data-pick-k="' + k + '"][data-pick-v="2"]');
  ok(await goal(), '四个都答“否”：做完了');
  await shot('newop');

  console.log('两种解法对照');
  await open('tw-hunt');
  ok(await noChip(), '没有“✎ 填写”');
  const plan = await p.evaluate(() => { const T = U.TwoWays, sc = T.SCN[0]; return [0, 1, 2, 3].map((l) => { const r = [0, 1, 2, 3].find((r) => T.NS.every((n) => sc.lv[l](n) === sc.rv[r](n))); return [l + 1, sc.perm.indexOf(r) + 1]; }); });
  for (const [l, r] of plan) { await tap('[data-pick-k="lp"][data-pick-v="' + l + '"]'); await tap('[data-pick-k="rp"][data-pick-v="' + r + '"]'); }
  const nn = (await props('twoways')).n; await tap('[data-pick-k="n"][data-pick-v="' + (nn + 1) + '"]');
  await tap('[data-pick-k="disc"][data-pick-v="1"]'); ok(await goal(), '连好 4 对、换个 n、选“数是一样的”：做完了');

  console.log('树状图');
  await open('pt-coin');
  ok(await noChip(), '没有“✎ 先猜”');
  ok((await text()).includes('在下面一排里点一个'), '没猜时：卡片上写着在下面一排里点');
  await tap('[data-pt="g6"]'); ok((await props('ptree')).gans === '1/2', '点“1/2”：猜好了');
  await tap('[data-pt="v1"]'); ok((await props('ptree')).view === 1, '点“面积”：换看法');
  await tap('[data-pick-k="tg"][data-pick-v="2"]'); await tap('[data-pick-k="tg"][data-pick-v="3"]');
  ok(await goal(), '点“正反”“反正”两条路径：做完了');
  await shot('ptree');

  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  await b.close(); console.log('\n全部在卡片上操作（函数机一组）：' + pass + ' 通过，' + fail + ' 失败'); process.exit(fail ? 1 : 0);
})();
