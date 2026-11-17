/* node tests/ui-seq.js —— 数列与规律：真实鼠标测试。
 *  1. 摆到第 3 个：表里 4、7、10；规律填 4 和 4，有 ✗；改成 3：都对上；
 *  2. n = 10：31 根，写出 3 × n + 1；×10 跳到 100：301；
 *  3. 桌子：摆 3 张、规律 4 和 2，n 调到 25：52 人；
 *  4. 全程没有打开属性面板。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('seqbench');
  console.log('1. 找规律');
  await H.open('sq-matches-10');
  await H.press('再摆一个'); await H.press('再摆一个');
  for (let i = 0; i < 4; i++) await H.byTitle('第 1 个多 1');
  for (let i = 0; i < 4; i++) await H.byTitle('每次多加 1');
  H.ok((await H.text()).includes('有的行对不上') && await H.out('term') === null, '规律填 4 和 4：有 ✗，对不上');
  await H.byTitle('每次少多 1');
  H.ok(await H.out('d') === '3' && (await H.text()).includes('规律找到了') && await H.done('rule'), '改成每个多 3：每一行都对上');
  console.log('2. 第 n 个');
  H.ok(await H.out('term') === '31' && (await H.read()).includes('也就是 3 × n + 1') && await H.done('ten'), '第 10 个：31 根，3 × n + 1');
  await H.press('×10');
  H.ok(await H.out('term') === '301', '×10：第 100 个 301 根');
  console.log('3. 桌子');
  await H.open('sq-tables-n');
  await H.press('再摆一个'); await H.press('再摆一个');
  for (let i = 0; i < 4; i++) await H.byTitle('第 1 个多 1');
  for (let i = 0; i < 2; i++) await H.byTitle('每次多加 1');
  H.ok(await H.out('term') === '52' && await H.done('n25'), '规律 4 和 2：25 张桌子 52 人');
  await H.end('数列与规律');
})();
