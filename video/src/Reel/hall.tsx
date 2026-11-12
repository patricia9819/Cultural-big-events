import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Photo, RiseText, Rule, Tag } from "../Visit/primitives";
import { ap, C, INOUT, SANS, SERIF } from "../Visit/theme";
import { BAR, beat, BlurFill, Kicker, Shade } from "./kit";

/* ───────────── 州廳 overview (4 bars) ───────────── */

const HALL_FLOW = [
  { t: "11:00", a: "迎賓 · 發放導覽機", p: "大門" },
  { t: "11:05", a: "州廳建築導覽", p: "游英俊副局長" },
  { t: "11:30", a: "市長邀請展", p: "A 展覽廳" },
  { t: "11:50", a: "自由活動時間", p: "大門" },
];

export const RHall: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <BlurFill src="hall.jpg" />
      <Photo
        src="hall.jpg"
        delay={0}
        dir="down"
        zoom={[1.2, 1.02]}
        revealDur={beat(2)}
        style={{ left: 0, top: 240, width: 1080, height: 680 }}
      />
      <Rule delay={beat(2)} dur={beat(2)} color={C.mint} style={{ left: 0, top: 920, width: 1080, height: 8 }} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 970 }}>
        <Tag delay={beat(1)} size={36}>
          11:00 – 12:00 · 第一站
        </Tag>
        <RiseText
          text="台中州廳"
          delay={beat(2)}
          stagger={3}
          style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 150, color: C.paper, marginTop: 18 }}
        />
        <div style={{ marginTop: 18 }}>
          {HALL_FLOW.map((r, i) => {
            const d = beat(4) + i * 3;
            return (
              <div
                key={r.t}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 24,
                  height: 64,
                  borderTop: `1px solid ${C.line}`,
                  paddingTop: 10,
                  opacity: ap(f, [d, d + 8], [0, 1]),
                  transform: `translateX(${ap(f, [d, d + 16], [60, 0])}px)`,
                }}
              >
                <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 38, color: C.mint, fontVariantNumeric: "tabular-nums" }}>{r.t}</span>
                <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: C.paper, flex: 1 }}>{r.a}</span>
                <span style={{ fontFamily: SANS, fontSize: 30, color: C.dim }}>{r.p}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 建築導覽路線 map (6 bars) ───────────── */

// Plan coordinates follow the 1F guide map (site ≈ 425 × 390 units), scaled into the frame.
const MAP = { x: 80, y: 470, s: 2.16, ox: 45, oy: 335 };
const P = (x: number, y: number) => [(x - MAP.ox) * MAP.s, (y - MAP.oy) * MAP.s] as const;
const poly = (pts: [number, number][]) => pts.map(([x, y]) => P(x, y).join(",")).join(" ");

const WINGS: [number, number][][] = [
  // A wing along 市府路 (left), with B rooms at its north end
  [[120, 385], [170, 385], [170, 600], [150, 625], [120, 625]],
  // B wing along the north side
  [[170, 405], [310, 405], [310, 455], [170, 455]],
  // C wing (east)
  [[290, 480], [375, 480], [375, 600], [290, 600]],
  [[300, 600], [420, 600], [420, 690], [300, 690]],
  // A wing along 民權路 (south) with the corner entrance
  [[150, 625], [175, 615], [310, 615], [310, 660], [170, 660], [140, 665]],
];
const LAWN: [number, number][] = [[185, 485], [285, 485], [285, 575], [252, 608], [185, 608]];

type Stop = { id: string; label: string; floor: string; x: number; y: number; lx: number; ly: number; anchor?: "start" | "end" };
const STOPS: Stop[] = [
  { id: "gate", label: "大門", floor: "1F", x: 132, y: 690, lx: -16, ly: 52, anchor: "end" },
  { id: "hall", label: "中央門廳", floor: "1F", x: 162, y: 640, lx: 24, ly: 58 },
  { id: "stair", label: "中央門廳樓梯", floor: "1F", x: 190, y: 598, lx: 26, ly: -6 },
  { id: "zz", label: "中正廳", floor: "2F", x: 140, y: 600, lx: -28, ly: -10, anchor: "end" },
  { id: "zs", label: "中山廳", floor: "2F", x: 352, y: 500, lx: 0, ly: -34 },
  { id: "shelter", label: "地下防護室", floor: "1F", x: 322, y: 560, lx: -26, ly: 12, anchor: "end" },
  { id: "galleryA", label: "A 展覽廳", floor: "1F", x: 145, y: 520, lx: 34, ly: 12 },
];
// Walk through the corridors between stops (way-points in plan units).
const LEGS: [number, number][][] = [
  [[132, 690], [162, 640]],
  [[162, 640], [190, 598]],
  [[190, 598], [140, 600]],
  [[140, 600], [175, 638], [300, 638], [332, 600], [352, 500]],
  [[352, 500], [322, 560]],
  [[322, 560], [332, 600], [300, 638], [175, 638], [145, 600], [145, 520]],
];

const legLen = (pts: [number, number][]) =>
  pts.slice(1).reduce((acc, p, i) => {
    const [x1, y1] = P(...pts[i]);
    const [x2, y2] = P(...p);
    return acc + Math.hypot(x2 - x1, y2 - y1);
  }, 0);

const pointAt = (pts: [number, number][], t: number) => {
  const total = legLen(pts);
  let d = t * total;
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = P(...pts[i - 1]);
    const [x2, y2] = P(...pts[i]);
    const l = Math.hypot(x2 - x1, y2 - y1);
    if (d <= l || i === pts.length - 1) {
      const k = l === 0 ? 0 : Math.min(1, d / l);
      return [x1 + (x2 - x1) * k, y1 + (y2 - y1) * k] as const;
    }
    d -= l;
  }
  return P(...pts[pts.length - 1]);
};

// Leg k starts on the downbeat schedule below and takes 3 beats.
const LEG_START = (k: number) => BAR + Math.round(k * 3 * (BAR / 4)) + (k >= 5 ? BAR / 4 : 0);
const LEG_DUR = beat(2.5);

export const RRoute: React.FC = () => {
  const f = useCurrentFrame();
  const drawIn = ap(f, [0, beat(3)], [0, 1], INOUT);
  const legP = LEGS.map((_, k) => ap(f, [LEG_START(k), LEG_START(k) + LEG_DUR], [0, 1], INOUT));
  const reached = (i: number) => (i === 0 ? f >= beat(2) : legP[i - 1] >= 0.999);
  // Current head of the walk
  let head = P(STOPS[0].x, STOPS[0].y) as readonly [number, number];
  let current = 0;
  legP.forEach((p, k) => {
    if (p > 0) {
      head = pointAt(LEGS[k], p);
      current = p >= 0.999 ? k + 1 : k;
    }
  });
  const floor = STOPS[current].floor;
  const ring = (f % (BAR / 2)) / (BAR / 2);
  const W = 425 * MAP.s;
  const Hm = 390 * MAP.s;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, rgba(143,211,195,0.10), transparent 60%)" }} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 260 }}>
        <Kicker>11:05 – 11:30 · 建築導覽</Kicker>
        <RiseText text="州廳導覽路線" delay={2} stagger={2} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 92, color: C.paper, marginTop: 14 }} />
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 36, color: C.dim, marginTop: 6, opacity: ap(f, [beat(1), beat(1) + 8], [0, 1]) }}>
          導覽人｜文化局 游英俊副局長
        </div>
      </div>

      <svg width={W} height={Hm} style={{ position: "absolute", left: MAP.x, top: MAP.y, overflow: "visible" }}>
        {/* site & roads */}
        <rect x={0} y={0} width={W} height={Hm} fill="none" stroke={C.line} strokeWidth={2} strokeDasharray="6 10" opacity={drawIn} />
        <text x={W / 2} y={Hm + 40} textAnchor="middle" fill={C.dim} fontFamily={SANS} fontSize={26} opacity={drawIn}>
          民權路
        </text>
        <text x={-14} y={Hm / 2} textAnchor="middle" fill={C.dim} fontFamily={SANS} fontSize={26} opacity={drawIn} transform={`rotate(-90 -14 ${Hm / 2})`}>
          市府路
        </text>
        {/* lawn */}
        <polygon points={poly(LAWN)} fill="rgba(143,211,195,0.08)" stroke="rgba(143,211,195,0.35)" strokeWidth={2} opacity={drawIn} />
        <text {...(() => { const [x, y] = P(235, 508); return { x, y }; })()} textAnchor="middle" fill="rgba(143,211,195,0.6)" fontFamily={SANS} fontSize={26} opacity={drawIn}>
          中央草坪
        </text>
        {/* building wings draw in */}
        {WINGS.map((w, i) => (
          <polygon
            key={i}
            points={poly(w)}
            fill={`rgba(244,240,232,${0.07 * drawIn})`}
            stroke="rgba(244,240,232,0.7)"
            strokeWidth={3}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - ap(f, [i * 3, i * 3 + beat(3)], [0, 1], INOUT)}
          />
        ))}
        {/* walked route */}
        {LEGS.map((leg, k) => {
          const p = legP[k];
          if (p <= 0) return null;
          const len = legLen(leg);
          const toA = k === LEGS.length - 1;
          return (
            <polyline
              key={k}
              points={leg.map(([x, y]) => P(x, y).join(",")).join(" ")}
              fill="none"
              stroke={toA ? C.red : C.mint}
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${len * p} ${len}`}
            />
          );
        })}
        {/* stops */}
        {STOPS.map((s, i) => {
          const [x, y] = P(s.x, s.y);
          const on = reached(i);
          const isA = s.id === "galleryA";
          const col = isA ? C.red : C.mint;
          return (
            <g key={s.id} opacity={ap(f, [beat(2) + i * 2, beat(2) + i * 2 + 8], [0, 1])}>
              <circle cx={x} cy={y} r={on ? 15 : 11} fill={on ? col : C.ink} stroke={col} strokeWidth={4} />
              <text
                x={x + s.lx}
                y={y + s.ly}
                textAnchor={s.anchor ?? "start"}
                fill={on ? C.paper : "rgba(244,240,232,0.55)"}
                fontFamily={SERIF}
                fontWeight={700}
                fontSize={on ? 36 : 32}
                style={{ paintOrder: "stroke", stroke: C.ink, strokeWidth: 8 }}
              >
                {s.label}
                {s.floor === "2F" ? <tspan fill={col} fontFamily={SANS} fontSize={24} dx={8}>2F</tspan> : null}
              </text>
            </g>
          );
        })}
        {/* the walker */}
        {f >= beat(2) ? (
          <g>
            <circle cx={head[0]} cy={head[1]} r={18 + ring * 30} fill="none" stroke={C.mint} strokeWidth={3} opacity={1 - ring} />
            <circle cx={head[0]} cy={head[1]} r={13} fill={C.paper} stroke={C.mint} strokeWidth={5} />
          </g>
        ) : null}
      </svg>

      {/* floor badge */}
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 470,
          width: 120,
          height: 120,
          borderRadius: 60,
          border: `4px solid ${floor === "2F" ? C.gold : C.mint}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: SANS,
          fontWeight: 900,
          fontSize: 52,
          color: floor === "2F" ? C.gold : C.mint,
          opacity: ap(f, [beat(2), beat(2) + 8], [0, 1]),
        }}
      >
        {floor}
      </div>

      {/* step strip */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 1390, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {STOPS.slice(1).map((s, i) => {
          const on = reached(i + 1);
          const now = current === i + 1;
          const isA = s.id === "galleryA";
          return (
            <div
              key={s.id}
              style={{
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: 30,
                padding: "12px 14px",
                whiteSpace: "nowrap",
                color: now ? C.ink : on ? C.paper : "rgba(244,240,232,0.45)",
                background: now ? (isA ? C.red : C.mint) : "transparent",
                border: `2px solid ${on ? (isA ? C.red : C.mint) : "rgba(244,240,232,0.2)"}`,
                opacity: ap(f, [beat(2) + i * 2, beat(2) + i * 2 + 8], [0, 1]),
              }}
            >
              <span style={{ opacity: 0.7, marginRight: 10 }}>{i + 1}</span>
              {s.label}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 市長邀請展 (6 bars: 2 intro + 4 works) ───────────── */

const ART = [
  { img: "art1.jpg", a: "廖繼春", t: "〈庭院〉", m: "油畫 · 1966" },
  { img: "art2.jpg", a: "陳夏雨", t: "〈浴女〉", m: "雕塑 · 1960" },
  { img: "art3.jpg", a: "陳火慶", t: "〈蔓草夾苧漆瓶〉", m: "漆器 · 1989" },
  { img: "art4.jpg", a: "林葆家", t: "〈紫色花〉", m: "陶藝 · 1991" },
  { img: "art5.jpg", a: "張錫卿", t: "〈靜思〉", m: "雕塑 · 1962" },
  { img: "art6.jpg", a: "葉火城", t: "〈火炎山下〉", m: "油畫 · 1984" },
  { img: "art7.jpg", a: "陳庭詩", t: "〈晝與夜 #25〉", m: "版畫 · 1973" },
];

export const RMayorShow: React.FC = () => {
  const f = useCurrentFrame();
  const w0 = 2 * BAR - 8; // works panel rises
  const panelY = ap(f, [w0, w0 + 22], [1900, 0]);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Photo src="gallery.jpg" delay={0} dir="left" position="62% center" zoom={[1.15, 1.0]} style={{ left: 0, top: 0, width: 1080, height: 1150 }} />
      <Shade from={34} to={56} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 860 }}>
        <Tag delay={beat(1)} size={36} color={C.red} text={C.paper}>
          11:30 – 11:50 · A 展覽廳
        </Tag>
        <RiseText text="臺中州廳首檔" delay={beat(1.5)} stagger={1.5} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 60, color: C.paper, marginTop: 24 }} />
        <RiseText text="市長邀請展" delay={beat(2)} stagger={2.5} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 160, color: C.paper, marginTop: 4 }} />
        <RiseText text="向臺中前輩藝術家致敬特展" delay={beat(3)} stagger={1} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 58, color: C.paper, marginTop: 10 }} />
        <div style={{ display: "flex", gap: 30, marginTop: 26, fontFamily: SANS, fontSize: 34, color: C.mint, opacity: ap(f, [beat(4), beat(4) + 8], [0, 1]) }}>
          <span>展期 115/10/15 – 12/24</span>
          <span style={{ color: C.dim }}>導覽｜文化局視覺藝術科</span>
        </div>
      </div>

      {/* works panel */}
      <div style={{ position: "absolute", inset: 0, background: C.ink, transform: `translateY(${panelY}px)` }}>
        <div style={{ position: "absolute", left: 80, right: 80, top: 260 }}>
          <Kicker delay={w0 + 10} color={C.red}>
            市長邀請展 · 導覽重點作品
          </Kicker>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 22, marginTop: 30 }}>
            {ART.map((w, i) => {
              const d = w0 + 16 + i * 3;
              return (
                <div
                  key={w.img}
                  style={{
                    opacity: ap(f, [d, d + 8], [0, 1]),
                    transform: `translateY(${ap(f, [d, d + 18], [60, 0])}px)`,
                  }}
                >
                  <div style={{ height: 240, background: "#e9e5dd", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    <Img src={staticFile(`visit/${w.img}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 42, color: C.paper, marginTop: 12 }}>{w.a}</div>
                  <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 27, color: C.paper, marginTop: 4, whiteSpace: "nowrap" }}>{w.t}</div>
                  <div style={{ fontFamily: SANS, fontSize: 24, color: C.dim, marginTop: 4 }}>{w.m}</div>
                </div>
              );
            })}
            {/* closing cell: free time */}
            {(() => {
              const d = w0 + 16 + 7 * 3 + 6;
              return (
                <div
                  style={{
                    gridColumn: "span 2",
                    height: 240,
                    border: `3px solid ${C.mint}`,
                    padding: "0 32px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    opacity: ap(f, [d, d + 8], [0, 1]),
                    transform: `translateY(${ap(f, [d, d + 18], [60, 0])}px)`,
                  }}
                >
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, color: C.mint }}>11:50 – 12:00</div>
                  <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 60, color: C.paper, marginTop: 8 }}>自由活動時間</div>
                  <div style={{ fontFamily: SANS, fontSize: 32, color: C.dim, marginTop: 8 }}>地點｜大門</div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
