/* 问题结构（设计 v2 §2.1）：问题是一份数据，lint 在它进题库之前检查结构。
 * 不检查内容好不好，只检查结构对不对、哪些写法需要解释。
 *
 * 字段：id、title（必须）；points、alias、level、rung、shelf、workbench、hook、scene、predict、
 *       milestones（必须）、traps、goal、explain、variant、params、exam、why、claim、evidence；
 *       出题人控制（§10.5.9 第 10 条）：shelfOnly（器材架只列 shelf，其它隐藏）、tools（工作区工具白名单）、
 *       rename、deleteGiven（能不能改名、删题目给的图形，默认都能）
 * workbench：打开题目时进入的工作台（见 U.WORKBENCHES）。默认 'graph'（关系画布）；'geometry' 的器材架只列几何工作台的器材
 * 里程碑 / 陷阱的条件：when（数据形式，首选）或 test（函数，兜底；必须写 why_code 说明原因）
 * level：core 核心 / trap 陷阱 / stretch 延伸（深到奥数，结论必须走到证明）
 * rung：台阶 1–6（见 §2.2）
 * evidence：这道题要求的证据等级 1–4（见 §2.7）；claim 是结论的说法 */
(function (G) {
  'use strict';
  const U = G.U;

  U.PROBLEM = {
    LEVELS: ['core', 'trap', 'stretch'],
    FORMS: ['pick', 'place', 'more-less', 'number', 'type'],
    RUNG_MAX: 6,
    FUNC_RATIO_MAX: 0.2,
    // 结论里出现这些词，就是在说“对所有情况”，需要穷举或证明
    UNIVERSAL: /所有|任意|一定|每一个|总是/,
  };

  const isFn = (c) => typeof c === 'function';
  const cond = (x) => (x.when !== undefined ? x.when : x.test);

  // 检查一道题。返回 {errors:[], warnings:[], fnCount, condCount}
  U.problemLint = function (p) {
    const errors = [], warnings = [];
    const err = (m) => errors.push(m), warn = (m) => warnings.push(m);
    const P = U.PROBLEM;
    if (!p || typeof p.id !== 'string' || !p.id) { err('缺 id'); return { errors, warnings, fnCount: 0, condCount: 0 }; }
    if (typeof p.title !== 'string' || !p.title) err('缺 title');
    if (!Array.isArray(p.milestones) || !p.milestones.length) err('至少要有 1 个里程碑');
    if (p.points === undefined) warn('没写 points（知识点）');
    else if (!Array.isArray(p.points) || !p.points.every((x) => typeof x === 'string')) err('points 要是知识点编号的数组');
    if (p.alias !== undefined && !Array.isArray(p.alias)) err('alias 要是数组');
    if (p.shelf !== undefined && !Array.isArray(p.shelf)) err('shelf 要是器材类型的数组');
    if (p.workbench !== undefined && !U.WORKBENCHES.includes(p.workbench)) err('workbench 只能是 ' + U.WORKBENCHES.join(' / ') + '（默认 graph，即关系画布）');
    else if (p.workbench !== undefined && p.workbench !== 'graph' && Array.isArray(p.shelf)) {
      // 器材架上的器材如果不在这个工作台的声明里，学生在这个工作台里看不到它（只提醒，不挡）
      p.shelf.forEach((t) => { if (U.types[t] && !U.onWorkbenchShelf(U.types[t], p.workbench)) warn('器材架上的 ' + t + ' 不在「' + p.workbench + '」工作台的器材里，这个工作台的器材架不会列出它'); });
    }
    if (p.level !== undefined && !P.LEVELS.includes(p.level)) err('level 只能是 ' + P.LEVELS.join(' / '));
    if (p.rung === undefined) warn('没写 rung（台阶 1–6）');
    else if (!Number.isInteger(p.rung) || p.rung < 1 || p.rung > P.RUNG_MAX) err('rung 只能是 1–' + P.RUNG_MAX + ' 的整数');
    if (p.evidence !== undefined && !(Number.isInteger(p.evidence) && p.evidence >= 1 && p.evidence <= 4)) err('evidence 只能是 1–4 的整数');
    const ev = p.evidence === undefined ? 1 : p.evidence;
    if (p.level === 'stretch') {
      if (p.evidence === undefined) warn('延伸题没写 evidence，默认按 ① 检查');
      else if (ev < 4) err('延伸题必须走到证明：evidence 要是 ④（结构证明），至少 ③');
    }
    if (p.claim !== undefined) {
      if (typeof p.claim !== 'string') err('claim 要是字符串');
      else if (P.UNIVERSAL.test(p.claim) && ev < 3 && !p.scope) err('结论含“所有/任意/一定”，目标等级须为 ③ 或 ④，或写明 scope（范围）');
    }
    if (p.predict != null) {
      if (p.predict.form !== undefined && !P.FORMS.includes(p.predict.form)) err('predict.form 只能是 ' + P.FORMS.join(' / '));
      if (p.predict.form === undefined && !(Array.isArray(p.predict.options) && p.predict.options.length >= 2)) err('predict 要有 options（至少 2 个选项）或写 form');
      const pr = p.predict, f = pr.form;
      if (f === 'pick' && !(Array.isArray(pr.options) && pr.options.length >= 2)) err('pick 的 predict 要有 options（至少 2 个选项）');
      if (f === 'place') {
        if (!(Array.isArray(pr.slots) && pr.slots.length >= 2)) err('place 的 predict 要有 slots（至少 2 个位置）');
        else if (!Number.isInteger(pr.answer) || pr.answer < 0 || pr.answer >= pr.slots.length) err('place 的 predict 要有 answer（slots 的下标，整数）');
      }
      if (f === 'more-less') {
        if (typeof pr.ref !== 'string' || !pr.ref.trim()) err('more-less 的 predict 要有 ref（参照的东西）');
        if (!['more', 'less', 'same'].includes(pr.answer)) err('more-less 的 predict 要有 answer，只能是 more / less / same');
      }
      if (f === 'number') {
        let ok = typeof pr.answer === 'string';
        if (ok) { try { U.Q.parse(pr.answer); } catch (e) { ok = false; } }
        if (!ok) err('number 的 predict 要有 answer（精确数字的文字，比如 12 或 3/4）');
      }
      if (f === 'type') {
        if (typeof pr.answer !== 'string' || !pr.answer.trim()) err('type 的 predict 要有 answer（非空文字）');
        if (pr.accept !== undefined && !Array.isArray(pr.accept)) err('type 的 predict.accept 要是数组');
      }
    }

    // 出题人控制（§10.5.9 第 10 条）：器材架只列 shelf（shelfOnly 时其它隐藏，否则变灰）；工具白名单；能不能改名、删题目给的图形
    if (p.shelfOnly !== undefined) {
      if (typeof p.shelfOnly !== 'boolean') err('shelfOnly 要是 true 或 false');
      else if (p.shelfOnly && !Array.isArray(p.shelf)) err('shelfOnly: true 要和 shelf（器材列表）一起写');
    }
    if (p.tools !== undefined) {
      if (!Array.isArray(p.tools) || !p.tools.every((x) => typeof x === 'string')) err('tools 要是工作区工具 id 的数组');
      else {
        const known = U.workspaceToolIds();
        p.tools.forEach((t) => { if (!known.includes(t)) err('tools 里的 ' + t + ' 不是工作区工具（只认 ' + known.join('、') + '）'); });
      }
    }
    if (p.rename !== undefined && typeof p.rename !== 'boolean') err('rename 要是 true 或 false（能不能改名）');
    if (p.deleteGiven !== undefined && typeof p.deleteGiven !== 'boolean') err('deleteGiven 要是 true 或 false（能不能删题目给的图形）');

    // 数据形式的新条件（任务 I）：built / form / steps，只认下面列出的字段
    const NEW = {
      built: { fields: ['rule', 'of'] },
      form: { fields: ['role', 'is'] },
      steps: { fields: ['used', 'allKept'] },
      digits: { fields: ['solved'] },                       // 数位竖式写完了（D8）
      data: { fields: ['minRows', 'plotted', 'fitted'] },   // 数据图表台：录了几组、画了图、拟合了（D8）
      deduce: { fields: ['yes', 'no', 'solved'] },           // 排除表（2.14b）：写出结论、排除了一格、排完了
    };
    const lintNew = (c, where) => {
      const pre = where + ' ' + (c.id || '') + ' ';
      for (const key of Object.keys(NEW)) {
        if (c[key] === undefined) continue;
        const body = c[key];
        if (!body || typeof body !== 'object' || Array.isArray(body)) { err(pre + key + ' 要是对象'); continue; }
        for (const k of Object.keys(body)) if (!NEW[key].fields.includes(k)) err(pre + key + ' 里有未知字段“' + k + '”（只认 ' + NEW[key].fields.join('、') + '）');
        if (key === 'built') {
          const types = U.Judge ? U.Judge.BUILT_TYPE : {};
          if (!Object.prototype.hasOwnProperty.call(types, body.rule)) err(pre + 'built.rule 只能是 ' + Object.keys(types).join(' / '));
          if (!(Array.isArray(body.of) && body.of.length === 2 && body.of.every((n) => typeof n === 'string' && n.trim()))) err(pre + 'built.of 要是两个名字（字符串数组，长度为 2）');
        }
        if (key === 'form') {
          const kinds = ['reduced-fraction', 'collected', 'factored', 'place-value'];
          if (typeof body.role !== 'string' || !body.role.trim()) err(pre + 'form.role 要是角色名（非空文字）');
          if (!kinds.includes(body.is)) err(pre + 'form.is 只能是 ' + kinds.join(' / '));
        }
        if (key === 'deduce') {
          for (const k of ['yes', 'no']) {
            const x = body[k];
            if (x !== undefined && !(x && typeof x.person === 'string' && typeof x.value === 'string' && x.person.trim() && x.value.trim())) err(pre + 'deduce.' + k + ' 要写 { person, value }（人名和值，都是非空文字）');
          }
          if (body.solved !== undefined && body.solved !== true) err(pre + 'deduce.solved 只能是 true');
        }
        if (key === 'steps') {
          if (typeof body.used !== 'string' || !body.used.trim()) err(pre + 'steps.used 要是规则编号（非空文字）');
          else if (U.RULES && !U.RULES[body.used]) warn(pre + '规则“' + body.used + '”还没有注册，这个条件暂时满足不了');
          if (body.allKept !== undefined && typeof body.allKept !== 'boolean') err(pre + 'steps.allKept 要是 true 或 false');
        }
      }
    };

    const ids = {}; let fnCount = 0, condCount = 0;
    const checkCond = (x, where) => {
      const c = cond(x);
      if (c === undefined) { err(where + ' ' + x.id + ' 缺 when（或 test）'); return; }
      condCount++;
      if (!isFn(c)) lintNew(Object.assign({ id: x.id }, c), where);
      if (isFn(c)) { fnCount++; if (!x.why_code) warn(where + ' ' + x.id + ' 用了函数形式，建议写 why_code 说明为什么数据写不出来'); }
    };
    (p.milestones || []).forEach((m) => {
      if (!m || typeof m.id !== 'string') { err('里程碑缺 id'); return; }
      if (ids[m.id]) err('里程碑 id 重复：' + m.id); ids[m.id] = true;
      if (typeof m.score !== 'number' || m.score < 0) err('里程碑 ' + m.id + ' 的 score 要是非负数');
      checkCond(m, '里程碑');
      if (m.hints !== undefined && (!Array.isArray(m.hints) || m.hints.length !== 3)) warn('里程碑 ' + m.id + ' 的 hints 应为三层（方向、器材、做法）');
    });
    if (p.goal !== undefined) {
      if (!Array.isArray(p.goal)) err('goal 要是里程碑 id 的数组');
      else p.goal.forEach((g) => { if (!ids[g]) err('goal 指向不存在的里程碑：' + g); });
    }
    (p.traps || []).forEach((t) => {
      if (!t || typeof t.id !== 'string') { err('陷阱缺 id'); return; }
      if (typeof t.wrong !== 'string') err('陷阱 ' + t.id + ' 缺 wrong（学生容易犯的误解）');
      checkCond(t, '陷阱');
    });
    return { errors, warnings, fnCount, condCount };
  };

  // 出题人控制的读法（§10.5.9 第 10 条）：没写字段就是默认值，老题的行为不变
  U.problemRules = (p) => ({
    rename: !p || p.rename !== false,
    deleteGiven: !p || p.deleteGiven !== false,
    shelfOnly: !!(p && p.shelfOnly),
    tools: p && Array.isArray(p.tools) ? p.tools.slice() : null,
  });
  // 这个工作区工具对学生可用吗（没有 tools 白名单就都可用）
  U.problemToolAllowed = (p, id) => !p || !Array.isArray(p.tools) || p.tools.includes(id);
  // 所有工作区工具的 id（器材声明的 workspace.tools）
  U.workspaceToolIds = () => {
    const ids = [];
    for (const d of Object.values(U.types)) for (const t of (d.workspace && d.workspace.tools) || []) if (!ids.includes(t.id)) ids.push(t.id);
    return ids;
  };
  // 题目给的图形：题目 build 出来的器材 id（学生之后加的器材编号都更大，不会混进来）
  U.problemGivenIds = (p) => {
    const out = new Set();
    if (!p || typeof p.build !== 'function') return out;
    try { Object.keys(p.build().entities).forEach((id) => out.add(id)); } catch (e) { /* 建不出来就当没有题目给的图形 */ }
    return out;
  };

  // 对整个题库检查：错误按题列出；函数形式占比超过上限时给出警告
  U.problemLintAll = function (list) {
    const byId = {}, warnings = [];
    let fn = 0, total = 0;
    for (const p of list) {
      const r = U.problemLint(p);
      if (r.errors.length) byId[p.id || '?'] = r.errors;
      fn += r.fnCount; total += r.condCount;
    }
    const ratio = total ? fn / total : 0;
    if (ratio > U.PROBLEM.FUNC_RATIO_MAX) warnings.push('函数形式的条件占 ' + Math.round(ratio * 100) + '%，超过 ' + Math.round(U.PROBLEM.FUNC_RATIO_MAX * 100) + '% 的上限');
    return { errors: byId, warnings, functionRatio: ratio, functionCount: fn, conditionCount: total };
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
