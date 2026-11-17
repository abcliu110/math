/* node tests/ui-proof.js —— 证明台：真实鼠标测试。
 *  1. 1 + 3 + … = n²：没看两件事不能推；看第 1 块、看推一级，推倒：全倒，证据亮到 ④；
 *  2. 起点错的式子：推一级是恒等式，第 1 块不成立，推了一块也不倒；
 *  3. n² − n + 1：推倒停在第 2 块；
 *  4. 写证明：依据点“试了好多例子”说不是依据；三步点对：④；
 *  5. 猜想：质数都是奇数 → 反例 2；奇数 + 2 是奇数 → 记下来 ①；
 *  6. 全程没有打开属性面板。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('proofbench');
  console.log('1. 多米诺');
  await H.open('pf-induct-odd');
  H.ok(await H.p.locator('.card svg.bdy g[data-pick-set]').filter({ hasText: '推倒第一块' }).count() === 0, '两件事都没看：“推倒第一块”按不了');
  await H.press('看第 1 块'); await H.press('看任意一块推下一块');
  H.ok(await H.out('base') === '1' && await H.out('step') === '1' && (await H.text()).includes('恒等式 ✓'), '第 1 块成立，推一级是恒等式');
  await H.press('推倒第一块');
  H.ok(await H.out('lv') === '4' && (await H.read()).includes('所有骨牌都倒了') && await H.done('proved'), '推倒：全倒，证据 ④');
  console.log('2. 起点不对');
  await H.open('pd-false-base');
  await H.press('看任意一块推下一块'); await H.press('看第 1 块');
  H.ok(await H.out('step') === '1' && await H.out('base') === '0' && await H.done('base'), '推一级没问题，第 1 块不成立');
  await H.press('推倒第一块');
  H.ok(await H.out('lv') === '0' && (await H.read()).includes('一块也不倒'), '推了：一块也不倒');
  console.log('3. 半路停下');
  await H.open('pd-breaks');
  await H.press('看第 1 块'); await H.press('看任意一块推下一块'); await H.press('推倒第一块');
  H.ok(await H.out('failedAt') === '2' && (await H.read()).includes('n = 3 时不成立') && await H.done('stop'), '停在第 2 块：n = 3 不成立');
  console.log('4. 写证明');
  await H.open('pf-scaffold-odd');
  await H.byTitle('用这条当依据', 3);
  H.ok((await H.text()).includes('例子不是依据'), '第 1 步点“试了好多例子”：不是依据');
  await H.byTitle('用这条当依据', 0);
  await H.byTitle('用这条当依据', 4);
  await H.byTitle('用这条当依据', 8);
  H.ok(await H.out('filled') === '3' && await H.out('lv') === '4' && (await H.read()).includes('证明完成') && await H.done('proved'), '三步依据都成立：证明完成，④');
  console.log('5. 猜想');
  await H.open('pd-conj-prime');
  await H.press('n 是质数'); await H.byTitle('那么n 是奇数'); await H.press('在 1 到 30 里试例子');
  H.ok(await H.out('counter') === '2' && (await H.read()).includes('猜想被推翻') && await H.done('counter'), '质数都是奇数：反例 2，推翻');
  await H.open('pf-board-pattern');
  await H.byTitle('如果n 是奇数'); await H.byTitle('那么n + 2 是奇数'); await H.press('在 1 到 30 里试例子');
  H.ok(await H.out('lv') === '1' && (await H.read()).includes('这还只是猜想') && await H.done('write'), '奇数 + 2 是奇数：记下来，证据 ①');
  await H.end('证明台');
})();
