import numpy as np, wave, sys
SR = 44100; DUR = 48.2; n = int(SR * DUR); t = np.arange(n) / SR
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

add(marker(0.5), 3.10, 1.0, 0.25)
add(marker(1.6), 3.60, 1.0, 0.25)
add(marker(1.6), 8.20, 1.0, 0.25)
add(marker(0.5), 13.10, 1.0, 0.25)
add(marker(1.5), 13.60, 1.0, 0.25)
add(marker(1.7), 21.70, 1.0, 0.25)
add(marker(0.7), 27.20, 1.0, 0.25)
add(marker(0.7), 27.90, 1.0, 0.25)
add(marker(1.2), 38.50, 1.0, 0.25)
add(marker(0.8), 39.90, 1.0, 0.25)
add(marker(0.35), 44.95, 1.0, 0.25)
N=int(19.8*SR); fl=lp(rng.normal(0,1,N),0.15)*(0.6+0.4*np.sign(np.sin(2*np.pi*24*np.arange(N)/SR))); add(fl*0.05,0.1,1.0)
add(pop(600), 0.15, 0.8)
add(whoosh(0.5), 0.35, 0.5)
add(whoosh(0.35, False), 2.90, 0.7)
add(whoosh(0.35, False), 7.90, 0.7)
add(whoosh(0.35, False), 12.90, 0.7)
add(click()*2, 3.00, 1.0)
add(click()*2, 8.00, 1.0)
add(click()*2, 13.00, 1.0)
add(pop(700), 5.20, 0.6)
add(pop(740), 6.00, 0.6)
add(pop(780), 10.00, 0.6)
add(pop(820), 10.80, 0.6)
add(pop(860), 15.20, 0.6)
add(pop(900), 16.00, 0.6)
add(impact(), 18.00, 1.1)
add(glitch(), 18.05, 1.0)
add(impact()*0.6, 18.35, 0.9)
add(whoosh(0.7), 19.60, 1.0)
add(pop(520), 20.45, 0.8)
add(whoosh(0.9), 21.00, 0.9)
add(chime(1046.5), 23.35, 1.0)
add(impact()*0.4, 23.35, 0.7)
add(pop(620), 23.60, 0.8)
add(pop(660), 24.00, 0.8)
add(pop(700), 24.60, 0.8)
add(pop(740), 25.20, 0.8)
add(pop(780), 28.60, 0.8)
add(pop(820), 29.00, 0.8)
add(pop(860), 30.40, 0.8)
add(pop(900), 33.10, 0.8)
add(pop(940), 33.70, 0.8)
add(pop(980), 34.80, 0.8)
add(pop(1020), 35.70, 0.8)
add(whoosh(0.5), 26.70, 0.5)
add(whoosh(0.5), 32.20, 0.5)
add(whoosh(0.8), 38.00, 0.9)
add(chime(880), 40.70, 0.8)
add(pop(700), 40.90, 0.8)
add(pop(760), 41.05, 0.8)
add(pop(820), 41.20, 0.8)
add(pop(880), 41.35, 0.8)
add(pop(940), 41.50, 0.8)
add(pop(1000), 41.65, 0.8)
add(pop(560), 41.60, .8)
add(pop(600), 41.80, .8)
add(pop(520), 42.00, .8)
add(pop(500), 42.60, .8)
add(impact(), 44.40, 1.1)
add(chime(1046.5), 44.45, 1.0)
add(chime(784), 46.00, 0.9)
add(whoosh(0.5), 45.80, 0.5)
import soundfile as sf
st=np.stack([L,R],1); st/=np.abs(st).max()/0.9
sf.write('seq_sfx.wav',st,SR)
print('sfx ok')
