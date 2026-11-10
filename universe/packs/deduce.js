/* 器材包 deduce（2.14b 推理，next-steps.md §8.1）：排除表。
 * 一张表，行是人，列是属性（颜色、宠物……）。学生在格子里标“不是”“是”，排除后格子变灰；能推出时标“是”。
 * 表的人和属性由题目给定（属性面板里隐藏），步骤写在台面的 scene.workbench 上（U.Deduce，见 js/core/deduce.js）。
 * 输出口 solved：全部排定了。界面：inspector: 'workbench' + wbUI: 'deduce'，属性面板里画表（js/ui/wb-kit.js）。 */
(function (G) {
  'use strict';
  const U = G.U, K = U.kit;

  const safe = (fn, fb) => { try { return fn(); } catch (e) { return fb; } };

  U.registerPack({
    id: 'deduce', version: 1,
    types: {
      deduce: {
        workspaceRole: 'none',
        readsScene: true,   // 读台面上的步骤（scene.workbench），增量求值时每次都算
        handles: true,
        inspector: 'workbench',
        wbUI: 'deduce',
        workbenches: ['deduce'],
        essence: ['E2'],
        label: '排除表', prefix: '排除表', group: '数与运算', grades: [2, 3], alias: ['排除', '谁是谁', '推理', '排除法', '表格'],
        props: {
          people: { type: 'text', label: '人（用逗号隔开）', default: '小明,小红,小刚', hidden: true },
          groups: { type: 'text', label: '属性（组与组之间用分号，组名：值,值,值）', default: '颜色：红,蓝,绿；宠物：猫,狗,兔', hidden: true },
        },
        lint: { minProps: 2, why: '排除表的人和属性由题目给定，学生在表里标“是”“不是”，不在属性面板里改' },
        outputs: { solved: { dim: null, kind: 'bool', label: '全部排定了' } },
        icon: () => K.rect(6, 8, 52, 30, { stroke: 'var(--ink)', r: 3 }) + K.line(6, 18, 58, 18, {}) + K.line(6, 28, 58, 28, {}) + K.line(26, 8, 26, 38, {}) + K.text(16, 26, '×', { size: 11, fill: 'var(--dim)' }),
        size: () => [250, 130],
        compute: (c) => {
          const st = safe(() => U.Deduce.current(c.scene, c.ent.id), null);
          if (!st) { c.say('reject', '人或属性的数目对不上（人数要和每组的值的个数一样）'); return { solved: U.val('bool', false) }; }
          const v = U.Deduce.view(st);
          if (!v.solved) c.say('info', '还没排完：' + v.now);
          else c.say('ok', '每人的属性都排定了');
          return { solved: U.val('bool', v.solved) };
        },
        badge: (c) => (c.out && c.out.solved && c.out.solved.data ? '排完了' : ''),
        draw: (c) => {
          const st = safe(() => U.Deduce.current(c.scene, c.ent.id), null);
          const txt = st ? U.Deduce.view(st).now : '人或属性的数目不对';
          return K.text(c.w / 2, c.h / 2 - 6, c.props.label || '排除表', { size: 12, weight: 700, fill: 'var(--dim)' }) +
            K.text(c.w / 2, c.h / 2 + 16, txt, { size: 14, weight: 700 });
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
