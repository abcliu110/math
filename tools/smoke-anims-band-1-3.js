// Smoke tests for apps/web/anims-band-1-3.js (1-3 年级注册表动画).
// Run: node tools/smoke-anims-band-1-3.js
// Minimal DOM stub (modelled on tools/smoke.js): innerHTML setter parses
// id="..." and registers fresh stub elements, so a render that rebuilds
// a container (grid / tree / table) gets new elements like a real browser
// (old handlers are discarded with the old elements).
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let pass = 0, fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('FAIL  ' + name); }
}

const root = path.resolve(__dirname, '..');
const bandSrc = fs.readFileSync(path.join(root, 'apps/web/anims-band-1-3.js'), 'utf8');
const registrySrc = fs.readFileSync(path.join(root, 'apps/web/anims-registry.js'), 'utf8');

// ---------- minimal DOM stub ----------
const byId = {};
function makeEl(tag) {
  const el = {
    tagName: (tag || 'div').toUpperCase(),
    children: [], dataset: {}, style: {}, hidden: false, _handlers: {},
    className: '', textContent: '', value: '', disabled: false, _html: '', _ids: [],
    classList: { _s: new Set(),
      add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); },
      toggle(c, f) { if (f === undefined) f = !this._s.has(c); if (f) this._s.add(c); else this._s.delete(c); return f; },
      contains(c) { return this._s.has(c); } },
    setAttribute(k, v) { this['attr:' + k] = String(v); },
    getAttribute(k) { return this['attr:' + k]; },
    removeAttribute(k) { delete this['attr:' + k]; },
    addEventListener(t, fn) { (this._handlers[t] = this._handlers[t] || []).push(fn); },
    appendChild(c) { this.children.push(c); c.parentNode = this; return c; },
    removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); c.parentNode = null; return c; },
    get firstChild() { return this.children[0] || null; },
    querySelector() { return makeEl('div'); },
    querySelectorAll() { return []; },
  };
  Object.defineProperty(el, 'innerHTML', {
    get() { return this._html; },
    set(v) {
      this._html = String(v);
      // Keep textContent in sync like a real DOM (stripped of tags).
      this.textContent = this._html.replace(/<[^>]*>/g, '');
      // Discard ids from the previous content (real browser destroys them).
      this._ids.forEach(function (id) { delete byId[id]; });
      this._ids = [];
      const re = /id="([^"]+)"/g;
      let m;
      while ((m = re.exec(this._html)) !== null) {
        if (!byId[m[1]]) byId[m[1]] = makeEl('div');
        this._ids.push(m[1]);
      }
      this.children = [];
    },
    configurable: true,
  });
  return el;
}
const documentStub = {
  getElementById(id) { if (!byId[id]) byId[id] = makeEl('div'); return byId[id]; },
  createElement(tag) { return makeEl(tag); },
  createElementNS(ns, tag) { return makeEl(tag); },
  querySelector() { return makeEl('div'); },
  querySelectorAll() { return []; },
  body: makeEl('body'),
  addEventListener() {},
};

// ---------- app.js helper stubs (render uses them behind typeof guards) ----------
const triedKeys = [];
const tiersCalls = [];
const tiersDone = [];
const discoveryCalls = [];
const sandbox = {
  console: console, Math: Math, JSON: JSON, Object: Object, Array: Array,
  String: String, Number: Number, document: documentStub, setTimeout: setTimeout,
  localStorage: { _s: {}, getItem(k) { return this._s[k] || null; }, setItem(k, v) { this._s[k] = String(v); } },
  markTried: function (k) { triedKeys.push(k); },
  makeTiers: function (el, labels, key) {
    tiersCalls.push({ key: key, labels: labels.slice() });
    return {
      done: function (i) { tiersDone.push({ key: key, idx: i }); },
      set: function () {},
    };
  },
  wireDiscovery: function (key, inputId, btnId, outId) {
    discoveryCalls.push({ key: key, inputId: inputId, btnId: btnId, outId: outId });
    const btn = documentStub.getElementById(btnId);
    btn.addEventListener('click', function () {
      const input = documentStub.getElementById(inputId);
      const out = documentStub.getElementById(outId);
      const text = (input.value || '').trim();
      if (!text) { out.textContent = '先写一句你的发现，再记下来。'; return; }
      out.textContent = '记下来了：' + text;
      input.value = '';
    });
  },
};
vm.createContext(sandbox);
vm.runInContext(registrySrc, sandbox, { filename: 'anims-registry.js' });
vm.runInContext(bandSrc, sandbox, { filename: 'anims-band-1-3.js' });
const REG = sandbox.ANIM_REGISTRY;

// ---------- helpers ----------
function click(id) {
  const elx = byId[id];
  if (!elx) throw new Error('no element #' + id);
  (elx._handlers.click || []).forEach(function (fn) { fn({}); });
}
function txt(id) { const elx = byId[id]; return elx ? elx.textContent : undefined; }
function renderAnim(key) {
  const c = documentStub.createElement('div');
  REG[key].render(c);
  return c;
}
function tiersDoneFor(key, idx) {
  return tiersDone.some(function (d) { return d.key === key && d.idx === idx; });
}
function testDiscovery(key) {
  const inp = byId[key + '-find'];
  inp.value = '测试发现';
  click(key + '-find-save');
  return (txt(key + '-find-saved') || '').indexOf('记下来了：测试发现') >= 0;
}

// ---------- static checks ----------
check('band file has no </script>', bandSrc.indexOf('</script>') < 0);
check('band file has no braces inside string literals', (function () {
  let i = 0;
  while (i < bandSrc.length) {
    const ch = bandSrc[i];
    if (ch === '"' || ch === "'") {
      const q = ch; let j = i + 1;
      while (j < bandSrc.length) {
        if (bandSrc[j] === '\\') { j += 2; continue; }
        if (bandSrc[j] === q) break;
        j++;
      }
      const s = bandSrc.slice(i + 1, j);
      if (s.indexOf('{') >= 0 || s.indexOf('}') >= 0) return false;
      i = j + 1;
    } else i++;
  }
  return true;
})());
check('band file uses no template literals or arrows', bandSrc.indexOf('`') < 0 && bandSrc.indexOf('=>') < 0);

// ---------- real point ids (grade-1/2/3 content files) ----------
const pointIds = new Set();
['grade-1.js', 'grade-2.js', 'grade-3.js'].forEach(function (f) {
  const src = fs.readFileSync(path.join(root, 'content/grades/' + f), 'utf8');
  const re = /id:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(src)) !== null) pointIds.add(m[1]);
});
check('grade files yield point ids (3.3, 3.9, 3.15a, 3.15b present)',
  pointIds.has('3.3') && pointIds.has('3.9') && pointIds.has('3.15a') && pointIds.has('3.15b'));

const NEW_KEYS = ['m33-ladder', 'm33-estimate', 'm33-ruler',
  'm39-sun', 'm39-compass', 'm39-route', 'm39-turn',
  'm315a-table', 'm315a-merge', 'm315a-missing',
  'm315b-array', 'm315b-tree', 'm315b-fix', 'm315b-mult'];
const EXPECTED = {
  'm33-ladder': { title: '单位楼梯装填', kind: '模拟', points: ['3.3'] },
  'm33-estimate': { title: '实测估测', kind: '实验', points: ['3.3'] },
  'm33-ruler': { title: '数轴即尺', kind: '演示', points: ['3.3'] },
  'm39-sun': { title: '太阳定方向', kind: '实验', points: ['3.9'] },
  'm39-compass': { title: '指南针针头不动', kind: '模拟', points: ['3.9'] },
  'm39-route': { title: '路线描', kind: '实验', points: ['3.9'] },
  'm39-turn': { title: '身体转面', kind: '模拟', points: ['3.9'] },
  'm315a-table': { title: '双向表填格+合计校验', kind: '模拟', points: ['3.15a'] },
  'm315a-merge': { title: '单表拼成复表', kind: '演示', points: ['3.15a'] },
  'm315a-missing': { title: '总数倒推缺失格', kind: '实验', points: ['3.15a'] },
  'm315b-array': { title: '搭配阵列数格子', kind: '模拟', points: ['3.15b'] },
  'm315b-tree': { title: '树形图分叉', kind: '演示', points: ['3.15b'] },
  'm315b-fix': { title: '固定一件数一遍', kind: '实验', points: ['3.15b'] },
  'm315b-mult': { title: '乘法原理推广', kind: '模拟', points: ['3.15b'] },
};
check('registry has all 14 new keys + m1a-pair example',
  NEW_KEYS.every(function (k) { return !!REG[k]; }) && !!REG['m1a-pair'] &&
  Object.keys(REG).length === 15);

// ---------- per-animation: registration + render + tiers + discovery ----------
NEW_KEYS.forEach(function (key) {
  const a = REG[key];
  const exp = EXPECTED[key];
  if (!a) {
    // Missing key: fail every per-animation check cleanly (no crash),
    // so a stash run reports FAILs instead of dying on first render.
    check(key + ': title/kind/grade/points match spec', false);
    check(key + ': render runs, shows title + guess-first + discovery', false);
    check(key + ': makeTiers wired with 3 levels', false);
    check(key + ': wireDiscovery wired with own ids', false);
    check(key + ': discovery input saves a finding', false);
    return;
  }
  check(key + ': title/kind/grade/points match spec',
    a.title === exp.title && a.kind === exp.kind && a.grade === 3 &&
    JSON.stringify(a.points) === JSON.stringify(exp.points) &&
    a.points.every(function (p) { return pointIds.has(p); }) &&
    typeof a.sub === 'string' && a.sub.length > 0);
  let html = '';
  try { html = renderAnim(key).innerHTML; } catch (e) { html = 'RENDER-THREW: ' + e.message; }
  check(key + ': render runs, shows title + guess-first + discovery',
    html.indexOf(exp.title) >= 0 && html.indexOf('先猜') >= 0 && html.indexOf('发现') >= 0);
  const tc = tiersCalls.filter(function (t) { return t.key === key; });
  check(key + ': makeTiers wired with 3 levels',
    tc.length === 1 && tc[0].labels.length === 3);
  const dc = discoveryCalls.filter(function (d) { return d.key === key; });
  check(key + ': wireDiscovery wired with own ids',
    dc.length === 1 && dc[0].inputId === key + '-find' &&
    dc[0].btnId === key + '-find-save' && dc[0].outId === key + '-find-saved');
  check(key + ': discovery input saves a finding', testDiscovery(key));
});

// ---------- flows ----------
// If any key is missing (e.g. stash run on pre-change code), the
// per-animation checks above already failed; skip the flows cleanly.
if (NEW_KEYS.some(function (k) { return !REG[k]; })) {
  console.log('\nsmoke-anims-band-1-3: ' + pass + ' passed, ' + fail + ' failed (flows skipped: keys missing)');
  process.exit(1);
}
// m33-ladder: wrong guess (100 for mm->cm), pack 10 boxes, verdict names the miss
renderAnim('m33-ladder');
click('m33-ladder-g-100');
for (let i = 0; i < 10; i++) click('m33-ladder-pack-btn');
check('m33-ladder L0: 10 boxes = 1 cm, wrong guess called out',
  (txt('m33-ladder-msg') || '').indexOf('装满了') >= 0 &&
  (txt('m33-ladder-msg') || '').indexOf('你刚才猜的是 100 个') >= 0 &&
  tiersDoneFor('m33-ladder', 0) && triedKeys.indexOf('m33-ladder') >= 0);
// m33-ladder challenge: m -> km is x1000, not x10
click('m33-ladder-level-2');
click('m33-ladder-g-1000');
for (let i = 0; i < 10; i++) click('m33-ladder-pack-btn');
check('m33-ladder L2: 1000 m = 1 km, x1000 not x10',
  (txt('m33-ladder-msg') || '').indexOf('1000 米 = 1 千米') >= 0 &&
  (txt('m33-ladder-msg') || '').indexOf('×1000，不是 ×10') >= 0 &&
  tiersDoneFor('m33-ladder', 2));

// m33-estimate: pencil box 30 cm = 2 zha; corridor 600 cm, step 40 cm = 15 steps
renderAnim('m33-estimate');
click('m33-estimate-g-1');
click('m33-estimate-measure');
check('m33-estimate L0: pencil box 30 cm guessed right, 2 zha',
  (txt('m33-estimate-msg') || '').indexOf('大约 30 厘米') >= 0 &&
  (txt('m33-estimate-msg') || '').indexOf('你猜对了') >= 0 &&
  (txt('m33-estimate-count') || '').indexOf('2 拃') >= 0 &&
  tiersDoneFor('m33-estimate', 0));
click('m33-estimate-level-2');
click('m33-estimate-g-1');
click('m33-estimate-measure');
click('m33-estimate-len-0');
check('m33-estimate L2: corridor 600 cm, 40 cm step = 15 steps',
  (txt('m33-estimate-msg') || '').indexOf('大约 600 厘米') >= 0 &&
  (txt('m33-estimate-count') || '').indexOf('15 步') >= 0 &&
  tiersDoneFor('m33-estimate', 2));

// m33-ruler: 40 cm = 4 dm; 65 cm = 6 dm 5 cm
renderAnim('m33-ruler');
click('m33-ruler-g-1');
for (let i = 0; i < 4; i++) click('m33-ruler-p-10');
click('m33-ruler-check');
check('m33-ruler L0: stops at 40 cm = 4 dm',
  (txt('m33-ruler-msg') || '').indexOf('40 厘米 = 4 分米') >= 0 &&
  (txt('m33-ruler-msg') || '').indexOf('你猜对了') >= 0 &&
  tiersDoneFor('m33-ruler', 0));
click('m33-ruler-level-1');
click('m33-ruler-g-1');
for (let i = 0; i < 6; i++) click('m33-ruler-p-10');
for (let i = 0; i < 5; i++) click('m33-ruler-p-1');
click('m33-ruler-check');
check('m33-ruler L1: stops at 65 cm = 6 dm 5 cm',
  (txt('m33-ruler-msg') || '').indexOf('65 厘米 = 6 分米 5 厘米') >= 0 &&
  tiersDoneFor('m33-ruler', 1));

// m39-sun: morning facing sun, left is north; evening left is south; back to sun faces west
renderAnim('m39-sun');
click('m39-sun-g-0');
click('m39-sun-right');
click('m39-sun-check');
check('m39-sun L0: morning, face east, left is north',
  (txt('m39-sun-msg') || '').indexOf('左手是北') >= 0 &&
  (txt('m39-sun-msg') || '').indexOf('你猜对了') >= 0 &&
  tiersDoneFor('m39-sun', 0));
click('m39-sun-level-1');
click('m39-sun-g-2');
click('m39-sun-left');
click('m39-sun-check');
check('m39-sun L1: evening, face west, left is south',
  (txt('m39-sun-msg') || '').indexOf('左手是南') >= 0 &&
  tiersDoneFor('m39-sun', 1));
click('m39-sun-level-2');
click('m39-sun-g-3');
click('m39-sun-left');
click('m39-sun-check');
check('m39-sun L2: morning back to sun, front is west',
  (txt('m39-sun-msg') || '').indexOf('前面是西') >= 0 &&
  tiersDoneFor('m39-sun', 2));

// m39-compass: rotate map, needle still north; wrong rotation count is refused
renderAnim('m39-compass');
click('m39-compass-g-n');
click('m39-compass-rot');
click('m39-compass-check');
check('m39-compass L0: after 90 deg, park still north of school',
  (txt('m39-compass-msg') || '').indexOf('公园还是在学校的北边') >= 0 &&
  (txt('m39-compass-msg') || '').indexOf('你猜对了') >= 0 &&
  tiersDoneFor('m39-compass', 0));
click('m39-compass-level-2');
click('m39-compass-g-s');
click('m39-compass-rot');
click('m39-compass-check');
check('m39-compass L2: 1 turn is not enough when 3 are required',
  (txt('m39-compass-msg') || '').indexOf('转 3 次') >= 0 &&
  !tiersDoneFor('m39-compass', 2));
click('m39-compass-rot');
click('m39-compass-rot');
click('m39-compass-check');
check('m39-compass L2: after 270 deg, supermarket still south',
  (txt('m39-compass-msg') || '').indexOf('超市还是在学校的南边') >= 0 &&
  tiersDoneFor('m39-compass', 2));

// m39-route: min steps; lake blocks; undo exists
renderAnim('m39-route');
click('m39-route-g-0');
click('m39-route-go-e'); click('m39-route-go-e'); click('m39-route-go-n');
check('m39-route L0: 3 steps to (2,1), route written out',
  (txt('m39-route-msg') || '').indexOf('到了') >= 0 &&
  (txt('m39-route-msg') || '').indexOf('最少只要 3 步') >= 0 &&
  (txt('m39-route-msg') || '').indexOf('向东走 2 格') >= 0 &&
  tiersDoneFor('m39-route', 0));
click('m39-route-level-2');
click('m39-route-g-0');
click('m39-route-go-e'); click('m39-route-go-e');
click('m39-route-go-n'); click('m39-route-go-n');
check('m39-route L2: lake at (2,2) refuses the step',
  (txt('m39-route-msg') || '').indexOf('湖，过不去') >= 0);
click('m39-route-go-e'); click('m39-route-go-n'); click('m39-route-go-n');
check('m39-route L2: around the lake, 6 steps to (3,3)',
  (txt('m39-route-msg') || '').indexOf('到了') >= 0 &&
  (txt('m39-route-msg') || '').indexOf('最少只要 6 步') >= 0 &&
  tiersDoneFor('m39-route', 2));

// m39-turn: facing north turn right, left is north; east about-face, left is south
renderAnim('m39-turn');
click('m39-turn-g-0');
click('m39-turn-right');
click('m39-turn-check');
check('m39-turn L0: face north, turn right, left is north',
  (txt('m39-turn-msg') || '').indexOf('左手是北') >= 0 &&
  tiersDoneFor('m39-turn', 0));
click('m39-turn-level-1');
click('m39-turn-g-2');
click('m39-turn-back');
click('m39-turn-check');
check('m39-turn L1: face east, about-face, left is south',
  (txt('m39-turn-msg') || '').indexOf('左手是南') >= 0 &&
  tiersDoneFor('m39-turn', 1));
click('m39-turn-level-2');
click('m39-turn-g-3');
click('m39-turn-left'); click('m39-turn-left');
click('m39-turn-check');
check('m39-turn L2: face south, turn left twice, left is west',
  (txt('m39-turn-msg') || '').indexOf('左手是西') >= 0 &&
  tiersDoneFor('m39-turn', 2));

// m315a-table: totals turn red when off, green when on; fill the blanks
renderAnim('m315a-table');
check('m315a-table L0: girls total is red (5 vs 18), boys total green (12)',
  byId['m315a-table-t-f'].style.color === '#dc2626' &&
  byId['m315a-table-t-m'].style.color === '#15803d');
click('m315a-table-g-1');
for (let i = 0; i < 13; i++) click('m315a-table-fj-plus');
click('m315a-table-check');
check('m315a-table L0: 13 in the blank, all totals match 30',
  (txt('m315a-table-msg') || '').indexOf('全对上了') >= 0 &&
  (txt('m315a-table-msg') || '').indexOf('总数 30 人') >= 0 &&
  tiersDoneFor('m315a-table', 0));
click('m315a-table-level-1');
click('m315a-table-g-1');
for (let i = 0; i < 9; i++) click('m315a-table-mj-plus');
for (let i = 0; i < 5; i++) click('m315a-table-fj-plus');
click('m315a-table-check');
check('m315a-table L1: 9 and 5 fill the two blanks, totals match 30',
  (txt('m315a-table-msg') || '').indexOf('全对上了') >= 0 &&
  tiersDoneFor('m315a-table', 1));

// m315a-merge: two single tables become one compound table
renderAnim('m315a-merge');
click('m315a-merge-g-1');
click('m315a-merge-merge-btn');
click('m315a-merge-check');
check('m315a-merge L0: running total 8 + 5 = 13',
  (txt('m315a-merge-msg') || '').indexOf('8 + 5 = 13 人') >= 0 &&
  tiersDoneFor('m315a-merge', 0));
click('m315a-merge-level-1');
click('m315a-merge-g-1');
click('m315a-merge-merge-btn');
click('m315a-merge-check');
check('m315a-merge L1: jump rope total 9 + 5 = 14',
  (txt('m315a-merge-msg') || '').indexOf('9 + 5 = 14 人') >= 0 &&
  tiersDoneFor('m315a-merge', 1));

// m315a-missing: total minus known = blank
renderAnim('m315a-missing');
click('m315a-missing-g-1');
click('m315a-missing-solve');
check('m315a-missing L0: 30 - 17 = 13',
  (txt('m315a-missing-steps') || '').indexOf('− 已知 17') >= 0 &&
  (txt('m315a-missing-steps') || '').indexOf('= 13') >= 0 &&
  (txt('m315a-missing-msg') || '').indexOf('空格是 13 人') >= 0 &&
  tiersDoneFor('m315a-missing', 0));
click('m315a-missing-level-1');
click('m315a-missing-g-1');
click('m315a-missing-solve');
check('m315a-missing L1: 30 - 25 = 5',
  (txt('m315a-missing-steps') || '').indexOf('− 已知 25') >= 0 &&
  (txt('m315a-missing-steps') || '').indexOf('= 5') >= 0 &&
  tiersDoneFor('m315a-missing', 1));
click('m315a-missing-level-2');
click('m315a-missing-g-1');
click('m315a-missing-solve');
check('m315a-missing L2: 40 - 27 = 13',
  (txt('m315a-missing-steps') || '').indexOf('− 已知 27') >= 0 &&
  (txt('m315a-missing-steps') || '').indexOf('= 13') >= 0 &&
  tiersDoneFor('m315a-missing', 2));

// m315b-array: cells = combos; addition trap called out; custom counts rebuild
renderAnim('m315b-array');
click('m315b-array-g-1');
['0-0', '0-1', '0-2', '1-0', '1-1', '1-2'].forEach(function (c) { click('m315b-array-cell-' + c); });
check('m315b-array L0: 6 cells = 6 combos, 2+3=5 would miss 1',
  (txt('m315b-array-msg') || '').indexOf('格子数 6 = 搭配数 6 种') >= 0 &&
  (txt('m315b-array-msg') || '').indexOf('2 + 3 = 5') >= 0 &&
  tiersDoneFor('m315b-array', 0));
click('m315b-array-tops-plus');
check('m315b-array custom: 3 tops rebuilds the grid question',
  (txt('m315b-array-q') || '').indexOf('3 件上衣') >= 0);

// m315b-tree: leaves = combos
renderAnim('m315b-tree');
click('m315b-tree-g-1');
click('m315b-tree-top-0');
click('m315b-tree-leaf-0-0'); click('m315b-tree-leaf-0-1');
click('m315b-tree-top-1');
click('m315b-tree-leaf-1-0'); click('m315b-tree-leaf-1-1');
check('m315b-tree L0: 4 leaves = 4 combos',
  (txt('m315b-tree-msg') || '').indexOf('叶子 4 片 = 搭配 4 种') >= 0 &&
  tiersDoneFor('m315b-tree', 0));
click('m315b-tree-level-2');
click('m315b-tree-g-1');
click('m315b-tree-grow-all');
for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) click('m315b-tree-leaf-' + i + '-' + j);
check('m315b-tree L2: 9 leaves = 9 combos',
  (txt('m315b-tree-msg') || '').indexOf('叶子 9 片 = 搭配 9 种') >= 0 &&
  tiersDoneFor('m315b-tree', 2));

// m315b-fix: fix one top, count its bottoms, add up
renderAnim('m315b-fix');
click('m315b-fix-g-1');
click('m315b-fix-bot-0'); click('m315b-fix-bot-1'); click('m315b-fix-bot-2');
check('m315b-fix L0: red top counted 3, auto-advances to yellow top',
  (txt('m315b-fix-tally') || '').indexOf('红上衣 3 种') >= 0 &&
  (txt('m315b-fix-fixed-name') || '') === '黄上衣');
click('m315b-fix-bot-0'); click('m315b-fix-bot-1'); click('m315b-fix-bot-2');
check('m315b-fix L0: 3 + 3 = 6 combos',
  (txt('m315b-fix-msg') || '').indexOf('3 + 3 = 6 种') >= 0 &&
  tiersDoneFor('m315b-fix', 0));

// m315b-mult: enumerate the combos; product updates when counts change
renderAnim('m315b-mult');
click('m315b-mult-g-1');
click('m315b-mult-enum');
check('m315b-mult L0: 2 x 3 lists 6 combos',
  (txt('m315b-mult-list') || '').indexOf('一共 6 种') >= 0 &&
  (txt('m315b-mult-msg') || '').indexOf('2 × 3 = 6 种') >= 0 &&
  tiersDoneFor('m315b-mult', 0));
click('m315b-mult-level-2');
click('m315b-mult-g-1');
click('m315b-mult-enum');
check('m315b-mult L2: 3 x 3 x 2 lists 18 combos',
  (txt('m315b-mult-list') || '').indexOf('一共 18 种') >= 0 &&
  tiersDoneFor('m315b-mult', 2));
renderAnim('m315b-mult');
click('m315b-mult-cat-0-plus');
check('m315b-mult custom: 3 tops makes 3 x 3 = 9',
  (txt('m315b-mult-prod') || '') === '3 × 3 = 9 种');

console.log('\nsmoke-anims-band-1-3: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
