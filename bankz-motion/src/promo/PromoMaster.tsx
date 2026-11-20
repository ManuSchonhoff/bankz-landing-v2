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
import {Wall3D} from './Wall3D';

// Copy (letra por letra, el que paso Manuel) + placa de marca con contacto canonico.
const T1 = ['Tu Caja', 'de Seguridad'];
const DESDE = 'desde';
const PRICE = '$54.000';
const POR_MES = 'por mes';
const DNI = 'Alta solo con tu DNI';
const CONTACT = 'bankz.ar · WhatsApp 291 448-5665';
const CIERRE = 'Estás seguro.';

const DNI_T = {appear: 290, t0: 294, cps: 12, end: 389, gone: 425};
const MAXW = 1680 * 0.88;

const dniGeom = () => {
  const S = fit(DNI, 112, 500, MAXW);
  const left = 960 - measure(DNI, S, 500) / 2;
  return {S, left, y: 540};
};
const dniCaretX = (f: number) => {
  const g = dniGeom();
  const n = typedCount(f, DNI_T.t0, DNI_T.cps, DNI.length);
  if (n === 0) return lerp(960, g.left, eInOut(prog(f, DNI_T.appear, 4)));
  return g.left + measure(DNI.slice(0, n), g.S, 500) + 0.04 * g.S;
};

// Camara 2D de la capa de texto.
const SCALE: [number, number][] = [
  [0, 1],
  [24, 1.02],
  [48, 1],
  [96, 1],
  [128, 1.03],
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
const cam2 = (f: number) => {
  let s = track(f, SCALE);
  for (const [a, b, d] of PUNCH) s *= punch(f, a, b, d);
  const env = smooth(f, 24, 60) * (1 - smooth(f, 680, 708));
  let tx = 1920 * 0.004 * Math.sin((2 * Math.PI * f) / 380) * env;
  const ty = 1080 * 0.003 * Math.sin((2 * Math.PI * f) / 290 + 1.3) * env;
  const w = smooth(f, 290, 300) * (1 - smooth(f, 392, 412));
  if (w > 0) tx -= (dniCaretX(f - 4) - 960) * 0.25 * w;
  return {s, tx, ty};
};

const Overlay: React.FC = () => {
  const f = useCurrentFrame();
  const {ink, brand} = themeP(f);
  const els: React.ReactNode[] = [];

  // B1: el punto de 4 px (es la cerradura de tu caja; en B2 la toma el 3D).
  if (f < 30) {
    const s = (1 + 0.6 * Math.sin(Math.PI * prog(f, 0, 6))) * (1 - prog(f, 24, 4));
    if (s > 0.01) els.push(<div key="dot" style={{position: 'absolute', left: 960 - 2 * s, top: 540 - 2 * s, width: 4 * s, height: 4 * s, borderRadius: '50%', background: ink}} />);
  }

  // B5: "Tu Caja de Seguridad". En B6½ la camara se mete en la caja y el texto pasa por los costados.
  if (f >= 96 && f < 144) {
    const fly = eIn(prog(f, 128, 16));
    T1.forEach((line, i) => {
      const e = enter(f, 96 + i * 6, 8, 14);
      els.push(
        <Txt key={`t${i}`} x={120} y={430 + i * 136} size={128} color={ink} align="left" opacity={e.opacity * (1 - fly)} blur={Math.max(e.blur, 16 * fly)} dy={16 * (1 - e.e)} scale={1 + 1.6 * fly}>
          {line}
        </Txt>,
      );
    });
  }

  // B7: inversion. "desde" / "$54.000" / "por mes".
  if (f >= EVP.drop && f < EVP.back) {
    const S = fit(PRICE, 300, 500, MAXW);
    const w = measure(PRICE, S, 500);
    const block = pulse(f, 192, 0.03, 10) * pulse(f, 240, 0.03, 10);
    const inner: React.ReactNode[] = [];
    const ed = enter(f, 144, 7, 12);
    inner.push(
      <Txt key="desde" x={960} y={318} size={64} weight={400} color={ink} opacity={ed.opacity * 0.6} blur={ed.blur} dy={-14 * (1 - ed.e)}>
        {DESDE}
      </Txt>,
    );
    // Cada caracter del precio se clava con 2 f de diferencia.
    let x = 960 - w / 2;
    PRICE.split('').forEach((ch, i) => {
      const e = enter(f, 146 + i * 2, 7, 14);
      inner.push(
        <Txt key={`p${i}`} x={x} y={540} size={S} color={ink} align="left" opacity={e.opacity} blur={e.blur} dy={40 * (1 - e.e)}>
          {ch}
        </Txt>,
      );
      x += measure(PRICE.slice(0, i + 1), S, 500) - measure(PRICE.slice(0, i), S, 500);
    });
    if (f >= 168) {
      const e = enter(f, 168, 7, 12);
      inner.push(
        <Txt key="mes" x={960} y={768} size={64} weight={400} color={ink} opacity={e.opacity} blur={e.blur} dy={14 * (1 - e.e)}>
          {POR_MES}
        </Txt>,
      );
    }
    els.push(
      <div key="price" style={{position: 'absolute', inset: 0, transform: `scale(${block})`, transformOrigin: '960px 540px'}}>
        {inner}
      </div>,
    );
  }

  // B13: vuelta al negro y se teclea "Alta solo con tu DNI". En B17 "DNI" late.
  if (f >= EVP.back && f < EVP.placa + 12) {
    const g = dniGeom();
    const n = typedCount(f, DNI_T.t0, DNI_T.cps, DNI.length);
    const ex = exit(f, EVP.placa, 10, 14);
    const typed = DNI.slice(0, Math.min(n, DNI.length - 3));
    const dniTyped = n > DNI.length - 3 ? DNI.slice(DNI.length - 3, n) : '';
    const dniLeft = g.left + measure(DNI.slice(0, DNI.length - 3), g.S, 500);
    const s = pulse(f, 390, 0.08, 10);
    els.push(
      <div key="dni" style={{position: 'absolute', inset: 0, opacity: ex.opacity, filter: ex.blur > 0.05 ? `blur(${ex.blur}px)` : undefined, transform: `translateY(${-30 * ex.e}px)`}}>
        <Txt x={g.left} y={g.y} size={g.S} color={ink} align="left">
          {typed}
        </Txt>
        <Txt x={dniLeft} y={g.y} size={g.S} color={ink} align="left" scale={s}>
          {dniTyped}
        </Txt>
      </div>,
    );
    const visible = f >= DNI_T.appear && f < DNI_T.gone && (f < DNI_T.end || blinkOn(f, DNI_T.end));
    if (visible) els.push(<Caret key="caret" x={dniCaretX(f)} y={g.y} size={g.S} color={ink} scaleY={eBack(prog(f, DNI_T.appear, 6))} />);
  }

  // B19: placa. Logotipo oficial por opacidad (6 f), "Estás seguro." y contacto.
  const fadeAll = 1 - eInOut(prog(f, EVP.fade, 12));
  const S2 = 72;
  const cierreLeft = 960 - measure(CIERRE, S2, 500) / 2;
  if (f >= EVP.placa) {
    const logoW = 180 * LOGO_H_RATIO;
    els.push(<Brand key="logo" kind="logo-h" variant={brand} cx={960} cy={420} w={logoW} opacity={prog(f, 458, 6) * fadeAll} />);
    const e = enter(f, 480, 8, 14);
    els.push(
      <Txt key="cierre" x={cierreLeft} y={700} size={S2} color={ink} align="left" opacity={e.opacity * fadeAll} blur={e.blur} dy={14 * (1 - e.e)}>
        {f < EVP.fade ? CIERRE : CIERRE.slice(0, -1)}
      </Txt>,
    );
    const c = enter(f, 504, 8, 12);
    els.push(
      <Txt key="contact" x={960} y={900} size={40} weight={400} color={ink} opacity={c.opacity * 0.6 * fadeAll} blur={c.blur}>
        {CONTACT}
      </Txt>,
    );
  }
  // B30: todo se apaga salvo el punto final, que viaja al centro y vuelve a ser el punto de 4 px (loop).
  if (f >= EVP.fade) {
    const k = eInOut(prog(f, EVP.fade, 18));
    const px = cierreLeft + measure(CIERRE.slice(0, -1), S2, 500) + (GLYPH.periodDot.x / 1000) * S2;
    const py = 700 + BASE_K * S2 - (GLYPH.periodDot.y / 1000) * S2;
    const r = lerp((GLYPH.periodDot.r / 1000) * S2, 2, k);
    els.push(<div key="end" style={{position: 'absolute', left: lerp(px, 960, k) - r, top: lerp(py, 540, k) - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: ink}} />);
  }

  const c = cam2(f);
  return (
    <AbsoluteFill style={{transform: `translate(${c.tx.toFixed(3)}px, ${c.ty.toFixed(3)}px) scale(${c.s.toFixed(5)})`, transformOrigin: '960px 540px'}}>
      {els}
    </AbsoluteFill>
  );
};

// ---------- Audio ----------
type Cue = {at: number; file: string; volume: number};
const CUES: Cue[] = (() => {
  const c: Cue[] = [
    {at: 28, file: 'tick', volume: 0.6},
    {at: 96, file: 'tick', volume: 0.7},
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
      {f < EVP.drop ? <Wall3D aspect={aspect} /> : null}
      <Overlay />
      <PromoAudio />
    </AbsoluteFill>
  );
};
