import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { ap, C } from "../Visit/theme";
import timeline from "./timeline.json";

export const W = 1080;
export const H = 1920;
export const BAR = timeline.framesPerBar; // 50 frames
export const BEAT = BAR / 4; // 12.5 frames at 144 BPM
export const beat = (n: number) => Math.round(n * BEAT);

/** Blurred, darkened copy of a photo filling the frame, so small photos still fill a 9:16 frame. */
export const BlurFill: React.FC<{ src: string; opacity?: number }> = ({ src, opacity = 0.55 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(`visit/${src}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(40px) saturate(1.1)",
          transform: `scale(${1.25 + f * 0.0006})`,
          opacity,
        }}
      />
      <AbsoluteFill style={{ background: "rgba(14,15,17,0.55)" }} />
    </AbsoluteFill>
  );
};

/** Bottom-to-top darkening so text over a photo stays readable. */
export const Shade: React.FC<{ from?: number; to?: number; strength?: number }> = ({
  from = 35,
  to = 75,
  strength = 0.95,
}) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(180deg, rgba(14,15,17,0) ${from}%, rgba(14,15,17,${strength}) ${to}%, rgba(14,15,17,${strength}) 100%)`,
    }}
  />
);

/** A soft scale pulse on each downbeat, for elements that should "breathe" with the music. */
export const usePulse = (amount = 0.015) => {
  const f = useCurrentFrame();
  const inBar = f % BAR;
  return 1 + amount * ap(inBar, [0, 10], [1, 0]);
};

export const Kicker: React.FC<{ children: React.ReactNode; delay?: number; color?: string }> = ({
  children,
  delay = 0,
  color = C.mint,
}) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        fontFamily: "VisitSans, sans-serif",
        fontWeight: 700,
        fontSize: 34,
        letterSpacing: "0.2em",
        color,
        opacity: ap(f, [delay, delay + 10], [0, 1]),
      }}
    >
      <div style={{ width: ap(f, [delay, delay + 18], [0, 56]), height: 4, background: color }} />
      {children}
    </div>
  );
};
