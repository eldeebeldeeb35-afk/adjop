"""Identify the font in a design: compare clean letter crops against Google Fonts candidates.

    python find_font.py --sample S.png:S --sample C.png:C --category DISPLAY,SANS_SERIF \
        --min-weight 800 --top 12 --sheet candidates.png
    python find_font.py --sample word.png:Hello --names "Rubik,Archivo Black,Anton"

--sample IMAGE:TEXT  crop of one clean letter (best) or a short word, flat (use flatten.py first),
                     dark-on-light or light-on-dark both fine. Use 2-4 letters with distinctive
                     shapes (S, C, R, G, a, e, g). Repeatable.
--category/--min-weight/--subset narrow the ~2,000 families (heavy display print: DISPLAY,SANS_SERIF + 700).
--names              compare only these families.
--limit              max families to try (downloads are cached; first run of 300 ≈ 1-2 min).
Prints the best matches with a score (shape overlap, 0-1) and writes a contact sheet:
your letters in red over each candidate in black, so the best fit is visible at a glance.
"""
import argparse
import os
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fontlib  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("--sample", action="append", required=True)
ap.add_argument("--category")
ap.add_argument("--min-weight", type=int, default=0)
ap.add_argument("--subset")
ap.add_argument("--names")
ap.add_argument("--limit", type=int, default=400)
ap.add_argument("--top", type=int, default=12)
ap.add_argument("--sheet", default="font_candidates.png")
a = ap.parse_args()

N = 96  # comparison grid


def ink_mask(img):
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if img.ndim == 3 else img
    _, m = cv2.threshold(g, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    m = m > 0
    # ink = the class that does not touch the border most
    border = np.concatenate([m[0], m[-1], m[:, 0], m[:, -1]])
    if border.mean() > 0.5:
        m = ~m
    return m


def norm(m):
    ys, xs = np.nonzero(m)
    if len(xs) == 0:
        return None, 1.0
    c = m[ys.min():ys.max() + 1, xs.min():xs.max() + 1].astype(np.uint8) * 255
    aspect = c.shape[1] / c.shape[0]
    return cv2.resize(c, (N, N), interpolation=cv2.INTER_AREA) > 127, aspect


samples = []
for s in a.sample:
    path, text = s.rsplit(":", 1)
    img = cv2.imread(path)
    if img is None:
        sys.exit(f"cannot read {path}")
    m, asp = norm(ink_mask(img))
    samples.append((text, m, asp))


def render(font, text):
    im = Image.new("L", (len(text) * 260 + 100, 360), 0)
    ImageDraw.Draw(im).text((40, 40), text, font=font, fill=255)
    return np.array(im) > 127


if a.names:
    fams = [fontlib.find(n.strip()) for n in a.names.split(",")]
else:
    fams = fontlib.search(a.category, a.min_weight, a.subset)
    fams = [f for f in fams if "latin" in f["subsets"] or a.subset][: a.limit]
print(f"trying {len(fams)} families…", file=sys.stderr)

results = []
for i, fam in enumerate(fams):
    try:
        path, var = fontlib.pick_file(fam, max(a.min_weight, 0) or None)
        font = ImageFont.truetype(path, 220)
        if var:
            try:
                axes = font.get_variation_axes()
                font.set_variation_by_axes([var.get("wght", ax.get("default", 400)) if ax.get("name", b"") in (b"Weight", "Weight") else ax.get("default", 0) for ax in axes])
            except Exception:
                pass
        score, rend = 0.0, []
        for text, m, asp in samples:
            r, rasp = norm(render(font, text))
            if r is None:
                raise ValueError("glyph missing")
            iou = (m & r).sum() / max(1, (m | r).sum())
            score += iou * (min(asp, rasp) / max(asp, rasp)) ** 0.5  # shape overlap, penalised if proportions differ
            rend.append(r)
        results.append((score / len(samples), fam["name"], rend))
    except Exception:  # missing glyphs, broken file, network
        continue
    if (i + 1) % 50 == 0:
        print(f"  {i + 1}/{len(fams)}", file=sys.stderr)

results.sort(key=lambda r: -r[0])
for sc, name, _ in results[: a.top]:
    print(f"{sc:.3f}  {name}")

# contact sheet: sample (red) over candidate (black)
top = results[: a.top]
cell = N * 2
sheet = Image.new("RGB", (cell * len(samples) + 260, cell * max(1, len(top))), "white")
d = ImageDraw.Draw(sheet)
for row, (sc, name, rend) in enumerate(top):
    for col, (text, m, _) in enumerate(samples):
        tile = np.full((N, N, 3), 255, np.uint8)
        tile[rend[col]] = (0, 0, 0)
        tile[m & ~rend[col]] = (230, 40, 40)
        tile[m & rend[col]] = (120, 0, 0)
        sheet.paste(Image.fromarray(tile).resize((cell - 8, cell - 8)), (col * cell + 4, row * cell + 4))
    d.text((cell * len(samples) + 10, row * cell + cell // 2 - 10), f"{row + 1}. {name}  {sc:.3f}", fill=(0, 0, 0))
sheet.save(a.sheet)
print(a.sheet)
