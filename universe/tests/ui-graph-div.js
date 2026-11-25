/* node tests/ui-graph-div.js —— 分一分台的“记下来”：真实鼠标。
 *  1. 打开“画成图：每 5 个一份”：12 ÷ 5 = 2 …… 2；点“记下来”：图上一个橙点（商）、一个红点（余数）；
 *  2. 总数 + ，记下来，再 + ，记下来：3 个点；同一个总数不能记两次；
 *  3. 再 + 到 15：圈和算式藏起来（12 ÷ 5 = ？ …… ？），把手也没了；点“猜余数 0”，揭开 15 ÷ 5 = 3，记下来：猜对 1 次；
 *     16 先点“不猜，直接看”，记下来不算猜；17 猜对、18 猜错：猜了 3 次，猜对 2 次；
 *  4. 全部试一遍：1 到 20 都画上浅色；拖把手改成每份 4 个：图上只留每份 4 个的点（0 个）；
 *  5. 改回 5，回答两个追问，五个里程碑都完成；不开图的老题没有图；没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('groupbench');
  const p = H.p, SP = process.env.SHOT_DIR;
  const eq = () => H.read('[data-eq]');
  const plus = () => H.byTitle('总数多 1'), rec = () => H.byTitle('把这个总数记到图上');

  console.log('1. 第一个点');
  await H.open('gr-div-5');
  H.ok(/12 ÷ 5 = 2 …… 2/.test(await eq()) && /再记 3 个/.test(await H.text()), '12 ÷ 5 = 2 …… 2，图上写着“再记 3 个”');
  await rec();
  H.ok(await H.out('pts') === '1' && await p.locator('.card svg.bdy circle[fill="#f5a25d"]').count() === 1 && await p.locator('.card svg.bdy rect[fill="#e0645a"]').count() === 1, '记下来：一个橙点、一个红点');

  console.log('2. 再记两个');
  await plus(); await rec(); await plus(); await rec();
  H.ok(await H.out('pts') === '3' && await H.done('three'), '13、14 也记了：3 个点（里程碑）');
  H.ok(await p.locator('.card svg.bdy g[data-off] title', { hasText: '这个总数已经记过了' }).count() === 1, '14 已经记过：“记下来”是灰的');

  console.log('3. 先猜再看');
  await plus();
  H.ok(/15 ÷ 5 = ？ …… ？/.test(await eq()) && await p.locator('.card svg.bdy [data-grip]').count() === 0, '15：圈和算式藏起来了，把手也收起来');
  await H.byTitle('猜余数 0');
  H.ok(/15 ÷ 5 = 3/.test(await eq()) && /你猜余数 0，猜对了/.test(await H.text()), '猜余数 0：揭开 15 ÷ 5 = 3，猜对了');
  if (SP) await p.locator('.card').first().screenshot({ path: SP + '/gd-guess.png' });
  await rec();
  H.ok(await H.out('gtry') === '1' && await H.out('gok') === '1', '记下来：猜了 1 次，猜对 1 次');
  await plus(); await H.byTitle('不猜，直接看'); await rec();
  H.ok(await H.out('gtry') === '1' && await H.out('pts') === '5', '16 不猜直接看，记下来不算猜：还是猜了 1 次；5 个点');
  await plus(); await H.byTitle('猜余数 2'); H.ok(/猜对了/.test(await H.text()), '17 猜余数 2：猜对'); await rec();
  await plus(); await H.byTitle('猜余数 4'); H.ok(/其实是 3/.test(await H.text()), '18 猜余数 4：其实是 3'); await rec();
  H.ok(await H.out('gtry') === '3' && await H.out('gok') === '2' && await H.done('guess'), '猜了 3 次，猜对 2 次（里程碑）');

  console.log('4. 全部试一遍、换每份几个');
  await H.byTitle('每个总数都画上');
  H.ok(await H.out('all') === '1' && await p.locator('.card svg.bdy circle[fill="#efc08a"]').count() === 20 && await H.done('all'), '全部试一遍：1 到 20 都画上浅色的点（里程碑）');
  const g = await p.evaluate(() => { const e = document.querySelector('.card svg.bdy [data-grip="g"]'); return !!e; });
  H.ok(g, '揭开以后把手回来了');
  const sx = (n) => 40 + (n - 1) * (420 - 40) / 19;
  await H.drag([sx(5), 340], [sx(4), 340]);
  H.ok((await H.props()).g === 4 && await H.out('pts') === '0', '拖成每份 4 个：图上只留每份 4 个的点（0 个）');
  await H.drag([sx(4), 340], [sx(5), 340]);
  H.ok(await H.out('pts') === '7', '改回 5：7 个点又回来了');

  console.log('5. 追问');
  const bottomOk = () => p.evaluate(() => { const c = document.querySelector('.card').getBoundingClientRect(), f = Array.from(document.querySelectorAll('.fab')).map((x) => x.getBoundingClientRect().top).filter((t) => t > innerHeight / 2); return c.bottom <= Math.min.apply(null, f.concat([innerHeight])); });
  H.ok(await bottomOk(), '整张卡片在按钮栏上面，追问看得见（没点“适应”）');
  await H.press('4，比每份的 5 少 1'); await H.byTitle('1');
  H.ok((await Promise.all(['three', 'guess', 'all', 'q1', 'q2'].map(H.done))).every(Boolean), '两个追问答对，五个里程碑都完成');
  if (SP) await p.locator('.card').first().screenshot({ path: SP + '/gd-done.png' });
  const old = await p.evaluate(() => U.problems.find((x) => (x.shelf || [])[0] === 'groupbench' && x.id !== 'gr-div-5').id);
  await H.open(old);
  H.ok(!/记下来/.test(await H.text()), '老题 ' + old + ' 没有图');
  await H.end('分一分的图');
})();
