import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {punch, smooth, track} from './anim';
import {Geom, questionCaret, waCaret} from './geom';
import {Layout} from './layout';
import {Cut, toLong, WA12} from './timing';

const SCALE: [number, number][] = [
  [0, 1],
  [48, 1.02],
  [96, 0.96],
  [120, 1],
  [192, 1.03],
  [216, 1.05],
  [239, 1.1],
  [240, 1], // drop
  [312, 1],
  [336, 1.02],
  [360, 1],
  [408, 1.04],
  [431, 0.98],
  [432, 1], // inversion a negro
  [468, 1],
  [480, 0.97],
  [504, 0.93],
  [528, 0.95],
  [552, 0.97],
  [576, 0.97],
  [600, 1],
  [624, 1],
  [648, 1.03],
  [696, 1.03],
  [720, 1.04],
  [768, 1.04],
  [792, 1.05],
  [816, 1],
  [864, 1.03],
  [878, 1],
  [936, 1.015],
  [954, 1],
];

// Golpes: [frame, escala inicial, duracion]
const PUNCHES: [number, number, number][] = [
  [192, 1.08, 6],
  [240, 1.12, 8],
  [288, 1.06, 6],
  [432, 1.08, 6],
  [444, 1.05, 6],
  [456, 1.05, 6],
  [468, 1.05, 6],
  [480, 1.06, 6],
  [600, 1.04, 6],
  [624, 1.05, 6],
  [840, 1.08, 6],
  [864, 1.05, 8],
];

// Paneos (fraccion del ancho / alto).
const PAN_X: Record<string, [number, number][]> = {
  '16x9': [
    [24, 0],
    [48, 0.004],
    [96, 0],
    [288, 0],
    [312, -0.01],
    [336, 0],
    [360, 0],
    [408, -0.012],
    [432, 0],
    [444, 0],
    [468, 0.01],
    [492, 0],
    [552, 0],
    [576, -0.01],
    [600, 0],
    [720, 0],
    [768, -0.008],
    [792, 0],
  ],
  '9x16': [
    [24, 0],
    [48, 0.006],
    [96, 0],
    [288, 0],
    [312, -0.01],
    [336, 0],
    [444, 0],
    [468, 0.012],
    [492, 0],
    [720, 0],
    [768, -0.01],
    [792, 0],
  ],
};
const PAN_Y: Record<string, [number, number][]> = {
  '16x9': [
    [552, 0],
    [576, 0.02],
    [600, 0],
  ],
  '9x16': [
    [360, 0],
    [408, -0.012],
    [432, 0],
    [552, 0],
    [576, 0.02],
    [600, 0],
  ],
};

export const cameraLong = (f: number, L: Layout, G: Geom) => {
  let s = track(f, SCALE);
  for (const [at, from, dur] of PUNCHES) s *= punch(f, at, from, dur);
  let tx = track(f, PAN_X[L.aspect]) * L.W;
  let ty = track(f, PAN_Y[L.aspect]) * L.H;
  // Deriva continua: nada queda quieto. Se anula al principio y al final para el loop.
  const env = smooth(f, 24, 60) * (1 - smooth(f, 915, 950));
  tx += L.W * 0.005 * Math.sin((2 * Math.PI * f) / 400) * env;
  ty += L.H * 0.004 * Math.sin((2 * Math.PI * f) / 300 + 1.3) * env;
  // La camara sigue al caret con 4 frames de retraso.
  const w1 = smooth(f, 96, 104) * (1 - smooth(f, 216, 232));
  if (w1 > 0) {
    const c = questionCaret(f - 4, L, G);
    tx -= (c.x - L.cx) * 0.3 * w1;
    ty -= (c.y - L.cy) * 0.3 * w1;
  }
  const w4 = smooth(f, 648, 656) * (1 - smooth(f, 712, 736));
  if (w4 > 0) {
    const c = waCaret(f - 4, G);
    tx -= (c.x - L.cx) * 0.25 * w4;
  }
  return {s, tx, ty};
};

// Corte de 12 s, B19-B24 (f432-575): CTA + WhatsApp + web + Instagram.
const SCALE_12: [number, number][] = [
  [432, 1],
  [456, 1.02],
  [504, 1.03],
  [528, 1.04],
  [552, 1.04],
  [576, 1.05],
];

const cameraCta12 = (f: number, L: Layout, G: Geom) => {
  const s = track(f, SCALE_12) * punch(f, 432, 1.08, 6);
  let tx = L.W * 0.005 * Math.sin((2 * Math.PI * f) / 400) + track(f, [[504, 0], [552, -0.008], [576, 0]]) * L.W;
  const ty = L.H * 0.004 * Math.sin((2 * Math.PI * f) / 300 + 1.3);
  const w = smooth(f, 444, 452) * (1 - smooth(f, 508, 532));
  if (w > 0) {
    const c = waCaret(f - 4, G, WA12);
    tx -= (c.x - L.cx) * 0.25 * w;
  }
  return {s, tx, ty};
};

export const cameraAt = (f: number, L: Layout, G: Geom, cut: Cut = '16') => {
  if (cut === '16' || f < 432) return cameraLong(f, L, G);
  if (f < 576) return cameraCta12(f, L, G);
  return cameraLong(toLong(f), L, G);
};

export const CameraLayer: React.FC<{L: Layout; G: Geom; cut?: Cut; children: React.ReactNode}> = ({L, G, cut = '16', children}) => {
  const f = useCurrentFrame();
  const {s, tx, ty} = cameraAt(f, L, G, cut);
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${tx.toFixed(3)}px, ${ty.toFixed(3)}px) scale(${s.toFixed(5)})`,
        transformOrigin: `${L.cx}px ${L.cy}px`,
        willChange: 'transform',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
