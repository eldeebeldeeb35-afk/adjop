import numpy as np, wave, sys
SR = 44100; DUR = 50.0; n = int(SR * DUR); t = np.arange(n) / SR
rng = np.random.default_rng(3)
L = np.zeros(n); R = np.zeros(n)

def add(sig, t0, g=1.0, pan=0.0):
    i0 = int(t0 * SR); sig = sig[: max(0, n - i0)]
    L[i0:i0 + len(sig)] += sig * g * (1 - max(0, pan)); R[i0:i0 + len(sig)] += sig * g * (1 + min(0, pan))

def lp(x, a):
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)): s += a * (x[i] - s); y[i] = s
    return y

def env(N, att, dec):
    tt = np.arange(N) / SR
    return np.minimum(tt / max(att, 1e-4), 1) * np.exp(-tt / dec)

# ---------- SFX ----------
def marker(d):  # marker squeak/scratch on a board
    N = int(d * SR); x = rng.normal(0, 1, N)
    hp = x - lp(x, 0.08)
    mod = 0.55 + 0.45 * np.abs(np.sin(np.cumsum(rng.uniform(8, 22, N)) / SR * 2 * np.pi))
    e = np.minimum(np.arange(N) / (0.03 * SR), 1) * np.minimum((N - np.arange(N)) / (0.05 * SR), 1)
    return hp * mod * e * 0.22

def pop(f=700):
    N = int(0.18 * SR); tt = np.arange(N) / SR
    return np.sin(2 * np.pi * f * tt * (1 + 1.2 * np.exp(-tt * 40))) * env(N, 0.002, 0.045) * 0.6

def whoosh(d=0.6, up=True):
    N = int(d * SR); x = rng.normal(0, 1, N); tt = np.arange(N) / N
    e = np.sin(np.pi * tt) ** 2
    y = np.zeros(N); s = 0.0; s2 = 0.0
    for i in range(N):
        a = 0.02 + 0.25 * (tt[i] if up else 1 - tt[i]); s += a * (x[i] - s); s2 += 0.01 * (s - s2)
        y[i] = s - s2
    return y * e * 1.4

def impact():
    N = int(1.2 * SR); tt = np.arange(N) / SR
    sub = np.sin(2 * np.pi * (45 + 60 * np.exp(-tt * 9)) * tt) * env(N, 0.003, 0.35)
    nz = lp(rng.normal(0, 1, N), 0.2) * env(N, 0.001, 0.08)
    return sub * 1.0 + nz * 0.8

def glitch():
    N = int(0.35 * SR); x = np.sign(np.sin(2 * np.pi * 180 * np.arange(N) / SR)) * (rng.random(N) > 0.5)
    gate = (np.floor(np.arange(N) / (SR * 0.025)) % 2)
    return x * gate * 0.12

def chime(f0=1046.5):
    N = int(1.6 * SR); tt = np.arange(N) / SR; y = np.zeros(N)
    for k, m in enumerate([1, 1.5, 2, 3]):
        y += np.sin(2 * np.pi * f0 * m * tt) * env(N, 0.005, 0.6 / (k + 1))
    return y * 0.18

def click():
    N = int(0.04 * SR); return rng.normal(0, 1, N) * env(N, 0.0005, 0.006) * 0.35

def car(d=2.4):
    N = int(d * SR); tt = np.arange(N) / SR; u = tt / d
    f = 70 + 25 * np.tanh((0.5 - u) * 4)  # doppler-ish
    eng = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.5 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    e = np.exp(-((u - 0.5) / 0.28) ** 2)
    return eng * e * 0.35

segs = [(0.25, .55), (0.9, .25), (1.2, 1.15), (2.35, .35), (2.7, .32), (4.75, 2.0), (14.6, .6), (15.25, .6), (19.05, .4), (23.0, 1.1), (26.0, .8), (38.5, 2.6), (42.3, .8), (47.55, .35)]
for s, d in segs: add(marker(d), s, 1.0, 0.25)
for s, f in [(6.9, 660), (8.1, 740), (8.5, 990), (8.95, 1100), (10.0, 820), (15.3, 700), (15.9, 760), (16.1, 900), (19.2, 620),
             (43.3, 700), (43.45, 760), (43.6, 820), (43.75, 880), (43.9, 940), (44.05, 1000), (44.0, 600), (44.2, 640), (44.5, 560), (46.3, 500), (22.5, 660), (23.9, 740), (24.2, 980), (25.6, 700), (27.0, 820), (32.5, 640), (33.7, 720), (35.6, 800), (36.8, 900), (41.0, 600)]:
    add(pop(f), s, 0.9)
add(impact(), 3.05, 1.0); add(glitch(), 3.15, 1.0)
add(whoosh(0.7), 4.22, 1.1); add(impact() * 0.4, 4.6, 0.6)
add(whoosh(0.5), 12.75, 0.8); add(impact() * 0.5, 13.0, 0.9)
for k in range(3): add(whoosh(0.25, False), 13.0 + k * .12, 0.4)
add(car(), 16.3, 1.0)
for k in range(24): add(click(), 19.4 + k * 0.105 + rng.uniform(0, .03), 0.8)
add(whoosh(0.6, False), 21.95, 0.6); add(whoosh(0.5), 32.0, 0.8); add(impact() * 0.45, 32.3, 0.8); add(chime(1174.7), 28.7, 0.9); add(whoosh(1.0, False), 41.9, 0.8)
add(chime(880), 10.0, 1.0); add(chime(1318.5), 44.5, 0.8)
add(impact(), 47.0, 1.1); add(chime(1046.5), 47.05, 1.0)
add(chime(784), 48.2, 0.9); add(whoosh(0.5), 48.0, 0.5)

sfx_L, sfx_R = L.copy(), R.copy()

# ---------- music bed ----------
L[:] = 0; R[:] = 0
bpm = 104; beat = 60 / bpm
def kick():
    N = int(0.35 * SR); tt = np.arange(N) / SR
    return np.sin(2 * np.pi * (50 + 90 * np.exp(-tt * 30)) * tt) * env(N, 0.001, 0.12)
def snare():
    N = int(0.25 * SR); return (lp(rng.normal(0, 1, N), 0.5) * 0.7 + np.sin(2 * np.pi * 190 * np.arange(N) / SR) * 0.3) * env(N, 0.001, 0.07)
def hat():
    N = int(0.06 * SR); x = rng.normal(0, 1, N); return (x - lp(x, 0.3)) * env(N, 0.0005, 0.015) * 0.5
def tone(f, d, kind='saw'):
    N = int(d * SR); tt = np.arange(N) / SR
    if kind == 'saw': y = sum(np.sin(2 * np.pi * f * k * tt) / k for k in range(1, 7))
    else: y = np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)
    return y
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
prog = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [48, 52, 55]), (55, [55, 59, 62])]  # Am F C G
# scene 1: tense pulse (0-4.6)
for k in range(int(4.6 / (beat / 2))):
    s = k * beat / 2; add(tone(mid(45), beat / 2, 'sine') * env(int(beat / 2 * SR), 0.005, 0.12) * 0.25, s)
    if k % 2 == 0: add(click() * 1.5, s, 0.6)
# main groove from 5.0
t0 = 5.0; bars = int((DUR - t0) / (4 * beat)) + 1
for b in range(bars):
    root, ch = prog[b % 4]; bs = t0 + b * 4 * beat
    full = bs >= 13.0 and bs < 46.0
    for q in range(4):
        st = bs + q * beat
        if st >= DUR - .3: break
        if q in (0, 2) or (full and q == 3): add(kick(), st, 0.9)
        if q in (1, 3) and bs >= 13.0: add(snare(), st, 0.45)
        for e in (0, .5): add(hat(), st + e * beat, 0.5 if full else 0.3, 0.3)
        bn = tone(mid(root - 12), beat * .9, 'sine') * env(int(beat * .9 * SR), 0.01, 0.3)
        add(bn, st, 0.45)
    pad = sum(tone(mid(m), 4 * beat) for m in ch)
    pad = lp(pad, 0.05) * np.minimum(np.arange(len(pad)) / (0.3 * SR), 1) * np.minimum((len(pad) - np.arange(len(pad))) / (0.3 * SR), 1)
    add(pad, bs, 0.05)
    # pluck arpeggio
    for k in range(8):
        m = ch[k % 3] + 12 * (1 if k % 4 == 3 else 0); st = bs + k * beat / 2
        if st < DUR - .2: add(tone(mid(m + 12), 0.4, 'sine') * env(int(0.4 * SR), 0.002, 0.12), st, 0.12 if bs < 13 else 0.16, 0.2 if k % 2 else -0.2)
mus_L, mus_R = L.copy(), R.copy()
# fade music in/out and duck at drops
fade = np.clip(t / 0.3, 0, 1) * np.clip((DUR - t) / 1.5, 0, 1)
mus_L *= fade; mus_R *= fade

def write(name, l, r):
    st = np.stack([l, r], 1); st /= np.abs(st).max() / 0.89
    with wave.open(name, 'wb') as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((st * 32767).astype(np.int16).tobytes())
mg = 0.55
write('mix_music_sfx.wav', sfx_L + mus_L * mg, sfx_R + mus_R * mg)
write('sfx_only.wav', sfx_L, sfx_R)
print('ok')
