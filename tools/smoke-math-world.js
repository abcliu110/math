// Smoke tests for apps/web/math-world.js (no DOM).
// Run: node tools/smoke-math-world.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let pass = 0, fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('FAIL  ' + name); }
}

const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'apps/web/math-world.js'), 'utf8');
const sandbox = { console: console, Math: Math, JSON: JSON, Object: Object, Array: Array, String: String, Number: Number };
vm.createContext(sandbox);
vm.runInContext(src, sandbox, { filename: 'math-world.js' });
const MW = sandbox.MathWorld;
check('MathWorld loaded', !!MW && !!MW.Q && !!MW.apply);

const Q = MW.Q;
const half = Q.of(1, 2), third = Q.of(1, 3);
const sum = Q.add(half, third);
const naive = Q.reduce({ n: 1 + 1, d: 2 + 3 });
check('1/2+1/3 true = 5/6', Q.str(sum) === '5/6');
check('1/2+1/3 naive = 2/5', Q.str(naive) === '2/5');
check('naive != true', !Q.eq(sum, naive));

let w = MW.create({ balance: { L: [Q.of(1, 2)], R: [] } });
let d = MW.derived(w);
check('balance 1/2 vs empty: not equal', d.balance.equal === false);
let r1 = MW.apply(w, { type: 'balanceAddQty', side: 'R', qty: Q.of(1, 4) });
w = r1.world;
r1 = MW.apply(w, { type: 'balanceAddQty', side: 'R', qty: Q.of(1, 4) });
w = r1.world;
d = MW.derived(w);
check('balance 1/2 vs 1/4+1/4: equal', d.balance.equal === true && MW.goalMet(w, { type: 'balanceEqual' }));

w = MW.create({ numline: { min: 0, max: 2 } });
const mk = MW.apply(w, { type: 'makePiece', piece: { kind: 'num', v: 7 } });
w = mk.world;
const before = JSON.stringify(w.numline);
const bad = MW.apply(w, { type: 'place', pieceId: mk.pieceId, target: 'numline' });
check('numline rejects 7 on [0,2]', bad.ok === false && bad.reason === 'numline-out-of-range');
check('numline reject sets meta flag', bad.world.meta.lastNumlineReject === true);
check('failed place keeps pts empty', bad.world.numline.pts.length === 0);
check('goal numlineRejected', MW.goalMet(bad.world, { type: 'numlineRejected' }));

w = MW.create({ tenframe: { A: 10, B: 10 } });
d = MW.derived(w);
check('tenframe 10+10 sum 20', d.tenframe.sum === 20 && d.tenframe.fullA && d.tenframe.fullB);

w = MW.create({ fracboard: { A: Q.of(1, 2), B: Q.of(1, 3) } });
d = MW.derived(w);
check('fracboard derived true 5/6 naive 2/5', d.fracboard.trueStr === '5/6' && d.fracboard.naiveStr === '2/5');
check('lab fracadd goal needs combine', MW.goalMet(w, MW.LAB_GOALS['q-fracadd']) === false);
w = MW.apply(w, { type: 'fracCombine' }).world;
d = MW.derived(w);
check('lab fracadd goal after fracCombine', MW.goalMet(w, MW.LAB_GOALS['q-fracadd']) === true && d.fracboard.combined);
check('fracCombine emits naive-wrong signal',
  d.signals.some(function (s) { return s.code === 'naive-wrong'; }));

w = MW.create({ chicken: { targetHeads: 35, targetLegs: 94, rabbits: 5 } });
d = MW.derived(w);
check('chicken 5 rabbits -> 30 chickens', d.chicken.chickens === 30);
check('chicken not solved at r=5', d.chicken.solved === false);
w = MW.create({ chicken: { targetHeads: 35, targetLegs: 94, rabbits: 12 } });
d = MW.derived(w);
check('chicken classic 35 heads 94 legs solved at r=12', d.chicken.solved === true && MW.goalMet(w, { type: 'chickenSolved' }));

w = MW.create({ chicken: { targetHeads: 35, targetLegs: 94, rabbits: 0 } });
d = MW.derived(w);
check('chicken r=0 not solved', d.chicken.solved === false);
w = MW.apply(w, { type: 'chickenSetRabbits', rabbits: 12 }).world;
check('chicken set rabbits to 12 solves', MW.goalMet(w, { type: 'chickenSolved' }));

const illegal = MW.apply(w, { type: 'place', pieceId: 'missing', target: 'balance.L' });
check('illegal place does not invent piece', illegal.ok === false && illegal.world === w);

w = MW.LAB_SEEDS['q-balfrac']();
d = MW.derived(w);
check('lab seed balfrac left is 1/2', d.balance.Lstr === '1/2' && d.balance.equal === false);

w = MW.LAB_SEEDS['q-funcline']();
w = MW.apply(w, { type: 'linefnSet', k: -1 }).world;
check('funcline goal k=-1', MW.goalMet(w, MW.LAB_GOALS['q-funcline']));
d = MW.derived(w);
check('negative k emits slope signal', d.signals.some(s => s.code === 'negative-slope'));

// v0.2: piece location + composition bridge + chicken residual
w = MW.create({ tenframe: { A: 7, B: 0 } });
const minted = MW.apply(w, { type: 'tenframeMint' });
check('tenframeMint makes a 7 piece on tray', minted.ok && minted.pieceId &&
  minted.world.pieces[minted.pieceId].v === 7 && minted.world.tray.indexOf(minted.pieceId) >= 0);
w = minted.world;
const placed = MW.apply(w, { type: 'place', pieceId: minted.pieceId, target: 'balance.L' });
check('minted piece places on balance and leaves tray',
  placed.ok && placed.world.balance.L.indexOf(minted.pieceId) >= 0 &&
  placed.world.tray.indexOf(minted.pieceId) < 0 &&
  placed.world.pieces[minted.pieceId].at === 'balance.L');

w = MW.create({ chicken: { targetHeads: 35, targetLegs: 94, rabbits: 0 } });
d = MW.derived(w);
check('chicken residual legGap at all-chicken', d.chicken.legGap === 24 && d.chicken.rabbitsToFixLegs === 12);
check('balance diff is structured Q', (() => {
  const bw = MW.create({ balance: { L: [Q.of(1, 2)], R: [] } });
  const bd = MW.derived(bw);
  return bd.balance.diffStr === '1/2' && bd.balance.leftHeavy === true;
})());
check('MathWorld version is 0.9.x', String(MW.version).indexOf('0.9') === 0);

// v0.8 直线放上实验台：只记在不在台上
let lt = MW.create();
check('bench line starts off the bench', lt.benchLine === false);
lt = MW.apply(lt, { type: 'benchLineToggle' }).world;
check('benchLineToggle puts the line on the bench', lt.benchLine === true);
lt = MW.apply(lt, { type: 'benchLineToggle' }).world;
check('benchLineToggle again takes it off', lt.benchLine === false);
let bt = MW.create();
check('bench balance starts off the bench', bt.benchBalance === false);
bt = MW.apply(bt, { type: 'benchBalanceToggle' }).world;
check('benchBalanceToggle puts the balance on the bench', bt.benchBalance === true);

// v0.7 概率：两个骰子点数之和，分给 A 和 B
let dw = MW.create();
check('dice: 36 outcomes, sum 7 has 6 ways', MW.derived(dw).dice.sums.find(function (x) { return x.sum === 7; }).ways === 6);
check('dice: empty A means A gets 0', MW.derived(dw).dice.pAStr === '0' && MW.derived(dw).dice.fair === false);
let d7 = MW.apply(dw, { type: 'diceToggle', sum: 7 });
check('dice: giving 7 to A makes A 1/6', d7.ok && MW.derived(d7.world).dice.pAStr === '1/6' && MW.derived(d7.world).dice.pBStr === '5/6');
let toggled = MW.apply(d7.world, { type: 'diceToggle', sum: 7 }).world;
check('dice: toggling the same sum again gives it back to B', MW.derived(toggled).dice.pAStr === '0');
let fair = dw;
[2, 3, 5, 6, 7].forEach(function (s) { fair = MW.apply(fair, { type: 'diceToggle', sum: s }).world; });
check('dice: A gets {2,3,5,6,7} = 18/36 and the split is fair', MW.derived(fair).dice.pAStr === '1/2' && MW.derived(fair).dice.fair === true);
check('dice fair goal is met by that split', MW.goalMet(fair, MW.LAB_GOALS['q-fairgame']) === true);
check('dice unfair split shows an unfair signal', MW.derived(d7.world).signals.some(function (s) { return s.code === 'unfair'; }));
check('dice: a sum outside 2 to 12 is refused', MW.apply(dw, { type: 'diceToggle', sum: 1 }).reason === 'bad-sum');

// v0.6 几何：周长 20 的长方形，最大面积是正方形 5×5
let rw = MW.create();
let rd = MW.derived(rw).rect;
check('rect default: perimeter 20, width 1, area 9', rd.perim === 20 && rd.w === 1 && rd.h === 9 && rd.area === 9);
check('rect best for perimeter 20 is 5×5 = 25', rd.best.w === 5 && rd.best.h === 5 && rd.best.area === 25);
check('rect at 1×9 says the area can grow', MW.derived(rw).signals.some(function (s) { return s.code === 'can-grow'; }));
check('rect goal not met at 1×9', MW.goalMet(rw, MW.LAB_GOALS['q-maxarea']) === false);
let sq = MW.apply(rw, { type: 'rectSet', w: 5 });
check('rectSet 5 makes the square 5×5 with area 25', sq.ok && MW.derived(sq.world).rect.isSquare && MW.derived(sq.world).rect.area === 25);
check('rect goal met at the square', MW.goalMet(sq.world, MW.LAB_GOALS['q-maxarea']) === true);
check('rect square shows the max-area signal', MW.derived(sq.world).signals.some(function (s) { return s.code === 'max-area'; }));
check('rectSet 0 is out of range', MW.apply(rw, { type: 'rectSet', w: 0 }).reason === 'rect-range');
check('rectSet 10 leaves height 0, out of range', MW.apply(rw, { type: 'rectSet', w: 10 }).reason === 'rect-range');
check('rectSet 2.5 is refused as a non-integer', MW.apply(rw, { type: 'rectSet', w: 2.5 }).reason === 'bad-number');
let odd22 = MW.create({ rect: { perim: 22, w: 1 } });
check('perimeter 22 has best 5×6 = 30 (not a square)', MW.derived(odd22).rect.best.area === 30 && MW.derived(odd22).rect.best.w === 5);

// v0.5 鸡兔可行性
const feas = MW.derived(MW.create({ chicken: { targetHeads: 35, targetLegs: 94, rabbits: 0 } })).chicken;
check('chicken 35/94 is feasible with 12 rabbits', feas.feasible === true && feas.solutionRabbits === 12);
function chickenSig(h, l) {
  const d = MW.derived(MW.create({ chicken: { targetHeads: h, targetLegs: l, rabbits: 0 } }));
  return { c: d.chicken, sig: d.signals.filter(function (s) { return s.level === 'error'; }) };
}
const odd = chickenSig(35, 95);
check('chicken odd legs has no solution, with a reason and an error signal',
  odd.c.feasible === false && odd.c.infeasibleReason === 'odd-legs' && odd.sig[0].code === 'odd-legs');
check('chicken too many legs is flagged', chickenSig(10, 50).c.infeasibleReason === 'legs-too-many');
check('chicken too few legs is flagged', chickenSig(10, 15).c.infeasibleReason === 'legs-too-few');

// v0.5 过两点定直线
let lp = MW.create();
lp = MW.apply(lp, { type: 'linefnFromPoints', x1: 1, y1: 3, x2: 3, y2: 7 }).world;
check('line through (1,3) and (3,7) is y = 2x + 1', lp.linefn.k === 2 && lp.linefn.b === 1);
const vert = MW.apply(lp, { type: 'linefnFromPoints', x1: 2, y1: 0, x2: 2, y2: 5 });
check('vertical line is refused and leaves the line unchanged', vert.ok === false && vert.reason === 'vertical-line' && vert.world.linefn.k === 2);
const frac = MW.apply(lp, { type: 'linefnFromPoints', x1: 0, y1: 0, x2: 3, y2: 1 }).world;
check('line through (0,0) and (3,1) has slope 1/3', Math.abs(frac.linefn.k - 1 / 3) < 1e-6 && frac.linefn.b === 0);

// v0.5 数字必须是整数：拒绝而不是静默截断
check('Q.of rejects a non-integer numerator', (function () { try { MW.Q.of(1.5, 2); return false; } catch (e) { return true; } })());
check('makePiece refuses a non-integer fraction', MW.apply(MW.create(), { type: 'makePiece', piece: { kind: 'frac', n: 1.5, d: 2 } }).reason === 'bad-number');
check('fracboardSet refuses a non-integer without crashing',
  MW.apply(MW.create({ fracboard: { A: MW.Q.of(1, 2), B: MW.Q.of(1, 3) } }), { type: 'fracboardSet', side: 'A', n: 1.5, d: 2 }).ok === false);

// v0.4 实验台：放上台、合并、拆分、拿走
function mkFrac(w, n, d) {
  const r = MW.apply(w, { type: 'makePiece', piece: { kind: 'frac', n: n, d: d } });
  return r;
}
let bw = MW.create();
let f12 = mkFrac(bw, 1, 2); bw = f12.world;
let put1 = MW.apply(bw, { type: 'benchPut', pieceId: f12.pieceId });
check('bench: put a 1/2 on the bench', put1.ok && MW.derived(put1.world).bench.count === 1);
check('bench: total of one piece is 1/2', MW.derived(put1.world).bench.totalStr === '1/2');
check('bench: putting the same piece twice fails',
  MW.apply(put1.world, { type: 'benchPut', pieceId: f12.pieceId }).reason === 'already-on-bench');
let f13 = mkFrac(put1.world, 1, 3);
let put2 = MW.apply(f13.world, { type: 'benchPut', pieceId: f13.pieceId });
check('bench: 1/2 and 1/3 together are flagged as mixed denominators',
  put2.ok && MW.derived(put2.world).bench.mixedDen === true && MW.derived(put2.world).bench.totalStr === '5/6');
let merged = MW.apply(put2.world, { type: 'benchMerge', ids: [f12.pieceId, f13.pieceId] });
const mv = MW.derived(merged.world).bench;
check('bench: merge makes one piece 5/6 and clears the mixed flag',
  merged.ok && mv.count === 1 && mv.totalStr === '5/6' && mv.mixedDen === false);
check('bench: merge removes the source pieces from the world',
  !merged.world.pieces[f12.pieceId] && !merged.world.pieces[f13.pieceId]);
check('bench: merge needs at least two pieces',
  MW.apply(put2.world, { type: 'benchMerge', ids: [f12.pieceId] }).reason === 'merge-needs-two');

let sp = mkFrac(MW.create(), 1, 2);
let spPut = MW.apply(sp.world, { type: 'benchPut', pieceId: sp.pieceId });
let split3 = MW.apply(spPut.world, { type: 'benchSplit', pieceId: sp.pieceId, k: 3 });
const sv = MW.derived(split3.world).bench;
check('bench: split 1/2 into 3 gives three 1/6 pieces with the same total',
  split3.ok && sv.count === 3 && sv.items.every(function (it) { return it.str === '1/6'; }) && sv.totalStr === '1/2');

let full = MW.create();
const ids = [];
for (let i = 0; i < MW.BENCH_MAX; i++) {
  const r = mkFrac(full, 1, 4); full = r.world; ids.push(r.pieceId);
  full = MW.apply(full, { type: 'benchPut', pieceId: r.pieceId }).world;
}
const extra = MW.apply(full, { type: 'makePiece', piece: { kind: 'num', v: 1 } });
check('bench: a full bench refuses one more piece',
  MW.derived(full).bench.full === true &&
  MW.apply(extra.world, { type: 'benchPut', pieceId: extra.pieceId }).reason === 'bench-full');
check('bench: splitting one piece into 2 on a full bench is refused',
  MW.apply(full, { type: 'benchSplit', pieceId: ids[0], k: 2 }).reason === 'bench-full');

let locked = MW.create({ numline: { min: 0, max: 2 } });
const lk = MW.apply(locked, { type: 'makePiece', piece: { kind: 'num', v: 1 } });
const lkPlace = MW.apply(lk.world, { type: 'place', pieceId: lk.pieceId, target: 'numline' });
check('bench: a piece already on the number line cannot go on the bench',
  MW.apply(lkPlace.world, { type: 'benchPut', pieceId: lk.pieceId }).reason === 'piece-locked');

let tk = MW.apply(put1.world, { type: 'benchTake', pieceId: f12.pieceId });
check('bench: take returns the piece to the free area', tk.ok && tk.world.pieces[f12.pieceId].at === 'free' &&
  MW.derived(tk.world).bench.count === 0);
check('bench: take of a piece not on the bench fails', MW.apply(bw, { type: 'benchTake', pieceId: f12.pieceId }).reason === 'not-on-bench');
check('bench: split range is 2 to 6', MW.apply(put1.world, { type: 'benchSplit', pieceId: f12.pieceId, k: 1 }).reason === 'split-range');

// v0.3: composition — fracMint turns a combined sum into a real piece
w = MW.create({ fracboard: { A: Q.of(1, 2), B: Q.of(1, 3) } });
const noMint = MW.apply(w, { type: 'fracMint' });
check('fracMint refuses before combine', noMint.ok === false && noMint.reason === 'frac-not-combined');
w = MW.apply(w, { type: 'fracCombine' }).world;
const mint = MW.apply(w, { type: 'fracMint' });
check('fracMint makes a 5/6 piece on tray', mint.ok && mint.world.pieces[mint.pieceId].kind === 'frac' &&
  mint.world.pieces[mint.pieceId].n === 5 && mint.world.pieces[mint.pieceId].d === 6);
w = mint.world;
const onBal = MW.apply(w, { type: 'place', pieceId: mint.pieceId, target: 'balance.L' });
check('minted 5/6 places on balance', onBal.ok && onBal.world.balance.L.indexOf(mint.pieceId) >= 0);

// v0.3: procedures — q-fracadd scored, practice vs exam
let p = MW.apply(MW.LAB_SEEDS['q-fracadd'](), { type: 'procedureStart', labId: 'q-fracadd', mode: 'practice' });
check('procedureStart accepted', p.ok && p.world.procedure.labId === 'q-fracadd');
check('procedureStart does not pre-score seeded steps', Object.keys(p.world.steps).length === 0);
let rep = MW.procedureReport(p.world);
check('practice shows hint for first missed step', rep.nextHint === '把 1/2 和 1/3 合到一起' && rep.score === 0 && rep.max === 4);

let pw = MW.apply(p.world, { type: 'fracCombine' }).world;
pw = MW.apply(pw, { type: 'fracMint' }).world;
rep = MW.procedureReport(pw);
check('q-fracadd full procedure scores 4/4', rep.score === 4 && rep.done === true);
check('done procedure has no hint left', rep.nextHint === null);

let ex = MW.apply(MW.LAB_SEEDS['q-fracadd'](), { type: 'procedureStart', labId: 'q-fracadd', mode: 'exam' }).world;
ex = MW.apply(ex, { type: 'fracMint' }).world; // fails: not combined yet
rep = MW.procedureReport(ex);
check('exam mode never shows a hint', rep.nextHint === null && rep.mode === 'exam');
check('exam mode counts failed action as error', rep.errorCount === 1 && rep.errorReasons[0] === 'frac-not-combined');
check('exam mode reports lost steps', rep.lost.length === 3 && rep.score === 0);
ex = MW.apply(ex, { type: 'fracCombine' }).world;
rep = MW.procedureReport(ex);
check('exam partial score after combine (combine + contrast visible, mint lost)',
  rep.score === 2 && rep.lost.length === 1 && rep.lost[0] === '把合起来的结果做成一块分数');

// v0.3: failed numline action still marks the reject step (consequence is the evidence)
let nl = MW.apply(MW.create({ numline: { min: 0, max: 2 } }), { type: 'procedureStart', labId: 'q-numline', mode: 'practice' }).world;
nl = MW.apply(nl, { type: 'makePiece', piece: { kind: 'num', v: 7 } });
nl = MW.apply(nl.world, { type: 'place', pieceId: nl.pieceId, target: 'numline' }).world;
rep = MW.procedureReport(nl);
check('numline reject step counted from failed place', rep.lines[0].got === true && rep.score === 1);

// v0.3: balance procedure
let bp = MW.apply(MW.LAB_SEEDS['q-balfrac'](), { type: 'procedureStart', labId: 'q-balfrac', mode: 'practice' }).world;
bp = MW.apply(bp, { type: 'balanceAddQty', side: 'R', qty: Q.of(1, 4) }).world;
bp = MW.apply(bp, { type: 'balanceAddQty', side: 'R', qty: Q.of(1, 4) }).world;
rep = MW.procedureReport(bp);
check('balfrac procedure scores 3/3 when balanced', rep.score === 3 && rep.done);

// v0.3: unknown lab rejected; funcline/chicken steps reachable
check('procedureStart rejects unknown lab', MW.apply(MW.create(), { type: 'procedureStart', labId: 'nope' }).ok === false);
let fp = MW.apply(MW.LAB_SEEDS['q-funcline'](), { type: 'procedureStart', labId: 'q-funcline', mode: 'practice' }).world;
fp = MW.apply(fp, { type: 'linefnSet', k: -1 }).world;
check('funcline procedure done at k=-1', MW.procedureReport(fp).done);
let cp = MW.apply(MW.LAB_SEEDS['q-chicken'](), { type: 'procedureStart', labId: 'q-chicken', mode: 'practice' }).world;
cp = MW.apply(cp, { type: 'chickenSetRabbits', rabbits: 12 }).world;
check('chicken procedure done at 12 rabbits', MW.procedureReport(cp).done);
check('no procedure means no report', MW.procedureReport(MW.create()) === null);

// v0.3 process scoring: a state that already exists does not earn a step
let seeded = MW.create({ chicken: { targetHeads: 35, targetLegs: 94, rabbits: 12 } });
seeded = MW.apply(seeded, { type: 'procedureStart', labId: 'q-chicken', mode: 'practice' }).world;
let unrelated = MW.apply(seeded, { type: 'linefnSet', b: 8 }).world;
check('solved seed earns no step from an unrelated action', MW.procedureReport(unrelated).score === 0);
check('solved seed: unrelated action is still counted as an op', MW.procedureReport(unrelated).opCount === 1);
let viaRabbits = MW.apply(unrelated, { type: 'chickenSetRabbits', rabbits: 12 }).world;
check('chicken steps credit via chickenSetRabbits in order', MW.procedureReport(viaRabbits).done === true);

// steps earned out of order are blocked until their prerequisite is met
let oo = MW.create({ fracboard: { A: Q.of(1, 2), B: Q.of(1, 3), combined: true } });
oo = MW.apply(oo, { type: 'procedureStart', labId: 'q-fracadd', mode: 'practice' }).world;
oo = MW.apply(oo, { type: 'fracMint' }).world;
let oor = MW.procedureReport(oo);
check('mint blocked: combine was never done by fracCombine', oor.lines[0].got === false && oor.lines[1].got === false);
oo = MW.apply(oo, { type: 'fracCombine' }).world;
oo = MW.apply(oo, { type: 'fracMint' }).world;
oor = MW.procedureReport(oo);
check('after combine, mint credited; contrast credited too', oor.lines[1].got === true && oor.lines[2].got === true);
check('op index is recorded for each credited step', oor.lines[1].op !== null && oor.lines[2].op !== null && oor.opCount === 3);

// v0.9: one persistent world — seedQuestion only re-seeds the question's own apparatus
let sq9 = MW.create();
let sq9Mk1 = MW.apply(sq9, { type: 'makePiece', piece: { kind: 'frac', n: 1, d: 2 } });
sq9 = MW.apply(sq9Mk1.world, { type: 'benchPut', pieceId: sq9Mk1.pieceId }).world;
let sq9Mk2 = MW.apply(sq9, { type: 'makePiece', piece: { kind: 'num', v: 7 } });
sq9 = MW.apply(sq9Mk2.world, { type: 'trayAdd', pieceId: sq9Mk2.pieceId }).world;
sq9 = MW.apply(sq9, { type: 'linefnSet', k: -1, b: 5 }).world;
check('seedQuestion exists', typeof MW.seedQuestion === 'function');
let sq9b = MW.seedQuestion(sq9, 'q-fracadd');
check('seedQuestion keeps the bench across questions', MW.derived(sq9b).bench.count === 1 && MW.derived(sq9b).bench.items[0].str === '1/2');
check('seedQuestion keeps the tray across questions', MW.derived(sq9b).trayCount === 1);
check('seedQuestion keeps unrelated apparatus (linefn) across questions', sq9b.linefn.k === -1 && sq9b.linefn.b === 5);
check('seedQuestion resets the question apparatus (fracboard 1/2 + 1/3)',
  sq9b.fracboard.A.n === 1 && sq9b.fracboard.A.d === 2 && sq9b.fracboard.B.n === 1 && sq9b.fracboard.B.d === 3);
check('seedQuestion does not mutate the input world', sq9.linefn.k === -1 && MW.derived(sq9).bench.count === 1);
check('seedQuestion with unknown qid returns the same world', MW.seedQuestion(sq9, 'nope') === sq9);

// v0.9: reseeding the balance swaps pan pieces without leaking the old ones
let sq9B = MW.LAB_SEEDS['q-balfrac']();
const oldPan9 = sq9B.balance.L[0];
sq9B = MW.seedQuestion(sq9B, 'q-balfrac');
check('reseeding the balance drops the old pan pieces', sq9B.pieces[oldPan9] === undefined);
check('reseeding the balance puts a fresh 1/2 on the left',
  sq9B.balance.L.length === 1 && MW.derived(sq9B).balance.Lstr === '1/2');

// v0.9: setPiece changes a piece's value in place
let sp9 = MW.create();
let sp9Mk = MW.apply(sp9, { type: 'makePiece', piece: { kind: 'frac', n: 1, d: 2 } });
sp9 = MW.apply(sp9Mk.world, { type: 'benchPut', pieceId: sp9Mk.pieceId }).world;
let sp9Set = MW.apply(sp9, { type: 'setPiece', pieceId: sp9Mk.pieceId, piece: { kind: 'frac', n: 3, d: 4 } });
check('setPiece changes a bench fraction in place', sp9Set.ok && MW.derived(sp9Set.world).bench.items[0].str === '3/4');
check('setPiece keeps the same piece id and slot', !!sp9Set.world.pieces[sp9Mk.pieceId] && sp9Set.world.bench[0] === sp9Mk.pieceId);
check('setPiece refuses denominator 0', MW.apply(sp9, { type: 'setPiece', pieceId: sp9Mk.pieceId, piece: { kind: 'frac', n: 1, d: 0 } }).ok === false);
check('setPiece refuses a negative numerator', MW.apply(sp9, { type: 'setPiece', pieceId: sp9Mk.pieceId, piece: { kind: 'frac', n: -1, d: 2 } }).ok === false);
check('setPiece refuses a denominator above 8', MW.apply(sp9, { type: 'setPiece', pieceId: sp9Mk.pieceId, piece: { kind: 'frac', n: 1, d: 9 } }).ok === false);
let sp9Num = MW.apply(sp9, { type: 'makePiece', piece: { kind: 'num', v: 2 } });
sp9 = MW.apply(sp9Num.world, { type: 'place', pieceId: sp9Num.pieceId, target: 'numline' }).world;
check('setPiece refuses a piece locked on the number line',
  MW.apply(sp9, { type: 'setPiece', pieceId: sp9Num.pieceId, piece: { kind: 'num', v: 5 } }).reason === 'piece-locked');

// v0.9 addendum (NB 走访 §2)：setPiece 改名——改称呼不动数值
let sp9Rn = MW.apply(sp9Set.world, { type: 'setPiece', pieceId: sp9Mk.pieceId, name: '小明的第一块' });
check('setPiece renames a bench piece without changing its value',
  sp9Rn.ok && sp9Rn.world.pieces[sp9Mk.pieceId].name === '小明的第一块' &&
  MW.derived(sp9Rn.world).bench.items[0].str === '3/4' && sp9Rn.world.bench[0] === sp9Mk.pieceId);
check('benchView carries the piece name to the shelf chip',
  MW.derived(sp9Rn.world).bench.items[0].name === '小明的第一块');
check('inspect reports the piece name (floating label)',
  MW.inspect(sp9Rn.world, { piece: sp9Mk.pieceId }).name === '小明的第一块');
let sp9Rn2 = MW.apply(sp9Rn.world, { type: 'setPiece', pieceId: sp9Mk.pieceId, name: '   ' });
check('renaming to a blank name clears back to the value label',
  sp9Rn2.ok && !sp9Rn2.world.pieces[sp9Mk.pieceId].name &&
  MW.inspect(sp9Rn2.world, { piece: sp9Mk.pieceId }).name === '3/4');
let sp9Rn3 = MW.apply(sp9, { type: 'setPiece', pieceId: sp9Num.pieceId, name: '数轴上的 2' });
check('a locked piece can still be renamed (name is not a value)',
  sp9Rn3.ok && sp9Rn3.world.pieces[sp9Num.pieceId].name === '数轴上的 2');

// v0.9: bench rect toggle
let rt9 = MW.apply(MW.create(), { type: 'benchRectToggle' }).world;
check('benchRectToggle puts the rectangle on the bench', rt9.benchRect === true);
check('benchRectToggle again takes it off', MW.apply(rt9, { type: 'benchRectToggle' }).world.benchRect === false);

// v0.9: inspect() — every object reports its adjustable properties
check('inspect exists', typeof MW.inspect === 'function');
let ins9 = MW.inspect(MW.LAB_SEEDS['q-funcline'](), { apparatus: 'linefn' });
check('linefn inspector: k and b, with ranges', ins9 && ins9.props.length === 2 &&
  ins9.props[0].key === 'k' && ins9.props[0].min === -3 && ins9.props[0].max === 4 &&
  ins9.props[1].key === 'b' && ins9.props[1].min === 0 && ins9.props[1].max === 15);
check('linefn inspector state shows the formula', ins9.state === 'y = 2x + 8');
let ins9R = MW.inspect(MW.LAB_SEEDS['q-maxarea'](), { apparatus: 'rect' });
check('rect inspector: only width is adjustable, length follows', ins9R && ins9R.props.length === 1 &&
  ins9R.props[0].key === 'w' && ins9R.props[0].min === 1 && ins9R.props[0].max === 9);
check('rect inspector state shows width, length and area', ins9R.state === '宽 1，长 9，面积 9');
let ins9F = MW.inspect(MW.LAB_SEEDS['q-fracadd'](), { apparatus: 'fracboard' });
check('fracboard inspector: 4 props (A/B numerator/denominator)', ins9F && ins9F.props.length === 4);
let ins9P = MW.inspect(sp9Set.world, { piece: sp9Mk.pieceId });
check('bench fraction inspector: numerator and denominator', ins9P && ins9P.title === '分数条' && ins9P.props.length === 2 && ins9P.state === '3/4');

// v0.9: PART_BOX — five domain groups, no junk drawer
check('PART_BOX has five groups: 数/分数/形/量/关系',
  MW.PART_BOX && MW.PART_BOX.length === 5 &&
  MW.PART_BOX.map(function (g) { return g.label; }).join('') === '数分数形量关系');
check('PART_BOX number cards include 10', MW.PART_BOX[0].parts.some(function (p) { return p.kind === 'num' && p.v === 10; }));
check('PART_BOX fraction bars include 2/3 and 3/4',
  MW.PART_BOX[1].parts.some(function (p) { return p.kind === 'frac' && p.n === 2 && p.d === 3; }));
check('PART_BOX shape group holds the rectangle tool',
  MW.PART_BOX[2].parts[0].kind === 'tool' && MW.PART_BOX[2].parts[0].id === 'rect');
check('PART_BOX measure group holds weights', MW.PART_BOX[3].parts.every(function (p) { return p.kind === 'weight'; }));
check('PART_BOX relation group holds the line and the balance',
  MW.PART_BOX[4].parts.map(function (p) { return p.id; }).join(',') === 'line,balance');

// v0.9: procedure steps name their bench card (next-step highlight target)
check('procedure steps carry a target card',
  MW.LAB_PROCEDURES['q-fracadd'].steps[0].target === 'worldFracCard' &&
  MW.LAB_PROCEDURES['q-fracadd'].steps[1].target === 'worldBenchCard' &&
  MW.LAB_PROCEDURES['q-chicken'].steps[0].target === 'worldChickenCard');

// balance: a seeded 1/2 on the left is not a step; adding right is
let bal2 = MW.apply(MW.LAB_SEEDS['q-balfrac'](), { type: 'procedureStart', labId: 'q-balfrac', mode: 'practice' }).world;
bal2 = MW.apply(bal2, { type: 'balanceClear' }).world;
check('clearing balance does not earn steps', MW.procedureReport(bal2).score === 0);

console.log('\nmath-world: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
