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
