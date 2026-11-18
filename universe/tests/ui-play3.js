/* node tests/ui-play3.js —— 第二层新玩法第二批：真实鼠标测试。
 *  1. 篱笆围地（20 米）：真实拖到长 3：21 平方米，不是最大；记下；拖到长 5：25，最大，说围成正方形；
 *  2. 田忌赛马：上对上、中对中、下对下，三场全输，说最多能赢 2 场；重排：下对上、上对中、中对下：赢 2 场；
 *  3. 分数比大小 2/3 和 3/4：先点“>”说不对；切成一样大的格子以后点“<”：对；
 *  4. 全程没有打开属性面板、没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('areabench');
  const p = H.p;
  const out = (type, port) => p.evaluate(([t, port]) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === t), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, [type, port]);
  const X = (u) => 40 + u * 22, Y = (v) => 290 - v * 22;

  console.log('1. 篱笆围地');
  await H.open('ar-fence-20');
  await H.drag([X(1), Y(8 / 2)], [X(3), Y(7 / 2)]);
  H.ok(await out('areabench', 'area') === '21' && await out('areabench', 'best') === null, '真实拖到长 3：3 × 7 = 21，不是最大');
  await H.byTitle('记下这一种');
  await H.drag([X(3), Y(7 / 2)], [X(5), Y(5 / 2)]);
  H.ok(await out('areabench', 'best') === '1' && (await H.read()).includes('围成正方形面积最大') && await H.done('best'), '拖到长 5：25 平方米，围成正方形最大');

  console.log('2. 田忌赛马');
  await H.open('opt-horse');
  for (const n of ['上等马', '中等马', '下等马']) await H.press('派你的' + n);
  H.ok(await out('optbench', 'wins') === '0' && (await H.read()).includes('最多能赢 2 场'), '同等对同等：三场全输，最多能赢 2 场');
  await H.press('重新排');
  for (const n of ['下等马', '上等马', '中等马']) await H.press('派你的' + n);
  H.ok(await out('optbench', 'wins') === '2' && await out('optbench', 'best') === '1' && await H.done('best'), '下对上、上对中、中对下：赢 2 场');

  console.log('3. 分数比大小');
  await H.open('fr-cmp');
  await H.byTitle('选“>”');
  H.ok(await out('fracbench', 'cmpok') === '0' && (await H.read()).includes('不对'), '先点“>”：不对');
  await H.press('上 ×4'); await H.press('下 ×3');
  H.ok((await H.text()).includes('格子一样大了：比格数'), '上 ×4、下 ×3：格子一样大了');
  await H.byTitle('选“<”');
  H.ok(await out('fracbench', 'cmpok') === '1' && (await H.read()).includes('2/3 < 3/4') && await H.done('ok'), '点“<”：对，2/3 < 3/4');
  await H.end('第二层新玩法第二批');
})();
