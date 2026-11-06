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

html = (WEB / 'index.html').read_text()
css = (WEB / 'styles.css').read_text()
js = (WEB / 'app.js').read_text()
assert '</style>' not in css and '</script>' not in js
html = html.replace('<link rel="stylesheet" href="styles.css">',
                    '<style>\n' + css + '</style>', 1)
# Grade content files are inlined before app.js when present; otherwise drop the tag.
for gfile in sorted(p.name for p in (ROOT / 'content' / 'grades').glob('grade-*.js')):
    g = ROOT / 'content' / 'grades' / gfile
    tag = '<script src="../../content/grades/' + gfile + '"></script>'
    if g.exists():
        gjs = g.read_text()
        assert '</script>' not in gjs
        html = html.replace(tag, '<script>\n' + gjs + '\n</script>', 1)
    else:
        html = html.replace(tag + '\n', '', 1)
    assert tag not in html
html = html.replace('<script src="app.js"></script>',
                    '<script>\n' + js + '\n</script>', 1)
assert '<link rel="stylesheet" href="styles.css">' not in html
assert '<script src="app.js"></script>' not in html
(WEB / 'homepage-standalone.html').write_text(html)
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
assert len(widget_html.encode()) < 1000000
(WEB / 'homepage-widget.html').write_text(widget_html)
print('widget bytes:', len(widget_html.encode()))
