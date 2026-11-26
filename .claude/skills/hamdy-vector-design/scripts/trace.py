"""Trace a flat-colour PNG (from quantize.py) into a layered SVG: one <g> layer per colour.

    python trace.py quant.png --out design.svg [--width-cm 30] [--smooth 1]

Each colour is traced separately (binary mode, splines), so layers never overlap and
each layer is ready to become one screen. Transparent pixels are skipped.
"""
import argparse
import os
import re
import shutil
import tempfile
import numpy as np
import vtracer
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("image")
ap.add_argument("--out", required=True)
ap.add_argument("--width-cm", type=float, default=0, help="physical print width; sets SVG size in cm")
ap.add_argument("--smooth", type=int, default=1, help="0 sharp corners ... 3 very smooth")
ap.add_argument("--speckle", type=int, default=8, help="drop shapes smaller than this (px)")
a = ap.parse_args()

im = np.array(Image.open(a.image).convert("RGBA"))
h, w = im.shape[:2]
opaque = im[..., 3] > 127
cols, counts = np.unique(im[opaque][:, :3], axis=0, return_counts=True)
order = np.argsort(-counts)
corner = {0: 90, 1: 60, 2: 45, 3: 30}[max(0, min(3, a.smooth))]

layers = []
tmp = tempfile.mkdtemp()
for n, i in enumerate(order):
    c = cols[i]
    mask = opaque & np.all(im[..., :3] == c, axis=-1)
    if mask.sum() < a.speckle:
        continue
    p_in, p_out = os.path.join(tmp, f"m{n}.png"), os.path.join(tmp, f"m{n}.svg")
    Image.fromarray(np.where(mask, 0, 255).astype(np.uint8)).save(p_in)
    vtracer.convert_image_to_svg_py(p_in, p_out, colormode="binary", mode="spline",
                                    filter_speckle=a.speckle, corner_threshold=corner,
                                    length_threshold=4.0, splice_threshold=45, path_precision=2)
    paths = re.findall(r"<path[^>]*/>", open(p_out).read())
    hexc = "#%02x%02x%02x" % tuple(int(v) for v in c)
    paths = [re.sub(r'fill="[^"]*"', f'fill="{hexc}"', p) for p in paths]
    layers.append((hexc, paths))

shutil.rmtree(tmp, ignore_errors=True)
size = f'width="{a.width_cm}cm" height="{a.width_cm * h / w:.2f}cm"' if a.width_cm else f'width="{w}" height="{h}"'
with open(a.out, "w") as f:
    f.write(f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" '
            f'{size} viewBox="0 0 {w} {h}">\n')
    for n, (hexc, paths) in enumerate(layers, 1):
        f.write(f'<g id="screen-{n}" inkscape:groupmode="layer" inkscape:label="screen {n} {hexc}" data-color="{hexc}">\n')
        f.write("\n".join(paths) + "\n</g>\n")
    f.write("</svg>\n")
for n, (hexc, paths) in enumerate(layers, 1):
    print(f"screen {n}: {hexc}  {len(paths)} paths")
print(a.out)
