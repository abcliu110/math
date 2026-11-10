/* node tests/ui-constraint.js —— 约束锁定与尺寸驱动（§10.5.9 第 1、2 条）。用真实鼠标和键盘。
 *   (1) 锁长：选中线段 AB（A(0,0)、B(3,4)），点工具条「锁长」，线段上出现「锁 长 5」的标签，步骤里多一步；
 *   (2) 拖动锁住的端点 B 到 (6,0)：B 只能落在长 5 的圆上，落到 (5,0)，标签还在；
 *   (3) 双击长度标签，输入 4 回车：B 落到 (4,0)，锁住的长度变成 4；撤销一次回到 (5,0)、长 5；
 *   (4) 选中线段，点「解锁长」：标签不见了；再拖 B 到 (6,0)，B 真的到了 (6,0)（没有约束）；
 *   (5) 直角：三角形 A(0,0)、B(4,0)、C(0,3)，选中多边形，点「锁直角」：A 处出现直角标记；
 *       拖 C 到 (2,5)：C 只能沿 AB 的垂线走，落到 (0,5)；
 *   (6) 撤销、重做、步骤都是一步一步的（assertInvariants）。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const G = require('./gestures');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  G.attachErrorCollector(p);
  await p.goto(url); await p.waitForTimeout(300);

  // 每一块测试从空台面开始：工作区里放点、线段或多边形
  const fresh = async (build) => {
    await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); UI.S.sel = null; UI.Panels.renderInsp(); });
    await p.waitForTimeout(120);
    const ids = await p.evaluate((src) => {
      const A = UI.App;
      const ws = A.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id;
      const pt = (name, x, y) => {
        const n = A.act({ t: 'add', type: 'gpt', x: 0, y: 0, props: { x, y, mark: name } }).id;
        A.act({ t: 'put', id: n, parent: ws, slot: 'items' });
        return n;
      };
      const seg = (p1, p2) => {
        const s = A.act({ t: 'add', type: 'gseg', x: 0, y: 0 }).id;
        A.act({ t: 'link', from: p1, fromPort: 'p', to: s, toPort: 'a' });
        A.act({ t: 'link', from: p2, fromPort: 'p', to: s, toPort: 'b' });
        A.act({ t: 'put', id: s, parent: ws, slot: 'items' });
        return s;
      };
      const poly = (vs) => {
        const s = A.act({ t: 'add', type: 'gpoly', x: 0, y: 0 }).id;
        for (const v of vs) A.act({ t: 'link', from: v, fromPort: 'p', to: s, toPort: 'pts' });
        A.act({ t: 'put', id: s, parent: ws, slot: 'items' });
        return s;
      };
      const out = { ws };
      if (src === 'seg') { out.a = pt('A', 0, 0); out.b = pt('B', 3, 4); out.s = seg(out.a, out.b); }
      if (src === 'tri') { out.a = pt('A', 0, 0); out.b = pt('B', 4, 0); out.c = pt('C', 0, 3); out.s = poly([out.a, out.b, out.c]); }
      UI.Stage.fit(); UI.Stage.render();
      return out;
    }, build);
    await p.waitForTimeout(250);
    return ids;
  };

  // 工作区坐标 → 屏幕坐标（和 ui-snap2 一样）
  const scr = (pts) => p.evaluate((pts) => {
    const wb = document.querySelector('svg.wsbody');
    const r = wb.getBoundingClientRect(), wsId = wb.dataset.wsid, vw = UI.Stage.rangeOf(wsId), sc = UI.Space.canvasOf(r, vw.span);
    return pts.map((q) => UI.Space.workspaceToScreen(q, vw, sc));
  }, pts);
  const ent = (id) => p.evaluate((id) => { const e = UI.S.scene.entities[id]; return e ? { x: e.props.x, y: e.props.y, len: e.props.len, kind: e.props.kind } : null; }, id);
  const conOf = (id) => p.evaluate((id) => Object.values(UI.S.scene.entities).filter((e) => e.type === 'gcon' && UI.S.scene.links.some((l) => l.to === e.id && l.from === id)).map((e) => ({ id: e.id, len: e.props.len, kind: e.props.kind })), id);
  const conCount = () => p.evaluate(() => Object.values(UI.S.scene.entities).filter((e) => e.type === 'gcon').length);
  const handleOf = (id) => p.evaluate((id) => { const el = document.querySelector('circle[data-drag="' + id + '"]'); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, id);
  const clickAt = async (pt) => { await p.mouse.move(pt.x, pt.y); await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(200); };
  const dragTo = async (from, to) => {
    await p.mouse.move(from.x, from.y); await p.mouse.down();
    await p.mouse.move(to.x, to.y, { steps: 12 });
    await p.mouse.up(); await p.waitForTimeout(250);
  };
  const fbarBtn = (label) => p.evaluate((label) => {
    const bs = [...document.querySelectorAll('button[data-fbar="lock"]')].filter((b) => b.offsetParent !== null);
    const b0 = bs.find((b) => b.textContent.trim() === label); if (!b0) return null;
    const r = b0.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, label);
  const labelText = (segId) => p.evaluate((segId) => [...document.querySelectorAll('svg.wsbody text[data-dim="' + segId + '"]')].map((t) => t.textContent), segId);
  const rightMarks = () => p.evaluate(() => document.querySelectorAll('svg.wsbody [data-rmark]').length);
  const inv = (label) => G.assertInvariants(p, label);

  try {
    // ---------- (1)(2)(3)(4) 线段 ----------
    const s = await fresh('seg');
    await p.evaluate(() => { UI.S.wsSel = []; });
    // 选中线段 AB：点它的中点（工作区坐标 (1.5, 2)）
    const [mid] = await scr([{ x: 1.5, y: 2 }]);
    await clickAt(mid);
    const lockBtn = await fbarBtn('锁长');
    ok(!!lockBtn, '(1) 选中线段后，工具条上出现「锁长」按钮');
    await clickAt(lockBtn);
    await inv('点锁长');
    const cs = await conOf(s.a);
    ok(cs.length === 1 && cs[0].len === 5 && cs[0].kind === 0, '(1) 锁长后背后有一个定长约束，长 5，接着 A');
    ok((await labelText(s.s)).some((t) => /锁/.test(t) && /5/.test(t)), '(1) 线段上写着「锁 长 5」');

    // (2) 拖锁住的端点 B 到 (6,0)
    const hB = await handleOf(s.b);
    const [t60] = await scr([{ x: 6, y: 0 }]);
    await dragTo(hB, t60);
    await inv('拖动锁住的端点 B');
    const B1 = await ent(s.b);
    ok(B1 && B1.x === 5 && B1.y === 0, '(2) B 拖到 (6,0)，只能落在长 5 的圆上：实际 (' + (B1 && B1.x) + ', ' + (B1 && B1.y) + ')，应为 (5, 0)');
    ok((await labelText(s.s)).some((t) => /锁/.test(t)), '(2) 拖动以后标签还在（锁住的状态显示在图形上）');

    // (3) 双击长度标签，输入 4 回车
    const [lab] = await p.evaluate((segId) => {
      const t = document.querySelector('svg.wsbody text[data-dim="' + segId + '"]');
      if (!t) return [];
      const r = t.getBoundingClientRect(); return [{ x: r.left + r.width / 2, y: r.top + r.height / 2 }];
    }, s.s);
    ok(!!lab, '(3) 找得到长度标签（可以双击）');
    if (lab) {
      await p.mouse.dblclick(lab.x, lab.y); await p.waitForTimeout(200);
      const inpOpen = await p.evaluate(() => !!document.querySelector('input.wsx-dim'));
      ok(inpOpen, '(3) 双击后出现输入框');
      await p.keyboard.press('Control+A'); await p.keyboard.type('4'); await p.keyboard.press('Enter');
      await p.waitForTimeout(250);
      await inv('输入长度 4');
      const B2 = await ent(s.b), c2 = await conOf(s.a);
      ok(B2 && B2.x === 4 && B2.y === 0, '(3) 长度改成 4，B 落到 (4, 0)：实际 (' + (B2 && B2.x) + ', ' + (B2 && B2.y) + ')');
      ok(c2.length === 1 && c2[0].len === 4, '(3) 锁住的长度变成 4');
      await G.undo(p); await p.waitForTimeout(250);
      await inv('撤销长度');
      const B3 = await ent(s.b), c3 = await conOf(s.a);
      ok(B3 && B3.x === 5 && B3.y === 0 && c3[0] && c3[0].len === 5, '(3) 撤销一次：回到 (5, 0)、长 5');
    }

    // (4) 解锁长，B 可以自由拖
    const [midNow] = await scr([{ x: 2.5, y: 0 }]);
    await clickAt(midNow);
    const unlockBtn = await fbarBtn('解锁长');
    ok(!!unlockBtn, '(4) 锁住的线段选中后，按钮变成「解锁长」');
    if (unlockBtn) { await clickAt(unlockBtn); await inv('解锁长'); }
    ok((await conOf(s.a)).length === 0, '(4) 解锁后约束没有了');
    const [t60b] = await scr([{ x: 6, y: 0 }]);   // 屏幕位置在拖动前重新算（上一步可能改了画布的布局）
    await dragTo(await handleOf(s.b), t60b);
    const B4 = await ent(s.b);
    ok(B4 && B4.x === 6 && B4.y === 0, '(4) 解锁后 B 能拖到 (6, 0)：实际 (' + (B4 && B4.x) + ', ' + (B4 && B4.y) + ')');
    ok((await labelText(s.s)).length === 0, '(4) 解锁后标签不见了');

    // ---------- (5) 直角 ----------
    const t2 = await fresh('tri');
    const [edgeMid] = await scr([{ x: 2, y: 0 }]);
    await clickAt(edgeMid);
    const rBtn = await fbarBtn('锁直角');
    ok(!!rBtn, '(5) 选中三角形后，工具条上有「锁直角」');
    if (rBtn) { await clickAt(rBtn); await inv('锁直角'); }
    const rc = await p.evaluate(() => Object.values(UI.S.scene.entities).filter((e) => e.type === 'gcon' && e.props.kind === 1).length);
    ok(rc === 1, '(5) 锁直角后有一个直角约束（三角形只有 A 是直角）');
    ok((await rightMarks()) === 1, '(5) A 处画出直角标记');
    const hC = await handleOf(t2.c);
    const [t25] = await scr([{ x: 2, y: 5 }]);
    await dragTo(hC, t25);
    await inv('拖动直角的顶点 C');
    const C1 = await ent(t2.c);
    ok(C1 && C1.x === 0 && C1.y === 5, '(5) C 拖到 (2,5)，只能沿与 AB 垂直的线走，落到 (0, 5)：实际 (' + (C1 && C1.x) + ', ' + (C1 && C1.y) + ')');

    // (6) 撤销
    await G.undo(p); await p.waitForTimeout(250);
    await inv('撤销拖动直角顶点');
    const C2 = await ent(t2.c);
    ok(C2 && C2.x === 0 && C2.y === 3, '(6) 撤销后 C 回到 (0, 3)');
  } catch (e) {
    fail++; console.log('  FAIL 异常：' + (e && e.stack || e));
  }

  const others = errs.filter((x) => !/favicon/.test(x));
  ok(others.length === 0, '控制台没有报错：' + others.slice(0, 3).join(' | '));
  await b.close();
  console.log('\n' + pass + ' 通过，' + fail + ' 失败');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL ' + (e && e.stack || e)); process.exit(1); });
