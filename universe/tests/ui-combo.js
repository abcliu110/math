/* node tests/ui-combo.js —— 搭配：真实鼠标测试。
 *  1. 3 件上衣 4 条裤子 2 双鞋：没列全时“再配鞋”按不了；点满 12 格：3 × 4 = 12；再配鞋：24；
 *  2. 0、1、2 排两位数：0 在十位的格子是“不行”；点 4 格：一共 4 个；
 *  3. 全程没有打开属性面板。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('combobench');
  const off = (label) => H.p.locator('.card svg.bdy g[data-pick-set]').filter({ hasText: label }).count();
  console.log('1. 衣服搭配');
  await H.open('g3-combo-core');
  H.ok(await off('再配鞋') === 0, '没列全：“再配鞋”按不了');
  for (let i = 1; i <= 3; i++) for (let j = 1; j <= 4; j++) await H.byTitle('上衣 ' + i + ' 配裤子 ' + j);
  H.ok(await H.out('pairs') === '12' && (await H.read()).includes('3 × 4 = 12 种') && await H.done('pairs'), '点满 12 格：3 × 4 = 12');
  await H.press('再配鞋');
  H.ok(await H.out('all') === '24' && (await H.read('[data-shoes]')).includes('12 × 2 = 24') && await H.done('all'), '再配鞋：24 种');
  console.log('2. 数字卡片');
  await H.open('cb-digits-012');
  H.ok((await H.text()).split('不行').length - 1 === 5, '同一张用两次、0 在十位的 5 格是“不行”');
  for (const t of ['十位 1、个位 0', '十位 1、个位 2', '十位 2、个位 0', '十位 2、个位 1']) await H.byTitle(t);
  H.ok(await H.out('pairs') === '4' && await H.done('all'), '列出 10、12、20、21：一共 4 个');
  await H.end('搭配');
})();
