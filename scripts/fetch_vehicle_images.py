#!/usr/bin/env python3
"""
fetch_vehicle_images.py — build the DriveFleet vehicle photo set.

For every vehicle in js/data.js it finds a freely licensed photo on Wikimedia
Commons, centre-crops it to the 16:10 ratio used by .vehicle-card-image, and
writes two optimised WebP renditions (consistent framing + resolution):

    public/assets/vehicles/<slug>-large.webp   800 x 500
    public/assets/vehicles/<slug>-small.webp   400 x 250

Candidates are ranked so the photo matches the generation on the platform
(recent model years score higher, museum/interior/crash shots are penalised),
and credits are written to public/assets/vehicles/CREDITS.md + credits.json.
Chosen sources are cached in scripts/vehicle_image_sources.json so re-runs are
deterministic.

Usage:
    python3 scripts/fetch_vehicle_images.py                # build what is missing
    python3 scripts/fetch_vehicle_images.py --force        # rebuild everything
    python3 scripts/fetch_vehicle_images.py --only volvo-xc60,skoda-octavia
"""
from __future__ import annotations

import argparse
import html
import io
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "assets" / "vehicles"
CACHE = ROOT / "scripts" / "vehicle_image_sources.json"

API = "https://commons.wikimedia.org/w/api.php"
UA = "DriveFleetImageFetcher/1.0 (educational project)"

LARGE = (800, 500)
SMALL = (400, 250)

# slug, Commons search query, mandatory title keywords, bonus keywords (trim/generation)
VEHICLES = [
    ("tesla-model-3", 'Tesla Model 3', ["tesla model 3"], ["long range", "performance"]),
    ("toyota-rav4", 'Toyota RAV4', ["rav4"], ["hybrid", "adventure"]),
    ("volkswagen-golf-gti", 'Volkswagen Golf GTI', ["gti"], ["golf viii", "mk8", "edition"]),
    ("ford-f-150", 'Ford F-150', ["f-150", "f150"], ["lariat", "platinum", "xlt", "lightning"]),
    ("mercedes-e-class", 'Mercedes-Benz E-Class', ["e-class", "e class"],
     ["w214", "w213", "e 300", "e300", "e 200", "2021", "2022", "2023", "2024", "2025"]),
    ("renault-trafic", 'Renault Trafic', ["trafic"], ["trafic iii", "sl27", "2019", "2020", "2021", "2022"]),
    ("hyundai-tucson", 'Hyundai Tucson', ["tucson"], ["hybrid", "plug-in", "nx4"]),
    ("bmw-i4", 'BMW i4', ["i4"], ["edrive40", "edrive", "gran coupe"]),
    ("skoda-octavia", 'Skoda Octavia Combi', ["octavia"],
     ["combi", "estate", "2020", "2021", "2022", "2023", "2024", "2025"]),
    ("kia-sportage", 'Kia Sportage', ["sportage"], ["gt-line", "nq5", "hybrid"]),
    ("peugeot-208", 'Peugeot 208', ["208"], ["gt line", "gt-line", "puretech"]),
    ("volvo-xc60", 'Volvo XC60', ["xc60"], ["recharge", "spa", "2019", "2020", "2021", "2022", "2023", "2024"]),
]

# Ranking signals -----------------------------------------------------------
OTHER_BRANDS = ("tesla", "toyota", "volkswagen", "vw", "ford", "mercedes", "audi",
                "renault", "hyundai", "bmw", "skoda", "kia", "peugeot", "volvo",
                "mini", "opel", "nissan", "honda", "mazda", "seat", "fiat",
                "citroen", "dacia", "lexus", "jeep", "suzuki", "mitsubishi",
                "porsche", "jaguar", "land rover", "chevrolet", "dodge", "ram",
                "gmc", "subaru", "alfa romeo", "smart", "byd", "mg")

GOOD_WORDS = ("front", "front view", "front right", "front left", "dsc", "studio",
              "sedan", "estate", "combi", "suv", "hatchback", "gti", "plug-in",
              "hybrid", "electric", "lariat", "long range")
BAD_WORDS = ("interior", "engine", "crash", "wreck", "police", "taxi", "bus",
             "badge", "logo", "wheel", "dashboard", "auto show", "motorshow",
             "concept", "drawing", "rear view", "license plate", "crossing",
             "railroad", "museum", "classic", "vintage", "fire", "damage",
             "accident", "scrap", "ambulance", "hearse", "trailer",
             # emergency / commercial liveries and stretched limousine variants
             "rettung", "feuerwehr", "gendarmerie", "carabinieri", "polizei",
             "fahrschule", "driving school", "supertruck", "lwb", "stretch",
             "limousine", "hearse", "taxi")


def api_get(params: dict) -> dict:
    params = dict(params, format="json")
    request = urllib.request.Request(
        API + "?" + urllib.parse.urlencode(params),
        headers={"User-Agent": UA},
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        return json.loads(response.read().decode("utf-8"))


def search_candidates(query: str) -> list[dict]:
    data = api_get({
        "action": "query",
        "generator": "search",
        "gsrsearch": f"filetype:bitmap {query}",
        "gsrnamespace": "6",
        "gsrlimit": "40",
        "prop": "imageinfo",
        "iiprop": "url|size|extmetadata|mime",
        "iiurlwidth": "1600",
    })
    pages = (data.get("query") or {}).get("pages") or {}
    candidates = []
    for page in pages.values():
        info = (page.get("imageinfo") or [{}])[0]
        if not info.get("thumburl") or info.get("mime") not in ("image/jpeg", "image/png"):
            continue
        width, height = info.get("width") or 0, info.get("height") or 0
        if width < 1100 or height < 650:
            continue
        ratio = width / max(height, 1)
        if ratio < 1.05 or ratio > 2.6:          # reject portrait / ultra-wide shots
            continue
        candidates.append({
            "title": page.get("title", ""),
            "url": info["thumburl"],
            "descriptionurl": info.get("descriptionurl", ""),
            "width": width,
            "height": height,
            "meta": info.get("extmetadata") or {},
        })
    return candidates


def model_year(title: str) -> int | None:
    """Commons car photos are named "2022 Ford F-150 ..."; the *leading* year is
    the model year. A trailing date (…, 06-17-2022.jpg) is the photo date and
    must not be mistaken for it."""
    match = re.match(r"^(?:\w+:\s*)?(\d{4})\b", title.strip())
    return int(match.group(1)) if match else None


def score_candidate(candidate: dict, keywords: list[str], bonus: list[str] | None = None) -> float | None:
    """Rank by generation match + framing quality; None = not eligible."""
    title = candidate["title"].lower()
    if not any(keyword in title for keyword in keywords):
        return None

    score = 0.0
    year = model_year(title)
    if year is None:
        score += 0.75                      # no year stated: neutral, slightly wary
    elif year >= 2022:
        score += 5
    elif year >= 2020:
        score += 4.5
    elif year >= 2018:
        score += 3.5
    elif year >= 2016:
        score += 1.5
    elif year >= 2014:
        score += 0
    else:
        score -= 5                         # clearly an older generation

    # Penalise "Mini Electric & BMW i4 …" style shots where another marque leads.
    positions = [title.find(keyword) for keyword in keywords if keyword in title]
    prefix = title[: min(positions)] if positions else title
    if any(brand in prefix for brand in OTHER_BRANDS):
        score -= 2.5

    if bonus:
        score += min(5.0, 2.5 * sum(1 for word in bonus if word in title))

    score += min(2.0, sum(1 for word in GOOD_WORDS if word in title))
    score -= 2.0 * sum(1 for word in BAD_WORDS if word in title)
    score += min(1.0, candidate["width"] / 4000)      # prefer sharper originals
    return score


def pick_candidate(candidates: list[dict], keywords: list[str], taken: set[str], bonus: list[str] | None = None) -> tuple[dict | None, list[tuple[float, str]]]:
    ranked = []
    for candidate in candidates:
        if candidate["title"] in taken:
            continue
        score = score_candidate(candidate, keywords, bonus)
        if score is None or score < 0:
            continue
        ranked.append((score, candidate))
    ranked.sort(key=lambda pair: pair[0], reverse=True)
    if not ranked:
        return None, []
    return ranked[0][1], [(round(s, 1), c["title"]) for s, c in ranked[:3]]


def download(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(request, timeout=90) as response:
        return response.read()


def normalise(raw: bytes) -> Image.Image:
    """One consistent framing for every vehicle: cover-crop to 16:10."""
    image = Image.open(io.BytesIO(raw))
    image = ImageOps.exif_transpose(image).convert("RGB")
    return ImageOps.fit(image, LARGE, method=Image.LANCZOS, centering=(0.5, 0.45))


def clean(value: str) -> str:
    text = re.sub(r"<[^>]+>", "", value or "")
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


def build(slug: str, chosen: dict) -> None:
    raw = download(chosen["url"])
    image = normalise(raw)
    image.save(OUT / f"{slug}-large.webp", "WEBP", quality=82, method=6)
    image.resize(SMALL, Image.LANCZOS).save(OUT / f"{slug}-small.webp", "WEBP", quality=80, method=6)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="ignore cached sources")
    parser.add_argument("--only", default="", help="comma separated slugs to refresh")
    args = parser.parse_args()

    only = {s.strip() for s in args.only.split(",") if s.strip()}
    targets = [v for v in VEHICLES if not only or v[0] in only]
    if not targets:
        print("[images] nothing to do (unknown --only slugs)")
        return 2

    OUT.mkdir(parents=True, exist_ok=True)
    cache = json.loads(CACHE.read_text(encoding="utf-8")) if CACHE.exists() else {}
    if args.force:
        for slug, *_ in targets:
            cache.pop(slug, None)

    taken = {item["title"] for slug, item in cache.items() if slug not in {t[0] for t in targets}}
    ok = 0

    for slug, query, keywords, bonus in targets:
        if slug in cache and not args.force:
            print(f"[images] {slug}: cached ({cache[slug]['title']})")
            ok += 1
            continue

        try:
            candidates = search_candidates(query)
        except Exception as error:  # noqa: BLE001
            print(f"[images] {slug}: search failed ({error})")
            continue

        match, shortlist = pick_candidate(candidates, keywords, taken, bonus)
        if not match:
            print(f"[images] {slug}: no eligible candidate ({len(candidates)} results, "
                  f"keys={keywords}) top: {shortlist}")
            continue

        meta = match.get("meta") or {}
        chosen = {
            "slug": slug,
            "title": match["title"],
            "url": match["url"],
            "page": match["descriptionurl"],
            "author": clean((meta.get("Artist") or {}).get("value", "")),
            "license": clean((meta.get("LicenseShortName") or {}).get("value", "")),
            "license_url": clean((meta.get("LicenseUrl") or {}).get("value", "")),
            "source_width": match["width"],
            "source_height": match["height"],
            "score": round(score_candidate(match, keywords, bonus) or 0, 2),
        }

        try:
            build(slug, chosen)
        except Exception as error:  # noqa: BLE001
            print(f"[images] {slug}: download/convert failed ({error})")
            continue

        cache[slug] = chosen
        taken.add(chosen["title"])
        ok += 1
        large_kb = (OUT / f"{slug}-large.webp").stat().st_size // 1024
        small_kb = (OUT / f"{slug}-small.webp").stat().st_size // 1024
        print(f"[images] {slug}: {large_kb} KB / {small_kb} KB  score={chosen['score']}  <- {chosen['title']}")
        time.sleep(0.4)

    CACHE.write_text(json.dumps(cache, indent=2, ensure_ascii=False), encoding="utf-8")

    ordered = [cache[slug] for slug, *_ in VEHICLES if slug in cache]
    lines = ["# Vehicle photo credits", "",
             "Every vehicle photo used by DriveFleet comes from Wikimedia Commons and is",
             "re-used under the license stated below. All images were cover-cropped to the",
             "16:10 ratio of `.vehicle-card-image` and re-encoded as WebP (800x500 and",
             "400x250) by `scripts/fetch_vehicle_images.py`.", "",
             "| Vehicle | Source file | Author | License | Commons page |",
             "|---------|-------------|--------|---------|--------------|"]
    for item in ordered:
        lines.append("| `{slug}` | {title} | {author} | {license} | [link]({page}) |".format(
            slug=item["slug"],
            title=item["title"].replace("File:", ""),
            author=item.get("author") or "see source",
            license=item.get("license") or "see source",
            page=item.get("page") or item.get("url"),
        ))
    (OUT / "CREDITS.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    (OUT / "credits.json").write_text(json.dumps(ordered, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"[images] done: {ok}/{len(targets)} built ({len(cache)}/{len(VEHICLES)} total)")
    return 0 if len(cache) == len(VEHICLES) else 1


if __name__ == "__main__":
    sys.exit(main())
