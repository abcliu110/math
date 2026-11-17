/* node tests/ui-sort.js —— 分类与整理：真实鼠标测试。
 *  1. 3 红 2 蓝：点红卡片再点“蓝色”框：不让放，说为什么；放对；全部放完：3 + 2 = 5，和总数一样；
 *  2. 换成按形状分：重新分（框变成形状）；
 *  3. 全程没有打开属性面板。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('sortbench');
  console.log('1. 按颜色分');
  await H.open('g1-classify-count-core');
  await H.byTitle('卡片 1：红色的圆'); await H.byTitle('放进“蓝色”');
  H.ok((await H.text()).includes('这张是红色的，不能放进“蓝色”'), '红卡片放进蓝色框：不让放，说为什么');
  await H.byTitle('放进“红色”');
  for (const [card, box] of [['卡片 2：蓝色的圆', '蓝色'], ['卡片 3：红色的方', '红色'], ['卡片 4：蓝色的方', '蓝色'], ['卡片 5：红色的三角', '红色']]) { await H.byTitle(card); await H.byTitle('放进“' + box + '”'); }
  H.ok(await H.out('total') === '5' && await H.out('check') === '1' && (await H.read()).includes('红色 3 + 蓝色 2 = 5 个') && await H.done('check'), '全部放完：3 + 2 = 5，和总数一样');
  console.log('2. 按形状分');
  await H.press('按形状分');
  H.ok(await H.out('cats') === '3' && await H.out('total') === null && (await H.text()).includes('三角：0 个'), '换成按形状分：重新分，3 个框');
  await H.end('分类与整理');
})();
