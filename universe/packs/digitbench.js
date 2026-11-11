/* 器材包 digitbench：数位竖式工作台（D8，docs/direction.md 第 7 节 D8）。
 * 竖式器材本身没有输入口，两个数和算法由题目给定（属性都藏起来，不让学生在属性面板里改）。
 * 每一步写在台面的 scene.workbench 上（U.Digits，和式子工作台的机制一致）；写完了，「结果」输出就是这个数。
 * 界面：inspector: 'workbench' + wbUI: 'digits'，属性面板里画竖式（js/ui/wb-kit.js）。 */
(function (G) {
  'use strict';
  const U = G.U, K = U.kit;

  // 参数不对（比如减法的被减数小）时不算，也不画错，只说明
  const safe = (fn, fb) => { try { return fn(); } catch (e) { return fb; } };

  U.registerPack({
    id: 'digitbench', version: 1,
    types: {
      colbench: {
        workspaceRole: 'none',
        handles: true,
        inspector: 'workbench',
        wbUI: 'digits',
        workbenches: ['place-value'],
        essence: ['E1', 'E2'],
        label: '竖式工作台', prefix: '竖式', group: '数与运算', grades: [2, 3], alias: ['竖式', '数位', '进位', '退位', '个十百'],
        props: {
          a: { type: 'int', label: '第一个数', default: 47, min: 0, max: 99999999, hidden: true },
          b: { type: 'int', label: '第二个数', default: 38, min: 0, max: 99999999, hidden: true },
          op: { type: 'choice', label: '算法', default: 0, choices: ['加法', '减法'], hidden: true },
        },
        lint: { minProps: 1, why: '竖式的两个数和算法由题目给定，学生在竖式里写，不在属性面板里改' },
        outputs: { ans: { dim: null, kind: 'num', label: '竖式的结果' } },
        icon: () => K.text(32, 16, '47', { size: 12, weight: 700 }) + K.text(32, 30, '+ 38', { size: 12 }) + K.line(18, 36, 46, 36, { w: 1.5 }),
        size: () => [230, 120],
        compute: (c) => {
          const st = safe(() => U.Digits.current(c.scene, c.ent.id, U.Digits.paramsOf(c.props)), null);
          if (!st) { c.say('reject', '这组数的竖式做不了（减法要大数减小数）'); return {}; }
          const v = U.Digits.view(st);
          if (!v.done) { c.say('info', '还没写完：' + v.now); return {}; }
          c.say('ok', '结果 ' + v.result);
          return { ans: U.val('num', U.Q(v.result)) };
        },
        badge: (c) => (c.out.ans ? '结果 ' + U.showVal(c.out.ans) : ''),
        draw: (c) => {
          const v = safe(() => U.Digits.view(U.Digits.current(c.scene, c.ent.id, U.Digits.paramsOf(c.props))), null);
          if (!v) return K.text(c.w / 2, c.h / 2 + 6, '参数不对', { size: 13, fill: 'var(--dim)' });
          return K.text(c.w / 2, c.h / 2 - 4, '竖式 ' + v.title, { size: 15, weight: 700 }) +
            K.text(c.w / 2, c.h / 2 + 16, v.done ? '结果 ' + v.result : '点开，在属性面板里写竖式', { size: 12, fill: 'var(--dim)' });
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
