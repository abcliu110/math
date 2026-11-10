/* 工作台的界面（D8，docs/direction.md 第 7 节 D8）：数位竖式（器材的 wbUI: 'digits'）和数据图表台（wbUI: 'data'）；
 * 排除表（2.14b，wbUI: 'deduce'）。
 * 只画和接鼠标、键盘；每一步都走 UI.Intent.run('wbsteps', …) 写进台面的 scene.workbench，
 * 能不能做由内核（U.Digits、U.DataBench）判断，不能做就说明原因、步骤不变。
 * 草稿（输入框的字、点选的数字、提示）放在 UI.Panels.wbDraft(器材 id) 上（会话状态，不存）。
 * 界面按器材声明的 wbUI 找画法，不按器材名字判断（见 js/core/registry.js 的 WB_UIS）。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {});
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const DRAG_PX = 6;
  const DATA_KEY = () => U.DataBench.keyOf();

  const draft = (id) => UI.Panels.wbDraft(id);
  const ent = (id) => (id && UI.S.scene.entities[id]) || null;
  // 选中的器材如果是工作台（声明了 wbUI），返回它的界面种类；否则 null
  const benchKind = (id) => { const e = ent(id); const d = e && U.types[e.type]; return d && d.wbUI ? d.wbUI : null; };

  // 台面上记的步骤：属于这台器材、这个记号才算
  const stepsOf = (id, key) => {
    const wb = UI.S.scene.workbench;
    return wb && wb.host === id && wb.key === key && Array.isArray(wb.steps) ? wb.steps : [];
  };
  function commit(id, key, steps) { UI.Intent.run('wbsteps', { id, host: id, key, steps }); }
  function note(id, text) { draft(id).msg = text; UI.Panels.renderInsp(); }
  function undoTo(id, k, key) { commit(id, key, stepsOf(id, key).slice(0, k)); draft(id).msg = ''; }

  // ---------- 数位竖式 ----------
  const digitKey = (e) => U.Digits.keyOf(U.Digits.paramsOf(e.props));
  function digitStep(id, tool, args) {
    const e = ent(id), P = U.Digits.paramsOf(e.props), key = U.Digits.keyOf(P);
    const st = U.Digits.current(UI.S.scene, id, P);
    const r = U.Digits.apply(st, tool, args);
    if (!r.ok) return note(id, r.why);
    const base = U.Digits.stateOf(UI.S.scene, id, P) ? stepsOf(id, key) : [];
    draft(id).pick = null; draft(id).msg = '';
    commit(id, key, base.concat([r.step]));
  }
  const digitStepText = (s) => {
    const N = U.Digits.NAMES, c = s.args && s.args.col;
    if (s.tool === 'write') return N[c] + '写 ' + s.args.d;
    if (s.tool === 'carry') return N[c] + '进位';
    return N[c] + '退位';
  };
  // 列的标记：进来的 1（加法）、借来的数（减法）、借出去的 −1
  function adjHtml(col) {
    let s = '';
    if (col.carryIn) s += '<span class="dg-mark">1</span>';
    if (col.adj) s += '<span class="dg-mark">+' + col.adj + '</span>';
    if (col.dec) s += '<span class="dg-mark dg-dec">−1</span>';
    return s;
  }
  function digitHtml(e) {
    const P = U.Digits.paramsOf(e.props), key = U.Digits.keyOf(P);
    const st = U.Digits.current(UI.S.scene, e.id, P), v = U.Digits.view(st), dr = draft(e.id);
    const cols = v.cols.slice().reverse();   // 从左到右：百、十、个
    const names = cols.map((col) => '<td>' + col.name + '</td>').join('');
    let h = '<div class="wb dg"><h5>数位竖式</h5><div class="dg-title">' + esc(v.title) + '</div>';
    h += '<table class="dg-tab">';
    h += '<tr class="dg-r-head"><td></td>' + names + '</tr>';
    h += '<tr class="dg-r-adj"><td></td>' + cols.map((col) => '<td>' + adjHtml(col) + '</td>').join('') + '</tr>';
    h += '<tr class="dg-r-top"><td></td>' + cols.map((col) => '<td><span class="dg-cell" data-dg-top="' + col.c + '">' + (col.top === null ? '' : col.top) + '</span></td>').join('') + '</tr>';
    h += '<tr class="dg-r-bot"><td class="dg-op">' + esc(v.op) + '</td>' + cols.map((col) => '<td><span class="dg-cell" data-dg-bot="' + col.c + '">' + (col.bot === null ? '' : col.bot) + '</span></td>').join('') + '</tr>';
    h += '<tr class="dg-r-res"><td></td>' + cols.map((col) => '<td><span class="dg-cell dg-slot' + (col.off ? ' off' : '') + (col.cur ? ' cur' : '') + '" data-dg-cell="' + col.c + '">' + (col.digit === null ? '' : col.digit) + '</span></td>').join('') + '</tr>';
    h += '</table>';
    h += '<div class="dg-now">' + esc(v.now) + '</div>';
    // 进位、退位的按钮（能做的时候才出现）
    let acts = '';
    v.carryable.forEach((c) => { acts += '<button class="dg-btn" data-dg-carry="' + c + '">进位：把' + U.Digits.NAMES[c] + '的 1 进到左边</button>'; });
    if (v.borrowable >= 0) acts += '<button class="dg-btn" data-dg-borrow="' + v.borrowable + '">退位：向左边借 1</button>';
    if (acts) h += '<div class="dg-acts">' + acts + '</div>';
    h += '<div class="wb-note">把数字拖到竖式的一列上松手；或先点一个数字，再点这一列。</div>';
    h += '<div class="dg-pal">' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => '<span class="dg-tile' + (dr.pick === d ? ' pick' : '') + '" data-dg-digit="' + d + '" role="button" tabindex="0" aria-label="数字 ' + d + '">' + d + '</span>').join('') + '</div>';
    h += '<div class="dg-msg">' + esc(dr.msg || '') + '</div>';
    const hist = stepsOf(e.id, key);
    if (hist.length) h += '<div class="wb-h">步骤</div>' + hist.map((s, i) => '<div class="wb-step"><span>第 ' + (i + 1) + ' 步：' + esc(digitStepText(s)) + '</span><button class="dg-btn" data-dg-undo="' + (i + 1) + '">回到这一步</button></div>').join('');
    return h + '</div>';
  }

  // ---------- 数据图表台 ----------
  function plotSvg(st, v) {
    const W = 240, H = 150, pad = 22;
    const pts = st.rows.map((r) => [U.Q.num(r.x), U.Q.num(r.y)]);
    const f = st.fit ? (x) => U.Q.num(st.fit.k) * x + U.Q.num(st.fit.b) : null;
    let x0 = Math.min(...pts.map((p) => p[0])), x1 = Math.max(...pts.map((p) => p[0]));
    let ys = pts.map((p) => p[1]);
    if (f) ys = ys.concat([f(x0), f(x1)]);
    let y0 = Math.min(...ys), y1 = Math.max(...ys);
    if (x1 === x0) x1 = x0 + 1;
    if (y1 === y0) y1 = y0 + 1;
    const sx = (x) => pad + ((x - x0) / (x1 - x0)) * (W - 2 * pad);
    const sy = (y) => H - pad - ((y - y0) / (y1 - y0)) * (H - 2 * pad);
    let s = '<svg class="db-plot" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="散点图">';
    s += '<line x1="' + pad + '" y1="' + (H - pad) + '" x2="' + (W - pad) + '" y2="' + (H - pad) + '" style="stroke:var(--dim)"/>';
    s += '<line x1="' + pad + '" y1="' + pad + '" x2="' + pad + '" y2="' + (H - pad) + '" style="stroke:var(--dim)"/>';
    if (f) s += '<line x1="' + sx(x0) + '" y1="' + sy(f(x0)) + '" x2="' + sx(x1) + '" y2="' + sy(f(x1)) + '" style="stroke:var(--accent, #3b9bff);stroke-width:2"/>';
    pts.forEach((p) => { s += '<circle cx="' + sx(p[0]) + '" cy="' + sy(p[1]) + '" r="3.5" style="fill:var(--ink)"/>'; });
    return s + '</svg>';
  }
  function dataStepText(s) {
    if (s.tool === 'row') return '录入 (' + s.args.x + ', ' + s.args.y + ')';
    if (s.tool === 'del') return '删除第 ' + (s.args.i + 1) + ' 行';
    if (s.tool === 'plot') return '画散点图';
    return '拟合直线';
  }
  function dataHtml(e) {
    const st = U.DataBench.current(UI.S.scene, e.id), v = U.DataBench.view(st), dr = draft(e.id);
    const now = v.n === 0 ? '还没有数据，先录入至少 2 组' : !v.plotted ? '已录 ' + v.n + ' 组，下一步：画散点图' : !v.fit ? '图已经画好，下一步：拟合直线' : '直线：' + v.fit.text;
    let h = '<div class="wb db"><h5>数据图表台</h5><div class="db-title">' + esc(e.props.title) + '</div>';
    h += '<div class="db-now">' + esc(now) + '</div>';
    h += '<table class="db-tab"><tr><th>x</th><th>y</th><th></th></tr>' +
      v.rows.map((r) => '<tr class="db-row"><td>' + esc(r.x) + '</td><td>' + esc(r.y) + '</td><td><button class="dg-btn" data-db-del="' + r.i + '">删除</button></td></tr>').join('') + '</table>';
    h += '<div class="db-entry"><input class="db-in" data-db-x placeholder="x" aria-label="x" value="' + esc(dr.dbx || '') + '"><input class="db-in" data-db-y placeholder="y" aria-label="y" value="' + esc(dr.dby || '') + '"><button class="dg-btn" data-db-add="1">加一行</button></div>';
    h += '<div class="dg-acts"><button class="dg-btn" data-db-plot="1">画散点图</button><button class="dg-btn" data-db-fit="1">拟合直线</button></div>';
    if (v.plotted) h += plotSvg(st, v);
    if (v.fit) h += '<div class="db-eq">' + esc(v.fit.text) + '</div>';
    h += '<div class="db-msg">' + esc(dr.msg || '') + '</div>';
    const hist = stepsOf(e.id, DATA_KEY());
    if (hist.length) h += '<div class="wb-h">步骤</div>' + hist.map((s, i) => '<div class="wb-step"><span>第 ' + (i + 1) + ' 步：' + esc(dataStepText(s)) + '</span><button class="dg-btn" data-db-undo="' + (i + 1) + '">回到这一步</button></div>').join('');
    return h + '</div>';
  }
  function dataStep(id, tool, args) {
    const st = U.DataBench.current(UI.S.scene, id);
    const r = U.DataBench.apply(st, tool, args);
    if (!r.ok) return note(id, r.why);
    const base = U.DataBench.stateOf(UI.S.scene, id) ? stepsOf(id, DATA_KEY()) : [];
    draft(id).msg = '';
    commit(id, DATA_KEY(), base.concat([r.step]));
  }
  function addRow(id) {
    const dr = draft(id), st = U.DataBench.current(UI.S.scene, id);
    const r = U.DataBench.apply(st, 'row', { x: dr.dbx || '', y: dr.dby || '' });
    if (!r.ok) return note(id, r.why);
    dr.dbx = ''; dr.dby = ''; dr.msg = '';
    const base = U.DataBench.stateOf(UI.S.scene, id) ? stepsOf(id, DATA_KEY()) : [];
    commit(id, DATA_KEY(), base.concat([r.step]));
  }

  // ---------- 排除表（2.14b，器材 deduce，wbUI: 'deduce'）：点格子 = 一步，规则在 U.Deduce ----------
  function deduceStep(id, i, j) {
    const e = ent(id), key = U.Deduce.keyOf(e.props), st = U.Deduce.current(UI.S.scene, id);
    const r = U.Deduce.apply(st, 'mark', { i, j });
    if (!r.ok) return note(id, r.why);
    const base = U.Deduce.stateOf(UI.S.scene, id) ? stepsOf(id, key) : [];
    draft(id).msg = r.msg;
    commit(id, key, base.concat([r.step]));
  }
  function deduceHtml(e) {
    const st = U.Deduce.current(UI.S.scene, e.id), dr = draft(e.id), key = U.Deduce.keyOf(e.props);
    if (!st) return '<div class="wb dd"><h5>排除表</h5><div class="dd-msg">人或属性的数目对不上，题目的表要检查</div></div>';
    const v = U.Deduce.view(st), M = U.Deduce.parse(e.props);
    let h = '<div class="wb dd"><h5>排除表</h5><div class="dd-now">' + esc(v.now) + '</div>';
    h += '<table class="dd-tab"><tr class="dd-r-group"><td></td>' + v.groups.map((g) => '<th colspan="' + g.n + '">' + esc(g.name) + '</th>').join('') + '</tr>';
    h += '<tr class="dd-r-head"><td></td>' + v.cols.map((c) => '<th>' + esc(c.name) + '</th>').join('') + '</tr>';
    v.rows.forEach((row) => {
      h += '<tr><th class="dd-person">' + esc(row.name) + '</th>' + row.cells.map((c) =>
        '<td><button class="dd-cell dd-' + c.st + (c.only ? ' dd-only' : '') + '" data-dd-cell="' + c.i + ',' + c.j + '" data-dd-st="' + c.st + '" data-dd-only="' + (c.only ? 1 : 0) + '" aria-label="' + esc(row.name + ' ' + c.value + '：' + c.label) + '">' + esc(c.text) + '</button></td>'
      ).join('') + '</tr>';
    });
    h += '</table>';
    if (v.hint) h += '<div class="dd-hint">' + esc(v.hint) + '</div>';
    h += '<div class="dd-msg">' + esc(dr.msg || '') + '</div>';
    if (v.conclusions.length) h += '<div class="wb-h">结论</div><div class="dd-concl">' + v.conclusions.map(esc).join('；') + '</div>';
    const hist = stepsOf(e.id, key);
    if (hist.length) h += '<div class="wb-h">步骤</div>' + hist.map((s, i) => '<div class="wb-step"><span>第 ' + (i + 1) + ' 步：' + esc(U.Deduce.stepText(M, s)) + '</span><button class="dg-btn" data-dd-undo="' + (i + 1) + '">回到这一步</button></div>').join('');
    return h + '</div>';
  }
  function deduceClick(id, t) {
    const cell = t.closest('[data-dd-cell]');
    if (cell) { const ij = cell.dataset.ddCell.split(','); return deduceStep(id, +ij[0], +ij[1]); }
    const und = t.closest('[data-dd-undo]'); if (und) return undoTo(id, +und.dataset.ddUndo, U.Deduce.keyOf(ent(id).props));
  }

  // ---------- 点击（按钮、点一列、点一个数字） ----------
  function digitClick(id, t) {
    const cell = t.closest('[data-dg-cell]');
    if (cell) {
      const pick = draft(id).pick;
      if (pick === undefined || pick === null) return note(id, '先把数字拖到这一列，或先点一个数字再点这一列');
      return digitStep(id, 'write', { col: +cell.dataset.dgCell, d: pick });
    }
    const car = t.closest('[data-dg-carry]'); if (car) return digitStep(id, 'carry', { col: +car.dataset.dgCarry });
    const bor = t.closest('[data-dg-borrow]'); if (bor) return digitStep(id, 'borrow', { col: +bor.dataset.dgBorrow });
    const und = t.closest('[data-dg-undo]'); if (und) return undoTo(id, +und.dataset.dgUndo, U.Digits.keyOf(U.Digits.paramsOf(ent(id).props)));
  }
  function dataClick(id, t) {
    if (t.closest('[data-db-add]')) return addRow(id);
    const del = t.closest('[data-db-del]'); if (del) return dataStep(id, 'del', { i: +del.dataset.dbDel });
    if (t.closest('[data-db-plot]')) return dataStep(id, 'plot', {});
    if (t.closest('[data-db-fit]')) return dataStep(id, 'fit', {});
    const und = t.closest('[data-db-undo]'); if (und) return undoTo(id, +und.dataset.dbUndo, DATA_KEY());
  }

  // ---------- 拖动数字（按下、移动超过一点点才算拖，松手落在哪一列） ----------
  let drag = null, just = false;
  const cellAt = (x, y) => { const h = document.elementFromPoint(x, y); return h && h.closest ? h.closest('#insp [data-dg-cell]') : null; };
  function markOver(x, y) {
    const z = cellAt(x, y);
    document.querySelectorAll('#insp [data-dg-cell]').forEach((el) => el.classList.toggle('dg-over', el === z));
  }

  function bind(insp) {
    insp.addEventListener('pointerdown', (ev) => {
      just = false;
      const t = ev.target.closest && ev.target.closest('[data-dg-digit]');
      if (!t || ev.button !== 0 || benchKind(UI.S.sel) !== 'digits') return;
      drag = { id: UI.S.sel, d: +t.dataset.dgDigit, x0: ev.clientX, y0: ev.clientY, on: false, el: t };
    });
    window.addEventListener('pointermove', (ev) => {
      const g = drag;
      if (!g) return;
      if (!g.on) {
        if (Math.hypot(ev.clientX - g.x0, ev.clientY - g.y0) <= DRAG_PX) return;
        g.on = true; g.el.classList.add('dg-drag');
      }
      markOver(ev.clientX, ev.clientY);
    });
    window.addEventListener('pointerup', (ev) => {
      const g = drag; drag = null;
      document.querySelectorAll('#insp .dg-over').forEach((el) => el.classList.remove('dg-over'));
      if (!g) return;
      if (!g.on) { draft(g.id).pick = g.d; return note(g.id, '点一列，把这个数字写进去'); }
      just = true;
      const z = cellAt(ev.clientX, ev.clientY);
      if (z && g.id === UI.S.sel) return digitStep(g.id, 'write', { col: +z.dataset.dgCell, d: g.d });
      note(g.id, '把数字拖到竖式的一列上松手');
    });
    insp.addEventListener('click', (ev) => {
      const was = just; just = false;
      if (was) return;   // 刚拖过一个数字：浏览器补的这次点击不算
      const id = UI.S.sel, kind = benchKind(id);
      if (kind === 'digits') digitClick(id, ev.target);
      else if (kind === 'data') dataClick(id, ev.target);
      else if (kind === 'deduce') deduceClick(id, ev.target);
    });
    insp.addEventListener('input', (ev) => {
      const id = UI.S.sel, t = ev.target;
      if (!id || benchKind(id) !== 'data') return;
      if (t.dataset.dbX !== undefined) draft(id).dbx = t.value;
      else if (t.dataset.dbY !== undefined) draft(id).dby = t.value;
    });
    insp.addEventListener('keydown', (ev) => {
      const t = ev.target, id = UI.S.sel;
      if (ev.key === 'Enter' && id && benchKind(id) === 'data' && (t.dataset.dbX !== undefined || t.dataset.dbY !== undefined)) addRow(id);
    });
  }

  UI.WBKit = {
    // 属性面板里的工作台：d 是器材的定义（声明了 wbUI）
    html(e, d) { return d.wbUI === 'digits' ? digitHtml(e) : d.wbUI === 'deduce' ? deduceHtml(e) : dataHtml(e); },
    bind,
  };
})(window);
