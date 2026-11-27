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
  'ef-3x2-x10'(h) {
    const t = h.role('t'), e = h.role('e');
    h.set(t, 'ka', 2); h.set(t, 'kb', 0); h.act({ t: 'settle' });   // 线段图：两条都剪掉一段 x（两边同时减 x）
    if (h.props(e).a !== 2 || h.props(e).c !== 0 || h.props(e).d !== 10) throw new Error('式子没跟着变：' + JSON.stringify(h.props(e)));
    if (!/两边同时减 x/.test(h.props(e).rows)) throw new Error('式子没写“两边同时减 x”：' + h.props(e).rows);
    h.set(t, 'ea', 0); h.set(t, 'eb', 8); h.act({ t: 'settle' });   // 线段图：两条右端各剪掉 2
    h.set(e, 'a', 1); h.set(e, 'd', 4); h.act({ t: 'settle' });   // 式子：两边 ÷ 2
    if (h.props(t).ka !== 1 || h.props(t).eb !== 4) throw new Error('线段图没跟着变：' + JSON.stringify(h.props(t)));
  },
  'ef-x5-12'(h) {
    const n = h.role('n'), e = h.role('e');
    h.set(n, 'g', 7); h.act({ t: 'settle' });   // 数轴：g 拖到 7，两个落点重合（改 g 不算一步）
    if (h.props(e).rows) throw new Error('改 g 不该让式子写一行');
    h.set(n, 'qb', 0); h.set(n, 'qd', 7); h.act({ t: 'settle' });   // 数轴：两个落点一起往左 5（两边同时减 5）
    if (h.props(e).b !== 0 || h.props(e).d !== 7) throw new Error('式子没跟着变：' + JSON.stringify(h.props(e)));
  },
  // 四种样子一起做：四块各做一步，每一步另外三块都跟着变；最后答追问（式子台的 pick）
  'ef4-2x3-11'(h) {
    const b = h.role('b'), e = h.role('e'), t = h.role('t'), n = h.role('n');
    h.set(b, 'lc', 2); h.set(b, 'rc', 10); h.act({ t: 'settle' });   // 天平：两边各拿走 1 个砝码
    h.set(t, 'ea', 1); h.set(t, 'eb', 9); h.act({ t: 'settle' });   // 线段图：两条右端各剪掉 1
    h.set(n, 'qb', 0); h.set(n, 'qd', 8); h.act({ t: 'settle' });   // 数轴：两个落点一起往左 1
    if ([h.props(b).lc, h.props(t).ea, h.props(e).b].join() !== '0,0,0') throw new Error('四块没有一起变成 2x = 8');
    h.set(e, 'a', 1); h.set(e, 'd', 4); h.act({ t: 'settle' });   // 式子：两边 ÷ 2
    if (h.props(b).lx !== 1 || h.props(t).ka !== 1 || h.props(n).qa !== 1 || h.props(n).qd !== 4) throw new Error('三块没跟着 ÷ 2');
    h.set(e, 'pick', '1');
  },
  'ef4-x5-12'(h) {
    const e = h.role('e'), n = h.role('n'), b = h.role('b');
    h.set(n, 'g', 7); h.act({ t: 'settle' });   // 数轴：先试 g = 7（不算一步）
    h.set(b, 'lc', 0); h.set(b, 'rc', 7); h.act({ t: 'settle' });   // 天平：两边各拿走 5 个砝码（式子跟着写一行，才能答追问）
    if (h.props(e).b !== 0 || h.props(e).d !== 7) throw new Error('式子没跟着变');
    h.set(e, 'pick', '2');
  },
  'ef4-3x2-x10'(h) {
    const b = h.role('b'), e = h.role('e'), t = h.role('t'), n = h.role('n');
    h.set(t, 'ka', 2); h.set(t, 'kb', 0); h.act({ t: 'settle' });   // 线段图：两条都剪掉一段 x
    if (h.props(b).lx !== 2 || h.props(b).rx !== 0 || h.props(n).qc !== 0) throw new Error('天平、数轴没跟着减 x');
    h.set(b, 'lc', 1); h.set(b, 'rc', 9); h.act({ t: 'settle' });   // 天平：两边各拿走 1 个砝码
    h.set(n, 'qb', 0); h.set(n, 'qd', 8); h.act({ t: 'settle' });   // 数轴：两个落点一起往左 1
    h.set(e, 'a', 1); h.set(e, 'd', 4); h.act({ t: 'settle' });   // 式子：两边 ÷ 2
    if (h.props(t).ka !== 1 || h.props(t).eb !== 4) throw new Error('线段图没跟着变');
    h.set(e, 'pick', '3');
  },
};
