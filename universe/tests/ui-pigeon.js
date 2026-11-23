/* node tests/ui-pigeon.js —— 摸球保证（最不利原则）：真实鼠标测试。
 *  1. 袜子：红、黄、蓝各摸一只，卡住了：先选“摸 3 个”不对，选“摸 4 个”才对；再摸一只红的就成功了（运气不够坏），卡住的读数没了；放回又卡住；
 *  2. 每种都有：先把红、蓝全摸完（卡住 10 个）不对；全部放回，改成红、黄全摸完：卡住 11 个，题目完成；
 *  3. 黄球只有 1 个：红 2、黄 1、蓝 2 就卡住，保证 6 个（不是 7 个）；全程没有打开属性面板、没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('pigeonbench');
  console.log('1. 摸袜子');
  await H.open('pg-socks');
  H.ok(await H.out('guar') === null && await H.out('drawn') === '0', '开始：还没摸，没有“保证”');
  await H.byTitle('摸一个红的'); await H.byTitle('摸一个黄的');
  H.ok(await H.out('guar') === null && await H.out('hit') === '0', '红一只、黄一只：还没卡住');
  await H.byTitle('摸一个蓝的');
  H.ok(await H.out('guar') === null && (await H.text()).includes('至少摸几个'), '红、黄、蓝各一只：卡住了，台面问至少摸几个');
  await H.byTitle('保证要摸 3 个');
  H.ok(await H.out('guar') === null && (await H.text()).includes('还没成功呢'), '选 3 个：摸 3 个的时候还没成功');
  await H.byTitle('保证要摸 5 个');
  H.ok(await H.out('guar') === null && (await H.text()).includes('多了'), '选 5 个：多了');
  await H.byTitle('保证要摸 4 个');
  H.ok(await H.out('guar') === '4' && (await H.read()).includes('= 4') && await H.done('g'), '红、黄、蓝各一只：卡住了，保证要 4 只');
  await H.byTitle('摸一个红的');
  H.ok(await H.out('hit') === '1' && await H.out('guar') === null && (await H.text()).includes('运气还不够坏'), '再摸一只红的：成对了，说明运气还不够坏');
  await H.byTitle('放回一个红的');
  H.ok(await H.out('guar') === null && (await H.text()).includes('至少摸几个'), '放回去：又卡住了，要重新说');
  console.log('2. 每种颜色都有：比几种摸法');
  await H.open('pg-every-color');
  for (let i = 0; i < 6; i++) await H.byTitle('摸一个红的');
  for (let i = 0; i < 3; i++) await H.byTitle('摸一个蓝的');
  await H.byTitle('保证要摸 10 个');
  H.ok(await H.out('guar') === '10' && !(await H.done('g')) && (await H.text()).includes('比一比'), '红、蓝全摸完：卡住 10 个，但还不是最倒霉的');
  await H.byTitle('全部放回袋里');
  for (let i = 0; i < 6; i++) await H.byTitle('摸一个红的');
  for (let i = 0; i < 4; i++) await H.byTitle('摸一个黄的');
  await H.byTitle('保证要摸 11 个');
  H.ok(await H.out('guar') === '11' && await H.done('g'), '红、黄全摸完：卡住 11 个，这才最倒霉');
  console.log('3. 不够的颜色全摸完');
  await H.open('pg-short-color');
  await H.byTitle('摸一个红的'); await H.byTitle('摸一个红的'); await H.byTitle('摸一个黄的');
  H.ok(await H.out('guar') === null, '红 2、黄 1：蓝的还能摸，没卡住');
  await H.byTitle('摸一个蓝的'); await H.byTitle('摸一个蓝的');
  await H.byTitle('保证要摸 6 个');
  H.ok(await H.out('guar') === '6' && await H.done('g'), '红 2、黄 1、蓝 2：卡住，保证 6 个');
  await H.end('摸球保证');
})();
