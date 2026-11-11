import { Easing, interpolate } from "remotion";
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fonts are subset to the characters used in this video (see scripts/subset-fonts.py),
// so rendering works offline. Re-run that script after changing any on-screen text.
const FACES: [string, string, number][] = [
  ["VisitSans", "sans", 300],
  ["VisitSans", "sans", 400],
  ["VisitSans", "sans", 500],
  ["VisitSans", "sans", 700],
  ["VisitSans", "sans", 900],
  ["VisitSerif", "serif", 500],
  ["VisitSerif", "serif", 700],
  ["VisitSerif", "serif", 900],
];
for (const [family, file, weight] of FACES) {
  loadFont({
    family,
    url: staticFile(`fonts/${file}-${weight}.woff2`),
    weight: String(weight),
  });
}

const serif = { fontFamily: "VisitSerif, serif" };
const sans = { fontFamily: "VisitSans, sans-serif" };

export const SERIF = serif.fontFamily;
export const SANS = sans.fontFamily;

export const C = {
  ink: "#0e0f11",
  ink2: "#17191c",
  paper: "#f4f0e8",
  dim: "rgba(244,240,232,0.62)",
  mint: "#8fd3c3",
  red: "#e0352b",
  gold: "#d4b06a",
  line: "rgba(244,240,232,0.18)",
};

export const FPS = 30;

/** Expo-out, the house curve. */
export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const INOUT = Easing.bezier(0.83, 0, 0.17, 1);
export const IN = Easing.bezier(0.7, 0, 0.84, 0);

export const ap = (
  f: number,
  from: [number, number],
  to: [number, number],
  easing: (t: number) => number = OUT,
) =>
  interpolate(f, from, to, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
