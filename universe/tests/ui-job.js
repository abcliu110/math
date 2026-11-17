/* node tests/ui-job.js —— 工程问题：真实鼠标测试。
 *  1. 甲 6 天乙 3 天：过一天，涂了 3 格，没做完；再过一天：2 天做完；
 *  2. 只让甲做：6 天；
 *  3. 注水放水：4 小时进、6 小时出，过 12 小时注满；只开出水管：说永远注不满；
 *  4. 全程没有打开属性面板。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('jobbench');
  console.log('1. 合作');
  await H.open('jb-6-3');
  await H.press('过一天');
  H.ok(await H.out('days') === null && (await H.text()).includes('每天一共做 3 格 = 整件的 1/2'), '过一天：每天 3 格，还没做完');
  await H.press('过一天');
  H.ok(await H.out('days') === '2' && (await H.read()).includes('6 ÷ 3 = 2') && await H.done('days'), '再过一天：2 天做完');
  console.log('2. 只让甲做');
  await H.press('乙来做');
  for (let i = 0; i < 6; i++) await H.press('过一天');
  H.ok(await H.out('days') === '6', '只有甲：6 天');
  console.log('3. 注水放水');
  await H.open('jb-tank');
  for (let i = 0; i < 12; i++) await H.press('过一小时');
  H.ok(await H.out('days') === '12' && (await H.read()).includes('1/4 − 1/6') && await H.done('hours'), '一起开：12 小时注满');
  await H.press('进水管来开');
  H.ok((await H.text()).includes('永远注不满'), '只开出水管：永远注不满');
  await H.end('工程问题');
})();
