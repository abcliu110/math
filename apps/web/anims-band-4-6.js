/* anims-band-4-6.js：4–6 年级的新动画（注册表）；每加一个动画调一次 registerAnim，格式见 anims-registry.js 的文件头注释；本文件顶层只能调 registerAnim，不能引用 app.js 的标识符。 */
/* 5.3 小数除法 / 6.9 负负得正 / 6.10 百分数（二）：每个动画先猜 → 玩 → 说，三档，写自己的原创实现。 */
registerAnim({
  key: 'm53-scale',
  title: '两数同乘，商不动',
  sub: '除数、被除数同时 ×10、×100，两条条形一起变长，商的刻度不动；只移一个数，马上失衡给你看。',
  grade: 5,
  kind: '模拟',
  points: ['5.3'],
  render: function (el) {
    var K = 'm53-scale';
    var LEVELS = [
      { label: '基础', a: 0.6, b: 0.2, q: 3 },
      { label: '提高', a: 1.2, b: 0.3, q: 4 },
      { label: '挑战', a: 0.75, b: 0.25, q: 3 }
    ];
    var li = 0, mult = 1, guessed = null, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 5 年级 · 小数除法</p>' +
      '<h3>两数同乘，商不动</h3>' +
      '<p>0.6 ÷ 0.2 = 3。两个数同时变大 10 倍、100 倍，商会变吗？两条条形一起变长给你看。</p>' +
      '<p>第 1 步 · 先猜：两个数同时 ×10，商会变吗？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-same" type="button">商不变</button>' +
      '<button class="btn small primary" id="' + K + '-guess-change" type="button">商会变</button></div>' +
      '<p>第 2 步 · 玩一玩：点 ×10、×100，看两条条形一起变长，商动不动。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-m1" type="button">×1</button>' +
      '<button class="btn small ghost" id="' + K + '-m10" type="button">×10</button>' +
      '<button class="btn small ghost" id="' + K + '-m100" type="button">×100</button>' +
      '<button class="btn small ghost" id="' + K + '-only-a" type="button">只移被除数（反例）</button></div>' +
      '<p>被除数：<span id="' + K + '-a-tx"></span></p>' +
      '<div style="border:1px solid #999;height:22px"><div id="' + K + '-a-bar" style="background:#4a90d9;height:22px;width:1%"></div></div>' +
      '<p>除数：<span id="' + K + '-b-tx"></span></p>' +
      '<div style="border:1px solid #999;height:22px"><div id="' + K + '-b-bar" style="background:#e67e22;height:22px;width:1%"></div></div>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点 ×10 试试。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 0.6÷0.2</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 1.2÷0.3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 0.75÷0.25</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“两个数同时乘同一个数，商不变；只乘一个数，商就变了”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function fmt(n) { return String(Math.round(n * 100) / 100); }
    function draw() {
      var L = LEVELS[li];
      var a = L.a * mult, b = L.b * mult;
      var at = gid(K + '-a-tx'); if (at) at.textContent = fmt(L.a) + ' × ' + mult + ' = ' + fmt(a);
      var bt = gid(K + '-b-tx'); if (bt) bt.textContent = fmt(L.b) + ' × ' + mult + ' = ' + fmt(b);
      var ab = gid(K + '-a-bar'); if (ab) ab.style.width = mult + '%';
      var bb = gid(K + '-b-bar'); if (bb) bb.style.width = mult + '%';
      var qt = gid(K + '-q-tx');
      if (qt) qt.textContent = '算式：' + fmt(a) + ' ÷ ' + fmt(b) + ' = ' + L.q + '　商还是 ' + L.q + '，没动！';
    }
    function setMult(m) {
      mult = m;
      draw();
      if (!guessed) { msg('先猜一猜：商会变吗？'); return; }
      if (guessed === 'same') {
        msg('看：两条条形一起变长，商还是 ' + LEVELS[li].q + '，没动！你猜对了。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('再看一遍：两条条形一起变长，商还是 ' + LEVELS[li].q + '。同时变，商是不动的。');
      }
    }
    function onlyA() {
      var L = LEVELS[li];
      var a = L.a * 10, b = L.b;
      var at = gid(K + '-a-tx'); if (at) at.textContent = fmt(L.a) + ' × 10 = ' + fmt(a) + '（只移了被除数）';
      var bt = gid(K + '-b-tx'); if (bt) bt.textContent = fmt(L.b) + '（除数没动）';
      var ab = gid(K + '-a-bar'); if (ab) ab.style.width = '10%';
      var bb = gid(K + '-b-bar'); if (bb) bb.style.width = '1%';
      var qt = gid(K + '-q-tx');
      if (qt) qt.textContent = '算式：' + fmt(a) + ' ÷ ' + fmt(b) + ' = ' + (L.q * 10) + '　商变了！';
      msg('只移一个数，条形立刻失衡：被除数变长了，除数没动，商从 ' + L.q + ' 变成 ' + (L.q * 10) + '。所以一定要两个数同时移。');
    }
    function setLevel(i) {
      li = i; mult = 1; guessed = null;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点 ×10 试试。');
    }
    gid(K + '-guess-same').addEventListener('click', function () { guessed = 'same'; msg('你猜商不变。点 ×10、×100 验证一下。'); });
    gid(K + '-guess-change').addEventListener('click', function () { guessed = 'change'; msg('你猜商会变。点 ×10、×100 验证一下。'); });
    gid(K + '-m1').addEventListener('click', function () { setMult(1); });
    gid(K + '-m10').addEventListener('click', function () { setMult(10); });
    gid(K + '-m100').addEventListener('click', function () { setMult(100); });
    gid(K + '-only-a').addEventListener('click', function () { onlyA(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：0.6÷0.2 商不变', '提高：1.2÷0.3 商不变', '挑战：0.75÷0.25 商不变'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm53-numline',
  title: '数轴分一分',
  sub: '把 0.6 平均分成 2 段，每段 0.3——除法先理解为“分”，再理解为“移小数点”。',
  grade: 5,
  kind: '模拟',
  points: ['5.3'],
  render: function (el) {
    var K = 'm53-numline';
    var LEVELS = [
      { label: '基础', total: 0.6, n: 2, seg: 0.3 },
      { label: '提高', total: 0.9, n: 3, seg: 0.3 },
      { label: '挑战', total: 1.2, n: 4, seg: 0.3 }
    ];
    var li = 0, guessed = null, split = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 5 年级 · 小数除法</p>' +
      '<h3>数轴分一分</h3>' +
      '<p>0.6 ÷ 2 是什么意思？就是把 0.6 平均分成 2 份，每份是多少。先在数轴上分一分，再想竖式。</p>' +
      '<p>第 1 步 · 先猜：把 0.6 平均分成 2 段，每段是多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-03" type="button">0.3</button>' +
      '<button class="btn small primary" id="' + K + '-guess-06" type="button">0.6</button>' +
      '<button class="btn small primary" id="' + K + '-guess-02" type="button">0.2</button></div>' +
      '<p>第 2 步 · 分一分：点一下，数轴上的 0.6 就被平均切开。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-split" type="button">分一分</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“分一分”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 0.6÷2</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 0.9÷3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 1.2÷4</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“除法就是平均分，每段都一样长”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var W = 480, pad = 24, max = 1.2;
      var x = function (v) { return pad + v / max * (W - pad * 2); };
      var s = '<svg width="480" height="90" viewBox="0 0 480 90">' +
        '<line x1="' + pad + '" y1="45" x2="' + (W - pad) + '" y2="45" stroke="#333" stroke-width="2"></line>';
      var marks = [0, 0.3, 0.6, 0.9, 1.2];
      for (var i = 0; i < marks.length; i++) {
        s += '<line x1="' + x(marks[i]) + '" y1="38" x2="' + x(marks[i]) + '" y2="52" stroke="#333" stroke-width="2"></line>' +
          '<text x="' + x(marks[i]) + '" y="70" font-size="13" text-anchor="middle">' + marks[i] + '</text>';
      }
      s += '<rect x="' + x(0) + '" y="28" width="' + (x(L.total) - x(0)) + '" height="10" fill="#cfe3f5"></rect>';
      if (split) {
        for (var j = 0; j < L.n; j++) {
          var x0 = x(j * L.seg), x1 = x((j + 1) * L.seg);
          s += '<rect x="' + x0 + '" y="20" width="' + (x1 - x0) + '" height="26" fill="' + (j % 2 === 0 ? '#4a90d9' : '#7fb3e8') + '" fill-opacity="0.55" stroke="#333"></rect>' +
            '<text x="' + ((x0 + x1) / 2) + '" y="15" font-size="13" text-anchor="middle">' + L.seg + '</text>';
        }
      }
      s += '</svg>';
      var box = gid(K + '-svg'); if (box) box.innerHTML = s;
    }
    function doSplit() {
      if (!guessed) { msg('先猜一猜：每段是多少？'); return; }
      split = true;
      draw();
      var L = LEVELS[li];
      if (guessed === '03') {
        msg('分好了：' + L.total + ' 平均分成 ' + L.n + ' 段，每段都是 ' + L.seg + '。' + L.total + ' ÷ ' + L.n + ' = ' + L.seg + '，你猜对了！');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('分好了：' + L.total + ' 平均分成 ' + L.n + ' 段，每段都是 ' + L.seg + '。再数一遍：' + L.n + ' 个 ' + L.seg + ' 加起来正好是 ' + L.total + '。');
      }
    }
    function setLevel(i) {
      li = i; guessed = null; split = false;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“分一分”。');
    }
    gid(K + '-guess-03').addEventListener('click', function () { guessed = '03'; msg('你猜每段 0.3。点“分一分”验证。'); });
    gid(K + '-guess-06').addEventListener('click', function () { guessed = '06'; msg('你猜每段 0.6。点“分一分”验证。'); });
    gid(K + '-guess-02').addEventListener('click', function () { guessed = '02'; msg('你猜每段 0.2。点“分一分”验证。'); });
    gid(K + '-split').addEventListener('click', function () { doSplit(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：0.6÷2 每段 0.3', '提高：0.9÷3 每段 0.3', '挑战：1.2÷4 每段 0.3'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm53-remainder',
  title: '竖式余数追踪',
  sub: '竖式一直除下去，余数重复出现时自动圈出来并闪烁——循环节就此诞生。',
  grade: 5,
  kind: '实验',
  points: ['5.3'],
  render: function (el) {
    var K = 'm53-remainder';
    var LEVELS = [
      { label: '基础', a: 1, b: 3, q: '0.333…', cycle: '3' },
      { label: '提高', a: 2, b: 3, q: '0.666…', cycle: '6' },
      { label: '挑战', a: 1, b: 6, q: '0.1666…', cycle: '6' }
    ];
    var li = 0, guessed = null, step = 0, tiers = null, rows = [];
    el.innerHTML =
      '<p class="demo-tag">实验 · 5 年级 · 小数除法</p>' +
      '<h3>竖式余数追踪</h3>' +
      '<p>1 ÷ 3，竖式一直除下去，除得尽吗？一步一步往下除，盯住余数——余数一重复，商就跟着重复。</p>' +
      '<p>第 1 步 · 先猜：1 ÷ 3 的商除得尽吗？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-end" type="button">除得尽</button>' +
      '<button class="btn small primary" id="' + K + '-guess-cycle" type="button">除不尽，会循环</button></div>' +
      '<p>第 2 步 · 往下除：每点一次“下一步”，竖式就多除一位。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-next" type="button">下一步</button></div>' +
      '<div id="' + K + '-steps"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再一步一步往下除。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 1÷3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 2÷3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 1÷6</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“余数一重复，商就跟着重复，循环节就诞生了”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function buildRows() {
      var L = LEVELS[li];
      var rem = L.a % L.b, seen = {}, out = [], guard = 0;
      while (guard < 8) {
        guard++;
        if (seen[rem] !== undefined) {
          out.push({ text: '⚠ 余数 ' + rem + ' 又出现了！和第 ' + (seen[rem] + 1) + ' 步的余数一模一样。', repeat: true });
          break;
        }
        seen[rem] = out.length;
        var big = rem * 10, d = Math.floor(big / L.b), nr = big - d * L.b;
        out.push({ text: '第 ' + (out.length + 1) + ' 位：余 ' + rem + '，添 0 得 ' + big + '，' + big + ' ÷ ' + L.b + ' = ' + d + '，余 ' + nr + '。', repeat: false });
        rem = nr;
        if (rem === 0) {
          out.push({ text: '余数是 0，除完了，除得尽。', repeat: false });
          break;
        }
      }
      return out;
    }
    function draw() {
      var box = gid(K + '-steps'); if (!box) return;
      var html = '';
      for (var i = 0; i < step && i < rows.length; i++) {
        html += '<p>' + (rows[i].repeat ? '<b>' + rows[i].text + '</b>' : rows[i].text) + '</p>';
      }
      box.innerHTML = html;
    }
    function nextStep() {
      if (!guessed) { msg('先猜一猜：除得尽吗？'); return; }
      if (step >= rows.length) { msg('已经除到头了。'); return; }
      step++;
      draw();
      var last = rows[step - 1];
      if (last.repeat) {
        var L = LEVELS[li];
        msg('余数重复了！商也要跟着重复——' + L.a + ' ÷ ' + L.b + ' = ' + L.q + '，循环节是 ' + L.cycle + '。' +
          (guessed === 'cycle' ? '你猜对了！' : '所以它除不尽，会一直循环下去。'));
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else if (step >= rows.length) {
        msg('除完了。');
      } else {
        msg('继续往下除，盯住余数。');
      }
    }
    function setLevel(i) {
      li = i; guessed = null; step = 0;
      rows = buildRows();
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再一步一步往下除。');
    }
    gid(K + '-guess-end').addEventListener('click', function () { guessed = 'end'; msg('你猜除得尽。一步一步除下去看看。'); });
    gid(K + '-guess-cycle').addEventListener('click', function () { guessed = 'cycle'; msg('你猜除不尽、会循环。一步一步除下去看看。'); });
    gid(K + '-next').addEventListener('click', function () { nextStep(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：1÷3 循环节 3', '提高：2÷3 循环节 6', '挑战：1÷6 循环节 6'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    rows = buildRows();
    draw();
  }
});
registerAnim({
  key: 'm69-pattern',
  title: '数列规律逼出负负得正',
  sub: '3×(−2)=−6、2×(−2)=−4、1×(−2)=−2、0×(−2)=0 一路走下来，每步 +2，(−1)×(−2) 只能是 +2。',
  grade: 6,
  kind: '实验',
  points: ['6.9'],
  render: function (el) {
    var K = 'm69-pattern';
    var LEVELS = [
      { label: '基础', f: -2, q: '(−1)×(−2)', ans: '+2' },
      { label: '提高', f: -3, q: '(−1)×(−3)', ans: '+3' },
      { label: '挑战', f: -5, q: '(−1)×(−5)', ans: '+5' }
    ];
    var li = 0, guessed = null, shown = 0, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 6 年级 · 负数运算</p>' +
      '<h3>数列规律逼出负负得正</h3>' +
      '<p>固定一个因数是 −2，另一个每次减 1：积每次加 2。规律一路走下来，(−1)×(−2) 只能是 +2——不是规定，是逼出来的。</p>' +
      '<p>第 1 步 · 先猜：(−1)×(−2) 是多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-plus" type="button">+2</button>' +
      '<button class="btn small primary" id="' + K + '-guess-minus" type="button">−2</button>' +
      '<button class="btn small primary" id="' + K + '-guess-zero" type="button">0</button></div>' +
      '<p>第 2 步 · 往下走：每点一次“下一行”，规律就多走一步。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-next" type="button">下一行</button></div>' +
      '<div id="' + K + '-rows"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再一行一行往下走。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · ×(−2)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · ×(−3)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · ×(−5)</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“每步加同一个数，规律走到头，负负只能得正”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function fmt(n) { return n > 0 ? '+' + n : (n < 0 ? '−' + (-n) : '0'); }
    function fn(n) { return n < 0 ? '（−' + (-n) + '）' : String(n); }
    function rowText(n) {
      var L = LEVELS[li];
      return n + ' × ' + fn(L.f) + ' = ' + fmt(n * L.f);
    }
    function draw() {
      var box = gid(K + '-rows'); if (!box) return;
      var html = '';
      var ns = [3, 2, 1, 0, -1];
      for (var i = 0; i < shown && i < ns.length; i++) {
        var last = i === ns.length - 1;
        html += '<p>' + (last ? '<b>' + rowText(ns[i]) + '　← 规律走到这里，只能是这个数</b>' : rowText(ns[i])) + '</p>';
      }
      box.innerHTML = html;
    }
    function nextRow() {
      if (!guessed) { msg('先猜一猜：' + LEVELS[li].q + ' 是多少？'); return; }
      if (shown >= 5) { msg('已经走到头了。'); return; }
      shown++;
      draw();
      var L = LEVELS[li];
      if (shown === 5) {
        var ok = (guessed === 'plus');
        msg('走到头了：' + L.q + ' = ' + L.ans + '。每步 +' + (-L.f) + '，规律不等人——负负得正不是背下来的，是走出来的。' + (ok ? '你猜对了！' : ''));
        if (ok) {
          if (tiers) tiers.done(li);
          if (typeof markTried === 'function') markTried(K);
        }
      } else if (shown >= 2) {
        msg('每步 +' + (-L.f) + '：积一路往上走，继续。');
      } else {
        msg('继续往下走，看积每次变多少。');
      }
    }
    function setLevel(i) {
      li = i; guessed = null; shown = 0;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再一行一行往下走。');
    }
    gid(K + '-guess-plus').addEventListener('click', function () { guessed = 'plus'; msg('你猜是正数。往下走，看看规律怎么说。'); });
    gid(K + '-guess-minus').addEventListener('click', function () { guessed = 'minus'; msg('你猜是负数。往下走，看看规律怎么说。'); });
    gid(K + '-guess-zero').addEventListener('click', function () { guessed = 'zero'; msg('你猜是 0。往下走，看看规律怎么说。'); });
    gid(K + '-next').addEventListener('click', function () { nextRow(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：(−1)×(−2)=+2', '提高：(−1)×(−3)=+3', '挑战：(−1)×(−5)=+5'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm69-flip',
  title: '数轴翻面',
  sub: '乘 −1 就是把箭头翻到数轴对面，翻两次就回来了——所以负乘负是正。',
  grade: 6,
  kind: '模拟',
  points: ['6.9'],
  render: function (el) {
    var K = 'm69-flip';
    var LEVELS = [
      { label: '基础', start: 3, expr: '3 × (−1)', ans: -3 },
      { label: '提高', start: -4, expr: '(−4) × (−1)', ans: 4 },
      { label: '挑战', start: 2, expr: '(−2) × (−3)', ans: 6, twoFlip: true }
    ];
    var li = 0, v = 3, flips = 0, guessed = null, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 负数运算</p>' +
      '<h3>数轴翻面</h3>' +
      '<p>乘 −1，就是把数轴上的箭头翻到对面：3 翻过去是 −3。翻两次呢？翻两次就回来了。</p>' +
      '<p>第 1 步 · 先猜：3 × (−1)，箭头会指到哪？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-neg" type="button">−3</button>' +
      '<button class="btn small primary" id="' + K + '-guess-pos" type="button">+3</button>' +
      '<button class="btn small primary" id="' + K + '-guess-zero" type="button">0</button></div>' +
      '<p>第 2 步 · 翻一翻：每点一次，箭头就翻一次面。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-flip" type="button">×(−1) 翻一次</button>' +
      '<button class="btn small primary" id="' + K + '-times3" type="button">再 ×3</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“翻一次”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 3×(−1)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · (−4)×(−1)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · (−2)×(−3)</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“乘 −1 是翻面，翻两次回来，所以负乘负是正”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var W = 480, pad = 24, cx = W / 2, sc = (W - pad * 2) / 12;
      var x = function (val) { return cx + val * sc; };
      var s = '<svg width="480" height="100" viewBox="0 0 480 100">' +
        '<line x1="' + pad + '" y1="50" x2="' + (W - pad) + '" y2="50" stroke="#333" stroke-width="2"></line>';
      for (var i = -6; i <= 6; i++) {
        s += '<line x1="' + x(i) + '" y1="44" x2="' + x(i) + '" y2="56" stroke="#333" stroke-width="2"></line>' +
          '<text x="' + x(i) + '" y="75" font-size="12" text-anchor="middle">' + i + '</text>';
      }
      var ax = x(v);
      s += '<line x1="' + cx + '" y1="50" x2="' + ax + '" y2="50" stroke="#d43d2a" stroke-width="4"></line>' +
        '<polygon points="' + ax + ',42 ' + ax + ',58 ' + (ax + (v >= 0 ? 12 : -12)) + ',50" fill="#d43d2a"></polygon>' +
        '<text x="' + ax + '" y="30" font-size="14" text-anchor="middle">' + (v > 0 ? '+' + v : (v < 0 ? '−' + (-v) : '0')) + '</text>' +
        '</svg>';
      var box = gid(K + '-svg'); if (box) box.innerHTML = s;
    }
    function doFlip() {
      if (!guessed) { msg('先猜一猜：箭头会指到哪？'); return; }
      v = -v;
      flips++;
      draw();
      var L = LEVELS[li];
      if (L.twoFlip) {
        if (flips === 1) { msg('翻了一次：2 变成 −2。再翻一次，就回来了。'); return; }
        if (flips === 2) { msg('翻了两次：−2 又翻回 +2。两次翻面等于没翻——这就是 (−1)×(−1)=+1。再点“再 ×3”，就是 (−2)×(−3)。'); return; }
        msg('已经翻过两次了。');
        return;
      }
      if (v === L.ans) {
        var ok = (guessed === 'neg' && L.ans < 0) || (guessed === 'pos' && L.ans > 0);
        msg('翻过去了：' + L.expr + ' = ' + (L.ans > 0 ? '+' + L.ans : '−' + (-L.ans)) + '。乘 −1 就是翻到对面。' + (ok ? '你猜对了！' : ''));
        if (ok) {
          if (tiers) tiers.done(li);
          if (typeof markTried === 'function') markTried(K);
        }
      }
    }
    function doTimes3() {
      var L = LEVELS[li];
      if (!L.twoFlip) { msg('这一档不用 ×3，翻一次就够了。'); return; }
      if (flips < 2) { msg('先翻两次：第一次 2 变成 −2，第二次翻回 +2，再 ×3。'); return; }
      v = v * 3;
      draw();
      var ok = (guessed === 'pos');
      msg('(+2) × 3 = +6。所以 (−2)×(−3) = +6：两个负号翻两次，回来还是正的，再乘 3。' + (ok ? '你猜对了方向！' : ''));
      if (tiers) tiers.done(li);
      if (typeof markTried === 'function') markTried(K);
    }
    function setLevel(i) {
      li = i; v = LEVELS[i].start; flips = 0; guessed = null;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“翻一次”。');
    }
    gid(K + '-guess-neg').addEventListener('click', function () { guessed = 'neg'; msg('你猜箭头指到 −3。点“翻一次”验证。'); });
    gid(K + '-guess-pos').addEventListener('click', function () { guessed = 'pos'; msg('你猜箭头还是指正数。点“翻一次”验证。'); });
    gid(K + '-guess-zero').addEventListener('click', function () { guessed = 'zero'; msg('你猜箭头指到 0。点“翻一次”验证。'); });
    gid(K + '-flip').addEventListener('click', function () { doFlip(); });
    gid(K + '-times3').addEventListener('click', function () { doTimes3(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3×(−1)=−3', '提高：(−4)×(−1)=+4', '挑战：(−2)×(−3)=+6'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm69-distrib',
  title: '分配律证明负负得正',
  sub: '(−1)×0=0，把 0 写成 1+(−1) 再分配，(−1)×(−1) 只能是 1——提高档的证明。',
  grade: 6,
  kind: '实验',
  points: ['6.9'],
  render: function (el) {
    var K = 'm69-distrib';
    var LEVELS = [
      { label: '基础', a: -1, b: -1, ans: 1, steps: [
        '(−1) × 0 = 0：任何数乘 0 都是 0。',
        '把 0 写成 1 + (−1)：(−1) × (1 + (−1)) = 0。',
        '分配律展开：(−1) × 1 + (−1) × (−1) = 0。',
        '(−1) × 1 = −1，所以 −1 + (−1) × (−1) = 0。',
        '一个数加 −1 等于 0，这个数只能是 +1：(−1) × (−1) = 1。'
      ] },
      { label: '提高', a: -2, b: -1, ans: 2, steps: [
        '(−2) × 0 = 0：任何数乘 0 都是 0。',
        '把 0 写成 1 + (−1)：(−2) × (1 + (−1)) = 0。',
        '分配律展开：(−2) × 1 + (−2) × (−1) = 0。',
        '(−2) × 1 = −2，所以 −2 + (−2) × (−1) = 0。',
        '一个数加 −2 等于 0，这个数只能是 +2：(−2) × (−1) = 2。'
      ] },
      { label: '挑战', a: -3, b: -4, ans: 12, steps: [
        '先用同样的方法算 (−3) × (−1)：(−3) × 0 = 0，0 = 1 + (−1)，分配后 −3 + (−3) × (−1) = 0，所以 (−3) × (−1) = 3。',
        '(−4) 是 4 个 (−1) 加起来：(−4) = (−1) + (−1) + (−1) + (−1)。',
        '所以 (−3) × (−4) = (−3) × (−1) + (−3) × (−1) + (−3) × (−1) + (−3) × (−1)。',
        '每份都是 3：3 + 3 + 3 + 3 = 12。',
        '所以 (−3) × (−4) = 12：负负得正，再乘个数就行。'
      ] }
    ];
    var li = 0, guessed = null, shown = 0, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 6 年级 · 负数运算</p>' +
      '<h3>分配律证明负负得正</h3>' +
      '<p>不用“规定”，用已经会的分配律推出 (−1)×(−1)=1：从 (−1)×0=0 出发，把 0 写成 1+(−1)。</p>' +
      '<p>第 1 步 · 先猜：(−1)×(−1) 是 1 还是 −1？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-plus" type="button">+1</button>' +
      '<button class="btn small primary" id="' + K + '-guess-minus" type="button">−1</button></div>' +
      '<p>第 2 步 · 一步一步推：每点一次“下一步”，证明就多走一步。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-next" type="button">下一步</button></div>' +
      '<div id="' + K + '-steps"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再一步一步推。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · (−1)×(−1)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · (−2)×(−1)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · (−3)×(−4)</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“分配律逼着负负得正，不这样分配律就坏了”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var box = gid(K + '-steps'); if (!box) return;
      var html = '';
      var steps = LEVELS[li].steps;
      for (var i = 0; i < shown && i < steps.length; i++) {
        html += '<p>' + (i + 1) + '. ' + steps[i] + '</p>';
      }
      box.innerHTML = html;
    }
    function nextStep() {
      if (!guessed) { msg('先猜一猜：是 +1 还是 −1？'); return; }
      var steps = LEVELS[li].steps;
      if (shown >= steps.length) { msg('证明走完了。'); return; }
      shown++;
      draw();
      if (shown >= steps.length) {
        var L = LEVELS[li];
        var fa = L.a < 0 ? '（−' + (-L.a) + '）' : String(L.a);
        var fb = L.b < 0 ? '（−' + (-L.b) + '）' : String(L.b);
        msg('证完了：' + fa + '×' + fb + ' = +' + L.ans + '。如果它是负的，分配律就自相矛盾了。' + (guessed === 'plus' ? '你猜对了！' : ''));
        if (guessed === 'plus') {
          if (tiers) tiers.done(li);
          if (typeof markTried === 'function') markTried(K);
        }
      } else {
        msg('继续往下推。');
      }
    }
    function setLevel(i) {
      li = i; guessed = null; shown = 0;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再一步一步推。');
    }
    gid(K + '-guess-plus').addEventListener('click', function () { guessed = 'plus'; msg('你猜是 +1。一步一步推，看看分配律怎么说。'); });
    gid(K + '-guess-minus').addEventListener('click', function () { guessed = 'minus'; msg('你猜是 −1。一步一步推，看看分配律怎么说。'); });
    gid(K + '-next').addEventListener('click', function () { nextStep(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：(−1)×(−1)=1', '提高：(−2)×(−1)=2', '挑战：(−3)×(−4)=12'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm69-debt',
  title: '拿走欠债就是多钱',
  sub: '欠 2 元又欠 3 元是欠 5 元（加法）；拿走 3 笔 2 元债就是多 6 元（乘法）——两个场景分开算。',
  grade: 6,
  kind: '实验',
  points: ['6.9'],
  render: function (el) {
    var K = 'm69-debt';
    var LEVELS = [
      { label: '基础', n: 2, m: 3, val: 6 },
      { label: '提高', n: 4, m: 2, val: 8 },
      { label: '挑战', n: 2, m: 3, val: 6, compare: true }
    ];
    var li = 0, scene = 'mul', n = 2, m = 3, guessed = null, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 6 年级 · 负数运算</p>' +
      '<h3>拿走欠债就是多钱</h3>' +
      '<p>两个场景，千万别混：<b>欠债合起来</b>是加法，越欠越多；<b>拿走欠债</b>是乘法，拿走多少就多多少钱。</p>' +
      '<p>第 1 步 · 先猜：欠 2 元，又欠 3 元，一共欠几元？先看加法场景，再看乘法场景。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-scene-add" type="button">场景一：欠债合起来（加法）</button>' +
      '<button class="btn small primary" id="' + K + '-scene-mul" type="button">场景二：拿走欠债（乘法）</button></div>' +
      '<p id="' + K + '-scene-tx"></p>' +
      '<p>第 2 步 · 乘法场景：拿走几笔债、每笔几元，就在债上调（＋/− 长在债条上）。</p>' +
      '<p>拿走 <button class="btn small ghost" id="' + K + '-n-minus" type="button">−</button> <span id="' + K + '-n-tx"></span> 笔 <button class="btn small ghost" id="' + K + '-n-plus" type="button">＋</button>　每笔 <button class="btn small ghost" id="' + K + '-m-minus" type="button">−</button> <span id="' + K + '-m-tx"></span> 元 <button class="btn small ghost" id="' + K + '-m-plus" type="button">＋</button></p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-calc" type="button">算一算：拿走这些债，我多多少钱？</button></div>' +
      '<p id="' + K + '-msg">先选一个场景看看。</p>' +
      '<p>挑战档 · 对比题：(−2) + (−3) 和 (−2) × (−3)，哪个是 +6？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-add" type="button">加法是 +6</button>' +
      '<button class="btn small primary" id="' + K + '-guess-mul" type="button">乘法是 +6</button></div>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 拿走 2 笔 3 元债</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 拿走 4 笔 2 元债</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 加法乘法大对比</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“加法是欠的合起来，乘法是拿走欠债变多钱”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var nt = gid(K + '-n-tx'); if (nt) nt.textContent = n + ' 笔';
      var mt = gid(K + '-m-tx'); if (mt) mt.textContent = m + ' 元';
      var st = gid(K + '-scene-tx');
      if (st) {
        st.textContent = scene === 'add'
          ? '场景一（加法）：欠 2 元，又欠 3 元：(−2) + (−3) = −5，一共欠 5 元。欠的合起来还是欠，所以是 −5，绝不是 +5。'
          : '场景二（乘法）：拿走 ' + n + ' 笔 ' + m + ' 元的债。债是负的，拿走也是负的——负的拿走，钱就回来了。';
      }
    }
    function calc() {
      var L = LEVELS[li];
      var got = n * m;
      if (n === L.n && m === L.m) {
        msg('拿走 ' + n + ' 笔 ' + m + ' 元债，就是多了 ' + got + ' 元：(−' + n + ') × (−' + m + ') = +' + got + '。' +
          (L.compare ? '对比加法：(−2) + (−3) = −5，是欠得更多；乘法是拿走，才变 +6。' : ''));
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('拿走 ' + n + ' 笔 ' + m + ' 元债，就是多了 ' + got + ' 元。这一档要的是拿走 ' + L.n + ' 笔 ' + L.m + ' 元债，调一调再算。');
      }
    }
    function setLevel(i) {
      li = i; guessed = null;
      n = LEVELS[i].n; m = LEVELS[i].m;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg(LEVELS[i].compare ? '挑战档：先想一想，(−2)+(−3) 和 (−2)×(−3)，哪个是 +6？' : '调好笔数和每笔的钱，点“算一算”。');
    }
    gid(K + '-scene-add').addEventListener('click', function () { scene = 'add'; draw(); msg('加法场景：(−2) + (−3) = −5。欠的合起来，欠得更多。'); });
    gid(K + '-scene-mul').addEventListener('click', function () { scene = 'mul'; draw(); msg('乘法场景：拿走债，钱就回来了。调一调，算一算。'); });
    gid(K + '-n-minus').addEventListener('click', function () { n = Math.max(1, n - 1); draw(); });
    gid(K + '-n-plus').addEventListener('click', function () { n = Math.min(5, n + 1); draw(); });
    gid(K + '-m-minus').addEventListener('click', function () { m = Math.max(1, m - 1); draw(); });
    gid(K + '-m-plus').addEventListener('click', function () { m = Math.min(5, m + 1); draw(); });
    gid(K + '-calc').addEventListener('click', function () { calc(); });
    gid(K + '-guess-add').addEventListener('click', function () {
      guessed = 'add';
      msg('不对哦：加法是欠的合起来，(−2) + (−3) = −5，是欠得更多。+6 的是乘法：拿走 2 笔 3 元债。');
    });
    gid(K + '-guess-mul').addEventListener('click', function () {
      guessed = 'mul';
      if (li === 2) {
        msg('对了：(−2) × (−3) = +6 是乘法——拿走债；(−2) + (−3) = −5 是加法——欠得更多。两个场景别混。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('对：+6 的是乘法。切到挑战档，再完整对比一次。');
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：拿走 2 笔 3 元债 = +6', '提高：拿走 4 笔 2 元债 = +8', '挑战：加法 −5，乘法 +6'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm610-base',
  title: '百分条先标底数',
  sub: '折扣、税、利息都是“部分 = 比率 × 底数”——先问底数是谁，再算；条上把底数标出来。',
  grade: 6,
  kind: '模拟',
  points: ['6.10'],
  render: function (el) {
    var K = 'm610-base';
    var LEVELS = [
      { label: '基础 · 折扣', scene: '折扣', base: 200, baseName: '标价', rate: 20, rateName: '省 20%', part: 40, rest: 160, restName: '付 160 元', opts: ['标价 200 元', '折扣 20%', '付的钱 160 元'], right: 0 },
      { label: '提高 · 税', scene: '税', base: 500, baseName: '标价', rate: 10, rateName: '税 10%', part: 50, rest: 550, restName: '一共付 550 元', opts: ['标价 500 元', '税率 10%', '一共付的 550 元'], right: 0 },
      { label: '挑战 · 利息', scene: '利息', base: 1000, baseName: '本金', rate: 3, rateName: '利率 3%', part: 30, rest: 1030, restName: '一年后一共 1030 元', opts: ['本金 1000 元', '利率 3%', '一年后的 1030 元'], right: 0 }
    ];
    var li = 0, guessed = null, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 百分数（二）</p>' +
      '<h3>百分条先标底数</h3>' +
      '<p>折扣、税、利息，算的都是“部分 = 比率 × 底数”。最容易错的不是乘法，是底数找错了——先问：底数是谁？</p>' +
      '<p>第 1 步 · 先猜：这道题的底数是谁？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 标出底数：点一下，整条底数亮起来，部分是多少一目了然。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-show" type="button">标出底数，算一算</button></div>' +
      '<p>底数：<span id="' + K + '-base-tx"></span></p>' +
      '<div style="border:1px solid #999;height:26px"><div id="' + K + '-part-bar" style="background:#4a90d9;height:26px;width:0%"></div></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜：底数是谁？</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 折扣</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 税</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 利息</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“先找底数，再算部分；底数找错，数全错”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-guess-' + i);
        if (b) b.textContent = L.opts[i];
      }
      var bt = gid(K + '-base-tx'); if (bt) bt.textContent = '？（先猜，再标出来）';
      var bar = gid(K + '-part-bar'); if (bar) bar.style.width = '0%';
      var ct = gid(K + '-calc-tx'); if (ct) ct.textContent = '';
    }
    function show() {
      if (guessed === null) { msg('先猜一猜：底数是谁？'); return; }
      var L = LEVELS[li];
      var bt = gid(K + '-base-tx');
      if (bt) bt.textContent = L.baseName + ' ' + L.base + ' 元（整条就是它）';
      var bar = gid(K + '-part-bar'); if (bar) bar.style.width = L.rate + '%';
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = L.rateName + '：' + L.base + ' × ' + L.rate + '% = ' + L.part + ' 元；' + L.restName + '。';
      if (guessed === L.right) {
        msg('底数找对了：' + L.baseName + ' ' + L.base + ' 元就是底数，' + L.rateName + '是它的一部分。先找底数，再算，永远不错。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('底数不是 ' + L.opts[guessed] + '，是' + L.baseName + ' ' + L.base + ' 元。比率是乘在底数上的，底数找错，数全错。');
      }
    }
    function setLevel(i) {
      li = i; guessed = null;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜：底数是谁？');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜底数是：' + LEVELS[li].opts[0] + '。点“标出底数”验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜底数是：' + LEVELS[li].opts[1] + '。点“标出底数”验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜底数是：' + LEVELS[li].opts[2] + '。点“标出底数”验证。'); });
    gid(K + '-show').addEventListener('click', function () { show(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：折扣底数是标价', '提高：税的底数是标价', '挑战：利息底数是本金'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm610-discount',
  title: '折扣是付标价的百分之几',
  sub: '八折是付标价的 80%，不是付 20%——先算“付几成”，再乘。',
  grade: 6,
  kind: '模拟',
  points: ['6.10'],
  render: function (el) {
    var K = 'm610-discount';
    var LEVELS = [
      { label: '基础', price: 100, off: '八折', payRate: 80, pay: 80, save: 20 },
      { label: '提高', price: 250, off: '七五折', payRate: 75, pay: 187.5, save: 62.5 },
      { label: '挑战', price: 480, off: '六折', payRate: 60, pay: 288, save: 192 }
    ];
    var li = 0, guessed = null, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 百分数（二）</p>' +
      '<h3>折扣是付标价的百分之几</h3>' +
      '<p>“八折”最容易错的地方：八折不是付 20%，是付标价的 80%，省下 20%。先算付几成，再乘。</p>' +
      '<p>第 1 步 · 先猜：标价 100 元的东西打八折，要付多少钱？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-80" type="button">付 80 元</button>' +
      '<button class="btn small primary" id="' + K + '-guess-20" type="button">付 20 元</button></div>' +
      '<p>第 2 步 · 算一算：条上蓝色是要付的，浅色是省下的。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-calc" type="button">算一算</button></div>' +
      '<p>标价：<span id="' + K + '-price-tx"></span></p>' +
      '<div style="border:1px solid #999;height:26px"><div id="' + K + '-pay-bar" style="background:#4a90d9;height:26px;width:0%"></div></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“算一算”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 100 元八折</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 250 元七五折</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 480 元六折</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“几折就是付标价的百分之几十，剩下的才是省的”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function fmt(n) { return String(Math.round(n * 100) / 100); }
    function draw() {
      var L = LEVELS[li];
      var pt = gid(K + '-price-tx'); if (pt) pt.textContent = L.price + ' 元，打' + L.off;
      var bar = gid(K + '-pay-bar'); if (bar) bar.style.width = '0%';
      var ct = gid(K + '-calc-tx'); if (ct) ct.textContent = '';
    }
    function calc() {
      if (!guessed) { msg('先猜一猜：要付多少钱？'); return; }
      var L = LEVELS[li];
      var bar = gid(K + '-pay-bar'); if (bar) bar.style.width = L.payRate + '%';
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = L.off + '就是付标价的 ' + L.payRate + '%：' + L.price + ' × ' + L.payRate + '% = ' + fmt(L.pay) + ' 元，省下 ' + fmt(L.save) + ' 元。';
      if (guessed === '80') {
        msg(L.off + '是付 ' + L.payRate + '%，不是付 ' + (100 - L.payRate) + '%：要付 ' + fmt(L.pay) + ' 元，省 ' + fmt(L.save) + ' 元。你猜对了！');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('付 20 元就错啦：' + L.off + '是付标价的 ' + L.payRate + '%，要付 ' + fmt(L.pay) + ' 元；省下的才是 ' + fmt(L.save) + ' 元。');
      }
    }
    function setLevel(i) {
      li = i; guessed = null;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“算一算”。');
    }
    gid(K + '-guess-80').addEventListener('click', function () { guessed = '80'; msg('你猜付 80 元。点“算一算”验证。'); });
    gid(K + '-guess-20').addEventListener('click', function () { guessed = '20'; msg('你猜付 20 元。点“算一算”验证。'); });
    gid(K + '-calc').addEventListener('click', function () { calc(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：100 元八折付 80', '提高：250 元七五折付 187.5', '挑战：480 元六折付 288'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm610-interest',
  title: '利息一年一份',
  sub: '利息一年产生一份，存几年就乘几——本金、利率、时间三根条联动。',
  grade: 6,
  kind: '模拟',
  points: ['6.10'],
  render: function (el) {
    var K = 'm610-interest';
    var LEVELS = [
      { label: '基础', p: 1000, r: 3, t: 1, total: 30 },
      { label: '提高', p: 2000, r: 4, t: 2, total: 160 },
      { label: '挑战', p: 5000, r: 2, t: 3, total: 300 }
    ];
    var li = 0, p = 1000, r = 3, t = 1, guessed = null, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 百分数（二）</p>' +
      '<h3>利息一年一份</h3>' +
      '<p>利息 = 本金 × 利率 × 时间。利息一年产生一份：时间滑杆每加一年，就多一根利息条。</p>' +
      '<p>第 1 步 · 先猜：时间翻倍，利息会怎样？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-double" type="button">也翻倍</button>' +
      '<button class="btn small primary" id="' + K + '-guess-same" type="button">不变</button>' +
      '<button class="btn small primary" id="' + K + '-guess-half" type="button">变一半</button></div>' +
      '<p>第 2 步 · 调一调：本金、利率、时间都长在条上，调了马上重算。</p>' +
      '<p>本金 <button class="btn small ghost" id="' + K + '-p-minus" type="button">−</button> <span id="' + K + '-p-tx"></span> <button class="btn small ghost" id="' + K + '-p-plus" type="button">＋</button>（每次 ±500 元）</p>' +
      '<p>利率 <button class="btn small ghost" id="' + K + '-r-minus" type="button">−</button> <span id="' + K + '-r-tx"></span> <button class="btn small ghost" id="' + K + '-r-plus" type="button">＋</button>（每次 ±1%）</p>' +
      '<p>时间 <input type="range" id="' + K + '-t-range" min="1" max="5" step="1" value="1"> <span id="' + K + '-t-tx"></span></p>' +
      '<div id="' + K + '-bars"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-check" type="button">对一下这一档</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再调一调。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 1000 元 3% 1 年</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 2000 元 4% 2 年</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 5000 元 2% 3 年</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“利息一年一份，时间翻倍利息也翻倍”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function yearly() { return Math.round(p * r / 100 * 100) / 100; }
    function total() { return Math.round(p * r / 100 * t * 100) / 100; }
    function draw() {
      var pt = gid(K + '-p-tx'); if (pt) pt.textContent = p + ' 元';
      var rt = gid(K + '-r-tx'); if (rt) rt.textContent = r + '%';
      var tt = gid(K + '-t-tx'); if (tt) tt.textContent = t + ' 年';
      var rg = gid(K + '-t-range'); if (rg) rg.value = String(t);
      var box = gid(K + '-bars');
      if (box) {
        var html = '';
        for (var i = 0; i < t; i++) {
          html += '<p>第 ' + (i + 1) + ' 年利息：' + yearly() + ' 元</p>';
        }
        box.innerHTML = html;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = '利息 = ' + p + ' × ' + r + '% × ' + t + ' = ' + total() + ' 元。';
    }
    function checkLevel() {
      if (!guessed) { msg('先猜一猜：时间翻倍，利息会怎样？'); return; }
      var L = LEVELS[li];
      if (p === L.p && r === L.r && t === L.t) {
        msg('对上了：' + L.p + ' × ' + L.r + '% × ' + L.t + ' = ' + L.total + ' 元，一年 ' + yearly() + ' 元，' + L.t + ' 年就是 ' + L.t + ' 份。' + (guessed === 'double' ? '时间翻倍，利息也翻倍，你猜对了！' : ''));
        if (guessed === 'double') {
          if (tiers) tiers.done(li);
          if (typeof markTried === 'function') markTried(K);
        }
      } else {
        msg('现在是 ' + p + ' 元、' + r + '%、' + t + ' 年，利息 ' + total() + ' 元。这一档要的是 ' + L.p + ' 元、' + L.r + '%、' + L.t + ' 年，调一调再对。');
      }
    }
    function setLevel(i) {
      li = i; guessed = null;
      p = LEVELS[i].p; r = LEVELS[i].r; t = LEVELS[i].t;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再调一调。');
    }
    gid(K + '-guess-double').addEventListener('click', function () { guessed = 'double'; msg('你猜时间翻倍，利息也翻倍。调一调时间滑杆验证。'); });
    gid(K + '-guess-same').addEventListener('click', function () { guessed = 'same'; msg('你猜利息不变。调一调时间滑杆验证。'); });
    gid(K + '-guess-half').addEventListener('click', function () { guessed = 'half'; msg('你猜利息变一半。调一调时间滑杆验证。'); });
    gid(K + '-p-minus').addEventListener('click', function () { p = Math.max(500, p - 500); draw(); });
    gid(K + '-p-plus').addEventListener('click', function () { p = Math.min(5000, p + 500); draw(); });
    gid(K + '-r-minus').addEventListener('click', function () { r = Math.max(1, r - 1); draw(); });
    gid(K + '-r-plus').addEventListener('click', function () { r = Math.min(6, r + 1); draw(); });
    gid(K + '-t-range').addEventListener('input', function () { t = parseInt(gid(K + '-t-range').value, 10) || 1; draw(); });
    gid(K + '-t-range').addEventListener('change', function () { t = parseInt(gid(K + '-t-range').value, 10) || 1; draw(); });
    gid(K + '-check').addEventListener('click', function () { checkLevel(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：1000 元 3% 1 年利息 30', '提高：2000 元 4% 2 年利息 160', '挑战：5000 元 2% 3 年利息 300'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm610-cheng',
  title: '成数就是十分之几',
  sub: '三成就是 30%，成数是“每十里有几”的另一种说法——成数、百分数、小数互相翻译。',
  grade: 6,
  kind: '演示',
  points: ['6.10'],
  render: function (el) {
    var K = 'm610-cheng';
    var LEVELS = [
      { label: '基础', cheng: '三成', n: 3, pct: 30, dec: '0.3' },
      { label: '提高', cheng: '七成五', n: 7.5, pct: 75, dec: '0.75' },
      { label: '挑战', cheng: '四成五', n: 4.5, pct: 45, dec: '0.45', reverse: true }
    ];
    var li = 0, guessed = null, shown = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 6 年级 · 百分数（二）</p>' +
      '<h3>成数就是十分之几</h3>' +
      '<p>“三成”不是 3%，是 30%：成数是“每十里有几”——三成就是十里有三。看十格条，涂几格就是几成。</p>' +
      '<p>第 1 步 · 先猜：三成是 30% 还是 3%？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-30" type="button">30%</button>' +
      '<button class="btn small primary" id="' + K + '-guess-3" type="button">3%</button></div>' +
      '<p>第 2 步 · 看十格条：点一下，十格里涂上几成。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-show" type="button">涂一涂，看翻译</button></div>' +
      '<div id="' + K + '-grid"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“涂一涂”。</p>' +
      '<p>挑战档 · 反过来：45% 是几成？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-45a" type="button">四成</button>' +
      '<button class="btn small primary" id="' + K + '-guess-45b" type="button">四成五</button>' +
      '<button class="btn small primary" id="' + K + '-guess-45c" type="button">五成</button></div>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 三成</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 七成五</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 45% 是几成</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“成数就是十分之几，几成就是百分之几十”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var box = gid(K + '-grid');
      if (box) {
        if (!shown) { box.innerHTML = '<p>十格条：□□□□□□□□□□（还没涂）</p>'; return; }
        var full = Math.floor(L.n), half = (L.n - full) >= 0.5;
        var s = '';
        for (var i = 0; i < 10; i++) {
          if (i < full) s += '■';
          else if (i === full && half) s += '◧';
          else s += '□';
        }
        box.innerHTML = '<p>十格条：' + s + '　涂了 ' + L.n + ' 格，就是 ' + L.cheng + '。</p>';
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = shown ? (L.cheng + ' = ' + L.pct + '% = ' + L.dec + ' = ' + L.n + '/10。') : '';
    }
    function show() {
      if (!guessed) { msg('先猜一猜：三成是 30% 还是 3%？'); return; }
      shown = true;
      draw();
      var L = LEVELS[li];
      if (guessed === '30') {
        msg(L.cheng + '就是 ' + L.pct + '%：十格里涂 ' + L.n + ' 格，每十里有 ' + L.n + '，所以是 ' + L.pct + '%。你猜对了！');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('不是 3%：三成是十里有三，就是 ' + L.pct + '%。3% 是百分之三，那是“三分”，不是“三成”。');
      }
    }
    function setLevel(i) {
      li = i; guessed = null; shown = false;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg(LEVELS[i].reverse ? '挑战档：45% 是几成？先猜，再点“涂一涂”看十格条。' : '先猜一猜，再点“涂一涂”。');
    }
    gid(K + '-guess-30').addEventListener('click', function () { guessed = '30'; msg('你猜三成是 30%。点“涂一涂”验证。'); });
    gid(K + '-guess-3').addEventListener('click', function () { guessed = '3'; msg('你猜三成是 3%。点“涂一涂”验证。'); });
    gid(K + '-show').addEventListener('click', function () { show(); });
    gid(K + '-guess-45a').addEventListener('click', function () {
      if (li !== 2) { msg('这是挑战档的题，先切到挑战档。'); return; }
      msg('四成是 40%，不是 45%。45% 是四成五：十格里涂四格半。');
    });
    gid(K + '-guess-45b').addEventListener('click', function () {
      if (li !== 2) { msg('这是挑战档的题，先切到挑战档。'); return; }
      guessed = '30';
      msg('对了：45% = 四成五。十格里涂四格半，就是 45%。');
      if (tiers) tiers.done(li);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-guess-45c').addEventListener('click', function () {
      if (li !== 2) { msg('这是挑战档的题，先切到挑战档。'); return; }
      msg('五成是 50%，不是 45%。45% 是四成五。');
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：三成 = 30%', '提高：七成五 = 75%', '挑战：45% = 四成五'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
