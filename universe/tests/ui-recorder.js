/* node tests/ui-recorder.js —— 通用记录仪（js/core/recorder.js）：真实鼠标，在高斯求和台上走完一遍。高斯求和台自己没有图，题目开了记录仪。
 *  1. 打开“画成图：1 + 2 + … + n”：没算出和时“记下来”是灰的；倒过来写、对齐相加，和是 10，记下来：图上一个点；
 *  2. 个数 + 到 5、6（旋钮一拧，台面的“对齐相加”复位），各算一次、记下来：3 个点；
 *  3. + 到 7：台面盖上“先猜一猜”，点台面上的按钮点不到，和也读不到；猜和 28，盖子揭开，算出来：猜对了，记下来；
 *     8 “不猜，直接看”，记下来不算猜；9 猜 45 对、10 猜 45 错（其实是 55）：猜了 3 次，猜对 2 次；
 *  4. 全部试一遍：个数 2 到 12 都画上浅色的点；台面上“第一个数”改成 2：图上只留这一组的点（0 个），改回 1：7 个点又回来了；
 *  5. 卡片底边在按钮栏上面；回答两个追问，五个里程碑都完成；不开记录仪的老题 gs-1-100 没有图；没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('gaussbench');
  const p = H.p, SP = process.env.SHOT_DIR;
  const rec = () => H.byTitle('把这个个数记到图上'), plus = () => H.byTitle('个数多 1');
  const pair = async () => { if (!(await H.props()).flip) await H.byTitle('把这串数倒过来写在下面'); await H.byTitle('上下两个数加起来'); };
  const dots = () => p.locator('.card svg.bdy g[data-rec-pt]').count();
  const cover = () => p.locator('.card svg.bdy g[data-rec-cover]').count();
  const card = () => p.locator('.card').first();

  console.log('1. 第一个点');
  await H.open('gr-gauss-n');
  H.ok(await p.locator('.card svg.bdy g[data-off] title', { hasText: '先在台面上做出来，才知道和' }).count() === 1 && /再记 3 个/.test(await H.text()), '还没算出和：“记下来”是灰的，图上写着“再记 3 个”');
  await pair();
  H.ok(await H.out('total') === '10', '倒过来写、对齐相加：1 + 2 + 3 + 4 = 10');
  await rec();
  H.ok(await H.out('pts') === '1' && await dots() === 1, '记下来：图上一个点');

  console.log('2. 再记两个');
  await plus();
  H.ok((await H.props()).n === 5 && (await H.props()).pair === false && await H.out('total') === null, '个数 + 到 5：台面的“对齐相加”复位，和先没有');
  await pair(); await rec(); await plus(); await pair(); await rec();
  H.ok(await H.out('pts') === '3' && await H.done('three'), '5、6 也记了：3 个点（里程碑）');
  H.ok(await p.locator('.card svg.bdy g[data-off] title', { hasText: '这个个数已经记过了' }).count() === 1, '6 已经记过：“记下来”是灰的');

  console.log('3. 先猜再看');
  await plus();
  H.ok(await cover() === 1 && /先猜一猜/.test(await H.text()), '个数 7：台面盖上“先猜一猜”');
  const blocked = await p.evaluate(() => { const g = Array.from(document.querySelectorAll('.card svg.bdy g[data-pick-set] title')).find((t) => t.textContent === '把这串数倒过来写在下面' || t.textContent === '上下两个数加起来'); if (!g) return 'none'; const r = g.parentNode.getBoundingClientRect(), el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!(el && el.closest('[data-rec-cover]')); });
  H.ok(blocked === true, '台面上的按钮被盖住了，点不到');
  H.ok(await H.out('total') === null && await p.locator('.card .grip').count() === 0, '和读不到（输出口也不给）');
  if (SP) await card().screenshot({ path: SP + '/rec-cover.png' });
  await H.byTitle('猜和 28');
  H.ok(await cover() === 0 && /你猜和 28：在台面上做出来看看/.test(await H.text()), '猜和 28：盖子揭开，“在台面上做出来看看”');
  await pair();
  H.ok(await H.out('total') === '28' && /你猜和 28，猜对了/.test(await H.text()), '算出来：和 28，猜对了');
  if (SP) await card().screenshot({ path: SP + '/rec-guess.png' });
  await rec();
  H.ok(await H.out('gtry') === '1' && await H.out('gok') === '1' && await dots() === 4, '记下来：猜了 1 次，猜对 1 次；4 个点');
  await plus(); await H.byTitle('不猜，直接看'); await pair(); await rec();
  H.ok(await H.out('gtry') === '1' && await H.out('pts') === '5', '8 不猜直接看，记下来不算猜：还是猜了 1 次；5 个点');
  await plus(); await H.byTitle('猜和 45'); await pair(); H.ok(/猜对了/.test(await H.text()), '9 猜 45：猜对'); await rec();
  await plus(); await H.byTitle('猜和 45'); await pair(); H.ok(/其实是 55/.test(await H.text()), '10 猜 45：其实是 55'); await rec();
  H.ok(await H.out('gtry') === '3' && await H.out('gok') === '2' && await H.done('guess'), '猜了 3 次，猜对 2 次（里程碑）');

  console.log('4. 全部试一遍、换一组');
  await H.byTitle('每个个数都画上');
  H.ok(await H.out('all') === '1' && await p.locator('.card svg.bdy circle[fill="#9cc3ee"]').count() === 11 && await H.done('all'), '全部试一遍：个数 2 到 12 都画上浅色的点（里程碑）');
  await H.byTitle('第一个数大 1');
  H.ok((await H.props()).a === 2 && await H.out('pts') === '0' && await dots() === 0, '第一个数改成 2：图上只留这一组的点（0 个）');
  await H.byTitle('第一个数小 1');
  H.ok(await H.out('pts') === '7' && await dots() === 7, '改回 1：7 个点又回来了（记录没丢）');

  console.log('5. 追问');
  const bottomOk = () => p.evaluate(() => { const c = document.querySelector('.card').getBoundingClientRect(), f = Array.from(document.querySelectorAll('.fab')).map((x) => x.getBoundingClientRect().top).filter((t) => t > innerHeight / 2); return c.bottom <= Math.min.apply(null, f.concat([innerHeight])); });
  H.ok(await bottomOk(), '整张卡片在按钮栏上面，追问看得见（没点“适应”）');
  await H.press('多的就是新加的那个数，一次比一次多'); await H.press('往上弯的线：越往右越陡');
  H.ok((await Promise.all(['three', 'guess', 'all', 'q1', 'q2'].map(H.done))).every(Boolean), '两个追问答对，五个里程碑都完成');
  if (SP) await card().screenshot({ path: SP + '/rec-done.png' });
  await H.open('gs-1-100');
  H.ok(!/记下来/.test(await H.text()) && await p.locator('.card svg.bdy g[data-rec-knob]').count() === 0, '不开记录仪的老题 gs-1-100 没有图');
  await H.end('通用记录仪');
})();
