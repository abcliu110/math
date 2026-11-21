/* node tests/ui-feat.js —— 数的特征：真实鼠标测试。
 *  1. 0、3、5、7 拼最大的“同时是 2 和 5 的倍数”：先拼 735（个位 5：不是 2 的倍数，踩陷阱）；拿下来重拼 750：最大；
 *  2. 2、4、7 拼两位数的 3 的倍数：47 记不下（不是 3 的倍数）；24、42、27、72 记下，找全；
 *  3. 奇偶：3 + 5 合起来是偶数；换成 1 + 7、5 + 5，试了 3 组奇 + 奇；
 *  4. 全程没有打开属性面板、没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('featbench');
  const card = (d) => H.byTitle('卡片 ' + d);
  const make = async (ds) => { for (const d of ds) await card(d); };
  console.log('1. 最大的 10 的倍数');
  await H.open('ft-max-10');
  await make([7, 3, 5]);
  H.ok(await H.out('n') === '735' && await H.out('ok') === '0' && (await H.text()).includes('个位是 5') && (await H.read()).includes('735 不是 2 和 5 的公倍数'), '735：个位 5，不是 2 的倍数');
  await H.byTitle('拿下第 2 位'); await H.byTitle('拿下第 3 位');
  await make([5, 0]);
  H.ok(await H.out('n') === '750' && await H.out('best') === '1' && (await H.read()).includes('而且是最大的') && await H.done('best'), '750：最大');
  console.log('2. 找全 3 的倍数');
  await H.open('ft-3-all');
  await make([4, 7]); await H.byTitle('记下这个数');
  H.ok(await H.out('found') === '0' && (await H.text()).includes('47 不是 3 的倍数'), '47 不是 3 的倍数，记不下');
  await H.byTitle('把空位都清空');
  for (const [x, y] of [[2, 4], [4, 2], [2, 7], [7, 2]]) { await make([x, y]); await H.byTitle('记下这个数'); }
  H.ok(await H.out('all') === '1' && (await H.text()).includes('找全了：一共 4 个') && await H.done('all'), '24、42、27、72：找全');
  console.log('3. 奇 + 奇');
  await H.open('ft-odd-odd');
  await H.byTitle('两排点子放在一起重新配对');
  H.ok(await H.out('even') === '1' && (await H.read()).includes('奇 + 奇 = 偶'), '3 + 5 = 8：偶数');
  await H.byTitle('甲少 1'); await H.byTitle('甲少 1'); await H.byTitle('乙多 1'); await H.byTitle('乙多 1');
  await H.byTitle('两排点子放在一起重新配对');
  await H.byTitle('甲多 1'); await H.byTitle('甲多 1'); await H.byTitle('甲多 1'); await H.byTitle('甲多 1'); await H.byTitle('乙少 1'); await H.byTitle('乙少 1');
  await H.byTitle('两排点子放在一起重新配对');
  H.ok(await H.out('oo') === '3' && (await H.text()).includes('1 + 7：奇 + 奇 = 偶') && await H.done('three'), '试了 3 组奇 + 奇，都是偶数');
  await H.end('数的特征');
})();
