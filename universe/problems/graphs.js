/* “记下来”的题（docs/knob-graph-and-gallery.md 第一节）：在台面上一个一个做，每做一个，图上多一个点；看出图的形状，再说为什么。
 * 换一换台的那道（gal-cr-graph）挂在解法图鉴里；这里是分一分台和篱笆围地（面积推导台）的。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const gb = (props) => () => { const s = W.blank(); const id = W.add(s, 'groupbench', 40, 40, props); s.entities[id].role = 'g'; return s; };
  const ab = (props) => () => { const s = W.blank(); const id = W.add(s, 'areabench', 40, 40, props); s.entities[id].role = 'g'; return s; };
  const on = (port, op, value) => ({ role: 'g', port, op, value: String(value) });
  U.problems.push({
    id: 'gr-div-5', domain: '数与运算', level: 'core', shelf: ['groupbench'], traps: [], predict: null,
    essence: ['E2', 'E7'], grade: 3, rung: 6, points: ['2.11'], topics: ['有余数的除法', '找规律'], alias: ['余数', '有余数的除法', '记下来', '画成图'],
    title: '画成图：每 5 个一份，总数一个一个加，商和余数怎么变？',
    hook: '每份 5 个不动。点“总数”旁边的 + ，一个一个加，每加一次点“记下来”：图上多一个橙点（商）和一个红点（余数）。记了 3 个以后，换到新的总数，圈会先藏起来：先在蓝线上猜余数，再看。',
    build: gb({ mode: 0, n: 12, g: 5, graph: true, ask: '余数最大能是几？|*4，比每份的 5 少 1|5|想多大就多大~总数每多 5 个，商多几？|*1|5|0' }),
    milestones: [
      { id: 'three', say: '图上记了 3 个总数', score: 2, when: on('pts', '>=', 3), hints: ['点“记下来”。', '点总数的 + ，再点“记下来”。', '一共记 3 次。'] },
      { id: 'guess', say: '先猜再看，猜对 2 次', score: 3, when: on('gok', '>=', 2), hints: ['看前面的红点：总数多 1，余数多几？', '余数涨到 4，下一个就掉回 0。', '先点蓝线上的一格，再点“记下来”。'] },
      { id: 'all', say: '全部试一遍：看出台阶和锯齿', score: 1, when: on('all', '=', 1), hints: ['图上有 5 个点以后，右上角的按钮就能点了。', '点“全部试一遍”。', '橙的一级一级上台阶，红的一格一格涨、又掉回 0。'] },
      { id: 'q1', say: '余数最大是 4', score: 2, when: on('q1', '=', 1), hints: ['看红点最高到几。', '余数到 5 就又凑够一份了。', '比每份的 5 少 1。'] },
      { id: 'q2', say: '总数多 5，商多 1', score: 2, when: on('q2', '=', 1), hints: ['看橙点：每一级台阶有多宽？', '多 5 个就多凑一份。', '商多 1。'] },
    ],
    goal: ['three', 'guess', 'all', 'q1', 'q2'],
    why: '每份 5 个：总数每多 1，余数多 1；余数到了 5 就又凑够一份，商多 1、余数掉回 0。所以余数只能是 0、1、2、3、4，比除数小；商是一级一级的台阶，每级 5 个宽，余数是一格一格涨又掉回去的锯齿，每 5 个重来一次。',
  });
  U.problems.push({
    id: 'gr-fence-20', domain: '图形与几何', level: 'core', shelf: ['areabench'], traps: [], predict: null,
    essence: ['E5', 'E7'], grade: 4, rung: 6, points: ['3.12'], topics: ['周长与面积', '最大面积', '找规律'], alias: ['篱笆', '周长一定', '面积最大', '记下来', '画成图'],
    title: '画成图：20 米篱笆，长一个一个变，面积怎么变？',
    hook: '篱笆一共 20 米。拖右边的圆点改长（宽跟着变），每换一个长点“记下来”：图上多一个点。记了 3 个以后，换到新的长，面积会先藏起来：先在蓝线上猜面积，再看。',
    build: ab({ shape: 3, P: 20, w: 2, graph: true, ask: '面积最大时，长和宽是什么样的？|*一样长，围成正方形|长比宽多 1|长越长面积越大~长 3 米和长 7 米，面积比一比？|*一样大|长 7 米的大|长 3 米的大' }),
    milestones: [
      { id: 'three', say: '图上记了 3 个长', score: 2, when: on('pts', '>=', 3), hints: ['点“记下来”。', '拖右边的圆点换个长，再点“记下来”。', '一共记 3 次。'] },
      { id: 'guess', say: '先猜再看，猜对 2 次', score: 3, when: on('gok', '>=', 2), hints: ['长 + 宽 = 10：长 3 米，宽就是 7 米。', '长 3 和长 7 围出来的是同一个长方形，转了个方向。', '先点蓝线上的一格，再点“记下来”。'] },
      { id: 'all', say: '全部试一遍：看出中间高、两边低的拱', score: 1, when: on('all', '=', 1), hints: ['图上有 5 个点以后，右上角的按钮就能点了。', '点“全部试一遍”。', '点左右对称，中间最高。'] },
      { id: 'q1', say: '面积最大时是正方形', score: 2, when: on('q1', '=', 1), hints: ['看图上最高的点：长是几？', '长 5 米，宽也是 5 米。', '长和宽一样长。'] },
      { id: 'q2', say: '长 3 和长 7 面积一样', score: 2, when: on('q2', '=', 1), hints: ['长 3 米，宽是几？长 7 米呢？', '3 × 7 和 7 × 3。', '一样大：图是左右对称的。'] },
    ],
    goal: ['three', 'guess', 'all', 'q1', 'q2'],
    why: '篱笆 20 米，长 + 宽 = 10。长 1 到 9：面积 9、16、21、24、25、24、21、16、9。长 3 和长 7 是同一个长方形转了个方向，所以图左右对称；长和宽越接近，面积越大，中间长 5、宽 5 的正方形最大，图是一个中间高、两边低的拱。',
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
