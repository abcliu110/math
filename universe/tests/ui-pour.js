/* node tests/ui-pour.js —— 倒水：真实鼠标测试。
 *  1. 守恒：甲 10 升倒进乙（装 6 升）：甲剩 4、乙 6，总量还是 10；
 *  2. 5 升和 3 升量 4 升：先绕远路（多装一次再倒空）量出来，说“最少 6 步就够”；退回重来，6 步正好最少；
 *  3. 全程没有打开属性面板、没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('pourbench');
  console.log('1. 守恒');
  await H.open('pour-conserve');
  await H.byTitle('甲倒进乙');
  H.ok(await H.out('a') === '4' && await H.out('b') === '6' && await H.out('total') === '10' && await H.out('kept') === '1' && (await H.read()).includes('总量和开始一样') && await H.done('total'), '甲倒进乙：甲 4、乙 6，总量还是 10');
  console.log('2. 量出 4 升');
  await H.open('pour-two-cups');
  for (const b of ['装满乙', '倒空乙', '装满甲', '甲倒进乙', '倒空乙', '甲倒进乙', '装满甲', '甲倒进乙']) await H.byTitle(b);
  H.ok(await H.out('hit') === '1' && await H.out('fewest') === null && (await H.read()).includes('最少 6 步就够') && await H.done('four'), '绕远路 8 步：量出来了，但最少 6 步就够');
  await H.byTitle('重来');
  H.ok(await H.out('moves') === '0' && await H.out('a') === '0', '重来：两杯都空');
  for (const b of ['装满甲', '甲倒进乙']) await H.byTitle(b);
  H.ok(await H.out('a') === '2' && await H.out('b') === '3', '装满甲倒进乙：甲剩 2、乙 3');
  for (const b of ['倒空乙', '甲倒进乙', '装满甲', '甲倒进乙']) await H.byTitle(b);
  H.ok(await H.out('a') === '4' && await H.out('fewest') === '1' && (await H.read()).includes('最少就是 6 步'), '6 步：甲正好 4 升，最少');
  await H.end('倒水');
})();
