/* 真实鼠标手势库（给 playwright 用）。见 docs/ui-robustness.md 第 4.7 节。
 * 每个手势都用真实的鼠标 / 键盘事件（mouse.move / down / move(steps) / up，或 click、keyboard.press）。
 * 返回值是“用户看到了什么”：元素是否在屏幕上、文字内容、新出现了哪些卡片；不返回内部状态。
 * assertInvariants(page, label) 在每个手势之后调用，检查不变量（只读，不改状态）。
 *
 * 用法：
 *   const G = require('./gestures');
 *   G.attachErrorCollector(page);            // 在 goto 之前或之后尽早调用，之后的控制台错误才会被记下
 *   const r = await G.dragTileTo(page, 'ftri', wsId);   // r = { visible, text, added, label }
 *   await G.assertInvariants(page, '拖入三角形');
 */
'use strict';

// 每个 page 的状态：控制台错误、当前手势名、手势开始时的撤销栈长度
const state = new WeakMap();
function st(page) {
  let s = state.get(page);
  if (!s) { s = { errs: [], attached: false, undoBefore: null, gesture: null }; state.set(page, s); }
  return s;
}

// 控制台错误收集：和 tests/ui.js 里的 errs 一样，pageerror + console.error
function attachErrorCollector(page) {
  const s = st(page);
  if (s.attached) return;
  s.attached = true;
  page.on('pageerror', (e) => s.errs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') s.errs.push('console: ' + m.text()); });
}

// 每个手势开始时调用：记下撤销栈长度，供 assertInvariants 检查“一个手势最多一个撤销项”
async function begin(page, name) {
  attachErrorCollector(page);
  const s = st(page);
  s.gesture = name;
  s.undoBefore = await page.evaluate(() => (UI.S && UI.S.undo ? UI.S.undo.length : null));
}

const pause = (page, ms) => page.waitForTimeout(ms);

// 真实拖动：按下、分 12 步移动、松开，然后等渲染
async function dragPath(page, from, to) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 12 });
  await page.mouse.up();
  await pause(page, 250);
}

// 器材架瓦片：滚到可见后取它的位置
async function tileBox(page, type) {
  const tile = page.locator('.tile[data-type="' + type + '"]').first();
  await tile.scrollIntoViewIfNeeded();
  const box = await tile.boundingBox();
  if (!box) throw new Error('器材架上找不到瓦片：' + type);
  const label = ((await tile.innerText()) || '').split('\n')[0].trim();
  return { box, label };
}

// 目标：{x, y}（页面坐标）、卡片 id 字符串，或 { id, fx, fy }（卡片内的比例位置，默认中心）。
// 卡片是工作区时，落点取工作区画布（svg.wsbody）的比例位置。
async function targetPoint(page, target) {
  if (target && typeof target === 'object' && 'x' in target && 'y' in target) return { x: target.x, y: target.y };
  const id = typeof target === 'string' ? target : target.id;
  const fx = target && typeof target === 'object' && target.fx !== undefined ? target.fx : 0.5;
  const fy = target && typeof target === 'object' && target.fy !== undefined ? target.fy : 0.5;
  const sel = '.card[data-id="' + id + '"]';
  const canvas = page.locator(sel + ' svg.wsbody').first();
  const box = (await canvas.count()) ? await canvas.boundingBox() : await page.locator(sel).first().boundingBox();
  if (!box) throw new Error('目标卡片不在屏幕上：' + id);
  return { x: box.x + box.width * fx, y: box.y + box.height * fy };
}

// 台面上的卡片（DOM 里的 .card）
const cardIds = (page) => page.evaluate(() => [...document.querySelectorAll('.card[data-id]')].map((el) => el.dataset.id));
const textOf = (page, id) => page.evaluate((id) => { const el = document.querySelector('.card[data-id="' + id + '"]'); return el ? el.textContent : ''; }, id);
const inViewport = (page, sel) => page.evaluate((sel) => {
  const el = document.querySelector(sel); if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0 && r.left < innerWidth && r.top < innerHeight;
}, sel);

// 手势之后：看用户看到什么。新出现的卡片、容器的文字、label 是否出现在文字里
async function observe(page, before, label, containerId) {
  const after = await cardIds(page);
  const added = after.filter((id) => before.indexOf(id) < 0);
  let text = '';
  if (containerId) text += (await textOf(page, containerId)) + '\n';
  let addedVisible = true;
  for (const id of added) {
    text += (await textOf(page, id)) + '\n';
    if (!(await inViewport(page, '.card[data-id="' + id + '"]'))) addedVisible = false;
  }
  const visible = !!label && text.indexOf(label) >= 0 && addedVisible;
  return { visible, text: text.trim(), added, label: label || '' };
}

// 从器材架拖一个器材到目标（台面上的位置，或容器卡片）
async function dragTileTo(page, type, target) {
  await begin(page, 'dragTileTo(' + type + ')');
  const { box, label } = await tileBox(page, type);
  const before = await cardIds(page);
  const to = await targetPoint(page, target);
  await dragPath(page, { x: box.x + 30, y: box.y + 20 }, to);
  const containerId = typeof target === 'string' ? target : (target && target.id) || null;
  return observe(page, before, label, containerId);
}

// 拖动台面上已有的卡片（按标题栏）到目标
async function dragCardTo(page, id, target) {
  await begin(page, 'dragCardTo(' + id + ')');
  const cardSel = '.card[data-id="' + id + '"]';
  const hd = page.locator(cardSel + ' .hd').first();
  const grip = (await hd.count()) ? hd : page.locator(cardSel).first();
  await grip.scrollIntoViewIfNeeded();
  const gb = await grip.boundingBox();
  if (!gb) throw new Error('卡片不在屏幕上：' + id);
  const title = ((await textOf(page, id)) || '').split('\n')[0].trim();
  const before = await cardIds(page);
  const to = await targetPoint(page, target);
  await dragPath(page, { x: gb.x + Math.min(30, gb.width / 2), y: gb.y + gb.height / 2 }, to);
  const containerId = typeof target === 'string' ? target : (target && target.id) || null;
  const r = await observe(page, before, title, containerId);
  r.visible = (await inViewport(page, cardSel)) || r.visible;   // 卡片还在台面上，或者已经进了容器
  return r;
}

// 单击器材架瓦片（不拖）
async function clickTile(page, type) {
  await begin(page, 'clickTile(' + type + ')');
  const { box, label } = await tileBox(page, type);
  const before = await cardIds(page);
  await page.mouse.click(box.x + 30, box.y + 20);
  await pause(page, 250);
  return observe(page, before, label, null);
}

// 单击台面上的卡片（标题栏；没有标题栏就点中心）
async function clickCard(page, id) {
  await begin(page, 'clickCard(' + id + ')');
  const cardSel = '.card[data-id="' + id + '"]';
  const hd = page.locator(cardSel + ' .hd').first();
  const grip = (await hd.count()) ? hd : page.locator(cardSel).first();
  // 先等标题栏可见，并且位置连续两次一致（没有在动），再点；不用 scrollIntoViewIfNeeded 的超时方式
  await grip.waitFor({ state: 'visible', timeout: 5000 });
  let a = null;
  for (let i = 0; i < 20; i++) {
    const b1 = await grip.boundingBox(); await pause(page, 30); const b2 = await grip.boundingBox();
    if (b1 && b2 && b1.x === b2.x && b1.y === b2.y && b1.width === b2.width && b1.height === b2.height) { a = b2; break; }
  }
  if (!a) throw new Error('标题栏的位置一直在变，没法点：' + id);
  await grip.click({ timeout: 5000 });
  await pause(page, 200);
  return { visible: await inViewport(page, cardSel), text: (await textOf(page, id)).trim(), added: [], label: '' };
}

// 点界面上的按钮（撤销、重做、整理……）
async function clickSel(page, sel) {
  await begin(page, 'click(' + sel + ')');
  const btn = page.locator(sel).first();
  await btn.scrollIntoViewIfNeeded();
  const visible = await btn.isVisible();
  await btn.click();
  await pause(page, 200);
  return { visible, text: await bannerText(page), added: [], label: '' };
}
const undo = (page) => clickSel(page, '#undo');
const redo = (page) => clickSel(page, '#redo');

// 工作区里的真实鼠标点：单击（一下），或双击（两下，第二下的 clickCount 为 2，和真人双击一样）
async function clickAt(page, x, y, label) {
  await begin(page, 'clickAt(' + (label || '') + ')');
  await page.mouse.click(x, y);
  await pause(page, 200);
  return { visible: true, text: '', added: [], label: label || '' };
}
async function dblClickAt(page, x, y, label) {
  await begin(page, 'dblClickAt(' + (label || '') + ')');
  await page.mouse.dblclick(x, y);
  await pause(page, 200);
  return { visible: true, text: '', added: [], label: label || '' };
}

// 按键（如 'Delete'、'Control+z'）
async function press(page, key) {
  await begin(page, 'press(' + key + ')');
  await page.keyboard.press(key);
  await pause(page, 200);
  return { visible: true, text: await bannerText(page), added: [], label: '' };
}

async function bannerText(page) {
  return page.evaluate(() => { const b = document.querySelector('#banner'); return b ? (b.textContent || '').trim() : ''; });
}

// 不变量检查（只读）。失败时抛出错误，信息里带 label 和最近一次手势的名字。
//  (a) 台面上没有游离的卡片叠在容器卡片上（容器 = 器材定义里有 slots 或 workspace，或者有子实体；游离 = 没有 parent 的实体）
//  (b) 最近一个手势最多增加一个撤销项（UI.S.undo 长度）
//  (c) 工作区里显示的图形：标签出现在画布文字里；质心在可见范围内（范围取自工作区的 ui.view；没有记录的范围不检查）
//  (d) 没有控制台错误（attachErrorCollector 收集的）
// opts.skip：可以跳过的检查名（只用于已登记的已知问题）：'undo' 跳过 (b)，'overlap' 跳过 (a)。两者都对应 P1。
async function assertInvariants(page, label, opts) {
  const skip = (opts && opts.skip) || [];   // 已知问题的检查可以暂时跳过，例如 ['undo']（P1，见 docs/ui-robustness.md）
  const s = st(page);
  const gname = s.gesture || '(尚未做手势)';
  const fail = (msg) => { throw new Error('[' + label + '] 手势 ' + gname + '：' + msg); };

  const snap = await page.evaluate(() => {
    const S = UI.S, E = S.scene.entities, D = S.D || {}, out = { undo: S.undo ? S.undo.length : null, ents: [], cards: {}, ws: [] };
    const kids = {};
    for (const e of Object.values(E)) if (e.parent) (kids[e.parent] = kids[e.parent] || []).push(e.id);
    for (const e of Object.values(E)) { const def = U.types[e.type]; out.ents.push({ id: e.id, type: e.type, parent: e.parent || null, container: !!kids[e.id] || !!(def && (def.slots || def.workspace)) }); }
    document.querySelectorAll('.card[data-id]').forEach((el) => {
      const r = el.getBoundingClientRect(); out.cards[el.dataset.id] = { l: r.left, t: r.top, r: r.right, b: r.bottom };
    });
    for (const e of Object.values(E)) {
      const def = U.types[e.type];
      if (!def || !def.workspace) continue;
      const sv = document.querySelector('svg.wsbody[data-wsid="' + e.id + '"]');
      if (!sv) continue;
      const w = +sv.getAttribute('width'), h = +sv.getAttribute('height'), view = UI.State.viewOf(e) || null;
      const items = [];
      for (const k of Object.values(E)) {
        if (k.parent !== e.id || k.hidden) continue;
        const node = D[k.id]; if (!node || !node.out) continue;
        const port = Object.keys(node.out).find((p) => node.out[p] && node.out[p].kind === 'fig');
        if (!port || !node.out[port].data || !node.out[port].data.pts || !node.out[port].data.pts.length) continue;
        const pts = node.out[port].data.pts, xs = pts.map((q) => U.Q.num(q.x)), ys = pts.map((q) => U.Q.num(q.y));
        // 点的标签是 mark（2.6：点的名字），图形的标签是 name；点没有 name 时就看 mark
        items.push({ id: k.id, name: (k.props && (k.props.name || k.props.mark)) || '', cx: (Math.min(...xs) + Math.max(...xs)) / 2, cy: (Math.min(...ys) + Math.max(...ys)) / 2, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) });
      }
      // 边缘箭头（整个图形在可见范围外面时画，见 stage-canvas.js 的 offArrows）：data-offscreen 标记，记下它的文字（图形的名字）
      const arrows = [...sv.querySelectorAll('[data-offscreen]')].map((g) => g.textContent.trim());
      // 没有名字的图形（例如“四边形 ABCD”这种由器材自己起标签的）：标签由界面算出（UI.Stage.labelsOf），用它核对画布文字
      out.ws.push({ id: e.id, w, h, view, text: sv.textContent, items, arrows, figs: UI.Stage.labelsOf(e.id) });
    }
    return out;
  });

  // (a)
  const free = snap.ents.filter((e) => !e.parent), containers = snap.ents.filter((e) => e.container);
  for (const f of free) {
    if (skip.indexOf('overlap') >= 0) break;
    const fr = snap.cards[f.id]; if (!fr) continue;
    for (const c of containers) {
      if (c.id === f.id || f.parent === c.id) continue;
      const cr = snap.cards[c.id]; if (!cr) continue;
      const tol = 2;
      const overlap = !(fr.r <= cr.l + tol || fr.l >= cr.r - tol || fr.b <= cr.t + tol || fr.t >= cr.b - tol);
      if (overlap) fail('游离卡片 ' + f.type + '(' + f.id + ') 叠在容器 ' + c.type + '(' + c.id + ') 上，但不是它的子实体');
    }
  }

  // (b)
  if (skip.indexOf('undo') < 0 && s.undoBefore !== null && snap.undo !== null) {
    const grew = snap.undo - s.undoBefore;
    if (grew > 1) fail('一个手势增加了 ' + grew + ' 个撤销项（期望最多 1）');
  }
  s.undoBefore = null;

  // (c)
  for (const ws of snap.ws) {
    for (const it of ws.items) {
      let shown;
      if (it.name) shown = ws.text.indexOf(it.name) >= 0;
      else {
        const ls = ws.figs.filter((f) => f.id === it.id);   // 没有名字：看界面给它算出的标签是不是都画在了画布上
        shown = ls.length > 0 && ls.every((f) => f.label && ws.text.indexOf(f.label) >= 0);
      }
      if (!shown) fail('工作区里的图形 ' + it.id + ' 没有标签显示');
      if (ws.view) {
        const hw = ws.view.span / 2, hh = ws.view.span * ws.h / (2 * ws.w);
        // 中心在可见范围之外是允许的（手动缩放会把图形推出去；界面设计对此画边缘箭头，见 stage-canvas.js 的 offArrows）。
        // 所以这里的要求是：整个图形都在可见范围外面时，界面必须画出它的边缘箭头（data-offscreen）；
        // 图形还有一部分在范围里，它是看得见的，不需要箭头。原来的断言（中心必须在范围里）和设计不一致，已改成这一条。
        const cOut = Math.abs(it.cx - ws.view.cx) > hw || Math.abs(it.cy - ws.view.cy) > hh;
        const whollyOut = it.x1 < ws.view.cx - hw || it.x0 > ws.view.cx + hw || it.y1 < ws.view.cy - hh || it.y0 > ws.view.cy + hh;
        if (cOut && whollyOut) {
          const hasArrow = it.name ? ws.arrows.some((t) => t.indexOf(it.name) >= 0) : ws.arrows.length > 0;
          if (!hasArrow) fail('工作区里的图形 ' + (it.name || it.id) + ' 整个在可见范围之外，但界面没有画出它的边缘箭头');
        }
      }
    }
  }

  // (d)
  if (s.errs.length) fail('控制台报错：' + s.errs[0] + (s.errs.length > 1 ? '（另有 ' + (s.errs.length - 1) + ' 条）' : ''));
}

// 滚轮（指在 x、y 上滚一次）：dy<0 放大。指在工作区上只缩放这个工作区，指在别处缩放台面
async function wheelAt(page, x, y, dy) {
  await begin(page, 'wheel(' + dy + ')');
  await page.mouse.move(x, y);
  await page.mouse.wheel(0, dy);
  await pause(page, 200);
  return { visible: true, text: await bannerText(page), added: [], label: '' };
}

// 台面空白处拖动：平移台面
async function panStage(page, from, to) {
  await begin(page, 'panStage');
  await dragPath(page, from, to);
  return { visible: true, text: await bannerText(page), added: [], label: '' };
}

// 双击卡片标题（工作区：进入专注模式）
async function dblClickHd(page, id) {
  await begin(page, 'dblClickHd(' + id + ')');
  const hd = page.locator('.card[data-id="' + id + '"] .hd').first();
  await hd.scrollIntoViewIfNeeded();
  const b = await hd.boundingBox();
  if (!b) throw new Error('标题栏不在屏幕上：' + id);
  await page.mouse.dblclick(b.x + b.width / 2, b.y + b.height / 2);
  await pause(page, 250);
  return { visible: true, text: await bannerText(page), added: [], label: '' };
}

// 点对话框里的按钮（删除容器时的“连里面一起删”“只删容器”“算了”）
const clickDialog = (page, sel) => clickSel(page, sel);

module.exports = {
  attachErrorCollector, assertInvariants,
  dragTileTo, dragCardTo, clickTile, clickCard, clickSel, clickAt, dblClickAt, undo, redo, press,
  wheelAt, panStage, dblClickHd, clickDialog, dragPath,
  cardIds, bannerText,
};
