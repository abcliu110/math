/* 器材包 arithbench（任务 H 第 4 步，见 next-steps.md §10.5.3–10.5.6）：算术工作台（竖式）。
 * 选择：算术工作台是 exprbench 之外的一个工作台（不是 exprbench 的模式）。它的器材 arithbench 只在 workbench 为 'arith' 的题目里列出；
 *   式子工作台处理方程，竖式处理两个数的加减乘，两者的步骤记录格式相同（scene.workbench），内核不同。
 * 台面上的竖式器材（arithbench）：props a、b、op（加 / 减 / 乘）。步骤写在台面的 scene.workbench 上（host 是这台器材，key 是算式）：
 *   - tool 'split'（拆数，规则 arith.split）：加法里点选一个数，拆成十位和个位（47 + 38 → 47 + 30 + 8）；
 *   - tool 'make-ten'（凑十，规则 arith.make-ten）：两个一位数相加、和超过 10 时凑十（8 + 5 → 8 + 2 + 3）；
 *   - tool 'col'（竖式算一列，规则 arith.column）：从个位起一列一列算，进位（加）或退位（减）写在下一列上。
 *   拆数、凑十只能在竖式还没开始算之前做，之后要先撤销。
 * 内核：U.ArithBench.replay(start, steps) 从头重放；撤销和重算都靠它。竖式只支持两个数的加减，乘法只支持一位数乘多位数（限制见 docs）。 */
(function (G) {
  'use strict';
  const U = G.U, K = U.kit;
  const OPS = ['+', '−', '×'];
  const PLACE = ['个', '十', '百', '千', '万'];
  const place = (i) => (PLACE[i] || '第' + (i + 1)) + '位';
  const digitAt = (n, i) => Math.floor(n / 10 ** i) % 10;
  const lenOf = (n) => String(n).length;
  const flatOf = (f) => (f.op === 'add' ? f.args.reduce((s, x) => s.concat(flatOf(x)), []) : [Number(f.n)]);
  const numNode = (n) => ({ op: 'num', n: BigInt(n) });

  // 算式（形式）：加、减、乘两个数
  function formOf(a, b, op) {
    const args = [numNode(a), numNode(b)];
    return op === 0 ? { op: 'add', args } : op === 1 ? { op: 'sub', args } : { op: 'mul', args };
  }
  // 开始状态：props 不合法时 error 说明原因（界面和 compute 都用它）
  function create(props) {
    const a = Math.max(0, Math.floor(Number(props.a) || 0)), b = Math.max(0, Math.floor(Number(props.b) || 0)), op = props.op | 0;
    const start = { a, b, op, form: formOf(a, b, op), error: null };
    if (op === 1 && a < b) start.error = '被减数小于减数，结果是负数，这里先不做';
    if (op === 2 && b > 9) start.error = '竖式这里只做一位数的乘法（第二个数要在 0 到 9 之间）';
    return start;
  }
  const keyOf = (props) => [props.a, props.op, props.b].join('|');
  // 竖式的各行：加法是算式里的所有数（拆开以后也一样），减法和乘法就是两个数
  const rowsOf = (st) => (st.op === 0 ? flatOf(st.form) : [st.a, st.b]);
  const baseOf = (rows) => Math.max(...rows.map(lenOf));

  // 第 i 列：cin 是从右边进来的进位（加）或退位（减）；返回这一列的全部数字
  function colCalc(rows, op, i, cin) {
    if (op === 0) {
      const parts = rows.map((r) => digitAt(r, i)), t = parts.reduce((s, x) => s + x, 0) + cin;
      return { parts, cin, total: t, digit: t % 10, carry: Math.floor(t / 10) };
    }
    if (op === 1) {
      const p = digitAt(rows[0], i), q = digitAt(rows[1], i), t = p - q - cin;
      return { parts: [p, q], cin, total: t, digit: t < 0 ? t + 10 : t, carry: t < 0 ? 1 : 0 };
    }
    const p = digitAt(rows[0], i), t = p * rows[1] + cin;
    return { parts: [p, rows[1]], cin, total: t, digit: t % 10, carry: Math.floor(t / 10) };
  }
  // 下一列要不要算：前面的列还要写进位（或退位）的数，或者还没到最高的一列
  function needNext(cols, base) {
    const i = cols.length;
    return i < base || (i > 0 && cols[i - 1].carry > 0);
  }
  const colText = (i, op, c, beyond) => {
    if (beyond) return place(i) + '：只剩进上来的 ' + c.cin + '，写 ' + c.digit;
    if (op === 0) return place(i) + '：' + c.parts.join(' + ') + (c.cin ? ' + ' + c.cin + '（进位）' : '') + ' = ' + c.total + '，写 ' + c.digit + (c.carry ? '，进 ' + c.carry : '');
    if (op === 1) return place(i) + '：' + c.parts[0] + ' − ' + c.parts[1] + (c.cin ? ' − ' + c.cin + '（退位）' : '') + (c.carry ? '，不够减，借 1 当 10，写 ' + c.digit + '，借 1' : ' = ' + c.digit + '，写 ' + c.digit);
    return place(i) + '：' + c.parts[0] + ' × ' + c.parts[1] + (c.cin ? ' + ' + c.cin + '（进位）' : '') + ' = ' + c.total + '，写 ' + c.digit + (c.carry ? '，进 ' + c.carry : '');
  };

  // 从头重放一串步骤。拆数、凑十走形式规则（U.applyRule）；竖式的一列按顺序算，错了就抛出原因。
  function replay(start, steps) {
    let form = start.form;
    if (start.error) {
      if (steps.length) throw new Error(start.error);
      return { start, form, steps: [], cols: [], rows: rowsOf({ op: start.op, a: start.a, b: start.b, form }), base: 0, result: null, error: start.error, lastError: null };
    }
    const cols = [], out = [];
    for (const s of steps) {
      const rows = rowsOf({ op: start.op, a: start.a, b: start.b, form });
      if (s.tool === 'col') {
        const base = baseOf(rows);
        if (!needNext(cols, base)) throw new Error('竖式已经算完了');
        const i = cols.length;
        if (s.args.col !== i) throw new Error(i ? '要从个位起一列一列算，先算' + place(i) : '要从个位算起');
        const cin = i ? cols[i - 1].carry : 0, c = colCalc(rows, start.op, i, cin);
        const beyond = i >= base;
        cols.push(c);
        out.push({ tool: 'col', rule: 'arith.column', ref: null, args: { col: i }, kept: true, why: colText(i, start.op, c, beyond) });
      } else if (s.tool === 'split' || s.tool === 'make-ten') {
        if (cols.length) throw new Error('竖式已经开始算了，要拆数或凑十，先撤销到竖式之前');
        if (start.op !== 0) throw new Error('拆数和凑十只用在加法上');
        const before = flatOf(form), r = U.applyRule(s.rule, U.val('form', form), s.ref, s.args);
        if (!r.ok) throw new Error(r.why);
        if (!r.kept) throw new Error('这一步破坏了不变量，已拒绝');
        form = r.value.data;
        const why = s.tool === 'split'
          ? '拆数：' + s.args.whole + ' = ' + s.args.parts.join(' + ')
          : '凑十：' + before.join(' + ') + ' = ' + flatOf(form).join(' + ');
        out.push({ tool: s.tool, rule: s.rule, ref: s.ref, args: s.args, kept: true, why });
      } else {
        throw new Error('没有这个工具：' + s.tool);
      }
    }
    const rows = rowsOf({ op: start.op, a: start.a, b: start.b, form });
    const base = baseOf(rows);
    const done = cols.length > 0 && !needNext(cols, base);
    let result = null;
    if (done) {
      result = cols.reduce((s, c, i) => s + c.digit * 10 ** i, 0);
      const want = start.op === 0 ? rows.reduce((s, x) => s + x, 0) : start.op === 1 ? start.a - start.b : start.a * start.b;
      if (result !== want) throw new Error('竖式算出的数和算式不一样');
    }
    return { start, form, steps: out, cols, rows, base, result, error: null, lastError: null };
  }

  // 工作台状态：没有步骤、或步骤的算式和现在的不一样，就从开始重算（旧历史不用）
  const stateOf = (scene, id, props) => {
    const wb = scene && scene.workbench;
    if (!wb || wb.host !== id || !Array.isArray(wb.steps) || !wb.steps.length || wb.key !== keyOf(props)) return null;
    try { return replay(create(props), wb.steps); } catch (e) { return null; }
  };
  const currentOf = (scene, id, props) => stateOf(scene, id, props) || replay(create(props), []);
  const fail = (st, why) => Object.assign({}, st, { lastError: why });

  // 一个工作台上的步骤写回台面（一个动作，撤销一次就回到上一步）
  const saveAction = (id, props, st) => ({
    t: 'wb', host: id, key: keyOf(props),
    steps: st.steps.map((s) => ({ tool: s.tool, rule: s.rule, ref: s.ref === undefined ? null : s.ref, args: s.args || {}, kept: true })),
  });

  // 做一步：先把它翻译成步骤，再整体重放检查。失败时 lastError 说明原因，步骤不变。
  function step(st, tool, args) {
    args = args || {};
    if (st.start.error) return fail(st, st.start.error);
    let s = null;
    if (tool === 'col') s = { tool, rule: 'arith.column', ref: null, args: { col: args.col } };
    else if (tool === 'make-ten') {
      if (st.start.op !== 0) return fail(st, '凑十只用在加法上');
      const f = st.form;
      if (f.op !== 'add' || f.args.length !== 2 || f.args.some((x) => x.op !== 'num')) return fail(st, '凑十要在两个数的加法上做，而且两个数都没拆过');
      s = { tool, rule: 'arith.make-ten', ref: [], args: {} };
    } else if (tool === 'split') {
      if (st.start.op !== 0) return fail(st, '拆数只用在加法上');
      const k = args.term;
      if (k === null || k === undefined) return fail(st, '先在算式里点选要拆的数');
      const t = st.form.op === 'add' ? st.form.args[k] : null;
      if (!t || t.op !== 'num') return fail(st, '这个数已经拆过了，或者没有选中一个数');
      const n = Number(t.n);
      if (n < 10) return fail(st, n + ' 只有一位，不用拆');
      if (n % 10 === 0) return fail(st, n + ' 是整十数，不用拆');
      s = { tool, rule: 'arith.split', ref: [k], args: { parts: [n - (n % 10), n % 10], whole: n } };
    } else return fail(st, '这个工具用在竖式里不合适：' + tool);
    const steps = st.steps.concat([s]);
    try {
      const next = replay(st.start, steps);
      return Object.assign(next, { lastError: null });
    } catch (e) {
      return fail(st, e.message);
    }
  }

  // 撤销：保留前 k 步，从开始重放
  function undo(st, k) {
    const n = Math.max(0, Math.min(k, st.steps.length));
    return replay(st.start, st.steps.slice(0, n).map((x) => ({ tool: x.tool, rule: x.rule, ref: x.ref, args: x.args })));
  }

  // 界面和判题要的文字
  const showState = (st) => {
    if (st.start.error) return st.start.error;
    const op = OPS[st.start.op], rows = st.rows;
    if (st.start.op === 0) return rows.join(' + ');
    return rows.join(' ' + op + ' ');
  };
  // 算式行的按钮：加法里每个还没拆的数是一个按钮（点选后拆）
  const exprParts = (st) => (st.form.op === 'add' ? st.form.args.map((x, k) => ({ k, text: x.op === 'num' ? String(x.n) : '(' + flatOf(x).join(' + ') + ')', plain: x.op === 'num' })) : []);

  U.ArithBench = {
    create, keyOf, rowsOf, baseOf, digitAt, lenOf, replay, stateOf, currentOf, step, undo, saveAction, showState, exprParts, needNext, place,
    tools(st) {
      if (st.start.op !== 0 || st.start.error) return [];
      return [{ id: 'split', label: '拆（选中的数）' }, { id: 'make-ten', label: '凑十' }];
    },
    // 步骤记录的文字（历史列表）
    stepLog(st) {
      return st.steps.map((s, i) => '第 ' + (i + 1) + ' 步：' + s.why);
    },
    // 结果（竖式算完才有）
    resultOf(st) { return st.result; },
  };

  U.registerPack({
    id: 'arithbench', version: 1,
    types: {
      arithbench: {
        workspaceRole: 'none',
        handles: true,
        inspector: 'arithbench',
        essence: ['E2'],
        label: '竖式工作台', prefix: '竖式', group: '数与运算', grades: [1, 4], alias: ['竖式', '进位', '退位', '凑十', '拆数', '加法', '减法', '乘法'],
        workbenches: ['arith'],
        props: {
          a: { type: 'int', label: '第一个数', default: 47, min: 0, max: 999 },
          op: { type: 'choice', label: '运算', default: 0, choices: ['加', '减', '乘'] },
          b: { type: 'int', label: '第二个数', default: 38, min: 0, max: 999 },
          label: { type: 'text', label: '标签', default: '' },
        },
        lint: { minProps: 1, why: '竖式工作台的数和运算写在它的属性里；步骤在检查器里做' },
        outputs: { result: { dim: null, kind: 'num', label: '竖式算出的结果（算完才有）' } },
        icon: () => K.text(30, 18, '47', { size: 12, weight: 700 }) + K.text(30, 32, '+ 38', { size: 12, weight: 700 }) + K.rect(12, 38, 40, 2, { fill: 'var(--ink)' }),
        size: () => [190, 110],
        compute: (c) => {
          const st = currentOf(c.scene, c.ent.id, c.props);
          if (st.start.error) { c.say('reject', st.start.error); return {}; }
          if (st.result === null) { c.say('info', '用竖式算：从个位算起'); return {}; }
          c.say('ok', showState(st) + ' = ' + st.result);
          return { result: U.val('num', U.Q(st.result), { dim: null }) };
        },
        badge: (c) => (c.out && c.out.result ? '= ' + c.out.result.data.n : ''),
        draw: (c) => {
          const st = currentOf(c.scene, c.ent.id, c.props);
          const txt = st.start.error ? '不能算' : showState(st);
          return K.text(c.w / 2, c.h / 2 - 6, c.props.label || '竖式工作台', { size: 12, weight: 700, fill: 'var(--dim)' }) +
            K.text(c.w / 2, c.h / 2 + 16, txt, { size: 15, weight: 700 }) +
            (st.result !== null ? K.text(c.w / 2, c.h - 8, '= ' + st.result, { size: 13, weight: 700, fill: 'var(--good)' }) : '');
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
