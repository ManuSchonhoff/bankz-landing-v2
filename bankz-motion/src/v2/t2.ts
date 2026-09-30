// v2: tiempos, tema y utilidades comunes. 150 BPM, 24 f por beat, 960 frames.
import {NEGRO, NIEVE} from '../theme';

export const beat = (n: number) => (n - 1) * 24;

export const EV = {
  musicCut: 192, // B9
  drop: 312, // B14, inversion a blanco
  toDark: 384, // B17, vuelta al negro
  placa: 888, // placa final (seccion 4)
} as const;

export type Aspect = '16x9' | '9x16';

export type Theme2 = {bg: string; ink: string; brand: 'negro' | 'blanco'};
export const themeAt2 = (f: number): Theme2 =>
  f >= EV.drop && f < EV.toDark ? {bg: NIEVE, ink: NEGRO, brand: 'negro'} : {bg: NEGRO, ink: NIEVE, brand: 'blanco'};

// Motion blur de camara (acumulacion de muestras en 3D): vuelos B3-B8 y frenada, B25, B29, B35.
export const BLUR_WINDOWS: [number, number][] = [
  [48, 200],
  [576, 596],
  [696, 716],
  [840, 858],
];
export const blurSamplesAt = (f: number) => (BLUR_WINDOWS.some(([a, b]) => f >= a && f <= b) ? 14 : 1);

// Interpolacion cubica monotona (Fritsch-Carlson): posiciones de camara suaves, sin rebotes no pedidos.
export const monotone = (keys: [number, number][]) => {
  const n = keys.length;
  const xs = keys.map((k) => k[0]);
  const ys = keys.map((k) => k[1]);
  const d: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  m.push(d[0]);
  for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2);
  m.push(d[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i];
    const t = (x - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
  };
};
