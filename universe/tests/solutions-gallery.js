/* 解法图鉴的参考解（problems/zzzzz-gallery.js）。按学生在卡片上会做的顺序设属性、连线。 */
'use strict';
const bal = (h, states) => { const b = h.role('b'); for (const [lx, lc, rx, rc] of states) { h.set(b, 'lx', lx); h.set(b, 'rx', rx); h.set(b, 'lc', lc); h.set(b, 'rc', rc); } };
module.exports = {
  'gal-cr-steps'(h) {
    const o1 = h.add('op', { op: 2 }); h.link(h.role('heads'), o1, 'a'); h.link(h.role('two'), o1, 'b');
    const o2 = h.add('op', { op: 1 }); h.link(h.role('legs'), o2, 'a'); h.link(o1, o2, 'b');
    const o3 = h.add('op', { op: 3 }); h.link(o2, o3, 'a'); h.link(h.role('two'), o3, 'b');
  },
  'gal-cr-eq'(h) { bal(h, [[2, 0, 0, 10], [1, 0, 0, 5]]); },
  'gal-br-eq'(h) { bal(h, [[2, 0, 0, 10], [1, 0, 0, 5]]); },
  'gal-cr-area'(h) { const m = h.role('m'); h.set(m, 'hcuts', '2'); h.set(m, 'vcuts', '5'); },
  // 画成图：孩子在台面上一个一个做出来的，这里直接写成研究本、猜的次数和追问
  'gal-cr-graph'(h) { const s = h.role('s'); h.set(s, 'book', '8,2,4,20:2;8,2,4,22:3;8,2,4,24:4;8,2,4,26:5;8,2,4,21:x'); h.set(s, 'target', 21); h.set(s, 'claim', true); h.set(s, 'gtry', 1); h.set(s, 'gok', 1); h.set(s, 'all', true); h.set(s, 'pick', '1,1'); },
  'gal-br-area'(h) { h.set(h.role('m'), 'h', 2); },
  // 第二页：1 + 2 + … + 7。运算顺序台直接写成算完的样子；高斯台倒过来、对齐；平均数台直接写成摊平的每堆 4 块
  'gal-gs-add'(h) { h.set(h.role('t'), 'toks', '28'); },
  'gal-gs-pair'(h) { const t = h.role('t'); h.set(t, 'toks', '8,+,8,+,8,+,4'); h.set(t, 'toks', '28'); },
  'gal-gs-rev'(h) { const g = h.role('gs'); h.set(g, 'flip', true); h.set(g, 'pair', true); },
  'gal-gs-mean'(h) { h.set(h.role('m'), 'vals', '4,4,4,4,4,4,4'); },
  'gal-gs-br-rev'(h) { const g = h.role('gs'); h.set(g, 'flip', true); h.set(g, 'pair', true); },
  'gal-gs-br-mean'(h) { const m = h.role('m'); h.set(m, 'vals', '4,4,4,4,4,4,4'); h.set(m, 'moves', 6); },
};
