/* node tests/ui-ladder-ext.js —— 极端阶梯（主线）：真实鼠标走几级。
 *  1. 第 1 级：红、黄、蓝各拿 1 只卡住，说对 4 只，研究本记下；追问之前点不动；换一袋（4 种颜色）卡住说对 5 只；追问选 11 只；
 *  2. 第 5 级：用“摸完”把红、蓝摸完，卡住 9 个说对了，但不是最倒霉，研究本不记；改成红、黄摸完，11 个，记进研究本；
 *  3. 第 7 级：大袋子 3 个同色 9 个；换问法到“几个红的”，要几个改成 5，用“摸完”摸到卡住，29 个；
 *  4. 方法链：“极端”这条链前面是八级阶梯。全程没有打开属性面板、没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('pigeonbench');
  const take = async (nm, k) => { for (let i = 0; i < k; i++) await H.byTitle('摸一个' + nm + '的'); };
  console.log('1. 第 1 级 摸袜子');
  await H.open('ext-L1');
  H.ok((await H.text()).includes('先做一做，再回答'), '还没摸：追问点不动');
  await take('红', 1); await take('黄', 1); await take('蓝', 1);
  await H.byTitle('保证要摸 4 个');
  H.ok(await H.done('a') && (await H.text()).includes('红4黄4蓝4，2 个同色：4 个'), '卡住说对 4 只：研究本记下');
  await H.byTitle('换一袋');
  H.ok(await H.out('si') === '2' && await H.out('drawn') === '0' && (await H.text()).includes('红4黄4蓝4，2 个同色：4 个'), '换一袋（4 种颜色）：从头摸，研究本还在');
  await take('红', 1); await take('黄', 1); await take('蓝', 1); await take('绿', 1);
  await H.byTitle('保证要摸 5 个');
  H.ok(await H.done('b'), '4 种颜色：5 只');
  await H.byTitle('11 只');
  H.ok(await H.done('c'), '追问：10 种颜色 11 只');
  console.log('2. 第 5 级 每种都有');
  await H.open('ext-L5');
  await H.byTitle('把红的全摸出来'); await H.byTitle('把蓝的全摸出来');
  await H.byTitle('保证要摸 10 个');
  H.ok(await H.out('guar') === '10' && !(await H.done('a')) && await H.out('cases') === '0' && (await H.text()).includes('比一比'), '红、蓝摸完：10 个说对了，但还不是最倒霉，研究本不记');
  await H.byTitle('全部放回袋里');
  await H.byTitle('把红的全摸出来'); await H.byTitle('把黄的全摸出来');
  await H.byTitle('保证要摸 11 个');
  H.ok(await H.done('a') && await H.out('cases') === '1' && (await H.text()).includes('最倒霉的摸法'), '红、黄摸完：11 个，最倒霉，记进研究本');
  console.log('3. 第 7 级 大袋子');
  await H.open('ext-L7');
  for (const nm of ['红', '黄', '蓝', '绿']) await take(nm, 2);
  await H.byTitle('保证要摸 9 个');
  H.ok(await H.done('a'), '3 个同色：9 个');
  await H.byTitle('换问法：每种颜色都有'); await H.byTitle('换问法：几个红的');
  await H.byTitle('多要一个'); await H.byTitle('多要一个');
  H.ok(await H.out('want') === '2' && await H.out('m') === '5' && await H.out('drawn') === '0', '换到“5 个红的”');
  await H.byTitle('把黄的全摸出来'); await H.byTitle('把蓝的全摸出来'); await H.byTitle('把绿的全摸出来'); await take('红', 4);
  await H.byTitle('保证要摸 29 个');
  H.ok(await H.done('b'), '别的全摸完、红的 4 个：29 个');
  console.log('4. 方法链');
  const L = await H.p.evaluate(() => U.Chain.of('m:extreme').filter((x) => x.kind === '阶梯').map((x) => x.id).join(','));
  H.ok(L === 'ext-L1,ext-L2,ext-L3,ext-L4,ext-L5,ext-L6,ext-L7,ext-L8', '“极端”方法链前面是八级阶梯');
  await H.end('极端阶梯');
})();
