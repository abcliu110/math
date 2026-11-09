/* 应用：状态、唯一改动入口 act（包一层：撤销、判分、事件）、世界时钟循环、各种按钮。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), W = U.World, J = U.Judge, Ev = U.Events, L = UI.LAYOUT;
  const $ = (s) => document.querySelector(s);
  const FREE_KEY = 'universe-free-v1', NOTE_KEY = 'universe-notes-v1', SESS_KEY = 'universe-session-v1';
  const lsGet = (k) => { try { return G.localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { G.localStorage.setItem(k, v); } catch (e) { /* 存不下就算了 */ } };

  const S = (UI.S = {
    scene: W.blank(), D: null, sel: null, selLink: null, view: { x: 0, y: 0, z: 1 }, mode: 'free', problem: null, run: null,
    undo: [], redo: [], tab: 'lab', inspOpen: false, glow: [], showSig: true, q1: '', freeScene: null,
    // 几何工作区（§10.5）：选中的对象（稳定名字）、移动工具的参数、面板消息
    // 工作区的坐标范围、图层开关、专注都是视图状态，放在工作区实体的 ui 字段里（见 js/ui/state.js）
    wsSel: [], wsArgs: { dx: '0', dy: '0' }, wsMsg: '',
    // 工作区里两下画线的状态（§10.5.8 B11）：{ ws, tool:'seg'|'cut', pend, cur }
    wsDraw: null,
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

  // ---------- 断点续做（U.Session）----------
  // 未做完的题存进 localStorage；刷新或关页后，开页时问「接着做 / 重新开始」
  const unfinished = () => !!(S.session && S.run && !S.run.reported && !S.run.submitted);
  function saveSession() {
    if (!unfinished()) return;
    S.session.pred = { done: !!S.run.pred_done, v: S.run.pred };
    lsSet(SESS_KEY, U.JSON.stringify(S.session));
  }
  function clearSession() { S.session = null; lsSet(SESS_KEY, ''); }
  function loadSession() {
    try { const o = U.JSON.parse(lsGet(SESS_KEY) || 'null'); return o && o.pid && o.startScene && U.problemById(o.pid) ? o : null; } catch (e) { return null; }
  }
  // 改动了整张台面（撤销、重做、载入文件）：之后的重放从这个台面开始
  function rebaseSession() { if (S.session) { S.session.startScene = U.JSON.parse(full()); S.session.acts = []; } }
  function recordSession(a, n) { if (S.session) for (let i = 0; i < (n || 1); i++) U.Session.record(S.session, a); }
  function offerResume() {
    const sv = loadSession(); if (!sv) return;
    const p = U.problemById(sv.pid);
    UI.Panels.dialog('<h3>接着做？</h3><p>上次「' + U.kit.esc(p.title) + '」（' + (sv.mode === 'exam' ? '考试' : '练习') + '）还没做完。</p>' +
      '<div class="btnrow"><button class="btn pri" id="dlg-resume">接着做</button><button class="btn" id="dlg-fresh">重新开始</button></div>');
  }
  function resumeSession() {
    const sv = loadSession(); if (!sv) return;
    const p = U.problemById(sv.pid), run = J.start(p, sv.mode);
    if (!p.predict) run.pred_done = true;
    if (sv.pred && sv.pred.done) { run.pred_done = true; if (sv.pred.v !== undefined) run.pred = sv.pred.v; }
    let sc;
    try { sc = U.Session.replay(sv, (cur) => { J.check(p, run, cur, W.evaluate(cur)); }); } catch (e) { clearSession(); say('上次的台面读不出来，已重新开始', 'warn', 3000); return; }
    if (S.mode === 'free') S.freeScene = full();
    const r = U.Session.resume(sv);
    S.problem = p; S.mode = sv.mode; S.run = run; S.session = sv; S.scene = sc;
    S.undo = []; S.redo = []; S.sel = null; S.selLink = null; S.inspOpen = false; S.tab = 'steps'; S.glow = [];
    Ev.ctx = { pid: p.id, mode: S.mode }; Ev.push('resume', r.event.data);
    S.D = W.evaluate(S.scene); UI.Stage.fit(); S.glow = glowOf();
    refresh(); UI.Panels.renderShelf();
    say('接着做「' + p.title + '」', 'good', 3000);
  }

  function finish() {
    const rep = J.report(S.problem, S.run, S.scene, S.D);
    Ev.push('finish', rep); S.scene.clock.running = false; clearSession();
    setTimeout(() => { UI.Panels.dialog(UI.Panels.reportHtml(rep, S.problem, 'practice')); UI.Panels.renderLeft(); }, 700);
  }

  // ---------- 改动入口 ----------
  // 撤销快照不带视图（实体的 ui）：撤销、重做、失败回滚都不把视图回退（U4，见 js/ui/state.js）
  const snap = () => U.JSON.stringify(UI.State.stripView(S.scene));
  // 完整的台面（带视图）：自由台面存档、断点续做的起点用它，切换模式回来、刷新后视图还在
  const full = () => U.JSON.stringify(S.scene);
  // 载入撤销快照：台面换成快照的，视图保留现在的（同一个实体 id）
  function loadKeepView(str) {
    const sc = W.load(str), cur = (S.scene && S.scene.entities) || {};
    for (const id of Object.keys(sc.entities)) { const e = cur[id]; if (e && e.ui) sc.entities[id].ui = e.ui; }
    return sc;
  }
  // 视图改了（缩放、平移、图层、专注）：不进撤销，但要存档；界面每次渲染时调用
  function persistView() { if (UI.State.flush()) saveFree(); }
  function pushUndo(s) { S.undo.push(s || snap()); if (S.undo.length > 120) S.undo.shift(); S.redo = []; }

  // ---------- 事务（U2）----------
  // tx(label, fn, o)：fn(A) 里用 A(动作) 依次执行；任何一步不成立，整个回滚到开头（或 o.from，拖动用），并就地提示原因。
  // 成功：一个撤销项、一条事件（带 label）、一次存档、一次渲染。
  // o.from：拖动时先把台面退回拖动开始前的样子（拖动中的预览不进撤销），再整体提交。
  // o.after(r)：成功后、渲染之前调用（用来设置选中项）。返回：成功时最后一个动作的结果；失败时 { ok:false, why }。
  function tx(label, fn, o) {
    o = o || {};
    const before = o.from !== undefined ? o.from : snap(), rec = [];
    let last = { ok: true };
    const A = (a) => { const r = W.act(S.scene, a); if (!r.ok) throw { why: r.why }; rec.push(a); last = r; return r; };
    if (o.from !== undefined) S.scene = loadKeepView(before);
    try { fn(A); } catch (x) {
      S.scene = loadKeepView(before);
      const why = (x && x.why) || '这一步做不了';
      if (S.sel && !S.scene.entities[S.sel]) S.sel = null;
      say(why, 'bad', 3800); if (S.run) S.run.errors++;
      refresh();
      return { ok: false, why };
    }
    if (!rec.length) { refresh(); return last; }
    pushUndo(before);
    for (const a of rec) recordSession(a);
    Ev.push('edit', { label: label || '', n: rec.length });
    if (S.run) { S.run.ops += rec.length; S.run.armed = true; }
    if (o.after) o.after(last);
    saveFree(); refresh();
    return last;
  }
  // 单个动作：老接口，失败时返回 { ok:false, why }（调用方照旧看 r.ok）
  function act(a, o) {
    o = o || {};
    return tx(a.t, (A) => A(a), {
      after: (r) => {
        if (o.select && r.id) { S.sel = r.id; S.selLink = null; }
        if (a.t === 'del' && S.sel === a.id) S.sel = null;
        if (a.t === 'link' && r.replaced) say('这个口只能接一根线，旧的线换掉了', 'warn', 2200);
      },
    });
  }
  // 一串动作记成一步（撤销一次全部撤掉）；有一条不成立，整串都不做（块的拖出、旋转、翻转用）
  function actMany(list, label) {
    return tx(label || (list[0] && list[0].t) || '', (A) => { for (const a of list) A(a); });
  }
  // 一串动作，其中有的要用前一个动作新建的器材的 id（画线：先建两个点，再建线段）。fn(A) 同 tx。
  function build(fn, label) { return tx(label || '', fn); }
  // 拖动预览：只改台面，不进撤销、不记事件、不存档（松手时用 tx 提交）
  function preview(a) { return W.act(S.scene, a); }
  // 拖动开始时的台面（字符串），松手时交给 tx 的 o.from
  function snapshot() { return snap(); }
  // 1.10：删容器时若里面有东西，先问：连里面的一起删，还是倒到台面上（UI.Intent.run('delete') 在里面有东西时调用）
  let pendingDel = null;
  function askDelete(id, n) {
    pendingDel = id;
    UI.Panels.dialog('<h3>删除「' + U.kit.esc(S.scene.entities[id].name) + '」</h3><p>里面有 ' + n + ' 个东西。</p>' +
      '<div class="btnrow"><button class="btn" id="dlg-delout">只删容器，东西倒到台面上</button><button class="btn pri" id="dlg-delall">连里面的一起删</button><button class="btn" id="dlg-close">算了</button></div>');
  }
  // 删除的所有入口都走这里（UI.Intent.run('delete')）；保留这个名字是给旧调用方用的
  function removeEntity(id) { return UI.Intent.run('delete', { id }); }
  function afterMove() { saveFree(); UI.Panels.renderTop(); }

  function restore(str) { S.scene = loadKeepView(str); S.sel = null; S.selLink = null; rebaseSession(); refresh(); }
  function undo() { if (!S.undo.length) return; S.redo.push(snap()); restore(S.undo.pop()); saveFree(); }
  function redo() { if (!S.redo.length) return; S.undo.push(snap()); restore(S.redo.pop()); saveFree(); }

  function saveFree() { if (S.mode === 'free') lsSet(FREE_KEY, W.save(S.scene)); }

  // ---------- 开题 / 切模式 ----------
  function openProblem(id, mode) {
    const p = U.problemById(id); if (!p) return;
    UI.Panels.closeDialog();
    if (S.mode === 'free') S.freeScene = full();
    S.problem = p; S.mode = mode || 'practice'; S.scene = p.build(); S.run = J.start(p, S.mode);
    S.session = U.Session.start(p, S.mode, S.scene);
    S.undo = []; S.redo = []; S.sel = null; S.selLink = null; S.inspOpen = false; S.tab = 'steps'; S.glow = [];
    S.wsSel = []; S.wsMsg = ''; S.wsDraw = null;
    if (!p.predict) S.run.pred_done = true;
    Ev.ctx = { pid: p.id, mode: S.mode }; Ev.push('start', {});
    S.D = W.evaluate(S.scene); UI.Stage.fit(); S.glow = glowOf();
    refresh(); UI.Panels.renderShelf();
    say(S.mode === 'exam' ? '考试：没有提示，搭好后点「交卷」' : '练习：跟着左边的步骤做，下一步要的器材会发光', '', 4200);
  }
  function openFree() {
    S.mode = 'free'; S.problem = null; S.run = null; S.session = null; Ev.ctx = {};
    let sc = null; try { sc = S.freeScene ? U.JSON.parse(S.freeScene) : U.JSON.parse(lsGet(FREE_KEY)); } catch (e) { sc = null; }
    try { S.scene = sc ? W.load(sc) : W.blank(); } catch (e) { S.scene = W.blank(); }
    S.undo = []; S.redo = []; S.sel = null; S.selLink = null; S.glow = []; S.tab = 'lab'; S.wsDraw = null;
    S.D = W.evaluate(S.scene); UI.Stage.fit(); refresh(); UI.Panels.renderShelf();
    say('自由探究：从右边拖器材到台面，拖蓝点连线，点 ▶ 让世界动起来', '', 4200);
  }
  function setMode(m) {
    if (m === 'free') return openFree();
    if (!S.problem) { S.tab = 'lab'; UI.Panels.renderLeft(); UI.Panels.renderTop(); say('先在左边「实验库」选一道题', 'warn', 3000); return; }
    if (S.mode === m) return;
    openProblem(S.problem.id, m);
  }

  // ---------- 式子工作台（任务 H 第 3b 步）：步骤只改工作台的状态（U.ExprBench.states），不改台面 ----------
  function wbEqn(id) { const dd = S.D && S.D[id]; return dd ? U.ExprBench.eqnIn(dd.inp) : null; }
  function wbStep(id, tool) {
    const eq = wbEqn(id), dr = UI.Panels.wbDraft(id);
    if (!eq) return;
    const raw = (dr.ref || '').trim();
    // 移项：序号从 1 数（左边的第几项）；标签照原样交给内核。两边同除/同乘不需要位置，只要数
    let ref = null, args = {};
    if (tool === 'move-term') ref = /^\d+$/.test(raw) ? +raw - 1 : (raw || null);
    else if (tool === 'divide' || tool === 'multiply') args = { by: dr.by };
    else ref = raw || [dr.side];   // 合并、去括号、约分：没写标签就作用在选的那一边上
    const st = U.ExprBench.currentOf(id, eq);
    const ns = U.Workbench.step(st, tool, ref, args);
    if (ns.lastError) dr.msg = ns.lastError;
    else { U.ExprBench.states[id] = { key: U.ExprBench.keyOf(eq), state: ns }; dr.msg = ''; dr.ref = ''; }
    refresh();
  }
  function wbUndo(id, k) {
    const eq = wbEqn(id); if (!eq) return;
    const st = U.ExprBench.currentOf(id, eq);
    U.ExprBench.states[id] = { key: U.ExprBench.keyOf(eq), state: U.Workbench.undo(st, k) };
    UI.Panels.wbDraft(id).msg = '';
    refresh();
  }

  // ---------- 时钟 ----------
  function clockAct(a) { W.act(S.scene, a); recordSession(a); refresh(false); }   // 时钟不是编辑：不进撤销（经 UI.Intent.clock 调用）
  let last = 0, acc = 0;
  function frame(ts) {
    const ck = S.scene.clock;
    if (!last) last = ts; const dt = Math.min(0.25, (ts - last) / 1000); last = ts;
    if (ck.running) {
      acc += dt * ck.rate * ck.hz; const n = Math.min(Math.floor(acc), 60); acc -= Math.floor(acc);
      for (let i = 0; i < n; i++) { S.D = W.tick(S.scene); judgeNow(); }
      if (n) { recordSession({ tick: true }, n); UI.Stage.render(); UI.Panels.renderClock(); }
    }
    G.requestAnimationFrame(frame);
  }
  function stepOnce() { S.D = W.tick(S.scene); judgeNow(); recordSession({ tick: true }); UI.Stage.render(); UI.Panels.renderClock(); }

  // ---------- 文件 ----------
  function download(name, text) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }
  function loadFile() {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = () => { const f = inp.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { pushUndo(); S.scene = W.load(r.result); S.sel = null; rebaseSession(); refresh(); UI.Stage.fit(); UI.Stage.render(); say('台面已载入', 'good'); } catch (e) { say('这个文件不是数学小宇宙的台面：' + e.message, 'bad', 4000); } }; r.readAsText(f); };
    inp.click();
  }

  // ---------- 事件绑定 ----------
  function bind() {
    $('#modes').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setMode(b.dataset.mode); });
    $('#undo').onclick = undo; $('#redo').onclick = redo;
    $('#tidy').onclick = () => UI.Intent.run('tidy'); $('#clear').onclick = () => { if (Object.keys(S.scene.entities).length) UI.Intent.run('clear'); };
    $('#burger').onclick = () => $('#left').classList.toggle('open');
    $('#shelfbtn').onclick = () => $('#right').classList.toggle('open');
    $('#menubtn').onclick = (e) => { e.stopPropagation(); $('#menu').classList.toggle('open'); };
    document.addEventListener('click', () => $('#menu').classList.remove('open'));
    $('#menu').addEventListener('click', (e) => {
      const m = e.target.closest('button'); if (!m) return;
      if (m.dataset.m === 'save') download('台面-' + new Date().toISOString().slice(0, 10) + '.json', W.save(S.scene));
      if (m.dataset.m === 'load') loadFile();
      if (m.dataset.m === 'share') UI.Panels.shareDialog();
      if (m.dataset.m === 'student') UI.Panels.studentDialog();
      if (m.dataset.m === 'board') UI.Panels.boardDialog();
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
    $('#go').onclick = () => UI.Intent.clock({ running: !S.scene.clock.running });
    $('#step1').onclick = () => { if (S.scene.clock.running) UI.Intent.clock({ running: false }); stepOnce(); };
    $('#rew').onclick = () => UI.Intent.clock({ rewind: true });
    document.querySelector('#clockbar .rate').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) UI.Intent.clock({ rate: +b.dataset.rate }); });
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
        const v = pr.dataset.pred, pd = S.problem.predict || {}, form = pd.form || 'pick';
        const commit = (val) => { S.run.pred_done = true; S.run.pred = val; Ev.push('predict', { v: val }); };
        if (v === 'skip') S.run.pred_done = true;
        else if (v === 'submit') {
          const inp = $('#predin'), s = inp ? inp.value.trim() : '';
          if (!s) return;
          if (form === 'number') { try { U.Q.parse(s); } catch (e) { say('请写成整数、小数或分数，比如 12、0.5、3/4', 'warn', 3000); return; } }
          commit(s);
        }
        else if (form === 'place') commit(+pr.dataset.slot);
        else if (form === 'more-less') commit(pr.dataset.cmp);
        else commit(pd.options[+v].v);
        UI.Panels.renderLeft(); return;
      }
      if (t.closest('#hintbtn') && S.run) { const h = J.nextHint(S.problem, S.run); if (h) { Ev.push('hint', { id: h.m.id, level: h.level }); say('提示 ' + h.level + '/3：' + h.text, '', 7000); UI.Panels.renderLeft(); } else say('已经全部完成啦', 'good'); return; }
      if (t.closest('#restart') && S.problem) openProblem(S.problem.id, S.mode);
    });
    lb.addEventListener('keydown', (e) => { if (e.target.id === 'predin' && e.key === 'Enter') { const b = lb.querySelector('[data-pred="submit"]'); if (b) b.click(); } });
    lb.addEventListener('input', (e) => { if (e.target.id === 'q1') { S.q1 = e.target.value; UI.Panels.renderLeft(); const q = $('#q1'); q.focus(); q.setSelectionRange(q.value.length, q.value.length); } });
    $('#q2').addEventListener('input', () => UI.Panels.renderShelf());
    // 属性面板
    const insp = $('#insp');
    // 式子工作台的输入框：只记草稿，不重画（免得输入框失去焦点）
    insp.addEventListener('input', (e) => { if (e.target.dataset.wbField && S.sel) UI.Panels.wbDraft(S.sel)[e.target.dataset.wbField] = e.target.value; });
    insp.addEventListener('change', (e) => {
      const t = e.target, id = S.sel; if (!id) return;
      if (t.dataset.wbField) { UI.Panels.wbDraft(id)[t.dataset.wbField] = t.value; return; }
      if (t.id === 'nm') {
        // 块：名字同时写到器材名和「名字」属性上（台面卡片的标题和工作区的标签各用一个），一步改完
        const en = S.scene.entities[id];
        if (U.roleOf(en) === 'piece') { const n = t.value.trim().slice(0, 12); if (!n) { UI.Panels.renderInsp(); return; } UI.Intent.run('rename', { id, name: n, alsoProp: 'name' }); return; }
        UI.Intent.run('rename', { id, name: t.value }); return;
      }
      if (t.dataset.gridK !== undefined) {
        // 表格式编辑：把所有格子按行收回文字，整体写回属性
        const gk = t.dataset.gridK, rows = [];
        insp.querySelectorAll('input[data-grid-k="' + gk + '"]').forEach((c) => { const r = +c.dataset.r; (rows[r] = rows[r] || [])[+c.dataset.c] = c.value; });
        const r = UI.Intent.run('set', { id, k: gk, v: U.Table.gridText(rows.filter(Boolean)) }); if (!r.ok) UI.Panels.renderInsp();
        return;
      }
      const k = t.dataset.k || t.dataset.fact; if (!k) return;
      let v = t.type === 'checkbox' ? t.checked : t.dataset.fact !== undefined ? t.value : t.tagName === 'SELECT' ? +t.value : t.value;
      if (t.type === 'number' && v === '') { UI.Panels.renderInsp(); return; }
      const r = UI.Intent.run('set', { id, k, v }); if (!r.ok) UI.Panels.renderInsp();
    });
    insp.addEventListener('click', (e) => {
      const t = e.target, id = S.sel;
      const wb = t.closest && t.closest('[data-wb-tool],[data-wb-undo]');
      if (wb) { if (wb.dataset.wbTool !== undefined) wbStep(id, wb.dataset.wbTool); else wbUndo(id, +wb.dataset.wbUndo); return; }
      if (t.dataset.gridDel !== undefined) {
        // 删除表格的一行（行号就是显示的行号，空行不在文字里）
        const cur = U.Table.gridRows(S.scene.entities[id].props[t.dataset.target]);
        cur.splice(+t.dataset.gridDel, 1);
        UI.Intent.run('set', { id, k: t.dataset.target, v: U.Table.gridText(cur) });
        return;
      }
      if (t.dataset.close) { S.inspOpen = false; UI.Panels.renderInsp(); UI.Stage.render(); }
      else if (t.dataset.seg !== undefined) UI.Intent.run('set', { id, k: t.dataset.k, v: +t.dataset.seg });
      else if (t.dataset.ins !== undefined) {
        const inp = insp.querySelector('input[data-k="' + t.dataset.target + '"]'); if (!inp) return;
        // 光标在文本框里就插在光标处；否则（点按钮时焦点已离开）插在末尾
        const at = (document.activeElement === inp && inp.selectionStart != null) ? inp.selectionStart : inp.value.length, ins = t.dataset.ins;
        inp.value = inp.value.slice(0, at) + ins + inp.value.slice(at);
        UI.Intent.run('set', { id, k: t.dataset.target, v: inp.value });
      }
      else if (t.dataset.unlink) UI.Intent.run('unlink', { id: t.dataset.unlink });
      else if (t.dataset.reset) UI.Intent.run('reset', { id });
      else if (t.dataset.step) { const inp = insp.querySelector('input[type="number"][data-k="' + t.dataset.k + '"]'); const P = U.types[S.scene.entities[id].type].props[t.dataset.k]; UI.Intent.run('set', { id, k: t.dataset.k, v: Math.round((+inp.value + (+t.dataset.step) * (P.step || 1)) * 1e6) / 1e6 }); }
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
      UI.Panels.dialog('<h3>我的发现</h3><div class="plist">' + list + '</div><p class="note-hint">我的笔记（只存在这台设备上）</p><textarea id="notes">' + U.kit.esc(lsGet(NOTE_KEY) || '') + '</textarea><div class="btnrow"><button class="btn pri" id="dlg-note">保存</button><button class="btn" id="dlg-close">关闭</button></div>');
    };
    $('#submit').onclick = () => {
      if (!S.run || S.run.submitted) return;
      S.run.submitted = true; S.run.finished = true; clearSession();
      const rep = J.report(S.problem, S.run, S.scene, S.D); Ev.push('submit', rep);
      UI.Panels.dialog(UI.Panels.reportHtml(rep, S.problem, 'exam')); UI.Panels.renderTop();
    };
    $('#dlg').addEventListener('change', (e) => { const t = e.target; if (t.dataset && t.dataset.reason && t.value) Ev.push('reason', { id: t.dataset.reason, label: t.value }); });
    $('#dlg').addEventListener('click', (e) => {
      const t = e.target;
      if (t.id === 'au-ok') {
        const givens = $('#au-givens').value.split(/[,，\s]+/).filter(Boolean).map((x) => { try { const q = U.Q.parse(x); return { n: Number(q.n), d: Number(q.d) }; } catch (e) { return null; } });
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
      if (t.id === 'cb-go') { UI.Panels.boardOut($('#cb-codes').value); return; }
      if (t.id === 'st-check') {
        const msg = $('#st-msg'), show = (w) => { msg.textContent = w; msg.style.display = 'block'; };
        const desc = $('#st-desc').value.trim(), type = $('#st-type').value.trim(), val = $('#st-value').value.trim();
        if (!desc) return show('先写一句题目描述');
        if (!U.types[type]) return show('没有这个器材：' + type + '（试试 num：数字卡）');
        try { U.Q.parse(val); } catch (e) { return show('目标数值写不对：只能是整数、小数或 3/4 这样的分数'); }
        const goal = { type, port: $('#st-port').value.trim(), op: $('#st-op').value, value: val };
        let r; try { r = U.Share.selfCheck([goal], S.scene); } catch (e) { return show('自检没跑通：' + e.message); }
        return show(r.ok ? '自检通过：台面满足目标，空台面不满足。' : '自检没通过：' + r.why);
      }
      if (t.id === 'dlg-copy') {
        const ta = $('#sharetext'); ta.select();
        const done = () => say('已复制到剪贴板', 'good', 1800);
        const fallback = () => { try { document.execCommand('copy') ? done() : say('复制不了，请手动选中文字复制', 'warn', 3000); } catch (e) { say('复制不了，请手动选中文字复制', 'warn', 3000); } };
        if (G.navigator && G.navigator.clipboard) G.navigator.clipboard.writeText(ta.value).then(done, fallback); else fallback();
        return;
      }
      if (t.id === 'dlg-resume') { UI.Panels.closeDialog(); resumeSession(); return; }
      if (t.id === 'dlg-fresh') { UI.Panels.closeDialog(); clearSession(); say('已重新开始，上次没做完的题已放下', '', 2400); return; }
      if (t.id === 'dlg-delout' || t.id === 'dlg-delall') {
        const id = pendingDel; pendingDel = null; UI.Panels.closeDialog();
        if (id && S.scene.entities[id]) { S.sel = null; UI.Intent.run('delete', { id, keep: t.id === 'dlg-delall' ? 'all' : 'out' }); }
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
      else if (e.key === 'Delete' || e.key === 'Backspace') { if (S.selLink) { const id = S.selLink; S.selLink = null; UI.Intent.run('delete', { link: id }); } else if (S.sel) UI.Intent.run('delete', { id: S.sel }); }
      else if (e.key === ' ') { e.preventDefault(); UI.Intent.clock({ running: !S.scene.clock.running }); }
      else if ((e.key === 'r' || e.key === 'R' || e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // 块（§10.5.10）：R 转 90°，F 左右翻，作用在选中的块上；没有选中块就什么也不做
        const ids = UI.Stage.selPieceIds(); if (!ids.length) return;
        e.preventDefault();
        const what = e.key === 'r' || e.key === 'R' ? 'turn' : 'flip';
        UI.Intent.run('piece', { ids, what, value: 1 });
      }
      else if (e.key === 'Escape' && S.wsDraw) UI.Stage.endDraw();
      else if (e.key === 'Escape' && UI.State.focusedId()) UI.Stage.setFocus(null);
      else if (e.key === 'Escape') { S.sel = null; S.selLink = null; UI.Panels.renderInsp(); UI.Stage.render(); }
    });
    G.addEventListener('resize', () => { const nar = G.innerWidth <= L.NARROW_BP; $('#shelfbtn').style.display = nar ? '' : 'none'; UI.Stage.render(); });   // 窗口变了：面板重新摆（实测尺寸，不溢出）
    $('#shelfbtn').style.display = G.innerWidth <= L.NARROW_BP ? '' : 'none';
  }

  function start() {
    Ev.load(); U.Author.loadAll(); UI.Stage.init(); UI.Panels.initShelfDrag(); bind(); UI.Panels.renderShelf();
    openFree(); G.requestAnimationFrame(frame);
    setInterval(saveSession, 2000); G.addEventListener('pagehide', saveSession);
    offerResume();
  }
  UI.App = { tx, act, actMany, build, preview, snapshot, afterMove, removeEntity, askDelete, clockAct, openProblem, openFree, setMode, say, undo, redo, stepOnce, refresh, persistView };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})(window);
