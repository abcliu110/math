/* node tests/ui-angle.js —— 量角器与角：真实鼠标测试。
 *  1. 量角：量角器斜着放，读不出；真实拖它边上的圆点转到压住一条边：90°，直角；
 *  2. 开口朝左的角：转到 0° 线压住朝左那条边，读内圈 140°；
 *  3. 一条直线上的两个角：点 ∠1、∠2，写出合起来 180°；对顶角：点 ∠1、∠3，写出对顶角相等；
 *  4. 六边形：连对角线，720°；
 *  5. 全程没有打开属性面板。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('anglebench');
  const V = [250, 270], R = 140, P = (d, r) => [V[0] + r * Math.cos(d * Math.PI / 180), V[1] - r * Math.sin(d * Math.PI / 180)];

  console.log('1. 量角');
  await H.open('mt-right-angle-core');
  H.ok(await H.out('deg') === null && (await H.text()).includes('还没对好'), '量角器没对好：读不出');
  await H.drag(P(75 + 90, R + 12), P(30 + 90, R + 12));
  H.ok((await H.props()).prot === 30 && await H.out('deg') === '90' && (await H.read()).includes('直角') && await H.done('right'), '真实转量角器压住一条边：90°，直角');

  console.log('2. 读内圈');
  await H.open('an-inner-scale');
  await H.drag(P(100 + 90, R + 12), P(0 + 90, R + 12));
  H.ok((await H.props()).prot === 0 && await H.out('deg') === '140' && (await H.read()).includes('读内圈') && await H.done('deg'), '0° 线压住朝左的边：读内圈 140°');

  console.log('3. 直线上的两个角、对顶角');
  await H.open('g4-angle-straight-core');
  await H.byTitle('量 ∠1'); await H.byTitle('量 ∠2');
  H.ok(await H.out('straight') === '1' && (await H.read()).includes('130° + 50° = 180°') && await H.done('yes'), '量了两个角：130° + 50° = 180°，平角');
  await H.open('g7-vertical-angle-trap');
  await H.byTitle('量 ∠1'); await H.byTitle('量 ∠3');
  H.ok(await H.out('vert') === '1' && (await H.read()).includes('对顶角相等') && await H.done('equal'), '量 ∠1 和 ∠3：对顶角相等');

  console.log('4. 多边形内角和');
  await H.open('hexagon-angle');
  await H.press('+'); await H.press('+');
  await H.press('从一个顶点连对角线');
  H.ok(await H.out('sum') === '720' && await H.out('each') === '120' && (await H.read()).includes('4 × 180° = 720°') && await H.done('each'), '6 边形连对角线：4 个三角形，720°，每个 120°');
  await H.end('量角器与角');
})();
