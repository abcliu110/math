/* node tests/ui-random.js —— 随机手势序列（U8，docs/ui-robustness.md 第 5 节 U8）。
 * 固定种子 SEED，用同一个伪随机数生成器挑手势和参数，所以同样的种子每次走的是同样的 200 个手势。
 * 手势全部是真实鼠标 / 键盘操作（tests/gestures.js）：拖卡片、点击、拖放器材、删除、撤销、重做、缩放、平移、切换工作区视图。
 * 每个手势之后调用 G.assertInvariants（一个手势最多一个撤销项、没有游离卡片、图形有标签、控制台无报错）。
 * 任一步失败：打印种子、步骤序号、手势名和此前的手势列表，测试失败。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const G = require('./gestures');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');

const SEED = 20260509, STEPS = 200, VW = 1440, VH = 900;   // VW、VH 与 viewport 一致

// mulberry32：小而确定的伪随机数生成器（同一个种子，序列完全一样）
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 手势种类和权重
const KINDS = [
  ['拖放器材', 20], ['拖卡片', 16], ['点击器材', 8], ['点击卡片', 8], ['删除', 8],
  ['撤销', 6], ['重做', 4], ['缩放', 8], ['平移', 6], ['切换视图', 8],
];
const TOTAL = KINDS.reduce((s, k) => s + k[1], 0);

(async () => {
  const rnd = mulberry32(SEED);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  G.attachErrorCollector(p);
  await p.goto(url); await p.waitForTimeout(400);
  // 起始：空台面，放一个工作区（设置，不是手势）
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); UI.App.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }); });
  await p.waitForTimeout(300);

  // 读出当前界面状态：器材架上的器材、屏幕上的卡片和工作区、撤销按钮是否可用、是否在专注模式
  const snapState = () => p.evaluate(() => {
    const vw = innerWidth, vh = innerHeight;
    const onScreen = (r) => r.width > 0 && r.height > 0 && r.left >= 0 && r.top >= 0 && r.right <= vw && r.bottom <= vh;
    const cards = [], wss = [];
    for (const el of document.querySelectorAll('.card[data-id]')) {
      const e = UI.S.scene.entities[el.dataset.id]; const r = el.getBoundingClientRect();
      if (!e || !onScreen(r)) continue;
      // 被别的东西盖住的卡片（例如专注模式下台面的卡片）用户点不到，不选
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      if (!top || !top.closest('.card[data-id="' + el.dataset.id + '"]')) continue;
      (U.types[e.type] && U.types[e.type].workspace ? wss : cards).push(el.dataset.id);
    }
    const tiles = [...new Set([...document.querySelectorAll('.tile[data-type]')].map((t) => t.dataset.type))].sort();
    return {
      tiles, cards, wss,
      undoOn: !document.querySelector('#undo').disabled,
      redoOn: !document.querySelector('#redo').disabled,
      focused: UI.State.focusedId() || null,
    };
  });
  const stageBox = () => p.locator('#stage').boundingBox();
  // 台面上的随机点（必须落在台面上，不落在面板、按钮上）
  const randStagePoint = async () => {
    const sb = await stageBox();
    const x0 = Math.max(sb.x, 0) + 20, y0 = Math.max(sb.y, 0) + 20;
    const x1 = Math.min(sb.x + sb.width, VW) - 20, y1 = Math.min(sb.y + sb.height, VH) - 20;
    for (let i = 0; i < 40; i++) {
      const pt = { x: x0 + rnd() * (x1 - x0), y: y0 + rnd() * (y1 - y0) };
      const ok = await p.evaluate(({ x, y }) => { const el = document.elementFromPoint(x, y); return !!el && !!el.closest('#stage'); }, pt);
      if (ok) return pt;
    }
    return { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
  };
  // 空白台面上的点（没有卡片、工作区、按钮）：用来平移
  const emptyStagePoint = async () => {
    const sb = await stageBox();
    const x0 = Math.max(sb.x, 0) + 20, y0 = Math.max(sb.y, 0) + 20;
    const x1 = Math.min(sb.x + sb.width, VW) - 20, y1 = Math.min(sb.y + sb.height, VH) - 20;
    for (let i = 0; i < 60; i++) {
      const pt = { x: x0 + rnd() * (x1 - x0), y: y0 + rnd() * (y1 - y0) };
      const ok = await p.evaluate(({ x, y }) => {
        const el = document.elementFromPoint(x, y);
        return !!el && !!el.closest('#stage') && !el.closest('.card,.wsbody,.tile,.pill,.port,button,input,label,.wsx,#wsfocus,.wsf-hd,#banner');
      }, pt);
      if (ok) return pt;
    }
    return null;
  };
  const wsCenter = async (id) => {
    const bb = await p.locator('svg.wsbody[data-wsid="' + id + '"]').first().boundingBox();
    return bb ? { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 } : null;
  };
  // 放下的目标：一个工作区（如果屏幕上有）或台面上的一个点
  const dropTarget = async (st) => (st.wss.length && rnd() < 0.6 ? pick(st.wss) : randStagePoint());

  // 各种手势。返回 { name, r }（name 是给人看的描述）
  const acts = {
    async '拖放器材'(st) {
      const type = pick(st.tiles), to = await dropTarget(st);
      const name = '从器材架拖 ' + type + ' 到 ' + (typeof to === 'string' ? '工作区 ' + to : '台面');
      return { name, r: await G.dragTileTo(p, type, to) };
    },
    async '拖卡片'(st) {
      if (!st.cards.length) return acts['拖放器材'](st);
      const id = pick(st.cards), to = await dropTarget(st);
      const name = '拖台面上的卡片 ' + id + ' 到 ' + (typeof to === 'string' ? '工作区 ' + to : '台面');
      return { name, r: await G.dragCardTo(p, id, to) };
    },
    async '点击器材'(st) {
      const type = pick(st.tiles);
      return { name: '点击器材架上的 ' + type, r: await G.clickTile(p, type) };
    },
    async '点击卡片'(st) {
      const all = st.cards.concat(st.wss);
      if (!all.length) return acts['点击器材'](st);
      const id = pick(all);
      return { name: '点击卡片 ' + id, r: await G.clickCard(p, id) };
    },
    async '删除'(st) {
      const all = st.cards.concat(st.wss);
      if (!all.length) return acts['点击器材'](st);
      const id = pick(all);
      await G.clickCard(p, id);
      const r = await G.press(p, 'Delete');
      // 里面有东西的容器会先问：三个按钮随机选一个（“算了”就什么都不删）
      // 只认“真的打开着”的对话框：关掉以后按钮还留在 DOM 里（closeDialog 只去掉 open 类），不能只看元素在不在
      const dlg = await p.evaluate(() => {
        if (!document.querySelector('#dlg.open')) return [];
        return ['#dlg-delall', '#dlg-delout', '#dlg-close'].filter((s) => { const el = document.querySelector(s); return !!el && el.getBoundingClientRect().width > 0; });
      });
      if (dlg.length) {
        const sel = pick(dlg);
        await G.clickDialog(p, sel);
        return { name: '删除 ' + id + '，对话框选 ' + sel, r };
      }
      return { name: '删除 ' + id, r };
    },
    async '撤销'(st) {
      if (st.undoOn && rnd() < 0.5) return { name: '点撤销按钮', r: await G.undo(p) };
      return { name: '按 Ctrl+Z', r: await G.press(p, 'Control+z') };
    },
    async '重做'(st) {
      if (st.redoOn && rnd() < 0.5) return { name: '点重做按钮', r: await G.redo(p) };
      return { name: '按 Ctrl+Y', r: await G.press(p, 'Control+y') };
    },
    async '缩放'(st) {
      const dy = rnd() < 0.5 ? -300 : 300;
      if (st.wss.length && rnd() < 0.5) {
        const c = await wsCenter(pick(st.wss));
        if (c) return { name: '滚轮在工作区上' + (dy < 0 ? '放大' : '缩小'), r: await G.wheelAt(p, c.x, c.y, dy) };
      }
      const pt = await randStagePoint();
      return { name: '滚轮在台面上' + (dy < 0 ? '放大' : '缩小'), r: await G.wheelAt(p, pt.x, pt.y, dy) };
    },
    async '平移'(st) {
      const from = await emptyStagePoint();
      if (!from) return acts['缩放'](st);
      const sb = await stageBox();
      const dx = (rnd() - 0.5) * 300, dy = (rnd() - 0.5) * 300;
      const to = { x: Math.min(Math.max(from.x + dx, sb.x + 20), sb.x + sb.width - 20), y: Math.min(Math.max(from.y + dy, sb.y + 20), sb.y + sb.height - 20) };
      return { name: '在台面空白处拖动，平移台面', r: await G.panStage(p, from, to) };
    },
    async '切换视图'(st) {
      if (st.focused) {
        if (rnd() < 0.5) return { name: 'Esc 还原专注模式', r: await G.press(p, 'Escape') };
        return { name: '点“还原”，退出专注模式', r: await G.clickSel(p, '[data-ws-unfocus]') };
      }
      if (st.wss.length) {
        const id = pick(st.wss);
        if (rnd() < 0.5) return { name: '双击工作区 ' + id + ' 的标题，进入专注模式', r: await G.dblClickHd(p, id) };
        return { name: '点工作区 ' + id + ' 的“适应”', r: await G.clickSel(p, '[data-ws-fit="' + id + '"]') };
      }
      return acts['平移'](st);
    },
  };

  const counts = {}, log = [];
  for (let i = 0; i < STEPS; i++) {
    let name = '';
    try {
      const st = await snapState();
      let roll = rnd() * TOTAL, kind = KINDS[0][0];
      for (const [k, w] of KINDS) { if (roll < w) { kind = k; break; } roll -= w; }
      counts[kind] = (counts[kind] || 0) + 1;
      name = kind + '（未完成）';
      const res = await acts[kind](st);
      name = res.name;
      log.push((i + 1) + '. ' + name);
      await G.assertInvariants(p, '第 ' + (i + 1) + ' 步：' + name);
    } catch (e) {
      console.log('  FAIL 随机手势测试失败：种子 ' + SEED + '，第 ' + (i + 1) + ' 步（共 ' + STEPS + ' 步），手势：' + (name || '(未生成)'));
      console.log('  FAIL 原因：' + e.message.split('\n')[0]);
      console.log('  FAIL 此前的手势（最后 15 步）：');
      log.slice(-15).forEach((l) => console.log('        ' + l));
      await b.close();
      process.exit(1);
    }
  }
  await G.assertInvariants(p, '结束检查');
  const parts = KINDS.map(([k]) => k + ' ' + (counts[k] || 0)).join('，');
  console.log('  ok   ' + STEPS + ' 个随机手势（种子 ' + SEED + '）：' + parts);
  console.log('\n随机手势测试：' + STEPS + ' 个手势全部通过，每步不变量成立，控制台 0 报错');
  await b.close();
  process.exit(0);
})().catch((e) => { console.log('  FAIL 脚本异常：' + e.message); process.exit(1); });
