"""Award-ceremony orchestral fanfare, D major, 90 BPM, ~50 s. Writes a MIDI file for FluidSynth."""
import mido, random, sys
random.seed(1035)
PPQ = 480
BPM = 112
mid = mido.MidiFile(ticks_per_beat=PPQ)
events = []  # (beat, order, channel, msg)

def ev(beat, msg, ch, order=1): events.append((beat, order, ch, msg))

def note(ch, beat, pitch, dur, vel, human=True):
    jt = random.uniform(-0.012, 0.012) if human else 0
    v = max(1, min(127, int(vel + (random.uniform(-6, 6) if human else 0))))
    ev(beat + jt if beat + jt > 0 else beat, mido.Message('note_on', channel=ch, note=pitch, velocity=v), ch, 2)
    ev(beat + dur * 0.97, mido.Message('note_off', channel=ch, note=pitch, velocity=0), ch, 0)

def chord(ch, beat, pitches, dur, vel):
    for p in pitches: note(ch, beat, p, dur, vel)

def cc(ch, beat, ctrl, val): ev(beat, mido.Message('control_change', channel=ch, control=ctrl, value=int(max(0, min(127, val)))), ch, 1)

def ramp(ch, b0, b1, v0, v1, ctrl=11, steps=24):
    for i in range(steps + 1):
        cc(ch, b0 + (b1 - b0) * i / steps, ctrl, v0 + (v1 - v0) * i / steps)

TRP, BRS, HRN, LOWB, STR, VLN, PIZ, HRP, GLK, DR, TIMP, FLT, BELL, CHOIR, CELLO = range(15)
programs = {TRP: 56, BRS: 61, HRN: 60, LOWB: 58, STR: 48, VLN: 48, PIZ: 45, HRP: 46, GLK: 9,
            TIMP: 47, FLT: 73, BELL: 14, CHOIR: 52, CELLO: 42}
pans = {TRP: 74, BRS: 64, HRN: 44, LOWB: 80, STR: 54, VLN: 40, PIZ: 70, HRP: 30, GLK: 88,
        TIMP: 64, FLT: 84, BELL: 70, CHOIR: 64, CELLO: 82, DR: 64}
for ch, pg in programs.items():
    ev(0, mido.Message('program_change', channel=ch, program=pg), ch, 0)
for ch, pn in pans.items():
    cc(ch, 0, 10, pn); cc(ch, 0, 7, 110); cc(ch, 0, 91, 70); cc(ch, 0, 11, 100)
cc(TIMP, 0, 7, 120); cc(DR, 0, 7, 100); cc(GLK, 0, 7, 88); cc(BELL, 0, 7, 92); cc(HRP, 0, 7, 100)

# chord table (D major)
C = {
    'D': [50, 57, 62, 66, 69], 'G': [43, 55, 59, 62, 67], 'A': [45, 57, 61, 64, 69], 'A7': [45, 55, 61, 64, 67],
    'Bm': [47, 54, 59, 62, 66], 'Em': [40, 55, 59, 64, 67], 'F#m': [42, 54, 57, 61, 66], 'D/A': [45, 57, 62, 66, 69],
}
def bar(n): return n * 4

# ---------------- form (bar numbers) ----------------
# 0-1 intro | 2-3 fanfare | 4-5 1035 dial | 6-7 sign | 8-9 place | 10-12 design | 13-14 grant build | 15-16 finale | 17 end chord
harmony = {  # bar: [(chord, beats)]
    0: [('D', 4)], 1: [('A', 4)],
    2: [('D', 2), ('G', 2)], 3: [('D/A', 2), ('A7', 2)],
    4: [('Bm', 2), ('G', 2)], 5: [('Em', 2), ('A', 2)],
    6: [('D', 2), ('F#m', 2)], 7: [('G', 2), ('A', 2)],
    8: [('G', 2), ('A', 2)], 9: [('F#m', 2), ('Bm', 2)],
    10: [('Em', 2), ('A', 2)], 11: [('D', 2), ('Bm', 2)], 12: [('G', 2), ('A', 2)],
    13: [('Bm', 2), ('G', 2)], 14: [('Em', 2), ('A', 2)],
    15: [('D', 2), ('G', 2)], 16: [('D/A', 2), ('A7', 2)],
}

def each_chord(bars):
    for b in bars:
        pos = bar(b)
        for name, d in harmony[b]:
            yield pos, name, d
            pos += d

# ---------------- intro (bars 0-1) ----------------
ramp(STR, 0, 7.5, 35, 118); ramp(CELLO, 0, 7.5, 40, 118); ramp(HRN, 0, 8, 40, 110); ramp(CHOIR, 0, 8, 30, 90)
for pos, name, d in each_chord([0, 1]):
    chord(STR, pos, C[name][1:], d, 80)
    note(CELLO, pos, C[name][0], d, 85)
    chord(CHOIR, pos, C[name][2:4], d, 60)
    chord(HRN, pos, [C[name][1], C[name][2]], d, 70)
# harp rising arpeggios
arp = [50, 54, 57, 62, 66, 69, 74, 78, 81, 86]
for i, p in enumerate(arp): note(HRP, 0.5 + i * 0.3, p, 1.5, 60 + i * 3)
arpA = [45, 49, 52, 57, 61, 64, 69, 73, 76, 81]
for i, p in enumerate(arpA): note(HRP, 4.0 + i * 0.2, p, 1.0, 65 + i * 3)
# timpani roll crescendo on A (bar 1)
for i in range(int(4 / 0.125)):
    note(TIMP, 4 + i * 0.125, 45, 0.14, 35 + i * 2.8, human=False)
# suspended cymbal swell (ride roll)
for i in range(int(3 / 0.0833)):
    note(DR, 5 + i * 0.0833, 51, 0.1, 20 + i * 2.4, human=False)
# brass pickup triplet on beat 4 of bar 1
for k, p in enumerate([69, 69, 69]): note(TRP, 7 + k / 3, p, 1 / 3, 95)

# ---------------- fanfare (bars 2-3) and reprise (15-16) ----------------
fanfare = [(0, 74, 1), (1, 69, 1/3), (1+1/3, 69, 1/3), (1+2/3, 69, 1/3), (2, 78, 1), (3, 81, 1),
           (4, 81, 1.5), (5.5, 79, .5), (6, 78, .5), (6.5, 76, .5), (7, 76, 1)]
def fanfare_section(b0, big=False):
    s = bar(b0)
    vel = 118 if big else 110
    for o, p, d in fanfare:
        note(TRP, s + o, p, d, vel)
        if big: note(TRP, s + o, p - 12 + (0 if p - 12 > 60 else 12), d, vel - 20)
        note(GLK, s + o, p + 12, min(d, 1), 80 if not big else 92)
    cc(BRS, s, 11, 115); cc(STR, s, 11, 118); cc(HRN, s, 11, 118); cc(CELLO, s, 11, 118)
    for pos, name, d in each_chord([b0, b0 + 1]):
        ch = C[name]
        # brass stabs: long-short
        chord(BRS, pos, ch[1:4], 0.9, 105)
        chord(BRS, pos + 1.5, ch[1:4], 0.45, 92)
        chord(HRN, pos, ch[2:5], d, 95)
        note(LOWB, pos, ch[0], 1.0, 105); note(LOWB, pos + 1, ch[0], 0.5, 85); note(LOWB, pos + 1.5, ch[0] + 7 if ch[0] + 7 < 60 else ch[0], 0.5, 85)
        # strings: driving 8ths
        for e in range(int(d * 2)):
            chord(STR, pos + e * 0.5, ch[2:5], 0.45, 88 if e % 2 else 100)
        note(CELLO, pos, ch[0], d, 100)
        # timpani on chord changes
        tp = {'D': 50, 'D/A': 45, 'G': 43, 'A': 45, 'A7': 45}.get(name, 45)
        note(TIMP, pos, tp, 0.5, 112 if big else 105); note(TIMP, pos + 1, tp, 0.3, 80); note(TIMP, pos + 1.5, tp, 0.3, 90)
        # march snare
        for k, (o, v) in enumerate([(0, 70), (0.75, 50), (1, 62), (1.5, 58), (1.75, 50)]):
            note(DR, pos + o, 38, 0.1, v - 12)
        if big:
            chord(CHOIR, pos, ch[2:5], d, 85)
    note(DR, s, 49, 2, 120); note(DR, s, 57, 2, 110); note(DR, s, 35, 1, 110)
    if big:
        note(DR, s + 4, 49, 2, 105)

fanfare_section(2)
fanfare_section(15, big=True)

# ---------------- bars 4-5: elegant pizzicato + flute + glock (1035 dial) ----------------
mel45 = [(0, 78, 1), (1, 74, .5), (1.5, 76, .5), (2, 78, 1), (3, 79, 1), (4, 76, 1.5), (5.5, 74, .5), (6, 73, 1), (7, 76, 1)]
cc(STR, bar(4), 11, 70); cc(CELLO, bar(4), 11, 85); cc(HRN, bar(4), 11, 80)
note(TRP, bar(4), 74, 1.5, 80)  # resolution of fanfare
for o, p, d in mel45:
    note(FLT, bar(4) + o, p, d, 92)
    note(GLK, bar(4) + o, p + 12, min(d, .5), 70)
for pos, name, d in each_chord([4, 5]):
    ch = C[name]
    for e in range(int(d * 2)):
        note(PIZ, pos + e * 0.5, ch[0] + 12 if e % 2 else ch[0], 0.3, 88)
        chord(PIZ, pos + e * 0.5 + 0.25, [ch[2], ch[3]], 0.2, 70)
    chord(STR, pos, ch[2:5], d, 60)
    note(HRP, pos, ch[1], 1, 70); note(HRP, pos + 0.5, ch[2] + 12, 1, 60); note(HRP, pos + 1, ch[3] + 12, 1, 60)
    note(DR, pos, 81, 0.5, 45)  # triangle (GM open triangle 81)
# dial "ticks": bells on each digit
for i in range(4): note(BELL, bar(4) + 0.9 + i * 1.5, [74, 69, 76, 81][i], 1.5, 70)

# ---------------- bars 6-7: hand sign — horns + flute, building ----------------
mel67 = [(0, 69, 1.5), (1.5, 74, .5), (2, 73, 2), (4, 71, 1), (5, 74, 1), (6, 76, 2)]
cc(HRN, bar(6), 11, 100); ramp(STR, bar(6), bar(8), 75, 105)
for o, p, d in mel67:
    note(HRN, bar(6) + o, p - 12, d, 95)
    note(FLT, bar(6) + o, p + 12, d, 78)
for i, p in enumerate([74, 81, 76, 81]):  # sign: 1-0-3-5 glock pings on beats
    note(GLK, bar(6) + 1.5 + i, 86 if i % 2 == 0 else 81, 0.5, 85)
for pos, name, d in each_chord([6, 7]):
    ch = C[name]
    for e in range(int(d * 2)):
        note(PIZ, pos + e * 0.5, ch[0] + (12 if e % 2 else 0), 0.3, 85)
    chord(STR, pos, ch[1:4], d, 80)
    note(CELLO, pos, ch[0], d, 85)
    note(HRP, pos, ch[2] + 12, 1, 65); note(HRP, pos + 0.5, ch[3] + 12, 1, 60)
    note(TIMP, pos, {'D': 50, 'A': 45, 'G': 43}.get(name, 45), 0.4, 70)
note(DR, bar(7) + 3, 51, 1, 60)

# ---------------- bars 8-12: warm string theme ----------------
theme = [(0, 74, 1.5), (1.5, 76, .5), (2, 78, 1), (3, 76, 1),
         (4, 73, 1.5), (5.5, 74, .5), (6, 78, 2),
         (8, 79, 1.5), (9.5, 78, .5), (10, 76, 1), (11, 81, 1),
         (12, 78, 2), (14, 74, 1), (15, 78, 1),
         (16, 79, 1), (17, 83, 1), (18, 81, 1), (19, 76, 1)]
cc(VLN, bar(8), 11, 112)
for o, p, d in theme:
    note(VLN, bar(8) + o, p, d, 100)
    note(VLN, bar(8) + o, p - 12, d, 85)
    if o >= 8: note(HRN, bar(8) + o, p - 12, d, 82)
cc(STR, bar(8), 11, 100); cc(CELLO, bar(8), 11, 105); cc(HRN, bar(8), 11, 95)
for pos, name, d in each_chord([8, 9, 10, 11, 12]):
    ch = C[name]
    chord(STR, pos, ch[1:4], d, 82)
    note(CELLO, pos, ch[0], d, 92)
    chord(CHOIR, pos, ch[2:4], d, 55)
    for k in range(int(d * 2)):
        note(HRP, pos + k * 0.5, [ch[1], ch[2], ch[3], ch[2] + 12][k % 4] + 12, 0.8, 58)
    if pos % 4 == 0: note(TIMP, pos, {'G': 43, 'Em': 40, 'D': 50, 'F#m': 42}.get(name, 45), 0.4, 75)
    if pos >= bar(10): chord(BRS, pos, ch[1:4], d, 70)
note(DR, bar(10), 49, 1, 80)
note(DR, bar(8), 49, 1, 70)
for i in range(4): note(BELL, bar(12) + i, [74, 78, 81, 86][i], 1, 72)

# ---------------- bars 13-14: grant seal — build ----------------
ramp(BRS, bar(13), bar(15), 80, 127); ramp(STR, bar(13), bar(15), 90, 127); ramp(HRN, bar(13), bar(15), 90, 127)
ramp(CHOIR, bar(13), bar(15), 60, 110)
note(DR, bar(13), 49, 2, 100); note(TIMP, bar(13), 47, 0.6, 105)
for pos, name, d in each_chord([13, 14]):
    ch = C[name]
    chord(BRS, pos, ch[1:5], d, 100)
    chord(HRN, pos, ch[2:5], d, 95)
    note(LOWB, pos, ch[0], d, 100)
    chord(STR, pos, ch[2:5], d, 95)
    note(CELLO, pos, ch[0], d, 100)
    chord(CHOIR, pos, ch[2:5], d, 85)
note(TRP, bar(13), 83, 2, 100); note(TRP, bar(13) + 2, 86, 2, 105)
note(TRP, bar(14), 79, 2, 108); note(TRP, bar(14) + 2, 81, 2, 115)
# string scale run into the finale
scale = [69, 71, 73, 74, 76, 78, 79, 81, 83, 85, 86, 88]
for i, p in enumerate(scale): note(VLN, bar(14) + 2 + i * (2 / len(scale)), p, 2 / len(scale), 90 + i * 2)
# timpani roll + cymbal swell into the finale
for i in range(int(4 / 0.125)): note(TIMP, bar(14) + i * 0.125, 45, 0.14, 50 + i * 2.4, human=False)
for i in range(int(4 / 0.0833)): note(DR, bar(14) + i * 0.0833, 51, 0.1, 25 + i * 2, human=False)


# ---------------- crisp rhythmic drive through the middle (bars 4-12) ----------------
for b in range(4, 13):
    s0 = bar(b)
    for e in range(8):
        acc = e in (0, 4)
        note(DR, s0 + e * 0.5, 70, 0.1, 62 if e % 2 else 48)          # maracas/shaker 8ths
        if e % 2 == 1: note(DR, s0 + e * 0.5 + 0.25, 70, 0.1, 40)
    for o, v in ((0, 84), (2, 74)):
        note(DR, s0 + o, 35, 0.3, v)                                     # concert bass drum
    for o, v in ((1, 62), (3, 66), (3.5, 46), (3.75, 52)):
        note(DR, s0 + o, 38, 0.1, v)                                     # snare backbeat + pickup
    # staccato string chops on the off-beats
    for name_pos, name, d in [(p_, n_, d_) for p_, n_, d_ in each_chord([b])]:
        for k in range(int(d * 2)):
            if k % 2: chord(STR, name_pos + k * 0.5, C[name][2:4], 0.18, 78)

# ---------------- bar 17: final chord ----------------
fb = bar(17)
for ch_, vel in ((BRS, 118), (HRN, 115), (STR, 112), (CHOIR, 100)):
    cc(ch_, fb, 11, 120); ramp(ch_, fb + 2.5, fb + 6.4, 120, 0, steps=30)
chord(BRS, fb, [57, 62, 66, 69], 6.4, 118)
chord(HRN, fb, [62, 66, 69], 6.4, 112)
chord(TRP, fb, [74, 78, 81], 6.0, 115); ramp(TRP, fb + 2.5, fb + 6.4, 110, 0, steps=30)
chord(STR, fb, [62, 66, 69, 74, 78], 6.4, 110)
chord(CHOIR, fb, [62, 66, 69, 74], 6.4, 100)
note(LOWB, fb, 38, 6.0, 115); ramp(LOWB, fb + 2.5, fb + 6.4, 110, 0, steps=30)
note(CELLO, fb, 38, 6.4, 110); ramp(CELLO, fb + 2.5, fb + 6.4, 110, 0, steps=30)
note(TIMP, fb, 50, 0.6, 127, human=False)
for i in range(int(3 / 0.125)): note(TIMP, fb + 0.5 + i * 0.125, 50, 0.14, max(30, 100 - i * 3), human=False)
note(DR, fb, 49, 4, 125, human=False); note(DR, fb, 57, 4, 120, human=False); note(DR, fb, 35, 2, 120, human=False)
for p in (74, 78, 81, 86): note(BELL, fb, p, 4, 92, human=False)
arpF = [62, 66, 69, 74, 78, 81, 86, 90]
for i, p in enumerate(arpF): note(HRP, fb + 0.25 + i * 0.12, p, 2, 70)
for i, p in enumerate([86, 90, 93, 98]): note(GLK, fb + i * 0.25, p, 1, 80)

# ---------------- write ----------------
track = mido.MidiTrack(); mid.tracks.append(track)
track.append(mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(BPM), time=0))
events.sort(key=lambda e: (e[0], e[1]))
last = 0
for beat, _, ch, msg in events:
    tick = int(round(beat * PPQ))
    track.append(msg.copy(time=max(0, tick - last)))
    last = max(last, tick)
track.append(mido.MetaMessage('end_of_track', time=PPQ * 4))
mid.save(sys.argv[1])
print('beats total', bar(17) + 7, 'seconds', (bar(17) + 7) * 60 / BPM)
