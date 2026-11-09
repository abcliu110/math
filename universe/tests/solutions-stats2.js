/* 三年级复式统计表题的参考解（problems/missing-stats2.js）：用 h 搭一张复式统计表，必须能让该题通关（满足 goal）。 */
'use strict';
module.exports = {
  'g3-twoway-total-core'(h) { h.add('twoway', { data: '3,2;1,4' }); },
  'g3-twoway-total-trap'(h) { h.add('twoway', { data: '3,2;1,4' }); },
  'g3-twoway-zero-core'(h) { h.add('twoway', { data: '2,0,1;0,3,0' }); },
  'g3-twoway-zero-trap'(h) { h.add('twoway', { data: '2,0,1;0,3,0' }); },
};
