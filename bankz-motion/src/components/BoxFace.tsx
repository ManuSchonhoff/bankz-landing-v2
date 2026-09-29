import React from 'react';
import {blurCss} from '../anim';

// Cara frontal de una caja: contorno de 2 px, dos cerraduras y una placa.
// Nunca relleno, nunca abierta, nunca con contenido.
type Props = {
  x: number;
  y: number;
  w: number;
  h: number;
  px: number; // px por cm
  color: string;
  detail?: number; // opacidad de cerraduras y placa
  opacity?: number;
  blur?: number;
  scale?: number;
};

export const BoxFace: React.FC<Props> = ({x, y, w, h, px, color, detail = 1, opacity = 1, blur = 0, scale = 1}) => {
  if (opacity <= 0.002) return null;
  const sw = 2;
  const lockR = 0.4 * px;
  const lockY = h * 0.55;
  const plateW = Math.min(2 * px, 0.34 * w);
  const plateH = 0.6 * px;
  const plateY = lockY - 1.4 * px - plateH / 2;
  return (
    <svg
      width={w + 4}
      height={h + 4}
      style={{
        position: 'absolute',
        left: x - 2,
        top: y - 2,
        overflow: 'visible',
        opacity,
        filter: blurCss(blur),
        transform: `scale(${scale})`,
        transformOrigin: '50% 100%',
      }}
    >
      <g transform="translate(2 2)" fill="none" stroke={color} strokeWidth={sw}>
        <rect x={sw / 2} y={sw / 2} width={Math.max(0, w - sw)} height={Math.max(0, h - sw)} rx={Math.min(3, 0.15 * px)} />
        {detail > 0.002 ? (
          <g opacity={detail}>
            <circle cx={w * 0.3} cy={lockY} r={lockR} />
            <circle cx={w * 0.7} cy={lockY} r={lockR} />
            <rect x={(w - plateW) / 2} y={plateY} width={plateW} height={plateH} rx={1} />
          </g>
        ) : null}
      </g>
    </svg>
  );
};

// Rectangulo de contorno generico (chips y su colapso en la cara de la BKZ 1).
export const Outline: React.FC<{x: number; y: number; w: number; h: number; color: string; radius: number; opacity?: number}> = ({x, y, w, h, color, radius, opacity = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      border: `2px solid ${color}`,
      borderRadius: radius,
      boxSizing: 'border-box',
      opacity,
    }}
  />
);
