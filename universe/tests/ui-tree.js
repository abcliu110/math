/* node tests/ui-tree.js —— 枚举树：真实鼠标测试（孩子自己一个一个列）。
 *  1. 1、2、3 排三位数：点卡片一位一位排出 123；同一张用两次有提醒；没列全点“列完了”只说没列全；列重复有提醒；三枝列完才有“一共 6 种”，写成 2 × 3；
 *  2. 0、1、2、3 排两位数：0 打头排不出数，要自己剪掉；1 那一枝不能剪；一共 9 个；
 *  3. 只要双数：列单数有提醒；每枝不一样多，2 + 1 + 2 + 1 = 6；擦掉最后一个能擦；
 *  4. 凑 10 元：先定 5 元用几张，再点 2 元用几张；凑超了有提醒；6 + 3 + 1 = 10；“多 1 元”从头列；全程没有打开属性面板、没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('treebench');
  const two = async (...ds) => { for (const d of ds) await H.byTitle('个位放 ' + d); };
  const three = async (...ps) => { for (const [a, b] of ps) { await H.byTitle('十位放 ' + a); await H.byTitle('个位放 ' + b); } };
  console.log('1. 排三位数');
  await H.open('tr-123');
  H.ok(await H.out('count') === null && await H.out('rows') === '3' && await H.out('seen') === '0', '开始：3 枝，什么都还没列');
  await three([2, 3]);
  H.ok(await H.out('seen') === '1' && (await H.text()).includes('123'), '点十位 2、个位 3：列出 123');
  await H.byTitle('十位放 1');
  H.ok((await H.text()).includes('只能用一次') && await H.out('seen') === '1', '1 打头再放 1：每张卡片只能用一次');
  await H.byTitle('这一枝列完了');
  H.ok((await H.text()).includes('还没列全') && (await H.props()).open === 0, '只列了 123 就说列完了：还没列全，不往下走');
  await three([3, 2]);
  await H.byTitle('这一枝列完了');
  H.ok((await H.props()).open === 1 && await H.out('seen') === '2', '123、132：第一枝列完了');
  await three([1, 3], [1, 3]);
  H.ok((await H.text()).includes('213 已经列过了') && await H.out('seen') === '3', '213 再列一次：已经列过了');
  await three([3, 1]); await H.byTitle('这一枝列完了');
  await three([1, 2], [2, 1]); await H.byTitle('这一枝列完了');
  H.ok(await H.out('count') === '6' && (await H.text()).includes('2 × 3 = 6') && await H.done('c'), '三枝列完：每枝 2 个，2 × 3 = 6');
  console.log('2. 带 0 的卡片');
  await H.open('tr-0123');
  await two(1);
  H.ok((await H.text()).includes('0 打头') && await H.out('seen') === '0', '0 打头放个位：排出来的不是两位数');
  await H.byTitle('剪掉这一枝');
  H.ok((await H.props()).open === 1 && (await H.text()).includes('整枝剪掉'), '自己把 0 那一枝剪掉');
  await H.byTitle('剪掉这一枝');
  H.ok((await H.text()).includes('不能剪') && (await H.props()).open === 1, '1 打头能排出数来：不能剪');
  await two(0, 2, 3); await H.byTitle('这一枝列完了');
  await two(0, 1, 3); await H.byTitle('这一枝列完了');
  await two(0, 1, 2); await H.byTitle('这一枝列完了');
  H.ok(await H.out('count') === '9' && await H.done('c'), '一共 9 个（不是 12 个）');
  console.log('3. 只要双数');
  await H.open('tr-even');
  await two(3);
  H.ok((await H.text()).includes('13 是单数') && await H.out('seen') === '0', '列 13：是单数，不要');
  await two(4, 2);
  H.ok((await H.text()).includes('从小到大'), '先 14 后 12：提醒按从小到大列');
  await H.byTitle('擦掉最后一个');
  H.ok(await H.out('seen') === '1', '擦掉最后一个：只剩 14');
  await two(2); await H.byTitle('这一枝列完了');
  await two(4); await H.byTitle('这一枝列完了');
  await two(2, 4); await H.byTitle('这一枝列完了');
  await two(2); await H.byTitle('这一枝列完了');
  H.ok(await H.out('count') === '6' && (await H.text()).includes('2 + 1 + 2 + 1 = 6') && await H.done('c'), '每枝不一样多，加起来 6 个');
  console.log('4. 凑 10 元');
  await H.open('tr-coins-10');
  for (let j = 0; j <= 5; j++) await H.byTitle('2 元用 ' + j + ' 张');
  await H.byTitle('这一枝列完了');
  await H.byTitle('2 元用 3 张');
  H.ok((await H.text()).includes('超过 10 元') && await H.out('seen') === '6', '5 元 1 张、2 元 3 张：超过 10 元了');
  for (let j = 0; j <= 2; j++) await H.byTitle('2 元用 ' + j + ' 张');
  await H.byTitle('这一枝列完了');
  await H.byTitle('2 元用 0 张'); await H.byTitle('这一枝列完了');
  H.ok(await H.out('count') === '10' && (await H.text()).includes('6 + 3 + 1 = 10') && await H.done('c'), '5 元 0、1、2 张：6 + 3 + 1 = 10 种');
  await H.byTitle('多 1 元');
  H.ok(await H.out('count') === null && (await H.props()).amt === 11 && (await H.props()).open === 0 && await H.out('seen') === '0', '多 1 元：从头列');
  await H.end('枚举树');
})();
