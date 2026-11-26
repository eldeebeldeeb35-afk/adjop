"""Put a design on a flat T-shirt mockup to show the client how it will look.

    python mockup.py design.svg --shirt "#111111" --width 0.42 --top 0.25 --out mockup.png
    python mockup.py design.png --shirt "#ffffff" --placement left-chest --out mockup.png

--width: design width as a share of the shirt body width (full front ~0.40-0.45).
--top:   design top as a share of image height.
"""
import argparse
import io
import cairosvg
from PIL import Image, ImageDraw, ImageFilter

ap = argparse.ArgumentParser()
ap.add_argument("design")
ap.add_argument("--shirt", default="#111111")
ap.add_argument("--width", type=float, default=0.42)
ap.add_argument("--top", type=float, default=0.27)
ap.add_argument("--placement", choices=["center", "left-chest"], default="center")
ap.add_argument("--size", type=int, default=1600)
ap.add_argument("--out", required=True)
a = ap.parse_args()

S = a.size
img = Image.new("RGB", (S, S), "#e9e6e1")
shirt = Image.new("L", (S, S), 0)
d = ImageDraw.Draw(shirt)
u = S / 100
body = [(30, 14), (40, 10), (44, 14), (50, 16), (56, 14), (60, 10), (70, 14), (88, 30), (79, 39),
        (72, 34), (72, 92), (28, 92), (28, 34), (21, 39), (12, 30)]
d.polygon([(x * u, y * u) for x, y in body], fill=255)
d.ellipse([43 * u, 7 * u, 57 * u, 19 * u], fill=0)
shirt = shirt.filter(ImageFilter.GaussianBlur(1.2))
hexc = a.shirt.lstrip("#")
col = tuple(int(hexc[i:i + 2], 16) for i in (0, 2, 4))
shadow = shirt.filter(ImageFilter.GaussianBlur(S / 60))
img.paste(Image.new("RGB", (S, S), (150, 145, 140)), (int(S * 0.006), int(S * 0.012)), shadow)
img.paste(Image.new("RGB", (S, S), col), (0, 0), shirt)

body_w = 44 * u
dw = int(body_w * (a.width if a.placement == "center" else 0.2))
if a.design.lower().endswith(".svg"):
    png = cairosvg.svg2png(url=a.design, output_width=dw)
    art = Image.open(io.BytesIO(png)).convert("RGBA")
else:
    art = Image.open(a.design).convert("RGBA")
    art = art.resize((dw, int(art.height * dw / art.width)), Image.LANCZOS)
if a.placement == "center":
    x, y = int(S / 2 - dw / 2), int(S * a.top)
else:
    x, y = int(57 * u), int(24 * u)
img.paste(art, (x, y), art)
img.save(a.out)
print(a.out)
