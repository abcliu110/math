/* “牛吃草”题的参考解（problems/grassbench.js）。r 每天长几份，t3 要问的牛吃几天；k 一天一天看时的牛数。 */
'use strict';
module.exports = {
  'gr-10-15-25'(h) { h.set(h.role('gr'), 'r', 5); h.set(h.role('gr'), 't3', 5); },
  'gr-27-23-21'(h) { h.set(h.role('gr'), 'r', 15); h.set(h.role('gr'), 't3', 12); },
  'gr-day-by-day'(h) { h.set(h.role('gr'), 'k', 14); },
};
