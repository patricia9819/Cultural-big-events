import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Count, RiseText, Rule, Tag } from "./primitives";
import { ap, C, IN, SANS, SERIF } from "./theme";

/* ───────────── S1 · Title ───────────── */

const Lines: React.FC = () => {
  const f = useCurrentFrame();
  // Architectural outlines, a nod to the line art on the cover slide.
  const paths = [
    "M1180 980 L1180 330 L1420 190 L1420 840",
    "M1420 190 L1700 350 L1700 1000",
    "M1260 900 L1260 420 L1560 250",
    "M1560 250 L1560 760 L1820 910",
    "M1060 700 L1300 560 L1640 760 L1400 900 Z",
    "M1500 130 L1500 520",
  ];
  return (
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      {paths.map((d, i) => {
        const p = ap(f, [4 + i * 5, 44 + i * 5], [1, 0]);
        return (
          <path
            key={i}
            d={d}
            pathLength={1}
            fill="none"
            stroke={i === 4 ? C.mint : "rgba(244,240,232,0.22)"}
            strokeWidth={i === 4 ? 4 : 2.5}
            strokeDasharray="1 1"
            strokeDashoffset={p}
          />
        );
      })}
    </svg>
  );
};

export const S1Title: React.FC = () => {
  const f = useCurrentFrame();
  const cam = ap(f, [0, 90], [1.08, 1], (t) => t);
  const out = 70;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${cam})` }}>
        <Lines />
        <div style={{ position: "absolute", left: 140, top: 250 }}>
          <Tag delay={2} size={30}>
            媒體高層參訪團
          </Tag>
          <RiseText
            text="綠美圖國巨展"
            delay={8}
            stagger={3}
            exitAt={out}
            style={{
              fontFamily: SERIF,
              fontWeight: 900,
              fontSize: 156,
              color: C.paper,
              marginTop: 40,
              letterSpacing: "0.04em",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", marginTop: 6 }}>
            <RiseText
              text="＋"
              delay={22}
              exitAt={out + 2}
              style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 156, color: C.mint }}
            />
            <RiseText
              text="台中州廳"
              delay={25}
              stagger={3}
              exitAt={out + 3}
              style={{
                fontFamily: SERIF,
                fontWeight: 900,
                fontSize: 156,
                color: C.paper,
                letterSpacing: "0.04em",
              }}
            />
          </div>
          <RiseText
            text="一日參訪行程簡介"
            delay={36}
            stagger={1.5}
            exitAt={out + 4}
            style={{
              fontFamily: SANS,
              fontWeight: 400,
              fontSize: 46,
              color: C.dim,
              marginTop: 34,
              letterSpacing: "0.3em",
            }}
          />
        </div>
        {/* Date lock-up */}
        <div
          style={{
            position: "absolute",
            right: 150,
            bottom: 130,
            textAlign: "right",
            opacity: ap(f, [30, 44], [0, 1]) * ap(f, [out, out + 10], [1, 0], IN),
            transform: `translateX(${ap(f, [30, 60], [80, 0])}px)`,
          }}
        >
          <div
            style={{
              fontFamily: SANS,
              fontWeight: 900,
              fontSize: 210,
              lineHeight: 1,
              color: "transparent",
              WebkitTextStroke: `3px ${C.paper}`,
              letterSpacing: "-0.02em",
            }}
          >
            11.17
          </div>
          <div
            style={{
              fontFamily: SANS,
              fontWeight: 500,
              fontSize: 40,
              color: C.mint,
              marginTop: 14,
              letterSpacing: "0.12em",
            }}
          >
            星期二 · 11:00 – 16:30
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────── S2 · Overview ───────────── */

const SCHEDULE = [
  { t: "11:00–12:00", a: "州廳參訪", b: "台中州廳" },
  { t: "12:00–14:00", a: "市役所午餐", b: "長官餐敘" },
  { t: "14:00–14:30", a: "車程至綠美圖", b: "約 30 分鐘" },
  { t: "14:30–16:00", a: "綠美圖＋國巨展導覽", b: "策展人親自導覽" },
  { t: "16:00–16:30", a: "綠美圖咖啡廳茶敘", b: "Pharos Coffee 包場" },
];

const HOSTS = ["市長", "照新副市長", "谷隆副秘", "欒局長", "佳君局長", "綠美圖 2 位館長"];

export const S2Overview: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      {/* soft mint glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 22% 42%, rgba(143,211,195,0.16), transparent 45%)`,
        }}
      />
      {/* Left: guests */}
      <div style={{ position: "absolute", left: 130, top: 120, width: 720 }}>
        <Tag delay={0} size={28}>
          參訪貴賓
        </Tag>
        <div style={{ display: "flex", alignItems: "baseline", marginTop: 10 }}>
          <div
            style={{
              fontFamily: SANS,
              fontWeight: 900,
              fontSize: 280,
              color: C.mint,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              transform: `translateY(${ap(f, [0, 24], [60, 0])}px)`,
              opacity: ap(f, [0, 10], [0, 1]),
            }}
          >
            <Count to={20} delay={2} dur={28} />
          </div>
          <RiseText
            text="位"
            delay={10}
            style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 80, color: C.paper, marginLeft: 16 }}
          />
        </div>
        <RiseText
          text="台北 10 家電視台 × 各 2 位高層"
          delay={14}
          stagger={0.8}
          style={{ fontFamily: SANS, fontWeight: 500, fontSize: 40, color: C.paper }}
        />
        <Rule delay={24} dur={30} style={{ top: 520, left: 0, width: 640 }} />
        <div
          style={{
            marginTop: 90,
            fontFamily: SANS,
            fontSize: 30,
            letterSpacing: "0.3em",
            color: C.dim,
            opacity: ap(f, [28, 40], [0, 1]),
          }}
        >
          餐敘出席長官
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 22 }}>
          {HOSTS.map((h, i) => {
            const d = 34 + i * 4;
            const s = ap(f, [d, d + 16], [0.6, 1]);
            return (
              <div
                key={h}
                style={{
                  fontFamily: SANS,
                  fontWeight: 500,
                  fontSize: 34,
                  color: i === 0 ? C.ink : C.paper,
                  background: i === 0 ? C.paper : "transparent",
                  border: `2px solid ${i === 0 ? C.paper : "rgba(244,240,232,0.4)"}`,
                  padding: "10px 24px",
                  opacity: ap(f, [d, d + 8], [0, 1]),
                  transform: `scale(${s})`,
                }}
              >
                {h}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: schedule */}
      <div style={{ position: "absolute", left: 980, top: 120, width: 820 }}>
        <RiseText
          text="11月17日（二）行程"
          delay={6}
          stagger={1.2}
          style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 54, color: C.paper }}
        />
        <div style={{ position: "relative", marginTop: 40 }}>
          <Rule vertical delay={12} dur={50} color={C.mint} style={{ left: 11, top: 18, height: 640 }} />
          {SCHEDULE.map((s, i) => {
            const d = 16 + i * 9;
            return (
              <div
                key={s.t}
                style={{
                  position: "relative",
                  height: 160,
                  paddingLeft: 64,
                  opacity: ap(f, [d, d + 10], [0, 1]),
                  transform: `translateX(${ap(f, [d, d + 24], [60, 0])}px)`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 12,
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    background: C.ink,
                    border: `4px solid ${C.mint}`,
                    transform: `scale(${ap(f, [d + 2, d + 14], [0, 1])})`,
                  }}
                />
                <div
                  style={{
                    fontFamily: SANS,
                    fontWeight: 700,
                    fontSize: 34,
                    color: C.mint,
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "0.04em",
                  }}
                >
                  {s.t}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginTop: 4 }}>
                  <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 56, color: C.paper }}>
                    {s.a}
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 28, color: C.dim }}>{s.b}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
