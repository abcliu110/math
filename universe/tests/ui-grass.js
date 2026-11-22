/* node tests/ui-grass.js —— 牛吃草：真实鼠标测试。
 *  1. 10 头 20 天、15 头 10 天：每天长 0 时两根长条里“原来的草”不一样；+ 到 5：一样多（100 份）；
 *  2. 第三行 25 头牛：天数 + 到 5：正好吃完；
 *  3. 一天一天看：60 份、每天长 4 份，牛 +5 三次到 16 头（第 5 天吃完），再 − 1、− 1 到 14 头：正好第 6 天吃完；15 头也是第 6 天吃完但不是正好；
 *  4. 全程没有打开属性面板、没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('grassbench');
  console.log('1. 找每天长几份');
  await H.open('gr-10-15-25');
  H.ok(await H.out('g1') === '200' && await H.out('g2') === '150' && await H.out('r') === null, '每天长 0：原来的草 200 和 150，对不上');
  for (let i = 0; i < 4; i++) await H.byTitle('每天多长 1 份');
  H.ok(await H.out('r') === null && (await H.text()).includes('不一样'), '每天长 4：还对不上');
  await H.byTitle('每天多长 1 份');
  H.ok(await H.out('r') === '5' && await H.out('g') === '100' && await H.done('r'), '每天长 5：原来的草都是 100 份');
  console.log('2. 25 头牛几天');
  for (let i = 0; i < 3; i++) await H.byTitle('多吃一天');
  H.ok(await H.out('t3') === null && (await H.text()).includes('天数太少'), '4 天：还没吃完');
  await H.byTitle('多吃一天');
  H.ok(await H.out('t3') === '5' && (await H.read()).includes('100 ÷ 20 = 5') && await H.done('t'), '5 天：正好吃完，100 ÷ 20 = 5');
  console.log('3. 一天一天看');
  await H.open('gr-day-by-day');
  H.ok(await H.out('days') === null && (await H.text()).includes('永远吃不完'), '1 头牛：永远吃不完');
  await H.byTitle('多 5 头牛'); await H.byTitle('多 5 头牛'); await H.byTitle('多 5 头牛');
  H.ok(await H.out('days') === '5', '16 头：第 5 天就吃完了');
  await H.byTitle('少一头牛');
  H.ok(await H.out('days') === '6' && await H.out('exact') === null && !(await H.done('d')), '15 头：第 6 天吃完，但最后一天没吃饱');
  await H.byTitle('少一头牛');
  H.ok(await H.out('exact') === '6' && await H.done('d'), '14 头：正好 6 天吃完');
  await H.end('牛吃草');
})();
