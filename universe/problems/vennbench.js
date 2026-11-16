/* “集合圈（重叠问题）”的题。开场东西都在右边的托盘里：学生一个一个拖进圈里、中间或圈外。
 * 全部可以在图上直接完成。判分只看器材的输出（每个圈里几个、中间几个、圈外几个、放对没有）。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const vn = (props) => () => { const s = W.blank(); const id = W.add(s, 'vennbench', 40, 50, props); s.entities[id].role = 'v'; return s; };
  const P = [];
  const base = { domain: '关系', level: 'core', shelf: ['vennbench'], traps: [], predict: null, points: ['3.8'] };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'v', port, op: '=', value: String(value) }, hints });
  // 按“是不是甲、是不是乙”算出每个数应该在哪
  const sort = (lo, hi, fa, fb) => { const labels = [], ans = []; for (let v = lo; v <= hi; v++) { labels.push(v); const a = fa(v), b = fb(v); ans.push(a && b ? 2 : a ? 1 : b ? 3 : 4); } return { labels: labels.join(','), ans: ans.join('') }; };

  add({
    id: 'vn-8-6-3', essence: ['E7', 'E2'], title: '跳绳 8 人，踢毽 6 人，一共几人？', grade: 3, rung: 3,
    topics: ['集合', '重叠问题'], alias: ['重叠问题', '韦恩图', '集合'],
    hook: '参加跳绳的有 8 人，参加踢毽的有 6 人，其中 3 人两样都参加。托盘里有 14 个人。先放两样都参加的 3 个，再把两个圈补够。托盘里会不会剩下人？',
    build: vn({ n: 14, na: '跳绳', nb: '踢毽', unit: '人' }),
    predict: { q: '一共有几个人参加了比赛？', options: [{ v: '14', label: '14 人' }, { v: '11', label: '11 人' }, { v: '17', label: '17 人' }], answer: '11' },
    milestones: [ms('both', '中间 3 人', 2, 'both', 3, ['两样都参加的放中间。', '拖 3 个到两个圈重叠的地方。', '中间 3 人。']), ms('a', '跳绳圈里 8 人', 3, 'inA', 8, ['中间的 3 个也在跳绳圈里。', '还差 5 个。', '拖 5 个到只在跳绳圈的地方。']), ms('b', '踢毽圈里 6 人', 3, 'inB', 6, ['中间的 3 个也在踢毽圈里。', '还差 3 个。', '拖 3 个到只在踢毽圈的地方。'])],
    goal: ['both', 'a', 'b'],
    why: '8 + 6 = 14，但中间的 3 个人既算在跳绳里，又算在踢毽里，数了两次。所以实际是 14 − 3 = 11 人，托盘里剩下 3 个没用上。重叠的部分只能算一次。',
  });
  add({
    id: 'vn-sort-2-3', essence: ['E7', 'E2'], title: '1 到 12：2 的倍数和 3 的倍数', grade: 5, rung: 3, points: ['3.8'],
    topics: ['集合', '倍数', '分类'], alias: ['倍数', '公倍数', '分类', '韦恩图'],
    hook: '左圈放 2 的倍数，右圈放 3 的倍数。把 1 到 12 都放好。既是 2 的倍数又是 3 的倍数的放哪儿？都不是的呢？放错了会有红圈。',
    build: vn(Object.assign({ na: '2 的倍数', nb: '3 的倍数' }, sort(1, 12, (v) => v % 2 === 0, (v) => v % 3 === 0))),
    predict: { q: '中间会有哪些数？', options: [{ v: 'a', label: '6 和 12' }, { v: 'b', label: '2 和 3' }, { v: 'c', label: '没有数' }], answer: 'a' },
    milestones: [ms('mid', '中间 2 个：6 和 12', 3, 'both', 2, ['又是 2 的倍数、又是 3 的倍数。', '6 和 12。', '拖到中间。']), ms('all', '12 个数全部放对', 5, 'allright', 1, ['1、5、7、11 两样都不是。', '放到两个圈外面。', '红圈的是放错的。'])],
    goal: ['mid', 'all'],
    why: '中间是 6 和 12：它们同时是 2 和 3 的倍数，也就是 6 的倍数。两个圈重叠的地方，就是“两个条件都满足”的东西——公倍数就在这里。',
  });
  add({
    id: 'vn-find-both', essence: ['E7', 'E4'], title: '20 人，12 人喜欢语文，14 人喜欢数学', grade: 4, rung: 4,
    topics: ['集合', '重叠问题'], alias: ['重叠问题', '容斥', '集合'],
    hook: '全班 20 人，每人至少喜欢一样。喜欢语文的 12 人，喜欢数学的 14 人。把 20 个人都放进圈里（不能放外面），让两个圈的人数都对。中间要放几个？',
    build: vn({ n: 20, na: '语文', nb: '数学', unit: '人' }),
    predict: { q: '两样都喜欢的有几人？', options: [{ v: '6', label: '6 人' }, { v: '2', label: '2 人' }, { v: '26', label: '26 人' }], answer: '6' },
    milestones: [ms('a', '语文圈里 12 人', 2, 'inA', 12, ['12 人喜欢语文。', '中间的也算。', '先试着放。']), ms('b', '数学圈里 14 人', 2, 'inB', 14, ['14 人喜欢数学。', '中间的也算。', '先试着放。']), ms('all', '20 人都在圈里', 4, 'union', 20, ['12 + 14 = 26，比 20 多 6。', '多出来的 6 就是数了两次的。', '中间 6，只语文 6，只数学 8。'])],
    goal: ['a', 'b', 'all'],
    why: '12 + 14 = 26，可是只有 20 个人。多出来的 26 − 20 = 6，就是被数了两次的人：两样都喜欢的有 6 人。',
  });
  add({
    id: 'vn-neither', essence: ['E7', 'E2'], title: '15 人里，两样都不会的有几人？', grade: 4, rung: 3,
    topics: ['集合', '重叠问题'], alias: ['重叠问题', '都不', '集合'],
    hook: '一共 15 人。会游泳的 7 人，会骑车的 6 人，两样都会的 2 人。把 15 个人都放好：不会的放在两个圈外面。',
    build: vn({ n: 15, na: '游泳', nb: '骑车', unit: '人' }),
    predict: { q: '两样都不会的有几人？', options: [{ v: '2', label: '2 人' }, { v: '4', label: '4 人' }, { v: '0', label: '0 人' }], answer: '4' },
    milestones: [ms('both', '中间 2 人', 2, 'both', 2, ['两样都会的放中间。', '拖 2 个。', '中间 2 人。']), ms('a', '游泳圈里 7 人', 2, 'inA', 7, ['中间的 2 个也算。', '还差 5 个。', '放到只在游泳圈的地方。']), ms('b', '骑车圈里 6 人', 2, 'inB', 6, ['中间的 2 个也算。', '还差 4 个。', '放到只在骑车圈的地方。']), ms('out', '圈外 4 人', 2, 'out', 4, ['圈里一共 11 人。', '15 − 11。', '剩下的 4 个放到圈外。'])],
    goal: ['both', 'a', 'b', 'out'],
    why: '会至少一样的有 7 + 6 − 2 = 11 人，所以两样都不会的是 15 − 11 = 4 人。先求两个圈一共圈住多少，再从总数里减掉。',
  });
  add({
    id: 'vn-odd-5', essence: ['E7', 'E2'], title: '1 到 15：奇数和 5 的倍数', grade: 5, rung: 3,
    topics: ['集合', '分类', '倍数'], alias: ['奇数', '倍数', '分类', '韦恩图'],
    hook: '左圈放奇数，右圈放 5 的倍数。把 1 到 15 都放好。10 该放哪儿？',
    build: vn(Object.assign({ na: '奇数', nb: '5 的倍数' }, sort(1, 15, (v) => v % 2 === 1, (v) => v % 5 === 0))),
    milestones: [ms('all', '15 个数全部放对', 8, 'allright', 1, ['5 和 15 又是奇数又是 5 的倍数。', '10 是 5 的倍数但不是奇数：只在右圈。', '偶数里不是 5 的倍数的，放圈外。'])],
    goal: ['all'],
    why: '5 和 15 在中间；10 只在右圈；2、4、6、8、12、14 两样都不是，在圈外。每个数都有且只有一个位置：是不是甲、是不是乙，两个问题一共 4 种回答。',
  });
  add({
    id: 'vn-no-overlap', essence: ['E7', 'E2'], title: '中间可以是空的吗？', grade: 4, rung: 2,
    topics: ['集合', '分类'], alias: ['奇数', '偶数', '分类'],
    hook: '左圈放奇数，右圈放偶数。把 1 到 10 都放好，看看中间和圈外各有几个。',
    build: vn(Object.assign({ na: '奇数', nb: '偶数' }, sort(1, 10, (v) => v % 2 === 1, (v) => v % 2 === 0))),
    predict: { q: '中间会有几个数？', options: [{ v: '0', label: '0 个' }, { v: '5', label: '5 个' }, { v: '10', label: '10 个' }], answer: '0' },
    milestones: [ms('all', '10 个数全部放对', 8, 'allright', 1, ['一个数不是奇数就是偶数。', '没有“又是奇数又是偶数”的数。', '中间和圈外都是空的。'])],
    goal: ['all'],
    why: '没有哪个数既是奇数又是偶数，所以中间是空的；也没有哪个数两样都不是，所以圈外也是空的。这时 5 + 5 = 10，不用减：没有重叠就没有数两次。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
