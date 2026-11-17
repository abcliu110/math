/* 操作台真实鼠标测试的公共部分：开浏览器、开题、读输出、按按钮上的字或 title 点、拖把手（卡片坐标）。
 * 用法：const H = await require('./bench-harness.js')('anglebench'); …… await H.end('量角器与角'); */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
module.exports = async (type) => {
  const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
  let pass = 0, fail = 0;
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(400);
  const closeDlg = () => p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
  const H = {
    p,
    ok: (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } },
    open: async (id) => {
      await p.waitForTimeout(700); await closeDlg();
      await p.evaluate((id) => { UI.App.openProblem(id, 'practice'); }, id); await p.waitForTimeout(300);
      await p.evaluate(() => {
        document.querySelectorAll('button').forEach((x) => { if (/^(知道了|跳过|先不猜|开始)$/.test(x.textContent.trim())) x.click(); });
        for (const k of Object.keys(UI.S.help || {})) UI.S.help[k] = false;
        if (UI.S.run) UI.S.run.armed = true;
        UI.Stage.render();
      });
      await p.waitForTimeout(200);
    },
    out: (port) => p.evaluate(([type, port]) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === type), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, [type, port]),
    props: () => p.evaluate((type) => Object.assign({}, Object.values(UI.S.scene.entities).find((x) => x.type === type).props), type),
    press: async (label, n) => { await closeDlg(); await p.locator('.card svg.bdy g[data-pick-set]').filter({ hasText: label }).nth(n || 0).click(); await p.waitForTimeout(140); },
    byTitle: async (title, n) => { await closeDlg(); await p.locator('.card svg.bdy g[data-pick-set]').filter({ has: p.locator('title', { hasText: new RegExp('^' + title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$') }) }).nth(n || 0).click(); await p.waitForTimeout(140); },
    read: (sel) => p.evaluate((sel) => { const g = document.querySelector('.card svg.bdy ' + (sel || '[data-read]')); return g ? g.textContent : ''; }, sel),
    text: () => p.evaluate(() => Array.from(document.querySelectorAll('.card svg.bdy text')).map((t) => t.textContent).join('|')),
    done: (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id),
    // 卡片坐标里从 from 拖到 to（真实鼠标）
    drag: async (from, to) => {
      await closeDlg();
      const sc = (x, y) => p.evaluate(([x, y]) => { const svg = document.querySelector('.card svg.bdy'), pt = svg.createSVGPoint(); pt.x = x; pt.y = y; const q = pt.matrixTransform(svg.getScreenCTM()); return [q.x, q.y]; }, [x, y]);
      const [x0, y0] = await sc(...from), [x1, y1] = await sc(...to);
      await p.mouse.move(x0, y0); await p.mouse.down(); await p.mouse.move((x0 + x1) / 2, (y0 + y1) / 2, { steps: 5 }); await p.mouse.move(x1, y1, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(200);
    },
    end: async (name) => {
      H.ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
      H.ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
      console.log('\n' + name + '测试：' + pass + ' 通过，' + fail + ' 失败');
      await b.close(); process.exit(fail ? 1 : 0);
    },
  };
  return H;
};
