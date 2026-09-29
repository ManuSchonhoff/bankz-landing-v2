import React from 'react';
import {blurCss} from '../anim';
import {GLYPH} from '../text';

// Trazo de linea central del "?" de Alexandria 500 (unidades de fuente, eje y hacia arriba).
// Mismo alto y peso visual que el glifo; el cambio glifo <-> trazo ocurre dentro de un blur.
const HOOK = 'M73.6 492 C75 590 140 644 229.6 644 C320 644 378.4 600 378.4 518 C378.4 470 360 445 330 415 C290 378 215 340 215 262 L215 229';
const HOOK_W = 108;

// Angulo (pantalla, grados) del extremo del gancho visto desde el punto.
export const HOOK_TIP_ANGLE = (Math.atan2(-(492 - GLYPH.qDot.y), 73.6 - GLYPH.qDot.x) * 180) / Math.PI;

type QProps = {
  W: number;
  H: number;
  dotX: number;
  dotY: number;
  size: number; // cuerpo tipografico efectivo
  color: string;
  mode: 'full' | 'toTip' | 'toDot';
  p?: number; // avance de la retraccion 0-1
  dotR?: number; // radio del punto en px (por defecto el del glifo)
  blur?: number;
  opacity?: number;
  showHook?: boolean;
};

export const QMark: React.FC<QProps> = ({W, H, dotX, dotY, size, color, mode, p = 0, dotR, blur = 0, opacity = 1, showHook = true}) => {
  const k = size / 1000;
  const offset = mode === 'toTip' ? p : mode === 'toDot' ? -p : 0;
  const r = dotR ?? GLYPH.qDot.r * k;
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: blurCss(blur), opacity}}>
      {showHook && p < 0.999 ? (
        <path
          d={HOOK}
          transform={`translate(${dotX} ${dotY}) scale(${k} ${-k}) translate(${-GLYPH.qDot.x} ${-GLYPH.qDot.y})`}
          fill="none"
          stroke={color}
          strokeWidth={HOOK_W}
          strokeLinecap="butt"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={offset}
        />
      ) : null}
      <circle cx={dotX} cy={dotY} r={r} fill={color} />
    </svg>
  );
};

// El Aro: 12 segmentos de arco (paso 30 grados: 24 de trazo y 6 de gap) y un punto central.
type AroProps = {
  W: number;
  H: number;
  cx: number;
  cy: number;
  r: number;
  stroke: number;
  dotR: number;
  color: string;
  drawn?: number; // 0-1, cuanto del anillo esta dibujado desde startAngle
  startAngle?: number;
  opacity?: number;
  blur?: number;
};

const SEG = 24;
const rad = (a: number) => (a * Math.PI) / 180;

const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const x0 = cx + r * Math.cos(rad(a0));
  const y0 = cy + r * Math.sin(rad(a0));
  const x1 = cx + r * Math.cos(rad(a1));
  const y1 = cy + r * Math.sin(rad(a1));
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};

export const Aro: React.FC<AroProps> = ({W, H, cx, cy, r, stroke, dotR, color, drawn = 1, startAngle = HOOK_TIP_ANGLE, opacity = 1, blur = 0}) => {
  if (opacity <= 0) return null;
  const end = startAngle + 360 * drawn;
  const paths: string[] = [];
  for (let i = 0; i < 12; i++) {
    let s = -90 + 30 * i - SEG / 2;
    let e = s + SEG;
    while (s < startAngle) {
      s += 360;
      e += 360;
    }
    const e2 = Math.min(e, end);
    if (e2 - s > 0.05) paths.push(arc(cx, cy, r, s, e2));
  }
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity, filter: blurCss(blur)}}>
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="butt" />
      ))}
      <circle cx={cx} cy={cy} r={dotR} fill={color} />
    </svg>
  );
};
