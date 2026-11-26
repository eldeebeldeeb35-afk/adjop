"""Proof: put a (new or redrawn) design onto the ORIGINAL product photo, with the fabric's
folds and lighting, so the client sees how it will really look before any vector work.
Works like a Photoshop mockup: remove the old print, warp the new art into place,
shade it with the fabric's light, and bend it slightly along the folds.

    python proof.py photo.jpg design.svg --points x,y x,y x,y x,y --out proof.png
    python proof.py photo.jpg design.svg --grid 3x3 --points p1 ... p9 --out proof.png

--points: where the design's corners go in the photo (clockwise from top-left), or a
          grid of points (row by row) for a curved/wrinkled surface, same as flatten.py.
--erase:  remove the old print first (default on): pixels that differ strongly from the
          fabric colour inside the print area are inpainted with the fabric.
--fabric: fabric colour (default: median colour around the print area).
"""
import argparse
import io

import cairosvg
import cv2
import numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("photo")
ap.add_argument("design")
ap.add_argument("--points", nargs="+", required=True)
ap.add_argument("--grid", default="2x2")
ap.add_argument("--fabric", default="")
ap.add_argument("--no-erase", action="store_true")
ap.add_argument("--bend", type=float, default=2.0, help="px of fold displacement (0 = flat)")
ap.add_argument("--erase-poly", nargs="+", default=[], help="extra polygon (x,y points) to clean of the old print, e.g. the whole sleeve")
ap.add_argument("--ink", type=float, default=0.93, help="ink brightness on the fabric (1 = as drawn)")
ap.add_argument("--rotate", type=int, default=0, choices=[0, 90, -90, 180], help="rotate the art first (e.g. -90 for a sleeve)")
ap.add_argument("--out", required=True)
a = ap.parse_args()

photo = cv2.imread(a.photo)
H, W = photo.shape[:2]
R, C = map(int, a.grid.lower().split("x"))
pts = np.array([[float(v) for v in p.split(",")] for p in a.points], np.float32)
if R == 2 and C == 2 and len(pts) == 4:
    pts = pts[[0, 1, 3, 2]]
grid = pts.reshape(R, C, 2)

# design -> RGBA at a resolution close to its size in the photo
span = np.linalg.norm(grid[0, -1] - grid[0, 0])
dw = int(max(200, span * 3 * (3 if a.rotate in (90, -90) else 1)))
if a.design.lower().endswith(".svg"):
    art = Image.open(io.BytesIO(cairosvg.svg2png(url=a.design, output_width=dw))).convert("RGBA")
else:
    art = Image.open(a.design).convert("RGBA")
if a.rotate:
    art = art.rotate(a.rotate, expand=True)
art = cv2.cvtColor(np.array(art), cv2.COLOR_RGBA2BGRA)
ah, aw = art.shape[:2]

# warp the art cell by cell into the photo
warped = np.zeros((H, W, 4), np.float32)
xs, ys = np.linspace(0, aw, C), np.linspace(0, ah, R)
for r in range(R - 1):
    for c in range(C - 1):
        src = np.float32([[xs[c], ys[r]], [xs[c + 1], ys[r]], [xs[c + 1], ys[r + 1]], [xs[c], ys[r + 1]]])
        dst = np.float32([grid[r, c], grid[r, c + 1], grid[r + 1, c + 1], grid[r + 1, c]])
        M = cv2.getPerspectiveTransform(src, dst)
        cell = cv2.warpPerspective(art, M, (W, H), flags=cv2.INTER_LINEAR).astype(np.float32)
        m = np.zeros((H, W), np.uint8)
        cv2.fillConvexPoly(m, dst.astype(np.int32), 1)
        m = cv2.dilate(m, np.ones((3, 3), np.uint8)).astype(bool)
        warped[m] = cell[m]
alpha = warped[..., 3:] / 255.0

# print area (hull of the points, padded) and fabric colour
area = np.zeros((H, W), np.uint8)
cv2.fillConvexPoly(area, cv2.convexHull(pts.astype(np.int32)), 255)
pad = int(span * 0.06) + 3
area_big = cv2.dilate(area, np.ones((pad, pad), np.uint8))
if a.erase_poly:
    ep = np.array([[float(v) for v in p.split(",")] for p in a.erase_poly], np.int32)
    cv2.fillPoly(area_big, [ep], 255)
ringm = cv2.dilate(area_big, np.ones((pad, pad), np.uint8)) & ~area_big
if a.fabric:
    h = a.fabric.lstrip("#")
    fabric = np.array([int(h[4:6], 16), int(h[2:4], 16), int(h[0:2], 16)], np.float32)
else:
    fabric = np.median(photo[ringm > 0], axis=0).astype(np.float32)

base = photo.copy()
if not a.no_erase:
    # old print = pixels clearly brighter/paler than the fabric (shadows and folds stay)
    f = photo.astype(np.float32)
    lum_p, lum_f = f.mean(2), float(fabric.mean())
    sat_p = f.max(2) - f.min(2)
    old = ((lum_p > lum_f + 50) & (sat_p < float(fabric.max() - fabric.min()) * 0.7) & (area_big > 0)).astype(np.uint8) * 255
    old = cv2.dilate(old, np.ones((7, 7), np.uint8))
    base = cv2.inpaint(photo, old, 7, cv2.INPAINT_TELEA)

# fabric light: brightness of the (cleaned) fabric relative to its average
lum = cv2.cvtColor(base, cv2.COLOR_BGR2GRAY).astype(np.float32)
lum = cv2.GaussianBlur(cv2.medianBlur(lum.astype(np.uint8), 9).astype(np.float32), (0, 0), 6.0)  # broad folds only; no inpaint streaks
ref = float(np.median(lum[area_big > 0])) or 1.0
shade = np.clip(lum / ref, 0.55, 1.35)[..., None]

# bend the art along the folds (displacement map from the fabric's light)
if a.bend:
    gy, gx = np.gradient(cv2.GaussianBlur(lum, (0, 0), 4.0))
    gmax = max(np.abs(gx).max(), np.abs(gy).max(), 1e-6)
    mx, my = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    mx = mx - gx / gmax * a.bend
    my = my - gy / gmax * a.bend
    warped = cv2.remap(warped, mx.astype(np.float32), my.astype(np.float32), cv2.INTER_LINEAR)
    alpha = warped[..., 3:] / 255.0

ink = warped[..., :3] * shade * a.ink
# a little fabric texture through the ink
src_tex = photo if a.no_erase else np.where((area_big > 0)[..., None], cv2.GaussianBlur(base, (0, 0), 3), base)
tex = (src_tex.astype(np.float32) - cv2.GaussianBlur(src_tex, (0, 0), 1.5).astype(np.float32)) * 0.2
out = base.astype(np.float32) * (1 - alpha) + np.clip(ink + tex, 0, 255) * alpha
cv2.imwrite(a.out, np.clip(out, 0, 255).astype(np.uint8))
print(a.out)
