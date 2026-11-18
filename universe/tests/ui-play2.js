/* node tests/ui-play2.js —— 第二层新玩法：真实鼠标测试。
 *  1. 竖式填缺数字 □3 + 4□ = 81：先填 2、9 说不对；退两步，填 3、8：对了；
 *  2. 凑十对对碰：点 3 再点 6，说“3 + 6 = 9，不是 10”；配出 4 对，剩下 6：找完了；
 *  3. 钱币最少张数：8 元 7 角全用 1 元、1 角：正好但说“最少只要 7 张”；重新用大面额：最少；
 *  4. 筛质数：划掉 1、2、3、5 的倍数还没筛完；再划 7：25 个质数；多点 4 的倍数：说早就划掉了；
 *  5. 全程没有打开属性面板、没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('vertbench');
  const p = H.p;
  const key = async (k) => { await p.locator('.card svg.bdy [data-key="' + k + '"]').click(); await p.waitForTimeout(110); };
  const out = (type, port) => p.evaluate(([t, port]) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === t), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, [type, port]);

  console.log('1. 填缺数字');
  await H.open('vt-fill-81');
  await key(2); await key(9);
  H.ok(await out('vertbench', 'ok') === '0' && (await H.read()).includes('不对'), '填 2、9：不对，写出算出来是几');
  await key('back'); await key('back');
  await p.locator('.card svg.bdy [data-hole="0"]').click(); await p.waitForTimeout(110);
  await key(3); await key(8);
  H.ok(await out('vertbench', 'ok') === '1' && (await H.read()).includes('33 + 48 = 81') && await H.done('ok'), '填 3、8：对了，33 + 48 = 81');

  console.log('2. 对对碰');
  await H.open('mk-pairs');
  await H.byTitle('卡片 1：3'); await H.byTitle('卡片 5：6');
  H.ok((await H.text()).includes('3 + 6 = 9，不是 10'), '3 和 6：不是 10');
  for (const [a, b] of [['卡片 1：3', '卡片 2：7'], ['卡片 3：9', '卡片 4：1'], ['卡片 6：5', '卡片 7：5'], ['卡片 8：2', '卡片 9：8']]) { await H.byTitle(a); await H.byTitle(b); }
  H.ok(await out('makebench', 'pairs') === '4' && await out('makebench', 'paired') === '1' && await H.done('all'), '配出 4 对，剩下 6：找完了');

  console.log('3. 最少张数');
  await H.open('mn-fewest');
  for (let i = 0; i < 8; i++) await H.byTitle('放一张 1 元');
  for (let i = 0; i < 7; i++) await H.byTitle('放一张 1 角');
  H.ok(await out('moneybench', 'exact') === '1' && await out('moneybench', 'fewest') === null && (await H.text()).includes('最少只要 7 张'), '全用 1 元、1 角：正好，但最少只要 7 张');
  await H.open('mn-fewest');
  await H.byTitle('放一张 5 元'); for (let i = 0; i < 3; i++) await H.byTitle('放一张 1 元'); await H.byTitle('放一张 5 角'); await H.byTitle('放一张 1 角'); await H.byTitle('放一张 1 角');
  H.ok(await out('moneybench', 'fewest') === '1' && (await H.text()).includes('最少就是 7 张') && await H.done('few'), '先用大面额：7 张，最少');

  console.log('4. 筛质数');
  await H.open('fb-sieve');
  await H.byTitle('划掉 1');
  for (const k of [2, 3, 5]) await H.byTitle('划掉 ' + k + ' 的倍数');
  H.ok(await out('factorbench', 'primes') === null && (await H.text()).includes('还有合数没划掉'), '划了 2、3、5：还有 49、77、91 这些没划掉');
  await H.byTitle('划掉 7 的倍数');
  H.ok(await out('factorbench', 'primes') === '25' && (await H.read()).includes('一共 25 个') && await H.done('all'), '再划 7：剩下 25 个质数');
  await H.byTitle('划掉 4 的倍数');
  H.ok((await H.text()).includes('4 的倍数早就划掉了'), '多点 4 的倍数：说早就划掉了');
  await H.end('第二层新玩法');
})();
