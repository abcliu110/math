/* node tests/ui-workbench.js —— 题目声明工作台（D2，docs/direction.md 5.2 和第 7 节 D2）。
 * (a) 几何题（题目 workbench: 'geometry'）：打开后器材架只列几何工作台声明过的器材（器材的 workbenches 里写了 geometry），
 *     不列全部器材；shelf 之外的器材变灰，和以前一样；
 * (b) 旧题（没有 workbench）：器材架列出全部可见器材，和以前一样（器材的 workbenches 不影响关系画布）；
 * (c) lint：workbench 只认 U.WORKBENCHES 里的值；器材的 workbenches 写错要报错；几何题的器材架里有非几何器材要提醒；
 * (d) 题库里所有题目的 lint 没有错误。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const G = require('./gestures');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  G.attachErrorCollector(p);
  await p.goto(url); await p.waitForTimeout(300);

  // 页面里算出的“应该列出的器材”：可见（不是 hidden）、并且声明了工作台
  const expectGeo = () => Object.keys(U.types).filter((id) => { const t = U.types[id]; return !t.hidden && Array.isArray(t.workbenches) && t.workbenches.includes('geometry'); }).sort();
  const expectAll = () => Object.keys(U.types).filter((id) => !U.types[id].hidden).sort();
  const shelfOf = () => p.evaluate(() => [...document.querySelectorAll('#shelfbody .tile')].map((t) => ({ type: t.dataset.type, off: t.classList.contains('off') })));
  const openAndRead = (pid) => p.evaluate((pid) => { UI.App.openProblem(pid, 'practice'); return null; }, pid).then(() => p.waitForTimeout(200)).then(shelfOf);

  console.log('几何题：打开后直接是几何工作台，器材架只列几何工作台的器材');
  const geoIds = await p.evaluate(() => U.problems.filter((q) => q.workbench === 'geometry').map((q) => q.id));
  ok(geoIds.length === 2 && geoIds.indexOf('geo-median-area') >= 0 && geoIds.indexOf('geo-pgram-cut') >= 0, '声明了几何工作台的题目：' + geoIds.join('、'));
  for (const pid of geoIds) {
    const tiles = await openAndRead(pid);
    const types = tiles.map((t) => t.type).sort();
    const want = await p.evaluate(expectGeo);
    const all = await p.evaluate(expectAll);
    ok(JSON.stringify(types) === JSON.stringify(want), pid + '：器材架正好是几何工作台的器材（' + types.length + ' 种）：' + types.join('、'));
    ok(types.length < all.length / 4, pid + '：器材架不包含全部器材（全部可见 ' + all.length + ' 种，只列 ' + types.length + ' 种）');
    const bad = types.filter((t) => ['tri', 'circle', 'rect', 'num', 'op', 'ftri', 'fquad', 'figrel'].includes(t));
    ok(bad.length === 0, pid + '：没有列出其他领域的器材' + (bad.length ? '（多出 ' + bad.join('、') + '）' : ''));
    const onList = await p.evaluate((pid) => { const q = U.problemById(pid); return [...document.querySelectorAll('#shelfbody .tile')].every((t) => t.classList.contains('off') === !q.shelf.includes(t.dataset.type)); }, pid);
    ok(onList, pid + '：题目 shelf 之外的器材仍然变灰（和以前一样）');
    const hasGpt = types.indexOf('gpt') >= 0 && types.indexOf('gworkspace') >= 0 && types.indexOf('figmeasure') >= 0;
    ok(hasGpt, pid + '：几何工作台的自由点、几何工作区、量图形都在器材架上');
  }

  console.log('旧题：没有 workbench 的题目，器材架和以前一样');
  const oldIds = ['g8-congruent-sss-core', 'g9-similar-tri-core'];
  for (const pid of oldIds) {
    const hasWb = await p.evaluate((pid) => U.problemById(pid).workbench === undefined, pid);
    ok(hasWb, pid + '：没有写 workbench（默认关系画布）');
    const tiles = await openAndRead(pid);
    const types = tiles.map((t) => t.type).sort();
    const all = await p.evaluate(expectAll);
    ok(JSON.stringify(types) === JSON.stringify(all), pid + '：器材架列出全部可见器材（' + types.length + ' 种，和以前一样）');
    const onList = await p.evaluate((pid) => { const q = U.problemById(pid); return [...document.querySelectorAll('#shelfbody .tile')].every((t) => t.classList.contains('off') === !q.shelf.includes(t.dataset.type)); }, pid);
    ok(onList, pid + '：shelf 之外的器材变灰（和以前一样）');
    const ftri = types.indexOf('ftri') >= 0 && types.indexOf('rect') >= 0;
    ok(ftri, pid + '：图形类器材（三角形、长方形）照常列出');
  }
  const allGraph = await p.evaluate(() => Object.values(U.types).every((t) => U.onWorkbenchShelf(t, 'graph')));
  ok(allGraph, '关系画布的器材架对所有器材都成立（onWorkbenchShelf 对 graph 恒真）');

  console.log('lint：workbench 和器材的 workbenches 都要检查');
  const lint = await p.evaluate(() => {
    const base = U.problemById('geo-median-area');
    const bad = U.problemLint(Object.assign({}, base, { workbench: 'nope' })).errors;
    const good = U.problemLint(Object.assign({}, base, { workbench: 'geometry' })).errors;
    const noWb = U.problemLint(Object.assign({}, base, { workbench: undefined })).errors;
    const warn = U.problemLint(Object.assign({}, base, { workbench: 'geometry', shelf: ['num', 'gmid'] })).warnings;
    const typeBad = U.lintType(Object.assign({}, U.types.gpt, { workbenches: ['nope'] })).errors;
    const typeGood = U.lintType(U.types.gpt).errors;
    const bankErrs = U.problemLintAll(U.problems).errors;
    return { bad, good, noWb, warn, typeBad, typeGood, bankErrs: Object.keys(bankErrs) };
  });
  ok(lint.bad.some((m) => m.indexOf('workbench 只能是') >= 0), '未知的 workbench（nope）报错：' + (lint.bad[0] || '没有报错'));
  ok(lint.good.length === 0, 'workbench: geometry 的几何题 lint 通过');
  ok(lint.noWb.length === 0, '没有 workbench 字段也通过 lint（默认关系画布）');
  ok(lint.warn.some((m) => m.indexOf('num') >= 0), '几何题的器材架里有 num（不在几何工作台里）时提醒');
  ok(lint.typeBad.some((m) => m.indexOf('workbenches') >= 0), '器材的 workbenches 写了未知工作台时报错');
  ok(lint.typeGood.length === 0, '几何工作台的器材（gpt）声明通过 lint');
  ok(lint.bankErrs.length === 0, '题库里所有题目的 lint 没有错误' + (lint.bankErrs.length ? '：' + lint.bankErrs.join('、') : ''));

  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n题目工作台测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
