/* node tests/ui-play4.js —— 找错、可轻可重、推星期、最少跳几下：真实鼠标测试。
 *  1. 小明 47 + 38 = 75：点个位说“这一位没错”；点十位找到；点 7 没改对，点 8 改对；
 *  2. 12 个零件可轻可重：真实点 1–4 放左、5–8 放右称一次（平）；再称两次：找到零件 11，比较重，3 次最少；
 *  3. 日历：翻到 12 月，点 25 日：星期五；
 *  4. 最少跳几下：全用 3 再补 5，到了但不是最少；重跳 5、5、5、5、3：最少 5 下；
 *  5. 全程没有打开属性面板、没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('vertbench');
  const p = H.p;
  const out = (type, port) => p.evaluate(([t, port]) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === t), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, [type, port]);

  console.log('1. 找错');
  await H.open('vt-bug-47');
  await p.locator('.card svg.bdy [data-col="0"]').click(); await p.waitForTimeout(120);
  H.ok(await out('vertbench', 'found') === '0' && (await H.text()).includes('这一位没错'), '点个位：这一位没错');
  await p.locator('.card svg.bdy [data-col="1"]').click(); await p.waitForTimeout(120);
  H.ok(await out('vertbench', 'found') === '1' && (await H.text()).includes('十位错了'), '点十位：找到了');
  await p.locator('.card svg.bdy [data-key="7"]').click(); await p.waitForTimeout(120);
  H.ok(await out('vertbench', 'fixed') === null, '改成 7：还没改对');
  await p.locator('.card svg.bdy [data-key="8"]').click(); await p.waitForTimeout(120);
  H.ok(await out('vertbench', 'fixed') === '1' && (await H.read()).includes('47 + 38 = 85') && await H.done('fixed'), '改成 8：改对了');

  console.log('2. 可轻可重');
  await H.open('wt-12-unknown');
  for (let i = 1; i <= 4; i++) await H.byTitle('零件 ' + i);
  for (let i = 5; i <= 8; i++) { await H.byTitle('零件 ' + i); await H.byTitle('零件 ' + i); }
  await H.press('称一下');
  H.ok(await out('weighbench', 'left') === '4' && (await H.text()).includes('平'), '4 对 4：平了，可疑的只剩 9–12');
  await p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'weighbench'); UI.App.act({ t: 'set', id: e.id, k: 'pan', v: '222000001110' }); });
  await H.press('称一下');
  await p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'weighbench'); UI.App.act({ t: 'set', id: e.id, k: 'pan', v: '000000001200' }); });
  await H.press('称一下');
  H.ok(await out('weighbench', 'found') === '1' && await out('weighbench', 'heavy') === '1' && (await H.read()).includes('零件 11，它比较重') && await H.done('best'), '称 3 次：零件 11，比较重');

  console.log('3. 推星期');
  await H.open('cal-xmas');
  await H.press('▶');
  await H.byTitle('12 月 25 日');
  H.ok(await out('calbench', 'dow') === '5' && (await H.read('[data-dow]')).includes('2026 年 12 月 25 日是星期五') && await H.done('dow'), '翻到 12 月点 25 日：星期五');

  console.log('4. 最少跳几下');
  await H.open('nl-jump-23');
  for (let i = 0; i < 6; i++) await H.byTitle('跳 +3');
  await H.byTitle('跳 +5');
  H.ok(await out('numlinebench', 'arrived') === '1' && await out('numlinebench', 'fewest') === null && (await H.read()).includes('最少只要 5 下'), '3 跳 6 下再跳 5：到了，但最少只要 5 下');
  await H.byTitle('重跳');
  for (let i = 0; i < 4; i++) await H.byTitle('跳 +5');
  await H.byTitle('跳 +3');
  H.ok(await out('numlinebench', 'fewest') === '1' && await H.done('few'), '5、5、5、5、3：最少 5 下');
  await H.end('找错、可轻可重、推星期、最少跳几下');
})();
