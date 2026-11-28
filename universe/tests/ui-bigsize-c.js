/* node tests/ui-bigsize-c.js —— 试验台增强 7 第二轮（c）：积木、坐标、方向、工程、尺子、圆、三角形，大数也画得下（真实鼠标）。
 *  1. 积木：点“长 +”“宽 +”把底板加到 10 × 10，点“铺满一层”十次搭成 10 × 10 × 10 = 1000；底板格子 14 像素，切到“拿走”真点一格，少一块；
 *  2. 坐标：点坐标格下面的“一格 = 10”，坐标跟着变（图不动）；拖截距到 20，读出 y = 2x + 20 的交点；
 *  3. 方向角：点“每圈 500 米”，拖射线到北偏东 30°、第 3 圈，读成 1500 米，对上目标；
 *  4. 工程：甲队 30 天、乙队 60 天，点两次“过 10 天”，第 20 天做完（不跳过）；
 *  5. 尺子：30 厘米的尺子量 23 厘米的铅笔，拖铅笔头对准 0；
 *  6. 圆：半径从 10 拖到 12（松手后图缩小），再拖到 20，面积 1256；
 *  7. 三角形：小棒 7、24，把第三根拖到 25，是直角三角形；
 *  每一台：卡片宽高不超过 U.kit.big.CARD_MAX；控制台 0 报错。
 *  设了环境变量 B2C_SHOTS（一个目录）时，把每台做完的卡片截图存进去（b2c-ui-*.png）。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
const SHOTS = process.env.B2C_SHOTS || '';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(400);
  const closeDlg = () => p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
  const open = async (id, type, props) => {
    await p.waitForTimeout(500); await closeDlg();
    await p.evaluate((id) => { UI.App.openProblem(id, 'practice'); }, id); await p.waitForTimeout(300);
    await p.evaluate(([type, props]) => {
      document.querySelectorAll('button').forEach((x) => { if (/^(知道了|跳过|先不猜|开始)$/.test(x.textContent.trim())) x.click(); });
      for (const k of Object.keys(UI.S.help || {})) UI.S.help[k] = false;
      if (UI.S.run) UI.S.run.armed = true;
      if (props) { const e = Object.values(UI.S.scene.entities).find((x) => x.type === type); Object.assign(e.props, props); UI.S.D = U.World.evaluate(UI.S.scene); }
      UI.Stage.fit(); UI.Stage.render();
    }, [type, props || null]);
    await p.waitForTimeout(250);
  };
  const ent = (type) => p.evaluate((type) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === type); return Object.assign({}, e.props); }, type);
  const out = (type, port) => p.evaluate(([type, port]) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === type), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, [type, port]);
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);
  const toScreen = (type, cx, cy) => p.evaluate(([type, cx, cy]) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === type), sv = document.querySelector('.card[data-id="' + e.id + '"] svg.bdy'), r = sv.getBoundingClientRect(), k = r.width / +sv.getAttribute('width'); return { x: r.x + cx * k, y: r.y + cy * k }; }, [type, cx, cy]);
  const gripAt = (gid) => p.evaluate((gid) => { const g = document.querySelector('.card svg.bdy [data-grip="' + gid + '"]'); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, gid);
  const dragTo = async (gid, to) => { await closeDlg(); const g = await gripAt(gid); await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move((g.x + to.x) / 2, (g.y + to.y) / 2, { steps: 6 }); await p.mouse.move(to.x, to.y, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(250); };
  const click = async (sel, nth) => { await closeDlg(); await p.locator('.card svg.bdy ' + sel).nth(nth || 0).click(); await p.waitForTimeout(140); };
  const clickText = async (label, nth) => { await closeDlg(); await p.locator('.card svg.bdy [data-pick-set]', { hasText: label }).nth(nth || 0).click(); await p.waitForTimeout(140); };
  const cardOk = async (m) => { const r = await p.evaluate(() => { const c = document.querySelector('.card'), M = U.kit.big.CARD_MAX; return { w: c.offsetWidth, h: c.offsetHeight, M }; }); ok(r.w <= r.M[0] && r.h <= r.M[1], m + '：卡片 ' + r.w + '×' + r.h + ' 不超过 ' + r.M.join('×')); };
  const shot = async (name) => { if (!SHOTS) return; await closeDlg(); await p.waitForTimeout(150); await p.locator('.card').first().screenshot({ path: path.join(SHOTS, 'b2c-ui-' + name + '.png') }); };

  console.log('1. 积木：10 × 10 × 10');
  await open('cuboid-vol', 'solidbench');
  for (let i = 0; i < 8; i++) { await clickText('底板多一列'); await clickText('底板多一排'); }
  let sp = await ent('solidbench');
  ok(sp.cols === 10 && sp.rows === 10, '点“长 +”“宽 +”各 8 下：底板 ' + sp.cols + ' × ' + sp.rows);
  for (let i = 0; i < 10; i++) await clickText('铺满一层');
  ok(await out('solidbench', 'total') === '1000' && await out('solidbench', 'l') === '10' && await out('solidbench', 'hgt') === '10', '铺满十层：10 × 10 × 10 = 1000 块，是长方体');
  ok(/1000 块/.test(await text()), '写着一共 1000 块');
  const cw = await p.evaluate(() => { const r = document.querySelector('.card svg.bdy [data-cell="0-0"] rect').getBoundingClientRect(), sv = document.querySelector('.card svg.bdy'), k = sv.getBoundingClientRect().width / +sv.getAttribute('width'); return r.width / k; });
  ok(cw >= 13.9, '底板格子画出来 ' + Math.round(cw * 10) / 10 + ' 像素（不小于 14，四舍五入）');
  await clickText('拿走'); await click('[data-cell="0-9"]');
  ok(await out('solidbench', 'total') === '999' && (await ent('solidbench')).h.split(';')[0].split(',')[9] === '9', '切到“拿走”，真点前排最右一格：少一块，999');
  await shot('solid'); await cardOk('积木 10 × 10');

  console.log('2. 坐标：一格 = 10');
  await open('cb-2x-plus-1', 'coordbench', { mode: 0, kn: 2, kd: 1, b: 1, x: 1 });
  await click('[data-gu="3"]');
  let cp = await ent('coordbench');
  ok(+cp.gu === 3 && cp.b === 10 && cp.x === 10, '点“一格 = 10”：图不动，截距 1 → 10、探针 1 → 10');
  ok(/一格 = 10：能画到 ±60/.test(await text()), '写着“一格 = 10：能画到 ±60”');
  await dragTo('b', await toScreen('coordbench', 34 + 6 * 24, 34 + 6 * 24 - 2.1 * 24));
  cp = await ent('coordbench');
  ok(cp.b === 20, '拖截距到 20（落在 10 的倍数上）：' + cp.b);
  ok(await out('coordbench', 'root') === '-10' && await out('coordbench', 'y') === '40', 'y = 2x + 20：和 x 轴交在 −10，x = 10 时 y = 40');
  await shot('coord'); await cardOk('坐标一格 = 10');

  console.log('3. 方向角：每圈 500 米');
  await open('dr-bearing', 'dirbench');
  await clickText('每一圈是 500 米');
  ok(/北偏东 30°，1500 米/.test(await text()), '点“每圈 500 米”：目标读成北偏东 30°，1500 米');
  const a = 30 * Math.PI / 180;
  await dragTo('ray', await toScreen('dirbench', 230 + Math.sin(a) * 3 * 40, 210 - Math.cos(a) * 3 * 40));
  ok(await out('dirbench', 'hit') === '1' && /你画的：北偏东 30°，1500 米/.test(await text()), '拖射线到北偏东 30°、第 3 圈：1500 米，对上了');
  await shot('dir'); await cardOk('方向角');

  console.log('4. 工程：30 天和 60 天');
  await open('jb-6-3', 'jobbench', { mode: 0, a: 30, b: 60, t: 0 });
  await clickText('过 10 天'); ok((await ent('jobbench')).t === 10, '点“过 10 天”：过了 10 天');
  await clickText('过 10 天'); ok((await ent('jobbench')).t === 20 && await out('jobbench', 'days') === '20', '再点一次：第 20 天做完（60 ÷ 3 = 20）');
  ok(/做完了：60 ÷ 3 = 20 天/.test(await text()), '写着“做完了：60 ÷ 3 = 20 天”');
  await shot('job'); await cardOk('工程 30、60 天');

  console.log('5. 尺子：30 厘米');
  await open('ru-pencil', 'rulerbench', { mode: 0, rl: 30, len: 23, at: 4, counted: false });
  ok(/30/.test(await text()) && await out('rulerbench', 'len') === null, '30 厘米的尺子，铅笔头在 4：还读不出长度');
  await dragTo('pen', await toScreen('rulerbench', 50 + 11.5 * 20, 158));
  ok((await ent('rulerbench')).at === 0 && await out('rulerbench', 'len') === '23', '拖铅笔头对准 0：23 厘米');
  await shot('ruler'); await cardOk('尺子 30 厘米');

  console.log('6. 圆：半径 20');
  await open('circle-r5', 'circlebench', { mode: 0, r: 10 });
  await dragTo('r', await toScreen('circlebench', 220 + 12 * 17, 222));
  ok((await ent('circlebench')).r === 12, '从 10 拖到 12（按下那一刻的比例，把手跟着鼠标）');
  ok(/数大了，图缩小画/.test(await text()), '松手后图缩小画');
  await dragTo('r', await toScreen('circlebench', 220 + 20 * 8.5, 222));
  ok((await ent('circlebench')).r === 20 && await out('circlebench', 'area') === '1256', '再拖到 20：面积 3.14 × 20 × 20 = 1256');
  await shot('circle'); await cardOk('圆半径 20');

  console.log('7. 三角形：7、24、25');
  await open('g8-pythagoras-core', 'tribench', { mode: 0, a: 7, b: 24, c: 5 });
  await dragTo('c', await toScreen('tribench', 60 + 25 * 320 / 30, 178));
  ok((await ent('tribench')).c === 25 && await out('tribench', 'right') === '1', '把第三根拖到 25：7² + 24² = 25²，是直角三角形');
  await shot('tri'); await cardOk('三角形 7、24、25');

  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n大数测试（第二轮 c）：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
