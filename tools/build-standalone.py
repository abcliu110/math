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
for gfile in ['grade-1.js', 'grade-3.js']:
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
