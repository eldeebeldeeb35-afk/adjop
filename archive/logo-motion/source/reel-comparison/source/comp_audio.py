import numpy as np, wave, sys
SR = 44100; DUR = 41.1; n = int(SR * DUR); t = np.arange(n) / SR
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

add(whoosh(0.6), 0.0, 0.9)
add(impact(), 0.62, 1.0)
add(pop(700), 0.75, 0.8)
add(pop(820), 0.9, 0.8)
add(pop(600), 1.0, 0.8)
add(pop(660), 1.15, 0.8)
add(pop(900), 2.0, 0.8)
add(pop(1000), 2.8, 0.8)
add(click(), 1.500, 0.7)
add(click(), 1.555, 0.7)
add(click(), 1.610, 0.7)
add(click(), 1.665, 0.7)
add(click(), 1.720, 0.7)
add(click(), 1.775, 0.7)
add(click(), 1.830, 0.7)
add(click(), 1.885, 0.7)
add(click(), 1.940, 0.7)
add(click(), 1.995, 0.7)
add(click(), 2.050, 0.7)
add(click(), 2.105, 0.7)
add(click(), 2.160, 0.7)
add(click(), 2.215, 0.7)
add(click(), 2.200, 0.7)
add(click(), 2.260, 0.7)
add(click(), 2.320, 0.7)
add(click(), 2.380, 0.7)
add(click(), 2.440, 0.7)
add(click(), 2.500, 0.7)
add(click(), 2.560, 0.7)
add(click(), 2.620, 0.7)
add(click(), 2.680, 0.7)
add(click(), 2.740, 0.7)
add(click(), 2.800, 0.7)
add(click(), 2.860, 0.7)
add(marker(1.55), 4.60, 1.0, 0.25)
add(marker(1.7), 7.10, 1.0, 0.25)
add(marker(0.45), 4.05, 1.0, 0.25)
add(impact(), 6.25, 1.0)
add(glitch(), 6.30, 1.0)
add(impact()*0.5, 6.55, 0.8)
add(whoosh(0.5), 6.80, 0.6)
add(chime(1318.5), 9.90, 0.8)
add(whoosh(0.6, False), 12.35, 0.9)
add(pop(620), 9.20, 0.8)
add(pop(700), 9.50, 0.8)
add(pop(780), 10.40, 0.8)
add(pop(860), 10.70, 0.8)
add(marker(1.55), 13.60, 1.0, 0.25)
add(marker(1.7), 16.10, 1.0, 0.25)
add(marker(0.6), 17.90, 1.0, 0.25)
add(marker(0.6), 18.55, 1.0, 0.25)
add(impact(), 15.25, 1.0)
add(glitch(), 15.30, 1.0)
add(impact()*0.5, 15.55, 0.8)
add(whoosh(0.5), 15.80, 0.6)
add(chime(1318.5), 18.90, 0.8)
add(whoosh(0.6, False), 21.35, 0.9)
add(pop(620), 18.20, 0.8)
add(pop(700), 18.50, 0.8)
add(pop(780), 19.20, 0.8)
add(click(), 19.30, 0.8)
add(click(), 19.40, 0.8)
add(click(), 19.50, 0.8)
add(click(), 19.60, 0.8)
add(click(), 19.70, 0.8)
add(click(), 19.80, 0.8)
add(click(), 19.90, 0.8)
add(click(), 20.00, 0.8)
add(click(), 20.10, 0.8)
add(click(), 20.20, 0.8)
add(click(), 20.30, 0.8)
add(click(), 20.40, 0.8)
add(click(), 20.50, 0.8)
add(click(), 20.60, 0.8)
add(click(), 20.70, 0.8)
add(click(), 20.80, 0.8)
add(click(), 20.90, 0.8)
add(click(), 21.00, 0.8)
add(marker(1.55), 22.60, 1.0, 0.25)
add(marker(1.7), 25.10, 1.0, 0.25)
add(marker(0.5), 22.05, 1.0, 0.25)
add(impact(), 24.25, 1.0)
add(glitch(), 24.30, 1.0)
add(impact()*0.5, 24.55, 0.8)
add(whoosh(0.5), 24.80, 0.6)
add(chime(1318.5), 27.90, 0.8)
add(whoosh(0.6, False), 30.35, 0.9)
add(pop(620), 27.20, 0.8)
add(pop(700), 27.35, 0.8)
add(pop(780), 27.60, 0.8)
add(pop(860), 28.20, 0.8)
add(pop(940), 28.60, 0.8)
add(whoosh(0.8), 30.90, 0.9)
add(marker(1.2), 31.40, 1.0, 0.25)
add(marker(0.8), 32.80, 1.0, 0.25)
add(chime(880), 33.60, 0.8)
add(pop(700), 33.80, 0.8)
add(pop(760), 33.95, 0.8)
add(pop(820), 34.10, 0.8)
add(pop(880), 34.25, 0.8)
add(pop(940), 34.40, 0.8)
add(pop(1000), 34.55, 0.8)
add(pop(560), 34.50, .8)
add(pop(600), 34.70, .8)
add(pop(520), 34.90, .8)
add(pop(500), 35.75, .8)
add(impact(), 37.20, 1.1)
add(chime(1046.5), 37.25, 1.0)
add(marker(0.35), 37.85, 1.0, 0.25)
add(chime(784), 38.90, 0.9)
add(whoosh(0.5), 38.70, 0.5)
sfx_L, sfx_R = L.copy(), R.copy()
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
for k in range(int(3.9 / (beat / 2))):
    s = k * beat / 2; add(tone(mid(45), beat / 2, 'sine') * env(int(beat / 2 * SR), 0.005, 0.12) * 0.25, s)
    if k % 2 == 0: add(click() * 1.5, s, 0.6)
# main groove from 5.0
t0 = 3.9; bars = int((DUR - t0) / (4 * beat)) + 1
for b in range(bars):
    root, ch = prog[b % 4]; bs = t0 + b * 4 * beat
    full = bs >= 12.9 and bs < 37.0
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
np.save('sfx.npy',np.stack([sfx_L,sfx_R]));np.save('music.npy',np.stack([mus_L,mus_R]))
print('ok')
