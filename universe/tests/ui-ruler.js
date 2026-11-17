/* node tests/ui-ruler.js —— 尺子：真实鼠标测试。
 *  1. 铅笔头在 2：读不出长度，说“尖指的 8 不是它的长度”；点“从这头数到那头”：6；
 *  2. 真实拖铅笔让头对准 0：6 厘米；
 *  3. 2 米绳子，真实拖剪刀到 80：剩 120 厘米；1 米 5 厘米剪到头：105；
 *  4. 全程没有打开属性面板。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('rulerbench');
  const X0 = 50, CM = 38, RY = 200, MX0 = 40, MX1 = 660, MY = 190;

  console.log('1. 数格子');
  await H.open('ru-pencil');
  H.ok(await H.out('len') === null && (await H.text()).includes('尖指的 8 不是它的长度'), '头不在 0：读不出，说 8 不是长度');
  await H.press('从这头数到那头');
  H.ok(await H.out('len') === '6' && (await H.read()).includes('8 − 2 = 6'), '数格子：8 − 2 = 6');

  console.log('2. 对准 0');
  await H.open('ru-pencil');
  await H.drag([X0 + 5 * CM, RY - 42], [X0 + 3 * CM, RY - 42]);
  H.ok((await H.props()).at === 0 && await H.out('len') === '6' && (await H.read()).includes('头对准 0') && await H.done('len'), '真实拖铅笔：头对准 0，6 厘米');

  console.log('3. 米和厘米');
  await H.open('g2-length-cut-core');
  const px = (v, top) => MX0 + (MX1 - MX0) * v / top;
  await H.drag([px(0, 200), MY - 34], [px(80, 200), MY - 34]);
  H.ok((await H.props()).cut === 80 && await H.out('rest') === '120' && (await H.read()).includes('200 − 80 = 120') && await H.done('rest'), '剪下 80 厘米：剩 120 厘米 = 1 米 20 厘米');
  await H.open('g3-measure-m-cm-trap');
  await H.drag([px(0, 105), MY - 34], [px(105, 105) + 20, MY - 34]);
  H.ok(await H.out('cut') === '105' && (await H.read()).includes('1 米 5 厘米') && await H.done('all'), '1 米 5 厘米剪到头：105 厘米');
  await H.end('尺子');
})();
