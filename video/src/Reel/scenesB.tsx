import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Count, Photo, RiseText, Rule, Tag } from "../Visit/primitives";
import { ap, C, IN, INOUT, OUT, SANS, SERIF } from "../Visit/theme";
import { BAR, beat, BlurFill, Kicker, Shade, usePulse } from "./kit";

/* ───────────── 車程 + 綠美圖動線 (4 bars) ───────────── */

const ARRIVE_STEPS = [
  { a: "綠美圖大廳迎賓", b: "" },
  { a: "建築空間導覽", b: "中美館 賴依欣館長" },
  { a: "5F 展覽室 D&E", b: "搶先預覽《蠍子與青蛙》" },
];

export const RArrive: React.FC = () => {
  const f = useCurrentFrame();
  const car = ap(f, [4, BAR + 6], [0, 1], INOUT);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 70% 60%, rgba(143,211,195,0.14), transparent 55%)" }} />
      {/* the drive */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 280 }}>
        <Kicker>14:00 – 14:30 · 移動</Kicker>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 26, fontFamily: SERIF, fontWeight: 700, fontSize: 56, color: C.paper }}>
          <span>市役所</span>
          <span style={{ color: car > 0.98 ? C.mint : C.paper }}>綠美圖</span>
        </div>
        <svg width={920} height={40} style={{ marginTop: 14 }}>
          <line x1={10} y1={20} x2={910} y2={20} stroke={C.line} strokeWidth={4} strokeDasharray="14 12" />
          <line x1={10} y1={20} x2={10 + 900 * car} y2={20} stroke={C.mint} strokeWidth={4} strokeDasharray="14 12" />
          <circle cx={10} cy={20} r={10} fill={C.paper} />
          <circle cx={10 + 900 * car} cy={20} r={16} fill={C.mint} />
        </svg>
        <div style={{ fontFamily: SANS, fontSize: 36, color: C.dim, marginTop: 10 }}>車程約 30 分鐘</div>
      </div>

      {/* arrival + tour flow */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 640 }}>
        <Tag delay={BAR} size={38} color={C.red} text={C.paper}>
          14:30 – 16:00 · 第三站
        </Tag>
        <RiseText text="臺中綠美圖" delay={BAR + beat(1)} stagger={2.5} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 140, color: C.paper, marginTop: 20 }} />
        <RiseText text="綠美圖暨國巨典藏展" delay={BAR + beat(2)} stagger={1} style={{ fontFamily: SANS, fontWeight: 500, fontSize: 46, color: C.paper, marginTop: 6 }} />
        <div style={{ position: "relative", marginTop: 50 }}>
          <Rule vertical delay={BAR + beat(3)} dur={20} color={C.mint} style={{ left: 27, top: 30, height: 360 }} />
          {ARRIVE_STEPS.map((s, i) => {
            const d = BAR + beat(3) + i * 4;
            return (
              <div
                key={s.a}
                style={{
                  position: "relative",
                  height: 180,
                  paddingLeft: 96,
                  opacity: ap(f, [d, d + 8], [0, 1]),
                  transform: `translateX(${ap(f, [d, d + 18], [80, 0])}px)`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 4,
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    background: i === 2 ? C.red : C.mint,
                    color: i === 2 ? C.paper : C.ink,
                    fontFamily: SANS,
                    fontWeight: 900,
                    fontSize: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 60, color: C.paper }}>{s.a}</div>
                {s.b ? <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 36, color: i === 2 ? C.red : C.mint, marginTop: 6 }}>{s.b}</div> : null}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 國巨典藏展 (4 bars) ───────────── */

const STATS = [
  { n: 66, u: "件", l: "世界級經典名作" },
  { n: 55, u: "件", l: "首度在台公開", hot: true },
  { n: 34, u: "位", l: "國際藝術家" },
  { n: 13, u: "國", l: "橫跨國家" },
  { n: 5, u: "世紀", l: "文藝復興至今" },
];

export const RShow: React.FC = () => {
  const f = useCurrentFrame();
  const pulse = usePulse(0.03);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Photo src="poster.jpg" delay={0} dir="left" zoom={[1.15, 1.0]} revealDur={beat(2)} style={{ left: 0, top: 260, width: 1080, height: 662 }} />
      <Rule delay={beat(1)} dur={20} color={C.red} style={{ left: 0, top: 922, width: 1080, height: 8 }} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 980 }}>
        <Tag delay={beat(1)} size={38} color={C.red} text={C.paper}>
          5F 展覽室 D&E · 搶先預覽
        </Tag>
        <RiseText text="蠍子與青蛙" delay={beat(2)} stagger={2.5} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 140, color: C.paper, marginTop: 22 }} />
        <RiseText text="國巨基金會典藏展" delay={beat(3)} stagger={1.5} style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 60, color: C.paper, marginTop: 4 }} />
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 40, color: C.mint, marginTop: 16, opacity: ap(f, [beat(4), beat(4) + 8], [0, 1]) }}>
          11/20 正式開展 · 貴賓搶先觀展
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", rowGap: 26, marginTop: 40 }}>
          {STATS.map((s, i) => {
            const d = beat(5) + i * 3;
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
                  <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 92, lineHeight: 1, color: s.hot ? C.red : C.paper, fontVariantNumeric: "tabular-nums" }}>
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
        <Kicker>14:30 · 國巨典藏展</Kicker>
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
        <RiseText text="菲利普．拉瑞特－史密斯" delay={beat(2)} stagger={1.5} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 80, color: C.paper, marginTop: 26 }} />
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
          <Tag delay={beat(8)} size={44} color={C.gold} text={C.ink}>
            英文導覽 · 現場備有中文同步口譯
          </Tag>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 午茶交流 (4 bars) ───────────── */

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
          top: 780,
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
      <div style={{ position: "absolute", left: 80, right: 80, top: 1100 }}>
        <Tag delay={beat(1)} size={38}>
          16:00 – 16:30 · 第四站
        </Tag>
        <RiseText text="午茶交流" delay={beat(2)} stagger={2.5} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 160, color: C.paper, marginTop: 24 }} />
        <RiseText text="Pharos Coffee · 綠美圖一樓" delay={beat(3)} stagger={0.8} style={{ fontFamily: SANS, fontWeight: 500, fontSize: 48, color: C.paper, marginTop: 10 }} />
        <div style={{ display: "flex", gap: 18, marginTop: 24 }}>
          {["專屬包場空間", "手沖咖啡", "手作甜點"].map((t, i) => {
            const d = beat(4) + i * 3;
            return (
              <div
                key={t}
                style={{
                  fontFamily: SANS,
                  fontWeight: 500,
                  fontSize: 36,
                  color: C.paper,
                  border: `2px solid ${C.mint}`,
                  padding: "8px 22px",
                  opacity: ap(f, [d, d + 8], [0, 1]),
                  transform: `scale(${ap(f, [d, d + 14], [0.8, 1])})`,
                }}
              >
                {t}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 伴手禮 (4 bars) ───────────── */

/** Simple incense-stick mark, for the gift that has no photo. */
const Incense: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame();
  const sway = Math.sin((f - d) / 9) * 6;
  return (
    <svg width={180} height={220} viewBox="0 0 180 220">
      {[60, 90, 120].map((x, i) => (
        <g key={x}>
          <line x1={x} y1={110} x2={x} y2={210} stroke={C.gold} strokeWidth={5} strokeLinecap="round" />
          <circle cx={x} cy={110} r={5} fill={C.red} />
          <path
            d={`M${x} 104 C ${x - 18 + sway} 80, ${x + 18 - sway} 60, ${x + sway / 2} 20`}
            fill="none"
            stroke="rgba(244,240,232,0.55)"
            strokeWidth={3}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - ap(f, [d + i * 3, d + i * 3 + 24], [0, 1])}
          />
        </g>
      ))}
    </svg>
  );
};

export const RGifts: React.FC = () => {
  const f = useCurrentFrame();
  const drop = (d: number, rot: number) => ({
    opacity: ap(f, [d, d + 6], [0, 1]),
    transform: `translateY(${ap(f, [d, d + 18], [220, 0], OUT)}px) rotate(${ap(f, [d, d + 24], [rot * 4, rot])}deg)`,
  });
  const fade = (d: number) => ({ opacity: ap(f, [d, d + 8], [0, 1]) });
  return (
    <AbsoluteFill style={{ background: C.paper, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 80, top: 250, display: "flex", alignItems: "center", gap: 30 }}>
        <RiseText text="伴手禮" delay={2} stagger={2} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 110, color: C.ink }} />
        <Tag delay={beat(1)} size={34} color={C.ink} text={C.paper}>
          午宴後 市長致贈
        </Tag>
      </div>

      {/* 文化局 */}
      <div style={{ position: "absolute", left: 80, top: 430, fontFamily: SANS, fontWeight: 700, fontSize: 34, color: C.red, letterSpacing: "0.2em", ...fade(beat(1)) }}>
        文化局致贈
      </div>
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 490,
          width: 290,
          height: 440,
          background: C.ink,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 30px 60px rgba(0,0,0,0.2)",
          ...drop(beat(1.5), -1.5),
        }}
      >
        <Incense d={beat(2)} />
        <div style={{ fontFamily: SANS, fontSize: 28, color: C.gold, letterSpacing: "0.3em", marginTop: 10 }}>臺中州廳</div>
        <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 72, color: C.paper, marginTop: 4 }}>心香</div>
      </div>
      <div style={{ position: "absolute", left: 400, top: 490, width: 600, ...drop(beat(2), 1.5) }}>
        <div style={{ background: "#fff", padding: 14, boxShadow: "0 30px 60px rgba(0,0,0,0.18)" }}>
          <Img src={staticFile("visit/postcards.jpg")} style={{ width: "100%", display: "block" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 80, top: 955, width: 920, display: "flex", gap: 30, ...fade(beat(3)) }}>
        <div style={{ width: 290, fontFamily: SERIF, fontWeight: 900, fontSize: 38, color: C.ink }}>① 臺中州廳心香</div>
        <div style={{ flex: 1, fontFamily: SERIF, fontWeight: 900, fontSize: 36, color: C.ink, lineHeight: 1.3 }}>② 《蠍子與青蛙》圖錄＋套裝明信片</div>
      </div>

      {/* 新聞局 */}
      <div style={{ position: "absolute", left: 80, top: 1090, fontFamily: SANS, fontWeight: 700, fontSize: 34, color: C.red, letterSpacing: "0.2em", ...fade(beat(4)) }}>
        新聞局致贈
      </div>
      <div style={{ position: "absolute", left: 80, top: 1150, width: 440, ...drop(beat(4.5), -2) }}>
        <Img src={staticFile("visit/wine2.jpg")} style={{ width: "100%", display: "block", border: "12px solid #fff", boxShadow: "0 24px 50px rgba(0,0,0,0.2)" }} />
      </div>
      <div style={{ position: "absolute", left: 560, top: 1160, width: 440, ...drop(beat(5), 2) }}>
        <Img src={staticFile("visit/wine1.jpg")} style={{ width: "100%", display: "block", border: "12px solid #fff", boxShadow: "0 24px 50px rgba(0,0,0,0.2)" }} />
      </div>
      <div style={{ position: "absolute", left: 80, top: 1475, width: 920, ...fade(beat(5.5)) }}>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, color: C.red, marginRight: 16 }}>金馬63聯名</span>
        <span style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 46, color: C.ink }}>《史詩泡盛—道卡斯地酒》</span>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── Outro (4 bars) ───────────── */

const STOPS = [
  { t: "11:00", n: "臺中州廳" },
  { t: "12:00", n: "臺中市役所" },
  { t: "14:30", n: "臺中綠美圖" },
  { t: "16:30", n: "高鐵臺中站", s: "專車送返" },
];

export const ROutro: React.FC = () => {
  const f = useCurrentFrame();
  const line = ap(f, [beat(1), beat(6)], [0, 1], INOUT);
  const end = 4 * BAR;
  const gap = 200;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden", opacity: ap(f, [end - 14, end], [1, 0]) }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(143,211,195,0.16), transparent 55%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 48, color: C.mint, letterSpacing: "0.12em", opacity: ap(f, [0, 10], [0, 1]) }}>
          11月17日（二）
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 64, color: C.paper, marginTop: 10, opacity: ap(f, [4, 14], [0, 1]) }}>
          11:00 – 17:00
        </div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 540 }}>
        <div style={{ position: "absolute", left: 18, top: 20, width: 6, height: gap * 3, background: C.line }} />
        <div style={{ position: "absolute", left: 18, top: 20, width: 6, height: gap * 3 * line, background: C.mint }} />
        {STOPS.map((s, i) => {
          const d = beat(1 + i * 1.5);
          return (
            <div key={s.n} style={{ position: "absolute", left: 0, top: i * gap, display: "flex", alignItems: "center", gap: 40 }}>
              <div style={{ width: 42, height: 42, borderRadius: 21, background: i === 3 ? C.gold : C.mint, transform: `scale(${ap(f, [d, d + 12], [0, 1])})` }} />
              <div style={{ whiteSpace: "nowrap", opacity: ap(f, [d + 2, d + 12], [0, 1]), transform: `translateX(${ap(f, [d, d + 18], [40, 0])}px)` }}>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, color: i === 3 ? C.gold : C.mint }}>
                  {s.t}
                  {s.s ? <span style={{ color: C.dim, marginLeft: 16 }}>{s.s}</span> : null}
                </div>
                <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 76, color: C.paper }}>{s.n}</div>
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
