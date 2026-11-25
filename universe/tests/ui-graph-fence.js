/* node tests/ui-graph-fence.js —— 篱笆围地（面积推导台）的“记下来”：真实鼠标。
 *  1. 打开“画成图：20 米篱笆”：长 2、宽 8、面积 16；点“记下来”：图上一个点；
 *  2. 拖到长 3、长 4，各记一次：3 个点；同一个长不能记两次；
 *  3. 拖到长 6：面积藏起来（6 × 4 = ？）；点“猜面积 24”，揭开，记下来：猜对 1 次；
 *     长 7 先点“不猜，直接看”，记下来不算猜；长 8 猜 16 对、长 9 猜 16 错：猜了 3 次，猜对 2 次；
 *  4. 全部试一遍：长 1 到 9 都画上浅色的点；
 *  5. 回答两个追问，五个里程碑都完成；不开图的老题 ar-fence-20 没有图；没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('areabench');
  const p = H.p, SP = process.env.SHOT_DIR;
  const rec = () => H.byTitle('把这个长记到图上');
  const X = (u) => 40 + u * 22, Y = (v) => 290 - v * 22;
  const toLen = async (n) => { const q = await H.props(), h = 10 - q.w; await H.drag([X(q.w), Y(Math.min(h, 8) / 2)], [X(n), Y(Math.min(h, 8) / 2)]); };
  const dots = () => p.locator('.card svg.bdy circle[r="5"]').count();

  console.log('1. 第一个点');
  await H.open('gr-fence-20');
  H.ok(/面积 = 2 × 8 = 16 平方米/.test(await H.text()) && /再记 3 个/.test(await H.text()), '长 2：面积 16，图上写着“再记 3 个”');
  await rec();
  H.ok(await H.out('pts') === '1' && await dots() === 1, '记下来：图上一个点');

  console.log('2. 再记两个');
  await toLen(3); H.ok((await H.props()).w === 3, '拖到长 3'); await rec();
  await toLen(4); await rec();
  H.ok(await H.out('pts') === '3' && await H.done('three'), '长 3、长 4 也记了：3 个点（里程碑）');
  H.ok(await p.locator('.card svg.bdy g[data-off] title', { hasText: '这个长已经记过了' }).count() === 1, '长 4 已经记过：“记下来”是灰的');

  console.log('3. 先猜再看');
  await toLen(6);
  H.ok(/面积 = 6 × 4 = ？/.test(await H.text()) && !/24 平方米/.test(await H.text()), '长 6：面积藏起来了');
  if (SP) await p.locator('.card').first().screenshot({ path: SP + '/gf-hidden.png' });
  await H.byTitle('猜面积 24');
  H.ok(/6 × 4 = 24 平方米/.test(await H.text()) && /你猜面积 24，猜对了/.test(await H.text()), '猜面积 24：揭开，猜对了');
  if (SP) await p.locator('.card').first().screenshot({ path: SP + '/gf-guess.png' });
  await rec();
  H.ok(await H.out('gtry') === '1' && await H.out('gok') === '1', '记下来：猜了 1 次，猜对 1 次');
  await toLen(7); await H.byTitle('不猜，直接看'); await rec();
  H.ok(await H.out('gtry') === '1' && await H.out('pts') === '5', '长 7 不猜直接看，记下来不算猜：还是猜了 1 次；5 个点');
  await toLen(8); await H.byTitle('猜面积 16'); H.ok(/猜对了/.test(await H.text()), '长 8 猜 16：猜对'); await rec();
  await toLen(9); await H.byTitle('猜面积 16'); H.ok(/其实是 9/.test(await H.text()), '长 9 猜 16：其实是 9'); await rec();
  H.ok(await H.out('gtry') === '3' && await H.out('gok') === '2' && await H.done('guess'), '猜了 3 次，猜对 2 次（里程碑）');

  console.log('4. 全部试一遍');
  await H.byTitle('每个长都画上');
  H.ok(await H.out('all') === '1' && await p.locator('.card svg.bdy circle[fill="#9cc3ee"]').count() === 9 && await H.done('all'), '全部试一遍：长 1 到 9 都画上浅色的点（里程碑）');

  console.log('5. 追问');
  await p.locator('button', { hasText: /^适应$/ }).first().click(); await p.waitForTimeout(250);
  await H.press('一样长，围成正方形'); await H.press('一样大');
  H.ok((await Promise.all(['three', 'guess', 'all', 'q1', 'q2'].map(H.done))).every(Boolean), '两个追问答对，五个里程碑都完成');
  if (SP) await p.locator('.card').first().screenshot({ path: SP + '/gf-done.png' });
  await H.open('ar-fence-20');
  H.ok(!/记下来/.test(await H.text()) && /记下这一种/.test(await H.text()), '老题 ar-fence-20 没有图，还是“记下这一种”');
  await H.end('篱笆的图');
})();
