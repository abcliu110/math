/* node tests/ui-oncard-gm.js —— 游戏一组（汉诺塔、取石子、一笔画、展开图、小方块、质因数积木）全在卡片上操作：
 *   开题，用真实鼠标点卡片上的按钮、柱子、格子、积木做完题；全程不打开属性面板，卡片标题栏不出现“✎ 填写 / ✎ 先猜”。
 *   截图存到 scratchpad（SHOT_DIR 环境变量，没有就存 tests/shots），文件名带 gm- 前缀。 */
'use strict';
const path = require('path');
(async () => {
  const H = await require('./bench-harness.js')('hanoi'), p = H.p;
  const dir = process.env.SHOT_DIR || path.join(__dirname, 'shots');
  const closeDlg = () => p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
  // 点卡片上设 k = v 的那块（真实鼠标）
  const cl = async (k, v) => {
    const loc = p.locator('.card svg.bdy [data-pick-k="' + k + '"][data-pick-v="' + v + '"]').first();
    await closeDlg(); try { await loc.click({ timeout: 2500 }); } catch (e) { await closeDlg(); await loc.click(); }
    await p.waitForTimeout(60);
  };
  const props = () => p.evaluate(() => Object.assign({}, Object.values(UI.S.scene.entities)[0].props));
  const noChip = () => p.evaluate(() => !document.querySelector('.card [data-card-insp]'));
  const shot = async (name) => { const c = p.locator('.card').first(); await c.screenshot({ path: path.join(dir, 'gm-' + name + '.png') }); };
  const hanoiMoves = (n, a, b, c, out) => { if (!n) return out; hanoiMoves(n - 1, a, c, b, out); out.push([a, c]); hanoiMoves(n - 1, b, a, c, out); return out; };
  const move = async (n) => { for (const [a, c] of hanoiMoves(n, 1, 2, 3, [])) { await cl('mv', a); await cl('mv', c); } };

  console.log('汉诺塔：先猜最少几步（−10、−、+、+10、看看），再搬');
  await H.open('hn-3'); H.ok(await noChip(), '标题栏没有“✎ 填写 / ✎ 先猜”');
  await cl('gd', 10); await cl('gd', 9); await cl('gd', 8); await cl('gd', 7); await shot('hanoi-guess');
  H.ok((await H.text()).includes('先猜：3 个盘最少几步') && (await props()).gd === 7, '卡片上调到 7，最少步数还盖着');
  await cl('gmin', 7); H.ok((await H.text()).includes('猜对了'), '点“看看”：猜对了');
  await move(3); H.ok(await H.done('opt'), '7 步搬完：用最少的步数');

  console.log('汉诺塔：换盘数、搬完“记进表里”，填满 1 到 4 个盘');
  await H.open('hn-table');
  await cl('n', 2); await cl('n', 1);
  for (let n = 1; n <= 4; n++) {
    if (n > 1) await cl('n', n);
    await move(n); await cl('rec', 1);
    H.ok((await props())['t' + n] === 2 ** n - 1, n + ' 个盘搬完，记进表里：' + (2 ** n - 1) + ' 步');
  }
  await shot('hanoi-table'); H.ok(await H.done('tab'), '表里 1 到 4 个盘都对了');
  await cl('t4', 16); await cl('t4', 15); H.ok((await props()).t4 === 15, '表里的格子也能用 − / + 直接调');

  console.log('取石子：换成“最厉害”的电脑，先猜，连赢 3 局');
  await H.open('nim-10-2'); H.ok(await noChip(), '标题栏没有“✎ 填写”');
  await cl('level', 2); H.ok((await props()).level === 2 && (await H.text()).includes('最厉害'), '点“电脑：会走错 ▸”：换成最厉害');
  await cl('gwin', 1); H.ok((await props()).gwin === 1, '先猜：点“能赢”');
  for (let g = 0; g < 3; g++) {
    await cl('go', 1);
    for (let i = 0; i < 12 && (await props()).phase === 1; i++) { const pl = (await props()).pile; await cl('take', pl % 3 === 0 ? 1 : pl % 3); }
  }
  await shot('nim'); H.ok(await H.done('streak'), '对最厉害的电脑连赢 3 局');

  console.log('取石子：调规则、填局面表');
  await H.open('nim-table');
  await cl('n', 13); await cl('n', 12); await cl('k', 4); await cl('k', 3);
  H.ok((await props()).n === 12 && (await props()).k === 3, '上面一排的 − / + 调石子数和每次最多取几颗');
  for (let i = 0; i <= 12; i++) { await cl('tm', i * 3 + 2); if (i % 4 === 0) await cl('tm', i * 3 + 3); }
  await cl('gwin', 1); await shot('nim-table'); H.ok(await H.done('full'), '点格子填满局面表：4 的倍数是必败');

  console.log('一笔画：先猜（能 / 不能）、走一遍、加边');
  await H.open('eu-ri'); H.ok(await noChip(), '标题栏没有“✎ 填写”');
  await cl('gposs', 1); H.ok((await H.text()).includes('猜对了'), '“日”字：点“能”，猜对了');
  const path0 = await p.evaluate(() => { const pr = Object.values(UI.S.scene.entities)[0].props, G = U.Games, g = G.GRAPHS[pr.graph]; return G.findPath(g.v.length, G.edgesOf(pr)); });
  for (const v of path0) await cl('go', v + 1);
  H.ok(await H.done('done'), '一笔画完');
  await H.open('eu-tian'); await cl('gposs', 2); H.ok(await H.done('judged'), '“田”字：点“不能”，判断对了');
  await H.open('eu-bridge'); await cl('mode', 1); H.ok((await props()).mode === 1, '点“加边”');
  await cl('go', 2); await cl('go', 3); await cl('showdeg', 1); await shot('euler'); H.ok(await H.done('ok'), '在两块陆地之间加一座桥：能一笔走通了');

  console.log('展开图：第一次点“能 / 不能”就是先猜');
  await H.open('sn-net-build'); H.ok(await noChip(), '标题栏没有“✎ 先猜”');
  for (const v of [2, 7, 8, 9, 10, 14]) await cl('cell', v);
  H.ok((await H.text()).includes('先猜：能折成正方体吗？'), '拼好以后：先猜，面还没标出来');
  await cl('say', 1); H.ok((await props()).gans === 1 && (await H.text()).includes('能折成正方体'), '点“能”：揭开，能折');
  H.ok(await H.done('fold'), '拼出了能折的展开图');
  await H.open('sn-net-all');
  const truth = await p.evaluate(() => U.SolidNet.HEX.map((c) => (U.SolidNet.fold(c).foldable ? 1 : 2)));
  for (let i = 0; i < 35; i++) { if (i) await cl('load', i + 1); await cl('say', truth[i]); }
  await shot('net'); H.ok(await H.done('all'), '35 种逐个点“能 / 不能”：全判对');

  console.log('小方块：先猜最少几块，再搭');
  await H.open('sn-cubes-min'); H.ok(await noChip(), '标题栏没有“✎ 先猜”');
  const R = await p.evaluate(() => { const pr = Object.values(UI.S.scene.entities)[0].props, SN = U.SolidNet, T = SN.views(SN.TGT[pr.tgt].split('').map(Number)), mn = SN.range(pr.tgt)[0];
    const cells = []; for (let i = 0; i < 16; i++) if (T.top[i]) cells.push(i);
    const cap = cells.map((i) => Math.min(T.front[i % 4], T.left[Math.floor(i / 4)])), a = new Array(16).fill(0); let sol = null;
    const rec = (k, v) => { if (sol) return; if (k === cells.length) { const V = SN.views(a); if (v === mn && V.front.join() === T.front.join() && V.left.join() === T.left.join()) sol = a.slice(); return; } for (let x = 1; x <= cap[k]; x++) { a[cells[k]] = x; rec(k + 1, v + x); } a[cells[k]] = 0; };
    rec(0, 0); return { mn, sol }; });
  for (let v = 1; v <= R.mn; v++) await cl('gd', v);
  await cl('gcnt', R.mn); H.ok((await H.text()).includes('猜对了'), '底板下面 + 调到 ' + R.mn + '，点“看看”：猜对了');
  for (let i = 0; i < 16; i++) for (let h = 1; h <= R.sol[i]; h++) await cl('put', i * 5 + h + 1);
  await shot('cubes'); H.ok(await H.done('min'), '点格子左半边加块：用最少的块数对上三视图');

  console.log('质因数积木：点积木拿掉、积木盒添一块、先猜因数个数');
  await H.open('pb-split-36'); H.ok(await noChip(), '标题栏没有“✎ 填写”');
  await cl('a', 36); H.ok(await H.done('four'), '给 12 添一块 3：36 是 4 块');
  await H.open('pb-gcd-24-36');
  for (const v of [2, 4, 12, 36]) await cl('b', v);
  await shot('primeblocks'); H.ok(await H.done('gcd') && await H.done('lcm'), '“加一摞 b”点 2、2、3、3：最大公因数 12、最小公倍数 72');
  await H.open('pb-count-divisors');
  for (let v = 1; v <= 9; v++) await cl('gd', v);
  await cl('guess', 9); H.ok(await H.done('hit'), '+ 调到 9，点“看看”：猜对了 36 有 9 个因数');
  await H.open('pb-twelve-divisors');
  await p.locator('.card svg.bdy [data-blk="a"][data-pick-v="12"]').first().click(); await p.waitForTimeout(80);
  await cl('a', 60); H.ok(await H.done('min'), '点积木 3 拿掉（36 → 12），再添一块 5：60 有 12 个因数');
  H.ok(await noChip(), '标题栏没有“✎ 填写”');
  await H.end('游戏一组（卡片上操作）');
})();
