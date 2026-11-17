/* 器材包 logicbench：推理台（排除表）。表直接画在卡片上，不用开属性面板。
 *   行是人，列是几组属性（颜色、宠物……）。点一格：空 → ✗（不是）→ ✓（是）→ 空。
 *   标了 ✓，同一个人这一组的别的格、别人这一列的格自动标 ✗（只改空格）。
 *   一个人的某一组全是 ✗，或者某一列全是 ✗，标红“矛盾”。右边是线索，点一条把它划掉（用过了）。
 *   每个人每一组都有一个 ✓ 而且都对，就写“全部推出来了”；标满了但有不对的，写出有几格不对（不说是哪格）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700;
  const split = (t, re) => String(t || '').split(re).map((x) => x.trim()).filter(Boolean);
  function model(p) {
    const people = split(p.people, /[,，]/).slice(0, 4);
    const groups = split(p.groups, /[;；]/).map((g) => { const [name, vals] = g.split(/[:：]/); return { name: name.trim(), vals: split(vals, /[,，]/).slice(0, 4) }; }).slice(0, 2);
    const cols = []; groups.forEach((g, gi) => g.vals.forEach((v) => cols.push({ g: gi, v })));
    const marks = {}; split(p.marks, /;/).forEach((x) => { const [r, c, v] = x.split(',').map(Number); if (r < people.length && c < cols.length && (v === 1 || v === 2)) marks[r + ',' + c] = v; });
    const ans = {}; split(p.answer, /;/).forEach((x) => { const [who, vals] = x.split(':'); ans[who.trim()] = split(vals, /[,，]/); });
    const at = (r, c) => marks[r + ',' + c] || 0;
    const bad = []; people.forEach((_, r) => groups.forEach((g, gi) => { const cs = cols.map((c, i) => i).filter((i) => cols[i].g === gi); if (cs.every((i) => at(r, i) === 1)) bad.push('row' + r + 'g' + gi); }));
    cols.forEach((c, i) => { if (people.every((_, r) => at(r, i) === 1)) bad.push('col' + i); });
    let full = true, wrong = 0;
    people.forEach((who, r) => groups.forEach((g, gi) => { const yes = cols.map((c, i) => i).filter((i) => cols[i].g === gi && at(r, i) === 2); if (yes.length !== 1) full = false; else if (ans[who] && !ans[who].includes(cols[yes[0]].v)) wrong++; }));
    const used = split(p.used, /,/).map(Number), clues = split(p.clues, /[|｜]/);
    return { people, groups, cols, marks, at, bad, full, wrong, solved: full && wrong === 0 && bad.length === 0, used, clues };
  }
  // 点一格以后的新 marks
  function click(p, r, c) {
    const m = model(p), cur = m.at(r, c), next = (cur + 1) % 3, mk = Object.assign({}, m.marks);
    if (next) mk[r + ',' + c] = next; else delete mk[r + ',' + c];
    if (next === 2) {
      m.cols.forEach((col, i) => { if (i !== c && col.g === m.cols[c].g && !mk[r + ',' + i]) mk[r + ',' + i] = 1; });
      m.people.forEach((_, j) => { if (j !== r && !mk[j + ',' + c]) mk[j + ',' + c] = 1; });
    }
    return Object.entries(mk).map(([k, v]) => k + ',' + v).join(';');
  }
  const has = (p, who, val, v) => { const m = model(p), r = m.people.indexOf(who), c = m.cols.findIndex((x) => x.v === val); return r >= 0 && c >= 0 && m.at(r, c) === v; };
  function draw(c) {
    const p = c.props, m = model(p); let s = '';
    const X0 = 20, Y0 = 70, NW = 70, CW = 46, RH = 40;
    s += K.text(20, 26, '谁是谁？点格子：✗ 不是，✓ 是', { size: 16, weight: 700, anchor: 'start' });
    m.groups.forEach((g, gi) => { const cs = m.cols.map((x, i) => i).filter((i) => m.cols[i].g === gi); s += K.text(X0 + NW + (cs[0] + cs.length / 2) * CW, Y0 - 30, g.name, { size: 12, weight: 700, fill: '#5a6478' }); });
    m.cols.forEach((col, i) => { s += K.text(X0 + NW + i * CW + CW / 2, Y0 - 8, col.v, { size: 13, weight: 700, fill: m.bad.includes('col' + i) ? 'var(--bad)' : 'var(--ink)' }); });
    m.people.forEach((who, r) => {
      const y = Y0 + r * RH, rowBad = m.bad.some((b) => b.startsWith('row' + r + 'g'));
      s += K.text(X0 + NW - 10, y + 25, who, { size: 14, weight: 700, anchor: 'end', fill: rowBad ? 'var(--bad)' : 'var(--ink)' });
      m.cols.forEach((col, i) => {
        const v = m.at(r, i), x = X0 + NW + i * CW, sep = i > 0 && m.cols[i - 1].g !== col.g ? 6 : 0;
        const body = K.rect(x + 2 + sep / 2, y + 2, CW - 4, RH - 4, { fill: v === 2 ? '#d6ecff' : v === 1 ? '#eceff4' : '#fff', stroke: '#b8c0cc', r: 5, w: 1 }) + (v ? K.text(x + CW / 2 + sep / 2, y + 27, v === 2 ? '✓' : '✗', { size: 18, weight: 700, fill: v === 2 ? '#1d4fa3' : '#5f6773' }) : '');
        s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ marks: click(p, r, i) })) + '" style="cursor:pointer"><title>' + who + '：' + col.v + '</title>' + body + '</g>';
      });
    });
    const yB = Y0 + m.people.length * RH + 24;
    if (m.bad.length) s += K.text(X0, yB, '矛盾：有一个人的一组全是 ✗，或者一列全是 ✗', { size: 13, weight: 700, anchor: 'start', fill: 'var(--bad)' });
    else if (m.solved) s += '<g data-read="1">' + K.text(X0, yB, '全部推出来了：', { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + m.people.map((who, r) => K.text(X0, yB + 24 + r * 22, who + '：' + m.cols.filter((col, i) => m.at(r, i) === 2).map((col) => col.v).join('、'), { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' })).join('') + '</g>';
    else if (m.full) s += K.text(X0, yB, '每格都标了，可还有 ' + m.wrong + ' 处和线索对不上：再看看线索', { size: 13, weight: 700, anchor: 'start', fill: 'var(--bad)' });
    s += K.text(X0, yB + (m.solved ? 24 + m.people.length * 22 + 8 : 24), '标了 ✓，同一行这一组、同一列的空格会自动标 ✗', { size: 11, anchor: 'start', fill: '#5a6478' });
    // 线索
    const CX0 = 470;
    s += K.text(CX0, 54, '线索（点一条，划掉）', { size: 12, weight: 700, anchor: 'start', fill: '#5a6478' });
    m.clues.forEach((t, i) => {
      const y = 70 + i * 52, on = m.used.includes(i), nu = on ? m.used.filter((x) => x !== i) : m.used.concat([i]);
      const lines = []; for (let k = 0; k < t.length; k += 14) lines.push(t.slice(k, k + 14));
      const body = K.rect(CX0, y, 210, 46, { fill: on ? '#f1f3f6' : '#fffdf6', stroke: '#c5ccda', r: 6, w: 1 }) + lines.slice(0, 2).map((l, j) => K.text(CX0 + 8, y + 18 + j * 18, (j === 0 ? (i + 1) + '. ' : '   ') + l, { size: 12, anchor: 'start', fill: on ? '#8a94a6' : 'var(--ink)' })).join('') + (on ? K.line(CX0 + 6, y + 23, CX0 + 204, y + 23, { stroke: '#8a94a6', w: 1.4 }) : '');
      s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ used: nu.join(',') })) + '" style="cursor:pointer"><title>线索 ' + (i + 1) + '</title>' + body + '</g>';
    });
    return s;
  }
  U.registerPack({
    id: 'logicbench', version: 1,
    types: {
      logicbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E2', 'E9'],
        label: '推理台', prefix: '推理', group: '关系', grades: [2, 6],
        alias: ['推理', '排除法', '谁是谁', '排除表', '逻辑', '线索', '列表推理'],
        props: {
          people: { type: 'text', label: '人（逗号分开）', default: '小明,小红,小刚', write: true },
          groups: { type: 'text', label: '属性（组名：值,值；组名：值……）', default: '颜色：红,蓝,绿', write: true },
          clues: { type: 'text', label: '线索（用 | 分开）', default: '', write: true }, answer: { type: 'text', label: '答案（人:值,值;……）', default: '', write: true, hidden: true },
          marks: { type: 'text', label: '标记（自动）', default: '', write: true, hidden: true }, used: { type: 'text', label: '划掉的线索（自动）', default: '', write: true, hidden: true },
        },
        outputs: {
          solved: { dim: null, kind: 'num', label: '全部推出来了：1（推出来才有）' }, yes: { dim: null, kind: 'num', label: '标了几个 ✓' }, no: { dim: null, kind: 'num', label: '标了几个 ✗' },
        },
        icon: () => [0, 1, 2].map((r) => [0, 1, 2].map((cc) => K.rect(8 + cc * 14, 8 + r * 12, 12, 10, { fill: r === cc ? '#d6ecff' : '#eceff4', stroke: '#8a94a6', r: 1, w: 0.8 })).join('')).join('') + K.text(22, 46, '✓ ✗', { size: 9, weight: 700 }),
        size: () => [W, 400],
        grips: () => [],
        compute: (c) => { const m = model(c.props), v = Object.values(m.marks), o = { yes: num(v.filter((x) => x === 2).length), no: num(v.filter((x) => x === 1).length) }; if (m.solved) o.solved = num(1); return o; },
        badge: () => '',
        draw,
      },
    },
  });
  U.LogicBench = { model, click, has };
})(typeof globalThis !== 'undefined' ? globalThis : window);
