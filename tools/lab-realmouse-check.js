// Real-mouse check for the lab page (apps/web/lab-nb.html), driven through the Chrome DevTools Protocol.
// Usage: node tools/lab-realmouse-check.js   (needs Microsoft Edge installed; prints PASS/FAIL per check)
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9333;
const userDir = fs.mkdtempSync(path.join(os.tmpdir(), 'labcdp-'));
const url = 'file:///' + path.resolve(__dirname, '..', 'apps', 'web', 'lab-nb.html').split(path.sep).join('/');

const edge = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${PORT}`, '--window-size=1400,900',
  `--user-data-dir=${userDir}`, '--no-first-run', url], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws, nextId = 1; const pending = new Map();

async function connect() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = list.find(t => t.type === 'page' && t.url.includes('lab-nb'));
      if (page) return page.webSocketDebuggerUrl;
    } catch (e) { /* not up yet */ }
    await sleep(500);
  }
  throw new Error('devtools did not start');
}

function send(method, params = {}) {
  const id = nextId++;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function evalJs(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error('eval failed: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
  return r.result.value;
}

async function mouse(type, x, y, buttons = 0) {
  await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons, clickCount: type === 'mousePressed' || type === 'mouseReleased' ? 1 : 0 });
}

// drag from (x1,y1) to (x2,y2) with real mouse events in several steps
async function drag(x1, y1, x2, y2, steps = 14) {
  await mouse('mouseMoved', x1, y1);
  await mouse('mousePressed', x1, y1, 1);
  for (let i = 1; i <= steps; i++) {
    const x = x1 + (x2 - x1) * i / steps, y = y1 + (y2 - y1) * i / steps;
    await mouse('mouseMoved', x, y, 1);
    await sleep(15);
  }
  return () => mouse('mouseReleased', x2, y2, 0);
}

const rectOf = sel => evalJs(`(function(){const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}})()`);

const results = [];
function check(name, ok, extra = '') { results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`); }

(async () => {
  try {
    ws = new WebSocket(await connect());
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    ws.onmessage = ev => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); }
    };
    await send('Page.enable'); await send('Runtime.enable');
    await sleep(1500);

    // build a scene: a number 7, a number 3, an adder, a number line, a rectangle (area), a balance, a circle
    await evalJs(`(function(){S=blankScene();D=evaluate(S);sel=null;
      window.__ids={n1:addEnt(S,'num',60,60,{v:7}),n2:addEnt(S,'num',60,200,{v:3}),ad:addEnt(S,'adder',300,120,{op:0}),
        nl:addEnt(S,'numline',120,340,{min:0,max:12}),rc:addEnt(S,'rect',60,470,{w:2,h:3}),bal:addEnt(S,'balance',700,330,{}),
        cir:addEnt(S,'circle',520,40,{r:2}),tb:addEnt(S,'table',900,40,{a:12,b:8,c:15,d:9,which:0})};
      D=evaluate(S);render();fit();return true})()`);
    await sleep(300);
    const I = await evalJs('window.__ids');

    // 1. drag a real link: number 7 -> adder
    const p1 = await rectOf(`circle.port-out[data-port="${I.n1}"]`);
    const body = await rectOf(`g.ent[data-ent="${I.ad}"] .ent-body`);
    let release = await drag(p1.x, p1.y, body.x, body.y);
    await release();
    await sleep(200);
    const linked = await evalJs(`S.links.some(l=>l.from==='${I.n1}'&&l.to==='${I.ad}')`);
    check('real drag: number -> adder makes a link', linked);

    // 2. drag an area rectangle over the balance: refused, with a reason next to the pointer
    const pr = await rectOf(`circle.port-out[data-port="${I.rc}"]`);
    const bb = await rectOf(`g.ent[data-ent="${I.bal}"] .ent-body`);
    release = await drag(pr.x, pr.y, bb.x, bb.y);
    await sleep(120);
    const why = await evalJs(`(function(){const g=document.getElementById('ghost');return g&&g.style.display==='block'?g.textContent:''})()`);
    const dropNo = await evalJs(`document.querySelector('g.ent[data-ent="${I.bal}"]').classList.contains('drop-no')`);
    await release();
    await sleep(150);
    const noLink = await evalJs(`!S.links.some(l=>l.from==='${I.rc}'&&l.to==='${I.bal}')`);
    check('area over balance: marked refused', dropNo === true);
    check('area over balance: reason shown near pointer', /称重量/.test(why), JSON.stringify(why));
    check('area over balance: no link made', noLink);

    // 3. multi-port: drag the table\'s "mean" port onto the number line
    const pm = await rectOf(`circle.port-out[data-port="${I.tb}"][data-fport="mean"]`);
    const nb = await rectOf(`g.ent[data-ent="${I.nl}"] .ent-body`);
    release = await drag(pm.x, pm.y, nb.x, nb.y);
    await release();
    await sleep(200);
    const dbg = await evalJs(`JSON.stringify({links:S.links.map(l=>[l.from,l.to,l.fromPort||null]),portAt:(function(){const e=document.elementFromPoint(${pm.x},${pm.y});return e?(e.tagName+' '+(e.getAttribute('data-port')||'')+' '+(e.getAttribute('data-fport')||'')):null})(),ports:[...document.querySelectorAll('circle[data-fport]')].map(c=>c.getAttribute('data-port')+'/'+c.getAttribute('data-fport')+'@'+c.getAttribute('cy'))})`);
    const mp = await evalJs(`S.links.find(l=>l.from==='${I.tb}'&&l.to==='${I.nl}')`);
    check('multi-port: link records the mean port', !!mp && mp.fromPort === 'mean', JSON.stringify(mp));

    // 4. select the circle with a real click, press its bind button, then drag a number onto the button
    const cb = await rectOf(`g.ent[data-ent="${I.cir}"] .ent-body`);
    await mouse('mouseMoved', cb.x, cb.y); await mouse('mousePressed', cb.x, cb.y, 1); await mouse('mouseReleased', cb.x, cb.y, 0);
    await sleep(200);
    const cardOpen = await evalJs('cardOpen && sel===\'' + I.cir + '\'');
    const bindBtn = await rectOf('#card [data-bindpick="r"]');
    await mouse('mouseMoved', bindBtn.x, bindBtn.y); await mouse('mousePressed', bindBtn.x, bindBtn.y, 1); await mouse('mouseReleased', bindBtn.x, bindBtn.y, 0);
    await sleep(200);
    const pickState = await evalJs('!!bindPick');
    const pn = await rectOf(`circle.port-out[data-port="${I.n2}"]`);
    const bb2 = await rectOf('#card [data-bindpick="r"]');
    if (bb2) { release = await drag(pn.x, pn.y, bb2.x, bb2.y); await release(); }
    await sleep(250);
    const bound = await evalJs(`(S.binds||[]).some(b=>b.to==='${I.cir}'&&b.k==='r'&&b.from==='${I.n2}')`);
    check('card: select circle, press bind button', cardOpen && pickState, `cardOpen=${cardOpen} pick=${pickState}`);
    check('card: drag number onto bind button binds radius', bound);
    const radius = await evalJs(`S.entities['${I.cir}'].props.r`);
    check('bound radius follows the number (3)', radius === 3, 'r=' + radius);

    // 5. variable by name: select the multiplier, press its bind button, then press the name of a number card
    const mu = await evalJs(`(function(){const id=addEnt(S,'mul',700,600,{times:1});const a=addEnt(S,'num',60,600,{v:7});act({t:'link',from:a,to:id});D=evaluate(S);render();fit();return id})()`);
    await sleep(250);
    const mb = await evalJs(`(function(){const e=document.querySelector('g.ent[data-ent="${mu}"] .ent-body');if(!e)return null;const r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}})()`);
    if (mb) { await mouse('mouseMoved', mb.x, mb.y); await mouse('mousePressed', mb.x, mb.y, 1); await mouse('mouseReleased', mb.x, mb.y, 0); }
    await sleep(200);
    const tp = await rectOf('#card [data-bindpick="times"]');
    if (tp) { await mouse('mouseMoved', tp.x, tp.y); await mouse('mousePressed', tp.x, tp.y, 1); await mouse('mouseReleased', tp.x, tp.y, 0); }
    await sleep(200);
    const vb = await rectOf('#card [data-bindfrom]');
    if (vb) { await mouse('mouseMoved', vb.x, vb.y); await mouse('mousePressed', vb.x, vb.y, 1); await mouse('mouseReleased', vb.x, vb.y, 0); }
    await sleep(250);
    const times = await evalJs(`S.entities['${mu}'].props.times`);
    check('variable by name: bind button then name button binds times to the number 7', times === 7, 'times=' + times);

    // 6. device attributes and the time dimension, checked on the engine
    const attrs = await evalJs(`(function(){
      const out={};
      const m=addEnt(S,'mul',100,700,{times:3}), x1=addEnt(S,'num',100,800,{v:2}), x2=addEnt(S,'num',300,800,{v:5});
      act({t:'link',from:x1,to:m});act({t:'link',from:x2,to:m});D=evaluate(S);out.mulTimes3=qs(D[m].value);
      const dv=addEnt(S,'div',500,700,{mode:1}), d1=addEnt(S,'num',500,800,{v:7}), d2=addEnt(S,'num',700,800,{v:3});
      act({t:'link',from:d1,to:dv,slot:'L'});act({t:'link',from:d2,to:dv,slot:'R'});D=evaluate(S);out.divRemainder=qs(D[dv].value);
      const cl=addEnt(S,'clock',900,700,{h:3,m:15});D=evaluate(S);out.clockOut=D[cl]&&D[cl].value?qs(D[cl].value):'none';
      const bl=addEnt(S,'balance',1100,700,{});const r1=act({t:'link',from:cl,to:bl,slot:'L'});out.clockOnBalance=r1.ok?'ALLOWED':r1.why;
      out.balanceSensDefault=S.entities[bl].props.sens;
      return JSON.stringify(out)})()`);
    const a = JSON.parse(attrs);
    check('multiplier: product times its extra factor (2*5*3=30)', a.mulTimes3 === '30', a.mulTimes3);
    check('divider remainder mode: 7 remainder 3 = 1', a.divRemainder === '1', a.divRemainder);
    check('clock gives minutes after 0:00 (3:15 = 195)', a.clockOut === '195', a.clockOut);
    check('clock refused on the balance (time is not weighed)', a.clockOnBalance.indexOf('时间') >= 0, a.clockOnBalance);
    check('balance has a sensitivity attribute, default 14', a.balanceSensDefault === 14, String(a.balanceSensDefault));

    // 7. two-finger pinch on the stage zooms the view in (real touch events)
    const zc = await evalJs('(function(){ fit(); return view.z })()');
    await sleep(150);
    const cen = await rectOf('#stage');
    await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cen.x - 40, y: cen.y, id: 1 }, { x: cen.x + 40, y: cen.y, id: 2 }] });
    for (let i = 1; i <= 8; i++) {
      await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cen.x - 40 - 6 * i, y: cen.y, id: 1 }, { x: cen.x + 40 + 6 * i, y: cen.y, id: 2 }] });
      await sleep(20);
    }
    await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(150);
    const zn = await evalJs('view.z');
    check('two-finger pinch zooms the stage in', zn > zc * 1.5, `${zc.toFixed(2)} -> ${zn.toFixed(2)}`);
  } catch (e) {
    results.push('ERROR ' + e.message);
  } finally {
    console.log(results.join('\n'));
    try { ws && ws.close(); } catch (e) { }
    edge.kill();
  }
})();
