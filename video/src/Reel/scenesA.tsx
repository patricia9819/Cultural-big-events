import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Count, Photo, RiseText, Rule, Tag } from "../Visit/primitives";
import { ap, C, INOUT, SANS, SERIF } from "../Visit/theme";
import { BAR, beat, BlurFill, Kicker, Shade, usePulse } from "./kit";

/* ───────────── Title (4 bars) ───────────── */

const FAN = [
  { src: "hall.jpg", x: 70, y: 300, r: -7, d: beat(1) },
  { src: "poster.jpg", x: 330, y: 250, r: 4, d: beat(2) },
  { src: "cafe.jpg", x: 560, y: 360, r: -3, d: beat(3) },
];

export const RTitle: React.FC = () => {
  const f = useCurrentFrame();
  const pulse = usePulse(0.02);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill
        style={{ background: "radial-gradient(circle at 50% 30%, rgba(143,211,195,0.18), transparent 55%)" }}
      />
      {/* photo fan, one card per beat */}
      {FAN.map((p, i) => (
        <div
          key={p.src}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: 450,
            height: 320,
            border: `10px solid ${C.paper}`,
            boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
            overflow: "hidden",
            opacity: ap(f, [p.d, p.d + 6], [0, 1]),
            transform: `translateY(${ap(f, [p.d, p.d + 18], [-500, 0])}px) rotate(${ap(f, [p.d, p.d + 24], [p.r * 4, p.r])}deg) translateY(${ap(f, [p.d + 18, 200], [0, -30], (t) => t)}px)`,
            zIndex: i,
          }}
        >
          <Img src={staticFile(`visit/${p.src}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 80, top: 760 }}>
        <Tag delay={beat(4)} size={36}>
          媒體高層參訪團
        </Tag>
        <RiseText
          text="綠美圖國巨展"
          delay={beat(5)}
          stagger={3}
          style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 150, color: C.paper, marginTop: 40 }}
        />
        <div style={{ display: "flex" }}>
          <RiseText text="＋" delay={beat(6)} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 150, color: C.mint }} />
          <RiseText
            text="台中州廳"
            delay={beat(6) + 3}
            stagger={3}
            style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 150, color: C.paper }}
          />
        </div>
        <RiseText
          text="一日參訪行程簡介"
          delay={beat(7)}
          stagger={1.5}
          style={{ fontFamily: SANS, fontSize: 48, color: C.dim, marginTop: 30, letterSpacing: "0.3em" }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 1420,
          opacity: ap(f, [beat(8), beat(8) + 8], [0, 1]),
          transform: `translateY(${ap(f, [beat(8), beat(8) + 20], [60, 0])}px) scale(${pulse})`,
          transformOrigin: "left center",
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
          }}
        >
          11.17
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 46, color: C.mint, marginTop: 14, letterSpacing: "0.1em" }}>
          星期二 · 11:00 – 16:30
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── Guests (4 bars) ───────────── */

const HOST_GROUPS = [
  {
    g: "市府",
    cols: 3,
    items: [
      { n: "市長", r: "" },
      { n: "鄭照新", r: "副市長" },
      { n: "林谷龍", r: "副秘書長" },
    ],
  },
  {
    g: "新聞局",
    cols: 3,
    items: [
      { n: "欒治誼", r: "局長" },
      { n: "張婉榆", r: "專門委員" },
    ],
  },
  {
    g: "文化局",
    cols: 3,
    items: [
      { n: "陳佳君", r: "局長" },
      { n: "賴依欣", r: "市立美術館館長" },
      { n: "曾惠君", r: "市立圖書館館長" },
    ],
  },
];

export const RGuests: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 30% 25%, rgba(143,211,195,0.16), transparent 50%)" }} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 280 }}>
        <Kicker>參訪貴賓</Kicker>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 36, marginTop: 6 }}>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 280, lineHeight: 1, color: C.mint, fontVariantNumeric: "tabular-nums" }}>
              <Count to={20} delay={0} dur={beat(4)} />
            </div>
            <RiseText text="位" delay={beat(2)} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 90, color: C.paper, marginLeft: 14 }} />
          </div>
          <div style={{ paddingBottom: 26 }}>
            <RiseText text="台北 10 家電視台" delay={beat(3)} stagger={1} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 54, color: C.paper }} />
            <RiseText text="每家 2 位媒體高層" delay={beat(4)} stagger={1} style={{ fontFamily: SANS, fontSize: 38, color: C.dim, marginTop: 8 }} />
          </div>
        </div>
        <div style={{ position: "relative", height: 70 }}>
          <Rule delay={beat(5)} dur={20} style={{ top: 34, left: 0, width: 920 }} />
        </div>
        <Kicker delay={beat(6)} color={C.paper}>
          餐敘出席長官
        </Kicker>
        {HOST_GROUPS.map((grp, gi) => {
          // All cards flow in together: one quick cascade across the three groups.
          const base = beat(6) + gi * 6;
          return (
            <div key={grp.g} style={{ marginTop: gi === 0 ? 26 : 30 }}>
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: 700,
                  fontSize: 32,
                  color: C.mint,
                  letterSpacing: "0.2em",
                  marginBottom: 12,
                  opacity: ap(f, [base, base + 8], [0, 1]),
                }}
              >
                {grp.g}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${grp.cols}, 1fr)`, gap: 14 }}>
                {grp.items.map((h, i) => {
                  const d = base + i * 2;
                  const lead = gi === 0 && i === 0;
                  return (
                    <div
                      key={h.n}
                      style={{
                        height: 136,
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        padding: "0 22px",
                        background: lead ? C.paper : "rgba(244,240,232,0.04)",
                        border: `2px solid ${lead ? C.paper : "rgba(244,240,232,0.3)"}`,
                        borderLeft: `8px solid ${C.mint}`,
                        opacity: ap(f, [d, d + 8], [0, 1]),
                        transform: `translateY(${ap(f, [d, d + 18], [40, 0])}px)`,
                      }}
                    >
                      <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 54, color: lead ? C.ink : C.paper, lineHeight: 1.1 }}>{h.n}</div>
                      {h.r ? <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 28, color: lead ? C.ink : C.dim, marginTop: 8, whiteSpace: "nowrap" }}>{h.r}</div> : null}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── Schedule (6 bars) ───────────── */

const SCHEDULE = [
  { t: "11:00", a: "州廳參訪", b: "含兩檔州廳特展" },
  { t: "12:00", a: "市役所午餐", b: "長官餐敘" },
  { t: "14:00", a: "車程至綠美圖", b: "約 30 分鐘" },
  { t: "14:30", a: "國巨展導覽", b: "策展人親自導覽" },
  { t: "16:00", a: "咖啡廳茶敘", b: "Pharos Coffee 包場" },
];

export const RSchedule: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 80, right: 80, top: 290 }}>
        <Kicker>行程總覽</Kicker>
        <RiseText
          text="11月17日（二）"
          delay={0}
          stagger={1}
          style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 96, color: C.paper, marginTop: 20 }}
        />
        <div style={{ position: "relative", marginTop: 50 }}>
          <Rule vertical delay={4} dur={20} color={C.mint} style={{ left: 15, top: 30, height: 860 }} />
          {SCHEDULE.map((s, i) => {
            const d = 4 + i * 3;
            return (
              <div
                key={s.t}
                style={{
                  position: "relative",
                  height: 200,
                  paddingLeft: 80,
                  opacity: ap(f, [d, d + 8], [0, 1]),
                  transform: `translateX(${ap(f, [d, d + 16], [80, 0])}px)`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 14,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    background: C.mint,
                    border: `5px solid ${C.mint}`,
                    transform: `scale(${ap(f, [d, d + 12], [0, 1])})`,
                  }}
                />
                <div style={{ display: "flex", alignItems: "baseline", gap: 26 }}>
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 52, color: C.mint, fontVariantNumeric: "tabular-nums" }}>
                    {s.t}
                  </div>
                  <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 68, color: C.paper }}>{s.a}</div>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 38, color: C.dim, marginTop: 8, marginLeft: 2 }}>{s.b}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 州廳 (4 bars) ───────────── */

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
        style={{ left: 0, top: 240, width: 1080, height: 760 }}
      />
      <Rule delay={beat(2)} dur={beat(2)} color={C.mint} style={{ left: 0, top: 1000, width: 1080, height: 8 }} />
      <div style={{ position: "absolute", left: 80, top: 1070 }}>
        <Tag delay={beat(2)} size={38}>
          11:00 – 12:00 · 第一站
        </Tag>
        <RiseText
          text="台中州廳"
          delay={beat(3)}
          stagger={3}
          style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 190, color: C.paper, marginTop: 26, letterSpacing: "0.04em" }}
        />
        <RiseText
          text="州廳參訪 · 含兩檔特展"
          delay={beat(5)}
          stagger={1}
          style={{ fontFamily: SANS, fontWeight: 500, fontSize: 46, color: C.paper, marginTop: 14 }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 280,
          fontFamily: SANS,
          fontWeight: 900,
          fontSize: 120,
          color: C.paper,
          textShadow: "0 6px 30px rgba(0,0,0,0.5)",
          opacity: ap(f, [beat(4), beat(4) + 8], [0, 1]),
          transform: `translateY(${ap(f, [beat(4), beat(4) + 20], [40, 0])}px)`,
        }}
      >
        01
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 州廳兩檔特展 (6 bars = 3 + 3) ───────────── */

const ShowPage: React.FC<{
  idx: string;
  photo: React.ReactNode;
  title: string;
  title2?: string;
  sub: string;
  o?: number; // frame offset added to every reveal
}> = ({ idx, photo, title, title2, sub, o = 0 }) => {
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: C.ink }}>
      {photo}
      <Shade from={38} to={66} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 1000 }}>
        <Tag delay={o + beat(1)} size={36} color={C.red} text={C.paper}>
          州廳特展 {idx}
        </Tag>
        <RiseText
          text={title}
          delay={o + beat(1.5)}
          stagger={2.5}
          style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 150, color: C.paper, marginTop: 30 }}
        />
        {title2 ? (
          <RiseText
            text={title2}
            delay={o + beat(2.5)}
            stagger={1.5}
            style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 64, color: C.paper, marginTop: 10 }}
          />
        ) : null}
        <RiseText
          text={sub}
          delay={o + beat(3.5)}
          stagger={0.8}
          style={{ fontFamily: SANS, fontWeight: 500, fontSize: 46, color: C.mint, marginTop: 22 }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const RHallShows: React.FC = () => {
  const f = useCurrentFrame();
  const swap = 3 * BAR;
  const yB = ap(f, [swap - 10, swap + 8], [1920, 0], INOUT);
  const yA = ap(f, [swap - 10, swap + 8], [0, -500], INOUT);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateY(${yA}px)` }}>
        <ShowPage
          idx="①"
          title="麗春．清韻"
          title2="向臺中前輩藝術家致敬特展"
          sub="州廳展間 · 前輩畫家經典作品"
          photo={
            <Photo
              src="gallery.jpg"
              delay={0}
              dir="left"
              position="62% center"
              zoom={[1.15, 1.0]}
              style={{ left: 0, top: 0, width: 1080, height: 1300 }}
            />
          }
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateY(${yB}px)` }}>
        <ShowPage
          idx="②"
          o={swap}
          title="前世今生"
          title2="臺中州廳的前世今生特展"
          sub="走進百年建築的時光長廊"
          photo={<Photo src="corridor.jpg" delay={swap - 10} dir="up" zoom={[1.12, 1.0]} revealDur={1} style={{ inset: 0 }} />}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────── 市役所午餐 (4 bars) ───────────── */

const MENU: { n: string; sub?: string }[] = [
  { n: "市役所式品碟", sub: "煙燻鮭魚塔佐辣根醬油醋／青醬蘆筍帆立貝／香料烤群菇野蔬" },
  { n: "原只鮑文昌雞燉翅" },
  { n: "金蒜蒸龍蝦佐讚岐麵" },
  { n: "蒜汁煎封虎斑菲力" },
  { n: "普羅旺斯爐烤小戰斧" },
  { n: "松露燻鴨胸燉飯" },
  { n: "椰汁西米露" },
  { n: "米其林三星炸豆腐奶" },
];

export const RLunch: React.FC = () => {
  const f = useCurrentFrame();
  // The room for ~2s, then the chef's menu card rises with all courses flowing in together.
  const m0 = BAR + beat(2);
  const cardY = ap(f, [m0, m0 + 22], [1800, 0]);
  const dim = ap(f, [m0, m0 + 20], [0, 0.6]);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Photo src="restaurant.jpg" delay={0} dir="right" zoom={[1.18, 1.0]} style={{ left: 0, top: 0, width: 1080, height: 1250 }} />
      <Shade from={40} to={64} />
      <div
        style={{
          position: "absolute",
          right: 70,
          top: 300,
          width: 400,
          height: 400,
          borderRadius: 200,
          overflow: "hidden",
          border: `8px solid ${C.paper}`,
          boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
          transform: `scale(${ap(f, [beat(3), beat(3) + 16], [0, 1])}) rotate(${ap(f, [beat(3), beat(5)], [-25, 0])}deg)`,
        }}
      >
        <Img src={staticFile("visit/food.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1000 }}>
        <Tag delay={beat(1)} size={38}>
          12:00 – 14:00 · 第二站
        </Tag>
        <RiseText
          text="市役所午餐"
          delay={beat(2)}
          stagger={2.5}
          style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 160, color: C.paper, marginTop: 26 }}
        />
        <RiseText
          text="長官與貴賓餐敘"
          delay={beat(3)}
          stagger={1}
          style={{ fontFamily: SANS, fontWeight: 500, fontSize: 48, color: C.paper, marginTop: 10 }}
        />
      </div>

      {/* menu card */}
      <AbsoluteFill style={{ background: C.ink, opacity: dim }} />
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 270,
          height: 1260,
          background: C.paper,
          boxShadow: "0 40px 90px rgba(0,0,0,0.55)",
          transform: `translateY(${cardY}px)`,
          textAlign: "center",
          padding: "56px 50px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ position: "absolute", inset: 18, border: `2px solid rgba(14,15,17,0.18)`, pointerEvents: "none" }} />
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 30, letterSpacing: "0.4em", color: "rgba(14,15,17,0.55)" }}>台中市役所</div>
        <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 70, color: C.ink, marginTop: 14 }}>主廚特開菜單</div>
        <div style={{ width: 120, height: 3, background: C.red, margin: "28px auto 22px" }} />
        {MENU.map((m, i) => {
          const d = m0 + 14 + i * 3;
          return (
            <div
              key={m.n}
              style={{
                marginTop: m.sub ? 14 : 46,
                opacity: ap(f, [d, d + 8], [0, 1]),
                transform: `translateY(${ap(f, [d, d + 16], [24, 0])}px)`,
              }}
            >
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 56, color: C.ink, lineHeight: 1.2 }}>{m.n}</div>
              {m.sub ? (
                <div style={{ fontFamily: SANS, fontSize: 30, color: "rgba(14,15,17,0.6)", marginTop: 10, lineHeight: 1.4 }}>{m.sub}</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
