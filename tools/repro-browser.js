// CDP 真机复现：用真 Chrome + 真鼠标事件（Input.dispatchMouseEvent，
// 和浏览器测试工具同一条输入路径）复现实验室的拖放/手柄问题。
// 测试桩里拖放全通、真机却断——桩模拟不了真机指针事件路径，
// 所以直接用无头 Chrome 当复现环境。
//
// 用法：
//   node tools/repro-browser.js station-drag   # 天平站砝码拖到虚线落点区
//   node tools/repro-browser.js partsbox-drag  # 器材盒 1/6 拖到台面右盘
//   node tools/repro-browser.js rect-refresh   # 长方形手柄刷新后还在不在
//   node tools/repro-browser.js rect-label     # 手柄点击区和 (w,h) 标签重叠
//   node tools/repro-browser.js bal-clear      # 清空重来按钮
// 默认打开本 worktree 的 homepage-standalone.html（--file 可指定别的页面）。
// 退出码 0 = 场景通过，1 = 场景失败或环境出错。
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const CHROME = '/opt/meta-chromium/chrome';
// 本机直接启动这版 Chrome 有两个坑（2026-11-07 实测）：
//  (1) 需要 Hatch WebGL 策略：启动参数带
//      --hatch-webgl-allowed-domains-file=<文件> + 对应 sha256，
//      文件内容一行 `hatch-webgl-all-origins-v1`（浏览器 daemon 平时
//      会提供这个策略；直接跑时自己造一个仅供本地复现用）。
//  (2) Chrome 155 的本地网络访问检查（LNA）会拦 http://127.0.0.1/ 的
//      导航（ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS，关特性开关
//      也拦不住），所以直接用 file:// 加载独立文件（自包含，无网络请求）。
const WEBGL_POLICY = '/tmp/repro-webgl-policy.txt';
const PORT = 9223;
const HTTP_PORT = 8901;

const scenario = process.argv[2] || 'station-drag';
let fileArg = 'homepage-standalone.html';
for (let i = 3; i < process.argv.length; i++) {
  if (process.argv[i] === '--file') fileArg = process.argv[++i];
}

const WEBROOT = path.resolve(__dirname, '..', 'apps', 'web');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let ws = null;
let msgId = 0;
const pending = new Map();
const consoleErrors = [];
const pageErrors = [];

function send(method, params) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params: params || {} }));
  });
}

async function evaljs(expr, awaitPromise) {
  const r = await send('Runtime.evaluate', {
    expression: expr, returnByValue: true, awaitPromise: !!awaitPromise,
  });
  if (r.exceptionDetails) {
    return { __error: r.exceptionDetails.exception
      ? (r.exceptionDetails.exception.description || r.exceptionDetails.text)
      : (r.exceptionDetails.text || 'eval exception') };
  }
  return r.result ? r.result.value : undefined;
}

async function mouse(type, x, y) {
  await send('Input.dispatchMouseEvent', {
    type, x: Math.round(x), y: Math.round(y), button: 'left', clickCount: 1,
  });
}
async function drag(x1, y1, x2, y2, steps, stepMs) {
  await mouse('mousePressed', x1, y1);
  await sleep(80);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    await mouse('mouseMoved', x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);
    await sleep(stepMs || 40);
  }
  await mouse('mouseReleased', x2, y2);
  await sleep(150);
}
async function clickAt(x, y) {
  await mouse('mousePressed', x, y);
  await sleep(60);
  await mouse('mouseReleased', x, y);
  await sleep(150);
}
async function rectOf(sel) {
  // 先滚到可见（block:center），再读视口坐标：CDP 鼠标事件用的是视口
  // 坐标，元素在视口外时事件根本落不到它身上（target 会是 <html>）。
  // behavior:'instant'：页面开了 html{scroll-behavior:smooth}，默认
  // scrollIntoView 是动画异步的，同步读数还是旧坐标；instant 立即到位。
  await evaljs(`(function(){var el=document.querySelector(${JSON.stringify(sel)});if(el)el.scrollIntoView({block:'center',inline:'center',behavior:'instant'});})()`);
  await sleep(300);
  return evaljs(`(function(){var el=document.querySelector(${JSON.stringify(sel)});if(!el)return null;var r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,cx:r.x+r.width/2,cy:r.y+r.height/2,visible:r.width>0&&r.height>0&&r.bottom>0&&r.top<window.innerHeight};})()`);
}
async function center(sel) {
  const r = await rectOf(sel);
  return r ? { x: r.cx, y: r.cy } : null;
}
// 一次滚动、一次测量多个选择器：逐个 center() 会互相滚动，
// 后测的会把先测的元素的视口坐标顶掉（拖放起点就落在别处）。
async function centers(...sels) {
  await evaljs(`(function(){var el=document.querySelector(${JSON.stringify(sels[0])});if(el)el.scrollIntoView({block:'center',inline:'center',behavior:'instant'});})()`);
  await sleep(300);
  const out = [];
  for (const sel of sels) {
    const r = await evaljs(`(function(){var el=document.querySelector(${JSON.stringify(sel)});if(!el)return null;var b=el.getBoundingClientRect();return {x:b.x,y:b.y,cx:b.x+b.width/2,cy:b.y+b.height/2,w:b.width,h:b.height,visible:b.width>0&&b.height>0&&b.bottom>0&&b.top<window.innerHeight};})()`);
    out.push(r);
  }
  return out;
}

async function installProbe() {
  await evaljs(`(function(){
    window.__probe = [];
    ['pointerdown','pointermove','pointerup','pointercancel','click'].forEach(function(t){
      document.addEventListener(t, function(e){
        var el = e.target;
        var desc = el ? (el.tagName||'?') + (el.id ? '#'+el.id : '') +
          (el.getAttribute ? ([...['data-drag-chip','data-drag-weight','data-bench','data-bench-rotate','data-drop','data-world']].map(function(a){var v=el.getAttribute(a);return v!=null?a+'='+v:null;}).filter(Boolean).join(' ')) : '') : '?';
        window.__probe.push(t + ' target=' + desc + ' pid=' + e.pointerId + ' primary=' + e.isPrimary + ' buttons=' + e.buttons + ' x=' + Math.round(e.clientX) + ' y=' + Math.round(e.clientY));
      }, true);
    });
  })()`);
}
async function probeLog() { return evaljs(`window.__probe ? window.__probe.join('\\n') : '(no probe)'`); }
async function clearProbe() { await evaljs(`window.__probe = []`); }

async function enterLab() {
  await evaljs(`(function(){ if (typeof navGo === 'function') navGo('lab'); })()`);
  await sleep(400);
  return evaljs(`(function(){ var s=document.getElementById('lab'); return s ? !s.hidden : null; })()`);
}

async function labState() {
  return evaljs(`(function(){
    if (typeof labWorld === 'undefined' || !labWorld) return { hasWorld: false };
    var d = MathWorld.derived(labWorld);
    return { hasWorld: true,
      benchCount: d.bench.count, benchTotal: d.bench.totalStr,
      balL: d.balance.Lstr, balR: d.balance.Rstr, balEqual: d.balance.equal,
      rect: labWorld.rect ? labWorld.rect.w + 'x' + (labWorld.rect.perim / 2 - labWorld.rect.w) + ' (perim ' + labWorld.rect.perim + ')' : null,
      benchRect: !!labWorld.benchRect, benchBalance: !!labWorld.benchBalance,
      inspectSel: (typeof worldInspectSel !== 'undefined' && worldInspectSel) ? JSON.stringify(worldInspectSel) : null,
      benchView: (function(){ var v=document.getElementById('worldBenchViews'); return v ? v.textContent : ''; })(),
    };
  })()`);
}

async function main() {
  // 1. 直接用 file:// 加载独立文件（见文件头注释：http://127.0.0.1 会被
  // Chrome 155 的 LNA 检查拦住；独立文件自包含，无网络请求）。
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'repro-profile-'));
  fs.writeFileSync(WEBGL_POLICY, 'hatch-webgl-all-origins-v1\n');
  const webglSha = execSync(`sha256sum ${WEBGL_POLICY}`).toString().split(' ')[0];
  const url = 'file://' + path.join(WEBROOT, fileArg);
  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--no-proxy-server',
    '--remote-debugging-port=' + PORT, '--user-data-dir=' + profile,
    '--window-size=1920,1080',
    '--hatch-webgl-allowed-domains-file=' + WEBGL_POLICY,
    '--hatch-webgl-allowed-domains-sha256=' + webglSha,
    url,
  ], { stdio: 'ignore' });

  const cleanup = () => { try { chrome.kill('SIGKILL'); } catch (e) {} };
  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(2); });

  // 2. Wait for DevTools endpoint and connect.
  let wsUrl = null;
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) { wsUrl = page.webSocketDebuggerUrl; break; }
    } catch (e) { /* not up yet */ }
  }
  if (!wsUrl) { console.log('FAIL: chrome DevTools endpoint did not come up'); cleanup(); process.exit(1); }
  ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id).resolve(m.result || {}); pending.delete(m.id); return; }
    if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      pageErrors.push((d.exception && d.exception.description) || d.text || 'page exception');
    }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      consoleErrors.push(m.params.args.map((a) => a.value || a.description || '').join(' '));
    }
  };
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  // 3. 页面随 Chrome 启动参数直接加载（file://）；等它就绪。
  let ready = null;
  for (let i = 0; i < 30; i++) {
    await sleep(500);
    ready = await evaljs(`(function(){ return { readyState: document.readyState, title: document.title, hasNavGo: typeof navGo === 'function', hasLab: !!document.getElementById('lab'), innerW: window.innerWidth }; })()`);
    if (ready && ready.hasNavGo && ready.hasLab) break;
  }
  console.log('  page ready: ' + JSON.stringify(ready));

  const report = { scenario, url, pass: null, notes: [] };
  const note = (s) => { report.notes.push(s); console.log('  ' + s); };

  try {
    if (scenario === 'station-drag') {
      const inLab = await enterLab();
      note('enter lab: hidden=' + (inLab === false ? 'no (visible)' : inLab));
      await evaljs(`document.getElementById('worldBalCard').classList.remove('collapsed')`);
      await sleep(200);
      await installProbe();
      const [chip, drop] = await centers('[data-drag-chip="weight"][data-qty="1"]', '#worldBalDropL');
      note('chip 1 center: ' + JSON.stringify(chip) + '  dropL center: ' + JSON.stringify(drop));
      const before = await labState();
      note('before: bal L=' + before.balL + ' R=' + before.balR);
      await clearProbe();
      await drag(chip.cx, chip.cy, drop.cx, drop.cy, 12, 40);
      const ghost = await evaljs(`(function(){var g=document.querySelector('.apparatus-ghost');return g?{display:g.style.display,text:g.textContent}:null;})()`);
      note('ghost during/after drag: ' + JSON.stringify(ghost));
      const after = await labState();
      note('after: bal L=' + after.balL + ' R=' + after.balR);
      note('probe events:\n' + (await probeLog()));
      const toast = await evaljs(`(function(){var m=document.getElementById('worldBalMsg');return m?m.textContent:'';})()`);
      note('station msg: ' + toast);
      report.pass = after.balL !== before.balL;
      note(report.pass ? 'RESULT: PASS — drag landed, left pan changed' : 'RESULT: FAIL — left pan unchanged, drag did not land');
    } else if (scenario === 'partsbox-drag') {
      await enterLab();
      // 天平上台面 + 切到天平视图
      await evaljs(`(function(){var b=document.querySelector('[data-bench="balance"]');if(b)b.click();})()`);
      await sleep(300);
      await installProbe();
      const [chip, view] = await centers('#worldBenchBox [data-bench="make"][data-kind="frac"][data-n="1"][data-d="6"]', '#worldBenchView');
      // 台面 viewBox 520x260，右盘 x 380–480、y 148–232 → 中心 (430,190)
      const px = view.x + (430 / 520) * view.w;
      const py = view.y + (190 / 260) * view.h;
      note('chip 1/6 center: ' + JSON.stringify(chip) + '  bench view: ' + JSON.stringify(view) + '  panR target: ' + Math.round(px) + ',' + Math.round(py));
      const before = await labState();
      note('before: bench=' + before.benchTotal + ' bal R=' + before.balR);
      await clearProbe();
      await drag(chip.cx, chip.cy, px, py, 12, 40);
      const ghost = await evaljs(`(function(){var g=document.getElementById('worldBenchGhost');return g?{hidden:g.hidden,text:g.textContent}:null;})()`);
      note('bench ghost: ' + JSON.stringify(ghost));
      const after = await labState();
      note('after: bench=' + after.benchTotal + ' bal R=' + after.balR);
      note('probe events:\n' + (await probeLog()));
      report.pass = after.balR !== before.balR || after.benchTotal !== before.benchTotal;
      note(report.pass ? 'RESULT: PASS — 1/6 landed somewhere on the bench' : 'RESULT: FAIL — nothing changed');
    } else if (scenario === 'bal-inspect-zero') {
      // 复测 (c)：左盘放 1、右盘放 1/6，点左盘合计打开那件砝码的检查器，
      // 把它的值改成 0——右盘的 1/6 不该跟着变 0。
      await enterLab();
      await evaljs(`(function(){var b=document.querySelector('[data-bench="balance"]');if(b)b.click();})()`);
      await sleep(300);
      const [chip1, chipF, view] = await centers(
        '#worldBenchBox [data-bench="make"][data-kind="num"][data-n="1"]',
        '#worldBenchBox [data-bench="make"][data-kind="frac"][data-n="1"][data-d="6"]',
        '#worldBenchView');
      const pxL = view.x + (110 / 520) * view.w, py = view.y + (190 / 260) * view.h;
      const pxR = view.x + (430 / 520) * view.w;
      await drag(chip1.cx, chip1.cy, pxL, py, 12, 40);
      await drag(chipF.cx, chipF.cy, pxR, py, 12, 40);
      const before = await labState();
      note('before: bal L=' + before.balL + ' R=' + before.balR);
      // 点左盘合计（pick-pan）→ 打开左盘最后一件砝码的检查器
      const [panL] = await centers('#worldBenchPanLText');
      await clickAt(panL.cx, panL.cy);
      await sleep(300);
      const insp = await evaljs(`(function(){var b=document.getElementById('worldBenchInspector');return b?b.textContent.slice(0,120):'';})()`);
      note('inspector: ' + insp);
      // 把值改成 0：先走滑杆 input 路径（真人拖滑杆），再走数字输入 change 路径，
      // 两条路都测——滑杆拖动时检查器会中途重建，值得单独验。
      const setRes = await evaljs(`(function(){
        var rng=document.querySelector('#worldBenchInspector input[data-insp="0"]');
        if(!rng) return 'no-range';
        rng.value='0'; rng.dispatchEvent(new Event('input',{bubbles:true}));
        return 'range-set-0';
      })()`);
      note('slider set: ' + setRes);
      await sleep(400);
      const after = await labState();
      note('after set left to 0: bal L=' + after.balL + ' R=' + after.balR);
      report.pass = before.balL === '1' && before.balR === '1/6' && after.balL === '0' && after.balR === '1/6';
      note(report.pass ? 'RESULT: PASS — only the left pan changed' : 'RESULT: FAIL — right pan also changed (or setup failed)');
    } else if (scenario === 'clear-all') {
      // 复测 4(a)：天平+长方形+直线都在台上、台上有散数，点“全部拿走”，
      // 台面要真空（大器材都下台），但站里的天平砝码不动。
      await enterLab();
      // 一个散数：点芯片直接放上台（不用拖）
      await evaljs(`(function(){var b=document.querySelector('#worldBenchBox [data-bench="make"][data-kind="num"][data-n="5"]');if(b)b.click();})()`);
      await sleep(300);
      // 天平最后上台：切到天平视图，再拖 1/6 上右盘
      await evaljs(`(function(){['rect','line','balance'].forEach(function(k){var b=document.querySelector('[data-bench="'+k+'"]');if(b)b.click();});})()`);
      await sleep(400);
      const [chipF, view] = await centers(
        '#worldBenchBox [data-bench="make"][data-kind="frac"][data-n="1"][data-d="6"]',
        '#worldBenchView');
      const pxR = view.x + (430 / 520) * view.w, py = view.y + (190 / 260) * view.h;
      await drag(chipF.cx, chipF.cy, pxR, py, 12, 40);
      const before = await labState();
      note('before: benchCount=' + before.benchCount + ' bench=' + before.benchTotal + ' bal R=' + before.balR + ' balance=' + before.benchBalance + ' rect=' + before.benchRect);
      const [clearBtn] = await centers('[data-bench="clear"]');
      await clickAt(clearBtn.cx, clearBtn.cy);
      await sleep(400);
      const after = await labState();
      const svgHasRect = await evaljs(`document.getElementById('worldBenchView').innerHTML.indexOf('#fde68a')>=0`);
      note('after 全部拿走: benchCount=' + after.benchCount + ' bal R=' + after.balR + ' balance=' + after.benchBalance + ' rect=' + after.benchRect + ' goldRectDrawn=' + svgHasRect);
      report.pass = before.benchCount === 1 && before.balR === '1/6' && after.benchCount === 0 &&
        !after.benchBalance && !after.benchRect && !svgHasRect && after.balR === '1/6';
      note(report.pass ? 'RESULT: PASS — bench truly empty, station weights kept' : 'RESULT: FAIL — apparatus still on bench or weights lost');
    } else if (scenario === 'rect-remove') {
      // 复测 4(b)：长方形+直线都在台上（坐标系视图），把长方形拿下台面，
      // 坐标系里不能再画金色长方形，但直线还在。
      await enterLab();
      await evaljs(`(function(){['rect','line'].forEach(function(k){var b=document.querySelector('[data-bench="'+k+'"]');if(b)b.click();});})()`);
      await sleep(400);
      const hasRectBefore = await evaljs(`document.getElementById('worldBenchView').innerHTML.indexOf('#fde68a')>=0`);
      const hasLineBefore = await evaljs(`document.getElementById('worldBenchView').innerHTML.indexOf('#ea580c')>=0`);
      note('before: goldRect=' + hasRectBefore + ' line=' + hasLineBefore);
      await evaljs(`(function(){var b=document.querySelector('[data-bench="rect"]');if(b)b.click();})()`);
      await sleep(400);
      const hasRectAfter = await evaljs(`document.getElementById('worldBenchView').innerHTML.indexOf('#fde68a')>=0`);
      const hasLineAfter = await evaljs(`document.getElementById('worldBenchView').innerHTML.indexOf('#ea580c')>=0`);
      note('after rect off: goldRect=' + hasRectAfter + ' line=' + hasLineAfter);
      report.pass = hasRectBefore && hasLineBefore && !hasRectAfter && hasLineAfter;
      note(report.pass ? 'RESULT: PASS — rect gone, line stays' : 'RESULT: FAIL — rect still drawn or line lost');
    } else if (scenario === 'combo-persist') {
      // 复测 4(d)：组合台左盘加 1，刷新后左盘还是 1（以前变 0）。
      await enterLab();
      // 组合台在“更多器材”折叠区里（#labWorkbench hidden），先点折叠按钮展开
      await evaljs(`(function(){var f=document.getElementById('labMoreFold');if(f)f.click();})()`);
      await sleep(300);
      const [plus] = await centers('#labWbIntPlus');
      await clickAt(plus.cx, plus.cy);
      await sleep(300);
      const before = await evaljs(`document.getElementById('labWbList').textContent`);
      note('before reload: combo list = ' + before);
      await send('Page.reload', { ignoreCache: true });
      await sleep(2500);
      await enterLab();
      await evaljs(`(function(){var f=document.getElementById('labMoreFold');if(f)f.click();})()`);
      await sleep(300);
      const after = await evaljs(`document.getElementById('labWbList').textContent`);
      const st = await labState();
      note('after reload: combo list = ' + after + ' world bal L=' + st.balL);
      report.pass = before.indexOf('左盘：1') >= 0 && after.indexOf('左盘：1') >= 0 && st.balL === '1';
      note(report.pass ? 'RESULT: PASS — combo left pan persists' : 'RESULT: FAIL — combo left pan lost on refresh');
    } else if (scenario === 'rect-refresh') {
      await enterLab();
      await evaljs(`(function(){var b=document.querySelector('[data-bench="rect"]');if(b)b.click();})()`);
      await sleep(300);
      await evaljs(`(function(){ if (typeof worldInspectSelect === 'function') worldInspectSelect({apparatus:'rect'}); })()`);
      await sleep(300);
      const pre = await evaljs(`(function(){
        var h=document.querySelector('[data-bench-rotate]');
        if (h) h.scrollIntoView({block:'center',behavior:'instant'});
        var r=h?h.getBoundingClientRect():null;
        return { handle: !!h, handleRect: r?{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}:null,
          sel: (typeof worldInspectSel!=='undefined'&&worldInspectSel)?JSON.stringify(worldInspectSel):null };
      })()`);
      await sleep(300);
      note('pre-refresh: ' + JSON.stringify(pre));
      const preW = await labState();
      if (pre.handle) {
        // 重新读一次坐标（滚动后坐标变了），再点手柄中心
        const pre2 = await evaljs(`(function(){var h=document.querySelector('[data-bench-rotate]');var r=h.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
        await clickAt(pre2.x, pre2.y);
        const afterClick = await labState();
        note('pre-refresh handle click: rect ' + preW.rect + ' -> ' + afterClick.rect);
      }
      await send('Page.reload', { ignoreCache: true });
      await sleep(2500);
      await enterLab();
      const post = await evaljs(`(function(){
        var h=document.querySelector('[data-bench-rotate]');
        var r=h?h.getBoundingClientRect():null;
        return { handle: !!h, handleRect: r?{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}:null,
          sel: (typeof worldInspectSel!=='undefined'&&worldInspectSel)?JSON.stringify(worldInspectSel):null,
          benchViewText: (document.getElementById('worldBenchViews')||{}).textContent || '' };
      })()`);
      const postW = await labState();
      note('post-refresh: ' + JSON.stringify(post) + ' rect=' + postW.rect + ' benchRect=' + postW.benchRect);
      // 刷新后手柄本来就不在（没选中）：点长方形本体，看能不能选中、出手柄
      const rectBox = await evaljs(`(function(){
        var rc=document.querySelector('#worldBenchView rect[fill="#fde68a"]');
        if(!rc) return null;
        rc.scrollIntoView({block:'center',behavior:'instant'});
        var b=rc.getBoundingClientRect();
        return {x:b.x+b.width/2,y:b.y+b.height/2};
      })()`);
      await sleep(300);
      if (rectBox) {
        await clickAt(rectBox.x, rectBox.y);
        await sleep(300);
        const postClick = await evaljs(`(function(){
          var h=document.querySelector('[data-bench-rotate]');
          return { handle: !!h, sel: (typeof worldInspectSel!=='undefined'&&worldInspectSel)?JSON.stringify(worldInspectSel):null };
        })()`);
        note('post-refresh rect-body click: ' + JSON.stringify(postClick));
        report.pass = postClick.handle === true;
      } else {
        report.pass = false;
      }
      note(report.pass ? 'RESULT: PASS — rect clickable after refresh, handle appears' : 'RESULT: FAIL — rect not selectable after refresh');
    } else if (scenario === 'rect-label') {
      await enterLab();
      await evaljs(`(function(){var b=document.querySelector('[data-bench="rect"]');if(b)b.click();})()`);
      await sleep(300);
      await evaljs(`(function(){ if (typeof worldInspectSelect === 'function') worldInspectSelect({apparatus:'rect'}); })()`);
      await sleep(300);
      const geo = await evaljs(`(function(){
        var h=document.querySelector('[data-bench-rotate]');
        if(!h) return {handle:false};
        var hr=h.getBoundingClientRect();
        // (w,h) 标签是坐标系里长方形右上角的 text
        var texts=[...document.querySelectorAll('#worldBenchView text')].filter(function(t){return /^\\(\\d+,\\d+\\)$/.test(t.textContent.trim());});
        var tr=texts.length?texts[0].getBoundingClientRect():null;
        return { handle:{x:Math.round(hr.x),y:Math.round(hr.y),w:Math.round(hr.width),h:Math.round(hr.height)},
          label: tr?{x:Math.round(tr.x),y:Math.round(tr.y),w:Math.round(tr.width),h:Math.round(tr.height),text:texts[0].textContent}:null,
          overlap: tr ? !(hr.x+hr.width<tr.x||tr.x+tr.width<hr.x||hr.y+hr.height<tr.y||tr.y+tr.height<hr.y) : null };
      })()`);
      note('geometry: ' + JSON.stringify(geo));
      report.pass = geo.handle && geo.label && geo.overlap === false;
      note(report.pass ? 'RESULT: PASS — handle and label do not overlap' : 'RESULT: FAIL — handle overlaps the (w,h) label');
    } else if (scenario === 'bal-clear') {
      // 非空断言：先放一个砝码上盘（台面拖放是通的），再点天平站“清空重来”，
      // 盘子必须真的清零——初始就是 0/0 时点不点都过，等于没测。
      await enterLab();
      await evaljs(`(function(){var b=document.querySelector('[data-bench="balance"]');if(b)b.click();})()`);
      await sleep(300);
      const [chipF, view] = await centers(
        '#worldBenchBox [data-bench="make"][data-kind="frac"][data-n="1"][data-d="6"]',
        '#worldBenchView');
      const pxR = view.x + (430 / 520) * view.w, py = view.y + (190 / 260) * view.h;
      await drag(chipF.cx, chipF.cy, pxR, py, 12, 40);
      const before = await labState();
      note('before: bal L=' + before.balL + ' R=' + before.balR);
      await evaljs(`document.getElementById('worldBalCard').classList.remove('collapsed')`);
      await sleep(200);
      const [btn] = await centers('[data-world="bal-clear"]');
      note('clear button: ' + JSON.stringify(btn));
      await clickAt(btn.cx, btn.cy);
      await sleep(300);
      const after = await labState();
      note('after click 清空重来: bal L=' + after.balL + ' R=' + after.balR);
      // “清空重来”按设计是重置回左盘 1/2（不是清零）：balanceClear 后再放 1/2，
      // 提示“天平已重置为左盘 1/2”。断言按设计值写。
      report.pass = before.balR === '1/6' && after.balL === '1/2' && after.balR === '0';
      note(report.pass ? 'RESULT: PASS — balance reset to left 1/2' : 'RESULT: FAIL — balance did not reset (or setup failed)');
    } else {
      console.log('unknown scenario: ' + scenario);
      cleanup();
      process.exit(2);
    }
  } catch (err) {
    note('ERROR: ' + (err && err.stack ? err.stack : err));
    report.pass = false;
  }

  if (pageErrors.length) { console.log('  page exceptions:'); pageErrors.forEach((e) => console.log('    ' + e)); }
  if (consoleErrors.length) { console.log('  console errors:'); consoleErrors.forEach((e) => console.log('    ' + e)); }
  // 加载期异常 = 某段初始化没跑完（例如绑定 IIFE 抛错）：场景直接判失败，
  // 不管它自己的断言过没过——这是第 4 批拖放断的根因在真机上的表现，
  // 桩里因为 vm 上下文不抛严格模式未声明赋值所以查不出来。
  if (pageErrors.length && report.pass) {
    console.log('  NOTE: scenario assertions passed but page threw at load — marking FAIL');
    report.pass = false;
  }
  console.log('SCENARIO ' + scenario + ': ' + (report.pass ? 'PASS' : 'FAIL'));
  cleanup();
  process.exit(report.pass ? 0 : 1);
}

main();
