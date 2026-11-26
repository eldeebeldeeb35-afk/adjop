"""Draw a labelled pixel grid over an image so the corners/points of a print can be read off it.

    python grid.py photo.jpg --step 50 --out photo_grid.png
"""
import argparse
from PIL import Image, ImageDraw, ImageOps

ap = argparse.ArgumentParser()
ap.add_argument("image")
ap.add_argument("--step", type=int, default=0, help="grid spacing in px (default: ~1/20 of the long side)")
ap.add_argument("--out", required=True)
a = ap.parse_args()

im = ImageOps.exif_transpose(Image.open(a.image)).convert("RGB")
w, h = im.size
step = a.step or max(10, round(max(w, h) / 20 / 10) * 10)
d = ImageDraw.Draw(im)
for x in range(0, w, step):
    d.line([(x, 0), (x, h)], fill=(255, 0, 0) if x % (step * 5) == 0 else (255, 160, 160), width=1)
    d.text((x + 2, 2), str(x), fill=(255, 0, 0))
for y in range(0, h, step):
    d.line([(0, y), (w, y)], fill=(0, 0, 255) if y % (step * 5) == 0 else (160, 160, 255), width=1)
    d.text((2, y + 2), str(y), fill=(0, 0, 255))
im.save(a.out)
print(f"{a.out}  size={w}x{h}  step={step}")
