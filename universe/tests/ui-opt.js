/* node tests/ui-opt.js —— 优化（安排时间）：真实鼠标测试。
 *  1. 沏茶：泡茶一开始按不了（要先做别的）；一件一件做（先洗杯再烧水）：15 分钟，说还能更快；
 *  2. 重新排：先洗水壶、烧水，再洗杯、拿茶叶，最后泡茶：12 分钟，最省时间；
 *  3. 烙饼：先把饼 1、饼 2 两面烙完再烙饼 3：12 分钟，说还能更快；重来，1+2、1+3、2+3：9 分钟；
 *  4. 全程没有打开属性面板。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('optbench');
  const off = (label) => H.p.locator('.card svg.bdy g[data-pick-set]').filter({ hasText: label }).count();
  console.log('1. 一件一件做');
  await H.open('g4-optimize-sum-trap');
  H.ok(await off('泡茶') === 0, '泡茶一开始按不了：要先烧水、洗杯、拿茶叶');
  for (const t of ['洗茶杯', '拿茶叶', '洗水壶', '烧水', '泡茶']) await H.press(t);
  H.ok(await H.out('total') === '15' && await H.out('best') === null && (await H.read()).includes('还能更快'), '一件一件做：15 分钟，还能更快');
  console.log('2. 同时做');
  await H.press('重新排');
  for (const t of ['洗水壶', '烧水', '洗茶杯', '拿茶叶', '泡茶']) await H.press(t);
  H.ok(await H.out('total') === '12' && await H.out('best') === '1' && (await H.read()).includes('最省时间') && await H.done('best'), '烧水的时候洗杯、拿茶叶：12 分钟');
  console.log('3. 烙饼');
  await H.open('opt-pancake-3');
  const cake = async (ks) => { for (const k of ks) await H.byTitle('放这张的一面', k); await H.press('烙一锅'); };
  // 先烙 1、2 两面，再烙 3（第 3 张只能一锅一面）
  await cake([0, 0]); await cake([0, 0]); await cake([0]); await cake([0]);
  H.ok(await H.out('total') === '12' && (await H.read()).includes('还能更快'), '先把 1、2 烙完：4 锅 12 分钟，还能更快');
  await H.press('重来');
  await cake([0, 0]); await cake([0, 1]); await cake([0, 0]);
  H.ok(await H.out('total') === '9' && await H.out('best') === '1' && await H.done('best'), '1+2、1+3、2+3：3 锅 9 分钟');
  await H.end('优化');
})();
