#!/usr/bin/env python3
"""Verify the DriveFleet frontend bundles: syntax, references, asset paths."""
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
CSS = PUBLIC / "css" / "style.css"
APP = PUBLIC / "js" / "app.js"
SOURCES = ["data.js", "mock-core.js", "mock-api.js",
           "api.js", "components.js", "ui.js", "main.js"]

errors = []


def check(cond, message):
    if cond:
        print(f"  ok   {message}")
    else:
        print(f"  FAIL {message}")
        errors.append(message)


print("1) Bundles exist")
check(CSS.exists(), f"{CSS.relative_to(ROOT)} present")
check(APP.exists(), f"{APP.relative_to(ROOT)} present")

print("2) Brace / paren balance in JS sources")
for name in SOURCES:
    path = PUBLIC / "js" / name
    if not path.exists():
        check(False, f"{name} missing")
        continue
    src = path.read_text(encoding="utf-8")
    check(src.count("{") == src.count("}"), f"{name} braces balanced ({src.count('{')} pairs)")
    check(src.count("(") == src.count(")"), f"{name} parens balanced ({src.count('(')} pairs)")

print("3) Bundled app.js parses with node (if available)")
try:
    proc = subprocess.run(["node", "--check", str(APP)], capture_output=True, text=True)
    check(proc.returncode == 0, "node --check app.js")
    if proc.returncode != 0:
        print(proc.stderr.strip()[:800])
except FileNotFoundError:
    print("  skip node not installed")

print("4) Bundled style.css parses with python tinycss2-less heuristic")
css = CSS.read_text(encoding="utf-8")
check(css.count("{") == css.count("}"), f"style.css braces balanced ({css.count('{')} blocks)")
check("--color-primary" in css, "design tokens present")
check("backdrop-filter" in css, "navbar blur present")

print("5) HTML pages and their script/style references")
pages = [PUBLIC / "index.html"] + sorted((PUBLIC / "pages").glob("*.html"))
for page in pages:
    if not page.exists():
        continue
    html = page.read_text(encoding="utf-8")
    refs = set(re.findall(r'(?:href|src)="([^"#>?]+)"', html))
    local = [r for r in refs if not r.startswith(("http", "data:", "mailto:", "//"))]
    order = [r for r in local if r.endswith(".js")]
    order_ok = order == sorted(order, key=lambda x: SOURCES.index(x.split("/")[-1])
                               if x.split("/")[-1] in SOURCES else 0)
    check(order_ok, f"{page.relative_to(ROOT)} script order")
    for ref in local:
        if ref.startswith("../"):
            target = (page.parent / ref).resolve()
        else:
            target = (page.parent / ref).resolve()
        if ref.endswith("/"):
            continue
        check(target.exists() or ref.endswith(".html"),
              f"{page.relative_to(ROOT)} -> {ref}")

print()
if errors:
    print(f"FAILED: {len(errors)} issue(s)")
    sys.exit(1)
print("All checks passed.")
