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
CSS = (ROOT / 'apps' / 'web' / 'styles.css').read_text()
JS = (ROOT / 'apps' / 'web' / 'app.js').read_text()
HTML = (ROOT / 'apps' / 'web' / 'index.html').read_text()

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

if errors:
    print('check-views FAILED:')
    for e in errors:
        print('  - ' + e)
    sys.exit(1)
print(f"check-views OK: {len(NEED)} views wired, {len(demo_keys)} demos "
      f"({', '.join(demo_keys)})")
