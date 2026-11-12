"""Light, warm, 'arts & culture' track at 120 BPM (marimba, piano, upright bass, shaker, rim).
Same 8 s section grid as the video:
  bars 1-4 intro (piano + marimba), 5-20 groove A, 21-24 soft break, 25-32 groove B (+celesta melody), 33 end chord.
"""
import numpy as np, wave, sys

SR = 44100
BEAT = 0.5
BAR = BEAT * 4
TOTAL = 33 * BAR + 0.5
N = int(TOTAL * SR)
rng = np.random.default_rng(11)
L = np.zeros(N); R = np.zeros(N)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(buf, start, sig, g=1.0):
    i = int(start * SR)
    if i >= len(buf) or i < 0:
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * g


def stereo(start, sig, g=1.0, pan=0.0):
    add(L, start, sig, g * np.sqrt(0.5 * (1 - pan)) * 1.414)
    add(R, start, sig, g * np.sqrt(0.5 * (1 + pan)) * 1.414)


def fft_filter(sig, lo=None, hi=None):
    S = np.fft.rfft(sig); f = np.fft.rfftfreq(len(sig), 1 / SR); m = np.ones_like(f)
    if lo: m *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi: m *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(S * m, n=len(sig))


def tt(dur):
    return np.arange(int(dur * SR)) / SR


# ---------- instruments ----------
def piano(m, dur=1.6, vel=1.0):
    t = tt(dur + 0.6); f = mtof(m); s = np.zeros_like(t)
    for k, a in enumerate([1, .55, .3, .18, .1, .06], start=1):
        inh = 1 + 0.0004 * k * k
        s += a * np.sin(2 * np.pi * f * k * inh * t) * np.exp(-t * (1.2 + k * 0.9))
    s += 0.15 * np.sin(2 * np.pi * f * t) * np.exp(-t * 0.6)
    att = np.minimum(t / 0.004, 1)
    rel = np.where(t > dur, np.exp(-(t - dur) / 0.15), 1)
    return s * att * rel * vel


def marimba(m, vel=1.0):
    t = tt(0.6); f = mtof(m)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.22) + 0.25 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.03)
    s += 0.06 * np.sin(2 * np.pi * f * 10 * t) * np.exp(-t / 0.008)
    return s * np.minimum(t / 0.002, 1) * vel


def celesta(m, vel=1.0):
    t = tt(1.4); f = mtof(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.2) + 0.1 * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-t / 0.1)
    return s * np.exp(-t / 0.5) * np.minimum(t / 0.003, 1) * vel


def upright(m, dur=0.45):
    t = tt(dur + 0.1); f = mtof(m)
    s = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.12) + 0.12 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t / 0.05)
    e = np.exp(-t / 0.35) * np.minimum(t / 0.006, 1) * np.where(t > dur, np.exp(-(t - dur) / 0.04), 1)
    return s * e


def pad(notes, dur):
    t = tt(dur + 1.0); s = np.zeros_like(t)
    for m in notes:
        for det in (-0.06, 0.06):
            f = mtof(m + det)
            for k, a in enumerate([1, .4, .18, .08], start=1):
                s += a * np.sin(2 * np.pi * f * k * t + rng.random() * 6)
    e = np.minimum(t / 0.8, 1) * np.where(t > dur, np.exp(-(t - dur) / 0.5), 1)
    return s * e / len(notes) / 2


def soft_kick():
    t = tt(0.4); f = 50 + 70 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.2)


def shaker(acc=1.0):
    t = tt(0.09)
    n = fft_filter(rng.standard_normal(len(t)), lo=5000, hi=11000)
    return n * np.exp(-t / 0.025) * np.minimum(t / 0.01, 1) * acc


def rim():
    t = tt(0.12)
    s = np.sin(2 * np.pi * 1700 * t) * np.exp(-t / 0.012) * 0.6 + fft_filter(rng.standard_normal(len(t)), lo=2000, hi=7000) * np.exp(-t / 0.01) * 0.5
    return s


def snap():
    t = tt(0.15)
    return fft_filter(rng.standard_normal(len(t)), lo=1500, hi=6000) * np.exp(-t / 0.02)


def chime_gliss(base=79):
    out = np.zeros(int(1.6 * SR))
    for i, m in enumerate([base, base + 4, base + 7, base + 12]):
        c = celesta(m, 0.6)
        i0 = int(i * 0.07 * SR); out[i0:i0 + len(c)] += c[: len(out) - i0]
    return out


def swell(notes, dur=1.2):
    t = tt(dur); s = np.zeros_like(t)
    for m in notes:
        s += np.sin(2 * np.pi * mtof(m) * t) + 0.3 * np.sin(2 * np.pi * mtof(m) * 2 * t)
    return s * (t / dur) ** 2 / len(notes)


K, SH, RIM, SNP = soft_kick(), None, rim(), snap()

# ---------- harmony: C(add9) - Am7 - Fmaj7 - G(sus->maj) ----------
prog = [
    (36, [60, 64, 67, 74]),
    (33, [57, 60, 64, 67]),
    (29, [57, 60, 64, 65 + 12 - 12]),
    (31, [55, 59, 62, 67]),
]
mar_pat = [0, 2, 1, 3, 2, 1, 3, 2]  # 8th-note marimba figure (chord tone index)
melody = {  # celesta motif in groove B, 8th index -> midi
    0: {0: 76, 3: 79, 5: 81, 6: 79},
    1: {0: 76, 2: 72, 4: 74, 6: 76},
    2: {0: 77, 3: 76, 5: 72, 6: 74},
    3: {0: 74, 2: 71, 4: 74, 6: 79},
}


def section(b):
    return 'intro' if b < 4 else 'A' if b < 20 else 'break' if b < 24 else 'B' if b < 32 else 'end'


for bar in range(33):
    t0 = bar * BAR; sec = section(bar); root, notes = prog[bar % 4]
    e8 = BEAT / 2
    if sec == 'end':
        for i, m in enumerate([48, 55, 60, 64, 67, 74]):
            stereo(t0 + i * 0.03, piano(m, 2.5, 0.5), 0.5, -0.3 + i * 0.12)
        stereo(t0, upright(36, 1.5), 0.5)
        stereo(t0, chime_gliss(84), 0.25, 0.3)
        stereo(t0, K, 0.4)
        continue
    # pad (quiet bed everywhere, louder in intro/break)
    stereo(t0, pad(notes, BAR), 0.22 if sec in ('intro', 'break') else 0.12)
    # piano comping
    if sec in ('intro', 'break'):
        for i, m in enumerate(notes):
            stereo(t0 + i * 0.02, piano(m, 1.8, 0.45), 0.42, -0.2 + i * 0.13)
        stereo(t0 + BEAT * 2.5, piano(notes[-1] + 12, 0.8, 0.3), 0.3, 0.3)
    else:
        for pos, v in ((0, 0.42), (1.5, 0.3), (3, 0.34)):  # beat positions (syncopated)
            for i, m in enumerate(notes):
                stereo(t0 + pos * BEAT + i * 0.012, piano(m, 0.5 if pos else 0.9, v), 0.36, -0.2 + i * 0.13)
    # marimba 8ths
    if sec != 'intro' or bar >= 1:
        tones = notes + [notes[0] + 12]
        for i in range(8):
            m = tones[mar_pat[i]] + 12
            g = 0.2 if sec in ('A', 'B') else 0.14
            if i % 2 == 0: g *= 1.15
            stereo(t0 + i * e8, marimba(m), g, 0.35 if i % 2 else -0.15)
    grooving = sec in ('A', 'B')
    # bass
    if grooving or (sec == 'break' and bar >= 22):
        pat = [(0, root + 12, 0.45), (1.5, root + 12, 0.25), (2, root + 19, 0.4), (3.5, root + 12, 0.2)]
        for pos, m, d in pat:
            stereo(t0 + pos * BEAT, upright(m, d), 0.42)
    # drums
    if grooving or (sec == 'break' and bar >= 22) or (sec == 'intro' and bar >= 2):
        for b in (0, 2):
            stereo(t0 + b * BEAT, K, 0.5 if grooving else 0.3)
        if grooving and bar % 2 == 1:
            stereo(t0 + 3.5 * BEAT, K, 0.3)
        for k in range(16):
            acc = 1.0 if k % 4 == 2 else 0.55 if k % 2 == 0 else 0.35
            stereo(t0 + k * BEAT / 4, shaker(acc), 0.16, 0.4)
    if grooving:
        for b in (1, 3):
            stereo(t0 + b * BEAT, RIM, 0.22, -0.25)
            stereo(t0 + b * BEAT + 0.01, SNP, 0.14, 0.25)
    if sec == 'B':
        for k, m in melody[bar % 4].items():
            stereo(t0 + k * e8, celesta(m), 0.2, 0.15)
            stereo(t0 + k * e8 + 0.375, celesta(m), 0.06, -0.4)
    # gentle section cues
    if bar % 4 == 3:
        stereo(t0 + BAR - 1.2, swell(prog[(bar + 1) % 4][1], 1.2), 0.12)
    if bar % 4 == 0 and bar > 0:
        stereo(t0, chime_gliss(79 if bar % 8 else 84), 0.16, 0.2)


def reverb(x, seed, dur=2.2, decay=0.6):
    r = np.random.default_rng(seed); n = int(dur * SR)
    ir = r.standard_normal(n) * np.exp(-np.arange(n) / SR / decay)
    ir = fft_filter(ir, lo=250, hi=6000); ir /= np.sqrt(np.sum(ir ** 2))
    M = 1 << int(np.ceil(np.log2(len(x) + n)))
    return np.fft.irfft(np.fft.rfft(x, M) * np.fft.rfft(ir, M), M)[: len(x)]

L = L + 0.28 * reverb(L, 1); R = R + 0.28 * reverb(R, 2)
L = fft_filter(L, lo=30, hi=14000); R = fft_filter(R, lo=30, hi=14000)
pk = max(np.abs(L).max(), np.abs(R).max()); L /= pk; R /= pk
L = np.tanh(L * 1.3) / np.tanh(1.3); R = np.tanh(R * 1.3) / np.tanh(1.3)
fade = np.ones(N); fi = int(0.05 * SR); fade[:fi] = np.linspace(0, 1, fi)
fo = int(2.0 * SR); fade[-fo:] = np.linspace(1, 0, fo) ** 2
L *= fade * 0.9; R *= fade * 0.9
pcm = (np.clip(np.stack([L, R], 1), -1, 1) * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', TOTAL)
