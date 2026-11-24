"""Cut the two portraits out of their backgrounds and frame them identically.

The particle morph samples these files at runtime, so both must share the same
canvas size and roughly the same head position; otherwise the stars travel
across the frame instead of rebuilding the face in place.

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

# Head position as fractions of the source image: (face centre x, top of hair,
# bottom of beard). Fractions keep this valid if a photo is swapped for a
# higher-resolution copy of the same shot.
HEAD_SRC = {
    "before": (420 / 1024, 200 / 1536, 610 / 1536),
    "after": (850 / 1500, 230 / 2000, 1200 / 2000),
}
HEAD_DST_TOP = 0.07       # head starts 7% from the top
HEAD_DST_HEIGHT = 0.60    # and fills 60% of the frame height
HEAD_DST_CENTER_X = 0.5


def frame(name: str, src: Path, session) -> None:
    img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    cut = remove(img, session=session, post_process_mask=True)
    # keep only the person: drop stray specks the matting left in the background
    a = np.asarray(cut.getchannel("A"))
    labels, n = ndimage.label(a > 32)
    if n > 1:
        sizes = ndimage.sum(np.ones_like(a), labels, range(1, n + 1))
        a = np.where(labels == 1 + int(np.argmax(sizes)), a, 0).astype(np.uint8)
    # soften the matte edge so particles fade out instead of forming a hard outline
    alpha = Image.fromarray(a).filter(ImageFilter.GaussianBlur(2))
    cut.putalpha(alpha)

    cx, t, b = HEAD_SRC[name]
    cx, t, b = cx * img.width, t * img.height, b * img.height
    scale = (SIZE[1] * HEAD_DST_HEIGHT) / (b - t)
    scaled = cut.resize((round(cut.width * scale), round(cut.height * scale)), Image.LANCZOS)
    ox = round(SIZE[0] * HEAD_DST_CENTER_X - cx * scale)
    oy = round(SIZE[1] * HEAD_DST_TOP - t * scale)

    canvas = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    canvas.alpha_composite(scaled, (max(ox, 0), max(oy, 0)), (max(-ox, 0), max(-oy, 0)))
    OUT.mkdir(parents=True, exist_ok=True)
    canvas.save(OUT / f"{name}.webp", quality=88, method=6)
    print("wrote", OUT / f"{name}.webp")


if __name__ == "__main__":
    session = new_session("u2net_human_seg")
    frame("before", Path(sys.argv[1]), session)
    frame("after", Path(sys.argv[2]), session)
