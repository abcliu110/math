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

/* 4.9–4.17：与已有演示实质相同的方法跳过（见各段注释），只做真正新的方法，同样先猜 → 玩 → 说，三档。 */
/* 4.9 四则运算：4 种方法全跳过——逆运算证伪已有 zerodiv；括号分组改写已有 op-bracket（拖括号改结果）+ mixop（条形分堆）；先乘除后加减已有 mixop（先算哪一堆，2.10 的演示）；填符号游戏已有 twentyfour（24 点，实验室问题）。本点不新增。 */
/* 4.10 运算定律：跳过阵列旋转（laws 乘法点阵转方向）、重新分堆（laws 结合律 + op-assoc）；做面积切长方形、反向分配。 */
registerAnim({
  key: 'm410-area',
  title: '切长方形，分配律看得见',
  sub: '6×(4+3) 是一块 6 行 7 列的长方形，从 4 列的地方切一刀，变成 6×4 和 6×3 两块，面积加起来还是整块。',
  grade: 4,
  kind: '模拟',
  points: ['4.10'],
  render: function (el) {
    var K = 'm410-area';
    var LEVELS = [
      { label: '基础', a: 6, b: 4, c: 3, left: 24, right: 18, total: 42, opts: ['42', '36', '48'], ansIdx: 0 },
      { label: '提高', a: 8, b: 5, c: 6, left: 40, right: 48, total: 88, opts: ['88', '80', '96'], ansIdx: 0 },
      { label: '挑战', a: 12, b: 7, c: 3, left: 84, right: 36, total: 120, opts: ['120', '108', '132'], ansIdx: 0 }
    ];
    var li = 0, guessed = -1, cut = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 4 年级 · 运算定律</p>' +
      '<h3>切长方形，分配律看得见</h3>' +
      '<p>乘法分配律说：a×(b+c) = a×b + a×c。为什么？因为一块长方形切成两块，面积加起来还是整块。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：切开再加起来，一共是多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“切一刀”，看长方形分成两块，每块是多少。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-cut" type="button">切一刀</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“切一刀”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 6×(4+3)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 8×(5+6)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 12×(7+3)</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“长方形切成两块，面积加起来还是整块，所以 a×(b+c) = a×b + a×c”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.a + '×(' + L.b + '+' + L.c + ') 是 ' + L.a + ' 行 ' + (L.b + L.c) + ' 列的长方形，切一刀分成两块，一共是多少？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var cell = 16, x0 = 20, y0 = 20;
      var W = (L.b + L.c) * cell, H = L.a * cell, cutX = x0 + L.b * cell;
      var s = '<svg width="' + (W + 40) + '" height="' + (H + 70) + '" viewBox="0 0 ' + (W + 40) + ' ' + (H + 70) + '">';
      s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + W + '" height="' + H + '" fill="#dbeafe" stroke="#333" stroke-width="2"/>';
      if (cut) {
        s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + (L.b * cell) + '" height="' + H + '" fill="#93c5fd" stroke="#333" stroke-width="2"/>';
        s += '<rect x="' + cutX + '" y="' + y0 + '" width="' + (L.c * cell) + '" height="' + H + '" fill="#fcd34d" stroke="#333" stroke-width="2"/>';
        s += '<line x1="' + cutX + '" y1="' + y0 + '" x2="' + cutX + '" y2="' + (y0 + H) + '" stroke="#e11d48" stroke-width="3"/>';
        s += '<text x="' + (x0 + L.b * cell / 2) + '" y="' + (y0 + H / 2) + '" text-anchor="middle" font-size="16">' + L.a + '×' + L.b + '=' + L.left + '</text>';
        s += '<text x="' + (cutX + L.c * cell / 2) + '" y="' + (y0 + H / 2) + '" text-anchor="middle" font-size="16">' + L.a + '×' + L.c + '=' + L.right + '</text>';
        s += '<text x="' + (x0 + W / 2) + '" y="' + (y0 + H + 30) + '" text-anchor="middle" font-size="16">' + L.left + '+' + L.right + '=' + L.total + '</text>';
      } else {
        s += '<text x="' + (x0 + W / 2) + '" y="' + (y0 + H / 2) + '" text-anchor="middle" font-size="16">' + L.a + '×(' + L.b + '+' + L.c + ')=？</text>';
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
      msg('你猜一共是 ' + LEVELS[li].opts[i] + '。点“切一刀”，看两块面积加起来是多少。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-cut').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：一共是多少？'); return; }
      var L = LEVELS[li];
      cut = true;
      draw();
      if (guessed === L.ansIdx) {
        msg('切开了：' + L.left + '+' + L.right + '=' + L.total + '，你猜对了！长方形切成两块，面积加起来还是整块。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('切开了：' + L.left + '+' + L.right + '=' + L.total + '，你猜的是 ' + L.opts[guessed] + '。两块加起来才是整块的面积。');
      }
    });
    function setLevel(i) {
      li = i; guessed = -1; cut = false;
      draw();
      msg('先猜一猜，再点“切一刀”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：6×(4+3)=42', '提高：8×(5+6)=88', '挑战：12×(7+3)=120'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
registerAnim({
  key: 'm410-factor',
  title: '合起来再算：反向分配',
  sub: '25×36 + 25×64，分开算要算两次乘法；合起来先算 36+64=100，再算 25×100，一步就到 2500。',
  grade: 4,
  kind: '模拟',
  points: ['4.10'],
  render: function (el) {
    var K = 'm410-factor';
    var LEVELS = [
      { label: '基础', f: 25, x: 36, y: 64, px: 900, py: 1600, total: 2500, opts: ['36+64=100', '25+25=50', '36×64'], ansIdx: 0 },
      { label: '提高', f: 17, x: 43, y: 57, px: 731, py: 969, total: 1700, opts: ['43+57=100', '17+17=34', '43×57'], ansIdx: 0 },
      { label: '挑战', f: 125, x: 18, y: 82, px: 2250, py: 10250, total: 12500, opts: ['18+82=100', '125+125=250', '18×82'], ansIdx: 0 }
    ];
    var li = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 4 年级 · 运算定律</p>' +
      '<h3>合起来再算：反向分配</h3>' +
      '<p>两个乘法里都有同一个数，就可以把它提出来，先把另外两个数加起来：a×b + a×c = a×(b+c)。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：合起来算，第一步先算什么？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“合起来算”，再点“分开算”，比一比哪条路短。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-join" type="button">合起来算</button>' +
      '<button class="btn small ghost" id="' + K + '-split" type="button">分开算</button></div>' +
      '<p id="' + K + '-steps"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“合起来算”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 25×36+25×64</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 17×43+17×57</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 125×18+125×82</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“两个乘法有相同的数，就提出来先加：a×b + a×c = a×(b+c)”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function steps(t) { var m = gid(K + '-steps'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.f + '×' + L.x + ' + ' + L.f + '×' + L.y + ' = ？两个乘法里都有 ' + L.f + '。';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      steps('');
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜第一步先算 ' + LEVELS[li].opts[i] + '。点“合起来算”验证一下。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-join').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：合起来第一步先算什么？'); return; }
      var L = LEVELS[li];
      steps(L.f + '×' + L.x + ' + ' + L.f + '×' + L.y + ' = ' + L.f + '×(' + L.x + '+' + L.y + ') = ' + L.f + '×100 = ' + L.total + '。');
      if (guessed === L.ansIdx) {
        msg('对了！先算 ' + L.x + '+' + L.y + '=100，再算 ' + L.f + '×100=' + L.total + '。两个乘法合成一个，路一下子短了。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('合起来是先算 ' + L.x + '+' + L.y + '=100，再算 ' + L.f + '×100=' + L.total + '。提出来的是相同的数 ' + L.f + '，不是把它加起来。');
      }
    });
    gid(K + '-split').addEventListener('click', function () {
      var L = LEVELS[li];
      steps(L.f + '×' + L.x + '=' + L.px + '，' + L.f + '×' + L.y + '=' + L.py + '，' + L.px + '+' + L.py + '=' + L.total + '。分开算也行，但要算两次乘法。');
      msg('分开算：' + L.px + '+' + L.py + '=' + L.total + '，答案一样，路更长。合起来算只要一步乘法。');
    });
    function setLevel(i) {
      li = i; guessed = -1;
      draw();
      msg('先猜一猜，再点“合起来算”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：25×36+25×64=2500', '提高：17×43+17×57=1700', '挑战：125×18+125×82=12500'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
/* 4.11 小数的意义和性质：跳过数位滑块法、十分条再切十份法（placeslider：滑小数点 + 拆分小格看 0.5=0.50）；做钱的模型法、数轴放大法。 */
registerAnim({
  key: 'm411-money',
  title: '钱里找小数：元角分',
  sub: '1.35 元就是 1 元 3 角 5 分：小数点左边是个位（元），右边第一位是十分位（角），第二位是百分位（分）。',
  grade: 4,
  kind: '演示',
  points: ['4.11'],
  render: function (el) {
    var K = 'm411-money';
    var LEVELS = [
      { label: '基础', val: '1.35', yuan: 1, jiao: 3, fen: 5, opts: ['1元3角5分', '1元5角3分', '3元1角5分'], ansIdx: 0, note: '1.35元 = 1元 + 3角 + 5分：小数点左边是个位（元），右边第一位是十分位（角），第二位是百分位（分）。' },
      { label: '提高', val: '2.08', yuan: 2, jiao: 0, fen: 8, opts: ['2元8分', '2元8角', '2元80分'], ansIdx: 0, note: '十分位是 0，就是 0 角，不能省——2.08元是 2元零8分。0 在中间占着位置。' },
      { label: '挑战', val: '0.75', yuan: 0, jiao: 7, fen: 5, opts: ['7角5分', '7元5角', '75角'], ansIdx: 0, note: '0.75元不到 1 元：7角5分。0.75 = 75个0.01，1元 = 10角 = 100分。' }
    ];
    var li = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 4 年级 · 小数的意义和性质</p>' +
      '<h3>钱里找小数：元角分</h3>' +
      '<p>小数不是凭空来的：1 元 = 10 角 = 100 分，所以 0.1 元是 1 角，0.01 元是 1 分。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：这个钱数用元角分怎么说？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“拆开看看”，数一数有几元、几角、几分。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-open" type="button">拆开看看</button></div>' +
      '<div id="' + K + '-coins"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“拆开看看”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 1.35元</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 2.08元</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 0.75元</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“小数点左边是元，右边第一位是角，第二位是分”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.val + '元，用元、角、分怎么说？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var box = gid(K + '-coins'); if (box) box.innerHTML = '';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜是 ' + LEVELS[li].opts[i] + '。点“拆开看看”，数一数钱包里的钱。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-open').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：这个钱数用元角分怎么说？'); return; }
      var L = LEVELS[li];
      var box = gid(K + '-coins');
      if (box) {
        box.innerHTML = '<p>1元硬币 × ' + L.yuan + '　1角硬币 × ' + L.jiao + '　1分硬币 × ' + L.fen + '</p>' +
          '<p>数位表：个位（元）' + L.yuan + '　十分位（角）' + L.jiao + '　百分位（分）' + L.fen + '</p>';
      }
      if (guessed === L.ansIdx) {
        msg('对了！' + L.note);
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('拆开看：' + L.note + '你猜的是 ' + L.opts[guessed] + '。');
      }
    });
    function setLevel(i) {
      li = i; guessed = -1;
      draw();
      msg('先猜一猜，再点“拆开看看”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：1.35元=1元3角5分', '提高：2.08元=2元0角8分', '挑战：0.75元=7角5分'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
registerAnim({
  key: 'm411-zoom',
  title: '数轴放大镜：0.3 和 0.30 是同一个点',
  sub: '0 到 1 的数轴上找到 0.3，再把 0.2 到 0.4 这一段放大：0.3 和 0.30 落在同一个点上。',
  grade: 4,
  kind: '模拟',
  points: ['4.11'],
  render: function (el) {
    var K = 'm411-zoom';
    var LEVELS = [
      { label: '基础', target: '0.3', idx: 3, zoom: false, opts: ['0.2', '0.3', '0.4'], ansIdx: 1, zoomNote: '放大 0.2 到 0.4 这一段：0.3 和 0.30 是同一个点——3 个 0.1 就是 30 个 0.01。' },
      { label: '提高', target: '0.7', idx: 7, zoom: false, opts: ['0.6', '0.7', '0.8'], ansIdx: 1, zoomNote: '放大 0.6 到 0.8 这一段：0.7 和 0.70 是同一个点——7 个 0.1 就是 70 个 0.01。' },
      { label: '挑战', target: '0.05', idx: 5, zoom: true, opts: ['0.04', '0.05', '0.06'], ansIdx: 1, zoomNote: '0 到 0.1 这一小段放大：0.05 在正中间——5 个 0.01。0.05 比 0.1 小，比 0 大。' }
    ];
    var li = 0, guessed = -1, zoomed = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 4 年级 · 小数的意义和性质</p>' +
      '<h3>数轴放大镜：0.3 和 0.30 是同一个点</h3>' +
      '<p>小数在数轴上有自己的位置。0.3 在哪？放大了看，它和 0.30 是同一个点吗？</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：目标小数在哪个刻度上？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“放大看看”，那一段被放大 10 倍，目标点标成红色。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-zoom" type="button">放大看看</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“放大看看”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 找 0.3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 找 0.7</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 找 0.05</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“0.3 和 0.30 是同一个点，小数末尾添 0 大小不变”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function lab(i) {
      var L = LEVELS[li];
      if (L.zoom) {
        if (i === 0) return '0';
        if (i === 10) return '0.10';
        return '0.0' + i;
      }
      if (i === 0) return '0';
      if (i === 10) return '1';
      return '0.' + i;
    }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.zoom ? '数轴上 0 到 0.1 这一小段被放大了：' + L.target + ' 在哪个刻度上？' : '数轴 0 到 1，每小格是 0.1：' + L.target + ' 在哪个刻度上？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var s = '<svg width="360" height="80" viewBox="0 0 360 80">';
      s += '<line x1="20" y1="40" x2="340" y2="40" stroke="#333" stroke-width="2"/>';
      for (var i = 0; i <= 10; i++) {
        var x = 20 + i * 32;
        var hot = zoomed && i === L.idx;
        s += '<line x1="' + x + '" y1="32" x2="' + x + '" y2="48" stroke="' + (hot ? '#e11d48' : '#333') + '" stroke-width="' + (hot ? 4 : 2) + '"/>';
        s += '<text x="' + x + '" y="66" text-anchor="middle" font-size="12">' + lab(i) + '</text>';
        if (hot) s += '<circle cx="' + x + '" cy="40" r="6" fill="#e11d48"/>';
      }
      if (zoomed) s += '<text x="180" y="18" text-anchor="middle" font-size="14">' + L.target + ' 在这里</text>';
      s += '</svg>';
      var box = gid(K + '-svg'); if (box) box.innerHTML = s;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜 ' + LEVELS[li].target + ' 在 ' + LEVELS[li].opts[i] + ' 的刻度上。点“放大看看”验证一下。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-zoom').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：目标小数在哪个刻度上？'); return; }
      var L = LEVELS[li];
      zoomed = true;
      draw();
      if (guessed === L.ansIdx) {
        msg('对了，红点就是 ' + L.target + '。' + L.zoomNote);
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('红点才是 ' + L.target + '，你猜的是 ' + L.opts[guessed] + '。' + L.zoomNote);
      }
    });
    function setLevel(i) {
      li = i; guessed = -1; zoomed = false;
      draw();
      msg('先猜一猜，再点“放大看看”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：0.3 = 0.30', '提高：0.7 = 0.70', '挑战：0.05 在 0 到 0.1 正中间'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});

/* 4.12 三角形：跳过撕角拼直线法、棍长测试法（tearangle：撕角拼平角 + 三根棍子调长度试围）；做三 copy 旋转拼法、拖顶点量角恒定法。 */
registerAnim({
  key: 'm412-threecopy',
  title: '三个三角形拼一条直线',
  sub: '拿 3 个一模一样的三角形，各出一个角，拼到一条直线上：三个角加起来正好是平角 180°。',
  grade: 4,
  kind: '演示',
  points: ['4.12'],
  render: function (el) {
    var K = 'm412-threecopy';
    var LEVELS = [
      { label: '基础', a: 50, b: 60, c: 70, opts: ['90°', '180°', '360°'], ansIdx: 1 },
      { label: '提高', a: 90, b: 45, c: 45, opts: ['90°', '180°', '360°'], ansIdx: 1 },
      { label: '挑战', a: 80, b: 60, c: 40, opts: ['90°', '180°', '360°'], ansIdx: 1 }
    ];
    var li = 0, guessed = -1, assembled = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 4 年级 · 三角形</p>' +
      '<h3>三个三角形拼一条直线</h3>' +
      '<p>三角形有 3 个角。如果拿 3 个一模一样的三角形，各出一个角拼到一起，会拼成什么？</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：三个角拼起来是几度？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“旋转拼起来”，3 个三角形各转一下，三个角拼到一条直线上。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-assemble" type="button">旋转拼起来</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“旋转拼起来”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 50°、60°、70°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 90°、45°、45°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 80°、60°、40°</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“三个角拼成一条直线，就是平角 180°，所以三角形内角和是 180°”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function rad(d) { return d * Math.PI / 180; }
    function pts(list) {
      var s = '';
      for (var i = 0; i < list.length; i++) s += Math.round(list[i][0]) + ',' + Math.round(list[i][1]) + (i + 1 < list.length ? ' ' : '');
      return s;
    }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = '这个三角形的三个角是 ' + L.a + '°、' + L.b + '°、' + L.c + '°。拿 3 个这样的三角形拼一拼，三个角加起来是几度？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var base = 100;
      var cSide = base * Math.sin(rad(L.c)) / Math.sin(rad(L.a));
      var ax = cSide * Math.cos(rad(L.b)), ay = -cSide * Math.sin(rad(L.b));
      var s = '';
      if (!assembled) {
        var bx = 60, by = 180;
        s = '<svg width="400" height="230" viewBox="0 0 400 230">';
        s += '<polygon points="' + pts([[bx, by], [bx + base, by], [bx + ax, by + ay]]) + '" fill="#dbeafe" stroke="#333" stroke-width="2"/>';
        s += '<text x="' + (bx + ax) + '" y="' + (by + ay - 10) + '" text-anchor="middle" font-size="14">A ' + L.a + '°</text>';
        s += '<text x="' + (bx - 8) + '" y="' + (by + 20) + '" text-anchor="middle" font-size="14">B ' + L.b + '°</text>';
        s += '<text x="' + (bx + base + 8) + '" y="' + (by + 20) + '" text-anchor="middle" font-size="14">C ' + L.c + '°</text>';
        s += '<text x="200" y="215" text-anchor="middle" font-size="14">1 个三角形，3 个角：' + L.a + '°、' + L.b + '°、' + L.c + '°</text>';
        s += '</svg>';
      } else {
        var ox = 200, oy = 170;
        var p1 = [[0, 0], [base, 0], [ax, ay]];
        var p2 = [[0, 0], [-base, 0], [ax - base, ay]];
        var p3 = [[0, 0], [-ax, -ay], [base - ax, -ay]];
        s = '<svg width="400" height="230" viewBox="0 0 400 230">';
        s += '<line x1="20" y1="' + oy + '" x2="380" y2="' + oy + '" stroke="#333" stroke-width="2"/>';
        s += '<g transform="translate(' + ox + ',' + oy + ') rotate(' + (180 + L.b) + ')"><polygon points="' + pts(p1) + '" fill="#93c5fd" stroke="#333" stroke-width="2"/></g>';
        s += '<g transform="translate(' + ox + ',' + oy + ') rotate(' + L.b + ')"><polygon points="' + pts(p2) + '" fill="#86efac" stroke="#333" stroke-width="2"/></g>';
        s += '<g transform="translate(' + ox + ',' + oy + ') rotate(' + (180 + L.b) + ')"><polygon points="' + pts(p3) + '" fill="#fcd34d" stroke="#333" stroke-width="2"/></g>';
        var mids = [180 + L.b / 2, 180 + L.b + L.c / 2, 180 + L.b + L.c + L.a / 2];
        var labs = [L.b, L.c, L.a];
        for (var i = 0; i < 3; i++) {
          var lx = ox + 58 * Math.cos(rad(mids[i])), ly = oy + 58 * Math.sin(rad(mids[i]));
          s += '<text x="' + Math.round(lx) + '" y="' + Math.round(ly) + '" text-anchor="middle" font-size="14">' + labs[i] + '°</text>';
        }
        s += '<text x="200" y="215" text-anchor="middle" font-size="14">' + L.a + '° + ' + L.b + '° + ' + L.c + '° = 180°</text>';
        s += '</svg>';
      }
      var box = gid(K + '-svg'); if (box) box.innerHTML = s;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜三个角拼起来是 ' + LEVELS[li].opts[i] + '。点“旋转拼起来”验证一下。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-assemble').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：三个角拼起来是几度？'); return; }
      var L = LEVELS[li];
      assembled = true;
      draw();
      if (guessed === L.ansIdx) {
        msg('拼好了：' + L.a + '° + ' + L.b + '° + ' + L.c + '° = 180°，三个角正好拼成一条直线！你猜对了。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('拼好了：' + L.a + '° + ' + L.b + '° + ' + L.c + '° = 180°，三个角正好拼成一条直线，你猜的是 ' + L.opts[guessed] + '。');
      }
    });
    function setLevel(i) {
      li = i; guessed = -1; assembled = false;
      draw();
      msg('先猜一猜，再点“旋转拼起来”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：50+60+70=180', '提高：90+45+45=180', '挑战：80+60+40=180'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
registerAnim({
  key: 'm412-drag',
  title: '拖顶点，角变了，和还是 180°',
  sub: '拖动三角形的顶点，三个角都变了，可它们的和永远是 180°：角可以互相“让”，总数不会变。',
  grade: 4,
  kind: '模拟',
  points: ['4.12'],
  render: function (el) {
    var K = 'm412-drag';
    var LEVELS = [
      { label: '基础', a: 50, b: 60, c: 70 },
      { label: '提高', a: 90, b: 45, c: 45 },
      { label: '挑战', a: 110, b: 40, c: 30 }
    ];
    var li = 0, guessed = -1, changed = false, tiers = null;
    var B = [60, 230], C = [200, 230], A = [0, 0];
    var dragging = false;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 4 年级 · 三角形</p>' +
      '<h3>拖顶点，角变了，和还是 180°</h3>' +
      '<p>三角形的顶点可以拖来拖去：一个角变大，别的角就变小。三个角的和会变吗？</p>' +
      '<p>第 1 步 · 先猜：拖动顶点，三个角的和会变吗？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-change" type="button">会变</button>' +
      '<button class="btn small primary" id="' + K + '-guess-same" type="button">不变，还是 180°</button></div>' +
      '<p>第 2 步 · 玩一玩：拖动红色的顶点 A（也可以点“换一个三角形”），看三个角怎么变。</p>' +
      '<div class="btn-row"><button class="btn small ghost" id="' + K + '-next" type="button">换一个三角形</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-read"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拖一拖顶点 A。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 50°、60°、70°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 90°、45°、45°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 110°、40°、30°</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“拖动顶点，三个角会变，但和永远是 180°”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function rad(d) { return d * Math.PI / 180; }
    function fmt(n) { return String(Math.round(n * 10) / 10); }
    function angleAt(P, Q, R) {
      var v1x = P[0] - Q[0], v1y = P[1] - Q[1];
      var v2x = R[0] - Q[0], v2y = R[1] - Q[1];
      var dot = v1x * v2x + v1y * v2y;
      var cross = v1x * v2y - v1y * v2x;
      return Math.atan2(Math.abs(cross), dot) * 180 / Math.PI;
    }
    function presetA() {
      var L = LEVELS[li];
      var base = C[0] - B[0];
      var cSide = base * Math.sin(rad(L.c)) / Math.sin(rad(L.a));
      A = [B[0] + cSide * Math.cos(rad(L.b)), B[1] - cSide * Math.sin(rad(L.b))];
    }
    function draw() {
      var angA = angleAt(B, A, C), angB = angleAt(A, B, C), angC = angleAt(A, C, B);
      var sum = angA + angB + angC;
      var s = '<svg id="' + K + '-board" width="340" height="260" viewBox="0 0 340 260">';
      s += '<polygon points="' + Math.round(A[0]) + ',' + Math.round(A[1]) + ' ' + B[0] + ',' + B[1] + ' ' + C[0] + ',' + C[1] + '" fill="#dbeafe" stroke="#333" stroke-width="2"/>';
      s += '<circle id="' + K + '-vertex" cx="' + Math.round(A[0]) + '" cy="' + Math.round(A[1]) + '" r="10" fill="#e11d48"/>';
      s += '<text x="' + Math.round(A[0]) + '" y="' + (Math.round(A[1]) - 14) + '" text-anchor="middle" font-size="14">A ' + fmt(angA) + '°</text>';
      s += '<text x="' + (B[0] - 6) + '" y="' + (B[1] + 20) + '" text-anchor="middle" font-size="14">B ' + fmt(angB) + '°</text>';
      s += '<text x="' + (C[0] + 6) + '" y="' + (C[1] + 20) + '" text-anchor="middle" font-size="14">C ' + fmt(angC) + '°</text>';
      s += '</svg>';
      var box = gid(K + '-svg'); if (box) box.innerHTML = s;
      var r = gid(K + '-read');
      if (r) r.textContent = '∠A ' + fmt(angA) + '° + ∠B ' + fmt(angB) + '° + ∠C ' + fmt(angC) + '° = ' + fmt(sum) + '°';
      var v = gid(K + '-vertex');
      if (v) v.addEventListener('mousedown', function (e) {
        dragging = true;
        if (e && e.preventDefault) e.preventDefault();
      });
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function judge() {
      if (guessed < 0) { msg('先猜一猜：拖动顶点，三个角的和会变吗？'); return; }
      if (!changed) { msg('拖一拖顶点 A，或者点“换一个三角形”，再看三个角的和。'); return; }
      if (guessed === 1) {
        msg('看：三个角都变了，和还是 180°！你猜对了。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('看：三个角都变了，和还是 180°。一个角变大，别的角就变小，总数不会变。');
      }
    }
    gid(K + '-guess-change').addEventListener('click', function () { guessed = 0; msg('你猜和会变。拖一拖顶点 A，看看和到底变不变。'); });
    gid(K + '-guess-same').addEventListener('click', function () { guessed = 1; msg('你猜和不变，还是 180°。拖一拖顶点 A 验证一下。'); });
    gid(K + '-next').addEventListener('click', function () {
      li = (li + 1) % 3;
      presetA();
      changed = true;
      draw();
      judge();
    });
    function setLevel(i) {
      li = i; guessed = -1; changed = false;
      presetA();
      draw();
      msg('先猜一猜，再拖一拖顶点 A。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof document !== 'undefined' && document.addEventListener) {
      document.addEventListener('mousemove', function (e) {
        if (!dragging) return;
        var board = gid(K + '-board');
        if (!board || !board.getBoundingClientRect) return;
        var r = board.getBoundingClientRect();
        var x = e.clientX - r.left, y = e.clientY - r.top;
        var sx = 340 / r.width, sy = 260 / r.height;
        x = Math.max(20, Math.min(320, x * sx));
        y = Math.max(20, Math.min(215, y * sy));
        A = [x, y];
        changed = true;
        draw();
      });
      document.addEventListener('mouseup', function () {
        if (dragging) { dragging = false; judge(); }
      });
    }
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：拖动顶点，和还是 180°', '提高：直角三角形也一样', '挑战：钝角三角形也一样'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    presetA();
    draw();
  }
});

/* 4.13 小数的加法和减法：跳过数位表对齐竖式法（decadd：小数点对齐竖式）；做钱的模型法、十分条/百分条拼加法、整数迁移法。 */
registerAnim({
  key: 'm413-money',
  title: '用钱算小数加减',
  sub: '2.5 元 + 1.3 元：元和元加，角和角加，3 元 8 角就是 3.8 元。减法不够减，就从角里退 1 角当 10 分。',
  grade: 4,
  kind: '演示',
  points: ['4.13'],
  render: function (el) {
    var K = 'm413-money';
    var LEVELS = [
      { label: '基础', a: '2.5', b: '1.3', op: '+', ans: '3.8', opts: ['3.8', '3.6', '2.8'], ansIdx: 0,
        steps: ['2元 + 1元 = 3元', '5角 + 3角 = 8角', '3元8角 = 3.8元'] },
      { label: '提高', a: '1.35', b: '2.4', op: '+', ans: '3.75', opts: ['3.75', '3.65', '3.85'], ansIdx: 0,
        steps: ['1元 + 2元 = 3元', '3角 + 4角 = 7角', '5分 + 0分 = 5分', '3元7角5分 = 3.75元'] },
      { label: '挑战', a: '4.6', b: '1.25', op: '−', ans: '3.35', opts: ['3.35', '3.45', '3.25'], ansIdx: 0,
        steps: ['4元 − 1元 = 3元', '6角 − 2角 = 4角，0分不够减 5分', '从 4角退 1角当 10分：10分 − 5分 = 5分，还剩 3角', '3元3角5分 = 3.35元'] }
    ];
    var li = 0, guessed = -1, shown = 0, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 4 年级 · 小数的加法和减法</p>' +
      '<h3>用钱算小数加减</h3>' +
      '<p>小数加减就是元角分加减：元对元，角对角，分对分。角满 10 进 1 元，分不够减就从角里退。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：答案是多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“算一算”，一步一步看元、角、分怎么加减。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-next" type="button">算一算</button></div>' +
      '<div id="' + K + '-steps"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“算一算”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 2.5+1.3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 1.35+2.4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 4.6−1.25</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“元对元，角对角，分对分；不够减就从高一位退 1”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.a + '元 ' + L.op + ' ' + L.b + '元 = ？元';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var box = gid(K + '-steps');
      if (box) {
        var s = '';
        for (var i = 0; i < shown; i++) s += '<p>' + L.steps[i] + '</p>';
        if (!shown) s = '<p>还没有开始算。</p>';
        box.innerHTML = s;
      }
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜答案是 ' + LEVELS[li].opts[i] + ' 元。点“算一算”，一步一步验证。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-next').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：答案是多少？'); return; }
      var L = LEVELS[li];
      if (shown >= L.steps.length) { msg('算完了：答案是 ' + L.ans + ' 元。元对元，角对角，分对分。'); return; }
      shown++;
      draw();
      if (shown === L.steps.length) {
        if (guessed === L.ansIdx) {
          msg('算完了：答案是 ' + L.ans + ' 元，你猜对了！');
          if (tiers) tiers.done(li);
          if (typeof markTried === 'function') markTried(K);
        } else {
          msg('算完了：答案是 ' + L.ans + ' 元，你猜的是 ' + L.opts[guessed] + ' 元。元、角、分要各算各的。');
        }
      } else {
        msg('继续点“算一算”，看下一步。');
      }
    });
    function setLevel(i) {
      li = i; guessed = -1; shown = 0;
      draw();
      msg('先猜一猜，再点“算一算”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：2.5+1.3=3.8', '提高：1.35+2.4=3.75', '挑战：4.6−1.25=3.35'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
registerAnim({
  key: 'm413-bars',
  title: '十分条百分条拼起来加',
  sub: '0.4 是 4 个 0.1，0.3 是 3 个 0.1，拼起来 7 个 0.1 就是 0.7。满 10 个 0.01 换 1 个 0.1。',
  grade: 4,
  kind: '模拟',
  points: ['4.13'],
  render: function (el) {
    var K = 'm413-bars';
    var LEVELS = [
      { label: '基础', a: '0.4', b: '0.3', at: 4, ah: 0, bt: 3, bh: 0, ans: '0.7', opts: ['0.7', '0.43', '0.1'], ansIdx: 0,
        note: '0.4 是 4 个 0.1，0.3 是 3 个 0.1，合起来 7 个 0.1 = 0.7。' },
      { label: '提高', a: '0.25', b: '0.4', at: 2, ah: 5, bt: 4, bh: 0, ans: '0.65', opts: ['0.65', '0.29', '0.6'], ansIdx: 0,
        note: '0.25 是 25 个 0.01，0.4 是 40 个 0.01，合起来 65 个 0.01 = 0.65。' },
      { label: '挑战', a: '0.68', b: '0.57', at: 6, ah: 8, bt: 5, bh: 7, ans: '1.25', opts: ['1.25', '0.125', '1.15'], ansIdx: 0,
        note: '68 个 0.01 + 57 个 0.01 = 125 个 0.01；100 个 0.01 是 1，剩下 25 个 0.01，所以是 1.25。' }
    ];
    var li = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 4 年级 · 小数的加法和减法</p>' +
      '<h3>十分条百分条拼起来加</h3>' +
      '<p>小数加法就是拼条子：十分条和十分条拼，百分条和百分条拼；满 10 个小的换 1 个大的。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：拼起来是多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“拼起来”，看两条条子拼成一条，满 10 就换。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-join" type="button">拼起来</button></div>' +
      '<div id="' + K + '-bars"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“拼起来”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 0.4+0.3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 0.25+0.4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 0.68+0.57</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“十分条拼十分条，百分条拼百分条，满 10 个小的换 1 个大的”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function strip(filled, color) {
      var s = '<div>';
      for (var i = 0; i < 10; i++) {
        s += '<span style="display:inline-block;width:18px;height:18px;border:1px solid #666;background:' + (i < filled ? color : '#fff') + '"></span>';
      }
      s += '</div>';
      return s;
    }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.a + ' + ' + L.b + ' = ？先看两条条子各有几格。';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var box = gid(K + '-bars');
      if (box) {
        box.innerHTML = '<p>' + L.a + '：十分条</p>' + strip(L.at, '#93c5fd') +
          '<p>百分条</p>' + strip(L.ah, '#86efac') +
          '<p>' + L.b + '：十分条</p>' + strip(L.bt, '#fcd34d') +
          '<p>百分条</p>' + strip(L.bh, '#fca5a5');
      }
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜拼起来是 ' + LEVELS[li].opts[i] + '。点“拼起来”，看条子怎么合。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-join').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：拼起来是多少？'); return; }
      var L = LEVELS[li];
      var box = gid(K + '-bars');
      if (box) {
        box.innerHTML = '<p>十分条：' + L.at + ' + ' + L.bt + ' = ' + (L.at + L.bt) + ' 个 0.1</p>' +
          '<p>百分条：' + L.ah + ' + ' + L.bh + ' = ' + (L.ah + L.bh) + ' 个 0.01</p>' +
          '<p>合起来是 ' + L.ans + '</p>';
      }
      if (guessed === L.ansIdx) {
        msg('对了！' + L.note + '你猜对了。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg(L.note + '你猜的是 ' + L.opts[guessed] + '。');
      }
    });
    function setLevel(i) {
      li = i; guessed = -1;
      draw();
      msg('先猜一猜，再点“拼起来”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：0.4+0.3=0.7', '提高：0.25+0.4=0.65', '挑战：0.68+0.57=1.25'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
registerAnim({
  key: 'm413-units',
  title: '小数加减，想成整数加减',
  sub: '0.4 + 0.3：想成 4 个 0.1 加 3 个 0.1，就是 7 个 0.1。数单位个数，和整数加法一模一样。',
  grade: 4,
  kind: '模拟',
  points: ['4.13'],
  render: function (el) {
    var K = 'm413-units';
    var LEVELS = [
      { label: '基础', a: '0.4', b: '0.3', op: '+', unit: '0.1', ca: 4, cb: 3, total: 7, ans: '0.7', q: '0.4 是几个 0.1？', opts: ['4', '40', '0.4'], ansIdx: 0 },
      { label: '提高', a: '2.35', b: '1.2', op: '+', unit: '0.01', ca: 235, cb: 120, total: 355, ans: '3.55', q: '2.35 是几个 0.01？', opts: ['235', '23', '25'], ansIdx: 0 },
      { label: '挑战', a: '1.8', b: '0.65', op: '−', unit: '0.01', ca: 180, cb: 65, total: 115, ans: '1.15', q: '1.8 是几个 0.01？', opts: ['18', '180', '108'], ansIdx: 1 }
    ];
    var li = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 4 年级 · 小数的加法和减法</p>' +
      '<h3>小数加减，想成整数加减</h3>' +
      '<p>小数加减有个窍门：先数一数有几个计数单位，单位个数加减就是整数加减，最后再变回小数。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：第一个数是几个计数单位？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“换成数单位”，看小数变整数，再变回来。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-convert" type="button">换成数单位</button></div>' +
      '<div id="' + K + '-steps"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“换成数单位”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 0.4+0.3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 2.35+1.2</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 1.8−0.65</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“小数加减就是数单位个数，和整数加减一样”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.a + ' ' + L.op + ' ' + L.b + ' = ？' + L.q;
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var box = gid(K + '-steps'); if (box) box.innerHTML = '';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜是 ' + LEVELS[li].opts[i] + ' 个。点“换成数单位”验证一下。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-convert').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：第一个数是几个计数单位？'); return; }
      var L = LEVELS[li];
      var box = gid(K + '-steps');
      var opWord = L.op === '+' ? '+' : '−';
      if (box) {
        box.innerHTML = '<p>' + L.a + ' = ' + L.ca + ' 个 ' + L.unit + '　' + L.b + ' = ' + L.cb + ' 个 ' + L.unit + '</p>' +
          '<p>' + L.ca + ' ' + opWord + ' ' + L.cb + ' = ' + L.total + ' 个 ' + L.unit + '</p>' +
          '<p>' + L.total + ' 个 ' + L.unit + ' = ' + L.ans + '</p>';
      }
      if (guessed === L.ansIdx) {
        msg('对了！' + L.a + ' 是 ' + L.ca + ' 个 ' + L.unit + '，' + L.ca + ' ' + opWord + ' ' + L.cb + ' = ' + L.total + '，就是 ' + L.ans + '。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg(L.a + ' 是 ' + L.ca + ' 个 ' + L.unit + '，不是 ' + L.opts[guessed] + ' 个。' + L.ca + ' ' + opWord + ' ' + L.cb + ' = ' + L.total + '，就是 ' + L.ans + '。');
      }
    });
    function setLevel(i) {
      li = i; guessed = -1;
      draw();
      msg('先猜一猜，再点“换成数单位”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：0.4+0.3=0.7', '提高：2.35+1.2=3.55', '挑战：1.8−0.65=1.15'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});

/* 4.14 图形的运动（二）：跳过网格整体拖法（moveshape：方向按钮平移小船）、折纸/镜面法（moveshape 镜面模式：点一个点，看它到对称轴两边一样远）；做找点定点连线法、数格子法。 */
registerAnim({
  key: 'm414-plot',
  title: '找点，定点，连起来',
  sub: '平移和对称不用整块搬：先找到每个顶点的新位置，点出来，再连起来，新图形就出来了。',
  grade: 4,
  kind: '实验',
  points: ['4.14'],
  render: function (el) {
    var K = 'm414-plot';
    var SHAPE = [[1, 1], [3, 1], [2, 3]];
    var LEVELS = [
      { label: '基础', move: '向右平移 2 格', targets: [[3, 1], [5, 1], [4, 3]], q: '顶点 (1,1) 向右 2 格，到哪？', opts: ['(3,1)', '(2,2)', '(1,3)'], ansIdx: 0, hint: '向右 2 格：列数加 2，行数不动。(1,1) 变成 (3,1)。' },
      { label: '提高', move: '向下平移 2 格', targets: [[1, 3], [3, 3], [2, 5]], q: '顶点 (1,1) 向下 2 格，到哪？', opts: ['(1,3)', '(3,1)', '(2,2)'], ansIdx: 0, hint: '向下 2 格：行数加 2，列数不动。(1,1) 变成 (1,3)。' },
      { label: '挑战', move: '照镜子（对称轴在格子正中间）', targets: [[6, 1], [4, 1], [5, 3]], q: '顶点 (1,1) 照镜子，到哪？', opts: ['(6,1)', '(4,1)', '(1,6)'], ansIdx: 0, hint: '对称轴在正中间：新列数 = 7 − 旧列数。(1,1) 变成 (6,1)。' }
    ];
    var li = 0, guessed = -1, found = {}, foundN = 0, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 4 年级 · 图形的运动（二）</p>' +
      '<h3>找点，定点，连起来</h3>' +
      '<p>画平移和对称图形有个笨办法，也是最稳的办法：一个顶点一个顶点找，找齐了再连起来。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：第一个顶点会跑到哪？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：在格子里点出 3 个新顶点（格子上的数字是“列，行”），点齐了再点“连起来”。</p>' +
      '<div id="' + K + '-grid"></div>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-join" type="button">连起来</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点格子找顶点。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 向右平移 2 格</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 向下平移 2 格</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 照镜子</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“画平移和对称图形：先找顶点，再连起来”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function keyOf(c, r) { return c + ',' + r; }
    function isTarget(c, r) {
      var L = LEVELS[li];
      for (var i = 0; i < L.targets.length; i++) {
        if (L.targets[i][0] === c && L.targets[i][1] === r) return true;
      }
      return false;
    }
    function updateGrid() {
      for (var r = 0; r < 6; r++) {
        for (var c = 0; c < 8; c++) {
          var b = gid(K + '-cell-' + c + '-' + r);
          if (!b) continue;
          var on = !!found[keyOf(c, r)];
          b.textContent = on ? '✓' : c + ',' + r;
          b.setAttribute('aria-pressed', String(on));
        }
      }
    }
    function buildGrid() {
      var g = '';
      for (var r = 0; r < 6; r++) {
        g += '<div class="btn-row">';
        for (var c = 0; c < 8; c++) {
          g += '<button class="btn small ghost" id="' + K + '-cell-' + c + '-' + r + '" type="button" aria-pressed="false">' + c + ',' + r + '</button>';
        }
        g += '</div>';
      }
      var box = gid(K + '-grid'); if (box) box.innerHTML = g;
      for (var r2 = 0; r2 < 6; r2++) {
        for (var c2 = 0; c2 < 8; c2++) {
          (function (cc, rr) {
            var b = gid(K + '-cell-' + cc + '-' + rr);
            if (b) b.addEventListener('click', function () { clickCell(cc, rr); });
          })(c2, r2);
        }
      }
    }
    function clickCell(c, r) {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：第一个顶点会跑到哪？'); return; }
      var k = keyOf(c, r);
      if (found[k]) return;
      if (isTarget(c, r)) {
        found[k] = true;
        foundN++;
        updateGrid();
        if (foundN === 3) msg('3 个点都找到了！点“连起来”，看看新图形。');
        else msg('找到了 ' + foundN + ' 个点，还差 ' + (3 - foundN) + ' 个。');
      } else {
        msg('(' + c + ',' + r + ') 不对。' + LEVELS[li].hint);
      }
    }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = '原来的三角形顶点是 (1,1)、(3,1)、(2,3)。' + L.move + '。' + L.q;
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var box = gid(K + '-svg'); if (box) box.innerHTML = '';
      updateGrid();
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜第一个顶点跑到 ' + LEVELS[li].opts[i] + '。在格子里点出 3 个新顶点。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-join').addEventListener('click', function () {
      if (foundN < 3) { msg('还差 ' + (3 - foundN) + ' 个顶点没找到，先在格子里点出来。'); return; }
      var L = LEVELS[li];
      var s = '<svg width="280" height="220" viewBox="0 0 280 220">';
      function poly(pts, fill) {
        var p = '';
        for (var i = 0; i < pts.length; i++) p += (20 + pts[i][0] * 30) + ',' + (20 + pts[i][1] * 30) + ' ';
        return '<polygon points="' + p + '" fill="' + fill + '" stroke="#333" stroke-width="2"/>';
      }
      s += poly(SHAPE, '#eee');
      s += poly(L.targets, '#93c5fd');
      s += '</svg>';
      var box = gid(K + '-svg'); if (box) box.innerHTML = s;
      done = true;
      if (guessed === L.ansIdx) {
        msg('连起来了！灰色是原来的三角形，蓝色是' + L.move + '后的三角形。你猜对了。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('连起来了！灰色是原来的三角形，蓝色是' + L.move + '后的三角形。第一个顶点其实在 ' + L.opts[L.ansIdx] + '，你猜的是 ' + L.opts[guessed] + '。');
      }
    });
    function setLevel(i) {
      li = i; guessed = -1; found = {}; foundN = 0; done = false;
      draw();
      msg('先猜一猜，再点格子找顶点。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：向右平移 2 格', '提高：向下平移 2 格', '挑战：照镜子'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    buildGrid();
    draw();
  }
});
registerAnim({
  key: 'm414-count',
  title: '数格子：平移了几格',
  sub: '图形平移了几格，不用猜：找一对对应的点，数一数它们之间有几格，答案就出来了。',
  grade: 4,
  kind: '演示',
  points: ['4.14'],
  render: function (el) {
    var K = 'm414-count';
    var LEVELS = [
      { label: '基础', dir: '向右', from: [[1, 1], [2, 1], [1, 2]], to: [[4, 1], [5, 1], [4, 2]], dist: 3, opts: ['2 格', '3 格', '4 格'], ansIdx: 1 },
      { label: '提高', dir: '向下', from: [[1, 1], [2, 1], [1, 2]], to: [[1, 3], [2, 3], [1, 4]], dist: 2, opts: ['1 格', '2 格', '3 格'], ansIdx: 1 },
      { label: '挑战', dir: '向左', from: [[5, 1], [6, 1], [5, 2]], to: [[1, 1], [2, 1], [1, 2]], dist: 4, opts: ['3 格', '4 格', '5 格'], ansIdx: 1 }
    ];
    var li = 0, guessed = -1, counted = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 4 年级 · 图形的运动（二）</p>' +
      '<h3>数格子：平移了几格</h3>' +
      '<p>一个图形从这里挪到那里，挪了几格？找一对对应的点——比如左上角的点——数一数它走了几格。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：这个图形平移了几格？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“数一数”，虚线把对应的点连起来，一格一格数给你看。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-count" type="button">数一数</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“数一数”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 向右移</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 向下移</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 向左移</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“找一对对应的点，数它们之间有几格，就是平移了几格”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = '灰色图形' + L.dir + '移到了蓝色图形的位置，一共移了几格？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var s = '<svg width="280" height="200" viewBox="0 0 280 200">';
      function cells(list, fill) {
        var t = '';
        for (var i = 0; i < list.length; i++) {
          t += '<rect x="' + (20 + list[i][0] * 30) + '" y="' + (20 + list[i][1] * 30) + '" width="28" height="28" fill="' + fill + '" stroke="#333" stroke-width="2"/>';
        }
        return t;
      }
      s += cells(L.from, '#ddd');
      s += cells(L.to, '#93c5fd');
      if (counted) {
        for (var j = 0; j < 2; j++) {
          var x1 = 20 + L.from[j][0] * 30 + 14, y1 = 20 + L.from[j][1] * 30 + 14;
          var x2 = 20 + L.to[j][0] * 30 + 14, y2 = 20 + L.to[j][1] * 30 + 14;
          s += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#e11d48" stroke-width="2" stroke-dasharray="5,4"/>';
        }
        var mx = (20 + L.from[0][0] * 30 + 14 + 20 + L.to[0][0] * 30 + 14) / 2;
        var my = (20 + L.from[0][1] * 30 + 14 + 20 + L.to[0][1] * 30 + 14) / 2;
        s += '<text x="' + Math.round(mx) + '" y="' + (Math.round(my) - 8) + '" text-anchor="middle" font-size="16" fill="#e11d48">' + L.dist + ' 格</text>';
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
      msg('你猜移了 ' + LEVELS[li].opts[i] + '。点“数一数”，一格一格数给你看。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-count').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：这个图形平移了几格？'); return; }
      var L = LEVELS[li];
      counted = true;
      draw();
      if (guessed === L.ansIdx) {
        msg('数出来了：对应的点之间正好 ' + L.dist + ' 格，所以图形' + L.dir + '移了 ' + L.dist + ' 格。你猜对了。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('数出来了：对应的点之间是 ' + L.dist + ' 格，不是 ' + L.opts[guessed] + '。数对应的点，别数图形的边。');
      }
    });
    function setLevel(i) {
      li = i; guessed = -1; counted = false;
      draw();
      msg('先猜一猜，再点“数一数”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：向右移 3 格', '提高：向下移 2 格', '挑战：向左移 4 格'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});

/* 4.15 平均数：跳过削峰填谷法（average：把高的分给矮的，拉平）；做跷跷板支点法、总数平分法、基准数法。 */
registerAnim({
  key: 'm415-seesaw',
  title: '跷跷板：平均数就是支点',
  sub: '把几个数当成跷跷板上的重量，支点放在哪才能平？支点的位置就是平均数。',
  grade: 4,
  kind: '模拟',
  points: ['4.15'],
  render: function (el) {
    var K = 'm415-seesaw';
    var LEVELS = [
      { label: '基础', vals: [60, 70, 80], avg: 70, opts: ['60', '70', '80'], ansIdx: 1 },
      { label: '提高', vals: [60, 80, 100], avg: 80, opts: ['70', '80', '90'], ansIdx: 1 },
      { label: '挑战', vals: [55, 75, 95], avg: 75, opts: ['65', '75', '85'], ansIdx: 1 }
    ];
    var li = 0, guessed = -1, fulcrum = 50, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 4 年级 · 平均数</p>' +
      '<h3>跷跷板：平均数就是支点</h3>' +
      '<p>平均数是数据的“平衡点”：支点放在平均数上，跷跷板就平了；放偏了，重的那边就沉下去。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：支点放在哪，跷跷板才平？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：挪支点（每次 5），再点“检查平衡”，看哪边沉下去。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-left" type="button">支点向左</button>' +
      '<button class="btn small ghost" id="' + K + '-right" type="button">支点向右</button>' +
      '<button class="btn small primary" id="' + K + '-check" type="button">检查平衡</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再挪支点。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 60、70、80</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 60、80、100</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 55、75、95</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“平均数就是让跷跷板平衡的支点”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function xOf(v) { return 20 + (v - 40) * 300 / 70; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = '数是 ' + L.vals.join('、') + '，支点现在在 ' + fulcrum + '。';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var tilt = fulcrum < L.avg ? 4 : (fulcrum > L.avg ? -4 : 0);
      var fx = Math.round(xOf(fulcrum));
      var s = '<svg width="360" height="200" viewBox="0 0 360 200">';
      s += '<g transform="rotate(' + tilt + ' ' + fx + ' 150)">';
      s += '<line x1="20" y1="150" x2="340" y2="150" stroke="#333" stroke-width="3"/>';
      for (var i = 0; i < L.vals.length; i++) {
        var wx = Math.round(xOf(L.vals[i]));
        s += '<circle cx="' + wx + '" cy="132" r="12" fill="#93c5fd" stroke="#333" stroke-width="2"/>';
        s += '<text x="' + wx + '" y="136" text-anchor="middle" font-size="11">' + L.vals[i] + '</text>';
      }
      s += '</g>';
      s += '<polygon points="' + fx + ',150 ' + (fx - 16) + ',186 ' + (fx + 16) + ',186" fill="#fcd34d" stroke="#333" stroke-width="2"/>';
      s += '<text x="' + fx + '" y="200" text-anchor="middle" font-size="13">支点 ' + fulcrum + '</text>';
      s += '</svg>';
      var box = gid(K + '-svg'); if (box) box.innerHTML = s;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜支点在 ' + LEVELS[li].opts[i] + '。挪支点，再点“检查平衡”。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-left').addEventListener('click', function () {
      fulcrum = Math.max(40, fulcrum - 5);
      draw();
      msg('支点挪到 ' + fulcrum + ' 了。点“检查平衡”看看哪边沉。');
    });
    gid(K + '-right').addEventListener('click', function () {
      fulcrum = Math.min(110, fulcrum + 5);
      draw();
      msg('支点挪到 ' + fulcrum + ' 了。点“检查平衡”看看哪边沉。');
    });
    gid(K + '-check').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：支点放在哪才平？'); return; }
      var L = LEVELS[li];
      if (fulcrum === L.avg) {
        if (guessed === L.ansIdx) {
          msg('平了！支点在 ' + L.avg + '，就是平均数。你猜对了。');
          if (tiers) tiers.done(li);
          if (typeof markTried === 'function') markTried(K);
        } else {
          msg('平了！支点在 ' + L.avg + '，就是平均数。你猜的是 ' + L.opts[guessed] + '。');
        }
      } else if (fulcrum < L.avg) {
        msg('右边沉下去了：支点太靠左，右边的数更重。往右挪挪。');
      } else {
        msg('左边沉下去了：支点太靠右，左边的数更重。往左挪挪。');
      }
    });
    function setLevel(i) {
      li = i; guessed = -1; fulcrum = 50;
      draw();
      msg('先猜一猜，再挪支点。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：60、70、80 的支点是 70', '提高：60、80、100 的支点是 80', '挑战：55、75、95 的支点是 75'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
registerAnim({
  key: 'm415-split',
  title: '总数倒在一起，再平分',
  sub: '平均数就是把总数重新平分：先把所有数倒在一起，再平均分给每个人，每人分到的就是平均数。',
  grade: 4,
  kind: '演示',
  points: ['4.15'],
  render: function (el) {
    var K = 'm415-split';
    var LEVELS = [
      { label: '基础', vals: [70, 80, 90, 100], total: 340, avg: 85, opts: ['80', '85', '90'], ansIdx: 1 },
      { label: '提高', vals: [60, 75, 90], total: 225, avg: 75, opts: ['70', '75', '80'], ansIdx: 1 },
      { label: '挑战', vals: [55, 65, 75, 85, 95], total: 375, avg: 75, opts: ['70', '75', '80'], ansIdx: 1 }
    ];
    var li = 0, guessed = -1, poured = false, split = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 4 年级 · 平均数</p>' +
      '<h3>总数倒在一起，再平分</h3>' +
      '<p>平均数不是中间那个数，是把总数重新平分：先加起来，再除以个数。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：平均数是多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：先点“倒在一起”看总数，再点“平分”看每人分到多少。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-pour" type="button">倒在一起</button>' +
      '<button class="btn small primary" id="' + K + '-share" type="button">平分</button></div>' +
      '<div id="' + K + '-bars"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“倒在一起”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 70、80、90、100</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 60、75、90</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 55、65、75、85、95</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“平均数 = 总数 ÷ 个数，是重新平分的结果”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = '数是 ' + L.vals.join('、') + '，一共 ' + L.vals.length + ' 个数，平均数是多少？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var box = gid(K + '-bars');
      if (box) {
        var scale = 400 / L.total;
        var s = '';
        if (!poured) {
          for (var i = 0; i < L.vals.length; i++) {
            s += '<p>' + L.vals[i] + '</p><div style="border:1px solid #999;height:20px"><div style="background:#93c5fd;height:20px;width:' + Math.round(L.vals[i] * scale) + 'px"></div></div>';
          }
        } else if (!split) {
          s += '<p>总数是 ' + L.vals.join('+') + ' = ' + L.total + '</p><div style="border:1px solid #999;height:20px"><div style="background:#fcd34d;height:20px;width:400px"></div></div>';
        } else {
          for (var j = 0; j < L.vals.length; j++) {
            s += '<p>每人 ' + L.avg + '</p><div style="border:1px solid #999;height:20px"><div style="background:#86efac;height:20px;width:' + Math.round(L.avg * scale) + 'px"></div></div>';
          }
          s += '<p>' + L.total + ' ÷ ' + L.vals.length + ' = ' + L.avg + '</p>';
        }
        box.innerHTML = s;
      }
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜平均数是 ' + LEVELS[li].opts[i] + '。点“倒在一起”，先看总数。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-pour').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：平均数是多少？'); return; }
      poured = true;
      draw();
      msg('倒在一起了：总数是 ' + LEVELS[li].total + '。再点“平分”。');
    });
    gid(K + '-share').addEventListener('click', function () {
      if (!poured) { msg('先点“倒在一起”，看总数是多少。'); return; }
      var L = LEVELS[li];
      split = true;
      draw();
      if (guessed === L.ansIdx) {
        msg('平分好了：' + L.total + ' ÷ ' + L.vals.length + ' = ' + L.avg + '，每人 ' + L.avg + '，就是平均数。你猜对了。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('平分好了：' + L.total + ' ÷ ' + L.vals.length + ' = ' + L.avg + '，平均数是 ' + L.avg + '，你猜的是 ' + L.opts[guessed] + '。');
      }
    });
    function setLevel(i) {
      li = i; guessed = -1; poured = false; split = false;
      draw();
      msg('先猜一猜，再点“倒在一起”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：340÷4=85', '提高：225÷3=75', '挑战：375÷5=75'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
registerAnim({
  key: 'm415-base',
  title: '基准数：先定一个大概，再补差',
  sub: '98、102、99、101，看着都接近 100：以 100 为基准，偏差是 −2、+2、−1、+1，加起来是 0，平均数就是 100。',
  grade: 4,
  kind: '模拟',
  points: ['4.15'],
  render: function (el) {
    var K = 'm415-base';
    var LEVELS = [
      { label: '基础', vals: [98, 102, 99, 101], base: 100, devs: [-2, 2, -1, 1], devSum: 0, avg: 100, opts: ['99', '100', '101'], ansIdx: 1 },
      { label: '提高', vals: [88, 92, 89, 91], base: 90, devs: [-2, 2, -1, 1], devSum: 0, avg: 90, opts: ['89', '90', '91'], ansIdx: 1 },
      { label: '挑战', vals: [103, 97, 102, 98, 105], base: 100, devs: [3, -3, 2, -2, 5], devSum: 5, avg: 101, opts: ['100', '101', '102'], ansIdx: 1 }
    ];
    var li = 0, guessed = -1, based = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 4 年级 · 平均数</p>' +
      '<h3>基准数：先定一个大概，再补差</h3>' +
      '<p>一串数都接近某个数时，不用从头加：先定这个数为基准，看每个数比它多几、少几，偏差平均一下就行。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：平均数是多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“选基准”，看每个数比基准多几、少几；再点“算一算”。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-pick" type="button">选基准</button>' +
      '<button class="btn small primary" id="' + K + '-calc" type="button">算一算</button></div>' +
      '<div id="' + K + '-devs"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“选基准”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 98、102、99、101</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 88、92、89、91</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 103、97、102、98、105</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“平均数 = 基准数 + 平均偏差”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function devTx(d) { return d > 0 ? '+' + d : String(d); }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = '数是 ' + L.vals.join('、') + '，都接近 ' + L.base + '。以 ' + L.base + ' 为基准，平均数是多少？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var box = gid(K + '-devs');
      if (box) {
        if (!based) { box.innerHTML = ''; }
        else {
          var s = '';
          for (var i = 0; i < L.vals.length; i++) {
            s += '<p>' + L.vals[i] + '：比 ' + L.base + ' ' + (L.devs[i] > 0 ? '多 ' + L.devs[i] : (L.devs[i] < 0 ? '少 ' + (-L.devs[i]) : '不多不少')) + '（' + devTx(L.devs[i]) + '）</p>';
          }
          box.innerHTML = s;
        }
      }
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜平均数是 ' + LEVELS[li].opts[i] + '。点“选基准”，看每个数比基准多几、少几。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-pick').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：平均数是多少？'); return; }
      based = true;
      draw();
      msg('基准是 ' + LEVELS[li].base + '。再点“算一算”，把偏差加起来。');
    });
    gid(K + '-calc').addEventListener('click', function () {
      if (!based) { msg('先点“选基准”，看每个数比基准多几、少几。'); return; }
      var L = LEVELS[li];
      var meanDev = L.devSum / L.vals.length;
      var meanTx = meanDev === 0 ? '0' : String(meanDev);
      if (guessed === L.ansIdx) {
        msg('偏差加起来是 ' + L.devSum + '，平均偏差是 ' + meanTx + '，所以平均数 = ' + L.base + ' + ' + meanTx + ' = ' + L.avg + '。你猜对了。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('偏差加起来是 ' + L.devSum + '，平均偏差是 ' + meanTx + '，所以平均数 = ' + L.base + ' + ' + meanTx + ' = ' + L.avg + '。你猜的是 ' + L.opts[guessed] + '。');
      }
    });
    function setLevel(i) {
      li = i; guessed = -1; based = false;
      draw();
      msg('先猜一猜，再点“选基准”。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：基准 100，平均数 100', '提高：基准 90，平均数 90', '挑战：基准 100，平均数 101'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});

/* 4.16 鸡兔同笼：4 种方法全跳过——假设法、画图法、列表枚举法、金鸡独立法各有 crslider、crdraw、crlist、crgolden。本点不新增。 */
/* 4.17 观察物体（二）：主演示 observe 只是自由旋转 3D 物体，没有三视图对照、逐层数、搭一搭、俯视图+主视图推理；做这 4 个。 */
registerAnim({
  key: 'm417-views',
  title: '三个方向看，对一对',
  sub: '同一个小正方体堆，从前面、左面、上面看是三张不同的图。三张图对起来，才能确定它长什么样。',
  grade: 4,
  kind: '演示',
  points: ['4.17'],
  render: function (el) {
    var K = 'm417-views';
    var LEVELS = [
      { label: '基础', stack: { '0,0': 1, '1,0': 2, '2,0': 1, '0,1': 2, '1,1': 1, '2,1': 0, '0,2': 0, '1,2': 1, '2,2': 0 },
        q: '从前面看，最上面一层有几个正方形？', opts: ['1 个', '2 个', '3 个'], ansIdx: 1 },
      { label: '提高', stack: { '0,0': 2, '1,0': 1, '2,0': 2, '0,1': 1, '1,1': 3, '2,1': 1, '0,2': 0, '1,2': 0, '2,2': 1 },
        q: '从前面看，最上面一层有几个正方形？', opts: ['1 个', '2 个', '3 个'], ansIdx: 0 },
      { label: '挑战', stack: { '0,0': 1, '1,0': 1, '2,0': 3, '0,1': 3, '1,1': 0, '2,1': 1, '0,2': 1, '1,2': 2, '2,2': 0 },
        q: '从左面看，最上面一层有几个正方形？', opts: ['1 个', '2 个', '3 个'], ansIdx: 1 }
    ];
    var li = 0, guessed = -1, view = 'front', seen = {}, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 4 年级 · 观察物体（二）</p>' +
      '<h3>三个方向看，对一对</h3>' +
      '<p>一个方向只能看到一面：从前面看有几个正方形，不等于一共有几个小正方体。三个方向合起来，才能确定。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：按问题猜一猜。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：三个方向都点开，对一对三张图。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-v-front" type="button">从前面看</button>' +
      '<button class="btn small primary" id="' + K + '-v-left" type="button">从左面看</button>' +
      '<button class="btn small primary" id="' + K + '-v-top" type="button">从上面看</button></div>' +
      '<div id="' + K + '-grid"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再三个方向都点开看看。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 8 个小正方体</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 11 个小正方体</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 12 个小正方体</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“一个方向只能看到一面，三个方向合起来才能确定”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function hAt(st, x, z) { return st[x + ',' + z] || 0; }
    function colHeights(st, dir) {
      var hs = [];
      if (dir === 'front') {
        for (var x = 0; x < 3; x++) hs.push(Math.max(hAt(st, x, 0), hAt(st, x, 1), hAt(st, x, 2)));
      } else {
        for (var z = 2; z >= 0; z--) {
          var m = 0;
          for (var x2 = 0; x2 < 3; x2++) m = Math.max(m, hAt(st, x2, z));
          hs.push(m);
        }
      }
      return hs;
    }
    function gridHtml(rows) {
      var s = '';
      for (var i = 0; i < rows.length; i++) {
        s += '<div>';
        for (var j = 0; j < rows[i].length; j++) {
          s += '<span style="display:inline-block;width:22px;height:22px;border:1px solid #666;background:' + (rows[i][j] ? '#93c5fd' : '#fff') + '"></span>';
        }
        s += '</div>';
      }
      return s;
    }
    function viewRows(st, dir) {
      if (dir === 'top') {
        var rows = [];
        for (var z = 2; z >= 0; z--) {
          var row = [];
          for (var x = 0; x < 3; x++) row.push(hAt(st, x, z) > 0 ? 1 : 0);
          rows.push(row);
        }
        return rows;
      }
      var hs = colHeights(st, dir);
      var maxH = Math.max(hs[0], hs[1], hs[2]);
      var out = [];
      for (var l = maxH; l >= 1; l--) {
        var r = [];
        for (var k = 0; k < 3; k++) r.push(hs[k] >= l ? 1 : 0);
        out.push(r);
      }
      return out;
    }
    function viewCount(st, dir) {
      if (dir === 'top') {
        var n = 0;
        for (var x = 0; x < 3; x++) for (var z = 0; z < 3; z++) if (hAt(st, x, z) > 0) n++;
        return n;
      }
      var hs = colHeights(st, dir);
      return hs[0] + hs[1] + hs[2];
    }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.q;
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var box = gid(K + '-grid');
      if (box) box.innerHTML = gridHtml(viewRows(L.stack, view));
      var names = { front: '前面', left: '左面', top: '上面' };
      if (seen.front && seen.left && seen.top) {
        msg('三张图都看过了：前面 ' + viewCount(L.stack, 'front') + ' 个正方形，左面 ' + viewCount(L.stack, 'left') + ' 个，上面 ' + viewCount(L.stack, 'top') + ' 个。');
        if (!done && guessed >= 0) {
          done = true;
          if (guessed === L.ansIdx) {
            msg('三张图都看过了：前面 ' + viewCount(L.stack, 'front') + ' 个正方形，左面 ' + viewCount(L.stack, 'left') + ' 个，上面 ' + viewCount(L.stack, 'top') + ' 个。你猜对了。');
            if (tiers) tiers.done(li);
            if (typeof markTried === 'function') markTried(K);
          }
        }
      } else {
        msg('现在看的是' + names[view] + '：一共 ' + viewCount(L.stack, view) + ' 个正方形。三个方向都点开。');
      }
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜是 ' + LEVELS[li].opts[i] + '。三个方向都点开，对一对。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-v-front').addEventListener('click', function () { view = 'front'; seen.front = true; draw(); });
    gid(K + '-v-left').addEventListener('click', function () { view = 'left'; seen.left = true; draw(); });
    gid(K + '-v-top').addEventListener('click', function () { view = 'top'; seen.top = true; draw(); });
    function setLevel(i) {
      li = i; guessed = -1; view = 'front'; seen = {}; done = false;
      draw();
      msg('先猜一猜，再三个方向都点开看看。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：三视图对照', '提高：三视图对照', '挑战：三视图对照'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    seen.front = true;
    draw();
  }
});
registerAnim({
  key: 'm417-layers',
  title: '一层一层数',
  sub: '数小正方体要一层一层数：先数最下面一层有几个，再数上面一层，加起来就是一共几个。',
  grade: 4,
  kind: '演示',
  points: ['4.17'],
  render: function (el) {
    var K = 'm417-layers';
    var LEVELS = [
      { label: '基础', stack: { '0,0': 1, '1,0': 2, '2,0': 1, '0,1': 2, '1,1': 1, '2,1': 0, '0,2': 0, '1,2': 1, '2,2': 0 },
        q: '一共几个小正方体？', opts: ['6 个', '8 个', '10 个'], ansIdx: 1 },
      { label: '提高', stack: { '0,0': 2, '1,0': 1, '2,0': 2, '0,1': 1, '1,1': 3, '2,1': 1, '0,2': 0, '1,2': 0, '2,2': 1 },
        q: '一共几个小正方体？', opts: ['9 个', '11 个', '13 个'], ansIdx: 1 },
      { label: '挑战', stack: { '0,0': 1, '1,0': 1, '2,0': 3, '0,1': 3, '1,1': 0, '2,1': 1, '0,2': 1, '1,2': 2, '2,2': 0 },
        q: '一共几个小正方体？', opts: ['10 个', '12 个', '14 个'], ansIdx: 1 }
    ];
    var li = 0, guessed = -1, layer = 0, seenLayers = {}, summed = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 4 年级 · 观察物体（二）</p>' +
      '<h3>一层一层数</h3>' +
      '<p>挡住的也要算进去：从上面往下看，每一层有几个小正方体，一层一层数，数完再加起来。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：一共几个小正方体？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：一层一层点开，看每层有几个；再点“合起来”。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-layer-1" type="button">第 1 层</button>' +
      '<button class="btn small primary" id="' + K + '-layer-2" type="button">第 2 层</button>' +
      '<button class="btn small primary" id="' + K + '-layer-3" type="button">第 3 层</button>' +
      '<button class="btn small ghost" id="' + K + '-sum" type="button">合起来</button></div>' +
      '<div id="' + K + '-grid"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再一层一层点开。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 8 个</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 11 个</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 12 个</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“数小正方体要一层一层数，挡住的也要算进去”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function hAt(st, x, z) { return st[x + ',' + z] || 0; }
    function maxH(st) {
      var m = 0;
      for (var x = 0; x < 3; x++) for (var z = 0; z < 3; z++) m = Math.max(m, hAt(st, x, z));
      return m;
    }
    function layerCount(st, l) {
      var n = 0;
      for (var x = 0; x < 3; x++) for (var z = 0; z < 3; z++) if (hAt(st, x, z) >= l) n++;
      return n;
    }
    function total(st) {
      var n = 0;
      for (var x = 0; x < 3; x++) for (var z = 0; z < 3; z++) n += hAt(st, x, z);
      return n;
    }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.q;
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var b3 = gid(K + '-layer-3');
      if (b3) b3.hidden = maxH(L.stack) < 3;
      var box = gid(K + '-grid');
      if (box) {
        if (!layer) { box.innerHTML = '<p>从上面看，点一层，看那一层有几个。</p>'; }
        else {
          var s = '';
          for (var z = 2; z >= 0; z--) {
            s += '<div>';
            for (var x = 0; x < 3; x++) {
              var on = hAt(L.stack, x, z) >= layer;
              s += '<span style="display:inline-block;width:22px;height:22px;border:1px solid #666;background:' + (on ? '#93c5fd' : '#fff') + '"></span>';
            }
            s += '</div>';
          }
          box.innerHTML = s;
        }
      }
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜一共 ' + LEVELS[li].opts[i] + '。一层一层点开数数。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    function pickLayer(l) {
      if (guessed < 0) { msg('先猜一猜：一共几个小正方体？'); return; }
      layer = l;
      seenLayers[l] = true;
      draw();
      var L = LEVELS[li];
      msg('第 ' + l + ' 层有 ' + layerCount(L.stack, l) + ' 个小正方体。');
    }
    gid(K + '-layer-1').addEventListener('click', function () { pickLayer(1); });
    gid(K + '-layer-2').addEventListener('click', function () { pickLayer(2); });
    gid(K + '-layer-3').addEventListener('click', function () { pickLayer(3); });
    gid(K + '-sum').addEventListener('click', function () {
      var L = LEVELS[li];
      var mh = maxH(L.stack);
      for (var l = 1; l <= mh; l++) {
        if (!seenLayers[l]) { msg('先把第 ' + l + ' 层点开看看。'); return; }
      }
      summed = true;
      var parts = [];
      for (var l2 = 1; l2 <= mh; l2++) parts.push(String(layerCount(L.stack, l2)));
      if (guessed === L.ansIdx) {
        msg('合起来：' + parts.join(' + ') + ' = ' + total(L.stack) + ' 个。你猜对了。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('合起来：' + parts.join(' + ') + ' = ' + total(L.stack) + ' 个。你猜的是 ' + L.opts[guessed] + '。');
      }
    });
    function setLevel(i) {
      li = i; guessed = -1; layer = 0; seenLayers = {}; summed = false;
      draw();
      msg('先猜一猜，再一层一层点开。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：6 + 2 = 8', '提高：7 + 3 + 1 = 11', '挑战：7 + 3 + 2 = 12'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});
registerAnim({
  key: 'm417-build',
  title: '搭一搭：照着视图搭出来',
  sub: '给你前面看和上面看的两张图，动手搭出这个小正方体堆：点格子加一层，搭错了对不上，改过来就行。',
  grade: 4,
  kind: '实验',
  points: ['4.17'],
  render: function (el) {
    var K = 'm417-build';
    var LEVELS = [
      { label: '基础', target: { '0,0': 1, '1,0': 2, '2,0': 1, '0,1': 1, '1,1': 0, '2,1': 1, '0,2': 0, '1,2': 0, '2,2': 0 },
        q: '最少要几个小正方体？', opts: ['5 个', '6 个', '7 个'], ansIdx: 1, min: 6 },
      { label: '提高', target: { '0,0': 1, '1,0': 2, '2,0': 1, '0,1': 2, '1,1': 1, '2,1': 0, '0,2': 0, '1,2': 1, '2,2': 0 },
        q: '最少要几个小正方体？', opts: ['6 个', '8 个', '10 个'], ansIdx: 1, min: 8 },
      { label: '挑战', target: { '0,0': 1, '1,0': 1, '2,0': 3, '0,1': 3, '1,1': 0, '2,1': 1, '0,2': 1, '1,2': 2, '2,2': 0 },
        q: '最少要几个小正方体？', opts: ['10 个', '12 个', '14 个'], ansIdx: 1, min: 12 }
    ];
    var li = 0, guessed = -1, built = {}, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 4 年级 · 观察物体（二）</p>' +
      '<h3>搭一搭：照着视图搭出来</h3>' +
      '<p>目标在下面两张图里：前面看什么样，上面看什么样。点格子加小正方体（再点加一层，4 下回到 0），搭好点“对一对”。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：最少要几个小正方体？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：照着两张图搭，搭好点“对一对”。</p>' +
      '<div id="' + K + '-target"></div>' +
      '<div id="' + K + '-grid"></div>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-check" type="button">对一对</button>' +
      '<button class="btn small ghost" id="' + K + '-clear" type="button">清空重搭</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点格子搭。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 最少 6 个</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 最少 8 个</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 最少 12 个</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都搭得出“前面和上面都对得上，而且用的就是最少的个数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function hAt(st, x, z) { return st[x + ',' + z] || 0; }
    function frontHs(st) {
      var hs = [];
      for (var x = 0; x < 3; x++) hs.push(Math.max(hAt(st, x, 0), hAt(st, x, 1), hAt(st, x, 2)));
      return hs;
    }
    function gridHtml(rows) {
      var s = '';
      for (var i = 0; i < rows.length; i++) {
        s += '<div>';
        for (var j = 0; j < rows[i].length; j++) {
          s += '<span style="display:inline-block;width:22px;height:22px;border:1px solid #666;background:' + (rows[i][j] ? '#93c5fd' : '#fff') + '"></span>';
        }
        s += '</div>';
      }
      return s;
    }
    function viewRows(st, dir) {
      if (dir === 'top') {
        var rows = [];
        for (var z = 2; z >= 0; z--) {
          var row = [];
          for (var x = 0; x < 3; x++) row.push(hAt(st, x, z) > 0 ? 1 : 0);
          rows.push(row);
        }
        return rows;
      }
      var hs = frontHs(st);
      var maxH = Math.max(hs[0], hs[1], hs[2]);
      var out = [];
      for (var l = maxH; l >= 1; l--) {
        var r = [];
        for (var k = 0; k < 3; k++) r.push(hs[k] >= l ? 1 : 0);
        out.push(r);
      }
      return out;
    }
    function total(st) {
      var n = 0;
      for (var x = 0; x < 3; x++) for (var z = 0; z < 3; z++) n += hAt(st, x, z);
      return n;
    }
    function syncGrid() {
      for (var z = 0; z < 3; z++) {
        for (var x = 0; x < 3; x++) {
          var b = gid(K + '-cell-' + x + '-' + z);
          if (!b) continue;
          var h = built[x + ',' + z] || 0;
          b.textContent = h ? String(h) : '·';
          b.setAttribute('aria-pressed', String(h > 0));
        }
      }
    }
    function buildGrid() {
      var box = gid(K + '-grid');
      if (!box) return;
      var s = '<p>从上面看搭（前面是下面那一行）：点格子加一层</p>';
      for (var z = 2; z >= 0; z--) {
        s += '<div class="btn-row">';
        for (var x = 0; x < 3; x++) {
          s += '<button class="btn small ghost" id="' + K + '-cell-' + x + '-' + z + '" type="button">·</button>';
        }
        s += '</div>';
      }
      box.innerHTML = s;
      for (var z2 = 0; z2 < 3; z2++) {
        for (var x2 = 0; x2 < 3; x2++) {
          (function (xx, zz) {
            var b = gid(K + '-cell-' + xx + '-' + zz);
            if (b) b.addEventListener('click', function () { tapCell(xx, zz); });
          })(x2, z2);
        }
      }
    }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.q;
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var t = gid(K + '-target');
      if (t) t.innerHTML = '<p>目标：前面看</p>' + gridHtml(viewRows(L.target, 'front')) + '<p>上面看</p>' + gridHtml(viewRows(L.target, 'top'));
      syncGrid();
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === li));
      }
    }
    function tapCell(x, z) {
      if (guessed < 0) { msg('先猜一猜：最少要几个小正方体？'); return; }
      var k = x + ',' + z;
      built[k] = ((built[k] || 0) + 1) % 4;
      syncGrid();
      msg('现在一共用了 ' + total(built) + ' 个小正方体。搭好点“对一对”。');
    }
    function guess(i) {
      guessed = i;
      msg('你猜最少 ' + LEVELS[li].opts[i] + '。照着两张图搭。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-check').addEventListener('click', function () {
      var L = LEVELS[li];
      var tf = frontHs(L.target), bf = frontHs(built);
      for (var x = 0; x < 3; x++) {
        if (tf[x] !== bf[x]) {
          msg('前面看第 ' + (x + 1) + ' 列：目标是 ' + tf[x] + ' 层，你搭了 ' + bf[x] + ' 层。改一改那一列。');
          return;
        }
      }
      for (var z = 0; z < 3; z++) {
        for (var x2 = 0; x2 < 3; x2++) {
          var tw = hAt(L.target, x2, z) > 0, bw = hAt(built, x2, z) > 0;
          if (tw !== bw) {
            msg(tw ? '上面看：这个格子应该有小正方体，你这里是空的。' : '上面看：这个格子应该是空的，你这里多搭了一个。');
            return;
          }
        }
      }
      var n = total(built);
      if (n > L.min) {
        msg('前面和上面都对上了！不过你用了 ' + n + ' 个，比最少的 ' + L.min + ' 个多了 ' + (n - L.min) + ' 个——藏着的那个可以拿掉。');
        return;
      }
      if (guessed === L.ansIdx) {
        msg('对上了！前面和上面都和目标一样，只用了 ' + n + ' 个，就是最少的。你猜对了。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('对上了！前面和上面都和目标一样，只用了 ' + n + ' 个。你猜最少是 ' + L.opts[guessed] + '，其实最少就是 ' + L.min + ' 个。');
      }
    });
    gid(K + '-clear').addEventListener('click', function () {
      built = {};
      draw();
      msg('清空了，重新搭。');
    });
    function setLevel(i) {
      li = i; guessed = -1; built = {};
      draw();
      msg('先猜一猜，再点格子搭。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：最少 6 个', '提高：最少 8 个', '挑战：最少 12 个'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    buildGrid();
    draw();
  }
});
registerAnim({
  key: 'm417-infer',
  title: '两张图，推出最少和最多',
  sub: '只给俯视图和主视图，搭法不止一种：有的格子必须摞高，有的格子可高可低。最少几个？最多几个？',
  grade: 4,
  kind: '实验',
  points: ['4.17', '5.14'],
  render: function (el) {
    var K = 'm417-infer';
    var LEVELS = [
      { label: '基础', top: [[1, 0], [1, 1]], front: [2, 1], min: 4, max: 5,
        opts: ['3 个', '4 个', '5 个'], ansIdx: 1,
        minTx: '最少 4 个：(0,0) 摞 2 个，(1,0) 1 个，(0,1) 1 个——前面第 1 列的 2 层，只用摞在其中一格上。',
        maxTx: '最多 5 个：(0,0) 2 个，(1,0) 1 个，(0,1) 2 个——前面第 1 列两格都摞到 2 层，前面看还是 2 层。' },
      { label: '提高', top: [[1, 0, 1], [1, 1, 1]], front: [1, 3, 2], min: 8, max: 9,
        opts: ['7 个', '8 个', '9 个'], ansIdx: 1,
        minTx: '最少 8 个：(0,0) 1 个，(1,0) 3 个，(2,0) 2 个，(0,1) 1 个，(2,1) 1 个。',
        maxTx: '最多 9 个：(2,1) 也摞到 2 个，前面第 3 列还是 2 层。' },
      { label: '挑战', top: [[0, 1, 0], [1, 1, 1], [1, 1, 0]], front: [2, 3, 1], min: 9, max: 14,
        opts: ['8 个', '9 个', '10 个'], ansIdx: 1,
        minTx: '最少 9 个：(0,0) 2 个，(0,1) 1 个，(1,0) 1 个，(1,1) 3 个，(1,2) 1 个，(2,1) 1 个。',
        maxTx: '最多 14 个：(0,0)、(0,1) 都摞到 2 个，(1,0)、(1,1)、(1,2) 都摞到 3 个，(2,1) 1 个。' }
    ];
    var li = 0, guessed = -1, sawMin = false, sawMax = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 4 年级 · 观察物体（二）</p>' +
      '<h3>两张图，推出最少和最多</h3>' +
      '<p>俯视图告诉你有几格，主视图告诉你每列最高几层。合起来：最少几个？最多几个？</p>' +
      '<p>第 1 步 · 先猜：最少要几个小正方体？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“最少摆法”和“最多摆法”，看两种极端怎么搭。</p>' +
      '<div id="' + K + '-views"></div>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-show-min" type="button">最少摆法</button>' +
      '<button class="btn small primary" id="' + K + '-show-max" type="button">最多摆法</button></div>' +
      '<p id="' + K + '-arr"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点两种摆法。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 最少 4 个</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 最少 8 个</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 最少 9 个</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“俯视图定格子，主视图定每列最高几层；最少是每列只摞到必须的高度”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function gridHtml(rows) {
      var s = '';
      for (var i = 0; i < rows.length; i++) {
        s += '<div>';
        for (var j = 0; j < rows[i].length; j++) {
          s += '<span style="display:inline-block;width:22px;height:22px;border:1px solid #666;background:' + (rows[i][j] ? '#93c5fd' : '#fff') + '"></span>';
        }
        s += '</div>';
      }
      return s;
    }
    function draw() {
      var L = LEVELS[li];
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var maxH = Math.max.apply(null, L.front);
      var frows = [];
      for (var l = maxH; l >= 1; l--) {
        var r = [];
        for (var k = 0; k < L.front.length; k++) r.push(L.front[k] >= l ? 1 : 0);
        frows.push(r);
      }
      var box = gid(K + '-views');
      if (box) box.innerHTML = '<p>俯视图（上面看，前面是下面那一行）</p>' + gridHtml(L.top) + '<p>主视图（前面看）</p>' + gridHtml(frows);
      var arr = gid(K + '-arr'); if (arr) arr.textContent = '';
      for (var k2 = 0; k2 < 3; k2++) {
        var b = gid(K + '-level-' + k2);
        if (b) b.setAttribute('aria-pressed', String(k2 === li));
      }
    }
    function guess(i) {
      guessed = i;
      msg('你猜最少 ' + LEVELS[li].opts[i] + '。点“最少摆法”和“最多摆法”验证一下。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guess(0); });
    gid(K + '-guess-b').addEventListener('click', function () { guess(1); });
    gid(K + '-guess-c').addEventListener('click', function () { guess(2); });
    gid(K + '-show-min').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：最少要几个小正方体？'); return; }
      var L = LEVELS[li];
      sawMin = true;
      var arr = gid(K + '-arr'); if (arr) arr.textContent = L.minTx;
      msg('最少 ' + L.min + ' 个。' + (sawMax ? '最多是 ' + L.max + ' 个。' : '再点“最多摆法”看看。'));
      if (sawMax) finish();
    });
    gid(K + '-show-max').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜：最少要几个小正方体？'); return; }
      var L = LEVELS[li];
      sawMax = true;
      var arr = gid(K + '-arr'); if (arr) arr.textContent = L.maxTx;
      msg('最多 ' + L.max + ' 个。' + (sawMin ? '最少是 ' + L.min + ' 个。' : '再点“最少摆法”看看。'));
      if (sawMin) finish();
    });
    function finish() {
      var L = LEVELS[li];
      if (guessed === L.ansIdx) {
        msg('都看过了：最少 ' + L.min + ' 个，最多 ' + L.max + ' 个。你猜对了。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('都看过了：最少 ' + L.min + ' 个，最多 ' + L.max + ' 个。你猜最少是 ' + L.opts[guessed] + '。');
      }
    }
    function setLevel(i) {
      li = i; guessed = -1; sawMin = false; sawMax = false;
      draw();
      msg('先猜一猜，再点两种摆法。');
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：最少 4 个，最多 5 个', '提高：最少 8 个，最多 9 个', '挑战：最少 9 个，最多 14 个'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    draw();
  }
});

/* 5.1 小数乘法：跳过单位正方形重叠（已有 decmul，5.1 点页主演示）；做计数单位换算、估算定小数点。 */
registerAnim({
  key: 'm51-units',
  title: '计数单位换算',
  sub: '0.3 是 3 个 0.1，0.4 是 4 个 0.1，3×4=12 个 0.01，所以是 0.12——小数点的位置是计数单位相乘决定的。',
  grade: 5,
  kind: '模拟',
  points: ['5.1'],
  render: function (el) {
    var K = 'm51-units';
    var LEVELS = [
      { label: '基础', a: 3, b: 4, pa: '0.3', pb: '0.4', prod: '0.12', opts: ['0.12', '1.2', '0.012'], ans: 0 },
      { label: '提高', a: 2, b: 5, pa: '0.2', pb: '0.5', prod: '0.1', opts: ['0.1', '1.0', '0.01'], ans: 0 },
      { label: '挑战', a: 6, b: 7, pa: '0.6', pb: '0.7', prod: '0.42', opts: ['0.42', '4.2', '0.042'], ans: 0 }
    ];
    var li = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 5 年级 · 小数乘法</p>' +
      '<h3>计数单位换算</h3>' +
      '<p>小数乘法不用背小数点往哪点：把两个因数拆成计数单位，个数一乘，单位一乘，答案自己出来。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：积是多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“拆成计数单位”，看个数和单位怎么乘。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-split" type="button">拆成计数单位</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“拆成计数单位”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 0.3×0.4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 0.2×0.5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 0.6×0.7</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“个数相乘，0.1×0.1=0.01，小数点是算出来的”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.pa + ' × ' + L.pb + ' = ？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
    }
    function setLevel(i) {
      li = i; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“拆成计数单位”。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guessed = 0; msg('你猜 ' + LEVELS[li].opts[0] + '。点“拆成计数单位”验证一下。'); });
    gid(K + '-guess-b').addEventListener('click', function () { guessed = 1; msg('你猜 ' + LEVELS[li].opts[1] + '。点“拆成计数单位”验证一下。'); });
    gid(K + '-guess-c').addEventListener('click', function () { guessed = 2; msg('你猜 ' + LEVELS[li].opts[2] + '。点“拆成计数单位”验证一下。'); });
    gid(K + '-split').addEventListener('click', function () {
      var L = LEVELS[li];
      var n = L.a * L.b;
      var extra = li === 1 ? '10 个 0.01 就是 0.10，也就是 0.1。' : '';
      var ok = guessed === L.ans;
      msg(L.pa + ' 是 ' + L.a + ' 个 0.1，' + L.pb + ' 是 ' + L.b + ' 个 0.1；' +
        L.a + '×' + L.b + '=' + n + ' 个 0.01，0.1×0.1=0.01，所以是 ' + L.prod + '。' + extra +
        (guessed < 0 ? '下次先猜一猜再拆。' : ok ? '你猜对了。' : '你猜的是 ' + L.opts[guessed] + '，再想想小数点为什么点在这里。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：0.3×0.4=0.12', '提高：0.2×0.5=0.1', '挑战：0.6×0.7=0.42'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm51-estimate',
  title: '估算定小数点',
  sub: '先按整数乘，再用估算判断积的数量级：积在 4 附近，就不可能是 45.6，也不是 0.456。',
  grade: 5,
  kind: '模拟',
  points: ['5.1'],
  render: function (el) {
    var K = 'm51-estimate';
    var LEVELS = [
      { label: '基础', a: '2.4', b: '1.9', est: '2×2=4', prod: '4.56', opts: ['4.56', '45.6', '0.456'], ans: 0 },
      { label: '提高', a: '3.2', b: '2.5', est: '3×2.5=7.5', prod: '8', opts: ['8', '80', '0.8'], ans: 0 },
      { label: '挑战', a: '0.48', b: '3.1', est: '0.5×3=1.5', prod: '1.488', opts: ['1.488', '14.88', '0.1488'], ans: 0 }
    ];
    var li = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 5 年级 · 小数乘法</p>' +
      '<h3>估算定小数点</h3>' +
      '<p>小数点点错一位，答案就差 10 倍。先估一估积在哪个数量级，再点小数点，就点不错了。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：小数点点在哪？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：先估算，再点小数点。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-est" type="button">先估算</button>' +
      '<button class="btn small primary" id="' + K + '-place" type="button">点小数点</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“先估算”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 2.4×1.9</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 3.2×2.5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 0.48×3.1</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“先估数量级，再点小数点”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.a + ' × ' + L.b + ' = ？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
    }
    function setLevel(i) {
      li = i; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“先估算”。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guessed = 0; msg('你猜 ' + LEVELS[li].opts[0] + '。点“先估算”验证一下。'); });
    gid(K + '-guess-b').addEventListener('click', function () { guessed = 1; msg('你猜 ' + LEVELS[li].opts[1] + '。点“先估算”验证一下。'); });
    gid(K + '-guess-c').addEventListener('click', function () { guessed = 2; msg('你猜 ' + LEVELS[li].opts[2] + '。点“先估算”验证一下。'); });
    gid(K + '-est').addEventListener('click', function () {
      var L = LEVELS[li];
      msg(L.a + ' × ' + L.b + ' 估算：' + L.est + '。积就在 ' + L.est.split('=')[1] + ' 附近。');
    });
    gid(K + '-place').addEventListener('click', function () {
      var L = LEVELS[li];
      var ok = guessed === L.ans;
      msg('按整数乘，再点上小数点：' + L.a + '×' + L.b + '=' + L.prod + '。估算说积在 ' + L.est.split('=')[1] + ' 附近，' + L.prod + ' 正好对得上。' +
        (guessed < 0 ? '下次先猜一猜再点。' : ok ? '你猜对了。' : '你猜的是 ' + L.opts[guessed] + '，和估算的数量级对不上。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：2.4×1.9=4.56', '提高：3.2×2.5=8', '挑战：0.48×3.1=1.488'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
/* 5.2 位置：跳过坐标网格描点（已有 gridpos，5.2 点页主演示）；gridpos 的“考一考”只是找点，没有藏船开炮，做军舰游戏；再做平移看数对变化。 */
registerAnim({
  key: 'm52-ship',
  title: '军舰游戏猜船',
  sub: '网格上藏了一条船，报数对开炮：打中、打偏、船沉了——列行颠倒，炮就打空了。',
  grade: 5,
  kind: '实验',
  points: ['5.2'],
  render: function (el) {
    var K = 'm52-ship';
    var LEVELS = [
      { label: '基础', ship: [[3, 2], [4, 2]], dir: '横着', opts: ['横着', '竖着'], ans: 0 },
      { label: '提高', ship: [[2, 3], [2, 4]], dir: '竖着', opts: ['横着', '竖着'], ans: 1 },
      { label: '挑战', ship: [[5, 1], [5, 2], [5, 3]], dir: '竖着', opts: ['横着', '竖着'], ans: 1 }
    ];
    var li = 0, guessed = -1, fired = {}, hits = 0, shots = 0, sunk = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 5 年级 · 位置</p>' +
      '<h3>军舰游戏猜船</h3>' +
      '<p>6 列 5 行的海面上藏了一条船。报数对开炮：先数列，再数行，(3,2) 和 (2,3) 是两个地方。</p>' +
      '<p>第 1 步 · 先猜：船是横着的，还是竖着的？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-h" type="button">横着</button>' +
      '<button class="btn small primary" id="' + K + '-guess-v" type="button">竖着</button></div>' +
      '<p>第 2 步 · 玩一玩：点一个格子开炮。</p>' +
      '<div id="' + K + '-grid"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点格子开炮。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 2 格船</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 2 格船</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 3 格船</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“先列后行，顺序错了炮就打空”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function isShip(c, r) {
      var s = LEVELS[li].ship;
      for (var i = 0; i < s.length; i++) if (s[i][0] === c && s[i][1] === r) return true;
      return false;
    }
    function buildGrid() {
      var s = '';
      for (var r = 1; r <= 5; r++) {
        s += '<div>';
        for (var c = 1; c <= 6; c++) {
          s += '<button class="btn small ghost" id="' + K + '-c-' + c + '-' + r + '" type="button" style="width:34px">(' + c + ',' + r + ')</button>';
        }
        s += '</div>';
      }
      var g = gid(K + '-grid');
      if (g) g.innerHTML = s;
      for (var r2 = 1; r2 <= 5; r2++) {
        for (var c2 = 1; c2 <= 6; c2++) {
          (function (cc, rr) {
            var b = gid(K + '-c-' + cc + '-' + rr);
            if (b) b.addEventListener('click', function () { fire(cc, rr); });
          })(c2, r2);
        }
      }
    }
    function fire(c, r) {
      if (sunk) { msg('船已经沉了，换一档再玩一局。'); return; }
      var key = c + ',' + r;
      if (fired[key]) { msg('(' + c + ',' + r + ') 这里开过炮了，换个地方。'); return; }
      fired[key] = true; shots++;
      if (isShip(c, r)) {
        hits++;
        var b = gid(K + '-c-' + c + '-' + r);
        if (b) b.textContent = '打中';
        if (hits >= LEVELS[li].ship.length) {
          sunk = true;
          var ok = guessed === LEVELS[li].ans;
          msg('打中了！(' + c + ',' + r + ') 有船。船沉了！一共开了 ' + shots + ' 炮。船是' + LEVELS[li].dir + '的。' +
            (guessed < 0 ? '下次先猜一猜方向再开炮。' : ok ? '你猜对了。' : '你猜的是' + LEVELS[li].opts[guessed] + '。'));
          if (ok) {
            if (tiers) tiers.done(li);
            if (typeof markTried === 'function') markTried(K);
          }
        } else {
          msg('打中了！(' + c + ',' + r + ') 有船，还差 ' + (LEVELS[li].ship.length - hits) + ' 格。');
          if (typeof markTried === 'function') markTried(K);
        }
      } else {
        var b2 = gid(K + '-c-' + c + '-' + r);
        if (b2) b2.textContent = '空';
        msg('没打中：(' + c + ',' + r + ') 是空的——先数列，再数行，(3,2) 和 (2,3) 不是一个地方。');
      }
    }
    function setLevel(i) {
      li = i; guessed = -1; fired = {}; hits = 0; shots = 0; sunk = false;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      for (var r = 1; r <= 5; r++) {
        for (var c = 1; c <= 6; c++) {
          var cell = gid(K + '-c-' + c + '-' + r);
          if (cell) cell.textContent = '(' + c + ',' + r + ')';
        }
      }
      msg('先猜一猜，再点格子开炮。');
    }
    gid(K + '-guess-h').addEventListener('click', function () { guessed = 0; msg('你猜船是横着的。开炮验证一下。'); });
    gid(K + '-guess-v').addEventListener('click', function () { guessed = 1; msg('你猜船是竖着的。开炮验证一下。'); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：打沉 2 格横船', '提高：打沉 2 格竖船', '挑战：打沉 3 格竖船'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    buildGrid();
  }
});
registerAnim({
  key: 'm52-shift',
  title: '平移看数对变化',
  sub: '点向右移，列数加、行数不变；向上移，行数加、列数不变——移一移，数对的含义就出来了。',
  grade: 5,
  kind: '模拟',
  points: ['5.2'],
  render: function (el) {
    var K = 'm52-shift';
    var LEVELS = [
      { label: '基础', dx: 2, dy: 0, target: [4, 2], q: '向右移 2 格，哪个数变？', opts: ['列数 +2', '行数 +2'], ans: 0 },
      { label: '提高', dx: 0, dy: 3, target: [2, 5], q: '向上移 3 格，哪个数变？', opts: ['列数 +3', '行数 +3'], ans: 1 },
      { label: '挑战', dx: 2, dy: 1, target: [4, 3], q: '先向右 2 格，再向上 1 格，数对是？', opts: ['(4,3)', '(3,4)'], ans: 0 }
    ];
    var li = 0, col = 2, row = 2, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 5 年级 · 位置</p>' +
      '<h3>平移看数对变化</h3>' +
      '<p>行从下往上数。起点是 (2,2)。移一移，看看数对里哪个数变了、哪个没动。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：按问题猜一猜。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：移一移，再点“到站了吗”。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-left" type="button">向左</button>' +
      '<button class="btn small primary" id="' + K + '-right" type="button">向右</button>' +
      '<button class="btn small primary" id="' + K + '-up" type="button">向上</button>' +
      '<button class="btn small primary" id="' + K + '-down" type="button">向下</button>' +
      '<button class="btn small primary" id="' + K + '-check" type="button">到站了吗</button></div>' +
      '<div id="' + K + '-grid"></div>' +
      '<p id="' + K + '-pos"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再移一移。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 向右 2 格</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 向上 3 格</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 右 2 上 1</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“左右移变列数，上下移变行数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = '目标：(' + L.target[0] + ',' + L.target[1] + ')。' + L.q;
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      var s = '';
      for (var r = 5; r >= 1; r--) {
        s += '<div>';
        for (var c = 1; c <= 6; c++) {
          s += '<span style="display:inline-block;width:26px;height:26px;border:1px solid #666;text-align:center;background:' + ((c === col && r === row) ? '#f97316' : '#fff') + '">' + ((c === col && r === row) ? '●' : '') + '</span>';
        }
        s += ' 第 ' + r + ' 行</div>';
      }
      var gr = gid(K + '-grid');
      if (gr) gr.innerHTML = s;
      var p = gid(K + '-pos');
      if (p) p.textContent = '现在在 (' + col + ',' + row + ')：第 ' + col + ' 列第 ' + row + ' 行。';
    }
    function move(dc, dr) {
      col = Math.max(1, Math.min(6, col + dc));
      row = Math.max(1, Math.min(5, row + dr));
      draw();
    }
    function setLevel(i) {
      li = i; col = 2; row = 2; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再移一移。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guessed = 0; msg('你猜 ' + LEVELS[li].opts[0] + '。移一移验证一下。'); });
    gid(K + '-guess-b').addEventListener('click', function () { guessed = 1; msg('你猜 ' + LEVELS[li].opts[1] + '。移一移验证一下。'); });
    gid(K + '-left').addEventListener('click', function () { move(-1, 0); });
    gid(K + '-right').addEventListener('click', function () { move(1, 0); });
    gid(K + '-up').addEventListener('click', function () { move(0, 1); });
    gid(K + '-down').addEventListener('click', function () { move(0, -1); });
    gid(K + '-check').addEventListener('click', function () {
      var L = LEVELS[li];
      var ok = guessed === L.ans;
      if (col === L.target[0] && row === L.target[1]) {
        msg('到了！(' + col + ',' + row + ')：' + (L.dx !== 0 && L.dy === 0 ? '列数从 2 变成 ' + col + '，行数还是 2，没动。' : L.dx === 0 && L.dy !== 0 ? '行数从 2 变成 ' + row + '，列数还是 2，没动。' : '列数变成 ' + col + '，行数变成 ' + row + '。') +
          (guessed < 0 ? '下次先猜一猜再移。' : ok ? '你猜对了。' : '你猜的是 ' + L.opts[guessed] + '。'));
        if (ok) {
          if (tiers) tiers.done(li);
          if (typeof markTried === 'function') markTried(K);
        }
      } else {
        msg('还没到：现在是 (' + col + ',' + row + ')，目标是 (' + L.target[0] + ',' + L.target[1] + ')。再移一移。');
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：(2,2)→(4,2)', '提高：(2,2)→(2,5)', '挑战：(2,2)→(4,3)'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});

/* 5.4 可能性：跳过先模拟 100 次（已有 prob，5.4 点页主演示）和公平游戏设计（已有 fairgame，实验室问题挂在 5.4 点页）；做转盘面积定概率。 */
registerAnim({
  key: 'm54-wheel',
  title: '转盘面积定概率',
  sub: '概率就是颜色占转盘的几分之几：扇形越大，指针停在那里的可能性越大。改扇形大小，概率跟着变。',
  grade: 5,
  kind: '模拟',
  points: ['5.4'],
  render: function (el) {
    var K = 'm54-wheel';
    var LEVELS = [
      { label: '基础', red: 1, exp: 5, opts: ['5 次', '10 次', '15 次'], ans: 0 },
      { label: '提高', red: 2, exp: 10, opts: ['5 次', '10 次', '15 次'], ans: 1 },
      { label: '挑战', red: 3, exp: 15, opts: ['5 次', '10 次', '15 次'], ans: 2 }
    ];
    var li = 0, red = 1, guessed = -1, spins = 0, redHits = 0, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 5 年级 · 可能性</p>' +
      '<h3>转盘面积定概率</h3>' +
      '<p>转盘切成 4 份，红色占几份，指针停在红色的可能性就是几分之几。先猜转 20 次大概几次停在红色，再转一转。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：转 20 次，几次停在红色？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：改改红色占几份，再转 20 次。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-red-1" type="button">红 1 份</button>' +
      '<button class="btn small ghost" id="' + K + '-red-2" type="button">红 2 份</button>' +
      '<button class="btn small ghost" id="' + K + '-red-3" type="button">红 3 份</button>' +
      '<button class="btn small primary" id="' + K + '-spin" type="button">转 20 次</button></div>' +
      '<div id="' + K + '-wheel"></div>' +
      '<p id="' + K + '-prob"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“转 20 次”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 红 1 份</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 红 2 份</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 红 3 份</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“红色占几分之几，可能性就是几分之几”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function sector(cx, cy, r, a0, a1) {
      var x0 = cx + r * Math.cos(a0 * Math.PI / 180), y0 = cy + r * Math.sin(a0 * Math.PI / 180);
      var x1 = cx + r * Math.cos(a1 * Math.PI / 180), y1 = cy + r * Math.sin(a1 * Math.PI / 180);
      return 'M' + cx + ' ' + cy + ' L' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' A' + r + ' ' + r + ' 0 0 1 ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' Z';
    }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = '红色占 ' + L.red + ' 份，转 20 次，几次停在红色？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var s = '<svg width="220" height="220" viewBox="0 0 220 220" role="img" aria-label="四等分转盘"><circle cx="110" cy="110" r="90" fill="#fff" stroke="#78716c" stroke-width="2"/>';
      s += '<path d="' + sector(110, 110, 90, -90, -90 + red * 90) + '" fill="#f97316"/>';
      for (var i = 1; i < 4; i++) {
        var a = (-90 + i * 90) * Math.PI / 180;
        s += '<line x1="110" y1="110" x2="' + (110 + 90 * Math.cos(a)).toFixed(1) + '" y2="' + (110 + 90 * Math.sin(a)).toFixed(1) + '" stroke="#78716c" stroke-width="1"/>';
      }
      s += '</svg>';
      var w = gid(K + '-wheel');
      if (w) w.innerHTML = s;
      var p = gid(K + '-prob');
      if (p) p.textContent = '红色占转盘的 ' + red + '/4，指针停在红色的可能性是 ' + red + '/4。';
    }
    function setRed(n) {
      red = n;
      spins = 0; redHits = 0;
      draw();
      msg('红色改成 ' + n + ' 份了，可能性变成 ' + n + '/4。转 20 次试试。');
    }
    function setLevel(i) {
      li = i; guessed = -1; spins = 0; redHits = 0;
      red = LEVELS[i].red;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“转 20 次”。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guessed = 0; msg('你猜 5 次。转 20 次验证一下。'); });
    gid(K + '-guess-b').addEventListener('click', function () { guessed = 1; msg('你猜 10 次。转 20 次验证一下。'); });
    gid(K + '-guess-c').addEventListener('click', function () { guessed = 2; msg('你猜 15 次。转 20 次验证一下。'); });
    gid(K + '-red-1').addEventListener('click', function () { setRed(1); });
    gid(K + '-red-2').addEventListener('click', function () { setRed(2); });
    gid(K + '-red-3').addEventListener('click', function () { setRed(3); });
    gid(K + '-spin').addEventListener('click', function () {
      var L = LEVELS[li];
      var n = 0;
      for (var i = 0; i < 20; i++) if (Math.random() < red / 4) n++;
      spins += 20; redHits += n;
      var ok = guessed === L.ans;
      msg('转了 20 次，红色停了 ' + n + ' 次；按 ' + red + '/4 算，大约是 ' + Math.round(20 * red / 4) + ' 次。' +
        (guessed < 0 ? '下次先猜一猜再转。' : ok ? '你猜对了。' : '你猜的是 ' + L.opts[guessed] + '，大约应该是 ' + L.exp + ' 次。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：红 1/4，大约 5 次', '提高：红 2/4，大约 10 次', '挑战：红 3/4，大约 15 次'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
/* 5.5 简易方程：跳过天平两边同动（已有 balance 旗舰演示，5.5 点页主演示）；做卡片隔离法、条形图列方程、倒推猜数。 */
registerAnim({
  key: 'm55-cards',
  title: '卡片隔离法',
  sub: '把 x 卡片单独留在天平一边：加相反的牌抵消，再除以系数——图画牌慢慢变成数字和字母，代数符号是后长出来的。',
  grade: 5,
  kind: '实验',
  points: ['5.5'],
  render: function (el) {
    var K = 'm55-cards';
    var LEVELS = [
      { label: '基础', eq: 'x + 3 = 8', opts: ['4', '5', '6'], ans: 1, x: 5, acts: ['两边同时拿走 3'], done: 'x = 5', mid: '' },
      { label: '提高', eq: 'x + 5 = 12', opts: ['6', '7', '8'], ans: 1, x: 7, acts: ['两边同时拿走 5'], done: 'x = 7', mid: '' },
      { label: '挑战', eq: '2x + 4 = 10', opts: ['2', '3', '4'], ans: 1, x: 3, acts: ['两边同时拿走 4', '两边同时分成 2 份'], done: 'x = 3', mid: '还剩 2x = 6，再分成 2 份。' }
    ];
    var li = 0, guessed = -1, step = 0, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 5 年级 · 简易方程</p>' +
      '<h3>卡片隔离法</h3>' +
      '<p>天平左边是 x 卡片和数字牌，右边是数字牌。目标：让 x 一个人留在左边。只能两边一起动。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：x 是几？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：按顺序点“两边同动”的牌。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-act-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-act-1" type="button"></button>' +
      '<button class="btn small ghost" id="' + K + '-trap" type="button">只拿走一边（错的）</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点牌。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · x+3=8</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · x+5=12</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 2x+4=10</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“两边同动，x 才能单独留下来”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.eq + '：x 是几？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var a0 = gid(K + '-act-0'); if (a0) a0.textContent = L.acts[0];
      var a1 = gid(K + '-act-1');
      if (a1) { a1.textContent = L.acts[1] || '（没有第二步）'; a1.hidden = !L.acts[1]; }
    }
    function setLevel(i) {
      li = i; guessed = -1; step = 0;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点牌。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guessed = 0; msg('你猜 x = ' + LEVELS[li].opts[0] + '。点牌验证一下。'); });
    gid(K + '-guess-b').addEventListener('click', function () { guessed = 1; msg('你猜 x = ' + LEVELS[li].opts[1] + '。点牌验证一下。'); });
    gid(K + '-guess-c').addEventListener('click', function () { guessed = 2; msg('你猜 x = ' + LEVELS[li].opts[2] + '。点牌验证一下。'); });
    gid(K + '-trap').addEventListener('click', function () {
      msg('天平翘了！只拿走一边的牌，等式就坏了——两边要一起动，天平才平着。');
    });
    gid(K + '-act-0').addEventListener('click', function () {
      var L = LEVELS[li];
      if (step !== 0) { msg('这一步已经做过了，点下一步。'); return; }
      step = 1;
      if (L.acts.length === 1) {
        finish();
      } else {
        msg(L.mid);
      }
    });
    gid(K + '-act-1').addEventListener('click', function () {
      var L = LEVELS[li];
      if (!L.acts[1]) { msg('这一档没有第二步。'); return; }
      if (step !== 1) { msg('先做第一步：' + L.acts[0] + '。'); return; }
      step = 2;
      finish();
    });
    function finish() {
      var L = LEVELS[li];
      var ok = guessed === L.ans;
      msg('x 一个人留在左边了：' + L.done + '。' +
        (guessed < 0 ? '下次先猜一猜再点牌。' : ok ? '你猜对了。' : '你猜的是 x = ' + L.opts[guessed] + '，实际是 x = ' + L.x + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：x+3=8，x=5', '提高：x+5=12，x=7', '挑战：2x+4=10，x=3'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm55-bar',
  title: '条形图列方程',
  sub: '未知量画成一条不知道多长的条，已知量画成定长的条：条与条的等长关系，直接写成方程。',
  grade: 5,
  kind: '模拟',
  points: ['5.5'],
  render: function (el) {
    var K = 'm55-bar';
    var LEVELS = [
      { label: '基础', desc: '一条不知道多长的条，加上一条 5 厘米的条，和一条 12 厘米的条一样长。', eq: 'x + 5 = 12', x: 7, opts: ['5', '7', '12'], ans: 1, bars: [7, 5, 12] },
      { label: '提高', desc: '两条一样长、不知道多长的条，加上一条 4 厘米的条，和一条 14 厘米的条一样长。', eq: '2x + 4 = 14', x: 5, opts: ['4', '5', '6'], ans: 1, bars: [5, 5, 4, 14] },
      { label: '挑战', desc: '一条短条，加上两条和它一样长的短条，一共 15 厘米。', eq: 'x + 2x = 15', x: 5, opts: ['3', '5', '6'], ans: 1, bars: [5, 5, 5, 15] }
    ];
    var li = 0, guessed = -1, drawn = false, written = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 5 年级 · 简易方程</p>' +
      '<h3>条形图列方程</h3>' +
      '<p>先画条，再列式：不知道多长的条就是 x，条和条一样长，就是等号。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：x 是几？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：画条、列式、解出来。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-draw" type="button">画条</button>' +
      '<button class="btn small primary" id="' + K + '-write" type="button">列式</button>' +
      '<button class="btn small primary" id="' + K + '-solve" type="button">解出来</button></div>' +
      '<div id="' + K + '-bars"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“画条”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · x+5=12</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 2x+4=14</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · x+2x=15</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“条一样长就是等号，先画条再列式”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.desc;
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var bb = gid(K + '-bars');
      if (bb) bb.innerHTML = '';
    }
    function setLevel(i) {
      li = i; guessed = -1; drawn = false; written = false;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“画条”。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guessed = 0; msg('你猜 x = ' + LEVELS[li].opts[0] + '。画条验证一下。'); });
    gid(K + '-guess-b').addEventListener('click', function () { guessed = 1; msg('你猜 x = ' + LEVELS[li].opts[1] + '。画条验证一下。'); });
    gid(K + '-guess-c').addEventListener('click', function () { guessed = 2; msg('你猜 x = ' + LEVELS[li].opts[2] + '。画条验证一下。'); });
    gid(K + '-draw').addEventListener('click', function () {
      var L = LEVELS[li];
      drawn = true;
      var s = '';
      for (var i = 0; i < L.bars.length; i++) {
        var n = L.bars[i];
        var label = i < L.bars.length - 1 ? (n === L.x ? 'x（不知道多长）' : String(n)) : '一共 ' + n;
        var color = i < L.bars.length - 1 ? (n === L.x ? '#fde68a' : '#93c5fd') : '#86efac';
        s += '<div style="margin:4px 0"><span style="display:inline-block;width:' + (n * 16) + 'px;height:20px;background:' + color + ';border:1px solid #666"></span> ' + label + '</div>';
      }
      var bb = gid(K + '-bars');
      if (bb) bb.innerHTML = s;
      msg('条画好了：黄条是 x，蓝条是已知的数，绿条是总数。黄条加蓝条，和绿条一样长。');
    });
    gid(K + '-write').addEventListener('click', function () {
      if (!drawn) { msg('先点“画条”。'); return; }
      written = true;
      msg('条一样长就是等号，列式：' + LEVELS[li].eq + '。');
    });
    gid(K + '-solve').addEventListener('click', function () {
      var L = LEVELS[li];
      if (!written) { msg('先点“列式”。'); return; }
      var ok = guessed === L.ans;
      msg(L.eq + '，解得 x = ' + L.x + '。' +
        (guessed < 0 ? '下次先猜一猜再画条。' : ok ? '你猜对了。' : '你猜的是 x = ' + L.opts[guessed] + '，实际是 x = ' + L.x + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：x+5=12，x=7', '提高：2x+4=14，x=5', '挑战：x+2x=15，x=5'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm55-back',
  title: '倒推猜数',
  sub: 'x+5=12，倒着想“哪个数加 5 得 12”：12−5=7。一路倒回去，方程就解出来了。',
  grade: 5,
  kind: '模拟',
  points: ['5.5'],
  render: function (el) {
    var K = 'm55-back';
    var LEVELS = [
      { label: '基础', eq: 'x + 5 = 12', opts: ['7', '17', '5'], ans: 0, x: 7, rev: ['12 − 5 = 7'] },
      { label: '提高', eq: 'x − 3 = 9', opts: ['6', '12', '3'], ans: 1, x: 12, rev: ['9 + 3 = 12'] },
      { label: '挑战', eq: '2x + 3 = 11', opts: ['4', '7', '5'], ans: 0, x: 4, rev: ['11 − 3 = 8', '8 ÷ 2 = 4'] }
    ];
    var li = 0, guessed = -1, step = 0, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 5 年级 · 简易方程</p>' +
      '<h3>倒推猜数</h3>' +
      '<p>方程是顺着算的，解方程是倒着想的：最后一步是什么运算，就先反着做那一步。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：x 是几？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：一步一步倒回去。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-rev-0" type="button">倒回一步</button>' +
      '<button class="btn small primary" id="' + K + '-rev-1" type="button">再倒一步</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“倒回一步”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · x+5=12</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · x−3=9</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 2x+3=11</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“倒着想：加变减，减变加，乘变除”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.eq + '：x 是几？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var r1 = gid(K + '-rev-1');
      if (r1) r1.hidden = L.rev.length < 2;
    }
    function finish() {
      var L = LEVELS[li];
      var ok = guessed === L.ans;
      msg('倒回：' + L.rev.join('；') + '。倒到底了：x = ' + L.x + '。' +
        (guessed < 0 ? '下次先猜一猜再倒推。' : ok ? '你猜对了。' : '你猜的是 x = ' + L.opts[guessed] + '，实际是 x = ' + L.x + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; guessed = -1; step = 0;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“倒回一步”。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guessed = 0; msg('你猜 x = ' + LEVELS[li].opts[0] + '。倒回去验证一下。'); });
    gid(K + '-guess-b').addEventListener('click', function () { guessed = 1; msg('你猜 x = ' + LEVELS[li].opts[1] + '。倒回去验证一下。'); });
    gid(K + '-guess-c').addEventListener('click', function () { guessed = 2; msg('你猜 x = ' + LEVELS[li].opts[2] + '。倒回去验证一下。'); });
    gid(K + '-rev-0').addEventListener('click', function () {
      var L = LEVELS[li];
      if (step !== 0) { msg('这一步已经倒过了。'); return; }
      step = 1;
      if (L.rev.length === 1) {
        msg('倒回一步：' + L.rev[0] + '，所以 x = ' + L.x + '。');
        finish();
      } else {
        msg('先倒最后一步：' + L.rev[0] + '。再倒一步。');
      }
    });
    gid(K + '-rev-1').addEventListener('click', function () {
      var L = LEVELS[li];
      if (L.rev.length < 2) { msg('这一档只有一步。'); return; }
      if (step !== 1) { msg('先倒第一步。'); return; }
      step = 2;
      msg('再倒一步：' + L.rev[1] + '，所以 x = ' + L.x + '。');
      finish();
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：x+5=12，x=7', '提高：x−3=9，x=12', '挑战：2x+3=11，x=4'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});

/* 5.6 多边形的面积：跳过切一刀平移（已有 polyarea，5.6 点页主演示）；polyarea 的三角形模式只有一句话“两个一样的三角形能拼成平行四边形”，没有真的拼，做两个三角形拼；再做方格纸数格子。areabuild（模拟，挂在 5.6 点页）是面积建造者，不覆盖这两个。 */
registerAnim({
  key: 'm56-twotri',
  title: '两个三角形拼平行四边形',
  sub: '两个一模一样的三角形，翻一个拼过去，就是一个平行四边形——一个三角形是它的一半，所以底×高要除以 2。',
  grade: 5,
  kind: '模拟',
  points: ['5.6'],
  render: function (el) {
    var K = 'm56-twotri';
    var LEVELS = [
      { label: '基础', b: 6, h: 4, area: 12, opts: ['24', '12', '6'], ans: 1 },
      { label: '提高', b: 8, h: 3, area: 12, opts: ['24', '12', '8'], ans: 1 },
      { label: '挑战', b: 5, h: 6, area: 15, opts: ['30', '15', '10'], ans: 1 }
    ];
    var li = 0, guessed = -1, joined = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 5 年级 · 多边形的面积</p>' +
      '<h3>两个三角形拼平行四边形</h3>' +
      '<p>三角形面积为什么要除以 2？拼一拼就知道了：两个一样的三角形，拼成一个平行四边形。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：一个三角形的面积是几？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“拼起来”，看两个三角形怎么变成平行四边形。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-join" type="button">拼起来</button></div>' +
      '<div id="' + K + '-pic"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“拼起来”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 底 6 高 4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 底 8 高 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 底 5 高 6</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“两个三角形拼成平行四边形，一个就是一半”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = '底 ' + L.b + ' 厘米、高 ' + L.h + ' 厘米的三角形，面积是几平方厘米？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var s = 24, w = L.b * s, h = L.h * s;
      var pic = '';
      if (!joined) {
        pic = '<svg width="340" height="200" viewBox="0 0 340 200" role="img" aria-label="两个一样的三角形">' +
          '<polygon points="20,170 ' + (20 + w) + ',170 20,' + (170 - h) + '" fill="#93c5fd" stroke="#2563eb" stroke-width="2"/>' +
          '<polygon points="' + (40 + w) + ',170 ' + (40 + 2 * w) + ',170 ' + (40 + 2 * w) + ',' + (170 - h) + '" fill="#fde68a" stroke="#b45309" stroke-width="2"/>' +
          '<text x="20" y="195" font-size="12" fill="#57534e">三角形 1</text>' +
          '<text x="' + (40 + w) + '" y="195" font-size="12" fill="#57534e">三角形 2（翻过来就能拼）</text></svg>';
      } else {
        pic = '<svg width="340" height="200" viewBox="0 0 340 200" role="img" aria-label="拼成的平行四边形">' +
          '<polygon points="20,170 ' + (20 + w) + ',170 ' + (20 + w + 40) + ',' + (170 - h) + ' 60,' + (170 - h) + '" fill="#86efac" stroke="#15803d" stroke-width="2"/>' +
          '<line x1="60" y1="' + (170 - h) + '" x2="' + (20 + w) + '" y2="170" stroke="#15803d" stroke-width="2" stroke-dasharray="5 3"/>' +
          '<text x="20" y="195" font-size="12" fill="#57534e">平行四边形：底 ' + L.b + '，高 ' + L.h + '，面积 ' + (L.b * L.h) + '</text></svg>';
      }
      var p = gid(K + '-pic');
      if (p) p.innerHTML = pic;
    }
    function setLevel(i) {
      li = i; guessed = -1; joined = false;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“拼起来”。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guessed = 0; msg('你猜 ' + LEVELS[li].opts[0] + '。点“拼起来”验证一下。'); });
    gid(K + '-guess-b').addEventListener('click', function () { guessed = 1; msg('你猜 ' + LEVELS[li].opts[1] + '。点“拼起来”验证一下。'); });
    gid(K + '-guess-c').addEventListener('click', function () { guessed = 2; msg('你猜 ' + LEVELS[li].opts[2] + '。点“拼起来”验证一下。'); });
    gid(K + '-join').addEventListener('click', function () {
      var L = LEVELS[li];
      joined = true;
      draw();
      var ok = guessed === L.ans;
      msg('拼好了：两个三角形拼成了一个平行四边形，底 ' + L.b + '、高 ' + L.h + '，面积 ' + L.b + '×' + L.h + '=' + (L.b * L.h) + '；一个三角形就是它的一半，' + (L.b * L.h) + '÷2=' + L.area + '。' +
        (guessed < 0 ? '下次先猜一猜再拼。' : ok ? '你猜对了。' : '你猜的是 ' + L.opts[guessed] + '，实际是 ' + L.area + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：6×4÷2=12', '提高：8×3÷2=12', '挑战：5×6÷2=15'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm56-grid',
  title: '方格纸数格子',
  sub: '不背公式，先在方格纸上数图形占了几格：每一行都是 6 格，4 行就是 24 格——斜边当高，数出来的格子会对不上。',
  grade: 5,
  kind: '模拟',
  points: ['5.6'],
  render: function (el) {
    var K = 'm56-grid';
    var LEVELS = [
      { label: '基础', b: 6, h: 4, s: 5, area: 24, wrong: 30, opts: ['24', '30', '20'], ans: 0 },
      { label: '提高', b: 5, h: 3, s: 4, area: 15, wrong: 20, opts: ['15', '20', '12'], ans: 0 },
      { label: '挑战', b: 8, h: 2, s: 3, area: 16, wrong: 24, opts: ['16', '24', '10'], ans: 0 }
    ];
    var li = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 5 年级 · 多边形的面积</p>' +
      '<h3>方格纸数格子</h3>' +
      '<p>平行四边形放在方格纸上：底是几格，高是几格？斜边可不是高——用斜边算，数出来的格子会对不上。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：这个平行四边形的面积是几平方厘米？（一格是 1 平方厘米）</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“数格子”，一行一行数。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-count" type="button">数格子</button></div>' +
      '<div id="' + K + '-pic"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“数格子”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 底 6 高 4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 底 5 高 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 底 8 高 2</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“数格子得面积，斜边不是高”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = '底 ' + L.b + ' 厘米，高 ' + L.h + ' 厘米，斜边 ' + L.s + ' 厘米。面积是几？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var u = 26, W = (L.b + 2) * u + 20, H = (L.h + 1) * u + 20;
      var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="方格纸上的平行四边形">';
      for (var gx = 0; gx <= L.b + 2; gx++) {
        s += '<line x1="' + (10 + gx * u) + '" y1="10" x2="' + (10 + gx * u) + '" y2="' + (10 + (L.h + 1) * u) + '" stroke="#d6d3d1" stroke-width="1"/>';
      }
      for (var gy = 0; gy <= L.h + 1; gy++) {
        s += '<line x1="10" y1="' + (10 + gy * u) + '" x2="' + (10 + (L.b + 2) * u) + '" y2="' + (10 + gy * u) + '" stroke="#d6d3d1" stroke-width="1"/>';
      }
      var x0 = 10 + u, y0 = 10 + L.h * u;
      s += '<polygon points="' + x0 + ',' + y0 + ' ' + (x0 + L.b * u) + ',' + y0 + ' ' + (x0 + L.b * u - u) + ',10 ' + (x0 - u) + ',10" fill="#dbeafe" fill-opacity="0.7" stroke="#2563eb" stroke-width="2"/>';
      s += '<text x="10" y="' + (H - 4) + '" font-size="12" fill="#57534e">底 ' + L.b + ' 厘米，高 ' + L.h + ' 厘米，斜边 ' + L.s + ' 厘米</text></svg>';
      var p = gid(K + '-pic');
      if (p) p.innerHTML = s;
    }
    function setLevel(i) {
      li = i; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“数格子”。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guessed = 0; msg('你猜 ' + LEVELS[li].opts[0] + '。点“数格子”验证一下。'); });
    gid(K + '-guess-b').addEventListener('click', function () { guessed = 1; msg('你猜 ' + LEVELS[li].opts[1] + '。点“数格子”验证一下。'); });
    gid(K + '-guess-c').addEventListener('click', function () { guessed = 2; msg('你猜 ' + LEVELS[li].opts[2] + '。点“数格子”验证一下。'); });
    gid(K + '-count').addEventListener('click', function () {
      var L = LEVELS[li];
      var ok = guessed === L.ans;
      msg('一行一行数：每一行都是 ' + L.b + ' 格（两头两个半格拼成 1 格），' + L.h + ' 行就是 ' + L.b + '×' + L.h + '=' + L.area + ' 格，面积是 ' + L.area + ' 平方厘米。斜边 ' + L.s + ' 不是高，用它算的 ' + L.b + '×' + L.s + '=' + L.wrong + ' 是错的，数出来的格子对不上。' +
        (guessed < 0 ? '下次先猜一猜再数。' : ok ? '你猜对了。' : '你猜的是 ' + L.opts[guessed] + '，数出来是 ' + L.area + ' 格。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：6×4=24', '提高：5×3=15', '挑战：8×2=16'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
/* 5.7 植树问题：跳过拖树数间隔（已有 planttree，5.7 点页主演示）；做化繁为简、一一对应解释“多 1”、迁移到敲钟/车站/路灯。 */
registerAnim({
  key: 'm57-small',
  title: '化繁为简',
  sub: '100 米画不下，先拿 20 米画图找规律，再回头解 100 米——复杂问题先变简单，是通用解法。',
  grade: 5,
  kind: '模拟',
  points: ['5.7'],
  render: function (el) {
    var K = 'm57-small';
    var LEVELS = [
      { label: '基础', sp: 10, len: 100, trees: 11, q: '100 米，每 10 米种一棵，两端都种，要几棵？', opts: ['10 棵', '11 棵', '12 棵'], ans: 1,
        rows: [['20 米', 2, 3], ['50 米', 5, 6], ['100 米', 10, 11]], small: '20 米：2 个间隔，3 棵树。' },
      { label: '提高', sp: 5, len: 100, trees: 21, q: '100 米，每 5 米种一棵，两端都种，要几棵？', opts: ['20 棵', '21 棵', '22 棵'], ans: 1,
        rows: [['20 米', 4, 5], ['50 米', 10, 11], ['100 米', 20, 21]], small: '20 米：4 个间隔，5 棵树。' },
      { label: '挑战', sp: 5, len: 20, trees: 5, q: '20 米，每 5 米种一棵，两端都种，要几棵？', opts: ['4 棵', '5 棵', '6 棵'], ans: 1,
        rows: [['10 米', 2, 3], ['20 米', 4, 5], ['100 米', 20, 21]], small: '10 米：2 个间隔，3 棵树。' }
    ];
    var li = 0, guessed = -1, sawSmall = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 5 年级 · 植树问题</p>' +
      '<h3>化繁为简</h3>' +
      '<p>大数画不下，就先变小：20 米画得下，规律找出来，再回头解大数。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：按问题猜一猜。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：先画小的，再看规律表。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-small" type="button">先画小的</button>' +
      '<button class="btn small primary" id="' + K + '-table" type="button">看规律表</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“先画小的”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 100 米每 10 米</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 100 米每 5 米</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 20 米每 5 米</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“先变小找规律，再回头解大数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.q;
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
    }
    function setLevel(i) {
      li = i; guessed = -1; sawSmall = false;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“先画小的”。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guessed = 0; msg('你猜 ' + LEVELS[li].opts[0] + '。先画小的验证一下。'); });
    gid(K + '-guess-b').addEventListener('click', function () { guessed = 1; msg('你猜 ' + LEVELS[li].opts[1] + '。先画小的验证一下。'); });
    gid(K + '-guess-c').addEventListener('click', function () { guessed = 2; msg('你猜 ' + LEVELS[li].opts[2] + '。先画小的验证一下。'); });
    gid(K + '-small').addEventListener('click', function () {
      sawSmall = true;
      msg('小的画好了：' + LEVELS[li].small + '间隔数加 1 就是棵数。再看规律表。');
    });
    gid(K + '-table').addEventListener('click', function () {
      var L = LEVELS[li];
      if (!sawSmall) { msg('先点“先画小的”。'); return; }
      var rows = '';
      for (var i = 0; i < L.rows.length; i++) {
        rows += L.rows[i][0] + '：' + L.rows[i][1] + ' 个间隔，' + L.rows[i][2] + ' 棵树；';
      }
      var ok = guessed === L.ans;
      msg('规律表：' + rows + '间隔数加 1 就是棵数，所以 ' + L.len + ' 米要 ' + L.trees + ' 棵树。' +
        (guessed < 0 ? '下次先猜一猜再画。' : ok ? '你猜对了。' : '你猜的是 ' + L.opts[guessed] + '，表上是 ' + L.trees + ' 棵。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：100 米每 10 米，11 棵', '提高：100 米每 5 米，21 棵', '挑战：20 米每 5 米，5 棵'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm57-pair',
  title: '一一对应解释“多 1”',
  sub: '一棵树对一个间隔排下去，最后一棵树后面没有间隔——“多出来的 1”就是它，不是口诀，是数出来的。',
  grade: 5,
  kind: '演示',
  points: ['5.7'],
  render: function (el) {
    var K = 'm57-pair';
    var LEVELS = [
      { label: '基础', n: 5, trees: 6, opts: ['5 棵', '6 棵', '7 棵'], ans: 1 },
      { label: '提高', n: 8, trees: 9, opts: ['8 棵', '9 棵', '10 棵'], ans: 1 },
      { label: '挑战', n: 3, trees: 4, opts: ['3 棵', '4 棵', '5 棵'], ans: 1 }
    ];
    var li = 0, guessed = -1, paired = 0, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 5 年级 · 植树问题</p>' +
      '<h3>一一对应解释“多 1”</h3>' +
      '<p>两端都种，为什么棵数比间隔数多 1？一棵树对一个间隔，配下去就看到了。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：有几个间隔，要种几棵树？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“配一对”，一棵树对一个间隔。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-pair" type="button">配一对</button></div>' +
      '<div id="' + K + '-row"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“配一对”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 5 个间隔</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 8 个间隔</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 3 个间隔</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“最后一棵树没有间隔，多出来的 1 就是它”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.n + ' 个间隔，两端都种，要几棵树？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var s = '';
      for (var i = 0; i < L.trees; i++) {
        var hasPair = i < paired;
        s += '<span style="display:inline-block;width:30px;height:30px;border:1px solid #666;text-align:center;background:' + (hasPair ? '#86efac' : '#fff') + '">树</span>';
        if (i < L.n) s += '<span style="display:inline-block;width:22px;text-align:center;color:' + (hasPair ? '#15803d' : '#999') + '">⌒</span>';
      }
      var r = gid(K + '-row');
      if (r) r.innerHTML = s;
    }
    function setLevel(i) {
      li = i; guessed = -1; paired = 0;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“配一对”。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guessed = 0; msg('你猜 ' + LEVELS[li].opts[0] + '。配一对验证一下。'); });
    gid(K + '-guess-b').addEventListener('click', function () { guessed = 1; msg('你猜 ' + LEVELS[li].opts[1] + '。配一对验证一下。'); });
    gid(K + '-guess-c').addEventListener('click', function () { guessed = 2; msg('你猜 ' + LEVELS[li].opts[2] + '。配一对验证一下。'); });
    gid(K + '-pair').addEventListener('click', function () {
      var L = LEVELS[li];
      if (paired >= L.n) { msg('已经配完了：' + L.n + ' 个间隔都配上了。'); return; }
      paired++;
      draw();
      if (paired < L.n) {
        msg('配了 ' + paired + ' 对：' + paired + ' 棵树对 ' + paired + ' 个间隔。继续配。');
      } else {
        var ok = guessed === L.ans;
        msg('配了 ' + L.n + ' 对，还剩 1 棵树没有间隔——多出来的 1 就是它。所以 ' + L.n + ' 个间隔要 ' + L.trees + ' 棵树。' +
          (guessed < 0 ? '下次先猜一猜再配。' : ok ? '你猜对了。' : '你猜的是 ' + L.opts[guessed] + '，数出来是 ' + L.trees + ' 棵。'));
        if (ok) {
          if (tiers) tiers.done(li);
          if (typeof markTried === 'function') markTried(K);
        }
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：5 个间隔，6 棵树', '提高：8 个间隔，9 棵树', '挑战：3 个间隔，4 棵树'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm57-transfer',
  title: '迁移到敲钟车站路灯',
  sub: '车站是树，站距是间隔；钟声是树，两声之间是间隔——同结构换个情境，再算一次。',
  grade: 5,
  kind: '实验',
  points: ['5.7'],
  render: function (el) {
    var K = 'm57-transfer';
    var LEVELS = [
      { label: '基础', ctx: '车站', q: '5 个站距，每站距 3 分钟，从第一站到最后一站要几分钟？', opts: ['12 分钟', '15 分钟', '18 分钟'], ans: 1, why: '车站是树，站距是间隔：5 个间隔 × 3 分钟 = 15 分钟。' },
      { label: '提高', ctx: '敲钟', q: '敲 5 下，每两下之间 3 秒，一共几秒？', opts: ['9 秒', '12 秒', '15 秒'], ans: 1, why: '钟声是树，两声之间是间隔：5 下只有 4 个间隔，4 × 3 秒 = 12 秒。' },
      { label: '挑战', ctx: '路灯', q: '10 盏路灯，每两盏之间 20 米，第一盏到最后一盏几米？', opts: ['180 米', '200 米', '220 米'], ans: 0, why: '路灯是树，灯距是间隔：10 盏只有 9 个间隔，9 × 20 米 = 180 米。' }
    ];
    var li = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 5 年级 · 植树问题</p>' +
      '<h3>迁移到敲钟车站路灯</h3>' +
      '<p>植树问题不只长在路上：车站、钟声、路灯里都有它。先认出哪个是“树”、哪个是“间隔”，再算。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：按问题猜一猜。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“换个样子”，看树和间隔藏在哪。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-swap" type="button">换个样子</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“换个样子”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 车站</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 敲钟</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 路灯</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“先认树和间隔，再数间隔个数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.ctx + '：' + L.q;
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
    }
    function setLevel(i) {
      li = i; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“换个样子”。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guessed = 0; msg('你猜 ' + LEVELS[li].opts[0] + '。点“换个样子”验证一下。'); });
    gid(K + '-guess-b').addEventListener('click', function () { guessed = 1; msg('你猜 ' + LEVELS[li].opts[1] + '。点“换个样子”验证一下。'); });
    gid(K + '-guess-c').addEventListener('click', function () { guessed = 2; msg('你猜 ' + LEVELS[li].opts[2] + '。点“换个样子”验证一下。'); });
    gid(K + '-swap').addEventListener('click', function () {
      var L = LEVELS[li];
      var ok = guessed === L.ans;
      msg(L.why + (guessed < 0 ? '下次先猜一猜再换样子。' : ok ? '你猜对了。' : '你猜的是 ' + L.opts[guessed] + '，再数一数有几个间隔。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：车站 15 分钟', '提高：敲钟 12 秒', '挑战：路灯 180 米'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});

/* 5.8 因数与倍数：跳过矩形阵列拼长方形（已有 factor，5.8 点页主演示）；factor 只有长方形和因数表，没有下注选数的游戏，做因数游戏；再做埃拉托斯特尼筛法。 */
registerAnim({
  key: 'm58-game',
  title: '因数游戏',
  sub: '轮流选数：你得这个数，对手得它所有因数（不含它本身）的分——因数多的数看着大，实际是陷阱。',
  grade: 5,
  kind: '实验',
  points: ['5.8'],
  render: function (el) {
    var K = 'm58-game';
    var LEVELS = [
      { label: '基础', n: 12, you: 12, opp: 16, factors: '1、2、3、4、6', q: '选 12，你得 12 分，对手得几分？', opts: ['12 分', '16 分', '7 分'], ans: 1,
        verdict: '对手 16 分，比你还多 4 分——12 的因数太多，看着大，实际亏了。' },
      { label: '提高', n: 7, you: 7, opp: 1, factors: '1', q: '选 7，你得 7 分，对手得几分？', opts: ['1 分', '7 分', '8 分'], ans: 0,
        verdict: '对手只有 1 分——7 是质数，只有一个真因数 1，选它最划算。' },
      { label: '挑战', n: 8, you: 8, opp: 7, factors: '1、2、4', q: '选 8，你得 8 分，对手得几分？', opts: ['15 分', '7 分', '8 分'], ans: 1,
        verdict: '对手 7 分，你 8 分，只赚 1 分——选数之前，先想想它有几个因数。' }
    ];
    var li = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 5 年级 · 因数与倍数</p>' +
      '<h3>因数游戏</h3>' +
      '<p>选一个数，你得这个数的分，对手得它所有因数（不含它本身）的分。数越大越好吗？先算算这笔买卖。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：对手得几分？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“算一算”，看对手拿走多少分。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-calc" type="button">算一算</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“算一算”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 选 12</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 选 7</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 选 8</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“选数之前，先数它有几个因数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.q;
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
    }
    function setLevel(i) {
      li = i; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“算一算”。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guessed = 0; msg('你猜对手得 ' + LEVELS[li].opts[0] + '。算一算验证一下。'); });
    gid(K + '-guess-b').addEventListener('click', function () { guessed = 1; msg('你猜对手得 ' + LEVELS[li].opts[1] + '。算一算验证一下。'); });
    gid(K + '-guess-c').addEventListener('click', function () { guessed = 2; msg('你猜对手得 ' + LEVELS[li].opts[2] + '。算一算验证一下。'); });
    gid(K + '-calc').addEventListener('click', function () {
      var L = LEVELS[li];
      var ok = guessed === L.ans;
      msg('选 ' + L.n + '：你得 ' + L.you + ' 分；' + L.n + ' 的因数（不含它本身）是 ' + L.factors + '，加起来是 ' + L.opp + ' 分，对手得 ' + L.opp + ' 分。' + L.verdict +
        (guessed < 0 ? '下次先猜一猜再算。' : ok ? '你猜对了。' : '你猜的是 ' + L.opts[guessed] + '，实际是 ' + L.opp + ' 分。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：选 12，对手 16 分', '提高：选 7，对手 1 分', '挑战：选 8，对手 7 分'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm58-sieve',
  title: '埃拉托斯特尼筛法',
  sub: '一张百数表，先划 2 的倍数、再划 3 的倍数……没被划掉的就是质数；划到 7 就可以停了。',
  grade: 5,
  kind: '实验',
  points: ['5.8'],
  render: function (el) {
    var K = 'm58-sieve';
    var LEVELS = [
      { label: '基础', q: '1 是质数吗？', opts: ['是', '不是'], ans: 1 },
      { label: '提高', q: '筛完 1 到 100，剩下几个质数？', opts: ['24 个', '25 个', '26 个'], ans: 1 },
      { label: '挑战', q: '为什么划到 7 就停？', opts: ['7×7=49，下一个 11×11=121 大于 100', '7 是最大的质数', '划不动了'], ans: 0 }
    ];
    var li = 0, guessed = -1, step = 0, crossed = {}, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 5 年级 · 因数与倍数</p>' +
      '<h3>埃拉托斯特尼筛法</h3>' +
      '<p>1 到 100 的数排好：先划掉 1，再按顺序划掉 2、3、5、7 的倍数（质数本身留下）。筛子筛完，剩下的就是质数。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：按问题猜一猜。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：按顺序划，划完点“数一数”。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-s-1" type="button">划掉 1</button>' +
      '<button class="btn small primary" id="' + K + '-s-2" type="button">划 2 的倍数</button>' +
      '<button class="btn small primary" id="' + K + '-s-3" type="button">划 3 的倍数</button>' +
      '<button class="btn small primary" id="' + K + '-s-5" type="button">划 5 的倍数</button>' +
      '<button class="btn small primary" id="' + K + '-s-7" type="button">划 7 的倍数</button>' +
      '<button class="btn small primary" id="' + K + '-count" type="button">数一数</button></div>' +
      '<div id="' + K + '-grid"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再按顺序划。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 1 是质数吗</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 剩下几个质数</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 为什么停在 7</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“划到 7 就停，剩下 25 个质数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function buildGrid() {
      var s = '';
      for (var r = 0; r < 10; r++) {
        s += '<div>';
        for (var c = 1; c <= 10; c++) {
          var n = r * 10 + c;
          s += '<span id="' + K + '-n-' + n + '" style="display:inline-block;width:26px;height:26px;border:1px solid #999;text-align:center;background:#fff">' + n + '</span>';
        }
        s += '</div>';
      }
      var g = gid(K + '-grid');
      if (g) g.innerHTML = s;
    }
    function cross(p) {
      for (var m = p * 2; m <= 100; m += p) {
        if (!crossed[m]) {
          crossed[m] = true;
          var cell = gid(K + '-n-' + m);
          if (cell) { cell.textContent = '×'; cell.style.background = '#e5e7eb'; }
        }
      }
    }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.q;
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
    }
    function setLevel(i) {
      li = i; guessed = -1; step = 0; crossed = {};
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      buildGrid();
      draw();
      msg('先猜一猜，再按顺序划。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guessed = 0; msg('你猜 ' + LEVELS[li].opts[0] + '。划完验证一下。'); });
    gid(K + '-guess-b').addEventListener('click', function () { guessed = 1; msg('你猜 ' + LEVELS[li].opts[1] + '。划完验证一下。'); });
    gid(K + '-guess-c').addEventListener('click', function () { guessed = 2; msg('你猜 ' + LEVELS[li].opts[2] + '。划完验证一下。'); });
    gid(K + '-s-1').addEventListener('click', function () {
      if (step !== 0) { msg('1 已经划过了，按顺序往下划。'); return; }
      step = 1;
      crossed[1] = true;
      var cell = gid(K + '-n-1');
      if (cell) { cell.textContent = '×'; cell.style.background = '#e5e7eb'; }
      msg('1 划掉了：1 只有一个因数，既不是质数，也不是合数。');
    });
    gid(K + '-s-2').addEventListener('click', function () {
      if (step !== 1) { msg('先划掉 1，再划 2 的倍数。'); return; }
      step = 2; cross(2);
      msg('2 的倍数划掉了，2 本身留下：2 是质数。');
    });
    gid(K + '-s-3').addEventListener('click', function () {
      if (step !== 2) { msg('先划 2 的倍数，再划 3 的倍数。'); return; }
      step = 3; cross(3);
      msg('3 的倍数划掉了，3 本身留下。');
    });
    gid(K + '-s-5').addEventListener('click', function () {
      if (step !== 3) { msg('先划 3 的倍数，再划 5 的倍数。'); return; }
      step = 4; cross(5);
      msg('5 的倍数划掉了，5 本身留下。');
    });
    gid(K + '-s-7').addEventListener('click', function () {
      if (step !== 4) { msg('先划 5 的倍数，再划 7 的倍数。'); return; }
      step = 5; cross(7);
      msg('7 的倍数划掉了，7 本身留下。划到 7 就可以停了：下一个质数是 11，11×11=121，已经大于 100 了。');
    });
    gid(K + '-count').addEventListener('click', function () {
      if (step < 5) { msg('先把 1、2、3、5、7 的倍数都划掉，再数。'); return; }
      var left = [];
      for (var n = 2; n <= 100; n++) if (!crossed[n]) left.push(n);
      var ok = guessed === LEVELS[li].ans;
      msg('剩下 ' + left.length + ' 个质数：' + left.join('、') + '。' +
        (guessed < 0 ? '下次先猜一猜再筛。' : ok ? '你猜对了。' : '你猜的是 ' + LEVELS[li].opts[guessed] + '，数出来是 ' + left.length + ' 个。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：1 不是质数', '提高：剩下 25 个质数', '挑战：11×11=121 大于 100'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    buildGrid();
    draw();
  }
});
/* 5.9 长方体和正方体：跳过分层装块数体积（已有 cuboid，5.9 点页主演示）；cuboid 只有一层格子，没有展开图，做展开图折叠；再做拆面算表面积。 */
registerAnim({
  key: 'm59-net',
  title: '展开图折叠',
  sub: '把盒子剪开展平，6 个面排开：相对的面一模一样。再一片一片折回去，看面是怎么拼成盒子的。',
  grade: 5,
  kind: '模拟',
  points: ['5.9'],
  render: function (el) {
    var K = 'm59-net';
    var LEVELS = [
      { label: '基础', l: 5, w: 4, h: 3, surf: 94, opts: ['94 平方厘米', '60 平方厘米', '120 平方厘米'], ans: 0 },
      { label: '提高', l: 4, w: 4, h: 4, surf: 96, opts: ['96 平方厘米', '64 平方厘米', '128 平方厘米'], ans: 0 },
      { label: '挑战', l: 6, w: 3, h: 2, surf: 72, opts: ['72 平方厘米', '36 平方厘米', '108 平方厘米'], ans: 0 }
    ];
    var li = 0, guessed = -1, folded = 0, tiers = null;
    var FACES = [
      { name: '下面', pair: '上下' }, { name: '前面', pair: '前后' }, { name: '上面', pair: '上下' },
      { name: '后面', pair: '前后' }, { name: '左面', pair: '左右' }, { name: '右面', pair: '左右' }
    ];
    el.innerHTML =
      '<p class="demo-tag">模拟 · 5 年级 · 长方体和正方体</p>' +
      '<h3>展开图折叠</h3>' +
      '<p>一张展开图，6 个面。点“折一片”，看它们一片一片立起来折成盒子：相对的面，颜色一样、大小一样。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：这个盒子的表面积是几平方厘米？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“折一片”，6 个面一片一片立起来。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-fold" type="button">折一片</button></div>' +
      '<div id="' + K + '-net"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“折一片”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 长 5 宽 4 高 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 棱长 4 的正方体</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 长 6 宽 3 高 2</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“相对的面一模一样，表面积是三对面加起来”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function faceSize(L, pair) {
      if (pair === '前后') return L.l + '×' + L.h;
      if (pair === '左右') return L.w + '×' + L.h;
      return L.l + '×' + L.w;
    }
    function faceArea(L, pair) {
      if (pair === '前后') return L.l * L.h;
      if (pair === '左右') return L.w * L.h;
      return L.l * L.w;
    }
    function drawNet() {
      var L = LEVELS[li];
      var colors = { '前后': '#93c5fd', '左右': '#86efac', '上下': '#fde68a' };
      var cells = [
        { f: 0, x: 1, y: 0 }, { f: 1, x: 1, y: 1 }, { f: 2, x: 1, y: 2 },
        { f: 3, x: 1, y: 3 }, { f: 4, x: 0, y: 1 }, { f: 5, x: 2, y: 1 }
      ];
      var s = '<svg width="300" height="260" viewBox="0 0 300 260" role="img" aria-label="长方体展开图">';
      for (var i = 0; i < cells.length; i++) {
        var c = cells[i], F = FACES[c.f];
        var done = i < folded;
        s += '<rect x="' + (20 + c.x * 70) + '" y="' + (10 + c.y * 55) + '" width="66" height="51" rx="4" fill="' + colors[F.pair] + '" fill-opacity="' + (done ? '1' : '0.45') + '" stroke="#57534e" stroke-width="2"/>';
        s += '<text x="' + (53 + c.x * 70) + '" y="' + (30 + c.y * 55) + '" font-size="12" text-anchor="middle" fill="#1e293b">' + F.name + '</text>';
        s += '<text x="' + (53 + c.x * 70) + '" y="' + (48 + c.y * 55) + '" font-size="11" text-anchor="middle" fill="#57534e">' + faceSize(L, F.pair) + '</text>';
      }
      s += '</svg>';
      var n = gid(K + '-net');
      if (n) n.innerHTML = s;
    }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = '长 ' + L.l + ' 厘米、宽 ' + L.w + ' 厘米、高 ' + L.h + ' 厘米的盒子，表面积是几平方厘米？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      drawNet();
    }
    function setLevel(i) {
      li = i; guessed = -1; folded = 0;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“折一片”。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guessed = 0; msg('你猜 ' + LEVELS[li].opts[0] + '。折一折验证一下。'); });
    gid(K + '-guess-b').addEventListener('click', function () { guessed = 1; msg('你猜 ' + LEVELS[li].opts[1] + '。折一折验证一下。'); });
    gid(K + '-guess-c').addEventListener('click', function () { guessed = 2; msg('你猜 ' + LEVELS[li].opts[2] + '。折一折验证一下。'); });
    gid(K + '-fold').addEventListener('click', function () {
      var L = LEVELS[li];
      if (folded >= 6) { msg('已经折好了。'); return; }
      var F = FACES[folded];
      folded++;
      drawNet();
      if (folded < 6) {
        msg('折起了' + F.name + '（' + faceSize(L, F.pair) + '，' + faceArea(L, F.pair) + ' 平方厘米）。已折 ' + folded + '/6 个面。');
      } else {
        var ok = guessed === L.ans;
        msg('折好了：相对的面一模一样——前后都是 ' + faceSize(L, '前后') + '，左右都是 ' + faceSize(L, '左右') + '，上下都是 ' + faceSize(L, '上下') + '。表面积 = 2×(' + faceArea(L, '上下') + '+' + faceArea(L, '前后') + '+' + faceArea(L, '左右') + ') = ' + L.surf + ' 平方厘米。' +
          (guessed < 0 ? '下次先猜一猜再折。' : ok ? '你猜对了。' : '你猜的是 ' + L.opts[guessed] + '，实际是 ' + L.surf + ' 平方厘米。'));
        if (ok) {
          if (tiers) tiers.done(li);
          if (typeof markTried === 'function') markTried(K);
        }
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：5×4×3，94 平方厘米', '提高：棱长 4，96 平方厘米', '挑战：6×3×2，72 平方厘米'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm59-surface',
  title: '拆面算表面积',
  sub: '长方体 6 个面分三对：前后、左右、上下，每对算一个再乘 2；正方体 6 个面全一样，算一个乘 6。',
  grade: 5,
  kind: '演示',
  points: ['5.9'],
  render: function (el) {
    var K = 'm59-surface';
    var LEVELS = [
      { label: '基础', l: 5, w: 4, h: 3, pairs: [['前后', 15, 30], ['左右', 12, 24], ['上下', 20, 40]], total: 94, opts: ['94', '60', '120'], ans: 0 },
      { label: '提高', l: 4, w: 4, h: 4, pairs: [['前后', 16, 32], ['左右', 16, 32], ['上下', 16, 32]], total: 96, opts: ['96', '64', '128'], ans: 0 },
      { label: '挑战', l: 6, w: 3, h: 2, pairs: [['前后', 12, 24], ['左右', 6, 12], ['上下', 18, 36]], total: 72, opts: ['72', '36', '108'], ans: 0 }
    ];
    var li = 0, guessed = -1, donePairs = {}, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 5 年级 · 长方体和正方体</p>' +
      '<h3>拆面算表面积</h3>' +
      '<p>表面积不用 6 个面一个一个加：相对的面一模一样，三对面，每对算一个再乘 2。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：表面积是几平方厘米？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：一对一对算，再加起来。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-p-0" type="button">算前后</button>' +
      '<button class="btn small primary" id="' + K + '-p-1" type="button">算左右</button>' +
      '<button class="btn small primary" id="' + K + '-p-2" type="button">算上下</button>' +
      '<button class="btn small primary" id="' + K + '-sum" type="button">加起来</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再一对一对算。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 长 5 宽 4 高 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 棱长 4 的正方体</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 长 6 宽 3 高 2</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“每对算一个乘 2，三对加起来”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = '长 ' + L.l + ' 厘米、宽 ' + L.w + ' 厘米、高 ' + L.h + ' 厘米，表面积是几平方厘米？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
    }
    function setLevel(i) {
      li = i; guessed = -1; donePairs = {};
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再一对一对算。');
    }
    function pairText(L, i) {
      var p = L.pairs[i];
      var dims = i === 0 ? L.l + '×' + L.h : i === 1 ? L.w + '×' + L.h : L.l + '×' + L.w;
      return p[0] + '两个面：一个是 ' + dims + '=' + p[1] + ' 平方厘米，两个就是 ' + p[1] + '×2=' + p[2] + ' 平方厘米。';
    }
    gid(K + '-guess-a').addEventListener('click', function () { guessed = 0; msg('你猜 ' + LEVELS[li].opts[0] + '。一对一对算验证一下。'); });
    gid(K + '-guess-b').addEventListener('click', function () { guessed = 1; msg('你猜 ' + LEVELS[li].opts[1] + '。一对一对算验证一下。'); });
    gid(K + '-guess-c').addEventListener('click', function () { guessed = 2; msg('你猜 ' + LEVELS[li].opts[2] + '。一对一对算验证一下。'); });
    gid(K + '-p-0').addEventListener('click', function () { donePairs[0] = true; msg(pairText(LEVELS[li], 0)); });
    gid(K + '-p-1').addEventListener('click', function () { donePairs[1] = true; msg(pairText(LEVELS[li], 1)); });
    gid(K + '-p-2').addEventListener('click', function () { donePairs[2] = true; msg(pairText(LEVELS[li], 2)); });
    gid(K + '-sum').addEventListener('click', function () {
      var L = LEVELS[li];
      if (!donePairs[0] || !donePairs[1] || !donePairs[2]) { msg('三对都要先算一遍，再加起来。'); return; }
      var ok = guessed === L.ans;
      msg('加起来：' + L.pairs[0][2] + '+' + L.pairs[1][2] + '+' + L.pairs[2][2] + '=' + L.total + ' 平方厘米。' +
        (guessed < 0 ? '下次先猜一猜再算。' : ok ? '你猜对了。' : '你猜的是 ' + L.opts[guessed] + '，实际是 ' + L.total + ' 平方厘米。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：5×4×3，94 平方厘米', '提高：棱长 4，96 平方厘米', '挑战：6×3×2，72 平方厘米'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});

/* 5.10 分数的意义和性质：4 种方法全跳过——分数墙重切、分子分母同乘除已有 fraceq（模拟，SIM_LINKS 挂在 5.10 点页）；数轴上的分数点已有 fracnumline（模拟，同挂）；切饼/分物已有 buildfrac（模拟，同挂）+ fraceq 的圆饼；点页主演示 fraction 也是分数模型。本点不新增。 */
/* 5.11 分数的加法和减法：跳过先重切、再数（已有 fracadd，5.11 点页主演示）；做最小公分母 LCD、分子加分子错误按钮。 */
registerAnim({
  key: 'm511-lcd',
  title: '最小公分母',
  sub: '分母 8 和 24，先找最小公倍数 24，再把两个分数都换成以 24 为分母的等值分数，然后分子相加。',
  grade: 5,
  kind: '模拟',
  points: ['5.11'],
  render: function (el) {
    var K = 'm511-lcd';
    var LEVELS = [
      { label: '基础', a: [1, 8], b: [1, 24], lcm: 24, an: 3, bn: 1, sum: '4/24', red: '1/6', opts: ['8', '24', '16'], ans: 1 },
      { label: '提高', a: [3, 8], b: [5, 24], lcm: 24, an: 9, bn: 5, sum: '14/24', red: '7/12', opts: ['8', '24', '12'], ans: 1 },
      { label: '挑战', a: [5, 6], b: [3, 8], lcm: 24, an: 20, bn: 9, sum: '29/24', red: '1又5/24', opts: ['12', '24', '48'], ans: 1 }
    ];
    var li = 0, guessed = -1, sawLcm = false, sawConv = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 5 年级 · 分数的加法和减法</p>' +
      '<h3>最小公分母</h3>' +
      '<p>分母不一样，不能直接加：先找最小公倍数当公分母，两个分数都换过去，再加分子。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：最小公分母是几？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：找最小公倍数，换分母，再加分子。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-lcm" type="button">找最小公倍数</button>' +
      '<button class="btn small primary" id="' + K + '-conv" type="button">换分母</button>' +
      '<button class="btn small primary" id="' + K + '-add" type="button">分子相加</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“找最小公倍数”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 1/8+1/24</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 3/8+5/24</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 5/6+3/8</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“先找最小公倍数，再换分母加分子”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function frac(fr) { return fr[0] + '/' + fr[1]; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = frac(L.a) + ' + ' + frac(L.b) + ' = ？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
    }
    function setLevel(i) {
      li = i; guessed = -1; sawLcm = false; sawConv = false;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“找最小公倍数”。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guessed = 0; msg('你猜最小公分母是 ' + LEVELS[li].opts[0] + '。找一找验证一下。'); });
    gid(K + '-guess-b').addEventListener('click', function () { guessed = 1; msg('你猜最小公分母是 ' + LEVELS[li].opts[1] + '。找一找验证一下。'); });
    gid(K + '-guess-c').addEventListener('click', function () { guessed = 2; msg('你猜最小公分母是 ' + LEVELS[li].opts[2] + '。找一找验证一下。'); });
    gid(K + '-lcm').addEventListener('click', function () {
      var L = LEVELS[li];
      sawLcm = true;
      msg(L.a[1] + ' 的倍数：' + L.a[1] + '、' + (L.a[1] * 2) + '、' + (L.a[1] * 3) + '……；' + L.b[1] + ' 的倍数：' + L.b[1] + '、' + (L.b[1] * 2) + '……最小的公共倍数是 ' + L.lcm + '。');
    });
    gid(K + '-conv').addEventListener('click', function () {
      var L = LEVELS[li];
      if (!sawLcm) { msg('先点“找最小公倍数”。'); return; }
      sawConv = true;
      msg(frac(L.a) + ' = ' + L.an + '/' + L.lcm + '，' + frac(L.b) + ' = ' + L.bn + '/' + L.lcm + '——分子分母同时乘同一个数，分数大小不变。');
    });
    gid(K + '-add').addEventListener('click', function () {
      var L = LEVELS[li];
      if (!sawConv) { msg('先点“换分母”。'); return; }
      var ok = guessed === L.ans;
      msg(L.an + '/' + L.lcm + ' + ' + L.bn + '/' + L.lcm + ' = ' + L.sum + '，也就是 ' + L.red + '。分母一样了，才能数分子。' +
        (guessed < 0 ? '下次先猜一猜再找。' : ok ? '你猜对了。' : '你猜的最小公分母是 ' + L.opts[guessed] + '，实际是 ' + L.lcm + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：1/8+1/24=1/6', '提高：3/8+5/24=7/12', '挑战：5/6+3/8=1又5/24'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm511-trap',
  title: '分子加分子是错的',
  sub: '1/2+1/3，分子加分子、分母加分母得 2/5——可是 2/5 比 1/2 还小，加了一个正数，和怎么比原来还小？',
  grade: 5,
  kind: '实验',
  points: ['5.11'],
  render: function (el) {
    var K = 'm511-trap';
    var LEVELS = [
      { label: '基础', a: [1, 2], b: [1, 3], wrong: '2/5', right: '5/6', opts: ['2/5', '5/6', '1/5'], ans: 1 },
      { label: '提高', a: [1, 2], b: [1, 4], wrong: '2/6', right: '3/4', opts: ['2/6', '3/4', '1/6'], ans: 1 },
      { label: '挑战', a: [2, 3], b: [1, 4], wrong: '3/7', right: '11/12', opts: ['3/7', '11/12', '1/7'], ans: 1 }
    ];
    var li = 0, guessed = -1, sawWrong = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 5 年级 · 分数的加法和减法</p>' +
      '<h3>分子加分子是错的</h3>' +
      '<p>分数加法最容易掉的坑：分子加分子、分母加分母。点一下这个错按钮，看它错在哪。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：等于几？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：先点错按钮，再点对的办法。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-wrong" type="button">分子加分子，分母加分母（错的）</button>' +
      '<button class="btn small primary" id="' + K + '-right" type="button">先重切再数（对的）</button></div>' +
      '<div id="' + K + '-bars"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点错按钮试试。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 1/2+1/3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 1/2+1/4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 2/3+1/4</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“分母不一样，先重切再数，不能分子分母各加各的”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function frac(fr) { return fr[0] + '/' + fr[1]; }
    function bar(n, d, color, label) {
      var w = Math.round(n / d * 260);
      return '<div style="margin:4px 0"><span style="display:inline-block;width:' + w + 'px;height:20px;background:' + color + ';border:1px solid #666"></span> ' + label + '</div>';
    }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = frac(L.a) + ' + ' + frac(L.b) + ' = ？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var bb = gid(K + '-bars');
      if (bb) bb.innerHTML = bar(L.a[0], L.a[1], '#93c5fd', frac(L.a)) + bar(L.b[0], L.b[1], '#fde68a', frac(L.b));
    }
    function setLevel(i) {
      li = i; guessed = -1; sawWrong = false;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点错按钮试试。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guessed = 0; msg('你猜 ' + LEVELS[li].opts[0] + '。点错按钮试试。'); });
    gid(K + '-guess-b').addEventListener('click', function () { guessed = 1; msg('你猜 ' + LEVELS[li].opts[1] + '。点错按钮试试。'); });
    gid(K + '-guess-c').addEventListener('click', function () { guessed = 2; msg('你猜 ' + LEVELS[li].opts[2] + '。点错按钮试试。'); });
    gid(K + '-wrong').addEventListener('click', function () {
      var L = LEVELS[li];
      sawWrong = true;
      var wp = L.wrong.split('/');
      var bb = gid(K + '-bars');
      if (bb) bb.innerHTML = bar(L.a[0], L.a[1], '#93c5fd', frac(L.a)) + bar(L.b[0], L.b[1], '#fde68a', frac(L.b)) + bar(+wp[0], +wp[1], '#fca5a5', '错答案 ' + L.wrong);
      msg('分子加分子、分母加分母，得 ' + L.wrong + '。可是 ' + L.wrong + ' 比 ' + frac(L.a) + ' 还小——加了一个正数，和怎么比原来还小？这条红条当场露馅了。');
    });
    gid(K + '-right').addEventListener('click', function () {
      var L = LEVELS[li];
      if (!sawWrong) { msg('先点错按钮，看它错在哪。'); return; }
      var rp = L.right.split('/');
      var bb = gid(K + '-bars');
      if (bb) bb.innerHTML = bar(L.a[0], L.a[1], '#93c5fd', frac(L.a)) + bar(L.b[0], L.b[1], '#fde68a', frac(L.b)) + bar(+rp[0], +rp[1], '#86efac', '正确答案 ' + L.right);
      var ok = guessed === L.ans;
      msg('先重切再数：两个分数切成一样的小份，数一数，得 ' + L.right + '。拼完的条比 ' + frac(L.a) + ' 长，这才对——加了东西，和要变大。' +
        (guessed < 0 ? '下次先猜一猜再点。' : ok ? '你猜对了。' : '你猜的是 ' + L.opts[guessed] + '，实际是 ' + L.right + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：1/2+1/3=5/6', '提高：1/2+1/4=3/4', '挑战：2/3+1/4=11/12'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
/* 5.12 图形的运动（三）：跳过绕钉旋转 + 角度盘（已有 rotate，5.12 点页主演示；rotate 的文字提到了分针 12→3 是 90°，但没有钟表操作）；做三要素齐全才转得动、钟表指针看旋转。 */
registerAnim({
  key: 'm512-three',
  title: '三要素齐全才转得动',
  sub: '在软件里转图形，必须先定中心、再选方向、再输角度，缺一个都转不成——三要素是操作逼出来的，不是背出来的。',
  grade: 5,
  kind: '模拟',
  points: ['5.12'],
  render: function (el) {
    var K = 'm512-three';
    var LEVELS = [
      { label: '基础', c: '中心点', d: '顺时针', a: 90 },
      { label: '提高', c: '顶点', d: '逆时针', a: 90 },
      { label: '挑战', c: '中心点', d: '顺时针', a: 180 }
    ];
    var li = 0, guessed = -1, center = '', dir = '', ang = 0, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 5 年级 · 图形的运动（三）</p>' +
      '<h3>三要素齐全才转得动</h3>' +
      '<p>旋转有三件事：绕哪个中心转、往哪个方向转、转多少度。缺一个，图形就转不成。</p>' +
      '<p>第 1 步 · 先猜：只定角度，不定中心，能转吗？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-yes" type="button">能</button>' +
      '<button class="btn small primary" id="' + K + '-guess-no" type="button">不能</button></div>' +
      '<p>第 2 步 · 玩一玩：三个都定好，再点“转一转”。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-c-center" type="button">中心：形心</button>' +
      '<button class="btn small ghost" id="' + K + '-c-vertex" type="button">中心：顶点</button>' +
      '<button class="btn small ghost" id="' + K + '-d-cw" type="button">方向：顺时针</button>' +
      '<button class="btn small ghost" id="' + K + '-d-ccw" type="button">方向：逆时针</button>' +
      '<button class="btn small ghost" id="' + K + '-a-90" type="button">角度：90°</button>' +
      '<button class="btn small ghost" id="' + K + '-a-180" type="button">角度：180°</button>' +
      '<button class="btn small primary" id="' + K + '-turn" type="button">转一转</button></div>' +
      '<div id="' + K + '-pic"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再把三个要素定好。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 绕形心顺时针 90°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 绕顶点逆时针 90°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 绕形心顺时针 180°</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“中心、方向、角度，缺一个都转不成”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw(deg) {
      var L = LEVELS[li];
      var cx = 160, cy = center === '顶点' ? 60 : 127;
      var s = '<svg width="320" height="220" viewBox="0 0 320 220" role="img" aria-label="三角形旋转">' +
        '<polygon points="160,60 220,160 100,160" fill="#dbeafe" stroke="#2563eb" stroke-width="2" transform="rotate(' + deg + ' ' + cx + ' ' + cy + ')"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="5" fill="#dc2626"/>' +
        '<text x="170" y="' + (cy - 7) + '" font-size="12" fill="#57534e">中心</text>' +
        '<text x="10" y="210" font-size="12" fill="#57534e">目标：绕' + L.c + L.d + '转 ' + L.a + '°</text></svg>';
      var p = gid(K + '-pic');
      if (p) p.innerHTML = s;
    }
    function setLevel(i) {
      li = i; guessed = -1; center = ''; dir = ''; ang = 0;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw(0);
      msg('先猜一猜，再把三个要素定好。');
    }
    gid(K + '-guess-yes').addEventListener('click', function () { guessed = 0; msg('你猜能转。把三个要素定好，点“转一转”试试。'); });
    gid(K + '-guess-no').addEventListener('click', function () { guessed = 1; msg('你猜不能转。把三个要素定好，点“转一转”试试。'); });
    gid(K + '-c-center').addEventListener('click', function () { center = '中心点'; msg('中心定好了：形心。'); });
    gid(K + '-c-vertex').addEventListener('click', function () { center = '顶点'; msg('中心定好了：顶点。'); });
    gid(K + '-d-cw').addEventListener('click', function () { dir = '顺时针'; msg('方向定好了：顺时针。'); });
    gid(K + '-d-ccw').addEventListener('click', function () { dir = '逆时针'; msg('方向定好了：逆时针。'); });
    gid(K + '-a-90').addEventListener('click', function () { ang = 90; msg('角度定好了：90°。'); });
    gid(K + '-a-180').addEventListener('click', function () { ang = 180; msg('角度定好了：180°。'); });
    gid(K + '-turn').addEventListener('click', function () {
      var L = LEVELS[li];
      var missing = [];
      if (!center) missing.push('中心');
      if (!dir) missing.push('方向');
      if (!ang) missing.push('角度');
      if (missing.length) {
        msg('转不成：还缺' + missing.join('、') + '。三个要素齐了才能转。');
        return;
      }
      var deg = dir === '顺时针' ? ang : -ang;
      draw(deg);
      var match = center === L.c && dir === L.d && ang === L.a;
      var ok = guessed === 1;
      msg('绕' + center + dir + '转了 ' + ang + '°：还是原来的三角形，边长、角度一点没变。' +
        (match ? '和目标一样。' : '和目标不一样：目标是绕' + L.c + L.d + '转 ' + L.a + '°，再调一调。') +
        (guessed < 0 ? '' : ok ? '你猜对了：只定角度确实转不成。' : '你猜的是能转——刚才缺要素的时候，是不是转不成？'));
      if (ok && match) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else if (match) {
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：绕形心顺时针 90°', '提高：绕顶点逆时针 90°', '挑战：绕形心顺时针 180°'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw(0);
  }
});
registerAnim({
  key: 'm512-clock',
  title: '钟表指针看旋转',
  sub: '分针从 12 走到 3，是顺时针 90°；走到 6，是 180°。信号旗从一个字母转到另一个字母，也是一次旋转。',
  grade: 5,
  kind: '演示',
  points: ['5.12'],
  render: function (el) {
    var K = 'm512-clock';
    var LEVELS = [
      { label: '基础', from: 12, to: 3, deg: 90, opts: ['30°', '90°', '180°'], ans: 1 },
      { label: '提高', from: 12, to: 6, deg: 180, opts: ['90°', '180°', '270°'], ans: 1 },
      { label: '挑战', from: 3, to: 9, deg: 180, opts: ['90°', '180°', '360°'], ans: 1 }
    ];
    var li = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 5 年级 · 图形的运动（三）</p>' +
      '<h3>钟表指针看旋转</h3>' +
      '<p>生活里到处是旋转：钟表指针转一圈是 360°，一格是 30°。先认生活里的旋转，再画几何里的旋转。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：分针转了几度？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“拨分针”，看它转到哪。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-dial" type="button">拨分针</button></div>' +
      '<div id="' + K + '-clock"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“拨分针”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 12→3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 12→6</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 3→9</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“分针走一格 30°，顺时针转”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function handAngle(n) { return (n % 12) * 30; }
    function drawFace(to) {
      var s = '<svg width="220" height="220" viewBox="0 0 220 220" role="img" aria-label="钟面">';
      s += '<circle cx="110" cy="110" r="95" fill="#fff" stroke="#334155" stroke-width="3"/>';
      for (var i = 0; i < 12; i++) {
        var a = i * 30 * Math.PI / 180;
        var x1 = 110 + 82 * Math.sin(a), y1 = 110 - 82 * Math.cos(a);
        var x2 = 110 + 90 * Math.sin(a), y2 = 110 - 90 * Math.cos(a);
        s += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="#334155" stroke-width="3"/>';
        var num = i === 0 ? 12 : i;
        var nx = 110 + 66 * Math.sin(a), ny = 110 - 66 * Math.cos(a) + 5;
        s += '<text x="' + nx.toFixed(1) + '" y="' + ny.toFixed(1) + '" font-size="15" text-anchor="middle" fill="#1e293b">' + num + '</text>';
      }
      if (to !== null) {
        s += '<line x1="110" y1="110" x2="110" y2="30" stroke="#dc2626" stroke-width="4" stroke-linecap="round" transform="rotate(' + handAngle(to) + ' 110 110)"/>';
      }
      s += '<circle cx="110" cy="110" r="5" fill="#334155"/></svg>';
      var c = gid(K + '-clock');
      if (c) c.innerHTML = s;
    }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = '分针从 ' + L.from + ' 走到 ' + L.to + '，顺时针转了几度？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      drawFace(L.from);
    }
    function setLevel(i) {
      li = i; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“拨分针”。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guessed = 0; msg('你猜 ' + LEVELS[li].opts[0] + '。拨一下验证。'); });
    gid(K + '-guess-b').addEventListener('click', function () { guessed = 1; msg('你猜 ' + LEVELS[li].opts[1] + '。拨一下验证。'); });
    gid(K + '-guess-c').addEventListener('click', function () { guessed = 2; msg('你猜 ' + LEVELS[li].opts[2] + '。拨一下验证。'); });
    gid(K + '-dial').addEventListener('click', function () {
      var L = LEVELS[li];
      drawFace(L.to);
      var ok = guessed === L.ans;
      var steps = L.deg / 30;
      msg('分针从 ' + L.from + ' 走到 ' + L.to + '，走了 ' + steps + ' 格，一格 30°，顺时针转了 ' + L.deg + '°。' +
        (guessed < 0 ? '下次先猜一猜再拨。' : ok ? '你猜对了。' : '你猜的是 ' + L.opts[guessed] + '，实际是 ' + L.deg + '°。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：12→3 是 90°', '提高：12→6 是 180°', '挑战：3→9 是 180°'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});

/* 5.13 折线统计图、找次品：跳过三组称找次品（已有 findbad，5.13 点页主演示）；做斜率即变化、画图列表比方案、自己画折线图。 */
registerAnim({
  key: 'm513-slope',
  title: '斜率即变化',
  sub: '两段线一样高，陡的那段长得更快——变化看斜率，数值看高度，两件事分开读。',
  grade: 5,
  kind: '模拟',
  points: ['5.13'],
  render: function (el) {
    var K = 'm513-slope';
    var DATA = [20, 40, 55, 70, 100, 110];
    var SEGS = {
      '1→2': { rise: 20, run: 1, rate: 20 },
      '2→3': { rise: 15, run: 1, rate: 15 },
      '3→4': { rise: 15, run: 1, rate: 15 },
      '4→5': { rise: 30, run: 1, rate: 30 },
      '5→6': { rise: 10, run: 1, rate: 10 },
      '2→4': { rise: 30, run: 2, rate: 15 }
    };
    var LEVELS = [
      { label: '基础', q: '哪一段涨得最多？', opts: ['2→3 月', '4→5 月', '5→6 月'], ans: 1 },
      { label: '提高', q: '哪一段涨得最快？', opts: ['2→4 月', '4→5 月', '1→2 月'], ans: 1 },
      { label: '挑战', q: '2→4 月和 4→5 月都涨了 30 元，谁涨得快？', opts: ['2→4 月', '4→5 月', '一样快'], ans: 1 }
    ];
    var li = 0, guessed = -1, picked = '', tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 5 年级 · 折线统计图</p>' +
      '<h3>斜率即变化</h3>' +
      '<p>小明 1 到 6 月的存钱：20、40、55、70、100、110 元。线爬得越高是钱越多，线越陡是长得越快——两件事别混了。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：按问题猜一猜。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点一段线，看它涨了多少、花了几个月，再点“比一比”。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-seg-12" type="button">1→2 月</button>' +
      '<button class="btn small ghost" id="' + K + '-seg-23" type="button">2→3 月</button>' +
      '<button class="btn small ghost" id="' + K + '-seg-34" type="button">3→4 月</button>' +
      '<button class="btn small ghost" id="' + K + '-seg-45" type="button">4→5 月</button>' +
      '<button class="btn small ghost" id="' + K + '-seg-56" type="button">5→6 月</button>' +
      '<button class="btn small ghost" id="' + K + '-seg-24" type="button">2→4 月</button>' +
      '<button class="btn small primary" id="' + K + '-compare" type="button">比一比</button></div>' +
      '<div id="' + K + '-chart"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点一段线。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 涨得最多</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 涨得最快</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 一样高谁快</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“涨多少看高度，涨多快看斜率”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawChart() {
      var pts = [];
      for (var i = 0; i < DATA.length; i++) pts.push((40 + i * 44) + ',' + (180 - DATA[i] * 1.2));
      var s = '<svg width="320" height="200" viewBox="0 0 320 200" role="img" aria-label="存钱折线图">';
      s += '<line x1="30" y1="180" x2="300" y2="180" stroke="#78716c" stroke-width="2"/>';
      s += '<line x1="30" y1="20" x2="30" y2="180" stroke="#78716c" stroke-width="2"/>';
      s += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="#2563eb" stroke-width="3"/>';
      for (var j = 0; j < DATA.length; j++) {
        var x = 40 + j * 44, y = 180 - DATA[j] * 1.2;
        s += '<circle cx="' + x + '" cy="' + y.toFixed(1) + '" r="5" fill="#f97316"/>';
        s += '<text x="' + x + '" y="196" font-size="11" text-anchor="middle" fill="#57534e">' + (j + 1) + '月</text>';
        s += '<text x="' + x + '" y="' + (y - 10).toFixed(1) + '" font-size="11" text-anchor="middle" fill="#57534e">' + DATA[j] + '</text>';
      }
      s += '</svg>';
      var c = gid(K + '-chart');
      if (c) c.innerHTML = s;
    }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.q;
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      drawChart();
    }
    function setLevel(i) {
      li = i; guessed = -1; picked = '';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点一段线。');
    }
    function pickSeg(name) {
      var s = SEGS[name];
      picked = name;
      msg(name + ' 月：涨了 ' + s.rise + ' 元，花了 ' + s.run + ' 个月，平均每月涨 ' + s.rate + ' 元。线越陡，每月涨得越多。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guessed = 0; msg('你猜 ' + LEVELS[li].opts[0] + '。点一段线验证一下。'); });
    gid(K + '-guess-b').addEventListener('click', function () { guessed = 1; msg('你猜 ' + LEVELS[li].opts[1] + '。点一段线验证一下。'); });
    gid(K + '-guess-c').addEventListener('click', function () { guessed = 2; msg('你猜 ' + LEVELS[li].opts[2] + '。点一段线验证一下。'); });
    gid(K + '-seg-12').addEventListener('click', function () { pickSeg('1→2'); });
    gid(K + '-seg-23').addEventListener('click', function () { pickSeg('2→3'); });
    gid(K + '-seg-34').addEventListener('click', function () { pickSeg('3→4'); });
    gid(K + '-seg-45').addEventListener('click', function () { pickSeg('4→5'); });
    gid(K + '-seg-56').addEventListener('click', function () { pickSeg('5→6'); });
    gid(K + '-seg-24').addEventListener('click', function () { pickSeg('2→4'); });
    gid(K + '-compare').addEventListener('click', function () {
      var ok = guessed === LEVELS[li].ans;
      var verdict = li === 0 ? '4→5 月涨了 30 元，是涨得最多的一段。'
        : li === 1 ? '4→5 月每月涨 30 元，是涨得最快的一段。'
        : '两段都涨了 30 元，一样高；但 4→5 月只花了 1 个月，2→4 月花了 2 个月，所以 4→5 月快。';
      msg(verdict + (guessed < 0 ? '下次先猜一猜再比。' : ok ? '你猜对了。' : '你猜的是 ' + LEVELS[li].opts[guessed] + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：4→5 月涨 30 元', '提高：4→5 月最快', '挑战：一样高，4→5 月快'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm513-table',
  title: '画图列表比方案',
  sub: '先从 5 个零件画示意图找规律，再列表：2–3 个 1 次、4–9 个 2 次、10–27 个 3 次——次数表自己长出来。',
  grade: 5,
  kind: '演示',
  points: ['5.13'],
  render: function (el) {
    var K = 'm513-table';
    var LEVELS = [
      { label: '基础', n: 5, times: 2, opts: ['1 次', '2 次', '3 次'], ans: 1, chain: '5 个分成 2、2、1：先称 2 对 2，平了就是剩下的 1 个，不平就再称轻的那 2 个。最多 2 次。' },
      { label: '提高', n: 27, times: 3, opts: ['2 次', '3 次', '4 次'], ans: 1, chain: '27 个分成 9、9、9：每次范围缩到三分之一，27→9→3→1，一共 3 次。' },
      { label: '挑战', n: 81, times: 4, opts: ['3 次', '4 次', '5 次'], ans: 1, chain: '81 个分成 27、27、27：每次范围缩到三分之一，81→27→9→3→1，一共 4 次。' }
    ];
    var li = 0, guessed = -1, sawDraw = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 5 年级 · 找次品</p>' +
      '<h3>画图列表比方案</h3>' +
      '<p>找次品不用一个一个试：先从 5 个画图找规律，再把次数列成表，27 个、81 个要几次，表上直接读。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：最少要称几次？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：画一画分法，再看次数表。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-draw" type="button">画一画</button>' +
      '<button class="btn small primary" id="' + K + '-list" type="button">列表</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“画一画”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 5 个</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 27 个</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 81 个</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“每次范围缩到三分之一，次数表是 3 的倍数长出来的”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.n + ' 个零件里有 1 个次品（轻一点），最少要称几次？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
    }
    function setLevel(i) {
      li = i; guessed = -1; sawDraw = false;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“画一画”。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guessed = 0; msg('你猜 ' + LEVELS[li].opts[0] + '。画一画验证一下。'); });
    gid(K + '-guess-b').addEventListener('click', function () { guessed = 1; msg('你猜 ' + LEVELS[li].opts[1] + '。画一画验证一下。'); });
    gid(K + '-guess-c').addEventListener('click', function () { guessed = 2; msg('你猜 ' + LEVELS[li].opts[2] + '。画一画验证一下。'); });
    gid(K + '-draw').addEventListener('click', function () {
      sawDraw = true;
      msg(LEVELS[li].chain);
    });
    gid(K + '-list').addEventListener('click', function () {
      var L = LEVELS[li];
      if (!sawDraw) { msg('先点“画一画”。'); return; }
      var ok = guessed === L.ans;
      msg('次数表：2–3 个要 1 次，4–9 个要 2 次，10–27 个要 3 次，28–81 个要 4 次。所以 ' + L.n + ' 个最少要称 ' + L.times + ' 次。' +
        (guessed < 0 ? '下次先猜一猜再列表。' : ok ? '你猜对了。' : '你猜的是 ' + L.opts[guessed] + '，表上是 ' + L.times + ' 次。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：5 个 2 次', '提高：27 个 3 次', '挑战：81 个 4 次'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm513-draw',
  title: '自己画折线图',
  sub: '画自己身高、每月存钱的折线图，找哪一段最陡、哪一年长得最快——自己的数据读起来才有感觉。',
  grade: 5,
  kind: '实验',
  points: ['5.13'],
  render: function (el) {
    var K = 'm513-draw';
    var LEVELS = [
      { label: '基础', name: '身高', unit: '厘米', data: [110, 116, 121, 127, 133, 140], labels: ['7 岁', '8 岁', '9 岁', '10 岁', '11 岁', '12 岁'], steep: '11→12 岁', rise: 7, opts: ['10→11 岁', '11→12 岁', '7→8 岁'], ans: 1 },
      { label: '提高', name: '存钱', unit: '元', data: [10, 20, 35, 40, 60, 65], labels: ['1 月', '2 月', '3 月', '4 月', '5 月', '6 月'], steep: '4→5 月', rise: 20, opts: ['2→3 月', '4→5 月', '1→2 月'], ans: 1 },
      { label: '挑战', name: '小树高', unit: '厘米', data: [30, 45, 55, 80, 95, 100], labels: ['1 年', '2 年', '3 年', '4 年', '5 年', '6 年'], steep: '3→4 年', rise: 25, opts: ['1→2 年', '3→4 年', '5→6 年'], ans: 1 }
    ];
    var li = 0, guessed = -1, plotted = 0, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 5 年级 · 折线统计图</p>' +
      '<h3>自己画折线图</h3>' +
      '<p>数据是自己的，图才有意思：一个点一个点描上去，再找哪一段最陡。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：哪一段最陡？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：画下一个点，6 个点画完，找最陡的一段。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-plot" type="button">画下一个点</button>' +
      '<button class="btn small primary" id="' + K + '-steep" type="button">找最陡的一段</button></div>' +
      '<div id="' + K + '-chart"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“画下一个点”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 身高</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 存钱</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 小树高</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“最陡的一段就是变化最快的一段”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawChart() {
      var L = LEVELS[li];
      var max = 0;
      for (var i = 0; i < L.data.length; i++) if (L.data[i] > max) max = L.data[i];
      var s = '<svg width="320" height="200" viewBox="0 0 320 200" role="img" aria-label="' + L.name + '折线图">';
      s += '<line x1="30" y1="180" x2="300" y2="180" stroke="#78716c" stroke-width="2"/>';
      s += '<line x1="30" y1="20" x2="30" y2="180" stroke="#78716c" stroke-width="2"/>';
      var pts = [];
      for (var j = 0; j < plotted; j++) {
        var x = 40 + j * 44, y = 180 - L.data[j] / max * 150;
        pts.push(x + ',' + y.toFixed(1));
      }
      if (pts.length > 1) s += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="#2563eb" stroke-width="3"/>';
      for (var k = 0; k < plotted; k++) {
        var x2 = 40 + k * 44, y2 = 180 - L.data[k] / max * 150;
        s += '<circle cx="' + x2 + '" cy="' + y2.toFixed(1) + '" r="5" fill="#f97316"/>';
        s += '<text x="' + x2 + '" y="196" font-size="11" text-anchor="middle" fill="#57534e">' + L.labels[k] + '</text>';
        s += '<text x="' + x2 + '" y="' + (y2 - 10).toFixed(1) + '" font-size="11" text-anchor="middle" fill="#57534e">' + L.data[k] + '</text>';
      }
      s += '</svg>';
      var c = gid(K + '-chart');
      if (c) c.innerHTML = s;
    }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.name + '：' + L.labels.join('、') + '分别是 ' + L.data.join('、') + ' ' + L.unit + '。哪一段最陡？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      drawChart();
    }
    function setLevel(i) {
      li = i; guessed = -1; plotted = 0;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“画下一个点”。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guessed = 0; msg('你猜 ' + LEVELS[li].opts[0] + ' 最陡。画点验证一下。'); });
    gid(K + '-guess-b').addEventListener('click', function () { guessed = 1; msg('你猜 ' + LEVELS[li].opts[1] + ' 最陡。画点验证一下。'); });
    gid(K + '-guess-c').addEventListener('click', function () { guessed = 2; msg('你猜 ' + LEVELS[li].opts[2] + ' 最陡。画点验证一下。'); });
    gid(K + '-plot').addEventListener('click', function () {
      var L = LEVELS[li];
      if (plotted >= L.data.length) { msg('6 个点都画完了，点“找最陡的一段”。'); return; }
      plotted++;
      drawChart();
      msg('画了 ' + plotted + ' 个点：' + L.labels[plotted - 1] + '是 ' + L.data[plotted - 1] + ' ' + L.unit + '。');
    });
    gid(K + '-steep').addEventListener('click', function () {
      var L = LEVELS[li];
      if (plotted < L.data.length) { msg('先把 6 个点都画完。'); return; }
      var ok = guessed === L.ans;
      msg('最陡的一段是 ' + L.steep + '，涨了 ' + L.rise + ' ' + L.unit + '，比别段都多。' +
        (guessed < 0 ? '下次先猜一猜再画。' : ok ? '你猜对了。' : '你猜的是 ' + L.opts[guessed] + '，最陡的是 ' + L.steep + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：身高 11→12 岁最陡', '提高：存钱 4→5 月最陡', '挑战：小树 3→4 年最陡'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});

/* 5.14 观察物体（三）：observe（2.6 的演示，5.14 点页主演示）只给了一个固定积木堆的三视图，没有猜、没有搭、没有数字法；m417-build（4.17 点页）是给两张图照着搭，m417-infer（4.17 点页）是两张图推最少/最多——本点的“最少/最多摆法”与 m417-infer 实质相同，跳过（挂在 4.17 点页，5.14 点页看不到）；做搭积木猜视图、三视图互推、俯视图数字法。 */
registerAnim({
  key: 'm514-guess',
  title: '搭积木猜视图',
  sub: '只给前面一个视图，先猜有几种摆法，动手搭出来，再看上面和左面验证猜想——一个方向看不全，视图就是用来排除猜想的。',
  grade: 5,
  kind: '实验',
  points: ['5.14'],
  render: function (el) {
    var K = 'm514-guess';
    var LEVELS = [
      { label: '基础', front: [2, 1], alts: [
        { '0,0': 2, '1,0': 1 }, { '0,1': 2, '1,0': 1 }, { '0,0': 1, '0,1': 2, '1,0': 1 } ] },
      { label: '提高', front: [1, 2, 1], alts: [
        { '0,0': 1, '1,0': 2, '2,0': 1 }, { '0,0': 1, '1,1': 2, '2,0': 1 }, { '0,1': 1, '1,0': 2, '2,1': 1 } ] },
      { label: '挑战', front: [3, 1], alts: [
        { '0,0': 3, '1,0': 1 }, { '0,1': 3, '1,1': 1 }, { '0,0': 2, '0,1': 3, '1,0': 1 } ] }
    ];
    var li = 0, guessed = -1, alt = 0, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 5 年级 · 观察物体（三）</p>' +
      '<h3>搭积木猜视图</h3>' +
      '<p>只给你前面看的一张图：它长什么样？不止一种。换一种摆法，前面还是一样，上面可就不一样了。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：只看前面，能确定它长什么样吗？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-yes" type="button">能</button>' +
      '<button class="btn small primary" id="' + K + '-guess-no" type="button">不能</button></div>' +
      '<p>第 2 步 · 玩一玩：换一种摆法，再看上面验证。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-alt" type="button">换一种摆法</button>' +
      '<button class="btn small primary" id="' + K + '-top" type="button">看上面</button></div>' +
      '<div id="' + K + '-views"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“换一种摆法”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 前面 [2,1]</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 前面 [1,2,1]</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 前面 [3,1]</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“一个方向看不全，换个方向才能排除猜想”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function hAt(st, x, z) { return st[x + ',' + z] || 0; }
    function gridHtml(rows) {
      var s = '';
      for (var i = 0; i < rows.length; i++) {
        s += '<div>';
        for (var j = 0; j < rows[i].length; j++) {
          s += '<span style="display:inline-block;width:22px;height:22px;border:1px solid #666;background:' + (rows[i][j] ? '#93c5fd' : '#fff') + '"></span>';
        }
        s += '</div>';
      }
      return s;
    }
    function frontRows(st) {
      var hs = [];
      for (var x = 0; x < 3; x++) hs.push(Math.max(hAt(st, x, 0), hAt(st, x, 1), hAt(st, x, 2)));
      var maxH = Math.max(hs[0], hs[1], hs[2]);
      var out = [];
      for (var l = maxH; l >= 1; l--) {
        var r = [];
        for (var k = 0; k < 3; k++) r.push(hs[k] >= l ? 1 : 0);
        out.push(r);
      }
      return out;
    }
    function topRows(st) {
      var rows = [];
      for (var z = 2; z >= 0; z--) {
        var row = [];
        for (var x = 0; x < 3; x++) row.push(hAt(st, x, z) > 0 ? 1 : 0);
        rows.push(row);
      }
      return rows;
    }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = '前面看是 [' + L.front.join(',') + ']，第 ' + (alt + 1) + ' 种摆法。';
      var st = L.alts[alt];
      var v = gid(K + '-views');
      if (v) v.innerHTML = '<p>前面看：</p>' + gridHtml(frontRows(st)) + '<p>上面看：</p>' + gridHtml(topRows(st));
    }
    function setLevel(i) {
      li = i; guessed = -1; alt = 0;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“换一种摆法”。');
    }
    gid(K + '-guess-yes').addEventListener('click', function () { guessed = 0; msg('你猜能确定。换一种摆法试试，前面变没变？'); });
    gid(K + '-guess-no').addEventListener('click', function () { guessed = 1; msg('你猜不能确定。换一种摆法试试，前面变没变？'); });
    gid(K + '-alt').addEventListener('click', function () {
      var L = LEVELS[li];
      alt = (alt + 1) % L.alts.length;
      draw();
      msg('第 ' + (alt + 1) + ' 种摆法：前面看还是 [' + L.front.join(',') + ']，一点没变。光看前面，分不出这几种摆法。');
    });
    gid(K + '-top').addEventListener('click', function () {
      var L = LEVELS[li];
      var ok = guessed === 1;
      msg('前面一样，上面不一样——摆法换了，俯视图上的格子位置就变了。一个方向看不全，要三个方向合起来才定得住。' +
        (guessed < 0 ? '下次先猜一猜再换摆法。' : ok ? '你猜对了。' : '你猜的是能确定——前面一样，摆法却不一样。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：前面 [2,1] 不止一种摆法', '提高：前面 [1,2,1] 不止一种摆法', '挑战：前面 [3,1] 不止一种摆法'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm514-three',
  title: '三视图互推',
  sub: '前面定长和高、上面定长和宽、左面定宽和高——三个方向各管两条边，合起来才定得住。',
  grade: 5,
  kind: '演示',
  points: ['5.14'],
  render: function (el) {
    var K = 'm514-three';
    var LEVELS = [
      { label: '基础', l: 3, w: 2, h: 2 },
      { label: '提高', l: 4, w: 2, h: 3 },
      { label: '挑战', l: 2, w: 3, h: 2 }
    ];
    var li = 0, guessed = -1, lit = {}, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 5 年级 · 观察物体（三）</p>' +
      '<h3>三视图互推</h3>' +
      '<p>一个长方体，长、宽、高三条边。每个方向只能看到两条边：前面看长和高，上面看长和宽，左面看宽和高。</p>' +
      '<p>第 1 步 · 先猜：一个方向能定住几条边？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button">1 条</button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button">2 条</button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button">3 条</button></div>' +
      '<p>第 2 步 · 玩一玩：三个方向都量一量，看三条边什么时候全定住。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-v-front" type="button">从前面量</button>' +
      '<button class="btn small primary" id="' + K + '-v-top" type="button">从上面量</button>' +
      '<button class="btn small primary" id="' + K + '-v-left" type="button">从左面量</button></div>' +
      '<p id="' + K + '-dims"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再三个方向都量一量。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 长 3 宽 2 高 2</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 长 4 宽 2 高 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 长 2 宽 3 高 2</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“一个方向定两条边，三个方向合起来才定得住”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawDims() {
      var L = LEVELS[li];
      var d = gid(K + '-dims');
      if (d) d.textContent = '长：' + (lit.len ? L.l : '？') + '　宽：' + (lit.wid ? L.w : '？') + '　高：' + (lit.hei ? L.h : '？');
    }
    function checkDone() {
      if (lit.len && lit.wid && lit.hei) {
        var L = LEVELS[li];
        var ok = guessed === 1;
        msg('三条边都定住了：长 ' + L.l + '、宽 ' + L.w + '、高 ' + L.h + '。三个方向各管两条边，合起来才定得住。' +
          (guessed < 0 ? '下次先猜一猜再量。' : ok ? '你猜对了。' : '你猜的是 ' + (guessed + 1) + ' 条，一个方向定住的是 2 条。'));
        if (ok) {
          if (tiers) tiers.done(li);
          if (typeof markTried === 'function') markTried(K);
        }
      }
    }
    function setLevel(i) {
      li = i; guessed = -1; lit = {};
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      drawDims();
      msg('先猜一猜，再三个方向都量一量。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guessed = 0; msg('你猜 1 条。量一量验证一下。'); });
    gid(K + '-guess-b').addEventListener('click', function () { guessed = 1; msg('你猜 2 条。量一量验证一下。'); });
    gid(K + '-guess-c').addEventListener('click', function () { guessed = 2; msg('你猜 3 条。量一量验证一下。'); });
    gid(K + '-v-front').addEventListener('click', function () {
      var L = LEVELS[li];
      lit.len = true; lit.hei = true;
      drawDims();
      msg('前面定住了长和高：长 ' + L.l + '，高 ' + L.h + '；宽还不知道。');
      checkDone();
    });
    gid(K + '-v-top').addEventListener('click', function () {
      var L = LEVELS[li];
      lit.len = true; lit.wid = true;
      drawDims();
      msg('上面定住了长和宽：长 ' + L.l + '，宽 ' + L.w + '；高还不知道。');
      checkDone();
    });
    gid(K + '-v-left').addEventListener('click', function () {
      var L = LEVELS[li];
      lit.wid = true; lit.hei = true;
      drawDims();
      msg('左面定住了宽和高：宽 ' + L.w + '，高 ' + L.h + '；长还不知道。');
      checkDone();
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：长 3 宽 2 高 2', '提高：长 4 宽 2 高 3', '挑战：长 2 宽 3 高 2'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    drawDims();
  }
});
registerAnim({
  key: 'm514-nums',
  title: '俯视图数字法',
  sub: '俯视图方格里写数字，数字就是那个位置摞了几层——照着数字搭，前面和左面自然对上。',
  grade: 5,
  kind: '实验',
  points: ['5.14'],
  render: function (el) {
    var K = 'm514-nums';
    var LEVELS = [
      { label: '基础', cells: { '0,0': 1, '1,0': 2, '0,1': 1 }, total: 4, front: [1, 2], left: [2, 1], opts: ['3 个', '4 个', '5 个'], ans: 1 },
      { label: '提高', cells: { '0,0': 2, '1,0': 1, '2,0': 1, '1,1': 3 }, total: 7, front: [2, 3, 1], left: [2, 3], opts: ['6 个', '7 个', '8 个'], ans: 1 },
      { label: '挑战', cells: { '0,0': 1, '1,0': 1, '2,0': 2, '0,1': 2, '1,1': 1 }, total: 7, front: [2, 1, 2], left: [2, 2], opts: ['6 个', '7 个', '8 个'], ans: 1 }
    ];
    var li = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 5 年级 · 观察物体（三）</p>' +
      '<h3>俯视图数字法</h3>' +
      '<p>俯视图每个格子里写一个数字：数字就是那个位置摞了几层。照着数字搭，前面和左面自然对上。</p>' +
      '<p id="' + K + '-q-tx"></p>' +
      '<p>第 1 步 · 先猜：一共几个小正方体？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-a" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-b" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-c" type="button"></button></div>' +
      '<p>第 2 步 · 玩一玩：点“照着数字搭”，看前面和左面是不是对得上。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-build" type="button">照着数字搭</button></div>' +
      '<div id="' + K + '-top"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“照着数字搭”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 3 格</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 4 格</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 5 格</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“格子里的数字就是摞的层数，加起来就是总数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function hAt(st, x, z) { return st[x + ',' + z] || 0; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = '俯视图：格子里的数字是摞的层数。一共几个小正方体？';
      var g = gid(K + '-guess-a'); if (g) g.textContent = L.opts[0];
      g = gid(K + '-guess-b'); if (g) g.textContent = L.opts[1];
      g = gid(K + '-guess-c'); if (g) g.textContent = L.opts[2];
      var s = '<p>俯视图（上面看）：</p>';
      for (var z = 2; z >= 0; z--) {
        s += '<div>';
        for (var x = 0; x < 3; x++) {
          var n = hAt(L.cells, x, z);
          s += '<span style="display:inline-block;width:30px;height:30px;border:1px solid #666;text-align:center;background:' + (n ? '#fde68a' : '#fff') + '">' + (n || '') + '</span>';
        }
        s += '</div>';
      }
      var t = gid(K + '-top');
      if (t) t.innerHTML = s;
    }
    function setLevel(i) {
      li = i; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“照着数字搭”。');
    }
    gid(K + '-guess-a').addEventListener('click', function () { guessed = 0; msg('你猜 ' + LEVELS[li].opts[0] + '。照着数字搭验证一下。'); });
    gid(K + '-guess-b').addEventListener('click', function () { guessed = 1; msg('你猜 ' + LEVELS[li].opts[1] + '。照着数字搭验证一下。'); });
    gid(K + '-guess-c').addEventListener('click', function () { guessed = 2; msg('你猜 ' + LEVELS[li].opts[2] + '。照着数字搭验证一下。'); });
    gid(K + '-build').addEventListener('click', function () {
      var L = LEVELS[li];
      var parts = [];
      for (var z = 0; z < 3; z++) {
        for (var x = 0; x < 3; x++) {
          var n = hAt(L.cells, x, z);
          if (n) parts.push('(' + x + ',' + z + ') 摞 ' + n + ' 个');
        }
      }
      var ok = guessed === L.ans;
      msg('照着数字搭：' + parts.join('；') + '。加起来一共 ' + L.total + ' 个：前面看是 [' + L.front.join(',') + ']，左面看是 [' + L.left.join(',') + ']，都对上了。' +
        (guessed < 0 ? '下次先猜一猜再搭。' : ok ? '你猜对了。' : '你猜的是 ' + L.opts[guessed] + '，数出来是 ' + L.total + ' 个。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：一共 4 个', '提高：一共 7 个', '挑战：一共 7 个'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
/* 6.1–6.8、6.11–6.14（第五批，最后一批）：与已有演示实质相同的方法跳过（见各段注释），只做真正新的方法，同样先猜 → 玩 → 说，三档。 */
/* 6.1 分数乘法：主演示 fraction 是单个分数的圆饼切一切，没有双色重叠、没有数轴缩放、没有分数墙量积、没有分组累加；fraceq、buildfrac、fracnumline 是 3.7、5.10 点页的模拟，6.1 点页看不到——4 种方法全做。 */
registerAnim({
  key: 'm61-overlap',
  title: '双色重叠面积模型',
  sub: '先涂一个分数，再取已涂部分的几分之几：重叠的小格数就是分子乘分子，总格数就是分母乘分母。',
  grade: 6,
  kind: '模拟',
  points: ['6.1'],
  render: function (el) {
    var K = 'm61-overlap';
    var LEVELS = [
      { label: '基础', a: '2/3', b: '4/5', cols: 5, rows: 3, shade: 4, take: 2, overlap: 8, total: 15, prod: '8/15', opts: ['6 格', '8 格', '10 格'], ans: 1 },
      { label: '提高', a: '3/4', b: '2/5', cols: 5, rows: 4, shade: 2, take: 3, overlap: 6, total: 20, prod: '6/20 = 3/10', opts: ['6 格', '8 格', '4 格'], ans: 0 },
      { label: '挑战', a: '5/6', b: '3/4', cols: 4, rows: 6, shade: 3, take: 5, overlap: 15, total: 24, prod: '15/24 = 5/8', opts: ['12 格', '18 格', '15 格'], ans: 2 }
    ];
    var li = 0, stage = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 分数乘法</p>' +
      '<h3>双色重叠面积模型</h3>' +
      '<p>分数乘分数，先涂一个分数，再取已涂部分的几分之几：重叠的小格就是答案。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span>重叠是几格？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 涂一涂：先涂第一个分数，再取其中第二个分数。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-paint" type="button">涂第一个分数</button>' +
      '<button class="btn small primary" id="' + K + '-take" type="button">取第二个分数</button></div>' +
      '<div id="' + K + '-grid"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再涂一涂。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 2/3 × 4/5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 3/4 × 2/5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 5/6 × 3/4</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“重叠格是分子乘分子，总格是分母乘分母”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.a + ' × ' + L.b + '，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-grid');
      if (box) {
        var s = '<svg width="' + (L.cols * 32 + 4) + '" height="' + (L.rows * 32 + 4) + '" viewBox="0 0 ' + (L.cols * 32 + 4) + ' ' + (L.rows * 32 + 4) + '">';
        for (var r = 0; r < L.rows; r++) {
          for (var c = 0; c < L.cols; c++) {
            var fill = '#ffffff';
            if (stage === 1) { if (c < L.shade) fill = '#fde68a'; }
            if (stage === 2) {
              if (c < L.shade && r < L.take) fill = '#fb923c';
              else if (c < L.shade) fill = '#fde68a';
              else if (r < L.take) fill = '#dbeafe';
            }
            s += '<rect x="' + (2 + c * 32) + '" y="' + (2 + r * 32) + '" width="30" height="30" fill="' + fill + '" stroke="#1e293b" stroke-width="1"/>';
          }
        }
        s += '</svg>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) {
        ct.textContent = stage === 0 ? '长方形横切 ' + L.rows + ' 份、竖切 ' + L.cols + ' 份，一共 ' + L.total + ' 小格。'
          : stage === 1 ? '先涂了 ' + L.b + '：' + L.shade + ' 列变黄了。'
          : '再取黄色部分的 ' + L.a + '：' + L.take + ' 行变蓝，重叠的橙色格是 ' + L.overlap + ' 格——' + L.a + ' × ' + L.b + ' = ' + L.prod + '。';
      }
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：重叠是几格？'); return; }
      var ok = guessed === L.ans;
      msg('重叠是 ' + L.overlap + ' 格，总共 ' + L.total + ' 格：' + L.a + ' × ' + L.b + ' = ' + L.prod + '。' +
        (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '，数出来是 ' + L.overlap + ' 格。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; stage = 0; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再涂一涂。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜重叠是 ' + LEVELS[li].opts[0] + '。涂一涂验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜重叠是 ' + LEVELS[li].opts[1] + '。涂一涂验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜重叠是 ' + LEVELS[li].opts[2] + '。涂一涂验证。'); });
    gid(K + '-paint').addEventListener('click', function () { if (stage === 0) { stage = 1; draw(); msg('涂好了 ' + LEVELS[li].b + '。再点“取第二个分数”。'); } });
    gid(K + '-take').addEventListener('click', function () { if (stage === 1) { stage = 2; draw(); verdict(); } else if (stage === 0) { msg('先点“涂第一个分数”。'); } });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：2/3 × 4/5 = 8/15', '提高：3/4 × 2/5 = 3/10', '挑战：5/6 × 3/4 = 5/8'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm61-scale',
  title: '数轴缩放',
  sub: '分数乘法就是在数轴上缩放：乘小于 1 的数往 0 收缩，乘大于 1 的数往外拉长，积的位置一眼可见。',
  grade: 6,
  kind: '模拟',
  points: ['6.1'],
  render: function (el) {
    var K = 'm61-scale';
    var LEVELS = [
      { label: '基础', a: '4/5', av: 0.8, m: '2/3', prod: '8/15', pv: 0.5333, xmax: 1, opts: ['更大', '更小', '一样大'], ans: 1, why: '乘 2/3，小于 1，往 0 收缩' },
      { label: '提高', a: '3/4', av: 0.75, m: '5/4', prod: '15/16', pv: 0.9375, xmax: 1, opts: ['更大', '一样大', '更小'], ans: 0, why: '乘 5/4，大于 1，往外拉长' },
      { label: '挑战', a: '6/5', av: 1.2, m: '3/2', prod: '9/5', pv: 1.8, xmax: 2, opts: ['更小', '更大', '一样大'], ans: 1, why: '乘 3/2，大于 1，往外拉长' }
    ];
    var li = 0, scaled = false, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 分数乘法</p>' +
      '<h3>数轴缩放</h3>' +
      '<p>把分数乘法看作对数轴的缩放：乘以小于 1 的数是往 0 收缩，乘以大于 1 的数是拉长。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span>积比这个数大还是小？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 缩放：蓝点是原来的数，点“缩放”看它被乘到哪里。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-zoom" type="button">缩放</button></div>' +
      '<div id="' + K + '-line"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“缩放”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 4/5 × 2/3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 3/4 × 5/4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 6/5 × 3/2</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“乘小于 1 收缩，乘大于 1 拉长”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function X(v, xmax) { return 30 + v / xmax * 500; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.a + ' × ' + L.m + '，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-line');
      if (box) {
        var s = '<svg width="580" height="90" viewBox="0 0 580 90">';
        s += '<line x1="30" y1="45" x2="530" y2="45" stroke="#1e293b" stroke-width="2"/>';
        var step = L.xmax === 1 ? 0.25 : 0.5;
        for (var v = 0; v <= L.xmax + 0.001; v += step) {
          var x = X(v, L.xmax);
          s += '<line x1="' + x.toFixed(1) + '" y1="38" x2="' + x.toFixed(1) + '" y2="52" stroke="#1e293b" stroke-width="2"/>';
          s += '<text x="' + x.toFixed(1) + '" y="72" text-anchor="middle" font-size="13">' + String(Math.round(v * 100) / 100) + '</text>';
        }
        s += '<circle cx="' + X(L.av, L.xmax).toFixed(1) + '" cy="45" r="8" fill="#2563eb"/>';
        s += '<text x="' + X(L.av, L.xmax).toFixed(1) + '" y="26" text-anchor="middle" font-size="13" fill="#2563eb">' + L.a + '</text>';
        if (scaled) {
          s += '<circle cx="' + X(L.pv, L.xmax).toFixed(1) + '" cy="45" r="8" fill="#f97316"/>';
          s += '<text x="' + X(L.pv, L.xmax).toFixed(1) + '" y="26" text-anchor="middle" font-size="13" fill="#ea580c">' + L.prod + '</text>';
        }
        s += '</svg>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = scaled
        ? L.a + ' × ' + L.m + ' = ' + L.prod + '：' + L.why + '，从 ' + L.a + ' 移到了 ' + L.prod + '。'
        : '蓝点在 ' + L.a + '。乘 ' + L.m + ' 之后，它会往哪边移？';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：积比 ' + L.a + ' 大还是小？'); return; }
      var ok = guessed === L.ans;
      msg(L.a + ' × ' + L.m + ' = ' + L.prod + '：' + L.why + '。' + (ok ? '你猜对了！' : '你猜的是' + L.opts[guessed] + '，其实是' + L.opts[L.ans] + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; scaled = false; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“缩放”。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜积' + LEVELS[li].opts[0] + '。点“缩放”验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜积' + LEVELS[li].opts[1] + '。点“缩放”验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜积' + LEVELS[li].opts[2] + '。点“缩放”验证。'); });
    gid(K + '-zoom').addEventListener('click', function () { scaled = true; draw(); verdict(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：4/5 × 2/3 = 8/15', '提高：3/4 × 5/4 = 15/16', '挑战：6/5 × 3/2 = 9/5'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm61-wall',
  title: '分数墙量一量',
  sub: '用分数墙把两个分数换成同一单位的小条来量：重叠的长度就是积，顺带看到等值分数。',
  grade: 6,
  kind: '模拟',
  points: ['6.1'],
  render: function (el) {
    var K = 'm61-wall';
    var LEVELS = [
      { label: '基础', a: '2/3', b: '4/5', unit: 15, bUnits: 12, take: 8, prod: '8/15', opts: ['8/15', '6/15', '8/12'], ans: 0 },
      { label: '提高', a: '1/2', b: '3/4', unit: 8, bUnits: 6, take: 3, prod: '3/8', opts: ['3/4', '1/4', '3/8'], ans: 2 },
      { label: '挑战', a: '3/4', b: '2/3', unit: 12, bUnits: 8, take: 6, prod: '6/12 = 1/2', opts: ['3/4', '1/2', '2/3'], ans: 1 }
    ];
    var li = 0, measured = false, guessed = -1, tiers = null;
    var ROWS = [1, 2, 3, 4, 5, 6, 8, 12, 15];
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 分数乘法</p>' +
      '<h3>分数墙量一量</h3>' +
      '<p>分数墙上每一行都是一整条，只是切的份数不同：同一长度，在不同行里是不同的分数——那就是等值分数。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span>积是多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 量一量：把两个分数都换成同一单位的小条，再取其中一份。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-measure" type="button">量一量</button></div>' +
      '<div id="' + K + '-wall"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“量一量”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 2/3 × 4/5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 1/2 × 3/4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 3/4 × 2/3</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“换成同一单位的小条，数一数就是积”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.a + ' × ' + L.b + '，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-wall');
      if (box) {
        var W = 540, H = ROWS.length * 24 + 8, s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">';
        for (var ri = 0; ri < ROWS.length; ri++) {
          var d = ROWS[ri], y = 4 + ri * 24, cw = (W - 60) / d;
          s += '<text x="4" y="' + (y + 16) + '" font-size="12">1/' + d + '</text>';
          for (var c = 0; c < d; c++) {
            var fill = '#ffffff';
            if (measured && d === L.unit) {
              if (c < L.take) fill = '#fb923c';
              else if (c < L.bUnits) fill = '#fde68a';
            }
            s += '<rect x="' + (56 + c * cw).toFixed(1) + '" y="' + y + '" width="' + (cw - 1).toFixed(1) + '" height="20" fill="' + fill + '" stroke="#94a3b8" stroke-width="1"/>';
          }
        }
        s += '</svg>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = measured
        ? L.b + ' = ' + L.bUnits + ' 个 1/' + L.unit + '；取其中的 ' + L.a + '，就是 ' + L.take + ' 个 1/' + L.unit + '，积是 ' + L.prod + '。'
        : '墙上 1/' + L.unit + ' 那一行，是量这道题的尺子。';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：积是多少？'); return; }
      var ok = guessed === L.ans;
      msg(L.a + ' × ' + L.b + ' = ' + L.prod + '。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '，量出来是 ' + L.prod + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; measured = false; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“量一量”。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜积是 ' + LEVELS[li].opts[0] + '。点“量一量”验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜积是 ' + LEVELS[li].opts[1] + '。点“量一量”验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜积是 ' + LEVELS[li].opts[2] + '。点“量一量”验证。'); });
    gid(K + '-measure').addEventListener('click', function () { measured = true; draw(); verdict(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：2/3 × 4/5 = 8/15', '提高：1/2 × 3/4 = 3/8', '挑战：3/4 × 2/3 = 1/2'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm61-groups',
  title: '分组累加',
  sub: '整数乘分数就是“几个几分之几”：3 个 2/5 拼起来，分子相加，分母不动。',
  grade: 6,
  kind: '演示',
  points: ['6.1'],
  render: function (el) {
    var K = 'm61-groups';
    var LEVELS = [
      { label: '基础', n: 3, f: '2/5', fn: 2, fd: 5, total: '6/5', mixed: '1又1/5', opts: ['6', '5', '8'], ans: 0 },
      { label: '提高', n: 4, f: '3/8', fn: 3, fd: 8, total: '12/8', mixed: '1又1/2', opts: ['8', '12', '10'], ans: 1 },
      { label: '挑战', n: 5, f: '2/3', fn: 2, fd: 3, total: '10/3', mixed: '3又1/3', opts: ['15', '8', '10'], ans: 2 }
    ];
    var li = 0, joined = false, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 6 年级 · 分数乘法</p>' +
      '<h3>分组累加</h3>' +
      '<p>整数乘分数，就是“几个几分之几”：画出同样多的条，拼起来，分子相加。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span>分子一共是多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 拼起来：每条涂出一个分数，再把涂了的部分合到一起数。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-join" type="button">拼起来</button></div>' +
      '<div id="' + K + '-bars"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“拼起来”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 3 × 2/5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 4 × 3/8</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 5 × 2/3</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“几个几分之几，分子相加，分母不动”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.n + ' × ' + L.f + '，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-bars');
      if (box) {
        var s = '';
        for (var i = 0; i < L.n; i++) {
          s += '<div style="display:flex;margin:4px 0">';
          for (var c = 0; c < L.fd; c++) {
            s += '<div style="width:34px;height:26px;border:1px solid #1e293b;background:' + (c < L.fn ? '#fde68a' : '#ffffff') + '"></div>';
          }
          s += '<span style="margin-left:8px">' + L.f + '</span></div>';
        }
        if (joined) {
          var sum = '';
          for (var j = 0; j < L.n; j++) { sum += (j > 0 ? ' + ' : '') + L.fn; }
          s += '<p>合起来：' + sum + ' = ' + (L.fn * L.n) + ' 份，每份是 1/' + L.fd + '。</p>';
        }
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = joined
        ? L.n + ' × ' + L.f + ' = ' + L.total + ' = ' + L.mixed + '。'
        : '每条涂 ' + L.f + '，一共 ' + L.n + ' 条。';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：分子一共是多少？'); return; }
      var ok = guessed === L.ans;
      msg(L.n + ' × ' + L.f + ' = ' + L.total + ' = ' + L.mixed + '。' + (ok ? '你猜对了！' : '你猜分子是 ' + L.opts[guessed] + '，数出来是 ' + (L.fn * L.n) + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; joined = false; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“拼起来”。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜分子是 ' + LEVELS[li].opts[0] + '。点“拼起来”验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜分子是 ' + LEVELS[li].opts[1] + '。点“拼起来”验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜分子是 ' + LEVELS[li].opts[2] + '。点“拼起来”验证。'); });
    gid(K + '-join').addEventListener('click', function () { joined = true; draw(); verdict(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3 × 2/5 = 6/5', '提高：4 × 3/8 = 3/2', '挑战：5 × 2/3 = 10/3'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
/* 6.2 分数除法、倒数：主演示 fraction 是单个分数的圆饼，没有除法；为什么页的 why-fracdiv 只是固定 3/4 ÷ 1/4 的计数小部件，不在 6.2 点页上，也没有猜与三档——4 种方法全做。 */
registerAnim({
  key: 'm62-fit',
  title: '能装几个',
  sub: '除法是问“里面有几个除数”：把被除数切成和除数同样大的小段，数段数就是商。',
  grade: 6,
  kind: '模拟',
  points: ['6.2'],
  render: function (el) {
    var K = 'm62-fit';
    var LEVELS = [
      { label: '基础', a: '2', b: '1/4', q: '8', whole: 2, per: 4, cut: 8, opts: ['8', '4', '2'], ans: 0, note: '2 里面有 8 个 1/4' },
      { label: '提高', a: '3/4', b: '1/8', q: '6', whole: 0, per: 0, cut: 6, opts: ['3', '6', '8'], ans: 1, note: '3/4 里面有 6 个 1/8' },
      { label: '挑战', a: '5/6', b: '1/3', q: '2又1/2', whole: 0, per: 0, cut: 5, opts: ['3', '2', '2又1/2'], ans: 2, note: '5/6 里面有 2 个 1/3，还剩 1/6，是半个 1/3' }
    ];
    var li = 0, cut = false, counted = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 分数除法</p>' +
      '<h3>能装几个</h3>' +
      '<p>分数除法先别急着翻倒数：先问一句“里面有几个除数”，切一切、数一数，商就是段数。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span>能装几个？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 切一切，数一数：每点一下，数一段。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-cut" type="button">切一段，数一数</button></div>' +
      '<div id="' + K + '-bar"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再切一段数一数。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 2 ÷ 1/4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 3/4 ÷ 1/8</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 5/6 ÷ 1/3</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“除法就是数一数里面有几个除数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function pieces() {
      if (li === 0) return { cells: 8, unit: '1/4', steps: [1, 1, 1, 1, 1, 1, 1, 1] };
      if (li === 1) return { cells: 6, unit: '1/8', steps: [1, 1, 1, 1, 1, 1] };
      return { cells: 5, unit: '1/6', steps: [2, 2, 1] };
    }
    function filledCells() {
      var p = pieces(), n = 0;
      for (var i = 0; i < counted && i < p.steps.length; i++) n += p.steps[i];
      return n;
    }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.a + ' ÷ ' + L.b + '，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var p = pieces();
      var box = gid(K + '-bar');
      if (box) {
        var s = '', fc = filledCells();
        for (var i = 0; i < p.cells; i++) {
          var on = cut && i < fc;
          s += '<span style="display:inline-block;width:44px;height:34px;line-height:34px;text-align:center;border:1px solid #1e293b;margin:2px;background:' + (on ? '#fde68a' : '#ffffff') + '">' + p.unit + '</span>';
        }
        if (li === 2) s += '<span style="margin-left:6px">每段是 1/3，也就是 2 个 1/6；最后只剩 1 个 1/6，是半段</span>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = cut
        ? '已经数了 ' + (li === 2 ? (counted === 3 ? '2又1/2' : String(counted)) : String(counted)) + ' 段。'
        : '被除数是 ' + L.a + '，每段是 ' + L.b + '。';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：能装几个？'); return; }
      var ok = guessed === L.ans;
      msg(L.a + ' ÷ ' + L.b + ' = ' + L.q + '：' + L.note + '。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '，数出来是 ' + L.q + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; cut = false; counted = 0; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再切一段数一数。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜能装 ' + LEVELS[li].opts[0] + ' 个。切一切验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜能装 ' + LEVELS[li].opts[1] + ' 个。切一切验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜能装 ' + LEVELS[li].opts[2] + ' 个。切一切验证。'); });
    gid(K + '-cut').addEventListener('click', function () {
      var p = pieces();
      if (!cut) cut = true;
      if (counted < p.steps.length) counted++;
      draw();
      if (counted >= p.steps.length) verdict();
      else msg('数了 ' + counted + ' 段，继续。');
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：2 ÷ 1/4 = 8', '提高：3/4 ÷ 1/8 = 6', '挑战：5/6 ÷ 1/3 = 2又1/2'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm62-recip',
  title: '除以分数就是乘倒数',
  sub: '倒数是上下颠倒、乘积为 1 的一对数：除以一个分数，先把它倒过来，再按乘法算。',
  grade: 6,
  kind: '演示',
  points: ['6.2'],
  render: function (el) {
    var K = 'm62-recip';
    var LEVELS = [
      { label: '基础', a: '3/4', b: '1/2', rb: '2/1', q: '3/2', opts: ['更大', '更小', '一样大'], ans: 0 },
      { label: '提高', a: '5/6', b: '2/3', rb: '3/2', q: '5/4', opts: ['更大', '一样大', '更小'], ans: 0 },
      { label: '挑战', a: '2/3', b: '5/4', rb: '4/5', q: '8/15', opts: ['更小', '更大', '一样大'], ans: 0 }
    ];
    var li = 0, flipped = false, done = false, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 6 年级 · 分数除法</p>' +
      '<h3>除以分数就是乘倒数</h3>' +
      '<p>除以一个分数，就是乘它的倒数。倒数是上下颠倒的一对数，乘起来是 1：1/2 的倒数是 2/1。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span>商比被除数大还是小？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 倒过来，再乘：只倒除数，被除数不动。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-flip" type="button">把除数倒过来</button>' +
      '<button class="btn small primary" id="' + K + '-mul" type="button">乘出来</button></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再把除数倒过来。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 3/4 ÷ 1/2</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 5/6 ÷ 2/3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 2/3 ÷ 5/4</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“只倒除数，被除数不动；除数小于 1，商比被除数大”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.a + ' ÷ ' + L.b + '，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var ct = gid(K + '-calc-tx');
      if (ct) {
        ct.textContent = !flipped ? L.a + ' ÷ ' + L.b + ' = ？'
          : !done ? L.a + ' ÷ ' + L.b + ' = ' + L.a + ' × ' + L.rb + '：' + L.b + ' 倒过来是 ' + L.rb + '，' + L.b + ' × ' + L.rb + ' = 1。'
          : L.a + ' × ' + L.rb + ' = ' + L.q + '。';
      }
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：商比被除数大还是小？'); return; }
      var ok = guessed === L.ans;
      msg(L.a + ' ÷ ' + L.b + ' = ' + L.q + '：除数 ' + L.b + (L.b === '5/4' ? '大于 1，商比被除数小' : '小于 1，商比被除数大') + '。' + (ok ? '你猜对了！' : '你猜的是' + L.opts[guessed] + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; flipped = false; done = false; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再把除数倒过来。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜商' + LEVELS[li].opts[0] + '。倒过来验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜商' + LEVELS[li].opts[1] + '。倒过来验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜商' + LEVELS[li].opts[2] + '。倒过来验证。'); });
    gid(K + '-flip').addEventListener('click', function () { if (!flipped) { flipped = true; draw(); msg('倒过来了：' + LEVELS[li].b + ' 变成 ' + LEVELS[li].rb + '。再点“乘出来”。'); } });
    gid(K + '-mul').addEventListener('click', function () { if (!flipped) { msg('先点“把除数倒过来”。'); return; } done = true; draw(); verdict(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3/4 ÷ 1/2 = 3/2', '提高：5/6 ÷ 2/3 = 5/4', '挑战：2/3 ÷ 5/4 = 8/15'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm62-area',
  title: '已知面积求边',
  sub: '除法是乘法的反面：长方形面积知道、一边知道，另一边就是面积除以这一边。',
  grade: 6,
  kind: '模拟',
  points: ['6.2'],
  render: function (el) {
    var K = 'm62-area';
    var LEVELS = [
      { label: '基础', area: '3/4', side: '1/2', other: '3/2', cols: 2, rows: 2, h: 1.5, unit: '1/4', opts: ['3/2', '2/3', '1/2'], ans: 0 },
      { label: '提高', area: '5/6', side: '2/3', other: '5/4', cols: 4, rows: 2, h: 1.25, unit: '1/6', opts: ['4/5', '5/4', '3/2'], ans: 1 },
      { label: '挑战', area: '2/3', side: '4/3', other: '1/2', cols: 4, rows: 1, h: 0.5, unit: '1/3', opts: ['2', '1/2', '3/2'], ans: 1 }
    ];
    var li = 0, stretched = false, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 分数除法</p>' +
      '<h3>已知面积求边</h3>' +
      '<p>长方形面积 = 一边 × 另一边。面积和一边都知道，另一边就是面积除以这一边。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span>另一边是多长？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 拉一拉：宽固定是已知的一边，把高拉到面积正好对上。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-stretch" type="button">拉高到面积对上</button></div>' +
      '<div id="' + K + '-rect"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拉一拉。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 面积 3/4，一边 1/2</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 面积 5/6，一边 2/3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 面积 2/3，一边 4/3</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“另一边 = 面积 ÷ 已知的一边”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = '面积 ' + L.area + '，一边 ' + L.side + '，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-rect');
      if (box) {
        var cw = 52, ch = 52, W = L.cols * cw + 90, H = 2 * ch + 40;
        var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">';
        var hh = stretched ? L.h * ch : ch;
        s += '<rect x="10" y="10" width="' + (L.cols * cw) + '" height="' + hh + '" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>';
        for (var c = 1; c < L.cols; c++) s += '<line x1="' + (10 + c * cw) + '" y1="10" x2="' + (10 + c * cw) + '" y2="' + (10 + hh) + '" stroke="#93c5fd" stroke-width="1"/>';
        s += '<text x="' + (10 + L.cols * cw / 2) + '" y="' + (24 + hh) + '" text-anchor="middle" font-size="13">宽 ' + L.side + '（' + L.cols + ' 个 ' + L.unit + '）</text>';
        s += '<text x="' + (20 + L.cols * cw) + '" y="30" font-size="13">高 ' + (stretched ? L.other : '？') + '</text>';
        s += '</svg>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = stretched
        ? '面积 ' + L.area + ' ÷ 一边 ' + L.side + ' = ' + L.other + '：' + L.side + ' × ' + L.other + ' = ' + L.area + '，对上了。'
        : '宽是 ' + L.side + '，高拉到多少，面积才是 ' + L.area + '？';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：另一边是多长？'); return; }
      var ok = guessed === L.ans;
      msg(L.area + ' ÷ ' + L.side + ' = ' + L.other + '。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '，拉出来是 ' + L.other + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; stretched = false; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再拉一拉。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜另一边是 ' + LEVELS[li].opts[0] + '。拉一拉验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜另一边是 ' + LEVELS[li].opts[1] + '。拉一拉验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜另一边是 ' + LEVELS[li].opts[2] + '。拉一拉验证。'); });
    gid(K + '-stretch').addEventListener('click', function () { stretched = true; draw(); verdict(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3/4 ÷ 1/2 = 3/2', '提高：5/6 ÷ 2/3 = 5/4', '挑战：2/3 ÷ 4/3 = 1/2'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm62-jump',
  title: '数轴跳跃',
  sub: '在数轴上每次跳一个除数那么长，数跳了几次——跳的次数就是商，余下的就是余数。',
  grade: 6,
  kind: '模拟',
  points: ['6.2'],
  render: function (el) {
    var K = 'm62-jump';
    var LEVELS = [
      { label: '基础', a: '2', step: '1/4', sv: 0.25, av: 2, xmax: 2, jumps: 8, half: false, q: '8', opts: ['8', '4', '2'], ans: 0 },
      { label: '提高', a: '9/4', step: '3/4', sv: 0.75, av: 2.25, xmax: 2.5, jumps: 3, half: false, q: '3', opts: ['3', '4', '9'], ans: 0 },
      { label: '挑战', a: '7/4', step: '1/2', sv: 0.5, av: 1.75, xmax: 2, jumps: 3, half: true, q: '3又1/2', opts: ['4', '3', '3又1/2'], ans: 2 }
    ];
    var li = 0, jumped = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 分数除法</p>' +
      '<h3>数轴跳跃</h3>' +
      '<p>从 0 出发，每次跳一个除数那么长：跳几次到被除数，商就是几；跳不到整步，余下的就是余数。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span>要跳几次？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 跳一跳：每点一下跳一步。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-jump" type="button">跳一步</button></div>' +
      '<div id="' + K + '-line"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再跳一跳。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 2 ÷ 1/4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 9/4 ÷ 3/4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 7/4 ÷ 1/2</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“跳几次就是商，跳不满一步就是余数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function X(v, xmax) { return 30 + v / xmax * 500; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.a + ' ÷ ' + L.step + '，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-line');
      if (box) {
        var s = '<svg width="580" height="110" viewBox="0 0 580 110">';
        s += '<line x1="30" y1="70" x2="530" y2="70" stroke="#1e293b" stroke-width="2"/>';
        var step = L.xmax === 2.5 ? 0.5 : 0.25;
        for (var v = 0; v <= L.xmax + 0.001; v += step) {
          var x = X(v, L.xmax);
          s += '<line x1="' + x.toFixed(1) + '" y1="63" x2="' + x.toFixed(1) + '" y2="77" stroke="#1e293b" stroke-width="2"/>';
          s += '<text x="' + x.toFixed(1) + '" y="96" text-anchor="middle" font-size="13">' + String(Math.round(v * 100) / 100) + '</text>';
        }
        var total = L.jumps + (L.half ? 1 : 0);
        for (var j = 0; j < jumped; j++) {
          var x0 = X(j * L.sv, L.xmax), x1 = X((j + 1) * L.sv, L.xmax);
          if (L.half && j === L.jumps) x1 = X(L.av, L.xmax);
          var mx = (x0 + x1) / 2;
          s += '<path d="M ' + x0.toFixed(1) + ' 62 Q ' + mx.toFixed(1) + ' 20 ' + x1.toFixed(1) + ' 62" fill="none" stroke="#2563eb" stroke-width="2"/>';
        }
        var px = X(Math.min(jumped * L.sv, L.av), L.xmax);
        if (L.half && jumped > L.jumps) px = X(L.av, L.xmax);
        s += '<circle cx="' + px.toFixed(1) + '" cy="70" r="8" fill="#f97316"/>';
        s += '<text x="' + px.toFixed(1) + '" y="52" text-anchor="middle" font-size="13" fill="#ea580c">现在 ' + (jumped * L.sv > L.av ? L.a : String(Math.round(Math.min(jumped * L.sv, L.av) * 100) / 100)) + '</text>';
        s += '</svg>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) {
        var total = L.jumps + (L.half ? 1 : 0);
        ct.textContent = jumped === 0 ? '从 0 出发，每步跳 ' + L.step + '，目标是 ' + L.a + '。'
          : jumped < total ? '跳了 ' + jumped + ' 步，到了 ' + String(Math.round(Math.min(jumped * L.sv, L.av) * 100) / 100) + '。'
          : '跳完了：' + L.a + ' ÷ ' + L.step + ' = ' + L.q + (L.half ? '，最后一步只跳了 1/4，是半步' : '') + '。';
      }
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：要跳几次？'); return; }
      var ok = guessed === L.ans;
      msg(L.a + ' ÷ ' + L.step + ' = ' + L.q + '。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '，跳出来是 ' + L.q + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; jumped = 0; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再跳一跳。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜跳 ' + LEVELS[li].opts[0] + ' 次。跳一跳验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜跳 ' + LEVELS[li].opts[1] + ' 次。跳一跳验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜跳 ' + LEVELS[li].opts[2] + ' 次。跳一跳验证。'); });
    gid(K + '-jump').addEventListener('click', function () {
      var L = LEVELS[li];
      var total = L.jumps + (L.half ? 1 : 0);
      if (jumped < total) { jumped++; draw(); }
      if (jumped >= total) verdict();
      else msg('跳了 ' + jumped + ' 步，继续。');
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：2 ÷ 1/4 = 8', '提高：9/4 ÷ 3/4 = 3', '挑战：7/4 ÷ 1/2 = 3又1/2'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
/* 6.3 位置与方向（二）：雷达/极坐标已有 demo-radar（6.3 点页主演示），跳过；真方位角、分段路线、相对方向都没有，做这三个。 */
registerAnim({
  key: 'm63-bearing',
  title: '真方位角与罗盘方位',
  sub: '从北顺时针量 0–360° 是真方位角，写成“北偏东 ×°”是罗盘方位：两种说法互相翻译。',
  grade: 6,
  kind: '模拟',
  points: ['6.3'],
  render: function (el) {
    var K = 'm63-bearing';
    var LEVELS = [
      { label: '基础', compass: '北偏东 30°', deg: 30, opts: ['30°', '150°', '330°'], ans: 0 },
      { label: '提高', compass: '南偏西 25°', deg: 205, opts: ['25°', '205°', '155°'], ans: 1 },
      { label: '挑战', compass: '北偏西 60°', deg: 300, opts: ['60°', '300°', '120°'], ans: 1 }
    ];
    var li = 0, turned = false, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 位置与方向</p>' +
      '<h3>真方位角与罗盘方位</h3>' +
      '<p>罗盘方位说“北偏东 30°”，真方位角说“从北顺时针转 30°”：同一个方向，两种写法。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span>真方位角是多少度？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 转一转：从北顺时针转，看指针停在哪。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-turn" type="button">转一转</button></div>' +
      '<div id="' + K + '-compass"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“转一转”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 北偏东 30°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 南偏西 25°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 北偏西 60°</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“从北顺时针量，北偏东就是它本身，南偏西要加 180°”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.compass + '，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-compass');
      if (box) {
        var cx = 130, cy = 130, r = 95;
        var rad = L.deg * Math.PI / 180;
        var ex = cx + r * Math.sin(rad), ey = cy - r * Math.cos(rad);
        var s = '<svg width="260" height="260" viewBox="0 0 260 260">';
        s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#f8fafc" stroke="#1e293b" stroke-width="2"/>';
        s += '<text x="' + cx + '" y="22" text-anchor="middle" font-size="15" font-weight="bold">北 0°</text>';
        s += '<text x="248" y="' + (cy + 5) + '" text-anchor="middle" font-size="13">东 90°</text>';
        s += '<text x="' + cx + '" y="252" text-anchor="middle" font-size="13">南 180°</text>';
        s += '<text x="12" y="' + (cy + 5) + '" text-anchor="middle" font-size="13">西 270°</text>';
        s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="35" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="4,4"/>';
        if (turned) {
          s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + ex.toFixed(1) + '" y2="' + ey.toFixed(1) + '" stroke="#dc2626" stroke-width="3"/>';
          s += '<circle cx="' + ex.toFixed(1) + '" cy="' + ey.toFixed(1) + '" r="7" fill="#dc2626"/>';
          s += '<text x="' + cx + '" y="' + (cy + 34) + '" text-anchor="middle" font-size="14" fill="#dc2626">真方位角 ' + L.deg + '°</text>';
        } else {
          s += '<circle cx="' + cx + '" cy="' + cy + '" r="6" fill="#1e293b"/>';
        }
        s += '</svg>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = turned
        ? L.compass + ' = 真方位角 ' + L.deg + '°。'
        : '指针还在北（0°）。从北顺时针转到' + L.compass + '的方向，是多少度？';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：真方位角是多少度？'); return; }
      var ok = guessed === L.ans;
      msg(L.compass + '的真方位角是 ' + L.deg + '°。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '，转出来是 ' + L.deg + '°。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; turned = false; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点“转一转”。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜真方位角是 ' + LEVELS[li].opts[0] + '。转一转验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜真方位角是 ' + LEVELS[li].opts[1] + '。转一转验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜真方位角是 ' + LEVELS[li].opts[2] + '。转一转验证。'); });
    gid(K + '-turn').addEventListener('click', function () { turned = true; draw(); verdict(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：北偏东 30° = 30°', '提高：南偏西 25° = 205°', '挑战：北偏西 60° = 300°'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm63-route',
  title: '分段路线描述',
  sub: '路线是一段段“方向 + 距离”连起来的：每段说清转向与行进，合起来就是完整的路线。',
  grade: 6,
  kind: '实验',
  points: ['6.3'],
  render: function (el) {
    var K = 'm63-route';
    var LEVELS = [
      { label: '基础', start: '学校', legs: [
        { opts: ['北偏东 30°，300 米', '北偏西 30°，300 米', '南偏东 30°，300 米'], ans: 0, dx: 38, dy: -65, to: '图书馆' },
        { opts: ['南偏西 45°，200 米', '南偏东 45°，200 米', '北偏东 45°，200 米'], ans: 1, dx: 35, dy: 35, to: '公园' } ] },
      { label: '提高', start: '家', legs: [
        { opts: ['北偏西 20°，400 米', '北偏东 20°，400 米', '南偏西 20°，400 米'], ans: 0, dx: -34, dy: -94, to: '车站' },
        { opts: ['南偏东 60°，300 米', '南偏西 60°，300 米', '北偏东 60°，300 米'], ans: 0, dx: 65, dy: 38, to: '学校' } ] },
      { label: '挑战', start: '邮局', legs: [
        { opts: ['南偏东 50°，250 米', '南偏西 50°，250 米', '北偏西 50°，250 米'], ans: 1, dx: -48, dy: 40, to: '医院' },
        { opts: ['北偏西 70°，350 米', '北偏东 70°，350 米', '南偏东 70°，350 米'], ans: 1, dx: 82, dy: -30, to: '超市' } ] }
    ];
    var STARTS = [[80, 180], [200, 220], [100, 80]];
    var li = 0, leg = 0, mistakes = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 6 年级 · 位置与方向</p>' +
      '<h3>分段路线描述</h3>' +
      '<p>说路线，就是把一段一段的“方向 + 距离”连起来：每段先猜，再走，错了就退回来重选。</p>' +
      '<p>第 1 步 · 先猜：第 <span id="' + K + '-leg-tx"></span>段往哪走？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<div id="' + K + '-map"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再走这段。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 学校去公园</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 家去学校</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 邮局去超市</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三条路线都一次走对——每段方向和距离都说清。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function pts() {
      var L = LEVELS[li], p = [[STARTS[li][0], STARTS[li][1]]];
      for (var i = 0; i < leg; i++) {
        var prev = p[p.length - 1];
        p.push([prev[0] + L.legs[i].dx, prev[1] + L.legs[i].dy]);
      }
      return p;
    }
    function draw() {
      var L = LEVELS[li];
      var lt = gid(K + '-leg-tx'); if (lt) lt.textContent = leg >= L.legs.length ? String(L.legs.length) : String(leg + 1);
      if (leg < L.legs.length) {
        for (var k = 0; k < 3; k++) {
          var b = gid(K + '-guess-' + k);
          if (b) b.textContent = L.legs[leg].opts[k];
        }
      }
      var box = gid(K + '-map');
      if (box) {
        var p = pts(), s = '<svg width="300" height="260" viewBox="0 0 300 260">';
        for (var i = 1; i < p.length; i++) {
          s += '<line x1="' + p[i - 1][0] + '" y1="' + p[i - 1][1] + '" x2="' + p[i][0] + '" y2="' + p[i][1] + '" stroke="#2563eb" stroke-width="3"/>';
        }
        s += '<circle cx="' + p[0][0] + '" cy="' + p[0][1] + '" r="7" fill="#2563eb"/>';
        s += '<text x="' + (p[0][0] + 10) + '" y="' + (p[0][1] + 4) + '" font-size="13">' + L.start + '</text>';
        for (var j = 0; j < leg; j++) {
          s += '<circle cx="' + p[j + 1][0] + '" cy="' + p[j + 1][1] + '" r="7" fill="#f97316"/>';
          s += '<text x="' + (p[j + 1][0] + 10) + '" y="' + (p[j + 1][1] + 4) + '" font-size="13">' + L.legs[j].to + '</text>';
        }
        s += '</svg>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = leg === 0 ? '从' + L.start + '出发，一共 ' + L.legs.length + ' 段。'
        : leg < L.legs.length ? '到了' + L.legs[leg - 1].to + '，下一段往哪走？'
        : '走完了：' + L.start + ' → ' + L.legs.map(function (g) { return g.to; }).join(' → ') + '。';
    }
    function finish() {
      var L = LEVELS[li];
      if (mistakes === 0) {
        msg('走完了，一次全对：' + L.start + ' → ' + L.legs.map(function (g) { return g.to; }).join(' → ') + '。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('走完了，但有 ' + mistakes + ' 次选错了方向。换一档再走一遍，试试一次全对。');
      }
    }
    function pick(i) {
      var L = LEVELS[li];
      if (leg >= L.legs.length) return;
      var cur = L.legs[leg];
      if (i === cur.ans) {
        leg++;
        draw();
        if (leg >= L.legs.length) finish();
        else msg('走对了：' + cur.opts[i] + '，到了' + cur.to + '。下一段往哪走？');
      } else {
        mistakes++;
        msg('不对：' + cur.opts[i] + '会走到别的地方。再想想方向是往哪偏。');
      }
    }
    function setLevel(i) {
      li = i; leg = 0; mistakes = 0; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再走这段。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { pick(0); });
    gid(K + '-guess-1').addEventListener('click', function () { pick(1); });
    gid(K + '-guess-2').addEventListener('click', function () { pick(2); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：学校去公园', '提高：家去学校', '挑战：邮局去超市'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm63-opposite',
  title: '相对方向',
  sub: 'A 在 B 南偏东 60°，B 就在 A 北偏西 60°：角度和距离都不变，方向的字全反过来。',
  grade: 6,
  kind: '演示',
  points: ['6.3'],
  render: function (el) {
    var K = 'm63-opposite';
    var LEVELS = [
      { label: '基础', from: 'A 在 B 南偏东 60°，300 米', to: 'B 在 A 北偏西 60°，300 米', dx: 78, dy: 45, opts: ['北偏西 60°，300 米', '北偏东 60°，300 米', '南偏西 60°，300 米'], ans: 0 },
      { label: '提高', from: 'A 在 B 北偏西 45°，200 米', to: 'B 在 A 南偏东 45°，200 米', dx: -42, dy: -42, opts: ['南偏西 45°，200 米', '南偏东 45°，200 米', '北偏东 45°，200 米'], ans: 1 },
      { label: '挑战', from: 'A 在 B 南偏西 30°，500 米', to: 'B 在 A 北偏东 30°，500 米', dx: -75, dy: 130, opts: ['北偏西 30°，500 米', '南偏东 30°，500 米', '北偏东 30°，500 米'], ans: 2 }
    ];
    var li = 0, flipped = false, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 6 年级 · 位置与方向</p>' +
      '<h3>相对方向</h3>' +
      '<p>两个人互相看，方向正好反过来：南变北、东变西，角度和距离一个都不变。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span>反过来看，B 在 A 的哪个方向？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 换个角度看：站到 A 的位置，再看 B 在哪。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-flip" type="button">换到 A 的位置看</button></div>' +
      '<div id="' + K + '-map"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再换个角度看。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 南偏东 60°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 北偏西 45°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 南偏西 30°</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“方向的字全反过来，角度距离都不变”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.from + '，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-map');
      if (box) {
        var cx = 150, cy = 110;
        var ax = flipped ? cx : cx + L.dx, ay = flipped ? cy : cy + L.dy;
        var bx = flipped ? cx - L.dx : cx, by = flipped ? cy - L.dy : cy;
        var s = '<svg width="300" height="240" viewBox="0 0 300 240">';
        s += '<line x1="' + ax + '" y1="' + ay + '" x2="' + bx + '" y2="' + by + '" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5,4"/>';
        s += '<circle cx="' + ax + '" cy="' + ay + '" r="9" fill="#2563eb"/>';
        s += '<text x="' + (ax + 12) + '" y="' + (ay + 5) + '" font-size="14" font-weight="bold">A</text>';
        s += '<circle cx="' + bx + '" cy="' + by + '" r="9" fill="#f97316"/>';
        s += '<text x="' + (bx + 12) + '" y="' + (by + 5) + '" font-size="14" font-weight="bold">B</text>';
        s += '<text x="150" y="228" text-anchor="middle" font-size="13">' + (flipped ? '现在站在 A 的位置看 B' : '现在站在 B 的位置看 A') + '</text>';
        s += '</svg>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = flipped ? L.to + '。' : L.from + '。';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：反过来看，B 在 A 的哪个方向？'); return; }
      var ok = guessed === L.ans;
      msg(L.to + '。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '，反过来是 ' + L.opts[L.ans] + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; flipped = false; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再换个角度看。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜 B 在 A ' + LEVELS[li].opts[0] + '。换个角度验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜 B 在 A ' + LEVELS[li].opts[1] + '。换个角度验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜 B 在 A ' + LEVELS[li].opts[2] + '。换个角度验证。'); });
    gid(K + '-flip').addEventListener('click', function () { flipped = true; draw(); verdict(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：南偏东 60° 反过来是北偏西 60°', '提高：北偏西 45° 反过来是南偏东 45°', '挑战：南偏西 30° 反过来是北偏东 30°'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
/* 6.4 比：比条已有 demo-ratio（6.4 点页主演示），份数法按比分配也在 ratio 里（先算一共几份、每份多少，再按份数分）；双数轴和调色/串珠没有，做这两个。 */
registerAnim({
  key: 'm64-axis',
  title: '双数轴',
  sub: '上下两行数轴对齐走：一行是份数，一行是实际量，对齐的点就是等比的量。',
  grade: 6,
  kind: '模拟',
  points: ['6.4'],
  render: function (el) {
    var K = 'm64-axis';
    var LEVELS = [
      { label: '基础', ra: 2, rb: 3, total: 50, unit: '元', per: 10, opts: ['10 元', '5 元', '25 元'], ans: 0 },
      { label: '提高', ra: 3, rb: 5, total: 80, unit: '克', per: 10, opts: ['8 克', '10 克', '16 克'], ans: 1 },
      { label: '挑战', ra: 1, rb: 4, total: 125, unit: '毫升', per: 25, opts: ['20 毫升', '30 毫升', '25 毫升'], ans: 2 }
    ];
    var li = 0, pos = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 比</p>' +
      '<h3>双数轴</h3>' +
      '<p>比是两行数对齐走：上面一行数份数，下面一行数实际量，上下对齐的两个数永远成同一个比。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span>每份是多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 走一走：上下两行一起走，走到前项的份数停下，对一下。</p>' +
      '<div class="btn-row"><button class="btn small ghost" id="' + K + '-minus" type="button">− 一份</button>' +
      '<button class="btn small ghost" id="' + K + '-plus" type="button">＋ 一份</button>' +
      '<button class="btn small primary" id="' + K + '-check" type="button">对一下这一档</button></div>' +
      '<div id="' + K + '-axis"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再走一走。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 2:3 分 50 元</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 3:5 分 80 克</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 1:4 分 125 毫升</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“上下对齐的两个数，比永远一样”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li], tot = L.ra + L.rb;
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.ra + ':' + L.rb + '，一共 ' + L.total + L.unit + '，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-axis');
      if (box) {
        var W = 560, s = '<svg width="' + W + '" height="120" viewBox="0 0 ' + W + ' 120">';
        function X(i) { return 40 + i / tot * 480; }
        s += '<text x="8" y="38" font-size="13">份</text>';
        s += '<line x1="40" y1="34" x2="520" y2="34" stroke="#1e293b" stroke-width="2"/>';
        s += '<text x="8" y="88" font-size="13">' + L.unit + '</text>';
        s += '<line x1="40" y1="84" x2="520" y2="84" stroke="#1e293b" stroke-width="2"/>';
        for (var i = 0; i <= tot; i++) {
          var x = X(i);
          s += '<line x1="' + x.toFixed(1) + '" y1="28" x2="' + x.toFixed(1) + '" y2="40" stroke="#1e293b" stroke-width="2"/>';
          s += '<text x="' + x.toFixed(1) + '" y="22" text-anchor="middle" font-size="12">' + i + '</text>';
          s += '<line x1="' + x.toFixed(1) + '" y1="78" x2="' + x.toFixed(1) + '" y2="90" stroke="#1e293b" stroke-width="2"/>';
          s += '<text x="' + x.toFixed(1) + '" y="108" text-anchor="middle" font-size="12">' + (i * L.per) + '</text>';
        }
        var mx = X(pos);
        s += '<line x1="' + mx.toFixed(1) + '" y1="14" x2="' + mx.toFixed(1) + '" y2="96" stroke="#dc2626" stroke-width="2" stroke-dasharray="4,3"/>';
        s += '<circle cx="' + mx.toFixed(1) + '" cy="34" r="7" fill="#dc2626"/>';
        s += '<circle cx="' + mx.toFixed(1) + '" cy="84" r="7" fill="#dc2626"/>';
        s += '</svg>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = pos + ' 份 ↔ ' + (pos * L.per) + L.unit + '。走到 ' + L.ra + ' 份，就是前项分到的 ' + (L.ra * L.per) + L.unit + '。';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：每份是多少？'); return; }
      var ok = guessed === L.ans && pos === L.ra;
      if (pos !== L.ra) { msg('先走到 ' + L.ra + ' 份再对：现在是 ' + pos + ' 份。'); return; }
      msg(L.ra + ':' + L.rb + '，一共 ' + (L.ra + L.rb) + ' 份，每份 ' + L.per + L.unit + '：前项分 ' + (L.ra * L.per) + L.unit + '，后项分 ' + (L.rb * L.per) + L.unit + '。' + (guessed === L.ans ? '你猜对了！' : '你猜每份是 ' + L.opts[guessed] + '，其实是 ' + L.per + L.unit + '。'));
      if (guessed === L.ans) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; pos = 0; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再走一走。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜每份是 ' + LEVELS[li].opts[0] + '。走一走验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜每份是 ' + LEVELS[li].opts[1] + '。走一走验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜每份是 ' + LEVELS[li].opts[2] + '。走一走验证。'); });
    gid(K + '-minus').addEventListener('click', function () { var L = LEVELS[li]; if (pos > 0) pos--; draw(); });
    gid(K + '-plus').addEventListener('click', function () { var L = LEVELS[li]; if (pos < L.ra + L.rb) pos++; draw(); });
    gid(K + '-check').addEventListener('click', function () { verdict(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：2:3 分 50 元，每份 10 元', '提高：3:5 分 80 克，每份 10 克', '挑战：1:4 分 125 毫升，每份 25 毫升'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm64-mix',
  title: '调色与串珠',
  sub: '不同总量调出同种颜色就是等比：总量变了，比不变，颜色就不变。',
  grade: 6,
  kind: '实验',
  points: ['6.4'],
  render: function (el) {
    var K = 'm64-mix';
    var LEVELS = [
      { label: '基础', kind: 'color', ta: 1, tb: 2, ca: '红', cb: '黄', opts: ['2:4', '2:3', '1:3'], ans: 0, note: '1:2 和 2:4 是同一个比' },
      { label: '提高', kind: 'color', ta: 3, tb: 1, ca: '蓝', cb: '白', opts: ['3:2', '6:2', '6:1'], ans: 1, note: '3:1 和 6:2 是同一个比' },
      { label: '挑战', kind: 'beads', ta: 2, tb: 3, total: 15, red: 6, opts: ['6', '5', '9'], ans: 0, note: '15 颗里红珠 6 颗、蓝珠 9 颗' }
    ];
    var li = 0, a = 0, b = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 6 年级 · 比</p>' +
      '<h3>调色与串珠</h3>' +
      '<p>调颜色、串珠子，都是在玩等比：总量变了，只要比不变，颜色和花纹就不变。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 调一调：按你猜的配法加料，再比一比颜色变没变。</p>' +
      '<div class="btn-row"><button class="btn small ghost" id="' + K + '-a-plus" type="button">＋ 一勺</button>' +
      '<button class="btn small ghost" id="' + K + '-b-plus" type="button">＋ 一勺</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">倒掉重调</button>' +
      '<button class="btn small primary" id="' + K + '-mix" type="button">调一调</button></div>' +
      '<div id="' + K + '-cup"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再调一调。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 红:黄 = 1:2</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 蓝:白 = 3:1</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 红:蓝 = 2:3 串 15 颗</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“比不变，颜色就不变；总量变了，比可以不变”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.kind === 'color'
        ? L.ca + ':' + L.cb + ' = ' + L.ta + ':' + L.tb + '，哪种配法调出的颜色一样？'
        : '红:蓝 = 2:3，串 15 颗珠子，红珠有几颗？';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var ap = gid(K + '-a-plus'), bp = gid(K + '-b-plus');
      if (ap) ap.textContent = '＋ 一勺' + (L.kind === 'color' ? L.ca : '红珠');
      if (bp) bp.textContent = '＋ 一勺' + (L.kind === 'color' ? L.cb : '蓝珠');
      var box = gid(K + '-cup');
      if (box) {
        var s = '';
        if (L.kind === 'color') {
          var tot = a + b;
          s += '<p>杯子里：' + L.ca + ' ' + a + ' 勺，' + L.cb + ' ' + b + ' 勺。</p>';
          if (tot > 0) {
            s += '<div style="display:flex;width:300px;height:30px;border:1px solid #1e293b">';
            s += '<div style="width:' + (a / tot * 100).toFixed(1) + '%;background:#f87171"></div>';
            s += '<div style="width:' + (b / tot * 100).toFixed(1) + '%;background:#fde68a"></div></div>';
          }
        } else {
          s += '<p>串上了 ' + a + ' 颗红珠、' + b + ' 颗蓝珠，一共 ' + (a + b) + ' 颗。</p>';
          s += '<p>';
          for (var i = 0; i < a; i++) s += '<span style="color:#dc2626">●</span>';
          for (var j = 0; j < b; j++) s += '<span style="color:#2563eb">●</span>';
          s += '</p>';
        }
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = L.kind === 'color'
        ? '目标是 ' + L.ta + ':' + L.tb + '。现在是 ' + a + ':' + b + '。'
        : '目标是红:蓝 = 2:3，一共 15 颗。';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜。'); return; }
      var ok = guessed === L.ans;
      if (L.kind === 'color') {
        var same = a > 0 && b > 0 && a * L.tb === b * L.ta;
        msg(ok && same
          ? '颜色一样：' + a + ':' + b + ' 和 ' + L.ta + ':' + L.tb + ' 是同一个比，' + L.note + '。你猜对了！'
          : !same ? '现在是 ' + a + ':' + b + '，和 ' + L.ta + ':' + L.tb + ' 不是同一个比，颜色不一样。按你猜的配法再调调。'
          : '比调对了，但你猜的是 ' + L.opts[guessed] + '，颜色一样的配法是 ' + L.opts[L.ans] + '。');
        if (ok && same) {
          if (tiers) tiers.done(li);
          if (typeof markTried === 'function') markTried(K);
        }
      } else {
        var full = (a + b) === 15 && a === 6;
        msg(full && ok
          ? '串好了：红珠 6 颗、蓝珠 9 颗，6:9 = 2:3。你猜对了！'
          : (a + b) !== 15 ? '先串满 15 颗：现在只有 ' + (a + b) + ' 颗。'
          : '串满了，但红珠是 ' + a + ' 颗，2:3 的 15 颗里红珠应该是 6 颗。');
        if (full && ok) {
          if (tiers) tiers.done(li);
          if (typeof markTried === 'function') markTried(K);
        }
      }
    }
    function setLevel(i) {
      li = i; a = 0; b = 0; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var bEl = gid(K + '-level-' + k);
        if (bEl) bEl.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再调一调。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜是 ' + LEVELS[li].opts[0] + '。调一调验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜是 ' + LEVELS[li].opts[1] + '。调一调验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜是 ' + LEVELS[li].opts[2] + '。调一调验证。'); });
    gid(K + '-a-plus').addEventListener('click', function () { a++; draw(); });
    gid(K + '-b-plus').addEventListener('click', function () { b++; draw(); });
    gid(K + '-reset').addEventListener('click', function () { a = 0; b = 0; draw(); msg('倒掉了，重新调。'); });
    gid(K + '-mix').addEventListener('click', function () { verdict(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：1:2 = 2:4，颜色一样', '提高：3:1 = 6:2，颜色一样', '挑战：2:3 串 15 颗，红珠 6 颗'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
/* 6.5 圆：绕绳量已有 demo-circle 周长模式，切扇形拼长方形已有 demo-circle 面积模式，都在 6.5 点页上，跳过；方格纸数格子、扇形是几分之几没有，做这两个。 */
registerAnim({
  key: 'm65-grid',
  title: '方格纸数格子',
  sub: '在方格纸上画圆数格子估面积：满格全算，不满的格算半格，再和公式算的结果对照。',
  grade: 6,
  kind: '模拟',
  points: ['6.5'],
  render: function (el) {
    var K = 'm65-grid';
    var LEVELS = [
      { label: '基础', r: 5, full: 60, part: 36, est: 78, formula: '78.5', opts: ['78', '50', '100'], ans: 0 },
      { label: '提高', r: 3, full: 16, part: 20, est: 26, formula: '28.26', opts: ['16', '26', '36'], ans: 1 },
      { label: '挑战', r: 4, full: 32, part: 28, est: 46, formula: '50.24', opts: ['32', '64', '46'], ans: 2 }
    ];
    var li = 0, stage = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 圆</p>' +
      '<h3>方格纸数格子</h3>' +
      '<p>圆的面积是“占了多少格”：满格全算，不满的格算半格，数完再和公式对照。</p>' +
      '<p>第 1 步 · 先猜：半径 <span id="' + K + '-q-tx"></span>的圆，面积大约是多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 数格子：先数满格，再数不满的格，最后算公式。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-full" type="button">数满格</button>' +
      '<button class="btn small primary" id="' + K + '-part" type="button">数不满的格</button>' +
      '<button class="btn small primary" id="' + K + '-formula" type="button">算公式</button></div>' +
      '<div id="' + K + '-grid"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再数满格。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 半径 5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 半径 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 半径 4</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“满格加半格，估出来的面积和公式算的差不多”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function cellKind(L, gx, gy) {
      var r2 = L.r * L.r, ds = [];
      var xs = [gx, gx + 1], ys = [gy, gy + 1];
      for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++) ds.push(xs[i] * xs[i] + ys[j] * ys[j]);
      var mn = Math.min(ds[0], ds[1], ds[2], ds[3]), mx = Math.max(ds[0], ds[1], ds[2], ds[3]);
      if (mx <= r2) return 'full';
      if (mn <= r2) return 'part';
      return 'out';
    }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = String(L.r);
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-grid');
      if (box) {
        var cs = 26, W = 2 * L.r * cs + 4, s = '<svg width="' + W + '" height="' + W + '" viewBox="0 0 ' + W + ' ' + W + '">';
        for (var gy = -L.r; gy < L.r; gy++) {
          for (var gx = -L.r; gx < L.r; gx++) {
            var kind = cellKind(L, gx, gy);
            var fill = '#ffffff';
            if (stage >= 1 && kind === 'full') fill = '#93c5fd';
            if (stage >= 2 && kind === 'part') fill = '#fde68a';
            s += '<rect x="' + (2 + (gx + L.r) * cs) + '" y="' + (2 + (gy + L.r) * cs) + '" width="' + (cs - 1) + '" height="' + (cs - 1) + '" fill="' + fill + '" stroke="#cbd5e1" stroke-width="1"/>';
          }
        }
        s += '<circle cx="' + (W / 2) + '" cy="' + (W / 2) + '" r="' + (L.r * cs) + '" fill="none" stroke="#dc2626" stroke-width="2"/>';
        s += '</svg>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = stage === 0 ? '方格纸上画了一个半径 ' + L.r + ' 的圆，每格是 1 平方单位。'
        : stage === 1 ? '满格有 ' + L.full + ' 个。'
        : stage === 2 ? '满格 ' + L.full + ' 个，不满的格 ' + L.part + ' 个、算半格是 ' + (L.part / 2) + ' 个，估计面积约 ' + L.est + '。'
        : '估计约 ' + L.est + '，公式算：3.14 × ' + L.r + ' × ' + L.r + ' = ' + L.formula + '。数格子和公式对上了。';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：面积大约是多少？'); return; }
      var ok = guessed === L.ans;
      msg('数出来约 ' + L.est + '，公式算是 ' + L.formula + '。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '，数出来约 ' + L.est + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; stage = 0; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再数满格。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜面积大约是 ' + LEVELS[li].opts[0] + '。数格子验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜面积大约是 ' + LEVELS[li].opts[1] + '。数格子验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜面积大约是 ' + LEVELS[li].opts[2] + '。数格子验证。'); });
    gid(K + '-full').addEventListener('click', function () { if (stage === 0) { stage = 1; draw(); msg('满格 ' + LEVELS[li].full + ' 个，变蓝了。再数不满的格。'); } });
    gid(K + '-part').addEventListener('click', function () { if (stage === 1) { stage = 2; draw(); msg('不满的格 ' + LEVELS[li].part + ' 个，变黄了，每个算半格。再算公式。'); } else if (stage === 0) { msg('先数满格。'); } });
    gid(K + '-formula').addEventListener('click', function () { if (stage === 2) { stage = 3; draw(); verdict(); } else { msg('先数满格，再数不满的格。'); } });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：半径 5，约 78，公式 78.5', '提高：半径 3，约 26，公式 28.26', '挑战：半径 4，约 46，公式 50.24'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm65-sector',
  title: '扇形是圆的几分之几',
  sub: '圆心角是 360° 的几分之几，扇形面积就是圆面积的几分之几。',
  grade: 6,
  kind: '模拟',
  points: ['6.5'],
  render: function (el) {
    var K = 'm65-sector';
    var LEVELS = [
      { label: '基础', deg: 90, frac: '1/4', r: 4, circle: '50.24', sector: '12.56', opts: ['1/4', '1/2', '1/3'], ans: 0 },
      { label: '提高', deg: 120, frac: '1/3', r: 3, circle: '28.26', sector: '9.42', opts: ['1/2', '1/3', '1/4'], ans: 1 },
      { label: '挑战', deg: 60, frac: '1/6', r: 6, circle: '113.04', sector: '18.84', opts: ['1/3', '1/6', '1/2'], ans: 1 }
    ];
    var li = 0, cut = false, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 圆</p>' +
      '<h3>扇形是圆的几分之几</h3>' +
      '<p>扇形是圆上切下来的一块：圆心角占 360° 的几分之几，扇形面积就占圆面积的几分之几。</p>' +
      '<p>第 1 步 · 先猜：圆心角 <span id="' + K + '-q-tx"></span>，扇形是圆的几分之几？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 切一切：按圆心角切下扇形，看它占了圆的多少。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-cut" type="button">切一切</button></div>' +
      '<div id="' + K + '-pie"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再切一切。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 90°，半径 4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 120°，半径 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 60°，半径 6</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“圆心角是 360° 的几分之几，扇形就是圆的几分之几”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.deg + '°，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-pie');
      if (box) {
        var cx = 120, cy = 120, R = 95;
        var rad = L.deg * Math.PI / 180;
        var x1 = cx, y1 = cy - R;
        var x2 = cx + R * Math.sin(rad), y2 = cy - R * Math.cos(rad);
        var s = '<svg width="240" height="240" viewBox="0 0 240 240">';
        s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="#f1f5f9" stroke="#1e293b" stroke-width="2"/>';
        if (cut) {
          s += '<path d="M ' + cx + ',' + cy + ' L ' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' A ' + R + ',' + R + ' 0 0,1 ' + x2.toFixed(1) + ',' + y2.toFixed(1) + ' Z" fill="#fb923c" stroke="#1e293b" stroke-width="2"/>';
          s += '<text x="' + cx + '" y="' + (cy + 6) + '" text-anchor="middle" font-size="15" font-weight="bold">' + L.frac + '</text>';
        }
        s += '<text x="' + cx + '" y="228" text-anchor="middle" font-size="13">圆心角 ' + L.deg + '°</text>';
        s += '</svg>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = cut
        ? L.deg + '° 是 360° 的 ' + L.frac + '，扇形面积 = ' + L.frac + ' × ' + L.circle + ' = ' + L.sector + '。'
        : '整个圆是 360°，也是 ' + L.circle + '。切下 ' + L.deg + '° 的一块，是几分之几？';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：扇形是圆的几分之几？'); return; }
      var ok = guessed === L.ans;
      msg('扇形是圆的 ' + L.frac + '，面积 ' + L.sector + '。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '，切出来是 ' + L.frac + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; cut = false; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再切一切。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜扇形是圆的 ' + LEVELS[li].opts[0] + '。切一切验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜扇形是圆的 ' + LEVELS[li].opts[1] + '。切一切验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜扇形是圆的 ' + LEVELS[li].opts[2] + '。切一切验证。'); });
    gid(K + '-cut').addEventListener('click', function () { cut = true; draw(); verdict(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：90° 是 1/4，面积 12.56', '提高：120° 是 1/3，面积 9.42', '挑战：60° 是 1/6，面积 18.84'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
/* 6.6 百分数（一）：百分条已有 demo-percent（6.6 点页主演示），跳过；三者互化在 percent 里只有一行文字换算，没有分数墙对照，双数轴和先估后算没有，做这三个。 */
registerAnim({
  key: 'm66-convert',
  title: '分数小数百分数互化',
  sub: '同一长度三种写法对照：1/4 = 0.25 = 25%，在分数墙上是同一个位置。',
  grade: 6,
  kind: '模拟',
  points: ['6.6'],
  render: function (el) {
    var K = 'm66-convert';
    var LEVELS = [
      { label: '基础', f: '1/4', n: 1, d: 4, dec: '0.25', pct: '25%', opts: ['25%', '40%', '20%'], ans: 0 },
      { label: '提高', f: '3/5', n: 3, d: 5, dec: '0.6', pct: '60%', opts: ['35%', '60%', '65%'], ans: 1 },
      { label: '挑战', f: '7/20', n: 7, d: 20, dec: '0.35', pct: '35%', opts: ['70%', '35%', '25%'], ans: 1 }
    ];
    var li = 0, shown = false, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 百分数</p>' +
      '<h3>分数小数百分数互化</h3>' +
      '<p>分数、小数、百分数是同一个数的三种写法：分数墙上同一位置，读出来就是三种样子。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span>它等于百分之几？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 对照一下：墙上找到这个分数，再看它的另外两种写法。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-match" type="button">对照一下</button></div>' +
      '<div id="' + K + '-wall"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再对照一下。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 1/4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 3/5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 7/20</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“分母化成 100，就是百分数；小数点挪两位，就是百分数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.f + '，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-wall');
      if (box) {
        var W = 540, s = '<svg width="' + W + '" height="120" viewBox="0 0 ' + W + ' 120">';
        var rows = [2, 4, 5, 10, 20];
        for (var ri = 0; ri < rows.length; ri++) {
          var d = rows[ri], y = 6 + ri * 22, cw = (W - 60) / d;
          s += '<text x="4" y="' + (y + 15) + '" font-size="12">1/' + d + '</text>';
          for (var c = 0; c < d; c++) {
            var fill = '#ffffff';
            if (shown && d === L.d && c < L.n) fill = '#fde68a';
            s += '<rect x="' + (56 + c * cw).toFixed(1) + '" y="' + y + '" width="' + (cw - 1).toFixed(1) + '" height="18" fill="' + fill + '" stroke="#94a3b8" stroke-width="1"/>';
          }
        }
        s += '</svg>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = shown
        ? L.f + ' = ' + L.dec + ' = ' + L.pct + '：墙上 1/' + L.d + ' 那一行，涂了 ' + L.n + ' 格，就是同一个位置。'
        : '墙上找一找 ' + L.f + ' 在哪一行。';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：它等于百分之几？'); return; }
      var ok = guessed === L.ans;
      msg(L.f + ' = ' + L.dec + ' = ' + L.pct + '。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '，对照出来是 ' + L.pct + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; shown = false; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再对照一下。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜是 ' + LEVELS[li].opts[0] + '。对照一下验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜是 ' + LEVELS[li].opts[1] + '。对照一下验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜是 ' + LEVELS[li].opts[2] + '。对照一下验证。'); });
    gid(K + '-match').addEventListener('click', function () { shown = true; draw(); verdict(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：1/4 = 0.25 = 25%', '提高：3/5 = 0.6 = 60%', '挑战：7/20 = 0.35 = 35%'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm66-axis',
  title: '双数轴看涨跌',
  sub: '百分数是分母 100 的比：上下两行对齐走，“多 20%”就是整体加整体的 20%。',
  grade: 6,
  kind: '模拟',
  points: ['6.6'],
  render: function (el) {
    var K = 'm66-axis';
    var LEVELS = [
      { label: '基础', base: 80, rate: 1.25, res: 100, unit: '元', what: '涨 25%', opts: ['100 元', '80 元', '120 元'], ans: 0 },
      { label: '提高', base: 200, rate: 0.8, res: 160, unit: '元', what: '降 20%', opts: ['180 元', '160 元', '240 元'], ans: 1 },
      { label: '挑战', base: 60, rate: 1.5, res: 90, unit: '', what: '是 150%', opts: ['60', '150', '90'], ans: 2 }
    ];
    var li = 0, pos = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 百分数</p>' +
      '<h3>双数轴看涨跌</h3>' +
      '<p>涨价跌价，底数不能丢：上下两行对齐走，上面是原来的价，下面是现在的价。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span>现在是多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 走一走：上面走到原价，下面跟着走到现价，对一下。</p>' +
      '<div class="btn-row"><button class="btn small ghost" id="' + K + '-minus" type="button">− 一格</button>' +
      '<button class="btn small ghost" id="' + K + '-plus" type="button">＋ 一格</button>' +
      '<button class="btn small primary" id="' + K + '-check" type="button">对一下这一档</button></div>' +
      '<div id="' + K + '-axis"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再走一走。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 80 元涨 25%</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 200 元降 20%</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 60 的 150%</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“先看底数是谁，再乘百分之几”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = L.label === '挑战' ? '60 ' + L.what + '，' : L.base + ' 元' + L.what + '，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-axis');
      if (box) {
        var W = 560, s = '<svg width="' + W + '" height="120" viewBox="0 0 ' + W + ' 120">';
        function X(i) { return 50 + i / 4 * 470; }
        s += '<text x="4" y="38" font-size="13">原来</text>';
        s += '<line x1="50" y1="34" x2="520" y2="34" stroke="#1e293b" stroke-width="2"/>';
        s += '<text x="4" y="88" font-size="13">现在</text>';
        s += '<line x1="50" y1="84" x2="520" y2="84" stroke="#1e293b" stroke-width="2"/>';
        for (var i = 0; i <= 4; i++) {
          var x = X(i), up = L.base / 4 * i, dn = Math.round(L.base * L.rate / 4 * i * 100) / 100;
          s += '<line x1="' + x.toFixed(1) + '" y1="28" x2="' + x.toFixed(1) + '" y2="40" stroke="#1e293b" stroke-width="2"/>';
          s += '<text x="' + x.toFixed(1) + '" y="22" text-anchor="middle" font-size="12">' + String(up) + '</text>';
          s += '<line x1="' + x.toFixed(1) + '" y1="78" x2="' + x.toFixed(1) + '" y2="90" stroke="#1e293b" stroke-width="2"/>';
          s += '<text x="' + x.toFixed(1) + '" y="108" text-anchor="middle" font-size="12">' + String(dn) + '</text>';
        }
        var mx = X(pos);
        s += '<line x1="' + mx.toFixed(1) + '" y1="14" x2="' + mx.toFixed(1) + '" y2="96" stroke="#dc2626" stroke-width="2" stroke-dasharray="4,3"/>';
        s += '<circle cx="' + mx.toFixed(1) + '" cy="34" r="7" fill="#dc2626"/>';
        s += '<circle cx="' + mx.toFixed(1) + '" cy="84" r="7" fill="#dc2626"/>';
        s += '</svg>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = '原来 ' + (L.base / 4 * pos) + L.unit + ' ↔ 现在 ' + (Math.round(L.base * L.rate / 4 * pos * 100) / 100) + L.unit + '。走到头，就是 ' + L.base + L.unit + ' ↔ ' + L.res + L.unit + '。';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：现在是多少？'); return; }
      if (pos !== 4) { msg('先走到头（第 4 格）再对：现在是第 ' + pos + ' 格。'); return; }
      var ok = guessed === L.ans;
      msg(L.base + L.unit + L.what + '是 ' + L.res + L.unit + '。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '，对出来是 ' + L.res + L.unit + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; pos = 0; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再走一走。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜现在是 ' + LEVELS[li].opts[0] + '。走一走验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜现在是 ' + LEVELS[li].opts[1] + '。走一走验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜现在是 ' + LEVELS[li].opts[2] + '。走一走验证。'); });
    gid(K + '-minus').addEventListener('click', function () { if (pos > 0) pos--; draw(); });
    gid(K + '-plus').addEventListener('click', function () { if (pos < 4) pos++; draw(); });
    gid(K + '-check').addEventListener('click', function () { verdict(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：80 元涨 25% 是 100 元', '提高：200 元降 20% 是 160 元', '挑战：60 的 150% 是 90'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm66-estimate',
  title: '先估后算',
  sub: '先说“我大概觉得是多少”再算，算完对照：错 10 倍也能一眼发现。',
  grade: 6,
  kind: '实验',
  points: ['6.6'],
  render: function (el) {
    var K = 'm66-estimate';
    var LEVELS = [
      { label: '基础', q: '398 × 21', est: '约 8000', estHow: '400 × 20 = 8000', act: '8358', diff: '358', opts: ['8000', '800', '80000'], ans: 0 },
      { label: '提高', q: '500 的 62%', est: '约 300', estHow: '60% × 500 = 300', act: '310', diff: '10', opts: ['30', '300', '3000'], ans: 1 },
      { label: '挑战', q: '19.8 × 5.1', est: '约 100', estHow: '20 × 5 = 100', act: '100.98', diff: '0.98', opts: ['10', '100', '1000'], ans: 1 }
    ];
    var li = 0, calc = false, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 6 年级 · 百分数</p>' +
      '<h3>先估后算</h3>' +
      '<p>先估后算不是偷懒，是给答案装一个“警报器”：算出来的数和估计差太多，一定是哪里算错了。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span>大约是多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 算一算，再对照：估计和准确答案差多少？</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-calc" type="button">算一算</button></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再算一算。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 398 × 21</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 500 的 62%</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 19.8 × 5.1</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“先估一个大概，算完对照，差太多就是算错了”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.q + '，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = calc
        ? '估计：' + L.estHow + '，' + L.est + '。准确答案是 ' + L.act + '，只差 ' + L.diff + '。'
        : '先把数凑整：398 看成 400，21 看成 20，62% 看成 60%，19.8 看成 20。';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：大约是多少？'); return; }
      var ok = guessed === L.ans;
      msg('估计' + L.est + '，准确答案 ' + L.act + '，只差 ' + L.diff + '。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '，估计出来是 ' + L.est + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; calc = false; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再算一算。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜大约是 ' + LEVELS[li].opts[0] + '。算一算验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜大约是 ' + LEVELS[li].opts[1] + '。算一算验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜大约是 ' + LEVELS[li].opts[2] + '。算一算验证。'); });
    gid(K + '-calc').addEventListener('click', function () { calc = true; draw(); verdict(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：398 × 21 约 8000，实际 8358', '提高：500 的 62% 约 300，实际 310', '挑战：19.8 × 5.1 约 100，实际 100.98'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
/* 6.7a 扇形统计图：角度法已有 demo-fan（6.7a 点页主演示），跳过；份数法、三者对照、读图反推没有，做这三个。 */
registerAnim({
  key: 'm67a-parts',
  title: '份数法画扇形',
  sub: '先数总数，每一份占几度，再按份数累加画扇形：36 个人，每人 10°。',
  grade: 6,
  kind: '模拟',
  points: ['6.7a'],
  render: function (el) {
    var K = 'm67a-parts';
    var LEVELS = [
      { label: '基础', total: 36, per: 10, groups: [['苹果', 18], ['香蕉', 12], ['橙子', 6]], opts: ['10°', '9°', '12°'], ans: 0 },
      { label: '提高', total: 40, per: 9, groups: [['跳绳', 20], ['跑步', 12], ['踢球', 8]], opts: ['10°', '9°', '12°'], ans: 1 },
      { label: '挑战', total: 30, per: 12, groups: [['语文', 15], ['数学', 10], ['英语', 5]], opts: ['9°', '10°', '12°'], ans: 2 }
    ];
    var li = 0, stage = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 扇形统计图</p>' +
      '<h3>份数法画扇形</h3>' +
      '<p>不用百分数也能画扇形图：先数一共有多少人，每人占几度，再按人数累加。</p>' +
      '<p>第 1 步 · 先猜：一共 <span id="' + K + '-q-tx"></span>，每人占几度？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 数一数，再画：先算每人几度，再按份数画扇形。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-per" type="button">每人占几度</button>' +
      '<button class="btn small primary" id="' + K + '-draw" type="button">按份数画扇形</button></div>' +
      '<div id="' + K + '-pie"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再算每人几度。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 36 人选水果</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 40 人选运动</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 30 人选科目</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“360° 除以总数就是每人占的度数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.total + ' 人，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-pie');
      if (box) {
        var s = '';
        if (stage >= 2) {
          var cols = ['#f97316', '#38bdf8', '#4ade80'], acc = 0, stops = [];
          for (var i = 0; i < 3; i++) {
            var pct = L.groups[i][1] / L.total * 100;
            stops.push(cols[i] + ' ' + acc.toFixed(1) + '% ' + (acc + pct).toFixed(1) + '%');
            acc += pct;
          }
          s += '<div style="width:180px;height:180px;border-radius:50%;background:conic-gradient(' + stops.join(',') + ')"></div>';
          s += '<p>';
          for (var j = 0; j < 3; j++) {
            s += L.groups[j][0] + ' ' + L.groups[j][1] + ' 人，' + (L.groups[j][1] * L.per) + '°；';
          }
          s += '</p>';
        } else {
          s += '<p>人数：' + L.groups.map(function (g) { return g[0] + ' ' + g[1] + ' 人'; }).join('，') + '。</p>';
        }
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = stage === 0 ? '一共 ' + L.total + ' 人，整个圆是 360°。'
        : stage === 1 ? '360° ÷ ' + L.total + ' 人 = 每人 ' + L.per + '°。'
        : L.groups.map(function (g) { return g[0] + ' ' + g[1] + ' 人 × ' + L.per + '° = ' + (g[1] * L.per) + '°'; }).join('；') + '。加起来：' + (L.groups[0][1] * L.per + L.groups[1][1] * L.per + L.groups[2][1] * L.per) + '° = 360°。';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：每人占几度？'); return; }
      var ok = guessed === L.ans;
      msg('360° ÷ ' + L.total + ' = 每人 ' + L.per + '°。' + (ok ? '你猜对了！' : '你猜每人 ' + L.opts[guessed] + '，算出来是每人 ' + L.per + '°。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; stage = 0; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再算每人几度。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜每人占 ' + LEVELS[li].opts[0] + '。算一算验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜每人占 ' + LEVELS[li].opts[1] + '。算一算验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜每人占 ' + LEVELS[li].opts[2] + '。算一算验证。'); });
    gid(K + '-per').addEventListener('click', function () { if (stage === 0) { stage = 1; draw(); msg('每人 ' + LEVELS[li].per + '°。再按份数画扇形。'); } });
    gid(K + '-draw').addEventListener('click', function () { if (stage === 1) { stage = 2; draw(); verdict(); } else if (stage === 0) { msg('先算每人占几度。'); } });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：36 人，每人 10°', '提高：40 人，每人 9°', '挑战：30 人，每人 12°'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm67a-triple',
  title: '分数百分数角度三者对照',
  sub: '1/4 = 25% = 90°：同一个扇形，分数、百分数、角度三种说法互相翻译。',
  grade: 6,
  kind: '演示',
  points: ['6.7a'],
  render: function (el) {
    var K = 'm67a-triple';
    var LEVELS = [
      { label: '基础', frac: '1/4', pct: '25%', deg: 90, opts: ['90°', '60°', '120°'], ans: 0 },
      { label: '提高', frac: '3/10', pct: '30%', deg: 108, opts: ['90°', '108°', '120°'], ans: 1 },
      { label: '挑战', frac: '2/5', pct: '40%', deg: 144, opts: ['120°', '144°', '90°'], ans: 1 }
    ];
    var li = 0, shown = [false, false, false], guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 6 年级 · 扇形统计图</p>' +
      '<h3>分数百分数角度三者对照</h3>' +
      '<p>同一个扇形有三种说法：分数说它占了圆的几分之几，百分数说百分之几，角度说多少度。</p>' +
      '<p>第 1 步 · 先猜：这个扇形是 <span id="' + K + '-q-tx"></span>，它是多少度？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 三种说法都说出来：点三个按钮，一个一个翻译。</p>' +
      '<div class="btn-row"><button class="btn small ghost" id="' + K + '-say-frac" type="button">分数怎么说</button>' +
      '<button class="btn small ghost" id="' + K + '-say-pct" type="button">百分数怎么说</button>' +
      '<button class="btn small ghost" id="' + K + '-say-deg" type="button">角度怎么说</button></div>' +
      '<div id="' + K + '-pie"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再三种说法都说出来。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 1/4 的扇形</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 3/10 的扇形</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 2/5 的扇形</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“分数变百分数乘 100，百分数变角度乘 3.6°”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.frac + '，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-pie');
      if (box) {
        var cx = 110, cy = 110, R = 85;
        var rad = L.deg * Math.PI / 180;
        var x2 = cx + R * Math.sin(rad), y2 = cy - R * Math.cos(rad);
        var s = '<svg width="220" height="220" viewBox="0 0 220 220">';
        s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="#f1f5f9" stroke="#1e293b" stroke-width="2"/>';
        s += '<path d="M ' + cx + ',' + cy + ' L ' + cx + ',' + (cy - R) + ' A ' + R + ',' + R + ' 0 0,1 ' + x2.toFixed(1) + ',' + y2.toFixed(1) + ' Z" fill="#fb923c" stroke="#1e293b" stroke-width="2"/>';
        s += '</svg>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) {
        var parts = [];
        if (shown[0]) parts.push('分数：' + L.frac);
        if (shown[1]) parts.push('百分数：' + L.pct);
        if (shown[2]) parts.push('角度：' + L.deg + '°');
        ct.textContent = parts.length ? parts.join('；') + '。' : '橙色扇形是圆的 ' + L.frac + '。';
      }
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：它是多少度？'); return; }
      var ok = guessed === L.ans;
      msg(L.frac + ' = ' + L.pct + ' = ' + L.deg + '°：' + L.pct.replace('%', '') + ' × 3.6° = ' + L.deg + '°。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '，其实是 ' + L.deg + '°。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function checkAll() {
      if (shown[0] && shown[1] && shown[2]) verdict();
    }
    function setLevel(i) {
      li = i; shown = [false, false, false]; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再三种说法都说出来。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜是 ' + LEVELS[li].opts[0] + '。三种说法都说出来验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜是 ' + LEVELS[li].opts[1] + '。三种说法都说出来验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜是 ' + LEVELS[li].opts[2] + '。三种说法都说出来验证。'); });
    gid(K + '-say-frac').addEventListener('click', function () { shown[0] = true; draw(); checkAll(); });
    gid(K + '-say-pct').addEventListener('click', function () { shown[1] = true; draw(); checkAll(); });
    gid(K + '-say-deg').addEventListener('click', function () { shown[2] = true; draw(); checkAll(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：1/4 = 25% = 90°', '提高：3/10 = 30% = 108°', '挑战：2/5 = 40% = 144°'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm67a-reverse',
  title: '读图反推',
  sub: '从角度或人数反推百分比：120° 的扇形占 33.3%，再验算各部分加起来是 100%。',
  grade: 6,
  kind: '模拟',
  points: ['6.7a'],
  render: function (el) {
    var K = 'm67a-reverse';
    var LEVELS = [
      { label: '基础', deg: 120, pct: '33.3%', total: 90, count: 30, others: '60 人是 66.7%，240°', opts: ['33.3%', '30%', '25%'], ans: 0 },
      { label: '提高', deg: 90, pct: '25%', total: 120, count: 30, others: '90 人是 75%，270°', opts: ['30%', '25%', '20%'], ans: 1 },
      { label: '挑战', deg: 144, pct: '40%', total: 200, count: 80, others: '120 人是 60%，216°', opts: ['36%', '40%', '45%'], ans: 1 }
    ];
    var li = 0, solved = false, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 扇形统计图</p>' +
      '<h3>读图反推</h3>' +
      '<p>扇形图也能倒着读：看到一个扇形的角度，反推它占百分之几、是多少人。</p>' +
      '<p>第 1 步 · 先猜：这个 <span id="' + K + '-q-tx"></span>的扇形占百分之几？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 反推：角度除以 360°，再乘总人数。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-solve" type="button">反推</button></div>' +
      '<div id="' + K + '-pie"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再反推。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 120°，共 90 人</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 90°，共 120 人</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 144°，共 200 人</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“角度除以 360° 就是百分比，再乘总人数就是人数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.deg + '°';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-pie');
      if (box) {
        var cx = 110, cy = 110, R = 85;
        var rad = L.deg * Math.PI / 180;
        var x2 = cx + R * Math.sin(rad), y2 = cy - R * Math.cos(rad);
        var s = '<svg width="220" height="220" viewBox="0 0 220 220">';
        s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="#f1f5f9" stroke="#1e293b" stroke-width="2"/>';
        s += '<path d="M ' + cx + ',' + cy + ' L ' + cx + ',' + (cy - R) + ' A ' + R + ',' + R + ' 0 0,1 ' + x2.toFixed(1) + ',' + y2.toFixed(1) + ' Z" fill="#fb923c" stroke="#1e293b" stroke-width="2"/>';
        s += '<text x="' + cx + '" y="' + (cy + 6) + '" text-anchor="middle" font-size="15" font-weight="bold">' + L.deg + '°</text>';
        s += '</svg>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = solved
        ? L.deg + '° ÷ 360° = ' + L.pct + '，' + L.total + ' × ' + L.pct + ' = ' + L.count + ' 人。验算：其余 ' + L.others + '，加起来是 100%。'
        : '橙色扇形是 ' + L.deg + '°，一共 ' + L.total + ' 人。';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：这个扇形占百分之几？'); return; }
      var ok = guessed === L.ans;
      msg(L.deg + '° 的扇形占 ' + L.pct + '，是 ' + L.count + ' 人。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '，反推出来是 ' + L.pct + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; solved = false; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再反推。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜占 ' + LEVELS[li].opts[0] + '。反推验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜占 ' + LEVELS[li].opts[1] + '。反推验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜占 ' + LEVELS[li].opts[2] + '。反推验证。'); });
    gid(K + '-solve').addEventListener('click', function () { solved = true; draw(); verdict(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：120° 占 33.3%，30 人', '提高：90° 占 25%，30 人', '挑战：144° 占 40%，80 人'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
/* 6.7b 数与形：L 形拼正方形已有 demo-lsquare（6.7b 点页主演示），跳过；叠盒/叠罐、差分表、代数配对没有，做这三个。 */
registerAnim({
  key: 'm67b-stack',
  title: '叠盒叠罐',
  sub: '叠一层是一层数：1、2、3、4……一层层加上去，累计总数就是三角数。',
  grade: 6,
  kind: '模拟',
  points: ['6.7b'],
  render: function (el) {
    var K = 'm67b-stack';
    var LEVELS = [
      { label: '基础', n: 4, total: 10, opts: ['10', '9', '12'], ans: 0 },
      { label: '提高', n: 5, total: 15, opts: ['14', '15', '16'], ans: 1 },
      { label: '挑战', n: 6, total: 21, opts: ['20', '22', '21'], ans: 2 }
    ];
    var li = 0, layers = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 数与形</p>' +
      '<h3>叠盒叠罐</h3>' +
      '<p>叠罐子：底层 1 个，上面每层多 1 个——层数和总数一起变，规律就藏在两列数里。</p>' +
      '<p>第 1 步 · 先猜：叠 <span id="' + K + '-q-tx"></span>层，一共几个罐子？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 叠一层：每点一下多叠一层，看总数怎么长。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-add" type="button">叠一层</button></div>' +
      '<div id="' + K + '-pyr"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再叠一层。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 叠 4 层</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 叠 5 层</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 叠 6 层</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“第几层就是几个，总数是 1 加到第几层”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function totalOf(n) { return n * (n + 1) / 2; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = String(L.n);
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-pyr');
      if (box) {
        var s = '';
        for (var row = 1; row <= layers; row++) {
          s += '<p style="margin:2px 0">';
          for (var c = 0; c < row; c++) s += '<span style="display:inline-block;width:26px;height:26px;line-height:26px;text-align:center;border:1px solid #1e293b;border-radius:50%;background:#fde68a;margin:1px"></span>';
          s += ' 第 ' + row + ' 层：' + row + ' 个</p>';
        }
        if (layers === 0) s = '<p>还没开始叠。</p>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) {
        if (layers === 0) ct.textContent = '底层 1 个，往上每层多 1 个。';
        else {
          var parts = [];
          for (var i = 1; i <= layers; i++) parts.push(String(i));
          ct.textContent = '叠了 ' + layers + ' 层：' + parts.join(' + ') + ' = ' + totalOf(layers) + ' 个。';
        }
      }
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：一共几个罐子？'); return; }
      var ok = guessed === L.ans;
      msg('叠 ' + L.n + ' 层一共 ' + L.total + ' 个。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + ' 个，叠出来是 ' + L.total + ' 个。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; layers = 0; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再叠一层。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜一共 ' + LEVELS[li].opts[0] + ' 个。叠一叠验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜一共 ' + LEVELS[li].opts[1] + ' 个。叠一叠验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜一共 ' + LEVELS[li].opts[2] + ' 个。叠一叠验证。'); });
    gid(K + '-add').addEventListener('click', function () {
      var L = LEVELS[li];
      if (layers < L.n) { layers++; draw(); }
      if (layers >= L.n) verdict();
      else msg('叠了 ' + layers + ' 层，继续。');
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：4 层一共 10 个', '提高：5 层一共 15 个', '挑战：6 层一共 21 个'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm67b-diff',
  title: '差分表',
  sub: '把一列数的相邻差列成表：差本身就是一列数，规律从差里看出来。',
  grade: 6,
  kind: '模拟',
  points: ['6.7b'],
  render: function (el) {
    var K = 'm67b-diff';
    var LEVELS = [
      { label: '基础', seq: [1, 4, 9, 16], diffs: [3, 5, 7], next: 25, nextDiff: 9, opts: ['25', '20', '30'], ans: 0 },
      { label: '提高', seq: [1, 3, 6, 10, 15], diffs: [2, 3, 4, 5], next: 21, nextDiff: 6, opts: ['20', '21', '18'], ans: 1 },
      { label: '挑战', seq: [2, 6, 12, 20], diffs: [4, 6, 8], next: 30, nextDiff: 10, opts: ['28', '30', '32'], ans: 1 }
    ];
    var li = 0, listed = false, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 数与形</p>' +
      '<h3>差分表</h3>' +
      '<p>一列数看不出规律，就看它的“差”：相邻两个数差多少，列成表，差的规律就是数的规律。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span>下一个数是多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 列差分表：先算相邻的差，再看差的规律。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-list" type="button">列差分表</button></div>' +
      '<div id="' + K + '-table"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再列差分表。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 1，4，9，16</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 1，3，6，10，15</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 2，6，12，20</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“差的规律，就是数的规律”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.seq.join('，') + '，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-table');
      if (box) {
        var s = '<p>数：' + L.seq.join('，') + '，？</p>';
        if (listed) s += '<p>差：' + L.diffs.join('，') + '，下一个差是 ' + L.nextDiff + '。</p>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = listed
        ? '差是 ' + L.diffs.join('、') + '，每次多 2，下一个差是 ' + L.nextDiff + '：' + L.seq[L.seq.length - 1] + ' + ' + L.nextDiff + ' = ' + L.next + '。'
        : '先看数，再看差。';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：下一个数是多少？'); return; }
      var ok = guessed === L.ans;
      msg('下一个数是 ' + L.next + '：差是 ' + L.diffs.join('、') + '，下一个差 ' + L.nextDiff + '。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '，差分表算出来是 ' + L.next + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; listed = false; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再列差分表。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜下一个是 ' + LEVELS[li].opts[0] + '。列差分表验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜下一个是 ' + LEVELS[li].opts[1] + '。列差分表验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜下一个是 ' + LEVELS[li].opts[2] + '。列差分表验证。'); });
    gid(K + '-list').addEventListener('click', function () { listed = true; draw(); verdict(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：1，4，9，16，下一个 25', '提高：1，3，6，10，15，下一个 21', '挑战：2，6，12，20，下一个 30'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm67b-algebra',
  title: '代数配对',
  sub: '(n+1)² = n² + 2n + 1：多出来的 2n+1 正好是第 n+1 个奇数，图形与代数互相印证。',
  grade: 6,
  kind: '演示',
  points: ['6.7b'],
  render: function (el) {
    var K = 'm67b-algebra';
    var LEVELS = [
      { label: '基础', n: 3, odd: 7, next: 16, opts: ['7', '5', '9'], ans: 0 },
      { label: '提高', n: 4, odd: 9, next: 25, opts: ['7', '9', '11'], ans: 1 },
      { label: '挑战', n: 5, odd: 11, next: 36, opts: ['9', '11', '13'], ans: 1 }
    ];
    var li = 0, wrapped = false, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 6 年级 · 数与形</p>' +
      '<h3>代数配对</h3>' +
      '<p>正方形变大一号，多出来的正好是一个 L 形：L 形有几块，代数式里就多几。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span>的正方形包一层，多出来的 L 形有几块？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 包一层：给正方形包上 L 形，再看代数式。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-wrap" type="button">包一层</button></div>' +
      '<div id="' + K + '-square"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再包一层。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 3×3 包一层</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 4×4 包一层</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 5×5 包一层</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“(n+1)² = n² + 2n + 1，多出来的就是第 n+1 个奇数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.n + '×' + L.n;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-square');
      if (box) {
        var m = L.n + 1, cs = 34, s = '<svg width="' + (m * cs + 4) + '" height="' + (m * cs + 4) + '" viewBox="0 0 ' + (m * cs + 4) + ' ' + (m * cs + 4) + '">';
        for (var r = 0; r < m; r++) {
          for (var c = 0; c < m; c++) {
            var inOld = r < L.n && c < L.n;
            var inL = (r === L.n || c === L.n);
            var fill = '#ffffff';
            if (inOld) fill = '#93c5fd';
            else if (wrapped && inL) fill = '#fb923c';
            else if (!wrapped && inL) fill = '#f1f5f9';
            s += '<rect x="' + (2 + c * cs) + '" y="' + (2 + r * cs) + '" width="' + (cs - 2) + '" height="' + (cs - 2) + '" fill="' + fill + '" stroke="#1e293b" stroke-width="1"/>';
          }
        }
        s += '</svg>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = wrapped
        ? (L.n + 1) + '² = ' + L.n + '² + ' + L.odd + ' = ' + (L.n * L.n) + ' + ' + L.odd + ' = ' + L.next + '：多出来的 L 形正好 ' + L.odd + ' 块，是第 ' + (L.n + 1) + ' 个奇数。'
        : L.n + '×' + L.n + ' = ' + (L.n * L.n) + '。包一层变成 ' + (L.n + 1) + '×' + (L.n + 1) + '，多出几块？';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：多出来的 L 形有几块？'); return; }
      var ok = guessed === L.ans;
      msg('多出来 ' + L.odd + ' 块：' + (L.n + 1) + '² = ' + L.n + '² + ' + L.odd + ' = ' + L.next + '。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + ' 块，包出来是 ' + L.odd + ' 块。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; wrapped = false; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再包一层。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜多出来 ' + LEVELS[li].opts[0] + ' 块。包一层验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜多出来 ' + LEVELS[li].opts[1] + ' 块。包一层验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜多出来 ' + LEVELS[li].opts[2] + ' 块。包一层验证。'); });
    gid(K + '-wrap').addEventListener('click', function () { wrapped = true; draw(); verdict(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：4² = 3² + 7 = 16', '提高：5² = 4² + 9 = 25', '挑战：6² = 5² + 11 = 36'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
/* 6.8 负数：竖直温度计已有 demo-thermo（6.8 点页主演示），跳过；横数轴与从 0 出发走步子已有 demo-numline（7.1、7.2 点页，标一标与走一走两个模式），6.8 点页看不到，跳过并报给协调人决定是否补挂；生活情境没有，做这一个。 */
registerAnim({
  key: 'm68-life',
  title: '生活里的负数',
  sub: '欠的钱、比海平面低的地方、地下的楼层，都是“从 0 往反方向”的量：同一条数轴，三种皮肤。',
  grade: 6,
  kind: '模拟',
  points: ['6.8'],
  render: function (el) {
    var K = 'm68-life';
    var LEVELS = [
      { label: '基础', scene: '欠债', a: '小明欠 5 元', av: -5, b: '小红欠 2 元', bv: -2, cmp: '−5 ＜ −2', verdict: '欠 5 元更多', opts: ['欠 5 元更多', '欠 2 元更多', '一样多'], ans: 0 },
      { label: '提高', scene: '海拔', a: '甲地海拔 −100 米', av: -100, b: '乙地海拔 −50 米', bv: -50, cmp: '−100 ＜ −50', verdict: '−100 米更低', opts: ['−50 米更低', '−100 米更低', '一样低'], ans: 1 },
      { label: '挑战', scene: '楼层', a: '地下 3 层', av: -3, b: '地下 1 层', bv: -1, cmp: '−3 ＜ −1', verdict: '地下 3 层更低', opts: ['地下 1 层更低', '一样低', '地下 3 层更低'], ans: 2 }
    ];
    var li = 0, compared = false, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 负数</p>' +
      '<h3>生活里的负数</h3>' +
      '<p>负数不是课本里的符号：欠的钱、海平面以下、地下楼层，都是从 0 往反方向走的量。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span>哪个更小？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 比一比：把两个数放到同一条竖直数轴上，看谁在下面。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-compare" type="button">比一比</button></div>' +
      '<div id="' + K + '-line"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再比一比。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 欠债</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 海拔</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 楼层</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“在 0 下面越远，数越小”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function fmt(n) { return n < 0 ? '−' + (-n) : String(n); }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.a + '和' + L.b + '，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-line');
      if (box) {
        var lo = Math.min(L.av, L.bv) - 2, hi = 2;
        var H = 220, W = 200;
        function Y(v) { return 20 + (hi - v) / (hi - lo) * (H - 40); }
        var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">';
        s += '<line x1="80" y1="10" x2="80" y2="' + (H - 10) + '" stroke="#1e293b" stroke-width="2"/>';
        s += '<line x1="70" y1="' + Y(0).toFixed(1) + '" x2="90" y2="' + Y(0).toFixed(1) + '" stroke="#dc2626" stroke-width="3"/>';
        s += '<text x="100" y="' + (Y(0) + 4).toFixed(1) + '" font-size="13">0（不欠 / 海平面 / 地面）</text>';
        if (compared) {
          s += '<circle cx="80" cy="' + Y(L.av).toFixed(1) + '" r="8" fill="#2563eb"/>';
          s += '<text x="100" y="' + (Y(L.av) + 4).toFixed(1) + '" font-size="13" fill="#2563eb">' + L.a + '（' + fmt(L.av) + '）</text>';
          s += '<circle cx="80" cy="' + Y(L.bv).toFixed(1) + '" r="8" fill="#f97316"/>';
          s += '<text x="100" y="' + (Y(L.bv) + 4).toFixed(1) + '" font-size="13" fill="#ea580c">' + L.b + '（' + fmt(L.bv) + '）</text>';
        }
        s += '</svg>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = compared
        ? fmt(L.av) + ' 在 ' + fmt(L.bv) + ' 下面，所以 ' + L.cmp + '：' + L.verdict + '。'
        : '把两个数放到竖直数轴上，谁在下面，谁就更小。';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：哪个更小？'); return; }
      var ok = guessed === L.ans;
      msg(L.cmp + '：' + L.verdict + '。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '，比出来是' + L.verdict + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; compared = false; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再比一比。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜' + LEVELS[li].opts[0] + '。比一比验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜' + LEVELS[li].opts[1] + '。比一比验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜' + LEVELS[li].opts[2] + '。比一比验证。'); });
    gid(K + '-compare').addEventListener('click', function () { compared = true; draw(); verdict(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：欠 5 元比欠 2 元多', '提高：−100 米比 −50 米低', '挑战：地下 3 层比地下 1 层低'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
/* 6.11 圆柱与圆锥：倒沙实验已有 demo-cylinder（6.11 点页主演示，3 锥倒满 1 柱），跳过；展开标签在 cylinder 里只有一行文字，没有撕开铺平的动作，叠层体积与旋转成体没有，做这三个。 */
registerAnim({
  key: 'm611-unfold',
  title: '展开标签',
  sub: '把圆柱侧面撕下来铺平，就是一个长方形：长是底面周长，宽是高。',
  grade: 6,
  kind: '模拟',
  points: ['6.11'],
  render: function (el) {
    var K = 'm611-unfold';
    var LEVELS = [
      { label: '基础', r: 3, h: 4, circ: '18.84', area: '75.36', opts: ['18.84', '6', '3'], ans: 0 },
      { label: '提高', r: 2, h: 5, circ: '12.56', area: '62.8', opts: ['4', '12.56', '10'], ans: 1 },
      { label: '挑战', r: 5, h: 3, circ: '31.4', area: '94.2', opts: ['10', '31.4', '15'], ans: 1 }
    ];
    var li = 0, peeled = false, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 圆柱与圆锥</p>' +
      '<h3>展开标签</h3>' +
      '<p>圆柱侧面像一张标签：撕下来铺平，就是一个长方形——长和宽各是多少？</p>' +
      '<p>第 1 步 · 先猜：底面半径 <span id="' + K + '-q-tx"></span>，展开的长方形长多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 撕开铺平：看长方形长多少、宽多少。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-peel" type="button">撕开铺平</button></div>' +
      '<div id="' + K + '-shape"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再撕开铺平。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 半径 3，高 4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 半径 2，高 5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 半径 5，高 3</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“展开的长是底面周长，宽是高，侧面积就是周长乘高”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.r + ' 厘米、高 ' + L.h + ' 厘米，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-shape');
      if (box) {
        var s = '';
        if (!peeled) {
          s = '<svg width="260" height="180" viewBox="0 0 260 180">';
          s += '<rect x="90" y="50" width="100" height="100" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>';
          s += '<ellipse cx="140" cy="50" rx="50" ry="16" fill="#bfdbfe" stroke="#2563eb" stroke-width="2"/>';
          s += '<ellipse cx="140" cy="150" rx="50" ry="16" fill="#bfdbfe" stroke="#2563eb" stroke-width="2"/>';
          s += '<text x="140" y="105" text-anchor="middle" font-size="13">侧面</text>';
          s += '</svg>';
        } else {
          var w = Math.round(parseFloat(L.circ) * 8), h = L.h * 14;
          s = '<svg width="' + (w + 80) + '" height="' + (h + 60) + '" viewBox="0 0 ' + (w + 80) + ' ' + (h + 60) + '">';
          s += '<rect x="10" y="10" width="' + w + '" height="' + h + '" fill="#fde68a" stroke="#b45309" stroke-width="2"/>';
          s += '<text x="' + (10 + w / 2) + '" y="6" text-anchor="middle" font-size="13">长 = 底面周长 ' + L.circ + ' 厘米</text>';
          s += '<text x="' + (w + 16) + '" y="' + (16 + h / 2) + '" font-size="13">宽 ' + L.h + '</text>';
          s += '</svg>';
        }
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = peeled
        ? '展开是长方形：长是底面周长 2 × 3.14 × ' + L.r + ' = ' + L.circ + ' 厘米，宽是高 ' + L.h + ' 厘米，侧面积 = ' + L.circ + ' × ' + L.h + ' = ' + L.area + ' 平方厘米。'
        : '圆柱的侧面是一张卷着的标签，撕下来是什么形状？';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：展开的长方形长多少？'); return; }
      var ok = guessed === L.ans;
      msg('长是底面周长 ' + L.circ + ' 厘米，侧面积 ' + L.area + ' 平方厘米。' + (ok ? '你猜对了！' : '你猜长是 ' + L.opts[guessed] + '，撕开是 ' + L.circ + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; peeled = false; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再撕开铺平。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜长是 ' + LEVELS[li].opts[0] + '。撕开验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜长是 ' + LEVELS[li].opts[1] + '。撕开验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜长是 ' + LEVELS[li].opts[2] + '。撕开验证。'); });
    gid(K + '-peel').addEventListener('click', function () { peeled = true; draw(); verdict(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：半径 3，侧面积 75.36', '提高：半径 2，侧面积 62.8', '挑战：半径 5，侧面积 94.2'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm611-layers',
  title: '叠层体积',
  sub: '体积是底面一层有多少、叠了几层：圆柱的体积 = 底面积 × 高，和长方体同理。',
  grade: 6,
  kind: '模拟',
  points: ['6.11'],
  render: function (el) {
    var K = 'm611-layers';
    var LEVELS = [
      { label: '基础', r: 2, h: 5, base: '12.56', vol: '62.8', opts: ['62.8', '12.56', '31.4'], ans: 0 },
      { label: '提高', r: 3, h: 4, base: '28.26', vol: '113.04', opts: ['28.26', '113.04', '84.78'], ans: 1 },
      { label: '挑战', r: 4, h: 3, base: '50.24', vol: '150.72', opts: ['50.24', '100.48', '150.72'], ans: 2 }
    ];
    var li = 0, layers = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 圆柱与圆锥</p>' +
      '<h3>叠层体积</h3>' +
      '<p>圆柱是一层一层圆片叠出来的：底面一层有多少，叠了几层，体积就是多少。</p>' +
      '<p>第 1 步 · 先猜：底面积 <span id="' + K + '-q-tx"></span>，体积是多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 叠一层：每叠一层，体积多一个底面积。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-add" type="button">叠一层</button></div>' +
      '<div id="' + K + '-stack"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再叠一层。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 半径 2，高 5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 半径 3，高 4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 半径 4，高 3</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“体积 = 底面积 × 高，一层一层叠出来的”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.base + '，高 ' + L.h + '，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-stack');
      if (box) {
        var H = 150, s = '<svg width="220" height="' + H + '" viewBox="0 0 220 ' + H + '">';
        for (var i = 0; i < layers; i++) {
          var y = H - 24 - i * 20;
          s += '<ellipse cx="110" cy="' + y + '" rx="70" ry="13" fill="#bfdbfe" stroke="#2563eb" stroke-width="2"/>';
        }
        if (layers === 0) s += '<text x="110" y="75" text-anchor="middle" font-size="13">还没开始叠</text>';
        s += '</svg>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = layers === 0 ? '底面积是 ' + L.base + '，一层就是 ' + L.base + '。'
        : '叠了 ' + layers + ' 层：' + L.base + ' × ' + layers + ' = ' + String(Math.round(parseFloat(L.base) * layers * 100) / 100) + '。';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：体积是多少？'); return; }
      var ok = guessed === L.ans;
      msg('体积 = ' + L.base + ' × ' + L.h + ' = ' + L.vol + ' 立方厘米。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '，叠出来是 ' + L.vol + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; layers = 0; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再叠一层。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜体积是 ' + LEVELS[li].opts[0] + '。叠一叠验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜体积是 ' + LEVELS[li].opts[1] + '。叠一叠验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜体积是 ' + LEVELS[li].opts[2] + '。叠一叠验证。'); });
    gid(K + '-add').addEventListener('click', function () {
      var L = LEVELS[li];
      if (layers < L.h) { layers++; draw(); }
      if (layers >= L.h) verdict();
      else msg('叠了 ' + layers + ' 层，继续。');
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：底面积 12.56 × 5 = 62.8', '提高：底面积 28.26 × 4 = 113.04', '挑战：底面积 50.24 × 3 = 150.72'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm611-spin',
  title: '旋转成体',
  sub: '长方形绕一边旋转成圆柱，直角三角形绕直角边旋转成圆锥：平面图形转出立体。',
  grade: 6,
  kind: '模拟',
  points: ['6.11'],
  render: function (el) {
    var K = 'm611-spin';
    var LEVELS = [
      { label: '基础', shape: '长方形 3×4', axis: '绕长边转', solid: '圆柱', r: 3, h: 4, vol: '113.04', opts: ['圆柱', '圆锥', '长方体'], ans: 0 },
      { label: '提高', shape: '直角三角形 3-4', axis: '绕直角边 4 转', solid: '圆锥', r: 3, h: 4, vol: '37.68', opts: ['圆柱', '圆锥', '球'], ans: 1 },
      { label: '挑战', shape: '长方形 2×5', axis: '绕短边转', solid: '圆柱', r: 5, h: 2, vol: '157', opts: ['圆锥', '圆柱', '球'], ans: 1 }
    ];
    var li = 0, spun = false, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 圆柱与圆锥</p>' +
      '<h3>旋转成体</h3>' +
      '<p>平面图形绕一条边转一圈，就转出一个立体：转出来的是什么，半径和高各是多少？</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span>转出来是什么立体图形？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 转一转：绕着虚线轴转一圈，看立体长什么样。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-spin" type="button">转一转</button></div>' +
      '<div id="' + K + '-shape"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再转一转。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 长方形 3×4 绕长边</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 直角三角形绕直角边</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 长方形 2×5 绕短边</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“转出来的立体，半径就是转的那个边”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.shape + ' ' + L.axis + '，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-shape');
      if (box) {
        var s = '<svg width="420" height="170" viewBox="0 0 420 170">';
        if (li === 1) {
          s += '<polygon points="60,30 60,140 150,140" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>';
          s += '<line x1="60" y1="20" x2="60" y2="150" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,4"/>';
          s += '<text x="60" y="165" text-anchor="middle" font-size="12">轴</text>';
        } else {
          var w = li === 0 ? 90 : 60, h = li === 0 ? 120 : 150;
          s += '<rect x="60" y="' + (155 - h) + '" width="' + w + '" height="' + h + '" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>';
          s += '<line x1="60" y1="20" x2="60" y2="160" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,4"/>';
          s += '<text x="60" y="168" text-anchor="middle" font-size="12">轴</text>';
        }
        if (spun) {
          if (li === 1) {
            s += '<polygon points="270,30 270,140 360,140" fill="#fde68a" stroke="#b45309" stroke-width="2"/>';
            s += '<ellipse cx="315" cy="140" rx="45" ry="12" fill="#fde68a" stroke="#b45309" stroke-width="2"/>';
            s += '<text x="315" y="80" text-anchor="middle" font-size="13">圆锥</text>';
          } else {
            var rx = li === 0 ? 45 : 75;
            s += '<rect x="' + (315 - rx) + '" y="40" width="' + (rx * 2) + '" height="100" fill="#fde68a" stroke="#b45309" stroke-width="2"/>';
            s += '<ellipse cx="315" cy="40" rx="' + rx + '" ry="12" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>';
            s += '<ellipse cx="315" cy="140" rx="' + rx + '" ry="12" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>';
            s += '<text x="315" y="95" text-anchor="middle" font-size="13">圆柱</text>';
          }
        }
        s += '</svg>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = spun
        ? '转出来是' + L.solid + '：半径 ' + L.r + '，高 ' + L.h + '，体积 ' + L.vol + ' 立方厘米。'
        : L.shape + '，' + L.axis + '。转一圈会是什么？';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：转出来是什么立体图形？'); return; }
      var ok = guessed === L.ans;
      msg('转出来是' + L.solid + '，半径 ' + L.r + '，高 ' + L.h + '。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '，转出来是' + L.solid + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; spun = false; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再转一转。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜转出来是' + LEVELS[li].opts[0] + '。转一转验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜转出来是' + LEVELS[li].opts[1] + '。转一转验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜转出来是' + LEVELS[li].opts[2] + '。转一转验证。'); });
    gid(K + '-spin').addEventListener('click', function () { spun = true; draw(); verdict(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：长方形绕长边转出圆柱', '提高：直角三角形绕直角边转出圆锥', '挑战：长方形绕短边转出圆柱'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
/* 6.12 比例：主演示 function 是 y=kx+b 的通用函数滑杆，没有双数轴、没有描点成线与反比例对比、没有定积长方形、没有比例尺地图，做这四个。 */
registerAnim({
  key: 'm612-axis',
  title: '双数轴看正比例',
  sub: '正比例是两行数同步伸长：x 变大一倍，y 也变大一倍，比值永远是同一个数。',
  grade: 6,
  kind: '模拟',
  points: ['6.12'],
  render: function (el) {
    var K = 'm612-axis';
    var LEVELS = [
      { label: '基础', xs: [0, 1, 2, 3, 4], ys: [0, 5, 10, 15, 20], xu: '千克', yu: '元', rate: '5 元/千克', target: 4, tq: '买 4 千克多少钱？', opts: ['20 元', '15 元', '25 元'], ans: 0 },
      { label: '提高', xs: [0, 1, 2, 3, 4, 5], ys: [0, 80, 160, 240, 320, 400], xu: '分钟', yu: '米', rate: '80 米/分钟', target: 5, tq: '5 分钟走多远？', opts: ['300 米', '400 米', '500 米'], ans: 1 },
      { label: '挑战', xs: [0, 3, 6, 9], ys: [0, 12, 24, 36], xu: '本', yu: '元', rate: '4 元/本', target: 3, tq: '9 本书多少钱？', opts: ['24 元', '36 元', '27 元'], ans: 1 }
    ];
    var li = 0, pos = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 比例</p>' +
      '<h3>双数轴看正比例</h3>' +
      '<p>正比例的两行数是同步伸长的：上面走一步，下面也走一步，比值永远不变。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 走一走：上下两行一起走，走到目标停下，对一下。</p>' +
      '<div class="btn-row"><button class="btn small ghost" id="' + K + '-minus" type="button">− 一步</button>' +
      '<button class="btn small ghost" id="' + K + '-plus" type="button">＋ 一步</button>' +
      '<button class="btn small primary" id="' + K + '-check" type="button">对一下这一档</button></div>' +
      '<div id="' + K + '-axis"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再走一走。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 苹果 5 元/千克</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 走路 80 米/分钟</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 书 4 元/本</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“x 变大一倍，y 也变大一倍，比值不变”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li], n = L.xs.length - 1;
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.tq;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-axis');
      if (box) {
        var W = 560, s = '<svg width="' + W + '" height="120" viewBox="0 0 ' + W + ' 120">';
        function X(i) { return 50 + i / n * 470; }
        s += '<text x="4" y="38" font-size="13">' + L.xu + '</text>';
        s += '<line x1="50" y1="34" x2="520" y2="34" stroke="#1e293b" stroke-width="2"/>';
        s += '<text x="4" y="88" font-size="13">' + L.yu + '</text>';
        s += '<line x1="50" y1="84" x2="520" y2="84" stroke="#1e293b" stroke-width="2"/>';
        for (var i = 0; i <= n; i++) {
          var x = X(i);
          s += '<line x1="' + x.toFixed(1) + '" y1="28" x2="' + x.toFixed(1) + '" y2="40" stroke="#1e293b" stroke-width="2"/>';
          s += '<text x="' + x.toFixed(1) + '" y="22" text-anchor="middle" font-size="12">' + L.xs[i] + '</text>';
          s += '<line x1="' + x.toFixed(1) + '" y1="78" x2="' + x.toFixed(1) + '" y2="90" stroke="#1e293b" stroke-width="2"/>';
          s += '<text x="' + x.toFixed(1) + '" y="108" text-anchor="middle" font-size="12">' + L.ys[i] + '</text>';
        }
        var mx = X(pos);
        s += '<line x1="' + mx.toFixed(1) + '" y1="14" x2="' + mx.toFixed(1) + '" y2="96" stroke="#dc2626" stroke-width="2" stroke-dasharray="4,3"/>';
        s += '<circle cx="' + mx.toFixed(1) + '" cy="34" r="7" fill="#dc2626"/>';
        s += '<circle cx="' + mx.toFixed(1) + '" cy="84" r="7" fill="#dc2626"/>';
        s += '</svg>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = L.xs[pos] + L.xu + ' ↔ ' + L.ys[pos] + L.yu + '，比值是 ' + L.rate + '。';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜。'); return; }
      if (pos !== L.target) { msg('先走到目标再对：现在是 ' + L.xs[pos] + L.xu + '。'); return; }
      var ok = guessed === L.ans;
      msg(L.xs[pos] + L.xu + '是 ' + L.ys[pos] + L.yu + '。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '，走出来是 ' + L.ys[pos] + L.yu + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; pos = 0; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再走一走。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜是 ' + LEVELS[li].opts[0] + '。走一走验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜是 ' + LEVELS[li].opts[1] + '。走一走验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜是 ' + LEVELS[li].opts[2] + '。走一走验证。'); });
    gid(K + '-minus').addEventListener('click', function () { if (pos > 0) pos--; draw(); });
    gid(K + '-plus').addEventListener('click', function () { var L = LEVELS[li]; if (pos < L.xs.length - 1) pos++; draw(); });
    gid(K + '-check').addEventListener('click', function () { verdict(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：4 千克苹果 20 元', '提高：5 分钟走 400 米', '挑战：9 本书 36 元'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm612-graph',
  title: '正比例是过原点的直线',
  sub: '把比例表上的点描到坐标系里：正比例连成过原点的直线，反比例连不成直线。',
  grade: 6,
  kind: '模拟',
  points: ['6.12'],
  render: function (el) {
    var K = 'm612-graph';
    var LEVELS = [
      { label: '基础', kind: '正比例', pts: [[1, 2], [2, 4], [3, 6]], xmax: 4, ymax: 8, line: 'y = 2x', opts: ['过原点的直线', '弯的曲线', '折线'], ans: 0 },
      { label: '提高', kind: '反比例', pts: [[1, 12], [2, 6], [3, 4], [4, 3], [6, 2]], xmax: 7, ymax: 13, line: 'xy = 12', opts: ['过原点的直线', '弯的曲线', '折线'], ans: 1 },
      { label: '挑战', kind: '正比例', pts: [[1, 3], [2, 6], [3, 9], [4, 12]], xmax: 5, ymax: 13, line: 'y = 3x', opts: ['过原点，是正比例', '不过原点', '点连不成线'], ans: 0 }
    ];
    var li = 0, plotted = 0, linked = false, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 比例</p>' +
      '<h3>正比例是过原点的直线</h3>' +
      '<p>把比例表上的点一个一个描到坐标系里，再连起来：是直线还是曲线，一眼就看出来。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span>点连起来是什么？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 描点，再连起来：每点一下描一个点，描完连线。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-plot" type="button">描一个点</button>' +
      '<button class="btn small primary" id="' + K + '-link" type="button">连起来</button></div>' +
      '<div id="' + K + '-graph"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再描一个点。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · y = 2x</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · xy = 12</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · y = 3x</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“正比例的点在过原点的直线上，反比例的点连成曲线”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.kind + ' ' + L.line + '，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-graph');
      if (box) {
        var W = 320, H = 300;
        function X(v) { return 40 + v / L.xmax * 260; }
        function Y(v) { return H - 30 - v / L.ymax * 240; }
        var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">';
        s += '<line x1="40" y1="' + (H - 30) + '" x2="' + (W - 10) + '" y2="' + (H - 30) + '" stroke="#1e293b" stroke-width="2"/>';
        s += '<line x1="40" y1="10" x2="40" y2="' + (H - 30) + '" stroke="#1e293b" stroke-width="2"/>';
        s += '<text x="' + (W - 14) + '" y="' + (H - 36) + '" font-size="13">x</text>';
        s += '<text x="46" y="22" font-size="13">y</text>';
        for (var i = 0; i < plotted; i++) {
          var p = L.pts[i];
          s += '<circle cx="' + X(p[0]).toFixed(1) + '" cy="' + Y(p[1]).toFixed(1) + '" r="6" fill="#2563eb"/>';
          s += '<text x="' + (X(p[0]) + 9).toFixed(1) + '" y="' + (Y(p[1]) - 6).toFixed(1) + '" font-size="12">(' + p[0] + ',' + p[1] + ')</text>';
        }
        if (linked && plotted >= 2) {
          var d = '';
          for (var j = 0; j < plotted; j++) {
            var pp = L.pts[j];
            d += (j === 0 ? 'M ' : ' L ') + X(pp[0]).toFixed(1) + ' ' + Y(pp[1]).toFixed(1);
          }
          if (L.kind === '正比例') {
            var p0 = L.pts[0], p1 = L.pts[plotted - 1];
            s += '<line x1="' + X(0).toFixed(1) + '" y1="' + Y(0).toFixed(1) + '" x2="' + X(p1[0]).toFixed(1) + '" y2="' + Y(p1[1]).toFixed(1) + '" stroke="#dc2626" stroke-width="3"/>';
          } else {
            s += '<path d="' + d + '" fill="none" stroke="#dc2626" stroke-width="3"/>';
          }
        }
        s += '</svg>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = linked
        ? L.kind + ' ' + L.line + '：点连起来是' + (L.kind === '正比例' ? '过原点的直线' : '一条弯的曲线，不是直线') + '。'
        : '描了 ' + plotted + ' 个点，一共 ' + L.pts.length + ' 个。';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：点连起来是什么？'); return; }
      var ok = guessed === L.ans;
      msg(L.kind + ' ' + L.line + '的点连起来是' + L.opts[L.ans] + '。' + (ok ? '你猜对了！' : '你猜的是' + L.opts[guessed] + '，连出来是' + L.opts[L.ans] + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; plotted = 0; linked = false; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再描一个点。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜连起来是' + LEVELS[li].opts[0] + '。描点验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜连起来是' + LEVELS[li].opts[1] + '。描点验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜连起来是' + LEVELS[li].opts[2] + '。描点验证。'); });
    gid(K + '-plot').addEventListener('click', function () {
      var L = LEVELS[li];
      if (plotted < L.pts.length) { plotted++; draw(); }
      if (plotted >= L.pts.length) msg('点描完了，点“连起来”。');
    });
    gid(K + '-link').addEventListener('click', function () {
      var L = LEVELS[li];
      if (plotted < L.pts.length) { msg('先把点描完：还差 ' + (L.pts.length - plotted) + ' 个。'); return; }
      linked = true; draw(); verdict();
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：y = 2x 的点在过原点的直线上', '提高：xy = 12 的点连成曲线', '挑战：y = 3x 的点在过原点的直线上'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm612-rect',
  title: '定积长方形',
  sub: '长方形面积固定，长变宽就变，乘积永远是同一个数：这就是反比例。',
  grade: 6,
  kind: '模拟',
  points: ['6.12'],
  render: function (el) {
    var K = 'm612-rect';
    var LEVELS = [
      { label: '基础', area: 24, lens: [6, 8, 12], target: 1, tq: '长变 8，宽是多少？', opts: ['3', '4', '2'], ans: 0 },
      { label: '提高', area: 36, lens: [9, 6, 12], target: 2, tq: '长变 12，宽是多少？', opts: ['4', '3', '6'], ans: 1 },
      { label: '挑战', area: 20, lens: [5, 4, 10], target: 2, tq: '长变 10，宽是多少？', opts: ['4', '5', '2'], ans: 2 }
    ];
    var li = 0, chosen = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 比例</p>' +
      '<h3>定积长方形</h3>' +
      '<p>面积不变的长方形：长拉长，宽就缩短——长和宽的乘积永远是同一个数。</p>' +
      '<p>第 1 步 · 先猜：面积 <span id="' + K + '-q-tx"></span>，<span id="' + K + '-tq-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 拉一拉：改长，看宽跟着怎么变，乘积变没变。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-len-0" type="button"></button>' +
      '<button class="btn small ghost" id="' + K + '-len-1" type="button"></button>' +
      '<button class="btn small ghost" id="' + K + '-len-2" type="button"></button></div>' +
      '<div id="' + K + '-rect"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拉一拉。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 面积 24</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 面积 36</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 面积 20</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“长变宽就变，乘积永远是面积”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function widthOf(L, len) { return L.area / len; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = String(L.area) + '，';
      var tq = gid(K + '-tq-tx'); if (tq) tq.textContent = L.tq;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
        var lb = gid(K + '-len-' + k);
        if (lb) { lb.textContent = '长 ' + L.lens[k]; lb.setAttribute('aria-pressed', String(k === chosen)); }
      }
      var box = gid(K + '-rect');
      if (box) {
        var len = L.lens[chosen], w = widthOf(L, len);
        var rw = len * 18, rh = w * 18;
        var s = '<svg width="300" height="160" viewBox="0 0 300 160">';
        s += '<rect x="20" y="20" width="' + rw + '" height="' + rh + '" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>';
        s += '<text x="' + (20 + rw / 2) + '" y="12" text-anchor="middle" font-size="13">长 ' + len + '</text>';
        s += '<text x="' + (30 + rw) + '" y="' + (26 + rh / 2) + '" font-size="13">宽 ' + w + '</text>';
        s += '</svg>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) {
        var len = L.lens[chosen], w = widthOf(L, len);
        ct.textContent = '长 ' + len + ' × 宽 ' + w + ' = ' + L.area + '：面积没变。';
      }
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：宽是多少？'); return; }
      if (chosen !== L.target) { msg('先拉到目标长度再对：现在长是 ' + L.lens[chosen] + '。'); return; }
      var ok = guessed === L.ans;
      var w = widthOf(L, L.lens[L.target]);
      msg('长 ' + L.lens[L.target] + '，宽是 ' + w + '：' + L.lens[L.target] + ' × ' + w + ' = ' + L.area + '。' + (ok ? '你猜对了！' : '你猜宽是 ' + L.opts[guessed] + '，拉出来是 ' + w + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; chosen = 0; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再拉一拉。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜宽是 ' + LEVELS[li].opts[0] + '。拉一拉验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜宽是 ' + LEVELS[li].opts[1] + '。拉一拉验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜宽是 ' + LEVELS[li].opts[2] + '。拉一拉验证。'); });
    gid(K + '-len-0').addEventListener('click', function () { chosen = 0; draw(); verdict(); });
    gid(K + '-len-1').addEventListener('click', function () { chosen = 1; draw(); verdict(); });
    gid(K + '-len-2').addEventListener('click', function () { chosen = 2; draw(); verdict(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：面积 24，长 8 宽 3', '提高：面积 36，长 12 宽 3', '挑战：面积 20，长 10 宽 2'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm612-scale',
  title: '比例尺地图',
  sub: '图上距离 : 实际距离 = 比例尺：图上 1 厘米 = 实际 100 米，单位换算要对齐。',
  grade: 6,
  kind: '模拟',
  points: ['6.12'],
  render: function (el) {
    var K = 'm612-scale';
    var LEVELS = [
      { label: '基础', scale: '1:100000', perCm: '1 千米', dists: [1, 2, 3], target: 2, actual: '3 千米', opts: ['3 千米', '300 米', '30 千米'], ans: 0 },
      { label: '提高', scale: '1:50000', perCm: '500 米', dists: [2, 4, 6], target: 1, actual: '2 千米', opts: ['200 米', '2 千米', '20 千米'], ans: 1 },
      { label: '挑战', scale: '1:200000', perCm: '2 千米', dists: [1, 2.5, 5], target: 1, actual: '5 千米', opts: ['500 米', '50 千米', '5 千米'], ans: 2 }
    ];
    var li = 0, chosen = -1, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 比例</p>' +
      '<h3>比例尺地图</h3>' +
      '<p>地图上的 1 厘米，实际是多少？先看比例尺：图上 1 厘米 = 实际多少，量一量就知道。</p>' +
      '<p>第 1 步 · 先猜：比例尺 <span id="' + K + '-q-tx"></span>，图上 <span id="' + K + '-qd-tx"></span>，实际距离是多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 量一量：点一个图上距离，看实际距离跟着换算。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-dist-0" type="button"></button>' +
      '<button class="btn small ghost" id="' + K + '-dist-1" type="button"></button>' +
      '<button class="btn small ghost" id="' + K + '-dist-2" type="button"></button></div>' +
      '<div id="' + K + '-map"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再量一量。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 1:100000</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 1:50000</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 1:200000</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“实际距离 = 图上距离 × 比例尺的倍数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function actualOf(L, d) {
      if (li === 0) return d + ' 千米';
      if (li === 1) return (d * 500 / 1000) + ' 千米';
      return (d * 2) + ' 千米';
    }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.scale + '（图上 1 厘米 = 实际 ' + L.perCm + '），';
      var qd = gid(K + '-qd-tx'); if (qd) qd.textContent = String(L.dists[L.target]) + ' 厘米';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
        var db = gid(K + '-dist-' + k);
        if (db) { db.textContent = '图上 ' + L.dists[k] + ' 厘米'; db.setAttribute('aria-pressed', String(k === chosen)); }
      }
      var box = gid(K + '-map');
      if (box) {
        var s = '<svg width="360" height="90" viewBox="0 0 360 90">';
        var d = chosen >= 0 ? L.dists[chosen] : L.dists[L.target];
        var len = d * 40;
        s += '<line x1="30" y1="45" x2="' + (30 + len) + '" y2="45" stroke="#2563eb" stroke-width="3"/>';
        s += '<circle cx="30" cy="45" r="7" fill="#2563eb"/>';
        s += '<circle cx="' + (30 + len) + '" cy="45" r="7" fill="#f97316"/>';
        s += '<text x="30" y="75" text-anchor="middle" font-size="13">学校</text>';
        s += '<text x="' + (30 + len) + '" y="75" text-anchor="middle" font-size="13">公园</text>';
        s += '<text x="' + (30 + len / 2) + '" y="30" text-anchor="middle" font-size="13">图上 ' + d + ' 厘米</text>';
        s += '</svg>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = chosen >= 0
        ? '图上 ' + L.dists[chosen] + ' 厘米 × ' + L.perCm + ' = 实际 ' + actualOf(L, L.dists[chosen]) + '。'
        : '点一个图上距离，看看实际是多远。';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：实际距离是多少？'); return; }
      if (chosen !== L.target) { msg('先量目标图上距离再对：现在量的是图上 ' + L.dists[chosen] + ' 厘米。'); return; }
      var ok = guessed === L.ans;
      msg('图上 ' + L.dists[L.target] + ' 厘米，实际 ' + L.actual + '。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '，量出来是 ' + L.actual + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; chosen = -1; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再量一量。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜实际是 ' + LEVELS[li].opts[0] + '。量一量验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜实际是 ' + LEVELS[li].opts[1] + '。量一量验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜实际是 ' + LEVELS[li].opts[2] + '。量一量验证。'); });
    gid(K + '-dist-0').addEventListener('click', function () { chosen = 0; draw(); verdict(); });
    gid(K + '-dist-1').addEventListener('click', function () { chosen = 1; draw(); verdict(); });
    gid(K + '-dist-2').addEventListener('click', function () { chosen = 2; draw(); verdict(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：1:100000，图上 3 厘米 = 3 千米', '提高：1:50000，图上 4 厘米 = 2 千米', '挑战：1:200000，图上 2.5 厘米 = 5 千米'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
/* 6.13 鸽巢问题：先每洞一只已有 demo-pigeon（6.13 点页主演示），跳过；最不利情况、余数分类、配对游戏没有，做这三个。 */
registerAnim({
  key: 'm613-worst',
  title: '最不利情况',
  sub: '先摆出最坏的情况：每种颜色各摸 1 个，再多摸 1 个就一定凑出目标。',
  grade: 6,
  kind: '实验',
  points: ['6.13'],
  render: function (el) {
    var K = 'm613-worst';
    var LEVELS = [
      { label: '基础', colors: ['红', '黄', '蓝'], target: 2, seq: ['红', '黄', '蓝', '红'], answer: 4, opts: ['4', '3', '5'], ans: 0 },
      { label: '提高', colors: ['红', '黄', '蓝', '绿'], target: 2, seq: ['红', '黄', '蓝', '绿', '红'], answer: 5, opts: ['4', '5', '6'], ans: 1 },
      { label: '挑战', colors: ['红', '黄', '蓝'], target: 3, seq: ['红', '黄', '蓝', '红', '黄', '蓝', '红'], answer: 7, opts: ['6', '7', '8'], ans: 1 }
    ];
    var li = 0, drawn = 0, guessed = -1, tiers = null;
    var CC = { '红': '#dc2626', '黄': '#eab308', '蓝': '#2563eb', '绿': '#16a34a' };
    el.innerHTML =
      '<p class="demo-tag">实验 · 6 年级 · 鸽巢问题</p>' +
      '<h3>最不利情况</h3>' +
      '<p>摸球最怕运气差：先想最坏的情况——每种颜色都只摸到 1 个，再摸 1 个，一定凑出目标。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span>摸几个一定能凑出目标？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 摸一摸：运气最差，每次摸到的都是还没摸过的颜色。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-draw" type="button">摸一个</button></div>' +
      '<div id="' + K + '-balls"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再摸一个。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 3 色凑 2 个同色</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 4 色凑 2 个同色</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 3 色凑 3 个同色</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“最不利加 1，就是一定凑出的个数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx');
      if (q) q.textContent = '袋里 ' + L.colors.join('、') + L.colors.length + '种颜色，凑 ' + L.target + ' 个同色，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-balls');
      if (box) {
        var s = '<p>';
        for (var i = 0; i < drawn; i++) {
          s += '<span style="display:inline-block;width:30px;height:30px;border-radius:50%;background:' + CC[L.seq[i]] + ';color:#fff;line-height:30px;text-align:center;margin:2px">' + L.seq[i] + '</span>';
        }
        s += '</p>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) {
        if (drawn === 0) ct.textContent = '袋里每种颜色各 5 个，闭着眼睛摸。';
        else if (drawn < L.seq.length) ct.textContent = '摸了 ' + drawn + ' 个，还没凑出 ' + L.target + ' 个同色——运气最差就是这样。';
        else ct.textContent = '摸了 ' + drawn + ' 个：第 ' + drawn + ' 个一定是已经有过的颜色，凑出了 ' + L.target + ' 个同色。';
      }
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：摸几个一定能凑出目标？'); return; }
      var ok = guessed === L.ans;
      var worst = L.seq.length - 1;
      msg('最不利是摸 ' + worst + ' 个（每种颜色各 ' + (L.target - 1) + ' 个），再摸 1 个一定凑出：所以摸 ' + L.answer + ' 个一定能凑出 ' + L.target + ' 个同色。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + ' 个，一定能凑出要摸 ' + L.answer + ' 个。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; drawn = 0; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再摸一个。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜摸 ' + LEVELS[li].opts[0] + ' 个一定能凑出。摸一摸验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜摸 ' + LEVELS[li].opts[1] + ' 个一定能凑出。摸一摸验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜摸 ' + LEVELS[li].opts[2] + ' 个一定能凑出。摸一摸验证。'); });
    gid(K + '-draw').addEventListener('click', function () {
      var L = LEVELS[li];
      if (drawn < L.seq.length) { drawn++; draw(); }
      if (drawn >= L.seq.length) verdict();
      else msg('摸了 ' + drawn + ' 个，是' + L.seq[drawn - 1] + '色，继续。');
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3 色凑 2 同色，摸 4 个一定凑出', '提高：4 色凑 2 同色，摸 5 个一定凑出', '挑战：3 色凑 3 同色，摸 7 个一定凑出'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm613-remainder',
  title: '余数分类',
  sub: 'n+1 个数除以 n，余数只有 n 种，必有两数同余：余数就是鸽巢。',
  grade: 6,
  kind: '模拟',
  points: ['6.13'],
  render: function (el) {
    var K = 'm613-remainder';
    var LEVELS = [
      { label: '基础', nums: [7, 12, 15, 21, 26], mod: 4, pair: '7 和 15', opts: ['7 和 15', '12 和 21', '15 和 26'], ans: 0 },
      { label: '提高', nums: [5, 9, 11, 14], mod: 3, pair: '5 和 11', opts: ['5 和 9', '5 和 11', '9 和 14'], ans: 1 },
      { label: '挑战', nums: [8, 13, 17, 22, 31, 36], mod: 5, pair: '8 和 13', opts: ['8 和 13', '17 和 31', '22 和 36'], ans: 0 }
    ];
    var li = 0, sorted = false, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 鸽巢问题</p>' +
      '<h3>余数分类</h3>' +
      '<p>余数也是鸽巢：5 个数除以 4，余数只有 0、1、2、3 四种，5 个数进 4 个巢，一定有两个撞上。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span>哪两个数除以它余数相同？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 算余数，分一分：每个数除一下，按余数放进不同的盒子。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-sort" type="button">算余数，分一分</button></div>' +
      '<div id="' + K + '-boxes"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再算余数分一分。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 5 个数除以 4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 4 个数除以 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 6 个数除以 5</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“余数只有几种，数比余数多，一定有两个同余”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.nums.join('、') + '，除以 ' + L.mod + '，';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-boxes');
      if (box) {
        var s = '';
        if (sorted) {
          for (var r = 0; r < L.mod; r++) {
            var members = [];
            for (var i = 0; i < L.nums.length; i++) if (L.nums[i] % L.mod === r) members.push(L.nums[i]);
            s += '<p>余 ' + r + ' 的盒子：' + (members.length ? members.join('、') : '（空）') + '</p>';
          }
        } else {
          s = '<p>数：' + L.nums.join('、') + '。</p>';
        }
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = sorted
        ? L.nums.length + ' 个数，余数只有 ' + L.mod + ' 种：' + L.pair + ' 余数相同，都余 ' + (parseInt(L.pair.split(' ')[0], 10) % L.mod) + '。'
        : '除以 ' + L.mod + '，余数只可能是 0 到 ' + (L.mod - 1) + '。';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：哪两个数余数相同？'); return; }
      var ok = guessed === L.ans;
      msg(L.pair + ' 除以 ' + L.mod + ' 余数相同。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '，分出来是 ' + L.pair + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; sorted = false; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再算余数分一分。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜是 ' + LEVELS[li].opts[0] + '。算余数验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜是 ' + LEVELS[li].opts[1] + '。算余数验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜是 ' + LEVELS[li].opts[2] + '。算余数验证。'); });
    gid(K + '-sort').addEventListener('click', function () { sorted = true; draw(); verdict(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：5 个数除以 4，7 和 15 同余', '提高：4 个数除以 3，5 和 11 同余', '挑战：6 个数除以 5，8 和 13 同余'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm613-pairs',
  title: '配对游戏',
  sub: '16 张配对卡翻开 9 张必有配对：前 8 张若全不同，第 9 张必撞上其中一张的搭档。',
  grade: 6,
  kind: '实验',
  points: ['6.13'],
  render: function (el) {
    var K = 'm613-pairs';
    var LEVELS = [
      { label: '基础', pairs: 8, answer: 9, opts: ['9', '8', '10'], ans: 0 },
      { label: '提高', pairs: 5, answer: 6, opts: ['5', '6', '7'], ans: 1 },
      { label: '挑战', pairs: 6, answer: 7, opts: ['6', '7', '8'], ans: 1 }
    ];
    var li = 0, flipped = 0, guessed = -1, tiers = null;
    var LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    el.innerHTML =
      '<p class="demo-tag">实验 · 6 年级 · 鸽巢问题</p>' +
      '<h3>配对游戏</h3>' +
      '<p>桌上有成对的卡片，翻开几张一定能配成对？运气最差时，前几张全都不同。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span>翻几张一定能配成对？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 翻一翻：运气最差，每次翻到的都是新花色。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-flip" type="button">翻一张</button></div>' +
      '<div id="' + K + '-cards"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再翻一张。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 8 对卡片</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 5 对卡片</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 6 对卡片</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“对数加 1，就是一定能配成的张数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.pairs + ' 对卡片（' + (L.pairs * 2) + ' 张），';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-cards');
      if (box) {
        var s = '<p>';
        for (var i = 0; i < flipped; i++) {
          var letter = i < L.pairs ? LETTERS[i] : LETTERS[0];
          var dup = i >= L.pairs;
          s += '<span style="display:inline-block;width:34px;height:44px;line-height:44px;text-align:center;border:1px solid #1e293b;margin:2px;background:' + (dup ? '#fde68a' : '#ffffff') + ';font-weight:bold">' + letter + '</span>';
        }
        s += '</p>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = flipped === 0 ? '每种花色有 2 张，一共 ' + L.pairs + ' 种。'
        : flipped <= L.pairs ? '翻了 ' + flipped + ' 张，全都不同，还没配成对。'
        : '翻了 ' + flipped + ' 张：第 ' + flipped + ' 张是 ' + LETTERS[0] + '，和第 1 张配成对了！';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：翻几张一定能配成对？'); return; }
      var ok = guessed === L.ans;
      msg('前 ' + L.pairs + ' 张可以全不同，第 ' + L.answer + ' 张必撞上其中一张的搭档：翻 ' + L.answer + ' 张一定能配成对。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + ' 张，一定能配成要翻 ' + L.answer + ' 张。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; flipped = 0; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再翻一张。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜翻 ' + LEVELS[li].opts[0] + ' 张一定能配成对。翻一翻验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜翻 ' + LEVELS[li].opts[1] + ' 张一定能配成对。翻一翻验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜翻 ' + LEVELS[li].opts[2] + ' 张一定能配成对。翻一翻验证。'); });
    gid(K + '-flip').addEventListener('click', function () {
      var L = LEVELS[li];
      if (flipped < L.answer) { flipped++; draw(); }
      if (flipped >= L.answer) verdict();
      else msg('翻了 ' + flipped + ' 张，还没配成对，继续。');
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：8 对卡片，翻 9 张必配对', '提高：5 对卡片，翻 6 张必配对', '挑战：6 对卡片，翻 7 张必配对'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
/* 6.14 综合与实践 / 整理和复习：demo-conceptmap 只有 3 道“认出老办法”的问答卡，没有连线、没有一题多解并排比较、没有错题归因、没有间隔复习；概念地图连线与一题多解比较各做一个新动画，错题归因与间隔复习也各做一个。 */
registerAnim({
  key: 'm614-map',
  title: '概念地图连线',
  sub: '复习是认出老办法：每道题先问“这是哪个老办法”，再把它连到对应的 WHY 上。',
  grade: 6,
  kind: '实验',
  points: ['6.14'],
  render: function (el) {
    var K = 'm614-map';
    var LEVELS = [
      { label: '基础', qs: ['48 按 3:1 分', '3/4 × 2/5', '圆 r=3 求周长'], ms: ['份数法按比分配', '双色重叠面积', '绕绳量'], map: [0, 1, 2] },
      { label: '提高', qs: ['25% of 80 是多少', '10 只鸽子 4 个洞', '−5 和 −2 比大小'], ms: ['百分条', '先每洞一只', '竖直温度计'], map: [0, 1, 2] },
      { label: '挑战', qs: ['比例尺 1:50000，图上 3cm', '1+3+5+7 = ？', '圆柱 r=2 h=5 求体积'], ms: ['比例尺换算', 'L 形拼正方形', '叠层体积'], map: [0, 1, 2] }
    ];
    var li = 0, sel = -1, matched = [false, false, false], mistakes = 0, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 6 年级 · 整理和复习</p>' +
      '<h3>概念地图连线</h3>' +
      '<p>复习不是重背步骤，是认出老办法：每道题连到它的 WHY 上，线连对了，题就会了。</p>' +
      '<p>第 1 步 · 先猜：点一道题，再点一个老办法，连起来。</p>' +
      '<div class="btn-row"><span>题：</span>' +
      '<button class="btn small primary" id="' + K + '-q-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-q-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-q-2" type="button"></button></div>' +
      '<div class="btn-row"><span>老办法：</span>' +
      '<button class="btn small ghost" id="' + K + '-m-0" type="button"></button>' +
      '<button class="btn small ghost" id="' + K + '-m-1" type="button"></button>' +
      '<button class="btn small ghost" id="' + K + '-m-2" type="button"></button></div>' +
      '<div id="' + K + '-map"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先点一道题，再点一个老办法。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 三道题</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 三道题</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 三道题</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都一次连对——每道题都认出了它的老办法。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      for (var k = 0; k < 3; k++) {
        var qb = gid(K + '-q-' + k);
        if (qb) { qb.textContent = L.qs[k]; qb.setAttribute('aria-pressed', String(k === sel)); }
        var mb = gid(K + '-m-' + k);
        if (mb) mb.textContent = L.ms[k];
      }
      var box = gid(K + '-map');
      if (box) {
        var s = '<svg width="560" height="150" viewBox="0 0 560 150">';
        for (var i = 0; i < 3; i++) {
          var y = 30 + i * 50;
          s += '<circle cx="40" cy="' + y + '" r="8" fill="' + (matched[i] ? '#16a34a' : '#2563eb') + '"/>';
          s += '<text x="56" y="' + (y + 4) + '" font-size="13">' + L.qs[i] + '</text>';
          s += '<circle cx="520" cy="' + y + '" r="8" fill="' + (matched[i] ? '#16a34a' : '#f97316') + '"/>';
          s += '<text x="504" y="' + (y + 4) + '" text-anchor="end" font-size="13">' + L.ms[L.map[i]] + '</text>';
          if (matched[i]) {
            s += '<line x1="48" y1="' + y + '" x2="512" y2="' + y + '" stroke="#16a34a" stroke-width="3"/>';
          }
        }
        s += '</svg>';
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) {
        var done = 0;
        for (var j = 0; j < 3; j++) if (matched[j]) done++;
        ct.textContent = done === 0 ? '还没连线。' : '连对了 ' + done + ' 条。';
      }
    }
    function finish() {
      if (mistakes === 0) {
        msg('三条全连对了，一次全对！每道题都认出了它的老办法。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('三条都连对了，但有 ' + mistakes + ' 次连错过。换一档再连一遍，试试一次全对。');
      }
    }
    function pickMethod(mi) {
      var L = LEVELS[li];
      if (sel < 0) { msg('先点一道题。'); return; }
      if (matched[sel]) { msg('这道题已经连对了，点下一道题。'); return; }
      if (L.map[sel] === mi) {
        matched[sel] = true;
        var done = sel;
        sel = -1;
        draw();
        var all = matched[0] && matched[1] && matched[2];
        if (all) finish();
        else msg('连对了：' + L.qs[done] + ' → ' + L.ms[mi] + '。再点下一道题。');
      } else {
        mistakes++;
        msg('不对：' + L.qs[sel] + ' 不是用' + L.ms[mi] + '做的。再想想它的 WHY 是什么。');
      }
    }
    function setLevel(i) {
      li = i; sel = -1; matched = [false, false, false]; mistakes = 0;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先点一道题，再点一个老办法。');
    }
    gid(K + '-q-0').addEventListener('click', function () { sel = 0; draw(); msg('选了：' + LEVELS[li].qs[0] + '。它用哪个老办法？'); });
    gid(K + '-q-1').addEventListener('click', function () { sel = 1; draw(); msg('选了：' + LEVELS[li].qs[1] + '。它用哪个老办法？'); });
    gid(K + '-q-2').addEventListener('click', function () { sel = 2; draw(); msg('选了：' + LEVELS[li].qs[2] + '。它用哪个老办法？'); });
    gid(K + '-m-0').addEventListener('click', function () { pickMethod(0); });
    gid(K + '-m-1').addEventListener('click', function () { pickMethod(1); });
    gid(K + '-m-2').addEventListener('click', function () { pickMethod(2); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：三道题一次连对', '提高：三道题一次连对', '挑战：三道题一次连对'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm614-multi',
  title: '一题多解比较',
  sub: '同一题收 3 种解法并排比较：哪种更快、哪种更不容易错，解法是比较出来的。',
  grade: 6,
  kind: '演示',
  points: ['6.14'],
  render: function (el) {
    var K = 'm614-multi';
    var LEVELS = [
      { label: '基础', q: '绳子长 12 米，先用去它的 1/3，再用去剩下的 1/4，还剩多少米？',
        ways: [['分步', '12 × 1/3 = 4，剩 8 米；8 × 1/4 = 2，剩 6 米。'], ['整体', '(1 − 1/3) × (1 − 1/4) = 1/2，12 × 1/2 = 6 米。'], ['画条', '画一条 12 米的条，先划掉 1/3，再划掉剩下的 1/4，剩下一半是 6 米。']],
        best: '整体最快，分步最稳', opts: ['分步', '整体', '画条'], ans: 1 },
      { label: '提高', q: '甲、乙两数的和是 48，甲数是乙数的 3 倍，甲、乙两数各是多少？',
        ways: [['份数法', '乙是 1 份，甲是 3 份，一共 4 份，每份 12：甲 36，乙 12。'], ['方程', '设乙是 x，x + 3x = 48，x = 12：甲 36，乙 12。'], ['条形图', '画 1 份和 3 份的条，4 份是 48，每份 12。']],
        best: '份数法最快', opts: ['份数法', '方程', '条形图'], ans: 0 },
      { label: '挑战', q: '100 元的衣服，先降价 20%，再涨价 20%，现在多少钱？',
        ways: [['分步', '100 × 80% = 80 元；80 × 120% = 96 元。'], ['整体', '100 × 0.8 × 1.2 = 96 元。'], ['百分条', '百分条上先降到 80，再从 80 涨 20%，是 96。']],
        best: '整体最快，百分条最直观', opts: ['分步', '整体', '百分条'], ans: 1 }
    ];
    var li = 0, shown = [false, false, false], guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 6 年级 · 整理和复习</p>' +
      '<h3>一题多解比较</h3>' +
      '<p>同一道题，解法不止一种：三种解法并排看，哪种更快、哪种更不容易错。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span>哪种解法最快？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 三种解法都看一遍，再比一比。</p>' +
      '<div class="btn-row"><button class="btn small ghost" id="' + K + '-way-0" type="button"></button>' +
      '<button class="btn small ghost" id="' + K + '-way-1" type="button"></button>' +
      '<button class="btn small ghost" id="' + K + '-way-2" type="button"></button></div>' +
      '<div id="' + K + '-ways"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再把三种解法都看一遍。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 绳子还剩多少</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 甲乙两数</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 先降后涨</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“最快的解法，和最稳的解法，不一定是同一个”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.q;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
        var wb = gid(K + '-way-' + k);
        if (wb) wb.textContent = '看解法：' + L.ways[k][0];
      }
      var box = gid(K + '-ways');
      if (box) {
        var s = '';
        for (var i = 0; i < 3; i++) {
          if (shown[i]) s += '<p>' + L.ways[i][0] + '：' + L.ways[i][1] + '</p>';
        }
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = (shown[0] && shown[1] && shown[2])
        ? '三种解法答案一样：' + L.best + '。'
        : '三种解法都看一遍，再比一比。';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜：哪种解法最快？'); return; }
      var ok = guessed === L.ans;
      msg(L.best + '。' + (ok ? '你猜对了！' : '你猜最快的是 ' + L.opts[guessed] + '，比出来是' + L.best + '。'));
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function checkAll() {
      if (shown[0] && shown[1] && shown[2]) verdict();
    }
    function setLevel(i) {
      li = i; shown = [false, false, false]; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再把三种解法都看一遍。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜最快的是 ' + LEVELS[li].opts[0] + '。三种解法都看一遍验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜最快的是 ' + LEVELS[li].opts[1] + '。三种解法都看一遍验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜最快的是 ' + LEVELS[li].opts[2] + '。三种解法都看一遍验证。'); });
    gid(K + '-way-0').addEventListener('click', function () { shown[0] = true; draw(); checkAll(); });
    gid(K + '-way-1').addEventListener('click', function () { shown[1] = true; draw(); checkAll(); });
    gid(K + '-way-2').addEventListener('click', function () { shown[2] = true; draw(); checkAll(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：绳子题，整体最快', '提高：甲乙题，份数法最快', '挑战：降涨题，整体最快'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm614-cause',
  title: '错题归因',
  sub: '错题按原因分类：概念错、计算错、读题错——同类错一起练，而不是按单元重刷。',
  grade: 6,
  kind: '实验',
  points: ['6.14'],
  render: function (el) {
    var K = 'm614-cause';
    var CAUSES = ['概念错', '计算错', '读题错'];
    var LEVELS = [
      { label: '基础', items: [
        { q: '2/3 × 4/5 = 6/8', cause: 0, why: '分子加分子、分母加分母，是把乘法当成了加法：概念错。' },
        { q: '25 × 4 = 1000', cause: 1, why: '25 × 4 = 100，多写了一个 0：计算错。' },
        { q: '“用去它的 3/5”算成了“用去 3/5 米”', cause: 2, why: '“它的 3/5”是分率，不是 3/5 米：读题错。' } ] },
      { label: '提高', items: [
        { q: '−5 ＞ −2', cause: 0, why: '负数越往下越小，−5 在 −2 下面，所以 −5 ＜ −2：概念错。' },
        { q: '3.14 × 4 = 12.65', cause: 1, why: '3.14 × 4 = 12.56，抄错了数字：计算错。' },
        { q: '“至少”看成了“正好”', cause: 2, why: '至少是“不少于”，正好是“等于”，意思不一样：读题错。' } ] },
      { label: '挑战', items: [
        { q: '八折当成付 20%', cause: 0, why: '八折是付标价的 80%，省下的才是 20%：概念错。' },
        { q: '48 ÷ 4 = 14', cause: 1, why: '48 ÷ 4 = 12，口算滑了一下：计算错。' },
        { q: '比例尺 1:1000，图上 3cm 当成实际 3 米', cause: 2, why: '1:1000 是图上 1cm = 实际 1000cm = 10 米，3cm 是 30 米，不是 3 米：读题时把 1:1000 看成了 1:100，读题错。' } ] }
    ];
    var li = 0, idx = 0, mistakes = 0, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 6 年级 · 整理和复习</p>' +
      '<h3>错题归因</h3>' +
      '<p>错题先别急着重做：先问一句“错在哪”——概念错补概念，计算错练细心，读题错练读题。</p>' +
      '<p>第 1 步 · 先猜：第 <span id="' + K + '-idx-tx"></span>道错题，它错在哪？</p>' +
      '<p id="' + K + '-wrong"></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-cause-0" type="button">概念错</button>' +
      '<button class="btn small primary" id="' + K + '-cause-1" type="button">计算错</button>' +
      '<button class="btn small primary" id="' + K + '-cause-2" type="button">读题错</button></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜：这道错题错在哪？</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 三道错题</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 三道错题</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 三道错题</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都一次分对——概念错、计算错、读题错分得清。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var ix = gid(K + '-idx-tx'); if (ix) ix.textContent = idx >= 3 ? '3' : String(idx + 1);
      var w = gid(K + '-wrong');
      if (w) w.textContent = idx < 3 ? '错题：' + L.items[idx].q : '三道错题都分完了。';
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = idx < 3 ? '概念错是办法错了，计算错是算错了，读题错是题看错了。' : '分完了：概念错补概念，计算错练细心，读题错练读题。';
    }
    function finish() {
      if (mistakes === 0) {
        msg('三道全分对了，一次全对！同类错一起练，比按单元重刷有用。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('三道都分完了，但有 ' + mistakes + ' 次分错了。换一档再分一遍，试试一次全对。');
      }
    }
    function pick(c) {
      var L = LEVELS[li];
      if (idx >= 3) return;
      var item = L.items[idx];
      if (c === item.cause) {
        msg('分对了：' + item.why);
        idx++;
        draw();
        if (idx >= 3) finish();
      } else {
        mistakes++;
        msg('不对：这道不是' + CAUSES[c] + '。再想想它错在哪。');
      }
    }
    function setLevel(i) {
      li = i; idx = 0; mistakes = 0;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜：这道错题错在哪？');
    }
    gid(K + '-cause-0').addEventListener('click', function () { pick(0); });
    gid(K + '-cause-1').addEventListener('click', function () { pick(1); });
    gid(K + '-cause-2').addEventListener('click', function () { pick(2); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：三道错题一次分对', '提高：三道错题一次分对', '挑战：三道错题一次分对'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
registerAnim({
  key: 'm614-space',
  title: '间隔复习',
  sub: '学过的隔一阵再拿出来，先考一考再练，记得更牢：快忘的时候复习，最有用。',
  grade: 6,
  kind: '模拟',
  points: ['6.14'],
  render: function (el) {
    var K = 'm614-space';
    var LEVELS = [
      { label: '基础', q: '今天背会 10 个单词，3 天后不复习还剩几个？', opts: ['3 个', '6 个', '9 个'], ans: 0,
        days: [['第 0 天', '10 个', '10 个'], ['第 1 天', '6 个', '9 个'], ['第 3 天', '3 个', '8 个'], ['第 7 天', '1 个', '6 个']] },
      { label: '提高', q: '今天学会一个公式，3 天后不复习还剩几成？', opts: ['8 成', '3 成', '5 成'], ans: 1,
        days: [['第 0 天', '10 成', '10 成'], ['第 1 天', '6 成', '9 成'], ['第 3 天', '3 成', '8 成'], ['第 7 天', '1 成', '6 成']] },
      { label: '挑战', q: '复习安排在第 1、3、7 天，哪一天的复习最有用？', opts: ['第 1 天', '第 7 天', '第 30 天'], ans: 0,
        days: [['第 0 天', '10 成', '10 成'], ['第 1 天', '6 成', '9 成'], ['第 3 天', '3 成', '8 成'], ['第 7 天', '1 成', '6 成']] }
    ];
    var li = 0, day = -1, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 6 年级 · 整理和复习</p>' +
      '<h3>间隔复习</h3>' +
      '<p>一次背会不等于记住：不复习，记得越来越少；隔一阵复习一次，记得就牢得多。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-guess-2" type="button"></button></div>' +
      '<p>第 2 步 · 看一看：点一天，看不复习和复习一次各剩多少。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-day-0" type="button">第 0 天</button>' +
      '<button class="btn small ghost" id="' + K + '-day-1" type="button">第 1 天</button>' +
      '<button class="btn small ghost" id="' + K + '-day-2" type="button">第 3 天</button>' +
      '<button class="btn small ghost" id="' + K + '-day-3" type="button">第 7 天</button>' +
      '<button class="btn small primary" id="' + K + '-check" type="button">对一下这一档</button></div>' +
      '<div id="' + K + '-bars"></div>' +
      '<p id="' + K + '-calc-tx"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点一天看一看。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 背单词</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 背公式</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 复习计划</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“快忘的时候复习，最有用；第 1、3、7 天各复习一次”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[li];
      var q = gid(K + '-q-tx'); if (q) q.textContent = L.q;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-guess-' + k);
        if (b) b.textContent = L.opts[k];
      }
      var box = gid(K + '-bars');
      if (box) {
        var s = '';
        if (day >= 0) {
          var d = L.days[day];
          s += '<p>' + d[0] + '：不复习剩 ' + d[1] + '，复习一次剩 ' + d[2] + '。</p>';
          s += '<p>不复习：<span style="display:inline-block;height:20px;background:#fca5a5;width:' + (parseInt(d[1], 10) * 20) + 'px"></span> ' + d[1] + '</p>';
          s += '<p>复习一次：<span style="display:inline-block;height:20px;background:#86efac;width:' + (parseInt(d[2], 10) * 20) + 'px"></span> ' + d[2] + '</p>';
        } else {
          s = '<p>点一天，看那天还剩多少。</p>';
        }
        box.innerHTML = s;
      }
      var ct = gid(K + '-calc-tx');
      if (ct) ct.textContent = day >= 0
        ? L.days[day][0] + '：复习一次比不复习多记住 ' + (parseInt(L.days[day][2], 10) - parseInt(L.days[day][1], 10)) + (li === 0 ? ' 个' : ' 成') + '。'
        : '今天到期就复习，明天回来再复习：这就是今天复习和明天回来两个桶。';
    }
    function verdict() {
      var L = LEVELS[li];
      if (guessed < 0) { msg('先猜一猜。'); return; }
      var ok = guessed === L.ans;
      if (li < 2) {
        msg('3 天后不复习只剩 ' + L.days[2][1] + '，复习一次剩 ' + L.days[2][2] + '。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '，看出来是 ' + L.days[2][1] + '。'));
      } else {
        msg('第 1 天复习最有用：快忘的时候复习，记得最牢；拖到第 7 天，好多已经忘了。' + (ok ? '你猜对了！' : '你猜的是 ' + L.opts[guessed] + '，最有用的是第 1 天。'));
      }
      if (ok) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      li = i; day = -1; guessed = -1;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      draw();
      msg('先猜一猜，再点一天看一看。');
    }
    gid(K + '-guess-0').addEventListener('click', function () { guessed = 0; msg('你猜是 ' + LEVELS[li].opts[0] + '。点一天看一看验证。'); });
    gid(K + '-guess-1').addEventListener('click', function () { guessed = 1; msg('你猜是 ' + LEVELS[li].opts[1] + '。点一天看一看验证。'); });
    gid(K + '-guess-2').addEventListener('click', function () { guessed = 2; msg('你猜是 ' + LEVELS[li].opts[2] + '。点一天看一看验证。'); });
    gid(K + '-day-0').addEventListener('click', function () { day = 0; draw(); });
    gid(K + '-day-1').addEventListener('click', function () { day = 1; draw(); });
    gid(K + '-day-2').addEventListener('click', function () { day = 2; draw(); });
    gid(K + '-day-3').addEventListener('click', function () { day = 3; draw(); });
    gid(K + '-check').addEventListener('click', function () { verdict(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3 天后不复习剩 3 个', '提高：3 天后不复习剩 3 成', '挑战：第 1 天复习最有用'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    draw();
  }
});
