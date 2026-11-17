/* node tests/ui-dir.js —— 方向与路线：真实鼠标测试。
 *  1. 反过来问：点“东北”说不对，方向相反；点“西南”对；
 *  2. 走路线：先往西一步再走到：多走了，说最短 10 格；重走，向东 6 格向北 4 格：最短，路线写成“向东走 6 格，再向北走 4 格”；
 *  3. 方向角：真实拖射线到北偏东 30°、300 米：对上；
 *  4. 全程没有打开属性面板。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('dirbench');
  console.log('1. 认方向');
  await H.open('dr-reverse');
  await H.byTitle('选“东北”');
  H.ok(await H.out('right') === '0' && (await H.read()).includes('方向相反'), '点“东北”：不对，说方向相反');
  await H.byTitle('选“西南”');
  H.ok(await H.out('right') === '1' && await H.done('right'), '点“西南”：对');
  console.log('2. 走路线');
  await H.open('dr-route');
  await H.byTitle('向西走一格');
  for (let i = 0; i < 7; i++) await H.byTitle('向东走一格');
  for (let i = 0; i < 4; i++) await H.byTitle('向北走一格');
  H.ok(await H.out('arrived') === '1' && await H.out('shortest') === null && (await H.read()).includes('最短只要 10 格'), '先往西：走了 12 格，最短只要 10 格');
  await H.press('重走');
  for (let i = 0; i < 6; i++) await H.byTitle('向东走一格');
  for (let i = 0; i < 4; i++) await H.byTitle('向北走一格');
  H.ok(await H.out('shortest') === '1' && (await H.text()).includes('向东走 6 格，再向北走 4 格') && await H.done('short'), '向东 6、向北 4：最短的路');
  console.log('3. 方向角');
  await H.open('dr-bearing');
  const C = [230, 210], R3 = 40, a = 30 * Math.PI / 180;
  await H.drag([C[0], C[1] - R3], [C[0] + Math.sin(a) * 3 * R3, C[1] - Math.cos(a) * 3 * R3]);
  H.ok(await H.out('hit') === '1' && (await H.text()).includes('你画的：北偏东 30°，300 米') && await H.done('hit'), '真实拖射线：北偏东 30°，300 米');
  await H.end('方向与路线');
})();
