/* node tests/ui-state.js —— 状态图：真实鼠标测试。
 *  1. 过河：先带狼，羊把菜吃了（红点、死路）；退一步，按 7 步走完：最少；看全部，一共几种局面；
 *  2. 汉诺塔：绕一步再走完（8 步），不是最少；重来走 7 步：最少；
 *  3. 取石子：往回标 11 次；拿 2、拿 3、拿 3，电脑跟着拿，你赢；
 *  4. 全程没有打开属性面板、没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('statebench');
  console.log('1. 过河');
  await H.open('sg-river');
  await H.byTitle('带狼过河');
  H.ok(await H.out('dead') === '1' && (await H.text()).includes('羊把菜吃了') && await H.done('dead'), '先带狼：羊把菜吃了，死路');
  await H.byTitle('退一步');
  for (const b of ['带羊过河', '自己过河', '带狼过河', '带羊过河', '带菜过河', '自己过河', '带羊过河']) await H.byTitle(b);
  H.ok(await H.out('reached') === '1' && await H.out('fewest') === '1' && (await H.read()).includes('最少就是 7 步') && await H.done('few'), '7 步全部过河：最少');
  await H.byTitle('看全部局面');
  H.ok(+(await H.out('total')) > 8 && (await H.text()).includes('一共'), '看全部：所有局面都画出来');
  console.log('2. 汉诺塔');
  await H.open('sg-hanoi');
  for (const b of ['左 → 中', '中 → 右', '左 → 中', '右 → 中', '左 → 右', '中 → 左', '中 → 右', '左 → 右']) await H.byTitle(b);
  H.ok(await H.out('reached') === '1' && await H.out('fewest') === null && (await H.read()).includes('最少 7 步就够'), '8 步到了，但最少 7 步');
  await H.byTitle('重来');
  for (const b of ['左 → 右', '左 → 中', '右 → 中', '左 → 右', '中 → 左', '中 → 右', '左 → 右']) await H.byTitle(b);
  H.ok(await H.out('fewest') === '1' && await H.done('few'), '7 步：最少');
  console.log('3. 取石子');
  await H.open('sg-nim');
  for (let i = 0; i < 11; i++) await H.byTitle('从 0 往回标必胜必败');
  H.ok(await H.out('marked') === '11' && (await H.text()).includes('必败（红）是 0、4、8'), '往回标：必败是 0、4、8');
  for (const b of ['拿 2 颗', '拿 3 颗', '拿 3 颗']) await H.byTitle(b);
  H.ok(await H.out('won') === '1' && (await H.read()).includes('你赢了') && await H.done('won'), '留 8、留 4、拿光：你赢了');
  await H.end('状态图');
})();
