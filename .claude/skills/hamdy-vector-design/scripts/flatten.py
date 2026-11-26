"""Straighten a print photographed on a T-shirt (perspective, tilt, folds).

Simple tilt/perspective: give the 4 corners of the print, clockwise from top-left.
    python flatten.py photo.jpg --points 120,80 610,95 600,700 110,690 --size 3000x3600 --out flat.png

Curved/wrinkled print: give a grid of R x C points (row by row, left to right) that
lie on straight lines of the original design; each cell is straightened on its own.
    python flatten.py photo.jpg --grid 3x3 --points p1 p2 ... p9 --size 3000x3600 --out flat.png

--size is the output size in px; keep the print's real aspect ratio (e.g. 30x36 cm -> 3000x3600).
"""
import argparse
import cv2
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("image")
ap.add_argument("--points", nargs="+", required=True)
ap.add_argument("--grid", default="2x2", help="rows x cols of the points (2x2 = 4 corners)")
ap.add_argument("--size", default="3000x3000")
ap.add_argument("--out", required=True)
a = ap.parse_args()

img = cv2.imread(a.image, cv2.IMREAD_UNCHANGED)
if img is None:
    raise SystemExit(f"cannot read {a.image}")
R, C = map(int, a.grid.lower().split("x"))
W, H = map(int, a.size.lower().split("x"))
pts = np.array([[float(v) for v in p.split(",")] for p in a.points], np.float32)

if R == 2 and C == 2 and len(pts) == 4:
    # corners given clockwise: tl, tr, br, bl -> grid order tl, tr, bl, br
    pts = pts[[0, 1, 3, 2]]
if len(pts) != R * C:
    raise SystemExit(f"expected {R*C} points for a {R}x{C} grid, got {len(pts)}")
grid = pts.reshape(R, C, 2)

out = np.zeros((H, W) + img.shape[2:], img.dtype)
xs = np.linspace(0, W, C)
ys = np.linspace(0, H, R)
for r in range(R - 1):
    for c in range(C - 1):
        src = np.array([grid[r, c], grid[r, c + 1], grid[r + 1, c + 1], grid[r + 1, c]], np.float32)
        x0, x1, y0, y1 = xs[c], xs[c + 1], ys[r], ys[r + 1]
        dst = np.array([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], np.float32)
        M = cv2.getPerspectiveTransform(src, dst)
        warped = cv2.warpPerspective(img, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        X0, X1, Y0, Y1 = int(round(x0)), int(round(x1)), int(round(y0)), int(round(y1))
        out[Y0:Y1, X0:X1] = warped[Y0:Y1, X0:X1]
cv2.imwrite(a.out, out)
print(f"{a.out}  {W}x{H}  cells={(R-1)*(C-1)}")
