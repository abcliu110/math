/* 钉板的题（docs/new-instruments.md 6.7）：开场钉板是空的，要学生自己围、记、试公式。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const gb = (props) => () => { const s = W.blank(); const id = W.add(s, 'geoboard', 60, 60, props || {}); s.entities[id].role = 'g'; return s; };
  const P = [];
  const add = (o) => P.push(Object.assign({ domain: '图形', level: 'core', shelf: ['geoboard'], predict: null, traps: [] }, o));
  const ms = (id, say, score, port, op, value, hints) => ({ id, say, score, when: { role: 'g', port, op, value: String(value) }, hints });
  add({
    id: 'gb-area6', essence: ['E9', 'E2'], title: '围出面积是 6 的图形', grade: 3, rung: 2, points: ['3.12'], build: gb(),
    topics: ['钉板', '面积', '格点'], alias: ['钉板', '面积', '格点', '围图形'],
    hook: '在钉板上依次点格点，再点第一个点封口，围出一个多边形。让它的面积正好是 6 个方格。围一个长方形，再试试别的形状。',
    milestones: [ms('area', '围出了面积是 6 的图形', 6, 'area', '=', 6, ['点 4 个格点围长方形，再点第一个点封口。', '长 3 宽 2，面积是 6。', '(0,0) (3,0) (3,2) (0,2)，再点 (0,0)。']), ms('perim', '围出了周长是 10 的长方形', 3, 'perim', '=', 10, ['长 + 宽 = 5。', '3 × 2 的长方形周长是几？', '周长 10：长 3 宽 2。'])],
    goal: ['area'], why: '长方形的面积是长 × 宽：3 × 2 = 6。面积一样的图形，形状可以不同，周长也可以不同。',
  });
  add({
    id: 'gb-perim12', essence: ['E9', 'E2'], title: '围一个周长是 12 的长方形', grade: 4, rung: 2, points: ['3.12'], build: gb(),
    topics: ['钉板', '周长', '长方形'], alias: ['钉板', '周长', '长方形'],
    hook: '用钉板围一个长方形，让它的周长是 12。围好了看看面积；再围一个周长也是 12、但形状不同的。',
    milestones: [ms('perim', '围出了周长是 12 的长方形', 6, 'perim', '=', 12, ['长 + 宽 = 6。', '4 × 2，或者 5 × 1，或者 3 × 3。', '(0,0) (4,0) (4,2) (0,2)。'])],
    goal: ['perim'], why: '长方形的周长是 2 × (长 + 宽)：长 + 宽 = 6，有 1+5、2+4、3+3，面积分别是 5、8、9——周长一样，面积不一样。',
  });
  add({
    id: 'gb-pick', essence: ['E9', 'E2'], title: '发现规律：面积和格点数有什么关系？', grade: 8, rung: 4, points: ['8.11'], build: gb(),
    topics: ['钉板', '皮克公式', '找规律'], alias: ['钉板', '皮克公式', '格点', '规律'],
    hook: '围几个不同的多边形（别只围长方形），每围好一个点“记进表”：边上的格点数 B、里面的格点数 I、面积。攒够 5 行，试一个公式：面积 = ？× I + ？× B + ？。公式要在内置的 60 个多边形上也对。',
    milestones: [ms('rows', '表里有 5 行（含不是长方形的）', 3, 'rowsN', '>=', 5, ['围一个，点“记进表”；再围下一个。', '三角形、梯形也围一围。', '攒够 5 行。']), ms('formula', '公式对了：面积 = I + B/2 − 1', 7, 'formula', '=', 1, ['试试：面积 − I 是不是和 B 有关？', '面积 = I + B 的一半，再差一个数。', 'fa = 1，fb = 1/2，fc = −1。'])],
    goal: ['rows', 'formula'], why: '皮克公式：面积 = I + B/2 − 1。我们用 60 个多边形检验过，没有找到反例；它是一个定理，证明要到大学。',
  });
  for (const p of P) U.problems.push(p);
})(typeof globalThis !== 'undefined' ? globalThis : window);
