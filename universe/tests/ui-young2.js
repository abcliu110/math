/* node tests/ui-young2.js —— 低年级帮手（试验台增强 6，js/ui/young-aid.js）。真实鼠标：
 *   (A) 1 年级两道（钱币、数轴比位置）、2 年级一道（估算）操作台题：<html data-lowgrade="on">；
 *       操作台上每个能点的地方（data-pick-set、data-pick-k、把手）从中心往四边真正点得到的范围 ≥ 44×44 屏幕像素（elementFromPoint 量）；
 *       按钮里的字比原来大；真实鼠标点在原来的按钮外面、放大出来的那一圈里，照样能用（台面的属性变了）。
 *   (B) 读出来：打桩的 speechSynthesis（有一个 zh-CN 语音）。左栏题目、这一步、卡片标题栏都有 🔊，各至少 44×44；
 *       真实鼠标点一下，speak 被调用，读的是题目 / 这一步 / 操作台上的话，符号换成了“加、等于”；点 🔊 不会选中或拖动卡片。
 *       左栏有图标（📖 👉 🔄），左栏的字变大。
 *   (C) 没有 speechSynthesis 的浏览器：不出 🔊，图标照样有，没有页面错误。
 *   (D) 5 年级的题：data-lowgrade="off"，左栏和卡片的 HTML 和不载入 young-aid.js 时一模一样（先开过 1 年级的题也一样）。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const watch = (p) => { const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); }); return errs; };

// 打桩的语音：有一个中文语音；speak 记下读了什么
const STUB = () => {
  window.__said = [];
  class U { constructor(t) { this.text = t; this.lang = ''; this.voice = null; this.rate = 1; } }
  const s = { getVoices: () => [{ lang: 'en-US', name: 'en' }, { lang: 'zh-CN', name: 'stub-zh' }], speak: (u) => window.__said.push({ text: u.text, lang: u.lang, voice: u.voice && u.voice.name }), cancel: () => {}, addEventListener: () => {} };
  Object.defineProperty(window, 'speechSynthesis', { value: s, configurable: true });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: U, configurable: true });
};
const NOSPEECH = () => {
  try { delete window.speechSynthesis; } catch (e) { /* 删不掉就盖住 */ }
  Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: undefined, configurable: true });
};

async function open(p, id) {
  await p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
  await p.evaluate((id) => { UI.App.openProblem(id, 'practice'); }, id); await p.waitForTimeout(300);
  await p.evaluate(() => {
    document.querySelectorAll('button').forEach((x) => { if (/^(知道了|跳过|先不猜|开始)$/.test(x.textContent.trim())) x.click(); });
    for (const k of Object.keys(UI.S.help || {})) UI.S.help[k] = false;
    if (UI.S.run) UI.S.run.armed = true;
    UI.Stage.render();
  });
  await p.waitForTimeout(250);
}
// 每个能点的地方：真正点得到的范围（从中心往四边，elementFromPoint 落在它里面）、原来的大小（不算 yg-hit）
const reachAll = (p) => p.evaluate(() => {
  const out = [];
  document.querySelectorAll('.card svg.bdy').forEach((svg) => svg.querySelectorAll('[data-pick-set],[data-pick-k],.grip').forEach((el) => {
    if (el.parentElement.closest('[data-pick-set],[data-pick-k],.grip')) return;
    const bb = el.getBoundingClientRect(), cx = bb.left + bb.width / 2, cy = bb.top + bb.height / 2;
    const mine = (x, y) => { const e = document.elementFromPoint(x, y); return !!e && (e === el || el.contains(e)); };
    const go = (dx, dy) => { let k = 0; while (k < 120 && mine(cx + dx * (k + 1), cy + dy * (k + 1))) k++; return k; };
    const hits = [...el.querySelectorAll(':scope > .yg-hit')];
    hits.forEach((h) => { h.style.display = 'none'; });
    const ob = el.getBoundingClientRect();
    hits.forEach((h) => { h.style.display = ''; });
    out.push({ w: go(-1, 0) + go(1, 0) + 1, h: go(0, -1) + go(0, 1) + 1, ow: ob.width, oh: ob.height, center: mine(cx, cy), tip: (el.querySelector('title') || {}).textContent || '' });
  }));
  return out;
});
const propsJson = (p) => p.evaluate(() => JSON.stringify(Object.values(UI.S.scene.entities).map((e) => e.props)));

(async () => {
  const b = await chromium.launch();

  // ---------- (A)(B) 1、2 年级的操作台题 ----------
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(STUB);
    const p = await ctx.newPage(); const errs = watch(p);
    await p.goto(url); await p.waitForTimeout(400);
    for (const [id, g] of [['g1-money-add-core', 1], ['g1-position-compare-core', 1], ['g2-estimate-trap', 2]]) {
      console.log(id + '（' + g + ' 年级）');
      await open(p, id);
      ok(await p.evaluate(() => document.documentElement.getAttribute('data-lowgrade') === 'on'), '(A) <html data-lowgrade="on">');
      const rs = await reachAll(p);
      const bad = rs.filter((r) => r.w < 44 || r.h < 44);
      ok(rs.length > 0 && bad.length === 0, '(A) ' + rs.length + ' 个能点的地方，真正点得到的范围都 ≥ 44×44（最小 ' + Math.min(...rs.map((r) => r.w)) + '×' + Math.min(...rs.map((r) => r.h)) + '）' + (bad.length ? '；不够的：' + bad.map((r) => r.tip + ' ' + r.w + '×' + r.h).join('、') : ''));
      ok(rs.some((r) => r.ow < 44 || r.oh < 44), '(A) 原来有比 44 小的按钮（放大是有意义的）');
      const big = await p.evaluate(() => [...document.querySelectorAll('.card svg.bdy [data-yg-fs]')].filter((t) => parseFloat(t.getAttribute('font-size')) > parseFloat(t.dataset.ygFs)).length);
      ok(big > 0, '(A) 按钮里的字放大了（' + big + ' 处）');
      // 真实鼠标：点在原来按钮外面、放大的那一圈里
      const spot = await p.evaluate(() => {
        for (const el of document.querySelectorAll('.card svg.bdy [data-pick-set], .card svg.bdy [data-pick-k]')) {
          const hits = [...el.querySelectorAll(':scope > .yg-hit')]; if (!hits.length) continue;
          // 看得见的按钮框（最大的那个 rect）；没有框就用整个元素（不算点击区）
          hits.forEach((h) => { h.style.display = 'none'; });
          const frame = [...el.querySelectorAll('rect')].filter((r) => !r.classList.contains('yg-hit')).map((r) => r.getBoundingClientRect()).sort((u, v) => v.width * v.height - u.width * u.height)[0];
          const ob = frame || el.getBoundingClientRect(); hits.forEach((h) => { h.style.display = ''; });
          const hb = hits[0].getBoundingClientRect(), cx = ob.left + ob.width / 2, cy = ob.top + ob.height / 2;
          const cands = [[cx, (hb.top + ob.top) / 2], [cx, (hb.bottom + ob.bottom) / 2], [(hb.left + ob.left) / 2, cy], [(hb.right + ob.right) / 2, cy]];
          for (const [x, y] of cands) {
            const out = x < ob.left - 1 || x > ob.right + 1 || y < ob.top - 1 || y > ob.bottom + 1;
            const e = document.elementFromPoint(x, y);
            if (out && e && (e === el || el.contains(e))) return { x, y, tip: (el.querySelector('title') || {}).textContent || '' };
          }
        }
        return null;
      });
      ok(!!spot, '(A) 找到一个点：在看得见的按钮框外面、放大的一圈里' + (spot ? '（' + spot.tip + '）' : ''));
      if (spot) {
        const before = await propsJson(p);
        await p.mouse.move(spot.x, spot.y); await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(250);
        ok((await propsJson(p)) !== before, '(A) 真实鼠标点在放大的一圈里：按钮照样起作用（台面的属性变了）');
      }
      // (B) 读出来
      await p.evaluate(() => { window.__said = []; });
      const says = await p.evaluate(() => [...document.querySelectorAll('[data-yg-say]')].map((x) => { const r = x.getBoundingClientRect(); return { k: x.dataset.ygSay, w: r.width, h: r.height }; }));
      for (const k of ['task', 'step', 'card']) ok(says.some((s) => s.k === k), '(B) 有 🔊（' + k + '）');
      ok(says.filter((s) => s.k !== 'card').every((s) => s.w >= 44 && s.h >= 44), '(B) 左栏的 🔊 至少 44×44');
      const cardSay = await p.evaluate(() => { const x = document.querySelector('[data-yg-say="card"]'); const r = x.getBoundingClientRect(); const cx = r.left + r.width / 2; let t = r.top, bt = r.bottom; const mine = (yy) => { const e = document.elementFromPoint(cx, yy); return e === x; }; while (mine(t - 1)) t--; while (mine(bt)) bt++; return { w: r.width + 12, h: bt - t }; });
      ok(cardSay.h >= 44 && cardSay.w >= 44, '(B) 卡片标题栏的 🔊 点得到的范围 ≥ 44×44（' + Math.round(cardSay.w) + '×' + Math.round(cardSay.h) + '）');
      const title = await p.evaluate(() => UI.S.problem.title);
      await p.locator('[data-yg-say="task"]').click(); await p.waitForTimeout(100);
      let said = await p.evaluate(() => window.__said.slice());
      ok(said.length === 1 && said[0].lang === 'zh-CN' && said[0].voice === 'stub-zh', '(B) 点题目的 🔊：speak 被调用一次，用中文语音');
      const t0 = await p.evaluate((s) => UI.YoungAid.speakable(s), title);
      ok(said.length && said[0].text.indexOf(t0) === 0 && !/[+=]/.test(said[0].text), '(B) 读的是题目（符号换成了字）：' + (said[0] || {}).text);
      const ask = await p.evaluate(() => { const m = UI.S.problem.milestones[0]; return m.ask || m.say; });
      await p.locator('.step [data-yg-say="step"]').first().click(); await p.waitForTimeout(100);
      said = await p.evaluate(() => window.__said.slice());
      const a0 = await p.evaluate((s) => UI.YoungAid.speakable(s), ask);
      ok(said.length === 2 && said[1].text.indexOf(a0.slice(0, 6)) >= 0, '(B) 点第一步的 🔊：读的是这一步要做的事：' + (said[1] || {}).text);
      const selBefore = await p.evaluate(() => UI.S.sel);
      const pos0 = await p.evaluate(() => { const c = document.querySelector('.card'); return c.style.left + ',' + c.style.top; });
      await p.locator('[data-yg-say="card"]').click(); await p.waitForTimeout(100);
      said = await p.evaluate(() => window.__said.slice());
      const sent = await p.evaluate(() => UI.YoungAid.cardSentences(document.querySelector('.card')));
      ok(said.length === 3 && sent.length > 0 && said[2].text.indexOf(await p.evaluate((s) => UI.YoungAid.speakable(s), sent[0])) >= 0, '(B) 点卡片的 🔊：读的是操作台上的话：' + ((said[2] || {}).text || '').slice(0, 40));
      ok((await p.evaluate(() => UI.S.sel)) === selBefore && (await p.evaluate(() => { const c = document.querySelector('.card'); return c.style.left + ',' + c.style.top; })) === pos0, '(B) 点 🔊 不选中、不挪动卡片');
      const ic = await p.evaluate(() => ({ title: !!document.querySelector('#leftbody .pcard b .yg-ico'), cur: [...document.querySelectorAll('#leftbody .step.cur .yg-ico')].some((x) => x.textContent === '👉'), restart: !!document.querySelector('#restart .yg-ico'), fs: parseFloat(getComputedStyle(document.querySelector('#leftbody .step')).fontSize) }));
      ok(ic.title && ic.cur && ic.restart, '(B) 左栏有图标：题目 📖、这一步 👉、重来 🔄');
      ok(ic.fs >= 16, '(B) 左栏步骤的字变大：' + ic.fs + 'px');
    }
    ok(errs.length === 0, '(A)(B) 没有页面错误' + (errs.length ? '（' + errs[0] + '）' : ''));
    await ctx.close();
  }

  // ---------- (C) 没有语音 ----------
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(NOSPEECH);
    const p = await ctx.newPage(); const errs = watch(p);
    await p.goto(url); await p.waitForTimeout(400);
    await open(p, 'g1-money-add-core');
    ok(await p.evaluate(() => !UI.YoungAid.canSpeak() && document.querySelectorAll('[data-yg-say]').length === 0), '(C) 没有 speechSynthesis：不出 🔊');
    ok(await p.evaluate(() => document.querySelectorAll('#leftbody .yg-ico').length > 0 && document.querySelectorAll('.yg-hit').length > 0), '(C) 图标和大按钮照样有');
    ok(await p.evaluate(() => UI.YoungAid.speak('你好') === false), '(C) speak 不报错，返回 false');
    ok(errs.length === 0, '(C) 没有页面错误' + (errs.length ? '（' + errs[0] + '）' : ''));
    await ctx.close();
  }

  // ---------- (D) 5 年级：样子不变 ----------
  {
    const snap = async (block, first) => {
      const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
      await ctx.addInitScript(STUB);
      if (block) await ctx.route('**/young-aid.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
      const p = await ctx.newPage(); const errs = watch(p);
      await p.goto(url); await p.waitForTimeout(400);
      if (first) await open(p, first);
      await open(p, 'g5-fraction-equiv-core');
      const r = await p.evaluate(() => ({
        low: document.documentElement.getAttribute('data-lowgrade'), grade: UI.S.problem.grade,
        left: document.getElementById('leftbody').innerHTML, card: [...document.querySelectorAll('.card')].map((c) => c.outerHTML).join(''),
        fs: getComputedStyle(document.querySelector('#leftbody .step')).fontSize,
      }));
      r.errs = errs.length;
      await ctx.close();
      return r;
    };
    const base = await snap(true), mine = await snap(false), after = await snap(false, 'g1-money-add-core');
    console.log('g5-fraction-equiv-core（' + mine.grade + ' 年级）');
    ok(mine.low === 'off' && after.low === 'off', '(D) 5 年级的题：data-lowgrade="off"');
    ok(mine.left === base.left && after.left === base.left, '(D) 左栏的 HTML 和不载入 young-aid.js 时一样（先开过 1 年级的题也一样）');
    ok(mine.card === base.card && after.card === base.card, '(D) 操作台卡片的 HTML 一样（没有点击区、没有放大的字、没有 🔊）');
    ok(mine.fs === base.fs, '(D) 左栏步骤的字号不变：' + base.fs);
    ok(base.errs + mine.errs + after.errs === 0, '(D) 没有页面错误');
  }

  await b.close();
  console.log('低年级帮手测试：' + (fail ? '不合格' : '通过') + '（' + pass + ' 通过，' + fail + ' 失败）');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('低年级帮手测试：不合格（脚本异常：' + e.message.split('\n')[0] + '）'); process.exit(1); });
