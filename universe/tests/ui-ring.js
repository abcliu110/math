/* node tests/ui-ring.js —— 跳格钟和质因数积木：真实鼠标测试。
 *  1. 12 格的钟：步长 4 走一圈，3 拍回到 0、走到 3 个格；+ 两下到 6：2 个格；再换到 5：走遍；表里记着三种步长；
 *  2. 乘法钟 3 的 100 次方：走一圈 4 拍一轮；走 10 拍 × 10 到第 100 拍，停在 1；
 *  3. 质因数积木：36 先点 ÷ 5 被拦住；÷ 2、÷ 2、÷ 3、÷ 3 拆完；约分 24/36：点分子的 2、2、3，得 2/3 最简；搭数 2 × 2 × 3 × 5 = 60 有 12 个因数；
 *  4. 全程没有打开属性面板、没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('ringbench');
  const p = H.p;
  const out = (type, port) => p.evaluate(([t, port]) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === t), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, [type, port]);
  console.log('1. 走遍');
  await H.open('clock-gcd');
  await H.byTitle('走到回到起点');
  H.ok(await H.out('period') === '3' && await H.out('reach') === '3' && (await H.read()).includes('没走遍') && await H.done('k4'), '步长 4：3 拍回到 0，只走到 3 个格');
  await H.byTitle('步长多 1'); await H.byTitle('步长多 1');
  H.ok(await H.out('k') === '6' && await H.out('beats') === '0' && await H.out('reach') === null, '换到 6：从头走');
  await H.byTitle('走到回到起点');
  H.ok(await H.out('reach') === '2' && await H.done('k6'), '步长 6：2 个格');
  await H.byTitle('步长少 1');
  await H.byTitle('走到回到起点');
  H.ok(await H.out('all') === '1' && (await H.read()).includes('走遍了') && await H.done('all12'), '步长 5：走遍 12 个格');
  H.ok((await H.text()).includes('4　　3') && (await H.text()).includes('5　　12（走遍）'), '表里记着走过的步长');
  console.log('2. 乘法钟');
  await H.open('last-digit-cycle');
  await H.byTitle('走到回到起点');
  H.ok(await H.out('period') === '4' && await H.done('cycle'), '3 的乘法钟：4 拍一轮');
  await H.byTitle('回到起点');
  for (let i = 0; i < 10; i++) await H.byTitle('走 10 拍');
  H.ok(await H.out('beats') === '100' && await H.out('atv') === '1' && await H.done('e100'), '第 100 拍停在 1');
  console.log('3. 质因数积木');
  await H.open('pb-split-36');
  await H.byTitle('除以 5');
  H.ok(await out('factorbench', 'blocks') === '0' && (await H.text()).includes('36 不能被 5 整除'), '÷ 5：除不尽，被拦住');
  for (const q of [2, 2, 3, 3]) await H.byTitle('除以 ' + q);
  H.ok(await out('factorbench', 'split') === '1' && (await H.read()).includes('36 = 2 × 2 × 3 × 3') && await H.done('four'), '拆完：2 × 2 × 3 × 3');
  await H.open('pb-reduce-24-36');
  for (const q of [2, 2, 3]) await H.byTitle('约掉 ' + q);
  H.ok(await out('factorbench', 'rn') === '2' && await out('factorbench', 'rd') === '3' && (await H.read()).includes('2/3 是最简分数') && await H.done('den'), '约掉 2、2、3：2/3');
  await H.open('pb-twelve-divisors');
  for (const q of [2, 2, 3, 5]) await H.byTitle('乘 ' + q);
  H.ok(await out('factorbench', 'value') === '60' && await out('factorbench', 'ndiv') === '12' && await H.done('min'), '2 × 2 × 3 × 5 = 60：12 个因数');
  await H.end('跳格钟、质因数积木');
})();
