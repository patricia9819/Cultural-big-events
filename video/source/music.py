# Original score: light, elegant baroque-pop cue in D major, 120 BPM, 25 bars + tail (52 s)
import numpy as np, wave, sys
SR = 44100
BPM = 120
BEAT = 60 / BPM
BAR = BEAT * 4
TOTAL = 60.5
N = int(SR * TOTAL)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)

def mf(m): return 440 * 2 ** ((m - 69) / 12)

def add(sig, t0, pan=0.0, gain=1.0):
    i = int(t0 * SR)
    if i >= N: return
    sig = sig[: N - i] * gain
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(sig)] += sig * l * 1.414
    R[i:i + len(sig)] += sig * r * 1.414

def env_adsr(n, a, rel):
    e = np.ones(n)
    na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    nr = min(n, max(1, int(rel * SR))); e[-nr:] *= np.linspace(1, 0, nr)
    return e

def harpsichord(f, dur):
    d = dur + 0.9
    t = np.arange(int(d * SR)) / SR
    s = np.zeros_like(t)
    for n in range(1, 16):
        if f * n > 16000: break
        amp = (1 / n ** 0.9) * (1.0 if n % 2 else 0.8)
        s += amp * np.sin(2 * np.pi * f * n * t * (1 + 0.0004 * n)) * np.exp(-t * (2.2 + n * 0.9))
    s *= env_adsr(len(t), 0.002, 0.05)
    return s * 0.35

def pizz(f, dur):
    d = 0.7
    t = np.arange(int(d * SR)) / SR
    s = np.zeros_like(t)
    for n in range(1, 9):
        s += (1 / n ** 1.4) * np.sin(2 * np.pi * f * n * t) * np.exp(-t * (6 + n * 2.5))
    s *= env_adsr(len(t), 0.004, 0.05)
    return s * 0.9

def flute(f, dur):
    d = dur + 0.15
    t = np.arange(int(d * SR)) / SR
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * t) * np.clip((t - 0.15) / 0.2, 0, 1)
    ph = 2 * np.pi * f * np.cumsum(vib) / SR
    s = np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph) + 0.05 * np.sin(4 * ph)
    s += 0.02 * rng.standard_normal(len(t)) * np.exp(-t * 20)
    e = env_adsr(len(t), 0.035, 0.14) * (0.85 + 0.15 * np.exp(-t * 4))
    return s * e * 0.22

def celesta(f, dur):
    d = 1.6
    t = np.arange(int(d * SR)) / SR
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 2.5) + 0.4 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 7) + 0.15 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t * 4)
    return s * env_adsr(len(t), 0.002, 0.1) * 0.25

def strings(freqs, dur, att=0.35):
    d = dur + 0.5
    t = np.arange(int(d * SR)) / SR
    s = np.zeros_like(t)
    for f in freqs:
        for det in (-0.004, 0, 0.0045):
            ff = f * (1 + det)
            vib = 2 * np.pi * ff * t + 0.6 * np.sin(2 * np.pi * 5.0 * t + det * 900)
            for n in range(1, 9):
                s += (1 / n ** 1.15) * np.sin(n * vib) / 3
    e = env_adsr(len(t), att, 0.5)
    return s * e * 0.05

def kick():
    t = np.arange(int(0.35 * SR)) / SR
    f = 45 + 80 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 0.9

def shaker(g=1.0):
    n = int(0.09 * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n); x = np.diff(np.diff(x, prepend=0), prepend=0)
    return x * np.exp(-t * 55) * np.minimum(1, t / 0.006) * 0.05 * g

def clap():
    n = int(0.3 * SR); t = np.arange(n) / SR
    x = np.diff(rng.standard_normal(n), prepend=0)
    e = np.exp(-t * 18)
    for off in (0.0, 0.011, 0.022):
        e += 0.6 * np.exp(-np.maximum(t - off, 0) * 120) * (t >= off)
    return x * e * 0.09

def timpani(f, roll=0.0):
    d = 2.5; t = np.arange(int(d * SR)) / SR
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 1.6) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t) * np.exp(-t * 2.5) + 0.25 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 3)
    s += 0.3 * rng.standard_normal(len(t)) * np.exp(-t * 30)
    return s * 0.6

def riser(dur):
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.diff(rng.standard_normal(n), prepend=0)
    return x * (t / dur) ** 2.5 * 0.08

def bell_hit():
    t = np.arange(int(2.5 * SR)) / SR
    s = 0
    for r, a, dcy in ((1, 1, 1.5), (2.76, 0.5, 2.5), (5.4, 0.3, 4), (8.9, 0.15, 6)):
        s = s + a * np.sin(2 * np.pi * mf(86) * r * t) * np.exp(-t * dcy)
    return s * 0.08

# chord symbols -> (root midi for bass, chord tones for arp/pad)
CH = {
    'D': (50, [62, 66, 69]), 'A': (45, [61, 64, 69]), 'Bm': (47, [62, 66, 71]), 'G': (43, [62, 67, 71]),
    'F#m': (54, [61, 66, 69]), 'Em': (52, [64, 67, 71]), 'Dsus': (50, [62, 67, 69]),
}
prog = (['D', 'Dsus', 'A'] +                                   # 0-2 intro
        ['D', 'A', 'Bm', 'G', 'D', 'G', 'A', 'D'] +            # 3-10 A
        ['G', 'A', 'F#m', 'Bm', 'G', 'A', 'D', 'D'] +          # 11-18 B
        ['D', 'A', 'Bm', 'G', 'D', 'G', 'A', 'D', 'A', 'D'])  # 19-28 A' + cadence

themeA = [
    [(0, 69, 1), (1, 74, .5), (1.5, 76, .5), (2, 78, 1.5), (3.5, 76, .5)],
    [(0, 76, 1), (1, 73, .5), (1.5, 74, .5), (2, 76, 1), (3, 69, 1)],
    [(0, 78, 1), (1, 74, .5), (1.5, 78, .5), (2, 81, 1), (3, 78, 1)],
    [(0, 79, 1.5), (1.5, 78, .5), (2, 76, 1), (3, 74, 1)],
    [(0, 78, .5), (.5, 76, .5), (1, 74, .5), (1.5, 76, .5), (2, 78, 1), (3, 81, 1)],
    [(0, 83, 1), (1, 81, .5), (1.5, 79, .5), (2, 76, 1), (3, 79, 1)],
    [(0, 78, .5), (.5, 76, .5), (1, 74, .5), (1.5, 73, .5), (2, 76, 1.5), (3.5, 73, .5)],
    [(0, 74, 3)],
]
themeB = [
    [(0, 71, .5), (.5, 74, .5), (1, 79, 1), (2, 78, .5), (2.5, 79, .5), (3, 83, 1)],
    [(0, 81, 1.5), (1.5, 79, .5), (2, 78, .5), (2.5, 76, .5), (3, 73, 1)],
    [(0, 73, .5), (.5, 78, .5), (1, 81, 1), (2, 78, .5), (2.5, 76, .5), (3, 73, 1)],
    [(0, 74, 1.5), (1.5, 73, .5), (2, 71, 1), (3, 78, 1)],
    [(0, 79, 1), (1, 83, 1), (2, 81, .5), (2.5, 79, .5), (3, 78, 1)],
    [(0, 76, 1), (1, 81, 1), (2, 85, 1), (3, 81, 1)],
    [(0, 86, 1.5), (1.5, 85, .5), (2, 81, 1), (3, 78, 1)],
    [(0, 81, 2)],
]
arp_pat = [0, 1, 2, 3, 4, 3, 2, 1]  # index into extended chord tones

for b, sym in enumerate(prog):
    t0 = b * BAR
    root, tones = CH[sym]
    ext = [tones[0] - 12, tones[1] - 12, tones[2] - 12, tones[0], tones[1], tones[2]]
    final = b == 28
    sec = 'intro' if b < 3 else 'A' if b < 11 else 'B' if b < 19 else 'A2'
    # pad
    if not final:
        add(strings([mf(x) for x in tones], BAR, att=0.6 if sec == 'intro' else 0.25), t0, 0.0, 1.3 if sec == 'B' else 1.0)
    else:
        add(strings([mf(x) for x in tones + [74]], BAR * 1.6, att=0.05), t0, 0.0, 1.4)
    # harpsichord arpeggio (16ths in B, 8ths otherwise)
    if not final:
        step = 0.25 if sec == 'B' else 0.5
        cnt = int(4 / step)
        for k in range(cnt):
            m = ext[(arp_pat[k % 8] + (1 if sec == 'B' else 0)) % 6]
            if sec == 'intro' and b == 0 and k < 2: continue
            g = 0.8 if (k * step) % 1 else 1.0
            add(harpsichord(mf(m + 12), step), t0 + k * BEAT * step, 0.35 if k % 2 else -0.25, g * (0.7 if sec == 'intro' else 0.85))
    # pizz bass
    if sec != 'intro' and not final:
        pat = [(0, root), (1.5, root + 7), (2, root + 12), (3, root + 7)] if sec != 'B' else [(0, root), (.5, root + 12), (1.5, root + 7), (2, root), (2.5, root + 12), (3, root + 7), (3.5, root + 12)]
        for bt, m in pat:
            add(pizz(mf(m), .5), t0 + bt * BEAT, -0.1, 0.9)
    elif sec == 'intro':
        add(pizz(mf(root), 1), t0, 0, 0.7)
    # melody
    mel = None
    if sec == 'A': mel = themeA[b - 3]
    elif sec == 'B': mel = themeB[b - 11]
    elif sec == 'A2' and not final:
        mel = themeA[b - 19] if b < 27 else themeA[6]
    if mel:
        for bt, m, d in mel:
            add(flute(mf(m), d * BEAT), t0 + bt * BEAT, 0.1, 1.0 if sec != 'B' else 1.1)
            if sec in ('B', 'A2'):
                add(celesta(mf(m + 12), d * BEAT), t0 + bt * BEAT, -0.3, 0.55)
    # drums
    if sec != 'intro' and not final:
        for k in range(4):
            if k in (0, 2) or (sec == 'B' and k == 3 and b % 2): add(kick(), t0 + k * BEAT, 0, 0.8)
            if sec in ('B', 'A2') and k in (1, 3): add(clap(), t0 + k * BEAT, 0.05, 1.0)
        for k in range(16):
            add(shaker(1.0 if k % 2 else 0.6), t0 + k * BEAT / 4, 0.4, 1.0 if sec != 'A' or b > 4 else 0.6)
    if b == 18:  # fill into A2
        for k in range(4): add(timpani(mf(38 + (k % 2) * 7)), t0 + 3 * BEAT + k * BEAT / 4, 0, 0.35)
    if b == 10:  # snare-ish fill into B
        for k in range(4): add(clap(), t0 + 3 * BEAT + k * BEAT / 4, 0, 0.6 + k * 0.15)

# accents
add(timpani(mf(38)), 0.0, 0, 0.9)
add(bell_hit(), 0.0, 0.2, 1.0)
add(riser(BAR), 2 * BAR, 0, 1.0)
add(timpani(mf(38)), 3 * BAR, 0, 0.8)
add(bell_hit(), 3 * BAR, -0.2, 0.8)
add(riser(BAR), 10 * BAR, 0, 0.8)
add(riser(BAR), 26 * BAR, 0, 0.5)
add(timpani(mf(38)), 12 * BAR + 2 * BEAT, 0, 0.5)
add(timpani(mf(38)), 11 * BAR, 0, 0.6)
add(timpani(mf(38)), 28 * BAR, 0, 1.0)
add(bell_hit(), 28 * BAR, 0, 1.2)
add(kick(), 28 * BAR, 0, 1.0)
final_root = 50
for m in (38, 50, 57, 62, 66, 69, 74):
    add(harpsichord(mf(m + 12), 2.5), 28 * BAR + (m - 38) * 0.004, 0, 0.6)
add(flute(mf(74), 3.0), 28 * BAR, 0.1, 1.0)
add(celesta(mf(86), 2), 28 * BAR, -0.3, 0.8)

# reverb (FFT convolution)
def reverb(x, seed):
    r = np.random.default_rng(seed)
    n = int(1.9 * SR); t = np.arange(n) / SR
    ir = r.standard_normal(n) * np.exp(-t * 3.2)
    ir = np.convolve(ir, np.ones(6) / 6, 'same')  # soften highs
    ir[:int(0.02 * SR)] = 0
    ir /= np.sqrt(np.sum(ir ** 2))
    M = 1 << int(np.ceil(np.log2(len(x) + n)))
    y = np.fft.irfft(np.fft.rfft(x, M) * np.fft.rfft(ir, M), M)[:len(x)]
    return y
wl = reverb(L, 1); wr = reverb(R, 2)
L2 = L + 0.28 * wl; R2 = R + 0.28 * wr
st = np.stack([L2, R2], 1)
st /= np.max(np.abs(st)) + 1e-9
st = np.tanh(st * 1.6) / np.tanh(1.6)
# fades
fo = int(1.5 * SR); st[-fo:] *= np.linspace(1, 0, fo)[:, None]
st *= 0.92
pcm = (st * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', len(pcm) / SR)
