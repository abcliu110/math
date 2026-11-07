/* anims-band-4-6.js：4–6 年级的新动画（注册表）；每加一个动画调一次 registerAnim，格式见 anims-registry.js 的文件头注释；本文件顶层只能调 registerAnim，不能引用 app.js 的标识符。 */
/* 5.3 小数除法 / 6.9 负负得正 / 6.10 百分数（二）：每个动画先猜 → 玩 → 说，三档，写自己的原创实现。 */
/* 4.1–4.8：与已有演示实质相同的方法跳过（见各段注释），只做真正新的方法，同样先猜 → 玩 → 说，三档。 */
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
      shown = true;
      draw();
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
/* 4.1 大数的认识：跳过万分组数位表与数轴半点法（已有 bignum），只做捆绑换算与先估后算。 */
registerAnim({
  key: 'm41-bundle',
  title: '十个一捆，打包进位',
  sub: '10 个一千捆成 1 个万，10 个一万捆成 1 个十万——进率 10 就是“打包”规则。',
  grade: 4,
  kind: '演示',
  points: ['4.1'],
  render: function (el) {
    var K = 'm41-bundle';
    var LEVELS = [
      { label: '基础', small: '一千', smallN: 1000, big: '一万', bigN: 10000, opts: ['1 个万', '10 个万', '1 个千'], ans: 0 },
      { label: '提高', small: '一万', smallN: 10000, big: '十万', bigN: 100000, opts: ['1 个十万', '10 个十万', '1 个万'], ans: 0 },
      { label: '挑战', small: '十万', smallN: 100000, big: '一百万', bigN: 1000000, opts: ['1 个百万', '10 个百万', '1 个十万'], ans: 0 }
    ];
    var li = 0, guessed = -1, packed = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 4 年级 · 大数的认识</p>' +
      '<h3>十个一捆，打包进位</h3>' +
      '<p>桌上有 10 块，每块是 1000。10 块捆成一捆，是多少？捆一捆就知道：进率 10 就是打包规则。</p>' +
      '<p>第 1 步 · 先猜：10 块拼成什么？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“打包”，看 10 块怎么变成 1 捆。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-pack" type="button">打包</button></div>' +
      '<div id="' + K + '-grid"></div>' +
      '<p id="' + K + '-eq-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“打包”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 10 个一千</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 10 个一万</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 10 个十万</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“10 个一千是 1 个万，10 个一万是 1 个十万，10 个十万是 1 个百万”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var box = gid(K + '-grid');
      if (box) {
        if (!packed) {
          var s = '';
          for (var i = 0; i < 10; i++) s += '□';
          box.innerHTML = '<p>10 块，每块是 ' + L.small + '：' + s + '</p>';
        } else {
          box.innerHTML = '<p>捆好了：▣ 1 捆，就是 1 个' + L.big + '。</p>';
        }
      }
      var et = gid(K + '-eq-tx');
      if (et) et.textContent = packed ? ('10 × ' + L.smallN + ' = ' + L.bigN + ' = 1 个' + L.big + '。') : '';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg(i === LEVELS[li].ans ? '你猜 10 个' + LEVELS[li].small + '是 1 个' + LEVELS[li].big + '。点“打包”验证。' : '你猜的是 ' + LEVELS[li].opts[i] + '。点“打包”看看真是多少。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-pack').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：10 个' + LEVELS[li].small + '拼成什么？'); return; }
      packed = true;
      draw();
      var L = LEVELS[li];
      if (guessed === L.ans) {
        msg('对了：10 × ' + L.smallN + ' = ' + L.bigN + '，就是 1 个' + L.big + '。每满 10 个就打包成 1 个更大的单位。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('看：10 个' + L.small + '捆成 1 捆，是 1 个' + L.big + '，不是 ' + L.opts[guessed] + '。满 10 才进 1 位。');
      }
    });
    function setLevel(i) {
      li = i; guessed = -1; packed = false;
      draw();
      msg('先猜一猜，再点“打包”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：10 个一千 = 1 个万', '提高：10 个一万 = 1 个十万', '挑战：10 个十万 = 1 个百万'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
registerAnim({
  key: 'm41-estimate',
  title: '先估后算',
  sub: '先说“大约是几万”，再精确算、再对照：估算是验算，不是瞎猜。',
  grade: 4,
  kind: '模拟',
  points: ['4.1'],
  render: function (el) {
    var K = 'm41-estimate';
    var LEVELS = [
      { label: '基础', n: 38642, thou: 8, ans: '4万', opts: ['约 3万', '约 4万', '约 5万'], ansIdx: 1, why: '千位是 8，满 5 进 1' },
      { label: '提高', n: 71209, thou: 1, ans: '7万', opts: ['约 6万', '约 7万', '约 8万'], ansIdx: 1, why: '千位是 1，不到 5，舍掉' },
      { label: '挑战', n: 95600, thou: 5, ans: '10万', opts: ['约 9万', '约 10万', '约 11万'], ansIdx: 1, why: '千位是 5，正好满 5 进 1，9 万进成 10 万' }
    ];
    var li = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 4 年级 · 大数的认识</p>' +
      '<h3>先估后算</h3>' +
      '<p>看到一个大数，先别急着算：先说它“大约是几万”，再精确算一遍，对一对你的估计准不准。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：它大约是几万？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“精确算一算”，看千位、再对照你的估计。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-calc" type="button">精确算一算</button></div>' +
      '<p id="' + K + '-work-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“精确算一算”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 38642</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 71209</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 95600</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“先估大约几万，再看千位满不满 5，对照估计”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = '这个数是 ' + L.n + '，大约是几万？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var w = gid(K + '-work-tx'); if (w) w.textContent = '';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你估的是 ' + LEVELS[li].opts[i] + '。点“精确算一算”，对照一下。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-calc').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：大约是几万？'); return; }
      var L = LEVELS[li];
      var w = gid(K + '-work-tx');
      if (w) w.textContent = L.n + '：千位是 ' + L.thou + '，' + L.why + '，约是 ' + L.ans + '。';
      if (guessed === L.ansIdx) {
        msg('你估对了：' + L.n + ' 约是 ' + L.ans + '。先估再算，估计和精确算对上了。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('精确算是约 ' + L.ans + '，你估的是 ' + L.opts[guessed] + '。再看一遍千位：是 ' + L.thou + '，' + L.why + '。');
      }
    });
    function setLevel(i) {
      li = i; guessed = -1;
      draw();
      msg('先猜一猜，再点“精确算一算”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：38642 约 4万', '提高：71209 约 7万', '挑战：95600 约 10万'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
/* 4.2 公顷和平方千米：跳过操场基准法（已有 field 足球场叠加），做边长平方、单位阶梯、真实地名比较。 */
registerAnim({
  key: 'm42-side',
  title: '边长平方推导法',
  sub: '边长 100 米的正方形，面积是 100×100 平方米——面积进率是边长进率的平方。',
  grade: 4,
  kind: '演示',
  points: ['4.2'],
  render: function (el) {
    var K = 'm42-side';
    var LEVELS = [
      { label: '基础', side: 100, area: 10000, conv: '10000 平方米 = 1 公顷', opts: ['1000 平方米', '10000 平方米', '100000 平方米'], ansIdx: 1 },
      { label: '提高', side: 1000, area: 1000000, conv: '1000000 平方米 = 100 公顷 = 1 平方千米', opts: ['100000 平方米', '1000000 平方米', '10000000 平方米'], ansIdx: 1 },
      { label: '挑战', side: 10, area: 100, conv: '100 平方米还不到 1 公顷，差 100 倍', opts: ['10 平方米', '100 平方米', '1000 平方米'], ansIdx: 1 }
    ];
    var li = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 4 年级 · 公顷和平方千米</p>' +
      '<h3>边长平方推导法</h3>' +
      '<p>一块正方形的地，边长知道，面积怎么算？边长乘边长。边长变 10 倍，面积变 100 倍——因为两条边都变了。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：面积是几平方米？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“算面积”，看正方形和算式。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-calc" type="button">算面积</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-eq-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“算面积”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 边长 100 米</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 边长 1000 米</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 边长 10 米</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“边长 100 米是 1 公顷，边长 1000 米是 1 平方千米”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = '一块正方形的地，边长 ' + L.side + ' 米，面积是几平方米？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var s = gid(K + '-svg'); if (s) s.innerHTML = '';
      var e = gid(K + '-eq-tx'); if (e) e.textContent = '';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜面积是 ' + LEVELS[li].opts[i] + '。点“算面积”验证。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-calc').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：面积是几平方米？'); return; }
      var L = LEVELS[li];
      var s = gid(K + '-svg');
      if (s) s.innerHTML = '<svg width="300" height="210" viewBox="0 0 300 210"><rect x="70" y="25" width="160" height="160" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/><text x="150" y="18" text-anchor="middle">边长 ' + L.side + ' 米</text><text x="150" y="110" text-anchor="middle">面积 ' + L.area + ' 平方米</text></svg>';
      var e = gid(K + '-eq-tx');
      if (e) e.textContent = L.side + ' × ' + L.side + ' = ' + L.area + '（平方米）。' + L.conv + '。';
      if (guessed === L.ansIdx) {
        msg('对了：边长乘边长，' + L.side + ' × ' + L.side + ' = ' + L.area + ' 平方米。' + L.conv + '。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('面积是 ' + L.side + ' × ' + L.side + ' = ' + L.area + ' 平方米，不是 ' + L.opts[guessed] + '。边长进率是 10，面积进率是 10 × 10 = 100。');
      }
    });
    function setLevel(i) {
      li = i; guessed = -1;
      draw();
      msg('先猜一猜，再点“算面积”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：100×100 = 1 公顷', '提高：1000×1000 = 1 平方千米', '挑战：10×10 = 100 平方米'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
registerAnim({
  key: 'm42-ladder',
  title: '单位阶梯换算法',
  sub: '平方厘米爬到平方千米，每上一级 ×100（最后一级 ×10000）：进率是“小单位在大单位里装几个”。',
  grade: 4,
  kind: '模拟',
  points: ['4.2'],
  render: function (el) {
    var K = 'm42-ladder';
    var RUNGS = ['平方厘米', '平方分米', '平方米', '公顷', '平方千米'];
    var UP = [100, 100, 10000, 100];
    var LEVELS = [
      { label: '基础', startIdx: 3, targetIdx: 2, val: 3, opts: ['300 平方米', '3000 平方米', '30000 平方米'], ansIdx: 2, q: '3 公顷 = 几平方米？' },
      { label: '提高', startIdx: 4, targetIdx: 3, val: 5, opts: ['50 公顷', '500 公顷', '5000 公顷'], ansIdx: 1, q: '5 平方千米 = 几公顷？' },
      { label: '挑战', startIdx: 2, targetIdx: 3, val: 120000, opts: ['120 公顷', '12 公顷', '1.2 公顷'], ansIdx: 1, q: '120000 平方米 = 几公顷？' }
    ];
    var li = 0, guessed = -1, pos = 3, val = 3, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 4 年级 · 公顷和平方千米</p>' +
      '<h3>单位阶梯换算法</h3>' +
      '<p>面积单位排成一级一级的阶梯：往下爬一级，数 ×100；往上爬一级，数 ÷100。公顷到平方米那一级特殊：×10000。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：换算结果是多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“爬一格”，一级一级爬过去。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-climb" type="button">爬一格</button></div>' +
      '<div id="' + K + '-ladder"></div>' +
      '<p id="' + K + '-val-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“爬一格”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 3 公顷</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 5 平方千米</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 120000 平方米</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“往下爬 ×100，往上爬 ÷100，公顷到平方米 ×10000”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.q;
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var lad = gid(K + '-ladder');
      if (lad) {
        var s = '';
        for (var i = 4; i >= 0; i--) {
          s += '<p>' + (i === pos ? '● ' : '○ ') + RUNGS[i] + '</p>';
        }
        lad.innerHTML = s;
      }
      var v = gid(K + '-val-tx');
      if (v) v.textContent = '现在在' + RUNGS[pos] + '这一级：' + val + ' ' + RUNGS[pos] + '。';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜是 ' + LEVELS[li].opts[i] + '。点“爬一格”，一级一级爬过去验证。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-climb').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再点“爬一格”。'); return; }
      var L = LEVELS[li];
      if (pos === L.targetIdx) { msg('已经爬到了：' + val + ' ' + RUNGS[pos] + '。'); return; }
      if (pos > L.targetIdx) {
        val = val * UP[pos - 1];
        pos--;
        msg('往下爬一级，数 ×' + UP[pos] + '：现在是 ' + val + ' ' + RUNGS[pos] + '。');
      } else {
        val = val / UP[pos];
        pos++;
        msg('往上爬一级，数 ÷' + UP[pos - 1] + '：现在是 ' + val + ' ' + RUNGS[pos] + '。');
      }
      draw();
      if (pos === L.targetIdx) {
        if (guessed === L.ansIdx) {
          msg('爬到了：' + L.opts[L.ansIdx] + '。你猜对了！');
          if (tiers) tiers.done(li);
          if (typeof markTried === 'function') markTried(K);
        } else {
          msg('爬到了：答案是 ' + L.opts[L.ansIdx] + '，你猜的是 ' + L.opts[guessed] + '。再数一遍爬了几级、每级乘几。');
        }
      }
    });
    function setLevel(i) {
      li = i; guessed = -1;
      pos = LEVELS[i].startIdx; val = LEVELS[i].val;
      draw();
      msg('先猜一猜，再点“爬一格”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3 公顷 = 30000 平方米', '提高：5 平方千米 = 500 公顷', '挑战：120000 平方米 = 12 公顷'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
registerAnim({
  key: 'm42-place',
  title: '真实地名选单位',
  sub: '足球场用平方米，颐和园用公顷，北京市用平方千米——选错单位，数字会荒谬到没法念。',
  grade: 4,
  kind: '实验',
  points: ['4.2'],
  render: function (el) {
    var K = 'm42-place';
    var LEVELS = [
      { label: '基础', place: '标准足球场', area: '约 7140 平方米', ansIdx: 0, wrong: '用公顷说是 0.714 公顷，用平方千米说是 0.00714 平方千米——小数点后一串 0，谁听得懂？' },
      { label: '提高', place: '颐和园', area: '约 290 公顷', ansIdx: 1, wrong: '用平方米说是 2900000 平方米，数太长了；用平方千米说是 2.9 平方千米，也能说，但公园一般用公顷。' },
      { label: '挑战', place: '北京市', area: '约 16410 平方千米', ansIdx: 2, wrong: '用平方米说是 16410000000 平方米——11 位数，谁记得住？' }
    ];
    var OPTS = ['平方米', '公顷', '平方千米'];
    var li = 0, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 4 年级 · 公顷和平方千米</p>' +
      '<h3>真实地名选单位</h3>' +
      '<p>给一个真实地方的面积，选一个最顺口的单位。选错了，数字会变得荒谬——荒谬本身就是答案。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：这个地方用哪个单位最合适？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button">平方米</button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button">公顷</button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button">平方千米</button></div>' +
      '<p id="' + K + '-msg">先猜一猜：哪个单位最合适？</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 足球场</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 颐和园</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 北京市</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“小地方用平方米，大公园用公顷，城市用平方千米”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.place + '的面积是 ' + L.area + '，用哪个单位说最合适？';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      var L = LEVELS[li];
      if (i === L.ansIdx) {
        msg('对了：' + L.place + '用' + OPTS[i] + '最合适（' + L.area + '）。数字不大不小，正好顺口。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('用' + OPTS[i] + '说' + L.place + '不太合适：' + L.wrong);
      }
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    function setLevel(i) {
      li = i;
      draw();
      msg('先猜一猜：哪个单位最合适？');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：足球场用平方米', '提高：颐和园用公顷', '挑战：北京市用平方千米'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
/* 4.3 角的度量：跳过转臂法、量角器实操、臂长证伪（已有 protractor），只做圆量角器/360° 法。 */
registerAnim({
  key: 'm43-circle',
  title: '角是圆的一部分',
  sub: '90° 是 1/4 个圆，180° 是半个圆，270° 是 3/4 个圆——先看角占了圆的几分之几，再落到量角器上。',
  grade: 4,
  kind: '演示',
  points: ['4.3'],
  render: function (el) {
    var K = 'm43-circle';
    var LEVELS = [
      { label: '基础', deg: 90, frac: '1/4', opts: ['1/2', '1/4', '1/8'], ansIdx: 1, note: '90° 是 360° 的 1/4：一个圆切成 4 份，90° 就是其中 1 份。' },
      { label: '提高', deg: 180, frac: '1/2', opts: ['1/4', '1/2', '3/4'], ansIdx: 1, note: '180° 是半个圆：半圆量角器正好能从 0 量到 180°，所以 180° 是量角器的顶。' },
      { label: '挑战', deg: 270, frac: '3/4', opts: ['1/2', '2/3', '3/4'], ansIdx: 2, note: '270° 是 3/4 个圆，半圆量角器量不出来：先量出剩下的补角 90°，再用 360° 减 90° 等于 270°。' }
    ];
    var li = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 4 年级 · 角的度量</p>' +
      '<h3>角是圆的一部分</h3>' +
      '<p>角转一整圈是 360°，就是一个圆。角是几度，就先问它占了圆的几分之几。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：这个角是圆的几分之几？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“转一转”，看扇形在圆里占了多大一块。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-spin" type="button">转一转</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-eq-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“转一转”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 90°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 180°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 270°</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“90° 是 1/4 圆，180° 是半圆，270° 是 3/4 圆”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = '这个角是 ' + L.deg + '°，它是圆的几分之几？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var s = gid(K + '-svg'); if (s) s.innerHTML = '';
      var e = gid(K + '-eq-tx'); if (e) e.textContent = '';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜是 ' + LEVELS[li].opts[i] + ' 个圆。点“转一转”验证。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-spin').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：是圆的几分之几？'); return; }
      var L = LEVELS[li];
      var cx = 110, cy = 110, r = 90;
      var pts = [cx + ',' + cy];
      for (var a = 0; a <= L.deg; a += 10) {
        var rad = a * Math.PI / 180;
        pts.push(Math.round(cx + r * Math.cos(rad)) + ',' + Math.round(cy - r * Math.sin(rad)));
      }
      var s = gid(K + '-svg');
      if (s) s.innerHTML = '<svg width="240" height="240" viewBox="0 0 220 220"><circle cx="110" cy="110" r="90" fill="#f1f5f9" stroke="#64748b" stroke-width="2"/><polygon points="' + pts.join(' ') + '" fill="#fbbf24" stroke="#d97706" stroke-width="2"/><text x="110" y="20" text-anchor="middle">0°</text><text x="205" y="114">90°</text><text x="110" y="212" text-anchor="middle">180°</text><text x="8" y="114">270°</text></svg>';
      var e = gid(K + '-eq-tx');
      if (e) e.textContent = L.deg + '° ÷ 360° = ' + L.frac + ' 个圆。' + L.note;
      if (guessed === L.ansIdx) {
        msg('对了：' + L.deg + '° 就是 ' + L.frac + ' 个圆。' + L.note);
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('扇形占了 ' + L.frac + ' 个圆，你猜的是 ' + L.opts[guessed] + '。' + L.note);
      }
    });
    function setLevel(i) {
      li = i; guessed = -1;
      draw();
      msg('先猜一猜，再点“转一转”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：90° = 1/4 圆', '提高：180° = 1/2 圆', '挑战：270° = 3/4 圆'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
/* 4.4 三位数乘两位数：跳过面积模型拆两边（已有 areamodel），做竖式对照、积的变化、速度条重复。 */
registerAnim({
  key: 'm44-vertical',
  title: '竖式和面积图对上号',
  sub: '竖式第二行 123×40=4920，就是面积图里 123×40 那块——点一行，亮一块，同色对应。',
  grade: 4,
  kind: '演示',
  points: ['4.4'],
  render: function (el) {
    var K = 'm44-vertical';
    var LEVELS = [
      { label: '基础', a: 123, b: 45, s: 40, r: 5, p1: '123×5=615', p2: '123×40=4920', total: '5535' },
      { label: '提高', a: 138, b: 24, s: 20, r: 4, p1: '138×4=552', p2: '138×20=2760', total: '3312' },
      { label: '挑战', a: 125, b: 16, s: 10, r: 6, p1: '125×6=750', p2: '125×10=1250', total: '2000' }
    ];
    var li = 0, guessed = -1, matched = [false, false], tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 4 年级 · 三位数乘两位数</p>' +
      '<h3>竖式和面积图对上号</h3>' +
      '<p>竖式的每一行，在面积图里都有一块地方。点竖式的一行，看它对应面积图里的哪一块。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：竖式第二行对应面积图里哪一块？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点竖式的行，再点面积图里的块，两边对上号。</p>' +
      '<p>竖式：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-row-0" type="button"></button>' +
      '<button class="btn small ghost" id="' + K + '-row-1" type="button"></button></div>' +
      '<p>面积图：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-block-0" type="button"></button>' +
      '<button class="btn small ghost" id="' + K + '-block-1" type="button"></button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点竖式的行。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 123×45</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 138×24</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 125×16</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“竖式第二行的 0 就是乘 40 的意思，对应面积图里那块”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.a + ' × ' + L.b + '：竖式第二行是 ' + L.p2 + '，它对应面积图里哪一块？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.a + '×' + L.r + ' 那块';
      g = gid(K + '-guess-b'); if (g) g.textContent = L.a + '×' + L.s + ' 那块';
      var r0 = gid(K + '-row-0'); if (r0) { r0.textContent = '第 1 行：' + L.p1; r0.style.background = ''; }
      var r1 = gid(K + '-row-1'); if (r1) { r1.textContent = '第 2 行：' + L.p2; r1.style.background = ''; }
      var b0 = gid(K + '-block-0'); if (b0) { b0.textContent = '块 A：' + L.a + '×' + L.r; b0.style.background = ''; }
      var b1 = gid(K + '-block-1'); if (b1) { b1.textContent = '块 B：' + L.a + '×' + L.s; b1.style.background = ''; }
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg(i === 1 ? '你猜第二行对应 ' + LEVELS[li].a + '×' + LEVELS[li].s + ' 那块。点竖式的行验证。' : '你猜第二行对应 ' + LEVELS[li].a + '×' + LEVELS[li].r + ' 那块。点竖式的行验证。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    function match(i) {
      if (guessed < 0) { msg('先猜一猜：第二行对应哪一块？'); return; }
      matched[i] = true;
      var L = LEVELS[li];
      var row = gid(K + '-row-' + i); if (row) row.style.background = i === 0 ? '#fde68a' : '#bfdbfe';
      var blk = gid(K + '-block-' + i); if (blk) blk.style.background = i === 0 ? '#fde68a' : '#bfdbfe';
      if (matched[0] && matched[1]) {
        msg('两行都对上了：' + L.p1 + ' + ' + L.p2 + ' = ' + L.total + '。竖式第二行的 0 就是乘 ' + L.s + ' 的意思，千万别漏了它。');
        if (guessed === 1) {
          if (tiers) tiers.done(li);
          if (typeof markTried === 'function') markTried(K);
        }
      } else {
        msg('第 ' + (i + 1) + ' 行对上了：' + (i === 0 ? L.p1 : L.p2) + '。再点另一行。');
      }
    }
    gid(K + '-row-0').addEventListener('click', function () { match(0); });
    gid(K + '-row-1').addEventListener('click', function () { match(1); });
    gid(K + '-block-0').addEventListener('click', function () { match(0); });
    gid(K + '-block-1').addEventListener('click', function () { match(1); });
    function setLevel(i) {
      li = i; guessed = -1; matched = [false, false];
      draw();
      msg('先猜一猜，再点竖式的行。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：123×45 竖式对照', '提高：138×24 竖式对照', '挑战：125×16 竖式对照'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
registerAnim({
  key: 'm44-stretch',
  title: '拉一边，看面积变几倍',
  sub: '长方形一边拉长 10 倍，面积变 10 倍；一边 ×2、另一边 ×3，面积变 6 倍。',
  grade: 4,
  kind: '模拟',
  points: ['4.4'],
  render: function (el) {
    var K = 'm44-stretch';
    var LEVELS = [
      { label: '基础', a: 12, b: 5, fa: 10, fb: 1, na: 120, nb: 5, prod: 60, nprod: 600, mult: 10, q: '一边变 10 倍，面积变几倍？', opts: ['变 2 倍', '变 10 倍', '不变'], ansIdx: 1 },
      { label: '提高', a: 4, b: 5, fa: 2, fb: 3, na: 8, nb: 15, prod: 20, nprod: 120, mult: 6, q: '一边 ×2、另一边 ×3，积变几倍？', opts: ['变 5 倍', '变 6 倍', '变 23 倍'], ansIdx: 1 },
      { label: '挑战', a: 15, b: 4, fa: 4, fb: 5, na: 60, nb: 20, prod: 60, nprod: 1200, mult: 20, q: '一边 ×4、另一边 ×5，积变几倍？', opts: ['变 9 倍', '变 20 倍', '变 45 倍'], ansIdx: 1 }
    ];
    var li = 0, guessed = -1, stretched = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 4 年级 · 三位数乘两位数</p>' +
      '<h3>拉一边，看面积变几倍</h3>' +
      '<p>一个长方形，拉长一条边，面积跟着变；两条边一起拉，面积变的是两个倍数的乘积。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：面积变几倍？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“拉一拉”，看长方形变大、面积变几倍。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-stretch" type="button">拉一拉</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-eq-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“拉一拉”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 12×5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 4×5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 15×4</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“积变的倍数 = 两个因数变的倍数相乘”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function rectSvg(a, b, color) {
      var w = Math.min(260, 20 + a * 2), h = Math.min(150, 20 + b * 6);
      return '<svg width="300" height="180" viewBox="0 0 300 180"><rect x="20" y="15" width="' + w + '" height="' + h + '" fill="' + color + '" stroke="#2563eb" stroke-width="2"/><text x="24" y="30">' + a + ' × ' + b + '</text></svg>';
    }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.a + ' × ' + L.b + ' = ' + L.prod + '。一边 ×' + L.fa + '、另一边 ×' + L.fb + '，' + L.q;
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var s = gid(K + '-svg');
      if (s) s.innerHTML = rectSvg(stretched ? L.na : L.a, stretched ? L.nb : L.b, stretched ? '#bfdbfe' : '#dbeafe');
      var e = gid(K + '-eq-tx');
      if (e) e.textContent = stretched ? (L.na + ' × ' + L.nb + ' = ' + L.nprod + '。') : (L.a + ' × ' + L.b + ' = ' + L.prod + '。');
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜面积' + LEVELS[li].opts[i] + '。点“拉一拉”验证。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-stretch').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：面积变几倍？'); return; }
      stretched = true;
      draw();
      var L = LEVELS[li];
      if (guessed === L.ansIdx) {
        msg('对了：' + L.na + ' × ' + L.nb + ' = ' + L.nprod + '，' + L.prod + ' × ' + L.mult + ' = ' + L.nprod + '，面积变了 ' + L.mult + ' 倍。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('看：' + L.na + ' × ' + L.nb + ' = ' + L.nprod + '，是 ' + L.prod + ' 的 ' + L.mult + ' 倍，不是 ' + L.opts[guessed] + '。两个倍数要相乘：' + L.fa + ' × ' + L.fb + ' = ' + L.mult + '。');
      }
    });
    function setLevel(i) {
      li = i; guessed = -1; stretched = false;
      draw();
      msg('先猜一猜，再点“拉一拉”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：一边 ×10，积 ×10', '提高：×2 和 ×3，积 ×6', '挑战：×4 和 ×5，积 ×20'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
registerAnim({
  key: 'm44-speed',
  title: '速度条重复法',
  sub: '速度是“每小时走多远”，时间是“走几小时”：速度条在时间轴上重复叠加，就是路程。',
  grade: 4,
  kind: '演示',
  points: ['4.4'],
  render: function (el) {
    var K = 'm44-speed';
    var LEVELS = [
      { label: '基础', v: 60, t: 2, d: 120, opts: ['60 千米', '120 千米', '180 千米'], ansIdx: 1 },
      { label: '提高', v: 80, t: 3, d: 240, opts: ['160 千米', '240 千米', '320 千米'], ansIdx: 1 },
      { label: '挑战', v: 45, t: 4, d: 180, opts: ['135 千米', '180 千米', '225 千米'], ansIdx: 1 }
    ];
    var li = 0, guessed = -1, hours = 0, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 4 年级 · 三位数乘两位数</p>' +
      '<h3>速度条重复法</h3>' +
      '<p>一辆车每小时走 60 千米。走 1 小时是 1 个 60，走 2 小时是 2 个 60——路程就是速度条重复叠加。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：走完全程是几千米？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“再走 1 小时”，一格一格叠上去。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-hour" type="button">再走 1 小时</button></div>' +
      '<div id="' + K + '-bars"></div>' +
      '<p id="' + K + '-total-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“再走 1 小时”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 60 千米/时 × 2 小时</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 80 千米/时 × 3 小时</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 45 千米/时 × 4 小时</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“路程 = 速度 × 时间，就是速度条重复几次”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = '车速是每小时 ' + L.v + ' 千米，走 ' + L.t + ' 小时，一共走几千米？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var bars = gid(K + '-bars');
      if (bars) {
        var s = '';
        for (var i = 0; i < hours; i++) s += '<p>第 ' + (i + 1) + ' 小时：走了 ' + L.v + ' 千米</p>';
        if (!hours) s = '<p>还没出发。</p>';
        bars.innerHTML = s;
      }
      var tt = gid(K + '-total-tx');
      if (tt) tt.textContent = '走了 ' + hours + ' 小时，一共 ' + (hours * L.v) + ' 千米。';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜是 ' + LEVELS[li].opts[i] + '。点“再走 1 小时”，一格一格叠上去验证。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-hour').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：走完全程是几千米？'); return; }
      var L = LEVELS[li];
      if (hours >= L.t) { msg('已经走完了：' + L.v + ' × ' + L.t + ' = ' + L.d + ' 千米。'); return; }
      hours++;
      draw();
      if (hours === L.t) {
        if (guessed === L.ansIdx) {
          msg('对了：' + L.v + ' × ' + L.t + ' = ' + L.d + ' 千米。' + L.t + ' 个 ' + L.v + ' 叠起来就是路程。');
          if (tiers) tiers.done(li);
          if (typeof markTried === 'function') markTried(K);
        } else {
          msg('走完了：' + L.v + ' × ' + L.t + ' = ' + L.d + ' 千米，你猜的是 ' + L.opts[guessed] + '。速度条重复了 ' + L.t + ' 次。');
        }
      } else {
        msg('走了 ' + hours + ' 小时，' + (hours * L.v) + ' 千米，还差 ' + (L.t - hours) + ' 小时。');
      }
    });
    function setLevel(i) {
      li = i; guessed = -1; hours = 0;
      draw();
      msg('先猜一猜，再点“再走 1 小时”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：60×2 = 120 千米', '提高：80×3 = 240 千米', '挑战：45×4 = 180 千米'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
/* 4.5 平行四边形和梯形：跳过拖顶点看不变性（已有 parallelogram），quadmorph 是变形拼图，不覆盖等距、剪拼、包含关系，做这三个。 */
registerAnim({
  key: 'm45-equal',
  title: '平行就是处处一样远',
  sub: '两条平行线，量哪里距离都一样；看起来平行，一量距离不一样，就不是平行。',
  grade: 4,
  kind: '实验',
  points: ['4.5'],
  render: function (el) {
    var K = 'm45-equal';
    var LEVELS = [
      { label: '基础', dists: [3, 3, 3], parallel: true, long: false, opts: ['平行', '不平行'], ansIdx: 0, note: '三处量出来都是 3 厘米：处处一样远，就是平行。' },
      { label: '提高', dists: [3, 3, 3], parallel: true, long: true, opts: ['平行', '不平行'], ansIdx: 0, note: '把两条线延长再量，还是 3 厘米：平行线延长多远都不相交。' },
      { label: '挑战', dists: [2, 3, 4], parallel: false, long: false, opts: ['平行', '不平行'], ansIdx: 1, note: '三处量出来是 2、3、4 厘米：距离不一样，这两条线迟早会碰到一起——不是平行。' }
    ];
    var li = 0, guessed = -1, measured = 0, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 4 年级 · 平行四边形和梯形</p>' +
      '<h3>平行就是处处一样远</h3>' +
      '<p>两条线看起来平行，是真的吗？别用眼睛猜：拿尺子量三处，距离处处一样才是平行。</p>' +
      '<p>第 1 步 · 先猜：这两条线平行吗？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button">平行</button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button">不平行</button></div>' +
      '<p>第 2 步 · 玩一玩：点“量一量”，三处都量一遍，再下判断。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-measure" type="button">量一量</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“量一量”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 两条线</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 延长再量</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 看起来平行</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“平行就是处处距离一样，延长也不变”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var xs = [50, 150, 250];
      var s = '<svg width="300" height="180" viewBox="0 0 300 180">';
      s += '<line x1="30" y1="50" x2="270" y2="50" stroke="#2563eb" stroke-width="3"/>';
      if (L.parallel) {
        s += '<line x1="30" y1="110" x2="270" y2="110" stroke="#dc2626" stroke-width="3"/>';
        if (L.long) s += '<line x1="270" y1="50" x2="295" y2="50" stroke="#2563eb" stroke-width="3" stroke-dasharray="4 4"/><line x1="270" y1="110" x2="295" y2="110" stroke="#dc2626" stroke-width="3" stroke-dasharray="4 4"/>';
      } else {
        s += '<line x1="30" y1="90" x2="270" y2="130" stroke="#dc2626" stroke-width="3"/>';
      }
      for (var i = 0; i < 3; i++) {
        var x = xs[i];
        var d = L.dists[i];
        var y2 = L.parallel ? 110 : 90 + (x - 30) * 40 / 240;
        s += '<line x1="' + x + '" y1="50" x2="' + x + '" y2="' + Math.round(y2) + '" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3 3"/>';
        if (i < measured) s += '<text x="' + (x + 4) + '" y="85" text-anchor="start">' + d + ' 厘米</text>';
      }
      s += '</svg>';
      var box = gid(K + '-svg'); if (box) box.innerHTML = s;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜这两条线' + LEVELS[li].opts[i] + '。点“量一量”，三处都量一遍再下判断。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-measure').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：这两条线平行吗？'); return; }
      var L = LEVELS[li];
      if (measured < 3) {
        measured++;
        draw();
        if (measured < 3) {
          msg('第 ' + measured + ' 处：' + L.dists[measured - 1] + ' 厘米。再量下一处。');
        } else {
          msg('三处都量完了：' + L.dists.join('、') + ' 厘米。' + L.note + (guessed === L.ansIdx ? '你猜对了！' : '你猜的是' + L.opts[guessed] + '，再想想。'));
          if (guessed === L.ansIdx) {
            if (tiers) tiers.done(li);
            if (typeof markTried === 'function') markTried(K);
          }
        }
      } else {
        msg('三处都量完了：' + L.dists.join('、') + ' 厘米。' + L.note);
      }
    });
    function setLevel(i) {
      li = i; guessed = -1; measured = 0;
      draw();
      msg('先猜一猜，再点“量一量”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：三处都是 3 厘米', '提高：延长还是 3 厘米', '挑战：2、3、4 厘米不平行'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
registerAnim({
  key: 'm45-cut',
  title: '剪一刀，平移变长方形',
  sub: '平行四边形左边剪下一个三角形，平移到右边，就变成了等底等高的长方形——面积一点没变。',
  grade: 4,
  kind: '模拟',
  points: ['4.5'],
  render: function (el) {
    var K = 'm45-cut';
    var LEVELS = [
      { label: '基础', base: 6, h: 4, area: 24 },
      { label: '提高', base: 8, h: 3, area: 24 },
      { label: '挑战', base: 5, h: 6, area: 30 }
    ];
    var li = 0, guessed = -1, step = 0, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 4 年级 · 平行四边形和梯形</p>' +
      '<h3>剪一刀，平移变长方形</h3>' +
      '<p>平行四边形的面积怎么算？剪下一个三角形，平移到另一边，它就变成了长方形——底还是底，高还是高。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：剪下来平移过去，面积变了吗？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button">变大了</button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button">不变</button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button">变小了</button></div>' +
      '<p>第 2 步 · 玩一玩：先“剪一刀”，再“平移过去”。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-cut" type="button">剪一刀</button>' +
      '<button class="btn small primary" id="' + K + '-move" type="button">平移过去</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-area-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“剪一刀”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 底 6 高 4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 底 8 高 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 底 5 高 6</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“平行四边形面积 = 底 × 高，剪拼前后不变”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var W = L.base * 20, H = L.h * 20;
      var q = gid(K + '-q-tx'); if (q) q.textContent = '平行四边形：底 ' + L.base + '，高 ' + L.h + '，面积是多少？';
      var s = '<svg width="300" height="200" viewBox="0 0 300 200">';
      if (step === 0) {
        s += '<polygon points="60,20 ' + (60 + W) + ',20 ' + (100 + W) + ',' + (20 + H) + ' 100,' + (20 + H) + '" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>';
        s += '<line x1="100" y1="20" x2="100" y2="' + (20 + H) + '" stroke="#dc2626" stroke-width="2" stroke-dasharray="5 4"/>';
      } else if (step === 1) {
        s += '<polygon points="100,20 ' + (60 + W) + ',20 ' + (100 + W) + ',' + (20 + H) + ' 100,' + (20 + H) + '" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>';
        s += '<polygon points="60,20 100,20 100,' + (20 + H) + '" fill="#fde68a" stroke="#d97706" stroke-width="2"/>';
      } else {
        s += '<polygon points="100,20 ' + (100 + W) + ',20 ' + (100 + W) + ',' + (20 + H) + ' 100,' + (20 + H) + '" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>';
        s += '<text x="' + (100 + W / 2) + '" y="' + (20 + H / 2) + '" text-anchor="middle">长方形</text>';
      }
      s += '<text x="60" y="190">底 ' + L.base + '</text><text x="270" y="100">高 ' + L.h + '</text></svg>';
      var box = gid(K + '-svg'); if (box) box.innerHTML = s;
      var at = gid(K + '-area-tx');
      if (at) at.textContent = '面积：底 × 高 = ' + L.base + ' × ' + L.h + ' = ' + L.area + '。剪拼前后都是 ' + L.area + '。';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg(i === 1 ? '你猜面积不变。点“剪一刀”验证。' : '你猜面积' + (i === 0 ? '变大了' : '变小了') + '。点“剪一刀”验证。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-cut').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：面积变了吗？'); return; }
      if (step !== 0) { msg('已经剪过了，点“平移过去”。'); return; }
      step = 1;
      draw();
      msg('剪下来了：黄色的三角形就是剪下的那块。再点“平移过去”。');
    });
    gid(K + '-move').addEventListener('click', function () {
      if (step !== 1) { msg('先点“剪一刀”。'); return; }
      step = 2;
      draw();
      var L = LEVELS[li];
      if (guessed === 1) {
        msg('变成了长方形：底 ' + L.base + '，高 ' + L.h + '，面积还是 ' + L.area + '。你猜对了：剪拼只挪了位置，没多也没少。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('变成了长方形：底 ' + L.base + '，高 ' + L.h + '，面积还是 ' + L.area + '，没有变大也没有变小。');
      }
    });
    function setLevel(i) {
      li = i; guessed = -1; step = 0;
      draw();
      msg('先猜一猜，再点“剪一刀”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：底 6 高 4 = 24', '提高：底 8 高 3 = 24', '挑战：底 5 高 6 = 30'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
registerAnim({
  key: 'm45-sets',
  title: '四边形一家子',
  sub: '长方形在平行四边形圈里，平行四边形在四边形圈里，正方形在最里面——梯形在平行四边形圈外面。',
  grade: 4,
  kind: '演示',
  points: ['4.5'],
  render: function (el) {
    var K = 'm45-sets';
    var LEVELS = [
      { label: '基础', q: '长方形是平行四边形吗？', ansIdx: 0, hi: 'rect', why: '长方形在平行四边形圈里：两组对边都平行，还多了四个直角。' },
      { label: '提高', q: '梯形是平行四边形吗？', ansIdx: 1, hi: 'trap', why: '梯形只有一组对边平行，进不了平行四边形圈——它在四边形圈里，平行四边形圈外。' },
      { label: '挑战', q: '正方形是长方形吗？', ansIdx: 0, hi: 'square', why: '正方形在长方形圈里：四个角都是直角，还多了四条边一样长。' }
    ];
    var li = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 4 年级 · 平行四边形和梯形</p>' +
      '<h3>四边形一家子</h3>' +
      '<p>四边形是一大家子，圈里套圈：谁在谁的圈里，谁就是谁的一种。点一点，看每个图形住在哪个圈里。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：是，还是不是？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button">是</button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button">不是</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再看图。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 长方形</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 梯形</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 正方形</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“长方形是平行四边形，正方形是长方形，梯形不是平行四边形”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function fillFor(name, hi) { return name === hi ? '#fde68a' : '#ffffff'; }
    function draw(hi) {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.q;
      var s = '<svg width="300" height="230" viewBox="0 0 300 230">';
      s += '<rect x="10" y="10" width="280" height="210" fill="' + fillFor('quad', hi) + '" stroke="#64748b" stroke-width="2"/>';
      s += '<text x="16" y="28">四边形</text>';
      s += '<rect x="40" y="35" width="220" height="140" fill="' + fillFor('par', hi) + '" stroke="#2563eb" stroke-width="2"/>';
      s += '<text x="46" y="53">平行四边形</text>';
      s += '<rect x="70" y="60" width="160" height="90" fill="' + fillFor('rect', hi) + '" stroke="#16a34a" stroke-width="2"/>';
      s += '<text x="76" y="78">长方形</text>';
      s += '<rect x="110" y="85" width="80" height="50" fill="' + fillFor('square', hi) + '" stroke="#d97706" stroke-width="2"/>';
      s += '<text x="118" y="113">正方形</text>';
      s += '<rect x="45" y="188" width="70" height="22" fill="' + fillFor('trap', hi) + '" stroke="#dc2626" stroke-width="2"/>';
      s += '<text x="50" y="203">梯形</text>';
      s += '</svg>';
      var box = gid(K + '-svg'); if (box) box.innerHTML = s;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      var L = LEVELS[li];
      draw(L.hi);
      if (i === L.ansIdx) {
        msg('对了：' + L.why);
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('不对：' + L.why);
      }
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    function setLevel(i) {
      li = i; guessed = -1;
      draw(null);
      msg('先猜一猜，再看图。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：长方形是平行四边形', '提高：梯形不是平行四边形', '挑战：正方形是长方形'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw(null);
  }
});
/* 4.6 除数是两位数的除法：跳过试商面板（已有 trialdiv；运算组 op-overshoot 也是试商机制），做部分商、整十估商、商不变规律。 */
registerAnim({
  key: 'm46-parts',
  title: '被除数拆开再除',
  sub: '156÷3：先分出 150 来除得 50，剩下的 6 除得 2，合起来 52——除法是乘法面积模型的逆过程。',
  grade: 4,
  kind: '模拟',
  points: ['4.6'],
  render: function (el) {
    var K = 'm46-parts';
    var LEVELS = [
      { label: '基础', d: 156, v: 3, p1: 150, p2: 6, q1: 50, q2: 2, q: 52, opts: ['50', '52', '60'], ansIdx: 1 },
      { label: '提高', d: 224, v: 4, p1: 200, p2: 24, q1: 50, q2: 6, q: 56, opts: ['54', '56', '62'], ansIdx: 1 },
      { label: '挑战', d: 368, v: 8, p1: 320, p2: 48, q1: 40, q2: 6, q: 46, opts: ['44', '46', '48'], ansIdx: 1 }
    ];
    var li = 0, guessed = -1, opened = [false, false], tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 4 年级 · 除数是两位数的除法</p>' +
      '<h3>被除数拆开再除</h3>' +
      '<p>被除数太大，一口除不完：按整十整百拆成两块，每块分别除，再把商加起来。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：商是多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点两块，看每块除出来是多少，再加起来。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-part-0" type="button"></button>' +
      '<button class="btn small ghost" id="' + K + '-part-1" type="button"></button></div>' +
      '<p id="' + K + '-sum-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点两块。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 156÷3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 224÷4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 368÷8</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“拆成整十整百的两块，分别除，商加起来”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.d + ' ÷ ' + L.v + ' = ？先拆成 ' + L.p1 + ' 和 ' + L.p2 + '。';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var b0 = gid(K + '-part-0'); if (b0) b0.textContent = opened[0] ? (L.p1 + ' ÷ ' + L.v + ' = ' + L.q1) : ('第 1 块：' + L.p1);
      var b1 = gid(K + '-part-1'); if (b1) b1.textContent = opened[1] ? (L.p2 + ' ÷ ' + L.v + ' = ' + L.q2) : ('第 2 块：' + L.p2);
      var s = gid(K + '-sum-tx');
      if (s) s.textContent = (opened[0] && opened[1]) ? ('合起来：' + L.q1 + ' + ' + L.q2 + ' = ' + L.q + '。') : '';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜商是 ' + LEVELS[li].opts[i] + '。点两块验证。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    function open(i) {
      if (guessed < 0) { msg('先猜一猜：商是多少？'); return; }
      opened[i] = true;
      draw();
      var L = LEVELS[li];
      if (opened[0] && opened[1]) {
        if (guessed === L.ansIdx) {
          msg('对了：' + L.p1 + ' ÷ ' + L.v + ' = ' + L.q1 + '，' + L.p2 + ' ÷ ' + L.v + ' = ' + L.q2 + '，' + L.q1 + ' + ' + L.q2 + ' = ' + L.q + '。你猜对了！');
          if (tiers) tiers.done(li);
          if (typeof markTried === 'function') markTried(K);
        } else {
          msg('两块除出来是 ' + L.q1 + ' 和 ' + L.q2 + '，合起来是 ' + L.q + '，你猜的是 ' + L.opts[guessed] + '。');
        }
      } else {
        msg('第 ' + (i + 1) + ' 块除出来是 ' + (i === 0 ? L.q1 : L.q2) + '。再点另一块。');
      }
    }
    gid(K + '-part-0').addEventListener('click', function () { open(0); });
    gid(K + '-part-1').addEventListener('click', function () { open(1); });
    function setLevel(i) {
      li = i; guessed = -1; opened = [false, false];
      draw();
      msg('先猜一猜，再点两块。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：156÷3 = 52', '提高：224÷4 = 56', '挑战：368÷8 = 46'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
registerAnim({
  key: 'm46-round',
  title: '除数先看成整十',
  sub: '除数 39 先看成 40 试商，再乘回去微调：估商是“先近似再精确”。',
  grade: 4,
  kind: '模拟',
  points: ['4.6'],
  render: function (el) {
    var K = 'm46-round';
    var LEVELS = [
      { label: '基础', d: 312, v: 39, round: 40, tries: [8], prods: [312], res: '商是 8', opts: ['7', '8', '9'], ansIdx: 1, note: '39 看成 40：试 8，8×39=312，正好，商是 8。' },
      { label: '提高', d: 161, v: 23, round: 20, tries: [8, 7], prods: [184, 161], res: '商是 7', opts: ['6', '7', '8'], ansIdx: 1, note: '23 看成 20：试 8，8×23=184，比 161 大，调小试 7，7×23=161，正好，商是 7。' },
      { label: '挑战', d: 247, v: 38, round: 40, tries: [6], prods: [228], res: '商是 6 余 19', opts: ['6', '7', '8'], ansIdx: 0, note: '38 看成 40：试 6，6×38=228，247−228=19，商是 6 余 19。' }
    ];
    var li = 0, guessed = -1, rounded = false, tryIdx = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 4 年级 · 除数是两位数的除法</p>' +
      '<h3>除数先看成整十</h3>' +
      '<p>除数 39 不好试？先把它看成 40，商就好猜了；猜完乘回去验算，大了调小、小了调大。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：商是几？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：先“看成整十”，再“试商”。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-round" type="button">看成整十</button>' +
      '<button class="btn small primary" id="' + K + '-try" type="button">试商</button></div>' +
      '<p id="' + K + '-work-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“看成整十”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 312÷39</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 161÷23</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 247÷38</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“除数先看成整十试商，乘回去验算再微调”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.d + ' ÷ ' + L.v + ' = ？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var w = gid(K + '-work-tx');
      if (w) {
        if (!rounded) w.textContent = '';
        else if (tryIdx < 0) w.textContent = L.v + ' 看成 ' + L.round + '。按 ' + L.round + ' 来试商。';
        else w.textContent = L.v + ' 看成 ' + L.round + '。试 ' + L.tries[tryIdx] + '：' + L.tries[tryIdx] + '×' + L.v + '=' + L.prods[tryIdx] + '。';
      }
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜商是 ' + LEVELS[li].opts[i] + '。点“看成整十”，再“试商”。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-round').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：商是几？'); return; }
      rounded = true;
      draw();
      msg(LEVELS[li].v + ' 看成 ' + LEVELS[li].round + ' 了。点“试商”。');
    });
    gid(K + '-try').addEventListener('click', function () {
      if (!rounded) { msg('先点“看成整十”。'); return; }
      var L = LEVELS[li];
      if (tryIdx >= L.tries.length - 1 && tryIdx >= 0) { msg(L.note); return; }
      tryIdx++;
      draw();
      var prod = L.prods[tryIdx];
      if (prod > L.d) {
        msg('试 ' + L.tries[tryIdx] + '：' + L.tries[tryIdx] + '×' + L.v + '=' + prod + '，比 ' + L.d + ' 大——商大了，再点一次“试商”，调小再试。');
      } else if (L.d - prod >= L.v) {
        msg('试 ' + L.tries[tryIdx] + '：余 ' + (L.d - prod) + '，比除数还大——商小了，再点一次“试商”，调大再试。');
      } else {
        msg(L.note + (guessed === L.ansIdx ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '，答案是' + L.res + '。'));
        if (guessed === L.ansIdx) {
          if (tiers) tiers.done(li);
          if (typeof markTried === 'function') markTried(K);
        }
      }
    });
    function setLevel(i) {
      li = i; guessed = -1; rounded = false; tryIdx = -1;
      draw();
      msg('先猜一猜，再点“看成整十”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：312÷39 = 8', '提高：161÷23 = 7', '挑战：247÷38 = 6 余 19'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
registerAnim({
  key: 'm46-invariant',
  title: '两个数同时变，商不动',
  sub: '30÷4 和 300÷40：商都是 7，余数从 2 变成 20——商不变，余数跟着 ×10。',
  grade: 4,
  kind: '模拟',
  points: ['4.6'],
  render: function (el) {
    var K = 'm46-invariant';
    var LEVELS = [
      { label: '基础', a: 30, b: 4, q: 7, r: 2, ca: 75, cr: 0, opts: ['商不变，余数不变', '商不变，余数 ×10', '商和余数都 ×10'], ansIdx: 1 },
      { label: '提高', a: 50, b: 6, q: 8, r: 2, ca: 83, cr: 2, opts: ['商不变，余数不变', '商不变，余数 ×10', '商和余数都 ×10'], ansIdx: 1 },
      { label: '挑战', a: 120, b: 7, q: 17, r: 1, ca: 171, cr: 3, opts: ['商不变，余数不变', '商不变，余数 ×10', '商和余数都 ×10'], ansIdx: 1 }
    ];
    var li = 0, guessed = -1, mult = 1, onlyA = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 4 年级 · 除数是两位数的除法</p>' +
      '<h3>两个数同时变，商不动</h3>' +
      '<p>被除数和除数同时 ×10，商会变吗？余数呢？点一点，看商和余数谁动谁不动。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：两个数同时 ×10，商和余数怎么变？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点 ×10、×100，再点“只移被除数”看反例。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-m1" type="button">×1</button>' +
      '<button class="btn small ghost" id="' + K + '-m10" type="button">×10</button>' +
      '<button class="btn small ghost" id="' + K + '-m100" type="button">×100</button>' +
      '<button class="btn small ghost" id="' + K + '-only-a" type="button">只移被除数（反例）</button></div>' +
      '<p id="' + K + '-eq-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点 ×10。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 30÷4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 50÷6</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 120÷7</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“商不变，余数跟着变；只移一个数，商就变了”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.a + ' ÷ ' + L.b + ' = ' + L.q + ' 余 ' + L.r + '。';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var e = gid(K + '-eq-tx');
      if (e) {
        if (onlyA) e.textContent = (L.a * 10) + ' ÷ ' + L.b + ' = ' + L.ca + (L.cr ? ' 余 ' + L.cr : '') + '（只移了被除数）';
        else e.textContent = (L.a * mult) + ' ÷ ' + (L.b * mult) + ' = ' + L.q + ' 余 ' + (L.r * mult) + '。';
      }
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜' + LEVELS[li].opts[i] + '。点 ×10 验证。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    function setMult(m) {
      if (guessed < 0) { msg('先猜一猜，再点 ×10。'); return; }
      mult = m; onlyA = false;
      draw();
      var L = LEVELS[li];
      if (guessed === L.ansIdx) {
        msg('看：' + (L.a * m) + ' ÷ ' + (L.b * m) + ' = ' + L.q + ' 余 ' + (L.r * m) + '。商还是 ' + L.q + '，余数从 ' + L.r + ' 变成 ' + (L.r * m) + '。你猜对了！');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('看：商还是 ' + L.q + '，没动；余数从 ' + L.r + ' 变成 ' + (L.r * m) + '，跟着 ×' + m + ' 了。');
      }
    }
    gid(K + '-m1').addEventListener('click', function () { setMult(1); });
    gid(K + '-m10').addEventListener('click', function () { setMult(10); });
    gid(K + '-m100').addEventListener('click', function () { setMult(100); });
    gid(K + '-only-a').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再看反例。'); return; }
      onlyA = true;
      draw();
      var L = LEVELS[li];
      msg('只移被除数，商变了：' + (L.a * 10) + ' ÷ ' + L.b + ' = ' + L.ca + (L.cr ? ' 余 ' + L.cr : '') + '。所以一定要两个数同时移。');
    });
    function setLevel(i) {
      li = i; guessed = -1; mult = 1; onlyA = false;
      draw();
      msg('先猜一猜，再点 ×10。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：30÷4 和 300÷40', '提高：50÷6 和 500÷60', '挑战：120÷7 和 1200÷70'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
/* 4.7 条形统计图：跳过可拖坐标轴起点（已有 baraxis），做一格代表几、复式条比较、读图三问。 */
registerAnim({
  key: 'm47-scale',
  title: '一格代表几',
  sub: '先看纵轴 1 格代表几再读数：1 格 = 5 人时 4 格 = 20 人；刻度不同，一样高的条人数不同。',
  grade: 4,
  kind: '演示',
  points: ['4.7'],
  render: function (el) {
    var K = 'm47-scale';
    var LEVELS = [
      { label: '基础', grids: 4, per: 5, n: 20, opts: ['15 人', '20 人', '25 人'], ansIdx: 1, extra: '' },
      { label: '提高', grids: 3, per: 10, n: 30, opts: ['20 人', '30 人', '40 人'], ansIdx: 1, extra: '' },
      { label: '挑战', grids: 4, per: 2, n: 8, opts: ['8 人', '10 人', '20 人'], ansIdx: 0, extra: '同样 4 格高，1 格代表 5 人时就是 20 人——条一样高，人数可以差很多。' }
    ];
    var SCALES = [2, 5, 10];
    var li = 0, guessed = -1, per = 5, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 4 年级 · 条形统计图</p>' +
      '<h3>一格代表几</h3>' +
      '<p>读条形图，先别数条有多高：先看纵轴上 1 格代表几人，再数有几格，两数相乘才是人数。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：这个条是几人？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“换刻度”，看同一根条在不同刻度下是几人。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-s2" type="button">1 格 = 2 人</button>' +
      '<button class="btn small ghost" id="' + K + '-s5" type="button">1 格 = 5 人</button>' +
      '<button class="btn small ghost" id="' + K + '-s10" type="button">1 格 = 10 人</button></div>' +
      '<div id="' + K + '-bar"></div>' +
      '<p id="' + K + '-read-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“换刻度”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 4 格</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 3 格</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 4 格</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“人数 = 格数 × 1 格代表几”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = '这个条有 ' + L.grids + ' 格高，1 格代表 ' + L.per + ' 人，是几人？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var bar = gid(K + '-bar');
      if (bar) bar.innerHTML = '<p>条高 ' + L.grids + ' 格：</p><div style="border:1px solid #999;width:60px;height:' + (L.grids * 18) + 'px;background:#4a90d9"></div>';
      var r = gid(K + '-read-tx');
      if (r) r.textContent = '现在刻度：1 格 = ' + per + ' 人。' + L.grids + ' 格 × ' + per + ' 人/格 = ' + (L.grids * per) + ' 人。';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
      SCALES.forEach(function (s) {
        var sb = gid(K + '-s' + s);
        if (sb) sb.setAttribute('aria-pressed', String(s === per));
      });
    }
    function guess(i) {
      guessed = i;
      msg('你猜是 ' + LEVELS[li].opts[i] + '。点“换刻度”，找到 1 格代表 ' + LEVELS[li].per + ' 人的刻度验证。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    function setScale(s) {
      if (guessed < 0) { msg('先猜一猜，再点“换刻度”。'); return; }
      per = s;
      draw();
      var L = LEVELS[li];
      if (s === L.per) {
        if (guessed === L.ansIdx) {
          msg('对了：' + L.grids + ' 格 × ' + L.per + ' 人/格 = ' + L.n + ' 人。你猜对了！' + L.extra);
          if (tiers) tiers.done(li);
          if (typeof markTried === 'function') markTried(K);
        } else {
          msg('1 格 = ' + L.per + ' 人时，这个条是 ' + L.n + ' 人，你猜的是 ' + L.opts[guessed] + '。' + L.extra);
        }
      } else {
        msg('现在 1 格 = ' + s + ' 人，这个条是 ' + (L.grids * s) + ' 人——不是题目问的刻度，换一个。');
      }
    }
    gid(K + '-s2').addEventListener('click', function () { setScale(2); });
    gid(K + '-s5').addEventListener('click', function () { setScale(5); });
    gid(K + '-s10').addEventListener('click', function () { setScale(10); });
    function setLevel(i) {
      li = i; guessed = -1; per = 5;
      draw();
      msg('先猜一猜，再点“换刻度”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：4 格 × 5 人 = 20 人', '提高：3 格 × 10 人 = 30 人', '挑战：4 格 × 2 人 = 8 人'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
registerAnim({
  key: 'm47-double',
  title: '复式条并排比一比',
  sub: '两组数据并排画复式条，直接比高矮；先统一刻度再比较，否则比较无效。',
  grade: 4,
  kind: '模拟',
  points: ['4.7'],
  render: function (el) {
    var K = 'm47-double';
    var LEVELS = [
      { label: '基础', aName: '男生跳绳', a: 20, aPer: 2, bName: '女生跳绳', b: 16, bPer: 2, q: '男生比女生多几人？', opts: ['2 人', '4 人', '6 人'], ansIdx: 1, note: '同一张图、同一个刻度：男生条比女生条高 2 格，1 格 2 人，就是多 4 人。' },
      { label: '提高', aName: '男生跑步', a: 24, aPer: 2, bName: '女生跑步', b: 18, bPer: 2, q: '男生比女生多几人？', opts: ['4 人', '6 人', '8 人'], ansIdx: 1, note: '男生 24 人，女生 18 人，多 6 人：先看刻度，再比高矮。' },
      { label: '挑战', aName: 'A 班', a: 10, aPer: 2, bName: 'B 班', b: 25, bPer: 5, q: '两张图条一样高，人数一样吗？', opts: ['一样', '不一样，差 15 人', '不一样，差 5 人'], ansIdx: 1, note: '两张图刻度不同：A 图 1 格 = 2 人，5 格 = 10 人；B 图 1 格 = 5 人，5 格 = 25 人——看着一样高，实际差 15 人！' }
    ];
    var li = 0, guessed = -1, shown = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 4 年级 · 条形统计图</p>' +
      '<h3>复式条并排比一比</h3>' +
      '<p>两组数据并排画，两条一比就知道谁多。但先看刻度：刻度不一样，高矮就比不了。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：答案是多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“看刻度”，再比高矮。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-show" type="button">看刻度</button></div>' +
      '<div id="' + K + '-bars"></div>' +
      '<p id="' + K + '-read-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“看刻度”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 跳绳</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 跑步</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 刻度不同</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“先统一刻度再比较，刻度不同不能直接比高矮”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.aName + '和' + L.bName + '：' + L.q;
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var bars = gid(K + '-bars');
      if (bars) {
        var ah = (L.a / L.aPer) * 14, bh = (L.b / L.bPer) * 14;
        bars.innerHTML = '<p>' + L.aName + '：</p><div style="border:1px solid #999;width:60px;height:' + ah + 'px;background:#4a90d9"></div>' +
          '<p>' + L.bName + '：</p><div style="border:1px solid #999;width:60px;height:' + bh + 'px;background:#e67e22"></div>';
      }
      var r = gid(K + '-read-tx');
      if (r) r.textContent = shown ? (L.aName + ' ' + L.a + ' 人（1 格 = ' + L.aPer + ' 人），' + L.bName + ' ' + L.b + ' 人（1 格 = ' + L.bPer + ' 人）。') : '刻度还没看：先点“看刻度”。';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜' + LEVELS[li].opts[i] + '。点“看刻度”验证。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-show').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再点“看刻度”。'); return; }
      shown = true;
      draw();
      var L = LEVELS[li];
      if (guessed === L.ansIdx) {
        msg('对了：' + L.note);
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('答案是 ' + L.opts[L.ansIdx] + '，你猜的是 ' + L.opts[guessed] + '。' + L.note);
      }
    });
    function setLevel(i) {
      li = i; guessed = -1; shown = false;
      draw();
      msg('先猜一猜，再点“看刻度”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：跳绳多 4 人', '提高：跑步多 6 人', '挑战：一样高差 15 人'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
registerAnim({
  key: 'm47-ask',
  title: '读图先问三句话',
  sub: '读图先问：标题是什么？横轴纵轴是什么？1 格代表几？缺标签的图不可信。',
  grade: 4,
  kind: '实验',
  points: ['4.7'],
  render: function (el) {
    var K = 'm47-ask';
    var LEVELS = [
      { label: '基础', missing: 'none', q: '这张图能读出男生有几人吗？', opts: ['能，28 人', '不能', '能，24 人'], ansIdx: 0, note: '三问都答得上：标题是四年级各班人数，纵轴是人数，1 格代表 4 人，男生条 7 格就是 28 人。' },
      { label: '提高', missing: 'title', q: '这张图可信吗？', opts: ['可信', '不可信：没有标题', '可信：条画得很好'], ansIdx: 1, note: '标题都没写，不知道这是什么数据——条再好看也不可信。' },
      { label: '挑战', missing: 'unit', q: '这张图能读出几人吗？', opts: ['能', '不能：不知道 1 格代表几', '能：看条有多高'], ansIdx: 1, note: '纵轴没有写 1 格代表几人，条再高也读不出数——缺标签的图不可信。' }
    ];
    var li = 0, guessed = -1, asked = [false, false, false], tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 4 年级 · 条形统计图</p>' +
      '<h3>读图先问三句话</h3>' +
      '<p>一张条形图，先别急着读数：问三句话——标题是什么？横轴纵轴是什么？1 格代表几？有一句答不上来，这张图就不可信。</p>' +
      '<p>第 1 步 · 先猜：这张图能读吗？</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：三句话一个一个问过去。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-ask-0" type="button">问标题</button>' +
      '<button class="btn small ghost" id="' + K + '-ask-1" type="button">问横轴纵轴</button>' +
      '<button class="btn small ghost" id="' + K + '-ask-2" type="button">问 1 格代表几</button></div>' +
      '<div id="' + K + '-answers"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再一个一个问。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 完整的图</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 缺标题</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 缺单位</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“读图先问标题、坐标轴、1 格代表几”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function answerText(i) {
      var L = LEVELS[li];
      if (i === 0) return L.missing === 'title' ? '标题：没有写！' : '标题：四年级各班人数。';
      if (i === 1) return '横轴是班级，纵轴是人数。';
      return L.missing === 'unit' ? '1 格代表几：没有写！' : '1 格代表 4 人。';
    }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.q;
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var box = gid(K + '-answers');
      if (box) {
        var s = '';
        for (var i = 0; i < 3; i++) s += '<p>' + (asked[i] ? answerText(i) : '第 ' + (i + 1) + ' 问：还没问。') + '</p>';
        box.innerHTML = s;
      }
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜' + LEVELS[li].opts[i] + '。三句话一个一个问过去验证。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    function ask(i) {
      if (guessed < 0) { msg('先猜一猜，再问。'); return; }
      asked[i] = true;
      draw();
      var L = LEVELS[li];
      if (asked[0] && asked[1] && asked[2]) {
        if (guessed === L.ansIdx) {
          msg('三问问完了：' + L.note + '你猜对了！');
          if (tiers) tiers.done(li);
          if (typeof markTried === 'function') markTried(K);
        } else {
          msg('三问问完了：' + L.note + '你猜的是 ' + L.opts[guessed] + '。');
        }
      } else {
        msg(answerText(i));
      }
    }
    gid(K + '-ask-0').addEventListener('click', function () { ask(0); });
    gid(K + '-ask-1').addEventListener('click', function () { ask(1); });
    gid(K + '-ask-2').addEventListener('click', function () { ask(2); });
    function setLevel(i) {
      li = i; guessed = -1; asked = [false, false, false];
      draw();
      msg('先猜一猜，再一个一个问。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：完整的图能读', '提高：缺标题不可信', '挑战：缺单位读不出'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
/* 4.8 优化：跳过并行时间轴沏茶（已有 teatime），烙饼在 teatime 里只有“几张几分钟”的公式、没有交替烙的排法，做交替烙、田忌赛马、关键路径。 */
registerAnim({
  key: 'm48-cakes',
  title: '烙饼交替烙法',
  sub: '3 张饼 3 分钟的秘诀是“每次锅里都有 2 张饼”：先烙 2 张正面，再 1 张反面 + 第 3 张正面，最后 2 张反面。',
  grade: 4,
  kind: '实验',
  points: ['4.8'],
  render: function (el) {
    var K = 'm48-cakes';
    var LEVELS = [
      { label: '基础', n: 3, mins: 3, steps: ['第 1 分钟：饼 1 正面 + 饼 2 正面', '第 2 分钟：饼 1 反面 + 饼 3 正面', '第 3 分钟：饼 2 反面 + 饼 3 反面'], opts: ['4 分钟', '3 分钟', '6 分钟'], ansIdx: 1, note: '每次锅里都有 2 张饼，没有一张空等：3 张饼 3 分钟，每张的两面都烙了。' },
      { label: '提高', n: 5, mins: 5, steps: ['第 1–2 分钟：先烙好 2 张饼', '第 3–5 分钟：剩下 3 张按 3 张的办法烙'], opts: ['5 分钟', '6 分钟', '10 分钟'], ansIdx: 0, note: '5 张 = 2 张 + 3 张：2 分钟 + 3 分钟 = 5 分钟。奇数张饼，最少就是张数分钟。' },
      { label: '挑战', n: 7, mins: 7, steps: ['第 1–2 分钟：先烙好 2 张饼', '第 3–7 分钟：剩下 5 张按 5 张的办法烙'], opts: ['7 分钟', '9 分钟', '14 分钟'], ansIdx: 0, note: '7 张 = 2 张 + 5 张：2 分钟 + 5 分钟 = 7 分钟。' }
    ];
    var li = 0, guessed = -1, shown = 0, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 4 年级 · 优化</p>' +
      '<h3>烙饼交替烙法</h3>' +
      '<p>烙 1 张饼要 2 分钟（两面各 1 分钟），烙 3 张饼要几分钟？6 分钟吗？锅一次能烙 2 张，别让锅空着。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：最少几分钟？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“下一步”，一步一步看锅里烙的是哪几面。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-next" type="button">下一步</button></div>' +
      '<div id="' + K + '-steps"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“下一步”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 3 张饼</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 5 张饼</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 7 张饼</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“每次锅里都有 2 张饼，奇数张饼最少就是张数分钟”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = '烙 ' + L.n + ' 张饼，每张两面各 1 分钟，锅一次烙 2 张，最少几分钟？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var box = gid(K + '-steps');
      if (box) {
        var s = '';
        for (var i = 0; i < shown; i++) s += '<p>' + L.steps[i] + '</p>';
        if (!shown) s = '<p>锅是空的。</p>';
        box.innerHTML = s;
      }
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜最少 ' + LEVELS[li].opts[i] + '。点“下一步”，一步一步看锅里烙的是哪几面。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-next').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：最少几分钟？'); return; }
      var L = LEVELS[li];
      if (shown >= L.steps.length) { msg(L.note); return; }
      shown++;
      draw();
      if (shown === L.steps.length) {
        if (guessed === L.ansIdx) {
          msg('烙完了，一共 ' + L.mins + ' 分钟！' + L.note + '你猜对了！');
          if (tiers) tiers.done(li);
          if (typeof markTried === 'function') markTried(K);
        } else {
          msg('烙完了，一共 ' + L.mins + ' 分钟，你猜的是 ' + L.opts[guessed] + '。' + L.note);
        }
      } else {
        msg('锅里一直有 2 张饼在烙。再点“下一步”。');
      }
    });
    function setLevel(i) {
      li = i; guessed = -1; shown = 0;
      draw();
      msg('先猜一猜，再点“下一步”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3 张饼 3 分钟', '提高：5 张饼 5 分钟', '挑战：7 张饼 7 分钟'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
registerAnim({
  key: 'm48-horse',
  title: '田忌赛马排序博弈',
  sub: '田忌的马每匹都比齐王的同级马慢一点，但换个出场顺序就能赢：下对上、中对下、上对中，输一局赢两局。',
  grade: 4,
  kind: '实验',
  points: ['4.8'],
  render: function (el) {
    var K = 'm48-horse';
    var ORDERS = [['上', '中', '下'], ['上', '下', '中'], ['中', '上', '下'], ['中', '下', '上'], ['下', '上', '中'], ['下', '中', '上']];
    var QI = ['上', '中', '下'];
    var LEVELS = [
      { label: '基础', target: 0, q: '先试最老实的顺序：上对上、中对中、下对下，能赢几局？', opts: ['0 局', '1 局', '2 局'], ansIdx: 0 },
      { label: '提高', target: 4, q: '试试田忌的办法：下对上、上对中、中对下，能赢几局？', opts: ['1 局', '2 局', '3 局'], ansIdx: 1 },
      { label: '挑战', target: -1, q: '6 种顺序都试一遍，几种能赢两局？', opts: ['1 种', '2 种', '3 种'], ansIdx: 0 }
    ];
    var li = 0, guessed = -1, tried = [false, false, false, false, false, false], tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 4 年级 · 优化</p>' +
      '<h3>田忌赛马排序博弈</h3>' +
      '<p>齐王的马每匹都比田忌的同级马快一点点：上对上田忌输，中对中田忌输，下对下田忌输。但田忌的上马跑得过齐王的中马，中马跑得过齐王的下马——换个顺序，输一局赢两局就是赢。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：能赢几局？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点一种出场顺序，看三局的结果。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-ord-0" type="button">上中下</button>' +
      '<button class="btn small ghost" id="' + K + '-ord-1" type="button">上下中</button>' +
      '<button class="btn small ghost" id="' + K + '-ord-2" type="button">中上下</button>' +
      '<button class="btn small ghost" id="' + K + '-ord-3" type="button">中下上</button>' +
      '<button class="btn small ghost" id="' + K + '-ord-4" type="button">下上中</button>' +
      '<button class="btn small ghost" id="' + K + '-ord-5" type="button">下中上</button></div>' +
      '<p id="' + K + '-race-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点一种出场顺序。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 老实顺序</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 田忌的办法</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 全试一遍</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“6 种顺序里只有下对上、上对中、中对下能赢两局”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function winsOf(o) {
      var w = 0;
      for (var i = 0; i < 3; i++) {
        if ((o[i] === '上' && QI[i] === '中') || (o[i] === '中' && QI[i] === '下')) w++;
      }
      return w;
    }
    function raceText(o) {
      var s = '';
      for (var i = 0; i < 3; i++) {
        var w = (o[i] === '上' && QI[i] === '中') || (o[i] === '中' && QI[i] === '下');
        s += '第 ' + (i + 1) + ' 局：田忌' + o[i] + '对齐王' + QI[i] + '，' + (w ? '赢' : '输') + '。';
      }
      return s;
    }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.q;
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜' + LEVELS[li].opts[i] + '。点一种出场顺序验证。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    function tryOrder(i) {
      if (guessed < 0) { msg('先猜一猜，再点一种出场顺序。'); return; }
      tried[i] = true;
      var o = ORDERS[i];
      var w = winsOf(o);
      var r = gid(K + '-race-tx');
      if (r) r.textContent = '顺序 ' + o.join('') + '：' + raceText(o) + '赢了 ' + w + ' 局。';
      var L = LEVELS[li];
      var done = false;
      if (L.target >= 0) {
        if (i === L.target) {
          msg('顺序 ' + o.join('') + ' 赢了 ' + w + ' 局。' + (w === 2 ? '输一局赢两局，赢整场！' : '三局两胜才算赢整场。') + (guessed === L.ansIdx ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '。'));
          done = guessed === L.ansIdx;
        } else {
          msg('顺序 ' + o.join('') + ' 赢了 ' + w + ' 局。再试试别的顺序。');
        }
      } else {
        var all = tried[0] && tried[1] && tried[2] && tried[3] && tried[4] && tried[5];
        if (all) {
          msg('6 种都试完了：只有“下上中”赢了 2 局，其他 5 种最多赢 1 局。' + (guessed === L.ansIdx ? '你猜对了：只有 1 种能赢！' : '你猜的是 ' + L.opts[guessed] + '，答案是只有 1 种能赢。'));
          done = guessed === L.ansIdx;
        } else {
          msg('顺序 ' + o.join('') + ' 赢了 ' + w + ' 局。还有没试过的顺序，都试一遍。');
        }
      }
      if (done) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    for (var oi = 0; oi < 6; oi++) {
      (function (idx) {
        gid(K + '-ord-' + idx).addEventListener('click', function () { tryOrder(idx); });
      })(oi);
    }
    function setLevel(i) {
      li = i; guessed = -1; tried = [false, false, false, false, false, false];
      var r = gid(K + '-race-tx'); if (r) r.textContent = '';
      draw();
      msg('先猜一猜，再点一种出场顺序。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：老实顺序赢 0 局', '提高：下上中赢 2 局', '挑战：6 种里只有 1 种能赢'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
registerAnim({
  key: 'm48-critical',
  title: '总时间由最长的链决定',
  sub: '先做耗时最长、不可并行的事，其他事填进它的空闲：总时间由最长的链决定，不是把所有时间加起来。',
  grade: 4,
  kind: '演示',
  points: ['4.8'],
  render: function (el) {
    var K = 'm48-critical';
    var LEVELS = [
      { label: '基础', q: '沏茶：洗水壶 1 分钟，接水 1 分钟，烧水 8 分钟，洗茶杯 2 分钟，找茶叶 1 分钟，沏茶 1 分钟（须等水开）。最少几分钟？', opts: ['14 分钟', '11 分钟', '8 分钟'], ansIdx: 1, chain: '洗水壶 1 分钟 → 接水 1 分钟 → 烧水 8 分钟 → 沏茶 1 分钟 = 11 分钟', note: '烧水 8 分钟是最长的一段：洗茶杯和找茶叶填进烧水的时间里，不加时间。总时间由最长的链决定。' },
      { label: '提高', q: '煮粥 10 分钟，期间洗脸 3 分钟、穿衣 2 分钟，粥好后盛粥 1 分钟。一共几分钟？', opts: ['16 分钟', '11 分钟', '10 分钟'], ansIdx: 1, chain: '煮粥 10 分钟 → 盛粥 1 分钟 = 11 分钟', note: '洗脸和穿衣都填进煮粥的 10 分钟里，不加时间：关键路径是煮粥 → 盛粥。' },
      { label: '挑战', q: '洗水壶 1 分钟，接水 1 分钟，烧水 8 分钟，洗茶杯 2 分钟，找茶叶 1 分钟，沏茶 1 分钟（须等水开），但这回只有一个人、一个水壶。最少几分钟？', opts: ['12 分钟', '11 分钟', '9 分钟'], ansIdx: 1, chain: '洗水壶 1 分钟 → 接水 1 分钟 → 烧水 8 分钟 → 沏茶 1 分钟 = 11 分钟', note: '关键路径还是烧水那条链：洗茶杯、找茶叶再短也省不了烧水的时间；想更快，只能让烧水本身变短。' }
    ];
    var li = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 4 年级 · 优化</p>' +
      '<h3>总时间由最长的链决定</h3>' +
      '<p>几件事，有的必须一件一件来，有的可以同时做。总时间不是把所有时间加起来，而是看最长的那条链有多长。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：最少几分钟？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“找最长链”，看哪条链决定了总时间。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-chain" type="button">找最长链</button></div>' +
      '<p id="' + K + '-chain-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“找最长链”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 沏茶</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 煮粥</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 关键路径</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“先找最长的链，其他事填进空闲，总时间由最长的链决定”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.q;
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var c = gid(K + '-chain-tx'); if (c) c.textContent = '';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜最少 ' + LEVELS[li].opts[i] + '。点“找最长链”验证。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-chain').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：最少几分钟？'); return; }
      var L = LEVELS[li];
      var c = gid(K + '-chain-tx');
      if (c) c.textContent = '最长的链：' + L.chain + '。';
      if (guessed === L.ansIdx) {
        msg('对了：' + L.chain + '。' + L.note);
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('最长的链是：' + L.chain + '。你猜的是 ' + L.opts[guessed] + '。' + L.note);
      }
    });
    function setLevel(i) {
      li = i; guessed = -1;
      draw();
      msg('先猜一猜，再点“找最长链”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：沏茶 11 分钟', '提高：煮粥 11 分钟', '挑战：关键路径 11 分钟'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
