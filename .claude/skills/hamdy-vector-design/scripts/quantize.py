"""Clean a flattened print and reduce it to a few flat colours (one per screen).

    python quantize.py flat.png --colors 3 --out quant.png
    python quantize.py flat.png --palette "#111111,#d9ae5f,#ffffff" --bg "#ffffff" --out quant.png

- Removes fabric texture and JPEG noise (bilateral + median filter).
- --colors N: k-means picks N colours.  --palette: snap every pixel to these exact colours.
- --bg: colour that is shirt/background, made transparent ("auto" = most common border colour,
  "none" = keep everything).
- --min-area: specks smaller than this many px are merged into their surroundings.
Writes quant.png and quant.json (colours with pixel share), and prints them.
"""
import argparse
import json
import cv2
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("image")
ap.add_argument("--colors", type=int, default=0)
ap.add_argument("--palette", default="")
ap.add_argument("--bg", default="auto")
ap.add_argument("--smooth", type=int, default=2, help="0-4, how hard to smooth fabric texture")
ap.add_argument("--clean", type=int, default=-1, help="px; strips thinner than 2x this are treated as fringe and removed (-1 = auto, 0 = off; use 0-1 for designs with hairlines)")
ap.add_argument("--min-area", type=int, default=0, help="default: 0.002%% of the image")
ap.add_argument("--out", required=True)
a = ap.parse_args()

hexrgb = lambda h: tuple(int(h.strip().lstrip("#")[i:i + 2], 16) for i in (0, 2, 4))
rgbhex = lambda c: "#%02x%02x%02x" % tuple(int(v) for v in c)

src = cv2.imread(a.image, cv2.IMREAD_UNCHANGED)
alpha = src[..., 3] if src.ndim == 3 and src.shape[2] == 4 else None
bgr = src[..., :3] if src.ndim == 3 else cv2.cvtColor(src, cv2.COLOR_GRAY2BGR)
h, w = bgr.shape[:2]
img = bgr.copy()
for _ in range(a.smooth):
    img = cv2.bilateralFilter(img, 9, 40, 9)
if a.smooth:
    img = cv2.medianBlur(img, 3 + 2 * min(a.smooth, 2))

lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).reshape(-1, 3).astype(np.float32)
if a.palette:
    pal_rgb = [hexrgb(p) for p in a.palette.split(",")]
    pal_bgr = np.array([[c[::-1]] for c in pal_rgb], np.uint8)
    centers = cv2.cvtColor(pal_bgr, cv2.COLOR_BGR2LAB).reshape(-1, 3).astype(np.float32)
    labels = np.argmin(((lab[:, None, :] - centers[None]) ** 2).sum(-1), 1)
else:
    k = a.colors or 4
    crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.5)
    sample = lab[np.random.default_rng(0).choice(len(lab), min(len(lab), 200000), replace=False)]
    _, _, centers = cv2.kmeans(sample, k, None, crit, 4, cv2.KMEANS_PP_CENTERS)
    labels = np.argmin(((lab[:, None, :] - centers[None]) ** 2).sum(-1), 1)
labels = labels.reshape(h, w).astype(np.int32)

# remove thin strips (anti-alias fringes where two colours meet): any part of a colour
# thinner than 2*clean px is handed to the nearest other colour
clean = a.clean if a.clean >= 0 else max(2, round(min(h, w) / 400))
if clean:
    ker = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * clean + 1, 2 * clean + 1))
    keep = np.zeros((h, w), bool)
    for k in range(len(centers)):
        m = (labels == k).astype(np.uint8)
        keep |= cv2.morphologyEx(m, cv2.MORPH_OPEN, ker).astype(bool)
    dist = np.stack([cv2.distanceTransform(((labels == k) & keep).__invert__().astype(np.uint8), cv2.DIST_L2, 3)
                     for k in range(len(centers))])
    labels = np.where(keep, labels, dist.argmin(0)).astype(np.int32)

# remove specks: reassign tiny components to the most common neighbouring label
min_area = a.min_area or max(4, int(h * w * 0.00002))
for _ in range(2):
    for k in range(len(centers)):
        n, comp, stats, _ = cv2.connectedComponentsWithStats((labels == k).astype(np.uint8), 8)
        for i in range(1, n):
            if stats[i, cv2.CC_STAT_AREA] < min_area:
                m = comp == i
                ring = cv2.dilate(m.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool) & ~m
                if ring.any():
                    labels[m] = np.bincount(labels[ring]).argmax()

cbgr = cv2.cvtColor(np.clip(centers, 0, 255).astype(np.uint8).reshape(-1, 1, 3), cv2.COLOR_LAB2BGR).reshape(-1, 3)
if a.palette:
    cbgr = np.array([c[::-1] for c in pal_rgb], np.uint8)
out = cbgr[labels]

bg_idx = None
if a.bg != "none":
    if a.bg == "auto":
        border = np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]])
        bg_idx = int(np.bincount(border).argmax())
    else:
        t = np.array(hexrgb(a.bg)[::-1])
        bg_idx = int(np.argmin(((cbgr.astype(int) - t) ** 2).sum(1)))
a_out = np.where(labels == bg_idx, 0, 255).astype(np.uint8)
if alpha is not None:
    a_out = np.minimum(a_out, alpha)
cv2.imwrite(a.out, np.dstack([out, a_out]))

info = []
for k in range(len(cbgr)):
    share = float((labels == k).mean())
    info.append({"color": rgbhex(cbgr[k][::-1]), "share": round(share, 4), "background": k == bg_idx})
info.sort(key=lambda d: -d["share"])
json.dump(info, open(a.out.rsplit(".", 1)[0] + ".json", "w"), indent=1)
for d in info:
    print(f'{d["color"]}  {d["share"]*100:5.1f}%{"  (background, removed)" if d["background"] else ""}')
