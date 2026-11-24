/* node tests/ui-ladder-assume.js —— 假设阶梯（主线）：真实鼠标走几级。
 *  1. 第 1 级：追问之前点不动；一只一只换到 26 条腿，研究本记下；换一组（10 个头 32 条腿）再换对；追问选“2 条”；
 *  2. 第 2 级：拖一下把手就换对（只试了 2 种）；换一组后先点错一只，“从头再来”清空试过的，再一拖换对；
 *  3. 第 5 级：27 条腿说“凑不出来”，对，记进研究本；目标改成 26，再说“凑不出来”被纠正；换对；
 *  4. 第 6 级：倒扣分，从全对开始，换一道差 7 分；换回 2 道错，正好 36 分，错题头上写着 −2；
 *  5. 方法链：“假设”这条链前面是八级阶梯。全程没有打开属性面板、没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('swapbench');
  const toB = async (nb, k) => { for (let i = 0; i < k; i++) await H.byTitle('点一下：换成' + nb); };
  const grip = (k, row) => [24 + k * 38, 186 + (row || 0) * 46 + 21];   // 把手在第 k 个前面（第一行）
  console.log('1. 第 1 级 鸡兔同笼');
  await H.open('asm-L1');
  H.ok((await H.text()).includes('先做一做，再回答'), '还没做：追问点不动');
  await toB('兔', 5);
  H.ok(await H.out('ok') === '1' && await H.done('a') && (await H.text()).includes('8 个（鸡 2、兔 4）一共 26：兔 5 个'), '一只一只换到 26 条腿：研究本记下');
  await H.byTitle('换一组');
  H.ok(await H.out('si') === '2' && await H.out('b') === '0' && await H.out('tries') === '1' && (await H.text()).includes('一共 26：兔 5 个'), '换一组（10 个头 32 条腿）：从全是鸡开始，研究本还在');
  await toB('兔', 6);
  H.ok(await H.done('b'), '10 个头 32 条腿：兔 6 只');
  await H.byTitle('2 条');
  H.ok(await H.done('c') && (await H.text()).includes('✓ 对'), '追问：每换一只多 2 条');
  console.log('2. 第 2 级 一下换对');
  await H.open('asm-L2');
  await H.drag(grip(0), grip(4));
  H.ok(await H.out('b') === '4' && await H.out('tries') === '2' && await H.done('a'), '拖一下把手到第 4 个后面：28 条腿，只试了 2 种');
  await H.byTitle('换一组'); await toB('兔', 1);
  await H.byTitle('从头再来：全部换回鸡');
  H.ok(await H.out('b') === '0' && await H.out('tries') === '1' && !(await H.done('b')), '点错一只以后“从头再来”：全是鸡，试过的清空');
  await H.drag(grip(0), grip(8));
  H.ok(await H.out('b') === '8' && await H.done('b'), '20 个头 56 条腿：一拖换到 8 只兔');
  await H.byTitle('12 只');
  H.ok(await H.done('c'), '追问：35 个头 94 条腿，12 只兔');
  console.log('3. 第 5 级 凑不出来');
  await H.open('asm-L5');
  await H.byTitle('怎么换都凑不出 27');
  H.ok(await H.out('no') === '1' && await H.done('a') && (await H.text()).includes('记进研究本了') && (await H.text()).includes('一共 27：凑不出来'), '27 条腿说“凑不出来”：对，记进研究本');
  await H.byTitle('目标少 1');
  H.ok((await H.props()).target === 26 && (await H.props()).claim === false, '目标改成 26：重新开始');
  await H.byTitle('怎么换都凑不出 26');
  H.ok(await H.out('no') === '0' && (await H.text()).includes('其实凑得出来'), '26 也说“凑不出来”：被纠正');
  await toB('兔', 5);
  H.ok(await H.done('b') && (await H.props()).claim === false, '换 5 只兔：26 条腿正好');
  await H.byTitle('不能，全是兔才 32 条');
  H.ok(await H.done('c'), '追问：8 个头 40 条腿太多了');
  console.log('4. 第 6 级 倒扣分');
  await H.open('asm-L6');
  H.ok((await H.text()).includes('多了 14') && (await H.text()).includes('多 7 分'), '从全对开始：50 分多了 14，换一道差 7 分');
  await H.byTitle('点一下：换回错'); await H.byTitle('点一下：换回错');
  H.ok(await H.out('ok') === '1' && await H.out('b') === '8' && await H.done('a') && (await H.text()).includes('−2'), '换回 2 道错：对 8 道，36 分，错题头上写 −2');
  await H.byTitle('7 分');
  H.ok(await H.done('c'), '追问：错一题比对一题少 7 分');
  console.log('5. 方法链');
  const L = await H.p.evaluate(() => U.Chain.of('m:assume').filter((x) => x.kind === '阶梯').map((x) => x.id).join(','));
  H.ok(L === 'asm-L1,asm-L2,asm-L3,asm-L4,asm-L5,asm-L6,asm-L7,asm-L8', '“假设”方法链前面是八级阶梯');
  await H.end('假设阶梯');
})();
