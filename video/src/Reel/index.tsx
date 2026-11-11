import React from "react";
import { AbsoluteFill, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Finish, Wipe } from "../Visit/primitives";
import { ap, C, SANS } from "../Visit/theme";
import { BAR } from "./kit";
import timeline from "./timeline.json";
import { RGuests, RHall, RHallShows, RLunch, RSchedule, RTitle } from "./scenesA";
import { RCurator, RGifts, ROutro, RShow, RTea, RWorks } from "./scenesB";

const COMPONENTS: Record<string, React.FC> = {
  title: RTitle,
  guests: RGuests,
  schedule: RSchedule,
  hall: RHall,
  hallShows: RHallShows,
  lunch: RLunch,
  show: RShow,
  works: RWorks,
  curator: RCurator,
  tea: RTea,
  gifts: RGifts,
  outro: ROutro,
};

// Scene start frames, all on bar downbeats of the score.
const STARTS: number[] = [];
let acc = 0;
for (const s of timeline.scenes) {
  STARTS.push(acc);
  acc += s.bars * BAR;
}
export const REEL_FRAMES = acc;
const at = (id: string) => STARTS[timeline.scenes.findIndex((s) => s.id === id)];

const WIPE_COLORS = [C.mint, C.red, C.gold, C.paper];
const WIPE_LEAD = 12; // the wipe fully covers the frame 12 frames after it starts

/* Itinerary progress, top of frame, from 州廳 through 茶敘. */
const TIMES = ["11:00", "12:00", "14:00", "14:30", "16:00", "16:30"];
const HUD_FROM = at("hall");
const HUD_TO = at("gifts");

const Hud: React.FC = () => {
  const local = useCurrentFrame();
  const g = local + HUD_FROM;
  const prog = interpolate(
    g,
    [at("hall"), at("lunch"), at("show"), at("show") + BAR, at("show") + 2 * BAR, at("tea"), at("tea") + 4 * BAR],
    [0, 1, 2, 3, 3.1, 4, 4.85],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const o = ap(local, [10, 22], [1e-3, 1]) * ap(local, [HUD_TO - HUD_FROM - 14, HUD_TO - HUD_FROM - 4], [1, 0]);
  const L = 90;
  const Wd = 900;
  const seg = Wd / 5;
  return (
    <AbsoluteFill style={{ opacity: o, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: L, top: 178, width: Wd, height: 4, background: "rgba(244,240,232,0.25)" }} />
      <div style={{ position: "absolute", left: L, top: 178, width: seg * prog, height: 4, background: C.mint }} />
      {TIMES.map((t, i) => {
        const on = prog >= i - 0.001;
        return (
          <div key={t} style={{ position: "absolute", left: L + seg * i, top: 170, transform: "translateX(-50%)", textAlign: "center" }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                margin: "0 auto",
                background: on ? C.mint : C.ink,
                border: `3px solid ${on ? C.mint : "rgba(244,240,232,0.45)"}`,
              }}
            />
            <div
              style={{
                fontFamily: SANS,
                fontSize: 24,
                fontWeight: 700,
                marginTop: 8,
                color: on ? C.paper : "rgba(244,240,232,0.5)",
                textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {t}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const VisitReels: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Html5Audio src={staticFile("music/score.mp3")} />
      {timeline.scenes.map((s, i) => {
        const Scene = COMPONENTS[s.id];
        return (
          <Sequence key={s.id} from={STARTS[i]} durationInFrames={s.bars * BAR} name={s.id}>
            <Scene />
          </Sequence>
        );
      })}
      <Sequence from={HUD_FROM} durationInFrames={HUD_TO - HUD_FROM} name="hud">
        <Hud />
      </Sequence>
      {STARTS.slice(1).map((c, i) => (
        <Sequence key={`w${i}`} from={c - WIPE_LEAD} durationInFrames={32} name="wipe">
          <AbsoluteFill style={{ transform: i % 2 ? "scaleX(-1)" : undefined }}>
            <Wipe colors={[WIPE_COLORS[i % 4], WIPE_COLORS[(i + 1) % 4], C.ink2]} half={10} spread="-60%" />
          </AbsoluteFill>
        </Sequence>
      ))}
      <Finish />
    </AbsoluteFill>
  );
};
