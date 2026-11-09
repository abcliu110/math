/* 面板：左栏（实验库 / 步骤）、右栏器材架、属性面板、时钟条、对话框。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), K = U.kit, esc = K.esc;
  const $ = (s) => document.querySelector(s);
  let ghost = null;

  // ---------- 顶栏 ----------
  function renderTop() {
    const S = UI.S;
    $('#ptitle').textContent = S.problem ? S.problem.title : '自由探究：想搭什么就搭什么';
    document.querySelectorAll('#modes button').forEach((b) => b.classList.toggle('on', b.dataset.mode === S.mode));
    $('#undo').disabled = !S.undo.length; $('#redo').disabled = !S.redo.length;
    $('#submit').style.display = S.mode === 'exam' && S.run && !S.run.submitted ? '' : 'none';
  }

  // ---------- 左栏 ----------
  function renderLeft() {
    const S = UI.S, box = $('#leftbody');
    document.querySelectorAll('#ltabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === S.tab));
    box.innerHTML = S.tab === 'lab' ? labHtml() : stepsHtml();
  }
  function labHtml() {
    const S = UI.S, q = (S.q1 || '').trim();
    let h = '<input class="search" id="q1" placeholder="搜索题目、知识点" value="' + esc(q) + '">';
    const rv = U.Review.summarize(U.Events.log, U.problems);
    if (rv.due.length && !q) h += '<div class="pcard" style="margin-top:12px"><b>今天该复习 ' + rv.due.length + ' 道</b><div class="plist">' + rv.due.slice(0, 4).map((d) => '<div class="it" data-pid="' + d.pid + '" style="margin:6px 0 0"><span class="tt">' + esc(d.title) + '<br><small style="color:var(--orange)">' + esc(d.why) + '</small></span></div>').join('') + '</div></div>';
    h += '<div class="plist"><div class="grp">自由</div><div class="it' + (!S.problem ? ' cur' : '') + '" data-free="1"><span class="tt">自由探究（空台面，所有器材）</span></div>';
    const by = {};
    U.problems.filter((p) => !q || (p.title + p.domain + (p.points || []).join('') + (p.alias || []).join('')).includes(q)).forEach((p) => (by[p.domain] = by[p.domain] || []).push(p));
    for (const g of U.GROUPS.concat(Object.keys(by).filter((k) => !U.GROUPS.includes(k)))) {
      if (!by[g]) continue;
      h += '<div class="grp">' + esc(g) + '</div>';
      by[g].forEach((p) => {
        const hs = U.Events.history(p.id), done = hs.practice > 0 || hs.exam > 0;
        h += '<div class="it' + (S.problem && S.problem.id === p.id ? ' cur' : '') + '" data-pid="' + p.id + '"><span class="tt">' + esc(p.title) + '</span>' + (p.grade ? '<span class="chip">' + p.grade + ' 年级</span>' : '') + (done ? '<span class="chip ok">已做</span>' : '') + (p.custom ? '<button class="tbtn" data-del="' + p.id + '" title="删除这道题" style="padding:2px 8px">✕</button>' : '') + '</div>';
      });
    }
    return h + '</div>';
  }
  function stepsHtml() {
    const S = UI.S, p = S.problem, run = S.run;
    if (!p) return '<div class="empty">现在是自由探究。<br>从右边拖器材到台面，想搭什么搭什么。<br><br>想做题，去「实验库」选一道。</div>';
    let h = '<div class="pcard"><b>' + esc(p.title) + '</b>' + esc(p.hook) + '<div class="tags">' + (p.points || []).map((x) => '<span class="chip">' + esc(x) + '</span>').join('') + '</div></div>';
    if (p.predict && !run.pred_done) {
      h += '<div class="pred"><div class="q">' + esc(p.predict.q) + '</div>' + p.predict.options.map((o, i) => '<button data-pred="' + i + '"' + (String(run.pred) === String(o.v) ? ' class="picked"' : '') + '>' + esc(o.label) + '</button>').join('') + '<button data-pred="skip" style="background:none;color:var(--txt3)">先不猜，直接做</button></div>';
    } else if (p.predict && run.pred !== undefined) {
      const g = p.predict.options.find((o) => String(o.v) === String(run.pred));
      h += '<div class="pcard" style="background:var(--panel2)">你的猜想：<b style="display:inline">' + esc(g ? g.label : '—') + '</b>（做完后会和结果并排对比）</div>';
    }
    if (S.mode === 'exam') {
      h += '<div class="pcard" style="background:var(--panel2)">考试模式：没有提示，没有步骤清单。搭好以后点右上角「交卷」。</div>';
    } else {
      let cur = true;
      p.milestones.forEach((m, i) => {
        const st = run.ms[m.id], isCur = !st.done && cur; if (!st.done) cur = false;
        const lv = run.hintLevel[m.id] || 0;
        h += '<div class="step' + (st.done ? ' done' : isCur ? ' cur' : '') + '"><span class="no">' + (st.done ? '✓' : i + 1) + '</span><span class="sy">' + esc(m.say) + (isCur && lv ? '<span class="hint">提示：' + esc((m.hints || [])[Math.min(lv, 3) - 1] || '') + '</span>' : '') + '</span><span class="sc">' + m.score + ' 分</span></div>';
      });
      h += '<div class="btnrow"><button class="btn" id="hintbtn">💡 来个提示</button><button class="btn" id="restart">重来</button></div>';
    }
    return h;
  }

  // ---------- 右栏：器材架 ----------
  function renderShelf() {
    const S = UI.S, q = ($('#q2') && $('#q2').value || '').trim();
    const allow = S.problem ? S.problem.shelf : null;
    let h = '';
    for (const g of U.GROUPS) {
      const ts = Object.values(U.types).filter((t) => !t.hidden && t.group === g && (!q || (t.label + t.alias.join('') + g).includes(q)));
      if (!ts.length) continue;
      h += '<div class="grp">' + esc(g) + '</div><div class="tiles">';
      ts.forEach((t) => {
        const off = allow && !allow.includes(t.id), glow = S.glow && S.glow.includes(t.id);
        h += '<div class="tile' + (off ? ' off' : '') + (glow ? ' glow' : '') + '" data-type="' + t.id + '"><svg viewBox="0 0 64 44">' + t.icon() + '</svg><div class="nm">' + esc(t.label) + '</div></div>';
      });
      h += '</div>';
    }
    $('#shelfbody').innerHTML = h || '<div class="empty">没有找到这个器材</div>';
  }

  // ---------- 属性面板 ----------
  function renderInsp() {
    const S = UI.S, box = $('#insp'), e = S.sel && S.scene.entities[S.sel];
    if (!e || !S.inspOpen) { box.classList.remove('open'); return; }
    const d = U.types[e.type], dd = S.D[e.id];
    let h = '<h4><input id="nm" value="' + esc(e.name) + '" maxlength="12"><button class="tbtn" data-close="1">✕</button></h4>';
    for (const k of Object.keys(d.props)) {
      if (d.props[k].hidden) continue;
      const P = d.props[k], v = e.props[k], drv = dd && dd.driven[k];
      h += '<div class="row' + (drv ? ' drv' : '') + '"><label>' + esc(P.label) + '</label><div class="ctl">';
      if (drv) h += '← 由「' + esc(S.scene.entities[drv.from].name) + '」驱动 <button class="st" data-unlink="' + drv.link + '" title="断开">✕</button>';
      else if (!P.write) h += esc(String(v));
      else if (U.controlFor(P) === 'segment') h += '<div class="seg">' + P.choices.map((c, i) => '<button class="sg' + (i === v ? ' on' : '') + '" data-k="' + k + '" data-seg="' + i + '">' + esc(c) + '</button>').join('') + '</div>';
      else if (P.type === 'choice') h += '<select data-k="' + k + '">' + P.choices.map((c, i) => '<option value="' + i + '"' + (i === v ? ' selected' : '') + '>' + esc(c) + '</option>').join('') + '</select>';
      else if (P.type === 'bool') h += '<input type="checkbox" data-k="' + k + '"' + (v ? ' checked' : '') + '>';
      else if (P.type === 'text') h += '<input type="text" data-k="' + k + '" value="' + esc(v) + '">';
      else {
        // 1.1.1：滑杆 / 转盘（有范围时）；数字框始终在，保证能精确填数
        const C = U.controlFor(P);
        const lo = P.min !== undefined ? P.min : (C === 'dial' ? 0 : undefined), hi = P.max !== undefined ? P.max : (C === 'dial' ? 360 : undefined);
        const ranged = (C === 'slider' || C === 'dial') && lo !== undefined && hi !== undefined;
        if (C === 'dial' && ranged) h += '<input type="range" class="dial" data-k="' + k + '" min="' + lo + '" max="' + hi + '" step="1" value="' + Number(v) + '" title="' + Number(v) + '°">';
        else if (C === 'slider' && ranged) h += '<input type="range" class="slide" data-k="' + k + '" min="' + lo + '" max="' + hi + '" step="' + (P.type === 'int' ? 1 : 0.5) + '" value="' + Number(v) + '">';
        h += '<button class="st" data-step="-1" data-k="' + k + '">−</button><input type="number" data-k="' + k + '" value="' + v + '" step="' + (P.step || 1) + '"' + (P.min !== undefined ? ' min="' + P.min + '"' : '') + (P.max !== undefined ? ' max="' + P.max + '"' : '') + '><button class="st" data-step="1" data-k="' + k + '">+</button>';
      }
      h += '</div></div>';
    }
    h += '<div class="note">想让别的器材来决定「' + (Object.keys(d.props)[0] ? esc(d.props[Object.keys(d.props)[0]].label) : '') + '」？从别的器材的输出口拖一根线，放到这台器材左边出现的药丸上。</div>';
    const sg = (dd && dd.sig) || []; if (sg.length) h += '<div class="sigs">' + sg.map((s) => '<div>· ' + esc(s.tx) + '</div>').join('') + '</div>';
    h += '<div class="btnrow"><button class="btn" data-reset="1">恢复默认</button></div>';
    box.innerHTML = h; box.classList.add('open');
  }

  // ---------- 时钟条 ----------
  function renderClock() {
    const S = UI.S, ck = S.scene.clock;
    $('#go').textContent = ck.running ? '⏸' : '▶'; $('#go').classList.toggle('run', ck.running);
    $('#tk').textContent = '第 ' + ck.n + ' 拍 · ' + ck.t.toFixed(1) + ' 秒';
    document.querySelectorAll('#clockbar .rate button').forEach((b) => b.classList.toggle('on', +b.dataset.rate === ck.rate));
  }

  // ---------- 对话框 ----------
  function dialog(html) { const d = $('#dlg'); d.querySelector('.box').innerHTML = html; d.classList.add('open'); }
  function closeDialog() { $('#dlg').classList.remove('open'); }

  // 实验报告（2.5）：四栏。前三栏系统预填，第四栏学生自己写
  function inquiryHtml(r, p) {
    const c = r.cols, lvl = U.Evidence.LEVEL_NAME[c.found.evidence] || '';
    const col = (t, body) => '<div class="pcard"><b>' + t + '</b>' + body + '</div>';
    const guess = c.guess.prefill !== null ? esc(c.guess.prefill) : '没猜';
    const tried = '<div>完成的里程碑：' + (c.tried.milestones.length || '0') + ' 个</div><div>用了提示：' + c.tried.hints + ' 次</div><div>操作：' + c.tried.opsCount + ' 次</div>' + c.tried.traps.map((t) => '<div class="warnbox">⚠ ' + esc(t) + '</div>').join('');
    const found = '<div><small>证据等级：' + esc(lvl) + '</small></div><div>' + esc(c.found.wording) + '</div>';
    const asks = '<textarea id="asks" placeholder="还想问什么？" style="width:100%;min-height:60px"></textarea>';
    return '<h3>实验报告：' + esc(p.title) + '</h3><div class="rep2">' + col('我猜的', '<div>' + guess + '</div>') + col('我试了什么', tried) + col('我发现了', found) + col('我还想问', asks) + '</div>' +
      '<div class="btnrow"><button class="btn" id="dlg-close">关闭</button></div>';
  }
    function reportHtml(rep, p, mode) {
    let h = '<h3>' + (mode === 'exam' ? '交卷结果：' : '做完了！　') + esc(p.title) + '</h3><div class="big">' + rep.score + ' / ' + rep.max + ' 分</div><div class="rep">';
    rep.items.forEach((i) => { h += '<span class="' + (i.done ? 'ok' : 'no') + '">' + (i.done ? '✓ ' : '○ ') + esc(i.say) + (i.half ? '（用了完整提示，半分）' : '') + '</span><span>' + (i.done ? (i.half ? i.score / 2 : i.score) : 0) + ' / ' + i.score + '</span>'; });
    h += '</div>';
    if (rep.guess !== null || rep.actual !== null) h += '<div class="cmp"><div><small>你的猜想</small>' + esc(rep.guess || '没猜') + '</div><div><small>实际结果</small>' + esc(rep.actual || '—') + (rep.match === true ? ' 🎯' : '') + '</div></div>';
    rep.traps.forEach((t) => { h += '<div class="warnbox">⚠ ' + esc(t) + '</div>'; });
    // 3.4：没达成又没有陷阱解释的里程碑，让学生选一个错因（6 个标签）
    const missed = rep.items.filter((i) => !i.done);
    if (missed.length && !(rep.traps && rep.traps.length)) {
      h += '<div class="reasons"><small>没达成的，是哪里出了问题？</small>' + missed.map((i) => '<div class="rsn">' + esc(i.say) + ' <select data-reason="' + esc(i.id) + '"><option value="">选一个</option>' + U.Learning.REASONS.map((r) => '<option>' + esc(r) + '</option>').join('') + '</select></div>').join('') + '</div>';
    }
    // 3.4：下一步练什么（只有丢分时推荐）
    const next = U.Learning.nextPractice(p, rep, U.problems);
    if (next.length) h += '<p style="color:var(--txt3);margin:10px 0 4px">下一步练什么</p><div class="plist">' + next.map((n) => '<div class="it" data-pid="' + esc(n.pid) + '"><span class="tt">' + esc(n.title) + '</span></div>').join('') + '</div>';
    if (rep.newWay) h += '<div class="newway">✨ 你找到了一种参考解里没有的搭法！</div>';
    const back = missed.length && mode !== 'exam';
    h += '<div class="whybox">' + esc(p.why) + '</div><div class="btnrow">' + (back ? '<button class="btn pri" id="dlg-back">回去做这一步</button><button class="btn" id="dlg-again">再做一遍</button>' : '<button class="btn pri" id="dlg-again">再做一遍</button>') + '<button class="btn" id="dlg-next">下一题</button><button class="btn" id="dlg-inquiry">实验报告</button><button class="btn" id="dlg-close">继续玩</button></div>';
    return h;
  }



  function authorDialog() {
    const S = UI.S, E = S.scene.entities;
    const nums = Object.values(E).filter((e) => e.type === 'num' && !S.scene.links.some((l) => l.to === e.id)).map((e) => (e.props.d === 1 ? e.props.n : e.props.n + '/' + e.props.d));
    let tgt = ''; const sel = S.sel && E[S.sel] && S.D[S.sel]; if (sel) { const o = Object.values(sel.out).find((v) => v && v.kind === 'num'); if (o) tgt = U.Q.show(o.data); }
    dialog('<h3>出一道凑数题</h3><p style="color:var(--txt2);margin-top:0">给同学几个数，再给一个目标数。同学要用运算器把这些数连起来，凑出目标。系统会先自己解一遍，解不出来的题不能发布。</p>' +
      '<div class="row" style="margin:8px 0">题目名<input class="search" id="au-title" placeholder="例如：用 5、7、2 凑出 24"></div>' +
      '<div class="row" style="margin:8px 0">给的数（用逗号隔开，可以写分数）<input class="search" id="au-givens" value="' + esc(nums.join(', ')) + '" placeholder="5, 7, 2"></div>' +
      '<div class="row" style="margin:8px 0">目标数<input class="search" id="au-target" value="' + esc(tgt) + '" placeholder="24"></div>' +
      '<div class="row" style="margin:8px 0">给同学的话（可不写）<input class="search" id="au-hook" placeholder="提示：先想想 5 + 7"></div>' +
      '<div id="au-msg" class="warnbox" style="display:none"></div><div class="btnrow"><button class="btn pri" id="au-ok">发布到「我的题」</button><button class="btn" id="dlg-close">取消</button></div>');
  }

  function reportDialog() {
    const rv = U.Review.summarize(U.Events.log, U.problems), t = rv.totals;
    let h = '<h3>学习报告</h3><div class="cmp"><div><small>做过的题</small>' + t.tried + ' / ' + t.problems + '</div><div><small>累计用时</small>' + t.minutes + ' 分钟</div><div><small>踩过的陷阱</small>' + t.trapsHit + ' 个</div><div><small>找到新做法</small>' + t.newWay + ' 次</div></div>';
    h += '<p style="color:var(--txt3);margin:12px 0 4px">各领域进度（做过 / 全部，其中“掌握”= 满分且没踩陷阱）</p>';
    rv.domains.forEach((d) => { const pct = d.total ? Math.round((d.done / d.total) * 100) : 0, pm = d.total ? Math.round((d.mastered / d.total) * 100) : 0; h += '<div style="margin:8px 0"><div style="display:flex;justify-content:space-between"><span>' + esc(d.domain) + '</span><span style="color:var(--txt2)">' + d.done + ' / ' + d.total + '　掌握 ' + d.mastered + '</span></div><div style="height:8px;background:var(--panel2);border-radius:4px;overflow:hidden;position:relative"><div style="position:absolute;inset:0 auto 0 0;width:' + pct + '%;background:#2b5f9e"></div><div style="position:absolute;inset:0 auto 0 0;width:' + pm + '%;background:var(--good)"></div></div></div>'; });
    if (rv.due.length) h += '<p style="color:var(--txt3);margin:14px 0 4px">该复习的</p><div class="plist">' + rv.due.map((d) => '<div class="it" data-pid="' + d.pid + '"><span class="tt">' + esc(d.title) + '<br><small style="color:var(--orange)">' + esc(d.why) + '</small></span></div>').join('') + '</div>';
    h += '<div class="btnrow"><button class="btn" id="dlg-close">关闭</button></div>';
    dialog(h);
  }

  // ---------- 器材架拖放 ----------
  function initShelfDrag() {
    $('#shelfbody').addEventListener('pointerdown', (ev) => {
      const t = ev.target.closest('.tile'); if (!t || t.classList.contains('off')) return;
      const type = t.dataset.type, sx = ev.clientX, sy = ev.clientY; let moved = false;
      const mv = (e) => {
        if (!moved && Math.hypot(e.clientX - sx, e.clientY - sy) > 5) { moved = true; ghost = document.createElement('div'); ghost.id = 'ghost'; ghost.innerHTML = t.querySelector('svg').outerHTML; ghost.firstChild.style.cssText = 'width:96px;height:66px;background:#f4f6fb;border-radius:8px'; document.body.appendChild(ghost); }
        if (ghost) { ghost.style.left = e.clientX - 48 + 'px'; ghost.style.top = e.clientY - 33 + 'px'; }
      };
      const up = (e) => {
        window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up);
        if (ghost) { ghost.remove(); ghost = null; }
        const over = document.elementFromPoint(e.clientX, e.clientY);
        if (moved && over && over.closest('#stagewrap')) { const w = UI.Stage.toWorld(e); UI.App.act({ t: 'add', type, x: w.x - 70, y: w.y - 40 }, { select: true }); }
        else if (!moved) { const r = $('#stage').getBoundingClientRect(), S = UI.S; const w = UI.Stage.toWorld({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }); const n = Object.keys(S.scene.entities).length; UI.App.act({ t: 'add', type, x: w.x - 70 + (n % 5) * 24, y: w.y - 60 + (n % 5) * 24 }, { select: true }); }
      };
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
    });
  }

  UI.Panels = { renderTop, renderLeft, renderShelf, renderInsp, renderClock, dialog, closeDialog, reportHtml, inquiryHtml, reportDialog, authorDialog, initShelfDrag, renderAll() { renderTop(); renderLeft(); renderShelf(); renderInsp(); renderClock(); } };
})(window);
