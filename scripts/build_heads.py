"""Fuse the prepared portrait views into one 3D star cloud per look.

The views (public/portraits/{before,after}-N.webp, framed by
scripts/prepare_portraits.py) are treated as orthographic photos of one head.

1. MediaPipe Face Landmarker finds the face in each view: 478 landmarks with
   relative depth, plus the head's yaw. The master view's landmarks give the
   real relief of the face (nose, eye sockets, lips, chin); the other views are
   registered to it by reprojecting those landmarks.
2. Shape: an elliptical head/neck volume from the master silhouette, carved by
   the other registered silhouettes, with the face mesh pressed into its front.
3. Surface voxels are shaded from the views that see them head-on (z-buffered),
   mirroring left/right for sides no photo shows.
4. Stars are importance-sampled on the surface: lit skin and feature edges
   dense, shadow sparse (same weighting as lib/samplePortrait.ts).

Output: public/portraits/head-{before,after}.bin — records of uint16 x, y, z
(0..65535 over [-0.5, 0.5]), int8 normal x, y, z (/127), uint8 brightness.

Usage (needs numpy, scipy, pillow, mediapipe; libEGL on Linux):
    python scripts/build_heads.py path/to/face_landmarker.task
The model: https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task
"""
import math
import sys
from pathlib import Path

import mediapipe as mp
import numpy as np
from mediapipe.tasks.python import BaseOptions, vision
from PIL import Image
from scipy import ndimage
from scipy.interpolate import griddata

PORTRAITS = Path(__file__).resolve().parent.parent / "public" / "portraits"
W, H = 360, 450  # processing resolution (frames are 720x900, 4:5)
ASPECT = W / H
STARS = 60000
RES = 0.004  # voxel size in portrait units (frame height = 1)
CHIN = 0.62  # frame-height fraction where the head ends and the neck starts
BOTTOM = 0.70  # nothing below this: head, neck and a hint of the shoulders

# Which views feed each look. Yaw comes from the face landmarker; views with no
# visible face need a fallback yaw (degrees, negative = face toward image-left).
# before-1 (looking up) is left out: its head is tilted back, so its outline and
# features do not line up with the other two photos.
LOOKS = {
    "before": {"views": [2, 0], "fallback_yaw": {0: -125.0}, "mirror": True},
    # all sides of the face are photographed, so no mirroring (it would add a seam)
    "after": {"views": [1, 0, 2], "fallback_yaw": {}, "mirror": False},
}
DTYPE = [("x", "<u2"), ("y", "<u2"), ("z", "<u2"), ("nx", "i1"), ("ny", "i1"), ("nz", "i1"), ("b", "u1")]


def load_view(name, i, detector):
    im = Image.open(PORTRAITS / f"{name}-{i}.webp").convert("RGBA")
    bg = Image.new("RGBA", im.size, (128, 128, 128, 255))
    bg.alpha_composite(im)
    res = detector.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(np.asarray(bg.convert("RGB")))))
    lm = yaw = None
    if res.face_landmarks:
        lm = np.array([[p.x * W, p.y * H, p.z * W] for p in res.face_landmarks[0]])  # pixels at W x H
        R = np.array(res.facial_transformation_matrixes[0])[:3, :3]
        yaw = math.degrees(math.atan2(R[0, 2], R[2, 2]))

    a = np.asarray(im.resize((W, H), Image.LANCZOS)).astype(np.float32) / 255.0
    alpha = a[..., 3]
    lum = 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
    ranks = np.sort(lum[alpha > 0.5])
    lum = np.searchsorted(ranks, lum).astype(np.float32) / max(len(ranks), 1)
    blur = ndimage.uniform_filter(ndimage.uniform_filter(lum, 9), 9)
    lum = np.clip(lum * 0.85 + (lum - blur) * 2.2 + 0.05, 0, 1)
    edge = np.hypot(ndimage.sobel(lum, axis=1), ndimage.sobel(lum, axis=0)) * alpha
    edge /= edge.max() + 1e-6
    sil = ndimage.binary_dilation(alpha > 0.35, iterations=4)
    return dict(alpha=alpha, lum=lum, edge=edge, sil=sil, lm=lm, yaw=yaw, dx=0.0, dy=0.0)


def to_cam(X, Y, Z, yaw):
    c, s = math.cos(math.radians(yaw)), math.sin(math.radians(yaw))
    return X * c + Z * s, -X * s + Z * c


def project(v, X, Y, Z):
    xp, zp = to_cam(X, Y, Z, v["yaw"])
    col = xp * H + W / 2 + v["dx"]
    row = (0.5 - Y) * H + v["dy"]
    return col, row, zp


def lookup(img, col, row):
    ci = np.clip(col.astype(int), 0, W - 1)
    ri = np.clip(row.astype(int), 0, H - 1)
    ok = (col >= 0) & (col < W) & (row >= 0) & (row < H)
    return np.where(ok, img[ri, ci], 0)


def build(name, cfg, detector):
    views = {i: load_view(name, i, detector) for i in cfg["views"]}
    for i, v in views.items():
        if v["yaw"] is None:
            v["yaw"] = cfg["fallback_yaw"][i]
        print(f"  {name}-{i}: yaw {v['yaw']:+.0f}°", "(face found)" if v["lm"] is not None else "(no face, fallback)")
    master = views[cfg["views"][0]]

    # face mesh in object space: unrotate the master's landmarks by its yaw
    lm = master["lm"]
    Xc = (lm[:, 0] - W / 2) / H
    Yf = 0.5 - lm[:, 1] / H
    Zc = -lm[:, 2] / H  # toward the camera is +Z; MediaPipe's depth origin is the head centre
    c, s = math.cos(math.radians(master["yaw"])), math.sin(math.radians(master["yaw"]))
    face = np.stack([Xc * c - Zc * s, Yf, Xc * s + Zc * c], 1)

    # register the other views: shift each so the face lands where it was detected
    for v in views.values():
        if v is master or v["lm"] is None:
            continue
        col, row, _ = project(v, face[:, 0], face[:, 1], face[:, 2])
        v["dx"] = float(np.median(v["lm"][:, 0] - col))
        v["dy"] = float(np.median(v["lm"][:, 1] - row))
        print(f"    registered shift {v['dx']:+.1f}, {v['dy']:+.1f} px")

    xs = np.arange(-ASPECT / 2, ASPECT / 2, RES)
    ys = np.arange(0.5 - BOTTOM, 0.5, RES)
    zs = np.arange(-0.45, 0.45, RES)
    X, Y, Z = np.meshgrid(xs, ys, zs, indexing="ij")

    # face relief in the master camera frame: the landmark depth minus its broad
    # curve, so only nose / eye sockets / lips / chin are added to the rounded head
    zmesh = griddata(lm[:, :2], -lm[:, 2] / H, np.mgrid[0:W, 0:H].T[..., ::-1].reshape(-1, 2)[:, ::-1], method="linear")
    zmesh = zmesh.reshape(H, W)
    footprint = np.isfinite(zmesh)
    zfill = np.where(footprint, zmesh, np.nanmean(zmesh))
    base = ndimage.gaussian_filter(zfill, 14)
    relief = (zfill - base) * 1.3 * ndimage.gaussian_filter(footprint.astype(np.float32), 6)

    # rounded head/neck volume from the master outline (in its own camera frame)
    msil = master["alpha"] > 0.35
    left = np.full(H, np.nan)
    right = np.full(H, np.nan)
    for r in range(H):
        cols = np.nonzero(msil[r])[0]
        if len(cols):
            left[r], right[r] = cols[0], cols[-1]
    centre = ((left + right) / 2 - W / 2) / H
    half = (right - left) / 2 / H
    depth_ratio = np.where(np.arange(H) / H < CHIN, 1.1, 0.6)
    col, row, zp = project(master, X, Y, Z)
    xp = (col - W / 2) / H
    ri = np.clip(row.astype(int), 0, H - 1)
    ci = np.clip(col.astype(int), 0, W - 1)
    with np.errstate(invalid="ignore", divide="ignore"):
        u = (xp - centre[ri]) / half[ri]
        zlim = depth_ratio[ri] * half[ri] * np.sqrt(np.clip(1 - u ** 2, 0, 1))
    front = zlim + relief[ri, ci]
    occ = (np.abs(u) <= 1) & (zp <= front) & (zp >= -zlim)
    occ &= ~np.isnan(half[ri])

    # carve with the other photos only when they are registered to the face;
    # an unregistered back view would cut the head along a misplaced outline
    for v in views.values():
        if v is master or v["lm"] is None:
            continue
        col, row, _ = project(v, X, Y, Z)
        occ &= lookup(v["sil"].astype(np.float32), col, row) > 0.5
    occ = ndimage.binary_closing(occ, iterations=2)
    occ = ndimage.binary_fill_holes(occ)

    surface = occ & ~ndimage.binary_erosion(occ)
    smooth = ndimage.gaussian_filter(occ.astype(np.float32), 1.6)
    gX, gY, gZ = np.gradient(smooth)
    idx = np.nonzero(surface)
    P = np.stack([X[idx], Y[idx], Z[idx]], 1)
    N = -np.stack([gX[idx], gY[idx], gZ[idx]], 1)
    N /= np.linalg.norm(N, axis=1, keepdims=True) + 1e-6

    def shade(P, N):
        acc = np.zeros((3, len(P)))
        for v in views.values():
            d = np.array([-math.sin(math.radians(v["yaw"])), 0.0, math.cos(math.radians(v["yaw"]))])
            # sharp weights: each spot takes its detail mainly from the photo that
            # faces it, so small misalignments between photos do not double the face
            w = np.clip(N @ d, 0, 1) ** 10 * (2.0 if v is master else 1.0)
            col, row, zp = project(v, P[:, 0], P[:, 1], P[:, 2])
            pix = np.clip(row.astype(int), 0, H - 1) * W + np.clip(col.astype(int), 0, W - 1)
            zbuf = np.full(W * H, -np.inf)
            np.maximum.at(zbuf, pix, zp)
            w = w * (zp >= zbuf[pix] - 3 * RES) * (lookup(v["alpha"], col, row) > 0.3)
            acc += w * np.stack([lookup(v["lum"], col, row), lookup(v["edge"], col, row), np.ones(len(P))])
        return acc

    L, E, Wt = shade(P, N)
    if cfg["mirror"]:
        Lm, Em, Wm = shade(P * [-1, 1, 1], N * [-1, 1, 1])
        use = (Wt < 1e-3) & (Wm > 1e-3)  # only fill sides no photo shows
        L, E, Wt = np.where(use, Lm, L), np.where(use, Em, E), np.where(use, Wm, Wt)
    seen = Wt > 1e-3
    # sides no photo shows (the back of the head): a faint hair-like dusting
    noise = ndimage.gaussian_filter(np.random.default_rng(3).random(len(P)), 0)
    lum = np.where(seen, L / np.maximum(Wt, 1e-6), 0.28 + 0.22 * noise)
    edge = np.where(seen, E / np.maximum(Wt, 1e-6), 0.0)

    fy = 0.5 - P[:, 1]
    fade = 1 - 0.85 * np.clip((fy - 0.64) / 0.10, 0, 1)
    e = np.clip((edge - 0.1) / 0.4, 0, 1)
    weight = fade * (0.05 + lum ** 2.4 * 0.8 + e * e * 1.8)
    rng = np.random.default_rng(7)
    pick = rng.choice(len(P), size=STARS, p=weight / weight.sum())
    pts = P[pick] + (rng.random((STARS, 3)) - 0.5) * RES
    bright = np.clip(0.15 + lum[pick] ** 1.4 * 0.7 + edge[pick] * 0.6, 0, 1)

    rec = np.zeros(STARS, dtype=DTYPE)
    q = np.clip((pts + 0.5) * 65535, 0, 65535).astype(np.uint16)
    nq = np.clip(np.round(N[pick] * 127), -127, 127).astype(np.int8)
    rec["x"], rec["y"], rec["z"] = q.T
    rec["nx"], rec["ny"], rec["nz"] = nq.T
    rec["b"] = (bright * 255).astype(np.uint8)
    print(f"  {len(P)} surface voxels, {seen.mean():.0%} seen by a photo")
    return rec


if __name__ == "__main__":
    opts = vision.FaceLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=sys.argv[1]),
        num_faces=1,
        output_facial_transformation_matrixes=True,
    )
    detector = vision.FaceLandmarker.create_from_options(opts)
    for name, cfg in LOOKS.items():
        print(name)
        rec = build(name, cfg, detector)
        out = PORTRAITS / f"head-{name}.bin"
        rec.tofile(out)
        print("  wrote", out.name, out.stat().st_size, "bytes")
