"""Celebratory, professional 30s cue @120 BPM in D major. Pure numpy synthesis."""
import numpy as np, wave, sys

SR = 44100
DUR = 30.0
N = int(SR * DUR)
BPM = 120
BEAT = 60 / BPM          # 0.5 s
BAR = BEAT * 4           # 2 s
rng = np.random.default_rng(1035)

L = np.zeros(N); R = np.zeros(N)

def midi(m): return 440.0 * 2 ** ((m - 69) / 12)

def add(sig, t0, pan=0.0, gain=1.0):
    i = int(t0 * SR)
    if i >= N: return
    sig = sig[: N - i] * gain
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(sig)] += sig * l
    R[i:i + len(sig)] += sig * r

def env(n, a=0.005, d=0.1, s=0.6, rel=0.1, hold=None):
    t = np.arange(n) / SR
    hold = (n / SR - rel) if hold is None else hold
    e = np.where(t < a, t / max(a, 1e-6), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-6)))
    e = np.where(t > hold, e * np.clip(1 - (t - hold) / rel, 0, 1), e)
    return e

def lowpass_fft(x, cutoff, slope=2):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / cutoff) ** (2 * slope))
    return np.fft.irfft(X, len(x))

def highpass_fft(x, cutoff, slope=2):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (cutoff / np.maximum(f, 1)) ** (2 * slope))
    return np.fft.irfft(X, len(x))

def saw(freq, n, phase=0.0):
    t = np.arange(n) / SR
    return 2 * ((t * freq + phase) % 1) - 1

def supersaw(freq, n, voices=7, detune=0.18):
    out = np.zeros(n)
    for k in range(voices):
        d = (k - (voices - 1) / 2) / ((voices - 1) / 2) * detune
        out += saw(freq * 2 ** (d / 12), n, rng.random())
    return out / voices

# ---------- harmony ----------
# D  A  Bm  G  progression (I V vi IV), 15 bars
prog = [
    [62, 66, 69, 74],  # D
    [61, 64, 69, 73],  # A
    [62, 66, 71, 74],  # Bm
    [62, 67, 71, 74],  # G
]
roots = [38, 33, 35, 31]  # D2 A1 B1 G1

def chord_of(bar): return prog[bar % 4]
def root_of(bar): return roots[bar % 4]

# ---------- drums ----------
def kick():
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 45 + 120 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 7.5)
    click = rng.standard_normal(n) * np.exp(-t * 400) * 0.3
    return np.tanh((s + click) * 1.6) * 0.9

def clap():
    n = int(0.35 * SR); t = np.arange(n) / SR
    nz = rng.standard_normal(n)
    e = np.zeros(n)
    for o in (0, 0.011, 0.022):
        e += np.where(t >= o, np.exp(-(t - o) * 60), 0)
    e += np.exp(-t * 14) * 0.5
    s = highpass_fft(nz * e, 900)
    return lowpass_fft(s, 7000) * 0.55

def hat(open_=False):
    n = int((0.25 if open_ else 0.06) * SR); t = np.arange(n) / SR
    s = highpass_fft(rng.standard_normal(n), 7000)
    return s * np.exp(-t * (14 if open_ else 70)) * 0.16

def crash():
    n = int(2.6 * SR); t = np.arange(n) / SR
    s = highpass_fft(rng.standard_normal(n), 4000)
    return s * np.exp(-t * 2.2) * 0.17

def snare():
    n = int(0.25 * SR); t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.5
    nz = highpass_fft(rng.standard_normal(n), 1500) * np.exp(-t * 22) * 0.6
    return (tone + nz) * 0.6

K, C, H, HO, CR, SN = kick(), clap(), hat(), hat(True), crash(), snare()

def riser(t0, length):
    n = int(length * SR); t = np.arange(n) / SR
    nz = rng.standard_normal(n)
    # sweep via chunked bandpass approximation: mix of hp noise rising
    out = np.zeros(n)
    chunks = 24
    for c in range(chunks):
        a, b = c * n // chunks, (c + 1) * n // chunks
        fc = 400 * (20 ** (c / chunks))
        seg = highpass_fft(nz[a:b], fc)
        out[a:b] = seg
    out *= (t / length) ** 2.6 * 0.13
    f = 200 * 2 ** (4 * t / length)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / length) ** 3 * 0.08
    add(out + tone, t0, 0, 1)

def snare_roll(t0, length):
    steps = int(length / (BEAT / 4))
    for i in range(steps):
        p = i / steps
        add(SN, t0 + i * BEAT / 4, rng.uniform(-.2, .2), 0.25 + 0.6 * p)

# ---------- instruments ----------
def pad(notes, t0, length, gain=0.12, cutoff=2500):
    n = int(length * SR)
    s = sum(supersaw(midi(m), n, 5, 0.12) for m in notes) / len(notes)
    s = lowpass_fft(s, cutoff)
    s *= env(n, a=0.3, d=1, s=1, rel=0.4)
    add(s, t0, -0.3, gain); add(s, t0 + 0.012, 0.3, gain)

def pluck(m, t0, gain=0.16, pan=0.0, length=0.35):
    n = int(length * SR); t = np.arange(n) / SR
    f = midi(m)
    s = saw(f, n) * 0.6 + saw(f * 1.004, n, 0.3) * 0.4
    s = lowpass_fft(s, 3500)
    s *= np.exp(-t * 11)
    add(s, t0, pan, gain)

def bell(m, t0, gain=0.14, pan=0.0, length=1.2):
    n = int(length * SR); t = np.arange(n) / SR
    f = midi(m)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * 2.2 * np.exp(-t * 6)
    s = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 3.2)
    s += np.sin(2 * np.pi * f * 2 * t) * 0.25 * np.exp(-t * 5)
    s *= np.clip(t / 0.003, 0, 1)
    add(s, t0, pan, gain)

def bass(m, t0, length, gain=0.32):
    n = int(length * SR); t = np.arange(n) / SR
    f = midi(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * lowpass_fft(saw(f, n), 900)
    s *= env(n, a=0.004, d=0.15, s=0.7, rel=0.05)
    add(np.tanh(s * 1.3), t0, 0, gain)

def brass(notes, t0, length, gain=0.12):
    n = int(length * SR)
    s = sum(supersaw(midi(m), n, 5, 0.08) for m in notes) / len(notes)
    t = np.arange(n) / SR
    # filter "swell"
    bright = lowpass_fft(s, 4500); dark = lowpass_fft(s, 900)
    w = np.clip(t / 0.06, 0, 1) * np.exp(-t * 2.5)
    s = dark * (1 - w) + bright * w
    s *= env(n, a=0.01, d=0.3, s=0.8, rel=0.08)
    add(s, t0, -0.25, gain); add(s, t0 + 0.008, 0.25, gain)

# ---------- arrangement ----------
TOTAL_BARS = 15
melody_a = [  # (beat offset within 2 bars, midi, len beats)
    (0, 78, 1), (1, 81, .5), (1.5, 78, .5), (2, 76, 1), (3, 74, 1),
    (4, 76, 1), (5, 78, .5), (5.5, 76, .5), (6, 73, 2),
]
melody_b = [
    (0, 74, .5), (0.5, 76, .5), (1, 78, 1), (2, 79, 1), (3, 78, .5), (3.5, 76, .5),
    (4, 74, 1), (5, 76, 1), (6, 81, 2),
]

for bar in range(TOTAL_BARS):
    t0 = bar * BAR
    ch, rt = chord_of(bar), root_of(bar)
    intro = bar < 2
    build = bar == 11
    final = bar >= 14

    if final:
        continue

    # pad everywhere
    pad(ch, t0, BAR + 0.3, gain=0.10 if intro else 0.075, cutoff=1400 if intro else 3000)

    # arpeggiated plucks (16ths)
    arp = ch + [ch[1] + 12, ch[2] + 12]
    for s in range(16):
        if intro and bar == 0 and s < 8:
            continue
        m = arp[(s * 3) % len(arp)]
        pluck(m, t0 + s * BEAT / 4, gain=0.07 if intro else 0.085, pan=(-0.5 if s % 2 else 0.5))

    if intro:
        continue

    # drums
    for b in range(4):
        tb = t0 + b * BEAT
        if not (build and b >= 2):
            add(K, tb, 0, 1.0)
        if b in (1, 3) and not build:
            add(C, tb, 0.05, 1.0)
        add(H, tb + BEAT / 2, 0.3, 1.0)
        if b % 2 == 0:
            add(H, tb + BEAT * 0.75, -0.3, 0.6)
    if bar % 2 == 1 and not build:
        add(HO, t0 + 3.5 * BEAT, 0.2, 0.8)

    # bass: offbeat-pumping eighths
    for e in range(8):
        m = rt + (12 if e % 2 else 0)
        bass(m, t0 + e * BEAT / 2, BEAT / 2 - 0.02, gain=0.26)

    # melody (bells) in 2-bar phrases
    if bar in (2, 3, 6, 7, 12, 13) or bar in (4, 5, 8, 9):
        phrase = melody_a if bar in (2, 3, 6, 7, 12, 13) else melody_b
        base_bar = bar - (bar % 2)
        if bar % 2 == 0:
            for off, m, ln in phrase:
                tt = base_bar * BAR + off * BEAT
                bell(m, tt, gain=0.12, pan=0.15)
                bell(m + 12, tt + 0.003, gain=0.035, pan=-0.2)

    # brass stabs in finale and at section starts
    if bar in (2, 6, 12, 13, 10):
        brass([n - 12 for n in ch] + [ch[0]], t0, BEAT * 0.9, gain=0.12)
        brass([n - 12 for n in ch] + [ch[0]], t0 + BEAT * 1.5, BEAT * 0.45, gain=0.09)
    if bar in (12, 13):
        brass([n - 12 for n in ch], t0 + BEAT * 2.5, BEAT * 0.45, gain=0.09)
        brass([n - 12 for n in ch], t0 + BEAT * 3, BEAT * 0.9, gain=0.1)

# section accents
for tc in (4.0, 12.0, 24.0, 28.0):
    add(CR, tc, 0, 1.0)
riser(1.0, 3.0); snare_roll(3.0, 1.0)
riser(10.0, 2.0)
riser(20.0, 4.0); snare_roll(22.0, 2.0)
riser(26.5, 1.5); snare_roll(27.0, 1.0)

# final hit at 28s: big D major + kick + bell
ft = 28.0
add(K, ft, 0, 1.1)
brass([50, 57, 62, 66, 69], ft, 1.8, gain=0.16)
pad([62, 66, 69, 74, 78], ft, 2.0, gain=0.10, cutoff=3500)
for m in (74, 78, 81, 86):
    bell(m, ft, gain=0.08, pan=rng.uniform(-.4, .4), length=2.0)
bass(38, ft, 1.9, gain=0.3)

# ---------- sidechain pump ----------
t = np.arange(N) / SR
duck = np.ones(N)
pump_on = (t >= 4.0) & (t < 28.0) & ~((t >= 23.0) & (t < 24.0))
ph = (t % BEAT) / BEAT
duck = np.where(pump_on, 0.55 + 0.45 * np.clip(ph / 0.35, 0, 1) ** 0.7, 1.0)
# (apply ducking to everything except a separate drum bus would be ideal; approximate)
L *= duck; R *= duck

# ---------- reverb (comb + allpass-ish, vectorised) ----------
def comb(x, D, g):
    y = x.copy()
    for i in range(D, len(x), D):
        y[i:i + D] += g * y[i - D:i][: len(y[i:i + D])]
    return y

def reverb(x, seed):
    ds = [1557, 1617, 1491, 1422, 1277, 1356]
    out = sum(comb(x, d + seed, 0.78) for d in ds) / len(ds)
    return lowpass_fft(highpass_fft(out, 250), 5000)

wetL = reverb(L, 0); wetR = reverb(R, 23)
L = L + 0.28 * wetL; R = R + 0.28 * wetR

# re-add kick dry on top (post duck, so it punches)
# master: gentle glue + limiter
mix = np.stack([L, R])
mix = highpass_fft(mix[0], 28), highpass_fft(mix[1], 28)
mix = np.stack(mix)
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.6) / np.tanh(1.6)
# fades
fade_in = np.clip(t / 0.05, 0, 1); fade_out = np.clip((DUR - t) / 1.2, 0, 1)
mix *= fade_in * fade_out * 0.92

pcm = (mix.T * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('wrote', sys.argv[1])
