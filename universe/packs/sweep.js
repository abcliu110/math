/* 器材包 sweep：扫描。让一个量从“起点”变到“终点”，每一步看另一个量怎么变，收成一张表。
 *   扫描变量（sweepx）：一个会变的数 x。手动拖“当前值”，下游跟着变；也交给取值表去一步步扫。
 *   取值表（sweeptab）：接上 x（来自扫描变量）和 y（接在 x 后面任意一串器材的结果），自动把 x 从 [从, 到] 每隔 [步长] 取一遍，
 *     每取一个 x，就把整个台面重新算一遍，记下 y。出一张 x‑y 的数据表，还给出最大（小）值在哪。
 *     数据表可以直接接拟合器、散点图、数据列：从“调一个参数看一个结果”变成“看整个变化的样子”。
 * 实现：取值表复制一份台面，在副本里改扫描变量的当前值再求值；副本里去掉所有取值表，所以不会无限套娃。
 *   取值点最多 100 个。x、y 全是精确有理数（y 近似的，整张表标近似）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const MAXN = 100;
  const num = (q) => U.val('num', q);

  U.registerPack({
    id: 'sweep', version: 1, needs: ['core@1'],
    types: {
      sweepx: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E6', 'E8'],
        label: '扫描变量', prefix: '扫', group: '函数', grades: [5, 9], alias: ['变量', '参数', '扫描', '变化的量', 'x'],
        props: {
          cur: { type: 'rat', label: '当前值', default: 1, min: -100000, max: 100000 },
          from: { type: 'rat', label: '从', default: 1, min: -100000, max: 100000 },
          to: { type: 'rat', label: '到', default: 10, min: -100000, max: 100000 },
          step: { type: 'rat', label: '步长', default: 1, min: 0.0001, max: 100000 },
        },
        inputs: {},
        outputs: { x: { dim: null, kind: 'num', label: 'x' } },
        icon: () => K.line(8, 40, 56, 40, { w: 2 }) + [12, 24, 36, 48].map((x) => K.circle(x, 40, 3, { fill: 'var(--accent)' })).join('') + K.text(32, 24, 'x', { size: 20, weight: 700 }),
        size: () => [170, 100],
        compute: (c) => {
          let q; try { q = Q.parse(c.props.cur); } catch (e) { c.say('reject', '当前值要填有理数'); return {}; }
          return { x: num(q) };
        },
        badge: (c) => (c.out.x ? U.showVal(c.out.x) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 4, 'x = ' + (c.out.x ? Q.showDec(c.out.x.data, 3) : '—'), { size: 22, weight: 700 }) +
          K.text(c.w / 2, c.h - 14, String(c.props.from) + ' … ' + String(c.props.to) + '，每次 ' + String(c.props.step), { size: 11, fill: 'var(--dim)' }),
      },

      sweeptab: {
        workspaceRole: 'none',
        handles: true,
        readsScene: true,   // 要复制整个台面重新算，输入不全在连线上：增量求值时每次都算
        essence: ['E6', 'E8'],
        label: '取值表', prefix: '表', group: '函数', grades: [5, 9], alias: ['扫描表', '函数表', '列表', '数表', '变化', '最大值', '最小值'],
        props: {
          goal: { type: 'choice', label: '找', default: 0, choices: ['最大值', '最小值'] },
          digits: { type: 'int', label: '显示小数位', default: 2, min: 0, max: 6 },
          rows: { type: 'int', label: '卡片上显示几行', default: 5, min: 2, max: 10 },
        },
        inputs: { x: { kind: 'num', label: 'x（接扫描变量）' }, y: { kind: 'num', label: 'y（接结果）' } },
        outputs: {
          t: { dim: null, kind: 'table', label: 'x‑y 表' },
          best: { dim: null, kind: 'num', label: '最大（小）的 y' },
          at: { dim: null, kind: 'num', label: '在哪个 x' },
          count: { dim: null, kind: 'num', label: '取了几个点' },
        },
        icon: () => K.rect(10, 10, 44, 44, { stroke: 'var(--ink)', r: 3 }) + K.line(10, 24, 54, 24) + K.line(10, 38, 54, 38) + K.line(32, 10, 32, 54),
        size: () => [240, 190],
        compute: (c) => {
          const S = c.scene, id = c.ent.id;
          const from = S && S.links.find((l) => l.to === id && l.toPort === 'x'), to = S && S.links.find((l) => l.to === id && l.toPort === 'y');
          if (!from || !to) { c.say('info', '把扫描变量接到 x，把结果接到 y'); return {}; }
          const sx = S.entities[from.from];
          if (!sx || sx.type !== 'sweepx') { c.say('info', 'x 要接扫描变量'); return {}; }
          let lo, hi, st;
          try { lo = Q.parse(sx.props.from); hi = Q.parse(sx.props.to); st = Q.parse(sx.props.step); } catch (e) { c.say('reject', '从、到、步长要填有理数'); return {}; }
          if (st.n <= 0n) { c.say('reject', '步长要大于 0'); return {}; }
          if (Q.cmp(hi, lo) < 0) { c.say('reject', '“到”不能比“从”小'); return {}; }
          const xs = [];
          for (let v = lo; Q.cmp(v, hi) <= 0; v = Q.add(v, st)) { xs.push(v); if (xs.length > MAXN) { c.say('reject', '取值点太多（最多 ' + MAXN + ' 个）：把步长调大一点'); return {}; } }
          // 副本：去掉所有取值表（不套娃），只改扫描变量的当前值
          const cl = U.JSON.parse(U.JSON.stringify(S));
          for (const k of Object.keys(cl.entities)) if (cl.entities[k].type === 'sweeptab') delete cl.entities[k];
          cl.links = cl.links.filter((l) => cl.entities[l.from] && cl.entities[l.to]);
          const rows = []; let exact = true, missing = 0;
          for (const v of xs) {
            cl.entities[from.from].props.cur = Q.store(v);
            const D = U.World.evaluate(cl, { trace: false });
            const o = D[to.from] && D[to.from].out[to.fromPort];
            if (!o || o.kind !== 'num') { missing++; continue; }
            if (o.exact === false) exact = false;
            rows.push([v, o.data]);
          }
          if (!rows.length) { c.say('info', 'y 在整个范围里都没有值（上游没接好？）'); return {}; }
          if (missing) c.say('info', '有 ' + missing + ' 个 x 算不出 y，已跳过');
          let bi = 0;
          rows.forEach((r, i) => { const d = Q.cmp(r[1], rows[bi][1]); if (c.props.goal === 0 ? d > 0 : d < 0) bi = i; });
          const t = { cols: [{ name: 'x', dim: null }, { name: 'y', dim: null }], rows };
          const o = (q) => U.val('num', q, { exact });
          return { t: U.val('table', t, { exact }), best: o(rows[bi][1]), at: num(rows[bi][0]), count: num(Q(rows.length)) };
        },
        badge: (c) => (c.out.count ? c.out.count.data.n + ' 点' : ''),
        draw: (c) => {
          if (!c.out.t) return K.text(c.w / 2, c.h / 2 + 4, '接上 x 和 y', { size: 14, fill: 'var(--dim)' });
          const rs = c.out.t.data.rows, d = c.props.digits, n = Math.min(c.props.rows, rs.length);
          let h = K.text(c.w * 0.25, 22, 'x', { size: 13, weight: 700 }) + K.text(c.w * 0.7, 22, 'y', { size: 13, weight: 700 }) + K.line(12, 28, c.w - 12, 28);
          for (let i = 0; i < n; i++) {
            const r = rs[n === rs.length ? i : Math.round(i * (rs.length - 1) / (n - 1))];   // 太多行就均匀挑几行
            h += K.text(c.w * 0.25, 46 + i * 18, Q.showDec(r[0], d), { size: 12 }) + K.text(c.w * 0.7, 46 + i * 18, Q.showDec(r[1], d), { size: 12 });
          }
          if (c.out.best) h += K.text(c.w / 2, c.h - 10, (c.props.goal === 0 ? '最大 ' : '最小 ') + Q.showDec(c.out.best.data, d) + '（x = ' + Q.showDec(c.out.at.data, d) + '）', { size: 12, weight: 700, fill: 'var(--accent)' });
          return h;
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
