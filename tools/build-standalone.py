"""Build apps/web/homepage-standalone.html from index.html by inlining
styles.css, content/grades/grade-*.js (when present) and app.js.

The standalone is what gets played in chat and in real-browser tests
(via the raw.githack commit-SHA URL), because the repo file viewer does
not run JS. Keep this script in the repo (not /tmp): /tmp is wiped on
VM replacement, and losing the build means losing the test route.
"""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
WEB = ROOT / 'apps' / 'web'

html = (WEB / 'index.html').read_text(encoding='utf-8')
css = (WEB / 'styles.css').read_text(encoding='utf-8')
js = (WEB / 'app.js').read_text(encoding='utf-8')
assert '</style>' not in css and '</script>' not in js
html = html.replace('<link rel="stylesheet" href="styles.css">',
                    '<style>\n' + css + '</style>', 1)
# Grade content files are inlined before app.js when present; otherwise drop the tag.
for gfile in sorted(p.name for p in (ROOT / 'content' / 'grades').glob('grade-*.js')):
    g = ROOT / 'content' / 'grades' / gfile
    tag = '<script src="../../content/grades/' + gfile + '"></script>'
    if g.exists():
        gjs = g.read_text(encoding='utf-8')
        assert '</script>' not in gjs
        html = html.replace(tag, '<script>\n' + gjs + '\n</script>', 1)
    else:
        html = html.replace(tag + '\n', '', 1)
    assert tag not in html
# Animation registry + band files must inline before app.js,
# in the same order as the <script> tags in index.html.
for rfile in ['anims-registry.js', 'anims-band-1-3.js', 'anims-band-4-6.js',
              'anims-band-7-9.js', 'anims-operations.js']:
    r_path = WEB / rfile
    r_tag = '<script src="' + rfile + '"></script>'
    if r_path.exists():
        rjs = r_path.read_text(encoding='utf-8')
        assert '</script>' not in rjs
        html = html.replace(r_tag, '<script>\n' + rjs + '\n</script>', 1)
    else:
        html = html.replace(r_tag + '\n', '', 1)
    assert r_tag not in html
html = html.replace('<script src="app.js"></script>',
                    '<script>\n' + js + '\n</script>', 1)
assert '<link rel="stylesheet" href="styles.css">' not in html
assert '<script src="app.js"></script>' not in html
# 数学实验台（NB 式）：独立页面里把 lab-nb.html 内嵌进 iframe 的 srcdoc，单文件即可打开。
import html as _html_mod
lab_nb_path = WEB / 'lab-nb.html'
lab_nb_src = 'src="lab-nb.html"'


def inline_lab_nb(page, nb_source):
    """Swap the lab iframe's src for an escaped srcdoc holding nb_source."""
    if lab_nb_path.exists() and lab_nb_src in page:
        page = page.replace(
            lab_nb_src, 'srcdoc="' + _html_mod.escape(nb_source, quote=True) + '"', 1)
    assert lab_nb_src not in page or not lab_nb_path.exists()
    return page


# 先留一份还没内嵌实验台的页面：widget 版要先对它做存储替换，再单独处理实验台，
# 否则全局替换会改到已经内嵌进 srcdoc 的实验台脚本（见下面 widget 段）。
html_without_lab = html
nb_source = lab_nb_path.read_text(encoding='utf-8') if lab_nb_path.exists() else ''
html = inline_lab_nb(html_without_lab, nb_source)
(WEB / 'homepage-standalone.html').write_text(html, encoding='utf-8')
print('standalone bytes:', len(html.encode()))

# Widget variant: identical app, but storage is memory-only. Chat widgets
# reject browser-local state (localStorage), so lsGet/lsSet are swapped for
# an in-memory store. Everything stays clickable; only progress does not
# survive a reload inside the widget. The standalone above is untouched
# and remains the version for real-browser tests.
WIDGET_LS_GET = "function lsGet(k) { try { return (typeof localStorage !== 'undefined') ? localStorage.getItem(k) : null; } catch (e) { return null; } }"
WIDGET_LS_SET = "function lsSet(k, v) { try { if (typeof localStorage !== 'undefined') localStorage.setItem(k, v); } catch (e) {} }"
assert WIDGET_LS_GET in html_without_lab and WIDGET_LS_SET in html_without_lab
widget_html = html_without_lab.replace(
    WIDGET_LS_GET,
    "var __memStore = {}; function lsGet(k) { return (k in __memStore) ? __memStore[k] : null; }", 1)
widget_html = widget_html.replace(
    WIDGET_LS_SET,
    "function lsSet(k, v) { __memStore[k] = v; }", 1)
# 只改主页面脚本里剩下的 localStorage 字样（此时实验台还没内嵌）。
widget_html = widget_html.replace('localStorage', '内存存储')
assert 'localStorage' not in widget_html

# 实验台（srcdoc 里的 lab-nb.html）不能照搬上面的字符串替换：那样会留下一堆未定义的
# `内存存储.setItem(...)`，初始化的 afterChange() 直接抛 ReferenceError，台面空白（D01）。
# 这里改成给实验台注入一个真正定义好的内存 Storage（__nbStore），再把它的 localStorage
# 调用指向它。接口与 Storage 一致（getItem/setItem/removeItem/clear/key/length）。
NB_MEM_SHIM = (
    "<script>var __nbStore=(function(){var m={};return{"
    "getItem:function(k){return Object.prototype.hasOwnProperty.call(m,k)?m[k]:null},"
    "setItem:function(k,v){m[k]=String(v)},"
    "removeItem:function(k){delete m[k]},"
    "clear:function(){m={}},"
    "key:function(i){return Object.keys(m)[i]||null},"
    "get length(){return Object.keys(m).length}}})();</script>\n"
)
nb_widget = nb_source
if nb_widget:
    assert nb_widget.count('<script>') == 1, 'lab-nb.html 脚本块数量变了，检查 shim 注入位置'
    nb_widget = nb_widget.replace('localStorage', '__nbStore')
    nb_widget = nb_widget.replace('<script>', NB_MEM_SHIM + '<script>', 1)
    assert 'localStorage' not in nb_widget
widget_html = inline_lab_nb(widget_html, nb_widget)
assert '内存存储' not in nb_widget
assert 'localStorage' not in widget_html
# Widget 体积上限：1MB 是 7587ba3 自设的 guard，没有任何平台文档说 widget
# 不能超过 1MB；7 年级上线（98 个演示）时 standalone 已到 1076KB，任何一个
# 年级的增量都会撞线。1.5MB 是第二次放宽（133 个演示 + 实验室工作间时
# standalone 已到 1514KB）。2MB 是第三次放宽（互动模拟和第 4 阶段运算动画）。
# 第四次放宽到 3MB（2026-11-07）：157 个动画时 widget 1,921,754；加 24 个
# G7 动画后 widget 约 2,078,800，已超 2MB（那批因此没能生成 widget）。
# 按每动画约 6–11KB 计，3MB 够再做约 110 个动画（约 4–5 批）；全部 494 个
# 方法做完 widget 可能到约 6MB，到时再评估是继续放宽还是拆包，不要为了
# 凑数字删内容。
# 第五次放宽到 6MB（2026-11-07）：8 年级 26 个动画后 widget 达 3,019,367，
# 已超 3MB。剩余约 320 个方法、约 150 个动画，按每动画约 6–11KB 计还需
# 约 1.5MB，做完约 4.5MB，6MB 够覆盖并留余量；到时再评估是继续放宽还是
# 拆包，不要为了凑数字删内容。
assert len(widget_html.encode()) < 6000000
(WEB / 'homepage-widget.html').write_text(widget_html, encoding='utf-8')
print('widget bytes:', len(widget_html.encode()))
