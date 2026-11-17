/* node tests/ui-frac2.js —— 分数运算台：真实鼠标测试。
 *  1. 1/2 + 1/3：格子不一样大，“合起来”按不了；上 ×3、下 ×2 以后都是 1/6，合起来 5/6；
 *  2. 1/6 + 1/3：合起来 3/6，点“约分 ÷3”：1/2，最简；
 *  3. 4 ÷ 1/3：量 12 次，商 12；3/4 ÷ 1/2：量 2 次，最后一段是量尺的 1/2，商 3/2；
 *  4. 3/5 的倒数：翻过来 5/3；
 *  5. 全程没有打开属性面板。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('fracbench');
  const off = (label) => H.p.locator('.card svg.bdy g[data-pick-set]').filter({ hasText: label }).count();
  console.log('1. 通分');
  await H.open('fa-add');
  H.ok(await off('合起来') === 0 && (await H.text()).includes('格子大小不一样'), '格子不一样大：“合起来”按不了，写出为什么');
  await H.press('上 ×3'); await H.press('下 ×2');
  H.ok(await H.out('common') === '6' && await H.done('common'), '上 ×3、下 ×2：都是 1/6 一格');
  await H.press('合起来');
  H.ok(await H.out('result') === '5/6' && (await H.read()).includes('= 3/6 + 2/6 = 5/6'), '合起来：5/6');
  console.log('2. 约分');
  await H.open('fr-reduce');
  await H.press('下 ×2'); await H.press('合起来');
  H.ok(await H.out('lowest') === null && (await H.read()).includes('还能约分'), '3/6：还能约分');
  await H.press('约分 ÷3');
  H.ok(await H.out('lowest') === '1' && (await H.read()).includes('= 1/2') && await H.done('low'), '约分 ÷3：1/2，最简');
  console.log('3. 量一量');
  await H.open('g6-frac-div-trap');
  for (let i = 0; i < 12; i++) await H.press('量一次');
  H.ok(await H.out('quot') === '12' && (await H.read()).includes('正好量了 12 次') && await H.done('ans'), '4 ÷ 1/3：量 12 次');
  await H.open('g6-frac-div-core');
  await H.press('量一次'); await H.press('量一次');
  H.ok(await H.out('quot') === '3/2' && (await H.read()).includes('最后一段只有量尺的 1/2') && await H.done('ans'), '3/4 ÷ 1/2：量 1 次多一半，3/2');
  console.log('4. 倒数');
  await H.open('fr-recip');
  await H.press('上下翻过来');
  H.ok(await H.out('recip') === '5/3' && await H.done('rec'), '3/5 翻过来：5/3');
  await H.end('分数运算');
})();
