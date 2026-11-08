/* 本质目录：整个体系的地基。详见 docs/essences.md。
 * 每个器材（def.essence）和每道题（problem.essence）都必须挂在这里的某个本质下，lint 会检查。
 * essence 数组的第一个是“主本质”。 */
(function (G) {
  'use strict';
  const U = G.U = G.U || {};
  const E = (id, name, one, needs) => ({ id, name, one, needs: needs || [] });
  const LIST = [
    E('E1', '对应', '把一堆东西和另一堆配成对，不多不少'),
    E('E2', '分解与组合', '大的由小的拼成，小的能拆出来；怎么拆会影响看到什么', ['E1']),
    E('E3', '度量与单位', '数是用某把尺子量出来的；换单位，数变，量不变', ['E1']),
    E('E4', '平衡与等价', '两边相等；同时做同一件事仍然相等；只动一边必须补偿', ['E2', 'E3']),
    E('E5', '不变量与变换', '做一种变换，总有东西变、有东西不变', ['E4']),
    E('E6', '递推与迭代', '知道起点和“怎么走一步”，就知道整条路', ['E2']),
    E('E7', '极限与逼近', '不等于某个值，却能无限靠近它', ['E6', 'E3']),
    E('E8', '变量与任意性', '字母是“任意一个数”；对所有取值成立才叫恒等', ['E3']),
    E('E9', '规律、猜想与证明', '例子给证据，推理才给“一定”；一个反例就能推翻', ['E8']),
    E('E10', '对称', '做某些变换后，看起来一样', ['E5']),
    E('E11', '随机与分布', '单次不可预测，大量有结构', ['E7']),
    E('E12', '建模与抽象', '把现实变成可算的东西，再回头解释', ['E8', 'E4']),
  ];
  U.ESSENCES = {};
  LIST.forEach((e) => { U.ESSENCES[e.id] = Object.freeze(e); });
  U.ESSENCE_IDS = LIST.map((e) => e.id);
  /* 检查一个 essence 声明是否合法，返回错误信息数组 */
  U.checkEssence = function (arr) {
    const errs = [];
    if (!Array.isArray(arr) || !arr.length) return ['必须声明 essence（至少 1 个本质，第一个是主本质）'];
    if (arr.length > 3) errs.push('essence 最多 3 个，否则就是没想清楚它揭露什么');
    arr.forEach((id) => { if (!U.ESSENCES[id]) errs.push('不认识的本质：' + id); });
    if (new Set(arr).size !== arr.length) errs.push('essence 里有重复');
    return errs;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
