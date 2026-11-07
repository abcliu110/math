/* ---------- 动画注册表（§5.1：数据驱动动画注册表） ----------
   350 个新动画不再手写接线：每个动画只在自己的 band 文件里调一次
   registerAnim(...)，导航、面包屑、点页 / 单元页 / 年级页的计数、
   演示页总目录都从这张表现算，不再改 app.js / index.html / styles.css。
   加载顺序（index.html + tools/build-standalone.py）：本文件 → 四个
   band / operations 文件 → math-world.js → bench-views.js → apparatus.js
   → app.js。所以 band 文件在 app.js 之前加载：band 文件的顶层代码
   只能调 registerAnim，绝对不能引用 app.js 的标识符（METHOD_DEMOS、
   NAV_DEFS、animsForPoint 等在那时都不存在）；render 在进入动画视图
   时才由 app.js 调用，那时 app.js 已加载，render 里可以用 app.js 的
   助手（markTried / makeTiers / wireDiscovery），但要加 typeof 守卫。
   注册项格式（band builder 照抄）：
     { key: 'm1a-pair',            // 裸 key：不带 demo- 前缀，只含小写字母数字连字符
       title: '一一对应配对法',    // 标题
       sub: '一句话副文',          // 副文
       grade: 1,                   // 主年级 1–9
       kind: '演示' | '模拟' | '实验',
       points: ['1.1'],            // 挂的知识点 id，必须在 grade-*.js 里真实存在
       group: 'operations',        // 可选：只有 anims-operations.js 的动画写这个字段，
                                   // 总目录里它们单独成一组，不进年级分组
       render: function (el) { ... } }  // 在 el 里建自己的 DOM；所有 id / 变量名
                                            // 都以 key 为前缀防撞（教训：金鸡独立 cg* 与
                                            // 全等 cg* 撞名导致整站 TDZ 崩溃）；做完调用 markTried(key)
   导航 key 是 'demo-' + key。 */
var ANIM_REGISTRY = {};
function registerAnim(a) {
  function bad(msg) {
    if (typeof console !== 'undefined' && console.error) {
      console.error('[anims-registry] 注册失败（该动画不会出现）: ' + msg);
    }
    return false;
  }
  if (!a || typeof a !== 'object') return bad('registerAnim 需要一个对象');
  if (typeof a.key !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(a.key)) {
    return bad('key 非法（只要小写字母数字连字符）: ' + a.key);
  }
  if (ANIM_REGISTRY[a.key]) return bad('key 重复: ' + a.key);
  if (typeof a.title !== 'string' || !a.title) return bad(a.key + ': 缺 title');
  if (typeof a.sub !== 'string' || !a.sub) return bad(a.key + ': 缺 sub');
  if (typeof a.grade !== 'number' || a.grade < 1 || a.grade > 9 || Math.floor(a.grade) !== a.grade) {
    return bad(a.key + ': grade 必须是 1–9 的整数');
  }
  if (a.kind !== '演示' && a.kind !== '模拟' && a.kind !== '实验') {
    return bad(a.key + ': kind 必须是 演示 / 模拟 / 实验');
  }
  if (!Array.isArray(a.points) || !a.points.length) return bad(a.key + ': points 不能为空');
  for (let i = 0; i < a.points.length; i++) {
    if (typeof a.points[i] !== 'string' || !/^\d+\.\d+[a-z]?$/.test(a.points[i])) {
      return bad(a.key + ': points 里有非法 id: ' + a.points[i]);
    }
  }
  if (a.group !== undefined && a.group !== 'operations') {
    return bad(a.key + ': group 只允许写 operations');
  }
  if (typeof a.render !== 'function') return bad(a.key + ': 缺 render 函数');
  ANIM_REGISTRY[a.key] = a;
  return true;
}
