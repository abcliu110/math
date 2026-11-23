/* node tests/ui-ladder-enum.js —— 枚举阶梯（主线）：真实鼠标走几级。
 *  1. 第 1 级：1、2、3 自己列全 6 个，研究本记下；追问在列全之前点不动；多一张卡片再列全 12 个；追问选 20 个；
 *  2. 第 4 级：只要双数列全 6 个；点“只要”改成单数，再列全 6 个，研究本两条；追问选对理由；
 *  3. 方法链：“枚举”这条链就是八级阶梯。全程没有打开属性面板、没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('treebench');
  const two = async (...ds) => { for (const d of ds) await H.byTitle('个位放 ' + d); await H.byTitle('这一枝列完了'); };
  console.log('1. 第 1 级 排两位数');
  await H.open('enum-L1');
  H.ok((await H.text()).includes('先做一做，再回答'), '还没列：追问点不动');
  await two(2, 3); await two(1, 3); await two(1, 2);
  H.ok(await H.out('count') === '6' && await H.done('a') && (await H.text()).includes('1–3 两位：6'), '列全 6 个，研究本记下“1–3 两位：6”');
  await H.byTitle('多一张卡片');
  H.ok(await H.out('count') === null && await H.out('m') === '4' && (await H.text()).includes('1–3 两位：6'), '多一张卡片：从头列，研究本还在');
  await two(2, 3, 4); await two(1, 3, 4); await two(1, 2, 4); await two(1, 2, 3);
  H.ok(await H.out('count') === '12' && await H.done('b') && (await H.text()).includes('1–4 两位：12'), '4 张卡片列全 12 个');
  await H.byTitle('25 个');
  H.ok((await H.text()).includes('再想想') && !(await H.done('c')), '追问选 25：再想想');
  await H.byTitle('20 个');
  H.ok(await H.done('c'), '追问选 20：对');
  console.log('2. 第 4 级 只要双数');
  await H.open('enum-L4');
  await two(2, 4); await two(4); await two(2, 4); await two(2);
  H.ok(await H.out('count') === '6' && await H.done('a'), '双数列全：6 个');
  await H.byTitle('改成只要单数');
  H.ok(await H.out('cond') === '2' && await H.out('count') === null, '改成只要单数：从头列');
  await two(3); await two(1, 3); await two(1); await two(1, 3);
  H.ok(await H.out('count') === '6' && await H.done('b') && await H.out('cases') === '2', '单数列全：也是 6 个，研究本两条');
  await H.byTitle('2、4 已经用在十位了，个位只剩一个双数');
  H.ok(await H.done('c'), '追问：理由选对');
  console.log('3. 方法链');
  const L = await H.p.evaluate(() => U.Chain.of('m:enum').filter((x) => x.kind === '阶梯').map((x) => x.id).join(','));
  H.ok(L === 'enum-L1,enum-L2,enum-L3,enum-L4,enum-L5,enum-L6,enum-L7,enum-L8', '“枚举”方法链前面是八级阶梯');
  await H.end('枚举阶梯');
})();
