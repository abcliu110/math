/* node tests/ui-graph-box.js —— 分一分台“平均分给几份”的“记下来”：真实鼠标。
 *  1. 打开“画成图：3 个盒子”：7 个，没放完时“记下来”是灰的；全放完：最多的盒子 3 个，记下来：图上一个点；
 *  2. 总数 + 到 8、9，各放完、记下来：3 个点；
 *  3. + 到 10：放的按钮锁住了；猜 4 个，按钮解开，放完：猜对了，记下来；11 “不猜，直接看”，记下来不算猜；
 *     12 猜 4 对、13 猜 4 错（其实是 5）：猜了 3 次，猜对 2 次；
 *  4. 全部试一遍：1 到 20 都画上浅色；盒子改成 4 个：图上只留 4 个盒子的点（0 个）；
 *  5. 改回 3 个，回答两个追问，五个里程碑都完成；不开图的老题没有图；没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('groupbench');
  const p = H.p, SP = process.env.SHOT_DIR;
  const plus = () => H.byTitle('总数多 1'), rec = () => H.byTitle('把这个总数记到图上'), all = () => H.byTitle('一直轮流放，直到放完');
  const dots = () => p.locator('.card svg.bdy circle[fill="#f5a25d"]').count();

  console.log('1. 第一个点');
  await H.open('gr-box-3');
  H.ok(await p.locator('.card svg.bdy g[data-off] title', { hasText: '先全放完，才知道最多的盒子有几个' }).count() === 1 && /再记 3 个/.test(await H.text()), '没放完：“记下来”是灰的，图上写着“再记 3 个”');
  await all();
  H.ok(await H.out('max') === '3', '7 个全放完：最多的盒子 3 个');
  await rec();
  H.ok(await H.out('pts') === '1' && await dots() === 1, '记下来：图上一个点');

  console.log('2. 再记两个');
  await plus(); await all(); await rec(); await plus(); await all(); await rec();
  H.ok(await H.out('pts') === '3' && await H.done('three'), '8、9 也记了：3 个点（里程碑）');

  console.log('3. 先猜再放');
  await plus();
  H.ok(await p.locator('.card svg.bdy g[data-off] title', { hasText: '先在下面的图上猜最多的盒子有几个' }).count() === 3, '10：放一个、放一轮、全放完都锁住了');
  await H.byTitle('猜最多的盒子 4 个');
  H.ok(/你猜 4 个：放完看看/.test(await H.text()), '猜 4 个：按钮解开，“放完看看”');
  await all();
  H.ok(await H.out('max') === '4' && /你猜 4，猜对了/.test(await H.text()), '全放完：最多 4 个，猜对了');
  if (SP) await p.locator('.card').first().screenshot({ path: SP + '/gb-guess.png' });
  await rec();
  H.ok(await H.out('gtry') === '1' && await H.out('gok') === '1', '记下来：猜了 1 次，猜对 1 次');
  await plus(); await H.byTitle('不猜，直接看'); await all(); await rec();
  H.ok(await H.out('gtry') === '1' && await H.out('pts') === '5', '11 不猜直接看，记下来不算猜：还是猜了 1 次；5 个点');
  await plus(); await H.byTitle('猜最多的盒子 4 个'); await all(); H.ok(/猜对了/.test(await H.text()), '12 猜 4：猜对'); await rec();
  await plus(); await H.byTitle('猜最多的盒子 4 个'); await all(); H.ok(/其实是 5/.test(await H.text()), '13 猜 4：其实是 5'); await rec();
  H.ok(await H.out('gtry') === '3' && await H.out('gok') === '2' && await H.done('guess'), '猜了 3 次，猜对 2 次（里程碑）');

  console.log('4. 全部试一遍、换盒子数');
  await H.byTitle('每个总数都画上');
  H.ok(await H.out('all') === '1' && await p.locator('.card svg.bdy circle[fill="#efc08a"]').count() === 20 && await H.done('all'), '全部试一遍：1 到 20 都画上浅色的点（里程碑）');
  await H.byTitle('多一个盒子');
  H.ok((await H.props()).k === 4 && await H.out('pts') === '0', '盒子改成 4 个：图上只留 4 个盒子的点（0 个）');
  await H.byTitle('少一个盒子');
  H.ok(await H.out('pts') === '7', '改回 3 个：7 个点又回来了');

  console.log('5. 追问');
  const bottomOk = () => p.evaluate(() => { const c = document.querySelector('.card').getBoundingClientRect(), f = Array.from(document.querySelectorAll('.fab')).map((x) => x.getBoundingClientRect().top).filter((t) => t > innerHeight / 2); return c.bottom <= Math.min.apply(null, f.concat([innerHeight])); });
  H.ok(await bottomOk(), '整张卡片在按钮栏上面，追问看得见（没点“适应”）');
  await H.press('1 个'); await H.press('4 个：10 ÷ 3 = 3 …… 1，商再加 1');
  H.ok((await Promise.all(['three', 'guess', 'all', 'q1', 'q2'].map(H.done))).every(Boolean), '两个追问答对，五个里程碑都完成');
  if (SP) await p.locator('.card').first().screenshot({ path: SP + '/gb-done.png' });
  await p.locator('#zin').click(); await p.locator('#zin').click(); await p.waitForTimeout(150);
  const z1 = await p.evaluate(() => UI.S.view.z); await H.byTitle('总数多 1');
  H.ok(await p.evaluate(() => UI.S.view.z) === z1 && await p.evaluate(() => UI.S.viewAuto) === false, '手动放大以后：再点按钮，台面不自己缩回去');
  await H.open('g6-pigeon-core');
  H.ok(!/记下来/.test(await H.text()), '老题 g6-pigeon-core 没有图');
  await H.end('平均分的图');
})();
