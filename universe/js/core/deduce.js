/* 排除表的内核（2.14b 推理，next-steps.md §8.1）。纯逻辑，不碰界面。
 * 一张表：行是人（people），列分成几组（groups，比如 颜色、宠物），每组的值各占一列。
 * 每个人在每组里恰好一个值；每个值恰好属于一个人。
 *  - 格子三态：未定（u）、不是（n）、是（y）。“灰”的格子 = 不是，或被同一行（组）、同一列的“是”排除。
 *  - 点格子（mark，args { i, j }）：
 *      · 这一格已经被排除：不能点；
 *      · 这一格是它那一组（同一行）或那一列里唯一剩下的可能：直接标“是”（唯一剩下，可以推出结论）；
 *      · 否则：未定 → 不是；不是 → 未定（取消排除）；是 → 未定（取消是）；
 *      · 任何一步如果让某一行（组）或某一列没有可能了，不能做。
 *  - 步骤记在台面 scene.workbench 上：{ host: 表的器材 id, key: keyOf(props), steps: [{ tool, rule, args, kept }] }；
 *    状态从步骤重算（replay），撤销 = 截短步骤后重放。换了人或值（key 变了），旧步骤不用。
 *  - 判题：U.Deduce.judge(scene, q)，q = { yes: { person, value }, no: { person, value }, solved: true }。
 *    yes：这个人是这个值（写出的结论）；no：这一格已经排除；solved：每人每组都排定。
 */
(function (G) {
  'use strict';
  const U = G.U;

  const SPLIT = /[,，、]/, SPLIT_GROUP = /[;；]/;
  const keyOf = (props) => 'deduce|' + String((props && props.people) || '') + '|' + String((props && props.groups) || '');

  // 解析表的属性：people（人名）、groups（“颜色：红,蓝,绿；宠物：猫,狗,兔”，组名可以省略）。错了返回 { error }
  function parse(props) {
    const people = String((props && props.people) || '').split(SPLIT).map((s) => s.trim()).filter(Boolean);
    if (people.length < 2 || people.length > 6) return { error: '人数要在 2 到 6 人之间' };
    if (new Set(people).size !== people.length) return { error: '人名不能重复' };
    const raw = String((props && props.groups) || '').split(SPLIT_GROUP).map((s) => s.trim()).filter(Boolean);
    if (!raw.length || raw.length > 3) return { error: '属性要分 1 到 3 组（组与组之间用分号隔开）' };
    const groups = [], cols = [];
    for (let g = 0; g < raw.length; g++) {
      const m = raw[g].match(/^([^：:]*)[：:](.*)$/);
      const name = m ? m[1].trim() : '';
      const vals = (m ? m[2] : raw[g]).split(SPLIT).map((s) => s.trim()).filter(Boolean);
      if (vals.length !== people.length) return { error: '第 ' + (g + 1) + ' 组要有 ' + people.length + ' 个值（和人数一样）' };
      groups.push({ name, from: cols.length, n: vals.length });
      for (const v of vals) cols.push({ name: v, g });
    }
    if (new Set(cols.map((c) => c.name)).size !== cols.length) return { error: '值不能重名（判题按值的名字找）' };
    return { people, groups, cols };
  }

  // 表的状态：表的结构（people、groups、cols）加上格子 cells[i][j]（'u' / 'n' / 'y'）
  function start(props) {
    const M = parse(props);
    if (M.error) return null;
    return Object.assign({}, M, { cells: M.people.map(() => M.cols.map(() => 'u')) });
  }

  const groupCols = (st, j) => st.cols.map((c, k) => k).filter((k) => st.cols[k].g === st.cols[j].g);
  // 同一行（同一组）或同一列有别的“是”：这一格被排除
  function excluded(st, cells, i, j) {
    for (const k of groupCols(st, j)) if (k !== j && cells[i][k] === 'y') return true;
    for (let r = 0; r < st.people.length; r++) if (r !== i && cells[r][j] === 'y') return true;
    return false;
  }
  // 灰：标了“不是”，或被排除
  const out = (st, cells, i, j) => cells[i][j] === 'n' || excluded(st, cells, i, j);
  // 唯一剩下：同一组（同一行）里别的格子都灰了，或者同一列里别的人都灰了
  function onlyLeft(st, cells, i, j) {
    const row = groupCols(st, j).filter((k) => k !== j).every((k) => out(st, cells, i, k));
    const col = st.people.map((_, r) => r).filter((r) => r !== i).every((r) => out(st, cells, r, j));
    return row || col;
  }
  // 每个人在每组里都还有可能；每个值都还有人可能
  function consistent(st, cells) {
    for (let i = 0; i < st.people.length; i++) {
      for (const g of st.groups) {
        let any = false;
        for (let j = g.from; j < g.from + g.n; j++) if (!out(st, cells, i, j)) any = true;
        if (!any) return false;
      }
    }
    for (let j = 0; j < st.cols.length; j++) if (!st.people.some((_, i) => !out(st, cells, i, j))) return false;
    return true;
  }
  const countYes = (st) => st.cells.reduce((a, row) => a + row.filter((x) => x === 'y').length, 0);
  const solved = (st) => countYes(st) === st.people.length * st.groups.length;

  // 点一格：返回 { ok, why, msg, state, step }。msg 是给学生看的说明；step 记在台面上
  function apply(st, tool, args) {
    const a = args || {}, fail = (why) => ({ ok: false, why, state: st });
    if (tool !== 'mark') return fail('没有这个操作：' + tool);
    const i = a.i, j = a.j;
    if (!Number.isInteger(i) || i < 0 || i >= st.people.length || !Number.isInteger(j) || j < 0 || j >= st.cols.length) return fail('没有这一格');
    const cur = st.cells[i][j], who = st.people[i] + ' ' + st.cols[j].name;
    if (cur !== 'y' && excluded(st, st.cells, i, j)) return fail('这一格已经被排除了：同一行或同一列已经有“是”');
    let next, msg;
    if (cur === 'y') { next = 'u'; msg = '取消“是”：' + who; }
    else if (onlyLeft(st, st.cells, i, j)) { next = 'y'; msg = '唯一剩下，可以推出：' + st.people[i] + ' 是 ' + st.cols[j].name; }
    else if (cur === 'u') { next = 'n'; msg = '排除：' + st.people[i] + ' 不是 ' + st.cols[j].name; }
    else { next = 'u'; msg = '取消排除：' + who; }
    const cells = st.cells.map((row) => row.slice());
    cells[i][j] = next;
    if (!consistent(st, cells)) return fail('这一步会让某一行（或某一列）没有可能了，不能做');
    return { ok: true, why: '', msg, state: Object.assign({}, st, { cells }), step: { tool: 'mark', rule: 'deduce.mark', args: { i, j, from: cur, to: next }, kept: true } };
  }

  function replay(st0, steps) {
    let st = st0;
    for (const s of steps || []) {
      const r = apply(st, s.tool, s.args);
      if (!r.ok) throw new Error('重放失败：' + r.why);
      st = r.state;
    }
    return st;
  }

  // 步骤的文字（历史列表用）：小刚 蓝：不是 / 是 / 取消是 / 取消排除
  function stepText(M, s) {
    const a = s.args || {};
    const label = a.to === 'n' ? '不是' : a.to === 'y' ? '是' : a.from === 'y' ? '取消是' : '取消排除';
    return M.people[a.i] + ' ' + M.cols[a.j].name + '：' + label;
  }

  // 界面用的视图：每一格的状态（y 是 / n 不是 / x 已排除 / u 未定）、唯一剩下的标记、结论、进度和提示
  function view(st) {
    let yes = 0;
    const rows = st.people.map((name, i) => ({
      name,
      cells: st.cols.map((c, j) => {
        const s = st.cells[i][j], x = s !== 'y' && excluded(st, st.cells, i, j);
        const shown = s === 'y' ? 'y' : x ? 'x' : s;   // x：被别的“是”排除（灰）；n：标了不是（灰）；u：未定
        if (s === 'y') yes++;
        const label = { y: '是', n: '不是', x: '已排除', u: '未定' }[shown];
        return { i, j, value: c.name, st: shown, only: shown === 'u' && onlyLeft(st, st.cells, i, j), text: shown === 'y' ? '是' : shown === 'n' ? '不是' : '', label };
      }),
    }));
    const total = st.people.length * st.groups.length;
    const onlyCount = rows.reduce((a, r) => a + r.cells.filter((c) => c.only).length, 0);
    const conclusions = [];
    rows.forEach((r) => r.cells.forEach((c) => { if (c.st === 'y') conclusions.push(r.name + ' 是 ' + c.value); }));
    return {
      people: st.people, groups: st.groups, cols: st.cols, rows, yes, total, conclusions,
      now: yes === total ? '每人每一组都已经排定' : '已经排定 ' + yes + ' / ' + total + ' 项',
      hint: onlyCount ? '有格子只剩一种可能（虚线框）：点一下，标“是”' : yes === total ? '' : '不是的格子点一下标“不是”，同一行或同一列只剩一格时，点它就标“是”',
      solved: yes === total,
    };
  }

  // 台面上记的步骤：属于这台表、这个记号才算
  function stateOf(scene, id) {
    const wb = scene && scene.workbench, e = scene && scene.entities && scene.entities[id];
    if (!e || !wb || wb.host !== id || wb.key !== keyOf(e.props) || !Array.isArray(wb.steps) || !wb.steps.length) return null;
    try { return replay(start(e.props), wb.steps); } catch (err) { return null; }
  }
  const current = (scene, id) => stateOf(scene, id) || start((scene.entities[id] || {}).props);

  // 判题：q = { yes: { person, value }, no: { person, value }, solved: true }
  function judge(scene, q) {
    const wb = scene && scene.workbench;
    const host = wb && scene.entities[wb.host];
    if (!host || host.type !== 'deduce') return { ok: false, why: '还没有用排除表' };
    if (wb.key !== keyOf(host.props)) return { ok: false, why: '排除表的记录和现在的表对不上' };
    let st;
    try { st = replay(start(host.props), wb.steps); } catch (err) { return { ok: false, why: '排除表的步骤有错：' + err.message }; }
    const find = (x) => {
      const i = st.people.indexOf(x.person), j = st.cols.findIndex((c) => c.name === x.value);
      return i < 0 || j < 0 ? null : { i, j };
    };
    const q2 = q || {};
    if (q2.yes) {
      const c = find(q2.yes);
      if (!c) return { ok: false, why: '表里没有“' + q2.yes.person + '”或“' + q2.yes.value + '”' };
      if (st.cells[c.i][c.j] !== 'y') return { ok: false, why: '还没有写出结论：' + q2.yes.person + ' 是 ' + q2.yes.value };
    }
    if (q2.no) {
      const c = find(q2.no);
      if (!c) return { ok: false, why: '表里没有“' + q2.no.person + '”或“' + q2.no.value + '”' };
      if (!out(st, st.cells, c.i, c.j)) return { ok: false, why: '还没有排除：' + q2.no.person + ' 不是 ' + q2.no.value };
    }
    if (q2.solved && !solved(st)) return { ok: false, why: '还没有排完：每人每一组都要定下来' };
    return { ok: true, why: '' };
  }

  U.Deduce = { parse, keyOf, start, apply, replay, view, stateOf, current, judge, solved, out, stepText };
})(typeof globalThis !== 'undefined' ? globalThis : window);
