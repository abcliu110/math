/* 面板：左栏（实验库 / 步骤）、右栏器材架、属性面板、时钟条、对话框。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), K = U.kit, esc = K.esc, L = UI.LAYOUT;
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
    if (rv.due.length && !q) h += '<div class="pcard due"><b>今天该复习 ' + rv.due.length + ' 道</b><div class="plist">' + rv.due.slice(0, 4).map((d) => '<div class="it" data-pid="' + d.pid + '" style="margin:6px 0 0"><span class="tt">' + esc(d.title) + '<br><small style="color:var(--orange)">' + esc(d.why) + '</small></span></div>').join('') + '</div></div>';
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
  // 预测表单（未作答时）：按 form 画按钮或输入框；data-pred / data-slot / data-cmp 交给 app.js 处理
  function predFormHtml(pr, run) {
    const form = pr.form || 'pick', q = '<div class="q">' + esc(pr.q) + '</div>';
    const skip = '<button data-pred="skip" style="background:none;color:var(--txt3)">先不猜，直接做</button>';
    if (form === 'pick') return q + pr.options.map((o, i) => '<button data-pred="' + i + '"' + (String(run.pred) === String(o.v) ? ' class="picked"' : '') + '>' + esc(o.label) + '</button>').join('') + skip;
    if (form === 'place') return q + pr.slots.map((s, i) => '<button data-pred="place" data-form="place" data-slot="' + i + '">' + esc(s) + '</button>').join('') + skip;
    if (form === 'more-less') {
      return q + (pr.ref ? '<div class="sub">和「' + esc(pr.ref) + '」比：</div>' : '') +
        Object.keys(U.Predict.CMP).map((k) => '<button data-pred="cmp" data-form="more-less" data-cmp="' + k + '">' + U.Predict.CMP[k] + '</button>').join('') + skip;
    }
    const hint = form === 'number' ? '写数字，比如 12、0.5、3/4' : '写下你的答案';
    return q + '<div class="predin"><input id="predin" data-form="' + form + '" placeholder="' + hint + '" autocomplete="off"><button class="btn pri" data-pred="submit" data-form="' + form + '">提交</button></div>' + skip;
  }
  // 学生的回答显示成文字
  function predShown(pr, v) {
    if (v === undefined || v === null) return '—';
    if (pr.form === 'place') return pr.slots[v] !== undefined ? pr.slots[v] : '—';
    if (pr.form === 'more-less') return U.Predict.CMP[v] || '—';
    return String(v);
  }
  function stepsHtml() {
    const S = UI.S, p = S.problem, run = S.run;
    if (!p) return '<div class="empty">现在是自由探究。<br>从右边拖器材到台面，想搭什么搭什么。<br><br>想做题，去「实验库」选一道。</div>';
    let h = '<div class="pcard"><b>' + esc(p.title) + '</b>' + esc(p.hook) + '<div class="tags">' + (p.points || []).map((x) => '<span class="chip">' + esc(x) + '</span>').join('') + '</div></div>';
    if (p.predict && !run.pred_done) {
      h += '<div class="pred">' + predFormHtml(p.predict, run) + '</div>';
    } else if (p.predict && run.pred !== undefined) {
      const form = p.predict.form || 'pick';
      if (form === 'pick') {
        const g = p.predict.options.find((o) => String(o.v) === String(run.pred));
        h += '<div class="pcard" style="background:var(--panel2)">你的猜想：<b style="display:inline">' + esc(g ? g.label : '—') + '</b>（做完后会和结果并排对比）</div>';
      } else {
        const r = U.Predict.check(p.predict, run.pred);
        h += '<div class="pcard" style="background:var(--panel2)">你的猜想：<b style="display:inline">' + esc(predShown(p.predict, run.pred)) + '</b>　' + (r.ok ? '✓ 对了' : '✗ 不对') + '<br>' + esc(r.why) + '</div>';
      }
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
  // 器材架不列出 hidden 的器材（器材定义里声明）：工作区的工具会自己造出来的步骤（连线、中点、剪刀……），学生不用从架上拿。
  // 器材类型还在，存档和旧题里用到它们照样能用；搜索结果里也不列。
  // 工作台（D2）：题目的 workbench 决定列哪些器材。关系画布（graph，默认）列全部器材；其他工作台只列它声明过的器材。
  function renderShelf() {
    const S = UI.S, q = ($('#q2') && $('#q2').value || '').trim();
    const allow = S.problem ? S.problem.shelf : null;
    const wb = S.problem && S.problem.workbench || 'graph';
    const R = U.problemRules(S.problem);
    let h = '';
    for (const g of U.GROUPS) {
      const ts = Object.values(U.types).filter((t) => !t.hidden && U.onWorkbenchShelf(t, wb) && t.group === g && (!q || (t.label + t.alias.join('') + g).includes(q)));
      if (!ts.length) continue;
      h += '<div class="grp">' + esc(g) + '</div><div class="tiles">';
      ts.forEach((t) => {
        const off = allow && !allow.includes(t.id), glow = S.glow && S.glow.includes(t.id);
        if (off && R.shelfOnly) return;   // 出题人控制（§10.5.9 第 10 条）：shelfOnly 时题目 shelf 之外的器材直接不列
        h += '<div class="tile' + (off ? ' off' : '') + (glow ? ' glow' : '') + '"' + (off ? ' title="本题不用这个器材，不能拖到台面上"' : '') + ' data-type="' + t.id + '"><svg viewBox="0 0 64 44">' + t.icon() + '</svg><div class="nm">' + esc(t.label) + '</div></div>';
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
    // 题目给的图形不许改名时（§10.5.9 第 10 条），名字输入框禁用，说明写在提示里
    const lockName = !U.problemRules(S.problem).rename && UI.App.givenIds().has(String(e.id));
    let h = '<h4><input id="nm" value="' + esc(e.name) + '" maxlength="12"' + (lockName ? ' disabled title="题目给的，不许改名"' : '') + '><button class="tbtn" data-close="1">✕</button></h4>';
    for (const k of Object.keys(d.props)) {
      if (d.props[k].hidden) continue;
      if (U.roleOf(e) === 'piece' && k === 'name') continue;   // 块的名字就是上面的名字框（§10.5.10）
      const P = d.props[k], v = e.props[k], drv = dd && dd.driven[k];
      h += '<div class="row' + (drv ? ' drv' : '') + '"><label>' + esc(P.label) + '</label><div class="ctl">';
      if (drv) h += '← 由「' + esc(S.scene.entities[drv.from].name) + '」驱动 <button class="st" data-unlink="' + drv.link + '" title="断开">✕</button>';
      else if (!P.write) h += esc(String(v));
      else if (U.controlFor(P) === 'segment') h += '<div class="seg">' + P.choices.map((c, i) => '<button class="sg' + (i === v ? ' on' : '') + '" data-k="' + k + '" data-seg="' + i + '">' + esc(c) + '</button>').join('') + '</div>';
      else if (P.type === 'choice') h += '<select data-k="' + k + '">' + P.choices.map((c, i) => '<option value="' + i + '"' + (i === v ? ' selected' : '') + '>' + esc(c) + '</option>').join('') + '</select>';
      else if (P.type === 'bool') h += '<input type="checkbox" data-k="' + k + '"' + (v ? ' checked' : '') + '>';
      else if (U.controlFor(P) === 'rule') {
        // 规则文本框：符号按钮（插入光标处）+ 实时检查（写得对不对、有哪些变量）
        const syms = ['n', 'x', 'y', '+', '−', '×', '^', '(', ')', '≥', '≤', '是质数', '是偶数', '是奇数', '是完全平方数'];
        let hint = '';
        try { const f = U.Seq.compileRule(String(v)); hint = '<span class="rok">✓ 看懂了' + (f.vars.length > 1 || f.vars[0] !== 'n' ? '，变量：' + f.vars.join('、') : '') + '</span>'; }
        catch (e) { hint = '<span class="rerr">' + esc(e.message) + '</span>'; }
        h += '<input type="text" data-k="' + k + '" class="rule-in" value="' + esc(v) + '"><div class="rsyms">' + syms.map((x) => '<button class="ins" data-ins="' + esc(x) + '" data-target="' + k + '">' + esc(x) + '</button>').join('') + '</div><div class="rhint">' + hint + '</div>';
      }
      else if (U.controlFor(P) === 'grid') {
        // 表格式编辑：每行一组数，格子直接改；最后一行留空用来加新行；✕ 删除这一行
        const view = U.Table.gridView(String(v));
        h += '<table class="grid">' + view.map((r, i) => '<tr>' + r.map((x, j) => '<td><input data-grid-k="' + k + '" data-r="' + i + '" data-c="' + j + '" value="' + esc(x) + '" placeholder="' + (j === 0 ? 'x' : 'y') + '"></td>').join('') + '<td>' + (i < view.length - 1 ? '<button class="gdel" data-grid-del="' + i + '" data-target="' + k + '" title="删除这一行">✕</button>' : '') + '</td></tr>').join('') + '</table>';
      }
      else if (U.controlFor(P) === 'fact') {
        // 台面上的事实：列出台面上所有布尔结论和证据等级，选一条作为依据（✓ 表示现在成立）
        const facts = U.Facts.list(S.scene, S.D);
        h += '<select data-fact="' + k + '"><option value="">（不选）</option>' + facts.map((f) => '<option value="' + esc(f.key) + '"' + (f.key === v ? ' selected' : '') + '>' + esc(f.label) + (f.verified ? ' ✓' : '') + '</option>').join('') + '</select>';
      }
      else if (P.type === 'text') h += (U.roleOf(e) === 'piece' && k === 'color' ? '<i class="swatch" style="background:' + esc(v) + '"></i>' : '') + '<input type="text" data-k="' + k + '" value="' + esc(v) + '">';
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
    // 器材自己声明了工作台界面（wbUI）就用它的画法：竖式（arith）用本文件的 arHtml；数位竖式和数据图表台用 UI.WBKit；否则是式子工作台（I）
    if (d.inspector === 'workbench') h += d.wbUI === 'arith' ? arHtml(e, dd) : d.wbUI ? UI.WBKit.html(e, d) : wbHtml(e, dd);
    h += '<div class="note">想让别的器材来决定「' + (Object.keys(d.props)[0] ? esc(d.props[Object.keys(d.props)[0]].label) : '') + '」？从别的器材的输出口拖一根线，放到这台器材左边出现的药丸上。</div>';
    const sg = (dd && dd.sig) || []; if (sg.length) h += '<div class="sigs">' + sg.map((s) => '<div>· ' + esc(s.tx) + '</div>').join('') + '</div>';
    h += '<div class="btnrow"><button class="btn" data-reset="1">恢复默认</button></div>';
    box.innerHTML = h; box.classList.add('open');
  }

  // ---------- 式子工作台的检查器（任务 H 第 3b 步，§10.5.3）----------
  // 步骤历史写在台面上（scene.workbench，U.ExprBench），这里只画。输入框的草稿放在 S.wbDraft[器材 id]。
  function wbDraft(id) {
    const S = UI.S; S.wbDraft = S.wbDraft || {};
    return S.wbDraft[id] || (S.wbDraft[id] = { ref: '', side: 'lhs', by: '', sub: '', msg: '', sel: [] });
  }
  // 一边的有符号项：加法的每一项是加；减法（移项后的 20 − 5）的第二项是减
  function wbTerms(node) {
    if (!node) return [];
    if (node.op === 'add') return node.args.map((f) => ({ f, sign: 1 }));
    if (node.op === 'sub' && node.args.length === 2) return [{ f: node.args[0], sign: 1 }, { f: node.args[1], sign: -1 }];
    return [{ f: node, sign: 1 }];
  }
  // 等号一边的项：每一项是一个按钮，选中的项带 sel 类和 aria-pressed
  function wbSide(side, node, dr) {
    return '<div class="wb-side" data-wb-side="' + side + '">' + wbTerms(node).map((t, i) => {
      const on = dr.sel.indexOf(side + ':' + i) >= 0;
      const txt = (t.sign < 0 ? '− ' : (i > 0 ? '+ ' : '')) + U.Form.show(t.f);
      return '<button class="wb-chip' + (on ? ' sel' : '') + '" data-wb-term="' + side + ':' + i + '" data-wb-side="' + side + '" data-wb-i="' + i + '" aria-pressed="' + on + '">' + esc(txt) + '</button>';
    }).join('') + '</div>';
  }
  // 步骤列表（§10.5.6 第 5 步）：每次定型的那几步收在一个折叠里（只能展开看，没有撤销按钮），外面是定型那一行（撤销定型）。
  // 定型那一行的撤销 k = 定型的下标：保留定型前的步骤。
  function wbStepRows(st) {
    const steps = st.steps;
    if (!steps.length) return '<div class="wb-none">还没有步骤</div>';
    const log = U.Workbench.stepLog(st), folds = U.Workbench.folds(st);
    const row = (i, cls, undo, label) => '<div class="wb-step' + cls + '"><span>' + esc(log[i]) + '<small>' + esc(steps[i].why) + '</small></span>' +
      (undo ? '<button data-wb-undo="' + (undo) + '">' + label + '</button>' : '') + '</div>';
    let h = '';
    for (let i = 0; i < steps.length;) {
      const f = folds.find((x) => x.from === i);
      if (f) {
        let inner = '';
        for (let j = f.from; j < f.bake; j++) inner += row(j, ' wb-folded', 0, '');
        h += '<details class="wb-fold"><summary>定型：前 ' + (f.bake - f.from) + ' 步（已固定，不能再改）</summary>' + inner + '</details>';
        h += row(f.bake, ' wb-bake', f.bake, '撤销定型');
        i = f.bake + 1;
      } else {
        h += row(i, '', i + 1, '撤销到这一步');
        i++;
      }
    }
    return h;
  }
  function wbHtml(e, dd) {
    const inp = dd && dd.inp, eq = U.ExprBench.workEqnIn(inp), area = U.ExprBench.areaIn(inp);
    // 几何来的面积（D7）：接上了就写出它的数；它是 S，式子里的 S 就是它
    const fromGeo = area ? '<div class="wb-note">几何台面的面积是 ' + esc(U.Q.show(area.data)) + '（式子里的 S 从几何来）</div>' : '';
    if (!eq) {
      if (area) return '<div class="wb"><h5>式子工作台</h5><div class="wb-now">现在：<b>S = ?</b></div>' + fromGeo +
        '<div class="note">再从代数式卡的输出口拖一根线到这台器材的「公式的右边」口，例如 a×h。</div></div>';
      return '<div class="wb"><h5>式子工作台</h5><div class="wb-none">接一个方程</div><div class="note">从方程台的「方程」口拖一根线到这台器材的「方程」口。</div></div>';
    }
    const st = U.ExprBench.currentOf(UI.S.scene, e.id, eq), dr = wbDraft(e.id), cur = st.current;
    // 选中项只认现在还存在的项（前面的步骤改了式子，旧的选择就作废）
    const sides = cur.kind === 'eqn' ? { lhs: cur.data.lhs, rhs: cur.data.rhs } : {};
    dr.sel = (dr.sel || []).filter((k) => {
      const m = /^(lhs|rhs):(\d+)$/.exec(k);
      return !!m && +m[2] < wbTerms(sides[m[1]]).length;
    });
    let h = '<div class="wb"><h5>式子工作台</h5><div class="wb-now">现在：<b>' + esc(U.ExprBench.showState(st)) + '</b></div>' + fromGeo;
    if (cur.kind === 'eqn') {
      h += '<div class="wb-eq">' + wbSide('lhs', sides.lhs, dr) + '<span class="wb-rel">' + esc(cur.data.rel) + '</span>' + wbSide('rhs', sides.rhs, dr) + '</div>';
      h += '<div class="wb-note">点项就选中（可以多选）。把左边的项拖过等号，松手就是移项；选两个同类项再点「合并同类项」。</div>';
    }
    h += '<div class="wb-h">应用到选中项</div>';
    h += '<div class="wb-apply">' +
      '<label>要动的项（序号，或标签）<input data-wb-field="ref" value="' + esc(dr.ref) + '" placeholder="例如 2"></label>' +
      '<label>哪一边<select data-wb-field="side">' + [['lhs', '左边'], ['rhs', '右边']].map(([v, t]) => '<option value="' + v + '"' + (v === dr.side ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></label>' +
      '<label>两边同除 / 同乘几<input data-wb-field="by" value="' + esc(dr.by) + '" placeholder="例如 3" class="in-by"></label>' +
      '<label>代入（字母 = 数）<input data-wb-field="sub" value="' + esc(dr.sub) + '" placeholder="例如 a=6" class="in-by"></label>' +
      '<label>因式分解的两个根<input data-wb-field="r1" value="' + esc(dr.r1 || '') + '" placeholder="例如 2" class="in-by"><input data-wb-field="r2" value="' + esc(dr.r2 || '') + '" placeholder="例如 3" class="in-by"></label></div>';
    h += '<div class="wb-tools">' + U.Workbench.tools(cur, !!st.formula).map((t) => '<button data-wb-tool="' + t.id + '">' + esc(t.label) + '</button>').join('');
    // 因式分解（任务 I）：作用在选的那一边上，两个根填在上面的输入框里
    if (cur.kind === 'eqn') h += '<button data-wb-rule="factor" title="两个根填在上面的输入框里（首项系数是 1）">因式分解</button>';
    const k = U.Workbench.coef(st);
    if (k) h += '<button data-wb-act="divide-coef">两边同除以 ' + esc(U.Q.show(k)) + '</button>';
    h += '</div>';
    if (dr.msg) h += '<div class="wb-msg">' + esc(dr.msg) + '</div>';
    const pending = U.Workbench.pending(st);
    h += '<div class="wb-h">步骤 ' + (pending ? '<button data-wb-bake="1" title="把上次定型之后的步骤折成一步，不能再改；撤销定型可以回到定型前">定型</button> ' : '') + '<button data-wb-graph="1" title="看每一步用了哪一步的结果（只看，不改历史）">看背后的连线</button></div>';
    h += wbStepRows(st);
    const sol = U.Workbench.solution(st);
    // 几何来的式子：和几何台面的面积对照（读数变了，这里跟着变）
    const note = eq.geo ? U.ExprBench.areaNote(st, area) : null;
    if (note) h += '<div class="' + (note.same === false ? 'wb-msg' : 'wb-note') + '" data-wb-area="' + (note.same === null ? 'open' : note.same ? 'same' : 'off') + '">' + esc(note.text) + '</div>';
    if (sol.solved) h += '<div class="wb-sol">解：' + esc(U.Form.show(cur.data.lhs)) + ' = ' + esc(U.Q.show(sol.x)) + '</div>';
    return h + '</div>';
  }

  // ---------- 竖式工作台（任务 H 第 4 步，§10.5.6）----------
  // 步骤写在台面上（scene.workbench，U.ArithBench），这里只画：算式（点选要拆的数）、竖式（一列一列算，下一列的按钮才出现）、步骤（可撤销）。
  function arHtml(e, dd) {
    const st = U.ArithBench.currentOf(UI.S.scene, e.id, e.props), dr = wbDraft(e.id);
    let h = '<div class="wb ar"><h5>竖式工作台</h5>';
    if (st.start.error) return h + '<div class="wb-msg">' + esc(st.start.error) + '</div></div>';
    h += '<div class="wb-now">现在：<b>' + esc(U.ArithBench.showState(st)) + '</b></div>';
    h += U.ArithBench.isMul2(st.start) ? arMul2Body(st) : arColBody(st, dr);
    if (dr.msg) h += '<div class="wb-msg">' + esc(dr.msg) + '</div>';
    if (st.result !== null) h += '<div class="wb-sol">结果：' + esc(U.ArithBench.resultText(st)) + '</div>';
    h += '<div class="wb-h">步骤</div>';
    const log = U.ArithBench.stepLog(st);
    h += log.length ? st.steps.map((s, i) => '<div class="wb-step"><span>' + esc(log[i]) + '</span><button data-ar-undo="' + (i + 1) + '">撤销到这一步</button></div>').join('') : '<div class="wb-none">还没有步骤</div>';
    return h + '</div>';
  }
  // 竖式（加、减、一位数的乘法）：算式（点选要拆、凑整的数）、竖式（一列一列算）、拆数凑十凑整
  function arColBody(st, dr) {
    let h = '';
    // 算式：每个还没拆的数是一个按钮；竖式开始算以后就不能再拆或凑十
    const parts = U.ArithBench.exprParts(st), free = !st.cols.length;
    if (parts.length) {
      h += '<div class="wb-eq">' + parts.map((x, j) => (j ? '<span class="wb-rel">+</span>' : '') +
        (x.plain && free ? '<button class="wb-chip' + (dr.arTerm === x.k ? ' sel' : '') + '" data-ar-term="' + x.k + '" aria-pressed="' + (dr.arTerm === x.k) + '">' + esc(x.text) + '</button>' : '<span class="ar-part">' + esc(x.text) + '</span>')).join('') + '</div>';
    }
    // 竖式：列对齐（个位对个位）；进位、退位写在上一列的上方；结果写在最下面一行
    const rows = st.rows, base = st.base, N = Math.max(base, st.cols.length + (st.cols.length && st.cols[st.cols.length - 1].carry > 0 ? 1 : 0));
    const cols = []; for (let i = N - 1; i >= 0; i--) cols.push(i);
    const opSym = ['+', '−', '×'][st.start.op];
    let t = '<table class="ar-grid"><tr class="ar-head"><td></td>' + cols.map((i) => '<td>' + esc(U.ArithBench.place(i)) + '</td>').join('') + '</tr>';
    t += '<tr class="ar-carry"><td></td>' + cols.map((i) => '<td data-ar-cell="carry-' + i + '">' + (i > 0 && st.cols[i - 1] && st.cols[i - 1].carry ? st.cols[i - 1].carry : '') + '</td>').join('') + '</tr>';
    rows.forEach((r, k) => {
      t += '<tr><td class="ar-op">' + (k === rows.length - 1 ? opSym : '') + '</td>' + cols.map((i) => '<td data-ar-cell="row-' + k + '-' + i + '">' + (i < U.ArithBench.lenOf(r) ? U.ArithBench.digitAt(r, i) : '') + '</td>').join('') + '</tr>';
    });
    t += '<tr class="ar-ans"><td></td>' + cols.map((i) => '<td data-ar-cell="ans-' + i + '">' + (st.cols[i] ? st.cols[i].digit : '') + '</td>').join('') + '</tr></table>';
    h += t;
    // 下一列（只有一个按钮：列要从个位算起）
    const next = st.cols.length;
    if (U.ArithBench.needNext(st.cols, base)) h += '<div class="wb-tools"><button data-ar-col="' + next + '">算' + esc(U.ArithBench.place(next)) + '</button></div>';
    const tools = U.ArithBench.tools(st);
    if (tools.length && free) h += '<div class="wb-note">先在算式里点选一个数，再拆或凑整；也可以对两个一位数用凑十。</div><div class="wb-tools">' + tools.map((x) => '<button data-ar-tool="' + x.id + '">' + esc(x.label) + '</button>').join('') + '</div>';
    if (U.ArithBench.isNeg(st.start)) h += '<div class="wb-note">被减数比减数小：大数写在上面减，结果是负数，最后写负号。</div>';
    return h;
  }
  // 两位数乘两位数：竖式里一行一个部分积（十位的那一行向左移一位，末尾补 0），最后一行是相加的结果；下一步的按钮只出现一个
  function arMul2Body(st) {
    let h = '<div class="wb-note">两位数乘两位数：每个数位乘一次得到一个部分积，部分积相加就是结果。</div>';
    const N = U.ArithBench.lenOf(st.start.a * st.start.b), cols = [];
    for (let i = N - 1; i >= 0; i--) cols.push(i);
    const row = (sym, v, name) => '<tr><td class="ar-op">' + sym + '</td>' + cols.map((i) => '<td data-ar-cell="' + name + '-' + i + '">' + (i < U.ArithBench.lenOf(v) ? U.ArithBench.digitAt(v, i) : '') + '</td>').join('') + '</tr>';
    let t = '<table class="ar-grid"><tr class="ar-head"><td></td>' + cols.map((i) => '<td>' + esc(U.ArithBench.place(i)) + '</td>').join('') + '</tr>';
    t += row('', st.start.a, 'row-0') + row('×', st.start.b, 'row-1');
    st.parts.forEach((p, k) => { t += row('', p.value, 'pp-' + k); });
    if (st.total !== null) t += '<tr class="ar-ans"><td></td>' + cols.map((i) => '<td data-ar-cell="ans-' + i + '">' + (i < U.ArithBench.lenOf(st.total) ? U.ArithBench.digitAt(st.total, i) : '') + '</td>').join('') + '</tr>';
    h += t + '</table>';
    const k = st.parts.length;
    if (st.total === null && k < U.ArithBench.lenOf(st.start.b)) h += '<div class="wb-tools"><button data-ar-part="' + k + '">算' + esc(U.ArithBench.place(k)) + '的部分积</button></div>';
    else if (st.total === null) h += '<div class="wb-tools"><button data-ar-tool="sum">相加（部分积）</button></div>';
    return h;
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
  function closeDialog() { $('#dlg').classList.remove('open'); const box = document.querySelector('#dlg .box'); if (box) box.classList.remove('sg-wide'); }

  // 来历面板（任务 A）：这个数是怎么来的，一层一层展开到源头
  function whyNode(t, open) {
    const rule = t.rule && U.RULES[t.rule] ? U.RULES[t.rule].label : '';
    let h = '<details' + (open ? ' open' : '') + '><summary><b>' + esc(t.name) + '.' + esc(t.port) + ' = ' + esc(U.showVal(t.value)) + '</b>' + (t.say || rule ? '　<small>' + esc(t.say || rule) + '</small>' : '') + (t.stateful ? '　<small>［' + esc(t.note) + '］</small>' : '') + '</summary>';
    if (t.steps.length) h += '<ul class="wsteps">' + t.steps.map((x) => '<li>' + esc(x.say) + '</li>').join('') + '</ul>';
    if (t.from.length) h += '<div class="wkids">' + t.from.map((c) => whyNode(c, false)).join('') + '</div>';
    return h + '</details>';
  }
  function whyDialog(id, port) {
    const S = UI.S, tree = U.World.explain(S.scene, S.D, id, port);
    if (!tree) return;
    dialog('<h3>这个数是怎么来的</h3><div class="why-tree">' + whyNode(tree, true) + '</div><div class="btnrow"><button class="btn" id="dlg-close">知道了</button></div>');
  }
  // 家长周报（3.1）：本周练了什么、哪里没懂、孩子的原话，以及反复出现的误解
  function parentDialog() {
    const w = U.Learning.parentWeek(U.Events.log, U.problems);
    const pr = w.practiced.length ? w.practiced.map((x) => '<div class="it"><span class="tt">' + esc(x.title) + '</span><small>' + x.score + ' / ' + x.max + (x.missed.length ? '；没达成：' + esc(x.missed.join('、')) : '') + (x.traps.length ? '；踩中：' + esc(x.traps.join('、')) : '') + '</small></div>').join('') : '<p>这一周还没有做题。</p>';
    const qs = w.quotes.length ? w.quotes.map((q) => '<div class="whybox">“' + esc(q.text) + '”</div>').join('') : '';
    const rep = w.repeated.length ? '<div class="warnbox">反复出现的误解：' + w.repeated.map((d) => esc(d.title)).join('、') + '</div>' : '';
    dialog('<h3>家长周报（近 7 天）</h3>' + rep + '<div class="plist">' + pr + '</div>' + qs + '<div class="btnrow"><button class="btn" id="dlg-close">关闭</button></div>');
  }
  // 改进清单（3.5）：按严重程度排序的规则化建议
  function improveDialog() {
    const list = U.Learning.improvements(U.Events.log, U.problems);
    const rows = list.length ? list.map((x) => '<div class="it"><span class="tt">' + esc(x.title) + '</span><small>' + esc(x.advice) + '</small></div>').join('') : '<p>还没有足够的数据给出建议（每道题至少做 3 次）。</p>';
    dialog('<h3>改进清单</h3><p style="color:var(--txt3)">给出题人看的：按严重程度排序。</p><div class="plist">' + rows + '</div><div class="btnrow"><button class="btn" id="dlg-close">关闭</button></div>');
  }
  // 体检表（3.4）：输入知识点编号，看它的达成率、常踩的陷阱、自选错因和最高证据等级
  function healthDialog() {
    dialog('<h3>知识点体检表</h3><p style="color:var(--txt3)">输入知识点编号，例如 4.6</p><div class="btnrow"><input id="hp-point" placeholder="4.6" class="in-type"><button class="btn pri" id="hp-go">看看</button></div><div id="hp-out"></div><div class="btnrow"><button class="btn" id="dlg-close">关闭</button></div>');
  }
  function healthOut(point) {
    const out = document.getElementById('hp-out'); if (!out) return;
    if (!U.CURRICULUM[point]) { out.innerHTML = '<p>知识点表里没有“' + esc(point) + '”。</p>'; return; }
    const h = U.Learning.healthCard(U.Events.log, U.problems, point);
    const rows = h.rows.length ? h.rows.map((r) => '<div class="it"><span class="tt">' + esc(r.title) + '</span><small>做了 ' + r.attempts + ' 次；' + Object.keys(r.rate).map((k) => k + ' ' + Math.round(r.rate[k] * 100) + '%').join('，') + '</small></div>').join('') : '<p>这个知识点还没有做过的题。</p>';
    const tr = h.traps.length ? h.traps.map((t) => '<div class="warnbox">⚠ ' + esc(t.text) + '（' + t.n + ' 次）</div>').join('') : '';
    out.innerHTML = '<h4>' + esc(U.CURRICULUM[point].title) + '</h4>' + rows + tr + '<p><small>证据等级最高：' + esc(U.Evidence.LEVEL_NAME[h.topEvidence] || '') + '</small></p>';
  }
  // 错题本（3.1）：没达成的里程碑和踩过的陷阱，点一下回到那道题
  function wrongDialog() {
    const list = U.Learning.wrongBook(U.Events.log, U.problems);
    if (!list.length) { dialog('<h3>错题本</h3><p>还没有错题。做题之后，没达成的地方会记在这里。</p><div class="btnrow"><button class="btn" id="dlg-close">知道了</button></div>'); return; }
    const rows = list.map((w) => '<div class="it" data-pid="' + esc(w.pid) + '"><span class="tt">' + esc(w.title) + '</span><small>' +
      w.missed.map((m) => '○ ' + esc(m.say)).concat(w.traps.map((t) => '⚠ ' + esc(t))).join('　') + '</small></div>').join('');
    dialog('<h3>错题本</h3><p style="color:var(--txt3)">点一道题，回去再做一遍。</p><div class="plist">' + rows + '</div><div class="btnrow"><button class="btn" id="dlg-close">关闭</button></div>');
  }
  // 实验报告（2.5）：四栏。前三栏系统预填，第四栏学生自己写
  function inquiryHtml(r, p) {
    const c = r.cols, lvl = U.Evidence.LEVEL_NAME[c.found.evidence] || '';
    const col = (t, body) => '<div class="pcard"><b>' + t + '</b>' + body + '</div>';
    const guess = c.guess.prefill !== null ? esc(c.guess.prefill) : '没猜';
    const tried = '<div>完成的里程碑：' + (c.tried.milestones.length || '0') + ' 个</div><div>用了提示：' + c.tried.hints + ' 次</div><div>操作：' + c.tried.opsCount + ' 次</div>' + c.tried.traps.map((t) => '<div class="warnbox">⚠ ' + esc(t) + '</div>').join('');
    const found = '<div><small>证据等级：' + esc(lvl) + '</small></div><div>' + esc(c.found.wording) + '</div>';
    const asks = '<textarea id="asks" placeholder="还想问什么？" class="ta-note"></textarea>';
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
    const nums = Object.values(E).filter((e) => (U.types[e.type] || {}).numberSource && !S.scene.links.some((l) => l.to === e.id)).map((e) => (e.props.d === 1 ? e.props.n : e.props.n + '/' + e.props.d));
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
    rv.domains.forEach((d) => { const pct = d.total ? Math.round((d.done / d.total) * 100) : 0, pm = d.total ? Math.round((d.mastered / d.total) * 100) : 0; h += '<div class="prog-row"><div class="prog-head"><span>' + esc(d.domain) + '</span><span class="txt2">' + d.done + ' / ' + d.total + '　掌握 ' + d.mastered + '</span></div><div class="prog"><i class="done" style="width:' + pct + '%"></i><i class="mastered" style="width:' + pm + '%"></i></div></div>'; });
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
        if (!moved && Math.hypot(e.clientX - sx, e.clientY - sy) > L.DRAG_SLOP) { moved = true; ghost = document.createElement('div'); ghost.id = 'ghost'; ghost.innerHTML = t.querySelector('svg').outerHTML; ghost.firstChild.classList.add('ghost-img'); ghost.firstChild.style.width = L.GHOST.w + 'px'; ghost.firstChild.style.height = L.GHOST.h + 'px'; document.body.appendChild(ghost); }
        if (ghost) { ghost.style.left = e.clientX - L.GHOST.x + 'px'; ghost.style.top = e.clientY - L.GHOST.y + 'px'; }
      };
      const up = (e) => {
        window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up);
        if (ghost) { ghost.remove(); ghost = null; }
        const over = document.elementFromPoint(e.clientX, e.clientY);
        // 从器材架拖进台面：添加和放进容器是一个事务（P1：一次撤销回到拖动之前）
        if (moved && over && over.closest('#stagewrap')) { const w = UI.Space.screenToStage(e); UI.Intent.run('add', { type, x: w.x - L.ADD_CENTER.x, y: w.y - L.ADD_CENTER.y, ev: e }); }
        else if (!moved) { const w = UI.Space.stageCenter(); const sp = UI.Stage.freeSpot(w.x - L.ADD_CLICK.x, w.y - L.ADD_CLICK.y, type); UI.Intent.run('add', { type, x: sp.x, y: sp.y, select: true }); }
      };
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
    });
  }

  // 分享台面：把台面编码成一段文字（超过 8 KB 就只能存文件）
  function shareDialog() {
    const enc = U.Share.encode(UI.S.scene);
    if (enc.mode === 'file') { dialog('<h3>分享台面</h3><p>这个台面太大，放不进一段文字。请用菜单里的「保存台面到文件」。</p><div class="btnrow"><button class="btn" id="dlg-close">知道了</button></div>'); return; }
    dialog('<h3>分享台面</h3><p style="color:var(--txt3);margin-top:0">复制下面这段文字，发给同学或老师。</p><textarea id="sharetext" readonly class="ta-long">' + esc(enc.text) + '</textarea>' +
      '<div class="btnrow"><button class="btn pri" id="dlg-copy">复制</button><button class="btn" id="dlg-close">关闭</button></div>');
  }

  // 我来出题：台面就是答案，学生写题目描述和一条目标，系统做出题自检
  function studentDialog() {
    dialog('<h3>我来出题</h3><p style="color:var(--txt2);margin-top:0">先在台面上搭出你的答案，再写一句题目，并说明同学要搭到什么样子。自检会看：你的台面满足目标，空台面不满足。</p>' +
      '<textarea id="st-desc" placeholder="题目描述，例如：用两张数字卡凑出 5" class="ta-desc"></textarea>' +
      '<div class="btnrow"><label>器材 <input id="st-type" value="num" class="in-type"></label><label>端口 <input id="st-port" value="v" class="in-port"></label>' +
      '<select id="st-op">' + ['=', '>', '<', '>=', '<=', '!='].map((o) => '<option>' + o + '</option>').join('') + '</select>' +
      '<input id="st-value" placeholder="5" class="in-value"></div>' +
      '<div id="st-msg" style="display:none;margin:8px 0"></div>' +
      '<div class="btnrow"><button class="btn pri" id="st-check">自检</button><button class="btn" id="dlg-close">关闭</button></div>');
  }

  // 班级看板（老师）：粘贴学生的结果码，一行一个，按题汇总达成率和常踩的坑
  function boardDialog() {
    dialog('<h3>班级看板</h3><p style="color:var(--txt3);margin-top:0">把学生交回的结果码粘贴进来，一行一个。</p>' +
      '<textarea id="cb-codes" placeholder="每行一个结果码" class="ta-codes"></textarea>' +
      '<div class="btnrow"><button class="btn pri" id="cb-go">汇总</button><button class="btn" id="dlg-close">关闭</button></div>' +
      '<div id="cb-out"></div>');
  }
  function boardOut(text) {
    const lines = String(text).split('\n').map((s) => s.trim()).filter(Boolean), files = [], bad = [];
    if (!lines.length) { $('#cb-out').innerHTML = '<div class="empty">先粘贴结果码。</div>'; return; }
    lines.forEach((l, i) => { try { files.push(U.Share.parseResult(l)); } catch (e) { bad.push(i + 1); } });
    let h = '<p>共 ' + files.length + ' 份结果' + (bad.length ? '；第 ' + bad.join('、') + ' 行看不懂，已跳过' : '') + '</p>';
    const sum = U.Share.classSummary(files, U.problems), ids = Object.keys(sum);
    if (!ids.length) h += '<div class="empty">这些结果里没有做过的题。</div>';
    ids.forEach((pid) => {
      const p = U.problemById(pid), s = sum[pid];
      h += '<div class="pcard"><b>' + esc(p.title) + '</b>（' + s.students + ' 人做过）' + p.milestones.map((m) => '<div>' + esc(m.say) + '：' + Math.round(s.rate[m.id] * 100) + '%</div>').join('');
      const tr = Object.keys(s.traps); if (tr.length) h += '<div style="color:var(--txt3)">常踩的坑：' + tr.map((t) => esc(String(t)) + ' × ' + s.traps[t]).join('，') + '</div>';
      h += '</div>';
    });
    $('#cb-out').innerHTML = h;
  }

  // 菜单里“保存台面到文件”后面加一个“导出图片”（PNG，见 js/ui/export.js）
  (function addExportButton() {
    const menu = $('#menu'), save = menu && menu.querySelector('[data-m="save"]');
    if (!save) return;
    const b = document.createElement('button');
    b.dataset.png = '1'; b.textContent = '导出图片（PNG）';
    b.onclick = () => UI.Export.run();
    save.after(b);
  })();

  UI.Panels = { wbDraft, renderTop, renderLeft, renderShelf, renderInsp, renderClock, shareDialog, studentDialog, boardDialog, boardOut, dialog, closeDialog, reportHtml, inquiryHtml, wrongDialog, whyDialog, parentDialog, improveDialog, healthDialog, healthOut, reportDialog, authorDialog, initShelfDrag, renderAll() { renderTop(); renderLeft(); renderShelf(); renderInsp(); renderClock(); } };
})(window);
