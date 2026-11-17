/* node tests/ui-cal.js —— 日历：真实鼠标测试。
 *  1. 2024 年 1 月翻到 2 月：29 天，闰年；
 *  2. 5 月 1 日到 31 日：经过 30 天，一共 31 天；
 *  3. 星期三，100 天后：过 7 天 14 次、过 1 天 2 次：星期五；
 *  4. 全程没有打开属性面板。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('calbench');

  console.log('1. 闰年');
  await H.open('cal-feb-2024');
  H.ok(await H.out('days') === '31', '1 月 31 天');
  await H.press('▶');
  H.ok(await H.out('days') === '29' && (await H.read()).includes('2024 年是闰年') && await H.done('feb'), '翻到 2 月：29 天，闰年');

  console.log('2. 经过几天');
  await H.open('cal-may-days');
  await H.byTitle('5 月 1 日'); await H.byTitle('5 月 31 日');
  H.ok(await H.out('between') === '30' && await H.out('inclusive') === '31' && (await H.read('[data-days]')).includes('一共 31 天') && await H.done('all'), '1 日到 31 日：经过 30 天，一共 31 天');

  console.log('3. 几天后星期几');
  await H.open('week-100');
  for (let i = 0; i < 14; i++) await H.press('过 7 天');
  H.ok((await H.text()).includes('98 天 = 14 个星期') && await H.out('weekday') === null, '过 14 个星期：98 天，还是星期三');
  await H.press('过 1 天'); await H.press('过 1 天');
  H.ok(await H.out('weekday') === '5' && (await H.read()).includes('100 天后是星期五') && await H.done('day'), '再过 2 天：星期五');
  await H.end('日历');
})();
