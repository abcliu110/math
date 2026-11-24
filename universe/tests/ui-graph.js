/* node tests/ui-graph.js —— 记下来（换一换台的图，docs/knob-graph-and-gallery.md 第一节）：真实鼠标。
 *  1. 打开“画成图”：图是空的，写着“再做 3 个”；拖把手换到腿数正好，图上多一个点（研究本记一条）；
 *  2. 目标 + ，再做一个；目标 + 到单数，点“凑不出来”：图上多一个 ✕；
 *  3. 有 3 个点以后换到新的腿数：写着“先猜”；点蓝线上“猜兔 4 个”，再拖到正好：猜对一次；再猜错一次：猜了 2 次，猜对 1 次；
 *  4. 不到 5 个点，“全部试一遍”点不了；5 个点以后能点：浅色的点画满；
 *  5. 回答两个追问，六个里程碑都完成；目标改了，猜的清掉；
 *  6. 不开图的老题（sw-8-26）照样没有图；没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('swapbench');
  const p = H.p, CW = 38, GX = 24, GY = 186, CH = 46;
  const SP = process.env.SHOT_DIR;
  const to = async (k0, k) => H.drag([GX + k0 * CW, GY + CH / 2 - 2], [GX + k * CW, GY + CH / 2 - 2]);
  const props = () => H.props();
  const plus = () => H.byTitle('目标多 1');

  console.log('1. 第一个点');
  await H.open('gal-cr-graph');
  H.ok(/再做 3 个/.test(await H.text()) && await H.out('pts') === '0', '图是空的：写着“再做 3 个”');
  await to(0, 2);
  H.ok(await H.out('ok') === '1' && await H.out('pts') === '1' && (await props()).book === '8,2,4,20:2', '拖到兔 2 只，正好 20：图上 1 个点，研究本记了一条');
  H.ok(await p.locator('.card svg.bdy circle[fill="#f5a25d"][r="5"]').count() === 1, '图上画了一个橙色的点');

  console.log('2. 再做一个，再说一次凑不出来');
  await plus(); await plus();
  H.ok((await props()).target === 22 && (await props()).k === 0, '目标 + 两次：22，鸡兔回到全是鸡');
  await to(0, 3);
  H.ok(await H.out('pts') === '2', '兔 3 只，正好 22：2 个点');
  await plus(); await H.byTitle('怎么换都凑不出 23');
  H.ok(await H.done('hole') && await H.out('pts') === '3' && /✕/.test(await H.text()), '23 凑不出来：说对了，图上多一个 ✕（3 个点）');
  H.ok(await H.done('three'), '里程碑：图上有 3 个点');

  console.log('3. 先猜再换');
  await plus();
  H.ok(/先猜：一共 24 时，兔几个/.test(await H.text()), '换到 24：写着“先猜”');
  await H.byTitle('猜兔 4 个');
  H.ok((await props()).guess === 4 && /你猜兔 4 个/.test(await H.text()), '点蓝线上的一格：猜兔 4 个');
  if (SP) await p.locator('.card').first().screenshot({ path: SP + '/gr-guess.png' });
  await to(0, 4);
  H.ok(await H.out('gok') === '1' && await H.out('gtry') === '1' && await H.done('guess'), '换到正好：猜对一次（里程碑完成）');
  await plus(); await plus(); await H.byTitle('猜兔 6 个');
  await plus(); await plus(); await plus(); await plus(); await plus(); await H.byTitle('目标少 1'); await H.byTitle('目标少 1'); await H.byTitle('目标少 1'); await H.byTitle('目标少 1'); await H.byTitle('目标少 1');
  H.ok((await props()).target === 26 && (await props()).guess === -1, '目标改了又改回来：猜的清掉了');
  await H.byTitle('猜兔 6 个'); await to(0, 5);
  H.ok(await H.out('gtry') === '2' && await H.out('gok') === '1' && /猜了 2 次，猜对 1 次/.test(await H.text()), '猜 6 只，其实 5 只：猜了 2 次，猜对 1 次');

  console.log('4. 全部试一遍');
  H.ok(await H.out('pts') === '5', '现在 5 个点');
  await H.byTitle('每个总数都画上');
  H.ok(await H.out('all') === '1' && await p.locator('.card svg.bdy circle[fill="#c9d3e3"]').count() === 9, '全部试一遍：16 到 32 里 9 个双数都画上浅色的点');
  H.ok(await H.done('all'), '里程碑：全部试一遍');

  console.log('5. 追问');
  // 加了图，卡片变高：下面的追问会被播放条挡住，先点左下角的“适应”，整张卡片缩进来
  await p.locator('button', { hasText: /^适应$/ }).first().click(); await p.waitForTimeout(250);
  await H.press('1 只'); await H.press('每只都是双数条腿，加起来一定是双数');
  H.ok(await H.done('q1') && await H.done('q2'), '两个追问都答对');
  H.ok((await Promise.all(['three', 'hole', 'guess', 'all', 'q1', 'q2'].map(H.done))).every(Boolean), '六个里程碑都完成');
  if (SP) await p.locator('.card').first().screenshot({ path: SP + '/gr-done.png' });

  console.log('6. 没开图的老题');
  await H.open('sw-8-26');
  H.ok(!/记下来/.test(await H.text()) && await H.out('pts') === '0', 'sw-8-26 没有图');
  await H.end('记下来（图）');
})();
