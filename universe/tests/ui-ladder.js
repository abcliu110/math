/* node tests/ui-ladder.js —— 不变量阶梯（样板主线）：真实鼠标走几级。
 *  1. 第 1 级：擦完一遍剩 21；追问在“做一做”之前点不动；换一种擦法再擦完，研究本记了两条；盯住“和”找到不变量；追问选 55；
 *  2. 第 4 级：7 个杯子找到不变量、下结论“不能”，研究本记下；点“少一个杯子”换成 6 个，翻出全部朝上；
 *  3. 第 7 级：变色龙，“红比黄多几”本身、单双都会变，除以 3 的余数不变；下结论“不能”；换一组，真的变成同一种颜色；
 *  4. 方法链：“不变量”这条链就是八级阶梯。全程没有打开属性面板、没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('invbench');
  const erase = async (i, a, j, b) => { await H.byTitle('选第 ' + i + ' 个数 ' + a); await H.byTitle('和第 ' + j + ' 个数 ' + b + ' 一起擦掉'); };
  const flip = async (...cups) => { for (const c of cups) await H.byTitle('选第 ' + c + ' 个杯子'); await H.byTitle('把选好的杯子翻过来'); };
  console.log('1. 第 1 级 擦数写和');
  await H.open('inv-L1');
  H.ok((await H.text()).includes('先做一做，再回答'), '还没做：追问点不动');
  await erase(1, 1, 2, 2); await erase(1, 3, 2, 3); await erase(1, 6, 2, 4); await erase(1, 10, 2, 5); await erase(1, 15, 2, 6);
  H.ok(await H.out('last') === '21' && await H.done('a') && (await H.text()).includes('研究本'), '擦完：剩 21，记进研究本');
  await H.byTitle('从头再来');
  await erase(5, 5, 6, 6); await erase(4, 4, 5, 11); await erase(3, 3, 4, 15); await erase(2, 2, 3, 18); await erase(1, 1, 2, 20);
  H.ok(await H.out('plays') === '2' && !(await H.done('b')), '换一种擦法也剩 21：研究本两条，但还没用放大镜');
  await H.byTitle('放大镜看和');
  H.ok(await H.out('found') === '1' && await H.done('b'), '盯住和：一直 21，第二层做到');
  await H.byTitle('50');
  H.ok((await H.text()).includes('再想想') && !(await H.done('c')), '追问选 50：再想想');
  await H.byTitle('55');
  H.ok(await H.done('c') && (await H.text()).includes('✓ 对'), '追问选 55：对');
  console.log('2. 第 4 级 翻杯子');
  await H.open('inv-L4');
  await flip(1, 2); await flip(1, 3);
  await H.byTitle('放大镜看朝上的个数'); await H.byTitle('看它的单双');
  H.ok(await H.done('a'), '朝上个数的单双：找到不变量');
  await H.byTitle('不能全部朝上');
  H.ok(await H.done('b') && (await H.text()).includes('7 个翻 2：不能'), '下结论“不能”，研究本记下“7 个翻 2：不能”');
  await H.byTitle('少一个杯子');
  H.ok(await H.out('n') === '6' && await H.out('steps') === '0' && (await H.text()).includes('7 个翻 2：不能'), '换成 6 个杯子：从头开始，研究本还在');
  await flip(1, 2); await flip(3, 4); await flip(5, 6);
  H.ok(await H.out('allup') === '1' && await H.done('c') && (await H.text()).includes('6 个翻 2：能'), '6 个杯子翻出全部朝上，研究本记下');
  console.log('3. 第 7 级 变色龙');
  await H.open('inv-L7');
  await H.byTitle('红和黄相遇'); await H.byTitle('红和黄相遇');
  await H.byTitle('放大镜看红比黄多几');
  H.ok(await H.out('found') === '0' && (await H.text()).includes('还没变'), '红比黄多几：两次红黄相遇，碰巧没变，不算找到');
  await H.byTitle('红和蓝相遇');
  H.ok(await H.out('found') === '0' && (await H.text()).includes('不是不变量'), '红蓝相遇：差变了 3，本身不是不变量');
  await H.byTitle('看它的单双');
  H.ok(await H.out('found') === '0', '单双也会变');
  await H.byTitle('看它除以 3 的余数');
  H.ok(await H.out('found') === '1' && await H.done('a'), '除以 3 的余数：一直不变，找到了');
  await H.byTitle('不能变成同一种颜色');
  H.ok(await H.done('b'), '13、15、17：永远不能');
  await H.byTitle('换一组');
  await H.byTitle('红和黄相遇'); for (let i = 0; i < 3; i++) await H.byTitle('红和蓝相遇');
  H.ok(await H.out('mono') === '1' && await H.done('c'), '换成 4、7、1：红黄相遇一次，红蓝相遇三次，全变成黄色');
  console.log('4. 方法链');
  const L = await H.p.evaluate(() => U.Chain.of('m:invariant').filter((x) => x.kind === '阶梯').map((x) => x.id).join(','));
  H.ok(L === 'inv-L1,inv-L2,inv-L3,inv-L4,inv-L5,inv-L6,inv-L7,inv-L8', '“不变量”方法链前面是八级阶梯');
  await H.end('不变量阶梯');
})();
