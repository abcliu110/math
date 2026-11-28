/* 回放条和“这个数是怎么来的”（试验台增强 4；内核的话在 js/core/process.js 的 U.Process）。
 *
 * 回放：一帧是一份台面快照：撤销栈里的那些（每一步做之前的台面）加上现在的台面（UI.App.frames）。所以回放的就是“开题以来我做的每一步”，
 *   撤销掉的那一步不算（撤销栈里也没有了）。入口：步骤栏的“🎬 看看我是怎么做的”、做完的对话框里同名的按钮、来历对话框里的“一步一步看”。
 *   回放条（台面下方，暂时代替时钟条）：⏮ 上一步、▶ 播放 / ⏸ 暂停、⏭ 下一步、拖动进度，下面一句人话说这一步做了什么（U.Process.stepSay）。
 *   只看不改：台面暂时换成那一帧（S.scene），台面上盖一层挡板（点了只提示“正在回放”）；事务（tx）、撤销、判分（judgeNow）在回放中都不做；
 *   不进撤销、不记事件、不存档、不弹“做完了”、联动组不闪（S.flash 清空）。“✕ 退出回放”（或 Esc）换回原来的台面对象，什么都没变过。
 *   换题、载入台面时先放下回放（UI.App 调 drop，不恢复，因为马上要换台面）。
 * 来历：步骤栏“📍 台面上现在”每一行的“怎么来的？”（data-bwhy="id|port"）打开对话框，三段：怎么算的、一起变的样子（联动组）、一步一步怎么变过来的。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), W = U.World, K = U.kit, esc = K.esc;
  const $ = (s) => document.querySelector(s);
  const STEP_MS = 1300;   // 自动播放：每一步停多久
  let timer = 0;

  // 一帧 → 台面对象：视图（实体的 ui）用现在的；时钟停着（不让时钟循环在回放里走）
  function frameScene(str) {
    const sc = UI.App.loadKeepView(str);
    if (sc.clock) sc.clock.running = false;
    return sc;
  }
  function bar() {
    let b = $('#replaybar');
    if (b) return b;
    b = document.createElement('div');
    b.className = 'fab'; b.id = 'replaybar'; b.setAttribute('role', 'group'); b.setAttribute('aria-label', '回放：我是怎么一步步做的');
    b.innerHTML = '<div class="rp-row"><span class="rp-tag">🎬 回放</span><button id="rp-prev" title="上一步（←）" aria-label="上一步">⏮</button><button id="rp-play" class="go" title="播放 / 暂停（空格）" aria-label="播放或暂停">▶</button><button id="rp-next" title="下一步（→）" aria-label="下一步">⏭</button>' +
      '<input type="range" id="rp-pos" min="0" max="1" step="1" value="0" aria-label="拖动回放进度"><span class="rp-n" id="rp-n"></span><button id="rp-exit" title="回到现在的台面（Esc）">✕ 退出回放</button></div><div class="rp-say" id="rp-say" aria-live="polite"></div>';
    $('#stagewrap').appendChild(b);
    const sh = document.createElement('div'); sh.id = 'replayshield'; sh.title = '正在回放：只能看，不能改';
    $('#stagewrap').appendChild(sh);
    b.addEventListener('click', (e) => {
      const t = e.target.closest('button'); if (!t) return;
      if (t.id === 'rp-prev') { pause(); go(UI.S.replay.i - 1); }
      if (t.id === 'rp-next') { pause(); go(UI.S.replay.i + 1); }
      if (t.id === 'rp-play') toggle();
      if (t.id === 'rp-exit') exit();
    });
    b.querySelector('#rp-pos').addEventListener('input', (e) => { const v = +e.target.value; pause(); go(v); });   // 先读值：pause 会按现在的帧重画进度条
    sh.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); UI.App.say('正在回放：只能看，不能改。点「✕ 退出回放」回到现在的台面', 'warn', 2400); });
    sh.addEventListener('wheel', (e) => { e.preventDefault(); }, { passive: false });
    return b;
  }
  // 第 i 步的人话（第 0 帧是开始的样子），算一次记下来
  function sayOf(i) {
    const R = UI.S.replay;
    if (i === 0) return '开始的样子（还没动手）';
    if (R.say[i] === undefined) { let s = ''; try { s = U.Process.stepSay(R.frames[i - 1], R.frames[i]); } catch (x) { s = '做了一步'; } R.say[i] = s || '做了一步'; }
    return R.say[i];
  }
  function paint() {
    const R = UI.S.replay; if (!R) return;
    const n = R.frames.length - 1, b = bar();
    b.querySelector('#rp-pos').max = String(n); b.querySelector('#rp-pos').value = String(R.i);
    b.querySelector('#rp-n').textContent = R.i === 0 ? '开始' : '第 ' + R.i + ' / ' + n + ' 步';
    b.querySelector('#rp-say').textContent = (R.i === 0 ? '' : '第 ' + R.i + ' 步：') + sayOf(R.i) + (R.i === n ? (R.i ? '　（这就是现在的台面）' : '') : '');
    b.querySelector('#rp-play').textContent = timer ? '⏸' : '▶';
    b.querySelector('#rp-prev').disabled = R.i <= 0; b.querySelector('#rp-next').disabled = R.i >= n;
  }
  function go(i) {
    const S = UI.S, R = S.replay; if (!R) return;
    R.i = Math.max(0, Math.min(R.frames.length - 1, i));
    S.scene = frameScene(R.frames[R.i]); S.D = W.evaluate(S.scene); S.flash = null; S.sel = null; S.selLink = null;
    UI.Stage.render(); UI.Panels.renderLeft(); paint();
  }
  function pause() { if (timer) { clearInterval(timer); timer = 0; } paint(); }
  function play() {
    const R = UI.S.replay; if (!R) return;
    if (R.i >= R.frames.length - 1) go(0);   // 已经在最后：从头放
    if (timer) clearInterval(timer);
    timer = setInterval(() => { const Rx = UI.S.replay; if (!Rx || Rx.i >= Rx.frames.length - 1) { pause(); return; } go(Rx.i + 1); }, STEP_MS);
    paint();
  }
  function toggle() { if (timer) pause(); else play(); }

  // 进入回放：at 是从第几帧开始（默认 0，自动播放）
  function enter(o) {
    o = o || {};
    const S = UI.S;
    if (S.replay) return true;
    if (!S.problem) { UI.App.say('选一道题做几步，就能回放了', 'warn', 2600); return false; }
    const frames = UI.App.frames();
    if (frames.length < 2) { UI.App.say('还没有动手：先做几步，再来看看是怎么做的', 'warn', 2800); return false; }
    UI.Panels.closeDialog();
    S.replay = { real: { scene: S.scene, D: S.D, sel: S.sel, selLink: S.selLink, inspOpen: S.inspOpen }, frames, i: 0, say: {} };
    S.inspOpen = false; UI.Panels.renderInsp();
    bar(); document.body.classList.add('replaying');
    go(o.at === undefined ? 0 : o.at);
    if (o.play !== false) play();
    return true;
  }
  // 退出：换回原来的台面对象（回放中没有任何东西改过它）
  function exit() {
    const S = UI.S, R = S.replay; if (!R) return;
    pause();
    S.replay = null; S.scene = R.real.scene; S.D = R.real.D; S.sel = R.real.sel; S.selLink = R.real.selLink; S.inspOpen = R.real.inspOpen; S.flash = null;
    document.body.classList.remove('replaying');
    UI.Stage.render(); UI.Panels.renderLeft(); UI.Panels.renderInsp(); UI.Panels.renderTop();
  }
  // 换题、载入时：只放下回放（台面马上要换掉，不用换回）
  function drop() {
    if (timer) { clearInterval(timer); timer = 0; }
    const R = UI.S.replay; if (!R) return;
    UI.S.replay = null; UI.S.scene = R.real.scene; UI.S.D = R.real.D;
    document.body.classList.remove('replaying');
  }

  // ---------- 来历对话框 ----------
  function whyDialog(id, port) {
    const S = UI.S, frames = S.replay ? S.replay.frames.slice(0, S.replay.i + 1) : UI.App.frames();
    const r = U.Process.why(S.scene, S.D, id, port, frames); if (!r) return;
    const sec = (t, a) => (a.length ? '<div class="bwhy-sec"><b>' + esc(t) + '</b><ul>' + a.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div>' : '');
    const can = !S.replay && frames.length > 1;
    UI.Panels.dialog('<h3>这个数是怎么来的</h3><p class="bwhy-head">' + esc(r.head) + '</p>' + sec('怎么算的', r.calc) + sec('一起变的样子', r.group) + sec('一步一步变过来的', r.hist) +
      (!r.calc.length && !r.group.length && !r.hist.length ? '<p>这台还说不出它是怎么算的。</p>' : '') +
      '<div class="btnrow">' + (can ? '<button class="btn" id="dlg-replay">🎬 一步一步看</button>' : '') + '<button class="btn pri" id="dlg-close">知道了</button></div>');
  }

  function bind() {
    // 步骤栏：回放入口、“怎么来的？”
    $('#leftbody').addEventListener('click', (e) => {
      const t = e.target;
      if (t.closest('#replaybtn')) { if (UI.S.replay) exit(); else enter(); return; }
      const w = t.closest('[data-bwhy]'); if (w) { const k = w.dataset.bwhy, j = k.lastIndexOf('|'); whyDialog(k.slice(0, j), k.slice(j + 1)); }
    });
    // 做完的对话框、来历对话框里的“看看我是怎么做的”
    $('#dlg').addEventListener('click', (e) => { if (e.target.closest('#dlg-replay')) { UI.Panels.closeDialog(); enter(); } });
    // 回放中的键盘：空格播放 / 暂停、← → 上一步 / 下一步、Esc 退出；其他改台面的键（删除、撤销、空格开时钟）不往下传
    document.addEventListener('keydown', (e) => {
      if (!UI.S.replay || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      const k = e.key;
      if (k === 'Escape') exit(); else if (k === ' ') toggle(); else if (k === 'ArrowLeft') { pause(); go(UI.S.replay.i - 1); } else if (k === 'ArrowRight') { pause(); go(UI.S.replay.i + 1); }
      else if (!(k === 'Delete' || k === 'Backspace' || e.ctrlKey || e.metaKey)) return;
      e.preventDefault(); e.stopImmediatePropagation();
    }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();

  UI.Replay = { enter, exit, drop, go, play, pause, active: () => !!UI.S.replay, whyDialog };
})(window);
