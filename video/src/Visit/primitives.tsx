import React from "react";
import {
  AbsoluteFill,
  Img,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { ap, C, IN, INOUT, OUT, SANS } from "./theme";

/** Characters rise out of a mask, one after another. */
export const RiseText: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  dur?: number;
  style?: React.CSSProperties;
  exitAt?: number;
}> = ({ text, delay = 0, stagger = 2, dur = 22, style, exitAt }) => {
  const f = useCurrentFrame();
  const chars = Array.from(text);
  return (
    <div style={{ display: "flex", flexWrap: "nowrap", ...style }}>
      {chars.map((ch, i) => {
        const s = delay + i * stagger;
        const y = ap(f, [s, s + dur], [110, 0]);
        const exitY =
          exitAt === undefined
            ? 0
            : ap(f, [exitAt + i * 1, exitAt + i * 1 + 12], [0, -110], IN);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              overflow: "hidden",
              paddingBottom: "0.08em",
              marginBottom: "-0.08em",
            }}
          >
            <span
              style={{
                display: "inline-block",
                transform: `translateY(${y + exitY}%)`,
                whiteSpace: "pre",
              }}
            >
              {ch}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** A photo revealed by a moving clip, with a slow push-in. */
export const Photo: React.FC<{
  src: string;
  delay?: number;
  dir?: "left" | "right" | "up" | "down";
  style?: React.CSSProperties;
  zoom?: [number, number];
  fit?: "cover" | "contain";
  position?: string;
  revealDur?: number;
}> = ({
  src,
  delay = 0,
  dir = "left",
  style,
  zoom = [1.18, 1.0],
  fit = "cover",
  position = "center",
  revealDur = 26,
}) => {
  const f = useCurrentFrame();
  const p = ap(f, [delay, delay + revealDur], [100, 0]);
  const clip =
    dir === "left"
      ? `inset(0 ${p}% 0 0)`
      : dir === "right"
        ? `inset(0 0 0 ${p}%)`
        : dir === "up"
          ? `inset(${p}% 0 0 0)`
          : `inset(0 0 ${p}% 0)`;
  const sc = ap(f, [delay, delay + 140], zoom, (t) => t);
  return (
    <div style={{ position: "absolute", overflow: "hidden", clipPath: clip, ...style }}>
      <Img
        src={staticFile(`visit/${src}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: fit,
          objectPosition: position,
          transform: `scale(${sc})`,
        }}
      />
    </div>
  );
};

/** Pill label with a sliding fill. */
export const Tag: React.FC<{
  children: React.ReactNode;
  delay?: number;
  color?: string;
  text?: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, color = C.mint, text = C.ink, size = 30, style }) => {
  const f = useCurrentFrame();
  const w = ap(f, [delay, delay + 16], [0, 100]);
  const o = ap(f, [delay + 6, delay + 18], [0, 1]);
  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        padding: `${size * 0.28}px ${size * 0.7}px`,
        fontFamily: SANS,
        fontWeight: 700,
        fontSize: size,
        color: text,
        letterSpacing: "0.06em",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: color,
          clipPath: `inset(0 ${100 - w}% 0 0)`,
        }}
      />
      <span style={{ position: "relative", opacity: o }}>{children}</span>
    </div>
  );
};

/** Counts up to a number. */
export const Count: React.FC<{ to: number; delay?: number; dur?: number }> = ({
  to,
  delay = 0,
  dur = 30,
}) => {
  const f = useCurrentFrame();
  const v = Math.round(ap(f, [delay, delay + dur], [0, to]));
  return <>{v}</>;
};

/** Thin rule that draws itself. */
export const Rule: React.FC<{
  delay?: number;
  dur?: number;
  vertical?: boolean;
  color?: string;
  style?: React.CSSProperties;
}> = ({ delay = 0, dur = 24, vertical, color = C.line, style }) => {
  const f = useCurrentFrame();
  const p = ap(f, [delay, delay + dur], [0, 1]);
  return (
    <div
      style={{
        position: "absolute",
        background: color,
        transformOrigin: vertical ? "top" : "left",
        transform: vertical ? `scaleY(${p})` : `scaleX(${p})`,
        ...(vertical ? { width: 2 } : { height: 2 }),
        ...style,
      }}
    />
  );
};

/** Film grain + vignette, sits over everything. */
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  const seed = Math.floor(f / 2);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <svg width="100%" height="100%" style={{ opacity: 0.09, mixBlendMode: "overlay" }}>
        <filter id={`g${seed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed={Math.floor(random(seed) * 1000)}
          />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Three-band diagonal wipe that hides a hard cut.
 * Mount it so that local frame 0 is its start; the screen is fully covered at frame `half`.
 */
export const Wipe: React.FC<{ colors?: string[]; half?: number }> = ({
  colors = [C.mint, C.red, C.paper],
  half = 10,
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {colors.map((c, i) => {
        const d = i * 2;
        const enter = ap(f, [d, d + half], [-130, 0], OUT);
        const leave = ap(f, [half + d, half * 2 + 2 + d], [0, 130], INOUT);
        const x = f < half + d ? enter : leave;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "-20%",
              bottom: "-20%",
              left: "-20%",
              right: "-20%",
              background: c,
              transform: `translateX(${x}%) skewX(-18deg)`,
              // Later bands stack on top while entering, earlier ones while leaving,
              // so both edges show the colour stripes.
              zIndex: f < half ? i : colors.length - i,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
