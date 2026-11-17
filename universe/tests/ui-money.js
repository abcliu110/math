/* node tests/ui-money.js —— 钱币：真实鼠标测试。
 *  1. 5 元 3 角：点 5 元、3 个 1 角：5.3 元；
 *  2. 7 元 5 角：多放一张 1 元说“多付了”，点盘子里的拿回来，正好；
 *  3. 盘子里 1 元换 10 个 1 角；
 *  4. 找零：13 元 5 角付 20 元，数上去 5 角、1 元、5 元：找 6 元 5 角；
 *  5. 全程没有打开属性面板。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('moneybench');

  console.log('1. 几元几角');
  await H.open('g1-money-jiao-trap');
  await H.byTitle('放一张 5 元'); for (let i = 0; i < 3; i++) await H.byTitle('放一张 1 角');
  H.ok(await H.out('total') === '53/10' && (await H.read()).includes('5 元 3 角 = 5.3 元') && await H.done('dec'), '5 元和 3 个 1 角：5.3 元');

  console.log('2. 付正好');
  await H.open('mn-pay-7-5');
  await H.byTitle('放一张 5 元'); for (let i = 0; i < 3; i++) await H.byTitle('放一张 1 元'); await H.byTitle('放一张 5 角');
  H.ok((await H.text()).includes('多付了 1 元') && await H.out('exact') === null, '多放一张 1 元：说多付了 1 元');
  await H.byTitle('拿回一张 1 元');
  H.ok(await H.out('exact') === '1' && (await H.text()).includes('正好') && await H.done('exact'), '拿回一张：正好 7 元 5 角');
  await H.press('盘子里 1 元换 10 个 1 角');
  H.ok((await H.props()).tray.split(',')[0] === '10' && await H.out('total') === '15/2', '1 元换成 10 个 1 角：钱数不变');

  console.log('3. 找零');
  await H.open('mn-change-20');
  await H.byTitle('放一张 5 角'); await H.byTitle('放一张 1 元');
  H.ok((await H.read()).includes('还没数到 20 元') && await H.out('change') === null, '数到 15 元：还没数到');
  await H.byTitle('放一张 5 元');
  H.ok(await H.out('change') === '13/2' && (await H.read()).includes('找零 6 元 5 角') && await H.done('change'), '数到 20 元：找零 6 元 5 角');
  await H.end('钱币');
})();
