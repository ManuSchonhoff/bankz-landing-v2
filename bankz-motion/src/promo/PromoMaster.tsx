import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {eBack, eIn, eInOut, enter, exit, lerp, prog, punch, pulse, smooth, track} from '../anim';
import {Brand, LOGO_H_RATIO} from '../components/Brand';
import {blinkOn, Caret, Txt} from '../components/Txt';
import {useFonts} from '../fonts';
import {BASE_K, fit, GLYPH, measure} from '../text';
import {charFrame, typedCount} from '../timing';
import {NEGRO} from '../theme';
import {Aspect, EVP, themeP} from './model';

// Copy (letra por letra, el que paso Manuel) + placa de marca con contacto canonico.
const T1 = 'Tu Caja de Seguridad';
const DESDE = 'desde';
const PRICE = '$54.000';
const POR_MES = 'por mes';
const DNI = 'Alta solo con tu DNI';
const CONTACT = 'bankz.ar · WhatsApp 291 448-5665';
const CIERRE = 'Estás seguro.';

const DNI_T = {appear: 290, t0: 294, cps: 12, end: 389, gone: 425};

// Puesta por formato. 9:16: zona segura x 72-936 / y 260-1500, centro en (540, 880); lineas de hasta 760 px.
const LP = {
  '16x9': {
    W: 1920, H: 1080, cx: 960, cy: 540, maxW: 1680 * 0.88,
    title: {lines: [T1], size: 128},
    price: {size: 300, small: 64, desdeY: 318, priceY: 540, mesY: 768},
    dni: {lines: [{text: DNI, start: 0}], size: 112},
    placa: {logoCy: 420, logoW: 180 * LOGO_H_RATIO, cierreY: 700, cierreS: 72, contactY: 900, contactS: 40},
  },
  '9x16': {
    W: 1080, H: 1920, cx: 540, cy: 880, maxW: 864 * 0.88,
    title: {lines: ['Tu Caja', 'de Seguridad'], size: 116},
    price: {size: 220, small: 56, desdeY: 735, priceY: 880, mesY: 1032},
    dni: {lines: [{text: 'Alta solo con', start: 0}, {text: 'tu DNI', start: 14}], size: 116},
    placa: {logoCy: 760, logoW: 640, cierreY: 1000, cierreS: 64, contactY: 1110, contactS: 36},
  },
} as const;
type LPx = (typeof LP)[Aspect];

const linesGeom = (L: LPx, lines: readonly string[], size: number) => {
  const S = Math.min(...lines.map((t) => fit(t, size, 500, L.maxW)));
  const lh = S * 1.1;
  return {S, ys: lines.map((_, i) => L.cy + (i - (lines.length - 1) / 2) * lh)};
};

const dniGeom = (L: LPx) => {
  const {S, ys} = linesGeom(L, L.dni.lines.map((l) => l.text), L.dni.size);
  return {S, lines: L.dni.lines.map((l, i) => ({...l, y: ys[i], left: L.cx - measure(l.text, S, 500) / 2}))};
};
const dniCaret = (f: number, L: LPx) => {
  const g = dniGeom(L);
  const n = typedCount(f, DNI_T.t0, DNI_T.cps, DNI.length);
  if (n === 0) {
    const t = eInOut(prog(f, DNI_T.appear, 4));
    return {x: lerp(L.cx, g.lines[0].left, t), y: lerp(L.cy, g.lines[0].y, t), S: g.S};
  }
  let line = g.lines[0];
  for (const l of g.lines) if (l.start <= n && l.start > 0) line = l;
  const count = n - line.start;
  return {x: line.left + (count > 0 ? measure(line.text.slice(0, count), g.S, 500) + 0.04 * g.S : 0), y: line.y, S: g.S};
};

// Camara 2D de la capa de texto.
const SCALE: [number, number][] = [
  [0, 1],
  [24, 1.02],
  [36, 1],
  [128, 1.05],
  [144, 1],
  [240, 1.03],
  [288, 1],
  [390, 1.04],
  [456, 1],
  [696, 1.015],
  [714, 1],
];
const PUNCH: [number, number, number][] = [
  [144, 1.12, 8],
  [168, 1.05, 6],
  [288, 1.08, 6],
  [390, 1.06, 6],
  [458, 1.04, 6],
];
const cam2 = (f: number, L: LPx) => {
  let s = track(f, SCALE);
  for (const [a, b, d] of PUNCH) s *= punch(f, a, b, d);
  const env = smooth(f, 24, 60) * (1 - smooth(f, 680, 708));
  let tx = L.W * 0.004 * Math.sin((2 * Math.PI * f) / 380) * env;
  const ty = L.H * 0.003 * Math.sin((2 * Math.PI * f) / 290 + 1.3) * env;
  const w = smooth(f, 290, 300) * (1 - smooth(f, 392, 412));
  if (w > 0) tx -= (dniCaret(f - 4, L).x - L.cx) * 0.25 * w;
  return {s, tx, ty};
};

const Overlay: React.FC<{aspect: Aspect}> = ({aspect}) => {
  const L = LP[aspect];
  const f = useCurrentFrame();
  const {ink, brand} = themeP(f);
  const els: React.ReactNode[] = [];
  const origin = `${L.cx}px ${L.cy}px`;

  // B1: el punto de 4 px que late; en B2 se abre en la frase.
  if (f < 30) {
    const s = (1 + 0.6 * Math.sin(Math.PI * prog(f, 0, 6))) * (1 - prog(f, 24, 4));
    if (s > 0.01) els.push(<div key="dot" style={{position: 'absolute', left: L.cx - 2 * s, top: L.cy - 2 * s, width: 4 * s, height: 4 * s, borderRadius: '50%', background: ink}} />);
  }

  // B2: el punto se abre en "Tu Caja de Seguridad", centrado. En B6½ la camara lo atraviesa hacia el precio.
  if (f >= 26 && f < 144) {
    const fly = eIn(prog(f, 128, 16));
    const g = linesGeom(L, L.title.lines, L.title.size);
    const inner = L.title.lines.map((line, i) => {
      const e = enter(f, 26 + i * 4, 9, 16);
      return (
        <Txt key={`t${i}`} x={L.cx} y={g.ys[i]} size={g.S} color={ink} opacity={e.opacity} blur={e.blur} scale={1.08 - 0.08 * e.e}>
          {line}
        </Txt>
      );
    });
    els.push(
      <div key="title" style={{position: 'absolute', inset: 0, opacity: 1 - fly, filter: fly > 0.01 ? `blur(${(16 * fly).toFixed(2)}px)` : undefined, transform: `scale(${1 + 1.6 * fly})`, transformOrigin: origin}}>
        {inner}
      </div>,
    );
  }

  // B7: inversion. "desde" / "$54.000" / "por mes".
  if (f >= EVP.drop && f < EVP.back) {
    const P = L.price;
    const S = fit(PRICE, P.size, 500, L.maxW);
    const w = measure(PRICE, S, 500);
    const block = pulse(f, 192, 0.03, 10) * pulse(f, 240, 0.03, 10);
    const inner: React.ReactNode[] = [];
    const ed = enter(f, 144, 7, 12);
    inner.push(
      <Txt key="desde" x={L.cx} y={P.desdeY} size={P.small} weight={400} color={ink} opacity={ed.opacity * 0.6} blur={ed.blur} dy={-14 * (1 - ed.e)}>
        {DESDE}
      </Txt>,
    );
    // Cada caracter del precio se clava con 2 f de diferencia.
    let x = L.cx - w / 2;
    PRICE.split('').forEach((ch, i) => {
      const e = enter(f, 146 + i * 2, 7, 14);
      inner.push(
        <Txt key={`p${i}`} x={x} y={P.priceY} size={S} color={ink} align="left" opacity={e.opacity} blur={e.blur} dy={40 * (1 - e.e)}>
          {ch}
        </Txt>,
      );
      x += measure(PRICE.slice(0, i + 1), S, 500) - measure(PRICE.slice(0, i), S, 500);
    });
    if (f >= 168) {
      const e = enter(f, 168, 7, 12);
      inner.push(
        <Txt key="mes" x={L.cx} y={P.mesY} size={P.small} weight={400} color={ink} opacity={e.opacity} blur={e.blur} dy={14 * (1 - e.e)}>
          {POR_MES}
        </Txt>,
      );
    }
    els.push(
      <div key="price" style={{position: 'absolute', inset: 0, transform: `scale(${block})`, transformOrigin: origin}}>
        {inner}
      </div>,
    );
  }

  // B13: vuelta al negro y se teclea "Alta solo con tu DNI". En B17 "DNI" late.
  if (f >= EVP.back && f < EVP.placa + 12) {
    const g = dniGeom(L);
    const n = typedCount(f, DNI_T.t0, DNI_T.cps, DNI.length);
    const ex = exit(f, EVP.placa, 10, 14);
    const s = pulse(f, 390, 0.08, 10);
    const parts: React.ReactNode[] = [];
    g.lines.forEach((l, i) => {
      const count = Math.max(0, Math.min(l.text.length, n - l.start));
      const last = i === g.lines.length - 1;
      const head = last ? l.text.slice(0, l.text.length - 3) : l.text;
      parts.push(
        <Txt key={`d${i}`} x={l.left} y={l.y} size={g.S} color={ink} align="left">
          {head.slice(0, count)}
        </Txt>,
      );
      if (last && count > head.length) {
        parts.push(
          <Txt key="dni" x={l.left + measure(head, g.S, 500)} y={l.y} size={g.S} color={ink} align="left" scale={s}>
            {l.text.slice(head.length, count)}
          </Txt>,
        );
      }
    });
    els.push(
      <div key="dnib" style={{position: 'absolute', inset: 0, opacity: ex.opacity, filter: ex.blur > 0.05 ? `blur(${ex.blur}px)` : undefined, transform: `translateY(${-30 * ex.e}px)`}}>
        {parts}
      </div>,
    );
    const visible = f >= DNI_T.appear && f < DNI_T.gone && (f < DNI_T.end || blinkOn(f, DNI_T.end));
    const c = dniCaret(f, L);
    if (visible) els.push(<Caret key="caret" x={c.x} y={c.y} size={c.S} color={ink} scaleY={eBack(prog(f, DNI_T.appear, 6))} />);
  }

  // B19: placa. Logotipo oficial por opacidad (6 f), "Estás seguro." y contacto.
  const Pl = L.placa;
  const fadeAll = 1 - eInOut(prog(f, EVP.fade, 12));
  const S2 = Pl.cierreS;
  const cierreLeft = L.cx - measure(CIERRE, S2, 500) / 2;
  if (f >= EVP.placa) {
    els.push(<Brand key="logo" kind="logo-h" variant={brand} cx={L.cx} cy={Pl.logoCy} w={Pl.logoW} opacity={prog(f, 458, 6) * fadeAll} />);
    const e = enter(f, 480, 8, 14);
    els.push(
      <Txt key="cierre" x={cierreLeft} y={Pl.cierreY} size={S2} color={ink} align="left" opacity={e.opacity * fadeAll} blur={e.blur} dy={14 * (1 - e.e)}>
        {f < EVP.fade ? CIERRE : CIERRE.slice(0, -1)}
      </Txt>,
    );
    const c = enter(f, 504, 8, 12);
    els.push(
      <Txt key="contact" x={L.cx} y={Pl.contactY} size={fit(CONTACT, Pl.contactS, 400, L.maxW)} weight={400} color={ink} opacity={c.opacity * 0.6 * fadeAll} blur={c.blur}>
        {CONTACT}
      </Txt>,
    );
  }
  // B30: todo se apaga salvo el punto final, que viaja al centro y vuelve a ser el punto de 4 px (loop).
  if (f >= EVP.fade) {
    const k = eInOut(prog(f, EVP.fade, 18));
    const px = cierreLeft + measure(CIERRE.slice(0, -1), S2, 500) + (GLYPH.periodDot.x / 1000) * S2;
    const py = Pl.cierreY + BASE_K * S2 - (GLYPH.periodDot.y / 1000) * S2;
    const r = lerp((GLYPH.periodDot.r / 1000) * S2, 2, k);
    els.push(<div key="end" style={{position: 'absolute', left: lerp(px, L.cx, k) - r, top: lerp(py, L.cy, k) - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: ink}} />);
  }

  const c = cam2(f, L);
  return (
    <AbsoluteFill style={{transform: `translate(${c.tx.toFixed(3)}px, ${c.ty.toFixed(3)}px) scale(${c.s.toFixed(5)})`, transformOrigin: origin}}>
      {els}
    </AbsoluteFill>
  );
};

// ---------- Audio ----------
type Cue = {at: number; file: string; volume: number};
const CUES: Cue[] = (() => {
  const c: Cue[] = [
    {at: 26, file: 'tick', volume: 0.7},
    {at: 128, file: 'whoosh', volume: 0.6},
    {at: 144, file: 'thud', volume: 0.45},
    {at: 144, file: 'clack', volume: 0.45},
    {at: 168, file: 'hit', volume: 0.4},
    {at: 288, file: 'thud', volume: 0.5},
    {at: 390, file: 'hit', volume: 0.4},
    {at: 458, file: 'hit', volume: 0.4},
    {at: 480, file: 'tick', volume: 0.6},
    {at: 504, file: 'tick', volume: 0.5},
  ];
  for (let i = 0; i < DNI.length; i++) {
    if (DNI[i] === ' ') continue;
    const at = charFrame(i, DNI_T.t0, DNI_T.cps);
    c.push(i === DNI.length - 1 ? {at, file: 'key-low', volume: 0.9} : {at, file: i % 2 ? 'key-2' : 'key-1', volume: 0.6});
  }
  return c;
})();

export const PromoAudio: React.FC = () => (
  <>
    <Audio src={staticFile('audio/beat-150-promo.wav')} volume={0.72} />
    {CUES.map((q, i) => (
      <Sequence key={i} from={q.at} durationInFrames={Math.min(90, 720 - q.at, q.at < 120 ? 120 - q.at : 90)} layout="none">
        <Audio src={staticFile(`audio/${q.file}.wav`)} volume={q.volume} />
      </Sequence>
    ))}
  </>
);

export const PromoMaster: React.FC<{aspect: Aspect}> = ({aspect}) => {
  const ready = useFonts();
  const f = useCurrentFrame();
  if (!ready) return <AbsoluteFill style={{background: NEGRO}} />;
  return (
    <AbsoluteFill style={{background: themeP(f).bg, overflow: 'hidden'}}>
      <Overlay aspect={aspect} />
      <PromoAudio />
    </AbsoluteFill>
  );
};
