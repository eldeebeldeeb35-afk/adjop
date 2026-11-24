"""Cut the portrait views out of their backgrounds and frame them identically.

Inputs are two composites of three side-by-side panels each:
  BEFORE: the old look (long hair in a bun): back, profile looking up, three-quarter front
  AFTER:  the current look (short hair, beard): turned left, front, turned right

The particle morph samples the outputs at runtime, so every view shares the
same canvas size and head placement; otherwise the stars travel across the
frame instead of rebuilding the head in place.

Usage (needs: pip install "rembg[cpu]" pillow scipy):
    python scripts/prepare_portraits.py BEFORE.jpg AFTER.jpg
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageOps
from rembg import new_session, remove
from scipy import ndimage

OUT = Path(__file__).resolve().parent.parent / "public" / "portraits"
SIZE = (720, 900)  # 4:5
TOP = 0.07  # top of the hair sits 7% from the top of the frame
TOP_TO_EAR = 0.34  # top of the hair to the middle of the ear, as a share of frame height

# Per panel, in panel pixels: (head centre x, top of hair y, middle of ear y).
# "erase" lists frame-space rectangles (x0, y0, x1, y1) the matting wrongly kept
# (a tree trunk, a lamp). "scale_from" lets views shot at the same zoom share one scale, so the head
# does not grow or shrink while it turns.
VIEWS = {
    "before": [
        dict(cx=280, top=625, ear=1045),
        dict(cx=330, top=615, ear=975),
        dict(cx=330, top=530, ear=855, erase=[(548, 0, 720, 600), (380, 0, 548, 60), (440, 58, 548, 82), (485, 82, 548, 110), (530, 110, 548, 560)]),
    ],
    "after": [
        dict(cx=450, top=170, ear=730, scale_from=1, erase=[(150, 372, 221, 450)]),
        dict(cx=430, top=150, ear=730),
        dict(cx=385, top=200, ear=730, scale_from=1, erase=[(400, 0, 500, 52)]),
    ],
}


def panels(path: Path):
    img = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    w, h = img.size
    m = 6  # trim the seams between panels
    return [img.crop((round(i * w / 3) + m, m, round((i + 1) * w / 3) - m, h - m)) for i in range(3)]


def keep_largest(alpha: np.ndarray) -> np.ndarray:
    labels, n = ndimage.label(alpha > 32)
    if n <= 1:
        return alpha
    sizes = ndimage.sum(np.ones_like(alpha), labels, range(1, n + 1))
    return np.where(labels == 1 + int(np.argmax(sizes)), alpha, 0).astype(np.uint8)


def frame(panel: Image.Image, view: dict, scale_view: dict, session) -> Image.Image:
    cut = remove(panel, session=session, post_process_mask=True)
    alpha = Image.fromarray(keep_largest(np.asarray(cut.getchannel("A"))))
    cut.putalpha(alpha.filter(ImageFilter.GaussianBlur(2)))

    scale = SIZE[1] * TOP_TO_EAR / (scale_view["ear"] - scale_view["top"])
    scaled = cut.resize((round(cut.width * scale), round(cut.height * scale)), Image.LANCZOS)
    ox = round(SIZE[0] / 2 - view["cx"] * scale)
    oy = round(SIZE[1] * TOP - view["top"] * scale)
    canvas = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    canvas.alpha_composite(scaled, (max(ox, 0), max(oy, 0)), (max(-ox, 0), max(-oy, 0)))
    for rect in view.get("erase", []):
        canvas.paste((0, 0, 0, 0), rect)
    return canvas


if __name__ == "__main__":
    session = new_session("u2net_human_seg")
    OUT.mkdir(parents=True, exist_ok=True)
    for name, src in (("before", Path(sys.argv[1])), ("after", Path(sys.argv[2]))):
        views = VIEWS[name]
        for i, (panel, view) in enumerate(zip(panels(src), views)):
            scale_view = views[view.get("scale_from", i)]
            out = OUT / f"{name}-{i}.webp"
            frame(panel, view, scale_view, session).save(out, quality=88, method=6)
            print("wrote", out)
