/* node tests/ui-tree.js —— 枚举树：真实鼠标测试。
 *  1. 1、2、3 排三位数：展开一枝看到 123、132；三枝都展开才有“一共 6 种”，写成 2 × 3；
 *  2. 0、1、2、3 排两位数：0 那一枝整枝剪掉，一共 9 个；
 *  3. 只要双数：单数划掉，每枝不一样多，2 + 1 + 2 + 1 = 6；
 *  4. 凑 10 元：先定 5 元用几张，6 + 3 + 1 = 10；“多 1 元”会把展开收回去；全程没有打开属性面板、没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('treebench');
  console.log('1. 排三位数');
  await H.open('tr-123');
  H.ok(await H.out('count') === null && await H.out('rows') === '3', '开始：3 枝，还没展开，没有“一共”');
  await H.byTitle('展开下一枝');
  const t1 = await H.text();
  H.ok(await H.out('seen') === '2' && t1.includes('123') && t1.includes('132') && await H.out('count') === null, '展开第一枝：123、132，还没全部展开');
  await H.byTitle('展开下一枝'); await H.byTitle('展开下一枝');
  H.ok(await H.out('count') === '6' && (await H.text()).includes('2 × 3 = 6') && await H.done('c'), '三枝都展开：每枝 2 个，2 × 3 = 6');
  console.log('2. 带 0 的卡片');
  await H.open('tr-0123');
  await H.byTitle('展开下一枝');
  H.ok((await H.text()).includes('0 不能打头') && await H.out('seen') === '0', '0 那一枝整枝剪掉');
  for (let i = 0; i < 3; i++) await H.byTitle('展开下一枝');
  H.ok(await H.out('count') === '9' && await H.done('c'), '一共 9 个（不是 12 个）');
  console.log('3. 只要双数');
  await H.open('tr-even');
  for (let i = 0; i < 4; i++) await H.byTitle('展开下一枝');
  H.ok(await H.out('count') === '6' && (await H.text()).includes('2 + 1 + 2 + 1 = 6') && await H.done('c'), '单数划掉：每枝不一样多，加起来 6 个');
  console.log('4. 凑 10 元');
  await H.open('tr-coins-10');
  for (let i = 0; i < 3; i++) await H.byTitle('展开下一枝');
  H.ok(await H.out('count') === '10' && (await H.text()).includes('6 + 3 + 1 = 10') && await H.done('c'), '5 元 0、1、2 张：6 + 3 + 1 = 10 种');
  await H.byTitle('多 1 元');
  H.ok(await H.out('count') === null && (await H.props()).amt === 11 && (await H.props()).open === 0, '多 1 元：展开收回去，要重新列');
  await H.end('枚举树');
})();
