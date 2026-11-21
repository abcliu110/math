/* node tests/ui-rel.js —— 关系图：真实鼠标测试。
 *  1. 和倍：点“梨 = 一共 ÷ 倍数”被拦住（16 ÷ 3 不是梨），踩陷阱；连上三张对的卡；
 *     先点“苹果 = 梨 × 倍数”：还缺梨，梨标成橙色；按顺序点三个关系圈：苹果 12；
 *  2. 归一：关系已经连好，点两个关系圈：21 元；
 *  3. 全程没有打开属性面板、没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('relbench');
  console.log('1. 和倍');
  await H.open('rl-times-sum');
  await H.byTitle('关系卡 1');
  H.ok(await H.out('wrong') === '1' && (await H.text()).includes('不是梨（4）'), '梨 = 一共 ÷ 倍数：16 ÷ 3 不是梨，拦住');
  for (const i of [2, 3, 4]) await H.byTitle('关系卡 ' + i);
  H.ok(await H.out('modeled') === '1', '三张对的卡连上：关系连好了');
  await H.byTitle('关系 苹果 = 梨 × 倍数');
  H.ok(await H.out('need') === '2' && (await H.text()).includes('还缺 苹果、梨'), '先点苹果那个关系：还缺苹果和梨（分析法）');
  await H.byTitle('关系 一共几份 = 倍数 + 1 份');
  await H.byTitle('关系 梨 = 一共 ÷ 一共几份');
  await H.byTitle('关系 苹果 = 梨 × 倍数');
  H.ok(await H.out('ans') === '12' && (await H.read()).includes('苹果 = 12（3 步）') && await H.done('ans'), '三步算出苹果 12');
  console.log('2. 归一');
  await H.open('rl-unit');
  await H.byTitle('关系 总价（7 支） = 单价 × 数量（7）');
  H.ok(await H.out('steps') === '0', '单价还不知道：先算不了');
  await H.byTitle('关系 单价 = 总价（4 支） ÷ 数量（4）');
  await H.byTitle('关系 总价（7 支） = 单价 × 数量（7）');
  H.ok(await H.out('ans') === '21' && await H.done('ans'), '单价 3，7 支 21 元');
  await H.end('关系图');
})();
