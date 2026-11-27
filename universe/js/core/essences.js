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
  /* 道理地图（docs/essence-forms.md 第六节）：孩子看到的名字和一句话，只在这一张表里写（界面上不出现“本质”两个字）。
   * 位置和箭头按 docs/essences.md 第三节那张图：col 列、row 行；row 3 是“横跨所有”的两条（E9、E12），不画箭头。
   * 箭头 [甲, 乙] 读作“乙常以甲为基础”。open：第一版能点进去的那一页（只有“两边一样”）。 */
  U.ESSENCE_KID = {
    E1: { name: '配成对', one: '一个对一个，不多不少', col: 0, row: 0 },
    E3: { name: '用尺子量', one: '换一把尺子，数变了，东西没变', col: 1, row: 0 },
    E8: { name: '字母是任意数', one: 'x 可以是随便哪一个数', col: 2, row: 0 },
    E2: { name: '拆开再拼', one: '大的拆成小的，小的拼回大的', col: 0, row: 1 },
    E4: { name: '两边一样', one: '两边做同样的事，还是一样；只动一边就歪了', col: 1, row: 1, open: 'balance4' },
    E5: { name: '变中不变', one: '动来动去，总有一样东西不变', col: 2, row: 1 },
    E10: { name: '看起来一样', one: '折一折、转一转，还和原来一样', col: 3, row: 1 },
    E6: { name: '一步接一步', one: '知道起点和怎么走一步，就知道整条路', col: 1, row: 2 },
    E7: { name: '越来越近', one: '到不了，却能想多近就多近', col: 2, row: 2 },
    E11: { name: '碰运气也有规律', one: '一次猜不准，次数多了有规律', col: 3, row: 2 },
    E9: { name: '凭什么一定', one: '试了很多次都对还不够，要说出为什么一定对', col: 0, row: 3, span: 2 },
    E12: { name: '变成数学题', one: '把生活里的事变成能算的东西，再回去看对不对', col: 2, row: 3, span: 2 },
  };
  U.ESSENCE_ARROWS = [['E1', 'E3'], ['E3', 'E8'], ['E1', 'E2'], ['E3', 'E4'], ['E8', 'E5'], ['E2', 'E4'], ['E4', 'E5'], ['E5', 'E10'], ['E4', 'E6'], ['E5', 'E7'], ['E6', 'E7'], ['E7', 'E11']];
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
