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
