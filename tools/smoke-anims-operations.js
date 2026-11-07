// Smoke tests for apps/web/anims-operations.js (no DOM: a tiny fake DOM stub).
// Run: node tools/smoke-anims-operations.js
// Checks: 15 registry anims present with valid fields, points exist in the
// real grade files, keys do not collide with hand-wired demos or band anims,
// no forbidden script-close tag or braces inside strings, each render runs
// in the stub without throwing, tiers + discovery are wired, and each
// animation's core interaction produces the expected (hand-verified) result.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let pass = 0, fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('FAIL  ' + name); }
}

const root = path.resolve(__dirname, '..');
const opsSrc = fs.readFileSync(path.join(root, 'apps/web/anims-operations.js'), 'utf8');
const regSrc = fs.readFileSync(path.join(root, 'apps/web/anims-registry.js'), 'utf8');

// ---------- tiny fake DOM ----------
// Only what the renders use: innerHTML (id-registering), getElementById,
// createElement, addEventListener/click, textContent, setAttribute, classList,
// style, dataset, value, disabled, hidden.
const doc = {
  _byId: {},
  getElementById: function (id) { return this._byId[id] || null; },
  createElement: function (tag) { return new FakeEl(tag); },
  reset: function () { this._byId = {}; }
};
function FakeEl(tag) {
  this.tagName = tag || 'div';
  this.children = [];
  this._handlers = {};
  this._attrs = {};
  this._classes = [];
  this.style = {};
  this.dataset = {};
  this.textContent = '';
  this.value = '';
  this.disabled = false;
  this.hidden = false;
  this._html = '';
  this._owned = [];
  this.id = '';
  const self = this;
  this.classList = {
    add: function (c) { if (self._classes.indexOf(c) < 0) self._classes.push(c); },
    remove: function (c) { const i = self._classes.indexOf(c); if (i >= 0) self._classes.splice(i, 1); },
    contains: function (c) { return self._classes.indexOf(c) >= 0; }
  };
}
Object.defineProperty(FakeEl.prototype, 'innerHTML', {
  get: function () { return this._html; },
  set: function (html) {
    this._html = String(html);
    (this._owned || []).forEach(function (id) { delete doc._byId[id]; });
    this._owned = [];
    const re = /id="([^"]+)"/g;
    let m;
    while ((m = re.exec(this._html))) {
      const el = new FakeEl('div');
      el.id = m[1];
      doc._byId[m[1]] = el;
      this._owned.push(m[1]);
    }
  }
});
FakeEl.prototype.setAttribute = function (n, v) { this._attrs[n] = String(v); };
FakeEl.prototype.getAttribute = function (n) {
  return Object.prototype.hasOwnProperty.call(this._attrs, n) ? this._attrs[n] : null;
};
FakeEl.prototype.appendChild = function (child) { this.children.push(child); return child; };
FakeEl.prototype.addEventListener = function (type, fn) {
  (this._handlers[type] = this._handlers[type] || []).push(fn);
};
FakeEl.prototype.click = function () {
  const ev = {
    target: this,
    preventDefault: function () {},
    dataTransfer: { setData: function () {}, getData: function () { return ''; } }
  };
  (this._handlers.click || []).forEach(function (f) { f(ev); });
};

// ---------- load registry + operations in a sandbox without app.js ----------
const triedLog = [];
const tiersByKey = {};
const discLog = [];
const sandbox = {
  console: console,
  document: doc,
  markTried: function (k) { triedLog.push(k); },
  makeTiers: function (el, labels, key) {
    const rec = { labels: labels, doneLog: [], el: el };
    tiersByKey[key] = rec;
    return {
      done: function (i) { rec.doneLog.push(i); },
      set: function (i, on) {}
    };
  },
  wireDiscovery: function (key, inputId, btnId, outId) {
    discLog.push({ key: key, inputId: inputId, btnId: btnId, outId: outId });
  }
};
vm.createContext(sandbox);
vm.runInContext(regSrc, sandbox, { filename: 'anims-registry.js' });
vm.runInContext(opsSrc, sandbox, { filename: 'anims-operations.js' });
const REG = sandbox.ANIM_REGISTRY;

const EXPECTED = [
  { key: 'op-overshoot', grade: 4, kind: '实验', points: ['4.6'] },
  { key: 'op-vertical', grade: 3, kind: '模拟', points: ['3.2', '2.3'] },
  { key: 'op-estimate', grade: 3, kind: '模拟', points: ['3.2'] },
  { key: 'op-transform', grade: 4, kind: '模拟', points: ['4.10'] },
  { key: 'op-decscale', grade: 5, kind: '模拟', points: ['5.3'] },
  { key: 'op-fracwrong', grade: 5, kind: '实验', points: ['5.11'] },
  { key: 'op-bracket', grade: 4, kind: '模拟', points: ['4.9'] },
  { key: 'op-assoc', grade: 4, kind: '模拟', points: ['4.10'] },
  { key: 'op-maketen', grade: 2, kind: '模拟', points: ['1.9', '2.3'] },
  { key: 'op-powroot', grade: 8, kind: '模拟', points: ['8.5', '8.10'] },
  { key: 'op-addlen', grade: 2, kind: '模拟', points: ['1.15', '2.2'] },
  { key: 'op-compare', grade: 1, kind: '模拟', points: ['1.1'] },
  { key: 'op-nine', grade: 2, kind: '模拟', points: ['2.5'] },
  { key: 'op-comden', grade: 5, kind: '实验', points: ['5.11'] },
  { key: 'op-decbreak', grade: 4, kind: '实验', points: ['4.13'] }
];

// ---------- static checks ----------
check('registry has exactly the 15 operations anims',
  Object.keys(REG).length === 15 && EXPECTED.every(function (e) { return !!REG[e.key]; }));
EXPECTED.forEach(function (e) {
  const a = REG[e.key] || {};
  check(e.key + ': fields valid',
    typeof a.title === 'string' && a.title.length > 0 &&
    typeof a.sub === 'string' && a.sub.length > 0 &&
    a.grade === e.grade && a.kind === e.kind && a.group === 'operations' &&
    JSON.stringify(a.points) === JSON.stringify(e.points) &&
    typeof a.render === 'function' &&
    /^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.key));
});
// points exist in the real grade files
const gradePoints = {};
for (let g = 1; g <= 9; g++) {
  const src = fs.readFileSync(path.join(root, 'content/grades/grade-' + g + '.js'), 'utf8');
  gradePoints[g] = new Set([...src.matchAll(/id:\s*["'](\d+\.\d+[a-z]?)["']/g)].map(function (m) { return m[1]; }));
}
EXPECTED.forEach(function (e) {
  e.points.forEach(function (pid) {
    const g = parseInt(pid.split('.')[0], 10);
    check(e.key + ': point ' + pid + ' exists in grade-' + g + '.js', gradePoints[g].has(pid));
  });
});
// keys do not collide with hand-wired demos (ALL_DEMOS in app.js) or band anims
const appSrc = fs.readFileSync(path.join(root, 'apps/web/app.js'), 'utf8');
const allDemos = [...appSrc.match(/const ALL_DEMOS = \[([\s\S]*?)\];/)[1].matchAll(/'([a-z0-9-]+)'/g)].map(function (m) { return m[1]; });
const bandKeys = [];
['anims-band-1-3.js', 'anims-band-4-6.js', 'anims-band-7-9.js'].forEach(function (f) {
  const p = path.join(root, 'apps/web/' + f);
  if (!fs.existsSync(p)) return;
  const t = fs.readFileSync(p, 'utf8');
  [...t.matchAll(/key:\s*'([^']+)'/g)].forEach(function (m) { bandKeys.push(m[1]); });
});
EXPECTED.forEach(function (e) {
  check(e.key + ': no collision with hand-wired demos or band anims',
    allDemos.indexOf(e.key) < 0 && bandKeys.indexOf(e.key) < 0);
});
check('no script-close tag in operations file', opsSrc.indexOf('</script>') < 0);
// no braces inside string literals (the build inlines this file; braces in
// strings would confuse the registry brace counter in check-views.py)
(function () {
  let bad = false;
  for (let i = 0; i < opsSrc.length; i++) {
    const c = opsSrc[i];
    if (c === "'" || c === '"') {
      const q = c;
      let j = i + 1;
      while (j < opsSrc.length && opsSrc[j] !== q) { if (opsSrc[j] === '\\') j++; j++; }
      const lit = opsSrc.slice(i + 1, j);
      if (lit.indexOf('{') >= 0 || lit.indexOf('}') >= 0) bad = true;
      i = j;
    }
  }
  check('no braces inside string literals', !bad);
})();

// ---------- independent arithmetic (hand-verified numbers the anims use) ----------
check('arith: trial quotients', 24 * 8 === 192 && 24 * 7 === 168 && 36 * 7 === 252 && 36 * 8 === 288 && 69 * 7 === 483 && 69 * 8 === 552);
check('arith: verticals', 38 + 45 === 83 && 52 - 27 === 25 && 486 + 257 === 743);
check('arith: estimates', 48 + 31 === 79 && 297 + 486 === 783 && 512 - 268 === 244);
check('arith: transforms', 398 + 456 === 854 && 400 + 454 === 854 && 16 * 25 === 400 && 8 * 50 === 400 && 4 * 100 === 400 && 597 + 386 === 983 && 600 + 383 === 983);
check('arith: decimal scaling', Math.abs(3.6 / 0.9 - 4) < 1e-9 && Math.abs(0.48 / 0.12 - 4) < 1e-9 && Math.abs(5.4 / 0.6 - 9) < 1e-9);
check('arith: fraction wrong vs true',
  (1 * 3 + 1 * 2) / (2 * 3) === 5 / 6 && 3 / 4 - 1 / 2 === 1 / 4 && (2 * 6 + 1 * 3) / (3 * 6) === 5 / 6);
check('arith: brackets', (2 + 3) * 4 === 20 && 2 + 3 * 4 === 14 && (12 - 3) * 2 === 18 && 12 - 3 * 2 === 6 && 6 + 8 / (2 - 1) === 14 && 6 + 8 / 2 - 1 === 9);
check('arith: associative + subtraction contrast',
  (8 + 5) + 7 === 20 && 8 + (5 + 7) === 20 && (2 * 3) * 4 === 24 && 2 * (3 * 4) === 24 &&
  25 + 17 + 13 === 55 && (10 - 3) - 2 === 5 && 10 - (3 - 2) === 9);
check('arith: make-ten / break-ten', 8 + 5 === 13 && 13 - 5 === 8 && 9 + 6 === 15);
check('arith: powers and roots', 3 * 3 === 9 && 5 * 5 * 5 === 125 && 7 * 7 === 49 && 12 * 12 === 144);
check('arith: length addition', 7 + 5 === 12 && 23 + 15 === 38 && 38 + 27 === 65);
check('arith: comparison differences', 7 - 5 === 2 && 12 - 8 === 4 && 15 - 9 === 6);
check('arith: nine times table', 9 * 1 === 9 && 9 * 2 === 18 && 9 * 3 === 27 && 9 * 4 === 36 && 9 * 5 === 45 && 9 * 6 === 54 && 9 * 7 === 63 && 9 * 8 === 72 && 9 * 9 === 81);
check('arith: common denominators', (1 * 3 + 1 * 2) / 6 === 5 / 6 && (3 * 8 / 4 - 1 * 8 / 2) / 8 === 1 / 4 && (2 * 12 / 3 + 1 * 12 / 6) / 12 === 5 / 6);
check('arith: decimal subtraction by breaking', Math.abs(5.3 - 2.86 - 2.44) < 1e-9 && Math.abs(4.2 - 1.75 - 2.45) < 1e-9 && Math.abs(7.05 - 3.48 - 3.57) < 1e-9);

// ---------- render helpers ----------
function renderAnim(key) {
  doc.reset();
  const host = new FakeEl('div');
  let err = null;
  try { REG[key].render(host); } catch (e) { err = e; }
  check(key + ': render runs without throwing', err === null);
  return host;
}
function el(id) { return doc.getElementById(id); }
function click(id) {
  const e = el(id);
  if (!e) { check('click ' + id + ' exists', false); return; }
  e.click();
}
function txt(id) { const e = el(id); return e ? e.textContent : null; }
function inner(id) { const e = el(id); return e ? e.innerHTML : ''; }
function has(id, frag) { return inner(id).indexOf(frag) >= 0; }
function hasTier(k, i) { const t = tiersByKey[k]; return !!t && t.doneLog.indexOf(i) >= 0; }
function tierCount(k) { const t = tiersByKey[k]; return t ? t.doneLog.length : -1; }

// ---------- (1) op-overshoot ----------
(function () {
  const K = 'op-overshoot';
  const host = renderAnim(K);
  check(K + ': title + first problem shown', host.innerHTML.indexOf('试商超调') >= 0 && host.innerHTML.indexOf('168 ÷ 24') >= 0);
  click(K + '-check'); // guess starts at 8: 24x8=192 overshoots 168 by 24
  check(K + ': overshoot 8 is seen', (txt(K + '-msg') || '').indexOf('超了') >= 0 && (txt(K + '-msg') || '').indexOf('24') >= 0);
  click(K + '-guess-minus');
  check(K + ': guess steps down to 7', (txt(K + '-guess') || '').indexOf('7') >= 0);
  click(K + '-check');
  check(K + ': 168/24 solved at 7', (txt(K + '-msg') || '').indexOf('正好除尽') >= 0 && (txt(K + '-msg') || '').indexOf('商是 7') >= 0);
  check(K + ': tier 0 done + markTried', hasTier(K, 0) && triedLog.indexOf(K) >= 0);
  click(K + '-level-1'); // 252/36, start 6: 36x6=216, remainder 36 = divisor -> too small
  click(K + '-check');
  check(K + ': 252/36 guess 6 too small', (txt(K + '-msg') || '').indexOf('商小了') >= 0);
  click(K + '-guess-plus');
  click(K + '-check');
  check(K + ': 252/36 solved at 7', (txt(K + '-msg') || '').indexOf('正好除尽') >= 0);
  click(K + '-level-2'); // 483/69, start 7: exact at once
  click(K + '-check');
  check(K + ': 483/69 solved at 7', (txt(K + '-msg') || '').indexOf('正好除尽') >= 0);
  check(K + ': all 3 tiers done', tierCount(K) === 3);
})();

// ---------- (2) op-vertical ----------
(function () {
  const K = 'op-vertical';
  renderAnim(K);
  click(K + '-d4'); // wrong first digit for 8+5=13 (ones should be 3)
  check(K + ': wrong digit is refused with a hint', (txt(K + '-msg') || '').indexOf('不对') >= 0);
  click(K + '-d3');
  check(K + ': ones 3 placed', txt(K + '-r-o') === '3');
  click(K + '-d1');
  check(K + ': carry 1 placed', txt(K + '-c-t') === '1');
  click(K + '-d8');
  check(K + ': 38+45 built to 83', (txt(K + '-msg') || '').indexOf('83') >= 0 && hasTier(K, 0));
  click(K + '-level-1'); // 52-27: borrow 5->4, 12-7=5, 4-2=2
  click(K + '-d4');
  check(K + ': borrow turns tens 5 into 4', txt(K + '-a-t') === '4');
  click(K + '-d5');
  click(K + '-d2');
  check(K + ': 52-27 built to 25', (txt(K + '-msg') || '').indexOf('25') >= 0);
  click(K + '-level-2'); // 486+257: 3,1,4,1,7
  [3, 1, 4, 1, 7].forEach(function (d) { click(K + '-d' + d); });
  check(K + ': 486+257 built to 743', (txt(K + '-msg') || '').indexOf('743') >= 0 && tierCount(K) === 3);
})();

// ---------- (3) op-estimate ----------
(function () {
  const K = 'op-estimate';
  renderAnim(K);
  click(K + '-est-plus'); // 70 -> 80
  check(K + ': estimate moves to 80', (txt(K + '-est') || '').indexOf('80') >= 0);
  click(K + '-lock');
  click(K + '-exact');
  check(K + ': 48+31 exact 79, estimate off by 1', (txt(K + '-msg') || '').indexOf('79') >= 0 && (txt(K + '-msg') || '').indexOf('只差 1') >= 0);
  check(K + ': tier 0 done', hasTier(K, 0));
  click(K + '-level-1'); // 297+486, start 700 -> 790
  for (let i = 0; i < 9; i++) click(K + '-est-plus');
  click(K + '-lock');
  click(K + '-exact');
  check(K + ': 297+486 exact 783, estimate off by 7', (txt(K + '-msg') || '').indexOf('783') >= 0 && (txt(K + '-msg') || '').indexOf('只差 7') >= 0);
  click(K + '-level-2'); // 512-268, start 200 -> 240
  for (let i = 0; i < 4; i++) click(K + '-est-plus');
  click(K + '-lock');
  click(K + '-exact');
  check(K + ': 512-268 exact 244, estimate off by 4', (txt(K + '-msg') || '').indexOf('244') >= 0 && tierCount(K) === 3);
})();

// ---------- (4) op-transform ----------
(function () {
  const K = 'op-transform';
  renderAnim(K);
  click(K + '-guess-1'); // 844 is wrong for 398+456
  check(K + ': wrong guess is refused', (txt(K + '-msg') || '').indexOf('不是 844') >= 0);
  click(K + '-guess-0'); // 854
  check(K + ': right guess accepted', (txt(K + '-msg') || '').indexOf('猜对了') >= 0);
  click(K + '-move');
  check(K + ': 398+456 becomes 400+454=854', (txt(K + '-eq') || '').indexOf('400 + 454 = 854') >= 0);
  check(K + ': tier 0 done', hasTier(K, 0));
  click(K + '-level-1'); // 16x25 -> 8x50 -> 4x100
  click(K + '-guess-0'); // 400
  click(K + '-move');
  check(K + ': 16x25 becomes 8x50', (txt(K + '-eq') || '').indexOf('8 × 50 = 400') >= 0);
  click(K + '-move');
  check(K + ': 8x50 becomes 4x100', (txt(K + '-eq') || '').indexOf('4 × 100 = 400') >= 0 && hasTier(K, 1));
  click(K + '-level-2'); // 597+386 -> 600+383
  click(K + '-guess-0'); // 983
  click(K + '-move');
  check(K + ': 597+386 becomes 600+383=983', (txt(K + '-eq') || '').indexOf('600 + 383 = 983') >= 0 && tierCount(K) === 3);
})();

// ---------- (5) op-decscale ----------
(function () {
  const K = 'op-decscale';
  renderAnim(K);
  for (let i = 0; i < 3; i++) click(K + '-guess-plus'); // guess 4
  check(K + ': guess steps to 4', (txt(K + '-guess') || '').indexOf('4') >= 0);
  click(K + '-s10');
  check(K + ': x10 scales 3.6/0.9 to 36/9', (txt(K + '-eq') || '').indexOf('36 ÷ 9') >= 0);
  click(K + '-verify');
  check(K + ': 3.6/0.9 verified as 4', (txt(K + '-msg') || '').indexOf('商是 4') >= 0 && hasTier(K, 0));
  click(K + '-level-1'); // 0.48/0.12
  for (let i = 0; i < 3; i++) click(K + '-guess-plus');
  click(K + '-s100');
  check(K + ': x100 scales 0.48/0.12 to 48/12', (txt(K + '-eq') || '').indexOf('48 ÷ 12') >= 0);
  click(K + '-verify');
  check(K + ': 0.48/0.12 verified as 4', (txt(K + '-msg') || '').indexOf('商是 4') >= 0);
  click(K + '-level-2'); // 5.4/0.6 = 9
  for (let i = 0; i < 8; i++) click(K + '-guess-plus');
  click(K + '-verify');
  check(K + ': 5.4/0.6 verified as 9', (txt(K + '-msg') || '').indexOf('商是 9') >= 0 && tierCount(K) === 3);
})();

// ---------- (6) op-fracwrong ----------
(function () {
  const K = 'op-fracwrong';
  renderAnim(K);
  click(K + '-guess-no');
  check(K + ': wrong-move guess recorded', (txt(K + '-msg') || '').indexOf('错法不对') >= 0);
  click(K + '-show-naive');
  check(K + ': naive 1/2+1/3 drawn as 2/5', has(K + '-bars', '2/5'));
  click(K + '-show-true');
  check(K + ': true 1/2+1/3 drawn as 5/6', has(K + '-bars', '5/6') && hasTier(K, 0));
  click(K + '-level-1'); // 3/4-1/2: naive 2/2, true 1/4
  click(K + '-guess-no');
  click(K + '-show-naive');
  check(K + ': naive 3/4-1/2 drawn as 2/2', has(K + '-bars', '2/2'));
  click(K + '-show-true');
  check(K + ': true 3/4-1/2 drawn as 1/4', has(K + '-bars', '1/4'));
  click(K + '-level-2'); // 2/3+1/6: naive 3/9, true 5/6
  click(K + '-guess-no');
  click(K + '-show-naive');
  click(K + '-show-true');
  check(K + ': 2/3+1/6 naive 3/9 vs true 5/6', has(K + '-bars', '3/9') && has(K + '-bars', '5/6') && tierCount(K) === 3);
})();

// ---------- (7) op-bracket ----------
(function () {
  const K = 'op-bracket';
  renderAnim(K);
  click(K + '-target-1'); // target 20
  click(K + '-place-1'); // (2+3)x4
  check(K + ': (2+3)x4 makes 20', (txt(K + '-eq') || '').indexOf('(2 + 3) × 4 = 20') >= 0 && (txt(K + '-msg') || '').indexOf('凑到了') >= 0);
  click(K + '-target-0'); // target 14
  click(K + '-place-0'); // no brackets
  check(K + ': 2+3x4 makes 14, tier done', (txt(K + '-eq') || '').indexOf('2 + 3 × 4 = 14') >= 0 && hasTier(K, 0));
  click(K + '-level-1'); // 12-3x2: targets 6, 18
  click(K + '-target-1');
  click(K + '-place-1'); // (12-3)x2
  check(K + ': (12-3)x2 makes 18', (txt(K + '-eq') || '').indexOf('(12 − 3) × 2 = 18') >= 0);
  click(K + '-target-0');
  click(K + '-place-0');
  check(K + ': 12-3x2 makes 6, tier done', (txt(K + '-eq') || '').indexOf('12 − 3 × 2 = 6') >= 0 && hasTier(K, 1));
  click(K + '-level-2'); // 6+8/2-1: targets 9, 14
  click(K + '-target-1');
  click(K + '-place-2'); // 6+8/(2-1)
  check(K + ': 6+8/(2-1) makes 14', (txt(K + '-eq') || '').indexOf('6 + 8 ÷ (2 − 1) = 14') >= 0);
  click(K + '-target-0');
  click(K + '-place-0');
  check(K + ': 6+8/2-1 makes 9, tier done', (txt(K + '-eq') || '').indexOf('6 + 8 ÷ 2 − 1 = 9') >= 0 && tierCount(K) === 3);
})();

// ---------- (8) op-assoc ----------
(function () {
  const K = 'op-assoc';
  renderAnim(K);
  click(K + '-guess-same');
  click(K + '-left');
  check(K + ': (8+5)+7 is 20', (txt(K + '-msg') || '').indexOf('(8+5)+7 = 20') >= 0);
  click(K + '-right');
  check(K + ': 8+(5+7) is 20, tier done', (txt(K + '-msg') || '').indexOf('8+(5+7)=20') >= 0 && hasTier(K, 0));
  click(K + '-sub');
  check(K + ': subtraction contrast shown', (txt(K + '-sub-tx') || '').indexOf('9') >= 0 && (txt(K + '-sub-tx') || '').indexOf('5') >= 0);
  click(K + '-level-1'); // 2x3x4
  click(K + '-left');
  check(K + ': (2x3)x4 is 24', (txt(K + '-msg') || '').indexOf('(2×3)×4 = 24') >= 0);
  click(K + '-right');
  check(K + ': 2x(3x4) is 24', (txt(K + '-msg') || '').indexOf('2×(3×4) = 24') >= 0);
  click(K + '-level-2'); // 25+17+13
  click(K + '-left');
  click(K + '-right');
  check(K + ': 25+17+13 both ways 55', (txt(K + '-msg') || '').indexOf('55') >= 0 && tierCount(K) === 3);
})();

// ---------- (9) op-maketen ----------
(function () {
  const K = 'op-maketen';
  renderAnim(K);
  click(K + '-guess-plus');
  click(K + '-guess-plus'); // guess 2
  click(K + '-guess-set');
  check(K + ': make-ten guess 2 correct', (txt(K + '-msg') || '').indexOf('猜对了') >= 0);
  click(K + '-out-0'); // move 1 of 2 into the box
  click(K + '-out-0'); // move the 2nd; box is full
  check(K + ': 8+5 fills the ten to 13', (txt(K + '-msg') || '').indexOf('装满 10 了') >= 0 && (txt(K + '-msg') || '').indexOf('13') >= 0);
  check(K + ': tier 0 done', hasTier(K, 0));
  click(K + '-level-1'); // 13-5 break-ten: guess 3, remove 3 outside, then 2 from box
  for (let i = 0; i < 3; i++) click(K + '-guess-plus');
  click(K + '-guess-set');
  check(K + ': break-ten guess 3 correct', (txt(K + '-msg') || '').indexOf('猜对了') >= 0);
  click(K + '-out-0');
  click(K + '-out-0');
  click(K + '-out-0');
  check(K + ': outside 3 removed, 10 left', (txt(K + '-msg') || '').indexOf('还剩 10 个') >= 0);
  click(K + '-slot-0');
  click(K + '-slot-0');
  check(K + ': 13-5 breaks ten to 8', (txt(K + '-msg') || '').indexOf('13−5=8') >= 0 && hasTier(K, 1));
  click(K + '-level-2'); // 9+6: guess 1, move 1
  click(K + '-guess-plus');
  click(K + '-guess-set');
  click(K + '-out-0');
  check(K + ': 9+6 fills the ten to 15', (txt(K + '-msg') || '').indexOf('装满 10 了') >= 0 && (txt(K + '-msg') || '').indexOf('15') >= 0 && tierCount(K) === 3);
})();

// ---------- (10) op-powroot ----------
(function () {
  const K = 'op-powroot';
  renderAnim(K);
  click(K + '-n-plus');
  click(K + '-n-plus'); // n=3
  check(K + ': 3 squared is 9', (txt(K + '-sq-tx') || '').indexOf('3² = 9') >= 0);
  click(K + '-mode-root');
  click(K + '-s-plus');
  click(K + '-s-plus'); // s=3
  click(K + '-verify');
  check(K + ': square root of 9 is 3', (txt(K + '-msg') || '').indexOf('√9 = 3') >= 0 && hasTier(K, 0));
  click(K + '-mode-cube');
  for (let i = 0; i < 4; i++) click(K + '-c-plus'); // cn=5
  check(K + ': 5 cubed is 125, cube root 5', (txt(K + '-cube-tx') || '').indexOf('5³') >= 0 && (txt(K + '-cube-tx') || '').indexOf('125') >= 0 && (txt(K + '-cube-tx') || '').indexOf('∛125 = 5') >= 0);
  check(K + ': tier 1 done', hasTier(K, 1));
  click(K + '-mode-square');
  for (let i = 0; i < 4; i++) click(K + '-n-plus'); // n=7
  check(K + ': 7 squared is 49', (txt(K + '-sq-tx') || '').indexOf('7² = 49') >= 0);
  click(K + '-mode-root');
  click(K + '-a49');
  for (let i = 0; i < 4; i++) click(K + '-s-plus'); // s=7
  click(K + '-verify');
  check(K + ': square root of 49 is 7, all tiers done', (txt(K + '-msg') || '').indexOf('√49 = 7') >= 0 && tierCount(K) === 3);
})();

// ---------- (11) op-addlen ----------
(function () {
  const K = 'op-addlen';
  const host = renderAnim(K);
  check(K + ': title + first problem shown', host.innerHTML.indexOf('长度条相加') >= 0 && host.innerHTML.indexOf('7 + 5') >= 0);
  click(K + '-guess-1'); // 11 is wrong for 7+5
  check(K + ': wrong guess is refused', (txt(K + '-msg') || '').indexOf('不是 11') >= 0);
  click(K + '-guess-0'); // 12
  check(K + ': right guess accepted', (txt(K + '-msg') || '').indexOf('猜对了') >= 0);
  click(K + '-join');
  check(K + ': 7+5 joins to 12, one ten + two ones', (txt(K + '-eq') || '').indexOf('7 + 5 = 12') >= 0 && has(K + '-bars', '一共 12 个格') && hasTier(K, 0));
  click(K + '-level-1'); // 23+15
  click(K + '-guess-0'); // 38
  click(K + '-join');
  check(K + ': 23+15 joins to 38', (txt(K + '-eq') || '').indexOf('23 + 15 = 38') >= 0 && hasTier(K, 1));
  click(K + '-level-2'); // 38+27
  click(K + '-guess-0'); // 65
  click(K + '-join');
  check(K + ': 38+27 joins to 65, all tiers done', (txt(K + '-eq') || '').indexOf('38 + 27 = 65') >= 0 && tierCount(K) === 3);
})();

// ---------- (12) op-compare ----------
(function () {
  const K = 'op-compare';
  const host = renderAnim(K);
  check(K + ': title + first problem shown', host.innerHTML.indexOf('比多少') >= 0 && host.innerHTML.indexOf('7 比 5') >= 0);
  click(K + '-guess-1'); // 3 is wrong for 7 vs 5
  check(K + ': wrong guess is refused', (txt(K + '-msg') || '').indexOf('不是多 3 个') >= 0);
  click(K + '-guess-0'); // 2
  check(K + ': right guess accepted', (txt(K + '-msg') || '').indexOf('猜对了') >= 0);
  for (let i = 0; i < 5; i++) click(K + '-pair');
  check(K + ': 7 vs 5 pairs out, 2 left over', (txt(K + '-msg') || '').indexOf('配完了') >= 0 && (txt(K + '-msg') || '').indexOf('多 2') >= 0 && hasTier(K, 0));
  click(K + '-level-1'); // 12 vs 8
  click(K + '-guess-0'); // 4
  for (let i = 0; i < 8; i++) click(K + '-pair');
  check(K + ': 12 vs 8 pairs out, 4 left over', (txt(K + '-msg') || '').indexOf('多 4') >= 0 && hasTier(K, 1));
  click(K + '-level-2'); // 15 vs 9
  click(K + '-guess-0'); // 6
  for (let i = 0; i < 9; i++) click(K + '-pair');
  check(K + ': 15 vs 9 pairs out, 6 left over, all tiers done', (txt(K + '-msg') || '').indexOf('多 6') >= 0 && tierCount(K) === 3);
})();

// ---------- (13) op-nine ----------
(function () {
  const K = 'op-nine';
  const host = renderAnim(K);
  check(K + ': title + first question shown', host.innerHTML.indexOf('9 的口诀有规律') >= 0 && host.innerHTML.indexOf('十位上的数') >= 0);
  click(K + '-row-2');
  check(K + ': 9x2 splits into tens 1, ones 8', (txt(K + '-row-read') || '').indexOf('9×2=18') >= 0 && (txt(K + '-row-read') || '').indexOf('十位 1，个位 8') >= 0);
  click(K + '-guess-1'); // tens getting smaller is wrong
  check(K + ': wrong pattern is refused', (txt(K + '-msg') || '').indexOf('不是') >= 0);
  click(K + '-guess-0'); // tens grow by 1
  check(K + ': right pattern accepted', (txt(K + '-msg') || '').indexOf('猜对了') >= 0);
  click(K + '-reveal');
  check(K + ': tens 0,1,2,3 revealed, tier done', (txt(K + '-reveal-tx') || '').indexOf('十位：0、1、2、3') >= 0 && hasTier(K, 0));
  click(K + '-level-1'); // 9x5..9x9, ones shrink
  click(K + '-row-7');
  check(K + ': 9x7 splits into tens 6, ones 3', (txt(K + '-row-read') || '').indexOf('9×7=63') >= 0 && (txt(K + '-row-read') || '').indexOf('6 + 3 = 9') >= 0);
  click(K + '-guess-1'); // ones getting smaller
  click(K + '-reveal');
  check(K + ': ones 5,4,3,2,1 revealed, tier done', (txt(K + '-reveal-tx') || '').indexOf('个位：5、4、3、2、1') >= 0 && hasTier(K, 1));
  click(K + '-level-2'); // digit sums are all 9
  click(K + '-guess-0'); // 9
  click(K + '-reveal');
  check(K + ': every row sums to 9, all tiers done', (txt(K + '-reveal-tx') || '').indexOf('每一行都是 9') >= 0 && tierCount(K) === 3);
})();

// ---------- (14) op-comden ----------
(function () {
  const K = 'op-comden';
  const host = renderAnim(K);
  check(K + ': title + first problem shown', host.innerHTML.indexOf('通分') >= 0 && host.innerHTML.indexOf('1/2 + 1/3') >= 0);
  click(K + '-guess-1'); // 2/5 is the naive wrong answer
  check(K + ': naive guess is refused', (txt(K + '-msg') || '').indexOf('不是 2/5') >= 0);
  click(K + '-guess-0'); // 5/6
  check(K + ': right guess accepted', (txt(K + '-msg') || '').indexOf('猜对了') >= 0);
  click(K + '-cuta-0'); // cut 1/2 into 2
  click(K + '-cutb-0'); // cut 1/3 into 3
  check(K + ': mismatched cuts do not fit', (txt(K + '-msg') || '').indexOf('拼不到一起') >= 0);
  click(K + '-cuta-2'); // cut 1/2 into 6
  click(K + '-cutb-1'); // cut 1/3 into 6
  check(K + ': matching cuts line up', (txt(K + '-msg') || '').indexOf('可以合起来了') >= 0);
  click(K + '-count');
  check(K + ': 1/2+1/3 counts to 5/6, tier done', has(K + '-bars', '5/6') && hasTier(K, 0));
  click(K + '-level-1'); // 3/4-1/2: cut both into 4
  click(K + '-guess-0'); // 1/4
  click(K + '-cuta-0');
  click(K + '-cutb-1');
  click(K + '-count');
  check(K + ': 3/4-1/2 counts to 1/4, tier done', has(K + '-bars', '1/4') && hasTier(K, 1));
  click(K + '-level-2'); // 2/3+1/6: cut both into 6
  click(K + '-guess-0'); // 5/6
  click(K + '-cuta-1');
  click(K + '-cutb-0');
  click(K + '-count');
  check(K + ': 2/3+1/6 counts to 5/6, all tiers done', has(K + '-bars', '5/6') && tierCount(K) === 3);
})();

// ---------- (15) op-decbreak ----------
(function () {
  const K = 'op-decbreak';
  const host = renderAnim(K);
  check(K + ': title + first problem shown', host.innerHTML.indexOf('小数减法') >= 0 && host.innerHTML.indexOf('5.3 − 2.86') >= 0);
  click(K + '-guess-1'); // 2.54 is wrong for 5.3-2.86
  check(K + ': wrong guess is refused', (txt(K + '-msg') || '').indexOf('不是 2.54') >= 0);
  click(K + '-guess-0'); // 2.44
  check(K + ': right guess accepted', (txt(K + '-msg') || '').indexOf('猜对了') >= 0);
  click(K + '-subtract'); // too early: hundredths are short
  check(K + ': subtracting early is refused, hundredths short', (txt(K + '-msg') || '').indexOf('不够减') >= 0);
  click(K + '-smash-tenth');
  check(K + ': smashing a tenth makes 10 hundredths', has(K + '-counts', '0.1 有 2 个') && has(K + '-counts', '0.01 有 10 个'));
  click(K + '-smash-whole');
  check(K + ': smashing a whole makes 12 tenths', has(K + '-counts', '整体 4 个') && has(K + '-counts', '0.1 有 12 个'));
  click(K + '-subtract');
  check(K + ': 5.3-2.86 breaks to 2.44, tier done', (txt(K + '-result') || '').indexOf('5.3 − 2.86 = 2.44') >= 0 && hasTier(K, 0));
  click(K + '-level-1'); // 4.2-1.75
  click(K + '-guess-0'); // 2.45
  click(K + '-smash-tenth');
  click(K + '-smash-whole');
  click(K + '-subtract');
  check(K + ': 4.2-1.75 breaks to 2.45, tier done', (txt(K + '-result') || '').indexOf('4.2 − 1.75 = 2.45') >= 0 && hasTier(K, 1));
  click(K + '-level-2'); // 7.05-3.48: whole first (no tenths to smash), then a tenth
  click(K + '-guess-0'); // 3.57
  click(K + '-smash-tenth'); // no tenths yet: refused with a hint
  check(K + ': smashing a tenth with none is refused', (txt(K + '-msg') || '').indexOf('没有 0.1 可以敲了') >= 0);
  click(K + '-smash-whole');
  click(K + '-smash-tenth');
  click(K + '-subtract');
  check(K + ': 7.05-3.48 breaks to 3.57, all tiers done', (txt(K + '-result') || '').indexOf('7.05 − 3.48 = 3.57') >= 0 && tierCount(K) === 3);
})();

// ---------- wiring: tiers + discovery + markTried for every anim ----------
EXPECTED.forEach(function (e) {
  const t = tiersByKey[e.key];
  check(e.key + ': makeTiers called with 3 labels, persist key = key',
    !!t && Array.isArray(t.labels) && t.labels.length === 3 && t.el !== null);
  check(e.key + ': wireDiscovery called',
    discLog.some(function (d) { return d.key === e.key; }));
  check(e.key + ': markTried called at least once',
    triedLog.indexOf(e.key) >= 0);
});

console.log('\nsmoke-anims-operations: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
