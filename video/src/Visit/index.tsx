import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Finish, Wipe } from "./primitives";
import { S1Title, S2Overview } from "./scenes1";
import { S3Lunch, S4Show, S5Works, S6Curator, S7Tea, S8Gifts, S9Outro } from "./scenes2";
import { ap, C, SANS } from "./theme";

// Scene cut points (frames @30fps). Total 900 = 30s.
const CUTS = [0, 90, 240, 345, 450, 585, 675, 765, 840, 900];
const SCENES = [S1Title, S2Overview, S3Lunch, S4Show, S5Works, S6Curator, S7Tea, S8Gifts, S9Outro];
const WIPE_COLORS = [
  [C.mint, C.paper, C.ink2],
  [C.red, C.mint, C.ink2],
  [C.paper, C.red, C.ink2],
  [C.mint, C.gold, C.ink2],
  [C.gold, C.paper, C.ink2],
  [C.mint, C.red, C.ink2],
  [C.red, C.gold, C.paper],
  [C.mint, C.paper, C.ink2],
];
const WIPE_LEAD = 12; // frame inside the wipe where the screen is fully covered

/** Itinerary progress bar shown while the day plays out. */
const HUD_FROM = 240;
const HUD_TO = 765;
const TIMES = ["11:00", "12:00", "14:00", "14:30", "16:00", "16:30"];

const Hud: React.FC = () => {
  const local = useCurrentFrame();
  const g = local + HUD_FROM;
  const prog = interpolate(
    g,
    [240, 280, 300, 340, 352, 376, 450, 585, 675, 765],
    [0, 0.7, 1, 1.6, 2, 3, 3.3, 3.8, 4, 4.7],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const o = ap(local, [8, 20], [0, 1]) * ap(local, [HUD_TO - HUD_FROM - 14, HUD_TO - HUD_FROM - 4], [1, 0]);
  const L = 120;
  const W = 1680;
  const seg = W / 5;
  return (
    <AbsoluteFill style={{ opacity: o, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: L, top: 1022, width: W, height: 3, background: "rgba(244,240,232,0.2)" }} />
      <div style={{ position: "absolute", left: L, top: 1022, width: seg * prog, height: 3, background: C.mint }} />
      {TIMES.map((t, i) => {
        const on = prog >= i - 0.001;
        return (
          <div key={t} style={{ position: "absolute", left: L + seg * i, top: 1015, transform: "translateX(-50%)" }}>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                margin: "0 auto",
                background: on ? C.mint : C.ink,
                border: `2px solid ${on ? C.mint : "rgba(244,240,232,0.4)"}`,
              }}
            />
            <div
              style={{
                fontFamily: SANS,
                fontSize: 20,
                fontWeight: 500,
                marginTop: 6,
                color: on ? C.paper : "rgba(244,240,232,0.45)",
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

export const VisitReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {SCENES.map((Scene, i) => (
        <Sequence key={i} from={CUTS[i]} durationInFrames={CUTS[i + 1] - CUTS[i]}>
          {/* Start each scene's intro as the wipe clears, not underneath it. */}
          <Sequence from={i === 0 ? 0 : 8} layout="none">
            <Scene />
          </Sequence>
        </Sequence>
      ))}
      <Sequence from={HUD_FROM} durationInFrames={HUD_TO - HUD_FROM}>
        <Hud />
      </Sequence>
      {CUTS.slice(1, -1).map((c, i) => (
        <Sequence key={`w${i}`} from={c - WIPE_LEAD} durationInFrames={32}>
          <AbsoluteFill style={{ transform: i % 2 ? "scaleX(-1)" : undefined }}>
            <Wipe colors={WIPE_COLORS[i]} half={10} />
          </AbsoluteFill>
        </Sequence>
      ))}
      <Finish />
    </AbsoluteFill>
  );
};
