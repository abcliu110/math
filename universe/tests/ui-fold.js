/* node tests/ui-fold.js —— 折纸与对称：真实鼠标测试。
 *  1. 折痕偏一格：折一下对不齐（标红）；打开，真实拖中间的圆点挪回中心，再折：重合；
 *  2. 正方形 30° 折不齐；真实拖一头的圆点转到 45°，再折：重合，记下 45°；
 *  3. 长方形：0°、90° 都折一下，对角线方向不算：找全 2 条；
 *  4. 平行四边形：点“它没有对称轴”；
 *  5. 全程没有打开属性面板。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('foldbench');
  const CX = 230, CY = 228, S = 40, P = (deg, r) => [CX + r * S * Math.cos(deg * Math.PI / 180), CY - r * S * Math.sin(deg * Math.PI / 180)];
  console.log('1. 折痕偏了');
  await H.open('g2-fold-offset-trap');
  await H.press('折一下');
  H.ok(await H.out('same') === '0' && (await H.read()).includes('对不齐'), '折痕偏一格：对不齐');
  await H.press('打开');
  // 折痕 90°：法向朝左（−x），偏 1 格就在 x = −1
  await H.drag([CX - S, CY], [CX, CY]);
  H.ok((await H.props()).off === 0, '真实拖中间的圆点：挪回中心');
  await H.press('折一下');
  H.ok(await H.out('same') === '1' && (await H.read()).includes('正好重合') && await H.done('same'), '再折：两半重合');
  console.log('2. 转到对角线');
  await H.open('fold-diagonal');
  await H.press('折一下');
  H.ok(await H.out('same') === '0' && await H.done('wrong'), '30° 折：对不齐');
  await H.press('打开');
  await H.drag(P(30, 3.8), P(45, 3.8));
  H.ok((await H.props()).angle === 45, '真实拖一头的圆点：转到 45°');
  await H.press('折一下');
  H.ok(await H.out('same') === '1' && (await H.text()).includes('找到的对称轴：45°') && await H.done('diag'), '沿对角线折：重合，记下 45°');
  console.log('3. 长方形');
  await H.open('fd-rect-axes');
  await H.drag(P(30, 3.8), P(45, 3.8)); await H.press('折一下');
  H.ok(await H.out('same') === '0', '长方形沿 45° 折：对不齐');
  await H.press('打开'); await H.drag(P(45, 3.8), P(90, 3.8)); await H.press('折一下');
  await H.press('打开'); await H.drag(P(90, 3.8), P(0, 3.8)); await H.press('折一下');
  H.ok(await H.out('all') === '1' && (await H.read('[data-all]')).includes('长方形有 2 条对称轴') && await H.done('all'), '0°、90°：找全 2 条');
  console.log('4. 平行四边形');
  await H.open('fd-pgram-none');
  await H.press('它没有对称轴');
  H.ok(await H.out('all') === '1' && (await H.read('[data-all]')).includes('中心对称') && await H.done('none'), '没有对称轴：说对了');
  await H.end('折纸与对称');
})();
