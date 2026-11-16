import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Count, Photo, RiseText, Rule, Tag } from "../Visit/primitives";
import { ap, C, SANS, SERIF } from "../Visit/theme";
import { BAR, beat, Kicker, Shade, usePulse } from "./kit";

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
          北部媒體高層參訪團
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
          星期二 · 11:00 – 17:00
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 出席媒體高層 (4 bars) ───────────── */

const MEDIA = [
  { o: "TVBS", n: "蔡秀瓊", r: "副總經理", sub: "代總經理 劉文硯" },
  { o: "TVBS", n: "林瑋鈞", r: "新聞部執行副總監", sub: "代副總經理 王結玲" },
  { o: "中視", n: "盧秀芳", r: "董事長兼總經理" },
  { o: "臺視", n: "左燕妮", r: "新聞部經理" },
  { o: "自由時報", n: "魏錫賓", r: "副總編輯", sub: "代總編輯 鄒景雯" },
  { o: "匯流新聞網", n: "李衣綸", r: "總編輯" },
  { o: "匯流新聞網", n: "李承值", r: "副總編輯" },
  { o: "壹蘋新聞網", n: "謝仁禮", r: "總編輯" },
  { o: "風傳媒", n: "吳典蓉", r: "總編輯" },
];

export const RMedia: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 25% 20%, rgba(143,211,195,0.16), transparent 50%)" }} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 260 }}>
        <Kicker>參訪貴賓</Kicker>
        <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginTop: 10 }}>
          <RiseText text="出席媒體高層" delay={2} stagger={2} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 88, color: C.paper }} />
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 88, color: C.mint, fontVariantNumeric: "tabular-nums" }}>
            <Count to={9} delay={4} dur={beat(2)} />
          </div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 48, color: C.paper }}>位</div>
        </div>
        <div style={{ marginTop: 26 }}>
          {MEDIA.map((m, i) => {
            const d = beat(2) + i * 2;
            return (
              <div
                key={m.n}
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: 116,
                  borderTop: `1px solid ${C.line}`,
                  opacity: ap(f, [d, d + 8], [0, 1]),
                  transform: `translateX(${ap(f, [d, d + 18], [80, 0])}px)`,
                }}
              >
                <div style={{ width: 250, flex: "none", fontFamily: SANS, fontWeight: 700, fontSize: 34, color: C.mint }}>{m.o}</div>
                <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 52, color: C.paper, width: 190, flex: "none" }}>{m.n}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 30, color: C.paper, whiteSpace: "nowrap" }}>{m.r}</div>
                  {m.sub ? <div style={{ fontFamily: SANS, fontSize: 25, color: C.gold, whiteSpace: "nowrap" }}>（{m.sub}）</div> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 午宴上桌市府長官 (3.5 bars) ───────────── */

const HOST_GROUPS = [
  {
    g: "府層長官",
    items: [
      { n: "盧秀燕", r: "市長" },
      { n: "鄭照新", r: "副市長" },
      { n: "林谷隆", r: "副秘書長" },
    ],
  },
  {
    g: "文化局",
    items: [
      { n: "陳佳君", r: "局長" },
      { n: "賴依欣", r: "市立美術館館長" },
      { n: "曾惠君", r: "市立圖書館館長" },
    ],
  },
  {
    g: "新聞局",
    items: [
      { n: "欒治誼", r: "局長" },
      { n: "張智瑋", r: "專門委員" },
      { n: "張婉榆", r: "專門委員" },
    ],
  },
];

export const ROfficials: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 70% 25%, rgba(212,176,106,0.14), transparent 50%)" }} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 280 }}>
        <Kicker color={C.gold}>12:00 午宴</Kicker>
        <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginTop: 10 }}>
          <RiseText text="上桌市府長官" delay={2} stagger={2} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 88, color: C.paper }} />
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 88, color: C.gold, fontVariantNumeric: "tabular-nums" }}>
            <Count to={9} delay={4} dur={beat(2)} />
          </div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 48, color: C.paper }}>位</div>
        </div>
        {HOST_GROUPS.map((grp, gi) => {
          // All cards flow in together: one quick cascade across the three groups.
          const base = beat(2) + gi * 5;
          return (
            <div key={grp.g} style={{ marginTop: gi === 0 ? 50 : 40 }}>
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: 700,
                  fontSize: 34,
                  color: C.mint,
                  letterSpacing: "0.2em",
                  marginBottom: 14,
                  opacity: ap(f, [base, base + 8], [0, 1]),
                }}
              >
                {grp.g}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                {grp.items.map((h, i) => {
                  const d = base + i * 2;
                  const lead = gi === 0 && i === 0;
                  return (
                    <div
                      key={h.n}
                      style={{
                        height: 150,
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
                      <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 56, color: lead ? C.ink : C.paper, lineHeight: 1.1 }}>{h.n}</div>
                      <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 28, color: lead ? C.ink : C.dim, marginTop: 8, whiteSpace: "nowrap" }}>{h.r}</div>
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

/* ───────────── Schedule overview (3 bars) ───────────── */

const SCHEDULE = [
  { t: "11:00", a: "臺中州廳", b: "建築導覽＋市長邀請展" },
  { t: "12:00", a: "臺中市役所", b: "午宴交流" },
  { t: "14:30", a: "臺中綠美圖", b: "綠美圖暨國巨典藏展" },
  { t: "16:00", a: "Pharos Coffee", b: "午茶交流" },
  { t: "16:30", a: "專車送返", b: "高鐵臺中站" },
];

const DRESS = [
  { who: "局本部長官", what: "正裝（不用穿背心）" },
  { who: "工作人員", what: "白上衣＋牛仔褲＋背心" },
];

export const RSchedule: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 80, right: 80, top: 270 }}>
        <Kicker>行程總覽</Kicker>
        <RiseText
          text="11月17日（二）"
          delay={0}
          stagger={1}
          style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 92, color: C.paper, marginTop: 16 }}
        />
        <div style={{ position: "relative", marginTop: 36 }}>
          <Rule vertical delay={4} dur={20} color={C.mint} style={{ left: 15, top: 28, height: 640 }} />
          {SCHEDULE.map((s, i) => {
            const d = 4 + i * 3;
            return (
              <div
                key={s.t}
                style={{
                  position: "relative",
                  height: 160,
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
                    transform: `scale(${ap(f, [d, d + 12], [0, 1])})`,
                  }}
                />
                <div style={{ display: "flex", alignItems: "baseline", gap: 26 }}>
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 48, color: C.mint, fontVariantNumeric: "tabular-nums" }}>{s.t}</div>
                  <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 62, color: C.paper }}>{s.a}</div>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 36, color: C.dim, marginTop: 6, marginLeft: 2 }}>{s.b}</div>
              </div>
            );
          })}
        </div>
        {/* dress code */}
        <div
          style={{
            marginTop: 20,
            border: `2px solid ${C.gold}`,
            padding: "22px 28px",
            opacity: ap(f, [beat(3), beat(3) + 8], [0, 1]),
            transform: `translateY(${ap(f, [beat(3), beat(3) + 18], [40, 0])}px)`,
          }}
        >
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, color: C.gold, letterSpacing: "0.2em" }}>服裝</div>
          {DRESS.map((d) => (
            <div key={d.who} style={{ display: "flex", gap: 24, marginTop: 12, fontFamily: SANS, fontSize: 38, color: C.paper }}>
              <span style={{ fontWeight: 700, width: 210, flex: "none" }}>{d.who}</span>
              <span>{d.what}</span>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 市役所午宴 (4 bars) ───────────── */

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
          text="市役所午宴"
          delay={beat(2)}
          stagger={2.5}
          style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 160, color: C.paper, marginTop: 26 }}
        />
        <RiseText
          text="午宴交流 · 席間簡介臺中市役所"
          delay={beat(3)}
          stagger={0.8}
          style={{ fontFamily: SANS, fontWeight: 500, fontSize: 46, color: C.paper, marginTop: 10 }}
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
