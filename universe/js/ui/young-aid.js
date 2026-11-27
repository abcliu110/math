/* 低年级帮手（试验台增强 6，2026-11-26）：1、2 年级的题（problem.grade ≤ 2）用起来顺手。不改各台的画法，台面和左栏画好以后统一加：
 *   1. 读出来：左栏的题目、每一步（目标和提示）、操作台卡片标题栏上各有一个 🔊，点一下用浏览器的 speechSynthesis 读中文。
 *      浏览器没有 speechSynthesis，或者没有中文语音，就不放 🔊（不报错）。读之前把 + − = 这些符号换成“加、减、等于”。
 *   2. 大按钮：操作台上能点的地方（data-pick-set、data-pick-k、把手 .grip）在自己里面加一块透明的点击区（rect.yg-hit），
 *      放大到屏幕上至少 44×44 像素；和别的能点的东西挨得近时，各让一半的空隙（不抢别人的点击），所以挤在一起的小格子可能放不满 44。
 *      按钮里的字放大 1.2 倍（放不下就缩到正好放得下，不比原来小）。台面缩放变了就按新的缩放重算。
 *   3. 图标：题目 📖、这一步 👉、做完的 ⭐、还没到的 🎯、提示 💡、重来 🔄，跟在文字前面（不替代文字，aria-hidden）。
 * 只在 1、2 年级的题里生效：<html data-lowgrade="on">（css/universe.css 的 html[data-lowgrade="on"] 规则放大左栏的字和按钮）；高年级的题什么都不加。
 * 纯函数（hitRects、speakable、stepIcon、pickVoice）在 node 里也能载入，tests/run.js 直接测。 */
(function (G) {
  'use strict';
  const UI = (G.UI = G.UI || {});
  const MIN = 44;          // 触控范围的下限（屏幕像素）
  const MIN_PAD = 2;       // 多放一点，量出来不会因为取整差一点点
  const TEXT_UP = 1.2;     // 按钮里的字放大的倍数
  const ICONS = Object.freeze({ title: '📖', cur: '👉', done: '⭐', todo: '🎯', hint: '💡', restart: '🔄', say: '🔊' });
  const CLICKABLE = '[data-pick-set],[data-pick-k],.grip';
  const OBSTACLE = CLICKABLE + ',[data-drag]';

  // ---------- 纯函数 ----------
  // 是不是低年级的题
  const isLow = (p) => !!(p && Number(p.grade) > 0 && Number(p.grade) <= 2);
  // 步骤的图标：做完 ⭐、正在做 👉、还没到 🎯
  const stepIcon = (st) => (st === 'done' ? ICONS.done : st === 'cur' ? ICONS.cur : ICONS.todo);
  // 把一个个格子放大成至少 min×min 的点击区。boxes：[{x,y,w,h}]（同一个坐标系），bound：外框（可省）。
  // 每个格子先想往四边各放一半；和别的格子之间只用到空隙的一半（两边各让一半，放大后不会盖住对方），靠边一侧不够就挪到另一侧。
  // 和别的格子本来就叠在一起的不放大（放大了会盖住对方的中心，原来点得到的反而点不到）。返回同样顺序的 [{x,y,w,h}]，一定包住原来的格子。
  function hitRects(boxes, min, bound) {
    const ov = (a0, a1, b0, b1) => a0 < b1 && b0 < a1;
    return boxes.map((b, i) => {
      if (boxes.some((o, j) => j !== i && ov(b.x, b.x + b.w, o.x, o.x + o.w) && ov(b.y, b.y + b.h, o.y, o.y + o.h))) return { x: b.x, y: b.y, w: b.w, h: b.h };
      const ex = Math.max(0, min - b.w), ey = Math.max(0, min - b.h);
      let L = bound ? b.x - bound.x : Infinity, R = bound ? bound.x + bound.w - b.x - b.w : Infinity;
      let T = bound ? b.y - bound.y : Infinity, B = bound ? bound.y + bound.h - b.y - b.h : Infinity;
      boxes.forEach((o, j) => {
        if (j === i) return;
        if (ov(b.y - ey, b.y + b.h + ey, o.y, o.y + o.h)) {
          if (o.x + o.w <= b.x) L = Math.min(L, (b.x - o.x - o.w) / 2);
          if (o.x >= b.x + b.w) R = Math.min(R, (o.x - b.x - b.w) / 2);
        }
        if (ov(b.x - ex, b.x + b.w + ex, o.x, o.x + o.w)) {
          if (o.y + o.h <= b.y) T = Math.min(T, (b.y - o.y - o.h) / 2);
          if (o.y >= b.y + b.h) B = Math.min(B, (o.y - b.y - b.h) / 2);
        }
      });
      const split = (need, lo, hi) => {
        lo = Math.max(0, lo); hi = Math.max(0, hi);
        let a = Math.min(need / 2, lo); const c = Math.min(need - a, hi); a = Math.min(need - c, lo);
        return [a, c];
      };
      const [l, r] = split(ex, L, R), [t, d] = split(ey, T, B);
      return { x: b.x - l, y: b.y - t, w: b.w + l + r, h: b.h + t + d };
    });
  }
  // 读出来之前整理文字：符号换成读得出的字，去掉表情和图标
  function speakable(s) {
    let t = String(s || '');
    t = t.replace(/✓/g, '对').replace(/✗/g, '不对');
    t = t.replace(/[\u{1F000}-\u{1FAFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{25A0}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, ' ');
    t = t.replace(/(\d)\s*[−-]\s*(?=\d)/g, '$1 减 ').replace(/\s[−-]\s/g, ' 减 ');
    t = t.replace(/\+/g, ' 加 ').replace(/[×✕]/g, ' 乘 ').replace(/÷/g, ' 除以 ');
    t = t.replace(/[=＝]\s*[?？]/g, ' 等于多少').replace(/[=＝]/g, ' 等于 ');
    t = t.replace(/[<＜]/g, ' 小于 ').replace(/[>＞]/g, ' 大于 ');
    t = t.replace(/[（(]\s*[）)]/g, ' ').replace(/[ \t　]+/g, ' ');
    return t.trim();
  }
  // 几句话接成一段：本来就以标点结尾的不再加句号
  const joinSentences = (arr) => arr.map((x) => String(x).trim()).filter(Boolean).map((x) => (/[。！？!?；;：:，,…]$/.test(x) ? x : x + '。')).join('');
  // 挑一个中文语音；没有就是 null
  const pickVoice = (voices) => (voices || []).find((v) => /^zh[-_]?(CN|Hans)?/i.test(v.lang || '') && /CN|Hans/i.test(v.lang || '')) || (voices || []).find((v) => /^zh/i.test(v.lang || '')) || null;

  UI.YoungAid = { MIN, ICONS, isLow, stepIcon, hitRects, speakable, pickVoice, joinSentences };
  if (!G.document || !G.document.documentElement) return;

  // ---------- 读出来 ----------
  const doc = G.document;
  const synth = () => { try { return G.speechSynthesis && typeof G.SpeechSynthesisUtterance === 'function' ? G.speechSynthesis : null; } catch (e) { return null; } };
  const voice = () => { const s = synth(); if (!s) return null; try { return pickVoice(s.getVoices()); } catch (e) { return null; } };
  const canSpeak = () => !!voice();
  function speak(text) {
    const s = synth(), v = voice(), t = speakable(text);
    if (!s || !v || !t) return false;
    try {
      s.cancel();
      const u = new G.SpeechSynthesisUtterance(t);
      u.lang = v.lang || 'zh-CN'; u.voice = v; u.rate = 0.9;
      s.speak(u);
      return true;
    } catch (e) { return false; }
  }
  const sayBtn = (kind, label) => '<button type="button" class="yg-say" data-yg-say="' + kind + '" title="' + label + '" aria-label="' + label + '">' + ICONS.say + '</button>';
  const ico = (c) => '<span class="yg-ico" aria-hidden="true">' + c + '</span>';
  // 一段里要读的文字：去掉 🔊 按钮、图标、步骤的序号和分数
  function plainText(el) {
    const c = el.cloneNode(true);
    c.querySelectorAll('.yg-say,.yg-ico,.no,.sc,.tags').forEach((x) => x.remove());
    return c.textContent.replace(/\s+/g, ' ').trim();
  }
  // 操作台卡片上的说明句子：卡片画布里带汉字的文字，按画的顺序，去掉按钮上的字和重复的
  function cardSentences(card) {
    const out = [], seen = new Set();
    card.querySelectorAll('svg.bdy text').forEach((t) => {
      if (t.closest(CLICKABLE)) return;
      const s = t.textContent.replace(/\s+/g, ' ').trim();
      if (!/[一-鿿]/.test(s) || s.length < 2 || seen.has(s)) return;
      seen.add(s); out.push(s);
    });
    return out;
  }
  function textFor(btn) {
    const k = btn.dataset.ygSay;
    if (k === 'card') { const card = btn.closest('.card'); return card ? joinSentences(cardSentences(card)) : ''; }
    const box = btn.closest('.pcard,.step');
    return box ? plainText(box) : '';
  }
  // 按下 🔊：先于台面和左栏自己的处理（捕获阶段），不选中、不拖卡片
  function onSay(ev) {
    const b = ev.target && ev.target.closest && ev.target.closest('[data-yg-say]');
    if (!b) return;
    ev.preventDefault(); ev.stopPropagation();
    if (ev.type === 'click' || ev.type === 'keydown') return;   // 读一次：在 pointerdown 时读，click 只拦住
    speak(textFor(b));
  }
  doc.addEventListener('pointerdown', onSay, true);
  doc.addEventListener('mousedown', (ev) => { if (ev.target && ev.target.closest && ev.target.closest('[data-yg-say]')) ev.stopPropagation(); }, true);
  doc.addEventListener('click', onSay, true);
  doc.addEventListener('keydown', (ev) => {
    const b = ev.target && ev.target.closest && ev.target.closest('[data-yg-say]');
    if (b && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); ev.stopPropagation(); speak(textFor(b)); }
  }, true);

  // ---------- 左栏：图标、🔊 ----------
  function decorateLeft(low) {
    const box = doc.getElementById('leftbody'); if (!box) return;
    if (!low) { box.querySelectorAll('.yg-say,.yg-ico').forEach((x) => x.remove()); return; }
    const say = canSpeak();
    box.querySelectorAll('.pcard').forEach((pc) => {
      if (pc.dataset.yg) return; pc.dataset.yg = '1';
      const b = pc.querySelector(':scope > b');
      if (b) b.insertAdjacentHTML('afterbegin', ico(ICONS.title));
      if (say && b) pc.insertAdjacentHTML('afterbegin', sayBtn('task', '读题目'));
    });
    box.querySelectorAll('.step').forEach((st) => {
      if (st.dataset.yg) return; st.dataset.yg = '1';
      const sy = st.querySelector('.sy'); if (!sy) return;
      sy.insertAdjacentHTML('afterbegin', ico(stepIcon(st.classList.contains('done') ? 'done' : st.classList.contains('cur') ? 'cur' : 'todo')));
      const h = sy.querySelector('.hint'); if (h) h.insertAdjacentHTML('afterbegin', ico(ICONS.hint));
      if (say) sy.insertAdjacentHTML('afterend', sayBtn('step', '读这一步'));
    });
    const rs = doc.getElementById('restart');
    if (rs && !rs.dataset.yg) { rs.dataset.yg = '1'; rs.insertAdjacentHTML('afterbegin', ico(ICONS.restart)); }
  }

  // ---------- 台面：大按钮、按钮里的字、卡片的 🔊 ----------
  function bigText(el) {
    if (el.classList.contains('grip')) return;
    const rect = [...el.querySelectorAll('rect')].filter((r) => !r.classList.contains('yg-hit')).sort((a, b) => b.getBBox().width - a.getBBox().width)[0];
    if (!rect) return;
    const room = rect.getBBox().width - 6;
    el.querySelectorAll('text').forEach((t) => {
      if (t.dataset.ygFs) return;
      const fs = parseFloat(t.getAttribute('font-size')) || 12;
      t.dataset.ygFs = String(fs);
      const w0 = t.getComputedTextLength ? t.getComputedTextLength() : 0;
      if (!(w0 > 0)) return;
      const up = Math.max(fs, Math.min(fs * TEXT_UP, fs * room / w0));
      if (up > fs + 0.2) t.setAttribute('font-size', String(Math.round(up * 10) / 10));
    });
  }
  function decorateSvg(svg) {
    const els = [...svg.querySelectorAll(CLICKABLE)].filter((el) => !el.parentElement.closest(CLICKABLE));
    if (!els.length) return;
    els.forEach(bigText);
    els.forEach((el) => el.querySelectorAll(':scope > rect.yg-hit').forEach((x) => x.remove()));
    const obst = [...svg.querySelectorAll(OBSTACLE)].filter((el) => els.indexOf(el) < 0 && !el.parentElement.closest(CLICKABLE));
    const all = els.concat(obst);
    const boxes = all.map((el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
    const sr = svg.getBoundingClientRect();
    const hits = hitRects(boxes, MIN + MIN_PAD, { x: sr.left, y: sr.top, w: sr.width, h: sr.height });
    els.forEach((el, i) => {
      const b = boxes[i], h = hits[i];
      if (h.w <= b.w + 0.5 && h.h <= b.h + 0.5) return;
      const m = el.getScreenCTM && el.getScreenCTM(); if (!m) return;
      const inv = m.inverse(), p0 = svg.createSVGPoint(), p1 = svg.createSVGPoint();
      p0.x = h.x; p0.y = h.y; p1.x = h.x + h.w; p1.y = h.y + h.h;
      const a = p0.matrixTransform(inv), c = p1.matrixTransform(inv);
      const r = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
      r.setAttribute('class', 'yg-hit');
      r.setAttribute('x', String(Math.min(a.x, c.x))); r.setAttribute('y', String(Math.min(a.y, c.y)));
      r.setAttribute('width', String(Math.abs(c.x - a.x))); r.setAttribute('height', String(Math.abs(c.y - a.y)));
      r.setAttribute('fill', 'transparent');
      el.appendChild(r);
    });
  }
  function decorateStage(low) {
    const world = doc.getElementById('world'); if (!world) return;
    if (!low) { world.querySelectorAll('.yg-hit,.yg-say').forEach((x) => x.remove()); return; }
    const z = UI.S && UI.S.view ? String(UI.S.view.z) : '1', say = canSpeak();
    world.querySelectorAll('.card').forEach((card) => {
      const svg = card.querySelector('svg.bdy');
      if (svg && !svg.classList.contains('wsbody') && svg.dataset.ygZ !== z) { svg.dataset.ygZ = z; decorateSvg(svg); }
      const hd = card.querySelector('.hd');
      if (say && hd && svg && !hd.querySelector('.yg-say') && cardSentences(card).length) hd.querySelector('.nm').insertAdjacentHTML('afterend', sayBtn('card', '读操作台上的话'));
    });
  }

  // ---------- 台面、左栏画好以后再加（MutationObserver；加的时候先停止观察，免得自己触发自己） ----------
  let mo = null;
  function pass() {
    const low = isLow(UI.S && UI.S.problem);
    const root = doc.documentElement, want = low ? 'on' : 'off';
    if (root.getAttribute('data-lowgrade') !== want) root.setAttribute('data-lowgrade', want);
    if (mo) mo.disconnect();
    try { decorateLeft(low); decorateStage(low); } catch (e) { /* 装饰失败不影响做题 */ }
    if (mo) { mo.takeRecords(); watch(); }
  }
  function watch() {
    const w = doc.getElementById('world'), l = doc.getElementById('leftbody');
    if (w) mo.observe(w, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    if (l) mo.observe(l, { childList: true, subtree: true });
  }
  function start() {
    if (typeof G.MutationObserver !== 'function') return;
    mo = new G.MutationObserver(pass);
    watch(); pass();
    const s = synth();
    // 语音列表是异步加载的：加载好了重新放 🔊（左栏、卡片都重来一遍）
    if (s && s.addEventListener) s.addEventListener('voiceschanged', () => { doc.querySelectorAll('[data-yg]').forEach((x) => { delete x.dataset.yg; }); doc.querySelectorAll('.yg-say,.yg-ico').forEach((x) => x.remove()); pass(); });
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start); else start();
  Object.assign(UI.YoungAid, { speak, canSpeak, cardSentences, refresh: pass });
})(typeof globalThis !== 'undefined' ? globalThis : window);
