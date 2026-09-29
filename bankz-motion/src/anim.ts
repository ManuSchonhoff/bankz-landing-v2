import {Easing, interpolate} from 'remotion';

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const prog = (f: number, start: number, dur: number) => clamp01((f - start) / dur);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const eBack = Easing.out(Easing.back(1.4));
export const eBackSoft = Easing.out(Easing.back(1.1));
export const eInOut = Easing.inOut(Easing.cubic);
export const eOut = Easing.out(Easing.cubic);
export const eIn = Easing.in(Easing.cubic);

export type Fx = {opacity: number; blur: number; t: number; e: number};

// Entrada: de borroso a nitido con overshoot (blur 12-16 px a 0 en 6-8 f).
export const enter = (f: number, start: number, dur = 7, blur = 14): Fx => {
  const t = prog(f, start, dur);
  return {
    t,
    e: f < start ? 0 : eBack(t),
    blur: f < start ? blur : blur * (1 - eOut(t)),
    opacity: f < start ? 0 : interpolate(t, [0, 0.45], [0, 1], {extrapolateRight: 'clamp'}),
  };
};

// Salida: Easing.in(cubic) con blur creciente.
export const exit = (f: number, start: number, dur = 8, blur = 14): Fx => {
  const t = prog(f, start, dur);
  const e = eIn(t);
  return {t, e, blur: blur * e, opacity: 1 - e};
};

// Latido: sube y vuelve en `dur` frames.
export const pulse = (f: number, at: number, amp = 0.04, dur = 8) => {
  if (f < at || f > at + dur) return 1;
  return 1 + amp * Math.sin(Math.PI * prog(f, at, dur));
};

// Golpe de camara: salta a `from` y vuelve a 1 en `dur` frames.
export const punch = (f: number, at: number, from = 1.08, dur = 6) => {
  if (f < at || f >= at + dur) return 1;
  return 1 + (from - 1) * (1 - eOut(prog(f, at, dur)));
};

// Pista por keyframes con easing inOut entre claves.
export const track = (f: number, keys: [number, number][], ease: (t: number) => number = eInOut) => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f1, v1] = keys[i];
    if (f <= f1) {
      const [f0, v0] = keys[i - 1];
      if (f1 === f0) return v1;
      return lerp(v0, v1, ease((f - f0) / (f1 - f0)));
    }
  }
  return keys[keys.length - 1][1];
};

export const smooth = (f: number, a: number, b: number) => eInOut(prog(f, a, b - a));

export const blurCss = (b: number) => (b > 0.05 ? `blur(${b.toFixed(2)}px)` : undefined);
