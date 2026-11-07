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
  'm315b-array', 'm315b-tree', 'm315b-fix', 'm315b-mult',
  'm31-day', 'm32-blocks', 'm32-est', 'm32-vert',
  'm34-table', 'm34-groups', 'm35-dots', 'm35-est', 'm35-vert',
  'm36-drag', 'm36-nest', 'm37-div', 'm38-three',
  'm310-trial', 'm310-check', 'm311-dots',
  'm312-cut', 'm312-unit', 'm313-leap',
  'm314-money', 'm314-zoom', 'm314-frac'];
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
  'm31-day': { title: '作息时间线', kind: '实验', points: ['3.1'] },
  'm32-blocks': { title: '数位块拼拆换', kind: '模拟', points: ['3.2'] },
  'm32-est': { title: '先估后算（加减法）', kind: '演示', points: ['3.2'] },
  'm32-vert': { title: '竖式与数位块同色对应', kind: '演示', points: ['3.2'] },
  'm34-table': { title: '双数轴/比例表', kind: '模拟', points: ['3.4'] },
  'm34-groups': { title: '实物分组“几个几”', kind: '实验', points: ['3.4'] },
  'm35-dots': { title: '点阵分组累加', kind: '模拟', points: ['3.5'] },
  'm35-est': { title: '先估后算（乘法）', kind: '演示', points: ['3.5'] },
  'm35-vert': { title: '竖式与面积块同色对应', kind: '演示', points: ['3.5'] },
  'm36-drag': { title: '拖拽变形看不变性', kind: '模拟', points: ['3.6'] },
  'm36-nest': { title: '包含图嵌套', kind: '演示', points: ['3.6'] },
  'm37-div': { title: '分数即分一份', kind: '实验', points: ['3.7'] },
  'm38-three': { title: '三圈种花', kind: '实验', points: ['3.8'] },
  'm310-trial': { title: '试商调商', kind: '模拟', points: ['3.10'] },
  'm310-check': { title: '乘法验算倒推', kind: '实验', points: ['3.10'] },
  'm311-dots': { title: '点阵→空格阵', kind: '模拟', points: ['3.11'] },
  'm312-cut': { title: '切一切再拼', kind: '实验', points: ['3.12'] },
  'm312-unit': { title: '单位进率方格', kind: '演示', points: ['3.12'] },
  'm313-leap': { title: '闰年成因', kind: '实验', points: ['3.13'] },
  'm314-money': { title: '钱币元角分', kind: '演示', points: ['3.14'] },
  'm314-zoom': { title: '数轴放大镜', kind: '模拟', points: ['3.14'] },
  'm314-frac': { title: '分数改写小数', kind: '演示', points: ['3.14'] },
};
check('registry has all 14 new keys + m1a-pair example',
  NEW_KEYS.every(function (k) { return !!REG[k]; }) && !!REG['m1a-pair'] &&
  Object.keys(REG).length === 37);

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

// ---------- 第二批流程：3 年级剩余 12 个点，22 个新动画 ----------
// m31-day: wrong guess is named, tier not done; right guesses complete all 3 tiers
renderAnim('m31-day');
click('m31-day-g-0');
click('m31-day-count');
check('m31-day L0 wrong guess: 7小时30分 named, tier not done',
  (txt('m31-day-msg') || '').indexOf('你刚才猜的是 7小时30分') >= 0 &&
  !tiersDoneFor('m31-day', 0));
click('m31-day-reset');
click('m31-day-g-1');
click('m31-day-count');
check('m31-day L0: 8:00 to 16:30 is 8 hours 30 min',
  (txt('m31-day-msg') || '').indexOf('8 小时 30 分') >= 0 &&
  (txt('m31-day-msg') || '').indexOf('你猜对了') >= 0 &&
  tiersDoneFor('m31-day', 0) && triedKeys.indexOf('m31-day') >= 0);
click('m31-day-level-1');
click('m31-day-g-2');
click('m31-day-count');
check('m31-day L1: awake 7:00 to 21:00 is 14 hours',
  (txt('m31-day-msg') || '').indexOf('14 小时') >= 0 &&
  tiersDoneFor('m31-day', 1));
click('m31-day-level-2');
click('m31-day-g-1');
click('m31-day-count');
check('m31-day L2: lunch break 12:00 to 13:30 is 1 hour 30 min',
  (txt('m31-day-msg') || '').indexOf('1 小时 30 分') >= 0 &&
  tiersDoneFor('m31-day', 2));

// m32-blocks: 12 ones -> 1 ten 2 ones; 1000 borrow chain -> 9 hundreds 9 tens 10 ones
renderAnim('m32-blocks');
click('m32-blocks-g-1');
click('m32-blocks-ex');
check('m32-blocks L0: 12 ones = 1 ten and 2 ones',
  (txt('m32-blocks-msg') || '').indexOf('1 个十和 2 个一') >= 0 &&
  (txt('m32-blocks-msg') || '').indexOf('你猜对了') >= 0 &&
  tiersDoneFor('m32-blocks', 0) && triedKeys.indexOf('m32-blocks') >= 0);
click('m32-blocks-level-1');
click('m32-blocks-g-1');
click('m32-blocks-ex'); click('m32-blocks-ex');
check('m32-blocks L1: 25 tens = 2 hundreds and 5 tens',
  (txt('m32-blocks-msg') || '').indexOf('2 个百和 5 个十') >= 0 &&
  tiersDoneFor('m32-blocks', 1));
click('m32-blocks-level-2');
click('m32-blocks-g-1');
click('m32-blocks-ex'); click('m32-blocks-ex'); click('m32-blocks-ex');
check('m32-blocks L2: 1000 = 9 hundreds, 9 tens, 10 ones',
  (txt('m32-blocks-msg') || '').indexOf('9 个百、9 个十、10 个一') >= 0 &&
  (txt('m32-blocks-msg') || '').indexOf('1000 − 658 = 342') >= 0 &&
  tiersDoneFor('m32-blocks', 2));

// m32-est: estimate then exact, interval check
renderAnim('m32-est');
click('m32-est-g-2');
click('m32-est-est-btn');
check('m32-est L0: estimate shown, 456+278 about 800',
  (txt('m32-est-est') || '').indexOf('约 800') >= 0);
click('m32-est-calc-btn');
check('m32-est L0: exact 734 in 700-800',
  (txt('m32-est-msg') || '').indexOf('456 + 278 = 734') >= 0 &&
  (txt('m32-est-msg') || '').indexOf('700 到 800') >= 0 &&
  tiersDoneFor('m32-est', 0));
click('m32-est-level-1');
click('m32-est-g-1');
click('m32-est-est-btn');
click('m32-est-calc-btn');
check('m32-est L1: 1000-658 = 342 in 300-400',
  (txt('m32-est-msg') || '').indexOf('1000 − 658 = 342') >= 0 &&
  tiersDoneFor('m32-est', 1));

// m32-vert: step through ones/tens/hundreds, verdict names the sum
renderAnim('m32-vert');
click('m32-vert-g-1');
click('m32-vert-next'); click('m32-vert-next'); click('m32-vert-next');
check('m32-vert L0: 456+278 = 734 after 3 steps',
  (txt('m32-vert-msg') || '').indexOf('456 + 278 = 734') >= 0 &&
  (txt('m32-vert-steps') || '').indexOf('6 + 8 = 14') >= 0 &&
  tiersDoneFor('m32-vert', 0) && triedKeys.indexOf('m32-vert') >= 0);
click('m32-vert-level-1');
click('m32-vert-g-1');
click('m32-vert-next'); click('m32-vert-next'); click('m32-vert-next');
check('m32-vert L1: 1000-658 = 342',
  (txt('m32-vert-msg') || '').indexOf('1000 − 658 = 342') >= 0 &&
  tiersDoneFor('m32-vert', 1));

// m34-table: add groups one by one, 6 groups of 4 is 24
renderAnim('m34-table');
click('m34-table-g-1');
for (let i = 0; i < 6; i++) click('m34-table-add');
check('m34-table L0: 6 groups of 4 is 24, 6 times not "more by 20"',
  (txt('m34-table-msg') || '').indexOf('6 份就是 6 个 4，一共 24') >= 0 &&
  (txt('m34-table-msg') || '').indexOf('6 倍') >= 0 &&
  tiersDoneFor('m34-table', 0));
click('m34-table-level-2');
click('m34-table-g-1');
for (let i = 0; i < 9; i++) click('m34-table-add');
check('m34-table L2: 9 groups of 5 is 45',
  (txt('m34-table-msg') || '').indexOf('9 份就是 9 个 5，一共 45') >= 0 &&
  tiersDoneFor('m34-table', 2));

// m34-groups: split 12 apples into groups of 4
renderAnim('m34-groups');
click('m34-groups-g-1');
click('m34-groups-split'); click('m34-groups-split'); click('m34-groups-split');
check('m34-groups L0: 12 has 3 groups of 4, 12 is 3 times 4',
  (txt('m34-groups-msg') || '').indexOf('12 是 4 的 3 倍') >= 0 &&
  tiersDoneFor('m34-groups', 0));
click('m34-groups-level-1');
click('m34-groups-g-1');
for (let i = 0; i < 5; i++) click('m34-groups-split');
check('m34-groups L1: 15 has 5 groups of 3',
  (txt('m34-groups-msg') || '').indexOf('15 是 3 的 5 倍') >= 0 &&
  tiersDoneFor('m34-groups', 1));

// m35-dots: 13x4 split 10x4 + 3x4
renderAnim('m35-dots');
click('m35-dots-g-1');
click('m35-dots-left');
click('m35-dots-right');
click('m35-dots-sum');
check('m35-dots L0: 13x4 = 40 + 12 = 52',
  (txt('m35-dots-msg') || '').indexOf('13 × 4 = 10 × 4 + 3 × 4 = 40 + 12 = 52') >= 0 &&
  tiersDoneFor('m35-dots', 0));
click('m35-dots-level-2');
click('m35-dots-g-1');
click('m35-dots-left');
click('m35-dots-right');
click('m35-dots-sum');
check('m35-dots L2: 24x3 = 60 + 12 = 72',
  (txt('m35-dots-msg') || '').indexOf('24 × 3 = 20 × 3 + 4 × 3 = 60 + 12 = 72') >= 0 &&
  tiersDoneFor('m35-dots', 2));

// m35-est: 23x4 about 80, exact 92
renderAnim('m35-est');
click('m35-est-g-1');
click('m35-est-est-btn');
click('m35-est-calc-btn');
check('m35-est L0: 23x4 about 80, exact 92',
  (txt('m35-est-msg') || '').indexOf('23 × 4 = 92') >= 0 &&
  tiersDoneFor('m35-est', 0));
click('m35-est-level-2');
click('m35-est-g-1');
click('m35-est-est-btn');
click('m35-est-calc-btn');
check('m35-est L2: 18x3 about 60, exact 54',
  (txt('m35-est-msg') || '').indexOf('18 × 3 = 54') >= 0 &&
  tiersDoneFor('m35-est', 2));

// m35-vert: 23x4 steps light the two area blocks
renderAnim('m35-vert');
click('m35-vert-g-1');
click('m35-vert-next'); click('m35-vert-next'); click('m35-vert-next');
check('m35-vert L0: 23x4 = 92, steps name both blocks',
  (txt('m35-vert-msg') || '').indexOf('23 × 4 = 92') >= 0 &&
  (txt('m35-vert-steps') || '').indexOf('3 × 4 = 12') >= 0 &&
  (txt('m35-vert-steps') || '').indexOf('20 × 4 = 80') >= 0 &&
  tiersDoneFor('m35-vert', 0));
click('m35-vert-level-2');
click('m35-vert-g-1');
click('m35-vert-next'); click('m35-vert-next'); click('m35-vert-next');
check('m35-vert L2: 18x3 = 54',
  (txt('m35-vert-msg') || '').indexOf('18 × 3 = 54') >= 0 &&
  tiersDoneFor('m35-vert', 2));

// m36-drag: width only keeps right angles; slant breaks them; slant back to 0 restores
renderAnim('m36-drag');
click('m36-drag-g-0');
click('m36-drag-w-plus');
click('m36-drag-check');
check('m36-drag L0: width changed, angles still 90, still a rectangle',
  (txt('m36-drag-msg') || '').indexOf('还是长方形') >= 0 &&
  (txt('m36-drag-msg') || '').indexOf('90°') >= 0 &&
  tiersDoneFor('m36-drag', 0));
click('m36-drag-level-1');
click('m36-drag-g-1');
click('m36-drag-s-plus');
click('m36-drag-check');
check('m36-drag L1: slanted 20, angles 76 and 104, now a parallelogram',
  (txt('m36-drag-msg') || '').indexOf('平行四边形') >= 0 &&
  (txt('m36-drag-msg') || '').indexOf('76°') >= 0 &&
  (txt('m36-drag-read') || '').indexOf('76°') >= 0 &&
  tiersDoneFor('m36-drag', 1));
click('m36-drag-level-2');
click('m36-drag-g-0');
click('m36-drag-s-minus');
click('m36-drag-check');
check('m36-drag L2: slant back to 0, right angles again',
  (txt('m36-drag-msg') || '').indexOf('斜回到 0') >= 0 &&
  tiersDoneFor('m36-drag', 2));

// m36-nest: wrong ring is refused with a hint, right ring places the shape
renderAnim('m36-nest');
click('m36-nest-g-0');
click('m36-nest-place');
check('m36-nest L0: square goes in the square ring',
  (txt('m36-nest-placed') || '').indexOf('正方形 → 正方形圈') >= 0 &&
  tiersDoneFor('m36-nest', 0));
click('m36-nest-level-1');
click('m36-nest-g-0');
click('m36-nest-place');
check('m36-nest L1: 8x5 rectangle refused from the square ring',
  (txt('m36-nest-msg') || '').indexOf('住不进正方形圈') >= 0 &&
  !tiersDoneFor('m36-nest', 1));
click('m36-nest-g-1');
click('m36-nest-place');
check('m36-nest L1: rectangle placed in the rectangle ring',
  (txt('m36-nest-placed') || '').indexOf('长方形（长 8，宽 5） → 长方形圈') >= 0 &&
  tiersDoneFor('m36-nest', 1));
click('m36-nest-level-2');
click('m36-nest-g-2');
click('m36-nest-place');
check('m36-nest L2: parallelogram goes in the outer ring',
  (txt('m36-nest-placed') || '').indexOf('平行四边形 → 平行四边形圈') >= 0 &&
  tiersDoneFor('m36-nest', 2));

// m37-div: 3 pies for 4 people, each gets 3 quarters
renderAnim('m37-div');
click('m37-div-g-0');
click('m37-div-cut');
check('m37-div L0: cut shows 12 quarters',
  (txt('m37-div-msg') || '').indexOf('一共 12 个 1/4 块') >= 0);
click('m37-div-share');
check('m37-div L0: each gets 3/4, 3 divided by 4 is 3/4',
  (txt('m37-div-msg') || '').indexOf('3 ÷ 4 = 3/4') >= 0 &&
  tiersDoneFor('m37-div', 0));
click('m37-div-level-2');
click('m37-div-g-0');
click('m37-div-cut');
click('m37-div-share');
check('m37-div L2: 5 pies for 4 people, each gets 5/4',
  (txt('m37-div-msg') || '').indexOf('5 ÷ 4 = 5/4') >= 0 &&
  tiersDoneFor('m37-div', 2));

// m38-three: only-rose is 6-2=4; total is 10 by inclusion-exclusion
renderAnim('m38-three');
click('m38-three-g-1');
click('m38-three-count');
check('m38-three L0: only roses 6-2=4',
  (txt('m38-three-msg') || '').indexOf('6 − 2 = 4') >= 0 &&
  tiersDoneFor('m38-three', 0));
click('m38-three-level-2');
click('m38-three-g-1');
click('m38-three-count');
check('m38-three L2: total 10, 14-2-2-1+1',
  (txt('m38-three-msg') || '').indexOf('9 + 1 = 10') >= 0 &&
  tiersDoneFor('m38-three', 2));

// m310-trial: too small says adjust up, too big says adjust down, right one lands
renderAnim('m310-trial');
click('m310-trial-g-1');
click('m310-trial-t-0');
check('m310-trial L0: trying 11, remainder 9 too big, adjust up',
  (txt('m310-trial-msg') || '').indexOf('调大') >= 0 &&
  !tiersDoneFor('m310-trial', 0));
click('m310-trial-t-1');
check('m310-trial L0: 75/6 = 12 remainder 3',
  (txt('m310-trial-msg') || '').indexOf('75 ÷ 6 = 12……3') >= 0 &&
  tiersDoneFor('m310-trial', 0));
click('m310-trial-level-2');
click('m310-trial-g-1');
click('m310-trial-t-2');
check('m310-trial L2: trying 52, 156 too big, adjust down',
  (txt('m310-trial-msg') || '').indexOf('调小') >= 0);
click('m310-trial-t-1');
check('m310-trial L2: 154/3 = 51 remainder 1',
  (txt('m310-trial-msg') || '').indexOf('154 ÷ 3 = 51……1') >= 0 &&
  tiersDoneFor('m310-trial', 2));

// m310-check: quotient x divisor (+ remainder) = dividend
renderAnim('m310-check');
click('m310-check-g-1');
click('m310-check-verify');
check('m310-check L0: 24x4 = 96 checks out',
  (txt('m310-check-msg') || '').indexOf('24 × 4 = 96') >= 0 &&
  tiersDoneFor('m310-check', 0));
click('m310-check-level-2');
click('m310-check-g-1');
click('m310-check-verify');
check('m310-check L2: 51x3+1 = 154, forgetting the remainder fails',
  (txt('m310-check-msg') || '').indexOf('153 + 1 = 154') >= 0 &&
  (txt('m310-check-msg') || '').indexOf('忘了加余数') >= 0 &&
  tiersDoneFor('m310-check', 2));

// m311-dots: dots -> blank grid -> vertical, same answer
renderAnim('m311-dots');
click('m311-dots-g-1');
click('m311-dots-dot-btn');
check('m311-dots L0: dot array legend names the four blocks',
  (txt('m311-dots-legend') || '').indexOf('20 × 10 = 200') >= 0 &&
  (txt('m311-dots-legend') || '').indexOf('3 × 5 = 15') >= 0);
click('m311-dots-grid-btn');
click('m311-dots-vert-btn');
check('m311-dots L0: 23x15 = 345, vertical rows 115 and 230',
  (txt('m311-dots-msg') || '').indexOf('200 + 100 + 30 + 15 = 345') >= 0 &&
  (txt('m311-dots-msg') || '').indexOf('115 + 230 = 345') >= 0 &&
  tiersDoneFor('m311-dots', 0));
click('m311-dots-level-2');
click('m311-dots-g-1');
click('m311-dots-dot-btn');
click('m311-dots-grid-btn');
click('m311-dots-vert-btn');
check('m311-dots L2: 32x14 = 448',
  (txt('m311-dots-msg') || '').indexOf('300 + 120 + 20 + 8 = 448') >= 0 &&
  tiersDoneFor('m311-dots', 2));

// m312-cut: cut and reassemble, area unchanged
renderAnim('m312-cut');
click('m312-cut-g-1');
click('m312-cut-cut');
click('m312-cut-paste');
check('m312-cut L0: staircase 1-2-3 reassembled, area still 6',
  (txt('m312-cut-msg') || '').indexOf('面积不变：6 平方厘米') >= 0 &&
  tiersDoneFor('m312-cut', 0));
click('m312-cut-level-1');
click('m312-cut-g-1');
click('m312-cut-cut');
click('m312-cut-paste');
check('m312-cut L1: 4-2-2 reassembled, area still 8',
  (txt('m312-cut-msg') || '').indexOf('面积不变：8 平方厘米') >= 0 &&
  tiersDoneFor('m312-cut', 1));

// m312-unit: 10 rows of 10 = 100; square metre is 100x100
renderAnim('m312-unit');
click('m312-unit-g-1');
for (let i = 0; i < 10; i++) click('m312-unit-row');
check('m312-unit L0: 1 square dm = 100 square cm',
  (txt('m312-unit-msg') || '').indexOf('1 平方分米 = 10 × 10 = 100 平方厘米') >= 0 &&
  tiersDoneFor('m312-unit', 0));
click('m312-unit-level-2');
click('m312-unit-g-1');
for (let i = 0; i < 10; i++) click('m312-unit-row');
check('m312-unit L2: 1 square m = 10000 square cm',
  (txt('m312-unit-msg') || '').indexOf('10000 平方厘米') >= 0 &&
  tiersDoneFor('m312-unit', 2));

// m313-leap: quarter-days add up; Feb 29 birthday every 4 years
renderAnim('m313-leap');
click('m313-leap-g-1');
for (let i = 0; i < 4; i++) click('m313-leap-year');
check('m313-leap L0: 4 years save 1 day, leap year',
  (txt('m313-leap-msg') || '').indexOf('4 年攒出 1 天') >= 0 &&
  tiersDoneFor('m313-leap', 0));
click('m313-leap-level-1');
click('m313-leap-g-0');
click('m313-leap-year');
check('m313-leap L1: 2025 is a common year, Feb has 28 days',
  (txt('m313-leap-msg') || '').indexOf('28 天') >= 0 &&
  tiersDoneFor('m313-leap', 1));
click('m313-leap-level-2');
click('m313-leap-g-1');
for (let i = 0; i < 3; i++) click('m313-leap-year');
check('m313-leap L2: 3rd Feb 29 birthday is age 12',
  (txt('m313-leap-msg') || '').indexOf('3 × 4 = 12 岁') >= 0 &&
  tiersDoneFor('m313-leap', 2));

// m314-money: coins add up; overshoot is refused
renderAnim('m314-money');
click('m314-money-g-1');
for (let i = 0; i < 5; i++) click('m314-money-coin-jiao');
check('m314-money L0: 0.5 yuan = 5 jiao',
  (txt('m314-money-msg') || '').indexOf('0.5 元 = 5 角') >= 0 &&
  tiersDoneFor('m314-money', 0));
click('m314-money-level-1');
click('m314-money-g-1');
click('m314-money-coin-yuan');
check('m314-money L1: 1 yuan overshoots 0.8 yuan',
  (txt('m314-money-msg') || '').indexOf('放多了') >= 0 &&
  !tiersDoneFor('m314-money', 1));
click('m314-money-reset');
click('m314-money-g-1');
for (let i = 0; i < 8; i++) click('m314-money-coin-jiao');
check('m314-money L1: 0.8 yuan = 8 jiao after reset',
  (txt('m314-money-msg') || '').indexOf('0.8 元 = 8 角') >= 0 &&
  tiersDoneFor('m314-money', 1));
click('m314-money-level-2');
click('m314-money-g-2');
click('m314-money-coin-yuan');
for (let i = 0; i < 3; i++) click('m314-money-coin-jiao');
check('m314-money L2: 1.3 yuan = 13 jiao',
  (txt('m314-money-msg') || '').indexOf('1.3 元 = 13 角') >= 0 &&
  tiersDoneFor('m314-money', 2));

// m314-zoom: zoom in layers, 0.25 sits between 0.2 and 0.3
renderAnim('m314-zoom');
click('m314-zoom-level-1');
click('m314-zoom-g-0');
click('m314-zoom-zoom-btn');
click('m314-zoom-zoom-btn');
check('m314-zoom L1: 0.25 is midway between 0.2 and 0.3',
  (txt('m314-zoom-msg') || '').indexOf('0.25 是 25 个百分之一') >= 0 &&
  tiersDoneFor('m314-zoom', 1));
click('m314-zoom-level-2');
click('m314-zoom-g-0');
click('m314-zoom-zoom-btn');
click('m314-zoom-zoom-btn');
check('m314-zoom L2: 0.7 is bigger than 0.65',
  (txt('m314-zoom-msg') || '').indexOf('0.7 大') >= 0 &&
  tiersDoneFor('m314-zoom', 2));

// m314-frac: 3/10 is 0.3; 0.6 and 0.60 are the same length
renderAnim('m314-frac');
click('m314-frac-g-1');
click('m314-frac-paint');
click('m314-frac-write');
check('m314-frac L0: 3/10 is 0.3',
  (txt('m314-frac-msg') || '').indexOf('3/10 是 3 个十分之一') >= 0 &&
  tiersDoneFor('m314-frac', 0));
click('m314-frac-level-2');
click('m314-frac-g-0');
click('m314-frac-paint');
click('m314-frac-write');
check('m314-frac L2: 0.6 equals 0.60, trailing zero changes nothing',
  (txt('m314-frac-msg') || '').indexOf('末尾的 0 不改变大小') >= 0 &&
  tiersDoneFor('m314-frac', 2));

console.log('\nsmoke-anims-band-1-3: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
