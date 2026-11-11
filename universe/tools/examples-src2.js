/* 综合示例的描述（第二批：把还没出现在示例里的器材也用上）。格式同 tools/examples-src.js，另外：
 *   puts = [[子, 父, 槽]]：把器材放进容器（几何工作区的 items 槽）。
 * 板子类器材（竖式台、天平、汉诺塔……）自己有内部状态，这里用它们的初始状态，把它们对外的输出口接到读数器上。 */
'use strict';
const m = (role, label, digits) => [role, 'meter', { digits: digits === undefined ? 0 : digits, label }];

const BASE = [
  {
    id: 'ex-shapes-world', grade: 8, domain: '图形', title: '综合 · 图形世界：平面、立体、角、相似、球面、几何工作区',
    hook: '三角形、四边形、圆、角、立体、展开图、相似与影子、钉板、球面三角形、出租车几何……每种图形器材把自己的数读到读数器上；同类的两个再用比较器对一对（三角形的面积、长方形和平行四边形的面积）；几何工作区里的三个点围成多边形，面积读数接在后面。',
    ents: [
      // 角与三角形
      ['an', 'angles', { A: 50, B: 60 }], m('mC', '第三个角'), m('mext', '外角'),
      ['tr', 'tri', { a: 3, b: 4, c: 5 }], m('mta', '三角形面积'), m('mtp', '周长'),
      ['ft', 'ftri', {}], m('mft', '可编辑三角形面积'), ['cmpT', 'compare', {}],
      // 四边形
      ['rc', 'rect', { w: 4, h: 3 }], m('mrc', '长方形面积'), m('mrp', '长方形周长'),
      ['pg', 'parallelogram', { b: 4, h: 3, s: 1 }], m('mpg', '平行四边形面积'), ['cmpR', 'compare', {}],
      ['fq', 'fquad', {}], m('mfq', '四边形面积'),
      // 圆与角的度量
      ['ci', 'circle', { r: 3 }], m('mci', '圆的面积', 2), ['ca', 'circle-angle', { center_angle: 80 }], m('mca', '圆周角'),
      ['pr', 'protractor-read', { angle: 60 }], m('mdeg', '量角器读数'), ['tt', 'trig-table', { angle: 30 }],
      // 立体
      ['cb', 'cuboid', { l: 3, w: 2, h: 4 }], m('mv', '体积'), m('ms', '表面积'), m('me', '棱数'),
      ['cu', 'cubes', {}], m('mcv', '小方块体积'), ['vw', 'views', {}], m('mvw', '三视图的块数'),
      ['nt', 'net', {}], m('mnt', '展开图能折吗'), ['fd', 'fold', {}], m('mfd', '折痕两边重合吗'),
      // 相似、测量、几何的其他模型
      ['sc', 'scale', {}], m('msc', '放大后的面积'), ['sh', 'shadow', {}], m('msh', '树高'),
      ['ds', 'dissect', {}], m('mds', '剪拼的面积'), ['gb', 'geoboard', {}], m('mgb', '钉板面积'),
      ['po', 'polygon', { n: 6 }], m('mpo', '内角和'), m('mpe', '每个内角'),
      ['cv', 'curved', {}], m('mcvd', '弯曲空间的角和'), ['sp', 'spheretri', {}], m('msp', '球面三角形的角和'),
      ['tx', 'taxi', {}], m('mtx', '出租车几何'), ['tu', 'turtle', {}], m('mtu', '海龟走回起点'),
      ['cp', 'compass', {}], m('mcp', '尺规作图'), ['op', 'optimize', {}], m('mop', '最优值'),
      // 几何工作区：三个点围成多边形，面积读数接在后面
      ['ws', 'gworkspace', { title: '几何工作区' }],
      ['pa', 'gpt', { x: 0, y: 0, mark: 'A' }], ['pb', 'gpt', { x: 4, y: 0, mark: 'B' }], ['pc', 'gpt', { x: 0, y: 3, mark: 'C' }],
      ['pl', 'gpoly', {}], ['ga', 'garea', {}], m('mwa', '多边形面积'),
    ],
    puts: [['pa', 'ws', 'items'], ['pb', 'ws', 'items'], ['pc', 'ws', 'items'], ['pl', 'ws', 'items']],
    links: [
      ['an', 'mC', 'v', 'C'], ['an', 'mext', 'v', 'ext'],
      ['tr', 'mta', 'v', 'area'], ['tr', 'mtp', 'v', 'perim'], ['ft', 'mft', 'v', 'area'], ['tr', 'cmpT', 'a', 'area'], ['ft', 'cmpT', 'b', 'area'],
      ['rc', 'mrc', 'v', 'area'], ['rc', 'mrp', 'v', 'perim'], ['pg', 'mpg', 'v', 'area'], ['rc', 'cmpR', 'a', 'area'], ['pg', 'cmpR', 'b', 'area'],
      ['fq', 'mfq', 'v', 'area'],
      ['ci', 'mci', 'v', 'area'], ['ca', 'mca', 'v', 'inscribed'], ['pr', 'mdeg', 'v', 'deg'],
      ['cb', 'mv', 'v', 'vol'], ['cb', 'ms', 'v', 'surf'], ['cb', 'me', 'v', 'edges'],
      ['cu', 'mcv', 'v', 'volume'], ['vw', 'mvw', 'v', 'total'], ['nt', 'mnt', 'v', 'foldable'], ['fd', 'mfd', 'v', 'same'],
      ['sc', 'msc', 'v', 'area'], ['sh', 'msh', 'v', 'height'], ['ds', 'mds', 'v', 'area'], ['gb', 'mgb', 'v', 'area'],
      ['po', 'mpo', 'v', 'sum'], ['po', 'mpe', 'v', 'each'], ['cv', 'mcvd', 'v', 'sum'], ['sp', 'msp', 'v', 'sum'],
      ['tx', 'mtx', 'v', 'count'], ['tu', 'mtu', 'v', 'closed'], ['cp', 'mcp', 'v', 'ok'], ['op', 'mop', 'v', 'best'],
      ['pa', 'pl', 'pts', 'p'], ['pb', 'pl', 'pts', 'p'], ['pc', 'pl', 'pts', 'p'], ['pl', 'ga', 'f', 'f'], ['ga', 'mwa', 'v', 's'],
    ],
  },
  {
    id: 'ex-number-boards', grade: 6, domain: '数与运算', title: '综合 · 数与关系的工作台：竖式、线段图、倒水、点阵、同余钟、质因数、方程与交点',
    hook: '竖式工作台、列式、线段图、量杯倒水、点阵、分数面积、同余钟、质因数积木、数轴、数列、费用方案、天平、解方程天平、变量盒、代数砖、逼近器，再加两条直线的交点。每个把自己的结果读到读数器上；线段图和解方程天平产生的方程交给式子工作台去检查。',
    ents: [
      ['ab', 'arithbench', {}], m('mab', '竖式的结果'), ['cl', 'colbench', {}], m('mcl', '竖式（列）的答案'),
      ['bm', 'barmodel', {}], m('mbm', '线段图的答案'), ['wb1', 'exprbench', { label: '线段图的方程' }],
      ['po', 'pour', {}], m('mpo', '倒完以后的总量'), ['ar', 'array', { rows: 3, cols: 4 }], m('mar', '点阵一共几个点'),
      ['fa', 'fracarea', {}], m('mfa', '分数面积的总格数'), ['mc', 'modclock', {}], m('mmc', '同余钟的位置'),
      ['pb', 'primeblocks', { a: 12, b: 18 }], m('mgcd', '最大公约数'), m('mlcm', '最小公倍数'),
      ['n7', 'num', { n: 7 }], ['nl', 'numline', {}], m('mnl', '数轴上的数'),
      ['nth', 'nth', {}], m('mnth', '第 n 项'), ['nw', 'newop', {}], m('mnw', '换一种运算（证据等级）'),
      ['cp', 'costplan', {}], m('mcp', '两个套餐的平衡点'),
      ['n12a', 'num', { n: 12 }], ['n12b', 'num', { n: 12 }], ['bal', 'balance', {}], m('mbd', '天平两边差多少'),
      ['es', 'eqscale', {}], m('mes', '解方程天平解出了吗'), ['wb2', 'exprbench', { label: '天平的方程' }],
      ['vr', 'variable', { left: '2*x+1', right: '7' }], m('mvh', '变量盒里有几个 x 使两边相等'),
      ['tl', 'tiles', {}], m('mtl', '代数砖拼成长方形'), ['ap', 'approach', {}], m('map', '逼近的当前值', 3),
      ['l1', 'line', { k: 1, b: 0 }], ['l2', 'line', { k: -1, b: 4 }], ['cr', 'cross', {}], m('mcx', '交点的 x'), m('mcy', '交点的 y'),
      ['dd', 'deduce', {}],
    ],
    links: [
      ['ab', 'mab', 'v', 'result'], ['cl', 'mcl', 'v', 'ans'], ['bm', 'mbm', 'v', 'answer'], ['bm', 'wb1', 'e', 'model'],
      ['po', 'mpo', 'v', 'total'], ['ar', 'mar', 'v', 'n'], ['fa', 'mfa', 'v', 'total'], ['mc', 'mmc', 'v', 'pos'],
      ['pb', 'mgcd', 'v', 'gcd'], ['pb', 'mlcm', 'v', 'lcm'],
      ['n7', 'nl', 'v'], ['nl', 'mnl', 'v', 'n'], ['nth', 'mnth', 'v', 'v'], ['nw', 'mnw', 'v', 'lv'], ['cp', 'mcp', 'v', 'breakeven'],
      ['n12a', 'bal', 'L'], ['n12b', 'bal', 'R'], ['bal', 'mbd', 'v', 'diff'],
      ['es', 'mes', 'v', 'solved'], ['es', 'wb2', 'e', 'eq'], ['vr', 'mvh', 'v', 'hits'], ['tl', 'mtl', 'v', 'rect'], ['ap', 'map', 'v', 'value'],
      ['l1', 'cr', 'f', 'f'], ['l2', 'cr', 'g', 'f'], ['cr', 'mcx', 'v', 'x'], ['cr', 'mcy', 'v', 'y'],
    ],
  },
  {
    id: 'ex-proof-lab', grade: 9, domain: '关系', title: '综合 · 证明与游戏：猜想、扫描、反例、归纳、脚手架、不变量、取石子、汉诺塔、一笔画',
    hook: '证明类器材各自给出“证据等级”：猜想板、参数扫描器、反例构造器、归纳阶梯、证明脚手架、不变量追踪器、证明排序……证据检查器读脚手架、归纳、不变量的等级，判断够不够；找错台、函数机、猜规则、取石子、汉诺塔、一笔画这些小游戏，把各自的成绩读到读数器上。',
    ents: [
      ['sf', 'scaffold', {}], ['pc1', 'proofcheck', { want: 1, label: '脚手架' }],
      ['in', 'induction', {}], ['pc2', 'proofcheck', { want: 1, label: '归纳' }],
      ['iv', 'invariant', { change: 0, times: 4, start: 5 }], ['pc3', 'proofcheck', { want: 1, label: '不变量' }],
      ['cb', 'conjecture_board', {}], m('mcb', '猜想板（证据等级）'), ['sn', 'scanner', {}], m('msn', '扫描器（证据等级）'),
      ['ce', 'counterex', {}], m('mce', '反例构造器（证据等级）'), ['ps', 'proofsort', {}], m('mps', '证明排序（证据等级）'),
      ['as', 'asn', {}], m('mas', '总是/有时/从不（证据等级）'), ['cj', 'conjecture', {}], m('mcj', '猜想：测过的个数'),
      ['fb', 'findbug', {}], m('mfb', '找错台：找到了吗'), ['fm', 'fmachine', {}], m('mfm', '函数机：斜率'),
      ['gr', 'guessrule', {}], m('mgr', '猜规则：试了几次'), ['tw', 'twoways', {}], m('mtw', '两种解法（证据等级）'),
      ['nm', 'nim', {}], m('mnm', '取石子：先手能赢吗'), ['hn', 'hanoi', { n: 4 }], m('mhn', '汉诺塔：最少几步'),
      ['eu', 'euler', {}], m('meu', '一笔画：奇点个数'),
    ],
    links: [
      ['sf', 'pc1', 'lv', 'lv'], ['in', 'pc2', 'lv', 'lv'], ['iv', 'pc3', 'lv', 'lv'],
      ['cb', 'mcb', 'v', 'lv'], ['sn', 'msn', 'v', 'lv'], ['ce', 'mce', 'v', 'lv'], ['ps', 'mps', 'v', 'lv'], ['as', 'mas', 'v', 'lv'], ['cj', 'mcj', 'v', 'tested'],
      ['fb', 'mfb', 'v', 'found'], ['fm', 'mfm', 'v', 'slope'], ['gr', 'mgr', 'v', 'tried'], ['tw', 'mtw', 'v', 'lv'],
      ['nm', 'mnm', 'v', 'firstWins'], ['hn', 'mhn', 'v', 'min'], ['eu', 'meu', 'v', 'odd'],
    ],
  },
  {
    id: 'ex-chance-lab', grade: 9, domain: '统计与概率', title: '综合 · 概率实验室：摸球、树状图、枚举、数据图表台、骰子与直方图',
    hook: '摸球袋每拍摸一个球，直方图记下结果；树状图算出每条路径的概率；系统枚举器数清所有可能；数据图表台读出斜率和截距。走 10 拍后看结果。',
    run: 10,
    ents: [
      ['bg', 'bag', { red: 3, white: 2 }], ['hb', 'hist', { lo: 0, hi: 1, mode: 0 }], m('mhb', '摸了几次'), ['sb', 'stats', { want: 0, digits: 2, minN: 1 }], m('msb', '摸到红球的比例', 2),
      ['pt', 'ptree', {}], m('mpt', '树状图：这个事件的概率', 3), m('mptn', '树状图：路径条数'),
      ['en', 'enumerator', {}], m('men', '枚举：符合的个数'), m('menn', '枚举：一共几种'),
      ['db', 'databench', {}], m('mdk', '数据图表台：斜率'), m('mdb', '数据图表台：截距'),
      ['dc', 'dice', { sides: 6 }], ['hd', 'hist', { lo: 1, hi: 6, mode: 0 }], m('mhd', '骰子掷了几次'),
    ],
    links: [
      ['bg', 'hb', 'v', 'v'], ['hb', 'mhb', 'v', 'n'], ['hb', 'sb', 'd', 'dist'], ['sb', 'msb', 'v', 'v'],
      ['pt', 'mpt', 'v', 'p'], ['pt', 'mptn', 'v', 'paths'],
      ['en', 'men', 'v', 'count'], ['en', 'menn', 'v', 'total'],
      ['db', 'mdk', 'v', 'k'], ['db', 'mdb', 'v', 'b'],
      ['dc', 'hd', 'v', 'v'], ['hd', 'mhd', 'v', 'n'],
    ],
  },
];

// 太大的场景拆成两个：按角色名分组，各自带上相关的连线（一个读数器只和它的器材在同一个示例里）。
function split(sp, parts) {
  return parts.map((p) => {
    const roles = new Set(p.roles.split(' '));
    return {
      id: p.id, grade: sp.grade, domain: p.domain || sp.domain, title: p.title, hook: p.hook, run: sp.run,
      ents: sp.ents.filter((e) => roles.has(e[0])),
      puts: (sp.puts || []).filter((x) => roles.has(x[0]) && roles.has(x[1])),
      links: sp.links.filter((l) => roles.has(l[0]) && roles.has(l[1])),
    };
  });
}
const out = [];
for (const sp of BASE) {
  if (sp.id === 'ex-shapes-world') {
    out.push(...split(sp, [
      { id: 'ex-plane-shapes', title: '综合 · 平面图形：角、三角形、四边形、圆、多边形、钉板、几何工作区',
        hook: '角与三角形（第三个角、外角）、三角形与四边形的面积和周长，同类的两个用比较器对一对；圆的面积、圆周角、量角器读数；正多边形的内角和；钉板；几何工作区里三个点围成多边形，面积读数接在后面。',
        roles: 'an mC mext tr mta mtp ft mft cmpT rc mrc mrp pg mpg cmpR fq mfq ci mci ca mca pr mdeg tt po mpo mpe gb mgb ws pa pb pc pl ga mwa' },
      { id: 'ex-solids-models', title: '综合 · 立体与模型：长方体、三视图、展开图、相似、球面、出租车、海龟、尺规、最优化', domain: '图形',
        hook: '长方体的体积、表面积、棱数；小方块搭建与三视图；展开图能不能折；折纸；相似与影子测高；剪拼；弯曲空间和球面三角形的角和；出租车几何；海龟作图；尺规作图；最优化沙盘。每个把自己的结果读到读数器上。',
        roles: 'cb mv ms me cu mcv vw mvw nt mnt fd mfd sc msc sh msh ds mds cv mcvd sp msp tx mtx tu mtu cp mcp op mop' },
    ]));
  } else if (sp.id === 'ex-number-boards') {
    out.push(...split(sp, [
      { id: 'ex-number-boards', title: '综合 · 数的工作台：竖式、线段图、倒水、点阵、同余钟、质因数、数轴、数列',
        hook: '竖式工作台、列式、线段图（它产生的方程交给式子工作台检查）、量杯倒水、点阵、分数面积、同余钟、质因数积木、数轴、数列、换一种运算。每个把自己的结果读到读数器上。',
        roles: 'ab mab cl mcl bm mbm wb1 po mpo ar mar fa mfa mc mmc pb mgcd mlcm n7 nl mnl nth mnth nw mnw' },
      { id: 'ex-relation-boards', title: '综合 · 关系的工作台：费用方案、天平、解方程、变量盒、代数砖、逼近、交点', domain: '关系',
        hook: '套餐费用的平衡点；两个数放上天平；解方程天平（它的方程交给式子工作台检查）；变量盒里有几个 x 使两边相等；代数砖；逼近器；两条直线的交点。',
        roles: 'cp mcp n12a n12b bal mbd es mes wb2 vr mvh tl mtl ap map l1 l2 cr mcx mcy dd' },
    ]));
  } else out.push(sp);
}
module.exports = out;
