#!/usr/bin/env python3
"""Bundle the DriveFleet frontend: CSS parts -> style.css, JS parts -> app.js."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
CSS = PUBLIC / "css"
JS = PUBLIC / "js"
PAGES = PUBLIC / "pages"
ASSETS = PUBLIC / "assets"
CSS_PARTS = ROOT / "scripts" / "css_parts"

# Load order matters: data -> mock -> api -> components/ui -> main
JS_ORDER = [
    "data.js",
    "mock-core.js",
    "mock-api.js",
    "api.js",
    "components.js",
    "ui.js",
    "main.js",
]

for d in (CSS, JS, PAGES, ASSETS):
    d.mkdir(parents=True, exist_ok=True)


def build_css() -> None:
    parts = sorted(CSS_PARTS.glob("*.css"))
    if not parts:
        raise SystemExit(f"No CSS parts found in {CSS_PARTS}")
    bundle = "\n".join(p.read_text(encoding="utf-8").rstrip() + "\n" for p in parts)
    out = CSS / "style.css"
    out.write_text(bundle, encoding="utf-8")
    print(f"[CSS] {out.relative_to(ROOT)} — {len(parts)} parts, {out.stat().st_size} bytes")
    for p in parts:
        print(f"      · {p.name} ({p.stat().st_size})")


def build_js() -> None:
    chunks = []
    for name in JS_ORDER:
        path = JS / name
        if not path.exists():
            print(f"[JS]  ! missing {name} (skipped)")
            continue
        chunks.append(f"/* ==== source: js/{name} ==== */\n" + path.read_text(encoding="utf-8").rstrip() + "\n")
    out = JS / "app.js"
    out.write_text("\n".join(chunks), encoding="utf-8")
    print(f"[JS]  {out.relative_to(ROOT)} — {len(chunks)} files, {out.stat().st_size} bytes")


if __name__ == "__main__":
    build_css()
    build_js()

