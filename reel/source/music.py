"""Synthesize an upbeat, professional 120 BPM track (C-G-Am-F) aligned to 8 s sections.
Structure (bars of 2 s):
  1-4   intro: pad + pluck arp, hats from bar 3, riser into bar 5
  5-20  drop A: full groove
  21-24 breakdown: pad + arp + soft kick, riser
  25-32 drop B: full groove + bell lead
  33    final hit + tail
"""
import numpy as np, wave, sys

SR = 44100
BPM = 120
BEAT = 60 / BPM
BAR = BEAT * 4
TOTAL = 33 * BAR + 0.5  # 66.5 s
N = int(TOTAL * SR)
rng = np.random.default_rng(7)

L = np.zeros(N); R = np.zeros(N)
sc_bus_L = np.zeros(N); sc_bus_R = np.zeros(N)  # bus that gets sidechained


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env_adsr(n, a, d, s, r, hold):
    t = np.arange(n) / SR
    e = np.zeros(n)
    e = np.where(t < a, t / max(a, 1e-4), 0)
    dec = (t >= a) & (t < a + d)
    e = np.where(dec, 1 - (1 - s) * (t - a) / d, e)
    sus = (t >= a + d) & (t < hold)
    e = np.where(sus, s, e)
    rel = t >= hold
    lvl_at_hold = s if hold >= a + d else 1
    e = np.where(rel, lvl_at_hold * np.exp(-(t - hold) / max(r, 1e-4)), e)
    return e


def saw(freq, n, harm_cut=14, phase=0.0):
    t = np.arange(n) / SR
    out = np.zeros(n)
    nyq = SR / 2
    for k in range(1, 40):
        if k * freq > nyq * 0.9:
            break
        w = (1 / k) * np.exp(-k / harm_cut)
        out += w * np.sin(2 * np.pi * k * freq * t + phase * k)
    return out


def add(buf, start_s, sig, gain=1.0):
    i = int(start_s * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * gain


def fft_filter(sig, lo=None, hi=None):
    S = np.fft.rfft(sig)
    f = np.fft.rfftfreq(len(sig), 1 / SR)
    m = np.ones_like(f)
    if lo:
        m *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi:
        m *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(S * m, n=len(sig))


# ---------- drum one-shots ----------
def kick():
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t / 0.28)
    s += 0.35 * rng.standard_normal(n) * np.exp(-t / 0.004)
    return np.tanh(s * 1.6)

def clap():
    n = int(0.35 * SR); t = np.arange(n) / SR
    noise = fft_filter(rng.standard_normal(n), lo=900, hi=5000)
    e = np.exp(-t / 0.12)
    for off in (0.0, 0.011, 0.022):
        e += 0.6 * np.exp(-np.maximum(t - off, 0) / 0.006) * (t >= off)
    return noise * e * 0.5

def hat(dec=0.035):
    n = int(max(0.25, dec * 6) * SR); t = np.arange(n) / SR
    noise = fft_filter(rng.standard_normal(n), lo=7000)
    return noise * np.exp(-t / dec)

def snap():
    n = int(0.12 * SR); t = np.arange(n) / SR
    return fft_filter(rng.standard_normal(n), lo=2500, hi=9000) * np.exp(-t / 0.03)

K, C, H, OH, SN = kick(), clap(), hat(), hat(0.13), snap()

# ---------- harmony ----------
prog = [  # (bass root midi, chord voicing)
    (36, [60, 64, 67, 72]),   # C
    (31, [59, 62, 67, 71]),   # G
    (33, [57, 60, 64, 69]),   # Am
    (29, [57, 60, 65, 69]),   # F
]

def chord_at(bar):
    return prog[bar % 4]

# pre-render stab/pluck generators
def stab(notes, length=0.32):
    n = int((length + 0.4) * SR)
    out = np.zeros(n)
    for m in notes:
        for det in (-0.12, 0.0, 0.12):
            out += saw(mtof(m + det), n, harm_cut=9, phase=rng.random() * 6)
    e = env_adsr(n, 0.004, 0.18, 0.35, 0.12, length)
    return out * e / len(notes) / 3

def pluck(m, length=0.22):
    n = int(length * SR); t = np.arange(n) / SR
    f = mtof(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
    return s * np.exp(-t / 0.07) * np.minimum(t / 0.002, 1)

def bell(m, length=1.0):
    n = int(length * SR); t = np.arange(n) / SR
    f = mtof(m)
    s = np.sin(2 * np.pi * f * t + 1.2 * np.sin(2 * np.pi * f * 3.5 * t) * np.exp(-t / 0.15))
    s += 0.3 * np.sin(2 * np.pi * 2 * f * t)
    return s * np.exp(-t / 0.35) * np.minimum(t / 0.003, 1)

def pad(notes, length):
    n = int((length + 0.8) * SR)
    out = np.zeros(n)
    for m in notes:
        for det in (-0.08, 0.08):
            out += saw(mtof(m + det), n, harm_cut=3.5, phase=rng.random() * 6)
    e = env_adsr(n, 0.35, 0.3, 0.8, 0.6, length)
    return out * e / len(notes) / 2

def bass_note(m, length=0.22):
    n = int((length + 0.05) * SR)
    s = saw(mtof(m), n, harm_cut=5) + 0.6 * np.sin(2 * np.pi * mtof(m) * np.arange(n) / SR)
    e = env_adsr(n, 0.004, 0.08, 0.7, 0.03, length)
    return s * e

def riser(length):
    n = int(length * SR); t = np.arange(n) / SR
    noise = fft_filter(rng.standard_normal(n), lo=1500)
    sweep_f = 200 * (2 ** (4 * t / length))
    sw = np.sin(2 * np.pi * np.cumsum(sweep_f) / SR)
    e = (t / length) ** 2.2
    return (noise * 0.5 + sw * 0.25) * e

def impact():
    n = int(2.5 * SR); t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (38 + 60 * np.exp(-t / 0.08)) * t) * np.exp(-t / 0.7)
    crash = fft_filter(rng.standard_normal(n), lo=4000) * np.exp(-t / 0.9) * 0.35
    return boom * 0.9 + crash

def whoosh(length=0.5):
    n = int(length * SR); t = np.arange(n) / SR
    noise = fft_filter(rng.standard_normal(n), lo=600, hi=6000)
    e = np.sin(np.pi * t / length) ** 2
    return noise * e * 0.4

# ---------- arrange ----------
def section(bar):
    if bar < 4: return 'intro'
    if bar < 20: return 'dropA'
    if bar < 24: return 'break'
    if bar < 32: return 'dropB'
    return 'end'

stab_rhythm = [0, 3, 6, 10, 12]   # 16th positions (syncopated)
arp_pattern = [0, 1, 2, 3, 2, 1, 3, 2, 0, 1, 2, 3, 2, 3, 1, 2]
lead = {  # bell motif per bar in drop B (16th index: midi)
    0: {0: 84, 3: 83, 6: 79, 10: 76, 12: 79},
    1: {0: 83, 3: 79, 6: 74, 10: 79, 12: 83},
    2: {0: 81, 3: 84, 6: 88, 10: 84, 12: 81},
    3: {0: 81, 3: 77, 6: 72, 8: 77, 12: 79},
}

for bar in range(33):
    t0 = bar * BAR
    sec = section(bar)
    root, notes = chord_at(bar)
    s16 = BEAT / 4
    if sec == 'end':
        add(L, t0, K, 0.9); add(R, t0, K, 0.9)
        add(L, t0, impact(), 0.6); add(R, t0, impact(), 0.6)
        p = pad([48, 60, 64, 67, 72], 2.0)
        add(L, t0, p, 0.35); add(R, t0, p, 0.35)
        st = stab([60, 64, 67, 72], 0.9)
        add(L, t0, st, 0.5); add(R, t0, st, 0.5)
        add(L, t0, bell(84, 2.0), 0.25); add(R, t0 + 0.01, bell(84, 2.0), 0.25)
        continue

    # pad in intro/breakdown
    if sec in ('intro', 'break'):
        p = pad(notes, BAR)
        add(sc_bus_L, t0, p, 0.45); add(sc_bus_R, t0, p * 0.95, 0.45)

    # arp
    if True:
        tones = notes + [notes[0] + 12]
        for i in range(16):
            m = tones[arp_pattern[i]] + 12
            g = 0.13 if sec != 'intro' else 0.11 + 0.04 * (bar % 4) / 3
            pl = pluck(m)
            add(L, t0 + i * s16, pl, g)
            add(R, t0 + i * s16 + 0.012, pl, g * 0.9)
            # dotted-8th echo
            add(R, t0 + i * s16 + 0.375, pl, g * 0.3)
            add(L, t0 + i * s16 + 0.75, pl, g * 0.15)

    drums = sec in ('dropA', 'dropB')
    # kick
    if drums or (sec == 'break' and bar >= 22) or (sec == 'intro' and bar >= 2):
        for b in range(4):
            kg = 0.95 if drums else 0.5
            if sec == 'intro' and bar == 3 and b >= 2:
                pass
            add(L, t0 + b * BEAT, K, kg); add(R, t0 + b * BEAT, K, kg)
    # hats
    if drums or (sec == 'intro' and bar >= 2) or (sec == 'break' and bar >= 22):
        for b in range(4):
            add(L, t0 + b * BEAT + BEAT / 2, OH if drums else H, 0.16)
            add(R, t0 + b * BEAT + BEAT / 2, OH if drums else H, 0.19)
            if drums:
                for k in (1, 3):
                    add(L, t0 + b * BEAT + k * s16, H, 0.07); add(R, t0 + b * BEAT + k * s16, H, 0.09)
    # clap
    if drums:
        for b in (1, 3):
            add(L, t0 + b * BEAT, C, 0.6); add(R, t0 + b * BEAT, C, 0.6)
        if bar % 4 == 3:  # fill
            for k in (13, 14, 15):
                add(L, t0 + k * s16, SN, 0.35); add(R, t0 + k * s16, SN, 0.35)
    # bass (offbeat pumping 8ths + octave)
    if drums:
        for b in range(4):
            for off, mm in ((BEAT / 2, root + 12), (BEAT * 3 / 4, root + 24)):
                bn = bass_note(mm, 0.12 if off > BEAT / 2 else 0.2)
                add(sc_bus_L, t0 + b * BEAT + off, bn, 0.33 if mm == root + 12 else 0.12)
                add(sc_bus_R, t0 + b * BEAT + off, bn, 0.33 if mm == root + 12 else 0.12)
        # stabs
        for k in stab_rhythm:
            st = stab(notes, 0.12)
            add(sc_bus_L, t0 + k * s16, st, 0.34); add(sc_bus_R, t0 + k * s16 + 0.008, st, 0.34)
    if sec == 'dropB':
        for k, m in lead[bar % 4].items():
            bl = bell(m)
            add(L, t0 + k * s16, bl, 0.16); add(R, t0 + k * s16 + 0.01, bl, 0.16)
            add(R, t0 + k * s16 + 0.375, bl, 0.05)

    # transitions every 4 bars: whoosh at end + impact at start of drops
    if bar % 4 == 3:
        w = whoosh(0.6)
        add(L, t0 + BAR - 0.55, w, 0.5); add(R, t0 + BAR - 0.5, w, 0.5)
    if bar in (3, 23, 31):
        r = riser(BAR)
        add(L, t0, r, 0.35); add(R, t0, r, 0.35)
    if bar in (4, 24):
        im = impact()
        add(L, t0, im, 0.45); add(R, t0, im, 0.45)

# sidechain pump on bus (only where drums play)
t = np.arange(N) / SR
phase = (t % BEAT)
pump = 1 - 0.65 * np.exp(-phase / 0.09)
bar_idx = (t // BAR).astype(int)
drum_mask = ((bar_idx >= 4) & (bar_idx < 20)) | ((bar_idx >= 24) & (bar_idx < 32))
pump = np.where(drum_mask, pump, 1.0)
L += sc_bus_L * pump
R += sc_bus_R * pump

# simple reverb: FFT convolution with decaying noise
def reverb(x, seed):
    r = np.random.default_rng(seed)
    n = int(1.6 * SR)
    ir = r.standard_normal(n) * np.exp(-np.arange(n) / SR / 0.45)
    ir = fft_filter(ir, lo=300, hi=7000)
    ir /= np.sqrt(np.sum(ir ** 2))
    M = 1 << int(np.ceil(np.log2(len(x) + n)))
    y = np.fft.irfft(np.fft.rfft(x, M) * np.fft.rfft(ir, M), M)[: len(x)]
    return y

wetL, wetR = reverb(L, 1), reverb(R, 2)
L = L + 0.18 * wetL
R = R + 0.18 * wetR

# master: gentle low cut, glue, fade in/out
L = fft_filter(L, lo=28); R = fft_filter(R, lo=28)
peak = max(np.abs(L).max(), np.abs(R).max())
L /= peak; R /= peak
L = np.tanh(L * 1.5) / np.tanh(1.5); R = np.tanh(R * 1.5) / np.tanh(1.5)
fade = np.ones(N)
fi = int(0.03 * SR); fade[:fi] = np.linspace(0, 1, fi)
fo = int(1.8 * SR); fade[-fo:] = np.linspace(1, 0, fo) ** 2
L *= fade * 0.92; R *= fade * 0.92

out = np.stack([L, R], axis=1)
pcm = (np.clip(out, -1, 1) * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('wrote', sys.argv[1], TOTAL, 's')
