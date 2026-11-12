import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Count, Photo, RiseText, Rule, Tag } from "../Visit/primitives";
import { ap, C, IN, INOUT, OUT, SANS, SERIF } from "../Visit/theme";
import { BAR, beat, BlurFill, Kicker, Shade, usePulse } from "./kit";

/* ───────────── 車程 + 國巨展 (6 bars) ───────────── */

const STATS = [
  { n: 66, u: "件", l: "世界級經典名作" },
  { n: 55, u: "件", l: "首度在台公開", hot: true },
  { n: 34, u: "位", l: "國際藝術家" },
  { n: 13, u: "國", l: "橫跨國家" },
  { n: 5, u: "世紀", l: "文藝復興至今" },
];

export const RShow: React.FC = () => {
  const f = useCurrentFrame();
  // Bar 1: the drive. Bars 2–6: the exhibition.
  const car = ap(f, [4, BAR + 10], [0, 1], INOUT);
  const driveOut = ap(f, [BAR + 14, BAR + 26], [0, -260], IN);
  const pulse = usePulse(0.03);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      {/* the drive */}
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 290,
          transform: `translateY(${driveOut}px)`,
          opacity: ap(f, [BAR + 14, BAR + 26], [1, 0]),
        }}
      >
        <Kicker>14:00 – 14:30 · 移動</Kicker>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 36, fontFamily: SERIF, fontWeight: 700, fontSize: 64, color: C.paper }}>
          <span>市役所</span>
          <span style={{ color: car > 0.98 ? C.mint : C.paper }}>綠美圖</span>
        </div>
        <svg width={920} height={40} style={{ marginTop: 18 }}>
          <line x1={10} y1={20} x2={910} y2={20} stroke={C.line} strokeWidth={4} strokeDasharray="14 12" />
          <line x1={10} y1={20} x2={10 + 900 * car} y2={20} stroke={C.mint} strokeWidth={4} strokeDasharray="14 12" />
          <circle cx={10} cy={20} r={10} fill={C.paper} />
          <circle cx={10 + 900 * car} cy={20} r={16} fill={C.mint} />
        </svg>
        <div style={{ fontFamily: SANS, fontSize: 44, color: C.dim, marginTop: 14 }}>車程約 30 分鐘</div>
      </div>

      {/* the exhibition */}
      <Photo
        src="poster.jpg"
        delay={BAR + 8}
        dir="left"
        zoom={[1.15, 1.0]}
        revealDur={beat(2)}
        style={{ left: 0, top: 260, width: 1080, height: 662 }}
      />
      <Rule delay={BAR + 20} dur={20} color={C.red} style={{ left: 0, top: 922, width: 1080, height: 8 }} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 980 }}>
        <Tag delay={BAR + beat(2)} size={38} color={C.red} text={C.paper}>
          14:30 – 16:00 · 第三站 綠美圖
        </Tag>
        <RiseText
          text="蠍子與青蛙"
          delay={BAR + beat(3)}
          stagger={2.5}
          style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 140, color: C.paper, marginTop: 22 }}
        />
        <RiseText
          text="國巨基金會典藏展"
          delay={2 * BAR}
          stagger={1.5}
          style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 60, color: C.paper, marginTop: 4 }}
        />
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: 40,
            color: C.mint,
            marginTop: 16,
            opacity: ap(f, [2 * BAR + beat(1), 2 * BAR + beat(1) + 8], [0, 1]),
          }}
        >
          11/20 正式開展 · 貴賓搶先觀展
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", rowGap: 26, marginTop: 40 }}>
          {STATS.map((s, i) => {
            const d = 3 * BAR + beat(i);
            return (
              <div
                key={s.l}
                style={{
                  borderLeft: `3px solid ${s.hot ? C.red : C.line}`,
                  paddingLeft: 22,
                  opacity: ap(f, [d, d + 8], [0, 1]),
                  transform: `translateY(${ap(f, [d, d + 18], [40, 0])}px) scale(${s.hot && f > d + 20 ? pulse : 1})`,
                  transformOrigin: "left center",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span
                    style={{
                      fontFamily: SANS,
                      fontWeight: 900,
                      fontSize: 92,
                      lineHeight: 1,
                      color: s.hot ? C.red : C.paper,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    <Count to={s.n} delay={d} dur={20} />
                  </span>
                  <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 38, color: C.paper }}>{s.u}</span>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 30, color: C.dim, marginTop: 6 }}>{s.l}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 重點作品 (6 bars = 3 pages × 2 bars) ───────────── */

const WORKS = [
  { img: "warhol.jpg", zh: "安迪・沃荷", en: "Andy Warhol", t: "〈自畫像〉1986", badge: "台灣首展" },
  { img: "picasso.jpg", zh: "畢卡索", en: "Pablo Picasso", t: "〈女子胸像〉1938", badge: "台灣首展" },
  { img: "koons.jpg", zh: "傑夫・昆斯", en: "Jeff Koons", t: "〈氣球狗（紅）〉", badge: "台灣首展" },
  { img: "hockney.jpg", zh: "大衛・霍克尼", en: "David Hockney", t: "〈伊舍伍德與巴查迪〉1968", badge: "" },
  { img: "sanyu.jpg", zh: "常玉", en: "Sanyu", t: "〈裸女背像〉1929", badge: "睽違 30 年在台亮相" },
  { img: "mondrian.jpg", zh: "蒙德里安", en: "Piet Mondrian", t: "〈構成 No. II〉1930", badge: "" },
];

const WorkRow: React.FC<{ w: (typeof WORKS)[number]; d: number; out: number; flip?: boolean }> = ({ w, d, out, flip }) => {
  const f = useCurrentFrame();
  const x = ap(f, [d, d + 18], [flip ? -1100 : 1100, 0]) + ap(f, [out, out + 12], [0, flip ? 1100 : -1100], IN);
  return (
    <div style={{ display: "flex", gap: 40, alignItems: "center", transform: `translateX(${x}px)`, flexDirection: flip ? "row-reverse" : "row" }}>
      <div
        style={{
          width: 470,
          height: 520,
          flex: "none",
          background: "#1c1e22",
          padding: 24,
          boxSizing: "border-box",
          outline: `1px solid ${C.line}`,
          boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
        }}
      >
        <Img
          src={staticFile(`visit/${w.img}`)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transform: `scale(${ap(f, [d, d + 2 * BAR], [1.06, 1], (t) => t)})`,
          }}
        />
      </div>
      <div style={{ flex: 1, textAlign: flip ? "right" : "left" }}>
        <div style={{ height: 56 }}>
          {w.badge ? (
            <Tag delay={d + beat(1)} size={28} color={w.badge === "台灣首展" ? C.red : C.gold} text={w.badge === "台灣首展" ? C.paper : C.ink}>
              {w.badge}
            </Tag>
          ) : null}
        </div>
        <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 60, color: C.paper, marginTop: 14, lineHeight: 1.15 }}>{w.zh}</div>
        <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: 32, color: C.dim, marginTop: 8 }}>{w.en}</div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 34, color: C.paper, marginTop: 16, lineHeight: 1.3 }}>{w.t}</div>
      </div>
    </div>
  );
};

export const RWorks: React.FC = () => {
  const f = useCurrentFrame();
  const page = Math.min(2, Math.floor(f / (2 * BAR)));
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 80% 20%, rgba(224,53,43,0.14), transparent 50%)" }} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 280 }}>
        <Kicker>14:30 · 國巨展</Kicker>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 18 }}>
          <RiseText text="重點導覽作品" delay={2} stagger={2} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 100, color: C.paper }} />
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 44, color: C.mint, fontVariantNumeric: "tabular-nums" }}>
            {page + 1}
            <span style={{ color: C.dim }}> / 3</span>
          </div>
        </div>
        {/* page progress, steps on each 2-bar page */}
        <div style={{ position: "relative", height: 6, background: C.line, marginTop: 24 }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${ap(f, [0, 6 * BAR], [0, 100], (t) => t)}%`, background: C.mint }} />
        </div>
      </div>
      {[0, 1, 2].map((p) => {
        const start = p * 2 * BAR;
        if (f < start - 2 || f > start + 2 * BAR + 14) return null;
        const out = p < 2 ? start + 2 * BAR - 6 : 99999;
        return (
          <div key={p} style={{ position: "absolute", left: 80, right: 80, top: 540, display: "flex", flexDirection: "column", gap: 60 }}>
            <WorkRow w={WORKS[p * 2]} d={start + (p === 0 ? beat(1) : 4)} out={out} />
            <WorkRow w={WORKS[p * 2 + 1]} d={start + (p === 0 ? beat(2) : beat(1))} out={out + 3} flip />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ───────────── 策展人 (4 bars) ───────────── */

export const RCurator: React.FC = () => {
  const f = useCurrentFrame();
  const facts = ["2019 年起任伊斯頓基金會策展人", "管理路易絲・布爾喬亞藝術遺產", "曾策劃草間彌生、安迪・沃荷個展"];
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Photo src="curator.jpg" delay={0} dir="up" position="center 25%" zoom={[1.15, 1.0]} style={{ left: 0, top: 0, width: 1080, height: 1200 }} />
      <Shade from={36} to={58} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 860 }}>
        <Tag delay={beat(1)} size={38}>
          策展人親自導覽
        </Tag>
        <RiseText
          text="菲利普．拉瑞特史密斯"
          delay={beat(2)}
          stagger={1.5}
          style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 86, color: C.paper, marginTop: 26 }}
        />
        <RiseText text="Philip Larratt-Smith" delay={beat(3)} stagger={0.6} style={{ fontFamily: SANS, fontWeight: 300, fontSize: 48, color: C.dim, marginTop: 6 }} />
        <div style={{ marginTop: 34 }}>
          {facts.map((t, i) => {
            const d = beat(4 + i);
            return (
              <div
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  fontFamily: SANS,
                  fontSize: 42,
                  color: C.paper,
                  marginTop: 20,
                  opacity: ap(f, [d, d + 8], [0, 1]),
                  transform: `translateX(${ap(f, [d, d + 18], [-50, 0])}px)`,
                }}
              >
                <div style={{ width: 30, height: 4, background: C.mint, flex: "none" }} />
                {t}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 44 }}>
          <Tag delay={beat(8)} size={46} color={C.gold} text={C.ink}>
            全程同步中文口譯
          </Tag>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 茶敘 (4 bars) ───────────── */

export const RTea: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <BlurFill src="cafe.jpg" opacity={0.7} />
      <Photo src="cafe.jpg" delay={0} dir="left" zoom={[1.2, 1.0]} revealDur={beat(2)} style={{ left: 0, top: 0, width: 1080, height: 1250 }} />
      <Shade from={40} to={64} />
      <div
        style={{
          position: "absolute",
          right: 70,
          top: 820,
          width: 300,
          height: 300,
          borderRadius: 150,
          overflow: "hidden",
          border: `8px solid ${C.paper}`,
          transform: `scale(${ap(f, [beat(4), beat(4) + 16], [0, 1])}) rotate(${ap(f, [beat(4), beat(7)], [-30, 0])}deg)`,
        }}
      >
        <Img src={staticFile("visit/coffee.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1130 }}>
        <Tag delay={beat(1)} size={38}>
          16:00 – 16:30 · 第四站
        </Tag>
        <RiseText
          text="咖啡廳茶敘"
          delay={beat(2)}
          stagger={2.5}
          style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 160, color: C.paper, marginTop: 24 }}
        />
        <RiseText
          text="綠美圖一樓 · Pharos Coffee"
          delay={beat(3)}
          stagger={0.8}
          style={{ fontFamily: SANS, fontWeight: 500, fontSize: 50, color: C.paper, marginTop: 10 }}
        />
        <div style={{ fontFamily: SANS, fontSize: 42, color: C.mint, marginTop: 18, letterSpacing: "0.3em", opacity: ap(f, [beat(5), beat(5) + 8], [0, 1]) }}>
          全場包場
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 伴手禮 (4 bars) ───────────── */

export const RGifts: React.FC = () => {
  const f = useCurrentFrame();
  const drop = (d: number, rot: number) => ({
    opacity: ap(f, [d, d + 6], [0, 1]),
    transform: `translateY(${ap(f, [d, d + 18], [220, 0], OUT)}px) rotate(${ap(f, [d, d + 24], [rot * 4, rot])}deg)`,
  });
  return (
    <AbsoluteFill style={{ background: C.paper, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 80, top: 260, display: "flex", alignItems: "center", gap: 30 }}>
        <RiseText text="伴手禮" delay={2} stagger={2} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 110, color: C.ink }} />
        <Tag delay={beat(1)} size={36} color={C.ink} text={C.paper}>
          致贈貴賓
        </Tag>
      </div>
      {/* 典藏明信片＋手札 */}
      <div style={{ position: "absolute", left: 150, top: 440, width: 780, ...drop(beat(1), -1.5) }}>
        <div style={{ background: "#fff", padding: 18, boxShadow: "0 30px 60px rgba(0,0,0,0.18)" }}>
          <Img src={staticFile("visit/postcards.jpg")} style={{ width: "100%", display: "block" }} />
        </div>
        <div style={{ marginTop: 22, fontFamily: SERIF, fontWeight: 900, fontSize: 58, color: C.ink }}>
          官方典藏明信片＋手札
        </div>
      </div>
      {/* 金馬聯名酒禮 */}
      <div style={{ position: "absolute", left: 80, top: 1160, width: 920 }}>
        <div style={{ position: "relative", height: 330 }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 470, ...drop(beat(4), -3) }}>
            <Img src={staticFile("visit/wine1.jpg")} style={{ width: "100%", display: "block", border: "12px solid #fff", boxShadow: "0 24px 50px rgba(0,0,0,0.2)" }} />
          </div>
          <div style={{ position: "absolute", left: 450, top: 20, width: 470, ...drop(beat(5), 3) }}>
            <Img src={staticFile("visit/wine2.jpg")} style={{ width: "100%", display: "block", border: "12px solid #fff", boxShadow: "0 24px 50px rgba(0,0,0,0.2)" }} />
          </div>
        </div>
        <div style={{ marginTop: 26, fontFamily: SERIF, fontWeight: 900, fontSize: 58, color: C.ink, opacity: ap(f, [beat(6), beat(6) + 8], [0, 1]) }}>
          金馬聯名酒禮
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── Outro (4 bars) ───────────── */

const STOPS = [
  { t: "11:00", n: "台中州廳" },
  { t: "12:00", n: "市役所" },
  { t: "14:30", n: "綠美圖" },
];

export const ROutro: React.FC = () => {
  const f = useCurrentFrame();
  const line = ap(f, [beat(1), beat(5)], [0, 1], INOUT);
  const end = 4 * BAR;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden", opacity: ap(f, [end - 14, end], [1, 0]) }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(143,211,195,0.16), transparent 55%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 48, color: C.mint, letterSpacing: "0.12em", opacity: ap(f, [0, 10], [0, 1]) }}>
          11月17日（二）
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 64, color: C.paper, marginTop: 10, opacity: ap(f, [4, 14], [0, 1]) }}>
          11:00 – 16:30
        </div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 560, height: 640 }}>
        <div style={{ position: "absolute", left: 18, top: 20, width: 6, height: 600, background: C.line }} />
        <div style={{ position: "absolute", left: 18, top: 20, width: 6, height: 600 * line, background: C.mint }} />
        {STOPS.map((s, i) => {
          const d = beat(1 + i * 2);
          return (
            <div key={s.n} style={{ position: "absolute", left: 0, top: i * 300, display: "flex", alignItems: "center", gap: 40 }}>
              <div style={{ width: 42, height: 42, borderRadius: 21, background: C.mint, transform: `scale(${ap(f, [d, d + 12], [0, 1])})` }} />
              <div style={{ whiteSpace: "nowrap", opacity: ap(f, [d + 2, d + 12], [0, 1]), transform: `translateX(${ap(f, [d, d + 18], [40, 0])}px)` }}>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.mint }}>{s.t}</div>
                <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 86, color: C.paper }}>{s.n}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1430, display: "flex", justifyContent: "center" }}>
        <RiseText text="敬邀蒞臨" delay={3 * BAR} stagger={3} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 150, color: C.paper, letterSpacing: "0.25em" }} />
      </div>
    </AbsoluteFill>
  );
};
