/* “记下来”的题的参考解（problems/graphs.js）。孩子是在台面上一个一个记、一个一个猜的；这里直接写成记下的、猜的次数和追问。 */
'use strict';
module.exports = {
  'gr-div-5'(h) { const g = h.role('g'); h.set(g, 'rec', '12,5;13,5;14,5;15,5;16,5'); h.set(g, 'n', 16); h.set(g, 'gtry', 2); h.set(g, 'gok', 2); h.set(g, 'all', true); h.set(g, 'pick', '1,1'); },
  'gr-box-3'(h) { const g = h.role('g'); h.set(g, 'rec1', '7,3;8,3;9,3;10,3;11,3'); h.set(g, 'n', 11); h.set(g, 'dealt', 11); h.set(g, 'gtry', 2); h.set(g, 'gok', 2); h.set(g, 'all', true); h.set(g, 'pick', '1,1'); },
  'gr-fence-20'(h) { const g = h.role('g'); h.set(g, 'rclog', '2,16,20;3,21,20;4,24,20;6,24,20;7,21,20'); h.set(g, 'w', 7); h.set(g, 'rcgtry', 2); h.set(g, 'rcgok', 2); h.set(g, 'rcall', true); h.set(g, 'rcpick', '1,1'); },
  // 通用记录仪（js/core/recorder.js）：记下的点写在 rclog（横,竖,这一组），这一组是 keep 里的属性的值
  'gr-gauss-n'(h) { const g = h.role('g'); h.set(g, 'rclog', '2,3,1/1;3,6,1/1;4,10,1/1;5,15,1/1;6,21,1/1'); h.set(g, 'n', 6); h.set(g, 'flip', true); h.set(g, 'pair', true); h.set(g, 'rcgtry', 2); h.set(g, 'rcgok', 2); h.set(g, 'rcall', true); h.set(g, 'rcpick', '1,1'); },
  'gr-circle-c'(h) { const g = h.role('g'); h.set(g, 'rclog', '1,6.28,;2,12.56,;3,18.84,;4,25.12,;5,31.4,'); h.set(g, 'r', 5); h.set(g, 'rcgtry', 2); h.set(g, 'rcgok', 2); h.set(g, 'rcall', true); h.set(g, 'rcpick', '1,1'); },
  'gr-travel-gap'(h) { const g = h.role('g'); h.set(g, 'rclog', '0,90,10/5;1,75,10/5;2,60,10/5;3,45,10/5;4,30,10/5'); h.set(g, 't', 4); h.set(g, 'rcgtry', 2); h.set(g, 'rcgok', 2); h.set(g, 'rcall', true); h.set(g, 'rcpick', '1,1'); },
  'gr-week-n'(h) { const g = h.role('g'); h.set(g, 'rclog', '1,4,3;2,5,3;3,6,3;4,0,3;5,1,3'); h.set(g, 'N', 5); h.set(g, 'go', 5); h.set(g, 'rcgtry', 2); h.set(g, 'rcgok', 2); h.set(g, 'rcall', true); h.set(g, 'rcpick', '1,1'); },
};
