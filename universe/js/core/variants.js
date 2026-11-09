/* 参数化与变式（设计 v2 §2.1）：一道题可以带 params，按同一个种子生成确定的一组数，
 * 变式、复习、应用题都用它。build(values) 收到取出来的值。
 * 另：句子卡的结构（explain）和考试时长的默认规则也在这里。 */
(function (G) {
  'use strict';
  const U = G.U;

  // 确定的伪随机（同一个种子 → 同一组数），不依赖 Math.random
  function rng(seed) {
    // 先把种子打散（相邻的种子也要得到不同的数）
    let h = seed >>> 0; h = Math.imul(h ^ (h >>> 16), 0x45d9f3b); h = Math.imul(h ^ (h >>> 16), 0x45d9f3b); h ^= h >>> 16;
    let s = (h >>> 0) || 1;
    return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }

  U.Variants = {
    rng,
    // 从 params 里按范围取整数。params: { name: [min, max] }
    pick(params, seed) {
      const r = rng(seed), out = {};
      for (const k of Object.keys(params || {})) {
        const [lo, hi] = params[k];
        out[k] = lo + Math.floor(r() * (hi - lo + 1));
      }
      return out;
    },
    // 生成第 seed 道变式：返回一份新的题目（id 带种子，build 收到参数）
    instantiate(p, seed) {
      if (!p.params) return p;
      const values = U.Variants.pick(p.params, seed);
      return Object.assign({}, p, {
        id: p.id + '#' + seed, baseId: p.id, values,
        build: () => (p.build ? p.build(values) : null),
      });
    },
    // 句子卡的空数：frame 里每个 “__” 是一个空
    blanks(frame) { return (String(frame || '').match(/__/g) || []).length; },
    // 考试时长：写了用写的；没写按里程碑数 × 2 分钟，最少 3 分钟
    examMinutes(p) {
      if (p.exam && p.exam.minutes) return p.exam.minutes;
      return Math.max(3, 2 * (p.milestones || []).length);
    },
  };

  // lint：参数、句子卡、变式的写法
  const base = U.problemLint;
  U.problemLint = function (p) {
    const r = base(p);
    if (p.params !== undefined) {
      if (!p.params || typeof p.params !== 'object') r.errors.push('params 要是 { 名: [最小, 最大] }');
      else for (const k of Object.keys(p.params)) {
        const v = p.params[k];
        if (!Array.isArray(v) || v.length !== 2 || !Number.isInteger(v[0]) || !Number.isInteger(v[1]) || v[0] > v[1]) r.errors.push('参数 ' + k + ' 的范围要是 [最小整数, 最大整数]');
      }
    }
    if (p.explain !== undefined && p.explain !== null) {
      const f = p.explain.form;
      if (f !== 'cards' && f !== 'free') r.errors.push('explain.form 只能是 cards 或 free');
      if (f === 'cards' && U.Variants.blanks(p.explain.frame) < 1) r.errors.push('句子卡（cards）的 frame 里至少要有一个 “__” 空');
    }
    if (p.variant !== undefined && p.variant !== null && (typeof p.variant.ask !== 'string' || !p.variant.ask)) r.errors.push('variant 要写 ask（变式的问法）');
    return r;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
