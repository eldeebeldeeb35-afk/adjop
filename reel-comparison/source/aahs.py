"""Vocal-only 'Islamic aahs' bed: a small choir humming/aah-ing in maqam Hijaz over a vocal drone.
No instruments — only synthesised voices (glottal source + vowel formants), vibrato, chorus and reverb."""
import numpy as np, soundfile as sf
from scipy.signal import lfilter, fftconvolve

SR = 44100; DUR = 48.2 + 3.3
n = int(SR * DUR); rng = np.random.default_rng(4)

def formant_filter(x, freqs, bws, gains):
    y = np.zeros_like(x)
    for f, bw, g in zip(freqs, bws, gains):
        r = np.exp(-np.pi * bw / SR); th = 2 * np.pi * f / SR
        b = [1 - r]; a = [1, -2 * r * np.cos(th), r * r]
        y += g * lfilter(b, a, x)
    return y

VOW = {'aa': ([730, 1090, 2440, 3400], [90, 110, 160, 250], [1.0, .5, .25, .12]),
       'mm': ([250, 1200, 2300, 3300], [60, 200, 250, 300], [1.0, .08, .04, .02]),
       'oo': ([400, 800, 2400, 3300], [70, 90, 160, 250], [1.0, .45, .1, .05])}

def voice(f0_track, vowel, amp_env, breath=0.03):
    """glottal pulse train following f0_track (Hz per sample) through vowel formants"""
    ph = np.cumsum(f0_track / SR)
    saw = 2 * (ph % 1.0) - 1
    src = lfilter([1], [1, -0.97], np.diff(saw, prepend=0))  # spectral tilt
    src += rng.normal(0, breath, len(src))
    f, b, g = VOW[vowel]
    y = formant_filter(src, f, b, g)
    return y / (np.abs(y).max() + 1e-9) * amp_env

def midi(m): return 440 * 2 ** ((m - 69) / 12)

# maqam Hijaz on D: D Eb F# G A Bb C D
HIJAZ = [0, 1, 4, 5, 7, 8, 10, 12]
TONIC = 50  # D3

t = np.arange(n) / SR
out = np.zeros(n)

def env_adsr(N, a, r):
    e = np.ones(N); A = int(a * SR); R = int(r * SR)
    e[:A] = np.linspace(0, 1, A) ** 1.5; e[-R:] *= np.linspace(1, 0, R) ** 1.5
    return e

def place(sig, t0, gain=1.0):
    i = int(t0 * SR); s = sig[: n - i]; out[i:i + len(s)] += s * gain

# --- drone (ison): low hum on tonic + fifth, through whole piece, swelling
def drone(m, vowel, g):
    vib = 1 + 0.003 * np.sin(2 * np.pi * 4.6 * t + rng.random() * 6)
    f0 = midi(m) * vib
    e = 0.55 + 0.45 * np.sin(2 * np.pi * t / 9.0 - 1.5) ** 2
    e *= np.clip(t / 2.0, 0, 1) * np.clip((DUR - t) / 2.5, 0, 1)
    return voice(f0, vowel, e) * g
out += drone(TONIC - 12, 'mm', 0.55) + drone(TONIC - 5, 'mm', 0.28) + drone(TONIC, 'oo', 0.22)

# --- melodic "aah" phrases (choir of 4 detuned voices with vibrato and portamento)
PHRASES = [  # (start, [(degree, dur)], vowel)
 (1.0, [(0, 1.2), (1, .8), (2, 1.6), (1, .8), (0, 2.4)], 'aa'),
 (8.5, [(4, 1.0), (3, .8), (2, 1.2), (1, 1.0), (2, 2.6)], 'aa'),
 (15.5, [(2, 1.0), (1, .8), (0, 2.6)], 'oo'),
 (22.0, [(4, 1.0), (5, .8), (6, 1.4), (5, .8), (4, 2.6)], 'aa'),
 (29.0, [(7, 1.2), (6, .8), (5, 1.0), (4, 1.0), (4, 2.4)], 'aa'),
 (35.5, [(4, 1.0), (3, .8), (2, 1.0), (1, .8), (2, 2.4)], 'oo'),
 (41.5, [(4, 1.0), (5, .8), (4, 1.0), (2, .8), (1, .8), (0, 3.6)], 'aa'),
]
for st, notes, vw in PHRASES:
    tot = sum(d for _, d in notes); N = int(tot * SR)
    tt = np.arange(N) / SR
    # pitch contour with smooth portamento between notes
    f = np.zeros(N); k = 0
    for deg, d in notes:
        m = int(d * SR); f[k:k + m] = TONIC + HIJAZ[deg]; k += m
    f = np.convolve(np.pad(f, (300, 300), mode='edge'), np.ones(600) / 600, mode='same')[300:300 + N]
    for v in range(4):
        det = (v - 1.5) * 0.06                       # ~6 cents spread
        vib = 0.18 * np.sin(2 * np.pi * (5.0 + 0.3 * v) * tt + v) * np.clip(tt / 0.6, 0, 1)
        f0 = midi(0) * 2 ** ((f + det + vib) / 12)    # midi(0)*2^(m/12) == midi(m)
        oct_shift = 1.0 if v < 3 else 0.5             # one voice an octave below
        e = env_adsr(N, 0.35, 0.9) * (0.8 + 0.2 * np.sin(2 * np.pi * tt / tot * np.pi))
        place(voice(f0 * oct_shift, vw, e, 0.04), st + v * 0.03, 0.32)

# --- reverb (synthetic hall IR)
L = int(2.8 * SR); ir = rng.normal(0, 1, L) * np.exp(-np.arange(L) / SR / 0.75)
ir = lfilter([0.3], [1, -0.7], ir); ir /= np.abs(ir).sum() ** 0.5 * 4
wet = fftconvolve(out, ir)[:n]
mix = out * 0.55 + wet * 0.9
# gentle low-cut & high-cut
mix = lfilter([1, -1], [1, -0.995], mix)
mix = lfilter([0.25], [1, -0.75], mix)
mix /= np.abs(mix).max() / 0.9
sf.write('aahs.wav', np.stack([mix, np.roll(mix, 600)], 1).astype(np.float32), SR)
print('ok', DUR)
