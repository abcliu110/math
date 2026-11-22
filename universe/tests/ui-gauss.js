/* node tests/ui-gauss.js —— 高斯求和：真实鼠标测试。
 *  1. 1 + 2 + … + 100：还没配对时没有“和”；点“倒过来写一行”“上下对齐相加”：每列 101，和 5050；
 *  2. 1 + 3 + … + 19：点“每次多加 1”、一个一个“多一个数”到 10 个，最后一个是 19；配对：和 100；
 *  3. 改个数会把配对收回去（要重新对齐看）；全程没有打开属性面板、没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('gaussbench');
  console.log('1. 1 加到 100');
  await H.open('gs-1-100');
  H.ok(await H.out('total') === null && await H.out('last') === '100', '开始：最后一个是 100，还没有“和”');
  await H.byTitle('把这串数倒过来写在下面');
  H.ok(await H.out('total') === null && (await H.text()).includes('倒着'), '倒过来写了一行：还要对齐相加');
  await H.byTitle('上下两个数加起来');
  H.ok(await H.out('ps') === '101' && await H.out('total') === '5050' && (await H.read()).includes('= 5050') && await H.done('t'), '对齐相加：每列 101，和 5050');
  console.log('2. 奇数的和');
  await H.open('gs-odd');
  await H.byTitle('每次多加 1');
  for (let i = 0; i < 8; i++) await H.byTitle('多一个数');
  H.ok(await H.out('n') === '10' && await H.out('last') === '19' && await H.done('l'), '每次加 2、10 个数：最后一个是 19');
  await H.byTitle('把这串数倒过来写在下面'); await H.byTitle('上下两个数加起来');
  H.ok(await H.out('total') === '100' && await H.done('t'), '配对：每列 20，和 100');
  console.log('3. 改个数要重新对齐');
  await H.byTitle('多一个数');
  H.ok(await H.out('total') === null && (await H.props()).flip === true, '多一个数：配对收回去了（倒着的一行还在），要重新对齐');
  await H.end('高斯求和');
})();
