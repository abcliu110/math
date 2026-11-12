/* 器材包 logic：让“成立 / 不成立”真正能用起来。
 *   选择（pick）：如果条件成立，就用甲，否则用乙。分段函数（绝对值、收费标准、个税）、“取较大的那个”都靠它。
 *   真假运算（logic）：把两个“成立 / 不成立”合起来：且、或、异或、非。例如“x ≥ 1 且 x ≤ 3”就是“x 在 1 到 3 之间”。
 * 以前比较器、天平、估算器给出的“成立”只能去拨开关；现在可以接进选择，又可以接进真假运算，再接回选择。
 * 选择只检查要用到的那一边有没有接上：条件成立只需要甲，不成立只需要乙，没用到的一边不必接。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const LOGIC_OPS = ['且', '或', '异或', '非甲'];

  U.registerPack({
    id: 'logic', version: 1, needs: ['core@1'],
    types: {
      pick: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E4', 'E8'],
        label: '选择', prefix: '选', group: '关系', grades: [3, 9], alias: ['如果', '否则', '条件', '分段', '分情况', 'if', '较大', '绝对值'],
        props: {
          flip: { type: 'bool', label: '条件反过来', default: false },
          digits: { type: 'int', label: '显示小数位', default: 2, min: 0, max: 6 },
          label: { type: 'text', label: '名字', default: '' },
        },
        inputs: { c: { kind: 'bool', label: '条件' }, a: { kind: 'num', label: '成立时用（甲）' }, b: { kind: 'num', label: '不成立时用（乙）' } },
        outputs: { r: { dim: null, kind: 'num', label: '选中的数' }, which: { dim: null, kind: 'bool', label: '用了甲' } },
        icon: () => K.line(10, 32, 28, 32, { w: 2 }) + K.line(28, 32, 54, 14, { w: 2 }) + K.line(28, 32, 54, 50, { w: 2 }) + K.circle(28, 32, 4, { fill: 'var(--accent)' }),
        size: () => [170, 110],
        compute: (c) => {
          const cv = K.first(c.inp.c);
          if (!cv) { c.say('info', '先接上条件（比较器、真假运算……）'); return {}; }
          const useA = cv.data === !c.props.flip;
          const v = K.first(useA ? c.inp.a : c.inp.b);
          if (!v) { c.say('info', (useA ? '条件成立，要用“甲”：把甲接上' : '条件不成立，要用“乙”：把乙接上')); return { which: U.val('bool', useA) }; }
          c.say('ok', (useA ? '条件成立，用甲 = ' : '条件不成立，用乙 = ') + Q.show(v.data));
          return { r: U.val('num', v.data, { dim: v.dim, exact: v.exact !== false }), which: U.val('bool', useA) };
        },
        badge: (c) => (c.out.r ? U.showVal(c.out.r) : ''),
        draw: (c) => {
          const w = c.out.which;
          return K.text(c.w / 2, 26, w ? (w.data ? '→ 甲' : '→ 乙') : '如果……', { size: 18, weight: 700, fill: w ? 'var(--accent)' : 'var(--dim)' }) +
            K.text(c.w / 2, c.h - 24, c.out.r ? Q.showDec(c.out.r.data, c.props.digits) : '？', { size: 24, weight: 700, fill: c.out.r ? 'var(--ink)' : 'var(--dim)' });
        },
      },

      logic: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E4', 'E9'],
        label: '真假运算', prefix: '且', group: '关系', grades: [5, 9], alias: ['且', '或', '非', '并且', '或者', '逻辑', '之间'],
        props: {
          op: { type: 'choice', label: '运算', default: 0, choices: LOGIC_OPS },
          not: { type: 'bool', label: '结果取反', default: false },
          label: { type: 'text', label: '名字', default: '' },
        },
        inputs: { a: { kind: 'bool', label: '甲' }, b: { kind: 'bool', label: '乙' } },
        outputs: { r: { dim: null, kind: 'bool', label: '结果' } },
        icon: () => K.text(32, 40, '∧', { size: 34, weight: 700 }),
        size: () => [140, 90],
        compute: (c) => {
          const a = K.first(c.inp.a), b = K.first(c.inp.b), o = c.props.op;
          if (!a) { c.say('info', '先接上甲'); return {}; }
          if (o !== 3 && !b) { c.say('info', '再接上乙'); return {}; }
          let r = o === 0 ? a.data && b.data : o === 1 ? a.data || b.data : o === 2 ? a.data !== b.data : !a.data;
          if (c.props.not) r = !r;
          c.say(r ? 'ok' : 'info', r ? '成立' : '不成立');
          return { r: U.val('bool', r) };
        },
        badge: (c) => (c.out.r ? (c.out.r.data ? '成立' : '不成立') : ''),
        draw: (c) => K.text(c.w / 2, 32, LOGIC_OPS[c.props.op], { size: 22, weight: 700, fill: 'var(--accent)' }) +
          K.text(c.w / 2, c.h - 16, c.out.r ? (c.out.r.data ? '成立' : '不成立') : '？', { size: 16, weight: 700, fill: c.out.r ? (c.out.r.data ? 'var(--good)' : 'var(--bad)') : 'var(--dim)' }),
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
