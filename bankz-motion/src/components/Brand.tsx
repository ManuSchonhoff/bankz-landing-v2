import React from 'react';
import {Img, staticFile} from 'remotion';

// Archivos oficiales del kit (public/brand). Solo opacidad, posicion y escala uniforme:
// nunca rotate, filter, mix-blend-mode, clip-path ni stroke.
export const ISO_RATIO = 1; // viewBox 1288 x 1288
export const LOGO_H_RATIO = 1740 / 520;

export const Brand: React.FC<{
  kind: 'isotipo' | 'logo-h';
  variant: 'negro' | 'blanco';
  cx: number;
  cy: number;
  w: number;
  opacity: number;
}> = ({kind, variant, cx, cy, w, opacity}) => {
  if (opacity <= 0.002) return null;
  const h = kind === 'isotipo' ? w : w / LOGO_H_RATIO;
  return (
    <Img
      src={staticFile(`brand/${kind}-${variant}.svg`)}
      style={{position: 'absolute', left: cx - w / 2, top: cy - h / 2, width: w, height: h, opacity}}
    />
  );
};
