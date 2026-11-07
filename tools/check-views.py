"""Static wiring check: every view applyView() can produce must be
re-shown by the CSS view allowlist, or the section renders blank.

Why this exists: styles.css hides every section for every view
(`body[data-view] #grades, #demos, ... {display:none}`) and then
re-shows each section only for the views listed in the allowlist.
Adding a view in app.js (a new demo, a new mix/review page) without
adding it to the allowlist produces a blank page with no JS error —
the stub smoke tests cannot catch it, because they only check the
`hidden` attribute, never computed display. This bug shipped twice:
unit-detail/point-detail (commit d859d38) and demo-tenframe
(the ten-frame demo listed everywhere but rendered blank).

Also checks every demo key has a NAV_DEF, a card in index.html and
a panel with data-nav-key.

Run: python3 tools/check-views.py   (exit 0 = ok)
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CSS = (ROOT / 'apps' / 'web' / 'styles.css').read_text(encoding='utf-8')
JS = (ROOT / 'apps' / 'web' / 'app.js').read_text(encoding='utf-8')
HTML = (ROOT / 'apps' / 'web' / 'index.html').read_text(encoding='utf-8')

# view -> sections the CSS allowlist re-shows for it
allowed = {}
for view, section in re.findall(r'body\[data-view="([^"]+)"\]\s+(#\w+)', CSS):
    allowed.setdefault(view, set()).add(section)

# Which section each view needs (mirrors applyView() in app.js).
NEED = {
    'grades': '#grades', 'grade-detail': '#grades', 'unit-detail': '#grades',
    'point-detail': '#grades', 'mix': '#grades',
    'dimensions': '#dimensions', 'dim-detail': '#dimensions',
    'path': '#path', 'path-step': '#path',
    'demos': '#demos', 'why': '#why', 'lab': '#lab',
    'review': '#review', 'progress': '#review', 'parent': '#review', 'exam': '#exam',
    'inquiry': '#inquiry', 'checkpoint': '#checkpoint',
}
# Demo keys: every 'demo-*' key registered in NAV_DEFS needs #demos.
demo_keys = sorted(set(re.findall(r"'(demo-[a-z]+)'\s*:", JS)))
for k in demo_keys:
    NEED[k] = '#demos'

errors = []
for view, section in sorted(NEED.items()):
    if section not in allowed.get(view, set()):
        errors.append(f"view {view!r} needs {section} but the CSS allowlist "
                      f"has no body[data-view=\"{view}\"] {section} rule")
for k in demo_keys:
    if f'id="{k}"' not in HTML:
        errors.append(f"demo {k!r} has no card id=\"{k}\" in index.html")
    if f'data-nav-key="{k}"' not in HTML:
        errors.append(f"demo {k!r} has no panel data-nav-key=\"{k}\" in index.html")

# ---------- HTML structure: sections must close, view sections must be siblings ----------
# Why this exists: commit f02a85f (lab workbench) accidentally deleted the
# closing </section> of #lab, so #why, #review, #exam, #inquiry and
# #checkpoint all became CHILDREN of #lab in the real DOM. Every one of
# those pages then rendered blank in a real browser (a hidden ancestor
# hides its descendants no matter what their own display rule says),
# while the smoke stub (which never parses index.html) and jsdom (which
# only reports each element's own computed display) both said everything
# was fine. The bug shipped and was only caught by a user report plus a
# bisect. So: parse the real HTML and fail if any section is left
# unclosed, or if a view section nests inside another section.
from html.parser import HTMLParser

VIEW_SECTIONS = {'grades', 'dimensions', 'path', 'demos', 'lab', 'why',
                 'review', 'exam', 'inquiry', 'checkpoint'}


class _SectionParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []          # (tag, id) for open section/article/div
        self.nesting = {}        # section id -> enclosing section ids
        self.problems = []

    def handle_starttag(self, tag, attrs):
        if tag in ('section', 'article', 'div'):
            d = dict(attrs)
            if tag == 'section' and d.get('id'):
                self.nesting[d['id']] = [i for _, i in self.stack
                                         if _ == 'section']
            self.stack.append((tag, d.get('id', '')))

    def handle_endtag(self, tag):
        if tag not in ('section', 'article', 'div'):
            return
        if self.stack and self.stack[-1][0] == tag:
            self.stack.pop()
        else:
            names = [t for t, _ in self.stack]
            if tag in names:
                while self.stack and self.stack[-1][0] != tag:
                    self.problems.append(
                        f"unclosed <{self.stack[-1][0]}> id="
                        f"{self.stack[-1][1]!r} before </{tag}>")
                    self.stack.pop()
                self.stack.pop()
            else:
                self.problems.append(f"stray </{tag}> with nothing open")


_parser = _SectionParser()
_parser.feed(HTML)
for tag, sid in _parser.stack:
    _parser.problems.append(f"unclosed <{tag}> id={sid!r} at end of file")
for sid in sorted(VIEW_SECTIONS):
    enclosing = _parser.nesting.get(sid)
    if enclosing is None:
        errors.append(f"section #{sid} not found in index.html")
    elif enclosing:
        errors.append(f"section #{sid} is nested inside section(s) "
                      f"{enclosing} — a hidden ancestor would blank it")
errors.extend(_parser.problems)

if errors:
    print('check-views FAILED:')
    for e in errors:
        print('  - ' + e)
    sys.exit(1)
print(f"check-views OK: {len(NEED)} views wired, {len(demo_keys)} demos "
      f"({', '.join(demo_keys)})")
