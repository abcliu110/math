/* 行程问题：相遇、追及、环形跑道。 */
(function (G) {
  'use strict';
  const U = G.U, mk = U.mkScene, P = [];
  const road = (props) => mk({ ents: [{ type: 'road', x: 80, y: 90, role: 'r', props }] });
  P.push({
    id: 'meet-100', essence: ['E6', 'E12'], title: '两地相距 100，甲每拍走 6，乙每拍走 4，相向而行', grade: 4, domain: '时间与变化', points: ['4.9'], topics: ['相遇问题', '速度和'],
    alias: ['相遇', '行程'], hook: '甲从 0 出发向右，乙从 100 出发向左。先把速度调成 6 和 −4（负号表示向左），再让时钟走起来，看几拍相遇。',
    shelf: ['road', 'meter', 'op'],
    build: road({ len: 100, x1: 0, v1: 1, x2: 100, v2: -1 }),
    predict: { q: '先猜：几拍相遇？', options: [{ v: 10, label: '10 拍' }, { v: 17, label: '17 拍' }, { v: 25, label: '25 拍' }], reveal: () => ({ v: 10, label: '10 拍（100 ÷ (6+4)）' }) },
    milestones: [
      { id: 'set', say: '甲速度 6、乙速度 −4', score: 3, when: (w) => w.some('road', (e) => e.props.v1 === 6 && e.props.v2 === -4), hints: ['属性里改两个速度。', '乙向左走，所以是负数。', 'v1=6，v2=−4。'] },
      { id: 'meet', say: '让时钟走到第 10 拍相遇', score: 7, when: { role: 'r', port: 'at', op: '=', value: '10' }, hints: ['点播放。', '每拍两人合起来靠近 6+4。', '100 ÷ 10 = 10 拍。'] },
    ],
    traps: [], why: '相向而行，每拍两人一共靠近 6+4=10，所以 100÷10=10 拍相遇。相遇问题：路程 = 速度和 × 时间。', ref: ['road|0'],
  });
  P.push({
    id: 'chase-30', essence: ['E6', 'E12'], title: '甲在后追乙：相距 30，甲每拍 7，乙每拍 4', grade: 5, domain: '时间与变化', points: ['5.5'], topics: ['追及问题', '速度差'],
    alias: ['追及', '行程'], hook: '甲在 0，乙在 30，都向右走。调好速度，让时钟走起来，几拍甲追上乙？',
    shelf: ['road', 'meter', 'op'],
    build: road({ len: 200, x1: 0, v1: 1, x2: 30, v2: 1 }),
    predict: { q: '先猜：几拍追上？', options: [{ v: 5, label: '5 拍' }, { v: 10, label: '10 拍' }, { v: 30, label: '30 拍' }], reveal: () => ({ v: 10, label: '10 拍（30 ÷ (7−4)）' }) },
    milestones: [
      { id: 'set', say: '甲速度 7、乙速度 4', score: 3, when: (w) => w.some('road', (e) => e.props.v1 === 7 && e.props.v2 === 4), hints: ['同向，都是正数。', '追的人要更快。', 'v1=7，v2=4。'] },
      { id: 'catch', say: '第 10 拍追上', score: 7, when: { role: 'r', port: 'at', op: '=', value: '10' }, hints: ['点播放。', '每拍甲比乙多走 7−4。', '30 ÷ 3 = 10。'] },
    ],
    traps: [], why: '同向追及，每拍缩短 7−4=3，要缩短 30，所以 30÷3=10 拍。追及问题：路程差 = 速度差 × 时间。', ref: ['road|0'],
  });
  P.push({
    id: 'loop-400', essence: ['E6', 'E5'], title: '环形跑道一圈 400，两人同点同向，速度 8 和 6，几拍再相遇？', grade: 6, domain: '时间与变化', points: ['6.5'], topics: ['环形跑道', '追及'],
    alias: ['环形', '行程'], hook: '勾选“环形跑道”，周长 400，两人同点出发，速度 8 和 6。快的人要多跑一整圈才再次碰上。',
    shelf: ['road', 'meter', 'op'],
    build: road({ len: 400, loop: true, x1: 0, v1: 1, x2: 0, v2: 1 }),
    predict: { q: '先猜：几拍再相遇？', options: [{ v: 50, label: '50 拍' }, { v: 200, label: '200 拍' }, { v: 400, label: '400 拍' }], reveal: () => ({ v: 200, label: '200 拍（400 ÷ (8−6)）' }) },
    milestones: [
      { id: 'set', say: '速度 8 和 6', score: 3, when: (w) => w.some('road', (e) => e.props.v1 === 8 && e.props.v2 === 6), hints: ['同向，都是正数。', '甲快乙慢。', 'v1=8，v2=6。'] },
      { id: 'again', say: '第 200 拍再次相遇', score: 7, when: { role: 'r', port: 'at', op: '=', value: '200' }, hints: ['把时钟调快些（20×）。', '甲要比乙多跑一圈：400。', '400 ÷ (8−6) = 200。'] },
    ],
    traps: [], why: '同点同向，快的要多跑一圈才追上慢的：400÷(8−6)=200 拍。环形追及：路程差 = 一圈。', ref: ['road|0'],
  });
  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
