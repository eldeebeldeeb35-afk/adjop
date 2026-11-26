import numpy as np, wave
SR, DUR = 48000, 5.0
n = int(SR * DUR); t = np.arange(n) / SR
rng = np.random.default_rng(11)
out = np.zeros((n, 2))

def lp(x, a):  # one-pole lowpass with time-varying coefficient array/scalar
    y = np.zeros_like(x); a = np.broadcast_to(a, x.shape); s = 0.0
    for i in range(len(x)): s += a[i] * (x[i] - s); y[i] = s
    return y

def env(t0, att, dec):
    e = np.zeros(n); i0 = int(t0 * SR)
    ta = np.arange(int(att * SR)) / SR; td = np.arange(int(dec * 6 * SR)) / SR
    seg = np.concatenate([ta / max(att, 1e-6), np.exp(-td / dec)])
    seg = seg[: n - i0]; e[i0:i0 + len(seg)] = seg; return e

# whoosh following the frame draw (0.2 - 1.6s)
noise = rng.normal(0, 1, n)
w = np.clip((t - 0.15) / 0.7, 0, 1) ** 2 * np.exp(-np.clip(t - 0.85, 0, None) / 0.35) * (t > 0.15)
cut = 0.02 + 0.12 * w
wh = lp(noise, cut) - lp(lp(noise, cut), 0.01)
pan = np.clip((t - 0.2) / 1.4, 0, 1)
out[:, 0] += wh * w * (1 - 0.6 * pan) * 0.9
out[:, 1] += wh * w * (0.4 + 0.6 * pan) * 0.9

# soft ticks for letters, pops for dots
for s, g in [(1.0, .5), (1.2, .4), (1.25, .4), (1.4, .45), (1.55, .45), (1.7, .5)]:
    e = env(s, 0.002, 0.05); f = 180 + 60 * rng.random()
    out += (np.sin(2 * np.pi * f * t) * e * g * 0.5)[:, None]
for s in (2.30, 2.38, 2.46, 2.54, 2.62):
    e = env(s, 0.001, 0.04); f = 900 + 400 * rng.random()
    tone = np.sin(2 * np.pi * f * t * (1 + 0.3 * np.exp(-(t - s).clip(0) * 40)))
    out += (tone * e * 0.18)[:, None]

# impact + shimmer at the shine (2.9s)
e = env(2.9, 0.004, 0.45)
boom = np.sin(2 * np.pi * (48 + 30 * np.exp(-(t - 2.9).clip(0) * 8)) * t) * e
out += (boom * 0.9)[:, None]
for k, f in enumerate([1318.5, 1975.5, 2637.0, 3135.9, 3951.1]):
    e = env(2.92 + k * 0.05, 0.01, 0.9 - k * 0.1)
    ph = rng.random() * 6.28
    out[:, k % 2] += np.sin(2 * np.pi * f * t + ph) * e * 0.09
    out[:, 1 - k % 2] += np.sin(2 * np.pi * f * t + ph) * e * 0.05
# reverb-ish tail: a few feedback delays
for d, g in [(0.031, .35), (0.047, .3), (0.073, .25), (0.11, .2)]:
    k = int(d * SR); tmp = out.copy(); out[k:] += tmp[:-k] * g
# fade tail, normalize
out *= np.clip((DUR - t) / 0.6, 0, 1)[:, None]
out /= np.abs(out).max() / 0.89
pcm = (out * 32767).astype(np.int16)
with wave.open('sfx.wav', 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(pcm.tobytes())
print('ok')
