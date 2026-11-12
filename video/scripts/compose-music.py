"""Compose the reel's score: an original, light classical orchestral piece in D major.

The score is built from src/Reel/timeline.json, so every scene cut lands on a bar
downbeat (timpani + triangle) and is led in by a harp glissando under the wipe.

    python3 scripts/compose-music.py      # writes public/music/score.mid and score.mp3

Needs: pip install mido; apt install fluidsynth fluid-soundfont-gm; ffmpeg.
"""
import json
import os
import random
import subprocess

import mido

random.seed(7)
TL = json.load(open("src/Reel/timeline.json", encoding="utf-8"))
BPM = TL["bpm"]
TPB = 480  # ticks per beat
BAR = 4 * TPB
SF2 = "/usr/share/sounds/sf2/FluidR3_GM.sf2"

# ── harmony ──────────────────────────────────────────────
CHORDS = {  # (bass root, chord tones in octave 4)
    "D": (38, [62, 66, 69]),
    "G": (43, [67, 71, 74]),
    "A": (45, [69, 73, 76]),
    "A7": (45, [67, 69, 73, 76]),
    "Bm": (47, [66, 71, 74]),
    "Em": (40, [64, 67, 71]),
}

# ── melody cells: (midi pitch or None, beats) per bar ────
M = {
    "A1": [(69, 1), (66, .5), (69, .5), (74, 1.5), (73, .5)],
    "A2": [(71, 1), (74, .5), (71, .5), (67, 1), (71, 1)],
    "A3": [(69, .5), (71, .5), (73, .5), (74, .5), (76, 1), (73, 1)],
    "A4": [(74, 1.5), (69, .5), (66, 1), (62, 1)],
    "B1": [(71, .5), (73, .5), (74, .5), (76, .5), (78, 1), (74, 1)],
    "B2": [(79, 1), (76, .5), (79, .5), (78, 1), (76, 1)],
    "B3": [(76, .5), (74, .5), (73, .5), (71, .5), (69, 1), (73, 1)],
    "B4": [(74, 3), (None, 1)],
    "C1": [(79, .5), (78, .5), (76, .5), (74, .5), (71, 1), (74, 1)],
    "C2": [(78, .5), (76, .5), (74, .5), (73, .5), (74, 1), (69, 1)],
    "C3": [(71, .5), (73, .5), (74, .5), (76, .5), (79, 1), (78, .5), (76, .5)],
    "C4": [(76, 1), (73, 1), (69, 1.5), (None, .5)],
    "D1": [(76, .5), (79, .5), (78, .5), (76, .5), (74, 1), (73, 1)],
    "D2": [(71, .5), (73, .5), (76, .5), (73, .5), (69, 1.5), (None, .5)],
    "F1": [(74, 4)],
}
PHRASE = {
    "A": [("D", "A1"), ("G", "A2"), ("A", "A3"), ("D", "A4")],
    "B": [("Bm", "B1"), ("Em", "B2"), ("A", "B3"), ("D", "B4")],
    "C": [("G", "C1"), ("D", "C2"), ("G", "C3"), ("A", "C4")],
    "T": [("Em", "D1"), ("A7", "D2")],  # 2-bar turnaround onto V
    "S": [("G", "C1"), ("A", "C4")],  # short 2-bar phrase ending on V
    "END": [("D", "A1"), ("G", "A2"), ("A7", "A3"), ("D", "F1")],
}

# Per scene: phrases and orchestration level (1 light … 3 full), extra colour.
PLAN = {
    "title": (["A"], 1, {}),
    "guests": (["B"], 2, {}),
    "schedule": (["S"], 2, {}),
    "hall": (["C"], 3, {}),
    "route": (["B", "T"], 2, {}),
    "mayorShow": (["A", "T"], 2, {"lead": "oboe"}),
    "lunch": (["A"], 2, {"lead": "clarinet"}),
    "show": (["C", "T"], 3, {}),
    "works": (["A", "T"], 3, {"glock": True}),
    "curator": (["B"], 2, {}),
    "tea": (["C"], 1, {}),
    "gifts": (["A"], 2, {"glock": True}),
    "outro": (["END"], 3, {}),
}

PROGRAMS = {  # channel: GM program
    0: 48,  # strings (melody)
    1: 73,  # flute
    2: 68,  # oboe
    3: 45,  # pizzicato strings
    4: 46,  # harp
    5: 60,  # french horns
    6: 42,  # cello
    7: 47,  # timpani
    8: 9,   # glockenspiel
    10: 49,  # slow strings pad
    11: 71,  # clarinet
    12: 61,  # brass section
}
events = []  # (tick, channel, note, velocity, duration_ticks)


def note(t, ch, n, v, d):
    v = max(1, min(127, int(v + random.uniform(-4, 4))))
    events.append((int(t), ch, n, v, max(1, int(d))))


def perc(t, n, v):
    events.append((int(t), 9, n, v, TPB // 2))


def bar_music(t0, chord, cell, level, extra):
    root, tones = CHORDS[chord]
    # melody
    lead = {"oboe": 2, "clarinet": 11}.get(extra.get("lead"))
    tt = t0
    for i, (p, beats) in enumerate(cell):
        d = beats * TPB
        if p is not None:
            acc = 8 if tt == t0 else 0
            if level == 1:
                note(tt, 1, p + 12, 78 + acc, d * .92)
            else:
                note(tt, 0, p, 84 + acc, d * .95)
                note(tt, 1, p + 12, 58 + acc, d * .9)
                if lead is not None:
                    note(tt, lead, p, 80 + acc, d * .9)
                if level == 3:
                    note(tt, 2, p, 62, d * .9)
            if extra.get("glock") and beats <= 1:
                note(tt, 8, p + 12, 50, TPB * .5)
        tt += d
    # pizzicato bass: beats 1 and 3, plus a pickup on 4& at level 3
    fifth = root + 7
    note(t0, 3, root + 12, 80, TPB * .4)
    note(t0 + 2 * TPB, 3, fifth + 12, 70, TPB * .4)
    if level >= 2:
        note(t0 + 1 * TPB, 3, tones[-1] - 12, 52, TPB * .3)
        note(t0 + 3 * TPB, 3, tones[1] - 12, 52, TPB * .3)
    # harp alberti in 8ths
    pat = [tones[0] - 12, tones[-1] - 12, tones[1] - 12, tones[-1] - 12]
    for k in range(8):
        note(t0 + k * TPB / 2, 4, pat[k % 4], 58 if level > 1 else 64, TPB * .45)
    if level >= 2:
        for n in tones:
            note(t0, 10, n - 12, 46, BAR * .98)
        note(t0, 6, root, 66, BAR * .98)
    if level >= 3:
        for n in tones[1:]:
            note(t0, 5, n - 12, 58, 2 * TPB * .95)
            note(t0 + 2 * TPB, 5, n - 12, 52, 2 * TPB * .95)
        timp = root if root >= 40 else root + 12
        note(t0, 7, timp, 82, TPB)
        note(t0 + 2 * TPB, 7, timp, 60, TPB)


pos = 0  # ticks
cuts = []
for sc in TL["scenes"]:
    phrases, level, extra = PLAN[sc["id"]]
    bars = [b for ph in phrases for b in PHRASE[ph]]
    n_full = int(sc["bars"])
    part = sc["bars"] - n_full  # a scene may end with a shortened bar (e.g. 3.5 bars)
    assert len(bars) == n_full + (1 if part else 0), (sc["id"], len(bars))
    cuts.append(pos)
    for k, (chord, cell) in enumerate(bars):
        limit = BAR if k < n_full else int(part * BAR)
        first = len(events)
        bar_music(pos, chord, M[cell], level, extra)
        # drop / clip anything past a shortened bar
        kept = [e for e in events[first:] if e[0] < pos + limit]
        events[first:] = [(t, ch, n, v, min(d, pos + limit - t)) for t, ch, n, v, d in kept]
        pos += limit
TOTAL_TICKS = pos

# Scene downbeats: timpani + triangle + soft cymbal; harp glissando on the beat before.
for i, t in enumerate(cuts):
    if i > 0:
        perc(t, 81, 70)
        perc(t, 49, 46)
        note(t, 7, 45 if i % 2 else 38 + 12, 96, TPB)
        scale = [62, 64, 66, 67, 69, 71, 73, 74, 76, 78, 79, 81]
        for k, n in enumerate(scale):
            note(t - TPB + k * TPB / len(scale), 4, n, 50 + k * 3, TPB * .6)
    else:
        perc(t, 81, 60)

# Ending: timpani roll into the final chord, then a held tutti D major.
t_end = TOTAL_TICKS - BAR
for k in range(16):
    note(t_end - 2 * TPB + k * TPB / 8, 7, 45, 50 + k * 3, TPB / 8)
for ch, ns, v in [(10, [50, 54, 57, 62], 70), (5, [57, 62, 66], 76), (12, [62, 66, 69], 70), (6, [38], 84)]:
    for n in ns:
        note(t_end, ch, n, v, BAR * 1.2)
note(t_end, 7, 50, 100, TPB * 2)
perc(t_end, 49, 80)

# ── write MIDI ───────────────────────────────────────────
mid = mido.MidiFile(ticks_per_beat=TPB)
track = mido.MidiTrack()
mid.tracks.append(track)
msgs = [(0, mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(BPM)))]
for ch, prog in PROGRAMS.items():
    msgs.append((0, mido.Message("program_change", channel=ch, program=prog)))
    msgs.append((0, mido.Message("control_change", channel=ch, control=91, value=70)))  # reverb send
for t, ch, n, v, d in events:
    msgs.append((t, mido.Message("note_on", channel=ch, note=n, velocity=v)))
    msgs.append((t + d, mido.Message("note_off", channel=ch, note=n, velocity=0)))
msgs.sort(key=lambda m: (m[0], 0 if m[1].type != "note_on" else 1))
last = 0
for t, m in msgs:
    track.append(m.copy(time=t - last))
    last = t
mid.save("public/music/score.mid")

RAW = "public/music/.score_raw.wav"
seconds = TOTAL_TICKS / TPB * 60 / BPM
subprocess.check_call([
    "fluidsynth", "-ni", "-g", "0.5", "-r", "48000",
    "-o", "synth.reverb.room-size=0.7", "-o", "synth.reverb.level=0.6",
    "-F", RAW, SF2, "public/music/score.mid",
], stdout=subprocess.DEVNULL)
subprocess.check_call([
    "ffmpeg", "-v", "error", "-y", "-i", RAW,
    "-af", f"atrim=0:{seconds:.3f},afade=t=out:st={seconds - 1.2:.3f}:d=1.2,loudnorm=I=-16:TP=-1.5:LRA=11",
    "-ar", "48000", "-c:a", "libmp3lame", "-b:a", "192k", "public/music/score.mp3",
])
os.remove(RAW)
print(f"{TOTAL_TICKS / BAR:g} bars, {seconds:.2f}s → public/music/score.mp3")
