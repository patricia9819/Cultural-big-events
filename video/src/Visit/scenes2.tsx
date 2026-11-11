import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Count, Photo, RiseText, Rule, Tag } from "./primitives";
import { ap, C, INOUT, SANS, SERIF } from "./theme";

const shade = (deg: number, a = 0.9) =>
  `linear-gradient(${deg}deg, rgba(14,15,17,${a}) 0%, rgba(14,15,17,${a * 0.75}) 35%, rgba(14,15,17,0) 70%)`;

/* ───────────── S3 · 州廳 → 午餐 ───────────── */

const Facade: React.FC<{ delay: number }> = ({ delay }) => {
  const f = useCurrentFrame();
  // A simple neo-classical facade: pediment, columns, arched windows.
  const parts = [
    "M40 330 L560 330",
    "M60 330 L60 110 L540 110 L540 330",
    "M40 110 L300 20 L560 110",
    ...[110, 190, 270, 330, 410, 490].map((x) => `M${x} 130 L${x} 330`),
    "M210 330 L210 230 Q300 160 390 230 L390 330",
  ];
  return (
    <svg width={600} height={360} viewBox="0 0 600 360">
      {parts.map((d, i) => (
        <path
          key={i}
          d={d}
          pathLength={1}
          fill="none"
          stroke={i === parts.length - 1 ? C.mint : "rgba(244,240,232,0.7)"}
          strokeWidth={3}
          strokeDasharray="1 1"
          strokeDashoffset={ap(f, [delay + i * 1.5, delay + i * 1.5 + 22], [1, 0])}
        />
      ))}
    </svg>
  );
};

export const S3Lunch: React.FC = () => {
  const f = useCurrentFrame();
  const split = ap(f, [34, 58], [1920, 840], INOUT);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      {/* Right: lunch */}
      <Photo src="restaurant.jpg" delay={36} dir="right" style={{ left: 840, top: 0, width: 1080, height: 1080 }} />
      <AbsoluteFill style={{ left: 840, background: shade(0, 0.92) }} />
      <Photo
        src="food.jpg"
        delay={52}
        dir="up"
        style={{ left: 1420, top: 90, width: 420, height: 280, border: `6px solid ${C.paper}` }}
      />
      <div style={{ position: "absolute", left: 920, bottom: 150 }}>
        <Tag delay={46} size={30}>
          12:00 – 14:00
        </Tag>
        <RiseText
          text="市役所午餐"
          delay={50}
          stagger={2}
          style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 110, color: C.paper, marginTop: 20 }}
        />
        <div
          style={{
            display: "flex",
            gap: 18,
            marginTop: 18,
            fontFamily: SANS,
            fontSize: 38,
            color: C.paper,
            opacity: ap(f, [62, 74], [0, 1]),
          }}
        >
          <span style={{ border: `2px solid ${C.mint}`, padding: "6px 20px" }}>中式桌菜</span>
          <span style={{ border: `2px solid ${C.mint}`, padding: "6px 20px" }}>西式排餐</span>
          <span style={{ color: C.dim, alignSelf: "center", fontSize: 30 }}>（請市長擇定）</span>
        </div>
      </div>

      {/* Left: 州廳 panel, collapses from full-screen to the left column */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: 1080,
          width: split,
          background: C.ink2,
          overflow: "hidden",
          boxShadow: "20px 0 60px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 120,
            top: 150,
            transform: `scale(${ap(f, [34, 58], [1, 0.82], INOUT)})`,
            transformOrigin: "left top",
          }}
        >
          <Facade delay={2} />
          <div style={{ marginTop: 50 }}>
            <Tag delay={8} size={30}>
              11:00 – 12:00
            </Tag>
          </div>
          <RiseText
            text="州廳參訪"
            delay={12}
            stagger={3}
            style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 130, color: C.paper, marginTop: 22 }}
          />
          <RiseText
            text="行程第一站 · 台中州廳"
            delay={20}
            stagger={1}
            style={{ fontFamily: SANS, fontSize: 40, color: C.dim, marginTop: 12, letterSpacing: "0.1em" }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── S4 · Exhibition ───────────── */

const STATS = [
  { n: 66, u: "件", l: "世界級經典名作" },
  { n: 55, u: "件", l: "首度在台公開" },
  { n: 34, u: "位", l: "國際藝術家" },
  { n: 13, u: "國", l: "橫跨國家" },
  { n: 5, u: "世紀", l: "文藝復興至今" },
];

export const S4Show: React.FC = () => {
  const f = useCurrentFrame();
  const car = ap(f, [0, 26], [0, 1], INOUT);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Photo
        src="poster.jpg"
        delay={4}
        dir="left"
        zoom={[1.14, 1.0]}
        revealDur={30}
        style={{ left: 760, top: 110, width: 1060, height: 650 }}
      />
      <Rule delay={20} dur={20} color={C.red} style={{ left: 760, top: 772, width: 1060, height: 6 }} />

      {/* drive: dashed route ticks across the top */}
      <div style={{ position: "absolute", left: 120, top: 120, width: 560 }}>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 26,
            color: C.dim,
            letterSpacing: "0.12em",
            opacity: ap(f, [0, 10], [0, 1]),
          }}
        >
          14:00 市役所 → 綠美圖 · 車程約 30 分
        </div>
        <svg width={560} height={30} style={{ marginTop: 10 }}>
          <line x1={8} y1={15} x2={552} y2={15} stroke={C.line} strokeWidth={3} strokeDasharray="10 10" />
          <line x1={8} y1={15} x2={8 + 544 * car} y2={15} stroke={C.mint} strokeWidth={3} strokeDasharray="10 10" />
          <circle cx={8} cy={15} r={7} fill={C.paper} />
          <circle cx={8 + 544 * car} cy={15} r={10} fill={C.mint} />
        </svg>
      </div>

      <div style={{ position: "absolute", left: 120, top: 270 }}>
        <Tag delay={18} size={30} color={C.red} text={C.paper}>
          14:30 – 16:00 導覽
        </Tag>
        <RiseText
          text="蠍子與青蛙"
          delay={22}
          stagger={2.5}
          style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 116, color: C.paper, marginTop: 24 }}
        />
        <RiseText
          text="國巨基金會典藏展"
          delay={30}
          stagger={1.5}
          style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 52, color: C.paper, marginTop: 6 }}
        />
        <div
          style={{
            marginTop: 26,
            fontFamily: SANS,
            fontSize: 30,
            color: C.mint,
            letterSpacing: "0.08em",
            opacity: ap(f, [38, 50], [0, 1]),
          }}
        >
          11/20 正式開展 · 貴賓搶先觀展
        </div>
      </div>

      <div style={{ position: "absolute", left: 120, right: 100, top: 850, display: "flex" }}>
        {STATS.map((s, i) => {
          const d = 38 + i * 6;
          return (
            <div
              key={s.l}
              style={{
                flex: 1,
                borderLeft: `2px solid ${C.line}`,
                paddingLeft: 28,
                opacity: ap(f, [d, d + 10], [0, 1]),
                transform: `translateY(${ap(f, [d, d + 22], [40, 0])}px)`,
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span
                  style={{
                    fontFamily: SANS,
                    fontWeight: 900,
                    fontSize: 96,
                    color: i === 1 ? C.red : C.paper,
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  <Count to={s.n} delay={d} dur={26} />
                </span>
                <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 38, color: C.paper }}>{s.u}</span>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 28, color: C.dim, marginTop: 8 }}>{s.l}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── S5 · Masterworks ───────────── */

const WORKS = [
  { img: "warhol.jpg", zh: "安迪・沃荷", t: "〈自畫像〉1986", badge: "台灣首展" },
  { img: "picasso.jpg", zh: "畢卡索", t: "〈女子胸像〉1938", badge: "台灣首展" },
  { img: "koons.jpg", zh: "傑夫・昆斯", t: "〈氣球狗（紅）〉", badge: "台灣首展" },
  { img: "hockney.jpg", zh: "大衛・霍克尼", t: "〈伊舍伍德與巴查迪〉", badge: "" },
  { img: "sanyu.jpg", zh: "常玉", t: "〈裸女背像〉1929", badge: "睽違 30 年在台亮相" },
  { img: "mondrian.jpg", zh: "蒙德里安", t: "〈構成 No. II〉1930", badge: "" },
];

export const S5Works: React.FC = () => {
  const f = useCurrentFrame();
  const drift = ap(f, [0, 135], [40, -40], (t) => t);
  const spot = ap(f, [60, 128], [0, 5.99], (t) => t);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 105, top: 90, display: "flex", alignItems: "center", gap: 36 }}>
        <RiseText
          text="重點導覽作品"
          delay={0}
          stagger={2}
          style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 84, color: C.paper }}
        />
        <Tag delay={10} size={28}>
          畢卡索・沃荷・常玉 等 34 位大師
        </Tag>
      </div>
      <div
        style={{
          position: "absolute",
          left: 105,
          top: 290,
          display: "flex",
          gap: 30,
          transform: `translateX(${drift}px)`,
          perspective: 1400,
        }}
      >
        {WORKS.map((w, i) => {
          const d = 8 + i * 5;
          const lit = Math.floor(spot) === i && f >= 60;
          const y = ap(f, [d, d + 26], [380, 0]);
          const rx = ap(f, [d, d + 30], [-40, 0]);
          return (
            <div
              key={w.img}
              style={{
                width: 260,
                transform: `translateY(${y}px) rotateX(${rx}deg) translateY(${lit ? -14 : 0}px)`,
                opacity: ap(f, [d, d + 8], [0, 1]),
              }}
            >
              <div
                style={{
                  width: 260,
                  height: 340,
                  background: "#1c1e22",
                  padding: 18,
                  boxSizing: "border-box",
                  outline: lit ? `4px solid ${C.mint}` : `1px solid ${C.line}`,
                }}
              >
                <Img
                  src={staticFile(`visit/${w.img}`)}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>
              <div style={{ height: 44, marginTop: 14 }}>
                {w.badge ? (
                  <Tag delay={d + 24} size={20} color={w.badge === "台灣首展" ? C.red : C.gold} text={C.paper}>
                    {w.badge}
                  </Tag>
                ) : null}
              </div>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: C.paper, marginTop: 6 }}>
                {w.zh}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 24, color: C.dim, marginTop: 6 }}>{w.t}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── S6 · Curator ───────────── */

export const S6Curator: React.FC = () => {
  const f = useCurrentFrame();
  const facts = [
    "2019 年起任伊斯頓基金會策展人",
    "管理路易絲・布爾喬亞藝術遺產",
    "曾策劃草間彌生、安迪・沃荷個展",
  ];
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: -40,
          top: 560,
          fontFamily: SERIF,
          fontWeight: 900,
          fontSize: 420,
          color: "transparent",
          WebkitTextStroke: "2px rgba(244,240,232,0.1)",
          whiteSpace: "nowrap",
          transform: `translateX(${ap(f, [0, 90], [0, -120], (t) => t)}px)`,
        }}
      >
        策展人導覽
      </div>
      <Photo
        src="curator.jpg"
        delay={0}
        dir="up"
        position="center 30%"
        style={{ left: 1150, top: 90, width: 660, height: 900 }}
      />
      <div style={{ position: "absolute", left: 120, top: 160 }}>
        <Tag delay={4} size={30}>
          策展人親自導覽
        </Tag>
        <RiseText
          text="菲利普．拉瑞特史密斯"
          delay={8}
          stagger={1.5}
          style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 88, color: C.paper, marginTop: 28 }}
        />
        <RiseText
          text="Philip Larratt-Smith"
          delay={16}
          stagger={0.6}
          style={{ fontFamily: SANS, fontWeight: 300, fontSize: 44, color: C.dim, marginTop: 8, letterSpacing: "0.04em" }}
        />
        <div style={{ marginTop: 50 }}>
          {facts.map((t, i) => {
            const d = 24 + i * 6;
            return (
              <div
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  fontFamily: SANS,
                  fontSize: 38,
                  color: C.paper,
                  marginTop: 18,
                  opacity: ap(f, [d, d + 10], [0, 1]),
                  transform: `translateX(${ap(f, [d, d + 20], [-40, 0])}px)`,
                }}
              >
                <div style={{ width: 28, height: 3, background: C.mint }} />
                {t}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 44 }}>
          <Tag delay={46} size={36} color={C.gold} text={C.ink}>
            全程同步中文口譯
          </Tag>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── S7 · Tea ───────────── */

export const S7Tea: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Photo src="cafe.jpg" delay={0} dir="left" zoom={[1.2, 1.04]} revealDur={22} style={{ inset: 0 }} />
      <AbsoluteFill style={{ background: shade(90, 0.92) }} />
      <div style={{ position: "absolute", left: 120, top: 300 }}>
        <Tag delay={8} size={30}>
          16:00 – 16:30
        </Tag>
        <RiseText
          text="咖啡廳茶敘"
          delay={12}
          stagger={2.5}
          style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 130, color: C.paper, marginTop: 24 }}
        />
        <RiseText
          text="綠美圖一樓 · Pharos Coffee"
          delay={20}
          stagger={0.8}
          style={{ fontFamily: SANS, fontWeight: 500, fontSize: 46, color: C.paper, marginTop: 14 }}
        />
        <div
          style={{
            fontFamily: SANS,
            fontSize: 34,
            color: C.mint,
            marginTop: 20,
            letterSpacing: "0.3em",
            opacity: ap(f, [32, 44], [0, 1]),
          }}
        >
          全場包場
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 130,
          bottom: 110,
          width: 300,
          height: 300,
          borderRadius: 150,
          overflow: "hidden",
          border: `6px solid ${C.paper}`,
          transform: `scale(${ap(f, [26, 46], [0, 1])}) rotate(${ap(f, [26, 60], [-30, 0])}deg)`,
        }}
      >
        <Img src={staticFile("visit/coffee.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── S8 · Gifts ───────────── */

export const S8Gifts: React.FC = () => {
  const f = useCurrentFrame();
  const card = (d: number, rot: number) => ({
    opacity: ap(f, [d, d + 8], [0, 1]),
    transform: `translateY(${ap(f, [d, d + 24], [160, 0])}px) rotate(${ap(f, [d, d + 30], [rot * 3, rot])}deg)`,
  });
  return (
    <AbsoluteFill style={{ background: C.paper, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 120, top: 90, display: "flex", alignItems: "center", gap: 30 }}>
        <RiseText
          text="伴手禮提案"
          delay={0}
          stagger={2}
          style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 88, color: C.ink }}
        />
        <Tag delay={8} size={28} color={C.ink} text={C.paper}>
          二擇一
        </Tag>
      </div>
      {/* Option A */}
      <div style={{ position: "absolute", left: 120, top: 270, width: 800, ...card(6, -2) }}>
        <div style={{ background: "#fff", padding: 20, boxShadow: "0 30px 60px rgba(0,0,0,0.18)" }}>
          <Img src={staticFile("visit/postcards.jpg")} style={{ width: "100%", display: "block" }} />
        </div>
        <div style={{ marginTop: 34, fontFamily: SERIF, fontWeight: 700, fontSize: 52, color: C.ink }}>
          <span style={{ color: C.red, marginRight: 18 }}>A</span>官方典藏明信片＋手札
        </div>
      </div>
      {/* Option B */}
      <div style={{ position: "absolute", left: 1060, top: 250, width: 740 }}>
        <div style={{ position: "relative", height: 600 }}>
          <div style={{ position: "absolute", left: 220, top: 230, width: 520, ...card(18, 4) }}>
            <Img
              src={staticFile("visit/wine2.jpg")}
              style={{ width: "100%", display: "block", border: "14px solid #fff", boxShadow: "0 30px 60px rgba(0,0,0,0.2)" }}
            />
          </div>
          <div style={{ position: "absolute", left: 0, top: 0, width: 560, ...card(12, -3) }}>
            <Img
              src={staticFile("visit/wine1.jpg")}
              style={{ width: "100%", display: "block", border: "14px solid #fff", boxShadow: "0 30px 60px rgba(0,0,0,0.2)" }}
            />
          </div>
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 52,
            color: C.ink,
            opacity: ap(f, [24, 34], [0, 1]),
          }}
        >
          <span style={{ color: C.red, marginRight: 18 }}>B</span>金馬聯名酒禮
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── S9 · Outro ───────────── */

export const S9Outro: React.FC = () => {
  const f = useCurrentFrame();
  const stops = ["台中州廳", "市役所", "綠美圖"];
  const line = ap(f, [6, 30], [0, 1], INOUT);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden", opacity: ap(f, [40, 50], [1, 0]) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center" }}>
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: 44,
            color: C.mint,
            letterSpacing: "0.2em",
            opacity: ap(f, [0, 10], [0, 1]),
          }}
        >
          11月17日（二）11:00 – 16:30
        </div>
      </div>
      <div style={{ position: "absolute", left: 360, width: 1200, top: 420 }}>
        <div style={{ position: "absolute", left: 0, top: 18, width: 1200, height: 4, background: C.line }} />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 18,
            width: 1200 * line,
            height: 4,
            background: C.mint,
          }}
        />
        {stops.map((s, i) => {
          const x = i * 600;
          const d = 6 + i * 11;
          return (
            <div key={s} style={{ position: "absolute", left: x, top: 0, transform: "translateX(-50%)", textAlign: "center" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  margin: "0 auto",
                  background: C.mint,
                  transform: `scale(${ap(f, [d, d + 12], [0, 1])})`,
                }}
              />
              <div
                style={{
                  fontFamily: SERIF,
                  fontWeight: 700,
                  fontSize: 54,
                  color: C.paper,
                  marginTop: 26,
                  whiteSpace: "nowrap",
                  opacity: ap(f, [d + 4, d + 14], [0, 1]),
                }}
              >
                {s}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 690, display: "flex", justifyContent: "center" }}>
        <RiseText
          text="敬邀蒞臨"
          delay={22}
          stagger={3}
          style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 130, color: C.paper, letterSpacing: "0.3em" }}
        />
      </div>
    </AbsoluteFill>
  );
};
