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

# Prefix rules (e.g. body[data-view^="demo-"] #demos) cover every view
# with that prefix — registry anims need no per-view allowlist rule.
prefix_allowed = re.findall(r'body\[data-view\^="([^"]+)"\]\s+(#\w+)', CSS)


def is_allowed(view, section):
    if section in allowed.get(view, set()):
        return True
    return any(view.startswith(p) and s == section for p, s in prefix_allowed)

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
# ---------- Animation registry (§5.1) ----------
# New animations register in apps/web/anims-*.js via registerAnim(...);
# each key needs render/points/title/sub/grade/kind, every point id must
# really exist in its grade file, keys must not repeat or collide with
# the 145 hand-wired demos, and each registry view needs #demos
# (covered by the ^= prefix rule, not by a per-view rule).
REGISTRY_FILES = ['anims-registry.js', 'anims-band-1-3.js', 'anims-band-4-6.js',
                  'anims-band-7-9.js', 'anims-operations.js']
registry_keys = []


def extract_register_calls(src):
    # registerAnim({...}) — balanced braces, string-aware. Only a call
    # counts: the definition `function registerAnim(a)` and mentions in
    # comments have something other than '{' after the '('.
    calls = []
    i = 0
    while True:
        j = src.find('registerAnim(', i)
        if j < 0:
            break
        k = j + len('registerAnim(')
        while k < len(src) and src[k] in ' \t\r\n':
            k += 1
        if k >= len(src) or src[k] != '{':
            i = j + 1
            continue
        depth = 0
        p = k
        quote = None
        esc = False
        while p < len(src):
            ch = src[p]
            if quote:
                if esc:
                    esc = False
                elif ch == '\\':
                    esc = True
                elif ch == quote:
                    quote = None
            else:
                if ch in ('"', "'"):
                    quote = ch
                elif ch == '{':
                    depth += 1
                elif ch == '}':
                    depth -= 1
                    if depth == 0:
                        break
            p += 1
        calls.append(src[k:p + 1])
        i = p + 1
    return calls


def reg_field(block, name):
    m = re.search(name + r"\s*:\s*['\"]([^'\"]+)['\"]", block)
    return m.group(1) if m else None


# Point ids per grade file (grade-3.js uses single quotes, the rest double;
# ids like 3.15a carry a letter).
grade_points = {}
for g in range(1, 10):
    gsrc = (ROOT / 'content' / 'grades' / ('grade-%d.js' % g)).read_text(encoding='utf-8')
    grade_points[g] = set(re.findall(r"id\s*:\s*['\"](\d+\.\d+[a-z]?)['\"]", gsrc))
old_bare_keys = set(k[5:] for k in demo_keys)
for rf in REGISTRY_FILES:
    rpath = ROOT / 'apps' / 'web' / rf
    if not rpath.exists():
        errors.append(f"registry file {rf} is missing")
        continue
    rsrc = rpath.read_text(encoding='utf-8')
    for block in extract_register_calls(rsrc):
        key = reg_field(block, 'key')
        if not key:
            errors.append(f"{rf}: registerAnim call without a key")
            continue
        registry_keys.append(key)
        if not re.fullmatch(r'[a-z0-9]+(-[a-z0-9]+)*', key):
            errors.append(f"registry {key!r}: key must be lowercase alphanumerics + hyphens")
        if key in old_bare_keys:
            errors.append(f"registry {key!r}: collides with a hand-wired demo key")
        if not reg_field(block, 'title'):
            errors.append(f"registry {key!r}: missing title")
        if not reg_field(block, 'sub'):
            errors.append(f"registry {key!r}: missing sub")
        if reg_field(block, 'kind') not in ('演示', '模拟', '实验'):
            errors.append(f"registry {key!r}: kind must be 演示 / 模拟 / 实验, got {reg_field(block, 'kind')!r}")
        gm = re.search(r"grade\s*:\s*(\d+)", block)
        if not gm or not (1 <= int(gm.group(1)) <= 9):
            errors.append(f"registry {key!r}: grade must be an integer 1–9")
        pm = re.search(r"points\s*:\s*\[([^\]]*)\]", block)
        if not pm:
            errors.append(f"registry {key!r}: missing points")
        else:
            pids = re.findall(r"['\"]([^'\"]+)['\"]", pm.group(1))
            if not pids:
                errors.append(f"registry {key!r}: points is empty")
            for pid in pids:
                m = re.fullmatch(r'(\d+)\.\d+[a-z]?', pid)
                if not m:
                    errors.append(f"registry {key!r}: bad point id {pid!r}")
                elif pid not in grade_points.get(int(m.group(1)), set()):
                    errors.append(f"registry {key!r}: point {pid!r} does not exist in grade-{m.group(1)}.js")
        grp = reg_field(block, 'group')
        if grp is not None and grp != 'operations':
            errors.append(f"registry {key!r}: group may only be 'operations'")
        if not re.search(r"render\s*:", block):
            errors.append(f"registry {key!r}: missing render function")
        NEED['demo-' + key] = '#demos'
for k in sorted(set(k for k in registry_keys if registry_keys.count(k) > 1)):
    errors.append(f"registry key {k!r} is registered more than once")
if 'id="demo-anim"' not in HTML:
    errors.append('registry generic card id="demo-anim" is missing from index.html')
if 'id="animDirectory"' not in HTML:
    errors.append('registry directory container id="animDirectory" is missing from index.html')

for view, section in sorted(NEED.items()):
    if not is_allowed(view, section):
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

# Lab (MathWorld workbench) structure: the bench must stay intact — the parts
# box has 5 domain groups, the inspector sits beside the bench, and the
# question search/filter + save + why/discovery controls must exist.
_lab = HTML[HTML.find('<section id="lab"'):HTML.find('<section id="why"')]
for _need in ('id="worldBenchBox"', 'id="worldBenchInspector"',
              'id="labQSearch"', 'id="labQGrade"', 'id="labQEmpty"',
              'id="labQCount"', 'id="labPracticeMenu"',
              'id="labWhyBtn"', 'id="labDiscoveryBtn"', 'id="labWhyBox"',
              'id="labSaveBtn"', 'id="labSaveName"', 'id="labSavedList"',
              'id="labChooseCurrent"', 'id="labChooseFold"', 'id="labMoreFold"',
              'id="labExamTimer"', 'id="labReportFold"', 'id="labReportPeek"',
              'id="labReportSheet"', 'id="labReportHandle"', 'id="labReportDiscovery"',
              'id="labReportCauses"', 'id="labReportSave"', 'id="labReportPreview"',
              'id="labReportBack"',
              'class="station-fold"', 'class="rot-handle"', 'class="world-signals"'):
    if _need not in _lab:
        errors.append(f"lab section is missing {_need}")
for _grp in ('>数<', '>分数<', '>形<', '>量<', '>关系<'):
    if _grp not in _lab:
        errors.append(f"parts box is missing group {_grp}")
if _lab.count('class="part-group"') < 5:
    errors.append("parts box must have 5 part groups (数/分数/形/量/关系)")
if 'data-drag-weight' not in _lab:
    errors.append("parts box is missing draggable weight chips")

if errors:
    print('check-views FAILED:')
    for e in errors:
        print('  - ' + e)
    sys.exit(1)
print(f"check-views OK: {len(NEED)} views wired, {len(demo_keys)} demos "
      f"({', '.join(demo_keys)}) + {len(registry_keys)} registry anims "
      f"({', '.join(sorted(set(registry_keys)))})")
