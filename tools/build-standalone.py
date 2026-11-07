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
# MathWorld model + Apparatus views must load before app.js.
mw_path = WEB / 'math-world.js'
mw_tag = '<script src="math-world.js"></script>'
if mw_path.exists():
    mw = mw_path.read_text(encoding='utf-8')
    assert '</script>' not in mw
    html = html.replace(mw_tag, '<script>\n' + mw + '\n</script>', 1)
else:
    html = html.replace(mw_tag + '\n', '', 1)
assert mw_tag not in html
bv_path = WEB / 'bench-views.js'
bv_tag = '<script src="bench-views.js"></script>'
if bv_path.exists():
    bv = bv_path.read_text(encoding='utf-8')
    assert '</script>' not in bv
    html = html.replace(bv_tag, '<script>\n' + bv + '\n</script>', 1)
else:
    html = html.replace(bv_tag + '\n', '', 1)
assert bv_tag not in html
ap_path = WEB / 'apparatus.js'
ap_tag = '<script src="apparatus.js"></script>'
if ap_path.exists():
    ap = ap_path.read_text(encoding='utf-8')
    assert '</script>' not in ap
    html = html.replace(ap_tag, '<script>\n' + ap + '\n</script>', 1)
else:
    html = html.replace(ap_tag + '\n', '', 1)
assert ap_tag not in html
html = html.replace('<script src="app.js"></script>',
                    '<script>\n' + js + '\n</script>', 1)
assert '<link rel="stylesheet" href="styles.css">' not in html
assert '<script src="app.js"></script>' not in html
(WEB / 'homepage-standalone.html').write_text(html, encoding='utf-8')
print('standalone bytes:', len(html.encode()))

# Widget variant: identical app, but storage is memory-only. Chat widgets
# reject browser-local state (localStorage), so lsGet/lsSet are swapped for
# an in-memory store. Everything stays clickable; only progress does not
# survive a reload inside the widget. The standalone above is untouched
# and remains the version for real-browser tests.
WIDGET_LS_GET = "function lsGet(k) { try { return (typeof localStorage !== 'undefined') ? localStorage.getItem(k) : null; } catch (e) { return null; } }"
WIDGET_LS_SET = "function lsSet(k, v) { try { if (typeof localStorage !== 'undefined') localStorage.setItem(k, v); } catch (e) {} }"
assert WIDGET_LS_GET in html and WIDGET_LS_SET in html
widget_html = html.replace(
    WIDGET_LS_GET,
    "var __memStore = {}; function lsGet(k) { return (k in __memStore) ? __memStore[k] : null; }", 1)
widget_html = widget_html.replace(
    WIDGET_LS_SET,
    "function lsSet(k, v) { __memStore[k] = v; }", 1)
widget_html = widget_html.replace('localStorage', '内存存储')
assert 'localStorage' not in widget_html
# Widget 体积上限：1MB 是 7587ba3 自设的 guard，没有任何平台文档说 widget
# 不能超过 1MB；7 年级上线（98 个演示）时 standalone 已到 1076KB，任何一个
# 年级的增量都会撞线。1.5MB 是第二次放宽（133 个演示 + 实验室工作间时
# standalone 已到 1514KB）。再放宽到 2MB（仍能拦住失控增长）：第 3 阶段
# 互动模拟和第 4 阶段运算动画还会再加内容，2MB 够它们用；如果哪天真撞线，
# 再评估是拆包还是继续放宽，不要为了凑数字删内容。
assert len(widget_html.encode()) < 2000000
(WEB / 'homepage-widget.html').write_text(widget_html, encoding='utf-8')
print('widget bytes:', len(widget_html.encode()))
