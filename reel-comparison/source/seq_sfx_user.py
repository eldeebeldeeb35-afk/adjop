import numpy as np, wave, sys
SR = 44100; DUR = 43.95; n = int(SR * DUR); t = np.arange(n) / SR
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

add(marker(0.35), 4.39, 1.0, 0.25)
add(marker(1.3), 4.74, 1.0, 0.25)
add(marker(1.4), 7.32, 1.0, 0.25)
add(marker(0.4), 10.53, 1.0, 0.25)
add(marker(1.25), 10.93, 1.0, 0.25)
add(marker(1.7), 17.50, 1.0, 0.25)
add(marker(0.7), 23.20, 1.0, 0.25)
add(marker(0.7), 23.90, 1.0, 0.25)
add(marker(1.2), 33.45, 1.0, 0.25)
add(marker(0.8), 34.85, 1.0, 0.25)
add(marker(0.35), 40.90, 1.0, 0.25)
N=int(14.80*SR); fl=lp(rng.normal(0,1,N),0.15)*(0.6+0.4*np.sign(np.sin(2*np.pi*24*np.arange(N)/SR))); add(fl*0.05,0.1,1.0)
add(pop(600), 0.15, 0.8)
add(whoosh(0.5), 0.35, 0.5)
add(whoosh(0.35, False), 4.24, 0.7)
add(whoosh(0.35, False), 7.07, 0.7)
add(whoosh(0.35, False), 10.38, 0.7)
add(click()*2, 4.34, 1.0)
add(click()*2, 7.17, 1.0)
add(click()*2, 10.48, 1.0)
add(pop(700), 5.74, 0.6)
add(pop(740), 6.24, 0.6)
add(pop(780), 8.67, 0.6)
add(pop(820), 9.27, 0.6)
add(pop(860), 11.98, 0.6)
add(pop(900), 12.48, 0.6)
add(impact(), 13.45, 1.1)
add(glitch(), 13.50, 1.0)
add(impact()*0.6, 13.80, 0.9)
add(whoosh(0.7), 14.60, 1.0)
add(pop(520), 15.45, 0.8)
add(whoosh(0.9), 16.80, 0.9)
add(chime(1046.5), 19.15, 1.0)
add(impact()*0.4, 19.15, 0.7)
add(pop(620), 19.40, 0.8)
add(pop(660), 19.80, 0.8)
add(pop(700), 20.40, 0.8)
add(pop(740), 21.00, 0.8)
add(pop(780), 24.60, 0.8)
add(pop(820), 25.00, 0.8)
add(pop(860), 26.40, 0.8)
add(pop(900), 28.15, 0.8)
add(pop(940), 28.75, 0.8)
add(pop(980), 29.85, 0.8)
add(pop(1020), 30.75, 0.8)
add(whoosh(0.5), 22.70, 0.5)
add(whoosh(0.5), 27.25, 0.5)
add(whoosh(0.8), 32.95, 0.9)
add(chime(880), 35.65, 0.8)
add(pop(700), 35.85, 0.8)
add(pop(760), 36.00, 0.8)
add(pop(820), 36.15, 0.8)
add(pop(880), 36.30, 0.8)
add(pop(940), 36.45, 0.8)
add(pop(1000), 36.60, 0.8)
add(pop(560), 36.55, .8)
add(pop(600), 36.75, .8)
add(pop(520), 36.95, .8)
add(pop(500), 37.80, .8)
add(impact(), 40.35, 1.1)
add(chime(1046.5), 40.40, 1.0)
add(chime(784), 41.95, 0.9)
add(whoosh(0.5), 41.75, 0.5)
import soundfile as sf
st=np.stack([L,R],1); st/=np.abs(st).max()/0.9
sf.write('seq_sfx_user.wav',st,SR)
print('sfx ok')
