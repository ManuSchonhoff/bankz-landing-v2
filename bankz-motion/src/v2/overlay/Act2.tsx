import React from 'react';
import {interpolate} from 'remotion';
import {eInOut, eOut, lerp, prog, pulse} from '../../anim';
import {QMark, HOOK_TIP_ANGLE} from '../../components/Aro';
import {Brand, LOGO_H_RATIO} from '../../components/Brand';
import {Caret, Txt} from '../../components/Txt';
import {BASE_K, GLYPH, measure} from '../../text';
import {CENTER, doorRingPx} from '../camera';
import iso from '../iso-geometry.json';
import {Aspect, themeAt2} from '../t2';
import {geomFor2, qCaret2, qCount} from '../type2';

// Geometria del isotipo oficial (unidades del viewBox 1288, centro 1500,1500, radio 644).
const ISO_HALF = 644;
const BAR_W = 105.34; // ancho de los garrotes largos
const backOut = (t: number, c1 = 1.4) => 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);

export const isoGeom = (a: Aspect) => {
  const Rring = doorRingPx(a); // radio del anillo fino de la puerta en pantalla
  const Riso = Rring - 24; // los garrotes entran 24 px al cerrar la puerta
  const k = Riso / ISO_HALF;
  const w = BAR_W * k;
  const [cx, cy] = CENTER[a];
  return {Rring, Riso, k, w, cx, cy, D: 2 * Riso, dotR: iso.circleR * k};
};

// Logotipo horizontal del drop (B15-B16): centrado; el isotipo del archivo ocupa el alto completo.
export const dropLogo = (a: Aspect) => {
  const [cx, cy] = CENTER[a];
  const w = a === '16x9' ? 200 * LOGO_H_RATIO : 640;
  const h = w / LOGO_H_RATIO;
  return {cx, cy, w, h, isoCx: cx - w / 2 + h / 2};
};

// El "?" se agranda hasta que la parte alta del gancho toca el anillo de la puerta.
const Q_TOP = 644 + 54 - GLYPH.qDot.y; // unidades de fuente desde el centro del punto
const qBigSize = (a: Aspect) => (isoGeom(a).Rring * 1000) / Q_TOP;

const arcPath = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};

// Garrotes: el anillo desenrollado se parte en los 16 garrotes del isotipo oficial.
const Garrotes: React.FC<{f: number; a: Aspect; ink: string; W: number; H: number}> = ({f, a, ink, W, H}) => {
  const g = isoGeom(a);
  const Rc = g.Rring - g.w / 2;
  const els: React.ReactNode[] = [];
  const bars = iso.bars.map((b) => ({...b, rad: (b.angle * Math.PI) / 180}));
  // Fase A (f300-306): el gancho se retrae y en el mismo movimiento se dibuja el anillo grueso.
  if (f < 306) {
    const p = eInOut(prog(f, 300, 6));
    const Se = qBigSize(a);
    els.push(<QMark key="q" W={W} H={H} dotX={g.cx} dotY={g.cy} size={Se} color={ink} mode="toTip" p={p} />);
    if (p > 0) els.push(<path key="ring" d={arcPath(g.cx, g.cy, Rc, HOOK_TIP_ANGLE, HOOK_TIP_ANGLE + 359.99 * p)} fill="none" stroke={ink} strokeWidth={g.w} />);
    return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{els}</svg>;
  }
  // Fase B (f306-312): cada tramo del anillo se contrae hacia su garrote, que crece hacia el centro.
  const q = eInOut(prog(f, 306, 6));
  const off = f < 312 ? 24 : 24 * (1 - backOut(prog(f, 312, 6))); // Fase C: la puerta se cierra
  const rReveal = lerp(g.Rring, 0, q);
  const minHalf = ((g.w / 2 / Rc) * 180) / Math.PI;
  if (f < 312) {
    bars.forEach((b, i) => {
      const half = lerp(360 / 32, minHalf, q);
      els.push(<path key={`a${i}`} d={arcPath(g.cx, g.cy, Rc, b.angle - half, b.angle + half)} fill="none" stroke={ink} strokeWidth={g.w} />);
    });
  }
  const dotR = lerp((GLYPH.qDot.r / 1000) * qBigSize(a), g.dotR, q);
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs>
        <mask id="reveal" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
          <rect x={0} y={0} width={W} height={H} fill="white" />
          <circle cx={g.cx} cy={g.cy} r={Math.max(0, rReveal)} fill="black" />
        </mask>
      </defs>
      {els}
      <g mask={f < 312 ? 'url(#reveal)' : undefined}>
        {bars.map((b, i) => (
          <path
            key={i}
            d={b.d}
            fill={ink}
            transform={`translate(${g.cx + off * Math.cos(b.rad)} ${g.cy + off * Math.sin(b.rad)}) scale(${g.k}) translate(-1500 -1500)`}
          />
        ))}
      </g>
      <circle cx={g.cx} cy={g.cy} r={dotR} fill={ink} />
    </svg>
  );
};

// Acto 2 (B9-B16) y la transicion al punto de B17.
export const Act2: React.FC<{f: number; a: Aspect; W: number; H: number}> = ({f, a, W, H}) => {
  if (f < 204 || f >= 400) return null;
  const {ink, brand} = themeAt2(f);
  const {G} = geomFor2(a);
  const {S, lines} = G.q;
  const els: React.ReactNode[] = [];

  // Tecleo de la pregunta frente a la puerta.
  if (f < 312) {
    const n = qCount(f);
    const dim = f < 288 ? 1 : interpolate(f, [288, 294], [1, 0.3], {extrapolateRight: 'clamp'});
    lines.forEach((l, i) => {
      const count = Math.max(0, Math.min(l.text.length, n - l.start));
      const shown = l.text.slice(0, i === lines.length - 1 ? Math.min(count, l.text.length - 1) : count);
      els.push(
        <Txt key={`l${i}`} x={l.left} y={l.y} size={S} color={ink} align="left" opacity={dim}>
          {shown}
        </Txt>,
      );
    });
    const c = qCaret2(f, a);
    if (c.visible) els.push(<Caret key="caret" x={c.x} y={c.y} size={S} color={ink} scaleY={c.scaleY} />);
  }

  // B13: el "?" viaja al centro de la puerta y crece hasta tocar el anillo.
  if (f >= 288 && f < 300) {
    const last = lines[lines.length - 1];
    const qLeft = last.left + measure(last.text.slice(0, -1), S, 500);
    const dotN = {x: qLeft + (GLYPH.qDot.x / 1000) * S, y: last.y + BASE_K * S - (GLYPH.qDot.y / 1000) * S};
    const m = eOut(prog(f, 288, 10));
    const g = isoGeom(a);
    const Se = S * lerp(1, qBigSize(a) / S, m);
    const dx = lerp(dotN.x, g.cx, m);
    const dy = lerp(dotN.y, g.cy, m);
    const blur = 12 * (1 - prog(f, 288, 6));
    if (f < 290) {
      els.push(
        <Txt key="q" x={dx - (GLYPH.qDot.x / 1000) * Se} y={dy + (GLYPH.qDot.y / 1000) * Se - BASE_K * Se} size={Se} color={ink} align="left" blur={blur}>
          ?
        </Txt>,
      );
    } else {
      els.push(<QMark key="q" W={W} H={H} dotX={dx} dotY={dy} size={Se} color={ink} mode="full" blur={blur} />);
    }
  }
  // B13½-B14: desenrollado, garrotes y cierre de la puerta.
  if (f >= 300 && f < 321) els.push(<Garrotes key="garrotes" f={f} a={a} ink={ink} W={W} H={H} />);

  // B14 + 6 f: cruce de 3 f al isotipo oficial (misma silueta, mismo centro, mismo tamano).
  const g = isoGeom(a);
  const L = dropLogo(a);
  if (f >= 318) {
    let cx = g.cx;
    let cy = g.cy;
    let size = g.D;
    let op = prog(f, 318, 3);
    // B15: la camara se retira y el isotipo se acomoda en su lugar dentro del logotipo horizontal.
    const m = eInOut(prog(f, 336, 18));
    cx = lerp(cx, L.isoCx, m);
    size = lerp(size, L.h, m);
    if (f >= 360 && f < 384) op = 0;
    // B17: el texto se apaga y el isotipo se contrae al centro hasta volver a ser el punto de 4 px.
    if (f >= 384) {
      const t = eInOut(prog(f, 388, 10));
      cx = lerp(L.isoCx, g.cx, t);
      cy = lerp(L.cy, g.cy, t);
      size = lerp(L.h, 4, t);
      op = 1;
    }
    if (f < 398) els.push(<Brand key="iso" kind="isotipo" variant={brand} cx={cx} cy={cy} w={size} opacity={op} />);
  }
  // Logotipo horizontal: el texto "Bankz" entra por opacidad en 6 f (B15) y late en B16.
  if (f >= 354 && f < 390) {
    const op = f < 384 ? prog(f, 354, 6) : 1 - prog(f, 384, 6);
    const s = pulse(f, 360, 0.03, 10);
    els.push(<Brand key="logo" kind="logo-h" variant={brand} cx={L.cx} cy={L.cy} w={L.w * s} opacity={op} />);
  }
  return <>{els}</>;
};
