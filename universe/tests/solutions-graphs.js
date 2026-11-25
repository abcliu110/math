/* “记下来”的题的参考解（problems/graphs.js）。孩子是在台面上一个一个记、一个一个猜的；这里直接写成记下的、猜的次数和追问。 */
'use strict';
module.exports = {
  'gr-div-5'(h) { const g = h.role('g'); h.set(g, 'rec', '12,5;13,5;14,5;15,5;16,5'); h.set(g, 'n', 16); h.set(g, 'gtry', 2); h.set(g, 'gok', 2); h.set(g, 'all', true); h.set(g, 'pick', '1,1'); },
  'gr-box-3'(h) { const g = h.role('g'); h.set(g, 'rec1', '7,3;8,3;9,3;10,3;11,3'); h.set(g, 'n', 11); h.set(g, 'dealt', 11); h.set(g, 'gtry', 2); h.set(g, 'gok', 2); h.set(g, 'all', true); h.set(g, 'pick', '1,1'); },
  'gr-fence-20'(h) { const g = h.role('g'); h.set(g, 'tried', '2,3,4,6,7'); h.set(g, 'w', 7); h.set(g, 'gtry', 2); h.set(g, 'gok', 2); h.set(g, 'all', true); h.set(g, 'pick', '1,1'); },
};
