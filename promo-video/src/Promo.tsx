import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill, Audio, Easing, Img, Sequence, continueRender, delayRender,
  interpolate, staticFile, useCurrentFrame,
} from 'remotion';
import '@fontsource/noto-serif-tc/500.css';
import '@fontsource/noto-serif-tc/700.css';
import '@fontsource/noto-serif-tc/900.css';
import '@fontsource/noto-sans-tc/300.css';
import '@fontsource/noto-sans-tc/400.css';
import '@fontsource/noto-sans-tc/500.css';
import '@fontsource/noto-sans-tc/700.css';

/* ───────────── design tokens ───────────── */
const W = 1920, H = 1080;
const SERIF = '"Noto Serif TC", serif';
const SANS = '"Noto Sans TC", sans-serif';
const C = {
  ink: '#15121B', paper: '#F4EFE6', seal: '#C8402F',
  purple: '#6C4FA3', violet: '#9B7BD0', blue: '#2F7CC4', sky: '#7DC3EA', teal: '#3BA99C',
  green: '#5DAA4F', lime: '#BFD657', yellow: '#F3CF45', orange: '#EF8A37', pink: '#E5679B',
};
const PAL = [C.purple, C.violet, C.blue, C.sky, C.teal, C.green, C.lime, C.yellow, C.orange, C.pink];
const GRAD = `linear-gradient(90deg, ${C.purple}, ${C.blue}, ${C.teal}, ${C.lime}, ${C.yellow}, ${C.orange}, ${C.pink})`;

const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const INOUT = Easing.bezier(0.65, 0, 0.35, 1);
const p = (f: number, a: number, b: number, e = OUT) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const img = (n: string) => staticFile(`${n}.jpg`);

/* ───────────── text primitives ───────────── */
const Chars: React.FC<{ text: string; start: number; stagger?: number; dur?: number; style?: React.CSSProperties; mode?: 'rise' | 'blur' }> =
  ({ text, start, stagger = 2, dur = 18, style, mode = 'rise' }) => {
    const f = useCurrentFrame();
    return (
      <span style={{ display: 'inline-flex', whiteSpace: 'pre', ...style }}>
        {[...text].map((ch, i) => {
          const t = p(f, start + i * stagger, start + i * stagger + dur);
          if (mode === 'blur') {
            return (
              <span key={i} style={{ display: 'inline-block', opacity: t, filter: `blur(${(1 - t) * 14}px)`, transform: `translateY(${(1 - t) * 40}px) scale(${lerp(1.25, 1, t)})` }}>{ch}</span>
            );
          }
          return (
            <span key={i} style={{ display: 'inline-block', overflow: 'hidden', paddingBottom: '0.08em', marginBottom: '-0.08em' }}>
              <span style={{ display: 'inline-block', transform: `translateY(${(1 - t) * 110}%) rotate(${(1 - t) * 8}deg)` }}>{ch}</span>
            </span>
          );
        })}
      </span>
    );
  };

const Fade: React.FC<{ start: number; dur?: number; y?: number; children: React.ReactNode; style?: React.CSSProperties }> =
  ({ start, dur = 16, y = 24, children, style }) => {
    const f = useCurrentFrame();
    const t = p(f, start, start + dur);
    const base = typeof style?.opacity === 'number' ? style.opacity : 1;
    return <div style={{ ...style, opacity: t * base, transform: `translateY(${(1 - t) * y}px)` }}>{children}</div>;
  };

const Seal: React.FC<{ start: number; size?: number; style?: React.CSSProperties }> = ({ start, size = 104, style }) => {
  const f = useCurrentFrame();
  const t = p(f, start, start + 14, Easing.bezier(0.34, 1.56, 0.64, 1));
  return (
    <div style={{
      width: size, height: size, background: C.seal, color: '#fff', borderRadius: 10, display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexDirection: 'column', fontFamily: SERIF, fontWeight: 900,
      fontSize: size * 0.34, lineHeight: 1.05, transform: `scale(${t}) rotate(${lerp(-25, -6, t)}deg)`, opacity: Math.min(1, t * 2),
      boxShadow: '0 10px 30px rgba(200,64,47,.35)', ...style,
    }}>
      <span>首</span><span>屆</span>
    </div>
  );
};

/* ───────────── thread motifs ───────────── */
const wavePath = (x0: number, amp: number, freq: number, phase: number) => {
  let d = '';
  for (let y = -60; y <= H + 60; y += 24) {
    const x = x0 + amp * Math.sin(y * freq + phase) + amp * 0.4 * Math.sin(y * freq * 2.3 + phase * 1.7);
    d += `${d ? 'L' : 'M'}${x.toFixed(1)} ${y}`;
  }
  return d;
};

const Threads: React.FC<{ n?: number; start?: number; width?: number; opacity?: number; spread?: [number, number]; amp?: number }> =
  ({ n = 14, start = 0, width = 3, opacity = 1, spread = [180, 1740], amp = 50 }) => {
    const f = useCurrentFrame();
    return (
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity }}>
        {Array.from({ length: n }).map((_, i) => {
          const draw = p(f, start + i * 1.6, start + i * 1.6 + 30, INOUT);
          const x0 = lerp(spread[0], spread[1], i / (n - 1));
          const a = amp * (0.6 + 0.4 * Math.sin(i * 1.3));
          return (
            <path key={i} d={wavePath(x0, a, 0.0042 + (i % 3) * 0.0011, f * 0.05 + i * 0.9)}
              stroke={PAL[i % PAL.length]} strokeWidth={width} fill="none" strokeLinecap="round"
              pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
          );
        })}
      </svg>
    );
  };

/* Full-screen vertical colour-bar cover; the cut happens at start+17 */
const StripeCover: React.FC<{ start: number; bars?: number }> = ({ start, bars = 12 }) => {
  const f = useCurrentFrame();
  if (f < start - 1 || f > start + 36) return null;
  const bw = W / bars;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {Array.from({ length: bars }).map((_, i) => {
        const tin = p(f, start + i * 0.6, start + 10 + i * 0.6, INOUT);
        const tout = p(f, start + 17 + i * 0.6, start + 29 + i * 0.6, INOUT);
        const ty = (1 - tin) * 100 - tout * 100;
        return <div key={i} style={{ position: 'absolute', left: i * bw - 1, width: bw + 2, height: H, top: 0, background: PAL[i % PAL.length], transform: `translateY(${ty}%)` }} />;
      })}
    </AbsoluteFill>
  );
};

/* ───────────── photo layer + reveals ───────────── */
const KB: React.FC<{ src: string; f: number; dur: number; from?: number; to?: number; dx?: number; dy?: number; ox?: number; oy?: number }> =
  ({ src, f, dur, from = 1.16, to = 1.02, dx = 0, dy = 0, ox = 0, oy = 0 }) => {
    const t = interpolate(f, [0, dur], [0, 1], { extrapolateRight: 'clamp' });
    const s = lerp(from, to, Easing.out(Easing.quad)(t));
    return (
      <div style={{ position: 'absolute', left: ox, top: oy, width: W, height: H, overflow: 'hidden' }}>
        <Img src={src} style={{ width: W, height: H, objectFit: 'cover', transform: `translate(${dx * t}px, ${dy * t}px) scale(${s})` }} />
      </div>
    );
  };

type Reveal = 'slices' | 'iris' | 'triptych' | 'blinds' | 'diagonal';

const PhotoReveal: React.FC<{ src: string; reveal: Reveal; accent: string; dur: number; dx?: number; dy?: number }> =
  ({ src, reveal, accent, dur, dx = 0, dy = 0 }) => {
    const f = useCurrentFrame();
    const base = (ox = 0, oy = 0) => <KB src={src} f={f} dur={dur} dx={dx} dy={dy} ox={ox} oy={oy} />;

    if (reveal === 'slices' || reveal === 'triptych') {
      const n = reveal === 'slices' ? 8 : 3;
      const sw = W / n;
      return (
        <AbsoluteFill>
          {Array.from({ length: n }).map((_, i) => {
            const st = reveal === 'slices' ? Math.abs(i - (n - 1) / 2) * 1.6 : i * 3;
            const dir = i % 2 ? -1 : 1;
            const tc = p(f, st, st + 14, INOUT);
            const ti = p(f, st + 4, st + 20, INOUT);
            return (
              <div key={i} style={{ position: 'absolute', left: i * sw - 0.5, top: 0, width: sw + 1, height: H, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: PAL[(i * 2 + (reveal === 'triptych' ? 5 : 0)) % PAL.length], transform: `translateY(${dir * (1 - tc) * 100}%)` }} />
                <div style={{ position: 'absolute', inset: 0, transform: `translateY(${dir * (1 - ti) * 100}%)` }}>
                  <div style={{ position: 'absolute', left: -i * sw, top: 0, width: W, height: H, transform: reveal === 'triptych' ? `scale(${lerp(1.25, 1, ti)})` : undefined, transformOrigin: `${(i + 0.5) * sw}px 50%` }}>
                    {base()}
                  </div>
                </div>
                {reveal === 'triptych' && i > 0 && (
                  <div style={{ position: 'absolute', left: 0, top: 0, width: 6, height: H, background: C.paper, opacity: 1 - p(f, 24, 40) }} />
                )}
              </div>
            );
          })}
        </AbsoluteFill>
      );
    }

    if (reveal === 'iris') {
      const t = p(f, 0, 22, Easing.bezier(0.7, 0, 0.2, 1));
      const R = t * 1150;
      const ring = (delay: number, color: string, bw: number) => {
        const tr = p(f, delay, delay + 22, Easing.bezier(0.7, 0, 0.2, 1));
        const r = tr * 1180;
        return <div style={{ position: 'absolute', left: 960 - r, top: 540 - r, width: 2 * r, height: 2 * r, borderRadius: '50%', border: `${bw}px solid ${color}`, opacity: 1 - p(f, delay + 16, delay + 24) }} />;
      };
      return (
        <AbsoluteFill>
          {ring(-3, C.yellow, 26)}
          {ring(-1.5, C.pink, 14)}
          <AbsoluteFill style={{ clipPath: `circle(${R}px at 960px 540px)` }}>{base()}</AbsoluteFill>
          {ring(0, '#fff', 4)}
        </AbsoluteFill>
      );
    }

    if (reveal === 'blinds') {
      const n = 6, sh = H / n;
      return (
        <AbsoluteFill>
          {Array.from({ length: n }).map((_, i) => {
            const st = i * 2;
            const tc = p(f, st, st + 13, INOUT);
            const ti = p(f, st + 4, st + 19, INOUT);
            const fromLeft = i % 2 === 0;
            const cl = (t: number) => (fromLeft ? `inset(0 ${(1 - t) * 100}% 0 0)` : `inset(0 0 0 ${(1 - t) * 100}%)`);
            return (
              <div key={i} style={{ position: 'absolute', left: 0, top: i * sh - 0.5, width: W, height: sh + 1, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: PAL[(i * 3 + 1) % PAL.length], clipPath: cl(tc) }} />
                <div style={{ position: 'absolute', inset: 0, clipPath: cl(ti) }}>
                  <div style={{ position: 'absolute', left: 0, top: -i * sh, width: W, height: H }}>{base()}</div>
                </div>
              </div>
            );
          })}
        </AbsoluteFill>
      );
    }

    // diagonal sweep with three leading colour ribbons
    const X = (lag: number) => lerp(-700, W + 700, p(f, lag, lag + 22, Easing.bezier(0.6, 0, 0.25, 1)));
    const poly = (x: number) => `polygon(0 0, ${x}px 0, ${x - 600}px ${H}px, 0 ${H}px)`;
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ background: C.orange, clipPath: poly(X(-4)) }} />
        <AbsoluteFill style={{ background: C.yellow, clipPath: poly(X(-2.5)) }} />
        <AbsoluteFill style={{ background: C.sky, clipPath: poly(X(-1)) }} />
        <AbsoluteFill style={{ clipPath: poly(X(0)) }}>{base()}</AbsoluteFill>
      </AbsoluteFill>
    );
  };

const Caption: React.FC<{ idx: number; total: number; title: string; work?: string; sub: string; tag: string; color: string; start?: number; exitAt?: number }> =
  ({ idx, total, title, work, sub, tag, color, start = 12, exitAt = 9999 }) => {
    const f = useCurrentFrame();
    const line = p(f, start, start + 24);
    const ex = p(f, exitAt, exitAt + 8, INOUT);
    return (
      <AbsoluteFill style={{ opacity: 1 - ex, transform: `translateY(${-ex * 30}px)` }}>
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(10,8,14,0) 45%, rgba(10,8,14,.78) 100%)', opacity: p(f, start - 6, start + 8) }} />
        <div style={{ position: 'absolute', left: 120, bottom: 110, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontFamily: SANS, fontWeight: 500, fontSize: 22, letterSpacing: '0.3em', marginBottom: 22 }}>
            <Fade start={start} dur={12} y={10}><span style={{ fontVariantNumeric: 'tabular-nums' }}>{String(idx).padStart(2, '0')} / {String(total).padStart(2, '0')}</span></Fade>
            <div style={{ width: 120 * line, height: 3, background: color }} />
            <Fade start={start + 6} dur={12} y={10}>
              <span style={{ background: color, color: C.ink, padding: '6px 16px', borderRadius: 40, letterSpacing: '0.15em', fontWeight: 700 }}>{tag}</span>
            </Fade>
          </div>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 76, lineHeight: 1.15, textShadow: '0 4px 30px rgba(0,0,0,.35)' }}>
            <Chars text={title} start={start + 2} stagger={1.2} dur={16} />
            {work && <Chars text={work} start={start + 2 + title.length * 1.2} stagger={1.2} dur={16} style={{ color, marginLeft: 8 }} />}
          </div>
          <Fade start={start + 14} dur={16} y={16} style={{ fontFamily: SANS, fontWeight: 300, fontSize: 34, letterSpacing: '0.12em', marginTop: 12, opacity: .92 }}>{sub}</Fade>
        </div>
      </AbsoluteFill>
    );
  };

/* ───────────── scenes ───────────── */
const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const backdrop = lerp(1, 0.32, p(f, 26, 50));
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <Threads start={0} opacity={backdrop} width={4} amp={46} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${lerp(1.0, 1.05, p(f, 0, 90, Easing.linear))})` }}>
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <Fade start={12} y={18} style={{ fontFamily: SANS, fontWeight: 500, fontSize: 46, letterSpacing: '0.6em', color: C.ink, marginBottom: 18, paddingLeft: '0.6em' }}>2026</Fade>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 132, color: C.ink, letterSpacing: '0.04em' }}>
            <Chars text="臺中纖維藝術雙年展" start={18} stagger={2.2} dur={18} />
          </div>
          <div style={{ height: 4, width: 980 * p(f, 34, 62, INOUT), background: GRAD, margin: '26px auto 22px' }} />
          <Fade start={42} style={{ fontFamily: SANS, fontWeight: 400, fontSize: 24, letterSpacing: '0.62em', color: C.ink, opacity: .8 }}>TAICHUNG FIBER ARTS BIENNALE</Fade>
          <Seal start={50} style={{ position: 'absolute', right: -150, top: 40 }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Theme: React.FC = () => {
  const f = useCurrentFrame();
  const d1 = p(f, 2, 46, INOUT), d2 = p(f, 8, 54, INOUT);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: 'hidden' }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="g1" x1="0" x2="1"><stop offset="0" stopColor={C.purple} /><stop offset=".35" stopColor={C.sky} /><stop offset=".65" stopColor={C.yellow} /><stop offset="1" stopColor={C.pink} /></linearGradient>
          <linearGradient id="g2" x1="1" x2="0"><stop offset="0" stopColor={C.teal} /><stop offset=".5" stopColor={C.lime} /><stop offset="1" stopColor={C.orange} /></linearGradient>
        </defs>
        <path d="M -120 820 C 260 260, 620 1060, 900 640 C 1080 360, 760 260, 980 230 C 1240 200, 1220 700, 1500 640 S 1900 250, 2060 330"
          stroke="url(#g1)" strokeWidth={7} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - d1} />
        <path d="M 2050 900 C 1700 980, 1560 420, 1220 520 C 900 620, 1040 960, 700 900 S 260 420, -100 300"
          stroke="url(#g2)" strokeWidth={3} fill="none" strokeLinecap="round" opacity={.8} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - d2} />
      </svg>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${lerp(1, 1.06, p(f, 0, 104, Easing.linear))})` }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <Fade start={4} y={10} style={{ fontFamily: SANS, fontWeight: 500, fontSize: 24, letterSpacing: '0.5em', color: C.yellow, marginBottom: 20 }}>本屆主題</Fade>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 220, letterSpacing: '0.06em', lineHeight: 1.1 }}>
            <Chars text="非線性敘事" start={8} stagger={3} dur={22} mode="blur" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, marginTop: 26 }}>
            <div style={{ height: 2, width: 140 * p(f, 30, 52), background: C.sky }} />
            <Fade start={30} y={14} style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 52, letterSpacing: '0.42em', paddingLeft: '0.42em' }}>理解島嶼的途徑</Fade>
            <div style={{ height: 2, width: 140 * p(f, 30, 52), background: C.pink }} />
          </div>
          <Fade start={42} y={10} style={{ fontFamily: SANS, fontWeight: 300, fontSize: 19, letterSpacing: '0.45em', opacity: .55, marginTop: 30 }}>NONLINEAR NARRATIVES — PATHWAYS TO UNDERSTANDING THE ISLANDS</Fade>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Stats: React.FC = () => {
  const f = useCurrentFrame();
  const bands = 9, bh = H / bands;
  const inkX = (i: number) => p(f, i * 1.1 + 4, i * 1.1 + 20, INOUT) * W;
  const colX = (i: number) => p(f, i * 1.1, i * 1.1 + 15, INOUT) * W;
  let poly = '0 0';
  for (let i = 0; i < bands; i++) poly += `, ${inkX(i)}px ${i * bh}px, ${inkX(i)}px ${(i + 1) * bh}px`;
  poly += `, 0 ${H}px`;
  const count = Math.round(interpolate(f, [14, 42], [0, 18], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: OUT }));
  const tiles = ['194123wub', '194144rdo', '194223cxu', '194156xem', '194205deo', '194135sah', '194233kxf'];
  const countries: [string, string][] = [['臺灣', C.pink], ['菲律賓', C.yellow], ['印尼', C.orange], ['泰國', C.lime], ['韓國', C.sky], ['日本', C.violet]];
  return (
    <AbsoluteFill>
      {Array.from({ length: bands }).map((_, i) => (
        <div key={i} style={{ position: 'absolute', top: i * bh - 0.5, height: bh + 1, left: 0, width: colX(i), background: PAL[(i * 3) % PAL.length] }} />
      ))}
      <AbsoluteFill style={{ clipPath: `polygon(${poly})`, background: C.ink, overflow: 'hidden' }}>
        {[0, 1, 2, 3].map((r) => (
          <div key={r} style={{ position: 'absolute', top: r * 280 - 40, left: -400, display: 'flex', gap: 24, transform: `translateX(${(r % 2 ? -1 : 1) * f * 2.2 - (r % 2 ? 0 : 300)}px)`, opacity: .2, filter: 'saturate(.8)' }}>
            {Array.from({ length: 8 }).map((_, k) => (
              <Img key={k} src={img(tiles[(k + r * 3) % tiles.length])} style={{ width: 380, height: 256, objectFit: 'cover', borderRadius: 6 }} />
            ))}
          </div>
        ))}
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(21,18,27,.35) 0%, rgba(21,18,27,.92) 70%)' }} />
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 40, transform: `scale(${lerp(0.92, 1, p(f, 10, 50))})` }}>
            <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 380, lineHeight: 1, backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', fontVariantNumeric: 'tabular-nums', width: 440, textAlign: 'right', opacity: p(f, 10, 18) }}>{count}</div>
            <div style={{ color: '#fff' }}>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 90 }}><Chars text="位藝術家" start={18} stagger={2} /></div>
              <Fade start={28} style={{ fontFamily: SANS, fontWeight: 300, fontSize: 40, letterSpacing: '0.3em', opacity: .85, marginTop: 6 }}>來自 6 個國家</Fade>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 56, marginTop: 40 }}>
            {countries.map(([name, col], i) => {
              const t = p(f, 36 + i * 3.5, 50 + i * 3.5, Easing.bezier(0.34, 1.56, 0.64, 1));
              return (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: Math.min(1, t * 1.5), transform: `translateY(${(1 - t) * 40}px)` }}>
                  <div style={{ width: 18, height: 18, borderRadius: 9, background: col, transform: `scale(${t})` }} />
                  <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 42, color: '#fff', letterSpacing: '0.12em' }}>{name}</span>
                </div>
              );
            })}
          </div>
          <Fade start={60} style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 34, color: C.yellow, letterSpacing: '0.35em', marginTop: 54 }}>以纖維展開多元文化對話</Fade>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Curator: React.FC = () => {
  const f = useCurrentFrame();
  const tl = p(f, 0, 18, INOUT), tr = p(f, 2, 20, INOUT);
  const lines = ['線，', '使過去、現在與未來', '的片段彼此交織。'];
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 860, top: 0, width: 1060, height: H, overflow: 'hidden', transform: `translateX(${(1 - tr) * 1060}px)` }}>
        <div style={{ position: 'absolute', left: -560, top: 0 }}><KB src={img('194135sah')} f={f} dur={104} from={1.18} to={1.05} dx={-40} /></div>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 860, height: H, background: C.paper, transform: `translateX(${(1 - tl) * -860}px)`, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 110, top: 150, fontFamily: SERIF, fontWeight: 900, fontSize: 260, lineHeight: 1, color: C.pink, opacity: p(f, 10, 22) * .9, transform: `translateY(${(1 - p(f, 10, 26)) * -40}px)` }}>“</div>
        <div style={{ position: 'absolute', left: 120, top: 360, fontFamily: SERIF, fontWeight: 700, fontSize: 64, lineHeight: 1.45, color: C.ink }}>
          {lines.map((l, i) => <div key={i}><Chars text={l} start={14 + i * 9} stagger={1.3} dur={16} /></div>)}
        </div>
        <div style={{ position: 'absolute', left: 120, top: 720, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 70 * p(f, 46, 62), height: 3, background: GRAD }} />
          <Fade start={48} y={10} style={{ fontFamily: SANS, fontWeight: 500, fontSize: 30, letterSpacing: '0.2em', color: C.ink }}>策展人　吳尚霖</Fade>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 857, top: 0, width: 6, height: H * p(f, 8, 30, INOUT), background: `linear-gradient(180deg, ${C.yellow}, ${C.pink}, ${C.purple})` }} />
    </AbsoluteFill>
  );
};

const Group: React.FC = () => {
  const f = useCurrentFrame();
  const t = p(f, 0, 18);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: C.ink, opacity: t }} />
      <AbsoluteFill style={{ opacity: t, filter: `blur(${(1 - t) * 24}px)`, transform: `scale(${lerp(1.45, 1, t)})` }}>
        <KB src={img('194233kxf')} f={f} dur={90} from={1.08} to={1.0} dy={-20} />
      </AbsoluteFill>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 10 }).map((_, i) => {
          const s = p(f, i * 0.8, i * 0.8 + 12, INOUT), e = p(f, i * 0.8 + 6, i * 0.8 + 18, INOUT);
          const y = 90 + i * 100;
          return <line key={i} x1={lerp(-50, W + 50, e)} x2={lerp(-50, W + 50, s)} y1={y} y2={y + 30} stroke={PAL[i]} strokeWidth={8} strokeLinecap="round" />;
        })}
      </svg>
      <Caption idx={6} total={6} title="策展人 吳尚霖 × 康・卡布蕾拉" sub="臺中市纖維工藝博物館｜全國唯一以「纖維」為主題的公立博物館" tag="跨國策展" color={C.lime} start={14} />
    </AbsoluteFill>
  );
};

const Finale: React.FC = () => {
  const f = useCurrentFrame();
  const tops = [140, 0, 300, 70, 380, 200, 20, 460];
  return (
    <AbsoluteFill style={{ background: C.paper, overflow: 'hidden' }}>
      {tops.map((top, i) => {
        const t = p(f, 2 + i * 2.2, 26 + i * 2.2, OUT);
        const drift = Math.sin(f * 0.04 + i) * 14;
        return <div key={i} style={{ position: 'absolute', left: 1230 + i * 82, top: top + drift, width: 118, height: H, background: PAL[(i * 1 + 0) % PAL.length], opacity: .78, mixBlendMode: 'multiply', transform: `translateY(${(1 - t) * 1100}px)` }} />;
      })}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: .55 }}>
        {[0, 1, 2].map((i) => (
          <path key={i} d={wavePath(1320 + i * 200, 40, 0.005, f * 0.06 + i * 2)} stroke="#fff" strokeWidth={2} fill="none"
            pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p(f, 20 + i * 4, 60 + i * 4, INOUT)} />
        ))}
      </svg>
      <div style={{ position: 'absolute', left: 150, top: 150, color: C.ink }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
          <Fade start={8} y={12} style={{ fontFamily: SANS, fontWeight: 500, fontSize: 38, letterSpacing: '0.35em' }}>2026</Fade>
          <Seal start={46} size={78} />
        </div>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 58, marginTop: 10, letterSpacing: '0.06em' }}><Chars text="臺中纖維藝術雙年展" start={12} stagger={1.4} /></div>
        <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 164, lineHeight: 1.12, marginTop: 6, letterSpacing: '0.03em' }}><Chars text="非線性敘事" start={20} stagger={3} dur={20} /></div>
        <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 52, color: C.purple, letterSpacing: '0.3em' }}><Chars text="理解島嶼的途徑" start={34} stagger={1.6} /></div>
        <div style={{ height: 4, width: 700 * p(f, 46, 72, INOUT), background: GRAD, margin: '40px 0 34px' }} />
        <Fade start={54} style={{ fontFamily: SANS, fontWeight: 500, fontSize: 48, letterSpacing: '0.06em', fontVariantNumeric: 'tabular-nums' }}>2026.10.31 — 2027.02.28</Fade>
        <Fade start={60} style={{ fontFamily: SANS, fontWeight: 400, fontSize: 38, letterSpacing: '0.2em', marginTop: 12 }}>臺中市纖維工藝博物館</Fade>
      </div>
      <Fade start={74} y={8} style={{ position: 'absolute', left: 150, bottom: 70, fontFamily: SANS, fontWeight: 400, fontSize: 21, letterSpacing: '0.12em', color: '#6b6573' }}>
        <div>主辦｜臺中市政府文化局　　策展人｜吳尚霖、康・卡布蕾拉</div><div style={{ marginTop: 6 }}>圖片提供｜臺中市纖維工藝博物館</div>
      </Fade>
    </AbsoluteFill>
  );
};

/* ───────────── HUD / finishing ───────────── */
const HUD: React.FC = () => {
  const f = useCurrentFrame();
  const vis = p(f, 96, 112) * (1 - p(f, 736, 748));
  if (vis <= 0) return null;
  const sec = Math.floor(f / 30), fr = f % 30;
  const beat = f >= 180 ? 1 - ((f - 180) % 15) / 15 : 0;
  return (
    <AbsoluteFill style={{ opacity: vis, mixBlendMode: 'difference', color: '#fff', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 60, top: 48, fontFamily: SANS, fontWeight: 500, fontSize: 16, letterSpacing: '0.38em' }}>TAICHUNG FIBER ARTS BIENNALE 2026</div>
      <div style={{ position: 'absolute', right: 60, top: 44, display: 'flex', alignItems: 'center', gap: 16, fontFamily: SANS, fontSize: 16, letterSpacing: '0.2em' }}>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>00:{String(sec).padStart(2, '0')}:{String(fr).padStart(2, '0')}</span>
        <div style={{ width: 12, height: 12, borderRadius: 6, background: '#fff', transform: `scale(${1 + beat * 0.7})`, opacity: .5 + beat * .5 }} />
      </div>
      <div style={{ position: 'absolute', left: 60, right: 60, bottom: 46, height: 2, background: 'rgba(255,255,255,.25)' }}>
        <div style={{ width: `${(f / 899) * 100}%`, height: 2, background: '#fff' }} />
      </div>
    </AbsoluteFill>
  );
};

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: .08, mixBlendMode: 'overlay', pointerEvents: 'none' }}>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 12} stitchTiles="stitch" /></filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
};

/* ───────────── font gate ───────────── */
const ALL_TEXT = '臺中纖維藝術雙年展首屆本屆主題非線性敘事理解島嶼的途徑位藝術家來自個國家灣菲律賓印尼泰韓日本以展開多元文化對話線，使過去、現在與未來片段彼此交織。策展人吳尚霖×康・卡布蕾拉市工博物館｜全唯一「」為公立洛基希甘《障礙時間II》彩虹材構築迷宮嬋生命之光影交思幸福質傳統技法當代創作然植回收布料手織染材料記憶結合裝置錄像聲音燈李瓊蝶石頭共振行表演開幕跨主辦政府局圖片提供—0123456789.ABCDEFGHIJKLMNOPQRSTUVWXYZ/ ';
const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const specs = [`500 60px "Noto Serif TC"`, `700 60px "Noto Serif TC"`, `900 60px "Noto Serif TC"`,
      `300 40px "Noto Sans TC"`, `400 40px "Noto Sans TC"`, `500 40px "Noto Sans TC"`, `700 40px "Noto Sans TC"`];
    Promise.all(specs.map((s) => document.fonts.load(s, ALL_TEXT)))
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

/* ───────────── timeline ───────────── */
const PHOTOS: { from: number; src: string; reveal: Reveal; accent: string; title: string; work?: string; sub: string; tag: string; dx?: number; dy?: number }[] = [
  { from: 180, src: '194123wub', reveal: 'slices', accent: C.pink, title: '洛基・卡希甘', work: '《障礙，時間 II》', sub: '以彩虹線材構築迷宮，探問多元認同', tag: '菲律賓', dx: -30 },
  { from: 240, src: '194144rdo', reveal: 'iris', accent: C.yellow, title: '美嬋', work: '《生命之光》', sub: '光影交織，反思美麗表象背後的無常', tag: '泰國', dy: -20 },
  { from: 300, src: '194223cxu', reveal: 'triptych', accent: C.sky, title: '傳統技法 × 當代創作', sub: '天然植物纖維・回收布料・手工織染', tag: '纖維 × 空間', dx: 30 },
  { from: 360, src: '194156xem', reveal: 'blinds', accent: C.lime, title: '材料的島嶼記憶', sub: '結合裝置、錄像、聲音與燈光，延伸至空間之中', tag: '裝置 × 聲音', dx: -24 },
  { from: 420, src: '194205deo', reveal: 'diagonal', accent: C.orange, title: '李瓊蝶', work: '《石頭：交織共振之聲》', sub: '開幕行為藝術表演｜聲音、身體與材料的共振', tag: '開幕表演', dy: 16 },
];

export const Promo: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Audio src={staticFile('music.wav')} />
      <Sequence from={0} durationInFrames={90}><Intro /></Sequence>
      <Sequence from={90} durationInFrames={104}><Theme /></Sequence>
      {PHOTOS.map((ph, i) => (
        <Sequence key={ph.src} from={ph.from} durationInFrames={i === PHOTOS.length - 1 ? 82 : 74}>
          <AbsoluteFill>
            <PhotoReveal src={img(ph.src)} reveal={ph.reveal} accent={ph.accent} dur={74} dx={ph.dx} dy={ph.dy} />
            <Caption idx={i + 1} total={6} title={ph.title} work={ph.work} sub={ph.sub} tag={ph.tag} color={ph.accent} exitAt={i === PHOTOS.length - 1 ? 9999 : 54} />
          </AbsoluteFill>
        </Sequence>
      ))}
      <Sequence from={480} durationInFrames={104}><Stats /></Sequence>
      <Sequence from={570} durationInFrames={104}><Curator /></Sequence>
      <Sequence from={660} durationInFrames={90}><Group /></Sequence>
      <Sequence from={750} durationInFrames={150}><Finale /></Sequence>
      <StripeCover start={73} />
      <StripeCover start={733} />
      <HUD />
      <Grain />
    </AbsoluteFill>
  );
};
