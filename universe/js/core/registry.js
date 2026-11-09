/* 器材注册表：一种器材 = 一个对象，加器材只改这一处。
 *
 * 器材合同（字段）：
 *   label, prefix, group, grades:[最低,最高], icon(): 器材架缩略图 SVG 内容（64×44）
 *   props:   { k: {type:'num'|'int'|'choice'|'bool'|'text', label, default, min, max, step, choices, write} }
 *            每个可写属性自动带一个输入口 'p.<k>'：连上线就由上游驱动。
 *   inputs:  { port: {kind, label, many} }       outputs: { port: {kind, label} }
 *   二选一：
 *     compute(ctx) -> { port: Val|null }          无状态：纯函数，不得改 ctx
 *     step(ctx) -> newState （配 init(props) 和 read(ctx) -> {port: Val}）  有状态：随世界时钟走一拍
 *   sig(ctx, say)   可选：信号条。say(level, text)，level = ok|info|warn|err|reject
 *                   reject = 这样连/这样改不行（连线时被拒绝并说出原因）
 *   size(ent) -> [w,h]   draw(c) -> SVG 字符串（卡片内容区）   badge(c) -> 标题右侧读数
 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q;
  U.types = {};
  U.packs = {};
  U.GROUPS = ['数与运算', '分数', '图形', '关系', '函数', '统计与概率', '时间与变化'];

  const PROP_TYPES = ['num', 'int', 'choice', 'bool', 'text'];

  U.define = function (id, def) {
    // 器材 id 必须唯一：重名时保留先定义的，记一条错误（不悄悄覆盖）
    if (U.types[id] && U.types[id] !== def) {
      (U.packErrors = U.packErrors || []).push('器材 id 重复：' + id + '（' + (U.types[id].pack || '?') + ' 已有，' + (def.pack || '?') + ' 又定义了一次）');
      return U.types[id];
    }
    def.id = id;
    def.prefix = def.prefix || def.label;
    def.grades = def.grades || [1, 9];
    def.alias = def.alias || [];
    def.props = def.props || {};
    def.inputs = def.inputs || {};
    def.outputs = def.outputs || {};
    for (const k in def.props) {
      const P = def.props[k];
      P.k = k; P.write = P.write !== false; P.label = P.label || k;
      if (P.type === 'num' && P.step === undefined) P.step = 1;
    }
    for (const k in def.inputs) { def.inputs[k].many = !!def.inputs[k].many; def.inputs[k].label = def.inputs[k].label || k; }
    for (const k in def.outputs) { def.outputs[k].label = def.outputs[k].label || k; }
    def.stateful = typeof def.step === 'function';
    if (def.stateful && !def.init) def.init = () => ({});
    U.types[id] = def;
    return def;
  };

  U.defaultProps = (def, given) => {
    const p = {};
    for (const k in def.props) p[k] = given && given[k] !== undefined ? given[k] : def.props[k].default;
    return p;
  };

  // 把任意输入变成属性合法值；不合法就说为什么（不悄悄改）
  // 1.1.1 属性控件自动选型：按属性声明选控件；器材可用 control 覆盖，覆盖值要合法（lint 检查）。
  const CONTROLS = { segment: ['choice'], select: ['choice'], switch: ['bool'], stepper: ['int', 'num'], slider: ['int', 'num'], dial: ['num', 'int'], expr: ['expr'], text: ['text'], fact: ['text'], rule: ['text'], grid: ['text'] };
  U.CONTROLS = CONTROLS;
  U.controlFor = (P) => {
    if (P.control) return P.control;
    if (P.kind === 'expr') return 'expr';
    if (P.type === 'choice') return P.choices.length >= 2 && P.choices.length <= 5 ? 'segment' : 'select';
    if (P.type === 'bool') return 'switch';
    if (P.type === 'text') return 'text';
    if (P.dim === '角度') return 'dial';
    if (P.type === 'int' && P.min !== undefined && P.max !== undefined && P.max - P.min <= 20) return 'stepper';
    return 'slider';
  };
  U.coerceProp = (P, x) => {
    if (!P) return { ok: false, why: '没有这个属性' };
    if (P.type === 'text') return { ok: true, v: String(x === undefined || x === null ? '' : x) };
    if (P.type === 'bool') return { ok: true, v: !!x };
    let v;
    if (x && typeof x === 'object' && 'n' in x) v = U.Q.num(x); else v = Number(x);
    if (!Number.isFinite(v)) return { ok: false, why: '要填一个数' };
    if (P.type === 'choice') {
      if (!Number.isInteger(v) || v < 0 || v >= P.choices.length) return { ok: false, why: '只能选 ' + P.choices.join(' / ') };
      return { ok: true, v };
    }
    if (P.type === 'int' && !Number.isInteger(v)) return { ok: false, why: '要填整数' };
    if (P.min !== undefined && v < P.min) return { ok: false, why: '「' + P.label + '」最小是 ' + P.min };
    if (P.max !== undefined && v > P.max) return { ok: false, why: '「' + P.label + '」最大是 ' + P.max };
    return { ok: true, v };
  };

  // 1.8 包的依赖：needs: ['core@1', …]。依赖缺失或版本太低，记入 U.packErrors（check-types 与测试会报）。
  U.packErrors = [];
  const needOK = (need, owner) => {
    const m = /^([a-z0-9_-]+)(?:@(\d+))?$/i.exec(need);
    if (!m) { U.packErrors.push(owner + ' 的依赖写法不对：' + need); return; }
    const dep = U.packs[m[1]];
    if (!dep) U.packErrors.push(owner + ' 需要的包 ' + m[1] + ' 还没加载');
    else if (m[2] && dep.version < +m[2]) U.packErrors.push(owner + ' 需要 ' + m[1] + '@' + m[2] + '，当前只有 ' + dep.version);
  };
  U.packsFor = (scene) => {
    const want = new Set();
    const add = (pid) => { if (!pid || want.has(pid) || !U.packs[pid]) return; want.add(pid); for (const n of U.packs[pid].needs) add(String(n).split('@')[0]); };
    for (const e of Object.values(scene.entities || {})) { const d = U.types[e.type]; if (d) add(d.pack); }
    return [...want];
  };
  U.registerPack = function (pack) {
    U.packs[pack.id] = { id: pack.id, version: pack.version || 1, needs: pack.needs || [], types: [] };
    for (const n of (pack.needs || [])) needOK(n, pack.id);
    for (const id in (pack.kinds || {})) U.defineKind(id, pack.kinds[id]);
    for (const id in (pack.types || {})) { pack.types[id].pack = pack.id; U.define(id, pack.types[id]); U.packs[pack.id].types.push(id); }
  };

  // ---- lint：进不了注册表的器材 ----
  const deepFreeze = (o) => { if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); for (const k of Object.keys(o)) deepFreeze(o[k]); } return o; };

  // 声明式角色（U7，docs/ui-robustness.md 4.4）：器材在工作区里是什么，由它自己声明，界面不认具体器材名。
  //   workspaceRole：'container'（容器，如几何工作区，要有 slots 和 workspace 配置）、'piece'（块，可拖、可转、可翻）、
  //                 'step'（步骤，进步骤清单，stepLabel 给清单里的名字）、'point'（自由点，图形的顶点可以拖）、'none'（普通卡片）
  //   handles：有没有缩放把手（true / false）
  //   其他可选声明：stepLabel（步骤名，字符串或 (ent, scene) => 字符串）、splitsPieces（剪开：输出的块在工作区里单独画）、
  //                 figEdit（'place'：图形用摆放的把手改）、inspector（'workbench'：属性面板里附带工作台）、
  //                 numberSource（数字来源，可以从台面上选）、hidden（不列在器材架上）
  U.WS_ROLES = ['container', 'piece', 'step', 'point', 'none'];
  U.roleOf = (ent) => { const d = ent && U.types[ent.type]; return (d && d.workspaceRole) || 'none'; };

  U.lintType = function (def) {
    const errors = [], exempt = [];
    const err = (m) => errors.push(m);
    if (!def.label) err('缺 label');
    if (U.checkEssence) U.checkEssence(def.essence).forEach((m) => err(m));
    if (!U.GROUPS.includes(def.group)) err('group 不在器材架分组里：' + def.group);
    if (!U.WS_ROLES.includes(def.workspaceRole)) err('workspaceRole 要是 ' + U.WS_ROLES.join(' / ') + ' 之一（在工作区里是什么角色）');
    if (typeof def.handles !== 'boolean') err('handles 要写 true 或 false（有没有缩放把手）');
    if (def.workspaceRole === 'container' && !def.slots) err('容器（workspaceRole: container）要有 slots，放进去的东西放哪里');
    if (def.workspace && def.workspaceRole !== 'container') err('只有 workspaceRole: container 的器材才能有 workspace 配置');
    if (def.stepLabel !== undefined && (def.workspaceRole !== 'step' || !(typeof def.stepLabel === 'string' || typeof def.stepLabel === 'function'))) err('stepLabel 只给步骤（workspaceRole: step），且要是字符串或函数');
    if (def.splitsPieces !== undefined && (def.workspaceRole !== 'step' || typeof def.splitsPieces !== 'boolean')) err('splitsPieces 只给步骤，且要是 true / false');
    if (def.figEdit !== undefined && def.figEdit !== 'place') err('figEdit 目前只认 place');
    if (def.inspector !== undefined && def.inspector !== 'workbench') err('inspector 目前只认 workbench');
    if (def.numberSource !== undefined && typeof def.numberSource !== 'boolean') err('numberSource 要是 true / false');
    if (def.hidden !== undefined && typeof def.hidden !== 'boolean') err('hidden 要是 true / false（不列在器材架上）');
    if (typeof def.icon !== 'function') err('缺 icon()，器材架每个器材都要有缩略图');
    if (typeof def.size !== 'function') err('缺 size(ent)');
    if (typeof def.draw !== 'function') err('缺 draw(c)');
    if (def.late) {
      // 后算的器材的输入口只能连别的后算器材（连线规则在 world.link 里检查）；它本身不能有状态
      if (def.stateful) err('后算的器材不能同时是有状态的');
    }
    const outs = Object.keys(def.outputs);
    if (!outs.length) err('至少要有 1 个输出口（没有输出口就是孤岛）');
    for (const k of outs) if (!U.KINDS[def.outputs[k].kind]) err('输出口 ' + k + ' 的 kind 没注册：' + def.outputs[k].kind);
    for (const k of outs) if (!('dim' in def.outputs[k])) err('输出口 ' + k + ' 没有声明 dim（无量纲写 dim: null，有量纲写维度名或 \'=in\'）');
    for (const k of Object.keys(def.inputs)) if (!U.KINDS[def.inputs[k].kind] && def.inputs[k].kind !== 'any') err('输入口 ' + k + ' 的 kind 没注册：' + def.inputs[k].kind);
    for (const sn in (def.slots || {})) {
      const S = def.slots[sn];
      if (!(S.accepts === '*' || Array.isArray(S.accepts))) err('槽位 ' + sn + ' 的 accepts 要是数组或 '*'');
      if (!(S.max === null || (Number.isInteger(S.max) && S.max > 0))) err('槽位 ' + sn + ' 的 max 要是正整数或 null');
      if (!U.LAYOUTS || !(S.layout in U.LAYOUTS)) err('槽位 ' + sn + ' 的 layout 不认识：' + S.layout);
    }
    const hasC = typeof def.compute === 'function', hasS = typeof def.step === 'function';
    if (hasC === hasS) err('compute 和 step 必须有且只有一个');
    if (hasS && typeof def.read !== 'function') err('有状态器材要有 read(ctx)：状态怎么变成输出');
    for (const k in def.props) {
      const P = def.props[k];
      if (!PROP_TYPES.includes(P.type)) err('属性 ' + k + ' 的 type 不合法：' + P.type);
      if (P.type === 'choice' && !(P.choices && P.choices.length)) err('属性 ' + k + ' 是 choice 但没有 choices');
      if (P.default === undefined) err('属性 ' + k + ' 缺 default');
      if (P.control !== undefined) {
        if (!CONTROLS[P.control]) err('属性 ' + k + ' 的 control 不认识：' + P.control);
        else if (!CONTROLS[P.control].includes(P.type === 'choice' || P.type === 'bool' || P.type === 'text' ? P.type : (P.kind === 'expr' ? 'expr' : P.type))) err('属性 ' + k + ' 的 control=' + P.control + ' 和类型 ' + P.type + ' 不匹配');
      }
      const r = U.coerceProp(P, P.default);
      if (!r.ok) err('属性 ' + k + ' 的 default 自己就不合法：' + r.why);
    }
    const writable = Object.keys(def.props).filter((k) => def.props[k].write).length;
    const need = def.lint && def.lint.minProps !== undefined ? def.lint.minProps : 3;
    if (writable < need) err('可写属性 ' + writable + ' 个，少于 ' + need + ' 个');
    else if (def.lint && def.lint.minProps !== undefined && def.lint.minProps < 3) {
      if (!def.lint.why) err('豁免属性个数必须写 lint.why（理由）');
      else exempt.push('属性 ' + writable + ' 个（要求 3）：' + def.lint.why);
    }
    // 实跑：单独放一台，算一遍、画一遍、画缩略图；compute 收到冻结的 ctx，改它就会抛错
    if (!errors.length) {
      try {
        const icon = def.icon();
        if (typeof icon !== 'string' || !icon.length) err('icon() 要返回 SVG 字符串');
        const sc = U.World.blank();
        const id = U.World.add(sc, def.id, 0, 0);
        const D = U.World.evaluate(sc);
        const e = sc.entities[id];
        const sz = def.size(e);
        if (!Array.isArray(sz) || !(sz[0] > 0) || !(sz[1] > 0)) err('size() 要返回 [宽,高]');
        const c = { ent: e, props: D[id].props || e.props, d: D[id], out: D[id].out, state: e.state, w: sz[0], h: sz[1] - 28, t: 0, n: 0, kids: () => [] };
        const svg = def.draw(c);
        if (typeof svg !== 'string') err('draw() 要返回字符串');
        if (hasC) {
          const inp = {}; for (const k in def.inputs) inp[k] = [];
          const ctx = deepFreeze({ ent: U.JSON.parse(U.JSON.stringify(e)), props: Object.assign({}, e.props), inp, t: 0, n: 0, seed: 1 });
          const ctx2 = Object.assign({}, ctx, { say() {}, kids: () => [] });
          def.compute(ctx2);
        }
        if (hasS) {
          const st = def.init(e.props);
          const frozen = deepFreeze(U.JSON.parse(U.JSON.stringify(st)));
          const inp = {}; for (const k in def.inputs) inp[k] = [];
          def.step({ ent: e, props: Object.assign({}, e.props), inp, state: frozen, dt: 0.25, t: 0, n: 0, seed: 1, rand: () => 0.5, say() {} });
        }
      } catch (ex) { err('实跑出错：' + ex.message); }
    }
    return { errors, exempt };
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
