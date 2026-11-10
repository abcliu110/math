/* 台面（D4 拆分）：名字与标签：学生看到的名字、图形的标签、选中对象和步骤的文字。由 stage.js 拆出，只搬代码、不改逻辑；跨文件的名字经 UI.StageCtx（SG）访问。加载顺序见 index.html。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), W = U.World, K = U.kit, Q = U.Q;
  const $ = (s) => document.querySelector(s);
  const L = UI.LAYOUT, HD = L.HD, PORT_Y0 = L.PORT_Y0, PORT_DY = L.PORT_DY, PILL_DY = L.PILL_DY, PILL_W = L.PILL_W, MIN_W = L.MIN_W, MIN_H = L.MIN_H;
  const SG = UI.StageCtx;
  // 工作区里要显示的值：每个器材输出的 fig（没有 fig 时才用 figs），按放入的先后。key 是 器材id.口，层开关用它
  // ---- 学生看到的名字：只改显示；稳定名字（选中、解析用的）不变 ----
  const TXT_W = (t) => { let w = 0; for (const ch of String(t)) w += ch.charCodeAt(0) < 128 ? 6.6 : 11.5; return Math.ceil(w) + 4; };
  const vName = (n) => { const m = /^M\((.*)\)$/.exec(n); return m ? m[1] + '中点' : n; };
  const joinV = (xs) => (xs.every((x) => x.length === 1) ? xs.join('') : xs.join('、'));
  function pretty(nm) {
    if (!nm) return null;
    let m;
    if ((m = /^poly\((.*)\)$/.exec(nm))) { const vs = m[1].split(',').map(vName); return (vs.length === 3 ? '三角形 ' : vs.length === 4 ? '四边形 ' : '多边形 ') + joinV(vs); }
    if ((m = /^seg\((.*)\)$/.exec(nm))) return '线段 ' + m[1].split(',').map(vName).join(' 到 ');
    if (/^M\(/.test(nm)) return vName(nm);
    if (/^X\(/.test(nm)) return '交点';
    if (/^foot\(/.test(nm)) return '垂足';
    if (/^perp\(/.test(nm)) return '垂线段';
    if (/^step:/.test(nm)) return '摆出来的图形';
    if (/^cut:/.test(nm)) return '剪开的一块';
    return nm;
  }
  // 题目把哪个图形当作目标：看它的角色（题目里写的 role 含“目标”），不看器材类型——普通的四边形就是四边形
  const isTarget = (ent) => !!(ent && /目标/.test(ent.role || ''));
  const FIG_NAME = { polygon: '多边形', segment: '线段', circle: '圆', point: '点' };
  // 图形的标签：块用它自己的名字；目标图形（fquad）统一叫「目标图形」；其余用学生名字，没有就按图形的种类
  function figLabel(it, nm, fig) {
    if (SG.roleOf(it) === 'piece') return it.props.name || it.name;
    if (isTarget(it)) return '目标图形';
    if (SG.roleOf(it) === 'point' && it.props && it.props.mark) return it.props.mark;   // 点的名字（2.6）：学生能改，标签显示名字属性；稳定的引用仍是 id 和角色
    return pretty(nm) || it.name || FIG_NAME[fig && fig.type] || SG.defOf(it).label;
  }
  // 选中的对象显示成学生的名字（找到了用图形的标签，找不到就按名字换算）
  const pickLabel = (x, vals) => { const v = vals.find((y) => SG.pickOf(y) === x); return v ? v.label : pretty(x) || x; };
  // 拼合器材有两种：「合并」（没有目标口）和「对齐到目标」（目标口接着目标图形）；步骤清单要分得开
  // 步骤清单里的名字：器材声明的 stepLabel（字符串，或 (ent, scene) => 字符串），没有就用器材名
  const stepLabel = (st) => { const s = SG.defOf(st).stepLabel; return typeof s === 'function' ? s(st, UI.S.scene) : s || SG.defOf(st).label || st.type; };
  // 改名（2.6）：双击点的标签，在标签上弹出一个输入框。回车或离开输入框就改名（一步，撤销一次恢复），Esc 放弃。
  // 只改显示的名字（属性 mark，名字 name），id 和引用不变。
  function startRename(id) {
    const S = UI.S, e = S.scene.entities[id];
    if (!e || document.querySelector('input.wsx-ren')) return;
    const lab = [...document.querySelectorAll('svg.wsbody text[data-ren]')].find((t) => t.dataset.ren === id);
    if (!lab) return;
    const r = lab.getBoundingClientRect(), cur = e.props.mark || '';
    const inp = document.createElement('input');
    inp.className = 'wsx-ren'; inp.value = cur; inp.maxLength = 12; inp.setAttribute('aria-label', '点的名字');
    inp.style.left = r.left + 'px'; inp.style.top = r.top + 'px';
    let done = false;
    const end = (commit) => {
      if (done) return; done = true;
      const v = inp.value.trim();
      inp.remove();
      if (commit && v && v !== cur) {
        const res = UI.Intent.run('rename', { id, name: v, alsoProp: 'mark' });
        if (!res.ok) SG.setMsg(res.why, false);
      }
      SG.render();
    };
    inp.addEventListener('keydown', (ev) => { ev.stopPropagation(); if (ev.key === 'Enter') end(true); else if (ev.key === 'Escape') end(false); });
    inp.addEventListener('blur', () => end(true));
    document.body.appendChild(inp); inp.focus(); inp.select();
  }
  Object.assign(SG, { TXT_W, vName, joinV, pretty, isTarget, FIG_NAME, figLabel, pickLabel, stepLabel, startRename });
})(window);
