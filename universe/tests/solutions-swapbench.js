/* “换一换”题的参考解（problems/swapbench.js）。学生是在图上点、拖出来的；这里直接设“乙有几个”。 */
'use strict';
const k = (n) => (h) => h.set(h.role('s'), 'k', n);
const at = (h, x) => { Object.keys(x).forEach((key) => h.set(h.role('s'), key, x[key])); };
const lift = (n) => (h) => { h.set(h.role('s'), 'lift', true); h.set(h.role('s'), 'k', n); };
module.exports = {
  'sw-8-26': k(5), 'sw-from-rabbits': k(5), 'sw-boats': k(3), 'sw-basketball': k(3), 'sw-money': k(5), 'sw-wheels': k(4), 'sw-bugs': k(4), 'sw-table': k(8), 'sw-balance': k(6), 'sw-lift': lift(5),
  'sw-as-system'(h) { const s = h.role('s'); h.set(s, 'e0', '1,1,0,0,0,8'); h.set(s, 'e1', '2,4,0,0,0,26'); h.set(s, 'view', 1); h.set(s, 'e1', '1,3,0,0,0,18'); h.set(s, 'e1', '0,2,0,0,0,10'); h.set(s, 'e1', '0,1,0,0,0,5'); h.set(s, 'view', 0); h.set(s, 'k', 5); },
  // 假设阶梯：研究本（book）、追问（pick）直接设
  'asm-L1'(h) { at(h, { k: 5, book: '8,2,4,26:5' }); at(h, { k: 6, n: 10, target: 32, si: 1, book: '8,2,4,26:5;10,2,4,32:6', pick: '2' }); },
  'asm-L2'(h) { at(h, { k: 4, book: '10,2,4,28:4' }); at(h, { tried: '', k: 0, n: 20, target: 56, si: 1 }); at(h, { k: 8, book: '10,2,4,28:4;20,2,4,56:8', pick: '1' }); },
  'asm-L3'(h) { at(h, { k: 5, book: '12,2,4,34:5', pick: '2' }); at(h, { tried: '', n: 15, target: 48, k: 9, si: 1, book: '12,2,4,34:5;15,2,4,48:9' }); },
  'asm-L4'(h) { at(h, { k: 8, book: '15,2,3,38:8', pick: '1' }); at(h, { n: 20, target: 47, k: 7, si: 1, book: '15,2,3,38:8;20,2,3,47:7' }); },
  'asm-L5'(h) { at(h, { claim: true, book: '8,2,4,27:x', pick: '3' }); at(h, { claim: false, target: 26, k: 5 }); },
  'asm-L6'(h) { at(h, { k: 8, book: '10,-2,5,36:8', pick: '3' }); at(h, { n: 20, la: -1, lb: 4, target: 55, k: 15, si: 1, book: '10,-2,5,36:8;20,-1,4,55:15' }); },
  'asm-L7'(h) { at(h, { e0: '1,1,0,0,0,10', e1: '2,4,0,0,0,26', view: 1 }); at(h, { e1: '1,3,0,0,0,16' }); at(h, { e1: '0,2,0,0,0,6' }); at(h, { e1: '0,1,0,0,0,3' }); at(h, { view: 0, k: 3, book: '10,2,4,26:3', pick: '1' }); },
  'asm-L8'(h) {
    const B = ['10,4,6,46:3']; at(h, { k: 3, book: B.join(';') });
    B.push('12,3,5,50:7'); at(h, { n: 12, la: 3, lb: 5, target: 50, k: 7, si: 1, book: B.join(';') });
    B.push('9,4,7,48:4'); at(h, { n: 9, la: 4, lb: 7, target: 48, k: 4, si: 2, book: B.join(';') });
    B.push('10,4,6,47:x'); at(h, { n: 10, la: 4, lb: 6, target: 47, k: 0, si: 3, claim: true, book: B.join(';'), pick: '2,2' });
  },
};
