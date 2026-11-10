/* node tests/ui-stepgraph.js —— 步骤图（D6，docs/direction.md 第 7 节 D6）：「看背后的连线」，真实鼠标。
 * (a) 式子工作台：解 3x + 5 = 20（移项、合并、两边同除）后打开步骤图：3 个节点（第 1、2、3 步），
 *     依赖连线 1→2、2→3（合并用了移项留下的 −5，除法用了合并的结果 15）；打开时历史不变（不记步骤）；
 *     点第 1 个节点，历史回到第 1 步（一行），式子是 3x = 20 − 5；
 * (b) 键盘：焦点在节点上按 Enter 同样能回到那一步（这里用第 2 步，回到 2 行）；
 * (c) 几何工作台：geo-median-area 里取中点、连线、剪（三步），打开步骤图：3 个节点，剪在最后（标签「剪」），
 *     依赖连线 1→2（连线用了中点）、2→3（剪用了连线）；打开时撤销栈不变；点第 1 个节点，工作区只剩 1 步；
 * (d) 没有步骤时打开，写着「还没有步骤」；页面没有错误。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const url = 'file://' + path.join(__dirname, '..', 'index.html');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(300);

  // 读步骤图：节点（按 data-sg-node）、依赖连线（data-sg-from → data-sg-to）
  const graph = () => p.evaluate(() => {
    const nodes = [...document.querySelectorAll('#dlg .box .sg-node')].map((g) => ({ k: +g.dataset.sgNode, text: g.textContent.replace(/\s+/g, ' ') }));
    const edges = [...document.querySelectorAll('#dlg .box .sg-edge')].map((e) => e.dataset.sgFrom + '>' + e.dataset.sgTo).sort();
    return { nodes, edges, open: !!document.querySelector('#dlg.open') };
  });
  const closeDlg = async () => { await p.click('#dlg-close'); await p.waitForTimeout(80); };

  console.log('式子工作台：解 3x + 5 = 20，打开背后的连线');
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); }); await p.waitForTimeout(100);
  const ids = await p.evaluate(() => {
    const A = UI.App;
    const a = A.act({ t: 'add', type: 'algebra', x: 300, y: 180, props: { text: '3x+5' } }).id;
    const n = A.act({ t: 'add', type: 'num', x: 300, y: 400, props: { n: 20 } }).id;
    const q = A.act({ t: 'add', type: 'eqdesk', x: 640, y: 240, props: { by: 0 } }).id;
    const x = A.act({ t: 'add', type: 'exprbench', x: 640, y: 470 }).id;
    A.act({ t: 'link', from: a, to: q, toPort: 'L' });
    A.act({ t: 'link', from: n, to: q, toPort: 'R' });
    A.act({ t: 'link', from: q, to: x, fromPort: 'eq', toPort: 'e' });
    return { x };
  });
  await p.dblclick('.card[data-id="' + ids.x + '"] .hd'); await p.waitForTimeout(150);

  const chip = (side, i) => p.locator('#insp [data-wb-term="' + side + ':' + i + '"]');
  const steps = () => p.locator('#insp .wb-step').count();
  const now = () => p.locator('#insp .wb-now').innerText().then((s) => norm(s.replace('现在：', ''))).catch(() => '');

  // (d) 没有步骤时：写着「还没有步骤」
  await p.click('#insp [data-wb-graph]'); await p.waitForTimeout(120);
  const empty = await graph();
  ok(empty.open && /还没有步骤/.test(await p.locator('#dlg .box').innerText()), '没有步骤时打开：写着「还没有步骤」');
  await closeDlg();

  // 三步：移项、合并、两边同除（和 tests/ui-expr.js 的鼠标操作一样）
  await chip('lhs', 1).click(); await p.waitForTimeout(60);
  const src = await chip('lhs', 1).boundingBox(), dst = await p.locator('#insp .wb-side[data-wb-side="rhs"]').boundingBox();
  await p.mouse.move(src.x + src.width / 2, src.y + src.height / 2); await p.mouse.down();
  await p.mouse.move(dst.x + dst.width / 2, dst.y + dst.height / 2, { steps: 12 }); await p.mouse.up(); await p.waitForTimeout(120);
  await chip('rhs', 0).click(); await chip('rhs', 1).click(); await p.waitForTimeout(60);
  await p.click('#insp [data-wb-tool="collect"]'); await p.waitForTimeout(120);
  await p.click('#insp [data-wb-act="divide-coef"]'); await p.waitForTimeout(120);
  ok((await steps()) === 3 && /x = 5/.test(await p.locator('#insp .wb-sol').innerText().catch(() => '')), '三步做完：解 x = 5（历史 3 行）');

  // (a) 打开步骤图：3 个节点，依赖连线 1→2、2→3；不改历史
  const before = await steps();
  await p.click('#insp [data-wb-graph]'); await p.waitForTimeout(120);
  const g1 = await graph();
  ok(g1.open && g1.nodes.length === 3 && g1.nodes.map((n) => n.k).join() === '1,2,3', '步骤图：3 个节点（第 1、2、3 步）：' + g1.nodes.map((n) => n.text).join(' | ').slice(0, 160));
  ok(JSON.stringify(g1.edges) === JSON.stringify(['s1>s2', 's2>s3']), '依赖连线：第 1 步 → 第 2 步（合并用了移项留下的 −5），第 2 步 → 第 3 步（除法用了合并的结果）：' + g1.edges.join(' '));
  ok(await steps() === before, '打开步骤图不改历史（仍然 ' + before + ' 行）');
  ok(/移项/.test(g1.nodes[0].text), '第 1 个节点写着做了什么（移项）');

  // 点第 1 个节点：历史回到第 1 步
  await p.click('#dlg .box .sg-node[data-sg-node="1"]'); await p.waitForTimeout(150);
  ok(!(await p.locator('#dlg.open').count()), '点节点后对话框关闭');
  ok((await steps()) === 1, '点第 1 个节点：历史回到第 1 步（剩 1 行）');
  ok(/^3x = 20 − 5$/.test(await now()), '式子回到第 1 步之后：' + (await now()));
  ok(await p.locator('#insp .wb-sol').count() === 0, '解消失（第 2、3 步撤掉了）');

  // (b) 键盘：再做到 3 步，焦点在第 2 个节点上按 Enter，回到第 2 步
  await chip('rhs', 0).click(); await chip('rhs', 1).click(); await p.waitForTimeout(60);
  await p.click('#insp [data-wb-tool="collect"]'); await p.waitForTimeout(120);
  await p.click('#insp [data-wb-act="divide-coef"]'); await p.waitForTimeout(120);
  ok((await steps()) === 3, '再做两步回到 3 行（合并、两边同除）');
  await p.click('#insp [data-wb-graph]'); await p.waitForTimeout(120);
  await p.focus('#dlg .box .sg-node[data-sg-node="2"]');
  await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  ok((await steps()) === 2 && /^3x = 15$/.test(await now()), '键盘 Enter 在第 2 个节点上：历史回到第 2 步（3x = 15）');

  console.log('几何工作台：取中点、连线、剪，打开背后的连线');
  const pickAt = async (name, shift) => {
    const pt = await p.evaluate((nm) => {
      for (const el of [...document.querySelectorAll('[data-pick]')].filter((e) => e.dataset.pick === nm)) {
        const r = el.getBoundingClientRect(), cands = [[r.left + r.width / 2, r.top + r.height / 2]];
        for (let i = 1; i < 10; i++) for (let j = 1; j < 10; j++) cands.push([r.left + r.width * i / 10, r.top + r.height * j / 10]);
        for (const [x, y] of cands) { const hit = document.elementFromPoint(x, y); if (hit && hit.closest('[data-pick]') === el) return { x, y }; }
      }
      return null;
    }, name);
    if (!pt) { ok(false, '找不到可以点的对象：' + name); return; }
    if (shift) await p.keyboard.down('Shift');
    await p.mouse.click(pt.x, pt.y);
    if (shift) await p.keyboard.up('Shift');
  };
  const wsTool = async (id) => { await p.click('[data-ws-tool="' + id + '"]'); await p.waitForTimeout(60); };
  const wsSteps = () => p.locator('.wsx-step').count();

  await p.evaluate(() => UI.App.openProblem('geo-median-area', 'practice')); await p.waitForTimeout(200);
  await p.click('[data-ws-graph]'); await p.waitForTimeout(120);
  const gEmpty = await graph();
  ok(gEmpty.open && /还没有步骤/.test(await p.locator('#dlg .box').innerText()), '几何：还没有步骤时打开，写着「还没有步骤」');
  await closeDlg();

  await pickAt('B'); await pickAt('C', true); await wsTool('mid');
  await pickAt('A'); await pickAt('M(BC)', true); await wsTool('seg');
  await pickAt('poly(A,B,C)'); await pickAt('seg(A,M(BC))', true); await wsTool('cut');
  ok((await wsSteps()) === 3, '中线题：取中点、连线、剪，步骤清单 3 行');

  const undoBefore = await p.evaluate(() => UI.S.undo.length);
  await p.click('[data-ws-graph]'); await p.waitForTimeout(120);
  const g2 = await graph();
  ok(g2.open && g2.nodes.length === 3, '几何步骤图：3 个节点：' + g2.nodes.map((n) => n.text).join(' | ').slice(0, 200));
  ok(/剪/.test(g2.nodes[2].text), '最后一个节点是「剪」');
  ok(g2.edges.includes('s1>s2') && g2.edges.includes('s2>s3'), '依赖连线：中点 → 连线 → 剪：' + g2.edges.join(' '));
  ok(await p.evaluate(() => UI.S.undo.length) === undoBefore, '打开步骤图不改撤销栈（仍然 ' + undoBefore + '）');

  await p.click('#dlg .box .sg-node[data-sg-node="1"]'); await p.waitForTimeout(200);
  ok((await wsSteps()) === 1, '点第 1 个节点（中点）：工作区回到第 1 步（清单剩 1 行）');
  const left = await p.evaluate(() => [...document.querySelectorAll('.wsx-step span')].map((s) => s.textContent).join(' | '));
  ok(/中点/.test(left) && !/剪|连线/.test(left), '剩下的那一步是中点：' + norm(left).slice(0, 80));

  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n步骤图界面测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
