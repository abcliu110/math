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
    h += '<div class="plist"><div class="grp">自由</div><div class="it' + (!S.problem ? ' cur' : '') + '" data-free="1"><span class="tt">自由探究（空台面，所有器材）</span></div>';
    const by = {};
    U.problems.filter((p) => !q || (p.title + p.domain + (p.points || []).join('') + (p.alias || []).join('')).includes(q)).forEach((p) => (by[p.domain] = by[p.domain] || []).push(p));
    for (const g of U.GROUPS.concat(Object.keys(by).filter((k) => !U.GROUPS.includes(k)))) {
      if (!by[g]) continue;
      h += '<div class="grp">' + esc(g) + '</div>';
      by[g].forEach((p) => {
        const hs = U.Events.history(p.id), done = hs.practice > 0 || hs.exam > 0;
        h += '<div class="it' + (S.problem && S.problem.id === p.id ? ' cur' : '') + '" data-pid="' + p.id + '"><span class="tt">' + esc(p.title) + '</span><span class="chip">' + p.grade + ' 年级</span>' + (done ? '<span class="chip ok">已做</span>' : '') + '</div>';
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
      const ts = Object.values(U.types).filter((t) => t.group === g && (!q || (t.label + t.alias.join('') + g).includes(q)));
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
      const P = d.props[k], v = e.props[k], drv = dd && dd.driven[k];
      h += '<div class="row' + (drv ? ' drv' : '') + '"><label>' + esc(P.label) + '</label><div class="ctl">';
      if (drv) h += '← 由「' + esc(S.scene.entities[drv.from].name) + '」驱动 <button class="st" data-unlink="' + drv.link + '" title="断开">✕</button>';
      else if (!P.write) h += esc(String(v));
      else if (P.type === 'choice') h += '<select data-k="' + k + '">' + P.choices.map((c, i) => '<option value="' + i + '"' + (i === v ? ' selected' : '') + '>' + esc(c) + '</option>').join('') + '</select>';
      else if (P.type === 'bool') h += '<input type="checkbox" data-k="' + k + '"' + (v ? ' checked' : '') + '>';
      else if (P.type === 'text') h += '<input type="text" data-k="' + k + '" value="' + esc(v) + '">';
      else h += '<button class="st" data-step="-1" data-k="' + k + '">−</button><input type="number" data-k="' + k + '" value="' + v + '" step="' + (P.step || 1) + '"' + (P.min !== undefined ? ' min="' + P.min + '"' : '') + (P.max !== undefined ? ' max="' + P.max + '"' : '') + '><button class="st" data-step="1" data-k="' + k + '">+</button>';
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

  function reportHtml(rep, p, mode) {
    let h = '<h3>' + (mode === 'exam' ? '交卷结果：' : '做完了！　') + esc(p.title) + '</h3><div class="big">' + rep.score + ' / ' + rep.max + ' 分</div><div class="rep">';
    rep.items.forEach((i) => { h += '<span class="' + (i.done ? 'ok' : 'no') + '">' + (i.done ? '✓ ' : '○ ') + esc(i.say) + (i.half ? '（用了完整提示，半分）' : '') + '</span><span>' + (i.done ? (i.half ? i.score / 2 : i.score) : 0) + ' / ' + i.score + '</span>'; });
    h += '</div>';
    if (rep.guess !== null || rep.actual !== null) h += '<div class="cmp"><div><small>你的猜想</small>' + esc(rep.guess || '没猜') + '</div><div><small>实际结果</small>' + esc(rep.actual || '—') + (rep.match === true ? ' 🎯' : '') + '</div></div>';
    rep.traps.forEach((t) => { h += '<div class="warnbox">⚠ ' + esc(t) + '</div>'; });
    if (rep.newWay) h += '<div class="newway">✨ 你找到了一种参考解里没有的搭法！</div>';
    h += '<div class="whybox">' + esc(p.why) + '</div><div class="btnrow"><button class="btn pri" id="dlg-again">再做一遍</button><button class="btn" id="dlg-next">下一题</button><button class="btn" id="dlg-close">继续玩</button></div>';
    return h;
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

  UI.Panels = { renderTop, renderLeft, renderShelf, renderInsp, renderClock, dialog, closeDialog, reportHtml, initShelfDrag, renderAll() { renderTop(); renderLeft(); renderShelf(); renderInsp(); renderClock(); } };
})(window);
