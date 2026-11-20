"""Logo motion graphic renderer — Elegant Reveal.
usage: python3 render.py <W> <H> <logo_px> <out_prefix>
Produces <prefix>_frames piped into ffmpeg: opaque MP4 (bg) and alpha MOV/WebM.
"""
import sys, subprocess, math
import numpy as np, cv2
from multiprocessing import Pool

W, H, LOGO, PREFIX = int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
FPS, DUR = 60, 5.0
N = int(FPS * DUR)

# ---------- source preparation ----------
src = cv2.imread('logo.jpg').astype(np.float32)[..., ::-1]  # RGB
hsv = cv2.cvtColor(src[..., ::-1].astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32)
S, V = hsv[..., 1], hsv[..., 2]
gold = np.clip((S - 60) / 50, 0, 1)
black = np.clip((110 - V) / 50, 0, 1) * (1 - gold)
alpha = np.maximum(gold, black)
bw = (alpha > 0.35).astype(np.uint8)
n, lab, st, cen = cv2.connectedComponentsWithStats(bw, 8)
solid = np.zeros(bw.shape, np.float32)
for i in (1, 2, 3, 8, 9, 12, 13, 14, 15, 16, 17, 18):
    m = cv2.morphologyEx((lab == i).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    lab[(m > 0) & (lab == 0)] = i
    solid = np.maximum(solid, cv2.erode(m, np.ones((5, 5), np.uint8)).astype(np.float32))
solid = cv2.GaussianBlur(solid, (0, 0), 0.8)
alpha = np.maximum(alpha, solid)
# grow labels slightly so soft edges belong to their component
lab_d = lab.copy()
for _ in range(3):
    grown = cv2.dilate(lab_d.astype(np.float32), np.ones((3, 3), np.uint8)).astype(lab.dtype)
    lab_d = np.where(lab_d == 0, grown, lab_d)

C0, C1 = 110, 690  # crop
def crop(a): return a[C0:C1, C0:C1]
src, gold, black, alpha, lab_d = map(crop, (src, gold, black, alpha, lab_d))
sc = LOGO / (C1 - C0)
def rs(a, interp=cv2.INTER_LANCZOS4):
    return cv2.resize(a, (LOGO, LOGO), interpolation=interp)
src = np.clip(rs(src), 0, 255)
gold = np.clip(rs(gold), 0, 1); alpha = np.clip(rs(alpha), 0, 1)
lab_d = cv2.resize(lab_d.astype(np.int32).astype(np.float32), (LOGO, LOGO), interpolation=cv2.INTER_NEAREST).astype(np.int32)

# remove cream fringe: un-mix background colour from edge pixels
BGC = np.array([238, 232, 218], np.float32)
a3 = np.maximum(alpha, 1e-3)[..., None]
col = np.where(alpha[..., None] > 0.02, (src - BGC * (1 - alpha[..., None])) / a3, 0)
col = np.where(alpha[..., None] > 0.97, src, col)
col = np.clip(col, 0, 255)

yy, xx = np.mgrid[0:LOGO, 0:LOGO].astype(np.float32)
u, v = xx / LOGO, yy / LOGO

def m_of(ids):
    return np.isin(lab_d, ids).astype(np.float32) * alpha

FRAME = m_of([1])
LETTERS = [  # id, start time, duration, direction
    (2, 1.00, 0.75, 'rl'), (3, 1.20, 0.45, 'tb'), (8, 1.25, 0.60, 'tb'),
    (9, 1.40, 0.60, 'rl'), (13, 1.55, 0.65, 'rl'), (15, 1.70, 0.70, 'rl'),
]
DOTS = [(12, 2.30), (14, 2.38), (18, 2.46), (17, 2.54), (16, 2.62)]
L_MASK = {i: m_of([i]) for i, *_ in LETTERS}
D_MASK = {i: m_of([i]) for i, _ in DOTS}
D_CEN = {}
for i, _ in DOTS:
    ys, xs = np.nonzero(D_MASK[i] > 0.5); D_CEN[i] = (xs.mean(), ys.mean())
L_BOX = {}
for i, *_ in LETTERS:
    ys, xs = np.nonzero(L_MASK[i] > 0.3); L_BOX[i] = (xs.min(), xs.max(), ys.min(), ys.max())

# frame path parameter: angle around centre, starting at the top gap, counter-clockwise
cx = cy = LOGO / 2
theta = np.degrees(np.arctan2(-(yy - cy), xx - cx))
gx, gy = (490 - C0) * sc, (158 - C0) * sc
theta0 = math.degrees(math.atan2(-(gy - cy), gx - cx))
T = ((theta - theta0) % 360) / 360.0
fmask = FRAME > 0.3
T_end = T[fmask].max()
T = T / T_end

# ---------- helpers ----------
def clamp(x, a=0., b=1.): return max(a, min(b, x))
def sstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)
def ease_io(t): t = clamp(t); return 0.5 - 0.5 * math.cos(math.pi * t)
def ease_out(t): t = clamp(t); return 1 - (1 - t) ** 3
def back_out(t, s=2.2):
    t = clamp(t) - 1; return 1 + t * t * ((s + 1) * t + s)
def prog(t, s, d): return clamp((t - s) / d)

# background
BY, BX = np.mgrid[0:H, 0:W].astype(np.float32)
r = np.sqrt(((BX - W / 2) / (0.75 * max(W, H))) ** 2 + ((BY - H * 0.47) / (0.75 * max(W, H))) ** 2)
c_in, c_out = np.array([250, 246, 238], np.float32), np.array([214, 202, 182], np.float32)
BG = c_in + (c_out - c_in) * np.clip(r, 0, 1)[..., None] ** 1.4
grain = np.random.default_rng(7).normal(0, 1.6, (H, W, 1)).astype(np.float32)
BG = BG + grain

rng = np.random.default_rng(3)
NP = 55
P_pos = rng.uniform([0, 0], [W, H], (NP, 2)); P_vel = rng.uniform([-6, -28], [6, -8], (NP, 2))
P_sz = rng.uniform(1.0, 3.6, NP); P_ph = rng.uniform(0, 6.28, NP); P_sp = rng.uniform(1.5, 4, NP)
GOLD_RGB = np.array([226, 176, 72], np.float32)

def glow(canvas_add, x, y, radius, rgb, k):
    x0, x1 = int(max(0, x - 3 * radius)), int(min(canvas_add.shape[1], x + 3 * radius))
    y0, y1 = int(max(0, y - 3 * radius)), int(min(canvas_add.shape[0], y + 3 * radius))
    if x1 <= x0 or y1 <= y0: return
    gy_, gx_ = np.mgrid[y0:y1, x0:x1].astype(np.float32)
    g = np.exp(-((gx_ - x) ** 2 + (gy_ - y) ** 2) / (2 * radius ** 2)) * k
    canvas_add[y0:y1, x0:x1] += g[..., None] * rgb

# ---------- per-frame ----------
def render(fi):
    t = fi / FPS
    # --- logo layer (premultiplied) at LOGO res ---
    p = ease_io(prog(t, 0.20, 1.35)) * 1.02
    a_frame = FRAME * sstep(p, p - 0.012, T) if p > 0 else FRAME * 0
    A = a_frame.copy()
    for i, s, d, dr in LETTERS:
        q = ease_out(prog(t, s, d))
        if q <= 0: continue
        x0, x1, y0, y1 = L_BOX[i]
        if dr == 'rl':
            edge = x1 - q * (x1 - x0 + 40) ; w = sstep(edge - 1, edge + 25, xx)
        else:
            edge = y0 + q * (y1 - y0 + 40); w = sstep(edge + 1, edge - 25, yy)
        A = np.maximum(A, L_MASK[i] * w * clamp(q * 3))
    DOT_LAYERS = []
    for i, s in DOTS:
        q = prog(t, s, 0.45)
        if q <= 0: continue
        k = back_out(q); dcx, dcy = D_CEN[i]
        M = np.float32([[k, 0, dcx * (1 - k)], [0, k, dcy * (1 - k)]])
        DOT_LAYERS.append(cv2.warpAffine(D_MASK[i], M, (LOGO, LOGO), flags=cv2.INTER_LINEAR) * clamp(q * 4))
    for dl in DOT_LAYERS:
        A = np.maximum(A, dl)
    rgb = col.copy()
    # shine sweep across gold
    c = -0.35 + 1.9 * ease_io(prog(t, 2.85, 1.0))
    if 2.85 < t < 3.9:
        d = (u * 0.85 + v * 0.55)
        band = np.exp(-((d - c) / 0.045) ** 2) + 0.35 * np.exp(-((d - c + 0.06) / 0.12) ** 2)
        rgb = rgb + band[..., None] * (gold[..., None] * np.array([255, 235, 190]) * 0.85 + (1 - gold[..., None]) * 55)
    # frame-draw head highlight on the gold itself
    if 0.2 < t < 1.65:
        head = np.exp(-((T - p) / 0.02) ** 2) * fmask
        rgb = rgb + head[..., None] * np.array([255, 240, 200]) * 0.9
    rgb = np.clip(rgb, 0, 255)
    pre = rgb * A[..., None]

    # --- global transform (slow push-in) ---
    k = 0.94 + 0.06 * ease_out(t / DUR)
    ox, oy = W / 2, H / 2 - H * 0.01
    M = np.float32([[k, 0, ox - k * LOGO / 2], [0, k, oy - k * LOGO / 2]])
    preW = cv2.warpAffine(pre, M, (W, H), flags=cv2.INTER_LINEAR)
    AW = cv2.warpAffine(A, M, (W, H), flags=cv2.INTER_LINEAR)

    # shadow
    sh = cv2.GaussianBlur(cv2.warpAffine(A, np.float32([[k, 0, ox - k * LOGO / 2], [0, k, oy - k * LOGO / 2 + LOGO * 0.025]]), (W, H)), (0, 0), LOGO * 0.025) * 0.38
    sh2 = cv2.GaussianBlur(AW, (0, 0), LOGO * 0.006) * 0.25
    shadow = np.clip(sh + sh2, 0, 0.6)
    SHC = np.array([60, 40, 20], np.float32)

    # additive light (spark head, flash)
    add = np.zeros((H, W, 3), np.float32)
    if 0.2 < t < 1.75 and p < 1.0:
        sel = fmask & (np.abs(T - p) < 0.006)
        if sel.any():
            ys, xs = np.nonzero(sel)
            hx, hy = ox + k * (xs.mean() - LOGO / 2), oy + k * (ys.mean() - LOGO / 2)
            fade = clamp((1.0 - p) * 8) * clamp((t - 0.2) * 6)
            glow(add, hx, hy, LOGO * 0.06, np.array([255, 200, 110]), 0.55 * fade)
            glow(add, hx, hy, LOGO * 0.012, np.array([255, 250, 235]), 1.0 * fade)
    fl = math.exp(-((t - 2.95) / 0.35) ** 2)
    if fl > 0.01:
        glow(add, ox, oy, LOGO * 0.55, np.array([255, 225, 160]), 0.22 * fl)

    # particles (bg layer)
    part = np.zeros((H, W), np.float32)
    pa = clamp(t * 1.5)
    for j in range(NP):
        x = (P_pos[j, 0] + P_vel[j, 0] * t) % W; y = (P_pos[j, 1] + P_vel[j, 1] * t) % H
        tw = 0.5 + 0.5 * math.sin(P_ph[j] + P_sp[j] * t)
        cv2.circle(part, (int(x), int(y)), int(round(P_sz[j])), float(tw * pa), -1, cv2.LINE_AA)
    part = cv2.GaussianBlur(part, (0, 0), 1.2)

    # ---- opaque composite ----
    bgk = 0.75 + 0.25 * ease_out(prog(t, 0, 0.6))
    out = BG * bgk
    out = out + part[..., None] * (GOLD_RGB - out) * 0.55
    out = out * (1 - shadow[..., None]) + SHC * shadow[..., None]
    out = out * (1 - AW[..., None]) + preW
    out = out + add
    fadein = ease_out(prog(t, 0, 0.35))
    out = out * fadein
    opaque = np.clip(out, 0, 255).astype(np.uint8)

    # ---- alpha composite (logo + shadow + glow, no bg) ----
    glow_a = np.clip(add.max(axis=2) / 255.0, 0, 1)
    a_out = np.clip(AW + shadow * (1 - AW) + glow_a * (1 - AW) * 0.8, 0, 1)
    pre_out = preW + SHC * shadow[..., None] * (1 - AW[..., None]) + add
    straight = np.where(a_out[..., None] > 1e-4, pre_out / np.maximum(a_out[..., None], 1e-4), 0)
    rgba = np.dstack([np.clip(straight, 0, 255), a_out * 255]).astype(np.uint8)
    return opaque.tobytes(), rgba.tobytes()

def ff(args):
    return subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error'] + args, stdin=subprocess.PIPE)

if __name__ == '__main__':
    if len(sys.argv) > 5 and sys.argv[5] == 'preview':
        for fi in map(int, sys.argv[6].split(',')):
            o, a = render(fi)
            cv2.imwrite(f'{PREFIX}_prev_{fi}.png', np.frombuffer(o, np.uint8).reshape(H, W, 3)[..., ::-1])
        sys.exit()
    raw = ['-f', 'rawvideo', '-s', f'{W}x{H}', '-r', str(FPS)]
    p_op = ff(raw + ['-pix_fmt', 'rgb24', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '14',
                     '-pix_fmt', 'yuv420p', '-movflags', '+faststart', f'{PREFIX}_silent.mp4'])
    p_mov = ff(raw + ['-pix_fmt', 'rgba', '-i', '-', '-c:v', 'prores_ks', '-profile:v', '4444',
                      '-pix_fmt', 'yuva444p10le', '-vendor', 'apl0', f'{PREFIX}_alpha.mov'])
    p_webm = ff(raw + ['-pix_fmt', 'rgba', '-i', '-', '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p',
                       '-b:v', '0', '-crf', '20', '-row-mt', '1', '-auto-alt-ref', '0', f'{PREFIX}_alpha.webm'])
    with Pool(4) as pool:
        for fi, (o, a) in enumerate(pool.imap(render, range(N), chunksize=2)):
            p_op.stdin.write(o); p_mov.stdin.write(a); p_webm.stdin.write(a)
            if fi % 60 == 0: print('frame', fi, flush=True)
    for pr in (p_op, p_mov, p_webm):
        pr.stdin.close(); pr.wait()
    print('done')
