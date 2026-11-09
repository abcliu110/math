/* node tests/ui-roles.js —— 声明式角色（U7，docs/ui-robustness.md 4.4 和第 5 节 U7 验收）。
 * 界面不认具体器材：容器、块、步骤、把手、标签都由器材定义声明（workspaceRole、handles、stepLabel、splitsPieces…）。
 * 这里注册三种“假器材”，它们只写声明，不改界面代码：
 *   fakebox   ：workspaceRole: 'container'，界面要把它当作工作区（画布、标题、图层、步骤清单、把手）；
 *   fakechip  ：workspaceRole: 'piece'，松手放进假箱子里，界面要把它当作块（画在工作区里、名字来自器材、可以拖）；
 *   fakestep  ：workspaceRole: 'step'，界面要把它列进步骤清单（名字来自 stepLabel），并计入标题的步数。
 * 用真实鼠标：从器材架点击、拖到假箱子上。每一步后检查不变量（tests/gestures.js）。
 * 另外检查：假器材的声明通过 lint（U.lintType 没有错误），hidden 的假步骤不列在器材架上。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const G = require('./gestures');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  G.attachErrorCollector(p);
  await p.goto(url); await p.waitForTimeout(300);
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); });
  await p.waitForTimeout(200);

  console.log('注册假器材：只写声明（workspaceRole 等），界面代码不动');
  const lint = await p.evaluate(() => {
    const Q = U.Q, F = U.Fig, K = U.kit;
    const tri = () => F.polygon([[Q(0), Q(0)], [Q(4), Q(0)], [Q(0), Q(3)]]);
    const seg = () => F.segment([Q(0), Q(0)], [Q(5), Q(1)]);
    U.registerPack({
      id: 'fakeroles', version: 1, needs: ['geo'],
      types: {
        fakebox: {
          workspaceRole: 'container', handles: true,
          essence: ['E1', 'E5'], label: '假箱子', prefix: '箱', group: '图形', grades: [4, 9],
          slots: { items: { accepts: '*', max: null, layout: 'free' } },
          props: { title: { type: 'text', label: '标题', default: '' }, show: { type: 'bool', label: '显示步骤', default: true } },
          lint: { minProps: 2, why: '测试用的假容器，只有标题和显示开关' },
          outputs: { n: { dim: null, kind: 'num', label: '步数' } },
          icon: () => K.rect(6, 8, 52, 28, { stroke: 'var(--ink)', r: 3 }),
          size: () => [300, 240],
          compute: (c) => ({ n: U.val('num', Q(c.kids('items').length), { dim: null }) }),
          draw: () => K.text(150, 120, '假箱子', { size: 13, weight: 700 }),
        },
        fakechip: {
          workspaceRole: 'piece', handles: true,
          essence: ['E2', 'E5'], label: '假块', prefix: '块', group: '图形', grades: [5, 9],
          props: { name: { type: 'text', label: '名字', default: '假块' }, color: { type: 'text', label: '颜色', default: '#9ccfd8' }, tag: { type: 'text', label: '备注', default: '' } },
          outputs: { f: { dim: null, kind: 'fig', label: '形状' } },
          icon: () => K.rect(6, 8, 52, 28, { stroke: 'var(--ink)', r: 3 }),
          size: () => [150, 70],
          compute: () => ({ f: U.val('fig', tri(), { dim: null }) }),
          draw: (c) => K.text(c.w / 2, c.h / 2 + 4, c.props.name, { size: 13, weight: 700 }),
        },
        fakestep: {
          workspaceRole: 'step', handles: false, stepLabel: '假步骤',
          essence: ['E1'], label: '假步骤器材', prefix: '步', group: '图形', grades: [4, 9], hidden: true,
          props: { name: { type: 'text', label: '名字', default: '步' }, color: { type: 'text', label: '颜色', default: '#000' }, tag: { type: 'text', label: '备注', default: '' } },
          outputs: { f: { dim: null, kind: 'fig', label: '线段' } },
          icon: () => K.rect(6, 8, 52, 28, { stroke: 'var(--ink)', r: 3 }),
          size: () => [150, 70],
          compute: () => ({ f: U.val('fig', seg(), { dim: null }) }),
          draw: () => K.text(75, 40, '假步骤', { size: 13 }),
        },
      },
    });
    UI.Panels.renderShelf();
    const r = {};
    for (const id of ['fakebox', 'fakechip', 'fakestep']) r[id] = U.lintType(U.types[id]).errors;
    return r;
  });
  ok(Object.values(lint).every((e) => e.length === 0), '三种假器材都通过 lint（' + JSON.stringify(lint) + '）');

  const shelf = await p.evaluate(() => ({
    box: !!document.querySelector('.tile[data-type="fakebox"]'),
    chip: !!document.querySelector('.tile[data-type="fakechip"]'),
    step: !!document.querySelector('.tile[data-type="fakestep"]'),
    boxLabel: (document.querySelector('.tile[data-type="fakebox"] .nm') || {}).textContent || '',
  }));
  ok(shelf.box && shelf.chip, '器材架上有假箱子、假块（声明的标签：' + shelf.boxLabel + '）');
  ok(!shelf.step, 'hidden 声明生效：假步骤不列在器材架上');

  console.log('容器：假箱子被当作工作区');
  const add = await G.clickTile(p, 'fakebox');
  const box = add.added && add.added[0];
  ok(!!box, '点击器材架添加假箱子');
  await G.assertInvariants(p, '添加假箱子');
  const cont = await p.evaluate((id) => ({
    panel: !!document.querySelector('.wsx[data-ws="' + id + '"]'),
    canvas: !!document.querySelector('svg.wsbody[data-wsid="' + id + '"]'),
    tools: document.querySelectorAll('.wsx[data-ws="' + id + '"] button[data-ws-tool]').length,
    rz: !!document.querySelector('.card[data-id="' + id + '"] .rz'),
    empty: (document.querySelector('.wsx[data-ws="' + id + '"] .wsx-none') || {}).textContent || '',
  }), box);
  ok(cont.panel && cont.canvas, '假箱子的卡片有工作区面板和画布（workspaceRole: container 生效）');
  ok(cont.tools === 0, '没写 workspace 配置：工具为空，按默认处理');
  ok(cont.rz, 'handles: true：卡片有缩放把手');

  console.log('块：假块从器材架拖进假箱子');
  // 放进工作区的器材不是卡片，所以用实体的增减来看新增了哪个器材（G.dragTileTo 的 added 只数卡片）
  const ents0 = await p.evaluate(() => Object.keys(UI.S.scene.entities));
  const dr = await G.dragTileTo(p, 'fakechip', box);
  const chips = await p.evaluate((before) => Object.keys(UI.S.scene.entities).filter((k) => before.indexOf(k) < 0), ents0);
  ok(dr.visible && chips.length === 1, '从器材架拖假块到假箱子，新增一个器材');
  await G.assertInvariants(p, '拖入假块');
  const chip = chips[0];
  const piece = await p.evaluate((id) => {
    const e = UI.S.scene.entities[id];
    return {
      parent: e && e.parent,
      draggable: !!document.querySelector('svg.wsbody[data-wsid] [data-drag="' + id + '"]'),
      drawn: !!document.querySelector('svg.wsbody [data-pick]'),
      layers: (document.querySelector('.wsx-layers') || {}).textContent || '',
    };
  }, chip);
  ok(piece.parent === box, '假块放进了假箱子（落在工作区里，不是一张普通卡片）');
  ok(piece.draggable, 'workspaceRole: piece 生效：工作区里的假块可以拖（data-drag）');
  ok(piece.drawn, '假块的形状画在工作区的画布上');
  ok(piece.layers.indexOf('假块') >= 0, '图层里的名字来自器材（props.name）');
  const steps0 = await p.evaluate((id) => document.querySelectorAll('.wsx[data-ws="' + id + '"] [data-ws-step]').length, box);
  ok(steps0 === 0, '假块不是步骤：步骤清单里没有它');

  console.log('步骤：假步骤进步骤清单，名字来自 stepLabel，计入步数');
  const stepId = await p.evaluate((box) => {
    const r = UI.App.act({ t: 'add', type: 'fakestep', x: 0, y: 0 });
    UI.App.act({ t: 'put', id: r.id, parent: box, slot: 'items' });
    return r.id;
  }, box);
  await p.waitForTimeout(150);
  await G.assertInvariants(p, '放入假步骤');
  const st = await p.evaluate(({ box, stepId }) => ({
    row: ((document.querySelector('.wsx[data-ws="' + box + '"] [data-ws-step="' + stepId + '"]') || {}).textContent) || '',
    badge: ((document.querySelector('.card[data-id="' + box + '"] .bd') || {}).textContent) || '',
  }), { box, stepId });
  ok(st.row.indexOf('假步骤') >= 0, '步骤清单里写的是 stepLabel：「' + st.row.replace(/\s+/g, ' ').slice(0, 40) + '」');
  ok(st.badge.indexOf('1 步') >= 0, '标题的步数只数步骤（假块不计，假步骤计 1 步）：' + st.badge);

  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n假器材测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
