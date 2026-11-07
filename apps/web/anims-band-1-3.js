/* anims-band-1-3.js：1–3 年级的新动画（注册表）；每加一个动画调一次 registerAnim，格式见 anims-registry.js 的文件头注释；本文件顶层只能调 registerAnim，不能引用 app.js 的标识符。 */
registerAnim({
  key: 'm1a-pair',
  title: '一一对应配对法',
  sub: '两排东西一个对一个连起来，剩下的就是多出来的——不用数也知道谁多。',
  grade: 1,
  kind: '实验',
  points: ['1.1'],
  render: function (el) {
    var K = 'm1a-pair';
    var LEVELS = [
      { label: '基础', top: 5, bottom: 3 },
      { label: '提高', top: 4, bottom: 7 },
      { label: '挑战', top: 6, bottom: 6 }
    ];
    var levelIdx = 0, topN = 5, bottomN = 3, custom = false;
    var guessed = null, selTop = -1, done = false;
    var pairs = [], pairedTop = {}, pairedBottom = {};
    var topDots = [], bottomDots = [], tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 1 年级 · 数数、比多少</p>' +
      '<h3>一一对应配对法</h3>' +
      '<p>上面一排红圆点，下面一排蓝圆点。哪排多？多几个？不用一个一个数——一个对一个连起来，剩下的就是多出来的。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx">上面多、下面多，还是一样多？</span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-top" type="button">上面多</button>' +
      '<button class="btn small primary" id="' + K + '-guess-bottom" type="button">下面多</button>' +
      '<button class="btn small primary" id="' + K + '-guess-same" type="button">一样多</button></div>' +
      '<p>第 2 步 · 连一连：先点上面一个，再点下面一个，它们就配成一对。配满了就出答案。</p>' +
      '<div class="m1a-pair-rowbox"><p><b>上面一排</b> <button class="btn small ghost" id="' + K + '-top-minus" type="button">−</button><button class="btn small ghost" id="' + K + '-top-plus" type="button">＋</button> <span id="' + K + '-top-count"></span></p><div class="m1a-pair-row" id="' + K + '-top"></div></div>' +
      '<div class="m1a-pair-rowbox"><p><b>下面一排</b> <button class="btn small ghost" id="' + K + '-bottom-minus" type="button">−</button><button class="btn small ghost" id="' + K + '-bottom-plus" type="button">＋</button> <span id="' + K + '-bottom-count"></span></p><div class="m1a-pair-row" id="' + K + '-bottom"></div></div>' +
      '<p id="' + K + '-msg">先猜一猜，再连一连。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 5 比 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 4 比 7</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 6 比 6</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都连对，并且能说出“剩下的就是多出来的”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function clearRow(row) { while (row.firstChild) row.removeChild(row.firstChild); }
    function renderRows() {
      var topRow = gid(K + '-top'), bottomRow = gid(K + '-bottom');
      clearRow(topRow); clearRow(bottomRow);
      topDots = []; bottomDots = [];
      var tc = gid(K + '-top-count'); if (tc) tc.textContent = topN + ' 个';
      var bc = gid(K + '-bottom-count'); if (bc) bc.textContent = bottomN + ' 个';
      for (var i = 0; i < topN; i++) {
        (function (i) {
          var b = document.createElement('button');
          b.type = 'button'; b.className = 'm1a-pair-dot m1a-pair-dot-top'; b.textContent = '●';
          b.addEventListener('click', function () { onTopDot(i, b); });
          topRow.appendChild(b); topDots.push(b);
        })(i);
      }
      for (var j = 0; j < bottomN; j++) {
        (function (j) {
          var b = document.createElement('button');
          b.type = 'button'; b.className = 'm1a-pair-dot m1a-pair-dot-bottom'; b.textContent = '●';
          b.addEventListener('click', function () { onBottomDot(j, b); });
          bottomRow.appendChild(b); bottomDots.push(b);
        })(j);
      }
    }
    function resetRound() {
      guessed = null; selTop = -1; done = false;
      pairs = []; pairedTop = {}; pairedBottom = {};
      var gt = gid(K + '-guess-tx'); if (gt) gt.textContent = '上面多、下面多，还是一样多？';
      ['guess-top', 'guess-bottom', 'guess-same'].forEach(function (s) {
        var b = gid(K + '-' + s); if (b) b.disabled = false;
      });
      msg('先猜一猜，再连一连。');
      renderRows();
    }
    function setLevel(i) {
      levelIdx = i; custom = false;
      topN = LEVELS[i].top; bottomN = LEVELS[i].bottom;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      resetRound();
    }
    function guessText(g) {
      return g === 'top' ? '上面多' : g === 'bottom' ? '下面多' : '一样多';
    }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      var gt = gid(K + '-guess-tx');
      if (gt) gt.textContent = '你猜：' + guessText(g) + '。连一连，看看对不对。';
      msg('连一连：先点上面一个，再点下面一个。');
      maybeVerdict();
    }
    function onTopDot(i, b) {
      if (done) return;
      if (!guessed) { msg('先猜一猜：上面多、下面多，还是一样多？'); return; }
      if (pairedTop[i]) return;
      if (selTop >= 0 && topDots[selTop]) topDots[selTop].classList.remove('picked');
      selTop = i;
      b.classList.add('picked');
      msg('上面第 ' + (i + 1) + ' 个选好了，再点下面一个，跟它配成一对。');
    }
    function onBottomDot(j, b) {
      if (done) return;
      if (!guessed) { msg('先猜一猜：上面多、下面多，还是一样多？'); return; }
      if (pairedBottom[j]) return;
      if (selTop < 0) { msg('先点上面一个，再点下面一个。'); return; }
      var no = pairs.length + 1;
      pairs.push([selTop, j]);
      pairedTop[selTop] = no; pairedBottom[j] = no;
      var tb = topDots[selTop];
      if (tb) { tb.classList.remove('picked'); tb.classList.add('paired'); tb.textContent = String(no); tb.disabled = true; }
      b.classList.add('paired'); b.textContent = String(no); b.disabled = true;
      selTop = -1;
      msg('配好了第 ' + no + ' 对，继续。');
      maybeVerdict();
    }
    function maybeVerdict() {
      if (!guessed || done) return;
      if (pairs.length < Math.min(topN, bottomN)) return;
      done = true;
      var diff = topN - bottomN;
      var ok = (guessed === 'top' && diff > 0) || (guessed === 'bottom' && diff < 0) || (guessed === 'same' && diff === 0);
      var left = diff > 0 ? topDots : bottomDots;
      for (var i = 0; i < left.length; i++) {
        if (diff > 0 ? !pairedTop[i] : !pairedBottom[i]) left[i].classList.add('left-over');
      }
      var t = '连完了：上面 ' + topN + ' 个，下面 ' + bottomN + ' 个。' +
        (diff > 0 ? '上面多出 ' + diff + ' 个——红框的就是多出来的。' :
          diff < 0 ? '下面多出 ' + (-diff) + ' 个——红框的就是多出来的。' : '一样多，一个也不剩。') +
        (ok ? '你猜对了！' : '你刚才猜的是' + guessText(guessed) + '，再看一遍：剩下的就是多出来的。');
      msg(t);
      ['guess-top', 'guess-bottom', 'guess-same'].forEach(function (s) {
        var b = gid(K + '-' + s); if (b) b.disabled = true;
      });
      if (!custom && tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    function bump(which, d) {
      if (which === 'top') topN = Math.max(0, Math.min(9, topN + d));
      else bottomN = Math.max(0, Math.min(9, bottomN + d));
      custom = true;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', 'false');
      }
      resetRound();
      msg('自己出题：上面 ' + topN + ' 个，下面 ' + bottomN + ' 个。先猜，再连。');
    }
    gid(K + '-guess-top').addEventListener('click', function () { onGuess('top'); });
    gid(K + '-guess-bottom').addEventListener('click', function () { onGuess('bottom'); });
    gid(K + '-guess-same').addEventListener('click', function () { onGuess('same'); });
    gid(K + '-top-minus').addEventListener('click', function () { bump('top', -1); });
    gid(K + '-top-plus').addEventListener('click', function () { bump('top', 1); });
    gid(K + '-bottom-minus').addEventListener('click', function () { bump('bottom', -1); });
    gid(K + '-bottom-plus').addEventListener('click', function () { bump('bottom', 1); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：连对 5 比 3', '提高：连对 4 比 7', '挑战：连对 6 比 6'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    gid(K + '-level-0').setAttribute('aria-pressed', 'true');
    renderRows();
  }
});

/* ---------- 3.3 测量 ---------- */
registerAnim({
  key: 'm33-ladder',
  title: '单位楼梯装填',
  sub: '10 个小单位装成 1 个大单位，一级一级往上装；米到千米那级要装 1000 个。',
  grade: 3,
  kind: '模拟',
  points: ['3.3'],
  render: function (el) {
    var K = 'm33-ladder';
    var LEVELS = [
      { label: '基础', small: '毫米', big: '厘米', factor: 10, pack: 1 },
      { label: '提高', small: '厘米', big: '米', factor: 100, pack: 10 },
      { label: '挑战', small: '米', big: '千米', factor: 1000, pack: 100 }
    ];
    var levelIdx = 0, guessed = 0, filled = 0, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 3 年级 · 测量</p>' +
      '<h3>单位楼梯装填</h3>' +
      '<p>小单位一级一级装进大单位：装满 10 箱就拼成 1 个大单位。米到千米不一样——那级要装 1000 个。</p>' +
      '<p>第 1 步 · 先猜：1 个<span id="' + K + '-big-q"></span>等于几个<span id="' + K + '-small-q"></span>？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-10" type="button">10 个</button>' +
      '<button class="btn small primary" id="' + K + '-g-100" type="button">100 个</button>' +
      '<button class="btn small primary" id="' + K + '-g-1000" type="button">1000 个</button></div>' +
      '<p>第 2 步 · 装一装：每次装一箱，一箱是 <span id="' + K + '-pack"></span>。装满 10 箱就拼成 1 个大单位。</p>' +
      '<div id="' + K + '-boxes"></div>' +
      '<p id="' + K + '-prog"></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-pack-btn" type="button">装一箱</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再装一装。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 毫米到厘米</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 厘米到米</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 米到千米</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都装满，并且能说出“米到千米是 ×1000，不是 ×10”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawBoxes() {
      var box = gid(K + '-boxes');
      var h = '';
      for (var i = 0; i < 10; i++) {
        if (i < filled) h += '<span style="display:inline-block;width:36px;height:36px;line-height:36px;text-align:center;margin:3px;background:#15803d;color:#fff;border-radius:6px;">' + lv().pack + '</span>';
        else h += '<span style="display:inline-block;width:36px;height:36px;line-height:36px;text-align:center;margin:3px;border:2px dashed #94a3b8;color:#94a3b8;border-radius:6px;">空</span>';
      }
      if (box) box.innerHTML = h;
      var p = gid(K + '-prog');
      if (p) p.textContent = '已装 ' + (filled * lv().pack) + ' ' + lv().small + '，一共要装 ' + lv().factor + ' ' + lv().small + '。装满 10 箱 = 1 ' + lv().big + '。';
    }
    function resetRound() {
      guessed = 0; filled = 0; done = false;
      var bq = gid(K + '-big-q'); if (bq) bq.textContent = lv().big;
      var sq = gid(K + '-small-q'); if (sq) sq.textContent = lv().small;
      var pk = gid(K + '-pack'); if (pk) pk.textContent = lv().pack + ' ' + lv().small;
      var pb = gid(K + '-pack-btn'); if (pb) pb.disabled = true;
      ['g-10', 'g-100', 'g-1000'].forEach(function (s) { var b = gid(K + '-' + s); if (b) b.disabled = false; });
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再装一装。');
      drawBoxes();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      ['g-10', 'g-100', 'g-1000'].forEach(function (s) { var b = gid(K + '-' + s); if (b) b.disabled = true; });
      var pb = gid(K + '-pack-btn'); if (pb) pb.disabled = false;
      msg('你猜 1 ' + lv().big + ' = ' + g + ' ' + lv().small + '。装一装，看看对不对。');
    }
    function packOne() {
      if (!guessed) { msg('先猜一猜：1 个大单位等于几个小单位？'); return; }
      if (done) return;
      filled++;
      drawBoxes();
      if (filled >= 10) {
        done = true;
        var ok = guessed === lv().factor;
        var t = '装满了：10 箱 × ' + lv().pack + ' ' + lv().small + ' = ' + lv().factor + ' ' + lv().small + ' = 1 ' + lv().big + '。' +
          (ok ? '你猜对了！' : '你刚才猜的是 ' + guessed + ' 个，记住：1 ' + lv().big + ' = ' + lv().factor + ' ' + lv().small + '。') +
          (levelIdx === 2 ? '米到千米是 ×1000，不是 ×10。' : '');
        msg(t);
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('装了第 ' + filled + ' 箱，还差 ' + (10 - filled) + ' 箱。');
      }
    }
    gid(K + '-g-10').addEventListener('click', function () { onGuess(10); });
    gid(K + '-g-100').addEventListener('click', function () { onGuess(100); });
    gid(K + '-g-1000').addEventListener('click', function () { onGuess(1000); });
    gid(K + '-pack-btn').addEventListener('click', packOne);
    gid(K + '-reset').addEventListener('click', resetRound);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：装满 10 毫米 = 1 厘米', '提高：装满 100 厘米 = 1 米', '挑战：装满 1000 米 = 1 千米'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm33-estimate',
  title: '实测估测',
  sub: '先估一估，再用身体做尺量一量：1 拃、1 步到底有多长？',
  grade: 3,
  kind: '实验',
  points: ['3.3'],
  render: function (el) {
    var K = 'm33-estimate';
    var LEVELS = [
      { label: '基础', obj: '铅笔盒', actual: 30, body: '拃', lens: [12, 15, 20], defLen: 15, guess: [15, 30, 45] },
      { label: '提高', obj: '课桌', actual: 120, body: '拃', lens: [12, 15, 20], defLen: 15, guess: [60, 120, 180] },
      { label: '挑战', obj: '走廊', actual: 600, body: '步', lens: [40, 50, 60], defLen: 50, guess: [300, 600, 900] }
    ];
    var levelIdx = 0, guessed = 0, bodyLen = 15, revealed = false, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 3 年级 · 测量</p>' +
      '<h3>实测估测</h3>' +
      '<p>先估一估有多长，再量一量。没有尺的时候，身体就是尺：张开的手叫 1 拃，迈开的一步叫 1 步。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-obj-q"></span>大约多长？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 量一量：下面这条就是<span id="' + K + '-obj-2"></span>。先调一调你的<span id="' + K + '-body-name"></span>有多长，再点“量一量”。</p>' +
      '<div id="' + K + '-bar" style="height:26px;background:#fde68a;border:2px solid #d97706;border-radius:6px;margin:8px 0;"></div>' +
      '<p>我的 1 <span id="' + K + '-body-name-2"></span> = <span id="' + K + '-len-now"></span> 厘米：' +
      '<button class="btn small ghost" id="' + K + '-len-0" type="button"></button>' +
      '<button class="btn small ghost" id="' + K + '-len-1" type="button"></button>' +
      '<button class="btn small ghost" id="' + K + '-len-2" type="button"></button></p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-measure" type="button">量一量</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再量一量。</p>' +
      '<p id="' + K + '-count"></p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 铅笔盒</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 课桌</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 走廊</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都量过，并且能说出“身体做尺，量的是大约数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function countText() {
      var n = lv().actual / bodyLen;
      var whole = Math.floor(n);
      if (n === whole) return whole + ' ' + lv().body;
      if (n - whole === 0.5) return whole + ' ' + lv().body + '半';
      return n.toFixed(1) + ' ' + lv().body;
    }
    function showCount() {
      var c = gid(K + '-count');
      if (c && revealed) c.textContent = '用 1 ' + lv().body + ' = ' + bodyLen + ' 厘米来量：' + lv().obj + '大约是 ' + countText() + '。';
    }
    function resetRound() {
      guessed = 0; revealed = false; done = false; bodyLen = lv().defLen;
      var oq = gid(K + '-obj-q'); if (oq) oq.textContent = lv().obj;
      var o2 = gid(K + '-obj-2'); if (o2) o2.textContent = lv().obj;
      var bn = gid(K + '-body-name'); if (bn) bn.textContent = lv().body;
      var bn2 = gid(K + '-body-name-2'); if (bn2) bn2.textContent = lv().body;
      var ln = gid(K + '-len-now'); if (ln) ln.textContent = String(bodyLen);
      for (var i = 0; i < 3; i++) {
        var gb = gid(K + '-g-' + i);
        if (gb) { gb.textContent = lv().guess[i] + ' 厘米'; gb.disabled = false; }
        var lb = gid(K + '-len-' + i);
        if (lb) { lb.textContent = lv().lens[i] + ' 厘米'; lb.setAttribute('aria-pressed', String(lv().lens[i] === bodyLen)); }
      }
      var bar = gid(K + '-bar');
      if (bar) bar.style.width = Math.min(320, lv().actual) + 'px';
      var mb = gid(K + '-measure'); if (mb) mb.disabled = true;
      var c = gid(K + '-count'); if (c) c.textContent = '';
      for (var k = 0; k < 3; k++) { var lb2 = gid(K + '-level-' + k); if (lb2) lb2.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再量一量。');
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      var mb = gid(K + '-measure'); if (mb) mb.disabled = false;
      msg('你猜' + lv().obj + '大约 ' + g + ' 厘米。点“量一量”看看。');
    }
    function setLen(v) {
      bodyLen = v;
      var ln = gid(K + '-len-now'); if (ln) ln.textContent = String(bodyLen);
      for (var i = 0; i < 3; i++) { var b = gid(K + '-len-' + i); if (b) b.setAttribute('aria-pressed', String(lv().lens[i] === bodyLen)); }
      showCount();
    }
    function measure() {
      if (!guessed) { msg('先猜一猜：大约多长？'); return; }
      if (done) return;
      revealed = true; done = true;
      var ok = guessed === lv().actual;
      msg('量出来了：' + lv().obj + '大约 ' + lv().actual + ' 厘米。' +
        (ok ? '你猜对了！' : '你刚才猜的是 ' + guessed + ' 厘米，差了 ' + Math.abs(lv().actual - guessed) + ' 厘米。') +
        '再估一估别的，眼睛会越来越准。');
      showCount();
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(lv().guess[0]); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(lv().guess[1]); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(lv().guess[2]); });
    gid(K + '-len-0').addEventListener('click', function () { setLen(lv().lens[0]); });
    gid(K + '-len-1').addEventListener('click', function () { setLen(lv().lens[1]); });
    gid(K + '-len-2').addEventListener('click', function () { setLen(lv().lens[2]); });
    gid(K + '-measure').addEventListener('click', measure);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：估准铅笔盒 30 厘米', '提高：估准课桌 120 厘米', '挑战：估准走廊 600 厘米'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm33-ruler',
  title: '数轴即尺',
  sub: '米尺就是一条数轴：换算单位，就是在数轴上换一种刻度读数。',
  grade: 3,
  kind: '演示',
  points: ['3.3'],
  render: function (el) {
    var K = 'm33-ruler';
    var LEVELS = [
      { label: '基础', target: 40, guess: [30, 40, 50], conv: '4 分米' },
      { label: '提高', target: 65, guess: [55, 65, 75], conv: '6 分米 5 厘米' },
      { label: '挑战', target: 90, guess: [80, 90, 100], conv: '9 分米' }
    ];
    var levelIdx = 0, guessed = 0, pos = 0, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 3 年级 · 测量</p>' +
      '<h3>数轴即尺</h3>' +
      '<p>一把米尺就是一条数轴：0 在最左，越往右数越大。红点停在哪里，就读出几厘米；再换成几分米几厘米。</p>' +
      '<p>第 1 步 · 先猜：红点应该停在几厘米？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 拨一拨红点（点在尺上的位置就是它的数）：</p>' +
      '<div style="position:relative;height:64px;border-bottom:3px solid #334155;margin:8px 0 4px 0;" id="' + K + '-ruler">' +
      '<span id="' + K + '-mark" style="position:absolute;left:0%;top:2px;color:#dc2626;font-size:26px;">▼</span>' +
      '<span id="' + K + '-ticks" style="position:absolute;left:0;right:0;top:36px;"></span></div>' +
      '<p>红点现在：<b id="' + K + '-pos-now">0 厘米</b>　' +
      '<button class="btn small ghost" id="' + K + '-m-10" type="button">−10</button>' +
      '<button class="btn small ghost" id="' + K + '-m-1" type="button">−1</button>' +
      '<button class="btn small ghost" id="' + K + '-p-1" type="button">＋1</button>' +
      '<button class="btn small ghost" id="' + K + '-p-10" type="button">＋10</button></p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-check" type="button">对一对</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再拨红点。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 40 厘米</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 65 厘米</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 90 厘米</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都停准，并且能说出“尺就是数轴，换单位就是换刻度”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function convText(cm) {
      var dm = Math.floor(cm / 10), rem = cm % 10;
      if (rem === 0) return dm + ' 分米';
      return dm + ' 分米 ' + rem + ' 厘米';
    }
    function drawRuler() {
      var tk = gid(K + '-ticks');
      if (!tk) return;
      var h = '';
      for (var i = 0; i <= 100; i += 10) {
        h += '<span style="position:absolute;left:' + i + '%;top:0;">| ' + i + '</span>';
      }
      tk.innerHTML = h;
      var mk = gid(K + '-mark');
      if (mk) mk.style.left = pos + '%';
      var pn = gid(K + '-pos-now');
      if (pn) pn.textContent = pos + ' 厘米';
    }
    function resetRound() {
      guessed = 0; pos = 0; done = false;
      for (var i = 0; i < 3; i++) {
        var gb = gid(K + '-g-' + i);
        if (gb) { gb.textContent = lv().guess[i] + ' 厘米'; gb.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再拨红点。');
      drawRuler();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      msg('你猜红点停在 ' + g + ' 厘米。拨一拨，停到那个刻度再对一对。');
    }
    function move(d) {
      if (done) return;
      pos = Math.max(0, Math.min(100, pos + d));
      drawRuler();
    }
    function check() {
      if (!guessed) { msg('先猜一猜：红点应该停在几厘米？'); return; }
      if (done) return;
      if (pos === lv().target) {
        done = true;
        var ok = guessed === lv().target;
        msg('停准了：红点在 ' + pos + ' 厘米 = ' + lv().conv + '。' +
          (ok ? '你猜对了！' : '你刚才猜的是 ' + guessed + ' 厘米，尺上的刻度不会骗人。') +
          '米尺就是数轴，换单位就是换一种刻度读数。');
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        var diff = lv().target - pos;
        msg('现在是 ' + pos + ' 厘米（' + convText(pos) + '）。' +
          (diff > 0 ? '还差 ' + diff + ' 厘米。' : '多出了 ' + (-diff) + ' 厘米，往回拨。'));
      }
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(lv().guess[0]); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(lv().guess[1]); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(lv().guess[2]); });
    gid(K + '-m-10').addEventListener('click', function () { move(-10); });
    gid(K + '-m-1').addEventListener('click', function () { move(-1); });
    gid(K + '-p-1').addEventListener('click', function () { move(1); });
    gid(K + '-p-10').addEventListener('click', function () { move(10); });
    gid(K + '-check').addEventListener('click', check);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：停准 40 厘米 = 4 分米', '提高：停准 65 厘米 = 6 分米 5 厘米', '挑战：停准 90 厘米 = 9 分米'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

/* ---------- 3.9 位置与方向 ---------- */
registerAnim({
  key: 'm39-sun',
  title: '太阳定方向',
  sub: '早上面向太阳，前面是东，左手是北；太阳一动，方向就跟着变。',
  grade: 3,
  kind: '实验',
  points: ['3.9'],
  render: function (el) {
    var K = 'm39-sun';
    var DIRS = ['北', '东', '南', '西'];
    var ARROWS = ['↑', '→', '↓', '←'];
    var LEVELS = [
      { label: '基础', when: '早上', sun: 1, faceNeed: 1, ask: '左手', answer: 0 },
      { label: '提高', when: '傍晚', sun: 3, faceNeed: 3, ask: '左手', answer: 2 },
      { label: '挑战', when: '早上', sun: 1, faceNeed: 3, ask: '前面', answer: 3 }
    ];
    var levelIdx = 0, guessed = -1, facing = 0, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 3 年级 · 位置与方向</p>' +
      '<h3>太阳定方向</h3>' +
      '<p>太阳东升西落。早上太阳在东边，傍晚太阳在西边。站好方向，先看太阳在哪里。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button">北</button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button">东</button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button">南</button>' +
      '<button class="btn small primary" id="' + K + '-g-3" type="button">西</button></div>' +
      '<p>第 2 步 · 转一转身子：太阳在<span id="' + K + '-sun-where"></span>，<span id="' + K + '-task"></span>。</p>' +
      '<div style="position:relative;width:280px;height:200px;border:2px solid #334155;border-radius:10px;margin:8px 0;">' +
      '<span style="position:absolute;left:125px;top:2px;">北</span>' +
      '<span style="position:absolute;right:4px;top:88px;">东</span>' +
      '<span style="position:absolute;left:125px;bottom:2px;">南</span>' +
      '<span style="position:absolute;left:4px;top:88px;">西</span>' +
      '<span id="' + K + '-sun" style="position:absolute;font-size:26px;">☀</span>' +
      '<span id="' + K + '-me" style="position:absolute;left:125px;top:80px;font-size:30px;">↑</span></div>' +
      '<p id="' + K + '-now">我现在面朝北。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-left" type="button">向左转</button>' +
      '<button class="btn small ghost" id="' + K + '-right" type="button">向右转</button>' +
      '<button class="btn small ghost" id="' + K + '-back" type="button">向后转</button>' +
      '<button class="btn small primary" id="' + K + '-check" type="button">对一对</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再转身。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 早上面向太阳</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 傍晚面向太阳</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 早上背对太阳</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都站对，并且能说出“早上面向太阳，左手是北”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function leftOf(f) { return (f + 3) % 4; }
    function rightOf(f) { return (f + 1) % 4; }
    function backOf(f) { return (f + 2) % 4; }
    function drawMe() {
      var me = gid(K + '-me');
      if (me) me.textContent = ARROWS[facing];
      var nw = gid(K + '-now');
      if (nw) nw.textContent = '我现在面朝' + DIRS[facing] + '，左手是' + DIRS[leftOf(facing)] + '，右手是' + DIRS[rightOf(facing)] + '。';
    }
    function resetRound() {
      guessed = -1; facing = 0; done = false;
      var q = gid(K + '-q');
      if (q) q.textContent = lv().when + '，' + (levelIdx === 2 ? '背对太阳站好，你的' + lv().ask + '边是哪个方向？' : '面向太阳站好，你的' + lv().ask + '边是哪个方向？');
      var sw = gid(K + '-sun-where'); if (sw) sw.textContent = DIRS[lv().sun] + '边';
      var tk = gid(K + '-task'); if (tk) tk.textContent = levelIdx === 2 ? '请背对太阳站好' : '请面向太阳站好';
      var sun = gid(K + '-sun');
      if (sun) { sun.style.left = lv().sun === 1 ? '240px' : '10px'; sun.style.top = '80px'; }
      for (var i = 0; i < 4; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = false; }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再转身。');
      drawMe();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 4; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      msg('你猜' + lv().ask + '边是' + DIRS[g] + '。转身站好，再对一对。');
    }
    function turn(d) {
      if (done) return;
      facing = (facing + d + 4) % 4;
      drawMe();
    }
    function check() {
      if (guessed < 0) { msg('先猜一猜：' + lv().ask + '边是哪个方向？'); return; }
      if (done) return;
      if (facing !== lv().faceNeed) {
        msg('你现在面朝' + DIRS[facing] + '，还没站对：' + (levelIdx === 2 ? '早上要背对太阳。' : lv().when + '太阳在' + DIRS[lv().sun] + '边，要面向太阳。') + '再转一转。');
        return;
      }
      done = true;
      var ok = guessed === lv().answer;
      msg('站对了：前面是' + DIRS[facing] + '，后面是' + DIRS[backOf(facing)] + '，左手是' + DIRS[leftOf(facing)] + '，右手是' + DIRS[rightOf(facing)] + '。' +
        (ok ? '你猜对了！' : '你刚才猜' + lv().ask + '边是' + DIRS[guessed] + '，再看一遍：' + lv().ask + '边是' + DIRS[lv().answer] + '。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-g-3').addEventListener('click', function () { onGuess(3); });
    gid(K + '-left').addEventListener('click', function () { turn(3); });
    gid(K + '-right').addEventListener('click', function () { turn(1); });
    gid(K + '-back').addEventListener('click', function () { turn(2); });
    gid(K + '-check').addEventListener('click', check);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：早上面向太阳，左手是北', '提高：傍晚面向太阳，左手是南', '挑战：早上背对太阳，前面是西'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm39-compass',
  title: '指南针针头不动',
  sub: '地图怎么转，指南针的针头永远指北——北是地球的方向，不是纸的方向。',
  grade: 3,
  kind: '模拟',
  points: ['3.9'],
  render: function (el) {
    var K = 'm39-compass';
    var LEVELS = [
      { label: '基础', turns: 1, place: '公园', answer: '北' },
      { label: '提高', turns: 2, place: '医院', answer: '东' },
      { label: '挑战', turns: 3, place: '超市', answer: '南' }
    ];
    var levelIdx = 0, guessed = '', rot = 0, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 3 年级 · 位置与方向</p>' +
      '<h3>指南针针头不动</h3>' +
      '<p>这张地图上，学校在中间，公园在北边，医院在东边，超市在南边，图书馆在西边。把地图转一转，看看谁跟着转、谁不动。</p>' +
      '<p>第 1 步 · 先猜：地图转完之后，<span id="' + K + '-place-q"></span>还在学校的哪个方向？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-n" type="button">北</button>' +
      '<button class="btn small primary" id="' + K + '-g-e" type="button">东</button>' +
      '<button class="btn small primary" id="' + K + '-g-s" type="button">南</button>' +
      '<button class="btn small primary" id="' + K + '-g-w" type="button">西</button></div>' +
      '<p>第 2 步 · 转地图：题目要求顺时针转 <span id="' + K + '-turns"></span> 次，每次 90°。</p>' +
      '<div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;">' +
      '<div><div id="' + K + '-map" style="width:150px;height:150px;"></div><p>地图（会转）</p></div>' +
      '<div style="text-align:center;"><p style="font-size:34px;margin:4px 0;">▲</p><p>指南针<br>针头永远指北</p></div></div>' +
      '<p>地图已经转了 <b id="' + K + '-rot-now">0°</b></p>' +
      '<div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-rot" type="button">顺时针转 90°</button>' +
      '<button class="btn small ghost" id="' + K + '-rot-back" type="button">转回原样</button>' +
      '<button class="btn small primary" id="' + K + '-check" type="button">对一对</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再转地图。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 转 1 次，问公园</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 转 2 次，问医院</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 转 3 次，问超市</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都答对，并且能说出“北是地球的方向，不是纸的方向”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawMap() {
      var map = gid(K + '-map');
      if (!map) return;
      var cells = [
        ['·', '公园', '·'],
        ['图书馆', '学校', '医院'],
        ['·', '超市', '·']
      ];
      var h = '<div style="display:grid;grid-template-columns:repeat(3,50px);grid-template-rows:repeat(3,50px);">';
      for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 3; c++) {
          h += '<span style="border:1px solid #94a3b8;display:flex;align-items:center;justify-content:center;font-size:13px;background:#eff6ff;">' + cells[r][c] + '</span>';
        }
      }
      h += '</div>';
      map.innerHTML = h;
      map.style.transform = 'rotate(' + (rot * 90) + 'deg)';
      var rn = gid(K + '-rot-now');
      if (rn) rn.textContent = (rot * 90) + '°';
    }
    function resetRound() {
      guessed = ''; rot = 0; done = false;
      var pq = gid(K + '-place-q'); if (pq) pq.textContent = lv().place;
      var tn = gid(K + '-turns'); if (tn) tn.textContent = String(lv().turns);
      ['g-n', 'g-e', 'g-s', 'g-w'].forEach(function (s) { var b = gid(K + '-' + s); if (b) b.disabled = false; });
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再转地图。');
      drawMap();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      ['g-n', 'g-e', 'g-s', 'g-w'].forEach(function (s) { var b = gid(K + '-' + s); if (b) b.disabled = true; });
      msg('你猜' + lv().place + '在学校的' + g + '边。转一转地图，再对一对。');
    }
    function rotate() {
      if (done) return;
      rot = (rot + 1) % 4;
      drawMap();
    }
    function check() {
      if (!guessed) { msg('先猜一猜：' + lv().place + '在学校的哪个方向？'); return; }
      if (done) return;
      if (rot !== lv().turns) {
        msg('题目要求顺时针转 ' + lv().turns + ' 次，你转了 ' + rot + ' 次。先转够次数。');
        return;
      }
      done = true;
      var ok = guessed === lv().answer;
      msg('地图转了 ' + (rot * 90) + '°，纸上的' + lv().place + '跑到了另一边，可是针头还是指北，' + lv().place + '还是在学校的' + lv().answer + '边。' +
        (ok ? '你猜对了！' : '你刚才猜的是' + guessed + '边，再看一遍指南针。') +
        '北是地球的方向，不是纸的方向。');
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-n').addEventListener('click', function () { onGuess('北'); });
    gid(K + '-g-e').addEventListener('click', function () { onGuess('东'); });
    gid(K + '-g-s').addEventListener('click', function () { onGuess('南'); });
    gid(K + '-g-w').addEventListener('click', function () { onGuess('西'); });
    gid(K + '-rot').addEventListener('click', rotate);
    gid(K + '-rot-back').addEventListener('click', function () { if (done) return; rot = 0; drawMap(); });
    gid(K + '-check').addEventListener('click', check);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：转 90°，公园还在北边', '提高：转 180°，医院还在东边', '挑战：转 270°，超市还在南边'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm39-route',
  title: '路线描',
  sub: '一步一步写下来：先向哪走、走多远，再走下一步——走错了可以退回来。',
  grade: 3,
  kind: '实验',
  points: ['3.9'],
  render: function (el) {
    var K = 'm39-route';
    var LEVELS = [
      { label: '基础', sx: 0, sy: 0, tx: 2, ty: 1, lake: null, guess: [3, 4, 5], min: 3 },
      { label: '提高', sx: 0, sy: 0, tx: 1, ty: 3, lake: null, guess: [4, 5, 6], min: 4 },
      { label: '挑战', sx: 0, sy: 0, tx: 3, ty: 3, lake: { x: 2, y: 2 }, guess: [6, 7, 8], min: 6 }
    ];
    var levelIdx = 0, guessed = 0, px = 0, py = 0, moves = [], done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 3 年级 · 位置与方向</p>' +
      '<h3>路线描</h3>' +
      '<p>从“家”走到“★”，每次走 1 格。走过的格子会留下脚印，退一步就能回头；前面是湖就过不去，得绕一绕。</p>' +
      '<p>第 1 步 · 先猜：从家到 ★，最少走几格？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 走一走：</p>' +
      '<div id="' + K + '-grid"></div>' +
      '<div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-go-n" type="button">向北走</button>' +
      '<button class="btn small ghost" id="' + K + '-go-s" type="button">向南走</button>' +
      '<button class="btn small ghost" id="' + K + '-go-e" type="button">向东走</button>' +
      '<button class="btn small ghost" id="' + K + '-go-w" type="button">向西走</button>' +
      '<button class="btn small ghost" id="' + K + '-undo" type="button">退一步</button></div>' +
      '<p id="' + K + '-route">路线：还没出发。</p>' +
      '<p id="' + K + '-msg">先猜一猜，再走一走。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 到（2，1）</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 到（1，3）</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 绕过湖到（3，3）</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都走到 ★，并且能说出自己的路线是“先向哪走、走几格”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function routeText() {
      if (!moves.length) return '路线：还没出发。';
      var parts = [], cur = moves[0], n = 1;
      for (var i = 1; i < moves.length; i++) {
        if (moves[i] === cur) n++;
        else { parts.push('向' + cur + '走 ' + n + ' 格'); cur = moves[i]; n = 1; }
      }
      parts.push('向' + cur + '走 ' + n + ' 格');
      return '路线：' + parts.join('，再') + '。';
    }
    function drawGrid() {
      var g = gid(K + '-grid');
      if (!g) return;
      var h = '<div style="display:grid;grid-template-columns:repeat(4,48px);grid-template-rows:repeat(4,48px);">';
      for (var y = 3; y >= 0; y--) {
        for (var x = 0; x < 4; x++) {
          var c = '·', bg = '#fff';
          if (lv().lake && x === lv().lake.x && y === lv().lake.y) { c = '湖'; bg = '#bfdbfe'; }
          else if (x === px && y === py) { c = '我'; bg = '#fde68a'; }
          else if (x === lv().tx && y === lv().ty) { c = '★'; bg = '#dcfce7'; }
          else if (x === lv().sx && y === lv().sy) { c = '家'; bg = '#fee2e2'; }
          h += '<span style="border:1px solid #94a3b8;display:flex;align-items:center;justify-content:center;font-size:15px;background:' + bg + ';">' + c + '</span>';
        }
      }
      h += '</div>';
      g.innerHTML = h;
      var rt = gid(K + '-route');
      if (rt) rt.textContent = routeText();
    }
    function resetRound() {
      guessed = 0; px = lv().sx; py = lv().sy; moves = []; done = false;
      for (var i = 0; i < 3; i++) {
        var gb = gid(K + '-g-' + i);
        if (gb) { gb.textContent = lv().guess[i] + ' 格'; gb.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再走一走。');
      drawGrid();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      msg('你猜最少走 ' + g + ' 格。走一走，看看要几格。');
    }
    function go(dx, dy, dir) {
      if (!guessed) { msg('先猜一猜：最少走几格？'); return; }
      if (done) return;
      var nx = px + dx, ny = py + dy;
      if (nx < 0 || nx > 3 || ny < 0 || ny > 3) { msg('出界了，地图只有 4×4，换个方向。'); return; }
      if (lv().lake && nx === lv().lake.x && ny === lv().lake.y) { msg('前面是湖，过不去！绕一绕。'); return; }
      px = nx; py = ny; moves.push(dir);
      drawGrid();
      if (px === lv().tx && py === lv().ty) {
        done = true;
        var ok = guessed === lv().min;
        msg('到了！你走了 ' + moves.length + ' 步，最少只要 ' + lv().min + ' 步。' + routeText() +
          (ok ? '你猜对了！' : '你刚才猜最少 ' + guessed + ' 格，最少其实是 ' + lv().min + ' 格：向东、向北的格子数加起来。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('走了 ' + moves.length + ' 步，继续。');
      }
    }
    function undo() {
      if (done || !moves.length) return;
      moves.pop();
      px = lv().sx; py = lv().sy;
      for (var i = 0; i < moves.length; i++) {
        if (moves[i] === '东') px++;
        else if (moves[i] === '西') px--;
        else if (moves[i] === '北') py++;
        else if (moves[i] === '南') py--;
      }
      drawGrid();
      msg('退了一步，现在走了 ' + moves.length + ' 步。');
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(lv().guess[0]); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(lv().guess[1]); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(lv().guess[2]); });
    gid(K + '-go-n').addEventListener('click', function () { go(0, 1, '北'); });
    gid(K + '-go-s').addEventListener('click', function () { go(0, -1, '南'); });
    gid(K + '-go-e').addEventListener('click', function () { go(1, 0, '东'); });
    gid(K + '-go-w').addEventListener('click', function () { go(-1, 0, '西'); });
    gid(K + '-undo').addEventListener('click', undo);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3 格走到（2，1）', '提高：4 格走到（1，3）', '挑战：6 格绕过湖走到（3，3）'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm39-turn',
  title: '身体转面',
  sub: '人一转身，左手右手跟着转，可是东南西北钉在原地不动。',
  grade: 3,
  kind: '模拟',
  points: ['3.9'],
  render: function (el) {
    var K = 'm39-turn';
    var DIRS = ['北', '东', '南', '西'];
    var ARROWS = ['↑', '→', '↓', '←'];
    var LEVELS = [
      { label: '基础', start: 0, turnsText: '向右转 1 次', expect: 1, answer: 0 },
      { label: '提高', start: 1, turnsText: '向后转', expect: 3, answer: 2 },
      { label: '挑战', start: 2, turnsText: '向左转 2 次', expect: 0, answer: 3 }
    ];
    var levelIdx = 0, guessed = -1, facing = 0, history = [], done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 3 年级 · 位置与方向</p>' +
      '<h3>身体转面</h3>' +
      '<p>先面朝一个方向站好，再按题目转身：左手右手会跟着你转，东南西北四个字钉在原地不动。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span>之后，你的左手边是哪个方向？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button">北</button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button">东</button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button">南</button>' +
      '<button class="btn small primary" id="' + K + '-g-3" type="button">西</button></div>' +
      '<p>第 2 步 · 转一转：</p>' +
      '<div style="position:relative;width:280px;height:200px;border:2px solid #334155;border-radius:10px;margin:8px 0;">' +
      '<span style="position:absolute;left:125px;top:2px;">北</span>' +
      '<span style="position:absolute;right:4px;top:88px;">东</span>' +
      '<span style="position:absolute;left:125px;bottom:2px;">南</span>' +
      '<span style="position:absolute;left:4px;top:88px;">西</span>' +
      '<span id="' + K + '-me" style="position:absolute;left:125px;top:80px;font-size:30px;">↑</span></div>' +
      '<p id="' + K + '-now"></p>' +
      '<p id="' + K + '-hist">已转：还没转。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-left" type="button">向左转</button>' +
      '<button class="btn small ghost" id="' + K + '-right" type="button">向右转</button>' +
      '<button class="btn small ghost" id="' + K + '-back" type="button">向后转</button>' +
      '<button class="btn small primary" id="' + K + '-check" type="button">对一对</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再转身。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 面北，右转 1 次</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 面东，向后转</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 面南，左转 2 次</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都转对，并且能说出“人转身，左右跟着转，东南西北不动”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function leftOf(f) { return (f + 3) % 4; }
    function rightOf(f) { return (f + 1) % 4; }
    function drawMe() {
      var me = gid(K + '-me');
      if (me) me.textContent = ARROWS[facing];
      var nw = gid(K + '-now');
      if (nw) nw.textContent = '我现在面朝' + DIRS[facing] + '，左手是' + DIRS[leftOf(facing)] + '，右手是' + DIRS[rightOf(facing)] + '。';
      var hs = gid(K + '-hist');
      if (hs) hs.textContent = '已转：' + (history.length ? history.join('、') : '还没转。');
    }
    function resetRound() {
      guessed = -1; facing = lv().start; history = []; done = false;
      var q = gid(K + '-q');
      if (q) q.textContent = '从面朝' + DIRS[lv().start] + '出发，' + lv().turnsText;
      for (var i = 0; i < 4; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = false; }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再转身。');
      drawMe();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 4; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      msg('你猜转完后左手是' + DIRS[g] + '。转一转，再对一对。');
    }
    function turn(d, name) {
      if (done) return;
      facing = (facing + d + 4) % 4;
      history.push(name);
      drawMe();
    }
    function check() {
      if (guessed < 0) { msg('先猜一猜：转完后左手是哪个方向？'); return; }
      if (done) return;
      if (facing !== lv().expect) {
        msg('你现在面朝' + DIRS[facing] + '，题目是从面朝' + DIRS[lv().start] + '出发、' + lv().turnsText + '，转完应该面朝' + DIRS[lv().expect] + '。再转一转。');
        return;
      }
      done = true;
      var ok = guessed === lv().answer;
      msg('转对了：现在面朝' + DIRS[facing] + '，左手是' + DIRS[leftOf(facing)] + '，右手是' + DIRS[rightOf(facing)] + '。' +
        (ok ? '你猜对了！' : '你刚才猜左手是' + DIRS[guessed] + '，其实是' + DIRS[lv().answer] + '。') +
        '人转身，左右跟着转，东南西北钉在原地不动。');
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-g-3').addEventListener('click', function () { onGuess(3); });
    gid(K + '-left').addEventListener('click', function () { turn(3, '向左转'); });
    gid(K + '-right').addEventListener('click', function () { turn(1, '向右转'); });
    gid(K + '-back').addEventListener('click', function () { turn(2, '向后转'); });
    gid(K + '-check').addEventListener('click', check);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：面北右转 1 次，左手是北', '提高：面东向后转，左手是南', '挑战：面南左转 2 次，左手是西'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

/* ---------- 3.15a 复式统计表 ---------- */
registerAnim({
  key: 'm315a-table',
  title: '双向表填格+合计校验',
  sub: '每格一个数：行合计、列合计都等于总数，对不上合计格立刻变红。',
  grade: 3,
  kind: '模拟',
  points: ['3.15a'],
  render: function (el) {
    var K = 'm315a-table';
    var LEVELS = [
      { label: '基础', pre: { mr: 8, mj: 4, fr: 5, fj: null }, tru: { mr: 8, mj: 4, fr: 5, fj: 13 }, guessCell: 'fj', guessName: '女生喜欢跳绳', guess: [11, 13, 15], totM: 12, totF: 18, totR: 13, totJ: 17, tot: 30 },
      { label: '提高', pre: { mr: 6, mj: null, fr: 10, fj: null }, tru: { mr: 6, mj: 9, fr: 10, fj: 5 }, guessCell: 'mj', guessName: '男生喜欢跳绳', guess: [7, 9, 11], totM: 15, totF: 15, totR: 16, totJ: 14, tot: 30 },
      { label: '挑战', pre: { mr: 12, mj: null, fr: null, fj: 13 }, tru: { mr: 12, mj: 8, fr: 7, fj: 13 }, guessCell: 'mj', guessName: '男生喜欢跳绳', guess: [6, 8, 10], totM: 20, totF: 20, totR: 19, totJ: 21, tot: 40 }
    ];
    var CELLS = ['mr', 'mj', 'fr', 'fj'];
    var CELLNAME = { mr: '男生喜欢跑步', mj: '男生喜欢跳绳', fr: '女生喜欢跑步', fj: '女生喜欢跳绳' };
    var levelIdx = 0, guessed = 0, vals = {}, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 3 年级 · 复式统计表</p>' +
      '<h3>双向表填格+合计校验</h3>' +
      '<p>喜欢跑步、跳绳的男生女生各有多少人？空格里的数自己填：行合计、列合计、总数要全部对上，对不上就变红。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-q"></span>该填几？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 填一填（点 − ＋ 调空格里的数），合计会自己算：</p>' +
      '<div id="' + K + '-table"></div>' +
      '<p id="' + K + '-targets"></p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-check" type="button">对一对</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再填一填。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 1 个空格</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 2 个空格</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 2 个空格</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档的表都填对，行合计、列合计、总数全部对上。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function cellHtml(c) {
      if (lv().pre[c] !== null) return '<b>' + lv().pre[c] + '</b>';
      return '<button class="btn small ghost" id="' + K + '-' + c + '-minus" type="button">−</button>' +
        '<b id="' + K + '-v-' + c + '">0</b>' +
        '<button class="btn small ghost" id="' + K + '-' + c + '-plus" type="button">＋</button>';
    }
    function buildTable() {
      var t = gid(K + '-table');
      if (!t) return;
      t.innerHTML =
        '<table style="border-collapse:collapse;text-align:center;">' +
        '<tr><td style="border:1px solid #94a3b8;padding:6px 10px;"></td><td style="border:1px solid #94a3b8;padding:6px 10px;"><b>跑步</b></td><td style="border:1px solid #94a3b8;padding:6px 10px;"><b>跳绳</b></td><td style="border:1px solid #94a3b8;padding:6px 10px;"><b>合计</b></td></tr>' +
        '<tr><td style="border:1px solid #94a3b8;padding:6px 10px;"><b>男生</b></td><td style="border:1px solid #94a3b8;padding:6px 10px;">' + cellHtml('mr') + '</td><td style="border:1px solid #94a3b8;padding:6px 10px;">' + cellHtml('mj') + '</td><td style="border:1px solid #94a3b8;padding:6px 10px;"><b id="' + K + '-t-m"></b></td></tr>' +
        '<tr><td style="border:1px solid #94a3b8;padding:6px 10px;"><b>女生</b></td><td style="border:1px solid #94a3b8;padding:6px 10px;">' + cellHtml('fr') + '</td><td style="border:1px solid #94a3b8;padding:6px 10px;">' + cellHtml('fj') + '</td><td style="border:1px solid #94a3b8;padding:6px 10px;"><b id="' + K + '-t-f"></b></td></tr>' +
        '<tr><td style="border:1px solid #94a3b8;padding:6px 10px;"><b>合计</b></td><td style="border:1px solid #94a3b8;padding:6px 10px;"><b id="' + K + '-t-r"></b></td><td style="border:1px solid #94a3b8;padding:6px 10px;"><b id="' + K + '-t-j"></b></td><td style="border:1px solid #94a3b8;padding:6px 10px;"><b id="' + K + '-t-all"></b></td></tr></table>';
      CELLS.forEach(function (c) {
        if (lv().pre[c] !== null) return;
        var mn = gid(K + '-' + c + '-minus'), pl = gid(K + '-' + c + '-plus');
        if (mn) mn.addEventListener('click', function () { bump(c, -1); });
        if (pl) pl.addEventListener('click', function () { bump(c, 1); });
      });
    }
    function paintTotal(id, got, want) {
      var s = gid(id);
      if (!s) return;
      s.textContent = String(got);
      s.style.color = got === want ? '#15803d' : '#dc2626';
    }
    function updateTotals() {
      CELLS.forEach(function (c) { var v = gid(K + '-v-' + c); if (v) v.textContent = String(vals[c]); });
      paintTotal(K + '-t-m', vals.mr + vals.mj, lv().totM);
      paintTotal(K + '-t-f', vals.fr + vals.fj, lv().totF);
      paintTotal(K + '-t-r', vals.mr + vals.fr, lv().totR);
      paintTotal(K + '-t-j', vals.mj + vals.fj, lv().totJ);
      paintTotal(K + '-t-all', vals.mr + vals.mj + vals.fr + vals.fj, lv().tot);
    }
    function bump(c, d) {
      if (done) return;
      vals[c] = Math.max(0, Math.min(30, vals[c] + d));
      updateTotals();
    }
    function resetRound() {
      guessed = 0; done = false;
      vals = {};
      CELLS.forEach(function (c) { vals[c] = lv().pre[c] === null ? 0 : lv().pre[c]; });
      var gq = gid(K + '-guess-q'); if (gq) gq.textContent = lv().guessName;
      for (var i = 0; i < 3; i++) {
        var gb = gid(K + '-g-' + i);
        if (gb) { gb.textContent = lv().guess[i] + ' 人'; gb.disabled = false; }
      }
      var tg = gid(K + '-targets');
      if (tg) tg.textContent = '目标：男生 ' + lv().totM + ' 人，女生 ' + lv().totF + ' 人，跑步 ' + lv().totR + ' 人，跳绳 ' + lv().totJ + ' 人，总数 ' + lv().tot + ' 人。绿色 = 对上了，红色 = 对不上。';
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      buildTable();
      updateTotals();
      msg('先猜一猜，再填一填。');
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      msg('你猜' + lv().guessName + '是 ' + g + ' 人。填一填，看看合计对不对得上。');
    }
    function check() {
      if (!guessed) { msg('先猜一猜：' + lv().guessName + '该填几？'); return; }
      if (done) return;
      var bad = [];
      CELLS.forEach(function (c) { if (vals[c] !== lv().tru[c]) bad.push(CELLNAME[c]); });
      if (!bad.length) {
        done = true;
        var ok = guessed === lv().tru[lv().guessCell];
        msg('全对上了：男生 ' + lv().totM + ' 人，女生 ' + lv().totF + ' 人，跑步 ' + lv().totR + ' 人，跳绳 ' + lv().totJ + ' 人，总数 ' + lv().tot + ' 人。' +
          (ok ? '你猜对了！' : '你刚才猜' + lv().guessName + '是 ' + guessed + ' 人，其实是 ' + lv().tru[lv().guessCell] + ' 人。') +
          '行合计、列合计、总数，三处必须都对上。');
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
        return;
      }
      var m = vals.mr + vals.mj, f = vals.fr + vals.fj, r = vals.mr + vals.fr, j = vals.mj + vals.fj;
      var all = vals.mr + vals.mj + vals.fr + vals.fj;
      if (m !== lv().totM) msg('男生的合计是 ' + m + ' 人，应该是 ' + lv().totM + ' 人——再调一调。');
      else if (f !== lv().totF) msg('女生的合计是 ' + f + ' 人，应该是 ' + lv().totF + ' 人——再调一调。');
      else if (r !== lv().totR) msg('喜欢跑步的合计是 ' + r + ' 人，应该是 ' + lv().totR + ' 人——再调一调。');
      else if (j !== lv().totJ) msg('喜欢跳绳的合计是 ' + j + ' 人，应该是 ' + lv().totJ + ' 人——再调一调。');
      else if (all !== lv().tot) msg('总数是 ' + all + ' 人，应该是 ' + lv().tot + ' 人——再调一调。');
      else msg('合计都对上了，可是格子里的数还不对：' + bad.join('、') + '再想想。');
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(lv().guess[0]); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(lv().guess[1]); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(lv().guess[2]); });
    gid(K + '-check').addEventListener('click', check);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：填对 1 个空格，总数 30', '提高：填对 2 个空格，总数 30', '挑战：填对 2 个空格，总数 40'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm315a-merge',
  title: '单表拼成复表',
  sub: '男生一张表、女生一张表，并排拼成一张复表，对照着看才方便。',
  grade: 3,
  kind: '演示',
  points: ['3.15a'],
  render: function (el) {
    var K = 'm315a-merge';
    var LEVELS = [
      { label: '基础', m: { r: 8, j: 4 }, f: { r: 5, j: 13 }, ask: '跑步', answer: 13, guess: [11, 13, 15] },
      { label: '提高', m: { r: 6, j: 9 }, f: { r: 10, j: 5 }, ask: '跳绳', answer: 14, guess: [12, 14, 16] },
      { label: '挑战', m: { r: 12, j: 8 }, f: { r: 7, j: 13 }, ask: '跑步', answer: 19, guess: [17, 19, 21] }
    ];
    var levelIdx = 0, guessed = 0, merged = false, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 3 年级 · 复式统计表</p>' +
      '<h3>单表拼成复表</h3>' +
      '<p>男生一张表，女生一张表，各看各的很麻烦。拼成一张复表，同一行一比就知道谁多。</p>' +
      '<p>第 1 步 · 先猜：喜欢<span id="' + K + '-ask-q"></span>的一共多少人？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 拼一拼：</p>' +
      '<div id="' + K + '-singles"></div>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-merge-btn" type="button">拼成一张复表</button></div>' +
      '<div id="' + K + '-merged"></div>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-check" type="button">对一对</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再拼一拼。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 跑步共几人</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 跳绳共几人</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 跑步共几人</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都拼对，并且能说出“复表就是把两张单表拼成一张”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function miniTable(title, r, j) {
      return '<table style="border-collapse:collapse;text-align:center;display:inline-block;margin:0 12px 8px 0;">' +
        '<tr><td style="border:1px solid #94a3b8;padding:6px 10px;" colspan="2"><b>' + title + '</b></td></tr>' +
        '<tr><td style="border:1px solid #94a3b8;padding:6px 10px;">跑步</td><td style="border:1px solid #94a3b8;padding:6px 10px;">' + r + ' 人</td></tr>' +
        '<tr><td style="border:1px solid #94a3b8;padding:6px 10px;">跳绳</td><td style="border:1px solid #94a3b8;padding:6px 10px;">' + j + ' 人</td></tr></table>';
    }
    function resetRound() {
      guessed = 0; merged = false; done = false;
      var aq = gid(K + '-ask-q'); if (aq) aq.textContent = lv().ask;
      for (var i = 0; i < 3; i++) {
        var gb = gid(K + '-g-' + i);
        if (gb) { gb.textContent = lv().guess[i] + ' 人'; gb.disabled = false; }
      }
      var s = gid(K + '-singles');
      if (s) s.innerHTML = miniTable('男生', lv().m.r, lv().m.j) + miniTable('女生', lv().f.r, lv().f.j);
      var mg = gid(K + '-merged'); if (mg) mg.innerHTML = '';
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再拼一拼。');
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      msg('你猜喜欢' + lv().ask + '的一共 ' + g + ' 人。拼成复表，再对一对。');
    }
    function merge() {
      if (done) return;
      merged = true;
      var mg = gid(K + '-merged');
      if (!mg) return;
      var totR = lv().m.r + lv().f.r, totJ = lv().m.j + lv().f.j;
      mg.innerHTML =
        '<table style="border-collapse:collapse;text-align:center;margin-top:8px;">' +
        '<tr><td style="border:1px solid #94a3b8;padding:6px 10px;"></td><td style="border:1px solid #94a3b8;padding:6px 10px;"><b>跑步</b></td><td style="border:1px solid #94a3b8;padding:6px 10px;"><b>跳绳</b></td><td style="border:1px solid #94a3b8;padding:6px 10px;"><b>合计</b></td></tr>' +
        '<tr><td style="border:1px solid #94a3b8;padding:6px 10px;"><b>男生</b></td><td style="border:1px solid #94a3b8;padding:6px 10px;">' + lv().m.r + '</td><td style="border:1px solid #94a3b8;padding:6px 10px;">' + lv().m.j + '</td><td style="border:1px solid #94a3b8;padding:6px 10px;"><b>' + (lv().m.r + lv().m.j) + '</b></td></tr>' +
        '<tr><td style="border:1px solid #94a3b8;padding:6px 10px;"><b>女生</b></td><td style="border:1px solid #94a3b8;padding:6px 10px;">' + lv().f.r + '</td><td style="border:1px solid #94a3b8;padding:6px 10px;">' + lv().f.j + '</td><td style="border:1px solid #94a3b8;padding:6px 10px;"><b>' + (lv().f.r + lv().f.j) + '</b></td></tr>' +
        '<tr><td style="border:1px solid #94a3b8;padding:6px 10px;"><b>合计</b></td><td style="border:1px solid #94a3b8;padding:6px 10px;"><b>' + totR + '</b></td><td style="border:1px solid #94a3b8;padding:6px 10px;"><b>' + totJ + '</b></td><td style="border:1px solid #94a3b8;padding:6px 10px;"><b>' + (totR + totJ) + '</b></td></tr></table>';
      msg('拼好了：同一列一加就是合计。喜欢' + lv().ask + '的，男生加女生一共多少人？');
    }
    function check() {
      if (!guessed) { msg('先猜一猜：喜欢' + lv().ask + '的一共多少人？'); return; }
      if (done) return;
      if (!merged) { msg('先点“拼成一张复表”，合计列会自己算出来。'); return; }
      done = true;
      var ok = guessed === lv().answer;
      var part = lv().ask === '跑步' ? lv().m.r + ' + ' + lv().f.r : lv().m.j + ' + ' + lv().f.j;
      msg('复表里，喜欢' + lv().ask + '的一共 ' + part + ' = ' + lv().answer + ' 人。' +
        (ok ? '你猜对了！' : '你刚才猜的是 ' + guessed + ' 人，再看一遍合计列。') +
        '两张单表拼成一张复表，同一列加起来就是合计。');
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(lv().guess[0]); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(lv().guess[1]); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(lv().guess[2]); });
    gid(K + '-merge-btn').addEventListener('click', merge);
    gid(K + '-check').addEventListener('click', check);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：跑步一共 13 人', '提高：跳绳一共 14 人', '挑战：跑步一共 19 人'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm315a-missing',
  title: '总数倒推缺失格',
  sub: '总数减去已经知道的格子，空格里的数就倒推出来了。',
  grade: 3,
  kind: '实验',
  points: ['3.15a'],
  render: function (el) {
    var K = 'm315a-missing';
    var LEVELS = [
      { label: '基础', total: 30, cells: { mr: 8, mj: 4, fr: 5, fj: null }, missing: 'fj', missingName: '女生喜欢跳绳', answer: 13, guess: [11, 13, 15] },
      { label: '提高', total: 30, cells: { mr: 6, mj: 9, fr: 10, fj: null }, missing: 'fj', missingName: '女生喜欢跳绳', answer: 5, guess: [3, 5, 7] },
      { label: '挑战', total: 40, cells: { mr: 12, mj: 8, fr: 7, fj: null }, missing: 'fj', missingName: '女生喜欢跳绳', answer: 13, guess: [11, 13, 15] }
    ];
    var CELLNAME = { mr: '男生喜欢跑步', mj: '男生喜欢跳绳', fr: '女生喜欢跑步', fj: '女生喜欢跳绳' };
    var levelIdx = 0, guessed = 0, revealed = false, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 3 年级 · 复式统计表</p>' +
      '<h3>总数倒推缺失格</h3>' +
      '<p>表里有个空格，不知道是多少。别瞎猜：总数减去已经知道的格子，空格就倒推出来了。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-q"></span>是多少人？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 倒推：总数是 <b id="' + K + '-total"></b> 人，表是这样的——</p>' +
      '<div id="' + K + '-table"></div>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-solve" type="button">倒推一下</button></div>' +
      '<p id="' + K + '-steps"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再倒推。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 总数 30</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 总数 30</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 总数 40</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都倒推出空格，并且能说出“总数减已知就是空格”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function knownSum() {
      var s = 0;
      ['mr', 'mj', 'fr', 'fj'].forEach(function (c) { if (lv().cells[c] !== null) s += lv().cells[c]; });
      return s;
    }
    function knownParts() {
      var parts = [];
      ['mr', 'mj', 'fr', 'fj'].forEach(function (c) { if (lv().cells[c] !== null) parts.push(CELLNAME[c] + ' ' + lv().cells[c] + ' 人'); });
      return parts.join('、');
    }
    function cellHtml(c) {
      if (lv().cells[c] !== null) return '<b>' + lv().cells[c] + '</b>';
      return '<b id="' + K + '-miss" style="color:#dc2626;">？</b>';
    }
    function resetRound() {
      guessed = 0; revealed = false; done = false;
      var gq = gid(K + '-guess-q'); if (gq) gq.textContent = lv().missingName;
      for (var i = 0; i < 3; i++) {
        var gb = gid(K + '-g-' + i);
        if (gb) { gb.textContent = lv().guess[i] + ' 人'; gb.disabled = false; }
      }
      var tt = gid(K + '-total'); if (tt) tt.textContent = String(lv().total);
      var t = gid(K + '-table');
      if (t) {
        t.innerHTML =
          '<table style="border-collapse:collapse;text-align:center;">' +
          '<tr><td style="border:1px solid #94a3b8;padding:6px 10px;"></td><td style="border:1px solid #94a3b8;padding:6px 10px;"><b>跑步</b></td><td style="border:1px solid #94a3b8;padding:6px 10px;"><b>跳绳</b></td></tr>' +
          '<tr><td style="border:1px solid #94a3b8;padding:6px 10px;"><b>男生</b></td><td style="border:1px solid #94a3b8;padding:6px 10px;">' + cellHtml('mr') + '</td><td style="border:1px solid #94a3b8;padding:6px 10px;">' + cellHtml('mj') + '</td></tr>' +
          '<tr><td style="border:1px solid #94a3b8;padding:6px 10px;"><b>女生</b></td><td style="border:1px solid #94a3b8;padding:6px 10px;">' + cellHtml('fr') + '</td><td style="border:1px solid #94a3b8;padding:6px 10px;">' + cellHtml('fj') + '</td></tr></table>';
      }
      var st = gid(K + '-steps'); if (st) st.textContent = '';
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再倒推。');
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      msg('你猜' + lv().missingName + '是 ' + g + ' 人。点“倒推一下”验算。');
    }
    function solve() {
      if (!guessed) { msg('先猜一猜：' + lv().missingName + '是多少人？'); return; }
      if (done) return;
      revealed = true; done = true;
      var ks = knownSum();
      var st = gid(K + '-steps');
      if (st) st.textContent = '倒推：总数 ' + lv().total + ' − 已知 ' + ks + '（' + knownParts() + '）= ' + lv().answer + '。';
      var miss = gid(K + '-miss');
      if (miss) { miss.textContent = String(lv().answer); miss.style.color = '#15803d'; }
      var ok = guessed === lv().answer;
      msg('空格是 ' + lv().answer + ' 人：' + lv().total + ' − ' + ks + ' = ' + lv().answer + '。' +
        (ok ? '你猜对了！' : '你刚才猜的是 ' + guessed + ' 人，倒推出来是 ' + lv().answer + ' 人。') +
        '总数减去已经知道的，就是空格。');
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(lv().guess[0]); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(lv().guess[1]); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(lv().guess[2]); });
    gid(K + '-solve').addEventListener('click', solve);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：30 − 17 = 13', '提高：30 − 25 = 5', '挑战：40 − 27 = 13'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

/* ---------- 3.15b 搭配（二） ---------- */
registerAnim({
  key: 'm315b-array',
  title: '搭配阵列数格子',
  sub: '上衣排成行、裤子排成列，格子数就是搭配数——加法会少算。',
  grade: 3,
  kind: '模拟',
  points: ['3.15b'],
  render: function (el) {
    var K = 'm315b-array';
    var TOPNAMES = ['红上衣', '黄上衣', '蓝上衣', '绿上衣'];
    var BOTNAMES = ['蓝裤子', '黑裤子', '白裤子', '灰裤子'];
    var LEVELS = [
      { label: '基础', tops: 2, bottoms: 3, guess: [5, 6, 8] },
      { label: '提高', tops: 3, bottoms: 3, guess: [6, 9, 12] },
      { label: '挑战', tops: 4, bottoms: 2, guess: [6, 8, 10] }
    ];
    var levelIdx = 0, guessed = 0, tops = 2, bottoms = 3, marked = {}, custom = false, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 3 年级 · 搭配（二）</p>' +
      '<h3>搭配阵列数格子</h3>' +
      '<p>上衣排成行，裤子排成列，一个格子就是一种搭配。点一点格子，数一数一共有多少种。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span>能配出几种？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 点格子数一数：</p>' +
      '<p>上衣 <button class="btn small ghost" id="' + K + '-tops-minus" type="button">−</button><b id="' + K + '-tops-n"></b><button class="btn small ghost" id="' + K + '-tops-plus" type="button">＋</button>　' +
      '裤子 <button class="btn small ghost" id="' + K + '-bots-minus" type="button">−</button><b id="' + K + '-bots-n"></b><button class="btn small ghost" id="' + K + '-bots-plus" type="button">＋</button></p>' +
      '<div id="' + K + '-grid"></div>' +
      '<p id="' + K + '-count"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点格子。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 2 件上衣 × 3 条裤子</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 3 × 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 4 × 2</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档的格子都点完，并且能说出“搭配数是乘出来的，不是加出来的”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function total() { return tops * bottoms; }
    function markedCount() {
      var n = 0;
      for (var k in marked) { if (marked[k]) n++; }
      return n;
    }
    function drawGrid() {
      var g = gid(K + '-grid');
      if (!g) return;
      var tn = gid(K + '-tops-n'); if (tn) tn.textContent = String(tops) + ' 件';
      var bn = gid(K + '-bots-n'); if (bn) bn.textContent = String(bottoms) + ' 条';
      var h = '<table style="border-collapse:collapse;text-align:center;">';
      h += '<tr><td style="border:1px solid #94a3b8;padding:6px 8px;"></td>';
      for (var j = 0; j < bottoms; j++) h += '<td style="border:1px solid #94a3b8;padding:6px 8px;"><b>' + BOTNAMES[j] + '</b></td>';
      h += '</tr>';
      for (var i = 0; i < tops; i++) {
        h += '<tr><td style="border:1px solid #94a3b8;padding:6px 8px;"><b>' + TOPNAMES[i] + '</b></td>';
        for (var jj = 0; jj < bottoms; jj++) {
          var on = !!marked[i + '-' + jj];
          h += '<td style="border:1px solid #94a3b8;padding:6px 8px;"><button class="btn small ghost" id="' + K + '-cell-' + i + '-' + jj + '" type="button" style="' + (on ? 'background:#dcfce7;border-color:#15803d;color:#15803d;' : '') + '">' + (on ? '✓' : '点') + '</button></td>';
        }
        h += '</tr>';
      }
      h += '</table>';
      g.innerHTML = h;
      for (var a = 0; a < tops; a++) {
        for (var b = 0; b < bottoms; b++) {
          (function (a, b) {
            var c = gid(K + '-cell-' + a + '-' + b);
            if (c) c.addEventListener('click', function () { toggleCell(a, b); });
          })(a, b);
        }
      }
      var c = gid(K + '-count');
      if (c) c.textContent = '已数 ' + markedCount() + ' / ' + total() + ' 格。';
      var q = gid(K + '-q');
      if (q) q.textContent = tops + ' 件上衣、' + bottoms + ' 条裤子';
    }
    function toggleCell(i, j) {
      if (!guessed) { msg('先猜一猜：能配出几种？'); return; }
      if (done) return;
      var k = i + '-' + j;
      marked[k] = !marked[k];
      drawGrid();
      if (markedCount() === total()) {
        done = true;
        var ok = guessed === total();
        msg('点完了：格子数 ' + total() + ' = 搭配数 ' + total() + ' 种。' +
          (ok ? '你猜对了！' : '你刚才猜的是 ' + guessed + ' 种，格子数了 ' + total() + ' 格。') +
          '如果用加法 ' + tops + ' + ' + bottoms + ' = ' + (tops + bottoms) + '，会少算 ' + (total() - tops - bottoms) + ' 种。');
        if (!custom && tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('已数 ' + markedCount() + ' 格，还差 ' + (total() - markedCount()) + ' 格。');
      }
    }
    function resetRound() {
      guessed = 0; tops = lv().tops; bottoms = lv().bottoms; marked = {}; custom = false; done = false;
      for (var i = 0; i < 3; i++) {
        var gb = gid(K + '-g-' + i);
        if (gb) { gb.textContent = lv().guess[i] + ' 种'; gb.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再点格子。');
      drawGrid();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      msg('你猜能配出 ' + g + ' 种。点一点格子，数一数。');
    }
    function bumpTops(d) {
      tops = Math.max(1, Math.min(4, tops + d));
      marked = {}; custom = true; done = false;
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', 'false'); }
      msg('自己出题：' + tops + ' 件上衣、' + bottoms + ' 条裤子。先猜，再点格子。');
      drawGrid();
    }
    function bumpBots(d) {
      bottoms = Math.max(1, Math.min(4, bottoms + d));
      marked = {}; custom = true; done = false;
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', 'false'); }
      msg('自己出题：' + tops + ' 件上衣、' + bottoms + ' 条裤子。先猜，再点格子。');
      drawGrid();
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(lv().guess[0]); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(lv().guess[1]); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(lv().guess[2]); });
    gid(K + '-tops-minus').addEventListener('click', function () { bumpTops(-1); });
    gid(K + '-tops-plus').addEventListener('click', function () { bumpTops(1); });
    gid(K + '-bots-minus').addEventListener('click', function () { bumpBots(-1); });
    gid(K + '-bots-plus').addEventListener('click', function () { bumpBots(1); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：2 × 3 = 6 种', '提高：3 × 3 = 9 种', '挑战：4 × 2 = 8 种'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm315b-tree',
  title: '树形图分叉',
  sub: '每选一步分一次叉：先分上衣，再分裤子，数一数叶子就知道有几种搭配。',
  grade: 3,
  kind: '演示',
  points: ['3.15b'],
  render: function (el) {
    var K = 'm315b-tree';
    var TOPNAMES = ['红上衣', '黄上衣', '蓝上衣'];
    var TOPSHORT = ['红', '黄', '蓝'];
    var BOTNAMES = ['蓝裤子', '黑裤子', '白裤子'];
    var BOTSHORT = ['蓝', '黑', '白'];
    var LEVELS = [
      { label: '基础', tops: 2, bottoms: 2, guess: [3, 4, 5] },
      { label: '提高', tops: 3, bottoms: 2, guess: [5, 6, 8] },
      { label: '挑战', tops: 3, bottoms: 3, guess: [8, 9, 12] }
    ];
    var levelIdx = 0, guessed = 0, expanded = {}, marked = {}, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 3 年级 · 搭配（二）</p>' +
      '<h3>树形图分叉</h3>' +
      '<p>从“开始”出发，先选一件上衣分一次叉，再选一条裤子又分一次叉。点上衣让树枝长出来，点叶子数一数。</p>' +
      '<p>第 1 步 · 先猜：这棵树最后有几片叶子（几种搭配）？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 点上衣长树枝，点叶子数搭配：</p>' +
      '<div id="' + K + '-tree"></div>' +
      '<div class="btn-row"><button class="btn small ghost" id="' + K + '-grow-all" type="button">让整棵树长出来</button></div>' +
      '<p id="' + K + '-count"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点一点。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 2 × 2</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 3 × 2</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 3 × 3</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档的叶子都点完，并且能说出“叶子数就是搭配数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function total() { return lv().tops * lv().bottoms; }
    function markedCount() {
      var n = 0;
      for (var k in marked) { if (marked[k]) n++; }
      return n;
    }
    function leafY(i, j) { return 34 + (i * lv().bottoms + j) * 38; }
    function topY(i) { return (leafY(i, 0) + leafY(i, lv().bottoms - 1)) / 2; }
    function drawTree() {
      var box = gid(K + '-tree');
      if (!box) return;
      var leaves = total();
      var hgt = 34 + leaves * 38 + 16;
      var cy = (leafY(0, 0) + leafY(lv().tops - 1, lv().bottoms - 1)) / 2;
      var h = '<svg width="560" height="' + hgt + '" viewBox="0 0 560 ' + hgt + '">';
      for (var i = 0; i < lv().tops; i++) {
        h += '<line x1="70" y1="' + cy + '" x2="190" y2="' + topY(i) + '" stroke="#94a3b8" stroke-width="2"></line>';
        if (expanded[i]) {
          for (var j = 0; j < lv().bottoms; j++) {
            h += '<line x1="230" y1="' + topY(i) + '" x2="390" y2="' + leafY(i, j) + '" stroke="#94a3b8" stroke-width="2"></line>';
          }
        }
      }
      h += '<g id="' + K + '-root"><circle cx="50" cy="' + cy + '" r="18" fill="#fde68a" stroke="#d97706" stroke-width="2"></circle><text x="50" y="' + (cy + 5) + '" font-size="13" text-anchor="middle">开始</text></g>';
      for (var a = 0; a < lv().tops; a++) {
        h += '<g id="' + K + '-top-' + a + '"><circle cx="210" cy="' + topY(a) + '" r="18" fill="' + (expanded[a] ? '#fde68a' : '#fff') + '" stroke="#d97706" stroke-width="2"></circle><text x="210" y="' + (topY(a) + 5) + '" font-size="13" text-anchor="middle">' + TOPSHORT[a] + '</text></g>';
        if (expanded[a]) {
          for (var b = 0; b < lv().bottoms; b++) {
            var on = !!marked[a + '-' + b];
            h += '<g id="' + K + '-leaf-' + a + '-' + b + '"><circle cx="410" cy="' + leafY(a, b) + '" r="16" fill="' + (on ? '#dcfce7' : '#fff') + '" stroke="' + (on ? '#15803d' : '#94a3b8') + '" stroke-width="2"></circle><text x="410" y="' + (leafY(a, b) + 5) + '" font-size="12" text-anchor="middle">' + TOPSHORT[a] + '+' + BOTSHORT[b] + '</text></g>';
          }
        }
      }
      h += '</svg>';
      h += '<p style="color:#64748b;font-size:13px;">点圆圈：点上衣长出树枝，点叶子打勾计数。叶子上写的是搭配：红+蓝就是“红上衣配蓝裤子”。</p>';
      box.innerHTML = h;
      for (var c = 0; c < lv().tops; c++) {
        (function (c) {
          var n = gid(K + '-top-' + c);
          if (n) n.addEventListener('click', function () { expandTop(c); });
          if (expanded[c]) {
            for (var d = 0; d < lv().bottoms; d++) {
              (function (d) {
                var lf = gid(K + '-leaf-' + c + '-' + d);
                if (lf) lf.addEventListener('click', function () { toggleLeaf(c, d); });
              })(d);
            }
          }
        })(c);
      }
      var ct = gid(K + '-count');
      if (ct) ct.textContent = '叶子：已点 ' + markedCount() + ' / ' + total() + ' 片。';
    }
    function expandTop(i) {
      if (!guessed) { msg('先猜一猜：这棵树最后有几片叶子？'); return; }
      if (done) return;
      expanded[i] = true;
      drawTree();
      msg(TOPNAMES[i] + '长出 ' + lv().bottoms + ' 根树枝：能配 ' + lv().bottoms + ' 条裤子。点一点叶子。');
    }
    function toggleLeaf(i, j) {
      if (!guessed) { msg('先猜一猜：这棵树最后有几片叶子？'); return; }
      if (done) return;
      var k = i + '-' + j;
      marked[k] = !marked[k];
      drawTree();
      if (markedCount() === total()) {
        done = true;
        var ok = guessed === total();
        msg('数完了：叶子 ' + total() + ' 片 = 搭配 ' + total() + ' 种。' +
          (ok ? '你猜对了！' : '你刚才猜的是 ' + guessed + ' 片，树上长了 ' + total() + ' 片叶子。') +
          '每分一次叉，叶子就多一倍：' + lv().tops + ' 件上衣 × ' + lv().bottoms + ' 条裤子 = ' + total() + ' 种。');
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('已点 ' + markedCount() + ' 片叶子，还差 ' + (total() - markedCount()) + ' 片。');
      }
    }
    function resetRound() {
      guessed = 0; expanded = {}; marked = {}; done = false;
      for (var i = 0; i < 3; i++) {
        var gb = gid(K + '-g-' + i);
        if (gb) { gb.textContent = lv().guess[i] + ' 片'; gb.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再点一点。');
      drawTree();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      msg('你猜最后有 ' + g + ' 片叶子。点上衣，让树长出来。');
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(lv().guess[0]); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(lv().guess[1]); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(lv().guess[2]); });
    gid(K + '-grow-all').addEventListener('click', function () {
      if (!guessed) { msg('先猜一猜：这棵树最后有几片叶子？'); return; }
      if (done) return;
      for (var i = 0; i < lv().tops; i++) expanded[i] = true;
      drawTree();
      msg('整棵树都长出来了：' + lv().tops + ' 件上衣，每件分出 ' + lv().bottoms + ' 根树枝。点一点叶子。');
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：2 × 2 = 4 片叶子', '提高：3 × 2 = 6 片叶子', '挑战：3 × 3 = 9 片叶子'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm315b-fix',
  title: '固定一件数一遍',
  sub: '先固定一件上衣，数它能配几条裤子，再换下一件——数完加起来就是总数。',
  grade: 3,
  kind: '实验',
  points: ['3.15b'],
  render: function (el) {
    var K = 'm315b-fix';
    var TOPNAMES = ['红上衣', '黄上衣', '蓝上衣'];
    var BOTNAMES = ['蓝裤子', '黑裤子', '白裤子'];
    var LEVELS = [
      { label: '基础', tops: 2, bottoms: 3, guess: [5, 6, 9] },
      { label: '提高', tops: 3, bottoms: 2, guess: [5, 6, 8] },
      { label: '挑战', tops: 3, bottoms: 3, guess: [8, 9, 12] }
    ];
    var levelIdx = 0, guessed = 0, fixed = 0, counted = {}, doneTops = {}, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 3 年级 · 搭配（二）</p>' +
      '<h3>固定一件数一遍</h3>' +
      '<p>固定一件上衣不动，数它能配几条裤子；数完换下一件，最后把几件的数加起来。</p>' +
      '<p>第 1 步 · 先猜：一共能配出几种？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 固定一件，数它的裤子：</p>' +
      '<div id="' + K + '-tops"></div>' +
      '<p>现在固定：<b id="' + K + '-fixed-name"></b></p>' +
      '<div id="' + K + '-bots"></div>' +
      '<p id="' + K + '-tally"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再数一数。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 2 × 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 3 × 2</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 3 × 3</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都数完，并且能说出“固定一件数一遍，再加起来”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function total() { return lv().tops * lv().bottoms; }
    function countTop(i) {
      var n = 0;
      if (counted[i]) for (var k in counted[i]) { if (counted[i][k]) n++; }
      return n;
    }
    function runningTotal() {
      var s = 0;
      for (var i = 0; i < lv().tops; i++) s += countTop(i);
      return s;
    }
    function tallyText() {
      var parts = [];
      for (var i = 0; i < lv().tops; i++) parts.push(TOPNAMES[i] + ' ' + countTop(i) + ' 种');
      return parts.join('；') + '。一共：' + parts.map(function (p) { return p.split(' ')[1]; }).join(' + ') + ' = ' + runningTotal() + ' 种。';
    }
    function drawTops() {
      var box = gid(K + '-tops');
      if (!box) return;
      var h = '<div class="btn-row">';
      for (var i = 0; i < lv().tops; i++) {
        h += '<button class="btn small ' + (doneTops[i] ? 'ghost' : 'primary') + '" id="' + K + '-top-' + i + '" type="button" style="' + (i === fixed && !doneTops[i] ? 'outline:3px solid #f59e0b;' : '') + '"' + (doneTops[i] ? ' disabled' : '') + '>' + TOPNAMES[i] + (doneTops[i] ? ' ✓' : '') + '</button>';
      }
      h += '</div>';
      box.innerHTML = h;
      for (var a = 0; a < lv().tops; a++) {
        (function (a) {
          var b = gid(K + '-top-' + a);
          if (b) b.addEventListener('click', function () { fixTop(a); });
        })(a);
      }
      var fn = gid(K + '-fixed-name');
      if (fn) fn.textContent = TOPNAMES[fixed];
    }
    function drawBots() {
      var box = gid(K + '-bots');
      if (!box) return;
      var h = '<div class="btn-row">';
      for (var j = 0; j < lv().bottoms; j++) {
        var on = counted[fixed] && counted[fixed][j];
        h += '<button class="btn small ghost" id="' + K + '-bot-' + j + '" type="button" style="' + (on ? 'background:#dcfce7;border-color:#15803d;color:#15803d;' : '') + '"' + (on ? ' disabled' : '') + '>' + BOTNAMES[j] + (on ? ' ✓' : '') + '</button>';
      }
      h += '</div>';
      box.innerHTML = h;
      for (var b = 0; b < lv().bottoms; b++) {
        (function (b) {
          var btn = gid(K + '-bot-' + b);
          if (btn) btn.addEventListener('click', function () { countBot(b); });
        })(b);
      }
      var ty = gid(K + '-tally');
      if (ty) ty.textContent = tallyText();
    }
    function fixTop(i) {
      if (!guessed) { msg('先猜一猜：一共能配出几种？'); return; }
      if (done || doneTops[i]) return;
      fixed = i;
      drawTops();
      drawBots();
      msg('固定了' + TOPNAMES[i] + '，数它能配几条裤子。');
    }
    function countBot(j) {
      if (!guessed) { msg('先猜一猜：一共能配出几种？'); return; }
      if (done) return;
      if (!counted[fixed]) counted[fixed] = {};
      counted[fixed][j] = true;
      drawBots();
      if (countTop(fixed) === lv().bottoms) {
        doneTops[fixed] = true;
        drawTops();
        var allDone = true;
        for (var i = 0; i < lv().tops; i++) { if (!doneTops[i]) allDone = false; }
        if (allDone) {
          done = true;
          var ok = guessed === total();
          msg('数完了：' + tallyText() +
            (ok ? '你猜对了！' : '你刚才猜的是 ' + guessed + ' 种，数出来是 ' + total() + ' 种。') +
            '固定一件数一遍，再换下一件，加起来就是总数。');
          if (tiers) tiers.done(levelIdx);
          if (typeof markTried === 'function') markTried(K);
        } else {
          var doneName = TOPNAMES[fixed];
          var next = -1;
          for (var k = 0; k < lv().tops; k++) { if (!doneTops[k]) { next = k; break; } }
          fixed = next;
          drawTops();
          drawBots();
          msg(doneName + '数完了（' + lv().bottoms + ' 种）。换下一件：' + TOPNAMES[fixed] + '。');
        }
      } else {
        msg(TOPNAMES[fixed] + '已经配了 ' + countTop(fixed) + ' 条裤子，还差 ' + (lv().bottoms - countTop(fixed)) + ' 条。');
      }
    }
    function resetRound() {
      guessed = 0; fixed = 0; counted = {}; doneTops = {}; done = false;
      for (var i = 0; i < 3; i++) {
        var gb = gid(K + '-g-' + i);
        if (gb) { gb.textContent = lv().guess[i] + ' 种'; gb.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再数一数。');
      drawTops();
      drawBots();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      msg('你猜一共能配出 ' + g + ' 种。先固定' + TOPNAMES[fixed] + '，数它的裤子。');
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(lv().guess[0]); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(lv().guess[1]); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(lv().guess[2]); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3 + 3 = 6 种', '提高：2 + 2 + 2 = 6 种', '挑战：3 + 3 + 3 = 9 种'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm315b-mult',
  title: '乘法原理推广',
  sub: '两类相乘，三类连乘：上衣 × 裤子 × 鞋子，数一数一共多少种穿法。',
  grade: 3,
  kind: '模拟',
  points: ['3.15b'],
  render: function (el) {
    var K = 'm315b-mult';
    var NAMES = { '上衣': ['红', '黄', '蓝', '绿'], '裤子': ['蓝', '黑', '白', '灰'], '鞋子': ['白', '黑', '棕', '红'] };
    var LEVELS = [
      { label: '基础', cats: [{ name: '上衣', n: 2 }, { name: '裤子', n: 3 }], guess: [5, 6, 8] },
      { label: '提高', cats: [{ name: '上衣', n: 2 }, { name: '裤子', n: 3 }, { name: '鞋子', n: 2 }], guess: [10, 12, 14] },
      { label: '挑战', cats: [{ name: '上衣', n: 3 }, { name: '裤子', n: 3 }, { name: '鞋子', n: 2 }], guess: [16, 18, 20] }
    ];
    var levelIdx = 0, guessed = 0, counts = [], custom = false, enumerated = false, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 3 年级 · 搭配（二）</p>' +
      '<h3>乘法原理推广</h3>' +
      '<p>两类东西相乘，三类东西连乘。每类有几件，就在它身上调一调，乘积会跟着变。</p>' +
      '<p>第 1 步 · 先猜：按下面的件数，一共多少种穿法？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 调一调每类的件数（点 − ＋）：</p>' +
      '<div id="' + K + '-cats"></div>' +
      '<p id="' + K + '-prod"></p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-enum" type="button">数一数，列出来</button></div>' +
      '<div id="' + K + '-list"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再数一数。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 2 × 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 2 × 3 × 2</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 3 × 3 × 2</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都列出来，并且能说出“几类就连乘几次”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function product() {
      var p = 1;
      for (var i = 0; i < counts.length; i++) p *= counts[i];
      return p;
    }
    function prodText() {
      return counts.join(' × ') + ' = ' + product() + ' 种';
    }
    function drawCats() {
      var box = gid(K + '-cats');
      if (!box) return;
      var h = '';
      for (var i = 0; i < lv().cats.length; i++) {
        h += '<p>' + lv().cats[i].name + ' <button class="btn small ghost" id="' + K + '-cat-' + i + '-minus" type="button">−</button><b id="' + K + '-cat-' + i + '-n">' + counts[i] + ' 件</b><button class="btn small ghost" id="' + K + '-cat-' + i + '-plus" type="button">＋</button></p>';
      }
      box.innerHTML = h;
      for (var a = 0; a < lv().cats.length; a++) {
        (function (a) {
          var mn = gid(K + '-cat-' + a + '-minus'), pl = gid(K + '-cat-' + a + '-plus');
          if (mn) mn.addEventListener('click', function () { bump(a, -1); });
          if (pl) pl.addEventListener('click', function () { bump(a, 1); });
        })(a);
      }
      var pd = gid(K + '-prod');
      if (pd) pd.textContent = prodText();
    }
    function bump(i, d) {
      counts[i] = Math.max(1, Math.min(4, counts[i] + d));
      custom = true; enumerated = false; done = false;
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', 'false'); }
      var n = gid(K + '-cat-' + i + '-n');
      if (n) n.textContent = counts[i] + ' 件';
      var pd = gid(K + '-prod');
      if (pd) pd.textContent = prodText();
      var ls = gid(K + '-list'); if (ls) ls.innerHTML = '';
      msg('自己出题：' + prodText() + '。先猜，再列出来数一数。');
    }
    function enumerate() {
      if (!guessed) { msg('先猜一猜：一共多少种穿法？'); return; }
      if (done) return;
      enumerated = true;
      var combos = [];
      function build(idx, prefix) {
        if (idx === lv().cats.length) { combos.push(prefix); return; }
        var cat = lv().cats[idx];
        for (var k = 0; k < counts[idx]; k++) {
          var piece = NAMES[cat.name][k] + cat.name;
          build(idx + 1, prefix ? prefix + ' + ' + piece : piece);
        }
      }
      build(0, '');
      var ls = gid(K + '-list');
      if (ls) {
        var shown = combos.slice(0, 24);
        ls.innerHTML = '<p>一共 ' + combos.length + ' 种：' + shown.join('；') + (combos.length > 24 ? '；……' : '') + '。</p>';
      }
      done = true;
      var ok = guessed === product();
      msg('列出来了：一共 ' + combos.length + ' 种，算式是 ' + prodText() + '。' +
        (ok ? '你猜对了！' : '你刚才猜的是 ' + guessed + ' 种，列出来是 ' + combos.length + ' 种。') +
        '几类东西就连乘几次：两类相乘，三类连乘。');
      if (!custom && tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    function resetRound() {
      guessed = 0; custom = false; enumerated = false; done = false;
      counts = [];
      for (var i = 0; i < lv().cats.length; i++) counts.push(lv().cats[i].n);
      for (var g = 0; g < 3; g++) {
        var gb = gid(K + '-g-' + g);
        if (gb) { gb.textContent = lv().guess[g] + ' 种'; gb.disabled = false; }
      }
      var ls = gid(K + '-list'); if (ls) ls.innerHTML = '';
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再数一数。');
      drawCats();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      msg('你猜一共 ' + g + ' 种。点“数一数，列出来”验算。');
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(lv().guess[0]); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(lv().guess[1]); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(lv().guess[2]); });
    gid(K + '-enum').addEventListener('click', enumerate);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：2 × 3 = 6 种', '提高：2 × 3 × 2 = 12 种', '挑战：3 × 3 × 2 = 18 种'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

/* ---------- 第二批：3 年级剩余 12 个点（3.3 / 3.9 / 3.15a / 3.15b 在第一批已做） ----------
   每种方法一个动画；已覆盖的方法跳过（见汇报）：elapsed / time / verify / times /
   splitmul / rectsq / fraction / fraceq / fracnumline / venn / divplace / fourgrid /
   area / calendar / decimal。每个动画：先猜 → 玩 → 说，三档，我的发现进 math-inquiry-v1。 */
registerAnim({
  key: 'm31-day',
  title: '作息时间线',
  sub: '把一天的事排成一条线，算间隔就是量两点之间的距离：先数到整点，再数分钟。',
  grade: 3,
  kind: '实验',
  points: ['3.1'],
  render: function (el) {
    var K = 'm31-day';
    var LEVELS = [
      { label: '基础', q: '从到校 8:00 到放学 16:30，在学校待了多久？', opts: ['7小时30分', '8小时30分', '9小时30分'], ans: 1,
        jumps: '8:00 到 9:00 是 1 小时，10:00 是 2 小时……数到 16:00，一共 8 小时，再走 30 分到 16:30。',
        verdict: '8 小时 + 30 分 = 8 小时 30 分。' },
      { label: '提高', q: '从起床 7:00 到睡觉 21:00，一天醒着多久？', opts: ['12小时', '13小时', '14小时'], ans: 2,
        jumps: '7:00 到 12:00 是 5 小时，12:00 到 21:00 是 9 小时，5 + 9 = 14 小时。',
        verdict: '21:00 − 7:00 = 14 小时。' },
      { label: '挑战', q: '午休从 12:00 到 13:30，一共多久？', opts: ['1小时', '1小时30分', '2小时'], ans: 1,
        jumps: '12:00 到 13:00 是 1 小时，再走 30 分到 13:30。',
        verdict: '1 小时 + 30 分 = 1 小时 30 分。' }
    ];
    var levelIdx = 0, guessed = -1, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 3 年级 · 时、分、秒</p>' +
      '<h3>作息时间线</h3>' +
      '<p>小明一天的时间线：7:00 起床 · 8:00 到校 · 12:00 午休 · 13:30 上课 · 16:30 放学 · 18:00 晚饭 · 21:00 睡觉。算两个时刻之间隔了多久，就是量时间线上两点之间的距离。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 数一数：先跳到整点，再数分钟。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-count" type="button">数一数</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<p id="' + K + '-jumps"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再数一数。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 在校多久</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 醒着多久</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 午休多久</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都数对，并且能说出“先数到整点，再数分钟”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function resetRound() {
      guessed = -1; done = false;
      gid(K + '-q').textContent = lv().q;
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        b.textContent = lv().opts[i]; b.disabled = false;
      }
      var c = gid(K + '-count'); if (c) c.disabled = true;
      var j = gid(K + '-jumps'); if (j) j.textContent = '';
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再数一数。');
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      var c = gid(K + '-count'); if (c) c.disabled = false;
      msg('你猜 ' + lv().opts[g] + '。数一数，看看对不对。');
    }
    function countIt() {
      if (guessed < 0) { msg('先猜一猜，再数一数。'); return; }
      if (done) return;
      done = true;
      var j = gid(K + '-jumps'); if (j) j.textContent = lv().jumps;
      var ok = guessed === lv().ans;
      msg(lv().verdict + (ok ? '你猜对了！' : '你刚才猜的是 ' + lv().opts[guessed] + '，记住：' + lv().verdict));
      if (ok && tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-count').addEventListener('click', countIt);
    gid(K + '-reset').addEventListener('click', resetRound);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：在校 8 小时 30 分', '提高：醒着 14 小时', '挑战：午休 1 小时 30 分'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm32-blocks',
  title: '数位块拼拆换',
  sub: '10 个一拼成 1 个十，10 个十拼成 1 个百；退位时反过来拆：1 个千拆成 10 个百。',
  grade: 3,
  kind: '模拟',
  points: ['3.2'],
  render: function (el) {
    var K = 'm32-blocks';
    var COLORS = { th: '#7c3aed', h: '#2563eb', t: '#15803d', o: '#c2410c' };
    var NAMES = { th: '千', h: '百', t: '十', o: '一' };
    var LEVELS = [
      { label: '基础', start: { th: 0, h: 0, t: 0, o: 12 }, goal: '换完是几个十？', opts: ['0 个十', '1 个十', '2 个十'], ans: 1,
        steps: [{ take: 'o', tn: 10, give: 't', gn: 1, label: '10 个一换 1 个十' }],
        verdict: '12 个一 = 1 个十和 2 个一。' },
      { label: '提高', start: { th: 0, h: 0, t: 25, o: 0 }, goal: '换完是几个百？', opts: ['1 个百', '2 个百', '3 个百'], ans: 1,
        steps: [{ take: 't', tn: 10, give: 'h', gn: 1, label: '10 个十换 1 个百' }, { take: 't', tn: 10, give: 'h', gn: 1, label: '10 个十换 1 个百' }],
        verdict: '25 个十 = 2 个百和 5 个十。' },
      { label: '挑战', start: { th: 1, h: 0, t: 0, o: 0 }, goal: '借完之后，个位是几个一？', opts: ['0 个一', '10 个一', '100 个一'], ans: 1,
        steps: [{ take: 'th', tn: 1, give: 'h', gn: 10, label: '1 个千拆成 10 个百' }, { take: 'h', tn: 1, give: 't', gn: 10, label: '1 个百拆成 10 个十' }, { take: 't', tn: 1, give: 'o', gn: 10, label: '1 个十拆成 10 个一' }],
        verdict: '1000 = 9 个百、9 个十、10 个一，所以 1000 − 658 = 342。' }
    ];
    var levelIdx = 0, guessed = -1, stepIdx = 0, done = false, tiers = null;
    var cnt = { th: 0, h: 0, t: 0, o: 0 };
    el.innerHTML =
      '<p class="demo-tag">模拟 · 3 年级 · 万以内加减法</p>' +
      '<h3>数位块拼拆换</h3>' +
      '<p>数位块：千是紫色大方块，百是蓝色，十是绿色，一是橙色。10 个小单位拼成 1 个大单位；不够减的时候，大单位拆成 10 个小单位。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-goal"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 拼一拼 / 拆一拆：</p>' +
      '<div id="' + K + '-blocks"></div>' +
      '<p id="' + K + '-prog"></p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-ex" type="button"></button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再拼一拼。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 12 个一</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 25 个十</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 1000 退位</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都拼拆对，并且能说出“10 个一换 1 个十，10 个十换 1 个百”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawBlocks() {
      var h = '';
      ['th', 'h', 't', 'o'].forEach(function (u) {
        var n = cnt[u];
        var sq = '';
        var show = n > 10 ? 10 : n;
        for (var i = 0; i < show; i++) sq += '<span style="display:inline-block;width:14px;height:14px;background:' + COLORS[u] + ';margin:2px;"></span>';
        h += '<p>' + NAMES[u] + '：' + n + ' 个 ' + sq + (n > 10 ? '（只画了 10 个）' : '') + '</p>';
      });
      var box = gid(K + '-blocks'); if (box) box.innerHTML = h;
      var p = gid(K + '-prog');
      if (p) p.textContent = done ? '换完了。' : '第 ' + (stepIdx + 1) + ' 步 / 共 ' + lv().steps.length + ' 步。';
    }
    function resetRound() {
      guessed = -1; stepIdx = 0; done = false;
      cnt = { th: lv().start.th, h: lv().start.h, t: lv().start.t, o: lv().start.o };
      gid(K + '-goal').textContent = lv().goal;
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        b.textContent = lv().opts[i]; b.disabled = false;
      }
      var ex = gid(K + '-ex'); if (ex) { ex.textContent = lv().steps[0].label; ex.disabled = true; }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再拼一拼。');
      drawBlocks();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      var ex = gid(K + '-ex'); if (ex) ex.disabled = false;
      msg('你猜 ' + lv().opts[g] + '。拼一拼 / 拆一拆，看看对不对。');
    }
    function exchange() {
      if (guessed < 0) { msg('先猜一猜，再拼一拼。'); return; }
      if (done) return;
      var s = lv().steps[stepIdx];
      cnt[s.take] -= s.tn;
      cnt[s.give] += s.gn;
      stepIdx++;
      if (stepIdx >= lv().steps.length) {
        done = true;
        var ok = guessed === lv().ans;
        msg(lv().verdict + (ok ? '你猜对了！' : '你刚才猜的是 ' + lv().opts[guessed] + '，记住：' + lv().verdict));
        if (ok && tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
        var ex = gid(K + '-ex'); if (ex) ex.disabled = true;
      } else {
        var ex2 = gid(K + '-ex'); if (ex2) ex2.textContent = lv().steps[stepIdx].label;
        msg('换好了 1 步，还有 ' + (lv().steps.length - stepIdx) + ' 步。');
      }
      drawBlocks();
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-ex').addEventListener('click', exchange);
    gid(K + '-reset').addEventListener('click', resetRound);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：12 个一 = 1 个十和 2 个一', '提高：25 个十 = 2 个百和 5 个十', '挑战：1000 = 9 个百、9 个十、10 个一'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm32-est',
  title: '先估后算（加减法）',
  sub: '先把数看成整百估出大概，再精算：算完看答案在不在估计的区间里。',
  grade: 3,
  kind: '演示',
  points: ['3.2'],
  render: function (el) {
    var K = 'm32-est';
    var LEVELS = [
      { label: '基础', q: '456 + 278', est: '456 看成 500，278 看成 300，500 + 300 = 800，约 800。', opts: ['约 600', '约 700', '约 800'], ans: 2,
        exact: '精算：456 + 278 = 734。', check: '734 在 700 到 800 之间，估得差不多。' },
      { label: '提高', q: '1000 − 658', est: '658 看成 700，1000 − 700 = 300，约 300。', opts: ['约 200', '约 300', '约 400'], ans: 1,
        exact: '精算：1000 − 658 = 342。', check: '342 在 300 到 400 之间，估得差不多。' },
      { label: '挑战', q: '723 + 189', est: '723 看成 700，189 看成 200，700 + 200 = 900，约 900。', opts: ['约 800', '约 900', '约 1000'], ans: 1,
        exact: '精算：723 + 189 = 912。', check: '912 在 900 到 1000 之间，估得差不多。' }
    ];
    var levelIdx = 0, guessed = -1, estShown = false, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 3 年级 · 万以内加减法</p>' +
      '<h3>先估后算（加减法）</h3>' +
      '<p>算之前先估一估：把数看成整百，答案大概在哪个区间？精算完了，对一对在不在区间里——不在，就说明算错了。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span>，答案大约是多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 估一估，再精算：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-est-btn" type="button">估一估</button>' +
      '<button class="btn small primary" id="' + K + '-calc-btn" type="button">精算</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<p id="' + K + '-est"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再估一估。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 456 + 278</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 1000 − 658</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 723 + 189</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都估对区间，并且能说出“精算完要对一对在不在区间里”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function resetRound() {
      guessed = -1; estShown = false; done = false;
      gid(K + '-q').textContent = lv().q;
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        b.textContent = lv().opts[i]; b.disabled = false;
      }
      var e = gid(K + '-est-btn'); if (e) e.disabled = true;
      var c = gid(K + '-calc-btn'); if (c) c.disabled = true;
      var et = gid(K + '-est'); if (et) et.textContent = '';
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再估一估。');
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      var e = gid(K + '-est-btn'); if (e) e.disabled = false;
      msg('你猜 ' + lv().opts[g] + '。先估一估，看看对不对。');
    }
    function showEst() {
      if (guessed < 0) { msg('先猜一猜，再估一估。'); return; }
      estShown = true;
      var et = gid(K + '-est'); if (et) et.textContent = lv().est;
      var c = gid(K + '-calc-btn'); if (c) c.disabled = false;
      msg('估完了，再精算一遍，对一对。');
    }
    function calc() {
      if (!estShown) { msg('先估一估，再精算。'); return; }
      if (done) return;
      done = true;
      var ok = guessed === lv().ans;
      msg(lv().exact + lv().check + (ok ? '你猜对了！' : '你刚才猜的是 ' + lv().opts[guessed] + '，记住：' + lv().est));
      if (ok && tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-est-btn').addEventListener('click', showEst);
    gid(K + '-calc-btn').addEventListener('click', calc);
    gid(K + '-reset').addEventListener('click', resetRound);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：456 + 278 约 800', '提高：1000 − 658 约 300', '挑战：723 + 189 约 900'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm32-vert',
  title: '竖式与数位块同色对应',
  sub: '竖式每算一位，就点亮数位块里同样颜色的那一位：个位橙、十位绿、百位蓝。',
  grade: 3,
  kind: '演示',
  points: ['3.2'],
  render: function (el) {
    var K = 'm32-vert';
    var LEVELS = [
      { label: '基础', a: '456', b: '278', op: '+', ans: 734, opts: ['714', '734', '744'], ansIdx: 1,
        steps: ['个位：6 + 8 = 14，写 4，向十位进 1', '十位：5 + 7 = 12，再加进来的 1 是 13，写 3，向百位进 1', '百位：4 + 2 = 6，再加进来的 1 是 7'],
        blocksA: [['百', 4, '#2563eb'], ['十', 5, '#15803d'], ['个', 6, '#c2410c']],
        blocksB: [['百', 2, '#2563eb'], ['十', 7, '#15803d'], ['个', 8, '#c2410c']],
        verdict: '456 + 278 = 734。' },
      { label: '提高', a: '1000', b: '658', op: '−', ans: 342, opts: ['332', '342', '442'], ansIdx: 1,
        steps: ['个位：0 − 8 不够减，向十位借 1；十位是 0，再向百位借 1，个位变成 10，10 − 8 = 2', '十位：百位借走 1 个百，十位变成 9，9 − 5 = 4', '百位：9 − 6 = 3'],
        blocksA: [['千', 1, '#7c3aed'], ['百', 0, '#2563eb'], ['十', 0, '#15803d'], ['个', 0, '#c2410c']],
        blocksB: [['百', 6, '#2563eb'], ['十', 5, '#15803d'], ['个', 8, '#c2410c']],
        verdict: '1000 − 658 = 342。' },
      { label: '挑战', a: '345', b: '255', op: '+', ans: 600, opts: ['500', '600', '610'], ansIdx: 1,
        steps: ['个位：5 + 5 = 10，写 0，向十位进 1', '十位：4 + 5 = 9，再加进来的 1 是 10，写 0，向百位进 1', '百位：3 + 2 = 5，再加进来的 1 是 6'],
        blocksA: [['百', 3, '#2563eb'], ['十', 4, '#15803d'], ['个', 5, '#c2410c']],
        blocksB: [['百', 2, '#2563eb'], ['十', 5, '#15803d'], ['个', 5, '#c2410c']],
        verdict: '345 + 255 = 600。' }
    ];
    var levelIdx = 0, guessed = -1, stepIdx = 0, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 3 年级 · 万以内加减法</p>' +
      '<h3>竖式与数位块同色对应</h3>' +
      '<p>竖式里的每一位，在数位块里都有同样颜色的一行：算到哪一位，就点亮哪一行。进 1、借 1 的时候，看着块数变一变。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span> 等于多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 一位一位算：</p>' +
      '<div id="' + K + '-blocks"></div>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-next" type="button">下一步</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<div id="' + K + '-steps"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再一位一位算。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 456 + 278</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 1000 − 658</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 345 + 255</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都算对，并且能说出“竖式的一位就是数位块的一行”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function blockRows(list, litName) {
      var h = '';
      list.forEach(function (row) {
        var sq = '';
        for (var i = 0; i < row[1]; i++) sq += '<span style="display:inline-block;width:12px;height:12px;background:' + row[2] + ';margin:2px;"></span>';
        var lit = row[0] === litName ? ' ★ 正在算这一位' : '';
        h += '<p>' + row[0] + '：' + row[1] + ' 个 ' + sq + lit + '</p>';
      });
      return h;
    }
    function drawBlocks() {
      var litName = '';
      if (stepIdx > 0) {
        var last = lv().steps[stepIdx - 1];
        if (last.indexOf('个位') === 0) litName = '个';
        else if (last.indexOf('十位') === 0) litName = '十';
        else if (last.indexOf('百位') === 0) litName = '百';
      }
      var box = gid(K + '-blocks');
      if (box) box.innerHTML = '<p><b>' + lv().a + ' 的块：</b></p>' + blockRows(lv().blocksA, litName) + '<p><b>' + lv().b + ' 的块：</b></p>' + blockRows(lv().blocksB, litName);
    }
    function resetRound() {
      guessed = -1; stepIdx = 0; done = false;
      gid(K + '-q').textContent = lv().a + ' ' + lv().op + ' ' + lv().b;
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        b.textContent = lv().opts[i]; b.disabled = false;
      }
      var nx = gid(K + '-next'); if (nx) nx.disabled = true;
      var st = gid(K + '-steps'); if (st) st.innerHTML = '';
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再一位一位算。');
      drawBlocks();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      var nx = gid(K + '-next'); if (nx) nx.disabled = false;
      msg('你猜 ' + lv().opts[g] + '。一位一位算，看看对不对。');
    }
    function nextStep() {
      if (guessed < 0) { msg('先猜一猜，再一位一位算。'); return; }
      if (done) return;
      var st = gid(K + '-steps');
      if (st) st.innerHTML = st.innerHTML + '<p>' + lv().steps[stepIdx] + '</p>';
      stepIdx++;
      drawBlocks();
      if (stepIdx >= lv().steps.length) {
        done = true;
        var ok = guessed === lv().ansIdx;
        msg(lv().verdict + (ok ? '你猜对了！' : '你刚才猜的是 ' + lv().opts[guessed] + '，记住：' + lv().verdict));
        if (ok && tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
        var nx = gid(K + '-next'); if (nx) nx.disabled = true;
      } else {
        msg('算了 ' + stepIdx + ' 位，还有 ' + (lv().steps.length - stepIdx) + ' 位。');
      }
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-next').addEventListener('click', nextStep);
    gid(K + '-reset').addEventListener('click', resetRound);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：456 + 278 = 734', '提高：1000 − 658 = 342', '挑战：345 + 255 = 600'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm34-table',
  title: '双数轴/比例表',
  sub: '上面一行是份数，下面一行是总数：两行对齐走，倍和总数在同一张表里。',
  grade: 3,
  kind: '模拟',
  points: ['3.4'],
  render: function (el) {
    var K = 'm34-table';
    var LEVELS = [
      { label: '基础', one: 4, target: 6, opts: ['20', '24', '28'], ans: 1, total: 24 },
      { label: '提高', one: 3, target: 7, opts: ['18', '21', '24'], ans: 1, total: 21 },
      { label: '挑战', one: 5, target: 9, opts: ['40', '45', '50'], ans: 1, total: 45 }
    ];
    var levelIdx = 0, guessed = -1, parts = 0, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 3 年级 · 倍的认识</p>' +
      '<h3>双数轴/比例表</h3>' +
      '<p>1 份是多少，几份就是几个 1 份。上面一行数份数，下面一行数总数，两行对齐走——倍，就是份数。</p>' +
      '<p>第 1 步 · 先猜：1 份是 <span id="' + K + '-one"></span>，<span id="' + K + '-target"></span> 份一共是多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 一份一份加：</p>' +
      '<div id="' + K + '-table"></div>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-add" type="button">加一份</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再一份一份加。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 1 份是 4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 1 份是 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 1 份是 5</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都加对，并且能说出“倍是数有几个一份，不是多几”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawTable() {
      var h = '<p>份数：';
      for (var i = 1; i <= parts; i++) h += ' ' + i;
      h += '</p><p>总数：';
      for (var j = 1; j <= parts; j++) h += ' ' + (j * lv().one);
      h += '</p><p>已经加了 ' + parts + ' 份，一共 ' + (parts * lv().one) + '。</p>';
      var t = gid(K + '-table'); if (t) t.innerHTML = h;
    }
    function resetRound() {
      guessed = -1; parts = 0; done = false;
      gid(K + '-one').textContent = String(lv().one);
      gid(K + '-target').textContent = String(lv().target);
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        b.textContent = lv().opts[i]; b.disabled = false;
      }
      var a = gid(K + '-add'); if (a) a.disabled = true;
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再一份一份加。');
      drawTable();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      var a = gid(K + '-add'); if (a) a.disabled = false;
      msg('你猜 ' + lv().opts[g] + '。一份一份加，看看对不对。');
    }
    function addOne() {
      if (guessed < 0) { msg('先猜一猜，再一份一份加。'); return; }
      if (done) return;
      parts++;
      drawTable();
      if (parts >= lv().target) {
        done = true;
        var ok = guessed === lv().ans;
        var more = lv().total - lv().one;
        msg(lv().target + ' 份就是 ' + lv().target + ' 个 ' + lv().one + '，一共 ' + lv().total + '；' + lv().total + ' 是 ' + lv().one + ' 的 ' + lv().target + ' 倍。' + lv().total + ' 比 ' + lv().one + ' 多 ' + more + '，可倍是数份数，不是多几。' + (ok ? '你猜对了！' : '你刚才猜的是 ' + lv().opts[guessed] + '。'));
        if (ok && tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
        var a = gid(K + '-add'); if (a) a.disabled = true;
      } else {
        msg('加了 ' + parts + ' 份，一共 ' + (parts * lv().one) + '，还差 ' + (lv().target - parts) + ' 份。');
      }
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-add').addEventListener('click', addOne);
    gid(K + '-reset').addEventListener('click', resetRound);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：6 份 4 是 24', '提高：7 份 3 是 21', '挑战：9 份 5 是 45'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm34-groups',
  title: '实物分组“几个几”',
  sub: '先摆出一份，再数大数里有几个一份：有几份，就是几倍。',
  grade: 3,
  kind: '实验',
  points: ['3.4'],
  render: function (el) {
    var K = 'm34-groups';
    var LEVELS = [
      { label: '基础', total: 12, group: 4, opts: ['2 份', '3 份', '4 份'], ans: 1, groups: 3, item: '苹果' },
      { label: '提高', total: 15, group: 3, opts: ['4 份', '5 份', '6 份'], ans: 1, groups: 5, item: '糖果' },
      { label: '挑战', total: 18, group: 6, opts: ['2 份', '3 份', '4 份'], ans: 1, groups: 3, item: '积木' }
    ];
    var levelIdx = 0, guessed = -1, made = 0, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 3 年级 · 倍的认识</p>' +
      '<h3>实物分组“几个几”</h3>' +
      '<p>一堆东西，先按一份的数量分出来，再数一共分了几份——有几份，就是几倍。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span>，一共能分几份？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 分一份：每次分出 <span id="' + K + '-gsize"></span> 个。</p>' +
      '<div id="' + K + '-groups"></div>' +
      '<p id="' + K + '-left"></p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-split" type="button">分一份</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再一份一份分。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 12 个苹果</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 15 颗糖果</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 18 块积木</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都分对，并且能说出“有几份就是几倍”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawGroups() {
      var h = '';
      for (var i = 0; i < made; i++) {
        var row = '';
        for (var j = 0; j < lv().group; j++) row += '● ';
        h += '<p>第 ' + (i + 1) + ' 份：' + row + '</p>';
      }
      var g = gid(K + '-groups'); if (g) g.innerHTML = h;
      var l = gid(K + '-left');
      if (l) l.textContent = '还剩 ' + (lv().total - made * lv().group) + ' 个' + lv().item + '没分。';
    }
    function resetRound() {
      guessed = -1; made = 0; done = false;
      gid(K + '-q').textContent = lv().total + ' 个' + lv().item + '，每 ' + lv().group + ' 个一份';
      gid(K + '-gsize').textContent = String(lv().group);
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        b.textContent = lv().opts[i]; b.disabled = false;
      }
      var s = gid(K + '-split'); if (s) s.disabled = true;
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再一份一份分。');
      drawGroups();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      var s = gid(K + '-split'); if (s) s.disabled = false;
      msg('你猜 ' + lv().opts[g] + '。一份一份分，看看对不对。');
    }
    function splitOne() {
      if (guessed < 0) { msg('先猜一猜，再一份一份分。'); return; }
      if (done) return;
      made++;
      drawGroups();
      if (made >= lv().groups) {
        done = true;
        var ok = guessed === lv().ans;
        msg(lv().total + ' 里面有 ' + lv().groups + ' 个 ' + lv().group + '，' + lv().total + ' 是 ' + lv().group + ' 的 ' + lv().groups + ' 倍。' + (ok ? '你猜对了！' : '你刚才猜的是 ' + lv().opts[guessed] + '。'));
        if (ok && tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
        var s = gid(K + '-split'); if (s) s.disabled = true;
      } else {
        msg('分了 ' + made + ' 份，还剩 ' + (lv().total - made * lv().group) + ' 个。');
      }
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-split').addEventListener('click', splitOne);
    gid(K + '-reset').addEventListener('click', resetRound);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：12 里有 3 个 4', '提高：15 里有 5 个 3', '挑战：18 里有 3 个 6'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm35-dots',
  title: '点阵分组累加',
  sub: '13×4 画成点阵，拆成 10×4 和 3×4 两组，分别数完再加起来。',
  grade: 3,
  kind: '模拟',
  points: ['3.5'],
  render: function (el) {
    var K = 'm35-dots';
    var LEVELS = [
      { label: '基础', a: 13, b: 4, split: 10, rem: 3, opts: ['42', '52', '62'], ans: 1 },
      { label: '提高', a: 15, b: 3, split: 10, rem: 5, opts: ['35', '45', '55'], ans: 1 },
      { label: '挑战', a: 24, b: 3, split: 20, rem: 4, opts: ['62', '72', '82'], ans: 1 }
    ];
    var levelIdx = 0, guessed = -1, stage = 0, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 3 年级 · 多位数乘一位数</p>' +
      '<h3>点阵分组累加</h3>' +
      '<p>乘法是点阵：13×4 就是 4 行、每行 13 个点。把 13 拆成 10 和 3，两组分别数，再加起来。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span> 等于多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 分组数：</p>' +
      '<div id="' + K + '-dots"></div>' +
      '<p id="' + K + '-counts"></p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-left" type="button">数左边一组</button>' +
      '<button class="btn small primary" id="' + K + '-right" type="button">数右边一组</button>' +
      '<button class="btn small primary" id="' + K + '-sum" type="button">加起来</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再分组数。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 13 × 4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 15 × 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 24 × 3</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都数对，并且能说出“拆开算、再加起来”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawDots() {
      var h = '';
      for (var r = 0; r < lv().b; r++) {
        for (var c = 0; c < lv().a; c++) {
          var col = '#cbd5e1';
          if (stage >= 1 && c < lv().split) col = '#2563eb';
          if (stage >= 2 && c >= lv().split) col = '#c2410c';
          h += '<span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:' + col + ';margin:1px;"></span>';
        }
        h += '<br>';
      }
      var d = gid(K + '-dots'); if (d) d.innerHTML = h;
      var ct = gid(K + '-counts');
      if (ct) {
        ct.textContent = stage === 0 ? '蓝色是左边一组，橙色是右边一组。'
          : stage === 1 ? '左边：' + lv().split + ' × ' + lv().b + ' = ' + (lv().split * lv().b) + ' 个点。'
          : '左边：' + lv().split + ' × ' + lv().b + ' = ' + (lv().split * lv().b) + ' 个点；右边：' + lv().rem + ' × ' + lv().b + ' = ' + (lv().rem * lv().b) + ' 个点。';
      }
    }
    function resetRound() {
      guessed = -1; stage = 0; done = false;
      gid(K + '-q').textContent = lv().a + ' × ' + lv().b;
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        b.textContent = lv().opts[i]; b.disabled = false;
      }
      var l = gid(K + '-left'); if (l) l.disabled = true;
      var r = gid(K + '-right'); if (r) r.disabled = true;
      var s = gid(K + '-sum'); if (s) s.disabled = true;
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再分组数。');
      drawDots();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      var l = gid(K + '-left'); if (l) l.disabled = false;
      msg('你猜 ' + lv().opts[g] + '。先数左边一组。');
    }
    function countLeft() {
      if (guessed < 0 || stage !== 0) return;
      stage = 1;
      var r = gid(K + '-right'); if (r) r.disabled = false;
      drawDots();
      msg('左边 ' + lv().split + ' × ' + lv().b + ' = ' + (lv().split * lv().b) + '。再数右边一组。');
    }
    function countRight() {
      if (stage !== 1) return;
      stage = 2;
      var s = gid(K + '-sum'); if (s) s.disabled = false;
      drawDots();
      msg('右边 ' + lv().rem + ' × ' + lv().b + ' = ' + (lv().rem * lv().b) + '。加起来。');
    }
    function sumUp() {
      if (stage !== 2 || done) return;
      done = true;
      var total = lv().a * lv().b;
      var ok = guessed === lv().ans;
      msg(lv().a + ' × ' + lv().b + ' = ' + lv().split + ' × ' + lv().b + ' + ' + lv().rem + ' × ' + lv().b + ' = ' + (lv().split * lv().b) + ' + ' + (lv().rem * lv().b) + ' = ' + total + '。' + (ok ? '你猜对了！' : '你刚才猜的是 ' + lv().opts[guessed] + '。'));
      if (ok && tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-left').addEventListener('click', countLeft);
    gid(K + '-right').addEventListener('click', countRight);
    gid(K + '-sum').addEventListener('click', sumUp);
    gid(K + '-reset').addEventListener('click', resetRound);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：13 × 4 = 52', '提高：15 × 3 = 45', '挑战：24 × 3 = 72'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm35-est',
  title: '先估后算（乘法）',
  sub: '先把两位数看成整十数估出大概，再精算：算完看答案离估计有多远。',
  grade: 3,
  kind: '演示',
  points: ['3.5'],
  render: function (el) {
    var K = 'm35-est';
    var LEVELS = [
      { label: '基础', q: '23 × 4', est: '23 看成 20，20 × 4 = 80，约 80。', opts: ['约 70', '约 80', '约 90'], ans: 1,
        exact: '精算：23 × 4 = 92。', check: '92 比 80 多 12，估得差不多。' },
      { label: '提高', q: '32 × 3', est: '32 看成 30，30 × 3 = 90，约 90。', opts: ['约 80', '约 90', '约 100'], ans: 1,
        exact: '精算：32 × 3 = 96。', check: '96 比 90 多 6，估得差不多。' },
      { label: '挑战', q: '18 × 3', est: '18 看成 20，20 × 3 = 60，约 60。', opts: ['约 50', '约 60', '约 70'], ans: 1,
        exact: '精算：18 × 3 = 54。', check: '54 比 60 少 6，估得差不多。' }
    ];
    var levelIdx = 0, guessed = -1, estShown = false, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 3 年级 · 多位数乘一位数</p>' +
      '<h3>先估后算（乘法）</h3>' +
      '<p>算乘法之前先估一估：把两位数看成整十数，答案大概是多少？精算完了，对一对离估计有多远。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span>，答案大约是多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 估一估，再精算：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-est-btn" type="button">估一估</button>' +
      '<button class="btn small primary" id="' + K + '-calc-btn" type="button">精算</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<p id="' + K + '-est"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再估一估。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 23 × 4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 32 × 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 18 × 3</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都估对，并且能说出“先把两位数看成整十数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function resetRound() {
      guessed = -1; estShown = false; done = false;
      gid(K + '-q').textContent = lv().q;
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        b.textContent = lv().opts[i]; b.disabled = false;
      }
      var e = gid(K + '-est-btn'); if (e) e.disabled = true;
      var c = gid(K + '-calc-btn'); if (c) c.disabled = true;
      var et = gid(K + '-est'); if (et) et.textContent = '';
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再估一估。');
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      var e = gid(K + '-est-btn'); if (e) e.disabled = false;
      msg('你猜 ' + lv().opts[g] + '。先估一估，看看对不对。');
    }
    function showEst() {
      if (guessed < 0) { msg('先猜一猜，再估一估。'); return; }
      estShown = true;
      var et = gid(K + '-est'); if (et) et.textContent = lv().est;
      var c = gid(K + '-calc-btn'); if (c) c.disabled = false;
      msg('估完了，再精算一遍，对一对。');
    }
    function calc() {
      if (!estShown) { msg('先估一估，再精算。'); return; }
      if (done) return;
      done = true;
      var ok = guessed === lv().ans;
      msg(lv().exact + lv().check + (ok ? '你猜对了！' : '你刚才猜的是 ' + lv().opts[guessed] + '，记住：' + lv().est));
      if (ok && tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-est-btn').addEventListener('click', showEst);
    gid(K + '-calc-btn').addEventListener('click', calc);
    gid(K + '-reset').addEventListener('click', resetRound);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：23 × 4 约 80', '提高：32 × 3 约 90', '挑战：18 × 3 约 60'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm35-vert',
  title: '竖式与面积块同色对应',
  sub: '竖式每算一步，就点亮面积图里同样颜色的那一块：进位就是 12 个一换成 1 个十。',
  grade: 3,
  kind: '演示',
  points: ['3.5'],
  render: function (el) {
    var K = 'm35-vert';
    var LEVELS = [
      { label: '基础', a: 23, b: 4, split: 20, rem: 3, opts: ['82', '92', '102'], ans: 1,
        steps: ['3 × 4 = 12，写 2，向十位进 1——橙色块', '20 × 4 = 80——蓝色块', '80 + 12 = 92'],
        blocks: [['20 × 4 = 80', '#2563eb'], ['3 × 4 = 12', '#c2410c']],
        verdict: '23 × 4 = 92。' },
      { label: '提高', a: 32, b: 3, split: 30, rem: 2, opts: ['86', '96', '106'], ans: 1,
        steps: ['2 × 3 = 6——橙色块', '30 × 3 = 90——蓝色块', '90 + 6 = 96'],
        blocks: [['30 × 3 = 90', '#2563eb'], ['2 × 3 = 6', '#c2410c']],
        verdict: '32 × 3 = 96。' },
      { label: '挑战', a: 18, b: 3, split: 10, rem: 8, opts: ['44', '54', '64'], ans: 1,
        steps: ['8 × 3 = 24，写 4，向十位进 2——橙色块', '10 × 3 = 30——蓝色块', '30 + 24 = 54'],
        blocks: [['10 × 3 = 30', '#2563eb'], ['8 × 3 = 24', '#c2410c']],
        verdict: '18 × 3 = 54。' }
    ];
    var levelIdx = 0, guessed = -1, stepIdx = 0, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 3 年级 · 多位数乘一位数</p>' +
      '<h3>竖式与面积块同色对应</h3>' +
      '<p>乘法是面积：23×4 的长方形切成 20×4 和 3×4 两块。竖式里的每一步，颜色和面积块一一对应。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span> 等于多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 一步一步算：</p>' +
      '<div id="' + K + '-blocks"></div>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-next" type="button">下一步</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<div id="' + K + '-steps"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再一步一步算。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 23 × 4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 32 × 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 18 × 3</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都算对，并且能说出“竖式的一步就是面积的一块”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawBlocks() {
      var h = '';
      lv().blocks.forEach(function (bk, i) {
        var lit = '';
        if (stepIdx === 1 && i === 1) lit = ' ★ 正在算这块';
        if (stepIdx === 2 && i === 0) lit = ' ★ 正在算这块';
        var w = Math.round((i === 0 ? lv().split : lv().rem) / lv().a * 100);
        h += '<p><span style="display:inline-block;width:' + w + '%;max-width:320px;height:26px;line-height:26px;text-align:center;background:' + bk[1] + ';color:#fff;">' + bk[0] + '</span>' + lit + '</p>';
      });
      var box = gid(K + '-blocks'); if (box) box.innerHTML = h;
    }
    function resetRound() {
      guessed = -1; stepIdx = 0; done = false;
      gid(K + '-q').textContent = lv().a + ' × ' + lv().b;
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        b.textContent = lv().opts[i]; b.disabled = false;
      }
      var nx = gid(K + '-next'); if (nx) nx.disabled = true;
      var st = gid(K + '-steps'); if (st) st.innerHTML = '';
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再一步一步算。');
      drawBlocks();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      var nx = gid(K + '-next'); if (nx) nx.disabled = false;
      msg('你猜 ' + lv().opts[g] + '。一步一步算，看看对不对。');
    }
    function nextStep() {
      if (guessed < 0) { msg('先猜一猜，再一步一步算。'); return; }
      if (done) return;
      var st = gid(K + '-steps');
      if (st) st.innerHTML = st.innerHTML + '<p>' + lv().steps[stepIdx] + '</p>';
      stepIdx++;
      drawBlocks();
      if (stepIdx >= lv().steps.length) {
        done = true;
        var ok = guessed === lv().ans;
        msg(lv().verdict + (ok ? '你猜对了！' : '你刚才猜的是 ' + lv().opts[guessed] + '，记住：' + lv().verdict));
        if (ok && tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
        var nx = gid(K + '-next'); if (nx) nx.disabled = true;
      } else {
        msg('算了 ' + stepIdx + ' 步，还有 ' + (lv().steps.length - stepIdx) + ' 步。');
      }
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-next').addEventListener('click', nextStep);
    gid(K + '-reset').addEventListener('click', resetRound);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：23 × 4 = 92', '提高：32 × 3 = 96', '挑战：18 × 3 = 54'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm36-drag',
  title: '拖拽变形看不变性',
  sub: '拉一拉四边形：只改长宽，它还是长方形；斜着拉，角变了，它就不再是长方形。',
  grade: 3,
  kind: '模拟',
  points: ['3.6'],
  render: function (el) {
    var K = 'm36-drag';
    var LEVELS = [
      { label: '基础', q: '只改宽，不斜着拉，四个角还是直角吗？', opts: ['还是直角', '角变了'], ans: 0, startSlant: 0,
        need: '先点“宽 +”或“宽 −”改一改宽。',
        verdict: '宽变了，四个角还是 90°，还是长方形。' },
      { label: '提高', q: '斜着拉一下，它还是长方形吗？', opts: ['还是长方形', '不是长方形了'], ans: 1, startSlant: 0,
        need: '先点“斜 +”拉一拉。',
        verdict: '斜着拉之后，角不再是 90°，没有直角了——它变成平行四边形了。对边还是一样长，可角变了，就不是长方形。' },
      { label: '挑战', q: '把它拉回长方形，要把斜拉回多少？', opts: ['斜 0', '斜 20', '斜 40'], ans: 0, startSlant: 20,
        need: '先点“斜 −”把它拉回去。',
        verdict: '斜回到 0，四个角又都是 90°，它又是长方形了。' }
    ];
    var levelIdx = 0, guessed = -1, done = false, tiers = null;
    var slant = 0, width = 120;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 3 年级 · 长方形和正方形</p>' +
      '<h3>拖拽变形看不变性</h3>' +
      '<p>拉一拉这个四边形：改宽、斜着拉，看看什么变了、什么没变。长方形的要求是 4 个直角、对边相等。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 拉一拉：</p>' +
      '<div id="' + K + '-shape"></div>' +
      '<p id="' + K + '-read"></p>' +
      '<div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-w-minus" type="button">宽 −</button>' +
      '<button class="btn small ghost" id="' + K + '-w-plus" type="button">宽 +</button>' +
      '<button class="btn small ghost" id="' + K + '-s-minus" type="button">斜 −</button>' +
      '<button class="btn small ghost" id="' + K + '-s-plus" type="button">斜 +</button>' +
      '<button class="btn small primary" id="' + K + '-check" type="button">看一看</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再拉一拉。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 只改宽</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 斜着拉</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 拉回去</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都拉对，并且能说出“角不变的才是长方形”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function angles() {
      var tilt = Math.round(Math.atan(slant / 80) * 180 / Math.PI);
      var bl = 90 - tilt, tl = 180 - bl;
      return { bl: bl, br: tl, tr: bl, tl: tl };
    }
    function drawShape() {
      var x0 = 50, top = 15, bot = 95;
      var pts = x0 + ',' + top + ' ' + (x0 + width) + ',' + top + ' ' + (x0 + width + slant) + ',' + bot + ' ' + (x0 + slant) + ',' + bot;
      var box = gid(K + '-shape');
      if (box) box.innerHTML = '<svg width="260" height="120" viewBox="0 0 260 120"><polygon points="' + pts + '" fill="#dbeafe" stroke="#2563eb" stroke-width="2"></polygon></svg>';
      var a = angles();
      var r = gid(K + '-read');
      if (r) r.textContent = '宽 ' + width + '，斜 ' + slant + '。四个角：左下 ' + a.bl + '°、右下 ' + a.br + '°、右上 ' + a.tr + '°、左上 ' + a.tl + '°。';
    }
    function resetRound() {
      guessed = -1; done = false;
      slant = lv().startSlant; width = 120;
      gid(K + '-q').textContent = lv().q;
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        b.textContent = lv().opts[i]; b.disabled = false;
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再拉一拉。');
      drawShape();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      msg('你猜 ' + lv().opts[g] + '。拉一拉，看看对不对。');
    }
    function ready() {
      if (levelIdx === 0) return width !== 120 && slant === 0;
      if (levelIdx === 1) return slant !== 0;
      return slant === 0;
    }
    function checkIt() {
      if (guessed < 0) { msg('先猜一猜，再拉一拉。'); return; }
      if (done) return;
      if (!ready()) { msg(lv().need); return; }
      done = true;
      var ok = guessed === lv().ans;
      var a = angles();
      msg(lv().verdict + '现在四个角是 ' + a.bl + '°、' + a.br + '°、' + a.tr + '°、' + a.tl + '°。' + (ok ? '你猜对了！' : '你刚才猜的是 ' + lv().opts[guessed] + '。'));
      if (ok && tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-w-minus').addEventListener('click', function () { if (width > 100) width -= 20; drawShape(); });
    gid(K + '-w-plus').addEventListener('click', function () { if (width < 160) width += 20; drawShape(); });
    gid(K + '-s-minus').addEventListener('click', function () { if (slant > -40) slant -= 20; drawShape(); });
    gid(K + '-s-plus').addEventListener('click', function () { if (slant < 40) slant += 20; drawShape(); });
    gid(K + '-check').addEventListener('click', checkIt);
    gid(K + '-reset').addEventListener('click', resetRound);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：只改宽，角还是 90°', '提高：斜着拉，不再是长方形', '挑战：拉回斜 0，又是长方形'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm36-nest',
  title: '包含图嵌套',
  sub: '正方形圈套在长方形圈里，长方形圈套在平行四边形圈里：看它满足哪几条，就住进哪个圈。',
  grade: 3,
  kind: '演示',
  points: ['3.6'],
  render: function (el) {
    var K = 'm36-nest';
    var LEVELS = [
      { label: '基础', shape: '正方形', props: '4 个直角：有；对边相等：是；四条边相等：是', opts: ['正方形圈', '长方形圈', '平行四边形圈', '圈外'], ans: 0,
        verdict: '正方形四条边都相等，住在最里面的正方形圈——它同时也是长方形、也是平行四边形。',
        hint: '再看看：正方形四条边都相等，它能住进哪个最小的圈？' },
      { label: '提高', shape: '长方形（长 8，宽 5）', props: '4 个直角：有；对边相等：是；四条边相等：不是（长 8，宽 5）', opts: ['正方形圈', '长方形圈', '平行四边形圈', '圈外'], ans: 1,
        verdict: '长 8、宽 5，四条边不全相等，住不进正方形圈，住在长方形圈。',
        hint: '四条边不全相等，住不进正方形圈；它有 4 个直角，该住进哪个圈？' },
      { label: '挑战', shape: '平行四边形', props: '4 个直角：没有；对边相等：是；四条边相等：不是', opts: ['正方形圈', '长方形圈', '平行四边形圈', '圈外'], ans: 2,
        verdict: '没有直角，进不了长方形圈，住在最外面的平行四边形圈。',
        hint: '没有直角，进不了长方形圈，也进不了正方形圈。' }
    ];
    var levelIdx = 0, guessed = -1, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 3 年级 · 长方形和正方形</p>' +
      '<h3>包含图嵌套</h3>' +
      '<p>三个圈套在一起：最里面是正方形圈，中间是长方形圈，最外面是平行四边形圈。一个图形满足哪几条要求，就住进哪个圈。</p>' +
      '<svg width="220" height="220" viewBox="0 0 220 220"><circle cx="110" cy="110" r="100" fill="#ede9fe" stroke="#7c3aed" stroke-width="2"></circle><circle cx="110" cy="110" r="68" fill="#dbeafe" stroke="#2563eb" stroke-width="2"></circle><circle cx="110" cy="110" r="38" fill="#dcfce7" stroke="#15803d" stroke-width="2"></circle><text x="110" y="22" text-anchor="middle" font-size="13">平行四边形圈</text><text x="110" y="58" text-anchor="middle" font-size="13">长方形圈</text><text x="110" y="114" text-anchor="middle" font-size="13">正方形圈</text></svg>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-shape"></span>住进哪个圈？<span id="' + K + '-props"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button">正方形圈</button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button">长方形圈</button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button">平行四边形圈</button>' +
      '<button class="btn small primary" id="' + K + '-g-3" type="button">圈外</button></div>' +
      '<p>第 2 步 · 放进去：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-place" type="button">放进去</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<p id="' + K + '-placed"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再放进去。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 正方形</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 长方形</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 平行四边形</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都放对，并且能说出“正方形也是长方形”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function resetRound() {
      guessed = -1; done = false;
      gid(K + '-shape').textContent = lv().shape;
      gid(K + '-props').textContent = '（' + lv().props + '）';
      for (var i = 0; i < 4; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = false; }
      var pl = gid(K + '-place'); if (pl) pl.disabled = true;
      var pd = gid(K + '-placed'); if (pd) pd.textContent = '';
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再放进去。');
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 4; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      var pl = gid(K + '-place'); if (pl) pl.disabled = false;
      msg('你猜 ' + lv().opts[g] + '。点“放进去”看看。');
    }
    function placeIt() {
      if (guessed < 0) { msg('先猜一猜，再放进去。'); return; }
      if (done) return;
      if (guessed === lv().ans) {
        done = true;
        var pd = gid(K + '-placed');
        if (pd) pd.textContent = '已放进：' + lv().shape + ' → ' + lv().opts[guessed] + '。';
        msg(lv().verdict + '你猜对了！');
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg(lv().hint);
        for (var i = 0; i < 4; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = false; }
        var pl = gid(K + '-place'); if (pl) pl.disabled = true;
        guessed = -1;
      }
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-g-3').addEventListener('click', function () { onGuess(3); });
    gid(K + '-place').addEventListener('click', placeIt);
    gid(K + '-reset').addEventListener('click', resetRound);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：正方形住正方形圈', '提高：长方形住长方形圈', '挑战：平行四边形住平行四边形圈'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm37-div',
  title: '分数即分一份',
  sub: '3 块饼分给 4 个人，每人得 3/4 块：分数就是除法，3÷4=3/4。',
  grade: 3,
  kind: '实验',
  points: ['3.7'],
  render: function (el) {
    var K = 'm37-div';
    var LEVELS = [
      { label: '基础', cakes: 3, people: 4, opts: ['3/4 块', '4/3 块', '3 块'], ans: 0, unit: '1/4',
        each: '每人分到 3 个 1/4 块，就是 3/4 块。', text: '3 ÷ 4 = 3/4' },
      { label: '提高', cakes: 2, people: 3, opts: ['2/3 块', '3/2 块', '2 块'], ans: 0, unit: '1/3',
        each: '每人分到 2 个 1/3 块，就是 2/3 块。', text: '2 ÷ 3 = 2/3' },
      { label: '挑战', cakes: 5, people: 4, opts: ['5/4 块', '4/5 块', '5 块'], ans: 0, unit: '1/4',
        each: '每人分到 5 个 1/4 块，就是 5/4 块，也就是 1 块加 1/4 块。', text: '5 ÷ 4 = 5/4' }
    ];
    var levelIdx = 0, guessed = -1, stage = 0, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 3 年级 · 分数的初步认识</p>' +
      '<h3>分数即分一份</h3>' +
      '<p>几块饼分给几个人，每人得几分之几块？把每块饼都切成同样多份，一人拿几份，就是几分之几。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span>，每人分到多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 切一切，再分一分：</p>' +
      '<div id="' + K + '-pies"></div>' +
      '<div id="' + K + '-shares"></div>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-cut" type="button">切一切</button>' +
      '<button class="btn small primary" id="' + K + '-share" type="button">分一分</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再切一切。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 3 块饼分给 4 人</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 2 块饼分给 3 人</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 5 块饼分给 4 人</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都分对，并且能说出“几块饼分给几个人，每人就是几分之几块”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawPies() {
      var h = '';
      for (var i = 0; i < lv().cakes; i++) {
        if (stage === 0) {
          h += '<p>第 ' + (i + 1) + ' 块饼：○ 一整块</p>';
        } else {
          var cells = '';
          for (var j = 0; j < lv().people; j++) cells += '<span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background:#fde68a;border:1px solid #d97706;margin:2px;">1/' + lv().people + '</span>';
          h += '<p>第 ' + (i + 1) + ' 块饼：' + cells + '</p>';
        }
      }
      var p = gid(K + '-pies'); if (p) p.innerHTML = h;
    }
    function drawShares() {
      if (stage < 2) return;
      var h = '';
      for (var i = 0; i < lv().people; i++) {
        var cells = '';
        for (var j = 0; j < lv().cakes; j++) cells += '<span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background:#dcfce7;border:1px solid #15803d;margin:2px;">1/' + lv().people + '</span>';
        h += '<p>第 ' + (i + 1) + ' 个人：' + cells + '</p>';
      }
      var s = gid(K + '-shares'); if (s) s.innerHTML = h;
    }
    function resetRound() {
      guessed = -1; stage = 0; done = false;
      gid(K + '-q').textContent = lv().cakes + ' 块饼分给 ' + lv().people + ' 个人';
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        b.textContent = lv().opts[i]; b.disabled = false;
      }
      var c = gid(K + '-cut'); if (c) c.disabled = true;
      var s = gid(K + '-share'); if (s) s.disabled = true;
      var sh = gid(K + '-shares'); if (sh) sh.innerHTML = '';
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再切一切。');
      drawPies();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      var c = gid(K + '-cut'); if (c) c.disabled = false;
      msg('你猜 ' + lv().opts[g] + '。先把每块饼切成 ' + lv().people + ' 份。');
    }
    function cutIt() {
      if (guessed < 0 || stage !== 0) return;
      stage = 1;
      var s = gid(K + '-share'); if (s) s.disabled = false;
      drawPies();
      msg('切好了：每块饼切成 ' + lv().people + ' 份，一共 ' + (lv().cakes * lv().people) + ' 个 ' + lv().unit + ' 块。再分一分。');
    }
    function shareIt() {
      if (stage !== 1 || done) return;
      stage = 2;
      done = true;
      drawShares();
      var ok = guessed === lv().ans;
      msg(lv().each + lv().text + '。' + (ok ? '你猜对了！' : '你刚才猜的是 ' + lv().opts[guessed] + '。'));
      if (ok && tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-cut').addEventListener('click', cutIt);
    gid(K + '-share').addEventListener('click', shareIt);
    gid(K + '-reset').addEventListener('click', resetRound);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3 块饼分给 4 人，每人 3/4 块', '提高：2 块饼分给 3 人，每人 2/3 块', '挑战：5 块饼分给 4 人，每人 5/4 块'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm38-three',
  title: '三圈种花',
  sub: '三个圈种 10 株花：重叠的地方算两边，三个都种的那株算了三次，要扣回来。',
  grade: 3,
  kind: '实验',
  points: ['3.8'],
  render: function (el) {
    var K = 'm38-three';
    var LEVELS = [
      { label: '基础', q: '玫瑰坛一共 6 朵，玫瑰和菊花两种都种的有 2 朵，只种玫瑰的有几朵？', opts: ['3 朵', '4 朵', '5 朵'], ans: 1,
        explain: '玫瑰坛 6 朵里，2 朵还种了菊花，剩下 6 − 2 = 4 朵只种玫瑰。' },
      { label: '提高', q: '百合坛一共 4 朵：1 朵还种了玫瑰，1 朵三种都种，只种百合的有几朵？', opts: ['1 朵', '2 朵', '3 朵'], ans: 1,
        explain: '百合坛 4 朵里，1 朵还种了玫瑰，1 朵三种都种，剩下 4 − 1 − 1 = 2 朵只种百合。' },
      { label: '挑战', q: '三坛一共种了多少朵花？玫瑰 6 朵、菊花 4 朵、百合 4 朵，再扣掉多算的。', opts: ['9 朵', '10 朵', '11 朵'], ans: 1,
        explain: '6 + 4 + 4 = 14；玫瑰和菊花重叠的 2 朵被数了两次，玫瑰和百合重叠的 2 朵被数了两次，菊花和百合重叠的 1 朵被数了两次，14 − 2 − 2 − 1 = 9；三种都种的 1 朵被减了 3 次，要加回来 1 次，9 + 1 = 10 朵。' }
    ];
    var levelIdx = 0, guessed = -1, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 3 年级 · 集合</p>' +
      '<h3>三圈种花</h3>' +
      '<p>三个花坛：玫瑰坛 6 朵、菊花坛 4 朵、百合坛 4 朵。有的花种在两个坛的重叠处，有的三种都种——数总数的时候，重叠的花不能多数。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 数一数：看看每个区域有几朵。</p>' +
      '<div id="' + K + '-venn"></div>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-count" type="button">数一数</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<p id="' + K + '-explain"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再数一数。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 只种玫瑰</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 只种百合</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 一共多少朵</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都数对，并且能说出“重叠的只数一次”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawVenn(show) {
      var n = show ? ['3', '2', '2', '1', '1', '0', '1'] : ['?', '?', '?', '?', '?', '?', '?'];
      var h = '<svg width="240" height="190" viewBox="0 0 240 190">' +
        '<circle cx="88" cy="72" r="54" fill="#dbeafe" fill-opacity="0.5" stroke="#2563eb" stroke-width="2"></circle>' +
        '<circle cx="152" cy="72" r="54" fill="#dcfce7" fill-opacity="0.5" stroke="#15803d" stroke-width="2"></circle>' +
        '<circle cx="120" cy="122" r="54" fill="#fce7f3" fill-opacity="0.5" stroke="#db2777" stroke-width="2"></circle>' +
        '<text x="40" y="25" font-size="13">玫瑰</text><text x="200" y="25" font-size="13">菊花</text><text x="205" y="160" font-size="13">百合</text>' +
        '<text x="52" y="76" text-anchor="middle" font-size="15">' + n[0] + '</text>' +
        '<text x="188" y="76" text-anchor="middle" font-size="15">' + n[1] + '</text>' +
        '<text x="120" y="170" text-anchor="middle" font-size="15">' + n[2] + '</text>' +
        '<text x="120" y="48" text-anchor="middle" font-size="15">' + n[3] + '</text>' +
        '<text x="86" y="118" text-anchor="middle" font-size="15">' + n[4] + '</text>' +
        '<text x="154" y="118" text-anchor="middle" font-size="15">' + n[5] + '</text>' +
        '<text x="120" y="92" text-anchor="middle" font-size="15">' + n[6] + '</text></svg>';
      var v = gid(K + '-venn'); if (v) v.innerHTML = h;
    }
    function resetRound() {
      guessed = -1; done = false;
      gid(K + '-q').textContent = lv().q;
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        b.textContent = lv().opts[i]; b.disabled = false;
      }
      var c = gid(K + '-count'); if (c) c.disabled = true;
      var e = gid(K + '-explain'); if (e) e.textContent = '';
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再数一数。');
      drawVenn(false);
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      var c = gid(K + '-count'); if (c) c.disabled = false;
      msg('你猜 ' + lv().opts[g] + '。数一数，看看对不对。');
    }
    function countIt() {
      if (guessed < 0) { msg('先猜一猜，再数一数。'); return; }
      if (done) return;
      done = true;
      drawVenn(true);
      var e = gid(K + '-explain'); if (e) e.textContent = lv().explain;
      var ok = guessed === lv().ans;
      msg(lv().explain + (ok ? '你猜对了！' : '你刚才猜的是 ' + lv().opts[guessed] + '。'));
      if (ok && tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-count').addEventListener('click', countIt);
    gid(K + '-reset').addEventListener('click', resetRound);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：只种玫瑰 4 朵', '提高：只种百合 2 朵', '挑战：一共 10 朵'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm310-trial',
  title: '试商调商',
  sub: '先试一个商：乘大了就调小，余数比除数大就调大，余数比除数小才正好。',
  grade: 3,
  kind: '模拟',
  points: ['3.10'],
  render: function (el) {
    var K = 'm310-trial';
    var LEVELS = [
      { label: '基础', q: '75 ÷ 6', opts: ['11', '12', '13'], ans: 1,
        tries: ['6 × 11 = 66，余 9；9 比 6 大，还能再分，商小了，调大。', '6 × 12 = 72，75 − 72 = 3，余 3 比 6 小，正好！75 ÷ 6 = 12……3。', '6 × 13 = 78，78 比 75 还大，商大了，调小。'] },
      { label: '提高', q: '96 ÷ 7', opts: ['12', '13', '14'], ans: 1,
        tries: ['7 × 12 = 84，余 12；12 比 7 大，还能再分，商小了，调大。', '7 × 13 = 91，96 − 91 = 5，余 5 比 7 小，正好！96 ÷ 7 = 13……5。', '7 × 14 = 98，98 比 96 还大，商大了，调小。'] },
      { label: '挑战', q: '154 ÷ 3', opts: ['50', '51', '52'], ans: 1,
        tries: ['3 × 50 = 150，余 4；4 比 3 大，还能再分，商小了，调大。', '3 × 51 = 153，154 − 153 = 1，余 1 比 3 小，正好！154 ÷ 3 = 51……1。', '3 × 52 = 156，156 比 154 还大，商大了，调小。'] }
    ];
    var levelIdx = 0, guessed = -1, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 3 年级 · 除数是一位数的除法</p>' +
      '<h3>试商调商</h3>' +
      '<p>商是多少？先试一个：用商乘除数，乘出来比被除数大，商就大了；余数比除数大，商就小了。调一调，再试。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span> 的商是多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 试一试：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-t-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-t-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-t-2" type="button"></button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再试一试。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 75 ÷ 6</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 96 ÷ 7</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 154 ÷ 3</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都试对，并且能说出“余数比除数小才正好”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function resetRound() {
      guessed = -1; done = false;
      gid(K + '-q').textContent = lv().q;
      for (var i = 0; i < 3; i++) {
        var g = gid(K + '-g-' + i);
        g.textContent = lv().opts[i]; g.disabled = false;
        var t = gid(K + '-t-' + i);
        t.textContent = '试 ' + lv().opts[i]; t.disabled = true;
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再试一试。');
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) {
        var gb = gid(K + '-g-' + i); if (gb) gb.disabled = true;
        var tb = gid(K + '-t-' + i); if (tb) tb.disabled = false;
      }
      msg('你猜商是 ' + lv().opts[g] + '。试一试，看看对不对。');
    }
    function tryIt(i) {
      if (guessed < 0) { msg('先猜一猜，再试一试。'); return; }
      if (done) return;
      if (i === lv().ans) {
        done = true;
        var ok = guessed === lv().ans;
        msg(lv().tries[i] + (ok ? '你猜对了！' : '商是 ' + lv().opts[lv().ans] + '，你刚才猜的是 ' + lv().opts[guessed] + '。'));
        if (ok && tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg(lv().tries[i] + '再试一个。');
      }
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-t-0').addEventListener('click', function () { tryIt(0); });
    gid(K + '-t-1').addEventListener('click', function () { tryIt(1); });
    gid(K + '-t-2').addEventListener('click', function () { tryIt(2); });
    gid(K + '-reset').addEventListener('click', resetRound);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：75 ÷ 6 = 12……3', '提高：96 ÷ 7 = 13……5', '挑战：154 ÷ 3 = 51……1'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm310-check',
  title: '乘法验算倒推',
  sub: '除法算对没有？倒回去验算：商×除数+余数，应该等于被除数。',
  grade: 3,
  kind: '实验',
  points: ['3.10'],
  render: function (el) {
    var K = 'm310-check';
    var LEVELS = [
      { label: '基础', q: '96 ÷ 4 = 24，对吗？验算要算哪道？', opts: ['24 + 4', '24 × 4', '96 − 24'], ans: 1,
        calc: '24 × 4 = 96，和被除数 96 一样，算对了！',
        trap: '如果商算成 23，23 × 4 = 92，不是 96，商错了。' },
      { label: '提高', q: '84 ÷ 2 = 42，对吗？验算要算哪道？', opts: ['42 + 2', '42 × 2', '84 − 42'], ans: 1,
        calc: '42 × 2 = 84，和被除数 84 一样，算对了！',
        trap: '如果商算成 41，41 × 2 = 82，不是 84，商错了。' },
      { label: '挑战', q: '154 ÷ 3 = 51……1，对吗？验算要算哪道？', opts: ['51 × 3', '51 × 3 + 1', '51 + 3'], ans: 1,
        calc: '51 × 3 = 153，再加余数 1，153 + 1 = 154，和被除数一样，算对了！',
        trap: '如果忘了加余数，153 不是 154，验算就对不上。' }
    ];
    var levelIdx = 0, guessed = -1, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 3 年级 · 除数是一位数的除法</p>' +
      '<h3>乘法验算倒推</h3>' +
      '<p>除法是乘法的反面：商乘除数，应该回到被除数；有余数的时候，还要把余数加上。倒回去对不上，商就是错的。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 验算：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-verify" type="button">验算</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再验算。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 96 ÷ 4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 84 ÷ 2</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 154 ÷ 3</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都验算对，并且能说出“商×除数+余数=被除数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function resetRound() {
      guessed = -1; done = false;
      gid(K + '-q').textContent = lv().q;
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        b.textContent = lv().opts[i]; b.disabled = false;
      }
      var v = gid(K + '-verify'); if (v) v.disabled = true;
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再验算。');
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      var v = gid(K + '-verify'); if (v) v.disabled = false;
      msg('你猜 ' + lv().opts[g] + '。验算一下，看看对不对。');
    }
    function verifyIt() {
      if (guessed < 0) { msg('先猜一猜，再验算。'); return; }
      if (done) return;
      done = true;
      var ok = guessed === lv().ans;
      msg(lv().calc + lv().trap + (ok ? '你猜对了！' : '你刚才猜的是 ' + lv().opts[guessed] + '，记住：商×除数+余数=被除数。'));
      if (ok && tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-verify').addEventListener('click', verifyIt);
    gid(K + '-reset').addEventListener('click', resetRound);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：24 × 4 = 96', '提高：42 × 2 = 84', '挑战：51 × 3 + 1 = 154'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm311-dots',
  title: '点阵→空格阵',
  sub: '23×15 先画满点阵，再擦成空格阵，最后只留竖式：点、格子、竖式是同一道题。',
  grade: 3,
  kind: '模拟',
  points: ['3.11'],
  render: function (el) {
    var K = 'm311-dots';
    var LEVELS = [
      { label: '基础', a: 23, b: 15, splitA: 20, remA: 3, splitB: 10, remB: 5, opts: ['315', '345', '375'], ans: 1,
        blocks: ['20 × 10 = 200', '20 × 5 = 100', '3 × 10 = 30', '3 × 5 = 15'],
        total: '200 + 100 + 30 + 15 = 345',
        rows: '竖式：23 × 5 = 115 是第一行，23 × 10 = 230 是第二行，115 + 230 = 345。' },
      { label: '提高', a: 24, b: 13, splitA: 20, remA: 4, splitB: 10, remB: 3, opts: ['282', '312', '342'], ans: 1,
        blocks: ['20 × 10 = 200', '20 × 3 = 60', '4 × 10 = 40', '4 × 3 = 12'],
        total: '200 + 60 + 40 + 12 = 312',
        rows: '竖式：24 × 3 = 72 是第一行，24 × 10 = 240 是第二行，72 + 240 = 312。' },
      { label: '挑战', a: 32, b: 14, splitA: 30, remA: 2, splitB: 10, remB: 4, opts: ['418', '448', '478'], ans: 1,
        blocks: ['30 × 10 = 300', '30 × 4 = 120', '2 × 10 = 20', '2 × 4 = 8'],
        total: '300 + 120 + 20 + 8 = 448',
        rows: '竖式：32 × 4 = 128 是第一行，32 × 10 = 320 是第二行，128 + 320 = 448。' }
    ];
    var levelIdx = 0, guessed = -1, stage = 0, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 3 年级 · 两位数乘两位数</p>' +
      '<h3>点阵→空格阵</h3>' +
      '<p>乘法是长方形：23×15 就是 15 行、每行 23 个点。先画满点阵，再擦成空格阵，最后只留竖式——三步是同一道题。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span> 等于多少？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 画一画，擦一擦：</p>' +
      '<div id="' + K + '-grid"></div>' +
      '<p id="' + K + '-legend"></p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-dot-btn" type="button">画点阵</button>' +
      '<button class="btn small primary" id="' + K + '-grid-btn" type="button">擦成空格</button>' +
      '<button class="btn small primary" id="' + K + '-vert-btn" type="button">只留竖式</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再画点阵。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 23 × 15</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 24 × 13</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 32 × 14</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都算对，并且能说出“点阵、空格阵、竖式是同一道题”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function blockColor(r, c) {
      if (c < lv().splitA && r < lv().splitB) return 0;
      if (c < lv().splitA) return 1;
      if (r < lv().splitB) return 2;
      return 3;
    }
    function drawGrid() {
      var dots = ['#2563eb', '#16a34a', '#ea580c', '#c2410c'];
      var cells = ['#dbeafe', '#dcfce7', '#ffedd5', '#fee2e2'];
      var h = '';
      if (stage === 3) {
        h = '<p>' + lv().blocks[0] + '；' + lv().blocks[1] + '；' + lv().blocks[2] + '；' + lv().blocks[3] + '</p><p>' + lv().total + '。</p><p>' + lv().rows + '</p>';
      } else {
        for (var r = 0; r < lv().b; r++) {
          for (var c = 0; c < lv().a; c++) {
            var bi = blockColor(r, c);
            if (stage === 1) h += '<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:' + dots[bi] + ';margin:1px;"></span>';
            else if (stage === 2) h += '<span style="display:inline-block;width:9px;height:9px;background:' + cells[bi] + ';border:1px solid #94a3b8;margin:0;"></span>';
          }
          h += '<br>';
        }
      }
      var g = gid(K + '-grid'); if (g) g.innerHTML = h;
      var lg = gid(K + '-legend');
      if (lg) {
        lg.textContent = stage === 0 ? '' :
          '蓝：' + lv().blocks[0] + '；绿：' + lv().blocks[1] + '；橙：' + lv().blocks[2] + '；红：' + lv().blocks[3] + '。';
      }
    }
    function resetRound() {
      guessed = -1; stage = 0; done = false;
      gid(K + '-q').textContent = lv().a + ' × ' + lv().b;
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        b.textContent = lv().opts[i]; b.disabled = false;
      }
      var d = gid(K + '-dot-btn'); if (d) d.disabled = true;
      var g = gid(K + '-grid-btn'); if (g) g.disabled = true;
      var v = gid(K + '-vert-btn'); if (v) v.disabled = true;
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再画点阵。');
      drawGrid();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      var d = gid(K + '-dot-btn'); if (d) d.disabled = false;
      msg('你猜 ' + lv().opts[g] + '。先画满点阵。');
    }
    function drawDots() {
      if (guessed < 0 || stage !== 0) return;
      stage = 1;
      var g = gid(K + '-grid-btn'); if (g) g.disabled = false;
      drawGrid();
      msg('点阵画好了：' + lv().b + ' 行、每行 ' + lv().a + ' 个点。擦成空格阵，格子还在。');
    }
    function drawBlank() {
      if (stage !== 1) return;
      stage = 2;
      var v = gid(K + '-vert-btn'); if (v) v.disabled = false;
      drawGrid();
      msg('擦成空格阵：点没了，格子还在，四块面积是 ' + lv().total + '。最后只留竖式。');
    }
    function drawVert() {
      if (stage !== 2 || done) return;
      stage = 3;
      done = true;
      drawGrid();
      var total = lv().a * lv().b;
      var ok = guessed === lv().ans;
      msg(lv().total + '。' + lv().rows + (ok ? '你猜对了！' : '你刚才猜的是 ' + lv().opts[guessed] + '，答案是 ' + total + '。'));
      if (ok && tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-dot-btn').addEventListener('click', drawDots);
    gid(K + '-grid-btn').addEventListener('click', drawBlank);
    gid(K + '-vert-btn').addEventListener('click', drawVert);
    gid(K + '-reset').addEventListener('click', resetRound);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：23 × 15 = 345', '提高：24 × 13 = 312', '挑战：32 × 14 = 448'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm312-cut',
  title: '切一切再拼',
  sub: '图形切开、平移、再拼成长方形：方砖还是那么多块，面积不变。',
  grade: 3,
  kind: '实验',
  points: ['3.12'],
  render: function (el) {
    var K = 'm312-cut';
    var LEVELS = [
      { label: '基础', rows: [1, 2, 3], remRows: [2, 3], piece: 1, pieceText: '切下顶上 1 格。', rect: [3, 3], area: 6, opts: ['5', '6', '7'], ans: 1,
        moveText: '把这 1 格拼到第二行右边，第二行变成 3 格。' },
      { label: '提高', rows: [4, 2, 2], remRows: [4], piece: 4, pieceText: '切下底下两行，一共 4 格。', rect: [4, 4], area: 8, opts: ['7', '8', '9'], ans: 1,
        moveText: '把这 4 格拼成一行，放在上面那行下面。' },
      { label: '挑战', rows: [6, 3, 3], remRows: [6, 3], piece: 3, pieceText: '切下底下一行，3 格。', rect: [6, 6], area: 12, opts: ['11', '12', '13'], ans: 1,
        moveText: '把这 3 格拼到第二行右边，第二行变成 6 格。' }
    ];
    var levelIdx = 0, guessed = -1, stage = 0, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 3 年级 · 面积</p>' +
      '<h3>切一切再拼</h3>' +
      '<p>这个图形不是长方形，面积是多少？切一刀，把切下来的那块平移过去，拼成长方形——方砖一块没少，面积就不变。</p>' +
      '<p>第 1 步 · 先猜：拼成长方形之后，面积是多少平方厘米？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 切一刀，再拼过去：</p>' +
      '<div id="' + K + '-shape"></div>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-cut" type="button">切一刀</button>' +
      '<button class="btn small primary" id="' + K + '-paste" type="button">拼过去</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再切一刀。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 楼梯 1-2-3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 4-2-2</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 6-3-3</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都拼对，并且能说出“切开再拼，面积不变”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function rowHtml(n, color) {
      var s = '';
      for (var i = 0; i < n; i++) s += '<span style="display:inline-block;width:22px;height:22px;background:' + color + ';border:1px solid #fff;margin:1px;"></span>';
      return '<p>' + s + '</p>';
    }
    function drawShape() {
      var h = '';
      if (stage === 0) {
        lv().rows.forEach(function (n) { h += rowHtml(n, '#2563eb'); });
      } else if (stage === 1) {
        lv().remRows.forEach(function (n) { h += rowHtml(n, '#2563eb'); });
        h += '<p>切下来的：</p>' + rowHtml(lv().piece, '#c2410c');
      } else {
        lv().rect.forEach(function (n) { h += rowHtml(n, '#15803d'); });
      }
      var s = gid(K + '-shape'); if (s) s.innerHTML = h;
    }
    function resetRound() {
      guessed = -1; stage = 0; done = false;
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        b.textContent = lv().opts[i]; b.disabled = false;
      }
      var c = gid(K + '-cut'); if (c) c.disabled = true;
      var p = gid(K + '-paste'); if (p) p.disabled = true;
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再切一刀。');
      drawShape();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      var c = gid(K + '-cut'); if (c) c.disabled = false;
      msg('你猜 ' + lv().opts[g] + ' 平方厘米。切一刀，看看。');
    }
    function cutIt() {
      if (guessed < 0 || stage !== 0) return;
      stage = 1;
      var p = gid(K + '-paste'); if (p) p.disabled = false;
      drawShape();
      msg(lv().pieceText + '再拼过去。');
    }
    function pasteIt() {
      if (stage !== 1 || done) return;
      stage = 2;
      done = true;
      drawShape();
      var ok = guessed === lv().ans;
      msg(lv().moveText + '拼成了长方形，方砖还是 ' + lv().area + ' 块，面积不变：' + lv().area + ' 平方厘米。' + (ok ? '你猜对了！' : '你刚才猜的是 ' + lv().opts[guessed] + ' 平方厘米。'));
      if (ok && tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-cut').addEventListener('click', cutIt);
    gid(K + '-paste').addEventListener('click', pasteIt);
    gid(K + '-reset').addEventListener('click', resetRound);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：楼梯拼成长方形，面积 6', '提高：4-2-2 拼成长方形，面积 8', '挑战：6-3-3 拼成长方形，面积 12'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm312-unit',
  title: '单位进率方格',
  sub: '1 平方分米里能铺 10 行、每行 10 个平方厘米，一共 100 个；平方米是 100×100。',
  grade: 3,
  kind: '演示',
  points: ['3.12'],
  render: function (el) {
    var K = 'm312-unit';
    var LEVELS = [
      { label: '基础', unit: '平方厘米', big: '平方分米', per: 100, opts: ['10', '100', '1000'], ans: 1, cell: '1 平方厘米',
        text: '1 平方分米 = 10 × 10 = 100 平方厘米。' },
      { label: '提高', unit: '平方分米', big: '平方米', per: 100, opts: ['10', '100', '1000'], ans: 1, cell: '1 平方分米',
        text: '1 平方米 = 10 × 10 = 100 平方分米。' },
      { label: '挑战', unit: '平方厘米', big: '平方米', per: 10000, opts: ['1000', '10000', '100000'], ans: 1, cell: '100 平方厘米',
        text: '1 米 = 100 厘米，1 平方米 = 100 × 100 = 10000 平方厘米。' }
    ];
    var levelIdx = 0, guessed = -1, rows = 0, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 3 年级 · 面积</p>' +
      '<h3>单位进率方格</h3>' +
      '<p>大单位里能铺多少个小单位？一行一行铺：每行 10 格，铺满 10 行，就是 10×10。</p>' +
      '<p>第 1 步 · 先猜：1 <span id="' + K + '-big"></span>等于几个<span id="' + K + '-unit"></span>？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 铺一铺：每格是 <span id="' + K + '-cell"></span>。</p>' +
      '<div id="' + K + '-grid"></div>' +
      '<p id="' + K + '-prog"></p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-row" type="button">铺一行</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再铺一铺。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 平方分米</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 平方米（分米）</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 平方米（厘米）</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都铺对，并且能说出“进率是边长的进率相乘”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawGrid() {
      var h = '';
      for (var r = 0; r < 10; r++) {
        for (var c = 0; c < 10; c++) {
          var on = r < rows;
          h += '<span style="display:inline-block;width:16px;height:16px;background:' + (on ? '#2563eb' : '#e2e8f0') + ';border:1px solid #94a3b8;margin:0;"></span>';
        }
        h += '<br>';
      }
      var g = gid(K + '-grid'); if (g) g.innerHTML = h;
      var p = gid(K + '-prog');
      if (p) p.textContent = '已铺 ' + rows + ' 行，一共 ' + (rows * 10) + ' 格，每格是 ' + lv().cell + '。';
    }
    function resetRound() {
      guessed = -1; rows = 0; done = false;
      gid(K + '-big').textContent = lv().big;
      gid(K + '-unit').textContent = lv().unit;
      gid(K + '-cell').textContent = lv().cell;
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        b.textContent = lv().opts[i]; b.disabled = false;
      }
      var r = gid(K + '-row'); if (r) r.disabled = true;
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再铺一铺。');
      drawGrid();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      var r = gid(K + '-row'); if (r) r.disabled = false;
      msg('你猜 1 ' + lv().big + ' = ' + lv().opts[g] + ' ' + lv().unit + '。一行一行铺，看看对不对。');
    }
    function layRow() {
      if (guessed < 0) { msg('先猜一猜，再铺一铺。'); return; }
      if (done) return;
      rows++;
      drawGrid();
      if (rows >= 10) {
        done = true;
        var ok = guessed === lv().ans;
        msg('铺满了：10 行 × 10 格 = 100 格。' + lv().text + (ok ? '你猜对了！' : '你刚才猜的是 ' + lv().opts[guessed] + '。'));
        if (ok && tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
        var r = gid(K + '-row'); if (r) r.disabled = true;
      } else {
        msg('铺了 ' + rows + ' 行，还差 ' + (10 - rows) + ' 行。');
      }
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-row').addEventListener('click', layRow);
    gid(K + '-reset').addEventListener('click', resetRound);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：1 平方分米 = 100 平方厘米', '提高：1 平方米 = 100 平方分米', '挑战：1 平方米 = 10000 平方厘米'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm313-leap',
  title: '闰年成因',
  sub: '一年不是正好 365 天，还多 1/4 天：4 年攒出 1 天，放在 2 月 29 日。',
  grade: 3,
  kind: '实验',
  points: ['3.13'],
  render: function (el) {
    var K = 'm313-leap';
    var LEVELS = [
      { label: '基础', q: '一年是 365 天，还多出多少天？几年能攒出 1 天？', opts: ['1/4 天，2 年', '1/4 天，4 年', '1/2 天，2 年'], ans: 1, jarLabel: '攒的零头（每格是 1/4 天）',
        steps: ['2025 年：攒了 1/4 天。', '2026 年：攒了 2/4 天，也就是半天。', '2027 年：攒了 3/4 天。', '2028 年：攒满 1 天，2 月多出 1 天，是 29 天！'],
        text: '一年多 1/4 天，4 年攒出 1 天，放在 2 月 29 日，这一年就是闰年。2024 年是闰年，2028 年也是闰年。' },
      { label: '提高', q: '2025 年是平年，2 月有几天？', opts: ['28 天', '29 天', '30 天'], ans: 0, jarLabel: '攒的零头（每格是 1/4 天）',
        steps: ['2025 年是平年，只攒了 1/4 天，不够 1 天，2 月没有多出的一天。'],
        text: '2025 年是平年，2 月只有 28 天；闰年的 2 月才有 29 天。' },
      { label: '挑战', q: '小华 2012 年 2 月 29 日出生，2024 年他过了第 3 个生日，他几岁？', opts: ['3 岁', '12 岁', '15 岁'], ans: 1, jarLabel: '过过的生日（每格是 1 个 2 月 29 日）',
        steps: ['2016 年：第 1 个生日，4 岁。', '2020 年：第 2 个生日，8 岁。', '2024 年：第 3 个生日，12 岁。'],
        text: '2 月 29 日每 4 年才有一次：3 个生日就是 3 × 4 = 12 岁。' }
    ];
    var levelIdx = 0, guessed = -1, stepIdx = 0, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 3 年级 · 年、月、日</p>' +
      '<h3>闰年成因</h3>' +
      '<p>地球绕太阳一圈不是正好 365 天，还多一点点。每年多出来的零头攒起来，4 年就攒成一整天。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 一年一年过：</p>' +
      '<p><span id="' + K + '-jarlabel"></span></p>' +
      '<div id="' + K + '-jar"></div>' +
      '<div id="' + K + '-steps"></div>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-year" type="button">过一年</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再一年一年过。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 攒 1/4 天</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 2025 年 2 月</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 2 月 29 日生日</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都过对，并且能说出“4 年攒 1 天，放在 2 月 29 日”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawJar() {
      var h = '';
      for (var i = 0; i < 4; i++) {
        h += '<span style="display:inline-block;width:34px;height:34px;line-height:34px;text-align:center;margin:3px;border-radius:6px;background:' + (i < stepIdx ? '#2563eb' : '#e2e8f0') + ';color:' + (i < stepIdx ? '#fff' : '#94a3b8') + ';">' + (i < stepIdx ? '满' : '空') + '</span>';
      }
      var j = gid(K + '-jar'); if (j) j.innerHTML = h;
    }
    function resetRound() {
      guessed = -1; stepIdx = 0; done = false;
      gid(K + '-q').textContent = lv().q;
      gid(K + '-jarlabel').textContent = lv().jarLabel;
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        b.textContent = lv().opts[i]; b.disabled = false;
      }
      var y = gid(K + '-year'); if (y) y.disabled = true;
      var st = gid(K + '-steps'); if (st) st.innerHTML = '';
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再一年一年过。');
      drawJar();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      var y = gid(K + '-year'); if (y) y.disabled = false;
      msg('你猜 ' + lv().opts[g] + '。一年一年过，看看对不对。');
    }
    function nextYear() {
      if (guessed < 0) { msg('先猜一猜，再一年一年过。'); return; }
      if (done) return;
      var st = gid(K + '-steps');
      if (st) st.innerHTML = st.innerHTML + '<p>' + lv().steps[stepIdx] + '</p>';
      stepIdx++;
      drawJar();
      if (stepIdx >= lv().steps.length) {
        done = true;
        var ok = guessed === lv().ans;
        msg(lv().text + (ok ? '你猜对了！' : '你刚才猜的是 ' + lv().opts[guessed] + '。'));
        if (ok && tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
        var y = gid(K + '-year'); if (y) y.disabled = true;
      } else {
        msg('过了 ' + stepIdx + ' 年，继续。');
      }
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-year').addEventListener('click', nextYear);
    gid(K + '-reset').addEventListener('click', resetRound);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：4 年攒 1 天，闰年', '提高：2025 年 2 月 28 天', '挑战：3 个生日是 12 岁'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm314-money',
  title: '钱币元角分',
  sub: '0.5 元就是 5 角，5 个十分之一元：拿硬币凑一凑，小数点后第一位就是角。',
  grade: 3,
  kind: '演示',
  points: ['3.14'],
  render: function (el) {
    var K = 'm314-money';
    var LEVELS = [
      { label: '基础', target: '0.5 元', yuan: 0, jiao: 5, opts: ['3 角', '5 角', '10 角'], ans: 1,
        text: '0.5 元 = 5 角 = 5 个十分之一元。' },
      { label: '提高', target: '0.8 元', yuan: 0, jiao: 8, opts: ['5 角', '8 角', '10 角'], ans: 1,
        text: '0.8 元 = 8 角 = 8 个十分之一元。' },
      { label: '挑战', target: '1.3 元', yuan: 1, jiao: 3, opts: ['3 角', '10 角', '13 角'], ans: 2,
        text: '1.3 元 = 13 角 = 1 元 3 角。' }
    ];
    var levelIdx = 0, guessed = -1, yCount = 0, jCount = 0, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 3 年级 · 小数的初步认识</p>' +
      '<h3>钱币元角分</h3>' +
      '<p>1 元 = 10 角，1 角 = 10 分。小数点后第一位是角：0.5 元就是 5 角。拿硬币凑出要付的钱。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-target"></span>是几角？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 拿硬币凑一凑：</p>' +
      '<div id="' + K + '-bar"></div>' +
      '<p id="' + K + '-have"></p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-coin-yuan" type="button">放 1 元</button>' +
      '<button class="btn small primary" id="' + K + '-coin-jiao" type="button">放 1 角</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再拿硬币。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 0.5 元</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 0.8 元</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 1.3 元</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都凑对，并且能说出“小数点后第一位是角”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function targetJiao() { return lv().yuan * 10 + lv().jiao; }
    function haveJiao() { return yCount * 10 + jCount; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawBar() {
      var h = '';
      var filled = haveJiao() > 10 ? 10 : haveJiao();
      for (var i = 0; i < 10; i++) {
        h += '<span style="display:inline-block;width:22px;height:22px;background:' + (i < filled ? '#f59e0b' : '#e2e8f0') + ';border:1px solid #94a3b8;margin:1px;"></span>';
      }
      var b = gid(K + '-bar'); if (b) b.innerHTML = h;
      var hv = gid(K + '-have');
      if (hv) hv.textContent = '已经放了 ' + yCount + ' 个 1 元、' + jCount + ' 个 1 角，一共 ' + haveJiao() + ' 角。目标是 ' + lv().target + '（' + targetJiao() + ' 角）。';
    }
    function resetRound() {
      guessed = -1; yCount = 0; jCount = 0; done = false;
      gid(K + '-target').textContent = lv().target;
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        b.textContent = lv().opts[i]; b.disabled = false;
      }
      var y = gid(K + '-coin-yuan'); if (y) y.disabled = true;
      var j = gid(K + '-coin-jiao'); if (j) j.disabled = true;
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再拿硬币。');
      drawBar();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      var y = gid(K + '-coin-yuan'); if (y) y.disabled = false;
      var j = gid(K + '-coin-jiao'); if (j) j.disabled = false;
      msg('你猜 ' + lv().opts[g] + '。拿硬币凑一凑，看看对不对。');
    }
    function putCoin(kind) {
      if (guessed < 0) { msg('先猜一猜，再拿硬币。'); return; }
      if (done) return;
      if (kind === 'y') yCount++;
      else jCount++;
      drawBar();
      if (haveJiao() === targetJiao()) {
        done = true;
        var ok = guessed === lv().ans;
        msg('凑齐了：' + lv().text + (ok ? '你猜对了！' : '你刚才猜的是 ' + lv().opts[guessed] + '。'));
        if (ok && tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else if (haveJiao() > targetJiao()) {
        msg('放多了：现在一共 ' + haveJiao() + ' 角，比 ' + targetJiao() + ' 角多，点“重来”。');
      } else {
        msg('还差 ' + (targetJiao() - haveJiao()) + ' 角，继续放。');
      }
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-coin-yuan').addEventListener('click', function () { putCoin('y'); });
    gid(K + '-coin-jiao').addEventListener('click', function () { putCoin('j'); });
    gid(K + '-reset').addEventListener('click', resetRound);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：0.5 元 = 5 角', '提高：0.8 元 = 8 角', '挑战：1.3 元 = 13 角'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm314-zoom',
  title: '数轴放大镜',
  sub: '0 到 1 之间还有十分位，十分位之间还有百分位：放大镜一层一层看下去。',
  grade: 3,
  kind: '模拟',
  points: ['3.14'],
  render: function (el) {
    var K = 'm314-zoom';
    var LEVELS = [
      { label: '基础', q: '0.5 在 0 到 1 的数轴上，大概在哪？', opts: ['靠 0', '正中间', '靠 1'], ans: 1,
        zooms: ['放大 0 到 1：先看十分位，0.1、0.2、0.3、0.4、0.5……0.5 在 0.4 和 0.6 中间，正好是中间。'],
        verdict: '0.5 是 5 个十分之一，在 0 到 1 正中间。' },
      { label: '提高', q: '0.25 在哪？', opts: ['0.2 和 0.3 正中间', '靠 0.2', '靠 0.3'], ans: 0,
        zooms: ['先放大 0 到 1：0.25 在 0.2 和 0.3 之间。', '再放大 0.2 到 0.3：0.21、0.22、0.23、0.24、0.25……0.25 在正中间，两边都是 0.05。'],
        verdict: '0.25 是 25 个百分之一，在 0.2 和 0.3 正中间。' },
      { label: '挑战', q: '0.7 和 0.65，哪个大？', opts: ['0.7 大', '0.65 大', '一样大'], ans: 0,
        zooms: ['放大 0.6 到 0.7：0.61、0.62……0.65 在中间，0.7 在最右头。', '0.7 比 0.65 多 0.05。'],
        verdict: '0.7 大：0.7 是 7 个十分之一，0.65 只有 6 个十分之一多一点。' }
    ];
    var levelIdx = 0, guessed = -1, zoomIdx = 0, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 3 年级 · 小数的初步认识</p>' +
      '<h3>数轴放大镜</h3>' +
      '<p>0 到 1 之间不是空的：放大看，里面有 0.1、0.2……0.9；再放大，0.2 和 0.3 之间还有 0.21、0.22……</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 放大镜一层一层看：</p>' +
      '<div id="' + K + '-zooms"></div>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-zoom-btn" type="button">放大</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再放大看。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 0.5 在哪</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 0.25 在哪</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 0.7 和 0.65</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都看对，并且能说出“十分位之间还有百分位”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function resetRound() {
      guessed = -1; zoomIdx = 0; done = false;
      gid(K + '-q').textContent = lv().q;
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        b.textContent = lv().opts[i]; b.disabled = false;
      }
      var z = gid(K + '-zoom-btn'); if (z) z.disabled = true;
      var zs = gid(K + '-zooms'); if (zs) zs.innerHTML = '';
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再放大看。');
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      var z = gid(K + '-zoom-btn'); if (z) z.disabled = false;
      msg('你猜 ' + lv().opts[g] + '。放大看，看看对不对。');
    }
    function zoomIn() {
      if (guessed < 0) { msg('先猜一猜，再放大看。'); return; }
      if (done) return;
      var zs = gid(K + '-zooms');
      if (zs) zs.innerHTML = zs.innerHTML + '<p>' + lv().zooms[zoomIdx] + '</p>';
      zoomIdx++;
      if (zoomIdx >= lv().zooms.length) {
        done = true;
        var ok = guessed === lv().ans;
        msg(lv().verdict + (ok ? '你猜对了！' : '你刚才猜的是 ' + lv().opts[guessed] + '。'));
        if (ok && tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
        var z = gid(K + '-zoom-btn'); if (z) z.disabled = true;
      } else {
        msg('再放大一层。');
      }
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-zoom-btn').addEventListener('click', zoomIn);
    gid(K + '-reset').addEventListener('click', resetRound);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：0.5 在正中间', '提高：0.25 在 0.2 和 0.3 正中间', '挑战：0.7 比 0.65 大'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm314-frac',
  title: '分数改写小数',
  sub: '十分之几就是零点几：3/10 是 3 个十分之一，写成 0.3；25/100 就是 0.25。',
  grade: 3,
  kind: '演示',
  points: ['3.14'],
  render: function (el) {
    var K = 'm314-frac';
    var LEVELS = [
      { label: '基础', q: '3/10 写成小数是多少？', opts: ['0.03', '0.3', '3.0'], ans: 1,
        strips: [{ n: 10, fill: 3, label: '10 格的条，涂 3 格' }],
        text: '3/10 是 3 个十分之一，写成小数是 0.3。' },
      { label: '提高', q: '25/100 写成小数是多少？', opts: ['0.25', '2.5', '0.025'], ans: 0,
        strips: [{ n: 100, fill: 25, label: '100 格的方格，涂 25 格' }],
        text: '25/100 是 25 个百分之一，写成小数是 0.25。' },
      { label: '挑战', q: '0.6 和 0.60，哪个大？', opts: ['一样大', '0.6 大', '0.60 大'], ans: 0,
        strips: [{ n: 10, fill: 6, label: '0.6 的条：10 格，涂 6 格' }, { n: 100, fill: 60, label: '0.60 的条：100 格，涂 60 格' }],
        text: '0.6 是 6 个十分之一，0.60 是 60 个百分之一，两条条一样长，末尾的 0 不改变大小。' }
    ];
    var levelIdx = 0, guessed = -1, painted = false, done = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 3 年级 · 小数的初步认识</p>' +
      '<h3>分数改写小数</h3>' +
      '<p>小数是分母 10、100 的分数换了写法：分母是 10，分子是几就是零点几；分母是 100，就是零点零几。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 涂一涂，再写成小数：</p>' +
      '<div id="' + K + '-strips"></div>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-paint" type="button">涂一涂</button>' +
      '<button class="btn small primary" id="' + K + '-write" type="button">写成小数</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再涂一涂。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 3/10</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 25/100</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 0.6 和 0.60</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都改对，并且能说出“十分之几就是零点几”。</p>';
    function gid(id) { return document.getElementById(id); }
    function lv() { return LEVELS[levelIdx]; }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawStrips() {
      var h = '';
      lv().strips.forEach(function (st) {
        h += '<p>' + st.label + '：</p><p>';
        for (var i = 0; i < st.n; i++) {
          var on = painted && i < st.fill;
          h += '<span style="display:inline-block;width:12px;height:12px;background:' + (on ? '#2563eb' : '#e2e8f0') + ';border:1px solid #94a3b8;margin:0;"></span>';
          if (st.n === 100 && (i + 1) % 10 === 0) h += '<br>';
        }
        h += '</p>';
      });
      var s = gid(K + '-strips'); if (s) s.innerHTML = h;
    }
    function resetRound() {
      guessed = -1; painted = false; done = false;
      gid(K + '-q').textContent = lv().q;
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        b.textContent = lv().opts[i]; b.disabled = false;
      }
      var p = gid(K + '-paint'); if (p) p.disabled = true;
      var w = gid(K + '-write'); if (w) w.disabled = true;
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜，再涂一涂。');
      drawStrips();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(g) {
      if (done) return;
      guessed = g;
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      var p = gid(K + '-paint'); if (p) p.disabled = false;
      msg('你猜 ' + lv().opts[g] + '。涂一涂，看看对不对。');
    }
    function paintIt() {
      if (guessed < 0 || painted) return;
      painted = true;
      var w = gid(K + '-write'); if (w) w.disabled = false;
      drawStrips();
      msg('涂好了。再写成小数。');
    }
    function writeIt() {
      if (!painted || done) return;
      done = true;
      var ok = guessed === lv().ans;
      msg(lv().text + (ok ? '你猜对了！' : '你刚才猜的是 ' + lv().opts[guessed] + '。'));
      if (ok && tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-paint').addEventListener('click', paintIt);
    gid(K + '-write').addEventListener('click', writeIt);
    gid(K + '-reset').addEventListener('click', resetRound);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3/10 = 0.3', '提高：25/100 = 0.25', '挑战：0.6 = 0.60'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

/* ---------- 1.2 位置 ---------- */
registerAnim({
  key: 'm12-map',
  title: '教室地图找位置',
  sub: '教室地图上有一朵小红花：它在第几排第几个？用方位词说清楚。',
  grade: 1,
  kind: '模拟',
  points: ['1.2'],
  render: function (el) {
    var K = 'm12-map';
    var LEVELS = [
      { label: '基础', r: 1, c: 2, opts: ['第 1 排第 1 个', '第 1 排第 2 个', '第 1 排第 3 个', '第 2 排第 2 个'], ans: 1, where: '上面一排中间' },
      { label: '提高', r: 2, c: 3, opts: ['第 2 排第 1 个', '第 2 排第 2 个', '第 2 排第 3 个', '第 3 排第 3 个'], ans: 2, where: '中间一排右边' },
      { label: '挑战', r: 3, c: 1, opts: ['第 3 排第 1 个', '第 3 排第 2 个', '第 3 排第 3 个', '第 2 排第 1 个'], ans: 0, where: '下面一排左边' }
    ];
    var levelIdx = 0, guessed = -1, done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 1 年级 · 位置</p>' +
      '<h3>教室地图找位置</h3>' +
      '<p>下面是教室的座位图，每格是一张桌子，有一张桌子上放着一朵小红花。花在哪儿？排数从上面往下数，个数从左边往右数。</p>' +
      '<div id="' + K + '-grid"></div>' +
      '<p>第 1 步 · 先猜：小红花在第几排第几个？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-3" type="button"></button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“说出位置”核对。</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-say" type="button">说出位置</button></div>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 上面一排</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 中间一排</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 下面一排</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说对，并且能说出“排数从上往下数，个数从左往右数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawGrid() {
      var L = lv(), h = '';
      for (var r = 1; r <= 3; r++) {
        h += '<div>';
        for (var c = 1; c <= 3; c++) {
          var star = (r === L.r && c === L.c);
          h += '<span style="display:inline-block;width:44px;height:44px;line-height:44px;text-align:center;margin:3px;border:2px solid #94a3b8;border-radius:8px;font-size:22px;' + (star ? 'background:#fef3c7;border-color:#f59e0b;' : '') + '">' + (star ? '🌸' : '桌') + '</span>';
        }
        h += '<span> 第 ' + r + ' 排</span></div>';
      }
      var g = gid(K + '-grid'); if (g) g.innerHTML = h;
    }
    function resetRound() {
      guessed = -1; done = false;
      var L = lv();
      for (var i = 0; i < 4; i++) {
        var b = gid(K + '-g-' + i);
        if (b) { b.textContent = L.opts[i]; b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜：小红花在第几排第几个？');
      drawGrid();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(i) {
      if (done) return;
      guessed = i;
      msg('你猜：' + lv().opts[i] + '。点“说出位置”核对。');
    }
    function say() {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：小红花在第几排第几个？'); return; }
      var L = lv();
      done = true;
      var ok = guessed === L.ans;
      msg(ok ? '对了！小红花在第 ' + L.r + ' 排第 ' + L.c + ' 个，就是' + L.where + '。你猜对了！'
        : '不对：小红花在第 ' + L.r + ' 排第 ' + L.c + ' 个，就是' + L.where + '。你刚才猜的是' + L.opts[guessed] + '，排数从上面往下数，再数一遍。');
      for (var i = 0; i < 4; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-g-3').addEventListener('click', function () { onGuess(3); });
    gid(K + '-say').addEventListener('click', say);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：说出上面一排的花', '提高：说出中间一排的花', '挑战：说出下面一排的花'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm12-hunt',
  title: '方位寻宝',
  sub: '按“向前走、向左转、向右转”的口令走，走到宝藏那一格。走错一步就回到起点。',
  grade: 1,
  kind: '实验',
  points: ['1.2'],
  render: function (el) {
    var K = 'm12-hunt';
    var LEVELS = [
      { label: '基础', sr: 3, sc: 2, tr: 1, tc: 2, steps: ['前', '前'], opts: ['第 1 排第 2 个', '第 2 排第 2 个', '第 1 排第 1 个'], ans: 0, clue: '向前走 2 步' },
      { label: '提高', sr: 3, sc: 1, tr: 1, tc: 2, steps: ['前', '前', '右', '前'], opts: ['第 1 排第 2 个', '第 1 排第 1 个', '第 2 排第 2 个'], ans: 0, clue: '向前走 2 步，向右转，再向前走 1 步' },
      { label: '挑战', sr: 3, sc: 3, tr: 2, tc: 1, steps: ['前', '左', '前', '前'], opts: ['第 2 排第 1 个', '第 2 排第 3 个', '第 1 排第 1 个'], ans: 0, clue: '向前走 1 步，向左转，再向前走 2 步' }
    ];
    var levelIdx = 0, guessed = -1, r = 3, c = 2, face = 0, stepIdx = 0, done = false, tiers = null;
    var ARROW = ['↑', '→', '↓', '←'];
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">实验 · 1 年级 · 位置</p>' +
      '<h3>方位寻宝</h3>' +
      '<p>小人站在地图上，宝藏藏在某一格。口令在下面写着：照着口令走，走错一步就回到起点重走。</p>' +
      '<div id="' + K + '-grid"></div>' +
      '<p id="' + K + '-clue"></p>' +
      '<p>第 1 步 · 先猜：宝藏在第几排第几个？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 按口令走：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-fwd" type="button">向前走 1 步</button>' +
      '<button class="btn small primary" id="' + K + '-left" type="button">向左转</button>' +
      '<button class="btn small primary" id="' + K + '-right" type="button">向右转</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">回到起点</button></div>' +
      '<p id="' + K + '-msg">先猜一猜宝藏在哪儿，再按口令走。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 直走 2 步</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 转一次弯</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 转一次弯走 2 步</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都走到宝藏，并且能说出“先猜位置，再按口令一步一步走”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawGrid() {
      var L = lv(), h = '';
      for (var rr = 1; rr <= 3; rr++) {
        h += '<div>';
        for (var cc = 1; cc <= 3; cc++) {
          var here = (rr === r && cc === c);
          var treas = done && (rr === L.tr && cc === L.tc);
          h += '<span style="display:inline-block;width:44px;height:44px;line-height:44px;text-align:center;margin:3px;border:2px solid #94a3b8;border-radius:8px;font-size:22px;' + (treas ? 'background:#fef3c7;border-color:#f59e0b;' : '') + '">' + (treas ? '💎' : here ? '🧍' + ARROW[face] : '·') + '</span>';
        }
        h += '</div>';
      }
      var g = gid(K + '-grid'); if (g) g.innerHTML = h;
    }
    function resetRound() {
      var L = lv();
      guessed = -1; r = L.sr; c = L.sc; face = 0; stepIdx = 0; done = false;
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        if (b) { b.textContent = L.opts[i]; b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      var cl = gid(K + '-clue'); if (cl) cl.textContent = '口令：' + L.clue + '。小人现在面朝上。';
      msg('先猜一猜宝藏在哪儿，再按口令走。');
      drawGrid();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(i) {
      guessed = i;
      msg('你猜宝藏在' + lv().opts[i] + '。按口令走，看看对不对。');
    }
    function backToStart() {
      var L = lv();
      r = L.sr; c = L.sc; face = 0; stepIdx = 0;
      drawGrid();
    }
    function doStep(act) {
      if (done) return;
      var L = lv();
      var want = L.steps[stepIdx];
      if (act !== want) {
        backToStart();
        msg('这一步不对：第 ' + (stepIdx + 1) + ' 步应该是“' + (want === '前' ? '向前走' : want === '左' ? '向左转' : '向右转') + '”，小人回到起点重走。');
        return;
      }
      if (act === '左') face = (face + 3) % 4;
      else if (act === '右') face = (face + 1) % 4;
      else {
        if (face === 0) r--;
        else if (face === 1) c++;
        else if (face === 2) r++;
        else c--;
        if (r < 1 || r > 3 || c < 1 || c > 3) {
          backToStart();
          msg('撞墙了！小人回到起点重走。');
          return;
        }
      }
      stepIdx++;
      if (stepIdx >= L.steps.length) {
        done = true;
        var ok = guessed === L.ans;
        msg('找到宝藏了！宝藏在第 ' + L.tr + ' 排第 ' + L.tc + ' 个。' +
          (guessed < 0 ? '（这次你没猜，下次先猜一个再走。）' : ok ? '你猜对了！' : '你刚才猜的是' + L.opts[guessed] + '，记住口令走到的地方就是宝藏。'));
        for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('走了第 ' + stepIdx + ' 步，还差 ' + (L.steps.length - stepIdx) + ' 步。');
      }
      drawGrid();
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-fwd').addEventListener('click', function () { doStep('前'); });
    gid(K + '-left').addEventListener('click', function () { doStep('左'); });
    gid(K + '-right').addEventListener('click', function () { doStep('右'); });
    gid(K + '-reset').addEventListener('click', function () { backToStart(); msg('回到起点，再按口令走。'); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：直走找到宝藏', '提高：转一次弯找到宝藏', '挑战：转弯再走 2 步找到宝藏'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

/* ---------- 1.3 1–5的认识、分与合 ---------- */
registerAnim({
  key: 'm13-friend',
  title: '找朋友凑5',
  sub: '1 的朋友是 4，2 的朋友是 3——两个数加起来是 5，就是一对朋友。',
  grade: 1,
  kind: '模拟',
  points: ['1.3'],
  render: function (el) {
    var K = 'm13-friend';
    var LEVELS = [
      { label: '基础', n: 2, friend: 3, opts: [1, 2, 3], ans: 2 },
      { label: '提高', n: 1, friend: 4, opts: [2, 3, 4], ans: 2 },
      { label: '挑战', n: 4, friend: 1, opts: [1, 2, 3], ans: 0 }
    ];
    var levelIdx = 0, guessed = -1, done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 1 年级 · 1–5的认识、分与合</p>' +
      '<h3>找朋友凑5</h3>' +
      '<p>5 可以分成两部分：1 和 4、2 和 3、3 和 2、4 和 1。两个数加起来正好是 5，它们就是一对朋友。</p>' +
      '<p>这张卡片是 <b id="' + K + '-card"></b>，它的朋友是几？</p>' +
      '<p>第 1 步 · 先猜：几和它加起来是 5？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 配一配：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-pair" type="button">配一配</button></div>' +
      '<p id="' + K + '-plates"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再配一配。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 2 的朋友</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 1 的朋友</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 4 的朋友</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都配对，并且能说出 5 的全部 4 种分法。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function dots(n) { var s = ''; for (var i = 0; i < n; i++) s += '●'; return s; }
    function resetRound() {
      var L = lv();
      guessed = -1; done = false;
      var cd = gid(K + '-card'); if (cd) cd.textContent = String(L.n);
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        if (b) { b.textContent = String(L.opts[i]); b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      var pl = gid(K + '-plates'); if (pl) pl.textContent = '';
      msg('先猜一猜：几和 ' + L.n + ' 加起来是 5？');
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(i) {
      if (done) return;
      guessed = i;
      msg('你猜 ' + lv().n + ' 的朋友是 ' + lv().opts[i] + '。点“配一配”看看。');
    }
    function pair() {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：几和 ' + lv().n + ' 加起来是 5？'); return; }
      var L = lv(), g = L.opts[guessed];
      var pl = gid(K + '-plates');
      if (pl) pl.textContent = dots(L.n) + ' + ' + dots(g) + ' = ' + (L.n + g) + ' 个';
      if (g === L.friend) {
        done = true;
        msg('配对了！' + L.n + ' + ' + g + ' = 5，' + g + ' 就是 ' + L.n + ' 的朋友。5 的分法要成对记：' + L.n + ' 和 ' + g + ' 是一对。');
        for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else if (L.n + g < 5) {
        msg(L.n + ' + ' + g + ' = ' + (L.n + g) + '，还差 ' + (5 - L.n - g) + ' 才到 5，再想想。');
      } else {
        msg(L.n + ' + ' + g + ' = ' + (L.n + g) + '，超过 5 了，再想想。');
      }
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-pair').addEventListener('click', pair);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：找到 2 的朋友', '提高：找到 1 的朋友', '挑战：找到 4 的朋友'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

/* ---------- 1.4 5以内加减法、0 ---------- */
registerAnim({
  key: 'm14-inverse',
  title: '加法验算减法',
  sub: '5 − 2 = 3，因为 3 + 2 = 5。用加法验算减法，算错了马上现形。',
  grade: 1,
  kind: '模拟',
  points: ['1.4'],
  render: function (el) {
    var K = 'm14-inverse';
    var LEVELS = [
      { label: '基础', a: 5, b: 2, diff: 3, opts: [2, 3, 4], ans: 1 },
      { label: '提高', a: 4, b: 1, diff: 3, opts: [2, 3, 4], ans: 1 },
      { label: '挑战', a: 5, b: 4, diff: 1, opts: [1, 2, 3], ans: 0 }
    ];
    var levelIdx = 0, guessed = -1, done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 1 年级 · 5以内加减法、0</p>' +
      '<h3>加法验算减法</h3>' +
      '<p>减法是加法的反面：拿走了几块，剩下的再加回去，就该回到原来的数。减法算得对不对，用加法一验就知道。</p>' +
      '<p class="func-eq" id="' + K + '-eq"></p>' +
      '<p>第 1 步 · 先猜：□ 里是几？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 用加法验算：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-check" type="button">验算：□ + 拿走的 = 原来的吗？</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再验算。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 5 − 2</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 4 − 1</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 5 − 4</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都验算对，并且能说出“减法用加法验算”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function resetRound() {
      var L = lv();
      guessed = -1; done = false;
      var eq = gid(K + '-eq'); if (eq) eq.textContent = L.a + ' − ' + L.b + ' = □';
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        if (b) { b.textContent = String(L.opts[i]); b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜：□ 里是几？');
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(i) {
      if (done) return;
      guessed = i;
      msg('你猜 □ 是 ' + lv().opts[i] + '。点“验算”看看加回去对不对。');
    }
    function checkIt() {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：□ 里是几？'); return; }
      var L = lv(), g = L.opts[guessed];
      if (g === L.diff) {
        done = true;
        msg('验算对了：' + g + ' + ' + L.b + ' = ' + L.a + '，所以 ' + L.a + ' − ' + L.b + ' = ' + g + '。减法用加法验算，算错了马上现形。');
        for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('验算不对：' + g + ' + ' + L.b + ' = ' + (g + L.b) + '，不是 ' + L.a + '，所以 □ 不是 ' + g + '。');
      }
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-check').addEventListener('click', checkIt);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：验算 5 − 2', '提高：验算 4 − 1', '挑战：验算 5 − 4'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm14-line',
  title: '数线前进后退',
  sub: '加法在数线上向前走，减法向后退，0 步就是原地不动。',
  grade: 1,
  kind: '模拟',
  points: ['1.4'],
  render: function (el) {
    var K = 'm14-line';
    var LEVELS = [
      { label: '基础', start: 2, step: 2, dir: 1, target: 4, op: '2 + 2', opts: [3, 4, 5], ans: 1, verb: '向前走' },
      { label: '提高', start: 5, step: 2, dir: -1, target: 3, op: '5 − 2', opts: [2, 3, 4], ans: 1, verb: '向后退' },
      { label: '挑战', start: 3, step: 0, dir: 1, target: 3, op: '3 + 0', opts: [2, 3, 4], ans: 1, verb: '原地不动' }
    ];
    var levelIdx = 0, guessed = -1, pos = 2, moved = 0, done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 1 年级 · 5以内加减法、0</p>' +
      '<h3>数线前进后退</h3>' +
      '<p>数线是一条路：加几就向前走几步，减几就向后退几步，加 0 就是一步也不走。</p>' +
      '<div id="' + K + '-line"></div>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span>会落到几？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 走一走：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-walk" type="button">走 1 步</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再走一走。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 2 + 2</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 5 − 2</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 3 + 0</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都走到答案，并且能说出“加法向前走，减法向后退”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawLine() {
      var h = '';
      for (var i = 0; i <= 5; i++) {
        h += '<span style="display:inline-block;width:34px;height:34px;line-height:34px;text-align:center;margin:2px;border:2px solid #94a3b8;border-radius:50%;font-size:15px;' + (i === pos ? 'background:#ff8a3d;color:#fff;border-color:#ff8a3d;' : '') + '">' + i + '</span>';
      }
      var ln = gid(K + '-line'); if (ln) ln.innerHTML = h;
    }
    function resetRound() {
      var L = lv();
      guessed = -1; pos = L.start; moved = 0; done = false;
      var q = gid(K + '-q'); if (q) q.textContent = L.op;
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        if (b) { b.textContent = String(L.opts[i]); b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜：' + L.op + ' 会落到几？');
      drawLine();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(i) {
      if (done) return;
      guessed = i;
      msg('你猜落到 ' + lv().opts[i] + '。走一走，看看对不对。');
    }
    function walk() {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：会落到几？'); return; }
      var L = lv();
      if (L.step === 0) {
        done = true;
        msg('3 + 0 = 3：加 0 就是一步也不走，原地不动。' + (guessed === L.ans ? '你猜对了！' : '你刚才猜的是 ' + L.opts[guessed] + '。'));
      } else {
        pos += L.dir;
        moved++;
        if (moved >= L.step) {
          done = true;
          msg(L.op + ' = ' + L.target + '：从 ' + L.start + ' 出发' + L.verb + ' ' + L.step + ' 步，落到 ' + L.target + '。' + (guessed === L.ans ? '你猜对了！' : '你刚才猜的是 ' + L.opts[guessed] + '，数线上的位置不会骗人。'));
        } else {
          msg('走了第 ' + moved + ' 步，现在在 ' + pos + '，还差 ' + (L.step - moved) + ' 步。');
        }
      }
      if (done) {
        for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
      drawLine();
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-walk').addEventListener('click', walk);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：2 + 2 落到 4', '提高：5 − 2 落到 3', '挑战：3 + 0 原地不动'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

/* ---------- 1.5 立体图形 ---------- */
registerAnim({
  key: 'm15-bag',
  title: '摸袋猜形',
  sub: '袋子里藏着一个立体图形，只告诉你摸到的感觉：猜猜它是谁。',
  grade: 1,
  kind: '实验',
  points: ['1.5'],
  render: function (el) {
    var K = 'm15-bag';
    var LEVELS = [
      { label: '基础', clue: '摸到一个圆圆的、平平的面', opts: ['球', '圆柱', '长方体', '正方体'], ans: 1, name: '圆柱', why: '圆柱有一个圆圆的、平平的面，像易拉罐的底。' },
      { label: '提高', clue: '没有一个平平的面，放在桌上到处滚', opts: ['球', '圆柱', '长方体', '正方体'], ans: 0, name: '球', why: '球没有平平的面，所以到处都能滚。' },
      { label: '挑战', clue: '6 个平平的面，每个面都是正方形', opts: ['球', '圆柱', '长方体', '正方体'], ans: 3, name: '正方体', why: '正方体有 6 个面，每个面都是正方形，像魔方。' }
    ];
    var levelIdx = 0, guessed = -1, done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">实验 · 1 年级 · 立体图形</p>' +
      '<h3>摸袋猜形</h3>' +
      '<p>袋子里藏着一个立体图形，看不见，只能摸。摸到的感觉会告诉你它是谁：有平平的面吗？面是圆的还是方的？</p>' +
      '<p>摸到的感觉：<b id="' + K + '-clue"></b></p>' +
      '<p>第 1 步 · 先猜：袋子里是谁？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-3" type="button"></button></div>' +
      '<p>第 2 步 · 拿出来看看：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-reveal" type="button">拿出来看看</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再拿出来看看。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 圆圆的面</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 到处滚</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 6 个方面</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都猜对，并且能说出“面的样子决定了它是谁”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function resetRound() {
      var L = lv();
      guessed = -1; done = false;
      var cl = gid(K + '-clue'); if (cl) cl.textContent = L.clue;
      for (var i = 0; i < 4; i++) {
        var b = gid(K + '-g-' + i);
        if (b) { b.textContent = L.opts[i]; b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜：袋子里是谁？');
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(i) {
      if (done) return;
      guessed = i;
      msg('你猜是' + lv().opts[i] + '。点“拿出来看看”。');
    }
    function reveal() {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：袋子里是谁？'); return; }
      var L = lv();
      done = true;
      msg('拿出来了，是' + L.name + '！' + L.why + (guessed === L.ans ? '你猜对了！' : '你刚才猜的是' + L.opts[guessed] + '，再摸摸这个感觉：' + L.clue + '。'));
      for (var i = 0; i < 4; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-g-3').addEventListener('click', function () { onGuess(3); });
    gid(K + '-reveal').addEventListener('click', reveal);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：摸出圆柱', '提高：摸出球', '挑战：摸出正方体'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm15-home',
  title: '家里找图形',
  sub: '足球、易拉罐、文具盒、魔方——家里每样东西，都藏着一个立体图形。',
  grade: 1,
  kind: '模拟',
  points: ['1.5'],
  render: function (el) {
    var K = 'm15-home';
    var SHAPE_WHY = {
      '球': '没有平平的面，到处能滚',
      '圆柱': '上下两个圆圆的面，躺着能滚、立着能叠',
      '长方体': '6 个平平的面，能叠起来',
      '正方体': '6 个面都是正方形，能叠起来'
    };
    var LEVELS = [
      { label: '基础', target: '圆柱', objs: [['足球', '球'], ['易拉罐', '圆柱'], ['文具盒', '长方体'], ['魔方', '正方体']], ans: 1 },
      { label: '提高', target: '正方体', objs: [['足球', '球'], ['易拉罐', '圆柱'], ['文具盒', '长方体'], ['魔方', '正方体']], ans: 3 },
      { label: '挑战', target: '长方体', objs: [['足球', '球'], ['易拉罐', '圆柱'], ['文具盒', '长方体'], ['魔方', '正方体']], ans: 2 }
    ];
    var levelIdx = 0, done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 1 年级 · 立体图形</p>' +
      '<h3>家里找图形</h3>' +
      '<p>认图形，看的是它长什么样、能干什么，不看颜色和大小。家里有 4 样东西，哪一样是<span id="' + K + '-q"></span>？</p>' +
      '<p>第 1 步 · 先猜：点一样你觉得是的东西。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-o-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-o-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-o-2" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-o-3" type="button"></button></div>' +
      '<p id="' + K + '-msg">先猜一猜，点一样东西。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 找圆柱</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 找正方体</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 找长方体</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都找对，并且能说出每样东西为什么是那个图形。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function resetRound() {
      var L = lv();
      done = false;
      var q = gid(K + '-q'); if (q) q.textContent = L.target;
      for (var i = 0; i < 4; i++) {
        var b = gid(K + '-o-' + i);
        if (b) { b.textContent = L.objs[i][0]; b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜：哪一样是' + L.target + '？点一点。');
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function pick(i) {
      if (done) return;
      var L = lv(), o = L.objs[i];
      if (i === L.ans) {
        done = true;
        msg('找对了！' + o[0] + '是' + o[1] + '：' + SHAPE_WHY[o[1]] + '。');
        for (var j = 0; j < 4; j++) { var b = gid(K + '-o-' + j); if (b) b.disabled = true; }
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg(o[0] + '是' + o[1] + '：' + SHAPE_WHY[o[1]] + '。不是' + L.target + '，再找找。');
      }
    }
    gid(K + '-o-0').addEventListener('click', function () { pick(0); });
    gid(K + '-o-1').addEventListener('click', function () { pick(1); });
    gid(K + '-o-2').addEventListener('click', function () { pick(2); });
    gid(K + '-o-3').addEventListener('click', function () { pick(3); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：找到圆柱', '提高：找到正方体', '挑战：找到长方体'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

/* ---------- 1.6 6–10的认识、连加连减 ---------- */
registerAnim({
  key: 'm16-five',
  title: '十格阵：5再加几',
  sub: '6 是 5 加 1，8 是 5 加 3——十格阵上面一排先装满 5，下面再加几个就是几。',
  grade: 1,
  kind: '模拟',
  points: ['1.6'],
  render: function (el) {
    var K = 'm16-five';
    var LEVELS = [
      { label: '基础', target: 6, need: 1, opts: [1, 2, 3], ans: 0 },
      { label: '提高', target: 8, need: 3, opts: [2, 3, 4], ans: 1 },
      { label: '挑战', target: 10, need: 5, opts: [3, 4, 5], ans: 2 }
    ];
    var levelIdx = 0, guessed = -1, added = 0, done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 1 年级 · 6–10的认识、连加连减</p>' +
      '<h3>十格阵：5再加几</h3>' +
      '<p>十格阵上面一排已经装满了 5 个点。下面再加几个，就能凑成目标数？6 到 10 都不用从 1 数起，看成“5 再加几”就行。</p>' +
      '<div id="' + K + '-frame"></div>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span>是 5 加几？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 加一加：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-add" type="button">下面加一个</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再加一加。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 6 是 5 加几</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 8 是 5 加几</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 10 是 5 加几</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都加对，并且能说出“6 到 10 都是 5 再加几”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawFrame() {
      var h = '';
      for (var row = 0; row < 2; row++) {
        h += '<div>';
        for (var i = 0; i < 5; i++) {
          var filled = row === 0 || i < added;
          h += '<span style="display:inline-block;width:36px;height:36px;line-height:36px;text-align:center;margin:3px;border:2px solid #94a3b8;border-radius:6px;font-size:18px;' + (filled ? 'background:' + (row === 0 ? '#2563eb' : '#f97316') + ';color:#fff;border-color:transparent;' : '') + '">' + (filled ? '●' : '') + '</span>';
        }
        h += '<span>' + (row === 0 ? ' 上面一排：5 个' : ' 下面一排：' + added + ' 个') + '</span></div>';
      }
      var f = gid(K + '-frame'); if (f) f.innerHTML = h;
    }
    function resetRound() {
      var L = lv();
      guessed = -1; added = 0; done = false;
      var q = gid(K + '-q'); if (q) q.textContent = String(L.target);
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        if (b) { b.textContent = String(L.opts[i]); b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜：' + L.target + ' 是 5 加几？');
      drawFrame();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(i) {
      if (done) return;
      guessed = i;
      msg('你猜 ' + lv().target + ' 是 5 加 ' + lv().opts[i] + '。加一加，看看对不对。');
    }
    function addOne() {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：是 5 加几？'); return; }
      var L = lv();
      if (added >= L.need) { msg('下面已经加够了。'); return; }
      added++;
      drawFrame();
      if (added >= L.need) {
        done = true;
        msg(L.target + ' = 5 + ' + L.need + '，不用从 1 数起。' + (L.target === 10 ? '满格了，10 个就是 1 个十。' : '') + (guessed === L.ans ? '你猜对了！' : '你刚才猜的是 5 加 ' + L.opts[guessed] + '。'));
        for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('加了 ' + added + ' 个，还差 ' + (L.need - added) + ' 个。');
      }
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-add').addEventListener('click', addOne);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：6 = 5 + 1', '提高：8 = 5 + 3', '挑战：10 = 5 + 5'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm16-ten',
  title: '谁和我凑满10',
  sub: '7 还差 3 就满 10，6 还差 4——找到能凑满 10 的朋友。',
  grade: 1,
  kind: '模拟',
  points: ['1.6'],
  render: function (el) {
    var K = 'm16-ten';
    var LEVELS = [
      { label: '基础', n: 7, need: 3, opts: [2, 3, 4], ans: 1 },
      { label: '提高', n: 6, need: 4, opts: [3, 4, 5], ans: 1 },
      { label: '挑战', n: 9, need: 1, opts: [1, 2, 3], ans: 0 }
    ];
    var levelIdx = 0, guessed = -1, added = 0, done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 1 年级 · 6–10的认识、连加连减</p>' +
      '<h3>谁和我凑满10</h3>' +
      '<p>十格阵里已经有几个点，再加几个就满 10？凑满 10 的本事，以后算进位加法天天用。</p>' +
      '<div id="' + K + '-frame"></div>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span>还差几个满 10？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 补一补：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-add" type="button">补一个</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再补一补。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 7 差几</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 6 差几</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 9 差几</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都补满，并且能说出“7 和 3 是一对，6 和 4 是一对”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawFrame() {
      var L = lv(), h = '';
      for (var i = 0; i < 10; i++) {
        var filled = i < L.n + added;
        h += '<span style="display:inline-block;width:36px;height:36px;line-height:36px;text-align:center;margin:3px;border:2px solid #94a3b8;border-radius:6px;font-size:18px;' + (filled ? 'background:#2563eb;color:#fff;border-color:transparent;' : '') + '">' + (filled ? '●' : '') + '</span>';
        if (i === 4) h += '<br>';
      }
      var f = gid(K + '-frame'); if (f) f.innerHTML = h + '<p>现在有 ' + (L.n + added) + ' 个，还差 ' + (10 - L.n - added) + ' 个满 10。</p>';
    }
    function resetRound() {
      var L = lv();
      guessed = -1; added = 0; done = false;
      var q = gid(K + '-q'); if (q) q.textContent = String(L.n);
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        if (b) { b.textContent = String(L.opts[i]); b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜：' + L.n + ' 还差几个满 10？');
      drawFrame();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(i) {
      if (done) return;
      guessed = i;
      msg('你猜还差 ' + lv().opts[i] + ' 个。补一补，看看对不对。');
    }
    function addOne() {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：还差几个满 10？'); return; }
      var L = lv();
      if (added >= L.need) { msg('已经满 10 了。'); return; }
      added++;
      drawFrame();
      if (added >= L.need) {
        done = true;
        msg('满 10 了！' + L.n + ' + ' + L.need + ' = 10，' + L.n + ' 的朋友是 ' + L.need + '。' + (guessed === L.ans ? '你猜对了！' : '你刚才猜的是 ' + L.opts[guessed] + ' 个。'));
        for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('补了 ' + added + ' 个，还差 ' + (L.need - added) + ' 个。');
      }
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-add').addEventListener('click', addOne);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：7 + 3 = 10', '提高：6 + 4 = 10', '挑战：9 + 1 = 10'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm16-fingers',
  title: '手指算6到10',
  sub: '一只手是 5，另一只手再伸几根，合起来就是 6 到 10。手指就是随身带的教具。',
  grade: 1,
  kind: '模拟',
  points: ['1.6'],
  render: function (el) {
    var K = 'm16-fingers';
    var LEVELS = [
      { label: '基础', target: 7, need: 2, opts: [1, 2, 3], ans: 1 },
      { label: '提高', target: 9, need: 4, opts: [3, 4, 5], ans: 1 },
      { label: '挑战', target: 10, need: 5, opts: [4, 5, 6], ans: 1 }
    ];
    var levelIdx = 0, guessed = -1, lit = [false, false, false, false, false], done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 1 年级 · 6–10的认识、连加连减</p>' +
      '<h3>手指算6到10</h3>' +
      '<p>左手 5 根手指全伸出来了。要凑成目标数，右手再伸几根？点右手的手指，伸出来，再数一数。</p>' +
      '<p>左手：✋✋✋✋✋（5 根）</p>' +
      '<p>右手：</p><div class="btn-row">' +
      '<button class="btn small" id="' + K + '-f-0" type="button">第 1 根</button>' +
      '<button class="btn small" id="' + K + '-f-1" type="button">第 2 根</button>' +
      '<button class="btn small" id="' + K + '-f-2" type="button">第 3 根</button>' +
      '<button class="btn small" id="' + K + '-f-3" type="button">第 4 根</button>' +
      '<button class="btn small" id="' + K + '-f-4" type="button">第 5 根</button></div>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span>要右手伸几根？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-count" type="button">数一数</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再伸手指。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 7</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 9</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 10</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都伸对，并且能说出“6 到 10 都是 5 再加几”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function litCount() { var n = 0; for (var i = 0; i < 5; i++) if (lit[i]) n++; return n; }
    function resetRound() {
      var L = lv();
      guessed = -1; lit = [false, false, false, false, false]; done = false;
      var q = gid(K + '-q'); if (q) q.textContent = String(L.target);
      for (var i = 0; i < 5; i++) {
        var f = gid(K + '-f-' + i);
        if (f) { f.textContent = '第 ' + (i + 1) + ' 根'; f.disabled = false; }
      }
      for (var i2 = 0; i2 < 3; i2++) {
        var b = gid(K + '-g-' + i2);
        if (b) { b.textContent = String(L.opts[i2]); b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜：' + L.target + ' 要右手伸几根？');
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(i) {
      if (done) return;
      guessed = i;
      msg('你猜右手伸 ' + lv().opts[i] + ' 根。点右手的手指，伸出来。');
    }
    function toggleFinger(i) {
      if (done) return;
      lit[i] = !lit[i];
      var f = gid(K + '-f-' + i);
      if (f) f.textContent = lit[i] ? '第 ' + (i + 1) + ' 根 ✓' : '第 ' + (i + 1) + ' 根';
      msg('右手现在伸了 ' + litCount() + ' 根，点“数一数”核对。');
    }
    function countIt() {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：右手伸几根？'); return; }
      var L = lv(), n = litCount();
      if (n === L.need) {
        done = true;
        msg(L.target + ' = 5 + ' + L.need + '：左手 5 根，右手 ' + L.need + ' 根。' + (guessed === L.ans ? '你猜对了！' : '你刚才猜的是 ' + L.opts[guessed] + ' 根。'));
        for (var i = 0; i < 5; i++) { var f = gid(K + '-f-' + i); if (f) f.disabled = true; }
        for (var j = 0; j < 3; j++) { var b = gid(K + '-g-' + j); if (b) b.disabled = true; }
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('现在一共 ' + (5 + n) + ' 根，' + L.target + ' 要右手伸 ' + L.need + ' 根，再调一调。');
      }
    }
    gid(K + '-f-0').addEventListener('click', function () { toggleFinger(0); });
    gid(K + '-f-1').addEventListener('click', function () { toggleFinger(1); });
    gid(K + '-f-2').addEventListener('click', function () { toggleFinger(2); });
    gid(K + '-f-3').addEventListener('click', function () { toggleFinger(3); });
    gid(K + '-f-4').addEventListener('click', function () { toggleFinger(4); });
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-count').addEventListener('click', countIt);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：7 = 5 + 2', '提高：9 = 5 + 4', '挑战：10 = 5 + 5'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

/* ---------- 1.7 11–20的认识、10加几 ---------- */
registerAnim({
  key: 'm17-line',
  title: '数线找11到20',
  sub: '13 在数线上是 10 再往右 3 格：11 到 20 都是“10 再加几”。',
  grade: 1,
  kind: '模拟',
  points: ['1.7'],
  render: function (el) {
    var K = 'm17-line';
    var LEVELS = [
      { label: '基础', target: 13, past: 3, opts: [2, 3, 4], ans: 1 },
      { label: '提高', target: 17, past: 7, opts: [6, 7, 8], ans: 1 },
      { label: '挑战', target: 20, past: 10, opts: [9, 10, 11], ans: 1 }
    ];
    var levelIdx = 0, guessed = -1, pos = 10, jumped = 0, done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 1 年级 · 11–20的认识、10加几</p>' +
      '<h3>数线找11到20</h3>' +
      '<p>小圆点现在站在 10 上面。要找的数在 10 的右边：往右跳几格就到了？</p>' +
      '<div id="' + K + '-line"></div>' +
      '<p id="' + K + '-pos"></p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span>在 10 的右边几格？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 向前跳：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-jump" type="button">向前跳 1 格</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再向前跳。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 找 13</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 找 17</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 找 20</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都跳到答案，并且能说出“11 到 20 都是 10 再加几”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawLine() {
      var h = '';
      for (var i = 0; i <= 20; i++) {
        h += '<span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;margin:1px;border:1px solid #cbd5e1;border-radius:50%;font-size:12px;' + (i === pos ? 'background:#ff8a3d;color:#fff;border-color:#ff8a3d;' : i === 10 ? 'background:#dbeafe;' : '') + '">' + i + '</span>';
      }
      var ln = gid(K + '-line'); if (ln) ln.innerHTML = h;
      var p = gid(K + '-pos'); if (p) p.textContent = '小圆点现在在 ' + pos + '。';
    }
    function resetRound() {
      var L = lv();
      guessed = -1; pos = 10; jumped = 0; done = false;
      var q = gid(K + '-q'); if (q) q.textContent = String(L.target);
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        if (b) { b.textContent = String(L.opts[i]); b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜：' + L.target + ' 在 10 的右边几格？');
      drawLine();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(i) {
      if (done) return;
      guessed = i;
      msg('你猜 ' + lv().target + ' 在 10 的右边 ' + lv().opts[i] + ' 格。向前跳，看看对不对。');
    }
    function jump() {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：在 10 的右边几格？'); return; }
      var L = lv();
      if (jumped >= L.past) { msg('已经跳够了。'); return; }
      pos++;
      jumped++;
      drawLine();
      if (jumped >= L.past) {
        done = true;
        msg(L.target + ' = 10 + ' + L.past + '：从 10 出发向右跳 ' + L.past + ' 格，就到了 ' + L.target + '。' + (guessed === L.ans ? '你猜对了！' : '你刚才猜的是 ' + L.opts[guessed] + ' 格。'));
        for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('跳了 ' + jumped + ' 格，现在在 ' + pos + '，还差 ' + (L.past - jumped) + ' 格。');
      }
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-jump').addEventListener('click', jump);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：13 = 10 + 3', '提高：17 = 10 + 7', '挑战：20 = 10 + 10'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

/* ---------- 1.8 认识钟表 ---------- */
registerAnim({
  key: 'm18-day',
  title: '一日作息时间轴',
  sub: '起床、吃饭、睡觉——把一天的事贴到时间轴上，时间就有了生活的样子。',
  grade: 1,
  kind: '实验',
  points: ['1.8'],
  render: function (el) {
    var K = 'm18-day';
    var LEVELS = [
      { label: '基础', act: '起床', hour: 7, opts: [6, 7, 8], ans: 1, when: '早上 7 点' },
      { label: '提高', act: '吃午饭', hour: 12, opts: [11, 12, 13], ans: 1, when: '中午 12 点' },
      { label: '挑战', act: '睡觉', hour: 21, opts: [20, 21, 22], ans: 1, when: '晚上 9 点' }
    ];
    var levelIdx = 0, guessed = -1, placed = -1, done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">实验 · 1 年级 · 认识钟表</p>' +
      '<h3>一日作息时间轴</h3>' +
      '<p>下面是一天的时间轴，从早上 6 点到晚上 10 点。每天做的事，都住在时间轴上的一个点：起床是早上，睡觉是晚上。</p>' +
      '<div id="' + K + '-axis"></div>' +
      '<p>今天要贴的是：<b id="' + K + '-act"></b></p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span>是几点？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 贴到时间轴：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-stick" type="button">贴上去</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再贴上去。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 起床</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 吃午饭</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 睡觉</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都贴对，并且能说出“时间轴越往右越晚”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawAxis() {
      var h = '';
      for (var hh = 6; hh <= 22; hh++) {
        var mark = placed === hh;
        h += '<span style="display:inline-block;width:30px;text-align:center;margin:1px;font-size:12px;' + (mark ? 'color:#dc2626;font-weight:bold;' : '') + '">' + (mark ? '★' : '·') + '<br>' + hh + '</span>';
      }
      var ax = gid(K + '-axis'); if (ax) ax.innerHTML = h + '<p>早上 6 点 —————— 中午 12 点 —————— 晚上 10 点</p>';
    }
    function resetRound() {
      var L = lv();
      guessed = -1; placed = -1; done = false;
      var ac = gid(K + '-act'); if (ac) ac.textContent = L.act;
      var q = gid(K + '-q'); if (q) q.textContent = L.act;
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        if (b) { b.textContent = String(L.opts[i]) + ' 点'; b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜：' + L.act + '是几点？');
      drawAxis();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(i) {
      if (done) return;
      guessed = i;
      msg('你猜' + lv().act + '是 ' + lv().opts[i] + ' 点。点“贴上去”。');
    }
    function stick() {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：是几点？'); return; }
      var L = lv(), g = L.opts[guessed];
      placed = g;
      drawAxis();
      if (g === L.hour) {
        done = true;
        msg('贴对了！' + L.act + '是' + L.when + '，在时间轴的这个位置。' + (L.act === '睡觉' ? '晚上 9 点就是 21 点。' : '') + '你猜对了！');
        for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('贴错了：' + L.act + '不是 ' + g + ' 点。想想天亮了没有、肚子饿了没有，再换一个时间贴。');
        placed = -1;
        drawAxis();
      }
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-stick').addEventListener('click', stick);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：起床是 7 点', '提高：吃午饭是 12 点', '挑战：睡觉是晚上 9 点'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

/* ---------- 1.9 20以内进位加法、凑十法 ---------- */
registerAnim({
  key: 'm19-split',
  title: '拆数口诀凑十',
  sub: '看大数，分小数，凑成十，加剩数：9 + 6，先把 6 拆成 1 和 5。',
  grade: 1,
  kind: '模拟',
  points: ['1.9'],
  render: function (el) {
    var K = 'm19-split';
    var LEVELS = [
      { label: '基础', a: 9, b: 6, split: 1, rest: 5, total: 15, opts: [[1, 5], [2, 4], [3, 3]], ans: 0 },
      { label: '提高', a: 8, b: 5, split: 2, rest: 3, total: 13, opts: [[1, 4], [2, 3], [3, 2]], ans: 1 },
      { label: '挑战', a: 9, b: 7, split: 1, rest: 6, total: 16, opts: [[1, 6], [2, 5], [3, 4]], ans: 0 }
    ];
    var levelIdx = 0, guessed = -1, done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 1 年级 · 20以内进位加法、凑十法</p>' +
      '<h3>拆数口诀凑十</h3>' +
      '<p>口诀是：看大数，分小数，凑成十，加剩数。大数差几个到 10，就从小数里拆出几个来。</p>' +
      '<p class="func-eq" id="' + K + '-eq"></p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span>拆成几和几？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 拆一拆：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-do" type="button">拆一拆，凑成 10</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再拆一拆。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 9 + 6</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 8 + 5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 9 + 7</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都拆对，并且能背出“看大数，分小数，凑成十，加剩数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function optTx(o) { return o[0] + ' 和 ' + o[1]; }
    function resetRound() {
      var L = lv();
      guessed = -1; done = false;
      var eq = gid(K + '-eq'); if (eq) eq.textContent = L.a + ' + ' + L.b + ' = ?';
      var q = gid(K + '-q'); if (q) q.textContent = String(L.b);
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        if (b) { b.textContent = optTx(L.opts[i]); b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜：' + L.b + ' 拆成几和几？');
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(i) {
      if (done) return;
      guessed = i;
      msg('你猜 ' + lv().b + ' 拆成 ' + optTx(lv().opts[i]) + '。点“拆一拆”看看。');
    }
    function doSplit() {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：拆成几和几？'); return; }
      var L = lv(), o = L.opts[guessed];
      if (guessed === L.ans) {
        done = true;
        msg(L.a + ' + ' + L.b + ' = ' + L.a + ' + ' + o[0] + ' + ' + o[1] + ' = 10 + ' + o[1] + ' = ' + L.total + '。看大数，分小数，凑成十，加剩数。你猜对了！');
        for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg(L.a + ' + ' + o[0] + ' = ' + (L.a + o[0]) + '，凑不成 10：' + L.a + ' 差 ' + (10 - L.a) + ' 个到 10，要从 ' + L.b + ' 里拆出 ' + (10 - L.a) + ' 来。');
      }
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-do').addEventListener('click', doSplit);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：9 + 6 = 15', '提高：8 + 5 = 13', '挑战：9 + 7 = 16'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm19-line',
  title: '数线接着数',
  sub: '9 + 4：从 9 出发，再接着数 4 格，落到 13。和凑十算的一样。',
  grade: 1,
  kind: '模拟',
  points: ['1.9'],
  render: function (el) {
    var K = 'm19-line';
    var LEVELS = [
      { label: '基础', a: 9, b: 4, total: 13, opts: [12, 13, 14], ans: 1 },
      { label: '提高', a: 8, b: 6, total: 14, opts: [13, 14, 15], ans: 1 },
      { label: '挑战', a: 7, b: 8, total: 15, opts: [14, 15, 16], ans: 1 }
    ];
    var levelIdx = 0, guessed = -1, pos = 9, counted = 0, done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 1 年级 · 20以内进位加法、凑十法</p>' +
      '<h3>数线接着数</h3>' +
      '<p>不用从 1 数起：从第一个数出发，再接着数第二个数那么多格，落到的地方就是答案。</p>' +
      '<div id="' + K + '-line"></div>' +
      '<p id="' + K + '-pos"></p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span>等于几？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 接着数：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-count" type="button">接着数 1 格</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再接着数。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 9 + 4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 8 + 6</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 7 + 8</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都数到答案，并且能说出“接着数和凑十算的一样”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawLine() {
      var h = '';
      for (var i = 0; i <= 20; i++) {
        h += '<span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;margin:1px;border:1px solid #cbd5e1;border-radius:50%;font-size:12px;' + (i === pos ? 'background:#ff8a3d;color:#fff;border-color:#ff8a3d;' : '') + '">' + i + '</span>';
      }
      var ln = gid(K + '-line'); if (ln) ln.innerHTML = h;
      var p = gid(K + '-pos'); if (p) p.textContent = '现在在 ' + pos + '，已经数了 ' + counted + ' 格。';
    }
    function resetRound() {
      var L = lv();
      guessed = -1; pos = L.a; counted = 0; done = false;
      var q = gid(K + '-q'); if (q) q.textContent = L.a + ' + ' + L.b;
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        if (b) { b.textContent = String(L.opts[i]); b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜：' + L.a + ' + ' + L.b + ' 等于几？');
      drawLine();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(i) {
      if (done) return;
      guessed = i;
      msg('你猜是 ' + lv().opts[i] + '。从 ' + lv().a + ' 出发接着数，看看对不对。');
    }
    function countOne() {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：等于几？'); return; }
      var L = lv();
      if (counted >= L.b) { msg('已经数够了。'); return; }
      pos++;
      counted++;
      drawLine();
      if (counted >= L.b) {
        done = true;
        msg(L.a + ' + ' + L.b + ' = ' + L.total + '：从 ' + L.a + ' 出发接着数 ' + L.b + ' 格，落到 ' + L.total + '，和凑十算的一样。' + (guessed === L.ans ? '你猜对了！' : '你刚才猜的是 ' + L.opts[guessed] + '。'));
        for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('数了 ' + counted + ' 格，现在在 ' + pos + '，还差 ' + (L.b - counted) + ' 格。');
      }
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-count').addEventListener('click', countOne);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：9 + 4 = 13', '提高：8 + 6 = 14', '挑战：7 + 8 = 15'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm19-poker',
  title: '翻牌找朋友凑10',
  sub: '翻出一张牌，报出它的朋友：两个数加起来是 10，就是一对朋友。',
  grade: 1,
  kind: '实验',
  points: ['1.9'],
  render: function (el) {
    var K = 'm19-poker';
    var LEVELS = [
      { label: '基础', card: 6, friend: 4, opts: [3, 4, 5], ans: 1 },
      { label: '提高', card: 3, friend: 7, opts: [6, 7, 8], ans: 1 },
      { label: '挑战', card: 8, friend: 2, opts: [1, 2, 3], ans: 1 }
    ];
    var levelIdx = 0, guessed = -1, done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">实验 · 1 年级 · 20以内进位加法、凑十法</p>' +
      '<h3>翻牌找朋友凑10</h3>' +
      '<p>凑十法要先熟练 10 的分成：看见一个数，马上能报出它凑 10 的朋友。翻出一张牌，它的朋友是几？</p>' +
      '<p>翻出的牌是：<b id="' + K + '-card"></b></p>' +
      '<p>第 1 步 · 先猜：它的朋友是几？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 翻一张：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-flip" type="button">翻一张，看看朋友</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再翻一张。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 6 的朋友</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 3 的朋友</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 8 的朋友</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都找到朋友，并且能说出“10 的分成要成对记”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function resetRound() {
      var L = lv();
      guessed = -1; done = false;
      var cd = gid(K + '-card'); if (cd) cd.textContent = String(L.card);
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        if (b) { b.textContent = String(L.opts[i]); b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜：' + L.card + ' 的朋友是几？');
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(i) {
      if (done) return;
      guessed = i;
      msg('你猜 ' + lv().card + ' 的朋友是 ' + lv().opts[i] + '。翻一张，看看。');
    }
    function flip() {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：朋友是几？'); return; }
      var L = lv(), g = L.opts[guessed];
      if (g === L.friend) {
        done = true;
        msg('翻出来了，是 ' + L.friend + '！' + L.card + ' + ' + L.friend + ' = 10，它们是一对朋友。' + '你猜对了！');
        for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg(L.card + ' + ' + g + ' = ' + (L.card + g) + '，不是 10。再想想：' + L.card + ' 差几个到 10？');
      }
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-flip').addEventListener('click', flip);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：6 + 4 = 10', '提高：3 + 7 = 10', '挑战：8 + 2 = 10'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

/* ---------- 1.11 20以内退位减法、破十法 ---------- */
registerAnim({
  key: 'm111-flat',
  title: '平十法',
  sub: '13 − 5：先减 3 到 10，再减 2 得 8。先减到 10，剩下的就好减了。',
  grade: 1,
  kind: '模拟',
  points: ['1.11'],
  render: function (el) {
    var K = 'm111-flat';
    var LEVELS = [
      { label: '基础', a: 13, b: 5, first: 3, rest: 2, total: 8, opts: [2, 3, 4], ans: 1 },
      { label: '提高', a: 15, b: 7, first: 5, rest: 2, total: 8, opts: [4, 5, 6], ans: 1 },
      { label: '挑战', a: 12, b: 4, first: 2, rest: 2, total: 8, opts: [1, 2, 3], ans: 1 }
    ];
    var levelIdx = 0, guessed = -1, phase = 0, done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 1 年级 · 20以内退位减法、破十法</p>' +
      '<h3>平十法</h3>' +
      '<p>破十法是把 10 拆开减，平十法是先把数减到 10：减数拆成两部分，第一部分刚好减到 10，第二部分再从 10 里减。</p>' +
      '<p class="func-eq" id="' + K + '-eq"></p>' +
      '<p>第 1 步 · 先猜：先减几，正好到 10？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 分两步减：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-step1" type="button">先减到 10</button>' +
      '<button class="btn small primary" id="' + K + '-step2" type="button">再减剩下的</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再分两步减。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 13 − 5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 15 − 7</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 12 − 4</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都减对，并且能说出“先减到 10，再减剩下的”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function resetRound() {
      var L = lv();
      guessed = -1; phase = 0; done = false;
      var eq = gid(K + '-eq'); if (eq) eq.textContent = L.a + ' − ' + L.b + ' = ?';
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        if (b) { b.textContent = String(L.opts[i]); b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜：先减几，正好到 10？');
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(i) {
      if (done) return;
      guessed = i;
      msg('你猜先减 ' + lv().opts[i] + '。点“先减到 10”试试。');
    }
    function step1() {
      if (done || phase !== 0) return;
      if (guessed < 0) { msg('先猜一猜：先减几，正好到 10？'); return; }
      var L = lv(), g = L.opts[guessed];
      if (g !== L.first) {
        msg(L.a + ' − ' + g + ' = ' + (L.a - g) + '，不是 10。' + L.a + ' 的个位是 ' + (L.a - 10) + '，先减 ' + (L.a - 10) + ' 就到 10 了。');
        return;
      }
      phase = 1;
      msg(L.a + ' − ' + g + ' = 10。第一步对了，再点“再减剩下的”。');
    }
    function step2() {
      if (done || phase !== 1) { if (!done && phase === 0) msg('先点“先减到 10”。'); return; }
      var L = lv();
      phase = 2; done = true;
      msg('10 − ' + L.rest + ' = ' + L.total + '。所以 ' + L.a + ' − ' + L.b + ' = ' + L.total + '：先减 ' + L.first + ' 到 10，再减 ' + L.rest + '。你猜对了！');
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-step1').addEventListener('click', step1);
    gid(K + '-step2').addEventListener('click', step2);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：13 − 5 = 8', '提高：15 − 7 = 8', '挑战：12 − 4 = 8'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm111-add',
  title: '想加算减',
  sub: '13 − 5 想 5 + 几 = 13：想加法算减法，还能在数线上往回数着验算。',
  grade: 1,
  kind: '模拟',
  points: ['1.11'],
  render: function (el) {
    var K = 'm111-add';
    var LEVELS = [
      { label: '基础', a: 13, b: 5, diff: 8, opts: [7, 8, 9], ans: 1 },
      { label: '提高', a: 15, b: 6, diff: 9, opts: [8, 9, 10], ans: 1 },
      { label: '挑战', a: 12, b: 7, diff: 5, opts: [4, 5, 6], ans: 1 }
    ];
    var levelIdx = 0, guessed = -1, done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 1 年级 · 20以内退位减法、破十法</p>' +
      '<h3>想加算减</h3>' +
      '<p>减法想加法：13 − 5，问 5 加几等于 13？想出来了，减法也就算出来了。还可以在数线上从 13 往回数 5 格验算。</p>' +
      '<p class="func-eq" id="' + K + '-eq"></p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span>等于几？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 想加法：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-think" type="button">想一想：几加 5 等于 13？</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再想加法。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 13 − 5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 15 − 6</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 12 − 7</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都算对，并且能说出“减法想加法，数线往回数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function backCount() {
      var L = lv(), s = '';
      for (var i = 1; i <= L.b; i++) {
        s += String(L.a - i);
        if (i < L.b) s += '、';
      }
      return s;
    }
    function resetRound() {
      var L = lv();
      guessed = -1; done = false;
      var eq = gid(K + '-eq'); if (eq) eq.textContent = L.a + ' − ' + L.b + ' = □';
      var q = gid(K + '-q'); if (q) q.textContent = L.a + ' − ' + L.b;
      var th = gid(K + '-think'); if (th) th.textContent = '想一想：几加 ' + L.b + ' 等于 ' + L.a + '？';
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        if (b) { b.textContent = String(L.opts[i]); b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜：' + L.a + ' − ' + L.b + ' 等于几？');
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(i) {
      if (done) return;
      guessed = i;
      msg('你猜是 ' + lv().opts[i] + '。想想加法，看看对不对。');
    }
    function think() {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：等于几？'); return; }
      var L = lv(), g = L.opts[guessed];
      if (g === L.diff) {
        done = true;
        msg(L.b + ' + ' + g + ' = ' + L.a + '，所以 ' + L.a + ' − ' + L.b + ' = ' + g + '。数线验算：从 ' + L.a + ' 往回数 ' + L.b + ' 格，是 ' + backCount() + '，落到 ' + g + '。你猜对了！');
        for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg(L.b + ' + ' + g + ' = ' + (L.b + g) + '，不是 ' + L.a + '，所以 □ 不是 ' + g + '。');
      }
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-think').addEventListener('click', think);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：13 − 5 = 8', '提高：15 − 6 = 9', '挑战：12 − 7 = 5'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

/* ---------- 1.12 分类与整理 ---------- */
registerAnim({
  key: 'm112-venn',
  title: '维恩图分一分',
  sub: '红圈和圆圈叠在一起：既红又圆的放重叠处，只满足一条的放一边。',
  grade: 1,
  kind: '模拟',
  points: ['1.12'],
  render: function (el) {
    var K = 'm112-venn';
    var LEVELS = [
      { label: '基础', shape: '红圆', opts: ['重叠的地方', '只在红圈里', '只在圆圈里', '两个圈外面'], ans: 0, why: '红圆既是红的又是圆的，只能放在重叠的地方。' },
      { label: '提高', shape: '蓝圆', opts: ['重叠的地方', '只在红圈里', '只在圆圈里', '两个圈外面'], ans: 2, why: '蓝圆是圆的但不是红的，放在只在圆圈里的地方。' },
      { label: '挑战', shape: '红三角', opts: ['重叠的地方', '只在红圈里', '只在圆圈里', '两个圈外面'], ans: 1, why: '红三角是红的但不是圆的，放在只在红圈里的地方。' }
    ];
    var levelIdx = 0, guessed = -1, done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 1 年级 · 分类与整理</p>' +
      '<h3>维恩图分一分</h3>' +
      '<p>两个圈叠在一起：左边是“红的”，右边是“圆的”。一个图形可能只满足一条，也可能两条都满足——两条都满足的，只能住在重叠的地方。</p>' +
      '<p>红圈 ○　圆圈 ○（重叠的地方是两个圈都盖住的地方）</p>' +
      '<p>要放的图形：<b id="' + K + '-shape"></b></p>' +
      '<p>第 1 步 · 先猜：它应该放在哪儿？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-3" type="button"></button></div>' +
      '<p>第 2 步 · 放进去：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-put" type="button">放进去</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再放进去。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 红圆</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 蓝圆</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 红三角</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都放对，并且能说出“重叠处是两条都满足的”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function resetRound() {
      var L = lv();
      guessed = -1; done = false;
      var sh = gid(K + '-shape'); if (sh) sh.textContent = L.shape;
      for (var i = 0; i < 4; i++) {
        var b = gid(K + '-g-' + i);
        if (b) { b.textContent = L.opts[i]; b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜：' + L.shape + '应该放在哪儿？');
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(i) {
      if (done) return;
      guessed = i;
      msg('你猜放在' + lv().opts[i] + '。点“放进去”看看。');
    }
    function put() {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：应该放在哪儿？'); return; }
      var L = lv();
      if (guessed === L.ans) {
        done = true;
        msg('放对了！' + L.why + '你猜对了！');
        for (var i = 0; i < 4; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('放错了：' + L.why + '再想想。');
      }
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-g-3').addEventListener('click', function () { onGuess(3); });
    gid(K + '-put').addEventListener('click', put);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：红圆放重叠处', '提高：蓝圆放圆圈里', '挑战：红三角放红圈里'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

/* ---------- 1.13 100以内数的认识 ---------- */
registerAnim({
  key: 'm113-chart',
  title: '百数表找规律',
  sub: '百数表里藏了一个数：横着每次多 1，竖着每次多 10，顺着规律就能找到它。',
  grade: 1,
  kind: '模拟',
  points: ['1.13'],
  render: function (el) {
    var K = 'm113-chart';
    var LEVELS = [
      { label: '基础', seq: [21, 22, 23, 24, 25], hide: 2, opts: [22, 23, 24], ans: 1, rule: '横着每次多 1' },
      { label: '提高', seq: [8, 18, 28, 38, 48], hide: 3, opts: [38, 48, 28], ans: 0, rule: '竖着每次多 10' },
      { label: '挑战', seq: [30, 40, 50, 60, 70], hide: 3, opts: [50, 60, 70], ans: 1, rule: '每次多 10' }
    ];
    var levelIdx = 0, guessed = -1, done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 1 年级 · 100以内数的认识</p>' +
      '<h3>百数表找规律</h3>' +
      '<p>百数表里，横着走每次多 1，竖着走每次多 10。下面一串数里藏了一个数，顺着规律找出来。</p>' +
      '<div id="' + K + '-grid"></div>' +
      '<p id="' + K + '-seq"></p>' +
      '<p>第 1 步 · 先猜：藏起来的数是几？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 揭开：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-reveal" type="button">揭开看看</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再揭开。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 横着找</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 竖着找</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 整十数找</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都找到，并且能说出“横着多 1，竖着多 10”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawAll() {
      var L = lv(), h = '';
      for (var r = 0; r < 10; r++) {
        h += '<div>';
        for (var c = 1; c <= 10; c++) {
          var n = r * 10 + c;
          var inSeq = L.seq.indexOf(n) >= 0;
          h += '<span style="display:inline-block;width:26px;height:26px;line-height:26px;text-align:center;margin:1px;border:1px solid #e2e8f0;border-radius:4px;font-size:12px;' + (inSeq ? 'background:#dbeafe;font-weight:bold;' : '') + '">' + n + '</span>';
        }
        h += '</div>';
      }
      var g = gid(K + '-grid'); if (g) g.innerHTML = h;
      var s = '';
      for (var i = 0; i < L.seq.length; i++) {
        s += (i === L.hide ? '？' : String(L.seq[i]));
        if (i < L.seq.length - 1) s += '、';
      }
      var sq = gid(K + '-seq'); if (sq) sq.textContent = '这一串是：' + s;
    }
    function resetRound() {
      var L = lv();
      guessed = -1; done = false;
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        if (b) { b.textContent = String(L.opts[i]); b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜：藏起来的数是几？');
      drawAll();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(i) {
      if (done) return;
      guessed = i;
      msg('你猜是 ' + lv().opts[i] + '。点“揭开看看”。');
    }
    function reveal() {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：藏起来的数是几？'); return; }
      var L = lv(), hidden = L.seq[L.hide];
      done = true;
      msg('藏起来的数是 ' + hidden + '：' + L.rule + '。' + (guessed === L.ans ? '你猜对了！' : '你刚才猜的是 ' + L.opts[guessed] + '，顺着规律再数一遍：' + L.seq.join('、') + '。'));
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-reveal').addEventListener('click', reveal);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：找到 23', '提高：找到 38', '挑战：找到 60'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm113-line',
  title: '数线比大小',
  sub: '数在数线上越靠右越大：46 在 38 的右边，所以 46 大。',
  grade: 1,
  kind: '模拟',
  points: ['1.13'],
  render: function (el) {
    var K = 'm113-line';
    var LEVELS = [
      { label: '基础', a: 46, b: 38, opts: ['46 大', '38 大', '一样大'], ans: 0 },
      { label: '提高', a: 52, b: 25, opts: ['52 大', '25 大', '一样大'], ans: 0 },
      { label: '挑战', a: 99, b: 100, opts: ['99 大', '100 大', '一样大'], ans: 1 }
    ];
    var levelIdx = 0, guessed = -1, placed = false, done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 1 年级 · 100以内数的认识</p>' +
      '<h3>数线比大小</h3>' +
      '<p>把两个数放到数线上：越靠右的越大。先猜，再放上去看看。</p>' +
      '<div id="' + K + '-line"></div>' +
      '<p class="func-eq" id="' + K + '-q"></p>' +
      '<p>第 1 步 · 先猜：哪个大？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 放到数轴上：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-place" type="button">放到数轴上</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再放上去。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 46 和 38</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 52 和 25</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 99 和 100</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都比对，并且能说出“越靠右越大”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawLine() {
      var L = lv(), h = '<div style="position:relative;height:34px;border-top:3px solid #334155;margin:20px 10px 0 10px;">';
      for (var t = 0; t <= 100; t += 10) {
        h += '<span style="position:absolute;left:' + t + '%;top:6px;font-size:12px;">' + t + '</span>';
      }
      if (placed) {
        h += '<span style="position:absolute;left:' + L.a + '%;top:-14px;color:#dc2626;font-weight:bold;">▲' + L.a + '</span>';
        h += '<span style="position:absolute;left:' + L.b + '%;top:-14px;color:#2563eb;font-weight:bold;">▲' + L.b + '</span>';
      }
      h += '</div>';
      var ln = gid(K + '-line'); if (ln) ln.innerHTML = h;
    }
    function resetRound() {
      var L = lv();
      guessed = -1; placed = false; done = false;
      var q = gid(K + '-q'); if (q) q.textContent = L.a + ' 和 ' + L.b + '，哪个大？';
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        if (b) { b.textContent = L.opts[i]; b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜：' + L.a + ' 和 ' + L.b + '，哪个大？');
      drawLine();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(i) {
      if (done) return;
      guessed = i;
      msg('你猜' + lv().opts[i] + '。放到数轴上看看。');
    }
    function place() {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：哪个大？'); return; }
      var L = lv();
      placed = true;
      drawLine();
      var bigger = L.a > L.b ? L.a : L.b;
      var smaller = L.a > L.b ? L.b : L.a;
      done = true;
      msg(bigger + ' 在 ' + smaller + ' 的右边，所以 ' + bigger + ' 大。' + (guessed === L.ans ? '你猜对了！' : '你刚才猜的是' + L.opts[guessed] + '。'));
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-place').addEventListener('click', place);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：46 大', '提高：52 大', '挑战：100 大'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm113-abacus',
  title: '计数器拨珠',
  sub: '十位拨几颗、个位拨几颗，合起来就是那个数：46 是十位 4 颗、个位 6 颗。',
  grade: 1,
  kind: '模拟',
  points: ['1.13'],
  render: function (el) {
    var K = 'm113-abacus';
    var LEVELS = [
      { label: '基础', n: 46, tens: 4, ones: 6, opts: [3, 4, 5], ans: 1 },
      { label: '提高', n: 35, tens: 3, ones: 5, opts: [2, 3, 4], ans: 1 },
      { label: '挑战', n: 70, tens: 7, ones: 0, opts: [6, 7, 8], ans: 1 }
    ];
    var levelIdx = 0, guessed = -1, t = 0, o = 0, done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 1 年级 · 100以内数的认识</p>' +
      '<h3>计数器拨珠</h3>' +
      '<p>计数器有两根杆：左边十位，右边个位。一颗珠子在十位上是 10，在个位上是 1。拨出目标数来。</p>' +
      '<p>目标数：<b id="' + K + '-target"></b></p>' +
      '<div id="' + K + '-counter"></div>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span>的十位是几？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 拨珠：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-tens" type="button">十位拨一颗</button>' +
      '<button class="btn small primary" id="' + K + '-ones" type="button">个位拨一颗</button>' +
      '<button class="btn small primary" id="' + K + '-done" type="button">拨好了</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再拨珠。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 拨 46</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 拨 35</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 拨 70</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都拨对，并且能说出“十位一颗是 10，个位一颗是 1”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function beads(n) { var s = ''; for (var i = 0; i < n; i++) s += '●'; return s || '（没有珠子）'; }
    function drawCounter() {
      var c = gid(K + '-counter');
      if (c) c.innerHTML = '<p>十位：' + beads(t) + '（' + t + ' 颗）</p><p>个位：' + beads(o) + '（' + o + ' 颗）</p><p>现在是：' + (t * 10 + o) + '</p>';
    }
    function resetRound() {
      var L = lv();
      guessed = -1; t = 0; o = 0; done = false;
      var tg = gid(K + '-target'); if (tg) tg.textContent = String(L.n);
      var q = gid(K + '-q'); if (q) q.textContent = String(L.n);
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        if (b) { b.textContent = String(L.opts[i]); b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜：' + L.n + ' 的十位是几？');
      drawCounter();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(i) {
      if (done) return;
      guessed = i;
      msg('你猜十位是 ' + lv().opts[i] + ' 颗。拨珠，看看对不对。');
    }
    function addBead(which) {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：十位是几？'); return; }
      if (which === 't') { if (t < 9) t++; }
      else if (o < 9) o++;
      drawCounter();
      msg('现在是 ' + (t * 10 + o) + '，点“拨好了”核对。');
    }
    function finish() {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：十位是几？'); return; }
      var L = lv();
      if (t === L.tens && o === L.ones) {
        done = true;
        msg('拨对了！十位 ' + t + ' 颗，个位 ' + o + ' 颗，就是 ' + L.n + '。' + (guessed === L.ans ? '你猜对了！' : '你刚才猜十位是 ' + L.opts[guessed] + ' 颗。'));
        for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('现在是 ' + (t * 10 + o) + '，' + L.n + ' 要十位 ' + L.tens + ' 颗、个位 ' + L.ones + ' 颗，再调一调。');
      }
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-tens').addEventListener('click', function () { addBead('t'); });
    gid(K + '-ones').addEventListener('click', function () { addBead('o'); });
    gid(K + '-done').addEventListener('click', finish);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：拨出 46', '提高：拨出 35', '挑战：拨出 70'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

/* ---------- 1.14 认识人民币 ---------- */
registerAnim({
  key: 'm114-ways',
  title: '凑钱有多少种',
  sub: '1 元能凑出好几种：2 个 5 角，10 个 1 角，还能 5 角加 5 个 1 角。',
  grade: 1,
  kind: '实验',
  points: ['1.14'],
  render: function (el) {
    var K = 'm114-ways';
    var LEVELS = [
      { label: '基础', target: 10, targetTx: '1 元', coins: [['1 元', 10], ['5 角', 5], ['1 角', 1]] },
      { label: '提高', target: 8, targetTx: '8 角', coins: [['5 角', 5], ['1 角', 1]] },
      { label: '挑战', target: 15, targetTx: '1 元 5 角', coins: [['1 元', 10], ['5 角', 5], ['1 角', 1]] }
    ];
    var levelIdx = 0, counts = [0, 0, 0], found = [], done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">实验 · 1 年级 · 认识人民币</p>' +
      '<h3>凑钱有多少种</h3>' +
      '<p>同样的钱，能用不同的零钱凑出来。点硬币凑一凑：凑出目标数算一种，再凑一种不一样的才算过关。</p>' +
      '<p>目标：凑出 <b id="' + K + '-target"></b></p>' +
      '<p>第 1 步 · 先猜：1 元能有几种凑法？先凑出一种再说。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-c-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-c-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-c-2" type="button"></button></div>' +
      '<p id="' + K + '-tray"></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-finish" type="button">凑好了，算一种</button>' +
      '<button class="btn small ghost" id="' + K + '-clear" type="button">拿掉重凑</button></div>' +
      '<p id="' + K + '-msg">点硬币凑一凑。</p>' +
      '<p id="' + K + '-found"></p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 凑 1 元</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 凑 8 角</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 凑 1 元 5 角</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：每档都凑出 2 种不同的凑法，并且能说出“10 角 = 1 元”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function total() {
      var L = lv(), s = 0;
      for (var i = 0; i < L.coins.length; i++) s += counts[i] * L.coins[i][1];
      return s;
    }
    function wayTx() {
      var L = lv(), parts = [];
      for (var i = 0; i < L.coins.length; i++) {
        if (counts[i] > 0) parts.push(counts[i] + ' 个' + L.coins[i][0]);
      }
      return parts.join(' + ') || '还没放钱';
    }
    function drawTray() {
      var tr = gid(K + '-tray');
      if (tr) tr.textContent = '现在放了：' + wayTx() + '，一共 ' + total() + ' 角。';
      var fd = gid(K + '-found');
      if (fd) fd.textContent = found.length > 0 ? '已经凑出的凑法：' + found.join('；') : '';
    }
    function resetRound() {
      var L = lv();
      counts = [0, 0, 0]; found = []; done = false;
      var tg = gid(K + '-target'); if (tg) tg.textContent = L.targetTx;
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-c-' + i);
        if (b) {
          if (i < L.coins.length) { b.textContent = '放 1 个' + L.coins[i][0]; b.hidden = false; }
          else b.hidden = true;
        }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('点硬币凑一凑，凑出' + L.targetTx + '。');
      drawTray();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function addCoin(i) {
      if (done) return;
      counts[i]++;
      drawTray();
      msg('现在一共 ' + total() + ' 角，目标是 ' + lv().target + ' 角。');
    }
    function clearTray() {
      counts = [0, 0, 0];
      drawTray();
      msg('拿掉了，重新凑。');
    }
    function finish() {
      if (done) return;
      var L = lv(), t = total();
      if (t < L.target) { msg('还差 ' + (L.target - t) + ' 角，再放几个。'); return; }
      if (t > L.target) { msg('超了 ' + (t - L.target) + ' 角，拿掉重凑。'); return; }
      var sig = counts.join('-');
      if (found.indexOf(wayTx()) >= 0 || found.indexOf(sig) >= 0) { msg('这种凑法已经有过了，换一种。'); return; }
      found.push(wayTx());
      drawTray();
      if (found.length >= 2) {
        done = true;
        msg('第 2 种凑法也有了：' + found.join('；') + '。' + L.targetTx + '能用好几种零钱凑出来。' + (L.target === 10 ? '记住：10 角 = 1 元。' : ''));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('第 1 种凑法：' + found[0] + '。再凑一种不一样的！');
        counts = [0, 0, 0];
        drawTray();
      }
    }
    gid(K + '-c-0').addEventListener('click', function () { addCoin(0); });
    gid(K + '-c-1').addEventListener('click', function () { addCoin(1); });
    gid(K + '-c-2').addEventListener('click', function () { addCoin(2); });
    gid(K + '-finish').addEventListener('click', finish);
    gid(K + '-clear').addEventListener('click', clearTray);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：1 元凑出 2 种', '提高：8 角凑出 2 种', '挑战：1 元 5 角凑出 2 种'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

/* ---------- 1.15 100以内加减法（一） ---------- */
registerAnim({
  key: 'm115-tens',
  title: '整十数先行',
  sub: '35 + 20：先算整十 30 + 20 = 50，再加个位 5，得 55。',
  grade: 1,
  kind: '模拟',
  points: ['1.15'],
  render: function (el) {
    var K = 'm115-tens';
    var LEVELS = [
      { label: '基础', a: 35, b: 20, tensA: 30, tensB: 20, tensSum: 50, ones: 5, total: 55, opts: ['30 + 20', '5 + 0', '35 + 2'], ans: 0 },
      { label: '提高', a: 42, b: 30, tensA: 40, tensB: 30, tensSum: 70, ones: 2, total: 72, opts: ['40 + 30', '2 + 0', '42 + 3'], ans: 0 },
      { label: '挑战', a: 26, b: 40, tensA: 20, tensB: 40, tensSum: 60, ones: 6, total: 66, opts: ['20 + 40', '6 + 0', '26 + 4'], ans: 0 }
    ];
    var levelIdx = 0, guessed = -1, phase = 0, done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 1 年级 · 100以内加减法（一）</p>' +
      '<h3>整十数先行</h3>' +
      '<p>整十数加整十数最省事：先把整十的算出来，个位最后再加。35 + 20，先算 30 + 20，再加 5。</p>' +
      '<p class="func-eq" id="' + K + '-eq"></p>' +
      '<p>第 1 步 · 先猜：先算哪一步？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 分两步算：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-step1" type="button">先算整十</button>' +
      '<button class="btn small primary" id="' + K + '-step2" type="button">再加个位</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再分两步算。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 35 + 20</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 42 + 30</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 26 + 40</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都算对，并且能说出“整十数先算，个位最后加”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function resetRound() {
      var L = lv();
      guessed = -1; phase = 0; done = false;
      var eq = gid(K + '-eq'); if (eq) eq.textContent = L.a + ' + ' + L.b + ' = ?';
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        if (b) { b.textContent = L.opts[i]; b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜：先算哪一步？');
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(i) {
      if (done) return;
      guessed = i;
      msg('你猜先算 ' + lv().opts[i] + '。点“先算整十”试试。');
    }
    function step1() {
      if (done || phase !== 0) return;
      if (guessed < 0) { msg('先猜一猜：先算哪一步？'); return; }
      var L = lv();
      if (guessed !== L.ans) {
        msg('先算 ' + L.opts[guessed] + ' 不对：整十数先行，' + L.a + ' 的整十是 ' + L.tensA + '，先算 ' + L.tensA + ' + ' + L.tensB + '。');
        return;
      }
      phase = 1;
      msg(L.tensA + ' + ' + L.tensB + ' = ' + L.tensSum + '。整十算完了，再点“再加个位”。');
    }
    function step2() {
      if (done || phase !== 1) { if (!done && phase === 0) msg('先点“先算整十”。'); return; }
      var L = lv();
      phase = 2; done = true;
      msg(L.tensSum + ' + ' + L.ones + ' = ' + L.total + '。所以 ' + L.a + ' + ' + L.b + ' = ' + L.total + '：整十数先算，个位最后加。你猜对了！');
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-step1').addEventListener('click', step1);
    gid(K + '-step2').addEventListener('click', step2);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：35 + 20 = 55', '提高：42 + 30 = 72', '挑战：26 + 40 = 66'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm115-jump',
  title: '数线跳十跳一',
  sub: '23 + 15：先在数线上跳 1 个十到 33，再跳 5 个一到 38。',
  grade: 1,
  kind: '模拟',
  points: ['1.15'],
  render: function (el) {
    var K = 'm115-jump';
    var LEVELS = [
      { label: '基础', a: 23, b: 15, tens: 10, ones: 5, total: 38, opts: [36, 37, 38], ans: 2 },
      { label: '提高', a: 34, b: 21, tens: 20, ones: 1, total: 55, opts: [53, 54, 55], ans: 2 },
      { label: '挑战', a: 47, b: 12, tens: 10, ones: 2, total: 59, opts: [57, 58, 59], ans: 2 }
    ];
    var levelIdx = 0, guessed = -1, pos = 23, tenJumps = 0, oneJumps = 0, done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 1 年级 · 100以内加减法（一）</p>' +
      '<h3>数线跳十跳一</h3>' +
      '<p>加法在数线上跳：整十的，一次跳 10；个位的，一次跳 1。先跳十，再跳一，落到的地方就是答案。</p>' +
      '<div id="' + K + '-line"></div>' +
      '<p id="' + K + '-pos"></p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-q"></span>等于几？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 跳一跳：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-ten" type="button">跳 10</button>' +
      '<button class="btn small primary" id="' + K + '-one" type="button">跳 1</button>' +
      '<button class="btn small primary" id="' + K + '-check" type="button">对一对</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再跳一跳。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 23 + 15</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 34 + 21</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 47 + 12</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都跳到答案，并且能说出“先跳十，再跳一”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawLine() {
      var h = '';
      for (var t = 0; t <= 60; t += 10) {
        h += '<span style="display:inline-block;width:34px;text-align:center;margin:2px;font-size:13px;' + (pos >= t && pos < t + 10 ? 'color:#dc2626;font-weight:bold;' : '') + '">' + t + '</span>';
      }
      var ln = gid(K + '-line'); if (ln) ln.innerHTML = h;
      var p = gid(K + '-pos'); if (p) p.textContent = '现在在 ' + pos + '（跳了 ' + tenJumps + ' 个十、' + oneJumps + ' 个一）。';
    }
    function resetRound() {
      var L = lv();
      guessed = -1; pos = L.a; tenJumps = 0; oneJumps = 0; done = false;
      var q = gid(K + '-q'); if (q) q.textContent = L.a + ' + ' + L.b;
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        if (b) { b.textContent = String(L.opts[i]); b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜：' + L.a + ' + ' + L.b + ' 等于几？');
      drawLine();
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(i) {
      if (done) return;
      guessed = i;
      msg('你猜是 ' + lv().opts[i] + '。先跳十，再跳一，看看对不对。');
    }
    function jumpTen() {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：等于几？'); return; }
      pos += 10; tenJumps++;
      drawLine();
      msg('跳了一个十，现在在 ' + pos + '。');
    }
    function jumpOne() {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：等于几？'); return; }
      pos += 1; oneJumps++;
      drawLine();
      msg('跳了一个一，现在在 ' + pos + '。');
    }
    function checkIt() {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：等于几？'); return; }
      var L = lv();
      if (pos === L.total) {
        done = true;
        msg(L.a + ' + ' + L.b + ' = ' + L.total + '：先跳 ' + L.tens + '，再跳 ' + L.ones + ' 个一，落到 ' + L.total + '。' + (guessed === L.ans ? '你猜对了！' : '你刚才猜的是 ' + L.opts[guessed] + '。'));
        for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else if (pos < L.total) {
        msg('现在在 ' + pos + '，还差 ' + (L.total - pos) + ' 才到。');
      } else {
        msg('现在在 ' + pos + '，跳过头了 ' + (pos - L.total) + '，换一档重跳。');
      }
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-ten').addEventListener('click', jumpTen);
    gid(K + '-one').addEventListener('click', jumpOne);
    gid(K + '-check').addEventListener('click', checkIt);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：23 + 15 = 38', '提高：34 + 21 = 55', '挑战：47 + 12 = 59'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

/* ---------- 1.16 找规律 ---------- */
registerAnim({
  key: 'm116-diff',
  title: '数列差分找规律',
  sub: '2、4、6、8……每次多 2；1、2、4、7、11……差越变越大。看相邻两个数差几。',
  grade: 1,
  kind: '模拟',
  points: ['1.16'],
  render: function (el) {
    var K = 'm116-diff';
    var LEVELS = [
      { label: '基础', seq: [2, 4, 6, 8], next: 10, opts: [9, 10, 12], ans: 1, rule: '每次多 2' },
      { label: '提高', seq: [1, 2, 4, 7, 11], next: 16, opts: [15, 16, 17], ans: 1, rule: '相邻两个数差 1、2、3、4、5' },
      { label: '挑战', seq: [20, 18, 16, 14], next: 12, opts: [11, 12, 13], ans: 1, rule: '每次少 2' }
    ];
    var levelIdx = 0, guessed = -1, done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 1 年级 · 找规律</p>' +
      '<h3>数列差分找规律</h3>' +
      '<p>数字没有重复的单元，就看相邻两个数每次多几、少几：差不变，接着往下写；差在变，差的变化也是规律。</p>' +
      '<p id="' + K + '-seq"></p>' +
      '<p>第 1 步 · 先猜：下一个是几？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 揭开：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-reveal" type="button">揭开看看</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再揭开。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 每次多 2</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 差越变越大</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 每次少 2</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都猜对，并且能说出“看相邻两个数差几”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function resetRound() {
      var L = lv();
      guessed = -1; done = false;
      var sq = gid(K + '-seq'); if (sq) sq.textContent = '这一串是：' + L.seq.join('、') + '、？';
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        if (b) { b.textContent = String(L.opts[i]); b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜：下一个是几？');
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(i) {
      if (done) return;
      guessed = i;
      msg('你猜下一个是 ' + lv().opts[i] + '。点“揭开看看”。');
    }
    function reveal() {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：下一个是几？'); return; }
      var L = lv();
      done = true;
      msg('下一个是 ' + L.next + '：' + L.rule + '。' + (guessed === L.ans ? '你猜对了！' : '你刚才猜的是 ' + L.opts[guessed] + '，相邻两个数差几，再算一遍。'));
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-reveal').addEventListener('click', reveal);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：下一个是 10', '提高：下一个是 16', '挑战：下一个是 12'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});

registerAnim({
  key: 'm116-action',
  title: '动作规律接龙',
  sub: '拍手、拍手、跺脚，拍手、拍手、跺脚……身体也会排规律，下一个动作是什么？',
  grade: 1,
  kind: '实验',
  points: ['1.16'],
  render: function (el) {
    var K = 'm116-action';
    var EMOJI = { '拍手': '👏', '跺脚': '🦶', '拍腿': '👋' };
    var LEVELS = [
      { label: '基础', seq: ['拍手', '拍手', '跺脚', '拍手', '拍手', '跺脚', '拍手'], next: '拍手', opts: ['拍手', '跺脚', '拍腿'], ans: 0, unit: '拍手、拍手、跺脚' },
      { label: '提高', seq: ['拍手', '跺脚', '拍腿', '拍手', '跺脚', '拍腿', '拍手'], next: '跺脚', opts: ['拍手', '跺脚', '拍腿'], ans: 1, unit: '拍手、跺脚、拍腿' },
      { label: '挑战', seq: ['跺脚', '跺脚', '拍手', '跺脚', '跺脚', '拍手', '跺脚'], next: '跺脚', opts: ['拍手', '跺脚', '拍腿'], ans: 1, unit: '跺脚、跺脚、拍手' }
    ];
    var levelIdx = 0, guessed = -1, done = false, tiers = null;
    function lv() { return LEVELS[levelIdx]; }
    el.innerHTML =
      '<p class="demo-tag">实验 · 1 年级 · 找规律</p>' +
      '<h3>动作规律接龙</h3>' +
      '<p>规律不只在纸上：拍手、跺脚、拍腿，身体的动作也会一遍一遍重复。看好这一串动作，下一个该做什么？</p>' +
      '<p id="' + K + '-seq"></p>' +
      '<p>第 1 步 · 先猜：下一个动作是什么？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g-0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g-2" type="button"></button></div>' +
      '<p>第 2 步 · 做出来：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-do" type="button">做出来</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再做出来。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 拍手拍手跺脚</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 拍手跺脚拍腿</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 跺脚跺脚拍手</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都接对，并且能跟着做一遍完整的动作规律。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function seqTx() {
      var L = lv(), s = '';
      for (var i = 0; i < L.seq.length; i++) s += EMOJI[L.seq[i]] + L.seq[i] + ' ';
      return s + '？';
    }
    function resetRound() {
      var L = lv();
      guessed = -1; done = false;
      var sq = gid(K + '-seq'); if (sq) sq.textContent = seqTx();
      for (var i = 0; i < 3; i++) {
        var b = gid(K + '-g-' + i);
        if (b) { b.textContent = EMOJI[L.opts[i]] + L.opts[i]; b.disabled = false; }
      }
      for (var k = 0; k < 3; k++) { var lb = gid(K + '-level-' + k); if (lb) lb.setAttribute('aria-pressed', String(k === levelIdx)); }
      msg('先猜一猜：下一个动作是什么？');
    }
    function setLevel(i) { levelIdx = i; resetRound(); }
    function onGuess(i) {
      if (done) return;
      guessed = i;
      msg('你猜下一个是' + lv().opts[i] + '。点“做出来”。');
    }
    function doIt() {
      if (done) return;
      if (guessed < 0) { msg('先猜一猜：下一个动作是什么？'); return; }
      var L = lv();
      done = true;
      msg('下一个是' + L.next + EMOJI[L.next] + '：单元是' + L.unit + '，一遍一遍重复。' + (guessed === L.ans ? '你猜对了！站起来跟着做一遍：' + L.unit + '。' : '你刚才猜的是' + L.opts[guessed] + '，再看一遍单元：' + L.unit + '。'));
      for (var i = 0; i < 3; i++) { var b = gid(K + '-g-' + i); if (b) b.disabled = true; }
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    }
    gid(K + '-g-0').addEventListener('click', function () { onGuess(0); });
    gid(K + '-g-1').addEventListener('click', function () { onGuess(1); });
    gid(K + '-g-2').addEventListener('click', function () { onGuess(2); });
    gid(K + '-do').addEventListener('click', doIt);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：接上拍手', '提高：接上跺脚', '挑战：接上跺脚'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    resetRound();
  }
});
