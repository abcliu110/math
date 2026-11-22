/* node tests/ui-inv.js —— 不变量放大镜：真实鼠标测试。
 *  1. 擦数写和：盯住“个数”变了（标红，不算找到）；换成“和”：一直 21，找到了；擦到只剩 21；
 *  2. 1 到 100 写差：结论按钮先点不动；盯“和”会变，换“和的单双”找到；先点错的结论有提醒，再点对的；
 *  3. 7 个杯子每次翻 2 个：退一步能退；盯“朝上个数的单双”找到，下结论“不能”；
 *  4. 7 个杯子每次翻 3 个：真的翻出全部朝上；全程没有打开属性面板、没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('invbench');
  const erase = async (i, a, j, b) => { await H.byTitle('选第 ' + i + ' 个数 ' + a); await H.byTitle('和第 ' + j + ' 个数 ' + b + ' 一起擦掉'); };
  const flip = async (...cups) => { for (const c of cups) await H.byTitle('选第 ' + c + ' 个杯子'); await H.byTitle('把选好的杯子翻过来'); };
  console.log('1. 擦数写和');
  await H.open('iv-sum-board');
  await erase(1, 1, 2, 2); await erase(1, 3, 2, 3);
  await H.byTitle('放大镜看个数');
  H.ok(await H.out('steps') === '2' && await H.out('found') === '0' && (await H.text()).includes('不是不变量'), '盯住个数：6 → 5 → 4，变了，不是不变量');
  await H.byTitle('放大镜看和');
  H.ok(await H.out('found') === '1' && await H.done('f'), '盯住和：一直是 21，找到不变量');
  await erase(1, 6, 2, 4); await erase(1, 10, 2, 5); await erase(1, 15, 2, 6);
  H.ok(await H.out('last') === '21' && (await H.read()).includes('21') && await H.done('l'), '擦到只剩一个数：21');
  console.log('2. 1 到 100 写差');
  await H.open('iv-diff-100');
  H.ok(await H.out('ans') === null && (await H.text()).includes('先找到不变量，才能下结论'), '还没找到不变量：结论按钮是灰的');
  await erase(1, 1, 2, 2); await erase(1, 1, 2, 3);
  await H.byTitle('放大镜看和');
  H.ok(await H.out('found') === '0' && (await H.text()).includes('不是不变量'), '盯住和：21 → 19 → 17，变了');
  await H.byTitle('放大镜看和的单双');
  H.ok(await H.out('found') === '1' && await H.done('f'), '盯住和的单双：一直是单，找到了');
  await H.byTitle('1 到 100 最后剩单数');
  H.ok(await H.out('ans') === '1' && !(await H.done('a')) && (await H.text()).includes('再想想'), '先点“单数”：提醒再想想（1 到 100 的和是 5050）');
  await H.byTitle('1 到 100 最后剩双数');
  H.ok(await H.out('ans') === '2' && await H.done('a'), '改成“双数”：对');
  console.log('3. 7 个杯子，每次翻 2 个');
  await H.open('iv-cups-7-2');
  await flip(1, 2);
  H.ok(await H.out('up') === '2', '翻了 2 个：朝上 2 个');
  await H.byTitle('退一步');
  H.ok(await H.out('up') === '0' && await H.out('steps') === '0', '退一步：回到全部朝下');
  await flip(1, 2); await flip(1, 3);
  await H.byTitle('放大镜看朝上个数的单双');
  H.ok(await H.out('found') === '1' && await H.done('f'), '朝上个数的单双：双、双、双，找到不变量');
  await H.byTitle('不能全部朝上');
  H.ok(await H.out('ans') === '2' && await H.done('a'), '下结论：永远不能全部朝上');
  console.log('4. 7 个杯子，每次翻 3 个');
  await H.open('iv-cups-7-3');
  await flip(1, 2, 3); await flip(1, 4, 5); await flip(1, 6, 7);
  H.ok(await H.out('allup') === '1' && await H.out('steps') === '3' && await H.done('u'), '0 → 3 → 4 → 7：翻 3 次全部朝上');
  await H.end('不变量放大镜');
})();
