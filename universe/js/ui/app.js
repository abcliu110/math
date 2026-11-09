/* 应用：状态、唯一改动入口 act（包一层：撤销、判分、事件）、世界时钟循环、各种按钮。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), W = U.World, J = U.Judge, Ev = U.Events;
  const $ = (s) => document.querySelector(s);
  const FREE_KEY = 'universe-free-v1', NOTE_KEY = 'universe-notes-v1';
  const lsGet = (k) => { try { return G.localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { G.localStorage.setItem(k, v); } catch (e) { /* 存不下就算了 */ } };

  const S = (UI.S = {
    scene: W.blank(), D: null, sel: null, selLink: null, view: { x: 0, y: 0, z: 1 }, mode: 'free', problem: null, run: null,
    undo: [], redo: [], tab: 'lab', inspOpen: false, glow: [], showSig: true, q1: '', freeScene: null,
  });

  // ---------- 提示条 ----------
  let bannerTimer = 0;
  function say(text, kind, ms) {
    const b = $('#banner'); if (!text) { b.style.display = 'none'; return; }
    b.textContent = text; b.className = kind || ''; b.style.display = 'block'; b.style.opacity = 1;
    clearTimeout(bannerTimer); if (ms !== 0) bannerTimer = setTimeout(() => { b.style.opacity = 0; setTimeout(() => { if (b.style.opacity === '0') b.style.display = 'none'; }, 300); }, ms || 3000);
  }

  // ---------- 刷新 ----------
  function refresh(full) {
    S.D = W.evaluate(S.scene);
    judgeNow();
    UI.Stage.render(); UI.Panels.renderClock();
    if (full !== false) { UI.Panels.renderTop(); UI.Panels.renderLeft(); UI.Panels.renderInsp(); }
  }

  function glowOf() {
    if (!S.problem || S.mode !== 'practice') return [];
    const m = S.problem.milestones.find((x) => !S.run.ms[x.id].done);
    return (m && m.glow) || [];
  }

  function judgeNow() {
    if (!S.problem || !S.run) return;
    const p = S.problem, run = S.run;
    const res = J.check(p, run, S.scene, S.D);
    if (S.mode === 'practice') {
      res.newly.forEach((m) => { Ev.push('milestone', { id: m.id, score: m.score, op: run.ops }); say('✓ ' + m.say + '　+' + m.score + ' 分', 'good', 2600); });
      res.traps.forEach((t) => { Ev.push('trap', { id: t.id }); say('⚠ ' + t.wrong, 'warn', 6000); });
      const g = glowOf();
      if (g.join() !== S.glow.join()) { S.glow = g; UI.Panels.renderShelf(); }
      if (res.newly.length) UI.Panels.renderLeft();
      if (run.finished && !run.reported) { run.reported = true; finish(); }
    } else if (res.newly.length || res.traps.length) { /* 考试：只记，不提示 */ res.traps.forEach((t) => Ev.push('trap', { id: t.id })); }
  }

  function finish() {
    const rep = J.report(S.problem, S.run, S.scene, S.D);
    Ev.push('finish', rep); S.scene.clock.running = false;
    setTimeout(() => { UI.Panels.dialog(UI.Panels.reportHtml(rep, S.problem, 'practice')); UI.Panels.renderLeft(); }, 700);
  }

  // ---------- 改动入口 ----------
  const snap = () => JSON.stringify(S.scene);
  function pushUndo(s) { S.undo.push(s || snap()); if (S.undo.length > 120) S.undo.shift(); S.redo = []; }

  function act(a, o) {
    o = o || {};
    const before = snap();
    const r = W.act(S.scene, a);
    if (!r.ok) { say(r.why, 'bad', 3800); if (S.run) S.run.errors++; UI.Stage.render(); return r; }
    pushUndo(before);
    if (o.select && r.id) { S.sel = r.id; S.selLink = null; }
    if (a.t === 'del' && S.sel === a.id) S.sel = null;
    if (S.run) { S.run.ops++; S.run.armed = true; }
    if (a.t === 'link' && r.replaced) say('这个口只能接一根线，旧的线换掉了', 'warn', 2200);
    saveFree(); refresh();
    return r;
  }
  function snapshot() { pushUndo(); }
  // 1.10：删容器时若里面有东西，先问：连里面的一起删，还是倒到台面上
  let pendingDel = null;
  function removeEntity(id) {
    const kids = U.World.childrenOf(S.scene, id);
    if (!kids.length) return act({ t: 'del', id });
    pendingDel = id;
    UI.Panels.dialog('<h3>删除「' + U.kit.esc(S.scene.entities[id].name) + '」</h3><p>里面有 ' + kids.length + ' 个东西。</p>' +
      '<div class="btnrow"><button class="btn" id="dlg-delout">只删容器，东西倒到台面上</button><button class="btn pri" id="dlg-delall">连里面的一起删</button><button class="btn" id="dlg-close">算了</button></div>');
  }
  function afterMove() { saveFree(); UI.Panels.renderTop(); }

  function restore(str) { S.scene = W.load(str); S.sel = null; S.selLink = null; refresh(); }
  function undo() { if (!S.undo.length) return; S.redo.push(snap()); restore(S.undo.pop()); saveFree(); }
  function redo() { if (!S.redo.length) return; S.undo.push(snap()); restore(S.redo.pop()); saveFree(); }

  function saveFree() { if (S.mode === 'free') lsSet(FREE_KEY, W.save(S.scene)); }

  // ---------- 开题 / 切模式 ----------
  function openProblem(id, mode) {
    const p = U.problemById(id); if (!p) return;
    UI.Panels.closeDialog();
    if (S.mode === 'free') S.freeScene = snap();
    S.problem = p; S.mode = mode || 'practice'; S.scene = p.build(); S.run = J.start(p, S.mode);
    S.undo = []; S.redo = []; S.sel = null; S.selLink = null; S.inspOpen = false; S.tab = 'steps'; S.glow = [];
    if (!p.predict) S.run.pred_done = true;
    Ev.ctx = { pid: p.id, mode: S.mode }; Ev.push('start', {});
    S.D = W.evaluate(S.scene); UI.Stage.fit(); S.glow = glowOf();
    refresh(); UI.Panels.renderShelf();
    say(S.mode === 'exam' ? '考试：没有提示，搭好后点「交卷」' : '练习：跟着左边的步骤做，下一步要的器材会发光', '', 4200);
  }
  function openFree() {
    S.mode = 'free'; S.problem = null; S.run = null; Ev.ctx = {};
    let sc = null; try { sc = S.freeScene ? JSON.parse(S.freeScene) : JSON.parse(lsGet(FREE_KEY)); } catch (e) { sc = null; }
    try { S.scene = sc ? W.load(sc) : W.blank(); } catch (e) { S.scene = W.blank(); }
    S.undo = []; S.redo = []; S.sel = null; S.selLink = null; S.glow = []; S.tab = 'lab';
    S.D = W.evaluate(S.scene); UI.Stage.fit(); refresh(); UI.Panels.renderShelf();
    say('自由探究：从右边拖器材到台面，拖蓝点连线，点 ▶ 让世界动起来', '', 4200);
  }
  function setMode(m) {
    if (m === 'free') return openFree();
    if (!S.problem) { S.tab = 'lab'; UI.Panels.renderLeft(); UI.Panels.renderTop(); say('先在左边「实验库」选一道题', 'warn', 3000); return; }
    if (S.mode === m) return;
    openProblem(S.problem.id, m);
  }

  // ---------- 时钟 ----------
  function clockAct(a) { W.act(S.scene, a); refresh(false); }
  let last = 0, acc = 0;
  function frame(ts) {
    const ck = S.scene.clock;
    if (!last) last = ts; const dt = Math.min(0.25, (ts - last) / 1000); last = ts;
    if (ck.running) {
      acc += dt * ck.rate * ck.hz; const n = Math.min(Math.floor(acc), 60); acc -= Math.floor(acc);
      for (let i = 0; i < n; i++) { S.D = W.tick(S.scene); judgeNow(); }
      if (n) { UI.Stage.render(); UI.Panels.renderClock(); }
    }
    G.requestAnimationFrame(frame);
  }
  function stepOnce() { S.D = W.tick(S.scene); judgeNow(); UI.Stage.render(); UI.Panels.renderClock(); }

  // ---------- 文件 ----------
  function download(name, text) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }
  function loadFile() {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = () => { const f = inp.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { pushUndo(); S.scene = W.load(r.result); S.sel = null; refresh(); UI.Stage.fit(); UI.Stage.render(); say('台面已载入', 'good'); } catch (e) { say('这个文件不是数学小宇宙的台面：' + e.message, 'bad', 4000); } }; r.readAsText(f); };
    inp.click();
  }

  // ---------- 事件绑定 ----------
  function bind() {
    $('#modes').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setMode(b.dataset.mode); });
    $('#undo').onclick = undo; $('#redo').onclick = redo;
    $('#tidy').onclick = () => act({ t: 'tidy' }); $('#clear').onclick = () => { if (Object.keys(S.scene.entities).length) act({ t: 'clear' }); };
    $('#burger').onclick = () => $('#left').classList.toggle('open');
    $('#shelfbtn').onclick = () => $('#right').classList.toggle('open');
    $('#menubtn').onclick = (e) => { e.stopPropagation(); $('#menu').classList.toggle('open'); };
    document.addEventListener('click', () => $('#menu').classList.remove('open'));
    $('#menu').addEventListener('click', (e) => {
      const m = e.target.closest('button'); if (!m) return;
      if (m.dataset.m === 'save') download('台面-' + new Date().toISOString().slice(0, 10) + '.json', W.save(S.scene));
      if (m.dataset.m === 'load') loadFile();
      if (m.dataset.m === 'author') UI.Panels.authorDialog();
      if (m.dataset.m === 'myexport') download('我的题.json', U.Author.exportJson());
      if (m.dataset.m === 'myimport') { const i = document.createElement('input'); i.type = 'file'; i.accept = '.json'; i.onchange = () => { const r = new FileReader(); r.onload = () => { try { const n = U.Author.importJson(r.result); UI.Panels.renderLeft(); say('导入了 ' + n + ' 道题，在「实验库 → 我的题」里', 'good'); } catch (e) { say('导入失败：' + e.message, 'bad', 4000); } }; r.readAsText(i.files[0]); }; i.click(); }
      if (m.dataset.m === 'report') UI.Panels.reportDialog();
      if (m.dataset.m === 'wrong') UI.Panels.wrongDialog();
      if (m.dataset.m === 'parent') UI.Panels.parentDialog();
      if (m.dataset.m === 'improve') UI.Panels.improveDialog();
      if (m.dataset.m === 'health') UI.Panels.healthDialog();
      if (m.dataset.m === 'export') download('学习记录.json', JSON.stringify(Ev.log, null, 1));
      if (m.dataset.m === 'clearlog') { Ev.clear(); UI.Panels.renderLeft(); say('学习记录已清除', '', 2000); }
    });
    $('#zin').onclick = () => UI.Stage.zoomAt(1.2); $('#zout').onclick = () => UI.Stage.zoomAt(1 / 1.2);
    $('#zfit').onclick = () => { UI.Stage.fit(); UI.Stage.render(); };
    // 时钟
    $('#go').onclick = () => clockAct({ t: 'clock', running: !S.scene.clock.running });
    $('#step1').onclick = () => { if (S.scene.clock.running) clockAct({ t: 'clock', running: false }); stepOnce(); };
    $('#rew').onclick = () => clockAct({ t: 'clock', rewind: true });
    document.querySelector('#clockbar .rate').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) clockAct({ t: 'clock', rate: +b.dataset.rate }); });
    // 左栏
    $('#ltabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { S.tab = b.dataset.tab; UI.Panels.renderLeft(); } });
    const lb = $('#leftbody');
    lb.addEventListener('click', (e) => {
      const t = e.target;
      const dl = t.closest('[data-del]');
      if (dl) { if (S.problem && S.problem.id === dl.dataset.del) openFree(); U.Author.remove(dl.dataset.del); UI.Panels.renderLeft(); return; }
      const it = t.closest('.it');
      if (it) { if (it.dataset.free) openFree(); else openProblem(it.dataset.pid, 'practice'); $('#left').classList.remove('open'); return; }
      const pr = t.closest('[data-pred]');
      if (pr && S.run) {
        const v = pr.dataset.pred; S.run.pred_done = true;
        if (v !== 'skip') { S.run.pred = S.problem.predict.options[+v].v; Ev.push('predict', { v: S.run.pred }); }
        UI.Panels.renderLeft(); return;
      }
      if (t.closest('#hintbtn') && S.run) { const h = J.nextHint(S.problem, S.run); if (h) { Ev.push('hint', { id: h.m.id, level: h.level }); say('提示 ' + h.level + '/3：' + h.text, '', 7000); UI.Panels.renderLeft(); } else say('已经全部完成啦', 'good'); return; }
      if (t.closest('#restart') && S.problem) openProblem(S.problem.id, S.mode);
    });
    lb.addEventListener('input', (e) => { if (e.target.id === 'q1') { S.q1 = e.target.value; UI.Panels.renderLeft(); const q = $('#q1'); q.focus(); q.setSelectionRange(q.value.length, q.value.length); } });
    $('#q2').addEventListener('input', () => UI.Panels.renderShelf());
    // 属性面板
    const insp = $('#insp');
    insp.addEventListener('change', (e) => {
      const t = e.target, id = S.sel; if (!id) return;
      if (t.id === 'nm') { act({ t: 'rename', id, name: t.value }); return; }
      const k = t.dataset.k || t.dataset.fact; if (!k) return;
      let v = t.type === 'checkbox' ? t.checked : t.dataset.fact !== undefined ? t.value : t.tagName === 'SELECT' ? +t.value : t.value;
      if (t.type === 'number' && v === '') { UI.Panels.renderInsp(); return; }
      const r = act({ t: 'set', id, k, v }); if (!r.ok) UI.Panels.renderInsp();
    });
    insp.addEventListener('click', (e) => {
      const t = e.target, id = S.sel;
      if (t.dataset.close) { S.inspOpen = false; UI.Panels.renderInsp(); UI.Stage.render(); }
      else if (t.dataset.seg !== undefined) act({ t: 'set', id, k: t.dataset.k, v: +t.dataset.seg });
      else if (t.dataset.unlink) act({ t: 'unlink', id: t.dataset.unlink });
      else if (t.dataset.reset) act({ t: 'reset', id });
      else if (t.dataset.step) { const inp = insp.querySelector('input[type="number"][data-k="' + t.dataset.k + '"]'); const P = U.types[S.scene.entities[id].type].props[t.dataset.k]; act({ t: 'set', id, k: t.dataset.k, v: Math.round((+inp.value + (+t.dataset.step) * (P.step || 1)) * 1e6) / 1e6 }); }
    });
    // 为什么 / 我的发现 / 交卷
    $('#why').onclick = () => {
      if (!S.problem) UI.Panels.dialog('<h3>为什么？</h3><p>选一道题之后，这里会讲“背后的道理”。自由探究里没有标准答案——你搭出来的就是你的发现。</p><div class="btnrow"><button class="btn" id="dlg-close">知道了</button></div>');
      else UI.Panels.dialog('<h3>为什么？</h3><div class="whybox">' + U.kit.esc(S.problem.why) + '</div><div class="btnrow"><button class="btn" id="dlg-close">知道了</button></div>');
    };
    $('#found').onclick = () => {
      const fin = Ev.where((e) => e.type === 'finish' || e.type === 'submit'), seen = {};
      fin.forEach((e) => { const p = U.problemById(e.pid); if (p) seen[p.id] = (seen[p.id] || 0) + 1; });
      const list = Object.keys(seen).map((id) => '<div class="it" style="cursor:default"><span class="tt">' + U.kit.esc(U.problemById(id).title) + '</span><span class="chip ok">' + seen[id] + ' 次</span></div>').join('') || '<div class="empty">还没有做完的题。</div>';
      UI.Panels.dialog('<h3>我的发现</h3><div class="plist">' + list + '</div><p style="color:var(--txt3);margin-bottom:4px">我的笔记（只存在这台设备上）</p><textarea id="notes">' + U.kit.esc(lsGet(NOTE_KEY) || '') + '</textarea><div class="btnrow"><button class="btn pri" id="dlg-note">保存</button><button class="btn" id="dlg-close">关闭</button></div>');
    };
    $('#submit').onclick = () => {
      if (!S.run || S.run.submitted) return;
      S.run.submitted = true; S.run.finished = true;
      const rep = J.report(S.problem, S.run, S.scene, S.D); Ev.push('submit', rep);
      UI.Panels.dialog(UI.Panels.reportHtml(rep, S.problem, 'exam')); UI.Panels.renderTop();
    };
    $('#dlg').addEventListener('change', (e) => { const t = e.target; if (t.dataset && t.dataset.reason && t.value) Ev.push('reason', { id: t.dataset.reason, label: t.value }); });
    $('#dlg').addEventListener('click', (e) => {
      const t = e.target;
      if (t.id === 'au-ok') {
        const givens = $('#au-givens').value.split(/[,，\s]+/).filter(Boolean).map((x) => { try { const q = U.Q.parse(x); return { n: q.n, d: q.d }; } catch (e) { return null; } });
        const msg = $('#au-msg'); const show = (w) => { msg.textContent = w; msg.style.display = 'block'; };
        if (givens.some((g) => !g)) return show('「给的数」里有写不对的：只能是整数、小数或 3/4 这样的分数');
        const spec = { title: $('#au-title').value, hook: $('#au-hook').value, target: $('#au-target').value, givens };
        const v = U.Author.validate(spec); if (!v.ok) return show(v.why);
        const p = U.Author.add(spec); Ev.ctx = {}; Ev.push('author', { pid: p.id });
        UI.Panels.closeDialog(); S.q1 = ''; UI.Panels.renderLeft(); say('已发布：' + p.title + '（可以在「实验库 → 我的题」里做，也能导出给同学）', 'good', 4500); return;
      }
      const di = t.closest('.it[data-pid]');
      if (di) { UI.Panels.closeDialog(); openProblem(di.dataset.pid, 'practice'); return; }
      if (t.id === 'dlg-inquiry' && S.problem) {
        const r = U.Inquiry.report(U.Events.log, S.problem.id, U.problems);
        UI.Panels.dialog(UI.Panels.inquiryHtml(r, S.problem));
        return;
      }
      if (t.id === 'hp-go') { UI.Panels.healthOut((document.getElementById('hp-point') || {}).value || ''); return; }
      if (t.id === 'dlg-delout' || t.id === 'dlg-delall') {
        const id = pendingDel; pendingDel = null; UI.Panels.closeDialog();
        if (id && S.scene.entities[id]) { S.sel = null; act({ t: 'del', id, keep: t.id === 'dlg-delall' ? 'all' : 'out' }); }
        return;
      }
      if (t.id === 'dlg' || t.id === 'dlg-close') { pendingDel = null; UI.Panels.closeDialog(); }
      else if (t.id === 'dlg-back') { const miss = (S.run && S.problem) ? S.problem.milestones.find((m) => S.run.ms[m.id] && !S.run.ms[m.id].done) : null; UI.Panels.closeDialog(); if (miss) say('回到这一步：' + miss.say, 'info', 5000); }
      else if (t.id === 'dlg-again') { UI.Panels.closeDialog(); openProblem(S.problem.id, S.mode); }
      else if (t.id === 'dlg-next') { UI.Panels.closeDialog(); const i = U.problems.findIndex((p) => p.id === S.problem.id); openProblem(U.problems[(i + 1) % U.problems.length].id, 'practice'); }
      else if (t.id === 'dlg-note') { lsSet(NOTE_KEY, $('#notes').value); UI.Panels.closeDialog(); say('笔记已保存', 'good', 1800); }
    });
    // 键盘
    document.addEventListener('keydown', (e) => {
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); redo(); }
      else if (e.key === 'Delete' || e.key === 'Backspace') { if (S.selLink) { const id = S.selLink; S.selLink = null; act({ t: 'unlink', id }); } else if (S.sel) removeEntity(S.sel); }
      else if (e.key === ' ') { e.preventDefault(); clockAct({ t: 'clock', running: !S.scene.clock.running }); }
      else if (e.key === 'Escape') { S.sel = null; S.selLink = null; UI.Panels.renderInsp(); UI.Stage.render(); }
    });
    G.addEventListener('resize', () => { const nar = G.innerWidth <= 640; $('#shelfbtn').style.display = nar ? '' : 'none'; });
    $('#shelfbtn').style.display = G.innerWidth <= 640 ? '' : 'none';
  }

  function start() {
    Ev.load(); U.Author.loadAll(); UI.Stage.init(); UI.Panels.initShelfDrag(); bind(); UI.Panels.renderShelf();
    openFree(); G.requestAnimationFrame(frame);
  }
  UI.App = { act, snapshot, afterMove, removeEntity, openProblem, openFree, setMode, say, undo, redo, stepOnce, refresh };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})(window);
