/* node tests/ui-weigh.js —— 找次品：真实鼠标测试。
 *  1. 9 个：左 1 个、右 2 个，“称一下”按不了；改成 3 对 3：称一下，剩 3 个可疑（别的变灰）；1 对 1：找到，2 次，最少；
 *  2. 27 个：13 对 13，最不利还剩 13 个可疑（不是分三份）；
 *  3. 全程没有打开属性面板。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('weighbench');
  const put = async (i, side) => { for (let k = 0; k < side; k++) await H.byTitle('零件 ' + (i + 1)); };   // side 1 左、2 右
  const off = (label) => H.p.locator('.card svg.bdy g[data-pick-set]').filter({ hasText: label }).count();
  console.log('1. 9 个');
  await H.open('g5-balance-core');
  await put(0, 1); await put(1, 2); await put(2, 2);
  H.ok(await off('称一下') === 0 && (await H.text()).includes('两边个数要一样多'), '左 1 右 2：称不了，要一样多');
  await put(1, 2);                       // 2 号：右 → 不放 → 左
  await put(3, 1);                       // 4 号放左
  await put(4, 2); await put(5, 2);      // 5、6 号放右（3 号已经在右）
  await H.press('称一下');
  H.ok(await H.out('left') === '3' && await H.out('weighs') === '1', '3 对 3：最不利是平，剩没上秤的 3 个');
  await put(6, 1); await put(7, 2);
  await H.press('称一下');
  H.ok(await H.out('found') === '1' && await H.out('best') === '1' && (await H.read()).includes('最少就是 2 次') && await H.done('best'), '1 对 1：找到了，2 次就是最少');
  console.log('2. 分两份不划算');
  await H.open('wt-27');
  await H.p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'weighbench'); UI.App.act({ t: 'set', id: e.id, k: 'pan', v: '1'.repeat(13) + '2'.repeat(13) + '0' }); });
  await H.press('称一下');
  H.ok(await H.out('left') === '13', '13 对 13：最不利还剩 13 个可疑');
  await H.end('找次品');
})();
