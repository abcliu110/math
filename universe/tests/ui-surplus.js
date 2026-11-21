/* node tests/ui-surplus.js —— 盈亏问题：真实鼠标测试。
 *  1. 每人 5 多 3、每人 7 少 5：+ 到 3 人，下面多（不对）；再 + 到 4 人：一样多，23 个；
 *  2. 两次都多：一路 + 到 8 人，54 本；
 *  3. 全程没有打开属性面板、没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('surplusbench');
  console.log('1. 一盈一亏');
  await H.open('sp-5-7');
  await H.byTitle('多一人'); await H.byTitle('多一人');
  H.ok(await H.out('n') === '3' && await H.out('match') === null && (await H.text()).includes('上面多 2'), '3 人：上面要 18、下面要 16，对不上');
  await H.byTitle('多一人');
  H.ok(await H.out('total') === '23' && (await H.read()).includes('4 人，一共 23 个') && await H.done('n'), '4 人：一样多，23 个');
  console.log('2. 两次都多');
  await H.open('sp-both-more');
  for (let i = 0; i < 7; i++) await H.byTitle('多一人');
  H.ok(await H.out('total') === '54' && (await H.text()).includes('一共差 16 本') && await H.done('n'), '8 人：54 本');
  await H.end('盈亏问题');
})();
