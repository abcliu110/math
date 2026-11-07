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
  'm314-money', 'm314-zoom', 'm314-frac',
  'm12-map', 'm12-hunt', 'm13-friend', 'm14-inverse', 'm14-line',
  'm15-bag', 'm15-home', 'm16-five', 'm16-ten', 'm16-fingers',
  'm17-line', 'm18-day', 'm19-split', 'm19-line', 'm19-poker',
  'm111-flat', 'm111-add', 'm112-venn',
  'm113-chart', 'm113-line', 'm113-abacus',
  'm114-ways', 'm115-tens', 'm115-jump', 'm116-diff', 'm116-action',
  'm113-bundle',
  'm21-body', 'm21-seg', 'm22-blocks', 'm22-jump',
  'm24-fold', 'm24-overlap', 'm25-area', 'm25-recite',
  'm26-build', 'm27-elapsed', 'm215-lines',
  'm214a-tally', 'm214a-picto', 'm28-verse', 'm29-mirror',
  'm210-story', 'm211-jump', 'm211-vert', 'm211-ceil',
  'm212-blocks', 'm212-abacus', 'm213-est', 'm214b-sudoku'];
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
  'm12-map': { title: '教室地图找位置', kind: '模拟', points: ['1.2'], grade: 1 },
  'm12-hunt': { title: '方位寻宝', kind: '实验', points: ['1.2'], grade: 1 },
  'm13-friend': { title: '找朋友凑5', kind: '模拟', points: ['1.3'], grade: 1 },
  'm14-inverse': { title: '加法验算减法', kind: '模拟', points: ['1.4'], grade: 1 },
  'm14-line': { title: '数线前进后退', kind: '模拟', points: ['1.4'], grade: 1 },
  'm15-bag': { title: '摸袋猜形', kind: '实验', points: ['1.5'], grade: 1 },
  'm15-home': { title: '家里找图形', kind: '模拟', points: ['1.5'], grade: 1 },
  'm16-five': { title: '十格阵：5再加几', kind: '模拟', points: ['1.6'], grade: 1 },
  'm16-ten': { title: '谁和我凑满10', kind: '模拟', points: ['1.6'], grade: 1 },
  'm16-fingers': { title: '手指算6到10', kind: '模拟', points: ['1.6'], grade: 1 },
  'm17-line': { title: '数线找11到20', kind: '模拟', points: ['1.7'], grade: 1 },
  'm18-day': { title: '一日作息时间轴', kind: '实验', points: ['1.8'], grade: 1 },
  'm19-split': { title: '拆数口诀凑十', kind: '模拟', points: ['1.9'], grade: 1 },
  'm19-line': { title: '数线接着数', kind: '模拟', points: ['1.9'], grade: 1 },
  'm19-poker': { title: '翻牌找朋友凑10', kind: '实验', points: ['1.9'], grade: 1 },
  'm111-flat': { title: '平十法', kind: '模拟', points: ['1.11'], grade: 1 },
  'm111-add': { title: '想加算减', kind: '模拟', points: ['1.11'], grade: 1 },
  'm112-venn': { title: '维恩图分一分', kind: '模拟', points: ['1.12'], grade: 1 },
  'm113-chart': { title: '百数表找规律', kind: '模拟', points: ['1.13'], grade: 1 },
  'm113-line': { title: '数线比大小', kind: '模拟', points: ['1.13'], grade: 1 },
  'm113-abacus': { title: '计数器拨珠', kind: '模拟', points: ['1.13'], grade: 1 },
  'm114-ways': { title: '凑钱有多少种', kind: '实验', points: ['1.14'], grade: 1 },
  'm115-tens': { title: '整十数先行', kind: '模拟', points: ['1.15'], grade: 1 },
  'm115-jump': { title: '数线跳十跳一', kind: '模拟', points: ['1.15'], grade: 1 },
  'm116-diff': { title: '数列差分找规律', kind: '模拟', points: ['1.16'], grade: 1 },
  'm116-action': { title: '动作规律接龙', kind: '实验', points: ['1.16'], grade: 1 },
  'm113-bundle': { title: '捆小棒组成两位数', kind: '模拟', points: ['1.13'], grade: 1 },
  'm21-body': { title: '身体尺量一量', kind: '实验', points: ['2.1'], grade: 2 },
  'm21-seg': { title: '线段三要素', kind: '演示', points: ['2.1'], grade: 2 },
  'm22-blocks': { title: '数位块凑整分解', kind: '模拟', points: ['2.2'], grade: 2 },
  'm22-jump': { title: '数轴跳数', kind: '模拟', points: ['2.2'], grade: 2 },
  'm24-fold': { title: '折纸得直角', kind: '实验', points: ['2.4'], grade: 2 },
  'm24-overlap': { title: '叠合比角', kind: '模拟', points: ['2.4'], grade: 2 },
  'm25-area': { title: '面积模型拆一拆', kind: '模拟', points: ['2.5'], grade: 2 },
  'm25-recite': { title: '口诀递推', kind: '模拟', points: ['2.5'], grade: 2 },
  'm26-build': { title: '按视图搭积木', kind: '实验', points: ['2.6'], grade: 2 },
  'm27-elapsed': { title: '时间轴量经过时间', kind: '模拟', points: ['2.7'], grade: 2 },
  'm215-lines': { title: '连线图数一数', kind: '模拟', points: ['2.15'], grade: 2 },
  'm214a-tally': { title: '正字计数', kind: '模拟', points: ['2.14a'], grade: 2 },
  'm214a-picto': { title: '象形图变条形图', kind: '演示', points: ['2.14a'], grade: 2 },
  'm28-verse': { title: '口诀求商', kind: '模拟', points: ['2.8'], grade: 2 },
  'm29-mirror': { title: '镜面照一照', kind: '模拟', points: ['2.9'], grade: 2 },
  'm210-story': { title: '故事变算式', kind: '模拟', points: ['2.10'], grade: 2 },
  'm211-jump': { title: '数轴跳格分一分', kind: '模拟', points: ['2.11'], grade: 2 },
  'm211-vert': { title: '除法竖式四步', kind: '模拟', points: ['2.11'], grade: 2 },
  'm211-ceil': { title: '余下的人也要坐船', kind: '实验', points: ['2.11'], grade: 2 },
  'm212-blocks': { title: '千方块拼一拼', kind: '模拟', points: ['2.12'], grade: 2 },
  'm212-abacus': { title: '计数器拨珠到一万', kind: '模拟', points: ['2.12'], grade: 2 },
  'm213-est': { title: '苹果作基准猜重量', kind: '实验', points: ['2.13'], grade: 2 },
  'm214b-sudoku': { title: '四宫格找唯一', kind: '实验', points: ['2.14b'], grade: 2 },
};
check('registry has all 36 G3 keys + 26 G1 keys + 24 G2 keys + m113-bundle + m1a-pair example',
  NEW_KEYS.every(function (k) { return !!REG[k]; }) && !!REG['m1a-pair'] &&
  Object.keys(REG).length === 87);

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
    a.title === exp.title && a.kind === exp.kind && a.grade === (exp.grade || 3) &&
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

// ---------- G1 flows (1.2–1.16, batch 3) ----------
// m12-map: flower at row 1 col 2 = 上面一排中间
renderAnim('m12-map');
click('m12-map-g-1');
click('m12-map-say');
check('m12-map L0: flower at row 1 col 2, guessed right',
  (txt('m12-map-msg') || '').indexOf('对了') >= 0 &&
  (txt('m12-map-msg') || '').indexOf('上面一排中间') >= 0 &&
  tiersDoneFor('m12-map', 0) && triedKeys.indexOf('m12-map') >= 0);
// m12-hunt: forward twice reaches the treasure; a wrong step sends the walker home
renderAnim('m12-hunt');
click('m12-hunt-g-0');
click('m12-hunt-fwd');
click('m12-hunt-fwd');
check('m12-hunt L0: two steps forward finds the treasure',
  (txt('m12-hunt-msg') || '').indexOf('找到宝藏了') >= 0 &&
  (txt('m12-hunt-msg') || '').indexOf('第 1 排第 2 个') >= 0 &&
  tiersDoneFor('m12-hunt', 0) && triedKeys.indexOf('m12-hunt') >= 0);
renderAnim('m12-hunt');
click('m12-hunt-left');
check('m12-hunt L0: wrong first step returns to start',
  (txt('m12-hunt-msg') || '').indexOf('回到起点重走') >= 0);
// m13-friend: 2 + 3 = 5; wrong pair 2 + 1 = 3 is short of 5
renderAnim('m13-friend');
click('m13-friend-g-2');
click('m13-friend-pair');
check('m13-friend L0: 2 + 3 = 5',
  (txt('m13-friend-msg') || '').indexOf('2 + 3 = 5') >= 0 &&
  tiersDoneFor('m13-friend', 0) && triedKeys.indexOf('m13-friend') >= 0);
renderAnim('m13-friend');
click('m13-friend-g-0');
click('m13-friend-pair');
check('m13-friend L0: 2 + 1 = 3 is short of 5',
  (txt('m13-friend-msg') || '').indexOf('还差 2 才到 5') >= 0);
// m14-inverse: 5 - 2 = 3 because 3 + 2 = 5
renderAnim('m14-inverse');
click('m14-inverse-g-1');
click('m14-inverse-check');
check('m14-inverse L0: 3 + 2 = 5 checks 5 - 2 = 3',
  (txt('m14-inverse-msg') || '').indexOf('3 + 2 = 5') >= 0 &&
  tiersDoneFor('m14-inverse', 0) && triedKeys.indexOf('m14-inverse') >= 0);
// m14-line: 2 + 2 lands on 4; 3 + 0 stays put
renderAnim('m14-line');
click('m14-line-g-1');
click('m14-line-walk');
click('m14-line-walk');
check('m14-line L0: 2 + 2 lands on 4',
  (txt('m14-line-msg') || '').indexOf('2 + 2 = 4') >= 0 &&
  tiersDoneFor('m14-line', 0) && triedKeys.indexOf('m14-line') >= 0);
click('m14-line-level-2');
click('m14-line-g-1');
click('m14-line-walk');
check('m14-line L2: 3 + 0 stays at 3',
  (txt('m14-line-msg') || '').indexOf('3 + 0 = 3') >= 0 &&
  (txt('m14-line-msg') || '').indexOf('原地不动') >= 0 &&
  tiersDoneFor('m14-line', 2));
// m15-bag: round flat face = cylinder
renderAnim('m15-bag');
click('m15-bag-g-1');
click('m15-bag-reveal');
check('m15-bag L0: round flat face is a cylinder',
  (txt('m15-bag-msg') || '').indexOf('圆柱') >= 0 &&
  tiersDoneFor('m15-bag', 0) && triedKeys.indexOf('m15-bag') >= 0);
// m15-home: the can is the cylinder
renderAnim('m15-home');
click('m15-home-o-1');
check('m15-home L0: can is the cylinder',
  (txt('m15-home-msg') || '').indexOf('找对了') >= 0 &&
  (txt('m15-home-msg') || '').indexOf('易拉罐是圆柱') >= 0 &&
  tiersDoneFor('m15-home', 0) && triedKeys.indexOf('m15-home') >= 0);
// m16-five: 6 = 5 + 1, no counting from 1
renderAnim('m16-five');
click('m16-five-g-0');
click('m16-five-add');
check('m16-five L0: 6 = 5 + 1',
  (txt('m16-five-msg') || '').indexOf('6 = 5 + 1') >= 0 &&
  tiersDoneFor('m16-five', 0) && triedKeys.indexOf('m16-five') >= 0);
// m16-ten: 7 + 3 = 10
renderAnim('m16-ten');
click('m16-ten-g-1');
click('m16-ten-add');
click('m16-ten-add');
click('m16-ten-add');
check('m16-ten L0: 7 + 3 = 10',
  (txt('m16-ten-msg') || '').indexOf('7 + 3 = 10') >= 0 &&
  tiersDoneFor('m16-ten', 0) && triedKeys.indexOf('m16-ten') >= 0);
// m16-fingers: 7 = 5 + 2 with fingers
renderAnim('m16-fingers');
click('m16-fingers-g-1');
click('m16-fingers-f-0');
click('m16-fingers-f-1');
click('m16-fingers-count');
check('m16-fingers L0: 7 = 5 + 2',
  (txt('m16-fingers-msg') || '').indexOf('7 = 5 + 2') >= 0 &&
  tiersDoneFor('m16-fingers', 0) && triedKeys.indexOf('m16-fingers') >= 0);
// m17-line: 13 = 10 + 3 on the number line
renderAnim('m17-line');
click('m17-line-g-1');
click('m17-line-jump');
click('m17-line-jump');
click('m17-line-jump');
check('m17-line L0: 13 = 10 + 3',
  (txt('m17-line-msg') || '').indexOf('13 = 10 + 3') >= 0 &&
  tiersDoneFor('m17-line', 0) && triedKeys.indexOf('m17-line') >= 0);
// m18-day: getting up at 7 in the morning
renderAnim('m18-day');
click('m18-day-g-1');
click('m18-day-stick');
check('m18-day L0: getting up is 7 in the morning',
  (txt('m18-day-msg') || '').indexOf('贴对了') >= 0 &&
  (txt('m18-day-msg') || '').indexOf('早上 7 点') >= 0 &&
  tiersDoneFor('m18-day', 0) && triedKeys.indexOf('m18-day') >= 0);
// m19-split: 9 + 6 = 9 + 1 + 5 = 10 + 5 = 15
renderAnim('m19-split');
click('m19-split-g-0');
click('m19-split-do');
check('m19-split L0: 9 + 6 = 10 + 5 = 15',
  (txt('m19-split-msg') || '').indexOf('10 + 5 = 15') >= 0 &&
  tiersDoneFor('m19-split', 0) && triedKeys.indexOf('m19-split') >= 0);
// m19-line: count on from 9 by 4 to 13
renderAnim('m19-line');
click('m19-line-g-1');
click('m19-line-count');
click('m19-line-count');
click('m19-line-count');
click('m19-line-count');
check('m19-line L0: 9 + 4 = 13',
  (txt('m19-line-msg') || '').indexOf('9 + 4 = 13') >= 0 &&
  tiersDoneFor('m19-line', 0) && triedKeys.indexOf('m19-line') >= 0);
// m19-poker: 6 + 4 = 10
renderAnim('m19-poker');
click('m19-poker-g-1');
click('m19-poker-flip');
check('m19-poker L0: 6 + 4 = 10',
  (txt('m19-poker-msg') || '').indexOf('6 + 4 = 10') >= 0 &&
  tiersDoneFor('m19-poker', 0) && triedKeys.indexOf('m19-poker') >= 0);
// m111-flat: 13 - 5 = 8 in two steps (13 - 3 = 10, 10 - 2 = 8)
renderAnim('m111-flat');
click('m111-flat-g-1');
click('m111-flat-step1');
click('m111-flat-step2');
check('m111-flat L0: 13 - 5 = 8 via 10',
  (txt('m111-flat-msg') || '').indexOf('13 − 5 = 8') >= 0 &&
  tiersDoneFor('m111-flat', 0) && triedKeys.indexOf('m111-flat') >= 0);
// m111-add: 13 - 5 = 8 because 5 + 8 = 13, count back 12, 11, 10, 9, 8
renderAnim('m111-add');
click('m111-add-g-1');
click('m111-add-think');
check('m111-add L0: 5 + 8 = 13, count back lands on 8',
  (txt('m111-add-msg') || '').indexOf('5 + 8 = 13') >= 0 &&
  (txt('m111-add-msg') || '').indexOf('12、11、10、9、8') >= 0 &&
  tiersDoneFor('m111-add', 0) && triedKeys.indexOf('m111-add') >= 0);
// m112-venn: red circle goes in the overlap
renderAnim('m112-venn');
click('m112-venn-g-0');
click('m112-venn-put');
check('m112-venn L0: red circle goes in the overlap',
  (txt('m112-venn-msg') || '').indexOf('放对了') >= 0 &&
  tiersDoneFor('m112-venn', 0) && triedKeys.indexOf('m112-venn') >= 0);
// m113-chart: hidden number is 23, rows go +1
renderAnim('m113-chart');
click('m113-chart-g-1');
click('m113-chart-reveal');
check('m113-chart L0: hidden number is 23, rows go +1',
  (txt('m113-chart-msg') || '').indexOf('藏起来的数是 23') >= 0 &&
  (txt('m113-chart-msg') || '').indexOf('横着每次多 1') >= 0 &&
  tiersDoneFor('m113-chart', 0) && triedKeys.indexOf('m113-chart') >= 0);
// m113-line: 46 is right of 38, so 46 is bigger
renderAnim('m113-line');
click('m113-line-g-0');
click('m113-line-place');
check('m113-line L0: 46 is bigger than 38',
  (txt('m113-line-msg') || '').indexOf('46 大') >= 0 &&
  tiersDoneFor('m113-line', 0) && triedKeys.indexOf('m113-line') >= 0);
// m113-abacus: 4 tens beads + 6 ones beads = 46
renderAnim('m113-abacus');
click('m113-abacus-g-1');
click('m113-abacus-tens');
click('m113-abacus-tens');
click('m113-abacus-tens');
click('m113-abacus-tens');
click('m113-abacus-ones');
click('m113-abacus-ones');
click('m113-abacus-ones');
click('m113-abacus-ones');
click('m113-abacus-ones');
click('m113-abacus-ones');
click('m113-abacus-done');
check('m113-abacus L0: 4 tens + 6 ones = 46',
  (txt('m113-abacus-msg') || '').indexOf('拨对了') >= 0 &&
  (txt('m113-abacus-msg') || '').indexOf('就是 46') >= 0 &&
  tiersDoneFor('m113-abacus', 0) && triedKeys.indexOf('m113-abacus') >= 0);
// m114-ways: 1 yuan as 2 x 5 jiao, then as 10 x 1 jiao
renderAnim('m114-ways');
click('m114-ways-c-1');
click('m114-ways-c-1');
click('m114-ways-finish');
check('m114-ways L0: first way is 2 x 5 jiao',
  (txt('m114-ways-msg') || '').indexOf('第 1 种凑法') >= 0);
for (let i = 0; i < 10; i++) click('m114-ways-c-2');
click('m114-ways-finish');
check('m114-ways L0: second way is 10 x 1 jiao',
  (txt('m114-ways-msg') || '').indexOf('第 2 种凑法') >= 0 &&
  (txt('m114-ways-msg') || '').indexOf('10 角 = 1 元') >= 0 &&
  tiersDoneFor('m114-ways', 0) && triedKeys.indexOf('m114-ways') >= 0);
// m115-tens: 35 + 20 = 55, tens first
renderAnim('m115-tens');
click('m115-tens-g-0');
click('m115-tens-step1');
click('m115-tens-step2');
check('m115-tens L0: 35 + 20 = 55',
  (txt('m115-tens-msg') || '').indexOf('35 + 20 = 55') >= 0 &&
  tiersDoneFor('m115-tens', 0) && triedKeys.indexOf('m115-tens') >= 0);
// m115-jump: 23 + 15 = 38, jump 10 then 5 ones
renderAnim('m115-jump');
click('m115-jump-g-2');
click('m115-jump-ten');
click('m115-jump-one');
click('m115-jump-one');
click('m115-jump-one');
click('m115-jump-one');
click('m115-jump-one');
click('m115-jump-check');
check('m115-jump L0: 23 + 15 = 38',
  (txt('m115-jump-msg') || '').indexOf('23 + 15 = 38') >= 0 &&
  tiersDoneFor('m115-jump', 0) && triedKeys.indexOf('m115-jump') >= 0);
// m116-diff: next is 10 (+2 each time); challenge level next is 16 (+1, +2, +3, +4, +5)
renderAnim('m116-diff');
click('m116-diff-g-1');
click('m116-diff-reveal');
check('m116-diff L0: next is 10, +2 each time',
  (txt('m116-diff-msg') || '').indexOf('下一个是 10') >= 0 &&
  (txt('m116-diff-msg') || '').indexOf('每次多 2') >= 0 &&
  tiersDoneFor('m116-diff', 0) && triedKeys.indexOf('m116-diff') >= 0);
click('m116-diff-level-1');
click('m116-diff-g-1');
click('m116-diff-reveal');
check('m116-diff L1: 1, 2, 4, 7, 11, next is 16',
  (txt('m116-diff-msg') || '').indexOf('下一个是 16') >= 0 &&
  (txt('m116-diff-msg') || '').indexOf('差 1、2、3、4、5') >= 0 &&
  tiersDoneFor('m116-diff', 1));
// m116-action: next action is clap
renderAnim('m116-action');
click('m116-action-g-0');
click('m116-action-do');
check('m116-action L0: next action is clap',
  (txt('m116-action-msg') || '').indexOf('下一个是拍手') >= 0 &&
  tiersDoneFor('m116-action', 0) && triedKeys.indexOf('m116-action') >= 0);


// ---------- batch 4: G2 (23 anims) + m113-bundle ----------
// m113-bundle: 24 = 2 bundles + 4 sticks; challenge 99 = 9 bundles + 9 sticks
renderAnim('m113-bundle');
click('m113-bundle-g-1');
click('m113-bundle-add10'); click('m113-bundle-add10');
for (let i = 0; i < 4; i++) click('m113-bundle-add1');
click('m113-bundle-check');
check('m113-bundle L0: 24 = 2 bundles + 4 sticks',
  (txt('m113-bundle-msg') || '').indexOf('24 = 2 捆 + 4 根') >= 0 &&
  (txt('m113-bundle-msg') || '').indexOf('你猜对了') >= 0 &&
  tiersDoneFor('m113-bundle', 0) && triedKeys.indexOf('m113-bundle') >= 0);
click('m113-bundle-level-2');
click('m113-bundle-g-1');
for (let i = 0; i < 9; i++) click('m113-bundle-add10');
for (let i = 0; i < 9; i++) click('m113-bundle-add1');
click('m113-bundle-check');
check('m113-bundle L2: 99 = 9 bundles + 9 sticks',
  (txt('m113-bundle-msg') || '').indexOf('99 = 9 捆 + 9 根') >= 0 &&
  tiersDoneFor('m113-bundle', 2));

// m21-body: same desk, 5 zha x 18 cm = 90 cm, 6 zha x 15 cm = 90 cm
renderAnim('m21-body');
click('m21-body-g-1');
click('m21-body-m-a'); click('m21-body-m-b');
click('m21-body-check');
check('m21-body L0: 5 zha x 18 cm = 90 cm, 6 zha x 15 cm = 90 cm',
  (txt('m21-body-msg') || '').indexOf('5 拃 × 18 厘米 = 90 厘米') >= 0 &&
  (txt('m21-body-msg') || '').indexOf('6 拃 × 15 厘米 = 90 厘米') >= 0 &&
  tiersDoneFor('m21-body', 0) && triedKeys.indexOf('m21-body') >= 0);
click('m21-body-level-2');
click('m21-body-g-1');
click('m21-body-m-a'); click('m21-body-m-b');
click('m21-body-check');
check('m21-body L2: corridor 12 steps x 50 cm = 600 cm',
  (txt('m21-body-msg') || '').indexOf('600 厘米') >= 0 &&
  tiersDoneFor('m21-body', 2));

// m21-seg: 3 points = 3 segments AB, BC, AC; 5 points = 10
renderAnim('m21-seg');
click('m21-seg-g-1');
for (let i = 0; i < 3; i++) click('m21-seg-draw');
click('m21-seg-check');
check('m21-seg L0: 3 points = 3 segments AB, BC, AC',
  (txt('m21-seg-msg') || '').indexOf('一共 3 条线段：AB、BC、AC') >= 0 &&
  tiersDoneFor('m21-seg', 0) && triedKeys.indexOf('m21-seg') >= 0);
click('m21-seg-level-2');
click('m21-seg-g-2');
for (let i = 0; i < 10; i++) click('m21-seg-draw');
click('m21-seg-check');
check('m21-seg L2: 5 points = 10 segments',
  (txt('m21-seg-msg') || '').indexOf('一共 10 条线段') >= 0 &&
  tiersDoneFor('m21-seg', 2));

// m22-blocks: 48+31 = 79 via 50+30-2+1; 64+28 = 92
renderAnim('m22-blocks');
click('m22-blocks-g-1');
click('m22-blocks-s-0'); click('m22-blocks-s-1'); click('m22-blocks-s-2');
click('m22-blocks-check');
check('m22-blocks L0: 48+31 = 79',
  (txt('m22-blocks-msg') || '').indexOf('48+31=79') >= 0 &&
  tiersDoneFor('m22-blocks', 0) && triedKeys.indexOf('m22-blocks') >= 0);
click('m22-blocks-level-2');
click('m22-blocks-g-1');
click('m22-blocks-s-0'); click('m22-blocks-s-1'); click('m22-blocks-s-2');
click('m22-blocks-check');
check('m22-blocks L2: 64+28 = 92',
  (txt('m22-blocks-msg') || '').indexOf('64+28=92') >= 0 &&
  tiersDoneFor('m22-blocks', 2));

// m22-jump: 48 jumps to 50 (+2), 31 jumps to 30 (-1)
renderAnim('m22-jump');
click('m22-jump-g-0');
click('m22-jump-j-a'); click('m22-jump-j-b');
click('m22-jump-check');
check('m22-jump L0: 48+31 = 79 via jumps',
  (txt('m22-jump-msg') || '').indexOf('48+31=79') >= 0 &&
  (txt('m22-jump-msg') || '').indexOf('48 跳到 50') >= 0 &&
  tiersDoneFor('m22-jump', 0) && triedKeys.indexOf('m22-jump') >= 0);

// m24-fold: paper folded twice is a right angle; scissors angle is 40 deg
renderAnim('m24-fold');
click('m24-fold-g-0');
click('m24-fold-f-0'); click('m24-fold-f-1'); click('m24-fold-f-2');
click('m24-fold-check');
check('m24-fold L0: folded right angle matches book corner',
  (txt('m24-fold-msg') || '').indexOf('书角是直角') >= 0 &&
  tiersDoneFor('m24-fold', 0) && triedKeys.indexOf('m24-fold') >= 0);
click('m24-fold-level-2');
click('m24-fold-g-1');
click('m24-fold-f-0'); click('m24-fold-f-1'); click('m24-fold-f-2');
click('m24-fold-check');
check('m24-fold L2: scissors angle is 40 deg, smaller than right angle',
  (txt('m24-fold-msg') || '').indexOf('只有 40 度') >= 0 &&
  tiersDoneFor('m24-fold', 2));

// m24-overlap: 50 deg beats 30 deg by 20; equal 45 deg angles match
renderAnim('m24-overlap');
click('m24-overlap-g-1');
click('m24-overlap-s-0'); click('m24-overlap-s-1'); click('m24-overlap-s-2');
click('m24-overlap-check');
check('m24-overlap L0: B bigger, 50 deg beats 30 deg by 20',
  (txt('m24-overlap-msg') || '').indexOf('B 大：50 度比 30 度大 20 度') >= 0 &&
  tiersDoneFor('m24-overlap', 0) && triedKeys.indexOf('m24-overlap') >= 0);
click('m24-overlap-level-2');
click('m24-overlap-g-2');
click('m24-overlap-s-0'); click('m24-overlap-s-1'); click('m24-overlap-s-2');
click('m24-overlap-check');
check('m24-overlap L2: both 45 deg, same size, side length irrelevant',
  (txt('m24-overlap-msg') || '').indexOf('一样大：都是 45 度') >= 0 &&
  tiersDoneFor('m24-overlap', 2));

// m25-area: 7x6 = 5x6 + 2x6 = 30+12 = 42
renderAnim('m25-area');
click('m25-area-g-1');
click('m25-area-cut'); click('m25-area-calc-l'); click('m25-area-calc-r');
click('m25-area-check');
check('m25-area L0: 7x6 = 30+12 = 42',
  (txt('m25-area-msg') || '').indexOf('7×6=42') >= 0 &&
  (txt('m25-area-msg') || '').indexOf('30+12=42') >= 0 &&
  tiersDoneFor('m25-area', 0) && triedKeys.indexOf('m25-area') >= 0);

// m25-recite: three-five-fifteen, three-six-eighteen (+3)
renderAnim('m25-recite');
click('m25-recite-g-1');
click('m25-recite-s-0'); click('m25-recite-s-1'); click('m25-recite-s-2');
click('m25-recite-check');
check('m25-recite L0: three-six-eighteen, 15+3 = 18',
  (txt('m25-recite-msg') || '').indexOf('三六十八') >= 0 &&
  tiersDoneFor('m25-recite', 0) && triedKeys.indexOf('m25-recite') >= 0);

// m26-build: front 3 / top 3 / left 1 with 3 cubes; L1 needs 4
renderAnim('m26-build');
click('m26-build-g-1');
click('m26-build-c-0'); click('m26-build-c-1'); click('m26-build-c-2');
click('m26-build-check');
check('m26-build L0: 3 cubes, front 3 top 3 left 1',
  (txt('m26-build-msg') || '').indexOf('搭对了') >= 0 &&
  (txt('m26-build-msg') || '').indexOf('一共 3 块') >= 0 &&
  tiersDoneFor('m26-build', 0) && triedKeys.indexOf('m26-build') >= 0);
click('m26-build-level-1');
click('m26-build-g-1');
click('m26-build-c-0'); click('m26-build-c-1'); click('m26-build-c-1'); click('m26-build-c-2');
click('m26-build-check');
check('m26-build L1: 4 cubes, middle stack 2 high',
  (txt('m26-build-msg') || '').indexOf('一共 4 块') >= 0 &&
  tiersDoneFor('m26-build', 1));

// m27-elapsed: 7:15 to 7:45 is 30 min; 8:20 to 9:05 is 45 min
renderAnim('m27-elapsed');
click('m27-elapsed-g-1');
click('m27-elapsed-go'); click('m27-elapsed-go');
click('m27-elapsed-check');
check('m27-elapsed L0: 7:15 to 7:45 is 30 minutes',
  (txt('m27-elapsed-msg') || '').indexOf('一共 30 分钟') >= 0 &&
  tiersDoneFor('m27-elapsed', 0) && triedKeys.indexOf('m27-elapsed') >= 0);
click('m27-elapsed-level-1');
click('m27-elapsed-g-1');
click('m27-elapsed-go'); click('m27-elapsed-go');
click('m27-elapsed-check');
check('m27-elapsed L1: 8:20 to 9:05 is 45 minutes',
  (txt('m27-elapsed-msg') || '').indexOf('一共 45 分钟') >= 0 &&
  tiersDoneFor('m27-elapsed', 1));

// m215-lines: 3 shirts x 2 pants = 6 lines
renderAnim('m215-lines');
click('m215-lines-g-1');
click('m215-lines-s-0'); click('m215-lines-p-0');
click('m215-lines-s-0'); click('m215-lines-p-1');
click('m215-lines-s-1'); click('m215-lines-p-0');
click('m215-lines-s-1'); click('m215-lines-p-1');
click('m215-lines-s-2'); click('m215-lines-p-0');
click('m215-lines-s-2'); click('m215-lines-p-1');
click('m215-lines-check');
check('m215-lines L0: 3 shirts x 2 pants = 6',
  (txt('m215-lines-msg') || '').indexOf('3 件上衣 × 2 条裤子 = 6 种穿法') >= 0 &&
  tiersDoneFor('m215-lines', 0) && triedKeys.indexOf('m215-lines') >= 0);

// m214a-tally: 12 votes = 2 zheng + 2 strokes
renderAnim('m214a-tally');
click('m214a-tally-g-1');
click('m214a-tally-five'); click('m214a-tally-five');
click('m214a-tally-one'); click('m214a-tally-one');
click('m214a-tally-check');
check('m214a-tally L0: 12 votes = 2 zheng + 2 strokes',
  (txt('m214a-tally-msg') || '').indexOf('12 票 = 2 个“正” + 2 画') >= 0 &&
  tiersDoneFor('m214a-tally', 0) && triedKeys.indexOf('m214a-tally') >= 0);

// m214a-picto: apple 4 vs banana 3, apple more by 1
renderAnim('m214a-picto');
click('m214a-picto-g-0');
click('m214a-picto-stack'); click('m214a-picto-tobar');
click('m214a-picto-check');
check('m214a-picto L0: apple 4, banana 3, apple more by 1',
  (txt('m214a-picto-msg') || '').indexOf('苹果多 1 个') >= 0 &&
  tiersDoneFor('m214a-picto', 0) && triedKeys.indexOf('m214a-picto') >= 0);

// m28-verse: 12/3 = 4 via three-four-twelve
renderAnim('m28-verse');
click('m28-verse-g-1');
click('m28-verse-v-1');
click('m28-verse-check');
check('m28-verse L0: 12/3 = 4, three-four-twelve',
  (txt('m28-verse-msg') || '').indexOf('12÷3=4') >= 0 &&
  tiersDoneFor('m28-verse', 0) && triedKeys.indexOf('m28-verse') >= 0);

// m29-mirror: 3 mirrors left-right; ri stays ri
renderAnim('m29-mirror');
click('m29-mirror-g-1');
click('m29-mirror-mirror');
click('m29-mirror-check');
check('m29-mirror L0: 3 flips left-right in the mirror',
  (txt('m29-mirror-msg') || '').indexOf('左右翻过来的 3') >= 0 &&
  tiersDoneFor('m29-mirror', 0) && triedKeys.indexOf('m29-mirror') >= 0);
click('m29-mirror-level-2');
click('m29-mirror-g-0');
click('m29-mirror-mirror');
click('m29-mirror-check');
check('m29-mirror L2: symmetric ri stays ri',
  (txt('m29-mirror-msg') || '').indexOf('还是“日”') >= 0 &&
  tiersDoneFor('m29-mirror', 2));

// m210-story: 3x4+2 = 14, multiply pile first
renderAnim('m210-story');
click('m210-story-g-1');
click('m210-story-mul'); click('m210-story-add');
click('m210-story-check');
check('m210-story L0: 3x4+2 = 14',
  (txt('m210-story-msg') || '').indexOf('3×4+2=14') >= 0 &&
  tiersDoneFor('m210-story', 0) && triedKeys.indexOf('m210-story') >= 0);

// m211-jump: 17/5 = 3 rem 2, three jumps of 5
renderAnim('m211-jump');
click('m211-jump-g-1');
click('m211-jump-jump'); click('m211-jump-jump'); click('m211-jump-jump');
click('m211-jump-check');
check('m211-jump L0: 17/5 = 3 rem 2',
  (txt('m211-jump-msg') || '').indexOf('17÷5=3……2') >= 0 &&
  tiersDoneFor('m211-jump', 0) && triedKeys.indexOf('m211-jump') >= 0);

// m211-vert: 17/5 vertical, four steps
renderAnim('m211-vert');
click('m211-vert-g-1');
click('m211-vert-s-0'); click('m211-vert-s-1'); click('m211-vert-s-2'); click('m211-vert-s-3');
click('m211-vert-check');
check('m211-vert L0: 17/5 = 3 rem 2, remainder smaller than divisor',
  (txt('m211-vert-msg') || '').indexOf('17÷5=3……2') >= 0 &&
  tiersDoneFor('m211-vert', 0) && triedKeys.indexOf('m211-vert') >= 0);

// m211-ceil: 17 people, 5 per boat, 4 boats (round up)
renderAnim('m211-ceil');
click('m211-ceil-g-1');
click('m211-ceil-fill'); click('m211-ceil-fill'); click('m211-ceil-fill');
click('m211-ceil-rest');
click('m211-ceil-check');
check('m211-ceil L0: 17 people need 4 boats',
  (txt('m211-ceil-msg') || '').indexOf('一共 4 条') >= 0 &&
  tiersDoneFor('m211-ceil', 0) && triedKeys.indexOf('m211-ceil') >= 0);

// m212-blocks: 10 hundreds = 1 thousand; 2500 = 2 thousands + 5 hundreds
renderAnim('m212-blocks');
click('m212-blocks-g-1');
click('m212-blocks-h10');
click('m212-blocks-check');
check('m212-blocks L0: 10 hundreds = 1 thousand',
  (txt('m212-blocks-msg') || '').indexOf('10 个 100 = 1 个 1000') >= 0 &&
  tiersDoneFor('m212-blocks', 0) && triedKeys.indexOf('m212-blocks') >= 0);
click('m212-blocks-level-1');
click('m212-blocks-g-1');
click('m212-blocks-h10'); click('m212-blocks-h10');
for (let i = 0; i < 5; i++) click('m212-blocks-h1');
click('m212-blocks-check');
check('m212-blocks L1: 25 hundreds = 2 thousands + 5 hundreds = 2500',
  (txt('m212-blocks-msg') || '').indexOf('2 个 1000 + 5 个 100 = 2500') >= 0 &&
  tiersDoneFor('m212-blocks', 1));

// m212-abacus: 1000 is 1 bead on thousands; 9999 + 1 = 10000
renderAnim('m212-abacus');
click('m212-abacus-g-1');
click('m212-abacus-d-th');
click('m212-abacus-check');
check('m212-abacus L0: 1000 is 1 bead on thousands',
  (txt('m212-abacus-msg') || '').indexOf('千位 1 颗') >= 0 &&
  tiersDoneFor('m212-abacus', 0) && triedKeys.indexOf('m212-abacus') >= 0);
click('m212-abacus-level-2');
click('m212-abacus-g-1');
click('m212-abacus-d-o');
click('m212-abacus-check');
check('m212-abacus L2: 9999 + 1 = 10000, ten-thousands appears',
  (txt('m212-abacus-msg') || '').indexOf('是 10000') >= 0 &&
  (txt('m212-abacus-msg') || '').indexOf('万位出现 1') >= 0 &&
  tiersDoneFor('m212-abacus', 2));

// m213-est: schoolbag 1500 g = 10 apples
renderAnim('m213-est');
click('m213-est-g-1');
click('m213-est-weigh');
click('m213-est-check');
check('m213-est L0: schoolbag 1500 g = 10 apples',
  (txt('m213-est-msg') || '').indexOf('150×10=1500') >= 0 &&
  tiersDoneFor('m213-est', 0) && triedKeys.indexOf('m213-est') >= 0);

// m214b-sudoku: row 0 misses 4; challenge fills two blanks (1 and 4)
renderAnim('m214b-sudoku');
click('m214b-sudoku-g-2');
click('m214b-sudoku-c-0-3');
click('m214b-sudoku-d-4');
click('m214b-sudoku-check');
check('m214b-sudoku L0: row 0 misses 4',
  (txt('m214b-sudoku-msg') || '').indexOf('第一行缺的是 4') >= 0 &&
  tiersDoneFor('m214b-sudoku', 0) && triedKeys.indexOf('m214b-sudoku') >= 0);
click('m214b-sudoku-level-2');
click('m214b-sudoku-g-0');
click('m214b-sudoku-c-1-2');
click('m214b-sudoku-d-1');
click('m214b-sudoku-c-3-0');
click('m214b-sudoku-d-4');
click('m214b-sudoku-check');
check('m214b-sudoku L2: two blanks filled (1 and 4)',
  (txt('m214b-sudoku-msg') || '').indexOf('两个空都填对了') >= 0 &&
  tiersDoneFor('m214b-sudoku', 2));

console.log('\nsmoke-anims-band-1-3: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
