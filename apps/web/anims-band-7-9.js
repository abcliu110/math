/* anims-band-7-9.js：7–9 年级的新动画（注册表）；每加一个动画调一次 registerAnim，格式见 anims-registry.js 的文件头注释；本文件顶层只能调 registerAnim，不能引用 app.js 的标识符。 */
/* 本批：7.1–7.8 全部方法，24 个动画。每个动画：先猜 → 玩 → 说；三档；“我的发现”进 math-inquiry-v1；做完 markTried(key)。 */

registerAnim({
  key: 'm71-numline',
  title: '数轴距离法',
  sub: '温度、海拔、欠款三把尺共用一条数轴：点一动，三处联动；绝对值就是到原点的距离，实时量出来。',
  grade: 7,
  kind: '模拟',
  points: ['7.1'],
  render: function (el) {
    var K = 'm71-numline';
    var LEVELS = [
      { label: '基础', target: -3, q: '|-3| 是几？', opts: ['3', '-3', '0'], ans: 0 },
      { label: '提高', target: 7, q: '|7| 和 |-7| 一样吗？', opts: ['一样，都是 7', '不一样', '都是 -7'], ans: 0 },
      { label: '挑战', target: -5, q: '和 -5 绝对值相等、但不相等的数是？', opts: ['5', '-5', '0'], ans: 0 }
    ];
    var levelIdx = 0, v = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 正数和负数</p>' +
      '<h3>数轴距离法</h3>' +
      '<p>一条数轴，三种意思：温度、海拔、欠款都用它量。拖动下面的滑杆，数轴上的点跟着走，三处读数一起变；红线段就是它到原点的距离——那就是绝对值。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 拖一拖：滑杆就是数轴上的点，拖到目标数停下。</p>' +
      '<p><input type="range" id="' + K + '-slider" min="-10" max="10" step="1" value="0" style="width:90%"> <b id="' + K + '-v">0</b></p>' +
      '<p id="' + K + '-line"></p>' +
      '<p>温度：<b id="' + K + '-temp">0℃</b>　海拔：<b id="' + K + '-alt">0 米</b>　欠款：<b id="' + K + '-debt">不欠钱</b></p>' +
      '<p>到原点的距离（绝对值）：<b id="' + K + '-abs">0</b></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拖滑杆。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 移到 -3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 移到 7</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 移到 -5</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都移到目标数，并且能说出“绝对值就是到原点的距离”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawLine() {
      var s = '';
      for (var i = -10; i <= 10; i++) {
        s += (i === v) ? '[●' + i + ']' : (i === 0 ? ' 0 ' : ' · ');
      }
      var ln = gid(K + '-line'); if (ln) ln.textContent = s;
    }
    function render() {
      var L = LEVELS[levelIdx];
      gid(K + '-v').textContent = String(v);
      gid(K + '-temp').textContent = (v >= 0 ? v + '℃' : '零下 ' + (-v) + '℃');
      gid(K + '-alt').textContent = (v >= 0 ? '海拔 ' + v + ' 米' : '海拔 -' + (-v) + ' 米（低于海平面）');
      gid(K + '-debt').textContent = (v >= 0 ? '不欠钱' : '欠 ' + (-v) + ' 元');
      gid(K + '-abs').textContent = String(Math.abs(v));
      drawLine();
      if (v === L.target && guessed >= 0) {
        var ok = guessed === L.ans;
        msg('到了 ' + v + '：绝对值是 ' + Math.abs(v) + '。' +
          (levelIdx === 1 ? '|7| = 7，|-7| = 7，方向不同，离原点一样远。' :
            levelIdx === 2 ? '5 和 -5 到原点的距离都是 5，所以 |-5| = |5| = 5。' : '') +
          (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍红线段：它量的是距离，没有负号。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      levelIdx = i; v = 0; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-slider').value = '0';
      msg('先猜一猜，再拖滑杆到 ' + L.target + '。');
      render();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。拖滑杆到 ' + LEVELS[levelIdx].target + '，看看对不对。');
        });
      })(g);
    }
    gid(K + '-slider').addEventListener('input', function (e) {
      v = parseInt(e.target.value, 10);
      if (guessed < 0) { msg('先猜一猜，再拖滑杆。'); return; }
      render();
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：|-3| = 3', '提高：|7| = |-7|', '挑战：找到 5'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm71-scene',
  title: '真实情境法（温度/海拔/欠款）',
  sub: '零下 3℃、海拔 -10 米、欠 5 元——负号先有意思，再有规则：把三个情境一个一个放到数轴上。',
  grade: 7,
  kind: '实验',
  points: ['7.1'],
  render: function (el) {
    var K = 'm71-scene';
    var SCENES = [
      { label: '基础', name: '温度', text: '零下 3℃', value: -3, unit: '℃' },
      { label: '提高', name: '海拔', text: '海拔 -10 米', value: -10, unit: '米' },
      { label: '挑战', name: '欠款', text: '欠 5 元', value: -5, unit: '元' }
    ];
    var levelIdx = 0, placed = {}, guessed = null, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 正数和负数</p>' +
      '<h3>真实情境法（温度/海拔/欠款）</h3>' +
      '<p>负数不是凭空来的：比 0 低、比 0 少的量，就要用负数记。先猜它在 0 的哪边，再点卡片，把它放到数轴上。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-left" type="button">在 0 的左边（负数）</button>' +
      '<button class="btn small primary" id="' + K + '-guess-right" type="button">在 0 的右边（正数）</button></div>' +
      '<p>第 2 步 · 放上数轴：点下面的卡片，再点数轴上的刻度。</p>' +
      '<p id="' + K + '-line">-10 · · · · · · · · · · 0 · · · · · · · · · · 10</p>' +
      '<p id="' + K + '-placed"></p>' +
      '<div class="btn-row">' +
      '<button class="btn small" id="' + K + '-card-0" type="button">温度：零下 3℃</button>' +
      '<button class="btn small" id="' + K + '-card-1" type="button">海拔：-10 米</button>' +
      '<button class="btn small" id="' + K + '-card-2" type="button">欠款：欠 5 元</button></div>' +
      '<p>点数轴刻度：</p><div class="btn-row" id="' + K + '-ticks"></div>' +
      '<p id="' + K + '-msg">先猜一猜：这个情境在 0 的左边还是右边？</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 温度</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 海拔</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 欠款</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三个情境都放到对的位置，并且能说出“比 0 低 / 比 0 少就用负数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    var selCard = -1;
    function buildTicks() {
      var box = gid(K + '-ticks');
      while (box.firstChild) box.removeChild(box.firstChild);
      for (var i = -10; i <= 10; i++) {
        (function (i) {
          var b = document.createElement('button');
          b.type = 'button'; b.className = 'btn small ghost'; b.textContent = String(i);
          b.addEventListener('click', function () { onTick(i); });
          box.appendChild(b);
        })(i);
      }
    }
    function onTick(i) {
      if (selCard < 0) { msg('先点一张情境卡片，再点刻度。'); return; }
      if (guessed === null) { msg('先猜一猜：它在 0 的左边还是右边？'); return; }
      var sc = SCENES[selCard];
      if (i === sc.value) {
        placed[selCard] = true;
        var p = gid(K + '-placed');
        p.textContent = (p.textContent ? p.textContent + '　' : '') + sc.name + ' → ' + sc.value + sc.unit;
        msg(sc.text + '放在 ' + sc.value + ' 对了！' +
          (guessed === 'left' ? '你猜对了：比 0 低 / 少，在左边。' : '它在 0 的左边，你刚才猜了右边——比 0 低的量就是负数。') +
          (levelIdx === 2 ? '再比一比：-10 比 -5 更靠左，所以 -10 更小。' : ''));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
        selCard = -1;
      } else {
        msg('放在 ' + i + ' 不对：' + sc.text + ' 是比 0 ' + (sc.value < 0 ? '低' : '高') + ' 的量，再想想它在 0 的哪边、离 0 几格。');
      }
    }
    function setLevel(i) {
      levelIdx = i; selCard = i; guessed = null;
      var sc = SCENES[i];
      gid(K + '-guess-tx').textContent = sc.text + '——在 0 的左边还是右边？';
      gid(K + '-guess-left').disabled = false;
      gid(K + '-guess-right').disabled = false;
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      msg('这一档是“' + sc.name + '”：先猜，再点刻度 ' + sc.value + ' 试试。');
    }
    gid(K + '-guess-left').addEventListener('click', function () { guessed = 'left'; msg('你猜：左边。再点刻度放上去。'); });
    gid(K + '-guess-right').addEventListener('click', function () { guessed = 'right'; msg('你猜：右边。再点刻度放上去。'); });
    for (var c = 0; c < 3; c++) {
      (function (c) {
        gid(K + '-card-' + c).addEventListener('click', function () {
          selCard = c;
          msg('选好了“' + SCENES[c].name + '”，点下面的刻度把它放上去。');
        });
      })(c);
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：零下 3℃ → -3', '提高：海拔 -10 米', '挑战：欠 5 元 → -5'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    buildTicks();
    setLevel(0);
  }
});

registerAnim({
  key: 'm71-mirror',
  title: '相反数镜像法',
  sub: '相反数是关于原点的镜像：距离相等、方向相反。拖动一个数，照照镜子，看它的相反数长什么样。',
  grade: 7,
  kind: '模拟',
  points: ['7.1'],
  render: function (el) {
    var K = 'm71-mirror';
    var LEVELS = [
      { label: '基础', a: 4, q: '4 的相反数是？', opts: ['-4', '4', '0'], ans: 0 },
      { label: '提高', a: -2.5, q: '-2.5 的相反数是？', opts: ['2.5', '-2.5', '5'], ans: 0 },
      { label: '挑战', a: 0, q: '0 的相反数是？', opts: ['0', '1', '-1'], ans: 0 }
    ];
    var levelIdx = 0, a = 4, guessed = -1, shown = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 正数和负数</p>' +
      '<h3>相反数镜像法</h3>' +
      '<p>0 是镜子：一个数照镜子，镜子里的数离 0 一样远、方向相反。先猜，再点“照镜子”验证；还可以自己拖滑杆换个数照一照。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 照镜子：<button class="btn small primary" id="' + K + '-mirror-btn" type="button">照镜子</button>　自己换个数：<input type="range" id="' + K + '-slider" min="-6" max="6" step="0.5" value="4" style="width:50%"></p>' +
      '<p>这个数：<b id="' + K + '-a">4</b>　镜子里的数：<b id="' + K + '-b">？</b></p>' +
      '<p id="' + K + '-line"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再照镜子。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · -2.5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 0</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都照对，并且能说出“相反数到原点的距离相等、方向相反”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function fmt(x) { return (Math.round(x * 10) / 10).toString(); }
    function drawLine() {
      var s = '';
      for (var i = -6; i <= 6; i++) {
        var mark = '';
        if (i === a) mark = '●';
        if (shown && i === -a) mark = '○';
        s += (i === 0 ? ' 0 ' : (mark ? mark + i : ' · '));
      }
      var ln = gid(K + '-line'); if (ln) ln.textContent = s;
    }
    function setLevel(i) {
      levelIdx = i; a = LEVELS[i].a; guessed = -1; shown = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-slider').value = String(a);
      gid(K + '-a').textContent = fmt(a);
      gid(K + '-b').textContent = '？';
      drawLine();
      msg('先猜一猜 ' + fmt(a) + ' 的相反数，再照镜子。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。点“照镜子”验证。');
        });
      })(g);
    }
    gid(K + '-slider').addEventListener('input', function (e) {
      a = parseFloat(e.target.value);
      shown = false;
      gid(K + '-a').textContent = fmt(a);
      gid(K + '-b').textContent = '？';
      drawLine();
      msg('换成了 ' + fmt(a) + '：先猜它的相反数，再照镜子。');
    });
    gid(K + '-mirror-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再照镜子。'); return; }
      shown = true;
      var opp = -a;
      gid(K + '-b').textContent = fmt(opp);
      drawLine();
      var ok = guessed === LEVELS[levelIdx].ans;
      var extra = (a === 0) ? '0 照镜子还是 0——0 的相反数是它自己。' :
        ('两个数到原点的距离都是 ' + fmt(Math.abs(a)) + '，一个在左一个在右，加起来是 0。');
      msg(fmt(a) + ' 的相反数是 ' + fmt(opp) + '。' + extra + (ok ? '你猜对了！' : '你刚才猜的是“' + LEVELS[levelIdx].opts[guessed] + '”。'));
      if (a === LEVELS[levelIdx].a) {
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：4 的相反数是 -4', '提高：-2.5 的相反数是 2.5', '挑战：0 的相反数是 0'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm72-walk',
  title: '数轴走路法',
  sub: '加法就是小人在数轴上走：加正数向右走，加负数向左走；减法就是反方向走。先猜落点，再让小人走。',
  grade: 7,
  kind: '模拟',
  points: ['7.2'],
  render: function (el) {
    var K = 'm72-walk';
    var LEVELS = [
      { label: '基础', start: 2, step: 3, op: '+', q: '2 + 3，小人走到几？', opts: ['5', '-1', '1'], ans: 0 },
      { label: '提高', start: -1, step: -4, op: '+', q: '-1 + (-4)，小人走到几？', opts: ['-5', '3', '-3'], ans: 0 },
      { label: '挑战', start: 5, step: -8, op: '-', q: '5 - 8，小人走到几？', opts: ['-3', '13', '3'], ans: 0 }
    ];
    var levelIdx = 0, pos = 2, walked = false, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 有理数的加减法</p>' +
      '<h3>数轴走路法</h3>' +
      '<p>小人站在数轴上：加一个数，就朝它的方向走那么多格；加正数向右，加负数向左。减法就是“反方向走”。先猜落点，再点“走”。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 走一走：<button class="btn small primary" id="' + K + '-walk-btn" type="button">走</button>　<button class="btn small ghost" id="' + K + '-reset-btn" type="button">回到起点</button></p>' +
      '<p>算式：<b id="' + K + '-expr"></b>　小人在：<b id="' + K + '-pos"></b></p>' +
      '<p id="' + K + '-line"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“走”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 2 + 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · -1 + (-4)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 5 - 8</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都走对，并且能说出“加负数向左走，减法就是反方向走”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function exprText(L) {
      var s = L.step >= 0 ? '+' + L.step : String(L.step);
      return L.start + ' ' + L.op + ' (' + s + ')';
    }
    function drawLine() {
      var s = '';
      for (var i = -10; i <= 10; i++) {
        s += (i === pos) ? '[人' + i + ']' : (i === 0 ? ' 0 ' : ' · ');
      }
      var ln = gid(K + '-line'); if (ln) ln.textContent = s;
    }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      pos = L.start; walked = false; guessed = -1;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-expr').textContent = exprText(L);
      gid(K + '-pos').textContent = String(pos);
      drawLine();
      msg('小人从 ' + L.start + ' 出发，先猜落点，再点“走”。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。点“走”，看小人落在哪。');
        });
      })(g);
    }
    gid(K + '-walk-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜落点，再点“走”。'); return; }
      var L = LEVELS[levelIdx];
      var dest = L.op === '+' ? L.start + L.step : L.start - L.step;
      pos = dest; walked = true;
      gid(K + '-pos').textContent = String(pos);
      drawLine();
      var ok = guessed === L.ans;
      var dir = (L.op === '+' ? L.step : -L.step) >= 0 ? '向右' : '向左';
      msg(exprText(L) + ' = ' + dest + '：小人' + dir + '走了 ' + Math.abs(L.op === '+' ? L.step : -L.step) + ' 格。' +
        (levelIdx === 2 ? '减 8 就是反方向走 8 格，也就是加 -8。' : '') +
        (ok ? '你猜对了！' : '你刚才猜的是 ' + L.opts[guessed] + '，再看一遍小人的脚印。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-reset-btn').addEventListener('click', function () { setLevel(levelIdx); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：2 + 3 = 5', '提高：-1 + (-4) = -5', '挑战：5 - 8 = -3'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm72-chips',
  title: '正负筹码抵消法（零对）',
  sub: '红筹码是 +1，蓝筹码是 -1：一红一蓝凑成零对就消失，剩下的筹码就是答案；减法就是拿走筹码，拿不走就先补零对。',
  grade: 7,
  kind: '实验',
  points: ['7.2'],
  render: function (el) {
    var K = 'm72-chips';
    var LEVELS = [
      { label: '基础', expr: '3 + (-2)', startPos: 0, startNeg: 0, q: '3 + (-2) 是几？', opts: ['1', '5', '-1'], ans: 0, hint: '先放 3 个红筹码，再放 2 个蓝筹码，抵消零对。' },
      { label: '提高', expr: '(-5) + 3', startPos: 0, startNeg: 0, q: '(-5) + 3 是几？', opts: ['-2', '2', '-8'], ans: 0, hint: '先放 5 个蓝筹码，再放 3 个红筹码，抵消零对。' },
      { label: '挑战', expr: '2 - (-3)', startPos: 2, startNeg: 0, q: '2 - (-3) 是几？', opts: ['5', '-1', '-5'], ans: 0, hint: '桌上只有 2 个红筹码，拿不走蓝筹码——先补 3 对零对，再拿走 3 个蓝的。' }
    ];
    var levelIdx = 0, pos = 0, neg = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 有理数的加减法</p>' +
      '<h3>正负筹码抵消法（零对）</h3>' +
      '<p>红筹码 = +1，蓝筹码 = -1。一红一蓝凑成一对就抵消消失（零对），最后剩下的就是答案。减法就是“拿走”：桌上没有要拿的筹码，就先补几对零对再拿——总数不变。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 摆筹码：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small" id="' + K + '-add-pos" type="button">＋红（+1）</button>' +
      '<button class="btn small" id="' + K + '-add-neg" type="button">＋蓝（-1）</button>' +
      '<button class="btn small" id="' + K + '-take-pos" type="button">拿走红</button>' +
      '<button class="btn small" id="' + K + '-take-neg" type="button">拿走蓝</button>' +
      '<button class="btn small" id="' + K + '-add-zero" type="button">补一对零对</button>' +
      '<button class="btn small primary" id="' + K + '-cancel" type="button">抵消零对</button></div>' +
      '<p>桌上：<b id="' + K + '-table"></b></p>' +
      '<p>算式：<b id="' + K + '-expr"></b>　提示：<span id="' + K + '-hint"></span></p>' +
      '<p><button class="btn small primary" id="' + K + '-check" type="button">算一算，报答案</button></p>' +
      '<p id="' + K + '-msg">先猜一猜，再摆筹码。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 3 + (-2)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · (-5) + 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 2 - (-3)</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都摆对，并且能说出“零对抵消，剩下的就是答案”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function renderTable() {
      var s = '';
      for (var i = 0; i < pos; i++) s += '●';
      for (var j = 0; j < neg; j++) s += '○';
      gid(K + '-table').textContent = (s || '空') + '（红 ' + pos + ' 个，蓝 ' + neg + ' 个，合计 ' + (pos - neg) + '）';
    }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      pos = L.startPos; neg = L.startNeg; guessed = -1;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-expr').textContent = L.expr;
      gid(K + '-hint').textContent = L.hint;
      renderTable();
      msg('先猜 ' + L.expr + ' 的答案，再摆筹码。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。摆好筹码，点“算一算”验证。');
        });
      })(g);
    }
    gid(K + '-add-pos').addEventListener('click', function () { pos++; renderTable(); });
    gid(K + '-add-neg').addEventListener('click', function () { neg++; renderTable(); });
    gid(K + '-take-pos').addEventListener('click', function () {
      if (pos <= 0) { msg('桌上没有红筹码可拿——先补零对。'); return; }
      pos--; renderTable();
    });
    gid(K + '-take-neg').addEventListener('click', function () {
      if (neg <= 0) { msg('桌上没有蓝筹码可拿——先补零对。'); return; }
      neg--; renderTable();
    });
    gid(K + '-add-zero').addEventListener('click', function () { pos++; neg++; renderTable(); msg('补了一对零对：+1 和 -1 一起放，总数不变。'); });
    gid(K + '-cancel').addEventListener('click', function () {
      var n = Math.min(pos, neg);
      if (n === 0) { msg('没有能抵消的零对。'); return; }
      pos -= n; neg -= n; renderTable();
      msg('抵消了 ' + n + ' 对零对，剩下红 ' + pos + ' 个、蓝 ' + neg + ' 个。');
    });
    gid(K + '-check').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜答案。'); return; }
      var L = LEVELS[levelIdx];
      var expect = [1, -2, 5][levelIdx];
      if (pos - neg !== expect) {
        msg('桌上合计是 ' + (pos - neg) + '，还不是 ' + expect + '：再摆一摆、抵消一下。');
        return;
      }
      var ok = guessed === L.ans;
      msg(L.expr + ' = ' + expect + '：' +
        (levelIdx === 2 ? '拿走 3 个蓝筹码，等于加上 3 个红筹码——减 -3 就是加 3。' : '零对抵消完，剩下的就是答案。') +
        (ok ? '你猜对了！' : '你刚才猜的是 ' + L.opts[guessed] + '，再看一遍桌上的筹码。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3 + (-2) = 1', '提高：(-5) + 3 = -2', '挑战：2 - (-3) = 5'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm72-subadd',
  title: '减法变加法（加相反数）',
  sub: 'a - b = a + (-b)：减号翻个面，减数也翻个面，减法就变成了加法。翻一翻，看两边算出来是不是一样。',
  grade: 7,
  kind: '演示',
  points: ['7.2'],
  render: function (el) {
    var K = 'm72-subadd';
    var LEVELS = [
      { label: '基础', a: 5, b: 3, q: '5 - 3 变成加法是？', opts: ['5 + (-3)', '5 + 3', '-5 + 3'], ans: 0 },
      { label: '提高', a: -2, b: 4, q: '-2 - 4 变成加法是？', opts: ['-2 + (-4)', '-2 + 4', '2 + (-4)'], ans: 0 },
      { label: '挑战', a: 3, b: -5, q: '3 - (-5) 变成加法是？', opts: ['3 + 5', '3 + (-5)', '-3 + 5'], ans: 0 }
    ];
    var levelIdx = 0, guessed = -1, flipped = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 7 年级 · 有理数的加减法</p>' +
      '<h3>减法变加法（加相反数）</h3>' +
      '<p>减法不用单独记：减一个数，就是加它的相反数。减号翻面，减数翻面，两边算出来一模一样——自己翻一次就信了。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 翻一翻：<button class="btn small primary" id="' + K + '-flip-btn" type="button">减号翻面，减数翻面</button>　<button class="btn small ghost" id="' + K + '-back-btn" type="button">翻回去</button></p>' +
      '<p>原来：<b id="' + K + '-orig"></b>　翻面后：<b id="' + K + '-flipped">？</b></p>' +
      '<p>两边算出来：<b id="' + K + '-vals">？</b></p>' +
      '<p id="' + K + '-msg">先猜一猜，减法变成加法该怎么写。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 5 - 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · -2 - 4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 3 - (-5)</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都翻对，并且能说出“减一个数就是加它的相反数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function fmt(x) { return (x >= 0 ? String(x) : '(' + x + ')'); }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      guessed = -1; flipped = false;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-orig').textContent = fmt(L.a) + ' - ' + fmt(L.b);
      gid(K + '-flipped').textContent = '？';
      gid(K + '-vals').textContent = '？';
      msg('先猜：' + fmt(L.a) + ' - ' + fmt(L.b) + ' 变成加法怎么写？');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。点“翻一翻”验证。');
        });
      })(g);
    }
    gid(K + '-flip-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再翻面。'); return; }
      var L = LEVELS[levelIdx];
      flipped = true;
      var addExpr = fmt(L.a) + ' + ' + fmt(-L.b);
      gid(K + '-flipped').textContent = addExpr;
      var v1 = L.a - L.b, v2 = L.a + (-L.b);
      gid(K + '-vals').textContent = fmt(L.a) + ' - ' + fmt(L.b) + ' = ' + v1 + '，' + addExpr + ' = ' + v2;
      var ok = guessed === L.ans;
      msg('减号翻成加号，' + fmt(L.b) + ' 翻成它的相反数 ' + fmt(-L.b) + '。两边都是 ' + v1 + '，一模一样。' +
        (levelIdx === 2 ? '减 -5 就是加 5，所以 3 - (-5) = 8。' : '') +
        (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，记住：减数要翻面。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-back-btn').addEventListener('click', function () {
      flipped = false;
      gid(K + '-flipped').textContent = '？';
      gid(K + '-vals').textContent = '？';
      msg('翻回去了。再猜一次，重新翻。');
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：5 - 3 = 5 + (-3)', '提高：-2 - 4 = -2 + (-4)', '挑战：3 - (-5) = 3 + 5'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm73-debt',
  title: '欠款账本法',
  sub: '(-2)×3 是欠 2 元记 3 次，(-2)×(-3) 是划掉 3 次欠款：乘法先有故事再有法则，负负得正在账本上看得见。',
  grade: 7,
  kind: '模拟',
  points: ['7.3'],
  render: function (el) {
    var K = 'm73-debt';
    var LEVELS = [
      { label: '基础', unit: -2, times: 3, mode: 'add', q: '欠 2 元，记 3 次，一共是？', opts: ['-6 元', '6 元', '1 元'], ans: 0, hint: '点 3 次“记一次欠 2 元”。' },
      { label: '提高', unit: -4, times: 3, mode: 'add', q: '欠 4 元，记 3 次，一共是？', opts: ['-12 元', '12 元', '-1 元'], ans: 0, hint: '点 3 次“记一次欠 4 元”。' },
      { label: '挑战', unit: -2, times: 3, mode: 'remove', q: '账上有 3 笔欠 2 元的账，全部划掉，账变了多少？', opts: ['多了 6 元', '少了 6 元', '不变'], ans: 0, hint: '先点 3 次“记一次欠 2 元”把账记上，再点 3 次“划掉一笔”。' }
    ];
    var levelIdx = 0, records = [], guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 有理数的乘除法</p>' +
      '<h3>欠款账本法</h3>' +
      '<p>乘法就是“记几次”：欠 2 元记 3 次，就是 (-2)×3；把欠款划掉，就是乘上一个负数——划掉欠款，钱就回来了，所以负负得正。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 记账：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small" id="' + K + '-add-btn" type="button">记一次欠款</button>' +
      '<button class="btn small" id="' + K + '-remove-btn" type="button">划掉一笔欠款</button>' +
      '<button class="btn small ghost" id="' + K + '-clear-btn" type="button">账本清零</button></div>' +
      '<p>账本：<b id="' + K + '-book">（空）</b></p>' +
      '<p>合计：<b id="' + K + '-total">0 元</b>　算式：<b id="' + K + '-expr"></b>　提示：<span id="' + K + '-hint"></span></p>' +
      '<p><button class="btn small primary" id="' + K + '-check" type="button">对账：报答案</button></p>' +
      '<p id="' + K + '-msg">先猜一猜，再记账。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · (-2)×3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · (-4)×3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · (-2)×(-3)</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都对上账，并且能说出“划掉欠款就是负负得正”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function total() {
      var s = 0;
      for (var i = 0; i < records.length; i++) s += records[i];
      return s;
    }
    function renderBook() {
      gid(K + '-book').textContent = records.length ? records.join('，') + '（每笔单位：元）' : '（空）';
      var t = total();
      gid(K + '-total').textContent = (t < 0 ? '欠 ' + (-t) + ' 元' : t === 0 ? '0 元（不欠不余）' : '余 ' + t + ' 元');
      var L = LEVELS[levelIdx];
      gid(K + '-expr').textContent = '(' + L.unit + ')×' + (L.mode === 'add' ? L.times : '(' + (-L.times) + ')');
    }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      records = []; guessed = -1;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-hint').textContent = L.hint;
      renderBook();
      msg('先猜，再按提示记账。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。记好账，点“对账”验证。');
        });
      })(g);
    }
    gid(K + '-add-btn').addEventListener('click', function () {
      records.push(LEVELS[levelIdx].unit);
      renderBook();
    });
    gid(K + '-remove-btn').addEventListener('click', function () {
      var L = LEVELS[levelIdx];
      var idx = records.indexOf(L.unit);
      if (idx < 0) { msg('账上没有欠 ' + (-L.unit) + ' 元的笔可划——先记上几笔。'); return; }
      records.splice(idx, 1);
      renderBook();
      msg('划掉一笔欠 ' + (-L.unit) + ' 元的账，合计多了 ' + (-L.unit) + ' 元。');
    });
    gid(K + '-clear-btn').addEventListener('click', function () { records = []; renderBook(); });
    gid(K + '-check').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜答案。'); return; }
      var L = LEVELS[levelIdx];
      var expect = L.unit * L.times * (L.mode === 'add' ? 1 : -1);
      if (total() !== expect) {
        msg('账上合计是 ' + total() + ' 元，还不是 ' + expect + ' 元：按提示再记一记 / 划一划。');
        return;
      }
      var ok = guessed === L.ans;
      msg('对上了：(' + L.unit + ')×' + (L.mode === 'add' ? L.times : '(' + (-L.times) + ')') + ' = ' + expect + '。' +
        (L.mode === 'remove' ? '划掉 3 笔欠款，每笔 +2 元，一共多了 6 元——负负得正，就是这么来的。' : '欠款记几次，就是负数乘几。') +
        (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍账本。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：(-2)×3 = -6', '提高：(-4)×3 = -12', '挑战：(-2)×(-3) = 6'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm73-fold',
  title: '对折翻倍法',
  sub: '一张纸对折，厚度 2 倍、4 倍、8 倍地涨：乘方是重复乘，不是重复加。对折 10 次，纸比你还高吗？',
  grade: 7,
  kind: '实验',
  points: ['7.3'],
  render: function (el) {
    var K = 'm73-fold';
    var LEVELS = [
      { label: '基础', folds: 3, q: '对折 3 次，有几层？', opts: ['8 层', '6 层', '3 层'], ans: 0 },
      { label: '提高', folds: 6, q: '对折 6 次，有几层？', opts: ['64 层', '12 层', '36 层'], ans: 0 },
      { label: '挑战', folds: 10, q: '对折 10 次，有几层？', opts: ['1024 层', '20 层', '100 层'], ans: 0 }
    ];
    var levelIdx = 0, folds = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 有理数的乘方</p>' +
      '<h3>对折翻倍法</h3>' +
      '<p>一张 0.1 毫米的纸，对折一次变 2 层，再对折变 4 层——每次都是“再乘一个 2”，不是“再加一个 2”。先猜层数，再拖滑杆对折。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 对折：<input type="range" id="' + K + '-slider" min="0" max="10" step="1" value="0" style="width:70%"> <b id="' + K + '-folds">0 次</b></p>' +
      '<p>层数：<b id="' + K + '-layers">1 层</b>　算式：<b id="' + K + '-expr">2 的 0 次方 = 1</b></p>' +
      '<p>厚度：<b id="' + K + '-thick">0.1 毫米</b>　如果只是“加”：<b id="' + K + '-add">0.1 毫米</b></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拖滑杆对折。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 对折 3 次</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 对折 6 次</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 对折 10 次</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都对折到目标次数，并且能说出“乘方是重复乘，不是重复加”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function pow2(n) { var r = 1; for (var i = 0; i < n; i++) r *= 2; return r; }
    function render() {
      var layers = pow2(folds);
      gid(K + '-folds').textContent = folds + ' 次';
      gid(K + '-layers').textContent = layers + ' 层';
      var mult = '2';
      for (var i = 1; i < folds; i++) mult += '×2';
      gid(K + '-expr').textContent = folds === 0 ? '2 的 0 次方 = 1' : '2 的 ' + folds + ' 次方 = ' + mult + ' = ' + layers;
      var mm = layers * 0.1;
      gid(K + '-thick').textContent = (mm >= 10 ? (mm / 10) + ' 厘米' : mm + ' 毫米');
      gid(K + '-add').textContent = '对折 ' + folds + ' 次只加 ' + folds + ' 层的话，才 ' + (folds + 1) + ' 层';
      var L = LEVELS[levelIdx];
      if (folds === L.folds && guessed >= 0) {
        var ok = guessed === L.ans;
        msg('对折 ' + folds + ' 次：' + layers + ' 层，厚 ' + (mm >= 10 ? (mm / 10) + ' 厘米' : mm + ' 毫米') + '。' +
          (folds === 10 ? '10 次就超过 10 厘米了——指数涨起来比加法快得多。' : '每次翻倍，不是每次加 2。') +
          (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍算式：2 连乘 ' + folds + ' 个。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      levelIdx = i; folds = 0; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-slider').value = '0';
      render();
      msg('先猜对折 ' + L.folds + ' 次有几层，再拖滑杆。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。拖滑杆对折到 ' + LEVELS[levelIdx].folds + ' 次验证。');
        });
      })(g);
    }
    gid(K + '-slider').addEventListener('input', function (e) {
      folds = parseInt(e.target.value, 10);
      if (guessed < 0) { msg('先猜一猜，再对折。'); return; }
      render();
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：对折 3 次 = 8 层', '提高：对折 6 次 = 64 层', '挑战：对折 10 次 = 1024 层'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm73-scinote',
  title: '小数点移动法',
  sub: '科学记数法就是小数点搬家：×10ⁿ 向右 n 位，×10⁻ⁿ 向左 n 位。拖动小数点，指数自动跟着走。',
  grade: 7,
  kind: '模拟',
  points: ['7.3'],
  render: function (el) {
    var K = 'm73-scinote';
    var LEVELS = [
      { label: '基础', digits: '38', trail: 3, q: '38000 写成科学记数法，10 的指数是几？', opts: ['4', '5', '3'], ans: 0 },
      { label: '提高', digits: '45', lead: 2, q: '0.0045 写成科学记数法，10 的指数是几？', opts: ['-3', '3', '-2'], ans: 0 },
      { label: '挑战', digits: '7', lead: 6, q: '0.0000007 写成科学记数法，10 的指数是几？', opts: ['-7', '7', '-6'], ans: 0 }
    ];
    var levelIdx = 0, pos = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 科学记数法</p>' +
      '<h3>小数点移动法</h3>' +
      '<p>一个数写成 a×10ⁿ，a 在 1 到 10 之间：小数点每搬一位，指数就变 1。点“◀ ▶”搬小数点，看指数怎么跟着走。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 搬小数点：<button class="btn small" id="' + K + '-left" type="button">◀ 向左搬</button> <button class="btn small" id="' + K + '-right" type="button">向右搬 ▶</button> <button class="btn small ghost" id="' + K + '-reset" type="button">回到原数</button></p>' +
      '<p>原数：<b id="' + K + '-orig"></b></p>' +
      '<p>现在：<b id="' + K + '-now"></b></p>' +
      '<p>科学记数法：<b id="' + K + '-sci"></b></p>' +
      '<p id="' + K + '-msg">先猜一猜指数，再搬小数点。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 38000</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 0.0045</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 0.0000007</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都搬到 a 在 1 到 10 之间，并且能说出“小数点搬一位，指数变 1”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function origText(L) {
      if (L.trail) {
        var s = L.digits;
        for (var i = 0; i < L.trail; i++) s += '0';
        return s;
      }
      var z = '';
      for (var j = 0; j < L.lead; j++) z += '0';
      return '0.' + z + L.digits;
    }
    function render() {
      var L = LEVELS[levelIdx];
      var exp = pos;
      var val = parseFloat(origText(L));
      var a = val / Math.pow(10, pos);
      var m = String(Math.round(a * 1000000) / 1000000);
      var shown;
      if (pos === 0) {
        shown = origText(L);
      } else if (pos > 0) {
        shown = m + ' × 10 的 ' + exp + ' 次方（小数点向左搬了 ' + pos + ' 位）';
      } else {
        shown = m + ' × 10 的 ' + exp + ' 次方（小数点向右搬了 ' + (-pos) + ' 位）';
      }
      gid(K + '-now').textContent = shown;
      if (a >= 1 && a < 10 && pos !== 0) {
        gid(K + '-sci').textContent = m + ' × 10 的 ' + exp + ' 次方';
        if (guessed >= 0) {
          var ok = guessed === L.ans;
          msg('搬到了：' + m + ' × 10 的 ' + exp + ' 次方。a = ' + m + ' 在 1 到 10 之间，指数是 ' + exp + '。' +
            (ok ? '你猜对了！' : '你刚才猜指数是 ' + L.opts[guessed] + '，数一数小数点搬了几位。'));
          if (tiers) tiers.done(levelIdx);
          if (typeof markTried === 'function') markTried(K);
        }
      } else {
        gid(K + '-sci').textContent = '还没搬到：a 要在 1 到 10 之间';
      }
    }
    function setLevel(i) {
      levelIdx = i; pos = 0; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-orig').textContent = origText(L);
      render();
      msg('先猜指数，再搬小数点，直到 a 在 1 到 10 之间。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜指数是 ' + LEVELS[levelIdx].opts[g] + '。搬小数点验证。');
        });
      })(g);
    }
    function move(d) {
      if (guessed < 0) { msg('先猜一猜指数，再搬小数点。'); return; }
      pos += d;
      if (pos > 8) pos = 8;
      if (pos < -8) pos = -8;
      render();
    }
    gid(K + '-left').addEventListener('click', function () { move(1); });
    gid(K + '-right').addEventListener('click', function () { move(-1); });
    gid(K + '-reset').addEventListener('click', function () { pos = 0; render(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：38000 = 3.8×10的4次方', '提高：0.0045 = 4.5×10的-3次方', '挑战：0.0000007 = 7×10的-7次方'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm74-tiles',
  title: '代数瓷砖法',
  sub: '多项式是一堆不同尺寸的砖：x² 是方块、x 是长条、1 是小方块；同尺寸才能数到一起，不同尺寸拼不到一块。',
  grade: 7,
  kind: '模拟',
  points: ['7.4'],
  render: function (el) {
    var K = 'm74-tiles';
    var LEVELS = [
      { label: '基础', expr: '2x + 3x', goal: '5x', q: '2x + 3x 是几？', opts: ['5x', '5x²', '6x'], ans: 0, hint: '放 2 条 x 长条，再放 3 条，数到一起。' },
      { label: '提高', expr: 'x² + 2x²', goal: '3x²', q: 'x² + 2x² 是几？', opts: ['3x²', '3x', '2x²'], ans: 0, hint: '放 1 块 x² 方块，再放 2 块，数到一起。' },
      { label: '挑战', expr: '3x² + 2x + x² + 4x', goal: '4x² + 6x', q: '3x² + 2x + x² + 4x 是几？', opts: ['4x² + 6x', '10x²', '7x² + 6x'], ans: 0, hint: '方块归方块、长条归长条：x² 有 4 块，x 有 6 条。' }
    ];
    var levelIdx = 0, c2 = 0, c1 = 0, c0 = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 整式</p>' +
      '<h3>代数瓷砖法</h3>' +
      '<p>一块大方块 = x²，一条长条 = x，一个小方块 = 1。尺寸就是类型：只有同尺寸的砖能数到一起，x² 和 x 拼不成一块——先猜，再摆砖数一数。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 摆砖：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small" id="' + K + '-add-x2" type="button">＋ x² 方块</button>' +
      '<button class="btn small" id="' + K + '-add-x" type="button">＋ x 长条</button>' +
      '<button class="btn small" id="' + K + '-add-1" type="button">＋ 1 小方块</button>' +
      '<button class="btn small ghost" id="' + K + '-clear" type="button">清空</button>' +
      '<button class="btn small primary" id="' + K + '-merge" type="button">数到一起</button></div>' +
      '<p>桌上：<b id="' + K + '-table"></b></p>' +
      '<p>算式：<b id="' + K + '-expr"></b>　提示：<span id="' + K + '-hint"></span></p>' +
      '<p>数到一起是：<b id="' + K + '-merged">？</b></p>' +
      '<p id="' + K + '-msg">先猜一猜，再摆砖。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 2x + 3x</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · x² + 2x²</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 3x² + 2x + x² + 4x</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都数对，并且能说出“只有同类项才能合并”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function term(n, s) {
      if (n === 0) return '';
      if (n === 1) return s;
      return n + s;
    }
    function mergedText() {
      var parts = [];
      if (c2) parts.push(term(c2, 'x²'));
      if (c1) parts.push(term(c1, 'x'));
      if (c0) parts.push(String(c0));
      return parts.length ? parts.join(' + ') : '0';
    }
    function renderTable() {
      gid(K + '-table').textContent = 'x² 方块 ' + c2 + ' 块，x 长条 ' + c1 + ' 条，1 小方块 ' + c0 + ' 个';
    }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      c2 = 0; c1 = 0; c0 = 0; guessed = -1;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-expr').textContent = L.expr;
      gid(K + '-hint').textContent = L.hint;
      gid(K + '-merged').textContent = '？';
      renderTable();
      msg('先猜 ' + L.expr + ' 是几，再摆砖。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。摆好砖，点“数到一起”验证。');
        });
      })(g);
    }
    gid(K + '-add-x2').addEventListener('click', function () { c2++; renderTable(); });
    gid(K + '-add-x').addEventListener('click', function () { c1++; renderTable(); });
    gid(K + '-add-1').addEventListener('click', function () { c0++; renderTable(); });
    gid(K + '-clear').addEventListener('click', function () { c2 = 0; c1 = 0; c0 = 0; renderTable(); gid(K + '-merged').textContent = '？'; });
    gid(K + '-merge').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜答案。'); return; }
      var L = LEVELS[levelIdx];
      var got = mergedText();
      gid(K + '-merged').textContent = got;
      if (got !== L.goal) {
        msg('桌上数到一起是 ' + got + '，还不是 ' + L.goal + '：' + L.hint);
        return;
      }
      var ok = guessed === L.ans;
      msg(L.expr + ' = ' + got + '：方块归方块、长条归长条，尺寸不一样的拼不到一起。' +
        (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍砖的尺寸。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：2x + 3x = 5x', '提高：x² + 2x² = 3x²', '挑战：3x² + 2x + x² + 4x = 4x² + 6x'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm74-parts',
  title: '拆零件法',
  sub: '单项式拆成数字 × 字母 × 字母：每个字母头顶标指数，系数与次数分开读。自己调系数和指数，拆一拆就明白。',
  grade: 7,
  kind: '演示',
  points: ['7.4'],
  render: function (el) {
    var K = 'm74-parts';
    var LEVELS = [
      { label: '基础', expr: '3x²', coef: 3, letters: [{ l: 'x', e: 2 }], q: '3x² 的系数和次数是？', opts: ['系数 3，次数 2', '系数 2，次数 3', '系数 3，次数 3'], ans: 0 },
      { label: '提高', expr: '-2a²b', coef: -2, letters: [{ l: 'a', e: 2 }, { l: 'b', e: 1 }], q: '-2a²b 的系数和次数是？', opts: ['系数 -2，次数 3', '系数 2，次数 2', '系数 -2，次数 2'], ans: 0 },
      { label: '挑战', expr: '7xy³', coef: 7, letters: [{ l: 'x', e: 1 }, { l: 'y', e: 3 }], q: '7xy³ 的系数和次数是？', opts: ['系数 7，次数 4', '系数 3，次数 4', '系数 7，次数 3'], ans: 0 }
    ];
    var levelIdx = 0, guessed = -1, opened = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 7 年级 · 整式</p>' +
      '<h3>拆零件法</h3>' +
      '<p>一个单项式就是几个零件乘在一起：前面的数字是系数，字母头顶的指数加起来是次数。先猜，再点“拆开”看零件。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 拆开：<button class="btn small primary" id="' + K + '-open-btn" type="button">拆开看零件</button>　单项式：<b id="' + K + '-expr"></b></p>' +
      '<p>拆开是：<b id="' + K + '-parts">？</b></p>' +
      '<p>系数：<b id="' + K + '-coef">？</b>　次数：<b id="' + K + '-deg">？</b></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拆开。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 3x²</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · -2a²b</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 7xy³</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都拆对，并且能说出“系数是前面的数，次数是指数之和”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      guessed = -1; opened = false;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-expr').textContent = L.expr;
      gid(K + '-parts').textContent = '？';
      gid(K + '-coef').textContent = '？';
      gid(K + '-deg').textContent = '？';
      msg('先猜 ' + L.expr + ' 的系数和次数，再拆开。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。点“拆开看零件”验证。');
        });
      })(g);
    }
    gid(K + '-open-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再拆开。'); return; }
      var L = LEVELS[levelIdx];
      var parts = [String(L.coef)];
      var deg = 0;
      for (var i = 0; i < L.letters.length; i++) {
        var lt = L.letters[i];
        for (var e = 0; e < lt.e; e++) parts.push(lt.l);
        deg += lt.e;
      }
      opened = true;
      gid(K + '-parts').textContent = parts.join(' × ');
      gid(K + '-coef').textContent = String(L.coef);
      gid(K + '-deg').textContent = String(deg);
      var ok = guessed === L.ans;
      msg(L.expr + ' = ' + parts.join(' × ') + '：系数是前面的数 ' + L.coef + '，次数是所有指数加起来，' +
        L.letters.map(function (lt) { return lt.e; }).join(' + ') + ' = ' + deg + '。' +
        (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再数一遍字母头顶的指数。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3x² 系数 3 次数 2', '提高：-2a²b 系数 -2 次数 3', '挑战：7xy³ 系数 7 次数 4'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm74-area',
  title: '面积模型法',
  sub: 'x² 是边长为 x 的正方形，2x 是两条 x 长条：次数就是维度。拖一拖 x，看 x² 和 2x 哪个长得快。',
  grade: 7,
  kind: '模拟',
  points: ['7.4'],
  render: function (el) {
    var K = 'm74-area';
    var LEVELS = [
      { label: '基础', x: 2, q: 'x = 2 时，x² 和 2x 谁大？', opts: ['一样大', 'x² 大', '2x 大'], ans: 0 },
      { label: '提高', x: 5, q: 'x = 5 时，x² 和 2x 谁大？', opts: ['x² 大', '2x 大', '一样大'], ans: 0 },
      { label: '挑战', x: 3, q: 'x = 3 时，x² 比 2x 大几？', opts: ['大 3', '大 9', '大 6'], ans: 0 }
    ];
    var levelIdx = 0, x = 2, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 整式</p>' +
      '<h3>面积模型法</h3>' +
      '<p>正方形的边长是 x，面积就是 x²（一共 x×x 个小方格）；两条 x 长条拼起来是 2x。拖滑杆改 x，看两个图形谁长得快。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 拖一拖 x：<input type="range" id="' + K + '-slider" min="1" max="6" step="1" value="2" style="width:70%"> <b id="' + K + '-x">x = 2</b></p>' +
      '<p>x² 正方形（<span id="' + K + '-sq-n">2</span>×<span id="' + K + '-sq-n2">2</span> 个小方格）：</p>' +
      '<p id="' + K + '-sq"></p>' +
      '<p>2x 长条（2 行，每行 x 格）：</p>' +
      '<p id="' + K + '-bars"></p>' +
      '<p>x² = <b id="' + K + '-v2">4</b>　2x = <b id="' + K + '-v1">4</b></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拖滑杆。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · x = 2</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · x = 5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · x = 3</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都比对，并且能说出“x² 是面积，2x 是长度的两倍”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function render() {
      gid(K + '-x').textContent = 'x = ' + x;
      gid(K + '-sq-n').textContent = String(x);
      gid(K + '-sq-n2').textContent = String(x);
      var sq = '';
      for (var r = 0; r < x; r++) {
        for (var c = 0; c < x; c++) sq += '■';
        sq += ' ';
      }
      gid(K + '-sq').textContent = sq;
      var bars = '';
      for (var b = 0; b < 2; b++) {
        for (var i = 0; i < x; i++) bars += '▬';
        bars += ' ';
      }
      gid(K + '-bars').textContent = bars;
      gid(K + '-v2').textContent = String(x * x);
      gid(K + '-v1').textContent = String(2 * x);
      var L = LEVELS[levelIdx];
      if (x === L.x && guessed >= 0) {
        var ok = guessed === L.ans;
        var cmp = x * x > 2 * x ? 'x² 大' : (x * x < 2 * x ? '2x 大' : '一样大');
        msg('x = ' + x + ' 时，x² = ' + (x * x) + '，2x = ' + (2 * x) + '，' + cmp + '。' +
          (levelIdx === 2 ? '9 比 6 大 3。' : '') +
          (levelIdx === 0 ? 'x = 2 时正好相等：4 = 4。' : '') +
          (levelIdx === 1 ? 'x 变大以后，面积比长度长得快得多。' : '') +
          (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，数一数小方格。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      levelIdx = i; x = LEVELS[i].x; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-slider').value = String(x);
      render();
      msg('先猜，再把滑杆拖到 x = ' + L.x + '。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。拖滑杆到 x = ' + LEVELS[levelIdx].x + ' 验证。');
        });
      })(g);
    }
    gid(K + '-slider').addEventListener('input', function (e) {
      x = parseInt(e.target.value, 10);
      if (guessed < 0) { msg('先猜一猜，再拖滑杆。'); return; }
      render();
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：x = 2 时 x² = 2x', '提高：x = 5 时 x² 大', '挑战：x = 3 时 x² 比 2x 大 3'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm75-merge',
  title: '同类瓷砖合并法',
  sub: '苹果归苹果筐、梨归梨筐：只有同尺寸的砖能数到一起，3a + 2b 拼不成 5ab——试试就知道了。',
  grade: 7,
  kind: '实验',
  points: ['7.5'],
  render: function (el) {
    var K = 'm75-merge';
    var LEVELS = [
      { label: '基础', expr: '3a + 2a', goal: '5a', q: '3a + 2a 是几？', opts: ['5a', '5a²', '6a'], ans: 0, hint: '放 3 块 a 砖，再放 2 块 a 砖，数到一起。' },
      { label: '提高', expr: '5b - 2b', goal: '3b', q: '5b - 2b 是几？', opts: ['3b', '7b', '3b²'], ans: 0, hint: '放 5 块 b 砖，拿走 2 块。' },
      { label: '挑战', expr: '3a + 2b + 4a - b', goal: '7a + b', q: '3a + 2b + 4a - b 是几？', opts: ['7a + b', '8ab', '7a + 2b'], ans: 0, hint: 'a 归 a、b 归 b：a 有 3 + 4 = 7 块，b 剩 2 - 1 = 1 块。' }
    ];
    var levelIdx = 0, ca = 0, cb = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 整式的加减</p>' +
      '<h3>同类瓷砖合并法</h3>' +
      '<p>a 砖是绿长条，b 砖是蓝长条。同类才能合并：3a + 2b 不是 5ab——a 和 b 尺寸不一样，拼不到一起。先猜，再摆砖。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 摆砖：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small" id="' + K + '-add-a" type="button">＋ a 砖</button>' +
      '<button class="btn small" id="' + K + '-add-b" type="button">＋ b 砖</button>' +
      '<button class="btn small" id="' + K + '-take-a" type="button">拿走 a 砖</button>' +
      '<button class="btn small" id="' + K + '-take-b" type="button">拿走 b 砖</button>' +
      '<button class="btn small ghost" id="' + K + '-clear" type="button">清空</button>' +
      '<button class="btn small primary" id="' + K + '-merge" type="button">合并同类</button></div>' +
      '<p>桌上：<b id="' + K + '-table"></b></p>' +
      '<p>算式：<b id="' + K + '-expr"></b>　提示：<span id="' + K + '-hint"></span></p>' +
      '<p>合并后是：<b id="' + K + '-merged">？</b></p>' +
      '<p id="' + K + '-msg">先猜一猜，再摆砖。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 3a + 2a</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 5b - 2b</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 3a + 2b + 4a - b</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都合并对，并且能说出“只有同类项才能合并，3a + 2b 不是 5ab”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function mergedText() {
      var parts = [];
      if (ca) parts.push(ca === 1 ? 'a' : ca + 'a');
      if (cb) parts.push(cb === 1 ? 'b' : cb + 'b');
      return parts.length ? parts.join(' + ') : '0';
    }
    function renderTable() {
      gid(K + '-table').textContent = 'a 砖 ' + ca + ' 块，b 砖 ' + cb + ' 块';
    }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      ca = 0; cb = 0; guessed = -1;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-expr').textContent = L.expr;
      gid(K + '-hint').textContent = L.hint;
      gid(K + '-merged').textContent = '？';
      renderTable();
      msg('先猜 ' + L.expr + ' 是几，再摆砖。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。摆好砖，点“合并同类”验证。');
        });
      })(g);
    }
    gid(K + '-add-a').addEventListener('click', function () { ca++; renderTable(); });
    gid(K + '-add-b').addEventListener('click', function () { cb++; renderTable(); });
    gid(K + '-take-a').addEventListener('click', function () { if (ca > 0) ca--; renderTable(); });
    gid(K + '-take-b').addEventListener('click', function () { if (cb > 0) cb--; renderTable(); });
    gid(K + '-clear').addEventListener('click', function () { ca = 0; cb = 0; renderTable(); gid(K + '-merged').textContent = '？'; });
    gid(K + '-merge').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜答案。'); return; }
      var L = LEVELS[levelIdx];
      var got = mergedText();
      gid(K + '-merged').textContent = got;
      if (got !== L.goal) {
        msg('桌上合并后是 ' + got + '，还不是 ' + L.goal + '：' + L.hint);
        return;
      }
      var ok = guessed === L.ans;
      msg(L.expr + ' = ' + got + '：a 归 a、b 归 b。' +
        (levelIdx === 2 ? '3a + 2b 永远拼不成 5ab——a 砖和 b 砖尺寸不一样。' : '同类项才能合并。') +
        (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再数一遍砖。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3a + 2a = 5a', '提高：5b - 2b = 3b', '挑战：3a + 2b + 4a - b = 7a + b'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm75-bracket',
  title: '去括号翻面法',
  sub: '括号前是减号，括号里每一项过减号这道门都要翻个面；括号前是加号，照抄。点“过门”，看砖一块一块翻面。',
  grade: 7,
  kind: '模拟',
  points: ['7.5'],
  render: function (el) {
    var K = 'm75-bracket';
    var LEVELS = [
      { label: '基础', sign: '+', terms: [{ t: '2x', s: 1 }, { t: '3', s: -1 }], q: '+(2x - 3) 去括号是？', opts: ['2x - 3', '-2x + 3', '2x + 3'], ans: 0 },
      { label: '提高', sign: '-', terms: [{ t: '2x', s: 1 }, { t: '3', s: -1 }], q: '-(2x - 3) 去括号是？', opts: ['-2x + 3', '2x - 3', '-2x - 3'], ans: 0 },
      { label: '挑战', sign: '-', terms: [{ t: '3a', s: 1 }, { t: '2b', s: -1 }, { t: '1', s: 1 }], q: '-(3a - 2b + 1) 去括号是？', opts: ['-3a + 2b - 1', '3a - 2b + 1', '-3a - 2b - 1'], ans: 0 }
    ];
    var levelIdx = 0, guessed = -1, passed = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 整式的加减</p>' +
      '<h3>去括号翻面法</h3>' +
      '<p>括号是一道门：门前是加号，砖照原样走过去；门前是减号，每块砖过门都要翻个面（正变负、负变正）。先猜，再点“过门”。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 过门：<button class="btn small primary" id="' + K + '-pass-btn" type="button">过门（去括号）</button>　<button class="btn small ghost" id="' + K + '-back-btn" type="button">回到门前</button></p>' +
      '<p>门前：<b id="' + K + '-before"></b></p>' +
      '<p>过门后：<b id="' + K + '-after">？</b></p>' +
      '<p id="' + K + '-msg">先猜一猜，再过门。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · +(2x - 3)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · -(2x - 3)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · -(3a - 2b + 1)</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都过对门，并且能说出“减号门后每一项都要变号”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function beforeText(L) {
      var s = L.sign + '(';
      for (var i = 0; i < L.terms.length; i++) {
        var tm = L.terms[i];
        if (i > 0) s += tm.s > 0 ? ' + ' : ' - ';
        else if (tm.s < 0) s += '-';
        s += tm.t;
      }
      return s + ')';
    }
    function afterText(L) {
      var flip = L.sign === '-';
      var out = '';
      for (var i = 0; i < L.terms.length; i++) {
        var tm = L.terms[i];
        var s = flip ? -tm.s : tm.s;
        if (i === 0) out += (s < 0 ? '-' : '') + tm.t;
        else out += (s > 0 ? ' + ' : ' - ') + tm.t;
      }
      return out;
    }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      guessed = -1; passed = false;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-before').textContent = beforeText(L);
      gid(K + '-after').textContent = '？';
      msg('先猜去括号的结果，再点“过门”。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。点“过门”验证。');
        });
      })(g);
    }
    gid(K + '-pass-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再过门。'); return; }
      var L = LEVELS[levelIdx];
      passed = true;
      var after = afterText(L);
      gid(K + '-after').textContent = after;
      var ok = guessed === L.ans;
      msg(beforeText(L) + ' → ' + after + '：' +
        (L.sign === '-' ? '减号门：括号里每一项都翻面，+ 变 -、- 变 +。' : '加号门：照抄，一个都不用翻。') +
        (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，注意门前是' + (L.sign === '-' ? '减号' : '加号') + '。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-back-btn').addEventListener('click', function () {
      passed = false;
      gid(K + '-after').textContent = '？';
      msg('回到门前了。再猜一次，重新过门。');
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：+(2x - 3) = 2x - 3', '提高：-(2x - 3) = -2x + 3', '挑战：-(3a - 2b + 1) = -3a + 2b - 1'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm75-distrib',
  title: '分配律面积法',
  sub: '2(3x - 1) 是 2 行 3x - 1 的矩形：去括号就是把矩形拆成 6x - 2 两块砖。拖一拖行数，拆一拆就明白。',
  grade: 7,
  kind: '模拟',
  points: ['7.5'],
  render: function (el) {
    var K = 'm75-distrib';
    var LEVELS = [
      { label: '基础', k: 2, a: 3, b: -1, q: '2(3x - 1) 拆开是？', opts: ['6x - 2', '6x + 2', '5x - 1'], ans: 0 },
      { label: '提高', k: 3, a: 2, b: 4, q: '3(2x + 4) 拆开是？', opts: ['6x + 12', '6x + 4', '5x + 12'], ans: 0 },
      { label: '挑战', k: -2, a: 1, b: -3, q: '-2(x - 3) 拆开是？', opts: ['-2x + 6', '-2x - 6', '2x + 6'], ans: 0 }
    ];
    var levelIdx = 0, guessed = -1, split = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 整式的加减</p>' +
      '<h3>分配律面积法</h3>' +
      '<p>k(ax + b) 是一块 k 行、每行 ax + b 的矩形：拆开就是 k 乘进括号，每一项都乘一遍。先猜，再点“拆开”。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 拆开：<button class="btn small primary" id="' + K + '-split-btn" type="button">拆开矩形</button>　<button class="btn small ghost" id="' + K + '-back-btn" type="button">拼回去</button></p>' +
      '<p>矩形：<b id="' + K + '-rect"></b></p>' +
      '<p id="' + K + '-rows"></p>' +
      '<p>拆开是：<b id="' + K + '-after">？</b></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拆开。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 2(3x - 1)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 3(2x + 4)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · -2(x - 3)</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都拆对，并且能说出“括号外的数要乘进括号的每一项”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function fmtTerm(n, v) {
      if (n === 0) return '0';
      var s = (n === 1 ? '' : (n === -1 ? '-' : String(n))) + v;
      return s;
    }
    function exprText(L) {
      var inner = fmtTerm(L.a, 'x') + (L.b >= 0 ? ' + ' + L.b : ' - ' + (-L.b));
      return (L.k < 0 ? '(' + L.k + ')' : String(L.k)) + '(' + inner + ')';
    }
    function afterText(L) {
      var p1 = L.k * L.a, p2 = L.k * L.b;
      var s1 = fmtTerm(p1, 'x');
      var s2 = (p2 >= 0 ? ' + ' + p2 : ' - ' + (-p2));
      return s1 + s2;
    }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      guessed = -1; split = false;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-rect').textContent = exprText(L) + '：' + Math.abs(L.k) + ' 行，每行 ' + fmtTerm(L.a, 'x') + (L.b >= 0 ? ' + ' + L.b : ' - ' + (-L.b));
      var rows = '';
      for (var r = 0; r < Math.abs(L.k); r++) {
        rows += '第 ' + (r + 1) + ' 行：' + fmtTerm(L.a, 'x') + (L.b >= 0 ? ' + ' + L.b : ' - ' + (-L.b)) + '　';
      }
      gid(K + '-rows').textContent = rows;
      gid(K + '-after').textContent = '？';
      msg('先猜拆开的结果，再点“拆开矩形”。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。点“拆开矩形”验证。');
        });
      })(g);
    }
    gid(K + '-split-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再拆开。'); return; }
      var L = LEVELS[levelIdx];
      split = true;
      var after = afterText(L);
      gid(K + '-after').textContent = after;
      var ok = guessed === L.ans;
      msg(exprText(L) + ' = ' + after + '：' + Math.abs(L.k) + ' 行，每行都乘 ' + L.k + '——' +
        L.k + '×' + L.a + 'x = ' + (L.k * L.a) + 'x，' + L.k + '×(' + L.b + ') = ' + (L.k * L.b) + '。' +
        (L.k < 0 ? '负数乘进来，每一项都翻面。' : '') +
        (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，记住每一项都要乘。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-back-btn').addEventListener('click', function () {
      split = false;
      gid(K + '-after').textContent = '？';
      msg('拼回去了。再猜一次，重新拆。');
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：2(3x - 1) = 6x - 2', '提高：3(2x + 4) = 6x + 12', '挑战：-2(x - 3) = -2x + 6'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm76-balance',
  title: '天平平衡法',
  sub: '方程就是天平：两边同时加减乘除，天平还平着；想只动一边，天平立刻倾斜、操作被拦下。自己动手解方程。',
  grade: 7,
  kind: '实验',
  points: ['7.6'],
  render: function (el) {
    var K = 'm76-balance';
    var LEVELS = [
      { label: '基础', a: 1, b: 5, c: 12, q: 'x + 5 = 12，x 是几？先猜。', opts: ['7', '17', '5'], ans: 0 },
      { label: '提高', a: 2, b: 3, c: 11, q: '2x + 3 = 11，x 是几？先猜。', opts: ['4', '7', '5'], ans: 0 },
      { label: '挑战', a: 3, b: -4, c: 11, q: '3x - 4 = 11，x 是几？先猜。', opts: ['5', '3', '7'], ans: 0 }
    ];
    var levelIdx = 0, a = 1, b = 5, c = 12, guessed = -1, tiers = null, tilt = 0;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 解一元一次方程</p>' +
      '<h3>天平平衡法</h3>' +
      '<p>等号就是天平：左盘是方程左边，右盘是右边。只有两边做同样的事，天平才保持平衡。想只动一边？天平会倾斜，操作不算数。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 两边同做：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small" id="' + K + '-op-sub" type="button">两边同减</button>' +
      '<button class="btn small" id="' + K + '-op-add" type="button">两边同加</button>' +
      '<button class="btn small" id="' + K + '-op-div" type="button">两边同除</button>' +
      '<button class="btn small" id="' + K + '-op-one" type="button">只动左边（试试）</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<p>天平：<b id="' + K + '-beam">平衡</b></p>' +
      '<p>左盘：<b id="' + K + '-left"></b>　右盘：<b id="' + K + '-right"></b></p>' +
      '<p>现在方程是：<b id="' + K + '-eq"></b></p>' +
      '<p id="' + K + '-msg">先猜 x 是几，再两边同做、一步步解。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · x + 5 = 12</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 2x + 3 = 11</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 3x - 4 = 11</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都解出 x，并且能说出“等式两边要做同样的事”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function fmtCoef(n, v) {
      if (n === 0) return '';
      if (n === 1) return v;
      if (n === -1) return '-' + v;
      return n + v;
    }
    function leftText() {
      var s = fmtCoef(a, 'x');
      if (b > 0) s += ' + ' + b;
      if (b < 0) s += ' - ' + (-b);
      return s || '0';
    }
    function render() {
      gid(K + '-beam').textContent = tilt === 0 ? '平衡' : (tilt > 0 ? '向左倾斜了！' : '向右倾斜了！');
      gid(K + '-left').textContent = leftText();
      gid(K + '-right').textContent = String(c);
      gid(K + '-eq').textContent = leftText() + ' = ' + c;
      if (a === 1 && b === 0 && guessed >= 0) {
        var L = LEVELS[levelIdx];
        var ok = guessed === L.ans;
        msg('解出来了：x = ' + c + '。代回去验算：' +
          (L.a === 1 ? '' : L.a + '×' + c) +
          (L.b > 0 ? (L.a === 1 ? c + ' + ' + L.b : ' + ' + L.b) : (L.a === 1 ? c + ' - ' + (-L.b) : ' - ' + (-L.b))) +
          ' = ' + L.c + '，等式成立。' + (ok ? '你猜对了！' : '你刚才猜 x 是 ' + L.opts[guessed] + '，再走一遍天平。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      a = L.a; b = L.b; c = L.c; guessed = -1; tilt = 0;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      render();
      msg('先猜 x 是几，再用“两边同做”解方程。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 x = ' + LEVELS[levelIdx].opts[g] + '。动手解方程验证。');
        });
      })(g);
    }
    function needGuess() {
      if (guessed < 0) { msg('先猜一猜 x 是几。'); return true; }
      return false;
    }
    gid(K + '-op-sub').addEventListener('click', function () {
      if (needGuess()) return;
      if (b === 0) { msg('常数项已经是 0 了，不用再减——下一步该除以系数。'); return; }
      c -= b; b = 0; tilt = 0;
      msg('两边同时减 ' + (LEVELS[levelIdx].b > 0 ? LEVELS[levelIdx].b : -LEVELS[levelIdx].b) + '：天平还平着，方程变成 ' + leftText() + ' = ' + c + '。');
      render();
    });
    gid(K + '-op-add').addEventListener('click', function () {
      if (needGuess()) return;
      if (b === 0) { msg('常数项已经是 0 了，不用再加——下一步该除以系数。'); return; }
      c += -b; b = 0; tilt = 0;
      msg('两边同时加 ' + (-LEVELS[levelIdx].b) + '：天平还平着，方程变成 ' + leftText() + ' = ' + c + '。');
      render();
    });
    gid(K + '-op-div').addEventListener('click', function () {
      if (needGuess()) return;
      if (b !== 0) { msg('先把常数项消掉（两边同加 / 同减），再除以系数。'); return; }
      if (a === 1) { msg('x 的系数已经是 1，解出来了。'); return; }
      if (c % a !== 0) { msg('c 除以 a 不是整数——先检查前面的步骤。'); return; }
      c = c / a; a = 1; tilt = 0;
      msg('两边同时除以 ' + LEVELS[levelIdx].a + '：天平还平着，x = ' + c + '。');
      render();
    });
    gid(K + '-op-one').addEventListener('click', function () {
      if (needGuess()) return;
      tilt = 1;
      gid(K + '-beam').textContent = '向左倾斜了！';
      msg('只动一边？天平倾斜了，等式不再成立——这一步不算数。方程只能两边同做。');
    });
    gid(K + '-reset').addEventListener('click', function () { setLevel(levelIdx); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：x + 5 = 12 → x = 7', '提高：2x + 3 = 11 → x = 4', '挑战：3x - 4 = 11 → x = 5'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm76-inverse',
  title: '逆运算倒推法',
  sub: '把 x 一层层剥出来：每一步都是逆运算——加的减回去，乘的除回去。剥一层，方程就简单一层。',
  grade: 7,
  kind: '演示',
  points: ['7.6'],
  render: function (el) {
    var K = 'm76-inverse';
    var LEVELS = [
      { label: '基础', steps: ['3x = 15', 'x = 5'], ops: ['两边同除以 3'], q: '3x = 15，x 是几？', opts: ['5', '45', '12'], ans: 0 },
      { label: '提高', steps: ['x ÷ 2 + 1 = 5', 'x ÷ 2 = 4', 'x = 8'], ops: ['两边同减 1', '两边同乘 2'], q: 'x ÷ 2 + 1 = 5，x 是几？', opts: ['8', '4', '10'], ans: 0 },
      { label: '挑战', steps: ['2(x - 3) = 10', 'x - 3 = 5', 'x = 8'], ops: ['两边同除以 2', '两边同加 3'], q: '2(x - 3) = 10，x 是几？', opts: ['8', '5', '2'], ans: 0 }
    ];
    var levelIdx = 0, stepIdx = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 7 年级 · 解一元一次方程</p>' +
      '<h3>逆运算倒推法</h3>' +
      '<p>方程是给 x 穿上的衣服：一层一层剥，每一步用逆运算——加 1 就减 1，乘 2 就除 2。剥到只剩 x，就解出来了。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 剥一层：<button class="btn small primary" id="' + K + '-peel-btn" type="button">剥一层</button>　<button class="btn small ghost" id="' + K + '-back-btn" type="button">穿回去</button></p>' +
      '<p>现在：<b id="' + K + '-now"></b></p>' +
      '<p>剥过的层：<b id="' + K + '-done">（还没剥）</b></p>' +
      '<p id="' + K + '-msg">先猜 x 是几，再一层一层剥。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 3x = 15</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · x ÷ 2 + 1 = 5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 2(x - 3) = 10</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都剥到 x，并且能说出“每一步都是逆运算”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function setLevel(i) {
      levelIdx = i; stepIdx = 0; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-now').textContent = L.steps[0];
      gid(K + '-done').textContent = '（还没剥）';
      msg('先猜 x 是几，再点“剥一层”。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 x = ' + LEVELS[levelIdx].opts[g] + '。剥一层验证。');
        });
      })(g);
    }
    gid(K + '-peel-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜 x 是几。'); return; }
      var L = LEVELS[levelIdx];
      if (stepIdx >= L.ops.length) { msg('已经剥到只剩 x 了。'); return; }
      var op = L.ops[stepIdx];
      stepIdx++;
      gid(K + '-now').textContent = L.steps[stepIdx];
      var doneList = [];
      for (var i = 0; i < stepIdx; i++) doneList.push(L.ops[i]);
      gid(K + '-done').textContent = doneList.join(' → ');
      if (stepIdx >= L.ops.length) {
        var ok = guessed === L.ans;
        msg('剥完了：' + L.steps[stepIdx] + '。把 x 代回去验算，等式成立。' +
          (ok ? '你猜对了！' : '你刚才猜 x 是 ' + L.opts[guessed] + '，再剥一遍看看。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('剥了一层（' + op + '）：现在是 ' + L.steps[stepIdx] + '，继续剥。');
      }
    });
    gid(K + '-back-btn').addEventListener('click', function () { setLevel(levelIdx); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3x = 15 → x = 5', '提高：x ÷ 2 + 1 = 5 → x = 8', '挑战：2(x - 3) = 10 → x = 8'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm76-boxes',
  title: '方块消元法',
  sub: '用 X 盒与单位块摆出方程：两边同时拿掉同样的块，直到只剩一个 X——X 盒旁边剩几个单位块，x 就是几。',
  grade: 7,
  kind: '模拟',
  points: ['7.6'],
  render: function (el) {
    var K = 'm76-boxes';
    var LEVELS = [
      { label: '基础', Lx: 1, Lu: 2, Rx: 0, Ru: 5, q: 'x + 2 = 5，x 是几？', opts: ['3', '7', '2'], ans: 0, hint: '两边各拿掉 2 个单位块。' },
      { label: '提高', Lx: 2, Lu: 1, Rx: 0, Ru: 7, q: '2x + 1 = 7，x 是几？', opts: ['3', '6', '4'], ans: 0, hint: '先两边各拿掉 1 个单位块，再把 X 盒和单位块对半分。' },
      { label: '挑战', Lx: 3, Lu: 2, Rx: 2, Ru: 6, q: '3x + 2 = 2x + 6，x 是几？', opts: ['4', '2', '8'], ans: 0, hint: '先两边各拿掉 2 个 X 盒，再两边各拿掉 2 个单位块。' }
    ];
    var levelIdx = 0, Lx = 1, Lu = 2, Rx = 0, Ru = 5, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 解一元一次方程</p>' +
      '<h3>方块消元法</h3>' +
      '<p>一个 X 盒 = x，一个小方块 = 1。方程就是左右两堆东西一样重：两边同时拿掉同样的块，等式还成立；拿到只剩一个 X 盒，x 就出来了。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 拿块：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small" id="' + K + '-take-unit" type="button">两边各拿掉 1 个单位块</button>' +
      '<button class="btn small" id="' + K + '-take-x" type="button">两边各拿掉 1 个 X 盒</button>' +
      '<button class="btn small" id="' + K + '-halve" type="button">两边对半分</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重摆</button></div>' +
      '<p>左边：<b id="' + K + '-left"></b></p>' +
      '<p>右边：<b id="' + K + '-right"></b></p>' +
      '<p>提示：<span id="' + K + '-hint"></span></p>' +
      '<p id="' + K + '-msg">先猜 x 是几，再拿块。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · x + 2 = 5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 2x + 1 = 7</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 3x + 2 = 2x + 6</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都拿到只剩一个 X 盒，并且能说出“两边同时拿掉同样的块”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function sideText(nx, nu) {
      var parts = [];
      if (nx) parts.push(nx + ' 个 X 盒');
      if (nu) parts.push(nu + ' 个单位块');
      return parts.length ? parts.join(' + ') : '空';
    }
    function render() {
      gid(K + '-left').textContent = sideText(Lx, Lu);
      gid(K + '-right').textContent = sideText(Rx, Ru);
      if (Lx === 1 && Lu === 0 && Rx === 0 && guessed >= 0) {
        var L = LEVELS[levelIdx];
        var ok = guessed === L.ans;
        msg('只剩一个 X 盒，右边是 ' + Ru + ' 个单位块：x = ' + Ru + '。' +
          (ok ? '你猜对了！' : '你刚才猜 x 是 ' + L.opts[guessed] + '，再摆一遍看看。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      Lx = L.Lx; Lu = L.Lu; Rx = L.Rx; Ru = L.Ru; guessed = -1;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-hint').textContent = L.hint;
      render();
      msg('先猜 x 是几，再拿块。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 x = ' + LEVELS[levelIdx].opts[g] + '。拿块验证。');
        });
      })(g);
    }
    function needGuess() {
      if (guessed < 0) { msg('先猜一猜 x 是几。'); return true; }
      return false;
    }
    gid(K + '-take-unit').addEventListener('click', function () {
      if (needGuess()) return;
      if (Lu <= 0 || Ru <= 0) { msg('有一边没有单位块可拿了。'); return; }
      Lu--; Ru--;
      msg('两边各拿掉 1 个单位块。');
      render();
    });
    gid(K + '-take-x').addEventListener('click', function () {
      if (needGuess()) return;
      if (Lx <= 0 || Rx <= 0) { msg('有一边没有 X 盒可拿了。'); return; }
      Lx--; Rx--;
      msg('两边各拿掉 1 个 X 盒。');
      render();
    });
    gid(K + '-halve').addEventListener('click', function () {
      if (needGuess()) return;
      if (Lx !== 2 || Lu !== 0 || Rx !== 0) { msg('现在不能对半分：要等到左边只剩 2 个 X 盒、右边是偶数个单位块。'); return; }
      if (Ru % 2 !== 0) { msg('右边的单位块是奇数个，对半分不开。'); return; }
      Lx = 1; Ru = Ru / 2;
      msg('两边对半分：2 个 X 盒变 1 个，' + (Ru * 2) + ' 个单位块变 ' + Ru + ' 个。');
      render();
    });
    gid(K + '-reset').addEventListener('click', function () { setLevel(levelIdx); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：x + 2 = 5 → x = 3', '提高：2x + 1 = 7 → x = 3', '挑战：3x + 2 = 2x + 6 → x = 4'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm77-puzzle',
  title: '等量关系拼图/线段图法',
  sub: '把题目里的数量一块块拼成等式：行程问题画线段图，两人走的路程加起来就是全程。拼不对，等式就不成立。',
  grade: 7,
  kind: '实验',
  points: ['7.7'],
  render: function (el) {
    var K = 'm77-puzzle';
    var LEVELS = [
      { label: '基础', story: '3 支同样的笔一共 12 元，1 支笔几元？', cards: ['3 支笔的钱', '12 元'], slots: ['3x', '12'], eq: '3x = 12', x: 4, q: '1 支笔几元？先猜。', opts: ['4 元', '9 元', '36 元'], ans: 0, hint: '把“3 支笔的钱”拼到等号左边，“12 元”拼到右边。' },
      { label: '提高', story: '甲、乙两人从相距 300 千米的两地相向而行，甲每小时 60 千米，乙每小时 40 千米，几小时相遇？', cards: ['甲走的路程', '乙走的路程', '全程 300 千米'], slots: ['60t', '40t', '300'], eq: '60t + 40t = 300', x: 3, q: '几小时相遇？先猜。', opts: ['3 小时', '5 小时', '7 小时'], ans: 0, hint: '甲走的 + 乙走的 = 全程：60t + 40t = 300。' },
      { label: '挑战', story: '一件衣服打 8 折卖 160 元，原价几元？', cards: ['原价的 8 折', '160 元'], slots: ['0.8x', '160'], eq: '0.8x = 160', x: 200, q: '原价几元？先猜。', opts: ['200 元', '128 元', '180 元'], ans: 0, hint: '打 8 折就是原价的 0.8：0.8x = 160。' }
    ];
    var levelIdx = 0, filled = [], guessed = -1, t = 0, tiers = null, solved = false;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 实际问题与一元一次方程</p>' +
      '<h3>等量关系拼图/线段图法</h3>' +
      '<p>应用题先别急着算：把题目里的数量卡片拼成等式，拼对了再解。点一张卡片，它就落进下一个空位；拼错了，等式不成立。</p>' +
      '<p>题目：<b id="' + K + '-story"></b></p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 拼等式：点卡片，拼进空位。</p>' +
      '<div class="btn-row" id="' + K + '-cards"></div>' +
      '<p>拼出来的等式：<b id="' + K + '-eq">（空）</b>　<button class="btn small ghost" id="' + K + '-clear" type="button">重新拼</button></p>' +
      '<p>第 3 步 · 解一解：<button class="btn small" id="' + K + '-minus" type="button">−</button> <b id="' + K + '-t">0</b> <button class="btn small" id="' + K + '-plus" type="button">＋</button> <button class="btn small primary" id="' + K + '-solve" type="button">代进去验算</button></p>' +
      '<p>提示：<span id="' + K + '-hint"></span></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拼等式。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 买笔</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 相向而行</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 打折</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都拼对等式、解出答案，并且能说出“先找等量关系，再列方程”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function buildCards() {
      var box = gid(K + '-cards');
      while (box.firstChild) box.removeChild(box.firstChild);
      var L = LEVELS[levelIdx];
      for (var i = 0; i < L.cards.length; i++) {
        (function (i) {
          var b = document.createElement('button');
          b.type = 'button'; b.className = 'btn small'; b.textContent = L.cards[i];
          b.addEventListener('click', function () { onCard(i); });
          box.appendChild(b);
        })(i);
      }
    }
    function eqText() {
      var L = LEVELS[levelIdx];
      if (filled.length === 0) return '（空）';
      if (filled.length === 2) return filled[0] + ' = ' + filled[1];
      if (filled.length === 3) return filled[0] + ' + ' + filled[1] + ' = ' + filled[2];
      return filled.join(' + ');
    }
    function onCard(i) {
      var L = LEVELS[levelIdx];
      if (filled.length >= L.slots.length) { msg('空位拼满了：点“代进去验算”解方程，或点“重新拼”。'); return; }
      filled.push(L.slots[i]);
      gid(K + '-eq').textContent = eqText();
      if (filled.length === L.slots.length) {
        var good = true;
        for (var j = 0; j < L.slots.length; j++) {
          if (filled[j] !== L.slots[j]) good = false;
        }
        if (good) msg('拼对了：' + L.eq + '。调一调下面的数，代进去验算。');
        else msg('拼出来的等式是 ' + eqText() + '，不对：' + L.hint + '点“重新拼”再试。');
      } else {
        msg('拼上了“' + L.cards[i] + '”，继续拼下一块。');
      }
    }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      filled = []; guessed = -1; t = 0; solved = false;
      gid(K + '-story').textContent = L.story;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-eq').textContent = '（空）';
      gid(K + '-t').textContent = '0';
      gid(K + '-hint').textContent = L.hint;
      buildCards();
      msg('先猜答案，再点卡片拼等式。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。拼好等式，代进去验算。');
        });
      })(g);
    }
    gid(K + '-clear').addEventListener('click', function () {
      filled = [];
      gid(K + '-eq').textContent = '（空）';
      msg('重新拼：' + LEVELS[levelIdx].hint);
    });
    gid(K + '-minus').addEventListener('click', function () {
      var step = levelIdx === 2 ? 10 : 1;
      t -= step;
      if (t < 0) t = 0;
      gid(K + '-t').textContent = String(t);
    });
    gid(K + '-plus').addEventListener('click', function () {
      var step = levelIdx === 2 ? 10 : 1;
      t += step;
      if (t > 500) t = 500;
      gid(K + '-t').textContent = String(t);
    });
    gid(K + '-solve').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜答案。'); return; }
      var L = LEVELS[levelIdx];
      var good = filled.length === L.slots.length;
      if (good) {
        for (var j = 0; j < L.slots.length; j++) {
          if (filled[j] !== L.slots[j]) good = false;
        }
      }
      if (!good) { msg('等式还没拼对：' + L.hint); return; }
      var left = levelIdx === 0 ? 3 * t : (levelIdx === 1 ? 60 * t + 40 * t : 0.8 * t);
      var right = levelIdx === 0 ? 12 : (levelIdx === 1 ? 300 : 160);
      if (Math.abs(left - right) > 0.001) {
        msg('代进去：左边是 ' + left + '，右边是 ' + right + '，两边不相等——再调一调。');
        return;
      }
      solved = true;
      var ok = guessed === L.ans;
      var unit = levelIdx === 1 ? ' 小时' : ' 元';
      msg('对了：' + L.eq + '，解得 ' + (levelIdx === 1 ? 't' : 'x') + ' = ' + L.x + unit + '。' +
        (levelIdx === 1 ? '甲走了 180 千米，乙走了 120 千米，加起来正好 300 千米。' : '') +
        (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，等式拼对了，答案就在里面。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3x = 12 → x = 4', '提高：60t + 40t = 300 → t = 3', '挑战：0.8x = 160 → x = 200'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm77-table',
  title: '表格建模法',
  sub: '球赛积分表、打折销售先填表再找等量关系：表就是方程的草稿。填一填表，方程自己就出来了。',
  grade: 7,
  kind: '模拟',
  points: ['7.7'],
  render: function (el) {
    var K = 'm77-table';
    var LEVELS = [
      { label: '基础', title: '球赛积分表', rows: ['胜 1 场得', '胜 2 场得', '胜 3 场得'], unit: '分', per: 3, target: 9, q: '胜 3 场得几分？先猜。', opts: ['9 分', '6 分', '12 分'], ans: 0, hint: '胜 1 场 3 分，胜几场就是 3 乘几。' },
      { label: '提高', title: '打折销售表', rows: ['原价 100 元，8 折卖', '原价 150 元，8 折卖', '原价 x 元，8 折卖 160 元'], unit: '元', per: 0.8, target: 160, q: '打 8 折卖 160 元，原价是几元？先猜。', opts: ['200 元', '128 元', '180 元'], ans: 0, hint: '售价 = 原价 × 0.8：先算前两行找规律，再倒推原价。' },
      { label: '挑战', title: '两件衣服盈亏表', rows: ['第一件：进价 120 元，售价 150 元', '第二件：进价 200 元，售价 150 元', '两件一共'], unit: '元', per: 0, target: -10, q: '两件衣服一共赚了还是亏了？先猜。', opts: ['亏 10 元', '赚 10 元', '不赚不亏'], ans: 0, hint: '第一件赚 30 元，第二件亏 50 元，合起来呢？' }
    ];
    var levelIdx = 0, guessed = -1, filled = [false, false, false], x = 0, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 实际问题与一元一次方程</p>' +
      '<h3>表格建模法</h3>' +
      '<p>先填表，再列方程：表里的每一行都是一个等量关系。点“填这一行”，看规律怎么从表里长出来。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 填表：<b id="' + K + '-title"></b></p>' +
      '<p><button class="btn small" id="' + K + '-fill-0" type="button">填第 1 行</button> <span id="' + K + '-row-0">？</span></p>' +
      '<p><button class="btn small" id="' + K + '-fill-1" type="button">填第 2 行</button> <span id="' + K + '-row-1">？</span></p>' +
      '<p><button class="btn small" id="' + K + '-fill-2" type="button">填第 3 行</button> <span id="' + K + '-row-2">？</span></p>' +
      '<p id="' + K + '-solve-row">原价 x：<button class="btn small" id="' + K + '-minus" type="button">−</button> <b id="' + K + '-x">0</b> <button class="btn small" id="' + K + '-plus" type="button">＋</button> <button class="btn small primary" id="' + K + '-solve" type="button">验算</button></p>' +
      '<p>提示：<span id="' + K + '-hint"></span></p>' +
      '<p id="' + K + '-msg">先猜一猜，再填表。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 球赛积分</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 打折销售</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 两件衣服</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档的表都填对，并且能说出“表就是方程的草稿”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function rowValue(i) {
      var L = LEVELS[levelIdx];
      if (levelIdx === 0) return (i + 1) * 3 + ' 分';
      if (levelIdx === 1) {
        if (i === 0) return '80 元';
        if (i === 1) return '120 元';
        return '0.8x = 160，x = 200 元';
      }
      if (i === 0) return '赚 30 元';
      if (i === 1) return '亏 50 元';
      return '30 - 50 = -10：亏 10 元';
    }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      guessed = -1; filled = [false, false, false]; x = 0;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-title').textContent = L.title;
      for (var r = 0; r < 3; r++) gid(K + '-row-' + r).textContent = L.rows[r] + '：？';
      gid(K + '-x').textContent = '0';
      gid(K + '-hint').textContent = L.hint;
      gid(K + '-solve-row').style.display = levelIdx === 1 ? '' : 'none';
      msg('先猜，再一行一行填表。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。填表验证。');
        });
      })(g);
    }
    for (var f = 0; f < 3; f++) {
      (function (f) {
        gid(K + '-fill-' + f).addEventListener('click', function () {
          if (guessed < 0) { msg('先猜一猜，再填表。'); return; }
          var L = LEVELS[levelIdx];
          filled[f] = true;
          gid(K + '-row-' + f).textContent = L.rows[f] + '：' + rowValue(f);
          if (filled[0] && filled[1] && filled[2]) {
            var ok = guessed === L.ans;
            var tail = levelIdx === 0 ? '胜 1 场 3 分，胜 n 场就是 3n 分——表里每行都是 3 的倍数。' :
              levelIdx === 1 ? '售价 = 原价 × 0.8：0.8x = 160，x = 200。' :
              '一件赚 30，一件亏 50，合起来亏 10 元——不能只看一件。';
            msg('表填完了。' + tail + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍表。'));
            if (tiers) tiers.done(levelIdx);
            if (typeof markTried === 'function') markTried(K);
          } else {
            msg('填好第 ' + (f + 1) + ' 行，继续填下一行。');
          }
        });
      })(f);
    }
    gid(K + '-minus').addEventListener('click', function () {
      if (x > 0) x -= 10;
      gid(K + '-x').textContent = String(x);
    });
    gid(K + '-plus').addEventListener('click', function () {
      x += 10;
      if (x > 500) x = 500;
      gid(K + '-x').textContent = String(x);
    });
    gid(K + '-solve').addEventListener('click', function () {
      if (0.8 * x === 160) msg('验算：0.8 × 200 = 160，对了！原价 200 元。');
      else msg('0.8 × ' + x + ' = ' + (0.8 * x) + '，还不是 160：再调一调原价。');
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：胜 3 场得 9 分', '提高：0.8x = 160 → x = 200', '挑战：两件一共亏 10 元'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm77-guess',
  title: '天平试值法',
  sub: '先猜一个答案放上天平，看哪边重再调：猜中使天平平衡的数，就是方程的解；再过渡到代数解法。',
  grade: 7,
  kind: '实验',
  points: ['7.7'],
  render: function (el) {
    var K = 'm77-guess';
    var LEVELS = [
      { label: '基础', a: 1, b: 4, c: 9, q: 'x + 4 = 9，x 是几？先猜。', opts: ['5', '13', '4'], ans: 0, hint: '从 5 开始试：左边 = x + 4。' },
      { label: '提高', a: 2, b: -1, c: 9, q: '2x - 1 = 9，x 是几？先猜。', opts: ['5', '4', '10'], ans: 0, hint: '从 5 开始试：左边 = 2x - 1。' },
      { label: '挑战', a: 4, b: -3, c: 21, q: '4x - 3 = 21，x 是几？先猜。', opts: ['6', '5', '7'], ans: 0, hint: '从 6 开始试：左边 = 4x - 3。' }
    ];
    var levelIdx = 0, x = 0, guessed = -1, tiers = null, tries = 0;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 实际问题与一元一次方程</p>' +
      '<h3>天平试值法</h3>' +
      '<p>不知道 x 是几？猜一个放上天平：左边重了，x 猜大了；右边重了，x 猜小了；天平平了，x 就猜中了。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 试一试：<button class="btn small" id="' + K + '-minus" type="button">x − 1</button> <b id="' + K + '-x">0</b> <button class="btn small" id="' + K + '-plus" type="button">x ＋ 1</button> <button class="btn small primary" id="' + K + '-try" type="button">放上天平</button></p>' +
      '<p>方程：<b id="' + K + '-eq"></b></p>' +
      '<p>天平：<b id="' + K + '-beam">还没试</b></p>' +
      '<p>左边：<b id="' + K + '-left">？</b>　右边：<b id="' + K + '-right">？</b>　试了 <b id="' + K + '-tries">0</b> 次</p>' +
      '<p>提示：<span id="' + K + '-hint"></span></p>' +
      '<p id="' + K + '-msg">先猜 x 是几，再放上天平试。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · x + 4 = 9</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 2x - 1 = 9</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 4x - 3 = 21</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都试出 x，并且能说出“天平平了，猜的数就是解”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function leftVal() {
      var L = LEVELS[levelIdx];
      return L.a * x + L.b;
    }
    function eqText(L) {
      var s = (L.a === 1 ? 'x' : L.a + 'x');
      if (L.b > 0) s += ' + ' + L.b;
      if (L.b < 0) s += ' - ' + (-L.b);
      return s + ' = ' + L.c;
    }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      x = 0; guessed = -1; tries = 0;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-eq').textContent = eqText(L);
      gid(K + '-x').textContent = '0';
      gid(K + '-beam').textContent = '还没试';
      gid(K + '-left').textContent = '？';
      gid(K + '-right').textContent = '？';
      gid(K + '-tries').textContent = '0';
      gid(K + '-hint').textContent = L.hint;
      msg('先猜 x 是几，再调数字、放上天平试。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 x = ' + LEVELS[levelIdx].opts[g] + '。调到这个数，放上天平试试。');
        });
      })(g);
    }
    gid(K + '-minus').addEventListener('click', function () {
      if (x > 0) x--;
      gid(K + '-x').textContent = String(x);
    });
    gid(K + '-plus').addEventListener('click', function () {
      x++;
      if (x > 20) x = 20;
      gid(K + '-x').textContent = String(x);
    });
    gid(K + '-try').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜 x 是几。'); return; }
      var L = LEVELS[levelIdx];
      var lv = leftVal();
      tries++;
      gid(K + '-tries').textContent = String(tries);
      gid(K + '-left').textContent = String(lv);
      gid(K + '-right').textContent = String(L.c);
      if (lv === L.c) {
        gid(K + '-beam').textContent = '平衡了！';
        var ok = guessed === L.ans;
        msg('天平平了：左边 ' + lv + ' = 右边 ' + L.c + '，x = ' + x + ' 就是方程的解。试了 ' + tries + ' 次。' +
          (ok ? '你猜对了！' : '你刚才猜 x 是 ' + L.opts[guessed] + '，试值法找到了真正的解。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else if (lv > L.c) {
        gid(K + '-beam').textContent = '左边重了';
        msg('x = ' + x + ' 时左边是 ' + lv + '，比右边 ' + L.c + ' 重：x 猜大了，往小调。');
      } else {
        gid(K + '-beam').textContent = '右边重了';
        msg('x = ' + x + ' 时左边是 ' + lv + '，比右边 ' + L.c + ' 轻：x 猜小了，往大调。');
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：x + 4 = 9 → x = 5', '提高：2x - 1 = 9 → x = 5', '挑战：4x - 3 = 21 → x = 6'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm78-motion',
  title: '点线面体运动法',
  sub: '点动成线、线动成面、面动成体：激光笔的光点、拉直的绳子、转起来的长方形——自己拖一拖，看图形是怎么“动”出来的。',
  grade: 7,
  kind: '演示',
  points: ['7.8'],
  render: function (el) {
    var K = 'm78-motion';
    var LEVELS = [
      { label: '基础', stage: 0, q: '一个点动起来，留下的痕迹是什么？', opts: ['一条线', '一个面', '一个体'], ans: 0 },
      { label: '提高', stage: 1, q: '一条线平移扫过，留下的痕迹是什么？', opts: ['一个面', '一条线', '一个体'], ans: 0 },
      { label: '挑战', stage: 2, q: '长方形绕它的一条边转一圈，得到什么体？', opts: ['圆柱', '圆锥', '球'], ans: 0 }
    ];
    var levelIdx = 0, pos = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 7 年级 · 几何图形</p>' +
      '<h3>点线面体运动法</h3>' +
      '<p>图形不是静止的：点跑过的地方是线，线扫过的地方是面，面转起来的地方是体。先猜，再拖滑杆看它动。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 动一动：<input type="range" id="' + K + '-slider" min="0" max="10" step="1" value="0" style="width:70%"> <b id="' + K + '-pos">0</b></p>' +
      '<p id="' + K + '-stage"></p>' +
      '<p id="' + K + '-trace"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拖滑杆。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 点动成线</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 线动成面</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 面动成体</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都动一遍，并且能说出“点动成线、线动成面、面动成体”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function render() {
      gid(K + '-pos').textContent = String(pos);
      var stage = LEVELS[levelIdx].stage;
      if (stage === 0) {
        gid(K + '-stage').textContent = '光点在跑：●';
        var tr = '';
        for (var i = 0; i <= pos; i++) tr += '—';
        tr += '●';
        gid(K + '-trace').textContent = '痕迹：' + tr;
      } else if (stage === 1) {
        gid(K + '-stage').textContent = '一根线在平移：│';
        var rows = '';
        for (var r = 0; r <= pos; r++) rows += '│││││ ';
        gid(K + '-trace').textContent = '扫过的面：' + rows;
      } else {
        gid(K + '-stage').textContent = '长方形绕竖边转：▭';
        gid(K + '-trace').textContent = pos >= 10 ? '转满一圈：一个圆柱立起来了（底面是圆，侧面是长方形卷成的）。' : '转了 ' + pos + '/10 圈，继续拖。';
      }
      if (pos >= 10 && guessed >= 0) {
        var ok = guessed === LEVELS[levelIdx].ans;
        var tail = stage === 0 ? '点跑过的地方连成一条线。' :
          stage === 1 ? '线扫过的地方铺成一个面。' : '长方形绕一边旋转，得到圆柱。';
        msg(tail + (ok ? '你猜对了！' : '你刚才猜的是“' + LEVELS[levelIdx].opts[guessed] + '”，再看一遍痕迹。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      levelIdx = i; pos = 0; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-slider').value = '0';
      render();
      msg('先猜，再把滑杆拖到头（10）。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。拖滑杆验证。');
        });
      })(g);
    }
    gid(K + '-slider').addEventListener('input', function (e) {
      pos = parseInt(e.target.value, 10);
      if (guessed < 0) { msg('先猜一猜，再拖滑杆。'); return; }
      render();
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：点动成线', '提高：线动成面', '挑战：面动成体（圆柱）'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm78-rope',
  title: '拉绳比长法',
  sub: '两点之间画直线与曲线比一比：绳子拉直了就是线段，就是最短。拖一拖弯曲程度，看长度怎么变。',
  grade: 7,
  kind: '实验',
  points: ['7.8'],
  render: function (el) {
    var K = 'm78-rope';
    var LEVELS = [
      { label: '基础', ax: 1, ay: 1, bx: 5, by: 1, q: 'A(1,1) 到 B(5,1)，直线段和弯路谁短？', opts: ['直线段短', '弯路短', '一样长'], ans: 0 },
      { label: '提高', ax: 0, ay: 0, bx: 4, by: 3, q: 'A(0,0) 到 B(4,3)，直线段长是几？', opts: ['5', '7', '4'], ans: 0 },
      { label: '挑战', ax: 0, ay: 0, bx: 6, by: 0, q: '还有比直线段更短的路吗？', opts: ['没有', '有，绕一下', '有，走折线'], ans: 0 }
    ];
    var levelIdx = 0, bend = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 几何图形</p>' +
      '<h3>拉绳比长法</h3>' +
      '<p>A、B 两点之间，一条绳子拉直就是线段，一松手弯下去就变长。拖滑杆调弯曲程度，长度实时算出来：直线永远最短。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 弯一弯：<input type="range" id="' + K + '-slider" min="0" max="5" step="1" value="0" style="width:70%"> 弯曲程度：<b id="' + K + '-bend">0（拉直）</b></p>' +
      '<p>直线段长：<b id="' + K + '-straight"></b>　现在这条路长：<b id="' + K + '-curved"></b></p>' +
      '<p id="' + K + '-draw"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拖滑杆。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · A(1,1)-B(5,1)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · A(0,0)-B(4,3)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 最短的路</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都比对，并且能说出“两点之间，线段最短”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function straightLen(L) {
      var dx = L.bx - L.ax, dy = L.by - L.ay;
      return Math.sqrt(dx * dx + dy * dy);
    }
    function curveLen(L, b) {
      var mx = (L.ax + L.bx) / 2, my = (L.ay + L.by) / 2;
      var nx = -(L.by - L.ay), ny = (L.bx - L.ax);
      var nl = Math.sqrt(nx * nx + ny * ny) || 1;
      var cx = mx + nx / nl * b, cy = my + ny / nl * b;
      var len = 0, px = L.ax, py = L.ay;
      for (var i = 1; i <= 20; i++) {
        var t = i / 20;
        var qx = (1 - t) * (1 - t) * L.ax + 2 * (1 - t) * t * cx + t * t * L.bx;
        var qy = (1 - t) * (1 - t) * L.ay + 2 * (1 - t) * t * cy + t * t * L.by;
        len += Math.sqrt((qx - px) * (qx - px) + (qy - py) * (qy - py));
        px = qx; py = qy;
      }
      return len;
    }
    function fmtLen(x) {
      return String(Math.round(x * 100) / 100);
    }
    function render() {
      var L = LEVELS[levelIdx];
      var sl = straightLen(L);
      var cl = curveLen(L, bend);
      gid(K + '-bend').textContent = bend === 0 ? '0（拉直）' : String(bend);
      gid(K + '-straight').textContent = fmtLen(sl);
      gid(K + '-curved').textContent = fmtLen(cl);
      gid(K + '-draw').textContent = bend === 0 ? 'A ————— B（拉直了，就是线段）' : 'A ～～～ B（弯下去的路变长了）';
      if (bend >= 3 && guessed >= 0) {
        var ok = guessed === L.ans;
        msg('直线段长 ' + fmtLen(sl) + '，弯路长 ' + fmtLen(cl) + '：弯得越厉害，路越长。' +
          (levelIdx === 1 ? '直角三角形 3-4-5：直线段正好是 5。' : '') +
          (levelIdx === 2 ? '不管怎么弯，都比直线长——两点之间，线段最短。' : '') +
          (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍两条路的长度。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      levelIdx = i; bend = 0; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-slider').value = '0';
      render();
      msg('先猜，再把滑杆拖到 3 以上比一比。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。拖滑杆弯一弯验证。');
        });
      })(g);
    }
    gid(K + '-slider').addEventListener('input', function (e) {
      bend = parseInt(e.target.value, 10);
      if (guessed < 0) { msg('先猜一猜，再拖滑杆。'); return; }
      render();
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：直线段最短', '提高：A(0,0)-B(4,3) 直线段长 5', '挑战：没有更短的路'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm78-count',
  title: '计数法',
  sub: '一条线段上有 n 个点，能数出多少条线段？点两个点连一条线段，连满了数一数，规律自己就出来了。',
  grade: 7,
  kind: '实验',
  points: ['7.8'],
  render: function (el) {
    var K = 'm78-count';
    var LEVELS = [
      { label: '基础', n: 3, q: '3 个点能连出几条线段？先猜。', opts: ['3 条', '6 条', '2 条'], ans: 0 },
      { label: '提高', n: 4, q: '4 个点能连出几条线段？先猜。', opts: ['6 条', '4 条', '8 条'], ans: 0 },
      { label: '挑战', n: 5, q: '5 个点能连出几条线段？先猜。', opts: ['10 条', '8 条', '15 条'], ans: 0 }
    ];
    var levelIdx = 0, sel = -1, drawn = {}, count = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 几何图形</p>' +
      '<h3>计数法</h3>' +
      '<p>一条线上有几个点，点两点连一条线段：连过的不能重复连。连满了数一数——n 个点，线段数是 n×(n-1)÷2。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 连线段：先点一个点，再点另一个点。</p>' +
      '<div class="btn-row" id="' + K + '-dots"></div>' +
      '<p>已连：<b id="' + K + '-list">（还没连）</b></p>' +
      '<p>连了 <b id="' + K + '-count">0</b> 条　<button class="btn small ghost" id="' + K + '-clear" type="button">重连</button></p>' +
      '<p id="' + K + '-msg">先猜一猜，再连线段。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 3 个点</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 4 个点</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 5 个点</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都连满，并且能说出“n 个点有 n×(n-1)÷2 条线段”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function totalSegs(n) { return n * (n - 1) / 2; }
    function buildDots() {
      var box = gid(K + '-dots');
      while (box.firstChild) box.removeChild(box.firstChild);
      var L = LEVELS[levelIdx];
      for (var i = 0; i < L.n; i++) {
        (function (i) {
          var b = document.createElement('button');
          b.type = 'button'; b.className = 'btn small'; b.textContent = '点' + (i + 1);
          b.addEventListener('click', function () { onDot(i); });
          box.appendChild(b);
        })(i);
      }
    }
    function renderList() {
      var keys = [];
      for (var k in drawn) keys.push(k);
      gid(K + '-list').textContent = keys.length ? keys.join('，') : '（还没连）';
      gid(K + '-count').textContent = String(count);
    }
    function setLevel(i) {
      levelIdx = i; sel = -1; drawn = {}; count = 0; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      buildDots();
      renderList();
      msg('先猜 ' + L.n + ' 个点能连几条线段，再动手连。');
    }
    function onDot(i) {
      if (guessed < 0) { msg('先猜一猜，再连线段。'); return; }
      if (sel < 0) {
        sel = i;
        msg('选好了点 ' + (i + 1) + '，再点另一个点，跟它连起来。');
        return;
      }
      if (sel === i) { msg('同一个点连不成线段：换一个点。'); return; }
      var a = Math.min(sel, i), b = Math.max(sel, i);
      var key = '点' + (a + 1) + '-点' + (b + 1);
      if (drawn[key]) {
        msg('这条线段已经连过了：换一对点。');
        sel = -1;
        return;
      }
      drawn[key] = true;
      count++;
      sel = -1;
      renderList();
      var L = LEVELS[levelIdx];
      var total = totalSegs(L.n);
      if (count >= total) {
        var ok = guessed === L.ans;
        msg('连满了：一共 ' + total + ' 条线段。规律：每个点能连 ' + (L.n - 1) + ' 条，' + L.n + ' 个点就是 ' +
          L.n + '×' + (L.n - 1) + '÷2 = ' + total + ' 条。' +
          (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，数一数连了几条。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('连好了 ' + key + '，还差 ' + (total - count) + ' 条。');
      }
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。动手连线段验证。');
        });
      })(g);
    }
    gid(K + '-clear').addEventListener('click', function () { setLevel(levelIdx); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3 个点 3 条', '提高：4 个点 6 条', '挑战：5 个点 10 条'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});
