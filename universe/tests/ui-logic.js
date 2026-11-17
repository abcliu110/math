/* node tests/ui-logic.js —— 推理台：真实鼠标测试。
 *  1. 谁是谁：点小刚的蓝一下是 ✗；小红的红点两下是 ✓，同一行同一列自动 ✗；
 *  2. 小明的猫 ✓；一路标完：全部推出来了；
 *  3. 点线索划掉；把一列全标 ✗：写“矛盾”；
 *  4. 全程没有打开属性面板。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('logicbench');
  const cell = (t, n) => H.byTitle(t).then(() => (n === 2 ? H.byTitle(t) : null));
  console.log('1. 标 ✗ ✓');
  await H.open('deduce-who');
  await cell('小刚：蓝', 1);
  H.ok(await H.done('excl'), '小刚的蓝点一下：✗');
  await cell('小红：红', 2);
  const has = (who, v, k) => H.p.evaluate(([who, v, k]) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'logicbench'); return U.LogicBench.has(e.props, who, v, k); }, [who, v, k]);
  H.ok(await H.done('red') && await has('小红', '蓝', 1) && await has('小明', '红', 1) && await has('小刚', '红', 1), '小红的红 ✓：同一行、同一列自动 ✗');
  console.log('2. 一路推完');
  await cell('小明：蓝', 2); await cell('小明：猫', 2);
  H.ok(await H.done('cat') && await has('小刚', '绿', 1) === false, '小明蓝、猫 ✓');
  await cell('小刚：绿', 2); await cell('小红：兔', 2); await cell('小刚：狗', 2);
  H.ok(await H.out('solved') === '1' && (await H.read()).includes('小红：红、兔') && await H.done('done'), '全部推出来了');
  console.log('3. 线索、矛盾');
  await H.byTitle('线索 1');
  H.ok((await H.props()).used === '0', '点线索 1：划掉');
  await H.open('lg-jobs');
  await cell('张：老师', 1); await cell('王：老师', 1); await cell('李：老师', 1);
  H.ok((await H.text()).includes('矛盾'), '老师一列全标 ✗：写“矛盾”');
  await H.end('推理台');
})();
