/* 一个道理，几种样子（problems/forms.js）的参考解：一步在天平上做，一步在式子上做，每一步都靠联动组同步到另一台。 */
'use strict';
module.exports = {
  'ef-2x3-11'(h) {
    const b = h.role('b'), e = h.role('e');
    for (let i = 0; i < 3; i++) { h.set(b, 'lc', 3 - i - 1); h.set(b, 'rc', 11 - i - 1); h.act({ t: 'settle' }); }   // 天平：两边各拿走 1 个砝码，做三次
    if (h.props(e).b !== 0 || h.props(e).d !== 8) throw new Error('式子没跟着变：' + JSON.stringify(h.props(e)));
    h.set(e, 'a', 1); h.set(e, 'd', 4); h.act({ t: 'settle' });   // 式子：两边 ÷ 2
    if (h.props(b).lx !== 1 || h.props(b).rc !== 4) throw new Error('天平没跟着变：' + JSON.stringify(h.props(b)));
  },
};
