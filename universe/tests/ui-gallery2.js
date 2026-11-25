/* node tests/ui-gallery2.js —— 解法图鉴第二页（1 + 2 + … + 7）另外几格：真实鼠标。
 *  1. 一个一个加：每次点最左边的加号，点 6 次：28；
 *  2. 换个顺序凑成 8：点 1 和 7、2 和 6、3 和 5 中间的加号，算式变成 8 + 8 + 8 + 4（里程碑），再加完：28；
 *     只点最左边的加号一路加下去，也是 28，但“凑出三个 8”没有完成；
 *  3. 搬成一样高：开头写“一共 ？ 块”；7 给 1 搬 3 块、6 给 2 搬 2 块、5 给 3 搬 1 块：每堆 4 块，写出 4 × 7 = 28；
 *  4. 桥“倒过来写 ↔ 搬成一样高”：只搬 6 块拿到加分；多搬两块（搬过去又搬回来）就拿不到；没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('termsbench');
  const p = H.p;
  const outOf = (type, port) => p.evaluate(([type, port]) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === type), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, [type, port]);
  const plus = (n) => H.byTitle('点一下：先算这一步', n);
  const grip = (id) => p.evaluate((id) => { const g = document.querySelector('.card svg.bdy [data-grip="' + id + '"]'); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  const col = (j) => p.evaluate((j) => { const sv = document.querySelector('.card svg.bdy'), b = sv.getBoundingClientRect(), z = b.width / +sv.getAttribute('width'); return { x: b.x + (44 + j * 54 + 20) * z, y: b.y + 240 * z }; }, j);
  const move = async (i, j) => {
    await p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
    const a = await grip('c' + i), c = await col(j);
    await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move((a.x + c.x) / 2, (a.y + c.y) / 2, { steps: 5 }); await p.mouse.move(c.x, c.y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(220);
  };
  const level = async () => { for (let k = 0; k < 3; k++) await move(6, 0); for (let k = 0; k < 2; k++) await move(5, 1); await move(4, 2); };

  console.log('1. 一个一个加');
  await H.open('gal-gs-add');
  for (let k = 0; k < 6; k++) await plus(0);
  H.ok(await outOf('termsbench', 'value') === '28' && await outOf('termsbench', 'steps') === '6' && await H.done('sum'), '点 6 次最左边的加号：28（里程碑）');

  console.log('2. 换个顺序，凑成 8');
  await H.open('gal-gs-pair');
  await plus(0); await plus(1); await plus(2);
  H.ok(/8\|\+\|8\|\+\|8\|\+\|4/.test(await H.text()) && await H.done('eights'), '点 1 和 7、2 和 6、3 和 5 中间：8 + 8 + 8 + 4（里程碑）');
  for (let k = 0; k < 3; k++) await plus(0);
  H.ok(await outOf('termsbench', 'value') === '28' && await H.done('sum'), '再加完：28');
  await H.open('gal-gs-pair');
  for (let k = 0; k < 6; k++) await plus(0);
  H.ok(await outOf('termsbench', 'value') === '28' && !(await H.done('eights')), '只点最左边一路加下去：也是 28，但“凑出三个 8”没有完成');

  console.log('3. 搬成一样高');
  await H.open('gal-gs-mean');
  H.ok(/一共 ？ 块/.test(await H.text()) && await outOf('meanbench', 'total') === null, '开头写“一共 ？ 块”，总数的输出口也先不给');
  await level();
  H.ok(await outOf('meanbench', 'level') === '1' && /一共 4 × 7 = 28 块/.test(await H.text()) && await H.done('level'), '搬 6 块：每堆 4 块，写出 4 × 7 = 28（里程碑）');

  console.log('4. 桥：只搬 6 块');
  await H.open('gal-gs-br-mean');
  await level();
  H.ok(await H.done('level') && await H.done('six') && await outOf('meanbench', 'moves') === '6', '只搬 6 块就搬平：拿到加分');
  await H.open('gal-gs-br-mean');
  await move(6, 0); await move(0, 6);
  await level();
  H.ok(await H.done('level') && !(await H.done('six')) && await outOf('meanbench', 'moves') === '8', '搬过去又搬回来，一共 8 块：搬平了，但没有加分');
  await H.end('图鉴第二页');
})();
