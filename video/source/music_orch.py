# Original light-classical orchestral score for the Taichung Prefectural Hall reel.
# D major, 120 BPM. Every scene change lands on a downbeat (two 2/4 bars absorb odd-second cuts).
# Writes a MIDI file rendered by FluidSynth with MuseScore_General_Full, plus a VSCO-2-CE
# (CC0) real cello-spiccato / bass-drum layer, then hall reverb + mastering.
import numpy as np, mido, sys, os, subprocess, wave, glob, re
rng = np.random.default_rng(3)
OUT = sys.argv[1]
WORK = os.path.dirname(os.path.abspath(__file__))
SF = '/usr/share/sounds/sf3/MuseScore_General_Full.sf3'
VSCO = WORK + '/samples/p2/package/VSCO-2-CE'
SR = 44100
BEAT = 0.5

# ---------------- form ----------------
# (start_sec, beats, [(chord, beats)...])
BARS = [
 (0, 4, [('D', 4)]), (2, 4, [('G/D', 4)]), (4, 4, [('A7', 4)]),                       # S1 intro
 (6, 4, [('D', 4)]), (8, 4, [('G', 2), ('A', 2)]), (10, 2, [('A7', 2)]),               # S2 timeline
 (11, 4, [('D', 2), ('Bm', 2)]), (13, 4, [('G', 2), ('A', 2)]), (15, 4, [('Bm', 2), ('A', 2)]),  # S3 facade
 (17, 4, [('G', 4)]), (19, 4, [('D/F#', 4)]), (21, 4, [('Em', 2), ('A', 2)]), (23, 4, [('D', 2), ('A7', 2)]),  # S4 columns
 (25, 4, [('D', 4)]), (27, 4, [('G', 4)]), (29, 4, [('A', 4)]), (31, 4, [('F#m', 2), ('Bm', 2)]),
 (33, 4, [('G', 2), ('A', 2)]), (35, 4, [('A7', 4)]),                                   # S5 details
 (37, 4, [('D', 4)]), (39, 4, [('G', 2), ('A', 2)]),                                    # S6 hall
 (41, 4, [('Bm', 4)]), (43, 4, [('Em', 2), ('F#7', 2)]),                                # S7 shelter
 (45, 4, [('G', 4)]), (47, 4, [('A', 4)]), (49, 4, [('D', 4)]),                         # S8 exhibition
 (51, 4, [('Bm', 2), ('G', 2)]), (53, 4, [('Em', 2), ('A', 2)]), (55, 2, [('A7', 2)]),  # S9 route
 (56, 9, [('D', 9)]),                                                                   # S10 finale
]
CH = {'D': (2, [2, 6, 9]), 'G/D': (2, [7, 11, 2]), 'A7': (9, [9, 1, 4, 7]), 'G': (7, [7, 11, 2]), 'A': (9, [9, 1, 4]),
      'Bm': (11, [11, 2, 6]), 'D/F#': (6, [2, 6, 9]), 'Em': (4, [4, 7, 11]), 'F#m': (6, [6, 9, 1]), 'F#7': (6, [6, 10, 1, 4])}
def chord_at(t):
    for (s, b, chs) in BARS:
        if s <= t < s + b * BEAT + 1e-9:
            x = s
            for name, cb in chs:
                if t < x + cb * BEAT - 1e-9: return name, x, cb
                x += cb * BEAT
    return 'D', 56, 9
def voicing(pcs, lo, hi): return [m for m in range(lo, hi + 1) if m % 12 in pcs]
def bass_of(name, lo, hi):
    root = CH[name][0]
    c = [m for m in range(lo, hi + 1) if m % 12 == root]; return c[0]

# ---------------- channels ----------------
#        ch  bank prog vol pan
CHN = {'vln1': (0, 20, 48, 108, -40), 'vln2': (1, 25, 48, 92, -18), 'vla': (2, 30, 48, 84, 18), 'vc': (3, 40, 48, 92, 34),
       'cb': (4, 50, 45, 104, 44), 'fl': (5, 0, 73, 88, -6), 'ob': (6, 0, 68, 78, 8), 'cl': (7, 0, 71, 80, -10),
       'bsn': (8, 0, 70, 78, 12), 'hn': (10, 0, 60, 92, -16), 'tpt': (11, 0, 56, 80, 16), 'hp': (12, 0, 46, 98, -30),
       'glk': (13, 0, 9, 70, 22), 'timp': (14, 0, 47, 104, 0), 'pad': (15, 20, 49, 80, -24), 'perc': (9, 128, 48, 78, 0)}
EV = []   # (time, dur, inst, midi, vel)
VSCO_SPIC = []
CC = []   # (time, inst, cc, val)
PG = []   # (time, inst, bank, prog)
def N(t, d, inst, m, v, hum=True):
    if hum: t += rng.normal(0, 0.006); v += rng.integers(-5, 6)
    EV.append((max(0, t), max(0.03, d), inst, int(m), int(np.clip(v, 1, 127))))
def ramp(inst, t0, t1, v0, v1, cc=11, steps=24):
    for i in range(steps + 1):
        CC.append((t0 + (t1 - t0) * i / steps, inst, cc, int(round(v0 + (v1 - v0) * i / steps))))
def setcc(inst, t, v, cc=11): CC.append((t, inst, cc, v))

# section dynamics (base velocity)
def dyn(t):
    for a, b, v in [(0, 6, 62), (6, 11, 82), (11, 17, 84), (17, 25, 74), (25, 37, 96), (37, 41, 104), (41, 45, 66), (45, 51, 76), (51, 56, 92), (56, 70, 110)]:
        if a <= t < b: return v
    return 80

# ---------------- melody ----------------
MEL = {
 3: [(0, 81, 1), (1, 78, .5), (1.5, 81, .5), (2, 86, 1.5), (3.5, 85, .25), (3.75, 83, .25)],
 4: [(0, 83, 1), (1, 79, .5), (1.5, 83, .5), (2, 81, 1), (3, 76, 1)],
 5: [(i * .25, m, .25) for i, m in enumerate([73, 74, 76, 78, 79, 81, 83, 85])],
 6: [(0, 86, 1.5), (1.5, 81, .5), (2, 83, 1), (3, 78, 1)],
 7: [(0, 79, .5), (.5, 81, .5), (1, 83, .5), (1.5, 79, .5), (2, 76, 1), (3, 81, 1)],
 8: [(0, 78, .5), (.5, 76, .5), (1, 74, .5), (1.5, 78, .5), (2, 76, 1.5), (3.5, 73, .5)],
 9: [(0, 74, 1.5), (1.5, 71, .5), (2, 79, 2)],
 10: [(0, 78, 1.5), (1.5, 76, .5), (2, 74, 1), (3, 81, 1)],
 11: [(0, 79, 1.5), (1.5, 76, .5), (2, 73, 1), (3, 76, 1)],
 12: [(0, 74, 1.5), (1.5, 78, .5), (2, 81, 1), (3, 79, 1)],
 14: [(0, 83, 1), (1, 79, .5), (1.5, 83, .5), (2, 86, 1), (3, 83, 1)],
 15: [(0, 85, 1), (1, 81, .5), (1.5, 85, .5), (2, 88, 1), (3, 85, 1)],
 16: [(i * .5, m, .5) for i, m in enumerate([81, 85, 81, 78, 83, 86, 83, 78])],
 17: [(i * .5, m, .5) for i, m in enumerate([79, 83, 86, 83, 81, 85, 88, 85])],
 18: [(0, 88, 1), (1, 86, .5), (1.5, 85, .5), (2, 83, .5), (2.5, 81, .5), (3, 79, .5), (3.5, 76, .5)],
 19: [(0, 86, 1.5), (1.5, 81, .5), (2, 86, 1), (3, 90, 1)],
 20: [(0, 91, 1.5), (1.5, 90, .5), (2, 88, 1), (3, 85, 1)],
 23: [(0, 74, .5), (.5, 79, .5), (1, 83, 1.5), (2.5, 81, .5), (3, 79, 1)],
 24: [(0, 76, .5), (.5, 81, .5), (1, 85, 1.5), (2.5, 83, .5), (3, 81, 1)],
 25: [(0, 78, 1), (1, 76, .5), (1.5, 74, .5), (2, 81, 2)],
 26: [(i * .5, m, .5) for i, m in enumerate([83, 78, 86, 83, 86, 83, 79, 83])],
 27: [(i * .5, m, .5) for i, m in enumerate([79, 76, 83, 79, 81, 85, 88, 85])],
 28: [(i * .25, m, .25) for i, m in enumerate([76, 78, 79, 81, 83, 85, 86, 88])],
}
FANFARE = {13: [(0, 74, .75), (.75, 69, .25), (1, 74, 1), (2, 78, 1), (3, 81, 1)],
           19: [(0, 74, 1.5), (1.5, 69, .5), (2, 74, 1), (3, 78, 1)],
           20: [(0, 79, 1.5), (1.5, 78, .5), (2, 76, 1), (3, 73, 1)]}
DARK = {21: [(0, 59, 1), (1, 61, .5), (1.5, 62, .5), (2, 66, 2)], 22: [(0, 64, 1), (1, 67, 1), (2, 66, 1), (3, 58, 1)]}

def play_mel(bi, table, insts, shift=0, vel=0, legato=0.96):
    s = BARS[bi][0]
    for off, m, ln in table[bi]:
        for inst, sh in insts:
            N(s + off * BEAT, ln * BEAT * legato, inst, m + sh + shift, dyn(s) + vel)

# lead lines per section
for bi in (3, 4, 5): play_mel(bi, MEL, [('vln1', 0), ('fl', 0)], vel=4)
for bi in (6, 7, 8): play_mel(bi, MEL, [('vln1', 0), ('ob', -12), ('fl', 12)], vel=2)
for bi in (9, 10, 11, 12): play_mel(bi, MEL, [('vln1', 0), ('vc', -24), ('cl', -12)], vel=6, legato=1.02)
for bi in (14, 15, 16, 17, 18): play_mel(bi, MEL, [('vln1', 0), ('fl', 0), ('ob', -12)], vel=0)
play_mel(13, FANFARE, [('hn', 0), ('tpt', 0)], vel=6)
for bi in (19, 20):
    play_mel(bi, FANFARE, [('tpt', 0), ('hn', -12)], vel=6)
    play_mel(bi, MEL, [('vln1', 0), ('fl', 0)], vel=0)
for bi in (21, 22): play_mel(bi, DARK, [('cl', 0), ('bsn', -12), ('vla', 0)], vel=10, legato=1.0)
for bi in (23, 24, 25): play_mel(bi, MEL, [('fl', 0), ('vln1', -12)], vel=8)
for bi in (23, 24, 25):
    s = BARS[bi][0]
    for off, m, ln in MEL[bi]:  # clarinet in thirds below
        name = chord_at(s + off * BEAT)[0]; pcs = CH[name][1]
        c = [x for x in voicing(pcs, m - 9, m - 3)]
        if c: N(s + off * BEAT, ln * BEAT * .95, 'cl', c[-1], dyn(s) - 4)
for bi in (26, 27, 28): play_mel(bi, MEL, [('vln1', 0), ('fl', 0), ('ob', -12)], vel=4)

# ---------------- accompaniment ----------------
def eighths(s, beats):
    return [s + i * BEAT / 2 for i in range(int(beats * 2))]
for bi, (s, beats, chs) in enumerate(BARS):
    t_end = s + beats * BEAT
    d = dyn(s)
    sec = 'intro' if bi < 3 else 'final' if bi == 29 else 'dark' if bi in (21, 22) else 'grace' if bi in (23, 24, 25) else 'lyric' if 9 <= bi <= 12 else 'drive'
    for i, t in enumerate(eighths(s, beats)):
        name = chord_at(t)[0]; pcs = CH[name][1]; on_beat = i % 2 == 0; acc = 8 if i % 8 == 0 else 3 if i % 4 == 0 else 0
        if sec in ('drive', 'lyric', 'grace'):
            v = voicing(pcs, 62, 79)
            pat = [0, 2, 1, 3, 0, 2, 1, 3]
            if sec != 'grace':
                N(t, .13 if sec == 'drive' else .2, 'vln2', v[min(pat[i % 8], len(v) - 1)], d - 14 + acc)
            if not on_beat and sec != 'grace':
                vv = voicing(pcs, 55, 67)[:2]
                for m in vv: N(t, .12, 'vla', m, d - 18)
            # cello spiccato ostinato: root root fifth root
            r = bass_of(name, 38, 49); f = r + 7
            cm = [r, r, f, r + 12, r, r, f, r][i % 8] if sec == 'drive' else [r, f, r + 12, f][i % 4]
            if sec != 'grace' or on_beat: N(t, .12, 'vc', cm, d - 10 + acc)
            VSCO_SPIC.append((t, cm, d - 10 + acc)) if sec == 'drive' else None
        if sec == 'dark':
            r = bass_of(name, 35, 47)
            N(t, .14, 'vc', [r, r, r + 7, r][i % 4], d - 2 + acc); VSCO_SPIC.append((t, [r, r, r + 7, r][i % 4], d - 6)) if False else None
        if sec == 'grace':  # harp 8ths arpeggio
            v = voicing(pcs, 55, 86); N(t, .6, 'hp', v[(i * 2) % len(v)] if i % 8 < 4 else v[(len(v) - 1) - ((i * 2) % len(v))], d - 6)
            if on_beat: N(t, .18, 'vln2', voicing(pcs, 62, 76)[i // 2 % 3], d - 16)
    # pizz basses on chord beats
    if sec not in ('intro', 'final'):
        x = s
        for name, cb in chs:
            for k in range(0, int(cb), 2):
                N(x + k * BEAT, .4, 'cb', bass_of(name, 31, 42), d + 2)
                if sec in ('drive',) and k == 0: N(x + k * BEAT, .22, 'bsn', bass_of(name, 38, 50), d - 10)
            x += cb * BEAT
    # sustained pads: horns + string pad (chord changes)
    x = s
    for name, cb in chs:
        pcs = CH[name][1]; dur = cb * BEAT
        if sec in ('lyric', 'grace', 'dark', 'intro', 'drive'):
            hv = voicing(pcs, 55, 70)[:3]
            if sec in ('lyric', 'intro', 'dark') or bi in (13, 18, 19, 20, 26, 27, 28):
                for m in hv: N(x, dur * .98, 'hn', m, d - (14 if sec != 'dark' else 6), hum=False)
        if sec in ('lyric', 'intro', 'grace', 'dark', 'drive'):
            pv = voicing(pcs, 66, 81)[:3] if sec != 'dark' else voicing(pcs, 50, 64)[:3]
            for m in pv: N(x, dur * .99, 'pad', m, d - 20, hum=False)
        x += cb * BEAT

# ---------------- intro (bars 0-2) ----------------
for m in (38, 50): N(0.0, 5.9, 'cb' if m == 38 else 'vc', m, 60, hum=False)
PG.append((0.0, 'cb', 50, 49)); PG.append((5.6, 'cb', 50, 45))     # basses arco for intro pedal, pizz after
for k, m in enumerate([62, 66, 69, 74, 78, 81, 86, 90]): N(0.15 + k * 0.11, 1.6, 'hp', m, 58 + k * 3)   # harp rising arpeggio
play_mel(1, {1: [(0, 69, 1), (1, 74, .5), (1.5, 78, .5), (2, 81, 2)]}, [('hn', 0)], vel=14)
for k, m in enumerate([86, 90, 93, 98]): N(2.5 + k * .13, .6, 'glk', m, 70 + k * 4, hum=False)      # title sparkle
for k, m in enumerate([86, 93, 98]): N(3.75 + k * .25, .5, 'glk', m, 60, hum=False)                # shine sweep
for k, m in enumerate([69, 71, 73, 74, 76, 78, 79, 81]): N(5.0 + k * .125, .14, 'fl', m, 70 + k * 3); N(5.0 + k * .125, .14, 'cl', m - 12, 66 + k * 3)
PG.append((4.0, 'pad', 20, 44)); PG.append((5.95, 'pad', 20, 49))  # violins tremolo crescendo in bar 2
ramp('pad', 0, 2, 50, 100); ramp('pad', 4, 5.95, 60, 127); ramp('hn', 0, 6, 70, 115)
for i in range(int(2.0 / 0.0625)): N(4.0 + i * 0.0625, .07, 'timp', 45, 30 + i * 2.5, hum=False)        # timp roll on A crescendo
for i in range(int(1.6 / 0.0625)): N(0.0 + i * 0.0625, .07, 'timp', 38, 40 - abs(i - 12) * 1.5, hum=False)  # soft opening roll on D

# ---------------- S7 dark colours / S8 pizz switch ----------------
PG.append((40.95, 'pad', 20, 44)); PG.append((44.95, 'pad', 20, 49))
PG.append((44.95, 'vln2', 25, 45)); PG.append((50.95, 'vln2', 25, 48))
PG.append((16.95, 'vln1', 20, 49)); PG.append((24.95, 'vln1', 20, 48))
for i in range(int(4 / 0.0625)): N(41 + i * 0.0625, .07, 'timp', 47, 28 + 14 * np.sin(np.pi * i / 64), hum=False)

# ---------------- hits & sync accents ----------------
BD = []   # VSCO bass drum (time, level)
def crash(t, v=96): N(t, 2.5, 'perc', 49, v, hum=False)
def timp(t, m=38, v=100): N(t, 1.2, 'timp', m, v, hum=False)
def tutti(t, name='D', v=108, dur=1.0):
    pcs = CH[name][1]
    for inst, lo, hi in [('vln1', 74, 90), ('vln2', 62, 78), ('vla', 55, 69), ('hn', 55, 69), ('tpt', 62, 74), ('fl', 81, 93), ('ob', 69, 81)]:
        for m in voicing(pcs, lo, hi)[-3:]: N(t, dur, inst, m, v, hum=False)
    N(t, dur, 'vc', bass_of(name, 38, 49), v, hum=False); N(t, dur, 'cb', bass_of(name, 31, 42), v, hum=False)
tutti(6.0, 'D', 100, .5); timp(6.0, 38, 110); crash(6.0, 90); BD.append((6.0, .8))
for t, m in [(7.5, 93), (8.5, 98)]: N(t, .8, 'glk', m, 74, hum=False); N(t, .8, 'hp', m - 12, 70, hum=False)      # odometer years
timp(11.0, 38, 96); crash(11.0, 70)
for t, m in [(11.0, 90), (11.5, 93), (12.0, 98)]: N(t, .6, 'glk', m, 76, hum=False)                                   # facade callouts
for k in range(12): N(16.0 + k * .08, .5, 'hp', voicing([2, 4, 6, 7, 9, 11, 1], 55, 95)[k], 60 + k * 2, hum=False)               # gliss into S4
timp(17.0, 43, 88); crash(17.0, 60)
for t, m in [(17.5, 91), (18.25, 95), (19.0, 98), (19.5, 86), (21.0, 88), (22.0, 93)]: N(t, .7, 'glk', m, 68, hum=False)  # columns
for i in range(int(1.0 / 0.0625)): N(24.0 + i * 0.0625, .07, 'timp', 45, 40 + i * 4, hum=False)                      # roll into details
tutti(25.0, 'D', 112, .7); timp(25.0, 38, 120); crash(25.0, 104); BD.append((25.0, 1.0))
for k, t in enumerate([27, 29, 31, 33, 35]):
    nm = chord_at(t)[0]; timp(t, bass_of(nm, 38, 45), 104); BD.append((t, .45)); N(t, .5, 'glk', voicing(CH[nm][1], 86, 98)[-1], 72, hum=False)
    if k == 0: crash(t, 80)
for i in range(int(1.0 / 0.0625)): N(36.0 + i * 0.0625, .07, 'timp', 45, 45 + i * 4, hum=False)
tutti(37.0, 'D', 116, 1.5); timp(37.0, 38, 124); crash(37.0, 110); BD.append((37.0, 1.0))
timp(39.0, 43, 100); timp(40.0, 45, 104)
timp(41.0, 35, 90); BD.append((41.0, .6))
for k in range(14): N(44.1 + k * .065, .7, 'hp', voicing([2, 4, 6, 7, 9, 11, 1], 60, 98)[k], 56 + k * 2, hum=False)               # gliss into S8
for k in range(7): N(46.2 + k * .13, .6, 'glk', [86, 90, 93, 91, 95, 98, 102][k], 66, hum=False)                      # frames drop
N(45.0, 2.0, 'perc', 81, 70, hum=False); N(47.5, 2.0, 'perc', 81, 60, hum=False)                                      # triangle
timp(51.0, 47, 96); crash(51.0, 76); BD.append((51.0, .5))
for t in (52.0, 53.0, 54.0): N(t, .6, 'glk', 93 if t != 53 else 95, 64, hum=False)
for i in range(int(1.0 / 0.0625)): N(55.0 + i * 0.0625, .07, 'timp', 45, 55 + i * 4, hum=False)
for k in range(10): N(55.0 + k * .1, .1, 'perc', 51, 30 + k * 7, hum=False)                                          # cymbal swell
# finale
tutti(56.0, 'D', 120, 3.6); timp(56.0, 38, 127); crash(56.0, 118); BD.append((56.0, 1.0))
for k in range(16): N(56.0 + k * .045, 2.5, 'hp', voicing([2, 6, 9], 50, 98)[min(k, 11)], 80, hum=False)
for m in (86, 90, 93, 98): N(56.0, 3, 'glk', m, 80, hum=False)
for inst in ('vln1', 'vln2', 'vla', 'hn', 'tpt', 'fl', 'ob', 'pad'): ramp(inst, 57.0, 59.6, 127, 30)
for i in range(int(2.0 / 0.0625)): N(57.4 + i * 0.0625, .07, 'timp', 38, 70 - i * 1.6, hum=False)
N(59.0, .5, 'cb', 38, 96, hum=False); N(59.0, .5, 'vc', 50, 96, hum=False); N(59.0, .6, 'hp', 62, 90, hum=False); timp(59.0, 38, 100)

# expression shaping for sustained layers per section
for inst in ('hn', 'pad'):
    ramp(inst, 6, 6.2, 115, 95); ramp(inst, 16, 17, 90, 105); ramp(inst, 23.5, 25, 100, 127); ramp(inst, 35, 37, 100, 127)
    ramp(inst, 41, 44.8, 80, 110); ramp(inst, 51, 55.9, 90, 127)
ramp('vln1', 17, 17.1, 127, 112); ramp('vln1', 21, 23.8, 105, 127)

# ================= v2: insert staircase (17-21) and corridor (45-51) passages =================
def remap(t): return t if t < 17 - 1e-9 else t + 4 if t < 41 - 1e-9 else t + 10
EV[:] = [(remap(t), d, i, m, v) for t, d, i, m, v in EV]
CC[:] = [(remap(t), i, c, v) for t, i, c, v in CC]
PG[:] = [(remap(t), i, b, p) for t, i, b, p in PG]
VSCO_SPIC[:] = [(remap(t), m, v) for t, m, v in VSCO_SPIC]
BD[:] = [(remap(t), l) for t, l in BD]
def new_bar(s, beats, chs, style, d, mel=None, melinst=(), mel_vel=6):
    def ch_at(t):
        x = s
        for name, cb in chs:
            if t < x + cb * BEAT - 1e-9: return name
            x += cb * BEAT
        return chs[-1][0]
    for i in range(int(beats * 2)):
        t = s + i * BEAT / 2; name = ch_at(t); pcs = CH[name][1]; on = i % 2 == 0; acc = 6 if i % 8 == 0 else 0
        hv = voicing(pcs, 55, 86)
        if style == 'stately':
            N(t, .2, 'vln2', voicing(pcs, 62, 76)[[0, 2, 1, 2][i % 4]], d - 16 + acc)
            if not on:
                for m in voicing(pcs, 55, 67)[:2]: N(t, .14, 'vla', m, d - 20)
            if on: N(t, .45, 'vc', bass_of(name, 38, 49) + (0 if i % 4 == 0 else 7), d - 6 + acc)
            N(t, .5, 'hp', hv[(i * 2) % len(hv)], d - 14)
        else:  # airy
            N(t, .7, 'hp', hv[(i * 3) % len(hv)] if i % 4 < 2 else hv[-1 - (i * 2) % len(hv)], d - 8)
            if on: N(t, .2, 'vln2', voicing(pcs, 64, 79)[i // 2 % 3], d - 18)
    x = s
    for name, cb in chs:
        dur = cb * BEAT
        for k in range(0, int(cb), 2): N(x + k * BEAT, .4, 'cb', bass_of(name, 31, 42), d)
        for m in voicing(CH[name][1], 66, 81)[:3]: N(x, dur * .99, 'pad', m, d - 18, hum=False)
        if style == 'stately':
            for m in voicing(CH[name][1], 55, 69)[:3]: N(x, dur * .98, 'hn', m, d - 16, hum=False)
        x += dur
    if mel:
        for off, m, ln in mel:
            for inst, sh in melinst: N(s + off * BEAT, ln * BEAT * .98, inst, m + sh, d + mel_vel)
# staircase: noble horn & cello melody, harp and strings (G  D/F# | Em  A) -> columns (G)
new_bar(17, 4, [('G', 2), ('D/F#', 2)], 'stately', 84, [(0, 67, 1.5), (1.5, 71, .5), (2, 74, 1), (3, 69, 1)], [('hn', 0), ('vc', -12), ('vln1', 12)])
new_bar(19, 4, [('Em', 2), ('A', 2)], 'stately', 86, [(0, 71, 1), (1, 67, 1), (2, 69, 1.5), (3.5, 73, .5)], [('hn', 0), ('vc', -12), ('vln1', 12)])
ramp('vln1', 16.9, 17.0, 127, 105); ramp('vln1', 19.5, 20.95, 105, 127)
timp(17.0, 43, 92); crash(17.0, 58)
for k in range(14): N(17.0 + k * .055, .8, 'hp', voicing([2, 4, 6, 7, 9, 11, 1], 55, 98)[k], 62 + k * 2, hum=False)   # doors open
for t, m in [(17.6, 86), (18.3, 91), (18.65, 95), (19.0, 98)]: N(t, .7, 'glk', m, 66, hum=False)                          # axis + callouts
for i in range(int(.5 / 0.0625)): N(20.5 + i * 0.0625, .07, 'timp', 45, 50 + i * 6, hum=False)
# corridors: airy flute over harp (ventilation) -> warm strings (brick arcade); 2/4 bars put the photo change on a downbeat
new_bar(45, 4, [('D', 2), ('Bm', 2)], 'airy', 74, [(0, 81, 1), (1, 78, .5), (1.5, 74, .5), (2, 83, 1), (3, 78, 1)], [('fl', 0), ('cl', -12)])
new_bar(47, 2, [('A', 2)], 'airy', 74, [(0, 76, .5), (.5, 78, .5), (1, 81, 1)], [('fl', 0), ('cl', -12)])
new_bar(48, 4, [('G', 2), ('D/F#', 2)], 'stately', 80, [(0, 79, 1.5), (1.5, 78, .5), (2, 74, 1), (3, 78, 1)], [('vln1', 0), ('vc', -24), ('ob', -12)])
new_bar(50, 2, [('A', 2)], 'stately', 80, [(0, 76, 1), (1, 73, 1)], [('vln1', 0), ('vc', -24), ('ob', -12)])
PG.append((44.95, 'vln1', 20, 49)); PG.append((50.95, 'vln1', 20, 48))
timp(45.0, 38, 80)
for k in range(5): N(45.5 + k * .5, 1.2, 'glk', [93, 98, 95, 100, 98][k], 52, hum=False)    # breeze sparkle
for k in range(14): N(47.3 + k * .05, .8, 'hp', voicing([2, 4, 6, 7, 9, 11, 1], 60, 98)[k], 60 + k * 2, hum=False)  # into arch reveal
timp(48.0, 43, 90); crash(48.0, 56); N(48.0, .8, 'glk', 91, 70, hum=False)
ramp('pad', 45, 47.8, 70, 100); ramp('pad', 48, 50.9, 95, 115)

# ---------------- write MIDI ----------------
TPS = 960
msgs = []
for inst, (ch, bank, prog, vol, pan) in CHN.items():
    msgs += [(0, 0, mido.Message('control_change', channel=ch, control=0, value=bank if ch != 9 else 0)),
             (0, 1, mido.Message('program_change', channel=ch, program=prog if ch != 9 else 48)),
             (0, 2, mido.Message('control_change', channel=ch, control=7, value=vol)),
             (0, 2, mido.Message('control_change', channel=ch, control=10, value=int(64 + pan * .63))),
             (0, 2, mido.Message('control_change', channel=ch, control=11, value=118)),
             (0, 2, mido.Message('control_change', channel=ch, control=91, value=0)),
             (0, 2, mido.Message('control_change', channel=ch, control=93, value=0))]
for t, inst, bank, prog in PG:
    ch = CHN[inst][0]; tk = int(t * TPS)
    msgs += [(tk, 0, mido.Message('control_change', channel=ch, control=0, value=bank)), (tk, 1, mido.Message('program_change', channel=ch, program=prog))]
for t, inst, cc, v in CC:
    msgs.append((int(t * TPS), 2, mido.Message('control_change', channel=CHN[inst][0], control=cc, value=int(np.clip(v, 0, 127)))))
for t, d, inst, m, v in EV:
    ch = CHN[inst][0]
    msgs.append((int(t * TPS), 4, mido.Message('note_on', channel=ch, note=m, velocity=v)))
    msgs.append((int((t + d) * TPS), 3, mido.Message('note_off', channel=ch, note=m, velocity=0)))
msgs.sort(key=lambda x: (x[0], x[1]))
mf = mido.MidiFile(ticks_per_beat=480); tr = mido.MidiTrack(); mf.tracks.append(tr)
tr.append(mido.MetaMessage('set_tempo', tempo=500000))
last = 0
for tk, _, m in msgs:
    m.time = tk - last; last = tk; tr.append(m)
midp = WORK + '/score.mid'; mf.save(midp)
dry = WORK + '/orch_dry.wav'
subprocess.run(['fluidsynth', '-ni', '-q', '-F', dry, '-r', str(SR), '-g', '0.55', '-R', '0', '-C', '0', '-o', 'synth.polyphony=512', SF, midp], check=True)

# ---------------- load helpers ----------------
def load(f):
    w = wave.open(f); n = w.getnframes(); sw = w.getsampwidth(); ch = w.getnchannels()
    raw = w.readframes(n)
    if sw == 3:
        b = np.frombuffer(raw, np.uint8).reshape(-1, 3); d = (b[:, 0].astype(np.int32) | (b[:, 1].astype(np.int32) << 8) | (b[:, 2].astype(np.int32) << 16)); d = np.where(d >= 2 ** 23, d - 2 ** 24, d) / 2 ** 23
    elif sw == 2: d = np.frombuffer(raw, np.int16) / 32768
    else: d = np.frombuffer(raw, np.int32) / 2 ** 31
    d = d.reshape(-1, ch).astype(np.float64)
    if ch == 1: d = np.repeat(d, 2, 1)
    return d
mix = load(dry)
L = int(SR * 70.5); mix = np.pad(mix, ((0, max(0, L - len(mix))), (0, 0)))[:L]

# VSCO real cello spiccato layer (pitch-shifted from nearest sample, round-robin)
spic = {}
for f in glob.glob(VSCO + '/Strings/Cello Section/spic/*.wav'):
    mm = re.match(r'spic_([A-G]#?)(\d)_v(\d)_RR(\d)', os.path.basename(f))
    pc = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].index(mm.group(1)); midi = 12 * (int(mm.group(2)) + 2) + pc
    spic.setdefault(midi, []).append((int(mm.group(3)), f))
cache = {}
def get(f):
    if f not in cache:
        x = load(f); a = np.argmax(np.abs(x).max(1) > 0.02); cache[f] = x[a:a + int(SR * .45)] * np.linspace(1, 0, min(len(x) - a, int(SR * .45)))[:, None] ** 1.5
    return cache[f]
layer = np.zeros_like(mix); rr = 0
for t, m, v in VSCO_SPIC:
    base = min(spic, key=lambda k: abs(k - m)); opts = [f for vv, f in spic[base] if vv == (2 if v > 80 else 1)] or [f for _, f in spic[base]]
    x = get(opts[rr % len(opts)]); rr += 1
    ratio = 2 ** ((m - base) / 12); idx = np.arange(0, len(x) - 1, ratio)
    y = np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in (0, 1)], 1) * (v / 110) ** 1.6
    i = int(t * SR); y = y[:L - i]; layer[i:i + len(y)] += y
# VSCO concert bass drum hits
bd = load(VSCO + '/VSCO 1 Percussion/drums/bass/bdrum_fff_1.wav')
for t, lv in BD:
    i = int(t * SR); y = bd[:L - i] * lv; layer[i:i + len(y)] += y * 0.5

def norm(x): return x / (np.abs(x).max() + 1e-9)
mix = norm(mix) + 0.42 * norm(layer) * np.array([0.8, 1.15])

# ---------------- hall reverb (stereo, frequency-dependent decay) ----------------
def hall_ir(seed, T=2.4):
    r = np.random.default_rng(seed); n = int(SR * T); t = np.arange(n) / SR
    X = np.fft.rfft(r.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    out = np.zeros(n)
    for lo, hi, rt in [(0, 250, 2.3), (250, 1000, 2.0), (1000, 4000, 1.5), (4000, 22050, 0.9)]:
        band = np.fft.irfft(X * ((f >= lo) & (f < hi)), n); out += band * np.exp(-6.9 * t / rt)
    out *= np.minimum(1, t / 0.03)
    pre = int(0.022 * SR); out = np.concatenate([np.zeros(pre), out])
    for d, g in [(0.011, .5), (0.017, .4), (0.023, .35), (0.031, .3), (0.041, .22)]:  # early reflections
        out[int(d * SR) + r.integers(0, 40)] += g * (1 if r.random() > .5 else -1) * 3
    return out / np.sqrt((out ** 2).sum())
def conv(x, h):
    M = 1 << int(np.ceil(np.log2(len(x) + len(h))))
    return np.fft.irfft(np.fft.rfft(x, M) * np.fft.rfft(h, M), M)[:len(x)]
wetL = conv(mix[:, 0], hall_ir(11)); wetR = conv(mix[:, 1], hall_ir(12))
wet = np.stack([wetL, wetR], 1)
out = mix * 0.82 + norm(wet) * np.abs(mix).max() * 0.55
# gentle tilt EQ: slight low-mid cut via simple shelving using FFT
F = np.fft.rfft(out, axis=0); f = np.fft.rfftfreq(len(out), 1 / SR)
g = 1 + 0.18 * np.exp(-((np.log2(np.maximum(f, 1) / 6000)) ** 2) / 1.2) - 0.12 * np.exp(-((np.log2(np.maximum(f, 1) / 300)) ** 2) / 0.8)
out = np.fft.irfft(F * g[:, None], len(out), axis=0)
out /= np.abs(out).max(); out = np.tanh(out * 1.3) / np.tanh(1.3)
fo = int(SR * 0.8); out[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 2
pcm = (out * 0.95 * 32767).astype(np.int16)
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', len(EV), 'notes', len(VSCO_SPIC), 'spic')
