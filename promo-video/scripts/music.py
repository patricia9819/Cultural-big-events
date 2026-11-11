"""Original 30s light & elegant score. 120 BPM, D major. Beat = 0.5s (15 frames @30fps)."""
import numpy as np, wave, sys

SR = 44100
DUR = 30.0
N = int(SR * DUR)
BEAT = 0.5
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)

def midi(m): return 440.0 * 2 ** ((m - 69) / 12)

def add(sig, t0, pan=0.0, gain=1.0):
    i = int(t0 * SR)
    if i >= N: return
    sig = sig[: N - i] * gain
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(sig)] += sig * l; R[i:i + len(sig)] += sig * r

def env_adsr(n, a, d, s, rel, sus_len):
    a, d, rel = int(a*SR), int(d*SR), int(rel*SR); sl = max(int(sus_len*SR), a+d)
    e = np.ones(sl + rel)
    e[:a] = np.linspace(0, 1, a) if a else 1
    e[a:a+d] = np.linspace(1, s, d); e[a+d:sl] = s
    e[sl:] = s * np.linspace(1, 0, rel) ** 2
    return e

def piano(m, dur=1.2, vel=1.0):
    f = midi(m); n = int(dur * SR); t = np.arange(n) / SR
    out = np.zeros(n)
    for k, amp in enumerate([1, .5, .28, .16, .09, .05], 1):
        fk = f * k * np.sqrt(1 + 0.0004 * k * k)
        out += amp * np.sin(2*np.pi*fk*t) * np.exp(-t * (2.2 + k*1.3))
    att = np.minimum(1, t / 0.004)
    return out * att * vel * 0.25

def celesta(m, dur=1.0, vel=1.0):
    f = midi(m); n = int(dur*SR); t = np.arange(n)/SR
    out = np.sin(2*np.pi*f*t)*np.exp(-t*3.5) + .35*np.sin(2*np.pi*f*4.01*t)*np.exp(-t*9) + .2*np.sin(2*np.pi*f*2*t)*np.exp(-t*5)
    return out * np.minimum(1, t/0.002) * vel * 0.16

def pad(ms, dur, vel=1.0):
    n = int((dur+1.2)*SR); t = np.arange(n)/SR; out = np.zeros(n)
    for m in ms:
        f = midi(m)
        for det in (-0.12, 0.0, 0.12):
            ff = f * 2**(det/12)
            ph = rng.uniform(0, 2*np.pi)
            # soft saw-ish via few harmonics
            for k, a in enumerate([1, .35, .15, .06], 1):
                out += a*np.sin(2*np.pi*ff*k*t + ph*k)
    vib = 1 + 0.15*np.sin(2*np.pi*0.3*t)
    e = env_adsr(n, 0.6, 0.4, 0.8, 1.2, dur)[:n]
    return out * e * vib * vel * 0.012

def bass(m, dur, vel=1.0):
    f = midi(m); n = int(dur*SR); t = np.arange(n)/SR
    out = np.sin(2*np.pi*f*t) + .25*np.sin(2*np.pi*2*f*t)
    e = np.minimum(1, t/0.01) * np.exp(-t*1.6)
    return out * e * vel * 0.22

def kick(vel=1.0):
    n = int(0.35*SR); t = np.arange(n)/SR
    f = 48 + 90*np.exp(-t*30)
    ph = 2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-t*9)*vel*0.32

def shaker(vel=1.0):
    n = int(0.09*SR); t = np.arange(n)/SR
    x = rng.standard_normal(n); x = np.diff(np.concatenate([[0], x]))  # highpass-ish
    return x*np.exp(-t*55)*np.minimum(1, t/0.008)*vel*0.05

def snap(vel=1.0):
    n = int(0.25*SR); t = np.arange(n)/SR
    x = rng.standard_normal(n)
    x = np.convolve(x, np.ones(6)/6, 'same') - np.convolve(x, np.ones(40)/40, 'same')
    body = np.sin(2*np.pi*190*t)*np.exp(-t*30)
    return (x*np.exp(-t*22)*0.6 + body*0.3)*vel*0.22

def swell(dur=2.0):
    n = int(dur*SR); t = np.arange(n)/SR
    x = rng.standard_normal(n)
    x = np.convolve(x, np.ones(3)/3, 'same')
    return x * (t/dur)**3 * 0.06

def chime_gliss(t0, notes, step=0.06, pan_from=-0.7, pan_to=0.7):
    for i, m in enumerate(notes):
        p = pan_from + (pan_to - pan_from) * i / max(1, len(notes)-1)
        add(celesta(m, 1.4, 0.8), t0 + i*step, p)

# Progression (one chord per bar = 4 beats = 2s): Dmaj9, Bm9, Gmaj7, A6sus -> loop
D, Bm, G, A = 'D', 'Bm', 'G', 'A'
CH = {
    'D':  dict(root=38, pad=[62, 66, 69, 73], arp=[62, 66, 69, 73, 76, 73, 69, 66]),
    'Bm': dict(root=35, pad=[59, 62, 66, 69], arp=[59, 62, 66, 69, 73, 69, 66, 62]),
    'G':  dict(root=43, pad=[59, 62, 66, 67], arp=[55, 59, 62, 66, 71, 66, 62, 59]),
    'A':  dict(root=45, pad=[61, 64, 66, 69], arp=[57, 61, 64, 69, 71, 69, 64, 61]),
}
prog = [D, Bm, G, A] * 4  # 16 bars covers 32s

for bar in range(15):
    t_bar = bar * 4 * BEAT
    c = CH[prog[bar]]
    # pad throughout (quiet intro, fuller later)
    pv = 0.6 if bar < 3 else (0.85 if bar < 13 else 0.95)
    add(pad(c['pad'], 2.0, pv), t_bar, 0.0)
    # piano arpeggio in 8ths (from bar 0)
    for i, m in enumerate(c['arp']):
        v = 0.55 + 0.25 * (i % 2 == 0)
        if bar < 1 and i % 2: continue
        add(piano(m, 1.4, v), t_bar + i*BEAT/2, -0.35 + 0.1*(i % 4))
    # celesta melody motif (from bar 3)
    if 3 <= bar < 14:
        mel = {D: [78, 76, 74, 76], Bm: [74, 73, 71, 73], G: [71, 74, 78, 76], A: [76, 73, 69, 71]}[prog[bar]]
        rhythm = [0, 1.5, 2, 3] if bar % 2 == 0 else [0, 1, 2.5, 3]
        for m, b in zip(mel, rhythm):
            add(celesta(m, 1.2, 0.9), t_bar + b*BEAT, 0.4)
            add(celesta(m+12, 0.8, 0.25), t_bar + b*BEAT + 0.375, -0.5)  # echo sparkle
    # rhythm section from bar 3 (6s) -> 14
    if 3 <= bar < 14:
        add(bass(c['root'], 1.0, 0.9), t_bar, 0)
        add(bass(c['root'], 0.6, 0.6), t_bar + 1.5*BEAT, 0)
        add(bass(c['root']+7, 0.6, 0.6), t_bar + 3*BEAT, 0)
        for b in range(4):
            add(kick(1.0 if b in (0, 2) else 0.0), t_bar + b*BEAT)
            if b in (1, 3): add(snap(0.9), t_bar + b*BEAT, 0.1)
        for s in range(8):
            add(shaker(1.0 if s % 2 else 0.55), t_bar + s*BEAT/2, 0.5)
    elif bar == 2:  # soft pickup before the groove
        for s in range(8):
            add(shaker(0.25 + 0.09*s), t_bar + s*BEAT/2, 0.5)

# Transition accents: glisses on key cuts (seconds)
chime_gliss(0.0, [74, 78, 81, 85, 86], 0.05)
for t in [3.0, 16.0, 25.0]:
    add(swell(1.1), t - 1.1, 0)
chime_gliss(3.0 - 0.3, [69, 73, 76, 81, 85], 0.06, 0.6, -0.6)
chime_gliss(16.0 - 0.3, [74, 78, 81, 86, 90], 0.06)
chime_gliss(25.0 - 0.3, [66, 69, 74, 78, 81, 86], 0.05, 0.7, -0.7)
# Final chord: Dmaj9 bloom at 28s
for m in [50, 57, 62, 66, 69, 73, 76]:
    add(piano(m, 3.0, 0.8), 28.0, -0.3 + 0.1*(m % 7))
add(pad([62, 66, 69, 73, 78], 1.2, 0.9), 28.0)
add(kick(0.8), 28.0)

# Reverb: convolve with decaying stereo noise IR
def reverb(x, seed, t60=1.8, mix=0.22):
    r = np.random.default_rng(seed)
    n = int(t60*SR); t = np.arange(n)/SR
    ir = r.standard_normal(n) * np.exp(-6.9*t/t60)
    ir = np.convolve(ir, np.ones(8)/8, 'same')  # darken
    ir /= np.sqrt(np.sum(ir**2))
    size = 1 << int(np.ceil(np.log2(len(x)+n)))
    wet = np.fft.irfft(np.fft.rfft(x, size)*np.fft.rfft(ir, size), size)[:len(x)]
    return x*(1-mix) + wet*mix*1.6

L = reverb(L, 1); R = reverb(R, 2)
st = np.stack([L, R], 1)
# master: fade in/out, soft clip, normalize
t = np.arange(N)/SR
fade = np.minimum(1, t/0.05) * np.clip((DUR - t)/1.6, 0, 1)**1.5
st *= fade[:, None]
st /= np.max(np.abs(st)) + 1e-9
st = np.tanh(st*1.6)/np.tanh(1.6) * 0.89
pcm = (st*32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', pcm.shape)
